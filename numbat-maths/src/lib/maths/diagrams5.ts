// Diagrams for Year 9 coordinate geometry and graphs (New Century Maths 9 Chapter 11):
// a number plane with intervals, rise/run triangles, lines, horizontal and vertical lines, parabolas and
// dashed reading lines; a rise/run triangle on its own; graphs of real-world relationships with scaled
// axes; and quick sketch graphs that show only the key numbers. Same CSS classes as the other diagrams,
// so they follow the light and dark themes.

import { num } from './format'
import { dot, line, rightMark, svg, text } from './diagrams'

type P = [number, number]
const f = (x: number) => Number(x.toFixed(2))
let clipCount = 0
const clipId = () => `cg${++clipCount}${Math.floor(Math.random() * 1e6)}`

export type LabelPos = 'ne' | 'nw' | 'se' | 'sw' | 'n' | 's' | 'e' | 'w'
const OFFSET: Record<LabelPos, [number, number, 'start' | 'end' | 'middle']> = {
  ne: [8, -10, 'start'],
  nw: [-8, -10, 'end'],
  se: [8, 16, 'start'],
  sw: [-8, 16, 'end'],
  n: [0, -12, 'middle'],
  s: [0, 19, 'middle'],
  e: [10, 4, 'start'],
  w: [-10, 4, 'end'],
}

export interface CoordOpts {
  xmin: number
  xmax: number
  ymin: number
  ymax: number
  /** number every n grid lines (default: 1, or 2 on big planes) */
  labelEvery?: number
  points?: { x: number; y: number; label?: string; pos?: LabelPos }[]
  /** intervals; legs: the dashed run and rise of a right-angled triangle; legLabels: write their lengths */
  segments?: { a: P; b: P; legs?: boolean; legLabels?: boolean; name?: string }[]
  /** lines y = mx + c */
  lines?: { m: number; c: number; label?: string; alt?: boolean }[]
  /** vertical lines x = k */
  vlines?: { x: number; label?: string }[]
  /** curves y = fn(x), e.g. parabolas */
  curves?: { fn: (x: number) => number; label?: string; alt?: boolean }[]
  /** dashed reading lines: across at height y, or up and down at x */
  guides?: { x?: number; y?: number }[]
  /** a filled quadrilateral or triangle (vertices in order) */
  shape?: P[]
  size?: number
}

/** A number plane, one grid square per unit. */
export function plane(o: CoordOpts): string {
  const cells = Math.max(o.xmax - o.xmin, o.ymax - o.ymin)
  const S = o.size ?? 320
  const step = (S - 40) / cells
  const W = (o.xmax - o.xmin) * step + 60
  const H = (o.ymax - o.ymin) * step + 40
  const X = (x: number) => 22 + (x - o.xmin) * step
  const Y = (y: number) => 20 + (o.ymax - y) * step
  const every = o.labelEvery ?? (cells > 14 ? 2 : 1)
  let body = ''
  for (let x = o.xmin; x <= o.xmax; x++) body += line([X(x), Y(o.ymin)], [X(x), Y(o.ymax)], 'grid')
  for (let y = o.ymin; y <= o.ymax; y++) body += line([X(o.xmin), Y(y)], [X(o.xmax), Y(y)], 'grid')
  const xAxisY = o.ymin <= 0 && o.ymax >= 0 ? Y(0) : Y(o.ymin)
  const yAxisX = o.xmin <= 0 && o.xmax >= 0 ? X(0) : X(o.xmin)
  body += line([X(o.xmin) - 6, xAxisY], [X(o.xmax) + 10, xAxisY], 'axis')
  body += line([yAxisX, Y(o.ymin) + 6], [yAxisX, Y(o.ymax) - 10], 'axis')
  body += text([X(o.xmax) + 16, xAxisY], '<tspan font-style="italic">x</tspan>', 'dl small', 'start')
  body += text([yAxisX + 12, Y(o.ymax) - 7], '<tspan font-style="italic">y</tspan>', 'dl small')
  // axis numbers go on top of any shaded shape, so they are added after it (below)
  let ticks = ''
  for (let x = o.xmin; x <= o.xmax; x++) if (x !== 0 && x % every === 0) ticks += text([X(x), xAxisY + 12], num(x), 'dl tiny')
  for (let y = o.ymin; y <= o.ymax; y++) if (y !== 0 && y % every === 0) ticks += text([yAxisX - 7, Y(y)], num(y), 'dl tiny', 'end')
  if (o.xmin <= 0 && o.ymin <= 0) ticks += text([yAxisX - 6, xAxisY + 11], '0', 'dl tiny', 'end')

  const id = clipId()
  body += `<clipPath id="${id}"><rect x="${f(X(o.xmin))}" y="${f(Y(o.ymax))}" width="${f(X(o.xmax) - X(o.xmin))}" height="${f(Y(o.ymin) - Y(o.ymax))}"/></clipPath>`
  let clipped = ''
  if (o.shape) clipped += `<polygon class="sh" style="fill-opacity:0.6" points="${o.shape.map(([x, y]) => `${f(X(x))},${f(Y(y))}`).join(' ')}"/>`
  for (const g of o.guides ?? []) {
    if (g.y !== undefined) clipped += line([X(o.xmin), Y(g.y)], [X(o.xmax), Y(g.y)], 'ln dash hlstroke')
    if (g.x !== undefined) clipped += line([X(g.x), Y(o.ymin)], [X(g.x), Y(o.ymax)], 'ln dash hlstroke')
  }
  for (const l of o.lines ?? []) clipped += line([X(o.xmin - 1), Y(l.m * (o.xmin - 1) + l.c)], [X(o.xmax + 1), Y(l.m * (o.xmax + 1) + l.c)], l.alt ? 'plot plot2' : 'plot')
  for (const v of o.vlines ?? []) clipped += line([X(v.x), Y(o.ymin - 1)], [X(v.x), Y(o.ymax + 1)], 'plot')
  for (const c of o.curves ?? []) {
    let d = ''
    const N = 160
    for (let i = 0; i <= N; i++) {
      const x = o.xmin + ((o.xmax - o.xmin) * i) / N
      const y = Math.max(o.ymin - 3, Math.min(o.ymax + 3, c.fn(x)))
      d += (i === 0 ? 'M' : 'L') + f(X(x)) + ',' + f(Y(y))
    }
    clipped += `<path class="${c.alt ? 'plot plot2' : 'plot'}" d="${d}"/>`
  }
  for (const s of o.segments ?? []) {
    clipped += line([X(s.a[0]), Y(s.a[1])], [X(s.b[0]), Y(s.b[1])], 'plot')
    if (s.legs && s.a[0] !== s.b[0] && s.a[1] !== s.b[1]) {
      // the right angle sits below the higher end and level with the lower end
      const [lo, hi] = s.a[1] < s.b[1] ? [s.a, s.b] : [s.b, s.a]
      const corner: P = [hi[0], lo[1]]
      clipped += line([X(lo[0]), Y(lo[1])], [X(corner[0]), Y(corner[1])], 'ln dash') + line([X(corner[0]), Y(corner[1])], [X(hi[0]), Y(hi[1])], 'ln dash')
      // right-angle mark opening towards the interval
      const start = lo[0] < corner[0] ? 90 : 0
      clipped += rightMark([X(corner[0]), Y(corner[1])], start, 9)
      if (s.legLabels) {
        const run = Math.abs(hi[0] - lo[0])
        const rise = Math.abs(hi[1] - lo[1])
        clipped += text([(X(lo[0]) + X(corner[0])) / 2, Y(corner[1]) + 14], num(run), 'dl small hl')
        clipped += text([X(corner[0]) + (lo[0] < corner[0] ? 12 : -12), (Y(corner[1]) + Y(hi[1])) / 2 + 4], num(rise), 'dl small hl', lo[0] < corner[0] ? 'start' : 'end')
      }
    }
  }
  body += `<g clip-path="url(#${id})">${clipped}</g>` + ticks

  // labels for lines, curves and named intervals, placed inside the plane
  const inside = (x: number, y: number) => x > o.xmin + 0.3 && x < o.xmax - 0.3 && y > o.ymin + 0.4 && y < o.ymax - 0.4
  for (const l of o.lines ?? []) {
    if (!l.label) continue
    if (l.m === 0) {
      // horizontal lines are labelled just outside the grid, on the right
      body += text([X(o.xmax) + 6, Y(l.c)], l.label, 'dl small hl', 'start')
      continue
    }
    for (let x = o.xmax - 0.8; x > o.xmin + 0.5; x -= 0.25) {
      const y = l.m * x + l.c
      if (inside(x, y) && Math.abs(y) > 0.8) {
        body += text([X(x) + 6, Y(y) - 8], l.label, 'dl small hl', 'end')
        break
      }
    }
  }
  for (const c of o.curves ?? []) {
    if (!c.label) continue
    for (let x = o.xmax - 0.6; x > 0; x -= 0.1) {
      const y = c.fn(x)
      if (inside(x, y)) {
        body += text([X(x) + 6, Y(y) + (y > 0 ? -6 : 14)], c.label, 'dl small hl', 'start')
        break
      }
    }
  }
  for (const v of o.vlines ?? []) if (v.label) body += text([X(v.x) + 6, Y(o.ymax) + 12], v.label, 'dl small hl', 'start')
  for (const s of o.segments ?? []) if (s.name) body += text([(X(s.a[0]) + X(s.b[0])) / 2 + 8, (Y(s.a[1]) + Y(s.b[1])) / 2 - 6], s.name, 'dl small hl', 'start')
  for (const p of o.points ?? []) {
    body += dot([X(p.x), Y(p.y)], 4, 'pt hlfill')
    if (p.label) {
      const [dx, dy, anchor] = OFFSET[p.pos ?? 'ne']
      body += text([X(p.x) + dx, Y(p.y) + dy], p.label, 'dl small', anchor)
    }
  }
  return svg(W, H, body, 'Number plane', Math.round(Math.min(380, W * 1.3)))
}

/** A line with a dashed rise/run triangle and the lengths written on (no axes). rise may be negative. */
export function slopeTriangle(rise: number, run: number, showLabels = true): string {
  // draw roughly to scale, within a box
  const k = Math.min(130 / run, 130 / Math.abs(rise), 34)
  const w = run * k
  const h = Math.abs(rise) * k
  const ext = 0.35
  // room for the line beyond the two points (ext of the triangle each way) and for the labels
  const left = 24 + w * ext
  const top = 26 + h * ext
  const W = left + w * (1 + ext) + 90
  const H = top + h * (1 + ext) + 30
  // the two points on the line
  const A: P = rise > 0 ? [left, top + h] : [left, top]
  const B: P = rise > 0 ? [left + w, top] : [left + w, top + h]
  const dx = B[0] - A[0]
  const dy = B[1] - A[1]
  let body = line([A[0] - dx * ext, A[1] - dy * ext], [B[0] + dx * ext, B[1] + dy * ext], 'plot')
  body += dot(A, 3.5, 'pt') + dot(B, 3.5, 'pt')
  // run goes right from the left point, rise goes up (or down) to the right point
  const C: P = [B[0], A[1]]
  body += line(A, C, 'ln dash') + line(C, B, 'ln dash')
  body += rightMark(C, rise > 0 ? 90 : 180, 9)
  if (showLabels) {
    body += text([(A[0] + C[0]) / 2, C[1] + (rise > 0 ? 18 : -10)], `run ${num(run)}`, 'dl small')
    body += text([C[0] + 10, (C[1] + B[1]) / 2 + 4], `${rise > 0 ? 'rise' : 'drop'} ${num(Math.abs(rise))}`, 'dl small', 'start')
  }
  return svg(W, H, body, 'Line with a rise and run triangle', Math.round(Math.min(300, W * 1.2)))
}

export interface GraphOpts {
  xmax: number
  xstep: number
  xlabel: string
  ymax: number
  ystep: number
  ylabel: string
  /** grid lines between labelled values (default 2) */
  minor?: number
  /** straight-line pieces in data units; label: written beside the line */
  series: { pts: P[]; label?: string; alt?: boolean }[]
  /** dashed reading lines: from x up to the line then across, or from y across then down */
  reads?: { from: 'x' | 'y'; value: number; series?: number }[]
  /** marked points on the line */
  marks?: P[]
  title?: string
}

/** A graph of a real-world relationship: scaled axes from 0 with titles, light grid. */
export function lineGraph(o: GraphOpts): string {
  const W = 360
  const H = 270
  const L = 62
  const B = 52
  const T = o.title ? 30 : 16
  const R = 26
  const pw = W - L - R
  const ph = H - T - B
  const X = (x: number) => L + (x / o.xmax) * pw
  const Y = (y: number) => T + ph - (y / o.ymax) * ph
  const minor = o.minor ?? 2
  let body = ''
  if (o.title) body += text([L + pw / 2, 16], o.title, 'dl small')
  for (let i = 0; i <= (o.xmax / o.xstep) * minor; i++) {
    const x = (i * o.xstep) / minor
    body += line([X(x), Y(0)], [X(x), Y(o.ymax)], 'grid')
  }
  for (let i = 0; i <= (o.ymax / o.ystep) * minor; i++) {
    const y = (i * o.ystep) / minor
    body += line([X(0), Y(y)], [X(o.xmax), Y(y)], 'grid')
  }
  body += line([X(0), Y(0)], [X(o.xmax) + 8, Y(0)], 'axis') + line([X(0), Y(0)], [X(0), Y(o.ymax) - 8], 'axis')
  for (let x = o.xstep; x <= o.xmax + 1e-9; x += o.xstep) body += text([X(x), Y(0) + 14], num(x), 'dl tiny')
  for (let y = 0; y <= o.ymax + 1e-9; y += o.ystep) body += text([X(0) - 6, Y(y) + 1], num(y), 'dl tiny', 'end')
  body += text([L + pw / 2, H - 12], o.xlabel, 'dl small')
  body += `<text class="dl small" x="16" y="${f(T + ph / 2)}" text-anchor="middle" dominant-baseline="central" transform="rotate(-90 16 ${f(T + ph / 2)})">${o.ylabel}</text>`
  const at = (s: P[], x: number) => {
    for (let i = 0; i < s.length - 1; i++) {
      const [a, b] = [s[i], s[i + 1]]
      if (x >= Math.min(a[0], b[0]) - 1e-9 && x <= Math.max(a[0], b[0]) + 1e-9) return a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0])
    }
    return NaN
  }
  const atY = (s: P[], y: number) => {
    for (let i = 0; i < s.length - 1; i++) {
      const [a, b] = [s[i], s[i + 1]]
      if (y >= Math.min(a[1], b[1]) - 1e-9 && y <= Math.max(a[1], b[1]) + 1e-9 && b[1] !== a[1]) return a[0] + ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1])
    }
    return NaN
  }
  for (const r of o.reads ?? []) {
    const s = o.series[r.series ?? 0].pts
    const [x, y] = r.from === 'x' ? [r.value, at(s, r.value)] : [atY(s, r.value), r.value]
    body += line([X(x), Y(0)], [X(x), Y(y)], 'ln dash hlstroke') + line([X(0), Y(y)], [X(x), Y(y)], 'ln dash hlstroke')
  }
  for (const s of o.series) {
    body += `<polyline class="${s.alt ? 'plot plot2' : 'plot'}" points="${s.pts.map(([x, y]) => `${f(X(x))},${f(Y(y))}`).join(' ')}"/>`
    if (s.label) {
      const [x, y] = s.pts[s.pts.length - 1]
      body += text([X(x) - 4, Y(y) - 9], s.label, 'dl small hl', 'end')
    }
  }
  for (const m of o.marks ?? []) body += dot([X(m[0]), Y(m[1])], 3.5, 'pt hlfill')
  return svg(W, H, body, 'Graph', 400)
}

export interface SketchOpts {
  /** y = m x + c, or y = a x² + c */
  kind: 'line' | 'parabola'
  m?: number
  c: number
  a?: number
  /** numbers written on the axes where the graph crosses them */
  showX?: boolean
  showY?: boolean
  /** a labelled point on the graph, e.g. (4, 4) */
  point?: P
}

/** A quick sketch (not to scale): axes, the graph, and only the key numbers. */
export function sketch(o: SketchOpts): string {
  const W = 220
  const H = 200
  const cx = 110
  const cy = 100
  // choose a window around the features that matter
  const feats: number[] = [Math.abs(o.c), 1]
  let xint: number | null = null
  if (o.kind === 'line' && o.m) xint = -o.c / o.m
  if (o.kind === 'parabola' && o.a && -o.c / o.a > 0) xint = Math.sqrt(-o.c / o.a)
  if (xint !== null) feats.push(Math.abs(xint))
  if (o.point) feats.push(Math.abs(o.point[0]), Math.abs(o.point[1]))
  const span = Math.max(...feats) * 1.6
  const k = 80 / span
  const X = (x: number) => cx + x * k
  const Y = (y: number) => cy - y * k
  let body = line([16, cy], [W - 12, cy], 'axis') + line([cx, H - 10], [cx, 12], 'axis')
  body += text([W - 8, cy - 10], '<tspan font-style="italic">x</tspan>', 'dl small') + text([cx + 12, 14], '<tspan font-style="italic">y</tspan>', 'dl small')
  const fn = (x: number) => (o.kind === 'line' ? (o.m ?? 0) * x + o.c : (o.a ?? 1) * x * x + o.c)
  let d = ''
  const N = 120
  for (let i = 0; i <= N; i++) {
    const x = -span * 1.3 + (2.6 * span * i) / N
    d += (i === 0 ? 'M' : 'L') + f(X(x)) + ',' + f(Y(fn(x)))
  }
  const id = clipId()
  body += `<clipPath id="${id}"><rect x="14" y="10" width="${W - 26}" height="${H - 20}"/></clipPath><g clip-path="url(#${id})"><path class="plot" d="${d}"/></g>`
  if (o.showY !== false && o.c !== 0) body += text([cx + (fn(0.5) > o.c ? -8 : 8), Y(o.c) + 4], num(o.c), 'dl small', fn(0.5) > o.c ? 'end' : 'start')
  if (o.showY !== false && o.c === 0 && o.kind === 'line') body += text([cx - 8, cy + 14], '0', 'dl small', 'end')
  if (o.showX !== false && xint !== null && Math.abs(xint) > 1e-9) {
    const show = (x: number) => num(Math.round(x * 100) / 100)
    body += text([X(xint), cy + (o.kind === 'line' && (o.m ?? 0) > 0 ? 16 : -8)], show(xint), 'dl small')
    if (o.kind === 'parabola') body += text([X(-xint), cy - 8], show(-xint), 'dl small')
  }
  if (o.point) {
    body += dot([X(o.point[0]), Y(o.point[1])], 3.5, 'pt hlfill')
    body += text([X(o.point[0]) + 8, Y(o.point[1]) - 8], `(${num(o.point[0])}, ${num(o.point[1])})`, 'dl small', 'start')
  }
  return svg(W, H, body, 'Sketch graph', 230)
}
