// Year 9 Surface area and volume, following New Century Maths 9 (3rd edition, Cengage) Chapter 10 exercise by
// exercise. The questions are the site's own: they practise the same kinds of question as each exercise, in the same
// easy-to-hard order (Foundation = the start of the exercise, Challenge = the end), but none of the textbook's wording
// or numbers are copied.
// Syllabus:
//   10.01–10.03 MA5-MAG-C-01 (very small and very large units; precision and absolute error, the limits of accuracy).
//     Percentage error (10.03) could not be found in the K–10 syllabus wording that was reachable (it is Stage 6
//     Standard content); it is kept as core because NCM 9 teaches it as a core section, and the report flags it.
//   10.04 MA4-LEN-C-01, MA4-ARE-C-01, MA5-ARE-C-01 (perimeter and area of composite shapes)
//   10.05 MA4-ARE-C-01 (parallelograms, trapeziums, rhombuses, kites)
//   10.06 MA4-LEN-C-01, MA4-ARE-C-01 (circles, arcs and sectors, composite circular shapes)
//   10.07–10.08 MA5-ARE-C-01 (surface area of right prisms and cylinders)
//   10.09 MA4-VOL-C-01, MA5-VOL-C-01 (volume and capacity of prisms, cylinders and composite solids)
// π is the calculator's π. Plane shapes are drawn to scale; the page says so when one is not.
import type { Level, Question, Skill, TestItem } from '@/lib/maths/types'
import { halfCylinder, rectQuadrant, scaleBar, sector, tentPrism, trapPrism } from '@/lib/maths/diagrams10'
import { fig } from '@/lib/maths/diagrams6'
import { D, NOT_TO_SCALE, approx, chance, clean, int, mcA, mcFixedA, name, num, numA, pick, q, round } from './helpers'

const MAG = ['MA5-MAG-C-01']
const COMP = ['MA4-LEN-C-01', 'MA4-ARE-C-01', 'MA5-ARE-C-01']
const QUAD = ['MA4-ARE-C-01']
const CIRC = ['MA4-LEN-C-01', 'MA4-ARE-C-01']
const SA = ['MA5-ARE-C-01']
const VOL = ['MA4-VOL-C-01', 'MA5-VOL-C-01']
const ref = (e: string) => `NCM 9 Ex ${e}`
const PI = Math.PI
const dpWords = (dp: number) => (dp === 0 ? 'to the nearest whole number' : `correct to ${dp} decimal place${dp > 1 ? 's' : ''}`)
/** a number with its unit, never split across a line */
const U = (x: number, u: string) => `${num(clean(x))} ${u}`
const half = '½'
/** decimal places shown by a measurement made to the nearest p (0.1 → 1, 0.01 → 2, 10 → 0) */
const dpOf = (p: number) => Math.max(0, -Math.floor(Math.log10(p) + 1e-9))
/** a measurement written with the decimal places its precision implies (20.10 m, not 20.1 m) */
const Um = (m: number, p: number, u: string) => `${num(m, dpOf(p))}\u00a0${u}`

// ================================================================= 10.01 Metric units

type Fam = [string, number][]
const FAMS: Record<string, Fam> = {
  length: [['mm', 1], ['cm', 10], ['m', 1000], ['km', 1e6]],
  mass: [['mg', 1], ['g', 1e3], ['kg', 1e6], ['t', 1e9]],
  capacity: [['mL', 1], ['L', 1e3], ['kL', 1e6], ['ML', 1e9]],
  time: [['s', 1], ['min', 60], ['h', 3600], ['days', 86400]],
  data: [['B', 1], ['kB', 1e3], ['MB', 1e6], ['GB', 1e9], ['TB', 1e12]],
}
/** the multipliers between neighbouring units from index i to index j (i > j: big to small) */
function chain(fam: Fam, i: number, j: number): number[] {
  const out: number[] = []
  if (i > j) for (let k = i; k > j; k--) out.push(fam[k][1] / fam[k - 1][1])
  else for (let k = i; k < j; k++) out.push(fam[k + 1][1] / fam[k][1])
  return out
}
const niceDown = () => pick([int(2, 95), int(11, 99) / 10, int(101, 999) / 100, int(2, 9) + 0.5])
const niceUp = () => pick([int(2, 95), int(11, 99) / 10, int(2, 40) + 0.5])
function convertQ(famName: string, i: number, j: number): Question {
  const fam = FAMS[famName]
  const time = famName === 'time'
  const ms = chain(fam, i, j)
  const big = i > j
  const total = ms.reduce((a, b) => a * b, 1)
  let x: number
  let y: number
  if (big) {
    x = time ? pick([int(2, 30), int(2, 12) + 0.5, int(1, 9) + 0.25]) : niceDown()
    y = clean(x * total)
  } else {
    y = time ? pick([int(2, 30), int(2, 12) + 0.5]) : niceUp()
    x = clean(y * total)
  }
  const [from, to] = [fam[i][0], fam[j][0]]
  const op = big ? '×' : '÷'
  return q({
    prompt: `Convert ${U(x, from)} to ${to}.`,
    answer: numA(y),
    suffix: to,
    hint: big ? 'To change to a smaller unit, multiply.' : 'To change to a larger unit, divide.',
    steps: [`${big ? 'Smaller unit, so multiply' : 'Larger unit, so divide'}: ${ms.map((m) => `${op} ${num(m)}`).join(' ')}`, `${num(x)} ${ms.map((m) => `${op} ${num(m)}`).join(' ')} = ${num(y)} ${to}`],
    calc: ms.length > 1,
    meta: { t: 'mea', kind: 'convert', fam: famName, from, to, x },
  })
}
const SENSIBLE: [string, string[], string][] = [
  ['the height of a classroom door', ['20 cm', '2 m', '20 m'], '2 m'],
  ['the capacity of a can of soft drink', ['37.5 mL', '375 mL', '3.75 L'], '375 mL'],
  ['the mass of a family car', ['150 kg', '1500 kg', '15 000 kg'], '1500 kg'],
  ['the length of a sheet of A4 paper', ['30 mm', '30 cm', '3 m'], '30 cm'],
  ['the mass of an apple', ['15 g', '150 g', '1.5 kg'], '150 g'],
  ['the capacity of a bathtub', ['15 L', '150 L', '1500 L'], '150 L'],
  ['the road distance from Sydney to Newcastle', ['16 km', '160 km', '1600 km'], '160 km'],
  ['the time a Year 9 student takes to run 100 m', ['1.5 s', '15 s', '150 s'], '15 s'],
]
const TINY: { from: string; to: string; factor: number; gen: () => number; up: boolean; say?: string }[] = [
  { from: 's', to: 'μs (microseconds)', factor: 1e6, gen: () => int(11, 99) / 100, up: false },
  { from: 'ms', to: 's', factor: 1e3, gen: () => int(2, 99) * 500, up: true, say: 'ms (milliseconds)' },
  { from: 'Ma (mega-annum)', to: 'years', factor: 1e6, gen: () => int(11, 99) / 10, up: false },
  { from: 'nm (nanometres)', to: 'm', factor: 1e9, gen: () => int(11, 99) * 1e5, up: true },
  { from: 'Mm (megametres)', to: 'm', factor: 1e6, gen: () => int(11, 99) / 10, up: false },
  { from: 'millennia', to: 'years', factor: 1e3, gen: () => int(11, 99) / 10, up: false },
  { from: 'μg (micrograms)', to: 'g', factor: 1e6, gen: () => int(2, 99) * 1000, up: true },
  { from: 'GL (gigalitres)', to: 'ML', factor: 1e3, gen: () => int(11, 999) / 10, up: false },
]

function units(level: Level): Question {
  if (level === 1) {
    if (chance(0.25)) {
      const [what, opts, right] = pick(SENSIBLE)
      return q({
        prompt: `Which is the most sensible measurement for ${what}?`,
        answer: mcA(right, opts.filter((o) => o !== right)),
        hint: 'Picture it: compare with something you know, like your own height (about 1.6 m) or a 1 L bottle.',
        steps: [`${right} is the only sensible size for ${what}.`],
        meta: { t: 'mea', kind: 'sensible' },
      })
    }
    const famName = pick(['length', 'mass', 'capacity', 'time'])
    const fam = FAMS[famName]
    const i = int(0, fam.length - 2)
    return chance() ? convertQ(famName, i + 1, i) : convertQ(famName, i, i + 1)
  }
  if (level === 2) {
    const famName = pick(['length', 'mass', 'capacity', 'time', 'data', 'data'])
    const fam = FAMS[famName]
    if (famName === 'data') {
      const i = int(0, fam.length - 2)
      const j = chance(0.7) ? i + 1 : Math.min(fam.length - 1, i + 2)
      return chance() ? convertQ(famName, j, i) : convertQ(famName, i, j)
    }
    const i = int(0, fam.length - 3)
    return chance() ? convertQ(famName, i + 2, i) : convertQ(famName, i, i + 2)
  }
  if (chance()) {
    const t = pick(TINY)
    const x = t.gen()
    const y = t.up ? clean(x / t.factor) : clean(x * t.factor)
    const fromName = t.say ?? t.from
    const toUnit = t.to.split(' ')[0]
    return q({
      prompt: `Convert ${num(x)} ${fromName} to ${t.to}.`,
      answer: numA(y),
      suffix: toUnit,
      hint: t.up ? 'Changing to a larger unit: divide.' : 'Changing to a smaller unit: multiply.',
      steps: [`1 ${t.from.split(' ')[0]} = ${num(t.up ? 1 / t.factor : t.factor)} ${toUnit}`, `${num(x)} ${t.up ? '÷' : '×'} ${num(t.factor)} = ${num(y)} ${toUnit}`],
      calc: true,
      meta: { t: 'mea', kind: 'tiny', x, factor: t.factor, up: t.up },
    })
  }
  const who = name()
  const mins = pick([45, 75, 90, 105, 150])
  const rate = pick([2, 3, 4, 6])
  const gb = clean((mins * rate) / 1000)
  return q({
    prompt: `${who} made a video call lasting ${mins} minutes. It used ${rate} MB of data per minute. How many GB of data did the call use? (1 GB = 1000 MB)`,
    answer: numA(gb),
    suffix: 'GB',
    hint: 'Find the data in MB first, then change MB to GB.',
    steps: [`${mins} × ${rate} = ${mins * rate} MB`, `${mins * rate} ÷ 1000 = ${num(gb)} GB`],
    calc: true,
    meta: { t: 'mea', kind: 'data', mins, rate },
  })
}

// ================================================================= 10.02 Precision and absolute error

const SCALES = [
  { from: 60, to: 90, minor: 1, every: 10, unit: 'mm', what: 'ruler' },
  { from: 80, to: 90, minor: 0.5, every: 2, unit: 'kg', what: 'set of bathroom scales' },
  { from: 0, to: 100, minor: 5, every: 4, unit: 'mL', what: 'measuring cylinder' },
  { from: 0, to: 40, minor: 2, every: 5, unit: '°C', what: 'thermometer' },
  { from: 3, to: 6, minor: 0.1, every: 10, unit: 'cm', what: 'ruler' },
  { from: 0, to: 300, minor: 10, every: 5, unit: 'g', what: 'kitchen scale' },
  { from: 0, to: 4, minor: 0.2, every: 5, unit: 'L', what: 'measuring jug' },
  { from: 0, to: 500, minor: 25, every: 4, unit: 'mL', what: 'measuring jug' },
  { from: 0, to: 120, minor: 5, every: 4, unit: 'km/h', what: 'speedometer' },
]
const STATED: { what: string; unit: string; p: number; gen: () => number; how: string }[] = [
  { what: 'The length of a pencil is', unit: 'cm', p: 0.1, gen: () => int(80, 190) / 10, how: 'measured with a ruler marked in millimetres' },
  { what: 'A bag of flour has a mass of', unit: 'g', p: 10, gen: () => int(12, 99) * 10, how: 'measured to the nearest 10 g' },
  { what: 'The length of a room is', unit: 'm', p: 0.1, gen: () => int(31, 89) / 10, how: 'measured to the nearest 0.1 m' },
  { what: 'A truck has a mass of', unit: 'kg', p: 100, gen: () => int(25, 90) * 100, how: 'measured to the nearest 100 kg' },
  { what: 'A runner’s time is', unit: 's', p: 0.01, gen: () => int(1100, 1599) / 100, how: 'timed to the nearest 0.01 s' },
  { what: 'A bucket holds', unit: 'L', p: 0.5, gen: () => int(10, 40) / 2, how: 'measured to the nearest 0.5 L' },
]

function precision(level: Level): Question {
  if (level === 1) {
    const s = pick(SCALES)
    const askP = chance()
    const ae = clean(s.minor / 2)
    return q({
      prompt: `<p>This ${s.what} is marked in ${s.unit}. What is its ${askP ? 'precision' : 'absolute error'}?</p>`,
      diagram: scaleBar(s.from, s.to, s.minor, s.every, s.unit),
      answer: numA(askP ? s.minor : ae),
      suffix: s.unit,
      hint: askP ? 'The precision is the size of the smallest unit on the scale: the gap between two neighbouring marks.' : 'Absolute error = ½ × precision. Find the gap between two neighbouring marks first.',
      steps: [`Between ${num(s.from)} and ${num(clean(s.from + s.every * s.minor))} there are ${s.every} gaps, so each mark is ${num(clean(s.every * s.minor))} ÷ ${s.every} = ${num(s.minor)} ${s.unit}.`, askP ? `Precision = ${num(s.minor)} ${s.unit}` : `Absolute error = ${half} × ${num(s.minor)} = ${num(ae)} ${s.unit}`],
      meta: { t: 'mea', kind: 'scale', ask: askP ? 'precision' : 'ae' },
    })
  }
  if (level === 2) {
    const s = pick(STATED)
    const m = s.gen()
    const ae = clean(s.p / 2)
    const ask = pick(['ae', 'lower', 'upper'] as const)
    const val = ask === 'ae' ? ae : ask === 'lower' ? clean(m - ae) : clean(m + ae)
    const dpm = dpOf(s.p)
    return q({
      prompt: `${s.what} ${Um(m, s.p, s.unit)}, ${s.how}. ${ask === 'ae' ? 'What is the absolute error of this measurement?' : ask === 'lower' ? 'What is the smallest value the actual measurement could be (the lower limit)?' : 'What is the largest value the actual measurement could be (the upper limit)?'}`,
      answer: numA(val),
      suffix: s.unit,
      hint: 'Absolute error = ½ × precision. The actual value lies between measurement − absolute error and measurement + absolute error.',
      steps: [`Precision = ${num(s.p)} ${s.unit}, so absolute error = ${num(ae)} ${s.unit}`, ask === 'ae' ? `Absolute error = ${num(ae)} ${s.unit}` : `Limits: ${num(m, dpm)} − ${num(ae)} = ${num(clean(m - ae))} and ${num(m, dpm)} + ${num(ae)} = ${num(clean(m + ae))} ${s.unit}`],
      meta: { t: 'mea', kind: 'stated', ask, m, p: s.p },
    })
  }
  if (chance()) {
    const p = pick([1, 0.1, 10, 0.5, 2])
    const m = p >= 1 ? int(5, 60) * p : clean(int(20, 300) * p)
    const lo = clean(m - p / 2)
    const hi = clean(m + p / 2)
    const unit = pick(['cm', 'm', 'g', 'kg', 'mL'])
    const ask = pick(['precision', 'measurement'] as const)
    return q({
      prompt: `A measurement is given as lying between ${U(lo, unit)} and ${U(hi, unit)}. ${ask === 'precision' ? 'What is the precision of the measuring instrument?' : 'What measurement was read from the instrument?'}`,
      answer: numA(ask === 'precision' ? p : m),
      suffix: unit,
      hint: 'The two limits are one absolute error either side of the measurement, so they are one precision apart.',
      steps: [`The limits are ${num(hi)} − ${num(lo)} = ${num(p)} ${unit} apart: that is the precision.`, `The measurement is halfway: (${num(lo)} + ${num(hi)}) ÷ 2 = ${num(m)} ${unit}`],
      meta: { t: 'mea', kind: 'limits', ask },
    })
  }
  const pair = pick([
    ['44 L', '44.0 L'],
    ['3.5 m', '3.50 m'],
    ['12 kg', '12.0 kg'],
    ['0.8 s', '0.80 s'],
    ['250 g (to the nearest 10 g)', '250 g (to the nearest g)'],
  ])
  const opts = [pair[0], pair[1], 'They are equally precise']
  return q({
    prompt: `Which measurement is more precise: ${pair[0]} or ${pair[1]}?`,
    answer: mcA(pair[1], opts.filter((o) => o !== pair[1])),
    hint: 'The more precise measurement is given to a smaller unit (more decimal places, or a smaller “nearest”).',
    steps: [`${pair[1]} is measured to a smaller unit, so it has a smaller absolute error and is more precise.`],
    meta: { t: 'mea', kind: 'morePrecise' },
  })
}

// ================================================================= 10.03 Percentage error

const PE_CTX: { what: string; unit: string; p: number; gen: () => number; say: string }[] = [
  { what: 'A super yacht is', unit: 'm', p: 1, gen: () => int(18, 60), say: 'long, to the nearest metre' },
  { what: 'A bridge spans', unit: 'm', p: 1, gen: () => int(280, 900), say: 'to the nearest metre' },
  { what: 'A non-stop flight covers', unit: 'km', p: 1, gen: () => int(9000, 15000), say: 'to the nearest kilometre' },
  { what: 'A car has a mass of', unit: 'kg', p: 100, gen: () => int(10, 25) * 100, say: 'to the nearest 100 kg' },
  { what: 'A tower is', unit: 'm', p: 0.1, gen: () => int(1800, 3400) / 10, say: 'tall, to the nearest 0.1 m' },
  { what: 'A cricket pitch is', unit: 'm', p: 0.01, gen: () => int(2005, 2020) / 100, say: 'long, to the nearest 0.01 m' },
  { what: 'A swimming pool is', unit: 'm', p: 1, gen: () => pick([25, 50]), say: 'long, to the nearest metre' },
  { what: 'A baby has a mass of', unit: 'kg', p: 0.1, gen: () => int(28, 45) / 10, say: 'to the nearest 0.1 kg' },
]
/** the percentage error, rounded to dp places, must not sit right on a rounding boundary */
const safePct = (x: number, dp: number) => Math.abs(((x * 10 ** dp) % 1) - 0.5) > 0.02

function pctError(level: Level): Question {
  if (level === 1) {
    const items: [string, string, number][] = [
      [`${num(int(21, 99) / 10, 1)} g`, 'g', 0.1],
      [`${num(int(101, 199) / 10, 1)} mL`, 'mL', 0.1],
      [`${num(int(101, 999) / 100, 2)} m`, 'm', 0.01],
      [`${int(10, 99) * 10} cm (to the nearest 10 cm)`, 'cm', 10],
      [`${int(20, 90)} seconds (to the nearest second)`, 's', 1],
      [`${int(2, 9) * 100} g (to the nearest 100 g)`, 'g', 100],
      [`${int(1001, 4999)} mm (to the nearest mm)`, 'mm', 1],
    ]
    const [m, unit, p] = pick(items)
    return q({
      prompt: `What is the absolute error of the measurement <b>${m}</b>?`,
      answer: numA(clean(p / 2)),
      suffix: unit,
      hint: 'Find the precision: the place value of the last digit (or the “nearest” amount). Absolute error is half of it.',
      steps: [`Precision = ${num(p)} ${unit}`, `Absolute error = ${half} × ${num(p)} = ${num(clean(p / 2))} ${unit}`],
      meta: { t: 'mea', kind: 'ae', p },
    })
  }
  if (level === 2) {
    for (;;) {
      const c = pick(PE_CTX)
      const m = c.gen()
      const dp = c.p < 1 || m > 1000 ? 3 : 2
      const ae = c.p / 2
      const pe = (ae / m) * 100
      if (!safePct(pe, dp)) continue
      return q({
        prompt: `${c.what} ${Um(m, c.p, c.unit)} ${c.say}. Find the percentage error of this measurement, ${dpWords(dp)}.`,
        answer: numA(pe, dp),
        suffix: '%',
        hint: 'Percentage error = absolute error ÷ measurement × 100%.',
        steps: [`Absolute error = ${half} × ${num(c.p)} = ${num(clean(ae))} ${c.unit}`, `Percentage error = ${num(clean(ae))} ÷ ${num(m)} × 100% ${approx(pe, dp)}%`],
        calc: true,
        meta: { t: 'mea', kind: 'pe', m, p: c.p },
      })
    }
  }
  for (;;) {
    const [a, b] = [pick(PE_CTX), pick(PE_CTX)]
    if (a === b) continue
    const ma = a.gen()
    const mb = b.gen()
    const pa = (a.p / 2 / ma) * 100
    const pb = (b.p / 2 / mb) * 100
    if (Math.abs(pa - pb) / Math.max(pa, pb) < 0.1) continue
    const da = `${a.what.replace(/^A /, 'the ').replace(/ (is|spans|covers|has a mass of)$/, '')}`
    const db = `${b.what.replace(/^A /, 'the ').replace(/ (is|spans|covers|has a mass of)$/, '')}`
    const opts = [`the measurement of ${da}`, `the measurement of ${db}`]
    return q({
      prompt: `${a.what} ${Um(ma, a.p, a.unit)} ${a.say}. ${b.what} ${Um(mb, b.p, b.unit)} ${b.say}. Which measurement is more accurate (has the smaller percentage error)?`,
      answer: mcFixedA(opts, pa < pb ? opts[0] : opts[1]),
      hint: 'Work out each percentage error. The smaller one is more accurate.',
      steps: [`${da}: ${num(clean(a.p / 2))} ÷ ${num(ma)} × 100% ${approx(pa, 4)}%`, `${db}: ${num(clean(b.p / 2))} ÷ ${num(mb)} × 100% ${approx(pb, 4)}%`, `The ${pa < pb ? da : db} has the smaller percentage error, so it is more accurate.`],
      calc: true,
      meta: { t: 'mea', kind: 'compare', a: [ma, a.p], b: [mb, b.p] },
    })
  }
}

// ================================================================= 10.04 Perimeters and areas of composite shapes

function composite(level: Level): Question {
  const u = pick(['m', 'cm'])
  if (level === 1) {
    let W: number, H: number, w: number, h: number
    do {
      W = int(8, 30)
      H = int(6, 24)
      w = int(2, W - 2)
      h = int(2, H - 2)
    } while (w / W < 0.3 || w / W > 0.7 || h / H < 0.3 || h / H > 0.7)
    const askA = chance()
    const diagram = D.lShape(W, H, w, h, { W: U(W, u), H: U(H, u), a: U(W - w, u), b: U(H - h, u) })
    return q({
      prompt: `<p>Find the ${askA ? 'area' : 'perimeter'} of this shape.</p>`,
      diagram,
      answer: numA(askA ? W * H - w * h : 2 * (W + H)),
      suffix: askA ? `${u}²` : u,
      hint: askA ? 'Split the shape into two rectangles, or find the big rectangle and subtract the missing corner.' : 'Find the two unlabelled sides first. The perimeter is the distance all the way around.',
      steps: askA
        ? [`Missing corner: ${W} − ${W - w} = ${w} by ${H} − ${H - h} = ${h}`, `Area = ${W} × ${H} − ${w} × ${h} = ${W * H - w * h} ${u}²`]
        : [`Unlabelled sides: ${W} − ${W - w} = ${w} and ${H} − ${H - h} = ${h}`, `Perimeter = ${W} + ${H - h} + ${w} + ${h} + ${W - w} + ${H} = ${2 * (W + H)} ${u}`],
      meta: { t: 'mea', kind: 'lshape', askA },
    })
  }
  if (level === 2) {
    if (chance()) {
      // a rectangle with a right-angled triangle on top: the slant side from Pythagoras
      const [x, d, c] = pick([
        [15, 20, 25],
        [9, 12, 15],
        [12, 16, 20],
        [6, 8, 10],
        [8, 6, 10],
        [12, 5, 13],
        [8, 15, 17],
        [16, 12, 20],
        [24, 7, 25],
      ])
      const H1 = int(Math.max(4, Math.ceil(x / 2)), x + 8)
      const H2 = H1 + d
      const askA = chance()
      const diagram = fig({
        pts: { A: [0, 0], B: [x, 0], C: [x, H2], Dd: [0, H1] },
        polys: [{ v: ['A', 'B', 'C', 'Dd'] }],
        rights: [
          ['Dd', 'A', 'B'],
          ['A', 'B', 'C'],
        ],
        sides: [
          { a: 'A', b: 'B', text: U(x, u) },
          { a: 'B', b: 'C', text: U(H2, u) },
          { a: 'Dd', b: 'A', text: U(H1, u) },
        ],
        label: 'Composite shape',
      })
      const area = x * H1 + (x * d) / 2
      return q({
        prompt: `<p>Find the ${askA ? 'area' : 'perimeter'} of this shape.</p>`,
        diagram,
        answer: numA(askA ? area : x + H2 + c + H1),
        suffix: askA ? `${u}²` : u,
        calc: true,
        hint: askA ? 'Split it into a rectangle and a right-angled triangle.' : 'The sloping side is the hypotenuse of a right-angled triangle: use Pythagoras’ theorem.',
        steps: askA
          ? [`Rectangle: ${x} × ${H1} = ${x * H1}`, `Triangle: ${half} × ${x} × (${H2} − ${H1}) = ${half} × ${x} × ${d} = ${num((x * d) / 2)}`, `Area = ${num(area)} ${u}²`]
          : [`Triangle legs: ${x} and ${H2} − ${H1} = ${d}`, `Sloping side = √(${x}² + ${d}²) = √${x * x + d * d} = ${c}`, `Perimeter = ${x} + ${H2} + ${c} + ${H1} = ${x + H2 + c + H1} ${u}`],
        meta: { t: 'mea', kind: 'slant', askA },
      })
    }
    // a frame: a rectangle with a rectangular hole
    let A: number, B: number, a: number, b: number
    do {
      A = int(8, 30)
      B = int(6, 22)
      a = int(3, A - 4)
      b = int(3, B - 4)
      // the hole must be big enough on screen (about 110 × 60 px) to hold both of its labels
    } while (A - a < 0.3 * A || B - b < 0.3 * B || a < 0.3 * A || b < 0.3 * B || a * Math.min(240 / A, 170 / B) < 110 || b * Math.min(240 / A, 170 / B) < 60)
    const ox = (A - a) / 2
    const oy = (B - b) / 2
    const diagram = fig({
      pts: { P: [0, 0], Q: [A, 0], R: [A, B], S: [0, B], p: [ox, oy], q2: [ox + a, oy], r: [ox + a, oy + b], s: [ox, oy + b] },
      polys: [{ v: ['P', 'Q', 'R', 'S'] }, { v: ['p', 'q2', 'r', 's'], cls: 'sh sh-bg' }],
      sides: [
        { a: 'P', b: 'Q', text: U(A, u) },
        { a: 'S', b: 'P', text: U(B, u) },
        // inside the hole, so they never sit on the outer edge
        { a: 's', b: 'r', text: U(a, u), away: 'S' },
        { a: 'q2', b: 'r', text: U(b, u), away: 'Q' },
      ],
      label: 'Shaded frame',
    })
    return q({
      prompt: '<p>Find the area of the shaded region.</p>',
      diagram,
      answer: numA(A * B - a * b),
      suffix: `${u}²`,
      hint: 'Shaded area = area of the outer rectangle − area of the hole.',
      steps: [`Outer rectangle: ${A} × ${B} = ${A * B}`, `Hole: ${a} × ${b} = ${a * b}`, `Shaded area = ${A * B} − ${a * b} = ${A * B - a * b} ${u}²`],
      meta: { t: 'mea', kind: 'frame' },
    })
  }
  if (chance(0.35)) {
    const ha = int(31, 199) / 10
    const m2 = Math.round(ha * 10) * 1000
    // lengths that give a width with at most one decimal place
    const lengths = [100, 200, 250, 400, 500].filter((l) => Number.isInteger((m2 * 10) / l))
    const len = pick(lengths)
    const wid = clean(m2 / len)
    return q({
      prompt: `A rectangular property has an area of ${num(ha)} hectares and a length of ${len} m. How wide is it? (1 ha = 10 000 m²)`,
      answer: numA(wid),
      suffix: 'm',
      hint: 'Change the area to square metres first, then divide by the length.',
      steps: [`${num(ha)} ha = ${num(ha)} × 10 000 = ${num(m2)} m²`, `Width = ${num(m2)} ÷ ${len} = ${num(wid)} m`],
      calc: true,
      meta: { t: 'mea', kind: 'ha' },
    })
  }
  let W: number, H: number, w: number, h: number
  do {
    W = int(10, 30) * 100
    H = int(8, 24) * 100
    w = int(3, W / 100 - 3) * 100
    h = int(3, H / 100 - 3) * 100
  } while (w / W < 0.3 || w / W > 0.7 || h / H < 0.3 || h / H > 0.7)
  const area = W * H - w * h
  const toHa = chance()
  return q({
    prompt: `<p>This is the plan of a farm (all lengths in metres). Find its area in ${toHa ? 'hectares (1 ha = 10 000 m²)' : 'square kilometres (1 km² = 1 000 000 m²)'}.</p>`,
    diagram: D.lShape(W, H, w, h, { W: num(W), H: num(H), a: num(W - w), b: num(H - h) }),
    answer: numA(clean(toHa ? area / 10000 : area / 1e6)),
    suffix: toHa ? 'ha' : 'km²',
    calc: true,
    hint: 'Find the area in m² first (two rectangles), then convert.',
    steps: [`Area = ${num(W)} × ${num(H)} − ${num(w)} × ${num(h)} = ${num(area)} m²`, toHa ? `${num(area)} ÷ 10 000 = ${num(clean(area / 10000))} ha` : `${num(area)} ÷ 1 000 000 = ${num(clean(area / 1e6))} km²`],
    meta: { t: 'mea', kind: 'farm', toHa },
  })
}

// ================================================================= 10.05 Areas of quadrilaterals

type QK = 'parallelogram' | 'trapezium' | 'rhombus' | 'kite'
function quadDiagram(k: QK, v: number[], labels: string[]): string {
  if (k === 'parallelogram') return D.parallelogram(v[0], v[1], labels[0], labels[1], labels[2] ?? '')
  if (k === 'trapezium') return D.trapezium(v[0], v[1], v[2], labels[0], labels[1], labels[2])
  return D.diagonalsShape(v[0], v[1], labels[0], labels[1], k === 'kite')
}
const quadArea = (k: QK, v: number[]) => (k === 'parallelogram' ? v[0] * v[1] : k === 'trapezium' ? ((v[0] + v[1]) * v[2]) / 2 : (v[0] * v[1]) / 2)
const FORMULA: Record<QK, string> = { parallelogram: 'A = bh', trapezium: 'A = ½(a + b)h', rhombus: 'A = ½xy (x and y are the diagonals)', kite: 'A = ½xy (x and y are the diagonals)' }

function quads(level: Level): Question {
  const k = pick(['parallelogram', 'trapezium', 'rhombus', 'kite'] as QK[])
  const u = pick(['cm', 'm', 'mm'])
  const g = (dec: boolean) => (dec ? int(21, 199) / 10 : int(4, 30))
  if (level <= 2) {
    const dec = level === 2 && chance(0.6)
    let v: number[]
    if (k === 'parallelogram') {
      do v = [g(dec), g(dec)]
      while (v[1] > v[0] * 1.3 || v[1] < v[0] * 0.3)
    } else if (k === 'trapezium') {
      do v = [g(dec), g(dec), g(dec)]
      while (v[0] >= v[1] * 0.85 || v[0] < v[1] * 0.3 || v[2] > v[1] || v[2] < v[1] * 0.3)
    } else {
      do v = [g(dec), g(dec)]
      while (v[1] > v[0] * 1.6 || v[1] < v[0] * 0.5)
    }
    const slant = k === 'parallelogram' && level === 2 && !dec ? Math.round(Math.hypot(0.35 * v[0], v[1]) * 10) / 10 : 0
    const labels = k === 'trapezium' ? [U(v[0], u), U(v[1], u), U(v[2], u)] : k === 'parallelogram' ? [U(v[0], u), U(v[1], u), ...(slant ? [U(slant, u)] : [])] : [U(v[0], u), U(v[1], u)]
    const area = clean(quadArea(k, v))
    const work = k === 'parallelogram' ? `${num(v[0])} × ${num(v[1])}` : k === 'trapezium' ? `${half} × (${num(v[0])} + ${num(v[1])}) × ${num(v[2])}` : `${half} × ${num(v[0])} × ${num(v[1])}`
    return q({
      prompt: `<p>Find the area of this ${k}.</p>`,
      diagram: quadDiagram(k, v, labels),
      answer: numA(area),
      suffix: `${u}²`,
      calc: level === 2,
      hint: `${FORMULA[k]}${slant ? '. Use the perpendicular height, not the sloping side.' : ''}`,
      steps: [`${FORMULA[k]}`, `A = ${work} = ${num(area)} ${u}²`],
      meta: { t: 'mea', kind: 'quad', q: k, v, slant },
    })
  }
  // find a missing length from the area
  for (;;) {
    const v = k === 'trapezium' ? [int(4, 20), int(8, 30), int(3, 20)] : [int(4, 30), int(4, 30)]
    if (k === 'trapezium' && (v[0] >= v[1] * 0.85 || v[2] > v[1] || v[2] < v[1] * 0.3 || ((v[0] + v[1]) * v[2]) % 2)) continue
    if (k === 'parallelogram' && (v[1] > v[0] * 1.3 || v[1] < v[0] * 0.3)) continue
    if ((k === 'rhombus' || k === 'kite') && (v[1] > v[0] * 1.6 || v[1] < v[0] * 0.5 || (v[0] * v[1]) % 2)) continue
    const area = quadArea(k, v)
    const miss = k === 'trapezium' ? 2 : 1
    const labels = v.map((x, i) => (i === miss ? (k === 'trapezium' || k === 'parallelogram' ? 'h' : 'y') : U(x, u)))
    const letter = labels[miss]
    const work =
      k === 'parallelogram'
        ? [`${num(area)} = ${v[0]} × h`, `h = ${num(area)} ÷ ${v[0]} = ${v[1]}`]
        : k === 'trapezium'
          ? [`${num(area)} = ${half} × (${v[0]} + ${v[1]}) × h = ${num((v[0] + v[1]) / 2)} × h`, `h = ${num(area)} ÷ ${num((v[0] + v[1]) / 2)} = ${v[2]}`]
          : [`${num(area)} = ${half} × ${v[0]} × y`, `y = ${num(area)} × 2 ÷ ${v[0]} = ${v[1]}`]
    return q({
      prompt: `<p>The area of this ${k} is ${U(area, `${u}²`)}. Find the value of <i>${letter}</i>.</p>`,
      diagram: quadDiagram(k, v, labels),
      answer: numA(v[miss]),
      prefix: `${letter} =`,
      suffix: u,
      calc: true,
      hint: `Write the area formula (${FORMULA[k]}), put in what you know, then solve for ${letter}.`,
      steps: work,
      meta: { t: 'mea', kind: 'quadMissing', q: k, v, area },
    })
  }
}

// ================================================================= 10.06 Circumferences and areas of circular shapes

function circles(level: Level): Question {
  const u = pick(['cm', 'm', 'mm'])
  if (level === 1) {
    const useD = chance()
    const r = pick([int(2, 30), int(21, 199) / 10])
    const shown = useD ? clean(2 * r) : r
    const askC = chance()
    const val = askC ? 2 * PI * r : PI * r * r
    return q({
      prompt: `<p>Find the ${askC ? 'circumference' : 'area'} of this circle, ${dpWords(2)}.</p>`,
      diagram: D.circleShape(U(shown, u), useD ? 'diameter' : 'radius'),
      answer: numA(val, 2),
      suffix: askC ? u : `${u}²`,
      calc: true,
      hint: askC ? 'C = πd = 2πr' : `A = πr². ${useD ? 'Halve the diameter to get the radius first.' : ''}`,
      steps: askC
        ? [useD ? `C = π × ${num(shown)}` : `C = 2 × π × ${num(r)}`, `C ${approx(val, 2)} ${u}`]
        : [useD ? `r = ${num(shown)} ÷ 2 = ${num(r)}` : `r = ${num(r)}`, `A = π × ${num(r)}² ${approx(val, 2)} ${u}²`],
      meta: { t: 'mea', kind: 'circle', askC, useD, r },
    })
  }
  if (level === 2) {
    const deg = pick([90, 90, 180, 180, 60, 120, 45, 150, 240, 270, 300, 30, 135, 210, 72])
    const r = pick([int(3, 25), int(21, 99) / 10])
    const ask = pick(['area', 'perimeter', 'arc'] as const)
    const frac = deg / 360
    const arc = frac * 2 * PI * r
    const val = ask === 'area' ? frac * PI * r * r : ask === 'arc' ? arc : arc + 2 * r
    const shapeName = deg === 90 ? 'quadrant' : deg === 180 ? 'semicircle' : 'sector'
    const fr = deg === 90 ? '¼' : deg === 180 ? '½' : `${deg}/360`
    return q({
      prompt: `<p>Find the ${ask === 'arc' ? 'arc length' : ask} of this ${shapeName}, ${dpWords(1)}.</p>`,
      diagram: sector(deg, U(r, u)),
      answer: numA(val, 1),
      suffix: ask === 'area' ? `${u}²` : u,
      calc: true,
      hint: `A ${shapeName} is ${deg}/360 of a circle. ${ask === 'perimeter' ? 'Perimeter = arc length + 2 radii.' : ask === 'arc' ? 'Arc length = (θ/360) × 2πr.' : 'Area = (θ/360) × πr².'}`,
      steps:
        ask === 'area'
          ? [`Area = ${fr} × π × ${num(r)}² ${approx(val, 1)} ${u}²`]
          : [`Arc length = ${fr} × 2 × π × ${num(r)} ${approx(arc, 3)}`, ask === 'perimeter' ? `Perimeter = arc + ${num(r)} + ${num(r)} ${approx(val, 1)} ${u}` : `Arc length ${approx(val, 1)} ${u}`],
      meta: { t: 'mea', kind: 'sector', deg, r, ask },
    })
  }
  const kind = pick(['quadComp', 'semiComp', 'annulus', 'wheel', 'pond'] as const)
  if (kind === 'quadComp') {
    const r = int(4, 12)
    const total = r + int(Math.ceil(r * 0.6), r * 2)
    const a = total - r
    const askA = chance()
    const val = askA ? a * r + (PI * r * r) / 4 : total + (PI * r) / 2 + a + r
    return q({
      prompt: `<p>This shape is a rectangle with a quadrant on one end. Find its ${askA ? 'area' : 'perimeter'}, ${dpWords(1)}.</p>`,
      diagram: rectQuadrant(total, r, U(total, u), U(r, u)),
      answer: numA(val, 1),
      suffix: askA ? `${u}²` : u,
      calc: true,
      hint: `The quadrant’s radius is ${U(r, u)}, so the rectangle is ${total} − ${r} = ${a} ${u} long.`,
      steps: askA
        ? [`Rectangle: ${a} × ${r} = ${a * r}`, `Quadrant: ¼ × π × ${r}² ${approx((PI * r * r) / 4, 3)}`, `Area ${approx(val, 1)} ${u}²`]
        : [`Curved edge: ¼ × 2 × π × ${r} ${approx((PI * r) / 2, 3)}`, `Perimeter = ${total} + ${a} + ${r} + curved edge ${approx(val, 1)} ${u}`],
      meta: { t: 'mea', kind, total, r, askA },
    })
  }
  if (kind === 'semiComp') {
    const h = int(4, 16)
    const w = int(Math.ceil(h * 0.8), h * 2)
    const askA = chance()
    const val = askA ? w * h + (PI * (h / 2) ** 2) / 2 : 2 * w + h + (PI * h) / 2
    return q({
      prompt: `<p>This shape is a rectangle with a semicircle on one end. Find its ${askA ? 'area' : 'perimeter'}, ${dpWords(1)}.</p>`,
      diagram: D.rectSemi(w, h, U(w, u), U(h, u)),
      answer: numA(val, 1),
      suffix: askA ? `${u}²` : u,
      calc: true,
      hint: `The semicircle’s diameter is the end of the rectangle, ${U(h, u)}.`,
      steps: askA
        ? [`Rectangle: ${w} × ${h} = ${w * h}`, `Semicircle: ½ × π × ${num(h / 2)}² ${approx((PI * (h / 2) ** 2) / 2, 3)}`, `Area ${approx(val, 1)} ${u}²`]
        : [`Curved edge: ½ × π × ${h} ${approx((PI * h) / 2, 3)}`, `Perimeter = ${w} + ${w} + ${h} + curved edge ${approx(val, 1)} ${u}`],
      meta: { t: 'mea', kind, w, h, askA },
    })
  }
  if (kind === 'annulus') {
    const R = int(6, 30)
    const r = int(Math.ceil(R * 0.35), R - 2)
    const val = PI * (R * R - r * r)
    return q({
      prompt: `<p>Find the area of this ring (annulus), ${dpWords(1)}.</p>`,
      diagram: D.annulus(R, r, U(R, u), U(r, u)),
      answer: numA(val, 1),
      suffix: `${u}²`,
      calc: true,
      hint: 'Area = area of the large circle − area of the small circle.',
      steps: [`π × ${R}² − π × ${r}² = π × ${R * R - r * r} ${approx(val, 1)} ${u}²`],
      meta: { t: 'mea', kind, R, r },
    })
  }
  if (kind === 'wheel') {
    const d = pick([56, 60, 62, 66, 70, 71])
    const km = pick([1, 2, 3, 5])
    const turns = (km * 100000) / (PI * d)
    return q({
      prompt: `A bicycle wheel has a diameter of ${d} cm. How many complete turns must the wheel make to travel at least ${km} km?`,
      answer: numA(Math.ceil(turns)),
      calc: true,
      hint: 'One turn moves the bicycle one circumference. Change the distance to centimetres and divide.',
      steps: [`One turn = π × ${d} ${approx(PI * d, 2)} cm`, `${km} km = ${num(km * 100000)} cm`, `${num(km * 100000)} ÷ ${num(round(PI * d, 4))} ${approx(turns, 1)}, so ${Math.ceil(turns)} complete turns are needed.`],
      meta: { t: 'mea', kind, d, km },
    })
  }
  const dd = pick([6, 8, 10, 12, 14])
  const w = pick([1, 1.5, 2])
  const R = dd / 2 + w
  const val = PI * (R * R - (dd / 2) ** 2)
  return q({
    prompt: `A circular pond with a diameter of ${dd} m is surrounded by a path ${num(w)} m wide. Find the area of the path, ${dpWords(2)}.`,
    answer: numA(val, 2),
    suffix: 'm²',
    calc: true,
    hint: 'The path is a ring: the outer radius is the pond’s radius plus the width of the path.',
    steps: [`Pond radius = ${num(dd / 2)} m, outer radius = ${num(dd / 2)} + ${num(w)} = ${num(R)} m`, `Area = π × ${num(R)}² − π × ${num(dd / 2)}² ${approx(val, 2)} m²`],
    meta: { t: 'mea', kind, dd, w },
  })
}

// ================================================================= 10.07 Surface area of a prism

const TRIPLES: [number, number, number][] = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [9, 12, 15],
  [8, 15, 17],
  [12, 16, 20],
  [7, 24, 25],
  [15, 20, 25],
]

function saPrism(level: Level): Question {
  const u = pick(['cm', 'm'])
  if (level === 1) {
    if (chance(0.35)) {
      const s = pick([int(2, 20), int(11, 99) / 10])
      const sa = clean(6 * s * s)
      return q({
        prompt: `<p>Find the surface area of this cube.</p>`,
        diagram: D.rectPrism(s, s, s, U(s, u), '', ''),
        answer: numA(sa),
        suffix: `${u}²`,
        calc: true,
        hint: 'A cube has 6 identical square faces.',
        steps: [`SA = 6 × ${num(s)}² = ${num(sa)} ${u}²`],
        meta: { t: 'mea', kind: 'cube', s },
      })
    }
    const [l, w, h] = [int(3, 20), int(2, 14), int(2, 14)]
    const sa = 2 * (l * w + l * h + w * h)
    return q({
      prompt: `<p>Find the surface area of this rectangular prism.</p>`,
      diagram: D.rectPrism(l, w, h, U(l, u), U(w, u), U(h, u)),
      answer: numA(sa),
      suffix: `${u}²`,
      hint: 'Opposite faces are the same: SA = 2 × (top) + 2 × (front) + 2 × (side).',
      steps: [`Top and bottom: 2 × ${l} × ${w} = ${2 * l * w}`, `Front and back: 2 × ${l} × ${h} = ${2 * l * h}`, `Sides: 2 × ${w} × ${h} = ${2 * w * h}`, `SA = ${sa} ${u}²`],
      meta: { t: 'mea', kind: 'box', l, w, h },
    })
  }
  if (level === 2) {
    if (chance()) {
      const [l, w, h] = [int(3, 20), int(2, 14), int(2, 14)]
      const sa = l * w + 2 * l * h + 2 * w * h
      return q({
        prompt: `<p>This rectangular box has no top. Find its outside surface area.</p>`,
        diagram: D.rectPrism(l, w, h, U(l, u), U(w, u), U(h, u)),
        answer: numA(sa),
        suffix: `${u}²`,
        hint: 'An open box has 5 faces: the base and 4 sides.',
        steps: [`Base: ${l} × ${w} = ${l * w}`, `Front and back: 2 × ${l} × ${h} = ${2 * l * h}`, `Sides: 2 × ${w} × ${h} = ${2 * w * h}`, `SA = ${sa} ${u}²`],
        meta: { t: 'mea', kind: 'openBox', l, w, h },
      })
    }
    const [a, b, c] = pick(TRIPLES)
    const l = int(Math.max(4, Math.ceil(c * 0.6)), c * 2)
    const showHyp = chance(0.6)
    const sa = a * b + (a + b + c) * l
    return q({
      prompt: `<p>Find the surface area of this triangular prism.${showHyp ? '' : ' (Use Pythagoras’ theorem to find the sloping edge.)'}</p>`,
      diagram: D.triPrism(a, b, l, U(a, u), U(b, u), U(l, u), showHyp ? U(c, u) : ''),
      answer: numA(sa),
      suffix: `${u}²`,
      calc: !showHyp,
      hint: 'Two triangular ends plus three rectangles. Each rectangle is one side of the triangle × the length of the prism.',
      steps: [...(showHyp ? [] : [`Sloping edge = √(${a}² + ${b}²) = ${c}`]), `Two triangles: 2 × ${half} × ${a} × ${b} = ${a * b}`, `Rectangles: (${a} + ${b} + ${c}) × ${l} = ${(a + b + c) * l}`, `SA = ${sa} ${u}²`],
      meta: { t: 'mea', kind: 'triPrism', a, b, c, l },
    })
  }
  const kind = pick(['trap', 'tent', 'cubeFromSA'] as const)
  if (kind === 'trap') {
    const [k, h, s] = pick(TRIPLES.filter(([x, y]) => x <= 12 && y <= 16))
    const a = int(Math.max(3, k), 3 * k)
    const b = a + 2 * k
    const l = int(Math.ceil(b * 0.5), Math.ceil(b * 1.5))
    const sa = (a + b) * h + (a + b + 2 * s) * l
    return q({
      prompt: '<p>Find the surface area of this trapezoidal prism.</p>',
      diagram: trapPrism(a, b, h, l, { a: U(a, u), b: U(b, u), h: U(h, u), l: U(l, u), s: U(s, u) }),
      answer: numA(sa),
      suffix: `${u}²`,
      calc: true,
      hint: 'Two trapezium ends, A = ½(a + b)h each, plus four rectangles (the four sides of the trapezium × the length).',
      steps: [`Two trapeziums: 2 × ${half} × (${a} + ${b}) × ${h} = ${(a + b) * h}`, `Rectangles: (${a} + ${b} + ${s} + ${s}) × ${l} = ${(a + b + 2 * s) * l}`, `SA = ${sa} ${u}²`],
      meta: { t: 'mea', kind, a, b, h, s, l },
    })
  }
  if (kind === 'tent') {
    // half the base, the height and the sloping edge (metres) form a Pythagorean triple
    const [hb, h, s] = pick([
      [1.2, 1.6, 2],
      [0.9, 1.2, 1.5],
      [1.5, 2, 2.5],
      [0.6, 0.8, 1],
      [0.5, 1.2, 1.3],
      [0.8, 1.5, 1.7],
    ])
    const b = clean(2 * hb)
    const l = int(18, 40) / 10
    const sa = clean(b * h + 2 * s * l + b * l)
    return q({
      prompt: `<p>${name()} made this tent from canvas, including the floor. Find the area of canvas used. (Use Pythagoras’ theorem to find the sloping edge.)</p>`,
      diagram: tentPrism(b, h, l, { b: U(b, 'm'), h: U(h, 'm'), l: U(l, 'm') }),
      answer: numA(sa),
      suffix: 'm²',
      calc: true,
      hint: 'Two triangular ends, two sloping rectangles and the floor. The sloping edge is the hypotenuse of a triangle with legs half the base and the height.',
      steps: [`Sloping edge = √(${num(hb)}² + ${num(h)}²) = ${num(s)}`, `Ends: 2 × ${half} × ${num(b)} × ${num(h)} = ${num(clean(b * h))}`, `Sloping sides: 2 × ${num(s)} × ${num(l)} = ${num(clean(2 * s * l))}`, `Floor: ${num(b)} × ${num(l)} = ${num(clean(b * l))}`, `SA = ${num(sa)} m²`],
      meta: { t: 'mea', kind, b, h, s, l },
    })
  }
  let sa: number
  do sa = int(50, 1500)
  while (!safePct(Math.sqrt(sa / 6), 1))
  const side = Math.sqrt(sa / 6)
  return q({
    prompt: `A cube has a surface area of ${U(sa, `${u}²`)}. Find the length of one edge, ${dpWords(1)}.`,
    answer: numA(side, 1),
    suffix: u,
    calc: true,
    hint: 'SA = 6s², so s² = SA ÷ 6, then take the square root.',
    steps: [`s² = ${sa} ÷ 6 ${approx(sa / 6, 3)}`, `s = √(${num(round(sa / 6, 3))}) ${approx(side, 1)} ${u}`],
    meta: { t: 'mea', kind, sa },
  })
}

// ================================================================= 10.08 Surface area of a cylinder

/** a cylinder drawn to scale when its height-to-diameter ratio allows; otherwise the page says so */
function cylDiagram(r: number, h: number, rl: string, hl: string, showD: boolean): { diagram: string; note?: string } {
  const ratio = h / (2 * r)
  return { diagram: D.cylinder(r, h, rl, hl, showD), note: ratio < 0.5 || ratio > 1.21 ? NOT_TO_SCALE : undefined }
}

function saCyl(level: Level): Question {
  const u = pick(['cm', 'm'])
  const r = pick([int(2, 20), int(11, 99) / 10])
  const h = pick([int(3, 30), int(11, 99) / 10])
  const useD = chance()
  const shown = useD ? clean(2 * r) : r
  const dp = pick([1, 2])
  const cd = cylDiagram(r, h, U(shown, u), U(h, u), useD)
  if (level === 1) {
    const sa = 2 * PI * r * r + 2 * PI * r * h
    return q({
      prompt: `<p>Find the surface area of this closed cylinder, ${dpWords(dp)}.</p>`,
      ...cd,
      answer: numA(sa, dp),
      suffix: `${u}²`,
      calc: true,
      hint: `SA = 2πr² + 2πrh (two circles plus the curved surface).${useD ? ' Halve the diameter first.' : ''}`,
      steps: [`r = ${num(r)}`, `SA = 2 × π × ${num(r)}² + 2 × π × ${num(r)} × ${num(h)} ${approx(sa, dp)} ${u}²`],
      meta: { t: 'mea', kind: 'cylClosed', r, h },
    })
  }
  if (level === 2) {
    const kind = pick(['curved', 'openOne', 'openBoth'] as const)
    const sa = kind === 'openOne' ? PI * r * r + 2 * PI * r * h : 2 * PI * r * h
    const words = kind === 'curved' ? 'the curved surface area of this cylinder' : kind === 'openOne' ? 'the surface area of this cylinder, which is open at one end' : 'the surface area of this cylinder, which is open at both ends (a tube)'
    return q({
      prompt: `<p>Find ${words}, ${dpWords(dp)}.</p>`,
      ...cd,
      answer: numA(sa, dp),
      suffix: `${u}²`,
      calc: true,
      hint: kind === 'openOne' ? 'One circle plus the curved surface: πr² + 2πrh.' : 'Only the curved surface: 2πrh.',
      steps: [`r = ${num(r)}`, kind === 'openOne' ? `SA = π × ${num(r)}² + 2 × π × ${num(r)} × ${num(h)} ${approx(sa, dp)} ${u}²` : `SA = 2 × π × ${num(r)} × ${num(h)} ${approx(sa, dp)} ${u}²`],
      meta: { t: 'mea', kind: 'cyl' + kind, r, h },
    })
  }
  if (chance()) {
    const rr = int(2, 8)
    const l = int(rr * 2, rr * 5)
    const closed = chance()
    const sa = PI * rr * rr + PI * rr * l + (closed ? 2 * rr * l : 0)
    return q({
      prompt: closed
        ? `<p>Find the surface area of this closed half-cylinder (including its flat base), ${dpWords(1)}.</p>`
        : `<p>A greenhouse is shaped like this half-cylinder. Its curved roof and its two ends are covered in plastic (there is no floor). Find the area of plastic, ${dpWords(1)}.</p>`,
      diagram: halfCylinder(rr, l, { r: U(rr, 'm'), l: U(l, 'm') }),
      answer: numA(sa, 1),
      suffix: 'm²',
      calc: true,
      hint: `Two semicircles (together one circle, πr²) + half of the curved surface (πrh)${closed ? ' + the flat rectangular base (2r × h)' : ''}.`,
      steps: [`Ends: π × ${rr}² ${approx(PI * rr * rr, 3)}`, `Curved surface: ½ × 2 × π × ${rr} × ${l} ${approx(PI * rr * l, 3)}`, ...(closed ? [`Base: ${2 * rr} × ${l} = ${2 * rr * l}`] : []), `SA ${approx(sa, 1)} m²`],
      meta: { t: 'mea', kind: 'halfCyl', r: rr, l, closed },
    })
  }
  const d = pick([4, 5, 6, 7, 8])
  const depth = pick([1.2, 1.5, 1.8, 2])
  const cover = pick([8, 9, 10, 12])
  const area = PI * (d / 2) ** 2 + PI * d * depth
  const litres = Math.ceil(round(area, 1) / cover)
  const askL = chance()
  return q({
    prompt: `A round swimming pool is ${num(depth)} m deep and ${d} m across. Its inside walls and floor are to be painted. ${askL ? `One litre of paint covers ${cover} m². How many whole litres of paint are needed? (Use the area correct to 1 decimal place.)` : `Find the area to be painted, ${dpWords(1)}.`}`,
    answer: numA(askL ? litres : area, askL ? undefined : 1),
    suffix: askL ? 'L' : 'm²',
    calc: true,
    hint: 'The floor is one circle; the wall is the curved surface of a cylinder. There is no top.',
    steps: [`Area = π × ${num(d / 2)}² + π × ${d} × ${num(depth)} ${approx(area, 1)} m²`, ...(askL ? [`${num(round(area, 1))} ÷ ${cover} ${approx(round(area, 1) / cover, 2)}, so ${litres} L are needed.`] : [])],
    meta: { t: 'mea', kind: 'pool', d, depth, cover, askL },
  })
}

// ================================================================= 10.09 Volumes of prisms and cylinders

function volume(level: Level): Question {
  const u = pick(['cm', 'm'])
  if (level === 1) {
    const kind = pick(['box', 'tri', 'cyl'] as const)
    if (kind === 'box') {
      const [l, w, h] = [int(3, 25), int(2, 15), int(2, 15)]
      return q({
        prompt: '<p>Find the volume of this rectangular prism.</p>',
        diagram: D.rectPrism(l, w, h, U(l, u), U(w, u), U(h, u)),
        answer: numA(l * w * h),
        suffix: `${u}³`,
        hint: 'V = lwh',
        steps: [`V = ${l} × ${w} × ${h} = ${l * w * h} ${u}³`],
        meta: { t: 'mea', kind: 'vbox', l, w, h },
      })
    }
    if (kind === 'tri') {
      const [a, b] = [int(3, 16), int(3, 16)]
      const l = int(4, 25)
      const v = (a * b * l) / 2
      return q({
        prompt: '<p>Find the volume of this triangular prism.</p>',
        diagram: D.triPrism(a, b, l, U(a, u), U(b, u), U(l, u)),
        answer: numA(v),
        suffix: `${u}³`,
        hint: 'V = Ah, where A is the area of the triangular end and h is the length of the prism.',
        steps: [`A = ${half} × ${a} × ${b} = ${num((a * b) / 2)}`, `V = ${num((a * b) / 2)} × ${l} = ${num(v)} ${u}³`],
        meta: { t: 'mea', kind: 'vtri', a, b, l },
      })
    }
    const r = pick([int(2, 15), int(11, 99) / 10])
    const h = int(3, 30)
    const v = PI * r * r * h
    const dp = pick([0, 1])
    return q({
      prompt: `<p>Find the volume of this cylinder, ${dpWords(dp)}.</p>`,
      ...cylDiagram(r, h, U(r, u), U(h, u), false),
      answer: numA(v, dp),
      suffix: `${u}³`,
      calc: true,
      hint: 'V = πr²h',
      steps: [`V = π × ${num(r)}² × ${h} ${approx(v, dp)} ${u}³`],
      meta: { t: 'mea', kind: 'vcyl', r, h },
    })
  }
  if (level === 2) {
    const kind = pick(['trap', 'tank', 'toM3'] as const)
    if (kind === 'trap') {
      let a: number, b: number, h: number
      do {
        a = int(3, 14)
        b = int(a + 2, 24)
        h = int(3, 14)
      } while ((b - a) % 2 || h > b)
      const l = int(4, 25)
      const v = ((a + b) * h * l) / 2
      return q({
        prompt: '<p>Find the volume of this trapezoidal prism.</p>',
        diagram: trapPrism(a, b, h, l, { a: U(a, u), b: U(b, u), h: U(h, u), l: U(l, u) }),
        answer: numA(v),
        suffix: `${u}³`,
        calc: true,
        hint: 'V = Ah: the area of the trapezium end, A = ½(a + b)h, times the length.',
        steps: [`A = ${half} × (${a} + ${b}) × ${h} = ${num(((a + b) * h) / 2)}`, `V = ${num(((a + b) * h) / 2)} × ${l} = ${num(v)} ${u}³`],
        meta: { t: 'mea', kind: 'vtrap', a, b, h, l },
      })
    }
    if (kind === 'tank') {
      const [l, w, h] = [int(30, 90), int(20, 45), int(20, 50)]
      const gap = int(2, 8)
      const litres = clean((l * w * (h - gap)) / 1000)
      return q({
        prompt: `A fish tank is ${l} cm long, ${w} cm wide and ${h} cm high. It is filled with water to ${gap} cm below the top. How many litres of water are in the tank? (1 L = 1000 cm³)`,
        answer: numA(litres),
        suffix: 'L',
        calc: true,
        hint: `The water is ${h} − ${gap} cm deep. Find its volume in cm³, then divide by 1000.`,
        steps: [`Water depth = ${h} − ${gap} = ${h - gap} cm`, `V = ${l} × ${w} × ${h - gap} = ${num(l * w * (h - gap))} cm³`, `${num(l * w * (h - gap))} ÷ 1000 = ${num(litres)} L`],
        meta: { t: 'mea', kind, l, w, h, gap },
      })
    }
    const [l, w, h] = [int(40, 150), int(30, 90), int(20, 90)]
    const m3 = clean((l * w * h) / 1e6)
    return q({
      prompt: `A storage box is ${l} cm long, ${w} cm wide and ${h} cm high. Find its volume in cubic metres. (1 m³ = 1 000 000 cm³)`,
      answer: numA(m3),
      suffix: 'm³',
      calc: true,
      hint: 'Find the volume in cm³, then divide by 1 000 000. (Or change each length to metres first.)',
      steps: [`V = ${l} × ${w} × ${h} = ${num(l * w * h)} cm³`, `${num(l * w * h)} ÷ 1 000 000 = ${num(m3)} m³`],
      meta: { t: 'mea', kind, l, w, h },
    })
  }
  const kind = pick(['missing', 'cubeRoot', 'cake', 'pipe', 'pool'] as const)
  if (kind === 'missing') {
    const [b, h] = [int(4, 20), int(3, 16)]
    const l = int(5, 30)
    const v = (b * h * l) / 2
    return q({
      prompt: `A triangular prism has a triangular end with base ${U(b, 'cm')} and height ${U(h, 'cm')}. Its volume is ${U(v, 'cm³')}. How long is the prism?`,
      answer: numA(l),
      suffix: 'cm',
      calc: true,
      hint: 'V = Ah, so h = V ÷ A, where A is the area of the triangle.',
      steps: [`A = ${half} × ${b} × ${h} = ${num((b * h) / 2)} cm²`, `Length = ${num(v)} ÷ ${num((b * h) / 2)} = ${l} cm`],
      meta: { t: 'mea', kind, b, h, v },
    })
  }
  if (kind === 'cubeRoot') {
    let v: number
    do v = int(200, 9000)
    while (Math.abs((Math.cbrt(v) % 1) - 0.5) < 0.03 || Number.isInteger(Math.cbrt(v)))
    return q({
      prompt: `A cube has a volume of ${U(v, 'mm³')}. Find the length of its edge, correct to the nearest millimetre.`,
      answer: numA(Math.cbrt(v), 0),
      suffix: 'mm',
      calc: true,
      hint: 'V = s³, so s = ∛V.',
      steps: [`s = ∛${v} ${approx(Math.cbrt(v), 3)} ≈ ${Math.round(Math.cbrt(v))} mm`],
      meta: { t: 'mea', kind, v },
    })
  }
  if (kind === 'cake') {
    const rs = pick([
      [20, 15, 10],
      [18, 13, 8],
      [24, 18, 12],
      [16, 12, 8],
    ])
    const t = pick([5, 6, 7, 8])
    const v = rs.reduce((s, r) => s + PI * r * r * t, 0)
    return q({
      prompt: `A cake has three round tiers, each ${t} cm high, with radii ${rs[0]} cm, ${rs[1]} cm and ${rs[2]} cm. Find the total volume of the cake, correct to the nearest cm³.`,
      answer: numA(v, 0),
      suffix: 'cm³',
      calc: true,
      hint: 'Each tier is a cylinder, V = πr²h. Add the three volumes.',
      steps: [`V = π × ${t} × (${rs.map((r) => `${r}²`).join(' + ')}) = π × ${t} × ${rs.reduce((s, r) => s + r * r, 0)} ${approx(v, 0)} cm³`],
      meta: { t: 'mea', kind, rs, tier: t },
    })
  }
  if (kind === 'pipe') {
    const din = pick([6, 7, 8, 8.5, 9, 10])
    const dout = din + pick([0.5, 1, 1.5, 2])
    const l = pick([30, 40, 48, 50, 60, 75])
    const v = PI * ((dout / 2) ** 2 - (din / 2) ** 2) * l
    return q({
      prompt: `A metal pipe ${l} cm long has an inner diameter of ${num(din)} cm and an outer diameter of ${num(dout)} cm. Find the volume of metal in the pipe, ${dpWords(2)}.`,
      answer: numA(v, 2),
      suffix: 'cm³',
      calc: true,
      hint: 'Volume of metal = volume of the outer cylinder − volume of the hole.',
      steps: [`Radii: ${num(dout / 2)} cm and ${num(din / 2)} cm`, `V = π × (${num(dout / 2)}² − ${num(din / 2)}²) × ${l} ${approx(v, 2)} cm³`],
      meta: { t: 'mea', kind, din, dout, l },
    })
  }
  const [L, W] = [pick([12, 15, 20, 25]), pick([8, 10, 12])]
  const [s, dpth] = [pick([1, 1.2]), pick([2, 2.5, 3])]
  const v = ((s + dpth) / 2) * L * W
  return q({
    prompt: `A swimming pool is ${L} m long and ${W} m wide. Its floor slopes evenly, so the water is ${num(s)} m deep at the shallow end and ${num(dpth)} m deep at the deep end. Find the capacity of the pool in kilolitres. (1 m³ = 1 kL)`,
    answer: numA(clean(v)),
    suffix: 'kL',
    calc: true,
    hint: 'Seen from the side, the water is a trapezium. V = (area of the trapezium) × width.',
    steps: [`Side area = ${half} × (${num(s)} + ${num(dpth)}) × ${L} = ${num(clean(((s + dpth) / 2) * L))} m²`, `V = ${num(clean(((s + dpth) / 2) * L))} × ${W} = ${num(clean(v))} m³ = ${num(clean(v))} kL`],
    meta: { t: 'mea', kind, L, W, s, d: dpth },
  })
}

// ================================================================= Power plus

function powerPlus(level: Level): Question {
  if (level === 1) {
    const [a, b, c] = pick(TRIPLES.filter(([x]) => x <= 15))
    return q({
      prompt: `A rhombus has diagonals of length ${2 * a} cm and ${2 * b} cm. Find its perimeter.`,
      answer: numA(4 * c),
      suffix: 'cm',
      calc: true,
      hint: 'The diagonals of a rhombus bisect each other at right angles, making four right-angled triangles.',
      steps: [`Half-diagonals: ${a} and ${b}`, `Side = √(${a}² + ${b}²) = ${c}`, `Perimeter = 4 × ${c} = ${4 * c} cm`],
      meta: { t: 'mea', kind: 'rhombusP', a, b },
    })
  }
  if (level === 2) {
    let a: number, b: number, c: number
    do [a, b, c] = [int(2, 9), int(2, 9), int(2, 12)]
    while (a === b || b === c || a === c)
    return q({
      prompt: `Three faces of a rectangular prism have areas ${a * b} cm², ${b * c} cm² and ${a * c} cm². Find the volume of the prism.`,
      answer: numA(a * b * c),
      suffix: 'cm³',
      calc: true,
      hint: 'If the edges are a, b and c, the faces are ab, bc and ca. Multiply the three areas: (ab)(bc)(ca) = (abc)².',
      steps: [`${a * b} × ${b * c} × ${a * c} = ${a * b * b * c * a * c} = (abc)²`, `V = abc = √${a * a * b * b * c * c} = ${a * b * c} cm³`],
      meta: { t: 'mea', kind: 'faces', a, b, c },
    })
  }
  for (;;) {
    const side = pick([8, 10, 12, 15])
    const rain = pick([5, 8, 10, 12])
    const d = pick([2, 3, 4, 5])
    const riseMm = ((side * side * rain) / 1000 / (PI * (d / 2) ** 2)) * 1000
    if (!safePct(riseMm, 0)) continue
    return q({
      prompt: `A flat square roof ${side} m by ${side} m drains into a cylindrical rainwater tank with a diameter of ${d} m. If ${rain} mm of rain falls on the roof, by how much does the water level in the tank rise? Answer to the nearest millimetre.`,
      answer: numA(riseMm, 0),
      suffix: 'mm',
      calc: true,
      hint: 'Volume of water = roof area × depth of rain (in metres). The rise = that volume ÷ the area of the tank’s base.',
      steps: [`Volume = ${side} × ${side} × ${num(rain / 1000)} = ${num(clean((side * side * rain) / 1000))} m³`, `Base of tank = π × ${num(d / 2)}² ${approx(PI * (d / 2) ** 2, 4)} m²`, `Rise = ${num(clean((side * side * rain) / 1000))} ÷ ${num(round(PI * (d / 2) ** 2, 4))} ${approx(riseMm / 1000, 4)} m ≈ ${Math.round(riseMm)} mm`],
      meta: { t: 'mea', kind: 'rain', side, rain, d },
    })
  }
}

// ================================================================= topic test and skills

const T = (skill: string, level: Level, gen: () => Question): TestItem => ({ skill, level, gen: () => gen() })

export const NCM10_TEST: TestItem[] = [
  // about two per exercise (16 in all), in the order of Test Yourself 10
  T('y9-mea-units', 1, () => units(1)),
  T('y9-mea-units', 2, () => units(2)),
  T('y9-mea-precision', 1, () => precision(1)),
  T('y9-mea-precision', 2, () => precision(2)),
  T('y9-mea-pcterror', 2, () => pctError(2)),
  T('y9-mea-composite', 1, () => composite(1)),
  T('y9-mea-composite', 2, () => composite(2)),
  T('y9-mea-quads', 1, () => quads(1)),
  T('y9-mea-quads', 3, () => quads(3)),
  T('y9-mea-circles', 1, () => circles(1)),
  T('y9-mea-circles', 2, () => circles(2)),
  T('y9-mea-saprism', 1, () => saPrism(1)),
  T('y9-mea-saprism', 2, () => saPrism(2)),
  T('y9-mea-sacyl', 1, () => saCyl(1)),
  T('y9-mea-volume', 1, () => volume(1)),
  T('y9-mea-volume', 2, () => volume(2)),
]

export const NCM10_SKILLS: Skill[] = [
  {
    id: 'y9-mea-units',
    title: 'Metric units',
    ref: ref('10.01'),
    outcomes: MAG,
    summary: 'Convert metric units of length, mass, capacity, time and digital memory, including very small and very large units.',
    learn: {
      intro: '<p>To change to a <b>smaller</b> unit, multiply; to change to a <b>larger</b> unit, divide.</p><p>Prefixes: kilo (k) = 1000, mega (M) = 1 000 000, giga (G) = 10⁹, milli (m) = 1/1000, micro (μ) = 1/1 000 000, nano (n) = 1/10⁹.</p>',
      keyPoints: ['1 cm = 10 mm, 1 m = 100 cm, 1 km = 1000 m', '1 g = 1000 mg, 1 kg = 1000 g, 1 t = 1000 kg', '1 L = 1000 mL, 1 kL = 1000 L, 1 ML = 1000 kL', '1 min = 60 s, 1 h = 60 min, 1 day = 24 h', 'Digital memory: 1 kB = 1000 B, 1 MB = 1000 kB, 1 GB = 1000 MB, 1 TB = 1000 GB'],
    },
    gen: units,
    levels: { 1: 'One-step conversions; sensible measurements', 2: 'Two-step conversions; digital memory', 3: 'Very small and very large units; data use' },
  },
  {
    id: 'y9-mea-precision',
    title: 'Precision and absolute error',
    ref: ref('10.02'),
    outcomes: MAG,
    summary: 'The precision of a scale, the absolute error, and the limits of a measurement.',
    learn: {
      intro: '<p>The <b>precision</b> of a measuring instrument is the smallest unit on its scale. Every measurement could be wrong by up to half of that: the <b>absolute error</b>.</p><div class="big">absolute error = ½ × precision</div>',
      keyPoints: ['A measurement of 26.8 cm with a ruler marked in mm (0.1 cm) lies between 26.75 cm and 26.85 cm.', 'The lower and upper limits are one absolute error either side of the measurement.', 'More decimal places (44.0 L rather than 44 L) means a more precise measurement.'],
      vocab: [
        ['precision', 'the smallest unit on the scale of a measuring instrument'],
        ['absolute error', 'the greatest possible error of a measurement: half the precision'],
      ],
    },
    gen: precision,
    levels: { 1: 'Read the precision of a scale', 2: 'Absolute error and the limits of a measurement', 3: 'From limits back to the measurement; which is more precise' },
  },
  {
    id: 'y9-mea-pcterror',
    title: 'Percentage error',
    ref: ref('10.03'),
    outcomes: MAG,
    summary: 'The absolute error as a percentage of the measurement; comparing the accuracy of measurements.',
    learn: {
      intro: '<div class="big">percentage error = absolute error ÷ measurement × 100%</div><p>The smaller the percentage error, the more accurate the measurement.</p>',
      keyPoints: ['Find the precision first: the place value of the last digit, or the “nearest” amount given.', 'An error of 0.5 m matters more for a 5 m room than for a 500 m bridge: compare percentage errors, not absolute errors.'],
    },
    gen: pctError,
    levels: { 1: 'Absolute error of a measurement', 2: 'Percentage error', 3: 'Which measurement is more accurate?' },
  },
  {
    id: 'y9-mea-composite',
    title: 'Perimeters and areas of composite shapes',
    ref: ref('10.04'),
    outcomes: COMP,
    summary: 'Composite shapes made of rectangles and triangles; shaded areas; hectares and square kilometres.',
    learn: {
      intro: '<p>Split a composite shape into rectangles and triangles, or find a large shape and subtract the missing part. Find unknown sides first, using Pythagoras’ theorem for a sloping side.</p>',
      keyPoints: ['Rectangle: A = lw. Triangle: A = ½bh.', '1 ha = 10 000 m² (a 100 m × 100 m square). 1 km² = 1 000 000 m².'],
      vocab: [['hectare (ha)', '10 000 m²']],
    },
    gen: composite,
    levels: { 1: 'L-shapes', 2: 'Rectangle and triangle; shaded frames', 3: 'Land areas in hectares and km²' },
  },
  {
    id: 'y9-mea-quads',
    title: 'Areas of quadrilaterals',
    ref: ref('10.05'),
    outcomes: QUAD,
    summary: 'Parallelograms, trapeziums, rhombuses and kites, and missing lengths from the area.',
    learn: {
      intro: '<p>Parallelogram: A = bh. Trapezium: A = ½(a + b)h. Rhombus and kite: A = ½xy, where x and y are the diagonals.</p>',
      keyPoints: ['h is always the perpendicular height, not a sloping side.', 'To find a missing length, substitute into the formula and solve.'],
    },
    gen: quads,
    levels: { 1: 'Area from whole-number lengths', 2: 'Decimal lengths; ignore the sloping side', 3: 'A missing length from the area' },
  },
  {
    id: 'y9-mea-circles',
    title: 'Circumferences and areas of circular shapes',
    ref: ref('10.06'),
    outcomes: CIRC,
    summary: 'Circles, sectors (arc length, perimeter, area) and composite circular shapes.',
    learn: {
      intro: '<p>C = πd = 2πr and A = πr². A <b>sector</b> with angle θ is θ/360 of the circle: arc length = (θ/360) × 2πr, area = (θ/360) × πr².</p>',
      keyPoints: ['Perimeter of a sector = arc length + 2 radii.', 'A ring (annulus): area = πR² − πr².', 'Use the π key on your calculator.'],
      vocab: [
        ['sector', 'a part of a circle cut off by two radii, like a slice of pizza'],
        ['quadrant', 'a quarter of a circle'],
      ],
    },
    gen: circles,
    levels: { 1: 'Circumference and area of a circle', 2: 'Sectors, quadrants and semicircles', 3: 'Composite shapes, rings, wheels and paths' },
  },
  {
    id: 'y9-mea-saprism',
    title: 'Surface area of a prism',
    ref: ref('10.07'),
    outcomes: SA,
    summary: 'Cubes, rectangular, triangular and trapezoidal prisms, open and closed.',
    learn: {
      intro: '<p>The surface area of a solid is the total area of all its faces. Draw or picture the net, find the area of each face, and add.</p>',
      keyPoints: ['Cube: SA = 6s². Rectangular prism: SA = 2(lw + lh + wh).', 'An open box (no top) has only 5 faces.', 'For a triangular prism: two triangles plus three rectangles; use Pythagoras’ theorem for a missing sloping edge.'],
    },
    gen: saPrism,
    levels: { 1: 'Cubes and rectangular prisms', 2: 'Open boxes; triangular prisms', 3: 'Trapezoidal prisms, tents, a cube from its surface area' },
  },
  {
    id: 'y9-mea-sacyl',
    title: 'Surface area of a cylinder',
    ref: ref('10.08'),
    outcomes: SA,
    summary: 'Closed and open cylinders, curved surfaces and half-cylinders.',
    learn: {
      intro: '<p>A closed cylinder has two circles and a curved surface that unrolls into a rectangle (2πr long and h wide).</p><div class="big">SA = 2πr² + 2πrh</div>',
      keyPoints: ['Open at one end: πr² + 2πrh. Open at both ends: 2πrh.', 'A half-cylinder: two semicircles (πr²), half the curved surface (πrh) and, if closed, the flat rectangle (2r × h).'],
    },
    gen: saCyl,
    levels: { 1: 'Closed cylinders', 2: 'Curved surface; open at one or both ends', 3: 'Half-cylinders; painting a pool' },
  },
  {
    id: 'y9-mea-volume',
    title: 'Volumes of prisms and cylinders',
    ref: ref('10.09'),
    outcomes: VOL,
    summary: 'V = Ah for prisms, V = πr²h for cylinders; capacity; composite solids.',
    learn: {
      intro: '<p>A prism has the same cross-section all along its length, so <b>V = Ah</b> (area of the base × the perpendicular height or length). A cylinder’s base is a circle: <b>V = πr²h</b>.</p>',
      keyPoints: ['1 cm³ holds 1 mL; 1 m³ holds 1000 L = 1 kL.', '1 m³ = 1 000 000 cm³.', 'Composite solids: add the parts, or subtract a hole.'],
    },
    gen: volume,
    levels: { 1: 'Rectangular and triangular prisms, cylinders', 2: 'Trapezoidal prisms; capacity; cm³ to m³', 3: 'Missing lengths, cube roots, composite solids, a sloping pool' },
  },
  {
    id: 'y9-mea-powerplus',
    title: 'Power plus: surface area and volume',
    ref: 'NCM 9 Power plus 10',
    tag: 'extension',
    outcomes: [...SA, ...VOL],
    summary: 'A rhombus from its diagonals, a prism from its face areas, rain into a tank.',
    learn: {
      intro: '<p>Challenge problems that combine Pythagoras’ theorem, area, volume and units.</p>',
      keyPoints: ['Draw a diagram and label what you know.', 'Keep units the same: change mm of rain to metres before multiplying by an area in m².'],
    },
    gen: powerPlus,
    levels: { 1: 'Rhombus perimeter from its diagonals', 2: 'Volume from three face areas', 3: 'Rain on a roof filling a tank' },
  },
]
