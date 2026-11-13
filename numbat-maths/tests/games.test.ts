// Independent checks for the class games. Chapter 8 of New Century Maths 7 is re-worked in this file; other
// chapters have their own re-working in tests/game-checks/ (the shape, builder and luck checks here cover all of them).
// Every kind of question is re-worked here from scratch, the way a second teacher would:
//  - the answer is recalculated from the numbers the question was made from, with this file's own
//    formulas and its own table of unit sizes (not the content file's);
//  - the numbers are read back off the page (prompt and diagram labels), so the question shown is the
//    question that was answered;
//  - diagrams are measured: rectangles, triangles, parallelograms and composite shapes must be drawn in
//    the proportions of their labels, and cube models must show exactly the cubes the answer counts;
//  - fixed-knowledge questions (units, sizes, definitions, names) are checked against the answer key below;
//  - exactly one of the four options is right: no two options are equal in value, even in different units.
// It also checks how games are built (no repeats, same seed = same game) and that the luck rules are fair.
// Usage: npx tsx tests/games.test.ts        (N questions of each kind, default 400)
import { setSeed } from '../src/lib/maths/rand'
import { ALL_GAME_SETS, GAME_BOOKS, findGame } from '../src/content/games/index'
import { buildChapterGame, buildGame, gameCheck, GAME_LENGTHS } from '../src/lib/game/build'
import { dig, ECHIDNA, LEAP_MAX, LEAP_MIN, places, RAID } from '../src/lib/game/luck'
import type { GameQuestion, GameSet } from '../src/lib/game/types'
import { rework as reworkCh1 } from './game-checks/ncm7-ch1'
import { rework as reworkCh2 } from './game-checks/ncm7-ch2'
import { rework as reworkCh3 } from './game-checks/ncm7-ch3'
import { rework as reworkCh4 } from './game-checks/ncm7-ch4'
import { rework as reworkCh5 } from './game-checks/ncm7-ch5'
import { rework as reworkCh6 } from './game-checks/ncm7-ch6'
import { rework as reworkCh7 } from './game-checks/ncm7-ch7'
import { rework as reworkCh9 } from './game-checks/ncm7-ch9'
import { rework as reworkCh10 } from './game-checks/ncm7-ch10'
import { rework as reworkCh11 } from './game-checks/ncm7-ch11'
import { rework as reworkCh12 } from './game-checks/ncm7-ch12'
import { rework as rework8Ch1 } from './game-checks/ncm8-ch1'
import { rework as rework8Ch2 } from './game-checks/ncm8-ch2'
import { rework as rework8Ch3 } from './game-checks/ncm8-ch3'
import { rework as rework8Ch4 } from './game-checks/ncm8-ch4'
import { rework as rework8Ch5 } from './game-checks/ncm8-ch5'
import { rework as rework8Ch6 } from './game-checks/ncm8-ch6'
import { rework as rework8Ch7 } from './game-checks/ncm8-ch7'
import { rework as rework8Ch8 } from './game-checks/ncm8-ch8'
import { rework as rework8Ch9 } from './game-checks/ncm8-ch9'
import { rework as rework8Ch10 } from './game-checks/ncm8-ch10'
import { rework as rework8Ch11 } from './game-checks/ncm8-ch11'
import { rework as rework8Ch12 } from './game-checks/ncm8-ch12'

const N = Number(process.env.N ?? 400)
let failures = 0
let checked = 0
let reworked = 0
let measured = 0
const failKinds = new Map<string, number>()
const fail = (where: string, msg: string, q?: GameQuestion) => {
  failures++
  const kind = `${where}: ${msg.replace(/\d[\d ,.]*/g, '#')}`
  failKinds.set(kind, (failKinds.get(kind) ?? 0) + 1)
  if ((failKinds.get(kind) ?? 0) <= 2) console.log(`FAIL ${where}: ${msg}` + (q ? `\n   ${plain(q.prompt).slice(0, 160)}\n   options: ${q.options.map(plain).join(' | ')}  (right: ${plain(q.options[q.correct])})` : ''))
}

// ---------------------------------------------------------------- reading the page

const plain = (h: string) =>
  h
    .replace(/<span class="frac"[^>]*><span class="fn">(.*?)<\/span><span class="fd">(.*?)<\/span><\/span>/g, '($1/$2)')
    .replace(/<sup>(.*?)<\/sup>/g, '^$1')
    .replace(/<span class="rec">(.)<\/span>/g, '$1\u0307')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#9633;/g, '□')
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/** "13 000 cm²" → { v: 13000, unit: "cm²" }; "8π cm" → { v: 8, unit: "cm", pi: true }; "radius" → null */
function quantity(option: string): { v: number; unit: string; pi: boolean } | null {
  const m = plain(option).match(/^([−-]?\d[\d ]*(?:\.\d+)?)(π)?(?: (.+))?$/)
  if (!m) return null
  return { v: Number(m[1].replace(/ /g, '').replace('−', '-')), pi: !!m[2], unit: m[3] ?? '' }
}

const near = (x: number, y: number) => Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(x), Math.abs(y))
const labels = (svg: string) => [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1].replace(/ /g, ' '))
const polygons = (svg: string) => [...svg.matchAll(/<polygon class="([^"]*)" points="([^"]*)"/g)].map((m) => ({ cls: m[1], pts: m[2].split(' ').map((p) => p.split(',').map(Number) as [number, number]) }))
const dist = (a: [number, number], b: [number, number]) => Math.hypot(a[0] - b[0], a[1] - b[1])
const shoelace = (pts: [number, number][]) => Math.abs(pts.reduce((s, p, i) => s + p[0] * pts[(i + 1) % pts.length][1] - pts[(i + 1) % pts.length][0] * p[1], 0)) / 2
/** two lists of lengths are in the same proportions (the drawing is to scale) */
const sameShape = (drawn: number[], real: number[], tol = 0.02) => {
  const k = drawn[0] / real[0]
  return drawn.every((d, i) => Math.abs(d / real[i] / k - 1) < tol)
}

// ---------------------------------------------------------------- this file's own facts

/** the size of each unit in a base unit of its kind */
const SIZE: Record<string, [string, number]> = {
  mm: ['length', 0.001], cm: ['length', 0.01], m: ['length', 1], km: ['length', 1000],
  mg: ['mass', 0.001], g: ['mass', 1], kg: ['mass', 1000], t: ['mass', 1_000_000],
  mL: ['capacity', 0.001], L: ['capacity', 1], kL: ['capacity', 1000], ML: ['capacity', 1_000_000],
  s: ['time', 1], min: ['time', 60], h: ['time', 3600], days: ['time', 86_400],
  'mm²': ['area', 1e-6], 'cm²': ['area', 1e-4], 'm²': ['area', 1], ha: ['area', 10_000],
  'mm³': ['volume', 1e-9], 'cm³': ['volume', 1e-6], 'm³': ['volume', 1],
}
function convert(v: number, from: string, to: string): number {
  if (!SIZE[from] || !SIZE[to] || SIZE[from][0] !== SIZE[to][0]) throw new Error(`cannot convert ${from} to ${to}`)
  return Number(((v * SIZE[from][1]) / SIZE[to][1]).toPrecision(12))
}
const UNIT_WORDS: Record<string, string> = {
  km: 'kilometres', m: 'metres', cm: 'centimetres', mm: 'millimetres', t: 'tonnes', kg: 'kilograms', g: 'grams', mg: 'milligrams',
  ML: 'megalitres', kL: 'kilolitres', L: 'litres', mL: 'millilitres', h: 'hours', min: 'minutes', s: 'seconds', days: 'days',
  'mm²': 'square millimetres', 'cm²': 'square centimetres', 'm²': 'square metres', ha: 'hectares',
  'mm³': 'cubic millimetres', 'cm³': 'cubic centimetres', 'm³': 'cubic metres',
}
const grouped = (x: number): string => {
  if (x < 0) return '−' + grouped(-x)
  const [i, d] = String(x).split('.')
  return (i.length >= 5 ? i.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : i) + (d ? '.' + d : '')
}

/** The answer key for questions that are knowledge, not calculation. Written separately from the content file. */
const BEST_UNIT: Record<string, string> = {
  // 8.01 length, mass, capacity
  'the thickness of a 20-cent coin': 'mm', 'the length of an ant': 'mm', 'the length of a pencil': 'cm', 'the width of this page': 'cm',
  'the length of a bus': 'm', 'the height of a flagpole': 'm', 'the distance from Sydney to Brisbane': 'km', 'the length of the Murray River': 'km',
  'the mass of a grain of rice': 'mg', 'the mass of an apple': 'g', 'the mass of a mobile phone': 'g', 'the mass of a Year 7 student': 'kg',
  'the mass of a large dog': 'kg', 'the mass of a loaded truck': 't', 'the mass of an elephant': 't',
  'the medicine on a teaspoon': 'mL', 'the drink in a can': 'mL', 'the water in a full bucket': 'L', 'the petrol in a car’s tank': 'L',
  'the water a house uses in a year': 'kL', 'the water in a large dam': 'ML',
  // 8.04 area
  'the wing of a fly': 'mm²', 'the head of a drawing pin': 'mm²', 'the cover of a maths textbook': 'cm²', 'a playing card': 'cm²', 'the screen of a phone': 'cm²',
  'the floor of a classroom': 'm²', 'a basketball court': 'm²', 'a bedroom wall': 'm²', 'a farm': 'ha', 'a golf course': 'ha', 'the grounds of a high school': 'ha',
  // 8.10 volume
  'a grain of sugar': 'mm³', 'a drop of water': 'mm³', 'a matchbox': 'cm³', 'a maths textbook': 'cm³', 'a lunchbox': 'cm³', 'a classroom': 'm³', 'a wardrobe': 'm³', 'a shipping container': 'm³',
  // 8.13 capacity
  'a glass of milk': 'mL', 'a bottle of cough medicine': 'mL', 'a teaspoon': 'mL', 'a car’s petrol tank': 'L', 'a bucket': 'L', 'a bathtub': 'L',
  'a rainwater tank': 'kL', 'a dam': 'ML', 'an Olympic swimming pool': 'ML',
}
/** real sizes, to check that the "most likely measurement" is the only sensible option: [low, high] in base units */
const REAL_SIZE: Record<string, [number, number]> = {
  'the height of a Year 7 student': [1.2, 1.9], 'the length of a family car': [3, 6], 'the height of a classroom door': [1.8, 2.4], 'the length of a new pencil': [0.12, 0.22],
  'the mass of a mobile phone': [100, 300], 'the mass of a Year 7 student': [30_000, 80_000], 'the mass of a small car': [700_000, 1_600_000],
  'the capacity of a drink bottle': [0.3, 1.5], 'the capacity of a kitchen bucket': [5, 20], 'the length of a football field': [90, 130],
}
const KEY: Record<string, Record<string, string>> = {
  '8.02 meaning': { definition: 'the distance around it', 'rectangle formula': '2( l + w )', 'square formula': '4 s', unit: 'm' },
  '8.03 formula': { diameter: 'C = π d', radius: 'C = 2π r' },
  '8.03 pi': { ratio: 'π', value: '3.14', word: 'circumference', wheel: 'circumference', double: 'double' },
  '8.04 size': { fingernail: '1 cm²', shower: '1 m²', track: '1 ha', 'hectare square': '100 m', definition: 'surface inside it' },
  '8.05 meaning': { 'rectangle formula': 'A = lw', 'square formula': 'A = s ^2', unit: 'cm²' },
  '8.06 meaning': { formula: 'A = (1/2) bh', half: 'half', perpendicular: 'a right angle' },
  '8.07 meaning': { formula: 'A = bh', rectangle: 'rectangle', double: 'double' },
  '8.08 split': { house: 'a rectangle and a triangle', L: 'two rectangles' },
  '8.08 meaning': { definition: 'made up of 2 or more shapes', subtract: 'subtract the area of the hole', add: 'add the two areas' },
  '8.09 meaning': { 'side faces': 'rectangles', uniform: 'the same cross-section all the way along', named: 'base', 'not a prism': 'a sphere' },
  '8.10 meaning': { definition: 'space it takes up', 'cubic metre': 'two washing machines', 'cubic centimetre': '1 cm', operation: 'multiply by 1000' },
  '8.11 meaning': { formula: 'V = lwh', unit: 'cm³', cube: 's ^3' },
  '8.12 meaning': { formula: 'V = Ah', A: 'the area of the cross-section', unit: 'cm³', uniform: 'the same' },
  '8.13 size': { teaspoon: '5 mL', can: '375 mL', bucket: '10 L', tank: '1 kL', definition: 'liquid a container can hold' },
}
const CAPACITY_FACT: Record<string, number> = { 'L-mL': 1000, 'kL-L': 1000, 'ML-kL': 1000, 'cm3-mL': 1, 'm3-L': 1000, 'm3-kL': 1 }
const PRISM: Record<string, { base: string; name: string; corners: number }> = {
  triangle: { base: 'triangle', name: 'triangular prism', corners: 3 },
  rectangle: { base: 'rectangle', name: 'rectangular prism', corners: 4 },
  trapezium: { base: 'trapezium', name: 'trapezoidal prism', corners: 4 },
  pentagon: { base: 'pentagon', name: 'pentagonal prism', corners: 5 },
  hexagon: { base: 'hexagon', name: 'hexagonal prism', corners: 6 },
}
const SIDES_WORD: Record<number, [string, string]> = { 3: ['triangular', 'triangle'], 4: ['square', 'square'], 5: ['pentagonal', 'pentagon'], 6: ['hexagonal', 'hexagon'] }
const squish = (s: string) => s.replace(/\s+/g, '')

// ---------------------------------------------------------------- re-working each kind of question

type Expect = { v: number; unit?: string; pi?: boolean } | { text: string } | null

function rework(set: GameSet, q: GameQuestion, where: string): Expect {
  const m = q.meta as Record<string, any>
  const ex = set.exercise
  const t = m.t as string
  const prompt = plain(q.prompt)
  const lab = q.diagram ? labels(q.diagram) : []
  const has = (...xs: (string | number)[]) => xs.forEach((x) => !(prompt + ' | ' + lab.join(' | ')).includes(String(x)) && fail(where, `"${x}" is not on the page`, q))
  const key = () => {
    const k = KEY[`${ex} ${t}`]?.[m.v]
    if (!k) {
      fail(where, `no answer key for ${m.v}`, q)
      return null
    }
    return { text: k }
  }
  const polys = q.diagram ? polygons(q.diagram) : []
  const scale = (drawn: number[], real: number[], what: string) => {
    measured++
    if (!sameShape(drawn, real)) fail(where, `${what} is not drawn to scale: drawn ${drawn.map((d) => d.toFixed(1)).join(', ')} for ${real.join(', ')}`, q)
  }

  // conversions, whichever exercise they are in
  if (t === 'down' || t === 'up' || (ex === '8.01' && t === 'time')) {
    has(grouped(m.v), UNIT_WORDS[m.to])
    return { v: convert(m.v, m.from, m.to), unit: m.to }
  }
  if (t === 'fact' && ex !== '8.13') {
    has(`1 ${m.from === 'days' ? 'day' : m.from} = □ ${m.to}`)
    return { v: convert(1, m.from, m.to) }
  }
  if (t === 'operation') {
    has(UNIT_WORDS[m.from], UNIT_WORDS[m.to])
    const big = SIZE[m.from][1] > SIZE[m.to][1]
    return { text: `${big ? 'multiply' : 'divide'} by ${grouped(big ? convert(1, m.from, m.to) : convert(1, m.to, m.from))}` }
  }
  if (t === 'unit') {
    has(m.what)
    const u = BEST_UNIT[m.what]
    if (!u) fail(where, `no answer key for the unit of ${m.what}`, q)
    // the options are the units of one kind, smallest first
    const sizes = q.options.map((o) => SIZE[plain(o)]?.[1] ?? (plain(o) === 'km³' ? 1e9 : NaN))
    if (!sizes.every((s, i) => i === 0 || s > sizes[i - 1])) fail(where, 'units are not in order of size', q)
    return u ? { text: u } : null
  }

  switch (`${ex} ${t}`) {
    // ------------------------------------------------ 8.01
    case '8.01 size': {
      has(m.what)
      const range = REAL_SIZE[m.what]
      if (!range) return fail(where, `no real size for ${m.what}`, q), null
      const inRange = q.options.filter((o) => {
        const x = quantity(o)!
        const base = x.v * SIZE[x.unit][1]
        return base >= range[0] && base <= range[1]
      })
      if (inRange.length !== 1) fail(where, `${inRange.length} options are a sensible size`, q)
      return inRange.length === 1 ? { text: plain(inRange[0]) } : null
    }
    case '8.01 compare': {
      const cm = q.options.map((o) => {
        const x = quantity(o)!
        return convert(x.v, x.unit, 'cm')
      })
      if (new Set(cm).size !== 4) fail(where, 'two of the lengths are equal', q)
      has(m.longest ? 'longest' : 'shortest')
      const want = m.longest ? Math.max(...cm) : Math.min(...cm)
      return { text: plain(q.options[cm.indexOf(want)]) }
    }

    // ------------------------------------------------ 8.02 perimeter
    case '8.02 square': {
      has(`${m.s} ${m.u}`)
      scale(polys[0].pts.map((p, i) => dist(p, polys[0].pts[(i + 1) % 4])), [m.s, m.s, m.s, m.s], 'square')
      return { v: 4 * m.s, unit: m.u }
    }
    case '8.02 rect': {
      has(`${m.l} ${m.u}`, `${m.w} ${m.u}`)
      scale(polys[0].pts.map((p, i) => dist(p, polys[0].pts[(i + 1) % 4])), [m.l, m.w, m.l, m.w], 'rectangle')
      return { v: m.l + m.w + m.l + m.w, unit: m.u }
    }
    case '8.02 triangle': {
      const [a, b, c] = m.sides as number[]
      has(`${a} ${m.u}`, `${b} ${m.u}`, `${c} ${m.u}`)
      if (a + b <= c || a + c <= b || b + c <= a) fail(where, 'not a real triangle', q)
      const p = polys[0].pts
      scale([dist(p[0], p[1]), dist(p[1], p[2]), dist(p[2], p[0])].sort((x, y) => x - y), [a, b, c].sort((x, y) => x - y), 'triangle')
      return { v: a + b + c, unit: m.u }
    }
    case '8.02 isosceles': {
      has(`${m.e} ${m.u}`, `${m.base} ${m.u}`)
      if (2 * m.e <= m.base) fail(where, 'not a real triangle', q)
      const p = polys[0].pts
      scale([dist(p[0], p[1]), dist(p[1], p[2]), dist(p[2], p[0])].sort((x, y) => x - y), [m.e, m.e, m.base].sort((x, y) => x - y), 'isosceles triangle')
      if ((q.diagram!.match(/class="tk"/g) ?? []).length !== 2) fail(where, 'two sides should carry equal marks', q)
      return { v: m.e + m.e + m.base, unit: m.u }
    }
    case '8.02 regular': {
      has(`${m.s} ${m.u}`)
      const p = polys[0].pts
      if (p.length !== m.sides) fail(where, `drawn with ${p.length} sides, not ${m.sides}`, q)
      scale(p.map((x, i) => dist(x, p[(i + 1) % p.length])), p.map(() => 1), 'regular shape')
      return { v: Array.from({ length: m.sides }, () => m.s as number).reduce((x, y) => x + y, 0), unit: m.u }
    }
    case '8.02 side':
      has(`${m.P} ${m.u}`)
      return { v: m.P / 4, unit: m.u }
    case '8.02 story':
      has(`${m.l} ${m.u}`, `${m.w} ${m.u}`)
      return { v: 2 * m.l + 2 * m.w, unit: m.u }

    // ------------------------------------------------ 8.03 circles
    case '8.03 part': {
      // which part is coloured? measured from the drawing: the outline, a line across (twice the radius) or a line to the edge
      const r = Number(q.diagram!.match(/<circle class="sh"[^>]* r="([\d.]+)"/)![1])
      const line = q.diagram!.match(/<line class="ln hlstroke" x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)"/)
      const len = line ? Math.hypot(Number(line[1]) - Number(line[3]), Number(line[2]) - Number(line[4])) : 0
      measured++
      return { text: /<circle class="ln hlstroke"/.test(q.diagram!) ? 'circumference' : Math.abs(len - 2 * r) < 1 ? 'diameter' : Math.abs(len - r) < 1 ? 'radius' : '?' }
    }
    case '8.03 double':
      has(`${m.v} ${m.u}`, m.given)
      circleShows(q, m.given, where)
      return { v: m.given === 'radius' ? m.v * 2 : m.v / 2, unit: m.u }
    case '8.03 estimateD':
      has(`${m.d} ${m.u}`, 'π ≈ 3')
      circleShows(q, 'diameter', where)
      return { v: 3 * m.d, unit: m.u }
    case '8.03 estimateR':
      has(`${m.r} ${m.u}`, 'π ≈ 3')
      circleShows(q, 'radius', where)
      return { v: 3 * (m.r + m.r), unit: m.u }
    case '8.03 exactD':
      has(`${m.d} ${m.u}`, 'in terms of π')
      circleShows(q, 'diameter', where)
      return { v: m.d, unit: m.u, pi: true }
    case '8.03 exactR':
      has(`${m.r} ${m.u}`, 'in terms of π')
      circleShows(q, 'radius', where)
      return { v: 2 * m.r, unit: m.u, pi: true }
    case '8.03 formula':
      has(m.v)
      return key()

    // ------------------------------------------------ 8.05 rectangles
    case '8.05 rect':
      has(`${m.l} ${m.u}`, `${m.w} ${m.u}`)
      scale(polys[0].pts.map((p, i) => dist(p, polys[0].pts[(i + 1) % 4])), [m.l, m.w, m.l, m.w], 'rectangle')
      return { v: m.l * m.w, unit: m.u + '²' }
    case '8.05 square':
      has(`${m.s} ${m.u}`)
      return { v: m.s ** 2, unit: m.u + '²' }
    case '8.05 story':
      has(`${m.l} ${m.u}`, `${m.w} ${m.u}`)
      return { v: Number((m.l * m.w).toPrecision(12)), unit: 'm²' }
    case '8.05 grid': {
      const shaded = (q.diagram!.match(/class="cell on"/g) ?? []).length
      measured++
      if (shaded !== m.cols * m.rows) fail(where, `${shaded} squares are shaded`, q)
      return { v: shaded, unit: 'cm²' }
    }
    case '8.05 side':
      has(`${m.A} ${m.u}²`)
      if (!m.square) has(`${m.w} ${m.u}`)
      return { v: m.square ? Math.sqrt(m.A) : m.A / m.w, unit: m.u }
    case '8.05 pair': {
      has(`${m.A} cm²`)
      const product = (o: string) => {
        const k = plain(o).match(/^(\d+) cm by (\d+) cm$/)!
        return Number(k[1]) * Number(k[2])
      }
      const right = q.options.filter((o) => product(o) === m.A)
      if (right.length !== 1) fail(where, `${right.length} pairs multiply to ${m.A}`, q)
      return right.length === 1 ? { text: plain(right[0]) } : null
    }

    // ------------------------------------------------ 8.06 triangles
    case '8.06 basic': {
      has(`${m.base} ${m.u}`, `${m.h} ${m.u}`)
      const p = polys[0].pts
      scale([dist(p[0], p[1]), Math.abs(p[2][1] - p[0][1])], [m.base, m.h], 'triangle')
      return { v: (m.base * m.h) / 2, unit: m.u + '²' }
    }
    case '8.06 story':
      has(`${m.base} ${m.u}`, `${m.h} ${m.u}`, 'perpendicular height')
      return { v: (m.base * m.h) / 2, unit: m.u + '²' }
    case '8.06 half': {
      has(`${m.w} ${m.u}`, `${m.h} ${m.u}`)
      const rect = polys.find((p) => p.pts.length === 4)!
      const tri = polys.find((p) => p.pts.length === 3)!
      measured++
      if (Math.abs(shoelace(tri.pts) / shoelace(rect.pts) - 0.5) > 0.01) fail(where, 'the shaded triangle is not half of the rectangle', q)
      scale(rect.pts.map((p, i) => dist(p, rect.pts[(i + 1) % 4])), [m.w, m.h, m.w, m.h], 'rectangle')
      return { v: (m.w * m.h) / 2, unit: m.u + '²' }
    }
    case '8.06 right': {
      has(`${m.base} ${m.u}`, `${m.h} ${m.u}`, `${m.hyp} ${m.u}`)
      if (m.base ** 2 + m.h ** 2 !== m.hyp ** 2) fail(where, 'the three sides do not make a right-angled triangle', q)
      const p = polys[0].pts
      scale([dist(p[0], p[1]), dist(p[0], p[2]), dist(p[1], p[2])], [m.base, m.h, m.hyp], 'right-angled triangle')
      return { v: (m.base * m.h) / 2, unit: m.u + '²' }
    }
    case '8.06 slant':
    case '8.06 height': {
      const p = polys[0].pts // A, B, C
      const base = dist(p[0], p[1])
      const height = Math.abs(p[2][1] - p[0][1])
      const drawn = [base, height, dist(p[2], p[0]), dist(p[1], p[2])]
      if (t === 'slant') {
        has(`${m.base} ${m.u}`, `${m.h} ${m.u}`, `${m.slant} ${m.u}`)
        scale([drawn[0], drawn[1], drawn[3]], [m.base, m.h, m.slant], 'triangle with a slanted side')
        return { v: (m.base * m.h) / 2, unit: m.u + '²' }
      }
      has(`${m.base} ${m.u}`, `${m.h} ${m.u}`, `${m.left} ${m.u}`, `${m.right} ${m.u}`)
      scale(drawn, [m.base, m.h, m.left, m.right], 'triangle with two slanted sides')
      if (new Set([m.base, m.h, m.left, m.right]).size !== 4) fail(where, 'two of the labelled lengths are equal', q)
      // the perpendicular height is the one length that is not a side of the triangle: the dashed line
      if (!/class="ln dash"/.test(q.diagram!)) fail(where, 'no dashed height', q)
      return { v: m.h, unit: m.u }
    }

    // ------------------------------------------------ 8.07 parallelograms
    case '8.07 basic':
    case '8.07 slant':
    case '8.07 which': {
      const p = polys[0].pts // A, B, C, D
      const drawn = [dist(p[0], p[1]), Math.abs(p[2][1] - p[1][1]), dist(p[1], p[2])]
      has(`${m.base} ${m.u}`, `${m.h} ${m.u}`)
      if (t === 'basic') scale(drawn.slice(0, 2), [m.base, m.h], 'parallelogram')
      else {
        has(`${m.slant} ${m.u}`)
        scale(drawn, [m.base, m.h, m.slant], 'parallelogram with its slanted side')
        if (new Set([m.base, m.h, m.slant]).size !== 3) fail(where, 'two of the labelled lengths are equal', q)
      }
      return t === 'which' ? { text: `${m.base} ${m.u} and ${m.h} ${m.u}` } : { v: m.base * m.h, unit: m.u + '²' }
    }
    case '8.07 story':
      has(`${m.base} ${m.u}`, `${m.h} ${m.u}`, 'perpendicular height')
      return { v: m.base * m.h, unit: m.u + '²' }
    case '8.07 back':
      has(`${m.A} ${m.u}²`, `${m.base} ${m.u}`)
      return { v: m.A / m.base, unit: m.u }

    // ------------------------------------------------ 8.08 composite shapes
    case '8.08 add': {
      has(`${m.A1} ${m.u}²`, `${m.A2} ${m.u}²`)
      // the outline A, B, C, D, E, F: the left part is as tall as F, the right part as tall as C
      const p = polys[0].pts
      const left = dist(p[5], p[4]) * dist(p[0], p[5])
      const right = dist(p[2], p[3]) * dist(p[1], p[2])
      scale([left, right], [m.A1, m.A2], 'the two parts')
      return { v: m.A1 + m.A2, unit: m.u + '²' }
    }
    case '8.08 house': {
      has(`${m.A1} ${m.u}²`, `${m.A2} ${m.u}²`)
      const p = polys[0].pts // A, B, C, T, D
      scale([shoelace([p[0], p[1], p[2], p[4]]), shoelace([p[4], p[2], p[3]])], [m.A1, m.A2], 'the rectangle and the triangle')
      return { v: m.A1 + m.A2, unit: m.u + '²' }
    }
    case '8.08 hole': {
      has(`${m.B} ${m.u}²`, `${m.S} ${m.u}²`)
      scale([shoelace(polys[0].pts), shoelace(polys[1].pts)], [m.B, m.S], 'the rectangle and its hole')
      return { v: m.B - m.S, unit: m.u + '²' }
    }
    case '8.08 expression': {
      has(m.w1, m.h1, m.w2, m.h2)
      const p = polys[0].pts
      scale([dist(p[0], p[5]), dist(p[5], p[4]), dist(p[2], p[3]), dist(p[1], p[2])], [m.h1, m.w1, m.w2, m.h2], 'the two rectangles')
      const area = m.w1 * m.h1 + m.w2 * m.h2
      const value = (o: string) => Function(`"use strict"; return (${plain(o).replace(/×/g, '*').replace(/−/g, '-')})`)() as number
      const right = q.options.filter((o) => value(o) === area)
      if (right.length !== 1) fail(where, `${right.length} of the calculations give the area ${area}`, q)
      return right.length === 1 ? { text: plain(right[0]) } : null
    }
    case '8.08 missing': {
      has(`${m.W} ${m.u}`, `${m.w} ${m.u}`, '?')
      const p = polys[0].pts // the bottom is p0–p1, the step p2–p3, the top p4–p5
      scale([dist(p[0], p[1]), dist(p[2], p[3]), dist(p[4], p[5])], [m.W, m.w, m.W - m.w], 'L-shape')
      return { v: m.W - m.w, unit: m.u }
    }
    case '8.08 split': {
      // a triangle on top has a corner above the dashed line; two rectangles have six corners
      const corners = polys[0].pts.length
      measured++
      if ((m.v === 'house') !== (corners === 5)) fail(where, 'the drawing does not match', q)
      return key()
    }

    // ------------------------------------------------ 8.09 prisms
    case '8.09 name':
    case '8.09 cross': {
      const pr = PRISM[m.shape]
      const front = polys.find((p) => p.cls.includes('areashape'))!
      measured++
      if (front.pts.length !== pr.corners) fail(where, `the shaded base has ${front.pts.length} corners`, q)
      return { text: t === 'name' ? pr.name : pr.base }
    }
    case '8.09 solid':
      return { text: `${SIDES_WORD[m.sides][0]} ${m.kind}` }
    case '8.09 view':
      has(m.view === 'top' ? 'top view' : 'front view')
      return { text: m.view === 'top' ? SIDES_WORD[m.sides][1] : 'rectangle' }
    case '8.09 cubesView': {
      // counted from the drawing: every stack shows one top face; from the front, every square seen is a front face
      const tops = (q.diagram!.match(/class="cube cube-top"/g) ?? []).length
      const fronts = (q.diagram!.match(/class="cube cube-l"/g) ?? []).length
      const hs = m.hs as number[][]
      const cols = Math.max(...hs.map((r) => r.length))
      const frontView = Array.from({ length: cols }, (_, c) => Math.max(...hs.map((r) => r[c] ?? 0))).reduce((x, y) => x + y, 0)
      measured++
      if (tops !== hs.flat().filter((x) => x > 0).length || fronts !== frontView) fail(where, `the drawing shows ${tops} tops and ${fronts} fronts`, q)
      has(m.view === 'top' ? 'top view' : 'front view', 'front')
      return { v: m.view === 'top' ? tops : fronts }
    }

    // ------------------------------------------------ 8.10 to 8.13 volume and capacity
    case '8.10 count': {
      const count = (cls: string) => (q.diagram!.match(new RegExp(`class="cube ${cls}"`, 'g')) ?? []).length
      measured++
      if (count('cube-top') !== m.l * m.w || count('cube-l') !== m.l * m.h || count('cube-r') !== m.w * m.h) fail(where, 'the cube model does not match its numbers', q)
      return { v: m.l * m.w * m.h, unit: 'cm³' }
    }
    case '8.11 prism':
      has(`${m.l} ${m.u}`, `${m.w} ${m.u}`, `${m.h} ${m.u}`)
      if (!q.note) fail(where, 'a prism drawing needs the "not drawn to scale" note', q)
      return { v: m.l * m.w * m.h, unit: m.u + '³' }
    case '8.11 cube':
      has(`${m.s} ${m.u}`)
      return { v: m.s ** 3, unit: m.u + '³' }
    case '8.11 story':
      has(`${m.l} ${m.u}`, `${m.w} ${m.u}`, `${m.h} ${m.u}`)
      return { v: m.l * m.w * m.h, unit: m.u + '³' }
    case '8.11 layers':
      has(`${m.per} cubes`, `${m.layers} layers`)
      return { v: m.per * m.layers, unit: 'cm³' }
    case '8.12 Ah':
      has(`${m.A} ${m.u}²`, `${m.h} ${m.u}`)
      if (!q.note) fail(where, 'a prism drawing needs the "not drawn to scale" note', q)
      return { v: m.A * m.h, unit: m.u + '³' }
    case '8.12 story':
      has(`${m.A} ${m.u}²`, `${m.h} ${m.u}`)
      return { v: m.A * m.h, unit: m.u + '³' }
    case '8.12 back':
      has(`${m.V} ${m.u}³`, `${m.A} ${m.u}²`)
      return { v: m.V / m.A, unit: m.u }
    case '8.13 fact':
      return { v: CAPACITY_FACT[m.id] }
    case '8.13 holds':
      has(`${m.v} ${m.kind === 'cm3-mL' ? 'cm³' : 'm³'}`)
      // 1 cm³ holds 1 mL; 1 m³ holds 1 kL, which is 1000 L
      return m.kind === 'cm3-mL' ? { v: m.v, unit: 'mL' } : m.kind === 'm3-kL' ? { v: m.v, unit: 'kL' } : { v: m.v * 1000, unit: 'L' }
  }
  if (KEY[`${ex} ${t}`]) return key()
  fail(where, 'no independent check for this kind of question', q)
  return null
}

/** The circle drawing shows the part the question talks about: a line from the centre (radius) or right across (diameter). */
function circleShows(q: GameQuestion, part: 'radius' | 'diameter', where: string) {
  const r = Number(q.diagram!.match(/<circle class="sh"[^>]* r="([\d.]+)"/)![1])
  const line = q.diagram!.match(/<line class="ln hlstroke" x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)"/)!
  const len = Math.hypot(Number(line[1]) - Number(line[3]), Number(line[2]) - Number(line[4]))
  measured++
  if (Math.abs(len - (part === 'radius' ? r : 2 * r)) > 1) fail(where, `the circle does not show a ${part}`, q)
}

// ---------------------------------------------------------------- every kind of question, many times

/** the other chapters' re-working, by the start of their exercise ids */
const OTHER_CHAPTERS: Record<string, typeof reworkCh1> = { 'ncm7-1': reworkCh1, 'ncm7-2': reworkCh2, 'ncm7-3': reworkCh3, 'ncm7-4': reworkCh4, 'ncm7-5': reworkCh5, 'ncm7-6': reworkCh6, 'ncm7-7': reworkCh7, 'ncm7-9': reworkCh9, 'ncm7-10': reworkCh10, 'ncm7-11': reworkCh11, 'ncm7-12': reworkCh12, 'ncm8-1': rework8Ch1, 'ncm8-2': rework8Ch2, 'ncm8-3': rework8Ch3, 'ncm8-4': rework8Ch4, 'ncm8-5': rework8Ch5, 'ncm8-6': rework8Ch6, 'ncm8-7': rework8Ch7, 'ncm8-8': rework8Ch8, 'ncm8-9': rework8Ch9, 'ncm8-10': rework8Ch10, 'ncm8-11': rework8Ch11, 'ncm8-12': rework8Ch12 }

const kinds: string[] = []
for (const set of ALL_GAME_SETS) {
  for (const maker of set.makers) {
    const where = `${set.exercise} ${maker.t}`
    kinds.push(where)
    const at = [0, 0, 0, 0]
    let amounts = true
    for (let i = 0; i < N; i++) {
      setSeed(97 + i * 7919 + maker.t.length * 104729 + Number(set.exercise) * 1000)
      let q: GameQuestion
      try {
        q = maker.make()
      } catch (e) {
        fail(where, 'threw ' + (e as Error).message)
        break
      }
      checked++
      // ---- shape of the question
      const blob = q.prompt + (q.diagram ?? '') + q.options.join(' ') + q.why
      if (/NaN|undefined|Infinity|\[object|null/.test(blob)) fail(where, 'bad text: ' + (blob.match(/.{0,30}(NaN|undefined|Infinity|\[object|null).{0,30}/)?.[0] ?? ''), q)
      if (q.meta.t !== maker.t) fail(where, `question says it is "${q.meta.t}"`, q)
      if (/(^|[^\d.,−-])1 (degrees|places|floors|steps|integers|cubes|squares|layers|glasses|cups|tiles|eggs|cartons|boxes|tickets|factors|numbers)\b/.test(plain(q.prompt + ' ' + q.why))) fail(where, 'plural slip: ' + plain(q.prompt + ' ' + q.why).match(/1 \w+/)?.[0], q)
      if (q.options.length !== 4) fail(where, `${q.options.length} options`, q)
      const shown = q.options.map(plain)
      if (new Set(shown.map(squish)).size !== 4) fail(where, 'two options read the same', q)
      if (q.correct < 0 || q.correct > 3) fail(where, 'no right option', q)
      if (!plain(q.prompt) || !plain(q.why)) fail(where, 'empty prompt or explanation', q)
      if (plain(q.prompt).length > 175) fail(where, `prompt is ${plain(q.prompt).length} characters: too long to read quickly`, q)
      if (shown.some((o) => o.length > 42)) fail(where, 'an option is too long for the board', q)
      if (q.diagram && (q.diagram.match(/<svg[\s\S]*?<\/svg>/g) ?? []).some((sv) => /<(i|sup|b|div|p|br|span)[ >]/.test(sv))) fail(where, 'HTML tag inside the diagram', q)
      if (/<svg/.test(q.prompt + q.options.join('') + q.why)) fail(where, 'a drawing outside the diagram', q)
      // ---- no two options equal in value (e.g. 0.5 m and 50 cm)
      const qs = q.options.map(quantity)
      if (qs.every((x) => x && SIZE[x.unit])) {
        const base = qs.map((x) => (x!.pi ? Math.PI : 1) * x!.v * SIZE[x!.unit][1])
        for (let a = 0; a < 4; a++) for (let b = a + 1; b < 4; b++) if (SIZE[qs[a]!.unit][0] === SIZE[qs[b]!.unit][0] && near(base[a], base[b])) fail(where, 'two options are the same amount', q)
      }
      // ---- the answer, re-worked
      const ctx = { fail: (msg: string) => fail(where, msg, q), plain, page: plain(q.prompt) + ' | ' + (q.diagram ? labels(q.diagram).join(' | ') : '') }
      // a kind reused from another book (meta.reused = "ncm7-ch2|2.07|find") is checked by that chapter's checks, as that exercise
      const from = typeof q.meta.reused === 'string' ? (q.meta.reused as string).split('|') : null
      const [chk, chkSet, chkQ] = from ? [`${from[0].replace('-ch', '-')}`, { ...set, id: `${from[0].split('-')[0]}-${from[1]}`, exercise: from[1] }, { ...q, meta: { ...q.meta, t: from[2] } }] : [set.id.replace(/\.\d+$/, ''), set, q]
      const other = OTHER_CHAPTERS[chk]
      const want = chkSet.id.startsWith('ncm7-8.') ? rework(chkSet, chkQ, where) : other ? other(chkSet, chkQ, ctx) : (fail(where, 'no independent checks for this chapter', q), null)
      if (want) {
        reworked++
        const got = q.options[q.correct]
        if ('text' in want) {
          if (squish(plain(got)) !== squish(want.text)) fail(where, `expected "${want.text}"`, q)
        } else {
          const g = quantity(got)
          if (!g) fail(where, `expected ${want.v}${want.unit ? ' ' + want.unit : ''}`, q)
          else {
            if (!near(g.v, want.v)) fail(where, `expected ${want.v}, the key says ${g.v}`, q)
            if ((want.unit ?? '') !== g.unit) fail(where, `expected the unit "${want.unit ?? ''}", the key says "${g.unit}"`, q)
            if (!!want.pi !== g.pi) fail(where, 'π is missing or not wanted', q)
            // every option is in the same unit, so the unit never gives the answer away
            if (qs.every((x) => x) && new Set(qs.map((x) => x!.unit)).size !== 1) fail(where, 'the options are in different units', q)
            // and the explanation ends up at the same answer
            if (!plain(q.why).replace(/ /g, '').includes(String(grouped(want.v)).replace(/ /g, ''))) fail(where, `the explanation does not reach ${want.v}`, q)
          }
        }
      }
      at[q.correct]++
      if (!(qs.every((x) => x) && new Set(qs.map((x) => x!.unit)).size === 1)) amounts = false
    }
    // ---- shuffled options: the right answer turns up in every position (lists kept in a natural order are the exception)
    const total = at.reduce((x, y) => x + y, 0)
    if (amounts && total >= 200 && Math.min(...at) < total * 0.12) fail(where, `the right answer is rarely in one of the positions: ${at.join(', ')}`)
  }
}

// ---------------------------------------------------------------- how games are built

const key = (q: GameQuestion) => q.prompt + '|' + (q.diagram ?? '') + '|' + q.options[q.correct]
for (const set of ALL_GAME_SETS) {
  for (const count of GAME_LENGTHS) {
    for (let seed = 1; seed <= 40; seed++) {
      const game = buildGame(set, seed * 7717, count)
      if (game.length !== count) fail(set.exercise, `a ${count}-question game has ${game.length} questions`)
      if (new Set(game.map((g) => key(g.q))).size !== count) fail(set.exercise, `a ${count}-question game repeats a question (seed ${seed * 7717})`)
      if (gameCheck(game) !== gameCheck(buildGame(set, seed * 7717, count))) fail(set.exercise, 'the same seed gave a different game')
      if (count >= set.makers.length && new Set(game.map((g) => g.q.meta.t)).size !== set.makers.length) fail(set.exercise, 'a kind of question is missing from the game')
      // the first time round, the most basic kinds come first
      const firstPass = game.slice(0, Math.min(count, set.makers.length)).map((g) => set.makers.find((m) => m.t === g.q.meta.t)?.d ?? 1)
      if (firstPass.some((d, i) => i > 0 && d < firstPass[i - 1])) fail(set.exercise, 'harder kinds came before basic ones')
      // no kind of question twice in a row
      if (game.some((g, i) => i > 0 && g.q.meta.t === game[i - 1].q.meta.t && set.makers.length > 2)) fail(set.exercise, `two "${game.find((g, i) => i > 0 && g.q.meta.t === game[i - 1].q.meta.t)?.q.meta.t}" questions in a row (seed ${seed * 7717}, ${count} questions)`)
    }
    if (gameCheck(buildGame(set, 1, count)) === gameCheck(buildGame(set, 2, count))) fail(set.exercise, 'different seeds gave the same game')
  }
}
for (const book of GAME_BOOKS)
  for (const ch of book.chapters) {
    if (findGame(ch.id)?.chapter !== ch) fail(ch.id, 'chapter not found by its id')
    for (const set of ch.sets) if (findGame(set.id)?.set !== set) fail(set.id, 'exercise not found by its id')
    for (const count of GAME_LENGTHS) {
      const game = buildChapterGame(ch, 4242 + count, count)
      if (game.length !== count) fail(ch.id, `a ${count}-question chapter game has ${game.length} questions`)
      const order = game.map((g) => ch.sets.indexOf(g.set))
      const firstRound = order.slice(0, Math.min(count, ch.sets.length))
      if (firstRound.some((x, i) => i > 0 && x <= firstRound[i - 1])) fail(ch.id, 'the chapter game is not in textbook order')
      if (count >= ch.sets.length && new Set(order).size !== ch.sets.length) fail(ch.id, 'an exercise is missing from the chapter game')
      if (new Set(game.map((g) => key(g.q))).size !== count) fail(ch.id, 'the chapter game repeats a question')
    }
  }

// ---------------------------------------------------------------- the luck rules

let s = 12345
const rng = () => {
  s = (s + 0x6d2b79f5) >>> 0
  let t = s
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const kindsSeen = new Set<string>()
for (let trial = 0; trial < 60000; trial++) {
  const teams = 2 + Math.floor(rng() * 5)
  const scores = Array.from({ length: teams }, () => Math.floor(rng() * 60) * 5)
  const right = scores.map((_, i) => i).filter(() => rng() < 0.7)
  const r = dig(scores, right, rng)
  const where = `dig(${scores.join(',')} | right ${right.join(',')})`
  if (r.scores.some((x) => x < 0)) fail(where, 'a total went below zero')
  if (r.finds.length !== right.length || new Set(r.finds.map((f) => f.team)).size !== right.length) fail(where, 'each team that was right digs exactly once')
  if (r.finds.filter((f) => f.kind === 'raid').length > 1 || r.finds.filter((f) => f.kind === 'leapfrog').length > 1) fail(where, 'more than one raid or leapfrog')
  // replay the finds: totals only change the way the finds say
  const now = scores.slice()
  for (const f of r.finds) {
    kindsSeen.add(f.kind)
    if (f.before !== now[f.team]) fail(where, 'a find starts from the wrong total')
    if (f.gain <= 0 && !(f.kind === 'raid' && f.gain === 0)) fail(where, `a correct answer gained ${f.gain}`)
    if (f.after !== f.before + f.gain) fail(where, 'gain does not match the totals')
    if (f.kind === 'echidna' && f.gain !== ECHIDNA) fail(where, 'echidna find')
    if (f.kind === 'double' && f.gain !== 2 * (f.base ?? 0)) fail(where, 'double find')
    if (f.kind === 'raid') {
      if (f.other === undefined || now[f.other] <= now[f.team]) fail(where, 'a raid must be on a team that is ahead')
      else if (now[f.other] !== Math.max(...now.filter((_, i) => i !== f.team))) fail(where, 'a raid must be on the leading team')
      if (f.gain !== Math.min(RAID, now[f.other!]) || f.otherLoss !== f.gain) fail(where, 'raid amount')
      now[f.other!] -= f.gain
    }
    if (f.kind === 'leapfrog') {
      const ahead = now.filter((x, i) => i !== f.team && x > now[f.team])
      if (f.other === undefined || now[f.other] !== Math.min(...ahead)) fail(where, 'a leapfrog must be with the team just ahead')
      const gap = now[f.other!] - now[f.team]
      if (gap < LEAP_MIN || gap > LEAP_MAX || f.gain !== gap) fail(where, `leapfrog over a gap of ${gap}`)
      now[f.other!] = now[f.team]
    }
    now[f.team] = f.after
  }
  if (now.join() !== r.scores.join()) fail(where, 'final totals do not match the finds')
  if (scores.some((x, i) => !right.includes(i) && r.scores[i] > x)) fail(where, 'a team that was wrong gained termites')
}
for (const k of ['termites', 'double', 'golden', 'echidna', 'raid', 'leapfrog']) if (!kindsSeen.has(k)) fail('luck', `no ${k} find ever happened`)
if (places([50, 80, 80, 10]).join() !== '3,1,1,4') fail('places', 'ties should share a place')

// Skill should usually beat luck: four teams of different strengths, 10 questions, many games
const strengths = [0.9, 0.75, 0.6, 0.45]
const wins = [0, 0, 0, 0]
let mostRightWins = 0
let decided = 0
const GAMES = 20000
for (let g = 0; g < GAMES; g++) {
  let scores = [0, 0, 0, 0]
  const rightCount = [0, 0, 0, 0]
  for (let k = 0; k < 10; k++) {
    const right = strengths.map((p, i) => (rng() < p ? i : -1)).filter((i) => i >= 0)
    right.forEach((i) => rightCount[i]++)
    scores = dig(scores, right, rng).scores
  }
  const best = Math.max(...scores)
  const winners = scores.map((x, i) => (x === best ? i : -1)).filter((i) => i >= 0)
  winners.forEach((i) => (wins[i] += 1 / winners.length))
  const top = Math.max(...rightCount)
  const topTeams = rightCount.map((x, i) => (x === top ? i : -1)).filter((i) => i >= 0)
  if (topTeams.length === 1) {
    decided++
    if (winners.includes(topTeams[0])) mostRightWins++
  }
}
const share = wins.map((w) => Math.round((w / GAMES) * 100))
if (!(share[0] > share[1] && share[1] > share[2] && share[2] > share[3])) fail('luck', `stronger teams should win more often: ${share.join('%, ')}%`)
if (share[0] < 50) fail('luck', `the strongest team wins only ${share[0]}% of games`)
if (mostRightWins / decided < 0.6) fail('luck', `the team with the most right answers wins only ${Math.round((mostRightWins / decided) * 100)}% of the time`)

console.log(`class games: ${ALL_GAME_SETS.length} exercises, ${kinds.length} kinds of question`)
console.log(`checked ${checked} questions; ${reworked} answers re-worked independently; ${measured} drawings measured`)
console.log(`luck: teams that get 90%, 75%, 60% and 45% right win ${share.join('%, ')}% of games; the team with the most right answers wins ${Math.round((mostRightWins / decided) * 100)}%`)
if (failures) for (const [k, c] of [...failKinds].sort((a, b) => b[1] - a[1])) console.log(`  ${String(c).padStart(5)} × ${k}`)
console.log(failures ? `${failures} FAILURES` : 'all passed')
if (failures) process.exit(1)
