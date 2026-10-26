// SVG diagram builders. All diagrams use currentColor and CSS classes so they follow the theme.
// Coordinates: helpers take maths-style angles (degrees, anticlockwise from east).

import { num } from './format'

type P = [number, number]

const rad = (d: number) => (d * Math.PI) / 180
const f = (x: number) => Number(x.toFixed(2))

export function svg(w: number, h: number, body: string, label = 'Diagram', maxWidth = 340): string {
  return `<svg class="dg" viewBox="0 0 ${f(w)} ${f(h)}" style="max-width:${maxWidth}px" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`
}

export function polar(c: P, r: number, deg: number): P {
  return [c[0] + r * Math.cos(rad(deg)), c[1] - r * Math.sin(rad(deg))]
}

export function line(a: P, b: P, cls = 'ln'): string {
  return `<line class="${cls}" x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}"/>`
}

export function poly(pts: P[], cls = 'sh'): string {
  return `<polygon class="${cls}" points="${pts.map((p) => f(p[0]) + ',' + f(p[1])).join(' ')}"/>`
}

/** HTML tags such as <i> and <sup> break out of inline SVG, so convert them to tspans. */
function svgSafe(s: string): string {
  return s
    .replace(/<i>(.*?)<\/i>/g, '<tspan class="it">$1</tspan>')
    .replace(/<sup>(.*?)<\/sup>/g, '<tspan baseline-shift="super" font-size="70%">$1</tspan>')
    .replace(/<\/?(b|em|strong|span)[^>]*>/g, '')
}

export function text(p: P, s: string, cls = 'dl', anchor: 'middle' | 'start' | 'end' = 'middle'): string {
  s = svgSafe(s)
  return `<text class="${cls}" x="${f(p[0])}" y="${f(p[1])}" text-anchor="${anchor}" dominant-baseline="central">${s}</text>`
}

export function dot(p: P, r = 3.5, cls = 'pt'): string {
  return `<circle class="${cls}" cx="${f(p[0])}" cy="${f(p[1])}" r="${r}"/>`
}

/** Arc for an angle at c from direction a1 to a2 (anticlockwise). */
export function arc(c: P, r: number, a1: number, a2: number, cls = 'arc'): string {
  let sweep = a2 - a1
  while (sweep < 0) sweep += 360
  while (sweep > 360) sweep -= 360
  const p1 = polar(c, r, a1)
  const p2 = polar(c, r, a1 + sweep)
  const large = sweep > 180 ? 1 : 0
  return `<path class="${cls}" d="M${f(p1[0])},${f(p1[1])} A${r},${r} 0 ${large} 0 ${f(p2[0])},${f(p2[1])}"/>`
}

export function rightMark(c: P, a1: number, size = 11): string {
  const p1 = polar(c, size, a1)
  const p3 = polar(c, size, a1 + 90)
  const p2: P = [p1[0] + p3[0] - c[0], p1[1] + p3[1] - c[1]]
  return `<path class="rm" d="M${f(p1[0])},${f(p1[1])} L${f(p2[0])},${f(p2[1])} L${f(p3[0])},${f(p3[1])}"/>`
}

/** Angle marker with a label placed on the bisector. Uses a square when the angle is 90°. */
export function angleMark(c: P, a1: number, a2: number, label: string, r = 22, labelGap = 16, cls = 'arc'): string {
  let sweep = a2 - a1
  while (sweep < 0) sweep += 360
  const mid = a1 + sweep / 2
  // push wide labels (e.g. "(2x + 35)°") further out so they clear the arms
  const chars = label.replace(/<[^>]*>/g, '').length
  const halfW = chars * 4.2
  const lr = r + labelGap + (sweep < 35 ? 10 : 0) + Math.abs(Math.cos(rad(mid))) * Math.max(0, halfW - 10) + (sweep < 60 ? Math.max(0, halfW - 10) * 0.5 : 0)
  // a square marks a right angle, but only when the label does not hide the size (e.g. "2x°")
  const plain = label.replace(/<[^>]*>/g, '')
  const mark = Math.abs(sweep - 90) < 0.01 && (plain === '' || plain.includes('90')) ? rightMark(c, a1) : arc(c, r, a1, a2, cls)
  return mark + (label ? text(polar(c, lr, mid), label, 'dl ang') : '')
}

export function tick(a: P, b: P, count = 1): string {
  const m: P = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const L = Math.hypot(dx, dy)
  const ux = dx / L
  const uy = dy / L
  let s = ''
  for (let i = 0; i < count; i++) {
    const off = (i - (count - 1) / 2) * 5
    const c: P = [m[0] + ux * off, m[1] + uy * off]
    s += line([c[0] - uy * 6, c[1] + ux * 6], [c[0] + uy * 6, c[1] - ux * 6], 'tk')
  }
  return s
}

function arrowOnLine(a: P, b: P, count = 1, at = 0.5): string {
  const m: P = [a[0] + (b[0] - a[0]) * at, a[1] + (b[1] - a[1]) * at]
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const L = Math.hypot(dx, dy)
  const ux = dx / L
  const uy = dy / L
  let s = ''
  for (let i = 0; i < count; i++) {
    const c: P = [m[0] + ux * i * 7, m[1] + uy * i * 7]
    const back: P = [c[0] - ux * 8, c[1] - uy * 8]
    s += `<path class="ln" d="M${f(back[0] - uy * 5)},${f(back[1] + ux * 5)} L${f(c[0])},${f(c[1])} L${f(back[0] + uy * 5)},${f(back[1] - ux * 5)}"/>`
  }
  return s
}

/** Places a side label just outside the polygon side a→b (polygon centre given). */
export function sideLabel(a: P, b: P, centre: P, s: string, gap = 14): string {
  const m: P = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const L = Math.hypot(dx, dy)
  let nx = -dy / L
  let ny = dx / L
  if ((m[0] - centre[0]) * nx + (m[1] - centre[1]) * ny < 0) {
    nx = -nx
    ny = -ny
  }
  // wide labels beside steep sides need extra room so they do not cross the line
  const halfW = s.replace(/<[^>]*>/g, '').length * 4.3
  const g = gap + Math.abs(nx) * Math.max(0, halfW - 6)
  return text([m[0] + nx * g, m[1] + ny * g], s, 'dl side')
}

export function centroid(pts: P[]): P {
  return [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length]
}

/** Fits points into a box of width W, height H with padding. Returns transformed points. */
function fit(pts: P[], W: number, H: number, pad: number): P[] {
  const xs = pts.map((p) => p[0])
  const ys = pts.map((p) => p[1])
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const s = Math.min((W - 2 * pad) / (maxX - minX || 1), (H - 2 * pad) / (maxY - minY || 1))
  const ox = (W - (maxX - minX) * s) / 2
  const oy = (H - (maxY - minY) * s) / 2
  return pts.map((p) => [ox + (p[0] - minX) * s, oy + (maxY - p[1]) * s] as P)
}

function dirDeg(a: P, b: P): number {
  return (Math.atan2(-(b[1] - a[1]), b[0] - a[0]) * 180) / Math.PI
}

// ---------------- Angles ----------------

/** A single angle of the given size (to scale). */
export function singleAngle(size: number, label = '', start?: number): string {
  const W = 300
  const H = 200
  const s0 = start ?? (size > 180 ? 0 : 10)
  const c: P = size > 180 ? [150, 100] : [size > 100 ? 170 : 80, size > 180 ? 100 : 160]
  const r = size > 180 ? 80 : 120
  const body =
    line(c, polar(c, r, s0)) +
    line(c, polar(c, r, s0 + size)) +
    (size === 360 ? '' : '') +
    angleMark(c, s0, s0 + size, label, size > 180 ? 26 : 30, 18) +
    dot(c, 3)
  return svg(W, H, body, `Angle of ${num(size)} degrees`)
}

/** Rays from a point on a straight line. sizes add to 180. */
export function anglesOnLine(sizes: number[], labels: string[]): string {
  const W = 320
  const H = 170
  const c: P = [160, 140]
  let body = line([20, 140], [300, 140])
  let a = 0
  sizes.forEach((s, i) => {
    if (i > 0) body += line(c, polar(c, 125, a))
    body += angleMark(c, a, a + s, labels[i], 24 + (i % 2) * 6, 16)
    a += s
  })
  return svg(W, H, body + dot(c, 3), 'Angles on a straight line')
}

/** An angle (e.g. a right angle) split into parts by rays from the vertex. */
export function splitAngle(sizes: number[], labels: string[], markRight = false): string {
  const W = 280
  const H = 230
  const c: P = [70, 190]
  const total = sizes.reduce((s, x) => s + x, 0)
  const start = total <= 90 ? 0 : 0
  let body = line(c, polar(c, 175, start)) + line(c, polar(c, 175, start + total))
  if (markRight) body += rightMark(c, start, 11)
  let a = start
  sizes.forEach((s, i) => {
    if (i > 0) body += line(c, polar(c, 175, a))
    body += (markRight ? '' : arc(c, 26 + (i % 2) * 6, a, a + s)) + (labels[i] ? text(polar(c, 52 + (i % 2) * 12 + (s < 30 ? 22 : 0), a + s / 2), labels[i], 'dl ang') : '')
    if (markRight) body += arc(c, 34 + (i % 2) * 6, a, a + s)
    a += s
  })
  return svg(W, H, body + dot(c, 3), 'Angle split into parts')
}

/** Rays around a point. sizes add to 360. */
export function anglesAtPoint(sizes: number[], labels: string[], start = 15): string {
  const W = 300
  const H = 260
  const c: P = [150, 130]
  let body = ''
  let a = start
  sizes.forEach((s, i) => {
    body += line(c, polar(c, 115, a))
    body += angleMark(c, a, a + s, labels[i], 24 + (i % 2) * 6, 16)
    a += s
  })
  return svg(W, H, body + dot(c, 3), 'Angles at a point')
}

/** Two straight lines crossing. theta is the angle on the right. labels: [right, top, left, bottom] ('' for none). */
export function crossingLines(theta: number, labels: string[]): string {
  const W = 300
  const H = 220
  const c: P = [150, 110]
  const tilt = 15
  const d1 = tilt - theta / 2
  const d2 = tilt + theta / 2
  let body = line(polar(c, 130, d1), polar(c, 130, d1 + 180)) + line(polar(c, 130, d2), polar(c, 130, d2 + 180))
  const regions: [number, number][] = [
    [d1, d2],
    [d2, d1 + 180],
    [d1 + 180, d2 + 180],
    [d2 + 180, d1 + 360],
  ]
  regions.forEach(([a1, a2], i) => {
    if (labels[i]) body += angleMark(c, a1, a2, labels[i], 22 + (i % 2) * 4, 16)
  })
  return svg(W, H, body + dot(c, 3), 'Two intersecting lines')
}

/**
 * Two parallel lines cut by a transversal.
 * theta: acute angle between transversal and parallel lines (transversal leans right).
 * marks: list of {at: 0 (upper) | 1 (lower), pos: 0..3, label}
 * pos: 0 = above-right, 1 = above-left, 2 = below-left, 3 = below-right of the intersection.
 */
export function parallelLines(theta: number, marks: { at: 0 | 1; pos: 0 | 1 | 2 | 3; label: string }[]): string {
  const W = 320
  const H = 240
  const y1 = 75
  const y2 = 170
  const dx = (y2 - y1) / Math.tan(rad(theta))
  const c1: P = [160 + dx / 2, y1]
  const c2: P = [160 - dx / 2, y2]
  let body = line([15, y1], [305, y1]) + line([15, y2], [305, y2])
  body += arrowOnLine([15, y1], [305, y1], 1, 0.12) + arrowOnLine([15, y2], [305, y2], 1, 0.12)
  const ext = 60
  const L = Math.hypot(c1[0] - c2[0], c1[1] - c2[1])
  const ux = (c1[0] - c2[0]) / L
  const uy = (c1[1] - c2[1]) / L
  body += line([c2[0] - ux * ext, c2[1] - uy * ext], [c1[0] + ux * ext, c1[1] + uy * ext])
  for (const m of marks) {
    const c = m.at === 0 ? c1 : c2
    const ranges: [number, number][] = [
      [0, theta],
      [theta, 180],
      [180, 180 + theta],
      [180 + theta, 360],
    ]
    const [a1, a2] = ranges[m.pos]
    body += angleMark(c, a1, a2, m.label, m.pos % 2 === 0 ? 24 : 18, m.pos % 2 === 0 ? 20 : 16)
  }
  return svg(W, H, body + dot(c1, 3) + dot(c2, 3), 'Parallel lines cut by a transversal')
}

// ---------------- Triangles and polygons ----------------

/** Vertices of a triangle with angles A, B (at the base ends), base along x. Returns maths coordinates. */
export function trianglePoints(A: number, B: number): P[] {
  const C = 180 - A - B
  const base = 1
  // law of sines: side b (AC) = sin B / sin C
  const b = Math.sin(rad(B)) / Math.sin(rad(C))
  return [
    [0, 0],
    [base, 0],
    [b * Math.cos(rad(A)), b * Math.sin(rad(A))],
  ]
}

export interface TriOpts {
  angleLabels?: [string, string, string] // at A, B, C
  sideLabels?: [string, string, string] // AB, BC, CA
  vertexNames?: [string, string, string]
  ticks?: [number, number, number] // tick counts on AB, BC, CA
  rightAt?: number // index of a right angle to mark with a square
  extendBase?: 'right' | 'left' // draw base extension for an exterior angle at B (right) or A (left)
  extLabel?: string
  W?: number
  H?: number
}

/** A triangle drawn to scale from its angles (A at left, B at right). */
export function triangle(A: number, B: number, o: TriOpts = {}): string {
  const W = o.W ?? 320
  const H = o.H ?? 220
  const raw = trianglePoints(A, B)
  const extra: P[] = []
  if (o.extendBase === 'right') extra.push([1.45, 0])
  if (o.extendBase === 'left') extra.push([-0.45, 0])
  const all = fit([...raw, ...extra], W, H, 38)
  const pts = all.slice(0, 3)
  const ctr = centroid(pts)
  let body = poly(pts)
  if (o.extendBase === 'right') body += line(pts[1], all[3])
  if (o.extendBase === 'left') body += line(pts[0], all[3])
  const angs = [A, B, 180 - A - B]
  for (let i = 0; i < 3; i++) {
    const p = pts[i]
    const d1 = dirDeg(p, pts[(i + 1) % 3])
    const d2 = dirDeg(p, pts[(i + 2) % 3])
    let a1 = d1
    let a2 = d2
    let sw = a2 - a1
    while (sw < 0) sw += 360
    if (sw > 180) {
      ;[a1, a2] = [d2, d1]
    }
    const label = o.angleLabels?.[i] ?? ''
    if (o.rightAt === i) body += rightMark(p, a1, 12) + (label ? text(polar(p, 30, (a1 + a1 + 90) / 2), label, 'dl ang') : '')
    else if (label) body += angleMark(p, a1, a2, label, angs[i] < 40 ? 30 : 20, 15)
  }
  if (o.extendBase === 'right' && o.extLabel !== undefined) {
    const d = dirDeg(pts[1], pts[2])
    body += angleMark(pts[1], 0, d, o.extLabel, 20, 16)
  }
  if (o.extendBase === 'left' && o.extLabel !== undefined) {
    const d = dirDeg(pts[0], pts[2])
    body += angleMark(pts[0], d, 180, o.extLabel, 20, 16)
  }
  if (o.sideLabels) {
    for (let i = 0; i < 3; i++) if (o.sideLabels[i]) body += sideLabel(pts[i], pts[(i + 1) % 3], ctr, o.sideLabels[i])
  }
  if (o.ticks) {
    for (let i = 0; i < 3; i++) if (o.ticks[i]) body += tick(pts[i], pts[(i + 1) % 3], o.ticks[i])
  }
  if (o.vertexNames) {
    for (let i = 0; i < 3; i++) {
      const p = pts[i]
      const dx = p[0] - ctr[0]
      const dy = p[1] - ctr[1]
      const L = Math.hypot(dx, dy)
      body += text([p[0] + (dx / L) * 16, p[1] + (dy / L) * 16], o.vertexNames[i], 'dl vx')
    }
  }
  return svg(W, H, body, 'Triangle')
}

/** Quadrilateral with given interior angles A, B, C (D = 360 − A − B − C), drawn to scale where possible. */
export function quadrilateral(angles: [number, number, number, number], labels: [string, string, string, string]): string {
  const [A, B, C, D] = angles
  const dirs = [0, 180 - B, 360 - B - C, 540 - B - C - D].map(rad)
  // AB = 1, BC = s; solve for CD = t and DA = u
  let pts: P[] | null = null
  let best = 0
  for (let s = 0.4; s <= 2.6; s += 0.05) {
    const rx = -(Math.cos(dirs[0]) + s * Math.cos(dirs[1]))
    const ry = -(Math.sin(dirs[0]) + s * Math.sin(dirs[1]))
    const a = Math.cos(dirs[2])
    const b = Math.cos(dirs[3])
    const c = Math.sin(dirs[2])
    const d = Math.sin(dirs[3])
    const det = a * d - b * c
    if (Math.abs(det) < 1e-9) continue
    const t = (rx * d - b * ry) / det
    const u = (a * ry - c * rx) / det
    if (t > 0.2 && u > 0.2) {
      const sides = [1, s, t, u]
      const score = Math.min(...sides) / Math.max(...sides)
      if (score > best) {
        best = score
        const p0: P = [0, 0]
        const p1: P = [1, 0]
        const p2: P = [p1[0] + s * Math.cos(dirs[1]), p1[1] + s * Math.sin(dirs[1])]
        const p3: P = [p2[0] + t * Math.cos(dirs[2]), p2[1] + t * Math.sin(dirs[2])]
        pts = [p0, p1, p2, p3]
      }
    }
  }
  if (!pts) pts = [[0, 0], [1, 0], [1.1, 0.8], [-0.1, 0.9]]
  void A
  const xs = pts.map((p) => p[0])
  const ys = pts.map((p) => p[1])
  const aspect = (Math.max(...ys) - Math.min(...ys)) / (Math.max(...xs) - Math.min(...xs) || 1)
  const QH = Math.round(Math.max(210, Math.min(360, 240 * aspect + 80)))
  const sp = fit(pts, 320, QH, 40)
  const ctr = centroid(sp)
  let body = poly(sp)
  for (let i = 0; i < 4; i++) {
    const p = sp[i]
    let a1 = dirDeg(p, sp[(i + 1) % 4])
    let a2 = dirDeg(p, sp[(i + 3) % 4])
    let sw = a2 - a1
    while (sw < 0) sw += 360
    if (sw > 180) [a1, a2] = [a2, a1]
    if (labels[i]) body += angleMark(p, a1, a2, labels[i], 20, 15)
  }
  void ctr
  return svg(320, QH, body, 'Quadrilateral')
}

/** Right-angled triangle. legs a (horizontal), b (vertical) set the shape; labels for the three sides and optional angle. */
export function rightTriangle(
  a: number,
  b: number,
  o: {
    base?: string
    height?: string
    hyp?: string
    angleAt?: 'base' | 'top' // angle label at the end of the base (away from right angle) or at the top
    angleLabel?: string
    flip?: boolean // right angle on the right instead of the left
    names?: [string, string, string] // right-angle vertex, base end, top
  } = {},
): string {
  const ratio = Math.max(0.35, Math.min(2.2, b / a))
  const raw: P[] = o.flip
    ? [
        [1, 0],
        [0, 0],
        [1, ratio],
      ]
    : [
        [0, 0],
        [1, 0],
        [0, ratio],
      ]
  const pts = fit(raw, 320, 230, 42)
  const ctr = centroid(pts)
  const [R, Bp, T] = pts
  let body = poly(pts)
  body += rightMark(R, o.flip ? 90 : 0, 13)
  if (o.base) body += sideLabel(R, Bp, ctr, o.base)
  if (o.height) body += sideLabel(R, T, ctr, o.height)
  if (o.hyp) body += sideLabel(Bp, T, ctr, o.hyp, 16)
  if (o.angleLabel && o.angleAt) {
    const p = o.angleAt === 'base' ? Bp : T
    let a1 = dirDeg(p, o.angleAt === 'base' ? R : Bp)
    let a2 = dirDeg(p, o.angleAt === 'base' ? T : R)
    let sw = a2 - a1
    while (sw < 0) sw += 360
    if (sw > 180) [a1, a2] = [a2, a1]
    body += angleMark(p, a1, a2, o.angleLabel, 28, 16)
  }
  if (o.names) {
    pts.forEach((p, i) => {
      const dx = p[0] - ctr[0]
      const dy = p[1] - ctr[1]
      const L = Math.hypot(dx, dy)
      body += text([p[0] + (dx / L) * 16, p[1] + (dy / L) * 16], o.names![i], 'dl vx')
    })
  }
  return svg(320, 230, body, 'Right-angled triangle')
}

// ---------------- 2D shapes for perimeter and area ----------------

export function rectangle(w: number, h: number, wl: string, hl: string, square = false): string {
  const pts = fit(
    [
      [0, 0],
      [w, 0],
      [w, h],
      [0, h],
    ],
    320,
    210,
    40,
  )
  const ctr = centroid(pts)
  let body = poly(pts) + rightMark(pts[0], 0, 10)
  body += sideLabel(pts[0], pts[1], ctr, wl)
  if (hl) body += sideLabel(pts[1], pts[2], ctr, hl)
  if (square) for (let i = 0; i < 4; i++) body += tick(pts[i], pts[(i + 1) % 4])
  return svg(320, 210, body, 'Rectangle')
}

/** Triangle with base and perpendicular height shown (apex offset as a fraction of the base). */
export function triangleBH(b: number, h: number, bl: string, hl: string, apexAt = 0.35, slant?: [string, string]): string {
  const apexX = apexAt * b
  const pts = fit(
    [
      [0, 0],
      [b, 0],
      [apexX, h],
      [apexX, 0],
    ],
    320,
    220,
    42,
  )
  const [A, B, C, F] = pts
  const ctr = centroid([A, B, C])
  let body = poly([A, B, C])
  body += `<line class="ln dash" x1="${f(C[0])}" y1="${f(C[1])}" x2="${f(F[0])}" y2="${f(F[1])}"/>`
  body += rightMark(F, 0, 9)
  body += sideLabel(A, B, ctr, bl)
  body += text([F[0] + 8, (C[1] + F[1]) / 2], hl, 'dl side', 'start')
  if (slant) {
    if (slant[0]) body += sideLabel(A, C, ctr, slant[0])
    if (slant[1]) body += sideLabel(B, C, ctr, slant[1])
  }
  return svg(320, 220, body, 'Triangle with base and height')
}

export function parallelogram(b: number, h: number, bl: string, hl: string, slantLabel = ''): string {
  const off = 0.35 * b
  const pts = fit(
    [
      [0, 0],
      [b, 0],
      [b + off, h],
      [off, h],
      [off, 0],
    ],
    330,
    210,
    40,
  )
  const [A, B, C, D, F] = pts
  const ctr = centroid([A, B, C, D])
  let body = poly([A, B, C, D])
  body += `<line class="ln dash" x1="${f(D[0])}" y1="${f(D[1])}" x2="${f(F[0])}" y2="${f(F[1])}"/>` + rightMark(F, 0, 9)
  body += sideLabel(A, B, ctr, bl) + text([F[0] + 8, (D[1] + F[1]) / 2], hl, 'dl side', 'start')
  if (slantLabel) body += sideLabel(B, C, ctr, slantLabel)
  body += arrowOnLine(A, B, 1) + arrowOnLine(D, C, 1)
  return svg(330, 210, body, 'Parallelogram')
}

/** Trapezium with parallel sides a (top) and b (bottom), height h. */
export function trapezium(a: number, b: number, h: number, al: string, bl: string, hl: string): string {
  const left = (b - a) * 0.3
  const pts = fit(
    [
      [0, 0],
      [b, 0],
      [left + a, h],
      [left, h],
      [left, 0],
    ],
    330,
    210,
    40,
  )
  const [A, B, C, D, F] = pts
  const ctr = centroid([A, B, C, D])
  let body = poly([A, B, C, D])
  body += `<line class="ln dash" x1="${f(D[0])}" y1="${f(D[1])}" x2="${f(F[0])}" y2="${f(F[1])}"/>` + rightMark(F, 0, 9)
  body += sideLabel(A, B, ctr, bl) + sideLabel(D, C, ctr, al) + text([F[0] + 8, (D[1] + F[1]) / 2], hl, 'dl side', 'start')
  body += arrowOnLine(A, B, 1, 0.75) + arrowOnLine(D, C, 1, 0.75)
  return svg(330, 210, body, 'Trapezium')
}

/** Rhombus (kite=false) or kite with diagonals x (horizontal) and y (vertical). */
export function diagonalsShape(x: number, y: number, xl: string, yl: string, kite = false): string {
  const top = kite ? 0.3 : 0.5
  const pts = fit(
    [
      [0, 0],
      [x / 2, -y * (1 - top)],
      [x, 0],
      [x / 2, y * top],
    ].map((p) => [p[0], p[1]] as P),
    320,
    230,
    40,
  )
  const [L, Bm, R, T] = pts
  let body = poly(pts)
  body += `<line class="ln dash" x1="${f(L[0])}" y1="${f(L[1])}" x2="${f(R[0])}" y2="${f(R[1])}"/>`
  body += `<line class="ln dash" x1="${f(T[0])}" y1="${f(T[1])}" x2="${f(Bm[0])}" y2="${f(Bm[1])}"/>`
  const ctr: P = [T[0], L[1]]
  body += rightMark(ctr, 0, 8)
  body += text([(L[0] + ctr[0]) / 2, ctr[1] - 12], xl, 'dl side')
  body += text([ctr[0] + 8, (T[1] + Bm[1]) / 2 + 18], yl, 'dl side', 'start')
  if (!kite) for (let i = 0; i < 4; i++) body += tick(pts[i], pts[(i + 1) % 4])
  else {
    body += tick(L, Bm) + tick(Bm, R)
    body += tick(R, T, 2) + tick(T, L, 2)
  }
  return svg(320, 230, body, kite ? 'Kite' : 'Rhombus')
}

/** Circle with radius or diameter labelled. kind: 'full' | 'semi' | 'quarter' */
export function circleShape(label: string, show: 'radius' | 'diameter', kind: 'full' | 'semi' | 'quarter' = 'full'): string {
  const W = 300
  const H = kind === 'semi' ? 170 : 240
  const c: P = kind === 'quarter' ? [90, 190] : kind === 'semi' ? [150, 140] : [150, 120]
  const r = kind === 'quarter' ? 150 : 100
  let body = ''
  if (kind === 'full') body += `<circle class="sh" cx="${c[0]}" cy="${c[1]}" r="${r}"/>`
  else if (kind === 'semi')
    body += `<path class="sh" d="M${c[0] - r},${c[1]} A${r},${r} 0 0 1 ${c[0] + r},${c[1]} Z"/>`
  else body += `<path class="sh" d="M${c[0]},${c[1]} L${c[0] + r},${c[1]} A${r},${r} 0 0 0 ${c[0]},${c[1] - r} Z"/>` + rightMark(c, 0, 12)
  body += dot(c, 3)
  if (show === 'radius') {
    const e: P = kind === 'quarter' ? [c[0] + r, c[1]] : kind === 'semi' ? [c[0] + r, c[1]] : polar(c, r, 25)
    body += line(c, e, 'ln hlstroke') + text([(c[0] + e[0]) / 2, (c[1] + e[1]) / 2 - 12], label, 'dl side')
  } else {
    body += line([c[0] - r, c[1]], [c[0] + r, c[1]], 'ln hlstroke') + text([c[0], c[1] - 14], label, 'dl side')
  }
  return svg(W, H, body, 'Circle')
}

/** Composite L-shape: outer W×H rectangle with a w×h notch removed from the top-right corner. */
export function lShape(Wd: number, Hd: number, w: number, h: number, labels: { W: string; H: string; a: string; b: string; c?: string; d?: string }): string {
  const raw: P[] = [
    [0, 0],
    [Wd, 0],
    [Wd, Hd - h],
    [Wd - w, Hd - h],
    [Wd - w, Hd],
    [0, Hd],
  ]
  const pts = fit(raw, 320, 230, 42)
  const ctr = centroid(pts)
  let body = poly(pts)
  body += sideLabel(pts[0], pts[1], ctr, labels.W)
  body += sideLabel(pts[5], pts[0], ctr, labels.H)
  if (labels.a) body += sideLabel(pts[4], pts[5], [ctr[0], ctr[1] + 400], labels.a) // top edge
  if (labels.b) body += sideLabel(pts[1], pts[2], [ctr[0] - 400, ctr[1]], labels.b) // right lower edge
  // notch edges: put each label on whichever side has more room
  const lowerRoom = Hd - h
  const leftRoom = Wd - w
  if (labels.c) body += sideLabel(pts[2], pts[3], [ctr[0], ctr[1] + (lowerRoom >= h ? -400 : 400)], labels.c) // notch, horizontal edge
  if (labels.d) body += sideLabel(pts[3], pts[4], [ctr[0] + (leftRoom >= w ? 400 : -400), ctr[1]], labels.d) // notch, vertical edge
  return svg(320, 230, body, 'Composite shape')
}

// ---------------- Solids ----------------

export function rectPrism(l: number, w: number, h: number, ll: string, wl: string, hl: string): string {
  const dx = 0.5 * w * Math.cos(rad(35))
  const dy = 0.5 * w * Math.sin(rad(35))
  const raw: P[] = [
    [0, 0],
    [l, 0],
    [l, h],
    [0, h],
    [dx, dy],
    [l + dx, dy],
    [l + dx, h + dy],
    [dx, h + dy],
  ]
  const p = fit(raw, 330, 240, 40)
  let body = poly([p[0], p[1], p[2], p[3]], 'sh')
  body += poly([p[3], p[2], p[6], p[7]], 'sh sh2') + poly([p[1], p[5], p[6], p[2]], 'sh sh3')
  body += `<path class="ln dash" d="M${f(p[0][0])},${f(p[0][1])} L${f(p[4][0])},${f(p[4][1])} L${f(p[5][0])},${f(p[5][1])} M${f(p[4][0])},${f(p[4][1])} L${f(p[7][0])},${f(p[7][1])}"/>`
  body += text([(p[0][0] + p[1][0]) / 2, p[0][1] + 16], ll, 'dl side')
  body += text([(p[1][0] + p[5][0]) / 2 + 14, (p[1][1] + p[5][1]) / 2 + 6], wl, 'dl side', 'start')
  body += text([p[0][0] - 10, (p[0][1] + p[3][1]) / 2], hl, 'dl side', 'end')
  return svg(330, 240, body, 'Rectangular prism')
}

/** Triangular prism: right-angled triangular face (base b, height h) and length l. */
export function triPrism(b: number, h: number, l: number, bl: string, hl: string, ll: string, hypl = ''): string {
  const dx = 0.55 * l * Math.cos(rad(25))
  const dy = 0.55 * l * Math.sin(rad(25))
  const raw: P[] = [
    [0, 0],
    [b, 0],
    [0, h],
    [dx, dy],
    [b + dx, dy],
    [dx, h + dy],
  ]
  const p = fit(raw, 330, 240, 40)
  let body = poly([p[0], p[1], p[2]], 'sh') + rightMark(p[0], 0, 9)
  body += poly([p[1], p[4], p[5], p[2]], 'sh sh3')
  body += `<path class="ln dash" d="M${f(p[0][0])},${f(p[0][1])} L${f(p[3][0])},${f(p[3][1])} L${f(p[4][0])},${f(p[4][1])} M${f(p[3][0])},${f(p[3][1])} L${f(p[5][0])},${f(p[5][1])}"/>`
  body += text([(p[0][0] + p[1][0]) / 2, p[0][1] + 16], bl, 'dl side')
  body += text([p[0][0] - 10, (p[0][1] + p[2][1]) / 2], hl, 'dl side', 'end')
  body += text([(p[1][0] + p[4][0]) / 2 + 12, (p[1][1] + p[4][1]) / 2 + 8], ll, 'dl side', 'start')
  if (hypl) body += text([(p[1][0] + p[2][0]) / 2 + 6, (p[1][1] + p[2][1]) / 2 - 8], hypl, 'dl side', 'start')
  return svg(330, 240, body, 'Triangular prism')
}

export function cylinder(r: number, h: number, rl: string, hl: string, showDiameter = false): string {
  const W = 260
  const H = 260
  const ratio = Math.max(0.5, Math.min(2.2, h / (2 * r)))
  const rx = 70
  const ry = 18
  const hh = Math.min(170, 140 * ratio)
  const cx = 130
  const top = (H - hh) / 2
  const bot = top + hh
  let body = `<path class="sh" d="M${cx - rx},${top} L${cx - rx},${bot} A${rx},${ry} 0 0 0 ${cx + rx},${bot} L${cx + rx},${top}"/>`
  body += `<ellipse class="sh sh2" cx="${cx}" cy="${top}" rx="${rx}" ry="${ry}"/>`
  body += `<path class="ln dash" d="M${cx - rx},${bot} A${rx},${ry} 0 0 1 ${cx + rx},${bot}"/>`
  body += dot([cx, top], 2.5)
  if (showDiameter) body += line([cx - rx, top], [cx + rx, top], 'ln hlstroke') + text([cx, top - ry - 10], rl, 'dl side')
  else body += line([cx, top], [cx + rx, top], 'ln hlstroke') + text([cx + rx / 2, top - ry - 8], rl, 'dl side')
  body += text([cx + rx + 10, (top + bot) / 2], hl, 'dl side', 'start')
  return svg(W, H, body, 'Cylinder', 260)
}

// ---------------- Number plane and graphs ----------------

export interface PlaneOpts {
  xmin: number
  xmax: number
  ymin: number
  ymax: number
  points?: { x: number; y: number; label?: string }[]
  lines?: { m: number; c: number; label?: string }[] // y = mx + c
  curves?: { fn: (x: number) => number; label?: string }[]
  segments?: { a: P; b: P }[]
  size?: number
}

export function numberPlane(o: PlaneOpts): string {
  const cells = Math.max(o.xmax - o.xmin, o.ymax - o.ymin)
  const S = o.size ?? 300
  const step = (S - 40) / cells
  const W = (o.xmax - o.xmin) * step + 40
  const H = (o.ymax - o.ymin) * step + 40
  const X = (x: number) => 20 + (x - o.xmin) * step
  const Y = (y: number) => 20 + (o.ymax - y) * step
  let body = ''
  for (let x = o.xmin; x <= o.xmax; x++) body += line([X(x), Y(o.ymin)], [X(x), Y(o.ymax)], 'grid')
  for (let y = o.ymin; y <= o.ymax; y++) body += line([X(o.xmin), Y(y)], [X(o.xmax), Y(y)], 'grid')
  if (o.ymin <= 0 && o.ymax >= 0) body += line([X(o.xmin) - 8, Y(0)], [X(o.xmax) + 10, Y(0)], 'axis')
  if (o.xmin <= 0 && o.xmax >= 0) body += line([X(0), Y(o.ymin) + 8], [X(0), Y(o.ymax) - 10], 'axis')
  body += text([X(o.xmax) + 12, Y(0) - 10], '<tspan font-style="italic">x</tspan>', 'dl small')
  body += text([X(0) + 12, Y(o.ymax) - 6], '<tspan font-style="italic">y</tspan>', 'dl small')
  const lab = cells > 14 ? 2 : 1
  for (let x = o.xmin; x <= o.xmax; x++) if (x !== 0 && x % lab === 0) body += text([X(x), Y(0) + 11], num(x), 'dl tiny')
  for (let y = o.ymin; y <= o.ymax; y++) if (y !== 0 && y % lab === 0) body += text([X(0) - 9, Y(y)], num(y), 'dl tiny', 'end')
  // label the origin only when the axes meet at the bottom-left corner (otherwise "0" sits beside "−1" and reads as "−10")
  if (o.xmin === 0 && o.ymin === 0) body += text([X(0) - 8, Y(0) + 10], '0', 'dl tiny', 'end')
  const clipId = 'c' + Math.floor(Math.random() * 1e9)
  body += `<clipPath id="${clipId}"><rect x="${X(o.xmin)}" y="${Y(o.ymax)}" width="${X(o.xmax) - X(o.xmin)}" height="${Y(o.ymin) - Y(o.ymax)}"/></clipPath>`
  let plotted = ''
  for (const l of o.lines ?? []) {
    const x1 = o.xmin
    const x2 = o.xmax
    plotted += line([X(x1), Y(l.m * x1 + l.c)], [X(x2), Y(l.m * x2 + l.c)], 'plot')
    if (l.label) {
      // label near the right-hand end of the line, inside the plane and away from the x-axis
      let best: [number, number] | null = null
      for (let lx = o.xmax - 0.6; lx >= o.xmin + 0.5; lx -= 0.25) {
        const ly = l.m * lx + l.c
        if (ly <= o.ymax - 0.6 && ly >= o.ymin + 0.6 && Math.abs(ly) > 0.9) {
          best = [lx, ly]
          break
        }
      }
      if (best) body += text([X(best[0]) + 8, Y(best[1]) - 4], l.label, 'dl small hl', 'start')
    }
  }
  for (const c of o.curves ?? []) {
    let d = ''
    const N = 120
    for (let i = 0; i <= N; i++) {
      const x = o.xmin + ((o.xmax - o.xmin) * i) / N
      const y = c.fn(x)
      d += (i === 0 ? 'M' : 'L') + f(X(x)) + ',' + f(Y(Math.max(o.ymin - 5, Math.min(o.ymax + 5, y))))
    }
    plotted += `<path class="plot" d="${d}"/>`
  }
  for (const s of o.segments ?? []) plotted += line([X(s.a[0]), Y(s.a[1])], [X(s.b[0]), Y(s.b[1])], 'plot')
  body += `<g clip-path="url(#${clipId})">${plotted}</g>`
  for (const p of o.points ?? []) {
    body += dot([X(p.x), Y(p.y)], 4.5, 'pt hlfill')
    if (p.label) body += text([X(p.x) + 9, Y(p.y) - 11], p.label, 'dl small', 'start')
  }
  return svg(W, H, body, 'Number plane', 360)
}

// ---------------- Statistics ----------------

export function dotPlot(values: number[], min: number, max: number, axisLabel = ''): string {
  const n = max - min
  const W = Math.max(260, Math.min(360, 40 + n * 28))
  const step = (W - 40) / n
  const counts: Record<number, number> = {}
  values.forEach((v) => (counts[v] = (counts[v] || 0) + 1))
  const maxC = Math.max(...Object.values(counts), 1)
  const H = 60 + maxC * 16
  const base = H - 36
  let body = line([14, base], [W - 14, base], 'axis')
  for (let x = min; x <= max; x++) {
    const px = 20 + (x - min) * step
    body += line([px, base], [px, base + 5], 'axis') + text([px, base + 15], num(x), 'dl tiny')
    for (let k = 0; k < (counts[x] || 0); k++) body += dot([px, base - 9 - k * 15], 5.5, 'pt hlfill')
  }
  if (axisLabel) body += text([W / 2, H - 6], axisLabel, 'dl tiny')
  return svg(W, H, body, 'Dot plot', 360)
}

export function columnGraph(cats: string[], vals: number[], yStep: number, yLabel = '', title = ''): string {
  const W = 340
  const H = 240
  const maxV = Math.ceil(Math.max(...vals) / yStep) * yStep
  const left = 46
  const bottom = H - 42
  const top = title ? 34 : 16
  const plotH = bottom - top
  const bw = (W - left - 14) / cats.length
  let body = ''
  for (let v = 0; v <= maxV; v += yStep) {
    const y = bottom - (v / maxV) * plotH
    body += line([left, y], [W - 10, y], 'grid') + text([left - 6, y], num(v), 'dl tiny', 'end')
  }
  cats.forEach((c, i) => {
    const h = (vals[i] / maxV) * plotH
    body += `<rect class="bar" x="${f(left + i * bw + bw * 0.18)}" y="${f(bottom - h)}" width="${f(bw * 0.64)}" height="${f(h)}"/>`
    body += text([left + i * bw + bw / 2, bottom + 13], c, 'dl tiny')
  })
  body += line([left, bottom], [W - 10, bottom], 'axis') + line([left, bottom], [left, top - 4], 'axis')
  if (yLabel) body += `<text class="dl tiny" transform="translate(12 ${(top + bottom) / 2}) rotate(-90)" text-anchor="middle">${yLabel}</text>`
  if (title) body += text([W / 2, 14], title, 'dl small')
  return svg(W, H, body, 'Column graph', 380)
}

export function boxPlot(five: [number, number, number, number, number], min: number, max: number, step: number, label = ''): string {
  const W = 340
  const H = 120
  const X = (v: number) => 24 + ((v - min) / (max - min)) * (W - 48)
  const y = 44
  let body = ''
  body += line([X(five[0]), y], [X(five[1]), y]) + line([X(five[3]), y], [X(five[4]), y])
  body += `<rect class="sh" x="${f(X(five[1]))}" y="${y - 18}" width="${f(X(five[3]) - X(five[1]))}" height="36"/>`
  body += line([X(five[2]), y - 18], [X(five[2]), y + 18])
  body += line([X(five[0]), y - 10], [X(five[0]), y + 10]) + line([X(five[4]), y - 10], [X(five[4]), y + 10])
  const ay = 86
  body += line([X(min), ay], [X(max), ay], 'axis')
  for (let v = min; v <= max + 1e-9; v += step) body += line([X(v), ay], [X(v), ay + 5], 'axis') + text([X(v), ay + 15], num(v), 'dl tiny')
  if (label) body += text([W / 2, H - 4], label, 'dl tiny')
  return svg(W, H + 6, body, 'Box plot', 380)
}

/** Histogram from frequencies (for shape questions). */
export function histogram(freqs: number[], labels?: string[]): string {
  const W = 320
  const H = 190
  const maxF = Math.max(...freqs)
  const left = 20
  const bottom = H - 30
  const bw = (W - 40) / freqs.length
  let body = ''
  freqs.forEach((fr, i) => {
    const h = (fr / maxF) * (bottom - 20)
    body += `<rect class="bar" x="${f(left + i * bw)}" y="${f(bottom - h)}" width="${f(bw)}" height="${f(h)}"/>`
    if (labels) body += text([left + i * bw + bw / 2, bottom + 12], labels[i], 'dl tiny')
  })
  body += line([left, bottom], [W - 20, bottom], 'axis')
  return svg(W, H, body, 'Histogram')
}

export function scatter(pts: P[], xLabel: string, yLabel: string): string {
  const W = 320
  const H = 240
  const xs = pts.map((p) => p[0])
  const ys = pts.map((p) => p[1])
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const X = (x: number) => 44 + ((x - minX) / (maxX - minX || 1)) * (W - 64)
  const Y = (y: number) => H - 44 - ((y - minY) / (maxY - minY || 1)) * (H - 70)
  let body = line([34, H - 34], [W - 10, H - 34], 'axis') + line([34, H - 34], [34, 10], 'axis')
  pts.forEach((p) => (body += dot([X(p[0]), Y(p[1])], 4.5, 'pt hlfill')))
  body += text([W / 2 + 10, H - 14], xLabel, 'dl tiny')
  body += `<text class="dl tiny" transform="translate(16 ${(H - 34) / 2}) rotate(-90)" text-anchor="middle">${yLabel}</text>`
  return svg(W, H, body, 'Scatter plot')
}

// ---------------- Probability ----------------

export function venn(aLabel: string, bLabel: string, onlyA: string, both: string, onlyB: string, neither: string): string {
  const W = 330
  const H = 220
  let body = `<rect class="frame" x="8" y="8" width="${W - 16}" height="${H - 16}" rx="6"/>`
  body += `<circle class="sh vennA" cx="125" cy="115" r="72"/><circle class="sh vennB" cx="205" cy="115" r="72"/>`
  body += text([88, 30], aLabel, 'dl small') + text([244, 30], bLabel, 'dl small')
  body += text([95, 115], onlyA) + text([165, 115], both) + text([236, 115], onlyB)
  body += text([W - 34, H - 26], neither)
  return svg(W, H, body, 'Venn diagram')
}

export function spinner(sectors: { label: string; cls: string }[]): string {
  const W = 220
  const c: P = [110, 110]
  const r = 90
  let body = ''
  const n = sectors.length
  sectors.forEach((s, i) => {
    const a1 = 90 - (360 / n) * i
    const a2 = 90 - (360 / n) * (i + 1)
    const p1 = polar(c, r, a1)
    const p2 = polar(c, r, a2)
    body += `<path class="sector ${s.cls}" d="M${c[0]},${c[1]} L${f(p1[0])},${f(p1[1])} A${r},${r} 0 0 1 ${f(p2[0])},${f(p2[1])} Z"/>`
    body += text(polar(c, r * 0.62, (a1 + a2) / 2), s.label, 'dl small')
  })
  body += `<path class="needle" d="M110,110 L${f(polar(c, 70, 50)[0])},${f(polar(c, 70, 50)[1])}"/>` + dot(c, 5)
  return svg(W, 220, body, 'Spinner', 220)
}

// ---------------- Similar figures ----------------

/** Two similar triangles side by side, the second scaled by k. labels: side labels for each. */
export function similarTriangles(
  A: number,
  B: number,
  k: number,
  l1: [string, string, string],
  l2: [string, string, string],
): string {
  const t = trianglePoints(A, B)
  const s1 = t
  const s2 = t.map((p) => [p[0] * k + 1.35, p[1] * k] as P)
  const all = fit([...s1, ...s2], 360, 220, 30)
  const p1 = all.slice(0, 3)
  const p2 = all.slice(3)
  let body = poly(p1) + poly(p2)
  const c1 = centroid(p1)
  const c2 = centroid(p2)
  for (let i = 0; i < 3; i++) {
    if (l1[i]) body += sideLabel(p1[i], p1[(i + 1) % 3], c1, l1[i])
    if (l2[i]) body += sideLabel(p2[i], p2[(i + 1) % 3], c2, l2[i])
  }
  // matching angle marks
  for (const [pts] of [[p1], [p2]] as P[][][]) {
    const pA = pts[0]
    const d1 = dirDeg(pA, pts[1])
    const d2 = dirDeg(pA, pts[2])
    body += arc(pA, 16, Math.min(d1, d2), Math.max(d1, d2))
    const pB = pts[1]
    const e1 = dirDeg(pB, pts[2])
    body += arc(pB, 16, e1, 180) + arc(pB, 20, e1, 180)
  }
  return svg(360, 220, body, 'Two similar triangles', 400)
}

/** Simple HTML table helper. */
export function table(head: string[], rows: (string | number)[][], cls = 'dtable'): string {
  const th = head.map((h) => `<th>${h}</th>`).join('')
  const tb = rows
    .map((r) => '<tr>' + r.map((c, i) => (i === 0 && head[0] !== '' ? `<th scope="row">${c}</th>` : `<td>${c}</td>`)).join('') + '</tr>')
    .join('')
  return `<div class="tablewrap"><table class="${cls}"><thead><tr>${th}</tr></thead><tbody>${tb}</tbody></table></div>`
}

/** Horizontal table (first column is the row header). */
export function hTable(rows: (string | number)[][], cls = 'dtable htable'): string {
  const tb = rows.map((r) => '<tr>' + r.map((c, i) => (i === 0 ? `<th scope="row">${c}</th>` : `<td>${c}</td>`)).join('') + '</tr>').join('')
  return `<div class="tablewrap"><table class="${cls}"><tbody>${tb}</tbody></table></div>`
}

export function stemLeaf(values: number[], keyStem: number, keyLeaf: number, unit = ''): string {
  const sorted = values.slice().sort((a, b) => a - b)
  const stems = new Map<number, number[]>()
  const minS = Math.floor(sorted[0] / 10)
  const maxS = Math.floor(sorted[sorted.length - 1] / 10)
  for (let s = minS; s <= maxS; s++) stems.set(s, [])
  sorted.forEach((v) => stems.get(Math.floor(v / 10))!.push(v % 10))
  const rows = Array.from(stems.entries())
    .map(([s, ls]) => `<tr><td class="stem">${s}</td><td class="leaf">${ls.join('&ensp;')}</td></tr>`)
    .join('')
  return `<div class="tablewrap"><table class="stemleaf"><thead><tr><th>Stem</th><th>Leaf</th></tr></thead><tbody>${rows}</tbody></table><p class="key">Key: ${keyStem} | ${keyLeaf} = ${keyStem * 10 + keyLeaf}${unit ? ' ' + unit : ''}</p></div>`
}

// ---------------- More composite shapes ----------------

/** Rectangle w × h with a semicircle (diameter h) on its right end. */
export function rectSemi(w: number, h: number, wl: string, hl: string): string {
  const W = 340
  const H = 220
  const scale = Math.min((W - 80) / (w + h / 2), (H - 70) / h)
  const x0 = 30
  const y0 = (H - h * scale) / 2
  const rw = w * scale
  const rh = h * scale
  const r = rh / 2
  let body = `<path class="sh" d="M${f(x0)},${f(y0)} L${f(x0 + rw)},${f(y0)} A${f(r)},${f(r)} 0 0 1 ${f(x0 + rw)},${f(y0 + rh)} L${f(x0)},${f(y0 + rh)} Z"/>`
  body += `<line class="ln dash" x1="${f(x0 + rw)}" y1="${f(y0)}" x2="${f(x0 + rw)}" y2="${f(y0 + rh)}"/>`
  body += text([x0 + rw / 2, y0 + rh + 16], wl, 'dl side')
  body += text([x0 - 8, y0 + rh / 2], hl, 'dl side', 'end')
  return svg(W, H, body, 'Rectangle with a semicircle')
}

/** Rectangle with an isosceles triangle on top (a house shape). */
export function house(w: number, h: number, roof: number, wl: string, hl: string, rl: string): string {
  const pts = fit(
    [
      [0, 0],
      [w, 0],
      [w, h],
      [w / 2, h + roof],
      [0, h],
    ],
    320,
    240,
    40,
  )
  let body = poly(pts)
  body += `<line class="ln dash" x1="${f(pts[4][0])}" y1="${f(pts[4][1])}" x2="${f(pts[2][0])}" y2="${f(pts[2][1])}"/>`
  const apex = pts[3]
  const baseMid: P = [apex[0], pts[2][1]]
  body += `<line class="ln dash" x1="${f(apex[0])}" y1="${f(apex[1])}" x2="${f(baseMid[0])}" y2="${f(baseMid[1])}"/>`
  body += rightMark(baseMid, 0, 8)
  body += text([(pts[0][0] + pts[1][0]) / 2, pts[0][1] + 16], wl, 'dl side')
  body += text([pts[1][0] + 10, (pts[1][1] + pts[2][1]) / 2], hl, 'dl side', 'start')
  body += text([apex[0] + 8, (apex[1] + baseMid[1]) / 2], rl, 'dl side', 'start')
  return svg(320, 240, body, 'Composite shape')
}

/** Annulus (ring) with outer and inner radius labels. */
export function annulus(R: number, r: number, Rl: string, rl: string): string {
  const c: P = [150, 120]
  const RR = 100
  const rr = Math.max(25, (r / R) * RR)
  let body = `<circle class="sh" cx="${c[0]}" cy="${c[1]}" r="${RR}"/><circle class="sh sh-bg" cx="${c[0]}" cy="${c[1]}" r="${f(rr)}"/>`
  const e1 = polar(c, RR, 35)
  const e2 = polar(c, rr, 200)
  body += line(c, e1, 'ln hlstroke') + line(c, e2, 'ln hlstroke') + dot(c, 3)
  body += text([(c[0] + e1[0]) / 2 + 8, (c[1] + e1[1]) / 2 - 10], Rl, 'dl side')
  body += text([(c[0] + e2[0]) / 2 - 4, (c[1] + e2[1]) / 2 - 12], rl, 'dl side')
  return svg(300, 240, body, 'Ring (annulus)')
}
