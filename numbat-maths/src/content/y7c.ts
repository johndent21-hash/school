// Year 7 (Stage 4) — Area and volume, Number plane, Data, Probability, Ratios and rates
import type { Level, Question, Topic } from '@/lib/maths/types'
import {
  D, L, MINUS, TIMES, DIVIDE, bnum, chance, clean, frac, fracA, fracS, gcd, int, intExcept, mcA, mcFixedA, nonZero, num,
  numA, pick, pointA, q, ratioA, sample, shuffle, exprA, v, ex, lin, money, NOT_TO_SCALE, round, name, sup, signed, ordinal,
} from './helpers'

const sq = (u: string) => u + '²'
const cu = (u: string) => u + '³'

// ------------------------------------------------------------------ Area

const area_rect = (level: Level): Question => {
  const u = pick(['cm', 'm', 'mm'])
  if (level === 1) {
    const square = chance(0.3)
    const w = int(3, 15)
    const h = square ? w : intExcept(2, 12, [w])
    return q({
      prompt: `Find the area of this ${square ? 'square' : 'rectangle'}.`,
      diagram: D.rectangle(w, h, `${w} ${u}`, square ? '' : `${h} ${u}`, square),
      answer: numA(w * h),
      suffix: sq(u),
      hint: square ? 'Area of a square = side × side' : 'Area of a rectangle = length × width',
      steps: [square ? `A = ${w} ${TIMES} ${w}` : `A = ${w} ${TIMES} ${h}`, `= ${w * h} ${sq(u)}`],
    })
  }
  if (level === 2) {
    const w = int(5, 25) / (chance() ? 1 : 2)
    const h = int(3, 18)
    return q({
      prompt: `A rectangular ${pick(['garden bed', 'poster', 'rug', 'tile', 'sports field'])} is ${num(w)} ${u} long and ${h} ${u} wide. What is its area?`,
      answer: numA(clean(w * h)),
      suffix: sq(u),
      hint: 'Area of a rectangle = length × width',
      steps: [`A = ${num(w)} ${TIMES} ${h}`, `= ${num(clean(w * h))} ${sq(u)}`],
    })
  }
  if (chance()) {
    const w = int(4, 15)
    const l = int(5, 20)
    return q({
      prompt: `A rectangle has an area of ${w * l} ${sq(u)} and a width of ${w} ${u}. What is its length?`,
      answer: numA(l),
      suffix: u,
      hint: 'Area = length × width, so length = area ÷ width.',
      steps: [`${w * l} = length ${TIMES} ${w}`, `length = ${w * l} ${DIVIDE} ${w} = ${l} ${u}`],
    })
  }
  const s = int(4, 12)
  return q({
    prompt: `A square has a perimeter of ${4 * s} ${u}. What is its area?`,
    answer: numA(s * s),
    suffix: sq(u),
    hint: 'Find the side length first: a square has 4 equal sides.',
    steps: [`Side = ${4 * s} ${DIVIDE} 4 = ${s} ${u}`, `Area = ${s} ${TIMES} ${s} = ${s * s} ${sq(u)}`],
  })
}

const area_tri_para = (level: Level): Question => {
  const u = pick(['cm', 'm'])
  if (level === 1) {
    const b = int(4, 16)
    const h = int(3, 12)
    if ((b * h) % 2 !== 0 && chance(0.6)) return area_tri_para(1)
    return q({
      prompt: 'Find the area of the triangle.',
      diagram: D.triangleBH(b, h, `${b} ${u}`, `${h} ${u}`, pick([0.25, 0.4, 0.6])),
      note: NOT_TO_SCALE,
      answer: numA((b * h) / 2),
      suffix: sq(u),
      hint: `Area of a triangle = ${frac(1, 2)} × base × perpendicular height`,
      steps: [`A = ${frac(1, 2)} ${TIMES} ${b} ${TIMES} ${h}`, `= ${num((b * h) / 2)} ${sq(u)}`],
    })
  }
  if (level === 2) {
    const b = int(5, 16)
    const h = int(3, 12)
    const slant = h + int(1, 4)
    return q({
      prompt: 'Find the area of the parallelogram.',
      diagram: D.parallelogram(b, h, `${b} ${u}`, `${h} ${u}`, `${slant} ${u}`),
      note: NOT_TO_SCALE,
      answer: numA(b * h),
      suffix: sq(u),
      hint: 'Area of a parallelogram = base × perpendicular height. The slanted side is not the height.',
      steps: [`Use the perpendicular height (${h} ${u}), not the slanted side (${slant} ${u}).`, `A = ${b} ${TIMES} ${h} = ${b * h} ${sq(u)}`],
    })
  }
  const b = int(6, 20)
  const h = int(4, 14)
  const s1 = h + int(1, 5)
  const s2 = h + int(2, 7)
  return q({
    prompt: 'Find the area of the triangle. (Choose the measurements you need carefully.)',
    diagram: D.triangleBH(b, h, `${b} ${u}`, `${h} ${u}`, 0.35, [`${s1} ${u}`, `${s2} ${u}`]),
    note: NOT_TO_SCALE,
    answer: numA((b * h) / 2),
    suffix: sq(u),
    hint: 'The height must be perpendicular (at right angles) to the base.',
    steps: [`The base is ${b} ${u} and the perpendicular height is ${h} ${u}. The slanted sides are not needed.`, `A = ${frac(1, 2)} ${TIMES} ${b} ${TIMES} ${h} = ${num((b * h) / 2)} ${sq(u)}`],
  })
}

const area_composite = (level: Level): Question => {
  const u = pick(['m', 'cm'])
  if (level <= 2) {
    const W = int(8, 16)
    const H = int(7, 14)
    const w = int(2, W - 3)
    const h = int(2, H - 3)
    const area = W * H - w * h
    return q({
      prompt: `Find the area of this shape. All angles are right angles.${level === 2 ? ' (Two side lengths are not marked: work them out first.)' : ''}`,
      diagram: D.lShape(W, H, w, h, { W: `${W} ${u}`, H: `${H} ${u}`, a: `${W - w} ${u}`, b: `${H - h} ${u}`, c: level === 1 ? `${w} ${u}` : '', d: level === 1 ? `${h} ${u}` : '' }),
      note: NOT_TO_SCALE,
      answer: numA(area),
      suffix: sq(u),
      hint: 'Either split the shape into two rectangles, or find the area of the big rectangle and subtract the missing corner.',
      steps: [`Big rectangle: ${W} ${TIMES} ${H} = ${W * H} ${sq(u)}`, `Missing corner: ${w} ${TIMES} ${h} = ${w * h} ${sq(u)} (its sides are ${W} ${MINUS} ${W - w} = ${w} and ${H} ${MINUS} ${H - h} = ${h})`, `Area = ${W * H} ${MINUS} ${w * h} = ${area} ${sq(u)}`],
    })
  }
  const W = int(10, 30)
  const H = int(8, 20)
  const pw = int(2, Math.floor(W / 2))
  const ph = int(2, Math.floor(H / 2))
  return q({
    prompt: `A rectangular backyard is ${W} m by ${H} m. A rectangular pool ${pw} m by ${ph} m is built in it, and the rest is covered in lawn. What area of lawn is there?`,
    answer: numA(W * H - pw * ph),
    suffix: 'm²',
    hint: 'Lawn area = yard area − pool area.',
    steps: [`Yard: ${W} ${TIMES} ${H} = ${W * H} m²`, `Pool: ${pw} ${TIMES} ${ph} = ${pw * ph} m²`, `Lawn: ${W * H} ${MINUS} ${pw * ph} = ${W * H - pw * ph} m²`],
  })
}

const area_units = (level: Level): Question => {
  const conv: [string, string, number][] = L(
    level,
    [
      ['cm²', 'mm²', 100],
      ['m²', 'cm²', 10000],
    ],
    [
      ['mm²', 'cm²', 1 / 100],
      ['cm²', 'm²', 1 / 10000],
      ['ha', 'm²', 10000],
      ['m²', 'ha', 1 / 10000],
    ],
    [
      ['km²', 'ha', 100],
      ['ha', 'km²', 1 / 100],
      ['km²', 'm²', 1000000],
    ],
  )
  const [from, to, f] = pick(conv)
  const val = f > 1 ? pick([2, 3, 5, 7, 12, 0.5, 1.5, 2.4, 0.08]) : pick([500, 1200, 25000, 35000, 800, 64000, 150])
  const res = clean(val * f)
  const facts: Record<string, string> = {
    'cm²mm²': '1 cm² = 10 mm × 10 mm = 100 mm²',
    'm²cm²': '1 m² = 100 cm × 100 cm = 10 000 cm²',
    'mm²cm²': '100 mm² = 1 cm²',
    'cm²m²': '10 000 cm² = 1 m²',
    'ham²': '1 ha = 10 000 m² (a square 100 m by 100 m)',
    'm²ha': '10 000 m² = 1 ha',
    'km²ha': '1 km² = 100 ha',
    'hakm²': '100 ha = 1 km²',
    'km²m²': '1 km² = 1000 m × 1000 m = 1 000 000 m²',
  }
  return q({
    prompt: `Convert ${num(val)} ${from} to ${to}.`,
    answer: numA(res),
    suffix: to,
    hint: facts[from + to],
    steps: [facts[from + to], f > 1 ? `${num(val)} ${TIMES} ${num(f)} = ${num(res)} ${to}` : `${num(val)} ${DIVIDE} ${num(1 / f)} = ${num(res)} ${to}`],
  })
}

const vol_prism = (level: Level): Question => {
  if (level === 1) {
    const u = pick(['cm', 'm'])
    const l = int(2, 12)
    const w = int(2, 9)
    const h = int(2, 10)
    return q({
      prompt: 'Find the volume of this rectangular prism.',
      diagram: D.rectPrism(l, w, h, `${l} ${u}`, `${w} ${u}`, `${h} ${u}`),
      note: NOT_TO_SCALE,
      answer: numA(l * w * h),
      suffix: cu(u),
      hint: 'Volume = length × width × height',
      steps: [`V = ${l} ${TIMES} ${w} ${TIMES} ${h}`, `= ${l * w * h} ${cu(u)}`],
    })
  }
  if (level === 2) {
    const l = pick([30, 40, 50, 60, 80, 100])
    const w = pick([20, 25, 30, 40])
    const h = pick([20, 25, 30, 40, 50])
    const V = l * w * h
    return q({
      prompt: `A fish tank is a rectangular prism ${l} cm long, ${w} cm wide and ${h} cm high. How many litres of water does it hold when full?`,
      answer: numA(V / 1000),
      suffix: 'L',
      hint: '1 cm³ = 1 mL and 1000 mL = 1 L.',
      steps: [`V = ${l} ${TIMES} ${w} ${TIMES} ${h} = ${num(V)} cm³`, `${num(V)} cm³ = ${num(V)} mL`, `${num(V)} ${DIVIDE} 1000 = ${num(V / 1000)} L`],
    })
  }
  if (chance()) {
    const l = int(3, 12)
    const w = int(2, 10)
    const h = int(2, 10)
    return q({
      prompt: `A rectangular prism has a volume of ${l * w * h} cm³. Its length is ${l} cm and its width is ${w} cm. What is its height?`,
      answer: numA(h),
      suffix: 'cm',
      hint: 'V = l × w × h, so h = V ÷ (l × w).',
      steps: [`${l} ${TIMES} ${w} = ${l * w}`, `h = ${l * w * h} ${DIVIDE} ${l * w} = ${h} cm`],
    })
  }
  const s = int(2, 10)
  return q({
    prompt: `A cube has a volume of ${s * s * s} cm³. What is the length of each edge?`,
    answer: numA(s),
    suffix: 'cm',
    hint: 'Volume of a cube = side × side × side. Find the cube root.',
    steps: [`${s} ${TIMES} ${s} ${TIMES} ${s} = ${s * s * s}`, `Edge length = ${s} cm`],
  })
}

// ------------------------------------------------------------------ Number plane

const np_coords = (level: Level): Question => {
  if (level === 1) {
    const x = int(0, 6)
    const y = int(0, 6)
    if (x === 0 && y === 0) return np_coords(1)
    return q({
      prompt: `What are the coordinates of point ${v('A')}?`,
      diagram: D.numberPlane({ xmin: 0, xmax: 7, ymin: 0, ymax: 7, points: [{ x, y, label: 'A' }] }),
      answer: pointA(x, y),
      hint: 'Coordinates are written (x, y): go across first, then up.',
      steps: [`${v('A')} is ${x} across and ${y} up.`, `${v('A')} = (${x}, ${y})`],
    })
  }
  if (level === 2) {
    const x = nonZero(-5, 5)
    const y = nonZero(-5, 5)
    return q({
      prompt: `What are the coordinates of point ${v('P')}?`,
      diagram: D.numberPlane({ xmin: -6, xmax: 6, ymin: -6, ymax: 6, points: [{ x, y, label: 'P' }] }),
      answer: pointA(x, y),
      hint: 'Read the x-coordinate (across) first, then the y-coordinate (up or down). Left and down are negative.',
      steps: [`${v('P')} is ${Math.abs(x)} ${x < 0 ? 'left' : 'right'} and ${Math.abs(y)} ${y < 0 ? 'down' : 'up'} from the origin.`, `${v('P')} = (${num(x)}, ${num(y)})`],
    })
  }
  if (chance()) {
    const x = nonZero(-9, 9)
    const y = nonZero(-9, 9)
    const qd = x > 0 && y > 0 ? '1st' : x < 0 && y > 0 ? '2nd' : x < 0 && y < 0 ? '3rd' : '4th'
    return q({
      prompt: `In which quadrant does the point (${num(x)}, ${num(y)}) lie?`,
      answer: mcFixedA(['1st', '2nd', '3rd', '4th'], qd),
      hint: 'The quadrants are numbered anticlockwise from the top right: 1st (+, +), 2nd (−, +), 3rd (−, −), 4th (+, −).',
      steps: [`x is ${x > 0 ? 'positive' : 'negative'} and y is ${y > 0 ? 'positive' : 'negative'}.`, `So the point is in the ${qd} quadrant.`],
    })
  }
  const x = int(-4, 4)
  const y = int(-4, 4)
  const dx = nonZero(-4, 4)
  const dy = nonZero(-4, 4)
  return q({
    prompt: `Point ${v('A')} is at (${num(x)}, ${num(y)}). It moves ${Math.abs(dx)} units ${dx < 0 ? 'left' : 'right'} and ${Math.abs(dy)} units ${dy < 0 ? 'down' : 'up'}. What are its new coordinates?`,
    answer: pointA(x + dx, y + dy),
    hint: 'Right and up add; left and down subtract.',
    steps: [`x: ${num(x)} ${dx < 0 ? MINUS : '+'} ${Math.abs(dx)} = ${num(x + dx)}`, `y: ${num(y)} ${dy < 0 ? MINUS : '+'} ${Math.abs(dy)} = ${num(y + dy)}`, `New point: (${num(x + dx)}, ${num(y + dy)})`],
  })
}

const np_table = (level: Level): Question => {
  const m = L(level, 1, pick([2, 3, -1, -2]), pick([2, 3, 4, -2, -3]))
  const c = L(level, int(1, 6), int(-4, 5), int(-6, 6))
  const xs = level === 1 ? [0, 1, 2, 3, 4] : [-2, -1, 0, 1, 2]
  const hide = pick([1, 2, 3, 4])
  const ys = xs.map((x) => m * x + c)
  const rule = `y = ${lin(m, c)}`
  const row = (label: string, arr: (string | number)[]) => [label, ...arr.map((z) => (typeof z === 'number' ? num(z) : z))]
  return q({
    prompt: `Complete the table of values for the rule ${ex(rule)}. What is the missing value?${D.hTable([row(v('x'), xs), row(v('y'), ys.map((y, i) => (i === hide ? '?' : y)))])}`,
    answer: numA(ys[hide]),
    hint: `Substitute ${v('x')} = ${num(xs[hide])} into the rule.`,
    steps: [`${v('y')} = ${m === 1 ? '' : m === -1 ? MINUS : num(m) + ' ' + TIMES + ' '}${bnum(xs[hide])}${c ? signed(c) : ''}`, `${v('y')} = ${num(ys[hide])}`],
  })
}

const np_rule = (level: Level): Question => {
  const m = L(level, 1, int(2, 5), pick([2, 3, 4, 5, -2, -3]))
  const c = L(level, int(1, 8), 0, nonZero(-6, 7))
  const xs = level === 3 ? [-1, 0, 1, 2, 3] : [1, 2, 3, 4, 5]
  const ys = xs.map((x) => m * x + c)
  const rule = lin(m, c)
  return q({
    prompt: `Find the rule connecting ${v('x')} and ${v('y')} in this table.${D.hTable([[v('x'), ...xs.map((z) => num(z))], [v('y'), ...ys.map((z) => num(z))]])}`,
    answer: exprA(rule),
    prefix: `${v('y')} =`,
    hint: level === 1 ? `What do you add to ${v('x')} to get ${v('y')}?` : level === 2 ? `What do you multiply ${v('x')} by to get ${v('y')}?` : `${v('y')} changes by ${num(m)} each time ${v('x')} goes up by 1, so the rule starts ${v('y')} = ${num(m)}${v('x')} … Then find what to add.`,
    steps:
      level === 1
        ? [`Each ${v('y')} value is ${c} more than ${v('x')}.`, `${v('y')} = ${ex(rule)}`]
        : level === 2
          ? [`Each ${v('y')} value is ${m} times ${v('x')}.`, `${v('y')} = ${ex(rule)}`]
          : [`As ${v('x')} increases by 1, ${v('y')} changes by ${num(m)}, so the rule has ${num(m)}${v('x')}.`, `When ${v('x')} = 0, ${v('y')} = ${num(c)}.`, `${v('y')} = ${ex(rule)}`],
  })
}

// ------------------------------------------------------------------ Data

const NOMINAL = ['favourite sport', 'eye colour', 'how students travel to school', 'type of pet owned', 'favourite fruit', 'country of birth']
const ORDINAL = ['T-shirt size (S, M, L, XL)', 'rating of a movie (1 to 5 stars)', 'finishing place in a race (1st, 2nd, 3rd…)', 'level of agreement (strongly disagree to strongly agree)', 'spice level of a curry (mild, medium, hot)']
const DISCRETE = ['number of siblings', 'number of goals scored in a match', 'number of pets in a household', 'number of text messages sent in a day', 'number of cars in a car park']
const CONTINUOUS = ['height of students', 'time taken to run 100 m', 'mass of school bags', 'daily maximum temperature', 'length of fish caught']
const DTYPES = ['Categorical – nominal', 'Categorical – ordinal', 'Numerical – discrete', 'Numerical – continuous']

const data_types = (level: Level): Question => {
  const all: [string, number][] = [...NOMINAL.map((x) => [x, 0]), ...ORDINAL.map((x) => [x, 1]), ...DISCRETE.map((x) => [x, 2]), ...CONTINUOUS.map((x) => [x, 3])] as [string, number][]
  const why = [
    'The data are categories (words or labels) with no natural order: categorical nominal.',
    'The data are categories with a natural order: categorical ordinal.',
    'The data are numbers that are counted (they can only be whole numbers): numerical discrete.',
    'The data are numbers that are measured (they can take any value in a range): numerical continuous.',
  ]
  if (level === 1) {
    const [item, t] = pick(all)
    const ans = t < 2 ? 'Categorical' : 'Numerical'
    return q({
      prompt: `Is this data categorical or numerical?<div class="big">${item}</div>`,
      answer: mcFixedA(['Categorical', 'Numerical'], ans),
      hint: 'Numerical data are numbers (counts or measurements). Categorical data are categories or labels.',
      steps: [why[t]],
    })
  }
  if (level === 2) {
    const [item, t] = pick(all)
    return q({
      prompt: `Classify this data.<div class="big">${item}</div>`,
      answer: mcFixedA(DTYPES, DTYPES[t]),
      hint: 'Nominal: categories with no order. Ordinal: ordered categories. Discrete: counted. Continuous: measured.',
      steps: [why[t]],
    })
  }
  const t = int(0, 3)
  const pools = [NOMINAL, ORDINAL, DISCRETE, CONTINUOUS]
  const correct = pick(pools[t])
  const wrong = [0, 1, 2, 3].filter((k) => k !== t).map((k) => pick(pools[k]))
  return q({
    prompt: `Which of these is <b>${DTYPES[t].toLowerCase().replace(' – ', ' ')}</b> data?`,
    answer: mcA(correct, wrong),
    hint: 'Nominal: categories with no order. Ordinal: ordered categories. Discrete: counted. Continuous: measured.',
    steps: [`“${correct}”: ${why[t]}`],
  })
}

function statsSet(n: number, lo: number, hi: number): number[] {
  return Array.from({ length: n }, () => int(lo, hi))
}
const median = (arr: number[]) => {
  const s = arr.slice().sort((a, b) => a - b)
  const n = s.length
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2
}
const modes = (arr: number[]) => {
  const c = new Map<number, number>()
  arr.forEach((x) => c.set(x, (c.get(x) || 0) + 1))
  const mx = Math.max(...c.values())
  return [...c.entries()].filter(([, k]) => k === mx).map(([x]) => x)
}

const data_stats = (level: Level): Question => {
  if (level === 1) {
    if (chance()) {
      let data = statsSet(int(7, 9), 1, 12)
      let md = modes(data)
      while (md.length !== 1 || data.filter((x) => x === md[0]).length < 2) {
        data = statsSet(int(7, 9), 1, 12)
        md = modes(data)
      }
      return q({
        prompt: `Find the mode of these scores:<div class="big">${data.join(', ')}</div>`,
        answer: numA(md[0]),
        hint: 'The mode is the score that appears most often.',
        steps: [`Sorted: ${data.slice().sort((a, b) => a - b).join(', ')}`, `${md[0]} appears ${data.filter((x) => x === md[0]).length} times, more than any other score. Mode = ${md[0]}.`],
      })
    }
    const data = statsSet(int(6, 9), 2, 40)
    const r = Math.max(...data) - Math.min(...data)
    return q({
      prompt: `Find the range of these scores:<div class="big">${data.join(', ')}</div>`,
      answer: numA(r),
      hint: 'Range = highest score − lowest score.',
      steps: [`Highest: ${Math.max(...data)}, lowest: ${Math.min(...data)}`, `Range = ${Math.max(...data)} ${MINUS} ${Math.min(...data)} = ${r}`],
    })
  }
  if (level === 2) {
    if (chance()) {
      const n = int(5, 8)
      let data = statsSet(n, 3, 30)
      let sum = data.reduce((a, b) => a + b, 0)
      // keep means to at most 1 decimal place
      while (!Number.isInteger((sum * 10) / n)) {
        data = statsSet(n, 3, 30)
        sum = data.reduce((a, b) => a + b, 0)
      }
      return q({
        prompt: `Find the mean of these scores:<div class="big">${data.join(', ')}</div>`,
        answer: numA(sum / n),
        hint: 'Mean = sum of the scores ÷ number of scores.',
        steps: [`Sum = ${data.join(' + ')} = ${sum}`, `Mean = ${sum} ${DIVIDE} ${n} = ${num(sum / n)}`],
      })
    }
    const n = pick([6, 7, 8, 9, 10])
    const data = statsSet(n, 10, 60)
    const s = data.slice().sort((a, b) => a - b)
    const med = median(data)
    return q({
      prompt: `Find the median of these scores:<div class="big">${data.join(', ')}</div>`,
      answer: numA(med),
      hint: 'Put the scores in order. The median is the middle score; with an even number of scores, it is halfway between the two middle scores.',
      steps: [`In order: ${s.join(', ')}`, n % 2 ? `There are ${n} scores, so the middle one is the ${ordinal((n + 1) / 2)}: ${med}` : `There are ${n} scores, so the median is halfway between ${s[n / 2 - 1]} and ${s[n / 2]}: (${s[n / 2 - 1]} + ${s[n / 2]}) ${DIVIDE} 2 = ${num(med)}`],
    })
  }
  if (chance()) {
    const n = int(4, 6)
    const mean = int(12, 30)
    const known = statsSet(n - 1, mean - 8, mean + 8)
    const missing = mean * n - known.reduce((a, b) => a + b, 0)
    if (missing <= 0 || missing > 60) return data_stats(3)
    return q({
      prompt: `${name()} has ${n} test results. The mean is ${mean}. ${n - 1} of the results are ${known.join(', ')}. What is the missing result?`,
      answer: numA(missing),
      hint: 'The total of all the scores = mean × number of scores.',
      steps: [`Total = ${mean} ${TIMES} ${n} = ${mean * n}`, `Known scores add to ${known.reduce((a, b) => a + b, 0)}`, `Missing = ${mean * n} ${MINUS} ${known.reduce((a, b) => a + b, 0)} = ${missing}`],
    })
  }
  const n = int(5, 7)
  const data = statsSet(n, 10, 25)
  const extra = pick([int(40, 60), int(1, 4)])
  const oldMean = data.reduce((a, b) => a + b, 0) / n
  const newMean = (data.reduce((a, b) => a + b, 0) + extra) / (n + 1)
  return q({
    prompt: `The scores ${data.join(', ')} have a mean of ${num(round(oldMean, 2))}${Number.isInteger(oldMean * 100) ? '' : ' (to 2 d.p.)'}. A new score of ${extra} is added. What is the new mean? Give your answer correct to 1 decimal place.`,
    answer: numA(newMean, 1),
    calc: true,
    hint: 'Add the new score to the total and divide by the new number of scores.',
    steps: [`New total = ${data.reduce((a, b) => a + b, 0)} + ${extra} = ${data.reduce((a, b) => a + b, 0) + extra}`, `New mean = ${data.reduce((a, b) => a + b, 0) + extra} ${DIVIDE} ${n + 1} ≈ ${num(round(newMean, 1), 1)}`, extra > 30 ? 'The new score is an outlier, so it pulls the mean up.' : 'The new score is very low, so it pulls the mean down.'],
  })
}

const data_graphs = (level: Level): Question => {
  if (level === 1 || level === 3) {
    const min = 0
    const max = int(5, 8)
    const n = int(14, 22)
    const vals = Array.from({ length: n }, () => Math.min(max, Math.max(min, Math.round(int(0, max) * 0.6 + int(0, max) * 0.4))))
    const topic = pick(['the number of pets owned by each student in class 7K', 'the number of goals scored by a netball team in each game', 'the number of books each student read last month'])
    const counts = Array.from({ length: max + 1 }, (_, i) => vals.filter((x) => x === i).length)
    if (level === 1) {
      if (chance()) {
        const mx = Math.max(...counts)
        if (counts.filter((c) => c === mx).length > 1) return data_graphs(level)
        const md = counts.indexOf(mx)
        return q({
          prompt: `The dot plot shows ${topic}. What is the mode?`,
          diagram: D.dotPlot(vals, min, max),
          answer: numA(md),
          hint: 'The mode is the value with the tallest column of dots.',
          steps: [`The tallest column is at ${md}, with ${mx} dots.`, `Mode = ${md}`],
        })
      }
      const k = int(0, max)
      return q({
        prompt: `The dot plot shows ${topic}. How many results were exactly ${k}?`,
        diagram: D.dotPlot(vals, min, max),
        answer: numA(counts[k]),
        hint: `Count the dots above ${k}.`,
        steps: [`There ${counts[k] === 1 ? 'is 1 dot' : `are ${counts[k]} dots`} above ${k}.`],
      })
    }
    const k = int(1, max - 1)
    const more = counts.slice(k + 1).reduce((a, b) => a + b, 0)
    if (chance()) {
      return q({
        prompt: `The dot plot shows ${topic}. How many results were <b>more than</b> ${k}?`,
        diagram: D.dotPlot(vals, min, max),
        answer: numA(more),
        hint: `“More than ${k}” does not include ${k} itself.`,
        steps: [`Count the dots above ${Array.from({ length: max - k }, (_, i) => k + 1 + i).join(', ')}: ${counts.slice(k + 1).join(' + ')} = ${more}`],
      })
    }
    const total = vals.length
    return q({
      prompt: `The dot plot shows ${topic}. What fraction of the results were <b>at least</b> ${k}? Give your answer in simplest form.`,
      diagram: D.dotPlot(vals, min, max),
      answer: fracA(counts.slice(k).reduce((a, b) => a + b, 0), total),
      hint: `“At least ${k}” includes ${k}. Then divide by the total number of dots.`,
      steps: [`At least ${k}: ${counts.slice(k).join(' + ')} = ${counts.slice(k).reduce((a, b) => a + b, 0)}`, `Total dots: ${total}`, `Fraction = ${frac(counts.slice(k).reduce((a, b) => a + b, 0), total)}${gcd(counts.slice(k).reduce((a, b) => a + b, 0), total) > 1 ? ' = ' + fracS(counts.slice(k).reduce((a, b) => a + b, 0), total) : ''}`],
    })
  }
  const cats = sample(['Cricket', 'Netball', 'Soccer', 'Rugby', 'Swimming', 'Hockey', 'Tennis', 'Touch'], 5)
  const vals = cats.map(() => int(2, 14))
  const step = 2
  const t = pick(['total', 'diff', 'read'])
  if (t === 'read') {
    const i = int(0, 4)
    return q({
      prompt: `The column graph shows the favourite sports of a Year 7 class. How many students chose ${cats[i]}?`,
      diagram: D.columnGraph(cats, vals, step, 'Students'),
      answer: numA(vals[i]),
      hint: 'Read across from the top of the column to the vertical axis.',
      steps: [`The ${cats[i]} column reaches ${vals[i]}.`],
    })
  }
  if (t === 'total') {
    const total = vals.reduce((a, b) => a + b, 0)
    return q({
      prompt: 'The column graph shows the favourite sports of a Year 7 class. How many students are in the class?',
      diagram: D.columnGraph(cats, vals, step, 'Students'),
      answer: numA(total),
      hint: 'Add the heights of all the columns.',
      steps: [`${vals.join(' + ')} = ${total}`],
    })
  }
  const [i, j] = sample([0, 1, 2, 3, 4], 2)
  if (vals[i] === vals[j]) return data_graphs(2)
  const [hi, lo] = vals[i] > vals[j] ? [i, j] : [j, i]
  return q({
    prompt: `The column graph shows the favourite sports of a Year 7 class. How many more students chose ${cats[hi]} than ${cats[lo]}?`,
    diagram: D.columnGraph(cats, vals, step, 'Students'),
    answer: numA(vals[hi] - vals[lo]),
    hint: 'Read both columns, then subtract.',
    steps: [`${cats[hi]}: ${vals[hi]}, ${cats[lo]}: ${vals[lo]}`, `${vals[hi]} ${MINUS} ${vals[lo]} = ${vals[hi] - vals[lo]}`],
  })
}

// ------------------------------------------------------------------ Probability

const SCALE = ['Impossible', 'Unlikely', 'Even chance', 'Likely', 'Certain']
const scaleOf = (p: number) => (p === 0 ? 'Impossible' : p < 0.5 ? 'Unlikely' : p === 0.5 ? 'Even chance' : p < 1 ? 'Likely' : 'Certain')

const prob_scale = (level: Level): Question => {
  if (level === 1) {
    const [shown, p] = pick([
      ['0', 0],
      ['1', 1],
      ['0.5', 0.5],
      [frac(1, 2), 0.5],
      ['0.1', 0.1],
      ['0.9', 0.9],
      [frac(3, 4), 0.75],
      [frac(1, 5), 0.2],
      ['15%', 0.15],
      ['85%', 0.85],
      ['100%', 1],
    ] as [string, number][])
    return q({
      prompt: `An event has a probability of ${shown}. How would you describe its chance of happening?`,
      answer: mcFixedA(SCALE, scaleOf(p)),
      hint: 'Probabilities go from 0 (impossible) to 1 (certain). One half is an even chance.',
      steps: [shown === String(p) ? `The probability is ${shown}.` : `${shown} = ${num(p)} as a decimal.`, `${scaleOf(p)}.`],
    })
  }
  if (level === 2) {
    const [ev, ans, why] = pick([
      ['rolling a 7 on a normal six-sided die', 'Impossible', 'A die only has the numbers 1 to 6.'],
      ['tossing a coin and getting heads', 'Even chance', 'Heads and tails are equally likely: 1/2.'],
      ['rolling a number less than 7 on a normal die', 'Certain', 'Every number on a die is less than 7.'],
      ['rolling a 6 on a normal die', 'Unlikely', 'P(6) = 1/6, which is less than 1/2.'],
      ['rolling a number greater than 1 on a normal die', 'Likely', 'P(greater than 1) = 5/6, which is more than 1/2.'],
      ['rolling an even number on a normal die', 'Even chance', 'P(even) = 3/6 = 1/2.'],
      ['picking a red ball from a bag of 9 red balls and 1 blue ball', 'Likely', 'P(red) = 9/10.'],
      ['picking a green ball from a bag with only red and blue balls', 'Impossible', 'There are no green balls.'],
    ] as [string, string, string][])
    return q({
      prompt: `Describe the chance of this event:<div class="big">${ev}</div>`,
      answer: mcFixedA(SCALE, ans),
      hint: 'Think about how many outcomes are possible, and how many of them make the event happen.',
      steps: [why, `${ans}.`],
    })
  }
  const items = sample(
    [
      { h: frac(2, 3), v: 2 / 3 },
      { h: '0.6', v: 0.6 },
      { h: '72%', v: 0.72 },
      { h: frac(3, 5), v: 0.6001 },
      { h: '0.45', v: 0.45 },
      { h: frac(7, 10), v: 0.7 },
      { h: '58%', v: 0.58 },
      { h: frac(5, 8), v: 0.625 },
      { h: '0.68', v: 0.68 },
    ].filter((x, i, arr) => arr.findIndex((y) => Math.abs(y.v - x.v) < 0.005) === i),
    4,
  )
  const best = items.reduce((a, b) => (b.v > a.v ? b : a))
  return q({
    prompt: 'These are the probabilities of four different events. Which event is the most likely?',
    answer: mcA(best.h, items.filter((x) => x !== best).map((x) => x.h)),
    hint: 'Change all the probabilities to decimals (or percentages) to compare them.',
    steps: [items.map((x) => `${x.h} = ${num(Number(x.v.toFixed(3)))}`).join('; '), `The largest is ${best.h}.`],
  })
}

const prob_simple = (level: Level): Question => {
  if (level === 1) {
    const [desc, fav] = pick([
      ['a 4', [4]],
      ['an even number', [2, 4, 6]],
      ['a number greater than 4', [5, 6]],
      ['a number less than 3', [1, 2]],
      ['a prime number', [2, 3, 5]],
      ['a multiple of 3', [3, 6]],
      ['a number less than 5', [1, 2, 3, 4]],
    ] as [string, number[]][])
    return q({
      prompt: `A normal six-sided die is rolled. What is the probability of rolling ${desc}? Give your answer as a fraction in simplest form.`,
      answer: fracA(fav.length, 6, { allowDecimal: true }),
      hint: 'P(event) = number of favourable outcomes ÷ total number of outcomes.',
      steps: [`Sample space: {1, 2, 3, 4, 5, 6} (6 outcomes)`, `Favourable: {${fav.join(', ')}} (${fav.length} outcome${fav.length > 1 ? 's' : ''})`, `P = ${frac(fav.length, 6)}${gcd(fav.length, 6) > 1 ? ' = ' + fracS(fav.length, 6) : ''}`],
    })
  }
  if (level === 2) {
    const cols = sample(['red', 'blue', 'green', 'yellow', 'purple'], 3)
    const cnt = cols.map(() => int(1, 9))
    const total = cnt.reduce((a, b) => a + b, 0)
    const i = int(0, 2)
    return q({
      prompt: `A bag contains ${cols.map((c, k) => `${cnt[k]} ${c}`).join(', ').replace(/, ([^,]*)$/, ' and $1')} marbles. One marble is chosen at random. What is the probability that it is ${cols[i]}? Give your answer as a fraction in simplest form.`,
      answer: fracA(cnt[i], total, { allowDecimal: true }),
      hint: 'Count the marbles of that colour and the total number of marbles.',
      steps: [`Total marbles: ${cnt.join(' + ')} = ${total}`, `${cols[i]}: ${cnt[i]}`, `P(${cols[i]}) = ${frac(cnt[i], total)}${gcd(cnt[i], total) > 1 ? ' = ' + fracS(cnt[i], total) : ''}`],
    })
  }
  if (chance()) {
    const word = pick(['PARRAMATTA', 'WOLLONGONG', 'KATOOMBA', 'COONABARABRAN', 'MURRUMBIDGEE', 'GOULBURN', 'KINGSCLIFF'])
    const ask = pick(['vowel', 'letter'])
    const letters = word.split('')
    let fav: number
    let desc: string
    if (ask === 'vowel') {
      fav = letters.filter((c) => 'AEIOU'.includes(c)).length
      desc = 'a vowel'
    } else {
      const ch = pick(Array.from(new Set(letters)))
      fav = letters.filter((c) => c === ch).length
      desc = `the letter ${ch}`
    }
    return q({
      prompt: `The letters of the word <b>${word}</b> are written on separate cards and one card is chosen at random. What is the probability of choosing ${desc}? Give your answer as a fraction in simplest form.`,
      answer: fracA(fav, letters.length, { allowDecimal: true }),
      hint: 'Count every letter, including repeated letters.',
      steps: [`There are ${letters.length} letters.`, `Favourable: ${fav}`, `P = ${frac(fav, letters.length)}${gcd(fav, letters.length) > 1 ? ' = ' + fracS(fav, letters.length) : ''}`],
    })
  }
  const N = pick([10, 12, 15, 20, 25, 30])
  const t = pick(['multiple of 3', 'multiple of 4', 'square number', 'number containing the digit 1', 'factor of 24'])
  const list = Array.from({ length: N }, (_, k) => k + 1).filter((k) =>
    t === 'multiple of 3' ? k % 3 === 0 : t === 'multiple of 4' ? k % 4 === 0 : t === 'square number' ? Number.isInteger(Math.sqrt(k)) : t === 'factor of 24' ? 24 % k === 0 : String(k).includes('1'),
  )
  return q({
    prompt: `Cards numbered 1 to ${N} are shuffled and one is chosen at random. What is the probability that the number is a ${t}? Give your answer as a fraction in simplest form.`,
    answer: fracA(list.length, N, { allowDecimal: true }),
    hint: 'List the favourable numbers carefully.',
    steps: [`Favourable: ${list.join(', ')} (${list.length} cards)`, `P = ${frac(list.length, N)}${gcd(list.length, N) > 1 ? ' = ' + fracS(list.length, N) : ''}`],
  })
}

const prob_comp = (level: Level): Question => {
  if (level === 1) {
    const d = pick([3, 4, 5, 6, 7, 8, 9, 10, 12])
    let n = int(1, d - 1)
    while (gcd(n, d) !== 1) n = int(1, d - 1)
    return q({
      prompt: `The probability that it rains tomorrow in Lismore is ${frac(n, d)}. What is the probability that it does <b>not</b> rain?`,
      answer: fracA(d - n, d, { allowDecimal: true }),
      hint: 'P(not A) = 1 − P(A)',
      steps: [`P(not rain) = 1 ${MINUS} ${frac(n, d)}`, `= ${frac(d, d)} ${MINUS} ${frac(n, d)} = ${frac(d - n, d)}`],
    })
  }
  if (level === 2) {
    if (chance()) {
      const p = int(1, 99) / 100
      return q({
        prompt: `The probability that a randomly chosen student walks to school is ${num(p)}. What is the probability that a randomly chosen student does <b>not</b> walk to school?`,
        answer: numA(clean(1 - p)),
        hint: 'The probabilities of an event and its complement add to 1.',
        steps: [`1 ${MINUS} ${num(p)} = ${num(clean(1 - p))}`],
      })
    }
    const p = int(1, 99)
    return q({
      prompt: `The chance that a train arrives on time is ${p}%. What is the chance, as a percentage, that it does <b>not</b> arrive on time?`,
      answer: numA(100 - p),
      suffix: '%',
      hint: 'The chances of an event and its complement add to 100%.',
      steps: [`100% ${MINUS} ${p}% = ${100 - p}%`],
    })
  }
  const a = int(10, 50) / 100
  const b = int(10, Math.round((0.9 - a) * 100)) / 100
  const c = clean(1 - a - b)
  if (c <= 0) return prob_comp(3)
  return q({
    prompt: `A spinner can land on red, blue or green. P(red) = ${num(a)} and P(blue) = ${num(b)}. What is P(green)?`,
    answer: numA(c),
    hint: 'The probabilities of all the possible outcomes add to 1.',
    steps: [`P(red) + P(blue) + P(green) = 1`, `P(green) = 1 ${MINUS} ${num(a)} ${MINUS} ${num(b)} = ${num(c)}`],
  })
}

// ------------------------------------------------------------------ Ratios and rates

const rat_simplify = (level: Level): Question => {
  if (level === 1) {
    let a = int(1, 9)
    let b = int(1, 9)
    while (gcd(a, b) !== 1 || a === b) {
      a = int(1, 9)
      b = int(1, 9)
    }
    const k = int(2, 9)
    return q({
      prompt: `Simplify the ratio:<div class="big">${a * k} : ${b * k}</div>`,
      answer: ratioA(a, b),
      hint: 'Divide both parts by their highest common factor. Type ratios with a colon, e.g. 3:4.',
      steps: [`HCF of ${a * k} and ${b * k} is ${k}.`, `${a * k} : ${b * k} = ${a} : ${b}`],
    })
  }
  if (level === 2) {
    const t = pick(['cm-m', 'min-h', 'g-kg', 'dec'])
    if (t === 'dec') {
      let a = int(1, 9)
      let b = int(1, 9)
      while (gcd(a, b) !== 1 || a === b) {
        a = int(1, 9)
        b = int(1, 9)
      }
      const k = pick([0.5, 1.5, 0.2, 0.25])
      return q({
        prompt: `Simplify the ratio:<div class="big">${num(clean(a * k))} : ${num(clean(b * k))}</div>`,
        answer: ratioA(a, b),
        hint: 'Multiply both parts by 10 or 100 to make whole numbers, then simplify.',
        steps: [`Multiply both parts by 100: ${num(Math.round(a * k * 100))} : ${num(Math.round(b * k * 100))}`, `Simplify: ${a} : ${b}`],
      })
    }
    const [u1, u2, f] = t === 'cm-m' ? ['cm', 'm', 100] : t === 'min-h' ? ['minutes', 'hours', 60] : ['g', 'kg', 1000]
    const big = int(1, 3)
    const A = pick(t === 'cm-m' ? [20, 25, 40, 50, 75, 80] : t === 'min-h' ? [15, 20, 30, 40, 45, 50] : [100, 200, 250, 400, 500, 750])
    const B = big * f
    const g = gcd(A, B)
    return q({
      prompt: `Write as a ratio in simplest form:<div class="big">${A} ${u1} to ${big} ${big === 1 ? u2.replace(/s$/, '') : u2}</div>`,
      answer: ratioA(A / g, B / g),
      hint: `Change both quantities to the same unit first: 1 ${u2.replace(/s$/, '')} = ${f} ${u1}.`,
      steps: [`${big} ${big === 1 ? u2.replace(/s$/, '') : u2} = ${B} ${u1}`, `${A} : ${B}`, `Divide by ${g}: ${A / g} : ${B / g}`],
    })
  }
  if (chance()) {
    let p = [int(1, 6), int(1, 6), int(1, 6)]
    while (gcd(gcd(p[0], p[1]), p[2]) !== 1) p = [int(1, 6), int(1, 6), int(1, 6)]
    const k = int(2, 8)
    return q({
      prompt: `Simplify the ratio:<div class="big">${p.map((x) => x * k).join(' : ')}</div>`,
      answer: ratioA(...p),
      hint: 'Divide all three parts by their highest common factor.',
      steps: [`HCF = ${k}`, `${p.map((x) => x * k).join(' : ')} = ${p.join(' : ')}`],
    })
  }
  const [a, b, c, d] = pick([
    [1, 2, 3, 4],
    [2, 3, 1, 2],
    [3, 4, 1, 2],
    [1, 3, 1, 4],
    [2, 5, 3, 10],
    [1, 2, 1, 3],
  ])
  const L2 = (b * d) / gcd(b, d)
  const A = (a * L2) / b
  const B = (c * L2) / d
  const g = gcd(A, B)
  return q({
    prompt: `Simplify the ratio:<div class="big">${frac(a, b)} : ${frac(c, d)}</div>`,
    answer: ratioA(A / g, B / g),
    hint: `Multiply both parts by ${L2} (the lowest common denominator) to clear the fractions.`,
    steps: [`Multiply both parts by ${L2}: ${A} : ${B}`, g > 1 ? `Simplify: ${A / g} : ${B / g}` : 'This is already in simplest form.'],
  })
}

const rat_divide = (level: Level): Question => {
  if (level === 1) {
    let a = int(1, 5)
    let b = int(1, 5)
    while (a === b) b = int(1, 5)
    const k = int(2, 20)
    const total = (a + b) * k
    const [n1, n2] = sample(['Mia', 'Liam', 'Isla', 'Kai', 'Ruby', 'Ethan'], 2)
    return q({
      prompt: `${n1} and ${n2} share $${total} in the ratio ${a} : ${b}. How much does ${n1} get?`,
      answer: numA(a * k),
      prefix: '$',
      hint: 'Add the parts to find the total number of parts. Find the value of one part.',
      steps: [`Total parts: ${a} + ${b} = ${a + b}`, `One part: $${total} ${DIVIDE} ${a + b} = $${k}`, `${n1}: ${a} ${TIMES} $${k} = $${a * k}`],
    })
  }
  if (level === 2) {
    const p = [int(1, 5), int(1, 5), int(1, 5)]
    const k = int(2, 15)
    const total = (p[0] + p[1] + p[2]) * k
    const i = int(0, 2)
    const what = pick(['concrete mix (cement : sand : gravel)', 'fruit punch (orange : pineapple : lemonade)'])
    const parts = what.startsWith('concrete') ? ['cement', 'sand', 'gravel'] : ['orange juice', 'pineapple juice', 'lemonade']
    const unit = what.startsWith('concrete') ? 'kg' : 'L'
    return q({
      prompt: `A ${what.split(' (')[0]} uses ${parts.join(', ').replace(/, ([^,]*)$/, ' and $1')} in the ratio ${p.join(' : ')}. How much ${parts[i]} is needed to make ${total} ${unit}?`,
      answer: numA(p[i] * k),
      suffix: unit,
      hint: 'Find the total number of parts, then the size of one part.',
      steps: [`Total parts: ${p.join(' + ')} = ${p[0] + p[1] + p[2]}`, `One part: ${total} ${DIVIDE} ${p[0] + p[1] + p[2]} = ${k} ${unit}`, `${parts[i]}: ${p[i]} ${TIMES} ${k} = ${p[i] * k} ${unit}`],
    })
  }
  let a = int(2, 7)
  let b = int(2, 7)
  while (gcd(a, b) !== 1) b = int(2, 7)
  const k = int(2, 9)
  if (chance()) {
    return q({
      prompt: `The ratio of boys to girls in a choir is ${a} : ${b}. There are ${a * k} boys. How many girls are there?`,
      answer: numA(b * k),
      hint: `${a} parts = ${a * k} boys. Find one part first.`,
      steps: [`${a} parts = ${a * k}, so 1 part = ${k}`, `Girls: ${b} ${TIMES} ${k} = ${b * k}`],
    })
  }
  return q({
    prompt: `Some money is shared between Kai and Zara in the ratio ${a} : ${b}. Kai gets $${a * k}. How much money was shared altogether?`,
    answer: numA((a + b) * k),
    prefix: '$',
    hint: `Kai's ${a} parts are worth $${a * k}. Find one part, then the total of ${a + b} parts.`,
    steps: [`1 part = $${a * k} ${DIVIDE} ${a} = $${k}`, `Total = ${a + b} ${TIMES} $${k} = $${(a + b) * k}`],
  })
}

const rat_rates = (level: Level): Question => {
  if (level === 1) {
    const t = pick(['kg', 'speed', 'pay'])
    if (t === 'kg') {
      const per = pick([2.5, 3, 4, 4.5, 6, 8, 12])
      const kg = int(2, 6)
      return q({
        prompt: `${kg} kg of bananas cost ${money(per * kg)}. What is the cost per kilogram?`,
        answer: numA(per),
        prefix: '$',
        suffix: '/kg',
        hint: 'Divide the cost by the number of kilograms.',
        steps: [`${money(per * kg)} ${DIVIDE} ${kg} = ${money(per)} per kg`],
      })
    }
    if (t === 'speed') {
      const s = pick([40, 50, 60, 70, 80, 90, 100])
      const h = int(2, 5)
      return q({
        prompt: `A car travels ${s * h} km in ${h} hours. What is its average speed?`,
        answer: numA(s),
        suffix: 'km/h',
        hint: 'Speed = distance ÷ time',
        steps: [`${s * h} ${DIVIDE} ${h} = ${s} km/h`],
      })
    }
    const r = pick([15, 16, 18, 20, 22, 25])
    const h = int(3, 8)
    return q({
      prompt: `${name()} earns $${r * h} for working ${h} hours at a café. What is the hourly rate of pay?`,
      answer: numA(r),
      prefix: '$',
      suffix: '/h',
      hint: 'Divide the pay by the number of hours.',
      steps: [`$${r * h} ${DIVIDE} ${h} = $${r} per hour`],
    })
  }
  if (level === 2) {
    if (chance()) {
      const s = pick([60, 80, 90, 100, 110])
      const t = pick([1.5, 2.5, 3.5, 0.5, 4])
      return q({
        prompt: `A bus travels at an average speed of ${s} km/h. How far does it travel in ${num(t)} hours?`,
        answer: numA(s * t),
        suffix: 'km',
        hint: 'Distance = speed × time',
        steps: [`${s} ${TIMES} ${num(t)} = ${num(s * t)} km`],
      })
    }
    const r = pick([8, 10, 12, 15, 20, 25])
    const V = r * int(5, 30)
    return q({
      prompt: `Water flows into a tank at ${r} L per minute. How many minutes does it take to put ${V} L into the tank?`,
      answer: numA(V / r),
      suffix: 'min',
      hint: 'Time = amount ÷ rate',
      steps: [`${V} ${DIVIDE} ${r} = ${V / r} minutes`],
    })
  }
  const prodName = pick(['rice', 'washing powder', 'muesli'])
  const offers = [
    { g: 500, p: round(pick([2.4, 2.6, 3.1, 3.5]), 2) },
    { g: 1000, p: round(pick([4.2, 4.9, 5.5, 6.2]), 2) },
    { g: 2000, p: round(pick([8.6, 9.5, 10.8, 11.9]), 2) },
  ]
  const unit = offers.map((o) => (o.p / o.g) * 1000)
  const bestI = unit.indexOf(Math.min(...unit))
  if (unit.filter((u) => Math.abs(u - unit[bestI]) < 0.05).length > 1) return rat_rates(3)
  const lab = (o: { g: number; p: number }) => `${o.g >= 1000 ? o.g / 1000 + ' kg' : o.g + ' g'} for ${money(o.p)}`
  return q({
    prompt: `Which packet of ${prodName} is the best buy?`,
    answer: mcFixedA(offers.map(lab), lab(offers[bestI])),
    calc: true,
    hint: 'Compare the price per kilogram (or per 100 g) of each packet.',
    steps: [...offers.map((o, i) => `${lab(o)}: ${money(unit[i])} per kg`), `The cheapest price per kg is ${lab(offers[bestI])}.`],
  })
}

// ------------------------------------------------------------------ Topics

export const Y7C: Topic[] = [
  {
    id: 'y7-area-volume',
    year: 7,
    title: 'Area and volume',
    strand: 'Measurement and space',
    outcomes: ['MA4-ARE-C-01', 'MA4-VOL-C-01'],
    blurb: 'Areas of rectangles, triangles, parallelograms and composite shapes; volume of rectangular prisms.',
    colour: 95,
    skills: [
      {
        id: 'y7-area-rect',
        title: 'Area of rectangles and squares',
        outcomes: ['MA4-ARE-C-01'],
        summary: 'Find areas of rectangles and squares, and missing side lengths.',
        learn: {
          intro: '<p><b>Area</b> is the amount of space inside a flat shape. It is measured in square units such as cm² and m².</p>',
          keyPoints: ['Rectangle: A = length × width', 'Square: A = side × side', 'If you know the area and one side, divide to find the other side.'],
        },
        gen: area_rect,
        levels: { 1: 'From a diagram', 2: 'Worded, decimals', 3: 'Missing sides; from perimeter' },
      },
      {
        id: 'y7-area-tri-para',
        title: 'Area of triangles and parallelograms',
        outcomes: ['MA4-ARE-C-01'],
        summary: 'Use the perpendicular height to find areas of triangles and parallelograms.',
        learn: {
          intro: '<p>A triangle is half of a rectangle (or parallelogram) with the same base and height.</p>',
          keyPoints: ['Triangle: A = ½ × base × perpendicular height', 'Parallelogram: A = base × perpendicular height', 'The perpendicular height meets the base at 90°. Slanted sides are not the height.'],
        },
        gen: area_tri_para,
        levels: { 1: 'Triangles', 2: 'Parallelograms', 3: 'Extra measurements given' },
      },
      {
        id: 'y7-area-composite',
        title: 'Composite areas',
        outcomes: ['MA4-ARE-C-01'],
        summary: 'Find the area of shapes made from rectangles.',
        learn: {
          intro: '<p>A <b>composite shape</b> is made of simpler shapes. Split it up (add areas) or find a bigger shape and take away what is missing (subtract areas).</p>',
          keyPoints: ['Mark any missing side lengths first.', 'Check: both methods should give the same answer.'],
        },
        gen: area_composite,
        levels: { 1: 'All sides given', 2: 'Find missing sides', 3: 'Shaded or remaining areas' },
      },
      {
        id: 'y7-area-units',
        title: 'Converting units of area',
        outcomes: ['MA4-ARE-C-01'],
        summary: 'Convert between mm², cm², m², hectares and km².',
        learn: {
          intro: '<p>Area units are squared, so the conversion factors are squared too.</p>',
          keyPoints: ['1 cm² = 100 mm²', '1 m² = 10 000 cm²', '1 ha = 10 000 m²', '1 km² = 100 ha = 1 000 000 m²', 'Big unit → small unit: multiply. Small unit → big unit: divide.'],
        },
        gen: area_units,
        levels: { 1: 'cm², mm², m² (multiply)', 2: 'Both directions; hectares', 3: 'Square kilometres' },
      },
      {
        id: 'y7-vol-prism',
        title: 'Volume of rectangular prisms',
        outcomes: ['MA4-VOL-C-01'],
        summary: 'Find volume and capacity of rectangular prisms.',
        learn: {
          intro: '<p><b>Volume</b> is the amount of space a solid takes up, measured in cubic units such as cm³ and m³. <b>Capacity</b> is how much a container holds, measured in mL and L.</p>',
          keyPoints: ['Rectangular prism: V = length × width × height', 'Cube: V = side × side × side', '1 cm³ = 1 mL, 1000 cm³ = 1 L, 1 m³ = 1000 L'],
        },
        gen: vol_prism,
        levels: { 1: 'Volume from a diagram', 2: 'Capacity in litres', 3: 'Missing dimensions' },
      },
    ],
  },
  {
    id: 'y7-number-plane',
    year: 7,
    title: 'The number plane',
    strand: 'Number and algebra',
    outcomes: ['MA4-LIN-C-01'],
    blurb: 'Plot and read coordinates in all four quadrants; tables of values and rules.',
    colour: 225,
    skills: [
      {
        id: 'y7-np-coords',
        title: 'Coordinates',
        outcomes: ['MA4-LIN-C-01'],
        summary: 'Read and plot points in all four quadrants.',
        learn: {
          intro: '<p>The <b>number plane</b> has a horizontal <i>x</i>-axis and a vertical <i>y</i>-axis, crossing at the <b>origin</b> (0, 0). A point is written (<i>x</i>, <i>y</i>).</p>',
          keyPoints: ['Go across first (x), then up or down (y).', 'Left of the origin and below it are negative.', 'Quadrants are numbered anticlockwise from the top right.', 'Type points like (3, −2).'],
        },
        gen: np_coords,
        levels: { 1: 'First quadrant', 2: 'All four quadrants', 3: 'Quadrants and moving points' },
      },
      {
        id: 'y7-np-table',
        title: 'Tables of values',
        outcomes: ['MA4-LIN-C-01'],
        summary: 'Use a rule to complete a table of values.',
        learn: {
          intro: '<p>A rule such as <i>y</i> = 2<i>x</i> + 1 tells you how to get <i>y</i> from <i>x</i>. Substitute each <i>x</i>-value to complete a table.</p>',
          keyPoints: ['When x = 3: y = 2 × 3 + 1 = 7', 'When x = −2: y = 2 × (−2) + 1 = −3'],
        },
        gen: np_table,
        levels: { 1: 'y = x + c', 2: 'Negative x-values', 3: 'Negative coefficients' },
      },
      {
        id: 'y7-np-rule',
        title: 'Finding a rule',
        outcomes: ['MA4-LIN-C-01'],
        summary: 'Find the rule connecting x and y from a table.',
        learn: {
          intro: '<p>Look at how <i>y</i> changes as <i>x</i> goes up by 1. That change is the number in front of <i>x</i>.</p>',
          keyPoints: ['If y goes up by 3 each time, the rule starts y = 3x …', 'Then check one pair to find what to add or subtract.', 'Type the right-hand side only, e.g. 3x − 2.'],
        },
        gen: np_rule,
        levels: { 1: 'y = x + c', 2: 'y = mx', 3: 'y = mx + c' },
      },
    ],
  },
  {
    id: 'y7-data',
    year: 7,
    title: 'Analysing data',
    strand: 'Statistics and probability',
    outcomes: ['MA4-DAT-C-01', 'MA4-DAT-C-02'],
    blurb: 'Classify data, read graphs and calculate the mean, median, mode and range.',
    colour: 12,
    skills: [
      {
        id: 'y7-data-types',
        title: 'Types of data',
        outcomes: ['MA4-DAT-C-01'],
        summary: 'Classify data as categorical (nominal, ordinal) or numerical (discrete, continuous).',
        learn: {
          intro: '<p><b>Categorical</b> data are categories or labels. <b>Numerical</b> data are numbers.</p>',
          keyPoints: ['Nominal: categories with no order (eye colour).', 'Ordinal: categories with an order (T-shirt size).', 'Discrete: counted, whole numbers (number of siblings).', 'Continuous: measured, any value in a range (height).'],
        },
        gen: data_types,
        levels: { 1: 'Categorical or numerical', 2: 'All four types', 3: 'Pick the example' },
      },
      {
        id: 'y7-data-stats',
        title: 'Mean, median, mode and range',
        outcomes: ['MA4-DAT-C-02'],
        summary: 'Calculate measures of centre and spread.',
        learn: {
          intro: '<p>Measures of centre describe a typical score; the range describes the spread.</p>',
          keyPoints: ['Mean = sum ÷ number of scores', 'Median = middle score when in order (average the two middle scores if there is an even number)', 'Mode = most common score', 'Range = highest − lowest', 'An outlier is a score far from the others; it can change the mean a lot.'],
        },
        gen: data_stats,
        levels: { 1: 'Mode and range', 2: 'Mean and median', 3: 'Missing scores; effect of a new score' },
      },
      {
        id: 'y7-data-graphs',
        title: 'Reading graphs',
        outcomes: ['MA4-DAT-C-01', 'MA4-DAT-C-02'],
        summary: 'Interpret dot plots and column graphs.',
        learn: {
          intro: '<p>Read graphs carefully: check the title, the axes and the scale before answering.</p>',
          keyPoints: ['Dot plot: each dot is one result.', 'Column graph: read across from the top of each column.', '“More than 3” does not include 3; “at least 3” does.'],
        },
        gen: data_graphs,
        levels: { 1: 'Dot plots', 2: 'Column graphs', 3: '“More than” and “at least”' },
      },
    ],
  },
  {
    id: 'y7-probability',
    year: 7,
    title: 'Probability',
    strand: 'Statistics and probability',
    outcomes: ['MA4-PRO-C-01'],
    blurb: 'Describe chance, list sample spaces and calculate probabilities, including complements.',
    colour: 170,
    skills: [
      {
        id: 'y7-prob-scale',
        title: 'Describing chance',
        outcomes: ['MA4-PRO-C-01'],
        summary: 'Use the language of chance and the probability scale from 0 to 1.',
        learn: {
          intro: '<p>Probability measures how likely an event is, on a scale from 0 (impossible) to 1 (certain).</p>',
          keyPoints: ['0: impossible', 'Between 0 and ½: unlikely', '½: even chance', 'Between ½ and 1: likely', '1: certain'],
        },
        gen: prob_scale,
        levels: { 1: 'From a probability', 2: 'From an event', 3: 'Compare probabilities' },
      },
      {
        id: 'y7-prob-simple',
        title: 'Calculating probability',
        outcomes: ['MA4-PRO-C-01'],
        summary: 'Calculate the probability of an event when outcomes are equally likely.',
        learn: {
          intro: '<p>The <b>sample space</b> is the list of all possible outcomes. When all outcomes are equally likely:</p><p>P(event) = number of favourable outcomes ÷ total number of outcomes</p>',
          keyPoints: ['Rolling a die: sample space {1, 2, 3, 4, 5, 6}.', 'P(even) = 3/6 = 1/2', 'Give probabilities as simplified fractions (decimals are also fine when exact).'],
        },
        gen: prob_simple,
        levels: { 1: 'Dice', 2: 'Bags of marbles', 3: 'Letters and numbered cards' },
      },
      {
        id: 'y7-prob-comp',
        title: 'Complementary events',
        outcomes: ['MA4-PRO-C-01'],
        summary: 'Use the fact that probabilities of complementary events add to 1.',
        learn: {
          intro: '<p>The <b>complement</b> of an event is everything else that could happen: the complement of “rain” is “no rain”.</p>',
          keyPoints: ['P(not A) = 1 − P(A)', 'As percentages: P(not A) = 100% − P(A)', 'The probabilities of all outcomes add to 1.'],
        },
        gen: prob_comp,
        levels: { 1: 'Fractions', 2: 'Decimals and percentages', 3: 'Three outcomes' },
      },
    ],
  },
  {
    id: 'y7-ratios',
    year: 7,
    title: 'Ratios and rates',
    strand: 'Number and algebra',
    outcomes: ['MA4-RAT-C-01'],
    blurb: 'Simplify ratios, divide quantities in a ratio and use rates.',
    colour: 55,
    skills: [
      {
        id: 'y7-rat-simplify',
        title: 'Simplifying ratios',
        outcomes: ['MA4-RAT-C-01'],
        summary: 'Write ratios in simplest form, including with units, decimals and fractions.',
        learn: {
          intro: '<p>A <b>ratio</b> compares quantities of the same kind, e.g. 2 : 3. Simplify ratios like fractions: divide every part by the HCF.</p>',
          keyPoints: ['Use the same units for every part first: 50 cm : 2 m = 50 : 200 = 1 : 4.', 'Clear decimals or fractions by multiplying every part by the same number.', 'Order matters: 2 : 3 is not the same as 3 : 2.'],
        },
        gen: rat_simplify,
        levels: { 1: 'Whole numbers', 2: 'Units and decimals', 3: 'Three parts; fractions' },
      },
      {
        id: 'y7-rat-divide',
        title: 'Dividing in a ratio',
        outcomes: ['MA4-RAT-C-01'],
        summary: 'Share a quantity in a given ratio.',
        learn: {
          intro: '<p>To share $60 in the ratio 2 : 3: there are 2 + 3 = 5 parts, so one part is $12. The shares are $24 and $36.</p>',
          keyPoints: ['Total parts → value of one part → each share.', 'If you know one share, use it to find the value of one part.'],
        },
        gen: rat_divide,
        levels: { 1: 'Two parts', 2: 'Three parts', 3: 'Working backwards' },
      },
      {
        id: 'y7-rat-rates',
        title: 'Rates',
        outcomes: ['MA4-RAT-C-01'],
        summary: 'Find and use rates such as speed, price per kilogram and pay per hour.',
        learn: {
          intro: '<p>A <b>rate</b> compares quantities with different units, e.g. 60 km/h or $4.50/kg.</p>',
          keyPoints: ['Unit rate: divide to find the amount for 1 unit.', 'Speed = distance ÷ time; distance = speed × time.', 'Best buy: compare the price for the same amount (e.g. per kg).'],
        },
        gen: rat_rates,
        levels: { 1: 'Unit rates', 2: 'Using rates', 3: 'Best buys' },
      },
    ],
  },
]
