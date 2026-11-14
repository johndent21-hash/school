// Independent answers for the NCM 8 Chapter 7 (Investigating data) class games, used by tests/games.test.ts.
// Kinds reused from NCM 7 Chapter 10 (meta.reused) are checked by that chapter's checks, so only the new kinds are here.
// Every graph is read back from the drawing:
//  - sector graphs: each sector's angle is measured from its path and must match its printed angle, the angles must
//    add to 360°, and each name is matched to the sector it sits in;
//  - pictograms: whole and half symbols are counted on each row and multiplied by the key;
//  - line graphs: the plotted points are turned into values with the axis numbers;
//  - frequency tables: read cell by cell; histograms and polygons: column tops or points against the frequency scale;
//  - the shape of a histogram is decided here from its frequencies (mirror image, all equal, or the side of the tail).
// Types of data, census or sample, fair samples and the best graph are answered from a key written here.
import type { GameQuestion, GameSet } from '../../src/lib/game/types'
import type { Ctx, Expect } from './ncm7-ch1'

type P = [number, number]
const NUMS = '(-?[\\d.]+)'
const sum = (xs: number[]) => xs.reduce((t, x) => t + x, 0)
const texts = (svg: string) =>
  [...svg.matchAll(new RegExp(`<text class="([^"]*)" x="${NUMS}" y="${NUMS}"[^>]*>(.*?)</text>`, 'g'))].map((m) => ({
    cls: m[1],
    p: [Number(m[2]), Number(m[3])] as P,
    s: m[4].replace(/<[^>]*>/g, '').replace(/ /g, ' ').trim(),
  }))
/** a linear scale through labelled ticks: pixel → value */
function scale(ticks: { px: number; v: number }[], ctx: Ctx): (px: number) => number {
  const [a, b] = [ticks[0], ticks[ticks.length - 1]]
  const k = (b.v - a.v) / (b.px - a.px)
  for (const t of ticks) if (Math.abs(a.v + (t.px - a.px) * k - t.v) > 0.05) ctx.fail('the axis numbers are not evenly spaced')
  return (px) => a.v + (px - a.px) * k
}
const whole = (v: number, ctx: Ctx, what: string) => {
  if (Math.abs(v - Math.round(v)) > 0.15) ctx.fail(`${what} does not sit on a whole number (${v.toFixed(2)})`)
  return Math.round(v)
}

/** the sectors of a sector graph: angle (measured), printed angle and name */
function readSectors(svg: string, ctx: Ctx) {
  const secs = [...svg.matchAll(new RegExp(`<path class="sh pie[^"]*" d="M${NUMS},${NUMS} L${NUMS},${NUMS} A${NUMS},${NUMS} 0 (\\d) 1 ${NUMS},${NUMS} Z"`, 'g'))].map((m) => {
    const C: P = [+m[1], +m[2]]
    const p: P = [+m[3], +m[4]]
    const q: P = [+m[8], +m[9]]
    // screen angles, clockwise from p to q
    const ang = (x: P) => (Math.atan2(x[1] - C[1], x[0] - C[0]) * 180) / Math.PI
    let a = (ang(q) - ang(p) + 720) % 360
    if (m[7] === '1' && a < 180) a = 360 - a
    const midA = ((ang(p) + a / 2) * Math.PI) / 180
    return { deg: Math.round(a), raw: a, mid: [C[0] + Math.cos(midA), C[1] + Math.sin(midA)] as P, C, name: '', printed: NaN }
  })
  if (secs.some((s) => Math.abs(s.raw - s.deg) > 0.3)) ctx.fail('a sector is not drawn at a whole number of degrees')
  if (sum(secs.map((s) => s.deg)) !== 360) ctx.fail('the sectors do not add to 360°')
  const T = texts(svg)
  const dirOf = (s: (typeof secs)[number], p: P) => {
    // the sector whose middle direction is closest to the label's direction from the centre
    const a = Math.atan2(p[1] - s.C[1], p[0] - s.C[0])
    const b = Math.atan2(s.mid[1] - s.C[1], s.mid[0] - s.C[0])
    return Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)))
  }
  for (const t of T) {
    const s = secs.reduce((best, x) => (dirOf(x, t.p) < dirOf(best, t.p) ? x : best))
    if (/\bslice\b/.test(t.cls)) {
      if (s.name) ctx.fail('two names in one sector')
      s.name = t.s
    } else if (/\bsdeg\b/.test(t.cls)) s.printed = Number(t.s.replace('°', ''))
  }
  for (const s of secs) if (s.printed !== s.deg) ctx.fail(`a sector is drawn at ${s.deg}° but labelled ${s.printed}°`)
  return secs
}

/** a frequency table drawn as a picture: [value, frequency] rows */
function readTable(svg: string): [number, number][] {
  const cells = [...svg.matchAll(/<text class="[^"]*\bcell r(\d+) c(\d+)"[^>]*>([^<]*)<\/text>/g)].map((m) => ({ r: +m[1], c: +m[2], s: m[3] }))
  const rows = Math.max(...cells.map((c) => c.r))
  const out: [number, number][] = []
  for (let r = 1; r <= rows; r++) out.push([Number(cells.find((c) => c.r === r && c.c === 0)!.s), Number(cells.find((c) => c.r === r && c.c === 1)!.s)])
  return out
}

/** a histogram or frequency polygon: [score, frequency] for each column or point */
function readHist(svg: string, ctx: Ctx): [number, number][] {
  const T = texts(svg)
  const Y = scale(T.filter((t) => /\byv\b/.test(t.cls)).map((t) => ({ px: t.p[1], v: Number(t.s) })), ctx)
  const xs = T.filter((t) => /\bxv\b/.test(t.cls)).map((t) => ({ x: t.p[0], v: Number(t.s) }))
  const bars = [...svg.matchAll(new RegExp(`<rect class="bar" x="${NUMS}" y="${NUMS}" width="${NUMS}" height="${NUMS}"`, 'g'))].map((m) => ({ mid: +m[1] + +m[3] / 2, top: +m[2] }))
  const pts = [...svg.matchAll(new RegExp(`<circle class="pt" cx="${NUMS}" cy="${NUMS}"`, 'g'))].map((m) => ({ mid: +m[1], top: +m[2] }))
  const marks = bars.length ? bars : pts
  if (marks.length !== xs.length) ctx.fail(`${marks.length} columns or points for ${xs.length} scores`)
  return xs.map((x) => {
    const m = marks.find((b) => Math.abs(b.mid - x.x) < 1)
    if (!m) throw new Error(`nothing above ${x.v}`)
    return [x.v, whole(Y(m.top), ctx, 'a column')]
  })
}

// keys, written separately from the content file
const TYPE_KEY: [RegExp, string][] = [
  [/favourite colour|country of birth|type of pet|eye colour|way of travelling/, 'categorical nominal'],
  [/T-shirt size|grade on a report|rating of a meal|place in a race/, 'categorical ordinal'],
  [/number of /, 'numerical discrete'],
  [/height of|mass of|time taken|temperature|length of/, 'numerical continuous'],
]
const typeOf = (v: string) => TYPE_KEY.find(([re]) => re.test(v))?.[1]
/** a census asks every member of the population: "ask all N …" where N is the population in the question */
const FAIR = /chosen at random|random students from each year/
const PURPOSE: [string, RegExp][] = [
  ['line graph', /changes over time/],
  ['sector graph', /whole is split into parts/],
  ['histogram', /grouped into classes/],
  ['column graph', /counts of categories/],
  ['stem-and-leaf plot', /spread over tens/],
  ['dot plot', /small set of scores/],
]
const BEST: [RegExp, string][] = [
  [/each day for two weeks|at the end of each month|each year from/, 'line graph'],
  [/share of a family budget|percentage of students in each house/, 'sector graph'],
  [/grouped as 0–9|grouped in 5 cm classes/, 'histogram'],
  [/goals scored in each of 15 netball games|pets owned by each of 20/, 'dot plot'],
  [/favourite fruit of each student|most popular streaming/, 'column graph'],
  [/ages of 25 people|masses of 30 dogs/, 'stem-and-leaf plot'],
]

export function rework(set: GameSet, q: GameQuestion, ctx: Ctx): Expect {
  const kind = `${set.exercise} ${q.meta.t}`
  try {
    return solve(kind, q, ctx)
  } catch (e) {
    ctx.fail(`could not be read: ${(e as Error).message}`)
    return null
  }
}

function solve(kind: string, q: GameQuestion, ctx: Ctx): Expect {
  const svg = q.diagram ?? ''
  const words = ctx.plain(q.prompt).replace(/\s+([.?,:)])/g, '$1')
  const shown = q.options.map(ctx.plain)
  const one = (ok: (o: string) => boolean, what: string): Expect => {
    const hits = shown.filter(ok)
    if (hits.length !== 1) ctx.fail(`${hits.length} options ${what}`)
    return hits.length ? { text: hits[0] } : null
  }
  switch (kind) {
    case '7.11 modes': {
      const data = words.split('?')[1].split(',').map(Number)
      const f = new Map<number, number>()
      for (const x of data) f.set(x, (f.get(x) ?? 0) + 1)
      const top = Math.max(...f.values())
      const n = [...f.values()].filter((c) => c === top).length
      return { text: n === f.size ? 'no mode (uniform)' : n === 1 ? 'unimodal' : n === 2 ? 'bimodal' : 'multimodal' }
    }
    case '7.12 centre': {
      // categories (no numbers) → the mode; numbers with one far above the rest → the median
      const nums = [...words.matchAll(/\$\s*([\d ]+\d)/g)].map((m) => Number(m[1].replace(/ /g, ''))).sort((a, b) => a - b)
      if (!nums.length) return { text: 'the mode' }
      if (nums.length !== 6 || nums[5] < 2 * nums[4]) ctx.fail('no outlier')
      return { text: 'the median' }
    }
    case '7.01 sector': {
      const secs = readSectors(svg, ctx)
      const name = words.match(/chose ([A-Z][a-z]+)\?/)![1]
      const s = secs.find((x) => x.name === name)
      if (!s) throw new Error(`no sector named ${name}`)
      const N = words.match(/: ([\d ]+) [a-z]+ in all/)
      if (!N) return { text: `${(s.deg / 360) * 100}%` }
      const v = (Number(N[1].replace(/\s/g, '')) * s.deg) / 360
      if (!Number.isInteger(v)) ctx.fail('the count is not a whole number')
      return { v }
    }
    case '7.02 picto': {
      const T = texts(svg)
      const key = svg.match(/= ([\d ]+) ([a-z]+)<\/text>/)!
      const per = Number(key[1].replace(/\s/g, ''))
      const rowCount = (day: string) => {
        const lab = T.find((t) => t.s === day)!
        const near = (cy: number) => Math.abs(cy - lab.p[1]) < 3
        const full = [...svg.matchAll(/<circle class="pg pgfull" cx="[\d.]+" cy="([\d.]+)" r="1[0-9]/g)].filter((m) => near(+m[1])).length
        const half = [...svg.matchAll(/<path class="pg pghalf" d="M[\d.]+,([\d.]+) A[\d.]+,[\d.]+ 0 0 0 [\d.]+,([\d.]+) Z"/g)].filter((m) => near((+m[1] + +m[2]) / 2)).length
        if (half > 1) ctx.fail('more than one half symbol on a row')
        return full * per + half * (per / 2)
      }
      const more = words.match(/How many more were sold on ([A-Z][a-z]+) than on ([A-Z][a-z]+)\?/)
      if (more) return { v: rowCount(more[1]) - rowCount(more[2]) }
      const day = words.match(/sold on ([A-Z][a-z]+)\?/)![1]
      return { v: rowCount(day) }
    }
    case '7.02 line': {
      const T = texts(svg)
      const xTicks = T.filter((t) => /\btiny\b/.test(t.cls) && Math.abs(t.p[1] - 232) < 0.5).map((t) => ({ px: t.p[0], v: Number(t.s) }))
      const yTicks = T.filter((t) => /\btiny\b/.test(t.cls) && Math.abs(t.p[0] - 56) < 0.5).map((t) => ({ px: t.p[1] - 1, v: Number(t.s) }))
      const X = scale(xTicks, ctx)
      const Y = scale(yTicks, ctx)
      const pts = svg.match(/<polyline class="plot" points="([^"]*)"/)![1].split(' ').map((s) => s.split(',').map(Number))
      const vals = new Map(pts.map(([px, py]) => [whole(X(px), ctx, 'a point'), whole(Y(py), ctx, 'a point')]))
      const at = words.match(/How tall was it in week (\d+)\?/)
      if (at) return { text: `${vals.get(Number(at[1]))} cm` }
      if (!/During which week did it grow the most\?/.test(words)) throw new Error('unknown line graph question')
      const gains = [1, 2, 3, 4, 5, 6].map((w) => vals.get(w)! - vals.get(w - 1)!)
      const top = Math.max(...gains)
      if (gains.filter((g) => g === top).length !== 1) ctx.fail('two weeks share the biggest growth')
      return { text: `week ${gains.indexOf(top) + 1}` }
    }
    case '7.03 type': {
      const v = words.match(/What type of data is the (.+)\?$/)![1]
      const t = typeOf(v)
      if (!t) throw new Error(`"${v}" is not in the key`)
      return { text: t }
    }
    case '7.03 which': {
      const m = words.match(/Which of these is (\w+) (\w+) data\?/)!
      return one((o) => typeOf(o) === `${m[2]} ${m[1]}`, `are ${m[2]} ${m[1]}`)
    }
    case '7.04 census': {
      // the population size is the first number in the question
      const N = words.match(/(\d+) (students|players|houses)/)![1]
      return one((o) => new RegExp(`^ask all ${N} `).test(o), 'ask the whole population')
    }
    case '7.04 bias':
      return one((o) => FAIR.test(o), 'are random')
    case '7.10 purpose': {
      const g = words.match(/A (.+?) is best for showing/)![1]
      const re = PURPOSE.find(([n]) => n === g)?.[1]
      if (!re) throw new Error(`no purpose for ${g}`)
      return one((o) => re.test(o), `describe a ${g}`)
    }
    case '7.07 total':
    case '7.07 mode':
    case '7.07 mean': {
      const rows = readTable(svg)
      const n = sum(rows.map(([, f]) => f))
      if (kind === '7.07 total') return { v: n }
      if (kind === '7.07 mode') {
        const top = Math.max(...rows.map(([, f]) => f))
        const at = rows.filter(([, f]) => f === top)
        if (at.length !== 1) ctx.fail('more than one mode')
        return { v: at[0][0] }
      }
      return { v: sum(rows.map(([x, f]) => x * f)) / n }
    }
    case '7.09 read': {
      const rows = readHist(svg, ctx)
      const x = Number(words.match(/have (\d+) pets?\?/)![1])
      return { v: rows.find(([s]) => s === x)![1] }
    }
    case '7.09 total':
      return { v: sum(readHist(svg, ctx).map(([, f]) => f)) }
    case '7.09 mode': {
      const rows = readHist(svg, ctx)
      const top = Math.max(...rows.map(([, f]) => f))
      if (rows.filter(([, f]) => f === top).length !== 1) ctx.fail('more than one mode')
      return { v: rows.find(([, f]) => f === top)![0] }
    }
    case '7.10 best': {
      const k = BEST.find(([re]) => re.test(words))?.[1]
      if (!k) throw new Error('data not in the key')
      return { text: k }
    }
    case '7.11 shape': {
      const fs = readHist(svg, ctx).map(([, f]) => f)
      if (fs.every((f) => f === fs[0])) return { text: 'uniform' }
      if (fs.every((f, i) => f === fs[fs.length - 1 - i])) return { text: 'symmetrical' }
      // the tallest column near one end and the tail on the other side
      const peak = fs.indexOf(Math.max(...fs))
      const leftMass = sum(fs.slice(0, Math.floor(fs.length / 2)))
      const rightMass = sum(fs.slice(Math.ceil(fs.length / 2)))
      if (peak < fs.length / 2 && leftMass > rightMass) return { text: 'positively skewed' }
      if (peak >= fs.length / 2 && rightMass > leftMass) return { text: 'negatively skewed' }
      ctx.fail('the shape is unclear')
      return null
    }
  }
  ctx.fail('no independent check for this kind of question')
  return null
}
