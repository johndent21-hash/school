// Year 9 (Stage 5) — Trigonometry, Measurement (error, surface area, volume), Coordinate geometry
import type { Level, Question, Topic } from '@/lib/maths/types'
import {
  D, L, MINUS, TIMES, DIVIDE, bnum, chance, clean, frac, fracA, fracS, gcd, int, intExcept, mcA, mcFixedA, nonZero, num,
  numA, pick, pointA, q, sample, exprA, v, ex, lin, round, name, sqrt, approx, NOT_TO_SCALE,
} from './helpers'

const R = Math.PI / 180
const sinD = (d: number) => Math.sin(d * R)
const cosD = (d: number) => Math.cos(d * R)
const tanD = (d: number) => Math.tan(d * R)
const atanD = (x: number) => Math.atan(x) / R
const asinD = (x: number) => Math.asin(x) / R
const acosD = (x: number) => Math.acos(x) / R
const TH = 'θ'
const r1 = (x: number) => num(round(x, 1), 1)

// ------------------------------------------------------------------ Trigonometry

const trg_label = (level: Level): Question => {
  if (level === 1) {
    const at = pick(['base', 'top'] as const)
    const side = pick(['opposite', 'adjacent', 'hypotenuse'])
    // with angle at base end: opposite = height (q), adjacent = base (p), hypotenuse = r
    const map = at === 'base' ? { opposite: 'q', adjacent: 'p', hypotenuse: 'r' } : { opposite: 'p', adjacent: 'q', hypotenuse: 'r' }
    const ans = map[side as keyof typeof map]
    return q({
      prompt: `Which side is the <b>${side}</b> side relative to the angle ${TH}?`,
      diagram: D.rightTriangle(int(4, 9), int(3, 8), { base: v('p'), height: v('q'), hyp: v('r'), angleAt: at, angleLabel: TH }),
      answer: mcFixedA(['p', 'q', 'r'], ans),
      hint: 'The hypotenuse is opposite the right angle. The opposite side is across from θ. The adjacent side is next to θ (but is not the hypotenuse).',
      steps: [`Hypotenuse: r (opposite the right angle).`, `Opposite θ: ${map.opposite}. Adjacent to θ: ${map.adjacent}.`, `So the ${side} is ${ans}.`],
    })
  }
  const TRI: [number, number, number][] = [
    [3, 4, 5],
    [5, 12, 13],
    [8, 15, 17],
    [7, 24, 25],
    [6, 8, 10],
    [9, 40, 41],
    [20, 21, 29],
  ]
  const [a, b, c] = pick(level === 3 ? TRI.filter((t) => gcd(t[0], t[1]) === 1) : TRI)
  if (level === 2) {
    const ratio = pick(['sin', 'cos', 'tan'])
    // angle at base end: opp = b (height), adj = a (base)
    const [n, d] = ratio === 'sin' ? [b, c] : ratio === 'cos' ? [a, c] : [b, a]
    return q({
      prompt: `Write ${ratio} ${TH} as a fraction.`,
      diagram: D.rightTriangle(a, b, { base: String(a), height: String(b), hyp: String(c), angleAt: 'base', angleLabel: TH }),
      answer: fracA(n, d, { allowDecimal: true }),
      hint: 'SOH CAH TOA: sin = opposite/hypotenuse, cos = adjacent/hypotenuse, tan = opposite/adjacent.',
      steps: [`Opposite = ${b}, adjacent = ${a}, hypotenuse = ${c}`, `${ratio} ${TH} = ${frac(n, d)}${gcd(n, d) > 1 ? ' = ' + fracS(n, d) : ''}`],
    })
  }
  const given = pick(['tan', 'sin', 'cos'])
  const want = pick(['sin', 'cos', 'tan'].filter((r) => r !== given))
  const val: Record<string, [number, number]> = { sin: [b, c], cos: [a, c], tan: [b, a] }
  return q({
    prompt: `In a right-angled triangle, ${given} ${TH} = ${frac(val[given][0], val[given][1])}. Find ${want} ${TH} as a fraction. (Hint: draw the triangle and use Pythagoras’ theorem.)`,
    answer: fracA(val[want][0], val[want][1], { allowDecimal: true }),
    hint: `Draw a right-angled triangle with the sides given by ${given} ${TH}, then find the third side.`,
    steps: [
      given === 'tan' ? `Opposite = ${b}, adjacent = ${a}.` : given === 'sin' ? `Opposite = ${b}, hypotenuse = ${c}.` : `Adjacent = ${a}, hypotenuse = ${c}.`,
      given === 'tan' ? `Hypotenuse = ${sqrt(`${b}<sup>2</sup> + ${a}<sup>2</sup>`)} = ${c}` : given === 'sin' ? `Adjacent = ${sqrt(`${c}<sup>2</sup> ${MINUS} ${b}<sup>2</sup>`)} = ${a}` : `Opposite = ${sqrt(`${c}<sup>2</sup> ${MINUS} ${a}<sup>2</sup>`)} = ${b}`,
      `${want} ${TH} = ${frac(val[want][0], val[want][1])}${gcd(val[want][0], val[want][1]) > 1 ? ' = ' + fracS(val[want][0], val[want][1]) : ''}`,
    ],
  })
}

const trg_side = (level: Level): Question => {
  const ang = int(15, 75)
  const known = int(5, 40)
  const u = pick(['cm', 'm'])
  // angle at base end. Sides: base = adjacent, height = opposite, hyp.
  if (level <= 2) {
    const type = L(level, pick(['opp-hyp', 'adj-hyp', 'opp-adj']), pick(['opp-hyp', 'adj-hyp', 'opp-adj']), 'x')
    let ans = 0
    let labels: { base?: string; height?: string; hyp?: string } = {}
    let ratio = ''
    let eqn = ''
    if (type === 'opp-hyp') {
      ans = known * sinD(ang)
      labels = { height: v('x'), hyp: `${known} ${u}` }
      ratio = 'sin'
      eqn = `${v('x')} = ${known} ${TIMES} sin ${ang}°`
    } else if (type === 'adj-hyp') {
      ans = known * cosD(ang)
      labels = { base: v('x'), hyp: `${known} ${u}` }
      ratio = 'cos'
      eqn = `${v('x')} = ${known} ${TIMES} cos ${ang}°`
    } else if (type === 'opp-adj') {
      ans = known * tanD(ang)
      labels = { height: v('x'), base: `${known} ${u}` }
      ratio = 'tan'
      eqn = `${v('x')} = ${known} ${TIMES} tan ${ang}°`
    } else {
      // adj from opp: tan = opp/adj → adj = opp / tan  (unknown in denominator) — only at level 2 as a stretch
      ans = known / tanD(ang)
      labels = { base: v('x'), height: `${known} ${u}` }
      ratio = 'tan'
      eqn = `${v('x')} = ${known} ${DIVIDE} tan ${ang}°`
    }
    const adj = type === 'opp-hyp' ? cosD(ang) : 1
    void adj
    // Shape of the drawn triangle follows the angle
    const diag = D.rightTriangle(cosD(ang), sinD(ang), { ...labels, angleAt: 'base', angleLabel: `${ang}°` })
    return q({
      prompt: `Find the value of ${v('x')}, correct to 1 decimal place.`,
      diagram: diag,
      answer: numA(ans, 1),
      suffix: u,
      calc: true,
      hint: `Label the sides (O, A, H) relative to ${ang}°. Choose the ratio that uses the side you know and the side you want: here, ${ratio}.`,
      steps: [`${ratio} ${ang}° = ${type === 'opp-hyp' ? frac(v('x'), known) : type === 'adj-hyp' ? frac(v('x'), known) : type === 'opp-adj' ? frac(v('x'), known) : frac(known, v('x'))}`, eqn, `${v('x')} ≈ ${r1(ans)} ${u}`],
    })
  }
  const type = pick(['hyp-from-opp', 'hyp-from-adj', 'adj-from-opp'])
  const ans = type === 'hyp-from-opp' ? known / sinD(ang) : type === 'hyp-from-adj' ? known / cosD(ang) : known / tanD(ang)
  const labels = type === 'hyp-from-opp' ? { height: `${known} ${u}`, hyp: v('x') } : type === 'hyp-from-adj' ? { base: `${known} ${u}`, hyp: v('x') } : { height: `${known} ${u}`, base: v('x') }
  const ratio = type === 'hyp-from-opp' ? 'sin' : type === 'hyp-from-adj' ? 'cos' : 'tan'
  return q({
    prompt: `Find the value of ${v('x')}, correct to 1 decimal place.`,
    diagram: D.rightTriangle(cosD(ang), sinD(ang), { ...labels, angleAt: 'base', angleLabel: `${ang}°` }),
    answer: numA(ans, 1),
    suffix: u,
    calc: true,
    hint: `The unknown is in the denominator: rearrange to ${v('x')} = ${known} ÷ ${ratio} ${ang}°.`,
    steps: [`${ratio} ${ang}° = ${frac(known, v('x'))}`, `${v('x')} = ${known} ${DIVIDE} ${ratio} ${ang}°`, `${v('x')} ≈ ${r1(ans)} ${u}`],
  })
}

const trg_angle = (level: Level): Question => {
  const u = pick(['cm', 'm'])
  if (level <= 2) {
    const type = L(level, 'tan', pick(['sin', 'cos']), 'tan')
    let a = int(3, 20)
    let b = int(3, 20)
    let c = 0
    let labels: { base?: string; height?: string; hyp?: string } = {}
    let theta = 0
    if (type === 'tan') {
      theta = atanD(b / a)
      labels = { base: `${a} ${u}`, height: `${b} ${u}` }
    } else {
      c = int(Math.max(a, b) + 1, Math.max(a, b) + 15)
      if (type === 'sin') {
        theta = asinD(b / c)
        labels = { height: `${b} ${u}`, hyp: `${c} ${u}` }
        a = Math.sqrt(c * c - b * b)
      } else {
        theta = acosD(a / c)
        labels = { base: `${a} ${u}`, hyp: `${c} ${u}` }
        b = Math.sqrt(c * c - a * a)
      }
    }
    return q({
      prompt: `Find the size of angle ${TH}, correct to the nearest degree.`,
      diagram: D.rightTriangle(a, b, { ...labels, angleAt: 'base', angleLabel: TH }),
      answer: numA(theta, 0),
      suffix: '°',
      calc: true,
      hint: `Choose the ratio, then use the inverse function (${type}<sup>−1</sup>) on your calculator.`,
      steps: [`${type} ${TH} = ${type === 'tan' ? frac(b, a) : type === 'sin' ? frac(labels.height!.split(' ')[0], c) : frac(labels.base!.split(' ')[0], c)}`, `${TH} = ${type}<sup>${MINUS}1</sup>(${type === 'tan' ? frac(b, a) : type === 'sin' ? frac(labels.height!.split(' ')[0], c) : frac(labels.base!.split(' ')[0], c)}) ≈ ${num(round(theta, 2), 2)}°`, `${TH} ≈ ${round(theta, 0)}°`],
    })
  }
  const rise = pick([0.5, 0.6, 0.8, 1, 1.2, 1.5])
  const len = pick([4, 5, 6, 8, 10, 12])
  const theta = asinD(rise / len)
  return q({
    prompt: `A wheelchair ramp is ${len} m long and rises ${num(rise)} m vertically. What angle does the ramp make with the ground, correct to the nearest degree?`,
    answer: numA(theta, 0),
    suffix: '°',
    calc: true,
    hint: 'The ramp is the hypotenuse; the rise is opposite the angle. Use sin.',
    steps: [`sin ${TH} = ${frac(num(rise), len)}`, `${TH} = sin<sup>${MINUS}1</sup>(${num(clean(rise / len))}) ≈ ${num(round(theta, 2), 2)}°`, `${TH} ≈ ${round(theta, 0)}°`],
  })
}

const trg_elev = (level: Level): Question => {
  if (level === 1) {
    const d = int(10, 80)
    const ang = int(15, 60)
    const h = d * tanD(ang)
    return q({
      prompt: `From a point ${d} m from the base of a tree, the angle of elevation to the top of the tree is ${ang}°. How tall is the tree, correct to 1 decimal place?`,
      answer: numA(h, 1),
      suffix: 'm',
      calc: true,
      hint: 'The height is opposite the angle and the distance along the ground is adjacent. Use tan.',
      steps: [`tan ${ang}° = ${frac(v('h'), d)}`, `${v('h')} = ${d} ${TIMES} tan ${ang}° ≈ ${r1(h)} m`],
    })
  }
  if (level === 2) {
    const h = int(30, 150)
    const ang = int(10, 45)
    const d = h / tanD(ang)
    return q({
      prompt: `From the top of a ${h} m cliff at Cape Byron, the angle of depression to a boat is ${ang}°. How far is the boat from the base of the cliff, correct to 1 decimal place?`,
      answer: numA(d, 1),
      suffix: 'm',
      calc: true,
      hint: 'The angle of depression equals the angle of elevation from the boat to the clifftop (alternate angles). Then use tan.',
      steps: [`Angle of elevation from the boat = ${ang}° (alternate angles).`, `tan ${ang}° = ${frac(h, v('d'))}`, `${v('d')} = ${h} ${DIVIDE} tan ${ang}° ≈ ${r1(d)} m`],
    })
  }
  const h = int(20, 120)
  const d = int(30, 200)
  const nm = name()
  const theta = atanD(h / d)
  return q({
    prompt: `A drone hovers ${h} m above the ground. ${nm} stands ${d} m from the point directly below the drone. What is the angle of elevation of the drone from ${nm}’s position, correct to the nearest degree?`,
    answer: numA(theta, 0),
    suffix: '°',
    calc: true,
    hint: 'Opposite = height, adjacent = distance along the ground. Use tan⁻¹.',
    steps: [`tan ${TH} = ${frac(h, d)}`, `${TH} = tan<sup>${MINUS}1</sup>(${frac(h, d)}) ≈ ${num(round(theta, 2), 2)}°`, `${TH} ≈ ${round(theta, 0)}°`],
  })
}

const COMPASS: [string, (a: number) => number][] = [
  ['N{a}°E', (a) => a],
  ['S{a}°E', (a) => 180 - a],
  ['S{a}°W', (a) => 180 + a],
  ['N{a}°W', (a) => 360 - a],
]
const three = (b: number) => String(Math.round(b)).padStart(3, '0')

const trg_bearings = (level: Level): Question => {
  if (level === 1) {
    const [fmt, f] = pick(COMPASS)
    const a = pick([10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80])
    const tb = f(a)
    const cb = fmt.replace('{a}', String(a))
    return q({
      prompt: `Write the compass bearing ${cb} as a true bearing.`,
      answer: numA(tb),
      suffix: '°T',
      hint: 'True bearings are measured clockwise from north, from 000° to 360°.',
      steps: [cb.startsWith('N') && cb.endsWith('E') ? `Measure ${a}° clockwise from north: ${three(tb)}°T` : cb.startsWith('S') && cb.endsWith('E') ? `South is 180°. ${a}° towards east is back towards north: 180° ${MINUS} ${a}° = ${three(tb)}°T` : cb.startsWith('S') ? `South is 180°. ${a}° towards west: 180° + ${a}° = ${three(tb)}°T` : `North is 360°. ${a}° towards west: 360° ${MINUS} ${a}° = ${three(tb)}°T`],
    })
  }
  if (level === 2) {
    const tb = pick([20, 35, 60, 110, 135, 160, 200, 225, 250, 290, 315, 340])
    let cb = ''
    if (tb < 90) cb = `N${tb}°E`
    else if (tb < 180) cb = `S${180 - tb}°E`
    else if (tb < 270) cb = `S${tb - 180}°W`
    else cb = `N${360 - tb}°W`
    const ang = Number(cb.replace(/[^0-9]/g, ''))
    const all = [`N${ang}°E`, `S${ang}°E`, `S${ang}°W`, `N${ang}°W`]
    return q({
      prompt: `Which compass bearing is the same as the true bearing ${three(tb)}°T?`,
      answer: mcFixedA(all, cb),
      hint: 'Decide which quadrant the bearing is in, then measure the angle from north or south.',
      steps: [tb < 90 ? `${three(tb)}° is between north and east: N${tb}°E.` : tb < 180 ? `${three(tb)}° is between east and south: 180° ${MINUS} ${tb}° = ${180 - tb}° from south towards east: S${180 - tb}°E.` : tb < 270 ? `${three(tb)}° is between south and west: ${tb}° ${MINUS} 180° = ${tb - 180}°: S${tb - 180}°W.` : `${three(tb)}° is between west and north: 360° ${MINUS} ${tb}° = ${360 - tb}°: N${360 - tb}°W.`],
    })
  }
  const tb = int(10, 350)
  const back = (tb + 180) % 360
  const [A, B] = pick([
    ['Tweed Heads', 'Murwillumbah'],
    ['the lighthouse', 'the boat'],
    ['camp', 'the waterfall'],
  ])
  return q({
    prompt: `The bearing of ${B} from ${A} is ${three(tb)}°T. What is the bearing of ${A} from ${B}?`,
    answer: numA(back),
    suffix: '°T',
    hint: 'The reverse bearing differs by 180°: add 180° if the bearing is less than 180°, otherwise subtract 180°.',
    steps: [tb < 180 ? `${three(tb)}° + 180° = ${three(back)}°` : `${three(tb)}° ${MINUS} 180° = ${three(back)}°`, `The bearing of ${A} from ${B} is ${three(back)}°T.`],
  })
}

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

// ------------------------------------------------------------------ Coordinate geometry

const pt = (x: number, y: number) => `(${num(x)}, ${num(y)})`

const cg_distance = (level: Level): Question => {
  if (level === 1) {
    const [a, b, c] = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 6, 10], [4, 3, 5], [12, 5, 13]])
    const x1 = int(-4, 2)
    const y1 = int(-4, 2)
    const x2 = x1 + a * pick([1, -1])
    const y2 = y1 + b * pick([1, -1])
    if (Math.abs(x2) > 9 || Math.abs(y2) > 9) return cg_distance(1)
    return q({
      prompt: `Find the distance between the points ${pt(x1, y1)} and ${pt(x2, y2)}.`,
      answer: numA(c),
      hint: 'Use Pythagoras: d² = (difference in x)² + (difference in y)².',
      steps: [`Horizontal difference: ${Math.abs(x2 - x1)}; vertical difference: ${Math.abs(y2 - y1)}`, `d = ${sqrt(`${a}<sup>2</sup> + ${b}<sup>2</sup>`)} = ${sqrt(c * c)} = ${c}`],
    })
  }
  const x1 = int(-6, 6)
  const y1 = int(-6, 6)
  const x2 = intExcept(-6, 8, [x1])
  const y2 = intExcept(-6, 8, [y1])
  const d2 = (x2 - x1) ** 2 + (y2 - y1) ** 2
  const d = Math.sqrt(d2)
  if (Number.isInteger(d)) return cg_distance(level)
  if (level === 2) {
    return q({
      prompt: `Find the distance between ${pt(x1, y1)} and ${pt(x2, y2)}, correct to 2 decimal places.`,
      answer: numA(d, 2),
      calc: true,
      hint: 'd = √((x₂ − x₁)² + (y₂ − y₁)²)',
      steps: [`d = ${sqrt(`(${num(x2)} ${MINUS} ${bnum(x1)})<sup>2</sup> + (${num(y2)} ${MINUS} ${bnum(y1)})<sup>2</sup>`)}`, `= ${sqrt(`${(x2 - x1) ** 2} + ${(y2 - y1) ** 2}`)} = ${sqrt(d2)}`, `≈ ${num(round(d, 2), 2)}`],
    })
  }
  const [A, B, C] = [
    [int(-5, 0), int(-5, 0)],
    [int(1, 6), int(-5, 0)],
    [int(-3, 3), int(2, 7)],
  ]
  const side = (p: number[], qq: number[]) => Math.sqrt((p[0] - qq[0]) ** 2 + (p[1] - qq[1]) ** 2)
  const P = side(A, B) + side(B, C) + side(C, A)
  return q({
    prompt: `Find the perimeter of the triangle with vertices A${pt(A[0], A[1])}, B${pt(B[0], B[1])} and C${pt(C[0], C[1])}, correct to 1 decimal place.`,
    answer: numA(P, 1),
    calc: true,
    hint: 'Find the length of each side with the distance formula, then add.',
    steps: [`AB ≈ ${num(round(side(A, B), 3), 3)}`, `BC ≈ ${num(round(side(B, C), 3), 3)}`, `CA ≈ ${num(round(side(C, A), 3), 3)}`, `Perimeter ≈ ${r1(P)}`],
  })
}

const cg_midpoint = (level: Level): Question => {
  if (level <= 2) {
    const x1 = L(level, int(0, 10), int(-9, 9), 0)
    const y1 = L(level, int(0, 10), int(-9, 9), 0)
    let x2 = L(level, int(0, 10), int(-9, 9), 0)
    let y2 = L(level, int(0, 10), int(-9, 9), 0)
    if (level === 1) {
      if ((x1 + x2) % 2) x2 = x2 === 10 ? 8 : x2 + 1
      if ((y1 + y2) % 2) y2 = y2 === 10 ? 8 : y2 + 1
    }
    if (x1 === x2 && y1 === y2) return cg_midpoint(level)
    const mx = (x1 + x2) / 2
    const my = (y1 + y2) / 2
    return q({
      prompt: `Find the midpoint of the interval joining ${pt(x1, y1)} and ${pt(x2, y2)}.`,
      answer: pointA(mx, my),
      hint: 'Average the x-coordinates and average the y-coordinates.',
      steps: [`x: (${num(x1)} + ${bnum(x2)}) ${DIVIDE} 2 = ${num(mx)}`, `y: (${num(y1)} + ${bnum(y2)}) ${DIVIDE} 2 = ${num(my)}`, `Midpoint = ${pt(mx, my)}`],
    })
  }
  const x1 = int(-6, 6)
  const y1 = int(-6, 6)
  const mx = int(-5, 5)
  const my = int(-5, 5)
  const x2 = 2 * mx - x1
  const y2 = 2 * my - y1
  return q({
    prompt: `M${pt(mx, my)} is the midpoint of the interval AB. If A is ${pt(x1, y1)}, find the coordinates of B.`,
    answer: pointA(x2, y2),
    hint: 'The step from A to M is the same as the step from M to B.',
    steps: [`x: ${num(x1)} → ${num(mx)} is a change of ${num(mx - x1)}, so B has x = ${num(mx)} + ${bnum(mx - x1)} = ${num(x2)}`, `y: ${num(y1)} → ${num(my)} is a change of ${num(my - y1)}, so B has y = ${num(my)} + ${bnum(my - y1)} = ${num(y2)}`, `B = ${pt(x2, y2)}`],
  })
}

const cg_gradient = (level: Level): Question => {
  if (level === 1) {
    const m = pick([1, 2, 3, -1, -2, 0.5, -0.5])
    const c = int(-2, 2)
    const xa = pick([-3, -2, -1, 0])
    const xb = xa + pick([2, 4])
    const pts = [xa, xb].map((x) => ({ x, y: m * x + c }))
    if (pts.some((p) => !Number.isInteger(p.y) || Math.abs(p.y) > 6)) return cg_gradient(1)
    return q({
      prompt: 'Find the gradient of the line passing through the two marked points.',
      diagram: D.numberPlane({ xmin: -5, xmax: 5, ymin: -6, ymax: 6, lines: [{ m, c }], points: pts }),
      answer: fracA(Math.round(m * 2), 2, { allowDecimal: true }),
      hint: 'Gradient = rise ÷ run. Count how far up (or down) and how far across you go between the points.',
      steps: [`Rise = ${num(pts[1].y)} ${MINUS} ${bnum(pts[0].y)} = ${num(pts[1].y - pts[0].y)}`, `Run = ${num(pts[1].x)} ${MINUS} ${bnum(pts[0].x)} = ${num(pts[1].x - pts[0].x)}`, `Gradient = ${frac(num(pts[1].y - pts[0].y), num(pts[1].x - pts[0].x))} = ${num(m)}`],
    })
  }
  if (level === 2) {
    const x1 = int(-6, 6)
    const y1 = int(-6, 6)
    const x2 = intExcept(-6, 8, [x1])
    const y2 = int(-6, 8)
    const rise = y2 - y1
    const run = x2 - x1
    return q({
      prompt: `Find the gradient of the interval joining ${pt(x1, y1)} and ${pt(x2, y2)}.`,
      answer: fracA(rise, run, { allowDecimal: true }),
      hint: 'm = (y₂ − y₁) ÷ (x₂ − x₁). Keep the order of the points the same on top and bottom.',
      steps: [`m = ${frac(`${num(y2)} ${MINUS} ${bnum(y1)}`, `${num(x2)} ${MINUS} ${bnum(x1)}`)}`, `= ${frac(num(rise), num(run))}${gcd(rise, run) > 1 || run < 0 ? ' = ' + fracS(rise, run) : ''}`],
    })
  }
  const m = nonZero(-4, 4)
  const x1 = int(-4, 4)
  const x2 = x1 + int(1, 4)
  const y2 = int(-6, 10)
  const k = y2 - m * (x2 - x1)
  return q({
    prompt: `The line through ${pt(x1, NaN).replace('NaN', v('k'))} and ${pt(x2, y2)} has a gradient of ${num(m)}. Find the value of ${v('k')}.`,
    answer: numA(k),
    prefix: `${v('k')} =`,
    hint: 'Write the gradient formula with k in it, then solve the equation.',
    steps: [`${frac(`${num(y2)} ${MINUS} ${v('k')}`, `${num(x2)} ${MINUS} ${bnum(x1)}`)} = ${num(m)}`, `${num(y2)} ${MINUS} ${v('k')} = ${num(m * (x2 - x1))}`, `${v('k')} = ${num(k)}`],
  })
}

const cg_ymxc = (level: Level): Question => {
  if (level === 1) {
    const m = nonZero(-6, 6)
    const c = int(-9, 9)
    const askM = chance()
    const order = chance(0.3)
    const eqn = order && c !== 0 ? `y = ${c} ${m < 0 ? '- ' + (m === -1 ? '' : -m) : '+ ' + (m === 1 ? '' : m)}x` : `y = ${lin(m, c)}`
    return q({
      prompt: `What is the ${askM ? 'gradient' : 'y-intercept'} of the line ${ex(eqn)}?`,
      answer: numA(askM ? m : c),
      hint: 'In y = mx + c, m is the gradient and c is the y-intercept.',
      steps: [`Written as y = mx + c: ${ex(`y = ${lin(m, c)}`)}`, askM ? `Gradient m = ${num(m)}` : `y-intercept c = ${num(c)}`],
    })
  }
  if (level === 2) {
    const a = nonZero(-5, 5)
    const cc = int(-9, 9)
    // a x + y = cc  → y = -a x + cc
    return q({
      prompt: `Find the gradient of the line ${ex(`${a === 1 ? '' : a === -1 ? '-' : a}x + y = ${cc}`)}.`,
      answer: numA(-a),
      hint: 'Rearrange into the form y = mx + c first.',
      steps: [`y = ${ex(lin(-a, cc))}`, `Gradient = ${num(-a)}`],
    })
  }
  const m = nonZero(-4, 4)
  const c = int(-5, 5)
  if (chance()) {
    return q({
      prompt: `Write the equation of the line with gradient ${num(m)} and y-intercept ${num(c)}.`,
      answer: exprA(lin(m, c)),
      prefix: `${v('y')} =`,
      hint: 'Substitute into y = mx + c.',
      steps: [`y = ${ex(lin(m, c))}`],
    })
  }
  const pts = [-2, 0, 2].map((x) => ({ x, y: m * x + c })).filter((p) => Math.abs(p.y) <= 6)
  if (pts.length < 2) return cg_ymxc(3)
  return q({
    prompt: 'Find the equation of this line.',
    diagram: D.numberPlane({ xmin: -5, xmax: 5, ymin: -6, ymax: 6, lines: [{ m, c }], points: pts }),
    answer: exprA(lin(m, c)),
    prefix: `${v('y')} =`,
    hint: 'Read the y-intercept, then find the gradient (rise ÷ run) from two marked points.',
    steps: [`y-intercept: ${num(c)}`, `Gradient: from ${pt(pts[0].x, pts[0].y)} to ${pt(pts[1].x, pts[1].y)}, rise ${num(pts[1].y - pts[0].y)}, run ${num(pts[1].x - pts[0].x)}, so m = ${num(m)}`, `y = ${ex(lin(m, c))}`],
  })
}

// ------------------------------------------------------------------ Topics

export const Y9B: Topic[] = [
  {
    id: 'y9-trigonometry',
    year: 9,
    title: 'Trigonometry',
    strand: 'Measurement and space',
    outcomes: ['MA5-TRG-C-01', 'MA5-TRG-C-02'],
    blurb: 'Trigonometric ratios, finding sides and angles, elevation, depression and bearings.',
    colour: 18,
    skills: [
      {
        id: 'y9-trg-label',
        title: 'The trigonometric ratios',
        outcomes: ['MA5-TRG-C-01'],
        summary: 'Name the sides of a right-angled triangle and write sin, cos and tan.',
        learn: {
          intro: '<p>In a right-angled triangle, label the sides relative to the angle θ: <b>hypotenuse</b> (opposite the right angle), <b>opposite</b> (across from θ) and <b>adjacent</b> (next to θ).</p>',
          keyPoints: ['sin θ = opposite ÷ hypotenuse', 'cos θ = adjacent ÷ hypotenuse', 'tan θ = opposite ÷ adjacent', 'Remember: SOH CAH TOA'],
        },
        gen: trg_label,
        levels: { 1: 'Name the sides', 2: 'Write a ratio', 3: 'From one ratio to another' },
      },
      {
        id: 'y9-trg-side',
        title: 'Finding an unknown side',
        outcomes: ['MA5-TRG-C-01'],
        summary: 'Use sin, cos or tan to find an unknown side.',
        learn: {
          intro: '<p>Label the sides, choose the ratio that links the side you know with the side you want, then solve.</p>',
          keyPoints: ['x = 12 × sin 35° when x is opposite and 12 is the hypotenuse', 'If the unknown is on the bottom: x = 12 ÷ cos 40°', 'Make sure your calculator is in degrees mode.'],
        },
        gen: trg_side,
        levels: { 1: 'Unknown on top', 2: 'Any ratio', 3: 'Unknown on the bottom' },
      },
      {
        id: 'y9-trg-angle',
        title: 'Finding an unknown angle',
        outcomes: ['MA5-TRG-C-01'],
        summary: 'Use inverse trigonometric functions to find angles.',
        learn: {
          intro: '<p>If you know two sides, find the ratio, then use sin⁻¹, cos⁻¹ or tan⁻¹ on your calculator.</p>',
          keyPoints: ['tan θ = 7/10 → θ = tan⁻¹(7/10) ≈ 35°', 'Round to the nearest degree at the end.'],
        },
        gen: trg_angle,
        levels: { 1: 'Using tan', 2: 'Using sin or cos', 3: 'Problems' },
      },
      {
        id: 'y9-trg-elev',
        title: 'Angles of elevation and depression',
        outcomes: ['MA5-TRG-C-02'],
        summary: 'Solve problems with angles of elevation and depression.',
        learn: {
          intro: '<p>The <b>angle of elevation</b> is measured up from the horizontal; the <b>angle of depression</b> is measured down from the horizontal.</p>',
          keyPoints: ['Draw a diagram with the horizontal line marked.', 'The angle of depression from A to B equals the angle of elevation from B to A (alternate angles).'],
        },
        gen: trg_elev,
        levels: { 1: 'Elevation: find a height', 2: 'Depression: find a distance', 3: 'Find the angle' },
      },
      {
        id: 'y9-trg-bearings',
        title: 'Bearings',
        outcomes: ['MA5-TRG-C-02'],
        summary: 'Use compass and true bearings.',
        learn: {
          intro: '<p><b>True bearings</b> are measured clockwise from north and written with three digits, e.g. 060°T. <b>Compass bearings</b> are measured from north or south towards east or west, e.g. S30°E.</p>',
          keyPoints: ['N40°E = 040°T, S30°E = 150°T, S20°W = 200°T, N70°W = 290°T', 'Reverse bearing: add or subtract 180°.'],
        },
        gen: trg_bearings,
        levels: { 1: 'Compass to true', 2: 'True to compass', 3: 'Reverse bearings' },
      },
    ],
  },
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
    title: 'Coordinate geometry',
    strand: 'Number and algebra',
    outcomes: ['MA5-LIN-C-01', 'MA5-LIN-C-02'],
    blurb: 'Distance, midpoint, gradient and the equation y = mx + c.',
    colour: 225,
    skills: [
      {
        id: 'y9-cg-distance',
        title: 'Length of an interval',
        outcomes: ['MA5-LIN-C-01'],
        summary: 'Find the distance between two points using Pythagoras’ theorem.',
        learn: {
          intro: '<p>The distance between two points is the hypotenuse of a right-angled triangle: d = √((x₂ − x₁)² + (y₂ − y₁)²).</p>',
          keyPoints: ['Square the differences, add, then take the square root.', 'Squaring makes negative differences positive.'],
        },
        gen: cg_distance,
        levels: { 1: 'Whole-number distances', 2: 'Rounded distances', 3: 'Perimeters' },
      },
      {
        id: 'y9-cg-midpoint',
        title: 'Midpoint of an interval',
        outcomes: ['MA5-LIN-C-01'],
        summary: 'Find midpoints and missing endpoints.',
        learn: {
          intro: '<p>The midpoint is halfway between two points: M = ((x₁ + x₂)/2, (y₁ + y₂)/2).</p>',
          keyPoints: ['Average the x-coordinates and average the y-coordinates.', 'Type points like (2.5, −1).'],
        },
        gen: cg_midpoint,
        levels: { 1: 'Positive coordinates', 2: 'Negative and halves', 3: 'Find an endpoint' },
      },
      {
        id: 'y9-cg-gradient',
        title: 'Gradient',
        outcomes: ['MA5-LIN-C-01'],
        summary: 'Find the gradient of a line or interval.',
        learn: {
          intro: '<p>Gradient measures steepness: m = rise ÷ run = (y₂ − y₁) ÷ (x₂ − x₁).</p>',
          keyPoints: ['Lines going up to the right have a positive gradient; down to the right, negative.', 'Horizontal lines have gradient 0.'],
        },
        gen: cg_gradient,
        levels: { 1: 'From a graph', 2: 'Gradient formula', 3: 'Find a missing coordinate' },
      },
      {
        id: 'y9-cg-ymxc',
        title: 'The equation y = mx + c',
        outcomes: ['MA5-LIN-C-02'],
        summary: 'Use the gradient–intercept form of a straight line.',
        learn: {
          intro: '<p>In y = mx + c, <i>m</i> is the gradient and <i>c</i> is the y-intercept.</p>',
          keyPoints: ['y = 4 − 3x has gradient −3 and y-intercept 4.', 'Rearrange other forms first: 2x + y = 5 → y = −2x + 5.'],
        },
        gen: cg_ymxc,
        levels: { 1: 'Read m and c', 2: 'Rearrange first', 3: 'Write the equation' },
      },
    ],
  },
]

void chance
void mcA
void sample
