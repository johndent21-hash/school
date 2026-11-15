// Class games for New Century Maths 7 (3rd edition, Cengage) Chapter 1, Integers: one set of quick
// questions for each exercise, 1.01 to 1.10.
//
// The questions are the site's own. They practise the core skill of each exercise, but none of the
// textbook's wording or numbers are copied. Every question is ONE step, uses small numbers and is meant to
// be done in the head in about 15 seconds (no calculator), with four choices. The wrong choices are the
// answers students get from the usual mistakes: the wrong sign, adding instead of subtracting, treating
// "subtract a negative" as subtracting, ignoring order of operations, and so on.
//
// Syllabus: NSW Mathematics K–10 (2022), Stage 4, Computation with integers MA4-INT-C-01.
//
// Audit against the textbook, exercise by exercise (Nov 2026): added "always positive, always negative or could be
// either" for sums, differences, products and quotients of positive and negative integers (1.04–1.07).
import type { GameChapter, GameQuestion, GameSet } from '@/lib/game/types'
import { DIVIDE, MINUS, TIMES, type Miss, chance, gq, int, miss, mk, nonZero, num, pick, sample, shuffle } from './helpers'
import { intLine, vScale } from '@/lib/maths/diagrams4'

const INT = 'MA4-INT-C-01'
const big = (s: string) => `<div class="big">${s}</div>`
const b = (s: string) => `<b>${s}</b>`
/** a negative number in brackets after an operation sign: (−3) */
const br = (x: number) => (x < 0 ? `(${num(x)})` : num(x))
/** a signed amount of money: −$15 or $15 */
const dollarsSigned = (x: number) => (x < 0 ? MINUS + '$' + -x : '$' + x)
type Likely = number | [number, string]
/**
 * three wrong integers: the likely mistakes first (each a number, or [number, the mistake it comes from]), then
 * near misses; never the right answer, never twice
 */
function intWrong(right: number, likely: Likely[], unit = ''): (string | Miss)[] {
  const out: [number, string | null][] = []
  for (const l of [...likely, right + 1, right - 1, -right, right + 2, right - 2, right + 10]) {
    const [x, m] = typeof l === 'number' ? [l, null] : l
    if (x !== right && !out.some((o) => o[0] === x) && Number.isInteger(x)) out.push([x, m])
    if (out.length === 3) break
  }
  return out.map(([x, m]) => (m ? miss(num(x) + unit, m) : num(x) + unit))
}
const SIGN = 'wrong sign'


// ================================================================== 1.01 Numbers above and below zero

function m101opposite(): GameQuestion {
  const n = nonZero(-40, 40)
  return gq({
    t: 'opposite',
    prompt: `What is the opposite of ${b(num(n))}?`,
    correct: num(-n),
    wrong: intWrong(-n, [[n, 'gave the number itself'], [0, 'chose zero'], n > 0 ? -n - 1 : -n + 1]),
    why: `${num(n)} is ${Math.abs(n)} ${n > 0 ? 'above' : 'below'} zero, so its opposite is ${Math.abs(n)} ${n > 0 ? 'below' : 'above'} zero: ${num(-n)}.`,
    meta: { n },
  })
}

const SITUATIONS: [string, number][] = [
  ['N metres below sea level', -1],
  ['N metres above sea level', 1],
  ['a loss of $N', -1],
  ['a profit of $N', 1],
  ['N seconds before take-off', -1],
  ['a fall of N degrees', -1],
  ['a rise of N degrees', 1],
  ['going down N floors', -1],
  ['a deposit of $N', 1],
  ['a withdrawal of $N', -1],
]

function m101integer(): GameQuestion {
  const [phrase, sg] = pick(SITUATIONS)
  const n = int(3, 60)
  return gq({
    t: 'integer',
    prompt: `Which integer shows ${b(phrase.replace('N', String(n)))}?`,
    correct: num(sg * n),
    wrong: intWrong(sg * n, [[-sg * n, SIGN], sg * (n + 10), -sg * (n - 1)]),
    why: sg > 0 ? `Above, up, a rise or money in is positive: ${num(n)}.` : `Below, down, a fall, before or money out is negative: ${num(-n)}.`,
    meta: { n, sg },
  })
}

const WORDS: [string, string][] = [
  ['above', 'below'],
  ['profit', 'loss'],
  ['deposit', 'withdrawal'],
  ['rise', 'fall'],
  ['before', 'after'],
  ['north', 'south'],
  ['up', 'down'],
  ['gain', 'lose'],
]

function m101word(): GameQuestion {
  const pair = pick(WORDS)
  const flip = chance()
  const [w, o] = flip ? [pair[1], pair[0]] : pair
  const others = sample(WORDS.filter((p) => p !== pair).flat(), 3)
  return gq({
    t: 'word',
    prompt: `Which word is the opposite of ${b(w)}?`,
    correct: o,
    wrong: others,
    why: `The opposite of “${w}” is “${o}”: if one is positive, the other is negative.`,
    meta: { w, o },
  })
}

function m101thermometer(): GameQuestion {
  const t = pick([-30, -20, -10, 10, 20, 30])
  const marks = [{ value: t, label: 'A' }]
  return gq({
    t: 'thermometer',
    prompt: `What temperature is marked ${b('A')} on this scale?`,
    diagram: vScale({ min: -40, max: 40, step: 10, unit: '°C', labelEvery: 2, marks }),
    correct: `${num(t)}°C`,
    wrong: [miss(`${num(-t)}°C`, 'read the scale on the wrong side of zero'), miss(`${num(t + 10)}°C`, 'misread by one mark'), miss(`${num(t - 10)}°C`, 'misread by one mark')],
    why: `The mark is ${Math.abs(t)} degrees ${t < 0 ? 'below' : 'above'} zero: ${num(t)}°C.`,
    meta: { temp: t },
  })
}

const SET_101: GameSet = {
  id: 'ncm7-1.01',
  exercise: '1.01',
  ref: 'NCM 7 Ex 1.01',
  title: 'Numbers above and below zero',
  focus: 'Use positive and negative numbers for things above and below zero, and find opposites.',
  lessons: ['y7-int-abovezero'],
  outcomes: [INT],
  makers: [mk('opposite', m101opposite), mk('integer', m101integer), mk('word', m101word), mk('thermometer', m101thermometer, 2)],
}

// ================================================================== 1.02 Integers on a number line

function m102arrow(): GameQuestion {
  let v: number
  do v = int(-9, 9)
  while (v % 5 === 0)
  return gq({
    t: 'arrow',
    prompt: `What number is arrow ${b('A')} pointing to?`,
    diagram: intLine({ min: -10, max: 10, step: 1, labels: [-10, -5, 0, 5, 10], arrows: [{ value: v, label: 'A' }] }),
    correct: num(v),
    wrong: intWrong(v, [[-v, 'read the wrong side of zero'], [v + 1, 'counted one step too many or few'], [v - 1, 'counted one step too many or few']]),
    why: `Count the steps from the nearest labelled number: arrow A is at ${num(v)}.`,
    meta: { v },
  })
}

function m102move(): GameQuestion {
  const start = int(-8, 6)
  let move: number
  do move = nonZero(-9, 9)
  while (start + move < -15 || start + move > 15)
  const end = start + move
  const dir = move > 0 ? 'right' : 'left'
  return gq({
    t: 'move',
    prompt: `Start at ${b(num(start))} on a number line and move ${Math.abs(move)} ${Math.abs(move) === 1 ? 'place' : 'places'} to the ${b(dir)}. Where do you finish?`,
    correct: num(end),
    wrong: intWrong(end, [[start - move, 'moved the wrong way'], [-end, SIGN], [end + (move > 0 ? -1 : 1), 'counted the starting point as a step']]),
    why: `Moving ${dir} ${move > 0 ? 'adds' : 'subtracts'} ${Math.abs(move)}: ${num(start)} ${move > 0 ? '+' : MINUS} ${Math.abs(move)} = ${num(end)}.`,
    meta: { start, move },
  })
}

function m102between(): GameQuestion {
  const a = int(-8, -1)
  const c = int(1, 6)
  const n = c - a - 1
  return gq({
    t: 'between',
    prompt: `How many integers are there between ${b(num(a))} and ${b(num(c))}? (Do not count ${num(a)} or ${num(c)}.)`,
    correct: String(n),
    wrong: [miss(String(n + 2), 'counted both end numbers'), miss(String(n + 1), 'counted one end number'), miss(String(n - 1), 'left out zero'), String(n + 3)],
    why: `${n === 1 ? 'It is' : 'They are'} ${Array.from({ length: n }, (_, k) => num(a + 1 + k)).join(', ')}: ${n} ${n === 1 ? 'integer' : 'integers'}.`,
    meta: { a, c },
  })
}

function m102missing(): GameQuestion {
  const step = pick([2, 5, 10])
  const min = -4 * step
  const ask = pick([-3, -1, 1, 3]) * step
  return gq({
    t: 'missing',
    prompt: `What number goes where the ${b('?')} is?`,
    diagram: intLine({ min, max: 4 * step, step, labels: [min, 0, 4 * step], ask }),
    correct: num(ask),
    wrong: intWrong(ask, [[-ask, 'read the wrong side of zero'], [ask / step, 'counted marks, not the scale'], [ask + step, 'misread by one mark']]),
    why: `The marks go up in ${step}s, so the ? is at ${num(ask)}.`,
    meta: { step, ask },
  })
}

const SET_102: GameSet = {
  id: 'ncm7-1.02',
  exercise: '1.02',
  ref: 'NCM 7 Ex 1.02',
  title: 'Integers on a number line',
  focus: 'Read and complete number lines, and move right (add) and left (subtract) along them.',
  lessons: ['y7-int-numline'],
  outcomes: [INT],
  makers: [mk('arrow', m102arrow), mk('move', m102move), mk('missing', m102missing, 2), mk('between', m102between, 2)],
}

// ================================================================== 1.03 Ordering integers

/** four different integers, some negative, spread out a little */
function fourInts(): number[] {
  let xs: number[]
  do xs = [int(-20, -1), int(-20, -1), int(-9, 12), int(-15, 15)]
  while (new Set(xs).size < 4 || new Set(xs.map(Math.abs)).size < 4)
  return shuffle(xs)
}

function m103largest(): GameQuestion {
  const xs = fourInts()
  const largest = chance()
  const want = largest ? Math.max(...xs) : Math.min(...xs)
  return gq({
    t: 'extreme',
    prompt: `Which number is the ${b(largest ? 'largest' : 'smallest')}?`,
    correct: num(want),
    inOrder: xs.map((x) => num(x)),
    why: `On a number line, numbers get ${largest ? 'larger to the right' : 'smaller to the left'}. ${num(want)} is furthest ${largest ? 'right' : 'left'}.`,
    meta: { xs, largest },
  })
}

function m103statement(): GameQuestion {
  let a: number, c: number
  do {
    a = int(-12, 8)
    c = int(-12, 8)
  } while (a === c || (a > 0 && c > 0) || Math.abs(a) === Math.abs(c))
  const [lo, hi] = a < c ? [a, c] : [c, a]
  const right = chance() ? `${num(lo)} &lt; ${num(hi)}` : `${num(hi)} &gt; ${num(lo)}`
  // the three false statements
  const wrong = [miss(`${num(lo)} &gt; ${num(hi)}`, 'compared sizes, ignoring the sign'), miss(`${num(hi)} &lt; ${num(lo)}`, 'compared sizes, ignoring the sign'), `${num(lo)} = ${num(hi)}`]
  return gq({
    t: 'statement',
    prompt: 'Which statement is true?',
    correct: right,
    wrong,
    why: `${num(lo)} is to the left of ${num(hi)} on a number line, so ${num(lo)} &lt; ${num(hi)} (and ${num(hi)} &gt; ${num(lo)}).`,
    meta: { lo, hi },
  })
}

function m103order(): GameQuestion {
  let xs: number[]
  do xs = [int(-9, -1), int(-9, -1), int(-3, 9)]
  while (new Set(xs).size < 3 || new Set(xs.map(Math.abs)).size < 3)
  const asc = xs.slice().sort((p, q) => p - q)
  const byAbs = xs.slice().sort((p, q) => Math.abs(p) - Math.abs(q))
  const right = asc.map((x) => num(x)).join(', ')
  const show = (o: number[]) => o.map((x) => num(x)).join(', ')
  const others = [miss(show(byAbs), 'ordered by size, ignoring the signs'), miss(show(asc.slice().reverse()), 'descending order (largest first)'), show([asc[1], asc[0], asc[2]]), show([asc[0], asc[2], asc[1]])].filter(
    (o) => (typeof o === 'string' ? o : o.v) !== right,
  )
  return gq({
    t: 'order',
    prompt: `Which list is in ${b('ascending order')} (smallest first)?`,
    correct: right,
    wrong: others,
    why: `Smallest to largest, left to right on a number line: ${right}.`,
    meta: { xs },
  })
}

const SET_103: GameSet = {
  id: 'ncm7-1.03',
  exercise: '1.03',
  ref: 'NCM 7 Ex 1.03',
  title: 'Ordering integers',
  focus: 'Compare and order integers using a number line and the symbols < and >.',
  lessons: ['y7-int-compare'],
  outcomes: [INT],
  makers: [mk('extreme', m103largest), mk('statement', m103statement), mk('order', m103order, 2)],
}

// ================================================================== 1.04 to 1.07 the four operations

/** an operation question: the expression, the right answer and the usual wrong answers */
function opQuestion(t: string, expr: string, right: number, likely: Likely[], why: string, meta: Record<string, unknown>): GameQuestion {
  return gq({ t, prompt: `Evaluate:${big(expr)}`, correct: num(right), wrong: intWrong(right, likely), why, meta })
}

function m104negPlusPos(): GameQuestion {
  const a = -int(2, 15)
  const c = int(2, 15)
  return opQuestion('negPlusPos', `${num(a)} + ${num(c)}`, a + c, [[-(a + c), SIGN], [a - c, 'moved left instead of right'], [-a + c, 'ignored the negative sign']], `Start at ${num(a)} and move ${c} to the right: ${num(a + c)}.`, { a, c })
}
function m104posPlusNeg(): GameQuestion {
  const a = int(2, 15)
  const c = -int(2, 15)
  return opQuestion('posPlusNeg', `${num(a)} + ${br(c)}`, a + c, [[a - c, 'added the negative as a positive'], [-(a + c), SIGN], [-a + c, 'subtracted the wrong way round']], `Adding a negative is the same as subtracting: ${num(a)} ${MINUS} ${-c} = ${num(a + c)}.`, { a, c })
}
function m104negPlusNeg(): GameQuestion {
  const a = -int(2, 12)
  const c = -int(2, 12)
  return opQuestion('negPlusNeg', `${num(a)} + ${br(c)}`, a + c, [[-(a + c), 'two negatives make a positive (that is for × and ÷)'], [a - c, 'subtracted instead of added'], [c - a, 'subtracted instead of added']], `Both go left from zero: ${num(a)} ${MINUS} ${-c} = ${num(a + c)}.`, { a, c })
}

// ================================================================== 1.04–1.07 The sign of an answer

const SIGNS = ['Always positive', 'Always negative', 'Could be either', 'Always zero']
const SAME = 'Same signs give a positive answer: always positive.'
const DIFF = 'Different signs give a negative answer: always negative.'
/** [first number, second number, the answer (index in SIGNS), why] for each operation */
const SIGN_CASES: Record<string, [string, string, number, string][]> = {
  '+': [
    ['positive', 'positive', 0, 'Adding two positives gives a positive: always positive.'],
    ['negative', 'negative', 1, 'Adding two negatives goes further below zero: always negative.'],
    ['positive', 'negative', 2, `It depends which is further from zero: 5 + (${MINUS}2) = 3 but 2 + (${MINUS}5) = ${MINUS}3. Could be either.`],
    ['negative', 'positive', 2, `It depends which is further from zero: ${MINUS}2 + 5 = 3 but ${MINUS}5 + 2 = ${MINUS}3. Could be either.`],
  ],
  [MINUS]: [
    ['positive', 'negative', 0, 'Subtracting a negative is adding a positive, so positive + positive: always positive.'],
    ['negative', 'positive', 1, 'Start below zero and go further down: always negative.'],
    ['positive', 'positive', 2, `7 ${MINUS} 2 = 5 but 2 ${MINUS} 7 = ${MINUS}5. Could be either.`],
    ['negative', 'negative', 2, `${MINUS}2 ${MINUS} (${MINUS}7) = 5 but ${MINUS}7 ${MINUS} (${MINUS}2) = ${MINUS}5. Could be either.`],
  ],
  [TIMES]: [
    ['positive', 'positive', 0, SAME],
    ['negative', 'negative', 0, SAME],
    ['positive', 'negative', 1, DIFF],
    ['negative', 'positive', 1, DIFF],
  ],
  [DIVIDE]: [
    ['positive', 'positive', 0, SAME],
    ['negative', 'negative', 0, SAME],
    ['positive', 'negative', 1, DIFF],
    ['negative', 'positive', 1, DIFF],
  ],
}

/** the sign of a sum, difference, product or quotient of a positive and/or negative integer */
const signKind = (op: string) =>
  mk(
    'sign',
    (): GameQuestion => {
      const [a, b, k, why] = pick(SIGN_CASES[op])
      return gq({
        t: 'sign',
        prompt: `What is the sign of the answer?<div class="big">(${a}) ${op} (${b})</div>`,
        correct: SIGNS[k],
        inOrder: SIGNS,
        why,
        meta: { op, a, b },
      })
    },
    2,
  )

const SET_104: GameSet = {
  id: 'ncm7-1.04',
  exercise: '1.04',
  ref: 'NCM 7 Ex 1.04',
  title: 'Adding integers',
  focus: 'Add integers: start at the first number and move right for a positive, left for a negative.',
  lessons: ['y7-int-add'],
  outcomes: [INT],
  makers: [mk('negPlusPos', m104negPlusPos), mk('posPlusNeg', m104posPlusNeg), mk('negPlusNeg', m104negPlusNeg), signKind('+')],
}

function m105smallMinusBig(): GameQuestion {
  const a = int(1, 9)
  const c = int(a + 2, 15)
  return opQuestion('smallMinusBig', `${num(a)} ${MINUS} ${num(c)}`, a - c, [[c - a, 'took the smaller from the larger'], [a + c, 'added instead of subtracted'], [-(a + c), 'added, then made it negative']], `Start at ${a} and move ${c} to the left, past zero: ${num(a - c)}.`, { a, c })
}
function m105minusNeg(): GameQuestion {
  const a = int(-9, 9)
  const c = -int(2, 12)
  return opQuestion('minusNeg', `${num(a)} ${MINUS} ${br(c)}`, a - c, [[a + c, 'subtracted the negative as it is'], [-(a - c), SIGN], [c - a, 'subtracted the wrong way round']], `Subtracting a negative is the same as adding: ${num(a)} + ${-c} = ${num(a - c)}.`, { a, c })
}
function m105negMinusPos(): GameQuestion {
  const a = -int(2, 12)
  const c = int(2, 12)
  return opQuestion('negMinusPos', `${num(a)} ${MINUS} ${num(c)}`, a - c, [[a + c, 'added the numbers, sign of the first'], [-(a - c), 'two negatives make a positive (that is for × and ÷)'], [c - a, 'subtracted the wrong way round']], `Start at ${num(a)} and move ${c} further left: ${num(a - c)}.`, { a, c })
}

const SET_105: GameSet = {
  id: 'ncm7-1.05',
  exercise: '1.05',
  ref: 'NCM 7 Ex 1.05',
  title: 'Subtracting integers',
  focus: 'Subtract integers: subtracting a positive moves left; subtracting a negative is the same as adding.',
  lessons: ['y7-int-sub'],
  outcomes: [INT],
  makers: [mk('smallMinusBig', m105smallMinusBig), mk('negMinusPos', m105negMinusPos), mk('minusNeg', m105minusNeg, 2), signKind(MINUS)],
}

function m106negTimesPos(): GameQuestion {
  const a = -int(2, 9)
  const c = int(2, 9)
  const [x, y] = chance() ? [a, c] : [c, a]
  return opQuestion('negTimesPos', `${br(x)} ${TIMES} ${br(y)}`, a * c, [[-(a * c), 'different signs give a negative: sign wrong'], [a + c, 'added instead of multiplied'], [a - c, 'subtracted instead of multiplied']], `Different signs give a negative answer: ${Math.abs(a)} ${TIMES} ${c} = ${Math.abs(a * c)}, so the answer is ${num(a * c)}.`, { a, c })
}
function m106negTimesNeg(): GameQuestion {
  const a = -int(2, 9)
  const c = -int(2, 9)
  return opQuestion('negTimesNeg', `${br(a)} ${TIMES} ${br(c)}`, a * c, [[-(a * c), 'two negatives give a positive: sign wrong'], [a + c, 'added instead of multiplied'], [-(a + c), 'added instead of multiplied']], `Two negatives give a positive answer: ${Math.abs(a)} ${TIMES} ${Math.abs(c)} = ${a * c}.`, { a, c })
}
function m106square(): GameQuestion {
  const a = -int(2, 9)
  return opQuestion('square', `(${num(a)})<sup>2</sup>`, a * a, [[-(a * a), 'squared, but kept the negative sign'], [2 * a, 'doubled instead of squared'], [-2 * a, 'doubled instead of squared']], `(${num(a)})<sup>2</sup> = ${br(a)} ${TIMES} ${br(a)} = ${a * a}: a negative times a negative is positive.`, { a })
}

const SET_106: GameSet = {
  id: 'ncm7-1.06',
  exercise: '1.06',
  ref: 'NCM 7 Ex 1.06',
  title: 'Multiplying integers',
  focus: 'Multiply integers: same signs give a positive answer, different signs give a negative answer.',
  lessons: ['y7-int-mul'],
  outcomes: [INT],
  makers: [mk('negTimesPos', m106negTimesPos), mk('negTimesNeg', m106negTimesNeg), mk('square', m106square, 2), signKind(TIMES)],
}

function m107negDivPos(): GameQuestion {
  const q = -int(2, 9)
  const c = int(2, 9)
  const a = q * c
  return opQuestion('negDivPos', `${num(a)} ${DIVIDE} ${num(c)}`, q, [[-q, 'different signs give a negative: sign wrong'], [a + c, 'added instead of divided'], [a - c, 'subtracted instead of divided']], `Different signs give a negative answer: ${Math.abs(a)} ${DIVIDE} ${c} = ${-q}, so the answer is ${num(q)}.`, { a, c })
}
function m107posDivNeg(): GameQuestion {
  const q = -int(2, 9)
  const c = -int(2, 9)
  const a = q * c
  return opQuestion('posDivNeg', `${num(a)} ${DIVIDE} ${br(c)}`, q, [[-q, 'different signs give a negative: sign wrong'], [a + c, 'added instead of divided'], [a * c > 0 ? -q * 10 : q * 10, 'place value slip']], `Different signs give a negative answer: ${a} ${DIVIDE} ${-c} = ${-q}, so the answer is ${num(q)}.`, { a, c })
}
function m107negDivNeg(): GameQuestion {
  const q = int(2, 9)
  const c = -int(2, 9)
  const a = q * c
  return opQuestion('negDivNeg', `${num(a)} ${DIVIDE} ${br(c)}`, q, [[-q, 'two negatives give a positive: sign wrong'], [a - c, 'subtracted instead of divided'], [a + c, 'added instead of divided']], `Two negatives give a positive answer: ${-a} ${DIVIDE} ${-c} = ${q}.`, { a, c })
}

const SET_107: GameSet = {
  id: 'ncm7-1.07',
  exercise: '1.07',
  ref: 'NCM 7 Ex 1.07',
  title: 'Dividing integers',
  focus: 'Divide integers with the same sign rules as multiplying.',
  lessons: ['y7-int-div'],
  outcomes: [INT],
  makers: [mk('negDivPos', m107negDivPos), mk('negDivNeg', m107negDivNeg), mk('posDivNeg', m107posDivNeg), signKind(DIVIDE)],
}

// ================================================================== 1.08 Order of operations

function m108multFirst(): GameQuestion {
  const a = int(-9, 9)
  const c = int(2, 5)
  const d = -int(2, 5)
  const right = a + c * d
  const leftToRight = (a + c) * d
  return opQuestion('multFirst', `${num(a)} + ${num(c)} ${TIMES} ${br(d)}`, right, [[leftToRight, 'worked left to right, not × first'], [-right, SIGN], [a + c + d, 'added instead of multiplied']], `Multiply first: ${c} ${TIMES} ${br(d)} = ${num(c * d)}. Then ${num(a)} + ${br(c * d)} = ${num(right)}.`, { a, c, d })
}
function m108brackets(): GameQuestion {
  const a = -int(2, 9)
  const c = int(1, 8)
  const d = pick([2, 3, -2, -3])
  const right = (a + c) * d
  return opQuestion('brackets', `(${num(a)} + ${num(c)}) ${TIMES} ${br(d)}`, right, [[a + c * d, 'ignored the brackets (× first)'], [-right, SIGN], [a + c + d, 'added instead of multiplied']], `Brackets first: ${num(a)} + ${c} = ${num(a + c)}. Then ${br(a + c)} ${TIMES} ${br(d)} = ${num(right)}.`, { a, c, d })
}
function m108divideFirst(): GameQuestion {
  const q = pick([-4, -3, -2, 2, 3, 4])
  const c = pick([2, 3, 5])
  const a = q * c
  const e = int(1, 9)
  const right = a / c - e
  return opQuestion('divideFirst', `${num(a)} ${DIVIDE} ${num(c)} ${MINUS} ${num(e)}`, right, [[a / c + e, 'added instead of subtracted'], [-right, SIGN], (a - e) / c === Math.trunc((a - e) / c) ? [(a - e) / c, 'subtracted before dividing'] : right + c], `Divide first: ${num(a)} ${DIVIDE} ${c} = ${num(q)}. Then ${num(q)} ${MINUS} ${e} = ${num(right)}.`, { a, c, e })
}
function m108powers(): GameQuestion {
  const a = int(2, 6)
  const neg = chance()
  const right = neg ? -(a * a) : a * a
  const expr = neg ? `${MINUS}${a}<sup>2</sup>` : `(${MINUS}${a})<sup>2</sup>`
  return opQuestion('powers', expr, right, [[-right, neg ? 'squared the negative too (−a² is −(a²))' : 'squared, but kept the negative sign'], [neg ? -2 * a : 2 * a, 'doubled instead of squared'], [neg ? 2 * a : -2 * a, 'doubled instead of squared']], neg ? `Only the ${a} is squared, then the answer is made negative: ${MINUS}(${a} ${TIMES} ${a}) = ${num(right)}.` : `The whole of ${MINUS}${a} is squared: ${br(-a)} ${TIMES} ${br(-a)} = ${right}.`, { a, neg })
}

/** Inserting grouping symbols: four numbers and three operations; exactly one bracketing makes the statement true. */
function m108insert(): GameQuestion {
  const ops: Record<string, (x: number, y: number) => number> = { '+': (x, y) => x + y, [MINUS]: (x, y) => x - y, [TIMES]: (x, y) => x * y }
  // the six ways to put one pair of brackets (or two, around both halves) into a op b op c op d
  const ways: [number, number][][] = [[[0, 1]], [[1, 2]], [[2, 3]], [[0, 2]], [[1, 3]], [[0, 1], [2, 3]]]
  for (;;) {
    const xs = [int(1, 9), int(1, 9), int(1, 9), int(1, 9)]
    const os = [pick(['+', MINUS]), TIMES, pick(['+', MINUS, TIMES])]
    if (chance()) os.reverse()
    // value with the given groups worked first, then × before + and −, left to right
    const value = (groups: [number, number][]) => {
      let vs = xs.slice()
      let o = os.slice()
      for (const [i, j] of groups.slice().sort((p, q) => q[0] - p[0])) {
        let v = vs[i]
        const inner = o.slice(i, j)
        const iv = vs.slice(i, j + 1)
        // inside the brackets: × first
        const stack = [iv[0]]
        const sops: string[] = []
        inner.forEach((op, k) => (op === TIMES ? stack.push(stack.pop()! * iv[k + 1]) : (sops.push(op), stack.push(iv[k + 1]))))
        v = stack.reduce((acc, x, k) => (k === 0 ? x : ops[sops[k - 1]](acc, x)))
        vs = [...vs.slice(0, i), v, ...vs.slice(j + 1)]
        o = [...o.slice(0, i), ...o.slice(j)]
      }
      const stack = [vs[0]]
      const sops: string[] = []
      o.forEach((op, k) => (op === TIMES ? stack.push(stack.pop()! * vs[k + 1]) : (sops.push(op), stack.push(vs[k + 1]))))
      return stack.reduce((acc, x, k) => (k === 0 ? x : ops[sops[k - 1]](acc, x)))
    }
    const show = (groups: [number, number][]) =>
      xs
        .map((x, k) => {
          const open = groups.some((g) => g[0] === k) ? '(' : ''
          const close = groups.some((g) => g[1] === k) ? ')' : ''
          return open + num(x) + close + (k < 3 ? ` ${os[k]} ` : '')
        })
        .join('')
    const plainValue = value([])
    const vals = ways.map(value)
    // the right bracketing changes the value and no other bracketing gives the same value
    const okIdx = ways.map((_, k) => k).filter((k) => vals[k] !== plainValue && vals.filter((v) => v === vals[k]).length === 1)
    if (okIdx.length === 0) continue
    const k = pick(okIdx)
    const others = shuffle(ways.map((_, j) => j).filter((j) => j !== k && vals[j] !== vals[k]))
    if (others.length < 3) continue
    return gq({
      t: 'insert',
      prompt: `Where do the brackets go to make this true?${big(`${show([])} = ${num(vals[k])}`)}`,
      correct: show(ways[k]),
      wrong: others.map((j) => show(ways[j])),
      why: `${show(ways[k])}: work out the brackets first, then the rest in order of operations, to get ${num(vals[k])}.`,
      meta: { xs, os },
    })
  }
}

const SET_108: GameSet = {
  id: 'ncm7-1.08',
  exercise: '1.08',
  ref: 'NCM 7 Ex 1.08',
  title: 'Order of operations',
  focus: 'Use the order of operations with integers: brackets, powers, then × and ÷, then + and −.',
  lessons: ['y7-int-orderops'],
  outcomes: [INT],
  makers: [mk('multFirst', m108multFirst), mk('brackets', m108brackets), mk('divideFirst', m108divideFirst, 2), mk('powers', m108powers, 2), mk('insert', m108insert, 2)],
}

// ================================================================== 1.09 Integers and the calculator

function m109key(): GameQuestion {
  const n = int(2, 9)
  return gq({
    t: 'key',
    prompt: `Which keys enter the number ${b(num(-n))} at the start of a calculation?`,
    correct: `(${MINUS}) ${n}`,
    wrong: [miss(`${n} (${MINUS})`, 'pressed the sign key after the number'), miss(`${n} ${MINUS}`, 'used the subtract key, after the number'), `= ${MINUS}${n}`],
    why: `The sign-change key (${MINUS}) goes first, then the number: (${MINUS}) ${n}.`,
    meta: { n },
  })
}
function m109estimate(): GameQuestion {
  const a = -pick([198, 302, 397, 499, 601, 798, 902])
  const c = pick([2, 5, 10])
  const round100 = Math.round(a / 100) * 100
  const est = round100 / c
  return gq({
    t: 'estimate',
    prompt: `Before using a calculator, estimate:${big(`${num(a)} ${DIVIDE} ${c}`)}`,
    correct: num(est),
    wrong: [miss(num(-est), SIGN), miss(num(round100 * c), 'multiplied instead of divided'), miss(num(est / 10), 'place value slip')],
    why: `${num(a)} is about ${num(round100)}, and ${num(round100)} ${DIVIDE} ${c} = ${num(est)}. A negative divided by a positive is negative.`,
    meta: { a, c },
  })
}

const SET_109: GameSet = {
  id: 'ncm7-1.09',
  exercise: '1.09',
  ref: 'NCM 7 Ex 1.09',
  title: 'Integers and the calculator',
  focus: 'Enter negative numbers with the sign-change key, square negatives correctly, and estimate to check.',
  lessons: ['y7-int-calc'],
  outcomes: [INT],
  teacherNote: 'The game is played without calculators: it asks which keys to press, what the answer should be, and for quick estimates. Working answers out on the calculator is practised in the lesson.',
  makers: [mk('key', m109key), mk('powers', m108powers), mk('estimate', m109estimate, 2)],
}

// ================================================================== 1.10 Integer problems

function m110temperature(): GameQuestion {
  const start = int(-12, 6)
  let change: number
  do change = nonZero(-12, 12)
  while (start + change > 20 || start + change < -20)
  const end = start + change
  const word = change > 0 ? 'rose' : 'fell'
  return gq({
    t: 'temperature',
    prompt: `The temperature was ${b(`${num(start)}°C`)}. It ${word} by ${Math.abs(change)} ${Math.abs(change) === 1 ? 'degree' : 'degrees'}. What is the temperature now?`,
    correct: `${num(end)}°C`,
    wrong: intWrong(end, [[start - change, 'went the wrong way'], [-end, SIGN], [change - start, 'subtracted the wrong way round']], '°C'),
    why: `${num(start)} ${change > 0 ? '+' : MINUS} ${Math.abs(change)} = ${num(end)}, so it is now ${num(end)}°C.`,
    meta: { start, change },
  })
}
function m110difference(): GameQuestion {
  const hi = int(2, 30)
  const lo = -int(2, 30)
  const what = pick(['height', 'temperature'] as const)
  const unit = what === 'height' ? ' m' : '°C'
  const diff = hi - lo
  return gq({
    t: 'difference',
    prompt:
      what === 'height'
        ? `A bird is flying ${b(`${hi} m`)} above sea level. A diver is ${b(`${-lo} m`)} below sea level. How far apart are they, up and down?`
        : `One night the temperature was ${b(`${num(lo)}°C`)}; the next day it was ${b(`${hi}°C`)}. By how many degrees did it rise?`,
    correct: `${diff}${unit}`,
    // the usual mistake is to subtract the sizes (ignoring that one is below zero)
    wrong: intWrong(diff, [[Math.abs(hi + lo), 'subtracted the sizes, ignoring below zero'], [Math.max(hi, -lo), 'gave the larger number only'], diff + 10], unit),
    why: `${hi} ${MINUS} ${br(lo)} = ${hi} + ${-lo} = ${diff}.`,
    meta: { hi, lo },
  })
}
function m110bank(): GameQuestion {
  const had = 5 * int(2, 12)
  const out = had + 5 * int(1, 8)
  const end = had - out
  return gq({
    t: 'bank',
    prompt: `A bank account has ${b(`$${had}`)} in it. Then ${b(`$${out}`)} is taken out. What is the balance now?`,
    correct: dollarsSigned(end),
    wrong: [miss(dollarsSigned(-end), 'took the smaller from the larger'), miss(dollarsSigned(-(had + out)), 'added the amounts'), miss(dollarsSigned(had + out), 'added the amounts')],
    why: `${had} ${MINUS} ${out} = ${num(end)}: the account is overdrawn by $${-end}.`,
    meta: { had, out },
  })
}
function m110lift(): GameQuestion {
  const start = int(-3, 8)
  const down = int(Math.max(2, start + 2), start + 9)
  const end = start - down
  return gq({
    t: 'lift',
    prompt: `A lift is at floor ${b(num(start))} (floor 0 is the ground floor). It goes down ${down} floors. Which floor is it on now?`,
    correct: num(end),
    wrong: intWrong(end, [[start + down, 'went up instead of down'], [-end, SIGN], [end + 1, 'counted the starting floor']]),
    why: `${num(start)} ${MINUS} ${down} = ${num(end)}: ${end < 0 ? `${-end} ${-end === 1 ? 'floor' : 'floors'} below the ground floor` : 'that floor'}.`,
    meta: { start, down },
  })
}

const SET_110: GameSet = {
  id: 'ncm7-1.10',
  exercise: '1.10',
  ref: 'NCM 7 Ex 1.10',
  title: 'Integer problems',
  focus: 'Write a number sentence with integers to solve problems about temperature, height, money and floors.',
  lessons: ['y7-int-problems'],
  outcomes: [INT],
  makers: [mk('temperature', m110temperature), mk('lift', m110lift), mk('bank', m110bank, 2), mk('difference', m110difference, 2)],
}

export const NCM7_CH1: GameChapter = {
  id: 'ncm7-ch1',
  number: 1,
  title: 'Integers',
  ref: 'NCM 7 Chapter 1',
  strand: 'Number and algebra',
  outcomes: [INT],
  sets: [SET_101, SET_102, SET_103, SET_104, SET_105, SET_106, SET_107, SET_108, SET_109, SET_110],
  colour: 205,
  topics: ['y7-integers'],
}
