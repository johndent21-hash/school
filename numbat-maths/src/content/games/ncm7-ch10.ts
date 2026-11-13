// Class games for New Century Maths 7 (3rd edition, Cengage) Chapter 10, Analysing data: one set of quick questions
// for each exercise, 10.01 to 10.08.
//
// The questions are the site's own. Every question is ONE step with four choices; the wrong choices are the usual
// slips: the middle of the unsorted list taken as the median, the most common frequency given as the mode, the
// highest value given as the range, a column read against the wrong gridline. Graphs and plots are drawn from the
// data and read back by the test (tests/game-checks/ncm7-ch10.ts).
//
// Syllabus: NSW Mathematics K–10 (2022), Stage 4, Data classification and visualisation MA4-DAT-C-01 (10.01–10.04)
// and Data analysis MA4-DAT-C-02 (10.05–10.08).
import type { GameChapter, GameQuestion, GameSet } from '@/lib/game/types'
import { D, chance, gq, int, mk, num, pick, sample, shuffle } from './helpers'

const DAT1 = 'MA4-DAT-C-01'
const DAT2 = 'MA4-DAT-C-02'
const list = (xs: number[]) => xs.map((x) => num(x)).join(', ')
const sum = (xs: number[]) => xs.reduce((t, x) => t + x, 0)
const sorted = (xs: number[]) => xs.slice().sort((a, b) => a - b)
const median = (xs: number[]) => {
  const s = sorted(xs)
  const n = s.length
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2
}
/** three different wrong numbers, likely first; none equal to the answer */
function numWrong(right: number, likely: number[]): string[] {
  const out: number[] = []
  for (const x of [...likely, right + 1, right - 1, right + 2, right * 2]) {
    if (x !== right && x >= 0 && !out.includes(x)) out.push(x)
    if (out.length === 3) break
  }
  return out.map((x) => num(x))
}

// ================================================================== 10.01 Interpreting graphs

const SURVEYS: { title: string; cats: string[] }[] = [
  { title: 'Favourite sport', cats: ['Soccer', 'Netball', 'Cricket', 'Swim', 'AFL'] },
  { title: 'How we get to school', cats: ['Walk', 'Bus', 'Car', 'Bike', 'Train'] },
  { title: 'Favourite fruit', cats: ['Apple', 'Mango', 'Banana', 'Grapes', 'Kiwi'] },
  { title: 'Pets at home', cats: ['Dog', 'Cat', 'Fish', 'Bird', 'None'] },
]

function survey(): { title: string; cats: string[]; vals: number[]; step: number } {
  const s = pick(SURVEYS)
  const step = pick([1, 2])
  // whole numbers on the gridlines (step 1) or on and halfway between them (step 2), all different
  let vals: number[]
  do vals = s.cats.map(() => (step === 1 ? int(1, 10) : 2 * int(1, 8)))
  while (new Set(vals).size < vals.length)
  return { ...s, vals, step }
}

function m1001read(): GameQuestion {
  const g = survey()
  const k = int(0, g.cats.length - 1)
  return gq({
    t: 'read',
    prompt: `How many students chose ${g.cats[k]}?`,
    diagram: D.columnGraph(g.cats, g.vals, g.step, 'Students', g.title),
    correct: num(g.vals[k]),
    // read against the next gridline, or another column
    wrong: numWrong(g.vals[k], [g.vals[k] + g.step, g.vals[k] - g.step, ...g.vals.filter((_, i) => i !== k)]),
    why: `The ${g.cats[k]} column reaches ${g.vals[k]} on the vertical axis.`,
    meta: { cats: g.cats, vals: g.vals },
  })
}

function m1001most(): GameQuestion {
  const g = survey()
  const most = chance()
  const want = most ? Math.max(...g.vals) : Math.min(...g.vals)
  const k = g.vals.indexOf(want)
  return gq({
    t: 'most',
    prompt: `Which was the ${most ? 'most' : 'least'} popular choice?`,
    diagram: D.columnGraph(g.cats, g.vals, g.step, 'Students', g.title),
    correct: g.cats[k],
    wrong: shuffle(g.cats.filter((_, i) => i !== k)),
    why: `The ${most ? 'tallest' : 'shortest'} column is ${g.cats[k]} (${g.vals[k]} students).`,
    meta: { cats: g.cats, vals: g.vals, most },
  })
}

function m1001more(): GameQuestion {
  const g = survey()
  const [a, c] = sample([0, 1, 2, 3, 4], 2).sort((x, y) => g.vals[y] - g.vals[x])
  const diff = g.vals[a] - g.vals[c]
  return gq({
    t: 'more',
    prompt: `How many more students chose ${g.cats[a]} than ${g.cats[c]}?`,
    diagram: D.columnGraph(g.cats, g.vals, g.step, 'Students', g.title),
    correct: num(diff),
    // added instead, gave one of the values
    wrong: numWrong(diff, [g.vals[a] + g.vals[c], g.vals[a], g.vals[c], diff + g.step]),
    why: `${g.cats[a]}: ${g.vals[a]}, ${g.cats[c]}: ${g.vals[c]}. ${g.vals[a]} − ${g.vals[c]} = ${diff}.`,
    meta: { cats: g.cats, vals: g.vals },
  })
}

const SET_1001: GameSet = {
  id: 'ncm7-10.01',
  exercise: '10.01',
  ref: 'NCM 7 Ex 10.01',
  title: 'Interpreting graphs',
  lessons: ['y7-data-graphs'],
  focus: 'Read values from a column graph and compare categories.',
  outcomes: [DAT1],
  makers: [mk('read', m1001read), mk('most', m1001most), mk('more', m1001more, 2)],
}

// ================================================================== 10.02 Misleading graphs

const FLAWS = ['The vertical axis does not start at 0', 'The scale is not evenly spaced', 'The columns are different widths', 'The graph has no title']

/** a column graph with one deliberate flaw (0: axis starts above 0, 1: uneven scale, 2: uneven columns, 3: no title) */
function flawedGraph(flaw: number): string {
  const W = 340
  const H = 240
  const left = 48
  const bottom = H - 42
  const top = 34
  const cats = ['Mon', 'Tue', 'Wed', 'Thu']
  // tick values and where each one is drawn (as a share of the axis height)
  let ticks: number[]
  let pos: number[]
  if (flaw === 0) {
    const from = pick([40, 50, 60])
    ticks = [from, from + 5, from + 10, from + 15, from + 20]
    pos = [0, 0.25, 0.5, 0.75, 1]
  } else if (flaw === 1) {
    ticks = [0, 10, 20, 50, 100]
    pos = [0, 0.25, 0.5, 0.75, 1]
  } else {
    ticks = [0, 20, 40, 60, 80]
    pos = [0, 0.25, 0.5, 0.75, 1]
  }
  const vals = flaw === 0 ? cats.map(() => ticks[0] + int(2, 19)) : flaw === 1 ? [int(4, 9), int(12, 19), int(25, 45), int(60, 90)] : cats.map(() => 4 * int(3, 19))
  const yOf = (v: number) => {
    // position along the drawn (possibly uneven) scale
    for (let i = 1; i < ticks.length; i++)
      if (v <= ticks[i]) return bottom - (pos[i - 1] + ((v - ticks[i - 1]) / (ticks[i] - ticks[i - 1])) * (pos[i] - pos[i - 1])) * (bottom - top)
    return top
  }
  let body = ''
  ticks.forEach((t, i) => {
    const y = bottom - pos[i] * (bottom - top)
    body += `<line class="grid" x1="${left}" y1="${y}" x2="${W - 10}" y2="${y}"/>` + D.text([left - 6, y], num(t), 'dl tiny tick', 'end')
  })
  const slot = (W - left - 14) / cats.length
  const widths = flaw === 2 ? shuffle([0.3, 0.5, 0.7, 0.9]) : [0.6, 0.6, 0.6, 0.6]
  cats.forEach((c, i) => {
    const w = slot * widths[i]
    const x = left + i * slot + (slot - w) / 2
    body += `<rect class="bar" x="${x.toFixed(1)}" y="${yOf(vals[i]).toFixed(1)}" width="${w.toFixed(1)}" height="${(bottom - yOf(vals[i])).toFixed(1)}"/>`
    body += D.text([left + i * slot + slot / 2, bottom + 13], c, 'dl tiny')
  })
  body += `<line class="axis" x1="${left}" y1="${bottom}" x2="${W - 10}" y2="${bottom}"/><line class="axis" x1="${left}" y1="${bottom}" x2="${left}" y2="${top - 4}"/>`
  if (flaw !== 3) body += D.text([W / 2, 14], 'Ice creams sold', 'dl small gtitle')
  return D.svg(W, H, body, 'A column graph', 380)
}

function m1002flaw(): GameQuestion {
  const flaw = int(0, 3)
  return gq({
    t: 'flaw',
    prompt: 'What is wrong with this graph?',
    diagram: flawedGraph(flaw),
    correct: FLAWS[flaw],
    inOrder: FLAWS,
    why: [
      'Starting the axis above 0 makes small differences look big.',
      'Equal gaps stand for different amounts (10, then 30, then 50).',
      'Wider columns look bigger, whatever the amounts.',
      'Without a title, you cannot tell what the graph shows.',
    ][flaw],
    meta: { flaw },
  })
}

const SET_1002: GameSet = {
  id: 'ncm7-10.02',
  exercise: '10.02',
  ref: 'NCM 7 Ex 10.02',
  title: 'Misleading graphs',
  lessons: ['y7-data-graphs'],
  focus: 'Spot what makes a graph misleading: a broken axis, an uneven scale, uneven columns, a missing title.',
  outcomes: [DAT1],
  makers: [mk('flaw', m1002flaw)],
}

// ================================================================== 10.03 Dot plots

/** data for a dot plot: one clear mode */
function dotData(): { vals: number[]; lo: number; hi: number } {
  const lo = int(0, 5)
  const hi = lo + int(6, 8)
  for (;;) {
    const n = int(10, 16)
    const vals = Array.from({ length: n }, () => int(lo, hi))
    const counts = vals.reduce<Record<number, number>>((c, v) => ((c[v] = (c[v] ?? 0) + 1), c), {})
    const top = Math.max(...Object.values(counts))
    if (Object.values(counts).filter((c) => c === top).length === 1 && top <= 5) return { vals, lo, hi }
  }
}
const modeOf = (vals: number[]) => {
  const counts = vals.reduce<Record<number, number>>((c, v) => ((c[v] = (c[v] ?? 0) + 1), c), {})
  const top = Math.max(...Object.values(counts))
  return { mode: Number(Object.keys(counts).find((k) => counts[Number(k)] === top)), top }
}

function m1003mode(): GameQuestion {
  const { vals, lo, hi } = dotData()
  const { mode, top } = modeOf(vals)
  return gq({
    t: 'mode',
    prompt: 'What is the mode of these scores?',
    diagram: D.dotPlot(vals, lo, hi, 'Score'),
    correct: num(mode),
    // the number of dots in the tallest column, the median, the largest score
    wrong: numWrong(mode, [top, median(vals), Math.max(...vals), mode + 1]),
    why: `The tallest column of dots is above ${mode} (${top} dots), so the mode is ${mode}.`,
    meta: { vals },
  })
}

function m1003count(): GameQuestion {
  const { vals, lo, hi } = dotData()
  const cut = int(lo + 2, hi - 2)
  const above = chance()
  const n = vals.filter((v) => (above ? v > cut : v < cut)).length
  return gq({
    t: 'count',
    prompt: `How many scores are ${above ? 'greater' : 'less'} than ${cut}?`,
    diagram: D.dotPlot(vals, lo, hi, 'Score'),
    correct: num(n),
    // counted the scores equal to the cut too, counted the other side
    wrong: numWrong(n, [n + vals.filter((v) => v === cut).length, vals.length - n, n - 1]),
    why: `Count the dots ${above ? 'to the right of' : 'to the left of'} ${cut} (not on it): ${n}.`,
    meta: { vals, cut, above },
  })
}

const SET_1003: GameSet = {
  id: 'ncm7-10.03',
  exercise: '10.03',
  ref: 'NCM 7 Ex 10.03',
  title: 'Dot plots',
  lessons: ['y7-data-graphs'],
  focus: 'Read a dot plot: count scores and find the mode.',
  outcomes: [DAT1],
  makers: [mk('count', m1003count), mk('mode', m1003mode)],
}

// ================================================================== 10.04 Stem-and-leaf plots

/** a stem-and-leaf plot drawn as a picture: stems down the left, leaves in order, and a key */
function stemLeaf(vals: number[]): string {
  const s = sorted(vals)
  const lo = Math.floor(s[0] / 10)
  const hi = Math.floor(s[s.length - 1] / 10)
  const rowH = 30
  const x0 = 60
  let body = D.text([x0 - 22, 16], 'Stem', 'dl small head') + D.text([x0 + 14, 16], 'Leaf', 'dl small head', 'start')
  let maxLeaves = 0
  for (let st = lo; st <= hi; st++) {
    const y = 44 + (st - lo) * rowH
    const leaves = s.filter((v) => Math.floor(v / 10) === st).map((v) => v % 10)
    maxLeaves = Math.max(maxLeaves, leaves.length)
    body += D.text([x0 - 22, y], String(st), 'dl stem') + D.text([x0 + 14, y], leaves.join('  '), 'dl leaf', 'start')
  }
  const bottom = 44 + (hi - lo) * rowH + 16
  body += `<line class="ln" x1="${x0}" y1="28" x2="${x0}" y2="${bottom}"/><line class="ln" x1="${x0 - 46}" y1="28" x2="${x0 + 14 + maxLeaves * 22}" y2="28"/>`
  const key = s[0]
  body += D.text([x0 - 40, bottom + 20], `Key: ${Math.floor(key / 10)} | ${key % 10} = ${key}`, 'dl small key', 'start')
  const W = Math.max(220, x0 + 30 + maxLeaves * 22)
  return D.svg(W, bottom + 34, body, 'A stem-and-leaf plot', Math.round(W * 1.25))
}
function stemData(): number[] {
  const lo = int(1, 5)
  const rows = int(3, 4)
  for (;;) {
    const vals = Array.from({ length: int(9, 13) }, () => 10 * int(lo, lo + rows - 1) + int(0, 9))
    if (new Set(vals.map((v) => Math.floor(v / 10))).size === rows) return vals
  }
}

function m1004extreme(): GameQuestion {
  const vals = stemData()
  const largest = chance()
  const want = largest ? Math.max(...vals) : Math.min(...vals)
  const s = sorted(vals)
  return gq({
    t: 'extreme',
    prompt: `What is the ${largest ? 'largest' : 'smallest'} score?`,
    diagram: stemLeaf(vals),
    correct: num(want),
    // the stem and leaf read the wrong way round, the next score in, a leaf on its own
    wrong: numWrong(want, [(want % 10) * 10 + Math.floor(want / 10), largest ? s[s.length - 2] : s[1], want % 10, Math.floor(want / 10)]),
    why: `The ${largest ? 'last leaf in the bottom row' : 'first leaf in the top row'}: stem ${Math.floor(want / 10)}, leaf ${want % 10}, which is ${want}.`,
    meta: { vals, largest },
  })
}

function m1004count(): GameQuestion {
  const vals = stemData()
  const stems = [...new Set(vals.map((v) => Math.floor(v / 10)))].sort((a, b) => a - b)
  const st = pick(stems)
  const n = vals.filter((v) => Math.floor(v / 10) === st).length
  return gq({
    t: 'count',
    prompt: `How many scores are in the ${st * 10}s (from ${st * 10} to ${st * 10 + 9})?`,
    diagram: stemLeaf(vals),
    correct: num(n),
    wrong: numWrong(n, [st, vals.length, n + 1, ...stems.map((o) => vals.filter((v) => Math.floor(v / 10) === o).length)]),
    why: `Count the leaves beside stem ${st}: ${n}.`,
    meta: { vals, st },
  })
}

const SET_1004: GameSet = {
  id: 'ncm7-10.04',
  exercise: '10.04',
  ref: 'NCM 7 Ex 10.04',
  title: 'Stem-and-leaf plots',
  lessons: ['y7-data-graphs'],
  focus: 'Read scores from a stem-and-leaf plot using its key.',
  outcomes: [DAT1],
  makers: [mk('extreme', m1004extreme), mk('count', m1004count)],
}

// ================================================================== 10.05 The mean and mode

function m1005mean(): GameQuestion {
  const n = int(4, 6)
  const mean = int(3, 12)
  let xs: number[]
  do {
    xs = Array.from({ length: n - 1 }, () => int(Math.max(1, mean - 6), mean + 6))
    xs.push(mean * n - sum(xs))
  } while (xs[n - 1] < 1 || xs[n - 1] > mean + 8 || new Set(xs).size < 3)
  xs = shuffle(xs)
  return gq({
    t: 'mean',
    prompt: `Find the mean of these scores: ${list(xs)}`,
    correct: num(mean),
    // the total, divided by the wrong count, the median, the middle of the list as written
    wrong: numWrong(mean, [median(xs), sum(xs) / (n - 1), sum(xs) / (n + 1), xs[Math.floor(n / 2)], sum(xs)].filter((x) => Number.isInteger(x))),
    why: `Total: ${sum(xs)}. There are ${n} scores, so the mean is ${sum(xs)} ÷ ${n} = ${mean}.`,
    meta: { xs },
  })
}

function m1005mode(): GameQuestion {
  let xs: number[]
  let m: ReturnType<typeof modeOf>
  do {
    xs = Array.from({ length: int(7, 9) }, () => int(1, 12))
    m = modeOf(xs)
  } while (m.top < 2 || xs.filter((x) => xs.filter((y) => y === x).length === m.top).length !== m.top)
  return gq({
    t: 'mode',
    prompt: `Find the mode of these scores: ${list(xs)}`,
    correct: num(m.mode),
    // how often it occurs, the largest score, the median
    wrong: numWrong(m.mode, [m.top, Math.max(...xs), median(xs), xs[0]]),
    why: `${m.mode} occurs ${m.top} times, more than any other score.`,
    meta: { xs },
  })
}

function m1005missing(): GameQuestion {
  const n = int(3, 5)
  const mean = int(4, 10)
  let xs: number[]
  let last: number
  do {
    xs = Array.from({ length: n - 1 }, () => int(1, mean + 5))
    last = mean * n - sum(xs)
  } while (last < 1 || last > 20)
  return gq({
    t: 'missing',
    prompt: `The mean of ${n} numbers is ${mean}. ${n - 1 === 2 ? 'Two' : n - 1 === 3 ? 'Three' : 'Four'} of them are ${list(xs)}. What is the last number?`,
    correct: num(last),
    // forgot to multiply by the count, used one fewer number
    wrong: numWrong(last, [mean, mean * (n - 1) - sum(xs), mean * n - sum(xs) + mean, last + 1].filter((x) => x > 0)),
    why: `The total must be ${n} × ${mean} = ${n * mean}. ${n * mean} − ${sum(xs)} = ${last}.`,
    meta: { xs, mean, n },
  })
}

const SET_1005: GameSet = {
  id: 'ncm7-10.05',
  exercise: '10.05',
  ref: 'NCM 7 Ex 10.05',
  title: 'The mean and mode',
  lessons: ['y7-data-stats'],
  focus: 'Find the mean (total ÷ number of scores) and the mode (the most common score).',
  outcomes: [DAT2],
  makers: [mk('mean', m1005mean), mk('mode', m1005mode), mk('missing', m1005missing, 2)],
}

// ================================================================== 10.06 The median and range

function m1006median(): GameQuestion {
  const n = pick([5, 7, 6, 8])
  let xs: number[]
  do xs = Array.from({ length: n }, () => int(1, 30))
  while (new Set(xs).size < n || !Number.isInteger(median(xs)))
  const md = median(xs)
  return gq({
    t: 'median',
    prompt: `Find the median of these scores: ${list(xs)}`,
    correct: num(md),
    // the middle of the list before sorting, the mean, the mode-like middle pair
    wrong: numWrong(md, [n % 2 ? xs[(n - 1) / 2] : (xs[n / 2 - 1] + xs[n / 2]) / 2, Math.round(sum(xs) / n), sorted(xs)[Math.floor(n / 2)], sorted(xs)[Math.floor(n / 2) - 1]].filter((x) => Number.isInteger(x))),
    why: `In order: ${list(sorted(xs))}. ${n % 2 ? `The middle score is ${md}.` : `The middle two are ${sorted(xs)[n / 2 - 1]} and ${sorted(xs)[n / 2]}; halfway between is ${md}.`}`,
    meta: { xs },
  })
}

function m1006range(): GameQuestion {
  let xs: number[]
  do xs = Array.from({ length: int(6, 8) }, () => int(5, 60))
  while (new Set(xs).size < xs.length)
  const r = Math.max(...xs) - Math.min(...xs)
  return gq({
    t: 'range',
    prompt: `Find the range of these scores: ${list(xs)}`,
    correct: num(r),
    // the highest score, the first and last as written, highest + lowest
    wrong: numWrong(r, [Math.max(...xs), Math.abs(xs[xs.length - 1] - xs[0]), Math.max(...xs) + Math.min(...xs)]),
    why: `Highest − lowest: ${Math.max(...xs)} − ${Math.min(...xs)} = ${r}.`,
    meta: { xs },
  })
}

const SET_1006: GameSet = {
  id: 'ncm7-10.06',
  exercise: '10.06',
  ref: 'NCM 7 Ex 10.06',
  title: 'The median and range',
  lessons: ['y7-data-stats'],
  focus: 'Sort the scores to find the median (the middle) and the range (highest − lowest).',
  outcomes: [DAT2],
  makers: [mk('range', m1006range), mk('median', m1006median)],
}

// ================================================================== 10.07 Analysing dot plots and stem-and-leaf plots

function m1007median(): GameQuestion {
  let d: ReturnType<typeof dotData>
  do d = dotData()
  while (d.vals.length % 2 === 0 || !Number.isInteger(median(d.vals)))
  const md = median(d.vals)
  return gq({
    t: 'median',
    prompt: 'What is the median of the scores in this dot plot?',
    diagram: D.dotPlot(d.vals, d.lo, d.hi, 'Score'),
    correct: num(md),
    // the mode, the middle of the axis, the number of dots in the middle
    wrong: numWrong(md, [modeOf(d.vals).mode, (d.lo + d.hi) / 2, Math.ceil(d.vals.length / 2)].filter((x) => Number.isInteger(x))),
    why: `There are ${d.vals.length} dots, so the median is the ${(d.vals.length + 1) / 2}th score counting from the left: ${md}.`,
    meta: { vals: d.vals },
  })
}

function m1007range(): GameQuestion {
  const vals = stemData()
  const r = Math.max(...vals) - Math.min(...vals)
  return gq({
    t: 'range',
    prompt: 'What is the range of the scores in this stem-and-leaf plot?',
    diagram: stemLeaf(vals),
    correct: num(r),
    // the largest score, the difference between the stems, the number of scores
    wrong: numWrong(r, [Math.max(...vals), 10 * (Math.floor(Math.max(...vals) / 10) - Math.floor(Math.min(...vals) / 10)), vals.length]),
    why: `Largest ${Math.max(...vals)} − smallest ${Math.min(...vals)} = ${r}.`,
    meta: { vals },
  })
}

function m1007outlier(): GameQuestion {
  const lo = int(2, 6)
  const vals = Array.from({ length: int(9, 12) }, () => int(lo, lo + 4))
  const out = lo + 4 + int(5, 7)
  vals.push(out)
  return gq({
    t: 'outlier',
    prompt: 'Which score is an outlier?',
    diagram: D.dotPlot(vals, lo, out + 1, 'Score'),
    correct: num(out),
    // the most common score, the smallest, the end of the axis
    wrong: numWrong(out, [modeOf(vals).mode, Math.min(...vals), out + 1, lo + 4]),
    why: `${out} is far away from the other scores, which are all between ${lo} and ${lo + 4}.`,
    meta: { vals },
  })
}

const SET_1007: GameSet = {
  id: 'ncm7-10.07',
  exercise: '10.07',
  ref: 'NCM 7 Ex 10.07',
  title: 'Analysing dot plots and stem-and-leaf plots',
  lessons: ['y7-data-stats'],
  focus: 'Find the median and range from a plot, and spot outliers.',
  outcomes: [DAT2],
  makers: [mk('median', m1007median), mk('range', m1007range), mk('outlier', m1007outlier, 2)],
}

// ================================================================== 10.08 Comparing data sets

const WHO = ['Class A', 'Class B', 'They are the same', 'You cannot tell']

function m1008compare(): GameQuestion {
  const measure = pick(['mean', 'median', 'range'] as const)
  let a: number[], b: number[], va: number, vb: number
  const of = (xs: number[]) => (measure === 'mean' ? sum(xs) / xs.length : measure === 'median' ? median(xs) : Math.max(...xs) - Math.min(...xs))
  // A greater, B greater, or the same, each as likely
  const target = int(0, 2)
  do {
    a = Array.from({ length: 5 }, () => int(2, 20))
    b = Array.from({ length: 5 }, () => int(2, 20))
    va = of(a)
    vb = of(b)
  } while (!Number.isInteger(va) || !Number.isInteger(vb) || (target === 2 ? va !== vb : target === 0 ? va - vb < 2 : vb - va < 2))
  const higher = target
  return gq({
    t: 'compare',
    prompt: `Quiz scores. Class A: ${list(a)}. Class B: ${list(b)}. Which class has the greater ${measure}?`,
    correct: WHO[higher],
    inOrder: WHO,
    why: `The ${measure} of Class A is ${num(va)} and of Class B is ${num(vb)}${higher === 2 ? ': they are the same.' : `, so ${WHO[higher]} has the greater ${measure}.`}`,
    meta: { a, b, measure },
  })
}

const EFFECTS = ['The mean goes up', 'The mean goes down', 'The mean stays the same', 'The mean doubles']

function m1008effect(): GameQuestion {
  let xs: number[], mean: number
  do {
    xs = Array.from({ length: 4 }, () => int(3, 15))
    mean = sum(xs) / 4
  } while (!Number.isInteger(mean))
  const kind = int(0, 2)
  const add = kind === 0 ? mean + int(4, 20) : kind === 1 ? Math.max(1, mean - int(2, 8)) : mean
  const after = (sum(xs) + add) / 5
  const k = after > mean ? 0 : after < mean ? 1 : 2
  return gq({
    t: 'effect',
    prompt: `The scores ${list(xs)} have a mean of ${mean}. A new score of ${add} is added. What happens to the mean?`,
    correct: EFFECTS[k],
    inOrder: EFFECTS,
    why: `${add} is ${add > mean ? 'above' : add < mean ? 'below' : 'equal to'} the mean, so the new mean is ${num(after)}: it ${['goes up', 'goes down', 'stays the same'][k]}.`,
    meta: { xs, add },
  })
}

const SET_1008: GameSet = {
  id: 'ncm7-10.08',
  exercise: '10.08',
  ref: 'NCM 7 Ex 10.08',
  title: 'Comparing data sets',
  lessons: ['y7-data-stats'],
  focus: 'Compare data sets using the mean, median and range, and see how a new score changes the mean.',
  outcomes: [DAT2],
  makers: [mk('compare', m1008compare), mk('effect', m1008effect, 2)],
}

export const NCM7_CH10: GameChapter = {
  id: 'ncm7-ch10',
  number: 10,
  title: 'Analysing data',
  ref: 'NCM 7 Chapter 10',
  strand: 'Statistics and probability',
  outcomes: [DAT1, DAT2],
  sets: [SET_1001, SET_1002, SET_1003, SET_1004, SET_1005, SET_1006, SET_1007, SET_1008],
  colour: 145,
  topics: ['y7-data'],
}
