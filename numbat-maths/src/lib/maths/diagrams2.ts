// Diagrams for Years 3–4 (Stage 2): clocks, rulers, number lines, fraction strips, arrays, grid maps,
// tally charts, measuring jugs, kitchen scales, cube models, 2D shapes and 3D objects.
// Like diagrams.ts, everything is drawn with CSS classes so it follows the theme.

import { num } from './format'
import { centroid, dot, line, polar, poly, rightMark, sideLabel, singleAngle, svg, text } from './diagrams'

type P = [number, number]
const f = (x: number) => Number(x.toFixed(2))
const rad = (d: number) => (d * Math.PI) / 180

function fitBox(pts: P[], W: number, H: number, pad: number): (p: P) => P {
  const xs = pts.map((p) => p[0])
  const ys = pts.map((p) => p[1])
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const s = Math.min((W - 2 * pad) / (maxX - minX || 1), (H - 2 * pad) / (maxY - minY || 1))
  const ox = (W - (maxX - minX) * s) / 2
  const oy = (H - (maxY - minY) * s) / 2
  return (p) => [ox + (p[0] - minX) * s, oy + (p[1] - minY) * s]
}

const pathOf = (pts: P[], close = true) => 'M' + pts.map((p) => `${f(p[0])},${f(p[1])}`).join(' L') + (close ? ' Z' : '')

/** A stacked fraction drawn in SVG (HTML fractions cannot go inside SVG). */
export function svgFrac(p: P, n: number | string, d: number | string, cls = 'dl small'): string {
  return (
    text([p[0], p[1] - 9], String(n), cls) +
    `<line class="fracbar" x1="${f(p[0] - 7)}" y1="${f(p[1])}" x2="${f(p[0] + 7)}" y2="${f(p[1])}"/>` +
    text([p[0], p[1] + 10], String(d), cls)
  )
}

// ---------------------------------------------------------------- time

/** Analog clock showing h:m (12-hour). Hand angles follow the real clock (the hour hand moves between numbers). */
export function clock(h: number, m: number): string {
  const c: P = [110, 110]
  const R = 98
  let body = `<circle class="sh clockface" cx="110" cy="110" r="${R}"/>`
  for (let i = 0; i < 60; i++) {
    const a = 90 - i * 6
    body += line(polar(c, i % 5 === 0 ? R - 13 : R - 8, a), polar(c, R - 3, a), i % 5 === 0 ? 'tk' : 'tk thin')
  }
  for (let k = 1; k <= 12; k++) body += text(polar(c, R - 27, 90 - k * 30), String(k), 'dl clocknum')
  const hourAngle = 90 - ((h % 12) + m / 60) * 30
  const minAngle = 90 - m * 6
  const hp = polar(c, 50, hourAngle)
  const mp = polar(c, 78, minAngle)
  body += `<line class="hand hand-h" x1="110" y1="110" x2="${f(hp[0])}" y2="${f(hp[1])}"/>`
  body += `<line class="hand hand-m" x1="110" y1="110" x2="${f(mp[0])}" y2="${f(mp[1])}"/>`
  body += dot(c, 5)
  return svg(220, 220, body, 'Analog clock', 220)
}

// ---------------------------------------------------------------- length

/** A centimetre ruler with millimetre marks and an object lying along it from startMm to endMm. */
export function ruler(maxCm: number, startMm: number, endMm: number): string {
  const W = 360
  const left = 22
  const s = (W - 2 * left) / maxCm // px per cm
  const x = (mm: number) => left + (mm / 10) * s
  let body = `<rect class="sh rulerbody" x="${f(left - 10)}" y="70" width="${f(maxCm * s + 20)}" height="46" rx="4"/>`
  for (let mm = 0; mm <= maxCm * 10; mm++) {
    const len = mm % 10 === 0 ? 16 : mm % 5 === 0 ? 11 : 6
    body += line([x(mm), 70], [x(mm), 70 + len], mm % 10 === 0 ? 'tk' : 'tk thin')
    if (mm % 10 === 0) body += text([x(mm), 98], String(mm / 10), 'dl small rulernum')
  }
  body += text([W - left, 108], 'cm', 'dl tiny', 'end')
  body += `<rect class="obj" x="${f(x(startMm))}" y="34" width="${f(x(endMm) - x(startMm))}" height="18" rx="9"/>`
  body += line([x(startMm), 52], [x(startMm), 70], 'ln dash') + line([x(endMm), 52], [x(endMm), 70], 'ln dash')
  return svg(W, 126, body, 'Ruler', 460)
}

// ---------------------------------------------------------------- number lines and fractions

export interface NumberLineOpts {
  min: number
  max: number
  /** number of equal intervals between min and max */
  parts: number
  /** which tick values to label; fractions use labelFrac */
  labels?: number[]
  /** label ticks as fractions of `den`, e.g. den 4 labels 1/4, 2/4… (whole numbers shown plainly) */
  labelFracDen?: number
  /** points marked with a letter above the line */
  marks?: { value: number; label: string }[]
  /** a highlighted jump from one value to another (for counting on) */
}

export function numberLine(o: NumberLineOpts): string {
  const W = 360
  const left = 26
  const right = W - 26
  const y = 70
  const span = o.max - o.min
  const X = (v: number) => left + ((v - o.min) / span) * (right - left)
  let body = line([left - 10, y], [right + 10, y], 'axis')
  body += `<path class="ln" d="M${right + 10},${y} l-8,-5 M${right + 10},${y} l-8,5"/>`
  for (let i = 0; i <= o.parts; i++) {
    const v = o.min + (span * i) / o.parts
    body += line([X(v), y - 8], [X(v), y + 8], 'axis nltick')
    if (o.labelFracDen) {
      const k = Math.round((v - o.min) * o.labelFracDen) + Math.round(o.min * o.labelFracDen)
      if (k % o.labelFracDen === 0) body += text([X(v), y + 24], String(k / o.labelFracDen), 'dl small')
      else body += svgFrac([X(v), y + 30], k, o.labelFracDen)
    } else if (o.labels?.some((l) => Math.abs(l - v) < 1e-9)) {
      body += text([X(v), y + 24], num(Math.round(v * 1000) / 1000), 'dl small nllabel')
    }
  }
  for (const m of o.marks ?? []) {
    body += `<path class="nlmark" d="M${f(X(m.value))},${y - 12} l-6,-10 h12 Z"/>`
    body += text([X(m.value), y - 32], m.label, 'dl hl')
  }
  return svg(W, o.labelFracDen ? 120 : 104, body, 'Number line', 380)
}

/** A strip (bar) cut into equal parts with some parts shaded. */
export function fractionStrip(parts: number, shaded: number, opts: { label?: string } = {}): string {
  const W = 340
  const left = 20
  const w = (W - 2 * left) / parts
  let body = ''
  for (let i = 0; i < parts; i++) {
    body += `<rect class="fpart${i < shaded ? ' on' : ''}" x="${f(left + i * w)}" y="20" width="${f(w)}" height="44"/>`
  }
  if (opts.label) body += text([W / 2, 82], opts.label, 'dl small')
  return svg(W, opts.label ? 94 : 80, body, `Strip cut into ${parts} equal parts`, 360)
}

/** Several strips of the same whole, one under the other (a fraction wall). */
export function fractionWall(rows: { parts: number; shaded: number; label?: string }[]): string {
  const W = 340
  const left = 64
  const right = W - 16
  const rowH = 40
  let body = ''
  rows.forEach((r, j) => {
    const w = (right - left) / r.parts
    for (let i = 0; i < r.parts; i++) {
      body += `<rect class="fpart wall-r${j}${i < r.shaded ? ' on' : ''}" x="${f(left + i * w)}" y="${16 + j * (rowH + 10)}" width="${f(w)}" height="${rowH}"/>`
    }
    if (r.label) body += text([left - 10, 16 + j * (rowH + 10) + rowH / 2], r.label, 'dl small', 'end')
  })
  return svg(W, 26 + rows.length * (rowH + 10), body, 'Fraction strips', 360)
}

/** A circle cut into equal sectors with some shaded. */
export function circleParts(parts: number, shaded: number): string {
  const c: P = [90, 90]
  const r = 76
  let body = ''
  for (let i = 0; i < parts; i++) {
    const a1 = 90 - (360 / parts) * i
    const a2 = 90 - (360 / parts) * (i + 1)
    const p1 = polar(c, r, a1)
    const p2 = polar(c, r, a2)
    body += `<path class="fpart${i < shaded ? ' on' : ''}" d="M${c[0]},${c[1]} L${f(p1[0])},${f(p1[1])} A${r},${r} 0 0 1 ${f(p2[0])},${f(p2[1])} Z"/>`
  }
  return svg(180, 180, body, `Circle cut into ${parts} equal parts`, 180)
}

// ---------------------------------------------------------------- multiplication

/** rows × cols array of dots. `cover` hides every dot from that row and column onwards under a card. */
export function dotArray(rows: number, cols: number, cover?: { fromRow: number; fromCol: number }): string {
  const gap = Math.min(30, 300 / Math.max(cols, rows))
  const W = Math.max(140, cols * gap + 40)
  const H = rows * gap + 30
  let body = ''
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (cover && r >= cover.fromRow && c >= cover.fromCol) continue
      body += dot([20 + gap / 2 + c * gap, 15 + gap / 2 + r * gap], Math.min(9, gap * 0.3), 'pt arr')
    }
  }
  if (cover) {
    const x = 20 + cover.fromCol * gap + 2
    const y = 15 + cover.fromRow * gap + 2
    body += `<rect class="cover" x="${f(x)}" y="${f(y)}" width="${f((cols - cover.fromCol) * gap - 4)}" height="${f((rows - cover.fromRow) * gap - 4)}" rx="6"/>`
  }
  return svg(W, H, body, `Array of dots`, Math.min(360, W + 20))
}

// ---------------------------------------------------------------- position

const COLS = 'ABCDEFGH'

/** Grid map with letters along the bottom and numbers up the side. Items sit in cells, e.g. {col: 2, row: 3} is B3. */
export function gridMap(cols: number, rows: number, items: { col: number; row: number; label: string }[], opts: { compass?: boolean } = {}): string {
  const cell = Math.min(52, 300 / cols)
  const left = 34
  const top = 14
  const W = left + cols * cell + (opts.compass ? 84 : 16)
  const H = top + rows * cell + 34
  let body = `<rect class="sh" x="${left}" y="${top}" width="${f(cols * cell)}" height="${f(rows * cell)}"/>`
  for (let c = 0; c <= cols; c++) body += line([left + c * cell, top], [left + c * cell, top + rows * cell], 'ln thin')
  for (let r = 0; r <= rows; r++) body += line([left, top + r * cell], [left + cols * cell, top + r * cell], 'ln thin')
  for (let c = 0; c < cols; c++) body += text([left + (c + 0.5) * cell, top + rows * cell + 16], COLS[c], 'dl small gm-col')
  for (let r = 0; r < rows; r++) body += text([left - 14, top + (rows - r - 0.5) * cell], String(r + 1), 'dl small gm-row')
  for (const it of items) {
    body += text([left + (it.col - 0.5) * cell, top + (rows - it.row + 0.5) * cell], it.label, 'dl tiny gm-item')
  }
  if (opts.compass) {
    const cx = left + cols * cell + 50
    const cy = top + 40
    body += `<path class="compass" d="M${cx},${cy - 26} L${cx + 7},${cy} L${cx},${cy + 26} L${cx - 7},${cy} Z"/>`
    body += line([cx - 24, cy], [cx + 24, cy], 'ln thin')
    body += text([cx, cy - 36], 'N', 'dl small hl') + text([cx, cy + 36], 'S', 'dl tiny') + text([cx + 31, cy], 'E', 'dl tiny') + text([cx - 31, cy], 'W', 'dl tiny')
  }
  return svg(W, H, body, 'Grid map', 400)
}

export function gridRef(col: number, row: number): string {
  return COLS[col - 1] + row
}

// ---------------------------------------------------------------- data

/** A tally chart: each row shows its tally marks in groups of five. */
export function tallyChart(rows: { label: string; count: number }[], labelHead = '', heading = 'Tally'): string {
  const rowH = 34
  const W = 340
  const labelW = 120
  const H = 30 + rows.length * rowH
  let body = `<rect class="sh-bg tallyframe" x="10" y="4" width="${W - 20}" height="${H - 8}"/>`
  body += text([20, 18], labelHead, 'dl small', 'start') + text([labelW + 30, 18], heading, 'dl small', 'start')
  body += line([10, 30], [W - 10, 30], 'ln thin') + line([labelW + 16, 4], [labelW + 16, H - 4], 'ln thin')
  rows.forEach((r, i) => {
    const cy = 30 + i * rowH + rowH / 2
    body += text([20, cy], r.label, 'dl small', 'start')
    let x = labelW + 30
    for (let g = 0; g < Math.ceil(r.count / 5); g++) {
      const inGroup = Math.min(5, r.count - g * 5)
      for (let k = 0; k < Math.min(4, inGroup); k++) body += line([x + k * 7, cy - 11], [x + k * 7, cy + 11], `tally tr${i}`)
      if (inGroup === 5) body += line([x - 4, cy + 9], [x + 25, cy - 9], `tally tr${i}`)
      x += 40
    }
    if (i < rows.length - 1) body += line([10, 30 + (i + 1) * rowH], [W - 10, 30 + (i + 1) * rowH], 'grid')
  })
  return svg(W, H, body, 'Tally chart', 360)
}

// ---------------------------------------------------------------- capacity and mass

/** Measuring jug marked every `step` mL, labelled every `labelEvery` mL, filled to `level` mL. */
export function jug(maxMl: number, step: number, labelEvery: number, level: number, inLitres = false): string {
  const top = 26
  const bottom = 236
  const x1 = 130
  const x2 = 230
  const Y = (v: number) => bottom - (v / maxMl) * (bottom - top - 10)
  let body = `<rect class="liquid" x="${x1}" y="${f(Y(level))}" width="${x2 - x1}" height="${f(bottom - Y(level))}"/>`
  body += `<path class="ln" d="M${x1},${top - 6} L${x1},${bottom} L${x2},${bottom} L${x2},${top - 6}"/>`
  body += `<path class="ln" d="M${x2},${top + 20} q34,6 30,50 q-4,40 -30,46"/>`
  for (let v = step; v <= maxMl + 1e-9; v += step) {
    const major = Math.abs(v / labelEvery - Math.round(v / labelEvery)) < 1e-9
    body += line([x1, Y(v)], [x1 + (major ? 18 : 10), Y(v)], major ? 'tk' : 'tk thin')
    if (major) body += text([x1 - 8, Y(v)], inLitres ? `${num(v / 1000)} L` : `${num(v)} mL`, 'dl small jugnum', 'end')
  }
  return svg(300, 250, body, 'Measuring jug', 300)
}

/** Kitchen scales: a 240° dial from 0 to `max` grams, needle at `value`. Labels in g or kg. */
export function dialScale(max: number, major: number, minorPerMajor: number, value: number, inKg = false): string {
  const c: P = [130, 132]
  const R = 104
  const A = (v: number) => 210 - (v / max) * 240
  let body = `<circle class="sh" cx="${c[0]}" cy="${c[1]}" r="${R + 8}"/>`
  const minor = major / minorPerMajor
  for (let v = 0; v <= max + 1e-9; v += minor) {
    const isMajor = Math.abs(v / major - Math.round(v / major)) < 1e-9
    body += line(polar(c, isMajor ? R - 16 : R - 9, A(v)), polar(c, R, A(v)), isMajor ? 'tk' : 'tk thin')
    if (isMajor) body += text(polar(c, R - 32, A(v)), inKg ? num(v / 1000) : num(v), 'dl tiny dialnum')
  }
  body += text([c[0], c[1] + 52], inKg ? 'kg' : 'g', 'dl small')
  const tip = polar(c, R - 12, A(value))
  // the needle goes under the numbers (which have a halo) so it never hides a label
  const needle = `<line class="needle dialneedle" x1="${c[0]}" y1="${c[1]}" x2="${f(tip[0])}" y2="${f(tip[1])}"/>` + dot(c, 6)
  const firstLabel = body.indexOf('<text')
  body = body.slice(0, firstLabel) + needle + body.slice(firstLabel)
  return svg(260, 250, body, 'Kitchen scales', 260)
}

// ---------------------------------------------------------------- volume and 3D objects

/** A rectangular prism built from l × w × h unit cubes, drawn isometrically (top, left and right faces). */
export function cubeStack(l: number, w: number, h: number): string {
  const c30 = Math.cos(rad(30))
  const s30 = Math.sin(rad(30))
  const P3 = (x: number, y: number, z: number): P => [(x - z) * c30, (x + z) * s30 - y]
  const all: P[] = [P3(0, 0, 0), P3(l, 0, 0), P3(0, 0, w), P3(l, 0, w), P3(0, h, 0), P3(l, h, 0), P3(0, h, w), P3(l, h, w)]
  const T = fitBox(all, 320, 240, 16)
  let body = ''
  const quad = (pts: P[], cls: string) => `<path class="${cls}" d="${pathOf(pts.map(T))}"/>`
  for (let i = 0; i < l; i++) for (let j = 0; j < w; j++) body += quad([P3(i, h, j), P3(i + 1, h, j), P3(i + 1, h, j + 1), P3(i, h, j + 1)], 'cube cube-top')
  for (let i = 0; i < l; i++) for (let k = 0; k < h; k++) body += quad([P3(i, k, w), P3(i + 1, k, w), P3(i + 1, k + 1, w), P3(i, k + 1, w)], 'cube cube-l')
  for (let j = 0; j < w; j++) for (let k = 0; k < h; k++) body += quad([P3(l, k, j), P3(l, k, j + 1), P3(l, k + 1, j + 1), P3(l, k + 1, j)], 'cube cube-r')
  return svg(320, 240, body, 'Model made of cubes', 320)
}

type Vec3 = [number, number, number]
const sub3 = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const cross3 = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const dot3 = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]

/**
 * A prism or pyramid on a regular n-sided base, seen from the front and a little above.
 * Edges hidden behind the object are dashed.
 */
export function solid(kind: 'prism' | 'pyramid', n: number): string {
  const R = 1
  const H = kind === 'prism' ? (n === 4 ? 1.1 : 1.3) : 1.6
  const elev = rad(22)
  const toViewer: Vec3 = [0, Math.sin(elev), -Math.cos(elev)]
  // turned a little so two side faces show; a triangular pyramid gets a back corner so its edges do not overlap
  const off = kind === 'pyramid' && n === 3 ? 100 : -90 + 180 / n + 24
  const base: Vec3[] = Array.from({ length: n }, (_, i) => [R * Math.cos(rad(off + (360 * i) / n)), 0, R * Math.sin(rad(off + (360 * i) / n))])
  const top: Vec3[] = kind === 'prism' ? base.map((v) => [v[0], H, v[2]] as Vec3) : [[0, H, 0]]
  const proj = (v: Vec3): P => [v[0], -(v[1] * Math.cos(elev) + v[2] * Math.sin(elev))]
  const centre: Vec3 = [0, H / 2, 0]
  // lateral faces
  const faces: Vec3[][] = []
  for (let i = 0; i < n; i++) {
    const a = base[i]
    const b = base[(i + 1) % n]
    faces.push(kind === 'prism' ? [a, b, top[(i + 1) % n], top[i]] : [a, b, top[0]])
  }
  const visible = faces.map((fc) => {
    let nrm = cross3(sub3(fc[1], fc[0]), sub3(fc[2], fc[0]))
    const mid: Vec3 = [0, 0, 0]
    fc.forEach((v) => {
      mid[0] += v[0] / fc.length
      mid[1] += v[1] / fc.length
      mid[2] += v[2] / fc.length
    })
    if (dot3(nrm, sub3(mid, centre)) < 0) nrm = [-nrm[0], -nrm[1], -nrm[2]]
    return dot3(nrm, toViewer) > 1e-9
  })
  const allPts = [...base, ...top].map(proj)
  const T = fitBox(allPts, 280, 240, 22)
  const PT = (v: Vec3) => T(proj(v))
  let body = ''
  // filled visible faces
  faces.forEach((fc, i) => {
    if (visible[i]) body += `<path class="sh${i % 2 ? ' sh2' : ''}" d="${pathOf(fc.map(PT))}"/>`
  })
  if (kind === 'prism') body += `<path class="sh sh3" d="${pathOf(top.map(PT))}"/>`
  const edge = (a: Vec3, b: Vec3, vis: boolean) => line(PT(a), PT(b), vis ? 'ln' : 'ln dash')
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    body += edge(base[i], base[j], visible[i]) // bottom edges: seen only through a visible side face
    const sideVis = visible[i] || visible[(i - 1 + n) % n]
    if (kind === 'prism') {
      body += edge(top[i], top[j], true)
      body += edge(base[i], top[i], sideVis)
    } else {
      body += edge(base[i], top[0], sideVis)
    }
  }
  return svg(280, 240, body, kind === 'prism' ? 'Prism' : 'Pyramid', 280)
}

// ---------------------------------------------------------------- 2D shapes

export type ShapeKind =
  | 'square'
  | 'rectangle'
  | 'rhombus'
  | 'parallelogram'
  | 'trapezium'
  | 'kite'
  | 'isosceles trapezium'
  | 'equilateral triangle'
  | 'isosceles triangle'
  | 'scalene triangle'
  | 'right-angled triangle'
  | 'regular pentagon'
  | 'regular hexagon'
  | 'regular octagon'
  | 'irregular quadrilateral'

export function shapePoints(kind: ShapeKind): P[] {
  const reg = (n: number): P[] => Array.from({ length: n }, (_, i) => [Math.cos(rad(90 + 180 / n + (360 * i) / n)), -Math.sin(rad(90 + 180 / n + (360 * i) / n))] as P)
  switch (kind) {
    case 'square':
      return [[0, 0], [4, 0], [4, 4], [0, 4]]
    case 'rectangle':
      return [[0, 0], [6, 0], [6, 3.5], [0, 3.5]]
    case 'rhombus':
      // side 4 with a 60° angle
      return [[0, 0], [4, 0], [6, 2 * Math.sqrt(3)], [2, 2 * Math.sqrt(3)]]
    case 'parallelogram':
      return [[0, 3.5], [5, 3.5], [6.5, 0], [1.5, 0]]
    case 'trapezium':
      return [[0, 3.5], [7, 3.5], [4.6, 0], [0.4, 0]]
    case 'isosceles trapezium':
      return [[0, 3.5], [7, 3.5], [5.2, 0], [1.8, 0]]
    case 'kite':
      return [[0, 0], [2.4, 1.8], [0, 6], [-2.4, 1.8]]
    case 'equilateral triangle':
      return [[0, 0], [5, 0], [2.5, 2.5 * Math.sqrt(3)]]
    case 'isosceles triangle':
      return [[0, 0], [4, 0], [2, 5]]
    case 'scalene triangle':
      return [[0, 0], [6, 0], [1.5, 3.5]]
    case 'right-angled triangle':
      return [[0, 0], [5, 0], [0, 3.5]]
    case 'regular pentagon':
      return reg(5)
    case 'regular hexagon':
      return reg(6)
    case 'regular octagon':
      return reg(8)
    case 'irregular quadrilateral':
      return [[0, 0], [5.5, 0.6], [4.6, 3.8], [0.8, 2.6]]
  }
}

/** A 2D shape, optionally with its right angles marked. */
export function shape2D(kind: ShapeKind, opts: { markRight?: boolean; turn?: number } = {}): string {
  let pts = shapePoints(kind)
  if (opts.turn) {
    const t = rad(opts.turn)
    pts = pts.map(([x, y]) => [x * Math.cos(t) - y * Math.sin(t), x * Math.sin(t) + y * Math.cos(t)] as P)
  }
  // shape coordinates have y up; flip for the screen
  const T = fitBox(pts.map(([x, y]) => [x, -y] as P), 240, 190, 24)
  const S = pts.map(([x, y]) => T([x, -y]))
  let body = poly(S, 'sh shape2d')
  if (opts.markRight) {
    S.forEach((p, i) => {
      const a = S[(i - 1 + S.length) % S.length]
      const b = S[(i + 1) % S.length]
      const u: P = [a[0] - p[0], a[1] - p[1]]
      const v: P = [b[0] - p[0], b[1] - p[1]]
      const cos = (u[0] * v[0] + u[1] * v[1]) / (Math.hypot(...u) * Math.hypot(...v))
      if (Math.abs(cos) < 1e-6) {
        const angU = (Math.atan2(-u[1], u[0]) * 180) / Math.PI
        const angV = (Math.atan2(-v[1], v[0]) * 180) / Math.PI
        // rightMark draws from direction a1 to a1 + 90 (anticlockwise)
        const start = ((angV - angU + 360) % 360) === 90 ? angU : angV
        body += rightMark(p, start, 12)
      }
    })
  }
  return svg(240, 190, body, 'Shape', 260)
}

// ---------------------------------------------------------------- area on a grid

/** A grid of 1 cm squares with shaded cells (cells given as [col, row] from the top-left). */
export function cellGrid(cols: number, rows: number, cells: [number, number][]): string {
  const s = Math.min(30, 300 / cols, 220 / rows)
  const left = 16
  const top = 12
  let body = ''
  for (const [c, r] of cells) body += `<rect class="cell on" x="${f(left + c * s)}" y="${f(top + r * s)}" width="${f(s)}" height="${f(s)}"/>`
  for (let c = 0; c <= cols; c++) body += line([left + c * s, top], [left + c * s, top + rows * s], 'grid gridcell')
  for (let r = 0; r <= rows; r++) body += line([left, top + r * s], [left + cols * s, top + r * s], 'grid gridcell')
  return svg(left * 2 + cols * s, top * 2 + rows * s, body, 'Shape on a grid of squares', 360)
}

/** A right-angled triangle drawn on a square grid: legs of w and h squares. */
export function triangleOnGrid(cols: number, rows: number, w: number, h: number): string {
  const s = Math.min(30, 300 / cols, 220 / rows)
  const left = 16
  const top = 12
  const x0 = left + s
  const y0 = top + (h + 1) * s
  let body = `<path class="sh areashape" d="${pathOf([
    [x0, y0],
    [x0 + w * s, y0],
    [x0, y0 - h * s],
  ])}"/>`
  for (let c = 0; c <= cols; c++) body += line([left + c * s, top], [left + c * s, top + rows * s], 'grid gridcell')
  for (let r = 0; r <= rows; r++) body += line([left, top + r * s], [left + cols * s, top + r * s], 'grid gridcell')
  body += `<path class="ln" d="${pathOf([
    [x0, y0],
    [x0 + w * s, y0],
    [x0, y0 - h * s],
  ])}"/>`
  return svg(left * 2 + cols * s, top * 2 + rows * s, body, 'Triangle on a grid of squares', 360)
}

/** Two angles side by side, labelled A and B. Arm lengths are scaled to fit each half of the picture. */
export function twoAngles(a: number, b: number, armA: number, armB: number): string {
  const one = (x0: number, size: number, armWanted: number, label: string) => {
    const back = Math.max(0, -Math.cos(rad(size)))
    const arm = Math.min(armWanted, 156 / (1 + back), 120 / Math.max(0.2, Math.sin(rad(Math.min(size, 90)))))
    const c: P = [x0 + 10 + arm * back, 156]
    const p1 = polar(c, arm, 0)
    const p2 = polar(c, arm, size)
    const r = 20
    return (
      line(c, p1) +
      line(c, p2) +
      `<path class="arc" d="M${f(c[0] + r)},${f(c[1])} A${r},${r} 0 0 0 ${f(polar(c, r, size)[0])},${f(polar(c, r, size)[1])}"/>` +
      dot(c, 3) +
      text([c[0], 178], label, 'dl')
    )
  }
  return svg(360, 190, one(4, a, armA, 'A') + one(184, b, armB, 'B'), 'Two angles', 380)
}

// ---------------------------------------------------------------- Year 4 additions

/** A quadrilateral of the given kind with a label on each side (for perimeter). Sides run from vertex i to i + 1. */
export function shapeWithSides(kind: ShapeKind, labels: string[]): string {
  const pts = shapePoints(kind)
  const T = fitBox(pts.map(([x, y]) => [x, -y] as P), 300, 220, 44)
  const S = pts.map(([x, y]) => T([x, -y]))
  const c = centroid(S)
  let body = poly(S, 'sh shape2d')
  S.forEach((p, i) => {
    if (labels[i]) body += sideLabel(p, S[(i + 1) % S.length], c, labels[i], 16)
  })
  return svg(300, 220, body, 'Shape with side lengths', 320)
}

/** One angle, with its size hidden from screen readers (the question asks about its size). */
export function plainAngle(size: number): string {
  return singleAngle(size).replace(/aria-label="[^"]*"/, 'aria-label="An angle"')
}

/** Picture graph: each full symbol stands for `per`; a count of per/2 more shows a half symbol. */
export function pictureGraph(rows: { label: string; count: number }[], per: number, unit: string): string {
  const rowH = 36
  const labelW = 100
  const sym = 26
  const maxSyms = Math.max(...rows.map((r) => Math.ceil(r.count / per)))
  const W = Math.max(300, labelW + 30 + maxSyms * (sym + 6))
  const H = rows.length * rowH + 44
  let body = ''
  rows.forEach((r, i) => {
    const cy = 16 + i * rowH + rowH / 2
    body += text([labelW, cy], r.label, 'dl small', 'end')
    const full = Math.floor(r.count / per)
    const half = r.count % per !== 0
    for (let k = 0; k < full; k++) body += `<circle class="pg pgfull" cx="${f(labelW + 24 + k * (sym + 6))}" cy="${f(cy)}" r="${sym / 2}"/>`
    if (half) {
      const x = labelW + 24 + full * (sym + 6)
      body += `<path class="pg pghalf" d="M${f(x)},${f(cy - sym / 2)} A${sym / 2},${sym / 2} 0 0 0 ${f(x)},${f(cy + sym / 2)} Z"/>`
    }
  })
  const ky = 16 + rows.length * rowH + 16
  body += line([labelW + 10, 16], [labelW + 10, 16 + rows.length * rowH], 'ln thin')
  body += text([14, ky], 'Key:', 'dl small', 'start') + `<circle class="pg pgfull" cx="62" cy="${ky}" r="9"/>` + text([76, ky], `= ${num(per)} ${unit}`, 'dl small', 'start')
  return svg(W, H, body, 'Picture graph', 380)
}

/** Area model for a one-digit by two-digit product: a rectangle of height `a` split into parts (e.g. 20 and 3). */
export function areaModel(a: number, parts: number[]): string {
  const total = parts.reduce((s, x) => s + x, 0)
  const left = 40
  const top = 30
  const W = 300
  const H = 120
  let x = left
  let body = ''
  parts.forEach((p) => {
    // keep small parts wide enough to label
    const w = Math.max(46, (p / total) * W)
    body += `<rect class="sh areapart" x="${f(x)}" y="${top}" width="${f(w)}" height="${H}"/>`
    body += text([x + w / 2, top - 10], num(p), 'dl small')
    x += w
  })
  body += text([left - 12, top + H / 2], num(a), 'dl small', 'end')
  return svg(x + 16, top + H + 14, body, 'Area model', 360)
}
