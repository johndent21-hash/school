// Reading angle drawings (diagrams12 and the older angle helpers) back out of their SVG, so tests can measure
// them: rays from a point, letters on arms, and two lines crossed by a transversal. Copied from
// tests/ncm7-ch2.test.ts so other tests can use the same readers.
const plain = (h: string) => h.replace(/<[^>]*>/g, '')

export type P = [number, number]
export type Seg = [P, P]
export const sub = (a: P, b: P): P => [a[0] - b[0], a[1] - b[1]]
export const dist = (a: P, b: P) => Math.hypot(a[0] - b[0], a[1] - b[1])
export const cross = (a: P, b: P) => a[0] * b[1] - a[1] * b[0]
export const dot = (a: P, b: P) => a[0] * b[0] + a[1] * b[1]
export const unit = (a: P): P => {
  const l = Math.hypot(a[0], a[1]) || 1
  return [a[0] / l, a[1] / l]
}
export const deg = (r: number) => (r * 180) / Math.PI
/** direction of a→b as a maths angle in degrees (screen y points down) */
export const dirOf = (a: P, b: P) => (deg(Math.atan2(-(b[1] - a[1]), b[0] - a[0])) + 360) % 360
/** angle between two undirected lines, 0 to 90 */
export const lineAngle = (s: Seg, t: Seg) => {
  const d = Math.abs(dirOf(s[0], s[1]) - dirOf(t[0], t[1])) % 180
  return Math.min(d, 180 - d)
}
/** angle at v between the rays to a and b, 0 to 180 */
export const angleAt = (v: P, a: P, b: P) => deg(Math.acos(Math.max(-1, Math.min(1, dot(unit(sub(a, v)), unit(sub(b, v)))))))
export const near = (x: number, y: number, tol = 0.6) => Math.abs(x - y) <= tol
export function intersect(s: Seg, t: Seg): P {
  const d1 = sub(s[1], s[0])
  const d2 = sub(t[1], t[0])
  const k = cross(sub(t[0], s[0]), d2) / cross(d1, d2)
  return [s[0][0] + d1[0] * k, s[0][1] + d1[1] * k]
}
export const distToSeg = (p: P, s: Seg) => {
  const d = sub(s[1], s[0])
  const k = Math.max(0, Math.min(1, dot(sub(p, s[0]), d) / dot(d, d)))
  return dist(p, [s[0][0] + d[0] * k, s[0][1] + d[1] * k])
}

/** does the segment pass through the box centred at c (half-width hw, half-height hh)? */
export function segHitsBox(s: Seg, c: P, hw: number, hh: number): boolean {
  // clip the segment to the box, one side at a time (Liang-Barsky)
  let t0 = 0
  let t1 = 1
  const d = sub(s[1], s[0])
  const edges: [number, number][] = [
    [-d[0], s[0][0] - (c[0] - hw)],
    [d[0], c[0] + hw - s[0][0]],
    [-d[1], s[0][1] - (c[1] - hh)],
    [d[1], c[1] + hh - s[0][1]],
  ]
  for (const [pp, qq] of edges) {
    if (Math.abs(pp) < 1e-12) {
      if (qq < 0) return false
      continue
    }
    const r = qq / pp
    if (pp < 0) t0 = Math.max(t0, r)
    else t1 = Math.min(t1, r)
    if (t0 > t1) return false
  }
  return true
}

export const NUM = '(-?[\\d.]+)'
export const segs = (svg: string, cls = 'ln'): Seg[] =>
  [...svg.matchAll(new RegExp(`<line class="${cls}" x1="${NUM}" y1="${NUM}" x2="${NUM}" y2="${NUM}"/>`, 'g'))].map((m) => [
    [Number(m[1]), Number(m[2])],
    [Number(m[3]), Number(m[4])],
  ])
interface Label {
  cls: string
  p: P
  s: string
}
export const labels = (svg: string): Label[] => [...svg.matchAll(new RegExp(`<text class="([^"]*)" x="${NUM}" y="${NUM}"[^>]*>(.*?)</text>`, 'g'))].map((m) => ({ cls: m[1], p: [Number(m[2]), Number(m[3])], s: plain(m[4]) }))
export const angLabels = (svg: string) => labels(svg).filter((l) => /\bang\b/.test(l.cls))
export const vxLabels = (svg: string) => labels(svg).filter((l) => /\bvx\b/.test(l.cls))
export const arrowheads = (svg: string) => (svg.match(/<path class="ln" d="M[^"]*"\/>/g) ?? []).length
export const rightMarks = (svg: string) => (svg.match(/<path class="rm"/g) ?? []).length
export const sizeOfLabel = (s: string) => (/^\d+°$/.test(s) ? Number(s.slice(0, -1)) : null)

/** Rays from one point (the dot): where they point, and the size of the gap that a label sits in. */
export function readPoint(svg: string) {
  const m = svg.match(new RegExp(`<circle class="pt" cx="${NUM}" cy="${NUM}" r="3"/>`))
  if (!m) return null
  const V: P = [Number(m[1]), Number(m[2])]
  const rays: { dir: number; end: P }[] = []
  for (const [a, b] of segs(svg)) {
    if (dist(a, V) < 1) rays.push({ dir: dirOf(V, b), end: b })
    else if (dist(b, V) < 1) rays.push({ dir: dirOf(V, a), end: a })
    else if (distToSeg(V, [a, b]) < 1) rays.push({ dir: dirOf(V, a), end: a }, { dir: dirOf(V, b), end: b })
  }
  rays.sort((x, y) => x.dir - y.dir)
  /** the gap (in degrees) that the point p lies in, and the 2 rays on either side of it */
  const gapAt = (p: P) => {
    const d = dirOf(V, p)
    let k = rays.findIndex((r) => r.dir > d) - 1
    if (k < 0) k = rays.length - 1
    const lo = rays[k]
    const hi = rays[(k + 1) % rays.length]
    return { size: (hi.dir - lo.dir + 360) % 360 || 360, lo, hi }
  }
  return { V, rays, gapAt }
}

/** Letters on a "rays" drawing: which letter is at the vertex and which is at the end of each arm. */
export function readLetters(svg: string) {
  const pt = readPoint(svg)
  if (!pt) return null
  const vx = vxLabels(svg)
  const arms: Record<string, { dir: number; end: P }> = {}
  let vertex = ''
  for (const l of vx) {
    if (dist(l.p, pt.V) < 22) {
      vertex = l.s
      continue
    }
    const ray = pt.rays.slice().sort((a, b) => dist(a.end, l.p) - dist(b.end, l.p))[0]
    if (ray && dist(ray.end, l.p) < 22) arms[l.s] = ray
  }
  /** the angle named by 3 letters, if its middle letter is the vertex and the others are arms: its size, 0 to 180 */
  const angle = (name: string): number | null => {
    const [a, v, b] = name.split('')
    if (v !== vertex || !arms[a] || !arms[b] || a === b) return null
    const d = Math.abs(arms[a].dir - arms[b].dir) % 360
    return Math.min(d, 360 - d)
  }
  return { ...pt, vertex, arms, angle }
}

/** Two lines and a transversal: where each label is, how big its angle really is, and how 2 labels are related. */
export function readTransversal(svg: string) {
  const ls = segs(svg)
  if (ls.length !== 3) return null
  const [l0, l1, t] = ls
  const X: [P, P] = [intersect(l0, t), intersect(l1, t)]
  const w = unit(sub(t[1], t[0]))
  const spot = (p: P) => {
    const at = dist(p, X[0]) < dist(p, X[1]) ? 0 : 1
    const li = at === 0 ? l0 : l1
    const u = unit(sub(li[1], li[0]))
    // p − X = alpha·u + beta·w
    const r = sub(p, X[at])
    const det = cross(u, w)
    const alpha = cross(r, w) / det
    const beta = cross(u, r) / det
    const sa = Math.sign(alpha) || 1
    const sb = Math.sign(beta) || 1
    const size = deg(Math.acos(Math.max(-1, Math.min(1, sa * sb * dot(u, w)))))
    // between the 2 lines if the piece of transversal that bounds this angle heads for the other crossing
    const interior = dot([w[0] * sb, w[1] * sb], sub(X[1 - at], X[at])) > 0
    // which side of the transversal
    const side = Math.sign(cross(w, [u[0] * sa, u[1] * sa]))
    return { at, size, interior, side, sa, sb, toLines: Math.min(distToSeg(p, l0), distToSeg(p, l1), distToSeg(p, t)) }
  }
  type Spot = ReturnType<typeof spot>
  const relation = (a: Spot, b: Spot): string => {
    if (a.at === b.at) return a.sa === -b.sa && a.sb === -b.sb ? 'vertically opposite' : a.sa === b.sa && a.sb === b.sb ? 'same' : 'on a line'
    if (a.side === b.side && a.interior !== b.interior) return 'corresponding'
    if (a.interior && b.interior) return a.side === b.side ? 'co-interior' : 'alternate'
    return 'none'
  }
  /** would these 2 angle sizes make the lines parallel? (worked out from where the angles are) */
  const wouldBeParallel = (a: Spot, sa: number, b: Spot, sb: number) => {
    const sameSide = a.side === b.side
    const sameZone = a.interior === b.interior
    // same side: matching positions are equal, otherwise they add to 180°. Opposite sides: both inside or both outside are equal, otherwise 180°.
    const equalRule = sameSide ? !sameZone : sameZone
    return equalRule ? sa === sb : sa + sb === 180
  }
  return { l0, l1, t, X, spot, relation, wouldBeParallel, parallel: lineAngle(l0, l1) < 0.02, between: lineAngle(l0, l1) }
}

