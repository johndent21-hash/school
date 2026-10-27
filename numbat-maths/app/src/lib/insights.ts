// What a teacher needs at a glance: who practised this week, who may need help, the skills the
// class finds hardest, and week-by-week totals for the progress-over-time charts.
// Pure functions over the class report and activity, shared by the live site and the demo class.
import { findSkill } from '@/content'
import { nextWeek, prevWeek, weekStart } from './rewards'

export interface InsightItem {
  best: number
  attempts: number
  mastered: boolean
  updatedAt: number
}

export interface InsightStudent {
  id: string
  name: string
  hasPin: boolean
  lastActive: number | null
  points: number
  progress: Record<string, InsightItem>
}

export interface ActivityRow {
  studentId: string
  itemId: string
  kind: 'practice' | 'test'
  score: number
  finishedAt: number
}

/** The first time a student scored 80% or more on a skill's practice set. */
export interface Mastery {
  studentId: string
  itemId: string
  t: number
}

export interface WeekPoint {
  start: number
  sets: number
  students: number
  /** skills mastered so far, counted at the end of the week */
  mastered: number
}

export const CHART_WEEKS = 12
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null)

/** First mastery time for each student and skill, from attempts in any order. */
export function masteriesFrom(rows: ActivityRow[]): Mastery[] {
  const first = new Map<string, Mastery>()
  for (const r of rows) {
    if (r.kind !== 'practice' || r.score < 80) continue
    const key = `${r.studentId}|${r.itemId}`
    const m = first.get(key)
    if (!m || r.finishedAt < m.t) first.set(key, { studentId: r.studentId, itemId: r.itemId, t: r.finishedAt })
  }
  return [...first.values()]
}

/** Week-by-week totals for the last CHART_WEEKS weeks, oldest first. */
export function weeklySeries(rows: ActivityRow[], masteries: Mastery[], now: number, weeks = CHART_WEEKS): WeekPoint[] {
  const starts: number[] = []
  let w = weekStart(now)
  for (let k = 0; k < weeks; k++) {
    starts.unshift(w)
    w = prevWeek(w)
  }
  const times = masteries.map((m) => m.t).sort((a, b) => a - b)
  return starts.map((start) => {
    const end = nextWeek(start)
    const inWeek = rows.filter((r) => r.finishedAt >= start && r.finishedAt < end)
    let mastered = 0
    while (mastered < times.length && times[mastered] < end) mastered++
    return { start, sets: inWeek.length, students: new Set(inWeek.map((r) => r.studentId)).size, mastered }
  })
}

export interface NeedsHelp {
  student: InsightStudent
  reason: string
  recent: number
}

export interface HardSkill {
  itemId: string
  title: string
  sub: string
  tried: number
  mastered: number
  avgBest: number
}

export interface ClassInsights {
  total: number
  practisedThisWeek: number
  practisedLastWeek: number
  metGoal: number
  setsThisWeek: number
  setsLastWeek: number
  avgThisWeek: number | null
  avgLastWeek: number | null
  notPractised: { student: InsightStudent; neverLoggedIn: boolean }[]
  needsHelp: NeedsHelp[]
  hardest: HardSkill[]
  weekly: WeekPoint[]
}

export function classInsights(students: InsightStudent[], rows: ActivityRow[], masteries: Mastery[], goal: number, now: number): ClassInsights {
  const thisStart = weekStart(now)
  const lastStart = prevWeek(thisStart)
  const thisWeek = rows.filter((r) => r.finishedAt >= thisStart)
  const lastWeek = rows.filter((r) => r.finishedAt >= lastStart && r.finishedAt < thisStart)
  const countBy = (rs: ActivityRow[]) => {
    const m = new Map<string, number>()
    for (const r of rs) m.set(r.studentId, (m.get(r.studentId) ?? 0) + 1)
    return m
  }
  const thisCounts = countBy(thisWeek)
  const lastCounts = countBy(lastWeek)

  const notPractised = students
    .filter((s) => !thisCounts.has(s.id))
    .map((s) => ({ student: s, neverLoggedIn: !s.hasPin && !s.lastActive }))
    .sort((a, b) => (a.student.lastActive ?? 0) - (b.student.lastActive ?? 0))

  // May need help: low recent scores, or scores that have dropped
  const needsHelp: NeedsHelp[] = []
  for (const s of students) {
    const mine = rows.filter((r) => r.studentId === s.id).sort((a, b) => b.finishedAt - a.finishedAt)
    const last = mine.slice(0, 5).map((r) => r.score)
    const recent = avg(last)
    if (recent === null || last.length < 3) continue
    if (recent < 50) {
      needsHelp.push({ student: s, recent, reason: `Averaging ${Math.round(recent)}% over their last ${last.length} sets` })
      continue
    }
    if (mine.length >= 8) {
      const now4 = avg(mine.slice(0, 4).map((r) => r.score))!
      const before4 = avg(mine.slice(4, 8).map((r) => r.score))!
      if (before4 - now4 >= 15 && now4 < 70) needsHelp.push({ student: s, recent: now4, reason: `Scores dropping: from ${Math.round(before4)}% to ${Math.round(now4)}% on recent sets` })
    }
  }
  needsHelp.sort((a, b) => a.recent - b.recent)

  // Hardest skills: tried by enough students, lowest average best score
  const bySkill = new Map<string, number[]>()
  for (const s of students)
    for (const [id, p] of Object.entries(s.progress)) {
      if (id.startsWith('test:')) continue
      const xs = bySkill.get(id) ?? []
      xs.push(p.best)
      bySkill.set(id, xs)
    }
  const active = students.filter((s) => Object.keys(s.progress).length > 0).length
  const minTried = Math.max(3, Math.ceil(active * 0.2))
  const hardest: HardSkill[] = []
  for (const [id, bests] of bySkill) {
    if (bests.length < minTried) continue
    const a = avg(bests)!
    if (a >= 80) continue
    const found = findSkill(id)
    hardest.push({
      itemId: id,
      title: found?.skill.title ?? id,
      sub: found ? `Year ${found.topic.year} · ${found.topic.title}` : '',
      tried: bests.length,
      mastered: bests.filter((b) => b >= 80).length,
      avgBest: Math.round(a),
    })
  }
  hardest.sort((a, b) => a.avgBest - b.avgBest || b.tried - a.tried)

  const metGoal = [...thisCounts.values()].filter((n) => n >= goal).length
  return {
    total: students.length,
    practisedThisWeek: thisCounts.size,
    practisedLastWeek: lastCounts.size,
    metGoal,
    setsThisWeek: thisWeek.length,
    setsLastWeek: lastWeek.length,
    avgThisWeek: avg(thisWeek.map((r) => r.score)),
    avgLastWeek: avg(lastWeek.map((r) => r.score)),
    notPractised,
    needsHelp,
    hardest: hardest.slice(0, 5),
    weekly: weeklySeries(rows, masteries, now),
  }
}
