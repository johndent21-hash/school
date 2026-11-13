// Class games for New Century Maths 8 (3rd edition, Cengage) Chapter 9, Equations: one set of quick questions for
// each exercise, 9.01 to 9.08.
//
// One- and two-step equations and equation problems revise Year 7 (NCM 7 Chapter 5), so those sets reuse its kinds
// (checked by that chapter's checks, see reuse.ts). New kinds: equations with the unknown on both sides, equations
// with brackets, x² = c and ax² = c, rectangle problems, substituting into formulas and changing the subject
// (tests/game-checks/ncm8-ch9.ts).
//
// Syllabus: NSW Mathematics K–10 (2022). Stage 4 Equations MA4-EQU-C-01: equations of up to 2 steps (9.01, 9.02,
// 9.06), quadratic equations of the form ax² = c with exact answers (9.05), and equations from substituting into
// formulas (9.07). Pronumerals on both sides (9.03) and grouping symbols (9.04, starred in the textbook) are Stage 5
// MA5-EQU-C-01, and changing the subject of a formula (9.08) is Stage 5 Path MA5-EQU-P-02, so these are extension.
import type { GameChapter, GameQuestion, GameSet } from '@/lib/game/types'
import { chance, ex, gq, int, intExcept, mk, num, pick } from './helpers'
import { NCM7_CH5 } from './ncm7-ch5'
import { reuse } from './reuse'

const EQU = 'MA4-EQU-C-01'
const EXT_5 = 'Stage 5 content (MA5-EQU-C-01): extension for Year 8.'
const EXT_SUBJ = 'Changing the subject of a formula is Stage 5 Path content (MA5-EQU-P-02): extension for Year 8.'
const big = (s: string) => `<div class="big">${s}</div>`
const b = (s: string) => `<b>${s}</b>`
const LET = ['a', 'b', 'c', 'd', 'g', 'h', 'k', 'm', 'n', 'p', 'q', 'r', 't', 'w', 'x', 'y']
const signed = (n: number) => (n < 0 ? `− ${-n}` : `+ ${n}`)
const sol = (L: string, x: number) => ex(`${L} = ${x}`)
/** three different wrong whole-number solutions, likely first */
function solWrong(L: string, x: number, likely: number[]): string[] {
  const out: number[] = []
  for (const v of [...likely, -x, x + 1, x - 1, x + 2, 2 * x]) {
    if (Number.isInteger(v) && v !== x && !out.includes(v)) out.push(v)
    if (out.length === 3) break
  }
  return out.map((v) => sol(L, v))
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
const R7 = (ex7: string, t: string, as?: string) => reuse(NCM7_CH5, ex7, t, as)

// ================================================================== 9.01, 9.02 revision: one- and two-step equations

const SET_901 = set('9.01', 'One-step equations', 'Solve one-step equations with inverse operations, and check by substituting.', [EQU], [
  R7('5.11', 'step'),
  R7('5.11', 'solve'),
  R7('5.10', 'check'),
  R7('5.10', 'inspect'),
])
const SET_902 = set('9.02', 'Two-step equations', 'Solve two-step equations: undo + and − first, then × and ÷.', [EQU], [
  R7('5.12', 'first'),
  R7('5.12', 'two'),
  R7('5.12', 'neg'),
  R7('5.12', 'fracEq'),
])

// ================================================================== 9.03 Equations with variables on both sides (extension)

function bothSides() {
  const L = pick(LET)
  const c = int(1, 6)
  const a = c + int(1, 5)
  const x = chance(0.25) ? -int(1, 6) : int(1, 12)
  const bb = intExcept(-12, 12, [0])
  const d = (a - c) * x + bb
  return { L, a, c, x, bb, d, eq: `${a}${L} ${signed(bb)} = ${c === 1 ? '' : c}${L} ${signed(d)}`.replace('+ 0', '').replace('= + ', '= ') }
}

function m903both(): GameQuestion {
  const { L, a, c, x, bb, d, eq } = bothSides()
  return gq({
    t: 'both',
    prompt: `Solve:${big(ex(eq))}`,
    correct: sol(L, x),
    // added the x terms, forgot to move the number, divided by a not (a − c)
    wrong: solWrong(L, x, [(d - bb) / (a + c), d / (a - c), (d - bb) / a, (d + bb) / (a - c)]),
    why: `Subtract ${c === 1 ? '' : c}${L} from both sides: ${a - c === 1 ? '' : a - c}${L} ${signed(bb)} = ${d}. Then ${bb > 0 ? 'subtract' : 'add'} ${Math.abs(bb)}${a - c > 1 ? ` and divide by ${a - c}` : ''}: ${L} = ${x}.`,
    meta: {},
  })
}

function m903first(): GameQuestion {
  const { L, c, eq } = bothSides()
  const cL = `${c === 1 ? '' : c}${L}`
  return gq({
    t: 'first',
    prompt: `Which step collects the ${b(L)} terms on the left side of${big(ex(eq))}`,
    correct: `Subtract ${ex(cL)} from both sides`,
    wrong: [`Add ${ex(cL)} to both sides`, `Subtract ${ex(cL)} from the right side only`, `Divide both sides by ${ex(cL)}`],
    why: `Taking ${cL} from both sides removes it from the right and keeps the equation balanced.`,
    meta: {},
  })
}

const SET_903 = set('9.03', 'Equations with variables on both sides', 'Collect the unknown on one side by subtracting from both sides, then solve.', [], [mk('first', m903first), mk('both', m903both)], { teacherNote: EXT_5 })

// ================================================================== 9.04 Equations with brackets (extension)

function m904brackets(): GameQuestion {
  const L = pick(LET)
  const a = int(2, 9)
  const x = chance(0.25) ? -int(1, 6) : int(1, 12)
  const minus = chance(0.35)
  const k = int(1, 15)
  const inside = minus ? k - x : x + k
  const rhs = a * inside
  const eq = minus ? `${a}(${k} - ${L}) = ${rhs}` : `${a}(${L} + ${k}) = ${rhs}`
  return gq({
    t: 'brackets',
    prompt: `Solve:${big(ex(eq))}`,
    correct: sol(L, x),
    // only multiplied the first term, forgot to divide, sign slip
    wrong: solWrong(L, x, minus ? [k + inside, rhs / a, rhs - k, inside - k] : [rhs - k, rhs / a + k, (rhs - k) / a, -x]),
    why: `Divide both sides by ${a}: ${minus ? `${k} − ${L}` : `${L} + ${k}`} = ${inside}. So ${L} = ${x}.`,
    meta: {},
  })
}

function m904expand(): GameQuestion {
  const L = pick(LET)
  const a = int(2, 9)
  const k = int(1, 12)
  const x = int(1, 10)
  const rhs = a * (x + k)
  return gq({
    t: 'expand',
    prompt: `Expanding the brackets in ${ex(`${a}(${L} + ${k}) = ${rhs}`)} gives…`,
    correct: ex(`${a}${L} + ${a * k} = ${rhs}`),
    wrong: [ex(`${a}${L} + ${k} = ${rhs}`), ex(`${L} + ${a * k} = ${rhs}`), ex(`${a}${L} + ${a + k} = ${rhs}`), ex(`${a}${L} + ${a * k} = ${rhs * a}`)],
    why: `Multiply both terms inside by ${a}: ${a} × ${L} + ${a} × ${k} = ${a}${L} + ${a * k}.`,
    meta: {},
  })
}

const SET_904 = set('9.04', 'Equations with brackets', 'Solve equations with brackets: divide first, or expand the brackets.', [], [mk('expand', m904expand), mk('brackets', m904brackets)], { teacherNote: EXT_5 })

// ================================================================== 9.05 Simple quadratic equations

function m905square(): GameQuestion {
  const L = pick(['x', 'y', 'k', 'm', 't'])
  const n = int(2, 15)
  return gq({
    t: 'square',
    prompt: `Solve:${big(ex(`${L}^2 = ${n * n}`))}`,
    correct: ex(`${L} = ±${n}`),
    // only the positive answer, halved instead of square-rooted, squared again
    wrong: [ex(`${L} = ${n}`), ex(`${L} = ±${num((n * n) / 2)}`), ex(`${L} = ±${n * n * n * n}`), ex(`${L} = −${n}`)],
    why: `${n}² = ${n * n} and (−${n})² = ${n * n}, so there are two answers: ${L} = ±${n}.`,
    meta: {},
  })
}

function m905surd(): GameQuestion {
  const L = pick(['x', 'y', 'p', 'm'])
  let k = int(5, 99)
  while (Number.isInteger(Math.sqrt(k))) k++
  return gq({
    t: 'surd',
    prompt: `Solve, giving the exact answers:${big(ex(`${L}^2 = ${k}`))}`,
    correct: ex(`${L} = ±sqrt{${k}}`),
    wrong: [ex(`${L} = sqrt{${k}}`), ex(`${L} = ±${num(k / 2)}`), ex(`${L} = ±${k * k}`)],
    why: `${k} is not a perfect square, so the exact answers are ${L} = √${k} and ${L} = −√${k}.`,
    meta: {},
  })
}

function m905ax2(): GameQuestion {
  const L = pick(['x', 'y', 'k', 'm'])
  const a = int(2, 6)
  const n = int(2, 10)
  return gq({
    t: 'ax2',
    prompt: `Solve:${big(ex(`${a}${L}^2 = ${a * n * n}`))}`,
    correct: ex(`${L} = ±${n}`),
    // square-rooted before dividing, divided only, only the positive answer
    wrong: [ex(`${L} = ±${n * n}`), ex(`${L} = ${n}`), ex(`${L} = ±${num((a * n * n) / 2)}`), ex(`${L} = ±${a * n}`), ex(`${L} = ±${a * n * n}`), ex(`${L} = −${n}`)],
    why: `Divide by ${a}: ${L}² = ${n * n}. So ${L} = ±${n}.`,
    meta: {},
  })
}

const SET_905 = set('9.05', 'Simple quadratic equations', 'Solve x² = c and ax² = c: two answers, ±, exact (√) when c is not a square.', [EQU], [mk('square', m905square), mk('ax2', m905ax2), mk('surd', m905surd, 2)])

// ================================================================== 9.06 Equation problems

function m906rect(): GameQuestion {
  const w = int(2, 15)
  const more = int(1, 9)
  const P = 2 * (w + w + more)
  return gq({
    t: 'rect',
    prompt: `A rectangle's length is ${b(`${more} cm more`)} than its width. Its perimeter is ${b(`${P} cm`)}. What is its width?`,
    correct: `${w} cm`,
    // the length, half the perimeter minus the extra, a quarter of the perimeter
    wrong: [w + more, P / 2 - more, P / 4, (P - more) / 2, w + 1, w + 2, w - 1].filter((x, k, a) => x !== w && x > 0 && Number.isInteger(x) && a.indexOf(x) === k).map((x) => `${x} cm`),
    why: `Width ${ex('w')}, length ${ex(`w + ${more}`)}: 2${ex('w')} + 2(${ex(`w + ${more}`)}) = ${P}, so 4${ex('w')} + ${2 * more} = ${P} and ${ex('w')} = ${w} cm.`,
    meta: {},
  })
}

const SET_906 = set('9.06', 'Equation problems', 'Write an equation for a word problem, solve it and answer the question.', [EQU], [
  R7('5.13', 'model'),
  R7('5.13', 'solveWords'),
  R7('5.13', 'think'),
  mk('rect', m906rect, 2),
])

// ================================================================== 9.07 Equations and formulas

const FORMULAS: (() => [string, number, string[]])[] = [
  () => {
    const l = int(5, 20)
    const w = int(2, l - 1)
    return [`The perimeter of a rectangle is ${ex('P = 2(l + w)')}. Find ${ex('l')} when ${ex(`P = ${2 * (l + w)}`)} and ${ex(`w = ${w}`)}.`, l, [String(2 * (l + w) - w), String((2 * (l + w)) / 2), String(l + w)]]
  },
  () => {
    const N = int(3, 25)
    return [`A row of ${ex('N')} squares needs ${ex('T = 3N + 1')} toothpicks. How many squares use ${ex(`T = ${3 * N + 1}`)} toothpicks?`, N, [String(3 * N), String(N + 1), String(3 * N + 2)]]
  },
  () => {
    const l = int(2, 8)
    const w = int(2, 6)
    const h = int(2, 9)
    return [`The volume of a box is ${ex('V = lwh')}. Find ${ex('h')} when ${ex(`V = ${l * w * h}`)}, ${ex(`l = ${l}`)} and ${ex(`w = ${w}`)}.`, h, [String(l * w * h - l - w), String(l * w), String((l * w * h) / l)]]
  },
  () => {
    const bb = 2 * int(2, 9)
    const h = int(2, 12)
    return [`The area of a triangle is ${ex('A = frac{1}{2}bh')}. Find ${ex('h')} when ${ex(`A = ${(bb * h) / 2}`)} and ${ex(`b = ${bb}`)}.`, h, [String((bb * h) / 2 / bb), String((bb * h) / 2 - bb), String(bb * h)]]
  },
  () => {
    const u = int(0, 10)
    const a = int(2, 5)
    const t = int(2, 10)
    return [`For a speeding-up car, ${ex('v = u + at')}. Find ${ex('t')} when ${ex(`v = ${u + a * t}`)}, ${ex(`u = ${u}`)} and ${ex(`a = ${a}`)}.`, t, [String((u + a * t) / a), String(u + a * t - u - a), String(a * t)]]
  },
]

function m907formula(): GameQuestion {
  const [prompt, ans, likely] = pick(FORMULAS)()
  const out: string[] = []
  for (const w of [...likely, String(ans + 1), String(ans + 2), String(ans * 2), String(ans + 3), String(ans + 5)]) if (w !== String(ans) && !w.includes('.') && Number(w) > 0 && !out.includes(w) && out.length < 3) out.push(w)
  return gq({
    t: 'formula',
    prompt,
    correct: num(ans),
    wrong: out.map((w) => num(Number(w))),
    why: `Substitute the values you know, then solve the equation for the unknown: it is ${num(ans)}.`,
    meta: {},
  })
}

const SET_907 = set('9.07', 'Equations and formulas', 'Substitute into a formula and solve the equation for the unknown.', [EQU], [mk('formula', m907formula)])

// ================================================================== 9.08 Changing the subject of a formula (extension)

/** formula, new subject, right answer, likely wrong answers (all as ex() source) */
const SUBJECTS: (() => [string, string, string, string[]])[] = [
  () => {
    const a = int(2, 9)
    const k = int(1, 9)
    return [`y = ${a}x + ${k}`, 'x', `x = frac{y - ${k}}{${a}}`, [`x = frac{y + ${k}}{${a}}`, `x = frac{y}{${a}} - ${k}`, `x = ${a}y - ${k}`]]
  },
  () => {
    const k = int(1, 9)
    return [`p = ax - ${k}`, 'x', `x = frac{p + ${k}}{a}`, [`x = frac{p - ${k}}{a}`, `x = frac{p}{a} + ${k}`, `x = ap + ${k}`]]
  },
  () => ['P = 2l + 2w', 'w', 'w = frac{P - 2l}{2}', ['w = P - 2l', 'w = frac{P}{2} - 2l', 'w = frac{P + 2l}{2}']],
  () => ['A = lw', 'w', 'w = frac{A}{l}', ['w = Al', 'w = A - l', 'w = frac{l}{A}']],
  () => ['v = u + at', 'a', 'a = frac{v - u}{t}', ['a = v - u - t', 'a = frac{v}{t} - u', 'a = frac{v + u}{t}']],
  () => ['y = mx + c', 'x', 'x = frac{y - c}{m}', ['x = frac{y + c}{m}', 'x = ym - c', 'x = frac{y}{m} - c']],
]

function m908subject(): GameQuestion {
  const [f, s, right, wrong] = pick(SUBJECTS)()
  return gq({
    t: 'subject',
    prompt: `Make ${b(ex(s))} the subject of${big(ex(f))}`,
    correct: ex(right),
    wrong: wrong.map(ex),
    why: `Undo the operations on ${ex(s)} in reverse order, doing the same to both sides: ${ex(right)}.`,
    meta: {},
  })
}

const SET_908 = set('9.08', 'Changing the subject of a formula', 'Rearrange a formula to make another pronumeral the subject.', [], [mk('subject', m908subject)], { teacherNote: EXT_SUBJ })

export const NCM8_CH9: GameChapter = {
  id: 'ncm8-ch9',
  number: 9,
  title: 'Equations',
  ref: 'NCM 8 Chapter 9',
  strand: 'Number and algebra',
  outcomes: [EQU],
  sets: [SET_901, SET_902, SET_903, SET_904, SET_905, SET_906, SET_907, SET_908],
  colour: 265,
  topics: [],
}

