// Diagrams for the class games on New Century Maths 7 Chapter 8 (perimeter, circles, composite areas, prisms).
// Like the other diagram files, everything is drawn from the question's own numbers with CSS classes, so
// shapes are to scale and follow the light and dark themes.

import { dot, line, polar, poly, rightMark, sideLabel, svg, text, tick } from './diagrams'
import { fig, sssPts, type P } from './diagrams6'

const f = (x: number) => Number(x.toFixed(2))
const rad = (d: number) => (d * Math.PI) / 180
const mid = (a: P, b: P): P => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
const centroid = (ps: P[]): P => [ps.reduce((s, p) => s + p[0], 0) / ps.length, ps.reduce((s, p) => s + p[1], 0) / ps.length]

/** A triangle drawn to scale from its three sides; labels are for the sides a (right), b (left) and c (base). */
export function triSides(a: number, b: number, c: number, labels: [string, string, string], ticks: [number, number, number] = [0, 0, 0]): string {
  const [A, B, C] = sssPts(a, b, c)
  return fig({
    pts: { A, B, C },
    polys: [{ v: ['A', 'B', 'C'] }],
    sides: [
      { a: 'B', b: 'C', text: labels[0] },
      { a: 'C', b: 'A', text: labels[1] },
      { a: 'A', b: 'B', text: labels[2] },
    ].filter((s) => s.text),
    ticks: [
      { a: 'B', b: 'C', n: ticks[0] },
      { a: 'C', b: 'A', n: ticks[1] },
      { a: 'A', b: 'B', n: ticks[2] },
    ].filter((t) => t.n > 0),
    maxH: 230,
    label: 'Triangle with its side lengths',
  })
}

/** A regular polygon: every side has an equal-length mark and the bottom side is labelled. */
export function regularPolygon(n: number, label: string): string {
  // the bottom side is horizontal
  const start = -90 - 180 / n
  const pts: Record<string, P> = {}
  const names = Array.from({ length: n }, (_, i) => 'P' + i)
  names.forEach((k, i) => (pts[k] = [Math.cos(rad(start + (360 * i) / n)), Math.sin(rad(start + (360 * i) / n))]))
  return fig({
    pts,
    polys: [{ v: names }],
    ticks: names.map((k, i) => ({ a: k, b: names[(i + 1) % n], n: 1 })),
    sides: [{ a: 'P0', b: 'P1', text: label }],
    W: 300,
    maxH: 230,
    pad: 38,
    label: 'Regular polygon with one side length',
  })
}

/** A rectangle with all four sides written on it (for perimeter). Opposite sides can be left blank with ''. */
export function rectFour(w: number, h: number, labels: { bottom?: string; right?: string; top?: string; left?: string }): string {
  return fig({
    pts: { A: [0, 0], B: [w, 0], C: [w, h], D: [0, h] },
    polys: [{ v: ['A', 'B', 'C', 'D'] }],
    rights: [['B', 'A', 'D']],
    sides: [
      { a: 'A', b: 'B', text: labels.bottom ?? '' },
      { a: 'B', b: 'C', text: labels.right ?? '' },
      { a: 'C', b: 'D', text: labels.top ?? '' },
      { a: 'D', b: 'A', text: labels.left ?? '' },
    ].filter((s) => s.text),
    maxH: 210,
    label: 'Rectangle with its side lengths',
  })
}

/** A circle with one part picked out in colour: its radius, its diameter or its circumference. */
export function circlePart(part: 'radius' | 'diameter' | 'circumference'): string {
  const c: P = [150, 118]
  const r = 92
  let body = `<circle class="sh" cx="${c[0]}" cy="${c[1]}" r="${r}"/>`
  if (part === 'circumference') body += `<circle class="ln hlstroke" style="stroke-width:5px" cx="${c[0]}" cy="${c[1]}" r="${r}"/>`
  if (part === 'radius') body += line(c, polar(c, r, 28), 'ln hlstroke').replace('/>', ' style="stroke-width:5px"/>')
  if (part === 'diameter') body += line(polar(c, r, 200), polar(c, r, 20), 'ln hlstroke').replace('/>', ' style="stroke-width:5px"/>')
  body += dot(c, 4)
  return svg(300, 236, body, 'Circle with one part coloured', 300)
}

/**
 * A composite shape made of two rectangles side by side (an L-shape), with a dashed line where they join
 * and a label inside each part (e.g. its area).
 */
export function twoRects(w1: number, h1: number, w2: number, h2: number, label1: string, label2: string): string {
  const pts: Record<string, P> = {
    A: [0, 0],
    B: [w1 + w2, 0],
    C: [w1 + w2, h2],
    D: [w1, h2],
    E: [w1, h1],
    F: [0, h1],
    S: [w1, 0],
    M1: [w1 / 2, h1 / 2],
    M2: [w1 + w2 / 2, h2 / 2],
  }
  return fig({
    pts,
    polys: [{ v: ['A', 'B', 'C', 'D', 'E', 'F'] }],
    segs: [{ a: 'S', b: 'D', dash: true }],
    notes: [
      { at: 'M1', text: label1 },
      { at: 'M2', text: label2 },
    ],
    maxH: 220,
    pad: 26,
    label: 'Composite shape made of two rectangles',
  }).replace(/class="dl small"/g, 'class="dl"')
}

/** A rectangle with a triangle on top (a house shape), with a label inside each part. */
export function rectAndTriangle(w: number, h: number, roof: number, labelRect: string, labelTri: string): string {
  const pts: Record<string, P> = {
    A: [0, 0],
    B: [w, 0],
    C: [w, h],
    T: [w / 2, h + roof],
    D: [0, h],
    M1: [w / 2, h / 2],
    M2: [w / 2, h + roof / 3],
  }
  return fig({
    pts,
    polys: [{ v: ['A', 'B', 'C', 'T', 'D'] }],
    segs: [{ a: 'D', b: 'C', dash: true }],
    notes: [
      { at: 'M1', text: labelRect },
      { at: 'M2', text: labelTri },
    ],
    maxH: 230,
    pad: 22,
    label: 'Composite shape made of a rectangle and a triangle',
  }).replace(/class="dl small"/g, 'class="dl"')
}

/** A shaded rectangle with a rectangular hole cut out of it. */
export function rectWithHole(W: number, H: number, w: number, h: number, labelOuter = '', labelHole = ''): string {
  const x0 = (W - w) * 0.55
  const y0 = (H - h) * 0.5
  const pts: Record<string, P> = {
    A: [0, 0],
    B: [W, 0],
    C: [W, H],
    D: [0, H],
    a: [x0, y0],
    b: [x0 + w, y0],
    c: [x0 + w, y0 + h],
    d: [x0, y0 + h],
    M: [x0 + w / 2, y0 + h / 2],
    N: [x0 / 2, H / 2],
  }
  return fig({
    pts,
    polys: [
      { v: ['A', 'B', 'C', 'D'], cls: 'sh areashape' },
      { v: ['a', 'b', 'c', 'd'], cls: 'sh sh-bg' },
    ],
    notes: [
      ...(labelHole ? [{ at: 'M', text: labelHole }] : []),
      ...(labelOuter ? [{ at: 'N', text: labelOuter }] : []),
    ],
    maxH: 210,
    pad: 22,
    label: 'Rectangle with a rectangular hole',
  }).replace(/class="dl small"/g, 'class="dl"')
}

export type CrossSection = 'triangle' | 'right triangle' | 'rectangle' | 'trapezium' | 'L-shape' | 'pentagon' | 'hexagon'

const FRONT: Record<CrossSection, P[]> = {
  // each listed anticlockwise, in maths coordinates (y up)
  triangle: [[0, 0], [5, 0], [2.5, 4]],
  'right triangle': [[0, 0], [5, 0], [0, 4]],
  rectangle: [[0, 0], [5, 0], [5, 3.4], [0, 3.4]],
  trapezium: [[0, 0], [6, 0], [4.4, 3.4], [1.2, 3.4]],
  'L-shape': [[0, 0], [5.5, 0], [5.5, 1.8], [2.4, 1.8], [2.4, 4], [0, 4]],
  pentagon: [[1, 0], [4, 0], [5, 2.4], [2.5, 4.2], [0, 2.4]],
  hexagon: [[1.3, 0], [3.9, 0], [5.2, 2.2], [3.9, 4.4], [1.3, 4.4], [0, 2.2]],
}

/**
 * A prism seen from the front and a little to the right, with its cross-section (the front face) shaded.
 * faceLabel is written on the shaded face (e.g. "A = 12 cm²") and lengthLabel along the prism's length.
 */
export function prism(shape: CrossSection, o: { faceLabel?: string; lengthLabel?: string; depth?: number } = {}): string {
  const front = FRONT[shape]
  const n = front.length
  const depth = o.depth ?? 4.5
  const off: P = [depth * Math.cos(rad(32)) * 0.75, depth * Math.sin(rad(32)) * 0.75]
  const back = front.map((p) => [p[0] + off[0], p[1] + off[1]] as P)
  // fit to the picture
  const W = 320
  const H = 236
  const pad = 30
  const all = [...front, ...back]
  const xs = all.map((p) => p[0])
  const ys = all.map((p) => p[1])
  const minX = Math.min(...xs)
  const maxY = Math.max(...ys)
  const s = Math.min((W - 2 * pad - 30) / (Math.max(...xs) - minX), (H - 2 * pad) / (maxY - Math.min(...ys)))
  const ox = (W - 30 - (Math.max(...xs) - minX) * s) / 2
  const oy = (H - (maxY - Math.min(...ys)) * s) / 2
  const T = (p: P): P => [ox + (p[0] - minX) * s, oy + (maxY - p[1]) * s]
  const F = front.map(T)
  const B = back.map(T)
  // a side face shows when it faces up or to the right (the way the prism runs back)
  const visible = front.map((p, i) => {
    const q = front[(i + 1) % n]
    const nx = q[1] - p[1]
    const ny = -(q[0] - p[0])
    return nx * off[0] + ny * off[1] > 1e-9
  })
  let body = ''
  // hidden edges first
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    if (!visible[i]) body += line(B[i], B[j], 'ln dash')
    if (!visible[i] && !visible[(i + n - 1) % n]) body += line(F[i], B[i], 'ln dash')
  }
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    if (visible[i]) body += poly([F[i], F[j], B[j], B[i]], i % 2 ? 'sh sh3' : 'sh sh2')
  }
  body += poly(F, 'sh areashape')
  if (o.faceLabel) {
    const c = shape === 'L-shape' ? T([1.2, 1.9]) : centroid(F)
    body += text(c, o.faceLabel, 'dl')
  }
  if (o.lengthLabel) {
    // along the lowest edge that runs back on the right-hand side
    let k = 0
    front.forEach((p, i) => {
      if (p[0] - p[1] > front[k][0] - front[k][1]) k = i
    })
    body += sideLabel(F[k], B[k], centroid([...F, ...B]), o.lengthLabel, 14)
  }
  return svg(W, H, body, 'Prism with its cross-section shaded', 320)
}

/** A cube with one edge length written on it. */
export function cube(label: string): string {
  const s = 4
  const off: P = [s * 0.42, s * 0.3]
  const front: P[] = [[0, 0], [s, 0], [s, s], [0, s]]
  const back = front.map((p) => [p[0] + off[0], p[1] + off[1]] as P)
  const W = 280
  const H = 230
  const sc = 150 / (s + off[1])
  const T = (p: P): P => [60 + p[0] * sc, H - 38 - p[1] * sc]
  const F = front.map(T)
  const B = back.map(T)
  let body = line(B[0], B[1], 'ln dash') + line(B[0], B[3], 'ln dash') + line(F[0], B[0], 'ln dash')
  body += poly([F[1], B[1], B[2], F[2]], 'sh sh3') + poly([F[3], F[2], B[2], B[3]], 'sh sh2') + poly(F, 'sh')
  body += tick(F[0], F[1]) + tick(F[1], F[2]) + tick(F[1], B[1])
  body += text([mid(F[0], F[1])[0], F[0][1] + 17], label, 'dl side')
  return svg(W, H, body, 'Cube', 280)
}

/** A right-angled triangle drawn to scale with its two shorter sides labelled (and, if given, its longest side). */
export function rightTri(b: number, h: number, bl: string, hl: string, hypl = ''): string {
  return fig({
    pts: { A: [0, 0], B: [b, 0], C: [0, h] },
    polys: [{ v: ['A', 'B', 'C'] }],
    rights: [['B', 'A', 'C']],
    sides: [
      { a: 'A', b: 'B', text: bl },
      { a: 'C', b: 'A', text: hl },
      ...(hypl ? [{ a: 'B', b: 'C', text: hypl }] : []),
    ],
    maxH: 220,
    label: 'Right-angled triangle',
  })
}

/**
 * A triangle with its base, its perpendicular height (dashed, meeting the base `foot` along from the left)
 * and, if given, its two slanted sides labelled. Drawn to scale, so slanted sides must be the true lengths.
 */
export function triHeight(b: number, h: number, foot: number, labels: { base: string; height: string; left?: string; right?: string }): string {
  return fig({
    pts: { A: [0, 0], B: [b, 0], C: [foot, h], F: [foot, 0] },
    polys: [{ v: ['A', 'B', 'C'] }],
    segs: [{ a: 'C', b: 'F', dash: true }],
    rights: [['B', 'F', 'C']],
    sides: [
      { a: 'A', b: 'B', text: labels.base },
      ...(labels.left ? [{ a: 'C', b: 'A', text: labels.left }] : []),
      ...(labels.right ? [{ a: 'B', b: 'C', text: labels.right }] : []),
    ],
    notes: [{ at: 'F', text: labels.height, dx: foot > b / 2 ? -8 : 8, dy: -(h > 0 ? 1 : 0) * 26, anchor: foot > b / 2 ? 'end' : 'start' }],
    maxH: 226,
    label: 'Triangle with its base and perpendicular height',
  }).replace(/class="dl small"/g, 'class="dl side"')
}

/**
 * A parallelogram with its base, its perpendicular height (dashed) and, if given, its slanted side labelled.
 * off: how far the top is pushed to the right. Drawn to scale, so the slanted side must be the true length.
 */
export function parallelogramBH(b: number, h: number, off: number, labels: { base: string; height: string; slant?: string }): string {
  return fig({
    pts: { A: [0, 0], B: [b, 0], C: [b + off, h], D: [off, h], F: [off, 0] },
    polys: [{ v: ['A', 'B', 'C', 'D'] }],
    segs: [{ a: 'D', b: 'F', dash: true }],
    rights: [['B', 'F', 'D']],
    arrows: [
      { a: 'A', b: 'B', n: 1 },
      { a: 'D', b: 'C', n: 1 },
    ],
    sides: [{ a: 'A', b: 'B', text: labels.base }, ...(labels.slant ? [{ a: 'B', b: 'C', text: labels.slant }] : [])],
    notes: [{ at: 'F', text: labels.height, dx: 8, dy: -26, anchor: 'start' }],
    maxH: 220,
    label: 'Parallelogram with its base and perpendicular height',
  }).replace(/class="dl small"/g, 'class="dl side"')
}

/**
 * A composite shape made of two rectangles standing side by side on the same line, with every length
 * needed for its area written on it: widths under each part, heights at the left and right.
 * Any label can be left out with ''.
 */
export function twoRectsDims(w1: number, h1: number, w2: number, h2: number, labels: { w1: string; h1: string; w2: string; h2: string; top?: string }): string {
  const pts: Record<string, P> = { A: [0, 0], S: [w1, 0], B: [w1 + w2, 0], C: [w1 + w2, h2], D: [w1, h2], E: [w1, h1], F: [0, h1] }
  return fig({
    pts,
    polys: [{ v: ['A', 'B', 'C', 'D', 'E', 'F'] }],
    segs: [{ a: 'S', b: 'D', dash: true }],
    sides: [
      { a: 'A', b: 'S', text: labels.w1, away: 'F' },
      { a: 'S', b: 'B', text: labels.w2, away: 'C' },
      { a: 'F', b: 'A', text: labels.h1, away: 'S' },
      { a: 'B', b: 'C', text: labels.h2, away: 'S' },
      ...(labels.top ? [{ a: 'E', b: 'F', text: labels.top, away: 'A' }] : []),
    ].filter((x) => x.text),
    maxH: 226,
    pad: 44,
    label: 'Composite shape made of two rectangles, with its side lengths',
  })
}

/**
 * A solid built from cubes, drawn on an isometric grid. heights[row][col] is the number of cubes stacked
 * on each square of the floor plan; row 0 is at the back, the last row at the front. No cubes are hidden
 * when every row is at least as tall as the row in front of it and each row's stacks get no taller to the right.
 */
export function cubeSolid(heights: number[][], showFront = true): string {
  const rows = heights.length
  const cols = Math.max(...heights.map((r) => r.length))
  const c30 = Math.cos(rad(30))
  const s30 = Math.sin(rad(30))
  // x runs to the right along the front, z runs back, y is up
  const P3 = (x: number, y: number, z: number): P => [(x + z) * c30, (z - x) * s30 + y]
  const cells: { x: number; z: number; y: number }[] = []
  for (let r = 0; r < rows; r++) for (let c = 0; c < (heights[r]?.length ?? 0); c++) for (let y = 0; y < (heights[r][c] ?? 0); y++) cells.push({ x: c, z: rows - 1 - r, y })
  const has = (x: number, y: number, z: number) => cells.some((k) => k.x === x && k.y === y && k.z === z)
  const ext: P[] = []
  for (const k of cells) for (const dx of [0, 1]) for (const dy of [0, 1]) for (const dz of [0, 1]) ext.push(P3(k.x + dx, k.y + dy, k.z + dz))
  const W = 320
  const H = 240
  const pad = 26
  const xs = ext.map((p) => p[0])
  const ys = ext.map((p) => p[1])
  const minX = Math.min(...xs)
  const maxY = Math.max(...ys)
  const sc = Math.min((W - 2 * pad) / (Math.max(...xs) - minX), (H - 2 * pad - (showFront ? 18 : 0)) / (maxY - Math.min(...ys)))
  const ox = (W - (Math.max(...xs) - minX) * sc) / 2
  const oy = (H - (showFront ? 18 : 0) - (maxY - Math.min(...ys)) * sc) / 2
  const T = (p: P): P => [ox + (p[0] - minX) * sc, oy + (maxY - p[1]) * sc]
  const quad = (pts: P[], cls: string) => `<path class="${cls}" d="M${pts.map(T).map((p) => `${f(p[0])},${f(p[1])}`).join(' L')} Z"/>`
  // paint from the back to the front, bottom to top, so nearer cubes cover the ones behind
  const order = cells.slice().sort((a, b2) => b2.z - a.z || a.x - b2.x || a.y - b2.y)
  let body = ''
  for (const k of order) {
    const { x, y, z } = k
    // the three faces that can be seen: top, front (facing the viewer's left) and right side
    if (!has(x, y + 1, z)) body += quad([P3(x, y + 1, z), P3(x + 1, y + 1, z), P3(x + 1, y + 1, z + 1), P3(x, y + 1, z + 1)], 'cube cube-top')
    if (!has(x, y, z - 1)) body += quad([P3(x, y, z), P3(x + 1, y, z), P3(x + 1, y + 1, z), P3(x, y + 1, z)], 'cube cube-l')
    if (!has(x + 1, y, z)) body += quad([P3(x + 1, y, z), P3(x + 1, y, z + 1), P3(x + 1, y + 1, z + 1), P3(x + 1, y + 1, z)], 'cube cube-r')
  }
  if (showFront) {
    // the word "front" with an arrow pointing at the middle of the front of the solid
    const a = T(P3(cols / 2, 0, 0))
    const from: P = [a[0] - 30, Math.min(H - 20, a[1] + 30)]
    const to: P = [a[0] - 7, a[1] + 7]
    body += line(from, to, 'ln thin') + `<path class="pt" d="M${f(to[0] + 3)},${f(to[1] - 3)} L${f(to[0] - 7)},${f(to[1] + 1)} L${f(to[0] - 1)},${f(to[1] + 7)} Z"/>`
    body += text([from[0] - 4, from[1] + 9], 'front', 'dl small')
  }
  return svg(W, H, body, 'Solid made of cubes', 320)
}

/** A rectangle cut in half by a diagonal, with one half shaded. */
export function halfRectangle(w: number, h: number, wl: string, hl: string): string {
  const pts: Record<string, P> = { A: [0, 0], B: [w, 0], C: [w, h], D: [0, h] }
  const body = fig({
    pts,
    polys: [
      { v: ['A', 'B', 'C', 'D'], cls: 'sh sh-bg' },
      { v: ['A', 'B', 'D'], cls: 'sh areashape' },
    ],
    rights: [['B', 'A', 'D']],
    sides: [
      { a: 'A', b: 'B', text: wl, away: 'C' },
      { a: 'B', b: 'C', text: hl, away: 'A' },
    ],
    maxH: 210,
    label: 'Rectangle cut in half along a diagonal',
  })
  return body
}

export { rightMark }
