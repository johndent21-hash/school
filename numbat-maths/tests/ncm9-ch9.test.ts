// Independent checks for Year 9 Analysing data (New Century Maths 9, Chapter 9).
//  - Every number is read back from what the student sees: the data list, the table, the dots of a dot plot, the
//    columns of a histogram (measured against its own frequency axis), the points of a frequency polygon, and the
//    leaves of a stem-and-leaf plot (decoded with the plot's own key). The statistic asked for is read from the words.
//  - Means, medians, modes, ranges, shapes, outliers, clusters and classifications are re-worked here with separately
//    written code (means are rounded with whole-number arithmetic, not floating point).
//  - Displays are checked for honesty: dots on the ticks and evenly stacked; columns touching, with a half-column gap
//    at the start and their tops on the frequency scale; polygon ends on the axis one score either side; every stem
//    shown; leaves in order unless the words say the plot is unordered; back-to-back keys read both ways.
// Usage: npx tsx tests/ncm9-ch9.test.ts   (N per skill and level, default 400)
import { setSeed } from '../src/lib/maths/rand'
import { answerText, checkAnswer } from '../src/lib/maths/check'
import type { Level, Question } from '../src/lib/maths/types'
import { NCM9_SKILLS, NCM9_TEST } from '../src/content/y9-ncm9'
import { findTopic } from '../src/content/index'

const N = Number(process.env.N ?? 400)
let failures = 0
let independent = 0
const counts: Record<string, number> = {}
const strip = (h: string) =>
  h
    .replace(/<[^>]*>/g, ' ')
    .replace(/&ensp;|&emsp;|&nbsp;/g, ' ')
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
const fail = (id: string, msg: string, qn?: Question) => {
  failures++
  if (failures <= Number(process.env.SHOW ?? 40)) console.log(`FAIL ${id}: ${msg}` + (qn ? `\n   ${strip(qn.prompt).slice(0, 300)}\n   answer ${JSON.stringify(qn.answer).slice(0, 200)}` : ''))
}
class Bad extends Error {}
const bad = (m: string): never => {
  throw new Bad(m)
}
const numOf = (s: string) => {
  const x = Number(s.replace(/−/g, '-').replace(/\s/g, ''))
  if (!Number.isFinite(x)) bad(`unreadable number “${s}”`)
  return x
}

// ---------------------------------------------------------------- exact arithmetic

/** values with at most 2 decimal places, as whole numbers of hundredths */
const hund = (x: number) => Math.round(x * 100)
/** round p/q (q > 0) to dp places, halves away from zero, using whole numbers only */
function roundFrac(p: number, q: number, dp: number): number {
  const k = 10 ** dp
  const a = Math.abs(p) * k
  const r = Math.floor((2 * a + q) / (2 * q))
  return (Math.sign(p) * r) / k
}
const meanRounded = (v: number[], dp: number) => roundFrac(v.reduce((s, x) => s + hund(x), 0), 100 * v.length, dp)
const meanExact = (v: number[]) => v.reduce((s, x) => s + hund(x), 0) / (100 * v.length)
function median(v: number[]): number {
  const s = v.slice().sort((a, b) => a - b)
  const n = s.length
  return n % 2 ? s[(n - 1) / 2] : (hund(s[n / 2 - 1]) + hund(s[n / 2])) / 200
}
function mode(v: number[]): number | null {
  const c = new Map<number, number>()
  for (const x of v) c.set(x, (c.get(x) ?? 0) + 1)
  let best: number | null = null
  let bc = 0
  let tie = false
  for (const [x, k] of c) {
    if (k > bc) [best, bc, tie] = [x, k, false]
    else if (k === bc) tie = true
  }
  return tie || bc < 2 ? null : best
}
const range = (v: number[]) => (hund(Math.max(...v)) - hund(Math.min(...v))) / 100

/** an end value whose gap to its neighbour is ≥ 4 and at least twice every other gap */
function outliers(v: number[]): number[] {
  const s = v.slice().sort((a, b) => a - b)
  const gaps: number[] = []
  for (let i = 1; i < s.length; i++) gaps.push(s[i] - s[i - 1])
  const res: number[] = []
  const rest = (skip: number) => Math.max(...gaps.filter((_, i) => i !== skip))
  if (gaps[0] >= 4 && gaps[0] >= 2 * rest(0)) res.push(s[0])
  if (gaps[gaps.length - 1] >= 4 && gaps[gaps.length - 1] >= 2 * rest(gaps.length - 1)) res.push(s[s.length - 1])
  return res
}

/** shape of a frequency list (low values first), written independently of the generator */
function shapeOf(fs: number[]): string | null {
  // peaks: runs of equal values higher than both neighbours
  const peaks: [number, number][] = []
  let i = 0
  while (i < fs.length) {
    let j = i
    while (j + 1 < fs.length && fs[j + 1] === fs[i]) j++
    const l = i > 0 ? fs[i - 1] : -Infinity
    const r = j < fs.length - 1 ? fs[j + 1] : -Infinity
    if (fs[i] > l && fs[i] > r) peaks.push([i, j])
    i = j + 1
  }
  if (peaks.length === 2) {
    const dip = Math.min(...fs.slice(peaks[0][1] + 1, peaks[1][0]))
    return dip <= Math.min(fs[peaks[0][0]], fs[peaks[1][0]]) - 3 ? 'bimodal' : null
  }
  if (peaks.length !== 1) return null
  const k = fs.length
  if (fs.every((x, t) => x === fs[k - 1 - t])) return 'symmetrical'
  // skewed: the peak is off-centre and the third moment about the mean has the matching sign
  // (mean versus median is not used here: with small whole-number data a skewed display can have mean < median)
  const data = fs.flatMap((f, t) => Array<number>(f).fill(t))
  const mid = (peaks[0][0] + peaks[0][1]) / 2
  const mn = meanExact(data)
  const m2 = data.reduce((s, x) => s + (x - mn) ** 2, 0) / data.length
  const g = data.reduce((s, x) => s + (x - mn) ** 3, 0) / data.length / m2 ** 1.5
  if (mid < (k - 1) / 2 && g > 0.25) return 'positively skewed'
  if (mid > (k - 1) / 2 && g < -0.25) return 'negatively skewed'
  return null
}

// ---------------------------------------------------------------- reading what is shown

function attrs(tag: string): Record<string, string> {
  const o: Record<string, string> = {}
  for (const m of tag.matchAll(/([\w-]+)="([^"]*)"/g)) o[m[1]] = m[2]
  return o
}
const texts = (svg: string): Record<string, string>[] => [...svg.matchAll(/<text ([^>]*)>([\s\S]*?)<\/text>/g)].map((m) => ({ ...attrs(m[1]), s: strip(m[2]) }))
const svgs = (html: string): string[] => html.match(/<svg[\s\S]*?<\/svg>/g) ?? []
const firstSvg = (html: string | undefined): string => svgs(html ?? '')[0] ?? bad('no diagram')

function listData(html: string): number[] {
  const m = html.match(/<p class="datalist[^"]*">([\s\S]*?)<\/p>/)
  if (!m) bad('no data list')
  return strip(m![1])
    .split(',')
    .map((s) => numOf(s.trim()))
}

function tableRows(html: string): string[][] {
  const t = html.match(/<table[\s\S]*?<\/table>/)
  if (!t) bad('no table')
  return [...t![0].matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((r) => [...r[1].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g)].map((c) => strip(c[1])))
}

function dotData(svg: string): number[] {
  const ticks = texts(svg)
    .filter((t) => /^−?\d+$/.test(t.s))
    .map((t) => ({ x: Number(t.x), v: numOf(t.s) }))
  const dots = [...svg.matchAll(/<circle class="pt hlfill" ([^>]*)\/>/g)].map((m) => attrs(m[1]))
  const at = new Map<number, number[]>()
  for (const d of dots) {
    const t = ticks.find((tk) => Math.abs(tk.x - Number(d.cx)) < 0.6)
    if (!t) bad('a dot is not above a tick')
    at.set(t!.v, [...(at.get(t!.v) ?? []), Number(d.cy)])
  }
  // dots stack evenly upwards from the same starting height
  const base = new Set<number>()
  for (const ys of at.values()) {
    const s = ys.slice().sort((a, b) => b - a)
    base.add(Math.round(s[0]))
    for (let i = 1; i < s.length; i++) if (Math.abs(s[i - 1] - s[i] - 15) > 0.6) bad('dots not evenly stacked')
  }
  if (base.size > 1) bad('dot stacks start at different heights')
  return [...at.entries()].flatMap(([v, ys]) => Array<number>(ys.length).fill(v))
}

/** frequencies read from a histogram's columns and/or polygon, measured against the frequency axis */
function histData(svg: string): { xs: number[]; fs: number[] } {
  const T = texts(svg)
  const yv = T.filter((t) => (t.class ?? '').includes('yv')).map((t) => ({ y: Number(t.y), v: numOf(t.s) }))
  const xv = T.filter((t) => (t.class ?? '').includes('xv')).map((t) => ({ x: Number(t.x), v: numOf(t.s) }))
  if (yv.length < 2 || xv.length < 2) bad('histogram axes not labelled')
  const zero = yv.find((t) => t.v === 0) ?? bad('no 0 on the frequency axis')
  const top = yv.reduce((a, b) => (b.v > a.v ? b : a))
  const per = (zero.y - top.y) / top.v
  for (const t of yv) if (Math.abs(zero.y - t.v * per - t.y) > 0.6) bad('frequency axis not evenly spaced')
  const slot = xv[1].x - xv[0].x
  for (let i = 1; i < xv.length; i++) {
    if (Math.abs(xv[i].x - xv[i - 1].x - slot) > 0.6) bad('score axis not evenly spaced')
    if (xv[i].v !== xv[i - 1].v + 1) bad('scores not consecutive')
  }
  const freqAt = (h: number) => {
    const f = h / per
    if (Math.abs(f - Math.round(f)) > 0.03) bad(`a height (${f.toFixed(2)}) is not a whole frequency`)
    return Math.round(f)
  }
  const axis = [...svg.matchAll(/<line class="axis" ([^>]*)\/>/g)].map((m) => attrs(m[1])).find((a) => a.x1 === a.x2 && Number(a.y1) > Number(a.y2))
  if (!axis) bad('no frequency axis line')
  const axisX = Number(axis!.x1)
  const bars = [...svg.matchAll(/<rect class="bar" ([^>]*)\/>/g)].map((m) => attrs(m[1]))
  let fromBars: number[] | null = null
  if (bars.length) {
    fromBars = xv.map((t) => {
      const b = bars.find((r) => Math.abs(Number(r.x) + Number(r.width) / 2 - t.x) < 0.6)
      if (!b) return 0
      if (Math.abs(Number(b.width) - slot) > 0.6) bad('column width differs from the spacing of the scores')
      if (Math.abs(Number(b.y) + Number(b.height) - zero.y) > 0.6) bad('column does not stand on the axis')
      return freqAt(Number(b.height))
    })
    const first = bars.reduce((a, b) => (Number(b.x) < Number(a.x) ? b : a))
    if (fromBars[0] > 0 && Math.abs(Number(first.x) - axisX - slot / 2) > 0.6) bad('no half-column gap before the first column')
  }
  let fromPoly: number[] | null = null
  const pl = svg.match(/<polyline class="[^"]*fpoly[^"]*" points="([^"]*)"/)
  if (pl) {
    const pts = pl[1].split(' ').map((p) => p.split(',').map(Number))
    if (pts.length !== xv.length + 2) bad('polygon has the wrong number of points')
    const [s, e] = [pts[0], pts[pts.length - 1]]
    if (Math.abs(s[1] - zero.y) > 0.6 || Math.abs(e[1] - zero.y) > 0.6) bad('polygon does not start and end on the axis')
    if (Math.abs(s[0] - (xv[0].x - slot)) > 0.6 || Math.abs(e[0] - (xv[xv.length - 1].x + slot)) > 0.6) bad('polygon ends are not one score either side')
    fromPoly = xv.map((t, i) => {
      const p = pts[i + 1]
      if (Math.abs(p[0] - t.x) > 0.6) bad('polygon point not above its score')
      return freqAt(zero.y - p[1])
    })
  }
  if (fromBars && fromPoly && fromBars.join() !== fromPoly.join()) bad('polygon and columns disagree')
  const fs = fromBars ?? fromPoly ?? bad('no columns or polygon')
  return { xs: xv.map((t) => t.v), fs }
}

/** a single stem-and-leaf plot, decoded with its own key */
function stemData(html: string, ordered = true): { values: number[]; rows: { stem: number; n: number }[]; hidden: number | null } {
  const t = html.match(/<table class="stemleaf">([\s\S]*?)<\/table>\s*<p class="key">([\s\S]*?)<\/p>/)
  if (!t) bad('no stem-and-leaf plot')
  const key = strip(t![2]).match(/^Key: (\d+) \| (\d) = ([\d.]+)/) ?? bad('unreadable key')
  const [ks, kl, kv] = [Number(key[1]), Number(key[2]), Number(key[3])]
  const dec = kv === ks * 10 + kl ? 0 : Math.abs(kv - (ks + kl / 10)) < 1e-9 ? 1 : bad('key does not match either reading')
  const rows = [...t![1].matchAll(/<tr><td class="stem">(\d+)<\/td><td class="leaf">([\s\S]*?)<\/td><\/tr>/g)].map((m) => ({ stem: Number(m[1]), leaves: strip(m[2]).split(' ').filter(Boolean) }))
  if (!rows.length) bad('no rows')
  for (let i = 1; i < rows.length; i++) if (rows[i].stem !== rows[i - 1].stem + 1) bad('a stem is missing')
  const values: number[] = []
  let hidden: number | null = null
  for (const r of rows) {
    if (r.leaves.length === 0 && (r === rows[0] || r === rows[rows.length - 1])) bad('an empty end stem')
    const digits = r.leaves.filter((l) => l !== '?').map((l) => (/^\d$/.test(l) ? Number(l) : bad(`leaf “${l}”`)))
    if (r.leaves.includes('?')) hidden = r.stem
    if (ordered) for (let i = 1; i < digits.length; i++) if (digits[i] < digits[i - 1]) bad('leaves not in order')
    for (const d of digits) values.push(dec ? Math.round((r.stem + d / 10) * 10) / 10 : r.stem * 10 + d)
  }
  return { values, rows: rows.map((r) => ({ stem: r.stem, n: r.leaves.length })), hidden }
}

/** a back-to-back plot: the left leaves must read outwards from the stem, and the key both ways */
function b2bData(html: string): { names: [string, string]; L: number[]; R: number[]; rowsL: number[]; rowsR: number[] } {
  const t = html.match(/<table class="stemleaf b2b">([\s\S]*?)<\/table>\s*<p class="key">([\s\S]*?)<\/p>/)
  if (!t) bad('no back-to-back plot')
  const names = [...t![1].matchAll(/<th>([\s\S]*?)<\/th>/g)].map((m) => strip(m[1]))
  if (names.length !== 3 || names[1] !== 'Stem') bad('bad header')
  const k = strip(t![2]).match(/^Key: (\d) \| (\d+) \| (\d) means (\d+)[\s\S]*? and (\d+)/) ?? bad('unreadable key')
  const [a, s, c, x, y] = k.slice(1).map(Number)
  if (x !== s * 10 + a || y !== s * 10 + c) bad('back-to-back key misread')
  const rows = [...t![1].matchAll(/<tr><td class="leaf leafL">([\s\S]*?)<\/td><td class="stem">(\d+)<\/td><td class="leaf">([\s\S]*?)<\/td><\/tr>/g)]
  const L: number[] = []
  const R: number[] = []
  const rowsL: number[] = []
  const rowsR: number[] = []
  let prev = -1
  for (const m of rows) {
    const stem = Number(m[2])
    if (prev >= 0 && stem !== prev + 1) bad('a stem is missing')
    prev = stem
    const l = strip(m[1]).split(' ').filter(Boolean).map(Number)
    const r = strip(m[3]).split(' ').filter(Boolean).map(Number)
    for (let i = 1; i < l.length; i++) if (l[i] > l[i - 1]) bad('left leaves do not increase outwards from the stem')
    for (let i = 1; i < r.length; i++) if (r[i] < r[i - 1]) bad('right leaves not in order')
    l.forEach((d) => L.push(stem * 10 + d))
    r.forEach((d) => R.push(stem * 10 + d))
    rowsL.push(l.length)
    rowsR.push(r.length)
  }
  return { names: [names[0], names[2]], L, R, rowsL, rowsR }
}

// ---------------------------------------------------------------- independent classifications

function typeOf(item: string): string {
  if (/colours of the cars|types of pets|favourite sports|countries of birth|flavours|computer games/.test(item)) return 'nominal'
  if (/month in which|report grades|T-shirt sizes|belt colour|finishing places|satisfied/.test(item)) return 'ordinal'
  if (/^the number of|shoe sizes|age each student turns/.test(item)) return 'discrete'
  if (/time taken|temperature|masses|heights|distance|rainfall|petrol|speed/.test(item)) return 'continuous'
  return '?'
}
const bigOf = (t: string) => (t === 'nominal' || t === 'ordinal' ? 'categorical' : 'numerical')
function censusOf(inv: string): string {
  if (/in your class|basketball team|people living in Australia|small business|enrolled at your school/i.test(inv)) return 'a census'
  if (/battery|tinned soup|opinions|average height|water quality|crash tests|car colour/i.test(inv)) return 'a sample'
  return '?'
}
const WHY_SAMPLE: [RegExp, RegExp][] = [
  [/battery/, /uses up/],
  [/soup/, /opened/],
  [/opinions/, /too large/],
  [/average height/, /too many/],
  [/water quality/, /impossible/],
  [/crash/, /destroy/],
  [/car colour/, /millions/],
]
const BIAS_WHY: [RegExp, RegExp][] = [
  [/online gamers/, /not represent all teenagers/],
  [/café/, /strong feelings/],
  [/executives/, /factory-floor/],
  [/premiere/, /fans/],
  [/classic hits/, /older music/],
  [/boxing/, /accept violence/],
]
function questionFault(qs: string): RegExp {
  if (/spend studying|often do you exercise|in the holidays/.test(qs)) return /vague/
  if (/Don’t you agree|delicious|Most people think/.test(qs)) return /leading/
  if (/income|address and phone/.test(qs)) return /personal/
  if (/ and /.test(qs)) return /two things/
  return /^$/
}

// ---------------------------------------------------------------- checking one question

function check(id: string, qn: Question) {
  const a = qn.answer
  const m = (qn.meta ?? {}) as Record<string, unknown>
  const kind = String(m.kind ?? '')
  const p = strip(qn.prompt)
  const html = qn.prompt + (qn.diagram ?? '')
  if (a.kind === 'mc') {
    if (new Set(a.options).size !== a.options.length) fail(id, 'duplicate options', qn)
  } else if (!checkAnswer(a, answerText(a)).correct) fail(id, 'answer text not accepted', qn)
  if (/NaN|undefined|Infinity|\$\{/.test(html + qn.steps.join(' ') + qn.hint)) fail(id, 'bad text', qn)
  // the rounding asked for must be the rounding marked
  if (a.kind === 'num' && a.dp !== undefined) {
    const words = a.dp === 0 ? 'to the nearest whole number' : `correct to ${a.dp} decimal place`
    if (!new RegExp(words, 'i').test(p)) fail(id, `marked to ${a.dp} dp but the words say otherwise`, qn)
  }
  if (a.kind === 'num' && a.dp === undefined && /correct to \d decimal place/i.test(p)) fail(id, 'words ask for rounding but the answer is exact', qn)

  const want = (x: number, what: string) => {
    independent++
    counts[what] = (counts[what] ?? 0) + 1
    if (a.kind !== 'num') return fail(id, `${what}: expected a number answer`, qn)
    const shown = Number(answerText(a))
    if (Math.abs(shown - x) > 1e-9) fail(id, `${what}: expected ${x}, marked ${shown}`, qn)
  }
  const wantMc = (test: (opt: string) => boolean, what: string) => {
    independent++
    counts[what] = (counts[what] ?? 0) + 1
    if (a.kind !== 'mc') return fail(id, `${what}: expected multiple choice`, qn)
    const opts = a.options.map(strip)
    const ok = opts.map(test)
    if (!ok[a.correct] || ok.filter(Boolean).length !== 1) fail(id, `${what}: marked “${opts[a.correct]}”, matches ${ok.filter(Boolean).length}`, qn)
  }
  /** the statistic named in the last sentence of the words */
  const statFromWords = (v: number[], what: string) => {
    const at = [...p.matchAll(/(find|what is) the/gi)].pop()
    if (!at) return fail(id, 'no question asked', qn)
    const ask = p.slice(at.index)
    const dpm = ask.match(/correct to (\d) decimal place/)
    if (/\bmean\b/.test(ask)) {
      if (!dpm) return fail(id, 'mean without a rounding instruction', qn)
      return want(meanRounded(v, Number(dpm[1])), `${what} mean`)
    }
    if (/\bmedian\b/.test(ask)) return want(median(v), `${what} median`)
    if (/\bmode\b/.test(ask)) {
      const md = mode(v)
      if (md === null) return fail(id, 'no single mode', qn)
      return want(md, `${what} mode`)
    }
    if (/\brange\b/.test(ask)) return want(range(v), `${what} range`)
    fail(id, 'no statistic named', qn)
  }

  switch (kind) {
    // ---------------- 9.01
    case 'list':
    case 'neg':
    case 'dec':
      return statFromWords(listData(qn.prompt), 'list')
    case 'dot':
      return statFromWords(dotData(firstSvg(qn.diagram)), 'dot plot')
    case 'outlier': {
      const v = m.plot === 'dot' ? dotData(firstSvg(qn.diagram)) : m.plot === 'stem' ? stemData(qn.diagram ?? '').values : listData(qn.prompt)
      const o = outliers(v)
      if (o.length !== 1) return fail(id, `expected one clear outlier, found ${o.length}`, qn)
      if (m.ask === 'which' || m.plot) return want(o[0], m.plot ? `${m.plot} plot outlier` : 'outlier')
      const use = /without the outlier/.test(p) ? v.filter((x, i) => i !== v.indexOf(o[0])) : v
      if (!/without the outlier|including the outlier/.test(p)) return fail(id, 'with or without the outlier?', qn)
      return statFromWords(use, 'outlier')
    }
    case 'best': {
      const o = /Here are/.test(p) ? outliers(listData(qn.prompt)) : []
      const right = /which size to order/.test(p) ? 'the mode' : o.length ? 'the median' : 'the mean'
      if (/no outliers/.test(p) && o.length) return fail(id, 'says no outliers but there is one', qn)
      return wantMc((t) => t === right, 'best measure')
    }
    case 'fx':
    case 'cumMedian': {
      const rows = tableRows(qn.diagram ?? '').slice(1)
      const v = rows.flatMap((r) => Array<number>(numOf(r[1])).fill(numOf(r[0])))
      return statFromWords(v, kind === 'fx' ? 'Σfx ÷ Σf' : 'cumulative median')
    }
    case 'missing': {
      const k = numOf(p.match(/(?:played|bowled|sat) (\d+)/)![1])
      const mean = numOf(p.match(/mean (?:score|mark) of (\d+)/)![1])
      const known = p
        .match(/were ([\d, ]+)/)![1]
        .split(',')
        .map((s) => numOf(s))
      if (known.length !== k - 1) return fail(id, 'wrong number of known values', qn)
      return want(k * mean - known.reduce((s, x) => s + x, 0), 'missing value')
    }
    case 'newMean': {
      const [, a0, n0, b0] = p.match(/mean mark of (\d+)% for (\d+) maths tests\. After one more test, the mean rises to (\d+)%/)!.map(Number)
      return want((n0 + 1) * b0 - n0 * a0, 'new mean')
    }
    case 'possible': {
      const [, n0, a0, b0] = p.match(/for (\d+) science exams is (\d+)%[\s\S]*?raise the mean to (\d+)%/)!.map(Number)
      const need = (n0 + 1) * b0 - n0 * a0
      return wantMc((t) => (need <= 100 ? new RegExp(`^Yes: .* would need ${need}%\\.$`).test(t) : new RegExp(`^No: .* would need ${need}%, which is more than 100%\\.$`).test(t)), 'possible mean')
    }
    // ---------------- 9.02
    case 'hist': {
      const { xs, fs } = histData(firstSvg(qn.diagram))
      const v = xs.flatMap((x, i) => Array<number>(fs[i]).fill(x))
      const last = p.slice(p.lastIndexOf('.') + 1)
      if (m.ask === 'freq') {
        const x = numOf(last.match(/(\d+)/)![1])
        return want(fs[xs.indexOf(x)] ?? bad('score not on the axis'), 'histogram frequency')
      }
      if (m.ask === 'total') return want(fs.reduce((s, f) => s + f, 0), 'histogram total')
      if (m.ask === 'atLeast') {
        const x = numOf(p.match(/(\d+) or more/)![1])
        return want(fs.filter((_, i) => xs[i] >= x).reduce((s, f) => s + f, 0), 'or more')
      }
      if (m.ask === 'mode') {
        const md = mode(v)
        return md === null ? fail(id, 'no single mode', qn) : want(md, 'histogram mode')
      }
      return statFromWords(v, 'histogram')
    }
    case 'stem':
    case 'unordered': {
      const unordered = /unordered/.test(p)
      if ((kind === 'unordered') !== unordered) return fail(id, 'ordered or not?', qn)
      const { values: v } = stemData(qn.diagram ?? '', !unordered)
      const s = v.slice().sort((x, y) => x - y)
      switch (m.ask) {
        case 'count':
          return want(v.length, 'stem count')
        case 'big':
          return want(s[s.length - 1], 'stem highest')
        case 'small':
          return want(s[0], 'stem lowest')
        case 'above': {
          const t = numOf(p.match(/(?:more than|above) (\d+)/)![1])
          return want(v.filter((x) => x > t).length, 'stem above')
        }
        default:
          return statFromWords(v, 'stem')
      }
    }
    case 'b2b': {
      const g = b2bData(qn.diagram ?? '')
      if (m.ask === 'median') {
        const [mA, mB] = [median(g.L), median(g.R)]
        if (mA === mB) return fail(id, 'equal medians', qn)
        return wantMc((t) => t === (mA > mB ? g.names[0] : g.names[1]), 'b2b greater median')
      }
      const ti = p.includes(`the ${g.names[0]}`) ? 0 : p.includes(`the ${g.names[1]}`) ? 1 : bad('which team?')
      const v = ti === 0 ? g.L : g.R
      if (m.ask === 'more') {
        const t = numOf(p.match(/more than (\d+) goals/)![1])
        return want(v.filter((x) => x > t).length, 'b2b more than')
      }
      if (m.ask === 'highest') return want(Math.max(...v), 'b2b highest')
      return want(range(v), 'b2b range')
    }
    case 'missingLow':
      return checkMissing(id, qn)
    case 'decimal': {
      const { values: v } = stemData(qn.diagram ?? '')
      if (!v.some((x) => x % 1 !== 0)) return fail(id, 'decimal plot shows no decimals', qn)
      const n0 = numOf(p.match(/taken by (\d+) students/)![1])
      if (v.length !== n0) return fail(id, `says ${n0} students but shows ${v.length}`, qn)
      const lt = p.match(/less than ([\d.]+) seconds/)
      if (lt) return want(v.filter((x) => x < Number(lt[1])).length, 'decimal stem below')
      const t = numOf(p.match(/more than (\d+) seconds/)![1])
      return want((v.filter((x) => x > t).length * 100) / n0, 'decimal stem percentage')
    }
    // ---------------- 9.03
    case 'histShape':
    case 'dotShape': {
      let fs: number[]
      if (kind === 'histShape') fs = histData(firstSvg(qn.diagram)).fs
      else {
        const v = dotData(firstSvg(qn.diagram))
        const ticks = texts(firstSvg(qn.diagram))
          .filter((t) => /^\d+$/.test(t.s))
          .map((t) => numOf(t.s))
        fs = ticks.map((x) => v.filter((y) => y === x).length)
        while (fs[0] === 0) fs.shift()
        while (fs[fs.length - 1] === 0) fs.pop()
      }
      const sh = shapeOf(fs)
      if (!sh) return fail(id, `shape not clear: ${fs.join(',')}`, qn)
      return wantMc((t) => t === sh, 'shape')
    }
    case 'stemShape': {
      const { rows } = stemData(qn.diagram ?? '', true)
      const sh = shapeOf(rows.map((r) => r.n))
      if (!sh) return fail(id, `shape not clear: ${rows.map((r) => r.n).join(',')}`, qn)
      return wantMc((t) => t === sh, 'stem shape')
    }
    case 'cluster': {
      if (m.plot === 'dot') {
        const svg = firstSvg(qn.diagram)
        const v = dotData(svg)
        const xs = [...new Set(v)].sort((x, y) => x - y)
        const lo = Math.min(...v)
        const hi = Math.max(...v)
        let best = -1
        let bs = -1
        let tie = false
        for (let s = lo; s + 2 <= hi; s++) {
          const c = v.filter((x) => x >= s && x <= s + 2).length
          if (c > bs) [best, bs, tie] = [s, c, false]
          else if (c === bs) tie = true
        }
        void xs
        if (tie || bs < v.length / 2) return fail(id, 'no single clear cluster', qn)
        return wantMc((t) => t === `at ${best}, ${best + 1} and ${best + 2}`, 'dot cluster')
      }
      const { rows } = stemData(qn.diagram ?? '')
      let best = -1
      let bs = -1
      let tie = false
      for (let i = 0; i + 1 < rows.length; i++) {
        const c = rows[i].n + rows[i + 1].n
        if (c > bs) [best, bs, tie] = [rows[i].stem, c, false]
        else if (c === bs) tie = true
      }
      if (tie) return fail(id, 'no single clear cluster', qn)
      return wantMc((t) => t === `in the ${best * 10}s and ${(best + 1) * 10}s`, 'stem cluster')
    }
    case 'meanMedian': {
      const { xs, fs } = histData(firstSvg(qn.diagram))
      const v = xs.flatMap((x, i) => Array<number>(fs[i]).fill(x))
      const mn = meanExact(v)
      const md = median(v)
      // the worked solution says the mean is pulled towards the tail: that must be true of these numbers
      const sh = shapeOf(fs)
      if (sh === 'positively skewed' && !(mn > md)) return fail(id, 'positively skewed but mean ≤ median', qn)
      if (sh === 'negatively skewed' && !(mn < md)) return fail(id, 'negatively skewed but mean ≥ median', qn)
      if (sh === 'symmetrical' && mn !== md) return fail(id, 'symmetrical but mean ≠ median', qn)
      if (!sh) return fail(id, `shape not clear: ${fs.join(',')}`, qn)
      return wantMc((t) => t === (Math.abs(mn - md) < 1e-12 ? 'The mean and the median are equal.' : mn > md ? 'The mean is greater than the median.' : 'The mean is less than the median.'), 'mean v median')
    }
    case 'range': {
      const { values: v } = stemData(qn.diagram ?? '')
      const o = outliers(v)
      if (o.length > 1) return fail(id, 'two outliers', qn)
      if (o.length) {
        const rest = v.filter((x) => x !== o[0])
        return wantMc((t) => t.startsWith(`No: the outlier ${o[0]} makes the range (${range(v)})`) && t.includes(`(${range(rest)})`), 'range with outlier')
      }
      return wantMc((t) => t === `Yes: there are no outliers, so the range (${range(v)}) gives a fair picture of the spread.`, 'range without outlier')
    }
    case 'shapeExcl': {
      const { values: v } = stemData(qn.diagram ?? '')
      const o = outliers(v)
      if (o.length !== 1) return fail(id, `expected one outlier, found ${o.length}`, qn)
      const body = v.filter((x) => x !== o[0])
      const s0 = Math.floor(Math.min(...body) / 10)
      const s1 = Math.floor(Math.max(...body) / 10)
      const fs: number[] = []
      for (let s = s0; s <= s1; s++) fs.push(body.filter((x) => Math.floor(x / 10) === s).length)
      const sh = shapeOf(fs)
      if (!sh) return fail(id, `shape not clear: ${fs.join(',')}`, qn)
      return wantMc((t) => t === sh, 'shape without outlier')
    }
    // ---------------- 9.04
    case 'pair': {
      const rows = tableRows(qn.diagram ?? '')
      const [, nA, nB] = rows[0]
      const A = rows.slice(1).map((r) => numOf(r[1]))
      const B = rows.slice(1).map((r) => numOf(r[2]))
      if (m.ask === 'better') {
        const lowGood = /times/.test(p)
        const aWins = lowGood ? meanExact(A) < meanExact(B) : meanExact(A) > meanExact(B)
        const aMed = lowGood ? median(A) < median(B) : median(A) > median(B)
        if (aWins !== aMed) return fail(id, 'mean and median disagree about who is better', qn)
        return wantMc((t) => t === (aWins ? nA : nB), 'who is better')
      }
      if (m.ask === 'consistent') {
        if (range(A) === range(B)) return fail(id, 'equal ranges', qn)
        return wantMc((t) => t === (range(A) < range(B) ? nA : nB), 'more consistent')
      }
      const who = p.includes(`for ${nA}`) ? A : p.includes(`for ${nB}`) ? B : bad('for whom?')
      return statFromWords(who, 'pair')
    }
    case 'twoDot': {
      const names = [...(qn.diagram ?? '').matchAll(/<p class="text-sm font-semibold">([\s\S]*?)<\/p>/g)].map((x) => strip(x[1]))
      const [A, B] = svgs(qn.diagram ?? '').map(dotData)
      if (m.ask === 'consistent') {
        if (range(A) === range(B)) return fail(id, 'equal ranges', qn)
        return wantMc((t) => t === (range(A) < range(B) ? names[0] : names[1]), 'consistent city')
      }
      const v = p.includes(`for ${names[0]}`) ? A : p.includes(`for ${names[1]}`) ? B : bad('which city?')
      return statFromWords(v, 'two dot plots')
    }
    case 'b2bGroups': {
      const g = b2bData(qn.diagram ?? '')
      if (m.ask === 'diff') return want(Math.abs(median(g.L) - median(g.R)), 'difference of medians')
      const v = p.includes(`for ${g.names[0]}`) ? g.L : p.includes(`for ${g.names[1]}`) ? g.R : bad('which group?')
      return statFromWords(v, 'b2b group')
    }
    case 'days': {
      const rows = tableRows(qn.diagram ?? '').slice(1)
      return want(rows.filter((r) => numOf(r[1]) > numOf(r[2])).length, 'warmer days')
    }
    case 'shapes': {
      const g = b2bData(qn.diagram ?? '')
      const [sA, sB] = [shapeOf(g.rowsL), shapeOf(g.rowsR)]
      if (!sA || !sB) return fail(id, `shapes not clear: ${g.rowsL} / ${g.rowsR}`, qn)
      return wantMc((t) => t === `Class A is ${sA} and Class B is ${sB}.`, 'compare shapes')
    }
    case 'better': {
      const g = b2bData(qn.diagram ?? '')
      const [mA, mB, dA, dB] = [meanExact(g.L), meanExact(g.R), median(g.L), median(g.R)]
      if (Math.sign(mA - mB) !== Math.sign(dA - dB) || mA === mB) return fail(id, 'mean and median disagree', qn)
      const W = mA > mB ? 0 : 1
      const f1 = (x: number[]) => roundFrac(x.reduce((s, y) => s + y, 0), x.length, 1).toFixed(1)
      const vw = W === 0 ? g.L : g.R
      return wantMc((t) => t === `${g.names[W]}: the mean (${f1(vw)}) and median (${median(vw)}) are both higher.`, 'which group did better')
    }
    // ---------------- 9.05 and 9.06
    case 'type1':
    case 'type2':
    case 'type3': {
      const item = String(m.item)
      if (!p.includes(item)) return fail(id, 'item not shown', qn)
      const t = typeOf(item)
      if (t === '?') return fail(id, `cannot classify “${item}”`, qn)
      const right = kind === 'type1' ? bigOf(t) : kind === 'type2' ? t : `${bigOf(t)}, ${t}`
      if (kind === 'type2' && !p.includes(`This is ${bigOf(t)} data`)) return fail(id, 'wrong lead-in', qn)
      return wantMc((o) => o === right, 'type of data')
    }
    case 'type4': {
      const w = p.match(/Which of these is (nominal|ordinal|discrete|continuous) (categorical|numerical) data/) ?? bad('unreadable')
      if (bigOf(w[1]) !== w[2]) return fail(id, 'mismatched type words', qn)
      return wantMc((o) => typeOf(o) === w[1], 'which is this type')
    }
    case 'census': {
      const c = censusOf(p)
      if (c === '?') return fail(id, 'cannot classify investigation', qn)
      return wantMc((o) => o === c, 'census or sample')
    }
    case 'why': {
      if (id.includes('census')) {
        const rule = WHY_SAMPLE.find(([inv]) => inv.test(p)) ?? bad('unknown investigation')
        return wantMc((o) => rule[1].test(o), 'why a sample')
      }
      const rule = BIAS_WHY.find(([sit]) => sit.test(p)) ?? bad('unknown situation')
      return wantMc((o) => rule[1].test(o), 'why biased')
    }
    case 'strat':
    case 'pct': {
      const rows = tableRows(qn.diagram ?? '').slice(1)
      const years = rows.map((r) => numOf(r[0]))
      const ns = rows.map((r) => numOf(r[1]))
      const total = ns.reduce((s, x) => s + x, 0)
      const y = numOf(p.match(/Year (\d+)/g)!.pop()!.slice(5))
      const ny = ns[years.indexOf(y)]
      if (kind === 'pct') return want(roundFrac(ny * 100, total, 1), 'percentage of population')
      const S = numOf(p.match(/sample of (\d+)/)![1])
      const exact2 = (2 * S * ny) % (2 * total)
      if (Math.abs(exact2 - total) < 0.1 * total) return fail(id, 'too close to halfway to round fairly', qn)
      return want(roundFrac(S * ny, total, 0), 'proportional sample')
    }
    case 'method': {
      const rep = /box that holds the name of every|random number generator|numbering every member/i.test(p)
      return wantMc((o) => o === (rep ? 'representative' : 'biased'), 'representative or biased')
    }
    case 'question': {
      const qs = p.match(/‘([^’]*(?:’[^’]*)*)’$/)?.[1] ?? p
      const fault = questionFault(qs)
      return wantMc((o) => fault.test(o), 'survey question fault')
    }
    // ---------------- Power plus
    case 'modal':
    case 'medianClass': {
      const rows = tableRows(qn.diagram ?? '').slice(1)
      const fs = rows.map((r) => numOf(r[1]))
      if (kind === 'modal') {
        const mx = Math.max(...fs)
        if (fs.filter((f) => f === mx).length !== 1) return fail(id, 'two modal classes', qn)
        return wantMc((o) => o === rows[fs.indexOf(mx)][0], 'modal class')
      }
      const n0 = fs.reduce((s, f) => s + f, 0)
      const pos = n0 % 2 ? [(n0 + 1) / 2] : [n0 / 2, n0 / 2 + 1]
      const cls = pos.map((q) => {
        let c = 0
        return fs.findIndex((f) => (c += f) >= q)
      })
      if (cls[0] !== cls[cls.length - 1]) return fail(id, 'middle values in different classes', qn)
      return wantMc((o) => o === rows[cls[0]][0], 'median class')
    }
    case 'classCount': {
      const v = listData(qn.prompt)
      const [lo, hi] = p.match(/class (\d+)–(\d+)\?/)!.slice(1).map(Number)
      return want(v.filter((x) => x >= lo && x <= hi).length, 'class frequency')
    }
    default:
      fail(id, `no check for ${kind}`, qn)
  }
}

/** the missing-lowest-mark question: the hidden value must be the lowest and sit on the ? stem */
function checkMissing(id: string, qn: Question) {
  const { values, hidden } = stemData(qn.diagram ?? '')
  const r = numOf(strip(qn.prompt).match(/range of the marks is (\d+)/)![1])
  const low = Math.max(...values) - r
  if (hidden === null || Math.floor(low / 10) !== hidden) return fail(id, 'lowest mark is not on the ? stem', qn)
  if (low > Math.min(...values)) return fail(id, 'the “lowest” mark is not the lowest', qn)
  independent++
  counts['missing lowest'] = (counts['missing lowest'] ?? 0) + 1
  const a = qn.answer
  if (a.kind !== 'num' || Math.abs(a.value - low) > 1e-9) fail(id, `expected ${low}`, qn)
}

for (const s of NCM9_SKILLS)
  for (const lvl of [1, 2, 3] as Level[])
    for (let i = 0; i < N; i++) {
      setSeed(i * 7919 + lvl * 31 + s.id.length)
      const id = `${s.id} L${lvl}`
      try {
        check(id, s.gen(lvl))
      } catch (e) {
        fail(id, (e instanceof Bad ? '' : 'threw ') + (e as Error).message)
      }
    }
for (let i = 0; i < 100; i++) {
  setSeed(5000 + i)
  NCM9_TEST.forEach((it, k) => {
    try {
      check(`test Q${k + 1}`, it.gen!(it.level))
    } catch (e) {
      fail(`test Q${k + 1}`, (e as Error).message)
    }
  })
}
const topic = findTopic('y9-data')
if (!topic || topic.test?.length !== 12) fail('topic', 'topic missing or test is not 12 questions')
for (const it of NCM9_TEST) if (!NCM9_SKILLS.some((s) => s.id === it.skill && s.tag !== 'extension')) fail('topic', `test skill ${it.skill} missing or extension`)
if (topic && topic.skills.length !== NCM9_SKILLS.length) fail('topic', 'topic does not use the Chapter 9 skills')
console.log(`${failures === 0 ? 'PASS' : 'FAIL'}: ${failures} failures, ${independent} answers re-worked independently`)
console.log(
  Object.entries(counts)
    .map(([k, v]) => `${k} ${v}`)
    .join(' · '),
)
process.exit(failures ? 1 : 0)
