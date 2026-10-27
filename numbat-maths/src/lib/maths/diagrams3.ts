// Diagrams for Years 1–2 (Stage 1): ten frames, base-10 blocks, pairs, equal groups, rows of objects,
// measuring with informal units, balance scales, 3D objects, turning arrows, shape patterns and calendars.
// Like the other diagram files, everything is drawn with CSS classes so it follows the theme.

import { dot, line, poly, svg, text } from './diagrams'

type P = [number, number]
const f = (x: number) => Number(x.toFixed(2))
const rad = (d: number) => (d * Math.PI) / 180

// ---------------------------------------------------------------- counting

/** One or more ten frames (2 rows of 5). Counters fill the frames in order; each part can have its own colour. */
export function tenFrames(parts: { n: number; cls: 'tfa' | 'tfb' }[], frames = 1): string {
  const cell = 34
  const gap = 18
  const W = frames * 5 * cell + (frames - 1) * gap + 20
  const H = 2 * cell + 20
  let body = ''
  for (let fr = 0; fr < frames; fr++) {
    const x0 = 10 + fr * (5 * cell + gap)
    body += `<rect class="sh tenframe" x="${x0}" y="10" width="${5 * cell}" height="${2 * cell}"/>`
    for (let c = 1; c < 5; c++) body += line([x0 + c * cell, 10], [x0 + c * cell, 10 + 2 * cell], 'ln thin')
    body += line([x0, 10 + cell], [x0 + 5 * cell, 10 + cell], 'ln thin')
  }
  let k = 0
  for (const p of parts) {
    for (let i = 0; i < p.n; i++, k++) {
      const fr = Math.floor(k / 10)
      const inF = k % 10
      const x0 = 10 + fr * (5 * cell + gap)
      body += dot([x0 + (inF % 5) * cell + cell / 2, 10 + Math.floor(inF / 5) * cell + cell / 2], 11, `pt ${p.cls}`)
    }
  }
  return svg(W, H, body, frames === 1 ? 'Ten frame' : 'Ten frames', Math.min(420, W + 40))
}

/** Base-10 blocks: hundreds (flats), tens (sticks) and ones (small cubes). */
export function baseTen(h: number, t: number, o: number): string {
  const u = 7 // one small square
  let x = 10
  const top = 10
  let body = ''
  for (let i = 0; i < h; i++) {
    body += `<rect class="b10 b10h" x="${x}" y="${top}" width="${10 * u}" height="${10 * u}"/>`
    for (let k = 1; k < 10; k++) body += line([x + k * u, top], [x + k * u, top + 10 * u], 'ln b10line') + line([x, top + k * u], [x + 10 * u, top + k * u], 'ln b10line')
    x += 10 * u + 10
  }
  for (let i = 0; i < t; i++) {
    body += `<rect class="b10 b10t" x="${x}" y="${top}" width="${u}" height="${10 * u}"/>`
    for (let k = 1; k < 10; k++) body += line([x, top + k * u], [x + u, top + k * u], 'ln b10line')
    x += u + 7
  }
  if (o) x += 6
  for (let i = 0; i < o; i++) {
    const col = Math.floor(i / 5)
    const row = i % 5
    body += `<rect class="b10 b10o" x="${x + col * (u + 5)}" y="${top + 10 * u - (row + 1) * (u + 5) + 5}" width="${u}" height="${u}"/>`
  }
  const W = x + (o ? Math.ceil(o / 5) * (u + 5) : 0) + 10
  return svg(W, 10 * u + 20, body, 'Base-10 blocks', Math.min(460, W * 1.6))
}

/** Counters in pairs (two rows). An odd number leaves one counter without a partner. */
export function pairs(n: number): string {
  const gap = 34
  const cols = Math.ceil(n / 2)
  let body = ''
  for (let i = 0; i < n; i++) {
    const col = Math.floor(i / 2)
    const row = i % 2
    body += dot([24 + col * gap, 24 + row * gap], 11, 'pt hlfill pair')
  }
  const W = 48 + (cols - 1) * gap
  return svg(W, 82, body, 'Counters in pairs', Math.min(400, W * 1.2))
}

/** Equal groups: `groups` circles with `each` counters in each, plus any counters left over. */
export function equalGroups(groups: number, each: number, leftover = 0): string {
  const R = each <= 4 ? 34 : each <= 6 ? 40 : 46
  const perRow = Math.min(groups, 5)
  const rows = Math.ceil(groups / perRow)
  const W = perRow * (2 * R + 16) + (leftover ? 70 : 0) + 8
  const H = rows * (2 * R + 16) + 8
  let body = ''
  for (let g = 0; g < groups; g++) {
    const cx = 8 + (g % perRow) * (2 * R + 16) + R + 4
    const cy = 8 + Math.floor(g / perRow) * (2 * R + 16) + R + 4
    body += `<circle class="sh grp" cx="${f(cx)}" cy="${f(cy)}" r="${R}"/>`
    for (let i = 0; i < each; i++) {
      const p: P = each === 1 ? [cx, cy] : [cx + (R - 15) * Math.cos(rad(90 + (360 * i) / each)), cy - (R - 15) * Math.sin(rad(90 + (360 * i) / each))]
      body += dot(p, 8, 'pt hlfill gdot')
    }
  }
  for (let i = 0; i < leftover; i++) body += dot([W - 46 + (i % 2) * 22, 30 + Math.floor(i / 2) * 22], 8, 'pt hlfill left')
  return svg(W, H, body, 'Equal groups', Math.min(460, W))
}

// ---------------------------------------------------------------- position

/** A shelf of labelled objects in a row, left to right. */
export function objectRow(labels: string[]): string {
  const w = 74
  const W = labels.length * (w + 8) + 12
  let body = line([6, 74], [W - 6, 74], 'ln')
  labels.forEach((l, i) => {
    const x = 10 + i * (w + 8)
    body += `<rect class="sh objbox" x="${x}" y="22" width="${w}" height="50" rx="8"/>` + text([x + w / 2, 47], l, 'dl small rowlabel')
  })
  body += text([12, 96], '← left', 'dl tiny', 'start') + text([W - 12, 96], 'right →', 'dl tiny', 'end')
  return svg(W, 104, body, 'Objects in a row', Math.min(460, W))
}

// ---------------------------------------------------------------- length

/**
 * An object above a line of informal units placed end to end.
 * `length` is the object's length in units (it may end part-way through a unit).
 */
export function measureUnits(length: number, kind: 'paperclip' | 'block' | 'pencil', label = ''): string {
  const unitW = kind === 'pencil' ? 62 : kind === 'paperclip' ? 40 : 30
  const n = Math.ceil(length - 1e-9)
  const x0 = 16
  const W = x0 * 2 + Math.max(n, length) * unitW + 4
  let body = `<rect class="obj measured" x="${x0}" y="14" width="${f(length * unitW)}" height="20" rx="10"/>`
  if (label) body += text([x0 + (length * unitW) / 2, 24], label, 'dl tiny objlabel')
  body += line([x0, 36], [x0, 60], 'ln dash')
  for (let i = 0; i < n; i++) {
    const x = x0 + i * unitW
    if (kind === 'block') body += `<rect class="unit" x="${x}" y="40" width="${unitW}" height="${unitW}"/>`
    else if (kind === 'paperclip')
      body += `<rect class="unit" x="${x + 2}" y="42" width="${unitW - 4}" height="16" rx="8"/><rect class="unit-in" x="${x + 8}" y="46" width="${unitW - 16}" height="8" rx="4"/>`
    else body += `<path class="unit" d="M${x + 2},44 L${x + unitW - 12},44 L${x + unitW - 2},50 L${x + unitW - 12},56 L${x + 2},56 Z"/>`
  }
  return svg(W, kind === 'block' ? 80 : 70, body, 'Measuring with units', Math.min(460, W))
}

/** A strip cut into parts of the given relative widths; `shaded` lists the shaded parts. */
export function stripParts(widths: number[], shaded: number[] = []): string {
  const total = widths.reduce((a, b) => a + b, 0)
  const W = 340
  let x = 20
  let body = ''
  widths.forEach((w, i) => {
    const pw = ((W - 40) * w) / total
    body += `<rect class="fpart${shaded.includes(i) ? ' on' : ''}" x="${f(x)}" y="20" width="${f(pw)}" height="44"/>`
    x += pw
  })
  return svg(W, 80, body, 'Strip cut into parts', 360)
}

// ---------------------------------------------------------------- mass

/** Equal-arm balance. `tilt` is -1 when the left pan is lower (left is heavier), 1 when the right is lower, 0 when level. */
export function balance(left: string, right: string, tilt: -1 | 0 | 1): string {
  const c: P = [180, 70]
  const a = tilt * -12 // degrees; positive lifts the right side
  const arm = 120
  const L: P = [c[0] - arm * Math.cos(rad(a)), c[1] + arm * Math.sin(rad(a))]
  const R: P = [c[0] + arm * Math.cos(rad(a)), c[1] - arm * Math.sin(rad(a))]
  let body = `<path class="sh stand" d="M${c[0] - 30},170 L${c[0] + 30},170 L${c[0] + 6},${c[1]} L${c[0] - 6},${c[1]} Z"/>`
  body += `<line class="ln beam" x1="${f(L[0])}" y1="${f(L[1])}" x2="${f(R[0])}" y2="${f(R[1])}"/>` + dot(c, 5)
  for (const [p, lab, side] of [
    [L, left, 'pan-l'],
    [R, right, 'pan-r'],
  ] as [P, string, string][]) {
    body += line(p, [p[0] - 36, p[1] + 34], 'ln thin') + line(p, [p[0] + 36, p[1] + 34], 'ln thin')
    body += `<path class="sh pan ${side}" d="M${f(p[0] - 44)},${f(p[1] + 34)} L${f(p[0] + 44)},${f(p[1] + 34)} Q${f(p[0])},${f(p[1] + 62)} ${f(p[0] - 44)},${f(p[1] + 34)} Z"/>`
    body += text([p[0], p[1] + 20], lab, 'dl small panlabel')
  }
  return svg(360, 180, body, 'Equal-arm balance', 380)
}

// ---------------------------------------------------------------- 3D objects

/** A sphere: a shaded circle with a dashed equator. */
export function sphere(): string {
  return svg(200, 200, `<circle class="sh" cx="100" cy="100" r="80"/><path class="ln dash" d="M20,100 A80,24 0 0 0 180,100"/><path class="ln faint" d="M20,100 A80,24 0 0 1 180,100"/>`, 'Sphere', 200)
}

/** A cone. */
export function cone(): string {
  return svg(200, 220, `<path class="sh" d="M100,20 L170,180 A70,22 0 0 1 30,180 Z"/><path class="ln dash" d="M30,180 A70,22 0 0 1 170,180"/>`, 'Cone', 200)
}

// ---------------------------------------------------------------- turns and patterns

/** An arrow pointing up (0), right (1), down (2) or left (3). */
export function arrow(dir: 0 | 1 | 2 | 3): string {
  const pts: P[] = [
    [0, -60],
    [40, -10],
    [14, -10],
    [14, 55],
    [-14, 55],
    [-14, -10],
    [-40, -10],
  ]
  const t = rad(90 * dir)
  const rot = pts.map(([x, y]) => [80 + x * Math.cos(t) - y * Math.sin(t), 80 + x * Math.sin(t) + y * Math.cos(t)] as P)
  return svg(160, 160, poly(rot, 'sh arrow'), 'Arrow', 160)
}

export type PatShape = 'circle' | 'square' | 'triangle' | 'star' | 'heart'
/** A repeating pattern of shapes; the last place shows a question mark. */
export function shapePattern(items: PatShape[]): string {
  const s = 44
  const W = (items.length + 1) * (s + 10) + 10
  let body = ''
  const draw = (k: PatShape, x: number, y: number) => {
    const c: P = [x + s / 2, y + s / 2]
    if (k === 'circle') return `<circle class="pat pat-circle" cx="${c[0]}" cy="${c[1]}" r="${s / 2 - 2}"/>`
    if (k === 'square') return `<rect class="pat pat-square" x="${x + 3}" y="${y + 3}" width="${s - 6}" height="${s - 6}"/>`
    if (k === 'triangle') return poly([[c[0], y + 2], [x + s - 2, y + s - 4], [x + 2, y + s - 4]], 'pat pat-triangle')
    if (k === 'heart') return `<path class="pat pat-heart" d="M${c[0]},${y + s - 4} C${x - 6},${y + 18} ${x + 8},${y - 4} ${c[0]},${y + 12} C${x + s - 8},${y - 4} ${x + s + 6},${y + 18} ${c[0]},${y + s - 4} Z"/>`
    const star: P[] = Array.from({ length: 10 }, (_, i) => {
      const r = i % 2 ? s / 4.4 : s / 2 - 1
      const a = rad(90 + i * 36)
      return [c[0] + r * Math.cos(a), c[1] - r * Math.sin(a) + 2] as P
    })
    return poly(star, 'pat pat-star')
  }
  items.forEach((k, i) => (body += draw(k, 10 + i * (s + 10), 10)))
  const qx = 10 + items.length * (s + 10)
  body += `<rect class="sh-bg qbox" x="${qx}" y="10" width="${s}" height="${s}" rx="6"/>` + text([qx + s / 2, 10 + s / 2], '?', 'dl')
  return svg(W, s + 20, body, 'Shape pattern', Math.min(460, W))
}

/** Any polygon from its corner points (y up). */
export function polygonShape(pts: P[]): string {
  const xs = pts.map((p) => p[0])
  const ys = pts.map((p) => p[1])
  const minX = Math.min(...xs)
  const maxY = Math.max(...ys)
  const w = Math.max(...xs) - minX
  const h = maxY - Math.min(...ys)
  const s = Math.min(200 / (w || 1), 160 / (h || 1))
  const S = pts.map(([x, y]) => [20 + (x - minX) * s + (200 - w * s) / 2, 20 + (maxY - y) * s + (160 - h * s) / 2] as P)
  return svg(240, 200, poly(S, 'sh shape2d'), 'Shape', 240)
}

// ---------------------------------------------------------------- calendar

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

/** A month calendar (Monday first). `start` is the weekday of the 1st (0 = Monday). */
export function calendar(month: string, start: number, days: number, mark?: number): string {
  const cells: string[] = []
  for (let i = 0; i < start; i++) cells.push('<td></td>')
  for (let d = 1; d <= days; d++) cells.push(`<td${d === mark ? ' class="calmark"' : ''}>${d}</td>`)
  while (cells.length % 7) cells.push('<td></td>')
  const rows: string[] = []
  for (let i = 0; i < cells.length; i += 7) rows.push(`<tr>${cells.slice(i, i + 7).join('')}</tr>`)
  return `<div class="tablewrap"><table class="dtable caltable"><caption>${month}</caption><thead><tr>${DAYS.map((d) => `<th scope="col">${d.slice(0, 3)}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`
}

