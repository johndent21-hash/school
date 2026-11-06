// Independent checks for Year 9 Geometry and networks (New Century Maths 9, Chapter 6).
//  - Angle diagrams are read back from the SVG: every angle mark's vertex and size are measured from the drawing
//    itself. Each number label must equal the drawn angle; each label with the letter asked for must equal the drawn
//    angle once the answer is put in (so 2m° must be twice the answer). Named angles (∠BED) are measured between the
//    named points. Sides with the same tick marks must be equal and sides with the same arrows parallel, and every
//    right-angle mark must sit on a 90° corner.
//  - Multiple-choice facts (classifying, possible angles, quadrilateral properties) are re-decided from a separate
//    table written here.
//  - Networks: the drawing must have the vertices and edges in the question; degrees, odd vertices, walk types,
//    faces (with the drawing checked for crossing edges), connectedness and Euler's formula are re-worked here.
// Usage: npx tsx tests/ncm9-ch6.test.ts   (N per skill and level, default 300)
import { setSeed } from '../src/lib/maths/rand'
import { answerText, checkAnswer } from '../src/lib/maths/check'
import type { Level, Question } from '../src/lib/maths/types'
import { NCM6_SKILLS, NCM6_TEST } from '../src/content/y9-ncm6'
import { findTopic } from '../src/content/index'

const N = Number(process.env.N ?? 300)
let failures = 0
let independent = 0
let drawn = 0
const counts: Record<string, number> = {}
type P = [number, number]
const strip = (h: string) => h.replace(/<[^>]*>/g, '').replace(/&emsp;/g, ' ').replace(/\s+/g, ' ').trim()
const fail = (id: string, msg: string, qn?: Question) => {
  failures++
  if (failures <= Number(process.env.SHOW ?? 40)) console.log(`FAIL ${id}: ${msg}` + (qn ? `\n   ${strip(qn.prompt).slice(0, 220)}\n   answer ${JSON.stringify(qn.answer).slice(0, 160)}` : ''))
}
const done = (what: string) => {
  independent++
  counts[what] = (counts[what] ?? 0) + 1
}
const dist = (a: P, b: P) => Math.hypot(a[0] - b[0], a[1] - b[1])
const angle = (v: P, a: P, b: P) => {
  const u = [a[0] - v[0], a[1] - v[1]]
  const w = [b[0] - v[0], b[1] - v[1]]
  return (Math.acos(Math.max(-1, Math.min(1, (u[0] * w[0] + u[1] * w[1]) / (Math.hypot(u[0], u[1]) * Math.hypot(w[0], w[1]))))) * 180) / Math.PI
}
const num = (s: string) => Number(s)

// ---------------------------------------------------------------- reading an angle diagram

interface Seg { a: P; b: P }
interface Mark { v: P; size: number; label: string }
function readAngles(svg: string) {
  const pts: P[] = []
  const sides: Seg[] = []
  for (const m of svg.matchAll(/<polygon class="sh"[^>]*points="([^"]+)"/g)) {
    const ps = m[1].trim().split(/\s+/).map((p) => p.split(',').map(Number) as P)
    pts.push(...ps)
    ps.forEach((p, i) => sides.push({ a: p, b: ps[(i + 1) % ps.length] }))
  }
  for (const m of svg.matchAll(/<line class="ln" x1="([-\d.]+)" y1="([-\d.]+)" x2="([-\d.]+)" y2="([-\d.]+)"/g)) {
    const a: P = [num(m[1]), num(m[2])]
    const b: P = [num(m[3]), num(m[4])]
    pts.push(a, b)
    sides.push({ a, b })
  }
  const marks: Mark[] = []
  for (const m of svg.matchAll(/<path class="arc" d="M([-\d.]+),([-\d.]+) A([\d.]+),[\d.]+ 0 (\d) 0 ([-\d.]+),([-\d.]+)"\/>(?:<text class="dl ang"[^>]*>(.*?)<\/text>)?/g)) {
    const p1: P = [num(m[1]), num(m[2])]
    const p2: P = [num(m[5]), num(m[6])]
    const r = num(m[3])
    const v = pts.find((p) => Math.abs(dist(p, p1) - r) < 0.6 && Math.abs(dist(p, p2) - r) < 0.6)
    if (!v) continue
    const a = angle(v, p1, p2)
    marks.push({ v, size: m[4] === '1' ? 360 - a : a, label: (m[7] ?? '').trim() })
  }
  const rights: P[] = []
  for (const m of svg.matchAll(/<path class="rm" d="M([-\d.]+),([-\d.]+) L([-\d.]+),([-\d.]+) L([-\d.]+),([-\d.]+)"/g)) {
    const [x1, y1, x2, y2, x3, y3] = m.slice(1).map(Number)
    rights.push([x1 + x3 - x2, y1 + y3 - y2])
  }
  const names: { at: P; t: string }[] = [...svg.matchAll(/<text class="dl vx" x="([-\d.]+)" y="([-\d.]+)"[^>]*>(.*?)<\/text>/g)].map((m) => ({ at: [num(m[1]), num(m[2])] as P, t: m[3] }))
  // tick marks: short lines crossing the middle of a side; arrows: chevrons on a side
  const ticks: P[] = [...svg.matchAll(/<line class="tk" x1="([-\d.]+)" y1="([-\d.]+)" x2="([-\d.]+)" y2="([-\d.]+)"/g)].map((m) => [(num(m[1]) + num(m[3])) / 2, (num(m[2]) + num(m[4])) / 2])
  const arrows: P[] = [...svg.matchAll(/<path class="ln" d="M[-\d.]+,[-\d.]+ L([-\d.]+),([-\d.]+) L[-\d.]+,[-\d.]+"\/>/g)].map((m) => [num(m[1]), num(m[2])])
  return { pts, sides, marks, rights, names, ticks, arrows }
}
const onSide = (p: P, s: Seg, tol = 2) => {
  const L = dist(s.a, s.b)
  const cross = Math.abs((p[0] - s.a[0]) * (s.b[1] - s.a[1]) - (p[1] - s.a[1]) * (s.b[0] - s.a[0])) / L
  const t = ((p[0] - s.a[0]) * (s.b[0] - s.a[0]) + (p[1] - s.a[1]) * (s.b[1] - s.a[1])) / (L * L)
  return cross < tol && t > 0.2 && t < 0.8
}
/** "55°" → 55; "k°", "2m°", "(3t + 5)°", "(2t − 4)°" → a·x + c */
function labelValue(label: string, letter: string, x: number): number | null {
  const n = label.match(/^(\d+)°$/)
  if (n) return Number(n[1])
  const e = label.match(/^\(?(\d*)([a-z])(?: ([+−]) (\d+))?\)?°$/)
  if (!e || e[2] !== letter) return null
  return (e[1] ? Number(e[1]) : 1) * x + (e[3] ? (e[3] === '+' ? 1 : -1) * Number(e[4]) : 0)
}

function checkDrawing(id: string, qn: Question, d: ReturnType<typeof readAngles>) {
  drawn++
  for (const r of d.rights) {
    const v = d.pts.find((p) => dist(p, r) < 1)
    const arms = d.sides.filter((s) => dist(s.a, r) < 1 || dist(s.b, r) < 1)
    const ok = v && arms.some((s1) => arms.some((s2) => s1 !== s2 && Math.abs(angle(r, dist(s1.a, r) < 1 ? s1.b : s1.a, dist(s2.a, r) < 1 ? s2.b : s2.a) - 90) < 0.6))
    if (!ok) fail(id, 'right-angle mark not on a 90° corner', qn)
  }
  // equal ticks → equal sides; equal arrows → parallel sides
  const group = (marks: P[]) => {
    const bySide = new Map<Seg, number>()
    for (const m of marks) {
      const s = d.sides.find((sd) => onSide(m, sd))
      if (!s) {
        fail(id, 'a tick or arrow is not on a side', qn)
        continue
      }
      bySide.set(s, (bySide.get(s) ?? 0) + 1)
    }
    return bySide
  }
  const t = group(d.ticks)
  for (const [s1, n1] of t) for (const [s2, n2] of t) if (n1 === n2 && Math.abs(dist(s1.a, s1.b) - dist(s2.a, s2.b)) > 0.01 * dist(s1.a, s1.b) + 0.5) fail(id, 'sides with the same ticks are not equal', qn)
  const ar = group(d.arrows)
  for (const [s1, n1] of ar)
    for (const [s2, n2] of ar) {
      if (n1 !== n2 || s1 === s2) continue
      const u = [s1.b[0] - s1.a[0], s1.b[1] - s1.a[1]]
      const w = [s2.b[0] - s2.a[0], s2.b[1] - s2.a[1]]
      if (Math.abs(u[0] * w[1] - u[1] * w[0]) / (Math.hypot(u[0], u[1]) * Math.hypot(w[0], w[1])) > 0.01) fail(id, 'sides with the same arrows are not parallel', qn)
    }
}

// ---------------------------------------------------------------- facts, written separately

/** quadrilateral → properties it always has (the textbook's table, entered again here) */
const HAS: Record<string, string[]> = {
  trapezium: ['exactly one pair of parallel sides'],
  kite: ['diagonals that meet at right angles', 'exactly one pair of opposite angles equal', 'exactly one axis of symmetry', 'two pairs of equal adjacent sides'],
  parallelogram: ['both pairs of opposite sides parallel', 'diagonals that bisect each other'],
  rhombus: ['both pairs of opposite sides parallel', 'all sides equal', 'diagonals that bisect each other', 'diagonals that meet at right angles', 'diagonals that bisect the angles at the corners', 'two pairs of equal adjacent sides'],
  rectangle: ['both pairs of opposite sides parallel', 'equal diagonals', 'diagonals that bisect each other', 'all angles 90°'],
  square: ['both pairs of opposite sides parallel', 'all sides equal', 'equal diagonals', 'diagonals that bisect each other', 'diagonals that meet at right angles', 'all angles 90°', 'four axes of symmetry', 'diagonals that bisect the angles at the corners', 'two pairs of equal adjacent sides'],
}
const TRUE_FACTS = new Set([
  'A rhombus is a parallelogram.', 'A square is a rhombus.', 'A square is a rectangle.', 'A rectangle is a parallelogram.',
  'The opposite angles of a rhombus are equal.', 'The diagonals of a rectangle are equal.', 'The diagonals of a kite meet at right angles.',
])

// ---------------------------------------------------------------- networks

type Net = { names: string[]; pos: P[]; edges: [number, number][] }
const degreeOf = (g: Net, i: number) => g.edges.reduce((s, [a, b]) => s + (a === i ? 1 : 0) + (b === i ? 1 : 0), 0)
function checkNetDrawing(id: string, qn: Question, g: Net) {
  const svg0 = qn.diagram ?? ''
  // in the drawing, no straight edge passes near a vertex it doesn't join
  const vs = [...svg0.matchAll(/<circle class="pt vtx" cx="([-\d.]+)" cy="([-\d.]+)"/g)].map((m) => [num(m[1]), num(m[2])] as P)
  for (const m of svg0.matchAll(/<line class="ln edge" x1="([-\d.]+)" y1="([-\d.]+)" x2="([-\d.]+)" y2="([-\d.]+)"/g)) {
    const a: P = [num(m[1]), num(m[2])]
    const b: P = [num(m[3]), num(m[4])]
    for (const v of vs) {
      if (dist(v, a) < 1 || dist(v, b) < 1) continue
      const t = Math.max(0, Math.min(1, ((v[0] - a[0]) * (b[0] - a[0]) + (v[1] - a[1]) * (b[1] - a[1])) / dist(a, b) ** 2))
      const near = dist(v, [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t])
      if (near < 12) fail(id, `an edge passes ${near.toFixed(1)} px from a vertex it doesn't join`, qn)
    }
  }
  const dots = (svg0.match(/class="pt vtx"/g) ?? []).length
  const edges = (svg0.match(/class="ln edge"/g) ?? []).length
  if (dots !== g.names.length) fail(id, `drawing has ${dots} vertices, question has ${g.names.length}`, qn)
  if (edges !== g.edges.length) fail(id, `drawing has ${edges} edges, question has ${g.edges.length}`, qn)
}
function crossings(svg0: string): number {
  const segs = [...svg0.matchAll(/<line class="ln edge" x1="([-\d.]+)" y1="([-\d.]+)" x2="([-\d.]+)" y2="([-\d.]+)"/g)].map((m) => [[num(m[1]), num(m[2])], [num(m[3]), num(m[4])]] as [P, P])
  const cr = (o: P, a: P, b: P) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
  let n = 0
  for (let i = 0; i < segs.length; i++)
    for (let j = i + 1; j < segs.length; j++) {
      const [p1, p2] = segs[i]
      const [p3, p4] = segs[j]
      if ([p1, p2].some((p) => [p3, p4].some((q) => dist(p, q) < 0.5))) continue
      if (cr(p1, p2, p3) * cr(p1, p2, p4) < 0 && cr(p3, p4, p1) * cr(p3, p4, p2) < 0) n++
    }
  return n
}
function connected(g: Net): boolean {
  const seen = new Set([0])
  const stack = [0]
  while (stack.length) {
    const x = stack.pop()!
    for (const [a, b] of g.edges) for (const [p, q] of [[a, b], [b, a]]) if (p === x && !seen.has(q)) (seen.add(q), stack.push(q))
  }
  return seen.size === g.names.length
}

// ---------------------------------------------------------------- the checks

function check(id: string, qn: Question) {
  const a = qn.answer
  const m = (qn.meta ?? {}) as Record<string, unknown>
  const t = m.t as string
  const p = strip(qn.prompt)
  if (a.kind === 'mc') {
    if (new Set(a.options).size !== a.options.length) fail(id, 'duplicate options', qn)
  } else if (!checkAnswer(a, answerText(a)).correct) fail(id, 'answer text not accepted', qn)
  if (/NaN|undefined|Infinity|\$\{/.test(qn.prompt + qn.steps.join(' ') + qn.hint)) fail(id, 'bad text', qn)

  switch (t) {
    case 'angles': {
      const d = readAngles(qn.diagram ?? '')
      checkDrawing(id, qn, d)
      const l = m.l as string
      if (a.kind !== 'num') return fail(id, 'answer is not a number', qn)
      if (!new RegExp(`value of ${l}\\b`).test(p)) fail(id, 'the question asks for a different letter', qn)
      let withLetter = 0
      for (const mk of d.marks) {
        if (!mk.label) continue
        const want = labelValue(mk.label, l, a.value)
        if (want === null) return fail(id, `label ${mk.label} not understood`, qn)
        if (/[a-z]/.test(mk.label)) withLetter++
        if (Math.abs(want - mk.size) > 0.6) fail(id, `label ${mk.label} is ${want}° but the drawn angle is ${mk.size.toFixed(1)}°`, qn)
      }
      if (!withLetter) fail(id, 'no angle shows the letter', qn)
      // one mark is enough only for an equilateral triangle, whose three sides carry ticks
      if (d.marks.length < 2 && d.ticks.length < 3) fail(id, 'too few angle marks read', qn)
      return done('angles measured from the drawing')
    }
    case 'named': {
      const d = readAngles(qn.diagram ?? '')
      checkDrawing(id, qn, d)
      const at = (n: string) => {
        const nm = d.names.find((x) => x.t === n)!
        return d.pts.reduce((best, pt) => (dist(pt, nm.at) < dist(best, nm.at) ? pt : best), d.pts[0])
      }
      for (const mk of d.marks) {
        const n0 = mk.label.match(/^(\d+)°$/)
        if (n0 && Math.abs(Number(n0[1]) - mk.size) > 0.6) fail(id, `label ${mk.label} but drawn ${mk.size.toFixed(1)}°`, qn)
      }
      // A, B and C on a straight line
      if (Math.abs(angle(at('B'), at('A'), at('C')) - 180) > 0.3) fail(id, 'A, B, C are not on a straight line', qn)
      const x = angle(at(m.at as string), at(m.from as string), at(m.to as string))
      if (a.kind !== 'num' || Math.abs(a.value - x) > 0.6) fail(id, `∠ is drawn ${x.toFixed(1)}°, answer ${JSON.stringify(a)}`, qn)
      return done('named angle measured')
    }
    case 'classify': {
      const angs = (m.angles as number[]).slice()
      if (angs.reduce((s, x) => s + x, 0) !== 180) fail(id, 'angles don’t add to 180', qn)
      const shown = (p.match(/(\d+)°/g) ?? []).map((x) => Number(x.replace('°', ''))).sort((x, y) => x - y)
      if (shown.join() !== angs.slice().sort((x, y) => x - y).join()) fail(id, 'angles on the page differ', qn)
      let exp: string
      if (m.by === 'sides') {
        const distinct = new Set(angs).size
        exp = distinct === 1 ? 'equilateral' : distinct === 2 ? 'isosceles' : 'scalene'
      } else {
        const big = Math.max(...angs)
        exp = big === 90 ? 'right-angled' : big > 90 ? 'obtuse-angled' : 'acute-angled'
      }
      if (a.kind !== 'mc' || strip(a.options[a.correct]) !== exp) fail(id, `expected ${exp}`, qn)
      return done('classified')
    }
    case 'pairs': {
      if (a.kind !== 'mc') return fail(id, 'not mc', qn)
      const x = Number(p.match(/is (\d+)°/)?.[1])
      const valid = a.options.map((o) => {
        const [u, w] = (strip(o).match(/\d+/g) ?? []).map(Number)
        if (u + w + x !== 180) return false
        if (m.kind === 'iso') return /it is not one/.test(p) ? u === w : u === x || w === x
        return u > 90 || w > 90
      })
      if (valid.filter(Boolean).length !== 1 || !valid[a.correct]) fail(id, `valid options: ${valid.join(',')}`, qn)
      return done('possible angles')
    }
    case 'quadName': {
      if (a.kind !== 'mc') return fail(id, 'not mc', qn)
      const prop = p.match(/always has (.+)\?$/)?.[1] ?? ''
      const hits = a.options.map((o) => (HAS[strip(o)] ?? []).includes(prop))
      if (hits.filter(Boolean).length !== 1 || !hits[a.correct]) fail(id, `quadrilaterals with "${prop}": ${hits.join(',')}`, qn)
      return done('quadrilateral property')
    }
    case 'statement': {
      if (a.kind !== 'mc') return fail(id, 'not mc', qn)
      const wantTrue = /always true/.test(p)
      const hits = a.options.map((o) => TRUE_FACTS.has(strip(o)) === wantTrue)
      if (hits.filter(Boolean).length !== 1 || !hits[a.correct]) fail(id, `statements: ${hits.join(',')}`, qn)
      return done('true or false statement')
    }
    case 'net': {
      const g = m.g as Net
      checkNetDrawing(id, qn, g)
      const ds = g.names.map((_, i) => degreeOf(g, i))
      let x: number
      if (/How many vertices/.test(p)) x = g.names.length
      else if (/How many edges/.test(p)) x = g.edges.length
      else if (/degree of vertex (\w)/.test(p)) x = ds[g.names.indexOf(p.match(/degree of vertex (\w)/)![1])]
      else if (/odd vertices/.test(p)) x = ds.filter((d0) => d0 % 2).length
      else if (/even vertices/.test(p)) x = ds.filter((d0) => d0 % 2 === 0).length
      else if (/sum of the degrees/.test(p)) {
        x = ds.reduce((s, d0) => s + d0, 0)
        if (x !== 2 * g.edges.length) fail(id, 'degree sum is not twice the edges', qn)
      } else return fail(id, 'question not understood', qn)
      if (a.kind !== 'num' || a.value !== x) fail(id, `expected ${x}`, qn)
      return done('network count')
    }
    case 'walk': {
      const g = m.g as Net
      checkNetDrawing(id, qn, g)
      const name = p.match(/the walk ([A-H]+)\?/)?.[1] ?? ''
      const w = name.split('').map((c) => g.names.indexOf(c))
      for (let i = 1; i < w.length; i++) if (!g.edges.some(([x, y]) => (x === w[i - 1] && y === w[i]) || (y === w[i - 1] && x === w[i]))) fail(id, `${name}: no edge ${g.names[w[i - 1]]}${g.names[w[i]]}`, qn)
      const edgesUsed = w.slice(1).map((x, i) => [w[i], x].sort().join())
      const noEdgeRepeat = new Set(edgesUsed).size === edgesUsed.length
      const closed = w[0] === w[w.length - 1]
      const verts = closed ? w.slice(1) : w
      const noVertexRepeat = new Set(verts).size === verts.length
      const exp = !noEdgeRepeat ? 'none' : closed ? (noVertexRepeat ? 'a cycle' : 'a circuit') : noVertexRepeat ? 'a path' : 'a trail'
      if (a.kind !== 'mc' || strip(a.options[a.correct]) !== exp) fail(id, `expected ${exp}`, qn)
      return done('walk classified')
    }
    case 'friends': {
      // rebuild the friendships from the sentences
      const people = m.people as string[]
      const adj = new Map<string, Set<string>>()
      for (const s of p.matchAll(/(\w+) is friends with ([^.]+)\./g)) adj.set(s[1], new Set(s[2].split(/, | and /)))
      for (const [x, fr] of adj) for (const y of fr) if (!adj.get(y)?.has(x)) fail(id, `${x}–${y} friendship is one-way`, qn)
      const who = people[m.i as number]
      if (m.askDeg) {
        if (a.kind !== 'num' || a.value !== adj.get(who)?.size) fail(id, `expected ${adj.get(who)?.size}`, qn)
      } else {
        if (a.kind !== 'mc') return fail(id, 'not mc', qn)
        const hits = a.options.map((o) => strip(o) !== who && !adj.get(who)!.has(strip(o)))
        if (hits.filter(Boolean).length !== 1 || !hits[a.correct]) fail(id, 'not-a-friend options', qn)
      }
      return done('friendship network')
    }
    case 'faces': {
      const g = m.g as Net
      checkNetDrawing(id, qn, g)
      if (crossings(qn.diagram ?? '')) fail(id, 'edges cross in a face question', qn)
      if (!connected(g)) fail(id, 'not connected', qn)
      const v0 = (qn.diagram!.match(/class="pt vtx"/g) ?? []).length
      const e0 = (qn.diagram!.match(/class="ln edge"/g) ?? []).length
      const f0 = e0 - v0 + 2
      const x = m.vef ? v0 - e0 + f0 : f0
      if (a.kind !== 'num' || a.value !== x) fail(id, `expected ${x}`, qn)
      return done('faces counted')
    }
    case 'euler': {
      const nums = [...p.matchAll(/(\d+) (vertices|edges|faces)/g)]
      const k: Record<string, number> = {}
      for (const n0 of nums) k[n0[2]] = Number(n0[1])
      const ask = p.match(/How many (vertices|edges|faces)/)?.[1] ?? ''
      const x = ask === 'vertices' ? 2 + k.edges - k.faces : ask === 'edges' ? k.vertices + k.faces - 2 : 2 - k.vertices + k.edges
      if (a.kind !== 'num' || a.value !== x || x <= 0) fail(id, `expected ${x}`, qn)
      return done('Euler’s formula')
    }
    case 'connected': {
      const g = m.g as Net
      checkNetDrawing(id, qn, g)
      if (a.kind !== 'mc' || strip(a.options[a.correct]) !== (connected(g) ? 'Yes' : 'No')) fail(id, 'connectedness', qn)
      return done('connected or not')
    }
    case 'planar': {
      const svg0 = qn.diagram ?? ''
      const v0 = (svg0.match(/class="pt vtx"/g) ?? []).length
      const e0 = (svg0.match(/class="ln edge"/g) ?? []).length
      // K5 (5 vertices, 10 edges) and K3,3 (6 vertices, 9 edges, 3 + 3) are the non-planar ones drawn here
      const nonPlanar = (v0 === 5 && e0 === 10) || (m.kind === 'k33' && v0 === 6 && e0 === 9)
      if (!nonPlanar && m.kind === 'drawn' && crossings(svg0)) fail(id, 'drawn as planar but edges cross', qn)
      if (a.kind !== 'mc' || /not planar/.test(strip(a.options[a.correct])) !== nonPlanar) fail(id, 'planar answer', qn)
      return done('planar or not')
    }
    case 'diagonals': {
      const n = Number(p.match(/\((\d+) sides\)/)?.[1])
      // count them: every pair of vertices that aren't neighbours
      let c = 0
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (j - i !== 1 && !(i === 0 && j === n - 1)) c++
      if (a.kind !== 'num' || a.value !== c) fail(id, `expected ${c}`, qn)
      return done('diagonals')
    }
    case 'eulerTrail': {
      const g = m.g as Net
      checkNetDrawing(id, qn, g)
      const odd = g.names.filter((_, i) => degreeOf(g, i) % 2).length
      if (a.kind !== 'mc' || strip(a.options[a.correct]) !== (odd === 0 || odd === 2 ? 'Yes' : 'No')) fail(id, 'tracing answer', qn)
      return done('tracing a network')
    }
    default:
      fail(id, `no check for ${t}`, qn)
  }
}

for (const s of NCM6_SKILLS)
  for (const lvl of [1, 2, 3] as Level[])
    for (let i = 0; i < N; i++) {
      setSeed(i * 7919 + lvl * 31 + s.id.length)
      try {
        check(`${s.id} L${lvl}`, s.gen(lvl))
      } catch (e) {
        fail(`${s.id} L${lvl}`, 'threw ' + (e as Error).message)
      }
    }
for (let i = 0; i < 100; i++) {
  setSeed(5000 + i)
  NCM6_TEST.forEach((it, k) => check(`test Q${k + 1}`, it.gen!(it.level)))
}
const topic = findTopic('y9-geometry')
if (!topic || (topic.test?.length ?? 0) < 8) fail('topic', 'topic missing or test too short')
for (const it of NCM6_TEST) if (!NCM6_SKILLS.some((s) => s.id === it.skill && s.tag !== 'extension')) fail('topic', `test skill ${it.skill} missing or extension`)
console.log(`${failures === 0 ? 'PASS' : 'FAIL'}: ${failures} failures, ${independent} answers re-worked independently, ${drawn} angle diagrams measured`)
console.log(Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(' · '))
process.exit(failures ? 1 : 0)
