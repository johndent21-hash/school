// Class games for New Century Maths 7 (3rd edition, Cengage) Chapter 5, Algebra and equations: one set of
// quick questions for each exercise, 5.01 to 5.13.
//
// The questions are the site's own. Every question is ONE step, done in the head in about 15 seconds, with four
// choices. The wrong choices are the usual mistakes: 3n read as n³, "7 less than n" written 7 − n, 5k + 1 at k = 3
// read as 53 + 1, adding the coefficients when multiplying terms, a sign lost with a negative, and so on.
// Algebra is written with ex(): italic pronumerals, the number first, letters in alphabetical order.
//
// Syllabus: NSW Mathematics K–10 (2022), Stage 4, Algebraic techniques MA4-ALG-C-01 (5.01–5.09) and
// Equations MA4-EQU-C-01 (5.10–5.13).
import type { GameChapter, GameQuestion, GameSet } from '@/lib/game/types'
import { D, DIVIDE, MINUS, TIMES, chance, ex, gq, int, mk, num, pick, sample, v } from './helpers'

const ALG = 'MA4-ALG-C-01'
const EQU = 'MA4-EQU-C-01'
const big = (s: string) => `<div class="big">${s}</div>`
const E = ex
/** pronumerals, leaving out letters easily misread (i, l, o) and e */
const LET = ['a', 'b', 'c', 'd', 'g', 'h', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'w', 'x', 'y', 'z']
const NAMES = ['Ava', 'Ravi', 'Mia', 'Noah', 'Zara', 'Jack', 'Priya', 'Kai', 'Lily', 'Sam', 'Ella', 'Omar']
const two = () => sample(LET, 2).sort() as [string, string]

/** a term: coefficient and letters, e.g. (3, 'ab') → "3ab", (1, 'x') → "x", (−1, 'x') → "-x" */
function term(c: number, vars: string): string {
  if (vars === '') return String(c)
  if (c === 1) return vars
  if (c === -1) return '-' + vars
  return `${c}${vars}`
}
/** a sum of terms, signs tidied: [[3, 'x'], [−2, 'y'], [5, '']] → "3x - 2y + 5" (zero terms left out) */
function sum(terms: [number, string][]): string {
  const ts = terms.filter(([c]) => c !== 0)
  if (!ts.length) return '0'
  return ts.map(([c, vs], i) => (i === 0 ? term(c, vs) : c < 0 ? ` - ${term(-c, vs)}` : ` + ${term(c, vs)}`)).join('')
}
/** three wrong whole numbers (negatives and 0 allowed), most likely first */
function numWrong(right: number, likely: number[]): number[] {
  const out: number[] = []
  for (const x of [...likely, right + 1, right - 1, right + 2, -right, right + 10]) {
    if (Number.isInteger(x) && x !== right && !out.includes(x)) out.push(x)
    if (out.length === 3) break
  }
  return out
}
const sol = (L: string, x: number) => E(`${L} = ${x}`)

// ================================================================== 5.01 The laws of arithmetic

function m501sum(): GameQuestion {
  let a: number, c: number
  if (chance(0.4)) {
    do a = int(11, 89)
    while (a % 10 === 0)
    c = 100 - a
  } else {
    const p = int(1, 9)
    a = 10 * int(1, 7) + p
    c = 10 * int(0, 3) + 10 - p
  }
  const m = int(12, 89)
  const [x, y] = chance() ? [a, c] : [c, a]
  const ans = a + c + m
  return gq({
    t: 'sum',
    prompt: `Evaluate:${big(`${x} + ${m} + ${y}`)}`,
    correct: num(ans),
    wrong: numWrong(ans, [ans - 10, ans + 10, ans - 1]).map((n) => num(n)),
    why: `Add the pair that makes a multiple of 10 first: ${x} + ${y} = ${a + c}, then ${a + c} + ${m} = ${ans}.`,
    meta: { a, c, m },
  })
}

function m501product(): GameQuestion {
  const [p, q] = pick([[5, 2], [2, 5], [25, 4], [4, 25], [50, 2], [2, 50], [20, 5], [5, 20]] as [number, number][])
  let k: number
  do k = int(3, 49)
  while (k % 10 === 0)
  const ans = p * q * k
  return gq({
    t: 'product',
    prompt: `Evaluate:${big(chance() ? `${p} ${TIMES} ${k} ${TIMES} ${q}` : `${k} ${TIMES} ${p} ${TIMES} ${q}`)}`,
    correct: num(ans),
    // added the friendly pair instead of multiplying, a zero too many, near miss
    wrong: numWrong(ans, [(p + q) * k, ans * 10, ans + k]).map((n) => num(n)),
    why: `Multiply the friendly pair first: ${p} ${TIMES} ${q} = ${p * q}, then ${p * q} ${TIMES} ${k} = ${num(ans)}.`,
    meta: { p, q, k },
  })
}

function m501tens(): GameQuestion {
  const a = int(2, 9)
  const b = int(2, 9)
  const za = int(0, 1)
  const zb = int(1, 3)
  const x = a * 10 ** za
  const y = b * 10 ** zb
  const ans = x * y
  return gq({
    t: 'tens',
    prompt: `Evaluate:${big(`${num(x)} ${TIMES} ${num(y)}`)}`,
    correct: num(ans),
    // a zero lost, a zero too many, two zeros too many, added
    wrong: numWrong(ans, [ans / 10, ans * 10, ans * 100, (a + b) * 10 ** (za + zb)]).map((n) => num(n)),
    why: `${num(x)} ${TIMES} ${num(y)} = ${a} ${TIMES} ${b} ${TIMES} ${num(10 ** (za + zb))} = ${a * b} ${TIMES} ${num(10 ** (za + zb))} = ${num(ans)}.`,
    meta: { x, y },
  })
}

const LAWS_TRUE = ['a + b = b + a', 'a * b = b * a', '(a + b) + c = a + (b + c)', '(a * b) * c = a * (b * c)', 'a + 0 = a', 'a * 1 = a']
const LAWS_FALSE = ['a - b = b - a', 'a ÷ b = b ÷ a', '(a - b) - c = a - (b - c)', '(a ÷ b) ÷ c = a ÷ (b ÷ c)', 'a - 0 = 0 - a', 'a * 0 = a']

const LAW_WHY: Record<string, string> = {
  'a + b = b + a': 'Numbers can be added in any order (the commutative law).',
  'a * b = b * a': 'Numbers can be multiplied in any order (the commutative law).',
  '(a + b) + c = a + (b + c)': 'When adding, the grouping does not matter (the associative law).',
  '(a * b) * c = a * (b * c)': 'When multiplying, the grouping does not matter (the associative law).',
  'a + 0 = a': 'Adding 0 leaves a number unchanged.',
  'a * 1 = a': 'Multiplying by 1 leaves a number unchanged.',
  'a - b = b - a': 'Subtracting in the other order changes the answer: 7 − 3 = 4 but 3 − 7 = −4.',
  'a ÷ b = b ÷ a': 'Dividing in the other order changes the answer: 6 ÷ 3 = 2 but 3 ÷ 6 = ½.',
  '(a - b) - c = a - (b - c)': 'With subtraction the grouping matters: (9 − 4) − 2 = 3 but 9 − (4 − 2) = 7.',
  '(a ÷ b) ÷ c = a ÷ (b ÷ c)': 'With division the grouping matters: (8 ÷ 4) ÷ 2 = 1 but 8 ÷ (4 ÷ 2) = 4.',
  'a - 0 = 0 - a': '7 − 0 = 7 but 0 − 7 = −7.',
  'a * 0 = a': 'Any number times 0 is 0, not the number itself.',
}

function m501law(): GameQuestion {
  const findTrue = chance()
  const right = pick(findTrue ? LAWS_TRUE : LAWS_FALSE)
  const others = sample(findTrue ? LAWS_FALSE : LAWS_TRUE, 3)
  return gq({
    t: 'law',
    prompt: `Which is ${findTrue ? '' : '<b>not</b> '}true for every value of ${v('a')}, ${v('b')} and ${v('c')}?`,
    correct: E(right),
    wrong: others.map(E),
    why: LAW_WHY[right],
    meta: { right, findTrue },
  })
}

const SET_501: GameSet = {
  id: 'ncm7-5.01',
  exercise: '5.01',
  ref: 'NCM 7 Ex 5.01',
  title: 'The laws of arithmetic',
  focus: 'Use the commutative and associative laws to add and multiply in the head, and know they fail for subtracting and dividing.',
  lessons: ['y7-alg-words'],
  outcomes: [ALG],
  makers: [mk('sum', m501sum), mk('product', m501product), mk('tens', m501tens), mk('law', m501law, 2)],
}

// ================================================================== 5.02 The distributive law

function m502nine(): GameQuestion {
  let n: number
  do n = int(13, 59)
  while (n % 10 === 0)
  const ans = 9 * n
  return gq({
    t: 'nine',
    prompt: `Evaluate:${big(`${n} ${TIMES} 9`)}`,
    correct: num(ans),
    // took away 9 or 1 instead of the number, added instead
    wrong: numWrong(ans, [10 * n - 9, 10 * n - 1, 11 * n]).map((x) => num(x)),
    why: `${n} ${TIMES} 9 = ${n} ${TIMES} 10 ${MINUS} ${n} ${TIMES} 1 = ${10 * n} ${MINUS} ${n} = ${ans}.`,
    meta: { n },
  })
}

function m502eleven(): GameQuestion {
  let n: number
  do n = int(13, 59)
  while (n % 10 === 0)
  const ans = 11 * n
  return gq({
    t: 'eleven',
    prompt: `Evaluate:${big(`${n} ${TIMES} 11`)}`,
    correct: num(ans),
    wrong: numWrong(ans, [10 * n + 11, 10 * n + 1, 9 * n]).map((x) => num(x)),
    why: `${n} ${TIMES} 11 = ${n} ${TIMES} 10 + ${n} ${TIMES} 1 = ${10 * n} + ${n} = ${ans}.`,
    meta: { n },
  })
}

function m502eightTwelve(): GameQuestion {
  let n: number
  do n = int(13, 45)
  while (n % 10 === 0)
  const k = pick([8, 12])
  const ans = k * n
  return gq({
    t: 'eightTwelve',
    prompt: `Evaluate:${big(`${n} ${TIMES} ${k}`)}`,
    correct: num(ans),
    wrong: numWrong(ans, k === 8 ? [10 * n - 2, 10 * n - n, 10 * n - 8] : [10 * n + 2, 10 * n + 12, 11 * n]).map((x) => num(x)),
    why:
      k === 8
        ? `${n} ${TIMES} 8 = ${n} ${TIMES} 10 ${MINUS} ${n} ${TIMES} 2 = ${10 * n} ${MINUS} ${2 * n} = ${ans}.`
        : `${n} ${TIMES} 12 = ${n} ${TIMES} 10 + ${n} ${TIMES} 2 = ${10 * n} + ${2 * n} = ${ans}.`,
    meta: { n, k },
  })
}

function m502blank(): GameQuestion {
  const a = int(6, 25)
  const r = int(1, 3)
  const t = int(1, 3)
  const kind = int(0, 2)
  let eq: string
  let ans: number
  let likely: number[]
  if (kind === 0) {
    const b = 10 * t + r
    eq = `${a} ${TIMES} ${b} = ${a} ${TIMES} ${10 * t} + ${a} ${TIMES} □`
    ans = r
    likely = [b, a, r + 1]
  } else if (kind === 1) {
    const b = 10 * t + 10 - r
    eq = `${a} ${TIMES} ${b} = ${a} ${TIMES} ${10 * t + 10} ${MINUS} ${a} ${TIMES} □`
    ans = r
    likely = [b, a, r + 1]
  } else {
    const b = 10 * t + r
    eq = `${a} ${TIMES} ${b} = ${a * 10 * t} + □`
    ans = a * r
    likely = [r, a, a * r + a]
  }
  return gq({
    t: 'blank',
    prompt: `What number goes in the box?${big(eq)}`,
    correct: num(ans),
    wrong: numWrong(ans, likely).map((x) => num(x)),
    why:
      kind === 0
        ? `${10 * t + r} = ${10 * t} + ${r}, so the box is ${ans}.`
        : kind === 1
          ? `${10 * t + 10 - r} = ${10 * t + 10} ${MINUS} ${r}, so the box is ${ans}.`
          : `${10 * t + r} = ${10 * t} + ${r}, and ${a} ${TIMES} ${r} = ${ans}.`,
    meta: { a, r, tens: t, kind },
  })
}

const SET_502: GameSet = {
  id: 'ncm7-5.02',
  exercise: '5.02',
  ref: 'NCM 7 Ex 5.02',
  title: 'The distributive law',
  focus: 'Multiply in the head by splitting a number into tens and ones: 23 × 9 = 23 × 10 − 23 × 1.',
  lessons: ['y7-alg-words'],
  outcomes: [ALG],
  makers: [mk('blank', m502blank), mk('nine', m502nine), mk('eleven', m502eleven), mk('eightTwelve', m502eightTwelve, 2)],
}

// ================================================================== 5.03 Variables

function m503simplify(): GameQuestion {
  const [L, M] = two()
  const kind = int(0, 6)
  const k = int(2, 6)
  const m = int(2, 5)
  const a = int(3, 9)
  const b = int(2, a - 1)
  const n = int(3, 5)
  const LM = L + M
  const [expr, right, wrong] = [
    [`${L} * ${k}`, `${k}${L}`, [`${L}^${k}`, `${L} + ${k}`, `frac{${L}}{${k}}`]],
    [`${L} * ${L}`, `${L}^2`, [`2${L}`, `${L} + 2`, `2${L}^2`]],
    [Array(n).fill(L).join(' + '), `${n}${L}`, [`${L}^${n}`, `${L} + ${n}`, `${n}${L}^${n}`]],
    [`${a}${L} + ${b}${L}`, `${a + b}${L}`, [`${a + b}${L}^2`, `${a * b}${L}`, `${a + b}`]],
    [`${a}${L} - ${b}${L}`, term(a - b, L), [`${a + b}${L}`, `${a - b}`, term(a - b, `${L}^2`)]],
    [`${k} * ${M} * ${m} * ${L}`, `${k * m}${LM}`, [...(k + m !== k * m ? [`${k + m}${LM}`] : []), `${k * m} + ${LM}`, `${2 * k * m}${LM}`, `${k * m}${L}^2${M}`]],
    [`${L} ÷ ${k}`, `frac{${L}}{${k}}`, [`${k}${L}`, `frac{${k}}{${L}}`, `${L} - ${k}`]],
  ][kind] as [string, string, string[]]
  return gq({
    t: 'simplify',
    prompt: `Simplify:${big(E(expr))}`,
    correct: E(right),
    wrong: wrong.map(E),
    why: [
      `Write the number first and leave out ${TIMES}: ${E(right)}.`,
      `${E(`${L} * ${L}`)} is ${v(L)} squared: ${E(right)}.`,
      `${n} lots of ${v(L)}: ${E(right)}.`,
      `${a} + ${b} = ${a + b}, so ${E(right)}.`,
      `${a} ${MINUS} ${b} = ${a - b}, so ${E(right)}.`,
      `Multiply the numbers (${k} ${TIMES} ${m} = ${k * m}), then the letters in alphabetical order: ${E(right)}.`,
      `Division is written as a fraction: ${E(right)}.`,
    ][kind],
    meta: { kind, expr },
  })
}

function m503notEqual(): GameQuestion {
  const L = pick(LET)
  const k = int(2, 4)
  const same = [`${L} * ${k}`, `${k} * ${L}`, k === 2 ? `${L} + ${L}` : k === 3 ? `${L} + ${L} + ${L}` : `2${L} + 2${L}`, `${k + 1}${L} - ${L}`, `${k + 2}${L} - 2${L}`]
  const odd = pick([`${L}^${k}`, `${L} + ${k}`, `${k} + ${L}`])
  return gq({
    t: 'notEqual',
    prompt: `Which is <b>not</b> equal to ${E(`${k}${L}`)}?`,
    correct: E(odd),
    wrong: sample(same, 3).map(E),
    why: `${E(`${k}${L}`)} means ${k} ${TIMES} ${v(L)}. ${E(odd)} is a different expression.`,
    meta: { L, k, odd },
  })
}

const SET_503: GameSet = {
  id: 'ncm7-5.03',
  exercise: '5.03',
  ref: 'NCM 7 Ex 5.03',
  title: 'Variables',
  focus: 'Use algebra’s shorthand: 3w for w × 3, b² for b × b, and a fraction for division.',
  lessons: ['y7-alg-words'],
  outcomes: [ALG],
  makers: [mk('simplify', m503simplify), mk('notEqual', m503notEqual, 2)],
}

// ================================================================== 5.04 Creating algebraic expressions

/** [phrase (with the pronumeral in italics), the expression, three wrong expressions] */
type Words = [string, string, string[]]
const WORDS: ((n: string, k: number) => Words)[] = [
  (n, k) => [`${k} more than ${v(n)}`, `${n} + ${k}`, [`${k}${n}`, `${n} - ${k}`, `${k} - ${n}`]],
  (n, k) => [`${k} less than ${v(n)}`, `${n} - ${k}`, [`${k} - ${n}`, `${n} + ${k}`, `frac{${n}}{${k}}`]],
  (n, k) => [`${v(n)} decreased by ${k}`, `${n} - ${k}`, [`${k} - ${n}`, `${k}${n}`, `${n} + ${k}`]],
  (n, k) => [`${k} decreased by ${v(n)}`, `${k} - ${n}`, [`${n} - ${k}`, `${k}${n}`, `${n} + ${k}`]],
  (n, k) => [`${v(n)} increased by ${k}`, `${n} + ${k}`, [`${k}${n}`, `${n} - ${k}`, `${n}^${k}`]],
  (n, k) => [`the product of ${k} and ${v(n)}`, `${k}${n}`, [`${k} + ${n}`, `${n}^${k}`, `frac{${n}}{${k}}`]],
  (n, k) => [`${v(n)} divided by ${k}`, `frac{${n}}{${k}}`, [`frac{${k}}{${n}}`, `${k}${n}`, `${n} - ${k}`]],
  (n, k) => [`the sum of ${v(n)} and ${k}`, `${n} + ${k}`, [`${k}${n}`, `${n} - ${k}`, `frac{${n}}{${k}}`]],
  (n) => [`triple ${v(n)}`, `3${n}`, [`${n}^3`, `${n} + 3`, `frac{${n}}{3}`]],
  (n) => [`half of ${v(n)}`, `frac{${n}}{2}`, [`2${n}`, `${n} - 2`, `frac{2}{${n}}`]],
  (n) => [`${v(n)} squared`, `${n}^2`, [`2${n}`, `${n} + 2`, `${n}^3`]],
  (n) => [`${v(n)} cubed`, `${n}^3`, [`3${n}`, `${n} + 3`, `${n}^2`]],
  (n) => [`one-tenth of ${v(n)}`, `frac{${n}}{10}`, [`10${n}`, `${n} - 10`, `frac{10}{${n}}`]],
]

function m504words(): GameQuestion {
  const n = pick(LET)
  const k = int(2, 12)
  const [phrase, right, wrong] = pick(WORDS)(n, k)
  return gq({
    t: 'words',
    prompt: `Which expression means ‘${phrase}’?`,
    correct: E(right),
    wrong: wrong.map(E),
    why: `‘${phrase}’ is ${E(right)}.`,
    meta: { n, k, right },
  })
}

const STORIES: ((k: number) => Words)[] = [
  () => [`A class has ${v('b')} boys and ${v('g')} girls. How many students are in the class?`, 'b + g', ['bg', 'b - g', 'g - b']],
  (k) => [`Each of ${v('n')} guests eats ${k} sausage rolls. How many sausage rolls are eaten?`, `${k}n`, [`n + ${k}`, `frac{n}{${k}}`, `frac{${k}}{n}`]],
  () => [`A class has ${v('d')} students and ${v('r')} of them are away. How many students are at school?`, 'd - r', ['r - d', 'd + r', 'dr']],
  (k) => [`Sushi rolls sell for $${k} each. How many dollars do ${v('s')} rolls earn?`, `${k}s`, [`s + ${k}`, `frac{s}{${k}}`, `frac{${k}}{s}`]],
  (k) => [`Jo is ${v('a')} years old. How old will Jo be in ${k} years?`, `a + ${k}`, [`${k}a`, `a - ${k}`, `${k} - a`]],
  (k) => [`${v('c')} cards are shared equally among ${k} players. How many cards does each player get?`, `frac{c}{${k}}`, [`${k}c`, `c - ${k}`, `frac{${k}}{c}`]],
  (k) => [`A box holds ${k} pens. How many pens are in ${v('p')} boxes?`, `${k}p`, [`p + ${k}`, `frac{p}{${k}}`, `frac{${k}}{p}`]],
]

function m504story(): GameQuestion {
  const k = int(2, 9)
  const [prompt, right, wrong] = pick(STORIES)(k)
  return gq({
    t: 'story',
    prompt,
    correct: E(right),
    wrong: wrong.map(E),
    why: `The expression is ${E(right)}.`,
    meta: { k, right },
  })
}

const TWO_STEP: ((n: string, k: number, m: number) => Words)[] = [
  (n, k, m) => [`${k} times the sum of ${v(n)} and ${m}`, `${k}(${n} + ${m})`, [`${k}${n} + ${m}`, `${n} + ${k * m}`, `${k} + ${n} + ${m}`]],
  (n, k) => [`double ${v(n)}, then subtract ${k}`, `2${n} - ${k}`, [`2(${n} - ${k})`, `${k} - 2${n}`, `2${n} + ${k}`]],
  (n, k, m) => [`${v(n)} multiplied by ${k}, then ${m} added`, `${k}${n} + ${m}`, [`${k}(${n} + ${m})`, `${m}${n} + ${k}`, `${k} + ${n} + ${m}`]],
  (n, k) => [`the sum of ${v(n)} and ${k}, divided by 2`, `frac{${n} + ${k}}{2}`, [`${n} + frac{${k}}{2}`, `2(${n} + ${k})`, `frac{${n}}{2} + ${k}`]],
]

function m504twoStep(): GameQuestion {
  const n = pick(LET)
  const k = int(2, 9)
  let m: number
  do m = int(2, 9)
  while (m === k)
  const [phrase, right, wrong] = pick(TWO_STEP)(n, k, m)
  return gq({
    t: 'twoStep',
    prompt: `Which expression means ‘${phrase}’?`,
    correct: E(right),
    wrong: wrong.map(E),
    why: `Do the steps in the order given: ${E(right)}.`,
    meta: { n, k, m, right },
  })
}

const SET_504: GameSet = {
  id: 'ncm7-5.04',
  exercise: '5.04',
  ref: 'NCM 7 Ex 5.04',
  title: 'Creating algebraic expressions',
  focus: 'Turn words into algebra: “7 less than n” is n − 7, “half of n” is n over 2.',
  lessons: ['y7-alg-words'],
  outcomes: [ALG],
  makers: [mk('words', m504words), mk('story', m504story), mk('twoStep', m504twoStep, 2)],
}

// ================================================================== 5.05 Substitution

function m505one(): GameQuestion {
  const L = pick(LET)
  const c = int(2, 9)
  const d = int(1, 9)
  const kind = int(0, 5)
  const neg = kind !== 1 && kind !== 5 && chance(0.3)
  let x = neg ? -int(1, 6) : int(2, 9)
  if (kind === 5) x = c * int(2, 9)
  const big1 = int(20, 50)
  const [expr, ans, likely] = [
    [`${L} + ${d + 10}`, x + d + 10, [x - d - 10, Math.abs(x) + d + 10]],
    [`${big1} - ${L}`, big1 - x, [big1 + x, x - big1]],
    [`${c}${L}`, c * x, [Number(`${c}${Math.abs(x)}`), c + x, -c * x]],
    [`${c}${L} + ${d}`, c * x + d, [Number(`${c}${Math.abs(x)}`) + d, c + x + d, -c * x + d]],
    [`${c}${L} - ${d}`, c * x - d, [Number(`${c}${Math.abs(x)}`) - d, c + x - d, -c * x - d]],
    [`frac{${L}}{${c}}`, x / c, [x * c, x - c]],
  ][kind] as [string, number, number[]]
  return gq({
    t: 'sub',
    prompt: `Find the value when ${E(`${L} = ${x}`)}:${big(E(expr))}`,
    correct: num(ans),
    // writing 5k as 53 when k = 3, adding instead of multiplying, a sign lost
    wrong: numWrong(ans, likely).map((n) => num(n)),
    why: `Replace ${v(L)} with ${num(x)}: the value is ${num(ans)}.`,
    meta: { L, x, expr },
  })
}

function m505many(): GameQuestion {
  const a = int(2, 9)
  const b = int(2, 15)
  const c = -int(1, 5)
  const k = int(10, 40)
  const kind = int(0, 5)
  const [expr, ans, likely] = [
    ['a + b - c', a + b - c, [a + b + c]],
    ['2b + c', 2 * b + c, [2 * b - c, Number(`2${b}`) + c]],
    [`ab - ${k}`, a * b - k, [a + b - k]],
    ['a - b', a - b, [b - a]],
    ['abc', a * b * c, [-a * b * c, a + b + c]],
    ['3a + c', 3 * a + c, [3 * a - c, Number(`3${a}`) + c]],
  ][kind] as [string, number, number[]]
  return gq({
    t: 'many',
    prompt: `If ${E(`a = ${a}`)}, ${E(`b = ${b}`)} and ${E(`c = ${c}`)}, find:${big(E(expr))}`,
    correct: num(ans),
    wrong: numWrong(ans, likely).map((n) => num(n)),
    why: `Replace each letter with its value, keeping the sign of ${E(`c = ${c}`)}: the value is ${num(ans)}.`,
    meta: { a, b, c, expr },
  })
}

function m505formula(): GameQuestion {
  const [Y, X] = pick([['d', 'c'], ['b', 't'], ['y', 'x'], ['P', 'n'], ['C', 'h']] as [string, string][])
  const m = int(2, 9)
  const q = int(1, 15)
  const plus = chance()
  const x = int(-3, 12)
  const ans = m * x + (plus ? q : -q)
  return gq({
    t: 'formula',
    prompt: `If ${E(`${Y} = ${m}${X} ${plus ? '+' : '-'} ${q}`)}, find ${v(Y)} when ${E(`${X} = ${x}`)}.`,
    correct: num(ans),
    wrong: numWrong(ans, [m * x + (plus ? -q : q), m + x + (plus ? q : -q), m * Math.abs(x) + (plus ? q : -q)]).map((n) => num(n)),
    why: `${E(`${Y} = ${m}`)} ${TIMES} ${x < 0 ? `(${num(x)})` : x} ${plus ? '+' : MINUS} ${q} = ${num(ans)}.`,
    meta: { Y, X, m, q, plus, x },
  })
}

function m505square(): GameQuestion {
  const L = pick(LET)
  if (chance()) {
    const k = int(2, 5)
    const x = int(2, 5)
    const ans = k * x * x
    return gq({
      t: 'square',
      prompt: `Find the value when ${E(`${L} = ${x}`)}:${big(E(`${k}${L}^2`))}`,
      correct: num(ans),
      // squared the k too, doubled instead of squaring
      wrong: numWrong(ans, [(k * x) ** 2, 2 * k * x, k * x + 2]).map((n) => num(n)),
      why: `Square first: ${x}² = ${x * x}, then ${k} ${TIMES} ${x * x} = ${ans}.`,
      meta: { L, k, x },
    })
  }
  const x = -int(2, 9)
  return gq({
    t: 'square',
    prompt: `Find the value when ${E(`${L} = ${x}`)}:${big(E(`${L}^2`))}`,
    correct: num(x * x),
    wrong: numWrong(x * x, [-(x * x), 2 * x, -2 * x]).map((n) => num(n)),
    why: `(${num(x)}) ${TIMES} (${num(x)}) = ${x * x}: a negative times a negative is positive.`,
    meta: { L, x },
  })
}

const SET_505: GameSet = {
  id: 'ncm7-5.05',
  exercise: '5.05',
  ref: 'NCM 7 Ex 5.05',
  title: 'Substitution',
  focus: 'Replace each pronumeral with its value and evaluate, taking care with negatives and with 5k meaning 5 × k.',
  lessons: ['y7-alg-sub'],
  outcomes: [ALG],
  makers: [mk('sub', m505one), mk('many', m505many, 2), mk('formula', m505formula, 2), mk('square', m505square, 2)],
}

// ================================================================== 5.06 Collecting variables

/** cups (each holding x balls), envelopes (y balls each) and loose balls, side by side */
function cupsAndBalls(cups: number, envs: number, balls: number): string {
  let body = ''
  let at = 14
  for (let i = 0; i < cups; i++) {
    body += `<polygon class="sh cup" points="${at},20 ${at + 44},20 ${at + 38},74 ${at + 6},74"/>`
    at += 56
  }
  for (let i = 0; i < envs; i++) {
    body += `<rect class="sh2 env" x="${at}" y="30" width="54" height="38"/><polyline class="ln" points="${at},30 ${at + 27},52 ${at + 54},30"/>`
    at += 66
  }
  for (let i = 0; i < balls; i++) {
    const col = i % 4
    const row = Math.floor(i / 4)
    body += `<circle class="obj ball" cx="${at + 10 + col * 24}" cy="${row === 0 ? 34 : 60}" r="9"/>`
  }
  const w = at + (balls ? Math.min(balls, 4) * 24 + 4 : 0) + 10
  const what = [cups && `${cups} ${cups === 1 ? 'cup' : 'cups'}`, envs && `${envs} ${envs === 1 ? 'envelope' : 'envelopes'}`, balls && `${balls} loose ${balls === 1 ? 'ball' : 'balls'}`].filter(Boolean).join(', ')
  return D.svg(w, 90, body, what, Math.min(420, w * 1.2))
}

function m506cups(): GameQuestion {
  const c = int(1, 4)
  const k = int(1, 7)
  const right = sum([[c, 'x'], [k, '']])
  return gq({
    t: 'cups',
    prompt: `Each cup holds ${v('x')} balls. How many balls are there altogether?`,
    diagram: cupsAndBalls(c, 0, k),
    correct: E(right),
    // counted the balls as cups, swapped the numbers, forgot the loose balls
    wrong: [`${c + k}x`, sum([[k, 'x'], [c, '']]), sum([[1, 'x'], [c + k, '']]), term(c, 'x'), sum([[c, 'x'], [k + 1, '']])].map(E),
    why: `${c} ${c === 1 ? 'cup' : 'cups'} hold ${E(term(c, 'x'))} balls, plus ${k} loose: ${E(right)}.`,
    meta: { c, k },
  })
}

function m506envelopes(): GameQuestion {
  const c = int(1, 3)
  const e = int(1, 3)
  const k = int(1, 5)
  const right = sum([[c, 'x'], [e, 'y'], [k, '']])
  return gq({
    t: 'envelopes',
    prompt: `Each cup holds ${v('x')} balls and each envelope holds ${v('y')} balls. How many balls are there altogether?`,
    diagram: cupsAndBalls(c, e, k),
    correct: E(right),
    wrong: [sum([[e, 'x'], [c, 'y'], [k, '']]), sum([[c, 'x'], [e, 'y']]), `${c + e + k}xy`, sum([[c + e, 'x'], [k, '']]), sum([[c, 'x'], [e, 'y'], [k + 1, '']])].map(E),
    why: `Cups: ${E(term(c, 'x'))}. Envelopes: ${E(term(e, 'y'))}. Loose balls: ${k}. Altogether ${E(right)}.`,
    meta: { c, e, k },
  })
}

function m506collect(): GameQuestion {
  const L = pick(['x', 'y', 'm', 'n'])
  const a = int(1, 6)
  const b = int(1, 6)
  const kind = int(0, 3)
  const [expr, cx, k] = [
    [`${L} + ${L} + ${a}`, 2, a],
    [`${a} + ${L} + ${b}`, 1, a + b],
    [`${L} + ${a} + ${L} + ${L}`, 3, a],
    [`${b + 1}${L} + ${a} + ${L}`, b + 2, a],
  ][kind] as [string, number, number]
  const right = sum([[cx, L], [k, '']])
  return gq({
    t: 'collect',
    prompt: `Simplify:${big(E(expr))}`,
    correct: E(right),
    // added everything into one term, a pronumeral missed, one out
    wrong: [`${cx + k}${L}`, sum([[cx - 1 || 2, L], [k, '']]), sum([[cx, L], [k + 1, '']]), `${cx * k}${L}`].map(E),
    why: `Collect the ${v(L)}s and collect the numbers: ${E(right)}.`,
    meta: { L, kind, a, b },
  })
}

const SET_506: GameSet = {
  id: 'ncm7-5.06',
  exercise: '5.06',
  ref: 'NCM 7 Ex 5.06',
  title: 'Collecting variables',
  focus: 'Model expressions with cups of x balls: x + x + 3 is 2x + 3.',
  lessons: ['y7-alg-like'],
  outcomes: [ALG],
  makers: [mk('cups', m506cups), mk('collect', m506collect), mk('envelopes', m506envelopes, 2)],
}

// ================================================================== 5.07 Adding and subtracting terms

/** a term's letters with powers, in order, e.g. [['a', 2], ['b', 1]] → "a^2b" */
const lettersOf = (ls: [string, number][]) => ls.map(([l, p]) => (p === 1 ? l : `${l}^${p}`)).join('')

function m507like(): GameQuestion {
  const [L, M] = two()
  const N = pick(LET.filter((x) => x !== L && x !== M))
  const shape = int(0, 3)
  const base: [string, number][] = [[[L, 1]], [[L, 2]], [[L, 1], [M, 1]], [[L, 2], [M, 1]]][shape] as [string, number][]
  const c0 = int(2, 9)
  let c1: number
  do c1 = int(2, 9)
  while (c1 === c0)
  // the like term: same letters and powers, the letters perhaps in another order
  const like = term(c1, lettersOf(chance() && base.length > 1 ? [...base].reverse() : base))
  const unlike = [
    [[[L, 2]], [[L, 1], [M, 1]], [[M, 1]]],
    [[[L, 1]], [[L, 3]], [[L, 2], [M, 1]]],
    [[[L, 1]], [[L, 1], [M, 2]], [[L, 1], [M, 1], [N, 1]]],
    [[[L, 1], [M, 2]], [[L, 2]], [[L, 1], [M, 1]]],
  ][shape] as [string, number][][]
  return gq({
    t: 'like',
    prompt: `Which is a like term to ${E(term(c0, lettersOf(base)))}?`,
    correct: E(like),
    wrong: unlike.map((u) => E(term(pick([1, c0, c1, int(2, 9)]), lettersOf(u)))),
    why: `Like terms have exactly the same letters with the same powers: ${E(like)}.`,
    meta: { base: lettersOf(base) },
  })
}

function m507collect(): GameQuestion {
  const [L, M] = two()
  const shape = int(0, 2)
  const T = [L, `${L}^2`, L + M][shape]
  const T2 = shape === 2 && chance() ? M + L : T
  const T4 = [`${L}^2`, `${L}^4`, `${L}^2${M}^2`][shape]
  const a = int(2, 9)
  const b = int(2, 9)
  const sub = a > b && chance()
  const s = sub ? a - b : a + b
  return gq({
    t: 'collect',
    prompt: `Simplify:${big(E(`${a}${T} ${sub ? '-' : '+'} ${b}${T2}`))}`,
    correct: E(term(s, T)),
    // the letters multiplied too, the numbers multiplied, the letters dropped
    wrong: [term(s, T4), term(a * b, T), String(s), term(sub ? a + b : Math.abs(a - b) || 1, T)].map(E),
    why: `${E(`${a}${T}`)} and ${E(`${b}${T2}`)} are like terms, so ${sub ? 'subtract' : 'add'} the numbers: ${a} ${sub ? MINUS : '+'} ${b} = ${s}, giving ${E(term(s, T))}.`,
    meta: { T, a, b, sub },
  })
}

function m507mixed(): GameQuestion {
  const [X, Y] = two()
  let a1: number, a2: number, b1: number, b2: number
  do {
    a1 = int(1, 9)
    a2 = int(1, 9)
    b1 = int(1, 9)
    b2 = int(1, 9)
  } while (a1 === a2 || b1 === b2 || a1 - a2 === b1 - b2)
  const cx = a1 - a2
  const cy = b1 - b2
  const right = sum([[cx, X], [cy, Y]])
  return gq({
    t: 'mixed',
    prompt: `Simplify:${big(E(sum([[a1, X], [b1, Y], [-a2, X], [-b2, Y]])))}`,
    correct: E(right),
    // a sign lost on one term or the other, the second x-term added
    wrong: [sum([[-cx, X], [cy, Y]]), sum([[cx, X], [-cy, Y]]), sum([[a1 + a2, X], [cy, Y]]), sum([[cx, X], [b1 + b2, Y]])].map(E),
    why: `${v(X)}-terms: ${a1} ${MINUS} ${a2} = ${num(cx)}. ${v(Y)}-terms: ${b1} ${MINUS} ${b2} = ${num(cy)}. Answer: ${E(right)}.`,
    meta: { a1, a2, b1, b2 },
  })
}

const SET_507: GameSet = {
  id: 'ncm7-5.07',
  exercise: '5.07',
  ref: 'NCM 7 Ex 5.07',
  title: 'Adding and subtracting terms',
  focus: 'Spot like terms and collect them: 5mn + 2nm = 7mn, but 3x² and 3x cannot be added.',
  lessons: ['y7-alg-like'],
  outcomes: [ALG],
  makers: [mk('like', m507like), mk('collect', m507collect), mk('mixed', m507mixed, 2)],
}

// ================================================================== 5.08 Multiplying terms

function m508mult(): GameQuestion {
  const [L, M] = two()
  const a = int(2, 9)
  // not 2 × 2, where adding the numbers gives the same as multiplying them
  const b = a === 2 ? int(3, 9) : int(2, 9)
  const kind = int(0, 3)
  const ab = a * b
  const [expr, right, wrong] = [
    [`${a} * ${b}${L}`, `${ab}${L}`, [`${a + b}${L}`, `${ab}${L}^2`, `${a}${L} + ${b}`]],
    [`${a}${L} * ${b}${M}`, `${ab}${L}${M}`, [`${a + b}${L}${M}`, `${ab}${L}${M}^2`, `${ab}${L}^2${M}^2`]],
    [`${a}${L} * ${b}${L}`, `${ab}${L}^2`, [`${ab}${L}`, `${a + b}${L}^2`, `${a + b}${L}`]],
    [`${a}${L} * ${b}${L}${M}`, `${ab}${L}^2${M}`, [`${ab}${L}${M}`, `${a + b}${L}^2${M}`, `${a + b}${L}${M}`]],
  ][kind] as [string, string, string[]]
  return gq({
    t: 'mult',
    prompt: `Simplify:${big(E(expr))}`,
    correct: E(right),
    wrong: wrong.map(E),
    why: `Multiply the numbers (${a} ${TIMES} ${b} = ${ab}), then the letters: ${E(right)}.`,
    meta: { kind, a, b },
  })
}

function m508powers(): GameQuestion {
  const [L, M] = two()
  const kind = int(0, 2)
  const n = int(3, 5)
  const p = int(2, 4)
  const q = p === 2 ? 3 : 2
  const k = int(2, 9)
  const [expr, right, wrong] = [
    [Array(n).fill(L).join(' * '), `${L}^${n}`, [`${n}${L}`, `${L} + ${n}`, `${L}^${n + 1}`]],
    [[...Array(p).fill(L), String(k)].join(' * '), `${k}${L}^${p}`, [`${k * p}${L}`, `${k}${L}^${p + 1}`, `${L}^${p} + ${k}`]],
    [[...Array(p).fill(L), ...Array(q).fill(M)].join(' * '), `${L}^${p}${M}^${q}`, [`${p}${L} + ${q}${M}`, `${L}^${q}${M}^${p}`, `${p * q}${L}${M}`]],
  ][kind] as [string, string, string[]]
  return gq({
    t: 'powers',
    prompt: `Simplify:${big(E(expr))}`,
    correct: E(right),
    wrong: wrong.map(E),
    why: `Count how many times each letter is multiplied: ${E(right)}.`,
    meta: { kind, n, p, k },
  })
}

function m508neg(): GameQuestion {
  const [L, M] = two()
  const a = int(2, 9)
  const b = a === 2 ? int(3, 9) : int(2, 9)
  const ab = a * b
  const kind = int(0, 3)
  const [expr, right, wrong] = [
    [`-${a}${L} * ${b}${M}`, `-${ab}${L}${M}`, [`${ab}${L}${M}`, `-${a + b}${L}${M}`, `-${ab}${L}^2${M}`]],
    [`${a}${L} * (-${b}${L})`, `-${ab}${L}^2`, [`${ab}${L}^2`, `-${ab}${L}`, `-${a + b}${L}^2`]],
    [`-${a}${L} * (-${b}${L})`, `${ab}${L}^2`, [`-${ab}${L}^2`, `${ab}${L}`, `-${a + b}${L}^2`]],
    [`${a}${L} * (-${b})`, `-${ab}${L}`, [`${ab}${L}`, `-${a + b}${L}`, `-${ab}${L}^2`]],
  ][kind] as [string, string, string[]]
  return gq({
    t: 'neg',
    prompt: `Simplify:${big(E(expr))}`,
    correct: E(right),
    wrong: wrong.map(E),
    why: `${kind === 2 ? 'A negative times a negative is positive' : 'A positive times a negative is negative'}, and ${a} ${TIMES} ${b} = ${ab}: ${E(right)}.`,
    meta: { kind, a, b },
  })
}

const SET_508: GameSet = {
  id: 'ncm7-5.08',
  exercise: '5.08',
  ref: 'NCM 7 Ex 5.08',
  title: 'Multiplying terms',
  focus: 'Multiply the numbers, then the letters; a letter times itself is a power: 3d × 4d = 12d².',
  lessons: ['y7-alg-muldiv'],
  outcomes: [ALG],
  makers: [mk('mult', m508mult), mk('powers', m508powers), mk('neg', m508neg, 2)],
}

// ================================================================== 5.09 Dividing terms

function m509div(): GameQuestion {
  const [L, M] = two()
  const k = int(2, 9)
  const a = int(2, 9)
  const kind = int(0, 2)
  const asFrac = chance()
  const show = (top: string, bottom: string) => (asFrac ? `frac{${top}}{${bottom}}` : `${top} ÷ ${bottom}`)
  const [expr, right, wrong] = [
    [show(`${k * a}${L}`, `${k}`), `${a}${L}`, [`${a}`, `${a}${L}^2`, `${k * a * k}${L}`]],
    [show(`${k * a}${L}`, `${k}${L}`), `${a}`, [`${a}${L}`, `${a}${L}^2`, `${k * a * k}`]],
    [show(`${k * a}${L}${M}`, `${k}${M}`), `${a}${L}`, [`${a}${L}${M}`, `${a}`, `${a}${M}`]],
  ][kind] as [string, string, string[]]
  return gq({
    t: 'div',
    prompt: `Simplify:${big(E(expr))}`,
    correct: E(right),
    wrong: wrong.map(E),
    why: `Divide the numbers (${k * a} ${DIVIDE} ${k} = ${a}) and cancel the letters that are on top and bottom: ${E(right)}.`,
    meta: { kind, k, a },
  })
}

function m509fracs(): GameQuestion {
  const [L, M] = two()
  const kind = int(0, 2)
  const k = int(2, 9)
  const a = int(2, 9)
  let p: number, q: number
  do {
    p = int(1, 8)
    q = int(p + 1, 9)
  } while ((p * k) % q === 0 || [2, 3, 5, 7].some((f) => p % f === 0 && q % f === 0))
  const [expr, right, wrong] = [
    [`frac{${p * k}${L}}{${q * k}${L}}`, `frac{${p}}{${q}}`, [`frac{${p}${L}}{${q}}`, `frac{${q}}{${p}}`, `frac{${p}}{${q}${L}}`]],
    [`frac{${k * a}${L}^2${M}}{${k}${L}}`, `${a}${L}${M}`, [`${a}${L}^2${M}`, `${a}${M}`, `${k * a * k}${L}${M}`]],
    [`-${k * a}${L} ÷ ${k}${L}`, `-${a}`, [`${a}`, `-${a}${L}`, `-${a}${L}^2`]],
  ][kind] as [string, string, string[]]
  return gq({
    t: 'fracs',
    prompt: `Simplify:${big(E(expr))}`,
    correct: E(right),
    wrong: wrong.map(E),
    why: `Divide the numbers by their highest common factor and cancel the common letters: ${E(right)}.`,
    meta: { kind, k, a, p, q },
  })
}

const SET_509: GameSet = {
  id: 'ncm7-5.09',
  exercise: '5.09',
  ref: 'NCM 7 Ex 5.09',
  title: 'Dividing terms',
  focus: 'Divide the numbers and cancel common letters: 15ap ÷ 5p = 3a.',
  lessons: ['y7-alg-muldiv'],
  outcomes: [ALG],
  makers: [mk('div', m509div), mk('fracs', m509fracs, 2)],
}

// ================================================================== 5.10 Equations

function m510inspect(): GameQuestion {
  const L = pick(LET)
  const a = int(2, 9)
  const kind = int(0, 4)
  // for L ÷ a = q the solution is a × q
  const q = int(2, 9)
  const x = kind === 3 ? a * q : int(2, 15)
  const [eq, likely] = [
    [`${L} + ${a} = ${x + a}`, [x + 2 * a, a]],
    [`${L} - ${a} = ${x - a}`, [x - 2 * a, a]],
    [`${a}${L} = ${a * x}`, [a * x - a, a * a * x]],
    [`frac{${L}}{${a}} = ${q}`, [q, q + a, q - a]],
    [`${x + a} - ${L} = ${a}`, [x + 2 * a, a]],
  ][kind] as [string, number[]]
  return gq({
    t: 'inspect',
    prompt: `Solve:${big(E(eq))}`,
    correct: sol(L, x),
    wrong: numWrong(x, likely).map((n) => sol(L, n)),
    why: `${sol(L, x)} makes both sides equal. Check by substituting.`,
    meta: { L, kind, x, a },
  })
}

function m510check(): GameQuestion {
  const L = pick(LET)
  const a = int(2, 6)
  const x = int(2, 12)
  const b = int(2, 20)
  const plus = chance()
  const c = a * x + (plus ? b : -b)
  return gq({
    t: 'check',
    prompt: `Which value is the solution?${big(E(`${a}${L} ${plus ? '+' : '-'} ${b} = ${c}`))}`,
    correct: sol(L, x),
    // undid the + or − the wrong way, forgot to divide, divided first
    wrong: numWrong(x, [(c + (plus ? b : -b)) / a, c + (plus ? -b : b), c / a + (plus ? -b : b), x + 1]).map((n) => sol(L, n)),
    why: `${a} ${TIMES} ${x} ${plus ? '+' : MINUS} ${b} = ${c}, so ${sol(L, x)} is the solution.`,
    meta: { L, a, x, b, plus },
  })
}

function m510isEq(): GameQuestion {
  const L = pick(LET)
  const a = int(2, 9)
  const b = int(1, 9)
  const c = a * int(2, 9) + b
  const eqs = [`${a}${L} + ${b} = ${c}`, `${L} - ${b} = ${a}`, `${c} = ${a}${L} + ${b}`, `${a}(${L} + ${b}) = ${a * (b + 5)}`]
  const exprs = [`${a}${L} + ${b}`, `${c} - ${a}${L}`, `${a}(${L} + ${b})`, `${L} + ${L} + ${b}`]
  const findEq = chance()
  return gq({
    t: 'isEq',
    prompt: findEq ? 'Which of these is an equation?' : 'Which of these is an expression, not an equation?',
    correct: E(pick(findEq ? eqs : exprs)),
    wrong: sample(findEq ? exprs : eqs, 3).map(E),
    why: 'An equation has an equals sign: it says two expressions have the same value. An expression has no equals sign.',
    meta: { findEq },
  })
}

const SET_510: GameSet = {
  id: 'ncm7-5.10',
  exercise: '5.10',
  ref: 'NCM 7 Ex 5.10',
  title: 'Equations',
  focus: 'Tell an equation from an expression, and solve simple equations by inspection, checking by substituting.',
  lessons: ['y7-eq-one'],
  outcomes: [EQU],
  makers: [mk('isEq', m510isEq), mk('inspect', m510inspect), mk('check', m510check, 2)],
}

// ================================================================== 5.11 One-step equations

function m511solve(): GameQuestion {
  const L = pick(LET)
  const a = int(2, 12)
  const kind = int(0, 5)
  // for L ÷ a = q the solution is a × q
  const q = int(2, 9)
  const x = kind === 5 ? a * q : chance(0.3) ? -int(1, 9) : int(2, 15)
  const [eq, likely] = [
    [`${L} + ${a} = ${x + a}`, [x + 2 * a, -x]],
    [`${a} + ${L} = ${x + a}`, [x + 2 * a, -x]],
    [`${L} - ${a} = ${x - a}`, [x - 2 * a, -x]],
    [`${x - a} = ${L} - ${a}`, [x - 2 * a, -x]],
    [`${a}${L} = ${a * x}`, [a * x - a, a * a * x, -x]],
    [`frac{${L}}{${a}} = ${q}`, [q, q + a, q - a]],
  ][kind] as [string, number[]]
  return gq({
    t: 'solve',
    prompt: `Solve:${big(E(eq))}`,
    correct: sol(L, x),
    wrong: numWrong(x, likely).map((n) => sol(L, n)),
    why: `Do the inverse operation to both sides: ${sol(L, x)}.`,
    meta: { L, kind, x, a },
  })
}

function m511step(): GameQuestion {
  const L = pick(LET)
  const a = int(2, 12)
  const x = int(2, 12)
  const kind = int(0, 3)
  const OPS = [`Add ${a}`, `Subtract ${a}`, `Multiply by ${a}`, `Divide by ${a}`]
  const [eq, right] = [
    [`${L} + ${a} = ${x + a}`, 1],
    [`${L} - ${a} = ${x - a}`, 0],
    [`${a}${L} = ${a * x}`, 3],
    [`frac{${L}}{${a}} = ${x}`, 2],
  ][kind] as [string, number]
  return gq({
    t: 'step',
    prompt: `To solve this equation, what do you do to both sides?${big(E(eq))}`,
    correct: OPS[right],
    inOrder: OPS,
    why: `Undo what is done to ${v(L)} with the inverse operation: ${OPS[right].toLowerCase()}.`,
    meta: { L, a, x, kind },
  })
}

const SET_511: GameSet = {
  id: 'ncm7-5.11',
  exercise: '5.11',
  ref: 'NCM 7 Ex 5.11',
  title: 'One-step equations',
  focus: 'Solve one-step equations by doing the inverse operation to both sides.',
  lessons: ['y7-eq-one'],
  outcomes: [EQU],
  makers: [mk('step', m511step), mk('solve', m511solve)],
}

// ================================================================== 5.12 Two-step equations

function m512two(): GameQuestion {
  const L = pick(LET)
  const a = int(2, 9)
  const x = int(1, 10)
  const b = int(1, 20)
  const plus = chance()
  const c = a * x + (plus ? b : -b)
  return gq({
    t: 'two',
    prompt: `Solve:${big(E(`${a}${L} ${plus ? '+' : '-'} ${b} = ${c}`))}`,
    correct: sol(L, x),
    wrong: numWrong(x, [(c + (plus ? b : -b)) / a, c + (plus ? -b : b), c / a - (plus ? b : -b)]).map((n) => sol(L, n)),
    why: `${plus ? 'Subtract' : 'Add'} ${b}: ${E(`${a}${L} = ${a * x}`)}. Divide by ${a}: ${sol(L, x)}.`,
    meta: { L, a, x, b, plus },
  })
}

function m512neg(): GameQuestion {
  const L = pick(LET)
  const a = int(2, 7)
  const b = int(1, 15)
  const negA = chance()
  let x = negA ? int(-5, 6) : -int(1, 8)
  if (x === 0) x = 3
  const A = negA ? -a : a
  const c = A * x + b
  return gq({
    t: 'neg',
    prompt: `Solve:${big(E(`${term(A, L)} + ${b} = ${c}`))}`,
    correct: sol(L, x),
    // the sign of the answer lost, b added instead of subtracted
    wrong: numWrong(x, [-x, (c + b) / A, (c - b) / -A]).map((n) => sol(L, n)),
    why: `Subtract ${b}: ${E(`${term(A, L)} = ${c - b}`)}. Divide by ${num(A)}: ${sol(L, x)}.`,
    meta: { L, A, x, b },
  })
}

function m512first(): GameQuestion {
  const L = pick(LET)
  const a = int(2, 9)
  let b: number
  do b = int(1, 12)
  while (b === a)
  const x = int(1, 9)
  const plus = chance()
  const c = a * x + (plus ? b : -b)
  const name = pick(NAMES)
  const OPS = [`Subtract ${b}`, `Add ${b}`, `Divide by ${a}`, `Subtract ${a}`]
  return gq({
    t: 'first',
    prompt: `${name} solves ${E(`${a}${L} ${plus ? '+' : '-'} ${b} = ${c}`)} and first writes ${E(`${a}${L} = ${a * x}`)}. What was done to both sides?`,
    correct: OPS[plus ? 0 : 1],
    inOrder: OPS,
    why: `${c} ${plus ? MINUS : '+'} ${b} = ${a * x}: ${OPS[plus ? 0 : 1]} ${plus ? 'from' : 'to'} both sides.`,
    meta: { L, a, b, x, plus },
  })
}

function m512frac(): GameQuestion {
  const L = pick(LET)
  const a = int(2, 6)
  const b = int(1, 9)
  const kind = int(0, 2)
  let x: number, eq: string, likely: number[]
  if (kind === 0) {
    const c = b + int(1, 8)
    x = a * (c - b)
    eq = `frac{${L}}{${a}} + ${b} = ${c}`
    likely = [a * c - b, a * (c + b), c - b]
  } else if (kind === 1) {
    const c = int(1, 8)
    x = a * (c + b)
    eq = `frac{${L}}{${a}} - ${b} = ${c}`
    likely = [a * c + b, a * (c - b), c + b]
  } else {
    const c = int(2, 8)
    x = a * c - b
    eq = `frac{${L} + ${b}}{${a}} = ${c}`
    likely = [a * (c - b), a * c + b, c - b]
  }
  return gq({
    t: 'fracEq',
    prompt: `Solve:${big(E(eq))}`,
    correct: sol(L, x),
    wrong: numWrong(x, likely).map((n) => sol(L, n)),
    why: `Undo the steps in reverse order: ${sol(L, x)}. Check: substitute ${num(x)} back in.`,
    meta: { L, a, b, kind, x },
  })
}

const SET_512: GameSet = {
  id: 'ncm7-5.12',
  exercise: '5.12',
  ref: 'NCM 7 Ex 5.12',
  title: 'Two-step equations',
  focus: 'Solve two-step equations by undoing the steps in reverse order, then check.',
  lessons: ['y7-eq-two'],
  outcomes: [EQU],
  makers: [mk('first', m512first), mk('two', m512two), mk('neg', m512neg, 2), mk('fracEq', m512frac, 2)],
}

// ================================================================== 5.13 Equation problems

function m513model(): GameQuestion {
  const kind = int(0, 4)
  const k = int(3, 9)
  const ans = int(4, 15)
  const name = pick(NAMES)
  const [prompt, right, wrong] = [
    [`${k} tickets cost $${k * ans} altogether. ${v('t')} is the price of one ticket. Which equation fits?`, `${k}t = ${k * ans}`, [`t + ${k} = ${k * ans}`, `frac{t}{${k}} = ${k * ans}`, `${k * ans}t = ${k}`]],
    [`A number ${v('n')} is doubled and the result is ${2 * ans}. Which equation fits?`, `2n = ${2 * ans}`, [`n + 2 = ${2 * ans}`, `frac{n}{2} = ${2 * ans}`, `n^2 = ${2 * ans}`]],
    [`A number ${v('y')} has ${k} taken away and the result is ${ans}. Which equation fits?`, `y - ${k} = ${ans}`, [`${k} - y = ${ans}`, `y + ${k} = ${ans}`, `${k}y = ${ans}`]],
    [`${name} has ${v('b')} stickers. Jo has ${k} times as many, which is ${k * ans}. Which equation fits?`, `${k}b = ${k * ans}`, [`b + ${k} = ${k * ans}`, `b = ${k} * ${k * ans}`, `b - ${k} = ${k * ans}`]],
    [`${name} is ${v('s')} years old. In ${k} years ${name} will be ${ans + k}. Which equation fits?`, `s + ${k} = ${ans + k}`, [`${k}s = ${ans + k}`, `s - ${k} = ${ans + k}`, `s = ${ans + k} + ${k}`]],
  ][kind] as [string, string, string[]]
  return gq({
    t: 'model',
    prompt,
    correct: E(right),
    wrong: wrong.map(E),
    why: `${E(right)} says the same thing as the words. (Its solution is ${num(ans)}.)`,
    meta: { kind, k, ans },
  })
}

function m513solve(): GameQuestion {
  const kind = int(0, 3)
  const k = int(2, 9)
  const ans = int(3, 15)
  const [prompt, likely] = [
    [`A number is doubled and the result is ${2 * ans}. What is the number?`, [4 * ans, 2 * ans - 2]],
    [`A number has ${k} taken away and the result is ${ans}. What is the number?`, [ans - k, k * ans]],
    [`A number is divided by ${k} and the result is ${ans}. What is the number?`, [ans + k, ans - k]],
    [`${k} tickets cost $${k * ans} altogether. How many dollars is one ticket?`, [k * ans - k, k * ans + k]],
  ][kind] as [string, number[]]
  const right = kind === 1 ? ans + k : kind === 2 ? ans * k : ans
  return gq({
    t: 'solveWords',
    prompt,
    correct: num(right),
    wrong: numWrong(right, likely).map((n) => num(n)),
    why: [
      `${E(`2n = ${2 * ans}`)}, so ${E(`n = ${ans}`)}.`,
      `${E(`n - ${k} = ${ans}`)}, so ${E(`n = ${ans + k}`)}.`,
      `${E(`frac{n}{${k}} = ${ans}`)}, so ${E(`n = ${ans * k}`)}.`,
      `${E(`${k}t = ${k * ans}`)}, so ${E(`t = ${ans}`)}.`,
    ][kind],
    meta: { kind, k, ans },
  })
}

function m513think(): GameQuestion {
  const k = int(2, 9)
  const m = int(1, 15)
  const ans = int(2, 12)
  const plus = chance()
  const R = k * ans + (plus ? m : -m)
  const name = pick(NAMES)
  return gq({
    t: 'think',
    prompt: `${name} thinks of a number, multiplies it by ${k}, then ${plus ? `adds ${m}` : `subtracts ${m}`}. The answer is ${R}. What was the number?`,
    correct: num(ans),
    // undid in the wrong order, undid the + or − the wrong way
    wrong: numWrong(ans, [R / k - (plus ? m : -m), (R + (plus ? m : -m)) / k, R - (plus ? m : -m)]).map((n) => num(n)),
    why: `${E(`${k}n ${plus ? '+' : '-'} ${m} = ${R}`)}: ${plus ? 'subtract' : 'add'} ${m} to get ${k * ans}, then divide by ${k}: ${ans}.`,
    meta: { k, m, ans, plus },
  })
}

const SET_513: GameSet = {
  id: 'ncm7-5.13',
  exercise: '5.13',
  ref: 'NCM 7 Ex 5.13',
  title: 'Equation problems',
  focus: 'Write an equation for a word problem, solve it and answer the question.',
  lessons: ['y7-eq-words'],
  outcomes: [EQU],
  makers: [mk('model', m513model), mk('solveWords', m513solve), mk('think', m513think, 2)],
}

export const NCM7_CH5: GameChapter = {
  id: 'ncm7-ch5',
  number: 5,
  title: 'Algebra and equations',
  ref: 'NCM 7 Chapter 5',
  strand: 'Number and algebra',
  outcomes: [ALG, EQU],
  sets: [SET_501, SET_502, SET_503, SET_504, SET_505, SET_506, SET_507, SET_508, SET_509, SET_510, SET_511, SET_512, SET_513],
  colour: 165,
  topics: ['y7-algebra', 'y7-equations'],
}

