// Independent checks for Year 9 Surface area and volume (New Century Maths 9, Chapter 10).
//  - Every answer is re-worked from the numbers the student sees: the words, and the labels on the diagram. Which
//    length a label gives is read from where it sits (the side of the shape it is beside), or, for solids, from the
//    drawing order of the labels. Formulas, unit tables and π are written separately here.
//  - Plane diagrams are measured: labelled lengths must be in proportion to the drawn lengths (unless the page says
//    the diagram is not to scale); sector angles are measured from the drawn arc and must match the label; the gaps on
//    a measuring scale give its precision; the front faces of prisms are drawn in proportion.
//  - Measurements keep the decimal places their precision implies (20.10 m to the nearest 0.01 m, not 20.1 m).
// Usage: npx tsx tests/ncm9-ch10.test.ts   (N per skill and level, default 400)
import { setSeed } from '../src/lib/maths/rand'
import { answerText, checkAnswer } from '../src/lib/maths/check'
import type { Level, Question } from '../src/lib/maths/types'
import { NCM10_SKILLS, NCM10_TEST } from '../src/content/y9-ncm10'
import { findTopic } from '../src/content/index'

type P = [number, number]
const N = Number(process.env.N ?? 400)
let failures = 0
let independent = 0
let measured = 0
const counts: Record<string, number> = {}
const strip = (h: string) =>
  h
    .replace(/<[^>]*>/g, ' ')
    .replace(/&ensp;|&emsp;|&nbsp;/g, ' ')
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
const fail = (id: string, msg: string, qn?: Question) => {
  failures++
  if (failures <= Number(process.env.SHOW ?? 40)) console.log(`FAIL ${id}: ${msg}` + (qn ? `\n   ${strip(qn.prompt).slice(0, 300)}\n   answer ${JSON.stringify(qn.answer).slice(0, 200)}` : ''))
}
class Bad extends Error {}
const bad = (m: string): never => {
  throw new Bad(m)
}
/** "1 600 000", "−3", "20.10" → number */
const numOf = (s: string) => {
  const x = Number(s.replace(/−/g, '-').replace(/(\d) (?=\d{3}\b)/g, '$1'))
  if (!Number.isFinite(x)) bad(`unreadable number “${s}”`)
  return x
}
const NUM = String.raw`(−?\d+(?: \d{3})*(?:\.\d+)?)`
const pick1 = (p: string, re: RegExp, what: string) => numOf((p.match(re) ?? bad(`no ${what}`))[1])
const decimalsOf = (s: string) => (s.split('.')[1] ?? '').length
const PI = Math.PI
const rnd = (x: number, dp: number) => {
  const k = 10 ** dp
  return Math.sign(x) * Math.round(Math.abs(x) * k + 1e-7) / k
}

// ---------------------------------------------------------------- reading diagrams

interface Lab { at: P; text: string; n: number }
interface Seg { a: P; b: P; dash: boolean }
const attr = (tag: string, name: string) => Number((tag.match(new RegExp(`\\b${name}="([-\\d.]+)"`)) ?? [])[1])
function labels(svg: string, cls = 'dl side'): Lab[] {
  return [...svg.matchAll(new RegExp(`<text class="${cls}" x="([-\\d.]+)" y="([-\\d.]+)"[^>]*>(.*?)</text>`, 'g'))].map((m) => {
    const text = strip(m[3])
    const mm = text.match(/^(−?\d+(?: \d{3})*(?:\.\d+)?)/)
    return { at: [Number(m[1]), Number(m[2])] as P, text, n: mm ? numOf(mm[1]) : NaN }
  })
}
function polygons(svg: string): { cls: string; pts: P[] }[] {
  return [...svg.matchAll(/<polygon class="([^"]*)" points="([^"]+)"/g)].map((m) => ({ cls: m[1], pts: m[2].trim().split(/\s+/).map((p) => p.split(',').map(Number) as P) }))
}
function segs(svg: string): Seg[] {
  const out: Seg[] = []
  for (const pg of polygons(svg)) for (let i = 0; i < pg.pts.length; i++) out.push({ a: pg.pts[i], b: pg.pts[(i + 1) % pg.pts.length], dash: false })
  for (const m of svg.matchAll(/<line [^>]*>/g)) {
    const t = m[0]
    if (/class="(grid|axis|tk)/.test(t)) continue
    out.push({ a: [attr(t, 'x1'), attr(t, 'y1')], b: [attr(t, 'x2'), attr(t, 'y2')], dash: /dash/.test(t) })
  }
  return out
}
const dist = (a: P, b: P) => Math.hypot(b[0] - a[0], b[1] - a[1])
const len = (s: Seg) => dist(s.a, s.b)
/** the side a label belongs to: its foot falls on the middle part of the side, and it is the closest such side */
function sideOf(l: Lab, ss: Seg[]): Seg | null {
  let best: Seg | null = null
  let bd = Infinity
  for (const s of ss) {
    const dx = s.b[0] - s.a[0]
    const dy = s.b[1] - s.a[1]
    const L2 = dx * dx + dy * dy
    if (L2 < 1) continue
    const t = ((l.at[0] - s.a[0]) * dx + (l.at[1] - s.a[1]) * dy) / L2
    if (t < 0.15 || t > 0.85) continue
    const d = Math.abs((l.at[0] - s.a[0]) * dy - (l.at[1] - s.a[1]) * dx) / Math.sqrt(L2)
    if (d < bd) {
      bd = d
      best = s
    }
  }
  return bd < 60 ? best : null
}
const sameSeg = (s: Seg, a: P, b: P) => (dist(s.a, a) < 0.6 && dist(s.b, b) < 0.6) || (dist(s.a, b) < 0.6 && dist(s.b, a) < 0.6)
/** the number labelled beside the side a–b, or NaN */
function labelOn(svg: string, a: P, b: P): Lab | null {
  const ss = segs(svg)
  return labels(svg).find((l) => {
    const s = sideOf(l, ss)
    return s && sameSeg(s, a, b)
  }) ?? null
}
/** labelled lengths must be in proportion to the drawn sides they are beside */
function checkScale(id: string, svg: string, qn: Question, what: string) {
  if (qn.note) return
  const ss = segs(svg)
  const r: number[] = []
  for (const l of labels(svg)) {
    if (!Number.isFinite(l.n) || /°/.test(l.text)) continue
    const s = sideOf(l, ss)
    if (!s) continue
    r.push(len(s) / l.n)
  }
  measured++
  if (r.length > 1 && Math.max(...r) / Math.min(...r) > 1.02) fail(id, `${what} not to scale (${r.map((x) => x.toFixed(2)).join(', ')})`, qn)
}

// ---------------------------------------------------------------- independent unit tables

const UNIT: Record<string, number> = {
  mm: 0.001, cm: 0.01, m: 1, km: 1000, Mm: 1e6, nm: 1e-9,
  mg: 0.001, g: 1, kg: 1000, t: 1e6, μg: 1e-6,
  mL: 0.001, L: 1, kL: 1000, ML: 1e6, GL: 1e9,
  s: 1, min: 60, h: 3600, days: 86400, ms: 0.001, μs: 1e-6,
  B: 1, kB: 1e3, MB: 1e6, GB: 1e9, TB: 1e12,
  years: 1, Ma: 1e6, millennia: 1000,
}
const SENSIBLE_RIGHT: [RegExp, string][] = [
  [/classroom door/, '2 m'],
  [/soft drink/, '375 mL'],
  [/family car/, '1500 kg'],
  [/A4 paper/, '30 cm'],
  [/an apple/, '150 g'],
  [/bathtub/, '150 L'],
  [/Sydney to Newcastle/, '160 km'],
  [/run 100 m/, '15 s'],
]

// ---------------------------------------------------------------- checking one question

function check(id: string, qn: Question) {
  const a = qn.answer
  const m = (qn.meta ?? {}) as Record<string, unknown>
  const kind = String(m.kind ?? '')
  const p = strip(qn.prompt)
  const svg = qn.diagram ?? ''
  if (a.kind === 'mc') {
    if (new Set(a.options).size !== a.options.length) fail(id, 'duplicate options', qn)
  } else if (!checkAnswer(a, answerText(a)).correct) fail(id, 'answer text not accepted', qn)
  if (/NaN|undefined|Infinity|\$\{/.test(qn.prompt + svg + qn.steps.join(' ') + qn.hint)) fail(id, 'bad text', qn)
  const dpWords = p.match(/correct to (\d) decimal place|to the nearest whole number|nearest (?:millimetre|cm³)/)
  if (a.kind === 'num' && a.dp !== undefined) {
    const said = dpWords ? (dpWords[1] !== undefined ? Number(dpWords[1]) : 0) : null
    if (said !== a.dp) fail(id, `marked to ${a.dp} dp but the words say ${said}`, qn)
  }
  if (a.kind === 'num' && a.dp === undefined && /correct to \d decimal place/.test(p) && !/Use the area correct to/.test(p)) fail(id, 'words ask for rounding but the answer is exact', qn)
  if (/\barea\b/.test(p) && !/volume/.test(p) && a.kind === 'num' && qn.suffix && !/²|^ha$/.test(qn.suffix) && !/litres|wide|edge|value of|How long|turns/.test(p)) fail(id, `area answer in ${qn.suffix}`, qn)
  if (/volume/.test(p) && a.kind === 'num' && qn.suffix && !/³/.test(qn.suffix) && !/length|edge|long|litres/.test(p)) fail(id, `volume answer in ${qn.suffix}`, qn)

  const want = (x: number, what: string, dp?: number) => {
    independent++
    counts[what] = (counts[what] ?? 0) + 1
    if (a.kind !== 'num') return fail(id, `${what}: expected a number answer`, qn)
    const shown = Number(answerText(a))
    const exp = dp === undefined ? x : rnd(x, dp)
    if (Math.abs(shown - exp) > 1e-9 * Math.max(1, Math.abs(exp))) fail(id, `${what}: expected ${exp}, marked ${shown}`, qn)
  }
  const wantDp = (x: number, what: string) => want(x, what, a.kind === 'num' ? a.dp : undefined)
  const wantMc = (test: (o: string) => boolean, what: string) => {
    independent++
    counts[what] = (counts[what] ?? 0) + 1
    if (a.kind !== 'mc') return fail(id, `${what}: expected multiple choice`, qn)
    const opts = a.options.map(strip)
    const ok = opts.map(test)
    if (!ok[a.correct] || ok.filter(Boolean).length !== 1) fail(id, `${what}: marked “${opts[a.correct]}”, matches ${ok.filter(Boolean).length}`, qn)
  }
  const L = labels(svg)
  const nums = L.filter((l) => Number.isFinite(l.n)).map((l) => l.n)

  switch (kind) {
    // ---------------- 10.01
    case 'convert': {
      const mm = p.match(new RegExp(`^Convert ${NUM} (\\S+) to (\\S+)\\.$`)) ?? bad('unreadable conversion')
      const [x, from, to] = [numOf(mm[1]), mm[2], mm[3]]
      if (!(from in UNIT) || !(to in UNIT)) return fail(id, `unknown unit ${from} or ${to}`, qn)
      return want(Number(((x * UNIT[from]) / UNIT[to]).toPrecision(12)), 'unit conversion')
    }
    case 'tiny': {
      const mm = p.match(new RegExp(`^Convert ${NUM} (\\S+)(?: \\([a-z-]+\\))? to (\\S+?)(?: \\(|\\.)`)) ?? bad('unreadable conversion')
      const [x, from, to] = [numOf(mm[1]), mm[2], mm[3]]
      if (!(from in UNIT) || !(to in UNIT)) return fail(id, `unknown unit ${from} or ${to}`, qn)
      return want(Number(((x * UNIT[from]) / UNIT[to]).toPrecision(12)), 'very small/large units')
    }
    case 'data': {
      const mins = pick1(p, /lasting (\d+) minutes/, 'minutes')
      const rate = pick1(p, /used (\d+) MB of data per minute/, 'rate')
      return want((mins * rate * UNIT.MB) / UNIT.GB, 'data use')
    }
    case 'sensible': {
      const rule = SENSIBLE_RIGHT.find(([re]) => re.test(p)) ?? bad('unknown item')
      return wantMc((o) => o === rule[1], 'sensible measurement')
    }
    // ---------------- 10.02
    case 'scale': {
      const ticks = [...svg.matchAll(/<line class="tk[^"]*scaletick" x1="([-\d.]+)"/g)].map((t) => Number(t[1]))
      const nums2 = labels(svg, 'dl small scalenum').map((l) => ({ x: l.at[0], v: l.n }))
      if (ticks.length < 5 || nums2.length < 2) return fail(id, 'scale not readable', qn)
      const gap = ticks[1] - ticks[0]
      for (let i = 1; i < ticks.length; i++) if (Math.abs(ticks[i] - ticks[i - 1] - gap) > 0.05) return fail(id, 'marks not evenly spaced', qn)
      const perPx = (nums2[1].v - nums2[0].v) / (nums2[1].x - nums2[0].x)
      const prec = Number((gap * perPx).toPrecision(6))
      measured++
      return want(/precision\?/.test(p) ? prec : prec / 2, 'scale precision')
    }
    case 'stated': {
      const mm = p.match(new RegExp(`${NUM} (cm|g|m|kg|s|L), (measured with a ruler marked in millimetres|measured to the nearest ([\\d.]+) \\w+|timed to the nearest ([\\d.]+) s)`)) ?? bad('unreadable measurement')
      const mv = numOf(mm[1])
      const prec = /millimetres/.test(mm[3]) ? 0.1 : Number(mm[4] ?? mm[5])
      if (prec < 1 && decimalsOf(mm[1]) !== decimalsOf(String(prec))) return fail(id, `measurement ${mm[1]} does not show the precision ${prec}`, qn)
      const ae = prec / 2
      if (/absolute error/.test(p)) return want(ae, 'absolute error')
      return want(Number((/lower limit/.test(p) ? mv - ae : mv + ae).toPrecision(10)), 'limits of accuracy')
    }
    case 'limits': {
      const mm = p.match(new RegExp(`between ${NUM} \\S+ and ${NUM} \\S+`)) ?? bad('unreadable limits')
      const [lo, hi] = [numOf(mm[1]), numOf(mm[2])]
      return want(Number((/precision/.test(p) ? hi - lo : (lo + hi) / 2).toPrecision(10)), 'measurement from limits')
    }
    case 'morePrecise': {
      const mm = p.match(/more precise: (.+) or (.+)\?$/) ?? bad('unreadable pair')
      const prec = (s: string) => {
        const near = s.match(/nearest (\d*) ?(g|kg|m|cm|L)\)/)
        if (near) return Number(near[1] || 1)
        const d = decimalsOf(s.split(' ')[0])
        return 10 ** -d
      }
      const [pa, pb] = [prec(mm[1]), prec(mm[2])]
      return wantMc((o) => o === (pa < pb ? mm[1] : mm[2]), 'more precise')
    }
    // ---------------- 10.03
    case 'ae': {
      const mm = p.match(new RegExp(`measurement ${NUM} (\\w+)(?: \\(to the nearest (\\d*) ?(?:cm|second|g|mm)\\))? ?\\?`)) ?? bad('unreadable measurement')
      const prec = mm[3] !== undefined ? Number(mm[3] || 1) : 10 ** -decimalsOf(mm[1])
      if (mm[3] === undefined && decimalsOf(mm[1]) === 0) return fail(id, 'whole-number measurement with no stated precision', qn)
      return want(Number((prec / 2).toPrecision(6)), 'absolute error of a measurement')
    }
    case 'pe':
    case 'compare': {
      const re = new RegExp(`${NUM} (m|km|kg)(?: long| tall)?,? to the nearest ([\\d.]+ )?(metre|kilometre|m|kg)`, 'g')
      const ms = [...p.matchAll(re)].map((x) => {
        const prec = x[3] ? Number(x[3]) : 1
        if (prec < 1 && decimalsOf(x[1]) !== decimalsOf(String(prec))) bad(`measurement ${x[1]} does not show the precision ${prec}`)
        return (prec / 2 / numOf(x[1])) * 100
      })
      if (kind === 'pe') {
        if (ms.length !== 1) return fail(id, 'expected one measurement', qn)
        return wantDp(ms[0], 'percentage error')
      }
      if (ms.length !== 2) return fail(id, 'expected two measurements', qn)
      const names = [...p.matchAll(/(?:^|\. )A ([a-z -]+?) (?:is|spans|covers|has a mass of) /g)].map((x) => x[1])
      return wantMc((o) => o === `the measurement of the ${names[ms[0] < ms[1] ? 0 : 1]}`, 'more accurate')
    }
    // ---------------- 10.04
    case 'lshape':
    case 'farm': {
      const pg = polygons(svg)[0]?.pts ?? bad('no shape')
      if (pg.length !== 6) return fail(id, 'not an L-shape', qn)
      const get = (i: number, j: number) => labelOn(svg, pg[i], pg[j])?.n ?? bad(`side ${i}–${j} unlabelled`)
      const [W, H, top, right] = [get(0, 1), get(5, 0), get(4, 5), get(1, 2)]
      const area = W * H - (W - top) * (H - right)
      checkScale(id, svg, qn, 'L-shape')
      if (kind === 'farm') return want(/hectares/.test(p) ? area / 1e4 : area / 1e6, 'farm area')
      return want(/area/.test(p) ? area : 2 * (W + H), 'L-shape')
    }
    case 'slant': {
      const pg = polygons(svg)[0]?.pts ?? bad('no shape')
      const get = (i: number, j: number) => labelOn(svg, pg[i], pg[j])?.n ?? bad(`side ${i}–${j} unlabelled`)
      const [x, H2, H1] = [get(0, 1), get(1, 2), get(3, 0)]
      const c = Math.hypot(x, H2 - H1)
      if (Math.abs(c - Math.round(c)) > 1e-9) return fail(id, 'sloping side is not a whole number', qn)
      checkScale(id, svg, qn, 'composite shape')
      // the sloping side is drawn at its true length too
      const ratio = dist(pg[0], pg[1]) / x
      measured++
      if (Math.abs(dist(pg[2], pg[3]) / c / ratio - 1) > 0.02) fail(id, 'sloping side drawn at the wrong length', qn)
      return want(/area/.test(p) ? x * H1 + (x * (H2 - H1)) / 2 : x + H2 + c + H1, 'rectangle and triangle')
    }
    case 'frame': {
      const [outer, inner] = polygons(svg)
      if (!inner || inner.cls !== 'sh sh-bg') return fail(id, 'no hole', qn)
      const get = (pg: P[], i: number, j: number) => labelOn(svg, pg[i], pg[j])?.n ?? bad(`side ${i}–${j} unlabelled`)
      const [A, B, a2, b2] = [get(outer.pts, 0, 1), get(outer.pts, 3, 0), get(inner.pts, 2, 3), get(inner.pts, 1, 2)]
      // inner labels sit inside the hole
      for (const l of L) {
        const s = sideOf(l, segs(svg))
        if (s && inner.pts.some((q) => dist(q, s.a) < 0.6)) {
          const xs = inner.pts.map((q) => q[0])
          const ys = inner.pts.map((q) => q[1])
          if (l.at[0] < Math.min(...xs) || l.at[0] > Math.max(...xs) || l.at[1] < Math.min(...ys) || l.at[1] > Math.max(...ys)) fail(id, 'a hole label is outside the hole', qn)
        }
      }
      checkScale(id, svg, qn, 'frame')
      return want(A * B - a2 * b2, 'shaded frame')
    }
    case 'ha': {
      const ha = pick1(p, /area of ([\d.]+) hectares/, 'area')
      const l = pick1(p, /length of (\d+) m/, 'length')
      return want(Number(((ha * 10000) / l).toPrecision(10)), 'width from hectares')
    }
    // ---------------- 10.05
    case 'quad':
    case 'quadMissing': {
      const shape = (p.match(/this (parallelogram|trapezium|rhombus|kite)/) ?? bad('which shape?'))[1]
      const pg = polygons(svg)[0]?.pts ?? bad('no shape')
      const dashes = segs(svg).filter((s) => s.dash)
      const onDash = (l: Lab) => {
        let best: Seg | null = null
        let bd = Infinity
        for (const s of dashes) {
          const dx = s.b[0] - s.a[0]
          const dy = s.b[1] - s.a[1]
          const d = Math.abs((l.at[0] - s.a[0]) * dy - (l.at[1] - s.a[1]) * dx) / Math.hypot(dx, dy)
          if (d < bd) [bd, best] = [d, s]
        }
        return best
      }
      const val = (l: Lab | null) => (l ? (Number.isFinite(l.n) ? l.n : null) : bad('missing label'))
      let area: number | null = kind === 'quadMissing' ? pick1(p, new RegExp(`area of this \\w+ is ${NUM}`), 'area') : null
      let parts: (number | null)[]
      if (shape === 'parallelogram' || shape === 'trapezium') {
        const h = val(L.find((l) => sideOf(l, segs(svg))?.dash) ?? null)
        const base = val(labelOn(svg, pg[0], pg[1]))
        if (shape === 'parallelogram') {
          const sl = labelOn(svg, pg[1], pg[2])
          if (sl && Number.isFinite(sl.n)) {
            const drawn = dist(pg[1], pg[2]) / (dist(pg[0], pg[1]) / (base ?? 1))
            if (Math.abs(drawn / sl.n - 1) > 0.02) fail(id, 'sloping side label does not match the drawing', qn)
          }
          parts = [base, h]
        } else parts = [val(labelOn(svg, pg[3], pg[2])), base, h]
      } else {
        const byDash = new Map<Seg, number | null>()
        for (const l of L) {
          const s = onDash(l)
          if (s) byDash.set(s, Number.isFinite(l.n) ? l.n : null)
        }
        if (byDash.size !== 2) return fail(id, 'diagonals not both labelled', qn)
        parts = [...byDash.values()]
        // the diagonals are drawn in proportion to their labels
        const ds = [...byDash.entries()].filter(([, v]) => v !== null)
        if (ds.length === 2) {
          measured++
          if (Math.abs(len(ds[0][0]) / len(ds[1][0]) / (ds[0][1]! / ds[1][1]!) - 1) > 0.02) fail(id, 'diagonals not in proportion', qn)
        }
      }
      const f = (v: number[]) => (shape === 'parallelogram' ? v[0] * v[1] : shape === 'trapezium' ? ((v[0] + v[1]) * v[2]) / 2 : (v[0] * v[1]) / 2)
      if (shape === 'parallelogram' || shape === 'trapezium') checkScale(id, svg, qn, shape)
      if (kind === 'quad') {
        if (parts.some((x) => x === null)) return fail(id, 'unlabelled length', qn)
        return want(f(parts as number[]), `area of a ${shape}`)
      }
      // missing length: the one unknown in the formula
      const k = parts.findIndex((x) => x === null)
      if (k < 0 || parts.filter((x) => x === null).length !== 1) return fail(id, 'expected exactly one unknown', qn)
      const known = parts.map((x) => x ?? 1)
      const unit = f(known)
      area = area!
      return want(area / unit, `missing length of a ${shape}`)
    }
    // ---------------- 10.06
    case 'circle': {
      const c = svg.match(/<circle class="sh" cx="([-\d.]+)" cy="([-\d.]+)" r="([-\d.]+)"/) ?? bad('no circle')
      const R = Number(c[3])
      const ln = svg.match(/<line class="ln hlstroke" x1="([-\d.]+)" y1="([-\d.]+)" x2="([-\d.]+)" y2="([-\d.]+)"/) ?? bad('no radius line')
      const drawn = Math.hypot(Number(ln[3]) - Number(ln[1]), Number(ln[4]) - Number(ln[2]))
      const isD = Math.abs(drawn - 2 * R) < 1
      if (!isD && Math.abs(drawn - R) > 1) return fail(id, 'line is neither a radius nor a diameter', qn)
      const r = isD ? nums[0] / 2 : nums[0]
      measured++
      return wantDp(/circumference/.test(p) ? 2 * PI * r : PI * r * r, 'circle')
    }
    case 'sector': {
      const pm = svg.match(/<path class="sh sector-sh" d="M([-\d.]+),([-\d.]+) L([-\d.]+),([-\d.]+) A([-\d.]+),([-\d.]+) 0 (\d) 0 ([-\d.]+),([-\d.]+) Z"/) ?? bad('no sector')
      const [cx, cy, x1, y1, R, , large, x2, y2] = pm.slice(1).map(Number)
      if (Math.abs(Math.hypot(x1 - cx, y1 - cy) - R) > 0.6 || Math.abs(Math.hypot(x2 - cx, y2 - cy) - R) > 0.6) return fail(id, 'sector ends are not on the arc', qn)
      let ang = (Math.acos(((x1 - cx) * (x2 - cx) + (y1 - cy) * (y2 - cy)) / (R * R)) * 180) / PI
      if (large) ang = 360 - ang
      const lab = labels(svg, 'dl ang')[0]
      const stated = lab ? numOf(lab.text.replace('°', '')) : /quadrant/.test(p) ? 90 : /semicircle/.test(p) ? 180 : bad('no angle')
      measured++
      if (Math.abs(ang - stated) > 0.5) return fail(id, `sector drawn at ${ang.toFixed(1)}°, labelled ${stated}°`, qn)
      const r = nums[0]
      const arc = (stated / 360) * 2 * PI * r
      return wantDp(/arc length/.test(p) ? arc : /perimeter/.test(p) ? arc + 2 * r : (stated / 360) * PI * r * r, 'sector')
    }
    case 'quadComp':
    case 'semiComp': {
      const [bottom, left] = L.slice().sort((x, y) => y.at[1] - x.at[1])
      const pm = svg.match(/<path class="sh" d="M([-\d.]+),[-\d.]+ L([-\d.]+),[-\d.]+ A([-\d.]+),/) ?? bad('no shape')
      const arcR = Number(pm[3])
      // quadrant shape: M is one end of the bottom, L the other; semicircle shape: M to L is the rectangle's top
      const width = Number(pm[2]) - Number(pm[1])
      measured++
      if (kind === 'quadComp') {
        const [total, r] = [bottom.n, left.n]
        if (Math.abs(arcR / r / (width / total) - 1) > 0.02) fail(id, 'quadrant not to scale', qn)
        const a2 = total - r
        return wantDp(/area/.test(p) ? a2 * r + (PI * r * r) / 4 : total + a2 + r + (PI * r) / 2, 'rectangle and quadrant')
      }
      const [w, h] = [bottom.n, left.n]
      if (Math.abs(arcR / (h / 2) / (width / w) - 1) > 0.02) fail(id, 'semicircle end not to scale', qn)
      return wantDp(/area/.test(p) ? w * h + (PI * (h / 2) ** 2) / 2 : 2 * w + h + (PI * h) / 2, 'rectangle and semicircle')
    }
    case 'annulus': {
      const [R, r] = [Math.max(...nums), Math.min(...nums)]
      const cs = [...svg.matchAll(/<circle class="sh[^"]*" cx="[-\d.]+" cy="[-\d.]+" r="([-\d.]+)"/g)].map((x) => Number(x[1]))
      measured++
      if (Math.abs(Math.min(...cs) / Math.max(...cs) - r / R) > 0.01) fail(id, 'ring not to scale', qn)
      return wantDp(PI * (R * R - r * r), 'annulus')
    }
    case 'wheel': {
      const d = pick1(p, /diameter of (\d+) cm/, 'diameter')
      const km = pick1(p, /at least (\d+) km/, 'distance')
      return want(Math.ceil((km * 1000 * 100) / (PI * d)), 'wheel turns')
    }
    case 'pond': {
      const d = pick1(p, /diameter of (\d+) m/, 'diameter')
      const w = pick1(p, /path ([\d.]+) m wide/, 'width')
      return wantDp(PI * ((d / 2 + w) ** 2 - (d / 2) ** 2), 'path around a pond')
    }
    // ---------------- 10.07
    case 'cube': {
      const s = nums[0]
      return want(Number((6 * s * s).toPrecision(10)), 'cube')
    }
    case 'box':
    case 'openBox':
    case 'vbox': {
      const [l, w, h] = nums
      const front = polygons(svg)[0].pts
      measured++
      if (Math.abs(dist(front[0], front[1]) / dist(front[1], front[2]) / (l / h) - 1) > 0.02) fail(id, 'front face not in proportion', qn)
      if (kind === 'vbox') return want(l * w * h, 'volume of a box')
      return want(kind === 'box' ? 2 * (l * w + l * h + w * h) : l * w + 2 * l * h + 2 * w * h, kind === 'box' ? 'closed box' : 'open box')
    }
    case 'triPrism':
    case 'vtri': {
      const [b, h, l, c] = nums
      const hyp = Math.hypot(b, h)
      const front = polygons(svg)[0].pts
      measured++
      if (Math.abs(dist(front[0], front[1]) / dist(front[0], front[2]) / (b / h) - 1) > 0.02) fail(id, 'triangle not in proportion', qn)
      if (kind === 'vtri') return want((b * h * l) / 2, 'volume of a triangular prism')
      if (c !== undefined && Math.abs(c - hyp) > 1e-9) return fail(id, 'labelled hypotenuse is wrong', qn)
      if (Math.abs(hyp - Math.round(hyp)) > 1e-9) return fail(id, 'hypotenuse is not a whole number', qn)
      return want(b * h + (b + h + hyp) * l, 'triangular prism')
    }
    case 'trap':
    case 'vtrap': {
      const [b, a2, h, ...rest] = nums
      const l = rest[rest.length - 1]
      const s = rest.length === 2 ? rest[0] : undefined
      const front = polygons(svg).find((x) => x.cls === 'sh')!.pts
      measured++
      const k = dist(front[0], front[1]) / b
      if (Math.abs(dist(front[3], front[2]) / k - a2) > 0.02 * a2 || Math.abs(Math.abs(front[0][1] - front[3][1]) / k - h) > 0.02 * h) fail(id, 'trapezium not in proportion', qn)
      if (kind === 'vtrap') return want(((a2 + b) * h * l) / 2, 'volume of a trapezoidal prism')
      const slant = Math.hypot((b - a2) / 2, h)
      if (s === undefined || Math.abs(s - slant) > 1e-9) return fail(id, `sloping side should be ${slant}`, qn)
      return want((a2 + b) * h + (a2 + b + 2 * slant) * l, 'trapezoidal prism')
    }
    case 'tent': {
      const [b, h, l] = nums
      const s = Math.hypot(b / 2, h)
      if (Math.abs(s * 10 - Math.round(s * 10)) > 1e-9) return fail(id, 'sloping edge not a tidy length', qn)
      return want(Number((b * h + 2 * s * l + b * l).toPrecision(10)), 'tent')
    }
    case 'cubeFromSA': {
      const sa = pick1(p, /surface area of (\d+)/, 'surface area')
      return wantDp(Math.sqrt(sa / 6), 'cube edge from surface area')
    }
    // ---------------- 10.08
    case 'cylClosed':
    case 'cylcurved':
    case 'cylopenOne':
    case 'cylopenBoth':
    case 'vcyl': {
      const ln = svg.match(/<line class="ln hlstroke" x1="([-\d.]+)" y1="[-\d.]+" x2="([-\d.]+)"/) ?? bad('no radius line')
      const ell = svg.match(/<ellipse class="sh sh2" cx="[-\d.]+" cy="[-\d.]+" rx="([-\d.]+)"/) ?? bad('no top')
      const isD = Math.abs(Math.abs(Number(ln[2]) - Number(ln[1])) - 2 * Number(ell[1])) < 1
      const r = isD ? nums[0] / 2 : nums[0]
      const h = nums[1]
      // drawn height ÷ drawn width must match h ÷ 2r, or the page must say it is not to scale
      const path = svg.match(/<path class="sh" d="M([-\d.]+),([-\d.]+) L[-\d.]+,([-\d.]+)/) ?? bad('no side')
      const drawnRatio = (Number(path[3]) - Number(path[2])) / (2 * Number(ell[1]))
      measured++
      if (Math.abs(drawnRatio / (h / (2 * r)) - 1) > 0.02 && !qn.note) fail(id, 'cylinder not to scale and not marked', qn)
      if (kind === 'vcyl') return wantDp(PI * r * r * h, 'volume of a cylinder')
      const curved = 2 * PI * r * h
      const sa = /open at both ends|curved surface area/.test(p) ? curved : /open at one end/.test(p) ? curved + PI * r * r : curved + 2 * PI * r * r
      if (kind === 'cylClosed' && !/closed cylinder/.test(p)) return fail(id, 'closed?', qn)
      return wantDp(sa, 'cylinder surface area')
    }
    case 'halfCyl': {
      const [r, l] = nums
      const sa = PI * r * r + PI * r * l + (/closed half-cylinder/.test(p) ? 2 * r * l : 0)
      if (!/closed half-cylinder|no floor/.test(p)) return fail(id, 'closed or not?', qn)
      return wantDp(sa, 'half-cylinder')
    }
    case 'pool': {
      if (/kilolitres/.test(p)) {
        const L2 = pick1(p, /is (\d+) m long/, 'length')
        const W = pick1(p, /and (\d+) m wide/, 'width')
        const s = pick1(p, /water is ([\d.]+) m deep at the shallow end/, 'shallow')
        const d = pick1(p, /and ([\d.]+) m deep at the deep end/, 'deep')
        return want(Number((((s + d) / 2) * L2 * W).toPrecision(10)), 'sloping pool')
      }
      const depth = pick1(p, /pool is ([\d.]+) m deep/, 'depth')
      const d = pick1(p, /deep and (\d+) m across/, 'diameter')
      const area = PI * (d / 2) ** 2 + PI * d * depth
      if (/How many whole litres/.test(p)) {
        const cover = pick1(p, /covers (\d+) m²/, 'coverage')
        return want(Math.ceil(rnd(area, 1) / cover - 1e-12), 'paint for a pool')
      }
      return wantDp(area, 'painting a pool')
    }
    // ---------------- 10.09
    case 'tank': {
      const [l, w, h] = [pick1(p, /is (\d+) cm long/, 'l'), pick1(p, /(\d+) cm wide/, 'w'), pick1(p, /(\d+) cm high/, 'h')]
      const gap = pick1(p, /to (\d+) cm below the top/, 'gap')
      return want((l * w * (h - gap)) / 1000, 'fish tank')
    }
    case 'toM3': {
      const [l, w, h] = [pick1(p, /is (\d+) cm long/, 'l'), pick1(p, /(\d+) cm wide/, 'w'), pick1(p, /(\d+) cm high/, 'h')]
      return want(Number(((l / 100) * (w / 100) * (h / 100)).toPrecision(10)), 'cm³ to m³')
    }
    case 'missing': {
      const b = pick1(p, /base (\d+) cm/, 'base')
      const h = pick1(p, /height (\d+) cm/, 'height')
      const v = pick1(p, new RegExp(`volume is ${NUM} cm³`), 'volume')
      return want(v / ((b * h) / 2), 'length of a prism')
    }
    case 'cubeRoot': {
      const v = pick1(p, new RegExp(`volume of ${NUM} mm³`), 'volume')
      return wantDp(v ** (1 / 3), 'cube edge from volume')
    }
    case 'cake': {
      const t = pick1(p, /each (\d+) cm high/, 'height')
      const rs = (p.match(/radii (\d+) cm, (\d+) cm and (\d+) cm/) ?? bad('radii')).slice(1).map(Number)
      return wantDp(rs.reduce((s, r) => s + PI * r * r * t, 0), 'tiered cake')
    }
    case 'pipe': {
      const l = pick1(p, /pipe (\d+) cm long/, 'length')
      const din = pick1(p, /inner diameter of ([\d.]+) cm/, 'inner')
      const dout = pick1(p, /outer diameter of ([\d.]+) cm/, 'outer')
      return wantDp(PI * l * ((dout / 2) ** 2 - (din / 2) ** 2), 'pipe')
    }
    // ---------------- Power plus
    case 'rhombusP': {
      const [d1, d2] = (p.match(/diagonals of length (\d+) cm and (\d+) cm/) ?? bad('diagonals')).slice(1).map(Number)
      return want(4 * Math.hypot(d1 / 2, d2 / 2), 'rhombus perimeter')
    }
    case 'faces': {
      const [x, y, z] = (p.match(/areas (\d+) cm², (\d+) cm² and (\d+) cm²/) ?? bad('areas')).slice(1).map(Number)
      return want(Math.sqrt(x * y * z), 'volume from faces')
    }
    case 'rain': {
      const side = pick1(p, /roof (\d+) m by/, 'roof')
      const d = pick1(p, /diameter of (\d+) m/, 'tank')
      const rain = pick1(p, /If (\d+) mm of rain/, 'rain')
      return wantDp(((side * side * rain) / (PI * (d / 2) ** 2)), 'rain in a tank')
    }
    default:
      fail(id, `no check for ${kind}`, qn)
  }
}

for (const s of NCM10_SKILLS)
  for (const lvl of [1, 2, 3] as Level[])
    for (let i = 0; i < N; i++) {
      setSeed(i * 7919 + lvl * 31 + s.id.length)
      const id = `${s.id} L${lvl}`
      try {
        check(id, s.gen(lvl))
      } catch (e) {
        fail(id, (e instanceof Bad ? '' : 'threw ') + (e as Error).message)
      }
    }
for (let i = 0; i < 100; i++) {
  setSeed(5000 + i)
  NCM10_TEST.forEach((it, k) => {
    try {
      check(`test Q${k + 1}`, it.gen!(it.level))
    } catch (e) {
      fail(`test Q${k + 1}`, (e as Error).message)
    }
  })
}
const topic = findTopic('y9-measurement')
if (!topic || topic.test?.length !== 16) fail('topic', 'topic missing or test is not 16 questions')
for (const it of NCM10_TEST) if (!NCM10_SKILLS.some((s) => s.id === it.skill && s.tag !== 'extension')) fail('topic', `test skill ${it.skill} missing or extension`)
if (topic && topic.skills.length !== NCM10_SKILLS.length) fail('topic', 'topic does not use the Chapter 10 skills')
console.log(`${failures === 0 ? 'PASS' : 'FAIL'}: ${failures} failures, ${independent} answers re-worked independently, ${measured} diagrams measured`)
console.log(
  Object.entries(counts)
    .map(([k, v]) => `${k} ${v}`)
    .join(' · '),
)
process.exit(failures ? 1 : 0)
