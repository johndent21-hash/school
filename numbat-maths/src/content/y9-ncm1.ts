// Year 9 Algebra, following New Century Maths 9 (3rd edition, Cengage) Chapter 1 exercise by exercise.
// The questions are the site's own: they practise the same kinds of question as each exercise, in the
// same easy-to-hard order (Foundation = the start of the exercise, Challenge = the end), but none of the
// textbook's wording or numbers are copied.
// Syllabus: MA5-ALG-C-01 throughout. The textbook presents all of Chapter 1 as core; see the report for
// the parts the syllabus may place in Algebraic techniques B (Path): pronumerals in denominators.
import type { Level, Question, Skill, TestItem } from '@/lib/maths/types'
import * as G from '@/lib/maths/diagrams5'
import {
  D, MINUS, TIMES, DIVIDE, bnum, chance, coef, ex, exprA, frac, gcd, int, mcA, mcFixedA, money, nonZero, num, numA, pick, q, round, sample,
  shuffle, sqrt, terms, v, name,
} from './helpers'

const OUTCOMES = ['MA5-ALG-C-01']
const big = (s: string) => `<div class="big">${s}</div>`
// pronumerals that can't be mistaken for anything else when typed (no i, l, o, e)
const VARS = ['a', 'b', 'c', 'd', 'f', 'g', 'h', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'u', 'w', 'x', 'y', 'z']
const vars = (k: number) => sample(VARS, k).sort()
const letter = () => pick(VARS)
/** "+ 3" / "− 3" between terms */
const sgn = (x: number) => (x < 0 ? `${MINUS} ${num(-x)}` : `+ ${num(x)}`)

// ================================================================== Monomials and algebraic fractions
// A term such as 24ak²/(8a²) is a coefficient fraction n/d with pronumeral powers (negative = underneath).

type Pw = Record<string, number>
type Term = { n: number; d: number; p: Pw }
const term = (n: number, p: Pw = {}, d = 1): Term => ({ n, d, p })
function tidy(t: Term): Term {
  let { n, d } = t
  if (d < 0) [n, d] = [-n, -d]
  const g = gcd(Math.abs(n), d) || 1
  const p: Pw = {}
  for (const [k, e] of Object.entries(t.p)) if (e !== 0) p[k] = e
  return { n: n / g, d: d / g, p }
}
const mulT = (a: Term, b: Term): Term => {
  const p: Pw = { ...a.p }
  for (const [k, e] of Object.entries(b.p)) p[k] = (p[k] ?? 0) + e
  return tidy({ n: a.n * b.n, d: a.d * b.d, p })
}
const invT = (a: Term): Term => tidy({ n: a.d * Math.sign(a.n), d: Math.abs(a.n), p: Object.fromEntries(Object.entries(a.p).map(([k, e]) => [k, -e])) })
const divT = (a: Term, b: Term) => mulT(a, invT(b))
/** pronumeral part as plain text: "a k^2" -> "ak^2" (sorted) */
function powText(p: Pw, sign: 1 | -1): string {
  return Object.keys(p)
    .filter((k) => Math.sign(p[k]) === sign)
    .sort()
    .map((k) => (Math.abs(p[k]) === 1 ? k : `${k}^${Math.abs(p[k])}`))
    .join('')
}
/** plain text that ex() can show and the checker can read, in lowest terms: "3k^2/(a)" style */
function termExpr(t: Term): string {
  t = tidy(t)
  const top = powText(t.p, 1)
  const bottom = powText(t.p, -1)
  const nAbs = Math.abs(t.n)
  const numer = `${t.n < 0 ? '-' : ''}${nAbs === 1 && top ? '' : nAbs}${top}`
  const denom = `${t.d === 1 && bottom ? '' : t.d}${bottom}`
  if (denom === '1') return numer
  return /^\d+$/.test(denom) ? `${numer}/${denom}` : `${numer}/(${denom})`
}
/** HTML for a term in lowest terms */
function termHtml(t: Term): string {
  t = tidy(t)
  const top = powText(t.p, 1)
  const bottom = powText(t.p, -1)
  const nAbs = Math.abs(t.n)
  const numer = ex(`${nAbs === 1 && top ? '' : nAbs}${top}`)
  const denom = ex(`${t.d === 1 && bottom ? '' : t.d}${bottom}`)
  return (t.n < 0 ? MINUS : '') + (t.d === 1 && !bottom ? numer : frac(numer, denom))
}
/** HTML for a fraction written as typed by the textbook (not simplified): numerator / denominator */
function writtenHtml(nc: number, np: Pw, dc = 1, dp: Pw = {}): string {
  const top = ex(`${Math.abs(nc) === 1 && powText(np, 1) ? '' : Math.abs(nc)}${powText(np, 1)}`)
  const hasBottom = dc !== 1 || powText(dp, 1) !== ''
  const bottom = ex(`${dc === 1 && powText(dp, 1) ? '' : dc}${powText(dp, 1)}`)
  return (nc < 0 ? MINUS : '') + (hasBottom ? frac(top, bottom) : top)
}
const written = (nc: number, np: Pw, dc = 1, dp: Pw = {}): Term => {
  const p: Pw = { ...np }
  for (const [k, e] of Object.entries(dp)) p[k] = (p[k] ?? 0) - e
  return tidy({ n: nc, d: dc, p })
}

// ================================================================== 1.01 From words to algebraic expressions

type Phrase = [string, string] // [words, expression]
function oneVariablePhrases(x: string, k: number): Phrase[] {
  return [
    [`the sum of ${v(x)} and ${k}`, `${x} + ${k}`],
    [`${v(x)} divided by ${k}`, `${x}/${k}`],
    [`${k} less than ${v(x)}`, `${x} - ${k}`],
    [`the product of ${v(x)} and ${k}`, `${k}${x}`],
    [`increase ${k} by ${v(x)}`, `${k} + ${x}`],
    [`multiply ${v(x)} by ${k}`, `${k}${x}`],
    [`the difference between ${v(x)} and ${k}`, `${x} - ${k}`],
    [`divide ${k} by ${v(x)}`, `${k}/${x}`],
    [`decrease ${v(x)} by ${k}`, `${x} - ${k}`],
    [`${k} decreased by ${v(x)}`, `${k} - ${x}`],
    [`${k} more than ${v(x)}`, `${x} + ${k}`],
    [`${v(x)} multiplied by itself`, `${x}^2`],
    [`subtract ${k} from ${v(x)}`, `${x} - ${k}`],
    [`take ${v(x)} away from ${k}`, `${k} - ${x}`],
    [`${k} lots of ${v(x)}`, `${k}${x}`],
    [`double ${v(x)}`, `2${x}`],
  ]
}

function wordsOne(): Question {
  const x = letter()
  const k = int(2, 30)
  const [words, expr] = pick(oneVariablePhrases(x, k))
  if (chance(0.3)) {
    // choose the matching expression
    const wrongs = [`${k} - ${x}`, `${x} - ${k}`, `${k}${x}`, `${x}/${k}`, `${k}/${x}`, `${x} + ${k}`, `${x}^2`].filter((w) => !equalPlain(w, expr))
    return q({
      prompt: `Which expression means “${words}”?`,
      answer: mcA(ex(expr), sample(wrongs, 3).map(ex)),
      hint: 'Sum: add. Difference: subtract. Product: multiply. Quotient: divide. Watch the order for “less than” and “decreased by”.',
      steps: [`“${words}” is ${ex(expr)}.`],
      meta: { t: 'words', words: stripI(words), x, expr },
    })
  }
  return q({
    prompt: `Write an algebraic expression for:${big(words)}`,
    answer: exprA(expr),
    hint: 'Sum: add. Difference: subtract. Product: multiply. Quotient: divide. “5 less than x” is x − 5.',
    steps: [`“${words}” is ${ex(expr)}.`],
    meta: { t: 'words', words: stripI(words), x, expr },
  })
}
const stripI = (s: string) => s.replace(/<\/?i>/g, '')
/** two simple plain expressions are the same (for keeping wrong options different) */
function equalPlain(a: string, b: string): boolean {
  return a.replace(/\s/g, '') === b.replace(/\s/g, '') || (/^\w\s*\+\s*\d+$/.test(a) && /^\d+\s*\+\s*\w$/.test(b) && a.replace(/\s/g, '').split('+').reverse().join('+') === b.replace(/\s/g, ''))
}

function wordsTwo(): Question {
  const [a, b] = vars(2)
  const k = int(2, 9)
  const m = int(2, 9)
  const items: Phrase[] = [
    [`the product of ${v(a)} and ${v(b)}`, `${a}${b}`],
    [`the difference between ${k}${v(a)} and ${m}${v(b)}`, `${k}${a} - ${m}${b}`],
    [`decrease ${k}${v(a)} by ${m}${v(b)}`, `${k}${a} - ${m}${b}`],
    [`the square of ${v(a)}`, `${a}^2`],
    [`how many times ${v(a)} goes into ${v(b)}`, `${b}/${a}`],
    [`subtract ${k}${v(a)} from ${m}${v(b)}`, `${m}${b} - ${k}${a}`],
    [`${k} less than double ${v(a)}`, `2${a} - ${k}`],
    [`${k} more than half of ${v(a)}`, `${a}/2 + ${k}`],
    [`one-third of the product of ${v(a)} and ${v(b)}`, `${a}${b}/3`],
    [`three times ${v(a)}, less ${k}`, `3${a} - ${k}`],
    [`${k} less than twice ${v(a)}`, `2${a} - ${k}`],
    [`${k} more than negative ${v(a)}`, `${k} - ${a}`],
    [`${v(a)} divided by ${k}${v(b)}`, `${a}/(${k}${b})`],
  ]
  const [words, expr] = pick(items)
  return q({
    prompt: `Write an algebraic expression for:${big(words)}`,
    answer: exprA(expr),
    hint: 'Write the operations in the order the words describe. “Less than” and “subtract … from” reverse the order.',
    steps: [`“${words}” is ${ex(expr.replace(/\((\d+)(\w)\)/, '$1$2'))}.`],
    meta: { t: 'words', words: stripI(words), x: a, y: b, expr },
  })
}

function thinkOfANumber(): Question {
  const n = letter()
  const a = int(2, 9)
  const b = int(2, 12)
  const kinds: [string, string, string][] = [
    [`multiply it by ${a} and then add ${b}`, `${a}${n} + ${b}`, `${n} × ${a} + ${b} = ${a}${n} + ${b}`],
    [`add ${b} and then multiply by ${a}`, `${a}(${n} + ${b})`, `(${n} + ${b}) × ${a} = ${a}(${n} + ${b})`],
    [`multiply it by ${a} and then subtract ${b}`, `${a}${n} - ${b}`, `${n} × ${a} - ${b} = ${a}${n} - ${b}`],
    [`subtract ${b} and then multiply by ${a}`, `${a}(${n} - ${b})`, `(${n} - ${b}) × ${a} = ${a}(${n} - ${b})`],
    [`divide it by ${a} and then add ${b}`, `${n}/${a} + ${b}`, `${n} ÷ ${a} + ${b} = frac{${n}}{${a}} + ${b}`],
    [`add ${b} and then divide by ${a}`, `(${n} + ${b})/${a}`, `(${n} + ${b}) ÷ ${a} = frac{${n} + ${b}}{${a}}`],
    [`divide it by ${a} and then subtract ${b}`, `${n}/${a} - ${b}`, `${n} ÷ ${a} - ${b} = frac{${n}}{${a}} - ${b}`],
    [`subtract ${b} and then divide by ${a}`, `(${n} - ${b})/${a}`, `(${n} - ${b}) ÷ ${a} = frac{${n} - ${b}}{${a}}`],
  ]
  const [words, expr, how] = pick(kinds)
  return q({
    prompt: `Think of a number (${v(n)}), ${words}. Write an algebraic expression for the result.`,
    answer: exprA(expr),
    hint: 'If you add or subtract first, put brackets around that part before multiplying or dividing.',
    steps: [ex(how)],
    meta: { t: 'think', n, a, b, words },
  })
}

function exprToWords(): Question {
  const b = letter()
  const k = int(2, 9)
  const items: [string, string, string[]][] = [
    [`${k} - ${b}`, `subtract ${b} from ${k}`, [`subtract ${k} from ${b}`, `${k} times ${b}`, `divide ${k} by ${b}`]],
    [`${b}/${k}`, `divide ${b} by ${k}`, [`divide ${k} by ${b}`, `multiply ${b} by ${k}`, `subtract ${k} from ${b}`]],
    [`2${b} + ${k}`, `double ${b}, then add ${k}`, [`add ${k} to ${b}, then double`, `${b} squared plus ${k}`, `${k} more than half of ${b}`]],
    [`${k} - 3${b}`, `subtract 3 lots of ${b} from ${k}`, [`subtract ${k} from 3 lots of ${b}`, `3 lots of ${b} minus ${k}`, `${k} minus ${b}, then times 3`]],
    [`2${b}^2`, `double the square of ${b}`, [`the square of double ${b}`, `${b} plus ${b} squared`, `${b} times 2, squared`]],
    [`${k} + ${b}/4`, `${k} more than a quarter of ${b}`, [`a quarter of ${k} more than ${b}`, `${k} plus ${b}, divided by 4`, `4 more than ${k} lots of ${b}`]],
  ]
  const [expr, right, wrong] = pick(items)
  return q({
    prompt: `Which words describe the expression ${ex(expr.replace(/(\w)\/(\d)/, 'frac{$1}{$2}'))}?`,
    answer: mcA(right, wrong),
    hint: 'Read the expression carefully: which number or pronumeral comes first, and what is done to it?',
    steps: [`${ex(expr.replace(/(\w)\/(\d)/, 'frac{$1}{$2}'))} means: ${right}.`],
    meta: { t: 'toWords', expr, right },
  })
}

function wordsContext(): Question {
  const who = name()
  const kind = pick(['age', 'taxi', 'call', 'books', 'gst', 'km', 'average', 'cents', 'discount', 'change', 'share', 'triangle', 'isosceles', 'cooking', 'consecutive', 'even'] as const)
  if (kind === 'age') {
    const age = int(12, 17)
    const later = chance()
    const y = later ? pick(['y', 'n', 'k']) : pick(['k', 'm', 'p'])
    return q({
      prompt: `${who} is ${age} years old. Write an algebraic expression for ${who}’s age ${later ? `in ${v(y)} years’ time` : `${v(y)} years ago`}.`,
      answer: exprA(later ? `${age} + ${y}` : `${age} - ${y}`),
      hint: later ? 'In the future, add.' : 'In the past, subtract.',
      steps: [later ? `${age} + ${v(y)}` : `${age} ${MINUS} ${v(y)}`],
      meta: { t: 'ctx', kind, age, later, y },
    })
  }
  if (kind === 'taxi') {
    const flag = pick([3.6, 3.8, 4.2, 2.9])
    const rate = pick([2.1, 2.3, 2.45, 1.95])
    const d = pick(['D', 'k', 'd'])
    return q({
      prompt: `A taxi trip costs ${money(flag)} plus ${money(rate)} per kilometre. Write an expression for the cost, in dollars, of a trip of ${v(d)} km.`,
      answer: exprA(`${flag} + ${rate}${d}`),
      hint: 'The fixed cost is paid once; the rate is paid for every kilometre.',
      steps: [`Cost = ${num(flag)} + ${num(rate)} ${TIMES} ${v(d)} = ${num(flag)} + ${num(rate)}${v(d)} dollars`],
      meta: { t: 'ctx', kind, flag, rate, d },
    })
  }
  if (kind === 'call') {
    const fee = pick([0.4, 0.45, 0.5, 0.35])
    const per = pick([0.6, 0.75, 0.8, 0.9])
    const k = pick(['k', 'm', 't'])
    const right = `$(${num(fee)} + ${num(per)}${v(k)})`
    return q({
      prompt: `An overseas phone call costs a connection fee of ${money(fee)} plus ${money(per)} per minute. Which expression gives the cost of a call lasting ${v(k)} minutes?`,
      answer: mcA(right, [`$(${num(fee)} + ${num(per * 100)}${v(k)})`, `$(${num(fee * 100)} + ${num(per)}${v(k)})`, `$(${num(per)} + ${num(fee)}${v(k)})`]),
      hint: 'The connection fee is paid once; the rate per minute is multiplied by the number of minutes.',
      steps: [`Cost = ${num(fee)} + ${num(per)} ${TIMES} ${v(k)} dollars`],
      meta: { t: 'ctx', kind, fee, per },
    })
  }
  const items: Record<string, () => [string, string, string]> = {
    books: () => {
      const [p, Q] = [pick(['p', 'n', 'b']), pick(['Q', 'C', 'P'])]
      return [`the cost, in dollars, of ${v(p)} books at $${v(Q)} each`, `${p}${Q}`, 'Number of books × price of each.']
    },
    gst: () => {
      const price = pick([40, 60, 85, 120])
      const t = pick(['t', 'g'])
      return [`the selling price, in dollars, when GST of $${v(t)} is added to a marked price of $${price}`, `${price} + ${t}`, 'Adding GST makes the price bigger.']
    },
    km: () => {
      const h = pick(['h', 'k', 'd'])
      return [`the number of metres in ${v(h)} km`, `1000${h}`, 'There are 1000 metres in a kilometre.']
    },
    average: () => {
      const vs = vars(pick([3, 4]))
      return [`the average of ${vs.map(v).join(', ').replace(/, ([^,]*)$/, ' and $1')}`, `(${vs.join(' + ')})/${vs.length}`, `Add them, then divide by how many there are (${vs.length}).`]
    },
    cents: () => {
      const y = pick(['y', 'c', 'n'])
      return [`the number of dollars in ${v(y)} cents`, `${y}/100`, 'There are 100 cents in a dollar.']
    },
    discount: () => {
      const full = pick([650, 950, 1200, 1499])
      const x = pick(['x', 's'])
      return [`the discount, in dollars, when a $${num(full)} TV sells for $${v(x)}`, `${full} - ${x}`, 'Discount = full price − selling price.']
    },
    change: () => {
      const each = pick([8, 12, 15, 25])
      const w = pick(['w', 'n', 't'])
      return [`the change, in dollars, from $100 after buying ${v(w)} tickets at $${each} each`, `100 - ${each}${w}`, `Tickets cost ${each}${v(w)} dollars; subtract from 100.`]
    },
    share: () => {
      const total = pick([300, 450, 600, 840])
      const n = pick(['n', 'p'])
      return [`the amount of each share when $${total} is shared equally among ${v(n)} people`, `${total}/${n}`, `Divide $${total} by the number of people.`]
    },
    triangle: () => {
      const [a, b] = pick([['a', 'b'], ['x', 'y'], ['p', 'q']])
      return [`the size of the third angle of a triangle whose other two angles are ${v(a)}° and ${v(b)}°`, `180 - ${a} - ${b}`, 'The angles of a triangle add to 180°.']
    },
    isosceles: () => {
      const x = pick(['x', 'a', 'y'])
      return [`the size of each equal angle of an isosceles triangle whose unequal angle is ${v(x)}°`, `(180 - ${x})/2`, 'The two equal angles share what is left of 180°.']
    },
    cooking: () => {
      const t = pick(['t', 'm'])
      const kg = int(2, 4)
      const extra = pick([10, 15, 20])
      return [`the cooking time, in minutes, for a ${kg} kg roast that needs ${v(t)} minutes per kilogram plus ${extra} minutes extra`, `${kg}${t} + ${extra}`, `${kg} kilograms at ${v(t)} minutes each, plus ${extra}.`]
    },
    consecutive: () => {
      const n = pick(['n', 'x', 'k'])
      const s = int(1, 6)
      return [`the next consecutive number after ${v(n)} + ${s}`, `${n} + ${s + 1}`, 'Consecutive numbers go up by 1.']
    },
    even: () => {
      const d = pick(['d', 'n', 'm'])
      const odd = chance()
      return [`the next ${odd ? 'odd' : 'even'} number after the even number ${v(d)}`, odd ? `${d} + 1` : `${d} + 2`, odd ? 'The number after an even number is odd.' : 'Even numbers go up in twos.']
    },
  }
  const [words, expr, how] = items[kind]()
  return q({
    prompt: `Write an algebraic expression for ${words}.`,
    answer: exprA(expr),
    hint: how,
    steps: [how, `${ex(expr.replace(/^\((.*)\)\/(\d+)$/, 'frac{$1}{$2}').replace(/^(\d+)\/(\w)$/, 'frac{$1}{$2}').replace(/^(\w)\/(\d+)$/, 'frac{$1}{$2}'))}`],
    meta: { t: 'ctx', kind, expr },
  })
}

export const ex101 = (level: Level): Question => {
  if (level === 1) return wordsOne()
  if (level === 2) return pick([wordsTwo, thinkOfANumber, thinkOfANumber, exprToWords])()
  return wordsContext()
}

// ================================================================== 1.02 Substitution

/** evaluate a plain expression with the given values, for the worked steps (numbers only) */
function subExpr(expr: string, vals: Record<string, number>): string {
  // put each value in place, in brackets if negative
  return expr.replace(/[a-z]/g, (m) => (m in vals ? bnum(vals[m]) : m))
}

function subOne(): Question {
  const x = letter()
  const forms: [string, (a: number) => number, () => number][] = [
    [`7${x} + 3`, (a) => 7 * a + 3, () => nonZero(-20, 15)],
    [`${x}^2`, (a) => a * a, () => nonZero(-15, 15)],
    [`8 - 3${x}`, (a) => 8 - 3 * a, () => pick([12, 8, 2.5, -10, 5, -4, 1.5])],
    [`frac{${x}}{2} + 7`, (a) => a / 2 + 7, () => pick([2, 7, -14, -30, 9, 16, -5])],
    [`5${x} - 4`, (a) => 5 * a - 4, () => nonZero(-12, 12)],
    [`10 - ${x}^2`, (a) => 10 - a * a, () => nonZero(-6, 6)],
  ]
  const [expr, f, gen] = pick(forms)
  const val = gen()
  const plain = expr.replace(/frac\{(\w)\}\{(\d+)\}/, '$1/$2')
  return q({
    prompt: `Find the value of ${ex(expr)} when ${v(x)} = ${num(val)}.`,
    answer: numA(round(f(val), 6)),
    hint: `Replace ${v(x)} with ${bnum(val)}. Do powers and multiplication before adding or subtracting.`,
    steps: [`${ex(expr)} = ${ex(subExpr(plain.replace(new RegExp(`(\\d)${x}`, 'g'), `$1*${x}`), { [x]: val }).replace(/\//g, ' ÷ '))}`, `= ${num(round(f(val), 6))}`],
    meta: { t: 'sub', expr: plain, vals: { [x]: val } },
  })
}

function subTwo(): Question {
  // the textbook's style: m = 2, n = −3, p = 5 and many expressions
  const [a, b, c] = vars(3)
  const vals = { [a]: int(2, 6), [b]: -int(1, 5), [c]: int(2, 7) }
  const A = vals[a]
  const B = vals[b]
  const C = vals[c]
  const forms: [string, string, number | null][] = [
    [`${a} + ${b} + ${c}`, `${a} + ${b} + ${c}`, A + B + C],
    [`${a} - ${b}`, `${a} - ${b}`, A - B],
    [`${b}${c}`, `${b}*${c}`, B * C],
    [`${a}^2 - ${b}^2`, `${a}^2 - ${b}^2`, A * A - B * B],
    [`${b}${c} - ${a}`, `${b}*${c} - ${a}`, B * C - A],
    [`${a}${b} + ${c}`, `${a}*${b} + ${c}`, A * B + C],
    [`5${b} + 3${c}`, `5*${b} + 3*${c}`, 5 * B + 3 * C],
    [`5${a}^2`, `5*${a}^2`, 5 * A * A],
    [`${a}^2 + ${c} - 4${b}`, `${a}^2 + ${c} - 4*${b}`, A * A + C - 4 * B],
    [`frac{${c} + ${b}}{${a}}`, `(${c} + ${b})/${a}`, (C + B) / A],
    [`frac{${c}}{${b} - ${a}}`, `${c}/(${b} - ${a})`, C / (B - A)],
    [`3${a} + 2${b}`, `3*${a} + 2*${b}`, 3 * A + 2 * B],
  ]
  const [shown, plain, val] = pick(forms)
  const value = round(val!, 6)
  const exact = Number.isInteger(value) || Number.isInteger(value * 4)
  if (!exact) return subTwo()
  return q({
    prompt: `Evaluate ${ex(shown)} when ${v(a)} = ${num(A)}, ${v(b)} = ${num(B)} and ${v(c)} = ${num(C)}.`,
    answer: numA(value),
    hint: 'Put each value in brackets when it is negative, then follow the order of operations.',
    steps: [`= ${ex(subExpr(plain, vals).replace(/\//g, ' ÷ '))}`, `= ${num(value)}`],
    meta: { t: 'sub', expr: plain, vals },
  })
}

function subFormula(): Question {
  const kind = pick(['perimeter', 'area', 'pyramid', 'triangle', 'trapezium', 'mean', 'm', 'quad'] as const)
  if (kind === 'perimeter') {
    const l = pick([4.7, 6.5, 3.8, 12.4, 9.25])
    const w = pick([2.5, 1.6, 3.2, 4.75])
    return q({
      prompt: `The perimeter of a rectangle is ${v('P')} = 2${v('l')} + 2${v('w')}. Find the perimeter of a rectangle with length ${num(l)} cm and width ${num(w)} cm.`,
      answer: numA(round(2 * l + 2 * w, 6)),
      suffix: 'cm',
      calc: true,
      hint: `Substitute ${v('l')} = ${num(l)} and ${v('w')} = ${num(w)}.`,
      steps: [`${v('P')} = 2 ${TIMES} ${num(l)} + 2 ${TIMES} ${num(w)} = ${num(round(2 * l + 2 * w, 6))} cm`],
      meta: { t: 'sub', expr: '2*l + 2*w', vals: { l, w } },
    })
  }
  if (kind === 'area') {
    const l = pick([12.5, 8.4, 15.2, 6.25])
    const w = pick([8, 4, 6, 12])
    return q({
      prompt: `The area of a rectangle is ${v('A')} = ${v('lw')}. Find the area of a rectangle with length ${num(l)} m and width ${num(w)} m.`,
      answer: numA(round(l * w, 6)),
      suffix: 'm²',
      calc: true,
      hint: `Multiply the length by the width.`,
      steps: [`${v('A')} = ${num(l)} ${TIMES} ${num(w)} = ${num(round(l * w, 6))} m²`],
      meta: { t: 'sub', expr: 'l*w', vals: { l, w } },
    })
  }
  if (kind === 'pyramid') {
    const A = pick([24, 28, 36, 45, 60, 40])
    const h = pick(A % 3 === 0 ? [8, 10, 14, 20, 25] : [9, 12, 15, 21, 30])
    return q({
      prompt: `The volume of a pyramid with base area ${v('A')} and height ${v('h')} is ${v('V')} = ${frac(1, 3)}${v('Ah')}. Find the volume of a pyramid with base area ${A} cm² and height ${h} cm.`,
      answer: numA(round((A * h) / 3, 6)),
      suffix: 'cm³',
      hint: `Multiply ${A} by ${h}, then divide by 3.`,
      steps: [`${v('V')} = ${frac(1, 3)} ${TIMES} ${A} ${TIMES} ${h} = ${num(round((A * h) / 3, 6))} cm³`],
      meta: { t: 'sub', expr: 'A*h/3', vals: { A, h } },
    })
  }
  if (kind === 'triangle') {
    const b = pick([15, 9, 14, 7.5])
    const h = pick([12, 8, 10, 6])
    return q({
      prompt: `The area of a triangle is ${v('A')} = ${frac(1, 2)}${v('bh')}. Find the area of a triangle with base ${num(b)} cm and perpendicular height ${h} cm.`,
      answer: numA(round((b * h) / 2, 6)),
      suffix: 'cm²',
      hint: 'Multiply the base by the height, then halve.',
      steps: [`${v('A')} = ${frac(1, 2)} ${TIMES} ${num(b)} ${TIMES} ${h} = ${num(round((b * h) / 2, 6))} cm²`],
      meta: { t: 'sub', expr: 'b*h/2', vals: { b, h } },
    })
  }
  if (kind === 'trapezium') {
    const h = pick([4.5, 3, 5, 6.5])
    const a = pick([6, 5, 8, 10])
    const b = pick([8, 9, 12, 14])
    const val = (h * (a + b)) / 2
    return q({
      prompt: `Given ${v('A')} = ${frac(`${v('h')}(${v('a')} + ${v('b')})`, 2)}, evaluate ${v('A')} when ${v('h')} = ${num(h)}, ${v('a')} = ${a} and ${v('b')} = ${b}.`,
      answer: mcA(num(val), [num(h * (a + b)), num((h * a + b) / 2), num(h * a + b / 2)].filter((w) => w !== num(val))),
      calc: true,
      hint: 'Work out the bracket first, multiply by h, then halve.',
      steps: [`${v('A')} = ${num(h)} ${TIMES} (${a} + ${b}) ${DIVIDE} 2 = ${num(h)} ${TIMES} ${a + b} ${DIVIDE} 2 = ${num(val)}`],
      meta: { t: 'sub', expr: 'h*(a + b)/2', vals: { h, a, b } },
    })
  }
  if (kind === 'mean') {
    const xs = [pick([3.7, 2.4, 5.1]), pick([8.1, 6.6, 7.2]), pick([0.5, 1.2, 0.9])]
    const val = round((xs[0] + xs[1] + xs[2]) / 3, 6)
    return q({
      prompt: `If ${v('M')} = ${frac(`${v('x')} + ${v('y')} + ${v('z')}`, 3)}, find ${v('M')} when ${v('x')} = ${num(xs[0])}, ${v('y')} = ${num(xs[1])} and ${v('z')} = ${num(xs[2])}.${Number.isInteger(round(val * 100, 6)) ? '' : ' Give your answer correct to two decimal places.'}`,
      answer: Number.isInteger(round(val * 100, 6)) ? numA(val) : numA(val, 2),
      calc: true,
      hint: 'Add the three values, then divide by 3.',
      steps: [`${v('M')} = (${xs.map((x) => num(x)).join(' + ')}) ${DIVIDE} 3 = ${num(round(xs[0] + xs[1] + xs[2], 6))} ${DIVIDE} 3 ${Number.isInteger(round(val * 100, 6)) ? '=' : '≈'} ${num(round(val, 2))}`],
      meta: { t: 'sub', expr: '(x + y + z)/3', vals: { x: xs[0], y: xs[1], z: xs[2] }, dp: Number.isInteger(round(val * 100, 6)) ? null : 2 },
    })
  }
  if (kind === 'm') {
    const c = pick([3, 5, 7])
    const d = pick([8, 4, 6])
    const k = d * pick([3, 5, 6, 7, 10])
    return q({
      prompt: `Given ${v('m')} = ${frac(`${c}${v('k')}`, d)}, find ${v('m')} when ${v('k')} = ${k}.`,
      answer: numA(round((c * k) / d, 6)),
      hint: `Multiply ${c} by ${k}, then divide by ${d}.`,
      steps: [`${v('m')} = ${c} ${TIMES} ${k} ${DIVIDE} ${d} = ${num(round((c * k) / d, 6))}`],
      meta: { t: 'sub', expr: `${c}*k/${d}`, vals: { k } },
    })
  }
  const a = pick([-2, -3])
  const b = pick([-5, -4, 3])
  const c = pick([8, 6, -1])
  const d = pick([-4, -3, -2, 3])
  const val = a * d * d + b * d + c
  const wrongs = [-a * d * d + b * d + c, a * d * d - b * d + c, (a * d) ** 2 + b * d + c].filter((w) => w !== val)
  return q({
    prompt: `Given ${v('P')} = ${ex(terms([[a, 'd^2'], [b, 'd'], [c, '']]))}, find ${v('P')} when ${v('d')} = ${num(d)}.`,
    answer: mcA(num(val), Array.from(new Set(wrongs)).map((w) => num(w))),
    hint: `Square ${bnum(d)} first: ${bnum(d)}² = ${d * d}. Then multiply.`,
    steps: [`${v('P')} = ${num(a)} ${TIMES} ${bnum(d)}<sup>2</sup> ${b < 0 ? MINUS : '+'} ${Math.abs(b)} ${TIMES} ${bnum(d)} ${sgn(c)}`, `= ${num(a * d * d)} ${sgn(b * d)} ${sgn(c)} = ${num(val)}`],
    meta: { t: 'sub', expr: `${a}*d^2 + ${b}*d + ${c}`, vals: { d } },
  })
}

export const ex102 = (level: Level): Question => (level === 1 ? subOne() : level === 2 ? subTwo() : subFormula())

// ================================================================== 1.03 Adding and subtracting terms

type Lt = [number, string] // coefficient and pronumerals as written, e.g. [4, 'yx'], [7, 'r^2'], [5, '']
/** the like-term key: pronumerals sorted, with powers */
function likeKey(w: string): string {
  const p: Pw = {}
  for (const m of w.matchAll(/([a-z])(?:\^(\d+))?/g)) p[m[1]] = (p[m[1]] ?? 0) + Number(m[2] ?? 1)
  return powText(p, 1)
}
/** collect like terms, keeping the order in which each kind first appears */
function collect(list: Lt[]): Lt[] {
  const out = new Map<string, number>()
  for (const [c, w] of list) out.set(likeKey(w), (out.get(likeKey(w)) ?? 0) + c)
  // usual order: highest power first (x² before x before numbers), then alphabetical
  const degree = (k: string) => [...k.matchAll(/([a-z])(?:\^(\d+))?/g)].reduce((t, m) => t + Number(m[2] ?? 1), 0)
  return [...out]
    .filter(([, c]) => c !== 0)
    .map(([k, c]) => [c, k] as Lt)
    .sort((a, b) => degree(b[1]) - degree(a[1]) || (a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0))
}
const sumExpr = (list: Lt[]) => terms(list.length ? list : [[0, '']])
const sumHtml = (list: Lt[]) => ex(sumExpr(list))
/** a written-differently version of a pronumeral product: "xy" -> "yx" */
const swapped = (w: string) => (/^[a-z]{2}$/.test(w) ? w[1] + w[0] : w)

function likeTermsTwo(): Question {
  const pool = ['a', 'b', 'm', 'q', 'r^2', 'gh', 'xy', 'def', 'n^2', 'pq', 'u', 'k', 'my^2', 't']
  const w = pick(pool)
  const a = int(2, 15)
  const b = nonZero(-14, 14)
  const unlike = chance(0.15)
  const w2 = unlike ? pick(pool.filter((x) => likeKey(x) !== likeKey(w))) : chance(0.4) ? swapped(w) : w
  const list: Lt[] = [[a, w], [b, w2]]
  const res = collect(list)
  return q({
    prompt: `Simplify:${big(sumHtml(list))}`,
    answer: exprA(sumExpr(res), 'simplified'),
    hint: 'Only like terms (exactly the same pronumerals and powers, in any order) can be added or subtracted.',
    steps: unlike ? [`${ex(coefWord(w))} and ${ex(coefWord(w2))} are unlike terms, so the expression can’t be simplified: ${sumHtml(res)}.`] : [`Like terms: ${a} ${b < 0 ? MINUS : '+'} ${Math.abs(b)} = ${num(a + b)}`, `= ${sumHtml(res)}`],
    meta: { t: 'collect', list },
  })
}
const coefWord = (w: string) => (w === '' ? '1' : w)

function likeTermsMany(): Question {
  const [x, y] = vars(2)
  const kinds = shuffle([x, y, `${x}^2`, `${x}${y}`, ''])
  const k1 = kinds[0]
  const k2 = kinds[1] === '' && k1 === '' ? kinds[2] : kinds[1]
  const n = pick([3, 4, 4, 5])
  const list: Lt[] = []
  for (let i = 0; i < n; i++) list.push([nonZero(-9, 12) * (i === 0 ? 1 : 1), i % 2 === 0 ? k1 : k2])
  list[0][0] = Math.abs(list[0][0])
  const res = collect(list)
  if (res.length === 0) return likeTermsMany()
  if (chance(0.25)) {
    // choose the simplified expression
    const wrong = [collect(list.map(([c, w], i) => [i === 1 ? -c : c, w] as Lt)), collect(list.map(([c, w]) => [Math.abs(c), w] as Lt)), [[res.reduce((t, [c]) => t + c, 0), k1 || k2]] as Lt[]].map(sumExpr)
    return q({
      prompt: `Simplify ${sumHtml(list)}.`,
      answer: mcA(ex(sumExpr(res)), Array.from(new Set(wrong.filter((w) => w !== sumExpr(res)))).map(ex)),
      hint: 'Group the like terms first. Each + or − sign belongs to the term that follows it.',
      steps: [`= ${sumHtml(res)}`],
      meta: { t: 'collect-mc', list },
    })
  }
  return q({
    prompt: `Simplify:${big(sumHtml(list))}`,
    answer: exprA(sumExpr(res), 'simplified'),
    hint: 'Group the like terms. Each + or − sign belongs to the term that follows it.',
    steps: [`Group like terms: ${sumHtml(list.filter(([, w]) => likeKey(w) === likeKey(list[0][1])).concat(list.filter(([, w]) => likeKey(w) !== likeKey(list[0][1]))))}`, `= ${sumHtml(res)}`],
    meta: { t: 'collect', list },
  })
}

function testBySubstitution(op: 'add' | 'mul'): Question {
  const [a, b] = vars(2)
  let vals = { [a]: int(2, 5), [b]: int(2, 6) }
  const k1 = int(2, 9)
  const k2 = int(2, 9)
  const candidates: [string, string, boolean][] =
    op === 'add'
      ? [
          [`${k1}${a} + ${k2}${a}`, `${k1 + k2}${a}`, true],
          [`${k1}${a} + ${k2}${a}`, `${k1 + k2}${a}^2`, false],
          [`${k1}${b} + ${b}`, `${k1}${b}^2`, false],
          [`${k1 + k2}${a} - ${k2}${a}`, `${k1}${a}`, true],
          [`${k1}${a}^2 + ${k2}${a}^2`, `${k1 + k2}${a}^2`, true],
          [`${k1}${a}${b} + ${k2}${b}${a}`, `${k1 + k2}${a}${b}`, true],
          [`${k1 + 1}${b} - ${b}`, `${k1 + 1}`, false],
          [`${k1}${a} + ${k2}${b}`, `${k1 + k2}${a}${b}`, false],
        ]
      : [
          [`${k1} × ${k2}${a}`, `${k1 * k2}${a}`, true],
          [`${a} + ${a}`, `${a}^2`, false],
          [`${k1}${b} × ${k2}${b}`, `${k1 * k2}${b}^2`, true],
          [`${k1}${a}^2 × ${k2}${a}^2`, `${k1 * k2}${a}^2`, false],
          [`frac{${k1 * k2}${a}}{${k2}${a}}`, `${k1}`, true],
          [`${k1}${a} × ${k2}${b}`, `${k1 * k2}${b}${a}`, true],
          [`${a} × ${b} × ${b}`, `2${a}${b}`, false],
          [`frac{${k1 * 2}${a}^2}{${k1}${a}}`, `2${a}`, true],
        ]
  const [lhs, rhs, isTrue] = pick(candidates)
  const plainL = lhs.replace(/×/g, '*').replace(/frac\{(.*?)\}\{(.*?)\}/, '($1)/($2)')
  // a false equation must give different values here (agreeing at one value proves nothing)
  for (let k = 0; k < 50 && !isTrue && Math.abs(evalPlain(plainL, vals) - evalPlain(rhs, vals)) < 1e-9; k++) vals = { [a]: int(2, 6), [b]: int(2, 7) }
  const A = vals[a]
  const B = vals[b]
  const L = evalPlain(plainL, vals)
  const R = evalPlain(rhs, vals)
  if (!isTrue && Math.abs(L - R) < 1e-9) return testBySubstitution(op)
  const right = isTrue ? 'Correct' : 'Incorrect'
  return q({
    prompt: `Use the substitution ${v(a)} = ${A} and ${v(b)} = ${B} to test whether this equation is correct or incorrect.${big(`${ex(lhs)} = ${ex(rhs)}`)}`,
    answer: mcFixedA(['Correct', 'Incorrect'], right),
    hint: 'Work out each side separately with the values given. If LHS = RHS for these values, it may be correct; if not, it is definitely incorrect.',
    steps: [`LHS = ${num(L)}`, `RHS = ${num(R)}`, right === 'Correct' ? 'LHS = RHS for these values, and simplifying the left side confirms the equation is correct for every value.' : 'LHS ≠ RHS, so the equation is incorrect.'],
    meta: { t: 'subtest', lhs: plainL, rhs, vals },
  })
}
/** value of a plain expression such as "3ab^2 + 2a" for the given pronumerals */
function evalPlain(expr: string, vals: Record<string, number>): number {
  const js = expr
    .replace(/(\d|\))\s*([a-z(])/g, '$1*$2')
    .replace(/([a-z])\s*(?=[a-z(])/g, '$1*')
    .replace(/([a-z])\^(\d+)/g, '($1**$2)')
    // a power of a bracket: (p + q)^2
    .replace(/\)\s*\^\s*(\d+)/g, ')**$1')
    .replace(/[a-z]/g, (m) => `(${vals[m]})`)
  if (js.includes('^')) throw new Error('evalPlain: unread power in ' + expr)
  // eslint-disable-next-line no-new-func
  return Function(`"use strict"; return (${js});`)() as number
}

function perimeterExpression(): Question {
  const [p, m] = vars(2)
  const kind = pick(['rectangle', 'square-side', 'triangle', 'quad', 'right', 'equilateral-side'] as const)
  if (kind === 'rectangle') {
    const a = int(2, 9)
    const b = int(2, 9)
    return q({
      prompt: 'Write a simplified expression for the perimeter of this rectangle.',
      diagram: D.rectangle(5, 3, ex(`${a}${p}`), ex(`${b}${m}`)),
      answer: exprA(terms([[2 * a, p], [2 * b, m]]), 'simplified'),
      note: 'Diagram not drawn to scale.',
      hint: 'A rectangle has two lengths and two widths. Add all four sides.',
      steps: [`Perimeter = ${ex(`${a}${p} + ${b}${m} + ${a}${p} + ${b}${m}`)} = ${ex(terms([[2 * a, p], [2 * b, m]]))}`],
      meta: { t: 'perim', sides: [`${a}${p}`, `${b}${m}`, `${a}${p}`, `${b}${m}`] },
    })
  }
  if (kind === 'triangle' || kind === 'quad' || kind === 'right') {
    const sides: string[] =
      kind === 'triangle'
        ? (() => {
            const a = int(2, 6)
            return [`${a}${p}`, `${a}${p}`, `${int(3, 8)}${m}`]
          })()
        : kind === 'right'
          ? (() => {
              const [x, y, z] = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [9, 40, 41]])
              return [`${x}${p}`, `${y}${p}`, `${z}${p}`]
            })()
          : (() => {
              const c = int(1, 5)
              return [`${p} + ${c}`, `${p} + ${c}`, `2${p} - ${int(1, c)}`, `2${p}`]
            })()
    const list: Lt[] = []
    for (const s of sides) for (const m2 of s.replace(/ /g, '').match(/[+-]?[^+-]+/g)!) list.push([Number(m2.match(/^[+-]?\d*/)![0].replace(/^([+-]?)$/, '$11')), m2.replace(/^[+-]?\d*/, '')])
    const res = collect(list)
    return q({
      prompt: `A ${kind === 'quad' ? 'quadrilateral' : 'triangle'} has sides of length ${sides.map((s) => ex(s)).join(', ').replace(/, ([^,]*)$/, ' and $1')}. Write a simplified expression for its perimeter.`,
      answer: exprA(sumExpr(res), 'simplified'),
      hint: 'Add all the sides, then collect like terms.',
      steps: [`Perimeter = ${sides.map((s) => (/[+-]/.test(s.slice(1)) ? `(${ex(s)})` : ex(s))).join(' + ')}`, `= ${sumHtml(res)}`],
      meta: { t: 'perim', sides },
    })
  }
  if (kind === 'square-side') {
    const k = pick([4, 8, 12, 16, 20, 24, 28])
    return q({
      prompt: `A square has a perimeter of ${ex(`${k}${p}`)}. Write an expression for the length of each side.`,
      answer: exprA(coef(k / 4, p), 'simplified'),
      hint: 'A square has 4 equal sides.',
      steps: [`Side = ${ex(`${k}${p}`)} ${DIVIDE} 4 = ${ex(coef(k / 4, p))}`],
      meta: { t: 'side', per: `${k}${p}`, n: 4 },
    })
  }
  const a = pick([3, 6, 9, 12])
  const b = pick([3, 6, 9, 15])
  return q({
    prompt: `An equilateral triangle has a perimeter of ${ex(`${a}${p} + ${b}`)}. Write an expression for the length of each side.`,
    answer: exprA(`${coef(a / 3, p)} + ${b / 3}`, 'simplified'),
    hint: 'An equilateral triangle has 3 equal sides: divide each term by 3.',
    steps: [`Side = (${ex(`${a}${p} + ${b}`)}) ${DIVIDE} 3 = ${ex(`${coef(a / 3, p)} + ${b / 3}`)}`],
    meta: { t: 'side', per: `${a}${p} + ${b}`, n: 3 },
  })
}

export const ex103 = (level: Level): Question => {
  if (level === 1) return likeTermsTwo()
  if (level === 2) return likeTermsMany()
  return chance(0.4) ? testBySubstitution('add') : perimeterExpression()
}

// ================================================================== 1.04 Multiplying and dividing terms

const factorHtml = (t: Term) => (t.n < 0 ? `(${termHtml(t)})` : termHtml(t))
function randomTerm(letters: string[], maxCoef = 9, allowNeg = true, maxPow = 1): Term {
  const p: Pw = {}
  for (const l of letters) p[l] = int(1, maxPow)
  return term((allowNeg && chance(0.3) ? -1 : 1) * int(1, maxCoef), p)
}

function products(): Question {
  const vs = vars(3)
  const kind = pick(['two', 'two', 'three', 'square', 'fraction'] as const)
  if (kind === 'square') {
    const base = randomTerm(sample(vs, pick([1, 2])), 6, true)
    if (Math.abs(base.n) === 1 && Object.keys(base.p).length === 1 && chance()) base.n = int(2, 6)
    const res = mulT(base, base)
    return q({
      prompt: `Simplify:${big(`(${termHtml(base)})<sup>2</sup>`)}`,
      answer: exprA(termExpr(res), 'simplified'),
      hint: `Squaring means multiplying by itself: (${termHtml(base)}) ${TIMES} (${termHtml(base)}). A negative times a negative is positive.`,
      steps: [`(${termHtml(base)})<sup>2</sup> = ${factorHtml(base)} ${TIMES} ${factorHtml(base)} = ${termHtml(res)}`],
      meta: { t: 'prod', factors: [termExpr(base), termExpr(base)] },
    })
  }
  if (kind === 'fraction') {
    const d = pick([2, 3, 4])
    const nn = int(1, d - 1)
    const k = d * int(2, 6) * (chance() ? -1 : 1)
    const [a, b] = sample(vs, 2).sort()
    const f1 = term(k, { [a]: 1 })
    const f2 = term(nn, { [a]: 1, [b]: 1 }, d)
    const res = mulT(f1, f2)
    return q({
      prompt: `Simplify:${big(`${termHtml(f1)} ${TIMES} ${frac(num(nn), d)}${ex(`${a}${b}`)}`)}`,
      answer: exprA(termExpr(res), 'simplified'),
      hint: 'Multiply the numbers (cancel first if you can), then the pronumerals.',
      steps: [`${num(k)} ${TIMES} ${frac(num(nn), d)} = ${num((k * nn) / d)}`, `${ex(a)} ${TIMES} ${ex(`${a}${b}`)} = ${ex(`${a}^2${b}`)}`, `= ${termHtml(res)}`],
      meta: { t: 'prod', factors: [termExpr(f1), termExpr(f2)] },
    })
  }
  const n = kind === 'three' ? 3 : 2
  const fs: Term[] = []
  for (let i = 0; i < n; i++) {
    const ls = chance(0.25) && i > 0 ? [] : sample(vs, pick([1, 1, 2]))
    fs.push(randomTerm(ls, n === 3 ? 5 : 11, true))
  }
  const res = fs.reduce(mulT)
  return q({
    prompt: `Simplify:${big(fs.map((f, i) => (i > 0 ? factorHtml(f) : termHtml(f))).join(` ${TIMES} `))}`,
    answer: exprA(termExpr(res), 'simplified'),
    hint: 'Multiply the numbers first (watch the signs), then the pronumerals. Write the pronumerals in alphabetical order.',
    steps: [`Numbers: ${fs.map((f) => bnum(f.n)).join(` ${TIMES} `)} = ${num(fs.reduce((t, f) => t * f.n, 1))}`, `= ${termHtml(res)}`],
    meta: { t: 'prod', factors: fs.map(termExpr) },
  })
}

function quotients(): Question {
  const vs = vars(3)
  for (;;) {
    const N = randomTerm(sample(vs, pick([1, 2, 2, 3])), 1, false, 2)
    N.n = (chance(0.25) ? -1 : 1) * int(2, 12) * int(1, 6)
    const Dn = randomTerm(sample(vs, pick([1, 1, 2])), 1, false, 2)
    Dn.n = (chance(0.25) ? -1 : 1) * int(2, 12)
    const res = divT(N, Dn)
    if (res.d > 12 || Math.abs(res.n) > 60 || Math.abs(N.n) > 80) continue
    const shared = Object.keys(Dn.p).some((k) => k in N.p)
    if (!shared && chance(0.7)) continue
    if (gcd(Math.abs(N.n), Math.abs(Dn.n)) === 1 && chance(0.8)) continue
    const asFrac = chance()
    return q({
      prompt: `Simplify:${big(asFrac ? frac(termHtml(N), termHtml(Dn)) : `${termHtml(N)} ${DIVIDE} ${factorHtml(Dn)}`)}`,
      answer: exprA(termExpr(res), 'lowestTerms'),
      hint: 'Divide the numbers (simplify the fraction), then cancel any pronumerals that are on the top and the bottom.',
      steps: [`= ${frac(termHtml(N), termHtml(Dn))}`, `= ${termHtml(res)}`],
      meta: { t: 'quot', top: termExpr(N), bottom: termExpr(Dn) },
    })
  }
}

function areaVolume(): Question {
  const [a, b, c] = vars(3)
  const kind = pick(['rect', 'tri', 'prism', 'square-side'] as const)
  if (kind === 'square-side') {
    const k = pick([4, 9, 16, 25, 36, 49, 64, 81, 100])
    const x = a
    return q({
      prompt: `A square has an area of ${ex(`${k}${x}^2`)}. Write an expression for the length of each side.`,
      answer: exprA(`${Math.sqrt(k)}${x}`, 'simplified'),
      hint: 'What term, multiplied by itself, gives this area?',
      steps: [`${ex(`${Math.sqrt(k)}${x}`)} ${TIMES} ${ex(`${Math.sqrt(k)}${x}`)} = ${ex(`${k}${x}^2`)}, so each side is ${ex(`${Math.sqrt(k)}${x}`)}.`],
      meta: { t: 'sqside', k, x },
    })
  }
  const s1 = term(int(2, 7), { [a]: 1 })
  const s2 = term(int(2, 7), { [b]: 1 })
  if (kind === 'rect') {
    const res = mulT(s1, s2)
    return q({
      prompt: 'Write a simplified expression for the area of this rectangle.',
      diagram: D.rectangle(5, 3, termHtml(s1), termHtml(s2)),
      answer: exprA(termExpr(res), 'simplified'),
      note: 'Diagram not drawn to scale.',
      hint: 'Area of a rectangle = length × width.',
      steps: [`Area = ${termHtml(s1)} ${TIMES} ${termHtml(s2)} = ${termHtml(res)}`],
      meta: { t: 'prod', factors: [termExpr(s1), termExpr(s2)] },
    })
  }
  if (kind === 'tri') {
    const base = term(2 * int(1, 4), { [a]: 1 })
    const h = term(int(2, 7), { [b]: 1 })
    const res = mulT(term(1, {}, 2), mulT(base, h))
    return q({
      prompt: `A right-angled triangle has a base of ${termHtml(base)} and a perpendicular height of ${termHtml(h)}. Write a simplified expression for its area.`,
      answer: exprA(termExpr(res), 'simplified'),
      hint: 'Area of a triangle = ½ × base × height.',
      steps: [`Area = ${frac(1, 2)} ${TIMES} ${termHtml(base)} ${TIMES} ${termHtml(h)} = ${termHtml(res)}`],
      meta: { t: 'prod', factors: ['1/2', termExpr(base), termExpr(h)] },
    })
  }
  const same = chance(0.3)
  const dims = same ? [s1, s1, s1] : [s1, s2, term(int(2, 5), { [chance() ? a : c]: 1 })]
  const res = dims.reduce(mulT)
  return q({
    prompt: `A rectangular prism measures ${dims.map(termHtml).join(' by ')}. Write a simplified expression for its volume.`,
    answer: exprA(termExpr(res), 'simplified'),
    hint: 'Volume = length × width × height.',
    steps: [`Volume = ${dims.map(termHtml).join(` ${TIMES} `)} = ${termHtml(res)}`],
    meta: { t: 'prod', factors: dims.map(termExpr) },
  })
}

function productMC(): Question {
  const [a, b] = vars(2)
  const f1 = term(-int(2, 6), { [a]: 1 })
  const f2 = term(int(2, 6), { [a]: 1, [b]: 1 })
  const f3 = term(-int(2, 5), { [b]: 1 })
  const res = [f1, f2, f3].reduce(mulT)
  const wrong = [term(-res.n, res.p), term(res.n, { [a]: 1, [b]: 1 }), term(-res.n, { [a]: 1, [b]: 1 })].map((t) => ex(termExpr(t)))
  return q({
    prompt: `Simplify ${termHtml(f1)} ${TIMES} ${termHtml(f2)} ${TIMES} (${termHtml(f3)}).`,
    answer: mcA(termHtml(res), wrong),
    hint: 'Two negatives multiply to a positive. Count how many times each pronumeral appears.',
    steps: [`Numbers: ${bnum(f1.n)} ${TIMES} ${num(f2.n)} ${TIMES} ${bnum(f3.n)} = ${num(res.n)}`, `Pronumerals: ${ex(`${a} * ${a}${b} * ${b}`)} = ${ex(`${a}^2${b}^2`)}`, `= ${termHtml(res)}`],
    meta: { t: 'prod-mc', factors: [f1, f2, f3].map(termExpr) },
  })
}

export const ex104 = (level: Level): Question => {
  if (level === 1) return products()
  if (level === 2) return quotients()
  return pick([areaVolume, areaVolume, productMC, () => testBySubstitution('mul'), quotients])()
}

// ================================================================== 1.05 Adding and subtracting algebraic fractions

/** a/b + c/d where both have the same pronumeral part (or none): one Term */
function addSame(t1: Term, t2: Term, sign: 1 | -1): Term {
  return tidy({ n: t1.n * t2.d + sign * t2.n * t1.d, d: t1.d * t2.d, p: { ...t1.p } })
}
const opHtml = (sign: 1 | -1) => (sign > 0 ? '+' : MINUS)

function likeDenominators(): Question {
  const x = letter()
  const kind = pick(['numeric', 'numeric', 'pron-top', 'pron-bottom', 'both'] as const)
  const sign: 1 | -1 = chance(0.45) ? -1 : 1
  let D: number
  let dp: Pw = {}
  let np: Pw = {}
  if (kind === 'numeric') {
    D = pick([3, 4, 5, 6, 8, 9, 10, 12])
    np = { [x]: 1 }
  } else if (kind === 'pron-top') {
    D = 1
    const y = pick(VARS.filter((u) => u !== x))
    np = { [x]: 1 }
    dp = { [y]: 1 }
  } else if (kind === 'pron-bottom') {
    D = pick([1, 1, 2, 3, 5])
    dp = { [x]: 1 }
  } else {
    D = pick([2, 3, 4])
    const y = pick(VARS.filter((u) => u !== x))
    np = { [x]: 1 }
    dp = { [y]: 1 }
  }
  let a = int(1, 11)
  let b = int(1, 9)
  if (sign < 0 && a <= b) [a, b] = [b + 1, a]
  const t1 = written(a, np, D, dp)
  const t2 = written(b, np, D, dp)
  const res = tidy({ n: a + sign * b, d: D, p: written(1, np, 1, dp).p })
  const shown = `${writtenHtml(a, np, D, dp)} ${opHtml(sign)} ${writtenHtml(b, np, D, dp)}`
  const resExpr = termExpr(res)
  if (chance(0.15) && kind !== 'numeric') {
    const wrongs = [termExpr(tidy({ n: a + sign * b, d: 2 * D, p: res.p })), termExpr(tidy({ n: (a + sign * b) * 2, d: D, p: res.p })), termExpr(tidy({ n: a - sign * b, d: D, p: res.p })), termExpr(tidy({ n: a + sign * b + 1, d: D, p: res.p }))].filter((w) => !/^-?0/.test(w))
    return q({
      prompt: `Simplify ${shown}.`,
      answer: mcA(termHtml(res), Array.from(new Set(wrongs.filter((w) => w !== resExpr))).map((w) => termHtml(exprToTerm(w)))),
      hint: 'The denominators are the same: add or subtract the numerators and keep the denominator. Then simplify.',
      steps: [`= ${frac(`${ex(coefOrNum(a, powText(np, 1)))} ${opHtml(sign)} ${ex(coefOrNum(b, powText(np, 1)))}`, ex(denomText(D, dp)))}`, `= ${termHtml(res)}`],
      meta: { t: 'frac-sum', parts: [termExpr(t1), termExpr(t2)], sign },
    })
  }
  return q({
    prompt: `Simplify:${big(shown)}`,
    answer: exprA(resExpr, 'lowestTerms'),
    hint: 'The denominators are the same: add or subtract the numerators, keep the denominator, then simplify.',
    steps: [`= ${frac(ex(coefOrNum(a + sign * b, powText(np, 1))), ex(denomText(D, dp)))}`, `= ${termHtml(res)}`],
    meta: { t: 'frac-sum', parts: [termExpr(t1), termExpr(t2)], sign },
  })
}
const denomText = (D: number, dp: Pw) => `${D === 1 && powText(dp, 1) ? '' : D}${powText(dp, 1)}`
/** parse a termExpr string back to a Term (only for the shapes termExpr makes) */
function exprToTerm(s: string): Term {
  const m = s.match(/^(-?)(\d*)([a-z0-9^]*?)(?:\/\(?(\d*)([a-z0-9^]*)\)?)?$/)!
  const p: Pw = {}
  for (const u of (m[3] ?? '').matchAll(/([a-z])(?:\^(\d+))?/g)) p[u[1]] = Number(u[2] ?? 1)
  for (const u of (m[5] ?? '').matchAll(/([a-z])(?:\^(\d+))?/g)) p[u[1]] = -Number(u[2] ?? 1)
  return tidy({ n: (m[1] ? -1 : 1) * Number(m[2] || 1), d: Number(m[4] || 1), p })
}

function unlikeNumeric(): Question {
  const x = letter()
  for (;;) {
    const [b, d] = sample([2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15], 2)
    if (b % d === 0 || d % b === 0 ? chance(0.6) : false) continue
    const a = int(1, 7)
    const c = int(1, 7)
    const sign: 1 | -1 = chance(0.45) ? -1 : 1
    const t1 = term(a, { [x]: 1 }, b)
    const t2 = term(c, { [x]: 1 }, d)
    if (gcd(a, b) !== 1 || gcd(c, d) !== 1) continue
    const res = addSame(t1, t2, sign)
    if (res.n === 0) continue
    const L = (b * d) / gcd(b, d)
    return q({
      prompt: `Simplify:${big(`${writtenHtml(a, { [x]: 1 }, b)} ${opHtml(sign)} ${writtenHtml(c, { [x]: 1 }, d)}`)}`,
      answer: exprA(termExpr(res), 'lowestTerms'),
      hint: `Use a common denominator (the lowest is ${L}). Change both fractions, then add or subtract the numerators.`,
      steps: [`= ${frac(ex(coef((a * L) / b, x)), L)} ${opHtml(sign)} ${frac(ex(coef((c * L) / d, x)), L)}`, `= ${frac(ex(coef((a * L) / b + sign * ((c * L) / d), x)), L)}`, `= ${termHtml(res)}`],
      meta: { t: 'frac-sum', parts: [termExpr(t1), termExpr(t2)], sign },
    })
  }
}

function unlikeMixed(): Question {
  const [x, y] = vars(2)
  const kind = pick(['two-pron', 'two-pron', 'constant', 'pron-den'] as const)
  if (kind === 'pron-den') {
    // a/(bx) ± c/x, or y/(bx) − c/x: denominators with pronumerals
    const b = pick([2, 3, 4, 5])
    const a = int(1, 9)
    const c = int(1, 6)
    const sign: 1 | -1 = chance() ? -1 : 1
    const topY = chance(0.4)
    const numer = topY ? `${y} ${sign < 0 ? '-' : '+'} ${b * c}` : String(a + sign * b * c)
    if (!topY && a + sign * b * c === 0) return unlikeMixed()
    const resExpr = topY ? `(${numer})/(${b}${x})` : termExpr(tidy({ n: a + sign * b * c, d: b, p: { [x]: -1 } }))
    return q({
      prompt: `Simplify:${big(`${frac(topY ? ex(y) : num(a), ex(`${b}${x}`))} ${opHtml(sign)} ${frac(num(c), ex(x))}`)}`,
      answer: exprA(resExpr, 'lowestTerms'),
      hint: `The common denominator is ${b}${x}: multiply the top and bottom of the second fraction by ${b}.`,
      steps: [`= ${frac(topY ? ex(y) : num(a), ex(`${b}${x}`))} ${opHtml(sign)} ${frac(num(b * c), ex(`${b}${x}`))}`, `= ${topY ? frac(ex(numer), ex(`${b}${x}`)) : termHtml(exprToTerm(resExpr))}`],
      meta: { t: 'frac-expr', shown: `${topY ? y : a}/(${b}${x}) ${sign < 0 ? '-' : '+'} ${c}/${x}`, expr: resExpr },
    })
  }
  for (;;) {
    const [b, d] = sample([2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 2)
    const L = (b * d) / gcd(b, d)
    const a = int(1, 7)
    const c = int(1, 7)
    if (gcd(a, b) !== 1 || gcd(c, d) !== 1 || L > 60) continue
    const sign: 1 | -1 = chance(0.45) ? -1 : 1
    const first = kind === 'constant' && chance() ? '' : x
    const second = kind === 'constant' && first !== '' ? '' : y
    const A = (a * L) / b
    const C = (c * L) / d
    const g = gcd(gcd(A, C), L)
    const parts: Lt[] = [[A / g, first], [sign * (C / g), second]]
    const resExpr = `(${terms(parts)})/${L / g}`
    const shown = `${writtenHtml(a, first ? { [first]: 1 } : {}, b)} ${opHtml(sign)} ${writtenHtml(c, second ? { [second]: 1 } : {}, d)}`
    if (chance(0.2)) {
      const wrongs = [`(${terms([[a, first], [sign * c, second]])})/${b + d}`, `(${terms([[A, first], [sign * C, second]])})/${b * d === L ? L * 2 : b * d}`, `(${terms([[a * d, first], [sign * c * b, second]])})/${L + 1}`]
      return q({
        prompt: `Simplify ${shown}.`,
        answer: mcA(frac(ex(terms(parts)), L / g), Array.from(new Set(wrongs)).map((w) => {
          const [, top, bot] = w.match(/^\((.*)\)\/(\d+)$/)!
          return frac(ex(top), bot)
        })),
        hint: 'Find a common denominator first. You can’t add the numerators and the denominators separately.',
        steps: [`Common denominator ${L}: ${frac(ex(coefOrNum(A, first)), L)} ${opHtml(sign)} ${frac(ex(coefOrNum(C, second)), L)}`, `= ${frac(ex(terms(parts)), L / g)}`],
        meta: { t: 'frac-expr', shown: `${a}${first}/${b} ${sign < 0 ? '-' : '+'} ${c}${second}/${d}`, expr: resExpr, mc: true },
      })
    }
    return q({
      prompt: `Simplify:${big(shown)}`,
      answer: exprA(resExpr, 'lowestTerms'),
      hint: `Use a common denominator (${L}). Write both fractions over ${L}, then combine the numerators into one fraction. Type the answer like (6d − 11r)/33.`,
      steps: [`= ${frac(ex(coefOrNum(A, first)), L)} ${opHtml(sign)} ${frac(ex(coefOrNum(C, second)), L)}`, `= ${frac(ex(terms(parts)), L / g)}`],
      meta: { t: 'frac-expr', shown: `${a}${first}/${b} ${sign < 0 ? '-' : '+'} ${c}${second}/${d}`, expr: resExpr },
    })
  }
}
const coefOrNum = (c: number, x: string) => (x ? coef(c, x) : String(c))

export const ex105 = (level: Level): Question => {
  if (level === 1) return likeDenominators()
  if (level === 2) return unlikeNumeric()
  return unlikeMixed()
}

// ================================================================== 1.06 Multiplying and dividing algebraic fractions

type WF = { nc: number; np: Pw; dc: number; dp: Pw }
const wfTerm = (f: WF) => written(f.nc, f.np, f.dc, f.dp)
const wfHtml = (f: WF) => writtenHtml(f.nc, f.np, f.dc, f.dp)
function randomWF(letters: string[], numericBottom: boolean): WF {
  // each fraction starts in simplest form: no number or pronumeral on both the top and the bottom
  const top = sample(letters, int(0, 2))
  const bottom = numericBottom ? [] : sample(letters.filter((l) => !top.includes(l)), int(1, 2))
  const dc = numericBottom ? pick([2, 3, 4, 5, 6, 8, 9, 10]) : pick([1, 1, 2, 3, 4, 5, 9])
  let nc = int(1, 9)
  while (gcd(nc, dc) !== 1) nc = int(1, 9)
  return { nc, np: Object.fromEntries(top.map((l) => [l, 1])), dc, dp: Object.fromEntries(bottom.map((l) => [l, 1])) }
}
function fractionOps(level: Level, count: 2 | 3): Question {
  const letters = vars(level === 1 ? 2 : 3)
  for (let tries = 0; tries < 400; tries++) {
    const fs = Array.from({ length: count }, () => randomWF(letters, level === 1))
    const ops: ('×' | '÷')[] = Array.from({ length: count - 1 }, () => (chance(0.5) ? '×' : '÷'))
    let res = wfTerm(fs[0])
    ops.forEach((op, i) => (res = op === '×' ? mulT(res, wfTerm(fs[i + 1])) : divT(res, wfTerm(fs[i + 1]))))
    // a sensible answer: small numbers, something cancels, not all pronumerals vanish trivially
    const cancels = fs.some((f, i) => i > 0 && (gcd(f.nc, fs[0].dc) > 1 || gcd(f.dc, fs[0].nc) > 1 || Object.keys(f.np).some((k) => k in fs[0].dp) || Object.keys(f.dp).some((k) => k in fs[0].np)))
    if (Math.abs(res.n) > 40 || res.d > 40 || (!cancels && chance(0.8))) continue
    if (fs.some((f) => gcd(f.nc, f.dc) > 1 && Object.keys(f.np).length + Object.keys(f.dp).length < 2)) continue
    if (fs.some((f) => f.nc === 1 && Object.keys(f.np).length === 0 && f.dc === 1 && Object.keys(f.dp).length === 0)) continue
    if (level === 2 && fs.every((f) => Object.keys(f.dp).length === 0)) continue
    // Foundation keeps pronumerals out of the answer's denominator
    if (level === 1 && Object.values(res.p).some((e) => e < 0)) continue
    if (fs.some((f) => Object.keys(f.dp).length + f.dc === 1 && Object.keys(f.np).length === 0)) continue
    const shown = fs.map((f, i) => (i === 0 ? '' : ` ${ops[i - 1]} `) + wfHtml(f)).join('')
    const plain = fs.map((f, i) => (i === 0 ? '' : ` ${ops[i - 1] === '×' ? '*' : '/'} `) + `(${termExpr(wfTerm(f))})`).join('')
    const steps: string[] = []
    if (ops.includes('÷')) steps.push(`Dividing by a fraction is multiplying by its reciprocal: ${fs.map((f, i) => (i === 0 ? wfHtml(f) : ops[i - 1] === '÷' ? writtenHtml(f.dc, f.dp, f.nc, f.np) : wfHtml(f))).join(` ${TIMES} `)}`)
    steps.push(`Cancel common factors and multiply: ${termHtml(res)}`)
    if (level === 3 && chance(0.25)) {
      const wrongs = [termExpr(invT(res)), termExpr(mulT(res, term(2))), termExpr(mulT(res, term(1, { [letters[0]]: 1 })))]
      return q({
        prompt: `Simplify ${shown}.`,
        answer: mcA(termHtml(res), Array.from(new Set(wrongs.filter((w) => w !== termExpr(res)))).map((w) => termHtml(exprToTerm(w)))),
        hint: 'Change each ÷ into × by the reciprocal, then cancel before multiplying.',
        steps,
        meta: { t: 'frac-ops', plain, expr: termExpr(res), mc: true },
      })
    }
    return q({
      prompt: `Simplify:${big(shown)}`,
      answer: exprA(termExpr(res), 'lowestTerms'),
      hint: 'To divide, multiply by the reciprocal (flip the second fraction). Cancel common factors, then multiply the numerators and the denominators. Type answers like 3k/(4h).',
      steps,
      meta: { t: 'frac-ops', plain, expr: termExpr(res) },
    })
  }
  return fractionOps(level, count)
}

export const ex106 = (level: Level): Question => {
  if (level === 1) return fractionOps(1, 2)
  if (level === 2) return fractionOps(2, 2)
  return chance(0.6) ? fractionOps(3, 3) : fractionOps(3, 2)
}

// ================================================================== 1.07 Expanding expressions

const mulLt = (k: Lt, t: Lt): Lt => [k[0] * t[0], likeKey(k[1] + t[1])]
const expand = (k: Lt, inner: Lt[]) => inner.map((t) => mulLt(k, t))
/** the multiplier in front of a bracket: 3, x, 2w, −, −4t */
const outsideHtml = (k: Lt) => (k[0] === -1 && k[1] === '' ? MINUS : k[0] === 1 && k[1] === '' ? '' : ex(k[1] ? coef(k[0], k[1]) : String(k[0])))
const bracketHtml = (k: Lt, inner: Lt[]) => `${outsideHtml(k)}(${ex(terms(inner))})`
const bracketPlain = (k: Lt, inner: Lt[]) => `${k[0] === -1 && k[1] === '' ? '-' : k[1] ? coef(k[0], k[1]) : k[0]}(${terms(inner)})`
const termText = (t: Lt) => ex(t[1] ? coef(t[0], t[1]) : String(t[0]))
const prodStep = (k: Lt, t: Lt) => `${k[0] < 0 ? `(${termText(k)})` : termText(k)} ${TIMES} ${t[0] < 0 ? `(${termText(t)})` : termText(t)}`

function expandOne(level: 1 | 2): Question {
  const x = letter()
  const y = pick(VARS.filter((u) => u !== x))
  let k: Lt = [int(2, 10), chance(0.35) ? x : '']
  let inner: Lt[] = [[int(1, 6), x], [int(1, 12), chance(0.15) ? y : '']]
  if (chance(0.4)) inner.reverse()
  if (level === 2) {
    const kind = pick(['minus-inside', 'minus-inside', 'minus-outside', 'minus-one'] as const)
    if (kind === 'minus-inside') inner[1][0] = -inner[1][0]
    else if (kind === 'minus-outside') {
      k = [-int(1, 6), chance(0.4) ? x : '']
      if (chance()) inner[1][0] = -inner[1][0]
    } else {
      k = [-1, '']
      if (chance()) inner[1][0] = -inner[1][0]
    }
  }
  const res = collect(expand(k, inner))
  const area = level === 1 && chance(0.3) && k[1] === '' && inner.every((t) => t[0] > 0)
  if (level === 2 && chance(0.15)) {
    const wrongs = [terms([mulLt(k, inner[0]), inner[1]]), terms(expand([-k[0], k[1]], inner)), terms([mulLt(k, inner[0]), mulLt([-k[0], k[1]], inner[1])])]
    return q({
      prompt: `Expand ${bracketHtml(k, inner)}.`,
      answer: mcA(ex(terms(res)), Array.from(new Set(wrongs.filter((w) => w !== terms(res)))).map(ex)),
      hint: 'Multiply every term inside the brackets by the term outside, including its sign.',
      steps: [`= ${inner.map((t) => prodStep(k, t)).join(' + ')}`, `= ${ex(terms(res))}`],
      meta: { t: 'expand', shown: bracketPlain(k, inner), expr: terms(res), mc: true },
    })
  }
  return q({
    prompt: area ? `Use the area diagram to expand ${bracketHtml(k, inner)}.` : `Expand:${big(bracketHtml(k, inner))}`,
    diagram: area ? G.areaGrid({ cols: inner.map(termText), rows: [termText(k)] }) : undefined,
    answer: exprA(terms(res), 'expanded'),
    hint: 'Multiply each term inside the brackets by the term outside: a(b + c) = ab + ac. Watch the signs.',
    steps: [`= ${inner.map((t) => prodStep(k, t)).join(' + ')}`, `= ${ex(terms(res))}`],
    note: area ? 'Diagram not drawn to scale.' : undefined,
    meta: { t: 'expand', shown: bracketPlain(k, inner), expr: terms(res) },
  })
}

function expandSimplify(): Question {
  const x = letter()
  const kind = pick(['bracket+term', 'bracket+bracket', 'bracket-bracket', 'const-bracket', 'x-bracket'] as const)
  const b1: Lt[] = [[int(1, 6), x], [nonZero(-7, 7), '']]
  const b2: Lt[] = [[nonZero(-5, 5), x], [nonZero(-7, 7), '']]
  if (chance(0.3)) b1.reverse()
  let parts: [Lt, Lt[]][]
  let extra: Lt[] = []
  if (kind === 'bracket+term') {
    parts = [[[int(2, 6), ''], b1]]
    extra = [[nonZero(-6, 6), x]]
  } else if (kind === 'const-bracket') {
    parts = [[[-int(2, 6), ''], b1]]
    extra = [[int(3, 12), '']]
  } else if (kind === 'x-bracket') {
    parts = [[[1, x], b1], [[int(2, 6) * (chance() ? 1 : -1), ''], b1]]
  } else {
    parts = [[[int(2, 6), ''], b1], [[(kind === 'bracket-bracket' ? -1 : 1) * int(1, 5), ''], b2]]
  }
  const all: Lt[] = [...extra.filter(() => kind === 'const-bracket'), ...parts.flatMap(([k, inner]) => expand(k, inner)), ...extra.filter(() => kind !== 'const-bracket')]
  const res = collect(all)
  if (res.length === 0) return expandSimplify()
  const shownParts = parts.map(([k, inner], i) => (i === 0 ? bracketHtml(k, inner) : `${k[0] < 0 ? MINUS : '+'} ${bracketHtml([Math.abs(k[0]), k[1]], inner)}`))
  const shown = kind === 'const-bracket' ? `${num(extra[0][0])} ${MINUS} ${bracketHtml([-parts[0][0][0], ''], b1)}` : kind === 'bracket+term' ? `${shownParts[0]} ${extra[0][0] < 0 ? MINUS : '+'} ${termText([Math.abs(extra[0][0]), x])}` : shownParts.join(' ')
  const plain = kind === 'const-bracket' ? `${extra[0][0]} - ${bracketPlain([-parts[0][0][0], ''], b1)}` : kind === 'bracket+term' ? `${bracketPlain(parts[0][0], b1)} + (${terms(extra)})` : parts.map(([k, inner]) => `(${bracketPlain(k, inner)})`).join(' + ')
  return q({
    prompt: `Expand and simplify:${big(shown)}`,
    answer: exprA(terms(res), 'expanded'),
    hint: 'Expand each bracket (watch the sign in front of it), then collect like terms.',
    steps: [`= ${ex(terms(all))}`, `= ${ex(terms(res))}`],
    meta: { t: 'expand', shown: plain, expr: terms(res) },
  })
}

function expandTest(): Question {
  const x = letter()
  const val = int(2, 6)
  const a = int(2, 5)
  const b = int(2, 7)
  const items: [string, string][] = [
    [`${a}(${x} + ${b})`, `${a}${x} + ${b}`],
    [`${a}(${x} + ${b})`, `${a}${x} + ${a * b}`],
    [`${x}(${b} - ${a}${x})`, `${b}${x} - ${a}${x}^2`],
    [`${x}(${b} - ${a}${x})`, `${b}${x} - ${a}${x}`],
    [`-${a}(${x} - ${b})`, `-${a}${x} - ${a * b}`],
    [`-${a}(${x} - ${b})`, `-${a}${x} + ${a * b}`],
  ]
  const [lhs, rhs] = pick(items)
  const L = evalPlain(lhs, { [x]: val })
  const R = evalPlain(rhs, { [x]: val })
  return q({
    prompt: `Use the substitution ${v(x)} = ${val} to test whether this expansion is correct or incorrect.${big(`${ex(lhs)} = ${ex(rhs)}`)}`,
    answer: mcFixedA(['Correct', 'Incorrect'], L === R ? 'Correct' : 'Incorrect'),
    hint: 'Work out each side with the value given and compare.',
    steps: [`LHS = ${num(L)}, RHS = ${num(R)}`, L === R ? 'They are equal: the expansion is correct.' : 'They are different: the expansion is incorrect.'],
    meta: { t: 'subtest', lhs, rhs, vals: { [x]: val } },
  })
}

export const ex107 = (level: Level): Question => {
  if (level === 1) return expandOne(1)
  if (level === 2) return chance(0.85) ? expandOne(2) : expandTest()
  return chance(0.85) ? expandSimplify() : expandTest()
}

// ================================================================== 1.08 Factorising expressions

/** highest common factor of two terms */
function hcfLt(a: Lt, b: Lt): Lt {
  const pa: Pw = {}
  const pb: Pw = {}
  for (const m of a[1].matchAll(/([a-z])(?:\^(\d+))?/g)) pa[m[1]] = Number(m[2] ?? 1)
  for (const m of b[1].matchAll(/([a-z])(?:\^(\d+))?/g)) pb[m[1]] = Number(m[2] ?? 1)
  const p: Pw = {}
  for (const k of Object.keys(pa)) if (k in pb) p[k] = Math.min(pa[k], pb[k])
  return [gcd(Math.abs(a[0]), Math.abs(b[0])), powText(p, 1)]
}
const ltPlain = (t: Lt) => (t[1] ? coef(t[0], t[1]) : String(t[0]))

function hcfQuestion(): Question {
  const [x, y] = vars(2)
  const g = int(2, 9)
  const kind = pick(['terms', 'terms', 'complete'] as const)
  const letterH = chance(0.5) ? x : ''
  // inner parts with no common factor
  let i1: Lt
  let i2: Lt
  do {
    i1 = [int(1, 6), pick(['', y, x, `${x}${y}`])]
    i2 = [int(1, 6), pick(['', y, `${y}^2`, x])]
  } while (gcd(i1[0], i2[0]) !== 1 || ltPlain(hcfLt(i1, i2)) !== '1' || (i1[1] === '' && i2[1] === '' && i1[0] === i2[0]))
  const H: Lt = [g, letterH]
  const t1 = mulLt(H, i1)
  const t2 = mulLt(H, i2)
  if (kind === 'complete') {
    const sign = chance() ? 1 : -1
    const inner: Lt[] = [i1, [sign * i2[0], i2[1]]]
    return q({
      prompt: `Complete the factorisation by finding what goes in the box.${big(`${ex(terms(expand(H, inner)))} = □(${ex(terms(inner))})`)}`,
      answer: exprA(ltPlain(H), 'simplified'),
      hint: 'The box holds the highest common factor of the terms.',
      steps: [`The HCF of ${termText(t1)} and ${termText([sign * t2[0], t2[1]])} is ${termText(H)}.`, `Check: ${termText(H)}(${ex(terms(inner))}) = ${ex(terms(expand(H, inner)))}`],
      meta: { t: 'hcf', a: ltPlain(t1), b: ltPlain(t2), expr: ltPlain(H) },
    })
  }
  return q({
    prompt: `Find the highest common factor (HCF) of ${termText(t1)} and ${termText(t2)}.`,
    answer: exprA(ltPlain(H), 'simplified'),
    hint: 'Find the HCF of the numbers, then the pronumerals that are in both terms. Multiply them.',
    steps: [`HCF of ${t1[0]} and ${t2[0]}: ${g}`, letterH ? `Both terms contain ${v(letterH)}.` : 'No pronumeral is in both terms.', `HCF = ${termText(H)}`],
    meta: { t: 'hcf', a: ltPlain(t1), b: ltPlain(t2), expr: ltPlain(H) },
  })
}

function factorise(level: 2 | 3): Question {
  const [x, y] = vars(2)
  for (;;) {
    const H: Lt = [int(2, 9), pick(['', '', x, `${x}${y}`, y])]
    const i1: Lt = [int(1, 9), pick(['', x, y, `${x}^2`])]
    const i2: Lt = [nonZero(-9, 9), pick(['', x, y, `${x}${y}`])]
    if (likeKey(i1[1]) === likeKey(i2[1])) continue
    // the bracket has nothing left to take out
    if (gcd(Math.abs(i1[0]), Math.abs(i2[0])) !== 1 || hcfLt(i1, i2)[1] !== '') continue
    const inner: Lt[] = level === 3 || i2[0] < 0 || chance(0.7) ? [i1, i2] : [i2, i1]
    const neg = level === 3
    // with the negative HCF: expression = −H × (bracket), whose first term is negative
    const outside: Lt = neg ? [-H[0], H[1]] : H
    const expanded = expand(outside, inner)
    if (neg && expanded[0][0] > 0) continue
    const answer = `${neg ? '-' : ''}${ltPlain(H)}(${terms(inner)})`
    if (!neg && chance(0.2)) {
      // wrong options: only partly factorised (a smaller common factor taken out), a term not divided, a factor too big
      const smaller = [2, 3, 5, 7].find((f) => H[0] % f === 0 && f < H[0])
      const partial: string | null = smaller
        ? `${ltPlain([smaller, H[1]])}(${terms(inner.map(([c, w]) => [(c * H[0]) / smaller, w] as Lt))})`
        : H[1]
          ? `${ltPlain([1, H[1]])}(${terms(inner.map(([c, w]) => [c * H[0], w] as Lt))})`
          : null
      const wrongs = [partial, `${ltPlain(H)}(${terms([inner[0], [inner[1][0] * H[0], inner[1][1]]])})`, `${ltPlain([H[0] * 2, H[1]])}(${terms(inner)})`, `${ltPlain(H)}(${terms([[inner[0][0] * H[0], inner[0][1]], inner[1]])})`].filter((w): w is string => !!w)
      return q({
        prompt: `Factorise ${ex(terms(expanded))} completely.`,
        answer: mcA(ex(answer), Array.from(new Set(wrongs.filter((w) => w !== answer))).map(ex)),
        hint: 'Take out the highest common factor of all the terms, then check by expanding.',
        steps: [`The HCF is ${termText(H)}.`, `${ex(terms(expanded))} = ${ex(answer)}`],
        meta: { t: 'factor', shown: terms(expanded), expr: answer, mc: true },
      })
    }
    return q({
      prompt: neg ? `Factorise using the negative HCF:${big(ex(terms(expanded)))}` : `Factorise:${big(ex(terms(expanded)))}`,
      answer: exprA(answer, neg ? 'negFactorised' : 'factorised'),
      hint: neg ? 'The first term is negative, so take out the negative HCF. Every sign inside the bracket changes.' : 'Find the HCF of the terms, write it outside the brackets, and divide each term by it.',
      steps: [`The ${neg ? 'negative ' : ''}HCF is ${termText(outside)}.`, `${ex(terms(expanded))} = ${ex(answer)}`, `Check by expanding: ${ex(answer)} = ${ex(terms(expanded))}`],
      meta: { t: 'factor', shown: terms(expanded), expr: answer, neg },
    })
  }
}

function binomialFactor(): Question {
  const [x, y] = vars(2)
  const a = nonZero(-9, 9)
  const B: Lt[] = chance() ? [[1, x], [a, '']] : [[a > 0 ? a : -a, ''], [a > 0 ? 1 : -1, x]]
  const p: Lt = pick([[1, x], [1, y], [int(2, 5), ''], [int(2, 5), y]] as Lt[])
  const qv: Lt = [nonZero(-6, 6), chance(0.3) ? y : '']
  // the second bracket must have nothing left to take out
  if (likeKey(p[1]) === likeKey(qv[1]) || gcd(Math.abs(p[0]), Math.abs(qv[0])) !== 1 || (p[1] !== '' && p[1] === qv[1])) return binomialFactor()
  const bracket = `(${terms(B)})`
  const shown = `${ltPlain(p) === '1' ? '' : ltPlain(p)}${bracket} ${qv[0] < 0 ? '-' : '+'} ${Math.abs(qv[0]) === 1 && qv[1] === '' ? '' : ltPlain([Math.abs(qv[0]), qv[1]])}${bracket}`
  const answer = `${bracket}(${terms([p, qv])})`
  return q({
    prompt: `Factorise:${big(ex(shown))}`,
    answer: exprA(answer, 'factorised'),
    hint: `Both terms have the bracket ${ex(bracket)} as a factor. Take it out.`,
    steps: [`The HCF is ${ex(bracket)}.`, `= ${ex(answer)}`],
    meta: { t: 'factor', shown, expr: answer },
  })
}

export const ex108 = (level: Level): Question => {
  if (level === 1) return hcfQuestion()
  if (level === 2) return factorise(2)
  return chance(0.5) ? binomialFactor() : factorise(3)
}

// ================================================================== 1.09 Expanding binomial products

const binomial = (a: Lt, b: Lt): Lt[] => [a, b]
function multiplyOut(p: Lt[], r: Lt[]): Lt[] {
  return p.flatMap((t) => r.map((u) => mulLt(t, u)))
}
const binHtml = (b: Lt[]) => `(${ex(terms(b))})`

function binomialArea(): Question {
  const x = letter()
  const a = int(1, 10)
  const b = int(1, 10)
  const p = binomial([1, x], [a, ''])
  const r = binomial([1, x], [b, ''])
  const four = multiplyOut(r, p)
  const res = collect(four)
  return q({
    prompt: `Use the area diagram to expand ${binHtml(p)}${binHtml(r)}.`,
    diagram: G.areaGrid({ cols: p.map(termText), rows: r.map(termText) }),
    answer: exprA(terms(res), 'expanded'),
    hint: 'Find the area of each of the four small rectangles, then add them and collect like terms.',
    steps: [`The four areas: ${four.map(termText).join(', ')}`, `= ${ex(terms(four))}`, `= ${ex(terms(res))}`],
    note: 'Diagram not drawn to scale.',
    meta: { t: 'expand', shown: `(${terms(p)})(${terms(r)})`, expr: terms(res) },
  })
}

function binomialSigned(): Question {
  const x = letter()
  const kind = pick(['monic', 'monic', 'flip', 'square', 'mc-square', 'mc-flip'] as const)
  let p: Lt[]
  let r: Lt[]
  if (kind === 'square' || kind === 'mc-square') {
    const a = nonZero(-11, 11)
    p = chance(0.3) ? [[a, ''], [1, x]] : [[1, x], [a, '']]
    r = p
  } else if (kind === 'flip' || kind === 'mc-flip') {
    p = [[1, x], [nonZero(-9, 9), '']]
    r = [[int(2, 15), ''], [-1, x]]
  } else {
    p = [[1, x], [nonZero(-10, 10), '']]
    r = [[1, x], [nonZero(-10, 10), '']]
    if (p[1][0] > 0 && r[1][0] > 0) r[1][0] = -r[1][0]
    if (chance(0.25)) r.reverse()
  }
  const four = multiplyOut(p, r)
  const res = collect(four)
  const shown = kind.endsWith('square') ? `${binHtml(p)}<sup>2</sup>` : `${binHtml(p)}${binHtml(r)}`
  const plain = kind.endsWith('square') ? `(${terms(p)})^2` : `(${terms(p)})(${terms(r)})`
  if (kind.startsWith('mc')) {
    const wrongs = kind === 'mc-square' ? [terms([[1, `${x}^2`], [p[0][1] ? p[1][0] ** 2 : p[0][0] ** 2, '']]), terms([[1, `${x}^2`], [(p[0][1] ? p[1][0] : p[0][0]) ** 2, x]]), terms([[1, `${x}^2`], [p[0][1] ? p[1][0] : p[0][0], x], [(p[0][1] ? p[1][0] : p[0][0]) ** 2, '']])] : [terms(collect(multiplyOut(p, [[r[0][0], ''], [1, x]]))), terms(collect(res.map(([c, w]) => [w.includes('^2') ? -c : c, w] as Lt))), terms(collect(res.map(([c, w]) => [w === '' ? -c : c, w] as Lt)))]
    return q({
      prompt: `Expand ${shown}.`,
      answer: mcA(ex(terms(res)), Array.from(new Set(wrongs.filter((w) => w !== terms(res)))).map(ex)),
      hint: 'Multiply each term in the first bracket by each term in the second (four products), then collect like terms.',
      steps: [`= ${ex(terms(four))}`, `= ${ex(terms(res))}`],
      meta: { t: 'expand', shown: plain, expr: terms(res), mc: true },
    })
  }
  return q({
    prompt: `Expand and simplify:${big(shown)}`,
    answer: exprA(terms(res), 'expanded'),
    hint: kind === 'square' ? `${shown} means ${binHtml(p)}${binHtml(p)}. Don’t just square each term.` : 'Multiply each term in the first bracket by each term in the second (FOIL), then collect like terms.',
    steps: [`= ${ex(terms(four))}`, `= ${ex(terms(res))}`],
    meta: { t: 'expand', shown: plain, expr: terms(res) },
  })
}

function binomialCoefficients(): Question {
  const [x, y] = vars(2)
  const kind = pick(['general', 'general', 'square', 'two-letters', 'rectangle', 'increase'] as const)
  if (kind === 'increase') {
    const [Lg, Wd] = pick([[100, 75], [120, 80], [90, 60], [150, 100]])
    const res: Lt[] = [[1, `${x}^2`], [Lg + Wd, x]]
    return q({
      prompt: `A rectangular table top is ${Lg} cm long and ${Wd} cm wide. Its length and width are both increased by ${v(x)} cm. Write a simplified expression for the increase in its area, in cm².`,
      answer: exprA(terms(res), 'expanded'),
      hint: `New area = (${Lg} + ${v(x)})(${Wd} + ${v(x)}). Subtract the old area, ${Lg} × ${Wd}.`,
      steps: [`New area = (${Lg} + ${v(x)})(${Wd} + ${v(x)}) = ${ex(terms([[Lg * Wd, ''], [Lg + Wd, x], [1, `${x}^2`]]))}`, `Increase = new area ${MINUS} ${num(Lg * Wd)} = ${ex(terms(res))}`],
      meta: { t: 'expand', shown: `(${Lg} + ${x})(${Wd} + ${x}) - ${Lg * Wd}`, expr: terms(res) },
    })
  }
  let p: Lt[]
  let r: Lt[]
  if (kind === 'square') {
    p = [[int(2, 5), x], [nonZero(-9, 9), '']]
    r = p
  } else if (kind === 'two-letters') {
    p = [[int(1, 4), x], [nonZero(-9, 9), '']]
    r = [[int(2, 5), y], [nonZero(-5, 5), '']]
  } else {
    p = [[int(2, 5), x], [nonZero(-8, 8), '']]
    r = [[int(1, 4), x], [nonZero(-8, 8), '']]
    if (chance(0.3)) p.reverse()
  }
  const four = multiplyOut(p, r)
  const res = collect(four)
  const shown = kind === 'square' ? `${binHtml(p)}<sup>2</sup>` : `${binHtml(p)}${binHtml(r)}`
  const plain = kind === 'square' ? `(${terms(p)})^2` : `(${terms(p)})(${terms(r)})`
  if (kind === 'rectangle') {
    return q({
      prompt: `A rectangle has length ${binHtml(p).slice(1, -1)} and width ${binHtml(r).slice(1, -1)}. Write a simplified expression for its area.`,
      answer: exprA(terms(res), 'expanded'),
      hint: 'Area = length × width: multiply the two binomials and collect like terms.',
      steps: [`Area = ${binHtml(p)}${binHtml(r)}`, `= ${ex(terms(four))}`, `= ${ex(terms(res))}`],
      meta: { t: 'expand', shown: plain, expr: terms(res) },
    })
  }
  return q({
    prompt: `Expand and simplify:${big(shown)}`,
    answer: exprA(terms(res), 'expanded'),
    hint: 'Multiply each term in the first bracket by each term in the second, then collect like terms.',
    steps: [`= ${ex(terms(four))}`, `= ${ex(terms(res))}`],
    meta: { t: 'expand', shown: plain, expr: terms(res) },
  })
}

export const ex109 = (level: Level): Question => {
  if (level === 1) return chance(0.5) ? binomialArea() : (() => {
    const x = letter()
    const p: Lt[] = [[1, x], [int(1, 10), '']]
    const r: Lt[] = [[1, x], [int(1, 10), '']]
    const four = multiplyOut(p, r)
    const res = collect(four)
    return q({
      prompt: `Expand and simplify:${big(`${binHtml(p)}${binHtml(r)}`)}`,
      answer: exprA(terms(res), 'expanded'),
      hint: 'Multiply each term in the first bracket by each term in the second, then collect like terms.',
      steps: [`= ${ex(terms(four))}`, `= ${ex(terms(res))}`],
      meta: { t: 'expand', shown: `(${terms(p)})(${terms(r)})`, expr: terms(res) },
    })
  })()
  if (level === 2) return binomialSigned()
  return binomialCoefficients()
}

// ================================================================== Power plus

function ppConsecutive(): Question {
  const x = letter()
  const start = pick([`${x}`, `${x} + 1`, `2${x} + 1`, `${x} - 3`, `2${x}`])
  const k = int(1, 3)
  const ans = `${start} + ${k}`
  const res = collect([...termsOf(start), [k, '']])
  return q({
    prompt: `${ex(start)} stands for an integer. Write a simplified expression for the integer that is ${k} more than it (the ${['', 'next', 'second', 'third'][k]} consecutive integer).`,
    answer: exprA(terms(res), 'simplified'),
    hint: 'Consecutive integers go up by 1 each time.',
    steps: [`Consecutive integers go up by 1: ${[1, 2, 3].slice(0, k).map((j) => ex(terms(collect([...termsOf(start), [j, '']])))).join(', ')}.`, `So the answer is ${ex(terms(res))}.`],
    meta: { t: 'pp-expr', shown: ans, expr: terms(res) },
  })
}
/** the terms of a plain linear expression such as "2x + 1" */
function termsOf(s: string): Lt[] {
  return s
    .replace(/ /g, '')
    .match(/[+-]?[^+-]+/g)!
    .map((m) => [Number(m.match(/^[+-]?\d*/)![0].replace(/^([+-]?)$/, '$11')), m.replace(/^[+-]?\d*/, '')] as Lt)
}

function ppEvaluate(): Question {
  const [p, qv, r] = ['p', 'q', 'r']
  const vals = { p: int(2, 4), q: int(3, 6), r: -int(2, 9) }
  const forms: [string, string][] = [
    [`frac{p + q + r}{3}`, '(p + q + r)/3'],
    [`frac{pqr}{3}`, 'p*q*r/3'],
    [`q^2 - 2q`, 'q^2 - 2*q'],
    [`frac{p - r}{q}`, '(p - r)/q'],
    [`(p + q)^2 - 2pq`, '(p + q)^2 - 2*p*q'],
    [`(p - q)^2 - r^2`, '(p - q)^2 - r^2'],
    [`p^3 - q^3 - r^3`, 'p^3 - q^3 - r^3'],
  ]
  const [shown, plain] = pick(forms)
  const value = evalPlain(plain, vals)
  if (!Number.isInteger(value * 4)) return ppEvaluate()
  return q({
    prompt: `Evaluate ${ex(shown)} when ${v(p)} = ${vals.p}, ${v(qv)} = ${vals.q} and ${v(r)} = ${num(vals.r)}.`,
    answer: numA(round(value, 6)),
    hint: 'Substitute, using brackets for the negative value, and follow the order of operations.',
    steps: [`= ${ex(subExpr(plain, vals).replace(/\//g, ' ÷ '))}`, `= ${num(round(value, 6))}`],
    meta: { t: 'sub', expr: plain, vals },
  })
}

function ppOrderOps(): Question {
  const x = letter()
  const a = int(2, 9)
  const b = int(2, 6) * 3
  const items: [string, string][] = [
    [`${a} * ${b}${x} ÷ 3`, coef((a * b) / 3, x)],
    [`${b}${x} ÷ 3${x} * ${a}`, String((b / 3) * a)],
    [`${b}${x} - ${a * 3}${x} ÷ 3`, coef(b - a, x)],
    [`${a}${x} + 5 * 2${x}`, coef(a + 10, x)],
    [`3 * (${x} - ${a}${x})`, coef(3 - 3 * a, x)],
    [`${a}${x} + ${x} * 5 - 1`, `${coef(a + 5, x)} - 1`],
  ]
  const [shown, res] = pick(items)
  return q({
    prompt: `Use the order of operations to simplify:${big(ex(shown))}`,
    answer: exprA(res, 'simplified'),
    hint: 'Brackets first, then multiplication and division from left to right, then addition and subtraction.',
    steps: [`= ${ex(res)}`],
    meta: { t: 'pp-expr', shown: shown.replace(/÷/g, '/').replace(/(\d)([a-z])/g, '$1*$2').replace(/\/ (\d+)([a-z])/g, '/ ($1*$2)'), expr: res },
  })
}

function ppExpand(): Question {
  const m = letter()
  const a = int(2, 5)
  const b = int(2, 9)
  const c = int(2, 9)
  const items: [string, string, string][] = [
    [`${c} - (${a}${m} + ${b})`, `${c} - (${a}*${m} + ${b})`, terms(collect([[c, ''], [-a, m], [-b, '']]))],
    [`${b}${m} - ${a}${m}(${c} - ${m})`, `${b}*${m} - ${a}*${m}*(${c} - ${m})`, terms(collect([[b, m], [-a * c, m], [a, `${m}^2`]]))],
    [`(${a}${m} + ${b})^2`, `(${a}*${m} + ${b})^2`, terms(collect([[a * a, `${m}^2`], [2 * a * b, m], [b * b, '']]))],
    [`(${m} + 1)(${m} - 1) - (${a}${m} - ${b})`, `(${m} + 1)*(${m} - 1) - (${a}*${m} - ${b})`, terms(collect([[1, `${m}^2`], [-a, m], [b - 1, '']]))],
  ]
  const [shown, plain, res] = pick(items)
  return q({
    prompt: `Expand and simplify:${big(ex(shown))}`,
    answer: exprA(res, 'expanded'),
    hint: 'A minus sign in front of a bracket changes the sign of every term inside it.',
    steps: [`= ${ex(res)}`],
    meta: { t: 'pp-expr', shown: plain, expr: res },
  })
}

function ppGarden(): Question {
  const y = letter()
  const d = int(2, 9)
  const ask = pick(['area', 'perimeter'] as const)
  const res = ask === 'area' ? terms([[1, `${y}^2`], [-d, y]]) : terms([[4, y], [-2 * d, '']])
  return q({
    prompt: `A rectangular garden’s longer sides are each ${d} m longer than its shorter sides. The longer sides are ${v(y)} m long. Write a simplified expression for the garden’s ${ask}.`,
    answer: exprA(res, 'expanded'),
    hint: `The shorter sides are ${v(y)} ${MINUS} ${d} m.`,
    steps: [ask === 'area' ? `Area = ${v(y)}(${v(y)} ${MINUS} ${d}) = ${ex(res)}` : `Perimeter = 2${v(y)} + 2(${v(y)} ${MINUS} ${d}) = ${ex(res)}`],
    meta: { t: 'pp-expr', shown: ask === 'area' ? `${y}*(${y} - ${d})` : `2*${y} + 2*(${y} - ${d})`, expr: res },
  })
}

function ppFactorise3(): Question {
  const [a, b] = vars(2)
  const H: Lt = [int(2, 6), chance(0.4) ? a : '']
  const inner: Lt[] = [[int(1, 5), `${a}`], [nonZero(-5, 5), b], [nonZero(-7, 7), '']]
  const g = inner.map((t) => Math.abs(t[0])).reduce((x, y2) => gcd(x, y2))
  if (g !== 1) return ppFactorise3()
  if (H[1] && inner.some((t) => t[1] === '')) inner[2] = [inner[2][0], b]
  if (likeKey(inner[1][1]) === likeKey(inner[2][1])) return ppFactorise3()
  const expanded = expand(H, inner)
  const answer = `${ltPlain(H)}(${terms(inner)})`
  return q({
    prompt: `Factorise:${big(ex(terms(expanded)))}`,
    answer: exprA(answer, 'factorised'),
    hint: 'Find the HCF of all three terms.',
    steps: [`The HCF is ${termText(H)}.`, `= ${ex(answer)}`],
    meta: { t: 'factor', shown: terms(expanded), expr: answer },
  })
}

export const exPowerPlus1 = (level: Level): Question => {
  if (level === 1) return chance() ? ppConsecutive() : ppEvaluate()
  if (level === 2) return pick([ppOrderOps, ppGarden, ppEvaluate])()
  return chance() ? ppExpand() : ppFactorise3()
}

// ================================================================== Topic test: Test Yourself 1 order

const T = (skill: string, level: Level, gen: () => Question): TestItem => ({ skill, level, gen: () => gen() })

export const NCM1_9_TEST: TestItem[] = [
  // about two questions per exercise (16 in all), in the order of Test Yourself 1
  T('y9-alg-words', 2, () => (chance() ? wordsTwo() : thinkOfANumber())),
  T('y9-alg-sub', 2, subTwo),
  T('y9-alg-sub', 3, () => ex102(3)),
  T('y9-alg-addsub', 2, likeTermsMany),
  T('y9-alg-addsub', 3, () => ex103(3)),
  T('y9-alg-muldiv', 1, products),
  T('y9-alg-muldiv', 2, quotients),
  T('y9-alg-frac-addsub', 1, likeDenominators),
  T('y9-alg-frac-addsub', 2, unlikeNumeric),
  T('y9-alg-frac-muldiv', 2, () => fractionOps(2, 2)),
  T('y9-alg-frac-muldiv', 3, () => ex106(3)),
  T('y9-alg-expand', 2, () => ex107(2)),
  T('y9-alg-expand', 3, expandSimplify),
  T('y9-alg-factorise', 2, () => factorise(2)),
  T('y9-alg-binomial', 1, binomialArea),
  T('y9-alg-binomial', 3, binomialCoefficients),
]

// ================================================================== Skills, in textbook order

const ref = (n: string) => `NCM 9 Ex ${n}`

export const NCM1_9_SKILLS: Skill[] = [
  {
    id: 'y9-alg-words',
    title: 'From words to algebraic expressions',
    ref: ref('1.01'),
    outcomes: OUTCOMES,
    summary: 'Turn worded statements and everyday situations into algebraic expressions, and back again.',
    learn: {
      intro: `<p>A <b>variable</b> (or <b>pronumeral</b>) is a letter that stands for a number. An <b>algebraic expression</b> such as ${ex('3n - 5')} describes what is done to it.</p><p>“Think of a number, multiply it by 3, then subtract 5” is ${ex('3n - 5')}. “Subtract 5, then multiply by 3” is ${ex('3(n - 5)')}: the brackets show the subtraction happens first.</p>`,
      keyPoints: ['Sum: add. Difference: subtract. Product: multiply. Quotient: divide.', '“5 less than x” is x − 5, and “x decreased by 5” is x − 5, but “5 decreased by x” is 5 − x.', 'Write the number before the pronumeral: 4h, not h4. Write division as a fraction: n/2.'],
      vocab: [['variable', 'a letter that stands for a number'], ['product', 'the answer to a multiplication'], ['consecutive', 'following one after another, such as 8, 9, 10']],
    },
    gen: ex101,
    levels: { 1: 'One pronumeral, simple phrases', 2: 'Two pronumerals; “think of a number”; expressions in words', 3: 'Everyday situations, angles and consecutive numbers' },
  },
  {
    id: 'y9-alg-sub',
    title: 'Substitution',
    ref: ref('1.02'),
    outcomes: OUTCOMES,
    summary: 'Replace pronumerals with numbers to evaluate expressions and formulas.',
    learn: {
      intro: `<p><b>Substitution</b> means replacing each pronumeral with its value; then we <b>evaluate</b> (find the value). If ${v('f')} = 5 and ${v('g')} = ${MINUS}4, then ${ex('2f + g')} = 2 × 5 + (${MINUS}4) = 6.</p><p>A <b>formula</b> is a rule connecting variables, such as ${v('P')} = 2${v('l')} + 2${v('w')} for the perimeter of a rectangle.</p>`,
      keyPoints: ['Put negative values in brackets: 3g² with g = −4 is 3 × (−4)² = 48.', 'Follow the order of operations: brackets, powers, × and ÷, then + and −.', 'A fraction bar groups the whole top and the whole bottom.'],
      vocab: [['evaluate', 'find the value of'], ['formula', 'a rule, with an equals sign, connecting variables']],
    },
    gen: ex102,
    levels: { 1: 'One pronumeral', 2: 'Several pronumerals, including negatives', 3: 'Formulas' },
  },
  {
    id: 'y9-alg-addsub',
    title: 'Adding and subtracting terms',
    ref: ref('1.03'),
    outcomes: OUTCOMES,
    summary: 'Collect like terms to simplify, and write expressions for perimeters.',
    learn: {
      intro: `<p><b>Like terms</b> have exactly the same pronumerals with the same powers, in any order: ${ex('3k')} and ${ex('7k')}, ${ex('6ab')} and ${ex('2ba')}. Only like terms can be added or subtracted: ${ex('5xy - 4yx = xy')}, but ${ex('2x - 5y')} can’t be simplified.</p>`,
      keyPoints: ['Each + or − sign belongs to the term after it.', 'x and x² are unlike terms.', 'You can test an answer by substituting a value into both sides.'],
      vocab: [['like terms', 'terms with exactly the same pronumerals and powers']],
    },
    gen: ex103,
    levels: { 1: 'Two terms', 2: 'Several terms with constants', 3: 'Testing by substitution; perimeters' },
  },
  {
    id: 'y9-alg-muldiv',
    title: 'Multiplying and dividing terms',
    ref: ref('1.04'),
    outcomes: OUTCOMES,
    summary: 'Multiply and divide algebraic terms, including powers, areas and volumes.',
    learn: {
      intro: `<p>To multiply terms, multiply the numbers, then the pronumerals: ${ex('2g * 3h * (-5f) = -30fgh')} (pronumerals in alphabetical order). ${ex('3d * 4d = 12d^2')}.</p><p>To divide, write a fraction and cancel: ${ex('35p^2 ÷ 15pw')} = ${frac(ex('35p^2'), ex('15pw'))} = ${frac(ex('7p'), ex('3w'))}.</p>`,
      keyPoints: ['Cancel numbers by their HCF, and pronumerals that are on the top and the bottom.', `(−3r)² = 9r², but −3r² means −3 × r².`, 'Type fractions with brackets around the denominator: 7p/(3w).'],
    },
    gen: ex104,
    levels: { 1: 'Products and squares', 2: 'Quotients', 3: 'Areas, volumes and checking by substitution' },
  },
  {
    id: 'y9-alg-frac-addsub',
    title: 'Adding and subtracting algebraic fractions',
    ref: ref('1.05'),
    outcomes: OUTCOMES,
    summary: 'Use a common denominator to add and subtract algebraic fractions.',
    learn: {
      intro: `<p>Algebraic fractions work like number fractions. With the same denominator, add or subtract the numerators: ${frac(ex('7r'), 10)} ${MINUS} ${frac(ex('3r'), 10)} = ${frac(ex('4r'), 10)} = ${frac(ex('2r'), 5)}.</p><p>Otherwise, use a common denominator: ${frac(ex('k'), 3)} + ${frac(ex('k'), 2)} = ${frac(ex('2k'), 6)} + ${frac(ex('3k'), 6)} = ${frac(ex('5k'), 6)}.</p>`,
      keyPoints: ['Never add the denominators.', 'Different pronumerals stay as separate terms in the numerator: (15x − 16w)/24.', 'Simplify the answer fully. Type answers like 7x/12 or (6d - 11r)/33.'],
    },
    gen: ex105,
    levels: { 1: 'Same denominators', 2: 'Different number denominators', 3: 'Different pronumerals; pronumerals in the denominator' },
  },
  {
    id: 'y9-alg-frac-muldiv',
    title: 'Multiplying and dividing algebraic fractions',
    ref: ref('1.06'),
    outcomes: OUTCOMES,
    summary: 'Cancel common factors, multiply across, and divide by multiplying by the reciprocal.',
    learn: {
      intro: `<p>To multiply fractions, cancel any common factors, then multiply the numerators and the denominators: ${frac(4, ex('k'))} × ${frac(ex('3k'), 16)} = ${frac(3, 4)}.</p><p>To divide by a fraction, multiply by its <b>reciprocal</b> (flip it): ${frac(3, ex('h'))} ÷ ${frac(4, ex('k'))} = ${frac(3, ex('h'))} × ${frac(ex('k'), 4)} = ${frac(ex('3k'), ex('4h'))}.</p>`,
      keyPoints: ['Cancel before multiplying: it keeps the numbers small.', 'Only factors cancel, never terms that are added.', 'Type answers like 3k/(4h), with brackets around the denominator.'],
      vocab: [['reciprocal', 'a fraction turned upside down: the reciprocal of a/b is b/a']],
    },
    gen: ex106,
    levels: { 1: 'Number denominators', 2: 'Pronumerals in the denominator', 3: 'Three fractions' },
  },
  {
    id: 'y9-alg-expand',
    title: 'Expanding expressions',
    ref: ref('1.07'),
    outcomes: OUTCOMES,
    summary: 'Use the distributive law to remove brackets, then collect like terms.',
    learn: {
      intro: `<p>The <b>distributive law</b>: multiply each term inside the brackets by the term outside. ${ex('a(b + c) = ab + ac')} and ${ex('a(b - c) = ab - ac')}. An area diagram shows why: ${ex('5(x + 2)')} is a rectangle made of ${ex('5x')} and 10.</p><p>With a negative in front, every sign inside changes: ${ex('-3(2m - 7) = -6m + 21')}.</p>`,
      keyPoints: ['−(y + 4) means −1 × (y + 4) = −y − 4.', 'Expand each bracket, then collect like terms: 5(2e − 3) − 4(1 − 5e) = 30e − 19.', 'Check by substituting a value into both sides.'],
      vocab: [['expand', 'remove the brackets by multiplying']],
    },
    gen: ex107,
    levels: { 1: 'Positive terms; area diagrams', 2: 'Negative terms', 3: 'Expand and simplify' },
  },
  {
    id: 'y9-alg-factorise',
    title: 'Factorising expressions',
    ref: ref('1.08'),
    outcomes: OUTCOMES,
    summary: 'Find the highest common factor and take it out, including negative and bracket HCFs.',
    learn: {
      intro: `<p><b>Factorising</b> is the reverse of expanding. Find the <b>highest common factor</b> (HCF) of the terms, write it outside the brackets, and divide each term by it: ${ex('25b^2 - 20ab = 5b(5b - 4a)')}.</p><p>A bracket can be the HCF: ${ex('v(4 + w) + 2(4 + w) = (4 + w)(v + 2)')}. When the first term is negative, take out the negative HCF: ${ex('-x^2 + 3x = -x(x - 3)')}.</p>`,
      keyPoints: ['The HCF of 20x² and 15xy is 5x: the HCF of the numbers times the pronumerals in both terms.', 'Factorise fully: nothing left in the bracket should have a common factor.', 'Always check by expanding.'],
      vocab: [['factor', 'a number or expression that divides exactly into another'], ['HCF', 'highest common factor']],
    },
    gen: ex108,
    levels: { 1: 'Highest common factors', 2: 'Factorise by the HCF', 3: 'Bracket HCFs; negative HCFs' },
  },
  {
    id: 'y9-alg-binomial',
    title: 'Expanding binomial products',
    ref: ref('1.09'),
    outcomes: OUTCOMES,
    summary: 'Expand products of two binomials with area diagrams or FOIL.',
    learn: {
      intro: `<p>A <b>binomial</b> has two terms, such as ${ex('x + 5')}. To expand a <b>binomial product</b>, multiply each term in the first bracket by each term in the second, making four terms, then collect like terms: ${ex('(x + 5)(x + 9) = x^2 + 9x + 5x + 45 = x^2 + 14x + 45')}.</p><p>An area diagram shows the four parts. FOIL helps you remember them: First, Outside, Inside, Last.</p>`,
      keyPoints: ['(a − 6)² = (a − 6)(a − 6) = a² − 12a + 36, not a² + 36.', '(x + 8)(3 − x) = 3x − x² + 24 − 8x = −x² − 5x + 24.', 'Area of a rectangle with sides that are binomials = their product.'],
      vocab: [['binomial', 'an expression with two terms'], ['binomial product', 'the product of two binomials']],
    },
    gen: ex109,
    levels: { 1: 'Positive terms; area diagrams', 2: 'Negative terms and squares', 3: 'Coefficients; areas and increases' },
  },
  {
    id: 'y9-alg-powerplus',
    title: 'Power plus: algebra challenges',
    ref: 'NCM 9 Power plus',
    tag: 'extension',
    outcomes: OUTCOMES,
    summary: 'Harder questions: consecutive integers, substitution, order of operations, expanding and factorising.',
    learn: {
      intro: '<p>These questions combine the skills of the chapter. Work step by step and check each answer by substituting a value.</p>',
      keyPoints: ['A minus in front of a bracket changes every sign inside.', 'Factorise three terms by finding the HCF of all three.', 'The order of operations still applies to algebraic terms.'],
    },
    gen: exPowerPlus1,
    levels: { 1: 'Consecutive integers; substitution', 2: 'Order of operations; garden problems', 3: 'Expanding and factorising' },
  },
]
