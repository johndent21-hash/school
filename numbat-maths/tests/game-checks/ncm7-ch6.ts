// Independent answers for the Chapter 6 (Geometrical figures) class games, used by tests/games.test.ts.
// Every drawing is measured:
//  - shapes on a grid: vertices must sit on grid points; the move from A to B is found by comparing the shapes
//    (a reflection must be a true mirror image, not a flip and a slide);
//  - symmetry: axes and order are found by reflecting and rotating the drawn polygon's vertices;
//  - triangles and quadrilaterals: each angle label is matched to its vertex, numbers must agree with the drawn
//    angle to within 1°, and the unknown is worked out from the angle sum and checked against the drawing;
//  - quadrilaterals are named from their measured sides, parallel sides and right angles, and their marks checked.
// Questions about named shapes use this file's own shapes (not the game's), with properties found by measuring.
import type { GameQuestion, GameSet } from '../../src/lib/game/types'
import type { Ctx, Expect } from './ncm7-ch1'

type P = [number, number]
const NUM = '(-?[\\d.]+)'
const polys = (svg: string) =>
  [...svg.matchAll(/<polygon class="([^"]*)" points="([^"]*)"/g)].map((m) => ({ cls: m[1], pts: m[2].split(' ').map((p) => p.split(',').map(Number) as P) }))
const labels = (svg: string) =>
  [...svg.matchAll(new RegExp(`<text class="([^"]*)" x="${NUM}" y="${NUM}"[^>]*>(.*?)</text>`, 'g'))].map((m) => ({
    cls: m[1],
    p: [Number(m[2]), Number(m[3])] as P,
    s: m[4].replace(/<[^>]*>/g, ''),
  }))
const dist = (a: P, b: P) => Math.hypot(a[0] - b[0], a[1] - b[1])
const angleAt = (v: P, a: P, b: P) => {
  const u = [a[0] - v[0], a[1] - v[1]]
  const w = [b[0] - v[0], b[1] - v[1]]
  return (Math.acos(Math.max(-1, Math.min(1, (u[0] * w[0] + u[1] * w[1]) / (Math.hypot(u[0], u[1]) * Math.hypot(w[0], w[1]))))) * 180) / Math.PI
}
function inside(p: P, poly: P[]): boolean {
  let c = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) c = !c
  }
  return c
}
const centre = (pts: P[]): P => [pts.reduce((t, p) => t + p[0], 0) / pts.length, pts.reduce((t, p) => t + p[1], 0) / pts.length]
/** the same set of points, to within tol */
const sameSet = (a: P[], b: P[], tol = 0.6) => a.length === b.length && a.every((p) => b.some((q) => dist(p, q) <= tol)) && b.every((q) => a.some((p) => dist(p, q) <= tol))

// ---------------------------------------------------------------- symmetry, measured
function axesOf(pts: P[]): number {
  const c = centre(pts)
  const n = pts.length
  const dirs: number[] = []
  const cands = [...pts, ...pts.map((p, i) => [(p[0] + pts[(i + 1) % n][0]) / 2, (p[1] + pts[(i + 1) % n][1]) / 2] as P)]
  for (const q of cands) {
    const t = Math.atan2(q[1] - c[1], q[0] - c[0])
    const [ux, uy] = [Math.cos(t), Math.sin(t)]
    const mirror = pts.map(([x, y]) => {
      const dx = x - c[0]
      const dy = y - c[1]
      const k = dx * ux + dy * uy
      return [c[0] + 2 * k * ux - dx, c[1] + 2 * k * uy - dy] as P
    })
    const d = (((t * 180) / Math.PI) % 180 + 180) % 180
    if (sameSet(mirror, pts, 0.01 * Math.max(...pts.map((p) => dist(p, c)))) && !dirs.some((e) => Math.min(Math.abs(e - d), 180 - Math.abs(e - d)) < 1)) dirs.push(d)
  }
  return dirs.length
}
function orderOf(pts: P[]): number {
  const c = centre(pts)
  const r = Math.max(...pts.map((p) => dist(p, c)))
  for (let k = 12; k >= 2; k--) {
    const t = (2 * Math.PI) / k
    const rot = pts.map(([x, y]) => [c[0] + (x - c[0]) * Math.cos(t) - (y - c[1]) * Math.sin(t), c[1] + (x - c[0]) * Math.sin(t) + (y - c[1]) * Math.cos(t)] as P)
    if (sameSet(rot, pts, 0.01 * r)) return k
  }
  return 1
}

// ---------------------------------------------------------------- this file's own named shapes
const reg = (n: number): P[] => Array.from({ length: n }, (_, k) => [10 * Math.cos((2 * Math.PI * k) / n + 0.3), 10 * Math.sin((2 * Math.PI * k) / n + 0.3)] as P)
const OWN: Record<string, P[]> = {
  square: [[0, 0], [4, 0], [4, 4], [0, 4]],
  rectangle: [[0, 0], [7, 0], [7, 3], [0, 3]],
  rhombus: [[0, 0], [5, 0], [5 + 5 * Math.cos(1.2), 5 * Math.sin(1.2)], [5 * Math.cos(1.2), 5 * Math.sin(1.2)]],
  parallelogram: [[0, 0], [7, 0], [9, 3], [2, 3]],
  kite: [[0, 0], [3, 2], [0, 7], [-3, 2]],
  trapezium: [[0, 0], [8, 0], [6, 3], [1, 3]],
  'isosceles trapezium': [[0, 0], [8, 0], [6, 3], [2, 3]],
  'equilateral triangle': reg(3),
  'isosceles triangle': [[0, 0], [6, 0], [3, 8]],
  'scalene triangle': [[0, 0], [7, 0], [2, 4]],
  'regular pentagon': reg(5),
  'regular hexagon': reg(6),
  'regular octagon': reg(8),
}

// ---------------------------------------------------------------- quadrilateral properties, measured
const vec = (a: P, b: P): P => [b[0] - a[0], b[1] - a[1]]
const parallel = (u: P, v: P) => Math.abs(u[0] * v[1] - u[1] * v[0]) <= 1e-6 * Math.hypot(...u) * Math.hypot(...v) * 1000
const perp = (u: P, v: P) => Math.abs(u[0] * v[0] + u[1] * v[1]) <= 1e-3 * Math.hypot(...u) * Math.hypot(...v)
const eq = (x: number, y: number) => Math.abs(x - y) <= 0.005 * Math.max(x, y)
function props(q: P[]) {
  const side = [0, 1, 2, 3].map((i) => vec(q[i], q[(i + 1) % 4]))
  const len = side.map((s) => Math.hypot(...s))
  const ang = [0, 1, 2, 3].map((i) => angleAt(q[i], q[(i + 3) % 4], q[(i + 1) % 4]))
  const d1 = vec(q[0], q[2])
  const d2 = vec(q[1], q[3])
  const mid1: P = [(q[0][0] + q[2][0]) / 2, (q[0][1] + q[2][1]) / 2]
  const mid2: P = [(q[1][0] + q[3][0]) / 2, (q[1][1] + q[3][1]) / 2]
  const bisects = (i: number, d: P) => {
    // the diagonal through vertex i makes equal angles with the two sides there
    const a = angleAt(q[i], q[(i + 1) % 4], [q[i][0] + d[0], q[i][1] + d[1]])
    const b = angleAt(q[i], q[(i + 3) % 4], [q[i][0] + d[0], q[i][1] + d[1]])
    return Math.abs(a - b) < 0.3
  }
  const pairs = [parallel(side[0], side[2]), parallel(side[1], side[3])].filter(Boolean).length
  return {
    allSides: len.every((l) => eq(l, len[0])),
    oppParallel: pairs === 2,
    parallelPairs: pairs,
    allRight: ang.every((a) => Math.abs(a - 90) < 0.3),
    allAngles: ang.every((a) => Math.abs(a - ang[0]) < 0.3),
    rightCount: ang.filter((a) => Math.abs(a - 90) < 0.3).length,
    diagEqual: eq(Math.hypot(...d1), Math.hypot(...d2)),
    diagBisect: dist(mid1, mid2) < 0.005 * Math.hypot(...d1),
    diagPerp: perp(d1, d2),
    oppAngles: Math.abs(ang[0] - ang[2]) < 0.3 && Math.abs(ang[1] - ang[3]) < 0.3,
    diagBisectAngles: bisects(0, d1) && bisects(2, [-d1[0], -d1[1]]) && bisects(1, d2) && bisects(3, [-d2[0], -d2[1]]),
    adjacentPairs: (eq(len[0], len[1]) && eq(len[2], len[3])) || (eq(len[1], len[2]) && eq(len[3], len[0])),
    len,
  }
}
function quadName(q: P[]): string | null {
  const p = props(q)
  if (p.parallelPairs === 2) return p.allSides ? (p.allRight ? 'Square' : 'Rhombus') : p.allRight ? 'Rectangle' : 'Parallelogram'
  if (p.parallelPairs === 1) return 'Trapezium'
  if (p.adjacentPairs) return 'Kite'
  return null
}
const PROP_OF: Record<string, keyof ReturnType<typeof props>> = {
  'All sides are equal': 'allSides',
  'Opposite sides are parallel': 'oppParallel',
  'All angles are right angles': 'allRight',
  'The diagonals are equal': 'diagEqual',
  'The diagonals bisect each other': 'diagBisect',
  'The diagonals are perpendicular': 'diagPerp',
  'Opposite angles are equal': 'oppAngles',
  'The diagonals bisect the angles': 'diagBisectAngles',
  'All angles are equal': 'allAngles',
}

// ---------------------------------------------------------------- words
const DIRS: Record<string, P> = { right: [1, 0], left: [-1, 0], down: [0, 1], up: [0, -1] }
function readSlide(s: string): P {
  const v: P = [0, 0]
  for (const m of s.matchAll(/(\d+) units? (right|left|up|down)/g)) {
    v[0] += Number(m[1]) * DIRS[m[2]][0]
    v[1] += Number(m[1]) * DIRS[m[2]][1]
  }
  return v
}
const sayUnits = (n: number, w: string) => `${n} ${n === 1 ? 'unit' : 'units'} ${w}`
const saySlide = (v: P) => [v[0] && sayUnits(Math.abs(v[0]), v[0] > 0 ? 'right' : 'left'), v[1] && sayUnits(Math.abs(v[1]), v[1] > 0 ? 'down' : 'up')].filter(Boolean).join(', ')

export function rework(set: GameSet, q: GameQuestion, ctx: Ctx): Expect {
  const kind = `${set.exercise} ${q.meta.t}`
  const want = solve(kind, q, ctx)
  if (want && 'text' in want && !['6.01 which', '6.05 angles', '6.08 drawn', '6.08 describe', '6.03 axes', '6.04 order', '6.10 always', '6.02 rotate'].includes(kind)) {
    if (!ctx.plain(q.why).replace(/\s/g, '').toLowerCase().includes(want.text.replace(/\s/g, '').toLowerCase())) ctx.fail(`the explanation does not reach ${want.text}`)
  }
  return want
}

function solve(kind: string, q: GameQuestion, ctx: Ctx): Expect {
  const svg = q.diagram ?? ''
  const words = ctx.plain(q.prompt)
  const shown = q.options.map(ctx.plain)
  const one = (ok: boolean[], what: string): Expect => {
    const hits = ok.map((x, k) => (x ? k : -1)).filter((k) => k >= 0)
    if (hits.length !== 1) ctx.fail(`${hits.length} options ${what}`)
    return hits.length ? { text: shown[hits[0]] } : null
  }

  switch (kind) {
    // ---------------------------------------------------------------- 6.01: shapes on a grid
    case '6.01 which':
    case '6.01 slide': {
      const grid = [...svg.matchAll(/<line class="grid" x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)"/g)].filter((m) => m[1] === m[3]).map((m) => Number(m[1]))
      const u = grid[1] - grid[0]
      const o = grid[0]
      const ps = polys(svg)
      const toGrid = (pts: P[]) => pts.map(([x, y]) => [(x - o) / u, (y - o) / u] as P)
      const A = toGrid(ps.find((p) => /shapeA/.test(p.cls))!.pts)
      const B = toGrid(ps.find((p) => /shapeB/.test(p.cls))!.pts)
      if ([...A, ...B].some(([x, y]) => Math.abs(x - Math.round(x)) > 0.01 || Math.abs(y - Math.round(y)) > 0.01)) ctx.fail('a vertex is not on a grid point')
      const lab = labels(svg)
      const la = lab.find((l) => l.s === 'A')!
      const lb = lab.find((l) => l.s === 'B')!
      if (!inside(la.p, ps.find((p) => /shapeA/.test(p.cls))!.pts) || !inside(lb.p, ps.find((p) => /shapeB/.test(p.cls))!.pts)) ctx.fail('a label is not inside its shape')
      const canon = (pts: P[]) => {
        const x0 = Math.min(...pts.map((p) => p[0]))
        const y0 = Math.min(...pts.map((p) => p[1]))
        return pts.map(([x, y]) => [Math.round(x - x0), Math.round(y - y0)] as P)
      }
      const imgs: Record<string, (p: P) => P> = {
        id: ([x, y]) => [x, y],
        r90: ([x, y]) => [-y, x],
        r180: ([x, y]) => [-x, -y],
        r270: ([x, y]) => [y, -x],
        fx: ([x, y]) => [-x, y],
        fy: ([x, y]) => [x, -y],
        fd: ([x, y]) => [y, x],
        fe: ([x, y]) => [-y, -x],
      }
      const matches = Object.keys(imgs).filter((k) => sameSet(canon(A.map(imgs[k])), canon(B), 0.01))
      const distinct = Object.keys(imgs).filter((k, i, all) => !all.slice(0, i).some((j) => sameSet(canon(A.map(imgs[j])), canon(A.map(imgs[k])), 0.01)))
      if (distinct.length !== 8) ctx.fail('shape A has some symmetry, so the move could be read two ways')
      if (matches.length !== 1) return ctx.fail(`${matches.length} kinds of move fit`), null
      const m = matches[0]
      const shift: P = [Math.min(...B.map((p) => p[0])) - Math.min(...A.map((p) => p[0])), Math.min(...B.map((p) => p[1])) - Math.min(...A.map((p) => p[1]))]
      if (kind === '6.01 slide') {
        if (m !== 'id') ctx.fail('B is not a translation of A')
        return { text: saySlide([Math.round(shift[0]), Math.round(shift[1])]) }
      }
      if (m === 'id') return { text: 'Translation' }
      if (m.startsWith('r')) return { text: 'Rotation' }
      // a flip is a single reflection only if some mirror line takes A exactly onto B (no slide along the mirror)
      const mirrorX = A.map(([x, y]) => [Math.min(...A.map((p) => p[0])) + Math.max(...B.map((p) => p[0])) - x, y] as P)
      const mirrorY = A.map(([x, y]) => [x, Math.min(...A.map((p) => p[1])) + Math.max(...B.map((p) => p[1])) - y] as P)
      if (!sameSet(mirrorX, B, 0.01) && !sameSet(mirrorY, B, 0.01)) ctx.fail('B is a flip and a slide, not a single reflection')
      return { text: 'Reflection' }
    }
    // ---------------------------------------------------------------- 6.02
    case '6.02 translate': {
      const m = words.match(/translated (.+?), then (.+?)\. What single/)!
      const a = readSlide(m[1])
      const b = readSlide(m[2])
      return { text: saySlide([a[0] + b[0], a[1] + b[1]]) }
    }
    case '6.02 rotate': {
      const m = words.match(/rotated (90° clockwise|180°|90° anticlockwise) about a point, then (90° clockwise|180°|90° anticlockwise) about/)!
      const cw = (s: string) => (s === '180°' ? 180 : s === '90° clockwise' ? 90 : -90)
      const total = (((cw(m[1]) + cw(m[2])) % 360) + 360) % 360
      return { text: { 0: 'No change (a full turn)', 90: '90° clockwise', 180: '180°', 270: '90° anticlockwise' }[total]! }
    }
    // ---------------------------------------------------------------- 6.03, 6.04: symmetry
    case '6.03 axes':
    case '6.04 order': {
      const ps = polys(svg)
      if (ps.length !== 1) ctx.fail('expected one shape')
      const n = kind === '6.03 axes' ? axesOf(ps[0].pts) : orderOf(ps[0].pts)
      return { text: kind === '6.04 order' && n === 1 ? 'None' : String(n) }
    }
    case '6.03 which': {
      const n = Number(words.match(/exactly (\d+) ax/)![1])
      return one(
        shown.map((o) => axesOf(OWN[o.toLowerCase()]) === n),
        `have exactly ${n} axes`,
      )
    }
    case '6.04 turn': {
      const name = words.match(/fits an? (.+?) exactly onto itself/)![1]
      return { text: `${360 / orderOf(OWN[name])}°` }
    }
    // ---------------------------------------------------------------- 6.05: triangles classified
    case '6.05 angles': {
      const a = [...words.matchAll(/(\d+)°/g)].map((m) => Number(m[1]))
      if (a.length !== 3) ctx.fail('expected three angles')
      const s = a.reduce((t, x) => t + x, 0)
      const big = Math.max(...a)
      return { text: s !== 180 ? 'Not possible' : big === 90 ? 'Right-angled' : big > 90 ? 'Obtuse-angled' : 'Acute-angled' }
    }
    case '6.05 drawn': {
      const t = polys(svg)[0].pts
      const L = [dist(t[0], t[1]), dist(t[1], t[2]), dist(t[2], t[0])]
      const A = [angleAt(t[0], t[1], t[2]), angleAt(t[1], t[2], t[0]), angleAt(t[2], t[0], t[1])]
      const pairsEq = [0, 1, 2].filter((i) => eq(L[i], L[(i + 1) % 3])).length
      for (let i = 0; i < 3; i++) {
        const r = Math.abs(L[i] - L[(i + 1) % 3]) / Math.max(L[i], L[(i + 1) % 3])
        if (r > 0.005 && r < 0.06) ctx.fail('two sides are nearly but not quite equal')
      }
      const sides = pairsEq === 3 ? 'Equilateral' : pairsEq === 1 ? 'Isosceles' : 'Scalene'
      const big = Math.max(...A)
      if (big > 84 && big < 96 && Math.abs(big - 90) > 0.3) ctx.fail('the largest angle is too close to 90° to judge')
      const angles = Math.abs(big - 90) <= 0.3 ? 'right-angled' : big > 90 ? 'obtuse-angled' : 'acute-angled'
      const ticks = (svg.match(/class="tk"/g) ?? []).length
      if (ticks !== { Equilateral: 3, Isosceles: 2, Scalene: 0 }[sides]) ctx.fail(`${ticks} tick marks for a ${sides.toLowerCase()} triangle`)
      if ((svg.match(/class="rm"/g) ?? []).length !== (angles === 'right-angled' ? 1 : 0)) ctx.fail('the right-angle mark is missing or wrong')
      return { text: `${sides}, ${angles}` }
    }
    // ---------------------------------------------------------------- 6.06, 6.07, 6.09: angles from drawings
    case '6.06 missing':
    case '6.06 right':
    case '6.07 exterior':
    case '6.07 interior':
    case '6.09 missing': {
      const shape = polys(svg)[0].pts
      const n = shape.length
      const interior = shape.map((v, i) => angleAt(v, shape[(i + n - 1) % n], shape[(i + 1) % n]))
      const labs = labels(svg).filter((l) => /\bang\b/.test(l.cls))
      let unknown: { measured: number; ext: boolean } | null = null
      const known: number[] = []
      const labelled = new Set<number>()
      for (const l of labs) {
        const ext = !inside(l.p, shape)
        // the corner whose angle bisector (or, outside the shape, exterior bisector) passes through the label
        const off = shape.map((v, k) => {
          const a = Math.atan2(shape[(k + n - 1) % n][1] - v[1], shape[(k + n - 1) % n][0] - v[0])
          const b = Math.atan2(shape[(k + 1) % n][1] - v[1], shape[(k + 1) % n][0] - v[0])
          const bis = Math.atan2(Math.sin(a) + Math.sin(b), Math.cos(a) + Math.cos(b))
          const to = Math.atan2(l.p[1] - v[1], l.p[0] - v[0])
          let d = Math.abs(((to - bis) * 180) / Math.PI) % 360
          d = Math.min(d, 360 - d)
          return ext ? Math.abs(d - 90) : d
        })
        // the corner whose bisector the label sits on most exactly; two bisectors can line up, so a tie goes to the nearer corner
        const best = Math.min(...off)
        const onBisector = off.map((d, k) => (d <= 6 && d <= best + 1.5 ? k : -1)).filter((k) => k >= 0)
        if (!onBisector.length) ctx.fail(`the label ${l.s} is not on any corner's bisector`)
        const i = (onBisector.length ? onBisector : [0, 1, 2, 3].slice(0, n)).reduce((b, k) => (dist(shape[k], l.p) < dist(shape[b], l.p) ? k : b))
        const measured = ext ? 180 - interior[i] : interior[i]
        if (!ext) labelled.add(i)
        const m = l.s.match(/^(\d+)°$/)
        if (m) {
          if (Math.abs(Number(m[1]) - measured) > 1) ctx.fail(`${l.s} is drawn as ${measured.toFixed(1)}°`)
          known.push(ext ? -Number(m[1]) : Number(m[1]))
        } else if (/^[a-z]°$/.test(l.s)) {
          if (unknown) ctx.fail('two unknowns')
          unknown = { measured, ext }
        }
      }
      // an unlabelled corner must carry a right-angle mark
      const rms = (svg.match(/class="rm"/g) ?? []).length
      const bare = [...Array(n).keys()].filter((i) => !labelled.has(i))
      const extKnown = known.filter((x) => x < 0)
      const intKnown = known.filter((x) => x > 0)
      let value: number
      if (unknown?.ext) {
        // exterior angle = 180° − the interior angle beside it = the sum of the other two
        value = intKnown.reduce((t, x) => t + x, 0)
        if (intKnown.length !== 2) ctx.fail('need the two interior opposite angles')
      } else if (extKnown.length) {
        value = -extKnown[0] - intKnown.reduce((t, x) => t + x, 0)
      } else {
        const right = bare.filter((i) => Math.abs(interior[i] - 90) < 0.3)
        if (bare.length !== right.length || rms !== right.length) ctx.fail('an unlabelled corner is not a marked right angle')
        value = (n === 3 ? 180 : 360) - intKnown.reduce((t, x) => t + x, 0) - 90 * right.length
      }
      if (!unknown) return ctx.fail('no unknown angle'), null
      if (Math.abs(value - (unknown as { measured: number }).measured) > 1) ctx.fail(`the answer ${value} is drawn as ${(unknown as { measured: number }).measured.toFixed(1)}°`)
      return { v: value }
    }
    case '6.06 words': {
      const [a, b] = [...words.matchAll(/(\d+)°/g)].map((m) => Number(m[1]))
      return { text: `${180 - a - b}°` }
    }
    case '6.06 isosceles': {
      const x = Number(words.match(/(\d+)°/)![1])
      return { text: /apex angle of/.test(words) ? `${(180 - x) / 2}°` : `${180 - 2 * x}°` }
    }
    case '6.09 words': {
      const a = [...words.matchAll(/(\d+)°/g)].map((m) => Number(m[1]))
      return { text: `${360 - a[0] - a[1] - a[2]}°` }
    }
    case '6.09 special': {
      const a = [...words.matchAll(/(\d+)°/g)].map((m) => Number(m[1]))
      if (/kite/.test(words)) return { text: `${(360 - a[0] - a[1]) / 2}°` }
      return { text: /opposite it/.test(words) ? `${a[0]}°` : `${180 - a[0]}°` }
    }
    // ---------------------------------------------------------------- 6.08, 6.10: quadrilaterals
    case '6.08 drawn': {
      const qd = polys(svg)[0].pts
      const name = quadName(qd)
      if (!name) return ctx.fail('not a special quadrilateral'), null
      const p = props(qd)
      if ((svg.match(/class="rm"/g) ?? []).length !== p.rightCount) ctx.fail('right-angle marks do not match the right angles')
      const arrows = (svg.match(/<path class="ln" d="M/g) ?? []).length
      const wantArrows = p.parallelPairs === 2 ? 2 * (1 + 2) : p.parallelPairs === 1 ? 2 : 0
      if (arrows !== wantArrows) ctx.fail(`${arrows} arrowheads for ${p.parallelPairs} pairs of parallel sides`)
      if (name !== 'Trapezium' && name !== 'Parallelogram' && name !== 'Rectangle' && (svg.match(/class="tk"/g) ?? []).length === 0) ctx.fail('equal sides are not marked')
      return one(shown.map((o) => o === name), `are a ${name.toLowerCase()}`)
    }
    case '6.08 describe': {
      const RULES: [RegExp, string][] = [
        [/All four sides are equal and every angle is a right angle/, 'Square'],
        [/Every angle is a right angle, but the four sides are not all equal/, 'Rectangle'],
        [/All four sides are equal, but no angle is a right angle/, 'Rhombus'],
        [/Both pairs of opposite sides are parallel, the sides are not all equal and no angle is a right angle/, 'Parallelogram'],
        [/exactly one pair of parallel sides/, 'Trapezium'],
        [/two pairs of equal sides next to each other, and no parallel sides/, 'Kite'],
      ]
      const hit = RULES.filter(([re]) => re.test(words))
      if (hit.length !== 1) return ctx.fail('cannot read the description'), null
      // the description fits that shape when measured
      const p = props(OWN[hit[0][1].toLowerCase()])
      if (quadName(OWN[hit[0][1].toLowerCase()]) !== hit[0][1]) ctx.fail('own shape misnamed')
      void p
      return one(shown.map((o) => o === hit[0][1]), 'fit')
    }
    case '6.10 always': {
      const name = words.match(/always true for an? (\w+)\?/)![1]
      const p = props(OWN[name])
      return one(shown.map((o) => p[PROP_OF[o]] === true), `are true for a ${name}`)
    }
    case '6.10 which': {
      const RULES: [RegExp, (p: ReturnType<typeof props>) => boolean][] = [
        [/diagonals that are equal but not perpendicular/, (p) => p.diagEqual && !p.diagPerp],
        [/all sides equal, and diagonals that are perpendicular but not equal/, (p) => p.allSides && p.diagPerp && !p.diagEqual],
        [/perpendicular diagonals but no parallel sides/, (p) => p.diagPerp && p.parallelPairs === 0],
        [/both pairs of opposite sides parallel, but diagonals that are neither equal nor perpendicular/, (p) => p.oppParallel && !p.diagEqual && !p.diagPerp],
        [/diagonals that are equal and perpendicular/, (p) => p.diagEqual && p.diagPerp],
      ]
      const rule = RULES.find(([re]) => re.test(words))
      if (!rule) return ctx.fail('cannot read the question'), null
      return one(shown.map((o) => rule[1](props(OWN[o.toLowerCase()]))), 'fit')
    }
  }
  ctx.fail('no independent check for this kind of question')
  return null
}
