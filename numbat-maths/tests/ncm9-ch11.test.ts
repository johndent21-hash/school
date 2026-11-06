// Independent checks for Year 9 Coordinate geometry and graphs (New Century Maths 9, Chapter 11).
// Every answer is worked out again here without the generator's own working: from the numbers the
// question was made from (meta), from the equation printed in the question (parsed and evaluated),
// and from the diagram itself (points, lines, curves, rise/run labels and graph scales are read back
// from the SVG). Wording is scanned for slips such as "1 units", "+ −3" or "NaN".
// Usage: npx tsx tests/ncm9-ch11.test.ts   (N per skill and level, default 400)
import { setSeed } from '../src/lib/maths/rand'
import { answerText, checkAnswer } from '../src/lib/maths/check'
import type { Answer, Level, Question } from '../src/lib/maths/types'
import { NCM11_SKILLS, NCM11_TEST } from '../src/content/y9-ncm11'
import { findTopic } from '../src/content/index'

const N = Number(process.env.N ?? 400)
let failures = 0
let independent = 0
let diagramReads = 0
const counts: Record<string, number> = {}
type P = [number, number]
const fail = (id: string, msg: string, qn?: Question) => {
  failures++
  if (failures <= 40) console.log(`FAIL ${id}: ${msg}` + (qn ? `\n   ${strip(qn.prompt).slice(0, 220)}\n   answer ${JSON.stringify(qn.answer).slice(0, 200)}` : ''))
}
const strip = (h: string) =>
  h
    .replace(/<span class="frac"[^>]*><span class="fn">(.*?)<\/span><span class="fd">(.*?)<\/span><\/span>/g, '(($1)/($2))')
    .replace(/<span class="sqrt">√<span class="rad">(.*?)<\/span><\/span>/g, 'sqrt($1)')
    .replace(/<sup>(.*?)<\/sup>/g, '^($1)')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
const near = (x: number, y: number, tol = 1e-6) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(y))
const dist2 = (a: P, b: P) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2
const numOf = (a: Answer): number | null => (a.kind === 'num' ? a.value : a.kind === 'frac' ? a.n / a.d : null)
const mcText = (a: Answer) => (a.kind === 'mc' ? strip(a.options[a.correct]) : '')
const ptText = (p: P) => `(${String(p[0]).replace('-', '−')}, ${String(p[1]).replace('-', '−')})`

// ---------------------------------------------------------------- equations printed in a question

/** f(x, y) = LHS − RHS for an equation written in the page's notation, e.g. "y = ((3x)/(4)) − 1" or "x + 2y = 5" */
function equationFn(text: string): ((x: number, y: number) => number) | null {
  const [lhs, rhs] = text.split('=')
  if (rhs === undefined) return null
  const js = (s: string) =>
    s
      .replace(/−/g, '-')
      .replace(/([xy])\s*\^\((\d+)\)/g, '($1**$2)')
      .replace(/\^\((\d+)\)/g, '**$1')
      .replace(/(\d|\))\s*(x|y|\()/g, '$1*$2')
      .replace(/(x|y)\s*\(/g, '$1*(')
      .replace(/\s+/g, '')
  const L = js(lhs)
  const R = js(rhs)
  if (/[^0-9xy+\-*/(). ]/.test(L + R)) return null
  try {
    // eslint-disable-next-line no-new-func
    return Function('x', 'y', `"use strict"; return (${L}) - (${R});`) as (x: number, y: number) => number
  } catch {
    return null
  }
}
/** the equations written in a prompt, e.g. "y = 2x − 3" or "x + 2y = 5": the run of maths characters around each "=" */
function equationsIn(prompt: string): string[] {
  const t = strip(prompt)
  const ok = /[xy\d\s+−\-*/().^]/
  const out: string[] = []
  for (let i = 0; i < t.length; i++) {
    if (t[i] !== '=') continue
    let a = i
    let b = i
    while (a > 0 && ok.test(t[a - 1])) a--
    while (b < t.length - 1 && ok.test(t[b + 1])) b++
    let eq = t.slice(a, b + 1).trim().replace(/\.$/, '').trim()
    // a sentence full stop or a leftover word boundary
    eq = eq.replace(/^\(+/, (m) => (eq.split(')').length > eq.split('(').length ? m : m))
    if (/[xy]/.test(eq)) out.push(eq)
  }
  return out
}
/** gradient and y-intercept of a non-vertical line f(x, y) = 0, by evaluating it */
function lineOf(f: (x: number, y: number) => number): { m: number; c: number } | null {
  // f is linear: f(x, y) = A x + B y + C
  const C = f(0, 0)
  const A = f(1, 0) - C
  const B = f(0, 1) - C
  if (Math.abs(B) < 1e-12) return null
  return { m: -A / B, c: -C / B }
}

// ---------------------------------------------------------------- reading the diagrams back

type Plane = { X: (px: number) => number; Y: (py: number) => number; points: { p: P; label: string }[]; lines: { x1: number; y1: number; x2: number; y2: number; cls: string }[]; curves: P[][]; texts: { x: number; y: number; s: string; cls: string }[] }
function readPlane(svg: string): Plane | null {
  const texts = [...svg.matchAll(/<text class="([^"]*)" x="([-\d.]+)" y="([-\d.]+)"[^>]*>(.*?)<\/text>/g)].map((m) => ({ cls: m[1], x: Number(m[2]), y: Number(m[3]), s: m[4].replace(/<[^>]*>/g, '') }))
  const ticks = texts.filter((t) => t.cls === 'dl tiny' && /^−?\d+$/.test(t.s))
  const xt = ticks.filter((t) => !/end/.test(svg.slice(0, 0)) && t.y === Math.max(...ticks.map((u) => u.y)) || false)
  // x labels share one y; y labels share one x
  const byY = new Map<number, typeof ticks>()
  const byX = new Map<number, typeof ticks>()
  for (const t of ticks) {
    byY.set(t.y, [...(byY.get(t.y) ?? []), t])
    byX.set(t.x, [...(byX.get(t.x) ?? []), t])
  }
  void xt
  const xs = [...byY.values()].sort((a, b) => b.length - a.length)[0]
  const ys = [...byX.values()].sort((a, b) => b.length - a.length)[0]
  if (!xs || !ys || xs.length < 2 || ys.length < 2) return null
  const val = (s: string) => Number(s.replace('−', '-'))
  const [xa, xb] = [xs[0], xs[xs.length - 1]]
  const [ya, yb] = [ys[0], ys[ys.length - 1]]
  const X = (px: number) => val(xa.s) + ((px - xa.x) / (xb.x - xa.x)) * (val(xb.s) - val(xa.s))
  const Y = (py: number) => val(ya.s) + ((py - ya.y) / (yb.y - ya.y)) * (val(yb.s) - val(ya.s))
  const circles = [...svg.matchAll(/<circle class="pt hlfill" cx="([-\d.]+)" cy="([-\d.]+)"/g)].map((m) => [Number(m[1]), Number(m[2])] as P)
  const labels = texts.filter((t) => t.cls === 'dl small' && /^[A-Z]/.test(t.s))
  const points = circles.map(([cx, cy]) => {
    const lab = labels.filter((l) => Math.hypot(l.x - cx, l.y - cy) < 24).sort((a, b) => Math.hypot(a.x - cx, a.y - cy) - Math.hypot(b.x - cx, b.y - cy))[0]
    return { p: [Math.round(X(cx) * 1000) / 1000, Math.round(Y(cy) * 1000) / 1000] as P, label: lab ? lab.s.replace(/\(.*$/, '') : '' }
  })
  const lines = [...svg.matchAll(/<line class="([^"]*)" x1="([-\d.]+)" y1="([-\d.]+)" x2="([-\d.]+)" y2="([-\d.]+)"/g)].map((m) => ({ cls: m[1], x1: X(Number(m[2])), y1: Y(Number(m[3])), x2: X(Number(m[4])), y2: Y(Number(m[5])) }))
  const curves = [...svg.matchAll(/<path class="plot[^"]*" d="([^"]*)"/g)].map((m) => [...m[1].matchAll(/([-\d.]+),([-\d.]+)/g)].map((u) => [X(Number(u[1])), Y(Number(u[2]))] as P))
  return { X, Y, points, lines, curves, texts }
}
const plots = (pl: Plane) => pl.lines.filter((l) => /\bplot\b/.test(l.cls))
const mOf = (l: { x1: number; y1: number; x2: number; y2: number }) => (l.y2 - l.y1) / (l.x2 - l.x1)

/** a sketch graph: the curve's points in sketch units, and the numbers written on it */
function readSketch(svg: string) {
  const path = svg.match(/<path class="plot" d="([^"]*)"/)?.[1] ?? ''
  const pts = [...path.matchAll(/([-\d.]+),([-\d.]+)/g)].map((u) => [Number(u[1]), Number(u[2])] as P)
  // axes: the horizontal axis line and vertical axis line
  const axes = [...svg.matchAll(/<line class="axis" x1="([-\d.]+)" y1="([-\d.]+)" x2="([-\d.]+)" y2="([-\d.]+)"/g)].map((m) => m.slice(1).map(Number))
  const cy = axes[0][1]
  const cx = axes[1][0]
  const nums = [...svg.matchAll(/<text class="dl small" x="([-\d.]+)" y="([-\d.]+)"[^>]*>(−?[\d.]+)<\/text>/g)].map((m) => ({ x: Number(m[1]), y: Number(m[2]), v: Number(m[3].replace('−', '-')) }))
  const point = svg.match(/>\((−?[\d.]+), (−?[\d.]+)\)<\/text>/)
  return { pts, cx, cy, nums, point: point ? ([Number(point[1].replace('−', '-')), Number(point[2].replace('−', '-'))] as P) : null }
}
/** where the drawn curve crosses a horizontal or vertical pixel line */
function crossings(pts: P[], axis: 'x' | 'y', at: number): number[] {
  const out: number[] = []
  for (let i = 0; i < pts.length - 1; i++) {
    const [a, b] = [pts[i], pts[i + 1]]
    const [u, w] = axis === 'y' ? [a[1] - at, b[1] - at] : [a[0] - at, b[0] - at]
    if (u === 0) out.push(axis === 'y' ? a[0] : a[1])
    else if (u * w < 0) out.push(axis === 'y' ? a[0] + ((b[0] - a[0]) * u) / (u - w) : a[1] + ((b[1] - a[1]) * u) / (u - w))
  }
  return out
}

/** a graph with scaled axes: maps pixels to values using the tick labels, and the drawn line */
function readGraph(svg: string) {
  const ticks = [...svg.matchAll(/<text class="dl tiny" x="([-\d.]+)" y="([-\d.]+)" text-anchor="(\w+)"[^>]*>([\d.]+)<\/text>/g)].map((m) => ({ x: Number(m[1]), y: Number(m[2]), anchor: m[3], v: Number(m[4]) }))
  const xt = ticks.filter((t) => t.anchor === 'middle')
  const yt = ticks.filter((t) => t.anchor === 'end')
  const X = (px: number) => xt[0].v + ((px - xt[0].x) / (xt[xt.length - 1].x - xt[0].x)) * (xt[xt.length - 1].v - xt[0].v)
  const Y = (py: number) => yt[0].v + ((py - (yt[0].y - 1)) / (yt[yt.length - 1].y - yt[0].y)) * (yt[yt.length - 1].v - yt[0].v)
  const poly = svg.match(/<polyline class="plot" points="([^"]*)"/)?.[1] ?? ''
  const pts = poly.split(' ').map((s) => s.split(',').map(Number) as P).map(([x, y]) => [X(x), Y(y)] as P)
  const mark = svg.match(/<circle class="pt hlfill" cx="([-\d.]+)" cy="([-\d.]+)"/)
  return { pts, mark: mark ? ([X(Number(mark[1])), Y(Number(mark[2]))] as P) : null }
}

// ---------------------------------------------------------------- the checks, by question type

function check(id: string, qn: Question): string | null {
  const m = qn.meta as Record<string, any> & { t: string }
  const ans = qn.answer
  const v = numOf(ans)
  const svg = qn.diagram ?? ''
  const pl = svg.includes('Number plane') ? readPlane(svg) : null
  if (svg.includes('Number plane') && !pl) return 'could not read the number plane'
  if (pl) diagramReads++
  const labelled = (L: string) => pl?.points.find((p) => p.label === L)?.p
  switch (m.t) {
    case 'len': {
      const d = Math.sqrt(dist2(m.a, m.b))
      if (Number.isInteger(d) ? !(near(v!, d) && m.dp === null) : !(near(v!, d) && ans.kind === 'num' && ans.dp === 1)) return `length should be ${d}`
      if (pl) {
        const pts = pl.points.map((p) => p.p)
        if (pts.length !== 2 || !near(Math.sqrt(dist2(pts[0], pts[1])), d)) return `diagram points ${JSON.stringify(pts)} give a different length`
        // the dashed legs must be the run and rise
        const dashes = pl.lines.filter((l) => /dash/.test(l.cls)).map((l) => Math.hypot(l.x2 - l.x1, l.y2 - l.y1)).sort((a, b) => a - b)
        const want = [Math.abs(m.b[0] - m.a[0]), Math.abs(m.b[1] - m.a[1])].sort((a, b) => a - b)
        if (dashes.length !== 2 || !near(dashes[0], want[0], 1e-3) || !near(dashes[1], want[1], 1e-3)) return `dashed legs ${dashes} should be ${want}`
      }
      return null
    }
    case 'run':
    case 'rise': {
      const want = m.t === 'run' ? Math.abs(m.b[0] - m.a[0]) : Math.abs(m.b[1] - m.a[1])
      const pts = pl!.points.map((p) => p.p)
      const fromDiagram = m.t === 'run' ? Math.abs(pts[0][0] - pts[1][0]) : Math.abs(pts[0][1] - pts[1][1])
      return near(v!, want) && near(fromDiagram, want) ? null : `${m.t} should be ${want} (diagram ${fromDiagram})`
    }
    case 'len-surd': {
      const d2 = dist2(m.a, m.b)
      if (Number.isInteger(Math.sqrt(d2))) return 'surd question with a whole-number answer'
      return v === d2 && qn.prefix === '√' ? null : `should be √${d2}`
    }
    case 'len-mc': {
      const d2 = dist2(m.a, m.b)
      return mcText(ans) === `sqrt(${d2}) units` ? null : `correct option ${mcText(ans)} should be √${d2}`
    }
    case 'tri-type': {
      const s = [dist2(m.R, m.S), dist2(m.S, m.T), dist2(m.R, m.T)]
      const area = (m.S[0] - m.R[0]) * (m.T[1] - m.R[1]) - (m.S[1] - m.R[1]) * (m.T[0] - m.R[0])
      if (area === 0) return 'the three points are collinear'
      const want = new Set(s).size === 1 ? 'equilateral' : new Set(s).size === 2 ? 'isosceles' : 'scalene'
      return mcText(ans) === want ? null : `should be ${want}`
    }
    case 'perim': {
      const [A, B, C] = m.pts as P[]
      const per = Math.sqrt(dist2(A, B)) + Math.sqrt(dist2(B, C)) + Math.sqrt(dist2(A, C))
      return near(v!, per) && ans.kind === 'num' && ans.dp === 1 ? null : `perimeter should be ${per}`
    }
    case 'trap-perimeter':
    case 'trap-area': {
      const V: P[] = [m.M, m.N, m.P, m.T]
      const per = V.reduce((t, p, i) => t + Math.sqrt(dist2(p, V[(i + 1) % 4])), 0)
      const area = Math.abs(V.reduce((t, p, i) => t + p[0] * V[(i + 1) % 4][1] - V[(i + 1) % 4][0] * p[1], 0)) / 2
      const want = m.t === 'trap-area' ? area : per
      if (!near(v!, want)) return `should be ${want}`
      for (const [L, p] of [['M', m.M], ['N', m.N], ['P', m.P], ['T', m.T]] as [string, P][]) {
        const got = labelled(L)
        if (!got || got[0] !== p[0] || got[1] !== p[1]) return `vertex ${L} drawn at ${got}`
      }
      return null
    }
    case 'mid': {
      const want: P = [(m.a[0] + m.b[0]) / 2, (m.a[1] + m.b[1]) / 2]
      if (ans.kind !== 'point' || ans.x !== want[0] || ans.y !== want[1]) return `midpoint should be ${want}`
      if (pl && pl.points.length === 2) {
        const [p, q2] = pl.points.map((u) => u.p)
        if (!near((p[0] + q2[0]) / 2, want[0]) || !near((p[1] + q2[1]) / 2, want[1])) return 'diagram endpoints differ'
      }
      return null
    }
    case 'mid-mc':
      return mcText(ans) === ptText([(m.a[0] + m.b[0]) / 2, (m.a[1] + m.b[1]) / 2]) ? null : 'wrong midpoint option'
    case 'quarter': {
      const want: P = [m.A[0] + ((m.B[0] - m.A[0]) * m.k) / 4, m.A[1] + ((m.B[1] - m.A[1]) * m.k) / 4]
      if (ans.kind !== 'point' || ans.x !== want[0] || ans.y !== want[1]) return `should be ${want}`
      const L = ['Q', 'P', 'R'][m.k - 1]
      const got = labelled(L)
      return got && near(got[0], want[0]) && near(got[1], want[1]) ? null : `${L} drawn at ${got}`
    }
    case 'iso-mr': {
      const M: P = [(m.P[0] + m.Q[0]) / 2, (m.P[1] + m.Q[1]) / 2]
      if (dist2(m.R, m.P) !== dist2(m.R, m.Q)) return 'triangle is not isosceles'
      const d2 = dist2(M, m.R)
      return Number.isInteger(Math.sqrt(d2)) ? (v === Math.sqrt(d2) && !qn.prefix ? null : 'MR wrong') : v === d2 && qn.prefix === '√' ? null : `MR should be √${d2}`
    }
    case 'sign':
    case 'grad': {
      const want = m.rise / m.run
      if (m.t === 'sign') {
        if (mcText(ans) !== (want > 0 ? 'positive' : 'negative')) return 'wrong sign'
      } else if (!near(v!, want)) return `gradient should be ${want}`
      if (svg.includes('rise and run triangle')) {
        // labels "run 6" and "rise 2" / "drop 2", and the drawn line must slope the same way
        const run = Number(svg.match(/>run (\d+)</)?.[1] ?? NaN)
        const rr = svg.match(/>(rise|drop) (\d+)</)
        const ln = svg.match(/<line class="plot" x1="([-\d.]+)" y1="([-\d.]+)" x2="([-\d.]+)" y2="([-\d.]+)"/)!.slice(1).map(Number)
        const drawnUp = (ln[3] - ln[1]) / (ln[2] - ln[0]) < 0 // screen y goes down
        if (m.t === 'grad') {
          if (!rr || !near((rr[1] === 'rise' ? 1 : -1) * Number(rr[2]) / run, want)) return `triangle labels give ${rr?.[0]} / ${run}`
        }
        if (drawnUp !== want > 0) return 'line drawn sloping the wrong way'
        // drawn steepness matches the numbers
        const k = Math.abs(((ln[3] - ln[1]) / (ln[2] - ln[0])))
        if (!near(k, Math.abs(want), 1e-2)) return `drawn steepness ${k} for ${want}`
      }
      if (pl) {
        const pts = pl.points.map((u) => u.p)
        if (pts.length >= 2) {
          const g = (pts[1][1] - pts[0][1]) / (pts[1][0] - pts[0][0])
          if (!near(g, want, 1e-6)) return `diagram points give gradient ${g}`
        }
      }
      return null
    }
    case 'pair': {
      if (ans.kind !== 'mc') return 'not mc'
      const want = m.kn / m.kd
      const good = ans.options.map((o) => {
        const n = strip(o).replace(/−/g, '-').match(/-?\d+/g)!.map(Number)
        return near((n[3] - n[1]) / (n[2] - n[0]), want)
      })
      return good.filter(Boolean).length === 1 && good[ans.correct] && ans.options.length >= 4 ? null : `${good.filter(Boolean).length} options have the gradient`
    }
    case 'parallel': {
      const V: P[] = [m.P, m.Q, m.R, m.S]
      const par = (i: number, j: number) => {
        const [a, b, c, d] = [V[i], V[(i + 1) % 4], V[j], V[(j + 1) % 4]]
        return (b[0] - a[0]) * (d[1] - c[1]) - (b[1] - a[1]) * (d[0] - c[0]) === 0
      }
      const p02 = par(0, 2)
      const p13 = par(1, 3)
      const want = p02 && p13 ? 'a parallelogram' : p02 ? 'PQ and RS' : p13 ? 'QR and SP' : 'No sides are parallel'
      return mcText(ans) === want ? null : `should be ${want}`
    }
    case 'collinear': {
      const cr = (m.B[0] - m.A[0]) * (m.C[1] - m.A[1]) - (m.B[1] - m.A[1]) * (m.C[0] - m.A[0])
      return mcText(ans) === (cr === 0 ? 'Yes' : 'No') ? null : 'collinear answer wrong'
    }
    case 'table': {
      const f = equationFn(equationsIn(qn.prompt)[0] ?? '')
      if (!f) return 'could not read the equation'
      const l = lineOf(f)!
      // the other entries in the table must fit the same equation
      const cells = [...svg.matchAll(/<td>(.*?)<\/td>/g)].map((u) => u[1].replace('−', '-'))
      const xs = cells.slice(0, 5).map(Number)
      const ys = cells.slice(5)
      for (let i = 0; i < 5; i++) if (ys[i] !== '?' && !near(Number(ys[i]), l.m * xs[i] + l.c)) return `table entry ${ys[i]} at x = ${xs[i]}`
      return near(v!, l.m * m.x + l.c) ? null : `y should be ${l.m * m.x + l.c}`
    }
    case 'intercept': {
      const e = equationsIn(qn.prompt).find((s) => s.includes('='))
      const f = e ? equationFn(e) : null
      if (!f) return `could not read the equation in ${strip(qn.prompt)}`
      // x-intercept: f(x, 0) = 0; y-intercept: f(0, y) = 0 (f is linear)
      const want = m.which === 'x' ? -f(0, 0) / (f(1, 0) - f(0, 0)) : -f(0, 0) / (f(0, 1) - f(0, 0))
      const got = ans.kind === 'mc' ? Number(mcText(ans).replace('−', '-')) : v!
      return near(got, want) ? null : `${m.which}-intercept should be ${want}`
    }
    case 'online': {
      const f = equationFn(equationsIn(qn.prompt).pop() ?? '')
      if (!f) return 'could not read the equation'
      return mcText(ans) === (near(f(m.p[0], m.p[1]), 0) ? 'Yes' : 'No') ? null : 'point-on-line answer wrong'
    }
    case 'whichpoint': {
      if (ans.kind !== 'mc') return 'not mc'
      const on = ans.options.map((o) => {
        const n = strip(o).replace(/−/g, '-').match(/-?\d+/g)!.map(Number)
        return n[0] - n[1] === m.k
      })
      return on.filter(Boolean).length === 1 && on[ans.correct] ? null : 'not exactly one point on the line'
    }
    case 'hv': {
      // find the labelled line in the diagram
      const label = strip(qn.prompt).match(/line (\w) ?\?/)![1]
      const t = pl!.texts.find((u) => u.s === label)
      if (!t) return 'label missing'
      const lines = plots(pl!)
      const vert = lines.filter((l) => near(l.x1, l.x2))
      const horiz = lines.filter((l) => near(l.y1, l.y2))
      // the nearest line to its label
      const best = [...vert.map((l) => ({ kind: 'x', k: l.x1, d: Math.abs(pl!.X(t.x) - l.x1) })), ...horiz.map((l) => ({ kind: 'y', k: l.y1, d: Math.abs(pl!.Y(t.y) - l.y1) }))].sort((a, b) => a.d - b.d)[0]
      const want = `${best.kind} = ${String(Math.round(best.k)).replace('-', '−')}`
      return mcText(ans) === want ? null : `diagram says ${want}`
    }
    case 'describe': {
      const t = strip(qn.prompt)
      let want: [string, number] | null = null
      let mm = t.match(/crosses the y -axis at (−?\d+)/)
      if (mm) want = ['y', Number(mm[1].replace('−', '-'))]
      mm = t.match(/vertical line that goes through \((−?\d+), (−?\d+)\)/)
      if (mm) want = ['x', Number(mm[1].replace('−', '-'))]
      mm = t.match(/(\d+) units? (above|below) the x -axis/)
      if (mm) want = ['y', (mm[2] === 'above' ? 1 : -1) * Number(mm[1])]
      mm = t.match(/(\d+) units? to the (left|right) of the y -axis/)
      if (mm) want = ['x', (mm[2] === 'right' ? 1 : -1) * Number(mm[1])]
      mm = t.match(/(?:parallel to the x -axis|horizontal line) that (?:passes|goes) through \((−?\d+), (−?\d+)\)/)
      if (mm) want = ['y', Number(mm[2].replace('−', '-'))]
      if (!want) return `could not read the description: ${t}`
      return strip(qn.prefix ?? '').startsWith(want[0]) && v === want[1] ? null : `should be ${want[0]} = ${want[1]}`
    }
    case 'through': {
      const want = m.P1[0] === m.P2[0] ? `x = ${String(m.P1[0]).replace('-', '−')}` : `y = ${String(m.P1[1]).replace('-', '−')}`
      return mcText(ans) === want ? null : `should be ${want}`
    }
    case 'cross': {
      const eqs = equationsIn(qn.prompt).map(equationFn)
      if (eqs.length < 2 || eqs.some((f) => !f)) return 'could not read both equations'
      if (ans.kind !== 'mc') return 'not mc'
      const both = ans.options.map((o) => {
        const n = strip(o).replace(/−/g, '-').match(/-?\d+/g)!.map(Number)
        return eqs.every((f) => near(f!(n[0], n[1]), 0))
      })
      return both.filter(Boolean).length === 1 && both[ans.correct] ? null : 'not exactly one crossing point'
    }
    case 'rect':
      return v === (m.x2 - m.x1) * (m.y2 - m.y1) ? null : 'area wrong'
    case 'axis':
      return mcText(ans) === (m.which === 'x' ? 'y = 0' : 'x = 0') ? null : 'axis equation wrong'
    case 'read': {
      const e = equationsIn(qn.prompt)[0]
      const f = e ? equationFn(e) : null
      if (!f) return `could not read ${e}`
      const l = lineOf(f)!
      const want = m.which === 'gradient' ? l.m : l.c
      return near(v!, want) ? null : `${m.which} should be ${want}`
    }
    case 'which-m':
    case 'which-c': {
      if (ans.kind !== 'mc') return 'not mc'
      const fits = ans.options.map((o) => {
        const f = equationFn(strip(o))
        const l = f ? lineOf(f) : null
        return l ? (m.t === 'which-m' ? near(l.m, m.k) : near(l.c, -m.k)) : false
      })
      return fits.filter(Boolean).length === 1 && fits[ans.correct] ? null : `${fits.filter(Boolean).length} equations fit`
    }
    case 'write':
    case 'eq':
    case 'eq-mc': {
      const wantM = m.mn / m.md
      if (m.t === 'write') {
        const t = strip(qn.prompt)
        const g = t.match(/gradient of (.*?) and/)![1]
        const c = Number(t.match(/intercept of (−?\d+)/)![1].replace('−', '-'))
        const gv = Function(`return (${g.replace(/−/g, '-')})`)()
        if (!near(gv, wantM) || c !== m.c) return 'prompt and meta disagree'
      }
      // the expected expression, evaluated at a few x-values, must equal mx + c
      if (ans.kind === 'expr') {
        for (const x of [-3, 0, 2, 5]) {
          const ok = checkAnswer(ans, String(wantM * x + m.c)).correct // a number is not an expression in x …
          void ok
        }
        for (const x of [-3, 1, 4]) {
          const f = equationFn('y = ' + ans.expr.replace(/-/g, '−'))
          if (!f || !near(f(x, wantM * x + m.c), 0)) return `expression ${ans.expr} is not y = ${wantM}x + ${m.c}`
        }
      } else if (ans.kind === 'mc') {
        const f = equationFn(mcText(ans))
        const l = f ? lineOf(f) : null
        if (!l || !near(l.m, wantM) || !near(l.c, m.c)) return 'wrong option'
      }
      // and the diagram must show this line
      if (pl) {
        const pts = pl.points.map((u) => u.p)
        for (const p of pts) if (!near(p[1], wantM * p[0] + m.c)) return `marked point ${p} is not on the line`
        const L = plots(pl)[0]
        if (!near(mOf(L), wantM, 1e-3)) return `drawn gradient ${mOf(L)}`
      } else if (svg.includes('Sketch graph')) {
        const sk = readSketch(svg)
        // y-intercept label sits beside the y-axis at the height where the curve crosses it
        const yCross = crossings(sk.pts, 'x', sk.cx)[0]
        const xCross = crossings(sk.pts, 'y', sk.cy)
        const k = (yCross - sk.cy) / -(m.c || 1)
        if (m.c !== 0) {
          const lab = sk.nums.find((n) => Math.abs(n.y - 4 - yCross) < 1.5)
          if (!lab || lab.v !== m.c) return `y-intercept label ${lab?.v} for c = ${m.c}`
        }
        if (sk.point) {
          if (!near(sk.point[1], wantM * sk.point[0] + m.c)) return `labelled point ${sk.point} not on y = ${wantM}x + ${m.c}`
        } else if (wantM !== 0 && m.c !== 0) {
          const xi = -m.c / wantM
          const lab = sk.nums.find((n) => Math.abs(n.v - Math.round(xi * 100) / 100) < 1e-9 && Math.abs(n.y - sk.cy) < 20)
          if (!lab) return `x-intercept ${xi} not labelled`
          if (!xCross.some((x) => Math.abs(x - lab.x) < 1)) return 'x-intercept label not where the line crosses'
        }
        void k
        // slope direction
        const up = sk.pts[sk.pts.length - 1][1] < sk.pts[0][1]
        if (wantM !== 0 && up !== wantM > 0) return 'sketch slopes the wrong way'
      }
      return null
    }
    case 'steeper': {
      const eqs = equationsIn(qn.prompt)
      void eqs
      if (ans.kind !== 'mc') return 'not mc'
      const [l1, l2] = ans.options.slice(0, 2).map((o) => lineOf(equationFn(strip(o))!)!)
      const want = near(Math.abs(l1.m), Math.abs(l2.m)) ? 'They are equally steep' : Math.abs(l1.m) > Math.abs(l2.m) ? strip(ans.options[0]) : strip(ans.options[1])
      return mcText(ans) === want ? null : `should be ${want}`
    }
    case 'match-line': {
      const f = equationFn(mcText(ans))
      const l = f ? lineOf(f) : null
      if (!l || !near(l.m, m.m) || !near(l.c, m.c)) return 'wrong equation'
      const sk = readSketch(svg)
      const up = sk.pts[sk.pts.length - 1][1] < sk.pts[0][1]
      if (up !== m.m > 0) return 'sketch slopes the wrong way'
      const others = (ans.kind === 'mc' ? ans.options : []).filter((_, i) => i !== (ans as any).correct).map((o) => lineOf(equationFn(strip(o))!)!)
      if (others.some((o) => near(o.m, m.m) && near(o.c, m.c))) return 'a wrong option is the same line'
      return null
    }
    case 'step': {
      const want: P = [m.md, m.c + m.mn]
      const f = equationFn(equationsIn(qn.prompt)[0] ?? '')
      if (!f || !near(f(want[0], want[1]), 0)) return 'the point reached is not on the line'
      return ans.kind === 'point' && ans.x === want[0] && ans.y === want[1] ? null : `should be ${want}`
    }
    case 'solve': {
      // solve the printed equation "… = k" for x, independently
      const t = strip(qn.prompt).match(/solve (.*?)\.$/)![1]
      const f = equationFn(t.replace(/x/g, 'x'))
      if (!f) return `could not read ${t}`
      const x0 = -f(0, 0) / (f(1, 0) - f(0, 0))
      if (!near(v!, x0)) return `solution should be ${x0}`
      // the drawn line passes through (x0, k)
      const L = plots(pl!)[0]
      const yAt = L.y1 + mOf(L) * (x0 - L.x1)
      if (!near(yAt, m.k, 1e-3)) return `drawn line at x = ${x0} is ${yAt}, not ${m.k}`
      return null
    }
    case 'meet-h': {
      const eqs = equationsIn(qn.prompt).map(equationFn)
      if (ans.kind !== 'point' || eqs.length < 2) return 'cannot read'
      return eqs.every((f) => f && near(f(ans.x, ans.y), 0)) ? null : 'point not on both lines'
    }
    case 'apply':
      return checkApply(qn, m, v)
    case 'vary-k': {
      const k = m.y1 / m.x1
      return ans.kind === 'mc' ? (near(Number(mcText(ans)), k) ? null : 'wrong k') : near(v!, k) ? null : `k should be ${k}`
    }
    case 'vary-y':
    case 'vary-x': {
      const k = m.y1 / m.x1
      const want = m.t === 'vary-y' ? k * m.x2 : m.y2 / k
      if (ans.kind === 'mc') return near(Number(mcText(ans).replace(' min', '')), Math.round(want * 100) / 100) ? null : `should be ${want}`
      return near(v!, want, 1e-6) ? null : `should be ${want}`
    }
    case 'qtable': {
      const f = equationFn(equationsIn(qn.prompt)[0] ?? '')
      if (!f) return 'could not read the equation'
      // y = f solved: f(x, y) = y − (…) since the equation is y = …
      const yAt = (x: number) => -f(x, 0)
      const cells = [...svg.matchAll(/<td>(.*?)<\/td>/g)].map((u) => u[1].replace('−', '-'))
      const xs = cells.slice(0, 7).map(Number)
      const ys = cells.slice(7)
      for (let i = 0; i < 7; i++) if (ys[i] !== '?' && ys[i] !== '' && !near(Number(ys[i]), yAt(xs[i]))) return `table entry ${ys[i]} at x = ${xs[i]}`
      return near(v!, yAt(m.x)) ? null : `y should be ${yAt(m.x)}`
    }
    case 'qvertex':
    case 'qyint':
    case 'qconcave': {
      const f = equationFn(equationsIn(qn.prompt)[0] ?? '')
      if (!f) return 'could not read the equation'
      const c = -f(0, 0)
      const a = -f(1, 0) - c
      if (m.t === 'qvertex') return ans.kind === 'point' && ans.x === 0 && near(ans.y, c) ? null : 'vertex wrong'
      if (m.t === 'qyint') return near(v!, c) ? null : 'y-intercept wrong'
      return mcText(ans) === (a > 0 ? 'concave up' : 'concave down') ? null : 'concavity wrong'
    }
    case 'qwider': {
      if (ans.kind !== 'mc') return 'not mc'
      const [a1, a2] = ans.options.slice(0, 2).map((o) => {
        const f = equationFn(strip(o))!
        return -f(1, 0) + f(0, 0)
      })
      const want = near(Math.abs(a1), Math.abs(a2)) ? 'They are the same width' : Math.abs(a1) < Math.abs(a2) ? strip(ans.options[0]) : strip(ans.options[1])
      return mcText(ans) === want ? null : `should be ${want}`
    }
    case 'qstatement': {
      const f = equationFn(equationsIn(qn.prompt)[0] ?? '')
      if (!f || ans.kind !== 'mc') return 'cannot read'
      const c = -f(0, 0)
      const a = -f(1, 0) - c
      const truth = (s: string) => {
        let mm = s.match(/concave (up|down)/)
        if (mm) return (mm[1] === 'up') === a > 0
        mm = s.match(/vertex is \(0, (−?\d+)\)/)
        if (mm) return Number(mm[1].replace('−', '-')) === c
        mm = s.match(/passes through \(1, (−?\d+)\)/)
        if (mm) return Number(mm[1].replace('−', '-')) === a + c
        mm = s.match(/y -intercept is (−?\d+)/)
        if (mm) return Number(mm[1].replace('−', '-')) === c
        if (/symmetrical about the x -axis/.test(s)) return false
        throw new Error('unknown statement ' + s)
      }
      const t = ans.options.map((o) => truth(strip(o)))
      return t.filter(Boolean).length === 1 && t[ans.correct] ? null : `${t.filter(Boolean).length} true statements`
    }
    case 'qmatch': {
      // fit the drawn curve: y at x = 0 and x = 1
      const pts = pl!.curves[0]
      const at = (x: number) => pts.reduce((b, p) => (Math.abs(p[0] - x) < Math.abs(b[0] - x) ? p : b))
      const c = at(0)[1]
      const a = at(1)[1] - c
      const f = equationFn(mcText(ans))!
      const ca = -f(0, 0)
      const aa = -f(1, 0) - ca
      return near(c, ca, 1e-2) && near(a, aa, 1e-2) ? null : `drawn a=${a}, c=${c}; answer a=${aa}, c=${ca}`
    }
    case 'qxint': {
      const f = equationFn(equationsIn(qn.prompt)[0] ?? '')!
      if (ans.kind !== 'nums') return 'not nums'
      return ans.values.length === 2 && ans.values.every((x) => near(f(x, 0), 0)) && ans.values[0] === -ans.values[1] ? null : 'x-intercepts wrong'
    }
    case 'qshift': {
      const t = strip(qn.prompt)
      const c = Number(t.match(/([+−]) (\d+) related/)?.[2] ?? NaN) * (t.includes('− ' + t.match(/([+−]) (\d+) related/)?.[2] + ' related') ? -1 : 1)
      return mcText(ans) === `moved ${c > 0 ? 'up' : 'down'} ${Math.abs(c)} ${Math.abs(c) === 1 ? 'unit' : 'units'}` ? null : `should move ${c}`
    }
    case 'drop-h':
      return v === m.H - 5 * m.time ** 2 && v! >= 0 ? null : 'height wrong'
    case 'drop-ground':
      return near(5 * v! ** 2, m.H) ? null : 'landing time wrong'
    case 'drop-fallen':
      return v === 5 * m.time ** 2 ? null : 'distance fallen wrong'
    case 'drop-between':
      return v === 5 * m.time ** 2 - 5 * (m.time - 1) ** 2 ? null : 'distance in that second wrong'
    case 'drop-meaning':
      return /height it is dropped from/.test(mcText(ans)) ? null : 'meaning wrong'
    case 'bridge-top':
      return v === m.H ? null : 'top wrong'
    case 'bridge-width':
      return near(-m.a * (v! / 2) ** 2 + m.H, 0) ? null : 'width wrong'
    case 'bridge-height':
      return near(v!, m.H - m.a * m.x ** 2) ? null : 'height wrong'
    case 'dish-depth':
      return near(v!, m.a * m.r ** 2) ? null : 'depth wrong'
    case 'dish-radius':
      return near(m.a * v! ** 2, Number(strip(qn.prompt).match(/depth is ([\d.]+)/)![1])) ? null : 'radius wrong'
    case 'pp-mid':
      return ans.kind === 'point' && (ans.x + m.X[0]) / 2 === m.M[0] && (ans.y + m.X[1]) / 2 === m.M[1] ? null : 'endpoint wrong'
    case 'pp-line': {
      const t = strip(qn.prompt)
      const n = t.replace(/−/g, '-').match(/-?\d+/g)!.map(Number) // A(0, c), B(bx, by), k
      const [ax, ay, bx, by, k] = n
      const want = ay + ((by - ay) / (bx - ax)) * (k - ax)
      return near(v!, want) ? null : `y should be ${want}`
    }
    case 'pp-para': {
      if (ans.kind !== 'point') return 'not a point'
      // diagonals of a parallelogram bisect each other: mid(AC) = mid(BD)
      return near((m.A[0] + m.C[0]) / 2, (m.B[0] + ans.x) / 2) && near((m.A[1] + m.C[1]) / 2, (m.B[1] + ans.y) / 2) ? null : 'D wrong'
    }
    case 'pp-radius': {
      const r2 = dist2(m.C, m.A)
      return Number.isInteger(Math.sqrt(r2)) ? (v === Math.sqrt(r2) ? null : 'radius wrong') : v === r2 && qn.prefix === '√' ? null : 'radius surd wrong'
    }
    case 'pp-inside': {
      const r2 = dist2(m.C, m.A)
      return mcText(ans) === (m.dist ** 2 > r2 ? 'outside' : m.dist ** 2 < r2 ? 'inside' : 'on the circle') ? null : 'inside/outside wrong'
    }
    case 'pp-sq-opp':
      return ans.kind === 'point' && ans.x === 2 * m.M[0] - m.V[0] && ans.y === 2 * m.M[1] - m.V[1] ? null : 'opposite vertex wrong'
    case 'pp-sq-adj': {
      if (ans.kind !== 'mc') return 'not mc'
      // a vertex next to V: same distance from M as V, and at right angles to MV
      const isAdj = (o: string) => {
        const n = strip(o).replace(/−/g, '-').match(/-?\d+/g)!.map(Number) as P
        const u = [m.V[0] - m.M[0], m.V[1] - m.M[1]]
        const w = [n[0] - m.M[0], n[1] - m.M[1]]
        return u[0] * w[0] + u[1] * w[1] === 0 && u[0] ** 2 + u[1] ** 2 === w[0] ** 2 + w[1] ** 2
      }
      const a = ans.options.map(isAdj)
      return a.filter(Boolean).length === 1 && a[ans.correct] ? null : `${a.filter(Boolean).length} adjacent vertices among options`
    }
    default:
      return `no check for type ${m.t}`
  }
}

function checkApply(qn: Question, m: Record<string, any>, v: number | null): string | null {
  const t = strip(qn.prompt)
  const ans = qn.answer
  switch (m.kind) {
    case 'rate':
    case 'pay': {
      // read the rate from the drawn graph (or the printed equation) independently
      let rate: number
      if (qn.diagram) {
        const g = readGraph(qn.diagram)
        rate = (g.pts[1][1] - g.pts[0][1]) / (g.pts[1][0] - g.pts[0][0])
        if (!near(g.pts[0][1], 0, 1e-3) && Math.abs(g.pts[0][1]) > 1e-3) return 'pay line does not start at 0'
        if (g.mark) {
          // the marked point must sit on grid lines (readable) and give the rate
          if (!near(g.mark[1] / g.mark[0], rate, 1e-3)) return 'marked point not on the line'
        }
      } else rate = Number(t.match(/P = ([\d.]+) ?t/)![1])
      if (!near(rate, m.r, 1e-3)) return `drawn rate ${rate} for ${m.r}`
      const want = m.kind === 'rate' ? rate : rate * Number(t.match(/for ([\d.]+) hours/)![1])
      return near(v!, Math.round(want * 100) / 100, 1e-3) ? null : `should be ${want}`
    }
    case 'forward': {
      const mm = t.replace(/−/g, '-').match(/C = ([\d.]+) ?x \+ ([\d.]+).*?cost for ([\d.]+)/)!
      const want = Number(mm[1]) * Number(mm[3]) + Number(mm[2])
      return near(v!, Math.round(want * 100) / 100) ? null : `cost should be ${want}`
    }
    case 'inverse': {
      if (/tank/.test(t)) {
        const mm = t.match(/W = ([\d ]+?) − (\d+) ?t/)!
        return near(v!, Number(mm[1].replace(/ /g, '')) / Number(mm[2])) ? null : 'empty time wrong'
      }
      if (/S = /.test(t)) {
        const mm = t.match(/S = (\d+) ?w \+ (\d+).*?reach \$([\d ]+)/)!
        return near(Number(mm[1]) * v! + Number(mm[2]), Number(mm[3].replace(/ /g, ''))) ? null : 'weeks wrong'
      }
      const mm = t.match(/C = ([\d.]+) ?x \+ ([\d.]+)/)!
      const cost = Number(t.match(/(?:cost was|for) \$([\d.]*\d)/)![1])
      return near(Number(mm[1]) * v! + Number(mm[2]), cost, 1e-9) ? null : `${v} does not give ${cost}`
    }
    case 'meaning':
      return /fee|flagfall/.test(strip((ans as any).options[(ans as any).correct])) ? null : 'meaning wrong'
    case 'dep-grad':
    case 'dep-int': {
      const g = readGraph(qn.diagram!)
      const grad = (g.pts[1][1] - g.pts[0][1]) / (g.pts[1][0] - g.pts[0][0])
      if (!near(g.pts[0][1], m.V0, 1e-3)) return `graph starts at ${g.pts[0][1]}`
      if (m.kind === 'dep-grad') return near(v!, grad, 1e-3) ? null : `gradient should be ${grad}`
      return mcText(ans).startsWith('$' + String(m.V0).replace(/\B(?=(\d{3})+(?!\d))/g, m.V0 >= 10000 ? ' ' : '')) ? null : 'intercept option wrong'
    }
    case 'dep-value': {
      const mm = t.match(/V = −([\d ]+?) ?n \+ ([\d ]+?) dollars.*?after ([\d.]+) years?/)!
      const want = -Number(mm[1].replace(/ /g, '')) * Number(mm[3]) + Number(mm[2].replace(/ /g, ''))
      return near(v!, want) ? null : `value should be ${want}`
    }
    case 'temp-f':
    case 'temp-c': {
      if (m.kind === 'temp-f') return near(v!, (Number(t.match(/Convert (−?\d+)°C/)![1].replace('−', '-')) * 9) / 5 + 32) ? null : 'F wrong'
      const F = Number(t.match(/is (−?[\d.]+)°F/)![1].replace('−', '-'))
      return near(v!, ((F - 32) * 5) / 9) ? null : 'C wrong'
    }
    default:
      return `no apply check for ${m.kind}`
  }
}

// ---------------------------------------------------------------- wording and answer self-checks

const SLIPS = [/(?<![\d.])1 (units|squares|seconds|hours|minutes|weeks|years|metres|sandwiches|tiles)\b/, /NaN|undefined|Infinity|\[object/, /\+ −|− −|−0\b(?!\.)/, /\b0 ?x\b/, /\b1x\b/, /= \+/]
function wording(id: string, qn: Question) {
  const all = [qn.prompt, ...qn.steps, qn.hint, qn.prefix ?? '', qn.suffix ?? ''].map(strip).join(' | ')
  for (const re of SLIPS) if (re.test(all)) fail(id, `wording slip ${re}: ${all.match(re)?.[0]} in ${all.slice(0, 160)}`, qn)
  if (!qn.steps.length) fail(id, 'no worked steps', qn)
  // the page's own marking accepts the stored answer
  const shown = qn.answer.kind === 'mc' ? null : answerText(qn.answer)
  if (shown !== null && !checkAnswer(qn.answer, shown).correct) fail(id, `marking rejects its own answer "${shown}"`, qn)
  if (qn.answer.kind === 'mc') {
    const o = qn.answer.options.map(strip)
    if (new Set(o).size !== o.length) fail(id, `repeated options ${o.join(' / ')}`, qn)
    if (o.length < 2 || (o.length < 3 && !o.includes('Yes') && !o.includes('positive') && !o.includes('concave up'))) fail(id, `only ${o.length} options`, qn)
  }
  if (qn.diagram && /class="plot"[^>]*NaN|NaN/.test(qn.diagram)) fail(id, 'NaN in the diagram', qn)
  // table cells are plain numbers: no "1.000" or "0.00"
  for (const c of (qn.diagram ?? '').matchAll(/<td>(.*?)<\/td>/g)) if (/^−?\d+\.\d*0$/.test(c[1])) fail(id, `table cell written as ${c[1]}`, qn)
  // nothing outside the picture (lines inside a clip-path are cut off at the plane's edge, so skip those)
  const svgTag = (qn.diagram ?? '').match(/<svg[^>]*viewBox="0 0 ([\d.]+) ([\d.]+)"/)
  if (svgTag) {
    const [W, H] = [Number(svgTag[1]), Number(svgTag[2])]
    const outside = (x: number, y: number) => x < -2 || y < -2 || x > W + 2 || y > H + 2
    const unclipped = qn.diagram!.replace(/<g clip-path[\s\S]*?<\/g>/g, '')
    for (const m of unclipped.matchAll(/<line class="[^"]*" x1="([-\d.]+)" y1="([-\d.]+)" x2="([-\d.]+)" y2="([-\d.]+)"/g)) {
      const [a, b, c, d] = m.slice(1).map(Number)
      if (outside(a, b) || outside(c, d)) fail(id, `line outside the picture (${W}×${H}): ${m[0]}`, qn)
    }
    for (const m of unclipped.matchAll(/<text [^>]*x="([-\d.]+)" y="([-\d.]+)"/g)) if (outside(Number(m[1]), Number(m[2]))) fail(id, `text outside the picture: ${m[0]}`, qn)
  }
}

// ---------------------------------------------------------------- run

for (const skill of NCM11_SKILLS)
  for (const lvl of [1, 2, 3] as Level[])
    for (let i = 0; i < N; i++) {
      setSeed(lvl * 100000 + i * 7 + skill.id.length)
      const qn = skill.gen(lvl)
      const key = `${skill.id} L${lvl} ${(qn.meta as { t: string }).t}${(qn.meta as any).kind ? ':' + (qn.meta as any).kind : ''}`
      counts[key] = (counts[key] ?? 0) + 1
      wording(skill.id, qn)
      let r: string | null
      try {
        r = check(skill.id, qn)
      } catch (e) {
        r = 'check crashed: ' + String(e).slice(0, 160)
      }
      if (r) fail(`${skill.id} L${lvl}`, r, qn)
      else independent++
    }

// the topic test follows Test Yourself 11 and only uses this chapter's skills
const topic = findTopic('y9-coordinate')!
if (topic.test !== NCM11_TEST || NCM11_TEST.length !== 16) fail('test', 'topic test is not the 16-question chapter test')
for (const t of NCM11_TEST) {
  if (!NCM11_SKILLS.some((s) => s.id === t.skill)) fail('test', `unknown skill ${t.skill}`)
  setSeed(42)
  const qn = t.gen!(t.level)
  const r = check(t.skill, qn)
  if (r) fail('test ' + t.skill, r, qn)
}
const order = NCM11_TEST.map((t) => NCM11_SKILLS.findIndex((s) => s.id === t.skill))
if (order.some((x, i) => i > 0 && x < order[i - 1])) fail('test', 'test questions are not in textbook order')
// every skill has a textbook label; the Path skill and Power plus are marked as extensions
for (const s of NCM11_SKILLS) {
  if (!s.ref) fail(s.id, 'no textbook label')
  if ((s.id === 'y9-cg-variation' || s.id === 'y9-cg-powerplus') !== (s.tag === 'extension')) fail(s.id, 'extension label wrong')
}

console.log(Object.entries(counts).sort().map(([k, n]) => `${k}: ${n}`).join('\n'))
console.log(`\n${independent} answers re-worked independently, ${diagramReads} number planes read back`)
if (failures) {
  console.log(`${failures} failures`)
  process.exit(1)
}
console.log('All Chapter 11 checks passed')
