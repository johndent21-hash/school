// Year 9 Equations, following New Century Maths 9 (3rd edition, Cengage) Chapter 7 exercise by exercise.
// The questions are the site's own: they practise the same kinds of question as each exercise, in the same
// easy-to-hard order (Foundation = the start of the exercise, Challenge = the end), but none of the textbook's
// wording or numbers are copied.
// Syllabus: linear equations of up to 3 steps with at most one algebraic fraction, pronumerals on both sides,
// problems and formulas are MA5-EQU-C-01. Quadratic equations are in the Path outcomes (MA5-EQU-P-01, which
// appears to include ax² = c), so 7.05 is an extension skill, left out of the topic test, though NCM 9 doesn't mark it
// PATH. Power plus is an extension.
// Flowcharts (backtracking) and balance scales become ordinary solve questions; "make up your own equation" is left out.
import type { Answer, Level, Question, Skill, TestItem } from '@/lib/maths/types'
import { MINUS, chance, frac, gcd, int, mcA, name, num, numA, pick, q, sample, v } from './helpers'

const EQU = ['MA5-EQU-C-01']
const EQU_P = ['MA5-EQU-P-01']
const ref = (e: string) => `NCM 9 Ex ${e}`
const LET = ['a', 'b', 'd', 'h', 'k', 'm', 'n', 'p', 'q', 't', 'u', 'w', 'x', 'y']
const big = (s: string) => `<div class="big">${s}</div>`
const sgn = (n: number) => (n < 0 ? MINUS + -n : String(n))

/** the exact solution as an answer: whole numbers typed as numbers, others as fractions (or exact decimals) */
function solA(n: number, d: number): Answer {
  const g = gcd(Math.abs(n), Math.abs(d)) || 1
  let [a, b] = [n / g, d / g]
  if (b < 0) [a, b] = [-a, -b]
  return b === 1 ? numA(a) : { kind: 'frac', n: a, d: b, simplest: false, allowDecimal: true }
}
const solText = (n: number, d: number) => {
  const g = gcd(Math.abs(n), Math.abs(d)) || 1
  let [a, b] = [n / g, d / g]
  if (b < 0) [a, b] = [-a, -b]
  return b === 1 ? sgn(a) : (a < 0 ? MINUS : '') + frac(Math.abs(a), b)
}
/** "3x + 2" (HTML) and "3*x+2" (parseable) for a·x + b */
const term = (a: number, x: string) => (a === 1 ? v(x) : a === -1 ? MINUS + v(x) : `${sgn(a)}${v(x)}`)
const linH = (a: number, b: number, x: string, numFirst = false) => {
  if (a === 0) return sgn(b)
  if (b === 0) return term(a, x)
  if (numFirst) return `${b}${a < 0 ? ` ${MINUS} ` : ' + '}${Math.abs(a) === 1 ? '' : Math.abs(a)}${v(x)}`
  return `${term(a, x)} ${b < 0 ? MINUS : '+'} ${Math.abs(b)}`
}
const linA = (a: number, b: number, x: string) => `(${a}*${x}+(${b}))`

// ================================================================= 7.01 Two-step equations

interface Eq {
  shown: string // HTML of the equation
  lhs: string // parseable
  rhs: string
  n: number // solution numerator
  d: number // and denominator
  steps: string[]
}
function twoStep(level: Level): Eq {
  const x = pick(LET)
  const sol = level === 1 ? int(-6, 12) : int(-12, 15)
  const kind = level === 1 ? pick(['ax+b', 'ax+b', 'b-ax', 'ax=bx+c'] as const) : level === 2 ? pick(['ax/b', '(x+a)/b', 'x/a+b'] as const) : pick(['a-x/b', '(a-x)/b', 'decimal', '-ax/b'] as const)
  switch (kind) {
    case 'ax+b': {
      const a = int(2, 9)
      const b = int(-15, 20)
      const c = a * sol + b
      return { shown: `${linH(a, b, x)} = ${sgn(c)}`, lhs: linA(a, b, x), rhs: String(c), n: sol, d: 1, steps: [`${b >= 0 ? 'Subtract' : 'Add'} ${Math.abs(b)} ${b >= 0 ? 'from' : 'to'} both sides: ${term(a, x)} = ${sgn(c - b)}`, `Divide both sides by ${a}: ${v(x)} = ${sgn(sol)}`] }
    }
    case 'b-ax': {
      const a = int(2, 9)
      const b = int(1, 25)
      const c = b - a * sol
      return { shown: `${linH(-a, b, x, true)} = ${sgn(c)}`, lhs: `(${b}-${a}*${x})`, rhs: String(c), n: sol, d: 1, steps: [`Subtract ${b} from both sides: ${MINUS}${a}${v(x)} = ${sgn(c - b)}`, `Divide both sides by ${MINUS}${a}: ${v(x)} = ${sgn(sol)}`] }
    }
    case 'ax=bx+c': {
      const a = int(2, 9)
      const b = int(1, 12)
      if (b === a) return twoStep(level)
      const c = (a - b) * sol
      if (c === 0) return twoStep(level)
      const pos = chance()
      return { shown: pos ? `${term(a, x)} = ${linH(b, c, x)}` : `${linH(b, c, x)} = ${term(a, x)}`, lhs: `${a}*${x}`, rhs: linA(b, c, x), n: c, d: a - b, steps: [`Subtract ${b === 1 ? '' : b}${v(x)} from both sides: ${term(a - b, x)} = ${sgn(c)}`, `${v(x)} = ${solText(c, a - b)}`] }
    }
    case 'ax/b': {
      const a = pick([2, 3, 4, 5, 6, -2, -3, -5])
      const b = int(2, 11)
      if (gcd(Math.abs(a), b) !== 1) return twoStep(level)
      const c = int(-9, 12)
      // a·x / b = c → x = b·c / a
      return { shown: `${frac(term(a, x), b)} = ${sgn(c)}`, lhs: `(${a}*${x})/${b}`, rhs: String(c), n: b * c, d: a, steps: [`Multiply both sides by ${b}: ${term(a, x)} = ${sgn(b * c)}`, `Divide both sides by ${sgn(a)}: ${v(x)} = ${solText(b * c, a)}`] }
    }
    case '(x+a)/b': {
      const a = int(-9, 9)
      const b = pick([2, 3, 4, 5, -4, -5])
      const c = int(-6, 9)
      if (a === 0) return twoStep(level)
      const top = linH(1, a, x)
      return { shown: `${frac(top, sgn(b))} = ${sgn(c)}`, lhs: `(${x}+(${a}))/(${b})`, rhs: String(c), n: b * c - a, d: 1, steps: [`Multiply both sides by ${sgn(b)}: ${top} = ${sgn(b * c)}`, `${a > 0 ? 'Subtract' : 'Add'} ${Math.abs(a)}: ${v(x)} = ${sgn(b * c - a)}`] }
    }
    case 'x/a+b': {
      const a = int(2, 9)
      const b = int(-12, 12)
      const c = int(-8, 12)
      if (b === 0 || b === c) return twoStep(level)
      return { shown: `${frac(v(x), a)} ${b < 0 ? MINUS : '+'} ${Math.abs(b)} = ${sgn(c)}`, lhs: `${x}/${a}+(${b})`, rhs: String(c), n: a * (c - b), d: 1, steps: [`${b > 0 ? 'Subtract' : 'Add'} ${Math.abs(b)}: ${frac(v(x), a)} = ${sgn(c - b)}`, `Multiply both sides by ${a}: ${v(x)} = ${sgn(a * (c - b))}`] }
    }
    case 'a-x/b': {
      const a = int(1, 12)
      const b = int(2, 9)
      const c = int(-6, 12)
      if (a === c) return twoStep(level)
      return { shown: `${a} ${MINUS} ${frac(v(x), b)} = ${sgn(c)}`, lhs: `${a}-${x}/${b}`, rhs: String(c), n: b * (a - c), d: 1, steps: [`Subtract ${a}: ${MINUS}${frac(v(x), b)} = ${sgn(c - a)}`, `Multiply both sides by ${MINUS}${b}: ${v(x)} = ${sgn(b * (a - c))}`] }
    }
    case '(a-x)/b': {
      const a = int(-6, 12)
      const b = pick([-5, -4, -3, -2, 2, 3, 4])
      const c = int(-6, 6)
      return { shown: `${frac(`${a} ${MINUS} ${v(x)}`, sgn(b))} = ${sgn(c)}`, lhs: `(${a}-${x})/(${b})`, rhs: String(c), n: a - b * c, d: 1, steps: [`Multiply both sides by ${sgn(b)}: ${a} ${MINUS} ${v(x)} = ${sgn(b * c)}`, `${v(x)} = ${a} ${MINUS} ${b * c < 0 ? `(${sgn(b * c)})` : b * c} = ${sgn(a - b * c)}`] }
    }
    case '-ax/b': {
      const a = int(2, 9)
      const b = int(2, 13)
      const c = int(-9, 9)
      if (c === 0 || gcd(a, b) !== 1) return twoStep(level)
      return { shown: `${frac(`${MINUS}${a}${v(x)}`, b)} = ${sgn(c)}`, lhs: `(-${a}*${x})/${b}`, rhs: String(c), n: -b * c, d: a, steps: [`Multiply both sides by ${b}: ${MINUS}${a}${v(x)} = ${sgn(b * c)}`, `Divide by ${MINUS}${a}: ${v(x)} = ${solText(-b * c, a)}`] }
    }
    default: {
      // decimals: 1.2 − 5q = 7.2
      const a = int(2, 9)
      const b = int(11, 49) / 10
      const c = Number((b - a * sol).toFixed(1))
      return { shown: `${num(b)} ${MINUS} ${a}${v(x)} = ${num(c).replace('-', MINUS)}`, lhs: `${b}-${a}*${x}`, rhs: String(c), n: sol, d: 1, steps: [`Subtract ${num(b)}: ${MINUS}${a}${v(x)} = ${num(Number((c - b).toFixed(1))).replace('-', MINUS)}`, `Divide by ${MINUS}${a}: ${v(x)} = ${sgn(sol)}`] }
    }
  }
}
function solveQ(e: Eq, x: string, hint: string, intro = 'Solve the equation.'): Question {
  return q({
    prompt: `${intro}${big(e.shown)}`,
    answer: solA(e.n, e.d),
    prefix: `${v(x)} =`,
    hint,
    steps: [...e.steps, `Check: substitute ${v(x)} = ${solText(e.n, e.d)} into both sides.`],
    meta: { t: 'eq', x, lhs: e.lhs, rhs: e.rhs },
  })
}
const xOf = (e: Eq) => (e.lhs + e.rhs).match(/[a-z]/)![0]
function whichSolution(): Question {
  const sol = pick([-5, -4, -3, -2, 2, 3, 4, 5, 6])
  const x = 'x'
  // one equation has the solution; the others don't
  const make = (target: number): { s: string; f: (t: number) => boolean } => {
    const kind = pick(['lin', 'frac', 'div'] as const)
    const a = int(2, 5)
    if (kind === 'lin') {
      const b = int(-7, 7)
      const c = a * target + b
      return { s: `${linH(a, b, x)} = ${sgn(c)}`, f: (t) => a * t + b === c }
    }
    if (kind === 'frac') {
      // (x + p)/a = c with c a whole number
      const c = int(-4, 5)
      const p0 = a * c - target
      if (p0 === 0) return make(target)
      return { s: `${frac(linH(1, p0, x), a)} = ${sgn(c)}`, f: (t) => (t + p0) / a === c }
    }
    // a·x / 2 = c
    if ((a * target) % 2 !== 0) return make(target)
    return { s: `${frac(term(a, x), 2)} = ${sgn((a * target) / 2)}`, f: (t) => (a * t) / 2 === (a * target) / 2 }
  }
  const right = make(sol)
  const wrongs: string[] = []
  let k = 0
  while (wrongs.length < 3 && k++ < 50) {
    const w = make(sol + pick([-2, -1, 1, 2, 3]))
    if (!w.f(sol) && !wrongs.includes(w.s) && w.s !== right.s) wrongs.push(w.s)
  }
  if (wrongs.length < 3) return whichSolution()
  return q({
    prompt: `Which equation has the solution ${v(x)} = ${sgn(sol)}?`,
    answer: mcA(right.s, wrongs),
    hint: `Substitute ${v(x)} = ${sgn(sol)} into each equation and see which one is true.`,
    steps: [`Substituting ${v(x)} = ${sgn(sol)} makes only ${right.s} true.`],
    meta: { t: 'whichSol', sol },
  })
}
const ex701 = (level: Level): Question => {
  if (level === 2 && chance(0.15)) return whichSolution()
  const e = twoStep(level)
  return solveQ(e, xOf(e), level === 1 ? 'Undo the operations in reverse order: first the + or −, then the × or ÷. Do the same to both sides.' : 'Undo the + or − first, then multiply by the denominator (or multiply first if the whole side is a fraction).')
}

// ================================================================= 7.02 Variables on both sides

function bothSides(level: Level): Eq {
  const x = pick(LET)
  for (;;) {
    const sol = level === 3 ? int(-12, 12) : int(-8, 10)
    const a = level === 1 ? int(3, 13) : int(-12, 13)
    const c = level === 1 ? int(1, a - 1) : int(-12, 13)
    if (a === c || a === 0 || c === 0) continue
    const b = int(-25, 30)
    const d = (a - c) * sol + b
    // level 3: the solution can be a fraction
    if (level === 3 && chance(0.4)) {
      const dd = d + int(1, Math.abs(a - c) - 1 || 1)
      if ((dd - b) % (a - c) === 0) continue
      return { shown: `${linH(a, b, x, chance(0.4))} = ${linH(c, dd, x, chance(0.4))}`, lhs: linA(a, b, x), rhs: linA(c, dd, x), n: dd - b, d: a - c, steps: [`Collect the ${v(x)} terms on one side: ${term(a - c, x)} ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${sgn(dd)}`, `${term(a - c, x)} = ${sgn(dd - b)}`, `${v(x)} = ${solText(dd - b, a - c)}`] }
    }
    return { shown: `${linH(a, b, x, level > 1 && chance(0.4))} = ${linH(c, d, x, level > 1 && chance(0.4))}`, lhs: linA(a, b, x), rhs: linA(c, d, x), n: sol, d: 1, steps: [`${c > 0 ? 'Subtract' : 'Add'} ${Math.abs(c) === 1 ? '' : Math.abs(c)}${v(x)} ${c > 0 ? 'from' : 'to'} both sides: ${linH(a - c, b, x)} = ${sgn(d)}`, `${b > 0 ? 'Subtract' : 'Add'} ${Math.abs(b)}: ${term(a - c, x)} = ${sgn(d - b)}`, a - c === 1 ? `${v(x)} = ${sgn(sol)}` : `Divide by ${sgn(a - c)}: ${v(x)} = ${sgn(sol)}`] }
  }
}
function bothSidesMC(): Question {
  const e = bothSides(2)
  const x = xOf(e)
  const s = e.n / e.d
  const wrong = Array.from(new Set([s + 1, -s, s - 2, s * 2, s + 3].filter((w) => w !== s))).slice(0, 3)
  return q({
    prompt: `Solve the equation. Which is the solution?${big(e.shown)}`,
    answer: mcA(`${v(x)} = ${sgn(s)}`, wrong.map((w) => `${v(x)} = ${sgn(w)}`)),
    hint: 'Move the letters to one side and the numbers to the other, or substitute each choice.',
    steps: e.steps,
    meta: { t: 'eqMC', x, lhs: e.lhs, rhs: e.rhs },
  })
}
const ex702 = (level: Level): Question => {
  if (level === 2 && chance(0.2)) return bothSidesMC()
  const e = bothSides(level)
  return solveQ(e, xOf(e), 'Move all the terms with the letter to one side and all the numbers to the other side, then divide.')
}

// ================================================================= 7.03 Equations with brackets

function brackets(level: Level): Eq {
  const x = pick(LET)
  for (;;) {
    const sol = int(-8, 12)
    const a = pick([2, 3, 4, 5, 6, 7, 8, 9, -2, -3])
    const b = int(-9, 9)
    if (b === 0) continue
    if (level === 1) {
      const kind = pick(['a(x+b)=c', 'c=a(x+b)', 'a(b-x)=c'] as const)
      if (kind === 'a(b-x)=c') {
        const A = Math.abs(a)
        const B = Math.abs(b) // a positive number inside, as in 4(3 − a) = 16
        const c = A * (B - sol)
        return { shown: `${A}(${B} ${MINUS} ${v(x)}) = ${sgn(c)}`, lhs: `${A}*(${B}-${x})`, rhs: String(c), n: sol, d: 1, steps: [`Expand: ${A * B} ${MINUS} ${A}${v(x)} = ${sgn(c)}`, `${MINUS}${A}${v(x)} = ${sgn(c - A * B)}`, `${v(x)} = ${sgn(sol)}`] }
      }
      const c = a * (sol + b)
      const left = `${a === -1 ? MINUS : sgn(a)}(${linH(1, b, x)})`
      return { shown: kind === 'c=a(x+b)' ? `${sgn(c)} = ${left}` : `${left} = ${sgn(c)}`, lhs: `${a}*(${x}+(${b}))`, rhs: String(c), n: sol, d: 1, steps: [`Expand: ${linH(a, a * b, x)} = ${sgn(c)}`, `${term(a, x)} = ${sgn(c - a * b)}`, `${v(x)} = ${sgn(sol)}`] }
    }
    if (level === 2) {
      // a(x + b) = c(x + d), or a(x + b) = cx
      const c = int(2, 9)
      if (c === a) continue
      const d0 = int(-9, 9)
      // a·sol + a·b = c·sol + c·d0 → choose d0 so it works: need a·b − c·d0 = (c − a)·sol
      const rhsNum = (c - a) * sol + c * d0
      if (rhsNum % a !== 0) continue
      const bb = rhsNum / a
      if (bb === 0 || Math.abs(bb) > 15) continue
      return { shown: `${sgn(a)}(${linH(1, bb, x)}) = ${c}(${linH(1, d0, x)})`.replace(`(${linH(1, 0, x)})`, v(x)), lhs: `${a}*(${x}+(${bb}))`, rhs: `${c}*(${x}+(${d0}))`, n: sol, d: 1, steps: [`Expand both sides: ${linH(a, a * bb, x)} = ${linH(c, c * d0, x)}`, `Collect terms: ${term(a - c, x)} = ${sgn(c * d0 - a * bb)}`, `${v(x)} = ${sgn(sol)}`] }
    }
    // level 3: a(x + b) + e = c(x + d) + f
    const c = int(2, 8)
    const d0 = int(-6, 6)
    const e = int(-12, 12)
    const f = (a - c) * sol + a * b + e - c * d0
    if (a === c || Math.abs(f) > 40 || f === 0) continue
    return {
      shown: `${sgn(a)}(${linH(1, b, x)}) ${e < 0 ? MINUS : '+'} ${Math.abs(e)} = ${c}(${linH(1, d0, x)}) ${f < 0 ? MINUS : '+'} ${Math.abs(f)}`.replace(`(${linH(1, 0, x)})`, v(x)),
      lhs: `${a}*(${x}+(${b}))+(${e})`,
      rhs: `${c}*(${x}+(${d0}))+(${f})`,
      n: sol,
      d: 1,
      steps: [`Expand: ${linH(a, a * b + e, x)} = ${linH(c, c * d0 + f, x)}`, `Collect terms: ${term(a - c, x)} = ${sgn(c * d0 + f - a * b - e)}`, `${v(x)} = ${sgn(sol)}`],
    }
  }
}
const ex703 = (level: Level): Question => {
  const e = brackets(level)
  return solveQ(e, xOf(e), 'Expand the brackets first (multiply every term inside by the number outside), then solve as usual.')
}

// ================================================================= 7.04 Equation problems

interface Problem {
  prompt: string
  answer: Answer
  suffix?: string
  hint: string
  steps: string[]
  meta: Record<string, unknown>
}
function problem(level: Level): Problem {
  const kinds = level === 1 ? (['numberWords', 'fraction', 'double'] as const) : level === 2 ? (['rectangle', 'consecutive', 'ages', 'change'] as const) : (['consecutiveOdd', 'coins', 'heights', 'agesChain', 'rectangleMore'] as const)
  const kind = pick(kinds as readonly string[])
  switch (kind) {
    case 'numberWords': {
      const k = int(3, 9)
      const s = int(2, 20)
      const xv = int(3, 25)
      const r = k * xv - s
      if (r < 1) return problem(level) // keep the result positive, as a word problem would
      return { prompt: `When ${s} is subtracted from ${k} times a number, the answer is ${r}. What is the number?`, answer: numA(xv), hint: 'Let the number be x and write the sentence as an equation.', steps: [`${k}${v('x')} − ${s} = ${r}`, `${k}${v('x')} = ${r + s}`, `${v('x')} = ${xv}`], meta: { k, s, r, kind } }
    }
    case 'fraction': {
      const [p0, q0] = pick([[2, 3], [3, 4], [2, 5], [3, 5], [5, 6], [4, 7]] as [number, number][])
      const xv = q0 * int(2, 15)
      const add0 = int(3, 20)
      const r = (p0 * xv) / q0 + add0
      return { prompt: `When ${p0 === 2 && q0 === 3 ? 'two-thirds' : `${p0}/${q0}`} of a number is increased by ${add0}, the result is ${r}. What is the number?`, answer: numA(xv), hint: 'Let the number be x: the equation is (fraction) × x + (amount) = result.', steps: [`${frac(`${p0}${v('x')}`, q0)} + ${add0} = ${r}`, `${frac(`${p0}${v('x')}`, q0)} = ${r - add0}`, `${p0}${v('x')} = ${(r - add0) * q0}, so ${v('x')} = ${xv}`], meta: { p0, q0, add0, r, kind } }
    }
    case 'double': {
      const a = int(10, 30)
      const b = int(1, 9)
      const xv = a - b
      return { prompt: `${a} more than a number is the same as ${b} more than double the number. What is the number?`, answer: numA(xv), hint: 'Write each side in terms of x and set them equal.', steps: [`${v('x')} + ${a} = 2${v('x')} + ${b}`, `${v('x')} = ${xv}`], meta: { a, b, kind } }
    }
    case 'rectangle': {
      const k = int(2, 5)
      const w = int(3, 20) + (chance(0.3) ? 0.5 : 0)
      const P = 2 * (w + k * w)
      const ask = pick(['width', 'length'])
      return { prompt: `A rectangle is ${k} times as long as it is wide, and its perimeter is ${num(P)} cm. Find its ${ask}.`, answer: numA(ask === 'width' ? w : k * w), suffix: 'cm', hint: `Let the width be w cm. The length is ${k}w cm, and the perimeter is w + ${k}w + w + ${k}w.`, steps: [`w + ${k}w + w + ${k}w = ${num(P)}`, `${2 + 2 * k}w = ${num(P)}`, `w = ${num(w)}, so the length is ${num(k * w)} cm`], meta: { k, P, ask, kind } }
    }
    case 'consecutive': {
      const n0 = int(3, 3) === 3 ? pick([2, 3]) : 3
      const xv = int(10, 90)
      const sum = n0 === 2 ? 2 * xv + 1 : 3 * xv + 3
      const vals = n0 === 2 ? [xv, xv + 1] : [xv, xv + 1, xv + 2]
      return { prompt: `The sum of ${n0} consecutive whole numbers is ${sum}. Find the numbers.`, answer: { kind: 'nums', values: vals }, hint: 'Let the first number be x. The next ones are x + 1' + (n0 === 3 ? ' and x + 2.' : '.'), steps: [n0 === 2 ? `${v('x')} + (${v('x')} + 1) = ${sum}` : `${v('x')} + (${v('x')} + 1) + (${v('x')} + 2) = ${sum}`, n0 === 2 ? `2${v('x')} + 1 = ${sum}, so ${v('x')} = ${xv}` : `3${v('x')} + 3 = ${sum}, so ${v('x')} = ${xv}`, `The numbers are ${vals.join(', ')}.`], meta: { n0, sum, kind } }
    }
    case 'consecutiveOdd': {
      const even = chance()
      const xv = 2 * int(5, 40) + (even ? 0 : 1)
      const sum = 3 * xv + 6
      return { prompt: `The sum of 3 consecutive ${even ? 'even' : 'odd'} numbers is ${sum}. Find the numbers.`, answer: { kind: 'nums', values: [xv, xv + 2, xv + 4] }, hint: `Let the first be x. Consecutive ${even ? 'even' : 'odd'} numbers go up by 2: x, x + 2, x + 4.`, steps: [`${v('x')} + (${v('x')} + 2) + (${v('x')} + 4) = ${sum}`, `3${v('x')} + 6 = ${sum}, so ${v('x')} = ${xv}`, `The numbers are ${xv}, ${xv + 2}, ${xv + 4}.`], meta: { even, sum, kind } }
    }
    case 'ages': {
      const [p1, p2] = sample(['Mia', 'Ravi', 'Lena', 'Tom', 'Kai', 'Zoe'], 2)
      const older = int(2, 8)
      const k = int(2, 4)
      const xv = int(older + 5, older + 14) // p1's age: the younger one is at least 5
      const sum = xv + (xv - older) + k * xv
      return { prompt: `${p1} is ${older} years older than ${p2}. Their mother is ${k} times ${p1}’s age. The sum of the three ages is ${sum}. How old is ${p1}?`, answer: numA(xv), suffix: 'years', hint: `Let ${p1}’s age be x. Then ${p2} is x − ${older} and their mother is ${k}x.`, steps: [`${v('x')} + (${v('x')} − ${older}) + ${k}${v('x')} = ${sum}`, `${k + 2}${v('x')} − ${older} = ${sum}`, `${v('x')} = ${xv}`], meta: { older, k, sum, kind } }
    }
    case 'change': {
      const n0 = int(3, 6)
      const price = int(150, 600) / 100
      const note = pick([20, 50])
      const change = Number((note - n0 * price).toFixed(2))
      if (change <= 0) return problem(level)
      return { prompt: `${name()} bought ${n0} sandwiches, all the same price, and got $${change.toFixed(2)} change from a $${note} note. How much did each sandwich cost?`, answer: numA(price, 2), suffix: undefined, hint: 'Let each cost $c. Then the total plus the change makes the note.', steps: [`${n0}${v('c')} + ${change.toFixed(2)} = ${note}`, `${n0}${v('c')} = ${(note - change).toFixed(2)}`, `${v('c')} = $${price.toFixed(2)}`], meta: { n0, change, note, kind } }
    }
    case 'coins': {
      const [lo, hi] = pick([[1, 2], [20, 50], [10, 20], [5, 10]] as [number, number][])
      const total = int(40, 300)
      const nHi = int(5, total - 5)
      const value = lo * (total - nHi) + hi * nHi
      const show = (c: number) => (lo >= 5 ? `${c}-cent` : `$${c}`)
      const val = lo >= 5 ? `$${(value / 100).toFixed(2)}` : `$${value}`
      return { prompt: `A money box holds only ${show(lo)} and ${show(hi)} coins: ${total} coins altogether, worth ${val}. How many ${show(hi)} coins are there?`, answer: numA(nHi), hint: `Let x be the number of ${show(hi)} coins. Then there are ${total} − x of the others. Write the total value as an equation.`, steps: [`${hi}${v('x')} + ${lo}(${total} − ${v('x')}) = ${value}${lo >= 5 ? ' (in cents)' : ''}`, `${hi - lo}${v('x')} = ${value - lo * total}`, `${v('x')} = ${nHi}`], meta: { lo, hi, total, value, kind } }
    }
    case 'heights': {
      const s = int(60, 90) // sister's height in cm
      const diff = int(15, 40)
      const total = s + 2 * s + 2 * s + diff
      return { prompt: `Jai is twice as tall as his little sister and ${diff} cm shorter than his father. Their three heights add to ${(total / 100).toFixed(2)} m. How tall is the sister, in centimetres?`, answer: numA(s), suffix: 'cm', hint: 'Let the sister’s height be h cm. Then Jai is 2h and the father is 2h + ' + diff + '. Change the total to centimetres.', steps: [`${v('h')} + 2${v('h')} + (2${v('h')} + ${diff}) = ${total}`, `5${v('h')} = ${total - diff}`, `${v('h')} = ${s}`], meta: { diff, total, kind } }
    }
    case 'agesChain': {
      const child = int(5, 12)
      const older = int(2, 6)
      const k = int(3, 5)
      const sib = child + older
      const parent = k * sib
      const sum = child + sib + parent
      return { prompt: `A parent is ${k} times as old as their son, who is ${older} years older than his sister. The sum of the three ages is ${sum}. How old is the sister?`, answer: numA(child), suffix: 'years', hint: 'Let the sister’s age be x. Write the son’s and the parent’s ages in terms of x.', steps: [`Son: ${v('x')} + ${older}; parent: ${k}(${v('x')} + ${older})`, `${v('x')} + (${v('x')} + ${older}) + ${k}(${v('x')} + ${older}) = ${sum}`, `${k + 2}${v('x')} + ${older * (k + 1)} = ${sum}, so ${v('x')} = ${child}`], meta: { k, older, sum, kind } }
    }
    default: {
      // rectangle: length is d cm more than the width
      const d = int(3, 15) + (chance(0.4) ? 0.5 : 0)
      const w = int(5, 30)
      const P = 2 * (2 * w + d)
      return { prompt: `The length of a rectangle is ${num(d)} cm more than its width, and its perimeter is ${num(P)} cm. Find the width.`, answer: numA(w), suffix: 'cm', hint: `Let the width be w. The length is w + ${num(d)}.`, steps: [`2(w + w + ${num(d)}) = ${num(P)}`, `4w + ${num(2 * d)} = ${num(P)}`, `w = ${w}`], meta: { d, P, kind: 'rectangleMore' } }
    }
  }
}
const ex704 = (level: Level): Question => {
  const p = problem(level)
  return q({ prompt: p.prompt, answer: p.answer, suffix: p.suffix, hint: p.hint + ' Check your answer in the words of the problem.', steps: p.steps, meta: { t: 'problem', ...p.meta }, calc: p.meta.kind === 'change' || p.meta.kind === 'heights' ? true : undefined })
}

// ================================================================= 7.05 Simple quadratic equations ax² = c (Path, extension)

function quadratic(level: Level): Question {
  const x = pick(LET)
  if (level === 3 && chance(0.4)) {
    // which equation has no solutions?
    const make = (neg: boolean) => {
      const a = int(2, 9)
      const b = int(1, 12)
      const c = neg ? b - int(1, 10) : b + int(1, 10)
      return { s: `${a}${v(x)}<sup>2</sup> + ${b} = ${sgn(c)}`, neg }
    }
    const right = make(true)
    const wrong = [make(false), make(false), make(false)]
    if (new Set(wrong.map((w) => w.s)).size < 3) return quadratic(level)
    return q({
      prompt: 'Which of these equations has no solutions?',
      answer: mcA(right.s, wrong.map((w) => w.s)),
      hint: `${v(x)}<sup>2</sup> can’t be negative. Rearrange each one to ${v(x)}<sup>2</sup> = …`,
      steps: [`In ${right.s}, ${v(x)}<sup>2</sup> comes out negative, so there is no solution.`],
      meta: { t: 'noSol' },
    })
  }
  if (level === 1) {
    const r = int(1, 15)
    const a = pick([1, 1, 2, 3, 4, 5])
    return q({
      prompt: `Solve the equation.${big(`${a === 1 ? '' : a}${v(x)}<sup>2</sup> = ${a * r * r}`)}`,
      answer: { kind: 'nums', values: [r, -r] },
      prefix: `${v(x)} =`,
      hint: `${a === 1 ? '' : `Divide by ${a} first. `}Then take the square root: there are two answers, one positive and one negative.`,
      steps: [...(a === 1 ? [] : [`${v(x)}<sup>2</sup> = ${r * r}`]), `${v(x)} = ±${r}`],
      meta: { t: 'quad', x, a, c: a * r * r, dp: null },
    })
  }
  // level 2 and 3: rounded answers, with a constant or a fraction
  for (;;) {
    const a = int(1, 9)
    const kind = level === 2 ? pick(['ax2=c', 'x2/k=c'] as const) : pick(['ax2+b=c', 'ax2/k=c'] as const)
    const b = int(2, 20)
    const k = int(2, 7)
    const c = int(3, 90)
    let shown = ''
    let sq = 0
    if (kind === 'ax2=c') {
      shown = `${a === 1 ? '' : a}${v(x)}<sup>2</sup> = ${c}`
      sq = c / a
    } else if (kind === 'x2/k=c') {
      shown = `${frac(`${v(x)}<sup>2</sup>`, k)} = ${c}`
      sq = c * k
    } else if (kind === 'ax2+b=c') {
      shown = `${a === 1 ? '' : a}${v(x)}<sup>2</sup> + ${b} = ${c + b}`
      sq = c / a
    } else {
      shown = `${frac(`${a}${v(x)}<sup>2</sup>`, k)} = ${c}`
      sq = (c * k) / a
    }
    const r = Math.sqrt(sq)
    if (Number.isInteger(r) || Math.abs(r * 10 - Math.floor(r * 10) - 0.5) < 0.02) continue
    return q({
      prompt: `Solve the equation, giving the answers correct to one decimal place.${big(shown)}`,
      answer: { kind: 'nums', values: [r, -r], dp: 1 },
      prefix: `${v(x)} =`,
      calc: true,
      hint: `Rearrange to ${v(x)}<sup>2</sup> = …, then take the square root. Remember the negative answer.`,
      steps: [`${v(x)}<sup>2</sup> = ${num(Number(sq.toPrecision(10)))}`, `${v(x)} = ±√${num(Number(sq.toPrecision(10)))} = ±${num(Number(r.toPrecision(8)))}…`, `${v(x)} ≈ ±${num(Math.round(r * 10) / 10, 1)}`],
      meta: { t: 'quad', x, sq, dp: 1 },
    })
  }
}

// ================================================================= 7.06 Equations and formulas

interface Formula {
  text: string // HTML of the formula
  vars: string[]
  f: (env: Record<string, number>) => number // the subject from the others
  subject: string
  ranges: Record<string, () => number>
  unit?: Record<string, string>
  context?: string
}
const FORMULAS: Formula[] = [
  { text: `${v('y')} = 5${v('x')} + ${v('c')}`, vars: ['x', 'c'], subject: 'y', f: (e) => 5 * e.x + e.c, ranges: { x: () => int(-6, 12), c: () => int(-20, 20) } },
  { text: `${v('F')} = ${frac(`9${v('C')}`, 5)} + 32`, vars: ['C'], subject: 'F', f: (e) => (9 * e.C) / 5 + 32, ranges: { C: () => 5 * int(-8, 20) }, context: 'A temperature in °C can be changed to °F with the formula' },
  { text: `${v('P')} = 2(${v('l')} + ${v('w')})`, vars: ['l', 'w'], subject: 'P', f: (e) => 2 * (e.l + e.w), ranges: { l: () => int(5, 40), w: () => int(2, 30) }, context: 'The perimeter of a rectangle is given by' },
  { text: `${v('C')} = 120 + 65${v('h')}`, vars: ['h'], subject: 'C', f: (e) => 120 + 65 * e.h, ranges: { h: () => int(1, 12) }, context: 'The cost in dollars of hiring a jumping castle for h hours is' },
  { text: `${v('v')} = ${v('u')} + ${v('a')}${v('t')}`, vars: ['u', 'a', 't'], subject: 'v', f: (e) => e.u + e.a * e.t, ranges: { u: () => int(0, 20), a: () => int(2, 9), t: () => int(2, 12) } },
  { text: `${v('S')} = 180(${v('n')} − 2)`, vars: ['n'], subject: 'S', f: (e) => 180 * (e.n - 2), ranges: { n: () => int(3, 14) }, context: 'The angle sum S of a polygon with n sides is' },
  { text: `${v('A')} = ${frac(`${v('b')}${v('h')}`, 2)}`, vars: ['b', 'h'], subject: 'A', f: (e) => (e.b * e.h) / 2, ranges: { b: () => int(4, 30), h: () => int(2, 20) }, context: 'The area of a triangle is' },
  { text: `${v('C')} = 4.20 + 2.25${v('d')}`, vars: ['d'], subject: 'C', f: (e) => 4.2 + 2.25 * e.d, ranges: { d: () => int(2, 40) }, context: 'The cost in dollars of a taxi trip of d km is' },
]
function formulaQ(level: Level): Question {
  const F0 = pick(FORMULAS)
  const env: Record<string, number> = {}
  for (const k of F0.vars) env[k] = F0.ranges[k]()
  const S = F0.f(env)
  const intro = `${F0.context ? F0.context + ':' : 'Given the formula'}${big(F0.text)}`
  // level 1: find the subject; levels 2 and 3: find one of the others (solve an equation)
  if (level === 1) {
    const given = F0.vars.map((k) => `${v(k)} = ${num(env[k]).replace('-', MINUS)}`).join(' and ')
    return q({
      prompt: `${intro}Find ${v(F0.subject)} when ${given}.`,
      answer: numA(Number(S.toFixed(2))),
      prefix: `${v(F0.subject)} =`,
      hint: 'Substitute the values into the formula, then work it out (brackets first).',
      steps: [`Substitute ${given}.`, `${v(F0.subject)} = ${num(Number(S.toFixed(2)))}`],
      meta: { t: 'formula', which: F0.subject, env, formula: F0.subject + '=' + F0.vars.join(','), idx: FORMULAS.indexOf(F0) },
    })
  }
  const unknown = pick(F0.vars)
  const known = F0.vars.filter((k) => k !== unknown)
  const given = [`${v(F0.subject)} = ${num(Number(S.toFixed(2))).replace('-', MINUS)}`, ...known.map((k) => `${v(k)} = ${num(env[k]).replace('-', MINUS)}`)].join(' and ').replace(/ and (.*) and /, ', $1 and ')
  const isHire = F0.subject === 'C' && F0.vars[0] === 'h' && level === 3
  if (isHire) {
    const budget = S + int(1, 64)
    const hours = Math.floor((budget - 120) / 65)
    return q({
      prompt: `${intro}A family has $${budget} to spend. What is the greatest number of whole hours they can hire the castle for?`,
      answer: numA(hours),
      suffix: 'hours',
      hint: 'Solve 120 + 65h = (the budget), then round down to a whole number of hours.',
      steps: [`120 + 65${v('h')} = ${budget}`, `65${v('h')} = ${budget - 120}`, `${v('h')} = ${num(Number(((budget - 120) / 65).toFixed(4)))}…, so ${hours} whole hours`],
      meta: { t: 'hire', budget },
    })
  }
  return q({
    prompt: `${intro}Find ${v(unknown)} when ${given}.`,
    answer: numA(env[unknown]),
    prefix: `${v(unknown)} =`,
    hint: 'Substitute the values you know, then solve the equation for the letter that’s left.',
    steps: [`Substitute: ${given}.`, `Solve the equation: ${v(unknown)} = ${num(env[unknown]).replace('-', MINUS)}`],
    meta: { t: 'formula', which: unknown, env, S, idx: FORMULAS.indexOf(F0) },
  })
}
const ex706 = (level: Level): Question => formulaQ(level)

// ================================================================= Power plus (extension)

function ppTwoFractions(): Question {
  const x = pick(['x', 'm', 'y'])
  for (;;) {
    const a = int(2, 5)
    const b = int(2, 5)
    const p = int(-6, 6)
    const r = int(-6, 6)
    const sol = int(-10, 12)
    if (a === b) continue
    const lhsV = (sol + p) / a + (sol + r) / b
    if (!Number.isInteger(lhsV * 10) || p === 0 || r === 0) continue
    return q({
      prompt: `Solve the equation.${big(`${frac(linH(1, p, x), a)} + ${frac(linH(1, r, x), b)} = ${num(lhsV).replace('-', MINUS)}`)}`,
      answer: numA(sol),
      prefix: `${v(x)} =`,
      hint: `Multiply every term by ${a * b / gcd(a, b)} (the lowest common denominator) to clear the fractions.`,
      steps: [`Multiply every term by ${a * b / gcd(a, b)}, expand and collect terms.`, `${v(x)} = ${sgn(sol)}`],
      meta: { t: 'eq', x, lhs: `(${x}+(${p}))/${a}+(${x}+(${r}))/${b}`, rhs: String(lhsV) },
    })
  }
}
function ppAgesLater(): Question {
  const child = int(4, 12)
  const k = int(3, 5)
  const parent = k * child
  const years = parent - 2 * child // after this many years the parent is twice the child's age
  if (years <= 0) return ppAgesLater()
  return q({
    prompt: `A parent is ${k} times as old as their child, who is ${child}. In how many years will the parent be twice as old as the child?`,
    answer: numA(years),
    suffix: 'years',
    hint: 'Let the number of years be n. Then (parent’s age + n) = 2 × (child’s age + n).',
    steps: [`${parent} + ${v('n')} = 2(${child} + ${v('n')})`, `${parent} + ${v('n')} = ${2 * child} + 2${v('n')}`, `${v('n')} = ${years}`],
    meta: { t: 'agesLater', child, k },
  })
}
const exPP = (level: Level): Question => (level === 3 ? ppTwoFractions() : chance() ? ppAgesLater() : ppTwoFractions())

// ================================================================= skills, test

const T = (skill: string, level: Level, gen: () => Question): TestItem => ({ skill, level, gen: () => gen() })

export const NCM7_TEST: TestItem[] = [
  // about 3 per core exercise (16 in all), in the order of Test Yourself 7; 7.05 (quadratics) is Path, so it isn't here
  T('y9-eq-twostep', 1, () => ex701(1)),
  T('y9-eq-twostep', 2, () => {
    const e = twoStep(2)
    return solveQ(e, xOf(e), 'Undo the + or − first, then multiply by the denominator.')
  }),
  T('y9-eq-twostep', 3, () => ex701(3)),
  T('y9-eq-bothsides', 1, () => ex702(1)),
  T('y9-eq-bothsides', 2, () => ex702(2)),
  T('y9-eq-bothsides', 3, () => ex702(3)),
  T('y9-eq-brackets', 1, () => ex703(1)),
  T('y9-eq-brackets', 2, () => ex703(2)),
  T('y9-eq-brackets', 3, () => ex703(3)),
  T('y9-eq-problems', 1, () => ex704(1)),
  T('y9-eq-problems', 2, () => ex704(2)),
  T('y9-eq-problems', 2, () => ex704(2)),
  T('y9-eq-problems', 3, () => ex704(3)),
  T('y9-eq-formula', 1, () => ex706(1)),
  T('y9-eq-formula', 2, () => ex706(2)),
  T('y9-eq-formula', 3, () => ex706(3)),
]

export const NCM7_SKILLS: Skill[] = [
  {
    id: 'y9-eq-twostep',
    title: 'Two-step equations',
    ref: ref('7.01'),
    outcomes: EQU,
    summary: 'Solve equations in two steps, including ones with fractions.',
    learn: {
      intro: `<p>Undo what has been done to the letter, in reverse order, doing the same to both sides. For ${frac(`${v('w')}`, 3)} − 6 = 5: add 6 (${frac(v('w'), 3)} = 11), then multiply by 3 (${v('w')} = 33).</p>`,
      keyPoints: ['Undo + and − first, then × and ÷ (the reverse of the order they were done).', 'If the whole side is a fraction, multiply by the denominator first.', 'Check by substituting your answer into the original equation.'],
      vocab: [['inverse operation', 'the opposite operation: + undoes −, × undoes ÷'], ['solution', 'the value that makes the equation true']],
    },
    gen: ex701,
    levels: { 1: 'ax + b = c, and with a negative', 2: 'Fractions: x/a + b = c, (x + a)/b = c', 3: 'Harder fractions, negatives and decimals' },
  },
  {
    id: 'y9-eq-bothsides',
    title: 'Equations with variables on both sides',
    ref: ref('7.02'),
    outcomes: EQU,
    summary: 'Collect the letters on one side and the numbers on the other.',
    learn: {
      intro: `<p>For 7${v('x')} + 7 = 2${v('x')} + 2, subtract 2${v('x')} from both sides (5${v('x')} + 7 = 2), subtract 7 (5${v('x')} = −5), then divide by 5 (${v('x')} = −1).</p>`,
      keyPoints: ['Move the smaller letter term, so the letter stays positive.', 'The answer can be a negative number or a fraction.', 'Check: the two sides must come out equal.'],
    },
    gen: ex702,
    levels: { 1: 'Letters on both sides, whole-number answers', 2: 'With negatives', 3: 'Answers that are fractions' },
  },
  {
    id: 'y9-eq-brackets',
    title: 'Equations with brackets',
    ref: ref('7.03'),
    outcomes: EQU,
    summary: 'Expand the brackets, then solve.',
    learn: {
      intro: `<p>Expand first: 5(${v('y')} − 2) = 15 becomes 5${v('y')} − 10 = 15, so 5${v('y')} = 25 and ${v('y')} = 5.</p>`,
      keyPoints: ['Multiply every term inside the brackets by the number outside, including its sign.', 'With brackets on both sides, expand both, then collect terms.'],
    },
    gen: ex703,
    levels: { 1: 'One bracket', 2: 'Brackets on both sides', 3: 'Brackets with extra terms' },
  },
  {
    id: 'y9-eq-problems',
    title: 'Equation problems',
    ref: ref('7.04'),
    outcomes: EQU,
    summary: 'Write an equation for a word problem and solve it.',
    learn: {
      intro: '<p>Let a letter stand for the unknown, write the words as an equation, solve it, then answer the question in words and check it.</p>',
      keyPoints: ['Consecutive numbers: x, x + 1, x + 2. Consecutive even or odd numbers: x, x + 2, x + 4.', 'For ages and heights, write everyone in terms of one letter.', 'Check units: change metres to centimetres if needed.'],
    },
    gen: ex704,
    levels: { 1: 'Number puzzles', 2: 'Rectangles, consecutive numbers, ages, change', 3: 'Coins, heights and longer problems' },
  },
  {
    id: 'y9-eq-quad',
    title: 'Simple quadratic equations ax² = c (Path)',
    ref: 'NCM 9 Ex 7.05',
    tag: 'extension',
    outcomes: EQU_P,
    summary: 'Solve x² = c and ax² = c: two answers, one positive and one negative.',
    learn: {
      intro: `<p>${v('x')}<sup>2</sup> = 25 has two solutions: ${v('x')} = 5 and ${v('x')} = −5, written ${v('x')} = ±5. For 5${v('a')}<sup>2</sup> = 245, divide by 5 first: ${v('a')}<sup>2</sup> = 49, so ${v('a')} = ±7.</p><p>${v('x')}<sup>2</sup> can never be negative, so ${v('x')}<sup>2</sup> = −9 has no solution.</p>`,
      keyPoints: ['Quadratic equations are in the Stage 5 Path outcomes (MA5-EQU-P-01), so this is extension work here. NCM 9 treats it as part of Chapter 7.', 'Type both answers, e.g. 7, −7 or ±7.'],
    },
    gen: quadratic,
    levels: { 1: 'Perfect squares', 2: 'Rounded answers', 3: 'With a constant or fraction; no solutions' },
  },
  {
    id: 'y9-eq-formula',
    title: 'Equations and formulas',
    ref: ref('7.06'),
    outcomes: EQU,
    summary: 'Substitute into a formula, and solve for a letter that isn’t the subject.',
    learn: {
      intro: `<p>To use a formula, substitute the values you know. If the unknown isn’t the subject, you get an equation to solve: with ${v('P')} = 2(${v('l')} + ${v('w')}), ${v('l')} = 12 and ${v('P')} = 70, you get 70 = 2(12 + ${v('w')}), so ${v('w')} = 23.</p>`,
      keyPoints: ['Make the units match before you substitute (1.8 m = 180 cm).', 'For “greatest whole number of hours”, solve, then round down.'],
      vocab: [['formula', 'a rule written as an equation, e.g. A = πr²'], ['subject', 'the letter on its own on one side, e.g. A in A = πr²']],
    },
    gen: ex706,
    levels: { 1: 'Find the subject', 2: 'Find another letter (solve an equation)', 3: 'Problems with formulas' },
  },
  {
    id: 'y9-eq-powerplus',
    title: 'Power plus: equations',
    ref: 'NCM 9 Power plus 7',
    tag: 'extension',
    outcomes: EQU,
    summary: 'Equations with two fractions, and age problems over time.',
    learn: {
      intro: '<p>To clear two fractions, multiply every term by the lowest common denominator. For age problems in the future, add the same number of years to everyone.</p>',
      keyPoints: ['Equations with two algebraic fractions go beyond the core course.', 'Check the answer in the words of the problem.'],
    },
    gen: exPP,
    levels: { 1: 'Ages in the future; two fractions', 2: 'Ages in the future; two fractions', 3: 'Two fractions' },
  },
]
