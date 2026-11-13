// Class games for New Century Maths 7 (3rd edition, Cengage) Chapter 7, Decimals: one set of quick questions for
// each exercise, 7.01 to 7.11.
//
// The questions are the site's own. Every question is ONE step, done in the head, with four choices whose wrong
// answers are the usual decimal mistakes: lining up the last digits instead of the decimal points, moving the point
// the wrong number of places, counting decimal places wrongly in a product, rounding down when it should go up.
// Decimals are built from whole numbers (e.g. 4723 thousandths), so every answer is exact.
//
// Syllabus: NSW Mathematics K–10 (2022), Stage 4, Fractions, decimals and percentages MA4-FRC-C-01. Adding and
// subtracting decimals (7.03) is Stage 3 content, marked as revision.
import type { GameChapter, GameQuestion, GameSet } from '@/lib/game/types'
import { DIVIDE, MINUS, TIMES, chance, frac, gcd, gq, int, mk, money, num, pick, sample, shuffle } from './helpers'

const FRC = 'MA4-FRC-C-01'
const REVISION = 'Revision of Stage 3: adding and subtracting decimals has no content point of its own in the Stage 4 syllabus.'
const big = (s: string) => `<div class="big">${s}</div>`
const b = (s: string) => `<b>${s}</b>`
/** n hundredths, thousandths… as a number: d(4723, 3) = 4.723 */
const d = (n: number, dp: number) => n / 10 ** dp
/** a decimal written out: ds(4723, 3) = "4.723", ds(30, 1) = "3" (no trailing zeros) */
const ds = (n: number, dp: number) => num(d(n, dp))
/** a decimal with exactly dp places shown: "3.0" */
const dsFixed = (n: number, dp: number) => num(d(n, dp), dp)
/** three different wrong numbers, likely first */
function decWrong(right: number, likely: number[]): string[] {
  const out: number[] = []
  const r = Number(right.toPrecision(12))
  for (const x0 of likely) {
    const x = Number(x0.toPrecision(12))
    if (x > 0 && x !== r && !out.includes(x)) out.push(x)
    if (out.length === 3) break
  }
  return out.map((x) => num(x))
}
/** a decimal with dp places whose last digit is not 0 */
function decimal(whole: [number, number], dp: number): number {
  let n: number
  do n = int(whole[0], whole[1]) * 10 ** dp + int(0, 10 ** dp - 1)
  while (n % 10 === 0)
  return n
}
/** the four numbers 10^k × x for k = from…from+3, smallest first: for choices like 0.2304 / 2.304 / 23.04 / 230.4 */
const ladder = (x: number, from: number) => [0, 1, 2, 3].map((k) => num(Number((x * 10 ** (from + k)).toPrecision(12))))
const places = (x: number) => (String(Number(x.toPrecision(12))).split('.')[1] ?? '').length
/** where the answer sits in the ladder: anywhere, as long as no choice needs more than 4 decimal places */
const ladderFrom = (x: number) => -int(0, Math.max(0, Math.min(3, 4 - places(x))))

// ================================================================== 7.01 Ordering decimals

function m701places(): GameQuestion {
  const dp = int(1, 4)
  const n = decimal([0, 99], dp)
  const whole = Math.floor(n / 10 ** dp)
  return gq({
    t: 'places',
    prompt: `How many decimal places does ${b(ds(n, dp))} have?`,
    correct: String(dp),
    // counted every digit, counted the digits in front of the point
    wrong: [String(String(n).length), String(String(whole).length), String(dp + 1), ...(dp > 1 ? [String(dp - 1)] : []), String(dp + 2), String(dp + 3)],
    why: `Count the digits after the decimal point: ${dp}.`,
    meta: { n, dp },
  })
}

function m701order(): GameQuestion {
  const w = int(0, 9)
  let a: number, c: number
  do {
    a = int(1, 9)
    c = int(1, 9)
  } while (a === c)
  // w.0a, w.a, w.0ac, w.ac, w.a0c: the same digits in different places
  const pool = [
    [a, 2],
    [a, 1],
    [10 * a + c, 3],
    [10 * a + c, 2],
    [100 * a + c, 3],
  ].map(([n, dp]) => w * 10 ** dp + n)
  const dps = [2, 1, 3, 2, 3]
  const pick4 = sample([0, 1, 2, 3, 4], 4)
  const xs = pick4.map((i) => d(pool[i], dps[i]))
  const largest = chance()
  const want = largest ? Math.max(...xs) : Math.min(...xs)
  return gq({
    t: 'order',
    prompt: `Which decimal is the ${b(largest ? 'largest' : 'smallest')}?`,
    correct: num(want),
    inOrder: xs.map((x) => num(x)),
    why: `Compare place by place: tenths first, then hundredths, then thousandths. The ${largest ? 'largest' : 'smallest'} is ${num(want)}.`,
    meta: { xs, largest },
  })
}

function m701between(): GameQuestion {
  const w = int(0, 9)
  const a = int(1, 8)
  const lo = w * 10 + a
  const c = int(1, 9)
  const right = d(lo * 10 + c, 2)
  // just outside: the next tenth up, a zero slipped in, the digits the other way round
  const cands = [d((lo + 1) * 10 + c, 2), d(w * 100 + a * 10 + c, 3), d(w * 100 + c * 10 + a, 2) , d(lo - 1, 1), d((lo + 1) * 10 + c + 1, 2)]
  const wrong = cands.filter((x) => !(x > d(lo, 1) && x < d(lo + 1, 1)))
  return gq({
    t: 'between',
    prompt: `Which decimal is between ${b(ds(lo, 1))} and ${b(ds(lo + 1, 1))}?`,
    correct: num(right),
    wrong: wrong.map((x) => num(x)),
    why: `${ds(lo, 1)} = ${num(d(lo, 1), 2)} and ${ds(lo + 1, 1)} = ${num(d(lo + 1, 1), 2)}, and ${num(right)} is between them.`,
    meta: { lo },
  })
}

const SET_701: GameSet = {
  id: 'ncm7-7.01',
  exercise: '7.01',
  ref: 'NCM 7 Ex 7.01',
  title: 'Ordering decimals',
  focus: 'Count decimal places and compare decimals place by place.',
  lessons: ['y7-dec-place'],
  outcomes: [FRC],
  makers: [mk('places', m701places), mk('order', m701order), mk('between', m701between, 2)],
}

// ================================================================== 7.02 Decimals and fractions

function m702toFrac(): GameQuestion {
  const dp = int(1, 3)
  let n: number
  do n = int(1, 10 ** dp - 1)
  while (n % 10 === 0 || gcd(n, 10 ** dp) === 1)
  const D = 10 ** dp
  const g = gcd(n, D)
  const p = [2, 5].find((f) => g % f === 0 && g !== f)
  return gq({
    t: 'toFrac',
    prompt: `Write ${b(ds(n, dp))} as a fraction in simplest form.`,
    correct: frac(n / g, D / g),
    // not simplified, partly simplified, the wrong place value
    wrong: [frac(n, D), ...(p ? [frac(n / p, D / p)] : []), frac(n, D / 10 === 1 ? 100 : D / 10), frac(n / g, (D * 10) / g), frac(n, D * 10)],
    why: `${ds(n, dp)} = ${frac(n, D)}. Divide the top and bottom by ${g}: ${frac(n / g, D / g)}.`,
    meta: { n, dp },
  })
}

function m702toDec(): GameQuestion {
  const dp = int(1, 3)
  let n: number
  do n = int(1, 10 ** dp - 1)
  while (n % 10 === 0)
  return gq({
    t: 'toDec',
    prompt: `Write as a decimal:${big(frac(n, 10 ** dp))}`,
    correct: ds(n, dp),
    wrong: decWrong(d(n, dp), [d(n, dp - 1), d(n, dp + 1), d(n, dp + 2), d(n, dp - 2)]),
    why: `${10 ** dp === 10 ? 'Tenths' : 10 ** dp === 100 ? 'Hundredths' : 'Thousandths'}: ${dp} decimal places, so ${ds(n, dp)}.`,
    meta: { n, dp },
  })
}

function hundredGrid(k: number): string {
  let body = ''
  for (let i = 0; i < 100; i++) {
    const r = Math.floor(i / 10)
    const c = i % 10
    body += `<rect class="fpart${i < k ? ' on' : ''}" x="${10 + c * 18}" y="${10 + r * 18}" width="18" height="18"/>`
  }
  return `<svg class="dg" viewBox="0 0 200 200" style="max-width:220px" role="img" aria-label="A square cut into 100 equal parts" xmlns="http://www.w3.org/2000/svg">${body}</svg>`
}

function m702shaded(): GameQuestion {
  let k: number
  do k = int(3, 97)
  while (k % 10 === 0)
  return gq({
    t: 'shaded',
    prompt: 'What decimal of the square is shaded?',
    diagram: hundredGrid(k),
    correct: ds(k, 2),
    // the unshaded part, tenths for hundredths, thousandths
    wrong: decWrong(d(k, 2), [d(100 - k, 2), d(k, 1), d(k, 3)]),
    why: `${k} of the 100 equal parts are shaded: ${frac(k, 100)} = ${ds(k, 2)}.`,
    meta: { k },
  })
}

const SET_702: GameSet = {
  id: 'ncm7-7.02',
  exercise: '7.02',
  ref: 'NCM 7 Ex 7.02',
  title: 'Decimals and fractions',
  focus: 'Change decimals to fractions in simplest form, and tenths, hundredths and thousandths to decimals.',
  lessons: ['y7-dec-place', 'y7-pct-convert'],
  outcomes: [FRC],
  makers: [mk('shaded', m702shaded), mk('toDec', m702toDec), mk('toFrac', m702toFrac, 2)],
}

// ================================================================== 7.03 Adding and subtracting decimals

/** the classic slip: digits lined up on the right instead of at the decimal point */
function rightAligned(x: number, xdp: number, y: number, ydp: number, sub: boolean): number {
  const m = Math.max(xdp, ydp)
  return d(sub ? x - y : x + y, m)
}

function m703add(): GameQuestion {
  const [xdp, ydp] = shuffle([1, pick([2, 3])])
  const x = decimal([1, 19], xdp)
  const y = decimal([0, 9], ydp)
  const m = Math.max(xdp, ydp)
  const sum = x * 10 ** (m - xdp) + y * 10 ** (m - ydp)
  return gq({
    t: 'add',
    prompt: `Evaluate:${big(`${ds(x, xdp)} + ${ds(y, ydp)}`)}`,
    correct: ds(sum, m),
    wrong: decWrong(d(sum, m), [rightAligned(x, xdp, y, ydp, false), d(sum, m) + 1, d(sum, m) - d(1, 1), d(sum, m) + d(1, 1)]),
    why: `Line up the decimal points: ${ds(x, xdp)} + ${ds(y, ydp)} = ${ds(sum, m)}.`,
    meta: { x, xdp, y, ydp },
  })
}

function m703sub(): GameQuestion {
  const [xdp, ydp] = shuffle([1, 2])
  let x: number, y: number, diff: number
  const m = 2
  do {
    x = decimal([2, 19], xdp)
    y = decimal([0, 9], ydp)
    diff = x * 10 ** (m - xdp) - y * 10 ** (m - ydp)
  } while (diff <= 10)
  return gq({
    t: 'sub',
    prompt: `Evaluate:${big(`${ds(x, xdp)} ${MINUS} ${ds(y, ydp)}`)}`,
    correct: ds(diff, m),
    wrong: decWrong(d(diff, m), [x > y && xdp !== ydp ? rightAligned(x, xdp, y, ydp, true) : d(diff, m) + 1, d(diff, m) + d(1, 1), d(diff, m) - d(1, 1), d(diff, m) + 1]),
    why: `Line up the decimal points (write ${xdp === 1 ? ds(x, xdp) : ds(y, ydp)} as ${xdp === 1 ? num(d(x, 1), 2) : num(d(y, 1), 2)}): the answer is ${ds(diff, m)}.`,
    meta: { x, xdp, y, ydp },
  })
}

function m703change(): GameQuestion {
  const paid = pick([10, 20, 50])
  let cents: number
  do cents = int(105, paid * 100 - 105)
  while (cents % 5 !== 0 || cents % 100 === 0)
  const back = paid * 100 - cents
  return gq({
    t: 'change',
    prompt: `Something costs ${money(cents / 100)}. How much change is there from ${money(paid)}?`,
    // forgot to borrow from the dollars, took cents from cents the wrong way round, a dollar out
    correct: money(back / 100),
    wrong: [back + 100, back - 100, back + 10, back - 5].filter((x) => x > 0).map((x) => money(x / 100)),
    why: `${money(paid)} ${MINUS} ${money(cents / 100)} = ${money(back / 100)}.`,
    meta: { cents, paid },
  })
}

const SET_703: GameSet = {
  id: 'ncm7-7.03',
  exercise: '7.03',
  ref: 'NCM 7 Ex 7.03',
  title: 'Adding and subtracting decimals',
  focus: 'Add and subtract decimals with the decimal points lined up.',
  lessons: ['y7-dec-addsub'],
  outcomes: [],
  teacherNote: REVISION,
  makers: [mk('add', m703add), mk('sub', m703sub), mk('change', m703change)],
}

// ================================================================== 7.04 Multiplying and dividing by powers of 10

function m704times(): GameQuestion {
  const dp = int(1, 3)
  const x = decimal([0, 99], dp)
  const k = int(1, 3)
  const ans = d(x, dp) * 10 ** k
  return gq({
    t: 'times',
    prompt: `Evaluate:${big(`${ds(x, dp)} ${TIMES} ${num(10 ** k)}`)}`,
    correct: num(ans),
    // the point moved one place too few or too many, or the wrong way
    wrong: decWrong(ans, [ans / 10, ans * 10, d(x, dp) / 10 ** k, ans * 100]),
    why: `${TIMES} ${num(10 ** k)}: move the decimal point ${k} ${k === 1 ? 'place' : 'places'} to the right. ${ds(x, dp)} ${TIMES} ${num(10 ** k)} = ${num(ans)}.`,
    meta: { x, dp, k },
  })
}

function m704divide(): GameQuestion {
  const dp = int(0, 2)
  const x = dp === 0 ? int(2, 999) : decimal([0, 99], dp)
  const k = int(1, 3)
  const ans = d(x, dp) / 10 ** k
  return gq({
    t: 'divide',
    prompt: `Evaluate:${big(`${ds(x, dp)} ${DIVIDE} ${num(10 ** k)}`)}`,
    correct: num(ans),
    wrong: decWrong(ans, [ans * 10, ans / 10, d(x, dp) * 10 ** k, ans * 100]),
    why: `${DIVIDE} ${num(10 ** k)}: move the decimal point ${k} ${k === 1 ? 'place' : 'places'} to the left. ${ds(x, dp)} ${DIVIDE} ${num(10 ** k)} = ${num(ans)}.`,
    meta: { x, dp, k },
  })
}

function m704missing(): GameQuestion {
  const dp = int(1, 2)
  const x = decimal([0, 99], dp)
  const k = int(1, 3)
  const times = chance()
  const result = times ? d(x, dp) * 10 ** k : d(x, dp) / 10 ** k
  // four powers of 10 in order, with the answer anywhere among them
  const start = k - int(0, 3)
  const P = [0, 1, 2, 3].map((i) => num(10 ** (start + i)))
  return gq({
    t: 'missing',
    prompt: `What number goes in the box?${big(`${ds(x, dp)} ${times ? TIMES : DIVIDE} □ = ${num(result)}`)}`,
    correct: num(10 ** k),
    inOrder: P,
    why: `The decimal point moved ${k} ${k === 1 ? 'place' : 'places'} to the ${times ? 'right' : 'left'}, so the box is ${num(10 ** k)}.`,
    meta: { x, dp, k, times },
  })
}

const SET_704: GameSet = {
  id: 'ncm7-7.04',
  exercise: '7.04',
  ref: 'NCM 7 Ex 7.04',
  title: 'Multiplying and dividing decimals by powers of 10',
  focus: 'Multiply and divide decimals by 10, 100 and 1000 by moving the decimal point.',
  lessons: ['y7-dec-muldiv'],
  outcomes: [FRC],
  makers: [mk('times', m704times), mk('divide', m704divide), mk('missing', m704missing, 2)],
}

// ================================================================== 7.05 Multiplying decimals by estimating

/** a rough value to 1 significant figure: 0.34 → 0.3, 78 → 80 */
const oneFigure = (x: number) => {
  const p = 10 ** Math.floor(Math.log10(x))
  return Number((Math.round(x / p) * p).toPrecision(6))
}

function m705related(): GameQuestion {
  const a = int(12, 99)
  const c = int(12, 99)
  const pa = int(0, 1)
  const pc = int(pa === 0 ? 1 : 0, 2)
  const ans = (a * c) / 10 ** (pa + pc)
  const opts = ladder(ans, ladderFrom(ans))
  return gq({
    t: 'related',
    prompt: `${a} ${TIMES} ${c} = ${num(a * c)}. What is ${ds(a, pa)} ${TIMES} ${ds(c, pc)}?`,
    correct: num(ans),
    inOrder: opts,
    why: `${pa + pc} decimal ${pa + pc === 1 ? 'place' : 'places'} in the question, so ${pa + pc} in the answer: ${num(ans)}. (Check: about ${num(oneFigure(d(a, pa)))} ${TIMES} ${num(oneFigure(d(c, pc)))} = ${num(Number((oneFigure(d(a, pa)) * oneFigure(d(c, pc))).toPrecision(6)))}.)`,
    meta: { a, c, pa, pc },
  })
}

function m705estimate(): GameQuestion {
  let x: number, y: number
  do {
    x = int(21, 99)
    y = int(21, 99)
  } while (Math.abs((x % 10) - 5) < 2 || Math.abs((y % 10) - 5) < 2)
  const R = Math.round(x / 10) * Math.round(y / 10)
  return gq({
    t: 'estimate',
    prompt: `Which is the best estimate of ${ds(x, 1)} ${TIMES} ${ds(y, 1)}?`,
    correct: num(R),
    // the decimal point in the wrong place
    wrong: [num(R * 10), num(R / 10), num(R * 100)],
    why: `Round each to the nearest whole number: ${Math.round(x / 10)} ${TIMES} ${Math.round(y / 10)} = ${R}.`,
    meta: { x, y },
  })
}

const SET_705: GameSet = {
  id: 'ncm7-7.05',
  exercise: '7.05',
  ref: 'NCM 7 Ex 7.05',
  title: 'Multiplying decimals by estimating',
  focus: 'Use a whole-number product and an estimate to place the decimal point.',
  lessons: ['y7-dec-muldiv'],
  outcomes: [FRC],
  makers: [mk('estimate', m705estimate), mk('related', m705related)],
}

// ================================================================== 7.06 Multiplying decimals

function m706times(): GameQuestion {
  const a = int(2, 9)
  const pa = 1
  const c = int(11, 99)
  const pc = int(1, 2)
  const ans = (a * c) / 10 ** (pa + pc)
  return gq({
    t: 'times',
    prompt: `Evaluate:${big(`${ds(a, pa)} ${TIMES} ${ds(c, pc)}`)}`,
    correct: num(ans),
    // the decimal point one or two places out
    wrong: decWrong(ans, [ans * 10, ans / 10, ans * 100, ans / 100]),
    why: `${a} ${TIMES} ${c} = ${a * c}, and there are ${pa + pc} decimal places in the question: ${num(ans)}.`,
    meta: { a, c, pc },
  })
}

function m706whole(): GameQuestion {
  const dp = int(1, 2)
  const x = decimal([1, 9], dp)
  const k = int(2, 9)
  const ans = d(x * k, dp)
  return gq({
    t: 'whole',
    prompt: `Evaluate:${big(`${ds(x, dp)} ${TIMES} ${k}`)}`,
    correct: num(ans),
    wrong: decWrong(ans, [ans / 10, ans * 10, d(x, dp) + k, ans + d(1, dp)]),
    why: `${x} ${TIMES} ${k} = ${x * k}, with ${dp} decimal ${dp === 1 ? 'place' : 'places'}: ${num(ans)}.`,
    meta: { x, dp, k },
  })
}

function m706small(): GameQuestion {
  const a = int(1, 9)
  const c = int(1, 9)
  const ans = (a * c) / 100
  return gq({
    t: 'small',
    prompt: `Evaluate:${big(`${ds(a, 1)} ${TIMES} ${ds(c, 1)}`)}`,
    correct: num(ans),
    // one decimal place instead of two, added
    wrong: decWrong(ans, [(a * c) / 10, (a * c) / 1000, d(a + c, 1), a * c]),
    why: `${a} ${TIMES} ${c} = ${a * c}, and 2 decimal places in the question make 2 in the answer: ${num(ans)}. (A number less than 1 times a number less than 1 is smaller than both.)`,
    meta: { a, c },
  })
}

const SET_706: GameSet = {
  id: 'ncm7-7.06',
  exercise: '7.06',
  ref: 'NCM 7 Ex 7.06',
  title: 'Multiplying decimals',
  focus: 'Multiply the digits, then count the decimal places in the question to place the point.',
  lessons: ['y7-dec-muldiv'],
  outcomes: [FRC],
  makers: [mk('whole', m706whole), mk('times', m706times), mk('small', m706small, 2)],
}

// ================================================================== 7.07 Dividing decimals by whole numbers

function m707divide(): GameQuestion {
  const k = int(2, 9)
  const dp = int(1, 2)
  const q = decimal([0, 9], dp)
  const x = q * k
  const ans = d(q, dp)
  return gq({
    t: 'divide',
    prompt: `Evaluate:${big(`${ds(x, dp)} ${DIVIDE} ${k}`)}`,
    correct: num(ans),
    wrong: decWrong(ans, [ans * 10, ans / 10, d(x, dp) - k, ans + d(1, dp)]),
    why: `Divide as usual and keep the decimal point in line: ${ds(x, dp)} ${DIVIDE} ${k} = ${num(ans)}.`,
    meta: { x, dp, k },
  })
}

function m707share(): GameQuestion {
  const k = int(2, 6)
  let each: number
  do each = 5 * int(21, 400)
  while (each % 100 === 0)
  const total = each * k
  const who = pick(['friends', 'people', 'students'])
  return gq({
    t: 'share',
    prompt: `${money(total / 100)} is shared equally between ${k} ${who}. How much does each get?`,
    correct: money(each / 100),
    wrong: [money(each / 1000), money((each * 10) / 100), money(each / 100 + 0.1), money(each / 100 - 0.1), money(total / 100 - k)],
    why: `${money(total / 100)} ${DIVIDE} ${k} = ${money(each / 100)}.`,
    meta: { total, k },
  })
}

const SET_707: GameSet = {
  id: 'ncm7-7.07',
  exercise: '7.07',
  ref: 'NCM 7 Ex 7.07',
  title: 'Dividing decimals by whole numbers',
  focus: 'Divide a decimal by a whole number, keeping the decimal point in line.',
  lessons: ['y7-dec-muldiv'],
  outcomes: [FRC],
  makers: [mk('divide', m707divide), mk('share', m707share)],
}

// ================================================================== 7.08 Dividing decimals

function m708rewrite(): GameQuestion {
  const dp = int(1, 2)
  const g = int(2, 9)
  const xdp = int(1, 2)
  const x = decimal([1, 99], xdp)
  const xs = ds(x, xdp)
  const sh = (k: number) => num(d(x, xdp) * 10 ** k)
  return gq({
    t: 'rewrite',
    prompt: `Which division has the same answer as this one?${big(`${xs} ${DIVIDE} ${ds(g, dp)}`)}`,
    correct: `${sh(dp)} ${DIVIDE} ${g}`,
    // moved only one point, moved them different amounts
    wrong: [`${xs} ${DIVIDE} ${g}`, `${sh(dp + 1)} ${DIVIDE} ${g}`, `${sh(dp)} ${DIVIDE} ${g * 10}`, `${sh(dp - 1)} ${DIVIDE} ${g}`],
    why: `Multiply both numbers by ${num(10 ** dp)} so the divisor is a whole number: ${sh(dp)} ${DIVIDE} ${g}.`,
    meta: { x, xdp, g, dp },
  })
}

function m708divide(): GameQuestion {
  const g = int(2, 9)
  const q = int(11, 99)
  const qdp = int(0, 1)
  const ans = d(q, qdp) * 10
  // x ÷ 0.g = ans, so x = ans × 0.g
  const x = Number((ans * (g / 10)).toPrecision(12))
  return gq({
    t: 'divide',
    prompt: `Evaluate:${big(`${num(x)} ${DIVIDE} ${ds(g, 1)}`)}`,
    correct: num(ans),
    inOrder: ladder(ans, ladderFrom(ans)),
    why: `${num(x)} ${DIVIDE} ${ds(g, 1)} = ${num(x * 10)} ${DIVIDE} ${g} = ${num(ans)}. Dividing by a number less than 1 makes the answer bigger.`,
    meta: { x, g },
  })
}

const SET_708: GameSet = {
  id: 'ncm7-7.08',
  exercise: '7.08',
  ref: 'NCM 7 Ex 7.08',
  title: 'Dividing decimals',
  focus: 'Divide by a decimal by first multiplying both numbers by 10 or 100.',
  lessons: ['y7-dec-muldiv'],
  outcomes: [FRC],
  makers: [mk('rewrite', m708rewrite), mk('divide', m708divide)],
}

// ================================================================== 7.09 Terminating and recurring decimals

const rec = (c: string) => `<span class="rec">${c}</span>`
/** dot notation: dots over the first and last repeating digits */
const recurring = (pre: string, rep: string) => `0.${pre}${rep.length === 1 ? rec(rep) : rec(rep[0]) + rep.slice(1, -1) + rec(rep[rep.length - 1])}`
const TERMINATING: [number, number][] = [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [1, 8], [3, 8], [5, 8], [7, 8], [3, 10], [7, 20], [9, 25], [11, 20]]
/** fractions with recurring decimals: [n, d, digits before the repeat, repeating digits] */
const RECURRING: [number, number, string, string][] = [
  [1, 3, '', '3'],
  [2, 3, '', '6'],
  [1, 6, '1', '6'],
  [5, 6, '8', '3'],
  [1, 9, '', '1'],
  [4, 9, '', '4'],
  [7, 9, '', '7'],
  [1, 11, '', '09'],
  [2, 11, '', '18'],
  [5, 11, '', '45'],
  [1, 12, '08', '3'],
  [5, 12, '41', '6'],
  [7, 12, '58', '3'],
  [1, 15, '0', '6'],
]

function m709which(): GameQuestion {
  const findRec = chance()
  const odd = findRec ? pick(RECURRING).slice(0, 2) : pick(TERMINATING)
  const rest = findRec ? sample(TERMINATING, 3) : sample(RECURRING, 3).map((r) => r.slice(0, 2))
  return gq({
    t: 'which',
    prompt: `Which fraction is a ${b(findRec ? 'recurring' : 'terminating')} decimal?`,
    correct: frac(odd[0], odd[1]),
    wrong: rest.map(([n, q]) => frac(n, q)),
    why: findRec
      ? `${frac(odd[0], odd[1])}: dividing ${odd[0]} by ${odd[1]} never stops, because ${odd[1]} has a prime factor other than 2 and 5.`
      : `${frac(odd[0], odd[1])}: ${odd[1]} has no prime factors other than 2 and 5, so the division stops.`,
    meta: { odd, findRec },
  })
}

function m709convert(): GameQuestion {
  const [n, q, pre, rep] = pick(RECURRING)
  const others = sample(RECURRING.filter((r) => r[1] !== q || r[0] !== n), 2)
  // the digits written out and stopped (at most 4 places), e.g. 0.166 for 1/6
  const digits = (pre + rep + rep).slice(0, 4)
  return gq({
    t: 'convert',
    prompt: `Write as a decimal:${big(frac(n, q))}`,
    correct: recurring(pre, rep),
    // stopped instead of recurring, the dots over the wrong digits, another fraction's decimal
    wrong: [
      `0.${digits}`,
      ...(pre.length ? [recurring('', pre + rep)] : rep.length === 1 ? [recurring('', rep + String((Number(rep) + 1) % 10))] : [recurring(rep[0], rep[1])]),
      ...others.map((o) => recurring(o[2], o[3])),
    ],
    why: `${n} ${DIVIDE} ${q} = 0.${(pre + rep.repeat(4)).slice(0, 6)}…, written with dots over the repeating digits: ${recurring(pre, rep)}.`,
    meta: { n, q },
  })
}

const SET_709: GameSet = {
  id: 'ncm7-7.09',
  exercise: '7.09',
  ref: 'NCM 7 Ex 7.09',
  title: 'Terminating and recurring decimals',
  focus: 'Tell terminating from recurring decimals, and write recurring decimals with dot notation.',
  lessons: ['y7-pct-convert'],
  outcomes: [FRC],
  makers: [mk('which', m709which), mk('convert', m709convert, 2)],
}

// ================================================================== 7.10 Rounding decimals

/** n with dp places rounded to r places, half up, as a whole number of 10^−r */
const roundTo = (n: number, dp: number, r: number) => Math.floor((n + 5 * 10 ** (dp - r - 1)) / 10 ** (dp - r))

function m710round(): GameQuestion {
  const r = int(1, 2)
  const dp = r + int(1, 2)
  let n: number
  do n = decimal([0, 9], dp)
  while (Math.floor(n / 10 ** (dp - r - 1)) % 10 === 4 && chance(0.5))
  const up = roundTo(n, dp, r)
  const down = Math.floor(n / 10 ** (dp - r))
  return gq({
    t: 'round',
    prompt: `Round ${b(ds(n, dp))} to ${r} decimal ${r === 1 ? 'place' : 'places'}.`,
    correct: dsFixed(up, r),
    // rounded the wrong way, rounded to the wrong number of places, dropped the trailing zero's place
    wrong: [dsFixed(up === down ? down + 1 : down, r), dsFixed(roundTo(n, dp, r + 1), r + 1), dsFixed(roundTo(n, dp, r - 1), Math.max(0, r - 1)), dsFixed(up + 1, r)],
    why: `Look at the next digit, ${Math.floor(n / 10 ** (dp - r - 1)) % 10}: ${Math.floor(n / 10 ** (dp - r - 1)) % 10 >= 5 ? 'round up' : 'leave it'}. ${ds(n, dp)} ≈ ${dsFixed(up, r)}.`,
    meta: { n, dp, r },
  })
}

function m710carry(): GameQuestion {
  // rounding up carries into the next place: 2.96 → 3.0, 0.398 → 0.40
  const r = int(1, 2)
  const dp = r + 1
  const whole = int(0, 9)
  const n = r === 1 ? whole * 100 + 90 + int(5, 9) : whole * 1000 + int(1, 9) * 100 + 90 + int(5, 9)
  const up = roundTo(n, dp, r)
  return gq({
    t: 'carry',
    prompt: `Round ${b(ds(n, dp))} to ${r} decimal ${r === 1 ? 'place' : 'places'}.`,
    correct: dsFixed(up, r),
    // kept the 9 and added a place, did not carry, left off the zero
    wrong: [dsFixed(up - 1, r), num(d(n, dp) + d(1, dp)), num(d(up, r) + d(1, r)), num(d(up, r)) === dsFixed(up, r) ? dsFixed(up + 2, r) : num(d(up, r))],
    why: `The next digit is ${n % 10}, so round up. The 9 becomes 10 and carries: ${dsFixed(up, r)} (keep the 0 to show ${r} decimal ${r === 1 ? 'place' : 'places'}).`,
    meta: { n, dp, r },
  })
}

const SET_710: GameSet = {
  id: 'ncm7-7.10',
  exercise: '7.10',
  ref: 'NCM 7 Ex 7.10',
  title: 'Rounding decimals',
  focus: 'Round decimals to 1 or 2 decimal places, including when rounding up carries.',
  lessons: ['y7-dec-place'],
  outcomes: [FRC],
  makers: [mk('round', m710round), mk('carry', m710carry, 2)],
}

// ================================================================== 7.11 Decimal problems

function m711cost(): GameQuestion {
  const k = int(3, 9)
  let each: number
  do each = 5 * int(21, 199)
  while (each % 100 === 0)
  const total = each * k
  const item = pick(['pens', 'muesli bars', 'bus tickets', 'notebooks'])
  return gq({
    t: 'cost',
    prompt: `${k} ${item} cost ${money(each / 100)} each. What is the total cost?`,
    correct: money(total / 100),
    wrong: [money(total / 1000), money(each / 100 + k), money((total + 100) / 100), money((total - 100) / 100), money((total + 10) / 100)],
    why: `${k} ${TIMES} ${money(each / 100)} = ${money(total / 100)}.`,
    meta: { k, each },
  })
}

function m711bottles(): GameQuestion {
  const size = pick([2, 3, 4, 5, 6, 8])
  const tub = size * int(3, 12) + int(1, size - 1)
  const full = Math.floor(tub / size)
  return gq({
    t: 'bottles',
    prompt: `A bottle holds ${ds(size, 1)} L. How many bottles can be filled completely from a tub of ${ds(tub, 1)} L?`,
    correct: String(full),
    // rounded up, divided the wrong way, ignored the decimal points
    wrong: [String(full + 1), String(full * 10), String(Math.max(1, full - 1)), String(full + 2)],
    why: `${ds(tub, 1)} ${DIVIDE} ${ds(size, 1)} = ${tub} ${DIVIDE} ${size} = ${full} remainder ${tub - full * size}, so ${full} bottles can be filled completely.`,
    meta: { size, tub },
  })
}

function m711perimeter(): GameQuestion {
  const l = decimal([4, 19], 1)
  const w = decimal([2, 9], 1)
  const P = 2 * (l + w)
  return gq({
    t: 'perimeter',
    prompt: `A rectangular garden bed is ${ds(l, 1)} m long and ${ds(w, 1)} m wide. How many metres of edging go around it?`,
    correct: `${ds(P, 1)} m`,
    // one length and one width only, the area-style product, a place out
    wrong: [`${ds(l + w, 1)} m`, `${ds(P + 10, 1)} m`, `${ds(P - 10, 1)} m`, `${num(d(P, 1) * 10)} m`],
    why: `2 ${TIMES} (${ds(l, 1)} + ${ds(w, 1)}) = 2 ${TIMES} ${ds(l + w, 1)} = ${ds(P, 1)} m.`,
    meta: { l, w },
  })
}

const SET_711: GameSet = {
  id: 'ncm7-7.11',
  exercise: '7.11',
  ref: 'NCM 7 Ex 7.11',
  title: 'Decimal problems',
  focus: 'Use decimal operations to solve problems about money, capacity and length.',
  lessons: ['y7-dec-muldiv', 'y7-dec-addsub'],
  outcomes: [FRC],
  makers: [mk('cost', m711cost), mk('bottles', m711bottles), mk('perimeter', m711perimeter)],
}

export const NCM7_CH7: GameChapter = {
  id: 'ncm7-ch7',
  number: 7,
  title: 'Decimals',
  ref: 'NCM 7 Chapter 7',
  strand: 'Number and algebra',
  outcomes: [FRC],
  sets: [SET_701, SET_702, SET_703, SET_704, SET_705, SET_706, SET_707, SET_708, SET_709, SET_710, SET_711],
  colour: 285,
  topics: ['y7-decimals'],
}
