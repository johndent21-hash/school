// Year 9 (Stage 5) — Measurement (error, surface area, volume), Coordinate geometry and graphs (NCM 9 Chapter 11, in y9-ncm11.ts).
// Trigonometry (NCM 9 Chapter 4) is in y9-ncm4.ts and sits after Numeracy and calculation in y9a.ts.
import type { Level, Question, Topic } from '@/lib/maths/types'
import { NCM11_SKILLS, NCM11_TEST } from './y9-ncm11'
import {
  D, L, MINUS, TIMES, chance, clean, frac, int, mcA, num,
  numA, pick, q, sample, round, approx, NOT_TO_SCALE,
} from './helpers'

const r1 = (x: number) => num(round(x, 1), 1)

// ------------------------------------------------------------------ Measurement

const meas_error = (level: Level): Question => {
  if (level === 1) {
    const [inst, prec, unit] = pick([
      ['a ruler marked in millimetres', 1, 'mm'],
      ['a ruler marked in centimetres', 1, 'cm'],
      ['kitchen scales marked every 5 g', 5, 'g'],
      ['a measuring jug marked every 10 mL', 10, 'mL'],
      ['a thermometer marked every 0.2°C', 0.2, '°C'],
      ['a stopwatch measuring to 0.01 s', 0.01, 's'],
    ] as [string, number, string][])
    return q({
      prompt: `What is the absolute error of ${inst}?`,
      answer: numA(clean(prec / 2)),
      suffix: unit,
      hint: 'Absolute error = ½ × precision (the smallest unit on the scale).',
      steps: [`Precision = ${num(prec)} ${unit}`, `Absolute error = ${frac(1, 2)} ${TIMES} ${num(prec)} = ${num(clean(prec / 2))} ${unit}`],
    })
  }
  if (level === 2) {
    const meas = int(20, 300)
    const prec = 1
    const pe = (0.5 / meas) * 100
    const thing = pick(['A super yacht is', 'A school hall is', 'A swimming pool is', 'A footbridge is'])
    return q({
      prompt: `${thing} measured as ${meas} m long, to the nearest metre. Find the percentage error, correct to 2 decimal places.`,
      answer: numA(pe, 2),
      suffix: '%',
      calc: true,
      hint: 'Percentage error = absolute error ÷ measurement × 100%.',
      steps: [`Absolute error = ${frac(1, 2)} ${TIMES} ${prec} = 0.5 m`, `Percentage error = ${frac('0.5', meas)} ${TIMES} 100% ${approx(pe, 2)}%`],
    })
  }
  const meas = int(21, 99) / 10
  const prec = 0.1
  const lo = clean(meas - 0.05)
  const hi = clean(meas + 0.05)
  if (chance()) {
    return q({
      prompt: `A plank is measured as ${num(meas)} m, correct to the nearest 0.1 m. What is the greatest possible length of the plank (the upper limit)?`,
      answer: numA(hi),
      suffix: 'm',
      hint: 'Upper limit = measurement + absolute error.',
      steps: [`Absolute error = ${frac(1, 2)} ${TIMES} ${num(prec)} = 0.05 m`, `Upper limit = ${num(meas)} + 0.05 = ${num(hi)} m (lower limit ${num(lo)} m)`],
    })
  }
  const pe = (0.05 / meas) * 100
  return q({
    prompt: `A plank is measured as ${num(meas)} m, correct to the nearest 0.1 m. Find the percentage error, correct to 2 decimal places.`,
    answer: numA(pe, 2),
    suffix: '%',
    calc: true,
    hint: 'Absolute error = half of 0.1 m. Then divide by the measurement.',
    steps: [`Absolute error = 0.05 m`, `${frac('0.05', num(meas))} ${TIMES} 100% ${approx(pe, 2)}%`],
  })
}

const sa_prism = (level: Level): Question => {
  if (level === 1) {
    const l = int(3, 15)
    const w = int(2, 10)
    const h = int(2, 12)
    const SA = 2 * (l * w + l * h + w * h)
    return q({
      prompt: 'Find the surface area of this rectangular prism.',
      diagram: D.rectPrism(l, w, h, `${l} cm`, `${w} cm`, `${h} cm`),
      note: NOT_TO_SCALE,
      answer: numA(SA),
      suffix: 'cm²',
      hint: 'A rectangular prism has 3 pairs of identical rectangular faces. SA = 2(lw + lh + wh).',
      steps: [`Top and bottom: 2 ${TIMES} ${l} ${TIMES} ${w} = ${2 * l * w}`, `Front and back: 2 ${TIMES} ${l} ${TIMES} ${h} = ${2 * l * h}`, `Sides: 2 ${TIMES} ${w} ${TIMES} ${h} = ${2 * w * h}`, `SA = ${SA} cm²`],
    })
  }
  if (level === 2) {
    const [a, b, c] = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]])
    const l = int(5, 20)
    const tri = (a * b) / 2
    const SA = 2 * tri + (a + b + c) * l
    return q({
      prompt: 'Find the surface area of this triangular prism.',
      diagram: D.triPrism(a, b, l, `${a} m`, `${b} m`, `${l} m`, `${c} m`),
      note: NOT_TO_SCALE,
      answer: numA(SA),
      suffix: 'm²',
      hint: 'Two triangular ends plus three rectangles. The rectangles all have length l; their widths are the three sides of the triangle.',
      steps: [`Two triangles: 2 ${TIMES} ${frac(1, 2)} ${TIMES} ${a} ${TIMES} ${b} = ${2 * tri} m²`, `Three rectangles: (${a} + ${b} + ${c}) ${TIMES} ${l} = ${(a + b + c) * l} m²`, `SA = ${SA} m²`],
    })
  }
  const l = int(20, 60)
  const w = int(15, 40)
  const h = int(10, 30)
  const SA = l * w + 2 * l * h + 2 * w * h
  return q({
    prompt: `An open storage box (no lid) is ${l} cm long, ${w} cm wide and ${h} cm high. What area of cardboard is needed to make it?`,
    answer: numA(SA),
    suffix: 'cm²',
    hint: 'There is a base but no top: 5 faces altogether.',
    steps: [`Base: ${l} ${TIMES} ${w} = ${l * w}`, `Front and back: 2 ${TIMES} ${l} ${TIMES} ${h} = ${2 * l * h}`, `Ends: 2 ${TIMES} ${w} ${TIMES} ${h} = ${2 * w * h}`, `Total = ${SA} cm²`],
  })
}

const sa_cyl = (level: Level): Question => {
  const PI = Math.PI
  if (level === 1) {
    const r = int(2, 15)
    const h = int(3, 25)
    const SA = 2 * PI * r * r + 2 * PI * r * h
    return q({
      prompt: 'Find the surface area of this closed cylinder, correct to 1 decimal place.',
      diagram: D.cylinder(r, h, `${r} cm`, `${h} cm`),
      note: NOT_TO_SCALE,
      answer: numA(SA, 1),
      suffix: 'cm²',
      calc: true,
      hint: 'SA = 2πr² (the two circles) + 2πrh (the curved surface).',
      steps: [`Circles: 2 ${TIMES} π ${TIMES} ${r}<sup>2</sup> ≈ ${num(round(2 * PI * r * r, 2), 2)}`, `Curved surface: 2 ${TIMES} π ${TIMES} ${r} ${TIMES} ${h} ≈ ${num(round(2 * PI * r * h, 2), 2)}`, `SA ≈ ${r1(SA)} cm²`],
    })
  }
  if (level === 2) {
    const d = int(4, 30)
    const h = int(3, 30)
    const r = d / 2
    const SA = PI * r * r + 2 * PI * r * h
    return q({
      prompt: `A cylindrical vase is open at the top. Its diameter is ${d} cm and its height is ${h} cm. Find its outside surface area, correct to 1 decimal place.`,
      answer: numA(SA, 1),
      suffix: 'cm²',
      calc: true,
      hint: 'Only one circle (the base) plus the curved surface. Halve the diameter first.',
      steps: [`r = ${num(r)} cm`, `Base: π ${TIMES} ${num(r)}<sup>2</sup> ≈ ${num(round(PI * r * r, 2), 2)}`, `Curved surface: 2π ${TIMES} ${num(r)} ${TIMES} ${h} ≈ ${num(round(2 * PI * r * h, 2), 2)}`, `SA ≈ ${r1(SA)} cm²`],
    })
  }
  const r = int(3, 8)
  const h = int(8, 20)
  const label = 2 * PI * r * h
  return q({
    prompt: `A paper label covers the curved surface of a can of radius ${r} cm and height ${h} cm, with no overlap. What is the area of the label, correct to 1 decimal place?`,
    answer: numA(label, 1),
    suffix: 'cm²',
    calc: true,
    hint: 'Unrolled, the label is a rectangle: its length is the circumference (2πr) and its width is the height.',
    steps: [`Length of label = 2π ${TIMES} ${r} ≈ ${num(round(2 * PI * r, 2), 2)} cm`, `Area = 2π ${TIMES} ${r} ${TIMES} ${h} ≈ ${r1(label)} cm²`],
  })
}

const vol_composite = (level: Level): Question => {
  const PI = Math.PI
  if (level === 1) {
    const W = int(6, 14)
    const H = int(6, 12)
    const w = int(2, W - 3)
    const h = int(2, H - 3)
    const depth = int(3, 15)
    const A = W * H - w * h
    return q({
      prompt: `This L-shaped face is the cross-section of a prism ${depth} cm long. Find the volume of the prism.`,
      diagram: D.lShape(W, H, w, h, { W: `${W} cm`, H: `${H} cm`, a: `${W - w} cm`, b: `${H - h} cm` }),
      note: NOT_TO_SCALE,
      answer: numA(A * depth),
      suffix: 'cm³',
      hint: 'Find the area of the L-shaped cross-section, then multiply by the length.',
      steps: [`Cross-section: ${W} ${TIMES} ${H} ${MINUS} ${w} ${TIMES} ${h} = ${A} cm²`, `V = ${A} ${TIMES} ${depth} = ${A * depth} cm³`],
    })
  }
  if (level === 2) {
    const d = int(6, 30)
    const h = int(10, 40)
    const V = PI * (d / 2) ** 2 * h
    return q({
      prompt: `A cylindrical water tank has a diameter of ${d} dm and a height of ${h} dm. How many litres does it hold? (1 dm³ = 1 L.) Answer correct to the nearest litre.`,
      answer: numA(V, 0),
      suffix: 'L',
      calc: true,
      hint: 'V = πr²h. Halve the diameter to get the radius.',
      steps: [`r = ${num(d / 2)} dm`, `V = π ${TIMES} ${num(d / 2)}<sup>2</sup> ${TIMES} ${h} ≈ ${num(round(V, 1), 1)} dm³`, `≈ ${round(V, 0)} L`],
    })
  }
  const l = int(10, 30)
  const w = int(8, 20)
  const h = int(5, 15)
  const r = int(1, Math.floor(Math.min(l, w) / 4))
  const V = l * w * h - PI * r * r * h
  return q({
    prompt: `A block of wood is a rectangular prism ${l} cm × ${w} cm × ${h} cm. A cylindrical hole of radius ${r} cm is drilled straight through it (through the ${h} cm height). Find the volume of wood left, correct to 1 decimal place.`,
    answer: numA(V, 1),
    suffix: 'cm³',
    calc: true,
    hint: 'Volume left = volume of the block − volume of the cylinder removed.',
    steps: [`Block: ${l} ${TIMES} ${w} ${TIMES} ${h} = ${l * w * h} cm³`, `Hole: π ${TIMES} ${r}<sup>2</sup> ${TIMES} ${h} ≈ ${num(round(PI * r * r * h, 2), 2)} cm³`, `Left ≈ ${r1(V)} cm³`],
  })
}

// ------------------------------------------------------------------ Topics

export const Y9B: Topic[] = [
  {
    id: 'y9-measurement',
    year: 9,
    title: 'Surface area and volume',
    strand: 'Measurement and space',
    outcomes: ['MA5-ARE-C-01', 'MA5-VOL-C-01', 'MA5-NUM-C-01'],
    blurb: 'Measurement error, surface area of prisms and cylinders, and volume of composite solids.',
    colour: 95,
    skills: [
      {
        id: 'y9-meas-error',
        title: 'Measurement error',
        outcomes: ['MA5-NUM-C-01'],
        summary: 'Find absolute error, limits of accuracy and percentage error.',
        learn: {
          intro: '<p>Every measurement is approximate. The <b>absolute error</b> is half the precision (smallest unit) of the measuring instrument.</p>',
          keyPoints: ['Ruler in mm: absolute error 0.5 mm', 'Limits of accuracy: measurement ± absolute error', 'Percentage error = absolute error ÷ measurement × 100%'],
        },
        gen: meas_error,
        levels: { 1: 'Absolute error', 2: 'Percentage error', 3: 'Limits of accuracy' },
      },
      {
        id: 'y9-sa-prism',
        title: 'Surface area of prisms',
        outcomes: ['MA5-ARE-C-01'],
        summary: 'Find the surface area of rectangular and triangular prisms.',
        learn: {
          intro: '<p><b>Surface area</b> is the total area of all the faces of a solid. It can help to sketch the net.</p>',
          keyPoints: ['Rectangular prism: SA = 2(lw + lh + wh)', 'Triangular prism: 2 triangles + 3 rectangles', 'Check whether the solid is open or closed.'],
        },
        gen: sa_prism,
        levels: { 1: 'Rectangular prisms', 2: 'Triangular prisms', 3: 'Open boxes' },
      },
      {
        id: 'y9-sa-cyl',
        title: 'Surface area of cylinders',
        outcomes: ['MA5-ARE-C-01'],
        summary: 'Find the surface area of closed and open cylinders.',
        learn: {
          intro: '<p>A cylinder’s net is two circles and a rectangle. The rectangle’s length is the circumference.</p>',
          keyPoints: ['Closed cylinder: SA = 2πr² + 2πrh', 'Open at one end: SA = πr² + 2πrh', 'Curved surface only: 2πrh'],
        },
        gen: sa_cyl,
        levels: { 1: 'Closed cylinders', 2: 'Open cylinders', 3: 'Curved surface' },
      },
      {
        id: 'y9-vol-composite',
        title: 'Volume of prisms, cylinders and composite solids',
        outcomes: ['MA5-VOL-C-01'],
        summary: 'Find volumes of prisms, cylinders and composite solids, including capacity.',
        learn: {
          intro: '<p>For any prism or cylinder, V = Ah (area of cross-section × height). For composite solids, add or subtract volumes.</p>',
          keyPoints: ['1 cm³ = 1 mL, 1 dm³ = 1 L, 1 m³ = 1000 L', 'Volume with a hole = solid − hole'],
        },
        gen: vol_composite,
        levels: { 1: 'Composite cross-sections', 2: 'Cylinders and capacity', 3: 'Solids with holes' },
      },
    ],
  },
  {
    id: 'y9-coordinate',
    year: 9,
    title: 'Coordinate geometry and graphs',
    ref: 'NCM 9 Chapter 11',
    strand: 'Number and algebra',
    outcomes: ['MA5-LIN-C-01', 'MA5-LIN-C-02', 'MA5-NLI-C-01'],
    blurb: 'Length, midpoint and gradient of intervals; graphing straight lines and y = mx + c; solving and applying linear equations; parabolas y = ax² + c.',
    colour: 225,
    test: NCM11_TEST,
    skills: NCM11_SKILLS,
  },
]

void chance
void mcA
void sample
