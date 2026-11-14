// Class games for New Century Maths 8 (3rd edition, Cengage) Chapter 5, Area and volume: one set of quick questions
// for each exercise, 5.01 to 5.14.
//
// Much of the chapter revises Year 7 (NCM 7 Chapter 8), so those sets reuse its kinds (checked by that chapter's
// checks, see reuse.ts). New kinds: perimeter of quadrilaterals and composite shapes, parts of a circle, finding a
// radius from a circumference, km² and hectares, area of a circle, arcs and sectors, trapeziums, kites and rhombuses,
// and cylinders (tests/game-checks/ncm8-ch5.ts).
//
// Syllabus: NSW Mathematics K–10 (2022), Stage 4: Length MA4-LEN-C-01 (5.01–5.03, arc lengths and sector perimeters
// in 5.08), Area MA4-ARE-C-01 (5.04–5.10) and Volume MA4-VOL-C-01 (5.11–5.14). All of it is Stage 4 core content.
// The game is played without calculators, so answers are exact (in terms of π) or estimates with π ≈ 3; the
// textbook's answers correct to 1 or 2 decimal places need the π key and are left for the exercise.
//
// Audit against the textbook, exercise by exercise (Nov 2026): added the capacity of a box from its inside
// measurements in centimetres (5.14).
import type { GameChapter, GameQuestion, GameSet } from '@/lib/game/types'
import { circleFeature, type CirclePart } from '@/lib/maths/diagrams13'
import { sector } from '@/lib/maths/diagrams10'
import { D, DIVIDE, NOT_TO_SCALE, TIMES, U, chance, frac, gq, int, mk, num, numOpts, pick, sq } from './helpers'
import { NCM7_CH8 } from './ncm7-ch8'
import { reuse } from './reuse'

const LEN = 'MA4-LEN-C-01'
const ARE = 'MA4-ARE-C-01'
const VOL = 'MA4-VOL-C-01'
const it = (s: string) => `<i>${s}</i>`
const b = (s: string) => `<b>${s}</b>`
const n = (x: number) => num(x).replace(/ /g, ' ')
const lenUnit = () => pick(['cm', 'm', 'mm'])
const piU = (k: number, u: string) => `${n(k)}π ${u}`
const cu = (u: string) => u + '³'
const CALC_NOTE = 'Played without calculators: answers are exact (in terms of π) or estimates with π ≈ 3. Answers to 1 or 2 decimal places need the π key and are left for the exercise.'
const oneOf = (list: (() => GameQuestion)[]) => () => pick(list)()

const set = (exn: string, title: string, focus: string, outcomes: string[], makers: GameSet['makers'], extra: Partial<GameSet> = {}): GameSet => ({
  id: `ncm8-${exn}`,
  exercise: exn,
  ref: `NCM 8 Ex ${exn}`,
  title,
  focus,
  outcomes,
  makers,
  ...extra,
})
const R7 = (ex: string, t: string, as?: string) => reuse(NCM7_CH8, ex, t, as)

// ================================================================== 5.01 Perimeter

function m501quad(): GameQuestion {
  const u = lenUnit()
  const kind = pick(['parallelogram', 'kite', 'rhombus', 'rectangle'] as const)
  if (kind === 'rhombus') {
    const s = int(4, 15)
    return gq({
      t: 'quad',
      prompt: `A rhombus has sides of length ${b(U(s, u))}. What is its perimeter?`,
      ...numOpts(4 * s, [2 * s, s * s, 3 * s], (x) => U(x, u)),
      why: `All 4 sides of a rhombus are equal: 4 ${TIMES} ${s} = ${4 * s} ${u}.`,
      meta: { kind },
    })
  }
  const p = int(3, 12)
  let q = int(5, 20)
  if (q === p) q += 3
  const how = kind === 'kite' ? 'adjacent sides are equal (2 pairs)' : 'opposite sides are equal'
  return gq({
    t: 'quad',
    prompt: `A ${kind} has sides of ${b(U(p, u))} and ${b(U(q, u))}. What is its perimeter?`,
    ...numOpts(2 * (p + q), [p + q, p * q, 2 * p + q, p + 2 * q], (x) => U(x, u)),
    why: `In a ${kind}, ${how}: 2 ${TIMES} (${p} + ${q}) = ${2 * (p + q)} ${u}.`,
    meta: { kind },
  })
}

function m501composite(): GameQuestion {
  const u = pick(['cm', 'm'])
  const W = int(8, 16)
  const H = int(6, 12)
  const w = int(2, W - 3)
  const h = int(2, H - 3)
  const P = 2 * (W + H)
  return gq({
    t: 'composite',
    prompt: 'Find the perimeter of this shape. (All angles are right angles.)',
    // the outer sides are labelled (their labels sit outside the shape, so each is clearly beside its side); the notch is not
    diagram: D.lShape(W, H, w, h, { W: U(W, u), H: U(H, u), a: U(W - w, u), b: U(H - h, u) }),
    // only the labelled sides; the area; counting the notch twice
    ...numOpts(P, [P - w - h, W * H - w * h, P + 2 * w, P + w + h], (x) => U(x, u)),
    why: `The two unlabelled sides are ${W} − ${W - w} = ${w} and ${H} − ${H - h} = ${h}. Perimeter = ${W} + ${H} + ${W - w} + ${H - h} + ${w} + ${h} = ${P} ${u}.`,
    meta: {},
  })
}

const SET_501 = set('5.01', 'Perimeter', 'Find the perimeter of quadrilaterals and composite shapes, working out any unlabelled sides.', [LEN], [
  R7('8.02', 'rect'),
  R7('8.02', 'isosceles'),
  R7('8.02', 'regular'),
  mk('quad', m501quad),
  mk('composite', m501composite, 2),
])

// ================================================================== 5.02 Parts of a circle

/** wrong names a student is likely to give for each part (never a name that is also right: a diameter is a chord, a semicircle a sector) */
const CONFUSE: Record<CirclePart | 'circumference', string[]> = {
  radius: ['diameter', 'chord', 'tangent'],
  diameter: ['radius', 'tangent', 'arc'],
  chord: ['diameter', 'tangent', 'radius'],
  tangent: ['chord', 'radius', 'diameter'],
  arc: ['chord', 'sector', 'segment'],
  sector: ['segment', 'arc', 'chord'],
  segment: ['sector', 'arc', 'chord'],
  semicircle: ['segment', 'quadrant', 'arc'],
  quadrant: ['semicircle', 'segment', 'arc'],
  circumference: ['arc', 'diameter', 'radius'],
}

function m502name(): GameQuestion {
  const part = pick(['radius', 'diameter', 'chord', 'tangent', 'arc', 'sector', 'segment', 'semicircle', 'quadrant'] as CirclePart[])
  const what = ['sector', 'segment', 'semicircle', 'quadrant'].includes(part) ? 'shaded region' : 'coloured part'
  const WHY: Record<CirclePart, string> = {
    radius: 'A radius goes from the centre to the circle.',
    diameter: 'A diameter goes right across the circle through the centre.',
    chord: 'A chord joins two points on the circle without going through the centre.',
    tangent: 'A tangent touches the circle at just one point.',
    arc: 'An arc is part of the circumference.',
    sector: 'A sector is cut off by two radii and an arc.',
    segment: 'A segment is cut off by a chord and an arc.',
    semicircle: 'A semicircle is half a circle, cut off by a diameter.',
    quadrant: 'A quadrant is a quarter of a circle: two radii at right angles.',
  }
  return gq({
    t: 'name',
    prompt: `What is the ${what} of this circle called?`,
    diagram: circleFeature(part, int(0, 11) * 30),
    correct: part,
    wrong: CONFUSE[part],
    why: WHY[part],
    meta: {},
  })
}

const DESCRIBE: [string, CirclePart | 'circumference'][] = [
  ['a straight line from the centre to the circle', 'radius'],
  ['a straight line through the centre, from one side of the circle to the other', 'diameter'],
  ['a straight line that joins two points on the circle but misses the centre', 'chord'],
  ['a straight line that touches the circle at only one point', 'tangent'],
  ['a curved part of the circumference', 'arc'],
  ['the region between a chord and an arc', 'segment'],
  ['the region between two radii and an arc', 'sector'],
  ['the distance around a circle', 'circumference'],
  ['a quarter of a circle, cut off by two radii at right angles', 'quadrant'],
]

function m502describe(): GameQuestion {
  const [d, part] = pick(DESCRIBE)
  return gq({
    t: 'describe',
    prompt: `Which part of a circle is ${d}?`,
    correct: part,
    wrong: CONFUSE[part],
    why: `The ${part} is ${d}.`,
    meta: {},
  })
}

const SET_502 = set('5.02', 'Parts of a circle', 'Name the radius, diameter, chord, tangent, arc, sector, segment, semicircle and quadrant.', [LEN], [
  R7('8.03', 'part'),
  mk('name', m502name),
  mk('describe', m502describe),
  R7('8.03', 'double'),
])

// ================================================================== 5.03 Circumference of a circle

function m503back(): GameQuestion {
  const u = lenUnit()
  const d = 2 * int(2, 15)
  const askR = chance()
  return gq({
    t: 'back',
    prompt: `A circle has a circumference of ${b(piU(d, u))}. What is its ${askR ? 'radius' : 'diameter'}?`,
    ...(askR ? numOpts(d / 2, [d, 2 * d, d / 4], (x) => U(x, u)) : numOpts(d, [d / 2, 2 * d, d * 3], (x) => U(x, u))),
    why: askR ? `${it('C')} = π${it('d')}, so the diameter is ${d} ${u} and the radius is half of that: ${d / 2} ${u}.` : `${it('C')} = π${it('d')}, so ${d}π = π ${TIMES} ${d}: the diameter is ${d} ${u}.`,
    meta: {},
  })
}

const SET_503 = set('5.03', 'Circumference of a circle', 'Use C = πd or C = 2πr, as an estimate or in terms of π, and work back from a circumference.', [LEN], [
  R7('8.03', 'formula'),
  R7('8.03', 'estimateD'),
  R7('8.03', 'exactD'),
  R7('8.03', 'exactR'),
  mk('back', m503back, 2),
], { teacherNote: CALC_NOTE })

// ================================================================== 5.04 Metric units of area

function m504km(): GameQuestion {
  const c = pick([
    { from: 'km²', to: 'ha', f: 100, toName: 'hectares' },
    { from: 'km²', to: 'm²', f: 1_000_000, toName: 'square metres' },
    { from: 'ha', to: 'km²', f: 0.01, toName: 'square kilometres' },
  ])
  const v = c.f < 1 ? pick([100, 200, 300, 500, 1000, 1500, 2500, 50]) : pick([2, 3, 4, 5, 7, 1.5, 2.5, 0.5])
  const ans = Number((v * c.f).toPrecision(12))
  const wrongF = c.f === 100 ? [1000, 10000, 10] : c.f === 0.01 ? [0.001, 0.0001, 0.1] : [1000, 10_000, 100_000]
  return gq({
    t: 'km',
    prompt: `Convert ${b(U(v, c.from))} to ${c.toName}.`,
    ...numOpts(ans, wrongF.map((k) => Number((v * k).toPrecision(12))), (x) => U(x, c.to)),
    why: c.f === 100 ? `1 km² = 100 ha, so ${n(v)} ${TIMES} 100 = ${n(ans)} ha.` : c.f === 0.01 ? `1 km² = 100 ha, so ${n(v)} ${DIVIDE} 100 = ${n(ans)} km².` : `1 km² = 1000 m × 1000 m = 1 000 000 m², so ${n(v)} km² = ${n(ans)} m².`,
    meta: {},
  })
}

const SET_504 = set('5.04', 'Metric units of area', 'Choose units for area and convert between mm², cm², m², ha and km².', [ARE], [
  R7('8.04', 'fact'),
  R7('8.04', 'unit'),
  R7('8.04', 'down'),
  R7('8.04', 'up'),
  mk('km', m504km, 2),
])

// ================================================================== 5.05, 5.06 revision of Year 7 area

const SET_505 = set('5.05', 'Areas of rectangles, triangles and parallelograms', 'Use A = lb, A = ½bh and A = bh with the perpendicular height.', [ARE], [
  R7('8.05', 'rect'),
  R7('8.06', 'basic', 'triangle'),
  R7('8.06', 'slant', 'triangleSlant'),
  R7('8.07', 'basic', 'parallelogram'),
  R7('8.07', 'slant', 'parallelogramSlant'),
  R7('8.05', 'side'),
])
const SET_506 = set('5.06', 'Areas of composite shapes', 'Split a shape into parts and add, or subtract the part that is missing.', [ARE], [
  R7('8.08', 'add'),
  R7('8.08', 'split'),
  R7('8.08', 'hole'),
  R7('8.08', 'house'),
  R7('8.08', 'missing'),
])

// ================================================================== 5.07 Area of a circle

function m507exactR(): GameQuestion {
  const u = lenUnit()
  const r = int(2, 12)
  return gq({
    t: 'exactR',
    prompt: 'Find the area of this circle in terms of π.',
    diagram: D.circleShape(U(r, u), 'radius'),
    // the circumference 2πr; squaring the diameter; doubling instead of squaring
    ...numOpts(r * r, [2 * r, 4 * r * r, r], (k) => piU(k, sq(u))),
    why: `${it('A')} = π${it('r')}² = π ${TIMES} ${r}² = ${r * r}π ${sq(u)}.`,
    meta: {},
  })
}

function m507exactD(): GameQuestion {
  const u = lenUnit()
  const r = int(2, 10)
  const d = 2 * r
  return gq({
    t: 'exactD',
    prompt: 'Find the area of this circle in terms of π.',
    diagram: D.circleShape(U(d, u), 'diameter'),
    ...numOpts(r * r, [d * d, d, 2 * r * r], (k) => piU(k, sq(u))),
    why: `The radius is ${d} ${DIVIDE} 2 = ${r} ${u}. ${it('A')} = π${it('r')}² = π ${TIMES} ${r}² = ${r * r}π ${sq(u)}.`,
    meta: {},
  })
}

function m507estimate(): GameQuestion {
  const u = lenUnit()
  const r = pick([2, 3, 4, 5, 6, 10, 20])
  const A = 3 * r * r
  return gq({
    t: 'estimate',
    prompt: 'Estimate the area of this circle. Use π ≈ 3.',
    diagram: D.circleShape(U(r, u), 'radius'),
    // (3r)², 2 × 3 × r (the circumference), 3 × diameter²
    ...numOpts(A, [9 * r * r, 6 * r, 12 * r * r, 3 * r], (x) => U(x, sq(u))),
    why: `${it('A')} = π${it('r')}² ≈ 3 ${TIMES} ${r}² = 3 ${TIMES} ${r * r} = ${A} ${sq(u)}.`,
    meta: {},
  })
}

const m507formula = oneOf([
  () =>
    gq({
      t: 'formula',
      prompt: `Which formula gives the ${b('area')} of a circle with radius ${it('r')}?`,
      correct: `${it('A')} = π${it('r')}<sup>2</sup>`,
      wrong: [`${it('A')} = 2π${it('r')}`, `${it('A')} = (π${it('r')})<sup>2</sup>`, `${it('A')} = π${it('r')}`],
      why: 'Area of a circle = π × radius × radius.',
      meta: { v: 'circle' },
    }),
  () =>
    gq({
      t: 'formula',
      prompt: `Which formula gives the ${b('area')} of a semicircle with radius ${it('r')}?`,
      correct: `${it('A')} = ${frac(1, 2)}π${it('r')}<sup>2</sup>`,
      wrong: [`${it('A')} = π${it('r')}<sup>2</sup>`, `${it('A')} = π${it('r')}`, `${it('A')} = ${frac(1, 4)}π${it('r')}<sup>2</sup>`],
      why: 'A semicircle is half a circle: ½ × πr².',
      meta: { v: 'semicircle' },
    }),
])

function m507part(): GameQuestion {
  const u = lenUnit()
  const semi = chance()
  const r = 2 * int(1, 6)
  const k = semi ? (r * r) / 2 : (r * r) / 4
  return gq({
    t: 'part',
    prompt: `Find the area of this ${semi ? 'semicircle' : 'quadrant'} in terms of π.`,
    diagram: D.circleShape(U(r, u), 'radius', semi ? 'semi' : 'quarter'),
    ...numOpts(k, [r * r, semi ? r : (r * r) / 2, 2 * k, r], (x) => piU(x, sq(u))),
    why: `A ${semi ? 'semicircle is half' : 'quadrant is a quarter'} of a circle: ${it('A')} = ${semi ? '½' : '¼'} ${TIMES} π ${TIMES} ${r}² = ${n(k)}π ${sq(u)}.`,
    meta: {},
  })
}

function m507back(): GameQuestion {
  const u = lenUnit()
  const r = int(2, 12)
  return gq({
    t: 'back',
    prompt: `A circle has an area of ${b(piU(r * r, sq(u)))}. What is its radius?`,
    ...numOpts(r, [(r * r) / 2, 2 * r, r * r], (x) => U(x, u)),
    why: `${it('A')} = π${it('r')}², so ${it('r')}² = ${r * r} and ${it('r')} = √${r * r} = ${r} ${u}.`,
    meta: {},
  })
}

const SET_507 = set('5.07', 'Area of a circle', 'Use A = πr² in terms of π or as an estimate, for circles, semicircles and quadrants.', [ARE], [
  mk('formula', m507formula),
  mk('exactR', m507exactR),
  mk('estimate', m507estimate),
  mk('exactD', m507exactD),
  mk('part', m507part, 2),
  mk('back', m507back, 2),
], { teacherNote: CALC_NOTE })

// ================================================================== 5.08 Perimeter and area of a sector

const FRACS: Record<number, [number, number]> = { 30: [1, 12], 36: [1, 10], 40: [1, 9], 45: [1, 8], 60: [1, 6], 72: [1, 5], 90: [1, 4], 120: [1, 3], 135: [3, 8], 144: [2, 5], 150: [5, 12], 180: [1, 2], 240: [2, 3], 270: [3, 4], 300: [5, 6] }
const fr = (deg: number) => frac(FRACS[deg][0], FRACS[deg][1])

function m508fraction(): GameQuestion {
  const deg = pick([30, 40, 45, 60, 72, 120, 135, 150, 240, 270, 300])
  // using 180 instead of 360 (double), the complement, half
  const wrong = [2 * deg, 360 - deg, deg / 2, deg + 30, deg - 15].filter((x) => FRACS[x] && x !== deg).map(fr)
  return gq({
    t: 'fraction',
    prompt: 'What fraction of a whole circle is this sector?',
    diagram: sector(deg, ''),
    correct: fr(deg),
    wrong: [...wrong, ...[90, 180, 60, 120, 45].filter((x) => x !== deg).map(fr)],
    why: `A full turn is 360°, so the sector is ${deg}/360 = ${FRACS[deg][0]}/${FRACS[deg][1]} of the circle.`,
    meta: {},
  })
}

/** an angle and radius for which (angle ÷ 360) × top is a whole number of π */
function sectorFits(top: (r: number) => number): { deg: number; r: number; k: number } {
  for (;;) {
    const deg = pick([45, 60, 90, 120, 180, 270, 30, 240])
    const r = int(2, 12)
    const k = (deg * top(r)) / 360
    if (Number.isInteger(k) && k >= 2) return { deg, r, k }
  }
}

function m508arc(): GameQuestion {
  const u = lenUnit()
  const { deg, r, k } = sectorFits((r) => 2 * r)
  const wholeC = 2 * r
  return gq({
    t: 'arc',
    prompt: 'Find the length of the curved edge (the arc) of this sector, in terms of π.',
    diagram: sector(deg, U(r, u)),
    // the whole circumference, using r instead of 2r, the sector's area
    ...numOpts(k, [wholeC, k / 2, (deg * r * r) / 360, 2 * k], (x) => piU(x, u)),
    why: `${it('l')} = ${deg}/360 ${TIMES} 2π ${TIMES} ${r} = ${FRACS[deg][0]}/${FRACS[deg][1]} ${TIMES} ${wholeC}π = ${n(k)}π ${u}.`,
    meta: {},
  })
}

function m508area(): GameQuestion {
  const u = lenUnit()
  const { deg, r, k } = sectorFits((r) => r * r)
  return gq({
    t: 'area',
    prompt: 'Find the area of this sector in terms of π.',
    diagram: sector(deg, U(r, u)),
    // the whole circle, the arc length, angle ÷ 180
    ...numOpts(k, [r * r, (deg * 2 * r) / 360, 2 * k, k / 2], (x) => piU(x, sq(u))),
    why: `${it('A')} = ${deg}/360 ${TIMES} π ${TIMES} ${r}² = ${FRACS[deg][0]}/${FRACS[deg][1]} ${TIMES} ${r * r}π = ${n(k)}π ${sq(u)}.`,
    meta: {},
  })
}

function m508perimeter(): GameQuestion {
  const u = pick(['cm', 'm'])
  const { deg, r, k } = sectorFits((r) => 2 * r)
  const P = (a: number, c: number) => `(${n(a)}π + ${n(c)}) ${u}`
  return gq({
    t: 'perimeter',
    prompt: 'Find the perimeter of this sector in terms of π.',
    diagram: sector(deg, U(r, u)),
    correct: P(k, 2 * r),
    // forgot the radii, only one radius, used the whole circumference
    wrong: [piU(k, u), P(k, r), P(2 * r, 2 * r), P(2 * k, 2 * r), P(k, 4 * r)],
    why: `Perimeter = arc + 2 radii. Arc = ${deg}/360 ${TIMES} 2π ${TIMES} ${r} = ${n(k)}π. Perimeter = ${n(k)}π + ${r} + ${r} = (${n(k)}π + ${2 * r}) ${u}.`,
    meta: {},
  })
}

const SET_508 = set('5.08', 'Perimeter and area of a sector', 'A sector is (angle ÷ 360) of a circle: use it for arc lengths, perimeters and areas.', [LEN, ARE], [
  mk('fraction', m508fraction),
  mk('area', m508area),
  mk('arc', m508arc),
  mk('perimeter', m508perimeter, 2),
], { teacherNote: CALC_NOTE })

// ================================================================== 5.09 Area of a trapezium

function trap(): { a: number; b: number; h: number; A: number } {
  for (;;) {
    const a = int(2, 10)
    const bb = a + int(2, 8)
    const h = int(2, 10)
    if ((h * (a + bb)) % 2 === 0) return { a, b: bb, h, A: (h * (a + bb)) / 2 }
  }
}

function m509area(): GameQuestion {
  const u = lenUnit()
  const { a, b: bb, h, A } = trap()
  return gq({
    t: 'area',
    prompt: 'Find the area of this trapezium.',
    diagram: D.trapezium(a, bb, h, U(a, u), U(bb, u), U(h, u)),
    // forgot to halve, used only the longer side, added everything
    ...numOpts(A, [2 * A, bb * h, a * h, a + bb + h], (x) => U(x, sq(u))),
    why: `${it('A')} = ${frac('<i>h</i>', 2)}(${it('a')} + ${it('b')}) = ${h} ${DIVIDE} 2 ${TIMES} (${a} + ${bb}) = ${A} ${sq(u)}.`,
    meta: {},
  })
}

function m509words(): GameQuestion {
  const u = 'm'
  const { a, b: bb, h, A } = trap()
  const thing = pick(['garden bed', 'paddock', 'deck', 'car park'])
  return gq({
    t: 'words',
    prompt: `A ${thing} is a trapezium with parallel sides ${U(a, u)} and ${U(bb, u)} long, which are ${U(h, u)} apart. What is its area?`,
    ...numOpts(A, [2 * A, a * bb * h, (a + bb) / 2 + h, a + bb + h], (x) => U(x, sq(u))),
    why: `${it('A')} = ${h} ${DIVIDE} 2 ${TIMES} (${a} + ${bb}) = ${A} m².`,
    meta: {},
  })
}

const m509formula = oneOf([
  () =>
    gq({
      t: 'formula',
      prompt: `A trapezium has parallel sides ${it('a')} and ${it('b')} and perpendicular height ${it('h')}. Which formula gives its area?`,
      correct: `${it('A')} = ${frac('<i>h</i>', 2)}(${it('a')} + ${it('b')})`,
      wrong: [`${it('A')} = ${it('h')}(${it('a')} + ${it('b')})`, `${it('A')} = ${frac(1, 2)}${it('abh')}`, `${it('A')} = ${it('h')} + ${it('a')} + ${it('b')}`],
      why: 'Average the parallel sides, then multiply by the height: A = h/2 × (a + b).',
      meta: { v: 'formula' },
    }),
  () =>
    gq({
      t: 'formula',
      prompt: `In the trapezium formula ${it('A')} = ${frac('<i>h</i>', 2)}(${it('a')} + ${it('b')}), what are ${it('a')} and ${it('b')}?`,
      correct: 'the parallel sides',
      wrong: ['the slanted sides', 'the diagonals', 'the base and the height'],
      why: 'a and b are the two parallel sides; h is the perpendicular distance between them.',
      meta: { v: 'ab' },
    }),
  () =>
    gq({
      t: 'formula',
      prompt: `In the trapezium formula ${it('A')} = ${frac('<i>h</i>', 2)}(${it('a')} + ${it('b')}), what is ${it('h')}?`,
      correct: 'the perpendicular height',
      wrong: ['a slanted side', 'half the height', 'the longer parallel side'],
      why: 'h is the perpendicular height: the distance between the parallel sides, at right angles to them.',
      meta: { v: 'h' },
    }),
])

function m509height(): GameQuestion {
  const u = lenUnit()
  const { a, b: bb, h, A } = trap()
  return gq({
    t: 'height',
    prompt: `A trapezium has an area of ${b(U(A, sq(u)))} and parallel sides ${b(U(a, u))} and ${b(U(bb, u))}. What is its perpendicular height?`,
    // forgot the half, divided by one side only
    ...numOpts(h, [A / (a + bb), (2 * A) / bb, A - a - bb, 2 * h], (x) => U(x, u)),
    why: `${h} ${DIVIDE} 2 ${TIMES} (${a} + ${bb}) = ${A}: the average of the parallel sides is ${n((a + bb) / 2)}, and ${A} ${DIVIDE} ${n((a + bb) / 2)} = ${h} ${u}.`,
    meta: {},
  })
}

const SET_509 = set('5.09', 'Area of a trapezium', 'Use A = h/2 (a + b), where a and b are the parallel sides and h the perpendicular height.', [ARE], [
  mk('formula', m509formula),
  mk('area', m509area),
  mk('words', m509words),
  mk('height', m509height, 2),
])

// ================================================================== 5.10 Areas of kites and rhombuses

function diags(): { x: number; y: number; A: number } {
  for (;;) {
    const x = int(4, 16)
    const y = int(4, 16)
    if ((x * y) % 2 === 0 && x !== y) return { x, y, A: (x * y) / 2 }
  }
}

function m510shape(kite: boolean): GameQuestion {
  const u = lenUnit()
  const { x, y, A } = diags()
  const name = kite ? 'kite' : 'rhombus'
  return gq({
    t: name,
    prompt: `Find the area of this ${name}.`,
    diagram: D.diagonalsShape(x, y, U(x, u), U(y, u), kite),
    // forgot to halve, added, halved twice
    ...numOpts(A, [x * y, x + y, (x * y) / 4, 2 * (x + y)], (v) => U(v, sq(u))),
    why: `${it('A')} = ½${it('xy')} = ½ ${TIMES} ${x} ${TIMES} ${y} = ${A} ${sq(u)}.`,
    meta: {},
  })
}

const m510formula = () =>
  gq({
    t: 'formula',
    prompt: `The diagonals of a ${pick(['kite', 'rhombus'])} are ${it('x')} and ${it('y')}. Which formula gives its area?`,
    correct: `${it('A')} = ${frac(1, 2)}${it('xy')}`,
    wrong: [`${it('A')} = ${it('xy')}`, `${it('A')} = 2${it('xy')}`, `${it('A')} = ${it('x')} + ${it('y')}`],
    why: 'The shape is half of the rectangle around it, which measures x by y: A = ½xy.',
    meta: { v: 'kite' },
  })

function m510back(): GameQuestion {
  const u = lenUnit()
  const { x, y, A } = diags()
  const name = pick(['kite', 'rhombus'])
  return gq({
    t: 'back',
    prompt: `A ${name} has an area of ${b(U(A, sq(u)))} and one diagonal ${b(U(x, u))} long. How long is the other diagonal?`,
    ...numOpts(y, [A / x, A - x, 2 * A], (v) => U(v, u)),
    why: `½ ${TIMES} ${x} ${TIMES} ${it('y')} = ${A}, so ${x} ${TIMES} ${it('y')} = ${2 * A} and ${it('y')} = ${2 * A} ${DIVIDE} ${x} = ${y} ${u}.`,
    meta: {},
  })
}

const SET_510 = set('5.10', 'Areas of kites and rhombuses', 'Use A = ½xy, where x and y are the lengths of the diagonals.', [ARE], [
  mk('formula', m510formula),
  mk('kite', () => m510shape(true)),
  mk('rhombus', () => m510shape(false)),
  mk('back', m510back, 2),
])

// ================================================================== 5.11, 5.12 revision of Year 7 volume

const SET_511 = set('5.11', 'Metric units of volume', 'Choose units for volume and convert between mm³, cm³ and m³.', [VOL], [
  R7('8.10', 'fact'),
  R7('8.10', 'unit'),
  R7('8.10', 'down'),
  R7('8.10', 'up'),
])
const SET_512 = set('5.12', 'Volume of a prism', 'Use V = Ah: the area of the cross-section times the height (length) of the prism.', [VOL], [
  R7('8.11', 'prism'),
  R7('8.12', 'Ah'),
  R7('8.12', 'story'),
  R7('8.12', 'back'),
])

// ================================================================== 5.13 Volume of a cylinder

function m513exact(): GameQuestion {
  const u = pick(['cm', 'm'])
  const r = int(2, 7)
  const h = int(2, 12)
  return gq({
    t: 'exact',
    prompt: 'Find the volume of this cylinder in terms of π.',
    diagram: D.cylinder(r, h, U(r, u), U(h, u)),
    note: NOT_TO_SCALE,
    // 2r instead of r², forgot to square, squared the diameter
    ...numOpts(r * r * h, [2 * r * h, r * h, 4 * r * r * h], (k) => piU(k, cu(u))),
    why: `${it('V')} = π${it('r')}²${it('h')} = π ${TIMES} ${r}² ${TIMES} ${h} = ${r * r * h}π ${cu(u)}.`,
    meta: {},
  })
}

function m513diameter(): GameQuestion {
  const u = pick(['cm', 'm'])
  const r = int(2, 6)
  const d = 2 * r
  const h = int(2, 10)
  return gq({
    t: 'diameter',
    prompt: 'Find the volume of this cylinder in terms of π.',
    diagram: D.cylinder(r, h, U(d, u), U(h, u), true),
    note: NOT_TO_SCALE,
    ...numOpts(r * r * h, [d * d * h, d * h, r * h], (k) => piU(k, cu(u))),
    why: `The radius is ${d} ${DIVIDE} 2 = ${r}. ${it('V')} = π ${TIMES} ${r}² ${TIMES} ${h} = ${r * r * h}π ${cu(u)}.`,
    meta: {},
  })
}

function m513estimate(): GameQuestion {
  const u = 'cm'
  const r = pick([2, 3, 4, 5, 10])
  const h = pick([2, 3, 4, 5, 10])
  const V = 3 * r * r * h
  return gq({
    t: 'estimate',
    prompt: 'Estimate the volume of this cylinder. Use π ≈ 3.',
    diagram: D.cylinder(r, h, U(r, u), U(h, u)),
    note: NOT_TO_SCALE,
    ...numOpts(V, [9 * r * r * h, 6 * r * h, 3 * r * h, r * r * h], (x) => U(x, cu(u))),
    why: `${it('V')} = π${it('r')}²${it('h')} ≈ 3 ${TIMES} ${r}² ${TIMES} ${h} = 3 ${TIMES} ${r * r} ${TIMES} ${h} = ${V} cm³.`,
    meta: {},
  })
}

const m513formula = () =>
  gq({
    t: 'formula',
    prompt: `Which formula gives the volume of a cylinder with radius ${it('r')} and height ${it('h')}?`,
    correct: `${it('V')} = π${it('r')}<sup>2</sup>${it('h')}`,
    wrong: [`${it('V')} = 2π${it('rh')}`, `${it('V')} = π${it('r')}<sup>2</sup> + ${it('h')}`, `${it('V')} = π${it('rh')}`],
    why: 'A cylinder is like a prism: V = Ah, and the base is a circle with A = πr².',
    meta: { v: 'cylinder' },
  })

const SET_513 = set('5.13', 'Volume of a cylinder', 'Use V = πr²h, in terms of π or as an estimate.', [VOL], [
  mk('formula', m513formula),
  mk('exact', m513exact),
  mk('estimate', m513estimate),
  mk('diameter', m513diameter, 2),
], { teacherNote: CALC_NOTE })

// ================================================================== 5.14 revision: volume and capacity

function m514litres(): GameQuestion {
  let l: number, w: number, h: number
  // inside measurements whose volume is a whole number of litres (1000 cm³ = 1 L)
  do {
    l = pick([20, 25, 30, 40, 50, 60])
    w = pick([10, 20, 25, 30, 40])
    h = pick([10, 20, 30, 40])
  } while ((l * w * h) % 1000 !== 0 || l * w * h > 96000)
  const cm3 = l * w * h
  const L = cm3 / 1000
  const thing = pick(['fish tank', 'storage box', 'cooler box', 'planter box'])
  return gq({
    t: 'litres',
    prompt: `A ${thing} is ${l} cm long, ${w} cm wide and ${h} cm deep inside. How many litres does it hold?`,
    correct: `${num(L)} L`,
    // not converted, divided by 100 or 10 instead of 1000; a spare
    wrong: [cm3, cm3 / 100, cm3 / 10, 2 * L].map((x) => `${num(x)} L`),
    why: `V = ${l} × ${w} × ${h} = ${num(cm3)} cm³, and 1000 cm³ = 1 L, so it holds ${num(L)} L.`,
    meta: { l, w, h },
  })
}

const SET_514 = set('5.14', 'Volume and capacity', 'Convert between mL, L, kL and ML, and use 1 cm³ = 1 mL, 1000 cm³ = 1 L and 1 m³ = 1 kL.', [VOL], [
  R7('8.13', 'fact'),
  R7('8.13', 'holds'),
  R7('8.13', 'down'),
  R7('8.13', 'up'),
  R7('8.13', 'unit'),
  mk('litres', m514litres, 2),
])

export const NCM8_CH5: GameChapter = {
  id: 'ncm8-ch5',
  number: 5,
  title: 'Area and volume',
  ref: 'NCM 8 Chapter 5',
  strand: 'Measurement and space',
  outcomes: [LEN, ARE, VOL],
  sets: [SET_501, SET_502, SET_503, SET_504, SET_505, SET_506, SET_507, SET_508, SET_509, SET_510, SET_511, SET_512, SET_513, SET_514],
  colour: 95,
  topics: [],
}
