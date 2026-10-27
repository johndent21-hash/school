// The example class shown on the teacher pages in the stand-alone preview, where log-ins are off.
// Every student, result and task here is made up. The same seed gives the same class each time;
// dates are placed relative to today so the class always looks current.
import { findTopic } from '@/content'
import { nextWeek, pointsFor, prevWeek, weekStart } from './rewards'
import { masteriesFrom, type ActivityRow } from './insights'

export const DEMO_CLASS_ID = 'demo-class'
export const DEMO_GOAL = 4

const NAMES = [
  'Ava T', 'Liam N', 'Zara K', 'Noah P', 'Mia S', 'Oliver B', 'Isla M', 'Jack W', 'Chloe H', 'Ethan L', 'Ruby C', 'Lucas D',
  'Grace F', 'Leo G', 'Amelia R', 'Henry J', 'Matilda V', 'Arjun S', 'Mei L', 'Kai T', 'Sienna O', 'Tom H', 'Priya N', 'Jayden A',
]

// The class worked through these Year 7 topics, three weeks each, over the last 12 weeks
const PLAN = ['y7-integers', 'y7-whole-numbers', 'y7-fractions', 'y7-algebra']

type Kind = 'strong' | 'steady' | 'struggling' | 'declining' | 'quiet' | 'never'
// one profile per student, in name order
const PROFILES: Kind[] = [
  'strong', 'steady', 'struggling', 'steady', 'strong', 'quiet', 'steady', 'declining', 'strong', 'steady', 'never', 'steady',
  'strong', 'struggling', 'steady', 'quiet', 'strong', 'steady', 'strong', 'never', 'steady', 'declining', 'steady', 'quiet',
]

function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export interface DemoStudent {
  id: string
  name: string
  hasPin: boolean
  locked: boolean
  points: number
  lastActive: number | null
  progress: Record<string, { best: number; last: number; attempts: number; mastered: boolean; updatedAt: number }>
}

interface DemoData {
  now: number
  students: DemoStudent[]
  rows: (ActivityRow & { correct: number; total: number })[]
  tasks: { id: string; title: string; items: string[]; dueDate: number | null; createdAt: number }[]
}

let cache: DemoData | null = null

function build(now: number): DemoData {
  const r = rng(20251027)
  const thisWeek = weekStart(now)
  const weeks: number[] = []
  let w = thisWeek
  for (let k = 0; k < 12; k++) {
    weeks.unshift(w)
    w = prevWeek(w)
  }
  const rows: DemoData['rows'] = []
  const students: DemoStudent[] = NAMES.map((name, i) => {
    const kind = PROFILES[i]
    const id = `demo-${i + 1}`
    const ability = { strong: 0.8, steady: 0.62, struggling: 0.36, declining: 0.7, quiet: 0.6, never: 0 }[kind] + (r() - 0.5) * 0.12
    const perWeek = { strong: 5, steady: 3.5, struggling: 3, declining: 4, quiet: 1.2, never: 0 }[kind] + (r() - 0.5)
    const tries: Record<string, number> = {}
    weeks.forEach((start, wi) => {
      if (kind === 'never') return
      if (kind === 'quiet' && wi >= 9) return // stopped practising three weeks ago
      const topic = findTopic(PLAN[Math.min(PLAN.length - 1, Math.floor(wi / 3))])!
      const isNow = start === thisWeek
      let n = Math.max(0, Math.round(perWeek + (r() - 0.5) * 2))
      // this week is still going: fewer sets so far, all before now
      const span = isNow ? Math.max(3_600_000, now - start - 3_600_000) : 6.5 * 86_400_000
      if (isNow) n = Math.round(n * Math.max(0.6, Math.min(1, (now - start) / (7 * 86_400_000))))
      for (let k = 0; k < n; k++) {
        const t = start + Math.floor(r() * span)
        // the last week of a topic block ends with the topic test for most students
        const test = wi % 3 === 2 && k === n - 1 && kind !== 'struggling'
        let itemId: string
        if (test) itemId = `test:${topic.id}`
        else if (r() < 0.15 && wi >= 3) {
          const old = findTopic(PLAN[Math.floor(r() * Math.min(PLAN.length, Math.floor(wi / 3)))])!
          itemId = old.skills[Math.floor(r() * old.skills.length)].id
        } else {
          // move through the topic's skills over its three weeks
          const reach = Math.min(topic.skills.length, 1 + Math.floor((((wi % 3) + k / Math.max(1, n)) / 3) * topic.skills.length + r()))
          itemId = topic.skills[Math.floor(r() * reach)].id
        }
        const done = tries[itemId] ?? 0
        tries[itemId] = done + 1
        let p = ability + (kind === 'struggling' ? 0.02 : 0.07) * Math.min(done, 4)
        if (kind === 'declining' && wi >= 10) p -= 0.35 // a slump over the last fortnight
        const raw = (p + (r() - 0.5) * 0.26) * 100
        const step = test ? 10 : 5
        const score = Math.max(0, Math.min(100, Math.round(raw / step) * step))
        const total = 10
        rows.push({ studentId: id, itemId, kind: test ? 'test' : 'practice', score, finishedAt: t, correct: (score / 100) * total, total })
      }
    })
    return { id, name, hasPin: kind !== 'never', locked: false, points: 0, lastActive: null, progress: {} }
  })

  rows.sort((a, b) => a.finishedAt - b.finishedAt)
  const byId = new Map(students.map((s) => [s.id, s]))
  for (const row of rows) {
    const s = byId.get(row.studentId)!
    s.points += pointsFor(row.correct, row.total)
    s.lastActive = row.finishedAt
    const p = s.progress[row.itemId]
    const best = Math.max(p?.best ?? 0, row.score)
    s.progress[row.itemId] = { best, last: row.score, attempts: (p?.attempts ?? 0) + 1, mastered: best >= 80, updatedAt: row.finishedAt }
  }
  rows.reverse() // newest first, as the server sends them

  const day = 86_400_000
  const tasks = [
    { id: 'demo-task-2', title: 'Algebra: like terms and substitution', items: ['y7-alg-sub', 'y7-alg-like', 'test:y7-algebra'], createdAt: prevWeek(thisWeek) + 2 * day, dueDate: nextWeek(thisWeek) + 4 * day },
    { id: 'demo-task-1', title: 'Fractions homework', items: ['y7-frac-addsub', 'y7-frac-muldiv'], createdAt: weeks[6] + day, dueDate: weeks[7] + 4 * day },
  ]
  return { now, students, rows, tasks }
}

function data(): DemoData {
  const now = Date.now()
  // rebuild after an hour so a page left open stays current
  if (!cache || now - cache.now > 3_600_000) cache = build(now)
  return cache
}

export function demoClasses() {
  const d = data()
  const thisWeek = weekStart(d.now)
  return [
    {
      id: DEMO_CLASS_ID,
      name: '7MAT2 (example)',
      year: 7,
      code: 'EXMPL7',
      createdAt: d.now - 90 * 86_400_000,
      studentCount: d.students.length,
      activeThisWeek: new Set(d.rows.filter((x) => x.finishedAt >= thisWeek).map((x) => x.studentId)).size,
    },
  ]
}

export function demoReport() {
  const d = data()
  return {
    ok: true as const,
    class: { id: DEMO_CLASS_ID, name: '7MAT2 (example)', year: 7, code: 'EXMPL7', weeklyGoal: DEMO_GOAL },
    students: d.students.map((s) => ({ ...s })).sort((a, b) => a.name.localeCompare(b.name)),
    assignments: d.tasks,
  }
}

export function demoActivity() {
  const d = data()
  const since = d.now - 16 * 7 * 86_400_000
  return {
    ok: true as const,
    goal: DEMO_GOAL,
    since,
    attempts: d.rows.filter((x) => x.finishedAt >= since).map(({ correct: _c, total: _t, ...rest }) => rest),
    masteries: masteriesFrom(d.rows),
  }
}

export function demoStudentDetail(id: string) {
  const d = data()
  const s = d.students.find((x) => x.id === id)
  if (!s) return { ok: false as const, message: 'Student not found.' }
  return {
    ok: true as const,
    student: { id: s.id, name: s.name, points: s.points, lastActive: s.lastActive, hasPin: s.hasPin },
    class: { id: DEMO_CLASS_ID, name: '7MAT2 (example)', year: 7, weeklyGoal: DEMO_GOAL },
    progress: s.progress,
    attempts: d.rows
      .filter((x) => x.studentId === id)
      .map((x) => ({ itemId: x.itemId, kind: x.kind, score: x.score, correct: x.correct, total: x.total, finishedAt: x.finishedAt })),
  }
}
