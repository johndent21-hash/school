// Class games for New Century Maths 7 (3rd edition, Cengage) Chapter 3, Whole numbers: one set of quick
// questions for each exercise, 3.01 to 3.12.
//
// The questions are the site's own. Every question is ONE step, done in the head in about 15 seconds, with
// four choices. The wrong choices are the usual mistakes: rounding the wrong way or to the wrong place,
// doubling once instead of twice, mixing up the base and the index, halving instead of square-rooting,
// giving a common factor that is not the highest, and so on.
//
// Syllabus: NSW Mathematics K–10 (2022), Stage 4. Indices MA4-IND-C-01 (divisibility tests, powers, square and
// cube roots, primes and prime factors); Fractions, decimals and percentages MA4-FRC-C-01 (the HCF of 2 whole
// numbers). Rounding, mental multiplication and division are revision of Stage 3; long division, Roman numerals
// and the lowest common multiple are marked as extension in the textbook.
//
// Audit against the textbook, exercise by exercise (Nov 2026): added common factors (3.11) and multiples
// (3.12).
import type { GameChapter, GameQuestion, GameSet } from '@/lib/game/types'
import { DIVIDE, TIMES, chance, gq, int, mk, num, pick, sample, shuffle } from './helpers'

const IND = 'MA4-IND-C-01'
const FRC = 'MA4-FRC-C-01'
const big = (s: string) => `<div class="big">${s}</div>`
const b = (s: string) => `<b>${s}</b>`
const sup = (s: string | number) => `<sup>${s}</sup>`
/** three wrong whole numbers: likely mistakes first, then near misses; never the answer, never 0 or less */
function wholeWrong(right: number, likely: number[]): string[] {
  const out: number[] = []
  for (const x of [...likely, right + 1, right - 1, right * 10, right + 10, right + 2]) {
    if (x !== right && x > 0 && Number.isInteger(x) && !out.includes(x)) out.push(x)
    if (out.length === 3) break
  }
  return out.map((x) => num(x))
}
const REVISION = 'Revision of Stage 3: the Stage 4 syllabus has no content point of its own for this.'
const EXTENSION = 'Marked as extension in the textbook.'

// ================================================================== 3.01 Rounding and estimating

function m301round(): GameQuestion {
  const [place, p] = pick([
    ['ten', 10],
    ['hundred', 100],
    ['thousand', 1000],
  ] as [string, number][])
  let x: number
  do x = int(p * 3, p * 98) + int(1, p - 1)
  while (x % p === 0 || Math.round(x / p) * p === x || (x % p) * 2 === p)
  const up = Math.ceil(x / p) * p
  const down = Math.floor(x / p) * p
  const right = Math.round(x / p) * p
  return gq({
    t: 'round',
    prompt: `Round ${b(num(x))} to the nearest ${place}.`,
    correct: num(right),
    wrong: wholeWrong(right, [right === up ? down : up, Math.round(x / (p * 10)) * p * 10, Math.round(x / (p / 10 || 1)) * (p / 10 || 1)]),
    why: `${num(x)} is between ${num(down)} and ${num(up)}, and nearer to ${num(right)}.`,
    meta: { x, p },
  })
}

function m301estimate(): GameQuestion {
  let a: number, c: number
  do {
    a = int(12, 89)
    c = int(12, 89)
  } while (a % 10 === 0 || c % 10 === 0 || a % 10 === 5 || c % 10 === 5)
  const ra = Math.round(a / 10) * 10
  const rc = Math.round(c / 10) * 10
  return gq({
    t: 'estimate',
    prompt: `Estimate by rounding each number to the nearest ten:${big(`${a} ${TIMES} ${c}`)}`,
    correct: num(ra * rc),
    wrong: wholeWrong(ra * rc, [Math.floor(a / 10) * 10 * (Math.floor(c / 10) * 10), ra + rc, ra * rc * 10, ra * rc + 100]),
    why: `${a} ≈ ${ra} and ${c} ≈ ${rc}, so ${a} ${TIMES} ${c} ≈ ${ra} ${TIMES} ${rc} = ${num(ra * rc)}.`,
    meta: { a, c },
  })
}

function m301sum(): GameQuestion {
  const xs = Array.from({ length: 3 }, () => int(11, 98) * 10 + pick([1, 2, 3, 7, 8, 9]))
  const rs = xs.map((x) => Math.round(x / 100) * 100)
  const est = rs.reduce((s, x) => s + x, 0)
  return gq({
    t: 'sum',
    prompt: `Estimate by rounding each number to the nearest hundred:${big(xs.map((x) => num(x)).join(' + '))}`,
    correct: num(est),
    wrong: wholeWrong(est, [est + 100, est - 100, est * 10]),
    why: `${rs.map((x) => num(x)).join(' + ')} = ${num(est)}.`,
    meta: { xs },
  })
}

const SET_301: GameSet = {
  id: 'ncm7-3.01',
  exercise: '3.01',
  ref: 'NCM 7 Ex 3.01',
  title: 'Rounding and estimating',
  focus: 'Round whole numbers and estimate answers by rounding first.',
  outcomes: [],
  teacherNote: REVISION,
  makers: [mk('round', m301round), mk('sum', m301sum), mk('estimate', m301estimate, 2)],
}

// ================================================================== 3.02 Multiplying numbers

function m302times4(): GameQuestion {
  const n = int(13, 49)
  return gq({
    t: 'times4',
    prompt: `Work out mentally (double, then double again):${big(`${n} ${TIMES} 4`)}`,
    correct: num(4 * n),
    wrong: wholeWrong(4 * n, [2 * n, 4 * n + 4, n * 40]),
    why: `${n} doubled is ${2 * n}; doubled again is ${4 * n}.`,
    meta: { n, k: 4 },
  })
}
function m302times5(): GameQuestion {
  const n = 2 * int(7, 49)
  return gq({
    t: 'times5',
    prompt: `Work out mentally (halve, then multiply by 10):${big(`${n} ${TIMES} 5`)}`,
    correct: num(5 * n),
    wrong: wholeWrong(5 * n, [n / 2, 10 * n, 5 * n + 10]),
    why: `Half of ${n} is ${n / 2}, and ${n / 2} ${TIMES} 10 = ${5 * n}.`,
    meta: { n, k: 5 },
  })
}
function m302times9(): GameQuestion {
  const n = int(12, 39)
  return gq({
    t: 'times9',
    prompt: `Work out mentally (multiply by 10, then subtract the number):${big(`${n} ${TIMES} 9`)}`,
    correct: num(9 * n),
    wrong: wholeWrong(9 * n, [10 * n, 10 * n - 9, 9 * n + 9]),
    why: `${n} ${TIMES} 10 = ${10 * n}, and ${10 * n} − ${n} = ${9 * n}.`,
    meta: { n, k: 9 },
  })
}
function m302story(): GameQuestion {
  const each = pick([12, 15, 18, 25, 24])
  const count = pick([4, 5, 8, 10, 20])
  const who = pick(['Mia', 'Josh', 'Aroha', 'Lachlan', 'Priya'])
  return gq({
    t: 'story',
    prompt: `${who} buys ${count} tickets at $${each} each. How much is that altogether?`,
    correct: `$${num(each * count)}`,
    wrong: wholeWrong(each * count, [each + count, each * count + each, each * count - each]).map((x) => `$${x}`),
    why: `${count} ${TIMES} $${each} = $${num(each * count)}.`,
    meta: { each, count },
  })
}

const SET_302: GameSet = {
  id: 'ncm7-3.02',
  exercise: '3.02',
  ref: 'NCM 7 Ex 3.02',
  title: 'Multiplying numbers',
  focus: 'Multiply mentally by 4, 5 and 9 using doubling, halving and “times 10 then subtract”.',
  lessons: [],
  outcomes: [],
  teacherNote: REVISION,
  makers: [mk('times4', m302times4), mk('times5', m302times5), mk('times9', m302times9), mk('story', m302story)],
}

// ================================================================== 3.03 Dividing numbers

function m303by5(): GameQuestion {
  // an even answer, so the number divided is a multiple of 10 and the first step has no decimal
  const q = 2 * int(6, 49)
  const n = q * 5
  return gq({
    t: 'by5',
    prompt: `Work out mentally (divide by 10, then double):${big(`${num(n)} ${DIVIDE} 5`)}`,
    correct: num(q),
    wrong: wholeWrong(q, [n / 10, q * 10, q + 5]),
    why: `${num(n)} ${DIVIDE} 10 = ${n / 10}, and ${n / 10} doubled is ${q}.`,
    meta: { n, d: 5 },
  })
}
function m303by4(): GameQuestion {
  const q = int(12, 75)
  const n = 4 * q
  return gq({
    t: 'by4',
    prompt: `Work out mentally (halve, then halve again):${big(`${num(n)} ${DIVIDE} 4`)}`,
    correct: num(q),
    wrong: wholeWrong(q, [n / 2, q + 4, q * 2 + 1]),
    why: `Half of ${n} is ${n / 2}; half again is ${q}.`,
    meta: { n, d: 4 },
  })
}
function m303tens(): GameQuestion {
  const d = pick([20, 30, 40, 50, 60, 70, 80, 90])
  const q = pick([2, 3, 4, 5, 6, 7, 8, 9, 20, 30, 40])
  const n = d * q
  return gq({
    t: 'tens',
    prompt: `Work out mentally:${big(`${num(n)} ${DIVIDE} ${d}`)}`,
    correct: num(q),
    wrong: wholeWrong(q, [q * 10, q / 10, n / 10]),
    why: `Divide both by 10 first: ${num(n / 10)} ${DIVIDE} ${d / 10} = ${q}.`,
    meta: { n, d },
  })
}
function m303boxes(): GameQuestion {
  const size = pick([4, 6, 8, 12])
  const full = int(5, 12)
  const extra = int(1, size - 1)
  const n = size * full + extra
  return gq({
    t: 'boxes',
    prompt: `${n} eggs are packed into cartons of ${size}. How many cartons can be filled completely?`,
    correct: num(full),
    wrong: wholeWrong(full, [full + 1, extra, n - size]),
    why: `${n} ${DIVIDE} ${size} = ${full} remainder ${extra}, so ${full} full cartons (with ${extra} ${extra === 1 ? 'egg' : 'eggs'} left over).`,
    meta: { n, size },
  })
}

const SET_303: GameSet = {
  id: 'ncm7-3.03',
  exercise: '3.03',
  ref: 'NCM 7 Ex 3.03',
  title: 'Dividing numbers',
  focus: 'Divide mentally by 4, 5 and multiples of 10, and deal with remainders in a story.',
  outcomes: [],
  teacherNote: REVISION,
  makers: [mk('by4', m303by4), mk('by5', m303by5), mk('tens', m303tens), mk('boxes', m303boxes, 2)],
}

// ================================================================== 3.04 Divisibility tests

const TEST_WORDS: Record<number, string> = {
  2: 'its last digit is even',
  3: 'the sum of its digits is divisible by 3',
  4: 'its last 2 digits make a number divisible by 4',
  5: 'its last digit is 0 or 5',
  6: 'it is divisible by both 2 and 3',
  9: 'the sum of its digits is divisible by 9',
  10: 'its last digit is 0',
}

function m304which(): GameQuestion {
  const d = pick([3, 4, 5, 6, 9, 2, 10])
  let yes: number
  do yes = int(101, 9999)
  while (yes % d !== 0)
  const nos: number[] = []
  while (nos.length < 3) {
    const x = int(101, 9999)
    // a near miss: off by one or two from a multiple, so it looks just as likely
    if (x % d !== 0 && !nos.includes(x)) nos.push(x)
  }
  return gq({
    t: 'divisible',
    prompt: `Which number is divisible by ${b(String(d))}?`,
    correct: num(yes),
    wrong: nos.map((x) => num(x)),
    why: `A number is divisible by ${d} if ${TEST_WORDS[d]}. ${num(yes)} passes: ${num(yes)} ${DIVIDE} ${d} = ${num(yes / d)}.`,
    meta: { d, yes },
  })
}

function m304sum(): GameQuestion {
  let x: number
  do x = int(1000, 9999)
  while (x % 10 === 0)
  const s = String(x)
    .split('')
    .reduce((t, c) => t + Number(c), 0)
  return gq({
    t: 'digitSum',
    prompt: `What is the sum of the digits of ${b(num(x))}? (Used for the tests for 3 and 9.)`,
    correct: String(s),
    wrong: wholeWrong(s, [s + 1, s - 1, s + 2]),
    why: `${String(x).split('').join(' + ')} = ${s}.`,
    meta: { x },
  })
}

const SET_304: GameSet = {
  id: 'ncm7-3.04',
  exercise: '3.04',
  ref: 'NCM 7 Ex 3.04',
  title: 'Divisibility tests',
  focus: 'Use divisibility tests for 2, 3, 4, 5, 6, 9 and 10.',
  lessons: [],
  outcomes: [IND],
  teacherNote: 'The syllabus lists the tests for 2, 3, 4, 5, 6 and 10; the textbook also has 8 and 9 (9 is used here).',
  makers: [mk('divisible', m304which), mk('digitSum', m304sum)],
}

// ================================================================== 3.05 Long division (extension)

function m305divide(): GameQuestion {
  const d = pick([11, 12, 13, 14, 15, 16, 21, 25])
  const q = int(12, 39)
  const n = d * q
  return gq({
    t: 'longDiv',
    prompt: `Which is the answer? (Check by multiplying.)${big(`${num(n)} ${DIVIDE} ${d}`)}`,
    correct: num(q),
    wrong: wholeWrong(q, [q + 1, q - 1, q + 10]),
    why: `${d} ${TIMES} ${q} = ${num(n)}, so ${num(n)} ${DIVIDE} ${d} = ${q}.`,
    meta: { n, d },
  })
}

function m305remainder(): GameQuestion {
  const d = pick([11, 12, 15, 20, 25])
  const q = int(3, 9)
  const r = int(1, d - 1)
  const n = d * q + r
  return gq({
    t: 'remainder',
    prompt: `What is the remainder when ${b(num(n))} is divided by ${b(String(d))}?`,
    correct: String(r),
    wrong: wholeWrong(r, [q, r + 1, d - r]),
    why: `${d} ${TIMES} ${q} = ${d * q}, and ${n} − ${d * q} = ${r}.`,
    meta: { n, d },
  })
}

const SET_305: GameSet = {
  id: 'ncm7-3.05',
  exercise: '3.05',
  ref: 'NCM 7 Ex 3.05',
  title: 'Long division',
  focus: 'Divide by a 2-digit number, and find remainders.',
  outcomes: [],
  teacherNote: EXTENSION,
  makers: [mk('remainder', m305remainder), mk('longDiv', m305divide, 2)],
}

// ================================================================== 3.06 Roman numerals (extension)

function roman(n: number): string {
  const parts: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ]
  let out = ''
  for (const [v, s] of parts)
    while (n >= v) {
      out += s
      n -= v
    }
  return out
}

function m306read(): GameQuestion {
  let n: number
  do n = int(14, 99)
  while (!/IV|IX|XL|XC/.test(roman(n)))
  const r = roman(n)
  // the usual mistake: adding a smaller numeral that comes before a larger one
  const added = r.split('').reduce((t, c) => t + { I: 1, V: 5, X: 10, L: 50, C: 100 }[c as 'I']!, 0)
  return gq({
    t: 'read',
    prompt: `What number is ${b(r)}?`,
    correct: String(n),
    wrong: wholeWrong(n, [added, n + 10, n - 10]),
    why: `A smaller numeral before a larger one is subtracted: ${r} = ${n}.`,
    meta: { n },
  })
}

function m306write(): GameQuestion {
  let n: number
  do n = int(14, 99)
  while (!/IV|IX|XL|XC/.test(roman(n)))
  const r = roman(n)
  const wrongs = [r.replace('IV', 'IIII').replace('IX', 'VIIII').replace('XL', 'XXXX').replace('XC', 'LXXXX'), roman(n + 1), roman(n - 1), roman(n + 10)]
  return gq({
    t: 'write',
    prompt: `How is ${b(String(n))} written in Roman numerals?`,
    correct: r,
    wrong: wrongs,
    why: `${n} = ${r}.`,
    meta: { n },
  })
}

const SET_306: GameSet = {
  id: 'ncm7-3.06',
  exercise: '3.06',
  ref: 'NCM 7 Ex 3.06',
  title: 'Roman numerals',
  focus: 'Read and write numbers in Roman numerals.',
  outcomes: [],
  teacherNote: `${EXTENSION} Roman numerals are not in the NSW K–10 (2022) syllabus.`,
  makers: [mk('read', m306read), mk('write', m306write)],
}

// ================================================================== 3.07 Powers and index notation

function m307evaluate(): GameQuestion {
  const [base, e] = pick([
    [2, 3], [2, 4], [2, 5], [2, 6], [3, 2], [3, 3], [3, 4], [4, 3], [5, 2], [5, 3], [10, 3], [10, 4], [6, 2], [1, 7],
  ] as [number, number][])
  const v = base ** e
  return gq({
    t: 'evaluate',
    prompt: `Evaluate:${big(`${base}${sup(e)}`)}`,
    correct: num(v),
    wrong: wholeWrong(v, [base * e, e ** base, base + e]),
    why: `${base}${sup(e)} = ${Array(e).fill(base).join(` ${TIMES} `)} = ${num(v)}.`,
    meta: { base, e },
  })
}

function m307write(): GameQuestion {
  const base = int(2, 9)
  let e: number
  do e = int(3, 6)
  while (e === base)
  return gq({
    t: 'write',
    prompt: `Write in index notation:${big(Array(e).fill(base).join(` ${TIMES} `))}`,
    correct: `${base}${sup(e)}`,
    wrong: [`${e}${sup(base)}`, `${base} ${TIMES} ${e}`, `${base * e}`],
    why: `The number ${base} is multiplied ${e} times: ${base}${sup(e)}.`,
    meta: { base, e },
  })
}

function m307parts(): GameQuestion {
  const base = int(2, 12)
  let e: number
  do e = int(2, 9)
  while (e === base)
  const askBase = chance()
  return gq({
    t: 'parts',
    prompt: `In ${b(`${base}${sup(e)}`)}, what is the ${b(askBase ? 'base' : 'index (power)')}?`,
    correct: String(askBase ? base : e),
    wrong: wholeWrong(askBase ? base : e, [askBase ? e : base, base ** e > 999 ? base * e : base ** e, base * e]),
    why: `In ${base}${sup(e)}, the base ${base} is the number multiplied; the index ${e} says how many times.`,
    meta: { base, e, askBase },
  })
}

const SET_307: GameSet = {
  id: 'ncm7-3.07',
  exercise: '3.07',
  ref: 'NCM 7 Ex 3.07',
  title: 'Powers and index notation',
  focus: 'Write repeated multiplication in index notation, and evaluate powers.',
  lessons: ['y7-ind-notation'],
  outcomes: [IND],
  makers: [mk('write', m307write), mk('parts', m307parts), mk('evaluate', m307evaluate)],
}

// ================================================================== 3.08 Square root and cube root

function m308square(): GameQuestion {
  const n = int(2, 15)
  const sq = n * n
  return gq({
    t: 'sqrt',
    prompt: `Evaluate:${big(`√${sq}`)}`,
    correct: String(n),
    wrong: wholeWrong(n, [sq / 2, sq, n + 1]),
    why: `${n} ${TIMES} ${n} = ${sq}, so √${sq} = ${n}.`,
    meta: { sq },
  })
}

function m308cube(): GameQuestion {
  const n = int(2, 6)
  const c = n ** 3
  return gq({
    t: 'cbrt',
    prompt: `Evaluate:${big(`${sup(3)}√${c}`)}`,
    correct: String(n),
    wrong: wholeWrong(n, [Math.round(c / 3), n * n, n + 1]),
    why: `${n} ${TIMES} ${n} ${TIMES} ${n} = ${c}, so the cube root of ${c} is ${n}.`,
    meta: { c },
  })
}

function m308between(): GameQuestion {
  let x: number
  do x = int(5, 140)
  while (Number.isInteger(Math.sqrt(x)))
  const lo = Math.floor(Math.sqrt(x))
  const pair = (a: number) => `${a} and ${a + 1}`
  return gq({
    t: 'between',
    prompt: `√${x} lies between which two whole numbers?`,
    correct: pair(lo),
    wrong: [pair(lo - 1 > 0 ? lo - 1 : lo + 2), pair(lo + 1), pair(Math.floor(x / 2) - 1 > lo + 1 ? Math.floor(x / 2) - 1 : lo + 3)],
    why: `${lo}${sup(2)} = ${lo * lo} and ${lo + 1}${sup(2)} = ${(lo + 1) * (lo + 1)}, and ${x} is between them, so √${x} is between ${lo} and ${lo + 1}.`,
    meta: { x },
  })
}

function m308isSquare(): GameQuestion {
  const n = int(4, 12)
  const sq = n * n
  const others = sample([sq - 2, sq + 2, sq + 3, sq - 3, sq + 5, sq - 4].filter((x) => !Number.isInteger(Math.sqrt(x))), 3)
  return gq({
    t: 'isSquare',
    prompt: 'Which number is a square number?',
    correct: String(sq),
    inOrder: shuffle([sq, ...others]).map((x) => String(x)),
    why: `${sq} = ${n} ${TIMES} ${n}.`,
    meta: { sq },
  })
}

const SET_308: GameSet = {
  id: 'ncm7-3.08',
  exercise: '3.08',
  ref: 'NCM 7 Ex 3.08',
  title: 'Square root and cube root',
  focus: 'Find square roots and cube roots, and estimate square roots that are not whole numbers.',
  lessons: ['y7-ind-roots'],
  outcomes: [IND],
  makers: [mk('sqrt', m308square), mk('isSquare', m308isSquare), mk('cbrt', m308cube), mk('between', m308between, 2)],
}

// ================================================================== 3.09 Prime and composite numbers

const isPrime = (n: number) => {
  if (n < 2) return false
  for (let k = 2; k * k <= n; k++) if (n % k === 0) return false
  return true
}
/** odd composites that look prime */
const TRICKY = [9, 15, 21, 25, 27, 33, 35, 39, 45, 49, 51, 55, 57, 63, 65, 69, 77, 81, 85, 87, 91, 93, 95]

function m309prime(): GameQuestion {
  const p = pick([7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97])
  const others = sample(TRICKY, 3)
  return gq({
    t: 'prime',
    prompt: 'Which number is prime?',
    correct: String(p),
    wrong: others.map((x) => String(x)),
    why: `${p} has only 2 factors, 1 and itself. ${others.map((x) => `${x} = ${[...Array(x).keys()].slice(2).find((k) => x % k === 0)} ${TIMES} ${x / [...Array(x).keys()].slice(2).find((k) => x % k === 0)!}`).join('; ')}.`,
    meta: { p, others },
  })
}

function m309factors(): GameQuestion {
  const n = pick([6, 8, 10, 12, 14, 15, 16, 18, 20, 21, 24, 28, 30, 36])
  const fs = [...Array(n + 1).keys()].filter((k) => k > 0 && n % k === 0)
  return gq({
    t: 'factors',
    prompt: `How many factors does ${b(String(n))} have?`,
    correct: String(fs.length),
    wrong: wholeWrong(fs.length, [fs.length - 2, fs.length - 1, fs.length + 1]),
    why: `The factors of ${n} are ${fs.join(', ')}: ${fs.length} factors.`,
    meta: { n },
  })
}

function m309composite(): GameQuestion {
  const c = pick(TRICKY)
  const primes = sample([5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97], 3)
  const k = [...Array(c).keys()].slice(2).find((x) => c % x === 0)!
  return gq({
    t: 'composite',
    prompt: 'Which number is composite?',
    correct: String(c),
    wrong: primes.map((x) => String(x)),
    why: `${c} = ${k} ${TIMES} ${c / k}, so it has more than 2 factors. The others are prime.`,
    meta: { c },
  })
}

function m309one(): GameQuestion {
  const opts = ['Prime', 'Composite', 'Neither prime nor composite', 'Both prime and composite']
  return gq({
    t: 'one',
    prompt: `The number ${b('1')} is…`,
    correct: 'Neither prime nor composite',
    inOrder: opts,
    why: '1 has only one factor (itself), so it is neither prime (exactly 2 factors) nor composite (more than 2).',
    meta: {},
  })
}

const SET_309: GameSet = {
  id: 'ncm7-3.09',
  exercise: '3.09',
  ref: 'NCM 7 Ex 3.09',
  title: 'Prime and composite numbers',
  focus: 'A prime number has exactly 2 factors; a composite number has more than 2.',
  lessons: ['y7-wn-primes'],
  outcomes: [IND],
  makers: [mk('prime', m309prime), mk('composite', m309composite), mk('factors', m309factors), mk('one', m309one, 2)],
}

// ================================================================== 3.10 Factor trees

const PRIME_FORMS: [number, string, string[]][] = [
  [12, `2${sup(2)} ${TIMES} 3`, [`2 ${TIMES} 6`, `2 ${TIMES} 3${sup(2)}`, `4 ${TIMES} 3`]],
  [18, `2 ${TIMES} 3${sup(2)}`, [`2${sup(2)} ${TIMES} 3`, `3 ${TIMES} 6`, `2 ${TIMES} 9`]],
  [20, `2${sup(2)} ${TIMES} 5`, [`4 ${TIMES} 5`, `2 ${TIMES} 10`, `2 ${TIMES} 5${sup(2)}`]],
  [24, `2${sup(3)} ${TIMES} 3`, [`2 ${TIMES} 12`, `2${sup(2)} ${TIMES} 6`, `3${sup(2)} ${TIMES} 2`]],
  [36, `2${sup(2)} ${TIMES} 3${sup(2)}`, [`6${sup(2)}`, `4 ${TIMES} 9`, `2 ${TIMES} 3${sup(3)}`]],
  [40, `2${sup(3)} ${TIMES} 5`, [`4 ${TIMES} 10`, `2${sup(2)} ${TIMES} 10`, `2 ${TIMES} 5${sup(2)}`]],
  [45, `3${sup(2)} ${TIMES} 5`, [`9 ${TIMES} 5`, `3 ${TIMES} 15`, `3 ${TIMES} 5${sup(2)}`]],
  [60, `2${sup(2)} ${TIMES} 3 ${TIMES} 5`, [`2 ${TIMES} 30`, `4 ${TIMES} 3 ${TIMES} 5`, `2 ${TIMES} 3 ${TIMES} 10`]],
  [72, `2${sup(3)} ${TIMES} 3${sup(2)}`, [`8 ${TIMES} 9`, `2${sup(2)} ${TIMES} 3${sup(3)}`, `2 ${TIMES} 36`]],
  [100, `2${sup(2)} ${TIMES} 5${sup(2)}`, [`10${sup(2)}`, `4 ${TIMES} 25`, `2 ${TIMES} 50`]],
]

function m310form(): GameQuestion {
  const [n, right, wrong] = pick(PRIME_FORMS)
  return gq({
    t: 'form',
    prompt: `Which shows ${b(String(n))} as a product of its prime factors?`,
    correct: right,
    wrong,
    why: `Only prime numbers can be used: ${n} = ${right}.`,
    meta: { n },
  })
}

function m310value(): GameQuestion {
  const ps = [pick([2, 2, 3]), pick([2, 3, 5]), pick([3, 5, 7])].sort((x, y) => x - y)
  const v = ps.reduce((t, x) => t * x, 1)
  return gq({
    t: 'value',
    prompt: `Which number has the prime factors shown?${big(ps.join(` ${TIMES} `))}`,
    correct: String(v),
    wrong: wholeWrong(v, [ps.reduce((t, x) => t + x, 0), v * 2, v + ps[0]]),
    why: `${ps.join(` ${TIMES} `)} = ${v}.`,
    meta: { ps },
  })
}

const SET_310: GameSet = {
  id: 'ncm7-3.10',
  exercise: '3.10',
  ref: 'NCM 7 Ex 3.10',
  title: 'Factor trees',
  focus: 'Write a whole number as a product of its prime factors, using index notation.',
  lessons: ['y7-wn-primes'],
  outcomes: [IND],
  makers: [mk('value', m310value), mk('form', m310form, 2)],
}

// ================================================================== 3.11 Highest common factor, 3.12 Lowest common multiple

const gcd = (a: number, c: number): number => (c === 0 ? a : gcd(c, a % c))

function m311hcf(): GameQuestion {
  let a: number, c: number, h: number
  do {
    h = pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 12])
    a = h * int(2, 6)
    c = h * int(2, 6)
  } while (a === c || gcd(a, c) !== h || h === Math.min(a, c))
  const someCommon = [...Array(h).keys()].filter((k) => k > 1 && h % k === 0 && k < h)
  return gq({
    t: 'hcf',
    prompt: `What is the ${b('highest common factor')} (HCF) of ${a} and ${c}?`,
    correct: String(h),
    wrong: wholeWrong(h, [someCommon[someCommon.length - 1] ?? h * 2, (a * c) / h, Math.min(a, c)]),
    why: `${h} is the biggest number that divides into both ${a} and ${c}.`,
    meta: { a, c },
  })
}

function m312lcm(): GameQuestion {
  let a: number, c: number
  do {
    a = int(2, 12)
    c = int(2, 12)
  } while (a === c || a % c === 0 || c % a === 0)
  const l = (a * c) / gcd(a, c)
  return gq({
    t: 'lcm',
    prompt: `What is the ${b('lowest common multiple')} (LCM) of ${a} and ${c}?`,
    correct: String(l),
    wrong: wholeWrong(l, [a * c === l ? l * 2 : a * c, gcd(a, c) > 1 ? gcd(a, c) : a + c, a + c]),
    why: `${l} is the smallest number that both ${a} and ${c} divide into.`,
    meta: { a, c },
  })
}

function m311common(): GameQuestion {
  // a = hp and b = hq with p, q coprime, so the common factors are the factors of h
  const h = pick([4, 6, 8, 9, 10, 12])
  let p: number, q: number
  do {
    p = int(2, 7)
    q = int(2, 7)
  } while (p === q || gcd(p, q) !== 1)
  const [a, b] = [h * p, h * q]
  const right = pick(Array.from({ length: h - 1 }, (_, i) => i + 2).filter((x) => h % x === 0))
  return gq({
    t: 'common',
    prompt: `Which number is a common factor of ${a} and ${b}?`,
    correct: num(right),
    // a factor of only one of them, a common multiple instead; a spare
    wrong: [num(a), num(b), num(h * p * q), num(2 * h * p * q)],
    why: `${right} divides both: ${a} = ${right} ${TIMES} ${a / right} and ${b} = ${right} ${TIMES} ${b / right}.`,
    meta: { a, b },
  })
}

const SET_311: GameSet = {
  id: 'ncm7-3.11',
  exercise: '3.11',
  ref: 'NCM 7 Ex 3.11',
  title: 'Highest common factor',
  focus: 'Find common factors and the highest common factor of two numbers.',
  lessons: ['y7-wn-hcf-lcm'],
  outcomes: [FRC],
  makers: [mk('hcf', m311hcf), mk('common', m311common)],
}

function m312multiple(): GameQuestion {
  const n = int(3, 9)
  const k = int(6, 15)
  const findNot = chance()
  // numbers just off a multiple (one more or less, or half of n more)
  const near = [n * (k + 1) + 1, n * (k + 2) - 1, n * (k + 3) + Math.max(1, Math.floor(n / 2)), n * (k - 1) + 2].filter((x) => x % n !== 0)
  const multiples = [n * k, n * (k + 2), n * (k + 4), n * (k + 5)]
  const right = findNot ? near[0] : multiples[0]
  return gq({
    t: 'multiple',
    prompt: `Which number is ${findNot ? 'NOT ' : ''}a multiple of ${n}?`,
    correct: num(right),
    wrong: (findNot ? multiples.slice(1) : near.slice(1)).map(num),
    why: findNot
      ? `${right} = ${n} ${TIMES} ${Math.floor(right / n)} + ${right % n}: it is not in the ${n} times table. The others are.`
      : `${right} = ${n} ${TIMES} ${k}, so it is in the ${n} times table.`,
    meta: { n },
  })
}

const SET_312: GameSet = {
  id: 'ncm7-3.12',
  exercise: '3.12',
  ref: 'NCM 7 Ex 3.12',
  title: 'Lowest common multiple',
  focus: 'Recognise multiples, and find the lowest common multiple of two numbers.',
  lessons: ['y7-wn-hcf-lcm'],
  outcomes: [],
  teacherNote: `${EXTENSION} The LCM is used when adding fractions with different denominators.`,
  makers: [mk('lcm', m312lcm), mk('multiple', m312multiple)],
}

export const NCM7_CH3: GameChapter = {
  id: 'ncm7-ch3',
  number: 3,
  title: 'Whole numbers',
  ref: 'NCM 7 Chapter 3',
  strand: 'Number and algebra',
  outcomes: [IND, FRC],
  sets: [SET_301, SET_302, SET_303, SET_304, SET_305, SET_306, SET_307, SET_308, SET_309, SET_310, SET_311, SET_312],
  colour: 265,
  topics: ['y7-whole-numbers'],
}
