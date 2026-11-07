// Diagrams for Year 9 Surface area and volume (New Century Maths 9 Chapter 10): a measuring scale, sectors drawn at
// their true angle, a rectangle with a quadrant on one end, and trapezoidal, triangular (tent) and half-cylinder
// prisms. Plane shapes are drawn to scale from the question's own numbers; solids use the same oblique view as the
// other prism drawings (the front face to scale, the depth drawn at 30° and shortened). Same CSS classes as the
// other diagrams, so they follow the light and dark themes.
import { angleMark, dot, line, polar, rightMark, sideLabel, svg, text } from './diagrams'

type P = [number, number]
const f = (x: number) => Number(x.toFixed(2))
const rad = (d: number) => (d * Math.PI) / 180

/** Maths points (y up) scaled into a W × H box with padding, keeping their shape. Returns the mapping too. */
function fitPts(pts: P[], W: number, H: number, pad: number): { map: (p: P) => P; s: number } {
  const xs = pts.map((p) => p[0])
  const ys = pts.map((p) => p[1])
  const minX = Math.min(...xs)
  const maxY = Math.max(...ys)
  const dx = Math.max(...xs) - minX || 1
  const dy = maxY - Math.min(...ys) || 1
  const s = Math.min((W - 2 * pad) / dx, (H - 2 * pad) / dy)
  const ox = (W - dx * s) / 2
  const oy = (H - dy * s) / 2
  return { map: (p: P) => [ox + (p[0] - minX) * s, oy + (maxY - p[1]) * s], s }
}

/**
 * A straight measuring scale from `from` to `to`: a mark every `minor` units, a longer numbered mark every
 * `labelEvery` marks (and a middle-length mark halfway between numbers when that falls on a mark).
 */
export function scaleBar(from: number, to: number, minor: number, labelEvery: number, unit: string): string {
  const W = 360
  const left = 26
  // room after the last number for the unit (up to "km/h")
  const right = W - 64
  const n = Math.round((to - from) / minor)
  const X = (i: number) => left + (i / n) * (right - left)
  const y = 30
  let body = `<rect class="sh rulerbody" x="${left - 12}" y="${y - 8}" width="${f(W - left + 6)}" height="58" rx="4"/>`
  for (let i = 0; i <= n; i++) {
    const major = i % labelEvery === 0
    const mid = !major && labelEvery % 2 === 0 && i % (labelEvery / 2) === 0
    body += line([X(i), y], [X(i), y + (major ? 18 : mid ? 12 : 7)], major ? 'tk scaletick' : 'tk thin scaletick')
    if (major) body += text([X(i), y + 32], fmtNum(from + i * minor), 'dl small scalenum')
  }
  body += text([W - 8, y + 32], unit, 'dl small', 'end')
  return svg(W, 84, body, 'Measuring scale', 420)
}
const fmtNum = (x: number) => {
  const v = Number(x.toPrecision(12))
  return v < 0 ? '−' + String(-v) : String(v)
}

/**
 * A sector of `deg` degrees (90 = quadrant, 180 = semicircle), drawn at its true angle and symmetrical about the
 * vertical. The radius (or, for a semicircle, the diameter) is labelled; other angles are marked and labelled.
 */
export function sector(deg: number, label: string, o: { diameter?: boolean } = {}): string {
  const a0 = deg === 180 ? 0 : 90 - deg / 2
  const a1 = a0 + deg
  const raw: P[] = [
    [0, 0],
    [Math.cos(rad(a0)), Math.sin(rad(a0))],
    [Math.cos(rad(a1)), Math.sin(rad(a1))],
  ]
  for (let k = -4; k <= 8; k++) if (k * 90 > a0 && k * 90 < a1) raw.push([Math.cos(rad(k * 90)), Math.sin(rad(k * 90))])
  const { map, s } = fitPts(raw, 300, 230, 38)
  const C = map([0, 0])
  const P1 = map(raw[1])
  const P2 = map(raw[2])
  let body = `<path class="sh sector-sh" d="M${f(C[0])},${f(C[1])} L${f(P1[0])},${f(P1[1])} A${f(s)},${f(s)} 0 ${deg > 180 ? 1 : 0} 0 ${f(P2[0])},${f(P2[1])} Z"/>`
  body += dot(C, 3)
  if (deg === 90) body += rightMark(C, a0, 12)
  else if (deg !== 180) body += angleMark(C, a0, a1, `${deg}°`, 22)
  const mid = polar(C, s * 0.5, a0 + deg / 2)
  if (o.diameter && deg === 180) body += sideLabel(P2, P1, [C[0], C[1] - 100], label)
  else body += sideLabel(C, P1, deg > 180 ? [C[0], C[1] - 100] : mid, label)
  return svg(300, 230, body, deg === 90 ? 'Quadrant' : deg === 180 ? 'Semicircle' : 'Sector', 320)
}

/** A rectangle with a quadrant on its right-hand end: total length `total`, height (and radius) `r`. */
export function rectQuadrant(total: number, r: number, totalLabel: string, rLabel: string): string {
  const a = total - r
  const { map, s } = fitPts(
    [
      [0, 0],
      [total, 0],
      [0, r],
    ],
    330,
    220,
    40,
  )
  const O = map([0, 0])
  const E = map([total, 0])
  const Q = map([a, r])
  const T = map([0, r])
  const Cq = map([a, 0])
  let body = `<path class="sh" d="M${f(O[0])},${f(O[1])} L${f(E[0])},${f(E[1])} A${f(r * s)},${f(r * s)} 0 0 0 ${f(Q[0])},${f(Q[1])} L${f(T[0])},${f(T[1])} Z"/>`
  body += line(Cq, Q, 'ln dash') + rightMark(O, 0, 10)
  body += text([(O[0] + E[0]) / 2, O[1] + 16], totalLabel, 'dl side')
  body += text([O[0] - 8, (O[1] + T[1]) / 2], rLabel, 'dl side', 'end')
  return svg(330, 220, body, 'Rectangle and quadrant')
}

/** depth direction for the oblique solids (30° above horizontal, drawn at half length) */
const depth = (l: number): P => [0.5 * l * Math.cos(rad(30)), 0.5 * l * Math.sin(rad(30))]

/** A prism whose front face is an isosceles trapezium: parallel sides a (top) and b (bottom), height h, length l. */
export function trapPrism(a: number, b: number, h: number, l: number, lab: { a: string; b: string; h: string; l: string; s?: string }): string {
  const k = (b - a) / 2
  const [dx, dy] = depth(l)
  const front: P[] = [
    [0, 0],
    [b, 0],
    [k + a, h],
    [k, h],
  ]
  const back = front.map(([x, y]) => [x + dx, y + dy] as P)
  const foot: P = [k, 0]
  const { map } = fitPts([...front, ...back], 340, 240, 40)
  const F = front.map(map)
  const B = back.map(map)
  const Fo = map(foot)
  let body = `<polygon class="sh sh2" points="${[F[3], F[2], B[2], B[3]].map((p) => `${f(p[0])},${f(p[1])}`).join(' ')}"/>`
  body += `<polygon class="sh sh3" points="${[F[1], B[1], B[2], F[2]].map((p) => `${f(p[0])},${f(p[1])}`).join(' ')}"/>`
  body += `<polygon class="sh" points="${F.map((p) => `${f(p[0])},${f(p[1])}`).join(' ')}"/>`
  body += `<path class="ln dash" d="M${f(F[0][0])},${f(F[0][1])} L${f(B[0][0])},${f(B[0][1])} L${f(B[1][0])},${f(B[1][1])} M${f(B[0][0])},${f(B[0][1])} L${f(B[3][0])},${f(B[3][1])}"/>`
  body += line(F[3], Fo, 'ln dash') + rightMark(Fo, 0, 8)
  const ctr: P = [(F[0][0] + F[2][0]) / 2, (F[0][1] + F[2][1]) / 2]
  // the top length sits above the top edge (its halo keeps it readable over the top face); inside, it would
  // collide with the height label on a short trapezium
  body += sideLabel(F[0], F[1], ctr, lab.b) + sideLabel(F[3], F[2], [ctr[0], ctr[1] + 200], lab.a)
  body += text([Fo[0] + 7, (F[3][1] + Fo[1]) / 2], lab.h, 'dl side', 'start')
  if (lab.s) body += sideLabel(F[0], F[3], [ctr[0] + 200, ctr[1]], lab.s)
  body += text([(F[1][0] + B[1][0]) / 2 + 12, (F[1][1] + B[1][1]) / 2 + 8], lab.l, 'dl side', 'start')
  return svg(340, 240, body, 'Trapezoidal prism', 360)
}

/** A triangular prism (a tent) whose front face is an isosceles triangle: base b, height h, length l. */
export function tentPrism(b: number, h: number, l: number, lab: { b: string; h: string; l: string; s?: string }): string {
  const [dx, dy] = depth(l)
  const front: P[] = [
    [0, 0],
    [b, 0],
    [b / 2, h],
  ]
  const back = front.map(([x, y]) => [x + dx, y + dy] as P)
  const { map } = fitPts([...front, ...back], 340, 240, 40)
  const F = front.map(map)
  const B = back.map(map)
  const Fo = map([b / 2, 0])
  let body = `<polygon class="sh sh3" points="${[F[1], B[1], B[2], F[2]].map((p) => `${f(p[0])},${f(p[1])}`).join(' ')}"/>`
  body += `<polygon class="sh" points="${F.map((p) => `${f(p[0])},${f(p[1])}`).join(' ')}"/>`
  body += `<path class="ln dash" d="M${f(F[0][0])},${f(F[0][1])} L${f(B[0][0])},${f(B[0][1])} L${f(B[1][0])},${f(B[1][1])} M${f(B[0][0])},${f(B[0][1])} L${f(B[2][0])},${f(B[2][1])}"/>`
  body += line(F[2], Fo, 'ln dash') + rightMark(Fo, 0, 8)
  const ctr: P = [(F[0][0] + F[1][0] + F[2][0]) / 3, (F[0][1] + F[1][1] + F[2][1]) / 3]
  body += sideLabel(F[0], F[1], ctr, lab.b)
  body += text([Fo[0] + 7, (F[2][1] + Fo[1]) / 2 + 6], lab.h, 'dl side', 'start')
  if (lab.s) body += sideLabel(F[0], F[2], ctr, lab.s)
  body += text([(F[1][0] + B[1][0]) / 2 + 12, (F[1][1] + B[1][1]) / 2 + 8], lab.l, 'dl side', 'start')
  return svg(340, 240, body, 'Triangular prism', 360)
}

/** A half-cylinder lying on its flat face: radius r, length l. */
export function halfCylinder(r: number, l: number, lab: { r: string; l: string }): string {
  const [dx, dy] = depth(l)
  const pts: P[] = [
    [-r, 0],
    [r, 0],
    [0, r],
    [-r + dx, dy],
    [r + dx, dy],
    [dx, r + dy],
    [r * Math.cos(rad(120)) + dx, r * Math.sin(rad(120)) + dy],
  ]
  const { map, s } = fitPts(pts, 340, 230, 40)
  const R = r * s
  const C = map([0, 0])
  const Cb = map([dx, dy])
  const on = (c: P, deg: number): P => [c[0] + R * Math.cos(rad(deg)), c[1] - R * Math.sin(rad(deg))]
  const p = (q: P) => `${f(q[0])},${f(q[1])}`
  // curved surface seen from the front: from the front arc (0° to 120°) back to the back arc
  let body = `<path class="sh sh3" d="M${p(on(C, 0))} A${f(R)},${f(R)} 0 0 0 ${p(on(C, 120))} L${p(on(Cb, 120))} A${f(R)},${f(R)} 0 0 1 ${p(on(Cb, 0))} Z"/>`
  body += `<path class="ln dash" d="M${p(on(Cb, 120))} A${f(R)},${f(R)} 0 0 0 ${p(on(Cb, 180))} L${p(on(Cb, 0))} M${p(on(C, 180))} L${p(on(Cb, 180))}"/>`
  body += `<path class="sh" d="M${p(on(C, 180))} L${p(on(C, 0))} A${f(R)},${f(R)} 0 0 0 ${p(on(C, 180))} Z"/>`
  body += line(on(C, 0), on(Cb, 0)) + dot(C, 2.5)
  body += line(C, on(C, 0), 'ln hlstroke') + text([C[0] + R / 2, C[1] + 14], lab.r, 'dl side')
  const e0 = on(C, 0)
  const e1 = on(Cb, 0)
  body += text([(e0[0] + e1[0]) / 2 + 12, (e0[1] + e1[1]) / 2 + 8], lab.l, 'dl side', 'start')
  return svg(340, 230, body, 'Half-cylinder', 360)
}
