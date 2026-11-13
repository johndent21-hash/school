// Independent checks for Year 7 Angles (New Century Maths 7, Chapter 2).
// Every question type is re-worked here from scratch: from the numbers it was made from (meta), and above all
// from the drawing itself. The lines, labels and letters are read back out of the SVG, the angles are measured,
// and the relationships (vertically opposite, corresponding, alternate, co-interior, parallel, perpendicular)
// are worked out from where things are on the page, not from how the question was built.
// Usage: npx tsx tests/ncm7-ch2.test.ts   (N per skill and level, default 500)
import { setSeed } from '../src/lib/maths/rand'
import { answerText, checkAnswer } from '../src/lib/maths/check'
import type { Answer, Level, Question } from '../src/lib/maths/types'
import { NCM2_SKILLS, NCM2_TEST } from '../src/content/y7-ncm2'
import { findTopic } from '../src/content/index'

const N = Number(process.env.N ?? 500)
let failures = 0
let independent = 0
let measured = 0
const counts: Record<string, number> = {}
const fail = (id: string, msg: string, qn?: Question) => {
  failures++
  if (failures <= 40) console.log(`FAIL ${id}: ${msg}` + (qn ? `\n   ${strip(qn.prompt).slice(0, 220)}\n   answer ${JSON.stringify(qn.answer).slice(0, 200)}  meta ${JSON.stringify(qn.meta).slice(0, 160)}` : ''))
}

const strip = (h: string) =>
  h
    .replace(/<[^>]*>/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
const plain = (h: string) => h.replace(/<[^>]*>/g, '')

// ------------------------------------------------------------------ geometry read back from a drawing

type P = [number, number]
type Seg = [P, P]
const sub = (a: P, b: P): P => [a[0] - b[0], a[1] - b[1]]
const dist = (a: P, b: P) => Math.hypot(a[0] - b[0], a[1] - b[1])
const cross = (a: P, b: P) => a[0] * b[1] - a[1] * b[0]
const dot = (a: P, b: P) => a[0] * b[0] + a[1] * b[1]
const unit = (a: P): P => {
  const l = Math.hypot(a[0], a[1]) || 1
  return [a[0] / l, a[1] / l]
}
const deg = (r: number) => (r * 180) / Math.PI
/** direction of a→b as a maths angle in degrees (screen y points down) */
const dirOf = (a: P, b: P) => (deg(Math.atan2(-(b[1] - a[1]), b[0] - a[0])) + 360) % 360
/** angle between two undirected lines, 0 to 90 */
const lineAngle = (s: Seg, t: Seg) => {
  const d = Math.abs(dirOf(s[0], s[1]) - dirOf(t[0], t[1])) % 180
  return Math.min(d, 180 - d)
}
/** angle at v between the rays to a and b, 0 to 180 */
const angleAt = (v: P, a: P, b: P) => deg(Math.acos(Math.max(-1, Math.min(1, dot(unit(sub(a, v)), unit(sub(b, v)))))))
const near = (x: number, y: number, tol = 0.6) => Math.abs(x - y) <= tol
function intersect(s: Seg, t: Seg): P {
  const d1 = sub(s[1], s[0])
  const d2 = sub(t[1], t[0])
  const k = cross(sub(t[0], s[0]), d2) / cross(d1, d2)
  return [s[0][0] + d1[0] * k, s[0][1] + d1[1] * k]
}
const distToSeg = (p: P, s: Seg) => {
  const d = sub(s[1], s[0])
  const k = Math.max(0, Math.min(1, dot(sub(p, s[0]), d) / dot(d, d)))
  return dist(p, [s[0][0] + d[0] * k, s[0][1] + d[1] * k])
}

/** does the segment pass through the box centred at c (half-width hw, half-height hh)? */
function segHitsBox(s: Seg, c: P, hw: number, hh: number): boolean {
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

const NUM = '(-?[\\d.]+)'
const segs = (svg: string, cls = 'ln'): Seg[] =>
  [...svg.matchAll(new RegExp(`<line class="${cls}" x1="${NUM}" y1="${NUM}" x2="${NUM}" y2="${NUM}"/>`, 'g'))].map((m) => [
    [Number(m[1]), Number(m[2])],
    [Number(m[3]), Number(m[4])],
  ])
interface Label {
  cls: string
  p: P
  s: string
}
const labels = (svg: string): Label[] => [...svg.matchAll(new RegExp(`<text class="([^"]*)" x="${NUM}" y="${NUM}"[^>]*>(.*?)</text>`, 'g'))].map((m) => ({ cls: m[1], p: [Number(m[2]), Number(m[3])], s: plain(m[4]) }))
const angLabels = (svg: string) => labels(svg).filter((l) => /\bang\b/.test(l.cls))
const vxLabels = (svg: string) => labels(svg).filter((l) => /\bvx\b/.test(l.cls))
const arrowheads = (svg: string) => (svg.match(/<path class="ln" d="M[^"]*"\/>/g) ?? []).length
const rightMarks = (svg: string) => (svg.match(/<path class="rm"/g) ?? []).length
const sizeOfLabel = (s: string) => (/^\d+°$/.test(s) ? Number(s.slice(0, -1)) : null)

/** Rays from one point (the dot): where they point, and the size of the gap that a label sits in. */
function readPoint(svg: string) {
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
function readLetters(svg: string) {
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
function readTransversal(svg: string) {
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

const mcOf = (qn: Question) => qn.answer as Extract<Answer, { kind: 'mc' }>
const chosen = (qn: Question) => plain(mcOf(qn).options[mcOf(qn).correct])
const TYPE = (a: number) => (a < 90 ? 'Acute' : a === 90 ? 'Right' : a < 180 ? 'Obtuse' : a === 180 ? 'Straight' : a < 360 ? 'Reflex' : 'Revolution')

// ------------------------------------------------------------------ every skill, every level

for (const skill of NCM2_SKILLS) {
  for (const lvl of [1, 2, 3] as Level[]) {
    for (let i = 0; i < N; i++) {
      setSeed(77 + i * 7919 + lvl * 104729 + skill.id.length * 131)
      const qn = skill.gen(lvl)
      const id = `${skill.id} L${lvl}`
      const m = (qn.meta ?? {}) as Record<string, any>
      const t = (m.t as string) ?? 'none'
      counts[`${skill.id}:${t}`] = (counts[`${skill.id}:${t}`] ?? 0) + 1
      const svg = qn.diagram ?? ''
      const ans = qn.answer.kind === 'num' ? qn.answer.value : null
      if (!qn.meta) fail(id, 'no meta', qn)

      // ---- the marker accepts the stored answer; choices are all different
      if (qn.answer.kind !== 'mc' && !checkAnswer(qn.answer, answerText(qn.answer)).correct) fail(id, 'answer not accepted', qn)
      if (qn.answer.kind === 'mc') {
        const opts = qn.answer.options.map(plain)
        if (new Set(opts).size !== opts.length) fail(id, 'two choices are the same', qn)
        if (opts.length < 2 || qn.answer.correct < 0 || qn.answer.correct >= opts.length) fail(id, 'bad choices', qn)
        if (opts.length < 3 && !/^(Yes|No)/.test(opts[0])) fail(id, 'fewer than 3 choices', qn)
      }
      if (ans !== null && (ans <= 0 || ans > 360 || !Number.isInteger(ans * 2))) fail(id, `odd answer ${ans}`, qn)

      // ---- wording
      const all = qn.prompt + ' ' + qn.steps.join(' ') + ' ' + qn.hint
      const text = strip(all)
      const words = strip(all.replace(/<i>[^<]*<\/i>/g, 'X'))
      if (/NaN|undefined|null|°°|−0\b/.test(text)) fail(id, 'bad text: ' + text.match(/.{0,20}(NaN|undefined|null|°°|−0\b).{0,10}/)?.[0], qn)
      if (/\b1 (pairs|gaps|angles|turns|hours|minutes|parts|lines|arms|degrees)\b/.test(text)) fail(id, 'plural slip: ' + text.match(/\b1 \w+/)?.[0], qn)
      if (/\ba [aeiou]/.test(words.replace(/\ba (unit|one)/g, ''))) fail(id, 'article slip: ' + words.match(/\ba [aeiou]\w*/)?.[0], qn)
      if (/\ban [^aeiouXFRLMNSH8]/.test(words)) fail(id, 'article slip: ' + words.match(/\ban \w+/)?.[0], qn)
      if (!qn.hint || !qn.steps.length || qn.steps.some((s) => !s)) fail(id, 'missing hint or steps', qn)
      if (/\d\.\d{3,}/.test(text + svg.replace(/[xy][12]?="[^"]*"|d="[^"]*"|points="[^"]*"|viewBox="[^"]*"|rotate\([^)]*\)/g, ''))) fail(id, 'long decimal shown', qn)

      // ---- labels on drawings are clear of each other
      const labs = labels(svg)
      for (let a = 0; a < labs.length; a++) for (let b = a + 1; b < labs.length; b++) if (!/\b(pout|pin|clocknum)\b/.test(labs[a].cls) && !/\b(pout|pin|clocknum)\b/.test(labs[b].cls) && dist(labs[a].p, labs[b].p) < 12) fail(id, `labels ${labs[a].s} and ${labs[b].s} overlap`, qn)

      // ---- no label is written across a line (the box round each label must be clear of every line drawn)
      {
        const drawn = [...svg.matchAll(new RegExp(`<line class="ln[^"]*" x1="${NUM}" y1="${NUM}" x2="${NUM}" y2="${NUM}"/>`, 'g'))].map((mm) => [[+mm[1], +mm[2]], [+mm[3], +mm[4]]] as Seg)
        for (const l of labs) {
          if (!/\b(ang|vx|side)\b/.test(l.cls) || /\bsym\b/.test(l.cls)) continue
          const hw = Math.max(4, l.s.length * 4.1 - 1)
          const hh = 6
          for (const sg of drawn) if (segHitsBox(sg, l.p, hw, hh)) fail(id, `label ${l.s} is written across a line`, qn)
        }
      }

      const tv = /transversal/.test(svg.match(/aria-label="([^"]*)"/)?.[1] ?? '') ? readTransversal(svg) : null
      if (tv) {
        measured++
        // every size written on the drawing is the true size of the angle it sits in
        for (const l of angLabels(svg)) {
          const sp = tv.spot(l.p)
          const size = sizeOfLabel(l.s)
          if (size !== null && !near(sp.size, size)) fail(id, `label ${l.s} sits in an angle of ${sp.size.toFixed(1)}°`, qn)
          if (sp.toLines < 5) fail(id, `label ${l.s} is on a line`, qn)
        }
        // arrowheads are only drawn on lines that really are parallel
        if (arrowheads(svg) === 2 && !tv.parallel) fail(id, 'arrowheads on lines that are not parallel', qn)
        if (/arrowheads are parallel/.test(qn.prompt) && arrowheads(svg) !== 2) fail(id, 'prompt says arrowheads but none drawn', qn)
        for (const l of vxLabels(svg)) if (Math.min(distToSeg(l.p, tv.l0), distToSeg(l.p, tv.l1), distToSeg(l.p, tv.t)) < 5) fail(id, `letter ${l.s} is on a line`, qn)
      }
      const find = (s: string) => angLabels(svg).filter((l) => l.s === s)
      const unknown = () => angLabels(svg).filter((l) => /^[a-z]°$/.test(l.s))
      const given = () => angLabels(svg).filter((l) => sizeOfLabel(l.s) !== null)

      switch (t) {
        // ============================================================ 2.01
        case 'lineKind': {
          const n = arrowheads(svg)
          independent++
          if (chosen(qn).split(' ')[1] !== ['interval', 'ray', 'line'][n]) fail(id, `${n} arrowheads but answer ${chosen(qn)}`, qn)
          break
        }
        case 'vertex':
          independent++
          if (chosen(qn) !== m.name[1]) fail(id, 'vertex is the middle letter', qn)
          break
        case 'arms': {
          const [a, b, c] = m.name.split('')
          independent++
          if (chosen(qn) !== `${b}${a} and ${b}${c}`) fail(id, 'arms wrong', qn)
          break
        }
        case 'nameSingle':
        case 'nameNot': {
          const r = readLetters(svg)!
          measured++
          const valid = (o: string) => (o.length === 2 ? o[1] === r.vertex : r.angle(o.slice(1)) !== null)
          const opts = mcOf(qn).options.map(plain)
          independent++
          opts.forEach((o, k) => {
            const want = t === 'nameSingle' ? k === mcOf(qn).correct : k !== mcOf(qn).correct
            if (valid(o) !== want) fail(id, `${o} is ${valid(o) ? '' : 'not '}a name for the angle drawn (vertex ${r.vertex})`, qn)
          })
          break
        }
        case 'nameMarked': {
          const r = readLetters(svg)!
          measured++
          const mark = angLabels(svg).find((l) => l.s === m.sym)!
          const gap = r.gapAt(mark.p)
          const letterOf = (ray: { end: P }) => Object.keys(r.arms).find((k) => r.arms[k] === ray)!
          const want = [letterOf(gap.lo), letterOf(gap.hi)].sort().join('')
          const opts = mcOf(qn).options.map(plain)
          independent++
          opts.forEach((o, k) => {
            const is = o.length === 4 && o[2] === r.vertex && [o[1], o[3]].sort().join('') === want
            if (is !== (k === mcOf(qn).correct)) fail(id, `${o}: the mark is between ${want} at ${r.vertex}`, qn)
          })
          break
        }
        case 'sharedArm': {
          const r = readLetters(svg)!
          measured++
          const [a, b, c] = m.arms as string[]
          const between = near(r.angle(a + r.vertex + b)! + r.angle(b + r.vertex + c)!, r.angle(a + r.vertex + c)!)
          independent++
          if (!between || chosen(qn) !== r.vertex + b) fail(id, 'shared arm is not the middle one', qn)
          break
        }
        case 'adjacent': {
          const r = readLetters(svg)!
          measured++
          const target = strip(qn.prompt).match(/∠(\w{3})/)![1]
          /** adjacent: same vertex, one arm in common, and the 2 angles side by side (they add to the angle between the outer arms) */
          const adjacent = (x: string, y: string) => {
            const ax = [x[0], x[2]]
            const ay = [y[0], y[2]]
            const common = ax.filter((k) => ay.includes(k))
            if (x[1] !== r.vertex || y[1] !== r.vertex || common.length !== 1 || r.angle(x) === null || r.angle(y) === null) return false
            const outer = [...ax, ...ay].filter((k) => k !== common[0])
            return near(r.angle(x)! + r.angle(y)!, r.angle(outer[0] + r.vertex + outer[1])!)
          }
          independent++
          mcOf(qn).options.map(plain).forEach((o, k) => {
            if (adjacent(target, o.slice(1)) !== (k === mcOf(qn).correct)) fail(id, `${o} ${adjacent(target, o.slice(1)) ? 'is' : 'is not'} adjacent to ∠${target}`, qn)
          })
          break
        }
        case 'countAngles': {
          const r = readPoint(svg)!
          measured++
          const span = r.rays[r.rays.length - 1].dir - r.rays[0].dir
          const widest = Math.max(...r.rays.map((ray, k) => (r.rays[(k + 1) % r.rays.length].dir - ray.dir + 360) % 360))
          independent++
          if (ans !== (r.rays.length * (r.rays.length - 1)) / 2) fail(id, `${r.rays.length} arms drawn`, qn)
          if (widest <= 180) fail(id, `arms are not all on one side (span ${span})`, qn)
          break
        }
        // ============================================================ 2.02
        case 'protractor':
        case 'protractorReflex': {
          const arms = segs(svg, 'ln hlstroke')
          measured++
          const size = angleAt(arms[0][0], arms[0][1], arms[1][1])
          const baseDir = dirOf(arms[0][0], arms[0][1])
          const want = t === 'protractor' ? size : 360 - size
          independent++
          if (!near(want, ans!, 0.2)) fail(id, `protractor arms are ${size.toFixed(1)}° apart`, qn)
          if (!(near(baseDir, 0, 0.01) || near(baseDir, 180, 0.01))) fail(id, 'first arm is not on the base line', qn)
          const scale = near(baseDir, 0, 0.01) ? 'inside' : 'outside'
          if (!qn.steps[0].includes(scale)) fail(id, `should say the ${scale} scale`, qn)
          // the numbers on the scale the question uses read the same as the answer
          const reading = Math.round(size)
          if (reading % 10 === 0) {
            const tip = arms[1][1]
            const c = arms[0][0]
            const onArm = labels(svg).filter((l) => /\b(pout|pin)\b/.test(l.cls) && distToSeg(l.p, [c, tip]) < 2.5 && dist(l.p, c) > 60)
            const read = onArm.find((l) => l.cls.includes(scale === 'inside' ? 'pin' : 'pout'))
            if (!read || Number(read.s) !== reading) fail(id, `the ${scale} scale reads ${read?.s} at the arm, not ${reading}`, qn)
          }
          break
        }
        case 'estimate':
        case 'classifyDiagram': {
          const ls = segs(svg)
          measured++
          const size = ls.length === 1 ? 360 : (dirOf(ls[0][0], ls[1][1]) - dirOf(ls[0][0], ls[0][1]) + 360) % 360
          independent++
          if (!near(size, m.size, 0.2)) fail(id, `drawn ${size.toFixed(1)}°, meta ${m.size}`, qn)
          if (t === 'estimate') {
            const opts = mcOf(qn).options.map((o) => parseInt(plain(o)))
            if (opts[mcOf(qn).correct] !== Math.round(size)) fail(id, 'estimate is not the drawn size', qn)
            if (opts.some((o, k) => k !== mcOf(qn).correct && Math.abs(o - size) < 35)) fail(id, 'another choice is too close', qn)
          } else {
            if (chosen(qn) !== TYPE(Math.round(size))) fail(id, `drawn ${size.toFixed(0)}° is ${TYPE(Math.round(size))}`, qn)
            // a right angle must be drawn with its square, and nothing else may be
            if ((rightMarks(svg) === 1) !== (Math.round(size) === 90)) fail(id, 'right-angle square wrong', qn)
          }
          break
        }
        case 'whichScale':
          independent++
          if (ans !== (m.acute ? m.small : 180 - m.small)) fail(id, 'which scale', qn)
          break
        case 'order': {
          const ls = segs(svg)
          measured++
          const sizes = [0, 1, 2].map((k) => angleAt(ls[2 * k][0], ls[2 * k][1], ls[2 * k + 1][1]))
          const want = sizes
            .map((s, k) => ({ s, l: 'ABC'[k] }))
            .sort((x, y) => x.s - y.s)
            .map((x) => x.l)
            .join(', ')
          const sorted = sizes.slice().sort((x, y) => x - y)
          independent++
          if (chosen(qn) !== want) fail(id, `drawn order is ${want}`, qn)
          if (sorted[1] - sorted[0] < 20 || sorted[2] - sorted[1] < 20) fail(id, 'angles too close to compare by eye', qn)
          break
        }
        case 'reflex': {
          const r = readPoint(svg)!
          measured++
          const inner = angleAt(r.V, r.rays[0].end, r.rays[1].end)
          independent++
          if (!near(360 - inner, ans!, 0.2) || !near(inner, m.inner, 0.2)) fail(id, `arms are ${inner.toFixed(1)}° apart`, qn)
          const g = given()[0]
          if (!g || !near(r.gapAt(g.p).size, sizeOfLabel(g.s)!)) fail(id, 'the given size is not in the angle it labels', qn)
          const u = unknown()[0]
          if (!u || !near(r.gapAt(u.p).size, ans!)) fail(id, 'the unknown is not in the reflex angle', qn)
          break
        }
        case 'reflexDraw':
          independent++
          if (ans !== 360 - m.angle || m.angle <= 180) fail(id, 'reflex draw', qn)
          break
        // ============================================================ 2.03
        case 'classifySize':
          independent++
          if (chosen(qn) !== TYPE(m.size) || !qn.prompt.includes(`${m.size}°`)) fail(id, 'type of size', qn)
          break
        case 'turnDegrees': {
          const want = /three-quarter/.test(qn.prompt) ? 270 : /quarter/.test(qn.prompt) ? 90 : /half/.test(qn.prompt) ? 180 : 360
          independent++
          if (ans !== want) fail(id, 'turn', qn)
          break
        }
        case 'whichIsType': {
          const want = strip(qn.prompt).match(/is an? (\w+)/)![1]
          const opts = mcOf(qn).options.map((o) => parseInt(plain(o)))
          independent++
          opts.forEach((o, k) => {
            if ((TYPE(o).toLowerCase() === want) !== (k === mcOf(qn).correct)) fail(id, `${o}° is ${TYPE(o)}`, qn)
          })
          break
        }
        case 'twoTypes': {
          const r = readPoint(svg)!
          measured++
          const ls = angLabels(svg)
          const names = plain(qn.prompt).match(/\b([a-z]) and ([a-z]), in that order/)!
          const sizes = [names[1], names[2]].map((nm) => r.gapAt(ls.find((l) => l.s === nm)!.p).size)
          independent++
          if (chosen(qn) !== sizes.map((s) => TYPE(Math.round(s)).toLowerCase()).join(' and ')) fail(id, `drawn ${sizes.map((s) => s.toFixed(0))}`, qn)
          break
        }
        case 'clock': {
          const a = 30 * Math.min(m.h, 12 - m.h)
          independent++
          if (chosen(qn) !== TYPE(a) || !qn.prompt.includes(`${m.h} o’clock`)) fail(id, 'clock', qn)
          // the hands on the drawing: the minute hand points to 12 and the hour hand to h
          const hands = [...svg.matchAll(new RegExp(`<line class="hand[^"]*" x1="${NUM}" y1="${NUM}" x2="${NUM}" y2="${NUM}"`, 'g'))].map((mm) => [[+mm[1], +mm[2]], [+mm[3], +mm[4]]] as Seg)
          if (hands.length === 2) {
            measured++
            const between = angleAt(hands[0][0], hands[0][1], hands[1][1])
            if (!near(between, a, 1)) fail(id, `hands drawn ${between.toFixed(0)}° apart, expected ${a}`, qn)
          } else fail(id, 'clock hands not found', qn)
          break
        }
        case 'countType': {
          const shown = [...strip(qn.prompt).matchAll(/(\d+)°/g)].map((x) => Number(x[1]))
          const want = strip(qn.prompt).match(/are (\w+) \?/)![1]
          independent++
          if (shown.length !== 6 || ans !== shown.filter((s) => TYPE(s).toLowerCase() === want).length) fail(id, 'count of type', qn)
          break
        }
        // ============================================================ 2.04
        case 'complement':
          independent++
          if (ans !== 90 - m.a || !qn.prompt.includes(`${m.a}°`)) fail(id, 'complement', qn)
          break
        case 'supplement':
          independent++
          if (ans !== 180 - m.a || !qn.prompt.includes(`${m.a}°`)) fail(id, 'supplement', qn)
          break
        case 'compSupp': {
          const [a, b] = [...strip(qn.prompt).matchAll(/(\d+)°/g)].map((x) => Number(x[1]))
          independent++
          if (chosen(qn) !== (a + b === 90 ? 'Complementary' : a + b === 180 ? 'Supplementary' : 'Neither')) fail(id, 'comp or supp', qn)
          break
        }
        case 'addAdjacent': {
          const r = readLetters(svg)!
          measured++
          const names = [...strip(qn.prompt).matchAll(/∠(\w{3})/g)].map((x) => x[1])
          const said = [...strip(qn.prompt).matchAll(/= (\d+)°/g)].map((x) => Number(x[1]))
          independent++
          if (!near(r.angle(names[0])!, said[0]) || !near(r.angle(names[1])!, said[1])) fail(id, 'drawn angles differ from the sizes given', qn)
          if (!near(r.angle(names[2])!, ans!)) fail(id, `∠${names[2]} is drawn ${r.angle(names[2])}`, qn)
          for (const l of given()) if (!near(r.gapAt(l.p).size, sizeOfLabel(l.s)!)) fail(id, `label ${l.s} in the wrong angle`, qn)
          break
        }
        case 'inRight':
        case 'onLine':
        case 'equalParts':
        case 'atPoint':
        case 'equalAtPoint':
        case 'threeLines':
        case 'vertOpp':
        case 'crossAdj': {
          const r = readPoint(svg)!
          measured++
          independent++
          // every size on the drawing is the true size of its angle, and the unknown's angle is the answer
          for (const l of given()) if (!near(r.gapAt(l.p).size, sizeOfLabel(l.s)!)) fail(id, `label ${l.s} sits in an angle of ${r.gapAt(l.p).size.toFixed(1)}°`, qn)
          const us = unknown()
          if (!us.length) fail(id, 'no unknown on the drawing', qn)
          for (const u of us) if (!near(r.gapAt(u.p).size, ans!)) fail(id, `unknown sits in an angle of ${r.gapAt(u.p).size.toFixed(1)}°, answer ${ans}`, qn)
          // and the arithmetic, from the numbers on the drawing alone
          const shown = given().map((l) => sizeOfLabel(l.s)!)
          const total = t === 'inRight' || (t === 'equalParts' && m.total === 90) ? 90 : t === 'onLine' || t === 'equalParts' ? 180 : 360
          if (t === 'inRight' || t === 'onLine' || t === 'atPoint') {
            // a square with no size beside it stands for 90° (a size of 90° written beside a square is already counted)
            const boxes = rightMarks(svg) - (t === 'inRight' ? 1 : 0) - shown.filter((x) => x === 90).length
            if (ans !== total - shown.reduce((s, x) => s + x, 0) - 90 * boxes) fail(id, `sizes shown ${shown} (+${boxes} right angles) leave ${total - shown.reduce((s, x) => s + x, 0) - 90 * boxes}`, qn)
          }
          if (t === 'equalParts' || t === 'equalAtPoint') if (ans !== (total - shown.reduce((s, x) => s + x, 0)) / us.length) fail(id, 'equal parts', qn)
          if (t === 'threeLines') {
            if (r.rays.length !== 6 || ans !== 180 - shown[0] - shown[1]) fail(id, 'three lines', qn)
            // the 6 rays make 3 straight lines
            for (let k = 0; k < 3; k++) if (!near((r.rays[k + 3].dir - r.rays[k].dir + 360) % 360, 180, 0.05)) fail(id, 'rays are not straight lines', qn)
          }
          if (t === 'inRight' && !near(Math.max(...r.rays.map((x) => x.dir)) - Math.min(...r.rays.map((x) => x.dir)), 90, 0.05)) fail(id, 'not a right angle', qn)
          if (t === 'vertOpp' && ans !== shown[0]) fail(id, 'vertically opposite', qn)
          if (t === 'crossAdj' && ans !== 180 - shown[0]) fail(id, 'on a line', qn)
          break
        }
        case 'namePair': {
          const r = readLetters(svg)!
          measured++
          const total = m.kind === 'complementary' ? 90 : 180
          independent++
          mcOf(qn).options.map(plain).forEach((o, k) => {
            const [x, y] = [...o.matchAll(/∠(\w{3})/g)].map((mm) => r.angle(mm[1])!)
            if (near(x + y, total) !== (k === mcOf(qn).correct)) fail(id, `${o} add to ${x + y}`, qn)
          })
          if ((m.kind === 'complementary') !== (rightMarks(svg) === 1)) fail(id, 'right-angle mark', qn)
          break
        }
        case 'compThenSupp':
          independent++
          if (ans !== (m.from === 'complement' ? 180 - (90 - m.given) : 90 - (180 - m.given)) || !qn.prompt.includes(`${m.given}°`)) fail(id, 'complement then supplement', qn)
          break
        case 'timesAngle': {
          const total = /complementary/.test(qn.prompt) ? 90 : 180
          const k = /twice/.test(qn.prompt) ? 2 : Number(strip(qn.prompt).match(/(\d+) times/)![1])
          independent++
          if (ans! * (k + 1) !== total) fail(id, 'times angle', qn)
          break
        }
        // ============================================================ 2.05
        case 'vertOppLetter': {
          const r = readPoint(svg)!
          measured++
          const ls = angLabels(svg)
          const asked = ls.find((l) => l.s === m.ask)!
          const opposite = ls.filter((l) => l !== asked && near((dirOf(r.V, l.p) - dirOf(r.V, asked.p) + 360) % 360, 180, 3))
          independent++
          if (opposite.length !== 1 || opposite[0].s !== chosen(qn)) fail(id, `across from ${m.ask} is ${opposite.map((l) => l.s)}`, qn)
          break
        }
        case 'twoVars': {
          const r = readPoint(svg)!
          measured++
          const vals = Object.fromEntries([...chosen(qn).matchAll(/([a-z]) = (\d+)/g)].map((x) => [x[1], Number(x[2])]))
          independent++
          for (const u of unknown()) if (!near(r.gapAt(u.p).size, vals[u.s[0]])) fail(id, `${u.s} sits in an angle of ${r.gapAt(u.p).size.toFixed(1)}°`, qn)
          for (const l of given()) if (!near(r.gapAt(l.p).size, sizeOfLabel(l.s)!)) fail(id, 'given size in the wrong angle', qn)
          break
        }
        case 'vertOppNamed':
        case 'suppNamed': {
          const r = readLetters(svg)!
          measured++
          const opposite = (x: string, y: string) => x[1] === r.vertex && y[1] === r.vertex && [0, 2].every((k) => [0, 2].some((j) => near(Math.abs(r.arms[x[k]].dir - r.arms[y[j]].dir), 180, 0.05)))
          independent++
          if (t === 'vertOppNamed') {
            const asked = strip(qn.prompt).match(/opposite ∠(\w{3})/)![1]
            mcOf(qn).options.map(plain).forEach((o, k) => {
              if (opposite(asked, o.slice(1)) !== (k === mcOf(qn).correct)) fail(id, `${o} vs ∠${asked}`, qn)
            })
          } else {
            mcOf(qn).options.map(plain).forEach((o, k) => {
              const [x, y] = [...o.matchAll(/∠(\w{3})/g)].map((mm) => r.angle(mm[1])!)
              if (near(x + y, 180) !== (k === mcOf(qn).correct)) fail(id, `${o} add to ${x + y}`, qn)
            })
          }
          break
        }
        // ============================================================ 2.06
        case 'symbol': {
          const sym = strip(m.write ? chosen(qn) : qn.prompt).includes('∥') ? 'parallel' : 'perpendicular'
          const word = strip(m.write ? qn.prompt : chosen(qn)).match(/is (parallel|perpendicular) to/)![1]
          independent++
          if (sym !== word) fail(id, 'symbol and word disagree', qn)
          break
        }
        case 'lineRelation': {
          const ls = segs(svg)
          measured++
          const a = lineAngle(ls[0], ls[1])
          const want = a < 0.05 ? 'Parallel' : near(a, 90, 0.05) ? 'Perpendicular' : 'Intersecting, but not perpendicular'
          independent++
          if (chosen(qn) !== want) fail(id, `lines drawn ${a.toFixed(1)}° apart`, qn)
          if ((arrowheads(svg) === 2) !== (want === 'Parallel') || (rightMarks(svg) === 1) !== (want === 'Perpendicular')) fail(id, 'marks do not match the lines', qn)
          if (want[0] === 'I' && (a < 30 || a > 70)) fail(id, `intersecting lines too close to parallel or perpendicular (${a})`, qn)
          break
        }
        case 'markMeaning':
          independent++
          if (chosen(qn) !== (/arrowhead/.test(qn.prompt) ? 'The lines are parallel' : 'The lines are perpendicular')) fail(id, 'mark meaning', qn)
          break
        case 'intersectPoint': {
          const ls = segs(svg)
          measured++
          const X = intersect(ls[0], ls[1])
          const nearest = vxLabels(svg).sort((a, b) => dist(a.p, X) - dist(b.p, X))[0]
          independent++
          if (nearest.s !== chosen(qn) || dist(nearest.p, X) > 24) fail(id, `nearest letter to the crossing is ${nearest.s}`, qn)
          if (Math.min(...ls.map((l) => distToSeg(nearest.p, l))) < 6) fail(id, 'letter on a line', qn)
          break
        }
        case 'lineSet': {
          const ls = segs(svg)
          measured++
          const vx = vxLabels(svg)
          // name each line by the letters beside its 2 ends
          const named: Record<string, Seg> = {}
          for (const l of ls) {
            const ends = l.map((e) => vx.slice().sort((a, b) => dist(a.p, e) - dist(b.p, e))[0])
            if (dist(ends[0].p, l[0]) > 20 || dist(ends[1].p, l[1]) > 20) fail(id, 'line end has no letter', qn)
            named[ends[0].s + ends[1].s] = l
          }
          const rel = (x: string, y: string) => {
            const a = lineAngle(named[x], named[y])
            return a < 0.05 ? 'parallel' : near(a, 90, 0.05) ? 'perpendicular' : 'neither'
          }
          independent++
          if (m.ask === 'true') {
            mcOf(qn).options.map(plain).forEach((o, k) => {
              const [x, sym, y] = o.split(' ')
              const truth = rel(x, y) === (sym === '∥' ? 'parallel' : 'perpendicular')
              if (truth !== (k === mcOf(qn).correct)) fail(id, `${o} is ${truth}`, qn)
            })
          } else {
            const target = strip(qn.prompt).match(/(?:parallel|perpendicular) to (\w\w)/)![1]
            mcOf(qn).options.map(plain).forEach((o, k) => {
              if ((rel(target, o) === m.ask) !== (k === mcOf(qn).correct)) fail(id, `${o} is ${rel(target, o)} to ${target}`, qn)
            })
          }
          // marks: arrowheads only on a parallel pair; squares only where lines are perpendicular
          if (arrowheads(svg) !== 2) fail(id, 'expected 2 arrowheads', qn)
          break
        }
        case 'map': {
          const roads = segs(svg, 'road')
          measured++
          const small = labels(svg).filter((l) => /\bsmall\b/.test(l.cls))
          const roadOf = (nm: string) => {
            const l = small.find((x) => x.s === nm)!
            return roads.slice().sort((a, b) => distToSeg(l.p, a) - distToSeg(l.p, b))[0]
          }
          const target = strip(qn.prompt).match(/to (.+)\?$/)![1]
          independent++
          if (small.length !== 6 || roads.length !== 6) fail(id, 'map should have 6 named streets', qn)
          mcOf(qn).options.map(plain).forEach((o, k) => {
            const a = lineAngle(roadOf(target), roadOf(o))
            const r = a < 0.05 ? 'parallel' : near(a, 90, 0.05) ? 'perpendicular' : 'neither'
            if ((r === m.ask) !== (k === mcOf(qn).correct)) fail(id, `${o} is ${r} to ${target}`, qn)
          })
          break
        }
        case 'countPairs': {
          const ls = segs(svg)
          measured++
          let par = 0
          let perp = 0
          for (let a = 0; a < ls.length; a++)
            for (let b = a + 1; b < ls.length; b++) {
              const ang = lineAngle(ls[a], ls[b])
              if (ang < 0.05) par++
              else if (near(ang, 90, 0.05)) perp++
            }
          independent++
          if (ans !== (m.ask === 'parallel' ? par : perp)) fail(id, `drawn: ${par} parallel pairs, ${perp} perpendicular pairs`, qn)
          if (!qn.prompt.includes(`pairs of ${m.ask} lines`)) fail(id, 'prompt', qn)
          break
        }
        case 'perpToSame': {
          const s = strip(qn.prompt)
          const [r1, r2] = [...s.matchAll(/\w\w ([∥⊥]) \w\w/g)].map((x) => x[1])
          independent++
          if (chosen(qn) !== (r1 === r2 ? 'Parallel' : 'Perpendicular')) fail(id, 'perpendicular to the same line', qn)
          break
        }
        case 'quad': {
          const solid = segs(svg)
          const dashed = segs(svg, 'ln dash')
          measured++
          independent++
          if (/Trapezium/.test(chosen(qn))) {
            if (lineAngle(solid[0], solid[1]) > 0.05 || near(dist(...solid[0]), dist(...solid[1]), 5) || lineAngle(dashed[0], dashed[1]) < 5) fail(id, 'not a trapezium as described', qn)
          } else {
            const sides = dashed.length === 4 ? dashed : [...solid, ...dashed]
            const lens = sides.map((s) => dist(...s))
            if (!lens.every((l) => near(l, lens[0], 0.5))) fail(id, `sides not equal: ${lens.map((l) => l.toFixed(0))}`, qn)
            // no right angles at the corners
            const corner = sides.flatMap((s) => sides.filter((u) => u !== s && (dist(u[0], s[0]) < 1 || dist(u[1], s[0]) < 1 || dist(u[0], s[1]) < 1 || dist(u[1], s[1]) < 1)).map((u) => lineAngle(s, u)))
            if (corner.some((a) => near(a, 90, 3) || a < 3)) fail(id, 'rhombus has a right angle or a flat corner', qn)
            if (dashed.length === 4 && (!near(lineAngle(solid[0], solid[1]), 90, 0.05) || rightMarks(svg) !== 1)) fail(id, 'diagonals not at right angles', qn)
          }
          if (chosen(qn) !== (m.variant === 'trapezium' ? 'Trapezium' : 'Rhombus')) fail(id, 'quadrilateral name', qn)
          break
        }
        // ============================================================ 2.07 to 2.11: two lines and a transversal
        case 'relLetter': {
          const dotL = find('•')[0]
          const lets = angLabels(svg).filter((l) => /^[a-z]$/.test(l.s))
          independent++
          const hits = lets.filter((l) => tv!.relation(tv!.spot(dotL.p), tv!.spot(l.p)) === m.rel)
          if (hits.length !== 1 || hits[0].s !== chosen(qn) || lets.length !== 4) fail(id, `${m.rel} to the dot: ${hits.map((l) => l.s)}`, qn)
          if (!qn.prompt.includes(`is ${m.rel} to`)) fail(id, 'prompt', qn)
          break
        }
        case 'relFind':
        case 'reason': {
          const g = given()[0]
          const u = unknown()[0]
          const rel = tv!.relation(tv!.spot(g.p), tv!.spot(u.p))
          independent++
          if (rel !== m.rel) fail(id, `the 2 marked angles are drawn ${rel}`, qn)
          const want = rel === 'co-interior' ? 180 - sizeOfLabel(g.s)! : sizeOfLabel(g.s)!
          if (!near(tv!.spot(u.p).size, want)) fail(id, 'unknown angle is not its true size', qn)
          if (t === 'relFind' && ans !== want) fail(id, `re-worked ${want}`, qn)
          if (t === 'reason') {
            if (!chosen(qn).toLowerCase().startsWith(rel)) fail(id, `reason should be ${rel}`, qn)
            if (!qn.prompt.includes(`= ${want}.`)) fail(id, 'value in the prompt', qn)
          }
          if (!tv!.parallel) fail(id, 'lines not parallel', qn)
          break
        }
        case 'relPair': {
          const byLetter = Object.fromEntries(angLabels(svg).map((l) => [l.s, tv!.spot(l.p)]))
          independent++
          const want = strip(qn.prompt).match(/pairs are ([\w-]+(?: \w+)?) angles/)![1]
          if (want !== m.rel) fail(id, 'prompt', qn)
          mcOf(qn).options.map(plain).forEach((o, k) => {
            const [x, y] = o.split(' and ')
            const rel = tv!.relation(byLetter[x], byLetter[y])
            if ((rel === m.rel) !== (k === mcOf(qn).correct)) fail(id, `${o} are ${rel}`, qn)
          })
          if (Object.keys(byLetter).length !== 8) fail(id, '8 letters expected', qn)
          break
        }
        case 'relCount': {
          const sp = angLabels(svg).map((l) => tv!.spot(l.p))
          let n = 0
          for (let a = 0; a < sp.length; a++) for (let b = a + 1; b < sp.length; b++) if (tv!.relation(sp[a], sp[b]) === m.rel) n++
          independent++
          if (ans !== n) fail(id, `${n} ${m.rel} pairs on the drawing`, qn)
          // the pairs listed in the working are all of that kind
          const byLetter = Object.fromEntries(angLabels(svg).map((l) => [l.s, tv!.spot(l.p)]))
          const listed = [...strip(qn.steps[1]).matchAll(/([a-h]) and ([a-h])/g)]
          if (listed.length !== n || listed.some((x) => tv!.relation(byLetter[x[1]], byLetter[x[2]]) !== m.rel)) fail(id, 'pairs listed in the working are wrong', qn)
          break
        }
        case 'relTwoStep':
        case 'eightFind':
        case 'xAndY':
        case 'valueFor': {
          const g = given()[0]
          const a = sizeOfLabel(g.s)!
          independent++
          if (!tv!.parallel) fail(id, 'lines not parallel', qn)
          if (t === 'eightFind') {
            const l = find(m.letter)[0]
            // from the drawing, and from the fact that all 8 angles are a or 180 − a
            if (!near(tv!.spot(l.p).size, ans!) || (ans !== a && ans !== 180 - a)) fail(id, `angle ${m.letter} is drawn ${tv!.spot(l.p).size.toFixed(1)}°`, qn)
            if (angLabels(svg).length !== 8) fail(id, '8 labels expected', qn)
          } else if (t === 'xAndY') {
            const vals = Object.fromEntries([...chosen(qn).matchAll(/([a-z]) = (\d+)/g)].map((x) => [x[1], Number(x[2])]))
            for (const u of unknown()) {
              const sp = tv!.spot(u.p)
              const rel = tv!.relation(tv!.spot(g.p), sp)
              const want = rel === 'co-interior' ? 180 - a : rel === 'alternate' || rel === 'corresponding' ? a : NaN
              if (vals[u.s[0]] !== want || !near(sp.size, want)) fail(id, `${u.s} is ${rel} to the given angle: ${want}`, qn)
            }
            if (unknown().length !== 2) fail(id, '2 unknowns expected', qn)
          } else {
            const u = unknown()[0]
            const sp = tv!.spot(u.p)
            if (!near(sp.size, ans!)) fail(id, `unknown is drawn ${sp.size.toFixed(1)}°`, qn)
            // an independent route: every angle on the same side of the transversal, in the same zone (inside or outside), or the
            // opposite of both, is the supplement; otherwise equal
            const gs = tv!.spot(g.p)
            const sameSide = gs.side === sp.side
            const sameZone = gs.interior === sp.interior
            const equal = gs.at === sp.at ? gs.sa === -sp.sa && gs.sb === -sp.sb : sameSide ? !sameZone : sameZone
            if (ans !== (equal ? a : 180 - a)) fail(id, `re-worked ${equal ? a : 180 - a}`, qn)
            if (t === 'valueFor' && arrowheads(svg) !== 0) fail(id, 'arrowheads give the answer away', qn)
            if (t === 'valueFor' && m.k === 0 && tv!.relation(gs, sp) !== m.rel) fail(id, 'not the pair it says', qn)
          }
          break
        }
        case 'eightCount': {
          const a = sizeOfLabel(given()[0].s)!
          const want = m.same ? 3 : 4
          independent++
          if (ans !== want || near(tv!.between, 90, 5) || a === 90 || !tv!.parallel) fail(id, 'eight count', qn)
          if (!qn.prompt.includes(m.same ? `also ${a}°` : `${180 - a}°`)) fail(id, 'prompt', qn)
          break
        }
        case 'word':
          independent++
          if (ans !== null && ans !== 8) fail(id, '8 angles', qn)
          break
        case 'coSum': {
          const [a, b] = [find('○')[0], find('×')[0]].map((l) => tv!.spot(l.p))
          independent++
          if (tv!.relation(a, b) !== 'co-interior' || !near(a.size + b.size, 180) || ans !== 180) fail(id, 'co-interior sum', qn)
          break
        }
        case 'relName': {
          const [a, b] = find('•').map((l) => tv!.spot(l.p))
          independent++
          if (!chosen(qn).toLowerCase().startsWith(tv!.relation(a, b))) fail(id, `drawn ${tv!.relation(a, b)}`, qn)
          break
        }
        case 'namedRel': {
          const vx = vxLabels(svg)
          const pos = Object.fromEntries(vx.map((l) => [l.s, l.p]))
          // a named angle: its vertex is the letter beside a crossing; look just inside the angle, between its 2 arms
          const spotOf = (name: string) => {
            const [a, v, b] = name.split('')
            const at = dist(pos[v], tv!.X[0]) < dist(pos[v], tv!.X[1]) ? 0 : 1
            const X = tv!.X[at]
            const ua = unit(sub(pos[a], X))
            const ub = unit(sub(pos[b], X))
            return tv!.spot([X[0] + 20 * (ua[0] + ub[0]), X[1] + 20 * (ua[1] + ub[1])])
          }
          const asked = strip(qn.prompt).match(/to ∠(\w{3})\?/)![1]
          independent++
          mcOf(qn).options.map(plain).forEach((o, k) => {
            const rel = tv!.relation(spotOf(asked), spotOf(o.slice(1)))
            if ((rel === m.rel) !== (k === mcOf(qn).correct)) fail(id, `${o} is ${rel} to ∠${asked}`, qn)
          })
          if (vx.length !== 8) fail(id, '8 letters expected', qn)
          break
        }
        case 'isParallel':
        case 'isParallel2': {
          const [g1, g2] = given()
          const [s1, s2] = [tv!.spot(g1.p), tv!.spot(g2.p)]
          const yes = /^Yes/.test(chosen(qn))
          independent++
          // the drawing, the angle rule and the answer must all agree
          const byRule = tv!.wouldBeParallel(s1, sizeOfLabel(g1.s)!, s2, sizeOfLabel(g2.s)!)
          if (yes !== tv!.parallel || yes !== byRule) fail(id, `answer ${yes}, drawn parallel ${tv!.parallel}, angle rule ${byRule}`, qn)
          if (arrowheads(svg) !== 0) fail(id, 'arrowheads give the answer away', qn)
          const rel = tv!.relation(s1, s2)
          if (t === 'isParallel') {
            if (rel !== m.rel) fail(id, `angles are drawn ${rel}`, qn)
            if (yes && lvl > 1 && !chosen(qn).includes(rel)) fail(id, `reason should be ${rel}`, qn)
            if (!strip(qn.steps[0]).includes(rel)) fail(id, 'working names the wrong pair', qn)
          } else if (rel !== 'none') fail(id, 'two-step question has a direct pair', qn)
          if (!tv!.parallel && (tv!.between < 2.5 || tv!.between > 13)) fail(id, `lines ${tv!.between.toFixed(1)}° apart`, qn)
          break
        }
        case 'rule': {
          const rel = strip(qn.prompt).match(/(corresponding|alternate|co-interior) angles …/)![1]
          independent++
          if (chosen(qn) !== (rel === 'co-interior' ? 'add to 180°' : 'are equal')) fail(id, 'rule', qn)
          break
        }
        case 'zShape': {
          const ls = segs(svg)
          measured++
          const [A, B] = ls[0]
          const [, C] = ls[1]
          const [, D] = ls[2]
          independent++
          if (lineAngle(ls[0], ls[2]) > 0.05 || !near(angleAt(B, A, C), m.a) || !near(angleAt(C, B, D), m.a) || ans !== m.a) fail(id, 'Z shape', qn)
          // B and D are on opposite sides of... the 2 angles are on opposite sides of BC
          if (Math.sign(cross(sub(C, B), sub(A, B))) === Math.sign(cross(sub(C, B), sub(D, B)))) fail(id, 'angles on the same side: not alternate', qn)
          if (sizeOfLabel(given()[0].s) !== m.a) fail(id, 'label', qn)
          break
        }
        case 'coShape': {
          const pts = svg.match(/<polygon class="sh" points="([^"]*)"/)![1].split(' ').map((s) => s.split(',').map(Number) as P)
          measured++
          const [A, B, C, D] = pts
          const inside = [angleAt(A, D, B), angleAt(B, A, C), angleAt(C, B, D), angleAt(D, C, A)]
          const nearest = (p: P) => pts.map((q, k) => [dist(p, q), k]).sort((x, y) => x[0] - y[0])[0][1]
          const g = given()[0]
          const u = unknown()[0]
          independent++
          if (lineAngle([A, B], [D, C]) > 0.05) fail(id, 'top and bottom not parallel', qn)
          if (m.para !== lineAngle([A, D], [B, C]) < 0.05) fail(id, 'parallelogram or not', qn)
          if (!near(inside[nearest(g.p)], sizeOfLabel(g.s)!) || !near(inside[nearest(u.p)], ans!)) fail(id, `corner angles ${inside.map((x) => x.toFixed(0))}`, qn)
          // the 2 marked corners are joined by a side that crosses the parallel sides
          if (![[0, 3], [1, 2]].some((pr) => pr.includes(nearest(g.p)) && pr.includes(nearest(u.p))) && !(m.para && nearest(g.p) !== nearest(u.p) && (nearest(g.p) + nearest(u.p)) % 2 === 1)) fail(id, 'marked corners are not co-interior', qn)
          if (ans !== 180 - sizeOfLabel(g.s)!) fail(id, 'co-interior', qn)
          if (arrowheads(svg) !== (m.para ? 6 : 2)) fail(id, `arrowheads ${arrowheads(svg)}`, qn)
          break
        }
        // ============================================================ Power plus
        case 'earth':
          independent++
          if (ans !== (m.minutes / (24 * 60)) * 360) fail(id, 'earth spin', qn)
          break
        case 'clockHand':
          independent++
          if (ans !== (m.hand === 'minute' ? (m.minutes / 60) * 360 : (m.minutes / 720) * 360)) fail(id, 'clock hand', qn)
          break
        case 'turns': {
          const said = [...strip(qn.prompt).matchAll(/(right|left) (\d+)°/g)].map((x) => (x[1] === 'right' ? 1 : -1) * Number(x[2]))
          const net = said.reduce((s, x) => s + x, 0)
          const want = ['The front', 'The right', 'The back', 'The left'][(((net / 90) % 4) + 4) % 4]
          independent++
          if (chosen(qn) !== want || !Number.isInteger(net / 90) || said.length !== (lvl === 2 ? 3 : 4)) fail(id, `net ${net}`, qn)
          break
        }
        case 'zigzag': {
          const ls = segs(svg)
          measured++
          const [top, bottom, pb, bq] = ls
          const B = pb[1]
          const bend = angleAt(B, pb[0], bq[1])
          independent++
          if (lineAngle(top, bottom) > 0.05 || !near(bend, ans!) || ans !== m.a + m.b) fail(id, `bend drawn ${bend.toFixed(1)}°`, qn)
          if (!near(angleAt(pb[0], top[0], B), m.a) || !near(angleAt(bq[1], bottom[0], B), m.b)) fail(id, 'angles at the lines', qn)
          const shown = given().map((l) => sizeOfLabel(l.s)!).sort((x, y) => x - y)
          if (shown.join() !== [m.a, m.b].sort((x: number, y: number) => x - y).join()) fail(id, 'labels', qn)
          break
        }
        default:
          fail(id, `no check written for question type "${t}"`, qn)
      }
    }
  }
}

// ------------------------------------------------------------------ the topic and its test

const topic = findTopic('y7-angles')!
const order = NCM2_SKILLS.map((s) => s.id)
if (NCM2_TEST.length !== 18) fail('test', `has ${NCM2_TEST.length} questions, not 18`)
NCM2_TEST.forEach((item, k) => {
  if (!topic.skills.some((s) => s.id === item.skill)) fail('test', `unknown skill ${item.skill}`)
  if (k > 0 && order.indexOf(item.skill) < order.indexOf(NCM2_TEST[k - 1].skill)) fail('test', `question ${k + 1} is out of exercise order`)
  for (let i = 0; i < 200; i++) {
    setSeed(5 + i * 31 + k)
    const qn = item.gen!(item.level)
    if (qn.answer.kind !== 'mc' && !checkAnswer(qn.answer, answerText(qn.answer)).correct) fail('test', `Q${k + 1} answer not accepted`, qn)
    if (qn.calc) fail('test', `Q${k + 1} should not need a calculator`, qn)
  }
})
for (const id of order.slice(0, 11)) if (!NCM2_TEST.some((x) => x.skill === id)) fail('test', `no question on ${id}`)
if (topic.ref !== 'NCM 7 Chapter 2' || topic.test !== NCM2_TEST) fail('topic', 'not wired to Chapter 2')
if (topic.skills.filter((s) => s.ref?.startsWith('NCM 7 Ex')).map((s) => s.ref).join() !== Array.from({ length: 11 }, (_, k) => `NCM 7 Ex 2.${String(k + 1).padStart(2, '0')}`).join())
  fail('topic', 'exercises are not 2.01 to 2.11 in order')
if (topic.skills.some((s) => s.outcomes.join() !== 'MA4-ANG-C-01')) fail('topic', 'outcome code')
const tags = topic.skills.map((s) => s.tag ?? 'core')
if (tags.join() !== [...Array(11).fill('core'), 'extension', 'extra'].join()) fail('topic', `skill tags ${tags}`)
for (const s of NCM2_SKILLS) if (!s.levels?.[1] || !s.levels[2] || !s.levels[3] || !s.learn.intro || s.learn.keyPoints.length < 3) fail('topic', `${s.id} is missing lesson text`)

console.log(Object.entries(counts).map(([k, v]) => `${k} ${v}`).join('\n'))
console.log(`${independent} answers re-worked independently, ${measured} drawings measured`)
if (failures) {
  console.log(`${failures} failures`)
  process.exit(1)
}
console.log('All Chapter 2 checks passed')
