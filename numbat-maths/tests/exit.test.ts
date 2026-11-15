// Exit tickets: rebuilding the questions from the seed, the snapshot the server keeps, and the teacher's summaries.
import { ALL_GAME_SETS, GAME_BOOKS } from '../src/content/games'
import { exitItems, exitSnapshot, mostMissed, newExitTicket, summarise, ticketItems, type ExitTicket } from '../src/lib/game/exit'

let failures = 0
const fail = (msg: string) => {
  failures++
  if (failures < 20) console.log('FAIL', msg)
}
const eq = (a: unknown, b: unknown, msg: string) => JSON.stringify(a) !== JSON.stringify(b) && fail(`${msg}: ${JSON.stringify(a)} ≠ ${JSON.stringify(b)}`)

// every exercise, chapter and revision mix can be an exit ticket of 3, 5 or 8 questions; the snapshot passes the
// server's checks, and the questions rebuild exactly from the seed
const KIND_RE = /^[a-z0-9.-]{3,20}:[A-Za-z0-9]{1,30}$/
const GAME_RE = /^[a-z0-9]{2,8}-(\d{1,2}\.\d{2}|ch\d{1,2}|rev\d{1,2})$/
const ids = [...ALL_GAME_SETS.map((s) => s.id), ...GAME_BOOKS.flatMap((b) => [...b.chapters.map((c) => c.id), `${b.id}-rev${b.chapters.length}`])]
let made = 0
for (const id of ids)
  for (const count of [3, 5, 8])
    for (const calc of [false, true]) {
      const t = newExitTicket(id, count, calc, 1000 + made)
      made++
      if (!t) {
        fail(`${id}: no ticket`)
        continue
      }
      if (!GAME_RE.test(id)) fail(`${id}: the server would refuse this game id`)
      if (t.qs.length !== count || !/^\d{1,2}:[a-z0-9]{1,8}$/.test(t.check) || Number(t.check.split(':')[0]) !== count) fail(`${id}: bad snapshot`)
      for (const q of t.qs) {
        if (!KIND_RE.test(q.kind)) fail(`${id}: the server would refuse the kind ${q.kind}`)
        if (q.mistakes.length !== 4 || q.mistakes[q.correct] !== null) fail(`${id}: bad mistakes for ${q.kind}`)
      }
      const again = ticketItems({ gameId: id, seed: t.seed, count, calc, check: t.check })
      if (!again) fail(`${id}: the questions do not rebuild from the seed`)
      else eq(exitSnapshot(again), { qs: t.qs, check: t.check }, `${id}: rebuilt snapshot`)
      if (!calc && t.items.some((it) => it.calc)) fail(`${id}: a calculator question without calculators`)
    }
if (exitItems('ncm7-9.99', 1, 5, false) !== null) fail('an unknown game gives questions')
const t0 = newExitTicket('ncm7-1.05', 5, false, 42)!
if (ticketItems({ gameId: 'ncm7-1.05', seed: 42, count: 5, calc: false, check: '5:zzzz' }) !== null) fail('a changed ticket is rebuilt')
if (ticketItems({ gameId: 'ncm7-1.05', seed: 42, count: 5, calc: false, check: t0.check }) === null) fail('the ticket is not rebuilt')

// summaries, worked out by hand for a small ticket
const T: ExitTicket = {
  id: 'k1',
  gameId: 'ncm7-1.05',
  title: '',
  seed: 1,
  count: 2,
  calc: false,
  check: '',
  createdAt: 100,
  open: false,
  qs: [
    { kind: 'ncm7-1.05:minusNeg', correct: 2, mistakes: ['sign', 'added', null, null] },
    { kind: 'ncm7-1.05:sign', correct: 0, mistakes: [null, null, null, null] },
  ],
  answers: [
    { studentId: 'a', choices: [2, 0], correct: 2, finishedAt: 1 },
    { studentId: 'b', choices: [0, 1], correct: 0, finishedAt: 1 },
    { studentId: 'c', choices: [0, -1], correct: 0, finishedAt: 1 },
    { studentId: 'd', choices: [1, 0], correct: 1, finishedAt: 1 },
    { studentId: 'e', choices: [3, 0], correct: 1, finishedAt: 1 },
  ],
}
const s = summarise(T)
eq(s[0].counts, [2, 1, 1, 1], 'option counts')
eq([s[0].right, s[0].skipped, s[0].answered], [1, 0, 5], 'right, skipped, answered')
eq(s[0].wrong, [{ option: 0, label: 'sign', n: 2, who: ['b', 'c'] }, { option: 1, label: 'added', n: 1, who: ['d'] }, { option: 3, label: null, n: 1, who: ['e'] }], 'wrong options')
eq([s[1].right, s[1].skipped, s[1].wrong.length], [3, 1, 1], 'second question')
// a later ticket asks minusNeg again: 3 more answers, 1 wrong ("added")
const T2 = { ...T, id: 'k2', createdAt: 200, qs: [T.qs[0]], answers: [{ studentId: 'a', choices: [2], correct: 1, finishedAt: 2 }, { studentId: 'b', choices: [1], correct: 0, finishedAt: 2 }, { studentId: 'c', choices: [2], correct: 1, finishedAt: 2 }] }
const mm = mostMissed([T, T2])
// minusNeg: 8 answers, 5 wrong (sign 2, added 2, unlabelled 1); sign: 5 answers, 2 wrong (1 unlabelled, 1 left out)
eq(mm.map((m) => [m.kind, m.asked, m.wrong]), [['ncm7-1.05:minusNeg', 8, 5], ['ncm7-1.05:sign', 5, 2]], 'most missed order')
eq(mm[0].mistakes, [{ label: 'sign', n: 2 }, { label: 'added', n: 2 }, { label: null, n: 1 }], 'most missed mistakes')
eq(mm[0].example, { ticketId: 'k2', i: 0 }, 'most recent example')
eq(mostMissed([T2]).length, 0, 'too few answers are left out')

console.log(`exit tickets: ${made} tickets made and rebuilt from ${ids.length} games`)
console.log(failures ? `${failures} FAILURES` : 'all passed')
if (failures) process.exit(1)
