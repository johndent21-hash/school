// Year 9 Pythagoras' theorem, following New Century Maths 9 (3rd edition, Cengage) Chapter 2 exercise by exercise.
// The questions are the site's own: they practise the same kinds of question as each exercise, in the same
// easy-to-hard order (Foundation = the start of the exercise, Challenge = the end), but none of the textbook's
// wording or numbers are copied.
// Syllabus: Pythagoras' theorem is Stage 4 content in NSW (MA4-PYT-C-01), which NCM 9 revisits in Year 9.
// Squares and square roots in 2.01 are MA4-IND-C-01. Power plus (including 3D problems) is an extension.
// Every diagram is drawn to scale from the question's own numbers; a squashed one says so on the page.
import type { Level, Question, Skill, TestItem } from '@/lib/maths/types'
import * as G from '@/lib/maths/diagrams5'
import * as F from '@/lib/maths/diagrams6'
import { MINUS, NOT_TO_SCALE, TIMES, chance, frac, int, mcA, mcFixedA, num, numA, pick, q, round, sample, shuffle, sqrt, v } from './helpers'

type P = F.P
const PYT = ['MA4-PYT-C-01']
const ROOTS = ['MA4-IND-C-01', 'MA4-PYT-C-01']
const ref = (e: string) => `NCM 9 Ex ${e}`
const r6 = (x: number) => round(x, 6)
const sqN = (x: number) => (x < 0 || !Number.isInteger(x) ? `(${num(x)})` : num(x)) + '<sup>2</sup>'
const sqS = (s: string) => `${s}<sup>2</sup>`
const isSqInt = (n: number) => Number.isInteger(n) && n >= 0 && Math.round(Math.sqrt(n)) ** 2 === n
/** 12.649 110… shown as "12.6491…" */
const cut = (x: number) => (Math.abs(x - round(x, 4)) < 1e-9 ? num(round(x, 4)) : num(Math.floor(x * 1e4 + 1e-9) / 1e4, 4) + '…')
/** false when x sits on a rounding boundary at dp places (e.g. 2.45 to one place), so the answer is clear */
const clear = (x: number, dp: number) => {
  const t = x * 10 ** dp
  return Math.abs(t - Math.floor(t) - 0.5) > 1e-6
}
const DPW: Record<number, string> = { 1: 'correct to one decimal place', 2: 'correct to two decimal places', 3: 'correct to three decimal places' }
const UNITS = ['mm', 'cm', 'm'] as const
const PRON = ['a', 'b', 'c', 'd', 'h', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'w', 'x', 'y', 'z']
const NAMESETS: [string, string, string][] = [
  ['A', 'B', 'C'], ['P', 'Q', 'R'], ['X', 'Y', 'Z'], ['K', 'L', 'M'], ['D', 'E', 'F'], ['T', 'U', 'V'],
  ['G', 'H', 'J'], ['M', 'N', 'P'], ['R', 'S', 'T'], ['W', 'X', 'Y'], ['E', 'F', 'G'], ['L', 'M', 'N'],
]
/** three vertex names: [right-angle corner, end of leg p, end of leg q] */
const names3 = () => shuffle(pick(NAMESETS)) as [string, string, string]
const sideName = (a: string, b: string) => [a, b].sort().join('')
const ROTS = [0, 0, 90, 180, 270, 20, 35, 110, 155, 200, 245, 290, 325]
const BASE: [number, number, number][] = [
  [3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [12, 35, 37], [9, 40, 41], [11, 60, 61],
  [28, 45, 53], [33, 56, 65], [16, 63, 65], [48, 55, 73], [13, 84, 85], [36, 77, 85], [39, 80, 89], [65, 72, 97],
]
/** a Pythagorean triad (or a decimal multiple of one) with its longest side at most maxC */
function triad(maxC = 100, decimals = false): [number, number, number] {
  for (;;) {
    const t = pick(BASE)
    const k = decimals ? pick([0.1, 0.2, 0.3, 0.5, 1.5, 2.5]) : pick([1, 1, 1, 2, 3, 4, 5, 10])
    const s = t.map((x) => r6(x * k)) as [number, number, number]
    if (s[2] > maxC || s[0] < (decimals ? 0.5 : 3)) continue
    if (decimals && (s.every(Number.isInteger) || s.some((x) => !Number.isInteger(r6(x * 10))))) continue
    return chance() ? s : [s[1], s[0], s[2]]
  }
}
/** wrong options for a numeric multiple choice: distinct, positive, and not the right answer */
function numOptions(right: number, wrong: number[], fmt: (x: number) => string): { correct: string; wrong: string[] } {
  const c = fmt(right)
  const out: string[] = []
  for (const w of wrong) {
    const s = fmt(w)
    if (w > 0 && s !== c && !out.includes(s)) out.push(s)
  }
  let k = 1
  while (out.length < 3) {
    const s = fmt(right + k * (right > 20 ? 4 : 1.3))
    if (s !== c && !out.includes(s) && right + k * 4 > 0) out.push(s)
    k = k > 0 ? -k : -k + 1
  }
  return { correct: c, wrong: out.slice(0, 3) }
}

type Mode = 'exact' | 'surd' | number // number: decimal places
/** working for the hypotenuse H of a right-angled triangle with shorter sides a and b */
function hypSteps(H: string, a: number, b: number, u: string, mode: Mode): string[] {
  const c2 = r6(a * a + b * b)
  const c = Math.sqrt(c2)
  const U = u ? ' ' + u : ''
  return [
    `${H} is the hypotenuse: ${sqS(H)} = ${sqN(a)} + ${sqN(b)}`,
    `${sqS(H)} = ${num(r6(a * a))} + ${num(r6(b * b))} = ${num(c2)}`,
    mode === 'surd' ? `${H} = ${sqrt(c2)}${U}` : mode === 'exact' || Number.isInteger(r6(c * 10 ** mode)) ? `${H} = ${sqrt(c2)} = ${num(r6(c))}${U}` : `${H} = ${sqrt(c2)} = ${cut(c)} ≈ ${num(round(c, mode), mode)}${U}`,
  ]
}
/** working for a shorter side H when the hypotenuse is c and the other side is a */
function legSteps(H: string, c: number, a: number, u: string, mode: Mode): string[] {
  const d2 = r6(c * c - a * a)
  const d = Math.sqrt(d2)
  const U = u ? ' ' + u : ''
  return [
    `${H} is a shorter side: ${sqN(c)} = ${sqS(H)} + ${sqN(a)}`,
    `${sqS(H)} = ${sqN(c)} ${MINUS} ${sqN(a)} = ${num(r6(c * c))} ${MINUS} ${num(r6(a * a))} = ${num(d2)}`,
    mode === 'surd' ? `${H} = ${sqrt(d2)}${U}` : mode === 'exact' || Number.isInteger(r6(d * 10 ** mode)) ? `${H} = ${sqrt(d2)} = ${num(r6(d))}${U}` : `${H} = ${sqrt(d2)} = ${cut(d)} ≈ ${num(round(d, mode), mode)}${U}`,
  ]
}
const answerFor = (x2: number, mode: Mode) => (mode === 'surd' ? numA(x2) : mode === 'exact' ? numA(r6(Math.sqrt(x2))) : numA(Math.sqrt(x2), mode))
const L = (n: number, u: string) => `${num(n)} ${u}`

/** a right-angled triangle drawn to scale (squashed, with a note, if it's too thin): legs p and q,
 *  labels for side p, side q and the hypotenuse, and optional vertex names [right angle, end of p, end of q] */
function rtFig(p: number, q: number, labels: [string, string, string], names: [string, string, string] | null, rot = pick(ROTS), mirror = chance()) {
  let dp = p
  let dq = q
  let squashed = false
  if (q / p > 3.2) {
    dp = q / 3.2
    squashed = true
  } else if (p / q > 3.2) {
    dq = p / 3.2
    squashed = true
  }
  const [R, A, B] = F.rtPts(dp, dq, rot, mirror)
  const k = names ?? ['r', 'a', 'b']
  const sides: NonNullable<F.Fig['sides']> = []
  if (labels[0]) sides.push({ a: k[0], b: k[1], text: labels[0] })
  if (labels[1]) sides.push({ a: k[0], b: k[2], text: labels[1] })
  if (labels[2]) sides.push({ a: k[1], b: k[2], text: labels[2], gap: 16 })
  return {
    diagram: F.fig({ pts: { [k[0]]: R, [k[1]]: A, [k[2]]: B }, polys: [{ v: [...k] }], rights: [[k[1], k[0], k[2]]], sides, names: names ? [...k] : [], label: 'Right-angled triangle' }),
    note: squashed ? NOT_TO_SCALE : undefined,
  }
}

// ================================================================== 2.01 Surds

const sqDec = (d: number) => `(${num(d)})<sup>2</sup>`
function evalSquare(): Question {
  const kind = pick(['int', 'neg', 'dec', 'sum', 'diff'] as const)
  if (kind === 'sum' || kind === 'diff') {
    let a = int(2, 25)
    let b = int(2, 25)
    if (a === b) b = a === 25 ? 24 : a + 1
    if (kind === 'diff' && a < b) [a, b] = [b, a]
    const val = kind === 'sum' ? a * a + b * b : a * a - b * b
    const op = kind === 'sum' ? '+' : MINUS
    return q({
      prompt: `Evaluate ${sqN(a)} ${op} ${sqN(b)}.`,
      answer: numA(val),
      calc: true,
      hint: 'Square each number first (powers come before + and −), then add or subtract.',
      steps: [`${sqN(a)} ${op} ${sqN(b)} = ${a * a} ${op} ${b * b} = ${num(val)}`],
      meta: { t: 'sqsum', a, b, op: kind === 'sum' ? 1 : -1 },
    })
  }
  if (kind === 'dec') {
    const n = chance(0.25) ? int(2, 9) : int(2, 129)
    if (n % 10 === 0) return evalSquare()
    const d = n < 10 && chance() ? n / 100 : n / 10
    const val = r6(d * d)
    return q({
      prompt: `Evaluate ${sqDec(d)}.`,
      answer: numA(val),
      calc: true,
      hint: `${sqDec(d)} means ${num(d)} ${TIMES} ${num(d)}. Count the decimal places: the answer has twice as many.`,
      steps: [`${sqDec(d)} = ${num(d)} ${TIMES} ${num(d)} = ${num(val)}`],
      meta: { t: 'sq', x: d },
    })
  }
  const x = kind === 'int' ? int(11, 30) : -int(2, 16)
  return q({
    prompt: `Evaluate ${sqN(x)}.`,
    answer: numA(x * x),
    calc: kind === 'int',
    hint: kind === 'neg' ? 'A negative number times a negative number is positive.' : `Multiply ${num(x)} by itself.`,
    steps: [`${sqN(x)} = ${x < 0 ? `(${num(x)}) ${TIMES} (${num(x)})` : `${num(x)} ${TIMES} ${num(x)}`} = ${num(x * x)}`],
    meta: { t: 'sq', x },
  })
}
function exactRoot(): Question {
  let k = int(11, 45)
  if (k % 10 === 0) k++
  const dec = chance(0.4)
  const r = dec ? k / 10 : k
  const n = r6(r * r)
  return q({
    prompt: `Evaluate ${sqrt(n)}.`,
    answer: numA(r),
    calc: true,
    hint: `Find the positive number that, squared, gives ${num(n)}.`,
    steps: [`${sqN(r)} = ${num(n)}, so ${sqrt(n)} = ${num(r)}.`],
    meta: { t: 'root', n },
  })
}
function rootDp(): Question {
  let n = chance(0.7) ? int(10, 999) : int(1000, 9999)
  while (isSqInt(n) || !clear(Math.sqrt(n), 2)) n++
  const s = Math.sqrt(n)
  return q({
    prompt: `Evaluate ${sqrt(n)}, correct to two decimal places.`,
    answer: numA(s, 2),
    calc: true,
    hint: 'Use the √ key, then look at the third decimal place to round.',
    steps: [`${sqrt(n)} = ${cut(s)} ≈ ${num(round(s, 2), 2)}`],
    meta: { t: 'root', n, dp: 2 },
  })
}
function rootOfSum(): Question {
  const decimals = chance(0.35)
  const dp = decimals ? 1 : 2
  for (;;) {
    let a = decimals ? int(11, 299) / 10 : int(2, 30)
    let b = decimals ? int(11, 299) / 10 : int(2, 30)
    const sub = chance(0.35)
    if (sub && a < b) [a, b] = [b, a]
    if (a === b) continue
    const inner = r6(sub ? a * a - b * b : a * a + b * b)
    const s = Math.sqrt(inner)
    if (Number.isInteger(r6(s)) || !clear(s, dp)) continue
    const op = sub ? MINUS : '+'
    return q({
      prompt: `Evaluate ${sqrt(`${sqN(a)} ${op} ${sqN(b)}`)}, ${DPW[dp]}.`,
      answer: numA(s, dp),
      calc: true,
      hint: 'Work out what is under the square root sign first, then take the square root and round.',
      steps: [`${sqN(a)} ${op} ${sqN(b)} = ${num(r6(a * a))} ${op} ${num(r6(b * b))} = ${num(inner)}`, `${sqrt(inner)} = ${cut(s)} ≈ ${num(round(s, dp), dp)}`],
      meta: { t: 'rootsum', a, b, op: sub ? -1 : 1, dp },
    })
  }
}
function closestMC(): Question {
  let a = int(3, 15)
  let b = int(3, 15)
  if (a === b) b++
  if (a > b) [a, b] = [b, a]
  const s = Math.sqrt(a * a + b * b)
  const o = numOptions(round(s, 1), [a + b, a * a + b * b, round(Math.sqrt(b * b - a * a), 1)], (x) => num(round(x, 1)))
  return q({
    prompt: `Which of these is closest to the value of ${sqrt(`${sqN(a)} + ${sqN(b)}`)}?`,
    answer: mcA(o.correct, o.wrong),
    calc: true,
    hint: 'Square each number and add them first. The square root of the total is smaller than the total itself.',
    steps: [`${sqN(a)} + ${sqN(b)} = ${a * a} + ${b * b} = ${a * a + b * b}`, `${sqrt(a * a + b * b)} = ${cut(s)} ≈ ${num(round(s, 1))}`],
    meta: { t: 'closest', a, b },
  })
}
/** √d is a surd unless d is the square of a fraction (d written as a decimal) */
export function isSurd(d: number): boolean {
  let n = Math.round(d * 1e6)
  let m = 1e6
  const g = (x: number, y: number): number => (y ? g(y, x % y) : x)
  const k = g(n, m)
  n /= k
  m /= k
  return !(isSqInt(n) && isSqInt(m))
}
function surdPool(surd: boolean): number {
  for (;;) {
    const d = chance(0.75) ? int(2, 400) : int(2, 99) / 10
    if (isSurd(d) === surd) return d
    if (!surd && chance(0.6)) {
      const k = int(2, 20)
      return chance(0.7) ? k * k : r6((k / 10) ** 2)
    }
  }
}
function whichSurd(): Question {
  const not = chance(0.4)
  const right = surdPool(!not)
  const wrong: number[] = []
  while (wrong.length < 3) {
    const w = surdPool(not)
    if (!wrong.includes(w) && w !== right) wrong.push(w)
  }
  return q({
    prompt: not ? 'Which of these is <b>not</b> a surd?' : 'Which of these is a surd?',
    answer: mcA(sqrt(right), wrong.map((w) => sqrt(w))),
    hint: 'A square root is a surd if its exact value can’t be written as a whole number, a fraction or a terminating decimal: the number under the √ is not a perfect square.',
    steps: [...[right, ...wrong].map((d) => (isSurd(d) ? `${sqrt(d)} = ${cut(Math.sqrt(d))} is a surd (its decimal never ends or repeats).` : `${sqrt(d)} = ${num(r6(Math.sqrt(d)))} is not a surd.`))],
    meta: { t: 'surdmc', not, right, wrong },
  })
}
function countSurds(): Question {
  const list: number[] = []
  const surdCount = int(2, 4)
  while (list.length < 6) {
    const d = surdPool(list.filter(isSurd).length < surdCount)
    if (!list.includes(d)) list.push(d)
  }
  const shuffled = shuffle(list)
  const n = shuffled.filter(isSurd).length
  return q({
    prompt: `How many of these square roots are surds?<div class="big">${shuffled.map((d) => sqrt(d)).join('&emsp;')}</div>`,
    answer: numA(n),
    hint: 'Check each number under the √: is it the square of a whole number or a decimal (like 1.44 = 1.2²)? If not, it is a surd.',
    steps: [...shuffled.map((d) => (isSurd(d) ? `${sqrt(d)} = ${cut(Math.sqrt(d))}: surd` : `${sqrt(d)} = ${num(r6(Math.sqrt(d)))}: not a surd`)), `There are ${n} surds.`],
    meta: { t: 'surdcount', list: shuffled },
  })
}
function between(): Question {
  let n = int(5, 200)
  while (isSqInt(n)) n++
  const k = Math.floor(Math.sqrt(n))
  const start = Math.max(1, k - int(1, 2))
  const opts = [0, 1, 2, 3].map((i) => `${start + i} and ${start + i + 1}`)
  return q({
    prompt: `Without using a calculator, decide between which two consecutive whole numbers ${sqrt(n)} lies.`,
    answer: mcFixedA(opts, `${k} and ${k + 1}`),
    hint: `List some square numbers: which two are either side of ${n}?`,
    steps: [`${sqN(k)} = ${k * k} and ${sqN(k + 1)} = ${(k + 1) ** 2}`, `${n} is between ${k * k} and ${(k + 1) ** 2}, so ${sqrt(n)} is between ${k} and ${k + 1}.`],
    meta: { t: 'between', n },
  })
}
function alwaysTrue(): Question {
  const x = int(2, 9)
  if (chance()) {
    const right = `No: it is false when ${v('x')} is negative. For example, ${sqrt(`(${MINUS}${x})<sup>2</sup>`)} = ${sqrt(x * x)} = ${x}, not ${MINUS}${x}.`
    return q({
      prompt: `Is ${sqrt(`${v('x')}<sup>2</sup>`)} = ${v('x')} true for every number ${v('x')}?`,
      answer: mcA(right, [
        'Yes: squaring and taking the square root undo each other.',
        `No: it is only true when ${v('x')} is a perfect square, such as 4 or 9.`,
        `No: it is false when ${v('x')} is a decimal. For example, ${sqrt('(0.5)<sup>2</sup>')} is not 0.5.`,
      ]),
      hint: `Try a negative value of ${v('x')}. Remember that √ always gives the positive square root.`,
      steps: [`With ${v('x')} = ${x}: ${sqrt(`${x}<sup>2</sup>`)} = ${sqrt(x * x)} = ${x}. True.`, `With ${v('x')} = ${MINUS}${x}: ${sqrt(`(${MINUS}${x})<sup>2</sup>`)} = ${sqrt(x * x)} = ${x}, which is not ${MINUS}${x}.`, `So it is not always true: ${sqrt(`${v('x')}<sup>2</sup>`)} = ${v('x')} only when ${v('x')} ≥ 0.`],
      meta: { t: 'always', which: 'rootofsquare' },
    })
  }
  const y = pick([2, 3, 5, 6, 7, 10, 11])
  const right = `Yes: ${sqrt(v('x'))} is the number whose square is ${v('x')}, so squaring it gives ${v('x')} back.`
  return q({
    prompt: `${sqrt(v('x'))} only has a value when ${v('x')} ≥ 0. Is (${sqrt(v('x'))})<sup>2</sup> = ${v('x')} true for every ${v('x')} ≥ 0?`,
    answer: mcA(right, [
      `No: it is false when ${v('x')} is not a perfect square, because (${sqrt(2)})<sup>2</sup> is only about 2.`,
      `No: it is only true when ${v('x')} is a whole number.`,
      `No: (${sqrt(v('x'))})<sup>2</sup> = 2${v('x')}.`,
    ]),
    hint: `Think about what ${sqrt(v('x'))} means.`,
    steps: [`${sqrt(v('x'))} is defined as the positive number that, squared, gives ${v('x')}.`, `So (${sqrt(v('x'))})<sup>2</sup> = ${v('x')} for every ${v('x')} ≥ 0. For example, (${sqrt(y)})<sup>2</sup> = ${y} exactly, even though a calculator shows ${sqrt(y)} as ${cut(Math.sqrt(y))}`],
    meta: { t: 'always', which: 'squareofroot' },
  })
}
export const ex201 = (level: Level): Question => {
  if (level === 1) return chance(0.6) ? evalSquare() : exactRoot()
  if (level === 2) return pick([rootDp, rootOfSum, rootOfSum, closestMC])()
  return pick([whichSurd, whichSurd, countSurds, between, between, alwaysTrue])()
}

// ================================================================== 2.02 Pythagoras' theorem

function hypDefinition(): Question {
  if (chance())
    return q({
      prompt: 'In a right-angled triangle, what is the hypotenuse?',
      answer: mcA('the longest side', ['the shortest side', 'the right angle', 'the side along the bottom']),
      hint: 'The hypotenuse is opposite the right angle.',
      steps: ['The hypotenuse is the longest side of a right-angled triangle. It is always opposite the right angle.'],
      meta: { t: 'hypdef' },
    })
  return q({
    prompt: 'Where is the hypotenuse of a right-angled triangle?',
    answer: mcA('opposite the right angle', ['next to the right angle', 'opposite the smallest angle', 'always at the bottom of the triangle']),
    hint: 'It is the longest side, so look at the biggest angle.',
    steps: ['The hypotenuse is opposite the right angle, whichever way the triangle is turned. It is the longest side.'],
    meta: { t: 'hypdef' },
  })
}
function nameHyp(): Question {
  const [p, qq] = [int(3, 12), int(3, 12)]
  if (chance()) {
    const [x, y, z] = sample(PRON, 3)
    const d = rtFig(p, qq, [v(x), v(y), v(z)], null)
    return q({
      prompt: 'Which side is the hypotenuse of this right-angled triangle?',
      ...d,
      answer: mcA(v(z), [v(x), v(y)]),
      hint: 'Find the right angle. The hypotenuse is the side opposite it (the side that doesn’t touch it).',
      steps: [`The hypotenuse is opposite the right angle, so it is ${v(z)}.`],
      meta: { t: 'namehyp', legs: [x, y], hyp: z },
    })
  }
  const N = names3()
  const d = rtFig(p, qq, ['', '', ''], N)
  const hyp = sideName(N[1], N[2])
  return q({
    prompt: 'Name the hypotenuse of this right-angled triangle.',
    ...d,
    answer: mcA(v(hyp), [v(sideName(N[0], N[1])), v(sideName(N[0], N[2]))]),
    hint: 'The hypotenuse is the side opposite the right angle. Name it by the letters at its two ends.',
    steps: [`The right angle is at ${v(N[0])}. The side opposite it joins ${v(N[1])} and ${v(N[2])}, so the hypotenuse is ${v(hyp)}.`],
    meta: { t: 'namehyp', right: N[0], hyp },
  })
}
function writeTheorem(): Question {
  const [p, qq] = [int(3, 12), int(3, 12)]
  let H: string
  let A: string
  let B: string
  let diagram: { diagram: string; note?: string }
  if (chance()) {
    const [x, y, z] = sample(PRON, 3)
    diagram = rtFig(p, qq, [v(x), v(y), v(z)], null)
    ;[A, B, H] = [v(x), v(y), v(z)]
  } else {
    const N = names3()
    diagram = rtFig(p, qq, ['', '', ''], N)
    ;[A, B, H] = [v(sideName(N[0], N[1])), v(sideName(N[0], N[2])), v(sideName(N[1], N[2]))]
  }
  const right = `${sqS(H)} = ${sqS(A)} + ${sqS(B)}`
  return q({
    prompt: 'Which of these is Pythagoras’ theorem for this triangle?',
    ...diagram,
    answer: mcA(right, [`${sqS(A)} = ${sqS(H)} + ${sqS(B)}`, `${sqS(B)} = ${sqS(A)} + ${sqS(H)}`, `${H} = ${A} + ${B}`]),
    hint: '(hypotenuse)² = (one shorter side)² + (the other shorter side)². Find the hypotenuse first: it is opposite the right angle.',
    steps: [`The hypotenuse is ${H} (opposite the right angle).`, `So ${right}.`],
    meta: { t: 'writethm', hyp: H, legs: [A, B] },
  })
}
function hypFromWords(): Question {
  const N = names3()
  const tri = [...N].sort().join('')
  const angle = chance() ? v(N[0]) : v(`${N[1]}${N[0]}${N[2]}`)
  const hyp = sideName(N[1], N[2])
  return q({
    prompt: `In △${v(tri)}, ∠${angle} = 90°. Which side is the hypotenuse?`,
    answer: mcA(v(hyp), [v(sideName(N[0], N[1])), v(sideName(N[0], N[2]))]),
    hint: 'Sketch the triangle. The hypotenuse is the side opposite the right angle: it doesn’t touch that vertex.',
    steps: [`The right angle is at ${v(N[0])}.`, `The side that doesn’t touch ${v(N[0])} is ${v(hyp)}, so ${v(hyp)} is the hypotenuse.`],
    meta: { t: 'hypwords', right: N[0], hyp },
  })
}
function theoremNumbers(): Question {
  const [a, b, c] = triad(60, chance(0.3))
  const u = pick(UNITS)
  const unknown = pick(['none', 'hyp', 'leg'] as const)
  const x = pick(PRON)
  const la = unknown === 'leg' ? v(x) : L(a, u)
  const lh = unknown === 'hyp' ? v(x) : L(c, u)
  const d = rtFig(a, b, [la, L(b, u), lh], null)
  const A = unknown === 'leg' ? v(x) : num(a)
  const Hs = unknown === 'hyp' ? v(x) : num(c)
  const sq = (s: string) => (s.startsWith('<') ? sqS(s) : Number(s.replace(' ', '')) % 1 ? `(${s})<sup>2</sup>` : sqS(s))
  const right = `${sq(Hs)} = ${sq(A)} + ${sq(num(b))}`
  return q({
    prompt: 'Which equation is Pythagoras’ theorem for this triangle?',
    ...d,
    answer: mcA(right, [`${sq(A)} = ${sq(Hs)} + ${sq(num(b))}`, `${sq(num(b))} = ${sq(A)} + ${sq(Hs)}`, `${Hs} = ${A} + ${num(b)}`]),
    hint: 'The side opposite the right angle goes on its own on the left: (hypotenuse)² = (shorter side)² + (shorter side)².',
    steps: [`The hypotenuse (opposite the right angle) is ${unknown === 'hyp' ? v(x) : L(c, u)}.`, `So ${right}.`],
    meta: { t: 'thmnum', a, b, c, unknown },
  })
}
function squaresArea(): Question {
  const [a, b, c] = triad(30)
  const u = pick(['cm', 'm'])
  if (chance()) {
    return q({
      prompt: `Squares are drawn on each side of a right-angled triangle. The squares on the two shorter sides have areas ${a * a} ${u}<sup>2</sup> and ${b * b} ${u}<sup>2</sup>. What is the area of the square on the hypotenuse?`,
      answer: numA(c * c),
      suffix: `${u}<sup>2</sup>`,
      hint: 'Pythagoras’ theorem says the square on the hypotenuse has the same area as the other two squares together.',
      steps: [`Area = ${a * a} + ${b * b} = ${c * c} ${u}<sup>2</sup>`, `(Check: the sides are ${a}, ${b} and ${c} ${u}, and ${c}<sup>2</sup> = ${c * c}.)`],
      meta: { t: 'sqarea', small: [a * a, b * b] },
    })
  }
  return q({
    prompt: `Squares are drawn on each side of a right-angled triangle. The square on the hypotenuse has an area of ${c * c} ${u}<sup>2</sup> and the square on one shorter side has an area of ${a * a} ${u}<sup>2</sup>. How long is the other shorter side?`,
    answer: numA(b),
    suffix: u,
    hint: 'First find the area of the third square (the big square equals the two small squares together), then take its square root.',
    steps: [`Area of the third square = ${c * c} ${MINUS} ${a * a} = ${b * b} ${u}<sup>2</sup>`, `Side = ${sqrt(b * b)} = ${b} ${u}`],
    meta: { t: 'sqarea2', big: c * c, small: a * a },
  })
}
export const ex202 = (level: Level): Question => {
  if (level === 1) return pick([hypDefinition, nameHyp, nameHyp, nameHyp])()
  if (level === 2) return pick([writeTheorem, writeTheorem, hypFromWords])()
  return pick([theoremNumbers, theoremNumbers, squaresArea])()
}

// ================================================================== 2.03 Finding the hypotenuse

/** "Find the value of c" with a pronumeral on the hypotenuse, or "Find the length of XY" with vertex names */
function hypQuestion(a: number, b: number, u: string, mode: Mode): Question {
  const named = chance()
  const x = pick(['c', 'h', 'x', 'y', 'p', 'k', 'w'])
  const N = names3()
  const H = named ? v(sideName(N[1], N[2])) : v(x)
  const d = rtFig(a, b, [L(a, u), L(b, u), named ? '' : `${v(x)} ${u}`], named ? N : null)
  const what = named ? `the length of the hypotenuse, ${H}` : `the value of ${H}`
  const how = mode === 'surd' ? ', as a surd' : mode === 'exact' ? '' : `, ${DPW[mode]}`
  return q({
    prompt: `Find ${what}${how}.`,
    ...d,
    answer: answerFor(r6(a * a + b * b), mode),
    prefix: mode === 'surd' ? `${H} = √` : `${H} =`,
    suffix: u,
    calc: true,
    hint: `${H} is the hypotenuse, so ${sqS(H)} = ${sqN(a)} + ${sqN(b)}.${mode === 'surd' ? ' Leave the answer as √ of a number.' : ''}`,
    steps: hypSteps(H, a, b, u, mode),
    meta: { t: 'hyp', a, b, mode },
  })
}
function hypTriad(): Question {
  const [a, b] = triad(100, chance(0.3))
  return hypQuestion(a, b, pick(UNITS), 'exact')
}
function hypSurd(): Question {
  for (;;) {
    const a = int(2, 60)
    const b = int(2, 60)
    if (!isSqInt(a * a + b * b)) return hypQuestion(a, b, pick(UNITS), 'surd')
  }
}
function hypDp(): Question {
  for (;;) {
    const dec = chance(0.35)
    const a = dec ? int(11, 299) / 100 : int(5, 90)
    const b = dec ? int(11, 299) / 100 : int(5, 90)
    const c = Math.sqrt(a * a + b * b)
    if (Number.isInteger(r6(c)) || !clear(c, 1) || a === b) continue
    return hypQuestion(a, b, dec ? 'm' : pick(['mm', 'cm', 'm']), 1)
  }
}
function fieldMC(): Question {
  const l = int(6, 20) * 10
  const w = int(3, Math.floor(l / 10) - 1) * 10
  const c = Math.sqrt(l * l + w * w)
  const o = numOptions(round(c, 1), [l + w, round(Math.sqrt(l * l - w * w), 1), round(l + w / 4, 1)], (x) => `${num(round(x, 1))} m`)
  return q({
    prompt: `A rectangular paddock is ${l} m long and ${w} m wide. How far is it from one corner to the opposite corner, along the diagonal?`,
    diagram: F.fig({ pts: { A: [0, w], B: [l, w], C: [l, 0], D: [0, 0] }, polys: [{ v: ['A', 'B', 'C', 'D'] }], segs: [{ a: 'A', b: 'C', dash: true }], rights: [['A', 'D', 'C']], sides: [{ a: 'A', b: 'B', text: L(l, 'm') }, { a: 'B', b: 'C', text: L(w, 'm') }], label: 'Rectangle' }),
    answer: mcA(o.correct, o.wrong),
    calc: true,
    hint: 'The diagonal is the hypotenuse of a right-angled triangle with the length and width as its shorter sides.',
    steps: hypSteps(v('d'), l, w, 'm', 1),
    meta: { t: 'hyp', a: l, b: w, mode: 1, mc: true },
  })
}
function ladder(): Question {
  for (;;) {
    const h = int(25, 70) / 10
    const d = int(8, 25) / 10
    const c = Math.sqrt(h * h + d * d)
    if (!clear(c, 1)) continue
    return q({
      prompt: `A painter rests a ladder against a wall so that it reaches a window ledge ${num(h)} m above the ground. The foot of the ladder is ${num(d)} m from the wall. How long is the ladder, ${DPW[1]}?`,
      diagram: F.fig({ pts: { W: [0, 0], T: [0, h], Fo: [-d, 0], g1: [-d - 0.6, 0], g2: [0.5, 0], t2: [0, h + 0.5] }, polys: [{ v: ['W', 'T', 'Fo'] }], segs: [{ a: 'g1', b: 'g2' }, { a: 'W', b: 't2' }], rights: [['Fo', 'W', 'T']], sides: [{ a: 'W', b: 'T', text: L(h, 'm'), away: 'Fo' }, { a: 'W', b: 'Fo', text: L(d, 'm'), away: 'T' }, { a: 'Fo', b: 'T', text: 'ladder', away: 'W' }], label: 'Ladder against a wall' }),
      answer: numA(c, 1),
      suffix: 'm',
      calc: true,
      hint: 'The ladder is the hypotenuse. The wall and the ground are the shorter sides.',
      steps: hypSteps(v('l'), h, d, 'm', 1),
      meta: { t: 'hyp', a: h, b: d, mode: 1 },
    })
  }
}
function rafter(): Question {
  for (;;) {
    const span = int(5, 14) + (chance() ? 0.5 : 0)
    const h = int(12, 35) / 10
    const c = Math.sqrt((span / 2) ** 2 + h * h)
    // a realistic pitch (at least about 24°), which also leaves room to label the height
    if (!clear(c, 2) || h < span * 0.22) continue
    return q({
      prompt: `The front of a roof is an isosceles triangle. It is ${num(span)} m wide at the base and ${num(h)} m high in the middle. How long is each sloping rafter, ${DPW[2]}?`,
      diagram: F.fig({ pts: { A: [0, 0], B: [span, 0], T: [span / 2, h], M: [span / 2, 0] }, polys: [{ v: ['A', 'B', 'T'] }], segs: [{ a: 'T', b: 'M', dash: true }], rights: [['B', 'M', 'T']], ticks: [{ a: 'A', b: 'T', n: 1 }, { a: 'B', b: 'T', n: 1 }], sides: [{ a: 'A', b: 'B', text: L(span, 'm') }, { a: 'M', b: 'T', text: L(h, 'm'), on: true }, { a: 'A', b: 'T', text: 'rafter' }], label: 'Roof triangle' }),
      answer: numA(c, 2),
      suffix: 'm',
      calc: true,
      hint: `The height splits the roof into two right-angled triangles. Each has a base of half of ${num(span)} m.`,
      steps: [`Half the width = ${num(span)} ÷ 2 = ${num(span / 2)} m`, ...hypSteps(v('r'), span / 2, h, 'm', 2)],
      meta: { t: 'hyp', a: span / 2, b: h, mode: 2 },
    })
  }
}
/** the triangle described in words, sometimes with mixed units */
function hypFromAngle(): Question {
  const N = names3()
  const tri = [...N].sort().join('')
  const s1 = sideName(N[0], N[1])
  const s2 = sideName(N[0], N[2])
  const H = sideName(N[1], N[2])
  const kind = pick(['plain', 'surd', 'mm', 'm'] as const)
  const angle = chance() ? v(N[0]) : v(`${N[1]}${N[0]}${N[2]}`)
  const intro = `In △${v(tri)}, ∠${angle} = 90°`
  if (kind === 'plain' || kind === 'surd') {
    for (;;) {
      const dec = kind === 'surd' && chance()
      const a = dec ? int(11, 60) / 10 : int(12, 90)
      const b = dec ? int(11, 60) / 10 : int(12, 90)
      const u = dec ? 'm' : pick(['cm', 'mm'])
      const c2 = r6(a * a + b * b)
      if (a === b || !isSurd(c2) || (kind === 'plain' && !clear(Math.sqrt(c2), 1))) continue
      const mode: Mode = kind === 'surd' ? 'surd' : 1
      return q({
        prompt: `${intro}, ${v(s1)} = ${L(a, u)} and ${v(s2)} = ${L(b, u)}. Find ${v(H)}${kind === 'surd' ? ', as a surd' : `, ${DPW[1]}`}.`,
        answer: answerFor(c2, mode),
        prefix: kind === 'surd' ? `${v(H)} = √` : `${v(H)} =`,
        suffix: u,
        calc: true,
        hint: `Sketch the triangle. The side opposite the right angle at ${v(N[0])} is ${v(H)}, the hypotenuse.`,
        steps: hypSteps(v(H), a, b, u, mode),
        meta: { t: 'hyp', a, b, mode },
      })
    }
  }
  for (;;) {
    if (kind === 'mm') {
      // one side in cm, one in mm; answer to the nearest millimetre
      const aCm = int(50, 250) / 10
      const bMm = int(20, 200)
      const c = Math.sqrt((aCm * 10) ** 2 + bMm ** 2)
      if (!clear(c, 0)) continue
      return q({
        prompt: `${intro}, ${v(s1)} = ${L(aCm, 'cm')} and ${v(s2)} = ${L(bMm, 'mm')}. Find ${v(H)} in millimetres, correct to the nearest millimetre.`,
        answer: numA(c, 0),
        prefix: `${v(H)} =`,
        suffix: 'mm',
        calc: true,
        hint: 'Change both lengths to millimetres first (1 cm = 10 mm).',
        steps: [`${v(s1)} = ${num(aCm)} cm = ${num(aCm * 10)} mm`, ...hypSteps(v(H), r6(aCm * 10), bMm, 'mm', 0)],
        meta: { t: 'hyp', a: r6(aCm * 10), b: bMm, mode: 0, units: 'cm-mm' },
      })
    }
    const aCm = int(150, 900)
    const bM = int(30, 120) / 10
    const c = Math.sqrt((aCm / 100) ** 2 + bM ** 2)
    if (!clear(c, 1)) continue
    return q({
      prompt: `${intro}, ${v(s1)} = ${L(aCm, 'cm')} and ${v(s2)} = ${L(bM, 'm')}. Find ${v(H)} in metres, correct to the nearest 0.1 m.`,
      answer: numA(c, 1),
      prefix: `${v(H)} =`,
      suffix: 'm',
      calc: true,
      hint: 'Change both lengths to metres first (100 cm = 1 m).',
      steps: [`${v(s1)} = ${num(aCm)} cm = ${num(aCm / 100)} m`, ...hypSteps(v(H), aCm / 100, bM, 'm', 1)],
      meta: { t: 'hyp', a: aCm / 100, b: bM, mode: 1, units: 'cm-m' },
    })
  }
}
export const ex203 = (level: Level): Question => {
  if (level === 1) return hypTriad()
  if (level === 2) return pick([hypSurd, hypDp, hypDp, fieldMC, ladder])()
  return pick([hypFromAngle, hypFromAngle, rafter])()
}

// ================================================================== 2.04 Finding a shorter side

function legQuestion(c: number, a: number, u: string, mode: Mode, prompt?: string): Question {
  const x = pick(['a', 'b', 'x', 'y', 'd', 'p', 'm', 'g', 'e'].filter((l) => l !== 'e'))
  const b = Math.sqrt(c * c - a * a)
  const N = names3()
  const d = rtFig(a, b, [L(a, u), `${v(x)} ${u}`, L(c, u)], chance(0.3) ? N : null)
  const how = mode === 'surd' ? ' as a surd' : mode === 'exact' ? '' : `, ${DPW[mode]}`
  return q({
    prompt: prompt ?? `Find the value of ${v(x)}${how}.`,
    ...d,
    answer: answerFor(r6(c * c - a * a), mode),
    prefix: mode === 'surd' ? `${v(x)} = √` : `${v(x)} =`,
    suffix: u,
    calc: true,
    hint: `${v(x)} is a shorter side (it is not opposite the right angle), so ${sqS(v(x))} = ${sqN(c)} ${MINUS} ${sqN(a)}.`,
    steps: legSteps(v(x), c, a, u, mode),
    meta: { t: 'leg', c, a, mode },
  })
}
function legTriad(): Question {
  const [a, b, c] = triad(100, chance(0.25))
  return legQuestion(c, chance() ? a : b, pick(UNITS), 'exact')
}
function legDp(): Question {
  for (;;) {
    const c = int(15, 120)
    const a = int(5, c - 3)
    const b = Math.sqrt(c * c - a * a)
    if (Number.isInteger(r6(b)) || !clear(b, 1)) continue
    return legQuestion(c, a, pick(UNITS), 1)
  }
}
function legSurd(): Question {
  for (;;) {
    const dec = chance(0.3)
    const c = dec ? int(20, 80) / 10 : int(10, 130)
    const a = dec ? int(10, Math.round(c * 10) - 3) / 10 : int(5, c - 2)
    if (!isSurd(r6(c * c - a * a)) || Math.sqrt(c * c - a * a) < c / 6) continue
    return legQuestion(c, a, dec ? 'm' : pick(UNITS), 'surd')
  }
}
function rectSideMC(): Question {
  const surd = chance(0.6)
  let c: number
  let a: number
  if (surd) {
    do {
      c = int(8, 30)
      a = int(Math.ceil(c * 0.35), Math.floor(c * 0.8))
    } while (isSqInt(c * c - a * a))
  } else {
    let t: number[]
    do t = triad(150)
    while (Math.min(t[0], t[1]) < 0.35 * t[2])
    c = t[2]
    a = Math.max(t[0], t[1])
  }
  const b = Math.sqrt(c * c - a * a)
  const w = surd ? null : numOptions(r6(b), [r6(b + 4), r6(b - 4), r6(b + 8), c - a], (x) => num(x))
  const pts: Record<string, P> = { A: [0, b], B: [0, 0], C: [a, 0], D: [a, b] }
  return q({
    prompt: `${v('ABCD')} is a rectangle with ${v('BC')} = ${L(a, 'm')} and diagonal ${v('BD')} = ${L(c, 'm')}. Find the value of ${v('x')}, the length of ${v('CD')}.`,
    diagram: F.fig({ pts, polys: [{ v: ['A', 'B', 'C', 'D'] }], segs: [{ a: 'B', b: 'D' }], rights: [['B', 'C', 'D']], sides: [{ a: 'B', b: 'C', text: L(a, 'm') }, { a: 'C', b: 'D', text: `${v('x')} m` }, { a: 'B', b: 'D', text: L(c, 'm'), on: true }], names: ['A', 'B', 'C', 'D'], label: 'Rectangle with a diagonal' }),
    answer: surd ? mcA(`${sqrt(c * c - a * a)} m`, [`${sqrt(c + a)} m`, `${sqrt(c * c - a)} m`, `${sqrt(c * c + a * a)} m`]) : mcA(w!.correct + ' m', w!.wrong.map((s) => s + ' m')),
    calc: !surd,
    hint: `Triangle ${v('BCD')} is right-angled at ${v('C')}, and the diagonal ${v('BD')} is its hypotenuse.`,
    steps: legSteps(v('x'), c, a, 'm', surd ? 'surd' : 'exact'),
    meta: { t: 'leg', c, a, mode: surd ? 'surd' : 'exact', mc: true },
  })
}
function chord(): Question {
  for (;;) {
    const r = int(12, 30) / 10
    const chordCm = int(6, Math.floor(r * 170 / 10)) * 10
    const half = chordCm / 200
    if (half >= r * 0.9) continue
    const ob = Math.sqrt(r * r - half * half)
    if (!clear(ob, 2)) continue
    const pts: Record<string, P> = { O: [0, 0], A: [-half, ob], C: [half, ob], B: [0, ob] }
    return q({
      prompt: `${v('O')} is the centre of a circle with radius ${L(r, 'm')}. The chord ${v('AC')} is ${L(chordCm, 'cm')} long, and ${v('B')} is its midpoint, so ${v('OB')} ⊥ ${v('AC')}. Find the length of ${v('OB')} in metres, ${DPW[2]}.`,
      diagram: F.fig({ pts, circles: [{ c: 'O', r }], segs: [{ a: 'A', b: 'C' }, { a: 'O', b: 'B', dash: true }, { a: 'O', b: 'C' }, { a: 'O', b: 'A' }], rights: [['C', 'B', 'O']], sides: [{ a: 'O', b: 'C', text: L(r, 'm'), away: 'A' }], dots: ['O'], names: ['O', 'A', 'B', 'C'], notes: [{ at: 'B', text: L(chordCm, 'cm'), dy: -16 }], label: 'Circle with a chord' }),
      answer: numA(ob, 2),
      prefix: `${v('OB')} =`,
      suffix: 'm',
      calc: true,
      hint: `${v('OC')} is a radius and the hypotenuse of right-angled triangle ${v('OBC')}. ${v('BC')} is half the chord: change it to metres first.`,
      steps: [`${v('BC')} = ${chordCm} ÷ 2 = ${chordCm / 2} cm = ${num(half)} m`, ...legSteps(v('OB'), r, half, 'm', 2)],
      meta: { t: 'leg', c: r, a: half, mode: 2 },
    })
  }
}
function triangleHeight(): Question {
  const equi = chance(0.6)
  for (;;) {
    const s = equi ? int(4, 30) : int(6, 30)
    const base = equi ? s : int(4, Math.floor(1.5 * s))
    const h = Math.sqrt(s * s - (base / 2) ** 2)
    if (Number.isInteger(r6(h)) || !clear(h, 2)) continue
    const u = pick(['cm', 'm'])
    const pts: Record<string, P> = { A: [0, 0], B: [base, 0], T: [base / 2, h], M: [base / 2, 0] }
    return q({
      prompt: equi
        ? `An equilateral triangle has sides ${L(s, u)} long. Find its perpendicular height, ${v('h')}, ${DPW[2]}.`
        : `An isosceles triangle has two equal sides ${L(s, u)} long and a base of ${L(base, u)}. Find its perpendicular height, ${v('h')}, ${DPW[2]}.`,
      diagram: F.fig({ pts, polys: [{ v: ['A', 'B', 'T'] }], segs: [{ a: 'T', b: 'M', dash: true }], rights: [['B', 'M', 'T']], ticks: equi ? [{ a: 'A', b: 'T', n: 1 }, { a: 'B', b: 'T', n: 1 }, { a: 'A', b: 'B', n: 1 }] : [{ a: 'A', b: 'T', n: 1 }, { a: 'B', b: 'T', n: 1 }], sides: [{ a: 'B', b: 'T', text: L(s, u) }, { a: 'A', b: 'B', text: L(base, u) }, { a: 'M', b: 'T', text: v('h'), on: true }], label: equi ? 'Equilateral triangle' : 'Isosceles triangle' }),
      answer: numA(h, 2),
      prefix: `${v('h')} =`,
      suffix: u,
      calc: true,
      hint: 'The height cuts the base in half and makes two right-angled triangles. A sloping side is the hypotenuse.',
      steps: [`Half the base = ${num(base)} ÷ 2 = ${num(base / 2)} ${u}`, ...legSteps(v('h'), s, base / 2, u, 2)],
      meta: { t: 'leg', c: s, a: base / 2, mode: 2 },
    })
  }
}
function squareFromDiagonal(): Question {
  for (;;) {
    const dcm = int(8, 60)
    const sMm = (dcm * 10) / Math.SQRT2
    if (!clear(sMm, 0)) continue
    return q({
      prompt: `A square has a diagonal ${L(dcm, 'cm')} long. How long is each side? Give your answer in millimetres, correct to the nearest millimetre.`,
      answer: numA(sMm, 0),
      suffix: 'mm',
      calc: true,
      hint: `The two sides are equal: call each one ${v('s')}. Then ${sqS(v('s'))} + ${sqS(v('s'))} = ${sqN(dcm)}.`,
      steps: [`${sqS(v('s'))} + ${sqS(v('s'))} = ${sqN(dcm)}, so 2${sqS(v('s'))} = ${dcm * dcm}`, `${sqS(v('s'))} = ${num(dcm * dcm / 2)}`, `${v('s')} = ${sqrt(num(dcm * dcm / 2))} = ${cut(dcm / Math.SQRT2)} cm ≈ ${num(round(sMm, 0))} mm`],
      meta: { t: 'square', d: dcm * 10 },
    })
  }
}
export const ex204 = (level: Level): Question => {
  if (level === 1) return legTriad()
  if (level === 2) return pick([legDp, legDp, legSurd, legSurd, rectSideMC])()
  return pick([chord, triangleHeight, triangleHeight, squareFromDiagonal])()
}

// ================================================================== 2.05 Mixed problems

function mixedMC(): Question {
  for (;;) {
    const findHyp = chance()
    const a = int(5, 50)
    const b = findHyp ? int(5, 50) : int(a + 3, a + 40)
    // b is the hypotenuse when finding a shorter side
    const val = findHyp ? Math.sqrt(a * a + b * b) : Math.sqrt(b * b - a * a)
    const other = findHyp ? Math.sqrt(Math.abs(a * a - b * b)) : Math.sqrt(a * a + b * b)
    if (a === b || Number.isInteger(r6(val)) || !clear(val, 1)) continue
    const u = pick(['cm', 'm'])
    const k = pick(['k', 'x', 'y', 'w', 'n'])
    const d = findHyp ? rtFig(a, b, [L(a, u), L(b, u), v(k)], null) : rtFig(a, val, [L(a, u), v(k), L(b, u)], null)
    const o = numOptions(round(val, 1), [round(other, 1), findHyp ? a + b : b - a, round(val + (findHyp ? 4 : -4), 1)], (x) => `${num(round(x, 1))} ${u}`)
    return q({
      prompt: `What is the length of ${v(k)}?`,
      ...d,
      answer: mcA(o.correct, o.wrong),
      calc: true,
      hint: `Is ${v(k)} the hypotenuse (opposite the right angle) or a shorter side? Add the squares to find the hypotenuse; subtract them to find a shorter side.`,
      steps: findHyp ? hypSteps(v(k), a, b, u, 1) : legSteps(v(k), b, a, u, 1),
      meta: findHyp ? { t: 'hyp', a, b, mode: 1, mc: true } : { t: 'leg', c: b, a, mode: 1, mc: true },
    })
  }
}
function mixedDp(): Question {
  for (;;) {
    const findHyp = chance()
    const dec = chance(0.4)
    const a = dec ? int(15, 250) / 10 : int(4, 99)
    const c = dec ? int(Math.round(a * 10) + 5, Math.round(a * 10) + 300) / 10 : int(a + 2, a + 80)
    const val = findHyp ? Math.sqrt(a * a + c * c) : Math.sqrt(c * c - a * a)
    if (a === c || Number.isInteger(r6(val)) || !clear(val, 1) || (!findHyp && val < c / 6)) continue
    const u = dec ? pick(['cm', 'm']) : pick(UNITS)
    if (findHyp) return hypQuestion(a, c, u, 1)
    return legQuestion(c, a, u, 1)
  }
}
function contextProblem(kind = pick(['ladder', 'tv', 'ship', 'walk'] as const)): Question {
  for (;;) {
    if (kind === 'ladder') {
      const lad = int(30, 90) / 10
      const foot = int(8, 25) / 10
      const h = Math.sqrt(lad * lad - foot * foot)
      if (!clear(h, 2)) continue
      return q({
        prompt: `A ${num(lad)} m ladder leans against a wall. Its foot is ${num(foot)} m from the bottom of the wall. How far up the wall does it reach, ${DPW[2]}?`,
        answer: numA(h, 2),
        suffix: 'm',
        calc: true,
        hint: 'The ladder is the hypotenuse. The height up the wall is a shorter side.',
        steps: legSteps(v('h'), lad, foot, 'm', 2),
        meta: { t: 'leg', c: lad, a: foot, mode: 2 },
      })
    }
    if (kind === 'tv') {
      const w = int(60, 160)
      const h = Math.round(w * pick([0.5625, 0.6, 0.56])) + int(-2, 2)
      const dgl = Math.sqrt(w * w + h * h)
      if (!clear(dgl, 0)) continue
      return q({
        prompt: `A TV screen’s size is the length of its diagonal. A screen is ${w} cm wide and ${h} cm high. What is its size, to the nearest centimetre?`,
        answer: numA(dgl, 0),
        suffix: 'cm',
        calc: true,
        hint: 'The width and height are the shorter sides of a right-angled triangle. The diagonal is the hypotenuse.',
        steps: hypSteps(v('d'), w, h, 'cm', 0),
        meta: { t: 'hyp', a: w, b: h, mode: 0 },
      })
    }
    const a = int(15, 95)
    const b = int(15, 95)
    const dist = Math.sqrt(a * a + b * b)
    if (a === b || !clear(dist, 1) || Number.isInteger(r6(dist))) continue
    if (kind === 'ship') {
      const [d1, d2] = pick([['west', 'north'], ['east', 'south'], ['north', 'east'], ['south', 'west']] as const)
      return q({
        prompt: `A ship sails ${a} nautical miles ${d1} and then ${b} nautical miles ${d2}. How far is it from its starting point, ${DPW[1]}?`,
        answer: numA(dist, 1),
        suffix: 'nautical miles',
        calc: true,
        hint: `${d1[0].toUpperCase() + d1.slice(1)} and ${d2} are at right angles, so the two legs of the trip are the shorter sides of a right-angled triangle.`,
        steps: hypSteps(v('d'), a, b, 'nautical miles', 1),
        meta: { t: 'hyp', a, b, mode: 1 },
      })
    }
    const [n1, n2] = sample(['Ava', 'Kai', 'Mia', 'Leo', 'Zara', 'Noah', 'Isla', 'Arjun'], 2)
    const km1 = a / 10
    const km2 = b / 10
    const d = Math.sqrt(km1 * km1 + km2 * km2)
    if (!clear(d, 1)) continue
    return q({
      prompt: `${n1} walks ${num(km1)} km due east from a gate, ${v('G')}. ${n2} walks ${num(km2)} km due south from ${v('G')}. How far apart are they, ${DPW[1]}?`,
      answer: numA(d, 1),
      suffix: 'km',
      calc: true,
      hint: 'Draw a diagram: east and south are at right angles. The distance between them is the hypotenuse.',
      steps: hypSteps(v('d'), km1, km2, 'km', 1),
      meta: { t: 'hyp', a: km1, b: km2, mode: 1 },
    })
  }
}
function planeDistance(): Question {
  for (;;) {
    const surd = chance(0.6)
    let dx: number
    let dy: number
    if (surd) {
      dx = int(2, 7)
      dy = int(2, 7)
      if (isSqInt(dx * dx + dy * dy)) continue
    } else [dx, dy] = pick([[3, 4], [4, 3], [6, 8], [8, 6]])
    const ax = int(-5, 5 - dx)
    const ay = chance() ? int(-5, 5 - dy) : int(-5 + dy, 5)
    const a: P = [ax, ay]
    const b: P = [ax + dx, ay + (ay + dy <= 5 && chance() ? dy : -dy)]
    if (b[1] < -5 || b[1] > 5) continue
    const d2 = dx * dx + dy * dy
    return q({
      prompt: `Use Pythagoras’ theorem to find the distance between the two points${surd ? ', as a surd' : ''}.`,
      diagram: G.plane({ xmin: -6, xmax: 6, ymin: -6, ymax: 6, segments: [{ a, b, legs: true }], points: [{ x: a[0], y: a[1], label: `(${num(a[0])}, ${num(a[1])})`, pos: 'w' }, { x: b[0], y: b[1], label: `(${num(b[0])}, ${num(b[1])})`, pos: 'e' }] }),
      answer: surd ? numA(d2) : numA(Math.sqrt(d2)),
      prefix: surd ? `${v('d')} = √` : `${v('d')} =`,
      suffix: 'units',
      hint: 'Count the horizontal and vertical sides of the dashed right-angled triangle (or subtract the coordinates). The distance is the hypotenuse.',
      steps: [`Horizontal side = ${dx}, vertical side = ${dy}`, ...hypSteps(v('d'), dx, dy, 'units', surd ? 'surd' : 'exact').slice(1)],
      meta: { t: 'plane', a, b, mode: surd ? 'surd' : 'exact' },
    })
  }
}
/** a trapezium with two right angles: find the sloping side */
function trapezium(): Question {
  for (;;) {
    const top = int(10, 60)
    const bottom = top + int(4, 30)
    const h = int(8, 60)
    const u = pick(['cm', 'mm', 'm'])
    const slant = Math.sqrt((bottom - top) ** 2 + h * h)
    if (!clear(slant, 2) || bottom > 3.5 * h || h > 3 * bottom) continue
    const N = pick([['P', 'Q', 'R', 'S'], ['A', 'B', 'C', 'D'], ['K', 'L', 'M', 'N'], ['W', 'X', 'Y', 'Z']])
    // N[0] top left (sloping side down to N[3]), N[1] top right, N[2] bottom right, N[3] bottom left
    const sideways = chance(0.4)
    const pts: Record<string, P> = sideways
      ? { [N[0]]: [0, bottom - top], [N[1]]: [0, bottom], [N[2]]: [h, bottom], [N[3]]: [h, 0] }
      : { [N[0]]: [bottom - top, h], [N[1]]: [bottom, h], [N[2]]: [bottom, 0], [N[3]]: [0, 0] }
    const exact = Number.isInteger(r6(slant))
    return q({
      prompt: `Find the length of ${v(N[0] + N[3])} in this trapezium, correct to two decimal places where necessary.`,
      diagram: F.fig({ pts, polys: [{ v: [...N] }], rights: [[N[0], N[1], N[2]], [N[1], N[2], N[3]]], sides: [{ a: N[0], b: N[1], text: L(top, u) }, { a: N[1], b: N[2], text: L(h, u) }, { a: N[2], b: N[3], text: L(bottom, u) }], names: [...N], label: 'Trapezium' }),
      answer: exact ? numA(r6(slant)) : numA(slant, 2),
      prefix: `${v(N[0] + N[3])} =`,
      suffix: u,
      calc: true,
      hint: `Draw a line from ${v(N[0])} at right angles to ${v(N[2] + N[3])}. It makes a right-angled triangle with a height of ${num(h)} ${u}. The other short side is the difference of the parallel sides.`,
      steps: [`The right-angled triangle has a height of ${num(h)} ${u} and a base of ${num(bottom)} ${MINUS} ${num(top)} = ${num(bottom - top)} ${u}.`, ...hypSteps(v(N[0] + N[3]), h, bottom - top, u, exact ? 'exact' : 2)],
      meta: { t: 'hyp', a: h, b: bottom - top, mode: exact ? 'exact' : 2, trap: [top, bottom, h] },
    })
  }
}
/** two right-angled triangles joined along a side: the hypotenuse of the first is a shorter side of the second */
function twoStep(): Question {
  for (;;) {
    const p = int(3, 20)
    const qq = int(3, 20)
    const h1sq = p * p + qq * qq
    if (isSqInt(h1sq) && chance(0.7)) continue
    const findHyp = chance(0.6)
    // second triangle: shorter sides BD and r (find the hypotenuse y), or hypotenuse y and shorter side BD (find x as a surd)
    const r = findHyp ? int(3, 25) : 0
    const y = findHyp ? 0 : Math.ceil(Math.sqrt(h1sq)) + int(2, 15)
    const y2 = findHyp ? h1sq + r * r : y * y
    const x2 = y2 - h1sq
    if (findHyp && !clear(Math.sqrt(y2), 2)) continue
    if (!findHyp && isSqInt(x2)) continue
    const leg2 = findHyp ? r : Math.sqrt(x2)
    const h1 = Math.sqrt(h1sq)
    // A is the right angle of the first triangle, B is p above it and D is qq along; C makes ∠BDC = 90° with DC = leg2
    const A: P = [0, 0]
    const B: P = [0, p]
    const D: P = [qq, 0]
    const ux = (D[0] - B[0]) / h1
    const uy = (D[1] - B[1]) / h1
    const c1: P = [D[0] - uy * leg2, D[1] + ux * leg2]
    const c2: P = [D[0] + uy * leg2, D[1] - ux * leg2]
    const C = c1[0] ** 2 + c1[1] ** 2 > c2[0] ** 2 + c2[1] ** 2 ? c1 : c2
    const u = pick(['cm', 'm'])
    const sides: NonNullable<F.Fig['sides']> = [{ a: 'A', b: 'B', text: L(p, u) }, { a: 'A', b: 'D', text: L(qq, u) }]
    if (findHyp) sides.push({ a: 'D', b: 'C', text: L(r, u) }, { a: 'B', b: 'C', text: v('y') })
    else sides.push({ a: 'D', b: 'C', text: v('x') }, { a: 'B', b: 'C', text: L(y, u) })
    return q({
      prompt: findHyp ? `Find the value of ${v('y')}, ${DPW[2]}.` : `Find the value of ${v('x')} as a surd.`,
      diagram: F.fig({ pts: { A, B, C, D }, polys: [{ v: ['A', 'D', 'B'] }, { v: ['B', 'D', 'C'] }], rights: [['B', 'A', 'D'], ['B', 'D', 'C']], sides, names: ['A', 'B', 'C', 'D'], label: 'Two right-angled triangles' }),
      answer: findHyp ? numA(Math.sqrt(y2), 2) : numA(x2),
      prefix: findHyp ? `${v('y')} =` : `${v('x')} = √`,
      suffix: u,
      calc: true,
      hint: `First find ${v('BD')} in triangle ${v('ABD')}. Leave it as a surd (or keep ${sqS(v('BD'))}), then use it in triangle ${v('BCD')}.`,
      steps: [
        `In △${v('ABD')}: ${sqS(v('BD'))} = ${sqN(p)} + ${sqN(qq)} = ${h1sq}, so ${v('BD')} = ${sqrt(h1sq)}${isSqInt(h1sq) ? ` = ${Math.sqrt(h1sq)}` : ''} ${u}`,
        findHyp
          ? `In △${v('BCD')}: ${sqS(v('y'))} = (${sqrt(h1sq)})<sup>2</sup> + ${sqN(r)} = ${h1sq} + ${r * r} = ${y2}`
          : `In △${v('BCD')}: ${sqN(y)} = (${sqrt(h1sq)})<sup>2</sup> + ${sqS(v('x'))}, so ${sqS(v('x'))} = ${y2} ${MINUS} ${h1sq} = ${x2}`,
        findHyp ? `${v('y')} = ${sqrt(y2)} = ${cut(Math.sqrt(y2))} ≈ ${num(round(Math.sqrt(y2), 2), 2)} ${u}` : `${v('x')} = ${sqrt(x2)} ${u}`,
      ],
      meta: { t: 'twostep', p, q: qq, r, y, findHyp },
    })
  }
}
function rectangleSide(): Question {
  for (;;) {
    const dgl = int(100, 400)
    const s = int(Math.round(dgl * 0.4), dgl - 10)
    const o = Math.sqrt(dgl * dgl - s * s)
    if (!clear(o, 0) || Number.isInteger(r6(o))) continue
    return q({
      prompt: `The diagonal of a rectangle is ${dgl} mm long. One side is ${s} mm long. Find the length of the other side, correct to the nearest millimetre.`,
      answer: numA(o, 0),
      suffix: 'mm',
      calc: true,
      hint: 'The diagonal is the hypotenuse of a right-angled triangle made by two sides of the rectangle.',
      steps: legSteps(v('w'), dgl, s, 'mm', 0),
      meta: { t: 'leg', c: dgl, a: s, mode: 0 },
    })
  }
}
function twoWires(): Question {
  for (;;) {
    const w1 = int(100, 200) / 10
    const g1 = int(30, 80) / 10
    const g2 = int(40, 200) / 10
    const h2 = r6(w1 * w1 - g1 * g1)
    const w2 = Math.sqrt(h2 + g2 * g2)
    if (!clear(w2, 1) || Math.abs(g1 - g2) < 1) continue
    const h = Math.sqrt(h2)
    const pts: Record<string, P> = { T: [0, h], B: [0, 0], L: [-g1, 0], R: [g2, 0] }
    return q({
      prompt: `A power pole is held upright by two wires, as shown. Find the length of the second wire, ${DPW[1]}.`,
      diagram: F.fig({ pts, polys: [{ v: ['T', 'L', 'R'] }], segs: [{ a: 'T', b: 'B', dash: true }, { a: 'L', b: 'B' }, { a: 'B', b: 'R' }], rights: [['L', 'B', 'T']], sides: [{ a: 'T', b: 'L', text: L(w1, 'm') }, { a: 'L', b: 'B', text: L(g1, 'm'), away: 'T' }, { a: 'B', b: 'R', text: L(g2, 'm'), away: 'T' }, { a: 'T', b: 'R', text: 'wire' }], label: 'Pole and two wires' }),
      answer: numA(w2, 1),
      suffix: 'm',
      calc: true,
      hint: 'First use the left triangle to find the height of the pole (as a surd, or keep its square). Then use the right triangle.',
      steps: [`Height²: ${sqS(v('h'))} = ${sqN(w1)} ${MINUS} ${sqN(g1)} = ${num(h2)}`, `Second wire: ${sqS(v('w'))} = ${num(h2)} + ${sqN(g2)} = ${num(r6(h2 + g2 * g2))}`, `${v('w')} = ${sqrt(num(r6(h2 + g2 * g2)))} = ${cut(w2)} ≈ ${num(round(w2, 1), 1)} m`],
      meta: { t: 'wires', w1, g1, g2 },
    })
  }
}
export const ex205 = (level: Level): Question => {
  if (level === 1) return mixedMC()
  if (level === 2) return pick([mixedDp, mixedDp, contextProblem, contextProblem, planeDistance])()
  return pick([trapezium, twoStep, twoStep, rectangleSide, twoWires])()
}

/** an exact answer, either side: a whole number, or a surd */
function mixedExact(): Question {
  for (;;) {
    const findHyp = chance()
    const a = int(4, 40)
    const c = int(a + 2, a + 40)
    const sq = findHyp ? a * a + c * c : c * c - a * a
    const u = pick(UNITS)
    const mode: Mode = isSqInt(sq) ? 'exact' : 'surd'
    if (mode === 'surd' && Math.sqrt(sq) < Math.max(a, c) / 6) continue
    const qn = findHyp ? hypQuestion(a, c, u, mode) : legQuestion(c, a, u, mode)
    return { ...qn, prompt: qn.prompt.replace(/,? as a surd/, '').replace(/\.$/, '') + `, as an exact value${mode === 'surd' ? ' (a surd)' : ''}.` }
  }
}

// ================================================================== 2.06 Testing for right-angled triangles

/** three sides that make a right-angled triangle, or a near miss that doesn't */
function convSides(dec: boolean, right: boolean): [number, number, number] {
  for (;;) {
    if (!right && chance(0.2)) {
      // isosceles: the equal sides can never fit a whole-number or one-place hypotenuse exactly
      const e = dec ? int(15, 95) / 10 : int(3, 40)
      const h = dec ? round(e * Math.SQRT2, 1) : Math.round(e * Math.SQRT2)
      return shuffle([e, e, h]) as [number, number, number]
    }
    const t = triad(dec ? 30 : 100, dec)
    if (right) return shuffle(t) as [number, number, number]
    const s = [...t] as [number, number, number]
    const i = int(0, 2)
    s[i] = r6(s[i] + (dec ? pick([0.1, 0.2, -0.1, -0.2]) : pick([1, 2, -1, -2])))
    const [a, b, c] = [...s].sort((x, y) => x - y)
    if (a <= 0 || a + b <= c + 1e-9 || Math.abs(a * a + b * b - c * c) < 1e-9) continue
    return shuffle(s) as [number, number, number]
  }
}
const isRight = (s: number[]) => {
  const [a, b, c] = [...s].sort((x, y) => x - y)
  return Math.abs(r6(a * a + b * b) - r6(c * c)) < 1e-9
}
function convSteps(s: number[]): string[] {
  const [a, b, c] = [...s].sort((x, y) => x - y)
  const lhs = r6(c * c)
  const rhs = r6(a * a + b * b)
  return [
    `Square the longest side: ${sqN(c)} = ${num(lhs)}`,
    `Square the two shorter sides and add: ${sqN(a)} + ${sqN(b)} = ${num(r6(a * a))} + ${num(r6(b * b))} = ${num(rhs)}`,
    lhs === rhs ? `They are equal, so the sides follow ${ex2()} and the triangle is right-angled.` : `${num(lhs)} ≠ ${num(rhs)}, so the triangle is not right-angled.`,
  ]
}
const ex2 = () => `${sqS(v('c'))} = ${sqS(v('a'))} + ${sqS(v('b'))}`
function testRight(dec: boolean): Question {
  const right = chance()
  const s = convSides(dec, right)
  const [A, B, C] = F.sssPts(s[0], s[1], s[2], pick(ROTS))
  return q({
    prompt: 'Is this triangle right-angled?',
    diagram: F.fig({ pts: { A, B, C }, polys: [{ v: ['A', 'B', 'C'] }], sides: [{ a: 'B', b: 'C', text: num(s[0]) }, { a: 'C', b: 'A', text: num(s[1]) }, { a: 'A', b: 'B', text: num(s[2]) }], label: 'Triangle' }),
    answer: mcFixedA(['Yes', 'No'], right ? 'Yes' : 'No'),
    calc: true,
    hint: 'Square the longest side. Then square the other two sides and add. If the results are equal, the triangle is right-angled.',
    steps: convSteps(s),
    meta: { t: 'conv', sides: s },
  })
}
function whichSet(): Question {
  const notVersion = chance(0.4)
  const u = pick(UNITS)
  const dec = chance(0.25)
  const odd = convSides(dec, !notVersion)
  const others: number[][] = []
  while (others.length < 3) {
    const s = convSides(dec, notVersion)
    const key = [...s].sort((x, y) => x - y).join()
    if (![odd, ...others].some((o) => [...o].sort((x, y) => x - y).join() === key)) others.push(s)
  }
  const fmt = (s: number[]) => [...s].sort((x, y) => x - y).map((x) => num(x)).join(', ')
  const unitWord = { mm: 'millimetres', cm: 'centimetres', m: 'metres' }[u]
  return q({
    prompt: `These are the side lengths of four triangles, in ${unitWord}. Which set ${notVersion ? 'does <b>not</b> make' : 'makes'} a right-angled triangle?`,
    answer: mcA(fmt(odd), others.map(fmt)),
    calc: true,
    hint: 'For each set, compare the square of the longest side with the sum of the squares of the other two.',
    steps: [...[odd, ...others].map((s) => {
      const [a, b, c] = [...s].sort((x, y) => x - y)
      return `${fmt(s)}: ${sqN(c)} = ${num(r6(c * c))}, ${sqN(a)} + ${sqN(b)} = ${num(r6(a * a + b * b))} → ${isRight(s) ? 'right-angled' : 'not right-angled'}`
    })],
    meta: { t: 'convset', not: notVersion, sets: [odd, ...others] },
  })
}
function rightAngleWhere(): Question {
  const [a, b, c] = triad(100, chance(0.2))
  const N = shuffle(pick(NAMESETS))
  // c is opposite N[0]; a and b are the sides from N[0]
  const u = pick(UNITS)
  const facts = shuffle([`${v(sideName(N[1], N[2]))} = ${L(c, u)}`, `${v(sideName(N[0], N[1]))} = ${L(a, u)}`, `${v(sideName(N[0], N[2]))} = ${L(b, u)}`])
  const tri = [...N].sort().join('')
  const sorted = [...N].sort()
  return q({
    prompt: `In △${v(tri)}, ${facts[0]}, ${facts[1]} and ${facts[2]}. The triangle is right-angled. At which vertex is the right angle?`,
    answer: mcFixedA(sorted.map((x) => `∠${v(x)}`), `∠${v(N[0])}`),
    calc: true,
    hint: 'The right angle is opposite the longest side (the hypotenuse).',
    steps: [`${sqN(c)} = ${num(r6(c * c))} and ${sqN(a)} + ${sqN(b)} = ${num(r6(a * a + b * b))}, so the triangle is right-angled with ${v(sideName(N[1], N[2]))} as the hypotenuse.`, `The right angle is opposite ${v(sideName(N[1], N[2]))}, at ${v(N[0])}.`],
    meta: { t: 'where', right: N[0], sides: { [sideName(N[1], N[2])]: c, [sideName(N[0], N[1])]: a, [sideName(N[0], N[2])]: b } },
  })
}
function poleUpright(): Question {
  const right = chance()
  for (;;) {
    let s = convSides(true, right)
    const [g, h, w] = [...s].sort((x, y) => x - y)
    // the wire is the longest side; the pole is the taller of the other two
    if (w > 12 || h > 9) continue
    s = [h, g, w]
    const cosB = (g * g + h * h - w * w) / (2 * g * h)
    const Bang = Math.acos(cosB)
    const pts: Record<string, P> = { B: [0, 0], A: [g, 0], T: [h * Math.cos(Bang), h * Math.sin(Bang)] }
    return q({
      prompt: `A pole ${L(h, 'm')} tall is held by a wire ${L(w, 'm')} long. The wire is fixed to the ground ${L(g, 'm')} from the foot of the pole. Is the pole standing at right angles to the ground?`,
      diagram: F.fig({ pts, polys: [{ v: ['B', 'A', 'T'] }], sides: [{ a: 'B', b: 'T', text: L(h, 'm') }, { a: 'B', b: 'A', text: L(g, 'm') }, { a: 'A', b: 'T', text: L(w, 'm') }], label: 'Pole and wire' }),
      answer: mcFixedA(['Yes', 'No'], right ? 'Yes' : 'No'),
      calc: true,
      hint: 'The pole is upright only if the triangle is right-angled. Test the three lengths with Pythagoras’ theorem.',
      steps: [...convSteps(s).slice(0, 2), right ? 'They are equal, so the triangle is right-angled: the pole is upright.' : 'They are not equal, so there is no right angle: the pole is not upright.'],
      meta: { t: 'conv', sides: s },
    })
  }
}
function showNotRight(): Question {
  const s = convSides(false, false)
  const [a, b, c] = [...s].sort((x, y) => x - y)
  const nm = pick(['Jai', 'Priya', 'Tom', 'Mele', 'Sofia', 'Hamish'])
  const right = `${sqN(c)} = ${c * c}, but ${sqN(a)} + ${sqN(b)} = ${a * a + b * b}. They are not equal.`
  return q({
    prompt: `${nm} drew a triangle with sides ${L(a, 'cm')}, ${L(b, 'cm')} and ${L(c, 'cm')}. Which working shows that it is <b>not</b> right-angled?`,
    answer: mcA(right, [
      `${num(a)} + ${num(b)} = ${a + b}, which is not ${c}.`,
      `${sqN(a)} = ${a * a}, but ${sqN(b)} + ${sqN(c)} = ${b * b + c * c}. They are not equal.`,
      `${sqN(c)} = ${c * c}, and ${sqN(a)} + ${sqN(b)} + ${sqN(c)} is not 0.`,
    ]),
    hint: 'Pythagoras’ theorem compares the square of the <b>longest</b> side with the sum of the squares of the other two.',
    steps: convSteps(s),
    meta: { t: 'shownot', sides: s },
  })
}
export const ex206 = (level: Level): Question => {
  if (level === 1) return testRight(false)
  if (level === 2) return pick([() => testRight(true), whichSet, whichSet])()
  return pick([rightAngleWhere, poleUpright, showNotRight])()
}

// ================================================================== 2.07 Pythagorean triads

const set3 = (s: number[]) => `{${s.map((x) => num(x)).join(', ')}}`
function wholeSet(triadWanted: boolean): number[] {
  for (;;) {
    if (triadWanted) {
      const t = triad(130)
      return [...t].sort((x, y) => x - y)
    }
    const s = convSides(false, false)
    if (s[0] !== s[1] && s[1] !== s[2] && s[0] !== s[2]) return [...s].sort((x, y) => x - y)
  }
}
function isTriad(): Question {
  const yes = chance()
  const s = wholeSet(yes)
  return q({
    prompt: `Is ${set3(s)} a Pythagorean triad?`,
    answer: mcFixedA(['Yes', 'No'], yes ? 'Yes' : 'No'),
    calc: true,
    hint: 'Square the largest number. Square the other two and add. A Pythagorean triad gives equal results.',
    steps: [`${sqN(s[2])} = ${s[2] * s[2]}`, `${sqN(s[0])} + ${sqN(s[1])} = ${s[0] * s[0]} + ${s[1] * s[1]} = ${s[0] * s[0] + s[1] * s[1]}`, yes ? `They are equal, so ${set3(s)} is a Pythagorean triad.` : `They are not equal, so ${set3(s)} is not a Pythagorean triad.`],
    meta: { t: 'triad', set: s },
  })
}
function whichTriad(): Question {
  const right = wholeSet(true)
  const wrong: number[][] = []
  while (wrong.length < 3) {
    const w = wholeSet(false)
    if (!wrong.some((x) => x.join() === w.join())) wrong.push(w)
  }
  return q({
    prompt: 'Which of these is a Pythagorean triad?',
    answer: mcA(set3(right), wrong.map(set3)),
    calc: true,
    hint: 'Test each set: does (largest)² = (smaller)² + (middle)²?',
    steps: [right, ...wrong].map((s) => `${set3(s)}: ${sqN(s[2])} = ${s[2] * s[2]}, ${sqN(s[0])} + ${sqN(s[1])} = ${s[0] * s[0] + s[1] * s[1]} → ${s === right ? 'triad' : 'not a triad'}`),
    meta: { t: 'triadmc', right, wrong },
  })
}
function multiplyTriad(): Question {
  const base = pick(BASE.filter((t) => t[2] <= 41))
  const kind = pick(['whole', 'whole', 'half', 'decimal'] as const)
  const k = kind === 'whole' ? int(2, 9) : kind === 'half' ? 0.5 : pick([0.1, 0.2, 1.5, 2.5])
  const out = base.map((x) => r6(x * k))
  const kTxt = kind === 'half' ? frac(1, 2) : num(k)
  return q({
    prompt: `${set3(base)} is a Pythagorean triad. Multiply each number by ${kTxt}. What are the three new numbers?${kind === 'whole' ? '' : ' (They still follow Pythagoras’ theorem, but they are not a triad because they are not all whole numbers.)'}`,
    answer: { kind: 'nums', values: out },
    calc: kind !== 'whole',
    hint: `Multiply each of ${base.join(', ')} by ${kTxt}. Type the three numbers separated by commas.`,
    steps: [`${kTxt} ${TIMES} ${set3(base)} = ${set3(out)}`, `Check: ${sqN(out[2])} = ${num(r6(out[2] ** 2))} and ${sqN(out[0])} + ${sqN(out[1])} = ${num(r6(out[0] ** 2 + out[1] ** 2))}`],
    meta: { t: 'mult', base, k },
  })
}
function missingTriad(): Question {
  const t = [...triad(100)].sort((x, y) => x - y)
  const gap = int(0, 2)
  const shown = t.map((x, i) => (i === gap ? '?' : num(x)))
  return q({
    prompt: `Find the missing number in the Pythagorean triad {${shown.join(', ')}}.`,
    answer: numA(t[gap]),
    calc: true,
    hint: gap === 2 ? 'The missing number is the largest: it is the hypotenuse.' : 'The largest number is the hypotenuse, so subtract the squares.',
    steps: gap === 2 ? hypSteps('?', t[0], t[1], '', 'exact').slice(1) : legSteps('?', t[2], t[1 - gap], '', 'exact').slice(1),
    meta: { t: 'missing', set: t, gap },
  })
}
function triadKind(): Question {
  // decimal sets always follow the theorem here, so exactly one reason is true
  const kind = pick(['yes', 'decimal', 'no'] as const)
  let s: number[]
  if (kind === 'yes') s = wholeSet(true)
  else if (kind === 'no') s = wholeSet(false)
  else s = [...convSides(true, true)].sort((x, y) => x - y)
  const abc = `${sqS(v('a'))} + ${sqS(v('b'))}`
  const opts = ['Yes', `No: ${abc} ≠ ${sqS(v('c'))}`, 'No: not all whole numbers']
  const right = isRight(s)
  const whole = s.every(Number.isInteger)
  return q({
    prompt: `A Pythagorean triad {${v('a')}, ${v('b')}, ${v('c')}} is three whole numbers with ${abc} = ${sqS(v('c'))}. Is ${set3(s)} a Pythagorean triad?`,
    answer: mcFixedA(opts, right && whole ? opts[0] : right ? opts[2] : opts[1]),
    calc: true,
    hint: 'Check two things: do the numbers follow Pythagoras’ theorem, and are they all whole numbers?',
    steps: [`${sqN(s[2])} = ${num(r6(s[2] ** 2))}, ${sqN(s[0])} + ${sqN(s[1])} = ${num(r6(s[0] ** 2 + s[1] ** 2))}: ${right ? 'they follow' : 'they don’t follow'} Pythagoras’ theorem.`, right && !whole ? 'But they are not all whole numbers, so this is not a Pythagorean triad.' : right ? 'They are all whole numbers, so this is a Pythagorean triad.' : 'So this is not a Pythagorean triad.'],
    meta: { t: 'triadkind', set: s },
  })
}
const half = (s: string) => `${frac(1, 2)}(${s})`
function formulaTriad(): Question {
  const a = pick([3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 25])
  const b = (a * a - 1) / 2
  const c = (a * a + 1) / 2
  return q({
    prompt: `For an odd number ${v('a')}, the formulas ${v('b')} = ${half(`${sqS(v('a'))} ${MINUS} 1`)} and ${v('c')} = ${half(`${sqS(v('a'))} + 1`)} give a Pythagorean triad {${v('a')}, ${v('b')}, ${v('c')}}. Find ${v('b')} and ${v('c')} when ${v('a')} = ${a}.`,
    answer: { kind: 'nums', values: [b, c] },
    calc: true,
    hint: `Square ${a} first, then subtract (or add) 1, then halve.`,
    steps: [`${sqN(a)} = ${a * a}`, `${v('b')} = ${half(`${a * a} ${MINUS} 1`)} = ${b}, ${v('c')} = ${half(`${a * a} + 1`)} = ${c}`, `Check: ${sqN(a)} + ${sqN(b)} = ${a * a + b * b} = ${sqN(c)} ✓`],
    meta: { t: 'formula', a },
  })
}
function evenFormula(): Question {
  const a = pick([4, 6, 8, 10, 12, 14, 16, 20])
  const b = (a * a - 1) / 2
  const c = (a * a + 1) / 2
  return q({
    prompt: `The formulas ${v('b')} = ${half(`${sqS(v('a'))} ${MINUS} 1`)} and ${v('c')} = ${half(`${sqS(v('a'))} + 1`)} give ${set3([a, b, c])} when ${v('a')} = ${a}. These follow Pythagoras’ theorem but are not all whole numbers. Multiply each number by 2 to make a Pythagorean triad. What is it?`,
    answer: { kind: 'nums', values: [2 * a, 2 * b, 2 * c] },
    hint: 'Double each number. Type the three numbers separated by commas.',
    steps: [`2 ${TIMES} ${set3([a, b, c])} = ${set3([2 * a, 2 * b, 2 * c])}`, `Check: ${sqN(2 * a)} + ${sqN(2 * b)} = ${4 * a * a + 4 * b * b} = ${sqN(2 * c)} ✓`],
    meta: { t: 'formulaeven', a },
  })
}
export const ex207 = (level: Level): Question => {
  if (level === 1) return pick([isTriad, isTriad, whichTriad])()
  if (level === 2) return pick([multiplyTriad, missingTriad, missingTriad, triadKind])()
  return pick([formulaTriad, formulaTriad, evenFormula, triadKind])()
}

// ================================================================== 2.08 Pythagoras' theorem problems

/** a vertical post on the ground with a sloping line from its top (or a point on it) to the ground */
function postFig(h: number, d: number, labels: { h?: string; d?: string; s?: string }, left = chance()): string {
  const s = left ? -1 : 1
  return F.fig({
    pts: { B: [0, 0], T: [0, h], G: [s * d, 0], g1: [-s * d * 0.25, 0], g2: [s * d * 1.15, 0], top: [0, h * 1.12] },
    polys: [{ v: ['B', 'T', 'G'] }],
    segs: [{ a: 'g1', b: 'g2' }, { a: 'B', b: 'top' }],
    rights: [['G', 'B', 'T']],
    sides: [
      ...(labels.h ? [{ a: 'B', b: 'T', text: labels.h, away: 'G' }] : []),
      ...(labels.d ? [{ a: 'B', b: 'G', text: labels.d, away: 'T' }] : []),
      ...(labels.s ? [{ a: 'T', b: 'G', text: labels.s, away: 'B' }] : []),
    ],
    label: 'Post and sloping line',
  })
}
function wireProblems(): Question {
  for (;;) {
    if (chance()) {
      const h = int(25, 90) / 10
      const d = int(10, 45) / 10
      const w = Math.sqrt(h * h + d * d)
      if (!clear(w, 1)) continue
      return q({
        prompt: `A wire runs from a point ${L(h, 'm')} up a flagpole to the ground, ${L(d, 'm')} from the foot of the pole. How long is the wire, ${DPW[1]}?`,
        diagram: postFig(h, d, { h: L(h, 'm'), d: L(d, 'm'), s: 'wire' }),
        answer: numA(w, 1),
        suffix: 'm',
        calc: true,
        hint: 'The wire is the hypotenuse; the pole and the ground are the shorter sides.',
        steps: hypSteps(v('w'), h, d, 'm', 1),
        meta: { t: 'hyp', a: h, b: d, mode: 1 },
      })
    }
    const w = int(12, 45)
    const d = int(4, Math.floor(w * 0.7))
    const h = Math.sqrt(w * w - d * d)
    if (!clear(h, 1) || Number.isInteger(r6(h))) continue
    return q({
      prompt: `A ${w} m wire is tied to the top of a tower and to the ground ${d} m from the base of the tower. How tall is the tower, correct to the nearest 0.1 m?`,
      diagram: postFig(h, d, { h: v('h'), d: L(d, 'm'), s: L(w, 'm') }),
      answer: numA(h, 1),
      prefix: `${v('h')} =`,
      suffix: 'm',
      calc: true,
      hint: 'The wire is the hypotenuse, so subtract the squares.',
      steps: legSteps(v('h'), w, d, 'm', 1),
      meta: { t: 'leg', c: w, a: d, mode: 1 },
    })
  }
}
function shortcut(): Question {
  for (;;) {
    const a = int(60, 250)
    const b = int(60, 250)
    const c = Math.sqrt(a * a + b * b)
    if (!clear(c, 0) || a === b) continue
    const nm = pick(['Mia', 'Oscar', 'Leila', 'Ethan', 'Grace', 'Tane'])
    const ask = pick(['direct', 'further'] as const)
    const pts: Record<string, P> = { A: [0, b], B: [a, b], C: [a, 0] }
    return q({
      prompt:
        `${nm} walks through a park from gate ${v('A')} to the fountain at ${v('B')}, then to gate ${v('C')}. ` +
        (ask === 'direct' ? 'How far is it straight across the park from A to C, to the nearest metre?' : `How much further is the walk through ${v('B')} than the straight path from ${v('A')} to ${v('C')}, to the nearest metre?`),
      diagram: F.fig({ pts, polys: [{ v: ['A', 'B', 'C'] }], rights: [['A', 'B', 'C']], sides: [{ a: 'A', b: 'B', text: L(a, 'm') }, { a: 'B', b: 'C', text: L(b, 'm') }], names: ['A', 'B', 'C'], label: 'Park paths' }),
      answer: ask === 'direct' ? numA(c, 0) : numA(a + b - c, 0),
      suffix: 'm',
      calc: true,
      hint: ask === 'direct' ? `${v('AC')} is the hypotenuse of triangle ${v('ABC')}.` : `Find ${v('AC')} first (to the nearest metre), then subtract it from ${a} + ${b}.`,
      steps: [...hypSteps(v('AC'), a, b, 'm', 0), ...(ask === 'further' ? [`Through ${v('B')}: ${a} + ${b} = ${a + b} m`, `${a + b} ${MINUS} ${cut(c)} = ${cut(a + b - c)} ≈ ${Math.round(a + b - c)} m further`] : [])],
      meta: { t: 'shortcut', a, b, ask },
    })
  }
}
function lake(): Question {
  for (;;) {
    const xz = int(20, 60) * 10
    const zy = xz + int(10, 50) * 10
    const xy = Math.sqrt(zy * zy - xz * xz)
    if (!clear(xy, 1)) continue
    const [R, A, B] = F.rtPts(xz, xy, pick([0, 15, 160, 200]), chance())
    return q({
      prompt: `To find the length ${v('XY')} of a lake, a surveyor places a marker at ${v('Z')} so that ∠${v('YXZ')} = 90°. ${v('XZ')} = ${xz} m and ${v('ZY')} = ${zy} m. How long is the lake, ${DPW[1]}?`,
      diagram: F.fig({ pts: { X: R, Z: A, Y: B }, polys: [{ v: ['X', 'Z', 'Y'] }], rights: [['Z', 'X', 'Y']], sides: [{ a: 'X', b: 'Z', text: L(xz, 'm') }, { a: 'Z', b: 'Y', text: L(zy, 'm') }], names: ['X', 'Y', 'Z'], label: 'Lake' }),
      answer: numA(xy, 1),
      prefix: `${v('XY')} =`,
      suffix: 'm',
      calc: true,
      hint: `The right angle is at ${v('X')}, so ${v('ZY')} is the hypotenuse and ${v('XY')} is a shorter side.`,
      steps: legSteps(v('XY'), zy, xz, 'm', 1),
      meta: { t: 'leg', c: zy, a: xz, mode: 1 },
    })
  }
}
function perimeterArea(): Question {
  for (;;) {
    const area = chance()
    const shape = pick(['tri', 'rect'] as const)
    const u = pick(['cm', 'm', 'mm'])
    // a rectangle's area or perimeter, or a triangle's area, needs Pythagoras only when a diagonal or hypotenuse is given
    const known = shape === 'rect' || area ? 'hyp' : chance(0.7) ? 'legs' : 'hyp'
    let a: number
    let b: number
    let c: number
    if (known === 'legs') {
      a = int(4, 40)
      b = int(4, 40)
      c = Math.sqrt(a * a + b * b)
    } else {
      c = int(8, 60)
      a = int(3, c - 2)
      b = Math.sqrt(c * c - a * a)
    }
    if (b < a / 3.2 || a < b / 3.2) continue
    const value = shape === 'tri' ? (area ? (a * b) / 2 : a + b + c) : area ? a * b : 2 * (a + b)
    const exact = Number.isInteger(r6(value * 10))
    if (!exact && !clear(value, 1)) continue
    const unknown = known === 'legs' ? c : b
    const work = known === 'legs' ? hypSteps(v('x'), a, b, u, 'exact') : legSteps(v('x'), c, a, u, 'exact')
    if (!Number.isInteger(r6(unknown))) work[2] = work[2].replace(/ = [^=]*$/, ` = ${cut(unknown)} ${u}`)
    const what = area ? 'area' : 'perimeter'
    let diagram: string
    let note: string | undefined
    if (shape === 'tri') {
      const d = rtFig(a, b, [L(a, u), known === 'legs' ? L(b, u) : '', known === 'hyp' ? L(c, u) : ''], null)
      diagram = d.diagram
      note = d.note
    } else {
      diagram = F.fig({ pts: { A: [0, b], B: [a, b], C: [a, 0], D: [0, 0] }, polys: [{ v: ['A', 'B', 'C', 'D'] }], segs: [{ a: 'B', b: 'D', dash: true }], rights: [['B', 'C', 'D']], sides: [{ a: 'C', b: 'D', text: L(a, u) }, ...(known === 'legs' ? [{ a: 'B', b: 'C', text: L(b, u) }] : [{ a: 'B', b: 'D', text: L(c, u), on: true }])], label: 'Rectangle' })
    }
    const formula =
      shape === 'tri'
        ? area
          ? `Area = ${frac(1, 2)} ${TIMES} ${num(a)} ${TIMES} ${known === 'legs' ? num(b) : v('x')}`
          : `Perimeter = ${num(a)} + ${known === 'legs' ? num(b) : v('x')} + ${known === 'legs' ? v('x') : num(c)}`
        : area
          ? `Area = ${num(a)} ${TIMES} ${known === 'legs' ? num(b) : v('x')}`
          : `Perimeter = 2 ${TIMES} (${num(a)} + ${known === 'legs' ? num(b) : v('x')})`
    return q({
      prompt: `Find the ${what} of this ${shape === 'tri' ? 'right-angled triangle' : 'rectangle'}, correct to one decimal place where necessary.`,
      diagram,
      note,
      answer: exact ? numA(r6(value)) : numA(value, 1),
      suffix: area ? `${u}<sup>2</sup>` : u,
      calc: true,
      hint: `First find the missing side with Pythagoras’ theorem${shape === 'rect' && known === 'hyp' ? ' (the diagonal is the hypotenuse)' : ''}. Keep all its decimal places, then find the ${what}.`,
      steps: [...work, `${formula} = ${exact ? num(r6(value)) : `${cut(value)} ≈ ${num(round(value, 1), 1)}`} ${area ? `${u}<sup>2</sup>` : u}`],
      meta: { t: 'perimarea', shape, area, a, b, c },
    })
  }
}
function everydayProblems(): Question {
  const kind = pick(['braces', 'diamond', 'kite', 'cone', 'swim'] as const)
  for (;;) {
    if (kind === 'braces') {
      const w = int(80, 120)
      const h = int(180, 220)
      const tot = (2 * Math.sqrt(w * w + h * h)) / 100
      if (!clear(tot, 2)) continue
      return q({
        prompt: `A screen door ${w} cm wide and ${h} cm high is strengthened by two metal braces along its diagonals. What is the total length of the two braces in metres, ${DPW[2]}?`,
        diagram: F.fig({ pts: { A: [0, h], B: [w, h], C: [w, 0], D: [0, 0] }, polys: [{ v: ['A', 'B', 'C', 'D'] }], segs: [{ a: 'A', b: 'C' }, { a: 'B', b: 'D' }], sides: [{ a: 'A', b: 'B', text: L(w, 'cm') }, { a: 'B', b: 'C', text: L(h, 'cm') }], label: 'Door with braces' }),
        answer: numA(tot, 2),
        suffix: 'm',
        calc: true,
        hint: 'Find one diagonal, double it, then change centimetres to metres (÷ 100).',
        steps: [...hypSteps(v('d'), w, h, 'cm', 'exact').slice(0, 2), `${v('d')} = ${sqrt(w * w + h * h)} = ${cut(Math.sqrt(w * w + h * h))} cm`, `Two braces = 2 ${TIMES} ${cut(Math.sqrt(w * w + h * h))} = ${cut(tot * 100)} cm ≈ ${num(round(tot, 2), 2)} m`],
        meta: { t: 'braces', w, h },
      })
    }
    if (kind === 'diamond') {
      const s = pick([18, 20, 23, 25, 27, 30])
      const dgl = s * Math.SQRT2
      return q({
        prompt: `A softball diamond is a square with sides ${s} m long. A ball is thrown from home plate straight to second base, the opposite corner. How far is that, ${DPW[1]}?`,
        diagram: F.fig({ pts: { H: [0, -s / Math.SQRT2], R: [s / Math.SQRT2, 0], S: [0, s / Math.SQRT2], Lf: [-s / Math.SQRT2, 0] }, polys: [{ v: ['H', 'R', 'S', 'Lf'] }], segs: [{ a: 'H', b: 'S', dash: true }], rights: [['Lf', 'H', 'R']], sides: [{ a: 'H', b: 'R', text: L(s, 'm') }], notes: [{ at: 'H', text: 'home plate', dy: 16 }, { at: 'S', text: 'second base', dy: -14 }], label: 'Softball diamond' }),
        answer: numA(dgl, 1),
        suffix: 'm',
        calc: true,
        hint: 'The path from home plate to second base is a diagonal of the square: the hypotenuse of a right-angled triangle with two sides of the square.',
        steps: hypSteps(v('d'), s, s, 'm', 1),
        meta: { t: 'hyp', a: s, b: s, mode: 1 },
      })
    }
    if (kind === 'kite') {
      const str = int(15, 40)
      const d = int(6, str - 4)
      const hand = pick([1, 1.2, 1.4, 1.5])
      const x = Math.sqrt(str * str - d * d)
      const top = x + hand
      if (!clear(top, 0)) continue
      return q({
        prompt: `A kite flies on a ${str} m string held ${num(hand)} m above the ground. The kite is ${d} m across (horizontally) from the hand. How high is the kite above the ground, to the nearest metre?`,
        diagram: F.fig({ pts: { G0: [0, 0], H: [0, hand], Fo: [d, hand], K: [d, hand + x], G1: [d, 0], gL: [-0.3, 0], gR: [d + 2, 0] }, polys: [{ v: ['H', 'Fo', 'K'] }], segs: [{ a: 'gL', b: 'gR' }, { a: 'G0', b: 'H', dash: true }, { a: 'Fo', b: 'G1', dash: true }], rights: [['H', 'Fo', 'K']], sides: [{ a: 'H', b: 'K', text: L(str, 'm') }, { a: 'H', b: 'Fo', text: L(d, 'm'), away: 'G1', gap: 10 }, { a: 'Fo', b: 'K', text: `${v('x')} m` }, { a: 'G0', b: 'H', text: L(hand, 'm'), away: 'Fo' }], label: 'Kite on a string' }),
        answer: numA(top, 0),
        suffix: 'm',
        calc: true,
        hint: `First find ${v('x')}, the height above the hand (the string is the hypotenuse). Then add the ${num(hand)} m.`,
        steps: [...legSteps(v('x'), str, d, 'm', 'exact').slice(0, 2), `${v('x')} = ${sqrt(str * str - d * d)} = ${cut(x)} m`, `Height = ${cut(x)} + ${num(hand)} = ${cut(top)} ≈ ${Math.round(top)} m`],
        meta: { t: 'kite', str, d, hand },
      })
    }
    if (kind === 'cone') {
      const s = int(10, 40)
      const h = int(Math.ceil(s * 0.45), s - 2)
      const r = Math.sqrt(s * s - h * h)
      if (!clear(r, 2) || Number.isInteger(r6(r))) continue
      return q({
        prompt: `A cone has a vertical height of ${L(h, 'cm')} and a slant height of ${L(s, 'cm')}. Find the radius of its base, ${v('r')}, ${DPW[2]}.`,
        diagram: F.cone(r, h, { h: L(h, 'cm'), r: `${v('r')} cm`, s: L(s, 'cm') }),
        answer: numA(r, 2),
        prefix: `${v('r')} =`,
        suffix: 'cm',
        calc: true,
        hint: 'The height, the radius and the slant height make a right-angled triangle. The slant height is the hypotenuse.',
        steps: legSteps(v('r'), s, h, 'cm', 2),
        meta: { t: 'leg', c: s, a: h, mode: 2 },
      })
    }
    const a = int(12, 30) * 10
    const b = int(10, 25) * 10
    const link = pick([2, 3, 5, 10])
    const hyp = Math.sqrt(a * a + b * b)
    const tot = 2 * link + a + b + hyp
    if (!clear(tot, 0)) continue
    return q({
      prompt: `The swim leg of a triathlon is a right-angled triangle. Swimmers go ${a} m to the first buoy, turn at right angles and swim ${b} m to the second buoy, then swim straight back to the start of the course. The course is joined to the beach by a ${link} m walkway, used on the way out and on the way back. What is the total distance from the beach and back, to the nearest metre?`,
      answer: numA(tot, 0),
      suffix: 'm',
      calc: true,
      hint: 'Find the third side (the hypotenuse) of the swim triangle, then add all the parts, including the walkway twice.',
      steps: [...hypSteps(v('h'), a, b, 'm', 'exact').slice(0, 2), `${v('h')} = ${sqrt(a * a + b * b)} = ${cut(hyp)} m`, `Total = ${link} + ${a} + ${b} + ${cut(hyp)} + ${link} = ${cut(tot)} ≈ ${Math.round(tot)} m`],
      meta: { t: 'swim', a, b, link },
    })
  }
}
function electricity(): Question {
  for (;;) {
    const h1 = int(30, 45) / 10
    const h2 = int(55, 90) / 10
    const D = int(60, 150) / 10
    const len = Math.sqrt(D * D + (h2 - h1) ** 2)
    if (!clear(len, 1)) continue
    const pts: Record<string, P> = { W0: [0, 0], W: [0, h1], P0: [D, 0], Pt: [D, h2], M: [D, h1], gl: [-1, 0], gr: [D + 1, 0] }
    return q({
      prompt: `An electricity line runs from the top of a ${num(h2)} m pole to a house, where it is attached ${num(h1)} m above the ground. The pole is ${num(D)} m from the house. How long is the line, ${DPW[1]}?`,
      diagram: F.fig({ pts, segs: [{ a: 'gl', b: 'gr' }, { a: 'W0', b: 'P0' }, { a: 'W0', b: 'W' }, { a: 'P0', b: 'Pt' }, { a: 'W', b: 'Pt' }, { a: 'W', b: 'M', dash: true }], rights: [['W', 'M', 'Pt']], sides: [{ a: 'W0', b: 'W', text: L(h1, 'm'), away: 'P0' }, { a: 'P0', b: 'Pt', text: L(h2, 'm'), away: 'W0' }, { a: 'W0', b: 'P0', text: L(D, 'm'), away: 'W' }], label: 'Electricity line' }),
      answer: numA(len, 1),
      suffix: 'm',
      calc: true,
      hint: 'Draw a horizontal line from the house to the pole. The right-angled triangle above it has a height equal to the difference in heights.',
      steps: [`Height difference = ${num(h2)} ${MINUS} ${num(h1)} = ${num(r6(h2 - h1))} m`, ...hypSteps(v('l'), D, r6(h2 - h1), 'm', 1)],
      meta: { t: 'hyp', a: D, b: r6(h2 - h1), mode: 1 },
    })
  }
}
function slide(): Question {
  for (;;) {
    const lad = int(30, 50) / 10
    const g = pick([0.8, 1, 1.2, 1.5])
    const run = int(30, 60) / 10
    const h2 = r6(lad * lad - g * g)
    const h = Math.sqrt(h2)
    const l = Math.sqrt(h2 + run * run)
    const ask = chance() ? 'h' : 'l'
    const val = ask === 'h' ? h : l
    if (!clear(val, 3)) continue
    const pts: Record<string, P> = { Lb: [-g, 0], Fo: [0, 0], S: [run, 0], T: [0, h] }
    return q({
      prompt: `A playground slide has a ladder ${num(lad)} m long. The foot of the ladder is ${num(g)} m from the point directly under the top of the slide, and the slide ends ${num(run)} m from that point. Find ${ask === 'h' ? `the height of the slide, ${v('h')}` : `the length of the slide, ${v('l')}`}, ${DPW[3]}.`,
      diagram: F.fig({ pts, polys: [{ v: ['Lb', 'S', 'T'] }], segs: [{ a: 'Fo', b: 'T', dash: true }, { a: 'Lb', b: 'Fo' }, { a: 'Fo', b: 'S' }], rights: [['S', 'Fo', 'T']], sides: [{ a: 'Lb', b: 'T', text: L(lad, 'm') }, { a: 'Lb', b: 'Fo', text: L(g, 'm') }, { a: 'Fo', b: 'S', text: L(run, 'm') }, { a: 'Fo', b: 'T', text: v('h'), away: 'S', gap: 10 }, { a: 'T', b: 'S', text: v('l') }], label: 'Slide' }),
      answer: numA(val, 3),
      prefix: `${v(ask)} =`,
      suffix: 'm',
      calc: true,
      hint: ask === 'h' ? 'Use the left triangle: the ladder is its hypotenuse.' : `First find ${v('h')} from the left triangle (keep ${sqS(v('h'))}), then use the right triangle: the slide is its hypotenuse.`,
      steps: [`${sqS(v('h'))} = ${sqN(lad)} ${MINUS} ${sqN(g)} = ${num(h2)}`, ask === 'h' ? `${v('h')} = ${sqrt(num(h2))} = ${cut(h)} ≈ ${num(round(h, 3), 3)} m` : `${sqS(v('l'))} = ${num(h2)} + ${sqN(run)} = ${num(r6(h2 + run * run))}`, ...(ask === 'l' ? [`${v('l')} = ${sqrt(num(r6(h2 + run * run)))} = ${cut(l)} ≈ ${num(round(l, 3), 3)} m`] : [])],
      meta: { t: 'slide', lad, g, run, ask },
    })
  }
}
function rhombus(): Question {
  for (;;) {
    const d1 = int(6, 30) * 2
    const d2 = int(4, 24) * 2
    if (d1 === d2) continue
    const side = Math.sqrt((d1 / 2) ** 2 + (d2 / 2) ** 2)
    const per = 4 * side
    const exact = Number.isInteger(r6(per))
    if (!exact && !clear(per, 1)) continue
    const pts: Record<string, P> = { A: [-d1 / 2, 0], B: [0, -d2 / 2], C: [d1 / 2, 0], D: [0, d2 / 2], O: [0, 0] }
    return q({
      prompt: `${v('ABCD')} is a rhombus with diagonals ${v('AC')} = ${L(d1, 'cm')} and ${v('BD')} = ${L(d2, 'cm')}. The diagonals of a rhombus bisect each other at right angles. Find the perimeter of the rhombus, correct to one decimal place where necessary.`,
      diagram: F.fig({ pts, polys: [{ v: ['A', 'B', 'C', 'D'] }], segs: [{ a: 'A', b: 'C', dash: true }, { a: 'B', b: 'D', dash: true }], rights: [['C', 'O', 'D']], names: ['A', 'B', 'C', 'D'], label: 'Rhombus' }),
      answer: exact ? numA(r6(per)) : numA(per, 1),
      suffix: 'cm',
      calc: true,
      hint: 'The diagonals cut the rhombus into four right-angled triangles. Each has shorter sides of half of each diagonal.',
      steps: [`Half the diagonals: ${d1 / 2} cm and ${d2 / 2} cm`, ...hypSteps(v('s'), d1 / 2, d2 / 2, 'cm', exact ? 'exact' : 4).slice(0, 2), `${v('s')} = ${sqrt((d1 / 2) ** 2 + (d2 / 2) ** 2)}${exact ? ` = ${num(r6(side))}` : ` = ${cut(side)}`} cm`, `Perimeter = 4 ${TIMES} ${exact ? num(r6(side)) : cut(side)} ${exact ? `= ${num(r6(per))}` : `= ${cut(per)} ≈ ${num(round(per, 1), 1)}`} cm`],
      meta: { t: 'rhombus', d1, d2 },
    })
  }
}
function ramp(): Question {
  for (;;) {
    const n = int(8, 30)
    const tread = int(25, 45)
    const riser = int(14, 20)
    const len = Math.sqrt((n * tread) ** 2 + (n * riser) ** 2) / 100
    if (!clear(len, 2)) continue
    return q({
      prompt: `A flight of ${n} steps is to be replaced by a straight ramp from the bottom of the first step to the top of the last step. Each step has a tread (depth) of ${tread} cm and a riser (height) of ${riser} cm. How long is the ramp in metres, ${DPW[2]}?`,
      answer: numA(len, 2),
      suffix: 'm',
      calc: true,
      hint: `The ramp is the hypotenuse of a big right-angled triangle. Its horizontal side is ${n} treads and its vertical side is ${n} risers.`,
      steps: [`Horizontal: ${n} ${TIMES} ${tread} = ${n * tread} cm. Vertical: ${n} ${TIMES} ${riser} = ${n * riser} cm.`, ...hypSteps(v('r'), n * tread, n * riser, 'cm', 'exact').slice(0, 2), `${v('r')} = ${sqrt((n * tread) ** 2 + (n * riser) ** 2)} = ${cut(len * 100)} cm ≈ ${num(round(len, 2), 2)} m`],
      meta: { t: 'ramp', n, tread, riser },
    })
  }
}
function composite(): Question {
  const kind = pick(['trapPer', 'trapArea', 'house'] as const)
  for (;;) {
    const u = pick(['cm', 'm'])
    if (kind === 'house') {
      const w = int(4, 16) * 2
      const e = int(w / 2 + 1, w)
      const hgt = int(6, 20)
      const th = Math.sqrt(e * e - (w / 2) ** 2)
      const area = w * hgt + (w * th) / 2
      const exact = Number.isInteger(r6(area * 10))
      if (!exact && !clear(area, 1)) continue
      const pts: Record<string, P> = { A: [0, 0], B: [w, 0], C: [w, hgt], T: [w / 2, hgt + th], D: [0, hgt], M: [w / 2, hgt] }
      return q({
        prompt: `This shape is a rectangle with an isosceles triangle on top. Find its area, correct to one decimal place where necessary.`,
        diagram: F.fig({ pts, polys: [{ v: ['A', 'B', 'C', 'T', 'D'] }], segs: [{ a: 'D', b: 'C', dash: true }, { a: 'T', b: 'M', dash: true }], rights: [['C', 'M', 'T'], ['A', 'B', 'C']], ticks: [{ a: 'D', b: 'T', n: 1 }, { a: 'C', b: 'T', n: 1 }], sides: [{ a: 'A', b: 'B', text: L(w, u) }, { a: 'B', b: 'C', text: L(hgt, u) }, { a: 'C', b: 'T', text: L(e, u) }], label: 'Rectangle with a triangle on top' }),
        answer: exact ? numA(r6(area)) : numA(area, 1),
        suffix: `${u}<sup>2</sup>`,
        calc: true,
        hint: 'Find the height of the triangle first: it splits the triangle into two right-angled triangles with a base of half the width.',
        steps: [...legSteps(v('t'), e, w / 2, u, 'exact').slice(0, 2), `${v('t')} = ${sqrt(r6(e * e - (w / 2) ** 2))}${Number.isInteger(r6(th)) ? ` = ${num(r6(th))}` : ` = ${cut(th)}`} ${u}`, `Area = ${w} ${TIMES} ${hgt} + ${frac(1, 2)} ${TIMES} ${w} ${TIMES} ${Number.isInteger(r6(th)) ? num(r6(th)) : cut(th)} = ${exact ? num(r6(area)) : `${cut(area)} ≈ ${num(round(area, 1), 1)}`} ${u}<sup>2</sup>`],
        meta: { t: 'house', w, e, hgt },
      })
    }
    const top = int(3, 30)
    const diff = int(3, 25)
    const bottom = top + diff
    if (kind === 'trapPer') {
      const h = int(4, 40)
      const slant = Math.sqrt(diff * diff + h * h)
      const per = top + bottom + h + slant
      const exact = Number.isInteger(r6(per))
      if ((!exact && !clear(per, 1)) || bottom > 3.5 * h || h > 3 * bottom) continue
      const pts: Record<string, P> = { A: [0, h], B: [top, h], C: [bottom, 0], D: [0, 0] }
      return q({
        prompt: 'Find the perimeter of this trapezium, correct to one decimal place where necessary.',
        diagram: F.fig({ pts, polys: [{ v: ['A', 'B', 'C', 'D'] }], rights: [['B', 'A', 'D'], ['A', 'D', 'C']], sides: [{ a: 'A', b: 'B', text: L(top, u) }, { a: 'A', b: 'D', text: L(h, u) }, { a: 'D', b: 'C', text: L(bottom, u) }], label: 'Trapezium' }),
        answer: exact ? numA(r6(per)) : numA(per, 1),
        suffix: u,
        calc: true,
        hint: 'The sloping side is the hypotenuse of a right-angled triangle with a height of the trapezium and a base equal to the difference of the parallel sides.',
        steps: [`Base of the triangle = ${bottom} ${MINUS} ${top} = ${diff} ${u}`, ...hypSteps(v('s'), h, diff, u, 'exact').slice(0, 2), `${v('s')} = ${sqrt(diff * diff + h * h)}${Number.isInteger(r6(slant)) ? ` = ${num(r6(slant))}` : ` = ${cut(slant)}`} ${u}`, `Perimeter = ${top} + ${bottom} + ${h} + ${Number.isInteger(r6(slant)) ? num(r6(slant)) : cut(slant)} = ${exact ? num(r6(per)) : `${cut(per)} ≈ ${num(round(per, 1), 1)}`} ${u}`],
        meta: { t: 'trapper', top, bottom, h },
      })
    }
    const s = int(diff + 1, diff + 30)
    const h = Math.sqrt(s * s - diff * diff)
    const area = ((top + bottom) / 2) * h
    const exact = Number.isInteger(r6(area * 10))
    if ((!exact && !clear(area, 1)) || bottom > 3.5 * h || h > 3 * bottom) continue
    const pts: Record<string, P> = { A: [0, h], B: [top, h], C: [bottom, 0], D: [0, 0], M: [top, 0] }
    return q({
      prompt: 'Find the area of this trapezium, correct to one decimal place where necessary.',
      diagram: F.fig({ pts, polys: [{ v: ['A', 'B', 'C', 'D'] }], segs: [{ a: 'B', b: 'M', dash: true }], rights: [['B', 'A', 'D'], ['A', 'D', 'C'], ['B', 'M', 'C']], sides: [{ a: 'A', b: 'B', text: L(top, u) }, { a: 'D', b: 'C', text: L(bottom, u) }, { a: 'B', b: 'C', text: L(s, u) }], label: 'Trapezium' }),
      answer: exact ? numA(r6(area)) : numA(area, 1),
      suffix: `${u}<sup>2</sup>`,
      calc: true,
      hint: 'The dashed height makes a right-angled triangle with the sloping side as its hypotenuse. Its base is the difference of the parallel sides.',
      steps: [`Base of the triangle = ${bottom} ${MINUS} ${top} = ${diff} ${u}`, ...legSteps(v('h'), s, diff, u, 'exact').slice(0, 2), `${v('h')} = ${sqrt(s * s - diff * diff)}${Number.isInteger(r6(h)) ? ` = ${num(r6(h))}` : ` = ${cut(h)}`} ${u}`, `Area = ${frac(1, 2)}(${top} + ${bottom}) ${TIMES} ${Number.isInteger(r6(h)) ? num(r6(h)) : cut(h)} = ${exact ? num(r6(area)) : `${cut(area)} ≈ ${num(round(area, 1), 1)}`} ${u}<sup>2</sup>`],
      meta: { t: 'traparea', top, bottom, s },
    })
  }
}
export const ex208 = (level: Level): Question => {
  if (level === 1) return pick([wireProblems, wireProblems, shortcut, lake])()
  if (level === 2) return pick([perimeterArea, perimeterArea, everydayProblems, everydayProblems, everydayProblems])()
  return pick([electricity, slide, rhombus, ramp, composite, composite])()
}

// ================================================================== Power plus (extension)

function isoRight(): Question {
  for (;;) {
    const c = int(8, 60)
    const x = c / Math.SQRT2
    if (!clear(x, 1)) continue
    return q({
      prompt: `A right-angled triangle has two equal shorter sides, ${v('x')}, and a hypotenuse of ${c} cm. Find ${v('x')}, ${DPW[1]}.`,
      ...rtFig(1, 1, [v('x'), v('x'), L(c, 'cm')], null),
      answer: numA(x, 1),
      prefix: `${v('x')} =`,
      suffix: 'cm',
      calc: true,
      hint: `${sqS(v('x'))} + ${sqS(v('x'))} = ${sqN(c)}, so 2${sqS(v('x'))} = ${c * c}.`,
      steps: [`2${sqS(v('x'))} = ${c * c}`, `${sqS(v('x'))} = ${num((c * c) / 2)}`, `${v('x')} = ${sqrt(num((c * c) / 2))} = ${cut(x)} ≈ ${num(round(x, 1), 1)} cm`],
      meta: { t: 'isoright', c },
    })
  }
}
function boxDiagonal(): Question {
  for (;;) {
    const l = int(6, 16)
    const w = int(Math.ceil(l * 0.45), l)
    const h = int(3, 12)
    const ask = pick(['base', 'space'] as const)
    const val = ask === 'base' ? Math.sqrt(l * l + w * w) : Math.sqrt(l * l + w * w + h * h)
    if (!clear(val, 1) || Number.isInteger(r6(val))) continue
    const target: [string, string] = ask === 'base' ? ['A', 'F'] : ['A', 'G']
    return q({
      prompt: `This rectangular prism is ${l} m long, ${w} m wide and ${h} m high. Find the length of the ${ask === 'base' ? 'diagonal of the base' : 'space diagonal'}, ${v(target.join(''))}, ${DPW[1]}.`,
      diagram: F.box(l, w, h, { diagonals: ask === 'base' ? [['A', 'F']] : [['A', 'F'], ['A', 'G']], labels: { l: L(l, 'm'), w: L(w, 'm'), h: L(h, 'm') } }),
      note: NOT_TO_SCALE,
      answer: numA(val, 1),
      prefix: `${v(target.join(''))} =`,
      suffix: 'm',
      calc: true,
      hint: ask === 'base' ? 'The base is a rectangle: its diagonal is the hypotenuse of a right-angled triangle with the length and width.' : `First find the base diagonal ${v('AF')} (keep its square). Then ${v('AFG')} is a right-angled triangle with the height ${v('FG')} as its other shorter side.`,
      steps: [`${sqS(v('AF'))} = ${sqN(l)} + ${sqN(w)} = ${l * l + w * w}`, ask === 'base' ? `${v('AF')} = ${sqrt(l * l + w * w)} = ${cut(val)} ≈ ${num(round(val, 1), 1)} m` : `${sqS(v('AG'))} = ${sqS(v('AF'))} + ${sqN(h)} = ${l * l + w * w} + ${h * h} = ${l * l + w * w + h * h}`, ...(ask === 'space' ? [`${v('AG')} = ${sqrt(l * l + w * w + h * h)} = ${cut(val)} ≈ ${num(round(val, 1), 1)} m`] : [])],
      meta: { t: 'box', l, w, h, ask },
    })
  }
}
function pyramidSlant(): Question {
  for (;;) {
    const b = int(3, 15) * 2
    const h = int(5, 25)
    const s2 = h * h + (b / 2) ** 2
    if (isSqInt(s2)) continue
    return q({
      prompt: `This square pyramid has a base ${b} cm wide and a vertical height ${v('EO')} of ${h} cm. ${v('F')} is the midpoint of ${v('BC')}. Find the slant height ${v('EF')} as a surd.`,
      diagram: F.pyramid(b, h, { labels: { base: L(b, 'cm'), h: L(h, 'cm') }, slant: true }),
      note: NOT_TO_SCALE,
      answer: numA(s2),
      prefix: `${v('EF')} = √`,
      suffix: 'cm',
      calc: true,
      hint: `Triangle ${v('EOF')} is right-angled at ${v('O')}. ${v('OF')} is half the width of the base.`,
      steps: [`${v('OF')} = ${b} ÷ 2 = ${b / 2} cm`, `${sqS(v('EF'))} = ${sqN(h)} + ${sqN(b / 2)} = ${h * h} + ${(b / 2) ** 2} = ${s2}`, `${v('EF')} = ${sqrt(s2)} cm`],
      meta: { t: 'pyramid', b, h },
    })
  }
}
function rectAndTriangle(): Question {
  for (;;) {
    const hgt = int(4, 12)
    const w = int(Math.ceil(hgt * 1.5), hgt * 3)
    const area = w * hgt
    const x2 = 2 * hgt * hgt
    const pts: Record<string, P> = { A: [0, hgt], B: [w, hgt], D: [w, 0], E: [0, 0], C: [w + hgt, 0] }
    return q({
      prompt: `Rectangle ${v('ABDE')} has an area of ${area} m<sup>2</sup> and ${v('AB')} = ${L(w, 'm')}. Triangle ${v('BDC')} is isosceles and right-angled at ${v('D')}. Find ${v('x')} as a surd.`,
      diagram: F.fig({ pts, polys: [{ v: ['A', 'B', 'D', 'E'] }, { v: ['B', 'C', 'D'] }], rights: [['B', 'A', 'E'], ['B', 'D', 'C']], sides: [{ a: 'A', b: 'B', text: L(w, 'm') }, { a: 'B', b: 'C', text: `${v('x')} m` }], names: ['A', 'B', 'C', 'D', 'E'], label: 'Rectangle and triangle' }),
      answer: numA(x2),
      prefix: `${v('x')} = √`,
      suffix: 'm',
      hint: `Use the area to find ${v('BD')}. Isosceles means ${v('DC')} = ${v('BD')}.`,
      steps: [`${v('BD')} = ${area} ÷ ${w} = ${hgt} m, and ${v('DC')} = ${hgt} m`, `${sqS(v('x'))} = ${sqN(hgt)} + ${sqN(hgt)} = ${x2}`, `${v('x')} = ${sqrt(x2)} m`],
      meta: { t: 'recttri', area, w },
    })
  }
}
function pointsApart(): Question {
  for (;;) {
    const a: P = [int(-6, 6), int(-6, 6)]
    const b: P = [int(-6, 6), int(-6, 6)]
    const d2 = (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2
    if (a[0] === b[0] || a[1] === b[1] || isSqInt(d2) || !clear(Math.sqrt(d2), 1)) continue
    const pt = (p: P) => `(${num(p[0])}, ${num(p[1])})`
    return q({
      prompt: `Find the distance between ${v('A')}${pt(a)} and ${v('B')}${pt(b)} on the number plane, ${DPW[1]}.`,
      answer: numA(Math.sqrt(d2), 1),
      suffix: 'units',
      calc: true,
      hint: 'Sketch the points. The horizontal and vertical distances between them are the shorter sides of a right-angled triangle.',
      steps: [`Horizontal distance = ${Math.abs(a[0] - b[0])}, vertical distance = ${Math.abs(a[1] - b[1])}`, ...hypSteps(v('AB'), Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]), 'units', 1).slice(1)],
      meta: { t: 'plane', a, b, mode: 1 },
    })
  }
}
export const exPowerPlus2 = (level: Level): Question => {
  if (level === 1) return pick([isoRight, pointsApart])()
  if (level === 2) return pick([rectAndTriangle, pyramidSlant])()
  return boxDiagonal()
}

// ================================================================== Topic test (in the order of Test Yourself 2) and skills

const T = (skill: string, level: Level, gen: () => Question): TestItem => ({ skill, level, gen: () => gen() })
export const NCM2_9_TEST: TestItem[] = [
  T('y9-pyt-surds', 1, evalSquare),
  T('y9-pyt-surds', 2, () => (chance() ? rootDp() : rootOfSum())),
  T('y9-pyt-theorem', 1, nameHyp),
  T('y9-pyt-theorem', 2, writeTheorem),
  T('y9-pyt-hyp', 2, hypSurd),
  T('y9-pyt-short', 2, legDp),
  T('y9-pyt-mixed', 2, mixedExact),
  T('y9-pyt-mixed', 2, () => contextProblem('walk')),
  T('y9-pyt-converse', 1, () => testRight(false)),
  T('y9-pyt-triads', 1, isTriad),
  T('y9-pyt-problems', 2, () => everydayProblems()),
  T('y9-pyt-mixed', 3, trapezium),
]

export const NCM2_9_SKILLS: Skill[] = [
  {
    id: 'y9-pyt-surds',
    title: 'Squares, square roots and surds',
    ref: ref('2.01'),
    outcomes: ROOTS,
    summary: 'Square numbers, find square roots, and tell which square roots are surds.',
    learn: {
      intro: `<p>The <b>square</b> of a number is the number times itself: ${sqN(-6)} = 36. The <b>square root</b> ${sqrt(49)} = 7 is the positive number whose square is 49.</p><p>Most square roots don’t work out exactly: ${sqrt(7)} = 2.645 751… goes on forever without repeating. A root like this is a <b>surd</b>. Surds are <b>irrational</b>: they can’t be written as a fraction.</p>`,
      keyPoints: ['Square negatives in brackets: (−9)² = 81, but −9² means −81.', '√(a² + b²) is not a + b: work out what is under the √ first.', 'A square root is a surd when the number under it isn’t a perfect square (including decimals such as 1.69 = 1.3²).'],
      vocab: [['surd', 'a root whose exact value can’t be written as a fraction or terminating decimal, e.g. √7'], ['irrational number', 'a number that can’t be written as a fraction, such as √2 or π'], ['rational number', 'a number that can be written as a fraction a/b']],
    },
    gen: ex201,
    levels: { 1: 'Squares (including negatives and decimals) and exact square roots', 2: 'Square roots rounded; roots of sums and differences', 3: 'Which roots are surds; between two whole numbers; is it always true?' },
  },
  {
    id: 'y9-pyt-theorem',
    title: 'Pythagoras’ theorem',
    ref: ref('2.02'),
    outcomes: PYT,
    summary: 'Find the hypotenuse of a right-angled triangle and write Pythagoras’ theorem for it.',
    learn: {
      intro: `<p>In a right-angled triangle the longest side, opposite the right angle, is the <b>hypotenuse</b>. <b>Pythagoras’ theorem</b> says that the square of the hypotenuse equals the sum of the squares of the other two sides:</p><div class="big">${ex2()}</div><p>where ${v('c')} is the hypotenuse.</p>`,
      keyPoints: ['Find the right angle first: the hypotenuse is the side that doesn’t touch it.', 'The hypotenuse goes on its own: (hypotenuse)² = (shorter side)² + (shorter side)².', 'Turning the triangle doesn’t change which side is the hypotenuse.'],
      vocab: [['hypotenuse', 'the longest side of a right-angled triangle, opposite the right angle'], ['theorem', 'a rule that has been proved']],
    },
    gen: ex202,
    levels: { 1: 'What and where the hypotenuse is', 2: 'Write Pythagoras’ theorem for a triangle', 3: 'Theorem with numbers; the areas of the squares on the sides' },
  },
  {
    id: 'y9-pyt-hyp',
    title: 'Finding the hypotenuse',
    ref: ref('2.03'),
    outcomes: PYT,
    summary: 'Use Pythagoras’ theorem to find the longest side, exactly, as a surd or rounded.',
    learn: {
      intro: `<p>To find the hypotenuse, square the two shorter sides, add, then take the square root. For shorter sides 9 cm and 40 cm: ${v('c')}<sup>2</sup> = 81 + 1600 = 1681, so ${v('c')} = ${sqrt(1681)} = 41 cm.</p><p>If the answer isn’t a whole number, leave it as a surd (${sqrt(160)}) for an exact answer, or round it.</p>`,
      keyPoints: ['Check: the hypotenuse must be longer than each of the other sides.', 'Make the units the same before you start (1 cm = 10 mm, 1 m = 100 cm).', '“As a surd” means write √ of a number; “correct to 1 decimal place” means round.'],
      vocab: [['exact value', 'the answer before any rounding, e.g. √160'], ['approximate value', 'a rounded answer, e.g. 12.6']],
    },
    gen: ex203,
    levels: { 1: 'Whole-number and simple decimal answers', 2: 'Surds, rounding, rectangles and ladders', 3: 'Triangles described in words, mixed units, roofs' },
  },
  {
    id: 'y9-pyt-short',
    title: 'Finding a shorter side',
    ref: ref('2.04'),
    outcomes: PYT,
    summary: 'Rearrange Pythagoras’ theorem to find a side that is not the hypotenuse.',
    learn: {
      intro: `<p>If you know the hypotenuse and one shorter side, <b>subtract</b>: with a hypotenuse of 10 mm and a side of 6 mm, ${v('d')}<sup>2</sup> = 10<sup>2</sup> ${MINUS} 6<sup>2</sup> = 64, so ${v('d')} = 8 mm.</p>`,
      keyPoints: ['Shorter side² = hypotenuse² − other side².', 'Check: the answer must be shorter than the hypotenuse.', 'The height of an isosceles or equilateral triangle cuts its base in half.'],
      vocab: [['perpendicular height', 'the height measured at right angles to the base']],
    },
    gen: ex204,
    levels: { 1: 'Whole-number answers', 2: 'Rounded and surd answers; rectangles', 3: 'Circles and chords, triangle heights, squares from diagonals' },
  },
  {
    id: 'y9-pyt-mixed',
    title: 'Mixed problems',
    ref: ref('2.05'),
    outcomes: PYT,
    summary: 'Decide whether to find the hypotenuse or a shorter side, then solve problems that need it.',
    learn: {
      intro: '<p>First decide: is the unknown side opposite the right angle (the hypotenuse)? Then <b>add</b> the squares. Is it one of the shorter sides? Then <b>subtract</b>.</p><p>Some shapes need a right-angled triangle drawn in: a trapezium, two triangles joined together, or the distance between two points on a number plane.</p>',
      keyPoints: ['Hypotenuse: add the squares. Shorter side: subtract the squares.', 'In two-step problems, keep the first answer as a surd (or keep its square) so you don’t round too early.', 'Compass directions such as east and south are at right angles.'],
      vocab: [['nautical mile', 'a distance used at sea and in the air (about 1.852 km)']],
    },
    gen: ex205,
    levels: { 1: 'Choose the right length (multiple choice)', 2: 'Rounded answers, ladders, ships, screens, the number plane', 3: 'Trapeziums, two-step triangles, wires' },
  },
  {
    id: 'y9-pyt-converse',
    title: 'Testing for right-angled triangles',
    ref: ref('2.06'),
    outcomes: PYT,
    summary: 'Use the converse of Pythagoras’ theorem to test whether a triangle is right-angled.',
    learn: {
      intro: `<p>The <b>converse</b> of Pythagoras’ theorem: if the sides of a triangle follow ${ex2()} (with ${v('c')} the longest side), the triangle is right-angled, and the right angle is opposite ${v('c')}.</p><p>Sides 21, 72 and 75: 75<sup>2</sup> = 5625 and 21<sup>2</sup> + 72<sup>2</sup> = 5625, so the triangle is right-angled.</p>`,
      keyPoints: ['Always square the longest side on its own.', 'If the two results are not equal, the triangle is not right-angled.', 'A triangle can look right-angled without being one: calculate to be sure.'],
      vocab: [['converse', 'a rule turned back to front']],
    },
    gen: ex206,
    levels: { 1: 'Whole-number sides', 2: 'Decimal sides; which set makes a right angle', 3: 'Where the right angle is; poles; correct working' },
  },
  {
    id: 'y9-pyt-triads',
    title: 'Pythagorean triads',
    ref: ref('2.07'),
    outcomes: PYT,
    summary: 'Test and make sets of three whole numbers that follow Pythagoras’ theorem.',
    learn: {
      intro: `<p>A <b>Pythagorean triad</b> is a set of three whole numbers {${v('a')}, ${v('b')}, ${v('c')}} with ${ex2()}, such as {3, 4, 5} or {5, 12, 13}.</p><p>Multiplying a triad by a whole number makes another triad: 2 ${TIMES} {3, 4, 5} = {6, 8, 10}. Multiplying by a fraction or decimal gives numbers that still follow the theorem, but they aren’t a triad unless they are all whole numbers.</p>`,
      keyPoints: ['Test: square the largest number and compare with the sum of the squares of the other two.', 'Common triads: {3, 4, 5}, {5, 12, 13}, {8, 15, 17}, {7, 24, 25}.'],
      vocab: [['triad', 'a group of three'], ['Pythagorean triad (triple)', 'three whole numbers that follow Pythagoras’ theorem']],
    },
    gen: ex207,
    levels: { 1: 'Is it a triad?', 2: 'Multiples of triads, missing numbers, whole numbers or not', 3: 'Formulas that make triads' },
  },
  {
    id: 'y9-pyt-problems',
    title: 'Pythagoras’ theorem problems',
    ref: ref('2.08'),
    outcomes: PYT,
    summary: 'Solve everyday problems by drawing the right-angled triangle and using Pythagoras’ theorem.',
    learn: {
      intro: '<p>Read the problem, draw a diagram with a right-angled triangle, label what you know, choose a pronumeral for the unknown, use Pythagoras’ theorem, then answer the question in words with units.</p>',
      keyPoints: ['Check the question: you may need a perimeter, an area, a difference or a total, not just a side.', 'Keep full calculator values until the last step, then round.', 'Look for hidden right angles: rectangles, squares, rhombus diagonals, poles and walls.'],
      vocab: [['diagonal', 'a line joining two corners that aren’t next to each other']],
    },
    gen: ex208,
    levels: { 1: 'Wires, poles, shortcuts and lakes', 2: 'Perimeters, areas, doors, kites, cones and courses', 3: 'Electricity lines, slides, rhombuses, ramps and composite shapes' },
  },
  {
    id: 'y9-pyt-powerplus',
    title: 'Power plus: Pythagoras’ theorem',
    ref: 'NCM 9 Power plus',
    tag: 'extension',
    outcomes: PYT,
    summary: 'Harder problems: equal sides, surds in two steps, the number plane and three dimensions.',
    learn: {
      intro: '<p>These questions combine Pythagoras’ theorem with other ideas. In three dimensions, find a right-angled triangle inside the solid: for example, the base diagonal of a box and its height make a right-angled triangle with the space diagonal as the hypotenuse.</p>',
      keyPoints: ['If two sides are equal, x² + x² = 2x².', 'Keep squares or surds between steps, and round only at the end.', 'Three-dimensional problems are beyond the core syllabus (extension).'],
    },
    gen: exPowerPlus2,
    levels: { 1: 'Isosceles right-angled triangles; distance between points', 2: 'Surds from areas; slant height of a pyramid', 3: 'Diagonals of a rectangular prism' },
  },
]
