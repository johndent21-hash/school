// Independent checks for Year 9 Trigonometry (New Century Maths 9, Chapter 4).
// Answers are worked out again here without the generator's working:
//  - from the diagram itself: the triangle, its right-angle mark, the marked angle (found from its arc) and the side
//    labels are read back from the SVG. The hypotenuse, opposite and adjacent sides are worked out from the drawing,
//    and the unknown is calculated from the labelled numbers. Drawings must match their numbers: the marked angle is
//    drawn at its stated size and same-unit labels are in proportion (unless the page says "not drawn to scale"),
//    and every right-angle mark sits on a real 90° corner.
//  - from the numbers printed in the question, for questions without a diagram (triangles described in words,
//    calculator questions, rounding);
//  - from the question's own numbers (meta), for the everyday problems, re-worked with separate formulas.
// The rounding asked for in words must match the rounding the marking uses, multiple-choice questions must have
// exactly one right option, and the wording is scanned for slips.
// Usage: npx tsx tests/ncm9-ch4.test.ts   (N per skill and level, default 400)
import { setSeed } from '../src/lib/maths/rand'
import { answerText, checkAnswer } from '../src/lib/maths/check'
import type { Answer, Level, Question } from '../src/lib/maths/types'
import { NCM4_SKILLS, NCM4_TEST } from '../src/content/y9-ncm4'
import { findTopic } from '../src/content/index'

const N = Number(process.env.N ?? 400)
let failures = 0
let independent = 0
let diagramReads = 0
const counts: Record<string, number> = {}
type P = [number, number]
const D2R = Math.PI / 180
const strip = (h: string) =>
  h
    .replace(/<span class="frac"[^>]*><span class="fn">(.*?)<\/span><span class="fd">(.*?)<\/span><\/span>/g, '(($1)/($2))')
    .replace(/<sup>(.*?)<\/sup>/g, '^$1')
    .replace(/<[^>]*>/g, '')
    .replace(/&emsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
const fail = (id: string, msg: string, qn?: Question) => {
  failures++
  if (failures <= Number(process.env.SHOW ?? 40)) console.log(`FAIL ${id}: ${msg}` + (qn ? `\n   ${strip(qn.prompt).slice(0, 260)}\n   answer ${JSON.stringify(qn.answer).slice(0, 220)}` : ''))
}
const near = (x: number, y: number, tol = 1e-6) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(y))
const rnd = (x: number, dp: number) => Math.round(x * 10 ** dp + 1e-9) / 10 ** dp
const parseNum = (s: string) => Number(s.replace(/−/g, '-').replace(/(\d) (?=\d{3}\b)/g, '$1'))
const trig = (fn: string, deg: number) => (fn === 'sin' ? Math.sin(deg * D2R) : fn === 'cos' ? Math.cos(deg * D2R) : Math.tan(deg * D2R))
const invTrig = (fn: string, x: number) => (fn === 'sin' ? Math.asin(x) : fn === 'cos' ? Math.acos(x) : Math.atan(x)) / D2R
/** "35°", "57.4°", "23°18′", "33°53′30″" → degrees */
function angleOf(t: string): number | null {
  const m = t.replace(/'/g, '′').match(/^(\d+(?:\.\d+)?)°(?:(\d+(?:\.\d+)?)′)?(?:(\d+(?:\.\d+)?)″)?$/)
  if (!m) return null
  return Number(m[1]) + Number(m[2] ?? 0) / 60 + Number(m[3] ?? 0) / 3600
}
const ANG = String.raw`\d+(?:\.\d+)?°(?:\d+(?:\.\d+)?′)?(?:\d+(?:\.\d+)?″)?`

// ---------------------------------------------------------------- reading the diagram

interface Seg { a: P; b: P }
interface Label { at: P; text: string }
interface Arc { start: P; r: number; label: string }
interface Diagram { segs: Seg[]; rights: P[]; labels: Label[]; names: Label[]; polys: P[][]; arcs: Arc[] }
const attr = (tag: string, name: string) => Number((tag.match(new RegExp(`\\b${name}="([-\\d.]+)"`)) ?? [])[1])
function readDiagram(svg: string): Diagram {
  const segs: Seg[] = []
  const polys: P[][] = []
  for (const m of svg.matchAll(/<polygon class="sh"[^>]*points="([^"]+)"/g)) {
    const pts = m[1].trim().split(/\s+/).map((p) => p.split(',').map(Number) as P)
    polys.push(pts)
    for (let i = 0; i < pts.length; i++) segs.push({ a: pts[i], b: pts[(i + 1) % pts.length] })
  }
  for (const m of svg.matchAll(/<line [^>]*>/g)) {
    const t = m[0]
    if (/class="(grid|axis)/.test(t)) continue
    segs.push({ a: [attr(t, 'x1'), attr(t, 'y1')], b: [attr(t, 'x2'), attr(t, 'y2')] })
  }
  const rights: P[] = []
  for (const m of svg.matchAll(/<path class="rm" d="M([-\d.]+),([-\d.]+) L([-\d.]+),([-\d.]+) L([-\d.]+),([-\d.]+)"/g)) {
    const [x1, y1, x2, y2, x3, y3] = m.slice(1).map(Number)
    rights.push([x1 + x3 - x2, y1 + y3 - y2])
  }
  const labels: Label[] = []
  const names: Label[] = []
  for (const m of svg.matchAll(/<text class="dl (side|vx)" x="([-\d.]+)" y="([-\d.]+)"[^>]*>(.*?)<\/text>/g)) {
    const l = { at: [Number(m[2]), Number(m[3])] as P, text: m[4].replace(/<[^>]*>/g, '').trim() }
    ;(m[1] === 'side' ? labels : names).push(l)
  }
  // each angle mark is an arc followed by its label (if it has one)
  const arcs: Arc[] = []
  for (const m of svg.matchAll(/<path class="arc" d="M([-\d.]+),([-\d.]+) A([\d.]+),[^"]*"\/>(?:<text class="dl ang"[^>]*>(.*?)<\/text>)?/g)) {
    arcs.push({ start: [Number(m[1]), Number(m[2])], r: Number(m[3]), label: (m[4] ?? '').replace(/<[^>]*>/g, '').trim() })
  }
  return { segs, rights, labels, names, polys, arcs }
}
const len = (s: Seg) => Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1])
const dist = (p: P, q: P) => Math.hypot(p[0] - q[0], p[1] - q[1])
const same = (p: P, q: P, tol = 0.6) => Math.abs(p[0] - q[0]) < tol && Math.abs(p[1] - q[1]) < tol
/** the side a label belongs to: its foot falls near the middle of the side, and it is the closest such side */
function sideOf(l: Label, segs: Seg[]): Seg | null {
  let best: Seg | null = null
  let bd = Infinity
  for (const s of segs) {
    const dx = s.b[0] - s.a[0]
    const dy = s.b[1] - s.a[1]
    const L2 = dx * dx + dy * dy
    if (L2 < 1) continue
    const t = ((l.at[0] - s.a[0]) * dx + (l.at[1] - s.a[1]) * dy) / L2
    if (t < 0.2 || t > 0.8) continue
    const d = Math.abs((l.at[0] - s.a[0]) * dy - (l.at[1] - s.a[1]) * dx) / Math.sqrt(L2)
    if (d < bd) {
      bd = d
      best = s
    }
  }
  return bd < 70 ? best : null
}
/** the corner of the drawn angle (where the arc is centred) and the drawn size of the angle there */
function angleCorner(pts: P[], arc: Arc): { i: number; size: number } | null {
  const i = pts.findIndex((p) => Math.abs(dist(p, arc.start) - arc.r) < 0.6)
  if (i < 0) return null
  const c = pts[i]
  const o = pts.filter((_, k) => k !== i)
  const u = [o[0][0] - c[0], o[0][1] - c[1]]
  const w = [o[1][0] - c[0], o[1][1] - c[1]]
  const size = Math.acos((u[0] * w[0] + u[1] * w[1]) / (Math.hypot(u[0], u[1]) * Math.hypot(w[0], w[1]))) / D2R
  return { i, size }
}
type Role = 'hyp' | 'opp' | 'adj'
interface Read {
  R: P
  sides: Record<Role, Seg>
  lab: Partial<Record<Role, string>>
  mark: string
  drawn: number
  name: (p: P) => string
  other?: { label: string; lab: Partial<Record<Role, string>> }
}
/** a single right-angled triangle with a marked angle: which drawn side is the hypotenuse, opposite and adjacent */
function readTrig(d: Diagram, arcIndex = 0): Read | null {
  if (d.polys.length !== 1 || d.polys[0].length !== 3 || d.rights.length !== 1 || !d.arcs.length) return null
  const pts = d.polys[0]
  const ri = pts.findIndex((p) => same(p, d.rights[0], 1))
  if (ri < 0) return null
  const roles = (arc: Arc) => {
    const c = angleCorner(pts, arc)
    if (!c || c.i === ri) return null
    const A = pts[c.i]
    const O = pts.find((_, k) => k !== ri && k !== c.i)!
    const R = pts[ri]
    const sides: Record<Role, Seg> = { hyp: { a: A, b: O }, opp: { a: R, b: O }, adj: { a: R, b: A } }
    const lab: Partial<Record<Role, string>> = {}
    for (const l of d.labels) {
      const s = sideOf(l, d.segs)
      if (!s) continue
      for (const r of ['hyp', 'opp', 'adj'] as Role[]) {
        const t = sides[r]
        if ((same(s.a, t.a) && same(s.b, t.b)) || (same(s.a, t.b) && same(s.b, t.a))) lab[r] = l.text
      }
    }
    return { R, sides, lab, drawn: c.size }
  }
  const main = roles(d.arcs[arcIndex])
  if (!main) return null
  const nameAt = (p: P) => {
    let best = ''
    let bd = Infinity
    for (const n of d.names) {
      const dd = dist(n.at, p)
      if (dd < bd) {
        bd = dd
        best = n.text
      }
    }
    return bd < 30 ? best : ''
  }
  const out: Read = { ...main, mark: d.arcs[arcIndex].label, name: nameAt }
  const o = d.arcs.find((_, k) => k !== arcIndex)
  if (o) {
    const r2 = roles(o)
    if (r2) out.other = { label: o.label, lab: r2.lab }
  }
  return out
}
function onSeg(s: Seg, p: P) {
  const dx = s.b[0] - s.a[0]
  const dy = s.b[1] - s.a[1]
  const L = Math.hypot(dx, dy)
  const cross = Math.abs((p[0] - s.a[0]) * dy - (p[1] - s.a[1]) * dx) / L
  const t = ((p[0] - s.a[0]) * dx + (p[1] - s.a[1]) * dy) / (L * L)
  return cross < 0.6 && t > -0.01 && t < 1.01
}
function dirFrom(s: Seg, p: P): P[] {
  const out: P[] = []
  for (const e of [s.a, s.b]) {
    const L = Math.hypot(e[0] - p[0], e[1] - p[1])
    if (L > 1) out.push([(e[0] - p[0]) / L, (e[1] - p[1]) / L])
  }
  return out
}
/** every right-angle mark sits on a corner where two drawn lines meet at 90° */
function checkRights(id: string, d: Diagram, qn: Question) {
  for (const c of d.rights) {
    const arms = d.segs.filter((s) => same(s.a, c) || same(s.b, c) || onSeg(s, c))
    let ok = false
    for (let i = 0; i < arms.length && !ok; i++)
      for (let j = i + 1; j < arms.length && !ok; j++)
        for (const uu of dirFrom(arms[i], c)) for (const ww of dirFrom(arms[j], c)) if (Math.abs(uu[0] * ww[0] + uu[1] * ww[1]) < 0.02) ok = true
    if (!ok) fail(id, 'a right-angle mark is not on a 90° corner', qn)
  }
}
const numLabel = (t: string | undefined) => (t && /^\d+(?:\.\d+)?(?: (mm|cm|m|km))?$/.test(t) ? parseNum(t.split(' ')[0]) : null)
const unitLabel = (t: string | undefined) => (t ?? '').split(' ')[1] ?? ''
/** labelled numbers must be in proportion to the drawn sides (tol: measured sides are only to the nearest mm) */
function checkScale(id: string, rd: Read, qn: Question, tol = 0.02) {
  if (qn.note) return
  const ratios: number[] = []
  for (const r of ['hyp', 'opp', 'adj'] as Role[]) {
    const n = numLabel(rd.lab[r])
    if (n !== null) ratios.push(len(rd.sides[r]) / n)
  }
  if (ratios.length > 1 && Math.max(...ratios) / Math.min(...ratios) > 1 + tol) fail(id, `diagram not to scale (${ratios.map((x) => x.toFixed(2)).join(', ')})`, qn)
}
/** the marked angle is drawn at its stated size (or, for θ, at the size its sides give) */
function checkAngleDrawn(id: string, rd: Read, qn: Question, size: number | null) {
  if (qn.note || size === null) return
  if (Math.abs(rd.drawn - size) > 0.6) fail(id, `angle drawn at ${rd.drawn.toFixed(1)}° but it is ${size.toFixed(1)}°`, qn)
}

// ---------------------------------------------------------------- solving a triangle, independently

/** the unknown side from a known side and the angle: opp = hyp sin, adj = hyp cos, opp = adj tan */
function sideFrom(known: Role, k: number, want: Role, deg: number): number {
  const s = Math.sin(deg * D2R)
  const c = Math.cos(deg * D2R)
  const hyp = known === 'hyp' ? k : known === 'opp' ? k / s : k / c
  return want === 'hyp' ? hyp : want === 'opp' ? hyp * s : hyp * c
}
/** the angle from two known sides */
function angleFrom(a: Role, x: number, b: Role, y: number): number {
  const v: Partial<Record<Role, number>> = { [a]: x, [b]: y }
  if (v.opp !== undefined && v.hyp !== undefined) return Math.asin(v.opp / v.hyp) / D2R
  if (v.adj !== undefined && v.hyp !== undefined) return Math.acos(v.adj / v.hyp) / D2R
  return Math.atan(v.opp! / v.adj!) / D2R
}
/** the ratio of the named sides for an angle: [top role, bottom role] */
const RATIO: Record<string, [Role, Role]> = { sin: ['opp', 'hyp'], cos: ['adj', 'hyp'], tan: ['opp', 'adj'] }

// ---------------------------------------------------------------- rounding asked for in words

type Want = { kind: 'dp'; dp: number } | { kind: 'minute' } | { kind: 'second' } | { kind: 'exact' }
function wanted(prompt: string, suffix?: string): Want {
  const t = strip(prompt)
  if (/nearest second/.test(t)) return { kind: 'second' }
  if (/nearest minute/.test(t) && !/nearest millimetre/.test(t)) return { kind: 'minute' }
  const dpw = t.match(/correct to (one|\d) decimal place/)
  if (dpw) return { kind: 'dp', dp: dpw[1] === 'one' ? 1 : Number(dpw[1]) }
  if (/nearest degree|nearest whole number/.test(t)) return { kind: 'dp', dp: 0 }
  const unit = t.match(/nearest (millimetre|centimetre|metre|kilometre)/)
  if (unit) {
    const inM = /\(Answer in metres\.\)|in metres/.test(t) || suffix === 'm'
    const w = unit[1]
    if (suffix === 'mm' && w === 'millimetre') return { kind: 'dp', dp: 0 }
    if (suffix === 'cm' && w === 'centimetre') return { kind: 'dp', dp: 0 }
    if (suffix === 'km' && w === 'kilometre') return { kind: 'dp', dp: 0 }
    if (inM && w === 'metre') return { kind: 'dp', dp: 0 }
    if (inM && w === 'centimetre') return { kind: 'dp', dp: 2 }
    if (inM && w === 'millimetre') return { kind: 'dp', dp: 3 }
  }
  return { kind: 'exact' }
}
/** the answer must equal x, rounded as the words say */
function checkValue(id: string, qn: Question, x: number, what: string) {
  independent++
  counts[what] = (counts[what] ?? 0) + 1
  const a = qn.answer
  const w = wanted(qn.prompt, qn.suffix)
  if (a.kind === 'num') {
    if (w.kind !== 'dp' && w.kind !== 'exact') return fail(id, `${what}: words ask for ${w.kind} but the answer is a number`, qn)
    if (w.kind === 'dp' && a.dp !== w.dp) return fail(id, `${what}: words say ${w.dp} dp, marking uses ${a.dp}`, qn)
    const dp = w.kind === 'dp' ? w.dp : 9
    if (Math.abs(rnd(a.value, dp) - rnd(x, dp)) > 1e-9) fail(id, `${what}: expected ${rnd(x, dp)}, answer ${rnd(a.value, dp)}`, qn)
    return
  }
  if (a.kind === 'dms') {
    if (w.kind !== a.to) return fail(id, `${what}: words ask for ${w.kind}, marking to the ${a.to}`, qn)
    const unit = a.to === 'minute' ? 60 : 3600
    if (Math.round(x * unit + 1e-7) !== Math.round(a.value * unit + 1e-7)) fail(id, `${what}: expected ${x}, answer ${a.value}`, qn)
    return
  }
  if (a.kind === 'frac') {
    if (!near(a.n / a.d, x, 1e-9)) fail(id, `${what}: expected ${x}, answer ${a.n}/${a.d}`, qn)
    return
  }
  if (a.kind === 'mc') {
    // the right option shows x (rounded as asked); no other option does
    const shown = a.options.map((o) => strip(o))
    const val = (s: string) => {
      const ang = s.match(new RegExp(`^(${ANG})$`))
      if (ang) return angleOf(ang[1])
      const m = s.match(/^(\d+(?:\.\d+)?)(?: (?:mm|cm|m|km))?$/)
      return m ? Number(m[1]) : null
    }
    const hits = shown.map((s, i) => ({ i, v: val(s) })).filter((o) => o.v !== null && (w.kind === 'minute' ? Math.round(o.v * 60) === Math.round(x * 60 + 1e-7) : w.kind === 'dp' ? Math.abs(o.v - rnd(x, w.dp)) < 1e-9 : false))
    if (hits.length !== 1 || hits[0].i !== a.correct) fail(id, `${what}: ${hits.length} options match ${x}`, qn)
    return
  }
  fail(id, `${what}: unexpected answer kind ${a.kind}`, qn)
}
/** a multiple choice whose right option is text: exactly the expected one */
function checkOption(id: string, qn: Question, expected: string, what: string) {
  independent++
  counts[what] = (counts[what] ?? 0) + 1
  const a = qn.answer
  if (a.kind !== 'mc') return fail(id, `${what}: not multiple choice`, qn)
  const shown = a.options.map((o) => strip(o))
  const hits = shown.filter((s) => s === expected).length
  if (hits !== 1 || shown[a.correct] !== expected) fail(id, `${what}: expected "${expected}", options ${shown.join(' | ')}, marked ${shown[a.correct]}`, qn)
}

// ---------------------------------------------------------------- the checks

const sortName = (s: string) => s.split('').sort().join('')
function check(id: string, qn: Question) {
  const a = qn.answer
  const t = (qn.meta?.t as string) ?? ''
  const p = strip(qn.prompt)
  // generic: the marking accepts its own answer, multiple choice has distinct options, no slips in the words
  if (a.kind === 'mc') {
    if (new Set(a.options).size !== a.options.length) fail(id, 'duplicate options', qn)
  } else if (!checkAnswer(a, answerText(a)).correct) fail(id, 'answer text not accepted', qn)
  const all = qn.prompt + qn.steps.join(' ') + qn.hint
  if (/NaN|undefined|Infinity|\$\{/.test(all)) fail(id, 'bad text', qn)
  if (/ {2}|\.\.(?!\.)| ,|\b1 hours\b|\(\s/.test(strip(all))) fail(id, 'wording slip: ' + (strip(all).match(/.{0,30}( {2}|\.\.| ,|\b1 hours\b|\(\s).{0,30}/)?.[0] ?? ''), qn)
  if (qn.calc === undefined && /sin|cos|tan/.test(p) && !['sideLen', 'sideName', 'angleName', 'twoAngles', 'falseStatement', 'describe', 'fixedSide', 'ratioFrac', 'whichRatio', 'trueStatement', 'fromRatio', 'whichRatioSides', 'whichExpr', 'whyConstant', 'exactValue', 'identity'].includes(t)) fail(id, 'trig question without the calculator', qn)
  if (qn.calc === 'trig' && ['ratioFrac', 'fromRatio', 'whichRatio', 'trueStatement', 'identity'].includes(t)) fail(id, 'calculator on a by-hand question', qn)

  const d = qn.diagram && qn.diagram.includes('<svg') ? readDiagram(qn.diagram) : null
  if (d) checkRights(id, d, qn)
  const rd = d ? readTrig(d) : null
  if (d && rd) diagramReads++

  switch (t) {
    case 'sideLen': {
      if (!rd) return fail(id, 'diagram not read', qn)
      const role: Role = /hypotenuse/.test(p) ? 'hyp' : /opposite/.test(p) ? 'opp' : 'adj'
      const n = numLabel(rd.lab[role])
      if (n === null) return fail(id, `no label on the ${role}`, qn)
      checkScale(id, rd, qn)
      return checkValue(id, qn, n, 'side named from the drawing')
    }
    case 'sideName': {
      if (!rd) return fail(id, 'diagram not read', qn)
      const role: Role = /hypotenuse/.test(p) ? 'hyp' : /opposite/.test(p) ? 'opp' : 'adj'
      const s = rd.sides[role]
      const nm = sortName(rd.name(s.a) + rd.name(s.b))
      // the angle named in the question is the one marked in the drawing
      const at = p.match(/∠([A-Z])\.$/)?.[1]
      const corner = rd.sides.adj.a === rd.R ? rd.sides.adj.b : rd.sides.adj.a
      if (at !== rd.name(corner)) fail(id, `question names ∠${at}, drawing marks ∠${rd.name(corner)}`, qn)
      return checkOption(id, qn, nm, 'side letters from the drawing')
    }
    case 'angleName': {
      if (!rd) return fail(id, 'diagram not read', qn)
      const R = rd.name(rd.R)
      const tri = (p.match(/△([A-Z]{3})/) ?? [])[1] ?? ''
      let exp = ''
      if (/opposite the hypotenuse/.test(p)) exp = R
      else {
        const side = (p.match(/side ([A-Z]{2})/) ?? [])[1] ?? ''
        if (/opposite side/.test(p)) exp = tri.split('').find((c) => !side.includes(c)) ?? ''
        else {
          if (!side.includes(R)) fail(id, 'adjacent to a side that isn’t next to the right angle', qn)
          exp = side.split('').find((c) => c !== R) ?? ''
        }
      }
      return checkOption(id, qn, `∠${exp}`, 'angle named from the drawing')
    }
    case 'twoAngles': {
      if (!d || !rd || !rd.other) return fail(id, 'two marked angles not read', qn)
      const which = p.match(/for angle (θ|φ)/)?.[1]
      const role: Role = /opposite/.test(p) ? 'opp' : 'adj'
      const lab = which === rd.mark ? rd.lab : rd.other.label === which ? rd.other.lab : null
      if (!lab) return fail(id, 'angle not found', qn)
      return checkOption(id, qn, lab[role] ?? '?', 'side for θ or φ')
    }
    case 'falseStatement': {
      if (!rd || a.kind !== 'mc') return fail(id, 'diagram not read', qn)
      const R = rd.name(rd.R)
      const [pa, pb] = [rd.sides.hyp.a, rd.sides.hyp.b].map(rd.name)
      const hyp = sortName(pa + pb)
      const truth = (s: string) => {
        let m = s.match(/^The hypotenuse is ([A-Z]{2})\.$/)
        if (m) return sortName(m[1]) === hyp
        m = s.match(/^The side (opposite|adjacent to) ∠([A-Z]) is ([A-Z]{2})\.$/)
        if (!m) return null
        const side = m[3]
        if (m[1] === 'opposite') return !side.includes(m[2])
        return side.includes(m[2]) && side.includes(R)
      }
      const vals = a.options.map((o) => truth(strip(o)))
      if (vals.some((x) => x === null)) return fail(id, 'statement not understood', qn)
      independent++
      counts['false statement'] = (counts['false statement'] ?? 0) + 1
      if (vals.filter((x) => !x).length !== 1 || vals[a.correct]) fail(id, `false statements: ${vals.join(',')}`, qn)
      return
    }
    case 'describe': {
      const tri = (p.match(/△([A-Z]{3})/) ?? [])[1] ?? ''
      let exp = ''
      if (/opposite angle θ/.test(p)) {
        const hyp = (p.match(/hypotenuse ([A-Z]{2})/) ?? [])[1] ?? ''
        const opp = (p.match(/side ([A-Z]{2}) is opposite/) ?? [])[1] ?? ''
        const right = tri.split('').find((c) => !hyp.includes(c))!
        exp = tri.split('').find((c) => !opp.includes(c))!
        if (exp === right || !opp.includes(right)) fail(id, 'description is impossible', qn)
      } else {
        const m = p.match(/side ([A-Z]{2}) is opposite ∠([A-Z]) and adjacent to ∠([A-Z])/)
        if (!m) return fail(id, 'description not read', qn)
        if (m[1].includes(m[2]) || !m[1].includes(m[3])) fail(id, 'description is impossible', qn)
        exp = m[1].split('').find((c) => c !== m[3])!
      }
      return checkOption(id, qn, exp, 'vertex from a description')
    }
    case 'fixedSide':
      return checkOption(id, qn, 'the hypotenuse', 'fixed side')
    case 'ratioFrac': {
      if (!rd) return fail(id, 'diagram not read', qn)
      const fn = p.match(/^Find (sin|cos|tan)/)?.[1] ?? ''
      const [top, bot] = RATIO[fn]
      const x = numLabel(rd.lab[top])! / numLabel(rd.lab[bot])!
      checkScale(id, rd, qn)
      checkAngleDrawn(id, rd, qn, Math.atan(numLabel(rd.lab.opp)! / numLabel(rd.lab.adj)!) / D2R)
      return checkValue(id, qn, x, 'ratio from the drawing')
    }
    case 'whichRatio': {
      if (!rd || !rd.other || a.kind !== 'mc') return fail(id, 'diagram not read', qn)
      const fr = qn.prompt.match(/<span class="fn">(.*?)<\/span><span class="fd">(.*?)<\/span>/)
      if (!fr) return fail(id, 'fraction not read', qn)
      const topT = strip(fr[1])
      const botT = strip(fr[2])
      const labFor = (ang: string) => (ang === rd.mark ? rd.lab : rd.other!.label === ang ? rd.other!.lab : null)
      const hits = a.options.map((o) => {
        const m = strip(o).match(/^(sin|cos|tan) (θ|φ)$/)
        const lab = m && labFor(m[2])
        if (!m || !lab) return null
        const [tr, br] = RATIO[m[1]]
        return lab[tr] === topT && lab[br] === botT
      })
      independent++
      counts['which ratio'] = (counts['which ratio'] ?? 0) + 1
      if (hits.some((h) => h === null) || hits.filter(Boolean).length !== 1 || !hits[a.correct]) fail(id, `which ratio: ${hits.join(',')}`, qn)
      return
    }
    case 'trueStatement': {
      if (!d || !rd || a.kind !== 'mc') return fail(id, 'diagram not read', qn)
      // the actual ratios of the drawn angles, from the drawing's coordinates
      const pts = d.polys[0]
      const val: Record<string, Record<string, number>> = {}
      for (const c of pts) {
        if (same(c, rd.R, 1)) continue
        const o = pts.filter((x) => x !== c)
        const other = o.find((x) => !same(x, rd.R, 1))!
        const hyp = dist(c, other)
        const adj = dist(c, rd.R)
        const opp = dist(other, rd.R)
        val[rd.name(c)] = { sin: opp / hyp, cos: adj / hyp, tan: opp / adj }
      }
      const truth = a.options.map((o) => {
        const m = strip(o).match(/^(sin|cos|tan) ([A-Z]) = (sin|cos|tan) ([A-Z])$/)
        if (!m || !val[m[2]] || !val[m[4]]) return null
        return Math.abs(val[m[2]][m[1]] - val[m[4]][m[3]]) < 2e-3
      })
      independent++
      counts['true statement'] = (counts['true statement'] ?? 0) + 1
      if (truth.some((x) => x === null) || truth.filter(Boolean).length !== 1 || !truth[a.correct]) fail(id, `true statements: ${truth.join(',')}`, qn)
      return
    }
    case 'fromRatio': {
      const m = p.match(/^If (sin|cos|tan) ([A-Z]) = \(\((\d+)\)\/\((\d+)\)\), find (sin|cos|tan) \2/)
      if (!m) return fail(id, 'not read', qn)
      const [given, x, y, ask] = [m[1], Number(m[3]), Number(m[4]), m[5]]
      const v: Partial<Record<Role, number>> = { [RATIO[given][0]]: x, [RATIO[given][1]]: y }
      if (v.hyp === undefined) v.hyp = Math.hypot(v.opp!, v.adj!)
      else if (v.opp === undefined) v.opp = Math.sqrt(v.hyp ** 2 - v.adj! ** 2)
      else v.adj = Math.sqrt(v.hyp ** 2 - v.opp ** 2)
      const [tr, br] = RATIO[ask]
      return checkValue(id, qn, v[tr]! / v[br]!, 'one ratio from another')
    }
    case 'measuredRatio': {
      if (!rd) return fail(id, 'diagram not read', qn)
      const fn = p.match(/find (sin|cos|tan) (\d+)°/)
      if (!fn) return fail(id, 'ratio not read', qn)
      const th = Number(fn[2])
      if (angleOf(rd.mark) !== th) fail(id, 'the marked angle isn’t the one asked about', qn)
      const v = { opp: numLabel(rd.lab.opp)!, adj: numLabel(rd.lab.adj)!, hyp: numLabel(rd.lab.hyp)! }
      // the measurements are real ones: each within half a millimetre of the true length
      if (Math.abs(v.opp - v.hyp * Math.sin(th * D2R)) > 0.5 + 1e-9 || Math.abs(v.adj - v.hyp * Math.cos(th * D2R)) > 0.5 + 1e-9) fail(id, 'measurements don’t fit the angle', qn)
      checkScale(id, rd, qn, 0.03)
      checkAngleDrawn(id, rd, qn, th)
      const [tr, br] = RATIO[fn[1]]
      return checkValue(id, qn, v[tr] / v[br], 'ratio from measurements')
    }
    case 'similarTable': {
      const rows = [...(qn.diagram ?? '').matchAll(/<tr><th scope="row">(\d)<\/th><td>(\d+)<\/td><td>(\d+)<\/td><td>(\d+)<\/td>(?:<td>(.*?)<\/td>)?<\/tr>/g)].map((m) => ({ opp: +m[2], adj: +m[3], hyp: +m[4], shown: m[5] }))
      if (rows.length !== 4) return fail(id, 'table not read', qn)
      const th = Number(p.match(/= (\d+)°/)?.[1])
      const fn = p.match(/(?:Find|out) (sin|cos|tan)/)?.[1] ?? 'sin'
      const ratio = (r: (typeof rows)[0], f: string) => r[RATIO[f][0]] / r[RATIO[f][1]]
      const fits = (r: (typeof rows)[0]) => Math.abs(r.opp - r.hyp * Math.sin(th * D2R)) <= 0.5 + 1e-9 && Math.abs(r.adj - r.hyp * Math.cos(th * D2R)) <= 0.5 + 1e-9
      if (/One of them was measured wrongly/.test(p)) {
        const bad = rows.map((r) => !fits(r))
        if (bad.filter(Boolean).length !== 1) return fail(id, `${bad.filter(Boolean).length} rows don’t fit`, qn)
        return checkOption(id, qn, `Triangle ${bad.indexOf(true) + 1}`, 'mismeasured triangle')
      }
      if (!rows.every(fits)) fail(id, 'table measurements don’t fit the angle', qn)
      if (/What do you notice/.test(p)) return checkOption(id, qn, `All about ${rnd(trig(fn, th), 2).toFixed(2)}`, 'pattern in a table')
      const k = rows.findIndex((r) => r.shown === '?')
      if (k < 0) return fail(id, 'missing row not found', qn)
      for (const r of rows) if (r.shown !== '?' && Number(r.shown) !== rnd(ratio(r, fn), 2)) fail(id, 'a ratio in the table is wrong', qn)
      return checkValue(id, qn, ratio(rows[k], fn), 'missing ratio in a table')
    }
    case 'constancy': {
      const m = p.match(/both have a (\d+)° angle. In the smaller triangle, (.+?) is (\d+) mm and (.+?) is (\d+) mm. In the larger triangle, (.+?) is (\d+) mm/)
      if (!m) return fail(id, 'not read', qn)
      if (m[4] !== m[6]) fail(id, 'the larger triangle’s side isn’t the matching one', qn)
      const x = (Number(m[7]) * Number(m[3])) / Number(m[5])
      return checkValue(id, qn, x, 'similar triangle side')
    }
    case 'whyConstant':
      return checkOption(id, qn, 'The triangles are similar, so their sides are in the same ratio.', 'why the ratios are constant')
    case 'evalTrig': {
      const ex = p.match(new RegExp(`^Evaluate (.+), correct to`))?.[1] ?? ''
      let m = ex.match(new RegExp(`^(?:(\\d+(?:\\.\\d+)?) )?(sin|cos|tan) (${ANG})$`))
      let x: number | null = null
      if (m) x = (m[1] ? Number(m[1]) : 1) * trig(m[2], angleOf(m[3])!)
      m = m ? null : ex.match(new RegExp(`^\\(\\((\\d+(?:\\.\\d+)?)\\)/\\((sin|cos|tan) (${ANG})\\)\\)$`)) ?? ex.match(new RegExp(`^(\\d+(?:\\.\\d+)?) ÷ (sin|cos|tan) (${ANG})$`))
      if (m) x = Number(m[1]) / trig(m[2], angleOf(m[3])!)
      if (x === null) return fail(id, `expression not read: ${ex}`, qn)
      return checkValue(id, qn, x, 'calculator expression')
    }
    case 'roundDeg': {
      const m = p.match(new RegExp(`^Round (${ANG}) to the nearest degree`))
      if (!m) return fail(id, 'angle not read', qn)
      // 30′ is halfway and rounds up
      return checkValue(id, qn, Math.floor(angleOf(m[1])! + 0.5 + 1e-9), 'rounded to a degree')
    }
    case 'roundMin': {
      const m = p.match(/^Round (\d+)°(\d+)′(\d+(?:\.\d+)?)″ to the nearest minute/)
      if (!m) return fail(id, 'angle not read', qn)
      const mins = Number(m[1]) * 60 + Number(m[2]) + (Number(m[3]) >= 30 ? 1 : 0)
      return checkValue(id, qn, mins / 60, 'rounded to a minute')
    }
    case 'toDMS': {
      const m = p.match(/^Convert (\d+\.\d+)° to degrees and minutes/)
      if (!m) return fail(id, 'angle not read', qn)
      const x = Number(m[1])
      const mins = Math.floor(x) * 60 + Math.floor((x - Math.floor(x)) * 60 + 0.5 + 1e-9)
      return checkValue(id, qn, mins / 60, 'decimal degrees to minutes')
    }
    case 'guessCheck': {
      const m = p.match(/if (sin|cos|tan) θ = (\d\.\d{4})/)
      if (!m) return fail(id, 'ratio not read', qn)
      return checkValue(id, qn, invTrig(m[1], Number(m[2])), 'angle by guess and check')
    }
    case 'sideDiagram':
    case 'whichValue': {
      if (!rd) return fail(id, 'diagram not read', qn)
      const ang = angleOf(rd.mark)
      const roles = (['hyp', 'opp', 'adj'] as Role[]).filter((r) => rd.lab[r])
      const known = roles.find((r) => numLabel(rd.lab[r]) !== null)
      const want = roles.find((r) => numLabel(rd.lab[r]) === null)
      if (ang === null || !known || !want || roles.length !== 2) return fail(id, 'triangle not read', qn)
      const pron = p.match(/value of (\w)/)?.[1]
      if (pron !== rd.lab[want]) fail(id, `asks for ${pron}, drawing labels ${rd.lab[want]}`, qn)
      if (qn.suffix && qn.suffix !== unitLabel(rd.lab[known])) fail(id, 'answer unit differs from the drawing', qn)
      if (a.kind === 'mc' && !strip(a.options[a.correct]).endsWith(unitLabel(rd.lab[known]))) fail(id, 'option unit differs from the drawing', qn)
      checkAngleDrawn(id, rd, qn, ang)
      return checkValue(id, qn, sideFrom(known, numLabel(rd.lab[known])!, want, ang), 'side from the drawing')
    }
    case 'whichExpr': {
      if (!rd || a.kind !== 'mc') return fail(id, 'diagram not read', qn)
      const ang = angleOf(rd.mark)!
      const roles = (['hyp', 'opp', 'adj'] as Role[]).filter((r) => rd.lab[r])
      const known = roles.find((r) => numLabel(rd.lab[r]) !== null)!
      const want = roles.find((r) => numLabel(rd.lab[r]) === null)!
      const x = sideFrom(known, numLabel(rd.lab[known])!, want, ang)
      const vals = a.options.map((o) => {
        const s = strip(o)
        let m = s.match(new RegExp(`^(\\d+) (sin|cos|tan) (${ANG})$`))
        if (m) return Number(m[1]) * trig(m[2], angleOf(m[3])!)
        m = s.match(new RegExp(`^\\(\\((\\d+)\\)/\\((sin|cos|tan) (${ANG})\\)\\)$`))
        if (m) return Number(m[1]) / trig(m[2], angleOf(m[3])!)
        return null
      })
      independent++
      counts['which expression'] = (counts['which expression'] ?? 0) + 1
      const hits = vals.map((v) => v !== null && near(v, x, 1e-9))
      if (vals.some((v) => v === null) || hits.filter(Boolean).length !== 1 || !hits[a.correct]) fail(id, `expressions equal to the side: ${hits.join(',')}`, qn)
      checkAngleDrawn(id, rd, qn, ang)
      return
    }
    case 'whichRatioSides': {
      if (!rd) return fail(id, 'diagram not read', qn)
      const fr = qn.prompt.match(/<span class="fn">(.*?)<\/span><span class="fd">(.*?)<\/span>/)
      const top = (['hyp', 'opp', 'adj'] as Role[]).find((r) => rd.lab[r] === strip(fr?.[1] ?? ''))
      const bot = (['hyp', 'opp', 'adj'] as Role[]).find((r) => rd.lab[r] === strip(fr?.[2] ?? ''))
      const fn = Object.keys(RATIO).find((f) => RATIO[f][0] === top && RATIO[f][1] === bot)
      if (!fn) return fail(id, `${top}/${bot} is not a ratio`, qn)
      return checkOption(id, qn, `${fn} θ`, 'ratio of two marked sides')
    }
    case 'sideDescribed': {
      const m = p.match(new RegExp(`△([A-Z]{3}) is right-angled at ([A-Z]), ([A-Z]{2}) = (\\d+(?:\\.\\d+)?) (mm|cm|m) and ∠([A-Z]) = (${ANG})\\.`)) ?? p.match(new RegExp(`In △([A-Z]{3}), ∠([A-Z]) = 90°, ∠([A-Z]) = (${ANG}) and ([A-Z]{2}) = (\\d+(?:\\.\\d+)?) (mm|cm|m)\\.`))
      const f = p.match(/Find the length of ([A-Z]{2})/)
      if (!m || !f) return fail(id, 'description not read', qn)
      const style1 = /is right-angled/.test(m[0])
      const R = m[2]
      const side = style1 ? m[3] : m[5]
      const k = Number(style1 ? m[4] : m[6])
      const unit = style1 ? m[5] : m[7]
      const A = style1 ? m[6] : m[3]
      const ang = angleOf(style1 ? m[7] : m[4])!
      const roleOf = (s: string): Role => (!s.includes(R) ? 'hyp' : !s.includes(A) ? 'opp' : 'adj')
      if (unit !== qn.suffix) fail(id, 'unit differs', qn)
      return checkValue(id, qn, sideFrom(roleOf(side), k, roleOf(f[1]), ang), 'side from a description')
    }
    case 'context':
      return checkContext(id, qn, p)
    case 'altitude': {
      const m = p.match(/∠A = (\d+)°, ∠C = (\d+)°, AB = (\d+) cm .* Find the length of (BX|CX)/)
      if (!m) return fail(id, 'not read', qn)
      const [A, C, ab] = [Number(m[1]), Number(m[2]), Number(m[3])]
      const bx = ab * Math.sin(A * D2R)
      const cx = bx / Math.tan(C * D2R)
      if (d) {
        // the drawn angles at A and C are the stated ones
        const pts = d.polys[0]
        for (const [arc, size] of d.arcs.map((ar) => [ar, angleOf(ar.label)] as const)) {
          const i = pts.findIndex((pp) => Math.abs(dist(pp, arc.start) - arc.r) < 0.6)
          if (i < 0 || size === null) {
            fail(id, 'angle mark not on a corner', qn)
            continue
          }
          const o = pts.filter((_, k) => k !== i)
          const u = [o[0][0] - pts[i][0], o[0][1] - pts[i][1]]
          const w = [o[1][0] - pts[i][0], o[1][1] - pts[i][1]]
          const drawn = Math.acos((u[0] * w[0] + u[1] * w[1]) / (Math.hypot(u[0], u[1]) * Math.hypot(w[0], w[1]))) / D2R
          if (Math.abs(drawn - size) > 0.6) fail(id, `angle drawn ${drawn.toFixed(1)}° not ${size}°`, qn)
        }
      }
      return checkValue(id, qn, m[4] === 'BX' ? bx : cx, 'two-step side')
    }
    case 'angleFromRatio': {
      const m = p.match(/^If (sin|cos|tan) (\S+) = (.+?), find \2/)
      if (!m) return fail(id, 'not read', qn)
      const fr = m[3].match(/^\(\((\d+)\)\/\((\d+)\)\)$/)
      const x = fr ? Number(fr[1]) / Number(fr[2]) : Number(m[3])
      return checkValue(id, qn, invTrig(m[1], x), 'angle from a ratio')
    }
    case 'angleFromTri':
    case 'angleMC':
    case 'nearestSecond': {
      if (!rd) return fail(id, 'diagram not read', qn)
      const roles = (['hyp', 'opp', 'adj'] as Role[]).filter((r) => numLabel(rd.lab[r]) !== null)
      if (roles.length !== 2 || angleOf(rd.mark) !== null) return fail(id, 'triangle not read', qn)
      const x = angleFrom(roles[0], numLabel(rd.lab[roles[0]])!, roles[1], numLabel(rd.lab[roles[1]])!)
      if (unitLabel(rd.lab[roles[0]]) !== unitLabel(rd.lab[roles[1]])) fail(id, 'mixed units', qn)
      checkScale(id, rd, qn)
      checkAngleDrawn(id, rd, qn, x)
      return checkValue(id, qn, x, 'angle from the drawing')
    }
    case 'angleDescribed': {
      const tri = (p.match(/△([A-Z]{3})/) ?? [])[1] ?? ''
      const R = p.match(/right-angled at ([A-Z])/)?.[1] ?? p.match(/∠([A-Z]) = 90°/)?.[1] ?? ''
      const A = p.match(/Find ∠([A-Z])/)?.[1] ?? ''
      const given = [...p.matchAll(/([A-Z]{2}) = (\d+(?:\.\d+)?) (mm|cm|m)/g)]
      if (given.length !== 2 || !tri.includes(R) || !tri.includes(A) || A === R) return fail(id, 'description not read', qn)
      const roleOf = (s: string): Role => (!s.includes(R) ? 'hyp' : !s.includes(A) ? 'opp' : 'adj')
      const [g1, g2] = given
      if (roleOf(g1[1]) === roleOf(g2[1])) return fail(id, 'two sides with the same role', qn)
      if ((roleOf(g1[1]) === 'hyp' && Number(g1[2]) <= Number(g2[2])) || (roleOf(g2[1]) === 'hyp' && Number(g2[2]) <= Number(g1[2]))) fail(id, 'hypotenuse not the longest side', qn)
      return checkValue(id, qn, angleFrom(roleOf(g1[1]), Number(g1[2]), roleOf(g2[1]), Number(g2[2])), 'angle from a description')
    }
    case 'angleContext':
      return checkAngleContext(id, qn, p)
    case 'complement': {
      let m = p.match(/^Complete: (sin|cos) (\d+)° = (sin|cos) ___°/)
      if (m) {
        if (m[1] === m[3]) fail(id, 'same ratio both sides', qn)
        return checkValue(id, qn, 90 - Number(m[2]), 'complementary angle')
      }
      m = p.match(/___ (\d+)° = (sin|cos) (\d+)°/)
      if (!m || Number(m[1]) + Number(m[3]) !== 90) return fail(id, 'not read', qn)
      const rhs = trig(m[2], Number(m[3]))
      const hits = ['sin', 'cos', 'tan'].filter((f) => Math.abs(trig(f, Number(m[1])) - rhs) < 1e-9)
      if (hits.length !== 1) return fail(id, `${hits.length} ratios fit`, qn)
      return checkOption(id, qn, hits[0], 'which ratio for a complementary angle')
    }
    case 'exactValue': {
      if (a.kind !== 'mc') return fail(id, 'not multiple choice', qn)
      const m = p.match(/exact value of (sin|cos|tan) (\d+)°/)
      if (!m) return fail(id, 'not read', qn)
      const target = trig(m[1], Number(m[2]))
      const val = (o: string) => {
        const s = strip(o).replace(/√(\d+)/g, 'Math.sqrt($1)')
        try {
          return Function(`return (${s})`)() as number
        } catch {
          return NaN
        }
      }
      const hits = a.options.map((o) => Math.abs(val(o) - target) < 1e-9)
      independent++
      counts['exact value'] = (counts['exact value'] ?? 0) + 1
      if (hits.filter(Boolean).length !== 1 || !hits[a.correct]) fail(id, `exact values: ${hits.join(',')}`, qn)
      return
    }
    case 'identity': {
      const m = p.match(/(sin|cos) θ = \(\((\d+)\)\/\((\d+)\)\)/)
      if (!m) return fail(id, 'not read', qn)
      const x = Number(m[2]) / Number(m[3])
      return checkValue(id, qn, Math.sqrt(1 - x * x), 'sin² + cos² = 1')
    }
    case 'planeClimb': {
      let m = p.match(/at an angle of (\d+)° to the horizontal. How far .* gain (\d+) m/)
      if (m) return checkValue(id, qn, Number(m[2]) / Math.sin(Number(m[1]) * D2R), 'plane: distance')
      m = p.match(/must fly ([\d ]+) m along its path to gain (\d+) m/)
      if (!m) return fail(id, 'not read', qn)
      const dd = parseNum(m[1].trim())
      return checkValue(id, qn, Math.asin(Number(m[2]) / (dd / 2)) / D2R, 'plane: angle')
    }
    default:
      fail(id, `no check for ${t}`, qn)
  }
}

/** everyday problems: the numbers are read from the words and the answer re-worked with its own formula */
function checkContext(id: string, qn: Question, p: string) {
  const n = (re: RegExp) => {
    const m = p.match(re)
    if (!m) {
      fail(id, `not read: ${re}`, qn)
      return NaN
    }
    return parseNum(m[1])
  }
  const k = qn.meta!.kind as string
  const deg = (re: RegExp) => n(re)
  let x: number
  switch (k) {
    case 'ladderGround':
      x = n(/A (\d+(?:\.\d+)?) m ladder/) * Math.sin(deg(/angle of (\d+)° with the ground/) * D2R)
      break
    case 'ladderPole':
      x = n(/A (\d+(?:\.\d+)?) m ladder/) * Math.cos(deg(/angle of (\d+)° with the pole/) * D2R)
      break
    case 'shadow':
      x = n(/shadow (\d+) m long/) * Math.tan(deg(/ground at an angle of (\d+)°/) * D2R)
      break
    case 'ramp':
      x = n(/ramp is (\d+(?:\.\d+)?) m long/) * Math.sin(deg(/angle of (\d+(?:\.\d+)?)° with the ground/) * D2R)
      break
    case 'anchor':
      x = n(/rope (\d+(?:\.\d+)?) m long/) * Math.cos(deg(/angle of (\d+)° with the vertical/) * D2R)
      break
    case 'kite':
      x = n(/string (\d+) m long/) * Math.sin(deg(/angle of (\d+)° with the horizontal/) * D2R)
      break
    case 'wire':
      x = n(/pole (\d+) m above/) * Math.tan(deg(/angle of (\d+)° with the pole/) * D2R)
      break
    case 'park': {
      const dd = n(/path (\d+) m long/)
      const th = deg(/angle of (\d+)° with the longer side/)
      x = /longer side of the park/.test(p) ? dd * Math.cos(th * D2R) : dd * Math.sin(th * D2R)
      if (th >= 45) fail(id, 'the side next to the angle isn’t the longer one', qn)
      break
    }
    case 'brace':
      x = n(/brace (\d+) mm long/) * Math.sin(deg(/angle of (\d+)° with the bottom/) * D2R)
      break
    case 'ladderFoot':
      x = n(/(\d+) cm from a wall/) / Math.cos(deg(/angle of (\d+)° with the ground/) * D2R)
      break
    case 'ladderHigh':
      x = n(/reaches (\d+(?:\.\d+)?) m up/) / Math.sin(deg(/angle of (\d+)° with the ground/) * D2R)
      break
    case 'flagWire':
      x = n(/a (\d+) m flagpole/) / Math.tan(deg(/ground at an angle of (\d+)°/) * D2R)
      break
    case 'glider':
      x = n(/flying (\d+(?:\.\d+)?) km above/) / Math.sin(deg(/angle of (\d+)° to the ground/) * D2R)
      break
    case 'rampLength':
      x = n(/(\d+) cm above the ground/) / 100 / Math.sin(deg(/angle of (\d+(?:\.\d+)?)° with the ground/) * D2R)
      break
    case 'balloon':
      x = n(/drifts (\d+) m sideways/) / Math.cos(deg(/angle of (\d+)° with the ground/) * D2R)
      break
    case 'aim':
      x = n(/by (\d+) mm/) / Math.tan(deg(/leaves (\d+(?:\.\d+)?)° off target/) * D2R)
      break
    default:
      return fail(id, `no check for context ${k}`, qn)
  }
  checkValue(id, qn, x, `problem: ${k}`)
}

function checkAngleContext(id: string, qn: Question, p: string) {
  const n = (re: RegExp) => {
    const m = p.match(re)
    if (!m) {
      fail(id, `not read: ${re}`, qn)
      return NaN
    }
    return parseNum(m[1])
  }
  const k = qn.meta!.kind as string
  const asin = (x: number) => Math.asin(x) / D2R
  let x: number
  switch (k) {
    case 'road':
      x = asin(n(/rises (\d+) m/) / n(/every (\d+) m travelled/))
      break
    case 'ladderWall':
      x = Math.acos(n(/reaches (\d+) m up/) / n(/ladder (\d+) m long/)) / D2R
      break
    case 'ladderGround':
      x = asin(n(/reaches (\d+(?:\.\d+)?) m up/) / n(/A (\d+(?:\.\d+)?) m ladder/))
      break
    case 'plane':
      x = Math.atan(n(/height of (\d+(?: \d{3})?) m/) / n(/it is (\d+(?: \d{3})?) m horizontally/)) / D2R
      break
    case 'sun':
      x = Math.atan(n(/pole (\d+(?:\.\d+)?) m tall/) / n(/shadow (\d+(?:\.\d+)?) m long/)) / D2R
      break
    case 'beach':
      x = asin(n(/is (\d+(?:\.\d+)?) m deep/) / n(/walking (\d+(?:\.\d+)?) m down/))
      break
    case 'cone':
      x = Math.acos(n(/diameter of (\d+) m/) / 2 / n(/measures (\d+) m up the slope/)) / D2R
      break
    case 'chain':
      x = asin(n(/water (\d+) m deep/) / n(/chain (\d+) m long/))
      break
    case 'foldLadder':
      x = 2 * asin(n(/feet are (\d+(?:\.\d+)?) m apart/) / 2 / n(/each (\d+(?:\.\d+)?) m long/))
      break
    case 'ramp':
      x = asin(n(/rises (\d+(?:\.\d+)?) m/) / n(/ramp is (\d+) m long/))
      break
    default:
      return fail(id, `no check for angle problem ${k}`, qn)
  }
  checkValue(id, qn, x, `angle problem: ${k}`)
}

// ---------------------------------------------------------------- run

for (const s of NCM4_SKILLS)
  for (const lvl of [1, 2, 3] as Level[])
    for (let i = 0; i < N; i++) {
      setSeed(i * 7919 + lvl * 31 + s.id.length)
      check(`${s.id} L${lvl}`, s.gen(lvl))
    }
for (let i = 0; i < 100; i++) {
  setSeed(5000 + i)
  NCM4_TEST.forEach((it, k) => check(`test Q${k + 1}`, it.gen!(it.level)))
}
// the topic is wired up: 16 test questions, skills in exercise order, every test skill exists, no Path content
const topic = findTopic('y9-trigonometry')
if (!topic || topic.test?.length !== 16) fail('topic', 'topic missing or test is not 16 questions')
if (topic && topic.skills.map((s) => s.ref).join(',') !== 'NCM 9 Ex 4.01,NCM 9 Ex 4.02,NCM 9 Ex 4.03,NCM 9 Ex 4.04,NCM 9 Ex 4.05,NCM 9 Ex 4.06,NCM 9 Ex 4.07,NCM 9 Power plus 4') fail('topic', 'skills out of exercise order')
for (const it of NCM4_TEST) if (!NCM4_SKILLS.some((s) => s.id === it.skill && s.tag !== 'extension')) fail('topic', `test skill ${it.skill} missing or extension`)
// the dms answer kind: an answer given to the minute is marked right in each written form
{
  const a: Answer = { kind: 'dms', value: 36 + 52 / 60 + 11.63 / 3600, to: 'minute' }
  for (const s of ['36°52′', '36 52', "36°52'"]) if (!checkAnswer(a, s).correct) fail('dms', `${s} not accepted`)
}
console.log(`${failures === 0 ? 'PASS' : 'FAIL'}: ${failures} failures, ${independent} answers re-worked independently, ${diagramReads} diagrams read back`)
console.log(Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(' · '))
process.exit(failures ? 1 : 0)
