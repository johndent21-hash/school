// Class games for New Century Maths 9 (Standard, Cengage): one set of quick questions for each exercise, Chapters 1–13.
//
// Most exercises match kinds already built for NCM 7, NCM 8 and NCM 9 Advanced, so those sets reuse them (each is checked
// by the chapter that first made it, see reuse.ts). New kinds (checked by tests/game-checks/ncm9s.ts): Euler's formula,
// earning money (wages, salaries, overtime, commission, piecework, leave loading, tax, net pay), absolute and
// percentage error, the length and midpoint of an interval, direct variation, parabolas, and tree diagrams.
//
// Syllabus: NSW Mathematics K–10 (2022). Each set lists its outcome. Stage 4 work that the book revises is labelled
// revision; Path content (networks, Venn diagrams and two-way tables, direct variation, surds, algebraic fractions with
// pronumerals) has no outcome on the set and a teacher note saying it is extension beyond the core.
import type { GameChapter, GameMaker, GameQuestion, GameSet } from '@/lib/game/types'
import { DIVIDE, TIMES, chance, ex, frac, gq, int, intExcept, mk, num, pick } from './helpers'
import { NCM7_CH4 } from './ncm7-ch4'
import { NCM8_CH1 } from './ncm8-ch1'
import { NCM8_CH2 } from './ncm8-ch2'
import { NCM8_CH3 } from './ncm8-ch3'
import { NCM8_CH4 } from './ncm8-ch4'
import { NCM8_CH5 } from './ncm8-ch5'
import { NCM8_CH6 } from './ncm8-ch6'
import { NCM8_CH7 } from './ncm8-ch7'
import { NCM8_CH8 } from './ncm8-ch8'
import { NCM8_CH9 } from './ncm8-ch9'
import { NCM8_CH10 } from './ncm8-ch10'
import { NCM8_CH11 } from './ncm8-ch11'
import { NCM8_CH12 } from './ncm8-ch12'
import { NCM9_CH1 } from './ncm9-ch1'
import { NCM9_CH2 } from './ncm9-ch2'
import { NCM9_CH3 } from './ncm9-ch3'
import { NCM9_CH4 } from './ncm9-ch4'
import { NCM9_CH5 } from './ncm9-ch5'
import { reuse } from './reuse'

const b = (s: string) => `<b>${s}</b>`
const gcd = (a: number, c: number): number => (c === 0 ? Math.abs(a) : gcd(c, a % c))
const F = (n: number, d: number) => (n === 0 ? '0' : n === d ? '1' : frac(n / gcd(n, d), d / gcd(n, d)))
const $ = (x: number) => {
  const v = Math.round(x * 100) / 100
  return '$' + (Number.isInteger(v) ? num(v) : num(v, 2))
}
const neg = (n: number) => (n < 0 ? `−${num(-n)}` : num(n))
/** up to three different positive wrong values, likely first, then spares */
function wrongs(right: number, likely: number[], fmt: (x: number) => string): string[] {
  const out: number[] = []
  for (const x of [...likely, right * 2, right / 2, right + 10, right * 10, right + 1]) {
    const v = Math.round(x * 100) / 100
    if (v > 0 && Math.abs(v - right) > 1e-9 && !out.includes(v)) out.push(v)
    if (out.length === 3) break
  }
  return out.map(fmt)
}
const REV = (code: string) => `Revision of Stage 4 (${code}).`
const PATH = (what: string, code: string) => `${what} is Stage 5 Path content (${code}): extension beyond the core.`

type Src = [GameChapter, string, string, string?]
/** a set from reused kinds ([chapter, exercise, kind, new name?]) and new makers */
function S(ch: number, exn: string, title: string, focus: string, outcomes: string[], parts: (Src | GameMaker)[], note?: string): GameSet {
  return {
    id: `ncm9s-${exn}`,
    exercise: exn,
    ref: `NCM 9 Std Ex ${exn}`,
    title,
    focus,
    outcomes,
    makers: parts.map((p) => (Array.isArray(p) ? reuse(p[0], p[1], p[2], p[3]) : p)),
    ...(note ? { teacherNote: note } : {}),
  }
}
const chapter = (n: number, title: string, strand: GameChapter['strand'], colour: number, sets: GameSet[]): GameChapter => ({
  id: `ncm9s-ch${n}`,
  number: n,
  title,
  ref: `NCM 9 Std Chapter ${n}`,
  strand,
  outcomes: [...new Set(sets.flatMap((s) => s.outcomes))],
  sets,
  colour,
  topics: [],
})

// ================================================================== Chapter 1 Algebra

const CH1 = chapter(1, 'Algebra', 'Number and algebra', 265, [
  S(1, '1.01', 'From words to algebraic expressions', 'Turn words into algebra, in the order the words give.', ['MA4-ALG-C-01'], [[NCM8_CH3, '3.02', 'words'], [NCM8_CH3, '3.02', 'story'], [NCM8_CH3, '3.02', 'twoStep']], REV('MA4-ALG-C-01')),
  S(1, '1.02', 'Substitution', 'Replace each pronumeral with its value, taking care with negatives and powers.', ['MA4-ALG-C-01'], [[NCM8_CH3, '3.03', 'sub'], [NCM8_CH3, '3.03', 'many'], [NCM8_CH3, '3.03', 'formula'], [NCM8_CH3, '3.03', 'square']], REV('MA4-ALG-C-01')),
  S(1, '1.03', 'Adding and subtracting terms', 'Collect like terms: same letters, same powers.', ['MA4-ALG-C-01'], [[NCM8_CH3, '3.04', 'like'], [NCM8_CH3, '3.04', 'collect'], [NCM8_CH3, '3.04', 'mixed']], REV('MA4-ALG-C-01')),
  S(1, '1.04', 'Multiplying and dividing terms', 'Multiply or divide the numbers, then the letters.', ['MA4-ALG-C-01'], [[NCM8_CH3, '3.05', 'mult'], [NCM8_CH3, '3.05', 'powers'], [NCM8_CH3, '3.05', 'neg'], [NCM8_CH3, '3.05', 'div']], REV('MA4-ALG-C-01')),
  S(1, '1.05', 'Adding and subtracting algebraic fractions', 'Use a common denominator, then add or subtract the numerators.', ['MA5-ALG-C-01'], [[NCM9_CH1, '1.03', 'same'], [NCM9_CH1, '1.03', 'unlike']]),
  S(1, '1.06', 'Multiplying and dividing algebraic fractions', 'Multiply tops and bottoms and cancel; to divide, multiply by the reciprocal.', [], [[NCM9_CH1, '1.04', 'times']], PATH('Multiplying and dividing algebraic fractions with pronumerals', 'MA5-ALG-P-01')),
  S(1, '1.07', 'Expanding expressions', 'Multiply every term in the brackets, then collect like terms.', ['MA5-ALG-C-01'], [[NCM9_CH1, '1.05', 'expand'], [NCM9_CH1, '1.05', 'neg'], [NCM9_CH1, '1.05', 'simplify']]),
  S(1, '1.08', 'Factorising expressions', 'Take out the highest common factor.', ['MA4-ALG-C-01'], [[NCM8_CH3, '3.09', 'factorise'], [NCM8_CH3, '3.09', 'fully']], REV('MA4-ALG-C-01')),
  S(1, '1.09', 'Expanding binomial products', 'Multiply each term in the first bracket by each term in the second.', ['MA5-ALG-C-01'], [[NCM8_CH3, '3.11', 'binomial']]),
])

// ================================================================== Chapter 2 Pythagoras' theorem

const PYT = 'MA4-PYT-C-01'
const CH2 = chapter(2, "Pythagoras' theorem", 'Measurement and space', 205, [
  S(2, '2.01', 'Surds', 'Recognise surds and estimate square roots.', [], [[NCM9_CH2, '2.02', 'isSurd'], [NCM8_CH1, '1.01', 'between']], PATH('Surds', 'MA5-IND-P-02')),
  S(2, '2.02', "Pythagoras' theorem", 'Name the hypotenuse and write the theorem.', [PYT], [[NCM8_CH1, '1.02', 'hyp'], [NCM8_CH1, '1.02', 'rule']], REV(PYT)),
  S(2, '2.03', 'Finding the hypotenuse', 'c² = a² + b²: add the squares.', [PYT], [[NCM8_CH1, '1.03', 'hyp'], [NCM8_CH1, '1.03', 'exact']], REV(PYT)),
  S(2, '2.04', 'Finding a shorter side', 'Subtract the squares to find a shorter side.', [PYT], [[NCM8_CH1, '1.04', 'short']], REV(PYT)),
  S(2, '2.05', 'Mixed problems', 'Decide whether to add or subtract the squares.', [PYT], [[NCM8_CH1, '1.05', 'which'], [NCM8_CH1, '1.05', 'find']], REV(PYT)),
  S(2, '2.06', 'Testing for right-angled triangles', 'If a² + b² = c² for the longest side c, the triangle is right-angled.', [PYT], [[NCM8_CH1, '1.06', 'test'], [NCM8_CH1, '1.06', 'which']], REV(PYT)),
  S(2, '2.07', 'Pythagorean triads', 'Whole numbers with a² + b² = c², and their multiples.', [PYT], [[NCM8_CH1, '1.07', 'complete'], [NCM8_CH1, '1.07', 'multiple']], REV(PYT)),
  S(2, '2.08', "Pythagoras' theorem problems", 'Draw the right-angled triangle, then use Pythagoras.', [PYT], [[NCM8_CH1, '1.08', 'problem'], [NCM8_CH1, '1.05', 'find']], REV(PYT)),
])

// ================================================================== Chapter 3 Numeracy and calculation

const CH3 = chapter(3, 'Numeracy and calculation', 'Number and algebra', 330, [
  S(3, '3.01', 'Integers', 'Add, subtract, multiply and divide integers.', ['MA4-INT-C-01'], [[NCM8_CH2, '2.02', 'negPlusPos'], [NCM8_CH2, '2.02', 'minusNeg'], [NCM8_CH2, '2.03', 'negTimesNeg'], [NCM8_CH2, '2.03', 'negDivNeg']], REV('MA4-INT-C-01')),
  S(3, '3.02', 'Decimals', 'Order, round, multiply and divide decimals.', ['MA4-FRC-C-01'], [[NCM8_CH2, '2.05', 'order'], [NCM8_CH2, '2.05', 'round'], [NCM8_CH2, '2.06', 'times'], [NCM8_CH2, '2.06', 'divide']], REV('MA4-FRC-C-01')),
  S(3, '3.03', 'Fractions', 'Simplify, add, subtract, multiply and divide fractions.', ['MA4-FRC-C-01'], [[NCM7_CH4, '4.01', 'simplify'], [NCM7_CH4, '4.03', 'unrelated'], [NCM7_CH4, '4.06', 'cancel'], [NCM7_CH4, '4.07', 'divide']], REV('MA4-FRC-C-01')),
  S(3, '3.04', 'Percentages', 'Convert between percentages, fractions and decimals.', ['MA4-FRC-C-01'], [[NCM8_CH6, '6.04', 'toPct'], [NCM8_CH6, '6.04', 'toFrac'], [NCM8_CH6, '6.04', 'toDec'], [NCM8_CH6, '6.04', 'special']], REV('MA4-FRC-C-01')),
  S(3, '3.05', 'Applying percentages', 'Percentages of amounts, increases and decreases.', ['MA4-FRC-C-01'], [[NCM9_CH3, '3.02', 'increase'], [NCM9_CH3, '3.02', 'decrease'], [NCM9_CH3, '3.02', 'whole'], [NCM9_CH3, '3.02', 'over100']], REV('MA4-FRC-C-01')),
  S(3, '3.06', 'Profit, discounts and GST', 'Profit and loss, discounts and GST.', ['MA4-FRC-C-01'], [[NCM9_CH3, '3.03', 'profit'], [NCM9_CH3, '3.03', 'pct'], [NCM9_CH3, '3.03', 'gstAdd'], [NCM9_CH3, '3.03', 'costs']], REV('MA4-FRC-C-01')),
  S(3, '3.07', 'Simple interest', 'Use I = Prn, with n in years.', ['MA5-FIN-C-01'], [[NCM9_CH3, '3.04', 'formula'], [NCM9_CH3, '3.04', 'interest'], [NCM9_CH3, '3.04', 'total'], [NCM9_CH3, '3.04', 'months']]),
  S(3, '3.08', 'Ratios and rates', 'Simplify ratios, share in a ratio and solve ratio problems.', ['MA4-RAT-C-01'], [[NCM9_CH3, '3.05', 'simplify'], [NCM9_CH3, '3.05', 'part'], [NCM9_CH3, '3.05', 'three']], REV('MA4-RAT-C-01')),
  S(3, '3.09', 'Converting rates', 'Convert rates between units.', ['MA4-RAT-C-01'], [[NCM9_CH3, '3.06', 'convert'], [NCM9_CH3, '3.06', 'speed'], [NCM9_CH3, '3.06', 'reaction']], REV('MA4-RAT-C-01')),
])

// ================================================================== Chapter 4 Trigonometry

const TRG = 'MA5-TRG-C-01'
const CALC = 'Played without calculators: the questions choose the ratio or set up the equation.'
const CH4 = chapter(4, 'Trigonometry', 'Measurement and space', 205, [
  S(4, '4.01', 'The sides of a right-angled triangle', 'Name the hypotenuse, opposite and adjacent sides.', [TRG], [[NCM9_CH4, '4.01', 'side']]),
  S(4, '4.02', 'The trigonometric ratios', 'sin = opp ÷ hyp, cos = adj ÷ hyp, tan = opp ÷ adj.', [TRG], [[NCM9_CH4, '4.02', 'ratio']]),
  S(4, '4.03', 'Similar right-angled triangles', 'Same angle, same ratios.', [TRG], [[NCM9_CH4, '4.03', 'similar']]),
  S(4, '4.04', 'Trigonometry on a calculator', 'Degrees and minutes, and rounding angles.', [TRG], [[NCM9_CH4, '4.04', 'dm'], [NCM9_CH4, '4.04', 'round']], CALC),
  S(4, '4.05', 'Finding an unknown side', 'Choose the ratio, then x = known × ratio.', [TRG], [[NCM9_CH4, '4.05', 'numer']], CALC),
  S(4, '4.06', 'Finding more unknown sides', 'When x is on the bottom, x = known ÷ ratio.', [TRG], [[NCM9_CH4, '4.06', 'denom'], [NCM9_CH4, '4.06', 'numer']], CALC),
  S(4, '4.07', 'Finding an unknown angle', 'Use the inverse ratio.', [TRG], [[NCM9_CH4, '4.07', 'angle']], CALC),
])

// ================================================================== Chapter 5 Indices

const IND = 'MA5-IND-C-01'
const MAG = 'MA5-MAG-C-01'
const CH5 = chapter(5, 'Indices', 'Number and algebra', 18, [
  S(5, '5.01', 'Multiplying and dividing terms with the same base', 'Multiply: add the indices. Divide: subtract.', [IND], [[NCM9_CH5, '5.01', 'multiply'], [NCM9_CH5, '5.01', 'divide'], [NCM9_CH5, '5.01', 'laws']]),
  S(5, '5.02', 'Power of a power', 'Multiply the indices.', [IND], [[NCM9_CH5, '5.02', 'power'], [NCM9_CH5, '5.02', 'alg']]),
  S(5, '5.03', 'Powers of products and quotients', 'Raise every factor to the power.', [IND], [[NCM9_CH5, '5.03', 'product'], [NCM9_CH5, '5.03', 'quotient']]),
  S(5, '5.04', 'The zero index', 'a⁰ = 1 for any a ≠ 0.', [IND], [[NCM9_CH5, '5.04', 'zero'], [NCM9_CH5, '5.04', 'algZero'], [NCM9_CH5, '5.04', 'mix']]),
  S(5, '5.05', 'Negative indices', 'A negative index means the reciprocal.', [IND], [[NCM9_CH5, '5.05', 'evalNeg']], 'Negative indices with numerical bases (MA5-IND-C-01).'),
  S(5, '5.06', 'Summary of the index laws', 'Use all the index laws together.', [IND], [[NCM9_CH5, '5.08', 'laws'], [NCM9_CH5, '5.08', 'product'], [NCM9_CH5, '5.08', 'mix'], [NCM9_CH5, '5.08', 'evalNeg']]),
  S(5, '5.07', 'Significant figures', 'Count significant figures and round to them.', [MAG], [[NCM9_CH5, '5.09', 'count'], [NCM9_CH5, '5.09', 'round']]),
  S(5, '5.08', 'Scientific notation', 'a × 10ⁿ with 1 ≤ a < 10.', [MAG], [[NCM9_CH5, '5.10', 'toSci'], [NCM9_CH5, '5.10', 'fromSci'], [NCM9_CH5, '5.10', 'order']]),
  S(5, '5.09', 'Scientific notation on a calculator', 'Multiply or divide, then adjust.', [MAG], [[NCM9_CH5, '5.11', 'calc'], [NCM9_CH5, '5.11', 'order']]),
])

// ================================================================== Chapter 6 Geometry and networks

function m604euler(): GameQuestion {
  // a connected planar graph: V − E + F = 2
  for (;;) {
    const V = int(4, 12)
    const E = int(V, 2 * V)
    const Fc = 2 - V + E
    if (Fc < 2) continue
    const ask = pick(['F', 'E', 'V'] as const)
    const [given, ans] = ask === 'F' ? [`${V} vertices and ${E} edges`, Fc] : ask === 'E' ? [`${V} vertices and ${Fc} faces`, E] : [`${E} edges and ${Fc} faces`, V]
    return gq({
      t: 'euler',
      prompt: `A connected planar graph has ${b(given)}. How many ${ask === 'F' ? 'faces' : ask === 'E' ? 'edges' : 'vertices'} does it have?`,
      correct: num(ans),
      // the sign slips: V + E − 2, the sum, one out
      wrong: wrongs(ans, [ask === 'F' ? V + E - 2 : ask === 'E' ? V + Fc + 2 : E + Fc + 2, ask === 'F' ? E - V : ask === 'E' ? V + Fc : E - Fc, ans + 2, ans - 2], (x) => num(x)),
      why: `Euler's formula: V − E + F = 2. Here ${V} − ${E} + ${Fc} = 2, so the answer is ${ans}.`,
      meta: {},
    })
  }
}

const CH6 = chapter(6, 'Geometry and networks', 'Measurement and space', 40, [
  S(6, '6.01', 'Triangle geometry', 'Angle sums, exterior angles and isosceles triangles.', ['MA4-GEO-C-01'], [[NCM8_CH4, '4.06', 'triangle'], [NCM8_CH4, '4.06', 'exterior'], [NCM8_CH4, '4.06', 'isosceles'], [NCM8_CH4, '4.03', 'angles']], REV('MA4-GEO-C-01')),
  S(6, '6.02', 'Quadrilateral geometry', 'Angle sums and properties of the special quadrilaterals.', ['MA4-GEO-C-01'], [[NCM8_CH4, '4.06', 'quadrilateral'], [NCM8_CH4, '4.06', 'special'], [NCM8_CH4, '4.05', 'always']], REV('MA4-GEO-C-01')),
  S(6, '6.03', 'Networks', 'Degrees of vertices, and whether a network can be traced.', [], [[NCM8_CH4, '4.08', 'degree'], [NCM8_CH4, '4.08', 'trace']], PATH('Networks', 'MA5-NET-P-01')),
  S(6, '6.04', "Planar graphs and Euler's formula", 'For a connected planar graph, V − E + F = 2.', [], [mk('euler', m604euler)], PATH("Euler's formula", 'MA5-NET-P-01')),
])

// ================================================================== Chapter 7 Equations

const EQU5 = 'MA5-EQU-C-01'
const CH7 = chapter(7, 'Equations', 'Number and algebra', 265, [
  S(7, '7.01', 'Two-step equations', 'Undo + and − first, then × and ÷.', ['MA4-EQU-C-01'], [[NCM8_CH9, '9.02', 'first'], [NCM8_CH9, '9.02', 'two'], [NCM8_CH9, '9.02', 'neg'], [NCM8_CH9, '9.02', 'fracEq']], REV('MA4-EQU-C-01')),
  S(7, '7.02', 'Equations with variables on both sides', 'Collect the unknown on one side, then solve.', [EQU5], [[NCM8_CH9, '9.03', 'first'], [NCM8_CH9, '9.03', 'both']]),
  S(7, '7.03', 'Equations with brackets', 'Divide first or expand the brackets.', [EQU5], [[NCM8_CH9, '9.04', 'expand'], [NCM8_CH9, '9.04', 'brackets']]),
  S(7, '7.04', 'Equation problems', 'Write an equation, solve it, answer the question.', [EQU5], [[NCM8_CH9, '9.06', 'model'], [NCM8_CH9, '9.06', 'solveWords'], [NCM8_CH9, '9.06', 'rect']]),
  S(7, '7.05', 'Simple quadratic equations', 'x² = c has two answers, ±√c.', ['MA4-EQU-C-01'], [[NCM8_CH9, '9.05', 'square'], [NCM8_CH9, '9.05', 'ax2'], [NCM8_CH9, '9.05', 'surd']], REV('MA4-EQU-C-01')),
  S(7, '7.06', 'Equations and formulas', 'Substitute into a formula and solve for the unknown.', [EQU5], [[NCM8_CH9, '9.07', 'formula']]),
])

// ================================================================== Chapter 8 Earning money

const FIN = 'MA5-FIN-C-01'
const NAMES = ['Mia', 'Jack', 'Priya', 'Tom', 'Aisha', 'Leo', 'Zara', 'Sam']

function m801wage(): GameQuestion {
  const rate = pick([18, 20, 22, 24, 25, 26, 28, 30, 32, 35, 40]) + pick([0, 0, 0.5])
  const hours = pick([8, 10, 12, 15, 20, 25, 30, 35, 38, 40])
  const pay = rate * hours
  const who = pick(NAMES)
  return gq({
    t: 'wage',
    prompt: `${who} earns ${b(`${$(rate)} per hour`)}. How much does ${who} earn for ${b(`${hours} hours`)}?`,
    correct: $(pay),
    wrong: wrongs(pay, [rate + hours, pay * 1.5, (rate - 0.5) * hours, pay + rate], $),
    why: `${$(rate)} ${TIMES} ${hours} = ${$(pay)}.`,
    meta: {},
  })
}

function m801salary(): GameQuestion {
  const weekly = pick([600, 750, 800, 900, 1000, 1200, 1250, 1500, 1800, 2000])
  const annual = weekly * 52
  const fortnight = chance(0.35)
  return gq({
    t: 'salary',
    prompt: `A salary is ${b(`${$(annual)} per year`)}. What is the ${fortnight ? 'fortnightly' : 'weekly'} pay? (1 year = 52 weeks)`,
    correct: $(fortnight ? weekly * 2 : weekly),
    // divided by 12 (months), 365 or 50, the other period
    wrong: wrongs(fortnight ? weekly * 2 : weekly, [annual / 12, fortnight ? weekly : weekly * 2, annual / 50, annual / 48], $),
    why: `${$(annual)} ${DIVIDE} 52 = ${$(weekly)} a week${fortnight ? `, so ${$(weekly * 2)} a fortnight` : ''}.`,
    meta: {},
  })
}

function m802overtime(): GameQuestion {
  const rate = pick([20, 22, 24, 26, 28, 30, 32, 36, 40])
  const normal = pick([35, 38])
  const extra = int(2, 8)
  const dbl = chance(0.35)
  const k = dbl ? 2 : 1.5
  const pay = normal * rate + extra * rate * k
  return gq({
    t: 'overtime',
    prompt: `Jo earns ${b(`${$(rate)}/h`)} for ${normal} normal hours and ${b(`${extra} hours at ${dbl ? 'double time' : 'time-and-a-half'}`)}. What is Jo's total pay?`,
    correct: $(pay),
    // all hours at the normal rate, the overtime rate on every hour, the other penalty rate
    wrong: wrongs(pay, [(normal + extra) * rate, (normal + extra) * rate * k, normal * rate + extra * rate * (dbl ? 1.5 : 2), normal * rate + extra * k], $),
    why: `Normal: ${normal} ${TIMES} ${$(rate)} = ${$(normal * rate)}. Overtime: ${extra} ${TIMES} ${$(rate * k)} = ${$(extra * rate * k)}. Total ${$(pay)}.`,
    meta: {},
  })
}

function m803commission(): GameQuestion {
  const p = pick([2, 3, 4, 5, 6, 8, 10])
  const sales = 1000 * pick([5, 8, 10, 12, 15, 20, 25, 40, 50])
  const base = chance(0.5) ? pick([300, 400, 500, 600]) : 0
  const pay = base + (sales * p) / 100
  return gq({
    t: 'commission',
    prompt: base
      ? `A salesperson earns a retainer of ${b($(base))} plus ${b(`${p}% commission`)} on sales. What is their pay for sales of ${b($(sales))}?`
      : `A salesperson earns ${b(`${p}% commission`)} on sales. How much commission is earned on sales of ${b($(sales))}?`,
    correct: $(pay),
    wrong: wrongs(pay, [base + (sales * p) / 10, (sales * p) / 100, base + sales * p, pay + base], $),
    why: `${p}% of ${$(sales)} = ${$((sales * p) / 100)}${base ? `, plus the ${$(base)} retainer: ${$(pay)}` : ''}.`,
    meta: {},
  })
}

function m803piece(): GameQuestion {
  const rate = pick([0.5, 0.75, 1.2, 1.5, 2, 2.5, 3, 4])
  const n = pick([40, 60, 80, 100, 120, 150, 200, 250])
  const pay = rate * n
  const item = pick(['shirts sewn', 'boxes packed', 'trees planted', 'buckets of fruit picked'])
  return gq({
    t: 'piece',
    prompt: `A worker is paid ${b(`${$(rate)}`)} for each of the ${item}. What is the pay for ${b(String(n))}?`,
    correct: $(pay),
    wrong: wrongs(pay, [pay * 10, pay / 10, rate + n, pay + rate], $),
    why: `${n} ${TIMES} ${$(rate)} = ${$(pay)}.`,
    meta: {},
  })
}

function m804leave(): GameQuestion {
  const weekly = pick([600, 800, 900, 1000, 1200, 1400, 1600, 2000])
  const loading = (4 * weekly * 17.5) / 100
  return gq({
    t: 'leave',
    prompt: `Sam earns ${b(`${$(weekly)} a week`)} and gets 4 weeks' holiday pay plus ${b('17.5% leave loading')}. How much is the leave loading?`,
    correct: $(loading),
    // on one week only, the whole holiday pay, 17.5% read as 1.75%
    wrong: wrongs(loading, [(weekly * 17.5) / 100, 4 * weekly + loading, (4 * weekly * 1.75) / 100, 4 * weekly * 0.15], $),
    why: `4 weeks' pay = ${$(4 * weekly)}. 17.5% of ${$(4 * weekly)} = ${$(loading)}.`,
    meta: {},
  })
}

function m804tax(): GameQuestion {
  // a simple scale stated in the question (not the current ATO rates, which change)
  const free = 18_200
  const c = pick([15, 16, 19, 20])
  const over = 100 * int(20, 250)
  const income = free + over
  const tax = (over * c) / 100
  return gq({
    t: 'tax',
    prompt: `In this tax scale, income up to ${$(free)} is tax-free and ${b(`${c}c is paid for each $1 over ${$(free)}`)}. What is the tax on an income of ${b($(income))}?`,
    correct: $(tax),
    // taxed on the whole income, c as a whole-dollar amount, the income left after tax
    wrong: wrongs(tax, [(income * c) / 100, over * c, income - tax, (over * c) / 10], $),
    why: `${$(income)} − ${$(free)} = ${$(over)} is taxed. ${c}c ${TIMES} ${num(over)} = ${$(tax)}.`,
    meta: {},
  })
}

function m805net(): GameQuestion {
  const gross = pick([1200, 1350, 1500, 1640, 1800, 2000, 2250, 2500])
  const tax = pick([180, 220, 260, 300, 350, 400, 450])
  const other = pick([15, 20, 25, 30, 40, 50])
  const what = pick(['union fees', 'health insurance', 'a savings plan'])
  const net = gross - tax - other
  return gq({
    t: 'net',
    prompt: `Gross pay is ${b($(gross))} a fortnight. PAYG tax is ${b($(tax))} and ${b($(other))} goes to ${what}. What is the net pay?`,
    correct: $(net),
    // only the tax taken off, only the other deduction, deductions added
    wrong: wrongs(net, [gross - tax, gross - other, gross + tax - other, gross - tax + other], $),
    why: `Net pay = gross − deductions = ${$(gross)} − ${$(tax)} − ${$(other)} = ${$(net)}.`,
    meta: {},
  })
}

const CH8 = chapter(8, 'Earning money', 'Number and algebra', 145, [
  S(8, '8.01', 'Wages and salaries', 'Hourly wages, and salaries per week, fortnight and year (52 weeks).', [FIN], [mk('wage', m801wage), mk('salary', m801salary)]),
  S(8, '8.02', 'Overtime pay', 'Time-and-a-half and double time.', [FIN], [mk('overtime', m802overtime), mk('wage', m801wage)]),
  S(8, '8.03', 'Commission, piecework and royalties', 'Pay as a percentage of sales, or per item.', [FIN], [mk('commission', m803commission), mk('piece', m803piece)]),
  S(8, '8.04', 'Income tax', 'Leave loading, and tax from a stated tax scale.', [FIN], [mk('leave', m804leave), mk('tax', m804tax)]),
  S(8, '8.05', 'PAYG tax and net pay', 'Net pay = gross pay − tax − other deductions.', [FIN], [mk('net', m805net), mk('tax', m804tax)]),
])

// ================================================================== Chapter 9 Analysing data

const DAT = 'MA5-DAT-C-01'
const CH9 = chapter(9, 'Analysing data', 'Statistics and probability', 145, [
  S(9, '9.01', 'The mean, median, mode and range', 'Find each measure, including from a frequency table.', [DAT], [[NCM8_CH7, '7.05', 'mean'], [NCM8_CH7, '7.06', 'median'], [NCM8_CH7, '7.06', 'range'], [NCM8_CH7, '7.07', 'mean', 'tableMean']]),
  S(9, '9.02', 'Histograms and stem-and-leaf plots', 'Read histograms and stem-and-leaf plots.', [DAT], [[NCM8_CH7, '7.09', 'read'], [NCM8_CH7, '7.09', 'total'], [NCM8_CH7, '7.08', 'extreme'], [NCM8_CH7, '7.08', 'median']]),
  S(9, '9.03', 'The shape of a distribution', 'Symmetrical, positively or negatively skewed, uniform.', [DAT], [[NCM8_CH7, '7.11', 'shape'], [NCM8_CH7, '7.08', 'outlier']]),
  S(9, '9.04', 'Comparing data sets', 'Compare centres and spreads, and the effect of outliers.', [DAT], [[NCM8_CH7, '7.12', 'compare'], [NCM8_CH7, '7.12', 'effect']]),
  S(9, '9.05', 'Sampling and types of data', 'Types of data, census and sample.', ['MA4-DAT-C-01'], [[NCM8_CH7, '7.03', 'type'], [NCM8_CH7, '7.03', 'which'], [NCM8_CH7, '7.04', 'census']], REV('MA4-DAT-C-01, MA4-DAT-C-02')),
  S(9, '9.06', 'Bias and questionnaires', 'Choose a fair, random sample.', [], [[NCM8_CH7, '7.04', 'bias']], 'Marked as extension in the textbook.'),
])

// ================================================================== Chapter 10 Surface area and volume

const ARE5 = 'MA5-ARE-C-01'

function m1002abs(): GameQuestion {
  const [unit, step, dp] = pick([
    ['cm', 1, 0],
    ['cm', 0.1, 1],
    ['m', 0.1, 1],
    ['kg', 0.1, 1],
    ['mm', 1, 0],
    ['L', 0.01, 2],
  ] as [string, number, number][])
  const m = Number((int(20, 400) * step).toFixed(dp))
  const half = step / 2
  const askLimits = chance()
  const shown = num(m, dp)
  const stepText = step === 1 ? `the nearest ${unit}` : `the nearest ${num(step)} ${unit}`
  if (askLimits) {
    const lo = Number((m - half).toFixed(dp + 1))
    const hi = Number((m + half).toFixed(dp + 1))
    const opt = (a: number, c: number) => `${num(a)} ${unit} to ${num(c)} ${unit}`
    return gq({
      t: 'abs',
      prompt: `A measurement is ${b(`${shown} ${unit}`)}, to ${stepText}. Between which limits does the true value lie?`,
      correct: opt(lo, hi),
      wrong: [opt(Number((m - step).toFixed(dp)), Number((m + step).toFixed(dp))), opt(m, Number((m + step).toFixed(dp))), opt(Number((m - half / 10).toFixed(dp + 2)), Number((m + half / 10).toFixed(dp + 2)))],
      why: `The absolute error is half the unit of measurement: ${num(half)} ${unit}. So ${num(lo)} ${unit} to ${num(hi)} ${unit}.`,
      meta: {},
    })
  }
  return gq({
    t: 'abs',
    prompt: `A measurement is ${b(`${shown} ${unit}`)}, to ${stepText}. What is the absolute error?`,
    correct: `${num(half)} ${unit}`,
    wrong: [`${num(step)} ${unit}`, `${num(half / 10)} ${unit}`, `${num(step * 2)} ${unit}`],
    why: `The absolute error is half the unit of measurement: ½ × ${num(step)} = ${num(half)} ${unit}.`,
    meta: {},
  })
}

function m1003pct(): GameQuestion {
  const [m, unit] = pick([
    [2, 'cm'], [4, 'cm'], [5, 'cm'], [8, 'm'], [10, 'kg'], [20, 'cm'], [25, 'm'], [50, 'g'], [125, 'mL'],
  ] as [number, string][])
  const pct = (0.5 / m) * 100
  return gq({
    t: 'pct',
    prompt: `A length is measured as ${b(`${m} ${unit}`)}, to the nearest ${unit}. What is the percentage error?`,
    correct: `${num(pct)}%`,
    // the unit (1) instead of half, the error itself, upside down
    wrong: wrongs(pct, [(1 / m) * 100, 0.5, pct / 10, (m / 0.5) / 100 * 10], (x) => `${num(x)}%`),
    why: `Absolute error 0.5 ${unit}. Percentage error = 0.5 ÷ ${m} × 100% = ${num(pct)}%.`,
    meta: {},
  })
}

const CH10 = chapter(10, 'Surface area and volume', 'Measurement and space', 95, [
  S(10, '10.01', 'Metric units', 'Convert units of length, area and volume.', ['MA4-ARE-C-01'], [[NCM8_CH5, '5.04', 'down'], [NCM8_CH5, '5.04', 'km'], [NCM8_CH5, '5.11', 'down', 'volDown']], REV('MA4-ARE-C-01, MA4-VOL-C-01')),
  S(10, '10.02', 'Precision and absolute error', 'The absolute error is half the unit of measurement.', [MAG], [mk('abs', m1002abs)]),
  S(10, '10.03', 'Percentage error', 'Percentage error = absolute error ÷ measurement × 100%.', [MAG], [mk('pct', m1003pct), mk('abs', m1002abs)]),
  S(10, '10.04', 'Perimeters and areas of composite shapes', 'Split shapes into parts, or take a part away.', [ARE5], [[NCM8_CH5, '5.01', 'composite'], [NCM8_CH5, '5.06', 'hole'], [NCM8_CH5, '5.06', 'add']]),
  S(10, '10.05', 'Areas of quadrilaterals', 'Parallelograms, trapeziums, kites and rhombuses.', ['MA4-ARE-C-01'], [[NCM8_CH5, '5.09', 'area', 'trapezium'], [NCM8_CH5, '5.10', 'kite'], [NCM8_CH5, '5.10', 'rhombus'], [NCM8_CH5, '5.05', 'parallelogram']], REV('MA4-ARE-C-01')),
  S(10, '10.06', 'Circumferences and areas of circles', 'C = πd, A = πr², sectors.', ['MA4-ARE-C-01'], [[NCM8_CH5, '5.03', 'exactD'], [NCM8_CH5, '5.07', 'exactR'], [NCM8_CH5, '5.08', 'area', 'sector']], REV('MA4-LEN-C-01, MA4-ARE-C-01')),
  S(10, '10.07', 'Surface area of a prism', 'Add the areas of all the faces.', [ARE5], [[NCM8_CH12, '12.04', 'cube'], [NCM8_CH12, '12.04', 'box'], [NCM8_CH12, '12.04', 'tri']]),
  S(10, '10.08', 'Surface area of a cylinder', '2πr² + 2πrh.', [ARE5], [[NCM8_CH12, '12.05', 'curved'], [NCM8_CH12, '12.05', 'closed'], [NCM8_CH12, '12.05', 'open']]),
  S(10, '10.09', 'Volumes of prisms and cylinders', 'V = Ah and V = πr²h.', ['MA5-VOL-C-01'], [[NCM8_CH5, '5.12', 'Ah'], [NCM8_CH5, '5.13', 'exact'], [NCM8_CH5, '5.13', 'estimate']]),
])

// ================================================================== Chapter 11 Coordinate geometry

const LIN5 = 'MA5-LIN-C-01'
const TRIADS: [number, number, number][] = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 6, 10], [4, 3, 5], [12, 5, 13], [9, 12, 15]]
const pt = (x: number, y: number) => `(${neg(x)}, ${neg(y)})`

function m1101length(): GameQuestion {
  const [dx, dy, d] = pick(TRIADS)
  const x1 = int(-5, 5)
  const y1 = int(-5, 5)
  const [sx, sy] = [pick([1, -1]), pick([1, -1])]
  const x2 = x1 + sx * dx
  const y2 = y1 + sy * dy
  return gq({
    t: 'length',
    prompt: `Find the length of the interval joining ${b(pt(x1, y1))} and ${b(pt(x2, y2))}.`,
    correct: num(d),
    // the run plus the rise, the sum of squares, the difference
    wrong: wrongs(d, [dx + dy, dx * dx + dy * dy, Math.abs(dx - dy) || d + 2, d + 1], (x) => num(x)),
    why: `Run ${dx}, rise ${dy}: √(${dx}² + ${dy}²) = √${dx * dx + dy * dy} = ${d}.`,
    meta: {},
  })
}

function m1102midpoint(): GameQuestion {
  const [x1, y1] = [int(-6, 6), int(-6, 6)]
  const [x2, y2] = [x1 + 2 * intExcept(-4, 4, [0]), y1 + 2 * intExcept(-4, 4, [0])]
  const [mx, my] = [(x1 + x2) / 2, (y1 + y2) / 2]
  return gq({
    t: 'midpoint',
    prompt: `Find the midpoint of the interval joining ${b(pt(x1, y1))} and ${b(pt(x2, y2))}.`,
    correct: pt(mx, my),
    // subtracted instead of added, not halved, x and y swapped
    wrong: [pt((x2 - x1) / 2, (y2 - y1) / 2), pt(x1 + x2, y1 + y2), pt(my, mx), pt(mx, -my), pt(mx + 1, my), pt(mx, my + 1)].filter((s, i, a) => s !== pt(mx, my) && a.indexOf(s) === i),
    why: `Average the coordinates: ((${neg(x1)} + ${neg(x2)}) ÷ 2, (${neg(y1)} + ${neg(y2)}) ÷ 2) = ${pt(mx, my)}.`,
    meta: {},
  })
}

function m1109direct(): GameQuestion {
  const k = int(2, 9)
  const x1 = int(2, 9)
  let x2 = int(2, 12)
  if (x2 === x1) x2++
  const [y, x] = pick([
    ['y', 'x'],
    ['C', 'n'],
    ['d', 't'],
  ])
  return gq({
    t: 'direct',
    prompt: `${y} varies directly with ${x}, and ${y} = ${k * x1} when ${x} = ${x1}. Find ${y} when ${x} = ${b(String(x2))}.`,
    correct: num(k * x2),
    // added the difference instead, the constant k, inverse variation
    wrong: wrongs(k * x2, [k * x1 + (x2 - x1), k, Math.round((k * x1 * x1) / x2), k * x2 + k], (v) => num(v)),
    why: `${y} = k${x}: k = ${k * x1} ÷ ${x1} = ${k}. So ${y} = ${k} × ${x2} = ${k * x2}.`,
    meta: {},
  })
}

function m1110parabola(): GameQuestion {
  const a = pick([1, -1, 2, -2])
  const c = int(-6, 6)
  const k = int(0, 1)
  const eq = ex(`y = ${a === 1 ? '' : a === -1 ? '-' : a}x^2${c === 0 ? '' : c > 0 ? ` + ${c}` : ` - ${-c}`}`)
  if (k === 0) {
    return gq({
      t: 'parabola',
      prompt: `What is the turning point of the parabola ${eq}?`,
      correct: pt(0, c),
      wrong: [pt(c, 0), pt(0, -c), pt(0, a), pt(a, c), pt(0, c + 1), pt(0, c - 1)].filter((s, i, arr) => s !== pt(0, c) && arr.indexOf(s) === i),
      why: `At x = 0, y = ${neg(c)}; the parabola is symmetrical about the y-axis, so its turning point is ${pt(0, c)}.`,
      meta: {},
    })
  }
  const x = intExcept(-3, 3, [0])
  const y = a * x * x + c
  return gq({
    t: 'parabola',
    prompt: `For the parabola ${eq}, what is ${ex('y')} when ${ex(`x = ${x}`)}?`,
    correct: neg(y),
    // (ax)², −x² read as (−x)², 2x instead of x²
    wrong: [(a * x) ** 2 + c, -a * x * x + c, a * 2 * x + c, y + 1, y - 1, y + 2].filter((v, i, arr) => v !== y && arr.indexOf(v) === i).map(neg),
    why: `${ex('y')} = ${a} × (${neg(x)})² ${c < 0 ? '−' : '+'} ${Math.abs(c)} = ${a} × ${x * x} ${c < 0 ? '−' : '+'} ${Math.abs(c)} = ${neg(y)}.`,
    meta: {},
  })
}

function m1111apply(): GameQuestion {
  const v = pick([10, 15, 20, 25, 30, 35, 40])
  const t = int(1, v / 5 - 1)
  const h = v * t - 5 * t * t
  return gq({
    t: 'apply',
    prompt: `A ball's height is ${ex(`h = ${v}t - 5t^2`)} metres after ${ex('t')} seconds. How high is it after ${b(`${t} s`)}?`,
    correct: `${h} m`,
    // 5t not 5t², (5t)², forgot the second term
    wrong: wrongs(h, [v * t - 5 * t, v * t - 25 * t * t, v * t, v * t + 5 * t * t], (x) => `${num(x)} m`),
    why: `${ex('h')} = ${v} × ${t} − 5 × ${t}² = ${v * t} − ${5 * t * t} = ${h} m.`,
    meta: {},
  })
}

const CH11 = chapter(11, 'Coordinate geometry', 'Number and algebra', 190, [
  S(11, '11.01', 'The length of an interval', 'Use Pythagoras: √(run² + rise²).', [LIN5], [mk('length', m1101length)]),
  S(11, '11.02', 'The midpoint of an interval', 'Average the x and the y coordinates.', [LIN5], [mk('midpoint', m1102midpoint)]),
  S(11, '11.03', 'The gradient of a line', 'Gradient = rise ÷ run.', [LIN5], [[NCM8_CH11, '11.09', 'gradient']]),
  S(11, '11.04', 'Graphing linear equations', 'Increasing and decreasing lines, and points on a line.', [LIN5], [[NCM8_CH11, '11.06', 'onLine'], [NCM8_CH11, '11.06', 'incdec'], [NCM8_CH11, '11.08', 'intercept']]),
  S(11, '11.05', 'The gradient-intercept formula', 'In y = mx + c, m is the gradient and c the y-intercept.', [LIN5], [[NCM8_CH11, '11.10', 'read'], [NCM8_CH11, '11.10', 'write'], [NCM8_CH11, '11.08', 'parallel']]),
  S(11, '11.06', 'Finding the equation of a line', 'Read the gradient and y-intercept from the graph.', [LIN5], [[NCM8_CH11, '11.07', 'fromGraph']]),
  S(11, '11.07', 'Solving linear equations graphically', 'Read across from the y value, then down to x; find where lines meet.', [LIN5], [[NCM8_CH11, '11.12', 'graph'], [NCM8_CH11, '11.13', 'intersect']]),
  S(11, '11.08', 'Applying linear equations', 'Use a linear rule from a real situation.', [LIN5], [[NCM8_CH11, '11.11', 'apply']]),
  S(11, '11.09', 'Direct variation', 'If y varies directly with x, then y = kx.', [], [mk('direct', m1109direct)], PATH('Direct variation', 'MA5-RAT-P-01')),
  S(11, '11.10', 'Graphing quadratic equations', 'Parabolas: values and turning points.', ['MA5-NLI-C-01'], [mk('parabola', m1110parabola)]),
  S(11, '11.11', 'Applying quadratic equations', 'Use a quadratic rule from a real situation.', ['MA5-NLI-C-01'], [mk('apply', m1111apply)]),
])

// ================================================================== Chapter 12 Probability

const PRO5 = 'MA5-PRO-C-01'

function m1205outcomes(): GameQuestion {
  const [what, n] = pick([
    ['a coin is tossed and a die is rolled', 12],
    ['two dice are rolled', 36],
    ['two coins are tossed', 4],
    ['three coins are tossed', 8],
    ['a coin is tossed and a spinner with 4 equal sectors is spun', 8],
    ['a die is rolled and a spinner with 3 equal sectors is spun', 18],
  ] as [string, number][])
  return gq({
    t: 'outcomes',
    prompt: `How many outcomes are in the sample space when ${b(what)}?`,
    correct: num(n),
    // added instead of multiplied, one more stage, one fewer
    wrong: wrongs(n, [what.includes('three') ? 6 : what.includes('two coins') ? 2 + 2 + 1 : n === 36 ? 12 : n === 12 ? 8 : n === 18 ? 9 : 6, n * 2, n / 2], (x) => num(x)),
    why: `Multiply the numbers of outcomes at each stage: ${n} outcomes.`,
    meta: {},
  })
}

function m1205tree(): GameQuestion {
  if (chance(0.4)) {
    // two draws with replacement from a bag
    const r = int(1, 5)
    const bl = int(2, 6)
    const n = r + bl
    return gq({
      t: 'tree',
      prompt: `A bag has ${r} red and ${bl} blue marbles. One is drawn, ${b('replaced')}, and a second is drawn. What is the probability that both are red?`,
      correct: F(r * r, n * n),
      // one draw only, added the probabilities, without replacement
      wrong: [F(r, n), F(2 * r, n), F(r * r, n), F(r * (r - 1), n * (n - 1)), F(r * r + 1, n * n), F(r, n * n), F(r * r, n * n + n)].filter((x, i, a) => x !== F(r * r, n * n) && x !== '1' && a.indexOf(x) === i),
      why: `Multiply along the branches: ${r}/${n} × ${r}/${n} = ${r * r}/${n * n}.`,
      meta: {},
    })
  }
  const k = int(0, 4)
  const [prompt, n, d] = [
    ['Two fair coins are tossed. What is the probability of two heads?', 1, 4],
    ['Two fair coins are tossed. What is the probability of at least one head?', 3, 4],
    ['A fair coin is tossed and a fair die is rolled. What is the probability of a head and a 6?', 1, 12],
    ['Three fair coins are tossed. What is the probability of three tails?', 1, 8],
    ['Two fair dice are rolled. What is the probability of a double six?', 1, 36],
  ][k] as [string, number, number]
  return gq({
    t: 'tree',
    prompt,
    correct: F(n, d),
    // added the probabilities, one stage only, the complement
    wrong: [F(d - n, d), k === 2 ? F(2, 12) : F(1, 2), k === 1 ? F(1, 4) : F(1, Math.max(3, d / 2)), F(n, d + 1)].filter((s, i, a) => s !== F(n, d) && a.indexOf(s) === i),
    why: `List the outcomes (or multiply along the tree branches): ${n} of the ${d} equally likely outcomes.`,
    meta: {},
  })
}

const CH12 = chapter(12, 'Probability', 'Statistics and probability', 350, [
  S(12, '12.01', 'Probability', 'Sample spaces and probabilities of equally likely outcomes.', ['MA4-PRO-C-01'], [[NCM8_CH8, '8.01', 'bag'], [NCM8_CH8, '8.01', 'die'], [NCM8_CH8, '8.01', 'or'], [NCM8_CH8, '8.02', 'not']], REV('MA4-PRO-C-01')),
  S(12, '12.02', 'Observed probability', 'Relative frequency, and using it to predict.', [PRO5], [[NCM8_CH8, '8.06', 'relFreq'], [NCM8_CH8, '8.06', 'predict'], [NCM8_CH8, '8.06', 'expected']]),
  S(12, '12.03', 'Venn diagrams', 'Read Venn diagrams and find probabilities from them.', [], [[NCM8_CH8, '8.03', 'count'], [NCM8_CH8, '8.03', 'prob']], PATH('Venn diagrams', 'MA5-PRO-P-01')),
  S(12, '12.04', 'Two-way tables', 'Complete two-way tables and find probabilities.', [], [[NCM8_CH8, '8.04', 'missing'], [NCM8_CH8, '8.04', 'prob']], PATH('Two-way tables', 'MA5-PRO-P-01')),
  S(12, '12.05', 'Tree diagrams', 'Multistage experiments: count the outcomes, multiply along the branches.', [PRO5], [mk('outcomes', m1205outcomes), mk('tree', m1205tree)]),
])

// ================================================================== Chapter 13 Similar figures

const GEO5 = 'MA5-GEO-C-01'
const CH13 = chapter(13, 'Similar figures', 'Measurement and space', 50, [
  S(13, '13.01', 'Similar figures', 'Same shape: all sides enlarged by the same scale factor, angles equal.', [GEO5], [[NCM8_CH12, '12.01', 'which'], [NCM8_CH12, '12.01', 'factor'], [NCM8_CH12, '12.02', 'angle']]),
  S(13, '13.02', 'Finding unknown sides in similar figures', 'Find the scale factor, then the unknown side.', [GEO5], [[NCM8_CH12, '12.03', 'side'], [NCM8_CH12, '12.02', 'ratio']]),
  S(13, '13.03', 'Scale drawings', 'Use a scale 1 : n to find real and drawn lengths.', [GEO5], [[NCM8_CH10, '10.03', 'scale'], [NCM8_CH10, '10.03', 'map'], [NCM8_CH10, '10.03', 'toMap']]),
])

export const NCM9S_CHAPTERS: GameChapter[] = [CH1, CH2, CH3, CH4, CH5, CH6, CH7, CH8, CH9, CH10, CH11, CH12, CH13]
