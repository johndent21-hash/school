// Class games for New Century Maths 7 (3rd edition, Cengage) Chapter 8, Area and volume: one set of
// quick questions for each exercise, 8.01 to 8.13.
//
// The questions are the site's own. They practise the core skill of each exercise, but none of the
// textbook's wording or numbers are copied. Every question is ONE step, uses friendly numbers and is
// meant to be done in the head in about 15 seconds (no calculator), with four choices. The wrong
// choices are the answers students get from the usual mistakes (wrong operation, wrong direction,
// perimeter for area, forgetting to halve, the slanted side for the height, and so on).
//
// Syllabus: NSW Mathematics K–10 (2022), Stage 4. Length MA4-LEN-C-01 (perimeter, circumference),
// Area MA4-ARE-C-01, Volume MA4-VOL-C-01 (views and cross-sections of prisms, V = Ah, capacity).
// Left out on purpose: questions on the meaning of metric prefixes (8.01), which the syllabus places
// in Stage 5 (MA5-MAG-C-01), and anything that needs a calculator or more than one step.
import type { GameChapter, GameQuestion, GameSet } from '@/lib/game/types'
import { D, D2, DG, DIVIDE, MINUS, NOT_TO_SCALE, TIMES, U, chance, clean, cu, frac, gq, int, mk, num, numOpts, pick, sample, shuffle, sq } from './helpers'

const LEN = 'MA4-LEN-C-01'
const ARE = 'MA4-ARE-C-01'
const VOL = 'MA4-VOL-C-01'

const big = (s: string) => `<div class="big">${s}</div>`
const b = (s: string) => `<b>${s}</b>`
/** a number that stays on one line: 13 000 with a non-breaking space */
const n = (x: number) => num(x).replace(/ /g, ' ')
const BOX = '&#9633;'
const it = (s: string) => `<i>${s}</i>`
const HALF = frac(1, 2)
const lenUnit = () => pick(['cm', 'm', 'mm'])
const cap = (s: string) => s[0].toUpperCase() + s.slice(1)
/** one of a fixed list of questions (definitions, formulas): each can come up once in a game */
const oneOf = (list: (() => GameQuestion)[]) => () => pick(list)()

// ================================================================== 8.01 The metric system

interface Conv {
  from: string
  to: string
  f: number // 1 from = f to
  fromName: string
  toName: string
  kind: 'length' | 'mass' | 'capacity' | 'time'
}
/** One arrow of the textbook's conversion diagrams each: large unit → the next unit down (and m → mm). */
const CONVS: Conv[] = [
  { from: 'km', to: 'm', f: 1000, fromName: 'kilometres', toName: 'metres', kind: 'length' },
  { from: 'm', to: 'cm', f: 100, fromName: 'metres', toName: 'centimetres', kind: 'length' },
  { from: 'cm', to: 'mm', f: 10, fromName: 'centimetres', toName: 'millimetres', kind: 'length' },
  { from: 'm', to: 'mm', f: 1000, fromName: 'metres', toName: 'millimetres', kind: 'length' },
  { from: 't', to: 'kg', f: 1000, fromName: 'tonnes', toName: 'kilograms', kind: 'mass' },
  { from: 'kg', to: 'g', f: 1000, fromName: 'kilograms', toName: 'grams', kind: 'mass' },
  { from: 'g', to: 'mg', f: 1000, fromName: 'grams', toName: 'milligrams', kind: 'mass' },
  { from: 'kL', to: 'L', f: 1000, fromName: 'kilolitres', toName: 'litres', kind: 'capacity' },
  { from: 'L', to: 'mL', f: 1000, fromName: 'litres', toName: 'millilitres', kind: 'capacity' },
]
const TIME_CONVS: Conv[] = [
  { from: 'h', to: 'min', f: 60, fromName: 'hours', toName: 'minutes', kind: 'time' },
  { from: 'min', to: 's', f: 60, fromName: 'minutes', toName: 'seconds', kind: 'time' },
  { from: 'days', to: 'h', f: 24, fromName: 'days', toName: 'hours', kind: 'time' },
]
const singular = (name: string) => name.replace(/s$/, '')

/** "1 km = ▢ m" */
function m801fact(): GameQuestion {
  const c = pick([...CONVS, ...TIME_CONVS])
  const wrong = c.kind === 'time' ? (c.f === 24 ? [12, 60, 100] : [100, 24, 10]) : c.f === 10 ? [100, 1000, 5] : c.f === 100 ? [10, 1000, 60] : [100, 10, 10000]
  const o = numOpts(c.f, wrong, n)
  const one = c.from === 'days' ? 'day' : c.from
  return gq({
    t: 'fact',
    prompt: `Complete:${big(`1 ${one} = ${BOX} ${c.to}`)}`,
    ...o,
    why: `There are ${n(c.f)} ${c.toName} in 1 ${singular(c.fromName)}.`,
    meta: { from: c.from, to: c.to },
  })
}

/** Large unit → small unit: multiply. */
function m801down(): GameQuestion {
  const c = pick(CONVS)
  const v = chance(0.6) ? int(2, 9) : chance(0.5) ? pick([12, 15, 20, 25, 40]) : pick([0.5, 1.5, 2.5, 3.5, 4.5, 6.4, 7.2])
  const ans = clean(v * c.f)
  const o = numOpts(ans, [v * c.f * 10, (v * c.f) / 10, v / c.f, (v * c.f) / 100], (x) => U(x, c.to))
  return gq({
    t: 'down',
    prompt: `Convert ${b(U(v, c.from))} to ${c.toName}.`,
    ...o,
    why: `1 ${c.from} = ${n(c.f)} ${c.to}. Large unit to small unit, so multiply: ${n(v)} ${TIMES} ${n(c.f)} = ${n(ans)} ${c.to}.`,
    meta: { v, from: c.from, to: c.to },
  })
}

/** Small unit → large unit: divide. */
function m801up(): GameQuestion {
  const c = pick(CONVS)
  // the answer first, so the number to convert divides cleanly
  const ans = chance(0.65) ? int(2, 9) : pick([1.5, 2.5, 4.5, 12, 25])
  const v = clean(ans * c.f)
  const o = numOpts(ans, [ans * 10, ans / 10, v * c.f, ans * 100], (x) => U(x, c.from))
  return gq({
    t: 'up',
    prompt: `Convert ${b(U(v, c.to))} to ${c.fromName}.`,
    ...o,
    why: `${n(c.f)} ${c.to} = 1 ${c.from}. Small unit to large unit, so divide: ${n(v)} ${DIVIDE} ${n(c.f)} = ${n(ans)} ${c.from}.`,
    meta: { v, from: c.to, to: c.from },
  })
}

/** Time is not base 10: hours ↔ minutes, minutes ↔ seconds, days ↔ hours. */
function m801time(): GameQuestion {
  const c = pick(TIME_CONVS)
  const k = c.f === 24 ? int(2, 4) : pick([2, 3, 4, 5, 10])
  if (chance(0.55)) {
    const ans = k * c.f
    const o = numOpts(ans, [k * 100, k * 10, c.f === 24 ? k * 60 : k * 24, ans + c.f], (x) => U(x, c.to))
    return gq({
      t: 'time',
      prompt: `Convert ${b(`${k} ${c.fromName}`)} to ${c.toName}.`,
      ...o,
      why: `1 ${singular(c.fromName)} = ${c.f} ${c.toName}, so ${k} ${TIMES} ${c.f} = ${ans} ${c.toName}.`,
      meta: { v: k, from: c.from, to: c.to },
    })
  }
  const v = k * c.f
  const o = numOpts(k, [v / 100, v / 10, k + 1, k * 2], (x) => `${n(x)} ${c.from}`)
  return gq({
    t: 'time',
    prompt: `Convert ${b(`${v} ${c.toName}`)} to ${c.fromName}.`,
    ...o,
    why: `${c.f} ${c.toName} = 1 ${singular(c.fromName)}, so ${v} ${DIVIDE} ${c.f} = ${k} ${c.fromName}.`,
    meta: { v, from: c.to, to: c.from },
  })
}

/** Which operation does the conversion need? */
function m801operation(): GameQuestion {
  const c = pick(CONVS)
  const down = chance()
  const right = `${down ? 'multiply' : 'divide'} by ${n(c.f)}`
  const other = c.f === 1000 ? 100 : c.f === 100 ? 1000 : 100
  return gq({
    t: 'operation',
    prompt: `To convert ${b(down ? c.fromName : c.toName)} to ${b(down ? c.toName : c.fromName)}, you…`,
    correct: right,
    wrong: [`${down ? 'divide' : 'multiply'} by ${n(c.f)}`, `${down ? 'multiply' : 'divide'} by ${n(other)}`, `${down ? 'divide' : 'multiply'} by ${n(other)}`],
    why: `1 ${c.from} = ${n(c.f)} ${c.to}. ${down ? 'Large unit to small unit: multiply.' : 'Small unit to large unit: divide.'}`,
    meta: { from: down ? c.from : c.to, to: down ? c.to : c.from },
  })
}

const UNIT_ITEMS: { kind: 'length' | 'mass' | 'capacity'; units: string[]; items: [string, string][] }[] = [
  {
    kind: 'length',
    units: ['mm', 'cm', 'm', 'km'],
    items: [
      ['the thickness of a 20-cent coin', 'mm'],
      ['the length of an ant', 'mm'],
      ['the length of a pencil', 'cm'],
      ['the width of this page', 'cm'],
      ['the length of a bus', 'm'],
      ['the height of a flagpole', 'm'],
      ['the distance from Sydney to Brisbane', 'km'],
      ['the length of the Murray River', 'km'],
    ],
  },
  {
    kind: 'mass',
    units: ['mg', 'g', 'kg', 't'],
    items: [
      ['the mass of a grain of rice', 'mg'],
      ['the mass of an apple', 'g'],
      ['the mass of a mobile phone', 'g'],
      ['the mass of a Year 7 student', 'kg'],
      ['the mass of a large dog', 'kg'],
      ['the mass of a loaded truck', 't'],
      ['the mass of an elephant', 't'],
    ],
  },
  {
    kind: 'capacity',
    units: ['mL', 'L', 'kL', 'ML'],
    items: [
      ['the medicine on a teaspoon', 'mL'],
      ['the drink in a can', 'mL'],
      ['the water in a full bucket', 'L'],
      ['the petrol in a car’s tank', 'L'],
      ['the water a house uses in a year', 'kL'],
      ['the water in a large dam', 'ML'],
    ],
  },
]

/** The sensible unit for a measurement. */
function m801unit(): GameQuestion {
  const g = pick(UNIT_ITEMS)
  const [what, unit] = pick(g.items)
  return gq({
    t: 'unit',
    prompt: `Which unit is best for measuring ${b(what)}?`,
    correct: unit,
    inOrder: g.units,
    why: `${cap(what)} is best measured in ${unit}.`,
    meta: { what, unit },
  })
}

const SIZES: { what: string; right: string; wrong: string[] }[] = [
  { what: 'the height of a Year 7 student', right: '150 cm', wrong: ['15 cm', '15 m', '150 m'] },
  { what: 'the length of a family car', right: '4 m', wrong: ['4 cm', '40 m', '4 km'] },
  { what: 'the height of a classroom door', right: '2 m', wrong: ['2 cm', '20 m', '200 mm'] },
  { what: 'the length of a new pencil', right: '18 cm', wrong: ['18 mm', '18 m', '180 cm'] },
  { what: 'the mass of a mobile phone', right: '200 g', wrong: ['200 mg', '200 kg', '2 t'] },
  { what: 'the mass of a Year 7 student', right: '45 kg', wrong: ['45 g', '450 kg', '4.5 t'] },
  { what: 'the mass of a small car', right: '1 t', wrong: ['1 kg', '100 g', '100 t'] },
  { what: 'the capacity of a drink bottle', right: '600 mL', wrong: ['6 mL', '60 L', '600 L'] },
  { what: 'the capacity of a kitchen bucket', right: '10 L', wrong: ['10 mL', '100 mL', '10 kL'] },
  { what: 'the length of a football field', right: '100 m', wrong: ['100 cm', '10 km', '100 km'] },
]

/** The most reasonable size. */
function m801size(): GameQuestion {
  const s = pick(SIZES)
  return gq({
    t: 'size',
    prompt: `Which is the most likely measurement for ${b(s.what)}?`,
    correct: s.right,
    wrong: s.wrong,
    why: `${cap(s.what)} is about ${s.right}. The others are far too small or too big.`,
    meta: { what: s.what },
  })
}

/** Which of four lengths is the longest (or shortest), after one conversion each? */
function m801compare(): GameQuestion {
  // four lengths in centimetres, all different, written in mixed units
  const sets: number[][] = [
    [100, 90, 80, 50],
    [200, 150, 120, 30],
    [300, 250, 40, 35],
    [50, 45, 30, 25],
  ]
  const cm = pick(sets)
  const longest = chance()
  const forms = shuffle([
    (x: number) => U(x / 100, 'm'),
    (x: number) => U(x, 'cm'),
    (x: number) => U(x * 10, 'mm'),
    (x: number) => U(x, 'cm'),
  ])
  const shown = shuffle(cm).map((x, i) => ({ x, s: forms[i](x) }))
  const target = longest ? Math.max(...cm) : Math.min(...cm)
  const right = shown.find((o) => o.x === target)!
  return gq({
    t: 'compare',
    prompt: `Which length is the ${b(longest ? 'longest' : 'shortest')}?`,
    correct: right.s,
    wrong: shown.filter((o) => o !== right).map((o) => o.s),
    why: `In centimetres: ${shown.map((o) => (o.s.endsWith('cm') ? o.s : `${o.s} = ${n(o.x)} cm`)).join(', ')}. The ${longest ? 'longest' : 'shortest'} is ${right.s}.`,
    meta: { cm: shown.map((o) => o.x), longest },
  })
}

const SET_801: GameSet = {
  id: 'ncm7-8.01',
  exercise: '8.01',
  ref: 'NCM 7 Ex 8.01',
  title: 'The metric system',
  focus: 'Convert between metric units of length, mass, capacity and time: multiply for large to small units, divide for small to large.',
  outcomes: [VOL],
  teacherNote:
    'Converting units of length, mass and time is revision of earlier stages (it has no Stage 4 content point of its own); kilolitres and megalitres are Stage 4 Volume. The textbook’s questions on the meaning of prefixes are left out because the syllabus places prefixes in Stage 5.',
  makers: [
    mk('fact', m801fact),
    mk('down', m801down),
    mk('up', m801up),
    mk('time', m801time),
    mk('operation', m801operation),
    mk('unit', m801unit),
    mk('size', m801size, 2),
    mk('compare', m801compare, 2),
  ],
}

// ================================================================== 8.02 Perimeter

function m802square(): GameQuestion {
  const u = lenUnit()
  const s = pick([3, 5, 6, 7, 8, 9, 10, 11, 12, 15, 20, 25])
  return gq({
    t: 'square',
    prompt: 'Find the perimeter of this square.',
    diagram: D.rectangle(s, s, `${s} ${u}`, '', true),
    ...numOpts(4 * s, [s * s, 2 * s, 3 * s, s + 4], (x) => U(x, u)),
    why: `Perimeter of a square = 4${it('s')} = 4 ${TIMES} ${s} = ${4 * s} ${u}.`,
    meta: { s, u },
  })
}

function m802rect(): GameQuestion {
  const u = lenUnit()
  let l = 0
  let w = 0
  do {
    l = int(5, 15)
    w = int(2, 9)
  } while (w >= l || l > 4 * w || l * w === 2 * (l + w))
  const P = 2 * (l + w)
  return gq({
    t: 'rect',
    prompt: 'Find the perimeter of this rectangle.',
    diagram: D.rectangle(l, w, `${l} ${u}`, `${w} ${u}`),
    ...numOpts(P, [l + w, l * w, 2 * l + w, l + 2 * w], (x) => U(x, u)),
    why: `Perimeter of a rectangle = 2(${it('l')} + ${it('w')}) = 2 ${TIMES} (${l} + ${w}) = ${P} ${u}.`,
    meta: { l, w, u },
  })
}

/** side lengths that make a real triangle (and a clear drawing) */
const TRIANGLES: [number, number, number][] = [
  [3, 4, 5], [4, 5, 6], [4, 6, 7], [5, 7, 8], [6, 8, 10], [5, 5, 6], [7, 8, 9], [6, 7, 10], [8, 9, 10], [9, 10, 12], [5, 12, 13], [6, 9, 11],
]

function m802triangle(): GameQuestion {
  const u = lenUnit()
  const [a, b2, c] = shuffle(pick(TRIANGLES))
  const P = a + b2 + c
  return gq({
    t: 'triangle',
    prompt: 'Find the perimeter of this triangle.',
    diagram: DG.triSides(a, b2, c, [`${a} ${u}`, `${b2} ${u}`, `${c} ${u}`]),
    ...numOpts(P, [a + b2, b2 + c, P + 10, a + c], (x) => U(x, u)),
    why: `Add the three sides: ${a} + ${b2} + ${c} = ${P} ${u}.`,
    meta: { sides: [a, b2, c], u },
  })
}

/** [each equal side, base] */
const ISOSCELES: [number, number][] = [[5, 6], [5, 8], [6, 4], [7, 10], [8, 6], [9, 4], [10, 12], [13, 10], [10, 5], [12, 7]]

function m802isosceles(): GameQuestion {
  const u = lenUnit()
  const [e, base] = pick(ISOSCELES)
  const P = 2 * e + base
  return gq({
    t: 'isosceles',
    prompt: 'The marks show two equal sides. Find the perimeter of this triangle.',
    diagram: DG.triSides(e, e, base, [`${e} ${u}`, '', `${base} ${u}`], [1, 1, 0]),
    ...numOpts(P, [e + base, e + 2 * base, e * base, 3 * e], (x) => U(x, u)),
    why: `The two marked sides are both ${e} ${u}: ${e} + ${e} + ${base} = ${P} ${u}.`,
    meta: { e, base, u },
  })
}

function m802regular(): GameQuestion {
  const u = lenUnit()
  const sides = pick([3, 5, 6])
  const s = int(2, 12)
  const P = sides * s
  return gq({
    t: 'regular',
    prompt: `Every side of this shape is ${b(U(s, u))} long. Find its perimeter.`,
    diagram: DG.regularPolygon(sides, `${s} ${u}`),
    ...numOpts(P, [4 * s, (sides + 1) * s, (sides - 1) * s, s * s, sides + s], (x) => U(x, u)),
    why: `There are ${sides} equal sides: ${sides} ${TIMES} ${s} = ${P} ${u}.`,
    meta: { sides, s, u },
  })
}

function m802side(): GameQuestion {
  const u = lenUnit()
  const s = pick([3, 5, 6, 7, 8, 9, 10, 11, 12, 15, 20, 25])
  const P = 4 * s
  return gq({
    t: 'side',
    prompt: `A square has a perimeter of ${b(U(P, u))}. How long is each side?`,
    ...numOpts(s, [P / 2, P - 4, 4 * P, s + 4], (x) => U(x, u)),
    why: `A square has 4 equal sides: ${P} ${DIVIDE} 4 = ${s} ${u}.`,
    meta: { P, u },
  })
}

const PERIMETER_STORIES: { ask: (l: string, w: string) => string; u: string; pairs: [number, number][] }[] = [
  { ask: (l, w) => `A rectangular garden is ${l} long and ${w} wide. How much fencing goes all the way around it?`, u: 'm', pairs: [[12, 8], [30, 20], [25, 15], [40, 10], [9, 6], [15, 10], [50, 30], [20, 5]] },
  { ask: (l, w) => `A photo is ${l} long and ${w} wide. How long is the frame around its edge?`, u: 'cm', pairs: [[30, 20], [15, 10], [25, 20], [18, 12], [20, 15], [12, 8]] },
  { ask: (l, w) => `A rectangular pool is ${l} long and ${w} wide. How far is one lap around its edge?`, u: 'm', pairs: [[25, 10], [20, 8], [12, 5], [50, 20], [15, 6]] },
]

function m802story(): GameQuestion {
  const st = pick(PERIMETER_STORIES)
  const [l, w] = pick(st.pairs)
  const P = 2 * (l + w)
  return gq({
    t: 'story',
    prompt: st.ask(b(U(l, st.u)), b(U(w, st.u))),
    ...numOpts(P, [l + w, l * w, 2 * l + w, l + 2 * w], (x) => U(x, st.u)),
    why: `It is the perimeter: 2 ${TIMES} (${l} + ${w}) = ${P} ${st.u}.`,
    meta: { l, w, u: st.u },
  })
}

const m802meaning = oneOf([
  () =>
    gq({
      t: 'meaning',
      prompt: `The ${b('perimeter')} of a shape is…`,
      correct: 'the distance around it',
      wrong: ['the surface inside it', 'the space it takes up', 'the length of its longest side'],
      why: 'Perimeter is the distance around a shape: the sum of the lengths of its sides.',
      meta: { v: 'definition' },
    }),
  () =>
    gq({
      t: 'meaning',
      prompt: `Which gives the perimeter of a rectangle with length ${it('l')} and width ${it('w')}?`,
      correct: `2(${it('l')} + ${it('w')})`,
      wrong: [it('lw'), `${it('l')} + ${it('w')}`, `2${it('lw')}`],
      why: `Perimeter of a rectangle = ${it('l')} + ${it('w')} + ${it('l')} + ${it('w')} = 2(${it('l')} + ${it('w')}).`,
      meta: { v: 'rectangle formula' },
    }),
  () =>
    gq({
      t: 'meaning',
      prompt: `Which gives the perimeter of a square with sides of length ${it('s')}?`,
      correct: `4${it('s')}`,
      wrong: [`${it('s')}<sup>2</sup>`, `2${it('s')}`, `${it('s')} + 4`],
      why: `Perimeter of a square = ${it('s')} + ${it('s')} + ${it('s')} + ${it('s')} = 4${it('s')}.`,
      meta: { v: 'square formula' },
    }),
  () =>
    gq({
      t: 'meaning',
      prompt: 'The sides of a shape are measured in metres. Its perimeter is measured in…',
      correct: 'm',
      inOrder: ['m', 'm²', 'm³', 'L'],
      why: 'A perimeter is a length, so it is measured in metres, not square or cubic metres.',
      meta: { v: 'unit' },
    }),
])

const SET_802: GameSet = {
  id: 'ncm7-8.02',
  exercise: '8.02',
  ref: 'NCM 7 Ex 8.02',
  title: 'Perimeter',
  focus: 'Find the perimeter of squares, rectangles, triangles and shapes with equal sides by adding the side lengths.',
  outcomes: [LEN],
  makers: [
    mk('square', m802square),
    mk('rect', m802rect),
    mk('triangle', m802triangle),
    mk('regular', m802regular),
    mk('isosceles', m802isosceles),
    mk('story', m802story),
    mk('meaning', m802meaning),
    mk('side', m802side, 2),
  ],
}

// ================================================================== 8.03 Circumference of a circle

const PART_WHY = {
  radius: 'A radius runs from the centre of the circle to its edge.',
  diameter: 'A diameter runs from one side of the circle to the other, through the centre.',
  circumference: 'The circumference is the distance around the circle (its perimeter).',
}

function m803part(): GameQuestion {
  const part = pick(['radius', 'diameter', 'circumference'] as const)
  return gq({
    t: 'part',
    prompt: 'What is the coloured part of this circle called?',
    diagram: DG.circlePart(part),
    correct: part,
    inOrder: ['radius', 'diameter', 'circumference', 'centre'],
    why: PART_WHY[part],
    meta: { part },
  })
}

/** radius ↔ diameter */
function m803double(): GameQuestion {
  const u = lenUnit()
  if (chance()) {
    const r = pick([3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25])
    return gq({
      t: 'double',
      prompt: `The radius of this circle is ${b(U(r, u))}. What is its diameter?`,
      diagram: D.circleShape(`${r} ${u}`, 'radius'),
      ...numOpts(2 * r, [r / 2, r * r, 3 * r, r + 2], (x) => U(x, u)),
      why: `The diameter is double the radius: 2 ${TIMES} ${r} = ${2 * r} ${u}.`,
      meta: { given: 'radius', v: r, u },
    })
  }
  const d = pick([4, 6, 8, 10, 12, 14, 16, 18, 20, 30, 50])
  return gq({
    t: 'double',
    prompt: `The diameter of this circle is ${b(U(d, u))}. What is its radius?`,
    diagram: D.circleShape(`${d} ${u}`, 'diameter'),
    ...numOpts(d / 2, [2 * d, d / 4, 3 * d, d - 2], (x) => U(x, u)),
    why: `The radius is half the diameter: ${d} ${DIVIDE} 2 = ${d / 2} ${u}.`,
    meta: { given: 'diameter', v: d, u },
  })
}

/** "Estimate" means π ≈ 3, as in the textbook. */
function m803estimateD(): GameQuestion {
  const u = lenUnit()
  const d = pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30])
  const C = 3 * d
  return gq({
    t: 'estimateD',
    prompt: 'Estimate the circumference of this circle. Use π ≈ 3.',
    diagram: D.circleShape(`${d} ${u}`, 'diameter'),
    ...numOpts(C, [6 * d, d + 3, d * d, (3 * d) / 2, C + 3], (x) => U(x, u)),
    why: `${it('C')} = π${it('d')} ≈ 3 ${TIMES} ${d} = ${C} ${u}.`,
    meta: { d, u },
  })
}

function m803estimateR(): GameQuestion {
  const u = lenUnit()
  const r = pick([2, 3, 4, 5, 6, 7, 10, 20])
  const C = 6 * r
  return gq({
    t: 'estimateR',
    prompt: 'Estimate the circumference of this circle. Use π ≈ 3.',
    diagram: D.circleShape(`${r} ${u}`, 'radius'),
    ...numOpts(C, [3 * r, 3 * r * r, r + 6, 12 * r], (x) => U(x, u)),
    why: `${it('C')} = 2π${it('r')} ≈ 2 ${TIMES} 3 ${TIMES} ${r} = ${C} ${u}.`,
    meta: { r, u },
  })
}

const piU = (k: number, u: string) => `${n(k)}π ${u}`

function m803exactD(): GameQuestion {
  const u = lenUnit()
  const d = pick([3, 5, 6, 7, 8, 9, 10, 11, 12, 14, 20])
  return gq({
    t: 'exactD',
    prompt: 'Find the circumference of this circle in terms of π.',
    diagram: D.circleShape(`${d} ${u}`, 'diameter'),
    ...numOpts(d, [2 * d, d / 2, d * d], (k) => piU(k, u)),
    why: `${it('C')} = π${it('d')} = π ${TIMES} ${d} = ${d}π ${u}.`,
    meta: { d, u },
  })
}

function m803exactR(): GameQuestion {
  const u = lenUnit()
  const r = pick([3, 4, 5, 6, 7, 8, 9, 10, 12, 15])
  return gq({
    t: 'exactR',
    prompt: 'Find the circumference of this circle in terms of π.',
    diagram: D.circleShape(`${r} ${u}`, 'radius'),
    ...numOpts(2 * r, [r, r * r, 4 * r, r / 2], (k) => piU(k, u)),
    why: `${it('C')} = 2π${it('r')} = 2 ${TIMES} π ${TIMES} ${r} = ${2 * r}π ${u}.`,
    meta: { r, u },
  })
}

const m803formula = oneOf([
  () =>
    gq({
      t: 'formula',
      prompt: `Which formula gives the circumference of a circle with ${b('diameter')} ${it('d')}?`,
      correct: `${it('C')} = π${it('d')}`,
      wrong: [`${it('C')} = 2π${it('d')}`, `${it('C')} = π${it('d')}<sup>2</sup>`, `${it('C')} = ${it('d')} ${DIVIDE} π`],
      why: 'Circumference = π × diameter.',
      meta: { v: 'diameter' },
    }),
  () =>
    gq({
      t: 'formula',
      prompt: `Which formula gives the circumference of a circle with ${b('radius')} ${it('r')}?`,
      correct: `${it('C')} = 2π${it('r')}`,
      wrong: [`${it('C')} = π${it('r')}`, `${it('C')} = π${it('r')}<sup>2</sup>`, `${it('C')} = ${it('r')} ${DIVIDE} π`],
      why: 'The diameter is double the radius, so circumference = 2 × π × radius.',
      meta: { v: 'radius' },
    }),
])

const m803pi = oneOf([
  () =>
    gq({
      t: 'pi',
      prompt: 'For every circle, circumference ÷ diameter equals…',
      correct: 'π',
      wrong: ['2π', 'the radius', 'exactly 3'],
      why: 'Circumference ÷ diameter is the same number for every circle: π = 3.14…',
      meta: { v: 'ratio' },
    }),
  () =>
    gq({
      t: 'pi',
      prompt: 'The value of π is closest to…',
      correct: '3.14',
      inOrder: ['2.14', '3.14', '3.41', '31.4'],
      why: 'π = 3.141 592… It is a little more than 3.',
      meta: { v: 'value' },
    }),
  () =>
    gq({
      t: 'pi',
      prompt: 'The perimeter of a circle is called its…',
      correct: 'circumference',
      wrong: ['diameter', 'radius', 'area'],
      why: 'The circumference is the distance around a circle.',
      meta: { v: 'word' },
    }),
  () =>
    gq({
      t: 'pi',
      prompt: 'A wheel rolls along the ground for one full turn. The distance it travels equals the wheel’s…',
      correct: 'circumference',
      wrong: ['diameter', 'radius', 'area'],
      why: 'In one full turn, the whole edge of the wheel touches the ground once: its circumference.',
      meta: { v: 'wheel' },
    }),
  () =>
    gq({
      t: 'pi',
      prompt: 'The diameter of a circle is … its radius.',
      correct: 'double',
      wrong: ['half', 'the same as', 'π times'],
      why: 'A diameter is made of two radii end to end, so it is double the radius.',
      meta: { v: 'double' },
    }),
])

const SET_803: GameSet = {
  id: 'ncm7-8.03',
  exercise: '8.03',
  ref: 'NCM 7 Ex 8.03',
  title: 'Circumference of a circle',
  focus: 'Name the radius, diameter and circumference, and find a circumference with C = πd or C = 2πr: as an estimate (π ≈ 3) or in terms of π.',
  outcomes: [LEN],
  teacherNote: 'As in the textbook, estimates use π ≈ 3 and exact answers are left in terms of π. Decimal answers need the calculator’s π key, so they are left for the exercise.',
  makers: [
    mk('part', m803part),
    mk('double', m803double),
    mk('estimateD', m803estimateD),
    mk('exactD', m803exactD),
    mk('pi', m803pi),
    mk('formula', m803formula),
    mk('exactR', m803exactR, 2),
    mk('estimateR', m803estimateR, 2),
  ],
}

// ================================================================== 8.04 Metric units for area

interface AreaConv {
  from: string
  to: string
  f: number // 1 from = f to
  lengthF: number // the factor for the matching lengths: the usual mistake
  fromName: string
  toName: string
  fact: string
}
const AREA_CONVS: AreaConv[] = [
  { from: 'cm²', to: 'mm²', f: 100, lengthF: 10, fromName: 'square centimetres', toName: 'square millimetres', fact: '1 cm = 10 mm, so 1 cm² = 10 × 10 = 100 mm²' },
  { from: 'm²', to: 'cm²', f: 10000, lengthF: 100, fromName: 'square metres', toName: 'square centimetres', fact: '1 m = 100 cm, so 1 m² = 100 × 100 = 10 000 cm²' },
  { from: 'ha', to: 'm²', f: 10000, lengthF: 100, fromName: 'hectares', toName: 'square metres', fact: 'A hectare is a square 100 m by 100 m, so 1 ha = 100 × 100 = 10 000 m²' },
]

function m804fact(): GameQuestion {
  const c = pick(AREA_CONVS)
  return gq({
    t: 'fact',
    prompt: `Complete:${big(`1 ${c.from} = ${BOX} ${c.to}`)}`,
    ...numOpts(c.f, c.f === 100 ? [10, 1000, 10000] : [100, 1000, 1000000], n),
    why: `${c.fact}.`,
    meta: { from: c.from, to: c.to },
  })
}

function m804down(): GameQuestion {
  const c = pick(AREA_CONVS)
  const v = chance(0.7) ? int(2, 9) : pick([0.5, 1.5, 2.5, 7.5])
  const ans = clean(v * c.f)
  return gq({
    t: 'down',
    prompt: `Convert ${b(U(v, c.from))} to ${c.toName}.`,
    ...numOpts(ans, [v * c.lengthF, ans * 10, ans / 10, v / c.f], (x) => U(x, c.to)),
    why: `1 ${c.from} = ${n(c.f)} ${c.to}, so ${n(v)} ${TIMES} ${n(c.f)} = ${n(ans)} ${c.to}.`,
    meta: { v, from: c.from, to: c.to },
  })
}

function m804up(): GameQuestion {
  const c = pick(AREA_CONVS)
  const ans = chance(0.7) ? int(2, 9) : pick([1.5, 2.5, 12, 20])
  const v = clean(ans * c.f)
  return gq({
    t: 'up',
    prompt: `Convert ${b(U(v, c.to))} to ${c.fromName}.`,
    ...numOpts(ans, [v / c.lengthF, ans * 10, ans / 10, v * c.f], (x) => U(x, c.from)),
    why: `${n(c.f)} ${c.to} = 1 ${c.from}, so ${n(v)} ${DIVIDE} ${n(c.f)} = ${n(ans)} ${c.from}.`,
    meta: { v, from: c.to, to: c.from },
  })
}

function m804operation(): GameQuestion {
  const c = pick(AREA_CONVS)
  const down = chance()
  const op = (mul: boolean, k: number) => `${mul ? 'multiply' : 'divide'} by ${n(k)}`
  return gq({
    t: 'operation',
    prompt: `To convert ${b(down ? c.fromName : c.toName)} to ${b(down ? c.toName : c.fromName)}, you…`,
    correct: op(down, c.f),
    wrong: [op(down, c.lengthF), op(!down, c.f), op(!down, c.lengthF)],
    why: `${c.fact}. ${down ? 'Large unit to small unit: multiply.' : 'Small unit to large unit: divide.'}`,
    meta: { from: down ? c.from : c.to, to: down ? c.to : c.from },
  })
}

const AREA_THINGS: [string, string][] = [
  ['the wing of a fly', 'mm²'],
  ['the head of a drawing pin', 'mm²'],
  ['the cover of a maths textbook', 'cm²'],
  ['a playing card', 'cm²'],
  ['the screen of a phone', 'cm²'],
  ['the floor of a classroom', 'm²'],
  ['a basketball court', 'm²'],
  ['a bedroom wall', 'm²'],
  ['a farm', 'ha'],
  ['a golf course', 'ha'],
  ['the grounds of a high school', 'ha'],
]

function m804unit(): GameQuestion {
  const [what, unit] = pick(AREA_THINGS)
  return gq({
    t: 'unit',
    prompt: `Which unit is best for measuring the area of ${b(what)}?`,
    correct: unit,
    inOrder: ['mm²', 'cm²', 'm²', 'ha'],
    why: `The area of ${what} is best measured in ${unit === 'ha' ? 'hectares (ha)' : unit}.`,
    meta: { what, unit },
  })
}

const m804size = oneOf([
  () =>
    gq({
      t: 'size',
      prompt: `Which is closest to the area of ${b('a fingernail')}?`,
      correct: '1 cm²',
      inOrder: ['1 mm²', '1 cm²', '1 m²', '1 ha'],
      why: 'A square centimetre is about the area of a fingernail.',
      meta: { v: 'fingernail' },
    }),
  () =>
    gq({
      t: 'size',
      prompt: `Which is closest to the area of ${b('the floor of a shower')}?`,
      correct: '1 m²',
      inOrder: ['1 mm²', '1 cm²', '1 m²', '1 ha'],
      why: 'A square metre is about the size of the floor of a large shower.',
      meta: { v: 'shower' },
    }),
  () =>
    gq({
      t: 'size',
      prompt: `Which is closest to the area of ${b('the grass inside a 400 m running track')}?`,
      correct: '1 ha',
      inOrder: ['1 cm²', '1 m²', '100 m²', '1 ha'],
      why: 'A hectare (10 000 m²) is about the grassed area inside a 400 m athletics track.',
      meta: { v: 'track' },
    }),
  () =>
    gq({
      t: 'size',
      prompt: `${b('One hectare')} is the area of a square with sides of…`,
      correct: '100 m',
      inOrder: ['10 m', '100 m', '1000 m', '10 km'],
      why: '100 m × 100 m = 10 000 m² = 1 ha.',
      meta: { v: 'hectare square' },
    }),
  () =>
    gq({
      t: 'size',
      prompt: `The ${b('area')} of a shape is the amount of…`,
      correct: 'surface inside it',
      wrong: ['distance around it', 'space it takes up', 'liquid it can hold'],
      why: 'Area is the amount of surface enclosed by a shape, measured in square units.',
      meta: { v: 'definition' },
    }),
])

const SET_804: GameSet = {
  id: 'ncm7-8.04',
  exercise: '8.04',
  ref: 'NCM 7 Ex 8.04',
  title: 'Metric units for area',
  focus: 'Choose sensible units for area and convert between mm², cm², m² and hectares (1 cm² = 100 mm², 1 m² = 10 000 cm², 1 ha = 10 000 m²).',
  outcomes: [ARE],
  lessons: ['y7-area-units'],
  teacherNote: 'Square kilometres (1 km² = 100 ha) are in the syllabus but only come up in the hardest questions of the exercise, so they are not in this game.',
  makers: [mk('fact', m804fact), mk('down', m804down), mk('unit', m804unit), mk('up', m804up), mk('operation', m804operation), mk('size', m804size)],
}

// ================================================================== 8.05 Area of a rectangle

function m805rect(): GameQuestion {
  const u = lenUnit()
  let l = 0
  let w = 0
  do {
    if (chance(0.8)) {
      l = int(3, 12)
      w = int(2, 9)
    } else {
      l = pick([20, 30])
      w = int(6, 9)
    }
  } while (w >= l || l > 4 * w || l * w === 2 * (l + w))
  return gq({
    t: 'rect',
    prompt: 'Find the area of this rectangle.',
    diagram: D.rectangle(l, w, `${l} ${u}`, `${w} ${u}`),
    ...numOpts(l * w, [2 * (l + w), l + w, 2 * l * w, (l * w) / 2], (x) => U(x, sq(u))),
    why: `${it('A')} = ${it('lw')} = ${l} ${TIMES} ${w} = ${n(l * w)} ${sq(u)}.`,
    meta: { l, w, u },
  })
}

function m805square(): GameQuestion {
  const u = lenUnit()
  const s = pick([3, 5, 6, 7, 8, 9, 10, 11, 12, 20, 30])
  return gq({
    t: 'square',
    prompt: 'Find the area of this square.',
    diagram: D.rectangle(s, s, `${s} ${u}`, '', true),
    ...numOpts(s * s, [4 * s, 2 * s, 2 * s * s, 3 * s], (x) => U(x, sq(u))),
    why: `${it('A')} = ${it('s')}<sup>2</sup> = ${s} ${TIMES} ${s} = ${n(s * s)} ${sq(u)}.`,
    meta: { s, u },
  })
}

const AREA_STORIES: { ask: (l: string, w: string) => string; pairs: [number, number][] }[] = [
  { ask: (l, w) => `A rug is ${l} long and ${w} wide. What is its area?`, pairs: [[3, 2], [4, 3], [5, 2], [4, 2.5], [6, 1.5]] },
  { ask: (l, w) => `A garden bed is ${l} long and ${w} wide. What is its area?`, pairs: [[8, 0.5], [12, 0.5], [6, 2], [10, 3], [7, 3]] },
  { ask: (l, w) => `A car park is ${l} long and ${w} wide. What is its area?`, pairs: [[20, 4], [30, 5], [40, 6], [50, 8], [20, 9]] },
]

function m805story(): GameQuestion {
  const st = pick(AREA_STORIES)
  const [l, w] = pick(st.pairs)
  const A = clean(l * w)
  return gq({
    t: 'story',
    prompt: st.ask(b(U(l, 'm')), b(U(w, 'm'))),
    ...numOpts(A, [2 * (l + w), l + w, A * 10, A / 2], (x) => U(x, 'm²')),
    why: `${it('A')} = ${it('lw')} = ${n(l)} ${TIMES} ${n(w)} = ${n(A)} m².`,
    meta: { l, w, u: 'm' },
  })
}

function m805grid(): GameQuestion {
  let a = 0
  let r = 0
  do {
    a = int(2, 6)
    r = int(2, 4)
  } while (a * r === 2 * (a + r) || a === r)
  const cells: [number, number][] = []
  for (let x = 0; x < a; x++) for (let y = 0; y < r; y++) cells.push([x + 1, y + 1])
  return gq({
    t: 'grid',
    prompt: `Each small square has an area of ${b('1 cm²')}. What is the area of the shaded rectangle?`,
    diagram: D2.cellGrid(a + 2, r + 2, cells),
    ...numOpts(a * r, [2 * (a + r), a + r, a * r + r, a * r - 1], (x) => U(x, 'cm²')),
    why: `${r} rows of ${a} squares: ${a} ${TIMES} ${r} = ${a * r} cm².`,
    meta: { cols: a, rows: r },
  })
}

/** Working backwards: one division (or a square root of a square number). */
function m805side(): GameQuestion {
  const u = pick(['cm', 'm'])
  if (chance()) {
    const s = pick([3, 5, 6, 7, 8, 9, 10, 11, 12])
    const A = s * s
    return gq({
      t: 'side',
      prompt: `A square has an area of ${b(U(A, sq(u)))}. How long is each side?`,
      ...numOpts(s, [A / 4, A / 2, 2 * A, 2 * s], (x) => U(x, u)),
      why: `${s} ${TIMES} ${s} = ${A}, so each side is ${s} ${u}.`,
      meta: { A, square: true, u },
    })
  }
  let l = 0
  let w = 0
  do {
    l = int(4, 12)
    w = int(2, 9)
  } while (w >= l)
  const A = l * w
  return gq({
    t: 'side',
    prompt: `A rectangle has an area of ${b(U(A, sq(u)))} and a width of ${b(U(w, u))}. What is its length?`,
    ...numOpts(l, [A - w, A * w, A / 2, l + w], (x) => U(x, u)),
    why: `Length = area ${DIVIDE} width = ${A} ${DIVIDE} ${w} = ${l} ${u}.`,
    meta: { A, w, square: false, u },
  })
}

/** Which pair could be the length and width? */
function m805pair(): GameQuestion {
  const [A, l, w] = pick<[number, number, number]>([
    [12, 4, 3], [18, 6, 3], [20, 5, 4], [24, 6, 4], [24, 8, 3], [30, 6, 5], [36, 9, 4], [40, 8, 5], [48, 8, 6], [28, 7, 4],
  ])
  const by = (x: number, y: number) => `${x} cm by ${y} cm`
  return gq({
    t: 'pair',
    prompt: `A rectangle has an area of ${b(U(A, 'cm²'))}. Which could be its length and width?`,
    correct: by(l, w),
    wrong: [by(A - w, w), by(A / 2, A / 2), by(l + 2, w)],
    why: `${l} ${TIMES} ${w} = ${A}, so a rectangle ${l} cm by ${w} cm has an area of ${A} cm².`,
    meta: { A, l, w },
  })
}

const m805meaning = oneOf([
  () =>
    gq({
      t: 'meaning',
      prompt: `Which formula gives the area of a rectangle with length ${it('l')} and width ${it('w')}?`,
      correct: `${it('A')} = ${it('lw')}`,
      wrong: [`${it('A')} = 2(${it('l')} + ${it('w')})`, `${it('A')} = ${it('l')} + ${it('w')}`, `${it('A')} = 2${it('lw')}`],
      why: 'Area of a rectangle = length × width.',
      meta: { v: 'rectangle formula' },
    }),
  () =>
    gq({
      t: 'meaning',
      prompt: `Which formula gives the area of a square with sides of length ${it('s')}?`,
      correct: `${it('A')} = ${it('s')}<sup>2</sup>`,
      wrong: [`${it('A')} = 4${it('s')}`, `${it('A')} = 2${it('s')}`, `${it('A')} = ${it('s')} + ${it('s')}`],
      why: `Area of a square = side × side = ${it('s')}<sup>2</sup>.`,
      meta: { v: 'square formula' },
    }),
  () =>
    gq({
      t: 'meaning',
      prompt: 'The sides of a rectangle are measured in centimetres. Its area is measured in…',
      correct: 'cm²',
      inOrder: ['cm', 'cm²', 'cm³', 'mL'],
      why: 'Area is measured in square units: centimetres × centimetres = square centimetres (cm²).',
      meta: { v: 'unit' },
    }),
])

const SET_805: GameSet = {
  id: 'ncm7-8.05',
  exercise: '8.05',
  ref: 'NCM 7 Ex 8.05',
  title: 'Area of a rectangle',
  focus: 'Find the area of rectangles and squares with A = lw and A = s², and work back from an area to a side.',
  outcomes: [ARE],
  lessons: ['y7-area-rect'],
  makers: [
    mk('rect', m805rect),
    mk('square', m805square),
    mk('grid', m805grid),
    mk('story', m805story),
    mk('meaning', m805meaning),
    mk('side', m805side, 2),
    mk('pair', m805pair, 2),
  ],
}

// ================================================================== 8.06 Area of a triangle

function m806basic(): GameQuestion {
  const u = lenUnit()
  let base = 0
  let h = 0
  do {
    base = int(4, 12)
    h = int(3, 10)
  } while ((base * h) % 2 !== 0 || base + h === (base * h) / 2)
  const A = (base * h) / 2
  return gq({
    t: 'basic',
    prompt: 'Find the area of this triangle.',
    diagram: D.triangleBH(base, h, `${base} ${u}`, `${h} ${u}`, pick([0.3, 0.45, 0.62])),
    ...numOpts(A, [base * h, base + h, A / 2, 2 * base * h], (x) => U(x, sq(u))),
    why: `${it('A')} = ${HALF}${it('bh')} = ${HALF} ${TIMES} ${base} ${TIMES} ${h} = ${n(A)} ${sq(u)}.`,
    meta: { base, h, u },
  })
}

/** Right-angled triangles with whole-number sides: the two sides at the right angle are the base and height. */
const RIGHT_TRIANGLES: [number, number, number][] = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [12, 16, 20]]

function m806right(): GameQuestion {
  const u = lenUnit()
  const [p, q, hyp] = pick(RIGHT_TRIANGLES)
  const flip = chance()
  const [base, h] = flip ? [q, p] : [p, q]
  const A = (base * h) / 2
  return gq({
    t: 'right',
    prompt: 'Find the area of this right-angled triangle.',
    diagram: DG.rightTri(base, h, `${base} ${u}`, `${h} ${u}`, `${hyp} ${u}`),
    ...numOpts(A, [base * h, (base * hyp) / 2, (h * hyp) / 2, base * hyp], (x) => U(x, sq(u))),
    why: `The sides at the right angle are the base and height: ${HALF} ${TIMES} ${base} ${TIMES} ${h} = ${n(A)} ${sq(u)}. The ${hyp} ${u} side is not needed.`,
    meta: { base, h, hyp, u },
  })
}

/** [base, perpendicular height, where the height meets the base, left slanted side, right slanted side]: true lengths */
const SLANT_TRIANGLES: [number, number, number, number, number][] = [
  [6, 4, 3, 5, 5],
  [14, 12, 5, 13, 15],
  [12, 8, 6, 10, 10],
  [21, 8, 6, 10, 17],
  [16, 6, 8, 10, 10],
  [10, 12, 5, 13, 13],
  [24, 5, 12, 13, 13],
  [25, 12, 9, 15, 20],
]

function m806slant(): GameQuestion {
  const u = lenUnit()
  const [base, h, foot, , right] = pick(SLANT_TRIANGLES)
  const A = (base * h) / 2
  return gq({
    t: 'slant',
    prompt: 'Find the area of this triangle.',
    diagram: DG.triHeight(base, h, foot, { base: `${base} ${u}`, height: `${h} ${u}`, right: `${right} ${u}` }),
    ...numOpts(A, [(base * right) / 2, base * h, base * right, (h * right) / 2], (x) => U(x, sq(u))),
    why: `Use the perpendicular height, not the slanted side: ${HALF} ${TIMES} ${base} ${TIMES} ${h} = ${n(A)} ${sq(u)}.`,
    meta: { base, h, slant: right, u },
  })
}

function m806height(): GameQuestion {
  const u = lenUnit()
  const [base, h, foot, left, right] = pick(SLANT_TRIANGLES.filter((t) => t[3] !== t[4]))
  return gq({
    t: 'height',
    prompt: `Which length is the ${b('perpendicular height')} of this triangle?`,
    diagram: DG.triHeight(base, h, foot, { base: `${base} ${u}`, height: `${h} ${u}`, left: `${left} ${u}`, right: `${right} ${u}` }),
    ...numOpts(h, [left, right, base], (x) => U(x, u)),
    why: `The perpendicular height is the dashed line that meets the base at a right angle: ${h} ${u}.`,
    meta: { base, h, left, right, u },
  })
}

/** A rectangle cut along its diagonal: the triangle is half of it. */
function m806half(): GameQuestion {
  const u = lenUnit()
  let w = 0
  let h = 0
  do {
    w = int(4, 12)
    h = int(2, 8)
  } while (h >= w || w > 4 * h || (w * h) % 2 !== 0 || w + h === (w * h) / 2)
  const A = (w * h) / 2
  return gq({
    t: 'half',
    prompt: 'A rectangle is cut along its diagonal. What is the area of the shaded triangle?',
    diagram: DG.halfRectangle(w, h, `${w} ${u}`, `${h} ${u}`),
    ...numOpts(A, [w * h, w + h, 2 * (w + h), A / 2], (x) => U(x, sq(u))),
    why: `The triangle is half of the rectangle: ${HALF} ${TIMES} ${w} ${TIMES} ${h} = ${n(A)} ${sq(u)}.`,
    meta: { w, h, u },
  })
}

function m806story(): GameQuestion {
  const u = pick(['cm', 'm'])
  const [base, h] = pick<[number, number]>([[10, 6], [8, 5], [12, 5], [20, 7], [6, 3], [10, 9], [30, 4], [14, 2], [8, 8], [40, 5]])
  const A = (base * h) / 2
  return gq({
    t: 'story',
    prompt: `A triangle has a base of ${b(U(base, u))} and a perpendicular height of ${b(U(h, u))}. What is its area?`,
    ...numOpts(A, [base * h, base + h, A / 2, 2 * base * h], (x) => U(x, sq(u))),
    why: `${it('A')} = ${HALF}${it('bh')} = ${HALF} ${TIMES} ${base} ${TIMES} ${h} = ${n(A)} ${sq(u)}.`,
    meta: { base, h, u },
  })
}

const m806meaning = oneOf([
  () =>
    gq({
      t: 'meaning',
      prompt: `Which formula gives the area of a triangle with base ${it('b')} and perpendicular height ${it('h')}?`,
      correct: `${it('A')} = ${HALF}${it('bh')}`,
      wrong: [`${it('A')} = ${it('bh')}`, `${it('A')} = ${it('b')} + ${it('h')}`, `${it('A')} = 2${it('bh')}`],
      why: 'Area of a triangle = ½ × base × perpendicular height.',
      meta: { v: 'formula' },
    }),
  () =>
    gq({
      t: 'meaning',
      prompt: 'A triangle and a rectangle have the same base and the same height. The triangle’s area is … the rectangle’s area.',
      correct: 'half',
      wrong: ['double', 'the same as', 'a quarter of'],
      why: 'A triangle is half of the rectangle with the same base and height.',
      meta: { v: 'half' },
    }),
  () =>
    gq({
      t: 'meaning',
      prompt: `The ${b('perpendicular height')} of a triangle meets the base at…`,
      correct: 'a right angle',
      wrong: ['its midpoint', 'a slant', 'the longest side'],
      why: 'Perpendicular means at right angles: the height is measured at 90° to the base.',
      meta: { v: 'perpendicular' },
    }),
])

const SET_806: GameSet = {
  id: 'ncm7-8.06',
  exercise: '8.06',
  ref: 'NCM 7 Ex 8.06',
  title: 'Area of a triangle',
  focus: 'Find the area of a triangle with A = ½bh, choosing the base and the perpendicular height (not a slanted side).',
  outcomes: [ARE],
  lessons: ['y7-area-tri-para'],
  makers: [
    mk('basic', m806basic),
    mk('story', m806story),
    mk('half', m806half),
    mk('meaning', m806meaning),
    mk('right', m806right, 2),
    mk('slant', m806slant, 2),
    mk('height', m806height, 2),
  ],
}

// ================================================================== 8.07 Area of a parallelogram

/** [how far the top is pushed across, perpendicular height, slanted side]: true lengths */
const LEANS: [number, number, number][] = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 6, 10], [9, 12, 15], [12, 5, 13]]

function m807basic(): GameQuestion {
  const u = lenUnit()
  let base = 0
  let h = 0
  do {
    base = int(5, 12)
    h = int(3, 9)
  } while (base === h || base * h === 2 * (base + h))
  return gq({
    t: 'basic',
    prompt: 'Find the area of this parallelogram.',
    diagram: DG.parallelogramBH(base, h, pick([2, 3]), { base: `${base} ${u}`, height: `${h} ${u}` }),
    ...numOpts(base * h, [(base * h) / 2, 2 * (base + h), base + h, 2 * base * h], (x) => U(x, sq(u))),
    why: `${it('A')} = ${it('bh')} = ${base} ${TIMES} ${h} = ${n(base * h)} ${sq(u)}.`,
    meta: { base, h, u },
  })
}

/** a base that is longer than the lean and different from the other two labelled lengths */
const leanBase = (off: number, h: number, slant: number) => pick([8, 10, 11, 12, 15, 20].filter((x) => x >= off + 2 && x !== h && x !== slant))

function m807slant(): GameQuestion {
  const u = lenUnit()
  const [off, h, slant] = pick(LEANS)
  const base = leanBase(off, h, slant)
  return gq({
    t: 'slant',
    prompt: 'Find the area of this parallelogram.',
    diagram: DG.parallelogramBH(base, h, off, { base: `${base} ${u}`, height: `${h} ${u}`, slant: `${slant} ${u}` }),
    ...numOpts(base * h, [base * slant, (base * h) / 2, 2 * (base + slant), (base * slant) / 2], (x) => U(x, sq(u))),
    why: `Use the perpendicular height, not the slanted side: ${base} ${TIMES} ${h} = ${n(base * h)} ${sq(u)}.`,
    meta: { base, h, slant, u },
  })
}

function m807which(): GameQuestion {
  const u = lenUnit()
  const [off, h, slant] = pick(LEANS)
  const base = leanBase(off, h, slant)
  const and = (x: number, y: number) => `${x} ${u} and ${y} ${u}`
  return gq({
    t: 'which',
    prompt: 'Which two lengths are multiplied to find the area of this parallelogram?',
    diagram: DG.parallelogramBH(base, h, off, { base: `${base} ${u}`, height: `${h} ${u}`, slant: `${slant} ${u}` }),
    correct: and(base, h),
    wrong: [and(base, slant), and(h, slant), 'all three lengths'],
    why: `Area = base × perpendicular height = ${base} ${TIMES} ${h}. The slanted side (${slant} ${u}) is not used.`,
    meta: { base, h, slant, u },
  })
}

function m807story(): GameQuestion {
  const u = pick(['cm', 'm'])
  const [base, h] = pick<[number, number]>([[8, 5], [9, 4], [12, 5], [20, 6], [7, 6], [10, 9], [30, 4], [15, 2], [11, 3], [40, 5]])
  return gq({
    t: 'story',
    prompt: `A parallelogram has a base of ${b(U(base, u))} and a perpendicular height of ${b(U(h, u))}. What is its area?`,
    ...numOpts(base * h, [(base * h) / 2, base + h, 2 * (base + h), 2 * base * h], (x) => U(x, sq(u))),
    why: `${it('A')} = ${it('bh')} = ${base} ${TIMES} ${h} = ${n(base * h)} ${sq(u)}.`,
    meta: { base, h, u },
  })
}

/** Working backwards: one division. */
function m807back(): GameQuestion {
  const u = pick(['cm', 'm'])
  let base = 0
  let h = 0
  do {
    base = int(4, 12)
    h = int(3, 9)
  } while (base === h)
  const A = base * h
  return gq({
    t: 'back',
    prompt: `A parallelogram has an area of ${b(U(A, sq(u)))} and a base of ${b(U(base, u))}. What is its perpendicular height?`,
    ...numOpts(h, [A - base, A * base, A / 2, 2 * h], (x) => U(x, u)),
    why: `Height = area ${DIVIDE} base = ${A} ${DIVIDE} ${base} = ${h} ${u}.`,
    meta: { A, base, u },
  })
}

const m807meaning = oneOf([
  () =>
    gq({
      t: 'meaning',
      prompt: `Which formula gives the area of a parallelogram with base ${it('b')} and perpendicular height ${it('h')}?`,
      correct: `${it('A')} = ${it('bh')}`,
      wrong: [`${it('A')} = ${HALF}${it('bh')}`, `${it('A')} = 2(${it('b')} + ${it('h')})`, `${it('A')} = ${it('b')} + ${it('h')}`],
      why: 'Area of a parallelogram = base × perpendicular height.',
      meta: { v: 'formula' },
    }),
  () =>
    gq({
      t: 'meaning',
      prompt: 'A parallelogram has the same area as a … with the same base and perpendicular height.',
      correct: 'rectangle',
      wrong: ['triangle', 'circle', 'cube'],
      why: 'Cut a triangle off one end of a parallelogram and move it to the other end: it makes a rectangle.',
      meta: { v: 'rectangle' },
    }),
  () =>
    gq({
      t: 'meaning',
      prompt: 'A parallelogram and a triangle have the same base and the same height. The parallelogram’s area is … the triangle’s area.',
      correct: 'double',
      wrong: ['half', 'the same as', 'four times'],
      why: `Parallelogram: ${it('bh')}. Triangle: ${HALF}${it('bh')}. So the parallelogram’s area is double.`,
      meta: { v: 'double' },
    }),
])

const SET_807: GameSet = {
  id: 'ncm7-8.07',
  exercise: '8.07',
  ref: 'NCM 7 Ex 8.07',
  title: 'Area of a parallelogram',
  focus: 'Find the area of a parallelogram with A = bh, using the perpendicular height and not the slanted side.',
  outcomes: [ARE],
  lessons: ['y7-area-tri-para'],
  makers: [
    mk('basic', m807basic),
    mk('story', m807story),
    mk('meaning', m807meaning),
    mk('slant', m807slant),
    mk('which', m807which, 2),
    mk('back', m807back, 2),
  ],
}

// ================================================================== 8.08 Areas of composite shapes

function m808add(): GameQuestion {
  const u = pick(['cm', 'm'])
  let w1 = 0
  let h1 = 0
  let w2 = 0
  let h2 = 0
  do {
    w1 = int(2, 4)
    h1 = int(3, 5)
    w2 = int(2, 5)
    h2 = int(1, h1 - 1)
  } while (w1 * h1 === w2 * h2)
  const A1 = w1 * h1
  const A2 = w2 * h2
  return gq({
    t: 'add',
    prompt: 'This shape is made of two rectangles. What is its total area?',
    diagram: DG.twoRects(w1, h1, w2, h2, `${A1} ${sq(u)}`, `${A2} ${sq(u)}`),
    ...numOpts(A1 + A2, [Math.abs(A1 - A2), A1 * A2, Math.max(A1, A2), A1 + A2 + 10], (x) => U(x, sq(u))),
    why: `Add the areas of the parts: ${A1} + ${A2} = ${A1 + A2} ${sq(u)}.`,
    meta: { A1, A2, u },
  })
}

function m808house(): GameQuestion {
  const u = pick(['cm', 'm'])
  const w = pick([4, 6, 8])
  const h = int(3, 5)
  const roof = pick([2, 3, 4])
  const A1 = w * h
  const A2 = (w * roof) / 2
  return gq({
    t: 'house',
    prompt: 'This shape is made of a rectangle and a triangle. What is its total area?',
    diagram: DG.rectAndTriangle(w, h, roof, `${A1} ${sq(u)}`, `${A2} ${sq(u)}`),
    ...numOpts(A1 + A2, [A1 - A2, A1 * A2, A1, A1 + A2 + 10], (x) => U(x, sq(u))),
    why: `Add the areas of the parts: ${A1} + ${A2} = ${A1 + A2} ${sq(u)}.`,
    meta: { A1, A2, u },
  })
}

function m808hole(): GameQuestion {
  const u = pick(['cm', 'm'])
  const W = int(7, 10)
  const H = int(4, 6)
  const w = int(2, 4)
  const h = int(1, 2)
  const B = W * H
  const S = w * h
  return gq({
    t: 'hole',
    prompt: `A rectangle with an area of ${b(U(B, sq(u)))} has a hole with an area of ${b(U(S, sq(u)))} cut out of it. What is the shaded area?`,
    diagram: DG.rectWithHole(W, H, w, h, '', `${S} ${sq(u)}`),
    ...numOpts(B - S, [B + S, B, B * S, S], (x) => U(x, sq(u))),
    why: `Subtract the hole from the whole rectangle: ${B} ${MINUS} ${S} = ${B - S} ${sq(u)}.`,
    meta: { B, S, u },
  })
}

/** Which calculation gives the area? (the method, not the arithmetic) */
function m808expression(): GameQuestion {
  let w1 = 0
  let h1 = 0
  let w2 = 0
  let h2 = 0
  let area = 0
  do {
    w1 = int(2, 5)
    h1 = int(4, 7)
    w2 = int(3, 7)
    h2 = int(2, h1 - 1)
    area = w1 * h1 + w2 * h2
    // none of the wrong calculations may happen to give the right area
  } while (w1 + h1 + w2 + h2 === area || (w1 + w2) * h1 === area || w1 === h1 || w2 === h2 || w1 === w2 || h1 === w2)
  const x = ` ${TIMES} `
  return gq({
    t: 'expression',
    prompt: 'Which calculation gives the area of this shape? All lengths are in centimetres.',
    diagram: DG.twoRectsDims(w1, h1, w2, h2, { w1: String(w1), h1: String(h1), w2: String(w2), h2: String(h2) }),
    correct: `${w1}${x}${h1} + ${w2}${x}${h2}`,
    wrong: [`${w1} + ${h1} + ${w2} + ${h2}`, `${w1}${x}${h1} ${MINUS} ${w2}${x}${h2}`, `(${w1} + ${w2})${x}${h1}`],
    why: `Left rectangle ${w1}${x}${h1}, right rectangle ${w2}${x}${h2}. Add them: ${w1 * h1} + ${w2 * h2} = ${area} cm².`,
    meta: { w1, h1, w2, h2 },
  })
}

/** A missing side of an L-shape: one subtraction. */
function m808missing(): GameQuestion {
  const u = pick(['cm', 'm'])
  const W = int(8, 14)
  const H = int(6, 10)
  const w = int(3, W - 4)
  const h = int(2, H - 3)
  return gq({
    t: 'missing',
    prompt: `All the corners of this shape are right angles. How long is the side marked ${b('?')}`,
    diagram: D.lShape(W, H, w, h, { W: `${W} ${u}`, H: '', a: '?', b: '', c: `${w} ${u}`, d: '' }),
    ...numOpts(W - w, [W + w, w, W, W - w + 2], (x) => U(x, u)),
    why: `The top side and the ${w} ${u} side together are as long as the bottom side: ${W} ${MINUS} ${w} = ${W - w} ${u}.`,
    meta: { W, w, u },
  })
}

function m808split(): GameQuestion {
  if (chance()) {
    return gq({
      t: 'split',
      prompt: 'The dashed line splits this composite shape into…',
      diagram: DG.rectAndTriangle(6, 4, 3, '', ''),
      correct: 'a rectangle and a triangle',
      wrong: ['two rectangles', 'two triangles', 'a square and a circle'],
      why: 'Below the dashed line is a rectangle; above it is a triangle. Add their areas to find the area of the shape.',
      meta: { v: 'house' },
    })
  }
  return gq({
    t: 'split',
    prompt: 'The dashed line splits this composite shape into…',
    diagram: DG.twoRects(3, 5, 4, 2, '', ''),
    correct: 'two rectangles',
    wrong: ['a rectangle and a triangle', 'two triangles', 'two squares'],
    why: 'Each side of the dashed line is a rectangle. Add their areas to find the area of the shape.',
    meta: { v: 'L' },
  })
}

const m808meaning = oneOf([
  () =>
    gq({
      t: 'meaning',
      prompt: `A ${b('composite shape')} is…`,
      correct: 'made up of 2 or more shapes',
      wrong: ['a shape with 4 equal sides', 'any shape with a curved edge', 'a solid with 6 faces'],
      why: 'A composite shape is made up of 2 or more simpler shapes, such as rectangles and triangles.',
      meta: { v: 'definition' },
    }),
  () =>
    gq({
      t: 'meaning',
      prompt: 'A shape has a rectangular hole cut out of it. To find the area that is left, you…',
      correct: 'subtract the area of the hole',
      wrong: ['add the area of the hole', 'multiply the two areas', 'add all the side lengths'],
      why: 'Area left = area of the whole shape − area of the hole.',
      meta: { v: 'subtract' },
    }),
  () =>
    gq({
      t: 'meaning',
      prompt: 'A shape is split into a rectangle and a triangle. To find its area, you…',
      correct: 'add the two areas',
      wrong: ['subtract the two areas', 'multiply the two areas', 'add all the side lengths'],
      why: 'Area of a composite shape = the sum of the areas of its parts.',
      meta: { v: 'add' },
    }),
])

const SET_808: GameSet = {
  id: 'ncm7-8.08',
  exercise: '8.08',
  ref: 'NCM 7 Ex 8.08',
  title: 'Areas of composite shapes',
  focus: 'Split a composite shape into rectangles and triangles, then add the areas of the parts or subtract the part that is missing.',
  outcomes: [ARE],
  lessons: ['y7-area-composite'],
  teacherNote: 'To keep every question to one step, the areas of the parts are given, or only the method is asked for. The full calculations are left for the exercise.',
  makers: [
    mk('add', m808add),
    mk('split', m808split),
    mk('hole', m808hole),
    mk('house', m808house),
    mk('meaning', m808meaning),
    mk('expression', m808expression, 2),
    mk('missing', m808missing, 2),
  ],
}

// ================================================================== 8.09 Drawing prisms

const PRISMS: { shape: DG.CrossSection; base: string; name: string }[] = [
  { shape: 'triangle', base: 'triangle', name: 'triangular prism' },
  { shape: 'rectangle', base: 'rectangle', name: 'rectangular prism' },
  { shape: 'trapezium', base: 'trapezium', name: 'trapezoidal prism' },
  { shape: 'pentagon', base: 'pentagon', name: 'pentagonal prism' },
  { shape: 'hexagon', base: 'hexagon', name: 'hexagonal prism' },
]
const aOrAn = (word: string) => (/^[aeiou]/.test(word) ? 'an' : 'a') + ' ' + word

function m809name(): GameQuestion {
  const p = pick(PRISMS)
  return gq({
    t: 'name',
    prompt: 'What is the name of this prism? Its base is shaded.',
    diagram: DG.prism(p.shape),
    correct: p.name,
    wrong: sample(PRISMS.filter((x) => x !== p), 3).map((x) => x.name),
    why: `Prisms are named after their base. The shaded base is ${aOrAn(p.base)}, so this is ${aOrAn(p.name)}.`,
    meta: { shape: p.shape },
  })
}

function m809cross(): GameQuestion {
  const p = pick(PRISMS)
  return gq({
    t: 'cross',
    prompt: 'This prism is sliced straight across, parallel to its shaded end. What shape is the cross-section?',
    diagram: DG.prism(p.shape),
    correct: p.base,
    wrong: sample(PRISMS.filter((x) => x !== p), 3).map((x) => x.base),
    why: `Every cross-section of a prism is the same shape as its base: ${aOrAn(p.base)}.`,
    meta: { shape: p.shape },
  })
}

const BASES: Record<number, string> = { 3: 'triangular', 4: 'square', 5: 'pentagonal', 6: 'hexagonal' }

/** Prism or pyramid? */
function m809solid(): GameQuestion {
  const kind = pick(['prism', 'pyramid'] as const)
  const k = pick([3, 4, 5, 6])
  const other = pick([3, 4, 5, 6].filter((x) => x !== k))
  const otherKind = kind === 'prism' ? 'pyramid' : 'prism'
  return gq({
    t: 'solid',
    prompt: 'What is this solid?',
    diagram: D2.solid(kind, k),
    correct: `${BASES[k]} ${kind}`,
    wrong: [`${BASES[k]} ${otherKind}`, `${BASES[other]} ${kind}`, `${BASES[other]} ${otherKind}`],
    why:
      kind === 'prism'
        ? `Its cross-section is the same all the way up, so it is a prism. Its base has ${k} sides: ${aOrAn(`${BASES[k]} prism`)}.`
        : `It comes to a point, so its cross-sections get smaller: it is a pyramid, not a prism. Its base has ${k} sides.`,
    meta: { kind, sides: k },
  })
}

const POLYGONS: Record<number, string> = { 3: 'triangle', 4: 'square', 5: 'pentagon', 6: 'hexagon' }

/** The top view and the front view of a prism standing on its base. */
function m809view(): GameQuestion {
  const k = pick([3, 5, 6])
  const top = chance()
  const others = [3, 4, 5, 6].filter((x) => x !== k).map((x) => POLYGONS[x])
  return gq({
    t: 'view',
    prompt: top ? `You look straight down on this prism from above. What shape is the ${b('top view')}?` : `You look at this prism from the front. What shape is the outline of the ${b('front view')}?`,
    diagram: D2.solid('prism', k),
    correct: top ? POLYGONS[k] : 'rectangle',
    wrong: top ? ['rectangle', ...sample(others, 2)] : [POLYGONS[k], 'circle', ...sample(others, 1)],
    why: top ? `From above you see the base: ${aOrAn(POLYGONS[k])}.` : 'From the front you see the upright side faces, which make a rectangle.',
    meta: { sides: k, view: top ? 'top' : 'front' },
  })
}

/** Floor plans of cube solids: the number of cubes stacked on each square, back row first. */
const CUBE_SOLIDS: number[][][] = [
  [[2, 1], [1, 1]],
  [[2, 2, 1], [1, 1, 1]],
  [[3, 2], [2, 1]],
  [[1, 1, 1], [1, 1, 1]],
  [[3, 2, 1]],
  [[2, 1, 1], [1, 1, 1]],
  [[3, 1], [1, 1]],
  [[2, 2], [2, 1]],
]
const cubesIn = (hs: number[][]) => hs.flat().reduce((t, x) => t + x, 0)
const topSquares = (hs: number[][]) => hs.flat().filter((x) => x > 0).length
const frontSquares = (hs: number[][]) => hs[0].map((_, c) => Math.max(...hs.map((r) => r[c] ?? 0))).reduce((t, x) => t + x, 0)

function m809cubesView(): GameQuestion {
  const hs = pick(CUBE_SOLIDS)
  const top = chance()
  const total = cubesIn(hs)
  const tv = topSquares(hs)
  const fv = frontSquares(hs)
  const ans = top ? tv : fv
  return gq({
    t: 'cubesView',
    prompt: `This solid is built from cubes. How many squares are in its ${b(top ? 'top view' : 'front view')}?`,
    diagram: DG.cubeSolid(hs),
    ...numOpts(ans, [total, top ? fv : tv, ans + 1, ans - 1, ans + 2], (x) => String(x)),
    why: top
      ? `From above, each stack of cubes shows one square: ${tv} squares.`
      : `From the front, each column shows its tallest stack: ${hs[0].map((_, c) => Math.max(...hs.map((r) => r[c] ?? 0))).join(' + ')} = ${fv} squares.`,
    meta: { hs, view: top ? 'top' : 'front' },
  })
}

const m809meaning = oneOf([
  () =>
    gq({
      t: 'meaning',
      prompt: 'The side faces of a prism are all…',
      correct: 'rectangles',
      wrong: ['triangles', 'circles', 'pentagons'],
      why: 'A prism has two identical end faces (its bases) joined by rectangular side faces.',
      meta: { v: 'side faces' },
    }),
  () =>
    gq({
      t: 'meaning',
      prompt: 'A solid is a prism if it has…',
      correct: 'the same cross-section all the way along',
      wrong: ['a point at the top', 'a curved surface', 'exactly 6 faces'],
      why: 'A prism has the same (uniform) cross-section along its whole length, with straight sides.',
      meta: { v: 'uniform' },
    }),
  () =>
    gq({
      t: 'meaning',
      prompt: 'A prism is named after the shape of its…',
      correct: 'base',
      wrong: ['side faces', 'longest edge', 'top view'],
      why: 'The end faces of a prism are its base, and the prism takes its name from them.',
      meta: { v: 'named' },
    }),
  () =>
    gq({
      t: 'meaning',
      prompt: `Which of these solids is ${b('not')} a prism?`,
      correct: 'a sphere',
      wrong: ['a cube', 'a shoebox', 'a brick'],
      why: 'The cross-sections of a sphere are circles of different sizes, so it is not a prism.',
      meta: { v: 'not a prism' },
    }),
])

const SET_809: GameSet = {
  id: 'ncm7-8.09',
  exercise: '8.09',
  ref: 'NCM 7 Ex 8.09',
  title: 'Drawing prisms',
  focus: 'Recognise prisms and their cross-sections, name a prism from its base, and picture the top and front views of a solid.',
  outcomes: [VOL],
  teacherNote: 'The exercise is mostly drawing on dot paper. In the game, drawing becomes recognising: naming prisms and cross-sections, and reading views.',
  makers: [
    mk('name', m809name),
    mk('cross', m809cross),
    mk('solid', m809solid),
    mk('meaning', m809meaning),
    mk('view', m809view, 2),
    mk('cubesView', m809cubesView, 2),
  ],
}

// ================================================================== 8.10 Metric units for volume

interface VolConv {
  from: string
  to: string
  f: number
  lengthF: number
  areaF: number
  fromName: string
  toName: string
  fact: string
}
const VOL_CONVS: VolConv[] = [
  { from: 'cm³', to: 'mm³', f: 1000, lengthF: 10, areaF: 100, fromName: 'cubic centimetres', toName: 'cubic millimetres', fact: '1 cm = 10 mm, so 1 cm³ = 10 × 10 × 10 = 1000 mm³' },
  { from: 'm³', to: 'cm³', f: 1000000, lengthF: 100, areaF: 10000, fromName: 'cubic metres', toName: 'cubic centimetres', fact: '1 m = 100 cm, so 1 m³ = 100 × 100 × 100 = 1 000 000 cm³' },
]

function m810fact(): GameQuestion {
  const c = pick(VOL_CONVS)
  return gq({
    t: 'fact',
    prompt: `Complete:${big(`1 ${c.from} = ${BOX} ${c.to}`)}`,
    ...numOpts(c.f, [c.lengthF, c.areaF, c.f === 1000 ? 10000 : 1000], n),
    why: `${c.fact}.`,
    meta: { from: c.from, to: c.to },
  })
}

function m810down(): GameQuestion {
  const c = pick(VOL_CONVS)
  const v = chance(0.75) ? int(2, 9) : pick([12, 20, 2.5, 0.5])
  const ans = clean(v * c.f)
  return gq({
    t: 'down',
    prompt: `Convert ${b(U(v, c.from))} to ${c.toName}.`,
    ...numOpts(ans, [v * c.areaF, v * c.lengthF, ans * 10, v / c.f], (x) => U(x, c.to)),
    why: `1 ${c.from} = ${n(c.f)} ${c.to}, so ${n(v)} ${TIMES} ${n(c.f)} = ${n(ans)} ${c.to}.`,
    meta: { v, from: c.from, to: c.to },
  })
}

function m810up(): GameQuestion {
  const c = pick(VOL_CONVS)
  const ans = chance(0.75) ? int(2, 9) : pick([12, 25, 40])
  const v = clean(ans * c.f)
  return gq({
    t: 'up',
    prompt: `Convert ${b(U(v, c.to))} to ${c.fromName}.`,
    ...numOpts(ans, [v / c.areaF, v / c.lengthF, ans / 10, ans * 1000], (x) => U(x, c.from)),
    why: `${n(c.f)} ${c.to} = 1 ${c.from}, so ${n(v)} ${DIVIDE} ${n(c.f)} = ${n(ans)} ${c.from}.`,
    meta: { v, from: c.to, to: c.from },
  })
}

const VOLUME_THINGS: [string, string][] = [
  ['a grain of sugar', 'mm³'],
  ['a drop of water', 'mm³'],
  ['a matchbox', 'cm³'],
  ['a maths textbook', 'cm³'],
  ['a lunchbox', 'cm³'],
  ['a classroom', 'm³'],
  ['a wardrobe', 'm³'],
  ['a shipping container', 'm³'],
]

function m810unit(): GameQuestion {
  const [what, unit] = pick(VOLUME_THINGS)
  return gq({
    t: 'unit',
    prompt: `Which unit is best for measuring the volume of ${b(what)}?`,
    correct: unit,
    inOrder: ['mm³', 'cm³', 'm³', 'km³'],
    why: `The volume of ${what} is best measured in ${unit}.`,
    meta: { what, unit },
  })
}

/** Counting 1 cm cubes: the idea behind cubic units. */
function m810count(): GameQuestion {
  let l = 0
  let w = 0
  let h = 0
  do {
    l = int(2, 4)
    w = int(2, 3)
    h = int(1, 3)
  } while (l * w * h > 30 || l * w * h === l * w + l * h + w * h)
  const V = l * w * h
  return gq({
    t: 'count',
    prompt: `This prism is built from ${b('1 cm³')} cubes. What is its volume?`,
    diagram: D2.cubeStack(l, w, h),
    ...numOpts(V, [l * w + l * h + w * h, l + w + h, V + l * w, 2 * (l * w + l * h + w * h)], (x) => U(x, 'cm³')),
    why: `Each layer has ${l} ${TIMES} ${w} = ${l * w} cubes and there ${h === 1 ? 'is 1 layer' : `are ${h} layers`}: ${V} cubes, so ${V} cm³.`,
    meta: { l, w, h },
  })
}

const m810meaning = oneOf([
  () =>
    gq({
      t: 'meaning',
      prompt: `The ${b('volume')} of a solid is the amount of…`,
      correct: 'space it takes up',
      wrong: ['surface on its outside', 'distance around it', 'time it takes to make'],
      why: 'Volume is the amount of space taken up by a solid, measured in cubic units.',
      meta: { v: 'definition' },
    }),
  () =>
    gq({
      t: 'meaning',
      prompt: `Which is closest in size to ${b('1 cubic metre')}?`,
      correct: 'two washing machines',
      wrong: ['a matchbox', 'a shoebox', 'a classroom'],
      why: 'A cubic metre is a cube 1 m long, 1 m wide and 1 m high: about the size of two washing machines.',
      meta: { v: 'cubic metre' },
    }),
  () =>
    gq({
      t: 'meaning',
      prompt: `${b('One cubic centimetre')} is a cube with edges of…`,
      correct: '1 cm',
      inOrder: ['1 mm', '1 cm', '10 cm', '1 m'],
      why: 'A cubic centimetre is a cube that is 1 cm long, 1 cm wide and 1 cm high.',
      meta: { v: 'cubic centimetre' },
    }),
  () =>
    gq({
      t: 'meaning',
      prompt: 'To convert cubic centimetres to cubic millimetres, you…',
      correct: 'multiply by 1000',
      wrong: ['multiply by 10', 'multiply by 100', 'divide by 1000'],
      why: '1 cm³ = 10 × 10 × 10 = 1000 mm³. Large unit to small unit: multiply.',
      meta: { v: 'operation' },
    }),
])

const SET_810: GameSet = {
  id: 'ncm7-8.10',
  exercise: '8.10',
  ref: 'NCM 7 Ex 8.10',
  title: 'Metric units for volume',
  focus: 'Choose sensible units for volume and convert between mm³, cm³ and m³ (1 cm³ = 1000 mm³, 1 m³ = 1 000 000 cm³).',
  outcomes: [VOL],
  makers: [mk('fact', m810fact), mk('count', m810count), mk('unit', m810unit), mk('down', m810down), mk('meaning', m810meaning), mk('up', m810up)],
}

// ================================================================== 8.11 Volume of a rectangular prism

/** three edge lengths whose product is easy in the head */
function easyBox(): [number, number, number] {
  const a = int(2, 6)
  const c = int(2, 5)
  const k = pick([2, 5, 10])
  return shuffle([a, c, k]) as [number, number, number]
}

function m811prism(): GameQuestion {
  const u = pick(['cm', 'm'])
  let l = 0
  let w = 0
  let h = 0
  do {
    ;[l, w, h] = easyBox()
  } while (l === w && w === h)
  const V = l * w * h
  return gq({
    t: 'prism',
    prompt: 'Find the volume of this rectangular prism.',
    diagram: D.rectPrism(l, w, h, `${l} ${u}`, `${w} ${u}`, `${h} ${u}`),
    note: NOT_TO_SCALE,
    ...numOpts(V, [l + w + h, l * w, 2 * (l * w + l * h + w * h), V / 2, V * 2], (x) => U(x, cu(u))),
    why: `${it('V')} = ${it('lwh')} = ${l} ${TIMES} ${w} ${TIMES} ${h} = ${n(V)} ${cu(u)}.`,
    meta: { l, w, h, u },
  })
}

function m811cube(): GameQuestion {
  const u = pick(['cm', 'm', 'mm'])
  const s = pick([2, 3, 4, 5, 10])
  const V = s * s * s
  return gq({
    t: 'cube',
    prompt: 'Find the volume of this cube.',
    diagram: DG.cube(`${s} ${u}`),
    ...numOpts(V, [3 * s, s * s, 6 * s * s, 12 * s], (x) => U(x, cu(u))),
    why: `${it('V')} = ${s} ${TIMES} ${s} ${TIMES} ${s} = ${n(V)} ${cu(u)}.`,
    meta: { s, u },
  })
}

const BOX_STORIES: { ask: (l: string, w: string, h: string) => string; u: string }[] = [
  { ask: (l, w, h) => `A box is ${l} long, ${w} wide and ${h} high. What is its volume?`, u: 'cm' },
  { ask: (l, w, h) => `A fish tank is ${l} long, ${w} wide and ${h} high. What is its volume?`, u: 'cm' },
  { ask: (l, w, h) => `A shed is ${l} long, ${w} wide and ${h} high. What is its volume?`, u: 'm' },
  { ask: (l, w, h) => `A skip bin is ${l} long, ${w} wide and ${h} deep. What is its volume?`, u: 'm' },
]

function m811story(): GameQuestion {
  const st = pick(BOX_STORIES)
  // tens for a tank or box measured in centimetres, small numbers for metres
  const [l, w, h] = st.u === 'cm' ? (shuffle([pick([20, 30, 40, 50]), 10, pick([2, 3, 4, 5]) * 10]) as [number, number, number]) : easyBox()
  const V = l * w * h
  return gq({
    t: 'story',
    prompt: st.ask(b(U(l, st.u)), b(U(w, st.u)), b(U(h, st.u))),
    ...numOpts(V, [l + w + h, l * w, V / 10, V * 10, V / 2], (x) => U(x, cu(st.u))),
    why: `${it('V')} = ${it('lwh')} = ${l} ${TIMES} ${w} ${TIMES} ${h} = ${n(V)} ${cu(st.u)}.`,
    meta: { l, w, h, u: st.u },
  })
}

/** Layers: the number of cubes on the bottom layer times the number of layers. */
function m811layers(): GameQuestion {
  const per = pick([6, 8, 10, 12, 15, 20])
  const layers = int(2, 5)
  const V = per * layers
  return gq({
    t: 'layers',
    prompt: `The bottom layer of a box holds ${b(`${per} cubes`)} of side 1 cm. The box is filled with ${b(`${layers} layers`)}. What is its volume?`,
    ...numOpts(V, [per + layers, per, V * 2, per * (layers - 1)], (x) => U(x, 'cm³')),
    why: `${layers} layers of ${per} cubes: ${per} ${TIMES} ${layers} = ${V} cubes, so ${V} cm³.`,
    meta: { per, layers },
  })
}

const m811meaning = oneOf([
  () =>
    gq({
      t: 'meaning',
      prompt: `Which formula gives the volume of a rectangular prism with length ${it('l')}, width ${it('w')} and height ${it('h')}?`,
      correct: `${it('V')} = ${it('lwh')}`,
      wrong: [`${it('V')} = ${it('l')} + ${it('w')} + ${it('h')}`, `${it('V')} = ${it('lw')}`, `${it('V')} = 2(${it('l')} + ${it('w')} + ${it('h')})`],
      why: 'Volume of a rectangular prism = length × width × height.',
      meta: { v: 'formula' },
    }),
  () =>
    gq({
      t: 'meaning',
      prompt: 'The edges of a rectangular prism are measured in centimetres. Its volume is measured in…',
      correct: 'cm³',
      inOrder: ['cm', 'cm²', 'cm³', 'kg'],
      why: 'Volume is measured in cubic units: cm × cm × cm = cubic centimetres (cm³).',
      meta: { v: 'unit' },
    }),
  () =>
    gq({
      t: 'meaning',
      prompt: `A cube has edges of length ${it('s')}. Its volume is…`,
      correct: `${it('s')}<sup>3</sup>`,
      wrong: [`3${it('s')}`, `${it('s')}<sup>2</sup>`, `6${it('s')}`],
      why: `Volume of a cube = ${it('s')} × ${it('s')} × ${it('s')} = ${it('s')}<sup>3</sup>.`,
      meta: { v: 'cube' },
    }),
])

const SET_811: GameSet = {
  id: 'ncm7-8.11',
  exercise: '8.11',
  ref: 'NCM 7 Ex 8.11',
  title: 'Volume of a rectangular prism',
  focus: 'Find the volume of rectangular prisms and cubes with V = lwh.',
  outcomes: [VOL],
  lessons: ['y7-vol-prism'],
  makers: [mk('prism', m811prism), mk('cube', m811cube), mk('layers', m811layers), mk('meaning', m811meaning), mk('story', m811story, 2)],
}

// ================================================================== 8.12 Volume of a prism

/** [area of the cross-section, length]: easy products */
const AH: [number, number][] = [
  [6, 5], [8, 5], [10, 4], [12, 5], [15, 4], [20, 3], [25, 4], [30, 2], [9, 10], [7, 10], [12, 3], [15, 6], [20, 7], [11, 5], [40, 2], [6, 8],
]

function m812Ah(): GameQuestion {
  const u = pick(['cm', 'm'])
  const [A, h] = pick(AH)
  const shape = pick<DG.CrossSection>(['triangle', 'right triangle', 'trapezium', 'L-shape', 'pentagon', 'hexagon'])
  return gq({
    t: 'Ah',
    prompt: 'Find the volume of this prism. The area of its shaded cross-section is marked.',
    diagram: DG.prism(shape, { faceLabel: `${A} ${sq(u)}`, lengthLabel: `${h} ${u}` }),
    note: NOT_TO_SCALE,
    ...numOpts(A * h, [A + h, (A * h) / 2, 2 * A * h, A * A], (x) => U(x, cu(u))),
    why: `${it('V')} = ${it('Ah')} = ${A} ${TIMES} ${h} = ${n(A * h)} ${cu(u)}.`,
    meta: { A, h, u },
  })
}

function m812story(): GameQuestion {
  const u = pick(['cm', 'm'])
  const [A, h] = pick(AH)
  return gq({
    t: 'story',
    prompt: `A prism has a cross-section with an area of ${b(U(A, sq(u)))} and a length of ${b(U(h, u))}. What is its volume?`,
    ...numOpts(A * h, [A + h, (A * h) / 2, 2 * A * h, A * A], (x) => U(x, cu(u))),
    why: `${it('V')} = ${it('Ah')} = ${A} ${TIMES} ${h} = ${n(A * h)} ${cu(u)}.`,
    meta: { A, h, u },
  })
}

/** Working backwards: one division. */
function m812back(): GameQuestion {
  const u = pick(['cm', 'm'])
  const [A, h] = pick(AH)
  const V = A * h
  return gq({
    t: 'back',
    prompt: `A prism has a volume of ${b(U(V, cu(u)))}. Its cross-section has an area of ${b(U(A, sq(u)))}. How long is the prism?`,
    ...numOpts(h, [V - A, V * A, V / 2, 2 * h, h + 1], (x) => U(x, u)),
    why: `Length = volume ${DIVIDE} area of cross-section = ${V} ${DIVIDE} ${A} = ${h} ${u}.`,
    meta: { V, A, u },
  })
}

const m812meaning = oneOf([
  () =>
    gq({
      t: 'meaning',
      prompt: `Which formula gives the volume of a prism with cross-section area ${it('A')} and height ${it('h')}?`,
      correct: `${it('V')} = ${it('Ah')}`,
      wrong: [`${it('V')} = ${it('A')} + ${it('h')}`, `${it('V')} = ${HALF}${it('Ah')}`, `${it('V')} = 2${it('Ah')}`],
      why: 'Volume of a prism = area of cross-section × perpendicular height.',
      meta: { v: 'formula' },
    }),
  () =>
    gq({
      t: 'meaning',
      prompt: `In the formula ${it('V')} = ${it('Ah')}, the letter ${it('A')} stands for…`,
      correct: 'the area of the cross-section',
      wrong: ['the area of all the faces', 'the length of the prism', 'the perimeter of the base'],
      why: `${it('A')} is the area of the prism’s cross-section (its base) and ${it('h')} is the prism’s height or length.`,
      meta: { v: 'A' },
    }),
  () =>
    gq({
      t: 'meaning',
      prompt: 'A prism’s cross-section is measured in cm² and its length in cm. Its volume is measured in…',
      correct: 'cm³',
      inOrder: ['mm', 'cm', 'cm²', 'cm³'],
      why: 'cm² × cm = cm³: volume is measured in cubic units.',
      meta: { v: 'unit' },
    }),
  () =>
    gq({
      t: 'meaning',
      prompt: `${it('V')} = ${it('Ah')} works for a prism because every cross-section along its length is…`,
      correct: 'the same',
      wrong: ['a rectangle', 'a different size', 'a triangle'],
      why: 'A prism is made of identical cross-section “slices” along its length, so volume = area of one slice × length.',
      meta: { v: 'uniform' },
    }),
])

const SET_812: GameSet = {
  id: 'ncm7-8.12',
  exercise: '8.12',
  ref: 'NCM 7 Ex 8.12',
  title: 'Volume of a prism',
  focus: 'Find the volume of any prism with V = Ah: the area of the cross-section times the length.',
  outcomes: [VOL],
  teacherNote: 'The area of the cross-section is given, so each question is one step. Finding that area first (two steps) is left for the exercise.',
  makers: [mk('Ah', m812Ah), mk('story', m812story), mk('meaning', m812meaning), mk('back', m812back, 2)],
}

// ================================================================== 8.13 Volume and capacity

interface CapConv {
  from: string
  to: string
  fromName: string
  toName: string
}
/** each step is × 1000 */
const CAP_CONVS: CapConv[] = [
  { from: 'L', to: 'mL', fromName: 'litres', toName: 'millilitres' },
  { from: 'kL', to: 'L', fromName: 'kilolitres', toName: 'litres' },
  { from: 'ML', to: 'kL', fromName: 'megalitres', toName: 'kilolitres' },
]

function m813fact(): GameQuestion {
  const facts: { lhs: string; unit: string; ans: number; wrong: number[]; why: string; id: string }[] = [
    { lhs: '1 L', unit: 'mL', ans: 1000, wrong: [10, 100, 10000], why: 'There are 1000 millilitres in 1 litre.', id: 'L-mL' },
    { lhs: '1 kL', unit: 'L', ans: 1000, wrong: [10, 100, 1000000], why: 'There are 1000 litres in 1 kilolitre.', id: 'kL-L' },
    { lhs: '1 ML', unit: 'kL', ans: 1000, wrong: [10, 100, 1000000], why: 'There are 1000 kilolitres in 1 megalitre.', id: 'ML-kL' },
    { lhs: '1 cm³ holds', unit: 'mL', ans: 1, wrong: [10, 100, 1000], why: 'A cubic centimetre holds exactly 1 millilitre.', id: 'cm3-mL' },
    { lhs: '1 m³ holds', unit: 'L', ans: 1000, wrong: [1, 10, 100], why: 'A cubic metre holds 1000 litres, which is 1 kilolitre.', id: 'm3-L' },
    { lhs: '1 m³ holds', unit: 'kL', ans: 1, wrong: [10, 100, 1000], why: 'A cubic metre holds 1 kilolitre (1000 litres).', id: 'm3-kL' },
  ]
  const f = pick(facts)
  const holds = f.lhs.endsWith('holds')
  return gq({
    t: 'fact',
    prompt: `Complete:${big(holds ? `${f.lhs} ${BOX} ${f.unit}` : `${f.lhs} = ${BOX} ${f.unit}`)}`,
    ...numOpts(f.ans, f.wrong, n),
    why: f.why,
    meta: { id: f.id },
  })
}

function m813down(): GameQuestion {
  const c = pick(CAP_CONVS)
  const v = chance(0.6) ? int(2, 9) : pick([0.5, 1.5, 2.5, 3.5, 12])
  const ans = clean(v * 1000)
  return gq({
    t: 'down',
    prompt: `Convert ${b(U(v, c.from))} to ${c.toName}.`,
    ...numOpts(ans, [v * 100, v * 10, v / 1000, ans * 10], (x) => U(x, c.to)),
    why: `1 ${c.from} = 1000 ${c.to}, so ${n(v)} ${TIMES} 1000 = ${n(ans)} ${c.to}.`,
    meta: { v, from: c.from, to: c.to },
  })
}

function m813up(): GameQuestion {
  const c = pick(CAP_CONVS)
  const ans = chance(0.6) ? int(2, 9) : pick([1.5, 2.5, 4.5, 12, 25])
  const v = clean(ans * 1000)
  return gq({
    t: 'up',
    prompt: `Convert ${b(U(v, c.to))} to ${c.fromName}.`,
    ...numOpts(ans, [ans * 10, ans / 10, ans * 100, v * 1000], (x) => U(x, c.from)),
    why: `1000 ${c.to} = 1 ${c.from}, so ${n(v)} ${DIVIDE} 1000 = ${n(ans)} ${c.from}.`,
    meta: { v, from: c.to, to: c.from },
  })
}

/** Volume → capacity: 1 cm³ holds 1 mL, 1 m³ holds 1 kL = 1000 L. */
function m813holds(): GameQuestion {
  const kind = pick(['cm3-mL', 'm3-kL', 'm3-L'] as const)
  if (kind === 'cm3-mL') {
    const v = pick([20, 50, 75, 150, 250, 375, 600, 800])
    return gq({
      t: 'holds',
      prompt: `A container has a volume of ${b(U(v, 'cm³'))}. How much liquid does it hold?`,
      ...numOpts(v, [v * 10, v / 10, v * 1000], (x) => U(x, 'mL')),
      why: `1 cm³ holds 1 mL, so ${v} cm³ holds ${v} mL.`,
      meta: { kind, v },
    })
  }
  const v = int(2, 9)
  if (kind === 'm3-kL')
    return gq({
      t: 'holds',
      prompt: `A water tank has a volume of ${b(U(v, 'm³'))}. How many kilolitres does it hold?`,
      ...numOpts(v, [v * 10, v * 100, v * 1000], (x) => U(x, 'kL')),
      why: `1 m³ holds 1 kL, so ${v} m³ holds ${v} kL.`,
      meta: { kind, v },
    })
  return gq({
    t: 'holds',
    prompt: `A water tank has a volume of ${b(U(v, 'm³'))}. How many litres does it hold?`,
    ...numOpts(v * 1000, [v, v * 10, v * 100], (x) => U(x, 'L')),
    why: `1 m³ holds 1000 L, so ${v} m³ holds ${v} ${TIMES} 1000 = ${n(v * 1000)} L.`,
    meta: { kind, v },
  })
}

const CAPACITY_THINGS: [string, string][] = [
  ['a glass of milk', 'mL'],
  ['a bottle of cough medicine', 'mL'],
  ['a teaspoon', 'mL'],
  ['a car’s petrol tank', 'L'],
  ['a bucket', 'L'],
  ['a bathtub', 'L'],
  ['a rainwater tank', 'kL'],
  ['a dam', 'ML'],
  ['an Olympic swimming pool', 'ML'],
]

function m813unit(): GameQuestion {
  const [what, unit] = pick(CAPACITY_THINGS)
  return gq({
    t: 'unit',
    prompt: `Which unit is best for measuring the capacity of ${b(what)}?`,
    correct: unit,
    inOrder: ['mL', 'L', 'kL', 'ML'],
    why: `The capacity of ${what} is best measured in ${{ mL: 'millilitres (mL)', L: 'litres (L)', kL: 'kilolitres (kL)', ML: 'megalitres (ML)' }[unit]}.`,
    meta: { what, unit },
  })
}

const m813size = oneOf([
  () =>
    gq({
      t: 'size',
      prompt: `About how much does ${b('a teaspoon')} hold?`,
      correct: '5 mL',
      inOrder: ['5 mL', '50 mL', '500 mL', '5 L'],
      why: 'A teaspoon holds about 5 mL.',
      meta: { v: 'teaspoon' },
    }),
  () =>
    gq({
      t: 'size',
      prompt: `About how much does ${b('a can of soft drink')} hold?`,
      correct: '375 mL',
      inOrder: ['37.5 mL', '375 mL', '3.75 L', '37.5 L'],
      why: 'A can of soft drink holds 375 mL, a little more than a third of a litre.',
      meta: { v: 'can' },
    }),
  () =>
    gq({
      t: 'size',
      prompt: `About how much does ${b('a household bucket')} hold?`,
      correct: '10 L',
      inOrder: ['10 mL', '100 mL', '10 L', '1000 L'],
      why: 'A household bucket holds about 10 litres.',
      meta: { v: 'bucket' },
    }),
  () =>
    gq({
      t: 'size',
      prompt: `About how much does ${b('a small rainwater tank')} hold?`,
      correct: '1 kL',
      inOrder: ['1 mL', '1 L', '1 kL', '1000 ML'],
      why: 'A small rainwater tank holds about 1 kL, which is 1000 litres.',
      meta: { v: 'tank' },
    }),
  () =>
    gq({
      t: 'size',
      prompt: `${b('Capacity')} is the amount of…`,
      correct: 'liquid a container can hold',
      wrong: ['surface inside a shape', 'distance around a shape', 'time a container takes to fill'],
      why: 'Capacity is the amount of fluid (liquid or gas) a container holds, measured in mL, L, kL or ML.',
      meta: { v: 'definition' },
    }),
])

const SET_813: GameSet = {
  id: 'ncm7-8.13',
  exercise: '8.13',
  ref: 'NCM 7 Ex 8.13',
  title: 'Volume and capacity',
  focus: 'Convert between mL, L, kL and ML, and link volume to capacity: 1 cm³ holds 1 mL and 1 m³ holds 1 kL (1000 L).',
  outcomes: [VOL],
  lessons: ['y7-vol-prism'],
  makers: [mk('fact', m813fact), mk('down', m813down), mk('unit', m813unit), mk('holds', m813holds), mk('up', m813up), mk('size', m813size)],
}

// ================================================================== The chapter

export const NCM7_CH8: GameChapter = {
  id: 'ncm7-ch8',
  number: 8,
  title: 'Area and volume',
  ref: 'NCM 7 Chapter 8',
  strand: 'Measurement and space',
  outcomes: [LEN, ARE, VOL],
  colour: 95,
  sets: [SET_801, SET_802, SET_803, SET_804, SET_805, SET_806, SET_807, SET_808, SET_809, SET_810, SET_811, SET_812, SET_813],
}
