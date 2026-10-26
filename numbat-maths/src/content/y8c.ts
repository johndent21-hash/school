// Year 8 (Stage 4) — Linear relationships, Data, Probability
import type { Level, Question, Topic } from '@/lib/maths/types'
import {
  D, L, MINUS, TIMES, DIVIDE, bnum, chance, clean, frac, fracA, fracS, gcd, int, intExcept, mcA, mcFixedA, nonZero, num,
  numA, pick, pointA, q, sample, shuffle, exprA, v, ex, lin, round, name, signed, ordinal, approx,
} from './helpers'

// ------------------------------------------------------------------ Linear relationships

const ruleTxt = (m: number, c: number) => `y = ${lin(m, c)}`

const lin_online = (level: Level): Question => {
  const m = L(level, int(1, 4), nonZero(-4, 4), nonZero(-5, 5))
  const c = L(level, int(0, 6), int(-6, 6), int(-8, 8))
  if (level <= 2) {
    const x = L(level, int(0, 6), int(-5, 5), 0)
    const on = chance()
    const y = m * x + c + (on ? 0 : pick([-2, -1, 1, 2]))
    return q({
      prompt: `Does the point (${num(x)}, ${num(y)}) lie on the line ${ex(ruleTxt(m, c))}?`,
      answer: mcFixedA(['Yes', 'No'], on ? 'Yes' : 'No'),
      hint: `Substitute x = ${num(x)} into the rule and see whether you get y = ${num(y)}.`,
      steps: [`When x = ${num(x)}: y = ${m === 1 ? '' : m === -1 ? MINUS : num(m) + ' ' + TIMES + ' '}${bnum(x)}${c ? signed(c) : ''} = ${num(m * x + c)}`, on ? `This matches, so the point lies on the line.` : `${num(m * x + c)} ≠ ${num(y)}, so the point does not lie on the line.`],
    })
  }
  const xs = sample([-3, -2, -1, 0, 1, 2, 3, 4], 4)
  const pts = xs.map((x, i) => [x, m * x + c + (i === 0 ? 0 : pick([-3, -1, 1, 2]))])
  const fmt = (p: number[]) => `(${num(p[0])}, ${num(p[1])})`
  return q({
    prompt: `Which point lies on the line ${ex(ruleTxt(m, c))}?`,
    answer: mcA(fmt(pts[0]), pts.slice(1).map(fmt)),
    hint: 'Test each point: substitute its x-value and compare with its y-value.',
    steps: [...pts.map((p) => `x = ${num(p[0])}: y = ${num(m * p[0] + c)}${p[1] === m * p[0] + c ? ' ✓' : ` (not ${num(p[1])})`}`), `The point is ${fmt(pts[0])}.`],
  })
}

const lin_graph = (level: Level): Question => {
  if (level === 1) {
    const m = pick([1, 2, -1, -2])
    const c = int(-3, 3)
    const xsOk = [-4, -3, -2, -1, 0, 1, 2, 3, 4].filter((x) => Math.abs(m * x + c) <= 5)
    const x = pick(xsOk)
    return q({
      prompt: `The graph of a straight line is shown. Use the graph to find the value of ${v('y')} when ${v('x')} = ${num(x)}.`,
      diagram: D.numberPlane({ xmin: -5, xmax: 5, ymin: -6, ymax: 6, lines: [{ m, c }] }),
      answer: numA(m * x + c),
      hint: `Find ${num(x)} on the x-axis, go up or down to the line, then across to the y-axis.`,
      steps: [`At x = ${num(x)}, the line passes through the point (${num(x)}, ${num(m * x + c)}).`, `${v('y')} = ${num(m * x + c)}`],
    })
  }
  if (level === 2) {
    const m = pick([1, 2, -1, 0.5])
    const c = int(-3, 3)
    const cand = [-4, -2, 0, 2, 4].filter((x) => Math.abs(m * x + c) <= 5 && Number.isInteger(m * x + c))
    const x = pick(cand)
    const y = m * x + c
    return q({
      prompt: `Use the graph to find the value of ${v('x')} when ${v('y')} = ${num(y)}.`,
      diagram: D.numberPlane({ xmin: -5, xmax: 5, ymin: -6, ymax: 6, lines: [{ m, c }] }),
      answer: numA(x),
      hint: `Find ${num(y)} on the y-axis, go across to the line, then up or down to the x-axis.`,
      steps: [`The line passes through (${num(x)}, ${num(y)}).`, `${v('x')} = ${num(x)}`],
    })
  }
  // intersection of two lines with integer solution
  const X = int(-3, 3)
  const Y = int(-3, 4)
  const m1 = pick([1, 2, 3])
  const m2 = pick([-1, -2])
  const c1 = Y - m1 * X
  const c2 = Y - m2 * X
  return q({
    prompt: `Line A is ${ex(ruleTxt(m1, c1))} and line B is ${ex(ruleTxt(m2, c2))}. Use the graph to find the point where they intersect. (This point solves the equation ${ex(lin(m1, c1))} = ${ex(lin(m2, c2))}.)`,
    diagram: D.numberPlane({ xmin: -6, xmax: 6, ymin: -6, ymax: 6, lines: [{ m: m1, c: c1, label: 'A' }, { m: m2, c: c2, label: 'B' }] }),
    answer: pointA(X, Y),
    hint: 'Look for the point where the two lines cross. Check it by substituting into both rules.',
    steps: [`The lines cross at (${num(X)}, ${num(Y)}).`, `Check: ${num(m1)} ${TIMES} ${bnum(X)} ${c1 >= 0 ? '+' : MINUS} ${Math.abs(c1)} = ${num(Y)} ✓ and ${num(m2)} ${TIMES} ${bnum(X)} ${c2 >= 0 ? '+' : MINUS} ${Math.abs(c2)} = ${num(Y)} ✓`, `So ${v('x')} = ${num(X)} is the solution of the equation.`],
  })
}

const lin_rule = (level: Level): Question => {
  if (level === 1) {
    const m = pick([2, 3, 4, 5, -2, -3])
    const c = nonZero(-6, 7)
    const xs = [-2, -1, 0, 1, 2]
    return q({
      prompt: `Find the rule for this table of values.${D.hTable([[v('x'), ...xs.map((z) => num(z))], [v('y'), ...xs.map((z) => num(m * z + c))]])}`,
      answer: exprA(lin(m, c)),
      prefix: `${v('y')} =`,
      hint: `How much does ${v('y')} change when ${v('x')} goes up by 1? What is ${v('y')} when ${v('x')} = 0?`,
      steps: [`${v('y')} changes by ${num(m)} each time, so the rule contains ${ex(lin(m, 0))}.`, `When ${v('x')} = 0, ${v('y')} = ${num(c)}.`, `${v('y')} = ${ex(lin(m, c))}`],
    })
  }
  if (level === 2) {
    const m = pick([1, 2, 3, -1, -2])
    const c = int(-3, 3)
    const x1 = pick([-2, -1, 0])
    const x2 = x1 + pick([2, 3])
    const pts = [x1, x2].map((x) => ({ x, y: m * x + c })).filter((p) => Math.abs(p.y) <= 6)
    if (pts.length < 2) return lin_rule(2)
    return q({
      prompt: 'Find the rule of the line passing through the two marked points.',
      diagram: D.numberPlane({ xmin: -5, xmax: 5, ymin: -6, ymax: 6, lines: [{ m, c }], points: pts }),
      answer: exprA(lin(m, c)),
      prefix: `${v('y')} =`,
      hint: 'Make a table from points on the line, including where it crosses the y-axis.',
      steps: [`Points on the line include (${num(pts[0].x)}, ${num(pts[0].y)}) and (${num(pts[1].x)}, ${num(pts[1].y)}).`, `When x increases by ${pts[1].x - pts[0].x}, y changes by ${num(pts[1].y - pts[0].y)}, so y changes by ${num(m)} for each 1.`, `The line crosses the y-axis at ${num(c)}.`, `${v('y')} = ${ex(lin(m, c))}`],
    })
  }
  const shape = pick(['squares', 'triangles', 'hexagons'])
  const per = shape === 'squares' ? 3 : shape === 'triangles' ? 2 : 5
  const first = per + 1
  const seq = [1, 2, 3, 4].map((n) => per * n + 1)
  return q({
    prompt: `A row of ${shape} is made from matchsticks, with neighbouring shapes sharing a side. The number of matchsticks for 1, 2, 3 and 4 ${shape} is ${seq.join(', ')}. Write a rule for the number of matchsticks, ${v('m')}, needed for ${v('n')} ${shape}.`,
    answer: exprA(`${per}n + 1`),
    prefix: `${v('m')} =`,
    hint: 'How many extra matchsticks are added for each new shape?',
    steps: [`Each new shape adds ${per} matchsticks.`, `For n = 1 there are ${first} = ${per} + 1 matchsticks.`, `${v('m')} = ${per}${v('n')} + 1`],
  })
}

// ------------------------------------------------------------------ Data

const medianOf = (arr: number[]) => {
  const s = arr.slice().sort((a, b) => a - b)
  const n = s.length
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2
}

const data_freq = (level: Level): Question => {
  const scores = [0, 1, 2, 3, 4, 5]
  const freqs = scores.map(() => int(1, 9))
  const total = freqs.reduce((a, b) => a + b, 0)
  const sumFx = scores.reduce((s, x, i) => s + x * freqs[i], 0)
  const tbl = D.table(['Number of siblings', 'Frequency'], scores.map((x, i) => [x, freqs[i]]))
  if (level === 1) {
    const mx = Math.max(...freqs)
    if (freqs.filter((f) => f === mx).length > 1 || chance(0.4)) {
      return q({
        prompt: `The table shows the number of siblings of students in a Year 8 class.${tbl}How many students are in the class?`,
        answer: numA(total),
        hint: 'Add the frequency column.',
        steps: [`${freqs.join(' + ')} = ${total}`],
      })
    }
    const md = scores[freqs.indexOf(mx)]
    return q({
      prompt: `The table shows the number of siblings of students in a Year 8 class.${tbl}What is the mode?`,
      answer: numA(md),
      hint: 'The mode is the score with the highest frequency.',
      steps: [`The highest frequency is ${mx}, for the score ${md}.`, `Mode = ${md}`],
    })
  }
  if (level === 2) {
    const mean = sumFx / total
    const fx = D.table(['Score (x)', 'Frequency (f)', 'f × x'], scores.map((x, i) => [x, freqs[i], x * freqs[i]]))
    return q({
      prompt: `The table shows the number of siblings of students in a Year 8 class.${tbl}Find the mean number of siblings, correct to 1 decimal place.`,
      answer: numA(mean, 1),
      calc: true,
      hint: 'Add an f × x column. Mean = sum of (f × x) ÷ sum of f.',
      steps: [`Add an f × x column:${fx}`, `Sum of f × x = ${sumFx}; sum of f = ${total}`, `Mean = ${sumFx} ${DIVIDE} ${total} ≈ ${num(round(mean, 1), 1)}`],
    })
  }
  const list: number[] = []
  scores.forEach((x, i) => {
    for (let k = 0; k < freqs[i]; k++) list.push(x)
  })
  const med = medianOf(list)
  const n = total
  return q({
    prompt: `The table shows the number of siblings of students in a Year 8 class.${tbl}Find the median.`,
    answer: numA(med),
    hint: n % 2 ? `There are ${n} scores, so the median is the ${ordinal((n + 1) / 2)} score. Use a running total.` : `There are ${n} scores, so the median is halfway between the ${ordinal(n / 2)} and ${ordinal(n / 2 + 1)} scores.`,
    steps: [`Running totals: ${scores.map((x, i) => `${x} → ${freqs.slice(0, i + 1).reduce((a, b) => a + b, 0)}`).join(', ')}`, n % 2 ? `The ${ordinal((n + 1) / 2)} score is ${med}.` : `The ${ordinal(n / 2)} score is ${list[n / 2 - 1]} and the ${ordinal(n / 2 + 1)} score is ${list[n / 2]}, so the median is ${num(med)}.`],
  })
}

const data_stem = (level: Level): Question => {
  const n = L(level, int(10, 14), int(11, 16), int(10, 15))
  const lo = int(1, 4) * 10
  const vals = Array.from({ length: n }, () => int(lo, lo + 39))
  const sorted = vals.slice().sort((a, b) => a - b)
  const stemKey = Math.floor(sorted[Math.floor(n / 2)] / 10)
  const diagram = D.stemLeaf(vals, stemKey, sorted[Math.floor(n / 2)] % 10)
  const ctx = pick(['The stem-and-leaf plot shows the scores (out of 80) in a Year 8 science test.', 'The stem-and-leaf plot shows the number of laps swum by squad members in 30 minutes.', 'The stem-and-leaf plot shows the ages of people at a community event.'])
  if (level === 1) {
    if (chance()) {
      const r = sorted[n - 1] - sorted[0]
      return q({
        prompt: `${ctx}${diagram}What is the range?`,
        answer: numA(r),
        hint: 'Range = highest − lowest. Read the first and last values in the plot.',
        steps: [`Lowest: ${sorted[0]}, highest: ${sorted[n - 1]}`, `Range = ${sorted[n - 1]} ${MINUS} ${sorted[0]} = ${r}`],
      })
    }
    const k = sorted[int(2, n - 3)]
    const cnt = sorted.filter((x) => x > k).length
    return q({
      prompt: `${ctx}${diagram}How many values are greater than ${k}?`,
      answer: numA(cnt),
      hint: `Count the values after ${k} in the plot (do not count ${k} itself).`,
      steps: [`Values greater than ${k}: ${sorted.filter((x) => x > k).join(', ')}`, `There are ${cnt}.`],
    })
  }
  if (level === 2) {
    const med = medianOf(vals)
    return q({
      prompt: `${ctx}${diagram}Find the median.`,
      answer: numA(med),
      hint: 'The values are already in order. Find the middle value (or the average of the two middle values).',
      steps: [`There are ${n} values.`, n % 2 ? `The middle value is the ${ordinal((n + 1) / 2)}: ${med}` : `The middle two values are the ${ordinal(n / 2)} and ${ordinal(n / 2 + 1)}: ${sorted[n / 2 - 1]} and ${sorted[n / 2]}, so the median is ${num(med)}.`],
    })
  }
  const mean = vals.reduce((a, b) => a + b, 0) / n
  return q({
    prompt: `${ctx}${diagram}Find the mean, correct to 1 decimal place.`,
    answer: numA(mean, 1),
    calc: true,
    hint: 'Add all the values, then divide by how many there are.',
    steps: [`Sum = ${vals.reduce((a, b) => a + b, 0)}, number of values = ${n}`, `Mean = ${vals.reduce((a, b) => a + b, 0)} ${DIVIDE} ${n} ≈ ${num(round(mean, 1), 1)}`],
  })
}

const data_outlier = (level: Level): Question => {
  const n = int(6, 8)
  const base = int(10, 30)
  const vals = Array.from({ length: n }, () => base + int(-4, 4))
  const high = chance()
  const out = high ? base + int(25, 45) : Math.max(0, base - int(15, 22))
  const all = shuffle([...vals, out])
  if (level === 1) {
    return q({
      prompt: `Which value is an outlier in this data set?<div class="big">${all.join(', ')}</div>`,
      answer: mcA(String(out), sample(vals.map(String), 3)),
      hint: 'An outlier is a value that is much larger or much smaller than the rest.',
      steps: [`Most values are close to ${base}.`, `${out} is far from the others, so it is an outlier.`],
    })
  }
  if (level === 2) {
    const m1 = all.reduce((a, b) => a + b, 0) / all.length
    const m2 = vals.reduce((a, b) => a + b, 0) / vals.length
    const diff = Math.abs(m1 - m2)
    return q({
      prompt: `The data set ${all.join(', ')} has an outlier of ${out}. By how much does the mean change when the outlier is removed? Give your answer correct to 1 decimal place.`,
      answer: numA(diff, 1),
      calc: true,
      hint: 'Calculate the mean with and without the outlier, then subtract.',
      steps: [`Mean with outlier: ${all.reduce((a, b) => a + b, 0)} ${DIVIDE} ${all.length} ${approx(m1, 2)}`, `Mean without outlier: ${vals.reduce((a, b) => a + b, 0)} ${DIVIDE} ${vals.length} ${approx(m2, 2)}`, `Change ${approx(diff, 1)}`],
    })
  }
  return q({
    prompt: `The weekly pocket money of some students is: ${all.map((x) => '$' + x).join(', ')}. Which measure of centre best represents a typical student’s pocket money?`,
    answer: mcFixedA(['Mean', 'Median', 'Range'], 'Median'),
    hint: 'Think about which measure is pulled a long way by one unusual value.',
    steps: [`$${out} is an outlier.`, 'The mean is pulled towards the outlier, but the median is hardly affected.', 'The median is the best measure here. (The range is a measure of spread, not centre.)'],
  })
}

const SAMPLE_CASES: [string, 'Census' | 'Sample', string][] = [
  ['The government counts every person living in Australia.', 'Census', 'Every member of the population is included.'],
  ['A teacher asks every student in 8M about their favourite subject, to learn about 8M.', 'Census', 'Every member of the population (class 8M) is included.'],
  ['A factory tests 50 light bulbs from a batch of 10 000 to see how long they last.', 'Sample', 'Only part of the population is tested (testing every bulb would destroy them all).'],
  ['A TV station phones 1000 voters to predict the result of a state election.', 'Sample', 'Only some voters are asked.'],
  ['A school asks 40 randomly chosen students what they think of the new canteen menu.', 'Sample', 'Only some students are asked.'],
]
const BIAS_CASES: [string, 'Yes' | 'No', string][] = [
  ['To find out how students travel to school, a survey is given only to students waiting at the bus stop.', 'Yes', 'Students who walk, ride or are driven are left out, so the sample over-represents bus users.'],
  ['To find the most popular sport at a school, every 10th student on the roll is surveyed.', 'No', 'A systematic choice from the whole roll gives every student a fair chance of being chosen.'],
  ['To find out how much exercise teenagers do, people leaving a gym are surveyed.', 'Yes', 'People at a gym are likely to exercise more than average.'],
  ['To find the average height of Year 8 students, 30 names are drawn at random from all Year 8 students.', 'No', 'A random sample from the whole year group is not biased.'],
  ['To find out what a town thinks of a new skate park, only people at the skate park are asked.', 'Yes', 'Skate park users are more likely to support it.'],
]

const data_sample = (level: Level): Question => {
  if (level === 1) {
    const [desc, ans, why] = pick(SAMPLE_CASES)
    return q({
      prompt: `Is this a census or a sample?<div class="big">${desc}</div>`,
      answer: mcFixedA(['Census', 'Sample'], ans),
      hint: 'A census collects data from every member of the population. A sample uses only part of it.',
      steps: [why, `It is a ${ans.toLowerCase()}.`],
    })
  }
  if (level === 2) {
    const [desc, ans, why] = pick(BIAS_CASES)
    return q({
      prompt: `Is this sample likely to be biased?<div class="big">${desc}</div>`,
      answer: mcFixedA(['Yes', 'No'], ans),
      hint: 'A biased sample does not fairly represent the whole population.',
      steps: [why],
    })
  }
  const opts = [
    'Survey 100 students chosen at random from the whole school roll',
    'Survey the first 100 students to arrive at school',
    'Survey 100 students from the school’s basketball teams',
    'Survey 100 students who volunteer online',
  ]
  return q({
    prompt: 'A principal wants to know how many hours of sport students play each week. Which sampling method is most likely to give a fair (unbiased) result?',
    answer: mcA(opts[0], opts.slice(1)),
    hint: 'Every student should have the same chance of being chosen.',
    steps: ['Early arrivals, basketball players and volunteers are not typical of all students.', 'A random sample from the whole school is the fairest method.'],
  })
}

// ------------------------------------------------------------------ Probability

const prob_relfreq = (level: Level): Question => {
  if (level === 1) {
    const trials = pick([20, 25, 40, 50, 60, 80, 100])
    const k = int(2, trials - 2)
    const col = pick(['red', 'blue', 'green', 'yellow'])
    return q({
      prompt: `A spinner was spun ${trials} times and landed on ${col} ${k} times. What is the relative frequency of ${col}? Give your answer as a fraction in simplest form or a decimal.`,
      answer: fracA(k, trials, { allowDecimal: true }),
      hint: 'Relative frequency = number of times the event happened ÷ number of trials.',
      steps: [`Relative frequency = ${frac(k, trials)}${gcd(k, trials) > 1 ? ' = ' + fracS(k, trials) : ''} = ${num(clean(k / trials))}`],
    })
  }
  if (level === 2) {
    if (chance()) {
      const p = pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.15, 0.05])
      const n = pick([20, 40, 60, 100, 200, 300])
      return q({
        prompt: `The probability that a randomly chosen phone from a factory is faulty is ${num(p)}. In a batch of ${n} phones, how many would you expect to be faulty?`,
        answer: numA(clean(p * n)),
        hint: 'Expected number = probability × number of trials.',
        steps: [`${num(p)} ${TIMES} ${n} = ${num(clean(p * n))}`],
      })
    }
    const n = pick([60, 120, 180, 300, 600])
    const [desc, fav] = pick([
      ['a 6', 1],
      ['an even number', 3],
      ['a number less than 3', 2],
      ['a multiple of 3', 2],
    ] as [string, number][])
    return q({
      prompt: `A fair die is rolled ${n} times. How many times would you expect to roll ${desc}?`,
      answer: numA((n * fav) / 6),
      hint: 'Expected number = probability × number of rolls.',
      steps: [`P(${desc}) = ${frac(fav, 6)}`, `${frac(fav, 6)} ${TIMES} ${n} = ${num((n * fav) / 6)}`],
    })
  }
  const trials = pick([50, 80, 100, 200, 250])
  const k = int(Math.round(trials * 0.1), Math.round(trials * 0.6))
  const big = pick([500, 1000, 2000])
  const est = (k / trials) * big
  if (!Number.isInteger(est)) return prob_relfreq(3)
  return q({
    prompt: `In ${trials} rolls of a weighted die, a 6 came up ${k} times. Use this to estimate how many 6s would come up in ${num(big)} rolls.`,
    answer: numA(est),
    hint: 'Use the relative frequency as an estimate of the probability.',
    steps: [`Relative frequency = ${frac(k, trials)} = ${num(clean(k / trials))}`, `Estimate = ${num(clean(k / trials))} ${TIMES} ${num(big)} = ${num(est)}`],
  })
}

const prob_events = (level: Level): Question => {
  if (level === 1) {
    const cols = sample(['red', 'blue', 'green', 'yellow', 'white'], 3)
    const cnt = cols.map(() => int(1, 9))
    const total = cnt.reduce((a, b) => a + b, 0)
    const [i, j] = sample([0, 1, 2], 2)
    return q({
      prompt: `A bag holds ${cols.map((c, k) => `${cnt[k]} ${c}`).join(', ').replace(/, ([^,]*)$/, ' and $1')} counters. One counter is taken at random. Find P(${cols[i]} or ${cols[j]}).`,
      answer: fracA(cnt[i] + cnt[j], total, { allowDecimal: true }),
      hint: 'Count all the counters that are either colour.',
      steps: [`Favourable: ${cnt[i]} + ${cnt[j]} = ${cnt[i] + cnt[j]}`, `Total: ${total}`, `P = ${frac(cnt[i] + cnt[j], total)}${gcd(cnt[i] + cnt[j], total) > 1 ? ' = ' + fracS(cnt[i] + cnt[j], total) : ''}`],
    })
  }
  if (level === 2) {
    const N = pick([20, 30, 40, 50])
    const k = pick([3, 4, 5, 6])
    const mult = Math.floor(N / k)
    return q({
      prompt: `A number is chosen at random from 1 to ${N}. What is the probability that it is <b>not</b> a multiple of ${k}?`,
      answer: fracA(N - mult, N, { allowDecimal: true }),
      hint: `Count the multiples of ${k} first, then use P(not A) = 1 − P(A).`,
      steps: [`Multiples of ${k} from 1 to ${N}: ${mult}`, `P(multiple of ${k}) = ${frac(mult, N)}`, `P(not) = 1 ${MINUS} ${frac(mult, N)} = ${frac(N - mult, N)}${gcd(N - mult, N) > 1 ? ' = ' + fracS(N - mult, N) : ''}`],
    })
  }
  const modes = ['Bus', 'Car', 'Walk', 'Bike', 'Train']
  const counts = modes.map(() => int(4, 30))
  const total = counts.reduce((a, b) => a + b, 0)
  const i = int(0, 4)
  const tbl = D.table(['How students travel', 'Number of students'], modes.map((m, k) => [m, counts[k]]))
  if (chance()) {
    return q({
      prompt: `The table shows how Year 8 students travel to school.${tbl}A student is chosen at random. What is the probability that the student does <b>not</b> travel by ${modes[i].toLowerCase()}?`,
      answer: fracA(total - counts[i], total, { allowDecimal: true }),
      hint: 'Find the total number of students first. Then use P(not A) = 1 − P(A), or count everyone else.',
      steps: [`Total students: ${counts.join(' + ')} = ${total}`, `Not by ${modes[i].toLowerCase()}: ${total} ${MINUS} ${counts[i]} = ${total - counts[i]}`, `P = ${frac(total - counts[i], total)}${gcd(total - counts[i], total) > 1 ? ' = ' + fracS(total - counts[i], total) : ''}`],
    })
  }
  const [a, b] = sample([0, 1, 2, 3, 4], 2)
  return q({
    prompt: `The table shows how Year 8 students travel to school.${tbl}A student is chosen at random. What is the probability that the student travels by ${modes[a].toLowerCase()} or ${modes[b].toLowerCase()}?`,
    answer: fracA(counts[a] + counts[b], total, { allowDecimal: true }),
    hint: 'Add the two groups, then divide by the total number of students.',
    steps: [`${modes[a]} or ${modes[b]}: ${counts[a]} + ${counts[b]} = ${counts[a] + counts[b]}`, `Total: ${total}`, `P = ${frac(counts[a] + counts[b], total)}${gcd(counts[a] + counts[b], total) > 1 ? ' = ' + fracS(counts[a] + counts[b], total) : ''}`],
  })
}

// ------------------------------------------------------------------ Topics

export const Y8C: Topic[] = [
  {
    id: 'y8-linear',
    year: 8,
    title: 'Linear relationships',
    strand: 'Number and algebra',
    outcomes: ['MA4-LIN-C-01'],
    blurb: 'Points on lines, reading graphs, graphical solutions and finding rules.',
    colour: 225,
    skills: [
      {
        id: 'y8-lin-online',
        title: 'Points on a line',
        outcomes: ['MA4-LIN-C-01'],
        summary: 'Test whether a point lies on a line.',
        learn: {
          intro: '<p>A point lies on a line if its coordinates make the rule true.</p>',
          keyPoints: ['Is (2, 7) on y = 3x + 1? When x = 2, y = 3 × 2 + 1 = 7. Yes.'],
        },
        gen: lin_online,
        levels: { 1: 'Positive values', 2: 'Negative values', 3: 'Choose the point' },
      },
      {
        id: 'y8-lin-graph',
        title: 'Reading straight-line graphs',
        outcomes: ['MA4-LIN-C-01'],
        summary: 'Read values from graphs and find where two lines intersect.',
        learn: {
          intro: '<p>Every point on a line makes its rule true. You can read values straight off a graph.</p>',
          keyPoints: ['Given x: go up or down to the line, then across to the y-axis.', 'Where two lines cross, both rules are true: this point solves the equation formed by setting the rules equal.'],
        },
        gen: lin_graph,
        levels: { 1: 'Find y', 2: 'Find x', 3: 'Point of intersection' },
      },
      {
        id: 'y8-lin-rule',
        title: 'Rules from tables, graphs and patterns',
        outcomes: ['MA4-LIN-C-01'],
        summary: 'Write the rule for a linear relationship.',
        learn: {
          intro: '<p>For a linear rule y = <i>m</i>x + <i>c</i>: <i>m</i> is how much y changes when x increases by 1, and <i>c</i> is the value of y when x = 0.</p>',
          keyPoints: ['Tables: look at the change in y.', 'Graphs: make a table from points on the line.', 'Patterns: how much is added each step?'],
        },
        gen: lin_rule,
        levels: { 1: 'From a table', 2: 'From a graph', 3: 'From a pattern' },
      },
    ],
  },
  {
    id: 'y8-data',
    year: 8,
    title: 'Investigating data',
    strand: 'Statistics and probability',
    outcomes: ['MA4-DAT-C-01', 'MA4-DAT-C-02'],
    blurb: 'Frequency tables, stem-and-leaf plots, outliers, and sampling.',
    colour: 12,
    skills: [
      {
        id: 'y8-data-freq',
        title: 'Frequency tables',
        outcomes: ['MA4-DAT-C-02'],
        summary: 'Find the mode, mean and median from a frequency table.',
        learn: {
          intro: '<p>A frequency table shows how many times each score occurs.</p>',
          keyPoints: ['Number of scores = sum of the frequencies.', 'Mean = Σ(f × x) ÷ Σf', 'Median: use a running total to find the middle score.'],
        },
        gen: data_freq,
        levels: { 1: 'Totals and mode', 2: 'Mean', 3: 'Median' },
      },
      {
        id: 'y8-data-stem',
        title: 'Stem-and-leaf plots',
        outcomes: ['MA4-DAT-C-01', 'MA4-DAT-C-02'],
        summary: 'Read stem-and-leaf plots and find statistics from them.',
        learn: {
          intro: '<p>In a stem-and-leaf plot, the stem shows the tens and each leaf shows the units. The key explains how to read it.</p>',
          keyPoints: ['Values are already in order, which makes the median easy to find.', 'Range = last value − first value.'],
        },
        gen: data_stem,
        levels: { 1: 'Reading the plot', 2: 'Median', 3: 'Mean' },
      },
      {
        id: 'y8-data-outlier',
        title: 'Outliers',
        outcomes: ['MA4-DAT-C-02'],
        summary: 'Identify outliers and describe their effect on the mean and median.',
        learn: {
          intro: '<p>An <b>outlier</b> is a value much larger or smaller than the rest of the data.</p>',
          keyPoints: ['Outliers pull the mean towards them.', 'The median is hardly affected, so it is often a better measure of centre when there are outliers.'],
        },
        gen: data_outlier,
        levels: { 1: 'Identify an outlier', 2: 'Effect on the mean', 3: 'Choose the best measure' },
      },
      {
        id: 'y8-data-sample',
        title: 'Census, samples and bias',
        outcomes: ['MA4-DAT-C-01'],
        summary: 'Distinguish a census from a sample and recognise biased samples.',
        learn: {
          intro: '<p>A <b>census</b> collects data from every member of a population. A <b>sample</b> collects data from part of it.</p>',
          keyPoints: ['A sample is <b>biased</b> if some groups are more likely to be chosen than others.', 'Random samples from the whole population reduce bias.'],
        },
        gen: data_sample,
        levels: { 1: 'Census or sample', 2: 'Spot bias', 3: 'Choose a fair method' },
      },
    ],
  },
  {
    id: 'y8-probability',
    year: 8,
    title: 'Probability',
    strand: 'Statistics and probability',
    outcomes: ['MA4-PRO-C-01'],
    blurb: 'Relative frequency, expected outcomes and probabilities from tables.',
    colour: 170,
    skills: [
      {
        id: 'y8-prob-relfreq',
        title: 'Relative frequency and expected outcomes',
        outcomes: ['MA4-PRO-C-01'],
        summary: 'Use relative frequency and calculate expected numbers of outcomes.',
        learn: {
          intro: '<p><b>Relative frequency</b> = number of times an event happened ÷ number of trials. It estimates the probability.</p>',
          keyPoints: ['Expected number = probability × number of trials.', 'More trials usually give a better estimate.'],
        },
        gen: prob_relfreq,
        levels: { 1: 'Relative frequency', 2: 'Expected number', 3: 'Estimate from experiments' },
      },
      {
        id: 'y8-prob-events',
        title: 'Probability of events',
        outcomes: ['MA4-PRO-C-01'],
        summary: 'Find probabilities of “or” and “not” events, including from tables.',
        learn: {
          intro: '<p>When outcomes are equally likely, P(event) = favourable outcomes ÷ total outcomes.</p>',
          keyPoints: ['P(red or blue): count both colours.', 'P(not A) = 1 − P(A)', 'From a table, the total is the sum of all the groups.'],
        },
        gen: prob_events,
        levels: { 1: '“Or” events', 2: '“Not” events', 3: 'From a table of results' },
      },
    ],
  },
]

void chance
void intExcept
void name
