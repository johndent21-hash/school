// Independent answers for the NCM 8 Chapter 5 (Area and volume) class games, used by tests/games.test.ts.
// Kinds reused from NCM 7 Chapter 8 (meta.reused) are checked by that chapter's checks, so only the new kinds are here.
// Everything is read from what the student sees:
//  - word questions: the shape's name and the numbers in the prompt;
//  - drawings: each length label is matched to the side or line it sits beside, the drawing must be in proportion
//    to its labels (cylinders are marked "not to scale" and only checked for radius or diameter), and the answer is
//    worked out from the labels; sectors are measured for their angle (any angle label must agree);
//  - circle parts are recognised from the geometry: where a line's ends lie, whether it reaches the circle once,
//    and whether a shaded region is closed through the centre (a sector) or by a chord (a segment);
//  - formulas and words: a key written here, separately from the content file.
import type { GameQuestion, GameSet } from '../../src/lib/game/types'
import type { Ctx, Expect } from './ncm7-ch1'

type P = [number, number]
const NUMS = '(-?[\\d.]+)'
const dist = (a: P, b: P) => Math.hypot(a[0] - b[0], a[1] - b[1])
const mid = (a: P, b: P): P => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
const val = (s: string) => Number(s.replace(/[\s\u00a0]/g, ''))

function texts(svg: string) {
  return [...svg.matchAll(new RegExp(`<text class="([^"]*)" x="${NUMS}" y="${NUMS}"(?: text-anchor="(\\w+)")?[^>]*>(.*?)</text>`, 'g'))].map((m) => ({
    cls: m[1],
    p: [Number(m[2]), Number(m[3])] as P,
    anchor: m[4] ?? 'middle',
    s: m[5].replace(/<[^>]*>/g, '').replace(/\u00a0/g, ' ').trim(),
  }))
}
/** a length label "12 cm" → 12 and "cm" */
function length(s: string): { v: number; u: string } {
  const m = s.match(/^([\d\s.]+) (mm|cm|m|km)$/)
  if (!m) throw new Error(`not a length: "${s}"`)
  return { v: val(m[1]), u: m[2] }
}
const polyPts = (svg: string, cls = 'sh') => {
  const m = svg.match(new RegExp(`<polygon class="${cls}" points="([^"]*)"`))
  if (!m) throw new Error('no shape drawn')
  return m[1].split(' ').map((s) => s.split(',').map(Number) as P)
}
const lines = (svg: string, cls: string) =>
  [...svg.matchAll(new RegExp(`<line class="${cls}"(?: style="[^"]*")? x1="${NUMS}" y1="${NUMS}" x2="${NUMS}" y2="${NUMS}"`, 'g'))].map((m) => [
    [Number(m[1]), Number(m[2])],
    [Number(m[3]), Number(m[4])],
  ] as [P, P])
/** drawn lengths and their labels are in the same proportion */
function inProportion(pairs: [number, number][], ctx: Ctx, what: string) {
  const k = pairs[0][0] / pairs[0][1]
  if (pairs.some(([px, v]) => Math.abs(px / v / k - 1) > 0.02)) ctx.fail(`${what} is not drawn to scale`)
}

/** the full circle in a drawing, and its highlighted line (a radius or diameter) */
function circleWithLine(svg: string, ctx: Ctx): { r: number; shows: 'radius' | 'diameter'; label: { v: number; u: string } } {
  const r = Number(svg.match(/<circle class="sh"[^>]* r="([\d.]+)"/)![1])
  const [a, b] = lines(svg, 'ln hlstroke')[0]
  const len = dist(a, b)
  const shows = Math.abs(len - r) < 1 ? 'radius' : Math.abs(len - 2 * r) < 1 ? 'diameter' : null
  if (!shows) ctx.fail('the highlighted line is neither a radius nor a diameter')
  const labs = texts(svg).filter((t) => /\bside\b/.test(t.cls))
  if (labs.length !== 1) ctx.fail(`${labs.length} labels on the circle`)
  return { r, shows: shows ?? 'radius', label: length(labs[0].s) }
}

/** the angle of a sector drawn as "M centre L p A s,s 0 large sweep q Z", measured anticlockwise on screen from p to q */
function sectorAngle(svg: string, ctx: Ctx): number {
  const m = svg.match(new RegExp(`<path class="sh sector-sh" d="M${NUMS},${NUMS} L${NUMS},${NUMS} A${NUMS},${NUMS} 0 (\\d) (\\d) ${NUMS},${NUMS} Z"`))
  if (!m) throw new Error('no sector drawn')
  const [C, p, q]: P[] = [[+m[1], +m[2]], [+m[3], +m[4]], [+m[9], +m[10]]]
  const large = m[7] === '1'
  const s = +m[5]
  if (Math.abs(dist(C, p) - s) > 0.5 || Math.abs(dist(C, q) - s) > 0.5) ctx.fail('the sector edges are not radii')
  const ang = (x: P) => (Math.atan2(-(x[1] - C[1]), x[0] - C[0]) * 180) / Math.PI
  let a = Math.abs(ang(q) - ang(p)) % 360
  if (a > 180) a = 360 - a
  // the larger angle when the drawing takes the long way round
  if (large) a = 360 - a
  const deg = Math.round(a)
  if (Math.abs(a - deg) > 0.3) ctx.fail(`the sector is drawn at ${a.toFixed(2)}°`)
  const label = texts(svg).find((t) => t.s.endsWith('°'))
  if (label && Number(label.s.replace('°', '')) !== deg) ctx.fail(`the angle says ${label.s} but is drawn at ${deg}°`)
  if (!label && deg !== 90 && deg !== 180) ctx.fail('the angle is not shown')
  if (deg === 90 && !/class="rm"/.test(svg)) ctx.fail('a quadrant without its right-angle mark')
  return deg
}

/** the name of the highlighted part of a circle, from the drawing */
function circlePart(svg: string, ctx: Ctx): string {
  const cm = svg.match(/<circle class="sh" cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"/)!
  const C: P = [+cm[1], +cm[2]]
  const r = +cm[3]
  const on = (p: P) => Math.abs(dist(p, C) - r) < 0.6
  const ln = lines(svg, 'ln hlstroke part')
  if (ln.length) {
    const [a, b] = ln[0]
    if (dist(a, C) < 0.6 && on(b)) return 'radius'
    if (on(a) && on(b)) return dist(mid(a, b), C) < 0.6 ? 'diameter' : 'chord'
    // a line that stays outside the circle except for one point: its nearest point to the centre is at distance r
    const t = ((C[0] - a[0]) * (b[0] - a[0]) + (C[1] - a[1]) * (b[1] - a[1])) / dist(a, b) ** 2
    const foot: P = [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]
    if (t > 0 && t < 1 && Math.abs(dist(foot, C) - r) < 0.6 && dist(a, C) > r && dist(b, C) > r) return 'tangent'
    ctx.fail('the coloured line is not a circle part')
    return '?'
  }
  const arc = svg.match(new RegExp(`<path class="arc hlstroke part"[^>]* d="M${NUMS},${NUMS} A[\\d.]+,[\\d.]+ 0 0 0 ${NUMS},${NUMS}"`))
  if (arc) {
    if (!on([+arc[1], +arc[2]]) || !on([+arc[3], +arc[4]])) ctx.fail('the arc is not on the circle')
    return 'arc'
  }
  const reg = svg.match(new RegExp(`<path class="sh hlfill part" d="M${NUMS},${NUMS}(?: L${NUMS},${NUMS})? A[\\d.]+,[\\d.]+ 0 (\\d) 0 ${NUMS},${NUMS} Z"`))
  if (!reg) throw new Error('no part highlighted')
  const start: P = [+reg[1], +reg[2]]
  if (reg[3] === undefined) {
    // closed by a chord: a segment, unless the chord is a diameter
    const end: P = [+reg[6], +reg[7]]
    if (dist(mid(start, end), C) < 0.6) ctx.fail('a "segment" cut off by a diameter')
    return 'segment'
  }
  if (dist(start, C) > 0.6) ctx.fail('a region with a corner that is not the centre')
  const p: P = [+reg[3], +reg[4]]
  const q: P = [+reg[6], +reg[7]]
  // (atan2, not acos: acos is too sensitive to rounding near 180°)
  const ang = (x: P) => (Math.atan2(-(x[1] - C[1]), x[0] - C[0]) * 180) / Math.PI
  let a = Math.abs(ang(q) - ang(p)) % 360
  if (a > 180) a = 360 - a
  if (reg[5] === '1') a = 360 - a
  if (Math.abs(a - 90) < 0.5) return 'quadrant'
  if (Math.abs(a - 180) < 0.5) return 'semicircle'
  // a sector that could be mistaken for a quadrant or semicircle would be unfair
  if (Math.abs(a - 90) < 25 || Math.abs(a - 180) < 25) ctx.fail(`a sector of ${a.toFixed(0)}° looks like a quadrant or semicircle`)
  return 'sector'
}

// a key written separately from the content file
const DESCRIBE: [RegExp, string][] = [
  [/from the centre to the circle/, 'radius'],
  [/through the centre, from one side/, 'diameter'],
  [/joins two points on the circle but misses the centre/, 'chord'],
  [/touches the circle at only one point/, 'tangent'],
  [/curved part of the circumference/, 'arc'],
  [/between a chord and an arc/, 'segment'],
  [/between two radii and an arc/, 'sector'],
  [/distance around a circle/, 'circumference'],
  [/quarter of a circle/, 'quadrant'],
]
const FORMULA: [RegExp, string][] = [
  [/area of a circle with radius/, 'A=πr^2'],
  [/area of a semicircle with radius/, 'A=(1/2)πr^2'],
  [/A trapezium has parallel sides a and b .* Which formula gives its area\?/, 'A=(h/2)(a+b)'],
  [/The diagonals of a (kite|rhombus) are x and y\. Which formula gives its area\?/, 'A=(1/2)xy'],
  [/what are a and b\?/, 'the parallel sides'],
  [/what is h\?/, 'the perpendicular height'],
  [/volume of a cylinder with radius r and height h/, 'V=πr^2h'],
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
  // plain text puts spaces where tags were: "24π m ." → "24π m."
  const words = ctx.plain(q.prompt).replace(/\s+([.?,)])/g, '$1').replace(/\(\s+/g, '(')
  const lens = [...words.matchAll(/([\d.]+(?: \d{3})*) (mm|cm|m|km)\b(?!²|³)/g)].map((m) => ({ v: val(m[1]), u: m[2] }))
  const key = (list: [RegExp, string][]) => list.find(([re]) => re.test(words))?.[1]
  switch (kind) {
    case '5.14 litres': {
      const m = words.match(/is (\d+) cm long, (\d+) cm wide and (\d+) cm deep inside\. How many litres/)!
      const L = (Number(m[1]) * Number(m[2]) * Number(m[3])) / 1000
      if (!Number.isInteger(L)) ctx.fail('not a whole number of litres')
      return { text: `${L} L` }
    }
    case '5.01 quad': {
      const shape = words.match(/A (parallelogram|kite|rhombus|rectangle) has/)![1]
      if (shape === 'rhombus') return { v: 4 * lens[0].v, unit: lens[0].u }
      if (lens.length !== 2) ctx.fail('expected two side lengths')
      return { v: 2 * (lens[0].v + lens[1].v), unit: lens[0].u }
    }
    case '5.01 composite': {
      const pts = polyPts(svg)
      // every corner a right angle, as the question says
      pts.forEach((p, i) => {
        const a = pts[(i + pts.length - 1) % pts.length]
        const c = pts[(i + 1) % pts.length]
        if (Math.abs((a[0] - p[0]) * (c[0] - p[0]) + (a[1] - p[1]) * (c[1] - p[1])) > 0.5) ctx.fail('a corner is not a right angle')
      })
      const sides = pts.map((p, i) => ({ a: p, b: pts[(i + 1) % pts.length] }))
      const pairs: [number, number][] = []
      let u = ''
      for (const t of texts(svg).filter((x) => /\bside\b/.test(x.cls))) {
        // a label belongs to the side it sits beside the middle of; two such sides would be ambiguous
        const near = sides
          .map((sd) => {
            const L2 = dist(sd.a, sd.b) ** 2
            const along = ((t.p[0] - sd.a[0]) * (sd.b[0] - sd.a[0]) + (t.p[1] - sd.a[1]) * (sd.b[1] - sd.a[1])) / L2
            const off = Math.abs((t.p[0] - sd.a[0]) * (sd.b[1] - sd.a[1]) - (t.p[1] - sd.a[1]) * (sd.b[0] - sd.a[0])) / Math.sqrt(L2)
            return { sd, along, off }
          })
          .filter((o) => o.along > 0.25 && o.along < 0.75 && o.off < 45)
        if (near.length !== 1) ctx.fail(`the label ${t.s} is beside ${near.length} sides`)
        if (!near.length) continue
        const s = near[0].sd
        const L = length(t.s)
        u = L.u
        pairs.push([dist(s.a, s.b), L.v])
      }
      if (pairs.length < 4) ctx.fail('too few sides labelled to find the rest')
      inProportion(pairs, ctx, 'the shape')
      const k = pairs[0][0] / pairs[0][1]
      const P = sides.reduce((sum, s) => sum + dist(s.a, s.b), 0) / k
      if (Math.abs(P - Math.round(P)) > 0.05) ctx.fail('the perimeter is not a whole number')
      return { v: Math.round(P), unit: u }
    }
    case '5.02 name':
      return { text: circlePart(svg, ctx) }
    case '5.02 describe': {
      const k = key(DESCRIBE)
      if (!k) throw new Error('description not in the key')
      return { text: k }
    }
    case '5.03 back': {
      const m = words.match(/circumference of ([\d ]+)π (mm|cm|m)\. What is its (radius|diameter)\?/)!
      const d = val(m[1])
      return { v: m[3] === 'radius' ? d / 2 : d, unit: m[2] }
    }
    case '5.04 km': {
      const m = words.match(/Convert ([\d .]+) (km²|ha) to (hectares|square metres|square kilometres)\./)!
      const v = val(m[1])
      const toHa: Record<string, number> = { 'km²': 100, ha: 1 }
      const to = { hectares: ['ha', 1], 'square metres': ['m²', 1 / 10000], 'square kilometres': ['km²', 100] }[m[3]] as [string, number]
      return { v: Number(((v * toHa[m[2]]) / to[1]).toPrecision(12)), unit: to[0] }
    }
    case '5.07 exactR':
    case '5.07 exactD':
    case '5.07 estimate': {
      const c = circleWithLine(svg, ctx)
      if (kind !== '5.07 exactD' && c.shows !== 'radius') ctx.fail('expected a radius')
      if (kind === '5.07 exactD' && c.shows !== 'diameter') ctx.fail('expected a diameter')
      const r = c.shows === 'radius' ? c.label.v : c.label.v / 2
      if (kind === '5.07 estimate') {
        if (!words.includes('π ≈ 3')) ctx.fail('no π ≈ 3')
        return { v: 3 * r * r, unit: c.label.u + '²' }
      }
      if (!words.includes('in terms of π')) ctx.fail('not asked in terms of π')
      return { v: r * r, unit: c.label.u + '²', pi: true }
    }
    case '5.07 part': {
      const path = svg.match(/<path class="sh" d="([^"]*)"/)![1]
      const isQuarter = / L/.test(path) && /class="rm"/.test(svg)
      const name = words.match(/area of this (semicircle|quadrant)/)![1]
      if ((name === 'quadrant') !== isQuarter) ctx.fail(`the drawing is not a ${name}`)
      const [a, b] = lines(svg, 'ln hlstroke')[0]
      const R = Number(path.match(/A([\d.]+),/)![1])
      if (Math.abs(dist(a, b) - R) > 1) ctx.fail('the labelled line is not a radius')
      const L = length(texts(svg).find((t) => /\bside\b/.test(t.cls))!.s)
      return { v: (L.v * L.v) / (isQuarter ? 4 : 2), unit: L.u + '²', pi: true }
    }
    case '5.07 back': {
      const m = words.match(/area of ([\d ]+)π (mm|cm|m)²\. What is its radius\?/)!
      const r = Math.sqrt(val(m[1]))
      if (!Number.isInteger(r)) ctx.fail('the radius is not whole')
      return { v: r, unit: m[2] }
    }
    case '5.07 formula':
    case '5.09 formula':
    case '5.10 formula':
    case '5.13 formula': {
      const k = key(FORMULA)
      if (k === undefined) throw new Error('formula not in the key')
      return { text: k }
    }
    case '5.08 fraction': {
      const deg = sectorAngle(svg, ctx)
      const g = gcd(deg, 360)
      return { text: `(${deg / g}/${360 / g})` }
    }
    case '5.08 arc':
    case '5.08 area':
    case '5.08 perimeter': {
      const deg = sectorAngle(svg, ctx)
      const L = length(texts(svg).find((t) => /\bside\b/.test(t.cls))!.s)
      const arc = (deg * 2 * L.v) / 360
      if (kind === '5.08 area') return { v: (deg * L.v * L.v) / 360, unit: L.u + '²', pi: true }
      if (kind === '5.08 arc') return { v: arc, unit: L.u, pi: true }
      return { text: `(${arc}π+${2 * L.v})${L.u}` }
    }
    case '5.09 area': {
      // corners: bottom-left, bottom-right, top-right, top-left; the dashed line is the height
      const [A, B, C, D] = polyPts(svg)
      const [h1, h2] = lines(svg, 'ln dash')[0]
      if (Math.abs(A[1] - B[1]) > 0.5 || Math.abs(C[1] - D[1]) > 0.5 || Math.abs(h1[0] - h2[0]) > 0.5) ctx.fail('the parallel sides or the height are not drawn straight')
      const labs = texts(svg).filter((t) => /\bside\b/.test(t.cls))
      const hl = labs.find((t) => t.anchor === 'start')!
      const others = labs.filter((t) => t !== hl)
      const bot = others.reduce((x, y) => (dist(y.p, mid(A, B)) < dist(x.p, mid(A, B)) ? y : x))
      const top = others.find((t) => t !== bot)!
      const [a, bb, h] = [length(top.s), length(bot.s), length(hl.s)]
      inProportion([[dist(D, C), a.v], [dist(A, B), bb.v], [dist(h1, h2), h.v]], ctx, 'the trapezium')
      return { v: (h.v * (a.v + bb.v)) / 2, unit: a.u + '²' }
    }
    case '5.09 words': {
      const m = words.match(/parallel sides (\d+) m and (\d+) m long, which are (\d+) m apart/)!
      return { v: (+m[3] * (+m[1] + +m[2])) / 2, unit: 'm²' }
    }
    case '5.09 height': {
      const m = words.match(/area of ([\d ]+) (mm|cm|m)² and parallel sides (\d+) \2 and (\d+) \2\./)!
      return { v: (2 * val(m[1])) / (+m[3] + +m[4]), unit: m[2] }
    }
    case '5.10 kite':
    case '5.10 rhombus': {
      const pts = polyPts(svg)
      const [Lp, Bm, R, T] = pts
      const sides = pts.map((p, i) => dist(p, pts[(i + 1) % 4]))
      const rhombus = sides.every((s) => Math.abs(s - sides[0]) < 0.5)
      if (rhombus !== (kind === '5.10 rhombus')) ctx.fail(`the drawing is not a ${kind.slice(5)}`)
      const labs = texts(svg).filter((t) => /\bside\b/.test(t.cls))
      const yl = labs.find((t) => t.anchor === 'start')!
      const xl = labs.find((t) => t !== yl)!
      const [x, y] = [length(xl.s), length(yl.s)]
      inProportion([[dist(Lp, R), x.v], [dist(T, Bm), y.v]], ctx, 'the shape')
      return { v: (x.v * y.v) / 2, unit: x.u + '²' }
    }
    case '5.10 back': {
      const m = words.match(/area of ([\d ]+) (mm|cm|m)² and one diagonal (\d+) \2 long/)!
      return { v: (2 * val(m[1])) / +m[3], unit: m[2] }
    }
    case '5.13 exact':
    case '5.13 diameter':
    case '5.13 estimate': {
      const rx = Number(svg.match(/<ellipse class="sh sh2"[^>]* rx="([\d.]+)"/)![1])
      const cx = Number(svg.match(/<ellipse class="sh sh2" cx="([\d.]+)"/)![1])
      const [a, b] = lines(svg, 'ln hlstroke')[0]
      const shows = Math.abs(dist(a, b) - rx) < 1 ? 'radius' : Math.abs(dist(a, b) - 2 * rx) < 1 ? 'diameter' : null
      if ((shows === 'diameter') !== (kind === '5.13 diameter')) ctx.fail('the labelled line is not what the question needs')
      if (!/not drawn to scale/i.test(ctx.plain(q.note ?? ''))) ctx.fail('a cylinder not drawn to scale without saying so')
      const labs = texts(svg).filter((t) => /\bside\b/.test(t.cls))
      const hl = labs.find((t) => t.p[0] > cx + rx)!
      const rl = labs.find((t) => t !== hl)!
      const h = length(hl.s)
      const r = shows === 'diameter' ? length(rl.s).v / 2 : length(rl.s).v
      if (kind === '5.13 estimate') {
        if (!words.includes('π ≈ 3')) ctx.fail('no π ≈ 3')
        return { v: 3 * r * r * h.v, unit: h.u + '³' }
      }
      return { v: r * r * h.v, unit: h.u + '³', pi: true }
    }
  }
  ctx.fail('no independent check for this kind of question')
  return null
}
