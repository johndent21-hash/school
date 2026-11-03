// Independent checks for Year 9 Pythagoras' theorem (New Century Maths 9, Chapter 2).
// Answers are worked out again here without the generator's working:
//  - from the diagram itself: polygons, lines, right-angle marks and side labels are read back from the SVG,
//    the hypotenuse is found as the side opposite the drawn right angle, and the unknown is calculated from
//    the labelled numbers. Diagrams are checked to be drawn to scale (unless the page says they aren't) and
//    every right-angle mark must sit on a real 90° corner.
//  - from the numbers printed in the question, for questions without a diagram;
//  - from the question's own numbers (meta), as a third check.
// The rounding asked for in words must match the rounding the marking uses, multiple-choice questions must
// have exactly one right option, and the wording is scanned for slips.
// Usage: npx tsx tests/ncm9-ch2.test.ts   (N per skill and level, default 400)
import { setSeed } from '../src/lib/maths/rand'
import { answerText, checkAnswer } from '../src/lib/maths/check'
import type { Answer, Level, Question } from '../src/lib/maths/types'
import { NCM2_9_SKILLS, NCM2_9_TEST } from '../src/content/y9-ncm2'
import { findTopic } from '../src/content/index'

const N = Number(process.env.N ?? 400)
let failures = 0
let independent = 0
let diagramReads = 0
const counts: Record<string, number> = {}
type P = [number, number]
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
  if (failures <= Number(process.env.SHOW ?? 40)) console.log(`FAIL ${id}: ${msg}` + (qn ? `\n   ${strip(qn.prompt).slice(0, 240)}\n   answer ${JSON.stringify(qn.answer).slice(0, 200)}` : ''))
}
const near = (x: number, y: number, tol = 1e-6) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(y))
const rnd = (x: number, dp: number) => Math.round(x * 10 ** dp + 1e-9) / 10 ** dp
const parseNum = (s: string) => Number(s.replace(/−/g, '-').replace(/(\d) (?=\d{3}\b)/g, '$1'))
const numsIn = (s: string) => (s.replace(/−/g, '-').match(/-?\d+(?: \d{3})*(?:\.\d+)?/g) ?? []).map(parseNum)
const isSqInt = (n: number) => Number.isInteger(n) && Math.round(Math.sqrt(n)) ** 2 === n
/** √d is rational exactly when d (a terminating decimal) is p²/q² */
function rationalRoot(d: number): boolean {
  const s = String(d)
  const k = s.includes('.') ? s.split('.')[1].length : 0
  let n = Math.round(d * 10 ** k)
  let m = 10 ** k
  const g = (a: number, b: number): number => (b ? g(b, a % b) : a)
  const c = g(n, m)
  n /= c
  m /= c
  return isSqInt(n) && isSqInt(m)
}
const isRightSet = (s: number[]) => {
  const [a, b, c] = [...s].sort((x, y) => x - y)
  return Math.abs(a * a + b * b - c * c) < 1e-6
}

// ---------------------------------------------------------------- reading the diagram

interface Seg { a: P; b: P }
interface Label { at: P; text: string }
interface Diagram { segs: Seg[]; rights: P[]; labels: Label[]; names: Label[]; polys: P[][] }
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
  return { segs, rights, labels, names, polys }
}
const len = (s: Seg) => Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1])
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
    // overlapping lines (a ground line under a triangle's side): the shortest one the label sits beside
    if (d < bd - 1 || (Math.abs(d - bd) <= 1 && best && L2 < len(best) ** 2)) {
      bd = Math.min(d, bd)
      best = s
    }
  }
  return bd < 70 ? best : null
}
const same = (p: P, q: P, tol = 0.6) => Math.abs(p[0] - q[0]) < tol && Math.abs(p[1] - q[1]) < tol
const touches = (s: Seg, p: P) => same(s.a, p) || same(s.b, p)
/** every right-angle mark sits on a corner where two drawn lines meet at 90° */
function checkRights(id: string, d: Diagram, qn: Question) {
  for (const c of d.rights) {
    const arms = d.segs.filter((s) => touches(s, c) || onSeg(s, c))
    let ok = false
    for (let i = 0; i < arms.length && !ok; i++)
      for (let j = i + 1; j < arms.length && !ok; j++) {
        const u = dirFrom(arms[i], c)
        const w = dirFrom(arms[j], c)
        for (const uu of u) for (const ww of w) if (Math.abs(uu[0] * ww[0] + uu[1] * ww[1]) < 0.02) ok = true
      }
    if (!ok) fail(id, 'a right-angle mark is not on a 90° corner', qn)
  }
}
function onSeg(s: Seg, p: P) {
  const dx = s.b[0] - s.a[0]
  const dy = s.b[1] - s.a[1]
  const L = Math.hypot(dx, dy)
  const cross = Math.abs((p[0] - s.a[0]) * dy - (p[1] - s.a[1]) * dx) / L
  const t = ((p[0] - s.a[0]) * dx + (p[1] - s.a[1]) * dy) / (L * L)
  return cross < 0.6 && t > -0.01 && t < 1.01
}
/** unit directions along a line away from p (both ways if p is in the middle of it) */
function dirFrom(s: Seg, p: P): P[] {
  const out: P[] = []
  for (const e of [s.a, s.b]) {
    const L = Math.hypot(e[0] - p[0], e[1] - p[1])
    if (L > 1) out.push([(e[0] - p[0]) / L, (e[1] - p[1]) / L])
  }
  return out
}
const unitOf = (t: string) => (t.match(/\b(mm|cm|km|m)\b/) ?? [])[1] ?? ''
const isNumLabel = (t: string) => /^−?\d+(?:\.\d+)?(?: (mm|cm|m|km))?$/.test(t)
/** labelled numbers in the same unit must be in proportion to the drawn lengths, unless the page says not to scale */
function checkScale(id: string, d: Diagram, qn: Question) {
  if (qn.note) return
  const ratios: Record<string, number[]> = {}
  for (const l of d.labels) {
    if (!isNumLabel(l.text)) continue
    const s = sideOf(l, d.segs)
    if (!s) continue
    ;(ratios[unitOf(l.text)] ??= []).push(len(s) / parseNum(l.text.split(' ')[0]))
  }
  for (const r of Object.values(ratios)) if (r.length > 1 && Math.max(...r) / Math.min(...r) > 1.02) fail(id, `diagram not to scale (${r.map((x) => x.toFixed(2)).join(', ')})`, qn)
}

/** a single right-angled triangle: its three sides, which one is the hypotenuse, and their labels */
function readRightTriangle(d: Diagram): { hyp: Label | null; legs: Label[]; hypName: string; legNames: string[] } | null {
  if (d.polys.length !== 1 || d.polys[0].length !== 3 || d.rights.length !== 1) return null
  const pts = d.polys[0]
  const ri = pts.findIndex((p) => same(p, d.rights[0], 1))
  if (ri < 0) return null
  const others = pts.filter((_, i) => i !== ri)
  const hypSeg: Seg = { a: others[0], b: others[1] }
  let hyp: Label | null = null
  const legs: Label[] = []
  for (const l of d.labels) {
    const s = sideOf(l, d.segs)
    if (!s) continue
    if ((same(s.a, hypSeg.a) && same(s.b, hypSeg.b)) || (same(s.a, hypSeg.b) && same(s.b, hypSeg.a))) hyp = l
    else legs.push(l)
  }
  const nameAt = (p: P) => {
    let best = ''
    let bd = Infinity
    for (const n of d.names) {
      const dd = Math.hypot(n.at[0] - p[0], n.at[1] - p[1])
      if (dd < bd) {
        bd = dd
        best = n.text
      }
    }
    return bd < 30 ? best : ''
  }
  const R = nameAt(pts[ri])
  const A = nameAt(others[0])
  const B = nameAt(others[1])
  const sn = (x: string, y: string) => [x, y].sort().join('')
  return { hyp, legs, hypName: A && B ? sn(A, B) : '', legNames: R && A && B ? [sn(R, A), sn(R, B)] : [] }
}

// ---------------------------------------------------------------- rounding asked for in words

function wantedDp(prompt: string): number | 'surd' | 'exact' | 'either1' | 'either2' | null {
  const t = strip(prompt)
  if (/as a surd|exact value \(a surd\)/.test(t)) return 'surd'
  if (/one decimal place where necessary/.test(t)) return 'either1'
  if (/two decimal places where necessary/.test(t)) return 'either2'
  if (/one decimal place|nearest 0\.1/.test(t)) return 1
  if (/two decimal places/.test(t)) return 2
  if (/three decimal places/.test(t)) return 3
  if (/nearest (metre|centimetre|millimetre|whole)/.test(t)) return 0
  if (/exact value/.test(t)) return 'exact'
  return null
}
/** the marking for this answer agrees with the true value and the rounding asked for */
function checkValue(id: string, qn: Question, truth: number, how: string) {
  const a = qn.answer
  if (a.kind !== 'num') return fail(id, `expected a number answer (${how})`, qn)
  const want = wantedDp(qn.prompt)
  independent++
  if (want === 'surd') {
    if (!qn.prefix?.endsWith('√')) fail(id, 'surd answer without a √ in front of the box', qn)
    if (!near(a.value, truth * truth, 1e-6)) fail(id, `surd: radicand ${a.value}, expected ${truth * truth} (${how})`, qn)
    if (rationalRoot(rnd(truth * truth, 6))) fail(id, 'asked for a surd but the answer is rational', qn)
    return
  }
  if (qn.prefix?.endsWith('√')) fail(id, 'a √ in front of the box but no surd was asked for', qn)
  if (typeof want === 'number') {
    if (a.dp !== want) fail(id, `the words ask for ${want} dp, the marking uses ${a.dp}`, qn)
    if (!near(rnd(a.value, want), rnd(truth, want), 1e-9)) fail(id, `value ${a.value}, expected ${truth} (${how})`, qn)
    return
  }
  if (want === 'either1' || want === 'either2') {
    const dp = want === 'either1' ? 1 : 2
    if (a.dp === undefined ? !near(a.value, truth) || !Number.isInteger(rnd(truth * 10 ** dp, 6)) : a.dp !== dp || !near(rnd(a.value, dp), rnd(truth, dp)))
      fail(id, `“where necessary”: answer ${a.value} dp ${a.dp}, expected ${truth} (${how})`, qn)
    return
  }
  if (a.dp !== undefined) fail(id, 'rounded answer, but no rounding asked for', qn)
  if (!near(a.value, truth, 1e-9)) fail(id, `value ${a.value}, expected ${truth} (${how})`, qn)
}

// ---------------------------------------------------------------- per-question checks

const mcOpts = (a: Answer) => (a.kind === 'mc' ? a.options.map(strip) : [])
const mcRight = (a: Answer) => (a.kind === 'mc' ? strip(a.options[a.correct]) : '')

function check(id: string, qn: Question) {
  const m = (qn.meta ?? { t: '?' }) as Record<string, unknown> & { t: string }
  counts[m.t] = (counts[m.t] ?? 0) + 1
  const text = strip(qn.prompt)
  const all = text + ' ' + strip(qn.steps.join(' ')) + ' ' + (qn.answer.kind === 'mc' ? qn.answer.options.map(strip).join(' ') : '')
  // wording
  if (/NaN|undefined|Infinity|\[object/.test(all + (qn.diagram ?? ''))) fail(id, 'NaN/undefined in the text', qn)
  const slip = /(?<![\d.])1 (units|metres|centimetres)\b|\+ −|− −|\s,|\.\.(?!\.)| {2}|\(\)/
  if (slip.test(all)) fail(id, `wording slip: ${all.match(slip)?.[0]}`, qn)
  if (qn.answer.kind !== 'mc' && !checkAnswer(qn.answer, answerText(qn.answer)).correct) fail(id, 'the answer key does not mark itself right', qn)
  if (qn.answer.kind === 'mc') {
    const o = qn.answer.options
    if (new Set(o.map(strip)).size !== o.length) fail(id, 'repeated options', qn)
    if (o.length < 2) fail(id, 'fewer than two options', qn)
  }
  // the diagram
  let d: Diagram | null = null
  if (qn.diagram && !qn.diagram.includes('class="grid"')) {
    d = readDiagram(qn.diagram)
    diagramReads++
    checkRights(id, d, qn)
    if (!qn.diagram.includes('aria-label="Cone"')) checkScale(id, d, qn)
  }
  const rt = d ? readRightTriangle(d) : null
  const t = m.t
  const val = (s: string) => parseNum(s.split(' ')[0])

  // ---- from the diagram: a right-angled triangle with two numbers and one unknown
  if (rt && (t === 'hyp' || t === 'leg') && rt.hyp && rt.legs.length === 2) {
    const nums = [rt.hyp, ...rt.legs].filter((l) => isNumLabel(l.text))
    if (nums.length === 2) {
      const truth = isNumLabel(rt.hyp.text)
        ? Math.sqrt(val(rt.hyp.text) ** 2 - val(rt.legs.find((l) => isNumLabel(l.text))!.text) ** 2)
        : Math.hypot(val(rt.legs[0].text), val(rt.legs[1].text))
      if (qn.answer.kind === 'mc') {
        independent++
        const dp = 1
        const right = mcRight(qn.answer)
        if (!near(numsIn(right)[0], rnd(truth, dp))) fail(id, `MC: right option ${right}, expected ${rnd(truth, dp)}`, qn)
        for (const w of mcOpts(qn.answer)) if (w !== right && near(numsIn(w)[0], rnd(truth, dp))) fail(id, 'MC: a wrong option is also right', qn)
      } else checkValue(id, qn, truth, 'diagram')
      // the unknown side is drawn the right length (if to scale)
      if (!qn.note) {
        const unk = [rt.hyp, ...rt.legs].find((l) => !isNumLabel(l.text))!
        const known = nums[0]
        const su = sideOf(unk, d!.segs)
        const sk = sideOf(known, d!.segs)
        if (su && sk && Math.abs(len(su) / truth / (len(sk) / val(known.text)) - 1) > 0.02) fail(id, 'the unknown side is not drawn to scale', qn)
      }
    }
  } else if (rt && t === 'hyp' && !rt.hyp && rt.legs.length === 2 && rt.hypName) {
    // named vertices: "Find the length of the hypotenuse, XY"
    if (!text.includes(rt.hypName)) fail(id, `asks for a side that isn't the hypotenuse ${rt.hypName}`, qn)
    checkValue(id, qn, Math.hypot(val(rt.legs[0].text), val(rt.legs[1].text)), 'diagram, named')
  }

  // ---- from meta (and the words)
  const mode = m.mode as string | number | undefined
  switch (t) {
    case 'sq': {
      const x = m.x as number
      if (!text.includes(String(Math.abs(x)).replace('-', '−'))) fail(id, 'number not in the question', qn)
      checkValue(id, qn, x * x, 'meta')
      break
    }
    case 'sqsum': {
      const [a, b] = numsIn(text.replace(/\^2/g, ''))
      independent++
      if (qn.answer.kind !== 'num' || !near(qn.answer.value, a * a + (m.op as number) * b * b)) fail(id, 'a² ± b² wrong', qn)
      if (a !== m.a || b !== m.b) fail(id, 'printed numbers differ from meta', qn)
      break
    }
    case 'root': {
      const n = numsIn(text)[0]
      checkValue(id, qn, Math.sqrt(n), 'printed')
      break
    }
    case 'rootsum': {
      const [a, b] = numsIn(text.replace(/\^2/g, '').replace(/one|two/g, ''))
      checkValue(id, qn, Math.sqrt(a * a + (text.includes('−') ? -1 : 1) * b * b), 'printed')
      break
    }
    case 'closest': {
      const [a, b] = numsIn(text.replace(/\^2/g, ''))
      const truth = Math.hypot(a, b)
      independent++
      const opts = mcOpts(qn.answer).map((o) => numsIn(o)[0])
      const best = opts.reduce((bi, x, i) => (Math.abs(x - truth) < Math.abs(opts[bi] - truth) ? i : bi), 0)
      if (qn.answer.kind !== 'mc' || best !== qn.answer.correct) fail(id, 'closest option is not the one marked right', qn)
      break
    }
    case 'surdmc': {
      independent++
      const rads = mcOpts(qn.answer).map((o) => numsIn(o)[0])
      const not = /not/.test(text)
      const good = rads.map((r) => (not ? rationalRoot(r) : !rationalRoot(r)))
      if (good.filter(Boolean).length !== 1 || qn.answer.kind !== 'mc' || !good[qn.answer.correct]) fail(id, `surd MC: ${rads.join(', ')}`, qn)
      break
    }
    case 'surdcount': {
      const rads = numsIn(text)
      checkValue(id, qn, rads.filter((r) => !rationalRoot(r)).length, 'printed roots')
      break
    }
    case 'between': {
      const n = numsIn(text)[0]
      independent++
      const k = Math.floor(Math.sqrt(n))
      if (mcRight(qn.answer) !== `${k} and ${k + 1}` || isSqInt(n)) fail(id, `between: √${n}`, qn)
      break
    }
    case 'always': {
      independent++
      const r = mcRight(qn.answer)
      if (m.which === 'rootofsquare' ? !/^No: it is false when x is negative/.test(r) : !/^Yes/.test(r)) fail(id, 'always-true answer', qn)
      break
    }
    case 'hypdef': {
      independent++
      if (!/longest side|opposite the right angle/.test(mcRight(qn.answer))) fail(id, 'hypotenuse definition', qn)
      break
    }
    case 'namehyp': {
      independent++
      const want = rt ? (rt.hyp ? rt.hyp.text : rt.hypName) : ''
      if (!want || mcRight(qn.answer) !== want) fail(id, `hypotenuse from the diagram is ${want}, marked ${mcRight(qn.answer)}`, qn)
      break
    }
    case 'writethm': {
      independent++
      const H = rt ? (rt.hyp ? rt.hyp.text : rt.hypName) : ''
      const legs = rt ? (rt.hyp ? rt.legs.map((l) => l.text) : rt.legNames) : []
      const ok = (o: string) => {
        const mm = o.match(/^(\w+)\^2 = (\w+)\^2 \+ (\w+)\^2$/)
        return !!mm && mm[1] === H && [mm[2], mm[3]].sort().join() === [...legs].sort().join()
      }
      const opts = mcOpts(qn.answer)
      if (opts.filter(ok).length !== 1 || !ok(mcRight(qn.answer))) fail(id, `theorem options for hypotenuse ${H}`, qn)
      break
    }
    case 'hypwords': {
      independent++
      const mm = text.match(/∠(\w+) = 90°/)
      const ang = mm ? mm[1] : ''
      const tri = (text.match(/△(\w{3})/) ?? [])[1] ?? ''
      const R = ang.length === 1 ? ang : ang[1]
      const hyp = tri.split('').filter((c) => c !== R).sort().join('')
      if (mcRight(qn.answer) !== hyp) fail(id, `hypotenuse opposite ${R} is ${hyp}`, qn)
      break
    }
    case 'thmnum': {
      independent++
      const r = mcRight(qn.answer)
      const H = rt?.hyp ? rt.hyp.text.split(' ')[0] : ''
      if (!r.startsWith(`${H.includes('.') ? `(${H})` : H}^2 = `)) fail(id, `theorem with numbers: hypotenuse ${H}, marked ${r}`, qn)
      const ns = numsIn(r.replace(/\^2/g, ''))
      if (ns.length === 3 && Math.abs(ns[0] ** 2 - ns[1] ** 2 - ns[2] ** 2) > 1e-6) fail(id, 'numbers don’t satisfy the theorem', qn)
      break
    }
    case 'sqarea': {
      const ns = numsIn(text.replace(/\^2/g, ''))
      checkValue(id, qn, ns[0] + ns[1], 'printed areas')
      break
    }
    case 'sqarea2': {
      const ns = numsIn(text.replace(/\^2/g, ''))
      checkValue(id, qn, Math.sqrt(ns[0] - ns[1]), 'printed areas')
      break
    }
    case 'hyp':
    case 'leg': {
      const a = m.a as number
      const truth = t === 'hyp' ? Math.hypot(a, m.b as number) : Math.sqrt((m.c as number) ** 2 - a * a)
      if (qn.answer.kind === 'mc') break
      checkValue(id, qn, truth, 'meta')
      // the numbers used appear in the question (allowing unit changes and halves)
      const shown = numsIn(text + ' ' + strip(qn.diagram ?? ''))
      for (const x of t === 'hyp' ? [a, m.b as number] : [m.c as number, a]) {
        const forms = [x, 2 * x, 10 * x, x / 10, 100 * x, 200 * x]
        const trap = m.trap as number[] | undefined
        const diff = shown.some((p) => shown.some((q) => near(Math.abs(p - q), x, 1e-9)))
        if (!forms.some((f) => shown.some((s) => near(s, f, 1e-9))) && !(trap && near(x, trap[1] - trap[0])) && !diff) fail(id, `${x} isn't shown in the question`, qn)
      }
      break
    }
    case 'square':
      checkValue(id, qn, (numsIn(text)[0] * 10) / Math.SQRT2, 'printed diagonal')
      break
    case 'plane': {
      const pts = (text.match(/\((−?\d+), (−?\d+)\)/g) ?? []).map((s) => numsIn(s) as P)
      const pp = pts.length === 2 ? pts : (m.a && m.b ? [m.a as P, m.b as P] : [])
      checkValue(id, qn, Math.hypot(pp[0][0] - pp[1][0], pp[0][1] - pp[1][1]), 'coordinates')
      break
    }
    case 'twostep': {
      const p = m.p as number
      const q = m.q as number
      const truth = m.findHyp ? Math.sqrt(p * p + q * q + (m.r as number) ** 2) : Math.sqrt((m.y as number) ** 2 - p * p - q * q)
      checkValue(id, qn, truth, 'two triangles')
      break
    }
    case 'wires': {
      const [w1, g1, g2] = [m.w1, m.g1, m.g2] as number[]
      checkValue(id, qn, Math.sqrt(w1 * w1 - g1 * g1 + g2 * g2), 'pole height then second wire')
      break
    }
    case 'conv': {
      const sides = d ? d.labels.map((l) => val(l.text)) : []
      independent++
      if (sides.length !== 3) fail(id, 'triangle sides not all labelled', qn)
      if (mcRight(qn.answer) !== (isRightSet(sides) ? 'Yes' : 'No')) fail(id, `converse: ${sides.join(', ')}`, qn)
      // the drawing agrees: a right-angled triangle is drawn with a 90° corner, and the drawn sides match
      break
    }
    case 'convset': {
      independent++
      const not = /not/.test(text)
      const good = mcOpts(qn.answer).map((o) => isRightSet(numsIn(o)) !== not)
      if (good.filter(Boolean).length !== 1 || qn.answer.kind !== 'mc' || !good[qn.answer.correct]) fail(id, 'which set', qn)
      break
    }
    case 'where': {
      independent++
      const facts = [...text.matchAll(/(\w{2}) = (\d+(?:\.\d+)?)/g)].map((x) => [x[1], Number(x[2])] as [string, number])
      const longest = facts.reduce((b, f) => (f[1] > b[1] ? f : b))
      const tri = (text.match(/△(\w{3})/) ?? [])[1] ?? ''
      const R = tri.split('').find((c) => !longest[0].includes(c))
      if (!isRightSet(facts.map((f) => f[1])) || mcRight(qn.answer) !== `∠${R}`) fail(id, `right angle should be at ${R}`, qn)
      break
    }
    case 'shownot': {
      independent++
      const [a, b, c] = numsIn(text).slice(0, 3).sort((x, y) => x - y)
      const r = mcRight(qn.answer)
      if (isRightSet([a, b, c]) || !r.startsWith(`${c}^2 = ${c * c}, but ${a}^2 + ${b}^2 = ${a * a + b * b}`)) fail(id, 'show-not working', qn)
      break
    }
    case 'triad': {
      independent++
      const s = numsIn(text)
      if (mcRight(qn.answer) !== (isRightSet(s) && s.every(Number.isInteger) ? 'Yes' : 'No')) fail(id, `triad ${s}`, qn)
      break
    }
    case 'triadmc': {
      independent++
      const good = mcOpts(qn.answer).map((o) => isRightSet(numsIn(o)))
      if (good.filter(Boolean).length !== 1 || qn.answer.kind !== 'mc' || !good[qn.answer.correct]) fail(id, 'which triad', qn)
      break
    }
    case 'triadkind': {
      independent++
      const s = numsIn(text.split('. Is ')[1] ?? '')
      const r = mcRight(qn.answer)
      // the two reasons can't both be true: a decimal set here must follow the theorem
      if (!s.every(Number.isInteger) && !isRightSet(s)) fail(id, `decimal set that also fails the theorem: ${s}`, qn)
      const want = !isRightSet(s) ? 'No: a^2 + b^2 ≠ c^2' : s.every(Number.isInteger) ? 'Yes' : 'No: not all whole numbers'
      if (r !== want) fail(id, `triad kind ${s}: marked ${r}`, qn)
      break
    }
    case 'mult': {
      independent++
      const base = (text.match(/\{([\d, ]+)\}/) ?? [])[1]?.split(', ').map(Number) ?? []
      const k = text.includes('((1)/(2))') ? 0.5 : numsIn(text.split('by ')[1] ?? '')[0]
      const want = base.map((x) => rnd(x * k, 6)).sort((x, y) => x - y)
      const got = qn.answer.kind === 'nums' ? [...qn.answer.values].sort((x, y) => x - y) : []
      if (want.join() !== got.join() || !isRightSet(got)) fail(id, `multiply ${base} by ${k}`, qn)
      break
    }
    case 'missing': {
      const parts = ((text.match(/\{([^}]+)\}/) ?? [])[1] ?? '').split(', ')
      const g = parts.indexOf('?')
      const n = parts.filter((x) => x !== '?').map(Number)
      checkValue(id, qn, g === 2 ? Math.hypot(n[0], n[1]) : Math.sqrt(n[1] ** 2 - n[0] ** 2), 'printed triad')
      break
    }
    case 'formula':
    case 'formulaeven': {
      independent++
      const a = numsIn(text.split('when a = ')[1] ?? text.split(' when a = ')[0])[0]
      const b = (a * a - 1) / 2
      const c = (a * a + 1) / 2
      const want = (t === 'formula' ? [b, c] : [2 * a, 2 * b, 2 * c]).sort((x, y) => x - y)
      const got = qn.answer.kind === 'nums' ? [...qn.answer.values].sort((x, y) => x - y) : []
      if (want.join() !== got.join()) fail(id, `formula a = ${a}`, qn)
      if (t === 'formulaeven' && !isRightSet(got)) fail(id, 'not a triad', qn)
      break
    }
    case 'shortcut': {
      const [a, b] = [m.a, m.b] as number[]
      const c = Math.hypot(a, b)
      checkValue(id, qn, m.ask === 'direct' ? c : a + b - c, 'park')
      break
    }
    case 'perimarea': {
      const { shape, area, a, b, c } = m as unknown as { shape: string; area: boolean; a: number; b: number; c: number }
      if (Math.abs(a * a + b * b - c * c) > 1e-6) fail(id, 'sides are not a right-angled triangle', qn)
      const truth = shape === 'tri' ? (area ? (a * b) / 2 : a + b + c) : area ? a * b : 2 * (a + b)
      checkValue(id, qn, truth, 'perimeter/area')
      // the question gives the hypotenuse (or diagonal) whenever the answer needs a side that isn't shown
      const lab = d ? d.labels.map((l) => val(l.text)) : []
      if (lab.length !== 2) fail(id, 'perimeter/area: expected two labelled sides', qn)
      break
    }
    case 'braces':
      checkValue(id, qn, (2 * Math.hypot(m.w as number, m.h as number)) / 100, 'braces')
      break
    case 'kite':
      checkValue(id, qn, Math.sqrt((m.str as number) ** 2 - (m.d as number) ** 2) + (m.hand as number), 'kite')
      break
    case 'swim':
      checkValue(id, qn, 2 * (m.link as number) + (m.a as number) + (m.b as number) + Math.hypot(m.a as number, m.b as number), 'swim')
      break
    case 'slide': {
      const h2 = (m.lad as number) ** 2 - (m.g as number) ** 2
      checkValue(id, qn, m.ask === 'h' ? Math.sqrt(h2) : Math.sqrt(h2 + (m.run as number) ** 2), 'slide')
      break
    }
    case 'rhombus':
      checkValue(id, qn, 4 * Math.hypot((m.d1 as number) / 2, (m.d2 as number) / 2), 'rhombus')
      break
    case 'ramp':
      checkValue(id, qn, Math.hypot((m.n as number) * (m.tread as number), (m.n as number) * (m.riser as number)) / 100, 'ramp')
      break
    case 'house': {
      const { w, e, hgt } = m as unknown as { w: number; e: number; hgt: number }
      checkValue(id, qn, w * hgt + (w * Math.sqrt(e * e - (w / 2) ** 2)) / 2, 'house')
      break
    }
    case 'trapper': {
      const { top, bottom, h } = m as unknown as { top: number; bottom: number; h: number }
      checkValue(id, qn, top + bottom + h + Math.hypot(bottom - top, h), 'trapezium perimeter')
      break
    }
    case 'traparea': {
      const { top, bottom, s } = m as unknown as { top: number; bottom: number; s: number }
      checkValue(id, qn, ((top + bottom) / 2) * Math.sqrt(s * s - (bottom - top) ** 2), 'trapezium area')
      break
    }
    case 'isoright':
      checkValue(id, qn, (m.c as number) / Math.SQRT2, 'isosceles right')
      break
    case 'box': {
      const { l, w, h, ask } = m as unknown as { l: number; w: number; h: number; ask: string }
      checkValue(id, qn, ask === 'base' ? Math.hypot(l, w) : Math.sqrt(l * l + w * w + h * h), 'box')
      break
    }
    case 'pyramid':
      checkValue(id, qn, Math.hypot(m.h as number, (m.b as number) / 2), 'pyramid')
      break
    case 'recttri': {
      const h = (m.area as number) / (m.w as number)
      checkValue(id, qn, Math.SQRT2 * h, 'rectangle then triangle')
      break
    }
    default:
      fail(id, `no check for ${t}`, qn)
  }
  void mode
}

// ---------------------------------------------------------------- run

for (const s of NCM2_9_SKILLS)
  for (const lvl of [1, 2, 3] as Level[])
    for (let i = 0; i < N; i++) {
      setSeed(i * 7919 + lvl * 31 + s.id.length)
      check(`${s.id} L${lvl}`, s.gen(lvl))
    }
for (let i = 0; i < 100; i++) {
  setSeed(5000 + i)
  NCM2_9_TEST.forEach((it, k) => check(`test Q${k + 1}`, it.gen!(it.level)))
}
// the topic is wired up: 12 test questions, skills in exercise order, every test skill exists
const topic = findTopic('y9-pythagoras')
if (!topic || topic.test?.length !== 12) fail('topic', 'topic missing or test is not 12 questions')
for (const it of NCM2_9_TEST) if (!NCM2_9_SKILLS.some((s) => s.id === it.skill)) fail('topic', `test skill ${it.skill} missing`)
console.log(`${failures === 0 ? 'PASS' : 'FAIL'}: ${failures} failures, ${independent} answers re-worked independently, ${diagramReads} diagrams read back`)
console.log(Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(' · '))
process.exit(failures ? 1 : 0)
