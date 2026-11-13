// Year 7 Area and volume, following New Century Maths 7 (3rd edition, Cengage) Chapter 8 exercise by exercise.
// The questions are the site's own: they practise the same kinds of question as each exercise, in the same
// easy-to-hard order (Foundation = the start of the exercise, Challenge = the end), but none of the textbook's
// wording, numbers or diagrams are copied. Hands-on tasks (measuring with a ruler, drawing on dot paper,
// building with centicubes) become reading, choosing and reasoning questions about the same ideas.
// Flat shapes are drawn to scale from the question's own numbers; drawings of solids say they are not to scale.
import type { Level, Question, Skill, TestItem } from '@/lib/maths/types'
import { D, D2, DIVIDE, MINUS, NOT_TO_SCALE, TIMES, chance, int, mcA, mcFixedA, name, num, numA, pick, q, round, sample, shuffle, v } from './helpers'
import { fig } from '@/lib/maths/diagrams6'
import * as DG from '@/lib/maths/diagrams11'

const LEN = 'MA4-LEN-C-01'
const ARE = 'MA4-ARE-C-01'
const VOL = 'MA4-VOL-C-01'
export const OUTCOMES = [LEN, ARE, VOL]

type P = [number, number]
const big = (s: string) => `<div class="big">${s}</div>`
const it = (s: string) => `<i>${s}</i>`
const HALF = '½'
/** a number and its unit, kept on one line */
const U = (x: number, unit: string) => `${num(x)}\u00a0${unit}`
const sq = (u: string) => u + '²'
const cu = (u: string) => u + '³'
const lenUnit = () => pick(['mm', 'cm', 'm'])
/** 2 → "2 and"… a list in words: "a, b and c" */
const listOf = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`)
/** a one-decimal number between lo and hi that is not a whole number */
const dec1 = (lo: number, hi: number) => {
  let x: number
  do x = int(lo * 10, hi * 10) / 10
  while (Number.isInteger(x))
  return x
}

// ------------------------------------------------------------------ drawings of flat shapes (to scale)

/** A rectangle (or square) with right angles marked and any of its sides labelled. */
function rectD(w: number, h: number, o: { bottom?: string; left?: string; top?: string; right?: string; square?: boolean }): string {
  return fig({
    pts: { A: [0, 0], B: [w, 0], C: [w, h], D: [0, h] },
    polys: [{ v: ['A', 'B', 'C', 'D'] }],
    rights: [
      ['D', 'A', 'B'],
      ['A', 'B', 'C'],
      ['B', 'C', 'D'],
      ['C', 'D', 'A'],
    ],
    ticks: o.square
      ? [
          { a: 'A', b: 'B', n: 1 },
          { a: 'B', b: 'C', n: 1 },
          { a: 'C', b: 'D', n: 1 },
          { a: 'D', b: 'A', n: 1 },
        ]
      : [],
    sides: [
      ...(o.bottom ? [{ a: 'A', b: 'B', text: o.bottom }] : []),
      ...(o.right ? [{ a: 'B', b: 'C', text: o.right }] : []),
      ...(o.top ? [{ a: 'C', b: 'D', text: o.top }] : []),
      ...(o.left ? [{ a: 'D', b: 'A', text: o.left }] : []),
    ],
    maxH: 210,
    label: o.square ? 'A square' : 'A rectangle',
  })
}

/**
 * An L-shape: a W × H rectangle with a w × h corner cut from the top right. Sides, anticlockwise from the bottom:
 * bottom (W), right (H − h), notchH (w), notchV (h), top (W − w), left (H).
 */
function lShapeD(W: number, H: number, w: number, h: number, labels: Partial<Record<'bottom' | 'right' | 'notchH' | 'notchV' | 'top' | 'left', string>>, shade = false): string {
  // N is the corner that was cut away: the notch's horizontal label goes below its edge (inside the shape), the
  // vertical one beside its edge in the gap, so the two never crowd into the notch together
  const pts: Record<string, P> = { A: [0, 0], B: [W, 0], C: [W, H - h], E: [W - w, H - h], F: [W - w, H], G: [0, H], N: [W, H] }
  const keys: [string, string, keyof typeof labels][] = [
    ['A', 'B', 'bottom'],
    ['B', 'C', 'right'],
    ['C', 'E', 'notchH'],
    ['E', 'F', 'notchV'],
    ['F', 'G', 'top'],
    ['G', 'A', 'left'],
  ]
  return fig({
    pts,
    polys: [{ v: ['A', 'B', 'C', 'E', 'F', 'G'], cls: shade ? 'sh areashape' : 'sh' }],
    sides: keys.filter(([, , k]) => labels[k]).map(([a, b, k]) => ({ a, b, text: labels[k]!, away: k === 'notchH' ? 'N' : k === 'notchV' ? 'A' : undefined })),
    maxH: 226,
    pad: 44,
    label: 'An L-shape',
  })
}

/** A U-shape: a W × H rectangle with a w-wide, d-deep gap cut down from the middle of the top. */
function uShapeD(W: number, H: number, w: number, d: number, labels: { bottom: string; left: string; gap: string; depth: string }): string {
  const x0 = (W - w) / 2
  const pts: Record<string, P> = { A: [0, 0], B: [W, 0], C: [W, H], E: [x0 + w, H], F: [x0 + w, H - d], G: [x0, H - d], K: [x0, H], L: [0, H] }
  return fig({
    pts,
    polys: [{ v: ['A', 'B', 'C', 'E', 'F', 'G', 'K', 'L'] }],
    sides: [
      { a: 'A', b: 'B', text: labels.bottom },
      { a: 'L', b: 'A', text: labels.left },
      { a: 'F', b: 'G', text: labels.gap, away: 'A' },
      { a: 'E', b: 'F', text: labels.depth, away: 'A' },
    ],
    maxH: 226,
    pad: 44,
    label: 'A U-shape',
  })
}

/** A shaded rectangle with a rectangular hole (or a rectangular path around a garden), every needed length on it. */
function holeD(W: number, H: number, w: number, h: number, o: { outerW: string; outerH: string; innerW: string; innerH: string; path?: boolean }): string {
  const x0 = (W - w) / 2
  const y0 = (H - h) / 2
  const pts: Record<string, P> = { A: [0, 0], B: [W, 0], C: [W, H], D: [0, H], a: [x0, y0], b: [x0 + w, y0], c: [x0 + w, y0 + h], d: [x0, y0 + h] }
  return fig({
    pts,
    polys: [
      { v: ['A', 'B', 'C', 'D'], cls: 'sh areashape' },
      { v: ['a', 'b', 'c', 'd'], cls: 'sh sh-bg' },
    ],
    sides: [
      { a: 'A', b: 'B', text: o.outerW, away: 'C' },
      { a: 'D', b: 'A', text: o.outerH, away: 'B' },
      // a garden's lengths go just inside it (a hole's are given in the question instead, as there is no room)
      { a: 'a', b: 'b', text: o.innerW, away: 'A' },
      { a: 'd', b: 'a', text: o.innerH, away: 'A' },
    ].filter((x) => x.text),
    maxH: 220,
    pad: 40,
    label: o.path ? 'A path around a rectangle' : 'A rectangle with a rectangular hole',
  })
}

/** A triangle with its base, its dashed perpendicular height (meeting the base `foot` along from the left) and,
 *  if given, its slanted sides. The height's length is written beside the middle of the dashed line. */
function triD(b: number, h: number, foot: number, labels: { base: string; height: string; left?: string; right?: string }): string {
  return fig({
    pts: { A: [0, 0], B: [b, 0], C: [foot, h], F: [foot, 0] },
    polys: [{ v: ['A', 'B', 'C'] }],
    segs: [{ a: 'C', b: 'F', dash: true }],
    rights: [['B', 'F', 'C']],
    sides: [
      { a: 'A', b: 'B', text: labels.base },
      // written on the dashed height itself, so it cannot be mistaken for a slanted side's length
      { a: 'C', b: 'F', text: labels.height, on: true },
      ...(labels.left ? [{ a: 'C', b: 'A', text: labels.left }] : []),
      ...(labels.right ? [{ a: 'B', b: 'C', text: labels.right }] : []),
    ],
    maxH: 226,
    label: 'Triangle with its base and perpendicular height',
  })
}

/** A parallelogram with its base, its dashed perpendicular height and, if given, its slanted side. */
function paraD(b: number, h: number, off: number, labels: { base: string; height: string; slant?: string }): string {
  return fig({
    pts: { A: [0, 0], B: [b, 0], C: [b + off, h], D: [off, h], F: [off, 0] },
    polys: [{ v: ['A', 'B', 'C', 'D'] }],
    segs: [{ a: 'D', b: 'F', dash: true }],
    rights: [['B', 'F', 'D']],
    arrows: [
      { a: 'A', b: 'B', n: 1 },
      { a: 'D', b: 'C', n: 1 },
    ],
    sides: [
      { a: 'A', b: 'B', text: labels.base },
      { a: 'D', b: 'F', text: labels.height, on: true },
      ...(labels.slant ? [{ a: 'B', b: 'C', text: labels.slant }] : []),
    ],
    maxH: 220,
    label: 'Parallelogram with its base and perpendicular height',
  })
}

// ================================================================== 8.01 The metric system

interface Unit {
  u: string
  name: string
  /** size in the smallest unit of its kind */
  s: number
}
const KINDS: Record<'length' | 'mass' | 'capacity' | 'time', Unit[]> = {
  length: [
    { u: 'km', name: 'kilometres', s: 1_000_000 },
    { u: 'm', name: 'metres', s: 1000 },
    { u: 'cm', name: 'centimetres', s: 10 },
    { u: 'mm', name: 'millimetres', s: 1 },
  ],
  mass: [
    { u: 't', name: 'tonnes', s: 1e9 },
    { u: 'kg', name: 'kilograms', s: 1e6 },
    { u: 'g', name: 'grams', s: 1000 },
    { u: 'mg', name: 'milligrams', s: 1 },
  ],
  capacity: [
    { u: 'ML', name: 'megalitres', s: 1e9 },
    { u: 'kL', name: 'kilolitres', s: 1e6 },
    { u: 'L', name: 'litres', s: 1000 },
    { u: 'mL', name: 'millilitres', s: 1 },
  ],
  time: [
    { u: 'days', name: 'days', s: 86400 },
    { u: 'h', name: 'hours', s: 3600 },
    { u: 'min', name: 'minutes', s: 60 },
    { u: 's', name: 'seconds', s: 1 },
  ],
}
type Kind = keyof typeof KINDS
const unitOf = (u: string): [Kind, Unit] => {
  for (const k of Object.keys(KINDS) as Kind[]) {
    const f = KINDS[k].find((x) => x.u === u)
    if (f) return [k, f]
  }
  throw new Error('unit ' + u)
}
const one = (name: string) => (name === 'days' ? 'day' : name.replace(/s$/, '').replace(/^metre$/, 'metre'))
/** single arrows of the textbook's conversion diagrams: [big, small] */
const ARROWS: [string, string][] = [
  ['km', 'm'], ['m', 'cm'], ['cm', 'mm'], ['m', 'mm'],
  ['t', 'kg'], ['kg', 'g'], ['g', 'mg'],
  ['ML', 'kL'], ['kL', 'L'], ['L', 'mL'],
  ['days', 'h'], ['h', 'min'], ['min', 's'],
]
const factor = (big: string, small: string) => unitOf(big)[1].s / unitOf(small)[1].s
const unitWord = (u: string) => unitOf(u)[1].name

function factQ(): Question {
  const [bigU, smallU] = pick(ARROWS)
  const f = factor(bigU, smallU)
  const b1 = bigU === 'days' ? 'day' : bigU
  return q({
    prompt: `Complete the conversion.${big(`1 ${b1} = ___ ${smallU}`)}`,
    answer: numA(f),
    suffix: smallU,
    hint: 'Think of the conversion diagram: each arrow from a larger unit to a smaller unit has its own number.',
    steps: [`1 ${one(unitWord(bigU))} = ${num(f)} ${unitWord(smallU)}`],
    meta: { t: 'convert', v: 1, from: bigU, to: smallU },
  })
}

/** large unit to small unit: multiply */
function downQ(level: Level): Question {
  const [bigU, smallU] = pick(ARROWS)
  const f = factor(bigU, smallU)
  const x = level === 1 ? int(2, 40) : bigU === 'days' || bigU === 'h' || bigU === 'min' ? pick([1.5, 2.5, 3.5, 0.5, 4.5]) : dec1(0.2, 15)
  const ans = round(x * f, 6)
  return q({
    prompt: `Convert ${U(x, bigU)} to ${unitWord(smallU)}.`,
    answer: numA(ans),
    suffix: smallU,
    hint: `To convert a large unit to a small unit, multiply. 1 ${one(unitWord(bigU))} = ${num(f)} ${unitWord(smallU)}.`,
    steps: [`Large unit to small unit: multiply by ${num(f)}.`, `${num(x)} ${TIMES} ${num(f)} = ${num(ans)}`, `${U(x, bigU)} = ${U(ans, smallU)}`],
    meta: { t: 'convert', v: x, from: bigU, to: smallU },
  })
}

/** small unit to large unit: divide */
function upQ(): Question {
  const [bigU, smallU] = pick(ARROWS)
  const f = factor(bigU, smallU)
  const time = bigU === 'days' || bigU === 'h' || bigU === 'min'
  const ans = time ? pick([2, 3, 4, 5, 6, 8, 10, 1.5, 2.5]) : chance(0.6) ? int(2, 30) : pick([0.5, 0.25, 0.75, 1.5, 2.5, 3.2, 4.8, 0.4])
  const x = round(ans * f, 6)
  return q({
    prompt: `Convert ${U(x, smallU)} to ${unitWord(bigU)}.`,
    answer: numA(ans),
    suffix: bigU,
    hint: `To convert a small unit to a large unit, divide. 1 ${one(unitWord(bigU))} = ${num(f)} ${unitWord(smallU)}.`,
    steps: [`Small unit to large unit: divide by ${num(f)}.`, `${num(x)} ${DIVIDE} ${num(f)} = ${num(ans)}`, `${U(x, smallU)} = ${U(ans, bigU)}`],
    meta: { t: 'convert', v: x, from: smallU, to: bigU },
  })
}

function shortestQ(): Question {
  // four lengths: two of them equal in different units, one a little shorter
  const baseCm = pick([20, 30, 40, 50, 60, 80])
  const shortest = baseCm - pick([2, 4, 5])
  const longer = baseCm + pick([3, 6, 9])
  const lengths: { text: string; cm: number }[] = [
    { text: U(baseCm / 100, 'm'), cm: baseCm },
    { text: U(baseCm * 10, 'mm'), cm: baseCm },
    { text: U(shortest, 'cm'), cm: shortest },
    { text: U(longer * 10, 'mm'), cm: longer },
  ]
  const longest = chance()
  const want = longest ? lengths.reduce((a, b) => (b.cm > a.cm ? b : a)) : lengths.reduce((a, b) => (b.cm < a.cm ? b : a))
  return q({
    prompt: `Which length is the ${longest ? 'longest' : 'shortest'}?`,
    answer: mcA(want.text, lengths.filter((l) => l !== want).map((l) => l.text)),
    hint: 'Change every length to the same unit (such as centimetres) before you compare them.',
    steps: [`In centimetres: ${lengths.map((l) => `${l.text} = ${num(l.cm)} cm`).join('; ')}.`, `The ${longest ? 'longest' : 'shortest'} is ${want.text}.`],
    meta: { t: 'extreme', longest, cms: lengths.map((l) => l.cm) },
  })
}

const SENSIBLE: { what: string; unit: string; v: number }[] = [
  { what: 'the height of a Year 7 student', unit: 'cm', v: 150 },
  { what: 'the length of a new pencil', unit: 'cm', v: 18 },
  { what: 'the mass of an apple', unit: 'g', v: 150 },
  { what: 'the mass of a newborn baby', unit: 'kg', v: 3.5 },
  { what: 'the capacity of a drinking glass', unit: 'mL', v: 250 },
  { what: 'the capacity of a kitchen sink', unit: 'L', v: 20 },
  { what: 'the length of a soccer field', unit: 'm', v: 100 },
  { what: 'the time to walk 1 kilometre', unit: 'min', v: 12 },
]

function sensibleQ(): Question {
  const s = pick(SENSIBLE)
  const opts = [s.v / 100, s.v / 10, s.v, s.v * 10].map((x) => U(round(x, 4), s.unit))
  return q({
    prompt: `Which is the most sensible estimate of ${s.what}?`,
    answer: mcFixedA(opts, U(s.v, s.unit)),
    hint: 'Picture the object. Think of a measurement you already know, such as your own height (about 1.5 m) or a 1 L bottle.',
    steps: [`${s.what[0].toUpperCase() + s.what.slice(1)} is about ${U(s.v, s.unit)}. The other estimates are 10 or 100 times too big or too small.`],
    meta: { t: 'sensible', what: s.what },
  })
}

function twoStepQ(): Question {
  const pairs: [string, string, string][] = [
    ['km', 'm', 'cm'],
    ['h', 'min', 's'],
    ['days', 'h', 'min'],
    ['ML', 'kL', 'L'],
    ['kg', 'g', 'mg'],
  ]
  const [a, b, c] = pick(pairs)
  const x = a === 'days' || a === 'h' ? pick([2, 3, 1.5, 4, 0.5]) : pick([2, 3, 4, 5, 1.5, 2.5])
  const f1 = factor(a, b)
  const f2 = factor(b, c)
  const mid = round(x * f1, 6)
  const ans = round(mid * f2, 6)
  return q({
    prompt: `Convert ${U(x, a)} to ${unitWord(c)}.`,
    answer: numA(ans),
    suffix: c,
    hint: `Go one step at a time: ${unitWord(a)} to ${unitWord(b)}, then ${unitWord(b)} to ${unitWord(c)}.`,
    steps: [`${U(x, a)} = ${num(x)} ${TIMES} ${num(f1)} ${b} = ${U(mid, b)}`, `${U(mid, b)} = ${num(mid)} ${TIMES} ${num(f2)} ${c} = ${U(ans, c)}`],
    meta: { t: 'convert', v: x, from: a, to: c },
  })
}

function containersQ(): Question {
  const cup = pick([125, 200, 250, 500])
  let litres: number
  do litres = pick([1, 1.5, 2, 2.5, 3, 4, 5, 6])
  while (((litres * 1000) / cup) % 1 !== 0)
  const n = (litres * 1000) / cup
  const who = name()
  return q({
    prompt: `${who} has ${U(litres, 'L')} of juice. How many ${U(cup, 'mL')} cups can be filled from it?`,
    answer: numA(n),
    suffix: 'cups',
    hint: 'Change the litres to millilitres first, then divide by the size of one cup.',
    steps: [`${U(litres, 'L')} = ${num(litres)} ${TIMES} 1000 mL = ${U(litres * 1000, 'mL')}`, `${num(litres * 1000)} ${DIVIDE} ${cup} = ${n} cups`],
    meta: { t: 'containers', litres, cup },
  })
}

const PREFIX: [string, string][] = [
  ['kilo-', '× 1000'],
  ['centi-', '÷ 100'],
  ['milli-', '÷ 1000'],
  ['mega-', '× 1 000 000'],
]

function prefixQ(): Question {
  const [p, m] = pick(PREFIX)
  const meaning: Record<string, string> = { '× 1000': '1000 times', '÷ 100': 'one-hundredth', '÷ 1000': 'one-thousandth', '× 1 000 000': '1 000 000 times' }
  const options = ['1000 times', 'one-hundredth', 'one-thousandth', '1 000 000 times']
  const eg: Record<string, string> = { 'kilo-': '1 km = 1000 m', 'centi-': '1 cm = 1/100 m', 'milli-': '1 mg = 1/1000 g', 'mega-': '1 ML = 1 000 000 L' }
  return q({
    prompt: `What does the metric prefix <b>${p}</b> mean?`,
    answer: mcFixedA(options, meaning[m]),
    hint: 'Think of a unit that uses the prefix, such as kilometre, centimetre, millilitre or megalitre.',
    steps: [`${p} means ${meaning[m]}: for example, ${eg[p]}.`],
    meta: { t: 'prefix', p },
  })
}

function dayQ(): Question {
  const [ask, ans, steps] = pick([
    ['How many minutes are in one day?', 1440, ['1 day = 24 h', `24 ${TIMES} 60 = 1440 minutes`]],
    ['How many seconds are in one hour?', 3600, ['1 h = 60 min', `60 ${TIMES} 60 = 3600 seconds`]],
    ['How many hours are in one week?', 168, ['1 week = 7 days', `7 ${TIMES} 24 = 168 hours`]],
  ] as [string, number, string[]][])
  return q({
    prompt: ask,
    answer: numA(ans),
    hint: 'Go one step at a time, using the facts you know: 1 day = 24 h, 1 h = 60 min, 1 min = 60 s.',
    steps,
    meta: { t: 'timeFact', ask },
  })
}

export const ex801 = (level: Level): Question => {
  if (level === 1) return pick([factQ, factQ, () => downQ(1)])()
  if (level === 2) return pick([() => downQ(2), upQ, upQ, shortestQ, sensibleQ])()
  return pick([twoStepQ, twoStepQ, containersQ, prefixQ, dayQ])()
}

// ================================================================== 8.02 Perimeter

function squareP(): Question {
  const s = int(3, 25)
  const u = lenUnit()
  return q({
    prompt: 'Find the perimeter of this square.',
    diagram: rectD(1, 1, { bottom: U(s, u), square: true }),
    answer: numA(4 * s),
    suffix: u,
    hint: 'A square has 4 equal sides. Perimeter = 4 × side.',
    steps: [`Perimeter = 4${it('s')}`, `= 4 ${TIMES} ${s}`, `= ${U(4 * s, u)}`],
    meta: { t: 'square', s },
  })
}

function rectP(level: Level): Question {
  let l: number, w: number
  do {
    l = level === 1 ? int(4, 30) : dec1(2, 20)
    w = level === 1 ? int(2, 20) : int(2, 15)
  } while (l === w || l / w > 4 || w / l > 4)
  const u = lenUnit()
  const P = round(2 * (l + w), 6)
  return q({
    prompt: 'Find the perimeter of this rectangle.',
    diagram: rectD(l, w, { bottom: U(l, u), left: U(w, u) }),
    answer: numA(P),
    suffix: u,
    hint: 'A rectangle has 2 lengths and 2 widths. Perimeter = 2 × (length + width).',
    steps: [`Perimeter = 2(${it('l')} + ${it('w')})`, `= 2 ${TIMES} (${num(l)} + ${num(w)})`, `= 2 ${TIMES} ${num(round(l + w, 6))}`, `= ${U(P, u)}`],
    meta: { t: 'rect', l, w },
  })
}

function triP(): Question {
  let a: number, b: number, c: number
  do {
    c = int(6, 20)
    a = int(4, 18)
    b = int(4, 18)
  } while (a + b <= c + 2 || a + c <= b + 2 || b + c <= a + 2 || a === b || b === c || a === c)
  const u = lenUnit()
  return q({
    prompt: 'Find the perimeter of this triangle.',
    diagram: DG.triSides(a, b, c, [U(a, u), U(b, u), U(c, u)]),
    answer: numA(a + b + c),
    suffix: u,
    hint: 'The perimeter is the distance around the outside: add the lengths of all the sides.',
    steps: [`Perimeter = ${a} + ${b} + ${c}`, `= ${U(a + b + c, u)}`],
    meta: { t: 'tri', sides: [a, b, c] },
  })
}

function regularP(): Question {
  const n = pick([3, 5, 6, 8])
  const s = int(3, 15)
  const u = lenUnit()
  const shape = { 3: 'equilateral triangle', 5: 'regular pentagon', 6: 'regular hexagon', 8: 'regular octagon' }[n]!
  return q({
    prompt: `This is ${n === 3 ? 'an' : 'a'} ${shape}: all its sides are equal. Find its perimeter.`,
    diagram: DG.regularPolygon(n, U(s, u)),
    answer: numA(n * s),
    suffix: u,
    hint: `The marks show that the ${n} sides are all the same length.`,
    steps: [`There are ${n} equal sides of ${U(s, u)}.`, `Perimeter = ${n} ${TIMES} ${s} = ${U(n * s, u)}`],
    meta: { t: 'regular', n, s },
  })
}

function lShapeP(level: Level): Question {
  let W: number, H: number, w: number, h: number
  do {
    W = int(6, 16)
    H = int(6, 14)
    w = int(2, W - 3)
    h = int(2, H - 3)
  } while (W / H > 2.2 || H / W > 2.2 || w < 0.35 * W || h < 0.35 * H || W - w < 0.3 * W || H - h < 0.3 * H)
  const u = pick(['cm', 'm'])
  const L = (x: number) => U(x, u)
  // Foundation-style: every side labelled. Standard: two sides left for the student to work out.
  const sets = [
    { labels: { bottom: L(W), left: L(H), notchH: L(w), notchV: L(h) }, missing: [`top: ${W} ${MINUS} ${w} = ${W - w}`, `short right side: ${H} ${MINUS} ${h} = ${H - h}`] },
    { labels: { bottom: L(W), right: L(H - h), notchV: L(h), top: L(W - w) }, missing: [`left side: ${H - h} + ${h} = ${H}`, `notch: ${W} ${MINUS} ${W - w} = ${w}`] },
    { labels: { top: L(W - w), notchH: L(w), left: L(H), right: L(H - h) }, missing: [`bottom: ${W - w} + ${w} = ${W}`, `notch: ${H} ${MINUS} ${H - h} = ${h}`] },
  ]
  const pickSet = pick(sets)
  const labels = level === 1 ? { bottom: L(W), right: L(H - h), notchH: L(w), notchV: L(h), top: L(W - w), left: L(H) } : pickSet.labels
  const P = 2 * (W + H)
  const sides = [W, H - h, w, h, W - w, H]
  return q({
    prompt: level === 1 ? 'Find the perimeter of this shape.' : 'Find the missing side lengths, then find the perimeter of this shape.',
    diagram: lShapeD(W, H, w, h, labels),
    answer: numA(P),
    suffix: u,
    hint: level === 1 ? 'Add all 6 side lengths. Tick each side off as you add it.' : 'Use the other sides: the two shorter vertical sides together are as long as the long vertical side, and the same for the horizontal sides.',
    steps: [
      ...(level === 1 ? [] : [`Missing sides: ${pickSet.missing.join('; ')}.`]),
      `Perimeter = ${sides.join(' + ')}`,
      `= ${L(P)}`,
      `Shortcut: moving the two notch sides out makes a ${W} by ${H} rectangle with the same perimeter, 2 ${TIMES} (${W} + ${H}) = ${P}.`,
    ],
    meta: { t: 'lshape', W, H, w, h },
  })
}

function houseP(): Question {
  const w = int(4, 14)
  const h = int(3, 12)
  const u = pick(['cm', 'm'])
  const P = 3 * w + 2 * h
  return q({
    prompt: `A rectangle and an equilateral triangle are joined along the dashed line. Find the perimeter of the whole shape.`,
    diagram: fig({
      pts: { A: [0, 0], B: [w, 0], C: [w, h], D: [0, h], E: [w / 2, h + (w * Math.sqrt(3)) / 2] },
      polys: [{ v: ['A', 'B', 'C', 'E', 'D'] }],
      segs: [{ a: 'D', b: 'C', dash: true }],
      rights: [
        ['D', 'A', 'B'],
        ['A', 'B', 'C'],
      ],
      ticks: [
        { a: 'C', b: 'E', n: 1 },
        { a: 'E', b: 'D', n: 1 },
      ],
      sides: [
        { a: 'A', b: 'B', text: U(w, u) },
        { a: 'B', b: 'C', text: U(h, u) },
      ],
      maxH: 226,
      label: 'A rectangle with an equilateral triangle on top',
    }),
    answer: numA(P),
    suffix: u,
    hint: 'The dashed line is inside the shape, so it is not part of the perimeter. Each side of the triangle is as long as the top of the rectangle.',
    steps: [`The triangle's 2 outside sides are ${U(w, u)} each (it is equilateral, and its third side is the top of the rectangle).`, `Perimeter = ${w} + ${h} + ${w} + ${w} + ${h}`, `= ${U(P, u)}`],
    meta: { t: 'house', w, h },
  })
}

function backP(): Question {
  const u = pick(['cm', 'm', 'mm'])
  if (chance()) {
    const s = chance(0.7) ? int(3, 30) : int(10, 30) + pick([0.25, 0.5, 0.75])
    const P = round(4 * s, 6)
    return q({
      prompt: `A square has a perimeter of ${U(P, u)}. How long is each side?`,
      answer: numA(s),
      suffix: u,
      hint: 'A square has 4 equal sides, so share the perimeter equally between them.',
      steps: [`Side = perimeter ${DIVIDE} 4`, `= ${num(P)} ${DIVIDE} 4`, `= ${U(s, u)}`],
      meta: { t: 'backSquare', P },
    })
  }
  let l: number, w: number
  do {
    l = int(5, 30)
    w = int(2, 20)
  } while (l <= w)
  const P = 2 * (l + w)
  const askW = chance()
  return q({
    prompt: `A rectangle has a perimeter of ${U(P, u)}. Its ${askW ? 'length' : 'width'} is ${U(askW ? l : w, u)}. Find its ${askW ? 'width' : 'length'}.`,
    answer: numA(askW ? w : l),
    suffix: u,
    hint: 'Half the perimeter is one length plus one width.',
    steps: [`Length + width = ${P} ${DIVIDE} 2 = ${l + w}`, `${askW ? 'Width' : 'Length'} = ${l + w} ${MINUS} ${askW ? l : w} = ${U(askW ? w : l, u)}`],
    meta: { t: 'backRect', P, known: askW ? l : w },
  })
}

function dimsP(): Question {
  const half = int(8, 25)
  const P = 2 * half
  const u = pick(['cm', 'm'])
  const l = int(Math.ceil(half / 2) + 1, half - 2)
  const pair = (x: number, y: number) => `${U(x, u)} by ${U(y, u)}`
  const right = pair(l, half - l)
  // the usual mistakes: the two sides add to the whole perimeter, or to one more or one less than half of it
  const wrong = [pair(half + 2, half - 2), pair(l + 1, half - l), pair(l, half - l - 1)]
  return q({
    prompt: `A rectangle has a perimeter of ${U(P, u)}. Which could be its length and width?`,
    answer: mcA(right, wrong),
    hint: 'The length plus the width must be half the perimeter.',
    steps: [`Half the perimeter is ${P} ${DIVIDE} 2 = ${half}, so the length and width must add to ${half}.`, `${l} + ${half - l} = ${half}, so ${right} works. Check: 2 ${TIMES} (${l} + ${half - l}) = ${P}.`],
    meta: { t: 'dims', P },
  })
}

function uShapeP(): Question {
  let W: number, H: number, w: number, d: number
  do {
    W = int(8, 16)
    H = int(5, 12)
    w = int(2, W - 4)
    d = int(2, H - 2)
  } while (W / H > 2.4 || H / W > 2 || w < 0.3 * W || d < 0.35 * H || H - d < 0.3 * H || (W - w) / 2 < 0.2 * W)
  const u = pick(['cm', 'm'])
  const P = 2 * (W + H) + 2 * d
  return q({
    prompt: 'A gap has been cut from the top of a rectangle. Find the perimeter of the shape that is left.',
    diagram: uShapeD(W, H, w, d, { bottom: U(W, u), left: U(H, u), gap: U(w, u), depth: U(d, u) }),
    answer: numA(P),
    suffix: u,
    hint: 'The sides along the top and the outside still add up to a rectangle’s perimeter. The two sides of the gap are extra.',
    steps: [
      `The outside of the ${W} by ${H} rectangle: 2 ${TIMES} (${W} + ${H}) = ${2 * (W + H)}. (The top pieces plus the gap's bottom make up the full top.)`,
      `The two sides of the gap add 2 ${TIMES} ${d} = ${2 * d}.`,
      `Perimeter = ${2 * (W + H)} + ${2 * d} = ${U(P, u)}`,
    ],
    meta: { t: 'ushape', W, H, w, d },
  })
}

export const ex802 = (level: Level): Question => {
  if (level === 1) return pick([squareP, () => rectP(1), triP, regularP, () => lShapeP(1)])()
  if (level === 2) return pick([() => rectP(2), () => lShapeP(2), () => lShapeP(2), houseP])()
  return pick([backP, backP, dimsP, uShapeP])()
}

// ================================================================== 8.03 Circumference of a circle

const PARTS = ['Radius', 'Diameter', 'Circumference', 'Centre']

function partC(): Question {
  const part = pick(['radius', 'diameter', 'circumference'] as const)
  const def = { radius: 'the distance from the centre to the edge', diameter: 'the distance right across the circle through the centre', circumference: 'the distance around the circle (its perimeter)' }
  return q({
    prompt: 'What is the part of the circle shown in colour called?',
    diagram: DG.circlePart(part),
    answer: mcFixedA(PARTS, part[0].toUpperCase() + part.slice(1)),
    hint: 'Radius: centre to the edge. Diameter: right across through the centre. Circumference: all the way around.',
    steps: [`The coloured part is ${def[part]}: the ${part}.`],
    meta: { t: 'part', part },
  })
}

function rdC(): Question {
  const u = lenUnit()
  if (chance()) {
    const r = chance(0.7) ? int(2, 40) : dec1(1, 20)
    return q({
      prompt: `A circle has a radius of ${U(r, u)}. How long is its diameter?`,
      diagram: D.circleShape(U(r, u), 'radius'),
      answer: numA(round(2 * r, 6)),
      suffix: u,
      hint: 'The diameter goes right across the circle: it is 2 radii long.',
      steps: [`${it('d')} = 2${it('r')} = 2 ${TIMES} ${num(r)} = ${U(round(2 * r, 6), u)}`],
      meta: { t: 'diameter', r },
    })
  }
  const d = chance(0.7) ? 2 * int(2, 30) : int(3, 40) * 2 - 1
  return q({
    prompt: `A circle has a diameter of ${U(d, u)}. How long is its radius?`,
    diagram: D.circleShape(U(d, u), 'diameter'),
    answer: numA(d / 2),
    suffix: u,
    hint: 'The radius is half of the diameter.',
    steps: [`${it('r')} = ${it('d')} ${DIVIDE} 2 = ${num(d)} ${DIVIDE} 2 = ${U(d / 2, u)}`],
    meta: { t: 'radius', d },
  })
}

function estimateC(): Question {
  const u = lenUnit()
  const fromR = chance()
  const x = int(2, 15)
  const d = fromR ? 2 * x : x
  return q({
    prompt: `Estimate the circumference of a circle with a ${fromR ? 'radius' : 'diameter'} of ${U(x, u)}. Use π ≈ 3.`,
    diagram: D.circleShape(U(x, u), fromR ? 'radius' : 'diameter'),
    answer: numA(3 * d),
    suffix: u,
    hint: `The circumference is about 3 times the diameter.${fromR ? ' Double the radius to get the diameter first.' : ''}`,
    steps: [...(fromR ? [`Diameter = 2 ${TIMES} ${x} = ${U(d, u)}`] : []), `${it('C')} ≈ 3 ${TIMES} ${d} = ${U(3 * d, u)}`],
    meta: { t: 'estimate', d },
  })
}

function exactC(): Question {
  const u = lenUnit()
  const fromR = chance()
  const x = int(2, 15)
  const d = fromR ? 2 * x : x
  const right = `${num(d)}π ${u}`
  const wrong = fromR ? [`${num(x)}π ${u}`, `${num(4 * x)}π ${u}`, `${num(x * x)}π ${u}`] : [`${num(2 * d)}π ${u}`, `${num(d / 2)}π ${u}`, `${num(d * d)}π ${u}`]
  return q({
    prompt: `A circle has a ${fromR ? 'radius' : 'diameter'} of ${U(x, u)}. What is its circumference, in terms of π?`,
    diagram: D.circleShape(U(x, u), fromR ? 'radius' : 'diameter'),
    answer: mcA(right, wrong),
    hint: `${it('C')} = π${it('d')} or ${it('C')} = 2π${it('r')}. Leave π in the answer.`,
    steps: fromR ? [`${it('C')} = 2π${it('r')}`, `= 2 ${TIMES} π ${TIMES} ${x}`, `= ${right}`] : [`${it('C')} = π${it('d')}`, `= π ${TIMES} ${x}`, `= ${right}`],
    meta: { t: 'exact', d },
  })
}

function calcC(level: Level): Question {
  const u = lenUnit()
  const fromR = chance()
  const x = level === 2 ? int(2, 30) : dec1(1, 20)
  const d = round(fromR ? 2 * x : x, 6)
  const dp = pick([1, 2])
  const C = Math.PI * d
  return q({
    prompt: `Find the circumference of a circle with a ${fromR ? 'radius' : 'diameter'} of ${U(x, u)}, correct to ${dp} decimal place${dp > 1 ? 's' : ''}.`,
    diagram: D.circleShape(U(x, u), fromR ? 'radius' : 'diameter'),
    answer: numA(C, dp),
    suffix: u,
    calc: true,
    hint: `${it('C')} = π${it('d')} or ${it('C')} = 2π${it('r')}. Use the π key on the calculator, then round.`,
    steps: [fromR ? `${it('C')} = 2π${it('r')} = 2 ${TIMES} π ${TIMES} ${num(x)}` : `${it('C')} = π${it('d')} = π ${TIMES} ${num(x)}`, `= ${num(round(C, 5))}…`, `≈ ${U(round(C, dp), u)}`],
    meta: { t: 'calc', d, dp },
  })
}

function wordC(): Question {
  const k = pick(['pond', 'wheel', 'clock', 'plate'] as const)
  const story = {
    pond: { d: int(2, 9) + 0.5, u: 'm', txt: (x: number) => `A round pond has a diameter of ${U(x, 'm')}. How far is it around the edge of the pond, to the nearest tenth of a metre?`, dp: 1 },
    wheel: { d: int(40, 75), u: 'cm', txt: (x: number) => `A bicycle wheel has a diameter of ${U(x, 'cm')}. How far does the bike move in one full turn of the wheel, to the nearest centimetre?`, dp: 0 },
    clock: { d: int(10, 24), u: 'cm', txt: (x: number) => `The minute hand of a clock is ${U(x, 'cm')} long. How far does its tip travel in one hour, to the nearest centimetre?`, dp: 0 },
    plate: { d: int(20, 30), u: 'cm', txt: (x: number) => `A ribbon is glued around the edge of a round plate with a diameter of ${U(x, 'cm')}. How long is the ribbon, to the nearest centimetre?`, dp: 0 },
  }[k]
  const isR = k === 'clock'
  const dReal = isR ? 2 * story.d : story.d
  const C = Math.PI * dReal
  return q({
    prompt: story.txt(story.d),
    answer: numA(C, story.dp),
    suffix: story.u,
    calc: true,
    hint: isR ? 'The hand is a radius: its tip goes once around a circle in one hour.' : 'The distance around the circle is its circumference.',
    steps: [isR ? `${it('C')} = 2π${it('r')} = 2 ${TIMES} π ${TIMES} ${num(story.d)}` : `${it('C')} = π${it('d')} = π ${TIMES} ${num(story.d)}`, `= ${num(round(C, 4))}…`, `≈ ${U(round(C, story.dp), story.u)}`],
    meta: { t: 'calc', d: dReal, dp: story.dp },
  })
}

function turnsC(): Question {
  const d = pick([50, 55, 60, 65, 70])
  const km = pick([1, 2, 3])
  const per = Math.PI * d
  const turns = Math.floor((km * 100000) / per)
  return q({
    prompt: `A wheel has a diameter of ${U(d, 'cm')}. How many complete turns does it make while rolling ${U(km, 'km')}?`,
    answer: numA(turns),
    suffix: 'turns',
    calc: true,
    hint: 'Find how far the wheel rolls in one turn (its circumference). Change the kilometres to centimetres, then divide.',
    steps: [`One turn: ${it('C')} = π ${TIMES} ${d} ≈ ${num(round(per, 2))} cm`, `${U(km, 'km')} = ${U(km * 100000, 'cm')}`, `${num(km * 100000)} ${DIVIDE} ${num(round(per, 2))} ≈ ${num(round((km * 100000) / per, 2))}`, `${turns} complete turns`],
    meta: { t: 'turns', d, km },
  })
}

function backC(): Question {
  const d = int(5, 60)
  const C = round(Math.PI * d, 2)
  return q({
    prompt: `A circle has a circumference of ${U(C, 'cm')}. Find its diameter, to the nearest centimetre.`,
    answer: numA(C / Math.PI, 0),
    suffix: 'cm',
    calc: true,
    hint: `${it('C')} = π${it('d')}, so ${it('d')} = ${it('C')} ${DIVIDE} π.`,
    steps: [`${it('d')} = ${it('C')} ${DIVIDE} π = ${num(C)} ${DIVIDE} π`, `≈ ${num(round(C / Math.PI, 3))}`, `≈ ${U(d, 'cm')}`],
    meta: { t: 'backC', C },
  })
}

function semiC(): Question {
  const d = 2 * int(3, 15)
  const u = pick(['cm', 'm'])
  const P = (Math.PI * d) / 2 + d
  return q({
    prompt: `Find the perimeter of this semicircle, correct to one decimal place.`,
    diagram: D.circleShape(U(d, u), 'diameter', 'semi'),
    answer: numA(P, 1),
    suffix: u,
    calc: true,
    hint: 'The perimeter is the curved part (half a circumference) plus the straight diameter.',
    steps: [`Curved part = ${HALF} ${TIMES} π ${TIMES} ${d} = ${num(round((Math.PI * d) / 2, 3))}…`, `Perimeter = ${num(round((Math.PI * d) / 2, 3))}… + ${d}`, `≈ ${U(round(P, 1), u)}`],
    meta: { t: 'semi', d },
  })
}

export const ex803 = (level: Level): Question => {
  if (level === 1) return pick([partC, rdC, rdC, estimateC])()
  if (level === 2) return pick([exactC, () => calcC(2), () => calcC(2), wordC])()
  return pick([() => calcC(3), turnsC, backC, semiC])()
}

// ================================================================== 8.04 Metric units for area

/** size of each unit of area in square metres */
const AREA_SIZE: Record<string, number> = { 'mm²': 1e-6, 'cm²': 1e-4, 'm²': 1, ha: 1e4, 'km²': 1e6 }
const AREA_WORD: Record<string, string> = { 'mm²': 'square millimetres', 'cm²': 'square centimetres', 'm²': 'square metres', ha: 'hectares', 'km²': 'square kilometres' }
/** the arrows of the conversion diagram, [larger, smaller], and the extra km² ones */
const AREA_ARROWS: [string, string][] = [['cm²', 'mm²'], ['m²', 'cm²'], ['ha', 'm²']]
const AREA_ARROWS3: [string, string][] = [['m²', 'mm²'], ['km²', 'ha'], ['km²', 'm²']]
const aFactor = (a: string, b: string) => round(AREA_SIZE[a] / AREA_SIZE[b], 6)
const AREA_UNITS = ['mm²', 'cm²', 'm²', 'ha', 'km²']
const AREA_OF: [string, string][] = [
  ['the top of a pin head', 'mm²'],
  ['a page of an exercise book', 'cm²'],
  ['a bathroom tile', 'cm²'],
  ['a classroom floor', 'm²'],
  ['a house block', 'm²'],
  ['a wheat farm', 'ha'],
  ['a vineyard', 'ha'],
  ['the state of New South Wales', 'km²'],
  ['a large lake', 'km²'],
]

function areaUnitQ(): Question {
  const [what, u] = pick(AREA_OF)
  return q({
    prompt: `Which unit of area would you use to measure the area of ${what}?`,
    answer: mcFixedA(AREA_UNITS, u),
    hint: 'A square millimetre is tiny, a square centimetre is about a fingernail, a square metre is about a shower floor, a hectare is about a football field and a square kilometre is 100 hectares.',
    steps: [`${what[0].toUpperCase() + what.slice(1)} is best measured in ${AREA_WORD[u]} (${u}).`],
    meta: { t: 'areaUnit', what },
  })
}

function areaFactQ(): Question {
  const [a, b] = pick([...AREA_ARROWS, ['km²', 'ha'] as [string, string]])
  const f = aFactor(a, b)
  const side: Record<string, string> = { 'cm²': '1 cm = 10 mm, so 1 cm² = 10 × 10 mm²', 'm²': '1 m = 100 cm, so 1 m² = 100 × 100 cm²', ha: 'A hectare is a square 100 m by 100 m, so 1 ha = 100 × 100 m²', 'km²': '1 km² is 1000 m by 1000 m = 1 000 000 m², and 1 000 000 ÷ 10 000 = 100' }
  return q({
    prompt: `Complete the conversion.${big(`1 ${a} = ___ ${b}`)}`,
    answer: numA(f),
    suffix: b,
    hint: 'Think of a square with sides of 1 unit, and write its sides in the smaller unit.',
    steps: [side[a], `1 ${a} = ${num(f)} ${b}`],
    meta: { t: 'areaConv', v: 1, from: a, to: b },
  })
}

function areaConvQ(level: Level): Question {
  const [a, b] = level === 3 ? pick(AREA_ARROWS3) : pick(AREA_ARROWS)
  const f = aFactor(a, b)
  const downward = chance()
  // a friendly number in the larger unit
  const x = level === 2 ? pick([int(2, 40), dec1(0.2, 9), pick([0.5, 0.25, 0.75, 2.5])]) : pick([int(2, 9), pick([0.5, 1.5, 2.5, 0.2])])
  const big_ = round(x, 6)
  const small = round(x * f, 6)
  const [from, to, v, ans] = downward ? [a, b, big_, small] : [b, a, small, big_]
  return q({
    prompt: `Convert ${U(v, from)} to ${AREA_WORD[to]}.`,
    answer: numA(ans),
    suffix: to,
    hint: downward ? `Larger unit to smaller unit: multiply. 1 ${a} = ${num(f)} ${b}.` : `Smaller unit to larger unit: divide. 1 ${a} = ${num(f)} ${b}.`,
    steps: [downward ? `${num(v)} ${TIMES} ${num(f)} = ${num(ans)}` : `${num(v)} ${DIVIDE} ${num(f)} = ${num(ans)}`, `${U(v, from)} = ${U(ans, to)}`],
    meta: { t: 'areaConv', v, from, to },
  })
}

const ABOUT_AREA: { what: string; v: number; u: string }[] = [
  { what: 'a postage stamp', v: 6, u: 'cm²' },
  { what: 'a tennis court', v: 260, u: 'm²' },
  { what: 'the screen of a mobile phone', v: 90, u: 'cm²' },
  { what: 'a basketball court', v: 420, u: 'm²' },
  { what: 'a large cattle station', v: 5000, u: 'km²' },
  { what: 'a school oval', v: 2, u: 'ha' },
  { what: 'a grain of rice, seen from above', v: 6, u: 'mm²' },
]

function aboutAreaQ(): Question {
  const s = pick(ABOUT_AREA)
  const opts = ['mm²', 'cm²', 'm²', 'ha', 'km²'].filter((u) => u !== s.u)
  const wrong = sample(opts, 3)
  return q({
    prompt: `Which is the best estimate of the area of ${s.what}?`,
    answer: mcFixedA([...wrong, s.u].sort((x, y) => AREA_SIZE[x] - AREA_SIZE[y]).map((u) => U(s.v, u)), U(s.v, s.u)),
    hint: 'All the numbers are the same, so look at the units. Picture a square of each size.',
    steps: [`${s.what[0].toUpperCase() + s.what.slice(1)} has an area of about ${U(s.v, s.u)}.`],
    meta: { t: 'aboutArea', what: s.what },
  })
}

function orderAreaQ(): Question {
  // three areas near each other, each written in a different unit
  const units = shuffle(['mm²', 'cm²', 'm²'])
  let m2: number[]
  do m2 = [dec1(0.5, 9), dec1(0.5, 9), dec1(0.5, 9)]
  while (new Set(m2).size < 3 || Math.min(...m2.map((x, i) => Math.min(...m2.filter((_, j) => j !== i).map((y) => Math.abs(x - y))))) < 0.3)
  const items = m2.map((x, i) => ({ m2: x, text: U(round(x / AREA_SIZE[units[i]], 6), units[i]) }))
  const asc = items.slice().sort((a, b) => a.m2 - b.m2)
  const right = asc.map((x) => x.text).join(', ')
  const perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]].map((p) => p.map((k) => items[k].text).join(', '))
  return q({
    prompt: 'Write these areas in ascending order (smallest first).',
    answer: mcA(right, shuffle(perms.filter((p) => p !== right)).slice(0, 3)),
    hint: 'Change them all to the same unit (square metres is easiest) before comparing.',
    steps: [...items.map((x) => `${x.text} = ${U(x.m2, 'm²')}`), `Smallest to largest: ${right}`],
    meta: { t: 'orderArea', m2 },
  })
}

function storyAreaQ(): Question {
  const ha = pick([2.5, 4.5, 12, 30, 0.8, 6.4, 15])
  const m2 = round(ha * 10000, 6)
  const toHa = chance()
  return q({
    prompt: toHa ? `A sports park has an area of ${U(m2, 'm²')}. What is its area in hectares?` : `A farm paddock has an area of ${U(ha, 'ha')}. What is its area in square metres?`,
    answer: numA(toHa ? ha : m2),
    suffix: toHa ? 'ha' : 'm²',
    hint: '1 ha = 10 000 m².',
    steps: [toHa ? `${num(m2)} ${DIVIDE} 10 000 = ${num(ha)}` : `${num(ha)} ${TIMES} 10 000 = ${num(m2)}`, toHa ? `The park is ${U(ha, 'ha')}.` : `The paddock is ${U(m2, 'm²')}.`],
    meta: { t: 'areaConv', v: toHa ? m2 : ha, from: toHa ? 'm²' : 'ha', to: toHa ? 'ha' : 'm²' },
  })
}

export const ex804 = (level: Level): Question => {
  if (level === 1) return pick([areaUnitQ, areaFactQ, areaFactQ])()
  if (level === 2) return pick([() => areaConvQ(2), () => areaConvQ(2), aboutAreaQ, storyAreaQ])()
  return pick([orderAreaQ, () => areaConvQ(3), () => areaConvQ(3), storyAreaQ])()
}

// ================================================================== 8.05 Area of a rectangle

/** two side lengths whose ratio can be drawn (no thinner than 1 : 4) */
function sides(lo: number, hi: number, decimals = false): [number, number] {
  let l: number, w: number
  do {
    l = decimals ? dec1(lo, hi) : int(lo, hi)
    w = int(Math.max(2, Math.ceil(lo / 2)), hi)
  } while (l === w || l / w > 4 || w / l > 4)
  return l > w ? [l, w] : [w, l]
}

function rectA(level: Level): Question {
  const u = lenUnit()
  const [l, w] = level === 1 ? sides(3, 15) : sides(2, 14, true)
  const A = round(l * w, 6)
  return q({
    prompt: 'Find the area of this rectangle.',
    diagram: rectD(l, w, { bottom: U(l, u), left: U(w, u) }),
    answer: numA(A),
    suffix: sq(u),
    calc: level > 1,
    hint: 'Area of a rectangle = length × width. Area is measured in square units.',
    steps: [`${it('A')} = ${it('lw')}`, `= ${num(l)} ${TIMES} ${num(w)}`, `= ${U(A, sq(u))}`],
    meta: { t: 'rectArea', l, w },
  })
}

function squareA(): Question {
  const u = lenUnit()
  const s = int(2, 15)
  return q({
    prompt: 'Find the area of this square.',
    diagram: rectD(1, 1, { bottom: U(s, u), square: true }),
    answer: numA(s * s),
    suffix: sq(u),
    hint: `All 4 sides of a square are equal, so the area is side × side, or ${it('s')}².`,
    steps: [`${it('A')} = ${it('s')}²`, `= ${s} ${TIMES} ${s}`, `= ${U(s * s, sq(u))}`],
    meta: { t: 'rectArea', l: s, w: s },
  })
}

function mixedA(): Question {
  const m = int(2, 6)
  const cm = pick([20, 40, 50, 60, 80, 120, 150, 250])
  const A = round((m * cm) / 100, 6)
  const longer = Math.max(m, cm / 100)
  const shorter = Math.min(m, cm / 100)
  return q({
    prompt: `A window is ${U(m, 'm')} wide and ${U(cm, 'cm')} high. Find its area in square metres.`,
    diagram: rectD(longer, shorter, longer === m ? { bottom: U(m, 'm'), left: U(cm, 'cm') } : { bottom: U(cm, 'cm'), left: U(m, 'm') }),
    answer: numA(A),
    suffix: 'm²',
    hint: 'Change both lengths to metres first: 100 cm = 1 m.',
    steps: [`${U(cm, 'cm')} = ${num(cm)} ${DIVIDE} 100 = ${U(cm / 100, 'm')}`, `${it('A')} = ${m} ${TIMES} ${num(cm / 100)} = ${U(A, 'm²')}`],
    meta: { t: 'rectArea', l: m, w: cm / 100 },
  })
}

function squareSideA(): Question {
  const s = int(2, 15)
  const u = lenUnit()
  return q({
    prompt: `A square has an area of ${U(s * s, sq(u))}. How long is each side?`,
    answer: numA(s),
    suffix: u,
    hint: 'Which number multiplied by itself gives the area?',
    steps: [`${s} ${TIMES} ${s} = ${s * s}`, `Each side is ${U(s, u)}.`],
    meta: { t: 'squareSide', A: s * s },
  })
}

function missingSideA(): Question {
  const u = lenUnit()
  const w = int(2, 12)
  const l = chance() ? int(3, 15) : int(3, 15) + 0.5
  const A = round(l * w, 6)
  return q({
    prompt: `A rectangle has an area of ${U(A, sq(u))} and a width of ${U(w, u)}. How long is it?`,
    answer: numA(l),
    suffix: u,
    hint: 'Area = length × width, so length = area ÷ width.',
    steps: [`${it('l')} = ${it('A')} ${DIVIDE} ${it('w')}`, `= ${num(A)} ${DIVIDE} ${w}`, `= ${U(l, u)}`],
    meta: { t: 'missingSide', A, w },
  })
}

function costA(): Question {
  const [l, w] = sides(3, 9)
  const price = pick([12, 15, 18, 24, 25, 30, 35, 40, 45])
  const what = pick(['carpet', 'turf', 'floor tiles'])
  const cost = l * w * price
  return q({
    prompt: `A rectangular room is ${U(l, 'm')} long and ${U(w, 'm')} wide. ${what[0].toUpperCase() + what.slice(1)} costs $${price} per square metre. How much will it cost to cover the floor?`,
    answer: numA(cost),
    prefix: '$',
    calc: true,
    hint: 'Find the area of the floor first, then multiply by the cost of one square metre.',
    steps: [`Area = ${l} ${TIMES} ${w} = ${U(l * w, 'm²')}`, `Cost = ${l * w} ${TIMES} $${price} = $${num(cost)}`],
    meta: { t: 'cost', l, w, price },
  })
}

function tilesA(): Question {
  const tile = pick([20, 25, 40, 50])
  const per = 100 / tile
  let l: number, w: number
  do {
    l = int(2, 6) + pick([0, 0.5])
    w = int(2, 5) + pick([0, 0.5])
  } while (((l * 100) / tile) % 1 !== 0 || ((w * 100) / tile) % 1 !== 0 || l === w)
  const n = ((l * 100) / tile) * ((w * 100) / tile)
  return q({
    prompt: `A floor is ${U(l, 'm')} by ${U(w, 'm')}. How many square tiles with sides of ${U(tile, 'cm')} are needed to cover it?`,
    answer: numA(n),
    suffix: 'tiles',
    calc: true,
    hint: 'Work in centimetres. How many tiles fit along each side of the floor?',
    steps: [`Along the length: ${num(l * 100)} cm ${DIVIDE} ${tile} = ${num((l * 100) / tile)} tiles`, `Along the width: ${num(w * 100)} cm ${DIVIDE} ${tile} = ${num((w * 100) / tile)} tiles`, `${num((l * 100) / tile)} ${TIMES} ${num((w * 100) / tile)} = ${num(n)} tiles`],
    meta: { t: 'tiles', l, w, tile, per },
  })
}

function enlargeA(): Question {
  const s = int(2, 6)
  const k = pick([2, 3, 4])
  const A1 = s * s
  const A2 = (k * s) ** 2
  return q({
    prompt: `A square with an area of ${U(A1, 'cm²')} is enlarged so that its area becomes ${U(A2, 'cm²')}. By what number was each side multiplied?`,
    answer: mcA(String(k), [...new Set([k * k, A2 - A1, k + 1, 2 * k + 1].filter((x) => x !== k))].slice(0, 3).map(String)),
    hint: 'Find the side length before and after.',
    steps: [`Before: ${s} ${TIMES} ${s} = ${A1}, so the side was ${U(s, 'cm')}.`, `After: ${k * s} ${TIMES} ${k * s} = ${A2}, so the side is ${U(k * s, 'cm')}.`, `${k * s} ${DIVIDE} ${s} = ${k}. (The area grew ${k * k} times, but each side only ${k} times.)`],
    meta: { t: 'enlarge', s, k },
  })
}

export const ex805 = (level: Level): Question => {
  if (level === 1) return pick([() => rectA(1), () => rectA(1), squareA])()
  if (level === 2) return pick([() => rectA(2), mixedA, squareSideA, missingSideA])()
  return pick([costA, tilesA, enlargeA, mixedA])()
}

// ================================================================== 8.06 Area of a triangle

/** triangles whose slanted sides are whole numbers: [left horizontal, right horizontal, height, left side, right side] */
const NICE_TRI: [number, number, number, number, number][] = [
  [5, 9, 12, 13, 15],
  [9, 16, 12, 15, 20],
  [6, 15, 8, 10, 17],
  [6, 6, 8, 10, 10],
  [5, 5, 12, 13, 13],
  [8, 8, 6, 10, 10],
  [16, 5, 12, 20, 13],
  [8, 20, 15, 17, 25],
]
/** obtuse triangles with the height outside: [base, overhang, height, long side, short side] */
const NICE_OBTUSE: [number, number, number, number, number][] = [
  [11, 5, 12, 20, 13],
  [7, 9, 12, 20, 15],
  [9, 6, 8, 17, 10],
  [6, 15, 20, 29, 25],
]

function triA(level: Level): Question {
  const u = lenUnit()
  let b: number, h: number
  do {
    b = level === 1 ? int(3, 16) : dec1(3, 14)
    h = int(3, 14)
  } while (b / h > 3 || h / b > 3)
  const foot = round(b * pick([0.3, 0.4, 0.6, 0.7]), 6)
  const A = round((b * h) / 2, 6)
  return q({
    prompt: 'Find the area of this triangle.',
    diagram: triD(b, h, foot, { base: U(b, u), height: U(h, u) }),
    answer: numA(A),
    suffix: sq(u),
    calc: level > 1,
    hint: `Area of a triangle = ${HALF} × base × perpendicular height. The dashed line is the height.`,
    steps: [`${it('A')} = ${HALF}${it('bh')}`, `= ${HALF} ${TIMES} ${num(b)} ${TIMES} ${h}`, `= ${U(A, sq(u))}`],
    meta: { t: 'triArea', b, h },
  })
}

function triExtraA(): Question {
  const u = pick(['cm', 'm', 'mm'])
  const k = pick([1, 2])
  if (chance(0.5)) {
    const [p, r, h, L, R] = pick(NICE_TRI).map((x) => x * k) as number[]
    const b = p + r
    const A = (b * h) / 2
    return q({
      prompt: 'Find the area of this triangle.',
      diagram: triD(b, h, p, { base: U(b, u), height: U(h, u), left: U(L, u), right: U(R, u) }),
      answer: numA(A),
      suffix: sq(u),
      hint: 'Only the base and the perpendicular height (the dashed line) are needed. The slanted sides are extra information.',
      steps: [`Base = ${U(b, u)}, perpendicular height = ${U(h, u)}. The slanted sides (${L} and ${R}) are not needed.`, `${it('A')} = ${HALF} ${TIMES} ${b} ${TIMES} ${h}`, `= ${U(A, sq(u))}`],
      meta: { t: 'triArea', b, h },
    })
  }
  const [a, c, hyp] = pick([[6, 8, 10], [9, 12, 15], [5, 12, 13], [8, 15, 17], [12, 16, 20], [15, 20, 25], [10, 24, 26]] as [number, number, number][])
  const [bb, hh] = chance() ? [a, c] : [c, a]
  const A = (a * c) / 2
  return q({
    prompt: 'Find the area of this right-angled triangle.',
    diagram: DG.rightTri(bb, hh, U(bb, u), U(hh, u), U(hyp, u)),
    answer: numA(A),
    suffix: sq(u),
    hint: 'In a right-angled triangle, the two sides that meet at the right angle are the base and the height. The longest side is not needed.',
    steps: [`The sides at the right angle are ${a} and ${c}; the longest side, ${hyp}, is not needed.`, `${it('A')} = ${HALF} ${TIMES} ${a} ${TIMES} ${c}`, `= ${U(A, sq(u))}`],
    meta: { t: 'triArea', b: a, h: c },
  })
}

function triOutsideA(): Question {
  const u = pick(['cm', 'm'])
  const [b, e, h, L] = pick(NICE_OBTUSE)
  const A = (b * h) / 2
  return q({
    prompt: 'Find the area of this triangle.',
    diagram: fig({
      pts: { A: [0, 0], B: [b, 0], C: [b + e, h], F: [b + e, 0] },
      polys: [{ v: ['A', 'B', 'C'] }],
      segs: [
        { a: 'C', b: 'F', dash: true },
        { a: 'B', b: 'F', dash: true },
      ],
      rights: [['B', 'F', 'C']],
      sides: [
        { a: 'A', b: 'B', text: U(b, u) },
        { a: 'C', b: 'F', text: U(h, u), away: 'A' },
        // only the long slanted side is labelled: the short one runs too close to the height to label clearly
        { a: 'A', b: 'C', text: U(L, u) },
      ],
      maxH: 226,
      label: 'Triangle with its perpendicular height outside it',
    }),
    answer: numA(A),
    suffix: sq(u),
    hint: 'The height can fall outside the triangle. It is still measured at right angles from the base line to the top vertex.',
    steps: [`Base = ${U(b, u)}, perpendicular height = ${U(h, u)} (the dashed line, outside the triangle). The slanted side (${L}) is not needed.`, `${it('A')} = ${HALF} ${TIMES} ${b} ${TIMES} ${h}`, `= ${U(A, sq(u))}`],
    meta: { t: 'triArea', b, h },
  })
}

function triBackA(): Question {
  const u = pick(['cm', 'm'])
  const b = int(3, 16)
  const h = int(3, 16)
  const A = (b * h) / 2
  const askH = chance()
  return q({
    prompt: askH ? `A triangle has an area of ${U(A, sq(u))} and a base of ${U(b, u)}. What is its perpendicular height?` : `A triangle has an area of ${U(A, sq(u))} and a perpendicular height of ${U(h, u)}. How long is its base?`,
    answer: numA(askH ? h : b),
    suffix: u,
    hint: `${HALF} × base × height = area, so base × height = 2 × area.`,
    steps: [`Base ${TIMES} height = 2 ${TIMES} ${num(A)} = ${b * h}`, askH ? `Height = ${b * h} ${DIVIDE} ${b} = ${U(h, u)}` : `Base = ${b * h} ${DIVIDE} ${h} = ${U(b, u)}`],
    meta: { t: 'triBack', A, known: askH ? b : h },
  })
}

function triSameA(): Question {
  const s = pick([4, 6, 8, 10, 12, 14])
  const A = (s * s) / 2
  const u = pick(['cm', 'm'])
  return q({
    prompt: `A triangle has an area of ${U(A, sq(u))}. Its perpendicular height is the same as its base. How long is its base?`,
    answer: numA(s),
    suffix: u,
    hint: `${HALF} × base × base = area, so base × base = 2 × area.`,
    steps: [`Base ${TIMES} base = 2 ${TIMES} ${A} = ${s * s}`, `${s} ${TIMES} ${s} = ${s * s}, so the base is ${U(s, u)}.`],
    meta: { t: 'triSame', A },
  })
}

function kiteA(): Question {
  const d = int(8, 16)
  const h1 = int(2, 6)
  const h2 = int(2, 6)
  // the two heights meet the diagonal away from its middle, where its own length is written
  const p = pick([2, 3, d - 3, d - 2].filter((x) => Math.abs(x - d / 2) >= 2))
  const r = pick([2, 3, d - 3, d - 2].filter((x) => Math.abs(x - d / 2) >= 2 && x !== p))
  const u = 'm'
  const A = (d * (h1 + h2)) / 2
  return q({
    prompt: 'A garden bed has four straight sides. The dashed line splits it into two triangles. Find the area of the garden bed.',
    diagram: fig({
      pts: { A: [0, 0], C: [d, 0], B: [p, h1], D: [r, -h2], E: [p, 0], F: [r, 0] },
      polys: [{ v: ['A', 'D', 'C', 'B'] }],
      segs: [
        { a: 'A', b: 'C', dash: true },
        { a: 'B', b: 'E', dash: true },
        { a: 'D', b: 'F', dash: true },
      ],
      rights: [
        ['C', 'E', 'B'],
        ['A', 'F', 'D'],
      ],
      sides: [
        { a: 'A', b: 'C', text: U(d, u), on: true },
        { a: 'B', b: 'E', text: U(h1, u), on: true },
        { a: 'D', b: 'F', text: U(h2, u), on: true },
      ],
      maxH: 230,
      label: 'A four-sided shape split into two triangles',
    }),
    answer: numA(A),
    suffix: 'm²',
    hint: 'Both triangles have the dashed line as their base. Find the area of each triangle, then add.',
    steps: [`Top triangle: ${HALF} ${TIMES} ${d} ${TIMES} ${h1} = ${num((d * h1) / 2)}`, `Bottom triangle: ${HALF} ${TIMES} ${d} ${TIMES} ${h2} = ${num((d * h2) / 2)}`, `Total = ${num((d * h1) / 2)} + ${num((d * h2) / 2)} = ${U(A, 'm²')}`],
    meta: { t: 'kite', d, h1, h2 },
  })
}

export const ex806 = (level: Level): Question => {
  if (level === 1) return pick([() => triA(1), () => triA(1), triExtraA])()
  if (level === 2) return pick([triExtraA, triOutsideA, () => triA(2), triBackA])()
  return pick([triBackA, triSameA, kiteA, triOutsideA])()
}

// ================================================================== 8.07 Area of a parallelogram

/** [overhang, height, slanted side] with whole-number slanted sides */
const NICE_SLANT: [number, number, number][] = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [8, 6, 10],
  [9, 12, 15],
  [4, 3, 5],
]

function paraA(level: Level): Question {
  const u = lenUnit()
  let b: number, h: number
  do {
    b = level === 1 ? int(4, 16) : dec1(3, 14)
    h = int(3, 12)
  } while (b / h > 3.5 || h / b > 3)
  const off = round(b * pick([0.25, 0.35, 0.5]), 6)
  const A = round(b * h, 6)
  return q({
    prompt: 'Find the area of this parallelogram.',
    diagram: paraD(b, h, off, { base: U(b, u), height: U(h, u) }),
    answer: numA(A),
    suffix: sq(u),
    calc: level > 1,
    hint: 'Area of a parallelogram = base × perpendicular height. The dashed line is the height.',
    steps: [`${it('A')} = ${it('bh')}`, `= ${num(b)} ${TIMES} ${h}`, `= ${U(A, sq(u))}`],
    meta: { t: 'paraArea', b, h },
  })
}

function paraSlantA(): Question {
  const u = pick(['cm', 'mm', 'm'])
  const [off, h, s] = pick(NICE_SLANT)
  const b = int(Math.max(off + 2, 6), 18)
  const A = b * h
  return q({
    prompt: 'Find the area of this parallelogram.',
    diagram: paraD(b, h, off, { base: U(b, u), height: U(h, u), slant: U(s, u) }),
    answer: numA(A),
    suffix: sq(u),
    hint: 'Use the perpendicular height (the dashed line), not the slanted side.',
    steps: [`Base = ${U(b, u)}, perpendicular height = ${U(h, u)}. The slanted side (${s}) is not needed.`, `${it('A')} = ${b} ${TIMES} ${h}`, `= ${U(A, sq(u))}`],
    meta: { t: 'paraArea', b, h },
  })
}

function paraMixedA(): Question {
  const bMm = pick([20, 30, 40, 50, 60, 80])
  const hCm = int(2, 9)
  const A = (bMm / 10) * hCm
  return q({
    prompt: `A parallelogram has a base of ${U(bMm, 'mm')} and a perpendicular height of ${U(hCm, 'cm')}. Find its area in square centimetres.`,
    diagram: paraD(bMm / 10, hCm, (bMm / 10) * 0.35, { base: U(bMm, 'mm'), height: U(hCm, 'cm') }),
    answer: numA(A),
    suffix: 'cm²',
    hint: 'Change the base to centimetres first: 10 mm = 1 cm.',
    steps: [`${U(bMm, 'mm')} = ${U(bMm / 10, 'cm')}`, `${it('A')} = ${bMm / 10} ${TIMES} ${hCm} = ${U(A, 'cm²')}`],
    meta: { t: 'paraArea', b: bMm / 10, h: hCm },
  })
}

function paraBackA(): Question {
  const u = pick(['cm', 'm'])
  const b = int(3, 15)
  const h = chance(0.7) ? int(2, 12) : int(2, 12) + 0.5
  const A = round(b * h, 6)
  const askH = chance()
  return q({
    prompt: askH ? `A parallelogram has an area of ${U(A, sq(u))} and a base of ${U(b, u)}. What is its perpendicular height?` : `A parallelogram has an area of ${U(A, sq(u))} and a perpendicular height of ${U(h, u)}. How long is its base?`,
    answer: numA(askH ? h : b),
    suffix: u,
    calc: !Number.isInteger(h),
    hint: 'Area = base × height, so divide the area by the length you know.',
    steps: [askH ? `${it('h')} = ${num(A)} ${DIVIDE} ${b} = ${U(h, u)}` : `${it('b')} = ${num(A)} ${DIVIDE} ${num(h)} = ${U(b, u)}`],
    meta: { t: 'paraBack', A, known: askH ? b : h },
  })
}

function paraSquareA(): Question {
  let s: number, b: number
  do {
    s = int(4, 12)
    b = pick([s + 2, s + 4, 2 * s, s * 3 / 2, s - 2].filter((x) => Number.isInteger(x) && x > 1))
  } while ((s * s) % b !== 0 || b === s)
  const h = (s * s) / b
  return q({
    prompt: `A parallelogram has the same area as a square with sides of ${U(s, 'cm')}. The parallelogram's base is ${U(b, 'cm')}. What is its perpendicular height?`,
    answer: numA(h),
    suffix: 'cm',
    hint: 'Find the area of the square first. That is also the area of the parallelogram.',
    steps: [`Area of the square = ${s} ${TIMES} ${s} = ${U(s * s, 'cm²')}`, `Height = ${s * s} ${DIVIDE} ${b} = ${U(h, 'cm')}`],
    meta: { t: 'paraSquare', s, b },
  })
}

export const ex807 = (level: Level): Question => {
  if (level === 1) return pick([() => paraA(1), () => paraA(1), paraSlantA])()
  if (level === 2) return pick([paraSlantA, () => paraA(2), paraMixedA])()
  return pick([paraBackA, paraBackA, paraSquareA])()
}

// ================================================================== 8.08 Areas of composite shapes

function twoRectsA(): Question {
  const u = pick(['cm', 'm'])
  let w1: number, h1: number, w2: number, h2: number
  do {
    w1 = int(2, 9)
    h1 = int(3, 10)
    w2 = int(2, 9)
    h2 = int(2, 10)
  } while (h1 === h2 || (w1 + w2) / Math.max(h1, h2) > 3 || Math.max(h1, h2) / (w1 + w2) > 2)
  const A = w1 * h1 + w2 * h2
  return q({
    prompt: 'The dashed line splits this shape into two rectangles. Find the area of the shape.',
    diagram: DG.twoRectsDims(w1, h1, w2, h2, { w1: U(w1, u), h1: U(h1, u), w2: U(w2, u), h2: U(h2, u) }),
    answer: numA(A),
    suffix: sq(u),
    hint: 'Find the area of each rectangle, then add them.',
    steps: [`Left rectangle: ${w1} ${TIMES} ${h1} = ${w1 * h1}`, `Right rectangle: ${w2} ${TIMES} ${h2} = ${w2 * h2}`, `Total = ${w1 * h1} + ${w2 * h2} = ${U(A, sq(u))}`],
    meta: { t: 'twoRects', w1, h1, w2, h2 },
  })
}

function houseA(): Question {
  const u = pick(['cm', 'm'])
  const w = 2 * int(2, 7)
  const h = int(3, 9)
  const t = int(2, 6)
  const A = w * h + (w * t) / 2
  return q({
    prompt: 'This shape is a rectangle with a triangle on top. Find its area.',
    diagram: fig({
      pts: { A: [0, 0], B: [w, 0], C: [w, h], D: [0, h], E: [w / 2, h + t], M: [w / 2, h] },
      polys: [{ v: ['A', 'B', 'C', 'E', 'D'] }],
      segs: [
        { a: 'D', b: 'C', dash: true },
        { a: 'E', b: 'M', dash: true },
      ],
      rights: [
        ['D', 'A', 'B'],
        ['A', 'B', 'C'],
        ['C', 'M', 'E'],
      ],
      sides: [
        { a: 'A', b: 'B', text: U(w, u) },
        { a: 'B', b: 'C', text: U(h, u) },
        { a: 'E', b: 'M', text: U(t, u), on: true },
      ],
      maxH: 226,
      label: 'A rectangle with a triangle on top',
    }),
    answer: numA(A),
    suffix: sq(u),
    hint: `Area of the rectangle + area of the triangle. The triangle's base is the top of the rectangle.`,
    steps: [`Rectangle: ${w} ${TIMES} ${h} = ${w * h}`, `Triangle: ${HALF} ${TIMES} ${w} ${TIMES} ${t} = ${(w * t) / 2}`, `Total = ${w * h} + ${(w * t) / 2} = ${U(A, sq(u))}`],
    meta: { t: 'house', w, h, tri: t },
  })
}

function lShapeA(): Question {
  let W: number, H: number, w: number, h: number
  do {
    W = int(6, 14)
    H = int(5, 12)
    w = int(2, W - 3)
    h = int(2, H - 3)
  } while (W / H > 2.2 || H / W > 2.2 || w < 0.35 * W || h < 0.35 * H || W - w < 0.3 * W || H - h < 0.3 * H)
  const u = pick(['cm', 'm'])
  const A = W * H - w * h
  return q({
    prompt: 'Find the area of this shape.',
    diagram: lShapeD(W, H, w, h, { bottom: U(W, u), left: U(H, u), notchH: U(w, u), notchV: U(h, u) }, true),
    answer: numA(A),
    suffix: sq(u),
    hint: 'Either split the shape into two rectangles, or find the area of the whole rectangle and take away the missing corner.',
    steps: [`Whole rectangle: ${W} ${TIMES} ${H} = ${W * H}`, `Missing corner: ${w} ${TIMES} ${h} = ${w * h}`, `Area = ${W * H} ${MINUS} ${w * h} = ${U(A, sq(u))}`],
    meta: { t: 'lshapeArea', W, H, w, h },
  })
}

function holeA(): Question {
  let W: number, H: number, w: number, h: number
  do {
    W = int(10, 20)
    H = int(8, 15)
    w = int(3, W - 6)
    h = int(2, H - 6)
  } while (W / H > 2.2 || H / W > 1.6 || w === h)
  const u = pick(['cm', 'mm', 'm'])
  const A = W * H - w * h
  return q({
    prompt: `A rectangular hole ${U(w, u)} by ${U(h, u)} is cut out of this rectangle. Find the shaded area that is left.`,
    diagram: holeD(W, H, w, h, { outerW: U(W, u), outerH: U(H, u), innerW: '', innerH: '' }),
    answer: numA(A),
    suffix: sq(u),
    hint: 'Shaded area = area of the big rectangle − area of the hole.',
    steps: [`Big rectangle: ${W} ${TIMES} ${H} = ${W * H}`, `Hole: ${w} ${TIMES} ${h} = ${w * h}`, `Shaded area = ${W * H} ${MINUS} ${w * h} = ${U(A, sq(u))}`],
    meta: { t: 'hole', W, H, w, h },
  })
}

function exprA(): Question {
  let W: number, H: number, w: number, h: number
  do {
    W = int(8, 14)
    H = int(6, 12)
    w = int(3, W - 3)
    h = int(2, H - 3)
  } while (W / H > 2.2 || H / W > 2.2 || w < 0.35 * W || h < 0.35 * H || W - w < 0.3 * W || H - h < 0.3 * H)
  const u = 'cm'
  const right = `(${W} ${TIMES} ${H}) ${MINUS} (${w} ${TIMES} ${h})`
  // mistakes that can never give the right area: adding the corner, taking away a whole strip, or multiplying the leftover sides
  const wrong = [`(${W} ${TIMES} ${H}) + (${w} ${TIMES} ${h})`, `(${W} ${TIMES} ${H}) ${MINUS} (${W} ${TIMES} ${h})`, `(${W - w}) ${TIMES} (${H - h})`]
  return q({
    prompt: 'Which expression gives the area of this shape?',
    diagram: lShapeD(W, H, w, h, { bottom: U(W, u), left: U(H, u), notchH: U(w, u), notchV: U(h, u) }, true),
    answer: mcA(right, wrong),
    hint: 'Picture the whole rectangle, then take away the corner that is missing.',
    steps: [`The whole rectangle is ${W} by ${H}. The missing corner is ${w} by ${h}.`, `Area = ${right} = ${U(W * H - w * h, 'cm²')}`],
    meta: { t: 'expr', W, H, w, h },
  })
}

function pathA(): Question {
  const a = int(4, 12)
  const b = int(3, 9)
  const t = pick([1, 2])
  const A = (a + 2 * t) * (b + 2 * t) - a * b
  return q({
    prompt: `A rectangular garden ${U(a, 'm')} by ${U(b, 'm')} has a path ${U(t, 'm')} wide all the way around it. Find the area of the path.`,
    diagram: holeD(a + 2 * t, b + 2 * t, a, b, { outerW: U(a + 2 * t, 'm'), outerH: U(b + 2 * t, 'm'), innerW: U(a, 'm'), innerH: U(b, 'm'), path: true }),
    answer: numA(A),
    suffix: 'm²',
    hint: 'The path and the garden together make a bigger rectangle. Take away the garden.',
    steps: [`Garden and path: ${a + 2 * t} ${TIMES} ${b + 2 * t} = ${(a + 2 * t) * (b + 2 * t)}`, `Garden: ${a} ${TIMES} ${b} = ${a * b}`, `Path = ${(a + 2 * t) * (b + 2 * t)} ${MINUS} ${a * b} = ${U(A, 'm²')}`],
    meta: { t: 'path', a, b, w: t },
  })
}

function lawnA(): Question {
  const L = dec1(8, 14)
  const W = dec1(5, 9)
  const s = pick([2, 3])
  const n = pick([2, 3])
  const A = round(L * W - n * s * s, 6)
  return q({
    prompt: `A rectangular lawn is ${U(L, 'm')} by ${U(W, 'm')}. It has ${n} square flower beds in it, each ${U(s, 'm')} by ${U(s, 'm')}. Find the area of grass.`,
    answer: numA(A),
    suffix: 'm²',
    calc: true,
    hint: 'Area of the whole lawn − area of the flower beds.',
    steps: [`Whole lawn: ${num(L)} ${TIMES} ${num(W)} = ${num(round(L * W, 6))}`, `Flower beds: ${n} ${TIMES} ${s} ${TIMES} ${s} = ${n * s * s}`, `Grass = ${num(round(L * W, 6))} ${MINUS} ${n * s * s} = ${U(A, 'm²')}`],
    meta: { t: 'lawn', L, W, n, s },
  })
}

function crossA(): Question {
  const s = pick([2, 3, 4])
  const tile = pick([20, 25, 50])
  const perSide = (s * 100) / tile
  const n = 5 * perSide * perSide
  return q({
    prompt: `The floor of a paddling pool is a cross made of 5 squares, each ${U(s, 'm')} by ${U(s, 'm')}. How many square tiles with sides of ${U(tile, 'cm')} are needed to cover it?`,
    diagram: fig({
      pts: { A: [s, 0], B: [2 * s, 0], C: [2 * s, s], D: [3 * s, s], E: [3 * s, 2 * s], F: [2 * s, 2 * s], G: [2 * s, 3 * s], H: [s, 3 * s], I: [s, 2 * s], J: [0, 2 * s], K: [0, s], L: [s, s] },
      polys: [{ v: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'] }],
      sides: [{ a: 'A', b: 'B', text: U(s, 'm') }],
      ticks: [
        { a: 'A', b: 'B', n: 1 },
        { a: 'C', b: 'D', n: 1 },
        { a: 'E', b: 'F', n: 1 },
        { a: 'G', b: 'H', n: 1 },
        { a: 'I', b: 'J', n: 1 },
        { a: 'K', b: 'L', n: 1 },
      ],
      maxH: 220,
      label: 'A cross made of 5 squares',
    }),
    answer: numA(n),
    suffix: 'tiles',
    calc: true,
    hint: 'Find how many tiles cover one square, then multiply by 5.',
    steps: [`Along one side of a square: ${s * 100} cm ${DIVIDE} ${tile} = ${perSide} tiles`, `One square: ${perSide} ${TIMES} ${perSide} = ${perSide * perSide} tiles`, `5 squares: 5 ${TIMES} ${perSide * perSide} = ${n} tiles`],
    meta: { t: 'cross', s, tile },
  })
}

export const ex808 = (level: Level): Question => {
  if (level === 1) return pick([twoRectsA, twoRectsA, houseA])()
  if (level === 2) return pick([lShapeA, holeA, exprA, houseA])()
  return pick([pathA, lawnA, crossA, holeA])()
}

// ================================================================== 8.09 Drawing prisms

const SOLIDS: { name: string; prism: boolean; why: string }[] = [
  { name: 'a cube', prism: true, why: 'Every slice across it is the same square.' },
  { name: 'a rectangular prism (a box)', prism: true, why: 'Every slice across it is the same rectangle.' },
  { name: 'a triangular prism', prism: true, why: 'Every slice across it is the same triangle.' },
  { name: 'a hexagonal prism', prism: true, why: 'Every slice across it is the same hexagon.' },
  { name: 'a square pyramid', prism: false, why: 'Its slices are squares that get smaller towards the top, so they are not all the same.' },
  { name: 'a cone', prism: false, why: 'Its slices are circles that get smaller towards the point.' },
  { name: 'a sphere (a ball)', prism: false, why: 'Its slices are circles of different sizes.' },
  { name: 'a cylinder', prism: false, why: 'Its slices are all the same circle, but a prism’s cross-section must have straight sides, so the textbook does not call it a prism.' },
]

function isPrismQ(): Question {
  const s = pick(SOLIDS)
  return q({
    prompt: `Is ${s.name} a prism?`,
    answer: mcFixedA(['Yes', 'No'], s.prism ? 'Yes' : 'No'),
    hint: 'A prism has the same straight-sided cross-section all the way along it.',
    steps: [s.why, s.prism ? 'So it is a prism.' : 'So it is not a prism.'],
    meta: { t: 'isPrism', solid: s.name },
  })
}

const PRISM_NAMES: [DG.CrossSection, string, string][] = [
  ['triangle', 'Triangular prism', 'triangle'],
  ['right triangle', 'Triangular prism', 'triangle'],
  ['rectangle', 'Rectangular prism', 'rectangle'],
  ['trapezium', 'Trapezoidal prism', 'trapezium'],
  ['pentagon', 'Pentagonal prism', 'pentagon'],
  ['hexagon', 'Hexagonal prism', 'hexagon'],
]

function namePrismQ(): Question {
  const [shape, nm] = pick(PRISM_NAMES)
  const options = ['Triangular prism', 'Rectangular prism', 'Trapezoidal prism', 'Pentagonal prism', 'Hexagonal prism']
  return q({
    prompt: 'The shaded face is the base of this prism. What is the name of the prism?',
    diagram: DG.prism(shape),
    note: NOT_TO_SCALE,
    answer: mcFixedA(options, nm),
    hint: 'A prism is named after the shape of its base (its cross-section). Count the sides of the shaded face.',
    steps: [`The shaded base has ${{ triangle: 3, 'right triangle': 3, rectangle: 4, trapezium: 4, pentagon: 5, hexagon: 6 }[shape as string]} sides.`, `It is a ${nm.toLowerCase()}.`],
    meta: { t: 'namePrism', shape },
  })
}

function crossShapeQ(): Question {
  const [shape, , base] = pick(PRISM_NAMES)
  const options = ['Triangle', 'Rectangle', 'Trapezium', 'Pentagon', 'Hexagon']
  return q({
    prompt: 'What shape is the cross-section of this prism?',
    diagram: DG.prism(shape),
    note: NOT_TO_SCALE,
    answer: mcFixedA(options, base[0].toUpperCase() + base.slice(1)),
    hint: 'A cross-section is a slice cut across the prism, parallel to its end faces. It is the same shape as the shaded base.',
    steps: [`Every slice across the prism is the same shape as its shaded base: a ${base}.`],
    meta: { t: 'crossShape', shape },
  })
}

function sideFacesQ(): Question {
  const opts = ['Rectangles', 'Triangles', 'Circles', 'The same shape as the base']
  return q({
    prompt: 'What shape are the side faces of every prism (the faces that join its two bases)?',
    answer: mcFixedA(opts, 'Rectangles'),
    hint: 'Look at a box, a triangular prism or a hexagonal prism. What shape joins the two ends?',
    steps: ['The two bases of a prism are joined by flat side faces, one for each side of the base.', 'For the prisms in this chapter (right prisms), the side faces are rectangles.'],
    meta: { t: 'sideFaces' },
  })
}

const CUBE_SOLIDS: number[][][] = [
  [[2, 1], [1, 1]],
  [[2, 2, 1], [1, 1, 1]],
  [[3, 2], [2, 1]],
  [[3, 2, 1]],
  [[2, 1, 1], [1, 1, 1]],
  [[3, 1], [1, 1]],
  [[2, 2], [2, 1]],
  [[3, 3, 1], [2, 1, 1]],
  [[2, 2, 2], [2, 1, 1]],
]
const topSquares = (hs: number[][]) => hs.flat().filter((x) => x > 0).length
const frontSquares = (hs: number[][]) => hs[0].map((_, c) => Math.max(...hs.map((r) => r[c] ?? 0))).reduce((t, x) => t + x, 0)
const cubesIn = (hs: number[][]) => hs.flat().reduce((t, x) => t + x, 0)

function cubeViewQ(level: Level): Question {
  const hs = pick(level === 2 ? CUBE_SOLIDS.slice(0, 7) : CUBE_SOLIDS)
  const view = level === 2 ? pick(['top', 'front'] as const) : pick(['top', 'front', 'cubes'] as const)
  const ans = view === 'top' ? topSquares(hs) : view === 'front' ? frontSquares(hs) : cubesIn(hs)
  const cols = hs[0].map((_, c) => Math.max(...hs.map((r) => r[c] ?? 0)))
  return q({
    prompt:
      view === 'cubes'
        ? 'This solid is built from cubes, with no hidden gaps. How many cubes are in it?'
        : `This solid is built from cubes. The front is the side nearest you on the left. How many squares are in its <b>${view} view</b>?`,
    diagram: DG.cubeSolid(hs),
    answer: numA(ans),
    hint: view === 'top' ? 'From directly above you see one square on top of each stack.' : view === 'front' ? 'From the front, each column looks as tall as its tallest stack.' : 'Count the cubes in each stack and add them. Remember the stacks at the back.',
    steps:
      view === 'top'
        ? [`There ${topSquares(hs) === 1 ? 'is 1 stack' : `are ${topSquares(hs)} stacks`}, and each shows one square from above: ${ans} squares.`]
        : view === 'front'
          ? [`From the front, the heights of the columns (in cubes) are ${cols.join(', ')}.`, `${cols.join(' + ')} = ${ans} squares`]
          : [`Stacks: ${hs.flat().filter((x) => x > 0).join(' + ')} = ${ans} cubes`],
    meta: { t: 'cubeView', hs, view },
  })
}

function viewOfPrismQ(): Question {
  const [shape, nm, base] = pick(PRISM_NAMES.filter(([s]) => s !== 'rectangle'))
  const top = chance()
  const options = ['Triangle', 'Rectangle', 'Trapezium', 'Pentagon', 'Hexagon']
  const ans = top ? base[0].toUpperCase() + base.slice(1) : 'Rectangle'
  return q({
    prompt: `A ${nm.toLowerCase()} stands on one of its bases on a table. What shape do you see from ${top ? 'directly above (the top view)' : 'the front (the front view), looking straight at one of its side faces'}?`,
    answer: mcFixedA(options, ans),
    hint: top ? 'From above you look straight down onto the top base.' : 'From the front you see a side face, which joins the two bases.',
    steps: [top ? `Looking down, you see the top base: a ${base}.` : 'Looking straight at a side face, you see a rectangle.'],
    meta: { t: 'prismView', shape, top },
  })
}

export const ex809 = (level: Level): Question => {
  if (level === 1) return pick([isPrismQ, namePrismQ, namePrismQ])()
  if (level === 2) return pick([crossShapeQ, sideFacesQ, () => cubeViewQ(2), () => cubeViewQ(2)])()
  return pick([() => cubeViewQ(3), viewOfPrismQ, isPrismQ])()
}

// ================================================================== 8.10 Metric units for volume

const VOL_SIZE: Record<string, number> = { 'mm³': 1, 'cm³': 1000, 'm³': 1e9 }
const VOL_WORD: Record<string, string> = { 'mm³': 'cubic millimetres', 'cm³': 'cubic centimetres', 'm³': 'cubic metres' }
const VOL_OF: [string, string][] = [
  ['a grain of sugar', 'mm³'],
  ['a pea', 'mm³'],
  ['a dice', 'cm³'],
  ['a matchbox', 'cm³'],
  ['a textbook', 'cm³'],
  ['a classroom', 'm³'],
  ['a shipping container', 'm³'],
  ['a swimming pool', 'm³'],
]

function volUnitQ(): Question {
  const [what, u] = pick(VOL_OF)
  return q({
    prompt: `Which unit of volume would you use to measure the volume of ${what}?`,
    answer: mcFixedA(['mm³', 'cm³', 'm³'], u),
    hint: 'A cubic millimetre is about a grain of sugar, a cubic centimetre is about a tooth, and a cubic metre is about 2 washing machines.',
    steps: [`${what[0].toUpperCase() + what.slice(1)} is best measured in ${VOL_WORD[u]} (${u}).`],
    meta: { t: 'volUnit', what },
  })
}

function volFactQ(): Question {
  const [a, b] = pick([['cm³', 'mm³'], ['m³', 'cm³']] as [string, string][])
  const f = VOL_SIZE[a] / VOL_SIZE[b]
  return q({
    prompt: `Complete the conversion.${big(`1 ${a} = ___ ${b}`)}`,
    answer: numA(f),
    suffix: b,
    hint: 'Think of a cube with edges of 1 unit, and write its edges in the smaller unit.',
    steps: [a === 'cm³' ? '1 cm = 10 mm, so 1 cm³ = 10 × 10 × 10 mm³' : '1 m = 100 cm, so 1 m³ = 100 × 100 × 100 cm³', `1 ${a} = ${num(f)} ${b}`],
    meta: { t: 'volConv', v: 1, from: a, to: b },
  })
}

function cubeCountQ(): Question {
  let l: number, w: number, h: number
  do {
    l = int(2, 5)
    w = int(2, 4)
    h = int(1, 4)
  } while (l * w * h > 48)
  return q({
    prompt: 'This prism is built from 1 cm³ cubes. What is its volume?',
    diagram: D2.cubeStack(l, w, h),
    answer: numA(l * w * h),
    suffix: 'cm³',
    hint: 'Count the cubes in one layer, then multiply by the number of layers.',
    steps: [`One layer: ${l} ${TIMES} ${w} = ${l * w} cubes`, `${h} ${h === 1 ? 'layer' : 'layers'}: ${l * w} ${TIMES} ${h} = ${l * w * h} cubes`, `Volume = ${l * w * h} cm³`],
    meta: { t: 'cubeCount', l, w, h },
  })
}

function volConvQ(level: Level): Question {
  const [a, b] = level === 3 && chance(0.4) ? (['m³', 'mm³'] as [string, string]) : pick([['cm³', 'mm³'], ['m³', 'cm³']] as [string, string][])
  const f = VOL_SIZE[a] / VOL_SIZE[b]
  const x = level === 2 ? pick([int(2, 30), pick([0.5, 1.5, 2.5, 0.2, 4.2, 3.6])]) : pick([0.25, 0.75, 0.04, 1.25, 0.6, int(2, 9)])
  const down = chance()
  const [from, to, val, ans] = down ? [a, b, x, round(x * f, 6)] : [b, a, round(x * f, 6), x]
  return q({
    prompt: `Convert ${U(val, from)} to ${VOL_WORD[to]}.`,
    answer: numA(ans),
    suffix: to,
    hint: down ? `Larger unit to smaller unit: multiply. 1 ${a} = ${num(f)} ${b}.` : `Smaller unit to larger unit: divide. 1 ${a} = ${num(f)} ${b}.`,
    steps: [down ? `${num(val)} ${TIMES} ${num(f)} = ${num(ans)}` : `${num(val)} ${DIVIDE} ${num(f)} = ${num(ans)}`, `${U(val, from)} = ${U(ans, to)}`],
    meta: { t: 'volConv', v: val, from, to },
  })
}

const ABOUT_VOL: { what: string; v: number; u: string }[] = [
  { what: 'a matchbox', v: 30, u: 'cm³' },
  { what: 'a shipping container', v: 33, u: 'm³' },
  { what: 'a grain of rice', v: 20, u: 'mm³' },
  { what: 'a house brick', v: 2000, u: 'cm³' },
  { what: 'a bedroom', v: 30, u: 'm³' },
]

function aboutVolQ(): Question {
  const s = pick(ABOUT_VOL)
  return q({
    prompt: `Which is the best estimate of the volume of ${s.what}?`,
    answer: mcFixedA(['mm³', 'cm³', 'm³'].map((u) => U(s.v, u)), U(s.v, s.u)),
    hint: 'All the numbers are the same, so look at the units. How many of each kind of cube would fit?',
    steps: [`${s.what[0].toUpperCase() + s.what.slice(1)} has a volume of about ${U(s.v, s.u)}.`],
    meta: { t: 'aboutVol', what: s.what },
  })
}

export const ex810 = (level: Level): Question => {
  if (level === 1) return pick([volUnitQ, volFactQ, cubeCountQ])()
  if (level === 2) return pick([() => volConvQ(2), () => volConvQ(2), cubeCountQ, aboutVolQ])()
  return pick([() => volConvQ(3), () => volConvQ(3), aboutVolQ])()
}

// ================================================================== 8.11 Volume of a rectangular prism

function boxV(level: Level): Question {
  const u = lenUnit()
  const l = level === 1 ? int(3, 12) : dec1(2, 12)
  const w = int(2, 9)
  const h = int(2, 10)
  const V = round(l * w * h, 6)
  return q({
    prompt: 'Find the volume of this rectangular prism.',
    diagram: D.rectPrism(Math.max(l, 2), w, h, U(l, u), U(w, u), U(h, u)),
    note: NOT_TO_SCALE,
    answer: numA(V),
    suffix: cu(u),
    calc: level > 1,
    hint: 'Volume = length × width × height. Volume is measured in cubic units.',
    steps: [`${it('V')} = ${it('lwh')}`, `= ${num(l)} ${TIMES} ${w} ${TIMES} ${h}`, `= ${U(V, cu(u))}`],
    meta: { t: 'box', l, w, h },
  })
}

function cubeV(): Question {
  const u = lenUnit()
  const s = int(2, 10)
  return q({
    prompt: 'Find the volume of this cube.',
    diagram: DG.cube(U(s, u)),
    note: NOT_TO_SCALE,
    answer: numA(s ** 3),
    suffix: cu(u),
    hint: 'All the edges of a cube are equal, so V = side × side × side.',
    steps: [`${it('V')} = ${s} ${TIMES} ${s} ${TIMES} ${s}`, `= ${U(s ** 3, cu(u))}`],
    meta: { t: 'box', l: s, w: s, h: s },
  })
}

function storyV(): Question {
  const [what, l, w, h] = pick([
    ['A tissue box', int(18, 25), int(9, 12), int(8, 12)],
    ['A cereal box', int(18, 24), int(5, 8), int(25, 32)],
    ['A shoebox', int(28, 35), int(16, 22), int(10, 13)],
    ['A lunchbox', int(15, 22), int(10, 15), int(5, 8)],
  ] as [string, number, number, number][])
  const V = l * w * h
  return q({
    prompt: `${what} is ${U(l, 'cm')} long, ${U(w, 'cm')} wide and ${U(h, 'cm')} high. Find its volume.`,
    answer: numA(V),
    suffix: 'cm³',
    calc: true,
    hint: 'Volume = length × width × height.',
    steps: [`${it('V')} = ${l} ${TIMES} ${w} ${TIMES} ${h}`, `= ${U(V, 'cm³')}`],
    meta: { t: 'box', l, w, h },
  })
}

function mixedV(): Question {
  const lm = pick([0.5, 1, 1.2, 1.5, 2])
  const w = pick([20, 25, 30, 40, 50])
  const hmm = pick([100, 150, 200, 300])
  const V = lm * 100 * w * (hmm / 10)
  return q({
    prompt: `A box is ${U(lm, 'm')} long, ${U(w, 'cm')} wide and ${U(hmm, 'mm')} high. Find its volume in cubic centimetres.`,
    answer: numA(V),
    suffix: 'cm³',
    calc: true,
    hint: 'Change all the lengths to centimetres first: 1 m = 100 cm and 10 mm = 1 cm.',
    steps: [`${U(lm, 'm')} = ${U(lm * 100, 'cm')} and ${U(hmm, 'mm')} = ${U(hmm / 10, 'cm')}`, `${it('V')} = ${num(lm * 100)} ${TIMES} ${w} ${TIMES} ${num(hmm / 10)}`, `= ${U(V, 'cm³')}`],
    meta: { t: 'box', l: lm * 100, w, h: hmm / 10 },
  })
}

function missingV(): Question {
  const u = pick(['cm', 'm'])
  const l = int(3, 12)
  const w = int(2, 8)
  const h = chance(0.7) ? int(2, 10) : int(2, 9) + 0.5
  const V = round(l * w * h, 6)
  return q({
    prompt: `A rectangular prism has a volume of ${U(V, cu(u))}. Its length is ${U(l, u)} and its width is ${U(w, u)}. What is its height?`,
    answer: numA(h),
    suffix: u,
    calc: !Number.isInteger(h),
    hint: 'Volume = length × width × height, so height = volume ÷ (length × width).',
    steps: [`Length ${TIMES} width = ${l} ${TIMES} ${w} = ${l * w}`, `Height = ${num(V)} ${DIVIDE} ${l * w} = ${U(h, u)}`],
    meta: { t: 'missingV', V, l, w },
  })
}

function cubeSideV(): Question {
  const s = int(2, 10)
  const u = pick(['cm', 'm'])
  return q({
    prompt: `A cube has a volume of ${U(s ** 3, cu(u))}. How long is each edge?`,
    answer: numA(s),
    suffix: u,
    hint: 'Which number multiplied by itself three times gives the volume?',
    steps: [`${s} ${TIMES} ${s} ${TIMES} ${s} = ${s ** 3}`, `Each edge is ${U(s, u)}.`],
    meta: { t: 'cubeSide', V: s ** 3 },
  })
}

function soilV(): Question {
  const l = int(4, 12)
  const w = int(2, 6)
  const cm = pick([10, 20, 25, 30, 40, 50])
  const V = round(l * w * (cm / 100), 6)
  return q({
    prompt: `A garden bed is ${U(l, 'm')} long and ${U(w, 'm')} wide. It is filled with soil ${U(cm, 'cm')} deep. What volume of soil is needed, in cubic metres?`,
    answer: numA(V),
    suffix: 'm³',
    calc: true,
    hint: 'Change the depth to metres first: 100 cm = 1 m.',
    steps: [`${U(cm, 'cm')} = ${U(cm / 100, 'm')}`, `${it('V')} = ${l} ${TIMES} ${w} ${TIMES} ${num(cm / 100)} = ${U(V, 'm³')}`],
    meta: { t: 'box', l, w, h: cm / 100 },
  })
}

function hollowV(): Question {
  const L = pick([20, 30, 40])
  const W = pick([15, 20, 25])
  const H = pick([10, 15, 20])
  const a = W - 10
  const b = pick([L / 2, L - 10])
  const V = L * W * H - a * b * H
  return q({
    prompt: `A concrete block is ${U(L, 'cm')} long, ${U(W, 'cm')} wide and ${U(H, 'cm')} high. A hole ${U(b, 'cm')} by ${U(a, 'cm')} goes straight through it from top to bottom. Find the volume of concrete.`,
    answer: numA(V),
    suffix: 'cm³',
    calc: true,
    hint: 'Volume of the whole block − volume of the hole. The hole is a prism too, with the same height as the block.',
    steps: [`Whole block: ${L} ${TIMES} ${W} ${TIMES} ${H} = ${num(L * W * H)}`, `Hole: ${b} ${TIMES} ${a} ${TIMES} ${H} = ${num(a * b * H)}`, `Concrete = ${num(L * W * H)} ${MINUS} ${num(a * b * H)} = ${U(V, 'cm³')}`],
    meta: { t: 'hollow', L, W, H, a, b },
  })
}

export const ex811 = (level: Level): Question => {
  if (level === 1) return pick([() => boxV(1), () => boxV(1), cubeV])()
  if (level === 2) return pick([() => boxV(2), storyV, mixedV])()
  return pick([missingV, cubeSideV, soilV, hollowV])()
}

// ================================================================== 8.12 Volume of a prism

function ahV(level: Level): Question {
  const shape = pick(['triangle', 'trapezium', 'L-shape', 'pentagon', 'hexagon'] as DG.CrossSection[])
  const u = lenUnit()
  const A = level === 1 ? int(6, 40) : dec1(5, 40)
  const h = int(3, 15)
  const V = round(A * h, 6)
  return q({
    prompt: `The area of the shaded cross-section of this prism is ${U(A, sq(u))}. Its length is ${U(h, u)}. Find its volume.`,
    diagram: DG.prism(shape, { faceLabel: `A = ${U(A, sq(u))}`, lengthLabel: U(h, u) }),
    note: NOT_TO_SCALE,
    answer: numA(V),
    suffix: cu(u),
    calc: level > 1,
    hint: 'Volume of a prism = area of the cross-section × its length (the prism’s height, h).',
    steps: [`${it('V')} = ${it('Ah')}`, `= ${num(A)} ${TIMES} ${h}`, `= ${U(V, cu(u))}`],
    meta: { t: 'Ah', A, h },
  })
}

function triPrismV(): Question {
  const u = pick(['cm', 'm'])
  let b: number, ht: number
  do {
    b = int(3, 12)
    ht = int(3, 10)
  } while ((b * ht) % 2 !== 0)
  const L = int(4, 15)
  const A = (b * ht) / 2
  return q({
    prompt: 'Find the volume of this triangular prism.',
    diagram: D.triPrism(b, ht, Math.max(L, 5), U(b, u), U(ht, u), U(L, u)),
    note: NOT_TO_SCALE,
    answer: numA(A * L),
    suffix: cu(u),
    hint: 'First find the area of the triangle (½ × base × height), then multiply by the length of the prism.',
    steps: [`Area of triangle = ${HALF} ${TIMES} ${b} ${TIMES} ${ht} = ${A}`, `${it('V')} = ${A} ${TIMES} ${L} = ${U(A * L, cu(u))}`],
    meta: { t: 'triPrism', b, ht, L },
  })
}

function lPrismV(): Question {
  let W: number, H: number, w: number, h: number
  do {
    W = int(5, 10)
    H = int(4, 9)
    w = int(2, W - 2)
    h = int(2, H - 2)
  } while (W / H > 2.2 || H / W > 2.2 || w < 0.35 * W || h < 0.35 * H || W - w < 0.3 * W || H - h < 0.3 * H)
  const L = int(3, 12)
  const u = pick(['cm', 'm'])
  const A = W * H - w * h
  return q({
    prompt: `This is the cross-section of a prism that is ${U(L, u)} long. Find the volume of the prism.`,
    diagram: lShapeD(W, H, w, h, { bottom: U(W, u), left: U(H, u), notchH: U(w, u), notchV: U(h, u) }, true),
    answer: numA(A * L),
    suffix: cu(u),
    hint: 'Find the area of the L-shaped cross-section first, then multiply by the length.',
    steps: [`Cross-section: ${W} ${TIMES} ${H} ${MINUS} ${w} ${TIMES} ${h} = ${A}`, `${it('V')} = ${A} ${TIMES} ${L} = ${U(A * L, cu(u))}`],
    meta: { t: 'lPrism', W, H, w, h, L },
  })
}

function prismBackV(): Question {
  const u = pick(['cm', 'm'])
  let b: number, ht: number
  do {
    b = int(2, 10)
    ht = int(2, 10)
  } while ((b * ht) % 2 !== 0)
  const L = int(3, 15)
  const V = ((b * ht) / 2) * L
  return q({
    prompt: `A triangular prism has a volume of ${U(V, cu(u))}. Its triangular cross-section has a base of ${U(b, u)} and a height of ${U(ht, u)}. How long is the prism?`,
    answer: numA(L),
    suffix: u,
    hint: 'Find the area of the triangle, then divide the volume by it.',
    steps: [`Area of triangle = ${HALF} ${TIMES} ${b} ${TIMES} ${ht} = ${(b * ht) / 2}`, `Length = ${V} ${DIVIDE} ${(b * ht) / 2} = ${U(L, u)}`],
    meta: { t: 'prismBack', V, b, ht },
  })
}

function openBoxV(): Question {
  const c = pick([2, 3, 4, 5])
  const sCm = pick([20, 24, 26, 30, 36])
  const base = sCm - 2 * c
  const V = base * base * c
  return q({
    prompt: `A square sheet of cardboard has sides of ${U(sCm, 'cm')}. A square with sides of ${U(c, 'cm')} is cut from each corner, and the sides are folded up to make an open box. What is the volume of the box?`,
    diagram: fig({
      pts: { A: [0, 0], B: [sCm, 0], C: [sCm, sCm], D: [0, sCm], a: [c, c], b: [sCm - c, c], cc: [sCm - c, sCm - c], d: [c, sCm - c], p1: [c, 0], p2: [0, c], q1: [sCm - c, 0], q2: [sCm, c], r1: [sCm, sCm - c], r2: [sCm - c, sCm], s1: [c, sCm], s2: [0, sCm - c] },
      polys: [
        { v: ['A', 'B', 'C', 'D'] },
        { v: ['A', 'p1', 'a', 'p2'], cls: 'sh sh3' },
        { v: ['q1', 'B', 'q2', 'b'], cls: 'sh sh3' },
        { v: ['cc', 'r1', 'C', 'r2'], cls: 'sh sh3' },
        { v: ['s2', 'd', 's1', 'D'], cls: 'sh sh3' },
      ],
      segs: [
        { a: 'a', b: 'b', dash: true },
        { a: 'b', b: 'cc', dash: true },
        { a: 'cc', b: 'd', dash: true },
        { a: 'd', b: 'a', dash: true },
      ],
      sides: [
        { a: 'A', b: 'B', text: U(sCm, 'cm'), away: 'C' },
        { a: 'p2', b: 'A', text: U(c, 'cm'), away: 'B' },
      ],
      maxH: 220,
      label: 'A square sheet with a square cut from each corner',
    }),
    answer: numA(V),
    suffix: 'cm³',
    calc: true,
    hint: 'When the sides fold up, the base of the box is the middle square and the height is the size of the cut.',
    steps: [`The base is ${sCm} ${MINUS} 2 ${TIMES} ${c} = ${U(base, 'cm')} square.`, `The height is ${U(c, 'cm')}.`, `${it('V')} = ${base} ${TIMES} ${base} ${TIMES} ${c} = ${U(V, 'cm³')}`],
    meta: { t: 'openBox', s: sCm, c },
  })
}

export const ex812 = (level: Level): Question => {
  if (level === 1) return pick([() => ahV(1), () => ahV(1), triPrismV])()
  if (level === 2) return pick([() => ahV(2), triPrismV, lPrismV])()
  return pick([prismBackV, openBoxV, cubeSideV, lPrismV])()
}

// ================================================================== 8.13 Volume and capacity

const CAP_OF: [string, string][] = [
  ['a teaspoon', 'mL'],
  ['a can of drink', 'mL'],
  ['a bottle of medicine', 'mL'],
  ['a bucket', 'L'],
  ['a car’s petrol tank', 'L'],
  ['a bathtub', 'L'],
  ['a backyard swimming pool', 'kL'],
  ['a rainwater tank', 'kL'],
  ['a city’s dam', 'ML'],
  ['an Olympic swimming pool', 'ML'],
]

function capUnitQ(): Question {
  const [what, u] = pick(CAP_OF)
  const word: Record<string, string> = { mL: 'millilitres', L: 'litres', kL: 'kilolitres', ML: 'megalitres' }
  return q({
    prompt: `Which unit of capacity would you use to measure the capacity of ${what}?`,
    answer: mcFixedA(['mL', 'L', 'kL', 'ML'], u),
    hint: 'A drop of water is about 1 mL, a milk bottle holds 1 L, a small water tank holds about 1 kL, and half an Olympic pool holds about 1 ML.',
    steps: [`${what[0].toUpperCase() + what.slice(1)} is best measured in ${word[u]} (${u}).`],
    meta: { t: 'capUnit', what },
  })
}

function holdsQ(): Question {
  const k = pick(['cm', 'm', 'mL'] as const)
  if (k === 'cm') {
    const x = pick([250, 600, 1500, 2000, 750, 4000])
    return q({
      prompt: `A container has a volume of ${U(x, 'cm³')}. How many millilitres does it hold?`,
      answer: numA(x),
      suffix: 'mL',
      hint: '1 cm³ holds 1 mL.',
      steps: [`1 cm³ holds 1 mL, so ${U(x, 'cm³')} holds ${U(x, 'mL')}.`],
      meta: { t: 'holds', v: x, from: 'cm³', to: 'mL' },
    })
  }
  if (k === 'm') {
    const x = pick([2, 5, 8, 12, 1.5, 2.5, 0.5])
    return q({
      prompt: `A tank has a volume of ${U(x, 'm³')}. How many litres does it hold?`,
      answer: numA(round(x * 1000, 6)),
      suffix: 'L',
      hint: '1 m³ holds 1 kL, which is 1000 L.',
      steps: [`1 m³ holds 1000 L, so ${U(x, 'm³')} holds ${num(x)} ${TIMES} 1000 = ${U(round(x * 1000, 6), 'L')}.`],
      meta: { t: 'holds', v: x, from: 'm³', to: 'L' },
    })
  }
  const L = pick([1, 2, 1.25, 3, 0.75])
  return q({
    prompt: `A jug holds ${U(L, 'L')}. What is the volume of water it holds, in cubic centimetres?`,
    answer: numA(L * 1000),
    suffix: 'cm³',
    hint: '1 L = 1000 mL, and 1 mL takes up 1 cm³.',
    steps: [`${U(L, 'L')} = ${U(L * 1000, 'mL')}`, `1 mL takes up 1 cm³, so the water is ${U(L * 1000, 'cm³')}.`],
    meta: { t: 'holds', v: L, from: 'L', to: 'cm³' },
  })
}

const CAP_ARROWS: [string, string][] = [['L', 'mL'], ['kL', 'L'], ['ML', 'kL']]

function capConvQ(level: Level): Question {
  const [a, b] = pick(CAP_ARROWS)
  const down = chance()
  const x = level === 1 ? int(2, 20) : pick([int(2, 40), dec1(0.2, 9), 0.25, 0.75, 1.5])
  const [from, to, val, ans] = down ? [a, b, x, round(x * 1000, 6)] : [b, a, round(x * 1000, 6), x]
  return q({
    prompt: `Convert ${U(val, from)} to ${unitWord(to)}.`,
    answer: numA(ans),
    suffix: to,
    hint: down ? `Larger unit to smaller unit: multiply by 1000.` : `Smaller unit to larger unit: divide by 1000.`,
    steps: [down ? `${num(val)} ${TIMES} 1000 = ${num(ans)}` : `${num(val)} ${DIVIDE} 1000 = ${num(ans)}`, `${U(val, from)} = ${U(ans, to)}`],
    meta: { t: 'convert', v: val, from, to },
  })
}

function boxCapQ(): Question {
  let l: number, w: number, h: number
  // a fish tank is longer than it is high or wide
  do {
    l = pick([30, 40, 50, 60, 80])
    w = pick([15, 20, 25, 30])
    h = pick([20, 25, 30, 40])
  } while ((l * w * h) % 100 !== 0 || l <= h || l <= w)
  const V = l * w * h
  return q({
    prompt: `A fish tank is a rectangular prism ${U(l, 'cm')} long, ${U(w, 'cm')} wide and ${U(h, 'cm')} high. How many litres of water will it hold when full?`,
    diagram: D.rectPrism(l, w, h, U(l, 'cm'), U(w, 'cm'), U(h, 'cm')),
    note: NOT_TO_SCALE,
    answer: numA(V / 1000),
    suffix: 'L',
    calc: true,
    hint: 'Find the volume in cm³. Each cm³ holds 1 mL, and 1000 mL = 1 L.',
    steps: [`${it('V')} = ${l} ${TIMES} ${w} ${TIMES} ${h} = ${U(V, 'cm³')}`, `This holds ${U(V, 'mL')}.`, `${num(V)} ${DIVIDE} 1000 = ${U(V / 1000, 'L')}`],
    meta: { t: 'boxCap', l, w, h },
  })
}

function poolQ(): Question {
  const l = int(5, 12)
  const w = int(3, 6)
  const d = pick([1, 1.2, 1.5, 2])
  const V = round(l * w * d, 6)
  return q({
    prompt: `A swimming pool is a rectangular prism ${U(l, 'm')} long, ${U(w, 'm')} wide and ${U(d, 'm')} deep. How many litres of water does it take to fill it?`,
    answer: numA(V * 1000),
    suffix: 'L',
    calc: true,
    hint: 'Find the volume in m³. Each m³ holds 1 kL, which is 1000 L.',
    steps: [`${it('V')} = ${l} ${TIMES} ${w} ${TIMES} ${num(d)} = ${U(V, 'm³')}`, `${U(V, 'm³')} holds ${U(V, 'kL')} = ${U(V * 1000, 'L')}`],
    meta: { t: 'pool', l, w, d },
  })
}

function glassesQ(): Question {
  const glass = pick([150, 200, 250, 300])
  let L: number
  do L = pick([1.2, 1.5, 2, 2.4, 3, 3.6, 4.5, 6])
  while (((L * 1000) / glass) % 1 !== 0)
  return q({
    prompt: `A jug holds ${U(L, 'L')} of water. How many ${U(glass, 'mL')} glasses can be filled from it?`,
    answer: numA((L * 1000) / glass),
    suffix: 'glasses',
    hint: 'Change litres to millilitres, then divide by the size of a glass.',
    steps: [`${U(L, 'L')} = ${U(L * 1000, 'mL')}`, `${num(L * 1000)} ${DIVIDE} ${glass} = ${(L * 1000) / glass} glasses`],
    meta: { t: 'containers', litres: L, cup: glass },
  })
}

function leakQ(): Question {
  const mL = pick([2, 3, 4, 5])
  const every = pick([10, 15, 20, 30])
  const perDay = (mL * 86400) / every
  return q({
    prompt: `A tap leaks ${U(mL, 'mL')} of water every ${every} seconds. How many litres does it leak in one day?`,
    answer: numA(perDay / 1000),
    suffix: 'L',
    calc: true,
    hint: 'Find how many lots of ' + every + ' seconds there are in a day (1 day = 86 400 seconds).',
    steps: [`Seconds in a day: 24 ${TIMES} 60 ${TIMES} 60 = 86 400`, `Lots of ${every} seconds: 86 400 ${DIVIDE} ${every} = ${num(86400 / every)}`, `Water: ${num(86400 / every)} ${TIMES} ${mL} = ${U(perDay, 'mL')} = ${U(perDay / 1000, 'L')}`],
    meta: { t: 'leak', mL, every },
  })
}

function heightQ(): Question {
  const a = pick([10, 20, 25])
  const b = pick([10, 20, 40])
  const hcm = pick([5, 6, 8, 10, 12, 15])
  const L = (a * b * hcm) / 1000
  return q({
    prompt: `${U(L, 'L')} of water is poured into an empty tank with a rectangular base ${U(a, 'cm')} by ${U(b, 'cm')}. How deep is the water?`,
    answer: numA(hcm),
    suffix: 'cm',
    calc: true,
    hint: 'Change the litres to cm³ (1 L = 1000 cm³). Then depth = volume ÷ area of the base.',
    steps: [`${U(L, 'L')} = ${U(L * 1000, 'cm³')}`, `Area of the base = ${a} ${TIMES} ${b} = ${U(a * b, 'cm²')}`, `Depth = ${num(L * 1000)} ${DIVIDE} ${a * b} = ${U(hcm, 'cm')}`],
    meta: { t: 'depth', L, a, b },
  })
}

function partyQ(): Question {
  const people = int(12, 35)
  const each = pick([500, 600, 750, 900, 1200])
  const bottle = pick([1.25, 2])
  const totalL = (people * each) / 1000
  const bottles = Math.ceil(totalL / bottle)
  return q({
    prompt: `${people} people are coming to a party, and each will drink about ${U(each, 'mL')} of juice. Juice comes in ${U(bottle, 'L')} bottles. How many bottles are needed?`,
    answer: numA(bottles),
    suffix: 'bottles',
    calc: true,
    hint: 'Find the total in litres, then divide by the size of a bottle. Round up: a part bottle still has to be bought.',
    steps: [`Total: ${people} ${TIMES} ${each} = ${U(people * each, 'mL')} = ${U(totalL, 'L')}`, `${num(totalL)} ${DIVIDE} ${num(bottle)} = ${num(round(totalL / bottle, 3))}`, `Round up: ${bottles} bottles`],
    meta: { t: 'party', people, each, bottle },
  })
}

export const ex813 = (level: Level): Question => {
  if (level === 1) return pick([capUnitQ, () => capConvQ(1), holdsQ])()
  if (level === 2) return pick([() => capConvQ(2), glassesQ, boxCapQ, holdsQ])()
  return pick([poolQ, leakQ, heightQ, partyQ])()
}

// ================================================================== Power plus (extension)

function stepsShapePP(): Question {
  // a staircase of 3 steps: perimeter and area
  const s = int(2, 5)
  const u = 'cm'
  const pts: Record<string, P> = { A: [0, 0], B: [3 * s, 0], C: [3 * s, s], E: [2 * s, s], F: [2 * s, 2 * s], G: [s, 2 * s], H: [s, 3 * s], K: [0, 3 * s] }
  const askArea = chance()
  const A = 6 * s * s
  const Pm = 12 * s
  return q({
    prompt: `Each step of this staircase shape is ${U(s, u)} high and ${U(s, u)} deep. Find its ${askArea ? 'area' : 'perimeter'}.`,
    diagram: fig({
      pts,
      polys: [{ v: ['A', 'B', 'C', 'E', 'F', 'G', 'H', 'K'] }],
      sides: [
        { a: 'B', b: 'C', text: U(s, u) },
        { a: 'C', b: 'E', text: U(s, u), away: 'A' },
      ],
      ticks: [
        { a: 'B', b: 'C', n: 1 },
        { a: 'C', b: 'E', n: 1 },
        { a: 'E', b: 'F', n: 1 },
        { a: 'F', b: 'G', n: 1 },
        { a: 'G', b: 'H', n: 1 },
        { a: 'H', b: 'K', n: 1 },
      ],
      maxH: 220,
      label: 'A staircase shape',
    }),
    answer: numA(askArea ? A : Pm),
    suffix: askArea ? sq(u) : u,
    hint: askArea ? `Count the squares: 3 along the bottom, 2 in the middle and 1 at the top, each ${s} cm by ${s} cm.` : 'Move the step edges out: the perimeter is the same as a square with sides 3 steps long.',
    steps: askArea
      ? [`The shape is 6 squares, each ${s} ${TIMES} ${s} = ${s * s}`, `${it('A')} = 6 ${TIMES} ${s * s} = ${U(A, sq(u))}`]
      : [`The bottom and the left side are each ${3 * s} cm. The steps together go ${3 * s} cm across and ${3 * s} cm up.`, `Perimeter = 4 ${TIMES} ${3 * s} = ${U(Pm, u)}`],
    meta: { t: 'stairs', s, askArea },
  })
}

function maxAreaPP(): Question {
  const half = 2 * int(4, 12)
  const P = 2 * half
  const side = half / 2
  return q({
    prompt: `A rectangle has a perimeter of ${U(P, 'cm')} and whole-number side lengths. What is the greatest area it can have?`,
    answer: numA(side * side),
    suffix: 'cm²',
    hint: 'List the possible length and width pairs (they add to half the perimeter) and work out each area.',
    steps: [`Length + width = ${half}.`, `Areas: ${[1, 2, 3, side - 1, side].filter((x, i, a) => x >= 1 && a.indexOf(x) === i).map((x) => `${x} ${TIMES} ${half - x} = ${x * (half - x)}`).join('; ')}.`, `The greatest is the square, ${side} ${TIMES} ${side} = ${U(side * side, 'cm²')}.`],
    meta: { t: 'maxArea', P },
  })
}

function sameNumberPP(): Question {
  const right = pick([[3, 6], [4, 4]] as [number, number][])
  const others = [[2, 8], [3, 5], [4, 6], [5, 5], [2, 6], [3, 7]] as [number, number][]
  const wrong = sample(others, 3).map(([l, w]) => `${l} cm by ${w} cm`)
  return q({
    prompt: 'For which rectangle is the perimeter (in cm) the same number as the area (in cm²)?',
    answer: mcA(`${right[0]} cm by ${right[1]} cm`, wrong),
    hint: 'Work out the perimeter and the area of each rectangle.',
    steps: [`${right[0]} by ${right[1]}: perimeter 2 ${TIMES} (${right[0]} + ${right[1]}) = ${2 * (right[0] + right[1])}, area ${right[0]} ${TIMES} ${right[1]} = ${right[0] * right[1]}.`, 'The numbers are the same (the units are different, of course).'],
    meta: { t: 'sameNumber' },
  })
}

function paintPP(): Question {
  const l = int(4, 6)
  const w = int(3, 4)
  const h = pick([2.4, 2.5, 3])
  const door = 2 * 0.8
  const walls = round(2 * (l + w) * h - door, 6)
  const cover = pick([8, 10, 12])
  const litres = Math.ceil((2 * walls) / cover)
  return q({
    prompt: `A room is ${U(l, 'm')} long, ${U(w, 'm')} wide and ${U(h, 'm')} high. Its 4 walls get 2 coats of paint, except for a door 2 m by 0.8 m. One litre of paint covers ${U(cover, 'm²')}. How many whole litres of paint must be bought?`,
    answer: numA(litres),
    suffix: 'L',
    calc: true,
    hint: 'Find the area of the 4 walls, take away the door, double it for 2 coats, then divide by what one litre covers. Round up.',
    steps: [`Walls: 2 ${TIMES} (${l} + ${w}) ${TIMES} ${num(h)} = ${num(round(2 * (l + w) * h, 6))} m²`, `Take away the door: ${num(round(2 * (l + w) * h, 6))} ${MINUS} ${num(door)} = ${num(walls)} m²`, `2 coats: ${num(round(2 * walls, 6))} m² ${DIVIDE} ${cover} = ${num(round((2 * walls) / cover, 3))}`, `Round up: ${litres} L`],
    meta: { t: 'paint', l, w, h, cover },
  })
}

function poolCostPP(): Question {
  const s = pick([2, 3, 4])
  const depthMm = pick([200, 250, 300, 400, 500])
  const price = pick([2, 2.5, 3, 4])
  const area = 5 * s * s
  const V = round((area * depthMm) / 1000, 6)
  const cost = round(V * price, 2)
  return q({
    prompt: `A paddling pool's floor is a cross made of 5 squares, each ${U(s, 'm')} by ${U(s, 'm')}. It is filled to a depth of ${U(depthMm, 'mm')}. Water costs $${num(price, 2)} per kilolitre. How much does it cost to fill the pool?`,
    answer: numA(cost, 2),
    prefix: '$',
    calc: true,
    hint: 'Area of the floor × depth in metres gives the volume in m³. Each m³ is 1 kL.',
    steps: [`Floor area = 5 ${TIMES} ${s} ${TIMES} ${s} = ${U(area, 'm²')}`, `Depth = ${U(depthMm / 1000, 'm')}, so ${it('V')} = ${area} ${TIMES} ${num(depthMm / 1000)} = ${U(V, 'm³')} = ${U(V, 'kL')}`, `Cost = ${num(V)} ${TIMES} $${num(price, 2)} = $${num(cost, 2)}`],
    meta: { t: 'poolCost', s, depthMm, price },
  })
}

export const exPowerPlus = (level: Level): Question => {
  if (level === 1) return pick([stepsShapePP, sameNumberPP])()
  if (level === 2) return pick([maxAreaPP, stepsShapePP, sameNumberPP])()
  return pick([paintPP, poolCostPP, maxAreaPP])()
}

// ================================================================== Topic test (like Test Yourself 8)

const T = (skill: string, level: Level, gen: () => Question): TestItem => ({ skill, level, gen: () => gen() })

export const NCM8_TEST: TestItem[] = [
  T('y7-ms-metric', 2, upQ),
  T('y7-ms-metric', 2, () => downQ(2)),
  T('y7-ms-perimeter', 1, () => rectP(1)),
  T('y7-ms-perimeter', 2, () => lShapeP(2)),
  T('y7-ms-circumference', 2, () => calcC(2)),
  T('y7-ms-areaunits', 2, () => areaConvQ(2)),
  T('y7-ms-rect', 1, () => rectA(1)),
  T('y7-ms-triangle', 2, triExtraA),
  T('y7-ms-parallelogram', 1, () => paraA(1)),
  T('y7-ms-composite', 2, holeA),
  T('y7-ms-composite', 2, lShapeA),
  T('y7-ms-prisms', 2, crossShapeQ),
  T('y7-ms-prisms', 2, () => cubeViewQ(2)),
  T('y7-ms-volunits', 2, () => volConvQ(2)),
  T('y7-ms-rectprism', 1, () => boxV(1)),
  T('y7-ms-prismvol', 1, triPrismV),
  T('y7-ms-capacity', 2, boxCapQ),
  T('y7-ms-capacity', 3, heightQ),
]

// ================================================================== Skills, in textbook order

const ref = (n: string) => `NCM 7 Ex ${n}`

export const NCM8_SKILLS: Skill[] = [
  {
    id: 'y7-ms-metric',
    title: 'The metric system',
    ref: ref('8.01'),
    outcomes: [VOL],
    summary: 'Convert between metric units of length, mass, capacity and time.',
    learn: {
      intro:
        '<p>Australia uses the <b>metric system</b>, which is based on powers of 10. Each kind of measurement has a family of units: length (mm, cm, m, km), mass (mg, g, kg, t), capacity (mL, L, kL, ML). Time is the odd one out: it uses 60s and 24s.</p><p>To convert a <b>large unit to a small unit, multiply</b> (there will be more of the small units). To convert a <b>small unit to a large unit, divide</b>.</p>',
      keyPoints: [
        '1 cm = 10 mm, 1 m = 100 cm = 1000 mm, 1 km = 1000 m',
        '1 g = 1000 mg, 1 kg = 1000 g, 1 t = 1000 kg',
        '1 L = 1000 mL, 1 kL = 1000 L, 1 ML = 1000 kL',
        '1 min = 60 s, 1 h = 60 min = 3600 s, 1 day = 24 h',
        'Prefixes: kilo- means 1000 times, centi- means one-hundredth, milli- means one-thousandth, mega- means one million times.',
        'Watch the capitals: mL is a millilitre but ML is a megalitre, a billion times bigger.',
      ],
      vocab: [
        ['metric system', 'the system of units based on powers of 10'],
        ['prefix', 'the start of a unit’s name that tells its size, such as kilo- or milli-'],
      ],
    },
    gen: ex801,
    levels: {
      1: 'Conversion facts; large to small units with whole numbers',
      2: 'Both directions, with decimals and time; comparing lengths in different units; sensible estimates',
      3: 'Two-step conversions; how many containers fill another; the meaning of prefixes (a Stage 5 idea in the syllabus); time facts',
    },
  },
  {
    id: 'y7-ms-perimeter',
    title: 'Perimeter',
    ref: ref('8.02'),
    outcomes: [LEN],
    summary: 'Find the perimeter of squares, rectangles, triangles and composite shapes, and work backwards from a perimeter.',
    learn: {
      intro:
        '<p>The <b>perimeter</b> of a shape is the distance around it: add the lengths of all its sides. For a square with side <i>s</i>, <i>P</i> = 4<i>s</i>. For a rectangle with length <i>l</i> and width <i>w</i>, <i>P</i> = 2<i>l</i> + 2<i>w</i> or 2(<i>l</i> + <i>w</i>).</p><p>Marks on the sides tell you which sides are equal. For an L-shape, work out any missing sides from the sides you know first.</p>',
      keyPoints: [
        'Perimeter is a length, so its unit is not squared: cm, not cm².',
        'Equal tick marks mean equal sides.',
        'A dashed line inside a shape is not part of its perimeter.',
        'The perimeter of an L-shape is the same as the rectangle around it: 2 × (width + height).',
        'Working backwards: half the perimeter of a rectangle is one length plus one width.',
      ],
      vocab: [['perimeter', 'the distance around the outside of a shape']],
    },
    gen: ex802,
    levels: { 1: 'Squares, rectangles, triangles, regular polygons and L-shapes with every side given', 2: 'Decimals; L-shapes with sides to work out; a rectangle with a triangle on top', 3: 'Side lengths from the perimeter; possible lengths and widths; a U-shape' },
  },
  {
    id: 'y7-ms-circumference',
    title: 'Circumference of a circle',
    ref: ref('8.03'),
    outcomes: [LEN],
    summary: 'Name the parts of a circle and find its circumference with C = πd or C = 2πr.',
    learn: {
      intro:
        '<p>The <b>radius</b> goes from the centre of a circle to its edge. The <b>diameter</b> goes right across through the centre, so it is 2 radii long. The <b>circumference</b> is the perimeter of the circle.</p><p>For every circle, the circumference divided by the diameter is the same number, called <b>pi</b> (π ≈ 3.14159…). So <i>C</i> = π<i>d</i>, or <i>C</i> = 2π<i>r</i>.</p>',
      keyPoints: [
        'd = 2r and r = d ÷ 2',
        'Estimate: the circumference is a bit more than 3 times the diameter.',
        'An exact answer leaves π in it, such as 10π cm. For a decimal answer, use the π key and round.',
        'The perimeter of a semicircle is half the circumference plus the diameter.',
        'Working backwards: d = C ÷ π.',
      ],
      vocab: [
        ['radius', 'the distance from the centre of a circle to its edge'],
        ['diameter', 'the distance across a circle through its centre'],
        ['circumference', 'the perimeter of a circle'],
        ['pi (π)', 'the circumference of any circle divided by its diameter, about 3.14'],
      ],
    },
    gen: ex803,
    levels: { 1: 'Parts of a circle; radius and diameter; estimating with π ≈ 3', 2: 'Exact answers in terms of π; rounded answers with a calculator; one-step problems', 3: 'Decimal lengths; turns of a wheel; diameter from circumference; perimeter of a semicircle' },
  },
  {
    id: 'y7-ms-areaunits',
    title: 'Metric units for area',
    ref: ref('8.04'),
    outcomes: [ARE],
    summary: 'Choose units of area and convert between mm², cm², m², hectares and km².',
    learn: {
      intro:
        '<p><b>Area</b> is the amount of surface a shape covers, measured in square units. A square 1 cm by 1 cm has an area of 1 cm², about the size of a fingernail. A square metre is about the floor of a shower; a <b>hectare</b> (ha) is a square 100 m by 100 m, about the size of a football field.</p><p>Because 1 cm = 10 mm, 1 cm² = 10 × 10 = 100 mm². The area factor is the length factor squared: double the number of zeros.</p>',
      keyPoints: ['1 cm² = 100 mm²', '1 m² = 10 000 cm² = 1 000 000 mm²', '1 ha = 10 000 m²', '1 km² = 1 000 000 m² = 100 ha', 'Larger unit to smaller unit: multiply. Smaller to larger: divide.'],
      vocab: [
        ['area', 'the amount of surface enclosed by a shape'],
        ['hectare', 'the area of a square 100 m by 100 m: 10 000 m²'],
      ],
    },
    gen: ex804,
    levels: { 1: 'Choosing a unit; conversion facts', 2: 'Converting both ways; estimating areas; hectares', 3: 'Ordering areas in different units; m² to mm²; km² and hectares' },
  },
  {
    id: 'y7-ms-rect',
    title: 'Area of a rectangle',
    ref: ref('8.05'),
    outcomes: [ARE],
    summary: 'Use A = lw and A = s² to find areas, missing sides, costs and numbers of tiles.',
    learn: {
      intro:
        '<p>The area of a rectangle is its length times its width: <i>A</i> = <i>lw</i>. (The syllabus writes this as <i>A</i> = <i>lb</i>, where <i>b</i> is the breadth.) A square has equal sides, so <i>A</i> = <i>s</i>².</p><p>The two lengths must be in the same unit before you multiply. To find a missing side, divide the area by the side you know.</p>',
      keyPoints: ['Area is measured in square units: mm², cm², m².', 'Change mixed units to the same unit first, e.g. 80 cm = 0.8 m.', 'Missing side = area ÷ the other side.', 'The side of a square is the number that multiplies by itself to give the area.', 'If each side of a square is multiplied by 3, its area is multiplied by 9.'],
    },
    gen: ex805,
    levels: { 1: 'Rectangles and squares with whole-number sides', 2: 'Decimals; sides in different units; missing sides', 3: 'Costs per square metre; numbers of tiles; enlarging a square' },
  },
  {
    id: 'y7-ms-triangle',
    title: 'Area of a triangle',
    ref: ref('8.06'),
    outcomes: [ARE],
    summary: 'Use A = ½bh with the perpendicular height, ignoring sides that are not needed.',
    learn: {
      intro:
        '<p>A triangle is half of a rectangle with the same base and height, so <i>A</i> = ½<i>bh</i>. Any side can be the base. The <b>perpendicular height</b> is measured at right angles from the base to the opposite vertex; it is drawn as a dashed line with a right-angle mark.</p>',
      keyPoints: ['Use the perpendicular height, not a slanted side.', 'The height can fall outside the triangle (then the base is extended with a dashed line).', 'In a right-angled triangle, the two sides at the right angle are the base and height.', 'Working backwards: base × height = 2 × area.'],
      vocab: [['perpendicular height', 'the height measured at right angles to the base']],
    },
    gen: ex806,
    levels: { 1: 'Base and height given', 2: 'Extra sides to ignore; right-angled triangles; the height outside; decimals', 3: 'Base or height from the area; base equal to height; a shape split into two triangles' },
  },
  {
    id: 'y7-ms-parallelogram',
    title: 'Area of a parallelogram',
    ref: ref('8.07'),
    outcomes: [ARE],
    summary: 'Use A = bh with the perpendicular height.',
    learn: {
      intro:
        '<p>A <b>parallelogram</b> is a quadrilateral with opposite sides parallel and equal. Cut a triangle off one end and move it to the other end, and it becomes a rectangle with the same base and height. So <i>A</i> = <i>bh</i>, where <i>h</i> is the perpendicular height.</p>',
      keyPoints: ['Use the perpendicular height (dashed), never the slanted side.', 'Change the lengths to the same unit first.', 'Working backwards: h = A ÷ b and b = A ÷ h.'],
      vocab: [['parallelogram', 'a quadrilateral with both pairs of opposite sides parallel']],
    },
    gen: ex807,
    levels: { 1: 'Base and height given', 2: 'A slanted side to ignore; decimals; mixed units', 3: 'Height or base from the area; the same area as a square' },
  },
  {
    id: 'y7-ms-composite',
    title: 'Areas of composite shapes',
    ref: ref('8.08'),
    outcomes: [ARE],
    summary: 'Find areas by adding the parts or subtracting the missing parts.',
    learn: {
      intro:
        '<p>A <b>composite shape</b> is made of 2 or more simpler shapes. Either split it into parts and add their areas, or find the area of a larger shape and subtract the part that is missing (or cut out).</p>',
      keyPoints: ['Work out any missing lengths first.', 'Shaded area = area of the whole − area of the hole.', 'A path around a garden: (garden + path) − garden.', 'Check by doing it both ways: adding parts and subtracting.'],
      vocab: [['composite shape', 'a shape made of 2 or more simpler shapes']],
    },
    gen: ex808,
    levels: { 1: 'Two rectangles; a rectangle with a triangle on top', 2: 'L-shapes; shapes with holes; choosing the right expression', 3: 'Paths, lawns with garden beds, and tiling a cross-shaped floor' },
  },
  {
    id: 'y7-ms-prisms',
    title: 'Drawing prisms',
    ref: ref('8.09'),
    outcomes: [VOL],
    summary: 'Recognise prisms, name them by their cross-section, and describe their views from the top and front.',
    learn: {
      intro:
        '<p>A <b>cross-section</b> is a slice cut across a solid, parallel to its ends. If a solid has the same straight-sided cross-section all along it, it is a <b>prism</b>. A prism is named after its base: a triangular prism, a rectangular prism, a hexagonal prism and so on.</p><p>A solid looks different from different sides. The <b>top view</b> is what you see from directly above; the <b>front view</b> is what you see looking straight at its front.</p>',
      keyPoints: ['Pyramids, cones and spheres are not prisms: their cross-sections change size.', 'The side faces of a prism are rectangles.', 'From the front, each column of cubes looks as tall as its tallest stack.', 'Drawing prisms on square or isometric dot paper is practised in your book; this page practises the ideas behind the drawings.'],
      vocab: [
        ['prism', 'a solid with the same straight-sided cross-section all along its length'],
        ['cross-section', 'a slice across a solid, parallel to its ends'],
      ],
    },
    gen: ex809,
    levels: { 1: 'Prism or not; naming prisms', 2: 'Cross-sections and side faces; top and front views of cube solids', 3: 'Counting the cubes in a solid; views of prisms' },
  },
  {
    id: 'y7-ms-volunits',
    title: 'Metric units for volume',
    ref: ref('8.10'),
    outcomes: [VOL],
    summary: 'Choose units of volume and convert between mm³, cm³ and m³.',
    learn: {
      intro:
        '<p><b>Volume</b> is the amount of space a solid takes up, measured in cubic units. A cubic centimetre (cm³) is a cube 1 cm by 1 cm by 1 cm, about the size of a tooth. A cubic metre is about the size of 2 washing machines.</p><p>Because 1 cm = 10 mm, 1 cm³ = 10 × 10 × 10 = 1000 mm³. Because 1 m = 100 cm, 1 m³ = 100 × 100 × 100 = 1 000 000 cm³.</p>',
      keyPoints: ['1 cm³ = 1000 mm³', '1 m³ = 1 000 000 cm³', 'Larger unit to smaller unit: multiply. Smaller to larger: divide.', 'Count cubes in layers: cubes in one layer × number of layers.'],
      vocab: [['volume', 'the amount of space taken up by a solid']],
    },
    gen: ex810,
    levels: { 1: 'Choosing a unit; conversion facts; counting cubes', 2: 'Converting both ways; estimating volumes', 3: 'Decimal conversions and m³ to mm³' },
  },
  {
    id: 'y7-ms-rectprism',
    title: 'Volume of a rectangular prism',
    ref: ref('8.11'),
    outcomes: [VOL],
    summary: 'Use V = lwh to find volumes and missing dimensions.',
    learn: {
      intro: '<p>The volume of a rectangular prism is length × width × height: <i>V</i> = <i>lwh</i>. For a cube with edges <i>s</i>, <i>V</i> = <i>s</i>³.</p>',
      keyPoints: ['Change all the lengths to the same unit first.', 'Volume is measured in cubic units: cm³, m³.', 'Missing height = volume ÷ (length × width).', 'A hollow block: volume of the block − volume of the hole.'],
    },
    gen: ex811,
    levels: { 1: 'Boxes and cubes with whole numbers', 2: 'Decimals; boxes described in words; mixed units', 3: 'Missing dimensions; the edge of a cube; soil in a garden bed; a hollow block' },
  },
  {
    id: 'y7-ms-prismvol',
    title: 'Volume of a prism',
    ref: ref('8.12'),
    outcomes: [VOL],
    summary: 'Use V = Ah: the area of the cross-section times the length of the prism.',
    learn: {
      intro:
        '<p>A prism is made of identical slices, so its volume is the area of its cross-section times its length (called its height): <i>V</i> = <i>Ah</i>. For a triangular prism, find the triangle’s area first with ½<i>bh</i>.</p>',
      keyPoints: ['V = area of cross-section × height of the prism.', 'The prism’s height is the distance between its two bases, even if it is lying down.', 'For an L-shaped cross-section, find its area as a composite shape first.'],
    },
    gen: ex812,
    levels: { 1: 'Area of the cross-section given; triangular prisms', 2: 'Decimal areas; L-shaped cross-sections', 3: 'The length from the volume; the edge of a cube; an open box folded from a sheet' },
  },
  {
    id: 'y7-ms-capacity',
    title: 'Volume and capacity',
    ref: ref('8.13'),
    outcomes: [VOL],
    summary: 'Convert between mL, L, kL and ML, and use 1 cm³ = 1 mL and 1 m³ = 1 kL.',
    learn: {
      intro:
        '<p><b>Capacity</b> is the amount of fluid (liquid or gas) a container holds, measured in millilitres (mL), litres (L), kilolitres (kL) and megalitres (ML). A large drop of water is about 1 mL; a small rainwater tank holds about 1 kL; half an Olympic pool holds about 1 ML.</p><p>Volume and capacity are linked: <b>1 cm³ holds 1 mL</b>, and <b>1 m³ holds 1 kL</b> (1000 L).</p>',
      keyPoints: ['1 L = 1000 mL, 1 kL = 1000 L, 1 ML = 1000 kL = 1 000 000 L', '1 cm³ = 1 mL, so 1000 cm³ = 1 L', '1 m³ = 1 kL = 1000 L', 'Round up when buying whole bottles or tins.'],
      vocab: [['capacity', 'the amount of fluid a container holds']],
    },
    gen: ex813,
    levels: { 1: 'Choosing a unit; simple conversions; cm³ and mL', 2: 'Conversions with decimals; glasses from a jug; litres in a tank', 3: 'Pools, leaking taps, water depth and bottles for a party' },
  },
  {
    id: 'y7-ms-powerplus',
    title: 'Power plus: area and volume challenges',
    ref: 'NCM 7 Power plus',
    tag: 'extension',
    outcomes: [LEN, ARE, VOL],
    summary: 'Harder problems: perimeter and area together, the greatest area for a perimeter, painting a room and filling a pool.',
    learn: {
      intro: '<p>These questions combine perimeter, area, volume and capacity, often over several steps. Draw a sketch, label it, and write each step.</p>',
      keyPoints: ['For a fixed perimeter, the rectangle with the greatest area is a square.', 'For paint, take away doors and windows, multiply by the number of coats, then round up the litres.', 'Volume in m³ is the same number of kilolitres.'],
    },
    gen: exPowerPlus,
    levels: { 1: 'A staircase shape; perimeter equal to area', 2: 'The greatest area for a given perimeter', 3: 'Painting a room; the cost of filling a pool' },
  },
]
