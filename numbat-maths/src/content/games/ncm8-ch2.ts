// Class games for New Century Maths 8 (3rd edition, Cengage) Chapter 2, Working with numbers: one set of quick
// questions for each exercise, 2.01 to 2.12.
//
// Much of this chapter revises Year 7 skills (integers, decimals, powers, prime factors), so those sets reuse the
// matching NCM 7 question kinds, which are already checked; the test routes them to the same independent checks.
// New kinds cover mental strategies, terminating decimals, powers of negative numbers, squaring surds and the index
// laws (tests/game-checks/ncm8-ch2.ts).
//
// Syllabus: NSW Mathematics K–10 (2022), Stage 4: Integers MA4-INT-C-01 (2.02–2.04), Fractions, decimals and
// percentages MA4-FRC-C-01 (2.05–2.07), Indices MA4-IND-C-01 (2.08, 2.10–2.12). 2.01 (mental calculation) is
// revision; 2.09 (simplifying surds) is starred as extension in the textbook and surds belong to the Stage 5 path.
// HCF (2.10) is listed under MA4-FRC-C-01.
//
// Audit against the textbook, exercise by exercise (Nov 2026): added integer word problems (2.02), adding and
// subtracting decimals (2.05), estimating square and cube roots (2.08), simplifying surds (2.09), HCF and LCM from
// prime factors (2.10) and simplifying then evaluating with the index laws (2.11). Not added: the book's index laws
// with pronumerals (2.11, 2.12), which the syllabus places in Stage 5 (Stage 4 index laws use numerical bases).
import type { GameChapter, GameMaker, GameQuestion, GameSet } from '@/lib/game/types'
import { DIVIDE, MINUS, TIMES, cbrt, chance, frac, gcd, gq, int, mk, num, pick, sqrt } from './helpers'
import { NCM7_CH1 } from './ncm7-ch1'
import { NCM7_CH3 } from './ncm7-ch3'
import { NCM7_CH5 } from './ncm7-ch5'
import { NCM7_CH7 } from './ncm7-ch7'
import { NCM9_CH2 } from './ncm9-ch2'
import { reuse } from './reuse'

const INT = 'MA4-INT-C-01'
const FRC = 'MA4-FRC-C-01'
const IND = 'MA4-IND-C-01'
const REVISION = 'Revision: mental strategies for the four operations come from earlier stages.'
const EXTENSION = 'Marked as extension in the textbook; surds are part of the Stage 5 path (MA5-IND-P-02).'
const big = (s: string) => `<div class="big">${s}</div>`
const pw = (b: number | string, e: number) => `${typeof b === 'number' && b < 0 ? `(${num(b)})` : b}<sup>${e}</sup>`
/** NCM 7 question kinds reused here, by exercise and kind */
function from(ch: GameChapter, ex: string, ...ts: string[]): GameMaker[] {
  const s = ch.sets.find((x) => x.exercise === ex)!
  return ts.map((t) => s.makers.find((m) => m.t === t)!)
}
/**
 * Wrong answers in index form [base, index], most likely first. A candidate equal in value to the answer (for
 * example 4² for 2⁴) is skipped, and so is one equal to another candidate.
 */
function idxWrong(base: number, e: number, cands: [number, number][]): string[] {
  const val = (b: number, x: number) => BigInt(b) ** BigInt(x)
  const right = val(base, e)
  const seen = new Set<bigint>([right])
  const out: string[] = []
  for (const [b, x] of [...cands, [base, e + 1], [base, e + 2], [base, e > 2 ? e - 1 : e + 3], [base, 2 * e + 1]] as [number, number][]) {
    if (x < 1 || b < 1) continue
    const v = val(b, x)
    if (seen.has(v)) continue
    seen.add(v)
    out.push(pw(b, x))
    if (out.length === 3) break
  }
  return out
}
/** three different wrong whole numbers (negatives allowed), likely first */
function intWrong(right: number, likely: number[]): string[] {
  const out: number[] = []
  for (const x of [...likely, right + 1, right - 1, -right, right + 10]) {
    if (x !== right && Number.isInteger(x) && !out.includes(x)) out.push(x)
    if (out.length === 3) break
  }
  return out.map((x) => num(x))
}

// ================================================================== 2.01 Mental calculation

function m201compensate(): GameQuestion {
  const add = chance()
  const near = pick([100, 200, 300])
  // big enough that a subtraction stays positive
  const a = int(near + 50, 900)
  const off = int(1, 6)
  const bv = near - off
  const ans = add ? a + bv : a - bv
  return gq({
    t: 'compensate',
    prompt: `Evaluate in your head:${big(`${a} ${add ? '+' : MINUS} ${bv}`)}`,
    correct: num(ans),
    // the adjustment made the wrong way
    wrong: intWrong(ans, add ? [a + near + off, ans + 10, ans - 10] : [a - near - off, ans + 10, ans - 10]),
    why: add ? `${a} + ${near} = ${a + near}, then take away ${off}: ${ans}.` : `${a} − ${near} = ${a - near}, then add ${off} back: ${ans}.`,
    meta: { a, bv, add },
  })
}

const SET_201: GameSet = {
  id: 'ncm8-2.01',
  exercise: '2.01',
  ref: 'NCM 8 Ex 2.01',
  title: 'Mental calculation',
  focus: 'Add, subtract and multiply in the head by rounding and adjusting, and by pairing friendly numbers.',
  outcomes: [],
  teacherNote: REVISION,
  makers: [mk('compensate', m201compensate), ...from(NCM7_CH5, '5.01', 'sum', 'product'), ...from(NCM7_CH5, '5.02', 'nine')],
}

// ================================================================== 2.02–2.04 Integers (reused from NCM 7 Chapter 1)

const SET_202: GameSet = {
  id: 'ncm8-2.02',
  exercise: '2.02',
  ref: 'NCM 8 Ex 2.02',
  title: 'Adding and subtracting integers',
  focus: 'Add and subtract positive and negative integers.',
  outcomes: [INT],
  makers: [
    ...from(NCM7_CH1, '1.04', 'negPlusPos', 'posPlusNeg', 'negPlusNeg'),
    ...from(NCM7_CH1, '1.05', 'negMinusPos', 'minusNeg'),
    reuse(NCM7_CH1, '1.10', 'temperature'),
    reuse(NCM7_CH1, '1.10', 'difference'),
  ],
}

const SET_203: GameSet = {
  id: 'ncm8-2.03',
  exercise: '2.03',
  ref: 'NCM 8 Ex 2.03',
  title: 'Multiplying and dividing integers',
  focus: 'Multiply and divide integers: the same signs give a positive answer, different signs a negative one.',
  outcomes: [INT],
  makers: [...from(NCM7_CH1, '1.06', 'negTimesPos', 'negTimesNeg', 'square'), ...from(NCM7_CH1, '1.07', 'negDivNeg', 'posDivNeg')],
}

const SET_204: GameSet = {
  id: 'ncm8-2.04',
  exercise: '2.04',
  ref: 'NCM 8 Ex 2.04',
  title: 'Order of operations',
  focus: 'Brackets first, then powers, then × and ÷, then + and −, with integers.',
  outcomes: [INT],
  makers: from(NCM7_CH1, '1.08', 'multFirst', 'brackets', 'divideFirst', 'powers'),
}

// ================================================================== 2.05–2.07 Decimals

const SET_205: GameSet = {
  id: 'ncm8-2.05',
  exercise: '2.05',
  ref: 'NCM 8 Ex 2.05',
  title: 'Decimals',
  focus: 'Order decimals place by place, and round them.',
  outcomes: [FRC],
  makers: [...from(NCM7_CH7, '7.01', 'order', 'between'), ...from(NCM7_CH7, '7.10', 'round', 'carry'), reuse(NCM7_CH7, '7.03', 'add'), reuse(NCM7_CH7, '7.03', 'sub')],
}

const SET_206: GameSet = {
  id: 'ncm8-2.06',
  exercise: '2.06',
  ref: 'NCM 8 Ex 2.06',
  title: 'Multiplying and dividing decimals',
  focus: 'Multiply and divide decimals, placing the decimal point by counting places and estimating.',
  outcomes: [FRC],
  makers: [...from(NCM7_CH7, '7.06', 'whole', 'times', 'small'), ...from(NCM7_CH7, '7.08', 'divide', 'rewrite')],
}

const TERM_DENS = [2, 4, 5, 8, 20, 25, 40, 50]

function m207term(): GameQuestion {
  let n: number, d: number
  do {
    d = pick(TERM_DENS)
    n = int(1, d - 1)
  } while (gcd(n, d) !== 1)
  const v = n / d
  const cand = [Number(`0.${n}${d}`), Number(`0.${n}`), n / d / 10, n / d * 10, Number((v + 0.1).toPrecision(6))]
  const wrong: string[] = []
  for (const c of cand) {
    const x = Number(c.toPrecision(10))
    if (x !== v && !wrong.includes(num(x))) wrong.push(num(x))
  }
  return gq({
    t: 'term',
    prompt: `Write as a decimal:${big(frac(n, d))}`,
    correct: num(v),
    wrong,
    why: `${n} ${DIVIDE} ${d} = ${num(v)}. It stops, so it is a terminating decimal.`,
    meta: { n, d },
  })
}

const SET_207: GameSet = {
  id: 'ncm8-2.07',
  exercise: '2.07',
  ref: 'NCM 8 Ex 2.07',
  title: 'Terminating and recurring decimals',
  focus: 'Convert fractions to terminating decimals, and recognise and write recurring decimals.',
  outcomes: [FRC],
  makers: [mk('term', m207term), ...from(NCM7_CH7, '7.09', 'which', 'convert')],
}

// ================================================================== 2.08 Powers and roots

function m208negPower(): GameQuestion {
  const b = -int(2, 5)
  const e = b <= -4 ? int(2, 3) : int(2, 4)
  const v = b ** e
  return gq({
    t: 'negPower',
    prompt: `Evaluate:${big(pw(b, e))}`,
    correct: num(v),
    // the sign lost or forced, the base times the power
    wrong: intWrong(v, [-v, b * e, -(b * e), v + b]),
    why: `${Array(e).fill(`(${num(b)})`).join(` ${TIMES} `)} = ${num(v)}: ${e % 2 === 0 ? 'an even number of negatives gives a positive' : 'an odd number of negatives gives a negative'}.`,
    meta: { b, e },
  })
}

function m208estimate(): GameQuestion {
  const p = chance() ? 3 : 2
  let x: number, lo: number
  do {
    x = p === 3 ? int(10, 400) : int(20, 300)
    lo = 1
    while ((lo + 1) ** p <= x) lo++
  } while (lo ** p === x)
  const root = p === 3 ? cbrt(x) : sqrt(x)
  const pair = (a: number) => `${a} and ${a + 1}`
  const h = Math.floor(x / p)
  return gq({
    t: 'estimate',
    prompt: `${root} lies between which two whole numbers?`,
    correct: pair(lo),
    // the number divided by the index, one pair out either way
    wrong: [pair(h), pair(lo - 1), pair(lo + 1), pair(lo + 2)],
    why: `${lo}<sup>${p}</sup> = ${lo ** p} and ${lo + 1}<sup>${p}</sup> = ${(lo + 1) ** p}. ${x} is between them, so ${root} is between ${pair(lo)}.`,
    meta: { x, p },
  })
}

const SET_208: GameSet = {
  id: 'ncm8-2.08',
  exercise: '2.08',
  ref: 'NCM 8 Ex 2.08',
  title: 'Powers and roots',
  focus: 'Write and evaluate powers (including of negative numbers), square roots and cube roots, and estimate roots.',
  outcomes: [IND],
  makers: [...from(NCM7_CH3, '3.07', 'write', 'evaluate'), ...from(NCM7_CH3, '3.08', 'sqrt', 'cbrt'), mk('negPower', m208negPower, 2), mk('estimate', m208estimate)],
}

// ================================================================== 2.09 Simplifying surds (extension)

function m209square(): GameQuestion {
  const a = pick([2, 3, 5, 6, 7, 10, 11, 13, 15])
  const kind = int(0, 2)
  const expr = kind === 0 ? `(${sqrt(a)})<sup>2</sup>` : kind === 1 ? `${sqrt(a)} ${TIMES} ${sqrt(a)}` : sqrt(`${a}<sup>2</sup>`)
  return gq({
    t: 'square',
    prompt: `Simplify:${big(expr)}`,
    correct: num(a),
    // squared the number, doubled it, left the root
    wrong: [num(a * a), num(2 * a), sqrt(a), `2${sqrt(a)}`],
    why: kind === 2 ? `The square root undoes the square: ${sqrt(`${a}<sup>2</sup>`)} = ${a}.` : `Squaring undoes the square root: ${sqrt(a)} ${TIMES} ${sqrt(a)} = ${a}.`,
    meta: { a, kind },
  })
}

function m209product(): GameQuestion {
  const [a, c] = pick([[2, 8], [3, 12], [2, 18], [5, 20], [3, 27], [2, 32], [6, 24], [5, 45], [7, 28]] as [number, number][])
  const [x, y] = chance() ? [a, c] : [c, a]
  const v = Math.sqrt(a * c)
  return gq({
    t: 'product',
    prompt: `Simplify:${big(`${sqrt(x)} ${TIMES} ${sqrt(y)}`)}`,
    correct: num(v),
    // the numbers added, the product left under the root, a root of the sum
    // (√(a×c) itself would be equal to the answer, so it is not offered)
    wrong: [sqrt(a + c), num(a * c), num(v * 2), num(v + 1)],
    why: `${sqrt(x)} ${TIMES} ${sqrt(y)} = ${sqrt(a * c)} = ${v}.`,
    meta: { a, c },
  })
}

const SET_209: GameSet = {
  id: 'ncm8-2.09',
  exercise: '2.09',
  ref: 'NCM 8 Ex 2.09',
  title: 'Simplifying surds',
  focus: 'Squaring a square root gives the number back: (√7)² = 7.',
  outcomes: [],
  teacherNote: EXTENSION,
  makers: [mk('square', m209square), mk('product', m209product, 2), reuse(NCM9_CH2, '2.03', 'simplify')],
}

// ================================================================== 2.10 Factor trees

const PRIMES = [2, 3, 5, 7]
/** a number from its prime-power indices [for 2, 3, 5, 7], written as a product of prime factors */
const fromIdx = (e: number[]) => e.reduce((v, k, i) => v * PRIMES[i] ** k, 1)
const factored = (e: number[]) =>
  e
    .map((k, i) => (k === 0 ? '' : k === 1 ? `${PRIMES[i]}` : `${PRIMES[i]}<sup>${k}</sup>`))
    .filter(Boolean)
    .join(` ${TIMES} `)

function m210hcfLcm(): GameQuestion {
  let e1: number[], e2: number[], a: number, b: number, h: number
  do {
    e1 = [int(0, 3), int(0, 2), int(0, 1), int(0, 1)]
    e2 = [int(0, 3), int(0, 2), int(0, 1), int(0, 1)]
    a = fromIdx(e1)
    b = fromIdx(e2)
    h = fromIdx(e1.map((k, i) => Math.min(k, e2[i])))
  } while (a < 12 || b < 12 || a > 400 || b > 400 || h === 1 || h === a || h === b || e1.filter(Boolean).length < 2 || e2.filter(Boolean).length < 2)
  const lcm = chance()
  const l = (a * b) / h
  // common primes at their higher power (a usual slip for the HCF), every prime at its lower power
  const hiCommon = fromIdx(e1.map((k, i) => (Math.min(k, e2[i]) ? Math.max(k, e2[i]) : 0)))
  const loAll = fromIdx(e1.map((k, i) => (k && e2[i] ? Math.min(k, e2[i]) : k || e2[i] ? 1 : 0)))
  const ans = lcm ? l : h
  const wrong = (lcm ? [h, a * b, loAll, l * 2, l * 3] : [hiCommon, l, h * 2, h / PRIMES[e1.findIndex((k, i) => Math.min(k, e2[i]) > 0)], h * 3]).filter((x) => x !== ans && Number.isInteger(x))
  const lo = e1.map((k, i) => Math.min(k, e2[i]))
  const hi = e1.map((k, i) => Math.max(k, e2[i]))
  return gq({
    t: 'hcfLcm',
    prompt: `${a} = ${factored(e1)} and ${b} = ${factored(e2)}. What is the ${lcm ? 'lowest common multiple (LCM)' : 'highest common factor (HCF)'} of ${a} and ${b}?`,
    correct: num(ans),
    wrong: wrong.map((x) => num(x)),
    why: lcm
      ? `Take every prime factor at its higher power: ${factored(hi)} = ${num(l)}.`
      : `Take only the prime factors in both numbers, at the lower power: ${factored(lo)} = ${num(h)}.`,
    meta: { a, b, lcm },
  })
}

const SET_210: GameSet = {
  id: 'ncm8-2.10',
  exercise: '2.10',
  ref: 'NCM 8 Ex 2.10',
  title: 'Factor trees',
  focus: 'Write a number as a product of its prime factors, in index notation, and use it to find the HCF and LCM.',
  outcomes: [IND, FRC],
  makers: [...from(NCM7_CH3, '3.10', 'value', 'form'), mk('hcfLcm', m210hcfLcm, 2)],
}

// ================================================================== 2.11 and 2.12 Index laws

const BASES = [2, 3, 4, 5, 6, 7, 8, 9, 10]

function m211multiply(): GameQuestion {
  const a = pick(BASES)
  const m = int(2, 9)
  const n = int(2, 9)
  return gq({
    t: 'multiply',
    prompt: `Simplify, using index notation:${big(`${pw(a, m)} ${TIMES} ${pw(a, n)}`)}`,
    correct: pw(a, m + n),
    // multiplied the indices, multiplied the bases as well
    wrong: idxWrong(a, m + n, [[a, m * n], [a * a, m + n], [a * a, m * n]]),
    why: `Same base, multiplying: add the indices. ${m} + ${n} = ${m + n}, so ${pw(a, m + n)}.`,
    meta: { a, m, n },
  })
}

function m211divide(): GameQuestion {
  const a = pick(BASES)
  const n = int(2, 6)
  const m = n + int(1, 8)
  return gq({
    t: 'divide',
    prompt: `Simplify, using index notation:${big(`${pw(a, m)} ${DIVIDE} ${pw(a, n)}`)}`,
    correct: pw(a, m - n),
    // added the indices, divided them, divided the bases too
    wrong: idxWrong(a, m - n, [[a, m + n], ...(m % n === 0 ? [[a, m / n] as [number, number]] : []), [a, m * n]]),
    why: `Same base, dividing: subtract the indices. ${m} − ${n} = ${m - n}, so ${pw(a, m - n)}.`,
    meta: { a, m, n },
  })
}

function m211mixed(): GameQuestion {
  const a = pick(BASES)
  const m = int(2, 7)
  const n = int(2, 7)
  const p = int(2, m + n - 1)
  return gq({
    t: 'mixed',
    prompt: `Simplify, using index notation:${big(`${pw(a, m)} ${TIMES} ${pw(a, n)} ${DIVIDE} ${pw(a, p)}`)}`,
    correct: pw(a, m + n - p),
    wrong: idxWrong(a, m + n - p, [[a, m * n - p], [a, m + n + p], [a, Math.abs(m - n) + p]]),
    why: `Add the indices for ×, subtract for ÷: ${m} + ${n} − ${p} = ${m + n - p}, so ${pw(a, m + n - p)}.`,
    meta: { a, m, n, p },
  })
}

function m211value(): GameQuestion {
  const a = pick([2, 2, 3, 10])
  const e = a === 2 ? int(4, 7) : a === 3 ? int(3, 4) : int(3, 5)
  const div = chance()
  // multiply: m + n = e; divide: (e + n) − n = e
  const n = div ? int(2, 4) : int(1, e - 1)
  const m = div ? e + n : e - n
  const v = a ** e
  const likely = div ? [Number.isInteger(m / n) ? a ** (m / n) : a ** (m + n), a * e] : [a ** (m * n), a * e]
  return gq({
    t: 'value',
    prompt: `Simplify, then evaluate:${big(`${pw(a, m)} ${div ? DIVIDE : TIMES} ${pw(a, n)}`)}`,
    correct: num(v),
    // indices multiplied or divided, base times index; spares one power out
    wrong: [...likely, a ** (e + 1), a ** (e - 1), 3 * v, a ** (e + 2)].filter((x) => x !== v).map((x) => num(x)),
    why: `Same base, so ${div ? 'subtract' : 'add'} the indices: ${m} ${div ? MINUS : '+'} ${n} = ${e}, and ${pw(a, e)} = ${num(v)}.`,
    meta: { a, m, n, div },
  })
}

const SET_211: GameSet = {
  id: 'ncm8-2.11',
  exercise: '2.11',
  ref: 'NCM 8 Ex 2.11',
  title: 'Index laws for multiplying and dividing',
  lessons: ['y8-ind-muldiv'],
  focus: 'With the same base, add the indices to multiply and subtract them to divide.',
  outcomes: [IND],
  makers: [mk('multiply', m211multiply), mk('divide', m211divide), mk('mixed', m211mixed, 2), mk('value', m211value)],
}

function m212power(): GameQuestion {
  const a = pick(BASES)
  const m = int(2, 6)
  const n = int(2, 5)
  return gq({
    t: 'power',
    prompt: `Simplify, using index notation:${big(`(${pw(a, m)})<sup>${n}</sup>`)}`,
    correct: pw(a, m * n),
    // added the indices, multiplied the base by the outside index
    wrong: idxWrong(a, m * n, [[a, m + n], [a * n, m], [a * n, m * n]]),
    why: `A power of a power: multiply the indices. ${m} ${TIMES} ${n} = ${m * n}, so ${pw(a, m * n)}.`,
    meta: { a, m, n },
  })
}

function m212zero(): GameQuestion {
  const a = int(2, 15)
  const k = int(2, 9)
  const withK = chance()
  const v = withK ? k : 1
  return gq({
    t: 'zero',
    prompt: `Evaluate:${big(withK ? `${k} ${TIMES} ${pw(a, 0)}` : pw(a, 0))}`,
    correct: num(v),
    // a power of 0 taken as 0, or as the base
    wrong: withK ? [num(0), num(k * a), num(1), num(k + 1)] : [num(0), num(a), num(10), num(a - 1)],
    why: withK ? `${pw(a, 0)} = 1, so ${k} ${TIMES} 1 = ${k}.` : `Any non-zero number to the power 0 is 1: ${pw(a, 0)} = 1.`,
    meta: { a, k, withK },
  })
}

const SET_212: GameSet = {
  id: 'ncm8-2.12',
  exercise: '2.12',
  ref: 'NCM 8 Ex 2.12',
  title: 'More index laws',
  lessons: ['y8-ind-power-zero'],
  focus: 'Multiply indices for a power of a power, and know that any non-zero number to the power 0 is 1.',
  outcomes: [IND],
  makers: [mk('power', m212power), mk('zero', m212zero)],
}

export const NCM8_CH2: GameChapter = {
  id: 'ncm8-ch2',
  number: 2,
  title: 'Working with numbers',
  ref: 'NCM 8 Chapter 2',
  strand: 'Number and algebra',
  outcomes: [INT, FRC, IND],
  sets: [SET_201, SET_202, SET_203, SET_204, SET_205, SET_206, SET_207, SET_208, SET_209, SET_210, SET_211, SET_212],
  colour: 18,
  topics: ['y8-indices'],
}
