// Year 9 Geometry and networks, following New Century Maths 9 (3rd edition, Cengage) Chapter 6 exercise by exercise.
// The questions are the site's own: they practise the same kinds of question as each exercise, in the same
// easy-to-hard order (Foundation = the start of the exercise, Challenge = the end), but none of the textbook's
// wording or numbers are copied.
// Syllabus: triangle and quadrilateral geometry (6.01, 6.02) is Stage 4 content (MA4-GEO-C-01, with angle
// relationships MA4-ANG-C-01) that NCM 9 revisits. Networks and planar graphs (6.03, 6.04) are Path content
// (MA5-NET-P-01): they are extension skills, left out of the topic test, as is Power plus.
// Drawing and constructing tasks (6.01 Q8, 6.02 Q9) are left out. Every angle diagram is drawn to scale from the
// question's own angles; equal sides carry matching ticks and parallel sides matching arrows.
import type { Level, Question, Skill, TestItem } from '@/lib/maths/types'
import * as F from '@/lib/maths/diagrams6'
import { dot, line, svg, text } from '@/lib/maths/diagrams'
import { chance, int, mcA, mcFixedA, numA, pick, q, random, sample, shuffle, v } from './helpers'

type P = F.P
const GEO = ['MA4-GEO-C-01', 'MA4-ANG-C-01']
const NET = ['MA5-NET-P-01']
const ref = (e: string) => `NCM 9 Ex ${e}`
const rad = (d: number) => (d * Math.PI) / 180
const deg = (r: number) => (r * 180) / Math.PI
const LET = ['a', 'b', 'c', 'd', 'g', 'h', 'k', 'm', 'n', 'p', 'r', 't', 'w', 'x', 'y']
const dirP = (d: number, len = 1): P => [len * Math.cos(rad(d)), len * Math.sin(rad(d))]
const add = (a: P, b: P): P => [a[0] + b[0], a[1] + b[1]]
const sub = (a: P, b: P): P => [a[0] - b[0], a[1] - b[1]]
const mulP = (a: P, k: number): P => [a[0] * k, a[1] * k]
const lenP = (a: P) => Math.hypot(a[0], a[1])
const unit = (a: P): P => mulP(a, 1 / lenP(a))
/** the angle at v between the lines to a and b (0–180) */
function angAt(vv: P, a: P, b: P): number {
  const u = sub(a, vv)
  const w = sub(b, vv)
  return deg(Math.acos(Math.max(-1, Math.min(1, (u[0] * w[0] + u[1] * w[1]) / (lenP(u) * lenP(w))))))
}
/** turn a figure: rotate about the origin and maybe mirror it */
function orient(pts: Record<string, P>, turn: number, flip: boolean): Record<string, P> {
  const out: Record<string, P> = {}
  for (const k in pts) {
    const [x, y] = pts[k]
    const fx = flip ? -x : x
    out[k] = [fx * Math.cos(rad(turn)) - y * Math.sin(rad(turn)), fx * Math.sin(rad(turn)) + y * Math.cos(rad(turn))]
  }
  return out
}
const TURNS = [0, 0, 0, 8, -8, 180, 172]
const degs = (n: number) => `${n}°`
/** "2m°", "(3t + 5)°", "k°" */
function exprLabel(a: number, l: string, c: number): string {
  const core = `${a === 1 ? '' : a}${l}`
  return c === 0 ? `${core}°` : `(${core} ${c > 0 ? '+' : '−'} ${Math.abs(c)})°`
}
const exprHtml = (a: number, l: string, c: number) => `${a === 1 ? '' : a}${v(l)}${c === 0 ? '' : ` ${c > 0 ? '+' : '−'} ${Math.abs(c)}`}`

/** a triangle A, B, C with angles a and b at A and B, AB along the x-axis */
function triPts(a: number, b: number): Record<string, P> {
  const c = 180 - a - b
  const ac = Math.sin(rad(b)) / Math.sin(rad(c))
  return { A: [0, 0], B: [1, 0], C: [ac * Math.cos(rad(a)), ac * Math.sin(rad(a))] }
}
/** a quadrilateral ABCD (anticlockwise) with the given angles, or null if those angles can't be drawn neatly */
function quadPts(A: number, B: number, C: number, bc: number): Record<string, P> | null {
  const pA: P = [0, 0]
  const pB: P = [1, 0]
  const pC = add(pB, dirP(180 - B, bc))
  // D is where the ray from A (at angle A) meets the ray from C (direction 360 − B − C)
  const u = dirP(A)
  const w = dirP(360 - B - C)
  const den = u[0] * w[1] - u[1] * w[0]
  if (Math.abs(den) < 1e-6) return null
  const d = sub(pC, pA)
  const s = (d[0] * w[1] - d[1] * w[0]) / den
  const t = (d[0] * u[1] - d[1] * u[0]) / den
  if (s <= 0.25 || t <= 0.25) return null
  const pD = add(pA, mulP(u, s))
  const sides = [1, bc, lenP(sub(pD, pC)), s]
  if (Math.max(...sides) / Math.min(...sides) > 3.2) return null
  return { A: pA, B: pB, C: pC, D: pD }
}
/** interior angles of a simple polygon from its points (anticlockwise), reflex ones over 180° */
function interior(ps: P[]): number[] {
  let area = 0
  for (let i = 0; i < ps.length; i++) area += ps[i][0] * ps[(i + 1) % ps.length][1] - ps[(i + 1) % ps.length][0] * ps[i][1]
  const sign = area > 0 ? 1 : -1
  return ps.map((p, i) => {
    const prev = ps[(i + ps.length - 1) % ps.length]
    const next = ps[(i + 1) % ps.length]
    const cross = (p[0] - prev[0]) * (next[1] - p[1]) - (p[1] - prev[1]) * (next[0] - p[0])
    const a = angAt(p, prev, next)
    return cross * sign >= 0 ? a : 360 - a
  })
}

// ================================================================= 6.01 Triangle geometry

interface Shown {
  svg: string
  ask: string // the letter asked for
  value: number
}
/** a triangle with angle labels at A, B and C (null = no mark), equal-side ticks and an optional right angle */
function drawTri(pts: Record<string, P>, labels: (string | null)[], o: { ticks?: [string, string, number][]; right?: string; segs?: [string, string][]; extra?: { at: string; a: string; b: string; text: string }[]; names?: string[] } = {}): string {
  const p = orient(pts, pick(TURNS), chance())
  const corners = ['A', 'B', 'C']
  const angles = corners
    .map((k, i) => ({ at: k, a: corners[(i + 1) % 3], b: corners[(i + 2) % 3], text: labels[i] ?? '' }))
    .filter((x, i) => labels[i] !== null && corners[i] !== o.right)
  return F.fig({
    pts: p,
    polys: [{ v: corners }],
    segs: (o.segs ?? []).map(([a, b]) => ({ a, b })),
    angles: [...angles, ...(o.extra ?? [])],
    ticks: (o.ticks ?? []).map(([a, b, n]) => ({ a, b, n })),
    rights: o.right ? [[corners[(corners.indexOf(o.right) + 1) % 3], o.right, corners[(corners.indexOf(o.right) + 2) % 3]]] : [],
    names: o.names ?? [],
    label: 'Triangle',
  })
}

function triSum(): Question {
  const l = pick(LET)
  const right = chance(0.2)
  const a = right ? 90 : int(25, 110)
  const b = int(20, 160 - a - 20)
  const c = 180 - a - b
  if (c < 20) return triSum()
  const ask = right ? pick([1, 2]) : int(0, 2)
  const vals = [a, b, c]
  const labels = vals.map((x, i) => (i === ask ? `${l}°` : degs(x)))
  const svg0 = drawTri(triPts(a, b), labels, right ? { right: 'A' } : {})
  const known = vals.filter((_, i) => i !== ask)
  return q({
    prompt: `Find the value of ${v(l)}, giving a reason.`,
    diagram: svg0,
    answer: numA(vals[ask]),
    hint: 'The angles of a triangle add to 180°.' + (right ? ' The square marks a right angle: 90°.' : ''),
    steps: [`${v(l)} + ${known[0]} + ${known[1]} = 180 &emsp; (angle sum of a triangle)`, `${v(l)} = 180 − ${known[0]} − ${known[1]} = ${vals[ask]}`],
    meta: { t: 'angles', l },
  })
}

function triIso(): Question {
  const l = pick(LET)
  const kind = pick(['base', 'base', 'apex', 'equi'] as const)
  if (kind === 'equi') {
    const pts = triPts(60, 60)
    return q({
      prompt: `Find the value of ${v(l)}, giving a reason.`,
      diagram: drawTri(pts, [`${l}°`, null, null], { ticks: [['A', 'B', 1], ['B', 'C', 1], ['C', 'A', 1]] }),
      answer: numA(60),
      hint: 'All three sides are equal, so all three angles are equal.',
      steps: ['The triangle is equilateral, so its angles are equal.', `${v(l)} = 180 ÷ 3 = 60`],
      meta: { t: 'angles', l },
    })
  }
  const apex = 2 * int(15, 60) // 30° to 120°: flatter triangles crowd their labels
  const base = (180 - apex) / 2
  // apex at C, equal sides CA and CB
  const pts = triPts(base, base)
  const ticks: [string, string, number][] = [['C', 'A', 1], ['C', 'B', 1]]
  if (kind === 'base') {
    return q({
      prompt: `Find the value of ${v(l)}, giving reasons.`,
      diagram: drawTri(pts, [`${l}°`, `${l}°`, degs(apex)], { ticks }),
      answer: numA(base),
      hint: 'In an isosceles triangle the angles opposite the equal sides are equal.',
      steps: [`The base angles are equal (isosceles triangle), so both are ${v(l)}°.`, `${v(l)} + ${v(l)} + ${apex} = 180 &emsp; (angle sum of a triangle)`, `2${v(l)} = ${180 - apex}, so ${v(l)} = ${base}`],
      meta: { t: 'angles', l },
    })
  }
  return q({
    prompt: `Find the value of ${v(l)}, giving reasons.`,
    diagram: drawTri(pts, [degs(base), null, `${l}°`], { ticks }),
    answer: numA(apex),
    hint: 'In an isosceles triangle the angles opposite the equal sides are equal.',
    steps: [`The other base angle is also ${base}° (isosceles triangle).`, `${v(l)} = 180 − ${base} − ${base} = ${apex} &emsp; (angle sum of a triangle)`],
    meta: { t: 'angles', l },
  })
}

function triClassify(): Question {
  const bySides = chance(0.4)
  if (bySides) {
    const kind = pick(['scalene', 'isosceles', 'equilateral'] as const)
    let a: number
    let b: number
    if (kind === 'equilateral') [a, b] = [60, 60]
    else if (kind === 'isosceles') {
      a = int(25, 80)
      b = chance() ? a : 180 - 2 * a
      if (a === 60) return triClassify()
    } else {
      a = int(25, 80)
      b = int(25, 120 - a)
      if (a === b || 180 - a - b === a || 180 - a - b === b || 180 - a - b < 20) return triClassify()
    }
    const c = 180 - a - b
    return q({
      prompt: `A triangle has angles of ${a}°, ${b}° and ${c}°. What type of triangle is it, by its sides?`,
      answer: mcFixedA(['scalene', 'isosceles', 'equilateral'], kind),
      hint: 'Equal angles are opposite equal sides.',
      steps: [kind === 'equilateral' ? 'All three angles are equal, so all three sides are equal.' : kind === 'isosceles' ? 'Two angles are equal, so the two sides opposite them are equal.' : 'No two angles are equal, so no two sides are equal.', `It is ${kind === 'isosceles' || kind === 'equilateral' ? 'an' : 'a'} ${kind} triangle.`],
      meta: { t: 'classify', by: 'sides', angles: [a, b, c] },
    })
  }
  const kind = pick(['acute-angled', 'obtuse-angled', 'right-angled'] as const)
  const big = kind === 'right-angled' ? 90 : kind === 'obtuse-angled' ? int(95, 150) : int(61, 85)
  const other = int(20, 180 - big - 20)
  const third = 180 - big - other
  if (third < 15 || (kind === 'acute-angled' && (other >= 90 || third >= 90))) return triClassify()
  return q({
    prompt: `A triangle has angles of ${shuffle([big, other, third]).map(degs).join(', ').replace(/, ([^,]*)$/, ' and $1')}. What type of triangle is it, by its angles?`,
    answer: mcFixedA(['acute-angled', 'obtuse-angled', 'right-angled'], kind),
    hint: 'Acute: all angles less than 90°. Obtuse: one angle more than 90°. Right-angled: one angle of 90°.',
    steps: [`The largest angle is ${big}°.`, `It is ${kind === 'acute-angled' || kind === 'obtuse-angled' ? 'an' : 'a'} ${kind} triangle.`],
    meta: { t: 'classify', by: 'angles', angles: [big, other, third] },
  })
}

/** exterior angle at C: the side BC carried on past C to D */
function extPts(a: number, b: number): Record<string, P> {
  const p = triPts(b, 180 - a - b) // base B(0,0)–C(1,0)... renamed below
  // p.A is at the origin with angle b; p.B at (1,0) with angle c; p.C is the apex with angle a
  return { B: p.A, C: p.B, A: p.C, D: [1.55, 0] }
}
function triExt(): Question {
  const l = pick(LET)
  const a = int(30, 100)
  const b = int(25, 150 - a)
  const e = a + b
  if (e >= 170 || 180 - e < 15) return triExt()
  const pts = extPts(a, b)
  const findExt = chance(0.55)
  const p = orient(pts, pick([0, 0, 180, 8, -8]), chance())
  const angles = [
    { at: 'A', a: 'B', b: 'C', text: findExt ? degs(a) : degs(a) },
    { at: 'B', a: 'A', b: 'C', text: findExt ? degs(b) : `${l}°` },
    { at: 'C', a: 'A', b: 'D', text: findExt ? `${l}°` : degs(e) },
  ]
  const diagram = F.fig({ pts: p, polys: [{ v: ['A', 'B', 'C'] }], segs: [{ a: 'C', b: 'D' }], angles, label: 'Triangle with one side extended' })
  return q({
    prompt: `Find the value of ${v(l)}, giving a reason.`,
    diagram,
    answer: numA(findExt ? e : b),
    hint: 'The exterior angle of a triangle equals the sum of the two interior opposite angles.',
    steps: findExt ? [`${v(l)} = ${a} + ${b} &emsp; (exterior angle of a triangle)`, `${v(l)} = ${e}`] : [`${v(l)} + ${a} = ${e} &emsp; (exterior angle of a triangle)`, `${v(l)} = ${e} − ${a} = ${b}`],
    meta: { t: 'angles', l },
  })
}

function triPairs(): Question {
  if (chance()) {
    const x = int(25, 85)
    const equalOne = chance()
    const right = equalOne ? [x, 180 - 2 * x] : (180 - x) % 2 === 0 ? [(180 - x) / 2, (180 - x) / 2] : null
    if (!right || right.some((y) => y <= 0)) return triPairs()
    const show = (pr: number[]) => `${pr[0]}° and ${pr[1]}°`
    const wrongPairs = [equalOne ? [(180 - x) / 2, (180 - x) / 2] : [x, 180 - 2 * x], [x, 180 - x], [90 - x / 2, 90 - x / 2 + 10], [180 - x, x / 2]].filter((pr) => pr.every((y) => y > 0 && Number.isInteger(y)) && show(pr) !== show(right))
    const wrong = Array.from(new Set(wrongPairs.map(show))).slice(0, 3)
    if (wrong.length < 3) return triPairs()
    return q({
      prompt: `One angle of an isosceles triangle is ${x}°, and it ${equalOne ? 'is' : 'is <b>not</b>'} one of the two equal angles. What are the other two angles?`,
      answer: mcA(show(right), wrong),
      hint: 'The two equal angles are opposite the equal sides, and the three angles add to 180°.',
      steps: equalOne ? [`The other equal angle is ${x}°.`, `The third angle is 180 − ${x} − ${x} = ${180 - 2 * x}°.`] : [`The other two angles are equal and add to 180 − ${x} = ${180 - x}°.`, `Each is ${(180 - x) / 2}°.`],
      meta: { t: 'pairs', kind: 'iso', x, equalOne },
    })
  }
  const x = int(20, 70)
  const rest = 180 - x
  const ob = int(91, rest - 10)
  const right = [ob, rest - ob]
  const show = (pr: number[]) => `${pr[0]}° and ${pr[1]}°`
  const wrongs = [[rest / 2, rest / 2], [ob, rest - ob + 10], [ob - 10, rest - ob], [80, rest - 80]].filter((pr) => pr.every((y) => y > 0 && Number.isInteger(y)) && !(pr[0] + pr[1] === rest && Math.max(...pr) > 90))
  const wrong = Array.from(new Set(wrongs.map(show))).filter((w) => w !== show(right)).slice(0, 3)
  if (wrong.length < 3) return triPairs()
  return q({
    prompt: `One angle of an obtuse-angled triangle is ${x}°. Which could be the sizes of the other two angles?`,
    answer: mcA(show(right), wrong),
    hint: 'The other two angles must add to 180° minus the one given, and one of them must be more than 90°.',
    steps: [`The other two angles add to 180 − ${x} = ${rest}°.`, `One must be obtuse (more than 90°): ${show(right)}.`],
    meta: { t: 'pairs', kind: 'obtuse', x },
  })
}

function triAlg(three = false): Question {
  for (;;) {
    const l = pick(LET)
    if (three) {
      const cs = sample([1, 2, 3, 4, 5, 6], 3)
      const sum = cs[0] + cs[1] + cs[2]
      if (180 % sum) continue
      const x = 180 / sum
      const angs = cs.map((c) => c * x)
      if (angs.some((y) => y < 15)) continue
      const pts = triPts(angs[0], angs[1])
      return q({
        prompt: `Find the value of ${v(l)}, giving a reason.`,
        diagram: drawTri(pts, cs.map((c) => exprLabel(c, l, 0))),
        answer: numA(x),
        hint: 'Add the three angles and make the sum equal to 180°.',
        steps: [`${cs.map((c) => exprHtml(c, l, 0)).join(' + ')} = 180 &emsp; (angle sum of a triangle)`, `${sum}${v(l)} = 180`, `${v(l)} = ${x}`],
        meta: { t: 'angles', l },
      })
    }
    const x = int(8, 35)
    const a1 = int(1, 4)
    const c1 = pick([0, int(-15, 25)])
    const a2 = int(1, 3)
    const c2 = pick([0, 0, int(-10, 20)])
    const e1 = a1 * x + c1
    const e2 = a2 * x + c2
    const third = 180 - e1 - e2
    if (e1 < 20 || e2 < 20 || third < 20 || (a1 === 1 && c1 === 0 && a2 === 1 && c2 === 0)) continue
    const order = shuffle([0, 1, 2])
    const labs = [exprLabel(a1, l, c1), exprLabel(a2, l, c2), degs(third)]
    const sizes = [e1, e2, third]
    const L = order.map((i) => labs[i])
    const S = order.map((i) => sizes[i])
    return q({
      prompt: `Find the value of ${v(l)}, giving a reason.`,
      diagram: drawTri(triPts(S[0], S[1]), L),
      answer: numA(x),
      hint: 'The three angles add to 180°: write an equation and solve it.',
      steps: [`${exprHtml(a1, l, c1)} + ${exprHtml(a2, l, c2)} + ${third} = 180 &emsp; (angle sum of a triangle)`, `${a1 + a2}${v(l)} + ${c1 + c2 + third} = 180`, `${a1 + a2}${v(l)} = ${180 - c1 - c2 - third}`, `${v(l)} = ${x}`],
      meta: { t: 'angles', l },
    })
  }
}

/** the two sides through C carried on past C: the vertically opposite angle sits outside the triangle */
function triVertOpp(): Question {
  const l = pick(LET)
  const a = int(30, 80)
  const c = int(35, 95)
  const b = 180 - a - c
  if (b < 25) return triVertOpp()
  const t = triPts(a, b)
  const C = t.C
  const D = add(C, mulP(unit(sub(C, t.A)), 0.45))
  const E = add(C, mulP(unit(sub(C, t.B)), 0.45))
  const askExt = chance(0.35)
  const pts: Record<string, P> = { ...t, D, E }
  if (askExt) pts.F = [1.5, 0]
  const p = orient(pts, pick([0, 0, 180]), chance())
  const angles = [
    { at: 'A', a: 'B', b: 'C', text: degs(a) },
    { at: 'C', a: 'D', b: 'E', text: degs(c) },
    askExt ? { at: 'B', a: 'C', b: 'F', text: `${l}°` } : { at: 'B', a: 'A', b: 'C', text: `${l}°` },
  ]
  const segs = [{ a: 'C', b: 'D' }, { a: 'C', b: 'E' }, ...(askExt ? [{ a: 'B', b: 'F' }] : [])]
  const value = askExt ? a + c : b
  return q({
    prompt: `Find the value of ${v(l)}, giving reasons.`,
    diagram: F.fig({ pts: p, polys: [{ v: ['A', 'B', 'C'] }], segs, angles, label: 'Triangle with two sides extended' }),
    answer: numA(value),
    hint: 'Vertically opposite angles are equal. Then use the triangle.',
    steps: [`The angle inside the triangle at the top is ${c}° (vertically opposite angles).`, askExt ? `${v(l)} = ${a} + ${c} = ${value} &emsp; (exterior angle of a triangle)` : `${v(l)} = 180 − ${a} − ${c} = ${value} &emsp; (angle sum of a triangle)`],
    meta: { t: 'angles', l },
  })
}

function triExtIso(): Question {
  const l = pick(LET)
  const base = int(35, 80)
  const e = 180 - base
  const apex = 180 - 2 * base
  const t = triPts(base, base)
  const pts: Record<string, P> = { ...t, D: [1.5, 0] }
  const p = orient(pts, pick([0, 0, 180]), chance())
  return q({
    prompt: `Find the value of ${v(l)}, giving reasons.`,
    diagram: F.fig({ pts: p, polys: [{ v: ['A', 'B', 'C'] }], segs: [{ a: 'B', b: 'D' }], angles: [{ at: 'B', a: 'C', b: 'D', text: degs(e) }, { at: 'C', a: 'A', b: 'B', text: `${l}°` }], ticks: [{ a: 'C', b: 'A', n: 1 }, { a: 'C', b: 'B', n: 1 }], label: 'Isosceles triangle with the base extended' }),
    answer: numA(apex),
    hint: 'First find the angle inside the triangle next to the given angle (angles on a straight line). The base angles are equal.',
    steps: [`Inside the triangle at the base: 180 − ${e} = ${base}° (angles on a straight line).`, `The other base angle is also ${base}° (isosceles triangle).`, `${v(l)} = 180 − ${base} − ${base} = ${apex} &emsp; (angle sum of a triangle)`],
    meta: { t: 'angles', l },
  })
}

const ex601 = (level: Level): Question => {
  if (level === 1) {
    const r = random()
    return r < 0.45 ? triSum() : r < 0.8 ? triIso() : triClassify()
  }
  if (level === 2) {
    const r = random()
    return r < 0.45 ? triExt() : r < 0.75 ? triAlg() : triPairs()
  }
  const r = random()
  return r < 0.4 ? triVertOpp() : r < 0.7 ? triExtIso() : triAlg(true)
}

// ================================================================= 6.02 Quadrilateral geometry

function drawQuad(pts: Record<string, P>, labels: (string | null)[], o: { ticks?: [string, string, number][]; arrows?: [string, string, number][]; reflex?: number; names?: boolean; segs?: [string, string][] } = {}): string {
  const p = orient(pts, pick([0, 0, 0, 180, 6, -6]), chance())
  const ks = ['A', 'B', 'C', 'D']
  const angles = ks
    .map((k, i) => ({ at: k, a: ks[(i + 3) % 4], b: ks[(i + 1) % 4], text: labels[i] ?? '', reflex: o.reflex === i }))
    .filter((_, i) => labels[i] !== null)
  return F.fig({
    pts: p,
    polys: [{ v: ks }],
    angles,
    ticks: (o.ticks ?? []).map(([a, b, n]) => ({ a, b, n })),
    arrows: (o.arrows ?? []).map(([a, b, n]) => ({ a, b, n })),
    segs: (o.segs ?? []).map(([a, b]) => ({ a, b })),
    names: o.names ? ks : [],
    label: 'Quadrilateral',
  })
}

function quadSum(): Question {
  for (;;) {
    const l = pick(LET)
    const A = int(55, 140)
    const B = int(55, 140)
    const C = int(55, 140)
    const D = 360 - A - B - C
    if (D < 45 || D > 160) continue
    const pts = quadPts(A, B, C, 0.6 + random() * 0.8)
    if (!pts) continue
    const ask = int(0, 3)
    const vals = [A, B, C, D]
    const known = vals.filter((_, i) => i !== ask)
    return q({
      prompt: `Find the value of ${v(l)}, giving a reason.`,
      diagram: drawQuad(pts, vals.map((x, i) => (i === ask ? `${l}°` : degs(x)))),
      answer: numA(vals[ask]),
      hint: 'The angles of a quadrilateral add to 360°.',
      steps: [`${v(l)} + ${known.join(' + ')} = 360 &emsp; (angle sum of a quadrilateral)`, `${v(l)} = 360 − ${known.join(' − ')} = ${vals[ask]}`],
      meta: { t: 'angles', l },
    })
  }
}

function quadAlg(): Question {
  for (;;) {
    const l = pick(LET)
    const x = int(15, 45)
    const k1 = int(1, 4)
    const k2 = int(1, 4)
    const n1 = int(60, 130)
    const angs = [k1 * x, k2 * x, n1]
    const d = 360 - angs[0] - angs[1] - n1
    if (angs.some((y) => y < 45 || y > 165) || d < 45 || d > 165 || k1 === k2) continue
    const vals = [...angs, d]
    const order = shuffle([0, 1, 2, 3])
    const sizes = order.map((i) => vals[i])
    const pts = quadPts(sizes[0], sizes[1], sizes[2], 0.6 + random() * 0.8)
    if (!pts) continue
    const labs = [exprLabel(k1, l, 0), exprLabel(k2, l, 0), degs(n1), degs(d)]
    return q({
      prompt: `Find the value of ${v(l)}, giving a reason.`,
      diagram: drawQuad(pts, order.map((i) => labs[i])),
      answer: numA(x),
      hint: 'The four angles add to 360°: write an equation and solve it.',
      steps: [`${exprHtml(k1, l, 0)} + ${exprHtml(k2, l, 0)} + ${n1} + ${d} = 360 &emsp; (angle sum of a quadrilateral)`, `${k1 + k2}${v(l)} = ${360 - n1 - d}`, `${v(l)} = ${x}`],
      meta: { t: 'angles', l },
    })
  }
}

function quadReflex(): Question {
  for (;;) {
    const l = pick(LET)
    const A = int(25, 60)
    const B = int(25, 60)
    const C = int(25, 60)
    const D = 360 - A - B - C
    if (D <= 190 || D >= 290) continue
    const pts = quadPts(A, B, C, 0.6 + random() * 0.6)
    if (!pts) continue
    const got = interior(['A', 'B', 'C', 'D'].map((k) => pts[k]))
    if ([A, B, C, D].some((x, i) => Math.abs(got[i] - x) > 0.01)) continue
    const ask = int(0, 3)
    const vals = [A, B, C, D]
    const known = vals.filter((_, i) => i !== ask)
    return q({
      prompt: `This quadrilateral is non-convex. Find the value of ${v(l)}, giving a reason.`,
      diagram: drawQuad(pts, vals.map((x, i) => (i === ask ? `${l}°` : degs(x))), { reflex: 3 }),
      answer: numA(vals[ask]),
      hint: 'The angles of any quadrilateral, convex or not, add to 360°. One angle here is reflex (more than 180°).',
      steps: [`${v(l)} + ${known.join(' + ')} = 360 &emsp; (angle sum of a quadrilateral)`, `${v(l)} = ${vals[ask]}`],
      meta: { t: 'angles', l },
    })
  }
}

function quadSpecial(): Question {
  const l = pick(LET)
  const kind = pick(['para', 'para', 'rhombus', 'kite', 'trap'] as const)
  if (kind === 'para' || kind === 'rhombus') {
    const a = int(45, 80)
    const big = 180 - a
    const pts = kind === 'rhombus' ? quadPts(a, big, a, 1) : quadPts(a, big, a, 0.55 + random() * 0.7)
    if (!pts) return quadSpecial()
    const ask = int(1, 3)
    const vals = [a, big, a, big]
    const labels: (string | null)[] = vals.map((x, i) => (i === 0 ? degs(x) : i === ask ? `${l}°` : null))
    const ticks: [string, string, number][] = kind === 'rhombus' ? [['A', 'B', 1], ['B', 'C', 1], ['C', 'D', 1], ['D', 'A', 1]] : []
    const arrows: [string, string, number][] = [['A', 'B', 1], ['D', 'C', 1], ['A', 'D', 2], ['B', 'C', 2]]
    const opposite = ask === 2
    return q({
      prompt: `${kind === 'rhombus' ? 'This is a rhombus.' : 'This is a parallelogram.'} Find the value of ${v(l)}, giving a reason.`,
      diagram: drawQuad(pts, labels, { ticks, arrows }),
      answer: numA(vals[ask]),
      hint: opposite ? 'Opposite angles of a parallelogram (and a rhombus) are equal.' : 'Next to each other, the angles are co-interior angles between parallel lines, so they add to 180°.',
      steps: [opposite ? `${v(l)} = ${a} &emsp; (opposite angles of a ${kind === 'rhombus' ? 'rhombus' : 'parallelogram'} are equal)` : `${v(l)} + ${a} = 180 &emsp; (co-interior angles, parallel lines)`, `${v(l)} = ${vals[ask]}`],
      meta: { t: 'angles', l },
    })
  }
  if (kind === 'kite') {
    // apex T at the top, bottom U; the side angles at L and R are equal
    const t = 2 * int(25, 60)
    const u = 2 * int(30, 75)
    const side = (360 - t - u) / 2
    if (side < 40 || side > 160) return quadSpecial()
    const w = 1
    const pts: Record<string, P> = { A: [0, -w / Math.tan(rad(u / 2))], B: [w, 0], C: [0, w / Math.tan(rad(t / 2))], D: [-w, 0] }
    const askSide = chance(0.6)
    const vals = [u, side, t, side]
    const labels: (string | null)[] = askSide ? [degs(u), `${l}°`, degs(t), null] : [`${l}°`, degs(side), degs(t), null]
    return q({
      prompt: `This is a kite. Find the value of ${v(l)}, giving reasons.`,
      diagram: drawQuad(pts, labels, { ticks: [['A', 'B', 1], ['A', 'D', 1], ['C', 'B', 2], ['C', 'D', 2]] }),
      answer: numA(askSide ? side : u),
      hint: 'A kite has one pair of opposite angles equal: the angles between the unequal sides. All four angles add to 360°.',
      steps: askSide ? [`The two angles between the unequal sides are equal (kite), so both are ${v(l)}°.`, `2${v(l)} + ${t} + ${u} = 360`, `${v(l)} = ${side}`] : [`The angle opposite ${v(l)}° is not one of the equal ones; the other side angle is also ${side}° (kite).`, `${v(l)} = 360 − ${t} − ${side} − ${side} = ${u}`],
      meta: { t: 'angles', l, vals },
    })
  }
  // isosceles trapezium: base angles equal
  const a = int(50, 80)
  const b = 180 - a
  const pts = quadPts(a, a, b, 0.6 + random() * 0.4)
  if (!pts) return quadSpecial()
  const ask = pick([1, 2, 3])
  const vals = [a, a, b, b]
  const labels: (string | null)[] = vals.map((x, i) => (i === 0 ? degs(x) : i === ask ? `${l}°` : null))
  return q({
    prompt: `This is an isosceles trapezium. Find the value of ${v(l)}, giving a reason.`,
    diagram: drawQuad(pts, labels, { ticks: [['B', 'C', 1], ['A', 'D', 1]], arrows: [['A', 'B', 1], ['D', 'C', 1]] }),
    answer: numA(vals[ask]),
    hint: 'The base angles of an isosceles trapezium are equal, and co-interior angles between the parallel sides add to 180°.',
    steps: [ask === 1 ? `${v(l)} = ${a} &emsp; (base angles of an isosceles trapezium are equal)` : `${v(l)} + ${a} = 180 &emsp; (co-interior angles, parallel lines)`, `${v(l)} = ${vals[ask]}`],
    meta: { t: 'angles', l },
  })
}

type Quad = 'trapezium' | 'kite' | 'parallelogram' | 'rhombus' | 'rectangle' | 'square'
const QUADS: Quad[] = ['trapezium', 'kite', 'parallelogram', 'rhombus', 'rectangle', 'square']
/** which of the six special quadrilaterals always have each property (as in the textbook’s table) */
const PROPS: [string, Quad[]][] = [
  ['both pairs of opposite sides parallel', ['parallelogram', 'rhombus', 'rectangle', 'square']],
  ['all sides equal', ['rhombus', 'square']],
  ['equal diagonals', ['rectangle', 'square']],
  ['diagonals that bisect each other', ['parallelogram', 'rhombus', 'rectangle', 'square']],
  ['diagonals that meet at right angles', ['kite', 'rhombus', 'square']],
  ['all angles 90°', ['rectangle', 'square']],
  ['exactly one pair of opposite angles equal', ['kite']],
  ['exactly one pair of parallel sides', ['trapezium']],
  ['four axes of symmetry', ['square']],
  ['exactly one axis of symmetry', ['kite']],
  ['diagonals that bisect the angles at the corners', ['rhombus', 'square']],
  ['two pairs of equal adjacent sides', ['kite', 'rhombus', 'square']],
]
function quadName(): Question {
  for (;;) {
    const [prop, has] = pick(PROPS)
    const right = pick(has)
    const wrong = sample(QUADS.filter((x) => !has.includes(x)), 3)
    if (wrong.length < 3) continue
    return q({
      prompt: `Which of these quadrilaterals always has ${prop}?`,
      answer: mcA(right, wrong),
      hint: 'Think about the properties of each special quadrilateral: sides, angles, diagonals and symmetry.',
      steps: [`The quadrilaterals with ${prop}: ${has.join(', ')}.`, `Of the choices, only the ${right} has it.`],
      meta: { t: 'quadName', prop, right },
    })
  }
}
const STATEMENTS: [string, boolean][] = [
  ['A rhombus is a parallelogram.', true],
  ['A square is a rhombus.', true],
  ['A square is a rectangle.', true],
  ['A rectangle is a parallelogram.', true],
  ['The opposite angles of a rhombus are equal.', true],
  ['The diagonals of a rectangle are equal.', true],
  ['The diagonals of a kite meet at right angles.', true],
  ['The diagonals of a parallelogram meet at right angles.', false],
  ['The diagonals of a rhombus are equal.', false],
  ['A trapezium has two pairs of parallel sides.', false],
  ['A rectangle is a rhombus.', false],
  ['A kite is a parallelogram.', false],
  ['All the angles of a rhombus are 90°.', false],
  ['The diagonals of a trapezium bisect each other.', false],
]
function quadStatement(): Question {
  const findTrue = chance()
  const right = pick(STATEMENTS.filter(([, t]) => t === findTrue))
  const wrong = sample(STATEMENTS.filter(([, t]) => t !== findTrue), 3)
  return q({
    prompt: `Which statement is ${findTrue ? 'always true' : '<b>false</b>'}?`,
    answer: mcA(right[0], wrong.map((w) => w[0])),
    hint: 'A square is a special rhombus and a special rectangle; rhombuses and rectangles are special parallelograms.',
    steps: [`“${right[0]}” is ${findTrue ? 'always true' : 'false'}.`],
    meta: { t: 'statement', s: right[0], truth: findTrue },
  })
}

/** Points A, B, C on a line; △ABE isosceles (EA = EB); find ∠BED in quadrilateral BCDE */
function quadCompound(): Question {
  for (;;) {
    const al = int(55, 75) // base angle at A
    const g = int(70, 110) // angle at C in BCDE
    const d0 = int(95, 125) // angle at D
    const eAng = 360 - (180 - al) - g - d0 // angle BED
    if (eAng < 35 || eAng > 120) continue
    const A: P = [0, 0]
    const B: P = [2, 0]
    const E: P = [1, Math.tan(rad(al))]
    const C: P = [2 + 1.4 + random() * 0.8, 0]
    // D on the ray from C with the angle at D equal to d0 (search along the ray)
    const dirCD = dirP(180 - g)
    let lo = 0.2
    let hi = 6
    const angD = (t: number) => {
      const D = add(C, mulP(dirCD, t))
      return angAt(D, C, E)
    }
    if ((angD(lo) - d0) * (angD(hi) - d0) > 0) continue
    for (let k = 0; k < 60; k++) {
      const mid = (lo + hi) / 2
      if ((angD(lo) - d0) * (angD(mid) - d0) <= 0) hi = mid
      else lo = mid
    }
    const D = add(C, mulP(dirCD, (lo + hi) / 2))
    const got = interior([B, C, D, E])
    if (Math.abs(got[3] - eAng) > 0.05 || got.some((x) => x >= 179)) continue
    const p = orient({ A, B, C, D, E }, 0, chance())
    return q({
      prompt: `A, B and C lie on a straight line and EA = EB. Find the size of ∠BED, giving reasons.`,
      diagram: F.fig({
        pts: p,
        polys: [{ v: ['A', 'B', 'E'] }, { v: ['B', 'C', 'D', 'E'] }],
        angles: [{ at: 'A', a: 'B', b: 'E', text: degs(al) }, { at: 'C', a: 'B', b: 'D', text: degs(g) }, { at: 'D', a: 'C', b: 'E', text: degs(d0) }],
        ticks: [{ a: 'E', b: 'A', n: 1 }, { a: 'E', b: 'B', n: 1 }],
        names: ['A', 'B', 'C', 'D', 'E'],
        label: 'Isosceles triangle next to a quadrilateral',
      }),
      answer: numA(eAng),
      suffix: '°',
      hint: 'Find ∠ABE (isosceles triangle), then ∠EBC (angles on a straight line), then use the angle sum of quadrilateral BCDE.',
      steps: [`∠ABE = ${al}° &emsp; (equal angles of isosceles △ABE)`, `∠EBC = 180° − ${al}° = ${180 - al}° &emsp; (angles on a straight line)`, `∠BED = 360° − ${180 - al}° − ${g}° − ${d0}° = ${eAng}° &emsp; (angle sum of quadrilateral BCDE)`],
      meta: { t: 'named', at: 'E', from: 'B', to: 'D' },
    })
  }
}

function paraExtended(): Question {
  const l = pick(LET)
  const e = int(50, 80)
  const B = 180 - e
  const A = e
  const pts = quadPts(A, B, A, 0.6 + random() * 0.6)
  if (!pts) return paraExtended()
  const Ept = add(pts.B, mulP(unit(sub(pts.B, pts.A)), 0.5))
  const all = orient({ ...pts, E: Ept }, pick([0, 0, 180]), chance())
  return q({
    prompt: `ABCD is a parallelogram and AB is extended to E. Find the value of ${v(l)}, giving reasons.`,
    diagram: F.fig({ pts: all, polys: [{ v: ['A', 'B', 'C', 'D'] }], segs: [{ a: 'B', b: 'E' }], angles: [{ at: 'B', a: 'C', b: 'E', text: degs(e) }, { at: 'D', a: 'A', b: 'C', text: `${l}°` }], arrows: [{ a: 'A', b: 'B', n: 1 }, { a: 'D', b: 'C', n: 1 }, { a: 'A', b: 'D', n: 2 }, { a: 'B', b: 'C', n: 2 }], names: ['A', 'B', 'C', 'D', 'E'], label: 'Parallelogram with one side extended' }),
    answer: numA(B),
    hint: 'Find ∠ABC first (angles on a straight line), then use the opposite angles of the parallelogram.',
    steps: [`∠ABC = 180 − ${e} = ${B}° &emsp; (angles on a straight line)`, `${v(l)} = ${B} &emsp; (opposite angles of a parallelogram are equal)`],
    meta: { t: 'angles', l },
  })
}

const ex602 = (level: Level): Question => {
  if (level === 1) {
    const r = random()
    return r < 0.5 ? quadSum() : r < 0.8 ? quadAlg() : quadReflex()
  }
  if (level === 2) {
    const r = random()
    return r < 0.55 ? quadSpecial() : r < 0.8 ? quadName() : quadStatement()
  }
  return chance(0.55) ? quadCompound() : paraExtended()
}

// ================================================================= 6.03 and 6.04 Networks (Path)

interface Net {
  names: string[]
  pos: P[]
  edges: [number, number][] // a loop is [i, i]; a repeated pair is a second edge between the same vertices
}
const NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
function randomNet(n: number, extra: number, o: { loops?: boolean; multi?: boolean } = {}): Net {
  const pos: P[] = []
  const turn = random() * 360
  for (let i = 0; i < n; i++) {
    const a = turn + (360 * i) / n + (random() - 0.5) * 18
    const r = 1 + (random() - 0.5) * 0.25
    pos.push(dirP(a, r))
  }
  const edges: [number, number][] = []
  const has = (a: number, b: number) => edges.some(([x, y]) => (x === a && y === b) || (x === b && y === a))
  // a spanning tree so it is connected, then extra edges
  const order = shuffle(Array.from({ length: n }, (_, i) => i))
  for (let i = 1; i < n; i++) edges.push([order[i], order[int(0, i - 1)]])
  let tries = 0
  while (edges.length < n - 1 + extra && tries++ < 200) {
    const a = int(0, n - 1)
    const b = int(0, n - 1)
    if (a !== b && !has(a, b)) edges.push([a, b])
  }
  if (o.loops && chance(0.6)) {
    const i0 = int(0, n - 1)
    edges.push([i0, i0])
  }
  if (o.multi && chance(0.5)) edges.push([...edges[int(0, n - 2)]] as [number, number])
  // no edge may pass close to a vertex it doesn't join, or it could be read as joining it
  for (const [a, b] of edges) {
    if (a === b) continue
    for (let k = 0; k < n; k++) if (k !== a && k !== b && segDist(pos[k], pos[a], pos[b]) < 0.22) return randomNet(n, extra, o)
  }
  return { names: NAMES.slice(0, n), pos, edges }
}
/** the distance from p to the segment a–b */
function segDist(p: P, a: P, b: P): number {
  const d = sub(b, a)
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * d[0] + (p[1] - a[1]) * d[1]) / (d[0] * d[0] + d[1] * d[1])))
  return lenP(sub(p, add(a, mulP(d, t))))
}
/** a connected network drawn with no edges crossing: a polygon with chords that don't cross */
function planarNet(n: number, chords: number): Net {
  const pos: P[] = []
  const turn = random() * 360
  for (let i = 0; i < n; i++) pos.push(dirP(turn + (360 * i) / n, 1))
  const edges: [number, number][] = []
  for (let i = 0; i < n; i++) edges.push([i, (i + 1) % n])
  const crosses = (a: number, b: number, c: number, d: number) => {
    const inside = (x: number) => (x - a + n) % n > 0 && (x - a + n) % n < (b - a + n) % n
    if ([c, d].some((x) => x === a || x === b)) return false
    return inside(c) !== inside(d)
  }
  let tries = 0
  while (edges.length < n + chords && tries++ < 300) {
    const a = int(0, n - 1)
    const b = int(0, n - 1)
    const gap = (b - a + n) % n
    if (gap < 2 || gap > n - 2) continue
    if (edges.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) continue
    if (edges.slice(n).some(([c, d]) => crosses(a, b, c, d))) continue
    edges.push([a, b])
  }
  return { names: NAMES.slice(0, n), pos, edges }
}
function drawNet(g: Net): string {
  const W = 300
  const H = 230
  const xs = g.pos.map((p) => p[0])
  const ys = g.pos.map((p) => p[1])
  const s = Math.min((W - 90) / (Math.max(...xs) - Math.min(...xs) || 1), (H - 90) / (Math.max(...ys) - Math.min(...ys) || 1))
  const cx = (Math.max(...xs) + Math.min(...xs)) / 2
  const cy = (Math.max(...ys) + Math.min(...ys)) / 2
  const S = g.pos.map((p): P => [W / 2 + (p[0] - cx) * s, H / 2 - (p[1] - cy) * s])
  const centre: P = [W / 2, H / 2]
  let body = ''
  const seen: Record<string, number> = {}
  for (const [a, b] of g.edges) {
    if (a === b) {
      const out = unit(sub(S[a], centre))
      const c = add(S[a], mulP(out, 13))
      body += `<circle class="ln edge" cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="13"/>`
      continue
    }
    const key = [a, b].sort().join('-')
    seen[key] = (seen[key] ?? 0) + 1
    if (seen[key] === 1) body += line(S[a], S[b], 'ln edge')
    else {
      const m = mulP(add(S[a], S[b]), 0.5)
      const d = unit(sub(S[b], S[a]))
      const c = add(m, mulP([-d[1], d[0]], 26))
      body += `<path class="ln edge" d="M${S[a][0].toFixed(1)},${S[a][1].toFixed(1)} Q${c[0].toFixed(1)},${c[1].toFixed(1)} ${S[b][0].toFixed(1)},${S[b][1].toFixed(1)}"/>`
    }
  }
  S.forEach((p, i) => {
    body += dot(p, 4.5, 'pt vtx')
    const out = unit(sub(p, centre))
    const loop = g.edges.some(([a, b]) => a === i && b === i)
    body += text(add(p, mulP(loop ? [-out[1], out[0]] : out, 17)), g.names[i], 'dl vx')
  })
  return svg(W, H, body, 'Network')
}
const degree = (g: Net, i: number) => g.edges.reduce((s, [a, b]) => s + (a === i ? 1 : 0) + (b === i ? 1 : 0), 0)

function netCount(): Question {
  const g = randomNet(int(4, 7), int(0, 3), { loops: true, multi: true })
  const what = pick(['vertices', 'edges', 'degree', 'degree'] as const)
  if (what === 'degree') {
    const i = int(0, g.names.length - 1)
    const loop = g.edges.some(([a, b]) => a === i && b === i)
    return q({
      prompt: `What is the degree of vertex ${g.names[i]}?`,
      diagram: drawNet(g),
      answer: numA(degree(g, i)),
      hint: 'Count the edges that meet at the vertex. A loop counts as 2.',
      steps: [`Edges at ${g.names[i]}: ${degree(g, i)}${loop ? ' (the loop counts twice)' : ''}.`],
      meta: { t: 'net', what, i, g },
    })
  }
  const n = what === 'vertices' ? g.names.length : g.edges.length
  return q({
    prompt: `How many ${what} does this network have?`,
    diagram: drawNet(g),
    answer: numA(n),
    hint: what === 'vertices' ? 'Vertices are the dots.' : 'Edges are the lines joining vertices, including any loops and repeated edges.',
    steps: [`There are ${n} ${what}.`],
    meta: { t: 'net', what, g },
  })
}
function netDegrees(): Question {
  const g = randomNet(int(5, 7), int(1, 4), { loops: true })
  const kind = pick(['odd', 'even', 'sum'] as const)
  const ds = g.names.map((_, i) => degree(g, i))
  const odd = ds.filter((x) => x % 2).length
  const value = kind === 'odd' ? odd : kind === 'even' ? ds.length - odd : ds.reduce((s, x) => s + x, 0)
  return q({
    prompt: kind === 'sum' ? 'What is the sum of the degrees of all the vertices?' : `How many ${kind} vertices does this network have?`,
    diagram: drawNet(g),
    answer: numA(value),
    hint: kind === 'sum' ? 'The sum of the degrees is always twice the number of edges.' : `An ${kind} vertex has an ${kind} number of edges meeting at it (a loop counts as 2).`,
    steps: [`Degrees: ${g.names.map((nm, i) => `${nm} ${ds[i]}`).join(', ')}.`, kind === 'sum' ? `Sum = ${value} = 2 × ${g.edges.length} edges.` : `${value} ${kind} vertices.`],
    meta: { t: 'net', what: kind, g },
  })
}
type WalkKind = 'path' | 'trail' | 'cycle' | 'circuit' | 'walk'
function classifyWalk(w: number[]): WalkKind {
  const closed = w[0] === w[w.length - 1]
  const edgeKeys = w.slice(1).map((x, i) => [w[i], x].sort().join('-'))
  const repeatedEdge = new Set(edgeKeys).size !== edgeKeys.length
  const inner = closed ? w.slice(0, -1) : w
  const repeatedVertex = new Set(inner).size !== inner.length
  if (repeatedEdge) return 'walk'
  if (closed) return repeatedVertex ? 'circuit' : 'cycle'
  return repeatedVertex ? 'trail' : 'path'
}
function netWalk(): Question {
  const g = randomNet(int(5, 6), int(3, 5))
  const adj = (i: number) => g.edges.filter(([a, b]) => a !== b && (a === i || b === i)).map(([a, b]) => (a === i ? b : a))
  const want = pick(['path', 'trail', 'cycle', 'circuit'] as WalkKind[])
  for (let tries = 0; tries < 400; tries++) {
    const len = int(3, 7)
    const w = [int(0, g.names.length - 1)]
    for (let k = 0; k < len; k++) w.push(pick(adj(w[w.length - 1])))
    if ((want === 'cycle' || want === 'circuit') && w[0] !== w[w.length - 1]) continue
    if (classifyWalk(w) !== want) continue
    const name = w.map((i) => g.names[i]).join('')
    const opts: WalkKind[] = ['path', 'trail', 'cycle', 'circuit']
    return q({
      prompt: `Which best describes the walk ${name}?`,
      diagram: drawNet(g),
      answer: mcFixedA(opts.map((o) => `a ${o}`), `a ${want}`),
      hint: 'Trail: no edge repeated. Path: no vertex repeated. A circuit is a closed trail; a cycle is a closed path (it starts and ends at the same vertex).',
      steps: [want === 'path' ? 'No vertex is repeated, so it is a path.' : want === 'trail' ? 'A vertex is repeated but no edge is, so it is a trail (not a path).' : want === 'cycle' ? 'It starts and ends at the same vertex with no other vertex repeated: a cycle.' : 'It starts and ends at the same vertex; a vertex is repeated but no edge is: a circuit.'],
      meta: { t: 'walk', g, w },
    })
  }
  return netWalk()
}
function netFriends(): Question {
  const people = sample(['Ari', 'Bec', 'Cal', 'Dev', 'Eli', 'Fay', 'Gus'], int(5, 6))
  const g = randomNet(people.length, int(2, 4))
  g.names = people.map((p) => p[0])
  const i = int(0, people.length - 1)
  const lines = people.map((p, k) => {
    const fr = g.edges.filter(([a, b]) => a === k || b === k).map(([a, b]) => people[a === k ? b : a])
    return `${p} is friends with ${fr.join(', ').replace(/, ([^,]*)$/, ' and $1')}.`
  })
  const not = people.filter((_, k) => k !== i && !g.edges.some(([a, b]) => (a === i && b === k) || (a === k && b === i)))
  const friends = people.filter((p, k) => k !== i && !not.includes(p))
  const askDeg = chance() || !not.length || friends.length < 3
  return q({
    prompt: `${lines.join(' ')} ${askDeg ? `In a network of these friendships, what is the degree of ${people[i]}’s vertex?` : `Who is <b>not</b> a friend of ${people[i]}?`}`,
    answer: askDeg ? numA(degree(g, i)) : mcA(pick(not), sample(friends, 3)),
    hint: 'Draw a vertex for each person and an edge for each friendship.',
    steps: [askDeg ? `${people[i]} has ${degree(g, i)} friends, so the degree is ${degree(g, i)}.` : `${people[i]}’s friends are listed; the others are not friends.`],
    meta: { t: 'friends', g, i, people, askDeg },
  })
}
function netFaces(): Question {
  const n = int(4, 7)
  const g = planarNet(n, int(1, n - 3))
  return q({
    prompt: 'How many faces does this network have? (Remember the outside region.)',
    diagram: drawNet(g),
    answer: numA(g.edges.length - n + 2),
    hint: 'A face is a region bounded by edges. The region outside the network counts as a face too.',
    steps: [`There are ${g.edges.length - n + 1} regions inside, plus the outside face: ${g.edges.length - n + 2} faces.`],
    meta: { t: 'faces', g },
  })
}
const ex603 = (level: Level): Question => (level === 1 ? netCount() : level === 2 ? (chance() ? netDegrees() : netFriends()) : chance(0.6) ? netWalk() : netFaces())

function netEuler(): Question {
  const v0 = int(4, 12)
  const f0 = int(2, 10)
  const e0 = v0 + f0 - 2
  const ask = pick(['v', 'e', 'f'] as const)
  const val = { v: v0, e: e0, f: f0 }[ask]
  const word = { v: 'vertices', e: 'edges', f: 'faces' }
  const given = (['v', 'e', 'f'] as const).filter((k) => k !== ask)
  return q({
    prompt: `A planar graph has ${given.map((k) => `${{ v: v0, e: e0, f: f0 }[k]} ${word[k]}`).join(' and ')}. How many ${word[ask]} does it have?`,
    answer: numA(val),
    hint: 'Euler’s formula for planar graphs: v − e + f = 2.',
    steps: [`v − e + f = 2`, `${ask === 'v' ? v(ask) : v0} − ${ask === 'e' ? v(ask) : e0} + ${ask === 'f' ? v(ask) : f0} = 2`, `${v(ask)} = ${val}`],
    meta: { t: 'euler', v: v0, e: e0, f: f0, ask },
  })
}
function netConnected(): Question {
  const connected = chance()
  let g: Net
  if (connected) g = randomNet(int(5, 7), int(0, 3))
  else {
    const a = randomNet(int(2, 4), int(0, 1))
    const b = randomNet(int(2, 3), int(0, 1))
    const shiftB = b.pos.map((p): P => [p[0] * 0.7 + 2.6, p[1] * 0.7])
    g = { names: NAMES.slice(0, a.names.length + b.names.length), pos: [...a.pos.map((p): P => [p[0] * 0.8, p[1] * 0.8]), ...shiftB], edges: [...a.edges, ...b.edges.map(([x, y]) => [x + a.names.length, y + a.names.length] as [number, number])] }
  }
  return q({
    prompt: 'Is this network connected?',
    diagram: drawNet(g),
    answer: mcFixedA(['Yes', 'No'], connected ? 'Yes' : 'No'),
    hint: 'A network is connected if there is a path between every pair of vertices.',
    steps: [connected ? 'You can get from any vertex to any other along the edges: it is connected.' : 'Some vertices can’t be reached from others: it is not connected.'],
    meta: { t: 'connected', g, connected },
  })
}
function netPlanar(): Question {
  const kind = pick(['k4', 'drawn', 'k5', 'k33'] as const)
  let g: Net
  if (kind === 'drawn') g = planarNet(int(4, 6), int(1, 2))
  else if (kind === 'k4') g = { names: NAMES.slice(0, 4), pos: [[0, 0], [1, 0], [1, 1], [0, 1]], edges: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2], [1, 3]] }
  else if (kind === 'k5') {
    const pos = Array.from({ length: 5 }, (_, i) => dirP(90 + 72 * i))
    const edges: [number, number][] = []
    for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) edges.push([i, j])
    g = { names: NAMES.slice(0, 5), pos, edges }
  } else {
    const pos: P[] = [[0, 1], [1, 1], [2, 1], [0, 0], [1, 0], [2, 0]]
    const edges: [number, number][] = []
    for (let i = 0; i < 3; i++) for (let j = 3; j < 6; j++) edges.push([i, j])
    g = { names: NAMES.slice(0, 6), pos, edges }
  }
  const planar = kind === 'k4' || kind === 'drawn'
  return q({
    prompt: 'Is this graph planar?',
    diagram: drawNet(g),
    answer: mcFixedA(['Yes, it is planar', 'No, it is not planar'], planar ? 'Yes, it is planar' : 'No, it is not planar'),
    hint: 'A graph is planar if it can be drawn with no edges crossing, even if this drawing has crossings. Try moving an edge to the outside.',
    steps: [kind === 'k4' ? 'Move one of the crossing edges to the outside of the square: then no edges cross, so it is planar.' : kind === 'drawn' ? 'No edges cross, so it is planar.' : kind === 'k5' ? 'Every vertex is joined to every other one (5 vertices). However you move the edges, two must cross: it is not planar.' : 'Each of the top three vertices is joined to each of the bottom three. However you redraw it, two edges must cross: it is not planar.'],
    meta: { t: 'planar', kind, planar },
  })
}
function netVerify(): Question {
  const n = int(4, 7)
  const g = planarNet(n, int(1, n - 3))
  const e = g.edges.length
  const ask = pick(['f', 'vef'] as const)
  if (ask === 'vef') {
    const f0 = e - n + 2
    return q({
      prompt: 'For this planar graph, work out v − e + f.',
      diagram: drawNet(g),
      answer: numA(n - e + f0),
      hint: 'Count the vertices, edges and faces (including the outside face).',
      steps: [`v = ${n}, e = ${e}, f = ${f0}`, `v − e + f = ${n} − ${e} + ${f0} = 2`],
      meta: { t: 'faces', g, vef: true },
    })
  }
  return netFaces()
}
const ex604 = (level: Level): Question => (level === 1 ? (chance() ? netConnected() : netEuler()) : level === 2 ? netVerify() : chance() ? netPlanar() : netEuler())

// ================================================================= Power plus (extension)

function ppDiagonals(): Question {
  const polys: [string, number][] = [['quadrilateral', 4], ['pentagon', 5], ['hexagon', 6], ['heptagon', 7], ['octagon', 8], ['nonagon', 9], ['decagon', 10], ['dodecagon', 12]]
  const [nm, n] = pick(polys)
  return q({
    prompt: `How many diagonals does a ${nm} (${n} sides) have?`,
    answer: numA((n * (n - 3)) / 2),
    hint: 'From each vertex you can draw a diagonal to every vertex except itself and its two neighbours. Each diagonal gets counted from both ends.',
    steps: [`Each of the ${n} vertices has ${n - 3} diagonals.`, `${n} × ${n - 3} ÷ 2 = ${(n * (n - 3)) / 2}`],
    meta: { t: 'diagonals', n },
  })
}
function ppEulerTrail(): Question {
  const g = randomNet(int(4, 6), int(1, 4))
  const ds = g.names.map((_, i) => degree(g, i))
  const odd = ds.filter((x) => x % 2).length
  const can = odd === 0 || odd === 2
  return q({
    prompt: 'Can this network be drawn without lifting your pencil, going along each edge exactly once?',
    diagram: drawNet(g),
    answer: mcFixedA(['Yes', 'No'], can ? 'Yes' : 'No'),
    hint: 'Count the odd vertices. It can be done if there are no odd vertices (start anywhere) or exactly two (start at one, finish at the other).',
    steps: [`Degrees: ${g.names.map((nm, i) => `${nm} ${ds[i]}`).join(', ')}: ${odd} odd vertices.`, can ? `${odd === 0 ? 'No' : 'Exactly two'} odd vertices, so yes.` : `${odd} odd vertices, so no.`],
    meta: { t: 'eulerTrail', g },
  })
}
const exPP = (level: Level): Question => (level === 1 ? ppDiagonals() : level === 2 ? (chance() ? quadName() : ppEulerTrail()) : chance() ? quadCompound() : triVertOpp())

// ================================================================= skills, test

const T = (skill: string, level: Level, gen: () => Question): TestItem => ({ skill, level, gen: () => gen() })

export const NCM6_TEST: TestItem[] = [
  // the core exercises only (6.03 and 6.04 are Path), in the order of Test Yourself 6
  T('y9-geo-triangles', 1, triSum),
  T('y9-geo-triangles', 1, triIso),
  T('y9-geo-triangles', 2, triExt),
  T('y9-geo-triangles', 2, () => triAlg()),
  T('y9-geo-triangles', 3, () => (chance() ? triVertOpp() : triExtIso())),
  T('y9-geo-triangles', 1, triClassify),
  T('y9-geo-quads', 1, quadSum),
  T('y9-geo-quads', 1, quadAlg),
  T('y9-geo-quads', 2, quadSpecial),
  T('y9-geo-quads', 2, quadSpecial),
  T('y9-geo-quads', 2, quadName),
  T('y9-geo-quads', 3, quadCompound),
]

export const NCM6_SKILLS: Skill[] = [
  {
    id: 'y9-geo-triangles',
    title: 'Triangle geometry',
    ref: ref('6.01'),
    outcomes: GEO,
    summary: 'Classify triangles; use the angle sum and the exterior angle of a triangle, giving reasons.',
    learn: {
      intro: '<p>The angles of a triangle add to <b>180°</b>. The <b>exterior angle</b> (made by extending one side) equals the sum of the two <b>interior opposite angles</b>.</p><p>An isosceles triangle has two equal sides (marked with ticks) and the angles opposite them are equal; an equilateral triangle has all angles 60°.</p>',
      keyPoints: ['Give a reason for each step: (angle sum of a triangle), (exterior angle of a triangle), (isosceles triangle), (vertically opposite angles), (angles on a straight line).', 'With algebra, write the equation first: 2m + 3m + 5m = 180.', 'By angles: acute (all < 90°), right-angled, obtuse (one > 90°). By sides: scalene, isosceles, equilateral.'],
      vocab: [['exterior angle', 'the angle between one side of a triangle and the next side extended'], ['interior opposite angles', 'the two angles inside the triangle that are not next to the exterior angle']],
    },
    gen: ex601,
    levels: { 1: 'Angle sum; isosceles and equilateral triangles; classifying', 2: 'Exterior angles; angles with algebra; which angles are possible', 3: 'Two steps: vertically opposite and extended sides' },
  },
  {
    id: 'y9-geo-quads',
    title: 'Quadrilateral geometry',
    ref: ref('6.02'),
    outcomes: GEO,
    summary: 'Use the angle sum and the properties of special quadrilaterals, giving reasons.',
    learn: {
      intro: '<p>The angles of any quadrilateral, convex or non-convex, add to <b>360°</b>.</p><p>Special quadrilaterals: trapezium (one pair of parallel sides), kite, parallelogram, rhombus, rectangle and square. Parallel sides are marked with matching arrows and equal sides with matching ticks.</p>',
      keyPoints: ['Parallelogram: opposite angles equal; angles next to each other add to 180° (co-interior).', 'Kite: one pair of opposite angles equal (between the unequal sides).', 'Rectangle: diagonals equal. Rhombus: diagonals meet at right angles and bisect the angles. A square is both.'],
      vocab: [['convex', 'every angle less than 180°; all diagonals inside'], ['non-convex', 'one reflex angle (more than 180°); one diagonal outside']],
    },
    gen: ex602,
    levels: { 1: 'Angle sum, with algebra and non-convex shapes', 2: 'Parallelograms, rhombuses, kites and trapeziums; properties', 3: 'Two or three steps with named angles' },
  },
  {
    id: 'y9-net-networks',
    title: 'Networks (Path)',
    ref: 'NCM 9 Ex 6.03 (Path)',
    tag: 'extension',
    outcomes: NET,
    summary: 'Vertices, edges and degrees; walks, trails, paths, circuits and cycles; faces.',
    learn: {
      intro: '<p>A <b>network</b> (graph) has <b>vertices</b> joined by <b>edges</b>. The <b>degree</b> of a vertex is the number of edges meeting there; a loop counts as 2. The degrees add to twice the number of edges.</p><p>A <b>trail</b> repeats no edges; a <b>path</b> repeats no vertices. A closed trail is a <b>circuit</b>; a closed path is a <b>cycle</b>.</p>',
      keyPoints: ['This is Path content (MA5-NET-P-01), beyond the core course.', 'Count the outside region as a face.'],
    },
    gen: ex603,
    levels: { 1: 'Count vertices and edges; degrees', 2: 'Odd and even vertices; networks from descriptions', 3: 'Trails, paths, circuits and cycles; faces' },
  },
  {
    id: 'y9-net-planar',
    title: 'Planar graphs and Euler’s formula (Path)',
    ref: 'NCM 9 Ex 6.04 (Path)',
    tag: 'extension',
    outcomes: NET,
    summary: 'Connected and planar graphs, and v − e + f = 2.',
    learn: {
      intro: '<p>A graph is <b>connected</b> if there is a path between any two vertices. A <b>planar graph</b> is a connected graph that can be drawn with no edges crossing. For a planar graph, <b>Euler’s formula</b> says</p><div class="big">v − e + f = 2</div>',
      keyPoints: ['This is Path content (MA5-NET-P-01), beyond the core course.', 'Crossing edges in a drawing don’t make a graph non-planar if it can be redrawn without crossings.'],
    },
    gen: ex604,
    levels: { 1: 'Connected or not; Euler’s formula', 2: 'Faces and v − e + f', 3: 'Planar or not' },
  },
  {
    id: 'y9-geo-powerplus',
    title: 'Power plus: geometry and networks',
    ref: 'NCM 9 Power plus 6',
    tag: 'extension',
    outcomes: [...GEO, ...NET],
    summary: 'Diagonals of polygons, quadrilateral properties, harder angle problems and tracing networks.',
    learn: {
      intro: '<p>A polygon with ' + v('n') + ' sides has ' + v('n') + '(' + v('n') + ' − 3) ÷ 2 diagonals. A network can be traced without lifting your pencil, using each edge once, when it has 0 or 2 odd vertices.</p>',
      keyPoints: ['Draw the quadrilateral and check its diagonals.', 'Write a reason for every angle you find.'],
    },
    gen: exPP,
    levels: { 1: 'Diagonals of polygons', 2: 'Properties; tracing networks', 3: 'Harder angle problems' },
  },
]
