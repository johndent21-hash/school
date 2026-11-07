// Year 9 Analysing data, following New Century Maths 9 (3rd edition, Cengage) Chapter 9 exercise by exercise.
// The questions are the site's own: they practise the same kinds of question as each exercise, in the same
// easy-to-hard order (Foundation = the start of the exercise, Challenge = the end), but none of the textbook's
// wording or numbers are copied.
// Syllabus: MA4-DAT-C-01 (classifies and displays data using a variety of graphical representations) and
// MA4-DAT-C-02 (analyses simple datasets using measures of centre, range and shape of the data). NCM 9 teaches this
// Stage 4 content in Year 9. The census and sampling part of 9.05 and all of 9.06 are marked PATH in NCM 9: they are
// extension skills here (MA5-DAT-P-01) and are left out of the topic test. Classifying data (the rest of 9.05) is
// Stage 4 core content (MA4-DAT-C-01), so it stays in the core skills.
// Drawing tasks (frequency tables, histograms, polygons, stem-and-leaf plots, dot plots) become reading and choosing
// questions.
import type { Answer, Level, Question, Skill, TestItem } from '@/lib/maths/types'
import { freqHist, stemPlot, stemPlot2 } from '@/lib/maths/diagrams9'
import { D, chance, clean, int, mcA, mcFixedA, name, num, numA, ordinal, pick, q, round, sample, shuffle } from './helpers'

const C1 = ['MA4-DAT-C-01']
const C2 = ['MA4-DAT-C-02']
const C12 = ['MA4-DAT-C-01', 'MA4-DAT-C-02']
const P1 = ['MA5-DAT-P-01']
const ref = (e: string) => `NCM 9 Ex ${e}`

// ---------------------------------------------------------------- statistics, worked exactly (rounded only at the end)

const sum = (a: number[]) => clean(a.reduce((s, x) => s + x, 0))
const sorted = (a: number[]) => a.slice().sort((x, y) => x - y)
const meanOf = (a: number[]) => sum(a) / a.length
function medianOf(a: number[]): number {
  const s = sorted(a)
  const n = s.length
  return n % 2 ? s[(n - 1) / 2] : clean((s[n / 2 - 1] + s[n / 2]) / 2)
}
function countsOf(a: number[]): [number, number][] {
  const c = new Map<number, number>()
  a.forEach((x) => c.set(x, (c.get(x) ?? 0) + 1))
  return [...c.entries()].sort((p, r) => p[0] - r[0])
}
/** the single most common value, or null when there is no single mode */
function modeOf(a: number[]): number | null {
  const c = countsOf(a)
  const m = Math.max(...c.map((p) => p[1]))
  const top = c.filter((p) => p[1] === m)
  return top.length === 1 && m >= 2 ? top[0][0] : null
}
const maxCount = (a: number[]) => Math.max(...countsOf(a).map((p) => p[1]))
const rangeOf = (a: number[]) => clean(Math.max(...a) - Math.min(...a))
const expand = (xs: number[], fs: number[]) => xs.flatMap((x, i) => Array<number>(fs[i]).fill(x))
const seq = (a: number, k: number) => Array.from({ length: k }, (_, i) => a + i)
/** n values from gen() with exactly one most common value */
function withMode(n: number, gen: () => number): number[] {
  for (;;) {
    const base = Array.from({ length: n - 1 }, gen)
    const a = shuffle([...base, pick(base)])
    if (modeOf(a) !== null) return a
  }
}
/**
 * The outlier rule used throughout: a lowest or highest value is an outlier when its gap to the next value is at least 4
 * and at least twice every other gap between neighbouring values. Returns the outliers found (0, 1 or 2 values).
 */
function outliersOf(a: number[]): number[] {
  const s = sorted(a)
  const g = s.slice(1).map((x, i) => x - s[i])
  const out: number[] = []
  if (g.length < 2) return out
  if (g[0] >= 4 && g[0] >= 2 * Math.max(...g.slice(1))) out.push(s[0])
  if (g[g.length - 1] >= 4 && g[g.length - 1] >= 2 * Math.max(...g.slice(0, -1))) out.push(s[s.length - 1])
  return out
}
/** exactly one outlier, and it is `out` */
const onlyOutlier = (a: number[], out: number) => {
  const o = outliersOf(a)
  return o.length === 1 && o[0] === out
}

/** Index of the single largest frequency, or -1 if the largest is shared. */
function topIndex(fs: number[]): number {
  const m = Math.max(...fs)
  return fs.filter((x) => x === m).length === 1 ? fs.indexOf(m) : -1
}

// ---------------------------------------------------------------- display helpers

const list = (a: number[], dp?: number) => `<p class="datalist text-lg leading-relaxed">${a.map((x) => num(x, dp)).join(',&ensp;')}</p>`
const dpWords = (dp: number) => (dp === 0 ? 'to the nearest whole number' : `correct to ${dp} decimal place${dp > 1 ? 's' : ''}`)
/** "= 7.5" when exact at dp places, otherwise "≈ 7.53" */
const eq = (x: number, dp: number) => (Math.abs(round(x, dp) - x) < 1e-9 ? `= ${num(clean(x))}` : `≈ ${num(round(x, dp), dp)}`)
/** brackets round a negative number after an operation sign */
const br = (s: string, x: number) => (x < 0 ? `(${s})` : s)
const freqTable = (xs: number[], fs: number[], head = 'Score') => D.table([`${head} (<i>x</i>)`, 'Frequency (<i>f</i>)'], xs.map((x, i) => [num(x), fs[i]]))

type Stat = 'mean' | 'median' | 'mode' | 'range'
const STATS: Stat[] = ['mean', 'median', 'mode', 'range']
const HINT: Record<Stat, string> = {
  mean: 'Mean = sum of the values ÷ number of values.',
  median: 'Put the values in order. The median is the middle value, or halfway between the two middle values.',
  mode: 'The mode is the value that occurs most often.',
  range: 'Range = highest value − lowest value.',
}

function statWork(data: number[], stat: Stat, dp = 1, dataDp?: number): { answer: Answer; steps: string[] } {
  const n = data.length
  const N = (x: number) => num(x, dataDp)
  const long = n > 12
  if (stat === 'mean') {
    const S = sum(data)
    const add = long
      ? countsOf(data)
          .map(([x, c]) => (c === 1 ? br(N(x), x) : `${c} × ${br(N(x), x)}`))
          .join(' + ')
      : data.map((x) => br(N(x), x)).join(' + ')
    return { answer: numA(S / n, dp), steps: [`Sum = ${add} = ${num(S)}`, `Mean = ${num(S)} ÷ ${n} ${eq(S / n, dp)}`] }
  }
  if (stat === 'median') {
    const s = sorted(data)
    const med = medianOf(data)
    const where =
      n % 2
        ? `There are ${n} values, so the median is the ${ordinal((n + 1) / 2)} value: ${num(med)}`
        : `There are ${n} values, so the median is halfway between the ${ordinal(n / 2)} and ${ordinal(n / 2 + 1)} values: (${N(s[n / 2 - 1])} + ${br(N(s[n / 2]), s[n / 2])}) ÷ 2 = ${num(med)}`
    return { answer: numA(med), steps: long ? [`Count along from the lowest value.`, where] : [`In order: ${s.map(N).join(', ')}`, where] }
  }
  if (stat === 'mode') {
    const m = modeOf(data)!
    return { answer: numA(m), steps: [`${N(m)} occurs ${data.filter((x) => x === m).length} times, more often than any other value.`] }
  }
  const hi = Math.max(...data)
  const lo = Math.min(...data)
  return { answer: numA(rangeOf(data)), steps: [`Range = highest − lowest = ${N(hi)} − ${br(N(lo), lo)} = ${num(rangeOf(data))}`] }
}

function statQ(intro: string, data: number[], stat: Stat, o: { dp?: number; dataDp?: number; diagram?: string; meta: Record<string, unknown> }): Question {
  const dp = o.dp ?? 1
  const w = statWork(data, stat, dp, o.dataDp)
  const ask = stat === 'mean' ? `Find the mean, ${dpWords(dp)}.` : `Find the ${stat}.`
  return q({
    prompt: `<p>${intro}</p>${o.diagram ? '' : list(data, o.dataDp)}<p>${ask}</p>`,
    diagram: o.diagram,
    answer: w.answer,
    hint: HINT[stat],
    steps: w.steps,
    calc: stat === 'mean',
    meta: { t: 'dat', stat, dp, ...o.meta },
  })
}

// ================================================================= 9.01 The mean, median, mode and range

const LIST_CTX = [
  { text: (n: number) => `the points scored by a basketball team in each of its last ${n} games`, lo: 48, hi: 95 },
  { text: (n: number) => `the numbers of emails ${name()} received on ${n} days`, lo: 6, hi: 32 },
  { text: (n: number) => `the numbers of push-ups that ${n} students did in one minute`, lo: 12, hi: 45 },
  { text: (n: number) => `the numbers of customers served each hour at a café over ${n} hours`, lo: 14, hi: 38 },
  { text: (n: number) => `the scores (out of 50) of ${n} students in a spelling test`, lo: 22, hi: 50 },
]
const DOT_CTX = [
  { intro: 'This dot plot shows the results (out of 10) of a class in a quick quiz.', lo: 0, hi: 10, axis: 'Quiz result' },
  { intro: 'This dot plot shows the number of digital devices in each home in a survey.', lo: 1, hi: 9, axis: 'Number of devices' },
  { intro: 'This dot plot shows the ages of the children at a birthday party.', lo: 3, hi: 12, axis: 'Age (years)' },
  { intro: 'This dot plot shows the number of goals a hockey team scored in each match of its season.', lo: 0, hi: 8, axis: 'Number of goals' },
]
const OUT_CTX = [
  { text: (n: number) => `the numbers of goals scored by a soccer team in ${n} matches`, lo: 0, hi: 4, out: [10, 13] },
  { text: (n: number) => `the marks (out of 20) of ${n} students in a quiz`, lo: 12, hi: 20, out: [2, 5] },
  { text: (n: number) => `the numbers of minutes a bus was late on ${n} days`, lo: 1, hi: 7, out: [24, 32] },
  { text: (n: number) => `the numbers of pages that ${n} students read last night`, lo: 8, hi: 20, out: [55, 70] },
]

/** values in [lo, hi] plus one outlier far outside them */
function withOutlier(c: (typeof OUT_CTX)[number], n: number): { data: number[]; out: number } {
  for (;;) {
    const base = Array.from({ length: n - 1 }, () => int(c.lo, c.hi))
    if (rangeOf(base) < 3) continue
    const out = int(c.out[0], c.out[1])
    if (!onlyOutlier([...base, out], out)) continue
    return { data: shuffle([...base, out]), out }
  }
}

function centre(level: Level): Question {
  if (level === 1) {
    const c = pick(LIST_CTX)
    const n = int(7, 11)
    const data = withMode(n, () => int(c.lo, c.hi))
    return statQ(`Here are ${c.text(n)}.`, data, pick(STATS), { meta: { kind: 'list' } })
  }
  if (level === 2) {
    const kind = pick(['dot', 'dot', 'neg', 'dec', 'outlier', 'best', 'fx'] as const)
    if (kind === 'dot') {
      const c = pick(DOT_CTX)
      let data: number[]
      do {
        const mid = int(c.lo + 2, c.hi - 2)
        data = Array.from({ length: int(14, 22) }, () => Math.min(c.hi, Math.max(c.lo, mid + int(-2, 2) + int(-1, 1))))
      } while (modeOf(data) === null || maxCount(data) > 7)
      return statQ(c.intro, data, pick(STATS), { diagram: D.dotPlot(data, c.lo, c.hi, c.axis), meta: { kind } })
    }
    if (kind === 'neg') {
      const n = int(8, 10)
      let data: number[]
      // (no means exactly halfway at 1 decimal place: rounding a negative half is done differently by different people)
      do data = withMode(n, () => int(-7, 4))
      while (!data.some((x) => x < 0) || !data.some((x) => x > 0) || Math.abs(((Math.abs(sum(data)) * 10) / n) % 1 - 0.5) < 1e-9)
      return statQ(`The minimum temperatures (in °C) at Thredbo on ${n} winter mornings were:`, data, pick(['mean', 'median', 'range'] as Stat[]), { meta: { kind } })
    }
    if (kind === 'dec') {
      const n = 8
      const data = withMode(n, () => int(80, 97) / 10)
      const stat = pick(STATS)
      return statQ(`The lengths (in cm) of ${n} seedlings were:`, data, stat, { dp: 2, dataDp: 1, meta: { kind } })
    }
    if (kind === 'outlier') {
      const c = pick(OUT_CTX)
      const n = int(9, 11)
      const { data, out } = withOutlier(c, n)
      const rest = data.filter((x, i) => i !== data.indexOf(out))
      const ask = pick(['which', 'meanWith', 'meanWithout', 'medianWith', 'medianWithout'] as const)
      const intro = `<p>Here are ${c.text(n)}.</p>${list(data)}`
      if (ask === 'which') {
        return q({
          prompt: `${intro}<p>Which value is an outlier?</p>`,
          answer: numA(out),
          hint: 'An outlier is a value that is much higher or much lower than the rest of the data.',
          steps: [`In order: ${sorted(data).map((x) => num(x)).join(', ')}`, `${out} is far away from all the other values, so it is the outlier.`],
          meta: { t: 'dat', kind, ask },
        })
      }
      const use = ask.endsWith('Without') ? rest : data
      const stat: Stat = ask.startsWith('mean') ? 'mean' : 'median'
      const w = statWork(use, stat, 1)
      const which = ask.endsWith('Without') ? 'without the outlier' : 'including the outlier'
      return q({
        prompt: `${intro}<p>Find the ${stat} ${which}${stat === 'mean' ? `, ${dpWords(1)}` : ''}.</p>`,
        answer: w.answer,
        hint: `First find the outlier: the value much higher or lower than the rest. ${HINT[stat]}`,
        steps: [`The outlier is ${out}.${ask.endsWith('Without') ? ` Leave it out: ${use.length} values remain.` : ''}`, ...w.steps],
        calc: stat === 'mean',
        meta: { t: 'dat', kind, ask, stat, dp: 1 },
      })
    }
    if (kind === 'best') {
      const opts = ['the mean', 'the median', 'the mode']
      const sit = pick(['outlier', 'even', 'mode'] as const)
      if (sit === 'outlier') {
        const c = pick(OUT_CTX)
        const n = int(9, 11)
        const { data, out } = withOutlier(c, n)
        return q({
          prompt: `<p>Here are ${c.text(n)}.</p>${list(data)}<p>Which measure of centre best represents this data?</p>`,
          answer: mcFixedA(opts, 'the median'),
          hint: 'Look for an outlier. Which measure is not pulled towards an outlier?',
          steps: [`${out} is an outlier.`, `Mean ${eq(meanOf(data), 1)}, median = ${num(medianOf(data))}: the outlier pulls the mean towards it, but it does not affect the median.`, 'So the median is the best measure of centre.'],
          meta: { t: 'dat', kind, sit, out },
        })
      }
      if (sit === 'even') {
        const c = pick(LIST_CTX)
        const n = int(7, 9)
        let data: number[]
        // no outliers: no big gaps between neighbouring values
        do data = Array.from({ length: n }, () => int(c.lo, c.hi))
        while (outliersOf(data).length > 0 || gapRatio(data) > 0.35)
        return q({
          prompt: `<p>Here are ${c.text(n)}.</p>${list(data)}<p>There are no outliers. Which measure of centre best represents this data?</p>`,
          answer: mcFixedA(opts, 'the mean'),
          hint: 'With no outliers, which measure uses every value?',
          steps: ['There are no outliers, so the mean is the best measure: it takes every value into account.', `Mean ${eq(meanOf(data), 1)}`],
          meta: { t: 'dat', kind, sit },
        })
      }
      const shop = pick([
        { what: 'school shoes', sizes: seq(5, 7) },
        { what: 'dresses', sizes: [8, 10, 12, 14, 16] },
      ])
      const data = withMode(int(10, 12), () => pick(shop.sizes))
      return q({
        prompt: `<p>A shop records the sizes of the ${shop.what} it sold in one day:</p>${list(data)}<p>It wants to know which size to order the most of. Which measure of centre should it use?</p>`,
        answer: mcFixedA(opts, 'the mode'),
        hint: 'The shop needs the size that sells most often.',
        steps: ['The most common size matters here, so the mode is the best measure.', `Mode = ${modeOf(data)}`],
        meta: { t: 'dat', kind, sit },
      })
    }
    // fx: mean of a frequency table
    const k = int(5, 6)
    const xs = seq(int(1, 20), k)
    const fs = xs.map(() => int(2, 9))
    const fx = xs.map((x, i) => x * fs[i])
    const N = sum(fs)
    const S = sum(fx)
    return q({
      prompt: `<p>The table shows the scores of a group of students. Use an <i>fx</i> column to find the mean score, ${dpWords(2)}.</p>`,
      diagram: freqTable(xs, fs),
      answer: numA(S / N, 2),
      hint: 'Multiply each score by its frequency (fx), add the fx column, then divide by the total frequency.',
      steps: [`fx column: ${fx.join(', ')}`, `Σf = ${N}, Σfx = ${S}`, `Mean = Σfx ÷ Σf = ${S} ÷ ${N} ${eq(S / N, 2)}`],
      calc: true,
      meta: { t: 'dat', kind, stat: 'mean', dp: 2 },
    })
  }
  const kind = pick(['missing', 'newMean', 'possible', 'cumMedian', 'cumMedian'] as const)
  const who = name()
  if (kind === 'missing') {
    const c = pick([
      { lo: 66, hi: 78, say: (k: number, m: number, known: string) => `${who} played ${k} rounds in a golf tournament with a mean score of ${m}. The scores for the first ${k - 1} rounds were ${known}. What was the score in round ${k}?`, suffix: '' },
      { lo: 110, hi: 170, say: (k: number, m: number, known: string) => `${who} bowled ${k} games of ten-pin bowling with a mean score of ${m}. The scores in the first ${k - 1} games were ${known}. What was the score in game ${k}?`, suffix: '' },
      { lo: 55, hi: 92, say: (k: number, m: number, known: string) => `${who} sat ${k} maths tests and had a mean mark of ${m}%. The marks in the first ${k - 1} tests were ${known} (all %). What mark did ${who} get in test ${k}?`, suffix: '%' },
    ])
    for (;;) {
      const k = int(4, 6)
      const m = int(c.lo + 3, c.hi - 3)
      const known = Array.from({ length: k - 1 }, () => int(c.lo, c.hi))
      const x = k * m - sum(known)
      if (x < c.lo || x > c.hi) continue
      return q({
        prompt: c.say(k, m, known.join(', ')),
        answer: numA(x),
        suffix: c.suffix || undefined,
        hint: 'Mean × number of values = total. Find the total of all the values, then take away the ones you know.',
        steps: [`Total of all ${k} = ${k} × ${m} = ${k * m}`, `Total of the first ${k - 1} = ${known.join(' + ')} = ${sum(known)}`, `Missing value = ${k * m} − ${sum(known)} = ${x}`],
        calc: true,
        meta: { t: 'dat', kind, k, m, known, x },
      })
    }
  }
  if (kind === 'newMean') {
    for (;;) {
      const n = int(4, 6)
      const a = int(60, 80)
      const b = a + int(2, 5)
      const x = (n + 1) * b - n * a
      if (x > 100 || x < 50) continue
      return q({
        prompt: `${who} has a mean mark of ${a}% for ${n} maths tests. After one more test, the mean rises to ${b}%. What mark did ${who} get in the last test?`,
        answer: numA(x),
        suffix: '%',
        hint: 'Find the total of the marks before and after the last test.',
        steps: [`Total for ${n} tests = ${n} × ${a} = ${n * a}`, `Total for ${n + 1} tests = ${n + 1} × ${b} = ${(n + 1) * b}`, `Last test = ${(n + 1) * b} − ${n * a} = ${x}%`],
        calc: true,
        meta: { t: 'dat', kind, n, a, b, x },
      })
    }
  }
  if (kind === 'possible') {
    const n = int(3, 5)
    const a = int(60, 75)
    const b = a + int(4, 9)
    const need = (n + 1) * b - n * a
    const ok = need <= 100
    const correct = ok ? `Yes: ${who} would need ${need}%.` : `No: ${who} would need ${need}%, which is more than 100%.`
    const wrong = [`Yes: ${who} would need ${b}%.`, `Yes: ${who} would need ${b + (b - a)}%.`, ok ? `No: ${who} would need more than 100%.` : 'No: one more exam can never raise a mean.']
    return q({
      prompt: `${who}’s mean mark for ${n} science exams is ${a}%. Can ${who} score enough in one more exam to raise the mean to ${b}%? (Each exam is marked out of 100%.)`,
      answer: mcA(correct, wrong),
      hint: `Work out the total needed for ${n + 1} exams, then take away the total so far.`,
      steps: [`Total so far = ${n} × ${a} = ${n * a}`, `Total needed = ${n + 1} × ${b} = ${(n + 1) * b}`, `Mark needed = ${(n + 1) * b} − ${n * a} = ${need}%`, ok ? 'This is possible.' : 'More than 100% is impossible.'],
      meta: { t: 'dat', kind, n, a, b, need },
    })
  }
  // cumMedian
  const k = int(6, 7)
  const xs = seq(int(2, 18), k)
  const fs = xs.map(() => int(2, 12))
  const data = expand(xs, fs)
  const N = data.length
  const cum = fs.map((_, i) => sum(fs.slice(0, i + 1)))
  const med = medianOf(data)
  const s = sorted(data)
  return q({
    prompt: '<p>Add a cumulative frequency column to this table, then find the median score.</p>',
    diagram: freqTable(xs, fs),
    answer: numA(med),
    hint: 'The cumulative frequency is a running total of the frequencies. Use it to find where the middle score is.',
    steps: [
      `Cumulative frequencies: ${cum.join(', ')}`,
      N % 2
        ? `There are ${N} scores, so the median is the ${ordinal((N + 1) / 2)} score: ${num(med)}`
        : `There are ${N} scores, so the median is halfway between the ${ordinal(N / 2)} and ${ordinal(N / 2 + 1)} scores: (${s[N / 2 - 1]} + ${s[N / 2]}) ÷ 2 = ${num(med)}`,
    ],
    meta: { t: 'dat', kind, stat: 'median' },
  })
}

/** the largest gap between neighbouring values, as a fraction of the range (to keep out outliers) */
function gapRatio(a: number[]): number {
  const s = sorted(a)
  const r = s[s.length - 1] - s[0]
  if (r === 0) return 1
  let g = 0
  for (let i = 1; i < s.length; i++) g = Math.max(g, s[i] - s[i - 1])
  return g / r
}

// ================================================================= 9.02 Histograms and stem-and-leaf plots

const HIST_CTX = [
  {
    about: 'the number of hours of homework done last week by a group of students',
    axis: 'Number of hours of homework',
    x0: [1, 2],
    k: [7, 8],
    freq: (x: number) => `How many students did ${x} hour${x === 1 ? '' : 's'} of homework?`,
    atLeast: (x: number) => `How many students did ${x} or more hours of homework?`,
    total: 'How many students were surveyed?',
    poly: false,
  },
  {
    about: 'the number of letters in the surnames of a group of students',
    axis: 'Number of letters in surname',
    x0: [3, 3],
    k: [6, 7],
    freq: (x: number) => `How many students have ${x} letters in their surname?`,
    atLeast: (x: number) => `How many students have ${x} or more letters in their surname?`,
    total: 'How many students are there altogether?',
    poly: false,
  },
  {
    about: 'the number of siblings (brothers and sisters) that each person in a survey has',
    axis: 'Number of siblings',
    x0: [0, 0],
    k: [6, 7],
    freq: (x: number) => `How many people have exactly ${x} sibling${x === 1 ? '' : 's'}?`,
    atLeast: (x: number) => `How many people have ${x} or more siblings?`,
    total: 'How many people were surveyed?',
    poly: false,
  },
  {
    about: 'the results (out of 10) of a class in an Art project',
    axis: 'Result (out of 10)',
    x0: [2, 4],
    k: [7, 7],
    freq: (x: number) => `How many students scored ${x}?`,
    atLeast: (x: number) => `How many students scored ${x} or more?`,
    total: 'How many students did the project?',
    poly: false,
  },
  {
    about: 'the number of calls made each minute to a customer help line',
    axis: 'Number of calls per minute',
    x0: [0, 0],
    k: [7, 7],
    freq: (x: number) => `For how many minutes were there exactly ${x} call${x === 1 ? '' : 's'}?`,
    atLeast: (x: number) => `For how many minutes were there ${x} or more calls?`,
    total: 'For how many minutes were the calls recorded?',
    poly: true,
  },
]
const STEM_CTX = [
  { about: 'the marks (out of 100) of a class in a Science test', lo: 34, hi: 99, key: 'Key: 6 | 3 = 63 marks', count: 'How many students are in the class?', big: 'highest mark', small: 'lowest mark', above: (t: number) => `How many students scored more than ${t}?` },
  { about: 'the points scored by a basketball team in its matches this season', lo: 30, hi: 89, key: 'Key: 5 | 4 = 54 points', count: 'How many matches did the team play?', big: 'highest score', small: 'lowest score', above: (t: number) => `In how many matches did the team score more than ${t} points?` },
  { about: 'the pulse rates (in beats per minute) of people at a shopping centre', lo: 51, hi: 99, key: 'Key: 7 | 2 = 72 beats per minute', count: 'How many people had their pulse measured?', big: 'highest pulse rate', small: 'lowest pulse rate', above: (t: number) => `How many people had a pulse rate above ${t}?` },
]

/** frequencies (1 to 10) in a rough hump, as real survey data usually are, with one tallest column */
function histFreqs(k: number): number[] {
  for (;;) {
    const c = int(1, k - 2) + (chance() ? 0.5 : 0)
    const w = int(12, 22) / 10
    const top = int(7, 10)
    const fs = seq(0, k).map((i) => Math.min(10, Math.max(1, Math.round(top * Math.exp(-((i - c) ** 2) / (2 * w * w))) + int(-1, 1))))
    if (topIndex(fs) >= 0) return fs
  }
}

function stemData(c: (typeof STEM_CTX)[number], n: number, needMode = false): number[] {
  for (;;) {
    const mid = int(c.lo + 15, c.hi - 15)
    const data = Array.from({ length: n }, () => Math.min(c.hi, Math.max(c.lo, mid + int(-15, 15) + int(-8, 8))))
    if (rangeOf(data) < 25) continue
    if (needMode && modeOf(data) === null) continue
    return data
  }
}

function displays(level: Level): Question {
  if (level === 1) {
    const kind = pick(['hist', 'hist', 'stem', 'stem'] as const)
    if (kind === 'hist') {
      const c = pick(HIST_CTX)
      const xs = seq(int(c.x0[0], c.x0[1]), int(c.k[0], c.k[1]))
      const fs = histFreqs(xs.length)
      const ask = pick(['freq', 'freq', 'total', 'mode'] as const)
      const kindWord = c.poly ? 'polygon' : 'histogram'
      const diagram = freqHist(xs, fs, { hist: !c.poly, polygon: c.poly, xLabel: c.axis })
      const intro = `<p>This frequency ${kindWord} shows ${c.about}.</p>`
      if (ask === 'freq') {
        const i = pick(seq(0, xs.length))
        return q({ prompt: `${intro}<p>${c.freq(xs[i])}</p>`, diagram, answer: numA(fs[i]), hint: `Find ${xs[i]} on the horizontal axis and read across to the frequency axis.`, steps: [`The ${c.poly ? 'point' : 'column'} above ${xs[i]} reaches a frequency of ${fs[i]}.`], meta: { t: 'dat', kind, ask, x: xs[i] } })
      }
      if (ask === 'total') {
        return q({ prompt: `${intro}<p>${c.total}</p>`, diagram, answer: numA(sum(fs)), hint: 'Add all the frequencies.', steps: [`Total = ${fs.join(' + ')} = ${sum(fs)}`], meta: { t: 'dat', kind, ask } })
      }
      const m = xs[topIndex(fs)]
      return q({ prompt: `${intro}<p>What is the mode?</p>`, diagram, answer: numA(m), hint: `The mode has the highest ${c.poly ? 'point' : 'column'}.`, steps: [`The highest ${c.poly ? 'point' : 'column'} is above ${m} (frequency ${Math.max(...fs)}), so the mode is ${m}.`], meta: { t: 'dat', kind, ask } })
    }
    const c = pick(STEM_CTX)
    const ask = pick(['count', 'big', 'small', 'range', 'mode', 'above'] as const)
    const data = stemData(c, int(12, 18), ask === 'mode')
    const diagram = stemPlot(data, { key: c.key })
    const intro = `<p>This stem-and-leaf plot shows ${c.about}.</p>`
    const s = sorted(data)
    if (ask === 'count') return q({ prompt: `${intro}<p>${c.count}</p>`, diagram, answer: numA(data.length), hint: 'Count the leaves: each leaf is one value.', steps: [`There are ${data.length} leaves, so ${data.length} values.`], meta: { t: 'dat', kind, ask } })
    if (ask === 'big') return q({ prompt: `${intro}<p>What is the ${c.big}?</p>`, diagram, answer: numA(s[s.length - 1]), hint: 'Look at the last leaf on the bottom stem.', steps: [`The last stem and leaf give ${s[s.length - 1]}.`], meta: { t: 'dat', kind, ask } })
    if (ask === 'small') return q({ prompt: `${intro}<p>What is the ${c.small}?</p>`, diagram, answer: numA(s[0]), hint: 'Look at the first leaf on the top stem.', steps: [`The first stem and leaf give ${s[0]}.`], meta: { t: 'dat', kind, ask } })
    if (ask === 'range') return q({ prompt: `${intro}<p>Find the range.</p>`, diagram, answer: numA(rangeOf(data)), hint: 'Range = highest − lowest. The lowest value is the first leaf; the highest is the last leaf.', steps: [`Range = ${s[s.length - 1]} − ${s[0]} = ${rangeOf(data)}`], meta: { t: 'dat', kind, ask, stat: 'range' } })
    if (ask === 'mode') return q({ prompt: `${intro}<p>What is the mode?</p>`, diagram, answer: numA(modeOf(data)!), hint: 'Look for a leaf that repeats on the same stem.', steps: statWork(data, 'mode').steps, meta: { t: 'dat', kind, ask, stat: 'mode' } })
    // a round number with at least 3 values on each side of it
    const ts = [40, 50, 60, 70, 80, 90].filter((x) => x > s[2] && x < s[s.length - 3])
    const t = ts.length ? pick(ts) : Math.round(medianOf(data) / 10) * 10
    const cnt = data.filter((x) => x > t).length
    return q({ prompt: `${intro}<p>${c.above(t)}</p>`, diagram, answer: numA(cnt), hint: `Count the values greater than ${t} (not ${t} itself).`, steps: [`Values above ${t}: ${s.filter((x) => x > t).join(', ')}`, `That is ${cnt} values.`], meta: { t: 'dat', kind, ask, above: t } })
  }
  if (level === 2) {
    const kind = pick(['hist', 'hist', 'stem', 'stem'] as const)
    if (kind === 'hist') {
      const c = pick(HIST_CTX)
      const xs = seq(int(c.x0[0], c.x0[1]), int(c.k[0], c.k[1]))
      const fs = histFreqs(xs.length)
      const data = expand(xs, fs)
      const ask = pick(['mean', 'median', 'atLeast'] as const)
      const diagram = freqHist(xs, fs, { hist: !c.poly, polygon: c.poly, xLabel: c.axis })
      const intro = `<p>This frequency ${c.poly ? 'polygon' : 'histogram'} shows ${c.about}.</p>`
      if (ask === 'atLeast') {
        const i = int(2, xs.length - 2)
        const cnt = sum(fs.slice(i))
        return q({ prompt: `${intro}<p>${c.atLeast(xs[i])}</p>`, diagram, answer: numA(cnt), hint: `Add the frequencies for ${xs[i]} and every value above it.`, steps: [`${fs.slice(i).join(' + ')} = ${cnt}`], meta: { t: 'dat', kind, ask, x: xs[i] } })
      }
      if (ask === 'mean') {
        const fx = xs.map((x, i) => x * fs[i])
        return q({
          prompt: `${intro}<p>Find the mean, ${dpWords(2)}.</p>`,
          diagram,
          answer: numA(sum(fx) / data.length, 2),
          hint: 'Read the frequency of each value. Mean = Σfx ÷ Σf.',
          steps: [`Frequencies: ${xs.map((x, i) => `${x} → ${fs[i]}`).join(', ')}`, `Σfx = ${xs.map((x, i) => `${x} × ${fs[i]}`).join(' + ')} = ${sum(fx)}`, `Mean = ${sum(fx)} ÷ ${data.length} ${eq(sum(fx) / data.length, 2)}`],
          calc: true,
          meta: { t: 'dat', kind, ask, stat: 'mean', dp: 2 },
        })
      }
      const N = data.length
      const s = sorted(data)
      const cum = fs.map((_, i) => sum(fs.slice(0, i + 1)))
      return q({
        prompt: `${intro}<p>Find the median.</p>`,
        diagram,
        answer: numA(medianOf(data)),
        hint: 'Read the frequencies and keep a running total to find the middle value.',
        steps: [
          `Running totals: ${cum.join(', ')} (${N} values)`,
          N % 2 ? `The median is the ${ordinal((N + 1) / 2)} value: ${num(medianOf(data))}` : `The median is halfway between the ${ordinal(N / 2)} and ${ordinal(N / 2 + 1)} values: (${s[N / 2 - 1]} + ${s[N / 2]}) ÷ 2 = ${num(medianOf(data))}`,
        ],
        meta: { t: 'dat', kind, ask, stat: 'median' },
      })
    }
    const c = pick(STEM_CTX)
    const data = stemData(c, int(13, 20))
    const stat = pick(['median', 'median', 'mean'] as Stat[])
    return statQ(`This stem-and-leaf plot shows ${c.about}.`, data, stat, { dp: 1, diagram: stemPlot(data, { key: c.key }), meta: { kind: 'stem' } })
  }
  const kind = pick(['b2b', 'b2b', 'missing', 'decimal', 'unordered'] as const)
  if (kind === 'b2b') {
    const teams = pick([
      ['Rockets', 'Blues'],
      ['Comets', 'Stars'],
      ['Hawks', 'Sharks'],
    ])
    let A: number[]
    let B: number[]
    do {
      A = Array.from({ length: int(12, 15) }, () => int(14, 56))
      B = Array.from({ length: int(12, 15) }, () => int(14, 56))
    } while (medianOf(A) === medianOf(B) || Math.floor(Math.min(...A, ...B) / 10) < 1)
    const ask = pick(['more', 'highest', 'median', 'range'] as const)
    const ti = int(0, 1)
    const T = teams[ti]
    const d = ti === 0 ? A : B
    const diagram = stemPlot2(A, B, teams[0], teams[1], `Key: 4 | 3 | 7 means 34 goals for the ${teams[0]} and 37 goals for the ${teams[1]}`)
    const intro = `<p>This back-to-back stem-and-leaf plot shows the number of goals scored in each match by two netball teams during a season.</p>`
    if (ask === 'more') {
      const t = pick([20, 30, 40])
      const cnt = d.filter((x) => x > t).length
      return q({ prompt: `${intro}<p>In how many matches did the ${T} score more than ${t} goals?</p>`, diagram, answer: numA(cnt), hint: `Use the ${T}’ side of the plot. Count the scores greater than ${t}.`, steps: [`${T}’ scores above ${t}: ${sorted(d.filter((x) => x > t)).join(', ')}`, `That is ${cnt} matches.`], meta: { t: 'dat', kind, ask, team: ti, above: t } })
    }
    if (ask === 'highest') {
      return q({ prompt: `${intro}<p>What was the highest number of goals scored by the ${T}?</p>`, diagram, answer: numA(Math.max(...d)), hint: `On the ${ti === 0 ? 'left' : 'right'}-hand side, find the leaf furthest out on the bottom stem that has ${T} leaves.`, steps: [`The ${T}’ highest score is ${Math.max(...d)}.`], meta: { t: 'dat', kind, ask, team: ti } })
    }
    if (ask === 'range') {
      return q({ prompt: `${intro}<p>Find the range of the ${T}’ scores.</p>`, diagram, answer: numA(rangeOf(d)), hint: 'Range = highest − lowest, using one side of the plot only.', steps: [`Range = ${Math.max(...d)} − ${Math.min(...d)} = ${rangeOf(d)}`], meta: { t: 'dat', kind, ask, team: ti, stat: 'range' } })
    }
    const mA = medianOf(A)
    const mB = medianOf(B)
    return q({
      prompt: `${intro}<p>Which team had the greater median?</p>`,
      diagram,
      answer: mcFixedA(teams, mA > mB ? teams[0] : teams[1]),
      hint: 'Find the median of each team separately. On the left side, the leaves read from the stem outwards.',
      steps: [`${teams[0]}: ${A.length} scores, median = ${num(mA)}`, `${teams[1]}: ${B.length} scores, median = ${num(mB)}`, `The ${mA > mB ? teams[0] : teams[1]} had the greater median.`],
      meta: { t: 'dat', kind, ask },
    })
  }
  if (kind === 'missing') {
    // the lowest mark is hidden; the range is given
    for (;;) {
      const lowStem = int(2, 3)
      const low = lowStem * 10 + int(0, 9)
      const rest = Array.from({ length: int(14, 18) }, () => int((lowStem + 1) * 10, 89))
      if (Math.max(...rest) < 80) continue
      const r = Math.max(...rest) - low
      const diagram = stemPlot(rest, { key: 'Key: 5 | 2 = 52 marks', hide: low })
      return q({
        prompt: `<p>This stem-and-leaf plot shows the marks of students in a History exam. The lowest mark is missing (shown as ?). The range of the marks is ${r}. Find the lowest mark.</p>`,
        diagram,
        answer: numA(low),
        hint: 'Range = highest − lowest, so lowest = highest − range.',
        steps: [`Highest mark = ${Math.max(...rest)}`, `Lowest = ${Math.max(...rest)} − ${r} = ${low}`],
        meta: { t: 'dat', kind: 'missingLow', r },
      })
    }
  }
  if (kind === 'decimal') {
    const n = pick([20, 25])
    let data: number[]
    do data = Array.from({ length: n }, () => int(118, 186) / 10)
    while (Math.floor(Math.max(...data)) - Math.floor(Math.min(...data)) < 5)
    const diagram = stemPlot(data, { key: 'Key: 13 | 7 = 13.7 seconds', dec: 1 })
    const intro = `<p>This stem-and-leaf plot shows the times (in seconds) taken by ${n} students to run 100 m.</p>`
    if (chance()) {
      const t = pick(sorted(data).slice(3, n - 3))
      const cnt = data.filter((x) => x < t).length
      return q({ prompt: `${intro}<p>How many students ran the 100 m in less than ${num(t, 1)} seconds?</p>`, diagram, answer: numA(cnt), hint: `Each stem is the whole number of seconds and each leaf is the tenths. Count the times below ${num(t, 1)} (not ${num(t, 1)} itself).`, steps: [`Times below ${num(t, 1)}: ${sorted(data.filter((x) => x < t)).map((x) => num(x, 1)).join(', ')}`, `That is ${cnt} students.`], meta: { t: 'dat', kind, below: t } })
    }
    const t = pick([14, 15, 16])
    const cnt = data.filter((x) => x > t).length
    const pc = (cnt / n) * 100
    return q({ prompt: `${intro}<p>What percentage of the students took more than ${t} seconds?</p>`, diagram, answer: numA(pc), suffix: '%', hint: `Count the times greater than ${t} seconds, then write the count as a percentage of ${n}.`, steps: [`${cnt} of the ${n} times are more than ${t} s.`, `${cnt} ÷ ${n} × 100% = ${num(pc)}%`], calc: true, meta: { t: 'dat', kind, above: t } })
  }
  // unordered plot: find the median
  const c = pick(STEM_CTX)
  const data = shuffle(stemData(c, pick([11, 13, 15, 12, 14])))
  return statQ(`This <b>unordered</b> stem-and-leaf plot shows ${c.about}. (The leaves on each stem are not in order.)`, data, 'median', { diagram: stemPlot(data, { key: c.key, ordered: false }), meta: { kind: 'unordered' } })
}

// ================================================================= 9.03 The shape of a distribution

type Shape = 'symmetrical' | 'positively skewed' | 'negatively skewed' | 'bimodal'
const SHAPES: Shape[] = ['symmetrical', 'positively skewed', 'negatively skewed', 'bimodal']

/** skewness (third standardised moment) of a frequency distribution */
function skewOf(fs: number[]): number {
  const d = expand(seq(0, fs.length), fs)
  const m = meanOf(d)
  const s2 = meanOf(d.map((x) => (x - m) ** 2))
  return meanOf(d.map((x) => (x - m) ** 3)) / s2 ** 1.5
}
/** positions of strict local peaks (a plateau counts once) */
function peaksOf(fs: number[]): number[] {
  const p: number[] = []
  for (let i = 0; i < fs.length; i++) {
    let j = i
    while (j + 1 < fs.length && fs[j + 1] === fs[i]) j++
    const left = i === 0 ? -1 : fs[i - 1]
    const right = j === fs.length - 1 ? -1 : fs[j + 1]
    if (fs[i] > left && fs[i] > right) p.push(i)
    i = j
  }
  return p
}

/** k frequencies, each 1..top, with the given shape */
function shapeFreqs(shape: Shape, k: number, top: number): number[] {
  for (;;) {
    let fs: number[]
    if (shape === 'symmetrical') {
      const h = Math.ceil(k / 2)
      const up = sorted(sample(seq(1, top), h))
      fs = k % 2 ? [...up, ...up.slice(0, -1).reverse()] : [...up, ...up.slice().reverse()]
      if (up[h - 1] < top - 1) continue
    } else if (shape === 'bimodal') {
      const i1 = int(1, 2)
      const i2 = k - 1 - int(1, 2)
      const h1 = int(top - 2, top)
      const h2 = int(top - 2, top)
      fs = seq(0, k).map((i) => Math.max(1, Math.min(top, Math.max(h1 - 3 * Math.abs(i - i1), h2 - 3 * Math.abs(i - i2), 1) + int(-1, 0))))
      fs[i1] = h1
      fs[i2] = h2
      const pk = peaksOf(fs)
      if (pk.length !== 2) continue
      const valley = Math.min(...fs.slice(pk[0] + 1, pk[1]))
      if (valley > Math.min(h1, h2) - 4) continue
    } else {
      const p = int(1, 2)
      const peak = int(top - 1, top)
      const left = sorted(Array.from({ length: p }, () => int(1, peak - 2)))
      const right: number[] = []
      let v = peak
      for (let i = p + 1; i < k; i++) {
        v = Math.max(1, v - int(1, 2))
        right.push(v)
      }
      fs = [...left, peak, ...right]
      if (right[right.length - 1] > 2) continue
      if (shape === 'negatively skewed') fs.reverse()
    }
    if (classify(fs) === shape) return fs
  }
}

/** the shape of a frequency distribution, judged independently of how it was made */
function classify(fs: number[]): Shape | null {
  const pk = peaksOf(fs)
  if (pk.length === 2) {
    const valley = Math.min(...fs.slice(pk[0] + 1, pk[1]))
    if (valley <= Math.min(fs[pk[0]], fs[pk[1]]) - 3) return 'bimodal'
    return null
  }
  if (pk.length !== 1) return null
  if (fs.every((x, i) => x === fs[fs.length - 1 - i])) return 'symmetrical'
  const g = skewOf(fs)
  if (g > 0.45) return 'positively skewed'
  if (g < -0.45) return 'negatively skewed'
  return null
}

const SHAPE_WHY: Record<Shape, string> = {
  symmetrical: 'The two sides are mirror images of each other, with one peak in the middle.',
  'positively skewed': 'The peak is near the lower values and the tail points towards the higher values.',
  'negatively skewed': 'The peak is near the higher values and the tail points towards the lower values.',
  bimodal: 'There are two separate peaks.',
}
const SHAPE_CTX = [
  { axis: 'Score', x0: [5, 12] },
  { axis: 'Number of goals', x0: [0, 0] },
  { axis: 'Waiting time (minutes)', x0: [1, 4] },
  { axis: 'Test mark (out of 20)', x0: [8, 11] },
]

function shape(level: Level): Question {
  if (level === 1) {
    const sh = pick(SHAPES)
    const c = pick(SHAPE_CTX)
    const k = sh === 'symmetrical' ? pick([7, 9]) : int(7, 9)
    const asDots = chance(0.4)
    const fs = shapeFreqs(sh, k, asDots ? 7 : 10)
    const xs = seq(int(c.x0[0], c.x0[1]), k)
    const diagram = asDots ? D.dotPlot(expand(xs, fs), xs[0], xs[k - 1], c.axis) : freqHist(xs, fs, { xLabel: c.axis })
    return q({
      prompt: `<p>Describe the shape of this ${asDots ? 'dot plot' : 'frequency histogram'}.</p>`,
      diagram,
      answer: mcFixedA(SHAPES, sh),
      hint: 'Look at where the peak is and which way the tail points. A tail towards the higher values means positively skewed.',
      steps: [SHAPE_WHY[sh], `The shape is ${sh}.`],
      meta: { t: 'dat', kind: asDots ? 'dotShape' : 'histShape' },
    })
  }
  if (level === 2) {
    const kind = pick(['stemShape', 'outlier', 'cluster', 'cluster'] as const)
    if (kind === 'stemShape') {
      const sh = pick(['symmetrical', 'positively skewed', 'negatively skewed'] as Shape[])
      const k = sh === 'symmetrical' ? 5 : 6
      const rows = shapeFreqs(sh, k, 8)
      const s0 = int(2, 9 - k)
      const data = rows.flatMap((r, i) => Array.from({ length: r }, () => (s0 + i) * 10 + int(0, 9)))
      return q({
        prompt: '<p>This stem-and-leaf plot shows the marks of a Year 9 class in a test. Describe the shape of the distribution.</p>',
        diagram: stemPlot(data, { key: `Key: ${s0 + 1} | 4 = ${(s0 + 1) * 10 + 4}` }),
        answer: mcFixedA(SHAPES, sh),
        hint: 'Turn the plot on its side in your head: the leaves are like columns. The lower values are at the top.',
        steps: [`The numbers of leaves on the stems are ${rows.join(', ')} (from the lowest values to the highest).`, SHAPE_WHY[sh], `The shape is ${sh}.`],
        meta: { t: 'dat', kind },
      })
    }
    // a cluster of values and one outlier, on a dot plot or a stem-and-leaf plot
    if (chance()) {
      const lo = int(8, 14)
      const k = 13
      const xs = seq(lo, k)
      let fs: number[]
      let c0: number
      let outI: number
      for (;;) {
        fs = Array(k).fill(0)
        const low = chance()
        outI = low ? int(0, 1) : int(k - 2, k - 1)
        c0 = low ? int(outI + 5, k - 4) : int(1, outI - 7)
        for (let j = 0; j < 3; j++) fs[c0 + j] = int(4, 6)
        for (const j of [c0 - 2, c0 - 1, c0 + 3, c0 + 4]) if (j >= 0 && j < k && Math.abs(j - outI) > 3) fs[j] = int(0, 2)
        fs[outI] = 1
        const others = fs.map((f, j) => (j !== outI && f > 0 ? j : -1)).filter((j) => j >= 0)
        if (Math.min(...others.map((j) => Math.abs(j - outI))) >= 4) break
      }
      const data = expand(xs, fs)
      const out = xs[outI]
      if (!onlyOutlier(data, out)) return shape(2)
      const diagram = D.dotPlot(data, xs[0], xs[k - 1], 'Score')
      if (kind === 'outlier') {
        return q({ prompt: '<p>This dot plot shows the scores of a group of players in a game. Which score is an outlier?</p>', diagram, answer: numA(out), hint: 'An outlier is separated from the rest of the data by a big gap.', steps: [`${out} is separated from all the other scores by a gap, so it is an outlier.`], meta: { t: 'dat', kind, plot: 'dot' } })
      }
      const opt = (s: number) => `at ${xs[s]}, ${xs[s + 1]} and ${xs[s + 2]}`
      const wrongStarts = shuffle(seq(0, k - 2).filter((s) => Math.abs(s - c0) >= 3)).slice(0, 3)
      return q({ prompt: '<p>This dot plot shows the scores of a group of players in a game. Where does clustering occur?</p>', diagram, answer: mcA(opt(c0), wrongStarts.map(opt)), hint: 'A cluster is a group of values bunched closely together.', steps: [`Most of the dots are bunched together ${opt(c0)}.`], meta: { t: 'dat', kind, plot: 'dot' } })
    }
    for (;;) {
      const k = int(4, 5)
      const s0 = int(1, 9)
      const low = chance()
      // the outlier sits two or more stems away from the rest, with an empty stem in between
      const outStem = low ? s0 - 2 : s0 + k + 1
      if (s0 + k - 1 > 9 || outStem < 1 || outStem > 9) continue
      const counts = Array(k).fill(0)
      const c0 = int(0, k - 2)
      counts[c0] = int(5, 7)
      counts[c0 + 1] = int(5, 7)
      for (let j = 0; j < k; j++) if (j !== c0 && j !== c0 + 1) counts[j] = int(1, 2)
      const out = outStem * 10 + int(0, 9)
      const data = [...counts.flatMap((r, i) => Array.from({ length: r }, () => (s0 + i) * 10 + int(0, 9))), out]
      if (!onlyOutlier(data, out)) continue
      const diagram = stemPlot(data, { key: 'Key: 4 | 6 = 46' })
      const intro = '<p>This stem-and-leaf plot shows the results of an entrance exam.</p>'
      if (kind === 'outlier') return q({ prompt: `${intro}<p>Which score is an outlier?</p>`, diagram, answer: numA(out), hint: 'Look for a value separated from the rest by an empty stem.', steps: [`${out} is separated from the other scores by an empty stem, so it is an outlier.`], meta: { t: 'dat', kind, plot: 'stem' } })
      const lab = (s: number) => `in the ${s * 10}s and ${(s + 1) * 10}s`
      const cl = s0 + c0
      const wrong = shuffle(seq(1, 8).filter((s) => Math.abs(s - cl) >= 2)).slice(0, 3).map(lab)
      return q({ prompt: `${intro}<p>Where does clustering occur?</p>`, diagram, answer: mcA(lab(cl), wrong), hint: 'Look for the stems with the most leaves.', steps: [`The stems ${cl} and ${cl + 1} have the most leaves (${counts[c0]} and ${counts[c0 + 1]}), so the scores are clustered ${lab(cl)}.`], meta: { t: 'dat', kind, plot: 'stem' } })
    }
  }
  const kind = pick(['meanMedian', 'meanMedian', 'range', 'shapeExcl'] as const)
  if (kind === 'meanMedian') {
    const sh = pick(['symmetrical', 'positively skewed', 'negatively skewed'] as Shape[])
    const c = pick(SHAPE_CTX)
    for (;;) {
      const k = sh === 'symmetrical' ? pick([7, 9]) : int(7, 9)
      const fs = shapeFreqs(sh, k, 10)
      const xs = seq(int(c.x0[0], c.x0[1]), k)
      const data = expand(xs, fs)
      const m = meanOf(data)
      const md = medianOf(data)
      // with small whole-number data a skewed shape can still have the mean on the 'wrong' side of the median:
      // only use data where the mean really is pulled towards the tail
      if (sh === 'positively skewed' && m - md < 0.2) continue
      if (sh === 'negatively skewed' && md - m < 0.2) continue
      const opts = ['The mean is greater than the median.', 'The mean is less than the median.', 'The mean and the median are equal.']
      const correct = Math.abs(m - md) < 1e-9 ? opts[2] : m > md ? opts[0] : opts[1]
      return q({
        prompt: '<p>Which statement about the data in this histogram is true?</p>',
        diagram: freqHist(xs, fs, { xLabel: c.axis }),
        answer: mcFixedA(opts, correct),
        hint: 'The mean is pulled towards the tail of a skewed distribution. For a symmetrical distribution, the mean and median are the same.',
        steps: [`The distribution is ${sh}.${sh === 'symmetrical' ? '' : ' The mean is pulled towards the tail.'}`, `Here, mean ${eq(m, 2)} and median = ${num(md)}.`],
        meta: { t: 'dat', kind },
      })
    }
  }
  // stem-and-leaf plots with or without an outlier
  for (;;) {
    const k = 5
    const s0 = int(1, 5)
    const sh = pick(['symmetrical', 'positively skewed', 'negatively skewed'] as Shape[])
    const withOut = kind === 'shapeExcl' || chance()
    const low = chance()
    const outStem = low ? s0 - 3 : s0 + k + 2
    if (withOut && (outStem < 1 || outStem > 9)) continue
    const rows = shapeFreqs(sh, k, 7)
    const body = rows.flatMap((r, i) => Array.from({ length: r }, () => (s0 + i) * 10 + int(0, 9)))
    if (outliersOf(body).length > 0) continue
    const out = outStem * 10 + int(0, 9)
    const data = withOut ? [...body, out] : body
    if (withOut && !onlyOutlier(data, out)) continue
    const diagram = stemPlot(data, { key: 'Key: 7 | 4 = 74' })
    const intro = '<p>This stem-and-leaf plot shows the results of an entrance exam for apprentices.</p>'
    if (kind === 'shapeExcl') {
      return q({
        prompt: `${intro}<p>Describe the shape of the distribution, ignoring the outlier.</p>`,
        diagram,
        answer: mcFixedA(SHAPES, sh),
        hint: 'Cover up the outlier, then look at where the peak is and which way the tail points.',
        steps: [`Without the outlier ${out}, the stems have ${rows.join(', ')} leaves.`, SHAPE_WHY[sh], `The shape is ${sh}.`],
        meta: { t: 'dat', kind },
      })
    }
    const r = rangeOf(data)
    const rb = rangeOf(body)
    const correct = withOut ? `No: the outlier ${out} makes the range (${r}) much larger than the spread of the other scores (${rb}).` : `Yes: there are no outliers, so the range (${r}) gives a fair picture of the spread.`
    const wrong = withOut
      ? ['Yes: the range uses every score, so it always shows the spread well.', 'Yes: outliers do not affect the range.', 'No: the range should be worked out from the median.']
      : ['No: the range is never a good measure of spread.', `No: an outlier makes the range too large.`, 'No: the range should be worked out from the median.']
    return q({
      prompt: `${intro}<p>Is the range a good indicator of the spread of these scores?</p>`,
      diagram,
      answer: mcA(correct, wrong),
      hint: 'Range = highest − lowest. Does one extreme value make it misleading?',
      steps: withOut ? [`Range = ${Math.max(...data)} − ${Math.min(...data)} = ${r}`, `Without ${out}, the range would be ${rb}. The outlier makes the range misleading.`] : [`Range = ${Math.max(...data)} − ${Math.min(...data)} = ${r}`, 'There are no outliers, so the range is a fair measure of the spread.'],
      meta: { t: 'dat', kind, withOut },
    })
  }
}

// ================================================================= 9.04 Comparing data sets

const PAIRS = [
  { a: 'Brooke', b: 'Ryan', what: 'times (in seconds) for swimming 100 m', lo: 5500, hi: 6150, lowGood: true, better: 'faster' },
  { a: 'Mia', b: 'Tom', what: 'times (in seconds) for running 400 m', lo: 5800, hi: 7200, lowGood: true, better: 'faster' },
  { a: 'Priya', b: 'Josh', what: 'distances (in metres) for throwing a discus', lo: 2850, hi: 4100, lowGood: false, better: 'the better thrower' },
]

function compare(level: Level): Question {
  if (level === 1) {
    const p = pick(PAIRS)
    const n = 7
    let A: number[]
    let B: number[]
    for (;;) {
      const shift = int(80, 260) * (chance() ? 1 : -1)
      const base = int(p.lo + 300, p.hi - 300)
      A = Array.from({ length: n }, () => (base + int(-150, 150) + int(-100, 100)) / 100)
      B = Array.from({ length: n }, () => (base + shift + int(-150, 150) + int(-100, 100)) / 100)
      const dm = meanOf(A) - meanOf(B)
      const dmed = medianOf(A) - medianOf(B)
      if (Math.abs(dm) < 0.8 || Math.sign(dm) !== Math.sign(dmed) || Math.abs(dmed) < 0.3) continue
      if (Math.abs(rangeOf(A) - rangeOf(B)) < 0.5) continue
      break
    }
    const table = D.table(['Attempt', p.a, p.b], seq(0, n).map((i) => [i + 1, num(A[i], 2), num(B[i], 2)]))
    const intro = `<p>The table shows the ${p.what} of ${p.a} and ${p.b} over ${n} attempts.</p>`
    const ask = pick(['mean', 'median', 'range', 'better', 'consistent'] as const)
    const who = chance() ? 0 : 1
    const W = who === 0 ? p.a : p.b
    const d = who === 0 ? A : B
    if (ask === 'better') {
      const mA = meanOf(A)
      const mB = meanOf(B)
      const aWins = p.lowGood ? mA < mB : mA > mB
      return q({
        prompt: `${intro}<p>Who is ${p.better}, on average?</p>`,
        diagram: table,
        answer: mcFixedA([p.a, p.b], aWins ? p.a : p.b),
        hint: `Compare the means (or medians). ${p.lowGood ? 'A lower time is faster.' : 'A longer throw is better.'}`,
        steps: [`Mean for ${p.a} ${eq(mA, 2)}, mean for ${p.b} ${eq(mB, 2)}`, `Medians: ${num(medianOf(A), 2)} and ${num(medianOf(B), 2)}`, `${aWins ? p.a : p.b} has the ${p.lowGood ? 'lower' : 'higher'} mean and median, so ${aWins ? p.a : p.b} is ${p.better}.`],
        calc: true,
        meta: { t: 'dat', kind: 'pair', ask, lowGood: p.lowGood },
      })
    }
    if (ask === 'consistent') {
      const rA = rangeOf(A)
      const rB = rangeOf(B)
      return q({
        prompt: `${intro}<p>Who is more consistent?</p>`,
        diagram: table,
        answer: mcFixedA([p.a, p.b], rA < rB ? p.a : p.b),
        hint: 'The more consistent person has results that are closer together: a smaller range.',
        steps: [`Range for ${p.a} = ${num(Math.max(...A), 2)} − ${num(Math.min(...A), 2)} = ${num(rA, 2)}`, `Range for ${p.b} = ${num(Math.max(...B), 2)} − ${num(Math.min(...B), 2)} = ${num(rB, 2)}`, `${rA < rB ? p.a : p.b} has the smaller range, so is more consistent.`],
        meta: { t: 'dat', kind: 'pair', ask },
      })
    }
    const stat = ask as Stat
    const w = statWork(d, stat, 2, 2)
    return q({
      prompt: `${intro}<p>Find the ${stat} for ${W}${stat === 'mean' ? `, ${dpWords(2)}` : ''}.</p>`,
      diagram: table,
      answer: w.answer,
      suffix: p.lowGood ? 's' : 'm',
      hint: HINT[stat],
      steps: w.steps,
      calc: stat === 'mean',
      meta: { t: 'dat', kind: 'pair', ask, who, stat, dp: 2 },
    })
  }
  if (level === 2) {
    if (chance(0.35)) {
      // two dot plots of temperatures
      const cities = pick([
        ['Logan City', 'Wollongong'],
        ['Dubbo', 'Coffs Harbour'],
        ['Broken Hill', 'Newcastle'],
      ])
      let A: number[]
      let B: number[]
      for (;;) {
        const n = int(12, 16)
        A = Array.from({ length: n }, () => int(22, 32))
        B = Array.from({ length: n }, () => Math.min(32, Math.max(20, int(23, 27) + int(-1, 1))))
        if (maxCount(A) > 6 || maxCount(B) > 6 || Math.abs(rangeOf(A) - rangeOf(B)) < 3) continue
        break
      }
      const plots = `<p class="text-sm font-semibold">${cities[0]}</p>${D.dotPlot(A, 20, 33, 'Temperature (°C)')}<p class="text-sm font-semibold">${cities[1]}</p>${D.dotPlot(B, 20, 33, 'Temperature (°C)')}`
      const intro = `<p>The dot plots show the temperatures (in °C) at 3 p.m. in ${cities[0]} and ${cities[1]} on ${A.length} days in autumn.</p>`
      const ask = pick(['consistent', 'range', 'mean'] as const)
      if (ask === 'consistent') {
        const rA = rangeOf(A)
        const rB = rangeOf(B)
        return q({ prompt: `${intro}<p>Which city had more consistent temperatures?</p>`, diagram: plots, answer: mcFixedA(cities, rA < rB ? cities[0] : cities[1]), hint: 'More consistent means the values are closer together: a smaller range.', steps: [`Range for ${cities[0]} = ${Math.max(...A)} − ${Math.min(...A)} = ${rA}`, `Range for ${cities[1]} = ${Math.max(...B)} − ${Math.min(...B)} = ${rB}`, `${rA < rB ? cities[0] : cities[1]} has the smaller range.`], meta: { t: 'dat', kind: 'twoDot', ask } })
      }
      const ci = int(0, 1)
      const d = ci === 0 ? A : B
      const stat: Stat = ask === 'range' ? 'range' : 'mean'
      const w = statWork(d, stat, 2)
      return q({ prompt: `${intro}<p>${stat === 'mean' ? `Find the mean temperature for ${cities[ci]}, ${dpWords(2)}.` : `Find the range of the temperatures for ${cities[ci]}.`}</p>`, diagram: plots, answer: w.answer, suffix: '°C', hint: HINT[stat], steps: w.steps, calc: stat === 'mean', meta: { t: 'dat', kind: 'twoDot', ask, city: ci, stat, dp: 2 } })
    }
    const g = b2bGroups()
    const ask = pick(['median', 'median', 'mean', 'range', 'diff'] as const)
    const gi = int(0, 1)
    const d = gi === 0 ? g.A : g.B
    const intro = `<p>This back-to-back stem-and-leaf plot shows ${g.about}.</p>`
    if (ask === 'diff') {
      const mA = medianOf(g.A)
      const mB = medianOf(g.B)
      return q({ prompt: `${intro}<p>Find the difference between the two medians.</p>`, diagram: g.diagram, answer: numA(clean(Math.abs(mA - mB))), hint: 'Find each median separately, then subtract the smaller from the larger.', steps: [`Median for ${g.names[0]} = ${num(mA)}`, `Median for ${g.names[1]} = ${num(mB)}`, `Difference = ${num(Math.abs(mA - mB))}`], meta: { t: 'dat', kind: 'b2bGroups', ask } })
    }
    const stat = ask as Stat
    const w = statWork(d, stat, 1)
    return q({ prompt: `${intro}<p>Find the ${stat} for ${g.names[gi]}${stat === 'mean' ? `, ${dpWords(1)}` : ''}.</p>`, diagram: g.diagram, answer: w.answer, hint: `Use the ${gi === 0 ? 'left' : 'right'}-hand side only. ${HINT[stat]}${gi === 0 ? ' On the left, the leaves read from the stem outwards.' : ''}`, steps: w.steps, calc: stat === 'mean', meta: { t: 'dat', kind: 'b2bGroups', ask, group: gi, stat, dp: 1 } })
  }
  const kind = pick(['better', 'better', 'shapes', 'days'] as const)
  if (kind === 'days') {
    const cities = pick([
      ['Sydney', 'Adelaide'],
      ['Brisbane', 'Perth'],
      ['Canberra', 'Hobart'],
    ])
    const n = 10
    let A: number[]
    let B: number[]
    do {
      A = Array.from({ length: n }, () => int(190, 340) / 10)
      B = Array.from({ length: n }, () => int(190, 340) / 10)
    } while (A.some((x, i) => x === B[i]))
    const cnt = A.filter((x, i) => x > B[i]).length
    return q({
      prompt: `<p>The table shows the maximum daily temperatures (in °C) in ${cities[0]} and ${cities[1]} over ${n} days in March.</p><p>On how many of these days was ${cities[0]} warmer than ${cities[1]}?</p>`,
      diagram: D.table(['Day', cities[0], cities[1]], seq(0, n).map((i) => [i + 1, num(A[i], 1), num(B[i], 1)])),
      answer: numA(cnt),
      hint: 'Compare the two temperatures for each day, one day at a time.',
      steps: [`${cities[0]} was warmer on day${cnt === 1 ? '' : 's'} ${A.map((x, i) => (x > B[i] ? i + 1 : 0)).filter((x) => x).join(', ') || 'none'}.`, `That is ${cnt} day${cnt === 1 ? '' : 's'}.`],
      meta: { t: 'dat', kind },
    })
  }
  if (kind === 'shapes') {
    for (;;) {
      const shA = pick(['positively skewed', 'negatively skewed', 'symmetrical'] as Shape[])
      const shB = pick((['positively skewed', 'negatively skewed', 'symmetrical'] as Shape[]).filter((s) => s !== shA))
      const k = 5
      const rowsA = shapeFreqs(shA, k, 7)
      const rowsB = shapeFreqs(shB, k, 7)
      const s0 = int(3, 5)
      const A = rowsA.flatMap((r, i) => Array.from({ length: r }, () => (s0 + i) * 10 + int(0, 9)))
      const B = rowsB.flatMap((r, i) => Array.from({ length: r }, () => (s0 + i) * 10 + int(0, 9)))
      const names = ['Class A', 'Class B']
      const opt = (a: Shape, b: Shape) => `Class A is ${a} and Class B is ${b}.`
      const combos: [Shape, Shape][] = []
      for (const a of ['positively skewed', 'negatively skewed', 'symmetrical'] as Shape[]) for (const b of ['positively skewed', 'negatively skewed', 'symmetrical'] as Shape[]) if (a !== b && !(a === shA && b === shB)) combos.push([a, b])
      return q({
        prompt: '<p>This back-to-back stem-and-leaf plot shows the results of two classes in the same test. Compare the shapes of the two distributions.</p>',
        diagram: stemPlot2(A, B, names[0], names[1], `Key: 2 | 5 | 8 means 52 for Class A and 58 for Class B`),
        answer: mcA(opt(shA, shB), shuffle(combos).slice(0, 3).map(([a, b]) => opt(a, b))),
        hint: 'Count the leaves on each stem for each class. A tail towards the higher values means positively skewed.',
        steps: [`Class A leaves per stem: ${rowsA.join(', ')}: ${shA}.`, `Class B leaves per stem: ${rowsB.join(', ')}: ${shB}.`],
        meta: { t: 'dat', kind },
      })
    }
  }
  // which group performed better?
  for (;;) {
    const g = b2bGroups(true)
    const mA = meanOf(g.A)
    const mB = meanOf(g.B)
    const dA = medianOf(g.A)
    const dB = medianOf(g.B)
    if (Math.sign(mA - mB) !== Math.sign(dA - dB) || Math.abs(mA - mB) < 4 || Math.abs(dA - dB) < 4) continue
    const [W, L] = mA > mB ? [0, 1] : [1, 0]
    const ms = [mA, mB]
    const ds = [dA, dB]
    // short, one-line options: the calculator shares the column with them on a laptop screen
    const correct = `${g.names[W]}: the mean (${num(round(ms[W], 1), 1)}) and median (${num(ds[W])}) are both higher.`
    const wrong = [`${g.names[L]}: the range of the results is larger.`, `${g.names[L]}: there are more results on that side.`, 'Neither: the lowest results are about the same.']
    return q({
      prompt: `<p>This back-to-back stem-and-leaf plot shows ${g.about}.</p><p>Which group performed better? Choose the best reason.</p>`,
      diagram: g.diagram,
      answer: mcA(correct, wrong),
      hint: 'Compare a measure of centre (the mean or the median) for the two groups. The range measures spread, not how well a group did.',
      steps: [`${g.names[0]}: mean ${eq(mA, 1)}, median = ${num(dA)}`, `${g.names[1]}: mean ${eq(mB, 1)}, median = ${num(dB)}`, `${g.names[W]} has the higher mean and median, so performed better.`],
      meta: { t: 'dat', kind },
    })
  }
}

/** two groups of exam results or heights, shown in a back-to-back stem-and-leaf plot */
function b2bGroups(resultsOnly = false): { A: number[]; B: number[]; names: [string, string]; about: string; diagram: string } {
  const all = [
    { names: ['Girls', 'Boys'] as [string, string], about: 'the results of a Year 9 class in a Health exam', lo: 20, hi: 98, key: 'Key: 3 | 6 | 2 means 63 for a girl and 62 for a boy' },
    { names: ['Test 1', 'Test 2'] as [string, string], about: 'the results of a class in two trigonometry tests', lo: 30, hi: 98, key: 'Key: 4 | 7 | 5 means 74 in Test 1 and 75 in Test 2' },
    { names: ['Girls', 'Boys'] as [string, string], about: 'the heights (in cm) of the students in a Year 9 class', lo: 131, hi: 182, key: 'Key: 3 | 15 | 6 means 153 cm for a girl and 156 cm for a boy' },
  ]
  // "which group performed better?" only makes sense for exam results, not heights
  const c = pick(resultsOnly ? all.slice(0, 2) : all)
  const span = c.hi - c.lo
  const make = (centre: number) =>
    Array.from({ length: int(12, 18) }, () => Math.min(c.hi, Math.max(c.lo, Math.round(centre + (int(-10, 10) + int(-10, 10)) * span / 60))))
  const shift = Math.round(span * (int(10, 25) / 100)) * (chance() ? 1 : -1)
  const mid = Math.round(c.lo + span / 2)
  const A = make(mid + shift / 2)
  const B = make(mid - shift / 2)
  return { A, B, names: c.names, about: c.about, diagram: stemPlot2(A, B, c.names[0], c.names[1], c.key) }
}

// ================================================================= 9.05 Types of data (core, MA4-DAT-C-01)

type Kind4 = 'nominal' | 'ordinal' | 'discrete' | 'continuous'
const TYPES: [string, Kind4][] = [
  ['the colours of the cars in a car park', 'nominal'],
  ['the types of pets that students own', 'nominal'],
  ['students’ favourite sports', 'nominal'],
  ['the countries of birth of people living in Australia', 'nominal'],
  ['the flavours of ice-cream sold at a shop', 'nominal'],
  ['the computer games played by students', 'nominal'],
  ['the month in which each student was born', 'ordinal'],
  ['school report grades (A, B, C, D, E)', 'ordinal'],
  ['T-shirt sizes (S, M, L, XL)', 'ordinal'],
  ['the belt colour (grade) of each student at a taekwondo club', 'ordinal'],
  ['finishing places in a race (1st, 2nd, 3rd, …)', 'ordinal'],
  ['how satisfied customers are (very unhappy, unhappy, happy, very happy)', 'ordinal'],
  ['the number of people absent from school today', 'discrete'],
  ['the number of goals scored in each soccer match', 'discrete'],
  ['the number of pets in each household', 'discrete'],
  ['people’s shoe sizes', 'discrete'],
  ['the age each student turns this year', 'discrete'],
  ['the number of text messages a person sends in a day', 'discrete'],
  ['the number of views of an online video', 'discrete'],
  ['the time taken to swim 100 m', 'continuous'],
  ['the temperature in Alice Springs during a day', 'continuous'],
  ['the masses of newborn babies', 'continuous'],
  ['the heights of the students in Year 9', 'continuous'],
  ['the distance travelled by a car on a trip', 'continuous'],
  ['the amount of rainfall in a month', 'continuous'],
  ['the amount of petrol bought when filling up a car', 'continuous'],
  ['the speed of a car passing through an intersection', 'continuous'],
]
const BIG: Record<Kind4, 'categorical' | 'numerical'> = { nominal: 'categorical', ordinal: 'categorical', discrete: 'numerical', continuous: 'numerical' }
const WHY: Record<Kind4, string> = {
  nominal: 'The data are categories (words or labels) that cannot be put in order: nominal categorical data.',
  ordinal: 'The data are categories that can be put in order: ordinal categorical data.',
  discrete: 'The data are numbers that are counted, with gaps between the possible values: discrete numerical data.',
  continuous: 'The data are numbers that are measured on a smooth scale, with no gaps: continuous numerical data.',
}
const FULL = ['categorical, nominal', 'categorical, ordinal', 'numerical, discrete', 'numerical, continuous']
const fullOf = (k: Kind4) => `${BIG[k]}, ${k}`

function types(level: Level): Question {
  const [item, k] = pick(TYPES)
  if (level === 1) {
    return q({
      prompt: `<p>Is this categorical data or numerical data?</p><p class="text-lg"><b>${item}</b></p>`,
      answer: mcFixedA(['categorical', 'numerical'], BIG[k]),
      hint: 'Categorical data are words or categories. Numerical data are numbers that are counted or measured.',
      steps: [WHY[k]],
      meta: { t: 'dat', kind: 'type1', item, k },
    })
  }
  if (level === 2) {
    const opts = BIG[k] === 'numerical' ? ['discrete', 'continuous'] : ['nominal', 'ordinal']
    return q({
      prompt: `<p>This is ${BIG[k]} data. Is it ${opts[0]} or ${opts[1]}?</p><p class="text-lg"><b>${item}</b></p>`,
      answer: mcFixedA(opts, k),
      hint: BIG[k] === 'numerical' ? 'Discrete data are counted (separate values). Continuous data are measured (any value on a scale).' : 'Ordinal categories have a natural order. Nominal categories do not.',
      steps: [WHY[k]],
      meta: { t: 'dat', kind: 'type2', item, k },
    })
  }
  if (chance()) {
    return q({
      prompt: `<p>Classify this data.</p><p class="text-lg"><b>${item}</b></p>`,
      answer: mcFixedA(FULL, fullOf(k)),
      hint: 'First decide: categories or numbers? Then: can the categories be ordered? Are the numbers counted or measured?',
      steps: [WHY[k]],
      meta: { t: 'dat', kind: 'type3', item, k },
    })
  }
  // which of these is ___ data?
  const want = pick(['nominal', 'ordinal', 'discrete', 'continuous'] as Kind4[])
  const opts = (['nominal', 'ordinal', 'discrete', 'continuous'] as Kind4[]).map((kk) => pick(TYPES.filter((t) => t[1] === kk))[0])
  const correct = opts[['nominal', 'ordinal', 'discrete', 'continuous'].indexOf(want)]
  return q({
    prompt: `<p>Which of these is <b>${want} ${BIG[want]}</b> data?</p>`,
    answer: mcA(correct, opts.filter((o) => o !== correct)),
    hint: 'Decide what type each option is.',
    steps: [`${correct}: ${WHY[want].charAt(0).toLowerCase() + WHY[want].slice(1)}`],
    meta: { t: 'dat', kind: 'type4', want, correct },
  })
}

// ================================================================= 9.05 Census and sampling (Path, MA5-DAT-P-01)

const CENSUS: [string, 'a census' | 'a sample', string][] = [
  ['finding how many students in your class walk to school', 'a census', 'The class is small, so everyone can easily be asked.'],
  ['finding the heights of the players in a basketball team', 'a census', 'There are only a few players, so they can all be measured.'],
  ['counting the number of people living in Australia', 'a census', 'Accurate figures are needed for the whole population (this is what the national census does).'],
  ['finding how many staff at a small business drive to work', 'a census', 'It is a small group, so everyone can be asked.'],
  ['finding the number of students enrolled at your school', 'a census', 'The school has a record of every student, so all can be counted.'],
  ['testing how long a brand of AA battery lasts', 'a sample', 'Testing uses up the batteries, so only some can be tested.'],
  ['checking the quality of a batch of tinned soup', 'a sample', 'Each tin has to be opened to check it, so only some tins can be checked.'],
  ['finding Australians’ opinions on public transport', 'a sample', 'The population is too large: asking everyone would cost too much and take too long.'],
  ['finding the average height of 14-year-olds in Australia', 'a sample', 'There are far too many 14-year-olds to measure them all.'],
  ['testing the water quality of Sydney Harbour', 'a sample', 'It is impossible to test all of the water.'],
  ['testing the safety of a new car model in crash tests', 'a sample', 'Crash tests destroy the cars, so only a few can be tested.'],
  ['finding the most popular car colour in NSW', 'a sample', 'There are millions of cars: too many to check them all.'],
]

function census(level: Level): Question {
  if (level === 1) {
    const [inv, ans, why] = pick(CENSUS)
    return q({
      prompt: `<p>Should a census or a sample be used for this investigation?</p><p class="text-lg"><b>${inv.charAt(0).toUpperCase() + inv.slice(1)}</b></p>`,
      answer: mcFixedA(['a census', 'a sample'], ans),
      hint: 'A census surveys the whole population. Use a sample when the population is too large, or when testing destroys the items.',
      steps: [why, `Use ${ans}.`],
      meta: { t: 'dat', kind: 'census', inv, ans },
    })
  }
  if (level === 2) {
    const years = [7, 8, 9, 10, 11, 12]
    for (;;) {
      const counts = years.map((y) => (y >= 11 ? int(110, 145) : int(140, 175)))
      const total = sum(counts)
      const S = pick([50, 80, 100, 120])
      const yi = int(0, 5)
      const exact = (S * counts[yi]) / total
      if (Math.abs((exact % 1) - 0.5) < 0.08) continue
      const table = D.table(['Year', 'Students'], years.map((y, i) => [y, counts[i]]))
      const intro = `<p>The table shows the number of students in each year at a high school.</p>`
      if (chance()) {
        return q({
          prompt: `${intro}<p>A sample of ${S} students is to be surveyed, with each year represented in proportion to its size. How many students should be chosen from Year ${years[yi]}? (Round to the nearest whole number.)</p>`,
          diagram: table,
          answer: numA(Math.round(exact)),
          hint: `Year ${years[yi]}’s share of the sample = (Year ${years[yi]} students ÷ total students) × ${S}.`,
          steps: [`Total students = ${counts.join(' + ')} = ${num(total)}`, `${counts[yi]} ÷ ${num(total)} × ${S} ${eq(exact, 2)} ≈ ${Math.round(exact)}`],
          calc: true,
          meta: { t: 'dat', kind: 'strat', S, yi },
        })
      }
      const pc = (counts[yi] / total) * 100
      return q({
        prompt: `${intro}<p>What percentage of the school’s students are in Year ${years[yi]}? (Correct to 1 decimal place.)</p>`,
        diagram: table,
        answer: numA(pc, 1),
        suffix: '%',
        hint: 'Percentage = (students in the year ÷ total students) × 100%.',
        steps: [`Total students = ${counts.join(' + ')} = ${num(total)}`, `${counts[yi]} ÷ ${num(total)} × 100% ${eq(pc, 1)}%`],
        calc: true,
        meta: { t: 'dat', kind: 'pct', yi },
      })
    }
  }
  const [inv, , why] = pick(CENSUS.filter((c) => c[1] === 'a sample'))
  return q({
    prompt: `<p>Why should a sample, not a census, be used for this investigation?</p><p class="text-lg"><b>${inv.charAt(0).toUpperCase() + inv.slice(1)}</b></p>`,
    answer: mcA(why, ['A sample is always more accurate than a census.', 'A census can only be used for categorical data.', 'A sample is needed whenever the data are numbers.']),
    hint: 'Think about the size of the population, the cost and time, and whether testing destroys the items.',
    steps: [why],
    meta: { t: 'dat', kind: 'why', inv },
  })
}

// ================================================================= 9.06 Bias and questionnaires (Path, MA5-DAT-P-01)

const METHODS: [string, string, 'representative' | 'biased', string][] = [
  ['students’ views on a new school uniform', 'drawing 100 names from a box that holds the name of every student at the school', 'representative', 'Every student has the same chance of being chosen.'],
  ['students’ views on a new school uniform', 'using a random number generator to choose 50 students from the school roll', 'representative', 'Every student on the roll has the same chance of being chosen.'],
  ['members’ views on new opening hours at a sports club', 'numbering every member and choosing 40 numbers at random', 'representative', 'Every member has the same chance of being chosen.'],
  ['students’ views on a new school uniform', 'asking the students in the school’s netball teams', 'biased', 'Netball players do not represent the whole school (for example, other year groups and other sports).'],
  ['how students travel to school', 'surveying the first 30 students to arrive at school', 'biased', 'Students who arrive later (for example, on a late bus) have no chance of being chosen.'],
  ['students’ views on the canteen menu', 'asking 20 students from your own maths class', 'biased', 'One class does not represent the other classes and year groups.'],
  ['the types of music people listen to', 'surveying people at a rock concert', 'biased', 'People at a rock concert are more likely to prefer rock music.'],
  ['how much time teenagers spend on homework', 'surveying people at a football match', 'biased', 'Most people at a football match are not teenagers, and those who are may spend less time on homework.'],
  ['people’s views on alternative fuels', 'surveying people at a car show', 'biased', 'People at a car show are likely to be car enthusiasts with strong views about fuel.'],
]
const BIASED: [string, string][] = [
  ['Teenagers’ views on road safety are investigated by surveying a sample of online gamers.', 'Online gamers do not represent all teenagers.'],
  ['A café asks customers to fill in a feedback form and post it back.', 'Only customers with strong feelings (very happy or very unhappy) are likely to post the form back.'],
  ['A factory surveys a sample of its executives about safety in the workplace.', 'Executives do not do the factory-floor jobs where most of the safety risks are.'],
  ['Audience members at a movie premiere are surveyed about their views on the film.', 'People at a premiere are likely to be fans of the film or connected to it.'],
  ['A radio station that plays classic hits asks its listeners to vote for the best song of the year.', 'Its listeners mostly like older music, so they do not represent all music listeners.'],
  ['A survey about violence in sport is taken at a boxing match.', 'People at a boxing match are likely to accept violence in sport more than most people.'],
]
const QUESTIONS: [string, string][] = [
  ['How much time do you spend studying?', 'vague'],
  ['How often do you exercise?', 'vague'],
  ['What do you do in the holidays?', 'vague'],
  ['Don’t you agree that the canteen food is too expensive?', 'leading'],
  ['How much did you enjoy your delicious meal at our restaurant?', 'leading'],
  ['Most people think school should start later. Do you agree?', 'leading'],
  ['What is your family’s income?', 'personal'],
  ['What is your home address and phone number?', 'personal'],
  ['Do you like playing and watching sport?', 'double'],
  ['Do you eat fruit and vegetables every day?', 'double'],
  ['Is the library quiet and well organised?', 'double'],
]
const PROBLEM: Record<string, string> = {
  vague: 'It is too vague or open-ended.',
  leading: 'It is a leading question: it pushes people towards one answer.',
  personal: 'It asks for information that is too personal.',
  double: 'It asks about two things at once.',
}

function bias(level: Level): Question {
  if (level === 1) {
    const [topic, method, ans, why] = pick(METHODS)
    return q({
      prompt: `<p>A survey investigates ${topic}. Will this method give a representative sample or a biased sample?</p><p class="text-lg"><b>${method.charAt(0).toUpperCase() + method.slice(1)}</b></p>`,
      answer: mcFixedA(['representative', 'biased'], ans),
      hint: 'A sample is representative when every member of the population has an equal chance of being chosen.',
      steps: [why, `The sample is ${ans}.`],
      meta: { t: 'dat', kind: 'method', ans },
    })
  }
  if (level === 2) {
    const [sit, why] = pick(BIASED)
    return q({
      prompt: `<p>${sit} Why is this sample biased?</p>`,
      answer: mcA(why, ['The sample is too large.', 'Every person had an equal chance of being chosen.', 'A survey cannot be biased if people answer honestly.']),
      hint: 'Ask: who is more likely (or less likely) to be in this sample than in the whole population?',
      steps: [why],
      meta: { t: 'dat', kind: 'why' },
    })
  }
  const [question, prob] = pick(QUESTIONS)
  return q({
    prompt: `<p>What is wrong with this survey question?</p><p class="text-lg"><b>‘${question}’</b></p>`,
    answer: mcFixedA(Object.values(PROBLEM), PROBLEM[prob]),
    hint: 'Good survey questions are clear and precise, ask for one thing, do not push people towards an answer, and are not too personal.',
    steps: [PROBLEM[prob]],
    meta: { t: 'dat', kind: 'question', prob },
  })
}

// ================================================================= Power plus (grouped data)

const CLASSES = [16, 22, 28, 34, 40, 46]
const clab = (lo: number) => `${lo}–${lo + 5}`

function powerPlus(level: Level): Question {
  if (level === 3) {
    for (;;) {
      const data = Array.from({ length: int(28, 34) }, () => int(17, 49))
      const lo = pick(CLASSES)
      const cnt = data.filter((x) => x >= lo && x <= lo + 5).length
      if (cnt < 2) continue
      return q({
        prompt: `<p>The numbers of yoghurts sold each day in a school canteen were:</p>${list(data)}<p>The data are grouped into the classes 16–21, 22–27, 28–33, 34–39, 40–45 and 46–51. What is the frequency of the class ${clab(lo)}?</p>`,
        answer: numA(cnt),
        hint: `Count the values from ${lo} to ${lo + 5}, including both ends.`,
        steps: [`Values from ${lo} to ${lo + 5}: ${sorted(data.filter((x) => x >= lo && x <= lo + 5)).join(', ')}`, `Frequency = ${cnt}`],
        meta: { t: 'dat', kind: 'classCount', lo },
      })
    }
  }
  for (;;) {
    const fs = CLASSES.map(() => int(2, 11))
    const N = sum(fs)
    const table = D.table(['Class interval', 'Frequency'], CLASSES.map((c, i) => [clab(c), fs[i]]))
    if (level === 1) {
      const t = topIndex(fs)
      if (t < 0) continue
      return q({
        prompt: '<p>The table shows the numbers of yoghurts sold each day in a school canteen, grouped into classes. What is the modal class?</p>',
        diagram: table,
        answer: mcA(clab(CLASSES[t]), shuffle(CLASSES.filter((_, i) => i !== t)).slice(0, 3).map(clab)),
        hint: 'The modal class is the class with the highest frequency.',
        steps: [`The highest frequency is ${fs[t]}, for the class ${clab(CLASSES[t])}.`],
        meta: { t: 'dat', kind: 'modal' },
      })
    }
    const cum = fs.map((_, i) => sum(fs.slice(0, i + 1)))
    const pos = N % 2 ? [(N + 1) / 2] : [N / 2, N / 2 + 1]
    const cls = pos.map((p) => cum.findIndex((c) => c >= p))
    if (cls[0] !== cls[cls.length - 1]) continue
    const mi = cls[0]
    return q({
      prompt: '<p>The table shows the numbers of yoghurts sold each day in a school canteen. Add a cumulative frequency column and find the median class.</p>',
      diagram: table,
      answer: mcA(clab(CLASSES[mi]), shuffle(CLASSES.filter((_, i) => i !== mi)).slice(0, 3).map(clab)),
      hint: 'Find the position of the middle value, then use the cumulative frequencies to see which class it falls in.',
      steps: [`Cumulative frequencies: ${cum.join(', ')} (${N} days)`, N % 2 ? `The median is the ${ordinal(pos[0])} value.` : `The median is halfway between the ${ordinal(pos[0])} and ${ordinal(pos[1])} values.`, `${pos.length === 1 ? 'It is' : 'Both are'} in the class ${clab(CLASSES[mi])}.`],
      meta: { t: 'dat', kind: 'medianClass' },
    })
  }
}

// ================================================================= topic test and skills

const T = (skill: string, level: Level, gen: () => Question): TestItem => ({ skill, level, gen: () => gen() })

export const NCM9_TEST: TestItem[] = [
  // about two per core exercise (12 in all), in the order of Test Yourself 9; the Path work (9.05 sampling, 9.06) is left out
  T('y9-dat-centre', 1, () => centre(1)),
  T('y9-dat-centre', 2, () => centre(2)),
  T('y9-dat-centre', 3, () => centre(3)),
  T('y9-dat-displays', 1, () => displays(1)),
  T('y9-dat-displays', 2, () => displays(2)),
  T('y9-dat-displays', 3, () => displays(3)),
  T('y9-dat-shape', 1, () => shape(1)),
  T('y9-dat-shape', 2, () => shape(2)),
  T('y9-dat-compare', 2, () => compare(2)),
  T('y9-dat-compare', 3, () => compare(3)),
  T('y9-dat-types', 2, () => types(2)),
  T('y9-dat-types', 3, () => types(3)),
]

export const NCM9_SKILLS: Skill[] = [
  {
    id: 'y9-dat-centre',
    title: 'Mean, median, mode and range',
    ref: ref('9.01'),
    outcomes: C2,
    summary: 'Measures of centre and spread from lists, dot plots and frequency tables; outliers; missing values.',
    learn: {
      intro: '<p>The <b>mean</b>, <b>median</b> and <b>mode</b> are measures of centre. The <b>range</b> is a measure of spread.</p><div class="big">mean = sum of values ÷ number of values</div><p>For a frequency table, mean = Σ<i>fx</i> ÷ Σ<i>f</i>.</p>',
      keyPoints: [
        'Median: the middle value when the values are in order (or halfway between the two middle values).',
        'Mode: the most common value. Range = highest − lowest.',
        'An <b>outlier</b> is a value much higher or lower than the rest. It pulls the mean towards it but hardly changes the median, so the median is better when there are outliers.',
        'The mode is useful when the most common value matters (for example, which shoe size to stock).',
      ],
      vocab: [
        ['outlier', 'a value far away from the rest of the data'],
        ['cumulative frequency', 'a running total of the frequencies'],
      ],
    },
    gen: centre,
    levels: { 1: 'Mean, median, mode and range of a list', 2: 'Dot plots, negatives and decimals, outliers, the best measure, Σfx ÷ Σf', 3: 'A missing value from the mean; median from cumulative frequency' },
  },
  {
    id: 'y9-dat-displays',
    title: 'Histograms and stem-and-leaf plots',
    ref: ref('9.02'),
    outcomes: C12,
    summary: 'Read frequency histograms, polygons and stem-and-leaf plots (including back-to-back plots).',
    learn: {
      intro: '<p>A <b>frequency histogram</b> is a column graph with no gaps between the columns, each centred on its value. A <b>frequency polygon</b> joins the midpoints of the tops of the columns, starting and ending on the horizontal axis.</p><p>In a <b>stem-and-leaf plot</b>, the stem is usually the tens digit and the leaf is the units digit. The key tells you how to read it.</p>',
      keyPoints: ['Each leaf is one value: count the leaves to find how many values there are.', 'In a back-to-back plot, the leaves on the left read outwards from the stem: 4 | 3 means 34.', 'Use the frequencies from a graph exactly as you would use a frequency table.'],
      vocab: [
        ['frequency polygon', 'a line graph joining the midpoints of the tops of the columns of a histogram'],
        ['back-to-back stem-and-leaf plot', 'two data sets sharing one stem, one on each side'],
      ],
    },
    gen: displays,
    levels: { 1: 'Reading frequencies, totals, highest and lowest values', 2: 'Mean and median from a histogram, polygon or stem-and-leaf plot', 3: 'Back-to-back plots, a missing value, decimal stems, unordered plots' },
  },
  {
    id: 'y9-dat-shape',
    title: 'The shape of a distribution',
    ref: ref('9.03'),
    outcomes: C2,
    summary: 'Symmetrical, skewed and bimodal distributions; outliers and clusters; mean versus median.',
    learn: {
      intro: '<p>A distribution is <b>symmetrical</b> if its two halves are mirror images, <b>positively skewed</b> if its tail points towards the higher values, <b>negatively skewed</b> if its tail points towards the lower values, and <b>bimodal</b> if it has two peaks.</p>',
      keyPoints: ['A <b>cluster</b> is a group of values bunched closely together.', 'For a symmetrical distribution, the mean and median are equal.', 'For a skewed distribution, the mean is pulled towards the tail, further than the median.'],
      vocab: [
        ['skewed', 'lopsided, with a long tail on one side'],
        ['bimodal', 'having two peaks'],
      ],
    },
    gen: shape,
    levels: { 1: 'The shape of a histogram or dot plot', 2: 'Stem-and-leaf shapes; outliers and clusters', 3: 'Mean versus median; is the range a good measure?' },
  },
  {
    id: 'y9-dat-compare',
    title: 'Comparing data sets',
    ref: ref('9.04'),
    outcomes: C2,
    summary: 'Compare two data sets using their means, medians, ranges and shapes.',
    learn: {
      intro: '<p>To compare two data sets, compare a measure of centre (mean or median) to see which is generally higher, and a measure of spread (range) to see which is more consistent.</p>',
      keyPoints: ['The smaller the range, the more consistent the results.', 'Justify a comparison with numbers: “Group A’s mean (70.3) is higher than Group B’s (55.9).”', 'For times, lower is faster.'],
    },
    gen: compare,
    levels: { 1: 'Two lists: mean, median, range; who is better or more consistent', 2: 'Back-to-back stem-and-leaf plots and two dot plots', 3: 'Which group did better and why; comparing shapes; paired data' },
  },
  {
    id: 'y9-dat-types',
    title: 'Types of data',
    ref: ref('9.05'),
    outcomes: C1,
    summary: 'Categorical (nominal or ordinal) and numerical (discrete or continuous) data.',
    learn: {
      intro: '<p><b>Categorical</b> data are words or categories: <b>nominal</b> if they cannot be ordered (car colour), <b>ordinal</b> if they can (school grades).</p><p><b>Numerical</b> data are numbers: <b>discrete</b> if they are counted, with gaps between values (number of pets), <b>continuous</b> if they are measured on a smooth scale (height).</p>',
      keyPoints: ['Ask first: words or numbers? Then: ordered? counted or measured?', 'Shoe sizes and the age you turn this year are discrete: only separate values are possible.'],
      vocab: [
        ['nominal', 'categories with no order'],
        ['ordinal', 'categories with a natural order'],
        ['discrete', 'counted: separate values only'],
        ['continuous', 'measured: any value on a scale'],
      ],
    },
    gen: types,
    levels: { 1: 'Categorical or numerical', 2: 'Nominal or ordinal; discrete or continuous', 3: 'Full classification' },
  },
  {
    id: 'y9-dat-census',
    title: 'Census and samples (Path)',
    ref: 'NCM 9 Ex 9.05 (Path)',
    tag: 'extension',
    outcomes: P1,
    summary: 'Choose a census or a sample; choose a sample in proportion to the population.',
    learn: {
      intro: '<p>The <b>population</b> is everyone or everything being studied. A <b>census</b> surveys the whole population; a <b>sample</b> surveys part of it.</p><p>A sample should be random, unbiased and large enough to represent the population.</p>',
      keyPoints: ['This is Path content (MA5-DAT-P-01), beyond the core course.', 'Use a sample when the population is too large, a census would cost too much, or testing destroys the items.', 'A sample in proportion: (group size ÷ population) × sample size.'],
    },
    gen: census,
    levels: { 1: 'Census or sample?', 2: 'Proportions of a population', 3: 'Why a sample?' },
  },
  {
    id: 'y9-dat-bias',
    title: 'Bias and questionnaires (Path)',
    ref: 'NCM 9 Ex 9.06 (Path)',
    tag: 'extension',
    outcomes: P1,
    summary: 'Recognise biased samples and poorly worded survey questions.',
    learn: {
      intro: '<p>A sample is <b>biased</b> if some members of the population are more likely to be chosen than others, so it does not represent the population.</p><p>Survey questions should be clear and precise, ask for one piece of information, not push people towards an answer, and not be too personal.</p>',
      keyPoints: ['This is Path content (MA5-DAT-P-01), beyond the core course.', 'Random sampling (names from a hat, random numbers) avoids bias.'],
      vocab: [
        ['biased', 'not representative of the population'],
        ['leading question', 'a question worded to push people towards one answer'],
      ],
    },
    gen: bias,
    levels: { 1: 'Representative or biased?', 2: 'Why is this sample biased?', 3: 'What is wrong with this survey question?' },
  },
  {
    id: 'y9-dat-powerplus',
    title: 'Power plus: grouped data',
    ref: 'NCM 9 Power plus 9',
    tag: 'extension',
    outcomes: C12,
    summary: 'Group data into classes; the modal class and the median class.',
    learn: {
      intro: '<p>Large data sets can be grouped into <b>class intervals</b> such as 16–21, 22–27, … The <b>modal class</b> has the highest frequency. The <b>median class</b> holds the middle value.</p>',
      keyPoints: ['Each class includes both of its end values.', 'Use cumulative frequencies to find the median class.'],
    },
    gen: powerPlus,
    levels: { 1: 'Modal class', 2: 'Median class', 3: 'Grouping raw data' },
  },
]
