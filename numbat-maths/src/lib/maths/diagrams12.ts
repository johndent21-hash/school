// Diagrams for Year 7 Angles (New Century Maths 7 Chapter 2): points, lines, rays and intervals; angles
// named by the letters on their arms; a protractor laid over an angle; two lines cut by a transversal at
// any tilt, with the eight angles marked or lettered; sets of named lines; and a street map.
// Everything is drawn from the question's own numbers, so every angle on the page is its true size.

import { angleMark, arc, arrowOnLine, dot, line, polar, rightMark, svg, text } from './diagrams'

type P = [number, number]
const f = (x: number) => Number(x.toFixed(2))
const rad = (d: number) => (d * Math.PI) / 180
const add = (p: P, q: P): P => [p[0] + q[0], p[1] + q[1]]
const norm = (d: number) => ((d % 360) + 360) % 360
/** screen vector of length len in the maths direction deg (anticlockwise from east) */
const vec = (deg: number, len: number): P => [len * Math.cos(rad(deg)), -len * Math.sin(rad(deg))]

/** An arrowhead whose tip is at `tip`, pointing in the maths direction deg. */
function arrowHead(tip: P, deg: number, size = 9, cls = 'ln'): string {
  const a = add(tip, vec(deg + 155, size))
  const b = add(tip, vec(deg - 155, size))
  return `<path class="${cls}" d="M${f(a[0])},${f(a[1])} L${f(tip[0])},${f(tip[1])} L${f(b[0])},${f(b[1])}"/>`
}

/** Shifts everything so the drawing sits in a box with a margin, and returns the svg at its natural size. */
function framed(body: (shift: P) => string, pts: P[], pad: number, label: string, maxWidth = 340): string {
  const xs = pts.map((p) => p[0])
  const ys = pts.map((p) => p[1])
  const shift: P = [pad - Math.min(...xs), pad - Math.min(...ys)]
  const w = Math.max(...xs) - Math.min(...xs) + 2 * pad
  return svg(w, Math.max(...ys) - Math.min(...ys) + 2 * pad, body(shift), label, Math.min(maxWidth, Math.round(w)))
}

const SYMBOLS = ['•', '×', '○']

/** An arc with a symbol (•, × or ○) inside it, or a size or letter just outside it. */
function mark(c: P, a1: number, a2: number, label: string, r?: number): string {
  const sweep = norm(a2 - a1)
  if (SYMBOLS.includes(label)) {
    const rr = r ?? (sweep < 40 ? 44 : sweep < 70 ? 34 : 28)
    const lr = sweep < 40 ? rr - 13 : sweep < 70 ? rr - 13 : rr - 12
    return arc(c, rr, a1, a2) + text(polar(c, lr, a1 + sweep / 2), label, 'dl ang sym')
  }
  return angleMark(c, a1, a2, label, r ?? (sweep > 90 ? 20 : 26), sweep > 90 ? 15 : 17)
}

// ---------------------------------------------------------------- points, lines, rays, intervals

/** The line AB (arrows at both ends), the ray AB (starts at A, arrow past B) or the interval AB (ends at A and B). */
export function lineKind(kind: 'line' | 'ray' | 'interval', a: string, b: string, tilt = 18): string {
  const A: P = [0, 0]
  const B = add(A, vec(tilt, 120))
  const before = add(A, vec(tilt + 180, 55))
  const after = add(B, vec(tilt, 55))
  const la = add(A, vec(tilt + 90, 17))
  const lb = add(B, vec(tilt + 90, 17))
  return framed(
    (s) => {
      const at = (p: P) => add(p, s)
      let body = ''
      if (kind === 'line') body += line(at(before), at(after)) + arrowHead(at(before), tilt + 180) + arrowHead(at(after), tilt)
      else if (kind === 'ray') body += line(at(A), at(after)) + arrowHead(at(after), tilt)
      else body += line(at(A), at(B))
      body += dot(at(A), 3.5) + dot(at(B), 3.5)
      return body + text(at(la), a, 'dl vx') + text(at(lb), b, 'dl vx')
    },
    [before, after, la, lb],
    18,
    kind === 'line' ? 'A line through two points' : kind === 'ray' ? 'A ray from one point through another' : 'An interval between two points',
  )
}

// ---------------------------------------------------------------- angles named by letters

export interface RaysOpts {
  /** the letter at the vertex */
  vertex: string
  /** each arm: the letter at its end and its direction in degrees (anticlockwise from east) */
  arms: { name: string; dir: number; len?: number }[]
  /** arcs between two arms (by their position in `arms`), drawn anticlockwise from `from` to `to`; label e.g. "•", "×", "47°" */
  marks?: { from: number; to: number; label?: string; r?: number }[]
  /** arrowheads on the arms, as for rays (default: none) */
  arrows?: boolean
  /** a right-angle box, drawn anticlockwise from this arm */
  rightAt?: number
  /** length of the arms that do not give their own (default 112) */
  len?: number
}

/** Arms from one point, with letters on the vertex and the arms, and any angles marked. */
export function rays(o: RaysOpts): string {
  const V: P = [0, 0]
  const armLen = (a: { len?: number }) => a.len ?? o.len ?? 112
  const ends = o.arms.map((a) => add(V, vec(a.dir, armLen(a))))
  // a word (rather than a single letter) at the end of an arm is pushed out by half its width, so it clears the line
  const labelPts = o.arms.map((a) => add(V, vec(a.dir, armLen(a) + (a.name ? 15 : 0) + (a.name.length > 1 ? Math.abs(Math.cos(rad(a.dir))) * 4.3 * a.name.length : 0))))
  // the vertex letter goes in the widest gap between arms that has no mark in it
  const order = o.arms.map((a, i) => ({ i, d: norm(a.dir) })).sort((x, y) => x.d - y.d)
  let best = { size: -1, mid: 0 }
  order.forEach((cur, k) => {
    const next = order[(k + 1) % order.length]
    const size = order.length === 1 ? 360 : norm(next.d - cur.d) || 360
    const marked = (o.marks ?? []).some((m) => {
      const a1 = norm(o.arms[m.from].dir)
      const sweep = norm(o.arms[m.to].dir - o.arms[m.from].dir)
      return norm(cur.d + size / 2 - a1) < sweep
    })
    const score = marked ? size / 100 : size
    if (score > best.size) best = { size: score, mid: cur.d + size / 2 }
  })
  const vName = add(V, vec(best.mid, 16))
  // room for the words beside each arc, which can sit outside the arms (beside a reflex angle, say)
  const markPts = (o.marks ?? []).map((m) => {
    const a1 = o.arms[m.from].dir
    const sweep = norm(o.arms[m.to].dir - a1)
    const label = (m.label ?? '').replace(/<[^>]*>/g, '')
    const reach = SYMBOLS.includes(label) || !label ? (m.r ?? 44) : (m.r ?? 26) + 30 + label.length * 4.2
    return add(V, vec(a1 + sweep / 2, reach))
  })
  return framed(
    (s) => {
      const at = (p: P) => add(p, s)
      let body = ''
      o.arms.forEach((a, i) => {
        body += line(at(V), at(ends[i]))
        if (o.arrows) body += arrowHead(at(ends[i]), a.dir)
      })
      if (o.rightAt !== undefined) body += rightMark(at(V), o.arms[o.rightAt].dir, 12)
      for (const m of o.marks ?? []) body += mark(at(V), o.arms[m.from].dir, o.arms[m.to].dir, m.label ?? '', m.r)
      body += dot(at(V), 3)
      o.arms.forEach((a, i) => (body += a.name ? text(at(labelPts[i]), a.name, 'dl vx') : ''))
      return body + (o.vertex ? text(at(vName), o.vertex, 'dl vx') : '')
    },
    [V, ...labelPts, ...(o.vertex ? [vName] : []), ...markPts],
    20,
    'Angle with letters on its vertex and arms',
  )
}

/** An angle drawn to its true size, for naming its type. A revolution is a full turn back to the same arm. */
export function turn(size: number, start = 0): string {
  const c: P = [150, 115]
  const r = 92
  let body = line(c, polar(c, r, start))
  if (size >= 360) {
    // one arm, with an arc that goes all the way round and an arrowhead where it arrives
    const ar = 30
    const p1 = polar(c, ar, start + 8)
    const p2 = polar(c, ar, start + 188)
    const p3 = polar(c, ar, start + 350)
    body += `<path class="arc" d="M${f(p1[0])},${f(p1[1])} A${ar},${ar} 0 0 0 ${f(p2[0])},${f(p2[1])} A${ar},${ar} 0 0 0 ${f(p3[0])},${f(p3[1])}"/>`
    body += arrowHead(p3, start + 350 + 90, 7, 'arc')
  } else {
    body += line(c, polar(c, r, start + size))
    body += angleMark(c, start, start + size, '', size > 180 ? 24 : 30, 16)
  }
  return svg(300, 230, body + dot(c, 3), size >= 360 ? 'A full turn' : 'An angle', 300)
}

/** Several angles side by side, each its true size but turned a different way and with arms of different lengths. */
export function angleRow(items: { size: number; label: string; start: number; arm: number }[]): string {
  const cell = 132
  const H = 170
  let body = ''
  items.forEach((it, k) => {
    const mid: P = [cell * k + cell / 2, 72]
    const bis = it.start + it.size / 2
    // shift the vertex back along the bisector so the whole angle sits in the middle of its cell
    const v = add(mid, vec(bis + 180, it.arm * 0.45 * Math.cos(rad(it.size / 2))))
    body += line(v, add(v, vec(it.start, it.arm))) + line(v, add(v, vec(it.start + it.size, it.arm)))
    body += angleMark(v, it.start, it.start + it.size, '', 17, 10) + dot(v, 2.5)
    body += text([mid[0], H - 16], it.label, 'dl vx')
  })
  return svg(cell * items.length, H, body, 'Angles to compare', Math.min(420, cell * items.length))
}

// ---------------------------------------------------------------- protractor

/**
 * A protractor laid over an angle whose vertex is at the centre mark and whose first arm lies along the base line.
 * The inside scale counts anticlockwise from 0° on the right; the outside scale counts clockwise from 0° on the left.
 * base 'right': the first arm points right, so the angle is read on the inside scale.
 * base 'left': the first arm points left, so the angle is read on the outside scale.
 * names: the letters at the end of the first arm, at the vertex and at the end of the second arm.
 */
export function protractor(o: { angle: number; base: 'right' | 'left'; names?: [string, string, string] }): string {
  const W = 432
  const H = 250
  const c: P = [216, 206]
  const R = 168
  let body = ''
  // body of the protractor
  body += `<path class="grid" d="M${c[0] - R},${c[1]} A${R},${R} 0 0 1 ${c[0] + R},${c[1]}" fill="none"/>`
  body += `<path class="grid" d="M${c[0] - R},${c[1]} L${c[0] - R},${c[1] + 12} L${c[0] + R},${c[1] + 12} L${c[0] + R},${c[1]}" fill="none"/>`
  for (let d = 0; d <= 180; d++) {
    const len = d % 10 === 0 ? 13 : d % 5 === 0 ? 9 : 5
    body += line(polar(c, R, d), polar(c, R - len, d), d % 5 === 0 ? 'tk thin' : 'grid')
    if (d % 10 === 0 && d > 0 && d < 180) body += line(polar(c, R - 56, d), polar(c, 34, d), 'grid')
  }
  body += `<path class="grid" d="M${c[0] - 34},${c[1]} A34,34 0 0 1 ${c[0] + 34},${c[1]}" fill="none"/>`
  body += line([c[0] - R, c[1]], [c[0] + R, c[1]], 'tk thin')
  body += line([c[0], c[1] - 8], [c[0], c[1] + 8], 'tk thin')
  // the angle: first arm along the base line, second arm at its true size
  const d1 = o.base === 'right' ? 0 : 180
  const d2 = o.base === 'right' ? o.angle : 180 - o.angle
  body += line(c, polar(c, R + 20, d1), 'ln hlstroke') + line(c, polar(c, R + 18, d2), 'ln hlstroke') + dot(c, 3)
  // both scales, written over the arms so the numbers can always be read
  for (let d = 0; d <= 180; d += 10) {
    // the numbers at the two ends sit just above the base line
    const up = d === 0 || d === 180 ? -9 : 0
    const outer = polar(c, R - 25, d)
    const inner = polar(c, R - 45, d)
    body += text([outer[0], outer[1] + up], String(180 - d), 'dl pout')
    body += text([inner[0], inner[1] + up], String(d), 'dl pin')
  }
  if (o.names) {
    body += text(polar(c, R + 31, d1), o.names[0], 'dl vx')
    body += text([c[0], c[1] + 25], o.names[1], 'dl vx')
    body += text(polar(c, R + 30, d2), o.names[2], 'dl vx')
  }
  // dg-wide: on a phone it may use the full width of the card, so the scale numbers stay readable
  return svg(W, H, body, 'A protractor measuring an angle', 460).replace('class="dg"', 'class="dg dg-wide"')
}

// ---------------------------------------------------------------- two lines and a transversal

export type Pos = 0 | 1 | 2 | 3

export interface TransversalOpts {
  /** direction of the first line, in degrees */
  rot: number
  /** the angle from the first line's direction round (anticlockwise) to the transversal's direction: 35 to 145 */
  theta: number
  /** the same angle at the second line, when the two lines are NOT parallel (default: theta) */
  theta2?: number
  /**
   * angles to mark. at: 0 is the crossing further along the transversal, 1 the other one.
   * pos counts the four angles at a crossing anticlockwise, starting between the line's direction and the transversal's:
   * 0 and 2 are theta in size, 1 and 3 are 180 − theta. At crossing 0 the angles 2 and 3 lie between the lines;
   * at crossing 1 the angles 0 and 1 do.
   */
  marks: { at: 0 | 1; pos: Pos; label: string }[]
  /** arrowheads that show the two lines are parallel (default: drawn when they are) */
  arrows?: boolean
  /** half the length of each line, in pixels (default 120) */
  len?: number
  /** letters: the two ends of each line (in the line's direction), the two crossing points, and the two ends of the transversal (ahead, behind) */
  names?: { l0?: [string, string]; l1?: [string, string]; x?: [string, string]; t?: [string, string] }
}

/** Two lines crossed by a transversal, drawn at their true angles. */
export function transversal(o: TransversalOpts): string {
  const t2 = o.theta2 ?? o.theta
  const tau = o.rot + o.theta
  const gap = 92
  const s = gap / Math.sin(rad(o.theta)) / 2
  const C: [P, P] = [vec(tau, s), vec(tau, -s)]
  const dirs = [o.rot, o.rot + o.theta - t2]
  const L = o.len ?? 120
  const lineEnds = dirs.map((d, i) => [add(C[i], vec(d, -L)), add(C[i], vec(d, L))] as [P, P])
  const tEnds: [P, P] = [add(C[0], vec(tau, 54)), add(C[1], vec(tau, -54))]
  const nameAt: { p: P; s: string }[] = []
  if (o.names?.l0) nameAt.push({ p: add(lineEnds[0][0], vec(dirs[0], -14)), s: o.names.l0[0] }, { p: add(lineEnds[0][1], vec(dirs[0], 14)), s: o.names.l0[1] })
  if (o.names?.l1) nameAt.push({ p: add(lineEnds[1][0], vec(dirs[1], -14)), s: o.names.l1[0] }, { p: add(lineEnds[1][1], vec(dirs[1], 14)), s: o.names.l1[1] })
  if (o.names?.t) nameAt.push({ p: add(tEnds[0], vec(tau, 14)), s: o.names.t[0] }, { p: add(tEnds[1], vec(tau, -14)), s: o.names.t[1] })
  const region = (i: 0 | 1, pos: Pos): [number, number] => {
    const d = dirs[i]
    return (
      [
        [d, tau],
        [tau, d + 180],
        [d + 180, tau + 180],
        [tau + 180, d + 360],
      ] as [number, number][]
    )[pos]
  }
  if (o.names?.x)
    o.names.x.forEach((nm, k) => {
      const i = k as 0 | 1
      // beside the crossing, in the widest angle that has no mark in it
      const free = ([0, 1, 2, 3] as Pos[]).filter((pos) => !o.marks.some((m) => m.at === i && m.pos === pos))
      const widest = free.sort((p, q) => region(i, q)[1] - region(i, q)[0] - (region(i, p)[1] - region(i, p)[0]))[0] ?? 1
      const [a1, a2] = region(i, widest)
      nameAt.push({ p: add(C[i], vec((a1 + a2) / 2, 18)), s: nm })
    })
  const parallel = Math.abs(t2 - o.theta) < 1e-9
  return framed(
    (sh) => {
      const at = (p: P) => add(p, sh)
      let body = ''
      lineEnds.forEach(([a, b]) => {
        body += line(at(a), at(b))
        if (o.arrows ?? parallel) body += arrowOnLine(at(a), at(b), 1, 0.9)
      })
      body += line(at(tEnds[1]), at(tEnds[0]))
      for (const m of o.marks) {
        const [a1, a2] = region(m.at, m.pos)
        body += mark(at(C[m.at]), a1, a2, m.label)
      }
      body += dot(at(C[0]), 3) + dot(at(C[1]), 3)
      for (const n of nameAt) body += text(at(n.p), n.s, 'dl vx')
      return body
    },
    [...lineEnds.flat(), ...tEnds, ...nameAt.map((n) => n.p)],
    26,
    parallel ? 'Two parallel lines crossed by a transversal' : 'Two lines crossed by a transversal',
  )
}

/** How two marked angles are related (worked out from where they are). */
export function relation(a: { at: 0 | 1; pos: Pos }, b: { at: 0 | 1; pos: Pos }): 'corresponding' | 'alternate' | 'co-interior' | 'vertically opposite' | 'on a line' | 'none' {
  if (a.at === b.at) return a.pos === b.pos ? 'none' : (a.pos + 2) % 4 === b.pos ? 'vertically opposite' : 'on a line'
  const [far, near] = a.at === 0 ? [a, b] : [b, a]
  if (far.pos === near.pos) return 'corresponding'
  const inside = (far.pos === 2 || far.pos === 3) && (near.pos === 0 || near.pos === 1)
  if (!inside) return 'none'
  return (far.pos === 2 && near.pos === 0) || (far.pos === 3 && near.pos === 1) ? 'alternate' : 'co-interior'
}

// ---------------------------------------------------------------- several named lines

export interface LineSetOpts {
  /** each line: the letters at its two ends and where those ends are (maths coordinates, y up); arrows: how many parallel arrowheads */
  lines: { a: string; b: string; p: P; q: P; arrows?: number; arrowAt?: number }[]
  /** right-angle boxes: the corner and the direction (degrees) of the first side of the box */
  rights?: { at: P; dir: number }[]
  /** named points, e.g. where two lines cross */
  points?: { name: string; at: P; dx?: number; dy?: number }[]
  /** turn the whole picture through this many degrees */
  turn?: number
  /** pixels for one unit (default 30) */
  scale?: number
}

/** Several lines named by the letters at their ends: some parallel (arrowheads), some perpendicular (a right-angle box). */
export function lineSet(o: LineSetOpts): string {
  const t = rad(o.turn ?? 0)
  const k = o.scale ?? 30
  const S = (p: P): P => [k * (p[0] * Math.cos(t) - p[1] * Math.sin(t)), -k * (p[0] * Math.sin(t) + p[1] * Math.cos(t))]
  const ext: P[] = []
  const parts: ((sh: P) => string)[] = []
  for (const ln of o.lines) {
    const a = S(ln.p)
    const b = S(ln.q)
    const d = (Math.atan2(-(b[1] - a[1]), b[0] - a[0]) * 180) / Math.PI
    const la = add(a, vec(d + 180, 14))
    const lb = add(b, vec(d, 14))
    ext.push(a, b, la, lb)
    parts.push(
      (sh) =>
        line(add(a, sh), add(b, sh)) +
        (ln.arrows ? arrowOnLine(add(a, sh), add(b, sh), ln.arrows, ln.arrowAt ?? 0.84) : '') +
        (ln.a ? text(add(la, sh), ln.a, 'dl vx') : '') +
        (ln.b ? text(add(lb, sh), ln.b, 'dl vx') : ''),
    )
  }
  for (const r of o.rights ?? []) parts.push((sh) => rightMark(add(S(r.at), sh), r.dir + (o.turn ?? 0), 10))
  for (const pt of o.points ?? []) {
    const p = S(pt.at)
    const lp: P = [p[0] + (pt.dx ?? 12), p[1] + (pt.dy ?? -12)]
    ext.push(lp)
    parts.push((sh) => dot(add(p, sh), 3) + text(add(lp, sh), pt.name, 'dl vx'))
  }
  return framed((sh) => parts.map((fn) => fn(sh)).join(''), ext, 20, 'Lines named by the letters at their ends')
}

// ---------------------------------------------------------------- street map

/**
 * A simple street map: three streets running across, two running up and down (at right angles to them),
 * and one road that cuts across at a slant.
 */
export function streetMap(o: { across: [string, string, string]; up: [string, string]; slant: string }): string {
  const W = 360
  const H = 280
  const ys = [48, 140, 232]
  const xs = [95, 250]
  const road = (a: P, b: P) => `<line class="road" x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}"/>`
  const rot = (p: P, s: string, deg: number) => `<text class="dl small" x="${f(p[0])}" y="${f(p[1])}" text-anchor="middle" dominant-baseline="central" transform="rotate(${f(-deg)} ${f(p[0])} ${f(p[1])})">${s}</text>`
  let body = `<rect class="frame" x="6" y="6" width="${W - 12}" height="${H - 12}" rx="8"/>`
  // the slanting road stays between the lower two streets, so it only crosses the two up-and-down streets
  const s1: P = [30, 222]
  const s2: P = [344, 148]
  body += road(s1, s2)
  ys.forEach((y) => (body += road([8, y], [W - 8, y])))
  xs.forEach((x) => (body += road([x, 8], [x, H - 8])))
  ys.forEach((y, k) => (body += text([172, y], o.across[k], 'dl small')))
  xs.forEach((x, k) => (body += rot([x, 94], o.up[k], 90)))
  const slantDeg = (Math.atan2(s1[1] - s2[1], s2[0] - s1[0]) * 180) / Math.PI
  const at = 0.455
  body += rot([s1[0] + (s2[0] - s1[0]) * at, s1[1] + (s2[1] - s1[1]) * at], o.slant, slantDeg)
  return svg(W, H, body, 'A street map', 380)
}
