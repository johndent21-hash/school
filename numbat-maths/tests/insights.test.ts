// Checks the teacher overview numbers against the demo class, recounting everything independently.
//   TZ=Australia/Sydney npx tsx tests/insights.test.ts
import { classInsights, masteriesFrom, ratingConcerns, weeklySeries, type ActivityRow } from '../app/src/lib/insights'
import { demoActivity, demoClassRatings, demoLessonsFor, demoParentOverview, demoRatingActions, demoReport, demoStudentDetail, DEMO_GOAL } from '../app/src/lib/demo'
import { isoDate, lessonDate, lessonWeek, ratingSummary } from '../app/src/lib/ratings'
import { findSkill, findTopic } from '../src/content/index'
import { weekStart } from '../app/src/lib/rewards'

let failures = 0
const ok = (what: string, cond: boolean, detail = '') => {
  if (!cond) {
    failures++
    console.log(`FAIL ${what} ${detail}`)
  }
}

const report = demoReport()
const act = demoActivity()
const now = Date.now()
const ins = classInsights(report.students, act.attempts, act.masteries, act.goal, now)
const names = (xs: { student: { name: string } }[]) => xs.map((x) => x.student.name)

// every demo item is a real skill or topic test, and scores are whole marks out of 10
for (const a of act.attempts) {
  const real = a.itemId.startsWith('test:') ? !!findTopic(a.itemId.slice(5)) : !!findSkill(a.itemId)
  ok(`real item ${a.itemId}`, real)
  ok(`score step ${a.itemId} ${a.score}`, a.score % (a.kind === 'test' ? 10 : 5) === 0 && a.score >= 0 && a.score <= 100)
  ok('nothing in the future', a.finishedAt <= now)
}

// masteries agree with the students' progress: one per mastered skill
const masteredSkills = report.students.reduce((n, s) => n + Object.entries(s.progress).filter(([id, p]) => !id.startsWith('test:') && p.mastered).length, 0)
ok('masteries match progress', act.masteries.length === masteredSkills, `${act.masteries.length} vs ${masteredSkills}`)
ok('masteriesFrom is order independent', masteriesFrom([...act.attempts].reverse()).length === act.masteries.length)

// weekly totals recounted by hand
const thisWeek = weekStart(now)
const recount = act.attempts.filter((a) => a.finishedAt >= thisWeek).length
ok('sets this week', ins.setsThisWeek === recount, `${ins.setsThisWeek} vs ${recount}`)
ok('last point is this week', ins.weekly[ins.weekly.length - 1].sets === recount)
ok('12 weeks', ins.weekly.length === 12)
ok('weeks are a week apart', ins.weekly.every((w, i) => i === 0 || Math.round((w.start - ins.weekly[i - 1].start) / 86_400_000) === 7))
const inWindow = act.attempts.filter((a) => a.finishedAt >= ins.weekly[0].start).length
ok('weekly sets add up', ins.weekly.reduce((n, w) => n + w.sets, 0) === inWindow)
ok('mastered never goes down', ins.weekly.every((w, i) => i === 0 || w.mastered >= ins.weekly[i - 1].mastered))
ok('mastered ends at the total', ins.weekly[ins.weekly.length - 1].mastered === masteredSkills)
const practised = new Set(act.attempts.filter((a) => a.finishedAt >= thisWeek).map((a) => a.studentId)).size
ok('practised this week', ins.practisedThisWeek === practised)
ok('not practised + practised = class', ins.notPractised.length + ins.practisedThisWeek === report.students.length)

// the example students who should stand out do
const never = ins.notPractised.filter((x) => x.neverLoggedIn).map((x) => x.student.name).sort()
ok('never logged in', JSON.stringify(never) === JSON.stringify(['Kai T', 'Ruby C']), JSON.stringify(never))
for (const quiet of ['Oliver B', 'Henry J', 'Jayden A']) ok(`${quiet} has not practised`, names(ins.notPractised).includes(quiet))
for (const s of ['Zara K', 'Leo G']) ok(`${s} flagged as needing help`, names(ins.needsHelp).includes(s), JSON.stringify(ins.needsHelp.map((x) => [x.student.name, x.reason])))
ok('a declining student is flagged', names(ins.needsHelp).some((n) => n === 'Jack W' || n === 'Tom H'), JSON.stringify(ins.needsHelp.map((x) => [x.student.name, x.reason])))
ok('strong students are not flagged', !names(ins.needsHelp).some((n) => ['Ava T', 'Mia S', 'Chloe H', 'Grace F'].includes(n)))
ok('hardest skills sorted and under 80%', ins.hardest.every((h, i) => h.avgBest < 80 && (i === 0 || h.avgBest >= ins.hardest[i - 1].avgBest)))
ok('hardest skills have names', ins.hardest.every((h) => h.title !== h.itemId && h.sub.startsWith('Year 7')))

// the "scores dropping" rule: 85% sets then 55% sets
{
  const st = { id: 's1', name: 'Test S', hasPin: true, lastActive: now, points: 0, progress: {} }
  const rows = [85, 85, 90, 80, 55, 60, 55, 50].map((score, k) => ({ studentId: 's1', itemId: 'y7-int-addsub', kind: 'practice' as const, score, finishedAt: now - (8 - k) * 3_600_000 }))
  const x = classInsights([st], rows, [], 4, now)
  ok('dropping scores flagged', x.needsHelp.length === 1 && /dropping: from 85% to 55%/.test(x.needsHelp[0].reason), JSON.stringify(x.needsHelp.map((n) => n.reason)))
  const steady = classInsights([st], rows.map((r) => ({ ...r, score: 75 })), [], 4, now)
  ok('steady scores not flagged', steady.needsHelp.length === 0)
}

// lesson ratings: counts, dates and the "below expectations" rule
ok('rating summary', JSON.stringify(ratingSummary([4, 3, 2, 1, 0, null, 3])) === JSON.stringify({ rated: 5, ok: 3, below: 2, absent: 1 }))
ok('lesson date', lessonDate('2026-10-30') === 'Fri 30 Oct', lessonDate('2026-10-30'))
ok('week of a Sunday is the Monday before', lessonWeek('2026-11-01') === '2026-10-26', lessonWeek('2026-11-01'))
ok('week of a Monday is itself', lessonWeek('2026-10-26') === '2026-10-26')
ok('week across a month', lessonWeek('2026-10-01') === '2026-09-28', lessonWeek('2026-10-01'))
{
  const ls = ['2026-10-20', '2026-10-21', '2026-10-23', '2026-10-27'].map((date, i) => ({ id: `l${i}`, date }))
  const r = (studentId: string, vals: (number | null)[]) => vals.flatMap((v, i) => (v === null ? [] : [{ lessonId: `l${i}`, studentId, value: v }]))
  const flags = ratingConcerns(
    [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }],
    [...ls].reverse(), // order of the list doesn't matter, dates do
    [...r('a', [4, 2, 1, 3]), ...r('b', [1, 1, 3, 3]), ...r('c', [3, 2, 0, 2]), ...r('d', [2, null, null, null])],
  )
  ok('two of the last three below', flags.has('a') && /2 of their last 3/.test(flags.get('a')!), JSON.stringify([...flags]))
  ok('older lows ignored', !flags.has('b'))
  ok('absence skipped', flags.has('c') && /2 of their last 3/.test(flags.get('c')!), JSON.stringify([...flags]))
  ok('one rating is not enough', !flags.has('d'))
}
{
  const cr = demoClassRatings()
  const today = isoDate(new Date())
  ok('demo lessons not in the future', cr.lessons.every((l) => l.date <= today))
  ok('demo lessons in date order', cr.lessons.every((l, i) => i === 0 || l.date >= cr.lessons[i - 1].date))
  ok('demo ratings 0 to 4', cr.ratings.every((x) => [0, 1, 2, 3, 4].includes(x.value)))
  ok('demo ratings belong to real lessons and students', cr.ratings.every((x) => cr.lessons.some((l) => l.id === x.lessonId) && report.students.some((st) => st.id === x.studentId)))
  const avg = (id: string) => {
    const v = demoLessonsFor(id).map((l) => l.value).filter((x): x is number => x !== null && x > 0)
    return v.reduce((a, b) => a + b, 0) / v.length
  }
  ok('strong student rated higher than struggling one', avg('demo-1') > avg('demo-3') + 0.8, `${avg('demo-1')} vs ${avg('demo-3')}`)
  // an edit on the sheet shows in that child's parent view
  const last = cr.lessons[cr.lessons.length - 1]
  demoRatingActions.setRating(last.id, 'demo-1', 1)
  ok('teacher edit reaches the parent view', demoParentOverview('demo-1').lessons.find((l) => l.id === last.id)?.value === 1)
  ok('the parent view only has that child', demoParentOverview('demo-1').lessons.length === cr.lessons.length)
  demoRatingActions.setRating(last.id, 'demo-1', null)
}

// a student's own series from their detail matches the class rows for them
const d = demoStudentDetail('demo-1')
if (d.ok) {
  const mine: ActivityRow[] = d.attempts.map((a) => ({ ...a, studentId: 'demo-1' }))
  const series = weeklySeries(mine, masteriesFrom(mine), now)
  const fromClass = act.attempts.filter((a) => a.studentId === 'demo-1' && a.finishedAt >= series[0].start).length
  ok('student series adds up', series.reduce((n, w) => n + w.sets, 0) === fromClass)
  ok('student points', d.student.points > 0)
} else ok('demo student found', false)

console.log(
  `class of ${ins.total}: ${ins.practisedThisWeek} practised this week, ${ins.metGoal} met the goal of ${DEMO_GOAL}, ${ins.setsThisWeek} sets; ` +
    `needs help: ${ins.needsHelp.map((x) => `${x.student.name} (${x.reason})`).join('; ')}; hardest: ${ins.hardest.map((h) => `${h.title} ${h.avgBest}%`).join(', ')}`,
)
console.log('weekly sets', ins.weekly.map((w) => w.sets).join(' '), '| mastered', ins.weekly.map((w) => w.mastered).join(' '))
if (failures) {
  console.log(`${failures} failures`)
  process.exit(1)
}
console.log('All insight checks passed')
