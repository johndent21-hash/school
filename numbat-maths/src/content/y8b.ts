// Year 8 (Stage 4) — Percentages, Rates and scale, Length, Area, Volume
import type { Level, Question, Topic } from '@/lib/maths/types'
import {
  D, L, MINUS, TIMES, DIVIDE, chance, clean, frac, int, mcFixedA, num, numA, pick, q, sample, v, ex, money, dollars,
  NOT_TO_SCALE, round, name, intExcept,
} from './helpers'

const PI = Math.PI
const r1 = (x: number) => num(round(x, 1), 1)
const r2 = (x: number) => num(round(x, 2), 2)

// ------------------------------------------------------------------ Percentages

const pct_incdec = (level: Level): Question => {
  if (level === 1) {
    const p = pick([10, 20, 25, 50, 5])
    const unit = 100 / (p === 25 ? 25 : p === 50 ? 50 : p === 5 ? 5 : p)
    const amt = unit * int(2, 40)
    const inc = chance()
    const change = (p * amt) / 100
    const res = inc ? amt + change : amt - change
    return q({
      prompt: `${inc ? 'Increase' : 'Decrease'} $${num(amt)} by ${p}%.`,
      answer: numA(res),
      prefix: '$',
      hint: `Find ${p}% of $${num(amt)} first, then ${inc ? 'add it on' : 'take it away'}.`,
      steps: [`${p}% of $${num(amt)} = $${num(change)}`, `$${num(amt)} ${inc ? '+' : MINUS} $${num(change)} = $${num(res)}`],
    })
  }
  if (level === 2) {
    const p = pick([12, 15, 18, 35, 7.5, 2.5, 8, 22])
    const amt = int(2000, 50000) / 100
    const inc = chance()
    const res = round(amt * (1 + (inc ? p : -p) / 100), 2)
    return q({
      prompt: `${inc ? 'Increase' : 'Decrease'} ${money(amt)} by ${num(p)}%. Give your answer to the nearest cent.`,
      answer: numA(res, 2),
      prefix: '$',
      calc: true,
      hint: `Multiplier method: ${inc ? 'increasing' : 'decreasing'} by ${num(p)}% means multiplying by ${num(clean(1 + (inc ? p : -p) / 100))}.`,
      steps: [`Multiplier = 1 ${inc ? '+' : MINUS} ${num(p / 100)} = ${num(clean(1 + (inc ? p : -p) / 100))}`, `${money(amt)} ${TIMES} ${num(clean(1 + (inc ? p : -p) / 100))} = ${money(res)}`],
    })
  }
  const start = pick([100, 200, 400, 500, 800, 1000])
  const p = pick([10, 20, 25, 50])
  const r = (start * (1 + p / 100) * (1 - p / 100))
  return q({
    prompt: `A shop increases the price of a $${start} item by ${p}%. Later, it decreases the new price by ${p}%. What is the final price?`,
    answer: numA(r),
    prefix: '$',
    hint: 'The second percentage is taken of the new price, not the original price.',
    steps: [`After the increase: $${start} ${TIMES} ${num(1 + p / 100)} = $${num(start * (1 + p / 100))}`, `After the decrease: $${num(start * (1 + p / 100))} ${TIMES} ${num(1 - p / 100)} = $${num(r)}`, `The final price is less than $${start}, because the decrease is ${p}% of a bigger amount.`],
  })
}

const pct_change = (level: Level): Question => {
  if (level === 1) {
    const base = pick([20, 25, 40, 50, 80, 200])
    const p = pick([5, 10, 20, 25, 50, 75])
    const newV = base + (base * p) / 100
    if (!Number.isInteger(newV)) return pct_change(1)
    return q({
      prompt: `The number of students in a club grew from ${base} to ${newV}. What is the percentage increase?`,
      answer: numA(p),
      suffix: '%',
      hint: 'Percentage change = change ÷ original amount × 100%.',
      steps: [`Change = ${newV} ${MINUS} ${base} = ${newV - base}`, `${frac(newV - base, base)} ${TIMES} 100% = ${p}%`],
    })
  }
  if (level === 2) {
    const cost = pick([40, 60, 80, 120, 150, 200, 250, 400])
    const p = pick([10, 15, 20, 25, 30, 40, 50])
    const profit = chance()
    const sell = cost * (1 + (profit ? p : -p) / 100)
    if (!Number.isInteger(sell)) return pct_change(2)
    return q({
      prompt: `${name()} bought a second-hand ${pick(['bike', 'skateboard', 'guitar', 'phone'])} for $${cost} and sold it for $${sell}. What was the percentage ${profit ? 'profit' : 'loss'}?`,
      answer: numA(p),
      suffix: '%',
      hint: `Percentage ${profit ? 'profit' : 'loss'} = ${profit ? 'profit' : 'loss'} ÷ cost price × 100%.`,
      steps: [`${profit ? 'Profit' : 'Loss'} = $${Math.abs(sell - cost)}`, `${frac(Math.abs(sell - cost), cost)} ${TIMES} 100% = ${p}%`],
    })
  }
  const from = int(4000, 15000)
  const to = from + int(-900, 1500)
  const pc = ((to - from) / from) * 100
  if (Math.abs(pc) < 0.5) return pct_change(3)
  return q({
    prompt: `The population of a coastal town changed from ${num(from)} to ${num(to)}. Find the percentage ${pc > 0 ? 'increase' : 'decrease'}, correct to 1 decimal place.`,
    answer: numA(Math.abs(pc), 1),
    suffix: '%',
    calc: true,
    hint: 'Divide the change by the original population, then multiply by 100%.',
    steps: [`Change = ${num(Math.abs(to - from))}`, `${frac(num(Math.abs(to - from)), num(from))} ${TIMES} 100% ≈ ${r1(Math.abs(pc))}%`],
  })
}

const pct_discount = (level: Level): Question => {
  if (level === 1) {
    const price = pick([20, 40, 60, 80, 120, 150, 200, 240])
    const p = pick([10, 20, 25, 30, 50])
    const sale = price * (1 - p / 100)
    return q({
      prompt: `A pair of runners normally costs $${price}. They are on sale with ${p}% off. What is the sale price?`,
      answer: numA(sale),
      prefix: '$',
      hint: `Find the discount (${p}% of $${price}), then subtract it.`,
      steps: [`Discount = ${p}% of $${price} = $${num((price * p) / 100)}`, `Sale price = $${price} ${MINUS} $${num((price * p) / 100)} = $${num(sale)}`],
    })
  }
  if (level === 2) {
    const pre = int(1000, 50000) / 100
    if (chance()) {
      return q({
        prompt: `A tradie’s bill is ${money(pre)} before GST. GST of 10% is added. What is the total bill?`,
        answer: numA(round(pre * 1.1, 2), 2),
        prefix: '$',
        calc: true,
        hint: 'Adding 10% GST means multiplying by 1.1.',
        steps: [`GST = 10% of ${money(pre)} = ${money(pre * 0.1)}`, `Total = ${money(pre)} ${TIMES} 1.1 = ${money(round(pre * 1.1, 2))}`],
      })
    }
    return q({
      prompt: `How much GST (10%) is added to an item priced at ${money(pre)} before GST? Give your answer to the nearest cent.`,
      answer: numA(round(pre * 0.1, 2), 2),
      prefix: '$',
      calc: true,
      hint: '10% means divide by 10.',
      steps: [`GST = ${money(pre)} ${DIVIDE} 10 = ${money(round(pre * 0.1, 2))}`],
    })
  }
  const pA = pick([80, 90, 100, 120, 150])
  const dA = pick([10, 15, 20, 25, 30])
  const pB = pA + pick([-10, -5, 5, 10, 15])
  const dB = intExcept(5, 30, [dA])
  const A = pA * (1 - dA / 100)
  const B = pB * (1 - dB / 100)
  if (Math.abs(A - B) < 0.5) return pct_discount(3)
  const better = A < B ? 'Store A' : 'Store B'
  return q({
    prompt: `The same pair of headphones is sold at two stores. Store A: $${pA} with ${dA}% off. Store B: $${pB} with ${dB}% off. Which store is cheaper?`,
    answer: mcFixedA(['Store A', 'Store B'], better),
    calc: true,
    hint: 'Work out the sale price at each store.',
    steps: [`Store A: $${pA} ${TIMES} ${num(1 - dA / 100)} = ${dollars(A)}`, `Store B: $${pB} ${TIMES} ${num(1 - dB / 100)} = ${dollars(B)}`, `${better} is cheaper.`],
  })
}

// ------------------------------------------------------------------ Rates and scale

const hm = (hours: number) => {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h} h ${m} min`
}

const rat_speed = (level: Level): Question => {
  if (level === 1) {
    const t = pick(['S', 'D', 'T'])
    const S = pick([40, 50, 60, 75, 80, 90, 100])
    const T = pick([2, 3, 4, 5])
    if (t === 'S') return q({ prompt: `A car travels ${S * T} km in ${T} hours. What is its average speed?`, answer: numA(S), suffix: 'km/h', hint: 'Speed = distance ÷ time', steps: [`S = ${S * T} ${DIVIDE} ${T} = ${S} km/h`] })
    if (t === 'D') return q({ prompt: `A truck travels at ${S} km/h for ${T} hours. How far does it travel?`, answer: numA(S * T), suffix: 'km', hint: 'Distance = speed × time', steps: [`D = ${S} ${TIMES} ${T} = ${S * T} km`] })
    return q({ prompt: `How long does it take to travel ${S * T} km at ${S} km/h?`, answer: numA(T), suffix: 'hours', hint: 'Time = distance ÷ speed', steps: [`T = ${S * T} ${DIVIDE} ${S} = ${T} hours`] })
  }
  if (level === 2) {
    if (chance()) {
      const mins = pick([15, 20, 30, 45, 12, 10])
      const S = pick([36, 48, 60, 72, 90, 120])
      const D2 = (S * mins) / 60
      return q({
        prompt: `A cyclist rides ${num(D2)} km in ${mins} minutes. What is the average speed in km/h?`,
        answer: numA(S),
        suffix: 'km/h',
        hint: `Change ${mins} minutes into hours first: ${mins} min = ${frac(mins, 60)} h.`,
        steps: 60 % mins === 0
          ? [`${mins} min is ${frac(1, 60 / mins)} of an hour, so in 1 hour the cyclist would ride ${60 / mins} times as far.`, `S = ${num(D2)} ${TIMES} ${60 / mins} = ${S} km/h`]
          : [`${mins} min = ${num(mins / 60)} h`, `S = ${num(D2)} ${DIVIDE} ${num(mins / 60)} = ${S} km/h`],
      })
    }
    const S = pick([60, 80, 90, 100])
    const D2 = S * pick([1.25, 1.5, 2.25, 2.5, 3.75])
    const T = D2 / S
    return q({
      prompt: `A coach travels ${num(D2)} km from Tweed Heads at an average speed of ${S} km/h. How long does the trip take? Give your answer in hours as a decimal.`,
      answer: numA(T),
      suffix: 'hours',
      hint: 'Time = distance ÷ speed',
      steps: [`T = ${num(D2)} ${DIVIDE} ${S} = ${num(T)} hours`, `(${num(T)} h = ${hm(T)})`],
    })
  }
  const s1 = pick([40, 50, 60, 80, 100])
  const t1 = pick([1, 1.5, 2])
  const s2 = pick([60, 70, 90, 110])
  const t2 = pick([0.5, 1, 2])
  const total = s1 * t1 + s2 * t2
  const avg = total / (t1 + t2)
  return q({
    prompt: `A family drives for ${num(t1)} h at ${s1} km/h, then for ${num(t2)} h at ${s2} km/h. What is their average speed for the whole trip? Give your answer correct to 1 decimal place if needed.`,
    answer: numA(avg, 1),
    suffix: 'km/h',
    calc: true,
    hint: 'Average speed = total distance ÷ total time (not the average of the two speeds).',
    steps: [`Distance: ${s1} ${TIMES} ${num(t1)} + ${s2} ${TIMES} ${num(t2)} = ${num(total)} km`, `Time: ${num(t1)} + ${num(t2)} = ${num(t1 + t2)} h`, `Average speed = ${num(total)} ${DIVIDE} ${num(t1 + t2)} ${Number.isInteger(avg * 10) ? '=' : '≈'} ${r1(avg)} km/h`],
  })
}

const rat_convert = (level: Level): Question => {
  if (level === 1) {
    if (chance()) {
      const r = pick([2, 3, 4, 5, 8, 12, 15])
      return q({
        prompt: `Water flows from a hose at ${r} L/min. Write this rate in litres per hour.`,
        answer: numA(r * 60),
        suffix: 'L/h',
        hint: 'There are 60 minutes in an hour.',
        steps: [`${r} ${TIMES} 60 = ${r * 60} L/h`],
      })
    }
    const pk = pick([2.4, 3.5, 4.8, 12, 18.5, 9.9])
    return q({
      prompt: `Cheese costs ${money(pk)} per kilogram. What is the cost in cents per gram?`,
      answer: numA(clean(pk / 10)),
      suffix: 'c/g',
      hint: '$1 = 100 cents and 1 kg = 1000 g.',
      steps: [`${money(pk)}/kg = ${num(clean(pk * 100))} cents per 1000 g`, `${num(clean(pk * 100))} ${DIVIDE} 1000 = ${num(clean(pk / 10))} c/g`],
    })
  }
  if (level === 2) {
    if (chance()) {
      const kmh = pick([36, 54, 72, 90, 18, 60, 100, 110])
      const ms = (kmh * 1000) / 3600
      return q({
        prompt: `Convert ${kmh} km/h to metres per second${Number.isInteger(ms) ? '' : ', correct to 1 decimal place'}.`,
        answer: numA(ms, Number.isInteger(ms) ? undefined : 1),
        suffix: 'm/s',
        hint: '1 km = 1000 m and 1 h = 3600 s. Multiply by 1000 and divide by 3600.',
        steps: [`${kmh} km/h = ${num(kmh * 1000)} m per 3600 s`, `${num(kmh * 1000)} ${DIVIDE} 3600 ${Number.isInteger(ms) ? '=' : '≈'} ${Number.isInteger(ms) ? num(ms) : r1(ms)} m/s`],
      })
    }
    const ms = pick([5, 10, 12, 15, 20, 25, 8])
    return q({
      prompt: `A sprinter’s top speed is ${ms} m/s. Convert this to km/h.`,
      answer: numA(ms * 3.6),
      suffix: 'km/h',
      hint: 'In 1 hour (3600 s) the sprinter would cover 3600 times as many metres. Then change metres to kilometres.',
      steps: [`${ms} m/s ${TIMES} 3600 = ${num(ms * 3600)} m/h`, `${num(ms * 3600)} m/h ${DIVIDE} 1000 = ${num(ms * 3.6)} km/h`],
    })
  }
  const ml = pick([5, 8, 10, 12, 15, 20])
  return q({
    prompt: `A leaking tap drips ${ml} mL of water every minute. How many litres is wasted in one day?`,
    answer: numA(clean((ml * 60 * 24) / 1000)),
    suffix: 'L',
    hint: 'Minutes in a day = 60 × 24. Then change mL to L.',
    steps: [`Minutes in a day: 60 ${TIMES} 24 = 1440`, `${ml} ${TIMES} 1440 = ${num(ml * 1440)} mL`, `${num(ml * 1440)} ${DIVIDE} 1000 = ${num(clean((ml * 1440) / 1000))} L`],
  })
}

const rat_scale = (level: Level): Question => {
  if (level === 1) {
    const sc = pick([50, 100, 200, 500])
    const cm = pick([2, 3, 4.5, 6, 7.5, 8, 12])
    const real = (cm * sc) / 100
    return q({
      prompt: `A house plan is drawn to a scale of 1 : ${sc}. A wall is ${num(cm)} cm long on the plan. How long is the real wall, in metres?`,
      answer: numA(clean(real)),
      suffix: 'm',
      hint: `1 : ${sc} means 1 cm on the plan is ${sc} cm in real life.`,
      steps: [`${num(cm)} ${TIMES} ${sc} = ${num(cm * sc)} cm`, `${num(cm * sc)} cm = ${num(clean(real))} m`],
    })
  }
  if (level === 2) {
    const sc = pick([25000, 50000, 100000])
    const cm = pick([1.5, 2, 3.2, 4, 5.5, 6.8, 7])
    const km = (cm * sc) / 100000
    return q({
      prompt: `On a map with scale 1 : ${num(sc)}, two towns are ${num(cm)} cm apart. What is the real distance in kilometres?`,
      answer: numA(clean(km)),
      suffix: 'km',
      hint: '1 km = 100 000 cm.',
      steps: [`${num(cm)} ${TIMES} ${num(sc)} = ${num(clean(cm * sc))} cm`, `${num(clean(cm * sc))} ${DIVIDE} 100 000 = ${num(clean(km))} km`],
    })
  }
  const sc = pick([25000, 50000, 20000])
  const km = pick([2, 3, 4.5, 5, 7.5, 1.5])
  const cm = (km * 100000) / sc
  return q({
    prompt: `A walking track in Border Ranges National Park is ${num(km)} km long. How long would it be on a map with a scale of 1 : ${num(sc)}? Answer in centimetres.`,
    answer: numA(clean(cm)),
    suffix: 'cm',
    hint: 'Change kilometres to centimetres, then divide by the scale factor.',
    steps: [`${num(km)} km = ${num(km * 100000)} cm`, `${num(km * 100000)} ${DIVIDE} ${num(sc)} = ${num(clean(cm))} cm`],
  })
}

// ------------------------------------------------------------------ Length

const len_perim = (level: Level): Question => {
  const u = pick(['m', 'cm'])
  if (level <= 2) {
    const W = int(8, 18)
    const H = int(7, 15)
    const w = int(2, W - 3)
    const h = int(2, H - 3)
    const P = 2 * (W + H)
    return q({
      prompt: `Find the perimeter of this shape. All angles are right angles.${level === 2 ? ' (Work out any missing sides first.)' : ''}`,
      diagram: D.lShape(W, H, w, h, { W: `${W} ${u}`, H: `${H} ${u}`, a: `${W - w} ${u}`, b: `${H - h} ${u}`, c: level === 1 ? `${w} ${u}` : '', d: level === 1 ? `${h} ${u}` : '' }),
      note: NOT_TO_SCALE,
      answer: numA(P),
      suffix: u,
      hint: 'Perimeter is the total distance around the outside. Add every side.',
      steps: [level === 2 ? `Missing sides: ${W} ${MINUS} ${W - w} = ${w} ${u} and ${H} ${MINUS} ${H - h} = ${h} ${u}` : 'Add all six sides.', `P = ${W} + ${H} + ${W - w} + ${h} + ${w} + ${H - h} = ${P} ${u}`],
    })
  }
  const P = int(30, 90) * 2
  const l = int(Math.ceil(P / 4) + 1, P / 2 - 2)
  const w = P / 2 - l
  return q({
    prompt: `A rectangular paddock has a perimeter of ${P} m. Its length is ${l} m. How wide is it?`,
    answer: numA(w),
    suffix: 'm',
    hint: 'Perimeter = 2 × (length + width). Halve the perimeter first.',
    steps: [`Half the perimeter: ${P} ${DIVIDE} 2 = ${P / 2} m = length + width`, `Width = ${P / 2} ${MINUS} ${l} = ${w} m`],
  })
}

const len_circ = (level: Level): Question => {
  const u = pick(['cm', 'm', 'mm'])
  if (level === 1) {
    const d = int(3, 40)
    return q({
      prompt: `Find the circumference of this circle, correct to 1 decimal place.`,
      diagram: D.circleShape(`${d} ${u}`, 'diameter'),
      answer: numA(PI * d, 1),
      suffix: u,
      calc: true,
      hint: 'C = πd',
      steps: [`C = π ${TIMES} ${d}`, `≈ ${r1(PI * d)} ${u}`],
    })
  }
  if (level === 2) {
    const r = int(2, 25)
    return q({
      prompt: `Find the circumference of this circle, correct to 1 decimal place.`,
      diagram: D.circleShape(`${r} ${u}`, 'radius'),
      answer: numA(2 * PI * r, 1),
      suffix: u,
      calc: true,
      hint: 'C = 2πr (or find the diameter first: d = 2r).',
      steps: [`C = 2 ${TIMES} π ${TIMES} ${r}`, `≈ ${r1(2 * PI * r)} ${u}`],
    })
  }
  if (chance()) {
    const kind = pick(['semi', 'quarter'] as const)
    const r = int(3, 20)
    const P = kind === 'semi' ? PI * r + 2 * r : (PI * r) / 2 + 2 * r
    return q({
      prompt: `Find the perimeter of this ${kind === 'semi' ? 'semicircle' : 'quadrant'}, correct to 1 decimal place.`,
      diagram: D.circleShape(`${r} ${u}`, 'radius', kind),
      answer: numA(P, 1),
      suffix: u,
      calc: true,
      hint: kind === 'semi' ? 'Perimeter = half the circumference + the diameter.' : 'Perimeter = a quarter of the circumference + two radii.',
      steps:
        kind === 'semi'
          ? [`Curved part: ${frac(1, 2)} ${TIMES} 2π ${TIMES} ${r} ≈ ${r2(PI * r)} ${u}`, `Straight part (diameter): ${2 * r} ${u}`, `P ≈ ${r2(PI * r)} + ${2 * r} ≈ ${r1(P)} ${u}`]
          : [`Curved part: ${frac(1, 4)} ${TIMES} 2π ${TIMES} ${r} ≈ ${r2((PI * r) / 2)} ${u}`, `Straight parts: 2 ${TIMES} ${r} = ${2 * r} ${u}`, `P ≈ ${r2((PI * r) / 2)} + ${2 * r} ≈ ${r1(P)} ${u}`],
    })
  }
  const C = int(30, 200)
  return q({
    prompt: `A circular running track has a circumference of ${C} m. What is its diameter, correct to 1 decimal place?`,
    answer: numA(C / PI, 1),
    suffix: 'm',
    calc: true,
    hint: 'C = πd, so d = C ÷ π.',
    steps: [`d = ${C} ${DIVIDE} π ≈ ${r1(C / PI)} m`],
  })
}

// ------------------------------------------------------------------ Area

const area_trap = (level: Level): Question => {
  const u = pick(['cm', 'm'])
  const a = int(3, 12)
  const b = a + int(2, 10)
  const h = int(2, 12)
  const A = ((a + b) * h) / 2
  if (level <= 2) {
    const dec = level === 2
    const aa = dec ? a + 0.5 : a
    const AA = ((aa + b) * h) / 2
    return q({
      prompt: 'Find the area of the trapezium.',
      diagram: D.trapezium(aa, b, h, `${num(aa)} ${u}`, `${b} ${u}`, `${h} ${u}`),
      note: NOT_TO_SCALE,
      answer: numA(AA),
      suffix: `${u}²`,
      hint: 'A = ½ (a + b) h, where a and b are the parallel sides.',
      steps: [`A = ${frac(1, 2)} ${TIMES} (${num(aa)} + ${b}) ${TIMES} ${h}`, `= ${frac(1, 2)} ${TIMES} ${num(aa + b)} ${TIMES} ${h}`, `= ${num(AA)} ${u}²`],
    })
  }
  return q({
    prompt: `A trapezium has parallel sides of ${a} ${u} and ${b} ${u}, and an area of ${num(A)} ${u}². What is its perpendicular height?`,
    answer: numA(h),
    suffix: u,
    hint: 'Substitute into A = ½ (a + b) h and solve for h.',
    steps: [`${num(A)} = ${frac(1, 2)} ${TIMES} (${a} + ${b}) ${TIMES} ${v('h')}`, `${num(A)} = ${num((a + b) / 2)}${v('h')}`, `${v('h')} = ${h} ${u}`],
  })
}

const area_rk = (level: Level): Question => {
  const u = pick(['cm', 'm'])
  const x = int(4, 20)
  const y = int(3, 16)
  const kite = chance()
  if (level <= 2) {
    const X = level === 2 ? x + 0.5 : x
    const A = (X * y) / 2
    return q({
      prompt: `Find the area of this ${kite ? 'kite' : 'rhombus'}.`,
      diagram: D.diagonalsShape(X, y, `${num(X)} ${u}`, `${y} ${u}`, kite),
      note: NOT_TO_SCALE,
      answer: numA(A),
      suffix: `${u}²`,
      hint: 'A = ½ × x × y, where x and y are the lengths of the diagonals.',
      steps: [`A = ${frac(1, 2)} ${TIMES} ${num(X)} ${TIMES} ${y}`, `= ${num(A)} ${u}²`],
    })
  }
  const A = (x * y) / 2
  return q({
    prompt: `A ${kite ? 'kite' : 'rhombus'} has an area of ${num(A)} ${u}². One diagonal is ${x} ${u} long. How long is the other diagonal?`,
    answer: numA(y),
    suffix: u,
    hint: 'A = ½xy. Substitute and solve.',
    steps: [`${num(A)} = ${frac(1, 2)} ${TIMES} ${x} ${TIMES} ${v('y')}`, `${num(A)} = ${num(x / 2)}${v('y')}`, `${v('y')} = ${y} ${u}`],
  })
}

const area_circle = (level: Level): Question => {
  const u = pick(['cm', 'm'])
  if (level === 1) {
    const r = int(2, 20)
    return q({
      prompt: 'Find the area of this circle, correct to 1 decimal place.',
      diagram: D.circleShape(`${r} ${u}`, 'radius'),
      answer: numA(PI * r * r, 1),
      suffix: `${u}²`,
      calc: true,
      hint: 'A = πr²',
      steps: [`A = π ${TIMES} ${r}<sup>2</sup>`, `= π ${TIMES} ${r * r} ≈ ${r1(PI * r * r)} ${u}²`],
    })
  }
  if (level === 2) {
    const d = int(4, 40)
    return q({
      prompt: 'Find the area of this circle, correct to 1 decimal place.',
      diagram: D.circleShape(`${d} ${u}`, 'diameter'),
      answer: numA((PI * d * d) / 4, 1),
      suffix: `${u}²`,
      calc: true,
      hint: 'Halve the diameter to get the radius, then use A = πr².',
      steps: [`r = ${d} ${DIVIDE} 2 = ${num(d / 2)} ${u}`, `A = π ${TIMES} ${num(d / 2)}<sup>2</sup> ≈ ${r1((PI * d * d) / 4)} ${u}²`],
    })
  }
  const kind = pick(['semi', 'quarter'] as const)
  const r = int(3, 20)
  const A = kind === 'semi' ? (PI * r * r) / 2 : (PI * r * r) / 4
  return q({
    prompt: `Find the area of this ${kind === 'semi' ? 'semicircle' : 'quadrant'}, correct to 1 decimal place.`,
    diagram: D.circleShape(`${r} ${u}`, 'radius', kind),
    answer: numA(A, 1),
    suffix: `${u}²`,
    calc: true,
    hint: kind === 'semi' ? 'A semicircle is half a circle: A = ½πr².' : 'A quadrant is a quarter of a circle: A = ¼πr².',
    steps: [`A = ${kind === 'semi' ? frac(1, 2) : frac(1, 4)} ${TIMES} π ${TIMES} ${r}<sup>2</sup>`, `≈ ${r1(A)} ${u}²`],
  })
}

const area_composite = (level: Level): Question => {
  if (level === 1) {
    const w = int(6, 14)
    const h = int(4, 10)
    const rf = int(2, 6)
    const A = w * h + (w * rf) / 2
    return q({
      prompt: 'Find the area of this shape (a rectangle with a triangle on top).',
      diagram: D.house(w, h, rf, `${w} m`, `${h} m`, `${rf} m`),
      note: NOT_TO_SCALE,
      answer: numA(A),
      suffix: 'm²',
      hint: 'Add the area of the rectangle and the area of the triangle.',
      steps: [`Rectangle: ${w} ${TIMES} ${h} = ${w * h} m²`, `Triangle: ${frac(1, 2)} ${TIMES} ${w} ${TIMES} ${rf} = ${num((w * rf) / 2)} m²`, `Total = ${num(A)} m²`],
    })
  }
  if (level === 2) {
    const w = int(6, 20)
    const h = pick([4, 6, 8, 10, 12])
    const A = w * h + (PI * (h / 2) ** 2) / 2
    return q({
      prompt: 'Find the area of this shape, correct to 1 decimal place.',
      diagram: D.rectSemi(w, h, `${w} cm`, `${h} cm`),
      note: NOT_TO_SCALE,
      answer: numA(A, 1),
      suffix: 'cm²',
      calc: true,
      hint: `The semicircle has diameter ${h} cm, so its radius is ${h / 2} cm.`,
      steps: [`Rectangle: ${w} ${TIMES} ${h} = ${w * h} cm²`, `Semicircle: ${frac(1, 2)} ${TIMES} π ${TIMES} ${h / 2}<sup>2</sup> ≈ ${r2((PI * (h / 2) ** 2) / 2)} cm²`, `Total ≈ ${r1(A)} cm²`],
    })
  }
  const R = int(6, 15)
  const r = int(2, R - 2)
  const A = PI * (R * R - r * r)
  return q({
    prompt: `A circular garden bed has a radius of ${R} m. A circular pond of radius ${r} m sits in the middle. Find the area of the garden bed (the ring), correct to 1 decimal place.`,
    diagram: D.annulus(R, r, `${R} m`, `${r} m`),
    note: NOT_TO_SCALE,
    answer: numA(A, 1),
    suffix: 'm²',
    calc: true,
    hint: 'Area of ring = area of big circle − area of small circle.',
    steps: [`Big circle: π ${TIMES} ${R}<sup>2</sup> ≈ ${r2(PI * R * R)} m²`, `Small circle: π ${TIMES} ${r}<sup>2</sup> ≈ ${r2(PI * r * r)} m²`, `Ring ≈ ${r1(A)} m²`],
  })
}

// ------------------------------------------------------------------ Volume

const vol_prism = (level: Level): Question => {
  if (level === 1) {
    const A = int(6, 60)
    const h = int(2, 20)
    return q({
      prompt: `A prism has a cross-sectional area of ${A} cm² and a length of ${h} cm. What is its volume?`,
      answer: numA(A * h),
      suffix: 'cm³',
      hint: 'Volume of a prism = area of cross-section × length (V = Ah).',
      steps: [`V = ${A} ${TIMES} ${h} = ${A * h} cm³`],
    })
  }
  if (level === 2) {
    const b = int(3, 12)
    const h = int(3, 10)
    const l = int(5, 20)
    const V = ((b * h) / 2) * l
    return q({
      prompt: 'Find the volume of this triangular prism.',
      diagram: D.triPrism(b, h, l, `${b} cm`, `${h} cm`, `${l} cm`),
      note: NOT_TO_SCALE,
      answer: numA(V),
      suffix: 'cm³',
      hint: 'The cross-section is a triangle. Find its area, then multiply by the length.',
      steps: [`Cross-section area: ${frac(1, 2)} ${TIMES} ${b} ${TIMES} ${h} = ${num((b * h) / 2)} cm²`, `V = ${num((b * h) / 2)} ${TIMES} ${l} = ${num(V)} cm³`],
    })
  }
  const a = int(2, 8)
  const b = a + int(2, 8)
  const h = int(2, 8)
  const l = int(5, 25)
  const A = ((a + b) * h) / 2
  return q({
    prompt: `A garden edging block is a prism with a trapezium cross-section. The parallel sides are ${a} cm and ${b} cm, the height of the trapezium is ${h} cm, and the block is ${l} cm long. Find its volume.`,
    answer: numA(A * l),
    suffix: 'cm³',
    hint: 'Area of trapezium = ½(a + b)h. Then V = Ah.',
    steps: [`Cross-section: ${frac(1, 2)} ${TIMES} (${a} + ${b}) ${TIMES} ${h} = ${num(A)} cm²`, `V = ${num(A)} ${TIMES} ${l} = ${num(A * l)} cm³`],
  })
}

const vol_cyl = (level: Level): Question => {
  if (level === 1) {
    const r = int(2, 12)
    const h = int(3, 25)
    return q({
      prompt: 'Find the volume of this cylinder, correct to 1 decimal place.',
      diagram: D.cylinder(r, h, `${r} cm`, `${h} cm`),
      note: NOT_TO_SCALE,
      answer: numA(PI * r * r * h, 1),
      suffix: 'cm³',
      calc: true,
      hint: 'V = πr²h',
      steps: [`V = π ${TIMES} ${r}<sup>2</sup> ${TIMES} ${h}`, `≈ ${r1(PI * r * r * h)} cm³`],
    })
  }
  if (level === 2) {
    const d = int(4, 30)
    const h = int(3, 30)
    return q({
      prompt: 'Find the volume of this cylinder, correct to 1 decimal place.',
      diagram: D.cylinder(d / 2, h, `${d} m`, `${h} m`, true),
      note: NOT_TO_SCALE,
      answer: numA((PI * d * d * h) / 4, 1),
      suffix: 'm³',
      calc: true,
      hint: 'The diameter is given. Halve it to get the radius.',
      steps: [`r = ${num(d / 2)} m`, `V = π ${TIMES} ${num(d / 2)}<sup>2</sup> ${TIMES} ${h} ≈ ${r1((PI * d * d * h) / 4)} m³`],
    })
  }
  const r = int(4, 15)
  const h = int(10, 40)
  const V = PI * r * r * h
  return q({
    prompt: `A cylindrical water bottle has a radius of ${r} cm and a height of ${h} cm. How many litres does it hold? Give your answer correct to 2 decimal places.`,
    answer: numA(V / 1000, 2),
    suffix: 'L',
    calc: true,
    hint: 'Find the volume in cm³, then use 1000 cm³ = 1 L.',
    steps: [`V = π ${TIMES} ${r}<sup>2</sup> ${TIMES} ${h} ≈ ${r1(V)} cm³`, `${r1(V)} cm³ = ${r1(V)} mL ≈ ${r2(V / 1000)} L`],
  })
}

const vol_units = (level: Level): Question => {
  if (level === 1) {
    const [from, to, f] = pick([
      ['L', 'mL', 1000],
      ['mL', 'L', 0.001],
      ['kL', 'L', 1000],
      ['L', 'kL', 0.001],
    ] as [string, string, number][])
    const val = f > 1 ? pick([2, 3.5, 0.75, 1.25, 4, 0.2]) : pick([2500, 750, 1200, 300, 5000, 45])
    return q({
      prompt: `Convert ${num(val)} ${from} to ${to}.`,
      answer: numA(clean(val * f)),
      suffix: to,
      hint: '1 L = 1000 mL and 1 kL = 1000 L.',
      steps: [f > 1 ? `${num(val)} ${TIMES} 1000 = ${num(clean(val * f))} ${to}` : `${num(val)} ${DIVIDE} 1000 = ${num(clean(val * f))} ${to}`],
    })
  }
  if (level === 2) {
    const [from, to, f, fact] = pick([
      ['cm³', 'mL', 1, '1 cm³ = 1 mL'],
      ['cm³', 'L', 0.001, '1000 cm³ = 1 L'],
      ['m³', 'kL', 1, '1 m³ = 1 kL'],
      ['m³', 'L', 1000, '1 m³ = 1000 L'],
      ['L', 'cm³', 1000, '1 L = 1000 cm³'],
    ] as [string, string, number, string][])
    const val = pick([2, 4.5, 250, 1500, 0.6, 12])
    return q({
      prompt: `Convert ${num(val)} ${from} to ${to}.`,
      answer: numA(clean(val * f)),
      suffix: to,
      hint: fact,
      steps: [fact, `${num(val)} ${from} = ${num(clean(val * f))} ${to}`],
    })
  }
  const l = pick([8, 10, 12, 25])
  const w = pick([4, 5, 6, 10])
  const d = pick([1.2, 1.5, 1.8, 2])
  const V = l * w * d
  return q({
    prompt: `A backyard pool is a rectangular prism ${l} m long, ${w} m wide and ${num(d)} m deep. How many kilolitres of water does it hold when full?`,
    answer: numA(clean(V)),
    suffix: 'kL',
    hint: '1 m³ = 1 kL',
    steps: [`V = ${l} ${TIMES} ${w} ${TIMES} ${num(d)} = ${num(clean(V))} m³`, `= ${num(clean(V))} kL`],
  })
}

// ------------------------------------------------------------------ Topics

export const Y8B: Topic[] = [
  {
    id: 'y8-percentages',
    year: 8,
    title: 'Percentages',
    strand: 'Number and algebra',
    outcomes: ['MA4-FRC-C-01'],
    blurb: 'Percentage increase and decrease, percentage change, discounts and GST.',
    colour: 145,
    skills: [
      {
        id: 'y8-pct-incdec',
        title: 'Percentage increase and decrease',
        outcomes: ['MA4-FRC-C-01'],
        summary: 'Increase or decrease an amount by a percentage.',
        learn: {
          intro: '<p>To increase by a percentage, find the percentage and add it on. To decrease, take it away. Or use a multiplier.</p>',
          keyPoints: ['Increase by 15%: multiply by 1.15', 'Decrease by 15%: multiply by 0.85', 'A second percentage change applies to the new amount.'],
        },
        gen: pct_incdec,
        levels: { 1: 'Mental percentages', 2: 'Multiplier with a calculator', 3: 'Successive changes' },
      },
      {
        id: 'y8-pct-change',
        title: 'Percentage change, profit and loss',
        outcomes: ['MA4-FRC-C-01'],
        summary: 'Calculate percentage increase, decrease, profit and loss.',
        learn: {
          intro: '<p>Percentage change = change ÷ original amount × 100%.</p>',
          keyPoints: ['Always divide by the original (starting) amount.', 'Percentage profit or loss is calculated on the cost price.'],
        },
        gen: pct_change,
        levels: { 1: 'Whole-number increases', 2: 'Profit and loss', 3: 'Rounded answers' },
      },
      {
        id: 'y8-pct-discount',
        title: 'Discounts and GST',
        outcomes: ['MA4-FRC-C-01'],
        summary: 'Calculate discounts and the 10% goods and services tax.',
        learn: {
          intro: '<p>A discount reduces a price. GST (goods and services tax) adds 10% to many prices in Australia.</p>',
          keyPoints: ['25% off $80: discount $20, sale price $60.', 'Add GST: multiply by 1.1.', 'Compare deals by working out each final price.'],
        },
        gen: pct_discount,
        levels: { 1: 'Sale prices', 2: 'GST', 3: 'Compare deals' },
      },
    ],
  },
  {
    id: 'y8-rates',
    year: 8,
    title: 'Rates and scale',
    strand: 'Number and algebra',
    outcomes: ['MA4-RAT-C-01'],
    blurb: 'Speed, distance and time; converting rates; scale drawings and maps.',
    colour: 55,
    skills: [
      {
        id: 'y8-rat-speed',
        title: 'Speed, distance and time',
        outcomes: ['MA4-RAT-C-01'],
        summary: 'Use S = D ÷ T, including time in minutes and average speed.',
        learn: {
          intro: '<p>Speed is a rate: distance per unit of time.</p>',
          keyPoints: ['S = D ÷ T, D = S × T, T = D ÷ S', 'Change minutes to hours by dividing by 60: 45 min = 0.75 h.', 'Average speed for a trip = total distance ÷ total time.'],
        },
        gen: rat_speed,
        levels: { 1: 'Whole hours', 2: 'Minutes and decimal hours', 3: 'Average speed of a journey' },
      },
      {
        id: 'y8-rat-convert',
        title: 'Converting rates',
        outcomes: ['MA4-RAT-C-01'],
        summary: 'Convert rates between units.',
        learn: {
          intro: '<p>Convert each part of the rate separately.</p>',
          keyPoints: ['L/min → L/h: × 60', 'km/h → m/s: × 1000 ÷ 3600 (or ÷ 3.6)', 'm/s → km/h: × 3.6'],
        },
        gen: rat_convert,
        levels: { 1: 'Simple conversions', 2: 'km/h and m/s', 3: 'Multi-step rates' },
      },
      {
        id: 'y8-rat-scale',
        title: 'Scale drawings and maps',
        outcomes: ['MA4-RAT-C-01'],
        summary: 'Use a scale ratio to find real or drawn lengths.',
        learn: {
          intro: '<p>A scale of 1 : 50 000 means 1 cm on the map represents 50 000 cm (500 m) in real life.</p>',
          keyPoints: ['Map → real: multiply by the scale factor.', 'Real → map: divide by the scale factor.', 'Convert units carefully: 1 m = 100 cm, 1 km = 100 000 cm.'],
        },
        gen: rat_scale,
        levels: { 1: 'Plans', 2: 'Maps: map to real', 3: 'Maps: real to map' },
      },
    ],
  },
  {
    id: 'y8-length',
    year: 8,
    title: 'Length and circles',
    strand: 'Measurement and space',
    outcomes: ['MA4-LEN-C-01'],
    blurb: 'Perimeter of composite shapes and circumference of circles.',
    colour: 95,
    skills: [
      {
        id: 'y8-len-perim',
        title: 'Perimeter',
        outcomes: ['MA4-LEN-C-01'],
        summary: 'Find perimeters, including missing side lengths.',
        learn: {
          intro: '<p>Perimeter is the distance around the outside of a shape.</p>',
          keyPoints: ['Find any missing sides first.', 'For a rectangle, P = 2(l + w).'],
        },
        gen: len_perim,
        levels: { 1: 'All sides given', 2: 'Missing sides', 3: 'Working backwards' },
      },
      {
        id: 'y8-len-circ',
        title: 'Circumference',
        outcomes: ['MA4-LEN-C-01'],
        summary: 'Find the circumference of circles and perimeters of sectors.',
        learn: {
          intro: '<p>The <b>circumference</b> is the perimeter of a circle. For every circle, C ÷ d = π ≈ 3.14159…</p>',
          keyPoints: ['C = πd or C = 2πr', 'Semicircle perimeter = ½πd + d', 'Quadrant perimeter = ½πr + 2r', 'Use the π key on your calculator and round at the end.'],
        },
        gen: len_circ,
        levels: { 1: 'From the diameter', 2: 'From the radius', 3: 'Semicircles, quadrants, working backwards' },
      },
    ],
  },
  {
    id: 'y8-area',
    year: 8,
    title: 'Area',
    strand: 'Measurement and space',
    outcomes: ['MA4-ARE-C-01'],
    blurb: 'Areas of trapeziums, rhombuses, kites, circles and composite shapes.',
    colour: 38,
    skills: [
      {
        id: 'y8-area-trap',
        title: 'Area of a trapezium',
        outcomes: ['MA4-ARE-C-01'],
        summary: 'Use A = ½(a + b)h.',
        learn: {
          intro: '<p>A trapezium has one pair of parallel sides, <i>a</i> and <i>b</i>. Its area is A = ½(<i>a</i> + <i>b</i>)<i>h</i>.</p>',
          keyPoints: ['h is the perpendicular distance between the parallel sides.', 'Add the parallel sides first.'],
        },
        gen: area_trap,
        levels: { 1: 'Whole numbers', 2: 'Decimals', 3: 'Find the height' },
      },
      {
        id: 'y8-area-rk',
        title: 'Area of a rhombus and kite',
        outcomes: ['MA4-ARE-C-01'],
        summary: 'Use the diagonals: A = ½xy.',
        learn: {
          intro: '<p>For a rhombus or a kite, A = ½<i>xy</i>, where <i>x</i> and <i>y</i> are the lengths of the diagonals.</p>',
          keyPoints: ['The diagonals of a rhombus and a kite meet at right angles.'],
        },
        gen: area_rk,
        levels: { 1: 'Whole numbers', 2: 'Decimals', 3: 'Find a diagonal' },
      },
      {
        id: 'y8-area-circle',
        title: 'Area of a circle',
        outcomes: ['MA4-ARE-C-01'],
        summary: 'Use A = πr², including semicircles and quadrants.',
        learn: {
          intro: '<p>The area of a circle is A = π<i>r</i><sup>2</sup>.</p>',
          keyPoints: ['If you are given the diameter, halve it first.', 'Semicircle: ½πr². Quadrant: ¼πr².'],
        },
        gen: area_circle,
        levels: { 1: 'From the radius', 2: 'From the diameter', 3: 'Semicircles and quadrants' },
      },
      {
        id: 'y8-area-composite',
        title: 'Composite areas',
        outcomes: ['MA4-ARE-C-01'],
        summary: 'Find areas of shapes made from rectangles, triangles and circles.',
        learn: {
          intro: '<p>Split the shape into parts you know, then add — or subtract the part that is missing.</p>',
          keyPoints: ['A ring = big circle − small circle.', 'Round only at the very end.'],
        },
        gen: area_composite,
        levels: { 1: 'Rectangle and triangle', 2: 'Rectangle and semicircle', 3: 'Rings' },
      },
    ],
  },
  {
    id: 'y8-volume',
    year: 8,
    title: 'Volume and capacity',
    strand: 'Measurement and space',
    outcomes: ['MA4-VOL-C-01'],
    blurb: 'Volume of prisms and cylinders; units of volume and capacity.',
    colour: 205,
    skills: [
      {
        id: 'y8-vol-prism',
        title: 'Volume of prisms',
        outcomes: ['MA4-VOL-C-01'],
        summary: 'Use V = Ah for any right prism.',
        learn: {
          intro: '<p>A <b>prism</b> has the same cross-section all the way through. Volume = area of cross-section × length: V = A<i>h</i>.</p>',
          keyPoints: ['Find the area of the cross-section first (rectangle, triangle, trapezium…).'],
        },
        gen: vol_prism,
        levels: { 1: 'Cross-section given', 2: 'Triangular prisms', 3: 'Trapezium prisms' },
      },
      {
        id: 'y8-vol-cyl',
        title: 'Volume of cylinders',
        outcomes: ['MA4-VOL-C-01'],
        summary: 'Use V = πr²h.',
        learn: {
          intro: '<p>A cylinder is like a prism with a circular cross-section: V = π<i>r</i><sup>2</sup><i>h</i>.</p>',
          keyPoints: ['Halve the diameter to find the radius.', '1000 cm³ = 1 L'],
        },
        gen: vol_cyl,
        levels: { 1: 'From the radius', 2: 'From the diameter', 3: 'Capacity in litres' },
      },
      {
        id: 'y8-vol-units',
        title: 'Units of volume and capacity',
        outcomes: ['MA4-VOL-C-01'],
        summary: 'Convert between mL, L, kL, cm³ and m³.',
        learn: {
          intro: '<p>Volume units and capacity units are linked.</p>',
          keyPoints: ['1 cm³ = 1 mL', '1000 cm³ = 1 L', '1 m³ = 1000 L = 1 kL'],
        },
        gen: vol_units,
        levels: { 1: 'mL, L and kL', 2: 'Volume to capacity', 3: 'Pools and tanks' },
      },
    ],
  },
]
