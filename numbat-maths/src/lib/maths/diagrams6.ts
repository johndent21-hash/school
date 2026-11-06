// Diagrams for Year 9 Pythagoras' theorem (New Century Maths 9 Chapter 2). Every figure is built from real
// coordinates worked out from the question's own numbers, so triangles, rectangles, trapeziums and the rest are
// drawn to scale. When a shape is too thin to read and has to be squashed, the content file says so on the page
// ("Diagram not drawn to scale."). Same CSS classes as the other diagrams, so they follow the light and dark themes.

import { angleMark, arrowOnLine, dot, line, poly, rightMark, sideLabel, svg, text, tick } from './diagrams'

export type P = [number, number]
const f = (x: number) => Number(x.toFixed(2))
const rad = (d: number) => (d * Math.PI) / 180
/** direction from a to b in screen coordinates, as a maths angle (anticlockwise from east) */
const dir = (a: P, b: P) => (Math.atan2(-(b[1] - a[1]), b[0] - a[0]) * 180) / Math.PI
const len = (a: P, b: P) => Math.hypot(b[0] - a[0], b[1] - a[1])
const centroid = (ps: P[]): P => [ps.reduce((s, p) => s + p[0], 0) / ps.length, ps.reduce((s, p) => s + p[1], 0) / ps.length]

export interface Fig {
  /** named points in maths coordinates (y up) */
  pts: Record<string, P>
  /** filled outlines, vertices in order */
  polys?: { v: string[]; cls?: string }[]
  /** single lines; dash for construction lines and hidden edges */
  segs?: { a: string; b: string; dash?: boolean }[]
  /** right-angle squares: [a, corner, b] */
  rights?: [string, string, string][]
  /** angle marks: an arc at `at` between the lines to a and b (the smaller angle, or the reflex one), labelled on the bisector */
  angles?: { at: string; a: string; b: string; text: string; r?: number; reflex?: boolean }[]
  /** parallel marks: n arrowheads in the middle of the side a–b, pointing from a to b */
  arrows?: { a: string; b: string; n: number }[]
  /** labels beside a side, placed on the far side from `away` (default: the middle of the shape the side belongs to) */
  sides?: { a: string; b: string; text: string; away?: string; gap?: number; on?: boolean }[]
  /** points whose names are written beside them */
  names?: string[]
  /** equal-length marks */
  ticks?: { a: string; b: string; n: number }[]
  /** circles: centre point and radius (maths units) */
  circles?: { c: string; r: number }[]
  dots?: string[]
  /** any other words, written at a point plus an offset in pixels */
  notes?: { at: string; text: string; dx?: number; dy?: number; anchor?: 'start' | 'middle' | 'end' }[]
  W?: number
  maxH?: number
  pad?: number
  label?: string
}

/** A figure drawn to scale from its points. */
export function fig(o: Fig): string {
  const W = o.W ?? 320
  const pad = o.pad ?? 40
  const maxH = o.maxH ?? 250
  const keys = Object.keys(o.pts)
  const ext: P[] = keys.map((k) => o.pts[k])
  for (const c of o.circles ?? []) {
    const p = o.pts[c.c]
    ext.push([p[0] - c.r, p[1] - c.r], [p[0] + c.r, p[1] + c.r])
  }
  const xs = ext.map((p) => p[0])
  const ys = ext.map((p) => p[1])
  const minX = Math.min(...xs)
  const maxY = Math.max(...ys)
  const dx = Math.max(...xs) - minX || 1
  const dy = maxY - Math.min(...ys) || 1
  let s = (W - 2 * pad) / dx
  let H = dy * s + 2 * pad
  if (H > maxH) {
    s = (maxH - 2 * pad) / dy
    H = maxH
  }
  H = Math.max(H, 120)
  const ox = (W - dx * s) / 2
  const oy = (H - dy * s) / 2
  const S: Record<string, P> = {}
  for (const k of keys) S[k] = [ox + (o.pts[k][0] - minX) * s, oy + (maxY - o.pts[k][1]) * s]
  const all = centroid(keys.map((k) => S[k]))
  const polys = o.polys ?? []
  /** the middle of a shape with a and b next to each other */
  const shapeCentre = (a: string, b: string): P | null => {
    for (const pg of polys) {
      const i = pg.v.indexOf(a)
      const j = pg.v.indexOf(b)
      if (i < 0 || j < 0) continue
      const n = pg.v.length
      if ((i + 1) % n === j || (j + 1) % n === i) return centroid(pg.v.map((k) => S[k]))
    }
    return null
  }
  let body = ''
  for (const c of o.circles ?? []) body += `<circle class="ln" cx="${f(S[c.c][0])}" cy="${f(S[c.c][1])}" r="${f(c.r * s)}"/>`
  for (const pg of polys) body += poly(pg.v.map((k) => S[k]), pg.cls ?? 'sh')
  for (const sg of o.segs ?? []) body += line(S[sg.a], S[sg.b], sg.dash ? 'ln dash' : 'ln')
  for (const [a, b, c] of o.rights ?? []) {
    const B = S[b]
    const a1 = dir(B, S[a])
    const a2 = dir(B, S[c])
    let sweep = a2 - a1
    while (sweep < 0) sweep += 360
    const size = Math.max(6, Math.min(12, 0.3 * Math.min(len(B, S[a]), len(B, S[c]))))
    body += rightMark(B, Math.abs(sweep - 90) < 2 ? a1 : a2, size)
  }
  for (const an of o.angles ?? []) {
    let a1 = dir(S[an.at], S[an.a])
    let a2 = dir(S[an.at], S[an.b])
    let sweep = a2 - a1
    while (sweep < 0) sweep += 360
    if (sweep > 180 !== !!an.reflex) [a1, a2] = [a2, a1]
    body += angleMark(S[an.at], a1, a2, an.text, an.r ?? 22)
  }
  for (const ar of o.arrows ?? []) body += arrowOnLine(S[ar.a], S[ar.b], ar.n)
  for (const t of o.ticks ?? []) body += tick(S[t.a], S[t.b], t.n)
  for (const d of o.dots ?? []) body += dot(S[d], 3)
  for (const sd of o.sides ?? []) {
    if (sd.on) {
      // written on the line itself (its halo hides the line under it): used for diagonals
      body += text([(S[sd.a][0] + S[sd.b][0]) / 2, (S[sd.a][1] + S[sd.b][1]) / 2], sd.text, 'dl side')
      continue
    }
    const ref = sd.away ? S[sd.away] : (shapeCentre(sd.a, sd.b) ?? all)
    body += sideLabel(S[sd.a], S[sd.b], ref, sd.text, sd.gap ?? 14)
  }
  for (const n of o.names ?? []) {
    const p = S[n]
    // put the name outside the corner: away from the lines that meet there
    const nbrs = new Set<string>()
    for (const pg of polys) {
      const i = pg.v.indexOf(n)
      if (i < 0) continue
      nbrs.add(pg.v[(i + 1) % pg.v.length])
      nbrs.add(pg.v[(i + pg.v.length - 1) % pg.v.length])
    }
    for (const sg of o.segs ?? []) {
      if (sg.a === n) nbrs.add(sg.b)
      if (sg.b === n) nbrs.add(sg.a)
    }
    let ux = 0
    let uy = 0
    for (const k of nbrs) {
      const d = len(p, S[k]) || 1
      ux -= (S[k][0] - p[0]) / d
      uy -= (S[k][1] - p[1]) / d
    }
    if (Math.hypot(ux, uy) < 0.3) {
      const owners = polys.filter((pg) => pg.v.includes(n)).map((pg) => centroid(pg.v.map((k) => S[k])))
      const from = owners.length ? centroid(owners) : all
      ux = p[0] - from[0]
      uy = p[1] - from[1]
    }
    const L = Math.hypot(ux, uy) || 1
    body += text([p[0] + (ux / L) * 15, p[1] + (uy / L) * 15], n, 'dl vx')
  }
  for (const nt of o.notes ?? []) body += text([S[nt.at][0] + (nt.dx ?? 0), S[nt.at][1] + (nt.dy ?? 0)], nt.text, 'dl small', nt.anchor ?? 'middle')
  return svg(W, H, body, o.label ?? 'Diagram')
}

/** Corners of a right-angled triangle: the right angle at the origin, leg p along angle rot and leg q
 *  at right angles to it (anticlockwise, or clockwise when mirrored). Returns [right-angle corner, end of p, end of q]. */
export function rtPts(p: number, q: number, rot: number, mirror = false): [P, P, P] {
  const r = rad(rot)
  const r2 = rad(rot + (mirror ? -90 : 90))
  return [
    [0, 0],
    [p * Math.cos(r), p * Math.sin(r)],
    [q * Math.cos(r2), q * Math.sin(r2)],
  ]
}

/** Corners of a triangle with sides a = BC, b = CA, c = AB, turned through rot degrees: [A, B, C]. */
export function sssPts(a: number, b: number, c: number, rot = 0): [P, P, P] {
  const cosA = (b * b + c * c - a * a) / (2 * b * c)
  const A = Math.acos(Math.max(-1, Math.min(1, cosA)))
  const turn = (p: P): P => [p[0] * Math.cos(rad(rot)) - p[1] * Math.sin(rad(rot)), p[0] * Math.sin(rad(rot)) + p[1] * Math.cos(rad(rot))]
  return [turn([0, 0]), turn([c, 0]), turn([b * Math.cos(A), b * Math.sin(A)])]
}

// ---------------------------------------------------------------- solids (Power plus)

/** A cone with its vertical height (dashed), base radius and slant height. */
export function cone(r: number, h: number, labels: { r?: string; h?: string; s?: string }): string {
  const W = 300
  const H = 250
  const sc = Math.min(160 / h, 110 / r)
  const cx = W / 2
  const base = 40 + h * sc
  const top: P = [cx, 40]
  const R = r * sc
  const ry = Math.max(10, R * 0.28)
  const right: P = [cx + R, base]
  let body = `<path class="sh" d="M${f(cx - R)},${f(base)} L${f(top[0])},${f(top[1])} L${f(cx + R)},${f(base)} A${f(R)},${f(ry)} 0 0 1 ${f(cx - R)},${f(base)} Z"/>`
  // the back of the base circle is hidden, so dashed (drawn over the fill)
  body += `<path class="ln dash" d="M${f(cx - R)},${f(base)} A${f(R)},${f(ry)} 0 0 1 ${f(cx + R)},${f(base)}"/>`
  body += line(top, [cx, base], 'ln dash') + line([cx, base], right, 'ln dash') + rightMark([cx, base], 0, 9)
  if (labels.h) body += text([cx + 7, 40 + (base - 40) * 0.62], labels.h, 'dl side', 'start')
  if (labels.r) body += text([cx + R / 2, base + 14], labels.r, 'dl side')
  if (labels.s) body += text([(top[0] + right[0]) / 2 + 14, (top[1] + right[1]) / 2], labels.s, 'dl side', 'start')
  return svg(W, Math.max(H, base + 40), body, 'Cone')
}

/** A rectangular prism (oblique view) with lettered corners and chosen diagonals.
 *  Corners: A B C D around the front face (A bottom left, B bottom right, C top right, D top left),
 *  E F G H the same corners at the back. */
export function box(l: number, w: number, h: number, o: { diagonals?: [string, string][]; labels?: { l?: string; w?: string; h?: string }; names?: string[] }): string {
  const k = 0.5
  const d: P = [k * w * Math.cos(rad(35)), k * w * Math.sin(rad(35))]
  const pts: Record<string, P> = {
    A: [0, 0],
    B: [l, 0],
    C: [l, h],
    D: [0, h],
    E: [d[0], d[1]],
    F: [l + d[0], d[1]],
    G: [l + d[0], h + d[1]],
    H: [d[0], h + d[1]],
  }
  const segs: { a: string; b: string; dash?: boolean }[] = [
    { a: 'A', b: 'B' },
    { a: 'B', b: 'C' },
    { a: 'C', b: 'D' },
    { a: 'D', b: 'A' },
    { a: 'B', b: 'F' },
    { a: 'C', b: 'G' },
    { a: 'D', b: 'H' },
    { a: 'F', b: 'G' },
    { a: 'G', b: 'H' },
    { a: 'E', b: 'A', dash: true },
    { a: 'E', b: 'F', dash: true },
    { a: 'E', b: 'H', dash: true },
  ]
  for (const [a, b] of o.diagonals ?? []) segs.push({ a, b, dash: true })
  const sides: Fig['sides'] = []
  if (o.labels?.l) sides.push({ a: 'A', b: 'B', text: o.labels.l, away: 'G' })
  if (o.labels?.h) sides.push({ a: 'B', b: 'C', text: o.labels.h, away: 'A' })
  if (o.labels?.w) sides.push({ a: 'B', b: 'F', text: o.labels.w, away: 'A' })
  return fig({ pts, segs, sides, names: o.names ?? ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], polys: [{ v: ['A', 'B', 'C', 'D'], cls: 'sh' }], label: 'Rectangular prism' })
}

/** A square pyramid ABCD (oblique view) with apex E above the centre O, F the middle of BC. */
export function pyramid(base: number, h: number, o: { labels?: { base?: string; h?: string }; slant?: boolean }): string {
  const k = 0.55
  const d: P = [k * base * Math.cos(rad(30)), k * base * Math.sin(rad(30))]
  const A: P = [0, 0]
  const B: P = [base, 0]
  const C: P = [base + d[0], d[1]]
  const D: P = [d[0], d[1]]
  const O: P = [(base + d[0]) / 2, d[1] / 2]
  const F: P = [(B[0] + C[0]) / 2, (B[1] + C[1]) / 2]
  const E: P = [O[0], O[1] + h]
  // the height is labelled low down on EO, where there is room between the edges
  const h1: P = [O[0], O[1] + 0.7 * h]
  const segs: { a: string; b: string; dash?: boolean }[] = [
    { a: 'A', b: 'B' },
    { a: 'B', b: 'C' },
    { a: 'E', b: 'A' },
    { a: 'E', b: 'B' },
    { a: 'E', b: 'C' },
    { a: 'C', b: 'D', dash: true },
    { a: 'D', b: 'A', dash: true },
    { a: 'E', b: 'D', dash: true },
    { a: 'E', b: 'O', dash: true },
    { a: 'O', b: 'F', dash: true },
  ]
  if (o.slant) segs.push({ a: 'E', b: 'F' })
  const sides: Fig['sides'] = []
  if (o.labels?.base) sides.push({ a: 'A', b: 'B', text: o.labels.base, away: 'E' })
  if (o.labels?.h) sides.push({ a: 'O', b: 'h1', text: o.labels.h, away: 'B', gap: 12 })
  return fig({ pts: { A, B, C, D, E, F, O, h1 }, segs, sides, rights: [['E', 'O', 'F']], dots: ['O'], names: ['A', 'B', 'C', 'D', 'E', 'F', 'O'], label: 'Square pyramid' })
}
