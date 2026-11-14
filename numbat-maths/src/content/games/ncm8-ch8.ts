// Class games for New Century Maths 8 (3rd edition, Cengage) Chapter 8, Probability: one set of quick questions for
// each exercise, 8.01 to 8.06.
//
// Sample spaces, probability, complements and expected frequencies revise Year 7 (NCM 7 Chapter 11), so those sets
// reuse its kinds (checked by that chapter's checks, see reuse.ts). New kinds: "or" events, complements from counts
// and percentages, Venn diagrams, two-way tables, probability problems (numbered balls, tickets, independent coin
// tosses) and relative frequency (tests/game-checks/ncm8-ch8.ts).
//
// Syllabus: NSW Mathematics K–10 (2022), Stage 4 Probability MA4-PRO-C-01 (8.01, 8.02, 8.05, 8.06). 8.03 (Venn
// diagrams) and 8.04 (two-way tables) are starred as extension in the textbook and are Stage 5 Path content
// (MA5-PRO-P-01), so they are marked as extension.
//
// Audit against the textbook, exercise by exercise (Nov 2026): added chance words and values that cannot be
// probabilities (8.01) and letters of a word (8.05), reused from NCM 7. Step 4 (Nov 2026): the "or" and raffle kinds
// moved down to NCM 7 11.02 (which needed them); 8.01 and 8.05 reuse them.
import type { GameChapter, GameQuestion, GameSet } from '@/lib/game/types'
import { gridTable } from '@/lib/maths/diagrams13'
import { D, chance, frac, gq, int, mk, num, pick, sample } from './helpers'
import { NCM7_CH11 } from './ncm7-ch11'
import { reuse } from './reuse'

const PRO = 'MA4-PRO-C-01'
const EXT = 'Marked as extension in the textbook: Venn diagrams and two-way tables are Stage 5 Path content (MA5-PRO-P-01).'
const b = (s: string) => `<b>${s}</b>`
const gcd = (a: number, c: number): number => (c === 0 ? a : gcd(c, a % c))
/** a probability in simplest form: 0, 1 or a fraction */
const F = (n: number, d: number) => {
  if (n === 0) return '0'
  if (n === d) return '1'
  const g = gcd(n, d)
  return frac(n / g, d / g)
}
/** "n/d = simplest" for the explanation */
const Fwhy = (n: number, d: number) => (gcd(n, d) > 1 && n !== 0 && n !== d ? `${n}/${d} = ${(n / gcd(n, d))}/${d / gcd(n, d)}` : n === 0 ? '0' : n === d ? '1' : `${n}/${d}`)
/** three wrong probabilities, none equal in value to the answer or to each other */
function probWrong(right: [number, number], likely: [number, number][]): string[] {
  const v = (x: [number, number]) => x[0] / x[1]
  const out: [number, number][] = []
  const spare: [number, number][] = [[right[0] + 1, right[1]], [right[0], right[1] + 1], [1, right[1]], [right[0], right[1] + 2], [Math.max(0, right[0] - 1), right[1]]]
  for (const x of [...likely, ...spare]) {
    if (x[1] <= 0 || x[0] < 0 || v(x) > 1) continue
    if (Math.abs(v(x) - v(right)) < 1e-9 || out.some((y) => Math.abs(v(y) - v(x)) < 1e-9)) continue
    out.push(x)
    if (out.length === 3) break
  }
  return out.map(([n, d]) => F(n, d))
}

const set = (exn: string, title: string, focus: string, outcomes: string[], makers: GameSet['makers'], extra: Partial<GameSet> = {}): GameSet => ({
  id: `ncm8-${exn}`,
  exercise: exn,
  ref: `NCM 8 Ex ${exn}`,
  title,
  focus,
  outcomes,
  makers,
  ...extra,
})
const R7 = (ex: string, t: string, as?: string) => reuse(NCM7_CH11, ex, t, as)
const COLOURS = ['red', 'green', 'yellow', 'blue']

// ================================================================== 8.01 Probability

const SET_801 = set('8.01', 'Probability', 'List sample spaces and find probabilities of equally likely outcomes, including "or" events.', [PRO], [
  R7('11.01', 'count'),
  R7('11.02', 'die'),
  R7('11.02', 'bag'),
  R7('11.02', 'spin'),
  R7('11.02', 'or'),
  R7('11.03', 'words'),
  R7('11.03', 'cannot'),
])

// ================================================================== 8.02 Complementary events

function m802not(): GameQuestion {
  const k = int(2, 3)
  const counts = Array.from({ length: k }, () => int(2, 9))
  const total = counts.reduce((t, x) => t + x, 0)
  const i = int(0, k - 1)
  const what = pick(['cards', 'books', 'tickets'])
  const desc = counts.map((c, j) => `${c} ${COLOURS[j]}`).join(k === 2 ? ' and ' : ', ').replace(/, ([^,]*)$/, ' and $1')
  const not = total - counts[i]
  return gq({
    t: 'not',
    prompt: `A pile has ${desc} ${what}. One is chosen at random. What is the probability that it is ${b(`not ${COLOURS[i]}`)}?`,
    correct: F(not, total),
    // the colour itself, not over the colour, out of the others
    wrong: probWrong([not, total], [[counts[i], total], [not, counts[i]], [1, k], [k - 1, k]]),
    why: `P(not ${COLOURS[i]}) = 1 − P(${COLOURS[i]}) = 1 − ${counts[i]}/${total} = ${Fwhy(not, total)}.`,
    meta: {},
  })
}

function m802pct(): GameQuestion {
  const p = pick([5, 10, 15, 20, 25, 30, 35, 40, 45, 55, 60, 65, 70, 75, 80, 85, 90])
  const ev = pick([
    ['rain tomorrow', 'not raining tomorrow'],
    ['the bus being late', 'the bus not being late'],
    ['winning a raffle prize', 'not winning a prize'],
  ])
  return gq({
    t: 'pct',
    prompt: `The chance of ${ev[0]} is ${b(`${p}%`)}. What is the chance of ${b(ev[1])}?`,
    correct: `${100 - p}%`,
    wrong: [`${p}%`, `${Math.abs(50 - p) || 45}%`, `${100 - p + 10 > 100 ? 100 - p - 10 : 100 - p + 10}%`, `${(100 - p) / 10}%`, '50%'],
    why: `The two chances add to 100%: 100% − ${p}% = ${100 - p}%.`,
    meta: {},
  })
}

const SET_802 = set('8.02', 'Complementary events', 'Name the complement of an event and use P(not A) = 1 − P(A).', [PRO], [
  R7('11.05', 'name'),
  R7('11.05', 'value'),
  mk('not', m802not),
  mk('pct', m802pct),
])

// ================================================================== 8.03 Venn diagrams (extension)

const VENN: [string, string, string][] = [
  ['Soccer', 'Tennis', 'play'],
  ['Cats', 'Dogs', 'own'],
  ['Maths', 'Art', 'like'],
  ['Piano', 'Guitar', 'play'],
]

function vennData() {
  const [A, B, verb] = pick(VENN)
  const v = [int(2, 12), int(1, 8), int(2, 12), int(1, 8)] // only A, both, only B, neither
  return { A, B, verb, v, total: v[0] + v[1] + v[2] + v[3], diagram: D.venn(A, B, String(v[0]), String(v[1]), String(v[2]), String(v[3])) }
}

function m803count(): GameQuestion {
  const { A, B, verb, v, total, diagram } = vennData()
  const asks: [string, number, number[]][] = [
    [`How many ${verb} ${b(A)}?`, v[0] + v[1], [v[0], v[1], v[0] + v[1] + v[2]]],
    [`How many ${verb} ${b('both')}?`, v[1], [v[0] + v[1] + v[2], v[0], v[2]]],
    [`How many ${verb} ${b(`${A} or ${B}`)} (or both)?`, v[0] + v[1] + v[2], [v[0] + v[2], total, v[0] + 2 * v[1] + v[2]]],
    [`How many ${verb} ${b('neither')}?`, v[3], [total - v[3], v[1], 0]],
    [`How many people were surveyed?`, total, [total - v[3], v[0] + v[1] + v[2], total - v[1]]],
  ]
  const [ask, right, likely] = pick(asks)
  const out: number[] = []
  for (const x of [...likely, right + 1, right - 1, right + 2]) if (x >= 0 && x !== right && !out.includes(x) && out.length < 3) out.push(x)
  return gq({
    t: 'count',
    prompt: `This Venn diagram shows what a group of people ${verb}. ${ask}`,
    diagram,
    correct: num(right),
    wrong: out.map((x) => num(x)),
    why: `Read the regions: only ${A} ${v[0]}, both ${v[1]}, only ${B} ${v[2]}, neither ${v[3]}. The answer is ${right}.`,
    meta: {},
  })
}

function m803prob(): GameQuestion {
  const { A, B, verb, v, total, diagram } = vennData()
  const k = int(0, 2)
  const [say, fav] = [
    [`${verb} only ${A}`, v[0]],
    [`${verb} both`, v[1]],
    [`${verb} ${A}`, v[0] + v[1]],
  ][k] as [string, number]
  return gq({
    t: 'prob',
    prompt: `This Venn diagram shows what a group of people ${verb}. One person is chosen at random. What is the probability that they ${b(say)}?`,
    diagram,
    correct: F(fav, total),
    // out of everyone except "neither", the count over the other regions, a different region
    wrong: probWrong([fav, total], [[fav, total - v[3]], [fav, total - fav], [v[(k + 1) % 3], total]]),
    why: `${fav} of the ${total} people: ${Fwhy(fav, total)}.`,
    meta: {},
  })
}

const SET_803 = set('8.03', 'Venn diagrams', 'Read Venn diagrams: only A, both, A or B, neither, and probabilities from them.', [], [mk('count', m803count), mk('prob', m803prob, 2)], { teacherNote: EXT })

// ================================================================== 8.04 Two-way tables (extension)

function twoWay() {
  const [rowA, rowB, colA, colB] = pick([
    ['Boys', 'Girls', 'Walk', 'Bus'],
    ['Year 7', 'Year 8', 'Cat', 'Dog'],
    ['Adults', 'Children', 'Swim', "Can't swim"],
  ])
  const c = [int(2, 15), int(2, 15), int(2, 15), int(2, 15)] // rowA colA, rowA colB, rowB colA, rowB colB
  const rows = [
    ['', colA, colB, 'Total'],
    [rowA, String(c[0]), String(c[1]), String(c[0] + c[1])],
    [rowB, String(c[2]), String(c[3]), String(c[2] + c[3])],
    ['Total', String(c[0] + c[2]), String(c[1] + c[3]), String(c[0] + c[1] + c[2] + c[3])],
  ]
  return { rowA, rowB, colA, colB, c, rows, total: c[0] + c[1] + c[2] + c[3] }
}

function m804missing(): GameQuestion {
  const t = twoWay()
  // hide one inner cell; it can be found from its row total
  const r = int(1, 2)
  const col = int(1, 2)
  const right = Number(t.rows[r][col])
  const rows = t.rows.map((row) => row.slice())
  rows[r][col] = '?'
  const rowTotal = Number(rows[r][3])
  const other = Number(rows[r][3 - col])
  return gq({
    t: 'missing',
    prompt: 'What number is missing from this two-way table?',
    diagram: gridTable(rows),
    correct: num(right),
    // the row total, added instead of subtracted, the column total
    wrong: [rowTotal, rowTotal + other, Number(rows[3][col]), right + 1, right - 1].filter((x, k, a) => x >= 0 && x !== right && a.indexOf(x) === k).map((x) => num(x)),
    why: `The row adds to ${rowTotal}: ${rowTotal} − ${other} = ${right}.`,
    meta: {},
  })
}

function m804prob(): GameQuestion {
  const t = twoWay()
  const r = int(1, 2)
  const col = int(1, 2)
  const fav = Number(t.rows[r][col])
  const rowName = t.rows[r][0]
  const colName = t.rows[0][col]
  return gq({
    t: 'prob',
    prompt: `One person in this two-way table is chosen at random. What is the probability that they are in ${b(rowName)} and ${b(colName)}?`,
    diagram: gridTable(t.rows),
    correct: F(fav, t.total),
    // out of the row total, out of the column total, the row total out of everyone
    wrong: probWrong([fav, t.total], [[fav, Number(t.rows[r][3])], [fav, Number(t.rows[3][col])], [Number(t.rows[r][3]), t.total]]),
    why: `${fav} of the ${t.total} people are in ${rowName} and ${colName}: ${Fwhy(fav, t.total)}.`,
    meta: {},
  })
}

const SET_804 = set('8.04', 'Two-way tables', 'Complete two-way tables from their totals, and find probabilities from them.', [], [mk('missing', m804missing), mk('prob', m804prob, 2)], { teacherNote: EXT })

// ================================================================== 8.05 Probability problems

const BALL_EVENTS: [string, (x: number) => boolean][] = [
  ['a multiple of 10', (x) => x % 10 === 0],
  ['a multiple of 5', (x) => x % 5 === 0],
  ['a number ending in 7', (x) => x % 10 === 7],
  ['a two-digit number', (x) => x >= 10 && x <= 99],
  ['a perfect square', (x) => Number.isInteger(Math.sqrt(x))],
  ['a number greater than 90', (x) => x > 90],
]

function m805balls(): GameQuestion {
  const [say, test] = pick(BALL_EVENTS)
  const fav = Array.from({ length: 100 }, (_, i) => i + 1).filter(test).length
  return gq({
    t: 'balls',
    prompt: `One ball is chosen at random from 100 balls numbered 1 to 100. What is the probability that it shows ${b(say)}?`,
    correct: F(fav, 100),
    wrong: probWrong([fav, 100], [[fav + 1, 100], [fav - 1, 100], [1, fav], [fav, 99]]),
    why: `There are ${fav} such numbers from 1 to 100: ${Fwhy(fav, 100)}.`,
    meta: {},
  })
}

function m805coin(): GameQuestion {
  const k = int(4, 9)
  const side = pick(['tail', 'head'])
  const oneIn = 2 ** (k + 1)
  return gq({
    t: 'coin',
    prompt: `A fair coin shows a ${side} ${b(`${k} times in a row`)}. What is the probability of a ${side} on the next toss?`,
    correct: frac(1, 2),
    wrong: [frac(1, k + 1), frac(1, oneIn), frac(k, k + 1), '0'],
    why: 'The coin has no memory: every toss is a new experiment, so the chance is still 1/2.',
    meta: {},
  })
}

const SET_805 = set('8.05', 'Probability problems', 'Solve probability problems: numbered balls, raffles, and repeated independent trials.', [PRO], [
  mk('balls', m805balls),
  R7('11.02', 'tickets'),
  mk('coin', m805coin),
  R7('11.02', 'or'),
  mk('not', m802not),
  R7('11.03', 'letter'),
])

// ================================================================== 8.06 Observed and expected

function m806relFreq(): GameQuestion {
  for (;;) {
    const n = pick([20, 40, 50, 60, 80, 100, 120, 200])
    const x = int(2, n / 2)
    const g = gcd(x, n)
    if (n / g > 20) continue
    const what = pick(['rolled a die', 'spun a spinner', 'tossed a drawing pin'])
    const ev = what === 'rolled a die' ? 'a 2' : what === 'spun a spinner' ? 'red' : 'point up'
    return gq({
      t: 'relFreq',
      prompt: `Kim ${what} ${b(`${n} times`)} and got ${b(ev)} ${b(`${x} times`)}. What is the relative frequency of ${ev}?`,
      correct: F(x, n),
      // the other results, the count over 100, the theoretical chance of a die
      wrong: probWrong([x, n], [[n - x, n], [x, 100], [x, n - x], [1, 6]]),
      why: `Relative frequency = ${x} out of ${n} trials = ${Fwhy(x, n)}.`,
      meta: {},
    })
  }
}

function m806predict(): GameQuestion {
  for (;;) {
    const n = pick([20, 40, 50, 80, 100])
    const x = int(2, n / 2)
    const N = n * pick([2, 3, 4, 5, 10])
    const exp = (x * N) / n
    if (!Number.isInteger(exp)) continue
    return gq({
      t: 'predict',
      prompt: `A spinner landed on blue ${b(`${x} times`)} in ${b(`${n} spins`)}. About how many blues would you expect in ${b(`${num(N)} spins`)}?`,
      correct: num(exp),
      // added the extra spins, the same count, scaled the wrong way
      wrong: [x + (N - n), x, exp + x, Math.round((n * N) / x / 10) * 10, exp * 2].filter((v, k, a) => v > 0 && v !== exp && a.indexOf(v) === k).map((v) => num(v)),
      why: `Blue came up ${x}/${n} of the time: ${x}/${n} × ${num(N)} = ${num(exp)}.`,
      meta: {},
    })
  }
}

const SET_806 = set('8.06', 'Observed and expected', 'Find relative frequencies from experiments and use them to predict.', [PRO], [
  R7('11.04', 'expected'),
  R7('11.04', 'observed'),
  mk('relFreq', m806relFreq),
  mk('predict', m806predict, 2),
])

export const NCM8_CH8: GameChapter = {
  id: 'ncm8-ch8',
  number: 8,
  title: 'Probability',
  ref: 'NCM 8 Chapter 8',
  strand: 'Statistics and probability',
  outcomes: [PRO],
  sets: [SET_801, SET_802, SET_803, SET_804, SET_805, SET_806],
  colour: 350,
  topics: [],
}
