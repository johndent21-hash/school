// Independent checks for Year 7 Area and volume (New Century Maths 7, Chapter 8).
// Every answer is re-worked here from the numbers the question was made from, using this file's own unit
// tables and formulas (not the content file's), and every number used is checked to be on the page.
// Every flat drawing is measured: each length written on it must sit beside a side (or dashed height) of
// matching length, so the drawing is to scale and the labels are in the right places. Cube models are counted.
// Knowledge questions (which unit, is it a prism) are checked against an answer key written separately here.
// Usage: npx tsx tests/ncm7-ch8.test.ts   (N per skill and level, default 400)
import { setSeed } from '../src/lib/maths/rand'
import { answerText, checkAnswer } from '../src/lib/maths/check'
import type { Answer, Level, Question } from '../src/lib/maths/types'
import { NCM8_SKILLS, NCM8_TEST } from '../src/content/y7-ncm8'
import { findTopic } from '../src/content/index'
import { ALL_GAME_SETS } from '../src/content/games/index'

const N = Number(process.env.N ?? 400)
let failures = 0
let reworked = 0
let measured = 0
const counts: Record<string, number> = {}
const plain = (h: string) => h.replace(/<[^>]*>/g, '').replace(/&nbsp;|\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
const fail = (id: string, msg: string, qn?: Question) => {
  failures++
  if (failures <= 40) console.log(`FAIL ${id}: ${msg}` + (qn ? `\n   ${plain(qn.prompt).slice(0, 200)}\n   answer ${JSON.stringify(qn.answer).slice(0, 160)}  meta ${JSON.stringify(qn.meta).slice(0, 200)}` : ''))
}
const near = (x: number, y: number, rel = 1e-9) => Math.abs(x - y) <= rel * Math.max(1, Math.abs(x), Math.abs(y))
const r6 = (x: number) => Math.round(x * 1e6) / 1e6

// ------------------------------------------------------------------ this file's own units

/** each unit's size in a base unit of its kind (mm, mg, mL, s, mm², mm³) */
const SIZE: Record<string, [string, number]> = {
  mm: ['len', 1], cm: ['len', 10], m: ['len', 1000], km: ['len', 1e6],
  mg: ['mass', 1], g: ['mass', 1e3], kg: ['mass', 1e6], t: ['mass', 1e9],
  mL: ['cap', 1], L: ['cap', 1e3], kL: ['cap', 1e6], ML: ['cap', 1e9],
  s: ['time', 1], min: ['time', 60], h: ['time', 3600], days: ['time', 86400],
  'mm²': ['area', 1], 'cm²': ['area', 100], 'm²': ['area', 1e6], ha: ['area', 1e10], 'km²': ['area', 1e12],
  'mm³': ['vol', 1], 'cm³': ['vol', 1e3], 'm³': ['vol', 1e9],
}
function convert(v: number, from: string, to: string): number {
  const [k1, s1] = SIZE[from]
  const [k2, s2] = SIZE[to]
  if (k1 !== k2) throw new Error(`cannot convert ${from} to ${to}`)
  return r6((v * s1) / s2)
}
/** volume and capacity: 1 cm³ holds 1 mL */
const asMl = (v: number, u: string) => (SIZE[u][0] === 'vol' ? (v * SIZE[u][1]) / 1000 : v * SIZE[u][1])

// ------------------------------------------------------------------ answer keys for knowledge questions

const KEY: Record<string, string> = {
  // which unit
  'the top of a pin head': 'mm²', 'a page of an exercise book': 'cm²', 'a bathroom tile': 'cm²', 'a classroom floor': 'm²', 'a house block': 'm²',
  'a wheat farm': 'ha', 'a vineyard': 'ha', 'the state of New South Wales': 'km²', 'a large lake': 'km²',
  'a grain of sugar': 'mm³', 'a pea': 'mm³', 'a dice': 'cm³', 'a matchbox': 'cm³', 'a textbook': 'cm³', 'a classroom': 'm³', 'a shipping container': 'm³', 'a swimming pool': 'm³',
  'a teaspoon': 'mL', 'a can of drink': 'mL', 'a bottle of medicine': 'mL', 'a bucket': 'L', 'a car’s petrol tank': 'L', 'a bathtub': 'L',
  'a backyard swimming pool': 'kL', 'a rainwater tank': 'kL', 'a city’s dam': 'ML', 'an Olympic swimming pool': 'ML',
}
/** real sizes [low, high] in base units, so exactly one option is sensible */
const REAL: Record<string, [number, number]> = {
  'the height of a Year 7 student': [1200, 1900], 'the length of a new pencil': [140, 200], 'the mass of an apple': [80e3, 300e3], 'the mass of a newborn baby': [2e6, 5e6],
  'the capacity of a drinking glass': [150, 400], 'the capacity of a kitchen sink': [10e3, 40e3], 'the length of a soccer field': [90e3, 120e3], 'the time to walk 1 kilometre': [8 * 60, 20 * 60],
  'a postage stamp': [3e2, 1.5e3], 'a tennis court': [2e8, 7e8], 'the screen of a mobile phone': [5e3, 1.5e4], 'a basketball court': [3.5e8, 5e8], 'a large cattle station': [1e14, 1e16],
  'a school oval': [1e10, 4e10], 'a grain of rice, seen from above': [3, 12],
  'a grain of rice': [10, 40], 'a house brick': [1.5e6, 3e6], 'a bedroom': [20e9, 60e9], 'a matchbox': [10e3, 60e3], 'a shipping container': [20e9, 80e9],
}
const PRISM: Record<string, boolean> = { 'a cube': true, 'a rectangular prism (a box)': true, 'a triangular prism': true, 'a hexagonal prism': true, 'a square pyramid': false, 'a cone': false, 'a sphere (a ball)': false, 'a cylinder': false }
const SHAPE_SIDES: Record<string, number> = { triangle: 3, 'right triangle': 3, rectangle: 4, trapezium: 4, pentagon: 5, hexagon: 6 }
const PRISM_NAME: Record<string, string> = { triangle: 'Triangular prism', 'right triangle': 'Triangular prism', rectangle: 'Rectangular prism', trapezium: 'Trapezoidal prism', pentagon: 'Pentagonal prism', hexagon: 'Hexagonal prism' }
const BASE_NAME: Record<string, string> = { triangle: 'Triangle', 'right triangle': 'Triangle', rectangle: 'Rectangle', trapezium: 'Trapezium', pentagon: 'Pentagon', hexagon: 'Hexagon' }
const PREFIX: Record<string, string> = { 'kilo-': '1000 times', 'centi-': 'one-hundredth', 'milli-': 'one-thousandth', 'mega-': '1 000 000 times' }

// ------------------------------------------------------------------ reading drawings

type Pt = [number, number]
type Seg = [Pt, Pt]
const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1])
function distToSeg(p: Pt, s: Seg) {
  const d: Pt = [s[1][0] - s[0][0], s[1][1] - s[0][1]]
  const k = Math.max(0, Math.min(1, ((p[0] - s[0][0]) * d[0] + (p[1] - s[0][1]) * d[1]) / (d[0] * d[0] + d[1] * d[1])))
  return dist(p, [s[0][0] + d[0] * k, s[0][1] + d[1] * k])
}
const polygons = (svg: string) => [...svg.matchAll(/<polygon class="([^"]*)" points="([^"]*)"/g)].map((m) => ({ cls: m[1], pts: m[2].split(' ').map((p) => p.split(',').map(Number) as Pt) }))
const dashed = (svg: string): Seg[] =>
  [...svg.matchAll(/<line class="ln dash" x1="([\d.-]+)" y1="([\d.-]+)" x2="([\d.-]+)" y2="([\d.-]+)"/g)].map((m) => [
    [+m[1], +m[2]],
    [+m[3], +m[4]],
  ])
const texts = (svg: string) => [...svg.matchAll(/<text class="([^"]*)" x="([\d.-]+)" y="([\d.-]+)"[^>]*>([^<]*)<\/text>/g)].map((m) => ({ cls: m[1], p: [+m[2], +m[3]] as Pt, s: m[4].replace(/&nbsp;|\u00a0/g, ' ') }))
const shoelace = (pts: Pt[]) => Math.abs(pts.reduce((s, p, i) => s + p[0] * pts[(i + 1) % pts.length][1] - pts[(i + 1) % pts.length][0] * p[1], 0)) / 2

/**
 * Every length label ("12 cm", "4.5 m") must sit beside a polygon side or a dashed line, and the label's
 * value divided by that side's drawn length must be the same for every label: the drawing is to scale.
 * Returns the number of labels matched.
 */
function labelsToScale(id: string, qn: Question, opts: { skip?: boolean } = {}): number {
  const svg = qn.diagram ?? ''
  const segs: Seg[] = [...polygons(svg).flatMap((pg) => pg.pts.map((p, i) => [p, pg.pts[(i + 1) % pg.pts.length]] as Seg)), ...dashed(svg)]
  const scales: { label: string; ratio: number }[] = []
  for (const t of texts(svg)) {
    const m = t.s.match(/^([\d.]+) (mm|cm|m|km)$/)
    if (!m) continue
    const valueMm = Number(m[1]) * SIZE[m[2]][1]
    // the side a label belongs to: the label sits out from the side's middle, square to it
    const score = (sg: Seg) => {
      const len = dist(sg[0], sg[1])
      const mid: Pt = [(sg[0][0] + sg[1][0]) / 2, (sg[0][1] + sg[1][1]) / 2]
      const along = Math.abs(((t.p[0] - mid[0]) * (sg[1][0] - sg[0][0]) + (t.p[1] - mid[1]) * (sg[1][1] - sg[0][1])) / len)
      return distToSeg(t.p, sg) + 1.5 * along + (along > 0.2 * len + 8 ? 1000 : 0)
    }
    const nearest = segs.slice().sort((a, b) => score(a) - score(b))[0]
    if (!nearest) return 0
    // labels are written beside the middle of their side
    const mid: Pt = [(nearest[0][0] + nearest[1][0]) / 2, (nearest[0][1] + nearest[1][1]) / 2]
    const len = dist(nearest[0], nearest[1])
    if (distToSeg(t.p, nearest) > 40) fail(id, `label ${t.s} is far from any side`, qn)
    if (dist(t.p, mid) > len / 2 + 40) fail(id, `label ${t.s} is not beside the middle of its side`, qn)
    scales.push({ label: t.s, ratio: valueMm / len })
  }
  if (!opts.skip && scales.length > 1) {
    measured++
    const r0 = scales[0].ratio
    for (const s of scales) if (Math.abs(s.ratio - r0) > 0.025 * r0) fail(id, `not to scale: ${scales.map((x) => `${x.label} on ${(x.ratio === 0 ? 0 : 1 / x.ratio).toFixed(3)} px/mm`).join(', ')}`, qn)
  }
  return scales.length
}

/** the numbers in the prompt and on the drawing */
const onPage = (qn: Question) => plain(qn.prompt) + ' | ' + texts(qn.diagram ?? '').map((t) => t.s).join(' | ')
const fmt = (x: number) => {
  const s = String(r6(x))
  const [i, d] = s.split('.')
  return (i.length >= 5 ? i.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : i) + (d ? '.' + d : '')
}

// ------------------------------------------------------------------ every skill, every level

for (const skill of NCM8_SKILLS) {
  for (const lvl of [1, 2, 3] as Level[]) {
    for (let i = 0; i < N; i++) {
      setSeed(59 + i * 7919 + lvl * 104729 + skill.id.length * 131)
      const qn = skill.gen(lvl)
      const id = `${skill.id} L${lvl}`
      const m = (qn.meta ?? {}) as Record<string, any>
      const t = m.t as string
      counts[`${skill.id}:${t}`] = (counts[`${skill.id}:${t}`] ?? 0) + 1
      const ans = qn.answer.kind === 'num' ? qn.answer.value : null
      const mc = qn.answer.kind === 'mc' ? (qn.answer as Extract<Answer, { kind: 'mc' }>) : null
      const chosen = mc ? plain(mc.options[mc.correct]) : ''
      const page = onPage(qn)
      const has = (...xs: (string | number)[]) => xs.forEach((x) => !page.includes(typeof x === 'number' ? fmt(x) : x) && fail(id, `"${typeof x === 'number' ? fmt(x) : x}" is not on the page`, qn))
      if (!qn.meta) fail(id, 'no meta', qn)

      // ---- marking and choices
      if (qn.answer.kind !== 'mc' && !checkAnswer(qn.answer, answerText(qn.answer)).correct) fail(id, 'answer not accepted', qn)
      if (mc) {
        const opts = mc.options.map(plain)
        if (new Set(opts).size !== opts.length) fail(id, 'two choices are the same', qn)
        if (opts.length < 3 && opts.join() !== 'Yes,No') fail(id, `only ${opts.length} choices`, qn)
      }
      if (ans !== null && !(ans > 0)) fail(id, `answer ${ans} is not positive`, qn)

      // ---- wording
      const words = plain((qn.prompt + ' ' + qn.steps.join(' ') + ' ' + qn.hint).replace(/<i>[^<]*<\/i>/g, 'X'))
      if (/NaN|undefined|null|Infinity/.test(words)) fail(id, 'bad text', qn)
      if (/\b1 (cubes|squares|tiles|layers|turns|glasses|bottles|cups|stacks|sides)\b/.test(words)) fail(id, 'plural slip: ' + words.match(/\b1 \w+/)?.[0], qn)
      if (/\ba [aeiou]/.test(words.replace(/a (unit|one)/g, ''))) fail(id, 'article slip: ' + words.match(/\ba [aeiou]\w*/)?.[0], qn)
      if (/\d\.\d{6,}/.test(words)) fail(id, 'long decimal shown', qn)
      if (!qn.hint || !qn.steps.length) fail(id, 'missing hint or steps', qn)
      // a squared unit for areas, a cubed unit for volumes, a plain unit for lengths
      const suffix = qn.suffix ?? ''
      if (/Find the area|area of grass|shaded area/i.test(qn.prompt) && suffix && !/[²]|ha/.test(suffix)) fail(id, `area answer in ${suffix}`, qn)
      if (/Find the (volume|perimeter)/i.test(qn.prompt) && /perimeter/.test(qn.prompt) && /[²³]/.test(suffix)) fail(id, `perimeter answer in ${suffix}`, qn)
      if (/Find (the|its) volume|volume of concrete|volume of soil/i.test(qn.prompt) && suffix && !/³/.test(suffix)) fail(id, `volume answer in ${suffix}`, qn)
      // drawings of solids say they are not to scale; flat shapes are to scale and need no note
      // (models built from cubes are drawn true to shape on an isometric grid, so they need no note)
      if (/prism|^Cube$/i.test(qn.diagram?.match(/aria-label="([^"]*)"/)?.[1] ?? '') && !qn.note) fail(id, 'a drawing of a solid needs the "not drawn to scale" note', qn)

      // ---- labels on drawings are clear of each other
      const labs = texts(qn.diagram ?? '').filter((x) => !/clocknum/.test(x.cls))
      // each label's box: about 8.4 px a character wide (15 px bold) and 15 px high
      const half = (x: { s: string }) => x.s.length * 4.2
      for (let a = 0; a < labs.length; a++)
        for (let b = a + 1; b < labs.length; b++)
          if (Math.abs(labs[a].p[0] - labs[b].p[0]) < half(labs[a]) + half(labs[b]) && Math.abs(labs[a].p[1] - labs[b].p[1]) < 15) fail(id, `labels ${labs[a].s} and ${labs[b].s} overlap`, qn)

      // ---- re-work the answer
      let expect: number | string | null = null
      const flat = () => labelsToScale(id, qn)
      switch (t) {
        // 8.01, 8.13
        case 'convert':
          has(m.v)
          expect = convert(m.v, m.from, m.to)
          break
        case 'extreme': {
          const opts = mc!.options.map((o) => {
            const [v, u] = plain(o).split(' ')
            return convert(Number(v.replace(/\s/g, '')), u, 'mm')
          })
          const want = m.longest ? Math.max(...opts) : Math.min(...opts)
          if (opts.filter((x) => x === want).length !== 1) fail(id, 'two choices are equally long', qn)
          expect = plain(mc!.options[opts.indexOf(want)])
          break
        }
        case 'sensible': {
          const range = REAL[m.what]
          const inRange = mc!.options.filter((o) => {
            const [v, u] = plain(o).split(' ')
            const base = Number(v) * SIZE[u][1]
            return base >= range[0] && base <= range[1]
          })
          if (inRange.length !== 1) fail(id, `${inRange.length} options are sensible`, qn)
          expect = plain(inRange[0] ?? '')
          break
        }
        case 'containers':
          has(m.litres, m.cup)
          expect = (m.litres * 1000) / m.cup
          if (!Number.isInteger(expect)) fail(id, 'containers do not divide exactly', qn)
          break
        case 'prefix':
          expect = PREFIX[m.p]
          break
        case 'timeFact':
          expect = /minutes are in one day/.test(m.ask) ? 24 * 60 : /seconds are in one hour/.test(m.ask) ? 60 * 60 : 7 * 24
          break
        // 8.02 perimeter
        case 'square':
          flat()
          has(m.s)
          expect = 4 * m.s
          break
        case 'rect':
          flat()
          has(m.l, m.w)
          expect = r6(2 * m.l + 2 * m.w)
          break
        case 'tri':
          flat()
          has(...m.sides)
          expect = m.sides.reduce((a: number, b: number) => a + b, 0)
          break
        case 'regular': {
          // the polygon really has n equal sides
          const pg = polygons(qn.diagram!)[0]
          measured++
          if (pg.pts.length !== m.n) fail(id, `drawn with ${pg.pts.length} sides`, qn)
          const lens = pg.pts.map((p, k) => dist(p, pg.pts[(k + 1) % pg.pts.length]))
          if (Math.max(...lens) - Math.min(...lens) > 0.5) fail(id, 'sides are not equal', qn)
          has(m.s)
          expect = m.n * m.s
          break
        }
        case 'lshape': {
          flat()
          const pg = polygons(qn.diagram!)[0]
          measured++
          if (pg.pts.length !== 6) fail(id, 'not an L-shape', qn)
          // the perimeter of the drawn polygon, in drawing units, matches 2(W + H) at the drawing's scale
          const lens = pg.pts.map((p, k) => dist(p, pg.pts[(k + 1) % pg.pts.length]))
          const scale = lens[0] / m.W
          if (!near(lens.reduce((a, b) => a + b, 0) / scale, 2 * (m.W + m.H), 0.01)) fail(id, 'drawn perimeter does not match', qn)
          expect = 2 * (m.W + m.H)
          break
        }
        case 'house':
          if (skill.id === 'y7-ms-perimeter') {
            flat()
            has(m.w, m.h)
            expect = m.w + 2 * m.h + 2 * m.w
          } else {
            flat()
            has(m.w, m.h, m.tri)
            expect = m.w * m.h + (m.w * m.tri) / 2
          }
          break
        case 'backSquare':
          has(m.P)
          expect = m.P / 4
          break
        case 'backRect':
          has(m.P, m.known)
          expect = m.P / 2 - m.known
          break
        case 'dims': {
          has(m.P)
          const ok = mc!.options.filter((o) => {
            const [a, , , b] = plain(o).split(' ')
            return Number(a) + Number(b) === m.P / 2
          })
          if (ok.length !== 1) fail(id, `${ok.length} choices have the right perimeter`, qn)
          expect = plain(ok[0] ?? '')
          break
        }
        case 'ushape': {
          flat()
          const pg = polygons(qn.diagram!)[0]
          const lens = pg.pts.map((p, k) => dist(p, pg.pts[(k + 1) % pg.pts.length]))
          measured++
          expect = r6((lens.reduce((a, b) => a + b, 0) / lens[0]) * m.W)
          if (!near(expect as number, 2 * (m.W + m.H) + 2 * m.d, 1e-3)) fail(id, 'drawn perimeter does not match', qn)
          expect = 2 * (m.W + m.H) + 2 * m.d
          break
        }
        // 8.03 circles
        case 'part':
          expect = m.part[0].toUpperCase() + m.part.slice(1)
          break
        case 'diameter':
          has(m.r)
          expect = r6(2 * m.r)
          break
        case 'radius':
          has(m.d)
          expect = m.d / 2
          break
        case 'estimate':
          expect = 3 * m.d
          break
        case 'exact':
          expect = `${fmt(m.d)}π ${plain(chosen).split(' ')[1]}`
          break
        case 'calc':
          expect = Math.round(Math.PI * m.d * 10 ** m.dp) / 10 ** m.dp
          if (qn.answer.kind === 'num') expect = Math.abs(qn.answer.value - Math.PI * m.d) < 1e-9 ? qn.answer.value : -1
          if (!qn.calc) fail(id, 'needs a calculator', qn)
          break
        case 'turns':
          has(m.d, m.km)
          expect = Math.floor((m.km * 1e5) / (Math.PI * m.d))
          break
        case 'backC':
          has(m.C)
          expect = Math.round(m.C / Math.PI)
          break
        case 'semi': {
          // the semicircle drawing shows its diameter
          const svg = qn.diagram!
          if (!/A[\d.]+,[\d.]+ 0 0 1/.test(svg)) fail(id, 'no semicircle drawn', qn)
          has(m.d)
          expect = (Math.PI * m.d) / 2 + m.d
          break
        }
        // 8.04, 8.10 units
        case 'areaConv':
        case 'volConv':
          has(m.v)
          expect = convert(m.v, m.from, m.to)
          break
        case 'areaUnit':
        case 'volUnit':
        case 'capUnit':
          has(m.what)
          expect = KEY[m.what]
          if (!expect) fail(id, `no key for ${m.what}`, qn)
          break
        case 'aboutArea':
        case 'aboutVol': {
          const range = REAL[m.what]
          const inRange = mc!.options.filter((o) => {
            const [v, u] = plain(o).split(' ')
            const base = Number(v) * SIZE[u][1]
            return base >= range[0] && base <= range[1]
          })
          if (inRange.length !== 1) fail(id, `${inRange.length} options are sensible`, qn)
          expect = plain(inRange[0] ?? '')
          break
        }
        case 'orderArea': {
          const items = chosen.split(', ').map((x) => {
            const mm = x.match(/^([\d .]+) (\S+)$/)!
            return convert(Number(mm[1].replace(/\s/g, '')), mm[2], 'm²')
          })
          if (!items.every((x, k) => k === 0 || x > items[k - 1])) fail(id, 'not in ascending order', qn)
          if (items.map((x) => r6(x)).sort().join() !== m.m2.map((x: number) => r6(x)).sort().join()) fail(id, 'the areas do not match', qn)
          expect = chosen
          break
        }
        // 8.05 to 8.07 areas
        case 'rectArea': {
          const n = flat()
          if (qn.diagram && n === 0) fail(id, 'no lengths on the drawing', qn)
          expect = r6(m.l * m.w)
          break
        }
        case 'squareSide':
          has(m.A)
          expect = Math.sqrt(m.A)
          break
        case 'missingSide':
          has(m.A, m.w)
          expect = r6(m.A / m.w)
          break
        case 'cost':
          has(m.l, m.w, m.price)
          expect = m.l * m.w * m.price
          break
        case 'tiles':
          has(m.l, m.w, m.tile)
          expect = r6((m.l * 100 * m.w * 100) / (m.tile * m.tile))
          if (!Number.isInteger(expect)) fail(id, 'tiles do not fit exactly', qn)
          break
        case 'enlarge':
          expect = String(m.k)
          has((m.s * m.k) ** 2, m.s * m.s)
          break
        case 'triArea': {
          flat()
          const pg = polygons(qn.diagram!)[0]
          measured++
          // the triangle's drawn area, at the drawing's scale, is the answer
          const base = texts(qn.diagram!).map((x) => x.s).find((s) => s.startsWith(fmt(m.b) + ' '))
          if (!base) fail(id, 'base not labelled', qn)
          const longest = Math.max(...pg.pts.map((p, k) => dist(p, pg.pts[(k + 1) % pg.pts.length])))
          void longest
          expect = r6((m.b * m.h) / 2)
          const drawnRatio = shoelace(pg.pts)
          const scaleSides = pg.pts.map((p, k) => dist(p, pg.pts[(k + 1) % pg.pts.length]))
          // find the drawn base: the side whose length / m.b matches the scale of the height
          const k = scaleSides.findIndex((L) => {
            const s = L / m.b
            return Math.abs(drawnRatio / (s * s) - (m.b * m.h) / 2) < 0.02 * ((m.b * m.h) / 2)
          })
          if (k < 0) fail(id, 'the drawn triangle does not have this base and height', qn)
          break
        }
        case 'triBack':
          has(m.A, m.known)
          expect = (2 * m.A) / m.known
          break
        case 'triSame':
          has(m.A)
          expect = Math.sqrt(2 * m.A)
          break
        case 'kite': {
          flat()
          const pg = polygons(qn.diagram!)[0]
          const AC = dashed(qn.diagram!).sort((a, b) => dist(b[0], b[1]) - dist(a[0], a[1]))[0]
          const s = dist(AC[0], AC[1]) / m.d
          measured++
          expect = (m.d * (m.h1 + m.h2)) / 2
          if (!near(shoelace(pg.pts) / (s * s), expect, 0.01)) fail(id, `drawn area ${shoelace(pg.pts) / (s * s)}`, qn)
          break
        }
        case 'paraArea': {
          flat()
          const pg = polygons(qn.diagram!)[0]
          const sides = pg.pts.map((p, k) => dist(p, pg.pts[(k + 1) % pg.pts.length]))
          const s = sides[0] / m.b
          measured++
          expect = r6(m.b * m.h)
          if (!near(shoelace(pg.pts) / (s * s), expect, 0.01)) fail(id, `drawn area ${shoelace(pg.pts) / (s * s)}`, qn)
          break
        }
        case 'paraBack':
          has(m.A, m.known)
          expect = r6(m.A / m.known)
          break
        case 'paraSquare':
          has(m.s, m.b)
          expect = (m.s * m.s) / m.b
          break
        // 8.08 composite
        case 'twoRects': {
          const pg = polygons(qn.diagram!)[0]
          const s = dist(pg.pts[0], pg.pts[1]) / (m.w1 + m.w2)
          measured++
          expect = m.w1 * m.h1 + m.w2 * m.h2
          if (!near(shoelace(pg.pts) / (s * s), expect, 0.01)) fail(id, `drawn area ${shoelace(pg.pts) / (s * s)}`, qn)
          has(m.w1, m.h1, m.w2, m.h2)
          break
        }
        case 'lshapeArea':
        case 'expr': {
          flat()
          const pg = polygons(qn.diagram!)[0]
          const s = dist(pg.pts[0], pg.pts[1]) / m.W
          measured++
          const A = m.W * m.H - m.w * m.h
          if (!near(shoelace(pg.pts) / (s * s), A, 0.01)) fail(id, `drawn area ${shoelace(pg.pts) / (s * s)}`, qn)
          if (t === 'expr') {
            // evaluate every expression offered
            const vals = mc!.options.map((o) => Function(`return ${plain(o).replace(/×/g, '*').replace(/−/g, '-')}`)() as number)
            if (vals.filter((v) => v === A).length !== 1) fail(id, `${vals.filter((v) => v === A).length} expressions give the area`, qn)
            expect = plain(mc!.options[vals.indexOf(A)])
          } else expect = A
          break
        }
        case 'hole':
        case 'path': {
          flat()
          const [outer, inner] = polygons(qn.diagram!)
          const s = dist(outer.pts[0], outer.pts[1]) / (t === 'hole' ? m.W : m.a + 2 * m.w)
          measured++
          expect = t === 'hole' ? m.W * m.H - m.w * m.h : (m.a + 2 * m.w) * (m.b + 2 * m.w) - m.a * m.b
          if (!near((shoelace(outer.pts) - shoelace(inner.pts)) / (s * s), expect as number, 0.01)) fail(id, 'drawn shaded area does not match', qn)
          if (t === 'path') has(m.a, m.b, m.w)
          break
        }
        case 'lawn':
          has(m.L, m.W, m.s, m.n)
          expect = r6(m.L * m.W - m.n * m.s * m.s)
          break
        case 'cross': {
          const pg = polygons(qn.diagram!)[0]
          const lens = pg.pts.map((p, k) => dist(p, pg.pts[(k + 1) % pg.pts.length]))
          measured++
          if (pg.pts.length !== 12 || Math.max(...lens) - Math.min(...lens) > 0.5 || !near(shoelace(pg.pts) / lens[0] ** 2, 5, 0.01)) fail(id, 'not a cross of 5 squares', qn)
          has(m.s, m.tile)
          expect = (5 * (m.s * 100) ** 2) / m.tile ** 2
          break
        }
        // 8.09 prisms
        case 'isPrism':
          expect = PRISM[m.solid] ? 'Yes' : 'No'
          break
        case 'namePrism':
        case 'crossShape': {
          const shaded = polygons(qn.diagram!).find((p) => p.cls.includes('areashape'))
          measured++
          if (!shaded || shaded.pts.length !== SHAPE_SIDES[m.shape]) fail(id, `shaded base has ${shaded?.pts.length} corners`, qn)
          expect = t === 'namePrism' ? PRISM_NAME[m.shape] : BASE_NAME[m.shape]
          break
        }
        case 'sideFaces':
          expect = 'Rectangles'
          break
        case 'prismView':
          expect = m.top ? BASE_NAME[m.shape] : 'Rectangle'
          break
        case 'cubeView': {
          const svg = qn.diagram!
          const tops = (svg.match(/class="cube cube-top"/g) ?? []).length
          const fronts = (svg.match(/class="cube cube-l"/g) ?? []).length
          const hs = m.hs as number[][]
          const cols = Math.max(...hs.map((r) => r.length))
          const frontView = Array.from({ length: cols }, (_, c) => Math.max(...hs.map((r) => r[c] ?? 0))).reduce((a, b) => a + b, 0)
          measured++
          if (tops !== hs.flat().filter((x) => x > 0).length || fronts !== frontView) fail(id, `drawing shows ${tops} tops, ${fronts} fronts`, qn)
          expect = m.view === 'top' ? tops : m.view === 'front' ? fronts : hs.flat().reduce((a, b) => a + b, 0)
          break
        }
        // 8.10 to 8.13 volume
        case 'cubeCount': {
          const svg = qn.diagram!
          const c = (cls: string) => (svg.match(new RegExp(`class="cube ${cls}"`, 'g')) ?? []).length
          measured++
          if (c('cube-top') !== m.l * m.w || c('cube-l') !== m.l * m.h || c('cube-r') !== m.w * m.h) fail(id, 'cube model does not match', qn)
          expect = m.l * m.w * m.h
          break
        }
        case 'box':
          has(m.w)
          expect = r6(m.l * m.w * m.h)
          break
        case 'missingV':
          has(m.V, m.l, m.w)
          expect = r6(m.V / (m.l * m.w))
          break
        case 'cubeSide':
          has(m.V)
          expect = Math.round(Math.cbrt(m.V))
          if (expect ** 3 !== m.V) fail(id, 'not a perfect cube', qn)
          break
        case 'hollow':
          has(m.L, m.W, m.H, m.a, m.b)
          expect = m.L * m.W * m.H - m.a * m.b * m.H
          if (m.a >= m.W || m.b >= m.L) fail(id, 'the hole is bigger than the block', qn)
          break
        case 'Ah':
          has(m.A, m.h)
          expect = r6(m.A * m.h)
          break
        case 'triPrism':
          has(m.b, m.ht, m.L)
          expect = (m.b * m.ht * m.L) / 2
          break
        case 'lPrism': {
          flat()
          has(m.L)
          expect = (m.W * m.H - m.w * m.h) * m.L
          break
        }
        case 'prismBack':
          has(m.V, m.b, m.ht)
          expect = m.V / ((m.b * m.ht) / 2)
          break
        case 'openBox': {
          flat()
          has(m.s, m.c)
          expect = (m.s - 2 * m.c) ** 2 * m.c
          break
        }
        case 'holds':
          has(m.v)
          expect = m.to === 'mL' ? asMl(m.v, m.from) : m.to === 'L' ? asMl(m.v, m.from) / 1000 : (m.v * 1000 * 1000) / 1000
          break
        case 'boxCap':
          has(m.l, m.w, m.h)
          expect = asMl(m.l * m.w * m.h, 'cm³') / 1000
          break
        case 'pool':
          has(m.l, m.w, m.d)
          expect = r6(asMl(m.l * m.w * m.d, 'm³') / 1000)
          break
        case 'leak':
          has(m.mL, m.every)
          expect = ((24 * 60 * 60) / m.every) * m.mL / 1000
          break
        case 'depth':
          has(m.L, m.a, m.b)
          expect = (m.L * 1000) / (m.a * m.b)
          break
        case 'party':
          has(m.people, m.each, m.bottle)
          expect = Math.ceil((m.people * m.each) / 1000 / m.bottle - 1e-9)
          break
        // Power plus
        case 'stairs': {
          const pg = polygons(qn.diagram!)[0]
          const s = dist(pg.pts[1], pg.pts[2]) / m.s
          measured++
          const lens = pg.pts.map((p, k) => dist(p, pg.pts[(k + 1) % pg.pts.length]))
          expect = m.askArea ? shoelace(pg.pts) / (s * s) : lens.reduce((a, b) => a + b, 0) / s
          // read off the drawing, so round away the drawing's 2-decimal-place coordinates
          expect = Math.round(expect as number)
          break
        }
        case 'maxArea': {
          has(m.P)
          let best = 0
          for (let l = 1; l < m.P / 2; l++) best = Math.max(best, l * (m.P / 2 - l))
          expect = best
          break
        }
        case 'sameNumber': {
          const ok = mc!.options.filter((o) => {
            const [a, , , b] = plain(o).split(' ')
            return 2 * (Number(a) + Number(b)) === Number(a) * Number(b)
          })
          if (ok.length !== 1) fail(id, `${ok.length} choices work`, qn)
          expect = plain(ok[0] ?? '')
          break
        }
        case 'paint':
          has(m.l, m.w, m.h, m.cover)
          expect = Math.ceil((2 * (2 * (m.l + m.w) * m.h - 2 * 0.8)) / m.cover - 1e-9)
          break
        case 'poolCost':
          has(m.s, m.depthMm)
          expect = Math.round(5 * m.s * m.s * (m.depthMm / 1000) * m.price * 100) / 100
          break
        default:
          fail(id, `no check written for question type "${t}"`, qn)
      }
      if (expect !== null) {
        reworked++
        if (typeof expect === 'number') {
          if (ans === null) fail(id, `expected a number answer ${expect}`, qn)
          else if (qn.answer.kind === 'num' && qn.answer.dp !== undefined) {
            if (Math.round(ans * 10 ** qn.answer.dp) !== Math.round((expect as number) * 10 ** qn.answer.dp)) fail(id, `${t}: answer ${ans}, re-worked ${expect}`, qn)
          } else if (!near(ans, expect, 1e-9)) fail(id, `${t}: answer ${ans}, re-worked ${expect}`, qn)
        } else if (chosen !== expect) fail(id, `${t}: chose "${chosen}", re-worked "${expect}"`, qn)
      }
    }
  }
}

// ------------------------------------------------------------------ the topic and its test

const topic = findTopic('y7-area-volume')!
const order = NCM8_SKILLS.map((s) => s.id)
if (NCM8_TEST.length !== 18) fail('test', `has ${NCM8_TEST.length} questions, not 18`)
NCM8_TEST.forEach((item, k) => {
  if (!topic.skills.some((s) => s.id === item.skill)) fail('test', `unknown skill ${item.skill}`)
  if (k > 0 && order.indexOf(item.skill) < order.indexOf(NCM8_TEST[k - 1].skill)) fail('test', `question ${k + 1} is out of exercise order`)
  for (let i = 0; i < 200; i++) {
    setSeed(5 + i * 31 + k)
    const qn = item.gen!(item.level)
    if (qn.answer.kind !== 'mc' && !checkAnswer(qn.answer, answerText(qn.answer)).correct) fail('test', `Q${k + 1} answer not accepted`, qn)
  }
})
for (const id of order.slice(0, 13)) if (!NCM8_TEST.some((x) => x.skill === id)) fail('test', `no question on ${id}`)
if (topic.ref !== 'NCM 7 Chapter 8' || topic.test !== NCM8_TEST) fail('topic', 'not wired to Chapter 8')
if (topic.skills.filter((s) => s.ref?.startsWith('NCM 7 Ex')).map((s) => s.ref).join() !== Array.from({ length: 13 }, (_, k) => `NCM 7 Ex 8.${String(k + 1).padStart(2, '0')}`).join())
  fail('topic', 'exercises are not 8.01 to 8.13 in order')
for (const s of NCM8_SKILLS) if (!s.levels?.[1] || !s.levels[2] || !s.levels[3] || !s.learn.intro || s.learn.keyPoints.length < 3) fail('topic', `${s.id} is missing lesson text`)
// each class-game set for Chapter 8 links to the lesson for its exercise
for (const set of ALL_GAME_SETS.filter((g) => g.id.startsWith('ncm7-8.'))) {
  const skillFor = NCM8_SKILLS.find((s) => s.ref === `NCM 7 Ex ${set.exercise}`)
  if (!skillFor || set.lessons?.join() !== skillFor.id) fail('games', `${set.id} links to ${set.lessons}`)
}

console.log(Object.entries(counts).map(([k, v]) => `${k} ${v}`).join('\n'))
console.log(`${reworked} answers re-worked independently, ${measured} drawings measured`)
if (failures) {
  console.log(`${failures} failures`)
  process.exit(1)
}
console.log('All Chapter 8 checks passed')
