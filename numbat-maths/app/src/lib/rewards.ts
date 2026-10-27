// Levels, badges, the weekly goal and week streaks. Everything is worked out from a student's
// points, best results and history of finished sets, so nothing extra needs storing and a
// teacher sees the same numbers the student does. Weeks run Monday to Sunday in local time.
import { ALL_TOPICS } from '@/content'

export interface RewardItem {
  best: number
  attempts: number
  mastered: boolean
}

export interface LogEntry {
  itemId: string
  kind: 'practice' | 'test'
  score: number
  finishedAt: number
}

export const DEFAULT_GOAL = 5

/** Points use the same rule as the server: 10 per mark plus 20 for 80% or better. */
export function pointsFor(correct: number, total: number): number {
  const score = Math.round((correct / total) * 100)
  return Math.min(400, Math.round(correct * 10) + (score >= 80 ? 20 : 0))
}

/* ---------------- levels ---------------- */

export const LEVELS: { name: string; min: number }[] = [
  { name: 'Joey', min: 0 },
  { name: 'Gecko', min: 100 },
  { name: 'Bilby', min: 300 },
  { name: 'Echidna', min: 600 },
  { name: 'Quokka', min: 1000 },
  { name: 'Platypus', min: 1500 },
  { name: 'Wombat', min: 2200 },
  { name: 'Koala', min: 3000 },
  { name: 'Kookaburra', min: 4000 },
  { name: 'Kangaroo', min: 5500 },
  { name: 'Wedge-tailed eagle', min: 7500 },
  { name: 'Numbat', min: 10000 },
]
const LEGEND_STEP = 3000

export interface LevelInfo {
  n: number
  name: string
  min: number
  next: { n: number; name: string; min: number } | null
  /** 0 to 1: how far through this level */
  progress: number
  points: number
  /** points still needed for the next level */
  toNext: number
}

function levelAt(n: number): { name: string; min: number } {
  if (n <= LEVELS.length) return LEVELS[n - 1]
  const top = LEVELS[LEVELS.length - 1]
  return { name: `Numbat legend ${n - LEVELS.length + 1}`, min: top.min + (n - LEVELS.length) * LEGEND_STEP }
}

export function levelFor(points: number): LevelInfo {
  const p = Math.max(0, points)
  let n = 1
  while (levelAt(n + 1).min <= p) n++
  const cur = levelAt(n)
  const nx = levelAt(n + 1)
  return { n, name: cur.name, min: cur.min, next: { n: n + 1, name: nx.name, min: nx.min }, progress: (p - cur.min) / (nx.min - cur.min), points: p, toNext: nx.min - p }
}

/* ---------------- weeks ---------------- */

/** Midnight at the start of the Monday of the week containing ts (local time). */
export function weekStart(ts: number): number {
  const d = new Date(ts)
  const back = (d.getDay() + 6) % 7
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - back).getTime()
}

/** The Monday one week later (DST-safe). */
export function nextWeek(start: number): number {
  const d = new Date(start)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7).getTime()
}

export function prevWeek(start: number): number {
  const d = new Date(start)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7).getTime()
}

/** Sets finished in each week, keyed by the week's Monday. */
export function weekCounts(log: LogEntry[]): Map<number, number> {
  const m = new Map<number, number>()
  for (const e of log) {
    const w = weekStart(e.finishedAt)
    m.set(w, (m.get(w) ?? 0) + 1)
  }
  return m
}

export interface WeekInfo {
  goal: number
  thisWeek: number
  met: boolean
  daysLeft: number
  /** Weeks in a row the goal was met. This week counts once it is met, and doesn't break the streak before it ends. */
  streak: number
  bestStreak: number
  weeksMet: number
  /** The last 8 weeks, oldest first, this week last */
  recent: { start: number; count: number; met: boolean }[]
}

export function weekInfo(log: LogEntry[], goal: number, now: number): WeekInfo {
  const counts = weekCounts(log)
  const thisStart = weekStart(now)
  const thisWeek = counts.get(thisStart) ?? 0
  const met = thisWeek >= goal

  let streak = met ? 1 : 0
  for (let w = prevWeek(thisStart); (counts.get(w) ?? 0) >= goal; w = prevWeek(w)) streak++

  let bestStreak = 0
  let run = 0
  let weeksMet = 0
  if (counts.size) {
    for (let w = Math.min(...counts.keys()); w <= thisStart; w = nextWeek(w)) {
      if ((counts.get(w) ?? 0) >= goal) {
        run++
        weeksMet++
        bestStreak = Math.max(bestStreak, run)
      } else if (w !== thisStart) run = 0
    }
  }

  const recent: WeekInfo['recent'] = []
  let w = thisStart
  for (let k = 0; k < 8; k++) {
    const c = counts.get(w) ?? 0
    recent.unshift({ start: w, count: c, met: c >= goal })
    w = prevWeek(w)
  }
  // days left including today: 7 on a Monday, 1 on a Sunday
  const daysLeft = 7 - ((new Date(now).getDay() + 6) % 7)
  return { goal, thisWeek, met, daysLeft, streak, bestStreak, weeksMet, recent }
}

/* ---------------- badges ---------------- */

export type BadgeIcon = 'footprints' | 'star' | 'award' | 'medal' | 'crown' | 'gem' | 'book' | 'books' | 'clipboard' | 'trophy' | 'target' | 'flame' | 'compass' | 'sparkles' | 'trending'

export interface Badge {
  id: string
  name: string
  how: string
  icon: BadgeIcon
  earned: boolean
  have: number
  need: number
}

export interface RewardInput {
  points: number
  items: Record<string, RewardItem>
  log: LogEntry[]
  goal: number
  now: number
}

export interface RewardSummary {
  level: LevelInfo
  week: WeekInfo
  badges: Badge[]
  earned: number
}

export function rewardSummary(r: RewardInput): RewardSummary {
  const goal = Math.max(1, Math.round(r.goal || DEFAULT_GOAL))
  const week = weekInfo(r.log, goal, r.now)
  const skillIds = Object.keys(r.items).filter((id) => !id.startsWith('test:'))
  const testIds = Object.keys(r.items).filter((id) => id.startsWith('test:'))
  const mastered = skillIds.filter((id) => r.items[id].mastered).length
  const topicsDone = ALL_TOPICS.filter((t) => t.skills.every((s) => r.items[s.id]?.mastered)).length
  const topicsTried = ALL_TOPICS.filter((t) => t.skills.some((s) => r.items[s.id])).length
  const practiceSets = Math.max(
    r.log.filter((e) => e.kind === 'practice').length,
    skillIds.reduce((n, id) => n + r.items[id].attempts, 0),
  )
  const testsDone = Math.max(
    r.log.filter((e) => e.kind === 'test').length,
    testIds.reduce((n, id) => n + r.items[id].attempts, 0),
  )
  const bestTest = Math.max(0, ...testIds.map((id) => r.items[id].best))
  const perfectSet = r.log.some((e) => e.kind === 'practice' && e.score === 100) || skillIds.some((id) => r.items[id].best === 100)
  // came back to master a skill after a set below 50%
  const comeback = (() => {
    const low = new Set<string>()
    for (const e of [...r.log].sort((a, b) => a.finishedAt - b.finishedAt)) {
      if (e.kind !== 'practice') continue
      if (e.score < 50) low.add(e.itemId)
      else if (e.score >= 80 && low.has(e.itemId)) return true
    }
    return false
  })()

  const b = (id: string, name: string, how: string, icon: BadgeIcon, have: number, need: number): Badge => ({
    id,
    name,
    how,
    icon,
    have: Math.min(have, need),
    need,
    earned: have >= need,
  })

  const badges = [
    b('first-set', 'First steps', 'Finish your first practice set.', 'footprints', practiceSets, 1),
    b('skills-1', 'First skill', 'Master a skill: score 80% or more on a practice set.', 'star', mastered, 1),
    b('skills-5', 'Skill builder', 'Master 5 skills.', 'award', mastered, 5),
    b('skills-10', 'Skill collector', 'Master 10 skills.', 'medal', mastered, 10),
    b('skills-25', 'Skill star', 'Master 25 skills.', 'gem', mastered, 25),
    b('skills-50', 'Skill legend', 'Master 50 skills.', 'crown', mastered, 50),
    b('perfect-set', 'Flawless', 'Get every question right in a practice set.', 'sparkles', perfectSet ? 1 : 0, 1),
    b('comeback', 'Never give up', 'Master a skill after scoring under 50% on it.', 'trending', comeback ? 1 : 0, 1),
    b('explorer', 'Explorer', 'Practise skills from 5 different topics.', 'compass', topicsTried, 5),
    b('topic-1', 'Topic complete', 'Master every skill in a topic.', 'book', topicsDone, 1),
    b('topic-3', 'Topic champion', 'Master every skill in 3 topics.', 'books', topicsDone, 3),
    b('test-pass', 'Test passed', 'Score 80% or more on a topic test.', 'clipboard', bestTest >= 80 ? 1 : 0, 1),
    b('test-perfect', 'Perfect test', 'Score 100% on a topic test.', 'trophy', bestTest >= 100 ? 1 : 0, 1),
    b('tests-5', 'Test regular', 'Finish 5 topic tests.', 'clipboard', testsDone, 5),
    b('goal-1', 'Goal getter', `Reach your weekly goal of ${goal} sets.`, 'target', week.weeksMet, 1),
    b('goal-4', 'Four great weeks', 'Reach your weekly goal in 4 different weeks.', 'target', week.weeksMet, 4),
    b('streak-3', 'On a roll', 'Reach your weekly goal 3 weeks in a row.', 'flame', week.bestStreak, 3),
    b('streak-6', 'Unstoppable', 'Reach your weekly goal 6 weeks in a row.', 'flame', week.bestStreak, 6),
    b('streak-10', 'Term legend', 'Reach your weekly goal 10 weeks in a row.', 'flame', week.bestStreak, 10),
  ]
  return { level: levelFor(r.points), week, badges, earned: badges.filter((x) => x.earned).length }
}

/** What changed between two summaries: shown on the results screen after a set. */
export function rewardChanges(before: RewardSummary, after: RewardSummary): { levelUp: LevelInfo | null; newBadges: Badge[]; goalReached: boolean } {
  const had = new Set(before.badges.filter((x) => x.earned).map((x) => x.id))
  return {
    levelUp: after.level.n > before.level.n ? after.level : null,
    newBadges: after.badges.filter((x) => x.earned && !had.has(x.id)),
    goalReached: !before.week.met && after.week.met,
  }
}
