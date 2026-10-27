// Independent checks for the Years 1–4 (Stage 1 and Stage 2) content.
// For questions with diagrams, the answer is recomputed from the SVG itself (hand angles, bar heights,
// tally marks, liquid levels, shape coordinates, solid edges...) so a diagram can never disagree with its answer.
// Also scans every prompt and worked step for wording slips (plurals, "a" before a vowel, 5.0-style artefacts).
// Usage: npx tsx tests/primary.test.ts   (N questions per skill and level, default 200; ONLY=y1 for one year)
import { setSeed } from '../src/lib/maths/rand'
import { checkAnswer, answerText } from '../src/lib/maths/check'
import type { Answer, Level, Question } from '../src/lib/maths/types'
import { STAGE1_TOPICS, STAGE2_TOPICS } from '../src/content/index'

const N = Number(process.env.N ?? 200)
const only = process.env.ONLY ?? ''
let failures = 0
let diagramChecks = 0
let textChecks = 0
const counts: Record<string, number> = {}

const strip = (h: string) =>
  h
    .replace(/<span class="frac"[^>]*><span class="fn">(.*?)<\/span><span class="fd">(.*?)<\/span><\/span>/g, '$1/$2')
    .replace(/<\/?(div|p|br|tr|td|th)\b[^>]*>/g, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&#9633;/g, '□')
    .replace(/&ensp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

function fail(id: string, lvl: number, msg: string, qn: Question) {
  failures++
  if (failures <= Number(process.env.SHOW ?? 40)) console.log(`FAIL ${id} L${lvl}: ${msg}\n   prompt: ${strip(qn.prompt).slice(0, 200)}\n   answer: ${answerText(qn.answer)}`)
}

// ---------------------------------------------------------------- tiny SVG reader

type El = { tag: string; a: Record<string, string>; text: string }
function els(svg: string): El[] {
  const out: El[] = []
  const re = /<(line|rect|circle|path|polygon|text)\b([^>]*?)(\/>|>([\s\S]*?)<\/\1>)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(svg))) {
    const a: Record<string, string> = {}
    for (const am of m[2].matchAll(/([\w-]+)="([^"]*)"/g)) a[am[1]] = am[2]
    out.push({ tag: m[1], a, text: (m[4] ?? '').replace(/<[^>]*>/g, '') })
  }
  return out
}
const hasClass = (e: El, c: string) => (e.a.class ?? '').split(/\s+/).includes(c)
const nfa = (e: El, k: string) => Number(e.a[k])
const parseNum = (s: string) => Number(s.replace(/\s/g, '').replace('−', '-'))
const pathPts = (d: string) => [...d.matchAll(/(-?[\d.]+),(-?[\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])] as [number, number])
const polyPts = (e: El): [number, number][] => (e.tag === 'polygon' ? e.a.points.split(' ').map((p) => p.split(',').map(Number) as [number, number]) : pathPts(e.a.d))
const near = (a: number, b: number, tol = 1e-6) => Math.abs(a - b) <= tol

/** Value of a numeric answer, or of a fraction answer. */
function answerValue(a: Answer): number | null {
  if (a.kind === 'num') return a.value
  if (a.kind === 'frac') return a.n / a.d
  return null
}
const mcCorrect = (a: Answer) => (a.kind === 'mc' ? strip(a.options[a.correct]) : null)

// ---------------------------------------------------------------- diagram readers

function readClock(svg: string): { h: number; m: number } | null {
  const E = els(svg)
  const hh = E.find((e) => hasClass(e, 'hand-h'))
  const mh = E.find((e) => hasClass(e, 'hand-m'))
  if (!hh || !mh) return null
  const ang = (e: El) => {
    const t = (Math.atan2(-(nfa(e, 'y2') - nfa(e, 'y1')), nfa(e, 'x2') - nfa(e, 'x1')) * 180) / Math.PI
    return (((90 - t) % 360) + 360) % 360
  }
  const m = Math.round(ang(mh) / 6) % 60
  // hour hand has moved m/60 of the way to the next number
  const h = Math.round((ang(hh) - m / 2) / 30) % 12
  return { h: h === 0 ? 12 : h, m }
}

function readRuler(svg: string): number | null {
  const E = els(svg)
  const obj = E.find((e) => e.tag === 'rect' && hasClass(e, 'obj'))
  const nums = E.filter((e) => e.tag === 'text' && hasClass(e, 'rulernum'))
  if (!obj || nums.length < 2) return null
  const s = nfa(nums[1], 'x') - nfa(nums[0], 'x') // px per cm
  return Math.round((nfa(obj, 'width') / s) * 10) // mm
}

/** label -> value from a column graph */
function readColumnGraph(svg: string): Map<string, number> | null {
  const E = els(svg)
  const bars = E.filter((e) => e.tag === 'rect' && hasClass(e, 'bar'))
  const axis = E.filter((e) => e.tag === 'text' && e.a['text-anchor'] === 'end' && /^[\d\s]+$/.test(e.text))
  if (!bars.length || axis.length < 2) return null
  axis.sort((p, q) => nfa(q, 'y') - nfa(p, 'y'))
  const y0 = nfa(axis[0], 'y')
  const v0 = parseNum(axis[0].text)
  const y1 = nfa(axis[axis.length - 1], 'y')
  const v1 = parseNum(axis[axis.length - 1].text)
  const labels = E.filter((e) => e.tag === 'text' && hasClass(e, 'tiny') && e.a['text-anchor'] === 'middle' && Math.abs(nfa(e, 'y') - (y0 + 13)) < 0.6)
  const out = new Map<string, number>()
  for (const b of bars) {
    const top = nfa(b, 'y')
    const v = v0 + ((y0 - top) / (y0 - y1)) * (v1 - v0)
    const cx = nfa(b, 'x') + nfa(b, 'width') / 2
    const lab = labels.reduce((best, l) => (Math.abs(nfa(l, 'x') - cx) < Math.abs(nfa(best, 'x') - cx) ? l : best))
    out.set(lab.text, Math.round(v * 2) / 2)
  }
  return out
}

function readTally(svg: string): Map<string, number> | null {
  const E = els(svg)
  const marks = E.filter((e) => e.tag === 'line' && hasClass(e, 'tally'))
  if (!marks.length) return null
  const rowLabels = E.filter((e) => e.tag === 'text' && nfa(e, 'x') === 20 && nfa(e, 'y') > 30).sort((p, q) => nfa(p, 'y') - nfa(q, 'y'))
  const out = new Map<string, number>()
  rowLabels.forEach((l, i) => out.set(l.text, marks.filter((m) => hasClass(m, 'tr' + i)).length))
  return out
}

function readPictureGraph(svg: string): { rows: Map<string, number>; per: number } | null {
  const E = els(svg)
  const keyText = E.find((e) => e.tag === 'text' && /^= \d+/.test(e.text))
  if (!keyText) return null
  const per = Number(keyText.text.match(/^= (\d+)/)![1])
  const full = E.filter((e) => e.tag === 'circle' && hasClass(e, 'pgfull') && e.a.r !== '9')
  const halves = E.filter((e) => e.tag === 'path' && hasClass(e, 'pghalf'))
  const labels = E.filter((e) => e.tag === 'text' && e.a['text-anchor'] === 'end')
  const rows = new Map<string, number>()
  for (const l of labels) {
    const y = nfa(l, 'y')
    const f = full.filter((c) => near(nfa(c, 'cy'), y, 0.6)).length
    const h = halves.filter((p) => {
      const ys = [...p.a.d.matchAll(/[ML ](-?[\d.]+),(-?[\d.]+)/g)].map((m) => Number(m[2]))
      return near((ys[0] + ys[ys.length - 1]) / 2, y, 0.6)
    }).length
    rows.set(l.text, f * per + (h * per) / 2)
  }
  return { rows, per }
}

function readDotPlot(svg: string): Map<number, number> | null {
  const E = els(svg)
  const dots = E.filter((e) => e.tag === 'circle' && hasClass(e, 'hlfill'))
  const ticks = E.filter((e) => e.tag === 'text' && hasClass(e, 'tiny') && /^\d+$/.test(e.text))
  if (!ticks.length) return null
  const out = new Map<number, number>()
  for (const t of ticks) out.set(Number(t.text), 0)
  for (const d of dots) {
    const t = ticks.reduce((best, x) => (Math.abs(nfa(x, 'x') - nfa(d, 'cx')) < Math.abs(nfa(best, 'x') - nfa(d, 'cx')) ? x : best))
    out.set(Number(t.text), out.get(Number(t.text))! + 1)
  }
  return out
}

function readJug(svg: string): number | null {
  const E = els(svg)
  const liq = E.find((e) => e.tag === 'rect' && hasClass(e, 'liquid'))
  const labs = E.filter((e) => e.tag === 'text' && hasClass(e, 'jugnum'))
  if (!liq || labs.length < 2) return null
  const val = (e: El) => parseNum(e.text.replace(/ ?m?L$/, '')) * (/ L$/.test(e.text) && !/mL$/.test(e.text) ? 1000 : 1)
  const [a, b] = [labs[0], labs[labs.length - 1]]
  const v = val(a) + ((nfa(a, 'y') - nfa(liq, 'y')) / (nfa(a, 'y') - nfa(b, 'y'))) * (val(b) - val(a))
  return Math.round(v)
}

function readDial(svg: string): number | null {
  const E = els(svg)
  const nd = E.find((e) => hasClass(e, 'dialneedle'))
  const nums = E.filter((e) => e.tag === 'text' && hasClass(e, 'dialnum')).map((e) => parseNum(e.text))
  const unit = E.find((e) => e.tag === 'text' && (e.text === 'kg' || e.text === 'g'))
  if (!nd || !nums.length || !unit) return null
  const max = Math.max(...nums) * (unit.text === 'kg' ? 1000 : 1)
  let A = (Math.atan2(-(nfa(nd, 'y2') - nfa(nd, 'y1')), nfa(nd, 'x2') - nfa(nd, 'x1')) * 180) / Math.PI
  if (A < -30) A += 360
  return Math.round(((210 - A) / 240) * max)
}

function readCubes(svg: string): number | null {
  const E = els(svg)
  const T = E.filter((e) => hasClass(e, 'cube-top')).length
  const Lf = E.filter((e) => hasClass(e, 'cube-l')).length
  const R = E.filter((e) => hasClass(e, 'cube-r')).length
  if (!T) return null
  return Math.round(Math.sqrt(T * Lf * R))
}

function readNumberLine(svg: string): { value: number; perUnit: number; marks: Map<string, number> } | null {
  const E = els(svg)
  const ticks = E.filter((e) => e.tag === 'line' && hasClass(e, 'nltick')).map((e) => nfa(e, 'x1'))
  const marks = E.filter((e) => e.tag === 'path' && hasClass(e, 'nlmark'))
  const nums = E.filter((e) => e.tag === 'text' && Math.abs(nfa(e, 'y') - 94) < 0.6 && /^[\d.\s]+$/.test(e.text))
  if (!marks.length || nums.length < 2) return null
  const [a, b] = [nums[0], nums[nums.length - 1]]
  const X = (x: number) => parseNum(a.text) + ((x - nfa(a, 'x')) / (nfa(b, 'x') - nfa(a, 'x'))) * (parseNum(b.text) - parseNum(a.text))
  const span = parseNum(b.text) - parseNum(a.text)
  const ticksInSpan = ticks.filter((x) => x >= nfa(a, 'x') - 0.5 && x <= nfa(b, 'x') + 0.5).length - 1
  const letters = E.filter((e) => e.tag === 'text' && hasClass(e, 'hl'))
  const mm = new Map<string, number>()
  marks.forEach((m, i) => mm.set(letters[i]?.text ?? '?', X(pathPts(m.a.d)[0][0])))
  return { value: X(pathPts(marks[0].a.d)[0][0]), perUnit: ticksInSpan / span, marks: mm }
}

function readGridMap(svg: string) {
  const E = els(svg)
  const cols = E.filter((e) => e.tag === 'text' && hasClass(e, 'gm-col'))
  const rows = E.filter((e) => e.tag === 'text' && hasClass(e, 'gm-row'))
  const items = E.filter((e) => e.tag === 'text' && hasClass(e, 'gm-item'))
  const nearestText = (list: El[], v: number, k: 'x' | 'y') => list.reduce((b, e) => (Math.abs(nfa(e, k) - v) < Math.abs(nfa(b, k) - v) ? e : b)).text
  const pos = new Map<string, { col: number; row: number; ref: string }>()
  for (const it of items) {
    const c = nearestText(cols, nfa(it, 'x'), 'x')
    const r = nearestText(rows, nfa(it, 'y'), 'y')
    pos.set(it.text, { col: c.charCodeAt(0) - 64, row: Number(r), ref: c + r })
  }
  return pos
}

function polygonOf(svg: string): [number, number][] | null {
  const e = els(svg).find((x) => (x.tag === 'polygon' || x.tag === 'path') && hasClass(x, 'shape2d'))
  if (!e) return null
  const pts = polyPts(e).map(([x, y]) => [x, -y] as [number, number]) // y up
  return pts
}

function symmetryLines(P: [number, number][]): number {
  const cx = P.reduce((s, p) => s + p[0], 0) / P.length
  const cy = P.reduce((s, p) => s + p[1], 0) / P.length
  const scale = Math.max(...P.map((p) => Math.hypot(p[0] - cx, p[1] - cy)))
  const found: number[] = []
  for (let t = 0; t < 180; t += 0.25) {
    const r = (t * Math.PI) / 180
    const [ux, uy] = [Math.cos(r), Math.sin(r)]
    const ok = P.every(([x, y]) => {
      const dx = x - cx
      const dy = y - cy
      const d = dx * ux + dy * uy
      const rx = cx + 2 * d * ux - dx
      const ry = cy + 2 * d * uy - dy
      return P.some((q) => Math.hypot(q[0] - rx, q[1] - ry) < 0.01 * scale)
    })
    if (ok && !found.some((f) => Math.min(Math.abs(f - t), 180 - Math.abs(f - t)) < 2)) found.push(t)
  }
  return found.length
}

function sides(P: [number, number][]) {
  return P.map((p, i) => [P[(i + 1) % P.length][0] - p[0], P[(i + 1) % P.length][1] - p[1]] as [number, number])
}
const parallel = (u: [number, number], v: [number, number]) => Math.abs(u[0] * v[1] - u[1] * v[0]) < 1e-3 * Math.hypot(...u) * Math.hypot(...v)
function rightAngles(P: [number, number][]) {
  const S = sides(P)
  let n = 0
  for (let i = 0; i < S.length; i++) {
    const u = S[(i - 1 + S.length) % S.length]
    const v = S[i]
    if (Math.abs(u[0] * v[0] + u[1] * v[1]) < 1e-3 * Math.hypot(...u) * Math.hypot(...v)) n++
  }
  return n
}
function parallelPairs(P: [number, number][]) {
  const S = sides(P)
  let n = 0
  for (let i = 0; i < S.length; i++) for (let j = i + 1; j < S.length; j++) if (parallel(S[i], S[j])) n++
  return n
}
function quadName(P: [number, number][]): string {
  const L = sides(P).map((s) => Math.hypot(...s))
  const eq = (a: number, b: number) => Math.abs(a - b) < 1e-3 * Math.max(a, b)
  const allEq = L.every((x) => eq(x, L[0]))
  const ra = rightAngles(P)
  const pp = parallelPairs(P)
  if (allEq && ra === 4) return 'square'
  if (allEq) return 'rhombus'
  if (ra === 4) return 'rectangle'
  if (pp === 2) return 'parallelogram'
  if (pp === 1) return 'trapezium'
  if ((eq(L[0], L[1]) && eq(L[2], L[3])) || (eq(L[1], L[2]) && eq(L[3], L[0]))) return 'kite'
  return 'irregular quadrilateral'
}

/** Vertices, edges and (by Euler's formula) faces of the drawn solid. */
function solidVEF(svg: string) {
  const lines = els(svg).filter((e) => e.tag === 'line')
  const key = (x: number, y: number) => `${Math.round(x)},${Math.round(y)}`
  const V = new Set<string>()
  const Ed = new Set<string>()
  for (const l of lines) {
    const a = key(nfa(l, 'x1'), nfa(l, 'y1'))
    const b = key(nfa(l, 'x2'), nfa(l, 'y2'))
    V.add(a)
    V.add(b)
    Ed.add([a, b].sort().join('|'))
  }
  return { V: V.size, E: Ed.size, F: Ed.size - V.size + 2 }
}

function readAngle(svg: string): number | null {
  const E = els(svg)
  const c = E.find((e) => e.tag === 'circle' && e.a.r === '3')
  if (!c) return null
  const [cx, cy] = [nfa(c, 'cx'), nfa(c, 'cy')]
  const rm = E.find((e) => e.tag === 'path' && hasClass(e, 'rm'))
  if (rm) return 90
  const arc = E.find((e) => e.tag === 'path' && hasClass(e, 'arc'))
  if (!arc) return null
  const m = arc.a.d.match(/M(-?[\d.]+),(-?[\d.]+) A[\d.]+,[\d.]+ 0 (\d) 0 (-?[\d.]+),(-?[\d.]+)/)
  if (!m) return null
  const ang = (x: number, y: number) => (Math.atan2(-(y - cy), x - cx) * 180) / Math.PI
  let sweep = ang(Number(m[4]), Number(m[5])) - ang(Number(m[1]), Number(m[2]))
  while (sweep < 0) sweep += 360
  if (m[3] === '1' && sweep < 180) sweep = 360 - sweep
  if (Math.abs(sweep) < 0.5) sweep = 360
  return sweep
}

// ---------------------------------------------------------------- per-skill independent checks

type Check = (q: Question, lvl: Level, id: string) => string | null | undefined // message on failure

const statPick = (data: Map<string, number>, prompt: string): number | null => {
  const p = strip(prompt)
  const find = (name: string) => {
    for (const [k, v] of data) if (k.toLowerCase() === name.toLowerCase() || k.toLowerCase() + 's' === name.toLowerCase() || k.toLowerCase() === name.toLowerCase() + 's') return v
    return null
  }
  let m: RegExpMatchArray | null
  const vals = [...data.values()]
  if ((m = p.match(/answered “(.+?)” than “(.+?)”/)) || (m = p.match(/How many more (\w+?)s than (\w+?)s were/)) || (m = p.match(/more \w+ for (\S+) than for (\S+?)\?/)) || (m = p.match(/How many more students chose (.+?) than (.+?)\?/)) || (m = p.match(/How many more (\w+) than (\w+) were/)) || (m = p.match(/How many more children chose (\S+) than (\S+?)\?/))) {
    const a = find(m[1])
    const b = find(m[2])
    return a === null || b === null ? null : a - b
  }
  if (/most popular category than in the least/.test(p)) return Math.max(...vals) - Math.min(...vals)
  if (/two biggest/.test(p)) {
    const s = [...vals].sort((x, y) => y - x)
    return s[0] + s[1]
  }
  if ((m = p.match(/How many children chose (\S+) or (\S+) altogether/))) {
    const a = find(m[1])
    const b = find(m[2])
    return a === null || b === null ? null : a + b
  }
  if (/altogether|How many students are in the class/.test(p)) return vals.reduce((a, b) => a + b, 0)
  if ((m = p.match(/answered “(.+?)”/)) || (m = p.match(/How many (\w+?)s were seen/)) || (m = p.match(/How many students chose (\S+?)\?/)) || (m = p.match(/How many (\w+) (?:were eaten|were counted)/)) || (m = p.match(/How many books were borrowed on (\w+)/)) || (m = p.match(/How many cans did class (\w+)/)) || (m = p.match(/How many votes did “(.+?)”/)) || (m = p.match(/How many children (?:chose|have an?) (\S+?)\?/))) return find(m[1])
  return null
}

const CHECKS: [RegExp, Check][] = [
  [
    /^y3-nsm-clock$|^y4-nsm-ampm$/,
    (q) => {
      if (!q.diagram || q.answer.kind !== 'time') return undefined
      const t = readClock(q.diagram)
      if (!t) return 'could not read clock'
      return t.h === (q.answer.h % 12 || 12) && t.m === q.answer.m ? null : `clock shows ${t.h}:${t.m}`
    },
  ],
  [
    /^y3-gm-ruler$/,
    (q) => {
      const mm = readRuler(q.diagram!)
      const v = answerValue(q.answer)!
      return mm === null ? 'no ruler' : (q.suffix === 'mm' ? mm : mm / 10) === v ? null : `ruler measures ${mm} mm`
    },
  ],
  [
    /^y3-2d-area$|^y4-2d-area$/,
    (q) => {
      if (!q.diagram) return undefined
      const E = els(q.diagram)
      const cells = E.filter((e) => e.tag === 'rect' && hasClass(e, 'cell') && hasClass(e, 'on')).length
      if (cells) return cells === answerValue(q.answer) ? null : `${cells} shaded cells`
      const tri = E.find((e) => hasClass(e, 'areashape'))
      if (!tri) return undefined
      const P = pathPts(tri.a.d)
      const xs = [...new Set(E.filter((e) => e.tag === 'line' && hasClass(e, 'gridcell') && e.a.x1 === e.a.x2).map((e) => nfa(e, 'x1')))].sort((a, b) => a - b)
      const s = xs[1] - xs[0]
      const area = Math.abs(P.reduce((acc, p, i) => acc + p[0] * P[(i + 1) % P.length][1] - P[(i + 1) % P.length][0] * p[1], 0)) / 2 / (s * s)
      return near(area, answerValue(q.answer)!, 0.01) ? null : `triangle area ${area}`
    },
  ],
  [
    /^y4-md-area$/,
    (q, lvl) => {
      if (!q.diagram) return undefined
      const E = els(q.diagram)
      if (lvl === 1) {
        const dots = E.filter((e) => e.tag === 'circle' && hasClass(e, 'arr'))
        const cols = new Set(dots.map((d) => d.a.cx)).size
        const rows = new Set(dots.map((d) => d.a.cy)).size
        return rows * cols === answerValue(q.answer) ? null : `array ${rows} × ${cols}`
      }
      const nums = E.filter((e) => e.tag === 'text').map((e) => parseNum(e.text))
      const a = nums[nums.length - 1]
      const total = nums.slice(0, -1).reduce((s, x) => s + x, 0)
      return a * total === answerValue(q.answer) ? null : `area model ${a} × ${total}`
    },
  ],
  [
    /^y3-data-tally$/,
    (q) => {
      const t = readTally(q.diagram!)
      if (!t) return 'no tally'
      const v = statPick(t, q.prompt)
      return v === null ? `cannot interpret` : v === answerValue(q.answer) ? null : `tally gives ${v}`
    },
  ],
  [
    /^y3-data-column$|^y4-data-scale$/,
    (q) => {
      const g = readColumnGraph(q.diagram!)
      if (!g) return 'no graph'
      if (q.answer.kind === 'mc') {
        const vals = [...g.values()]
        const want = /most/.test(q.prompt) ? Math.max(...vals) : Math.min(...vals)
        const c = mcCorrect(q.answer)!
        if (/statement/.test(q.prompt)) {
          const mx = [...g].find(([, v]) => v === Math.max(...vals))![0]
          return c === `${mx} is the most popular.` ? null : `statement ${c}`
        }
        return g.get(c) === want ? null : `graph says ${c} = ${g.get(c)}`
      }
      const v = statPick(g, q.prompt)
      return v === null ? 'cannot interpret' : v === answerValue(q.answer) ? null : `graph gives ${v}`
    },
  ],
  [
    /^y4-data-picture$/,
    (q) => {
      if (!q.diagram) return undefined
      const g = readPictureGraph(q.diagram)
      if (!g) return 'no picture graph'
      const v = statPick(g.rows, q.prompt)
      return v === null ? 'cannot interpret' : v === answerValue(q.answer) ? null : `picture graph gives ${v}`
    },
  ],
  [
    /^y3-data-dotplot$/,
    (q) => {
      const d = readDotPlot(q.diagram!)
      if (!d) return 'no dot plot'
      const p = strip(q.prompt)
      const total = [...d.values()].reduce((a, b) => a + b, 0)
      let m: RegExpMatchArray | null
      let v: number | null = null
      if (/altogether/.test(p)) v = total
      else if (/most common/.test(p)) v = [...d].reduce((b, x) => (x[1] > b[1] ? x : b))[0]
      else if ((m = p.match(/(more|fewer) than (\d+)/))) v = [...d].filter(([k]) => (m![1] === 'more' ? k > Number(m![2]) : k < Number(m![2]))).reduce((s, [, c]) => s + c, 0)
      else if ((m = p.match(/(?:have|were|read) (\d+) /))) v = d.get(Number(m[1])) ?? 0
      return v === null ? 'cannot interpret' : v === answerValue(q.answer) ? null : `dot plot gives ${v}`
    },
  ],
  [
    /^y3-3d-litres$|^y4-3d-ml$/,
    (q) => {
      if (!q.diagram) return undefined
      const ml = readJug(q.diagram)
      const v = answerValue(q.answer)!
      return ml === null ? 'no jug' : (q.suffix === 'L' ? ml / 1000 : ml) === v ? null : `jug shows ${ml} mL`
    },
  ],
  [
    /^y4-nsm-grams$/,
    (q) => {
      if (!q.diagram) return undefined
      const g = readDial(q.diagram)
      return g === answerValue(q.answer) ? null : `scales show ${g} g`
    },
  ],
  [
    /^y3-3d-cubes$/,
    (q) => {
      if (!q.diagram) return undefined
      const v = readCubes(q.diagram)
      return v === answerValue(q.answer) ? null : `cubes give ${v}`
    },
  ],
  [
    /^y4-dec-tenths$|^y4-fr-beyond$|^y3-fr-numberline$|^y3-pv-numberline$/,
    (q) => {
      if (!q.diagram) return undefined
      const nl = readNumberLine(q.diagram)
      if (!nl) return undefined
      if (q.answer.kind === 'mc') {
        const c = mcCorrect(q.answer)!
        if (!nl.marks.has(c)) return undefined
        const m = strip(q.prompt).match(/(\d+)\/(\d+)/)
        return m && !near(nl.marks.get(c)!, Number(m[1]) / Number(m[2]), 1e-3) ? `letter ${c} is at ${nl.marks.get(c)}` : null
      }
      const v = answerValue(q.answer)!
      const want = /How many/.test(q.prompt) ? nl.value * nl.perUnit : nl.value
      return near(want, v, 1e-3) ? null : `number line gives ${want}`
    },
  ],
  [
    /^y3-fr-name$/,
    (q) => {
      const E = els(q.diagram!)
      const parts = E.filter((e) => hasClass(e, 'fpart'))
      const on = parts.filter((e) => hasClass(e, 'on')).length
      const want = /not/.test(q.prompt) ? (parts.length - on) / parts.length : on / parts.length
      return near(want, answerValue(q.answer)!) ? null : `diagram shows ${on}/${parts.length}`
    },
  ],
  [
    /^y4-fr-equivalent$|^y4-fr-compare$/,
    (q, lvl, id) => {
      if (!q.diagram) return undefined
      const E = els(q.diagram)
      const row = (j: number) => {
        const r = E.filter((e) => hasClass(e, 'wall-r' + j))
        return { parts: r.length, on: r.filter((e) => hasClass(e, 'on')).length }
      }
      const a = row(0)
      const b = row(1)
      if (id === 'y4-fr-equivalent') return near(a.on / a.parts, b.on / b.parts) && b.on === answerValue(q.answer) ? null : `wall rows ${a.on}/${a.parts}, ${b.on}/${b.parts}`
      const c = mcCorrect(q.answer)!
      const va = a.on / a.parts
      const vb = b.on / b.parts
      const want = near(va, vb) ? 'They are equal' : va > vb ? `${a.on}/${a.parts}` : `${b.on}/${b.parts}`
      return c === want ? null : `wall says ${want}`
    },
  ],
  [
    /^y3-gm-gridmap$|^y4-gm-compass$/,
    (q) => {
      if (!q.diagram) return undefined
      const pos = readGridMap(q.diagram)
      const p = strip(q.prompt)
      let m: RegExpMatchArray | null
      const at = (col: number, row: number) => [...pos].find(([, v]) => v.col === col && v.row === row)?.[0]
      if ((m = p.match(/What is in square ([A-H])(\d)/))) return at(m[1].charCodeAt(0) - 64, Number(m[2])) === mcCorrect(q.answer) ? null : 'wrong item'
      if ((m = p.match(/grid reference of the (\w+)/))) return q.answer.kind === 'text' && pos.get(m[1])?.ref === q.answer.accept[0] ? null : `map says ${pos.get(m[1])?.ref}`
      const vec = (s: string) => {
        let dx = 0
        let dy = 0
        for (const mm of s.matchAll(/(\d+) squares? (to the right|to the left|right|left|up|down|east|west|north|south)/g)) {
          const k = Number(mm[1])
          if (/right|east/.test(mm[2])) dx += k
          if (/left|west/.test(mm[2])) dx -= k
          if (/up|north/.test(mm[2])) dy += k
          if (/down|south/.test(mm[2])) dy -= k
        }
        return [dx, dy]
      }
      if ((m = p.match(/Start at the (\w+) \(\w+\)\. (?:Move|Walk) (.*?)\. Where/))) {
        const s = pos.get(m[1])!
        const [dx, dy] = vec(m[2])
        return at(s.col + dx, s.row + dy) === mcCorrect(q.answer) ? null : `map destination is ${at(s.col + dx, s.row + dy)}`
      }
      if ((m = p.match(/walks from the (\w+) to the (\w+): (.*?)\. Which directions/))) {
        const A = pos.get(m[1])!
        const B = pos.get(m[2])!
        const [dx, dy] = vec(m[3])
        if (B.col - A.col !== dx || B.row - A.row !== dy) return 'outward route does not match the map'
        const [bx, by] = vec(mcCorrect(q.answer)!)
        return bx === A.col - B.col && by === A.row - B.row ? null : 'return route wrong'
      }
      return 'cannot interpret'
    },
  ],
  [
    /^y3-2d-symmetry$|^y3-2d-quads$/,
    (q, lvl, id) => {
      if (!q.diagram) return undefined
      const P = polygonOf(q.diagram)
      if (!P) return 'no polygon'
      if (id === 'y3-2d-symmetry') return symmetryLines(P) === answerValue(q.answer) ? null : `shape has ${symmetryLines(P)} lines`
      if (/parallel/.test(q.prompt)) return parallelPairs(P) === answerValue(q.answer) ? null : `${parallelPairs(P)} parallel pairs`
      if (/right angles/.test(q.prompt)) return rightAngles(P) === answerValue(q.answer) ? null : `${rightAngles(P)} right angles`
      return quadName(P) === mcCorrect(q.answer) ? null : `geometry says ${quadName(P)}`
    },
  ],
  [
    /^y4-gm-perimeter$/,
    (q) => {
      if (!q.diagram) return undefined
      const E = els(q.diagram)
      const labs = E.filter((e) => e.tag === 'text').map((e) => parseNum(e.text.replace(/ (cm|m)$/, '')))
      const P = polygonOf(q.diagram) ?? (E.find((e) => e.tag === 'polygon') ? polyPts(E.find((e) => e.tag === 'polygon')!) : null)
      if (!P) return 'no shape'
      const L = sides(P).map((s) => Math.hypot(...s))
      const sum = labs.length === 2 ? 2 * (labs[0] + labs[1]) : labs.reduce((a, b) => a + b, 0)
      if (sum !== answerValue(q.answer)) return `labels add to ${sum}`
      // labels should be roughly in proportion to the drawn sides
      if (labs.length === 4) {
        const ratios = labs.map((x, i) => x / L[i])
        if (Math.max(...ratios) / Math.min(...ratios) > 1.4) return `labels out of proportion: ${labs.join(',')}`
      } else {
        const [w, h] = labs
        const drawn = L[0] / L[1]
        if (Math.abs(drawn - w / h) / (w / h) > 0.05) return `rectangle drawn ${drawn.toFixed(2)} for ${w}:${h}`
      }
      return null
    },
  ],
  [
    /^y4-3d-features$|^y3-3d-objects$/,
    (q, lvl, id) => {
      if (!q.diagram || /Cylinder|cylinder/.test(q.diagram) || els(q.diagram).some((e) => e.tag === 'path' && /A/.test(e.a.d ?? ''))) return undefined
      const { V, E, F } = solidVEF(q.diagram)
      if (id === 'y4-3d-features') {
        const what = (strip(q.prompt).match(/How many (faces|vertices|edges)/) ?? [])[1]
        if (!what) return undefined
        const got = { faces: F, vertices: V, edges: E }[what as 'faces']
        return got === answerValue(q.answer) ? null : `drawing has ${got} ${what}`
      }
      if (q.answer.kind !== 'mc') return undefined
      const c = mcCorrect(q.answer)!
      const base: Record<string, number> = { triangular: 3, rectangular: 4, square: 4, pentagonal: 5, hexagonal: 6 }
      const n = base[c.split(' ')[0]]
      if (lvl === 1) {
        if (!n) return undefined
        const ok = c.endsWith('prism') ? V === 2 * n && E === 3 * n : V === n + 1 && E === 2 * n
        return ok ? null : `drawing has V=${V}, E=${E} for ${c}`
      }
      const isPrism = E === (3 * V) / 2 && V !== 4 // a triangular pyramid also has E = 3V/2
      return c.startsWith(isPrism ? 'A prism' : 'A pyramid') ? null : `drawing is a ${isPrism ? 'prism' : 'pyramid'}`
    },
  ],
  [
    /^y4-gm-angles$/,
    (q) => {
      if (!q.diagram) return undefined
      const a = readAngle(q.diagram)
      if (a === null) return 'cannot read angle'
      const c = mcCorrect(q.answer)!
      if (/right angle/.test(c)) {
        const want = Math.abs(a - 90) < 0.5 ? 'Equal to a right angle' : a < 90 ? 'Less than a right angle' : 'Greater than a right angle'
        return c === want ? null : `angle is ${a.toFixed(1)}`
      }
      const t = Math.abs(a - 90) < 0.5 ? 'right' : Math.abs(a - 180) < 0.5 ? 'straight' : a < 90 ? 'acute' : a < 180 ? 'obtuse' : a < 359.5 ? 'reflex' : 'revolution'
      return c === t ? null : `angle is ${a.toFixed(1)} (${t})`
    },
  ],
  [
    /^y3-ch-outcomes$|^y4-ch-likely$|^y3-ch-predict$/,
    (q) => {
      if (!q.diagram || !/Spinner/.test(q.diagram)) return undefined
      const labels = els(q.diagram)
        .filter((e) => e.tag === 'text')
        .map((e) => e.text)
      const distinct = new Set(labels).size
      const p = strip(q.prompt)
      if (/How many different outcomes/.test(p)) return distinct === answerValue(q.answer) ? null : `${distinct} outcomes on spinner`
      if (/combinations/.test(p)) return 2 * distinct === answerValue(q.answer) ? null : `${2 * distinct} combinations`
      if (/Compare the chance/.test(p)) {
        const a = labels.filter((x) => x === 'A').length
        const b = labels.filter((x) => x === 'B').length
        const want = a === b ? 'They are equally likely' : a > b ? 'A is more likely' : 'B is more likely'
        return mcCorrect(q.answer) === want ? null : `spinner has A=${a}, B=${b}`
      }
      const m = p.match(/spun (\d+) times/)
      if (m) return Number(m[1]) / labels.length === answerValue(q.answer) ? null : 'prediction wrong'
      return undefined
    },
  ],
]

// ---------------------------------------------------------------- Years 1–2 (Stage 1)

const checkFor = (id: string): Check => CHECKS.find(([r]) => r.test(id))![1]
const withDiagram = (c: Check): Check => (q, l, id) => (q.diagram ? c(q, l, id) : undefined)
const mostLeast = (data: Map<string, number>, q: Question): string | null | undefined => {
  if (q.answer.kind !== 'mc') return undefined
  const p = strip(q.prompt)
  const vals = [...data.values()]
  const most = /\bmost\b/.test(p)
  if (!most && !/fewest|least/.test(p)) return undefined
  const want = most ? Math.max(...vals) : Math.min(...vals)
  const name = [...data].find(([, v]) => v === want)![0]
  return mcCorrect(q.answer) === name ? null : `diagram says ${name}`
}
const countClass = (svg: string, c: string) => els(svg).filter((e) => hasClass(e, c)).length

const CHECKS1: [RegExp, Check][] = [
  [/^y1-nsm-clock$|^y2-nsm-clock$/, withDiagram(checkFor('y3-nsm-clock'))],
  [/^y2-gm-cm$/, withDiagram(checkFor('y3-gm-ruler'))],
  [/^y1-2d-area$|^y2-2d-area$/, withDiagram(checkFor('y3-2d-area'))],
  [/^y1-3d-capacity$|^y2-3d-volume$/, withDiagram(checkFor('y3-3d-cubes'))],
  [
    /^y1-data-tally$/,
    (q) => {
      if (!q.diagram) return undefined
      const t = readTally(q.diagram)!
      if (q.answer.kind === 'mc') return mostLeast(t, q)
      const v = statPick(t, q.prompt)
      return v === null ? 'cannot interpret' : v === answerValue(q.answer) ? null : `tally gives ${v}`
    },
  ],
  [
    /^y1-data-picture$|^y2-data-graphs$/,
    (q) => {
      if (!q.diagram) return undefined
      const g = readPictureGraph(q.diagram)!.rows
      if (q.answer.kind === 'mc') return mostLeast(g, q)
      const v = statPick(g, q.prompt)
      return v === null ? 'cannot interpret' : v === answerValue(q.answer) ? null : `picture graph gives ${v}`
    },
  ],
  [
    /^y1-as-bonds$|^y1-as-strat$/,
    (q) => {
      if (!q.diagram || !/Ten frame/.test(q.diagram)) return undefined
      const a = countClass(q.diagram, 'tfa')
      const b = countClass(q.diagram, 'tfb')
      const want = b ? a + b : 10 - a
      return want === answerValue(q.answer) ? null : `ten frames give ${want}`
    },
  ],
  [
    /^y1-wn-tens$|^y2-wn-place$/,
    (q) => {
      if (!q.diagram) return undefined
      const v = 100 * countClass(q.diagram, 'b10h') + 10 * countClass(q.diagram, 'b10t') + countClass(q.diagram, 'b10o')
      return v === answerValue(q.answer) ? null : `blocks show ${v}`
    },
  ],
  [
    /^y1-wn-oddeven$|^y1-fg-share$|^y1-fg-groups$|^y2-fg-halves$/,
    (q, lvl, id) => {
      if (!q.diagram) return undefined
      const p = strip(q.prompt)
      const pairs = countClass(q.diagram, 'pair')
      if (pairs) {
        if (q.answer.kind === 'mc') return mcCorrect(q.answer) === (pairs % 2 ? 'odd' : 'even') ? null : `${pairs} counters`
        const m = p.match(/(?:Here are|half of) (\d+)/)
        if (m && Number(m[1]) !== pairs) return `prompt says ${m[1]} but ${pairs} drawn`
        return pairs / 2 === answerValue(q.answer) ? null : `half of ${pairs}`
      }
      const groups = countClass(q.diagram, 'grp')
      const dots = countClass(q.diagram, 'gdot')
      const left = countClass(q.diagram, 'left')
      if (!groups) return undefined
      const each = dots / groups
      let want: number | null = null
      if (/How many groups|full bags/.test(p)) want = groups
      else if (/in each group|quarter of/.test(p)) want = each
      else if (/left over/.test(p)) want = left
      else if (/altogether/.test(p)) want = dots
      if (want === null) return `cannot interpret (${id})`
      const total = p.match(/^(\d+) (?:apples|counters)/)
      if (total && Number(total[1]) !== dots + left) return `prompt total ${total[1]} but ${dots + left} drawn`
      return want === answerValue(q.answer) ? null : `groups give ${want}`
    },
  ],
  [
    /^y2-fg-arrays$/,
    (q) => {
      const dots = els(q.diagram!).filter((e) => e.tag === 'circle' && hasClass(e, 'arr'))
      const cols = new Set(dots.map((d) => d.a.cx)).size
      const rows = new Set(dots.map((d) => d.a.cy)).size
      const p = strip(q.prompt)
      const want = /How many rows/.test(p) ? rows : /in each row/.test(p) ? cols : /rows of how many/.test(p) ? rows : rows * cols
      return want === answerValue(q.answer) ? null : `array ${rows} × ${cols}`
    },
  ],
  [
    /^y1-gm-position$|^y2-gm-maps$/,
    (q) => {
      if (!q.diagram) return undefined
      const p = strip(q.prompt)
      const c = mcCorrect(q.answer)!
      let m: RegExpMatchArray | null
      if (/Objects in a row/.test(q.diagram)) {
        const row = els(q.diagram)
          .filter((e) => hasClass(e, 'rowlabel'))
          .map((e) => e.text)
        const at = (name: string) => row.indexOf(name)
        let want: string | undefined
        if ((m = p.match(/just to the (left|right) of the (\w+)/))) want = row[at(m[2]) + (m[1] === 'left' ? -1 : 1)]
        else if ((m = p.match(/between the (\w+) and the (\w+)/))) want = Math.abs(at(m[1]) - at(m[2])) === 2 ? row[(at(m[1]) + at(m[2])) / 2] : undefined
        else if ((m = p.match(/2 places to the right of the (\w+)/))) want = row[at(m[1]) + 2]
        return want === c ? null : `shelf says ${want}`
      }
      const pos = readGridMap(q.diagram)
      const atCell = (col: number, row: number) => [...pos].find(([, v]) => v.col === col && v.row === row)?.[0]
      const vec = (str: string) => {
        let dx = 0
        let dy = 0
        for (const mm of str.matchAll(/(\d+) squares? (right|left|up|down)/g)) {
          const k = Number(mm[1])
          if (mm[2] === 'right') dx += k
          if (mm[2] === 'left') dx -= k
          if (mm[2] === 'up') dy += k
          if (mm[2] === 'down') dy -= k
        }
        return [dx, dy]
      }
      if ((m = p.match(/Start at the (\w+)\. Go (.*?)\. Where/))) {
        const st = pos.get(m[1])!
        const [dx, dy] = vec(m[2])
        return atCell(st.col + dx, st.row + dy) === c ? null : `map destination ${atCell(st.col + dx, st.row + dy)}`
      }
      if ((m = p.match(/What is (directly above|directly below|just to the left of|just to the right of) the (\w+)/))) {
        const st = pos.get(m[2])!
        const [dx, dy] = { 'directly above': [0, 1], 'directly below': [0, -1], 'just to the left of': [-1, 0], 'just to the right of': [1, 0] }[m[1]]!
        return atCell(st.col + dx, st.row + dy) === c ? null : `map says ${atCell(st.col + dx, st.row + dy)}`
      }
      if ((m = p.match(/Which path goes from the (\w+) to the (\w+)/))) {
        const A = pos.get(m[1])!
        const B = pos.get(m[2])!
        const [dx, dy] = vec(c)
        return dx === B.col - A.col && dy === B.row - A.row ? null : 'path does not reach'
      }
      return 'cannot interpret'
    },
  ],
  [
    /^y1-gm-informal$|^y2-gm-informal$/,
    (q) => {
      if (!q.diagram) return undefined
      const E = els(q.diagram)
      const obj = E.find((e) => hasClass(e, 'measured'))!
      const units = E.filter((e) => hasClass(e, 'unit'))
      const first = pathPts(units[0].a.d ?? '')[0]?.[0] ?? nfa(units[0], 'x')
      const second = units[1] ? (pathPts(units[1].a.d ?? '')[0]?.[0] ?? nfa(units[1], 'x')) : first + 1
      const uw = second - first
      const len = nfa(obj, 'width') / uw
      if (q.answer.kind === 'mc') return mcCorrect(q.answer)!.startsWith(`${Math.floor(len + 1e-9)} `) && len % 1 > 0.1 ? null : `object is ${len.toFixed(2)} units`
      return near(len, answerValue(q.answer)!, 1e-6) ? null : `object is ${len.toFixed(2)} units`
    },
  ],
  [
    /^y1-gm-halves$|^y2-gm-eighths$/,
    (q) => {
      if (!q.diagram) return undefined
      const parts = els(q.diagram).filter((e) => hasClass(e, 'fpart'))
      const ws = parts.map((e) => nfa(e, 'width'))
      const equal = ws.every((w) => near(w, ws[0], 0.05))
      const on = parts.filter((e) => hasClass(e, 'on')).length
      const p = strip(q.prompt)
      const c = q.answer.kind === 'mc' ? mcCorrect(q.answer) : null
      if (/cut into (halves|quarters|eighths)\?/.test(p)) {
        const n = { halves: 2, quarters: 4, eighths: 8 }[p.match(/cut into (halves|quarters|eighths)/)![1] as 'halves']
        return c === (equal && parts.length === n ? 'Yes' : 'No') ? null : `${parts.length} parts, equal=${equal}`
      }
      if (/What part is shaded/.test(p)) return c === (parts.length === 2 ? 'a half' : parts.length === 4 ? 'a quarter' : '?') ? null : `${parts.length} parts`
      if (/How many eighths are shaded/.test(p)) return parts.length === 8 && on === answerValue(q.answer) ? null : `${on} of ${parts.length} shaded`
      return undefined
    },
  ],
  [
    /^y1-nsm-balance$/,
    (q) => {
      if (!q.diagram) return undefined
      const E = els(q.diagram)
      const beam = E.find((e) => hasClass(e, 'beam'))!
      const [ly, ry] = [nfa(beam, 'y1'), nfa(beam, 'y2')]
      const labels = E.filter((e) => hasClass(e, 'panlabel')).map((e) => e.text)
      const c = mcCorrect(q.answer)!
      if (near(ly, ry, 0.5)) return c === 'They have the same mass' ? null : 'balance is level'
      const heavier = ly > ry ? labels[0] : labels[1]
      const lighter = ly > ry ? labels[1] : labels[0]
      const want = /heavier/.test(q.prompt) ? `the ${heavier}` : `the ${lighter}`
      return c === want ? null : `balance says ${want}`
    },
  ],
  [
    /^y2-2d-turns$/,
    (q) => {
      if (!q.diagram) return undefined
      const pts = polyPts(els(q.diagram).find((e) => hasClass(e, 'arrow'))!)
      const [tx, ty] = [pts[0][0] - 80, pts[0][1] - 80]
      const drawn = Math.abs(tx) > Math.abs(ty) ? (tx > 0 ? 'right' : 'left') : ty < 0 ? 'up' : 'down'
      const p = strip(q.prompt)
      const start = p.match(/points (up|right|down|left)/)![1]
      if (start !== drawn) return `arrow drawn ${drawn}, prompt says ${start}`
      const k = /full turn/.test(p) ? 4 : /half turn/.test(p) ? 2 : /three quarter/.test(p) ? 3 : 1
      const dirs = ['up', 'right', 'down', 'left']
      const cw = !/anticlockwise/.test(p)
      const end = dirs[(dirs.indexOf(start) + (cw ? k : 4 * 4 - k)) % 4]
      return mcCorrect(q.answer) === end ? null : `should point ${end}`
    },
  ],
  [
    /^y1-2d-patterns$/,
    (q) => {
      if (!q.diagram) return undefined
      const seq = els(q.diagram)
        .filter((e) => hasClass(e, 'pat'))
        .map((e) => (e.a.class.match(/pat-(\w+)/) ?? [])[1])
      let period = 1
      while (period < seq.length && !seq.every((x, i) => x === seq[i % period])) period++
      if (period > seq.length / 2) return 'pattern does not repeat'
      return mcCorrect(q.answer) === seq[seq.length % period] ? null : `next is ${seq[seq.length % period]}`
    },
  ],
  [
    /^y1-2d-shapes$/,
    (q) => {
      if (!q.diagram) return undefined
      const n = polyPts(els(q.diagram).find((e) => hasClass(e, 'shape2d'))!).length
      const names: Record<number, string> = { 3: 'triangle', 4: 'quadrilateral', 5: 'pentagon', 6: 'hexagon', 8: 'octagon' }
      return q.answer.kind === 'mc' ? (mcCorrect(q.answer) === names[n] ? null : `${n} corners drawn`) : n === answerValue(q.answer) ? null : `${n} corners drawn`
    },
  ],
  [
    /^y1-3d-objects$/,
    (q) => {
      if (!q.diagram) return undefined
      const label = (q.diagram.match(/aria-label="([^"]*)"/) ?? [])[1]
      const want = { 'Model made of cubes': 'cube', Sphere: 'sphere', Cylinder: 'cylinder', 'Rectangular prism': 'rectangular prism' }[label as 'Sphere']
      if (label === 'Model made of cubes' && countClass(q.diagram, 'cube-top') !== 1) return 'not a single cube'
      return mcCorrect(q.answer) === want ? null : `drawing is ${label}`
    },
  ],
  [
    /^y2-3d-faces$/,
    (q) => {
      if (!q.diagram || !/aria-label="Prism"/.test(q.diagram)) return undefined
      const { V, E, F } = solidVEF(q.diagram)
      const what = (strip(q.prompt).match(/How many (faces|vertices|edges)/) ?? [])[1] as 'faces'
      return { faces: F, vertices: V, edges: E }[what] === answerValue(q.answer) ? null : `drawing has V=${V} E=${E} F=${F}`
    },
  ],
  [
    /^y1-nsm-months$|^y2-nsm-duration$/,
    (q) => {
      if (!q.diagram || !/caltable/.test(q.diagram)) return undefined
      const month = q.diagram.match(/<caption>(\w+)<\/caption>/)![1]
      const heads = [...q.diagram.matchAll(/<th scope="col">(\w+)<\/th>/g)].map((m) => m[1])
      const cells = [...q.diagram.matchAll(/<td[^>]*>(\d*)<\/td>/g)].map((m) => m[1])
      const days = cells.filter((x) => x).length
      const real = { January: 31, February: 28, March: 31, April: 30, May: 31, June: 30, July: 31, August: 31, September: 30, October: 31, November: 30, December: 31 }[month as 'May']
      if (days !== real) return `${month} drawn with ${days} days`
      const p = strip(q.prompt)
      let m: RegExpMatchArray | null
      if ((m = p.match(/What day of the week is \w+ (\d+)/))) {
        const idx = cells.indexOf(m[1])
        const day = heads[idx % 7]
        return mcCorrect(q.answer)!.startsWith(day) ? null : `calendar says ${day}`
      }
      if ((m = p.match(/Today is \w+ (\d+)\. The party is on \w+ (\d+)/))) {
        const d = Number(m[2]) - Number(m[1])
        const want = /weeks/.test(p) && q.suffix?.startsWith('week') ? d / 7 : d
        return want === answerValue(q.answer) ? null : `calendar gives ${want}`
      }
      return undefined
    },
  ],
  [
    /^y2-ch-likely$/,
    (q) => {
      if (!q.diagram) return undefined
      const labels = els(q.diagram)
        .filter((e) => e.tag === 'text')
        .map((e) => e.text)
      const letter = strip(q.prompt).match(/landing on (A|B)/)![1]
      const k = labels.filter((x) => x === letter).length
      return mcCorrect(q.answer) === (k > labels.length / 2 ? 'likely' : 'unlikely') ? null : `${k} of ${labels.length} parts`
    },
  ],
  [
    /^y1-wn-line$|^y2-wn-nearest$|^y2-as-two$/,
    (q, lvl, id) => {
      if (!q.diagram || !/nlmark/.test(q.diagram)) return undefined
      const nl = readNumberLine(q.diagram)!
      for (const [label, v] of nl.marks) if (/^\d+$/.test(label) && !near(Number(label), v, 0.05)) return `mark ${label} drawn at ${v.toFixed(2)}`
      if (id === 'y1-wn-line' && lvl === 1) return near(nl.value, answerValue(q.answer)!, 0.05) ? null : `A is at ${nl.value}`
      if (id === 'y1-wn-line' && lvl === 2) return mcCorrect(q.answer) === String(Math.round(nl.value / 10) * 10) ? null : 'nearest ten'
      if (id === 'y2-wn-nearest') return Math.round(nl.value / 100) * 100 === answerValue(q.answer) ? null : 'nearest hundred'
      return null
    },
  ],
]

// ---------------------------------------------------------------- wording checks

const PLURAL_SLIP = /\b1 (counters|children|blocks|paperclips|pencils|tiles|cups|days|weeks|jumps|stickers|marbles|apples|boxes|bags|circles|tens|tenths|hundredths|pieces|parts|marks|small marks|squares|litres|rows|cubes|minutes|seconds|symbols|thirds|quarters|halves|fifths|sixths|eighths|students|groups|dots|bundles|pets|goals|books|ones|tens|hundreds|thousands|kilograms|grams|right angles|lines|pairs|quarter turns)\b/
const ZERO_SLIP = /(?<![\d.$])\d+\.0+(?![\d])/ // "15.0", "25.00" (money such as $5.00 is fine)
// "a isosceles", "a equilateral" (but not the point label "A is", "A and"...)
const ARTICLE_SLIP = /(?:\ba|^A) (?!is\b|and\b|at\b|as\b|one|uni|use|usual)[aeiou]\w*/
const OTHER_SLIP = /undefined|NaN|\bnull\b|\[object|\s[,.]\s|\b0 whole/

function wording(q: Question): string | null {
  const texts = [q.prompt, ...(q.steps ?? []), q.hint ?? ''].map(strip)
  if (q.answer.kind === 'mc') texts.push(...q.answer.options.map(strip))
  for (const t of texts) {
    textChecks++
    // allow the deliberate "written 4 or 4.0" in the tenths steps
    const t2 = t.replace(/ or \d+\.0\)/g, ')')
    if (PLURAL_SLIP.test(t2)) return `plural slip: “${t2.match(PLURAL_SLIP)![0]}” in “${t.slice(0, 120)}”`
    if (ZERO_SLIP.test(t2)) return `trailing zero: “${t2.match(ZERO_SLIP)![0]}” in “${t.slice(0, 120)}”`
    if (ARTICLE_SLIP.test(t2)) return `article: “${t2.match(ARTICLE_SLIP)![0]}” in “${t.slice(0, 120)}”`
    if (OTHER_SLIP.test(t2)) return `odd text: “${t2.match(OTHER_SLIP)![0]}” in “${t.slice(0, 120)}”`
  }
  return null
}

// ---------------------------------------------------------------- run

const seen = new Set<string>()
for (const t of [...STAGE1_TOPICS, ...STAGE2_TOPICS]) {
  const stage = t.year <= 2 ? 1 : 2
  if (![1, 2, 3, 4].includes(t.year)) console.log(`FAIL ${t.id}: not a primary year`), failures++
  if (!t.outcomes.every((o) => new RegExp(`^MA${stage}-[A-Z0-9]+-0\\d$`).test(o))) console.log(`FAIL ${t.id}: outcome codes ${t.outcomes}`), failures++
  for (const s of t.skills) {
    if (seen.has(s.id)) console.log(`FAIL duplicate skill id ${s.id}`), failures++
    seen.add(s.id)
    if (!s.outcomes.every((o) => t.outcomes.includes(o))) console.log(`FAIL ${s.id}: skill outcomes not in topic`), failures++
    if (!s.id.startsWith(only)) continue
    const checks = [...CHECKS, ...CHECKS1].filter(([re]) => re.test(s.id))
    for (const lvl of [1, 2, 3] as Level[]) {
      for (let k = 0; k < N; k++) {
        setSeed(1 + k * 7919 + lvl * 104729 + s.id.length)
        const qn = s.gen(lvl)
        const w = wording(qn)
        if (w) fail(s.id, lvl, w, qn)
        // the stored answer must be accepted by the marker
        const input = qn.answer.kind === 'mc' ? String(qn.answer.correct) : answerText(qn.answer)
        if (qn.answer.kind !== 'mc' && !checkAnswer(qn.answer, input).correct) fail(s.id, lvl, `marker rejects its own answer “${input}”`, qn)
        for (const [, c] of checks) {
          const msg = c(qn, lvl, s.id)
          if (msg === undefined) continue
          diagramChecks++
          counts[s.id] = (counts[s.id] ?? 0) + 1
          if (msg) fail(s.id, lvl, msg, qn)
        }
      }
    }
  }
}

console.log(`\nDiagram/independent checks per skill:`)
console.log(
  Object.entries(counts)
    .map(([k, v]) => `${k} ${v}`)
    .join(', '),
)
console.log(`\n${diagramChecks} diagram checks, ${textChecks} text checks, ${failures} failures`)
process.exit(failures ? 1 : 0)
