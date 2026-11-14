// Class games for New Century Maths 7 (3rd edition, Cengage) Chapter 4, Fractions and percentages: one set of
// quick questions for each exercise, 4.01 to 4.12.
//
// The questions are the site's own. Every question is ONE step, done in the head in about 15 seconds, with four
// choices. The wrong choices are the usual mistakes: adding the denominators, forgetting to carry, dividing by
// the numerator instead of the denominator, 7% written as 0.7, and so on. No wrong choice is equal in value to the
// right one, except in "simplest form" questions, where a fraction that is only partly simplified is offered.
//
// Syllabus: NSW Mathematics K–10 (2022), Stage 4, Fractions, decimals and percentages MA4-FRC-C-01.
//
// Audit against the textbook, exercise by exercise (Nov 2026): added "bigger or smaller?" for multiplying and
// dividing by a fraction less than or greater than 1 (4.06, 4.07).
import type { GameChapter, GameQuestion, GameSet } from '@/lib/game/types'
import { D2, DIVIDE, MINUS, TIMES, chance, frac, gcd, gq, int, mixed, mk, num, pick, sample, shuffle } from './helpers'

const FRC = 'MA4-FRC-C-01'
const big = (s: string) => `<div class="big">${s}</div>`
const b = (s: string) => `<b>${s}</b>`
type Q = [number, number]
const NAMES = ['Ava', 'Ravi', 'Mia', 'Noah', 'Zara', 'Jack', 'Priya', 'Kai', 'Lily', 'Sam', 'Ella', 'Omar']

/** simplest form: a whole number, a proper fraction or a mixed numeral */
const F = (n: number, d: number) => mixed(n, d)
/** simplest form, with improper fractions left improper (for reciprocals) */
const Fi = (n: number, d: number) => {
  const g = gcd(n, d)
  return d / g === 1 ? num(n / g) : frac(n / g, d / g)
}
/** exactly as written, not simplified */
const Fr = (n: number, d: number) => frac(n, d)
/** " = simplest form", when what was shown is not already in simplest form */
const thenF = (shown: string, n: number, d: number) => (shown === F(n, d) ? '' : ` = ${F(n, d)}`)

/** three wrong fractions [n, d], none equal in value to the answer or to each other, most likely first */
function fracWrong(right: Q, likely: Q[], show: (n: number, d: number) => string = F): string[] {
  const v = (x: Q) => x[0] / x[1]
  const spare: Q[] = [[right[0] + 1, right[1]], [right[0], right[1] + 1], [2 * right[0] + 1, 2 * right[1]], [right[0] + right[1], right[1]]]
  const out: Q[] = []
  for (const x of [...likely, ...spare]) {
    if (!(x[0] > 0 && x[1] > 0 && Number.isInteger(x[0]) && Number.isInteger(x[1]))) continue
    if (Math.abs(v(x) - v(right)) < 1e-9 || out.some((y) => Math.abs(v(y) - v(x)) < 1e-9)) continue
    out.push(x)
    if (out.length === 3) break
  }
  return out.map(([n, d]) => show(n, d))
}
/** three wrong whole numbers, most likely first */
function intWrong(right: number, likely: number[]): number[] {
  const out: number[] = []
  for (const x of [...likely, right + 1, right - 1, right + 2, right * 2, right + 10]) {
    if (x !== right && x > 0 && Number.isInteger(x) && !out.includes(x)) out.push(x)
    if (out.length === 3) break
  }
  return out
}
/** three wrong percentages, most likely first */
function pctWrong(right: number, likely: number[]): string[] {
  const out: number[] = []
  for (const x of [...likely, right + 5, right - 5, right * 2]) {
    // at most one decimal place, so no wrong option looks odd
    if (x !== right && x > 0 && Number.isInteger(x * 10) && !out.includes(x)) out.push(x)
    if (out.length === 3) break
  }
  return out.map((x) => `${num(x)}%`)
}
/** a proper fraction r/d in simplest form, d from the list */
function proper(dens: number[]): Q {
  let r: number, d: number
  do {
    d = pick(dens)
    r = int(1, d - 1)
  } while (gcd(r, d) !== 1)
  return [r, d]
}

// ================================================================== 4.01 Fractions

function m401shaded(): GameQuestion {
  const parts = pick([4, 5, 6, 8, 10, 12])
  const shaded = int(1, parts - 1)
  return gq({
    t: 'shaded',
    prompt: 'What fraction of the strip is shaded?',
    diagram: D2.fractionStrip(parts, shaded),
    correct: F(shaded, parts),
    // shaded to unshaded, the unshaded part, one part too many
    wrong: fracWrong([shaded, parts], [[shaded, parts - shaded], [parts - shaded, parts], [shaded, parts + 1]]),
    why: `${shaded} of the ${parts} equal parts are shaded: ${Fr(shaded, parts)}${thenF(Fr(shaded, parts), shaded, parts)}.`,
    meta: { parts, shaded },
  })
}

function m401equiv(): GameQuestion {
  const [n, d] = proper([2, 3, 4, 5, 6, 7, 8, 9])
  const k = int(2, 6)
  const top = chance()
  const ans = top ? n * k : d * k
  return gq({
    t: 'equiv',
    prompt: `What number goes in the box?${big(`${Fr(n, d)} = ${top ? frac('□', d * k) : frac(n * k, '□')}`)}`,
    correct: num(ans),
    // adding the same number to the top and bottom, then near misses
    wrong: intWrong(ans, top ? [n + d * k - d, n * k + k, d * k - n] : [d + n * k - n, d * k + k, n * k + d]).map((x) => num(x)),
    why: top
      ? `${d} ${TIMES} ${k} = ${d * k}, so multiply the numerator by ${k} too: ${n} ${TIMES} ${k} = ${ans}.`
      : `${n} ${TIMES} ${k} = ${n * k}, so multiply the denominator by ${k} too: ${d} ${TIMES} ${k} = ${ans}.`,
    meta: { n, d, k, top },
  })
}

function m401simplify(): GameQuestion {
  let n: number, d: number, k: number
  do {
    ;[n, d] = proper([2, 3, 4, 5, 6, 7, 8, 9])
    k = pick([4, 6, 8, 9, 10, 12])
  } while (d * k > 100)
  // a common factor smaller than the highest one leaves the fraction only partly simplified
  const p = [2, 3, 5].find((x) => k % x === 0)!
  const N = n * k
  const D = d * k
  return gq({
    t: 'simplify',
    prompt: `Write in simplest form:${big(Fr(N, D))}`,
    correct: Fr(n, d),
    wrong: [Fr(N / p, D / p), Fr(n, D), Fr(N, d), Fr(n + 1, d + 1)],
    why: `The highest common factor of ${N} and ${D} is ${k}. ${N} ${DIVIDE} ${k} = ${n} and ${D} ${DIVIDE} ${k} = ${d}, so the answer is ${Fr(n, d)}.`,
    meta: { n, d, k },
  })
}

function m401mixed(): GameQuestion {
  let N: number, d: number
  do {
    d = int(2, 9)
    N = int(d + 1, 4 * d - 1)
  } while (gcd(N, d) !== 1)
  const w = Math.floor(N / d)
  const r = N % d
  return gq({
    t: 'mixed',
    prompt: `Write as a mixed numeral:${big(Fr(N, d))}`,
    correct: F(N, d),
    // one whole too many, the remainder taken from the wrong end, the whole and the remainder swapped, one whole too few
    wrong: fracWrong([N, d], [[N + d, d], [w * d + d - r, d], ...(w < d ? [[r * d + w, d] as Q] : []), [N - d, d]]),
    why: `${N} ${DIVIDE} ${d} = ${w} remainder ${r}, so ${Fr(N, d)} = ${F(N, d)}.`,
    meta: { N, d },
  })
}

function m401improper(): GameQuestion {
  const [r, d] = proper([2, 3, 4, 5, 6, 7, 8, 9])
  const w = int(1, 5)
  const N = w * d + r
  return gq({
    t: 'improper',
    prompt: `Write as an improper fraction:${big(`${w} ${Fr(r, d)}`)}`,
    correct: Fr(N, d),
    // added the whole to the numerator, subtracted, multiplied the wrong numbers, multiplied the denominator too
    wrong: fracWrong([N, d], [[w + r, d], [w * d - r, d], [w * r + d, d], [N, w * d]], Fr),
    why: `${w} ${TIMES} ${d} + ${r} = ${N}, so ${w} ${Fr(r, d)} = ${Fr(N, d)}.`,
    meta: { w, r, d },
  })
}

const SET_401: GameSet = {
  id: 'ncm7-4.01',
  exercise: '4.01',
  ref: 'NCM 7 Ex 4.01',
  title: 'Fractions',
  focus: 'Name fractions, find equivalent fractions, simplify, and change between improper fractions and mixed numerals.',
  lessons: ['y7-frac-simplify', 'y7-frac-mixed'],
  outcomes: [FRC],
  makers: [mk('shaded', m401shaded), mk('equiv', m401equiv), mk('simplify', m401simplify), mk('mixed', m401mixed, 2), mk('improper', m401improper, 2)],
}

// ================================================================== 4.02 Ordering fractions

function m402unit(): GameQuestion {
  const ds = sample([2, 3, 4, 5, 6, 7, 8, 9, 10, 12], 4)
  const largest = chance()
  const want = largest ? Math.min(...ds) : Math.max(...ds)
  return gq({
    t: 'unit',
    prompt: `Which fraction is the ${b(largest ? 'largest' : 'smallest')}?`,
    correct: Fr(1, want),
    inOrder: ds.map((d) => Fr(1, d)),
    why: `When the numerators are the same, the ${largest ? 'smaller' : 'larger'} the denominator, the ${largest ? 'larger' : 'smaller'} the fraction: ${Fr(1, want)}.`,
    meta: { ds, largest },
  })
}

const BENCH = ['Less than ½', 'Exactly ½', 'Between ½ and 1', 'More than 1']

function m402bench(): GameQuestion {
  // each answer equally likely, so every option is sometimes right
  const kind = int(0, 3)
  let n: number, d: number
  if (kind === 1) {
    d = 2 * int(2, 6)
    n = d / 2
  } else {
    do {
      d = int(3, 12)
      n = kind === 0 ? int(1, Math.ceil(d / 2) - 1) : kind === 2 ? int(Math.floor(d / 2) + 1, d - 1) : int(d + 1, 2 * d - 1)
    } while (gcd(n, d) !== 1)
  }
  const why = [
    `Half of ${d} is ${num(d / 2)}, and ${n} is less than that, so ${Fr(n, d)} is less than ½.`,
    `Half of ${d} is ${n}, so ${Fr(n, d)} is exactly ½.`,
    `Half of ${d} is ${num(d / 2)}. ${n} is more than that but less than ${d}, so ${Fr(n, d)} is between ½ and 1.`,
    `The numerator ${n} is more than the denominator ${d}, so ${Fr(n, d)} is more than 1.`,
  ][kind]
  return gq({
    t: 'bench',
    prompt: `Compare ${Fr(n, d)} with ½ and 1.`,
    correct: BENCH[kind],
    inOrder: BENCH,
    why,
    meta: { n, d },
  })
}

function m402compare(): GameQuestion {
  const D = pick([12, 20, 24])
  const dens = [2, 3, 4, 5, 6, 8, 10, 12].filter((d) => D % d === 0)
  let fs: Q[]
  do {
    fs = sample(dens, 4).map((d) => proper([d]))
  } while (new Set(fs.map(([n, d]) => (n * D) / d)).size < 4)
  const largest = chance()
  const tops = fs.map(([n, d]) => (n * D) / d)
  const want = fs[tops.indexOf(largest ? Math.max(...tops) : Math.min(...tops))]
  return gq({
    t: 'compare',
    prompt: `Which fraction is the ${b(largest ? 'largest' : 'smallest')}?`,
    correct: Fr(want[0], want[1]),
    inOrder: fs.map(([n, d]) => Fr(n, d)),
    why: `With denominator ${D}: ${fs.map(([n, d], i) => `${Fr(n, d)} = ${Fr(tops[i], D)}`).join(', ')}. The ${largest ? 'largest' : 'smallest'} is ${Fr(want[0], want[1])}.`,
    meta: { fs, largest, D },
  })
}

const SET_402: GameSet = {
  id: 'ncm7-4.02',
  exercise: '4.02',
  ref: 'NCM 7 Ex 4.02',
  title: 'Ordering fractions',
  focus: 'Compare and order fractions, using a common denominator or the benchmarks ½ and 1.',
  lessons: ['y7-frac-simplify'],
  outcomes: [FRC],
  makers: [mk('unit', m402unit), mk('bench', m402bench), mk('compare', m402compare, 2)],
}

// ================================================================== 4.03 Adding and subtracting fractions

/** x ± y for two fractions whose denominators come from `pairs` */
function addSub(t: string, pairs: Q[]): GameQuestion {
  const [d1, d2] = pick(pairs)
  const L = (d1 * d2) / gcd(d1, d2)
  let x: Q, y: Q
  do {
    x = proper([d1])
    y = proper([d2])
  } while (x[0] * y[1] === y[0] * x[1])
  if (chance()) [x, y] = [y, x]
  const sub = chance()
  if (sub && x[0] * y[1] < y[0] * x[1]) [x, y] = [y, x]
  const xa = (x[0] * L) / x[1]
  const ya = (y[0] * L) / y[1]
  const top = sub ? xa - ya : xa + ya
  const op = sub ? MINUS : '+'
  // working on the numerators alone, without a common denominator
  const naive = Math.abs(sub ? x[0] - y[0] : x[0] + y[0]) || 1
  const conv = [x, y]
    .filter((f) => f[1] !== L)
    .map((f) => `${Fr(f[0], f[1])} = ${Fr((f[0] * L) / f[1], L)}`)
    .join(' and ')
  const start = d1 === d2 ? `The denominators are the same, so ${sub ? 'subtract' : 'add'} the numerators:` : `Use the denominator ${L}: ${conv}. Then`
  return gq({
    t,
    prompt: `Evaluate:${big(`${Fr(x[0], x[1])} ${op} ${Fr(y[0], y[1])}`)}`,
    correct: F(top, L),
    // added (or subtracted) the tops and the bottoms, kept the old numerators, the other operation, one out
    wrong: fracWrong([top, L], [[naive, x[1] + y[1]], [naive, L], [sub ? xa + ya : Math.abs(xa - ya) || 1, L], [top + 1, L]]),
    why: `${start} ${xa} ${op} ${ya} = ${top}, giving ${Fr(top, L)}${thenF(Fr(top, L), top, L)}.`,
    meta: { x, y, sub },
  })
}

const m403same = () => addSub('same', [[3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9], [10, 10], [12, 12]])
const m403related = () => addSub('related', [[2, 4], [2, 6], [2, 8], [3, 6], [3, 9], [4, 8], [5, 10], [4, 12], [3, 12], [2, 10]])
const m403unrelated = () => addSub('unrelated', [[2, 3], [2, 5], [3, 4], [3, 5], [4, 6], [2, 9], [4, 5], [6, 8]])

const SET_403: GameSet = {
  id: 'ncm7-4.03',
  exercise: '4.03',
  ref: 'NCM 7 Ex 4.03',
  title: 'Adding and subtracting fractions',
  focus: 'Add and subtract fractions: make the denominators the same, then add or subtract the numerators.',
  lessons: ['y7-frac-addsub'],
  outcomes: [FRC],
  makers: [mk('same', m403same), mk('related', m403related), mk('unrelated', m403unrelated, 2)],
}

// ================================================================== 4.04 Adding and subtracting mixed numerals

function m404add(): GameQuestion {
  const d = pick([3, 4, 5, 6, 7, 8, 9, 10])
  const w1 = int(1, 6)
  const w2 = int(1, 5)
  let r1: number, r2: number
  do {
    r1 = int(1, d - 1)
    r2 = int(1, d - 1)
  } while (r1 + r2 >= d)
  const W = w1 + w2
  const top = W * d + r1 + r2
  const shown = `${W} ${Fr(r1 + r2, d)}`
  return gq({
    t: 'addMixed',
    prompt: `Evaluate:${big(`${w1} ${Fr(r1, d)} + ${w2} ${Fr(r2, d)}`)}`,
    correct: F(top, d),
    // added the denominators, one whole too many, subtracted the fractions
    wrong: fracWrong([top, d], [[W * 2 * d + r1 + r2, 2 * d], [(W + 1) * d + r1 + r2, d], [W * d + (Math.abs(r1 - r2) || 1), d]]),
    why: `Wholes: ${w1} + ${w2} = ${W}. Fractions: ${Fr(r1, d)} + ${Fr(r2, d)} = ${Fr(r1 + r2, d)}. Answer: ${shown}${thenF(shown, top, d)}.`,
    meta: { w1, r1, w2, r2, d },
  })
}

function m404sub(): GameQuestion {
  const d = pick([3, 4, 5, 6, 7, 8, 9, 10])
  const w2 = int(1, 4)
  const w1 = w2 + int(1, 4)
  const r1 = int(2, d - 1)
  const r2 = int(1, r1 - 1)
  const W = w1 - w2
  const top = W * d + r1 - r2
  const shown = `${W} ${Fr(r1 - r2, d)}`
  return gq({
    t: 'subMixed',
    prompt: `Evaluate:${big(`${w1} ${Fr(r1, d)} ${MINUS} ${w2} ${Fr(r2, d)}`)}`,
    correct: F(top, d),
    // added the fractions, added the wholes, one whole too few
    wrong: fracWrong([top, d], [[W * d + r1 + r2, d], [(w1 + w2) * d + r1 - r2, d], [(W - 1) * d + r1 - r2, d]]),
    why: `Wholes: ${w1} ${MINUS} ${w2} = ${W}. Fractions: ${Fr(r1, d)} ${MINUS} ${Fr(r2, d)} = ${Fr(r1 - r2, d)}. Answer: ${shown}${thenF(shown, top, d)}.`,
    meta: { w1, r1, w2, r2, d },
  })
}

function m404fromWhole(): GameQuestion {
  const [r, d] = proper([2, 3, 4, 5, 6, 8, 10])
  const w = int(2, 9)
  const top = w * d - r
  return gq({
    t: 'fromWhole',
    prompt: `Evaluate:${big(`${w} ${MINUS} ${Fr(r, d)}`)}`,
    correct: F(top, d),
    // kept the fraction instead of taking it from a whole, forgot to take the whole, took two wholes
    wrong: fracWrong([top, d], [[(w - 1) * d + r, d], [w * d + d - r, d], [(w - 2) * d + d - r, d]]),
    why: `${w} = ${w - 1} ${Fr(d, d)}, and ${Fr(d, d)} ${MINUS} ${Fr(r, d)} = ${Fr(d - r, d)}, so the answer is ${F(top, d)}.`,
    meta: { w, r, d },
  })
}

function m404carry(): GameQuestion {
  const [d1, d2] = pick([[2, 4], [4, 4], [2, 6], [3, 6], [2, 8], [4, 8], [3, 3], [5, 5], [6, 6], [8, 8]] as Q[])
  let x: Q, y: Q
  do {
    x = proper([d1])
    y = proper([d2])
  } while (x[0] * (d2 / d1) + y[0] <= d2)
  const w1 = int(1, 5)
  const w2 = int(1, 4)
  const W = w1 + w2
  const sum = x[0] * (d2 / d1) + y[0]
  const top = W * d2 + sum
  return gq({
    t: 'carry',
    prompt: `Evaluate:${big(`${w1} ${Fr(x[0], d1)} + ${w2} ${Fr(y[0], d2)}`)}`,
    correct: F(top, d2),
    // forgot to carry the 1, added the denominators, carried 2
    wrong: fracWrong([top, d2], [[top - d2, d2], [W * (d1 + d2) + x[0] + y[0], d1 + d2], [top + d2, d2]]),
    why: `Wholes: ${w1} + ${w2} = ${W}. Fractions: ${Fr(x[0], d1)} + ${Fr(y[0], d2)} = ${Fr(sum, d2)} = ${F(sum, d2)}. Answer: ${W} + ${F(sum, d2)} = ${F(top, d2)}.`,
    meta: { w1, x, w2, y },
  })
}

const SET_404: GameSet = {
  id: 'ncm7-4.04',
  exercise: '4.04',
  ref: 'NCM 7 Ex 4.04',
  title: 'Adding and subtracting mixed numerals',
  focus: 'Add and subtract mixed numerals: work with the wholes and the fractions separately, carrying or borrowing a whole when needed.',
  lessons: ['y7-frac-addsub'],
  outcomes: [FRC],
  makers: [mk('addMixed', m404add), mk('subMixed', m404sub), mk('fromWhole', m404fromWhole, 2), mk('carry', m404carry, 2)],
}

// ================================================================== 4.05 Fraction of a quantity

function m405of(): GameQuestion {
  const [n, d] = proper([2, 3, 4, 5, 6, 8, 10])
  const q = d * int(2, 12)
  const u = pick(['', '$', 'kg', 'm', 'L'])
  const show = (x: number) => (u === '$' ? `$${num(x)}` : u ? `${num(x)} ${u}` : num(x))
  const ans = (q / d) * n
  return gq({
    t: 'of',
    prompt: `Find ${Fr(n, d)} of ${b(show(q))}.`,
    correct: show(ans),
    // forgot to multiply by the numerator, found the rest, multiplied by the numerator only
    wrong: intWrong(ans, [q / d, q - ans, q * n, q / n]).map(show),
    why: `${show(q)} ${DIVIDE} ${d} = ${show(q / d)}${n > 1 ? `, and ${show(q / d)} ${TIMES} ${n} = ${show(ans)}` : ''}.`,
    meta: { n, d, q, u },
  })
}

const STORY_405 = [
  (T: number, f: string) => `A class has ${T} students. ${f} of them walk to school. How many students walk to school?`,
  (T: number, f: string) => `A netball team played ${T} games and won ${f} of them. How many games did the team win?`,
  (T: number, f: string, name: string) => `A book has ${T} pages. ${name} has read ${f} of it. How many pages has ${name} read?`,
]

function m405story(): GameQuestion {
  const [n, d] = proper([3, 4, 5, 6])
  const T = d * int(4, 12)
  const part = (T / d) * n
  return gq({
    t: 'story',
    prompt: pick(STORY_405)(T, Fr(n, d), pick(NAMES)),
    correct: num(part),
    // the rest, one part, divided by the numerator
    wrong: intWrong(part, [T - part, T / d, T / n]).map((x) => num(x)),
    why: `${T} ${DIVIDE} ${d} = ${T / d}${n > 1 ? `, and ${T / d} ${TIMES} ${n} = ${part}` : ''}.`,
    meta: { n, d, T },
  })
}

const SET_405: GameSet = {
  id: 'ncm7-4.05',
  exercise: '4.05',
  ref: 'NCM 7 Ex 4.05',
  title: 'Fraction of a quantity',
  focus: 'Find a fraction of a quantity: divide by the denominator, then multiply by the numerator.',
  lessons: ['y7-frac-muldiv'],
  outcomes: [FRC],
  makers: [mk('of', m405of), mk('story', m405story)],
}

// ================================================================== 4.06 Multiplying fractions

function m406times(): GameQuestion {
  let x: Q, y: Q
  do {
    x = proper([2, 3, 4, 5, 6, 7, 8, 9])
    y = proper([2, 3, 4, 5, 6, 7, 8, 9])
  } while (gcd(x[0] * y[0], x[1] * y[1]) !== 1)
  const [a, b1] = x
  const [c, d] = y
  return gq({
    t: 'times',
    prompt: `Evaluate:${big(`${Fr(a, b1)} ${TIMES} ${Fr(c, d)}`)}`,
    correct: Fr(a * c, b1 * d),
    // added tops and bottoms, cross-multiplied, multiplied the tops but added the bottoms
    wrong: fracWrong([a * c, b1 * d], [[a + c, b1 + d], [a * d, b1 * c], [a * c, b1 + d]]),
    why: `Multiply the numerators and the denominators: ${a} ${TIMES} ${c} = ${a * c} and ${b1} ${TIMES} ${d} = ${b1 * d}, giving ${Fr(a * c, b1 * d)}.`,
    meta: { x, y },
  })
}

function m406cancel(): GameQuestion {
  let x: Q, y: Q
  do {
    x = proper([3, 4, 5, 6, 7, 8, 9, 10])
    y = proper([3, 4, 5, 6, 7, 8, 9, 10])
  } while (gcd(x[0] * y[0], x[1] * y[1]) === 1 || x[0] * y[1] === y[0] * x[1])
  const [a, b1] = x
  const [c, d] = y
  return gq({
    t: 'cancel',
    prompt: `Evaluate:${big(`${Fr(a, b1)} ${TIMES} ${Fr(c, d)}`)}`,
    correct: F(a * c, b1 * d),
    wrong: fracWrong([a * c, b1 * d], [[a + c, b1 + d], [a * d, b1 * c], [a * c, b1 + d]]),
    why: `${Fr(a, b1)} ${TIMES} ${Fr(c, d)} = ${Fr(a * c, b1 * d)}${thenF(Fr(a * c, b1 * d), a * c, b1 * d)}. (Cancelling first gives the same answer.)`,
    meta: { x, y },
  })
}

function m406whole(): GameQuestion {
  const [n, d] = proper([3, 4, 5, 7, 8, 9])
  const w = int(2, 6)
  return gq({
    t: 'whole',
    prompt: `Evaluate:${big(`${w} ${TIMES} ${Fr(n, d)}`)}`,
    correct: F(w * n, d),
    // multiplied the denominator too, multiplied the denominator only, added
    wrong: fracWrong([w * n, d], [[w * n, w * d], [n, w * d], [w + n, d]]),
    why: `${w} ${TIMES} ${Fr(n, d)} = ${Fr(w * n, d)}${thenF(Fr(w * n, d), w * n, d)}.`,
    meta: { w, n, d },
  })
}

function m406mixed(): GameQuestion {
  const [r, d] = proper([2, 3, 4, 5])
  const w = int(1, 3)
  const k = int(2, 5)
  const im = w * d + r
  const N = im * k
  return gq({
    t: 'mixedTimes',
    prompt: `Evaluate:${big(`${w} ${Fr(r, d)} ${TIMES} ${k}`)}`,
    correct: F(N, d),
    // multiplied the whole number only, added, one whole too many
    wrong: fracWrong([N, d], [[w * k * d + r, d], [(w + k) * d + r, d], [N + d, d]]),
    why: `${w} ${Fr(r, d)} = ${Fr(im, d)}, and ${Fr(im, d)} ${TIMES} ${k} = ${Fr(N, d)}${thenF(Fr(N, d), N, d)}.`,
    meta: { w, r, d, k },
  })
}

/** Without working it out: does multiplying (or dividing) by this fraction make the number bigger or smaller? */
const sizeKind = (op: 'times' | 'divide') =>
  mk(
    'size',
    (): GameQuestion => {
      const b = int(2, 9)
      const proper = chance()
      let a: number
      do a = proper ? int(1, b - 1) : int(b + 1, 2 * b + 3)
      while (gcd(a, b) !== 1)
      const n = pick([12, 18, 20, 24, 30, 36, 40, 60])
      const bigger = (op === 'times') !== proper
      const opts = [`Bigger than ${n}`, `Smaller than ${n}`, `Equal to ${n}`, 'Cannot tell without working']
      return gq({
        t: 'size',
        prompt: `Without working it out: is the answer bigger or smaller than ${n}?<div class="big">${n} ${op === 'times' ? TIMES : DIVIDE} ${frac(a, b)}</div>`,
        correct: opts[bigger ? 0 : 1],
        inOrder: opts,
        why:
          op === 'times'
            ? proper
              ? `${frac(a, b)} is less than 1, so you get only part of ${n}: smaller than ${n}.`
              : `${frac(a, b)} is more than 1, so you get more than ${n}: bigger than ${n}.`
            : proper
              ? `Dividing by a fraction less than 1 asks how many of these small parts fit into ${n}: more than ${n}, so bigger than ${n}.`
              : `Dividing by a number more than 1 shares ${n} into bigger parts: smaller than ${n}.`,
        meta: { n, a, b, op },
      })
    },
    2,
  )

const SET_406: GameSet = {
  id: 'ncm7-4.06',
  exercise: '4.06',
  ref: 'NCM 7 Ex 4.06',
  title: 'Multiplying fractions',
  focus: 'Multiply fractions: numerator times numerator, denominator times denominator, then simplify. Change mixed numerals to improper fractions first.',
  lessons: ['y7-frac-muldiv'],
  outcomes: [FRC],
  makers: [mk('times', m406times), mk('whole', m406whole), mk('cancel', m406cancel, 2), mk('mixedTimes', m406mixed, 2), sizeKind('times')],
}

// ================================================================== 4.07 Dividing fractions

function m407reciprocal(): GameQuestion {
  if (chance(0.3)) {
    const [r, d] = proper([2, 3, 4, 5, 6])
    const w = int(1, 3)
    const N = w * d + r
    return gq({
      t: 'reciprocal',
      prompt: `What is the reciprocal of ${w} ${Fr(r, d)}?`,
      correct: Fi(d, N),
      // the improper fraction itself, the fraction part flipped, the fraction part
      wrong: fracWrong([d, N], [[N, d], [d, r], [r, d]], Fi),
      why: `${w} ${Fr(r, d)} = ${Fr(N, d)}. Swap the numerator and denominator: ${Fr(d, N)}.`,
      meta: { w, r, d },
    })
  }
  let n: number, d: number
  do {
    d = int(2, 9)
    n = int(1, 9)
  } while (gcd(n, d) !== 1 || n === d)
  return gq({
    t: 'reciprocal',
    prompt: `What is the reciprocal of ${Fr(n, d)}?`,
    correct: Fi(d, n),
    wrong: fracWrong([d, n], [[n, d], [1, n * d], [d, n + d]], Fi),
    why: `Swap the numerator and denominator: ${Fr(d, n)}${n === 1 ? ` = ${d}` : ''}.`,
    meta: { n, d },
  })
}

function m407wholeBy(): GameQuestion {
  const d = int(2, 8)
  const w = int(2, 9)
  return gq({
    t: 'wholeBy',
    prompt: `Evaluate:${big(`${w} ${DIVIDE} ${Fr(1, d)}`)}`,
    correct: num(w * d),
    // divided by the denominator instead, the reciprocal of the answer, added
    wrong: fracWrong([w * d, 1], [[w, d], [1, w * d], [w + d, 1]], Fi),
    why: `Each whole holds ${d} lots of ${Fr(1, d)}, so ${w} ${DIVIDE} ${Fr(1, d)} = ${w} ${TIMES} ${d} = ${w * d}.`,
    meta: { w, d },
  })
}

function m407divide(): GameQuestion {
  let x: Q, y: Q
  do {
    x = proper([2, 3, 4, 5, 6, 7, 8])
    y = proper([2, 3, 4, 5, 6, 7, 8])
  } while (x[0] * y[1] === y[0] * x[1] || ((x[0] * y[1]) % (x[1] * y[0]) !== 0 && chance(0.6)))
  const [a, b1] = x
  const [c, d] = y
  const N = a * d
  const D = b1 * c
  return gq({
    t: 'divide',
    prompt: `Evaluate:${big(`${Fr(a, b1)} ${DIVIDE} ${Fr(c, d)}`)}`,
    correct: F(N, D),
    // multiplied instead, flipped the first fraction, the answer upside down
    wrong: fracWrong([N, D], [[a * c, b1 * d], [b1 * c, a * d], [D, N]]),
    why: `Multiply by the reciprocal: ${Fr(a, b1)} ${TIMES} ${Fr(d, c)} = ${Fr(N, D)}${thenF(Fr(N, D), N, D)}.`,
    meta: { x, y },
  })
}

function m407byWhole(): GameQuestion {
  const [n, d] = proper([2, 3, 4, 5, 6, 7, 8])
  const k = int(2, 5)
  return gq({
    t: 'byWhole',
    prompt: `Evaluate:${big(`${Fr(n, d)} ${DIVIDE} ${k}`)}`,
    correct: F(n, d * k),
    // multiplied instead, added to the denominator, the answer upside down
    wrong: fracWrong([n, d * k], [[n * k, d], [n, d + k], [d * k, n]]),
    why: `Dividing by ${k} is the same as multiplying by ${Fr(1, k)}: ${Fr(n, d)} ${TIMES} ${Fr(1, k)} = ${Fr(n, d * k)}${thenF(Fr(n, d * k), n, d * k)}.`,
    meta: { n, d, k },
  })
}

const SET_407: GameSet = {
  id: 'ncm7-4.07',
  exercise: '4.07',
  ref: 'NCM 7 Ex 4.07',
  title: 'Dividing fractions',
  focus: 'Find reciprocals, and divide by a fraction by multiplying by its reciprocal.',
  lessons: ['y7-frac-muldiv'],
  outcomes: [FRC],
  makers: [mk('reciprocal', m407reciprocal), mk('wholeBy', m407wholeBy), mk('divide', m407divide, 2), mk('byWhole', m407byWhole, 2), sizeKind('divide')],
}

// ================================================================== 4.08 Fraction problems

function m408hour(): GameQuestion {
  const [n, d] = proper([3, 4, 5, 6, 10, 12])
  const part = (60 / d) * n
  return gq({
    t: 'hour',
    prompt: `How many minutes are in ${Fr(n, d)} of an hour?`,
    correct: num(part),
    // treated an hour as 100 minutes, forgot the numerator, found the rest
    wrong: intWrong(part, [(100 / d) * n, 60 / d, 60 - part]).map((x) => num(x)),
    why: `60 ${DIVIDE} ${d} = ${60 / d}${n > 1 ? `, and ${60 / d} ${TIMES} ${n} = ${part}` : ''} minutes.`,
    meta: { n, d },
  })
}

function m408left(): GameQuestion {
  const [n, d] = proper([3, 4, 5, 6, 8])
  const T = d * int(3, 10)
  const spent = (T / d) * n
  const name = pick(NAMES)
  return gq({
    t: 'left',
    prompt: `${name} had $${T} and spent ${Fr(n, d)} of it. How much money is left?`,
    correct: `$${T - spent}`,
    // the amount spent, one part, took away the numerator
    wrong: intWrong(T - spent, [spent, T / d, T - n]).map((x) => `$${x}`),
    why: `${Fr(n, d)} of $${T} is $${spent}, and $${T} ${MINUS} $${spent} = $${T - spent}.`,
    meta: { n, d, T },
  })
}

function m408reverse(): GameQuestion {
  const [n, d] = proper([2, 3, 4, 5, 6, 8, 10])
  const m = int(2, 9)
  const X = n * m
  const ans = d * m
  return gq({
    t: 'reverse',
    prompt: `${Fr(n, d)} of a number is ${b(String(X))}. What is the number?`,
    correct: num(ans),
    // took the fraction of X instead, forgot to divide by the numerator, one part, added
    wrong: intWrong(ans, [(X * n) / d, X * d, m, X + d]).map((x) => num(x)),
    why:
      n === 1
        ? `The number is ${d} lots of ${X}: ${X} ${TIMES} ${d} = ${ans}.`
        : `${Fr(1, d)} of the number is ${X} ${DIVIDE} ${n} = ${m}, so the number is ${m} ${TIMES} ${d} = ${ans}.`,
    meta: { n, d, X },
  })
}

const SET_408: GameSet = {
  id: 'ncm7-4.08',
  exercise: '4.08',
  ref: 'NCM 7 Ex 4.08',
  title: 'Fraction problems',
  focus: 'Use fractions of quantities to solve problems about time, money and unknown amounts.',
  lessons: ['y7-frac-muldiv'],
  outcomes: [FRC],
  makers: [mk('hour', m408hour), mk('left', m408left), mk('reverse', m408reverse, 2)],
}

// ================================================================== 4.09 Fractions and the calculator

/** a fraction within ⅙ of 0 or of 1, so a mixed numeral with it rounds without doubt */
function nearWhole(minD: number): Q {
  const d = int(minD, 12)
  return [chance() ? 1 : d - 1, d]
}
const about = (w: number, f: Q) => Math.round(w + f[0] / f[1])

function m409sum(): GameQuestion {
  const w1 = int(1, 9)
  const w2 = int(1, 9)
  const f1 = nearWhole(6)
  const f2 = nearWhole(6)
  const ans = about(w1, f1) + about(w2, f2)
  return gq({
    t: 'estSum',
    prompt: `Which whole number is closest to the answer?${big(`${w1} ${Fr(...f1)} + ${w2} ${Fr(...f2)}`)}`,
    correct: num(ans),
    // ignored the fractions, then near misses
    wrong: intWrong(ans, [w1 + w2, ans + 1, ans - 1, ans + 2]).map((x) => num(x)),
    why: `${w1} ${Fr(...f1)} is about ${about(w1, f1)} and ${w2} ${Fr(...f2)} is about ${about(w2, f2)}, so the answer is about ${ans}.`,
    meta: { w1, f1, w2, f2 },
  })
}

function m409diff(): GameQuestion {
  const w2 = int(1, 6)
  const w1 = w2 + int(2, 7)
  const f1 = nearWhole(6)
  const f2 = nearWhole(6)
  const ans = about(w1, f1) - about(w2, f2)
  return gq({
    t: 'estDiff',
    prompt: `Which whole number is closest to the answer?${big(`${w1} ${Fr(...f1)} ${MINUS} ${w2} ${Fr(...f2)}`)}`,
    correct: num(ans),
    wrong: intWrong(ans, [w1 - w2, ans + 1, ans - 1, ans + 2]).map((x) => num(x)),
    why: `${w1} ${Fr(...f1)} is about ${about(w1, f1)} and ${w2} ${Fr(...f2)} is about ${about(w2, f2)}, so the answer is about ${ans}.`,
    meta: { w1, f1, w2, f2 },
  })
}

function m409times(): GameQuestion {
  const w = int(1, 9)
  const f = nearWhole(8)
  const k = int(2, 3)
  const ans = about(w, f) * k
  return gq({
    t: 'estTimes',
    prompt: `Which whole number is closest to the answer?${big(`${w} ${Fr(...f)} ${TIMES} ${k}`)}`,
    correct: num(ans),
    wrong: intWrong(ans, [w * k, ans + 1, ans - 1, ans + k]).map((x) => num(x)),
    why: `${w} ${Fr(...f)} is about ${about(w, f)}, and ${about(w, f)} ${TIMES} ${k} = ${ans}.`,
    meta: { w, f, k },
  })
}

const SET_409: GameSet = {
  id: 'ncm7-4.09',
  exercise: '4.09',
  ref: 'NCM 7 Ex 4.09',
  title: 'Fractions and the calculator',
  focus: 'Estimate fraction calculations: the check to use on every calculator answer.',
  lessons: ['y7-frac-addsub'],
  outcomes: [FRC],
  teacherNote:
    'The game is played without calculators, so it practises estimating, which students use to check a calculator answer. Using the fraction key is practised in the lesson, on each student’s own calculator.',
  makers: [mk('estSum', m409sum), mk('estDiff', m409diff), mk('estTimes', m409times, 2)],
}

// ================================================================== 4.10 Percentages, fractions and decimals

/** percentages with friendly fractions */
const PCT = [50, 25, 75, 20, 40, 60, 80, 10, 30, 70, 90, 5, 1, 12.5]

function m410toFrac(): GameQuestion {
  const p = pick(PCT)
  const [n, d]: Q = p === 12.5 ? [1, 8] : [p / gcd(p, 100), 100 / gcd(p, 100)]
  const likely: Q[] = p === 12.5 ? [[1, 12], [1, 125], [1, 80]] : [...(p >= 2 ? [[1, p] as Q] : []), [n, d * 10], ...(p < 10 ? [[p, 10] as Q] : [])]
  return gq({
    t: 'toFrac',
    prompt: `Write ${b(`${num(p)}%`)} as a fraction in simplest form.`,
    correct: Fr(n, d),
    // not simplified, then the usual mistakes
    wrong: [...(Number.isInteger(p) && gcd(p, 100) > 1 ? [Fr(p, 100)] : []), ...fracWrong([n, d], likely)],
    why: p === 12.5 ? `12.5% = ${Fr(12.5, 100)} = ${Fr(125, 1000)} = ${Fr(1, 8)}.` : `${p}% = ${Fr(p, 100)}${p === 1 ? '' : ` = ${Fr(n, d)}`}.`,
    meta: { p },
  })
}

function m410toPct(): GameQuestion {
  const p = pick(PCT.filter((x) => x !== 12.5))
  const [n, d] = [p / gcd(p, 100), 100 / gcd(p, 100)]
  const fromDec = chance()
  const dec = p / 100
  return gq({
    t: 'toPct',
    prompt: fromDec ? `Write ${b(num(dec))} as a percentage.` : `Write ${Fr(n, d)} as a percentage.`,
    correct: `${num(p)}%`,
    // moved the decimal point the wrong number of places, kept the digits, took it from 100
    wrong: pctWrong(p, [p / 10, p * 10, fromDec ? dec : n, 100 - p]),
    why: fromDec ? `Multiply by 100: ${num(dec)} ${TIMES} 100 = ${num(p)}%.` : `${Fr(n, d)} = ${Fr(p, 100)} = ${num(p)}%.`,
    meta: { p, fromDec },
  })
}

function m410toDec(): GameQuestion {
  const p = pick([3, 4, 6, 7, 8, 9, 15, 35, 45, 65, 85, 120, 150])
  return gq({
    t: 'toDec',
    prompt: `Write ${b(`${p}%`)} as a decimal.`,
    correct: num(p / 100),
    wrong: [num(p / 10), num(p), num(p / 1000)],
    why: `Divide by 100: ${p} ${DIVIDE} 100 = ${num(p / 100)}.`,
    meta: { p },
  })
}

function m410order(): GameQuestion {
  const ps = sample([5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 65, 70, 75, 80, 90], 4)
  const forms = shuffle(['pct', 'dec', 'frac', pick(['dec', 'frac'])])
  const show = (p: number, f: string) => (f === 'pct' ? `${p}%` : f === 'dec' ? num(p / 100) : F(p, 100))
  const largest = chance()
  const want = largest ? Math.max(...ps) : Math.min(...ps)
  const at = ps.indexOf(want)
  return gq({
    t: 'order',
    prompt: `Which is the ${b(largest ? 'largest' : 'smallest')}?`,
    correct: show(want, forms[at]),
    inOrder: ps.map((p, i) => show(p, forms[i])),
    why: `As percentages: ${ps.map((p, i) => (forms[i] === 'pct' ? `${p}%` : `${show(p, forms[i])} = ${p}%`)).join(', ')}. The ${largest ? 'largest' : 'smallest'} is ${show(want, forms[at])}.`,
    meta: { ps, forms, largest },
  })
}

const SET_410: GameSet = {
  id: 'ncm7-4.10',
  exercise: '4.10',
  ref: 'NCM 7 Ex 4.10',
  title: 'Percentages, fractions and decimals',
  focus: 'Convert between percentages, fractions and decimals, and compare them.',
  lessons: ['y7-pct-convert'],
  outcomes: [FRC],
  makers: [mk('toPct', m410toPct), mk('toFrac', m410toFrac), mk('toDec', m410toDec), mk('order', m410order, 2)],
}

// ================================================================== 4.11 Percentage of a quantity

/** a friendly percentage, and what the quantity must be a multiple of for a whole-number answer */
const PCT_OF: Q[] = [[10, 10], [20, 5], [25, 4], [50, 2], [5, 20], [1, 100], [75, 4], [30, 10], [15, 20], [40, 5]]

function pctOfWhy(p: number, q: number, show: (x: number) => string): string {
  const [n, d] = [p / gcd(p, 100), 100 / gcd(p, 100)]
  const ans = (q * p) / 100
  return `${p}% = ${Fr(n, d)}, so ${show(q)} ${DIVIDE} ${d} = ${show(q / d)}${n > 1 ? `, then ${TIMES} ${n} = ${show(ans)}` : ''}.`
}

function m411of(): GameQuestion {
  const [p, mult] = pick(PCT_OF)
  const q = mult * int(2, 20)
  const ans = (q * p) / 100
  const money = chance()
  const show = (x: number) => (money ? `$${num(x)}` : num(x))
  return gq({
    t: 'pctOf',
    prompt: `Find ${b(`${p}%`)} of ${b(show(q))}.`,
    correct: show(ans),
    // divided by the percentage, a power of 10 out, found the rest
    wrong: intWrong(ans, [q / p, ans * 10, q - ans, ans / 10]).map(show),
    why: pctOfWhy(p, q, show),
    meta: { p, q, money },
  })
}

function m411story(): GameQuestion {
  const [p, mult] = pick(PCT_OF.filter(([x]) => x !== 1))
  const kind = int(0, 2)
  const q = mult * (kind === 2 ? 5 * int(2, 10) : int(2, 20))
  const ans = (q * p) / 100
  const show = (x: number) => (kind === 0 ? `$${num(x)}` : kind === 2 ? `${num(x)} g` : num(x))
  const prompt = [
    `A $${q} jacket has ${p}% off. How much money is taken off the price?`,
    `Of the ${q} students in Year 7, ${p}% catch a bus to school. How many students is that?`,
    `A ${q} g bag of trail mix is ${p}% nuts. What mass of nuts is in the bag?`,
  ][kind]
  return gq({
    t: 'story',
    prompt,
    correct: show(ans),
    // found the rest, divided by the percentage, a power of 10 out, added
    wrong: intWrong(ans, [q - ans, q / p, ans * 10, ans + p]).map(show),
    why: pctOfWhy(p, q, show),
    meta: { p, q, kind },
  })
}

function m411tenPct(): GameQuestion {
  const p = pick([20, 30, 40, 50, 5, 15])
  const X = p % 10 === 5 ? 2 * int(2, 12) : int(2, 15)
  const ans = (X * p) / 10
  const why =
    p === 5
      ? `5% is half of 10%: ${X} ${DIVIDE} 2 = ${ans}.`
      : p === 15
        ? `15% = 10% + 5% = ${X} + ${X / 2} = ${ans}.`
        : `${p}% is ${p / 10} lots of 10%: ${p / 10} ${TIMES} ${X} = ${ans}.`
  return gq({
    t: 'tenPct',
    prompt: `10% of a number is ${b(String(X))}. What is ${b(`${p}%`)} of the number?`,
    correct: num(ans),
    // multiplied by the percentage, the number itself, added
    wrong: intWrong(ans, [X * p, X * 10, X + p, ans + X]).map((x) => num(x)),
    why,
    meta: { p, X },
  })
}

const SET_411: GameSet = {
  id: 'ncm7-4.11',
  exercise: '4.11',
  ref: 'NCM 7 Ex 4.11',
  title: 'Percentage of a quantity',
  focus: 'Find a percentage of a quantity, using friendly percentages such as 10%, 25% and 50%.',
  lessons: ['y7-pct-of'],
  outcomes: [FRC],
  makers: [mk('pctOf', m411of), mk('story', m411story), mk('tenPct', m411tenPct, 2)],
}

// ================================================================== 4.12 Expressing quantities as fractions and percentages

function m412pct(): GameQuestion {
  const total = pick([4, 5, 10, 20, 25, 50])
  const part = int(1, total - 1)
  const p = (part * 100) / total
  const name = pick(NAMES)
  return gq({
    t: 'asPct',
    prompt: `${name} scored ${b(`${part} out of ${total}`)} in a quiz. What percentage is that?`,
    correct: `${num(p)}%`,
    // the score as a percentage, the marks lost, a power of 10 out
    wrong: pctWrong(p, [part, 100 - p, p / 10]),
    why: `${Fr(part, total)} = ${Fr(p, 100)} = ${num(p)}%.`,
    meta: { part, total },
  })
}

const WHOLES: { whole: string; size: number; small: string; step: number }[] = [
  { whole: 'an hour', size: 60, small: 'minutes', step: 5 },
  { whole: 'a day', size: 24, small: 'hours', step: 1 },
  { whole: 'a kilogram', size: 1000, small: 'g', step: 50 },
  { whole: 'a litre', size: 1000, small: 'mL', step: 50 },
  { whole: 'a metre', size: 100, small: 'cm', step: 5 },
  { whole: 'a dollar', size: 100, small: 'cents', step: 5 },
  { whole: 'a kilometre', size: 1000, small: 'm', step: 50 },
]

function m412frac(): GameQuestion {
  const w = pick(WHOLES)
  const part = w.step * int(w.step === 1 ? 2 : 1, w.size / w.step - 1)
  return gq({
    t: 'asFrac',
    prompt: `What fraction of ${w.whole} is ${b(`${num(part)} ${w.small}`)}? Give it in simplest form.`,
    correct: F(part, w.size),
    // as if there were 100 in the whole, the rest, one over the part
    wrong: fracWrong([part, w.size], [[part, 100], [w.size - part, w.size], [1, part]]),
    why: `${w.whole[0].toUpperCase() + w.whole.slice(1)} is ${num(w.size)} ${w.small}, so the fraction is ${Fr(part, w.size)} = ${F(part, w.size)}.`,
    meta: { part, size: w.size },
  })
}

const UNITS_412: { big: string; small: string; k: number }[] = [
  { big: 'm', small: 'cm', k: 100 },
  { big: 'km', small: 'm', k: 1000 },
  { big: 'kg', small: 'g', k: 1000 },
  { big: 'L', small: 'mL', k: 1000 },
  { big: 'h', small: 'min', k: 60 },
  { big: '$', small: 'cents', k: 100 },
]

function m412units(): GameQuestion {
  const u = pick(UNITS_412)
  const W = u.big === 'h' ? int(1, 2) : int(1, 4)
  const p = 5 * int(1, 19)
  const part = (p * u.k * W) / 100
  const whole = u.big === '$' ? `$${W}` : `${W} ${u.big}`
  return gq({
    t: 'pctUnits',
    prompt: `What percentage of ${b(whole)} is ${b(`${num(part)} ${u.small}`)}?`,
    correct: `${p}%`,
    // the part as a percentage, the rest, the whole as a percentage of the part, a power of 10 out
    wrong: pctWrong(p, [part, 100 - p, 10000 / p, p / 10]),
    why: `${whole} = ${num(u.k * W)} ${u.small}, and ${Fr(part, u.k * W)} = ${p}%.`,
    meta: { p, W, unit: u.big },
  })
}

const SET_412: GameSet = {
  id: 'ncm7-4.12',
  exercise: '4.12',
  ref: 'NCM 7 Ex 4.12',
  title: 'Expressing quantities as fractions and percentages',
  focus: 'Write one quantity as a fraction or percentage of another, changing to the same unit first.',
  lessons: ['y7-pct-convert'],
  outcomes: [FRC],
  makers: [mk('asPct', m412pct), mk('asFrac', m412frac), mk('pctUnits', m412units, 2)],
}

export const NCM7_CH4: GameChapter = {
  id: 'ncm7-ch4',
  number: 4,
  title: 'Fractions and percentages',
  ref: 'NCM 7 Chapter 4',
  strand: 'Number and algebra',
  outcomes: [FRC],
  sets: [SET_401, SET_402, SET_403, SET_404, SET_405, SET_406, SET_407, SET_408, SET_409, SET_410, SET_411, SET_412],
  colour: 330,
  topics: ['y7-fractions'],
}
