// Checks levels, weeks, streaks and badges. Run in Sydney time so daylight saving is covered:
//   TZ=Australia/Sydney npx tsx tests/rewards.test.ts
import { levelFor, rewardChanges, rewardSummary, weekInfo, weekStart, type LogEntry } from '../app/src/lib/rewards'

let failures = 0
const eq = (what: string, got: unknown, want: unknown) => {
  if (JSON.stringify(got) !== JSON.stringify(want)) {
    failures++
    console.log(`FAIL ${what}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`)
  }
}

// ---- levels
eq('0 points', [levelFor(0).n, levelFor(0).name], [1, 'Joey'])
eq('99 points', levelFor(99).n, 1)
eq('100 points', [levelFor(100).n, levelFor(100).name], [2, 'Gecko'])
eq('progress half way through Gecko', levelFor(200).progress, 0.5)
eq('9999 points', levelFor(9999).name, 'Wedge-tailed eagle')
eq('10000 points', [levelFor(10000).n, levelFor(10000).name, levelFor(10000).next?.min], [12, 'Numbat', 13000])
eq('13000 points', levelFor(13000).name, 'Numbat legend 2')
eq('negative points', levelFor(-5).n, 1)

// ---- weeks start on Monday at local midnight, including across daylight saving (Sydney: 6 Oct 2024, 7 Apr 2024)
const local = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h).getTime()
eq('Wed 9 Oct 2024 -> Mon 7 Oct', new Date(weekStart(local(2024, 10, 9))).toDateString(), new Date(local(2024, 10, 7, 0)).toDateString())
eq('Sun 6 Oct 2024 (DST starts) -> Mon 30 Sep', new Date(weekStart(local(2024, 10, 6, 23))).toDateString(), 'Mon Sep 30 2024')
eq('Mon 8 Apr 2024 00:30 -> itself', new Date(weekStart(local(2024, 4, 8, 0) + 30 * 60000)).toDateString(), 'Mon Apr 08 2024')
eq('week start is midnight', new Date(weekStart(local(2024, 10, 9))).getHours(), 0)

// ---- streaks: goal 2. Weeks of 30 Sep, 7 Oct, 14 Oct met; 21 Oct missed; 28 Oct, 4 Nov met; this week (11 Nov) 1 so far
const at = (y: number, m: number, d: number, n: number, score = 70, itemId = 'y7-x'): LogEntry[] =>
  Array.from({ length: n }, (_, k) => ({ itemId, kind: 'practice' as const, score, finishedAt: local(y, m, d, 9 + k) }))
const log = [...at(2024, 10, 1, 2), ...at(2024, 10, 9, 3), ...at(2024, 10, 16, 2), ...at(2024, 10, 22, 1), ...at(2024, 10, 30, 2), ...at(2024, 11, 5, 2), ...at(2024, 11, 12, 1)]
const now = local(2024, 11, 13) // Wednesday
let w = weekInfo(log, 2, now)
eq('this week count', w.thisWeek, 1)
eq('not met yet', w.met, false)
eq('streak kept while this week is still open', w.streak, 2)
eq('best streak', w.bestStreak, 3)
eq('weeks met', w.weeksMet, 5)
eq('days left on a Wednesday', w.daysLeft, 5)
eq('recent weeks', w.recent.map((x) => x.count), [0, 2, 3, 2, 1, 2, 2, 1])
w = weekInfo([...log, ...at(2024, 11, 13, 1)], 2, now)
eq('met this week extends streak', [w.met, w.streak], [true, 3])
w = weekInfo(log, 2, local(2024, 11, 19)) // the week of 11 Nov ended unmet
eq('missed week breaks streak', w.streak, 0)
eq('days left on a Tuesday', w.daysLeft, 6)
eq('days left on a Sunday', weekInfo([], 5, local(2024, 11, 17)).daysLeft, 1)

// ---- badges
const none = rewardSummary({ points: 0, items: {}, log: [], goal: 5, now })
eq('no badges at start', none.earned, 0)
const items = {
  'y7-ind-notation': { best: 100, attempts: 2, mastered: true },
  'y7-ind-laws': { best: 85, attempts: 1, mastered: true },
  'test:y7-indices': { best: 100, attempts: 1, mastered: true },
}
const later: LogEntry[] = [
  { itemId: 'y7-ind-notation', kind: 'practice', score: 40, finishedAt: local(2024, 11, 11) },
  { itemId: 'y7-ind-notation', kind: 'practice', score: 100, finishedAt: local(2024, 11, 12) },
  { itemId: 'y7-ind-laws', kind: 'practice', score: 85, finishedAt: local(2024, 11, 12, 13) },
  { itemId: 'test:y7-indices', kind: 'test', score: 100, finishedAt: local(2024, 11, 13) },
]
const s = rewardSummary({ points: 350, items, log: later, goal: 4, now })
const earned = s.badges.filter((x) => x.earned).map((x) => x.id)
eq('earned badges', earned, ['first-set', 'skills-1', 'perfect-set', 'comeback', 'test-pass', 'test-perfect', 'goal-1'])
eq('skill builder progress', s.badges.find((x) => x.id === 'skills-5')?.have, 2)
eq('level', s.level.name, 'Bilby')
const before = rewardSummary({ points: 250, items: { 'y7-ind-notation': { best: 40, attempts: 1, mastered: false } }, log: later.slice(0, 1), goal: 4, now })
const ch = rewardChanges(before, s)
eq('level up', ch.levelUp?.name, 'Bilby')
eq('goal reached', ch.goalReached, true)
eq('new badges', ch.newBadges.map((x) => x.id), ['skills-1', 'perfect-set', 'comeback', 'test-pass', 'test-perfect', 'goal-1'])

if (failures) {
  console.log(`${failures} failures`)
  process.exit(1)
}
console.log('All rewards checks passed')
