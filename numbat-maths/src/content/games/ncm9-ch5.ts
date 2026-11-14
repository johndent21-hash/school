// Class games for New Century Maths 9 Advanced (Cengage) Chapter 5, Indices: one set of quick questions for each
// exercise, 5.01 to 5.11.
//
// The index laws for multiplying, dividing and powers of powers revise and extend NCM 8 Chapters 2 and 3, so those sets
// reuse their kinds (checked by those chapters' checks, see reuse.ts). New kinds: powers of products and quotients,
// the zero index with coefficients, negative indices (numbers and pronumerals), fractional indices, significant
// figures and scientific notation (tests/game-checks/ncm9-ch5.ts).
//
// Syllabus: NSW Mathematics K–10 (2022), Stage 5.
// - Core, Indices A, MA5-IND-C-01: index laws with algebra, the zero index, negative indices with numerical bases.
// - Core, Measurement and magnitude, MA5-MAG-C-01: significant figures and scientific notation (5.09–5.11).
// - Path, Indices B, MA5-IND-P-01: negative indices with pronumerals (in 5.05, noted on the set).
// - Path, Indices C, MA5-IND-P-02: fractional indices (5.06–5.07, starred): extension.
import type { GameChapter, GameQuestion, GameSet } from '@/lib/game/types'
import { chance, ex, frac, gq, int, intExcept, mk, num, pick, sample } from './helpers'
import { NCM8_CH2 } from './ncm8-ch2'
import { NCM8_CH3 } from './ncm8-ch3'
import { reuse } from './reuse'

const IND = 'MA5-IND-C-01'
const MAG = 'MA5-MAG-C-01'
const FRAC_NOTE = 'Stage 5 Path content (Indices C, MA5-IND-P-02): extension beyond the core.'
const big = (s: string) => `<div class="big">${s}</div>`
const b = (s: string) => `<b>${s}</b>`
const E = ex
const LET = ['a', 'b', 'm', 'n', 'p', 'x', 'y']
const pickWrong = (right: string, likely: string[]) => likely.filter((w, i) => w !== right && likely.indexOf(w) === i)
/** a power as ex() source: "x^3", "x" (power 1), "1"-free coefficients: (3, 'x', 2) → "3x^2" */
const pw = (L: string, n: number) => (n === 0 ? '' : n === 1 ? L : `${L}^${n}`)
const mono = (c: number, parts: [string, number][]) => {
  const body = parts.map(([L, n]) => pw(L, n)).join('')
  return c === 1 && body ? body : c === -1 && body ? `-${body}` : `${c}${body}`
}

const set = (exn: string, title: string, focus: string, outcomes: string[], makers: GameSet['makers'], note?: string): GameSet => ({
  id: `ncm9-${exn}`,
  exercise: exn,
  ref: `NCM 9 Ex ${exn}`,
  title,
  focus,
  outcomes,
  makers,
  ...(note ? { teacherNote: note } : {}),
})

// ================================================================== 5.01, 5.02 index laws (reuse)

const SET_501 = set('5.01', 'Multiplying and dividing terms with the same base', 'Multiply: add the indices. Divide: subtract the indices.', [IND], [
  reuse(NCM8_CH2, '2.11', 'multiply'),
  reuse(NCM8_CH2, '2.11', 'divide'),
  reuse(NCM8_CH3, '3.06', 'laws'),
])

function m502alg(): GameQuestion {
  const L = pick(LET)
  const c = int(2, 5)
  const m = int(2, 6)
  const n = int(2, 4)
  const right = mono(c ** n, [[L, m * n]])
  return gq({
    t: 'alg',
    prompt: `Simplify:${big(E(`(${mono(c, [[L, m]])})^${n}`))}`,
    correct: E(right),
    // the number not raised to the power, the indices added, the number multiplied by the power
    wrong: pickWrong(E(right), [E(mono(c, [[L, m * n]])), E(mono(c ** n, [[L, m + n]])), E(mono(c * n, [[L, m * n]])), E(mono(c ** n, [[L, m ** n]])), E(mono(c * n, [[L, m + n]])), E(mono(c ** n, [[L, m]])), E(mono(c, [[L, m + n]])), E(mono(2 * c ** n, [[L, m * n]])), E(mono(c ** n, [[L, m * n + 1]]))]),
    why: `Raise every factor to the power ${n}: ${c}<sup>${n}</sup> = ${c ** n} and (${E(pw(L, m))})<sup>${n}</sup> = ${E(pw(L, m * n))}.`,
    meta: {},
  })
}

const SET_502 = set('5.02', 'Power of a power', '(aᵐ)ⁿ = aᵐⁿ: multiply the indices.', [IND], [reuse(NCM8_CH2, '2.12', 'power'), mk('alg', m502alg)])

// ================================================================== 5.03 Powers of products and quotients

function m503product(): GameQuestion {
  const [L1, L2] = sample(['a', 'b', 'm', 'n', 'x', 'y'], 2).sort()
  const c = int(2, 4)
  const p = int(1, 4)
  const q = int(1, 3)
  const n = int(2, 3)
  const right = mono(c ** n, [[L1, p * n], [L2, q * n]])
  return gq({
    t: 'product',
    prompt: `Simplify:${big(E(`(${mono(c, [[L1, p], [L2, q]])})^${n}`))}`,
    correct: E(right),
    wrong: pickWrong(E(right), [E(mono(c, [[L1, p * n], [L2, q * n]])), E(mono(c ** n, [[L1, p + n], [L2, q + n]])), E(mono(c * n, [[L1, p * n], [L2, q * n]])), E(mono(c ** n, [[L1, p * n], [L2, q]])), E(mono(2 * c ** n, [[L1, p * n], [L2, q * n]])), E(mono(c ** n, [[L1, p * n + 1], [L2, q * n]])), E(mono(c ** n, [[L1, p * n], [L2, q * n + 1]]))]),
    why: `Every factor inside is raised to the power ${n}: ${c}<sup>${n}</sup> = ${c ** n}, and multiply each index by ${n}: ${E(right)}.`,
    meta: {},
  })
}

function m503quotient(): GameQuestion {
  const [L1, L2] = sample(['a', 'b', 'm', 'n', 'x', 'y'], 2)
  const p = int(1, 4)
  const q = int(1, 4)
  const n = int(2, 4)
  const right = `frac{${pw(L1, p * n)}}{${pw(L2, q * n)}}`
  return gq({
    t: 'quotient',
    prompt: `Simplify:${big(E(`(frac{${pw(L1, p)}}{${pw(L2, q)}})^${n}`))}`,
    correct: E(right),
    wrong: pickWrong(E(right), [E(`frac{${pw(L1, p * n)}}{${pw(L2, q)}}`), E(`frac{${pw(L1, p + n)}}{${pw(L2, q + n)}}`), E(`frac{${pw(L1, p)}}{${pw(L2, q * n)}}`), E(`frac{${pw(L1, p * n + 1)}}{${pw(L2, q * n)}}`)]),
    why: `Raise the top and the bottom to the power ${n}: multiply each index by ${n}.`,
    meta: {},
  })
}

const SET_503 = set('5.03', 'Powers of products and quotients', '(ab)ⁿ = aⁿbⁿ and (a/b)ⁿ = aⁿ/bⁿ: raise every factor to the power.', [IND], [mk('product', m503product), mk('quotient', m503quotient)])

// ================================================================== 5.04 The zero index

function m504mix(): GameQuestion {
  const L = pick(LET)
  const c = int(2, 9)
  const k = int(0, 3)
  const [expr, val] = [
    [`${c}${L}^0`, c],
    [`(${c}${L})^0`, 1],
    [`${c}^0 + ${L}^0`, 2],
    [`${c}${L}^0 - ${c}^0`, c - 1],
  ][k] as [string, number]
  return gq({
    t: 'mix',
    prompt: `Simplify:${big(E(expr))}`,
    correct: num(val),
    // anything to the power 0 is 0, the power applies to everything, the coefficient lost
    wrong: [0, k === 0 ? 1 : c, k === 2 ? 0 : c + 1, k === 3 ? c : 2, c, 1, c + 1, c + 2].filter((x, i, a) => x !== val && a.indexOf(x) === i).map((x) => num(x)),
    why: `Any non-zero number (or pronumeral) to the power 0 is 1. ${[`Only ${E(L)} has the power 0: ${c} × 1 = ${c}.`, 'The whole bracket has the power 0, so it is 1.', '1 + 1 = 2.', `${c} × 1 − 1 = ${c - 1}.`][k]}`,
    meta: {},
  })
}

const SET_504 = set('5.04', 'The zero index', 'a⁰ = 1 for any a ≠ 0; watch what the power 0 applies to.', [IND], [reuse(NCM8_CH2, '2.12', 'zero'), reuse(NCM8_CH3, '3.06', 'zero', 'algZero'), mk('mix', m504mix)])

// ================================================================== 5.05 Negative indices

function m505evalNeg(): GameQuestion {
  const base = pick([2, 3, 4, 5, 10])
  const n = base === 10 ? int(1, 4) : base === 2 ? int(1, 5) : int(1, 3)
  const v = base ** n
  return gq({
    t: 'evalNeg',
    prompt: `Evaluate:${big(E(`${base}^-${n}`))}`,
    correct: frac(1, v),
    // a negative number, base × −n, 1/(base × n)
    wrong: pickWrong(frac(1, v), [`−${num(v)}`, `−${num(base * n)}`, frac(1, base * n), num(v), frac(1, v * base)]),
    why: `A negative index means the reciprocal: ${base}<sup>−${n}</sup> = 1/${base}<sup>${n}</sup> = 1/${num(v)}.`,
    meta: {},
  })
}

function m505alg(): GameQuestion {
  const L = pick(LET)
  const c = int(2, 9)
  const n = int(1, 5)
  const right = `frac{${c}}{${pw(L, n)}}`
  return gq({
    t: 'alg',
    prompt: `Write with a positive index:${big(E(`${c}${L}^-${n}`))}`,
    correct: E(right),
    // the coefficient moved too, a negative sign instead, the index made positive in place
    wrong: pickWrong(E(right), [E(`frac{1}{${c}${pw(L, n)}}`), E(`-${c}${pw(L, n)}`), E(`${c}${pw(L, n)}`), E(`frac{${pw(L, n)}}{${c}}`)]),
    why: `Only ${E(L)} has the negative index, so only ${E(pw(L, n))} goes to the denominator: ${E(right)}.`,
    meta: {},
  })
}

const SET_505 = set('5.05', 'Negative indices', 'a⁻ⁿ = 1/aⁿ: a negative index means the reciprocal.', [IND], [mk('evalNeg', m505evalNeg), mk('alg', m505alg, 2)], 'Negative indices with numerical bases are core (MA5-IND-C-01); with pronumerals they are Stage 5 Path (Indices B, MA5-IND-P-01): extension.')

// ================================================================== 5.06, 5.07 Fractional indices (Path)

function m506evalFrac(): GameQuestion {
  const [root, base, power] = pick([
    [2, 4, 1], [2, 9, 1], [2, 16, 1], [2, 25, 1], [2, 36, 1], [2, 49, 1], [2, 64, 1], [2, 100, 1],
    [3, 8, 1], [3, 27, 1], [3, 64, 1], [3, 125, 1],
    [2, 4, 3], [2, 9, 3], [2, 16, 3], [3, 8, 2], [3, 27, 2], [4, 16, 3], [4, 81, 3],
  ] as [number, number, number][])
  const r = Math.round(base ** (1 / root))
  const v = r ** power
  return gq({
    t: 'evalFrac',
    prompt: `Evaluate:${big(E(power === 1 ? `${base}^{frac{1}{${root}}}` : `${base}^{frac{${power}}{${root}}}`))}`,
    correct: num(v),
    // divided by the root instead of taking it, multiplied by the fraction, forgot the power
    wrong: [base / root, (base * power) / root, r, base ** power, v * 2, v + 1, v - 1].filter((x, i, a) => x !== v && Number.isInteger(x) && a.indexOf(x) === i).map((x) => num(x)),
    why: power === 1 ? `The index 1/${root} means the ${root === 2 ? 'square' : root === 3 ? 'cube' : `${root}th`} root: ${r}.` : `Take the root first, then the power: (${root === 2 ? '√' : root === 3 ? '∛' : '∜'}${base})<sup>${power}</sup> = ${r}<sup>${power}</sup> = ${num(v)}.`,
    meta: {},
  })
}

function m507surdForm(): GameQuestion {
  const L = pick(['x', 'a', 'm', 'y'])
  const k = int(0, 3)
  const [expr, right, wrong] = [
    [`${L}^{frac{1}{2}}`, `sqrt{${L}}`, [`frac{${L}}{2}`, `${L}^2`, `2${L}`]],
    [`${L}^{frac{1}{3}}`, `∛${L}`, [`frac{${L}}{3}`, `sqrt{${L}}`, `${L}^3`]],
    [`sqrt{${L}^3}`, `${L}^{frac{3}{2}}`, [`${L}^{frac{2}{3}}`, `${L}^6`, `${L}^{frac{1}{6}}`]],
    [`frac{1}{sqrt{${L}}}`, `${L}^{-frac{1}{2}}`, [`${L}^{frac{1}{2}}`, `${L}^-2`, `${L}^2`]],
  ][k] as [string, string, string[]]
  return gq({
    t: 'surdForm',
    prompt: k < 2 ? `Write in surd form:${big(E(expr))}` : `Write in index form:${big(E(expr))}`,
    correct: E(right),
    wrong: wrong.map(E),
    why: ['The index ½ means the square root.', 'The index ⅓ means the cube root.', 'The square root is the power ½: (x³)^½ = x^(3/2).', 'The square root is the power ½, and 1 over it makes the index negative.'][k],
    meta: {},
  })
}

const SET_506 = set('5.06', 'Fractional indices', 'a^(1/n) is the nth root of a; a^(m/n): take the root, then the power.', [], [mk('evalFrac', m506evalFrac)], FRAC_NOTE)
const SET_507 = set('5.07', 'Fractional indices and surds', 'Move between index form and surd form: x^(1/2) = √x.', [], [mk('surdForm', m507surdForm), mk('evalFrac', m506evalFrac)], FRAC_NOTE)

// ================================================================== 5.08 Summary of the index laws

const SET_508 = set('5.08', 'Summary of the index laws', 'Use all the index laws together.', [IND], [
  reuse(NCM8_CH3, '3.06', 'laws'),
  mk('product', m503product),
  mk('quotient', m503quotient),
  mk('mix', m504mix),
  mk('evalNeg', m505evalNeg),
])

// ================================================================== 5.09 Significant figures

/**
 * A number and its rounding to s significant figures, worked in whole numbers (floating point would turn 0.007005 into
 * 0.0070049999… and round it the wrong way). Numbers whose rounding ends in a significant zero are skipped, because
 * that zero would not show (0.00700 would be written 0.007).
 */
function sigCase(): { x: number; s: number; right: number; small: boolean } {
  for (;;) {
    const small = chance(0.45)
    const s = int(1, 3)
    const N = small ? int(1001, 9999) : int(10_000, 999_999)
    const D = String(N).length
    const unit = 10 ** (D - s)
    const R = Math.floor(N / unit) + (N % unit >= unit / 2 ? 1 : 0)
    if (R % 10 === 0 || String(R).length > s) continue
    if (small) {
      const k = int(4, 6)
      return { x: N / 10 ** k, s, right: Number(((R * unit) / 10 ** k).toPrecision(6)), small }
    }
    return { x: N, s, right: R * unit, small }
  }
}

function m509round(): GameQuestion {
  const { x, s, right, small } = sigCase()
  const fmt = (v: number) => num(Number(v.toPrecision(10)))
  return gq({
    t: 'round',
    prompt: `Round ${b(fmt(x))} to ${b(`${s} significant figure${s === 1 ? '' : 's'}`)}.`,
    correct: fmt(right),
    // rounded to decimal places instead, truncated, one figure too many or too few
    wrong: pickWrong(fmt(right), [fmt(Number(x.toFixed(s))), fmt(Number(x.toPrecision(s + 1))), fmt(Number(x.toPrecision(s > 1 ? s - 1 : s + 2))), fmt(Number((right * 10).toPrecision(6))), fmt(Number((right / 10).toPrecision(6))), fmt(Number((right + 10 ** (Math.floor(Math.log10(right)) - s + 1)).toPrecision(6))), fmt(Number(x.toPrecision(4)))]),
    why: small ? 'Leading zeros are not significant: start counting at the first non-zero digit, then round.' : `Keep the first ${s} figure${s === 1 ? '' : 's'} and round, then fill with zeros to keep the place value: ${fmt(right)}.`,
    meta: {},
  })
}

function m509count(): GameQuestion {
  const [shown, n] = pick([
    ['0.0506', 3], ['4.80', 3], ['0.007', 1], ['3.0040', 5], ['120.5', 4], ['0.00230', 3], ['7.02', 3], ['0.1', 1], ['56.08', 4], ['0.030', 2], ['9.000', 4], ['0.4007', 4],
  ] as [string, number][])
  return gq({
    t: 'count',
    prompt: `How many significant figures does ${b(shown)} have?`,
    correct: num(n),
    wrong: [n + 1, n - 1, shown.replace(/[^0-9]/g, '').length, n + 2, n + 3].filter((x, i, a) => x > 0 && x !== n && a.indexOf(x) === i).map((x) => num(x)),
    why: `Leading zeros do not count; zeros between non-zero digits, and zeros at the end of a decimal, do. ${shown} has ${n}.`,
    meta: {},
  })
}

const SET_509 = set('5.09', 'Significant figures', 'Count significant figures from the first non-zero digit, and round to a given number of them.', [MAG], [mk('count', m509count), mk('round', m509round)])

// ================================================================== 5.10 Scientific notation

/** a number with a short mantissa and its exponent */
function sciNumber(): { m: number; e: number; x: number } {
  const m = pick([1.2, 2.5, 3, 3.6, 4.5, 5.07, 6.1, 7, 8.25, 9.4])
  const e = intExcept(-7, 9, [0, 1, -1])
  return { m, e, x: Number((m * 10 ** e).toPrecision(6)) }
}
const sci = (m: number, e: number) => E(`${num(m)}*10^${e}`)
const plainNum = (x: number) => (Math.abs(x) < 1 ? x.toFixed(12).replace(/0+$/, '') : num(x))

function m510toSci(): GameQuestion {
  const { m, e, x } = sciNumber()
  return gq({
    t: 'toSci',
    prompt: `Write in scientific notation:${big(plainNum(x))}`,
    correct: sci(m, e),
    // the power one out, the sign of the power wrong, the number of zeros as the power
    wrong: pickWrong(sci(m, e), [sci(m, e + 1), sci(m, e - 1), sci(m, -e), sci(Number((m * 10).toPrecision(6)), e - 1), sci(Number((m / 10).toPrecision(6)), e + 1)]),
    why: `Move the decimal point to make a number between 1 and 10 (${num(m)}); it moved ${Math.abs(e)} place${Math.abs(e) === 1 ? '' : 's'} ${e > 0 ? 'left, so the power is positive' : 'right, so the power is negative'}: ${sci(m, e)}.`,
    meta: {},
  })
}

function m510fromSci(): GameQuestion {
  const { m, e, x } = sciNumber()
  return gq({
    t: 'fromSci',
    prompt: `Write as a basic numeral:${big(sci(m, e))}`,
    correct: plainNum(x),
    wrong: pickWrong(plainNum(x), [plainNum(Number((x * 10).toPrecision(6))), plainNum(Number((x / 10).toPrecision(6))), plainNum(Number((m * 10 ** -e).toPrecision(6)))]),
    why: `${e > 0 ? 'Multiply' : 'Divide'} by 10 ${Math.abs(e)} time${Math.abs(e) === 1 ? '' : 's'}: move the point ${Math.abs(e)} place${Math.abs(e) === 1 ? '' : 's'} ${e > 0 ? 'right' : 'left'}.`,
    meta: {},
  })
}

function m510order(): GameQuestion {
  for (;;) {
    const items = Array.from({ length: 4 }, () => sciNumber())
    const xs = items.map((i) => i.x)
    if (new Set(xs).size < 4) continue
    const big4 = items[xs.indexOf(Math.max(...xs))]
    // make it a real test: the biggest must not simply have the biggest mantissa
    const mMax = items.reduce((a, i) => (i.m > a.m ? i : a))
    if (mMax === big4 && chance(0.7)) continue
    return gq({
      t: 'order',
      prompt: 'Which number is the largest?',
      correct: sci(big4.m, big4.e),
      wrong: items.filter((i) => i !== big4).map((i) => sci(i.m, i.e)),
      why: 'Compare the powers of 10 first (the largest power is the largest number); only when they are equal compare the numbers in front.',
      meta: {},
    })
  }
}

const SET_510 = set('5.10', 'Scientific notation', 'Write numbers as a × 10ⁿ with 1 ≤ a < 10, and back again; compare by the power of 10.', [MAG], [mk('toSci', m510toSci), mk('fromSci', m510fromSci), mk('order', m510order)])

// ================================================================== 5.11 Calculating with scientific notation

function m511calc(): GameQuestion {
  const times = chance()
  let [a, c] = [int(2, 9), int(2, 9)]
  if (!times && a < c) [a, c] = [c, a]
  const [p, q] = [intExcept(-6, 9, [0]), intExcept(-6, 9, [0])]
  let m = times ? a * c : a / c
  let e = times ? p + q : p - q
  if (!Number.isInteger(m * 100)) return m511calc()
  if (m >= 10) [m, e] = [m / 10, e + 1]
  if (m < 1) [m, e] = [m * 10, e - 1]
  m = Number(m.toPrecision(6))
  const right = sci(m, e)
  return gq({
    t: 'calc',
    prompt: `Simplify, in scientific notation:${big(E(`(${a}*10^${p}) ${times ? '*' : '÷'} (${c}*10^${q})`))}`,
    correct: right,
    // powers multiplied (or divided), not adjusted to 1 ≤ a < 10, the other operation on the powers
    wrong: pickWrong(right, [sci(m, times ? p * q : e + 2 * q), sci(m, times ? p - q : p + q), sci(m, e + 1), sci(m, e - 1)]),
    why: `${times ? 'Multiply' : 'Divide'} the numbers (${a} ${times ? '×' : '÷'} ${c} = ${num(times ? a * c : Number((a / c).toPrecision(6)))}) and ${times ? 'add' : 'subtract'} the powers of 10, then adjust so the number is between 1 and 10: ${right}.`,
    meta: {},
  })
}

const SET_511 = set('5.11', 'Calculating with scientific notation', 'Multiply or divide the numbers, add or subtract the powers of 10, and adjust.', [MAG], [mk('calc', m511calc, 2), mk('order', m510order)])

export const NCM9_CH5: GameChapter = {
  id: 'ncm9-ch5',
  number: 5,
  title: 'Indices',
  ref: 'NCM 9 Chapter 5',
  strand: 'Number and algebra',
  outcomes: [IND, MAG],
  sets: [SET_501, SET_502, SET_503, SET_504, SET_505, SET_506, SET_507, SET_508, SET_509, SET_510, SET_511],
  colour: 18,
  topics: [],
}
