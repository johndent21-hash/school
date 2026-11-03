// Year 9 Numeracy and calculation, following New Century Maths 9 (3rd edition, Cengage) Chapter 3 exercise by exercise.
// The questions are the site's own: they practise the same kinds of question as each exercise, in the same
// easy-to-hard order (Foundation = the start of the exercise, Challenge = the end), but none of the textbook's
// wording or numbers are copied.
// Syllabus: 3.01 MA4-INT-C-01; 3.02–3.06 MA4-FRC-C-01; 3.07 simple interest MA5-FIN-C-01; 3.08–3.09 MA4-RAT-C-01.
// Most of the chapter is Stage 4 content that NCM 9 revises in Year 9. As the textbook itself notes, written methods
// for multiplying and dividing decimals are no longer in the syllabus, so those questions allow the calculator.
import type { Answer, Level, Question, Skill, TestItem } from '@/lib/maths/types'
import {
  DIVIDE, MINUS, TIMES, bnum, chance, dollars, frac, fracA, fracS, gcd, int, mcA, mcFixedA, mixed, money, num, numA, pick, q, ratioA, round,
  sample, shuffle, v,
} from './helpers'

const INT = ['MA4-INT-C-01']
const FRC = ['MA4-FRC-C-01']
const FIN = ['MA5-FIN-C-01']
const RAT = ['MA4-RAT-C-01']
const ref = (e: string) => `NCM 9 Ex ${e}`
const r9 = (x: number) => round(x, 9)
const big = (s: string) => `<div class="big">${s}</div>`
const sup = (s: string | number) => `<sup>${s}</sup>`
/** false when x sits on a rounding boundary at dp places, so the rounded answer is clear */
const clear = (x: number, dp: number) => {
  const t = x * 10 ** dp
  return Math.abs(t - Math.floor(t) - 0.5) > 1e-6
}
/** a number with exactly dp decimal places (no floating-point noise) */
const dec = (n: number, dp: number) => r9(n / 10 ** dp)
const dpOf = (x: number) => {
  const s = String(r9(x))
  return s.includes('.') ? s.split('.')[1].length : 0
}
const cut = (x: number, k = 4) => (Math.abs(x - round(x, k)) < 1e-9 ? num(round(x, k)) : num(Math.floor(x * 10 ** k + 1e-9) / 10 ** k, k) + '…')
const DPW: Record<number, string> = { 0: 'to the nearest whole number', 1: 'correct to one decimal place', 2: 'correct to two decimal places', 3: 'correct to three decimal places' }
const NAMES = ['Ava', 'Kai', 'Mia', 'Leo', 'Zara', 'Noah', 'Isla', 'Arjun', 'Mele', 'Tane', 'Priya', 'Hamish', 'Sofia', 'Jai', 'Lucy', 'Omar']

// ---------------------------------------------------------------- fractions as [numerator, denominator]
type Fr = [number, number]
const fr = (n: number, d: number): Fr => {
  if (d < 0) {
    n = -n
    d = -d
  }
  const g = gcd(Math.abs(n), d) || 1
  return [n / g, d / g]
}
const fAdd = (a: Fr, b: Fr) => fr(a[0] * b[1] + b[0] * a[1], a[1] * b[1])
const fSub = (a: Fr, b: Fr) => fr(a[0] * b[1] - b[0] * a[1], a[1] * b[1])
const fMul = (a: Fr, b: Fr) => fr(a[0] * b[0], a[1] * b[1])
const fDiv = (a: Fr, b: Fr) => fr(a[0] * b[1], a[1] * b[0])
const fVal = (a: Fr) => a[0] / a[1]
/** a fraction shown as a mixed numeral when it is more than 1 */
const mx = (a: Fr) => mixed(a[0], a[1])
const fAns = (a: Fr): Answer => (a[1] === 1 ? numA(a[0]) : fracA(a[0], a[1]))
/** a random proper fraction in simplest form */
function properFr(maxD = 12, minD = 2): Fr {
  for (;;) {
    const d = int(minD, maxD)
    const n = int(1, d - 1)
    if (gcd(n, d) === 1) return [n, d]
  }
}
/** a random mixed numeral (whole part 1–maxW) in simplest form */
const mixedFr = (maxW = 5, maxD = 10): Fr => {
  const [n, d] = properFr(maxD)
  const w = int(1, maxW)
  return [w * d + n, d]
}

// ---------------------------------------------------------------- recurring decimals
/** the decimal expansion of n/d (n, d > 0): whole part, digits before the repeat, repeating digits */
export function expand(n: number, d: number): { whole: number; pre: string; rep: string } {
  const whole = Math.floor(n / d)
  let r = n % d
  const seen = new Map<number, number>()
  let digits = ''
  while (r !== 0 && !seen.has(r)) {
    seen.set(r, digits.length)
    r *= 10
    digits += Math.floor(r / d)
    r %= d
  }
  if (r === 0) return { whole, pre: digits, rep: '' }
  const at = seen.get(r)!
  return { whole, pre: digits.slice(0, at), rep: digits.slice(at) }
}
const dot = (c: string) => `<span class="rec">${c}</span>`
/** dot notation: dots over the first and last digits of the repeating part, e.g. 0.2̇73̇ */
export function recHtml(whole: number, pre: string, rep: string): string {
  if (!rep) return pre ? `${num(whole)}.${pre}` : num(whole)
  const dots = rep.length === 1 ? dot(rep) : dot(rep[0]) + rep.slice(1, -1) + dot(rep[rep.length - 1])
  return `${num(whole)}.${pre}${dots}`
}
/** the first digits of a recurring decimal, written out with "…" */
const longForm = (whole: number, pre: string, rep: string, len = 9) => {
  let s = pre
  while (s.length < len) s += rep
  return `${num(whole)}.${s.slice(0, Math.max(len, pre.length + 2 * rep.length))}…`
}

// ---------------------------------------------------------------- expressions: written plainly, shown in maths notation
/** "(-3)^2 + 4*(-7)" → (−3)² + 4 × (−7); "frac(-40,-10)" → a fraction */
function show(plain: string): string {
  // symbols first, HTML last (so the "/" in </sup> isn't turned into ÷)
  const fracs: string[] = []
  const s = plain
    .replace(/frac\((-?\d+),(-?\d+)\)/g, (_, a, b) => {
      fracs.push(frac(num(Number(a)), num(Number(b))))
      return `§${fracs.length - 1}§`
    })
    .replace(/\*/g, ` ${TIMES} `)
    .replace(/\//g, ` ${DIVIDE} `)
    .replace(/-/g, MINUS)
    .replace(/\^(\d)/g, (_, e) => sup(e))
  return s.replace(/§(\d+)§/g, (_, i) => fracs[Number(i)])
}
function evalPlain(plain: string): number {
  const js = plain
    .replace(/frac\((-?\d+),(-?\d+)\)/g, '(($1)/($2))')
    // −8² means −(8²)
    .replace(/(^|[^\w)])-(\d+)\^(\d)/g, '$1-($2**$3)')
    .replace(/\^(\d)/g, '**$1')
  // eslint-disable-next-line no-new-func
  return Function(`"use strict"; return (${js})`)() as number
}
const neg = (x: number) => (x < 0 ? `(${x})` : String(x))

// ================================================================== 3.01 Integers

function compareInts(): Question {
  const kind = pick(['negpos', 'posneg', 'negneg', 'negneg', 'zero'] as const)
  let a: number
  let b: number
  if (kind === 'negpos') [a, b] = [-int(1, 20), int(1, 20)]
  else if (kind === 'posneg') [a, b] = [int(1, 20), -int(1, 20)]
  else if (kind === 'zero') [a, b] = chance() ? [0, -int(1, 15)] : [-int(1, 15), 0]
  else {
    a = -int(1, 20)
    b = -int(1, 20)
    if (a === b) b = a - int(1, 5)
  }
  const right = a < b ? '&lt;' : '&gt;'
  return q({
    prompt: `Which sign makes this statement true?${big(`${num(a)} ☐ ${num(b)}`)}`,
    answer: mcFixedA(['&lt;', '&gt;'], right),
    hint: 'On a number line, the number further to the right is bigger. Every negative number is less than 0.',
    steps: [`${num(Math.min(a, b))} is further left on the number line than ${num(Math.max(a, b))}.`, `So ${num(a)} ${right} ${num(b)}.`],
    meta: { t: 'cmp', a, b },
  })
}
function orderInts(): Question {
  for (;;) {
    const set = new Set<number>()
    while (set.size < 6) set.add(int(-15, 15))
    const xs = [...set]
    if (xs.filter((x) => x < 0).length < 2 || xs.filter((x) => x > 0).length < 2) continue
    const asc = chance()
    const right = [...xs].sort((p, r) => (asc ? p - r : r - p))
    const byAbs = [...xs].sort((p, r) => (asc ? Math.abs(p) - Math.abs(r) : Math.abs(r) - Math.abs(p)))
    const negBackwards = [...xs].sort((p, r) => {
      const k = (x: number) => (x < 0 ? -1000 + Math.abs(x) : x)
      return asc ? k(p) - k(r) : k(r) - k(p)
    })
    const reversed = [...right].reverse()
    const fmt = (s: number[]) => s.map((x) => num(x)).join(', ')
    const opts = [fmt(right), fmt(byAbs), fmt(negBackwards), fmt(reversed)]
    if (new Set(opts).size < 4) continue
    return q({
      prompt: `Which list shows these integers in <b>${asc ? 'ascending' : 'descending'}</b> order (${asc ? 'smallest to largest' : 'largest to smallest'})?${big(shuffle(xs).map((x) => num(x)).join(', '))}`,
      answer: mcA(opts[0], opts.slice(1)),
      hint: 'Picture a number line: −13 is further left (smaller) than −5.',
      steps: [`On a number line from left to right: ${[...xs].sort((p, r) => p - r).map((x) => num(x)).join(', ')}`, asc ? 'That is ascending order.' : 'Reverse it for descending order.'],
      meta: { t: 'orderint', asc, xs },
    })
  }
}
function addSubInts(): Question {
  const three = chance(0.4)
  for (;;) {
    const terms = Array.from({ length: three ? 3 : 2 }, () => (chance(0.55) ? -int(1, 15) : int(1, 15)))
    const ops = terms.slice(1).map(() => pick(['+', '-']))
    // at least one negative number or a subtraction that crosses zero
    if (!terms.some((t) => t < 0) && !ops.includes('-')) continue
    let plain = String(terms[0])
    terms.slice(1).forEach((t, i) => (plain += ` ${ops[i]} ${neg(t)}`))
    const val = evalPlain(plain)
    return q({
      prompt: `Evaluate ${show(plain)}.`,
      answer: numA(val),
      hint: 'Adding a negative is the same as subtracting. Subtracting a negative is the same as adding.',
      steps: (() => {
        const simple = plain.replace(/\+ \(-(\d+)\)/g, '- $1').replace(/- \(-(\d+)\)/g, '+ $1')
        return simple === plain ? [`${show(plain)} = ${num(val)}`] : [`${show(plain)} = ${show(simple)}`, `= ${num(val)}`]
      })(),
      meta: { t: 'expr', plain },
    })
  }
}
function temperatures(): Question {
  if (chance()) {
    const start = -int(3, 15)
    const up = int(4, 18)
    const down = int(2, 12)
    const end = start + up - down
    return q({
      prompt: `At 6 am the temperature in an alpine village was ${num(start)}°C. By 1 pm it had risen by ${up}°C, and by 8 pm it had fallen by ${down}°C. What was the temperature at 8 pm?`,
      answer: numA(end),
      suffix: '°C',
      hint: 'Start at the 6 am temperature, add the rise, then subtract the fall.',
      steps: [`${num(start)} + ${up} = ${num(start + up)}`, `${num(start + up)} ${MINUS} ${down} = ${num(end)}°C`],
      meta: { t: 'temp', start, up, down },
    })
  }
  const hi = int(25, 50)
  const lo = -int(3, 25)
  const place = pick(['a desert town', 'an inland city', 'a mountain town', 'a country town'])
  return q({
    prompt: `The highest temperature ever recorded in ${place} was ${hi}°C, and the lowest was ${num(lo)}°C. What is the difference between these temperatures?`,
    answer: numA(hi - lo),
    suffix: '°C',
    hint: 'Difference = highest − lowest. Subtracting a negative is the same as adding.',
    steps: [`${hi} ${MINUS} (${num(lo)}) = ${hi} + ${-lo} = ${hi - lo}°C`],
    meta: { t: 'tempdiff', hi, lo },
  })
}
function mulDivInts(): Question {
  const kind = pick(['mul', 'mul', 'div', 'div', 'sq', 'negsq', 'frac'] as const)
  const s = () => (chance() ? -1 : 1)
  let plain: string
  if (kind === 'mul') plain = `${s() * int(2, 12)}*${neg(s() * int(2, 20))}`
  else if (kind === 'div') {
    const b = int(2, 12) * s()
    let a = int(2, 12) * s() * b
    if (a > 0 && b > 0) a = -a
    plain = `${a}/${neg(b)}`
  } else if (kind === 'sq') plain = `(${-int(2, 12)})^2`
  else if (kind === 'negsq') plain = `-${int(2, 12)}^2`
  else {
    const b = int(2, 10) * s()
    let a = b * int(2, 9) * s()
    if (a > 0 && b > 0) a = -a
    plain = `frac(${a},${b})`
  }
  if (!plain.includes('-')) plain = `-${plain}`
  const val = evalPlain(plain)
  return q({
    prompt: `Evaluate ${show(plain)}.`,
    answer: numA(val),
    hint:
      kind === 'negsq'
        ? `${show(plain)} means ${MINUS}(${plain.slice(1, -2)}<sup>2</sup>): square first, then make it negative.`
        : 'Same signs give a positive answer; different signs give a negative answer.',
    steps: [`${show(plain)} = ${num(val)}`],
    meta: { t: 'expr', plain },
  })
}
function mixedOpsInts(): Question {
  const a = () => int(2, 9)
  const k = int(0, 9)
  const plains = [
    () => `(${-a()})^2 + (${-a()})^2`,
    () => {
      const d = a()
      return `${-d * a()}/${d}*(${-a()})`
    },
    () => {
      const d = a()
      return `frac(${-d * a() * 5},${-d * 5})*${a()}`
    },
    () => `(${-int(2, 5)})^3`,
    () => {
      const b = int(2, 4)
      return `${b * b * a() * (chance() ? 1 : -1)}/(${-b})^2`
    },
    () => {
      const c = a()
      return `${a()} - (${-c * a()})/${c}`
    },
    () => `${int(10, 40)} + ${a()}*(${-a()})`,
    () => `(${-a()})^2 + ${a()}*(${-a()})`,
    () => {
      const b = a()
      return `${b * a() * 3}/(${-b}) + (${-a()})*${a()}`
    },
    () => `${int(5, 20)} - (${-a()} + ${a()})`,
  ]
  const plain = plains[k]()
  const val = evalPlain(plain)
  if (!Number.isInteger(val)) return mixedOpsInts()
  return q({
    prompt: `Evaluate ${show(plain)}.`,
    answer: numA(val),
    hint: 'Order of operations: brackets, then powers, then × and ÷ from left to right, then + and − from left to right.',
    steps: [`${show(plain)} = ${num(val)}`],
    meta: { t: 'expr', plain },
  })
}
function writeTwo(): Question {
  const kind = pick(['sum', 'difference', 'product', 'quotient'] as const)
  const target = -int(2, 24)
  const op = { sum: '+', difference: MINUS, product: TIMES, quotient: DIVIDE }[kind]
  const example = kind === 'sum' ? `3, ${target - 3}` : kind === 'difference' ? `1, ${1 - target}` : kind === 'product' ? `${-target}, -1` : `${2 * target}, 2`
  return q({
    prompt: `Write two integers that have a ${kind} of ${num(target)}. Type them in order, separated by a comma: first ${op} second = ${num(target)}.`,
    answer: { kind: 'open', rule: { type: 'blanks', template: `_ ${op} _ = ${num(target)}`, noZero: kind === 'quotient' || kind === 'product' }, example },
    hint: kind === 'difference' ? 'For a negative difference, the first number must be smaller than the second.' : kind === 'sum' ? 'One of them (at least) must be negative.' : 'Exactly one of them must be negative.',
    steps: [`One answer: ${example.split(', ').map((x, i) => (i ? bnum(Number(x)) : num(Number(x)))).join(` ${op} `)} = ${num(target)}. There are many others.`],
    meta: { t: 'open', kind, target },
  })
}
function pairChoice(): Question {
  const lim = int(8, 12)
  const diff = int(lim + 3, lim + 9)
  const hi = int(lim - 4, lim - 1)
  const right = [hi, hi - diff]
  const wrong = [
    [hi + int(2, 4) + (lim - hi), hi + int(2, 4) + (lim - hi) - diff], // first one is not less than lim
    [hi, hi - diff + int(1, 3)], // wrong difference
    [hi, diff - hi], // sum instead of difference
  ]
  const fmt = (p: number[]) => `${num(p[0])} and ${num(p[1])}`
  return q({
    prompt: `${pick(NAMES)} chose two integers, both less than ${lim}, with a difference of ${diff}. Which pair could they be?`,
    answer: mcA(fmt(right), wrong.map(fmt)),
    hint: 'Check both conditions for each pair: both numbers less than the limit, and larger − smaller equal to the difference.',
    steps: [`${fmt(right)}: both are less than ${lim}, and ${num(right[0])} ${MINUS} (${num(right[1])}) = ${diff}.`],
    meta: { t: 'pair', lim, diff },
  })
}
export const ex301 = (level: Level): Question => {
  if (level === 1) return pick([compareInts, orderInts, addSubInts, addSubInts])()
  if (level === 2) return pick([temperatures, mulDivInts, mulDivInts, addSubInts])()
  return pick([mixedOpsInts, mixedOpsInts, writeTwo, pairChoice])()
}

// ================================================================== 3.02 Decimals

function fracToDec(): Question {
  const k = int(1, 4)
  let n = int(1, 10 ** k * (chance(0.3) ? 2 : 1) - 1)
  if (n % 10 === 0) n++
  const val = dec(n, k)
  return q({
    prompt: `Write ${frac(n, 10 ** k)} as a decimal.`,
    answer: numA(val),
    hint: `The denominator ${num(10 ** k)} has ${k} zero${k > 1 ? 's' : ''}, so the decimal has ${k} decimal place${k > 1 ? 's' : ''}.`,
    steps: [`${frac(n, 10 ** k)} = ${num(val)}`],
    meta: { t: 'f2d', n, d: 10 ** k },
  })
}
function decToFrac(): Question {
  const k = int(1, 4)
  let n = int(1, 10 ** k - 1)
  if (n % 10 === 0) n++
  const d = 10 ** k
  const [sn, sd] = fr(n, d)
  return q({
    prompt: `Write ${num(dec(n, k))} as a fraction in simplest form.`,
    answer: fracA(n, d),
    hint: `Write it over ${num(d)} (${k} decimal place${k > 1 ? 's' : ''}), then simplify.`,
    steps: [`${num(dec(n, k))} = ${frac(n, d)}`, sn === n ? 'This is already in simplest form.' : `= ${frac(sn, sd)} (dividing both by ${n / sn})`],
    meta: { t: 'd2f', x: dec(n, k) },
  })
}
function orderDecs(): Question {
  for (;;) {
    const w = int(0, 9)
    const a = int(1, 9)
    const b = int(1, 9)
    // close decimals with different numbers of places: the classic traps
    const pool = [w + a / 10, w + a / 10 + a / 100, w + a / 100, w + a / 10 + a / 1000, w + a / 1000 + b / 10000, w + (a * 10 + b) / 100, w + b / 10 + a / 1000].map(r9)
    const xs = sample([...new Set(pool)], 4)
    if (xs.length < 4) continue
    const asc = chance()
    const sortBy = (f: (x: number) => number) => [...xs].sort((p, r) => (asc ? f(p) - f(r) : f(r) - f(p)))
    const right = sortBy((x) => x)
    const byLength = sortBy((x) => dpOf(x) * 100 + x)
    const byDigits = sortBy((x) => Number(String(x).replace('.', '')))
    const reversed = [...right].reverse()
    const fmt = (s: number[]) => s.map((x) => num(x)).join(', ')
    const opts = [fmt(right), fmt(byLength), fmt(byDigits), fmt(reversed)]
    if (new Set(opts).size < 4) continue
    return q({
      prompt: `Which list shows these decimals in <b>${asc ? 'ascending' : 'descending'}</b> order?${big(shuffle(xs).map((x) => num(x)).join(', '))}`,
      answer: mcA(opts[0], opts.slice(1)),
      hint: 'Write them all with the same number of decimal places (add zeros), then compare.',
      steps: [`With 4 decimal places: ${xs.map((x) => x.toFixed(4)).join(', ')}`, `${asc ? 'Ascending' : 'Descending'}: ${fmt(right)}`],
      meta: { t: 'orderdec', asc, xs },
    })
  }
}
function addSubDec(): Question {
  const da = int(1, 3)
  const db = int(0, 3)
  let a = dec(int(10, 9999), da)
  let b = dec(int(10, db === 0 ? 99 : 9999), db)
  const sub = chance()
  if (sub && b > a) [a, b] = [b, a]
  const val = r9(sub ? a - b : a + b)
  return q({
    prompt: `Evaluate ${num(a)} ${sub ? MINUS : '+'} ${num(b)}.`,
    answer: numA(val),
    hint: 'Line up the decimal points (add zeros so both have the same number of decimal places).',
    steps: [`${a.toFixed(Math.max(da, db))} ${sub ? MINUS : '+'} ${b.toFixed(Math.max(da, db))} = ${num(val)}`],
    meta: { t: 'expr', plain: `${a} ${sub ? '-' : '+'} ${b}` },
  })
}
function powersOf10(): Question {
  const k = int(1, 4)
  const p = 10 ** k
  const x = dec(int(1, 99999), int(1, 4))
  const mul = chance()
  const val = mul ? r9(x * p) : r9(x / p)
  return q({
    prompt: `Evaluate ${num(x)} ${mul ? TIMES : DIVIDE} ${num(p)}.`,
    answer: numA(val),
    hint: `${mul ? 'Multiplying' : 'Dividing'} by ${num(p)} moves the decimal point ${k} place${k > 1 ? 's' : ''} to the ${mul ? 'right' : 'left'}.`,
    steps: [`Move the point ${k} place${k > 1 ? 's' : ''} ${mul ? 'right' : 'left'}: ${num(x)} ${mul ? TIMES : DIVIDE} ${num(p)} = ${num(val)}`],
    meta: { t: 'expr', plain: `${x} ${mul ? '*' : '/'} ${p}` },
  })
}
function decBetween(): Question {
  const a = dec(int(11, 98), 1)
  const b = r9(a + 0.1)
  const right = r9(a + int(1, 9) / 100)
  const wrong = [r9(a - int(1, 9) / 100), b, r9(b + int(1, 9) / 100), r9(a - 0.1), r9(b + 0.1), a].filter((w) => !(w > a && w < b))
  return q({
    prompt: `Which decimal is between ${num(a)} and ${num(b)}?`,
    answer: mcA(num(right), sample([...new Set(wrong)], 3).map((w) => num(w))),
    hint: `Write both with two decimal places: ${a.toFixed(2)} and ${b.toFixed(2)}.`,
    steps: [`${a.toFixed(2)} < ${num(right)} < ${b.toFixed(2)}`],
    meta: { t: 'between', a, b },
  })
}
function judges(): Question {
  for (;;) {
    const scores = Array.from({ length: 7 }, () => dec(int(55, 98), 1))
    const s = [...scores].sort((p, r) => p - r)
    if (s[0] === s[1] || s[5] === s[6]) continue
    const total = r9(s.slice(1, 6).reduce((t, x) => t + x, 0))
    return q({
      prompt: `Seven judges score a dive: ${scores.map((x) => num(x)).join(', ')}. The highest and lowest scores are crossed out and the other five are added. What is the final score?`,
      answer: numA(total),
      hint: 'Find and cross out the highest and the lowest score, then add the five that are left.',
      steps: [`Cross out ${num(s[6])} (highest) and ${num(s[0])} (lowest).`, `${s.slice(1, 6).map((x) => num(x)).join(' + ')} = ${num(total)}`],
      meta: { t: 'judges', scores },
    })
  }
}
function decProblems(): Question {
  const kind = pick(['timber', 'swim', 'run'] as const)
  if (kind === 'timber') {
    const L = int(2, 6)
    const piece = dec(int(30, L * 100 - 30), 2)
    return q({
      prompt: `A ${L} m length of timber is cut into two pieces. One piece is ${num(piece)} m long. How long is the other piece?`,
      answer: numA(r9(L - piece)),
      suffix: 'm',
      hint: `Subtract: ${L} = ${L}.00.`,
      steps: [`${L}.00 ${MINUS} ${piece.toFixed(2)} = ${num(r9(L - piece))} m`],
      meta: { t: 'expr', plain: `${L} - ${piece}` },
    })
  }
  const t1 = dec(int(5200, 6900), 2)
  const cut2 = dec(int(50, 400), 2)
  const t2 = r9(t1 - cut2)
  if (kind === 'swim')
    return q({
      prompt: `${pick(NAMES)} swam 100 m in ${num(t1)} s. After a season of training they cut ${num(cut2)} s off that time. What is their new time?`,
      answer: numA(t2),
      suffix: 's',
      hint: 'Subtract the time saved.',
      steps: [`${num(t1)} ${MINUS} ${num(cut2)} = ${num(t2)} s`],
      meta: { t: 'expr', plain: `${t1} - ${cut2}` },
    })
  const t2r = dec(int(Math.round(t2 * 10) - 3, Math.round(t2 * 10)), 1)
  return q({
    prompt: `${pick(NAMES)} ran 400 m in ${num(t1)} s. A year later they ran it in ${num(t2r)} s. By how much did their time improve?`,
    answer: numA(r9(t1 - t2r)),
    suffix: 's',
    hint: `Subtract the new time from the old time. ${num(t2r)} = ${t2r.toFixed(2)}.`,
    steps: [`${t1.toFixed(2)} ${MINUS} ${t2r.toFixed(2)} = ${num(r9(t1 - t2r))} s`],
    meta: { t: 'expr', plain: `${t1} - ${t2r}` },
  })
}
function mulDivDec(): Question {
  if (chance()) {
    const a = dec(int(2, 999), int(1, 2))
    const b = dec(int(2, 99), int(1, 2))
    const val = r9(a * b)
    return q({
      prompt: `Evaluate ${num(a)} ${TIMES} ${num(b)}.`,
      answer: numA(val),
      calc: true,
      hint: `Multiply without the decimal points, then count the decimal places: the answer has ${dpOf(a) + dpOf(b)}.`,
      steps: [`${num(a)} ${TIMES} ${num(b)} = ${num(val)}`],
      meta: { t: 'expr', plain: `${a} * ${b}` },
    })
  }
  const b = pick([0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 0.02, 0.04, 0.05, 0.08, 0.005, 3, 4, 8, 5])
  const R = dec(int(2, 999), int(0, 2))
  const a = r9(R * b)
  if (dpOf(a) > 4) return mulDivDec()
  return q({
    prompt: `Evaluate ${num(a)} ${DIVIDE} ${num(b)}.`,
    answer: numA(R),
    calc: true,
    hint: dpOf(b) ? `Move both decimal points ${dpOf(b)} place${dpOf(b) > 1 ? 's' : ''} to the right so you divide by a whole number.` : 'Keep the decimal point in the same place in the answer.',
    steps: dpOf(b) ? [`${num(a)} ${DIVIDE} ${num(b)} = ${num(r9(a * 10 ** dpOf(b)))} ${DIVIDE} ${num(r9(b * 10 ** dpOf(b)))} = ${num(R)}`] : [`${num(a)} ${DIVIDE} ${num(b)} = ${num(R)}`],
    meta: { t: 'expr', plain: `${a} / ${b}` },
  })
}
function equivDivision(): Question {
  const k = int(1, 3)
  const b = dec(int(2, 9), k)
  const a = dec(int(1000, 99999), 3)
  const p = 10 ** k
  const right = `${num(r9(a * p))} ${DIVIDE} ${num(r9(b * p))}`
  const wrong = [`${num(r9(a * p * 10))} ${DIVIDE} ${num(r9(b * p))}`, `${num(a)} ${DIVIDE} ${num(r9(b * p))}`, `${num(r9(a / 10))} ${DIVIDE} ${num(r9(b * p))}`]
  return q({
    prompt: `${pick(NAMES)} has to work out ${num(a)} ${DIVIDE} ${num(b)} without a calculator. Which calculation gives the same answer?`,
    answer: mcA(right, wrong),
    hint: 'Multiply both numbers by the same power of 10, so that you divide by a whole number.',
    steps: [`Multiply both by ${num(p)}: ${num(a)} ${DIVIDE} ${num(b)} = ${right}`],
    meta: { t: 'equivdiv', a, b },
  })
}
function roundDec(): Question {
  for (;;) {
    const dp = int(0, 3)
    const extra = int(1, 2)
    let x = dec(int(10, 99999), dp + extra)
    // sometimes a number that carries when rounded, e.g. 4.996 → 5.00
    if (chance(0.3)) x = r9(dec(int(1, 999), dp) + 0.9 / 10 ** dp + int(5, 9) / 10 ** (dp + 2))
    if (dpOf(x) <= dp || !clear(x, dp)) continue
    const val = round(x, dp)
    return q({
      prompt: dp === 0 ? `Round ${num(x)} to the nearest whole number.` : `Round ${num(x)} to ${dp} decimal place${dp > 1 ? 's' : ''}.`,
      answer: numA(val, dp),
      hint: `Look at the digit after the ${dp === 0 ? 'decimal point' : `${['', 'first', 'second', 'third'][dp]} decimal place`}: 5 or more rounds up.`,
      steps: [`${num(x)} ≈ ${num(val, dp)}`],
      meta: { t: 'round', x, dp },
    })
  }
}
function whichRounds(): Question {
  const T = dec(int(100, 999), 2)
  const right = pick([r9(T - 0.005), r9(T + 0.004), r9(T + 0.0021), r9(T - 0.0032)])
  const wrong = [r9(T - 0.014), r9(T - 0.006), r9(T - 0.0151), r9(T + 0.0052), r9(T + 0.011)].filter((w) => round(w, 2) !== T)
  return q({
    prompt: `Which of these decimals rounds to ${T.toFixed(2)} (to two decimal places)?`,
    answer: mcA(num(right), sample(wrong, 3).map((w) => num(w))),
    hint: 'Round each one to two decimal places: look at the third decimal place.',
    steps: [`${num(right)} ≈ ${T.toFixed(2)}`],
    meta: { t: 'whichround', T },
  })
}
/** a recurring decimal in canonical form: repeating part of 1–3 digits, not all 9s, nothing that shortens */
function randomRecurring(): { whole: number; pre: string; rep: string } {
  for (;;) {
    const repLen = pick([1, 1, 2, 3])
    const rep = Array.from({ length: repLen }, () => String(int(0, 9))).join('')
    const pre = Array.from({ length: pick([0, 1, 1, 2]) }, () => String(int(0, 9))).join('')
    if (/^9+$/.test(rep) || /^0+$/.test(rep)) continue
    if (repLen > 1 && new Set(rep).size === 1) continue
    if (repLen === 2 && rep[0] === rep[1]) continue
    if (repLen === 3 && rep === rep[0].repeat(3)) continue
    if (pre && pre[pre.length - 1] === rep[rep.length - 1]) continue
    return { whole: int(0, 9), pre, rep }
  }
}
function recurNotation(): Question {
  for (;;) {
    const { whole, pre, rep } = randomRecurring()
    const right = recHtml(whole, pre, rep)
    // each wrong option stands for a different number
    const wrong = [
      // (for 0.6666… "0.6̇6̇" would be the same number, so a single repeating digit gets a different wrong option)
      pre ? recHtml(whole, pre.slice(0, -1), pre.slice(-1) + rep) : rep.length > 1 ? recHtml(whole, '', rep + rep[0]) : recHtml(whole, rep, String((Number(rep) + 1) % 10)),
      rep.length > 1 ? recHtml(whole, pre + rep[0], rep.slice(1)) : recHtml(whole, pre, rep + String((Number(rep) + 1) % 10)),
      recHtml(whole, pre + rep, ''),
    ]
    if (new Set([right, ...wrong]).size < 4) continue
    return q({
      prompt: `Write ${longForm(whole, pre, rep)} using dot notation.`,
      answer: mcA(right, wrong),
      hint: 'Find the digits that repeat. Put a dot over the first and the last digit of the repeating part.',
      steps: [`The repeating part is ${rep}${pre ? `, after ${num(whole)}.${pre}` : ''}.`, `So it is written ${right}.`],
      meta: { t: 'recur', whole, pre, rep },
    })
  }
}
function fracToRecurring(): Question {
  for (;;) {
    const d = pick([3, 6, 7, 9, 11, 12, 15, 24, 8, 16, 20, 25, 40, 5, 13])
    const n0 = int(1, d - 1)
    if (gcd(n0, d) !== 1) continue
    const w = chance(0.3) ? int(1, 8) : 0
    const n = w * d + n0
    const e = expand(n, d)
    const shown = w ? mixed(n, d) : frac(n, d)
    const right = `${recHtml(e.whole, e.pre, e.rep)}, ${e.rep ? 'recurring' : 'terminating'}`
    const wrong = e.rep
      ? [`${num(e.whole)}.${(e.pre + e.rep).slice(0, 3)}, terminating`, `${recHtml(e.whole, e.pre + e.rep, '')}, recurring`, `${num(round(d / n, 3))}, ${chance() ? 'recurring' : 'terminating'}`]
      : [`${recHtml(e.whole, e.pre.slice(0, -1), e.pre.slice(-1))}, recurring`, `${num(e.whole)}.${e.pre}, recurring`, `${num(round(d / n, 3))}, terminating`]
    if (new Set([right, ...wrong]).size < 4) continue
    return q({
      prompt: `Convert ${shown} to a decimal. Is it a recurring or a terminating decimal?`,
      answer: mcA(right, wrong),
      calc: true,
      hint: 'Divide the numerator by the denominator. If the digits start repeating, it is recurring.',
      steps: [`${shown} = ${num(n)} ${DIVIDE} ${num(d)} = ${e.rep ? longForm(e.whole, e.pre, e.rep) : recHtml(e.whole, e.pre, '')}`, `= ${right}`],
      meta: { t: 'f2rec', n, d },
    })
  }
}
function fromKnownRecurring(): Question {
  const base = pick([3, 9, 11] as const)
  if (base === 3 || base === 9) {
    const k = base === 3 ? pick([2, 3]) : pick([2, 4, 5, 7, 8, 9])
    const digit = base === 3 ? 3 * k : k
    return q({
      prompt: `${frac(1, base)} = ${recHtml(0, '', String(base === 3 ? 3 : 1))}. Use this to write ${recHtml(0, '', String(digit === 9 ? 9 : digit))} as a fraction (or whole number) in simplest form.`,
      answer: fAns(fr(k, base)),
      hint: `${recHtml(0, '', String(digit))} is ${k} times ${recHtml(0, '', String(base === 3 ? 3 : 1))}.`,
      steps: [`${recHtml(0, '', String(digit))} = ${k} ${TIMES} ${recHtml(0, '', String(base === 3 ? 3 : 1))} = ${k} ${TIMES} ${frac(1, base)} = ${fracS(k, base)}`, ...(digit === 9 ? ['So 0.999… is exactly 1.'] : [])],
      meta: { t: 'fromrec', digits: String(digit), period: 1 },
    })
  }
  const k = int(2, 9)
  const two = String(9 * k).padStart(2, '0')
  return q({
    prompt: `${frac(1, 11)} = ${recHtml(0, '', '09')}. Use this to write ${recHtml(0, '', two)} as a fraction in simplest form.`,
    answer: fAns(fr(k, 11)),
    hint: `${recHtml(0, '', two)} is ${k} times ${recHtml(0, '', '09')}.`,
    steps: [`${recHtml(0, '', two)} = ${k} ${TIMES} ${recHtml(0, '', '09')} = ${k} ${TIMES} ${frac(1, 11)} = ${frac(k, 11)}`],
    meta: { t: 'fromrec', digits: two, period: 2 },
  })
}
function roundingRange(): Question {
  const T = dec(int(100, 9999), 2)
  const smallest = chance()
  const val = smallest ? r9(T - 0.005) : r9(T + 0.004)
  return q({
    prompt: `A decimal with three decimal places has been rounded to ${T.toFixed(2)}. What is the <b>${smallest ? 'smallest' : 'largest'}</b> it could have been?`,
    answer: numA(val),
    hint: smallest ? `The smallest 3-place decimal that rounds up to ${T.toFixed(2)} ends in 5.` : `The largest 3-place decimal that rounds down to ${T.toFixed(2)} ends in 4.`,
    steps: [`Decimals from ${num(r9(T - 0.005))} to ${num(r9(T + 0.004))} round to ${T.toFixed(2)}.`, `The ${smallest ? 'smallest' : 'largest'} is ${num(val)}.`],
    meta: { t: 'range', T, smallest },
  })
}
function earlyRounding(): Question {
  for (;;) {
    const a = dec(int(110, 990), 2)
    const b = dec(int(110, 990), 2)
    const early = round(round(a, 1) * round(b, 1), 1)
    const late = round(a * b, 1)
    if (Math.abs(early - late) < 0.05 || !clear(a * b, 1) || !clear(round(a, 1) * round(b, 1), 1)) continue
    const [n1, n2] = sample(NAMES, 2)
    return q({
      prompt: `${n1} and ${n2} were asked to work out ${num(a)} ${TIMES} ${num(b)}, correct to one decimal place. ${n1} rounded both numbers to one decimal place first and got ${num(early, 1)}. ${n2} multiplied first, then rounded, and got ${num(late, 1)}. Whose answer is correct?`,
      answer: mcA(`${n2}’s answer`, [`${n1}’s answer`, 'Both answers', 'Neither answer']),
      calc: true,
      hint: 'Work out the exact product first, then round it.',
      steps: [`${num(a)} ${TIMES} ${num(b)} = ${num(r9(a * b))} ≈ ${num(late, 1)}, so ${n2} is correct.`, `Rounding first changes the numbers being multiplied, so ${n1}’s answer is less accurate. Round only at the end.`],
      meta: { t: 'early', a, b },
    })
  }
}
function smallPowers(): Question {
  const [b, e] = pick([[0.1, int(2, 6)], [0.2, 2], [0.2, 3], [0.3, 2], [0.3, 3], [0.3, 4], [0.5, 2], [0.5, 3], [0.4, 2], [0.02, 2], [0.03, 2]] as [number, number][])
  const val = r9(b ** e)
  return q({
    prompt: `Without a calculator, evaluate (${num(b)})${sup(e)}.`,
    answer: numA(val),
    hint: `Work out ${num(Math.round(b * 10 ** dpOf(b)))}${sup(e)} first, then count decimal places: the answer has ${dpOf(b) * e}.`,
    steps: [`${num(Math.round(b * 10 ** dpOf(b)))}${sup(e)} = ${num(Math.round(b * 10 ** dpOf(b)) ** e)}`, `${dpOf(b)} ${TIMES} ${e} = ${dpOf(b) * e} decimal places, so (${num(b)})${sup(e)} = ${num(val)}`],
    meta: { t: 'expr', plain: `${b}^${e}` },
  })
}
export const ex302 = (level: Level): Question => {
  if (level === 1) return pick([fracToDec, decToFrac, orderDecs, addSubDec, addSubDec, powersOf10])()
  if (level === 2) return pick([decBetween, judges, decProblems, mulDivDec, mulDivDec, equivDivision, roundDec, roundDec, whichRounds])()
  return pick([recurNotation, fracToRecurring, fracToRecurring, fromKnownRecurring, roundingRange, earlyRounding, smallPowers])()
}

// ================================================================== 3.03 Fractions

function mixedImproper(): Question {
  if (chance()) {
    const f = mixedFr(9, 12)
    const w = Math.floor(f[0] / f[1])
    return q({
      prompt: `Write ${mx(f)} as an improper fraction.`,
      answer: fracA(f[0], f[1], { improper: true }),
      hint: `Multiply the whole number by the denominator, then add the numerator: ${w} ${TIMES} ${f[1]} + ${f[0] - w * f[1]}.`,
      steps: [`${mx(f)} = ${frac(`${w} ${TIMES} ${f[1]} + ${f[0] - w * f[1]}`, f[1])} = ${frac(f[0], f[1])}`],
      meta: { t: 'frval', n: f[0], d: f[1] },
    })
  }
  const f = mixedFr(9, 12)
  return q({
    prompt: `Write ${frac(f[0], f[1])} as a mixed numeral.`,
    answer: fracA(f[0], f[1], { mixed: true }),
    hint: `Divide ${f[0]} by ${f[1]}: the whole number is how many times it goes in, and the remainder goes over ${f[1]}.`,
    steps: [`${f[0]} ${DIVIDE} ${f[1]} = ${Math.floor(f[0] / f[1])} remainder ${f[0] % f[1]}`, `${frac(f[0], f[1])} = ${mx(f)}`],
    meta: { t: 'frval', n: f[0], d: f[1] },
  })
}
function largerFrac(): Question {
  for (;;) {
    const a = properFr(12)
    const b = properFr(12)
    if (a[1] === b[1] || fVal(a) === fVal(b) || Math.abs(fVal(a) - fVal(b)) > 0.25) continue
    const L = a[1] * b[1] / gcd(a[1], b[1])
    const big1 = fVal(a) > fVal(b)
    return q({
      prompt: `Which fraction is larger: ${frac(a[0], a[1])} or ${frac(b[0], b[1])}?`,
      answer: mcFixedA([frac(a[0], a[1]), frac(b[0], b[1])], big1 ? frac(a[0], a[1]) : frac(b[0], b[1])),
      hint: 'Write both with a common denominator, then compare the numerators.',
      steps: [`${frac(a[0], a[1])} = ${frac((a[0] * L) / a[1], L)} and ${frac(b[0], b[1])} = ${frac((b[0] * L) / b[1], L)}`, `So ${big1 ? frac(a[0], a[1]) : frac(b[0], b[1])} is larger.`],
      meta: { t: 'larger', a, b },
    })
  }
}
function orderFracs(): Question {
  for (;;) {
    const fs = [properFr(12), properFr(12), properFr(12)]
    const vals = fs.map(fVal)
    if (new Set(vals).size < 3 || new Set(fs.map((f) => f[1])).size < 3) continue
    const desc = chance()
    const by = (k: (f: Fr) => number) => [...fs].sort((p, r) => (desc ? k(r) - k(p) : k(p) - k(r)))
    const fmt = (s: Fr[]) => s.map((f) => frac(f[0], f[1])).join(', ')
    const opts = [fmt(by(fVal)), fmt(by((f) => f[0])), fmt(by((f) => -f[1])), fmt(by(fVal).reverse())]
    if (new Set(opts).size < 4) continue
    return q({
      prompt: `Which list shows these fractions in <b>${desc ? 'descending' : 'ascending'}</b> order?${big(fmt(shuffle(fs)))}`,
      answer: mcA(opts[0], opts.slice(1)),
      hint: 'Write them all with a common denominator, or change each one to a decimal.',
      steps: [`As decimals: ${fs.map((f) => `${frac(f[0], f[1])} ≈ ${num(round(fVal(f), 3))}`).join(', ')}`, `${desc ? 'Descending' : 'Ascending'}: ${opts[0]}`],
      meta: { t: 'orderfrac', desc, fs },
    })
  }
}
function simplifyFrac(): Question {
  const [n, d] = properFr(12)
  const k = int(2, 12)
  return q({
    prompt: `Simplify ${frac(n * k, d * k)}.`,
    answer: fracA(n, d),
    hint: 'Divide the numerator and denominator by their highest common factor.',
    steps: [`The HCF of ${n * k} and ${d * k} is ${k * gcd(n, d)}.`, `${frac(n * k, d * k)} = ${frac(n, d)}`],
    meta: { t: 'frval', n, d, shown: [n * k, d * k] },
  })
}
function fracAddSub(): Question {
  const mixedNums = chance(0.45)
  for (;;) {
    const a: Fr = mixedNums ? mixedFr(5, 10) : properFr(12)
    const b: Fr = mixedNums ? mixedFr(4, 10) : properFr(12)
    if (a[1] === b[1]) continue
    const sub = chance()
    if (sub && fVal(a) <= fVal(b)) continue
    const res = sub ? fSub(a, b) : fAdd(a, b)
    const show2 = (f: Fr) => (mixedNums ? mx(f) : frac(f[0], f[1]))
    const L = (a[1] * b[1]) / gcd(a[1], b[1])
    return q({
      prompt: `Evaluate ${show2(a)} ${sub ? MINUS : '+'} ${show2(b)}. Give your answer in simplest form.`,
      answer: fAns(res),
      hint: mixedNums ? 'Add or subtract the whole numbers and the fractions separately (or change to improper fractions first).' : `Use a common denominator: ${L}.`,
      steps: [
        `Common denominator ${L}: ${frac((a[0] * L) / a[1], L)} ${sub ? MINUS : '+'} ${frac((b[0] * L) / b[1], L)}`,
        `= ${frac(sub ? (a[0] * L) / a[1] - (b[0] * L) / b[1] : (a[0] * L) / a[1] + (b[0] * L) / b[1], L)} = ${mx(res)}`,
      ],
      meta: { t: 'frop', a, b, op: sub ? '-' : '+' },
    })
  }
}
function fracMul(): Question {
  const kind = pick(['ff', 'wf', 'of', 'mm', 'sq'] as const)
  if (kind === 'of') {
    for (;;) {
      const f = properFr(10)
      const [unit, Q] = pick([['m', int(1, 30) * f[1]], ['L', int(1, 20) * f[1]], ['kg', int(2, 40) * f[1]], ['$', int(5, 200) * f[1]]] as [string, number][])
      const val = (Q * f[0]) / f[1]
      if (!Number.isInteger(val)) continue
      return q({
        prompt: `Find ${frac(f[0], f[1])} of ${unit === '$' ? dollars(Q) : `${num(Q)} ${unit}`}.`,
        answer: numA(val),
        prefix: unit === '$' ? '$' : undefined,
        suffix: unit === '$' ? undefined : unit,
        hint: `Divide by ${f[1]}, then multiply by ${f[0]}.`,
        steps: [`${num(Q)} ${DIVIDE} ${f[1]} = ${num(Q / f[1])}`, `${num(Q / f[1])} ${TIMES} ${f[0]} = ${num(val)}`],
        meta: { t: 'frop', a: f, b: [Q, 1], op: '*' },
      })
    }
  }
  const a: Fr = kind === 'ff' ? properFr(10) : kind === 'wf' ? [int(2, 24), 1] : mixedFr(4, 6)
  const b: Fr = kind === 'sq' ? a : kind === 'mm' ? mixedFr(4, 6) : properFr(10)
  const res = fMul(a, b)
  const sh = (f: Fr) => (f[1] === 1 ? num(f[0]) : kind === 'ff' ? frac(f[0], f[1]) : mx(f))
  return q({
    prompt: kind === 'sq' ? `Evaluate (${mx(a)})${sup(2)}. Give your answer in simplest form.` : `Evaluate ${sh(a)} ${TIMES} ${sh(b)}. Give your answer in simplest form.`,
    answer: fAns(res),
    hint: kind === 'mm' || kind === 'sq' ? 'Change mixed numerals to improper fractions first, then multiply numerators and multiply denominators.' : 'Multiply the numerators and multiply the denominators, then simplify.',
    steps: [`= ${frac(a[0], a[1])} ${TIMES} ${frac(b[0], b[1])} = ${frac(a[0] * b[0], a[1] * b[1])}`, `= ${mx(res)}`],
    meta: { t: 'frop', a, b, op: '*' },
  })
}
function fracDiv(): Question {
  const kind = pick(['ff', 'fw', 'mm'] as const)
  const a: Fr = kind === 'mm' ? mixedFr(5, 8) : properFr(10)
  const b: Fr = kind === 'fw' ? [int(2, 8), 1] : kind === 'mm' ? mixedFr(3, 8) : properFr(10)
  if (a[0] === b[0] && a[1] === b[1]) return fracDiv()
  const res = fDiv(a, b)
  const sh = (f: Fr) => (f[1] === 1 ? num(f[0]) : kind === 'mm' ? mx(f) : frac(f[0], f[1]))
  return q({
    prompt: `Evaluate ${sh(a)} ${DIVIDE} ${sh(b)}. Give your answer in simplest form.`,
    answer: fAns(res),
    hint: 'To divide by a fraction, multiply by its reciprocal (flip it). Change mixed numerals to improper fractions first.',
    steps: [`= ${frac(a[0], a[1])} ${TIMES} ${frac(b[1], b[0])} = ${frac(a[0] * b[1], a[1] * b[0])}`, `= ${mx(res)}`],
    meta: { t: 'frop', a, b, op: '/' },
  })
}
function fracBetween(): Question {
  for (;;) {
    const a = properFr(9)
    const b = properFr(9)
    if (fVal(a) >= fVal(b) || fVal(b) - fVal(a) > 0.3) continue
    const right = fr(a[0] + b[0], a[1] + b[1])
    const cands: Fr[] = [fr(a[0] * 2, a[1] * 2 + 1), fr(b[0] * 3 + 1, b[1] * 3), fr(a[0], a[1] + 1), fr(b[0] + 1, b[1] + 1), fr(a[0] + b[0], a[1] * b[1])]
    const wrong = cands.filter((c) => !(fVal(c) > fVal(a) && fVal(c) < fVal(b)) && c[1] > 1)
    const uniq = [...new Map(wrong.map((c) => [c.join('/'), c])).values()].filter((c) => c.join('/') !== right.join('/'))
    if (uniq.length < 3) continue
    return q({
      prompt: `Which fraction lies between ${frac(a[0], a[1])} and ${frac(b[0], b[1])}?`,
      answer: mcA(frac(right[0], right[1]), sample(uniq, 3).map((c) => frac(c[0], c[1]))),
      calc: true,
      hint: 'Change each fraction to a decimal (or use a common denominator) and compare.',
      steps: [`${frac(a[0], a[1])} ≈ ${num(round(fVal(a), 3))}, ${frac(b[0], b[1])} ≈ ${num(round(fVal(b), 3))}`, `${frac(right[0], right[1])} ≈ ${num(round(fVal(right), 3))}, which is between them.`],
      meta: { t: 'frbetween', a, b },
    })
  }
}
function boxFraction(): Question {
  if (chance()) {
    const d = pick([3, 4, 5, 6, 7, 8, 9])
    const k = int(2, 9)
    const right = d * k + int(1, d - 1)
    const wrong = [d * k, d * (k + 1), d * k - int(1, d - 1)]
    return q({
      prompt: `Which whole number could go in the box, so that ${frac('☐', d)} has a value between ${k} and ${k + 1}?`,
      answer: mcA(String(right), wrong.map(String)),
      hint: `${k} = ${frac(d * k, d)} and ${k + 1} = ${frac(d * (k + 1), d)}. The number must be between ${d * k} and ${d * (k + 1)}.`,
      steps: [`${k} = ${frac(d * k, d)}, ${k + 1} = ${frac(d * (k + 1), d)}`, `${right} is between ${d * k} and ${d * (k + 1)}.`],
      meta: { t: 'box', d, k, top: false },
    })
  }
  for (;;) {
    const nTop = int(20, 60)
    const k = int(2, 6)
    const lo = nTop / (k + 1)
    const hi = nTop / k
    const valid = Array.from({ length: 80 }, (_, i) => i + 1).filter((x) => x > lo && x < hi)
    const invalid = Array.from({ length: 80 }, (_, i) => i + 1).filter((x) => !(x > lo && x < hi) && Math.abs(x - (lo + hi) / 2) < (hi - lo) * 2 + 4)
    if (!valid.length || invalid.length < 3) continue
    const right = pick(valid)
    return q({
      prompt: `Which whole number could go in the box, so that ${frac(nTop, '☐')} has a value between ${k} and ${k + 1}?`,
      answer: mcA(String(right), sample(invalid, 3).map(String)),
      calc: true,
      hint: `Try each option: divide ${nTop} by it and see whether the answer is between ${k} and ${k + 1}.`,
      steps: [`${nTop} ${DIVIDE} ${right} ≈ ${num(round(nTop / right, 2))}, which is between ${k} and ${k + 1}.`],
      meta: { t: 'box', n: nTop, k, top: true },
    })
  }
}
function fracWords(): Question {
  const kind = pick(['sum', 'oranges', 'half', 'lessons', 'rest', 'carnival', 'laps'] as const)
  if (kind === 'sum') {
    for (;;) {
      const total = mixedFr(6, 8)
      const one = mixedFr(3, 8)
      if (fVal(one) >= fVal(total) || one[1] === total[1]) continue
      const other = fSub(total, one)
      return q({
        prompt: `The sum of two numbers is ${mx(total)}. One of them is ${mx(one)}. What is the other number?`,
        answer: fAns(other),
        hint: 'Subtract the number you know from the sum.',
        steps: [`${mx(total)} ${MINUS} ${mx(one)} = ${mx(other)}`],
        meta: { t: 'frop', a: total, b: one, op: '-' },
      })
    }
  }
  if (kind === 'oranges') {
    const p = int(10, 30)
    const f = pick([[3, 4], [1, 2], [2, 3], [1, 4]] as Fr[])
    return q({
      prompt: `At half-time, each of ${p} players is given ${frac(f[0], f[1])} of an orange. How many oranges is that altogether?`,
      answer: fAns(fMul([p, 1], f)),
      hint: `Multiply ${p} by ${frac(f[0], f[1])}.`,
      steps: [`${p} ${TIMES} ${frac(f[0], f[1])} = ${frac(p * f[0], f[1])} = ${mx(fMul([p, 1], f))} oranges`],
      meta: { t: 'frop', a: [p, 1], b: f, op: '*' },
    })
  }
  if (kind === 'half') {
    const h = mixedFr(7, 4)
    const f = pick([[1, 2], [2, 3], [3, 4]] as Fr[])
    const res = fMul(h, f)
    if (res[0] === res[1]) return fracWords() // not "1 hours"
    return q({
      prompt: `${pick(NAMES)} worked ${mx(h)} hours on Saturday and ${frac(f[0], f[1])} of that on Sunday. How long did they work on Sunday?`,
      answer: fAns(res),
      suffix: 'hours',
      hint: `"Of" means multiply: ${frac(f[0], f[1])} ${TIMES} ${mx(h)}.`,
      steps: [`${frac(f[0], f[1])} ${TIMES} ${frac(h[0], h[1])} = ${mx(res)} hours`],
      meta: { t: 'frop', a: h, b: f, op: '*' },
    })
  }
  if (kind === 'lessons') {
    for (;;) {
      const total = int(10, 40)
      const each: Fr = pick([[3, 2], [5, 4], [4, 3], [5, 2], [7, 4]])
      const exact = fDiv([total, 1], each)
      const need = Math.ceil(fVal(exact))
      if (exact[1] === 1) continue
      return q({
        prompt: `A first-aid course needs ${total} hours of classes. Each class lasts ${mx(each)} hours. How many classes are needed? (A class can’t be split.)`,
        answer: numA(need),
        hint: `Divide ${total} by ${mx(each)}. If the answer isn’t whole, one more class is needed.`,
        steps: [`${total} ${DIVIDE} ${mx(each)} = ${total} ${TIMES} ${frac(each[1], each[0])} = ${mx(exact)}`, `${mx(exact)} classes is not enough, so ${need} classes are needed.`],
        meta: { t: 'lessons', total, each },
      })
    }
  }
  if (kind === 'rest') {
    for (;;) {
      const parts: Fr[] = [pick([[1, 3], [1, 4], [1, 6], [1, 2]]), pick([[5, 12], [1, 3], [3, 8], [1, 4]]), pick([[1, 8], [1, 12], [1, 24], [1, 6]])]
      const rest = fSub([1, 1], parts.reduce((s, f) => fAdd(s, f), [0, 1] as Fr))
      if (rest[0] <= 0) continue
      return q({
        prompt: `${pick(NAMES)} spent ${frac(parts[0][0], parts[0][1])} of a day at school, ${frac(parts[1][0], parts[1][1])} of the day sleeping and ${frac(parts[2][0], parts[2][1])} of the day travelling. They spent the rest of the day relaxing. What fraction of the day was that?`,
        answer: fAns(rest),
        hint: 'Add the three fractions, then subtract the total from 1 whole day.',
        steps: [`${parts.map((f) => frac(f[0], f[1])).join(' + ')} = ${frac(fSub([1, 1], rest)[0], fSub([1, 1], rest)[1])}`, `1 ${MINUS} ${frac(fSub([1, 1], rest)[0], fSub([1, 1], rest)[1])} = ${frac(rest[0], rest[1])}`],
        meta: { t: 'rest', parts },
      })
    }
  }
  if (kind === 'carnival') {
    const f = properFr(9, 3)
    const total = f[1] * int(40, 160)
    const val = (total * f[0]) / f[1]
    return q({
      prompt: `${frac(f[0], f[1])} of the ${num(total)} students at a school went to the athletics carnival. How many students went?`,
      answer: numA(val),
      hint: `Find ${frac(f[0], f[1])} of ${num(total)}: divide by ${f[1]}, then multiply by ${f[0]}.`,
      steps: [`${num(total)} ${DIVIDE} ${f[1]} ${TIMES} ${f[0]} = ${num(val)} students`],
      meta: { t: 'frop', a: f, b: [total, 1], op: '*' },
    })
  }
  let laps: Fr
  let mins: number
  let res: Fr
  do {
    laps = mixedFr(5, 4)
    mins = int(12, 30)
    res = fDiv([mins, 1], laps)
  } while (res[1] === 1)
  return q({
    prompt: `${pick(NAMES)} ran ${mx(laps)} laps of an oval in ${mins} minutes, at a steady pace. How long did each lap take? Give your answer as a mixed numeral (minutes).`,
    answer: fracA(res[0], res[1], { mixed: true }),
    suffix: 'minutes',
    hint: `Divide ${mins} by ${mx(laps)}.`,
    steps: [`${mins} ${DIVIDE} ${mx(laps)} = ${mins} ${TIMES} ${frac(laps[1], laps[0])} = ${mx(res)} minutes`],
    meta: { t: 'frop', a: [mins, 1], b: laps, op: '/' },
  })
}
export const ex303 = (level: Level): Question => {
  if (level === 1) return pick([mixedImproper, mixedImproper, largerFrac, orderFracs, simplifyFrac])()
  if (level === 2) return pick([fracAddSub, fracAddSub, fracMul, fracMul, fracDiv])()
  return pick([fracBetween, boxFraction, fracWords, fracWords, fracWords])()
}

// ================================================================== 3.04 Percentages

/** a percentage as a fraction of 100: whole, decimal or mixed */
function randomPct(): { p: Fr; html: string } {
  const kind = pick(['whole', 'whole', 'dec', 'mixed'] as const)
  if (kind === 'whole') {
    const p = pick([2, 5, 6, 8, 12, 15, 24, 35, 45, 51, 64, 72, 84, 96, 125, 150, 175, 30, 40, 85])
    return { p: [p, 1], html: `${p}%` }
  }
  if (kind === 'dec') {
    const p = pick([0.5, 0.2, 0.4, 1.5, 2.5, 4.75, 5.5, 6.25, 8.2, 12.5, 3.75, 0.8])
    const [n, d] = fr(Math.round(p * 100), 100)
    return { p: [n, d], html: `${num(p)}%` }
  }
  const f = pick([[9, 2], [35, 4], [100, 3], [25, 2], [50, 3], [200, 3], [11, 2], [21, 4], [37, 2], [200, 9]] as Fr[])
  return { p: f, html: `${mx(f)}%` }
}
function pctToFrac(): Question {
  const { p, html } = randomPct()
  const res = fr(p[0], p[1] * 100)
  return q({
    prompt: `Write ${html} as a fraction in simplest form.`,
    answer: fAns(res),
    hint: p[1] === 1 ? 'Write it over 100, then simplify.' : `Write it over 100, then multiply top and bottom to clear the ${p[1] === 2 || p[1] === 4 || p[1] === 3 || p[1] === 9 ? 'fraction' : 'decimal'}.`,
    steps: [`${html} = ${frac(html.replace('%', ''), 100)}`, `= ${frac(p[0], p[1] * 100)} = ${fracS(res[0], res[1])}`],
    meta: { t: 'pct2f', p },
  })
}
function pctToDec(): Question {
  const { p, html } = randomPct()
  if (![1, 2, 4, 5, 10, 20, 25, 50, 100].includes(p[1])) return pctToDec()
  const val = r9(fVal(p) / 100)
  return q({
    prompt: `Write ${html} as a decimal.`,
    answer: numA(val),
    hint: 'Divide by 100: move the decimal point two places to the left.',
    steps: [`${html} = ${num(r9(fVal(p)))} ${DIVIDE} 100 = ${num(val)}`],
    meta: { t: 'pct2d', p },
  })
}
function toPct(): Question {
  if (chance(0.4)) {
    const x = pick([dec(int(1, 999), 3), dec(int(1, 99), 2), dec(int(101, 199), 2), dec(int(1, 9), 1), dec(int(1001, 1999), 3)])
    return q({
      prompt: `Write ${num(x)} as a percentage.`,
      answer: numA(r9(x * 100)),
      suffix: '%',
      hint: 'Multiply by 100%: move the decimal point two places to the right.',
      steps: [`${num(x)} ${TIMES} 100% = ${num(r9(x * 100))}%`],
      meta: { t: 'topct', n: Math.round(x * 1000), d: 1000 },
    })
  }
  for (;;) {
    const d = pick([4, 5, 8, 20, 25, 40, 50, 3, 6, 7, 9, 11, 12, 15])
    const n = int(1, chance(0.2) ? 2 * d : d - 1)
    if (gcd(n, d) !== 1 || n % d === 0) continue
    const val = (n / d) * 100
    const terminating = Number.isInteger(r9(val * 100))
    if (!terminating && !clear(val, 1)) continue
    return q({
      prompt: `Write ${n > d ? mx([n, d]) : frac(n, d)} as a percentage${terminating ? '' : `, ${DPW[1]}`}.`,
      answer: terminating ? numA(r9(val)) : numA(val, 1),
      suffix: '%',
      calc: !terminating,
      hint: 'Multiply by 100%.',
      steps: [`${frac(n, d)} ${TIMES} 100% = ${frac(n * 100, d)}% = ${terminating ? num(r9(val)) : `${cut(val)} ≈ ${num(round(val, 1), 1)}`}%`],
      meta: { t: 'topct', n, d },
    })
  }
}
type Mixed3 = { v: number; html: string; inline?: string }
function randomForm(): Mixed3 {
  const k = pick(['pct', 'frac', 'dec'] as const)
  if (k === 'pct') {
    const p = pick([dec(int(10, 990), 1), int(5, 95)])
    return { v: p / 100, html: `${num(p)}%` }
  }
  if (k === 'frac') {
    const f = properFr(12, 3)
    return { v: fVal(f), html: frac(f[0], f[1]), inline: `${f[0]}/${f[1]}` }
  }
  const x = dec(int(5, 995), 3)
  return { v: x, html: num(x) }
}
function pctTrueFalse(): Question {
  for (;;) {
    const a = randomForm()
    const b = randomForm()
    if (Math.abs(a.v - b.v) < 0.004 || Math.abs(a.v - b.v) > 0.12) continue
    const sign = chance() ? '&gt;' : '&lt;'
    const truth = sign === '&gt;' ? a.v > b.v : a.v < b.v
    return q({
      prompt: `Is this statement true or false?${big(`${a.html} ${sign} ${b.html}`)}`,
      answer: mcFixedA(['True', 'False'], truth ? 'True' : 'False'),
      calc: true,
      hint: 'Change both to percentages (or both to decimals), then compare.',
      steps: [`${a.html} = ${num(round(a.v * 100, 2))}%, ${b.html} = ${num(round(b.v * 100, 2))}%`, truth ? 'So the statement is true.' : 'So the statement is false.'],
      meta: { t: 'tf', a: a.v, b: b.v, gt: sign === '&gt;' },
    })
  }
}
function orderForms(): Question {
  for (;;) {
    const xs = [randomForm(), randomForm(), randomForm(), randomForm()]
    const vs = xs.map((x) => x.v)
    if (new Set(vs.map((x) => round(x, 4))).size < 4 || Math.max(...vs) - Math.min(...vs) > 0.5) continue
    const asc = chance()
    const sorted = [...xs].sort((p, r) => (asc ? p.v - r.v : r.v - p.v))
    const fmt = (s: Mixed3[]) => s.map((x) => x.html).join(', ')
    // in the choices, fractions are written on one line (3/7) so each choice stays one line tall
    const fmtLine = (s: Mixed3[]) => s.map((x) => x.inline ?? x.html).join(', ')
    const byShown = [...xs].sort((p, r) => (asc ? 1 : -1) * (Number(p.html.replace(/<[^>]*>/g, '').replace('%', '')) - Number(r.html.replace(/<[^>]*>/g, '').replace('%', ''))))
    const opts = [fmtLine(sorted), fmtLine([...sorted].reverse()), fmtLine(byShown), fmtLine([sorted[1], sorted[0], sorted[2], sorted[3]])]
    if (new Set(opts).size < 4) continue
    return q({
      prompt: `Which list shows these numbers in <b>${asc ? 'ascending' : 'descending'}</b> order?${big(fmt(shuffle(xs)))}`,
      answer: mcA(opts[0], opts.slice(1)),
      calc: true,
      hint: 'Write every number as a percentage (or as a decimal), then compare.',
      steps: [`As percentages: ${xs.map((x) => `${x.html} = ${num(round(x.v * 100, 2))}%`).join(', ')}`],
      meta: { t: 'orderforms', asc, vs },
    })
  }
}
function pctOfQuantity(): Question {
  for (;;) {
    const { p, html } = randomPct()
    if (fVal(p) > 200) continue
    const [unit, Q] = pick([['$', int(20, 9000)], ['kg', int(10, 400)], ['m', int(4, 200)], ['L', int(2, 120)], ['t', int(5, 80)]] as [string, number][])
    const val = (Q * fVal(p)) / 100
    const money2 = unit === '$'
    if (!money2 && dpOf(r9(val)) > 3) continue
    return q({
      prompt: `Find ${html} of ${money2 ? dollars(Q) : `${num(Q)} ${unit}`}.${money2 && dpOf(r9(val)) > 2 ? ' Give your answer to the nearest cent.' : ''}`,
      answer: money2 ? numA(val, 2) : numA(r9(val)),
      prefix: money2 ? '$' : undefined,
      suffix: money2 ? undefined : unit,
      calc: true,
      hint: `Change ${html} to a decimal (or a fraction), then multiply.`,
      steps: [`${html} of ${money2 ? dollars(Q) : num(Q)} = ${num(r9(fVal(p) / 100))} ${TIMES} ${num(Q)} = ${money2 ? money(val) : `${num(r9(val))} ${unit}`}`],
      meta: { t: 'pctof', p, Q, money: money2 },
    })
  }
}
function pctProblems(): Question {
  const kind = pick(['crowd', 'school', 'extra', 'weight'] as const)
  if (kind === 'crowd') {
    const total = int(30, 90) * 1000 + int(0, 9) * 100
    const p = int(55, 80)
    const other = 100 - p
    const ask = chance() ? 'pct' : 'count'
    return q({
      prompt: `${num(total)} people watched a football final. ${p}% of the crowd supported the home team and the rest supported the visitors. ${ask === 'pct' ? 'What percentage supported the visitors?' : 'How many people supported the visitors?'}`,
      answer: numA(ask === 'pct' ? other : (total * other) / 100),
      suffix: ask === 'pct' ? '%' : 'people',
      calc: ask === 'count',
      hint: `The visitors had 100% ${MINUS} ${p}% = ${other}% of the crowd.`,
      steps: [`100% ${MINUS} ${p}% = ${other}%`, ...(ask === 'count' ? [`${other}% of ${num(total)} = ${num((total * other) / 100)} people`] : [])],
      meta: { t: 'crowd', total, p, ask },
    })
  }
  if (kind === 'school') {
    const p = pick([10, 15, 20, 24, 25, 30, 35, 40])
    const total = (100 / gcd(p, 100)) * int(4, 20)
    return q({
      prompt: `A school has ${num(total)} students and ${p}% of them are in Year 9. How many Year 9 students are there?`,
      answer: numA((total * p) / 100),
      suffix: 'students',
      calc: true,
      hint: `Find ${p}% of ${num(total)}.`,
      steps: [`${num(p / 100)} ${TIMES} ${num(total)} = ${num((total * p) / 100)}`],
      meta: { t: 'pctof', p: [p, 1], Q: total, money: false },
    })
  }
  if (kind === 'extra') {
    const p = pick([10, 20, 25, 30, 40, 50])
    const g = int(2, 20) * 50
    return q({
      prompt: `A jar of coffee normally holds ${g} g. A special jar has ${p}% extra for the same price. How much extra coffee is that?`,
      answer: numA((g * p) / 100),
      suffix: 'g',
      hint: `Find ${p}% of ${g} g.`,
      steps: [`${p}% of ${g} = ${num((g * p) / 100)} g extra`],
      meta: { t: 'pctof', p: [p, 1], Q: g, money: false },
    })
  }
  const p = pick([105, 110, 112, 115, 120, 125, 90, 95, 85, 80])
  const w = int(30, 90)
  return q({
    prompt: `${pick(NAMES)}’s dog now weighs ${p}% of what it weighed a year ago. A year ago it weighed ${w} kg. What does it weigh now?`,
    answer: numA(r9((w * p) / 100)),
    suffix: 'kg',
    calc: true,
    hint: `Find ${p}% of ${w} kg.`,
    steps: [`${num(p / 100)} ${TIMES} ${w} = ${num(r9((w * p) / 100))} kg`],
    meta: { t: 'pctof', p: [p, 1], Q: w, money: false },
  })
}
export const ex304 = (level: Level): Question => {
  if (level === 1) return pick([pctToFrac, pctToFrac, pctToDec, toPct, toPct])()
  if (level === 2) return pick([pctTrueFalse, orderForms, pctOfQuantity, pctOfQuantity])()
  return pctProblems()
}

// ================================================================== 3.05 Applying percentages

/** a money answer: exact if it is a whole number of cents, otherwise to the nearest cent (and the question says so) */
const centsNote = (x: number) => (dpOf(r9(x)) > 2 ? ' Give your answer to the nearest cent.' : '')
const moneyA = (x: number): Answer => numA(x, 2)
function incDecBy(): Question {
  const up = chance()
  const p = pick(up ? [10, 15.5, 200, 2.5, 30, 140, 8, 12.5, 25, 60] : [35, 5, 12, 25, 18, 10, 40, 7.5, 15, 22])
  const isMoney = chance(0.55)
  const unit = isMoney ? '$' : pick(['kg', 'm', 'L', 'min', 'g'])
  const Q = isMoney ? pick([int(20, 990), dec(int(1000, 99999), 2)]) : pick([int(20, 900), dec(int(20, 999), 1)])
  const change = (Q * p) / 100
  const val = up ? Q + change : Q - change
  if (!isMoney && dpOf(r9(val)) > 3) return incDecBy()
  const show2 = (x: number) => (isMoney ? money(x) : `${num(r9(x))} ${unit}`)
  return q({
    prompt: `${up ? 'Increase' : 'Decrease'} ${isMoney ? dollars(Q) : `${num(Q)} ${unit}`} by ${num(p)}%.${isMoney ? centsNote(val) : ''}`,
    answer: isMoney ? moneyA(val) : numA(r9(val)),
    prefix: isMoney ? '$' : undefined,
    suffix: isMoney ? undefined : unit,
    calc: true,
    hint: `Find ${num(p)}% of the amount and ${up ? 'add it' : 'subtract it'}, or multiply by ${num(r9(1 + (up ? p : -p) / 100))} (${num(r9(100 + (up ? p : -p)))}%).`,
    steps: [`${num(p)}% of ${show2(Q)} = ${show2(change)}`, `${show2(Q)} ${up ? '+' : MINUS} ${show2(change)} = ${show2(val)}`],
    meta: { t: 'incdec', Q, p, up, money: isMoney },
  })
}
function pctEveryday(): Question {
  const kind = pick(['profit', 'sale', 'rise', 'wage'] as const)
  const nm = pick(NAMES)
  if (kind === 'profit') {
    const C = int(20, 200) * 10
    const p = int(3, 30)
    const ask = chance() ? 'profit' : 'price'
    const prof = (C * p) / 100
    return q({
      prompt: `${nm} buys a second-hand bike for ${dollars(C)} and sells it, making a profit of ${p}%. ${ask === 'profit' ? 'How much profit did they make?' : 'What was the selling price?'}`,
      answer: moneyA(ask === 'profit' ? prof : C + prof),
      prefix: '$',
      calc: true,
      hint: `The profit is ${p}% of the price paid.`,
      steps: [`Profit = ${p}% of ${dollars(C)} = ${money(prof)}`, ...(ask === 'price' ? [`Selling price = ${dollars(C)} + ${money(prof)} = ${money(C + prof)}`] : [])],
      meta: { t: 'incdec', Q: C, p, up: true, money: true, ask },
    })
  }
  const P = kind === 'wage' ? dec(int(60000, 140000), 2) : kind === 'rise' ? dec(int(150, 999), 2) : dec(int(1500, 9999), 2)
  const p = kind === 'wage' ? pick([2.5, 3, 3.5, 4.5, 5.5, 6]) : kind === 'rise' ? int(5, 45) : pick([20, 25, 30, 35, 40, 45, 50])
  const up = kind !== 'sale'
  const val = P * (1 + (up ? p : -p) / 100)
  const what =
    kind === 'sale'
      ? `T-shirts priced at ${money(P)} are reduced by ${p}% in a sale. What is the sale price?`
      : kind === 'rise'
        ? `After a storm, the price of tomatoes rose by ${p}%. What is the new price per kilogram if the old price was ${money(P)}/kg?`
        : `${nm}’s weekly wage of ${money(P)} increases by ${num(p)}%. What is their new weekly wage?`
  return q({
    prompt: what + centsNote(val),
    answer: moneyA(val),
    prefix: '$',
    calc: true,
    hint: up ? `Multiply by ${num(r9(1 + p / 100))} (${num(r9(100 + p))}%).` : `Multiply by ${num(r9(1 - p / 100))} (${100 - p}%).`,
    steps: [`${money(P)} ${TIMES} ${num(r9(1 + (up ? p : -p) / 100))} = ${cut(val, 4)}`, `≈ ${money(val)}`],
    meta: { t: 'incdec', Q: P, p, up, money: true },
  })
}
const UNIT_PAIRS: [string, string, number][] = [
  ['s', 'min', 60], ['min', 'h', 60], ['mm', 'm', 1000], ['h', 'day', 24], ['cm', 'm', 100], ['c', '$', 100], ['g', 'kg', 1000], ['mL', 'L', 1000],
]
function expressPct(): Question {
  for (;;) {
    let part: number
    let whole: number
    let words: string
    let partBase: number
    let wholeBase: number
    if (chance(0.4)) {
      whole = int(12, 120)
      part = int(1, whole - 1)
      partBase = part
      wholeBase = whole
      words = pick([`${part} out of ${whole}`, `$${part} out of $${whole}`])
    } else {
      const [small, large, f] = pick(UNIT_PAIRS)
      whole = int(1, 6)
      wholeBase = whole * f
      part = int(1, wholeBase - 1)
      if (part % (f / (f >= 100 ? 10 : 1)) === 0 && chance(0.5)) continue
      partBase = part
      const sh = (v0: number, u: string) => (u === '$' ? `$${v0}` : u === 'c' ? `${v0}c` : `${v0} ${u}${u === 'day' && v0 > 1 ? 's' : ''}`)
      words = `${sh(part, small)} out of ${sh(whole, large)}`
    }
    const val = (partBase / wholeBase) * 100
    const exact = Number.isInteger(r9(val * 10))
    if (!exact && !clear(val, 1)) continue
    return q({
      prompt: `Write ${words} as a percentage, correct to one decimal place where necessary.`,
      answer: exact ? numA(r9(val)) : numA(val, 1),
      suffix: '%',
      calc: true,
      hint: 'Use the same units for both amounts, then work out (amount ÷ whole) × 100%.',
      steps: [`${frac(num(partBase), num(wholeBase))} ${TIMES} 100% = ${exact ? num(r9(val)) : `${cut(val)} ≈ ${num(round(val, 1), 1)}`}%`],
      meta: { t: 'express', part: partBase, whole: wholeBase },
    })
  }
}
function compareMarks(): Question {
  for (;;) {
    const b = pick([20, 25, 30, 40, 50, 60, 80])
    const d = pick([20, 25, 30, 40, 50, 60, 80])
    const a = int(Math.ceil(b * 0.5), b - 1)
    const c = int(Math.ceil(d * 0.5), d - 1)
    if (b === d || Math.abs(a / b - c / d) < 0.005) continue
    const [s1, s2] = sample(['English', 'Mathematics', 'Science', 'History', 'Geography', 'Music'], 2)
    return q({
      prompt: `${pick(NAMES)} scored ${a} out of ${b} in ${s1} and ${c} out of ${d} in ${s2}. Which is the better result?`,
      answer: mcFixedA([s1, s2], a / b > c / d ? s1 : s2),
      calc: true,
      hint: 'Change both marks to percentages.',
      steps: [`${s1}: ${frac(a, b)} ${TIMES} 100% = ${num(round((a / b) * 100, 1))}%`, `${s2}: ${frac(c, d)} ${TIMES} 100% = ${num(round((c / d) * 100, 1))}%`],
      meta: { t: 'marks', a, b, c, d, s1 },
    })
  }
}
function pctOfIncome(): Question {
  for (;;) {
    const W = int(30, 120) * 10
    const part = int(5, Math.floor(W * 0.45))
    const val = (part / W) * 100
    if (!clear(val, 1)) continue
    const what = pick(['rent', 'petrol', 'groceries', 'savings'])
    return q({
      prompt: `${pick(NAMES)} earns ${dollars(W)} a week and spends ${dollars(part)} of it on ${what}. What percentage of their wage is this, ${DPW[1]}?`,
      answer: numA(val, 1),
      suffix: '%',
      calc: true,
      hint: `Work out ${frac(part, W)} ${TIMES} 100%.`,
      steps: [`${frac(part, W)} ${TIMES} 100% = ${cut(val)} ≈ ${num(round(val, 1), 1)}%`],
      meta: { t: 'express', part, whole: W },
    })
  }
}
function unitaryPct(): Question {
  const kind = pick(['goals', 'ring', 'can', 'tax'] as const)
  if (kind === 'goals') {
    for (;;) {
      const W = int(30, 70)
      const g = int(8, Math.floor(W / 2))
      const p = round((g / W) * 100, 1)
      if (Math.round(g / (p / 100)) !== W) continue
      return q({
        prompt: `A netball team scored ${g} goals in the second quarter of a final. This was ${num(p, 1)}% of all their goals in the match. How many goals did they score in the match? (The percentage was rounded, so give your answer to the nearest whole number.)`,
        answer: numA(g / (p / 100), 0),
        suffix: 'goals',
        calc: true,
        hint: `Unitary method: find 1% (divide by ${num(p, 1)}), then 100%.`,
        steps: [`1% = ${g} ${DIVIDE} ${num(p, 1)} = ${cut(g / p)}`, `100% = ${cut(g / p)} ${TIMES} 100 = ${cut((g / p) * 100)} ≈ ${W} goals`],
        meta: { t: 'unitary', part: g, p, dp: 0 },
      })
    }
  }
  if (kind === 'ring') {
    const p = pick([1.25, 1.5, 2, 2.5, 0.75])
    const fee = int(40, 300)
    const val = fee / (p / 100)
    return q({
      prompt: `A jeweller charges ${dollars(fee)} to value a ring. This charge is ${num(p)}% of the ring’s value. What is the ring worth, to the nearest dollar?`,
      answer: numA(val, 0),
      prefix: '$',
      calc: true,
      hint: `${num(p)}% of the value is ${dollars(fee)}. Find 1%, then multiply by 100.`,
      steps: [`1% = ${dollars(fee)} ${DIVIDE} ${num(p)} = ${cut(fee / p)}`, `100% = ${cut(val)} ≈ $${num(round(val, 0))}`],
      meta: { t: 'unitary', part: fee, p, dp: 0 },
    })
  }
  if (kind === 'can') {
    const p = pick([10, 20, 25, 30, 40, 50])
    const extra = int(3, 30) * 10
    const val = extra / (p / 100)
    return q({
      prompt: `A can of drink holds ${p}% more than the standard can, for the same price. The extra amount is ${extra} mL. How much does the standard can hold?`,
      answer: numA(r9(val)),
      suffix: 'mL',
      hint: `${p}% of the standard can is ${extra} mL.`,
      steps: [`1% = ${extra} ${DIVIDE} ${p} = ${num(r9(extra / p))} mL`, `100% = ${num(r9(val))} mL`],
      meta: { t: 'unitary', part: extra, p },
    })
  }
  const p = int(18, 35)
  const tax = dec(int(800000, 4000000), 2)
  const val = tax / (p / 100)
  return q({
    prompt: `Last year ${pick(NAMES)} paid ${p}% of their salary in tax. The tax was ${money(tax)}. What was their salary, to the nearest dollar?`,
    answer: numA(val, 0),
    prefix: '$',
    calc: true,
    hint: `${p}% of the salary is ${money(tax)}. Find 1%, then 100%.`,
    steps: [`1% = ${money(tax)} ${DIVIDE} ${p} = ${cut(tax / p)}`, `100% = ${cut(val)} ≈ $${num(round(val, 0))}`],
    meta: { t: 'unitary', part: tax, p, dp: 0 },
  })
}
function successive(): Question {
  const p = pick([10, 20, 5, 25, 30, 50])
  const upFirst = chance()
  const change = (p * p) / 100
  return q({
    prompt: `An amount is ${upFirst ? 'increased' : 'decreased'} by ${p}% and then ${upFirst ? 'decreased' : 'increased'} by ${p}%. What is the overall change?`,
    answer: mcA(`a decrease of ${num(change)}%`, ['no change', `an increase of ${num(change)}%`, `a decrease of ${num(2 * p)}%`]),
    calc: true,
    hint: 'Try it on $100.',
    steps: [`$100 ${upFirst ? '+' : MINUS} ${p}% = $${num(100 + (upFirst ? p : -p))}`, `$${num(100 + (upFirst ? p : -p))} ${upFirst ? MINUS : '+'} ${p}% = $${num(r9((100 + (upFirst ? p : -p)) * (1 + (upFirst ? -p : p) / 100)))}`, `That is ${num(change)}% less than $100.`],
    meta: { t: 'successive', p },
  })
}
export const ex305 = (level: Level): Question => {
  if (level === 1) return pick([incDecBy, incDecBy, pctEveryday])()
  if (level === 2) return pick([expressPct, expressPct, compareMarks, pctOfIncome])()
  return pick([unitaryPct, unitaryPct, unitaryPct, successive])()
}

// ================================================================== 3.06 Profit, discounts and GST

/** things to buy and sell, with a realistic price range in dollars */
const ITEMS: [string, number, number][] = [
  ['home theatre system', 600, 4000], ['motorbike', 4000, 20000], ['used car', 3000, 30000], ['surfboard', 300, 1200], ['laptop', 600, 3000],
  ['lounge suite', 1000, 6000], ['mountain bike', 400, 3000], ['drone', 150, 1500], ['guitar', 200, 2500], ['fridge', 600, 3000], ['house', 450000, 1500000],
]
const SMALL: [string, number, number][] = [
  ['a block of butter', 2, 8], ['a bag of rice', 3, 25], ['a book', 12, 45], ['a pair of jeans', 40, 160], ['a box of tissues', 2, 9], ['a phone case', 15, 60], ['a pack of soft drink', 8, 25], ['a kilogram of cheese', 9, 30],
]
/** a price in a range: whole dollars for big items, dollars and cents for small ones */
const priceIn = (lo: number, hi: number) => (hi > 2000 ? Math.round(int(lo, hi) / 10) * 10 : hi > 200 ? int(lo, hi) : dec(int(lo * 100, hi * 100), 2))
function profitLoss(): Question {
  const [item, lo, hi] = pick(ITEMS)
  if (chance(0.3)) {
    const [old, b0, b1] = pick([['car', 2000, 9000], ['motorbike', 1500, 6000], ['boat', 3000, 12000], ['caravan', 4000, 15000]] as [string, number, number][])
    const B = Math.round(int(b0, b1) / 100) * 100
    const R = int(3, 30) * 50
    const S = B + R + int(-10, 40) * 100
    const ask = pick(['spent', 'result', 'pct'] as const)
    const res = S - (B + R)
    if (res === 0) return profitLoss()
    const pct = (Math.abs(res) / (B + R)) * 100
    if (ask === 'pct' && !clear(pct, 1)) return profitLoss()
    return q({
      prompt: `${pick(NAMES)} bought an old ${old} for ${dollars(B)}, spent ${dollars(R)} on repairs and then sold it for ${dollars(S)}. ${ask === 'spent' ? 'How much did they spend altogether?' : ask === 'result' ? `How much ${res > 0 ? 'profit' : 'loss'} did they make?` : `What was the percentage ${res > 0 ? 'profit' : 'loss'} on the total cost, ${DPW[1]}?`}`,
      answer: ask === 'pct' ? numA(pct, 1) : numA(ask === 'spent' ? B + R : Math.abs(res)),
      prefix: ask === 'pct' ? undefined : '$',
      suffix: ask === 'pct' ? '%' : undefined,
      calc: true,
      hint: 'The cost price is everything spent: the price paid plus the repairs.',
      steps: [`Cost = ${dollars(B)} + ${dollars(R)} = ${dollars(B + R)}`, `${res > 0 ? 'Profit' : 'Loss'} = ${dollars(Math.abs(res))}`, ...(ask === 'pct' ? [`${frac(dollars(Math.abs(res)), dollars(B + R))} ${TIMES} 100% = ${cut(pct)} ≈ ${num(round(pct, 1), 1)}%`] : [])],
      meta: { t: 'profit', C: B + R, S, ask: ask === 'spent' ? 'cost' : ask === 'result' ? 'amount' : 'pct' },
    })
  }
  for (;;) {
    const C = Math.round(priceIn(lo, hi))
    const S = Math.round(C * (1 + int(-30, 90) / 100))
    if (S === C) continue
    const pct = (Math.abs(S - C) / C) * 100
    if (!clear(pct, 1)) continue
    const ask = chance() ? 'amount' : 'pct'
    const word = S > C ? 'profit' : 'loss'
    return q({
      prompt: `A ${item} with a cost price of ${dollars(C)} is sold for ${dollars(S)}. Find the ${ask === 'pct' ? `percentage ${word} on the cost price, ${DPW[1]}` : word}.`,
      answer: ask === 'pct' ? numA(pct, 1) : numA(Math.abs(S - C)),
      prefix: ask === 'pct' ? undefined : '$',
      suffix: ask === 'pct' ? '%' : undefined,
      calc: true,
      hint: ask === 'pct' ? `Percentage ${word} = ${word} ÷ cost price × 100%.` : `${word === 'profit' ? 'Selling price − cost price' : 'Cost price − selling price'}.`,
      steps: [`${word[0].toUpperCase() + word.slice(1)} = ${dollars(Math.max(S, C))} ${MINUS} ${dollars(Math.min(S, C))} = ${dollars(Math.abs(S - C))}`, ...(ask === 'pct' ? [`${frac(dollars(Math.abs(S - C)), dollars(C))} ${TIMES} 100% = ${cut(pct)}${Number.isInteger(r9(pct * 10)) ? '' : ` ≈ ${num(round(pct, 1), 1)}`}%`] : [])],
      meta: { t: 'profit', C, S, ask },
    })
  }
}
function discountPrice(): Question {
  const [thing, lo, hi] = pick(SMALL)
  const P = priceIn(lo, hi)
  const p = pick([10, 15, 20, 25, 30, 35, 40, 45, 50])
  const val = P * (1 - p / 100)
  return q({
    prompt: `In a sale, all prices are reduced by ${p}%. Find the sale price of ${thing} marked at ${dollars(P)}.${centsNote(val)}`,
    answer: moneyA(val),
    prefix: '$',
    calc: true,
    hint: `Sale price = ${100 - p}% of the marked price.`,
    steps: [`${100 - p}% of ${dollars(P)} = ${num(r9(1 - p / 100))} ${TIMES} ${num(P)} = ${cut(val)} ≈ ${money(val)}`],
    meta: { t: 'incdec', Q: P, p, up: false, money: true },
  })
}
function discountMC(): Question {
  const [item, lo, hi] = pick(ITEMS.filter((i) => i[2] <= 6000))
  const P = Math.round(int(lo, hi) / 5) * 5
  const p = pick([10, 15, 20, 25, 30, 35])
  const sale = (P * (100 - p)) / 100
  const disc = (P * p) / 100
  const o = [money(sale), money(disc), money(P - p), money(P * (1 - p / 1000))]
  if (new Set(o).size < 4) return discountMC()
  return q({
    prompt: `A ${item} marked at ${dollars(P)} is discounted by ${p}%. What is the selling price?`,
    answer: mcA(o[0], o.slice(1)),
    calc: true,
    hint: 'Find the discount and subtract it, or find (100 − discount)% of the price.',
    steps: [`Discount = ${p}% of ${dollars(P)} = ${money(disc)}`, `Selling price = ${dollars(P)} ${MINUS} ${money(disc)} = ${money(sale)}`],
    meta: { t: 'incdec', Q: P, p, up: false, money: true, mc: true },
  })
}
function pctDiscount(): Question {
  for (;;) {
    const [item, lo, hi] = pick(ITEMS.filter((i) => i[2] <= 6000))
    const O = priceIn(lo, hi)
    const S = round(O * (1 - int(10, 60) / 100) + (chance() ? 0 : int(-50, 50) / 100), 2)
    const pct = ((O - S) / O) * 100
    if (S <= 0 || S >= O || !clear(pct, 1)) continue
    return q({
      prompt: `The price of a ${item} is reduced from ${dollars(O)} to ${dollars(S)}. What is the percentage discount, ${DPW[1]}?`,
      answer: numA(pct, 1),
      suffix: '%',
      calc: true,
      hint: 'Percentage discount = discount ÷ original price × 100%.',
      steps: [`Discount = ${dollars(O)} ${MINUS} ${dollars(S)} = ${money(O - S)}`, `${frac(money(O - S), dollars(O))} ${TIMES} 100% = ${cut(pct)}%`],
      meta: { t: 'pctdisc', O, S },
    })
  }
}
function originalPrice(): Question {
  for (;;) {
    const p = pick([10, 15, 20, 25, 30, 40, 45, 60])
    const exact = chance()
    const [item, lo, hi] = pick(ITEMS.filter((i) => i[2] <= 6000))
    const O = exact ? Math.round(int(lo, hi) / 5) * 5 : int(lo, hi)
    const S = exact ? (O * (100 - p)) / 100 : Math.round((O * (100 - p)) / 100)
    if (!Number.isInteger(r9(S * 100))) continue
    const val = S / (1 - p / 100)
    if (!exact && !clear(val, 0)) continue
    return q({
      prompt: `After a ${p}% discount, a ${item} sells for ${dollars(S)}. What was its original price${exact ? '' : ', to the nearest dollar'}?`,
      answer: exact ? numA(r9(val)) : numA(val, 0),
      prefix: '$',
      calc: true,
      hint: `The sale price is ${100 - p}% of the original. Unitary method: find 1%, then 100%.`,
      steps: [`${100 - p}% = ${dollars(S)}`, `1% = ${dollars(S)} ${DIVIDE} ${100 - p} = ${cut(S / (100 - p))}`, `100% = ${cut(val)}${exact ? '' : ` ≈ $${num(round(val, 0))}`}`],
      meta: { t: 'original', S, p, dp: exact ? null : 0 },
    })
  }
}
function costFromProfit(): Question {
  const C = int(20, 300)
  const p = pick([20, 25, 30, 40, 50, 60, 75, 85])
  const S = (C * (100 + p)) / 100
  const o = [dollars(C), money(S * (1 - p / 100)), dollars(r9(S - p)), money(S / (p / 100))]
  if (new Set(o).size < 4) return costFromProfit()
  return q({
    prompt: `Running shoes are sold at a profit of ${p}% on the cost price. They sell for ${money(S)}. What was the cost price?`,
    answer: mcA(o[0], o.slice(1)),
    calc: true,
    hint: `The selling price is ${100 + p}% of the cost price.`,
    steps: [`${100 + p}% = ${money(S)}`, `1% = ${money(S)} ${DIVIDE} ${100 + p} = ${money(S / (100 + p))}`, `100% = ${dollars(C)}`],
    meta: { t: 'costfromprofit', S, p },
  })
}
function gst(): Question {
  const incl = chance(0.55)
  const thing = pick(['a haircut', 'car repairs', 'a photo frame', 'a pair of jeans', 'a fridge', 'piano lessons for a term', 'a theatre ticket', 'a plumber’s visit'])
  if (!incl) {
    const P = pick([int(20, 999), int(50, 3000) * 10, dec(int(1000, 99999), 2)])
    const ask = chance() ? 'gst' : 'final'
    const val = ask === 'gst' ? P * 0.1 : P * 1.1
    return q({
      prompt: `${thing[0].toUpperCase() + thing.slice(1)} costs ${dollars(P)} before GST. ${ask === 'gst' ? 'How much GST is payable?' : 'What is the final price, including GST?'}${centsNote(val)}`,
      answer: moneyA(val),
      prefix: '$',
      calc: true,
      hint: 'GST is 10% of the price before GST.',
      steps: [`GST = 10% of ${dollars(P)} = ${money(P * 0.1)}`, ...(ask === 'final' ? [`Final price = ${dollars(P)} + ${money(P * 0.1)} = ${money(P * 1.1)}`] : [])],
      meta: { t: 'gst', P, incl: false, ask },
    })
  }
  const S = pick([dec(int(1000, 99999), 2), int(20, 2000)])
  const ask = chance() ? 'gst' : 'before'
  const val = ask === 'gst' ? S / 11 : S / 1.1
  return q({
    prompt: `${thing[0].toUpperCase() + thing.slice(1)} costs ${dollars(S)}, including GST. ${ask === 'gst' ? 'How much of this is GST' : 'What was the price before GST was added'}, to the nearest cent?`,
    answer: moneyA(val),
    prefix: '$',
    calc: true,
    hint: 'The GST-inclusive price is 110% of the price before GST. So the GST is 1 part in 11: divide by 11.',
    steps: [`110% = ${dollars(S)}`, `10% (the GST) = ${dollars(S)} ${DIVIDE} 11 = ${cut(S / 11)} ≈ ${money(S / 11)}`, ...(ask === 'before' ? [`Price before GST = ${cut(S / 1.1)} ≈ ${money(S / 1.1)}`] : [])],
    meta: { t: 'gst', S, incl: true, ask },
  })
}
function successiveDiscounts(): Question {
  const P = pick([dec(int(50000, 300000), 2), int(300, 3000)])
  const d1 = pick([10, 15, 20, 25, 30])
  const d2 = pick([5, 8, 10])
  const ask = pick(['price', 'pct', 'same'] as const)
  const after = P * (1 - d1 / 100) * (1 - d2 / 100)
  const total = (1 - (1 - d1 / 100) * (1 - d2 / 100)) * 100
  if (ask === 'same')
    return q({
      prompt: `A store gives a ${d1}% discount, then a further ${d2}% off the discounted price for paying cash. Is that the same as a single discount of ${d1 + d2}%?`,
      answer: mcA(`No: it is ${num(r9(total))}% off`, [`Yes: ${d1}% + ${d2}% = ${d1 + d2}%`, `No: it is more than ${d1 + d2}% off`, 'Yes, for prices over $100']),
      calc: true,
      hint: 'The second discount is taken off a smaller price. Try it on $100.',
      steps: [`$100 ${TIMES} ${num(1 - d1 / 100)} = $${num(100 - d1)}`, `$${num(100 - d1)} ${TIMES} ${num(1 - d2 / 100)} = $${num(r9((100 - d1) * (1 - d2 / 100)))}`, `Total discount = ${num(r9(total))}%`],
      meta: { t: 'twodisc', d1, d2, ask },
    })
  const fiveCents = Math.round(after * 20) / 20
  return q({
    prompt: `A computer marked at ${dollars(P)} is discounted by ${d1}%. Paying cash gives a further ${d2}% off the discounted price. ${ask === 'price' ? 'How much is paid in cash, to the nearest 5 cents?' : `What is the total percentage discount on the original price${Number.isInteger(r9(total * 10)) ? '' : `, ${DPW[1]}`}?`}`,
    answer: ask === 'price' ? numA(r9(fiveCents)) : Number.isInteger(r9(total * 10)) ? numA(r9(total)) : numA(total, 1),
    prefix: ask === 'price' ? '$' : undefined,
    suffix: ask === 'pct' ? '%' : undefined,
    calc: true,
    hint: `Multiply by ${num(1 - d1 / 100)}, then by ${num(1 - d2 / 100)}.`,
    steps: [`${dollars(P)} ${TIMES} ${num(1 - d1 / 100)} ${TIMES} ${num(1 - d2 / 100)} = ${cut(after)}`, ask === 'price' ? `To the nearest 5 cents: ${money(fiveCents)}` : `Total discount = ${num(100)}% ${MINUS} ${num(r9((1 - d1 / 100) * (1 - d2 / 100) * 100))}% = ${num(r9(total))}%`],
    meta: { t: 'twodisc', d1, d2, P, ask },
  })
}
export const ex306 = (level: Level): Question => {
  if (level === 1) return pick([profitLoss, profitLoss, discountPrice])()
  if (level === 2) return pick([discountMC, pctDiscount, originalPrice, originalPrice, costFromProfit])()
  return pick([gst, gst, successiveDiscounts])()
}

// ================================================================== 3.07 Simple interest

const RATES = [2.4, 2.85, 3, 3.25, 3.5, 4, 4.5, 5.5, 6, 6.2, 6.45, 7, 7.3, 2.5]
const LOAN_RATES = [6.55, 7.9, 8.3, 9.5, 12.9, 14.7]
const pctTxt = (r: number) => (r === 2.5 ? `2${frac(1, 2)}%` : `${num(r)}%`)
function siYears(): Question {
  const P = pick([int(20, 300) * 100, int(1000, 20000)])
  const r = pick(RATES)
  const n = int(2, 8)
  const I = P * (r / 100) * n
  const ask = chance(0.7) ? 'interest' : 'total'
  return q({
    prompt: `${ask === 'interest' ? 'Find the simple interest earned on' : 'Find the final value of'} ${dollars(P)} invested at ${pctTxt(r)} p.a. ${ask === 'total' ? 'simple interest ' : ''}for ${n} years.${centsNote(I)}`,
    answer: moneyA(ask === 'interest' ? I : P + I),
    prefix: '$',
    calc: true,
    hint: `I = Prn, with r as a decimal (${num(r)}% = ${num(r9(r / 100))}) and n in years.${ask === 'total' ? ' Then add the interest to the principal.' : ''}`,
    steps: [`I = ${num(P)} ${TIMES} ${num(r9(r / 100))} ${TIMES} ${n} = ${money(I)}`, ...(ask === 'total' ? [`Final value = ${dollars(P)} + ${money(I)} = ${money(P + I)}`] : [])],
    meta: { t: 'si', P, r, n, ask },
  })
}
function siPart(): Question {
  const P = pick([int(20, 300) * 100, int(1000, 20000), int(20, 300) * 1000])
  const borrowed = chance()
  const r = pick(borrowed ? LOAN_RATES : RATES)
  const unit = pick(['months', 'days', 'weeks'] as const)
  const k = unit === 'months' ? pick([3, 5, 7, 9, 14, 18, 30]) : unit === 'days' ? int(30, 300) : int(10, 40)
  const per = unit === 'months' ? 12 : unit === 'days' ? 365 : 52
  const I = (P * (r / 100) * k) / per
  return q({
    prompt: `Find the simple interest on ${dollars(P)} ${borrowed ? 'borrowed' : 'invested'} at ${pctTxt(r)} p.a. for ${k} ${unit}, to the nearest cent.`,
    answer: moneyA(I),
    prefix: '$',
    calc: true,
    hint: `The rate is per year, so write the time in years: ${k} ${unit} = ${frac(k, per)} of a year.`,
    steps: [`n = ${frac(k, per)} years`, `I = ${num(P)} ${TIMES} ${num(r9(r / 100))} ${TIMES} ${frac(k, per)} = ${cut(I)} ≈ ${money(I)}`],
    meta: { t: 'si', P, r, n: k / per, ask: 'interest' },
  })
}
function siRate(): Question {
  const P = pick([int(20, 300) * 100, int(1000, 20000)])
  const r = pick([2.4, 2.8, 3, 3.5, 4.5, 5, 5.25, 6.3, 6.5, 7.7])
  const n = int(2, 6)
  const I = round(P * (r / 100) * n, 2)
  const loan = chance(0.3)
  return q({
    prompt: loan ? `A flat-rate loan of ${dollars(P)} is charged ${money(I)} interest over ${n} years. What is the annual interest rate?` : `After ${n} years, an investment of ${dollars(P)} has earned ${money(I)} in simple interest. What is the annual interest rate?`,
    answer: numA(r9((I / (P * n)) * 100)),
    suffix: '% p.a.',
    calc: true,
    hint: 'Substitute into I = Prn and solve for r. Then write r as a percentage.',
    steps: [`${money(I)} = ${num(P)} ${TIMES} ${v('r')} ${TIMES} ${n} = ${num(P * n)}${v('r')}`, `${v('r')} = ${money(I)} ${DIVIDE} ${num(P * n)} = ${num(r9(I / (P * n)))} = ${num(r9((I / (P * n)) * 100))}%`],
    meta: { t: 'sirate', P, I, n },
  })
}
function siTime(): Question {
  const P = pick([int(20, 300) * 100, int(5000, 25000)])
  const r = pick([2.4, 3, 4.5, 5, 6, 6.9, 7.1, 8])
  const unit = pick(['years', 'months', 'days'] as const)
  const k = unit === 'years' ? pick([1.5, 2.5, 3, 4, 4.5, 6, 7.5]) : unit === 'months' ? int(5, 40) : int(30, 300)
  const per = unit === 'years' ? 1 : unit === 'months' ? 12 : 365
  const I = round((P * (r / 100) * k) / per, 2)
  const val = (I / (P * (r / 100))) * per
  return q({
    prompt: `How many ${unit} will it take for ${dollars(P)} to earn ${money(I)} in simple interest at ${num(r)}% p.a.?${unit === 'days' ? ' Answer to the nearest day.' : ''}`,
    answer: unit === 'days' ? numA(val, 0) : numA(r9(val)),
    suffix: unit,
    calc: true,
    hint: `Substitute into I = Prn and solve for n (in years).${unit === 'years' ? '' : ` Then change years to ${unit} (${unit === 'months' ? '× 12' : '× 365'}).`}`,
    steps: [`${money(I)} = ${num(P)} ${TIMES} ${num(r9(r / 100))} ${TIMES} ${v('n')}`, `${v('n')} = ${money(I)} ${DIVIDE} ${num(r9((P * r) / 100))} = ${cut(I / ((P * r) / 100))} years`, ...(unit === 'years' ? [] : [`${cut(I / ((P * r) / 100))} ${TIMES} ${per} = ${cut(val)}${unit === 'days' ? ` ≈ ${Math.round(val)}` : ''} ${unit}`])],
    meta: { t: 'sitime', P, r, I, per },
  })
}
function siLoan(): Question {
  const P = int(20, 120) * 100
  const y = int(2, 5)
  const r = pick([4, 5, 6, 7.5, 8, 9, 10, 12])
  const total = P * (1 + (r / 100) * y)
  const R = total / (12 * y)
  if (!Number.isInteger(r9(R * 100))) return siLoan()
  const ask = pick(['total', 'interest', 'rate'] as const)
  return q({
    prompt: `${pick(NAMES)} borrowed ${dollars(P)} for a new kitchen and repaid the flat-rate loan at ${money(R)} per month for ${y} years. ${ask === 'total' ? 'How much did they repay altogether?' : ask === 'interest' ? 'How much interest did they pay?' : 'What was the flat rate of interest per year?'}`,
    answer: ask === 'rate' ? numA(r) : moneyA(ask === 'total' ? total : total - P),
    prefix: ask === 'rate' ? undefined : '$',
    suffix: ask === 'rate' ? '% p.a.' : undefined,
    calc: true,
    hint: ask === 'rate' ? 'Find the total repaid and the interest first. Then use I = Prn and solve for r.' : `There are ${12 * y} monthly repayments.`,
    steps: [`Total repaid = ${money(R)} ${TIMES} ${12 * y} = ${money(total)}`, ...(ask !== 'total' ? [`Interest = ${money(total)} ${MINUS} ${dollars(P)} = ${money(total - P)}`] : []), ...(ask === 'rate' ? [`${v('r')} = ${money(total - P)} ${DIVIDE} (${num(P)} ${TIMES} ${y}) = ${num(r9(r / 100))} = ${num(r)}% p.a.`] : [])],
    meta: { t: 'siloan', P, R, y, ask },
  })
}
export const ex307 = (level: Level): Question => {
  if (level === 1) return siYears()
  if (level === 2) return siPart()
  return pick([siRate, siTime, siTime, siLoan])()
}

// ================================================================== 3.08 Ratios and rates

/** simplest whole-number form of a ratio of positive numbers (decimals and fractions allowed) */
function simplest(parts: Fr[]): number[] {
  const L = parts.reduce((l, f) => (l * f[1]) / gcd(l, f[1]), 1)
  const ints = parts.map((f) => (f[0] * L) / f[1])
  const g = ints.reduce((a, b) => gcd(a, b))
  return ints.map((x) => x / g)
}
const UNIT_RATIO: [string, string, number][] = [
  ['c', '$', 100], ['g', 'kg', 1000], ['min', 'h', 60], ['mm', 'm', 1000], ['h', 'day', 24], ['mm', 'cm', 10], ['mL', 'L', 1000], ['s', 'min', 60],
]
function simplifyRatio(): Question {
  const kind = pick(['two', 'two', 'three', 'dec', 'frac', 'units', 'units'] as const)
  let parts: Fr[]
  let html: string
  let work = ''
  if (kind === 'two' || kind === 'three') {
    const base = Array.from({ length: kind === 'two' ? 2 : 3 }, () => int(1, 12))
    const g0 = base.reduce((a, b) => gcd(a, b))
    const k = int(2, 12)
    const xs = base.map((b) => (b / g0) * k)
    if (new Set(xs).size < xs.length) return simplifyRatio()
    parts = xs.map((x) => [x, 1] as Fr)
    html = xs.join(' : ')
    work = `Divide every term by the HCF, ${k}.`
  } else if (kind === 'dec') {
    const dp = int(1, 2)
    const a = dec(int(2, 99) * (dp === 2 ? 1 : 1), dp)
    const b = dec(int(2, 99), dp)
    if (a === b) return simplifyRatio()
    parts = [fr(Math.round(a * 10 ** dp), 10 ** dp), fr(Math.round(b * 10 ** dp), 10 ** dp)]
    html = `${num(a)} : ${num(b)}`
    work = `Multiply both terms by ${10 ** dp} to remove the decimals, then simplify.`
  } else if (kind === 'frac') {
    const a: Fr = chance() ? properFr(8) : chance() ? mixedFr(3, 4) : [int(2, 9), 1]
    const b: Fr = properFr(8)
    parts = [a, b]
    html = `${a[1] === 1 ? num(a[0]) : mx(a)} : ${frac(b[0], b[1])}`
    work = 'Multiply both terms by a common denominator to remove the fractions, then simplify.'
  } else {
    const [small, large, f] = pick(UNIT_RATIO)
    const bigFirst = chance()
    const A = int(1, 6)
    const B = int(1, f * A * 2)
    if (B % f === 0) return simplifyRatio()
    const sh = (v0: number, u: string) => (u === '$' ? `$${v0}` : u === 'c' ? `${v0}c` : `${v0} ${u}`)
    parts = bigFirst ? [[A * f, 1], [B, 1]] : [[B, 1], [A * f, 1]]
    html = bigFirst ? `${sh(A, large)} : ${sh(B, small)}` : `${sh(B, small)} : ${sh(A, large)}`
    work = `Change both to ${small === 'c' ? 'cents' : small}: ${sh(A, large)} = ${sh(A * f, small)}.`
  }
  const ans = simplest(parts)
  if (ans.some((x) => x > 999)) return simplifyRatio()
  return q({
    prompt: `Simplify the ratio ${html}.`,
    answer: ratioA(...ans),
    hint: 'Write both terms as whole numbers in the same units, then divide by their highest common factor.',
    steps: [work, `${html} = ${ans.join(' : ')}`],
    meta: { t: 'ratio', parts },
  })
}
function ratioFind(): Question {
  const kind = pick(['ages', 'invest', 'colours'] as const)
  const [a, b] = (() => {
    for (;;) {
      const x = int(1, 12)
      const y = int(1, 12)
      if (x !== y && gcd(x, y) === 1) return [x, y]
    }
  })()
  if (kind === 'ages') {
    const k = int(2, 6)
    const [A, B] = a > b ? [a, b] : [b, a]
    const askChild = chance()
    return q({
      prompt: `The ratio of a parent’s age to their child’s age is ${A} : ${B}. ${askChild ? `The parent is ${A * k}. How old is the child?` : `The child is ${B * k}. How old is the parent?`}`,
      answer: numA(askChild ? B * k : A * k),
      suffix: 'years old',
      hint: `Find what one part is worth: ${askChild ? `${A * k} ${DIVIDE} ${A}` : `${B * k} ${DIVIDE} ${B}`}.`,
      steps: [`1 part = ${askChild ? `${A * k} ${DIVIDE} ${A}` : `${B * k} ${DIVIDE} ${B}`} = ${k}`, `${askChild ? B : A} parts = ${(askChild ? B : A) * k}`],
      meta: { t: 'ratiofind', a: A, b: B, known: askChild ? A * k : B * k, knownFirst: askChild },
    })
  }
  if (kind === 'invest') {
    const k = int(2, 90) * 1000
    const [S, L] = a < b ? [a, b] : [b, a]
    return q({
      prompt: `Two friends invest in a business in the ratio ${S} : ${L}. The larger investment is ${dollars(L * k)}. What is the smaller investment?`,
      answer: numA(S * k),
      prefix: '$',
      hint: `${L} parts = ${dollars(L * k)}. Find 1 part, then ${S} parts.`,
      steps: [`1 part = ${dollars(L * k)} ${DIVIDE} ${L} = ${dollars(k)}`, `${S} parts = ${dollars(S * k)}`],
      meta: { t: 'ratiofind', a: S, b: L, known: L * k, knownFirst: false },
    })
  }
  const parts = [int(2, 12), int(2, 12), int(2, 12), int(2, 12)]
  const k = int(2, 6)
  const names = ['white', 'grey', 'blue', 'other colours']
  const known = 3
  const ask = int(0, 2)
  if (parts[known] * k > 60) return ratioFind()
  return q({
    prompt: `Car buyers chose colours in the ratio white : grey : blue : other = ${parts.join(' : ')}. A dealer orders ${parts[known] * k} cars in other colours. Keeping the same ratio, how many ${names[ask]} cars should be ordered?`,
    answer: numA(parts[ask] * k),
    suffix: 'cars',
    hint: `${parts[known]} parts = ${parts[known] * k} cars. Find 1 part first.`,
    steps: [`1 part = ${parts[known] * k} ${DIVIDE} ${parts[known]} = ${k}`, `${names[ask]}: ${parts[ask]} ${TIMES} ${k} = ${parts[ask] * k} cars`],
    meta: { t: 'ratiofind4', parts, known: parts[known] * k, ask },
  })
}
function divideRatio(): Question {
  const kind = pick(['money', 'money', 'money', 'concrete', 'alloy'] as const)
  for (;;) {
    const parts =
      kind === 'concrete'
        ? pick([[4, 3, 1], [3, 2, 1], [5, 3, 1], [4, 2, 1], [6, 4, 1], [5, 4, 1]])
        : kind === 'alloy'
          ? [int(1, 20), int(1, 20)]
          : chance(0.35)
            ? [int(1, 9), int(1, 9), int(1, 9)]
            : [int(1, 30), int(1, 30)]
    if (parts.reduce((x, y) => gcd(x, y)) !== 1) continue
    const sum = parts.reduce((x, y) => x + y, 0)
    if (kind === 'alloy') {
      const total = dec(int(100, 999), 2)
      const which = int(0, 1)
      const val = (total * parts[which]) / sum
      if (!clear(val, 2) || parts[0] === parts[1]) continue
      const o = [num(round(val, 2), 2), num(round((total * parts[1 - which]) / sum, 2), 2), num(round(total / sum, 2), 2), num(round(total / parts[which], 2), 2)].map((x) => `${x} kg`)
      if (new Set(o).size < 4) continue
      return q({
        prompt: `An alloy is made of nickel and copper in the ratio ${parts.join(' : ')}. A piece of the alloy weighs ${num(total)} kg. How much ${which === 0 ? 'nickel' : 'copper'} is in it, to the nearest hundredth of a kilogram?`,
        answer: mcA(o[0], o.slice(1)),
        calc: true,
        hint: `There are ${sum} parts altogether. Find 1 part, then ${parts[which]} parts.`,
        steps: [`1 part = ${num(total)} ${DIVIDE} ${sum} = ${cut(total / sum)} kg`, `${parts[which]} parts = ${cut(val)} ≈ ${num(round(val, 2), 2)} kg`],
        meta: { t: 'divide', total, parts, which, mc: true },
      })
    }
    if (kind === 'concrete') {
      const total = sum * int(2, 20)
      const which = int(0, 2)
      const val = (total * parts[which]) / sum
      const nm = ['gravel', 'sand', 'cement']
      return q({
        prompt: `Concrete is made of gravel, sand and cement in the ratio ${parts.join(' : ')}. How much ${nm[which]} is needed for ${num(total)} cubic metres of concrete?`,
        answer: numA(r9(val)),
        suffix: 'm<sup>3</sup>',
        hint: `There are ${sum} parts altogether.`,
        steps: [`1 part = ${num(total)} ${DIVIDE} ${sum} = ${num(r9(total / sum))} m<sup>3</sup>`, `${nm[which]}: ${parts[which]} ${TIMES} ${num(r9(total / sum))} = ${num(r9(val))} m<sup>3</sup>`],
        meta: { t: 'divide', total, parts, which },
      })
    }
    const total = sum * int(2, 400) * (chance() ? 10 : 1)
    const which = int(0, parts.length - 1)
    const val = (total * parts[which]) / sum
    const people = sample(NAMES, parts.length)
    return q({
      prompt: `${people.slice(0, -1).join(', ')} and ${people[people.length - 1]} share ${dollars(total)} in the ratio ${parts.join(' : ')}. How much does ${people[which]} receive?`,
      answer: numA(r9(val)),
      prefix: '$',
      hint: `There are ${sum} parts altogether. Find 1 part, then ${parts[which]} part${parts[which] > 1 ? 's' : ''}.`,
      steps: [`1 part = ${dollars(total)} ${DIVIDE} ${sum} = ${dollars(total / sum)}`, `${people[which]}: ${parts[which]} ${TIMES} ${dollars(total / sum)} = ${dollars(val)}`],
      meta: { t: 'divide', total, parts, which },
    })
  }
}
const RATE_STATEMENTS: { make: () => [string, number, number, string] }[] = [
  { make: () => { const h = int(2, 9); return [`${num(h * int(50, 110) + int(0, 9))} km in ${h} hours`, 0, h, 'km/h'] } },
  { make: () => { const kg = int(2, 9); return [`$${num(dec(int(1000, 9999), 2))} for ${kg} kg`, 0, kg, '$/kg'] } },
  { make: () => { const m = int(10, 60); return [`${num(m * int(20, 70))} words in ${m} min`, 0, m, 'words/min'] } },
  { make: () => { const L = int(8, 60); return [`${num(int(100, 900))} km on ${L} L of fuel`, 0, L, 'km/L'] } },
  { make: () => { const s = int(10, 60); return [`${num(int(100, 400))} m in ${s} s`, 0, s, 'm/s'] } },
  { make: () => { const d = int(10, 60); return [`${num(int(200, 1500))} km walked in ${d} days`, 0, d, 'km/day'] } },
  { make: () => { const h = int(2, 9); return [`$${num(int(90, 400))} for ${h} hours of work`, 0, h, '$/h'] } },
]
function writeRate(): Question {
  for (;;) {
    const [text0, , den, unit] = pick(RATE_STATEMENTS).make()
    const numer = numsFromText(text0)[0]
    const val = numer / den
    // money rates go to the nearest cent, others to one decimal place
    const dp = unit.startsWith('$') ? 2 : 1
    const exact = Number.isInteger(r9(val * 10 ** dp))
    if (!exact && !clear(val, dp)) continue
    return q({
      prompt: `Write ${text0} as a rate in ${unit}${exact ? '' : dp === 2 ? ', to the nearest cent' : `, ${DPW[1]}`}.`,
      answer: exact ? numA(r9(val)) : numA(val, dp),
      suffix: unit,
      calc: true,
      hint: `Divide the first quantity by the second: ${unit} means ${unit.split('/')[0]} per ${unit.split('/')[1]}.`,
      steps: [`${num(numer)} ${DIVIDE} ${den} = ${exact ? num(r9(val)) : `${cut(val)} ≈ ${num(round(val, dp), dp)}`} ${unit}`],
      meta: { t: 'rate', numer, den },
    })
  }
}
/** numbers written in a phrase such as "$54.20 for 3 kg" (NSW spacing like 1 200 allowed) */
function numsFromText(t: string): number[] {
  return (t.replace(/(\d) (?=\d{3}\b)/g, '$1').match(/\d+(?:\.\d+)?/g) ?? []).map(Number)
}
function rateProblems(): Question {
  const kind = pick(['truck', 'wage', 'meat', 'heart', 'fuel', 'fuel2', 'births', 'carat', 'density'] as const)
  if (kind === 'truck') {
    const s = int(55, 100)
    const start = int(5, 9) * 60 + pick([0, 15, 30, 45])
    const len = int(3, 9) * 60 + pick([0, 15, 30, 45])
    const end = start + len
    const t = (m: number) => `${Math.floor(m / 60) > 12 ? Math.floor(m / 60) - 12 : Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')} ${m >= 720 ? 'pm' : 'am'}`
    return q({
      prompt: `A truck averages ${s} km/h. How far does it travel from ${t(start)} to ${t(end)}?`,
      answer: numA(r9((s * len) / 60)),
      suffix: 'km',
      calc: true,
      hint: 'Find the time taken in hours (as a decimal or fraction), then multiply by the speed.',
      steps: [`Time = ${Math.floor(len / 60)} h ${len % 60} min = ${num(r9(len / 60))} h`, `Distance = ${s} ${TIMES} ${num(r9(len / 60))} = ${num(r9((s * len) / 60))} km`],
      meta: { t: 'rateuse', rate: s, amount: len / 60, mult: true },
    })
  }
  if (kind === 'wage') {
    const h = 8
    const rate = dec(int(2500, 4500), 2)
    const day = r9(rate * h)
    const ask = pick(['rate', 'week', 'days'] as const)
    const daysN = int(3, 12)
    return q({
      prompt: `${pick(NAMES)} earns ${money(day)} for an 8-hour day. ${ask === 'rate' ? 'What is their hourly rate of pay?' : ask === 'week' ? 'How much would they earn in a 38-hour week?' : `How many 8-hour days will it take to earn ${money(day * daysN)}?`}`,
      answer: ask === 'days' ? numA(daysN) : moneyA(ask === 'rate' ? rate : rate * 38),
      prefix: ask === 'days' ? undefined : '$',
      suffix: ask === 'days' ? 'days' : undefined,
      calc: true,
      hint: 'First find the rate in $/h.',
      steps: [`Rate = ${money(day)} ${DIVIDE} 8 = ${money(rate)}/h`, ...(ask === 'week' ? [`38 ${TIMES} ${money(rate)} = ${money(rate * 38)}`] : ask === 'days' ? [`${money(day * daysN)} ${DIVIDE} ${money(day)} = ${daysN} days`] : [])],
      meta: { t: 'wage', day, ask, target: day * daysN },
    })
  }
  if (kind === 'meat') {
    const kg = int(2, 6)
    const cost = dec(int(1500, 9999), 2)
    const rate = cost / kg
    const ask = pick(['rate', 'other', 'budget'] as const)
    const other = pick([1.5, 2, 3, 2.5, 0.5])
    const budget = int(2, 8) * 10
    const val = ask === 'rate' ? rate : ask === 'other' ? rate * other : budget / rate
    if (ask === 'budget' && !clear(val, 1)) return rateProblems()
    return q({
      prompt: `${kg} kg of lamb chops cost ${money(cost)}. ${ask === 'rate' ? 'What is the price in $/kg, to the nearest cent?' : ask === 'other' ? `How much would ${num(other)} kg cost, to the nearest cent?` : `How many kilograms can be bought for $${budget}, ${DPW[1]}?`}`,
      answer: ask === 'budget' ? numA(val, 1) : moneyA(val),
      prefix: ask === 'budget' ? undefined : '$',
      suffix: ask === 'budget' ? 'kg' : undefined,
      calc: true,
      hint: 'Find the rate in $/kg first.',
      steps: [`Rate = ${money(cost)} ${DIVIDE} ${kg} = ${cut(rate)} $/kg`, ...(ask === 'other' ? [`${num(other)} ${TIMES} ${cut(rate)} = ${cut(val)} ≈ ${money(val)}`] : ask === 'budget' ? [`$${budget} ${DIVIDE} ${cut(rate)} = ${cut(val)} ≈ ${num(round(val, 1), 1)} kg`] : [])],
      meta: { t: 'meat', kg, cost, ask, other, budget },
    })
  }
  if (kind === 'heart') {
    const bpm = int(55, 95)
    const ask = chance() ? 'hour' : 'time'
    const beats = int(5, 30) * 100
    const secs = (beats / bpm) * 60
    if (ask === 'time' && !clear(secs, 0)) return rateProblems()
    return q({
      prompt: `A resting heart beats at ${bpm} beats/min. ${ask === 'hour' ? 'How many times does it beat in one hour?' : `How long will it take to beat ${num(beats)} times? Answer in seconds, to the nearest second.`}`,
      answer: ask === 'hour' ? numA(bpm * 60) : numA(secs, 0),
      suffix: ask === 'hour' ? 'beats' : 's',
      calc: true,
      hint: ask === 'hour' ? 'There are 60 minutes in an hour.' : 'Divide the number of beats by the rate to get minutes, then change to seconds.',
      steps: ask === 'hour' ? [`${bpm} ${TIMES} 60 = ${num(bpm * 60)} beats`] : [`${num(beats)} ${DIVIDE} ${bpm} = ${cut(beats / bpm)} min`, `${cut(beats / bpm)} ${TIMES} 60 = ${cut(secs)} ≈ ${Math.round(secs)} s`],
      meta: { t: 'heart', bpm, ask, beats },
    })
  }
  if (kind === 'fuel') {
    const rate = dec(int(50, 140), 1)
    const km = int(30, 900)
    const val = (rate * km) / 100
    if (!clear(val, 1)) return rateProblems()
    return q({
      prompt: `A van uses fuel at ${num(rate)} L/100 km. How much fuel will it use on a ${km} km trip, ${DPW[1]}?`,
      answer: numA(val, 1),
      suffix: 'L',
      calc: true,
      hint: `${num(rate)} L/100 km means ${num(rate)} L for every 100 km. Divide the distance by 100, then multiply.`,
      steps: [`${km} ${DIVIDE} 100 = ${num(km / 100)}`, `${num(km / 100)} ${TIMES} ${num(rate)} = ${cut(val)} ≈ ${num(round(val, 1), 1)} L`],
      meta: { t: 'fuel', rate, km },
    })
  }
  if (kind === 'fuel2') {
    const L = dec(int(150, 600), 1)
    const km = int(200, 900)
    const val = (L / km) * 100
    if (!clear(val, 1)) return rateProblems()
    return q({
      prompt: `A hybrid car used ${num(L)} L of fuel to travel ${km} km. What is its fuel consumption in L/100 km, ${DPW[1]}?`,
      answer: numA(val, 1),
      suffix: 'L/100 km',
      calc: true,
      hint: 'Find the litres used per kilometre, then multiply by 100.',
      steps: [`${num(L)} ${DIVIDE} ${km} ${TIMES} 100 = ${cut(val)} ≈ ${num(round(val, 1), 1)} L/100 km`],
      meta: { t: 'fuel2', L, km },
    })
  }
  if (kind === 'births') {
    const rate = int(9, 18)
    const pop = int(10, 90) * 1000
    const births = (pop * rate) / 1000
    return q({
      prompt: `A town’s birth rate is ${rate} births per 1000 people. There were ${num(births)} births in the town last year. What is the town’s population?`,
      answer: numA(pop),
      suffix: 'people',
      hint: `Every ${rate} births stand for 1000 people.`,
      steps: [`${num(births)} ${DIVIDE} ${rate} = ${num(pop / 1000)} lots of 1000 people`, `${num(pop / 1000)} ${TIMES} 1000 = ${num(pop)} people`],
      meta: { t: 'births', rate, births },
    })
  }
  if (kind === 'carat') {
    const c = pick([9, 10, 14, 18, 22])
    const mass = int(5, 80)
    const ask = chance() ? 'ratio' : 'mass'
    const gold = (mass * c) / 24
    if (ask === 'mass' && !clear(gold, 1)) return rateProblems()
    const ans = simplest([[c, 1], [24 - c, 1]])
    return q({
      prompt: `Pure gold is 24 carat. ${c}-carat gold is ${c} parts gold to ${24 - c} parts other metals. ${ask === 'ratio' ? `Write the ratio of gold to other metals in ${c}-carat gold in simplest form.` : `How much gold is in a ${mass} g ${c}-carat chain, ${DPW[1]}?`}`,
      answer: ask === 'ratio' ? ratioA(...ans) : numA(gold, 1),
      suffix: ask === 'ratio' ? undefined : 'g',
      calc: ask === 'mass',
      hint: ask === 'ratio' ? 'Divide both terms by their HCF.' : `Gold is ${c} parts out of 24.`,
      steps: ask === 'ratio' ? [`${c} : ${24 - c} = ${ans.join(' : ')}`] : [`${frac(c, 24)} ${TIMES} ${mass} = ${cut(gold)} ≈ ${num(round(gold, 1), 1)} g`],
      meta: { t: 'carat', c, mass, ask },
    })
  }
  const popM = dec(int(50, 3000), 1)
  const area = int(100000, 9000000)
  const dens = (popM * 1e6) / area
  if (!clear(dens, 1)) return rateProblems()
  return q({
    prompt: `A country has a population of ${num(popM)} million and an area of ${num(area)} km<sup>2</sup>. What is its population density in people/km<sup>2</sup>, ${DPW[1]}?`,
    answer: numA(dens, 1),
    suffix: 'people/km<sup>2</sup>',
    calc: true,
    hint: `Population density = population ÷ area. ${num(popM)} million = ${num(popM * 1e6)}.`,
    steps: [`${num(popM * 1e6)} ${DIVIDE} ${num(area)} = ${cut(dens)} ≈ ${num(round(dens, 1), 1)} people/km<sup>2</sup>`],
    meta: { t: 'density', popM, area },
  })
}
export const ex308 = (level: Level): Question => {
  if (level === 1) return simplifyRatio()
  if (level === 2) return pick([ratioFind, divideRatio, divideRatio, writeRate])()
  return rateProblems()
}

// ================================================================== 3.09 Converting rates

/** units as [kind, size in a base unit] */
export const UNITS: Record<string, [string, number]> = {
  mm: ['len', 0.001], cm: ['len', 0.01], m: ['len', 1], km: ['len', 1000],
  g: ['mass', 1], kg: ['mass', 1000], t: ['mass', 1e6],
  mL: ['vol', 1], L: ['vol', 1000],
  c: ['money', 1], $: ['money', 100],
  s: ['time', 1], min: ['time', 60], h: ['time', 3600], day: ['time', 86400], week: ['time', 604800], year: ['time', 52 * 604800],
  'm²': ['area', 1], ha: ['area', 10000],
  sheep: ['count', 1],
}
const unitHtml = (u: string) => (u === 'm²' ? 'm<sup>2</sup>' : u)
/** a rate as it is written, e.g. 5 m/s, $10/kg, 70c/min */
const rateHtml = (x: number, n: string, d: string) => (n === '$' ? `$${num(x)}/${unitHtml(d)}` : n === 'c' ? `${num(x)}c/${unitHtml(d)}` : `${num(x)} ${n}/${unitHtml(d)}`)
const unitPair = (n: string, d: string) => `${n === 'c' ? 'cents' : unitHtml(n)}/${unitHtml(d)}`
export function convertRate(x: number, from: [string, string], to: [string, string]): number {
  const s = (u: string) => UNITS[u][1]
  return (x * s(from[0]) * s(to[1])) / (s(to[0]) * s(from[1]))
}
const ONE_STEP: [[string, string], [string, string], number[]][] = [
  [['m', 's'], ['m', 'h'], [3, 5, 12, 30, 0.5]], [['$', 'kg'], ['$', 'g'], [10, 25, 80, 4.5]], [['mL', 'min'], ['mL', 'h'], [20, 40, 2.5, 15]],
  [['mL', 's'], ['mL', 'h'], [5, 0.8, 12]], [['kg', 'm²'], ['kg', 'ha'], [5, 0.2, 1.5]], [['t', 'day'], ['kg', 'day'], [2.5, 0.75, 4]],
  [['$', 'week'], ['$', 'year'], [750, 1200, 425.5]], [['km', 'min'], ['km', 'h'], [0.5, 1.2, 2]], [['sheep', 'h'], ['sheep', 'day'], [15, 40, 125]],
  [['$', 'day'], ['$', 'week'], [60, 85, 112.5]], [['m', 'min'], ['m', 'h'], [45, 120, 7.5]], [['g', 'mL'], ['g', 'L'], [1.2, 0.35, 2]],
]
const TWO_STEP: [[string, string], [string, string], number[]][] = [
  [['m', 's'], ['km', 'h'], [5, 12, 25, 340, 7.5]], [['cm', 's'], ['m', 'h'], [35, 8, 120]], [['c', 'g'], ['$', 'kg'], [10, 2.5, 0.8]],
  [['mL', 'min'], ['L', 'h'], [40, 250, 75]], [['L', 'min'], ['mL', 's'], [40, 3, 12]], [['mL', 's'], ['L', 'day'], [5, 0.8, 2.5]],
  [['g', 'm²'], ['kg', 'ha'], [25, 140, 8]], [['t', 'h'], ['kg', 'day'], [2.5, 0.4, 1.25]], [['km', 'h'], ['m', 's'], [110, 60, 45, 80]],
  [['kg', 'm'], ['g', 'cm'], [5, 0.75, 12]], [['km', 'L'], ['m', 'mL'], [8, 14.5, 6]], [['c', 'min'], ['$', 'h'], [70, 15, 2.5]],
  [['m', 'day'], ['cm', 'min'], [345.6, 72, 144]], [['g', 'm²'], ['kg', 'm²'], [140, 25, 2.5]], [['mL', 's'], ['mL', 'h'], [0.8, 1.5]],
]
function convertQ(table: typeof ONE_STEP, two: boolean): Question {
  for (;;) {
    const [from, to, vals] = pick(table)
    const x = pick(vals)
    const val = convertRate(x, from, to)
    const exact = Number.isInteger(r9(val * 10)) || dpOf(r9(val)) <= 1
    if (!exact && !clear(val, 1)) continue
    const s = (u: string) => UNITS[u][1]
    const f1 = s(from[0]) / s(to[0])
    const f2 = s(to[1]) / s(from[1])
    return q({
      prompt: `Convert ${rateHtml(x, from[0], from[1])} to ${unitPair(to[0], to[1])}${exact ? '' : ', correct to one decimal place'}.`,
      answer: exact ? numA(r9(val)) : numA(val, 1),
      suffix: unitPair(to[0], to[1]),
      calc: true,
      hint: two ? 'Change one unit at a time: first the top unit, then the bottom unit.' : 'Only one unit changes. Think: is the new amount bigger or smaller?',
      steps: [
        ...(f1 !== 1 ? [`${from[0] === to[0] ? '' : `1 ${unitHtml(from[0] === 'c' ? 'c' : from[0])} = ${num(r9(f1))} ${unitHtml(to[0])}: `}${num(x)} ${f1 >= 1 ? TIMES : DIVIDE} ${num(r9(f1 >= 1 ? f1 : 1 / f1))} = ${num(r9(x * f1))} ${unitPair(to[0], from[1])}`] : []),
        ...(f2 !== 1 ? [`${num(r9(x * f1))} ${f2 >= 1 ? TIMES : DIVIDE} ${num(r9(f2 >= 1 ? f2 : 1 / f2))} = ${exact ? num(r9(val)) : `${cut(val)} ≈ ${num(round(val, 1), 1)}`} ${unitPair(to[0], to[1])}`] : []),
      ],
      meta: { t: 'convert', x, from, to },
    })
  }
}
function convertSpeeds(): Question {
  if (chance()) {
    const [animal, x] = pick([['A cheetah ran', dec(int(250, 320), 1)], ['A peregrine falcon dived', int(80, 110)], ['A snake moved', dec(int(25, 45), 1)], ['A sailfish swam', int(25, 35)], ['A track cyclist rode', dec(int(180, 250), 1)], ['A greyhound ran', dec(int(150, 190), 1)]] as [string, number][])
    const val = x * 3.6
    return q({
      prompt: `${animal} at ${num(x)} m/s. Convert this speed to km/h, correct to two decimal places.`,
      answer: numA(val, 2),
      suffix: 'km/h',
      calc: true,
      hint: 'Multiply by 3600 to get metres per hour, then divide by 1000 (or just multiply by 3.6).',
      steps: [`${num(x)} ${TIMES} 3600 = ${num(r9(x * 3600))} m/h`, `${num(r9(x * 3600))} ${DIVIDE} 1000 = ${num(r9(val))} km/h`],
      meta: { t: 'convert', x, from: ['m', 's'], to: ['km', 'h'] },
    })
  }
  for (;;) {
    const v0 = pick([40, 50, 60, 70, 80, 90, 100, 110])
    const t = pick([0.7, 0.8, 0.9, 1.2, 1.5])
    const d = (v0 / 3.6) * t
    if (!clear(d, 1)) continue
    return q({
      prompt: `A driver’s reaction time is ${num(t)} s. How far does the car travel during this time at ${v0} km/h, ${DPW[1]}?`,
      answer: numA(d, 1),
      suffix: 'm',
      calc: true,
      hint: 'Change the speed to m/s first (divide by 3.6), then multiply by the time.',
      steps: [`${v0} km/h = ${v0} ${DIVIDE} 3.6 = ${cut(v0 / 3.6)} m/s`, `${cut(v0 / 3.6)} ${TIMES} ${num(t)} = ${cut(d)} ≈ ${num(round(d, 1), 1)} m`],
      meta: { t: 'reaction', v: v0, time: t },
    })
  }
}
export const ex309 = (level: Level): Question => {
  if (level === 1) return convertQ(ONE_STEP, false)
  if (level === 2) return convertQ(TWO_STEP, true)
  return chance(0.3) ? convertQ(TWO_STEP, true) : convertSpeeds()
}

// ================================================================== Power plus (extension)

function ppBetween(): Question {
  const a = int(3, 8)
  const b = a - 1
  // 1/a and 1/b with three equally spaced fractions between them
  const L = a * b * 4
  const start = L / a
  const step = (L / b - L / a) / 4
  const which = int(1, 3)
  const ans = fr(start + which * step, L)
  return q({
    prompt: `Three fractions ${v('A')}, ${v('B')} and ${v('C')} are equally spaced between ${frac(1, a)} and ${frac(1, b)} on a number line, in that order. What fraction is ${v(['A', 'B', 'C'][which - 1])}?`,
    answer: fAns(ans),
    hint: `Write ${frac(1, a)} and ${frac(1, b)} with the denominator ${L}, then split the gap into 4 equal steps.`,
    steps: [`${frac(1, a)} = ${frac(start, L)}, ${frac(1, b)} = ${frac(L / b, L)}`, `Each step is ${frac(step, L)}.`, `${v(['A', 'B', 'C'][which - 1])} = ${frac(start + which * step, L)} = ${fracS(ans[0], ans[1])}`],
    meta: { t: 'ppbetween', a, which },
  })
}
function ppPercent(): Question {
  const kind = pick(['loss', 'markup', 'third', 'time'] as const)
  if (kind === 'loss') {
    const p = pick([20, 25, 30, 40])
    const O = int(40, 400) * 100
    const S = (O * (100 - p)) / 100
    return q({
      prompt: `${pick(NAMES)} sold a car for ${dollars(S)}, making a loss of ${p}% on the price they paid. What did they pay for it?`,
      answer: numA(O),
      prefix: '$',
      calc: true,
      hint: `The selling price is ${100 - p}% of the price paid.`,
      steps: [`${100 - p}% = ${dollars(S)}`, `100% = ${dollars(S)} ${DIVIDE} ${num((100 - p) / 100)} = ${dollars(O)}`],
      meta: { t: 'original', S, p, dp: null },
    })
  }
  if (kind === 'markup') {
    const m = pick([20, 25, 50, 60, 80, 100])
    const d = (m / (100 + m)) * 100
    const exact = Number.isInteger(r9(d * 10))
    return q({
      prompt: `A store marks up the price of a lounge by ${m}%. What percentage discount would bring the price back to the original${exact ? '' : `, ${DPW[1]}`}?`,
      answer: exact ? numA(r9(d)) : numA(d, 1),
      suffix: '%',
      calc: true,
      hint: 'Try an original price of $100. What is the marked-up price, and what fraction of it must come off?',
      steps: [`$100 marked up by ${m}% is $${100 + m}.`, `The discount must be $${m} out of $${100 + m}: ${frac(m, 100 + m)} ${TIMES} 100% = ${exact ? num(r9(d)) : `${cut(d)} ≈ ${num(round(d, 1), 1)}`}%`],
      meta: { t: 'markup', m },
    })
  }
  if (kind === 'third') {
    const f: Fr = pick([[1, 3], [1, 4], [2, 5], [1, 5], [3, 8]])
    const O = f[1] * int(5, 40)
    const S = O - (O * f[0]) / f[1]
    return q({
      prompt: `A pair of shoes was reduced by ${frac(f[0], f[1])} of its price and sold for ${dollars(S)}. What was the original price?`,
      answer: numA(O),
      prefix: '$',
      hint: `The sale price is ${frac(f[1] - f[0], f[1])} of the original price.`,
      steps: [`${frac(f[1] - f[0], f[1])} of the price = ${dollars(S)}`, `${frac(1, f[1])} = ${dollars(S)} ${DIVIDE} ${f[1] - f[0]} = ${dollars(S / (f[1] - f[0]))}`, `Original = ${f[1]} ${TIMES} ${dollars(S / (f[1] - f[0]))} = ${dollars(O)}`],
      meta: { t: 'third', f, S },
    })
  }
  const p = pick([4, 5, 6, 8, 10, 12])
  const newT = dec(int(95, 160), 1)
  const old = newT / (1 - p / 100)
  if (!clear(old, 1)) return ppPercent()
  return q({
    prompt: `After training, ${pick(NAMES)} improved their 100 m time by ${p}%. Their new time is ${num(newT)} s. What was their old time, ${DPW[1]}?`,
    answer: numA(old, 1),
    suffix: 's',
    calc: true,
    hint: `The new time is ${100 - p}% of the old time.`,
    steps: [`${100 - p}% = ${num(newT)} s`, `100% = ${num(newT)} ${DIVIDE} ${num((100 - p) / 100)} = ${cut(old)} ≈ ${num(round(old, 1), 1)} s`],
    meta: { t: 'unitary', part: newT, p: 100 - p, dp: 1 },
  })
}
function ppRatio(): Question {
  if (chance()) {
    // men : children and women : children → men : women
    for (;;) {
      const [a, b] = [int(2, 9), int(2, 12)]
      const [c, d] = [int(2, 9), int(2, 12)]
      if (gcd(a, b) !== 1 || gcd(c, d) !== 1 || b === d) continue
      const ans = simplest([[a * d, 1], [c * b, 1]])
      return q({
        prompt: `At a concert, the ratio of men to children is ${a} : ${b} and the ratio of women to children is ${c} : ${d}. What is the ratio of men to women, in simplest form?`,
        answer: ratioA(...ans),
        hint: `Make the number of parts for children the same in both ratios (use ${(b * d) / gcd(b, d)}).`,
        steps: [`Men : children = ${a * (d / gcd(b, d))} : ${(b * d) / gcd(b, d)}`, `Women : children = ${c * (b / gcd(b, d))} : ${(b * d) / gcd(b, d)}`, `Men : women = ${a * (d / gcd(b, d))} : ${c * (b / gcd(b, d))} = ${ans.join(' : ')}`],
        meta: { t: 'ratiochain', a, b, c, d },
      })
    }
  }
  for (;;) {
    const [x, y, z] = [int(1, 5), int(2, 6), int(2, 9)]
    if (y <= x) continue
    const gift = int(2, 20) * 5
    // after y-part gives `gift` to x-part they are equal: (y - x)k = 2·gift
    const k = (2 * gift) / (y - x)
    if (!Number.isInteger(k)) continue
    const [A, B, C] = sample(NAMES, 3)
    return q({
      prompt: `${A}, ${B} and ${C} share some money in the ratio ${x} : ${y} : ${z}. If ${B} gives $${gift} to ${A}, they will have the same amount. How much does ${C} receive?`,
      answer: numA(z * k),
      prefix: '$',
      hint: `If 1 part is ${v('k')} dollars, then ${y}${v('k')} ${MINUS} ${gift} = ${x}${v('k')} + ${gift}.`,
      steps: [`${y}${v('k')} ${MINUS} ${gift} = ${x}${v('k')} + ${gift}, so ${y - x}${v('k')} = ${2 * gift} and ${v('k')} = ${k}`, `${C} receives ${z} ${TIMES} $${k} = $${z * k}`],
      meta: { t: 'ratiogift', x, y, z, gift },
    })
  }
}
function ppSpeedInterest(): Question {
  if (chance()) {
    const r = pick([2, 2.5, 4, 5, 8, 10, 12.5])
    const P = int(2, 50) * 1000
    return q({
      prompt: `How long will it take ${dollars(P)} to double if it is invested at ${num(r)}% p.a. simple interest?`,
      answer: numA(100 / r),
      suffix: 'years',
      hint: `To double, the interest must equal the principal: ${dollars(P)}.`,
      steps: [`${dollars(P)} = ${num(P)} ${TIMES} ${num(r / 100)} ${TIMES} ${v('n')}`, `${v('n')} = 1 ${DIVIDE} ${num(r / 100)} = ${num(100 / r)} years (whatever the principal)`],
      meta: { t: 'double', r },
    })
  }
  const [s1, s2] = pick([[40, 60], [30, 60], [50, 70], [60, 90], [40, 80]])
  const s3 = (s1 + s2) / 2
  const avg = (2 * s1 * s2) / (s1 + s2)
  const [A, B] = sample(NAMES, 2)
  return q({
    prompt: `${A} drives to the beach at ${s1} km/h for the first half of the distance and at ${s2} km/h for the second half. ${B} drives the whole way at ${s3} km/h. Who arrives first?`,
    answer: mcA(B, [A, 'They arrive together']),
    calc: true,
    hint: 'Try a distance such as 120 km and work out each driver’s time. More time is spent at the slower speed.',
    steps: [`For a ${num(s1 * s2 / 5)} km trip: ${A} takes ${num(r9(s1 * s2 / 10 / s1))} + ${num(r9(s1 * s2 / 10 / s2))} = ${num(r9(s1 * s2 / 10 / s1 + s1 * s2 / 10 / s2))} h; ${B} takes ${num(r9(s1 * s2 / 5 / s3))} h.`, `${A}’s average speed is ${num(round(avg, 1))} km/h, so ${B} arrives first.`],
    meta: { t: 'avgspeed', s1, s2 },
  })
}
export const exPowerPlus3 = (level: Level): Question => {
  if (level === 1) return pick([ppBetween, ppPercent])()
  if (level === 2) return pick([ppPercent, ppRatio])()
  return pick([ppRatio, ppSpeedInterest])()
}

// ================================================================== Topic test (in the order of Test Yourself 3) and skills

const T = (skill: string, level: Level, gen: () => Question): TestItem => ({ skill, level, gen: () => gen() })
export const NCM3_9_TEST: TestItem[] = [
  T('y9-num-integers', 2, mixedOpsInts),
  T('y9-num-decimals', 1, orderDecs),
  T('y9-num-decimals', 2, () => pick([addSubDec, mulDivDec, powersOf10])()),
  T('y9-num-decimals', 2, () => (chance() ? roundDec() : fracToRecurring())),
  T('y9-num-fractions', 2, () => pick([fracAddSub, fracMul, fracDiv])()),
  T('y9-num-percent', 1, pctToFrac),
  T('y9-num-percent', 2, pctOfQuantity),
  T('y9-num-applypct', 1, incDecBy),
  T('y9-num-profit', 1, profitLoss),
  T('y9-num-interest', 2, () => (chance() ? siYears() : siPart())),
  T('y9-num-ratios', 2, divideRatio),
  T('y9-num-convert', 2, () => convertQ(TWO_STEP, true)),
]

export const NCM3_9_SKILLS: Skill[] = [
  {
    id: 'y9-num-integers',
    title: 'Integers',
    ref: ref('3.01'),
    outcomes: INT,
    summary: 'Order, add, subtract, multiply and divide positive and negative whole numbers.',
    learn: {
      intro: `<p>Adding a negative number is the same as subtracting: 12 + (${MINUS}7) = 12 ${MINUS} 7 = 5. Subtracting a negative is the same as adding: 9 ${MINUS} (${MINUS}8) = 9 + 8 = 17.</p><p>When multiplying or dividing, two numbers with the same sign give a positive answer; different signs give a negative answer.</p>`,
      keyPoints: [`(${MINUS}5)² = 25, but ${MINUS}5² = ${MINUS}25: the square is done before the minus sign.`, 'Order of operations: brackets, powers, × and ÷ (left to right), then + and − (left to right).', 'On a number line, numbers get bigger to the right: −13 < −5.'],
      vocab: [['integer', 'a positive or negative whole number, or zero'], ['ascending', 'from smallest to largest'], ['descending', 'from largest to smallest']],
    },
    gen: ex301,
    levels: { 1: 'Comparing and ordering; adding and subtracting', 2: 'Temperatures; multiplying and dividing', 3: 'Order of operations; finding integers that fit; reasoning' },
  },
  {
    id: 'y9-num-decimals',
    title: 'Decimals',
    ref: ref('3.02'),
    outcomes: FRC,
    summary: 'Order, calculate with and round decimals, and work with recurring decimals.',
    learn: {
      intro: `<p>To compare decimals, give them the same number of decimal places: 0.7 = 0.700, which is less than 0.707.</p><p>A <b>recurring decimal</b> repeats forever. Dots go over the first and last digits that repeat: 0.583 333… = ${recHtml(0, '58', '3')} and 0.415 415… = ${recHtml(0, '', '415')}. A <b>terminating decimal</b> stops, like 0.875.</p>`,
      keyPoints: ['× 10, 100, 1000 moves the point right; ÷ moves it left.', 'To divide by a decimal, move both points the same number of places so you divide by a whole number.', 'To round, look at the next digit: 5 or more rounds up.', 'Round only at the end of a calculation.'],
      vocab: [['recurring decimal', 'a decimal with digits that repeat forever'], ['terminating decimal', 'a decimal that stops'], ['irrational number', 'a decimal that never stops and never repeats, such as π']],
    },
    gen: ex302,
    levels: { 1: 'Fractions and decimals; ordering; adding, subtracting; × and ÷ by powers of 10', 2: 'Problems; × and ÷ decimals; rounding', 3: 'Recurring decimals; rounding ranges; rounding too early' },
  },
  {
    id: 'y9-num-fractions',
    title: 'Fractions',
    ref: ref('3.03'),
    outcomes: FRC,
    summary: 'Compare, simplify and calculate with fractions and mixed numerals.',
    learn: {
      intro: `<p>To add or subtract, use a common denominator: ${frac(3, 5)} + ${frac(4, 7)} = ${frac(21, 35)} + ${frac(20, 35)} = ${frac(41, 35)} = 1${frac(6, 35)}.</p><p>To multiply, multiply the numerators and the denominators. To divide by a fraction, multiply by its reciprocal: ${frac(3, 5)} ${DIVIDE} ${frac(7, 11)} = ${frac(3, 5)} ${TIMES} ${frac(11, 7)}.</p>`,
      keyPoints: ['Change mixed numerals to improper fractions before multiplying or dividing.', '“Of” means multiply: ⅗ of 40 = 24.', 'Give answers in simplest form.'],
      vocab: [['reciprocal', 'a fraction turned upside down; a number times its reciprocal is 1'], ['improper fraction', 'a fraction bigger than 1, such as 13/4'], ['mixed numeral', 'a whole number and a fraction, such as 3¼']],
    },
    gen: ex303,
    levels: { 1: 'Mixed numerals; comparing; ordering; simplifying', 2: 'Adding, subtracting, multiplying and dividing', 3: 'Fractions between; missing numbers; problems' },
  },
  {
    id: 'y9-num-percent',
    title: 'Percentages',
    ref: ref('3.04'),
    outcomes: FRC,
    summary: 'Convert between percentages, fractions and decimals, and find a percentage of an amount.',
    learn: {
      intro: `<p>A percentage is a fraction out of 100: 24% = ${frac(24, 100)} = ${frac(6, 25)} = 0.24. To change a fraction or decimal to a percentage, multiply by 100%: ${frac(5, 8)} = 62.5%.</p>`,
      keyPoints: ['% → decimal: divide by 100. Decimal → %: multiply by 100.', 'For percentages like 5½% or 8.2%, multiply the top and bottom to clear the fraction or decimal.', 'To compare, change everything to percentages (or decimals).'],
      vocab: [['percentage', 'a number out of 100']],
    },
    gen: ex304,
    levels: { 1: 'Converting percentages, fractions and decimals', 2: 'Comparing and ordering; percentage of an amount', 3: 'Problems' },
  },
  {
    id: 'y9-num-applypct',
    title: 'Applying percentages',
    ref: ref('3.05'),
    outcomes: FRC,
    summary: 'Increase and decrease by a percentage, express amounts as percentages, and use the unitary method.',
    learn: {
      intro: '<p>To increase $200 by 7%, find 107% of it: 1.07 × $200 = $214. To decrease $150 by 12%, find 88%: 0.88 × $150 = $132.</p><p>The <b>unitary method</b> finds the whole from a part: if 9% is $86, then 1% is $86 ÷ 9 and 100% is that × 100.</p>',
      keyPoints: ['Percentage = amount ÷ whole × 100% (same units first).', 'Unitary method: find 1%, then 100%.', 'Increasing by 10% then decreasing by 10% does not get you back where you started.'],
      vocab: [['unitary method', 'finding the value of one part (or 1%) first']],
    },
    gen: ex305,
    levels: { 1: 'Increasing and decreasing', 2: 'Expressing as a percentage; comparing marks', 3: 'Unitary method; successive changes' },
  },
  {
    id: 'y9-num-profit',
    title: 'Profit, discounts and GST',
    ref: ref('3.06'),
    outcomes: FRC,
    summary: 'Calculate profit and loss, discounts and original prices, and GST.',
    learn: {
      intro: '<p>Profit = selling price − cost price. The percentage profit (or loss) is worked out on the <b>cost price</b>.</p><p>GST is 10% of the price before GST. A price that includes GST is 110% of the price before GST, so the GST is that price ÷ 11.</p>',
      keyPoints: ['Percentage profit = profit ÷ cost price × 100%.', 'A 25% discount means you pay 75%.', 'Original price from a sale price: use the unitary method.', 'Two discounts one after the other are less than their total.'],
      vocab: [['cost price', 'what the seller paid'], ['GST', 'goods and services tax: 10% added to most prices in Australia'], ['discount', 'an amount taken off a price']],
    },
    gen: ex306,
    levels: { 1: 'Profit and loss; sale prices', 2: 'Percentage discount; original price; cost price', 3: 'GST; successive discounts' },
  },
  {
    id: 'y9-num-interest',
    title: 'Simple interest',
    ref: ref('3.07'),
    outcomes: FIN,
    summary: 'Use I = Prn to find interest, and to find the rate or the time.',
    learn: {
      intro: `<p>Simple (flat-rate) interest is calculated on the original amount only: <b>I = Prn</b>, where ${v('P')} is the principal, ${v('r')} the interest rate per year as a decimal and ${v('n')} the number of years.</p><p>$18 000 at 3.5% p.a. for 5 years: I = 18 000 × 0.035 × 5 = $3150.</p>`,
      keyPoints: ['Write the time in years: 7 months = 7/12, 220 days = 220/365, 30 weeks = 30/52.', 'To find the rate or the time, substitute into I = Prn and solve.', 'Total (final value) = principal + interest.'],
      vocab: [['principal', 'the amount invested or borrowed'], ['per annum (p.a.)', 'per year'], ['flat rate', 'another name for simple interest']],
    },
    gen: ex307,
    levels: { 1: 'Interest over whole years', 2: 'Months, days and weeks', 3: 'Finding the rate or time; flat-rate loans' },
  },
  {
    id: 'y9-num-ratios',
    title: 'Ratios and rates',
    ref: ref('3.08'),
    outcomes: RAT,
    summary: 'Simplify ratios, divide amounts in a ratio, and solve rate problems.',
    learn: {
      intro: '<p>A <b>ratio</b> compares amounts in the same units: 425 mL : 5 L = 425 : 5000 = 17 : 200. To divide $420 in the ratio 3 : 4, there are 7 parts, so 1 part is $60: the shares are $180 and $240.</p><p>A <b>rate</b> compares different kinds of quantities: 600 km in 12 h is 50 km/h.</p>',
      keyPoints: ['Same units first, then divide by the HCF.', 'Unitary method: find 1 part first.', 'Rate a/b: to find a, multiply by the rate; to find b, divide by the rate.'],
      vocab: [['ratio', 'a comparison of quantities in the same units'], ['rate', 'a comparison of different quantities, such as km/h']],
    },
    gen: ex308,
    levels: { 1: 'Simplifying ratios (decimals, fractions, units)', 2: 'Ratio problems; dividing in a ratio; writing rates', 3: 'Rate problems' },
  },
  {
    id: 'y9-num-convert',
    title: 'Converting rates',
    ref: ref('3.09'),
    outcomes: RAT,
    summary: 'Change a rate into different units, such as m/s to km/h.',
    learn: {
      intro: '<p>Change one unit at a time. 5 m/s = 5 × 3600 m/h = 18 000 m/h = 18 km/h. 2 mL/min = 120 mL/h = 2880 mL/day = 2.88 L/day.</p>',
      keyPoints: ['A bigger time unit (per hour instead of per second) means more of the top quantity: multiply.', 'A bigger top unit (km instead of m) means a smaller number: divide.', 'm/s → km/h: × 3.6. km/h → m/s: ÷ 3.6.'],
    },
    gen: ex309,
    levels: { 1: 'One unit changes', 2: 'Both units change', 3: 'Speeds and stopping distances' },
  },
  {
    id: 'y9-num-powerplus',
    title: 'Power plus: numeracy challenges',
    ref: 'NCM 9 Power plus',
    tag: 'extension',
    outcomes: [...FRC, ...RAT, ...FIN],
    summary: 'Harder problems with fractions, percentages, ratios, speeds and interest.',
    learn: {
      intro: '<p>These problems need more than one step. Try a simple number (such as $100 or 120 km) to see what is happening, and check that your answer makes sense.</p>',
      keyPoints: ['A markup and a discount of the same percentage do not cancel out.', 'Average speed = total distance ÷ total time, not the average of the speeds.'],
    },
    gen: exPowerPlus3,
    levels: { 1: 'Fractions on a number line; working back from a percentage', 2: 'Markups; ratio puzzles', 3: 'Average speed; doubling with simple interest' },
  },
]
