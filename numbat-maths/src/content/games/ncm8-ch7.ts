// Class games for New Century Maths 8 (3rd edition, Cengage) Chapter 7, Investigating data: one set of quick
// questions for each exercise, 7.01 to 7.12.
//
// Mean, mode, median, range, dot plots, stem-and-leaf plots and comparing data revise Year 7 (NCM 7 Chapter 10), so
// those sets reuse its kinds (checked by that chapter's checks, see reuse.ts). New kinds: sector graphs,
// pictograms, line graphs, types of data, census and sample, frequency tables, frequency histograms, choosing a graph
// and the shape of a distribution (tests/game-checks/ncm8-ch7.ts).
//
// Syllabus: NSW Mathematics K–10 (2022), Stage 4: Data classification and visualisation MA4-DAT-C-01 (7.01–7.03,
// 7.09, 7.10) and Data analysis MA4-DAT-C-02 (7.04–7.08, 7.11, 7.12; census and sample are in MA4-DAT-C-02).
//
// Audit against the textbook, exercise by exercise (Nov 2026): added uniform, unimodal, bimodal and multimodal data
// (7.11) and choosing the best measure of centre (7.12).
import type { GameChapter, GameQuestion, GameSet } from '@/lib/game/types'
import { freqHist } from '@/lib/maths/diagrams9'
import { lineGraph } from '@/lib/maths/diagrams5'
import { freqTable, sectorGraph } from '@/lib/maths/diagrams13'
import { D2, DIVIDE, chance, gq, int, mk, num, pick, sample, shuffle } from './helpers'
import { NCM7_CH10 } from './ncm7-ch10'
import { reuse } from './reuse'

const DAT1 = 'MA4-DAT-C-01'
const DAT2 = 'MA4-DAT-C-02'
const b = (s: string) => `<b>${s}</b>`
const sum = (xs: number[]) => xs.reduce((t, x) => t + x, 0)
/** up to three different wrong whole numbers, likely first, then near neighbours */
function wrongNums(right: number, likely: number[]): string[] {
  const out: number[] = []
  for (const x of [...likely, right + 1, right - 1, right + 2, right * 2]) {
    if (x >= 0 && x !== right && Number.isFinite(x) && !out.includes(x)) out.push(x)
    if (out.length === 3) break
  }
  return out.map((x) => num(x))
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
const R7 = (ex: string, t: string, as?: string) => reuse(NCM7_CH10, ex, t, as)

// ================================================================== 7.01 Column, sector and divided bar graphs

const TOPICS: { what: string; who: string; cats: string[] }[] = [
  { what: 'how students travel to school', who: 'students', cats: ['Walk', 'Bus', 'Car', 'Bike', 'Train'] },
  { what: 'the favourite sport of a group of people', who: 'people', cats: ['Soccer', 'Netball', 'Tennis', 'Swimming', 'Cricket'] },
  { what: 'the pets owned by families in a street', who: 'families', cats: ['Dog', 'Cat', 'Fish', 'Bird', 'Rabbit'] },
  { what: 'the favourite fruit of a class', who: 'students', cats: ['Apple', 'Banana', 'Mango', 'Grapes', 'Orange'] },
]

/** angles that are multiples of `step` and add to 360, all different */
function angles(k: number, step: number): number[] {
  for (;;) {
    const parts = Array.from({ length: k }, () => int(1, 6))
    const total = sum(parts)
    if (total * step !== 360) continue
    if (new Set(parts).size !== k) continue
    return parts.map((p) => p * step)
  }
}

function m701sector(): GameQuestion {
  const topic = pick(TOPICS)
  const asPct = chance()
  const step = asPct ? 36 : 30
  const k = asPct ? int(3, 4) : 4
  const degs = angles(k, step)
  const cats = sample(topic.cats, k)
  const i = int(0, k - 1)
  const diagram = sectorGraph(cats.map((c, j) => ({ label: c, deg: degs[j] })))
  if (asPct) {
    const p = (degs[i] / 360) * 100
    return gq({
      t: 'sector',
      prompt: `This sector graph shows ${topic.what}. What percentage chose ${b(cats[i])}?`,
      diagram,
      correct: `${num(p)}%`,
      // the angle itself, angle ÷ 180, a neighbouring sector
      wrong: [degs[i], (degs[i] / 180) * 100, ...degs.filter((_, j) => j !== i).map((d) => (d / 360) * 100), 100 - p, p + 10, p - 5].filter((x, j, a) => x !== p && x > 0 && x <= 100 && a.indexOf(x) === j).map((x) => `${num(Math.round(x * 10) / 10)}%`),
      why: `${degs[i]}° out of 360°: ${degs[i]} ${DIVIDE} 360 = ${num(degs[i] / 360)} = ${num(p)}%.`,
      meta: {},
    })
  }
  const N = 12 * pick([2, 3, 5, 10, 20])
  const count = (N * degs[i]) / 360
  return gq({
    t: 'sector',
    prompt: `This sector graph shows ${topic.what}: ${b(num(N))} ${topic.who} in all. How many chose ${b(cats[i])}?`,
    diagram,
    correct: num(count),
    // the angle, the angle as a percentage of N, another sector
    wrong: wrongNums(count, [degs[i], ...degs.filter((_, j) => j !== i).map((d) => (N * d) / 360), Math.round((N * degs[i]) / 100)]),
    why: `${degs[i]}° is ${degs[i]}/360 of the circle: ${degs[i]}/360 × ${num(N)} = ${num(count)}.`,
    meta: {},
  })
}

const SET_701 = set('7.01', 'Column, sector and divided bar graphs', 'Read column graphs and sector graphs (a sector is its angle out of 360° of the total).', [DAT1], [
  R7('10.01', 'read'),
  R7('10.01', 'most'),
  R7('10.01', 'more'),
  mk('sector', m701sector, 2),
])

// ================================================================== 7.02 Line graphs and pictograms

function m702picto(): GameQuestion {
  const per = pick([2, 4, 10, 20])
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  const counts = days.map(() => per * int(1, 6) + (chance(0.4) ? per / 2 : 0))
  if (new Set(counts).size < 4) return m702picto()
  const item = pick(['cupcakes', 'pies', 'coffees', 'tickets'])
  const diagram = D2.pictureGraph(days.map((d, j) => ({ label: d, count: counts[j] })), per, item)
  const i = int(0, 4)
  if (chance()) {
    const symbols = Math.ceil(counts[i] / per)
    return gq({
      t: 'picto',
      prompt: `This pictogram shows the ${item} sold each day. How many ${item} were sold on ${b(days[i])}?`,
      diagram,
      correct: num(counts[i]),
      // the number of symbols, a half symbol counted as whole, another day
      wrong: wrongNums(counts[i], [symbols, symbols * per, counts[i] + per, counts[(i + 1) % 5]]),
      why: `Each whole symbol is ${per} and a half symbol is ${per / 2}: ${days[i]} shows ${num(counts[i])} ${item}.`,
      meta: {},
    })
  }
  const j = (i + int(1, 4)) % 5
  const [hi, lo] = counts[i] >= counts[j] ? [i, j] : [j, i]
  const diff = counts[hi] - counts[lo]
  if (diff === 0) return m702picto()
  return gq({
    t: 'picto',
    prompt: `This pictogram shows the ${item} sold each day. How many more were sold on ${b(days[hi])} than on ${b(days[lo])}?`,
    diagram,
    correct: num(diff),
    // the difference in symbols, the total, one day's count
    wrong: wrongNums(diff, [diff / per, counts[hi] + counts[lo], counts[hi], diff + per]),
    why: `${days[hi]}: ${num(counts[hi])}, ${days[lo]}: ${num(counts[lo])}. ${num(counts[hi])} − ${num(counts[lo])} = ${num(diff)}.`,
    meta: {},
  })
}

function m702line(): GameQuestion {
  // a seedling's height each week: always growing, by different amounts
  const h: number[] = [int(1, 3)]
  for (let w = 1; w <= 6; w++) h.push(h[w - 1] + int(1, 4))
  const ymax = Math.ceil((h[6] + 1) / 5) * 5
  const diagram = lineGraph({ xmax: 6, xstep: 1, xlabel: 'Week', ymax, ystep: 5, ylabel: 'Height (cm)', minor: 5, series: [{ pts: h.map((y, x) => [x, y]) }], marks: h.map((y, x) => [x, y]) })
  const gains = h.slice(1).map((y, w) => y - h[w])
  const best = Math.max(...gains)
  if (chance() || gains.filter((g) => g === best).length > 1) {
    const w = int(1, 6)
    return gq({
      t: 'line',
      prompt: `This line graph shows the height of a seedling. How tall was it in ${b(`week ${w}`)}?`,
      diagram,
      correct: `${h[w]} cm`,
      // the next or previous week, the growth that week
      wrong: [h[w + 1] ?? h[w] + 2, h[w - 1], h[w] - h[w - 1], h[w] + 1, h[w] + 2, h[w] + 3].filter((x, k, a) => x !== h[w] && x > 0 && a.indexOf(x) === k).map((x) => `${x} cm`),
      why: `Go up from week ${w} to the line, then across: ${h[w]} cm.`,
      meta: {},
    })
  }
  const w = gains.indexOf(best) + 1
  return gq({
    t: 'line',
    prompt: 'This line graph shows the height of a seedling. During which week did it grow the most?',
    diagram,
    correct: `week ${w}`,
    inOrder: weekOptions(w),
    why: `The steepest part of the line is from week ${w - 1} to week ${w}: it grew ${best} cm.`,
    meta: {},
  })
}
/** four weeks in order, the right one included at a varying place */
function weekOptions(w: number): string[] {
  const start = Math.max(1, Math.min(3, w - int(0, 3)))
  return [start, start + 1, start + 2, start + 3].map((x) => `week ${x}`)
}

const SET_702 = set('7.02', 'Line graphs and pictograms', 'Read pictograms using the key, and read values and changes from line graphs.', [DAT1], [mk('picto', m702picto), mk('line', m702line)])

// ================================================================== 7.03 Types of data

const TYPES = ['categorical nominal', 'categorical ordinal', 'numerical discrete', 'numerical continuous']
const VARIABLES: [string, number][] = [
  ['favourite colour', 0],
  ['country of birth', 0],
  ['type of pet', 0],
  ['eye colour', 0],
  ['way of travelling to school', 0],
  ['T-shirt size (S, M, L, XL)', 1],
  ['grade on a report (A to E)', 1],
  ['rating of a meal (poor, fair, good)', 1],
  ['place in a race (1st, 2nd, 3rd …)', 1],
  ['number of brothers and sisters', 2],
  ['number of goals scored in a game', 2],
  ['number of pets in a home', 2],
  ['number of text messages sent in a day', 2],
  ['height of a student', 3],
  ['mass of a newborn baby', 3],
  ['time taken to run 100 m', 3],
  ['temperature at midday', 3],
  ['length of a fish', 3],
]

function m703type(): GameQuestion {
  const [v, k] = pick(VARIABLES)
  return gq({
    t: 'type',
    prompt: `What type of data is the ${b(v)}?`,
    correct: TYPES[k],
    inOrder: TYPES,
    why: [
      'It is a category with no natural order: categorical nominal.',
      'It is a category with a natural order: categorical ordinal.',
      'It is a number found by counting: numerical discrete.',
      'It is a number found by measuring: numerical continuous.',
    ][k],
    meta: {},
  })
}

function m703which(): GameQuestion {
  const k = int(0, 3)
  const right = pick(VARIABLES.filter(([, t]) => t === k))[0]
  const others = shuffle(VARIABLES.filter(([, t]) => t !== k)).map(([v]) => v)
  // one of each other type where possible
  const wrong = [0, 1, 2, 3].filter((t) => t !== k).map((t) => pick(VARIABLES.filter(([, x]) => x === t))[0])
  return gq({
    t: 'which',
    prompt: `Which of these is ${b(TYPES[k].split(' ')[1])} ${TYPES[k].split(' ')[0]} data?`,
    correct: right,
    wrong: [...wrong, ...others],
    why: `The ${right} is ${TYPES[k]} data.`,
    meta: {},
  })
}

const SET_703 = set('7.03', 'Types of data', 'Classify data as categorical (nominal or ordinal) or numerical (discrete or continuous).', [DAT1], [mk('type', m703type), mk('which', m703which)])

// ================================================================== 7.04 Census vs sample

/** a population of n, and ways of surveying it: the first asks everyone (a census), the others ask some (samples) */
const CENSUS: ((n: number, k: number) => [string, string, string[]])[] = [
  (n, k) => [`A class of ${n} students wants to know how they get to school.`, `ask all ${n} students`, [`ask ${k} students chosen at random`, 'ask the first 5 students to arrive', `ask ${k} students from another class`]],
  (n, k) => [`A netball club of ${n * 2} players is choosing a new uniform colour.`, `ask all ${n * 2} players`, [`ask the ${k} players in one team`, `ask ${k} players chosen at random`, 'ask the coaches only']],
  (n, k) => [`A school of ${n * 30} students wants to know how long they spend on homework.`, `ask all ${n * 30} students`, [`ask ${k * 10} students chosen at random`, 'ask one class from each year', 'ask the students in the library']],
  (n, k) => [`A street has ${n} houses. The council wants to know how many people live in each.`, `ask all ${n} households`, [`ask ${k} households chosen at random`, 'ask the houses at one end', `ask ${k} households in the next street`]],
]

function m704census(): GameQuestion {
  const n = int(20, 32)
  const k = int(5, 12)
  const [situation, c, s] = pick(CENSUS)(n, k)
  return gq({
    t: 'census',
    prompt: `${situation} Which survey is a census?`,
    correct: c,
    wrong: s,
    why: `A census collects data from every member of the population: ${c}. The others are samples.`,
    meta: {},
  })
}

const BIAS: ((k: number) => [string, string, string[]])[] = [
  (k) => ['how many hours a week Year 8 students in a school play sport', `${k} students chosen at random from the roll`, [`${k} students at netball training`, `the first ${k} students to arrive`, `${k} students who answer an online form`]],
  (k) => ['what people in a town think of a new skate park', `${k * 2} households chosen at random`, [`${k * 2} people at the skate park`, `${k * 2} people in a retirement village`, `the ${k * 2} people who wrote to council`]],
  (k) => ['the average height of students in a school', `${Math.round(k / 4)} random students from each year`, ['the school basketball team', 'the students in one Year 7 class', `the first ${k} students in the canteen`]],
  (k) => ['how often people in a suburb use public transport', `${k * 2} residents chosen at random`, [`${k * 2} people waiting at a bus stop`, `${k * 2} people in a car park`, `${k * 2} people at a train station`]],
]

function m704bias(): GameQuestion {
  const k = 4 * int(5, 15)
  const [goal, good, bad] = pick(BIAS)(k)
  return gq({
    t: 'bias',
    prompt: `A survey wants to find ${goal}. Which sample is the least biased?`,
    correct: good,
    wrong: bad,
    why: 'A random sample gives everyone the same chance of being chosen; the others favour one kind of person.',
    meta: {},
  })
}

const SET_704 = set('7.04', 'Census vs sample', 'Tell a census from a sample, and choose a fair, random sample.', [DAT2], [mk('census', m704census), mk('bias', m704bias)])

// ================================================================== 7.05, 7.06 revision: measures of centre and spread

const SET_705 = set('7.05', 'The mean and mode', 'Find the mean and mode, and a missing value from the mean.', [DAT2], [R7('10.05', 'mean'), R7('10.05', 'mode'), R7('10.05', 'missing')])
const SET_706 = set('7.06', 'The median and range', 'Find the median (middle value) and range (highest − lowest).', [DAT2], [R7('10.06', 'median'), R7('10.06', 'range')])

// ================================================================== 7.07 Analysing frequency tables

/** scores 1–6 with frequencies; the mode is unique and the mean a whole number */
function freqData(): { xs: number[]; fs: number[] } {
  for (;;) {
    const lo = int(0, 3)
    const xs = [0, 1, 2, 3, 4, 5].map((k) => lo + k)
    const fs = xs.map(() => int(1, 8))
    const top = Math.max(...fs)
    if (fs.filter((f) => f === top).length !== 1) continue
    if (sum(xs.map((x, i) => x * fs[i])) % sum(fs) !== 0) continue
    return { xs, fs }
  }
}

function m707total(): GameQuestion {
  const { xs, fs } = freqData()
  const n = sum(fs)
  return gq({
    t: 'total',
    prompt: 'This frequency table shows the goals scored by a team in each game. How many games were played?',
    diagram: freqTable(xs, fs, ['Goals', 'Frequency']),
    correct: num(n),
    // the number of rows, the total of the scores, the total goals
    wrong: wrongNums(n, [xs.length, sum(xs), sum(xs.map((x, i) => x * fs[i]))]),
    why: `Add the frequencies: ${fs.join(' + ')} = ${n} games.`,
    meta: {},
  })
}

function m707mode(): GameQuestion {
  const { xs, fs } = freqData()
  const top = Math.max(...fs)
  const m = xs[fs.indexOf(top)]
  return gq({
    t: 'mode',
    prompt: 'This frequency table shows the goals scored by a team in each game. What is the mode?',
    diagram: freqTable(xs, fs, ['Goals', 'Frequency']),
    correct: num(m),
    // the highest frequency, the largest score, the middle score
    wrong: wrongNums(m, [top, xs[5], xs[fs.indexOf(Math.min(...fs))]]),
    why: `The mode is the score with the highest frequency: ${m} goals happened ${top} times.`,
    meta: {},
  })
}

function m707mean(): GameQuestion {
  const { xs, fs } = freqData()
  const n = sum(fs)
  const fx = sum(xs.map((x, i) => x * fs[i]))
  const mean = fx / n
  return gq({
    t: 'mean',
    prompt: 'This frequency table shows the goals scored by a team in each game. What is the mean number of goals?',
    diagram: freqTable(xs, fs, ['Goals', 'Frequency']),
    correct: num(mean),
    // the mean of the scores column, total ÷ rows, the mode
    wrong: wrongNums(mean, [sum(xs) / 6, Math.round(fx / 6), xs[fs.indexOf(Math.max(...fs))], Math.round((n / 6) * 10) / 10]),
    why: `Total goals = ${xs.map((x, i) => `${x} × ${fs[i]}`).join(' + ')} = ${fx}. Mean = ${fx} ${DIVIDE} ${n} = ${num(mean)}.`,
    meta: {},
  })
}

const SET_707 = set('7.07', 'Analysing frequency tables', 'Find the number of scores, the mode and the mean from a frequency table.', [DAT2], [mk('total', m707total), mk('mode', m707mode), mk('mean', m707mean, 2)])

// ================================================================== 7.08 revision: dot plots and stem-and-leaf plots

const SET_708 = set('7.08', 'Dot plots and stem-and-leaf plots', 'Read dot plots and stem-and-leaf plots, and find the median, range and outliers.', [DAT1, DAT2], [
  R7('10.03', 'count', 'dotCount'),
  R7('10.04', 'extreme'),
  R7('10.07', 'median'),
  R7('10.07', 'range'),
  R7('10.07', 'outlier'),
])

// ================================================================== 7.09 Frequency histograms and polygons

function histData(): { xs: number[]; fs: number[] } {
  for (;;) {
    const xs = [1, 2, 3, 4, 5, 6]
    const fs = xs.map(() => int(1, 9))
    const top = Math.max(...fs)
    if (fs.filter((f) => f === top).length === 1 && new Set(fs).size >= 4) return { xs, fs }
  }
}

function m709read(): GameQuestion {
  const { xs, fs } = histData()
  const polygon = chance()
  const i = int(0, 5)
  return gq({
    t: 'read',
    prompt: `This ${polygon ? 'frequency polygon' : 'histogram'} shows how many pets the students in a class have. How many students have ${b(`${xs[i]} pet${xs[i] === 1 ? '' : 's'}`)}?`,
    diagram: freqHist(xs, fs, { hist: !polygon, polygon, xLabel: 'Number of pets' }),
    correct: num(fs[i]),
    // a neighbouring column, the score itself, the total
    wrong: wrongNums(fs[i], [fs[i + 1] ?? fs[i - 1], xs[i], fs[i - 1] ?? fs[i + 1], sum(fs)]),
    why: `The ${polygon ? 'point' : 'column'} above ${xs[i]} reaches ${fs[i]} on the frequency scale.`,
    meta: {},
  })
}

function m709total(): GameQuestion {
  const { xs, fs } = histData()
  const n = sum(fs)
  return gq({
    t: 'total',
    prompt: 'This histogram shows how many pets the students in a class have. How many students are in the class?',
    diagram: freqHist(xs, fs, { xLabel: 'Number of pets' }),
    correct: num(n),
    // the number of columns, the tallest column, the total number of pets
    wrong: wrongNums(n, [xs.length, Math.max(...fs), sum(xs.map((x, i) => x * fs[i]))]),
    why: `Add the column heights: ${fs.join(' + ')} = ${n} students.`,
    meta: {},
  })
}

function m709mode(): GameQuestion {
  const { xs, fs } = histData()
  const top = Math.max(...fs)
  const m = xs[fs.indexOf(top)]
  return gq({
    t: 'mode',
    prompt: 'This histogram shows how many pets the students in a class have. What is the mode?',
    diagram: freqHist(xs, fs, { xLabel: 'Number of pets' }),
    correct: num(m),
    // the height of the tallest column, the largest score, the middle score
    wrong: wrongNums(m, [top, 6, 3, 4]),
    why: `The tallest column is above ${m}, so the mode is ${m} pets.`,
    meta: {},
  })
}

const SET_709 = set('7.09', 'Frequency histograms and polygons', 'Read frequencies, totals and the mode from histograms and frequency polygons.', [DAT1], [mk('read', m709read), mk('total', m709total), mk('mode', m709mode)])

// ================================================================== 7.10 Choosing the best graph

const GRAPHS: [string, string, string[]][] = [
  ['the temperature at noon each day for two weeks', 'line graph', ['sector graph', 'dot plot', 'stem-and-leaf plot']],
  ['the share of a family budget spent on rent, food, transport and savings', 'sector graph', ['line graph', 'histogram', 'dot plot']],
  ['the test marks of 120 students, grouped as 0–9, 10–19, 20–29 and so on', 'histogram', ['sector graph', 'line graph', 'pictogram']],
  ['the number of goals scored in each of 15 netball games (from 0 to 6)', 'dot plot', ['line graph', 'sector graph', 'divided bar graph']],
  ['the favourite fruit of each student in a class', 'column graph', ['line graph', 'histogram', 'stem-and-leaf plot']],
  ['the ages of 25 people at a party (from 12 to 47)', 'stem-and-leaf plot', ['line graph', 'sector graph', 'divided bar graph']],
  ["a baby's mass at the end of each month for a year", 'line graph', ['sector graph', 'divided bar graph', 'pictogram']],
  ['the number of cars sold each year from 2015 to 2024', 'line graph', ['sector graph', 'stem-and-leaf plot', 'dot plot']],
  ['the percentage of students in each house of a school', 'sector graph', ['line graph', 'dot plot', 'histogram']],
  ['the heights of 200 Year 8 students, grouped in 5 cm classes', 'histogram', ['sector graph', 'line graph', 'divided bar graph']],
  ['the number of pets owned by each of 20 students (0 to 4)', 'dot plot', ['line graph', 'sector graph', 'histogram']],
  ['the most popular streaming service in a class', 'column graph', ['line graph', 'histogram', 'dot plot']],
  ['the masses of 30 dogs, from 8 kg to 41 kg', 'stem-and-leaf plot', ['line graph', 'sector graph', 'pictogram']],
]

function m710best(): GameQuestion {
  const [what, best, others] = pick(GRAPHS)
  const why: Record<string, string> = {
    'line graph': 'A line graph shows how something changes over time.',
    'sector graph': 'A sector graph shows how a whole is split into parts.',
    histogram: 'A histogram shows numerical data grouped into classes.',
    'dot plot': 'A dot plot suits a small set of numerical data with few different values.',
    'column graph': 'A column graph compares the counts of categories.',
    'stem-and-leaf plot': 'A stem-and-leaf plot suits numerical data spread over tens, and keeps every value.',
  }
  return gq({
    t: 'best',
    prompt: `Which graph is best for showing ${b(what)}?`,
    correct: best,
    wrong: others,
    why: why[best],
    meta: {},
  })
}

const PURPOSE: [string, string][] = [
  ['line graph', 'how something changes over time'],
  ['sector graph', 'how a whole is split into parts'],
  ['histogram', 'numerical data grouped into classes'],
  ['column graph', 'counts of categories side by side'],
  ['stem-and-leaf plot', 'every value of data spread over tens'],
  ['dot plot', 'a small set of scores, one dot each'],
]

function m710purpose(): GameQuestion {
  const k = int(0, PURPOSE.length - 1)
  return gq({
    t: 'purpose',
    prompt: `A ${b(PURPOSE[k][0])} is best for showing…`,
    correct: PURPOSE[k][1],
    wrong: PURPOSE.filter((_, i) => i !== k).map(([, p]) => p),
    why: `A ${PURPOSE[k][0]} shows ${PURPOSE[k][1]}.`,
    meta: {},
  })
}

const SET_710 = set('7.10', 'Choosing the best graph', 'Choose the graph that suits the data and the purpose.', [DAT1], [mk('best', m710best), mk('purpose', m710purpose)])

// ================================================================== 7.11 The shape of data

const SHAPES = ['symmetrical', 'positively skewed', 'negatively skewed', 'uniform']
function shapeData(k: number): number[] {
  if (k === 0) {
    const a = int(1, 2)
    const bb = a + int(1, 3)
    const c = bb + int(2, 3)
    return chance() ? [a, bb, c, bb, a] : [a, bb, c, c, bb, a]
  }
  if (k === 3) {
    const v = int(3, 7)
    return [v, v, v, v, v]
  }
  // a peak at one end and a tail trailing off to the other
  const peak = int(7, 9)
  const right = [int(2, 4), peak, peak - int(2, 3), int(2, 3), 1, 1]
  return k === 1 ? right : right.slice().reverse()
}

function m711shape(): GameQuestion {
  const k = int(0, 3)
  const fs = shapeData(k)
  const xs = fs.map((_, i) => i + 1)
  return gq({
    t: 'shape',
    prompt: 'Which word best describes the shape of the data in this histogram?',
    diagram: freqHist(xs, fs, { xLabel: 'Score' }),
    correct: SHAPES[k],
    inOrder: SHAPES,
    why: [
      'The two halves are mirror images: symmetrical.',
      'Most scores are low, with a tail trailing off to the right (the high end): positively skewed.',
      'Most scores are high, with a tail trailing off to the left (the low end): negatively skewed.',
      'Every column is the same height: uniform.',
    ][k],
    meta: {},
  })
}

const MODES = ['no mode (uniform)', 'unimodal', 'bimodal', 'multimodal']

function m711modes(): GameQuestion {
  const k = int(0, 3)
  const vals = sample([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], k === 0 ? int(4, 6) : int(5, 6))
  let data: number[]
  if (k === 0) {
    const c = pick([1, 2])
    data = vals.flatMap((x) => Array(c).fill(x))
  } else {
    // the modes appear 3 times, every other score once or twice
    data = vals.flatMap((x, i) => Array(i < k ? 3 : int(1, 2)).fill(x))
  }
  const modes = k === 0 ? [] : vals.slice(0, k).sort((a, b) => a - b)
  return gq({
    t: 'modes',
    prompt: `Which word describes these scores? ${shuffle(data).join(', ')}`,
    correct: MODES[k],
    inOrder: MODES,
    why:
      k === 0
        ? 'Every score appears the same number of times, so there is no mode: no mode (uniform).'
        : `${modes.join(' and ').replace(/ and (?=.* and )/g, ', ')} ${k === 1 ? 'appears' : 'appear'} most often (3 times): ${['', 'one mode, so unimodal', 'two modes, so bimodal', 'three modes, so multimodal'][k]}.`,
    meta: { k },
  })
}

const SET_711 = set('7.11', 'The shape of data', 'Describe a distribution as symmetrical, skewed or uniform, and by its number of modes.', [DAT2], [mk('shape', m711shape), mk('modes', m711modes)])

const CENTRE = ['the mean', 'the median', 'the mode', 'the range']
const CATEGORIES = ['favourite fruit of each student in a class', 'colour of each car in a car park', 'type of pet each student owns', 'sport each student plays']

function m712centre(): GameQuestion {
  const cat = chance()
  if (cat)
    return gq({
      t: 'centre',
      prompt: `A survey records the ${pick(CATEGORIES)}. Which measure of centre can be used for this data?`,
      correct: 'the mode',
      inOrder: CENTRE,
      why: 'The data are categories, not numbers, so there is no mean or median: use the mode (the most common category).',
      meta: { cat },
    })
  const wages = Array.from({ length: 5 }, () => int(60, 90) * 10)
  const top = int(30, 50) * 100
  const all = shuffle([...wages, top])
  const sorted = [...all].sort((a, b) => a - b)
  const median = (sorted[2] + sorted[3]) / 2
  const mean = all.reduce((a, b) => a + b) / 6
  const dollars = (x: number) => '$' + num(x)
  return gq({
    t: 'centre',
    prompt: `The weekly wages of 6 workers are ${all.slice(0, 5).map(dollars).join(', ')} and ${dollars(all[5])}. Which measure of centre best describes a typical wage?`,
    correct: 'the median',
    inOrder: CENTRE,
    why: `The outlier ${dollars(top)} pulls the mean up to about ${dollars(Math.round(mean))}, more than 5 of the 6 wages. The median (${dollars(median)}) is not affected by it: use the median.`,
    meta: { cat },
  })
}

// ================================================================== 7.12 revision: comparing data

const SET_712 = set('7.12', 'Comparing data', 'Compare data sets using the mean, median, mode and range, and see the effect of an outlier.', [DAT2], [
  R7('10.08', 'compare'),
  R7('10.08', 'effect'),
  R7('10.07', 'outlier'),
  mk('centre', m712centre, 2),
])

export const NCM8_CH7: GameChapter = {
  id: 'ncm8-ch7',
  number: 7,
  title: 'Investigating data',
  ref: 'NCM 8 Chapter 7',
  strand: 'Statistics and probability',
  outcomes: [DAT1, DAT2],
  sets: [SET_701, SET_702, SET_703, SET_704, SET_705, SET_706, SET_707, SET_708, SET_709, SET_710, SET_711, SET_712],
  colour: 145,
  topics: [],
}
