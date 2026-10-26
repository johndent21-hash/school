// Year 9 (Stage 5) — Data analysis, Probability, Similar figures
import type { Level, Question, Topic } from '@/lib/maths/types'
import {
  D, L, MINUS, TIMES, DIVIDE, chance, clean, frac, fracA, fracS, gcd, int, mcA, mcFixedA, num, numA, pick, q, sample,
  shuffle, v, round, name, approx, ordinal, NOT_TO_SCALE,
} from './helpers'

// ------------------------------------------------------------------ Data

const sortN = (a: number[]) => a.slice().sort((x, y) => x - y)
const med = (s: number[]) => {
  const n = s.length
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2
}
/** NSW method: halves exclude the median when n is odd. */
function quartiles(data: number[]) {
  const s = sortN(data)
  const n = s.length
  const lower = s.slice(0, Math.floor(n / 2))
  const upper = s.slice(Math.ceil(n / 2))
  return { s, Q1: med(lower), Q2: med(s), Q3: med(upper), lower, upper }
}

const data_quartiles = (level: Level): Question => {
  if (level === 1) {
    const n = pick([7, 9, 11])
    const data = Array.from({ length: n }, () => int(10, 60))
    const { s, Q1, Q3, lower, upper } = quartiles(data)
    const askQ1 = chance()
    return q({
      prompt: `These scores are in order:<div class="big">${s.join(', ')}</div>Find the ${askQ1 ? 'lower quartile (Q<sub>1</sub>)' : 'upper quartile (Q<sub>3</sub>)'}.`,
      answer: numA(askQ1 ? Q1 : Q3),
      hint: 'Find the median first. The lower quartile is the median of the lower half; the upper quartile is the median of the upper half. (With an odd number of scores, leave the median out of both halves.)',
      steps: [`Median = ${num(med(s))} (the ${ordinal((n + 1) / 2)} score)`, askQ1 ? `Lower half: ${lower.join(', ')}` : `Upper half: ${upper.join(', ')}`, `${askQ1 ? 'Q<sub>1</sub>' : 'Q<sub>3</sub>'} = ${num(askQ1 ? Q1 : Q3)}`],
    })
  }
  if (level === 2) {
    const n = pick([8, 10, 12])
    const data = Array.from({ length: n }, () => int(5, 80))
    const { s, Q1, Q3, lower, upper } = quartiles(data)
    return q({
      prompt: `Find the interquartile range of these scores:<div class="big">${data.join(', ')}</div>`,
      answer: numA(Q3 - Q1),
      hint: 'Sort the data. Split it into a lower half and an upper half. IQR = Q₃ − Q₁.',
      steps: [`In order: ${s.join(', ')}`, `Lower half: ${lower.join(', ')} → Q<sub>1</sub> = ${num(Q1)}`, `Upper half: ${upper.join(', ')} → Q<sub>3</sub> = ${num(Q3)}`, `IQR = ${num(Q3)} ${MINUS} ${num(Q1)} = ${num(Q3 - Q1)}`],
    })
  }
  const mn = int(10, 30)
  const q1 = mn + int(3, 12)
  const q2 = q1 + int(2, 10)
  const q3 = q2 + int(2, 10)
  const mx = q3 + int(3, 15)
  const lo = Math.floor(mn / 10) * 10
  const hi = Math.ceil(mx / 10) * 10
  const t = pick(['iqr', 'range', 'pct'])
  const diagram = D.boxPlot([mn, q1, q2, q3, mx], lo, hi, hi - lo > 60 ? 10 : 5, 'Time to complete a puzzle (seconds)')
  if (t === 'pct') {
    return q({
      prompt: `The box plot shows the times taken by a class to complete a puzzle. What percentage of the students took between ${q1} and ${mx} seconds?`,
      diagram,
      answer: numA(75),
      suffix: '%',
      hint: 'Each section of a box plot (whisker or half-box) holds about 25% of the data.',
      steps: [`${q1} is Q<sub>1</sub> and ${mx} is the maximum.`, 'From Q<sub>1</sub> to the maximum is three quarters of the data: 75%.'],
    })
  }
  return q({
    prompt: `The box plot shows the times taken by a class to complete a puzzle. Find the ${t === 'iqr' ? 'interquartile range' : 'range'}.`,
    diagram,
    answer: numA(t === 'iqr' ? q3 - q1 : mx - mn),
    suffix: 's',
    hint: t === 'iqr' ? 'IQR = Q₃ − Q₁: the length of the box.' : 'Range = maximum − minimum: the ends of the whiskers.',
    steps: [`Five-number summary: min ${mn}, Q<sub>1</sub> ${q1}, median ${q2}, Q<sub>3</sub> ${q3}, max ${mx}`, t === 'iqr' ? `IQR = ${q3} ${MINUS} ${q1} = ${q3 - q1} s` : `Range = ${mx} ${MINUS} ${mn} = ${mx - mn} s`],
  })
}

const SHAPES: Record<string, number[]> = {
  Symmetric: [1, 3, 6, 9, 6, 3, 1],
  'Positively skewed': [4, 9, 7, 5, 3, 2, 1],
  'Negatively skewed': [1, 2, 3, 5, 7, 9, 4],
  Bimodal: [2, 7, 4, 1, 4, 8, 3],
}
const SHAPE_WHY: Record<string, string> = {
  Symmetric: 'The two sides are roughly mirror images of each other.',
  'Positively skewed': 'Most scores are on the left (low values) and the tail stretches out to the right.',
  'Negatively skewed': 'Most scores are on the right (high values) and the tail stretches out to the left.',
  Bimodal: 'There are two separate peaks.',
}

const data_shape = (level: Level): Question => {
  const names = Object.keys(SHAPES)
  if (level <= 2) {
    const shape = pick(level === 1 ? names.slice(0, 3) : names)
    const base = SHAPES[shape].map((f) => Math.max(1, f + int(-1, 1)))
    if (shape === 'Positively skewed') base[0] = Math.max(base[0], 3)
    return q({
      prompt: `Describe the shape of this distribution.`,
      diagram: level === 1 ? D.histogram(base) : D.dotPlot(base.flatMap((f, i) => Array(f).fill(i + 1)), 1, base.length),
      answer: mcFixedA(level === 1 ? names.slice(0, 3) : names, shape),
      hint: 'Look at where most of the data sits, and which way the tail points.',
      steps: [SHAPE_WHY[shape], `The distribution is ${shape.toLowerCase()}.`],
    })
  }
  const shape = pick(['Positively skewed', 'Negatively skewed', 'Symmetric'])
  const ans = shape === 'Positively skewed' ? 'The mean is greater than the median' : shape === 'Negatively skewed' ? 'The mean is less than the median' : 'The mean and median are about equal'
  return q({
    prompt: `A distribution is <b>${shape.toLowerCase()}</b>. Which statement is most likely to be true?`,
    answer: mcFixedA(['The mean is greater than the median', 'The mean is less than the median', 'The mean and median are about equal'], ans),
    hint: 'The mean is pulled towards the tail; the median is not.',
    steps: [shape === 'Symmetric' ? 'With no tail, the mean and median are close together.' : `The tail is on the ${shape === 'Positively skewed' ? 'right (high values), pulling the mean up' : 'left (low values), pulling the mean down'}.`, `${ans}.`],
  })
}

const data_grouped = (level: Level): Question => {
  const starts = [40, 50, 60, 70, 80, 90]
  const classes = starts.map((s0) => `${s0}–${s0 + 9}`)
  const freqs = starts.map(() => int(1, 9))
  const total = freqs.reduce((a, b) => a + b, 0)
  const tbl = D.table(['Mark', 'Frequency'], classes.map((c, i) => [c, freqs[i]]))
  if (level === 1) {
    const mx = Math.max(...freqs)
    if (freqs.filter((f) => f === mx).length > 1) return data_grouped(1)
    const cls = classes[freqs.indexOf(mx)]
    return q({
      prompt: `The table shows the percentage marks of a Year 9 class in a maths test.${tbl}What is the modal class?`,
      answer: mcFixedA(classes, cls),
      hint: 'The modal class is the class with the highest frequency.',
      steps: [`The highest frequency is ${mx}, for the class ${cls}.`],
    })
  }
  if (level === 2) {
    const i = int(0, 5)
    return q({
      prompt: `The table shows the percentage marks of a Year 9 class in a maths test.${tbl}What is the class centre of the class ${classes[i]}?`,
      answer: numA((starts[i] + starts[i] + 9) / 2),
      hint: 'Class centre = (lowest value + highest value) ÷ 2.',
      steps: [`(${starts[i]} + ${starts[i] + 9}) ${DIVIDE} 2 = ${num((2 * starts[i] + 9) / 2)}`],
    })
  }
  const centres = starts.map((s0) => s0 + 4.5)
  const sum = centres.reduce((s, c, i) => s + c * freqs[i], 0)
  const mean = sum / total
  return q({
    prompt: `The table shows the percentage marks of a Year 9 class in a maths test.${tbl}Use class centres to estimate the mean mark, correct to 1 decimal place.`,
    answer: numA(mean, 1),
    calc: true,
    hint: 'Multiply each class centre by its frequency, add these, then divide by the total frequency.',
    steps: [D.table(['Class centre (x)', 'f', 'f × x'], centres.map((c, i) => [num(c), freqs[i], num(c * freqs[i])])), `Σ(f × x) = ${num(sum)}, Σf = ${total}`, `Mean ≈ ${num(sum)} ${DIVIDE} ${total} ${approx(mean, 1)}`],
  })
}

// ------------------------------------------------------------------ Probability

const prob_twostep = (level: Level): Question => {
  if (level === 1) {
    const t = pick(['coins', 'coin-die', 'cards'])
    if (t === 'coins') {
      const [desc, fav] = pick([
        ['two heads', 1],
        ['one head and one tail', 2],
        ['at least one head', 3],
        ['no heads', 1],
      ] as [string, number][])
      return q({
        prompt: `Two coins are tossed. What is the probability of getting ${desc}?`,
        answer: fracA(fav, 4, { allowDecimal: true }),
        hint: 'List the sample space: HH, HT, TH, TT.',
        steps: ['Sample space: HH, HT, TH, TT (4 equally likely outcomes)', `Favourable outcomes: ${fav}`, `P = ${frac(fav, 4)}${gcd(fav, 4) > 1 ? ' = ' + fracS(fav, 4) : ''}`],
      })
    }
    if (t === 'coin-die') {
      const [desc, fav] = pick([
        ['a head and a 6', 1],
        ['a tail and an even number', 3],
        ['a head and a number less than 3', 2],
      ] as [string, number][])
      return q({
        prompt: `A coin is tossed and a die is rolled. What is the probability of getting ${desc}?`,
        answer: fracA(fav, 12, { allowDecimal: true }),
        hint: 'There are 2 × 6 = 12 equally likely outcomes.',
        steps: ['Sample space: H1, H2, …, H6, T1, …, T6 (12 outcomes)', `Favourable outcomes: ${fav}`, `P = ${frac(fav, 12)}${gcd(fav, 12) > 1 ? ' = ' + fracS(fav, 12) : ''}`],
      })
    }
    const [desc, fav] = pick([
      ['a heart', 13],
      ['a king', 4],
      ['a red card', 26],
      ['a picture card (jack, queen or king)', 12],
      ['the ace of spades', 1],
      ['a black 7', 2],
    ] as [string, number][])
    return q({
      prompt: `A card is drawn at random from a standard deck of 52 playing cards. What is the probability that it is ${desc}?`,
      answer: fracA(fav, 52, { allowDecimal: true }),
      hint: 'A deck has 4 suits (hearts, diamonds, clubs, spades) of 13 cards each. Hearts and diamonds are red.',
      steps: [`Favourable cards: ${fav}`, `P = ${frac(fav, 52)}${gcd(fav, 52) > 1 ? ' = ' + fracS(fav, 52) : ''}`],
    })
  }
  if (level === 2) {
    const t = pick(['sum', 'double', 'product'])
    let fav = 0
    let desc = ''
    const target = int(2, 12)
    for (let a = 1; a <= 6; a++)
      for (let b = 1; b <= 6; b++) {
        if (t === 'sum' && a + b === target) fav++
        if (t === 'double' && a === b) fav++
        if (t === 'product' && (a * b) % 2 === 0) fav++
      }
    desc = t === 'sum' ? `a total of ${target}` : t === 'double' ? 'a double (both dice the same)' : 'an even product'
    const grid = D.table(['+', 1, 2, 3, 4, 5, 6].map(String), [1, 2, 3, 4, 5, 6].map((a) => [a, ...[1, 2, 3, 4, 5, 6].map((b) => (t === 'product' ? a * b : a + b))]))
    return q({
      prompt: `Two dice are rolled. What is the probability of ${desc}?`,
      answer: fracA(fav, 36, { allowDecimal: true }),
      hint: 'Draw a 6 × 6 table of outcomes. There are 36 equally likely outcomes.',
      steps: [`Table of ${t === 'product' ? 'products' : 'totals'}:${grid.replace('<th>+</th>', `<th>${t === 'product' ? TIMES : '+'}</th>`)}`, `Favourable outcomes: ${fav}`, `P = ${frac(fav, 36)}${gcd(fav, 36) > 1 ? ' = ' + fracS(fav, 36) : ''}`],
    })
  }
  const r = int(3, 8)
  const b = int(2, 7)
  const T = r + b
  const t = pick(['RR', 'BB', 'one of each'])
  let n = 0
  let d = T * (T - 1)
  let steps: string[] = []
  if (t === 'RR') {
    n = r * (r - 1)
    steps = [`P(1st red) = ${frac(r, T)}`, `P(2nd red, given the 1st was red) = ${frac(r - 1, T - 1)}`, `P(both red) = ${frac(r, T)} ${TIMES} ${frac(r - 1, T - 1)} = ${frac(n, d)}`]
  } else if (t === 'BB') {
    n = b * (b - 1)
    steps = [`P(1st blue) = ${frac(b, T)}`, `P(2nd blue) = ${frac(b - 1, T - 1)}`, `P(both blue) = ${frac(b, T)} ${TIMES} ${frac(b - 1, T - 1)} = ${frac(n, d)}`]
  } else {
    n = 2 * r * b
    steps = [`P(red then blue) = ${frac(r, T)} ${TIMES} ${frac(b, T - 1)} = ${frac(r * b, d)}`, `P(blue then red) = ${frac(b, T)} ${TIMES} ${frac(r, T - 1)} = ${frac(r * b, d)}`, `Total = ${frac(n, d)}`]
  }
  void d
  d = T * (T - 1)
  return q({
    prompt: `A bag contains ${r} red and ${b} blue marbles. Two marbles are taken out at random <b>without replacement</b>. What is the probability that ${t === 'RR' ? 'both are red' : t === 'BB' ? 'both are blue' : 'one is red and one is blue'}?`,
    answer: fracA(n, d, { allowDecimal: true }),
    hint: 'After the first marble is taken, there is one fewer marble in the bag. Multiply along the branches of a tree diagram.',
    steps: [...steps, gcd(n, d) > 1 ? `= ${fracS(n, d)}` : 'This is in simplest form.'],
  })
}

const prob_venn = (level: Level): Question => {
  const [A, B] = pick([
    ['Soccer', 'Swimming'],
    ['Band', 'Choir'],
    ['Netball', 'Basketball'],
    ['Maths club', 'Debating'],
  ])
  const onlyA = int(3, 15)
  const both = int(1, 8)
  const onlyB = int(3, 15)
  const neither = int(1, 9)
  const total = onlyA + both + onlyB + neither
  const diagram = D.venn(A, B, String(onlyA), String(both), String(onlyB), String(neither))
  const ctx = 'the activities students take part in'
  if (level === 1) {
    const t = pick(['both', 'total', 'onlyB', 'A'])
    const ans = t === 'both' ? both : t === 'total' ? total : t === 'onlyB' ? onlyB : onlyA + both
    const qtext = t === 'both' ? `How many students chose both ${A} and ${B}?` : t === 'total' ? 'How many students were surveyed altogether?' : t === 'onlyB' ? `How many students chose ${B} only?` : `How many students chose ${A} (including those who also chose ${B})?`
    return q({
      prompt: `The Venn diagram shows ${ctx} in a Year 9 class. ${qtext}`,
      diagram,
      answer: numA(ans),
      hint: 'The overlap is “both”. The number outside the circles is “neither”.',
      steps: [t === 'both' ? `The overlap shows ${both}.` : t === 'total' ? `${onlyA} + ${both} + ${onlyB} + ${neither} = ${total}` : t === 'onlyB' ? `The part of the ${B} circle outside the overlap: ${onlyB}` : `${onlyA} + ${both} = ${onlyA + both}`],
    })
  }
  if (level === 2) {
    const t = pick(['or', 'and', 'notA', 'neither'])
    const fav = t === 'or' ? onlyA + both + onlyB : t === 'and' ? both : t === 'notA' ? onlyB + neither : neither
    const desc = t === 'or' ? `${A} or ${B} (or both)` : t === 'and' ? `both ${A} and ${B}` : t === 'notA' ? `not ${A}` : `neither ${A} nor ${B}`
    return q({
      prompt: `The Venn diagram shows ${ctx} in a Year 9 class. A student is chosen at random. What is the probability that the student chose ${desc}?`,
      diagram,
      answer: fracA(fav, total, { allowDecimal: true }),
      hint: 'Count the students in the regions that match, then divide by the total.',
      steps: [`Total = ${total}`, `Favourable = ${fav}`, `P = ${frac(fav, total)}${gcd(fav, total) > 1 ? ' = ' + fracS(fav, total) : ''}`],
    })
  }
  const nA = onlyA + both
  const nB = onlyB + both
  return q({
    prompt: `In a class of ${total} students, ${nA} take part in ${A.toLowerCase()}, ${nB} take part in ${B.toLowerCase()} and ${both} take part in both. How many students take part in neither?`,
    answer: numA(neither),
    hint: 'Draw a Venn diagram. Fill in the overlap first, then the “only” regions.',
    steps: [`Only ${A}: ${nA} ${MINUS} ${both} = ${onlyA}`, `Only ${B}: ${nB} ${MINUS} ${both} = ${onlyB}`, `Neither: ${total} ${MINUS} (${onlyA} + ${both} + ${onlyB}) = ${neither}`],
  })
}

const prob_twoway = (level: Level): Question => {
  const rows = ['Men', 'Women']
  const cols = pick([
    ['Tea', 'Coffee'],
    ['Beach', 'Bush'],
    ['Online', 'In store'],
  ])
  const topic = cols[0] === 'Tea' ? 'whether they prefer tea or coffee' : cols[0] === 'Beach' ? 'whether they prefer beach or bush holidays' : 'whether they prefer shopping online or in store'
  const cells = [
    [int(5, 30), int(5, 30)],
    [int(5, 30), int(5, 30)],
  ]
  const total = cells.flat().reduce((a, b) => a + b, 0)
  const tbl = D.table(['', ...cols, 'Total'], [
    [rows[0], cells[0][0], cells[0][1], cells[0][0] + cells[0][1]],
    [rows[1], cells[1][0], cells[1][1], cells[1][0] + cells[1][1]],
    ['Total', cells[0][0] + cells[1][0], cells[0][1] + cells[1][1], total],
  ])
  const ctx = `A group of adults was surveyed on ${topic}.${tbl}`
  if (level === 1) {
    const j = int(0, 1)
    return q({
      prompt: `${ctx}How many people preferred ${cols[j].toLowerCase()}?`,
      answer: numA(cells[0][j] + cells[1][j]),
      hint: 'Use the column total.',
      steps: [`${cells[0][j]} + ${cells[1][j]} = ${cells[0][j] + cells[1][j]}`],
    })
  }
  const i = int(0, 1)
  const j = int(0, 1)
  if (level === 2) {
    return q({
      prompt: `${ctx}A person is chosen at random. What is the probability that the person is one of the ${rows[i].toLowerCase()} who preferred ${cols[j].toLowerCase()}?`,
      answer: fracA(cells[i][j], total, { allowDecimal: true }),
      hint: 'Use the cell for that row and column, and the overall total.',
      steps: [`${rows[i]} who preferred ${cols[j].toLowerCase()}: ${cells[i][j]}`, `Total surveyed: ${total}`, `P = ${frac(cells[i][j], total)}${gcd(cells[i][j], total) > 1 ? ' = ' + fracS(cells[i][j], total) : ''}`],
    })
  }
  const rowT = cells[i][0] + cells[i][1]
  return q({
    prompt: `${ctx}One of the <b>${rows[i].toLowerCase()}</b> is chosen at random. What is the probability that this person preferred ${cols[j].toLowerCase()}?`,
    answer: fracA(cells[i][j], rowT, { allowDecimal: true }),
    hint: `Only ${rows[i].toLowerCase()} are being chosen from, so use the ${rows[i].toLowerCase()} row total.`,
    steps: [`${rows[i]}: ${rowT} in total`, `${rows[i]} who preferred ${cols[j].toLowerCase()}: ${cells[i][j]}`, `P = ${frac(cells[i][j], rowT)}${gcd(cells[i][j], rowT) > 1 ? ' = ' + fracS(cells[i][j], rowT) : ''}`],
  })
}

// ------------------------------------------------------------------ Similar figures

const sim_factor = (level: Level): Question => {
  const u = pick(['cm', 'm', 'mm'])
  const A = int(35, 75)
  const B = int(40, 80)
  if (A + B >= 160) return sim_factor(level)
  const base = [int(3, 9), int(3, 9), int(3, 9)]
  const C = 180 - A - B
  // side lengths proportional to sines (so the drawing is consistent): AB opposite C, BC opposite A, CA opposite B
  const sides = [Math.sin((C * Math.PI) / 180), Math.sin((A * Math.PI) / 180), Math.sin((B * Math.PI) / 180)]
  const unit = pick([4, 5, 6, 8, 10])
  const s1 = sides.map((s0) => Math.round(s0 * unit))
  void base
  if (new Set(s1).size < 3 || s1.some((z) => z < 2)) return sim_factor(level)
  if (level === 1) {
    const k = pick([2, 3, 4, 1.5, 2.5])
    const s2 = s1.map((z) => clean(z * k))
    const i = int(0, 2)
    return q({
      prompt: 'The two triangles are similar. What is the scale factor of the enlargement?',
      diagram: D.similarTriangles(A, B, Math.min(k, 2.2), [i === 0 ? `${s1[0]} ${u}` : '', i === 1 ? `${s1[1]} ${u}` : '', i === 2 ? `${s1[2]} ${u}` : ''], [i === 0 ? `${num(s2[0])} ${u}` : '', i === 1 ? `${num(s2[1])} ${u}` : '', i === 2 ? `${num(s2[2])} ${u}` : '']),
      note: NOT_TO_SCALE,
      answer: numA(k),
      hint: 'Scale factor = length in the image ÷ matching length in the original.',
      steps: [`Matching sides: ${s1[i]} ${u} and ${num(s2[i])} ${u}`, `Scale factor = ${num(s2[i])} ${DIVIDE} ${s1[i]} = ${num(k)}`],
    })
  }
  const k = pick(level === 2 ? [2, 3, 1.5, 2.5] : [1.5, 2.5, 1.2, 0.5, 0.75])
  const s2 = s1.map((z) => clean(z * k))
  const [i, j] = sample([0, 1, 2], 2)
  if (level === 2) {
    const l1: [string, string, string] = ['', '', '']
    const l2: [string, string, string] = ['', '', '']
    l1[i] = `${s1[i]} ${u}`
    l2[i] = `${num(s2[i])} ${u}`
    l1[j] = `${s1[j]} ${u}`
    l2[j] = v('x')
    return q({
      prompt: `The two triangles are similar (matching angles are marked). Find the value of ${v('x')}.`,
      diagram: D.similarTriangles(A, B, Math.min(Math.max(k, 1.3), 2.2), l1, l2),
      note: NOT_TO_SCALE,
      answer: numA(s2[j]),
      suffix: u,
      hint: 'Find the scale factor from a pair of matching sides you know, then multiply.',
      steps: [`Scale factor = ${num(s2[i])} ${DIVIDE} ${s1[i]} = ${num(k)}`, `${v('x')} = ${s1[j]} ${TIMES} ${num(k)} = ${num(s2[j])} ${u}`],
    })
  }
  const l1: [string, string, string] = ['', '', '']
  const l2: [string, string, string] = ['', '', '']
  l1[i] = `${s1[i]} ${u}`
  l2[i] = `${num(s2[i])} ${u}`
  l1[j] = v('y')
  l2[j] = `${num(s2[j])} ${u}`
  return q({
    prompt: `The two triangles are similar (matching angles are marked). Find the value of ${v('y')}.`,
    diagram: D.similarTriangles(A, B, 1.6, l1, l2),
    note: NOT_TO_SCALE,
    answer: numA(s1[j]),
    suffix: u,
    hint: 'Find the scale factor from the first triangle to the second, then divide to go back.',
    steps: [`Scale factor = ${num(s2[i])} ${DIVIDE} ${s1[i]} = ${num(k)}`, `${v('y')} = ${num(s2[j])} ${DIVIDE} ${num(k)} = ${s1[j]} ${u}`],
  })
}

const sim_test = (level: Level): Question => {
  if (level === 1) {
    const a = int(2, 9)
    const b = int(2, 9)
    if (a === b) return sim_test(1)
    const k = pick([2, 3, 1.5, 2.5])
    const similar = chance()
    const c = clean(a * k)
    const d = clean(b * k + (similar ? 0 : pick([-1, 1, 2])))
    return q({
      prompt: `Rectangle A is ${a} cm by ${b} cm. Rectangle B is ${num(c)} cm by ${num(d)} cm. Are the rectangles similar?`,
      answer: mcFixedA(['Yes', 'No'], similar ? 'Yes' : 'No'),
      hint: 'Find the scale factor for the lengths and for the widths. They must be the same.',
      steps: [`${num(c)} ${DIVIDE} ${a} = ${num(k)}`, `${num(d)} ${DIVIDE} ${b} ${approx(d / b, 3)}`, similar ? 'The scale factors are equal, so the rectangles are similar.' : 'The scale factors are different, so the rectangles are not similar.'],
    })
  }
  if (level === 2) {
    const s = sample([3, 4, 5, 6, 7, 8, 9], 3).sort((x, y) => x - y)
    if (s[0] + s[1] <= s[2]) return sim_test(2)
    const k = pick([2, 3, 1.5])
    const similar = chance()
    const t = s.map((z) => clean(z * k))
    if (!similar) t[2] = clean(t[2] + pick([1, 2]))
    return q({
      prompt: `Triangle 1 has sides ${s.join(' cm, ')} cm. Triangle 2 has sides ${t.map((z) => num(z)).join(' cm, ')} cm. Are the triangles similar?`,
      answer: mcFixedA(['Yes', 'No'], similar ? 'Yes' : 'No'),
      hint: 'Match the shortest with the shortest, and so on. Check whether all three ratios are equal.',
      steps: [s.map((z, i) => `${num(t[i])} ${DIVIDE} ${z} = ${num(round(t[i] / z, 3))}`).join('; '), similar ? 'All ratios are equal, so the triangles are similar.' : 'The ratios are not all equal, so the triangles are not similar.'],
    })
  }
  const a = int(3, 9)
  const b = intExceptHelper(3, 12, a)
  const k = pick([2, 3, 4, 1.5, 2.5])
  return q({
    prompt: `A rectangle is ${a} cm by ${b} cm. A similar rectangle has a length of ${num(clean(a * k))} cm (matching the ${a} cm side). What is its width?`,
    answer: numA(clean(b * k)),
    suffix: 'cm',
    hint: 'Find the scale factor, then multiply the width by it.',
    steps: [`Scale factor = ${num(clean(a * k))} ${DIVIDE} ${a} = ${num(k)}`, `Width = ${b} ${TIMES} ${num(k)} = ${num(clean(b * k))} cm`],
  })
}
function intExceptHelper(lo: number, hi: number, not: number): number {
  for (;;) {
    const z = int(lo, hi)
    if (z !== not) return z
  }
}

const sim_problems = (level: Level): Question => {
  if (level === 1) {
    const stick = pick([0.6, 0.8, 1, 1.2, 1.5])
    const sShadow = pick([0.4, 0.5, 0.75, 0.9, 1.2, 1.6])
    const pShadow = pick([8, 10, 12, 15, 18, 20, 24])
    const h = (stick / sShadow) * pShadow
    return q({
      prompt: `At the same time of day, a ${num(stick)} m stick casts a shadow ${num(sShadow)} m long, and a flagpole casts a shadow ${pShadow} m long. How tall is the flagpole? Answer correct to 1 decimal place if needed.`,
      answer: numA(h, 1),
      suffix: 'm',
      calc: true,
      hint: 'The stick and its shadow form a triangle similar to the flagpole and its shadow.',
      steps: [`Scale factor = ${pShadow} ${DIVIDE} ${num(sShadow)} ${approx(pShadow / sShadow, 3)}`, `Height = ${num(stick)} ${TIMES} ${frac(pShadow, num(sShadow))} ${approx(h, 1)} m`],
    })
  }
  if (level === 2) {
    const sc = pick([50, 100, 200])
    const a = pick([2.5, 3, 3.5, 4, 4.5, 6])
    const b = pick([2, 2.5, 3, 4, 5])
    const ra = (a * sc) / 100
    const rb = (b * sc) / 100
    return q({
      prompt: `A floor plan is drawn to a scale of 1 : ${sc}. A bedroom measures ${num(a)} cm by ${num(b)} cm on the plan. What is the real floor area of the bedroom, in square metres?`,
      answer: numA(clean(ra * rb)),
      suffix: 'm²',
      hint: 'Find the real length and width first (in metres), then multiply.',
      steps: [`Real length: ${num(a)} ${TIMES} ${sc} = ${num(a * sc)} cm = ${num(clean(ra))} m`, `Real width: ${num(b)} ${TIMES} ${sc} = ${num(b * sc)} cm = ${num(clean(rb))} m`, `Area = ${num(clean(ra))} ${TIMES} ${num(clean(rb))} = ${num(clean(ra * rb))} m²`],
    })
  }
  const person = pick([1.5, 1.6, 1.7, 1.8])
  const d = pick([2, 3, 4, 5, 6])
  const sh = pick([1.5, 2, 2.5, 3])
  const lamp = (person * (d + sh)) / sh
  return q({
    prompt: `${name()} is ${num(person)} m tall and stands ${d} m from a street light. Their shadow is ${num(sh)} m long. How high is the light, correct to 1 decimal place?`,
    answer: numA(lamp, 1),
    suffix: 'm',
    calc: true,
    hint: 'The small triangle (person and shadow) and the big triangle (light, distance plus shadow) are similar. The big triangle’s base is the distance plus the shadow.',
    steps: [`Big triangle base = ${d} + ${num(sh)} = ${num(d + sh)} m`, `Scale factor = ${num(d + sh)} ${DIVIDE} ${num(sh)} ${approx((d + sh) / sh, 3)}`, `Height = ${num(person)} ${TIMES} ${frac(num(d + sh), num(sh))} ${approx(lamp, 1)} m`],
  })
}

// ------------------------------------------------------------------ Topics

export const Y9C: Topic[] = [
  {
    id: 'y9-data',
    year: 9,
    title: 'Analysing data',
    strand: 'Statistics and probability',
    outcomes: ['MA5-DAT-C-01', 'MA5-DAT-C-02'],
    blurb: 'Quartiles, box plots, the shape of distributions and grouped data.',
    colour: 12,
    skills: [
      {
        id: 'y9-data-quartiles',
        title: 'Quartiles, IQR and box plots',
        outcomes: ['MA5-DAT-C-02'],
        summary: 'Find quartiles and the interquartile range; read box plots.',
        learn: {
          intro: '<p>Quartiles split ordered data into four equal parts. The <b>interquartile range</b> (IQR = Q₃ − Q₁) measures the spread of the middle 50% of the data.</p>',
          keyPoints: ['Q₁ is the median of the lower half; Q₃ is the median of the upper half.', 'With an odd number of scores, leave the median out of both halves.', 'A box plot shows the five-number summary: minimum, Q₁, median, Q₃, maximum. Each section holds about 25% of the data.'],
        },
        gen: data_quartiles,
        levels: { 1: 'Find a quartile', 2: 'Interquartile range', 3: 'Box plots' },
      },
      {
        id: 'y9-data-shape',
        title: 'Shape of a distribution',
        outcomes: ['MA5-DAT-C-01', 'MA5-DAT-C-02'],
        summary: 'Describe distributions as symmetric, skewed or bimodal.',
        learn: {
          intro: '<p>The shape of a graph tells you how the data are spread.</p>',
          keyPoints: ['Symmetric: both sides look alike.', 'Positively skewed: tail to the right (high values). Negatively skewed: tail to the left.', 'Bimodal: two peaks.', 'The mean is pulled towards the tail.'],
        },
        gen: data_shape,
        levels: { 1: 'Histograms', 2: 'Dot plots, including bimodal', 3: 'Mean versus median' },
      },
      {
        id: 'y9-data-grouped',
        title: 'Grouped data',
        outcomes: ['MA5-DAT-C-02'],
        summary: 'Find the modal class and class centres, and estimate the mean.',
        learn: {
          intro: '<p>When data are grouped into classes, we lose the exact values, so we use the <b>class centre</b> to estimate the mean.</p>',
          keyPoints: ['Class centre = (lowest + highest value in the class) ÷ 2', 'Estimated mean = Σ(f × class centre) ÷ Σf', 'Modal class: the class with the highest frequency.'],
        },
        gen: data_grouped,
        levels: { 1: 'Modal class', 2: 'Class centres', 3: 'Estimate the mean' },
      },
    ],
  },
  {
    id: 'y9-probability',
    year: 9,
    title: 'Probability',
    strand: 'Statistics and probability',
    outcomes: ['MA5-PRO-C-01'],
    blurb: 'Two-step experiments, Venn diagrams and two-way tables.',
    colour: 170,
    skills: [
      {
        id: 'y9-prob-twostep',
        title: 'Two-step experiments',
        outcomes: ['MA5-PRO-C-01'],
        summary: 'Use lists, tables and tree diagrams for two-step experiments, with and without replacement.',
        learn: {
          intro: '<p>For two-step experiments, list every outcome in a table or tree diagram. For “without replacement”, the second probability changes because one item has been removed.</p>',
          keyPoints: ['Two coins: HH, HT, TH, TT', 'Two dice: 6 × 6 = 36 outcomes', 'Without replacement: P(red, red) = (r/T) × ((r − 1)/(T − 1))'],
        },
        gen: prob_twostep,
        levels: { 1: 'Coins, dice and cards', 2: 'Two dice', 3: 'Without replacement' },
      },
      {
        id: 'y9-prob-venn',
        title: 'Venn diagrams',
        outcomes: ['MA5-PRO-C-01'],
        summary: 'Read and complete Venn diagrams and find probabilities from them.',
        learn: {
          intro: '<p>A Venn diagram shows how two groups overlap. The overlap is “both”; the region outside both circles is “neither”.</p>',
          keyPoints: ['“A or B” includes A only, B only and both.', '“A and B” is just the overlap.', 'Fill in the overlap first when completing a Venn diagram.'],
        },
        gen: prob_venn,
        levels: { 1: 'Reading counts', 2: 'Probabilities', 3: 'Completing the diagram' },
      },
      {
        id: 'y9-prob-twoway',
        title: 'Two-way tables',
        outcomes: ['MA5-PRO-C-01'],
        summary: 'Find probabilities from two-way tables.',
        learn: {
          intro: '<p>A two-way table organises data by two categories at once. Row and column totals help you find probabilities.</p>',
          keyPoints: ['Use the overall total when anyone could be chosen.', 'If only one group is being chosen from, use that group’s total.'],
        },
        gen: prob_twoway,
        levels: { 1: 'Reading the table', 2: 'Probabilities from the total', 3: 'Choosing from one group' },
      },
    ],
  },
  {
    id: 'y9-similar',
    year: 9,
    title: 'Similar figures',
    strand: 'Measurement and space',
    outcomes: ['MA5-GEO-C-01'],
    blurb: 'Scale factors, testing for similarity, and problems using similar figures.',
    colour: 38,
    skills: [
      {
        id: 'y9-sim-factor',
        title: 'Scale factors and missing sides',
        outcomes: ['MA5-GEO-C-01'],
        summary: 'Find scale factors and use them to find unknown sides of similar figures.',
        learn: {
          intro: '<p><b>Similar figures</b> have the same shape: matching angles are equal and matching sides are in the same ratio. That ratio is the <b>scale factor</b>.</p>',
          keyPoints: ['Scale factor = image length ÷ original length', 'Multiply by the scale factor to go from original to image; divide to go back.', 'Match sides using the equal angles.'],
        },
        gen: sim_factor,
        levels: { 1: 'Find the scale factor', 2: 'Enlargements', 3: 'Working backwards' },
      },
      {
        id: 'y9-sim-test',
        title: 'Testing for similarity',
        outcomes: ['MA5-GEO-C-01'],
        summary: 'Decide whether figures are similar by comparing ratios of sides.',
        learn: {
          intro: '<p>Two figures are similar if every pair of matching sides has the same ratio (and matching angles are equal).</p>',
          keyPoints: ['Compare shortest with shortest, longest with longest.', 'If any ratio is different, the figures are not similar.'],
        },
        gen: sim_test,
        levels: { 1: 'Rectangles', 2: 'Triangles', 3: 'Find a missing side' },
      },
      {
        id: 'y9-sim-problems',
        title: 'Similarity problems',
        outcomes: ['MA5-GEO-C-01'],
        summary: 'Solve practical problems with shadows, plans and similar triangles.',
        learn: {
          intro: '<p>Many real situations make similar triangles, such as objects and their shadows at the same time of day.</p>',
          keyPoints: ['Draw both triangles separately and label matching sides.', 'With a person and a street light, the big triangle’s base includes the distance to the light.'],
        },
        gen: sim_problems,
        levels: { 1: 'Shadows', 2: 'Plans', 3: 'Street lights' },
      },
    ],
  },
]

void L
void sample
void shuffle
void mcA
