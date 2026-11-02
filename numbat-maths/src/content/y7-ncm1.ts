// Year 7 Integers, following New Century Maths 7 (3rd edition, Cengage) Chapter 1 exercise by exercise.
// The questions are the site's own: they practise the same kinds of question as each exercise, in the
// same easy-to-hard order (Foundation = the start of the exercise, Challenge = the end), but none of the
// textbook's wording or numbers are copied.
import type { Level, Question, Skill, TestItem } from '@/lib/maths/types'
import {
  D, D4, DIVIDE, MINUS, TIMES, bnum, chance, frac, int, mcA, mcFixedA, money, nonZero, num, numA, pick, pow, q, sample, shuffle,
} from './helpers'

export const OUTCOMES = ['MA4-INT-C-01']
const big = (s: string) => `<div class="big">${s}</div>`
const evalPrompt = (e: string) => `Evaluate:${big(e)}`
const s = (n: number, one: string, many: string) => `${num(n)} ${Math.abs(n) === 1 ? one : many}`
/** a negative integer between −hi and −lo */
const neg = (lo: number, hi: number) => -int(lo, hi)
/** "+ 3" or "− 3": an addition or subtraction written with its sign, for left-to-right working */
const plusMinus = (x: number) => (x < 0 ? `${MINUS} ${num(-x)}` : `+ ${num(x)}`)
const SIGN = ['always positive', 'always negative', 'could be either']

// ================================================================== 1.01 Numbers above and below zero

const OPPOSITE_WORDS: [string, string][] = [
  ['up', 'down'], ['more', 'less'], ['left', 'right'], ['before', 'after'], ['north', 'south'], ['east', 'west'],
  ['withdraw', 'deposit'], ['increase', 'decrease'], ['above', 'below'], ['profit', 'loss'], ['rise', 'fall'], ['win', 'lose'],
  ['forwards', 'backwards'], ['top', 'bottom'],
]

function oppositeNumber(): Question {
  const n = chance(0.15) ? 0 : nonZero(-60, 60)
  return q({
    prompt: `What is the opposite of ${num(n)}?`,
    answer: numA(-n),
    hint: 'The opposite of a number is the same distance from zero, on the other side.',
    steps: n === 0 ? ['Zero is neither positive nor negative, so its opposite is itself: 0.'] : [`${num(n)} is ${Math.abs(n)} ${n > 0 ? 'above' : 'below'} zero.`, `Its opposite is ${Math.abs(n)} ${n > 0 ? 'below' : 'above'} zero: ${num(-n)}.`],
    meta: { t: 'opposite', n },
  })
}

function oppositeWord(): Question {
  const pair = pick(OPPOSITE_WORDS)
  const flip = chance()
  const [w, o] = flip ? [pair[1], pair[0]] : pair
  const others = sample(OPPOSITE_WORDS.filter((p) => p !== pair).flat(), 3)
  return q({
    prompt: `Which word is the opposite of <b>${w}</b>?`,
    answer: mcA(o, others),
    hint: 'Think of a number line: one word goes one way, its opposite goes the other way.',
    steps: [`The opposite of “${w}” is “${o}”.`],
  })
}

const SITUATIONS: { a: string; b: string; unit: (n: number) => string }[] = [
  { a: 'depositing', b: 'withdrawing', unit: (n) => `$${n}` },
  { a: 'walking forwards', b: 'walking backwards', unit: (n) => s(n, 'step', 'steps') },
  { a: 'going up', b: 'going down', unit: (n) => s(n, 'floor', 'floors') },
  { a: 'winning', b: 'losing', unit: (n) => s(n, 'point', 'points') },
  { a: 'raising the price by', b: 'lowering the price by', unit: (n) => `$${n}` },
  { a: 'driving north', b: 'driving south', unit: (n) => `${n} km` },
]

function oppositeSituation(): Question {
  const sit = pick(SITUATIONS)
  const n = int(2, 30)
  const m = n + pick([-1, 1]) * int(1, 5)
  const fromA = chance()
  const said = `${fromA ? sit.a : sit.b} ${sit.unit(n)}`
  const right = `${fromA ? sit.b : sit.a} ${sit.unit(n)}`
  return q({
    prompt: `What is the opposite of <b>${said}</b>?`,
    answer: mcA(right, [said, `${fromA ? sit.b : sit.a} ${sit.unit(m)}`, `${fromA ? sit.a : sit.b} ${sit.unit(m)}`]),
    hint: 'Keep the same amount, but go the other way.',
    steps: [`The opposite keeps the amount (${sit.unit(n)}) and reverses the direction: ${right}.`],
  })
}

const AS_INTEGER: [string, number][] = [
  ['a deposit of $N', 1], ['a withdrawal of $N', -1], ['a temperature drop of N degrees', -1], ['a temperature rise of N degrees', 1],
  ['N metres below sea level', -1], ['N metres above sea level', 1], ['going down N floors in a lift', -1], ['going up N floors in a lift', 1],
  ['N seconds before take-off', -1], ['N seconds after take-off', 1], ['a profit of $N', 1], ['a loss of $N', -1], ['losing N points', -1],
]

function asInteger(): Question {
  const [phrase, sg] = pick(AS_INTEGER)
  const n = int(2, 95)
  return q({
    prompt: `Write an integer to show <b>${phrase.replace('N', String(n))}</b>.`,
    answer: numA(sg * n),
    hint: 'Above zero, up, gaining or after: positive. Below zero, down, losing or before: negative.',
    steps: [sg > 0 ? `Up, above, after, gaining and money in are positive: ${num(sg * n)}.` : `Down, below, before, losing and money out are negative: ${num(sg * n)}.`],
    meta: { t: 'asInteger', n, sg },
  })
}

const SCALE_THINGS: [number, string][] = [
  [100, 'water boils'], [40, 'a very hot day'], [20, 'room temperature'], [0, 'water freezes'], [-10, 'a frosty night'], [-20, 'a home freezer'], [-60, 'an Antarctic winter'],
]

function temperatureScale(level: Level): Question {
  const marks = sample(SCALE_THINGS, 4).sort((a, b) => b[0] - a[0])
  const diagram = D4.vScale({ min: -60, max: 100, step: 10, unit: '°C', labelEvery: 2, marks: marks.map(([value, label]) => ({ value, label })) })
  if (level === 1) {
    const [t, what] = pick(marks)
    return q({
      prompt: 'The scale shows temperatures in degrees Celsius above and below 0°C. What temperature is marked for <b>' + what + '</b>?',
      diagram,
      answer: numA(t),
      suffix: '°C',
      hint: 'Follow the line across to the scale. Temperatures below 0°C are negative.',
      steps: [`The mark for ${what} is at ${num(t)}°C.`],
      meta: { t: 'scaleRead', value: t },
    })
  }
  const [hi, lo] = [marks[0], marks[marks.length - 1]]
  return q({
    prompt: `The scale shows temperatures in degrees Celsius. What is the difference between the temperatures for <b>${hi[1]}</b> and <b>${lo[1]}</b>?`,
    diagram,
    answer: numA(hi[0] - lo[0]),
    suffix: '°C',
    hint: 'Count the degrees from the lower mark up to the higher one.',
    steps: [`${hi[1]}: ${num(hi[0])}°C. ${lo[1]}: ${num(lo[0])}°C.`, `Difference = ${num(hi[0])} ${MINUS} ${bnum(lo[0])} = ${num(hi[0] - lo[0])}°C`],
    meta: { t: 'scaleDiff', hi: hi[0], lo: lo[0] },
  })
}

function iceberg(): Question {
  const above = pick([10, 20, 30, 40])
  const below = pick([50, 60, 70, 80, 90, 100].filter((b) => b > above))
  const diagram = D4.vScale({ min: -100, max: 40, step: 10, unit: 'm', sea: true, band: { from: above, to: -below } })
  const ask = pick(['above', 'below', 'total'] as const)
  const ans = ask === 'above' ? above : ask === 'below' ? below : above + below
  const prompt = {
    above: 'How high does the iceberg reach above sea level?',
    below: 'How deep does the iceberg go below sea level?',
    total: 'What is the total height of the iceberg, from its bottom to its top?',
  }[ask]
  return q({
    prompt: `The diagram shows an iceberg floating in the sea. Heights above sea level are positive and depths below are negative. ${prompt}`,
    diagram,
    answer: numA(ans),
    suffix: 'm',
    hint: 'Read the top and bottom of the iceberg on the scale. Sea level is 0 m.',
    steps:
      ask === 'total'
        ? [`Top: +${above} m. Bottom: ${num(-below)} m.`, `Total height = ${above} ${MINUS} (${num(-below)}) = ${above} + ${below} = ${above + below} m`]
        : [`The ${ask === 'above' ? 'top' : 'bottom'} of the iceberg is at ${ask === 'above' ? '+' + above : num(-below)} m, so it is ${ans} m ${ask} sea level.`],
    meta: { t: 'iceberg', above, below, ask },
  })
}

function runningBalance(level: Level): Question {
  const k = level === 3 ? 6 : 4
  const start = int(3, 9) * 100 + pick([0, 20, 50])
  let bal = start
  const moves: number[] = []
  for (let i = 0; i < k; i++) {
    let m = chance(0.5) ? int(2, 30) * 5 : -int(2, 30) * 5
    if (bal + m < 0) m = Math.abs(m)
    moves.push(m)
    bal += m
  }
  const rows = [['Balance at the start', money(start)], ...moves.map((m) => [m > 0 ? 'Money in' : 'Money out', money(m)])]
  return q({
    prompt: `A bank account has money coming in and going out over one day. Money going out has a negative sign.${D.table(['', 'Amount'], rows)}What is the balance at the end of the day?`,
    answer: numA(bal),
    prefix: '$',
    hint: 'Start with the opening balance. Add money coming in and subtract money going out, one line at a time.',
    steps: [`${num(start)} ${moves.map(plusMinus).join(' ')} = ${num(bal)}`, `The balance at the end of the day is $${num(bal)}.`],
    meta: { t: 'balance', start, moves },
  })
}

const HISTORY: [number, string][] = [
  [-490, 'the Battle of Marathon in Greece'], [-432, 'the Parthenon in Athens was completed'], [-399, 'the philosopher Socrates died'],
  [-323, 'Alexander the Great died'], [-221, 'China was first united under one emperor'], [-44, 'Julius Caesar was killed in Rome'],
  [79, 'Mount Vesuvius erupted and buried Pompeii'], [122, 'building began on Hadrian’s Wall in Britain'], [330, 'Constantinople became the capital of the Roman Empire'],
  [476, 'the Western Roman Empire ended'],
]
const yearText = (y: number) => (y < 0 ? `${-y} BCE` : `${y} CE`)

function timelineQ(): Question {
  // four events spread out enough to tell apart on the timeline
  let ev: [number, string][]
  do ev = sample(HISTORY, 4).sort((a, b) => a[0] - b[0])
  while (ev.some((e, i) => i > 0 && e[0] - ev[i - 1][0] < 60))
  const letters = ['A', 'B', 'C', 'D']
  const diagram = D4.timeline(500, 100, ev.map((e, i) => ({ year: e[0], label: letters[i] })))
  const kind = pick(['letter', 'integer', 'first'] as const)
  if (kind === 'letter') {
    const i = int(0, 3)
    return q({
      prompt: `This timeline runs from 500 BCE to 500 CE. Which letter marks the year ${yearText(ev[i][0])}, when ${ev[i][1]}?`,
      diagram,
      answer: mcFixedA(letters, letters[i]),
      hint: 'BCE years are to the left of 0 and CE years are to the right. The bigger a BCE year, the further left it is.',
      steps: [`${yearText(ev[i][0])} is ${ev[i][0] < 0 ? 'left' : 'right'} of 0, at about ${Math.abs(ev[i][0])} years from 0.`, `That is letter ${letters[i]}.`],
    })
  }
  if (kind === 'integer') {
    const e = pick(ev.filter((x) => x[0] < 0).length ? ev.filter((x) => x[0] < 0) : ev)
    return q({
      prompt: `On a number line, years BCE are negative and years CE are positive. What integer stands for ${yearText(e[0])}, when ${e[1]}?`,
      answer: numA(e[0]),
      hint: 'BCE means before the Common Era, so it is before (left of) zero.',
      steps: [`${yearText(e[0])} is ${Math.abs(e[0])} years ${e[0] < 0 ? 'before' : 'after'} year 0, so it is ${num(e[0])}.`],
      meta: { t: 'yearInt', year: e[0] },
    })
  }
  const [x, y] = sample(ev, 2)
  const firstE = x[0] < y[0] ? x : y
  return q({
    prompt: `Which happened first?`,
    answer: mcFixedA([`${x[1]} (${yearText(x[0])})`, `${y[1]} (${yearText(y[0])})`], `${firstE[1]} (${yearText(firstE[0])})`),
    hint: 'Put both years on a number line. BCE years are negative.',
    steps: [`${yearText(x[0])} is ${num(x[0])} and ${yearText(y[0])} is ${num(y[0])}.`, `${num(Math.min(x[0], y[0]))} is further left, so ${firstE[1]} happened first.`],
  })
}

function calendarZero(): Question {
  const now = int(2008, 2030)
  if (chance()) {
    return q({
      prompt: `A calendar counts years from Year 0 in 3760 BCE (the traditional Jewish calendar works roughly like this). What year number is ${now} CE in this calendar?`,
      answer: numA(now + 3760),
      hint: 'On a number line 3760 BCE is −3760. Find how far it is from −3760 to the year.',
      steps: [`${now} ${MINUS} (${MINUS}3760) = ${now} + 3760 = ${now + 3760}`],
      meta: { t: 'calendar', zero: -3760, year: now },
    })
  }
  return q({
    prompt: `A calendar counts years from Year 0 in 78 CE (the Indian national calendar works roughly like this). What year number is ${now} CE in this calendar?`,
    answer: numA(now - 78),
    hint: 'Find how many years after 78 CE the year is.',
    steps: [`${now} ${MINUS} 78 = ${now - 78}`],
    meta: { t: 'calendar', zero: 78, year: now },
  })
}

function tempDifference(): Question {
  const p1 = pick(['Alice Springs', 'Bourke', 'Mount Isa', 'Marble Bar', 'Birdsville', 'Oodnadatta'])
  const c1 = pick(['Vostok Station in Antarctica', 'Mawson Station in Antarctica', 'Charlotte Pass', 'the South Pole'])
  const hot = int(38, 49)
  const cold = c1.includes('Charlotte') ? neg(5, 23) : neg(30, 75)
  return q({
    prompt: `One day it was ${hot}°C in ${p1} and ${num(cold)}°C at ${c1}. What was the difference between the two temperatures?`,
    answer: numA(hot - cold),
    suffix: '°C',
    hint: 'Count from the cold temperature up to 0, then on to the hot temperature.',
    steps: [`From ${num(cold)} up to 0 is ${-cold} degrees; from 0 up to ${hot} is ${hot} degrees.`, `Difference = ${-cold} + ${hot} = ${hot - cold}°C`],
    meta: { t: 'tempDiff', hot, cold },
  })
}

export const ex101 = (level: Level): Question => {
  if (level === 1) return pick([oppositeNumber, oppositeWord, () => temperatureScale(1), asInteger])()
  if (level === 2) return pick([oppositeSituation, iceberg, () => runningBalance(2), asInteger, () => temperatureScale(2)])()
  return pick([tempDifference, timelineQ, calendarZero, () => runningBalance(3), iceberg])()
}

// ================================================================== 1.02 Integers on a number line

function readArrows(level: Level): Question {
  const k = level === 1 ? 1 : pick([2, 4, 5, 10, 20])
  const ticks = level === 1 ? 30 : pick([12, 14, 15])
  const max = k * ticks
  const labelEvery = level === 1 ? 5 : k === 20 ? 3 : 2
  const labels = Array.from({ length: Math.floor(ticks / labelEvery) + 1 }, (_, i) => i * labelEvery * k)
  const count = 4
  let spots: number[]
  do spots = sample(Array.from({ length: ticks - 1 }, (_, i) => (i + 1) * k), count).sort((a, b) => a - b)
  while (spots.some((v, i) => i > 0 && v - spots[i - 1] < 2 * k) || spots.every((v) => labels.includes(v)))
  const letters = ['A', 'B', 'C', 'D']
  const unlabelled = spots.map((v, i) => [v, i] as const).filter(([v]) => !labels.includes(v))
  const [value, idx] = pick(unlabelled)
  return q({
    prompt: `What integer does arrow <b>${letters[idx]}</b> point to?`,
    diagram: D4.intLine({ min: 0, max, step: k, labels, arrows: spots.map((v, i) => ({ value: v, label: letters[i] })), rightOnly: true }),
    answer: numA(value),
    hint: k === 1 ? 'Each mark is 1 more than the mark to its left.' : `First work out how much each small mark is worth: the labels go up by ${labelEvery * k} every ${labelEvery} marks.`,
    steps: [
      k === 1 ? 'Each mark is worth 1.' : `${labelEvery} marks cover ${labelEvery * k}, so each mark is worth ${k}.`,
      `Arrow ${letters[idx]} is ${s(value / k, 'mark', 'marks')} from 0: ${value / k} ${TIMES} ${k} = ${value}.`,
    ],
    meta: { t: 'arrow', value },
  })
}

function completeLine(): Question {
  const k = pick([1, 1, 2, 3, 5, 10, 50])
  const lo = -pick([4, 5, 6]) * k
  const n = pick([10, 12])
  const hi = lo + n * k
  const all = Array.from({ length: n + 1 }, (_, i) => lo + i * k)
  const shown = all.filter((v, i) => v === 0 || i % 3 === 0 || chance(0.25))
  const hidden = all.filter((v) => !shown.includes(v))
  const askV = pick(hidden.length ? hidden : all.filter((v) => v !== 0))
  return q({
    prompt: 'The marks on this number line are evenly spaced. Which integer belongs at the mark labelled <b>?</b>',
    diagram: D4.intLine({ min: lo, max: hi, step: k, labels: shown.filter((v) => v !== askV), ask: askV }),
    answer: numA(askV),
    hint: 'Work out how much each step is worth, then count from a labelled mark (0 is a good one).',
    steps: [`Each step is worth ${k}.`, `The ? mark is ${s(Math.abs(askV) / k, 'step', 'steps')} ${askV < 0 ? 'left' : 'right'} of 0: ${num(askV)}.`],
    meta: { t: 'complete', value: askV },
  })
}

function integersBetween(): Question {
  const a = neg(1, 7)
  const b = a + int(4, 8)
  const kind = pick(['between', 'less'] as const)
  if (kind === 'between') {
    const vals = Array.from({ length: b - a - 1 }, (_, i) => a + 1 + i)
    return q({
      prompt: `List all the integers <b>between</b> ${num(a)} and ${num(b)}.`,
      answer: { kind: 'nums', values: vals },
      hint: '“Between” does not include the two end numbers.',
      steps: [`Start just after ${num(a)} and stop just before ${num(b)}: ${vals.map((v) => num(v)).join(', ')}.`],
      meta: { t: 'between', a, b },
    })
  }
  const lim = int(-2, 3)
  const from = lim - int(3, 6)
  const vals = Array.from({ length: lim - from }, (_, i) => from + i)
  return q({
    prompt: `A number line is marked from ${num(from)} to ${num(from + 12)}. List all the integers on it that are <b>less than</b> ${num(lim)}.`,
    answer: { kind: 'nums', values: vals },
    hint: 'Less than means to the left. Don’t include the number itself.',
    steps: [`From ${num(from)} up to the integer just before ${num(lim)}: ${vals.map((v) => num(v)).join(', ')}.`],
    meta: { t: 'lessThan', from, lim },
  })
}

function moveOnLine(level: Level): Question {
  const start = int(-6, 6)
  const diagram = D4.intLine({ min: -20, max: 20, step: 1, labels: Array.from({ length: 11 }, (_, i) => -20 + i * 4), marker: { value: start, label: 'S' } })
  if (level === 2) {
    const m = nonZero(-13, 13)
    return q({
      prompt: `Point <i>S</i> is on the number line. Where will <i>S</i> be if it moves ${s(Math.abs(m), 'place', 'places')} to the ${m > 0 ? 'right' : 'left'}?`,
      diagram,
      answer: numA(start + m),
      hint: 'Right means bigger, left means smaller. Count the marks.',
      steps: [`${num(start)} ${m > 0 ? '+' : MINUS} ${Math.abs(m)} = ${num(start + m)}`],
      meta: { t: 'move', start, moves: [m] },
    })
  }
  const m1 = -int(3, 10)
  const m2 = int(4, 14)
  return q({
    prompt: `Point <i>S</i> is on the number line. Where will <i>S</i> be if it moves ${-m1} places to the left and then ${m2} places to the right?`,
    diagram,
    answer: numA(start + m1 + m2),
    hint: 'Do one move at a time.',
    steps: [`${num(start)} ${MINUS} ${-m1} = ${num(start + m1)}`, `${num(start + m1)} + ${m2} = ${num(start + m1 + m2)}`],
    meta: { t: 'move', start, moves: [m1, m2] },
  })
}

export const ex102 = (level: Level): Question => {
  if (level === 1) return pick([() => readArrows(1), completeLine])()
  if (level === 2) return pick([() => readArrows(2), completeLine, integersBetween, () => moveOnLine(2)])()
  return pick([() => moveOnLine(3), integersBetween, () => readArrows(2)])()
}

// ================================================================== 1.03 Ordering integers

function compareTwo(): Question {
  let a = nonZero(-40, 40)
  let b = int(-40, 40)
  while (b === a) b = int(-40, 40)
  if (a > 0 && b > 0) a = -a
  const sym = a < b ? '&lt;' : '&gt;'
  return q({
    prompt: `Which symbol makes this true?${big(`${num(a)} &#9633; ${num(b)}`)}`,
    answer: mcFixedA(['&lt; (is less than)', '&gt; (is greater than)'], sym === '&lt;' ? '&lt; (is less than)' : '&gt; (is greater than)'),
    hint: 'On a number line, the number further right is greater.',
    steps: [`${num(Math.min(a, b))} is to the left of ${num(Math.max(a, b))} on a number line.`, `So ${num(a)} ${sym} ${num(b)}.`],
    meta: { t: 'compare', a, b, sym: a < b ? '<' : '>' },
  })
}

function biggestSmallest(): Question {
  const vals = shuffle([...sample([-30, -17, -12, -9, -8, -6, -4, -2, -1], 4), ...sample([0, 1, 3, 5, 7, 11, 15], 3)])
  const most = chance()
  const v = most ? Math.max(...vals) : Math.min(...vals)
  return q({
    prompt: `Here is a list of integers:${big(vals.map((x) => num(x)).join(', '))}Which is the ${most ? 'biggest' : 'smallest'}?`,
    answer: numA(v),
    hint: most ? 'The biggest number is the one furthest right on a number line.' : 'The smallest number is the most negative one.',
    steps: [`The ${most ? 'biggest' : 'smallest'} integer is ${num(v)}.`],
    meta: { t: most ? 'max' : 'min', vals },
  })
}

function orderList(): Question {
  const vals = [...sample([-48, -36, -26, -18, -15, -11, -10, -8, -6, -5, -3, -2, -1], int(3, 4)), ...sample([0, 1, 3, 4, 8, 12, 15, 33], 2)]
  const asc = chance()
  const sorted = vals.slice().sort((x, y) => (asc ? x - y : y - x))
  const byAbs = vals.slice().sort((x, y) => (asc ? Math.abs(x) - Math.abs(y) : Math.abs(y) - Math.abs(x)) || x - y)
  const fmt = (arr: number[]) => arr.map((x) => num(x)).join(', ')
  let other = shuffle(vals)
  while ([fmt(sorted), fmt(byAbs), fmt(sorted.slice().reverse())].includes(fmt(other))) other = shuffle(vals)
  return q({
    prompt: `Which list shows these integers in <b>${asc ? 'ascending' : 'descending'}</b> order (${asc ? 'smallest to largest' : 'largest to smallest'})?${big(fmt(shuffle(vals)))}`,
    answer: mcA(fmt(sorted), [fmt(sorted.slice().reverse()), fmt(byAbs), fmt(other)]),
    hint: asc ? 'Ascending means going up: start with the most negative number.' : 'Descending means going down: start with the biggest number.',
    steps: [`${asc ? 'Smallest to largest' : 'Largest to smallest'}: ${fmt(sorted)}.`],
    meta: { t: 'order', vals, asc },
  })
}

function distance(): Question {
  const a = int(-15, 10)
  let b = int(-15, 15)
  while (b === a) b = int(-15, 15)
  return q({
    prompt: `Find the distance between ${num(a)} and ${num(b)} on a number line.`,
    answer: numA(Math.abs(a - b)),
    hint: 'Count the steps from one number to the other. A distance is never negative.',
    steps: [
      (a < 0) !== (b < 0) && a !== 0 && b !== 0
        ? `From ${num(Math.min(a, b))} to 0 is ${-Math.min(a, b)}, and from 0 to ${num(Math.max(a, b))} is ${Math.max(a, b)}.`
        : `Count from ${num(Math.min(a, b))} up to ${num(Math.max(a, b))}.`,
      `The distance is ${Math.abs(a - b)}.`,
    ],
    meta: { t: 'distance', a, b },
  })
}

function trueStatement(): Question {
  const make = (truth: boolean): string => {
    for (;;) {
      const a = int(-15, 15)
      const b = int(-15, 15)
      if (a === b || (a > 0 && b > 0)) continue
      const useLess = chance()
      const holds = useLess ? a < b : a > b
      if (holds === truth) return `${num(a)} ${useLess ? '&lt;' : '&gt;'} ${num(b)}`
    }
  }
  const right = make(true)
  const wrong = new Set<string>()
  while (wrong.size < 3) wrong.add(make(false))
  return q({
    prompt: 'Which of these statements is true?',
    answer: mcA(right, [...wrong]),
    hint: 'Check each one on a number line: the bigger number is further right.',
    steps: [`${right} is true. The others put the numbers the wrong way round.`],
  })
}

function posNegSteps(): Question {
  const start = int(-6, 6)
  const moves = [nonZero(-10, 10), nonZero(-10, 10), nonZero(-8, 8)]
  const end = start + moves.reduce((x, y) => x + y, 0)
  const say = (m: number) => `Move ${s(Math.abs(m), 'step', 'steps')} in the ${m > 0 ? 'POS' : 'NEG'} direction.`
  return q({
    prompt: `POS means the positive direction and NEG means the negative direction on a number line. Start at ${num(start)}. ${moves.map(say).join(' ')} Where are you now?`,
    answer: numA(end),
    hint: 'POS moves add, NEG moves subtract. Do them one at a time.',
    steps: [`${num(start)} ${moves.map(plusMinus).join(' ')} = ${num(end)}`],
    meta: { t: 'steps', start, moves },
  })
}

export const ex103 = (level: Level): Question => {
  if (level === 1) return pick([compareTwo, biggestSmallest])()
  if (level === 2) return pick([orderList, distance, compareTwo])()
  return pick([trueStatement, posNegSteps, distance])()
}

// ================================================================== 1.04 Adding integers

function addPair(level: Level): { a: number; b: number } {
  for (;;) {
    const a = level === 1 ? int(-16, 12) : int(-40, 40)
    const b = level === 1 ? nonZero(-12, 13) : nonZero(-40, 40)
    if (a < 0 || b < 0) return { a, b }
  }
}

function addEval(level: Level): Question {
  if (level >= 2 && chance(0.4)) {
    const t = [nonZero(-15, 15), nonZero(-15, 15), nonZero(-15, 15)]
    const r = t[0] + t[1] + t[2]
    const shown = `${num(t[0])} + ${bnum(t[1])} + ${bnum(t[2])}`
    return q({
      prompt: evalPrompt(shown),
      answer: numA(r),
      hint: 'Add from left to right. Adding a negative is the same as subtracting.',
      steps: [`${num(t[0])} + ${bnum(t[1])} = ${num(t[0] + t[1])}`, `${num(t[0] + t[1])} + ${bnum(t[2])} = ${num(r)}`],
    })
  }
  const { a, b } = addPair(level)
  return q({
    prompt: evalPrompt(`${num(a)} + ${bnum(b)}`),
    answer: numA(a + b),
    hint: b < 0 ? 'Adding a negative number is the same as subtracting its opposite.' : 'Start at the first number and move right.',
    steps: b < 0 ? [`${num(a)} + ${bnum(b)} = ${num(a)} ${MINUS} ${-b}`, `= ${num(a + b)}`] : [`Start at ${num(a)} and move ${b} to the right.`, `${num(a)} + ${b} = ${num(a + b)}`],
  })
}

function addChoice(): Question {
  const a = neg(1, 9)
  const b = intOther(-a, 1, 12) // not the opposite of a, so the answer isn't 0
  const r = a + b
  const wrong = [-r, a - b, -(a - b)].filter((x) => x !== r)
  return q({
    prompt: `What is the correct answer for ${num(a)} + ${b}?`,
    answer: mcA(num(r), [...new Set(wrong.map((x) => num(x)))].slice(0, 3)),
    hint: 'Start at the first number on a number line and move right.',
    steps: [`Start at ${num(a)} and move ${b} to the right: ${num(r)}.`],
  })
}

function addOrder(): Question {
  const a = neg(2, 12)
  const b = int(2, 15)
  return q({
    prompt: `Is the answer to ${num(a)} + ${b} the same as the answer to ${b} + (${num(a)})?`,
    answer: mcFixedA(['Yes', 'No'], 'Yes'),
    hint: 'Work out both. Does the order matter when adding?',
    steps: [`${num(a)} + ${b} = ${num(a + b)} and ${b} + (${num(a)}) = ${num(a + b)}.`, 'They are the same: integers can be added in any order.'],
  })
}

const SUM_SIGN: [string, string][] = [
  ['the sum of 2 positive integers', SIGN[0]],
  ['the sum of 2 negative integers', SIGN[1]],
  ['the sum of a positive integer and a negative integer', SIGN[2]],
]

function signRule(table: [string, string][], why: Record<string, string>): Question {
  const [what, ans] = pick(table)
  return q({
    prompt: `Is ${what} always positive, always negative, or could it be either?`,
    answer: mcFixedA(SIGN, ans),
    hint: 'Try a few examples with small numbers.',
    steps: [why[what] ?? `It is ${ans}.`],
  })
}

const SUM_WHY: Record<string, string> = {
  'the sum of 2 positive integers': 'Positive + positive moves further right of zero, e.g. 3 + 4 = 7: always positive.',
  'the sum of 2 negative integers': 'Negative + negative moves further left of zero, e.g. −3 + (−4) = −7: always negative.',
  'the sum of a positive integer and a negative integer': 'It depends which is further from zero: 5 + (−2) = 3 but 2 + (−5) = −3. It could be either.',
}

function addMissing(): Question {
  const a = nonZero(-12, 12)
  const x = nonZero(-12, 12)
  const c = a + x
  const first = chance()
  const shown = first ? `${num(a)} + ___ = ${num(c)}` : `___ + ${bnum(a)} = ${num(c)}`
  return q({
    prompt: `Find the missing number.${big(shown)}`,
    answer: numA(x),
    hint: 'Ask: what do I add to get from one number to the other? Count the jump on a number line.',
    steps: [`The missing number is ${num(c)} ${MINUS} ${bnum(a)} = ${num(x)}.`, `Check: ${first ? `${num(a)} + ${bnum(x)}` : `${num(x)} + ${bnum(a)}`} = ${num(c)}`],
    meta: { t: 'missingAdd', a, c },
  })
}

function openBlanks(op: '+' | '−' | '×' | '÷', count: 2 | 3, target: number, example: number[], noZero = false): Question {
  const sym = op
  const template = Array(count).fill('_').join(` ${sym} `) + ` = ${num(target)}`
  const shown = Array(count).fill('___').join(` ${sym} `) + ` = ${num(target)}`
  const rule = noZero ? 'No zeros allowed.' : 'At least one of the numbers must be negative.'
  return q({
    prompt: `Find integers to fill the blanks so the equation is true. ${rule} There are many right answers.${big(shown)}`,
    answer: { kind: 'open', rule: { type: 'blanks', template, negative: !noZero, noZero }, example: example.join(', ') },
    hint: op === '+' ? 'Pick a negative number for the first blank, then work out what the other must be.' : op === '−' ? 'Pick one number, then work out the other. Check by subtracting.' : op === '×' ? 'Think of the factors of the number, then decide the signs.' : 'Think of a multiplication fact, then decide the signs.',
    steps: [`One answer is ${example.map((x) => num(x)).join(` ${sym} `)} = ${num(target)}.`, 'Any integers that make the equation true are correct.'],
    meta: { t: 'open', op, target },
  })
}

function addOpen(): Question {
  if (chance(0.5)) {
    const target = int(-9, 9)
    const a = neg(1, 9)
    return openBlanks('+', 2, target, [a, target - a])
  }
  const target = int(-3, 3)
  let a: number, b: number
  do {
    a = nonZero(-6, 6)
    b = nonZero(-6, 6)
  } while (target - a - b === 0)
  return openBlanks('+', 3, target, [a, b, target - a - b], true)
}

export const ex104 = (level: Level): Question => {
  if (level === 1) return chance(0.8) ? addEval(1) : addChoice()
  if (level === 2) return pick([() => addEval(2), () => addEval(2), addOrder, () => signRule(SUM_SIGN, SUM_WHY)])()
  return pick([addMissing, addOpen, () => addEval(3)])()
}

/** Worked examples drawn on a number line, like the chapter's examples for adding and subtracting. */
function hopExample(subtract: boolean) {
  return (level: Level): Question => {
    // the line runs from −12 to 12, so start and finish stay on it
    const a = int(-5, 5)
    const b = level === 1 ? int(2, 6) : -int(2, 6)
    const move = subtract ? -b : b
    const r = a + move
    const shown = subtract ? `${num(a)} ${MINUS} ${bnum(b)}` : `${num(a)} + ${bnum(b)}`
    const dir = move > 0 ? 'right' : 'left'
    return q({
      prompt: evalPrompt(shown),
      diagram: D4.intLine({ min: -12, max: 12, step: 1, labels: Array.from({ length: 13 }, (_, i) => -12 + i * 2), hops: { from: a, to: r } }),
      answer: numA(r),
      hint: subtract ? 'Subtracting a positive moves left; subtracting a negative moves right.' : 'Adding a positive moves right; adding a negative moves left.',
      steps: [
        `${num(a)} is where you start.`,
        b > 0
          ? `${subtract ? 'Subtracting' : 'Adding'} ${b} means moving ${b} to the ${dir}.`
          : `${subtract ? 'Subtracting' : 'Adding'} ${num(b)} means moving ${-b} in the opposite direction, to the ${dir}.${subtract ? ` So ${shown} is the same as ${num(a)} + ${-b}.` : ` So ${shown} is the same as ${num(a)} ${MINUS} ${-b}.`}`,
        `You land on ${num(r)}, so ${shown} = ${num(r)}.`,
      ],
    })
  }
}

// ================================================================== 1.05 Subtracting integers

function subEval(level: Level): Question {
  if (level >= 2 && chance(0.4)) {
    const t = [int(-20, 20), nonZero(-20, 20), nonZero(-20, 20)]
    const r = t[0] - t[1] - t[2]
    const shown = `${num(t[0])} ${MINUS} ${bnum(t[1])} ${MINUS} ${bnum(t[2])}`
    return q({
      prompt: evalPrompt(shown),
      answer: numA(r),
      hint: 'Subtract from left to right. Subtracting a negative is the same as adding its opposite.',
      steps: [`${num(t[0])} ${MINUS} ${bnum(t[1])} = ${num(t[0] - t[1])}`, `${num(t[0] - t[1])} ${MINUS} ${bnum(t[2])} = ${num(r)}`],
    })
  }
  const span = level === 1 ? 12 : 50
  let a: number, b: number
  do {
    a = int(-span, span)
    b = nonZero(-span, span)
  } while (!(a < 0 || b < 0 || a - b < 0))
  return q({
    prompt: evalPrompt(`${num(a)} ${MINUS} ${bnum(b)}`),
    answer: numA(a - b),
    hint: b < 0 ? 'Subtracting a negative is the same as adding its opposite.' : 'Start at the first number and move left.',
    steps: b < 0 ? [`${num(a)} ${MINUS} ${bnum(b)} = ${num(a)} + ${-b}`, `= ${num(a - b)}`] : [`Start at ${num(a)} and move ${b} to the left.`, `${num(a)} ${MINUS} ${b} = ${num(a - b)}`],
  })
}

function subChoice(): Question {
  const a = int(2, 9)
  const b = a + int(2, 9)
  const r = a - b
  return q({
    prompt: `What is the correct answer for ${a} ${MINUS} ${b}?`,
    answer: mcA(num(r), [num(-r), num(a + b), num(-(a + b))]),
    hint: `Start at ${a} and move ${b} to the left. You will go past zero.`,
    steps: [`Start at ${a} and move ${b} to the left: ${a} gets you to 0, then ${b - a} more to ${num(r)}.`],
  })
}

function subOrder(): Question {
  const a = int(3, 15)
  const b = intOther(a, 1, 15)
  return q({
    prompt: `Is the answer to ${a} ${MINUS} ${b} the same as the answer to ${b} ${MINUS} ${a}?`,
    answer: mcFixedA(['Yes', 'No'], 'No'),
    hint: 'Work out both answers.',
    steps: [`${a} ${MINUS} ${b} = ${num(a - b)} but ${b} ${MINUS} ${a} = ${num(b - a)}.`, 'They are opposites, not the same: integers cannot be subtracted in any order.'],
  })
}

function intOther(x: number, lo: number, hi: number): number {
  let y = int(lo, hi)
  while (y === x) y = int(lo, hi)
  return y
}

const DIFF_SIGN: [string, string][] = [
  ['a larger integer minus a smaller integer', SIGN[0]],
  ['a smaller integer minus a larger integer', SIGN[1]],
  ['a positive integer minus a positive integer', SIGN[2]],
  ['a positive integer minus a negative integer', SIGN[0]],
  ['a negative integer minus a negative integer', SIGN[2]],
]
const DIFF_WHY: Record<string, string> = {
  'a larger integer minus a smaller integer': 'The answer is how far the larger is above the smaller, e.g. 2 − (−5) = 7: always positive.',
  'a smaller integer minus a larger integer': 'e.g. 3 − 8 = −5 and −6 − (−1) = −5: always negative.',
  'a positive integer minus a positive integer': '9 − 4 = 5 but 4 − 9 = −5: it could be either.',
  'a positive integer minus a negative integer': 'Subtracting a negative adds its opposite, e.g. 4 − (−3) = 7: always positive.',
  'a negative integer minus a negative integer': '−2 − (−7) = 5 but −7 − (−2) = −5: it could be either.',
}

function differenceVsEvaluate(): Question {
  const a = int(-9, 6)
  const b = intOther(a, -9, 9)
  if (chance()) {
    return q({
      prompt: `Find the difference between ${num(a)} and ${num(b)} (how far apart they are on a number line).`,
      answer: numA(Math.abs(a - b)),
      hint: 'A difference like this is a distance, so it is positive.',
      steps: [`${num(Math.max(a, b))} ${MINUS} ${bnum(Math.min(a, b))} = ${Math.abs(a - b)}`],
      meta: { t: 'distance', a, b },
    })
  }
  return q({
    prompt: evalPrompt(`${num(a)} ${MINUS} ${bnum(b)}`),
    answer: numA(a - b),
    hint: 'Keep the order. The answer can be negative.',
    steps: [`${num(a)} ${MINUS} ${bnum(b)} = ${num(a - b)}`],
  })
}

function subMissing(): Question {
  const a = int(-10, 10)
  const x = nonZero(-10, 10)
  const forms = [
    { shown: `${num(a)} ${MINUS} ___ = ${num(a - x)}`, ans: x },
    { shown: `___ ${MINUS} ${bnum(x)} = ${num(a - x)}`, ans: a },
  ]
  const f = pick(forms)
  return q({
    prompt: `Find the missing number.${big(f.shown)}`,
    answer: numA(f.ans),
    hint: 'Try a number and check it. A number line helps.',
    steps: [`The missing number is ${num(f.ans)}.`, `Check: ${num(a)} ${MINUS} ${bnum(x)} = ${num(a - x)}`],
    meta: { t: 'missingSub', a, x, which: f.ans === x ? 'x' : 'a' },
  })
}

function subOpen(): Question {
  const target = int(-11, 6)
  const b = neg(1, 9)
  return openBlanks('−', 2, target, [target + b, b])
}

export const ex105 = (level: Level): Question => {
  if (level === 1) return chance(0.8) ? subEval(1) : subChoice()
  if (level === 2) return pick([() => subEval(2), () => subEval(2), subOrder, () => signRule(DIFF_SIGN, DIFF_WHY)])()
  return pick([differenceVsEvaluate, subMissing, subOpen])()
}

export const exampleAdd = hopExample(false)
export const exampleSub = hopExample(true)

// ================================================================== 1.06 Multiplying integers

const signWord = (x: number) => (x < 0 ? 'negative' : 'positive')

function mulEval(level: Level): Question {
  if (level >= 2 && chance(0.35)) {
    const t = [nonZero(-9, 9), nonZero(-6, 6), nonZero(-5, 5)]
    const r = t[0] * t[1] * t[2]
    const negs = t.filter((x) => x < 0).length
    return q({
      prompt: evalPrompt(`${num(t[0])} ${TIMES} ${bnum(t[1])} ${TIMES} ${bnum(t[2])}`),
      answer: numA(r),
      hint: 'Multiply the numbers, then count the negatives: an even number of negatives gives a positive answer.',
      steps: [`${Math.abs(t[0])} ${TIMES} ${Math.abs(t[1])} ${TIMES} ${Math.abs(t[2])} = ${Math.abs(r)}`, `There ${negs === 1 ? 'is 1 negative' : `are ${negs} negatives`}, so the answer is ${signWord(r)}: ${num(r)}.`],
    })
  }
  let a: number, b: number
  do {
    a = nonZero(-12, 12)
    b = nonZero(-12, 12)
  } while (a > 0 && b > 0)
  return q({
    prompt: evalPrompt(`${num(a)} ${TIMES} ${bnum(b)}`),
    answer: numA(a * b),
    hint: 'Same signs give a positive answer. Different signs give a negative answer.',
    steps: [`${Math.abs(a)} ${TIMES} ${Math.abs(b)} = ${Math.abs(a * b)}`, `${signWord(a)} ${TIMES} ${signWord(b)} = ${signWord(a * b)}, so ${num(a)} ${TIMES} ${bnum(b)} = ${num(a * b)}.`],
  })
}

function mulChoice(): Question {
  const a = nonZero(-9, 9)
  const b = a > 0 ? neg(2, 9) : nonZero(-9, 9)
  const r = a * b
  return q({
    prompt: `What is the correct answer for ${num(a)} ${TIMES} ${bnum(b)}?`,
    answer: mcA(num(r), [...new Set([num(-r), num(a + b), num(-(a + b)), num(a - b)])].filter((x) => x !== num(r)).slice(0, 3)),
    hint: 'Multiply, then decide the sign.',
    steps: [`${Math.abs(a)} ${TIMES} ${Math.abs(b)} = ${Math.abs(r)}, and the answer is ${signWord(r)}: ${num(r)}.`],
  })
}

function grid(op: '×' | '÷'): Question {
  if (op === '×') {
    const top = [nonZero(-9, 9), nonZero(-9, 9)]
    const side = [nonZero(-9, 9), nonZero(-9, 9)]
    const r = int(0, 1)
    const c = int(0, 1)
    const cells = side.map((sv, i) => [num(sv), ...top.map((tv, j) => (i === r && j === c ? '?' : '&nbsp;'))])
    return q({
      prompt: `In this multiplication grid, each square is the number at the side multiplied by the number at the top. What number goes in the square marked ?${D.table([TIMES, ...top.map((x) => num(x))], cells)}`,
      answer: numA(side[r] * top[c]),
      hint: 'Multiply the number at the start of its row by the number at the top of its column.',
      steps: [`${num(side[r])} ${TIMES} ${bnum(top[c])} = ${num(side[r] * top[c])}`],
      meta: { t: 'gridMul', a: side[r], b: top[c] },
    })
  }
  const side = [nonZero(-6, 6), nonZero(-6, 6)]
  const r = int(0, 1)
  const quotients = [nonZero(-9, 9), nonZero(-9, 9), nonZero(-9, 9)]
  const top = quotients.map((qq) => qq * side[r])
  const c = int(0, 2)
  const cells = side.map((sv, i) => [num(sv), ...top.map((_, j) => (i === r && j === c ? '?' : '&nbsp;'))])
  return q({
    prompt: `In this division grid, each square is the number at the top divided by the number at the side. What number goes in the square marked ?${D.table([DIVIDE, ...top.map((x) => num(x))], cells)}`,
    answer: numA(top[c] / side[r]),
    hint: 'Divide the number at the top of the column by the number at the start of the row.',
    steps: [`${num(top[c])} ${DIVIDE} ${bnum(side[r])} = ${num(top[c] / side[r])}`],
    meta: { t: 'gridDiv', a: top[c], b: side[r] },
  })
}

function squareNeg(): Question {
  const n = int(2, 12)
  const negBase = chance(0.7)
  return q({
    prompt: evalPrompt(pow(negBase ? -n : n, 2)),
    answer: numA(n * n),
    hint: 'Squaring means multiplying a number by itself. Negative × negative is positive.',
    steps: [`${pow(negBase ? -n : n, 2)} = ${bnum(negBase ? -n : n)} ${TIMES} ${bnum(negBase ? -n : n)} = ${n * n}`],
  })
}

function mulOrder(): Question {
  const a = int(2, 9)
  const b = neg(2, 9)
  return q({
    prompt: `Is the answer to ${a} ${TIMES} (${num(b)}) the same as the answer to (${num(b)}) ${TIMES} ${a}?`,
    answer: mcFixedA(['Yes', 'No'], 'Yes'),
    hint: 'Work out both.',
    steps: [`Both equal ${num(a * b)}: integers can be multiplied in any order.`],
  })
}

const PRODUCT_SIGN: [string, string][] = [
  ['the product of 2 positive integers', SIGN[0]],
  ['the product of 2 negative integers', SIGN[0]],
  ['the product of a positive integer and a negative integer', SIGN[1]],
  ['a positive integer squared', SIGN[0]],
  ['a negative integer squared', SIGN[0]],
]
const PRODUCT_WHY: Record<string, string> = {
  'the product of 2 positive integers': 'Positive × positive = positive: always positive.',
  'the product of 2 negative integers': 'Negative × negative = positive, e.g. −3 × (−4) = 12: always positive.',
  'the product of a positive integer and a negative integer': 'Different signs give a negative answer: always negative.',
  'a positive integer squared': 'e.g. 5² = 25: always positive.',
  'a negative integer squared': 'A negative times itself is positive, e.g. (−5)² = 25: always positive.',
}

function mulMissing(): Question {
  const a = nonZero(-9, 9)
  const x = nonZero(-11, 11)
  const first = chance()
  return q({
    prompt: `Find the missing number.${big(first ? `${num(a)} ${TIMES} ___ = ${num(a * x)}` : `___ ${TIMES} ${bnum(a)} = ${num(a * x)}`)}`,
    answer: numA(x),
    hint: 'Divide to undo the multiplication, then check the sign.',
    steps: [`${num(a * x)} ${DIVIDE} ${bnum(a)} = ${num(x)}`, `Check: ${num(a)} ${TIMES} ${bnum(x)} = ${num(a * x)}`],
    meta: { t: 'missingMul', a, p: a * x },
  })
}

function mulOpen(): Question {
  const a = nonZero(-9, 9)
  const b = a > 0 ? neg(2, 9) : nonZero(-9, 9)
  return openBlanks('×', 2, a * b, [a, b])
}

export const ex106 = (level: Level): Question => {
  if (level === 1) return chance(0.8) ? mulEval(1) : mulChoice()
  if (level === 2) return pick([() => grid('×'), squareNeg, mulOrder, () => signRule(PRODUCT_SIGN, PRODUCT_WHY), () => mulEval(2)])()
  return pick([mulMissing, mulOpen, () => mulEval(3)])()
}

// ================================================================== 1.07 Dividing integers

function divPair(): { a: number; b: number } {
  for (;;) {
    const b = nonZero(-12, 12)
    const ans = nonZero(-12, 12)
    if (b < 0 || ans * b < 0) return { a: ans * b, b }
  }
}

function divEval(fraction = false): Question {
  const { a, b } = divPair()
  const r = a / b
  return q({
    prompt: evalPrompt(fraction ? frac(num(a), num(b)) : `${num(a)} ${DIVIDE} ${bnum(b)}`),
    answer: numA(r),
    hint: fraction ? 'A fraction bar means divide: top ÷ bottom.' : 'Same signs give a positive answer. Different signs give a negative answer.',
    steps: [
      ...(fraction ? [`${frac(num(a), num(b))} = ${num(a)} ${DIVIDE} ${bnum(b)}`] : []),
      `${Math.abs(a)} ${DIVIDE} ${Math.abs(b)} = ${Math.abs(r)}`,
      `${signWord(a)} ${DIVIDE} ${signWord(b)} = ${signWord(r)}, so the answer is ${num(r)}.`,
    ],
  })
}

function divChoice(): Question {
  const { a, b } = divPair()
  const r = a / b
  return q({
    prompt: `What is the correct answer for ${num(a)} ${DIVIDE} ${bnum(b)}?`,
    answer: mcA(num(r), [...new Set([num(-r), num(a * b), num(a + b), num(a - b)])].filter((x) => x !== num(r)).slice(0, 3)),
    hint: 'Divide, then decide the sign.',
    steps: [`${Math.abs(a)} ${DIVIDE} ${Math.abs(b)} = ${Math.abs(r)}, and the answer is ${signWord(r)}: ${num(r)}.`],
  })
}

const QUOTIENT_SIGN: [string, string][] = [
  ['the quotient of 2 positive integers', SIGN[0]],
  ['the quotient of 2 negative integers', SIGN[0]],
  ['the quotient of a positive integer and a negative integer', SIGN[1]],
]
const QUOTIENT_WHY: Record<string, string> = {
  'the quotient of 2 positive integers': 'Positive ÷ positive = positive: always positive.',
  'the quotient of 2 negative integers': 'Negative ÷ negative = positive, e.g. −12 ÷ (−3) = 4: always positive.',
  'the quotient of a positive integer and a negative integer': 'Different signs give a negative answer: always negative.',
}

function divMissing(): Question {
  const b = nonZero(-11, 11)
  const r = nonZero(-9, 9)
  const a = b * r
  const form = pick(['b', 'a'] as const)
  return q({
    prompt: `Find the missing number.${big(form === 'b' ? `${num(a)} ${DIVIDE} ___ = ${num(r)}` : `___ ${DIVIDE} ${bnum(b)} = ${num(r)}`)}`,
    answer: numA(form === 'b' ? b : a),
    hint: form === 'b' ? 'What do you divide by to get that answer? Think of a multiplication fact.' : 'Multiply to undo the division.',
    steps: [form === 'b' ? `${num(a)} ${DIVIDE} ${num(r)} = ${num(b)}` : `${num(r)} ${TIMES} ${bnum(b)} = ${num(a)}`, `Check: ${num(a)} ${DIVIDE} ${bnum(b)} = ${num(r)}`],
    meta: { t: 'missingDiv', a, b, r, form },
  })
}

function divOpen(): Question {
  const b = nonZero(-9, 9)
  const r = nonZero(-8, 10)
  const ex = b > 0 && r > 0 ? [-r * b, -b] : [r * b, b]
  return openBlanks('÷', 2, ex[0] / ex[1], ex)
}

export const ex107 = (level: Level): Question => {
  if (level === 1) return chance(0.8) ? divEval() : divChoice()
  if (level === 2) return pick([() => divEval(true), () => grid('÷'), () => signRule(QUOTIENT_SIGN, QUOTIENT_WHY), () => divEval()])()
  return pick([divMissing, divOpen, () => divEval(true)])()
}

// ================================================================== 1.08 Order of operations

/** Evaluates a list of numbers and operators with × and ÷ first, then + and − (left to right). */
function evalChain(nums: number[], ops: string[]): number {
  const n = nums.slice()
  const o = ops.slice()
  for (let i = 0; i < o.length; ) {
    if (o[i] === '×' || o[i] === '÷') {
      n.splice(i, 2, o[i] === '×' ? n[i] * n[i + 1] : n[i] / n[i + 1])
      o.splice(i, 1)
    } else i++
  }
  return n.slice(1).reduce((acc, x, i) => (o[i] === '+' ? acc + x : acc - x), n[0])
}
const chainText = (nums: number[], ops: string[]) => nums.map((x, i) => (i === 0 ? num(x) : `${ops[i - 1] === '-' ? MINUS : ops[i - 1]} ${bnum(x)}`)).join(' ')

function orderChain(level: Level): Question {
  for (;;) {
    const k = level === 1 ? 3 : 4
    const opsPool = level === 1 ? (chance() ? ['+', '-'] : ['×', '÷']) : ['+', '-', '×', '÷']
    const ops = Array.from({ length: k - 1 }, () => pick(opsPool))
    const nums = Array.from({ length: k }, () => nonZero(-12, 12))
    // make every division exact at the point it happens
    let ok = true
    const r = evalChain(nums, ops)
    for (let i = 0; i < ops.length && ok; i++) if (ops[i] === '÷' && Math.abs(nums[i + 1]) === 1) ok = false
    if (!ok || !Number.isInteger(r) || Math.abs(r) > 200) continue
    let exact = true
    // check each ÷ divides exactly when worked left to right within its × ÷ run
    let acc = nums[0]
    for (let i = 0; i < ops.length; i++) {
      if (ops[i] === '×') acc *= nums[i + 1]
      else if (ops[i] === '÷') {
        if (acc % nums[i + 1] !== 0) exact = false
        acc /= nums[i + 1]
      } else acc = nums[i + 1]
    }
    if (!exact) continue
    if (!nums.some((x) => x < 0)) continue
    const text = chainText(nums, ops)
    return q({
      prompt: evalPrompt(text),
      answer: numA(r),
      hint: ops.some((o) => o === '×' || o === '÷') && ops.some((o) => o === '+' || o === '-') ? 'Do × and ÷ first, from left to right. Then do + and − from left to right.' : 'Work from left to right.',
      steps: [`${text} = ${num(r)}`, ops.some((o) => o === '×' || o === '÷') && ops.some((o) => o === '+' || o === '-') ? 'Multiplication and division were done before addition and subtraction.' : 'Worked from left to right.'],
    })
  }
}

function orderChoice(): Question {
  const a = nonZero(-9, 9)
  const b = int(2, 9)
  const c = neg(2, 9)
  const r = a + b * c
  const wrong = [(a + b) * c, a + b * -c, -r, a - b * c].filter((x) => x !== r)
  return q({
    prompt: `What is the value of ${num(a)} + ${b} ${TIMES} (${num(c)})?`,
    answer: mcA(num(r), [...new Set(wrong.map((x) => num(x)))].slice(0, 3)),
    hint: 'Multiply before you add.',
    steps: [`${b} ${TIMES} (${num(c)}) = ${num(b * c)}`, `${num(a)} + (${num(b * c)}) = ${num(r)}`],
  })
}

function orderBrackets(): Question {
  for (;;) {
    const form = pick(['a×(b+c)', '[a−b]×c', '(a+b)÷c', 'frac', 'a×b×c'] as const)
    const a = nonZero(-12, 12)
    const b = nonZero(-12, 12)
    const c = nonZero(-9, 9)
    let text = ''
    let r = 0
    if (form === 'a×(b+c)') {
      text = `${num(a)} ${TIMES} (${num(b)} + ${bnum(c)})`
      r = a * (b + c)
    } else if (form === '[a−b]×c') {
      text = `[${num(a)} ${MINUS} ${bnum(b)}] ${TIMES} ${bnum(c)}`
      r = (a - b) * c
    } else if (form === '(a+b)÷c') {
      if ((a + b) % c !== 0 || Math.abs(c) === 1) continue
      text = `(${num(a)} + ${bnum(b)}) ${DIVIDE} ${bnum(c)}`
      r = (a + b) / c
    } else if (form === 'frac') {
      const d = nonZero(-9, 9)
      const den = c - d
      if (den === 0 || (a + b) % den !== 0 || Math.abs(den) === 1) continue
      text = frac(`${num(a)} + ${bnum(b)}`, `${num(c)} ${MINUS} ${bnum(d)}`)
      r = (a + b) / den
    } else {
      const b2 = nonZero(-6, 6)
      if (![a, b2, c].some((x) => x < 0)) continue
      text = `${num(a)} ${TIMES} ${bnum(b2)} ${TIMES} ${bnum(c)}`
      r = a * b2 * c
    }
    if (Math.abs(r) > 300 || ![a, b, c].some((x) => x < 0)) continue
    return q({
      prompt: evalPrompt(text),
      answer: numA(r),
      hint: form === 'frac' ? 'Work out the top and the bottom separately, then divide.' : 'Work out the brackets first.',
      steps: [form === 'frac' ? 'Imagine brackets around the top and the bottom, and work them out first.' : 'Brackets first.', `${text} = ${num(r)}`],
    })
  }
}

function spotMistake(): Question {
  for (;;) {
    const a = nonZero(-12, 12)
    const b = nonZero(-9, 9)
    const c = nonZero(-9, 9)
    const pattern = pick(['a−b×c', 'a+b×c', 'a×b−c'] as const)
    let text = ''
    let right = 0
    let mistake = 0
    if (pattern === 'a−b×c') {
      text = `${num(a)} ${MINUS} ${bnum(b)} ${TIMES} ${bnum(c)}`
      right = a - b * c
      mistake = (a - b) * c
    } else if (pattern === 'a+b×c') {
      text = `${num(a)} + ${bnum(b)} ${TIMES} ${bnum(c)}`
      right = a + b * c
      mistake = (a + b) * c
    } else {
      text = `${num(a)} ${TIMES} ${bnum(b)} ${MINUS} ${bnum(c)}`
      right = a * b - c
      mistake = a * b + c
    }
    if (mistake === right) continue
    const correct = chance(0.3)
    const said = correct ? right : mistake
    const who = pick(['Nuraan', 'Kai', 'Mia', 'Zane', 'Priya', 'Tom'])
    return q({
      prompt: `${who} wrote:${big(`${text} = ${num(said)}`)}Mark ${who}’s work. What is the correct answer?`,
      answer: numA(right),
      hint: 'Work it out yourself using the order of operations, then compare.',
      steps: [`${text} = ${num(right)} (× and ÷ before + and −).`, correct ? `${who} was right.` : `${who} wrote ${num(said)}, which is wrong. The correct answer is ${num(right)}.`],
      meta: { t: 'mistake', pattern, a, b, c },
    })
  }
}

function orderMissing(): Question {
  for (;;) {
    const form = pick(['a×b−x', 'x×(c−d)', '[a−x]×b', 'a+x×c'] as const)
    const a = nonZero(-9, 9)
    const b = nonZero(-8, 8)
    const c = nonZero(-9, 9)
    const d = nonZero(-9, 9)
    const x = nonZero(-9, 9)
    let shown = ''
    let r = 0
    if (form === 'a×b−x') {
      r = a * b - x
      shown = `${num(a)} ${TIMES} ${bnum(b)} ${MINUS} ___ = ${num(r)}`
    } else if (form === 'x×(c−d)') {
      if (c === d) continue
      r = x * (c - d)
      shown = `___ ${TIMES} (${num(c)} ${MINUS} ${bnum(d)}) = ${num(r)}`
    } else if (form === '[a−x]×b') {
      r = (a - x) * b
      if (a - x === 0) continue
      shown = `[${num(a)} ${MINUS} ___] ${TIMES} ${bnum(b)} = ${num(r)}`
    } else {
      r = a + x * c
      shown = `${num(a)} + ___ ${TIMES} ${bnum(c)} = ${num(r)}`
    }
    return q({
      prompt: `Find the missing number.${big(shown)}`,
      answer: numA(x),
      hint: 'Try a number in the blank and check it with the order of operations. Work backwards if you can.',
      steps: [`The missing number is ${num(x)}.`, `Check: ${shown.replace('___', bnum(x)).replace(/ = .*$/, '')} = ${num(r)}`],
      meta: { t: 'missingOrder', form, a, b, c, d, r },
    })
  }
}

/** Every way of putting one pair of brackets around 2 or more neighbouring numbers. */
function bracketings(nums: number[], ops: string[]): { text: string; value: number }[] {
  const out: { text: string; value: number }[] = []
  for (let i = 0; i < nums.length; i++)
    for (let j = i + 1; j < nums.length; j++) {
      if (i === 0 && j === nums.length - 1) continue
      const inner = evalChain(nums.slice(i, j + 1), ops.slice(i, j))
      if (!Number.isFinite(inner)) continue
      const value = evalChain([...nums.slice(0, i), inner, ...nums.slice(j + 1)], [...ops.slice(0, i), ...ops.slice(j)])
      const parts = nums.map((x, k) => (k === 0 ? '' : `${ops[k - 1] === '-' ? '-' : ops[k - 1] === '×' ? '*' : ops[k - 1] === '÷' ? '/' : '+'} `) + (x < 0 ? `(${x})` : String(x)))
      parts[i] = parts[i].replace(/(\S+)$/, '($1')
      parts[j] = parts[j] + ')'
      out.push({ text: parts.join(' '), value })
    }
  return out
}

function orderBracketsOpen(): Question {
  for (;;) {
    const nums = [nonZero(-9, 9), int(2, 9), int(2, 9), neg(2, 9)]
    const ops = [pick(['×', '÷']), pick(['-', '+']), pick(['+', '-', '×'])]
    if (ops[0] === '÷') nums[0] = nums[1] * nonZero(-6, 6)
    const plain = evalChain(nums, ops)
    if (!Number.isInteger(plain)) continue
    const options = bracketings(nums, ops).filter((b) => Number.isInteger(b.value) && b.value !== plain)
    if (!options.length) continue
    const pickB = pick(options)
    const text = chainText(nums, ops)
    return q({
      prompt: `Copy the calculation and put in one pair of brackets so that it equals ${num(pickB.value)}. Type the whole calculation with your brackets.${big(`${text} = ${num(pickB.value)}`)}`,
      answer: { kind: 'open', rule: { type: 'brackets', expr: text, target: pickB.value }, example: pickB.text },
      hint: 'Try brackets around different pairs of numbers and work each one out.',
      steps: [`Without brackets it equals ${num(plain)}.`, `One answer: ${pickB.text.replace(/-(?=\d)/g, MINUS).replace(/ - /g, ` ${MINUS} `).replace(/\*/g, TIMES).replace(/\//g, DIVIDE)} = ${num(pickB.value)}`],
      meta: { t: 'brackets', expr: text, target: pickB.value },
    })
  }
}

function useNumbers(big3: boolean): Question {
  for (;;) {
    const numsAbs = big3 ? [int(11, 80), int(11, 25), int(11, 25)] : [int(2, 9), int(2, 9), int(2, 9)]
    const negIdx = int(0, 2)
    const ns = numsAbs.map((x, i) => (i === negIdx ? -x : x))
    const [x, y, z] = shuffle(ns)
    const forms: [string, number][] = [
      [`(${x} + ${y}) * ${z}`, (x + y) * z],
      [`${x} * ${y} + ${z}`, x * y + z],
      [`${x} - ${y} * ${z}`, x - y * z],
      [`${x} * (${y} - ${z})`, x * (y - z)],
      [`(${x} - ${y}) * ${z}`, (x - y) * z],
    ]
    const [example, target] = pick(forms)
    if (!Number.isInteger(target) || target === 0) continue
    // write each negative number in brackets, e.g. "(4 + (-8)) * 3"
    const tidy = example.replace(/(^|[(*+\- ])(-\d+)/g, '$1($2)')
    const listed = ns.map((v) => num(v)).join(', ').replace(/, ([^,]*)$/, ' and $1')
    return q({
      prompt: `Use each of the integers ${listed} once, with any operations and brackets, to make ${num(target)}. Type your whole calculation.${big(`___ = ${num(target)}`)}`,
      answer: { kind: 'open', rule: { type: 'use', numbers: ns, target }, example: tidy },
      calc: big3,
      hint: 'Try multiplying two of the numbers and then adding or subtracting the third, or use brackets to add or subtract first.',
      steps: [`One answer: ${tidy.replace(/-/g, MINUS).replace(/\*/g, TIMES)} = ${num(target)}`, 'Any calculation that uses each number once and equals the target is correct.'],
      meta: { t: 'use', ns, target },
    })
  }
}

export const ex108 = (level: Level): Question => {
  if (level === 1) return chance(0.8) ? orderChain(1) : orderChoice()
  if (level === 2) return pick([orderBrackets, orderBrackets, spotMistake, () => orderChain(2)])()
  return pick([orderMissing, orderBracketsOpen, () => useNumbers(false), orderChoice])()
}

// ================================================================== 1.09 Integers and the calculator

function noCalc(): Question {
  const form = pick(['sq', 'mixsq', 'divsq', 'plain'] as const)
  const n = int(2, 9)
  if (form === 'sq') return squareNeg()
  if (form === 'mixsq') {
    const a = nonZero(-5, 5)
    return q({
      prompt: evalPrompt(`${num(a)} ${TIMES} ${pow(-n, 2)}`),
      answer: numA(a * n * n),
      hint: 'Powers come before multiplication.',
      steps: [`${pow(-n, 2)} = ${n * n}`, `${num(a)} ${TIMES} ${n * n} = ${num(a * n * n)}`],
    })
  }
  if (form === 'divsq') {
    const k = nonZero(-4, 4)
    const a = k * n * n
    return q({
      prompt: evalPrompt(`${num(a)} ${DIVIDE} ${pow(-n, 2)}`),
      answer: numA(k),
      hint: 'Powers come before division.',
      steps: [`${pow(-n, 2)} = ${n * n}`, `${num(a)} ${DIVIDE} ${n * n} = ${num(k)}`],
    })
  }
  return pick([() => addEval(2), () => subEval(2), () => mulEval(1), () => divEval()])()
}

function minusSquared(): Question {
  const n = int(2, 12)
  if (chance()) {
    const negInside = chance()
    return q({
      prompt: `What is the value of ${negInside ? pow(-n, 2) : `${MINUS}${n}<sup>2</sup>`}?`,
      answer: numA(negInside ? n * n : -n * n),
      hint: negInside ? 'The brackets mean the whole of the negative number is squared.' : `Without brackets, only ${n} is squared, then the answer is made negative.`,
      steps: [negInside ? `${pow(-n, 2)} = ${bnum(-n)} ${TIMES} ${bnum(-n)} = ${n * n}` : `${MINUS}${n}<sup>2</sup> = ${MINUS}(${n} ${TIMES} ${n}) = ${num(-n * n)}`],
      meta: { t: 'minusSq', n, negInside },
    })
  }
  return q({
    prompt: `Which of these has the value ${n * n}?`,
    answer: mcA(pow(-n, 2), [`${MINUS}${n}<sup>2</sup>`, `${n} ${TIMES} (${MINUS}${n})`, `${MINUS}${pow(-n, 2)}`]),
    hint: 'A negative number squared is positive, but only if the brackets show the negative is being squared.',
    steps: [`${pow(-n, 2)} = ${n * n}. The others all equal ${num(-n * n)}.`],
  })
}

function calcEval(): Question {
  for (;;) {
    const form = pick(['a×b÷c', 'a÷b×c', '[a−b]×c+d', 'a×b÷c+d', 'a+b−c'] as const)
    const a = nonZero(-250, 250)
    const b = nonZero(-60, 60)
    const c = nonZero(-30, 30)
    const d = nonZero(-90, 90)
    let text = ''
    let r = 0
    if (form === 'a×b÷c') {
      if ((a * b) % c !== 0) continue
      text = `${num(a)} ${TIMES} ${bnum(b)} ${DIVIDE} ${bnum(c)}`
      r = (a * b) / c
    } else if (form === 'a÷b×c') {
      if (a % b !== 0 || Math.abs(b) === 1) continue
      text = `${num(a)} ${DIVIDE} ${bnum(b)} ${TIMES} ${bnum(c)}`
      r = (a / b) * c
    } else if (form === '[a−b]×c+d') {
      text = `[${num(a)} ${MINUS} ${bnum(b)}] ${TIMES} ${bnum(c)} + ${bnum(d)}`
      r = (a - b) * c + d
    } else if (form === 'a×b÷c+d') {
      if ((a * b) % c !== 0) continue
      text = `${num(a)} ${TIMES} ${bnum(b)} ${DIVIDE} ${bnum(c)} + ${bnum(d)}`
      r = (a * b) / c + d
    } else {
      text = `${num(a)} + ${bnum(b * 7)} ${MINUS} ${bnum(c * 11)}`
      r = a + b * 7 - c * 11
    }
    if (Math.abs(r) > 100000) continue
    return q({
      prompt: evalPrompt(text),
      answer: numA(r),
      calc: true,
      hint: 'Use the sign-change key (−) for negative numbers, and brackets where they are shown.',
      steps: [`Type it into the calculator exactly as written, using (−) for each negative number.`, `${text} = ${num(r)}`],
    })
  }
}

function calcMissing(): Question {
  const a = nonZero(-30, 30)
  const b = nonZero(-60, 60)
  const x = nonZero(-40, 40)
  const r = a * (x - b)
  if (x === b) return calcMissing()
  return q({
    prompt: `Find the missing number. You may use a calculator.${big(`${num(a)} ${TIMES} (___ ${MINUS} ${bnum(b)}) = ${num(r)}`)}`,
    answer: numA(x),
    calc: true,
    hint: 'Undo the multiplication first (divide), then undo the subtraction (add).',
    steps: [`${num(r)} ${DIVIDE} ${bnum(a)} = ${num(x - b)}`, `___ ${MINUS} ${bnum(b)} = ${num(x - b)}, so ___ = ${num(x - b)} + ${bnum(b)} = ${num(x)}`],
    meta: { t: 'calcMissing', a, b, r },
  })
}

export const ex109 = (level: Level): Question => {
  if (level === 1) return noCalc()
  if (level === 2) return pick([minusSquared, calcEval, calcEval])()
  return pick([calcMissing, () => useNumbers(true), calcEval])()
}

// ================================================================== 1.10 Integer problems

const TOWNS = ['Canberra', 'Goulburn', 'Orange', 'Cooma', 'Armidale', 'Oberon', 'Bathurst', 'Tumut']

function pTempDrop(): Question {
  const town = pick(TOWNS)
  const max = int(5, 22)
  const min = neg(1, 9)
  const rise = chance()
  return q({
    prompt: rise
      ? `The minimum overnight temperature in ${town} was ${num(min)}°C. During the day it rose to ${max}°C. By how many degrees did the temperature rise?`
      : `In ${town} the temperature reached a maximum of ${max}°C. Overnight it dropped to a minimum of ${num(min)}°C. How many degrees did it drop?`,
    answer: numA(max - min),
    suffix: '°C',
    hint: 'Write a number sentence: the higher temperature minus the lower one.',
    steps: [`${max} ${MINUS} (${num(min)}) = ${max} + ${-min} = ${max - min}`, `The temperature ${rise ? 'rose' : 'dropped'} ${max - min} degrees.`],
    meta: { t: 'tempChange', max, min },
  })
}

function pWalk(): Question {
  const who = pick(['Craig', 'Ella', 'Sam', 'Aaliyah', 'Ben', 'Lily'])
  const e = int(3, 20)
  const w = int(3, 24)
  if (e === w) return pWalk()
  const pos = e - w
  return q({
    prompt: `${who} walked ${e} kilometres east and then ${w} kilometres west. How far is ${who} from the starting point?`,
    answer: numA(Math.abs(pos)),
    suffix: 'km',
    hint: 'Call east positive and west negative.',
    steps: [`${e} + (${num(-w)}) = ${num(pos)}`, `${who} is ${Math.abs(pos)} km ${pos > 0 ? 'east' : 'west'} of the start.`],
    meta: { t: 'walk', e, w },
  })
}

function pWalkNS(): Question {
  const who = pick(['Anya', 'Jack', 'Mei', 'Leo'])
  const s1 = int(2, 9)
  const n1 = intOther(s1, 1, 12)
  const pos = n1 - s1
  const where = (d: number) => `${Math.abs(d)} km ${d > 0 ? 'north' : 'south'} of ${who}’s home`
  return q({
    prompt: `${who} walked ${s1} kilometres south to a friend’s home. Together they then walked ${n1} kilometres north. Where are they now?`,
    answer: mcA(where(pos), [where(-pos), where(n1 + s1), where(-(n1 + s1))]),
    hint: 'Call north positive and south negative.',
    steps: [`${num(-s1)} + ${n1} = ${num(pos)}`, `They are ${where(pos)}.`],
  })
}

const PLACES: [string, number][] = [
  ['Mt Everest (Nepal)', 8849], ['Mt Kosciuszko (NSW)', 2228], ['Mt Townsend (NSW)', 2209], ['Mt Ossa (Tasmania)', 1617],
  ['Kati Thanda–Lake Eyre (SA)', -15], ['Death Valley (USA)', -86], ['the shore of the Dead Sea', -430], ['the Caspian Sea (surface)', -28],
]

function pHeights(): Question {
  const [p1, p2] = sample(PLACES, 2).sort((a, b) => b[1] - a[1])
  return q({
    prompt: `${D.table(['Place', 'Height above sea level'], PLACES.filter((p) => p === p1 || p === p2 || chance(0.3)).map((p) => [p[0], `${num(p[1])} m`]))}Heights are rounded, and below sea level is negative. How much higher is ${p1[0]} than ${p2[0]}?`,
    answer: numA(p1[1] - p2[1]),
    suffix: 'm',
    hint: 'Subtract the lower height from the higher one.',
    steps: [`${num(p1[1])} ${MINUS} ${bnum(p2[1])} = ${num(p1[1] - p2[1])} m`],
    meta: { t: 'heights', h1: p1[1], h2: p2[1] },
  })
}

function pDivers(): Question {
  const a = int(4, 30)
  const b = intOther(a, 2, 30)
  return q({
    prompt: `A scuba diver is swimming at a depth of ${a} metres. Her friend is at a depth of ${b} metres. What is the vertical distance between them?`,
    answer: numA(Math.abs(a - b)),
    suffix: 'm',
    hint: 'Depths below the surface are negative: subtract one from the other.',
    steps: [`${num(-Math.min(a, b))} ${MINUS} (${num(-Math.max(a, b))}) = ${Math.abs(a - b)} m`],
    meta: { t: 'divers', a, b },
  })
}

function pProfit(): Question {
  const years = ['2019', '2020', '2021', '2022', '2023', '2024']
  let vals: number[]
  do vals = years.map(() => pick([-80, -60, -40, -20, 20, 40, 60, 80, 100, 120, 160, 200]))
  while (vals.filter((v) => v < 0).length < 2 || vals.filter((v) => v > 0).length < 2)
  const diagram = D4.signedColumns(years, vals, 40, '$ million', 'Yearly profits')
  const kind = pick(['loss', 'fall', 'total'] as const)
  if (kind === 'loss') {
    const lossYears = years.filter((_, i) => vals[i] < 0).join(', ')
    const pool = [
      years.filter((_, i) => vals[i] > 0).join(', '),
      years.filter((_, i) => i % 2 === 0).join(', '),
      years.filter((_, i) => i % 2 === 1).join(', '),
      years.slice(0, 3).join(', '),
      years.slice(3).join(', '),
      years.filter((_, i) => vals[i] < 0 && i > 0).join(', '),
    ]
    const wrong = shuffle([...new Set(pool)].filter((o) => o && o !== lossYears)).slice(0, 3)
    const options = shuffle([lossYears, ...wrong])
    return q({
      prompt: 'This graph shows a company’s yearly profits. A negative profit is a loss. In which years did the company make a loss?',
      diagram,
      answer: mcFixedA(options, lossYears),
      hint: 'A loss is a column below zero.',
      steps: [`The columns below zero are for ${lossYears}.`],
    })
  }
  if (kind === 'fall') {
    let i = 0
    for (let k = 0; k < 5; k++) if (vals[k] - vals[k + 1] > vals[i] - vals[i + 1]) i = k
    if (vals[i] <= vals[i + 1]) return pProfit()
    return q({
      prompt: `This graph shows a company’s yearly profits in millions of dollars. A negative profit is a loss. By how much did the profit fall from ${years[i]} to ${years[i + 1]}?`,
      diagram,
      answer: numA(vals[i] - vals[i + 1]),
      suffix: 'million dollars',
      hint: 'Subtract the later value from the earlier one.',
      steps: [`${num(vals[i])} ${MINUS} ${bnum(vals[i + 1])} = ${num(vals[i] - vals[i + 1])} million dollars`],
      meta: { t: 'profitFall', from: vals[i], to: vals[i + 1] },
    })
  }
  const total = vals.reduce((x, y) => x + y, 0)
  return q({
    prompt: 'This graph shows a company’s yearly profits in millions of dollars. A negative profit is a loss. What was the total profit over the 6 years? (Give a negative answer for an overall loss.)',
    diagram,
    answer: numA(total),
    suffix: 'million dollars',
    hint: 'Add all six values, counting losses as negative.',
    steps: [`${vals.map((v, k) => (k === 0 ? num(v) : `${v < 0 ? MINUS : '+'} ${Math.abs(v)}`)).join(' ')} = ${num(total)}`],
    meta: { t: 'profitTotal', vals },
  })
}

function pOverdraft(): Question {
  const who = pick(['Karina', 'Josh', 'Amira', 'Tyler'])
  const had = int(20, 90)
  const out = had + int(10, 80)
  const dep = int(10, 120)
  const r = had - out + dep
  return q({
    prompt: `${who} had $${had} in a bank account yesterday and was allowed to withdraw $${out}. Today ${who} deposited $${dep}. What is the balance now? (Use a negative number if the account is overdrawn.)`,
    answer: numA(r),
    suffix: 'dollars',
    hint: 'Start with the balance, subtract the withdrawal, then add the deposit.',
    steps: [`${had} ${MINUS} ${out} + ${dep} = ${num(r)}`, r < 0 ? `The account is overdrawn by $${-r}.` : `The balance is $${r}.`],
    meta: { t: 'overdraft', had, out, dep },
  })
}

function pWhichExpression(): Question {
  const place = pick(['Perisher', 'Thredbo', 'Charlotte Pass', 'Mt Selwyn'])
  const start = neg(2, 8)
  const up = int(8, 16)
  const down = int(2, 7)
  return q({
    prompt: `At ${place} the overnight temperature was ${num(start)}°C. During the day it rose by ${up}°C, then it dropped by ${down}°C after sunset. Which expression gives the temperature after sunset?`,
    answer: mcA(`${num(start)} + ${up} ${MINUS} ${down}`, [`${num(start)} ${MINUS} ${up} ${MINUS} ${down}`, `${num(start)} + ${up} + ${down}`, `${num(-down)} ${MINUS} ${up} ${MINUS} ${-start}`]),
    hint: 'Start with the overnight temperature. A rise adds, a drop subtracts.',
    steps: [`Start at ${num(start)}, add the rise of ${up}, subtract the drop of ${down}: ${num(start)} + ${up} ${MINUS} ${down} = ${num(start + up - down)}°C.`],
  })
}

function pSubmarine(): Question {
  const down = int(300, 990)
  const up = int(100, down - 50)
  return q({
    prompt: `A submarine dives from the surface to a depth of ${down} metres. It then rises ${up} metres to send a message. How far below the surface is it when it sends the message?`,
    answer: numA(down - up),
    suffix: 'm',
    hint: 'Below the surface is negative. Diving subtracts, rising adds.',
    steps: [`${num(-down)} + ${up} = ${num(up - down)}`, `It is ${down - up} m below the surface.`],
    meta: { t: 'sub', down, up },
  })
}

function pCricket(): Question {
  const team = pick(['Liam’s', 'Harper’s', 'Noah’s', 'Isla’s'])
  const k = int(3, 6)
  const scores = Array.from({ length: k }, () => int(0, 30))
  const now = int(2, 20)
  const total = scores.reduce((x, y) => x + y, 0) - 5 * k + now
  return q({
    prompt: `In indoor cricket, each time a batter gets out, the team’s score goes down by 5. In ${team} team, the first ${k} batters scored ${scores.join(', ')} and each got out. The next batter has scored ${now} and is still batting. What is the team’s score now?`,
    answer: numA(total),
    hint: 'Add all the runs, then take off 5 for each batter who got out.',
    steps: [`Runs: ${scores.join(' + ')} + ${now} = ${scores.reduce((x, y) => x + y, 0) + now}`, `Outs: ${k} ${TIMES} (${MINUS}5) = ${num(-5 * k)}`, `Score: ${scores.reduce((x, y) => x + y, 0) + now} ${MINUS} ${5 * k} = ${num(total)}`],
    meta: { t: 'cricket', scores, now },
  })
}

function pVolcano(): Question {
  const v = pick([['Mt Etna in Italy', 3300], ['Mt Fuji in Japan', 3776], ['Mt Ruapehu in New Zealand', 2797], ['Mt St Helens in the USA', 2549]] as [string, number][])
  const below = int(300, 900)
  const above = int(100, 800)
  return q({
    prompt: `${v[0]} is about ${num(v[1])} m high. Lava starts ${below} m below the ground and shoots ${above} m above the top of the volcano. How far does the lava travel from where it starts to its highest point?`,
    answer: numA(below + v[1] + above),
    suffix: 'm',
    hint: 'Put ground level at 0. Find the start and finish heights, then find the difference.',
    steps: [`Start: ${num(-below)} m. Highest point: ${num(v[1])} + ${above} = ${num(v[1] + above)} m.`, `${num(v[1] + above)} ${MINUS} (${num(-below)}) = ${num(v[1] + above + below)} m`],
    meta: { t: 'volcano', below, height: v[1], above },
  })
}

function pBird(): Question {
  const h = pick([120, 150, 200, 240, 320, 360])
  const speed = pick([40, 50, 60, 70, 80])
  const t = int(Math.ceil(h / speed) + 1, Math.ceil(h / speed) + 6)
  const ask = chance()
  return q({
    prompt: `A bird dives into a river from ${h} cm above the water, travelling at ${speed} cm per second. ${ask ? `How far does it travel in ${t} seconds?` : `How far below the water is it after ${t} seconds?`}`,
    answer: numA(ask ? speed * t : speed * t - h),
    suffix: 'cm',
    hint: 'Distance = speed × time. The water surface is 0.',
    steps: [`In ${t} seconds it travels ${speed} ${TIMES} ${t} = ${speed * t} cm.`, ...(ask ? [] : [`${h} ${MINUS} ${speed * t} = ${num(h - speed * t)}, so it is ${speed * t - h} cm below the water.`])],
    meta: { t: 'bird', h, speed, time: t, ask },
  })
}

function pStatement(): Question {
  const start = int(10, 80) + pick([0.05, 0.2, 0.35, 0.5, 0.85])
  const moves: number[] = []
  let bal = start
  for (let i = 0; i < 5; i++) {
    let m = (chance() ? 1 : -1) * (int(5, 150) + pick([0, 0.1, 0.15, 0.2, 0.75, 0.95]))
    if (bal + m < 0) m = -m
    m = Math.round(m * 100) / 100
    moves.push(m)
    bal = Math.round((bal + m) * 100) / 100
  }
  const rows = [['Starting balance', money(start)], ...moves.map((m) => [m > 0 ? 'Deposit' : 'Withdraw', money(Math.abs(m))])]
  return q({
    prompt: `Find the closing balance of this bank account after all the deposits and withdrawals.${D.table(['', 'Amount'], rows)}`,
    answer: numA(bal, 2),
    prefix: '$',
    hint: 'Add deposits and subtract withdrawals, one line at a time.',
    steps: [`${num(start, 2)} ${moves.map((m) => `${m < 0 ? MINUS : '+'} ${num(Math.abs(m), 2)}`).join(' ')} = ${num(bal, 2)}`],
    meta: { t: 'statement', start, moves },
  })
}

function pDays(): Question {
  const who = pick(['Jayden', 'Ruby', 'Omar', 'Chloe'])
  const owe = int(6, 20) * 10
  const per = int(4, 15)
  const days = 20
  const first = Math.floor(owe / per) + 1
  if (first > days) return pDays()
  const ask = chance()
  return q({
    prompt: `${who}’s bank balance is ${num(-owe)} dollars. ${who} deposits $${per} every day for the next ${days} days. ${ask ? 'On which day will the balance first become positive?' : `What will the balance be after ${days} days?`}`,
    answer: numA(ask ? first : -owe + per * days),
    ...(ask ? {} : { suffix: 'dollars' }),
    hint: ask ? `Each day adds ${per}. How many days until the total is more than ${owe}?` : `${days} deposits of $${per}, added to the starting balance.`,
    steps: ask
      ? [`After ${first - 1} days: ${num(-owe)} + ${per} ${TIMES} ${first - 1} = ${num(-owe + per * (first - 1))} (not positive yet).`, `After ${first} days: ${num(-owe + per * first)}, which is positive. So day ${first}.`]
      : [`${num(-owe)} + ${per} ${TIMES} ${days} = ${num(-owe)} + ${per * days} = ${num(-owe + per * days)}`],
    meta: { t: 'days', owe, per, days, ask },
  })
}

function pSavings(): Question {
  const who = pick(['Harrison', 'Zoe', 'Ethan', 'Priya'])
  const save = int(4, 12) * 10
  const loan = int(15, 30) * 10
  const r = save * 26 - loan * 6
  return q({
    prompt: `${who} opens a new bank account. Each week $${save} goes into the account, and each month $${loan} comes out to pay off a loan. How much is in the account after 6 months, if there are 26 weeks in 6 months? (Use a negative number if the account is overdrawn.)`,
    answer: numA(r),
    suffix: 'dollars',
    hint: 'Money in: 26 weeks of savings. Money out: 6 monthly payments.',
    steps: [`In: 26 ${TIMES} ${save} = ${num(save * 26)}. Out: 6 ${TIMES} ${loan} = ${num(loan * 6)}.`, `${num(save * 26)} ${MINUS} ${num(loan * 6)} = ${num(r)}`],
    meta: { t: 'savings', save, loan },
  })
}

export const ex110 = (level: Level): Question => {
  if (level === 1) return pick([pTempDrop, pWalk, pHeights, pDivers])()
  if (level === 2) return pick([pProfit, pWalkNS, pOverdraft, pWhichExpression, pSubmarine])()
  return pick([pCricket, pVolcano, pBird, pStatement, pDays, pSavings])()
}

// ================================================================== Power plus (extension)

function powerOfMinusOne(): Question {
  const n = int(2, 11)
  if (chance(0.7))
    return q({
      prompt: evalPrompt(pow(-1, n)),
      answer: numA(n % 2 === 0 ? 1 : -1),
      hint: 'Multiply −1 by itself, one step at a time. Look for the pattern.',
      steps: [`(${MINUS}1) ${TIMES} (${MINUS}1) = 1, then the sign keeps flipping.`, `${n} is ${n % 2 === 0 ? 'even' : 'odd'}, so ${pow(-1, n)} = ${n % 2 === 0 ? 1 : num(-1)}.`],
    })
  const even = chance()
  return q({
    prompt: `When <i>n</i> is ${even ? 'an even' : 'an odd'} whole number, what is the value of (${MINUS}1)<sup><i>n</i></sup>?`,
    answer: mcFixedA(['1', num(-1), '<i>n</i>', `${MINUS}<i>n</i>`], even ? '1' : num(-1)),
    hint: 'Try n = 2, 3, 4 and 5.',
    steps: [`Each pair of (${MINUS}1)s multiplies to 1. With ${even ? 'an even number of them, they all pair up: 1' : 'an odd number, one is left over: −1'}.`],
  })
}

function rootsQ(): Question {
  const kind = pick(['square', 'cube', 'neg'] as const)
  const n = int(2, 12)
  if (kind === 'square')
    return q({
      prompt: `Find all the integers that make this true.${big(`___<sup>2</sup> = ${n * n}`)}`,
      answer: { kind: 'nums', values: [n, -n] },
      hint: 'A positive number and a negative number can both square to the same answer.',
      steps: [`${n}<sup>2</sup> = ${n * n} and ${pow(-n, 2)} = ${n * n}, so the answers are ${n} and ${num(-n)}.`],
      meta: { t: 'sq', n },
    })
  if (kind === 'cube') {
    const m = int(2, 5)
    return q({
      prompt: `Find the integer that makes this true.${big(`___<sup>3</sup> = ${num(-m * m * m)}`)}`,
      answer: numA(-m),
      hint: 'A negative number cubed is negative.',
      steps: [`(${MINUS}${m}) ${TIMES} (${MINUS}${m}) ${TIMES} (${MINUS}${m}) = ${num(-m * m * m)}`],
      meta: { t: 'cube', m },
    })
  }
  return q({
    prompt: `Dylan says there is no integer that makes ___<sup>2</sup> = ${num(-n * n)} true. Is he correct?`,
    answer: mcFixedA(['Yes', 'No'], 'Yes'),
    hint: 'Can a number times itself ever be negative?',
    steps: ['A positive times a positive is positive, and a negative times a negative is positive. 0 squared is 0.', 'No integer squared is negative, so Dylan is correct.'],
  })
}

function averageQ(): Question {
  let a: number, b: number
  do {
    a = int(-25, 25)
    b = int(-25, 25)
  } while (a === b || (a > 0 && b > 0) || (a + b) % 2 !== 0)
  return q({
    prompt: `Find the average of ${num(a)} and ${num(b)}.`,
    answer: numA((a + b) / 2),
    hint: 'Add the two numbers, then divide by 2.',
    steps: [`(${num(a)} + ${bnum(b)}) ${DIVIDE} 2 = ${num(a + b)} ${DIVIDE} 2 = ${num((a + b) / 2)}`],
    meta: { t: 'average', a, b },
  })
}

function sumProduct(): Question {
  let x: number, y: number
  do {
    x = nonZero(-10, 10)
    y = nonZero(-10, 10)
  } while (x === y || (x > 0 && y > 0))
  return q({
    prompt: `Find 2 integers that have a sum of ${num(x + y)} and a product of ${num(x * y)}.`,
    answer: { kind: 'nums', values: [x, y] },
    hint: 'List pairs of numbers that multiply to give the product, then check which pair adds to the sum.',
    steps: [`${num(x)} + ${bnum(y)} = ${num(x + y)} and ${num(x)} ${TIMES} ${bnum(y)} = ${num(x * y)}.`],
    meta: { t: 'sumProduct', x, y },
  })
}

function threeIntegersOpen(): Question {
  if (chance()) {
    const target = neg(2, 12)
    const a = nonZero(-8, 8)
    const b = nonZero(-8, 8)
    return openBlanks('+', 3, target, [a, b, target - a - b])
  }
  // each target has whole-number factors −2, ±3 and t/6, so the example below always works
  const t = pick([36, -24, 30, -30, 48, -60, 12, -12])
  const ex = t > 0 ? [-2, -3, t / 6] : [-2, 3, t / -6]
  return openBlanks('×', 3, t, ex)
}

const IDENTITIES: [string, boolean, string][] = [
  ['<i>a</i> + <i>b</i> = <i>b</i> + <i>a</i>', true, 'Integers can be added in any order.'],
  ['<i>a</i> − <i>b</i> = <i>b</i> − <i>a</i>', false, 'e.g. 5 − 2 = 3 but 2 − 5 = −3.'],
  ['<i>a</i> × <i>b</i> = <i>b</i> × <i>a</i>', true, 'Integers can be multiplied in any order.'],
  ['<i>a</i> ÷ <i>b</i> = <i>b</i> ÷ <i>a</i>', false, 'e.g. 8 ÷ 2 = 4 but 2 ÷ 8 is not 4.'],
  ['<i>a</i> + (−<i>a</i>) = 0', true, 'A number plus its opposite is zero.'],
  ['(−<i>a</i>) × (−<i>a</i>) = <i>a</i> × <i>a</i>', true, 'Negative × negative is positive, so both equal <i>a</i><sup>2</sup>.'],
  ['<i>a</i> − (−<i>a</i>) = 0', false, 'Subtracting −<i>a</i> adds <i>a</i>, so the answer is 2<i>a</i>, e.g. 3 − (−3) = 6.'],
  ['(−<i>a</i>) + (−<i>a</i>) = −2 × <i>a</i>', true, 'Two lots of −<i>a</i> make −2<i>a</i>.'],
]

function identityQ(): Question {
  const [stmt, truth, why] = pick(IDENTITIES)
  return q({
    prompt: `<i>a</i> and <i>b</i> are any integers (not zero). Is this statement always true?${big(stmt)}`,
    answer: mcFixedA(['True', 'False'], truth ? 'True' : 'False'),
    hint: 'Test it with a few numbers, including negatives.',
    steps: [why, truth ? 'It is always true.' : 'It is false.'],
  })
}

export const exPowerPlus = (level: Level): Question => {
  if (level === 1) return powerOfMinusOne()
  if (level === 2) return pick([rootsQ, averageQ])()
  return pick([sumProduct, threeIntegersOpen, identityQ])()
}

// ================================================================== Topic test (like Test Yourself 1)

const T = (skill: string, level: Level, gen: () => Question): TestItem => ({ skill, level, gen: () => gen() })

export const NCM1_TEST: TestItem[] = [
  T('y7-int-abovezero', 1, oppositeNumber),
  T('y7-int-numline', 2, integersBetween),
  T('y7-int-compare', 1, compareTwo),
  T('y7-int-compare', 2, orderList),
  T('y7-int-add', 2, () => addEval(2)),
  T('y7-int-sub', 2, () => subEval(2)),
  T('y7-int-mul', 2, () => mulEval(3)),
  T('y7-int-div', 2, () => divEval()),
  T('y7-int-orderops', 2, orderBrackets),
  T('y7-int-calc', 2, calcEval),
  T('y7-int-problems', 2, pTempDrop),
  T('y7-int-problems', 3, pSavings),
]

// ================================================================== Skills, in textbook order

const ref = (n: string) => `NCM 7 Ex ${n}`

export const NCM1_SKILLS: Skill[] = [
  {
    id: 'y7-int-abovezero',
    title: 'Numbers above and below zero',
    ref: ref('1.01'),
    outcomes: OUTCOMES,
    summary: 'Use positive and negative numbers for temperatures, heights, money and time, and find opposites.',
    learn: {
      intro: '<p>Numbers greater than zero are <b>positive</b>; numbers less than zero are <b>negative</b>. We use them whenever something can go either way from a starting point: temperatures above and below 0°C, heights above and below sea level, money in and out of an account, years before and after 0.</p><p>Every number has an <b>opposite</b>: the number the same distance from zero on the other side. The opposite of 7 is −7, and the opposite of −7 is 7. We say “negative 7”, not “minus 7”.</p>',
      keyPoints: ['Zero is neither positive nor negative. It is its own opposite.', 'Up, above, after, more, deposit, profit: positive. Down, below, before, less, withdraw, loss: negative.', 'Years BCE (before the Common Era) are like negative numbers; years CE are positive.'],
      vocab: [['positive number', 'a number greater than zero'], ['negative number', 'a number less than zero'], ['opposite', 'the number the same distance from zero on the other side']],
    },
    gen: ex101,
    levels: { 1: 'Opposites; reading a temperature scale; writing situations as integers', 2: 'Opposite situations; heights above and below sea level; running bank balances', 3: 'Temperature differences; BCE/CE timelines; calendars with a different Year 0' },
  },
  {
    id: 'y7-int-numline',
    title: 'Integers on a number line',
    ref: ref('1.02'),
    outcomes: OUTCOMES,
    summary: 'Read and complete number lines with different scales, and move left and right along them.',
    learn: {
      intro: '<p>A <b>number line</b> shows numbers in order. Numbers get bigger as you move right and smaller as you move left, and the line keeps going forever in both directions.</p><p><b>Integers</b> are the positive and negative whole numbers and zero: …, −3, −2, −1, 0, 1, 2, 3, … Fractions and decimals such as 2½ and −4.7 are not integers.</p>',
      keyPoints: ['Before reading a number line, work out how much each mark is worth.', 'Moving right adds; moving left subtracts.', '“Between −2 and 3” does not include −2 or 3.'],
      vocab: [['integer', 'a positive or negative whole number, or zero'], ['number line', 'a line that shows the position and order of numbers']],
    },
    gen: ex102,
    levels: { 1: 'Reading arrows on a number line counting by 1; completing a number line', 2: 'Number lines counting by 2, 4, 5, 10 or 20; listing integers between two numbers; one move', 3: 'Two moves along a number line; listing integers less than a number' },
  },
  {
    id: 'y7-int-compare',
    title: 'Ordering integers',
    ref: ref('1.03'),
    outcomes: OUTCOMES,
    summary: 'Compare integers with < and >, put them in order, and find distances on a number line.',
    learn: {
      intro: '<p>&gt; means “is greater than” and &lt; means “is less than”. The symbol opens towards the bigger number: 3 &gt; −4 and −5 &lt; 2.</p><p>On a number line, the number further to the right is always the greater one. So −2 &gt; −6, even though 6 is bigger than 2.</p>',
      keyPoints: ['<b>Ascending</b> order: smallest to largest (going up).', '<b>Descending</b> order: largest to smallest (going down).', 'The distance between two integers is how many steps apart they are, and is never negative.'],
      vocab: [['ascending', 'increasing, from smallest to largest'], ['descending', 'decreasing, from largest to smallest']],
    },
    gen: ex103,
    levels: { 1: 'Comparing two integers with < or >; biggest and smallest in a list', 2: 'Ascending and descending order; distance between two integers', 3: 'Which statement is true; following moves in the positive and negative directions' },
  },
  {
    id: 'y7-int-add',
    title: 'Adding integers',
    ref: ref('1.04'),
    outcomes: OUTCOMES,
    summary: 'Add integers using a number line and the rule for adding a negative.',
    learn: {
      intro: '<p>To add on a number line, start at the first number. Adding a <b>positive</b> number moves right. Adding a <b>negative</b> number moves left: it is the same as subtracting its opposite, so 2 + (−5) = 2 − 5 = −3.</p>',
      keyPoints: ['Integers can be added in any order: −5 + 9 = 9 + (−5).', 'A number plus its opposite is 0.', 'The sum of two negative integers is always negative.'],
      vocab: [['sum', 'the answer to an addition'], ['evaluate', 'find the value of; work out the answer']],
    },
    gen: ex104,
    example: exampleAdd,
    levels: { 1: 'Adding two integers', 2: 'Bigger numbers and three integers; does order matter; sign of a sum', 3: 'Missing numbers; finding your own numbers to make a sum' },
  },
  {
    id: 'y7-int-sub',
    title: 'Subtracting integers',
    ref: ref('1.05'),
    outcomes: OUTCOMES,
    summary: 'Subtract integers, including subtracting a negative.',
    learn: {
      intro: '<p>To subtract on a number line, start at the first number. Subtracting a <b>positive</b> number moves left. Subtracting a <b>negative</b> number moves right: it is the same as adding its opposite, so 4 − (−3) = 4 + 3 = 7.</p><p>Read 4 − (−3) as “4 minus negative 3”.</p>',
      keyPoints: ['Order matters: 10 − 4 = 6 but 4 − 10 = −6.', 'The difference between two numbers (how far apart they are) is always positive, but evaluating a − b keeps the order and can be negative.'],
      vocab: [['difference', 'the answer to a subtraction'], ['minus', 'subtract or take away']],
    },
    gen: ex105,
    example: exampleSub,
    levels: { 1: 'Subtracting two integers', 2: 'Bigger numbers and three integers; does order matter; sign of a difference', 3: '“Difference between” versus evaluating; missing numbers; finding your own numbers' },
  },
  {
    id: 'y7-int-mul',
    title: 'Multiplying integers',
    ref: ref('1.06'),
    outcomes: OUTCOMES,
    summary: 'Multiply integers using the sign rules, including squares of negative numbers.',
    learn: {
      intro: '<p>Multiply the numbers as usual, then work out the sign. If both numbers have the <b>same</b> sign, the answer is positive. If they have <b>different</b> signs, the answer is negative.</p><p>(−6)<sup>2</sup> means (−6) × (−6) = 36.</p>',
      keyPoints: ['positive × positive = positive', 'negative × negative = positive', 'positive × negative = negative, and negative × positive = negative', 'With three or more numbers, count the negatives: an even number of them gives a positive answer.'],
      vocab: [['product', 'the answer to a multiplication']],
    },
    gen: ex106,
    levels: { 1: 'Multiplying two integers', 2: 'Multiplication grids; squares; does order matter; sign of a product', 3: 'Missing numbers; three integers; finding your own numbers' },
  },
  {
    id: 'y7-int-div',
    title: 'Dividing integers',
    ref: ref('1.07'),
    outcomes: OUTCOMES,
    summary: 'Divide integers using the same sign rules as multiplying.',
    learn: {
      intro: '<p>Division undoes multiplication, so the sign rules are the same: <b>same</b> signs give a positive answer and <b>different</b> signs give a negative answer.</p><p>A fraction bar also means divide: 14 over −7 is 14 ÷ (−7) = −2.</p>',
      keyPoints: ['positive ÷ positive = positive; negative ÷ negative = positive', 'positive ÷ negative = negative; negative ÷ positive = negative', 'A number divided by its opposite is −1.'],
      vocab: [['quotient', 'the answer to a division']],
    },
    gen: ex107,
    levels: { 1: 'Dividing two integers', 2: 'Divisions written as fractions; division grids; sign of a quotient', 3: 'Missing numbers; finding your own numbers' },
  },
  {
    id: 'y7-int-orderops',
    title: 'Order of operations',
    ref: ref('1.08'),
    outcomes: OUTCOMES,
    summary: 'Evaluate expressions with integers by following the order of operations.',
    learn: {
      intro: '<p>When a calculation has more than one operation, everyone follows the same order so that everyone gets the same answer.</p>',
      keyPoints: [
        '1. Work out anything inside grouping symbols (brackets), and the top and bottom of a fraction, first.',
        '2. Then multiply and divide, from left to right.',
        '3. Then add and subtract, from left to right.',
        'Write a negative number in brackets when it follows an operation sign: 8 + (−7) × 4.',
      ],
      vocab: [['order of operations', 'the agreed order for working out a calculation'], ['grouping symbols', 'brackets ( ) and [ ], and the fraction bar']],
    },
    gen: ex108,
    levels: { 1: 'Two operations, left to right', 2: 'Brackets and fraction bars; marking someone else’s working', 3: 'Missing numbers; placing brackets; making a target with given numbers' },
  },
  {
    id: 'y7-int-calc',
    title: 'Integers and the calculator',
    ref: ref('1.09'),
    outcomes: OUTCOMES,
    summary: 'Use a calculator’s sign-change key for negative numbers, and know when it isn’t needed.',
    learn: {
      intro: '<p>Most calculators have a <b>sign-change key</b>, (−) or +/−, for typing a negative number. It is different from the subtract key. To type −3, press (−) then 3.</p><p>Be careful with squares: (−5)<sup>2</sup> = 25, but −5<sup>2</sup> = −25, because only the 5 is squared and then the answer is made negative.</p>',
      keyPoints: ['Type the brackets that are written in the question.', 'Estimate first, so you notice if the calculator answer is wrong.', 'The on-screen calculator here has a (−) key and an x² key for these questions.'],
    },
    gen: ex109,
    levels: { 1: 'Working without a calculator first', 2: '(−5)² compared with −5²; calculator expressions', 3: 'Missing numbers and making a target, with a calculator' },
  },
  {
    id: 'y7-int-problems',
    title: 'Integer problems',
    ref: ref('1.10'),
    outcomes: OUTCOMES,
    summary: 'Write number sentences with integers to solve problems about temperature, height, money and distance.',
    learn: {
      intro: '<p>For a worded problem, decide what is positive and what is negative, write a number sentence, then calculate.</p><p>For example, if the temperature on Mars is about −63°C and on Jupiter about −150°C, the difference is −63 − (−150) = −63 + 150 = 87°C.</p>',
      keyPoints: ['Choose a direction to be positive (up, east, money in) and the opposite to be negative.', 'Write the number sentence before you calculate.', 'Check your answer makes sense in the story.'],
    },
    gen: ex110,
    levels: { 1: 'Temperature changes, walking east and west, heights and depths', 2: 'Profit and loss graphs; walking north and south; overdrawn accounts; choosing the right expression', 3: 'Longer problems: scores, volcanoes, diving speed, bank statements, savings' },
  },
  {
    id: 'y7-int-powerplus',
    title: 'Power plus: integer challenges',
    ref: 'NCM 7 Power plus',
    tag: 'extension',
    outcomes: OUTCOMES,
    summary: 'Harder questions: powers of −1, squares and cubes, averages, and sums and products.',
    learn: {
      intro: '<p>These questions stretch what you know about integers. Try small numbers, look for patterns and check your answers.</p>',
      keyPoints: ['(−1) to an even power is 1; to an odd power it is −1.', 'Both 4 and −4 square to 16, but no integer squares to a negative number.', 'To find two numbers from their sum and product, list the factor pairs of the product.'],
    },
    gen: exPowerPlus,
    levels: { 1: 'Powers of −1', 2: 'Squares, cubes and averages', 3: 'Sum and product puzzles; is the rule always true?' },
  },
]
