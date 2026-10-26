// Year 7 (Stage 4) — Integers, Angles, Whole numbers & indices, Fractions & percentages
import type { Level, Question, Topic } from '@/lib/maths/types'
import { checkAnswer, isPrime, primeFactors } from '@/lib/maths/check'
import {
  D, L, MINUS, TIMES, DIVIDE, bnum, chance, deg, ex, frac, fracA, fracS, gcd, int, intExcept, lcm, mcA, mcFixedA, mixed,
  nonZero, num, numA, pick, pow, q, sample, shuffle, sqrt, exprA, v, NOT_TO_SCALE, money,
} from './helpers'

void checkAnswer
const it = (s: string) => `<tspan class="it">${s}</tspan>`

// ------------------------------------------------------------------ Integers

const int_compare = (level: Level): Question => {
  if (level === 1) {
    let a = nonZero(-12, 12)
    let b = intExcept(-12, 12, [a])
    if (a > 0 && b > 0) a = -a
    const sym = a < b ? '&lt;' : '&gt;'
    return q({
      prompt: `Which symbol makes this statement true?<div class="big">${num(a)} &#9633; ${num(b)}</div>`,
      answer: mcFixedA(['&lt; (is less than)', '&gt; (is greater than)'], sym === '&lt;' ? '&lt; (is less than)' : '&gt; (is greater than)'),
      hint: 'Picture a number line. Numbers get bigger as you move to the right.',
      steps: [
        `On a number line, ${num(Math.min(a, b))} is to the left of ${num(Math.max(a, b))}.`,
        `So ${num(a)} ${sym} ${num(b)}.`,
      ],
    })
  }
  if (level === 2) {
    const vals = [...sample([-28, -21, -17, -15, -12, -9, -8, -6, -4, -3, -1], int(2, 3)), ...sample([0, 2, 5, 7, 11, 14, 19, 23], 2)].slice(0, 4)
    const asc = vals.slice().sort((x, y) => x - y)
    const desc = asc.slice().reverse()
    const byAbs = vals.slice().sort((x, y) => Math.abs(x) - Math.abs(y) || x - y)
    const fmt = (arr: number[]) => arr.map((x) => num(x)).join(', ')
    let other = shuffle(vals)
    while (fmt(other) === fmt(asc) || fmt(other) === fmt(byAbs)) other = shuffle(vals)
    return q({
      prompt: `Which list shows these integers in <b>ascending</b> order (smallest to largest)?<div class="big">${fmt(vals)}</div>`,
      answer: mcA(fmt(asc), [fmt(desc), fmt(byAbs), fmt(other)]),
      hint: 'Ascending means going up. The most negative number is the smallest.',
      steps: [
        'Negative numbers are smaller than zero, and the further a negative number is from zero, the smaller it is.',
        `From smallest to largest: ${fmt(asc)}.`,
      ],
    })
  }
  const towns = sample(['Perisher', 'Thredbo', 'Cooma', 'Orange', 'Oberon', 'Goulburn', 'Bathurst', 'Armidale', 'Tamworth'], 4)
  const temps = sample([-9, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6], 4)
  const rows = towns.map((t, i) => [t, num(temps[i]) + '°C'])
  const hi = Math.max(...temps)
  const lo = Math.min(...temps)
  if (chance()) {
    return q({
      prompt: `These are the temperatures at 6 am on a winter morning.${D.table(['Town', 'Temperature'], rows)}What is the difference between the highest and the lowest temperature?`,
      answer: numA(hi - lo),
      suffix: '°C',
      hint: 'Find the highest and lowest temperatures, then count the degrees between them on a number line.',
      steps: [
        `Highest: ${num(hi)}°C. Lowest: ${num(lo)}°C.`,
        `Difference = ${num(hi)} ${MINUS} ${bnum(lo)} = ${num(hi - lo)}°C.`,
      ],
    })
  }
  const coldest = towns[temps.indexOf(lo)]
  return q({
    prompt: `These are the temperatures at 6 am on a winter morning.${D.table(['Town', 'Temperature'], rows)}Which town was the coldest?`,
    answer: mcFixedA(towns, coldest),
    hint: 'The coldest temperature is the smallest (most negative) number.',
    steps: [`The smallest number is ${num(lo)}°C, so ${coldest} was the coldest.`],
  })
}

const int_addsub = (level: Level): Question => {
  if (level === 1) {
    // every question involves a negative: a negative start, or a subtraction that crosses zero
    const a = chance(0.7) ? -int(1, 10) : int(1, 9)
    const add = a < 0 ? chance() : false
    const b = a < 0 ? int(1, 10) : int(a + 1, a + 8)
    const r = add ? a + b : a - b
    return q({
      prompt: `Calculate:<div class="big">${num(a)} ${add ? '+' : MINUS} ${num(b)}</div>`,
      answer: numA(r),
      hint: add ? 'Start at the first number on a number line and move right.' : 'Start at the first number on a number line and move left.',
      steps: [
        `Start at ${num(a)} on the number line.`,
        `${add ? 'Adding' : 'Subtracting'} ${b} means moving ${b} place${b > 1 ? 's' : ''} to the ${add ? 'right' : 'left'}.`,
        `${num(a)} ${add ? '+' : MINUS} ${num(b)} = ${num(r)}`,
      ],
    })
  }
  if (level === 2) {
    const a = nonZero(-20, 20)
    const b = int(2, 20)
    const kind = pick(['+-', '--'])
    const r = kind === '+-' ? a - b : a + b
    const shown = kind === '+-' ? `${num(a)} + (${MINUS}${b})` : `${num(a)} ${MINUS} (${MINUS}${b})`
    return q({
      prompt: `Calculate:<div class="big">${shown}</div>`,
      answer: numA(r),
      hint: kind === '+-' ? 'Adding a negative is the same as subtracting.' : 'Subtracting a negative is the same as adding.',
      steps: [
        kind === '+-'
          ? `Adding a negative is the same as subtracting: ${shown} = ${num(a)} ${MINUS} ${b}`
          : `Subtracting a negative is the same as adding: ${shown} = ${num(a)} + ${b}`,
        `= ${num(r)}`,
      ],
    })
  }
  if (chance(0.5)) {
    const a = nonZero(-15, 15)
    const b = nonZero(-15, 15)
    const c = nonZero(-15, 15)
    const s1 = pick(['+', '-'])
    const s2 = pick(['+', '-'])
    const part = (sgn: string, x: number) => `${sgn === '+' ? '+' : MINUS} ${x < 0 ? '(' + num(x) + ')' : num(x)}`
    const r = a + (s1 === '+' ? b : -b) + (s2 === '+' ? c : -c)
    const t1 = a + (s1 === '+' ? b : -b)
    const simplify = (sgn: string, x: number) => {
      const eff = sgn === '+' ? x : -x
      return eff < 0 ? `${MINUS} ${-eff}` : `+ ${eff}`
    }
    return q({
      prompt: `Calculate:<div class="big">${num(a)} ${part(s1, b)} ${part(s2, c)}</div>`,
      answer: numA(r),
      hint: 'Rewrite each pair of signs first: + (−) becomes −, and − (−) becomes +. Then work left to right.',
      steps: [
        `Simplify the signs: ${num(a)} ${simplify(s1, b)} ${simplify(s2, c)}`,
        `Work left to right: ${num(a)} ${simplify(s1, b)} = ${num(t1)}`,
        `${num(t1)} ${simplify(s2, c)} = ${num(r)}`,
      ],
    })
  }
  const ctx = pick(['temp', 'bank', 'lift'])
  if (ctx === 'temp') {
    const start = int(-8, 3)
    const rise = int(5, 15)
    const fall = int(3, 18)
    const r = start + rise - fall
    return q({
      prompt: `At 5 am the temperature at Charlotte Pass was ${num(start)}°C. By 1 pm it had risen by ${rise} degrees, and by midnight it had fallen ${fall} degrees from the 1 pm temperature. What was the temperature at midnight?`,
      answer: numA(r),
      suffix: '°C',
      hint: 'Rising means add, falling means subtract.',
      steps: [`1 pm: ${num(start)} + ${rise} = ${num(start + rise)}°C`, `Midnight: ${num(start + rise)} ${MINUS} ${fall} = ${num(r)}°C`],
    })
  }
  if (ctx === 'bank') {
    const start = int(20, 90)
    const spend = int(start + 10, start + 80)
    const dep = int(15, 60)
    const r = start - spend + dep
    return q({
      prompt: `${pick(['Kai', 'Ruby', 'Hamish', 'Priya'])} had $${start} in a bank account, then spent $${spend} using an overdraft, then deposited $${dep}. What is the account balance now? (Use a negative number if the account is overdrawn.)`,
      answer: numA(r),
      prefix: '$',
      hint: 'Spending is subtracting, depositing is adding. A balance below zero is negative.',
      steps: [`After spending: ${start} ${MINUS} ${spend} = ${num(start - spend)}`, `After the deposit: ${num(start - spend)} + ${dep} = ${num(r)}`, `The balance is ${r < 0 ? MINUS : ''}$${Math.abs(r)}.`],
    })
  }
  const startF = int(-3, 6)
  const down = int(4, 9)
  const up = int(1, 7)
  const r = startF - down + up
  return q({
    prompt: `In a building, the ground floor is floor 0 and the basement levels are negative. A lift starts on floor ${num(startF)}, goes down ${down} floors, then up ${up} floors. Which floor is it on now?`,
    answer: numA(r),
    hint: 'Down means subtract, up means add.',
    steps: [`${num(startF)} ${MINUS} ${down} = ${num(startF - down)}`, `${num(startF - down)} + ${up} = ${num(r)}`],
  })
}

const int_muldiv = (level: Level): Question => {
  const signRule = 'Same signs give a positive answer. Different signs give a negative answer.'
  if (level === 1) {
    const a = int(2, 10)
    const b = int(2, 10)
    const negFirst = chance()
    const x = negFirst ? -a : a
    const y = negFirst ? b : -b
    const isDiv = chance(0.4)
    if (isDiv) {
      const prod = x * y
      return q({
        prompt: `Calculate:<div class="big">${num(prod)} ${DIVIDE} ${bnum(y)}</div>`,
        answer: numA(x),
        hint: signRule,
        steps: [`${Math.abs(prod)} ${DIVIDE} ${Math.abs(y)} = ${Math.abs(x)}`, `The signs are ${prod < 0 === y < 0 ? 'the same' : 'different'}, so the answer is ${x < 0 ? 'negative' : 'positive'}: ${num(x)}`],
      })
    }
    return q({
      prompt: `Calculate:<div class="big">${num(x)} ${TIMES} ${bnum(y)}</div>`,
      answer: numA(x * y),
      hint: signRule,
      steps: [`${a} ${TIMES} ${b} = ${a * b}`, `The signs are different, so the answer is negative: ${num(x * y)}`],
    })
  }
  if (level === 2) {
    const a = intExcept(-12, 12, [-1, 0, 1])
    const b = intExcept(-12, 12, [-1, 0, 1])
    const x = a < 0 || b < 0 ? a : -a
    const y = b
    if (chance()) {
      const prod = x * y
      const same = (prod < 0) === (y < 0)
      return q({
        prompt: `Calculate:<div class="big">${num(prod)} ${DIVIDE} ${bnum(y)}</div>`,
        answer: numA(x),
        hint: signRule,
        steps: [`${Math.abs(prod)} ${DIVIDE} ${Math.abs(y)} = ${Math.abs(x)}`, `The signs are ${same ? 'the same, so the answer is positive' : 'different, so the answer is negative'}: ${num(x)}`],
      })
    }
    const same = (x < 0) === (y < 0)
    return q({
      prompt: `Calculate:<div class="big">${num(x)} ${TIMES} ${bnum(y)}</div>`,
      answer: numA(x * y),
      hint: signRule,
      steps: [`${Math.abs(x)} ${TIMES} ${Math.abs(y)} = ${Math.abs(x * y)}`, `The signs are ${same ? 'the same, so the answer is positive' : 'different, so the answer is negative'}: ${num(x * y)}`],
    })
  }
  const t = pick(['three', 'mixed', 'power'])
  if (t === 'three') {
    // one, two or three negative factors, none of them ±1
    const signs = shuffle([-1, chance() ? -1 : 1, chance(0.3) ? -1 : 1])
    const a = int(2, 6) * signs[0]
    const b = int(2, 6) * signs[1]
    const c = int(2, 5) * signs[2]
    const negs = [a, b, c].filter((z) => z < 0).length
    return q({
      prompt: `Calculate:<div class="big">${num(a)} ${TIMES} ${bnum(b)} ${TIMES} ${bnum(c)}</div>`,
      answer: numA(a * b * c),
      hint: 'Count the negative signs. An even number of negatives gives a positive answer; an odd number gives a negative answer.',
      steps: [`${num(a)} ${TIMES} ${bnum(b)} = ${num(a * b)}`, `${num(a * b)} ${TIMES} ${bnum(c)} = ${num(a * b * c)}`, `Check: there ${negs === 1 ? 'is 1 negative' : 'are ' + negs + ' negatives'}, so the answer is ${negs % 2 ? 'negative' : 'positive'}.`],
    })
  }
  if (t === 'mixed') {
    const b = int(2, 9) * (chance() ? -1 : 1)
    const r1 = int(2, 8) * (chance() ? -1 : 1)
    const a = r1 * b
    // at least one of the numbers shown is negative
    const c = int(2, 5) * (a > 0 && b > 0 ? -1 : chance() ? -1 : 1)
    return q({
      prompt: `Calculate:<div class="big">${num(a)} ${DIVIDE} ${bnum(b)} ${TIMES} ${bnum(c)}</div>`,
      answer: numA(r1 * c),
      hint: 'Multiplication and division have equal priority: work from left to right.',
      steps: [`Left to right. First: ${num(a)} ${DIVIDE} ${bnum(b)} = ${num(r1)}`, `Then: ${num(r1)} ${TIMES} ${bnum(c)} = ${num(r1 * c)}`],
    })
  }
  const base = pick([-2, -3, -4, -5, -1, -10])
  const e = base === -10 ? pick([2, 3]) : base === -1 ? pick([5, 6, 7]) : pick([2, 3, 4].filter((k) => Math.abs(base) ** k <= 256))
  const r = Math.pow(base, e)
  return q({
    prompt: `Evaluate:<div class="big">${pow(base, e)}</div>`,
    answer: numA(r),
    hint: `Write it out as repeated multiplication: ${Array(e).fill(bnum(base)).join(` ${TIMES} `)}`,
    steps: [`${pow(base, e)} = ${Array(e).fill(bnum(base)).join(` ${TIMES} `)}`, `There ${e === 1 ? 'is 1 negative' : `are ${e} negatives`}: an ${e % 2 ? 'odd' : 'even'} number, so the answer is ${e % 2 ? 'negative' : 'positive'}.`, `= ${num(r)}`],
  })
}

const int_orderops = (level: Level): Question => {
  const rule = 'Order of operations: Brackets, then Powers/roots, then × and ÷ (left to right), then + and − (left to right).'
  if (level === 1) {
    const t = int(0, 2)
    if (t === 0) {
      const a = int(2, 20)
      const b = int(2, 9)
      const c = int(2, 9)
      const neg = chance()
      const A = neg ? -a : a
      return q({
        prompt: `Calculate:<div class="big">${num(A)} + ${b} ${TIMES} ${c}</div>`,
        answer: numA(A + b * c),
        hint: 'Multiply before you add.',
        steps: [`Multiply first: ${b} ${TIMES} ${c} = ${b * c}`, `Then add: ${num(A)} + ${b * c} = ${num(A + b * c)}`],
      })
    }
    if (t === 1) {
      const a = int(2, 9)
      const b = int(2, 9)
      const c = int(5, 60)
      return q({
        prompt: `Calculate:<div class="big">${a} ${TIMES} ${b} ${MINUS} ${c}</div>`,
        answer: numA(a * b - c),
        hint: 'Multiply before you subtract.',
        steps: [`Multiply first: ${a} ${TIMES} ${b} = ${a * b}`, `Then subtract: ${a * b} ${MINUS} ${c} = ${num(a * b - c)}`],
      })
    }
    const c = int(2, 9)
    const k = int(2, 9)
    const b = c * k
    const a = int(1, 15)
    return q({
      prompt: `Calculate:<div class="big">${a} ${MINUS} ${b} ${DIVIDE} ${c}</div>`,
      answer: numA(a - k),
      hint: 'Divide before you subtract.',
      steps: [`Divide first: ${b} ${DIVIDE} ${c} = ${k}`, `Then subtract: ${a} ${MINUS} ${k} = ${num(a - k)}`],
    })
  }
  if (level === 2) {
    const t = int(0, 2)
    if (t === 0) {
      const a = nonZero(-9, 9)
      const b = nonZero(-9, 9)
      const c = nonZero(-6, 6)
      const s = a + b
      return q({
        prompt: `Calculate:<div class="big">(${num(a)} + ${bnum(b)}) ${TIMES} ${bnum(c)}</div>`,
        answer: numA(s * c),
        hint: 'Work out the brackets first.',
        steps: [`Brackets: ${num(a)} + ${bnum(b)} = ${num(s)}`, `Then multiply: ${num(s)} ${TIMES} ${bnum(c)} = ${num(s * c)}`],
      })
    }
    if (t === 1) {
      const a = nonZero(-12, 12)
      const b = nonZero(-6, 6)
      const c = nonZero(-6, 6)
      return q({
        prompt: `Calculate:<div class="big">${num(a)} ${MINUS} ${bnum(b)} ${TIMES} ${bnum(c)}</div>`,
        answer: numA(a - b * c),
        hint: 'Multiply before you subtract. Watch the signs.',
        steps: [`Multiply first: ${bnum(b)} ${TIMES} ${bnum(c)} = ${num(b * c)}`, `Then: ${num(a)} ${MINUS} ${bnum(b * c)} = ${num(a - b * c)}`],
      })
    }
    const a = nonZero(-8, 8)
    const b = nonZero(-8, 8)
    const c = nonZero(-8, 8)
    const d = nonZero(-8, 8)
    return q({
      prompt: `Calculate:<div class="big">${num(a)} ${TIMES} ${bnum(b)} + ${bnum(c)} ${TIMES} ${bnum(d)}</div>`,
      answer: numA(a * b + c * d),
      hint: 'Do both multiplications first, then add.',
      steps: [`${num(a)} ${TIMES} ${bnum(b)} = ${num(a * b)}`, `${bnum(c)} ${TIMES} ${bnum(d)} = ${num(c * d)}`, `${num(a * b)} + ${bnum(c * d)} = ${num(a * b + c * d)}`],
    })
  }
  const t = int(0, 2)
  if (t === 0) {
    const a = nonZero(-6, 6)
    const b = nonZero(-7, 7)
    const c = nonZero(-7, 7)
    const r = a * a - b * c
    return q({
      prompt: `Calculate:<div class="big">${pow(a, 2)} ${MINUS} ${bnum(b)} ${TIMES} ${bnum(c)}</div>`,
      answer: numA(r),
      hint: rule,
      steps: [`Power first: ${pow(a, 2)} = ${a * a}`, `Then multiply: ${bnum(b)} ${TIMES} ${bnum(c)} = ${num(b * c)}`, `Finally: ${a * a} ${MINUS} ${bnum(b * c)} = ${num(r)}`],
    })
  }
  if (t === 1) {
    const c = pick([2, 3, 4, 5, 6, 8, 9])
    let diff = nonZero(-9, 9)
    while ((diff * diff) % c !== 0) diff = nonZero(-9, 9)
    const b = int(-6, 6)
    const a = b + diff
    const r = (diff * diff) / c
    return q({
      prompt: `Calculate:<div class="big">(${num(a)} ${MINUS} ${bnum(b)})${'<sup>2</sup>'} ${DIVIDE} ${c}</div>`,
      answer: numA(r),
      hint: rule,
      steps: [`Brackets: ${num(a)} ${MINUS} ${bnum(b)} = ${num(diff)}`, `Power: ${pow(diff, 2)} = ${diff * diff}`, `Divide: ${diff * diff} ${DIVIDE} ${c} = ${num(r)}`],
    })
  }
  const a = nonZero(-20, 20)
  const b = nonZero(-5, 5)
  const c = nonZero(-4, 6)
  const d = intExcept(-4, 6, [0, c])
  const inner = c - d
  const r = a + b * inner * inner
  return q({
    prompt: `Calculate:<div class="big">${num(a)} + ${bnum(b)} ${TIMES} (${num(c)} ${MINUS} ${bnum(d)})<sup>2</sup></div>`,
    answer: numA(r),
    hint: rule,
    steps: [`Brackets: ${num(c)} ${MINUS} ${bnum(d)} = ${num(inner)}`, `Power: ${pow(inner, 2)} = ${inner * inner}`, `Multiply: ${bnum(b)} ${TIMES} ${inner * inner} = ${num(b * inner * inner)}`, `Add: ${num(a)} + ${bnum(b * inner * inner)} = ${num(r)}`],
  })
}

// ------------------------------------------------------------------ Angles

const ANGLE_TYPES = ['Acute', 'Right', 'Obtuse', 'Straight', 'Reflex', 'Revolution']
const angleType = (a: number) =>
  a < 90 ? 'Acute' : a === 90 ? 'Right' : a < 180 ? 'Obtuse' : a === 180 ? 'Straight' : a < 360 ? 'Reflex' : 'Revolution'
const ANGLE_RULES = 'Acute: less than 90°. Right: exactly 90°. Obtuse: between 90° and 180°. Straight: exactly 180°. Reflex: between 180° and 360°. Revolution: 360°.'

const ang_classify = (level: Level): Question => {
  if (level === 1) {
    const a = pick([pick([25, 35, 50, 65]), 90, pick([115, 130, 150]), 180, pick([220, 250, 300])])
    const t = angleType(a)
    return q({
      prompt: 'What type of angle is shown?',
      diagram: D.singleAngle(a),
      answer: mcFixedA(ANGLE_TYPES.slice(0, 5), t),
      hint: ANGLE_RULES,
      steps: [`This angle is ${t === 'Right' ? 'exactly a quarter turn (90°)' : t === 'Straight' ? 'a straight line (180°)' : t === 'Acute' ? 'smaller than a right angle' : t === 'Obtuse' ? 'bigger than a right angle but smaller than a straight angle' : 'bigger than a straight angle'}.`, `It is ${t === 'Acute' || t === 'Obtuse' ? 'an' : 'a'} ${t.toLowerCase()} angle.`],
    })
  }
  if (level === 2) {
    const a = pick([1, 45, 89, 90, 91, 135, 179, 180, 181, 270, 359, 360, 72, 108, 205, 320])
    const t = angleType(a)
    return q({
      prompt: `What type of angle measures <b>${deg(a)}</b>?`,
      answer: mcFixedA(ANGLE_TYPES, t),
      hint: ANGLE_RULES,
      steps: [ANGLE_RULES, `${deg(a)} is ${t === 'Acute' || t === 'Obtuse' ? 'an' : 'a'} ${t.toLowerCase()} angle.`],
    })
  }
  const h = pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
  const a = Math.min(30 * h, 360 - 30 * h)
  const t = angleType(a)
  return q({
    prompt: `At exactly ${h} o’clock, what type of angle is the <b>smaller</b> angle between the hour hand and the minute hand of a clock?`,
    answer: mcFixedA(ANGLE_TYPES.slice(0, 4), t),
    hint: 'A full turn is 360° and there are 12 numbers on a clock, so each gap between numbers is 30°.',
    steps: ['Each hour mark is 360° ÷ 12 = 30° apart.', `At ${h} o’clock the hands are ${Math.min(h, 12 - h)} gap${Math.min(h, 12 - h) > 1 ? 's' : ''} apart: ${Math.min(h, 12 - h)} ${TIMES} 30° = ${a}°.`, `${a}° is ${t === 'Acute' || t === 'Obtuse' ? 'an' : 'a'} ${t.toLowerCase()} angle.`],
  })
}

const ang_relationships = (level: Level): Question => {
  if (level === 1) {
    const t = pick(['line', 'right', 'vopp'])
    if (t === 'line') {
      const a = int(25, 155)
      const xFirst = chance()
      return q({
        prompt: `Find the value of ${v('x')}.`,
        diagram: D.anglesOnLine(xFirst ? [180 - a, a] : [a, 180 - a], xFirst ? [it('x') + '°', a + '°'] : [a + '°', it('x') + '°']),
        answer: numA(180 - a),
        prefix: `${v('x')} =`,
        hint: 'Angles on a straight line add to 180°.',
        steps: [`Angles on a straight line add to 180°.`, `${v('x')} + ${a} = 180`, `${v('x')} = 180 ${MINUS} ${a} = ${180 - a}`],
      })
    }
    if (t === 'right') {
      const a = int(15, 75)
      return q({
        prompt: `The angle shown is a right angle. Find the value of ${v('x')}.`,
        diagram: D.splitAngle([a, 90 - a], [a + '°', it('x') + '°'], true),
        answer: numA(90 - a),
        prefix: `${v('x')} =`,
        hint: 'Angles that make a right angle add to 90° (they are complementary).',
        steps: ['Angles in a right angle add to 90°.', `${v('x')} = 90 ${MINUS} ${a} = ${90 - a}`],
      })
    }
    const a = int(30, 150)
    return q({
      prompt: `Find the value of ${v('x')}.`,
      diagram: D.crossingLines(a, [a + '°', '', it('x') + '°', '']),
      answer: numA(a),
      prefix: `${v('x')} =`,
      hint: 'When two straight lines cross, the angles opposite each other are equal.',
      steps: ['Vertically opposite angles are equal.', `${v('x')} = ${a}`],
    })
  }
  if (level === 2) {
    const t = pick(['point', 'line3', 'words', 'vadj'])
    if (t === 'point') {
      const a = int(60, 140)
      const b = int(50, 130)
      const x = 360 - a - b
      if (x < 40) return ang_relationships(2)
      return q({
        prompt: `Find the value of ${v('x')}.`,
        diagram: D.anglesAtPoint([a, b, x], [a + '°', b + '°', it('x') + '°']),
        answer: numA(x),
        prefix: `${v('x')} =`,
        hint: 'Angles at a point (a full revolution) add to 360°.',
        steps: ['Angles at a point add to 360°.', `${v('x')} + ${a} + ${b} = 360`, `${v('x')} = 360 ${MINUS} ${a + b} = ${x}`],
      })
    }
    if (t === 'line3') {
      const a = int(30, 80)
      const b = int(30, 80)
      const x = 180 - a - b
      return q({
        prompt: `Find the value of ${v('y')}.`,
        diagram: D.anglesOnLine([a, x, b], [a + '°', it('y') + '°', b + '°']),
        answer: numA(x),
        prefix: `${v('y')} =`,
        hint: 'Angles on a straight line add to 180°.',
        steps: ['Angles on a straight line add to 180°.', `${v('y')} = 180 ${MINUS} ${a} ${MINUS} ${b} = ${x}`],
      })
    }
    if (t === 'words') {
      const comp = chance()
      const a = comp ? int(5, 85) : int(5, 175)
      return q({
        prompt: `What is the ${comp ? 'complement' : 'supplement'} of ${deg(a)}?`,
        answer: numA((comp ? 90 : 180) - a),
        suffix: '°',
        hint: comp ? 'Complementary angles add to 90°.' : 'Supplementary angles add to 180°.',
        steps: [comp ? 'Complementary angles add to 90°.' : 'Supplementary angles add to 180°.', `${comp ? 90 : 180} ${MINUS} ${a} = ${(comp ? 90 : 180) - a}°`],
      })
    }
    const a = int(35, 145)
    return q({
      prompt: `Find the value of ${v('m')}.`,
      diagram: D.crossingLines(a, [a + '°', it('m') + '°', '', '']),
      answer: numA(180 - a),
      prefix: `${v('m')} =`,
      hint: `${v('m')} and ${a}° sit next to each other on a straight line.`,
      steps: [`${v('m')} and ${a}° are adjacent angles on a straight line, so they add to 180°.`, `${v('m')} = 180 ${MINUS} ${a} = ${180 - a}`],
    })
  }
  const t = pick(['lineAlg', 'pointAlg', 'vopAlg'])
  if (t === 'lineAlg') {
    const p = int(2, 4)
    const qn = int(1, 3)
    const k = intExcept(10, 40, [])
    // (p x + k) + (q x) = 180 → x = (180 - k)/(p+q)
    let x = 0
    let kk = k
    for (let tries = 0; tries < 50; tries++) {
      kk = int(0, 40)
      if ((180 - kk) % (p + qn) === 0) {
        x = (180 - kk) / (p + qn)
        break
      }
    }
    if (!x) return ang_relationships(3)
    const A = p * x + kk
    const B = qn * x
    const la = kk ? `(${p}${it('x')} + ${kk})°` : `${p}${it('x')}°`
    const lb = qn === 1 ? `${it('x')}°` : `${qn}${it('x')}°`
    return q({
      prompt: `Find the value of ${v('x')}.`,
      diagram: D.anglesOnLine([A, B], [la, lb]),
      note: NOT_TO_SCALE,
      answer: numA(x),
      prefix: `${v('x')} =`,
      hint: 'Angles on a straight line add to 180°. Write an equation and solve it.',
      steps: [`Angles on a straight line add to 180°:`, ex(`${p}x ${kk ? '+ ' + kk : ''} + ${qn === 1 ? '' : qn}x = 180`), ex(`${p + qn}x ${kk ? '+ ' + kk + ' ' : ''}= 180`), kk ? ex(`${p + qn}x = ${180 - kk}`) : '', `${v('x')} = ${x}`].filter(Boolean),
    })
  }
  if (t === 'pointAlg') {
    const mults = sample([1, 2, 3, 4, 5], 3).sort()
    const s = mults.reduce((a, b) => a + b, 0)
    if (360 % s !== 0) return ang_relationships(3)
    const x = 360 / s
    if (x * Math.min(...mults) < 25) return ang_relationships(3)
    const labs = mults.map((m) => (m === 1 ? it('x') : m + it('x')) + '°')
    return q({
      prompt: `Find the value of ${v('x')}.`,
      diagram: D.anglesAtPoint(mults.map((m) => m * x), labs),
      answer: numA(x),
      prefix: `${v('x')} =`,
      hint: 'Angles at a point add to 360°.',
      steps: ['Angles at a point add to 360°:', ex(mults.map((m) => (m === 1 ? 'x' : m + 'x')).join(' + ') + ' = 360'), ex(`${s}x = 360`), `${v('x')} = 360 ${DIVIDE} ${s} = ${x}`],
    })
  }
  const x = int(12, 40)
  const m = int(2, 4)
  const c = int(5, 40)
  const a = m * x + c
  if (a >= 170) return ang_relationships(3)
  return q({
    prompt: `Find the value of ${v('x')}.`,
    diagram: D.crossingLines(a, [`(${m}${it('x')} + ${c})°`, '', `${a}°`, '']),
    answer: numA(x),
    prefix: `${v('x')} =`,
    hint: 'Vertically opposite angles are equal. Write an equation.',
    steps: ['Vertically opposite angles are equal:', ex(`${m}x + ${c} = ${a}`), ex(`${m}x = ${a - c}`), `${v('x')} = ${x}`],
  })
}

type PPos = 0 | 1 | 2 | 3
const ang_parallel = (level: Level): Question => {
  const theta = int(40, 75)
  const angleAt = (pos: PPos) => (pos % 2 === 0 ? theta : 180 - theta)
  // relationship pairs: [upperPos, lowerPos, name]
  const pairs: [PPos, PPos, string][] = [
    [0, 0, 'Corresponding'],
    [1, 1, 'Corresponding'],
    [2, 2, 'Corresponding'],
    [3, 3, 'Corresponding'],
    [2, 0, 'Alternate'],
    [3, 1, 'Alternate'],
    [2, 1, 'Co-interior'],
    [3, 0, 'Co-interior'],
  ]
  const reasons: Record<string, string> = {
    Corresponding: 'Corresponding angles on parallel lines are equal.',
    Alternate: 'Alternate angles on parallel lines are equal.',
    'Co-interior': 'Co-interior angles on parallel lines add to 180° (they are supplementary).',
  }
  const [up, lo, rel] = pick(pairs)
  const swap = chance()
  if (level === 1 && chance(0.5)) {
    return q({
      prompt: `The two lines marked with arrows are parallel. What is the relationship between angles ${v('a')} and ${v('b')}?`,
      diagram: D.parallelLines(theta, [
        { at: 0, pos: up, label: it(swap ? 'b' : 'a') },
        { at: 1, pos: lo, label: it(swap ? 'a' : 'b') },
      ]),
      answer: mcFixedA(['Corresponding', 'Alternate', 'Co-interior'], rel),
      hint: 'Corresponding angles are in matching positions (F shape). Alternate angles are on opposite sides of the transversal, between the parallel lines (Z shape). Co-interior angles are on the same side, between the parallel lines (C shape).',
      steps: [rel === 'Corresponding' ? 'The angles are in the same position at each intersection (an F shape).' : rel === 'Alternate' ? 'The angles are between the parallel lines on opposite sides of the transversal (a Z shape).' : 'The angles are between the parallel lines on the same side of the transversal (a C shape).', `They are ${rel.toLowerCase()} angles. ${reasons[rel]}`],
    })
  }
  if (level <= 2) {
    const knownUpper = chance()
    const known = angleAt(knownUpper ? up : lo)
    const x = rel === 'Co-interior' ? 180 - known : known
    if (level === 1 && rel === 'Co-interior') return ang_parallel(1)
    return q({
      prompt: `The lines marked with arrows are parallel. Find the value of ${v('x')}, and think about the reason.`,
      diagram: D.parallelLines(theta, [
        { at: 0, pos: up, label: knownUpper ? known + '°' : it('x') + '°' },
        { at: 1, pos: lo, label: knownUpper ? it('x') + '°' : known + '°' },
      ]),
      answer: numA(x),
      prefix: `${v('x')} =`,
      hint: 'Decide whether the angles are corresponding, alternate or co-interior.',
      steps: [`The angles are ${rel.toLowerCase()}.`, reasons[rel], rel === 'Co-interior' ? `${v('x')} = 180 ${MINUS} ${known} = ${x}` : `${v('x')} = ${x}`],
    })
  }
  if (chance(0.5)) {
    // two-step: vertically opposite or straight line, then a parallel relationship
    const lowPos = pick([0, 1, 2, 3] as PPos[])
    const upPos = ((lowPos + 2) % 4) as PPos // vertically opposite position at upper intersection
    const known = angleAt(lowPos)
    // x at upper intersection, at the position corresponding to lowPos's vertically opposite → equals known
    void upPos
    const target = pick([0, 1, 2, 3] as PPos[])
    const x = angleAt(target)
    return q({
      prompt: `The lines marked with arrows are parallel. Find the value of ${v('x')}.`,
      diagram: D.parallelLines(theta, [
        { at: 1, pos: lowPos, label: known + '°' },
        { at: 0, pos: target, label: it('x') + '°' },
      ]),
      answer: numA(x),
      prefix: `${v('x')} =`,
      hint: 'You may need two steps: use the angles at one intersection first (vertically opposite, or on a straight line), then a parallel-line relationship.',
      steps: [
        `The ${known}° angle and the angle in the same position at the top intersection are corresponding, so that angle is also ${known}°.`,
        target === lowPos
          ? `${v('x')} is in that position, so ${v('x')} = ${x}.`
          : (target + 2) % 4 === lowPos
            ? `${v('x')} is vertically opposite that angle, so ${v('x')} = ${x}.`
            : `${v('x')} and that angle lie on a straight line, so ${v('x')} = 180 ${MINUS} ${known} = ${x}.`,
      ],
    })
  }
  // algebraic
  const [u2, l2, r2] = pick(pairs.filter((p) => p[2] !== 'Co-interior'))
  const val = angleAt(u2)
  const m = pick([2, 3])
  let c = val - m * int(10, Math.floor(val / m) - 2)
  if (c <= 0) c = val % m === 0 ? 0 : val % m
  const x = (val - c) / m
  if (!Number.isInteger(x) || x <= 0) return ang_parallel(3)
  return q({
    prompt: `The lines marked with arrows are parallel. Find the value of ${v('x')}.`,
    diagram: D.parallelLines(theta, [
      { at: 0, pos: u2, label: c ? `(${m}${it('x')} + ${c})°` : `${m}${it('x')}°` },
      { at: 1, pos: l2, label: val + '°' },
    ]),
    answer: numA(x),
    prefix: `${v('x')} =`,
    hint: `The angles are ${r2.toLowerCase()}, so they are equal. Write an equation.`,
    steps: [reasons[r2], ex(`${m}x ${c ? '+ ' + c + ' ' : ''}= ${val}`), c ? ex(`${m}x = ${val - c}`) : '', `${v('x')} = ${x}`].filter(Boolean),
  })
}

// ------------------------------------------------------------------ Whole numbers & indices

const ind_notation = (level: Level): Question => {
  if (level === 1) {
    if (chance()) {
      const b = pick([2, 3, 4, 5, 6, 7, 10])
      const n = int(3, 6)
      return q({
        prompt: `Write in index notation:<div class="big">${Array(n).fill(b).join(` ${TIMES} `)}</div>`,
        answer: exprA(`${b}^${n}`, 'singlePower'),
        hint: 'Count how many times the number is multiplied by itself. That count is the index (power). Type powers with ^, e.g. 5^3.',
        steps: [`${b} is multiplied by itself ${n} times.`, `= ${pow(b, n)} (type it as ${b}^${n})`],
      })
    }
    const [b, n] = pick([[2, 3], [2, 4], [2, 5], [3, 2], [3, 3], [4, 2], [5, 2], [5, 3], [6, 2], [10, 3], [10, 4], [1, 7], [9, 2], [4, 3]] as [number, number][])
    return q({
      prompt: `Evaluate:<div class="big">${pow(b, n)}</div>`,
      answer: numA(Math.pow(b, n)),
      hint: `${pow(b, n)} means ${b} multiplied by itself ${n} times.`,
      steps: [`${pow(b, n)} = ${Array(n).fill(b).join(` ${TIMES} `)}`, `= ${num(Math.pow(b, n))}`],
    })
  }
  if (level === 2) {
    const t = int(0, 2)
    if (t === 0) {
      const [a, m] = pick([[2, 3], [3, 2], [2, 4], [5, 2], [4, 2], [3, 3]] as [number, number][])
      const [b, n] = pick([[2, 2], [3, 2], [2, 3], [1, 5], [10, 2], [6, 2]] as [number, number][])
      const op = pick(['+', '-', '*'])
      const A = Math.pow(a, m)
      const B = Math.pow(b, n)
      const r = op === '+' ? A + B : op === '-' ? A - B : A * B
      const sym = op === '+' ? '+' : op === '-' ? MINUS : TIMES
      return q({
        prompt: `Evaluate:<div class="big">${pow(a, m)} ${sym} ${pow(b, n)}</div>`,
        answer: numA(r),
        hint: 'Work out each power first.',
        steps: [`${pow(a, m)} = ${A} and ${pow(b, n)} = ${B}`, `${A} ${sym} ${B} = ${num(r)}`],
      })
    }
    if (t === 1) {
      const [p, qq] = sample([2, 3, 5, 7], 2).sort((x, y) => x - y)
      const m = int(2, 4)
      const n = int(2, 3)
      const parts = [...Array(m).fill(p), ...Array(n).fill(qq)]
      return q({
        prompt: `Write in index notation:<div class="big">${parts.join(` ${TIMES} `)}</div>`,
        answer: exprA(`${p}^${m}*${qq}^${n}`, 'singlePower'),
        hint: 'Group the same numbers together. Type it like 2^3 × 5^2 (use * or × between the powers).',
        steps: [`${p} appears ${m} times and ${qq} appears ${n} times.`, `= ${pow(p, m)} ${TIMES} ${pow(qq, n)}`],
      })
    }
    const n = int(3, 7)
    return q({
      prompt: `Write ${num(Math.pow(10, n))} as a power of 10.`,
      answer: exprA(`10^${n}`, 'singlePower'),
      hint: 'Count the zeros.',
      steps: [`${num(Math.pow(10, n))} has ${n} zeros.`, `${num(Math.pow(10, n))} = ${pow(10, n)}`],
    })
  }
  if (chance()) {
    const [b, n] = pick([[2, 5], [2, 6], [2, 7], [3, 4], [3, 5], [5, 4], [4, 4], [2, 8], [6, 3], [7, 3]] as [number, number][])
    return q({
      prompt: `Find the value of ${v('n')}:<div class="big">${b}<sup><i>n</i></sup> = ${num(Math.pow(b, n))}</div>`,
      answer: numA(n),
      prefix: `${v('n')} =`,
      hint: `Keep multiplying by ${b} and count how many ${b}s you need.`,
      steps: Array.from({ length: n }, (_, i) => `${pow(b, i + 1)} = ${num(Math.pow(b, i + 1))}`).concat([`So ${v('n')} = ${n}.`]),
    })
  }
  const pairs: [number, number, number, number][] = [
    [2, 5, 5, 2],
    [3, 4, 4, 3],
    [2, 6, 6, 2],
    [3, 5, 5, 3],
    [2, 3, 3, 2],
    [4, 5, 5, 4],
  ]
  const [a, m, b, n] = pick(pairs)
  const A = Math.pow(a, m)
  const B = Math.pow(b, n)
  const bigger = A > B ? pow(a, m) : pow(b, n)
  const smaller = A > B ? pow(b, n) : pow(a, m)
  return q({
    prompt: `Which is larger: ${pow(a, m)} or ${pow(b, n)}?`,
    answer: mcFixedA([pow(a, m), pow(b, n), 'They are equal'], bigger),
    hint: 'Evaluate each power.',
    steps: [`${pow(a, m)} = ${A} and ${pow(b, n)} = ${B}.`, `So ${bigger} is larger than ${smaller}.`],
  })
}

const ind_roots = (level: Level): Question => {
  if (level === 1) {
    if (chance(0.65)) {
      const r = int(1, 13)
      return q({
        prompt: `Evaluate:<div class="big">${sqrt(r * r)}</div>`,
        answer: numA(r),
        hint: `Which number multiplied by itself gives ${r * r}?`,
        steps: [`${r} ${TIMES} ${r} = ${r * r}`, `So ${sqrt(r * r)} = ${r}`],
      })
    }
    const r = pick([1, 2, 3, 4, 5, 10])
    return q({
      prompt: `Evaluate:<div class="big"><span class="sqrt"><sup class="root-idx">3</sup>√<span class="rad">${num(r ** 3)}</span></span></div>`,
      answer: numA(r),
      hint: `Which number multiplied by itself three times gives ${r ** 3}?`,
      steps: [`${r} ${TIMES} ${r} ${TIMES} ${r} = ${r ** 3}`, `So the cube root of ${num(r ** 3)} is ${r}.`],
    })
  }
  if (level === 2) {
    const t = int(0, 2)
    if (t === 0) {
      const [a, b, c] = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17]])
      return q({
        prompt: `Evaluate:<div class="big">${sqrt(`${a * a} + ${b * b}`)}</div>`,
        answer: numA(c),
        hint: 'The square root sign acts like a bracket: work out what is under it first.',
        steps: [`${a * a} + ${b * b} = ${c * c}`, `${sqrt(c * c)} = ${c}`],
      })
    }
    if (t === 1) {
      const a = int(2, 12)
      const b = int(2, 12)
      return q({
        prompt: `Evaluate:<div class="big">${sqrt(a * a)} + ${sqrt(b * b)}</div>`,
        answer: numA(a + b),
        hint: 'Find each square root first.',
        steps: [`${sqrt(a * a)} = ${a} and ${sqrt(b * b)} = ${b}`, `${a} + ${b} = ${a + b}`],
      })
    }
    const a = int(2, 9)
    return q({
      prompt: `Evaluate:<div class="big">${pow(a, 2)} ${MINUS} ${sqrt(a * a * 4)}</div>`,
      answer: numA(a * a - 2 * a),
      hint: 'Work out the power and the square root first.',
      steps: [`${pow(a, 2)} = ${a * a}`, `${sqrt(a * a * 4)} = ${2 * a}`, `${a * a} ${MINUS} ${2 * a} = ${a * a - 2 * a}`],
    })
  }
  const r = int(3, 14)
  const n = int(r * r + 1, (r + 1) * (r + 1) - 1)
  const opts = [`${r} and ${r + 1}`, `${r - 1} and ${r}`, `${r + 1} and ${r + 2}`, `${Math.floor(n / 2)} and ${Math.floor(n / 2) + 1}`]
  return q({
    prompt: `${sqrt(n)} lies between which two consecutive whole numbers?`,
    answer: mcA(opts[0], opts.slice(1)),
    hint: `Find the perfect squares on either side of ${n}.`,
    steps: [`${r}<sup>2</sup> = ${r * r} and ${r + 1}<sup>2</sup> = ${(r + 1) * (r + 1)}.`, `${r * r} &lt; ${n} &lt; ${(r + 1) * (r + 1)}, so ${r} &lt; ${sqrt(n)} &lt; ${r + 1}.`],
  })
}

function factorTreeSteps(n: number): string[] {
  const steps: string[] = []
  let m = n
  let p = 2
  while (m > 1 && !isPrime(m)) {
    if (m % p === 0) {
      steps.push(`${num(m)} = ${p} ${TIMES} ${num(m / p)}`)
      m /= p
    } else p++
  }
  const pf = primeFactors(n)
  steps.push(`So ${num(n)} = ${pf.map(([b, e]) => (e > 1 ? pow(b, e) : String(b))).join(` ${TIMES} `)}`)
  return steps
}

const wn_primes = (level: Level): Question => {
  if (level === 1 && chance(0.5)) {
    const prime = pick([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97])
    const comps = sample([1, 9, 15, 21, 25, 27, 33, 35, 39, 45, 49, 51, 57, 63, 69, 77, 81, 87, 91, 93], 3)
    return q({
      prompt: 'Which of these numbers is a prime number?',
      answer: mcA(String(prime), comps.map(String)),
      hint: 'A prime number has exactly two factors: 1 and itself. (1 is not prime.)',
      steps: [
        `${prime} has only two factors: 1 and ${prime}, so it is prime.`,
        ...comps.map((c) => (c === 1 ? '1 has only one factor, so it is not prime.' : `${c} is composite: ${c} = ${smallestFactor(c)} ${TIMES} ${c / smallestFactor(c)}.`)),
      ],
    })
  }
  const pool = L(level, [12, 18, 20, 24, 28, 30, 36, 40, 42, 45, 50], [56, 60, 72, 84, 90, 96, 100, 108, 126, 132, 150, 168, 180, 196], [240, 252, 300, 360, 392, 450, 504, 540, 600, 616, 780, 882, 1000])
  if (level === 3 && chance(0.5)) {
    const r = pick([12, 18, 24, 30, 36, 42, 45, 48, 60, 72])
    const sq = r * r
    const pf = primeFactors(sq)
    return q({
      prompt: `${num(sq)} = ${pf.map(([b, e]) => pow(b, e)).join(` ${TIMES} `)}. Use this to find ${sqrt(num(sq))}.`,
      answer: numA(r),
      hint: 'To find a square root, halve each index.',
      steps: [`Halve each index: ${sqrt(num(sq))} = ${pf.map(([b, e]) => (e / 2 > 1 ? pow(b, e / 2) : String(b))).join(` ${TIMES} `)}`, `= ${r}`],
    })
  }
  const n = pick(pool)
  return q({
    prompt: `Write ${num(n)} as a product of its prime factors, using index notation.`,
    answer: { kind: 'primefactors', value: n },
    hint: 'Use a factor tree: keep dividing by the smallest prime (2, 3, 5, 7…). Type powers with ^, e.g. 2^3 × 3.',
    steps: factorTreeSteps(n),
  })
}

function smallestFactor(n: number): number {
  for (let p = 2; p * p <= n; p++) if (n % p === 0) return p
  return n
}

const wn_hcf_lcm = (level: Level): Question => {
  if (level === 1) {
    const g = pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 12])
    let a = 0
    let b = 0
    do {
      a = g * int(2, 6)
      b = g * int(2, 6)
    } while (a === b || gcd(a, b) !== g || a > 72 || b > 72)
    return q({
      prompt: `Find the highest common factor (HCF) of ${a} and ${b}.`,
      answer: numA(g),
      hint: 'List the factors of each number and find the largest one that appears in both lists.',
      steps: [`Factors of ${a}: ${factorsOf(a).join(', ')}`, `Factors of ${b}: ${factorsOf(b).join(', ')}`, `The highest common factor is ${g}.`],
    })
  }
  if (level === 2) {
    let a = 0
    let b = 0
    do {
      a = int(3, 15)
      b = int(3, 15)
    } while (a === b)
    if (a === b) return wn_hcf_lcm(2)
    const l = lcm(a, b)
    return q({
      prompt: `Find the lowest common multiple (LCM) of ${a} and ${b}.`,
      answer: numA(l),
      hint: 'List the multiples of each number until you find one that appears in both lists.',
      steps: [`Multiples of ${a}: ${multiplesOf(a, l)}…`, `Multiples of ${b}: ${multiplesOf(b, l)}…`, `The lowest common multiple is ${l}.`],
    })
  }
  if (chance()) {
    const [a, b] = pick([[12, 18], [15, 20], [8, 12], [10, 25], [6, 9], [20, 30], [12, 15], [9, 12]])
    const l = lcm(a, b)
    return q({
      prompt: `At a bus interchange in Tweed Heads, the 600 bus leaves every ${a} minutes and the 605 bus leaves every ${b} minutes. Both leave together at 7:00 am. How many minutes later will they next leave together?`,
      answer: numA(l),
      suffix: 'minutes',
      hint: 'You need a time that is a multiple of both numbers: the LCM.',
      steps: [`Multiples of ${a}: ${multiplesOf(a, l)}`, `Multiples of ${b}: ${multiplesOf(b, l)}`, `LCM = ${l}, so they leave together again after ${l} minutes.`],
    })
  }
  const [a, b] = pick([[24, 36], [30, 45], [18, 27], [32, 48], [40, 56], [28, 42], [36, 60]])
  const g = gcd(a, b)
  return q({
    prompt: `A teacher has ${a} pencils and ${b} rulers to make into identical packs, using all of them with none left over. What is the greatest number of packs that can be made?`,
    answer: numA(g),
    suffix: 'packs',
    hint: 'The number of packs must divide both numbers exactly: find the HCF.',
    steps: [`Factors of ${a}: ${factorsOf(a).join(', ')}`, `Factors of ${b}: ${factorsOf(b).join(', ')}`, `HCF = ${g}, so ${g} packs (each with ${a / g} pencils and ${b / g} rulers).`],
  })
}

function factorsOf(n: number): number[] {
  const out: number[] = []
  for (let i = 1; i <= n; i++) if (n % i === 0) out.push(i)
  return out
}
function multiplesOf(n: number, upTo: number): string {
  const out: number[] = []
  for (let k = n; k <= upTo; k += n) out.push(k)
  return out.join(', ')
}

// ------------------------------------------------------------------ Fractions & percentages

const frac_simplify = (level: Level): Question => {
  if (level === 1) {
    const d0 = pick([3, 4, 5, 6, 7, 8, 9, 10])
    let n0 = int(1, d0 - 1)
    while (gcd(n0, d0) !== 1) n0 = int(1, d0 - 1)
    const k = int(2, 6)
    return q({
      prompt: `Simplify:<div class="big">${frac(n0 * k, d0 * k)}</div>`,
      answer: fracA(n0, d0),
      hint: 'Divide the numerator and denominator by their highest common factor. Type fractions like 3/4.',
      steps: [`The HCF of ${n0 * k} and ${d0 * k} is ${k}.`, `${frac(n0 * k, d0 * k)} = ${frac(`${n0 * k} ${DIVIDE} ${k}`, `${d0 * k} ${DIVIDE} ${k}`)} = ${frac(n0, d0)}`],
    })
  }
  if (level === 2) {
    const d0 = pick([3, 4, 5, 6, 7, 8, 9, 12])
    let n0 = int(1, d0 - 1)
    while (gcd(n0, d0) !== 1) n0 = int(1, d0 - 1)
    const k = int(2, 9)
    const missingTop = chance()
    return q({
      prompt: `Find the missing number:<div class="big">${frac(n0, d0)} = ${missingTop ? frac('?', d0 * k) : frac(n0 * k, '?')}</div>`,
      answer: numA(missingTop ? n0 * k : d0 * k),
      hint: 'Whatever you multiply the denominator by, you must multiply the numerator by the same number.',
      steps: missingTop
        ? [`${d0} ${TIMES} ${k} = ${d0 * k}, so multiply the numerator by ${k} too.`, `${n0} ${TIMES} ${k} = ${n0 * k}`]
        : [`${n0} ${TIMES} ${k} = ${n0 * k}, so multiply the denominator by ${k} too.`, `${d0} ${TIMES} ${k} = ${d0 * k}`],
    })
  }
  const fr = sample([[1, 2], [2, 3], [3, 4], [3, 5], [5, 8], [7, 10], [4, 9], [5, 6], [7, 12], [2, 5]], 4)
  const vals = fr.map(([a, b]) => a / b)
  const maxI = vals.indexOf(Math.max(...vals))
  const L2 = fr.reduce((acc, [, b]) => lcm(acc, b), 1)
  return q({
    prompt: 'Which fraction is the largest?',
    answer: mcA(frac(fr[maxI][0], fr[maxI][1]), fr.filter((_, i) => i !== maxI).map(([a, b]) => frac(a, b))),
    hint: 'Write the fractions with a common denominator, or convert them to decimals.',
    steps: [`Use the common denominator ${L2}:`, fr.map(([a, b]) => `${frac(a, b)} = ${frac(a * (L2 / b), L2)}`).join(', '), `The largest is ${frac(fr[maxI][0], fr[maxI][1])}.`],
  })
}

const frac_mixed = (level: Level): Question => {
  const d = pick(L(level, [2, 3, 4, 5], [3, 4, 5, 6, 8, 10], [6, 7, 8, 9, 11, 12]))
  const w = L(level, int(1, 4), int(1, 6), int(3, 12))
  let r = int(1, d - 1)
  while (gcd(r, d) !== 1) r = int(1, d - 1)
  const n = w * d + r
  if (level === 2 || (level === 3 && chance())) {
    return q({
      prompt: `Write as an improper fraction:<div class="big">${num(w)} ${frac(r, d)}</div>`,
      answer: fracA(n, d, { improper: true }),
      hint: 'Multiply the whole number by the denominator, then add the numerator.',
      steps: [`${w} ${TIMES} ${d} + ${r} = ${n}`, `${num(w)} ${frac(r, d)} = ${frac(n, d)}`],
    })
  }
  return q({
    prompt: `Write as a mixed number:<div class="big">${frac(n, d)}</div>`,
    answer: fracA(n, d, { mixed: true }),
    hint: 'Divide the numerator by the denominator. The remainder goes over the denominator. Type mixed numbers with a space, e.g. 2 3/4.',
    steps: [`${n} ${DIVIDE} ${d} = ${w} remainder ${r}`, `${frac(n, d)} = ${mixed(n, d)}`],
  })
}

const frac_addsub = (level: Level): Question => {
  if (level === 1) {
    const d = pick([5, 7, 8, 9, 10, 11, 12])
    const a = int(1, d - 2)
    const b = int(1, d - 1 - a)
    const add = chance(0.6)
    const [x, y] = add ? [a, b] : [a + b, b]
    const r = add ? a + b : a
    return q({
      prompt: `Calculate, and simplify if possible:<div class="big">${frac(x, d)} ${add ? '+' : MINUS} ${frac(y, d)}</div>`,
      answer: fracA(r, d),
      hint: 'The denominators are the same, so just add or subtract the numerators.',
      steps: [`${frac(x, d)} ${add ? '+' : MINUS} ${frac(y, d)} = ${frac(r, d)}`, gcd(r, d) > 1 ? `Simplify: ${frac(r, d)} = ${fracS(r, d)}` : 'This is already in simplest form.'],
    })
  }
  if (level === 2) {
    const pairs: [number, number][] = [[2, 3], [3, 4], [2, 5], [4, 5], [3, 5], [2, 7], [4, 8], [3, 6], [5, 10], [6, 4], [3, 8], [4, 6], [5, 6]]
    const [d1, d2] = pick(pairs)
    let a = int(1, d1 - 1)
    while (gcd(a, d1) !== 1) a = int(1, d1 - 1)
    let b = int(1, d2 - 1)
    while (gcd(b, d2) !== 1) b = int(1, d2 - 1)
    const add = chance(0.6)
    const L2 = lcm(d1, d2)
    const A = a * (L2 / d1)
    const B = b * (L2 / d2)
    if (!add && A <= B) return frac_addsub(2)
    const r = add ? A + B : A - B
    return q({
      prompt: `Calculate, and give your answer in simplest form:<div class="big">${frac(a, d1)} ${add ? '+' : MINUS} ${frac(b, d2)}</div>`,
      answer: fracA(r, L2),
      hint: `Rewrite both fractions with the lowest common denominator, ${L2}.`,
      steps: [`The lowest common denominator is ${L2}.`, `${frac(a, d1)} ${add ? '+' : MINUS} ${frac(b, d2)} = ${frac(A, L2)} ${add ? '+' : MINUS} ${frac(B, L2)}`, `= ${frac(r, L2)}${gcd(r, L2) > 1 || r > L2 ? ' = ' + (r > L2 ? mixed(r, L2) : fracS(r, L2)) : ''}`],
    })
  }
  const d1 = pick([2, 3, 4, 5, 6])
  const d2 = pick([3, 4, 6, 8, 10].filter((z) => z !== d1))
  const w1 = int(2, 5)
  const w2 = int(1, w1 - 1)
  let a = int(1, d1 - 1)
  while (gcd(a, d1) !== 1) a = int(1, d1 - 1)
  let b = int(1, d2 - 1)
  while (gcd(b, d2) !== 1) b = int(1, d2 - 1)
  const add = chance()
  const L2 = lcm(d1, d2)
  const N1 = (w1 * d1 + a) * (L2 / d1)
  const N2 = (w2 * d2 + b) * (L2 / d2)
  const r = add ? N1 + N2 : N1 - N2
  return q({
    prompt: `Calculate. Give your answer as a mixed number in simplest form.<div class="big">${w1} ${frac(a, d1)} ${add ? '+' : MINUS} ${w2} ${frac(b, d2)}</div>`,
    answer: fracA(r, L2, { mixed: true }),
    hint: 'One way: change both to improper fractions with a common denominator, then add or subtract.',
    steps: [`As improper fractions: ${frac(w1 * d1 + a, d1)} ${add ? '+' : MINUS} ${frac(w2 * d2 + b, d2)}`, `Common denominator ${L2}: ${frac(N1, L2)} ${add ? '+' : MINUS} ${frac(N2, L2)} = ${frac(r, L2)}`, `= ${mixed(r, L2)}`],
  })
}

const frac_muldiv = (level: Level): Question => {
  if (level === 1) {
    const d = pick([2, 3, 4, 5, 6, 8, 10])
    let n = int(1, d - 1)
    while (gcd(n, d) !== 1) n = int(1, d - 1)
    const k = int(2, 12)
    const amt = d * k
    const ctx = pick(['', 'students', 'dollars', 'minutes'])
    return q({
      prompt: ctx === 'students' ? `${frac(n, d)} of the ${amt} students in Year 7 walk to school. How many students walk to school?` : ctx === 'dollars' ? `Find ${frac(n, d)} of $${amt}.` : ctx === 'minutes' ? `How many minutes is ${frac(n, d)} of ${amt} minutes?` : `Find ${frac(n, d)} of ${amt}.`,
      answer: numA(n * k),
      prefix: ctx === 'dollars' ? '$' : undefined,
      hint: 'Divide by the denominator, then multiply by the numerator.',
      steps: [`${amt} ${DIVIDE} ${d} = ${k}`, `${k} ${TIMES} ${n} = ${n * k}`],
    })
  }
  if (level === 2) {
    let a = 0, b = 0, c = 0, d = 0
    do {
      a = int(1, 7)
      b = int(a + 1, 9)
      c = int(1, 7)
      d = int(c + 1, 10)
    } while (gcd(a, b) !== 1 || gcd(c, d) !== 1)
    const div = chance()
    const rn = div ? a * d : a * c
    const rd = div ? b * c : b * d
    return q({
      prompt: `Calculate, and give your answer in simplest form:<div class="big">${frac(a, b)} ${div ? DIVIDE : TIMES} ${frac(c, d)}</div>`,
      answer: fracA(rn, rd),
      hint: div ? 'To divide by a fraction, multiply by its reciprocal (flip the second fraction).' : 'Multiply the numerators together and the denominators together.',
      steps: div
        ? [`${frac(a, b)} ${DIVIDE} ${frac(c, d)} = ${frac(a, b)} ${TIMES} ${frac(d, c)}`, `= ${frac(rn, rd)}`, gcd(rn, rd) > 1 || rn > rd ? `= ${rn > rd ? mixed(rn, rd) : fracS(rn, rd)}` : 'This is in simplest form.']
        : [`${frac(a, b)} ${TIMES} ${frac(c, d)} = ${frac(`${a} ${TIMES} ${c}`, `${b} ${TIMES} ${d}`)} = ${frac(rn, rd)}`, gcd(rn, rd) > 1 ? `Simplify: ${fracS(rn, rd)}` : 'This is in simplest form.'],
    })
  }
  const d1 = pick([2, 3, 4, 5])
  const w1 = int(1, 3)
  let a = int(1, d1 - 1)
  while (gcd(a, d1) !== 1) a = int(1, d1 - 1)
  const d2 = pick([2, 3, 4, 5, 6])
  const w2 = int(1, 3)
  let b = int(1, d2 - 1)
  while (gcd(b, d2) !== 1) b = int(1, d2 - 1)
  const div = chance()
  const N1 = w1 * d1 + a
  const N2 = w2 * d2 + b
  const rn = div ? N1 * d2 : N1 * N2
  const rd = div ? d1 * N2 : d1 * d2
  return q({
    prompt: `Calculate. Give your answer in simplest form (as a mixed number if it is more than 1).<div class="big">${w1} ${frac(a, d1)} ${div ? DIVIDE : TIMES} ${w2} ${frac(b, d2)}</div>`,
    answer: fracA(rn, rd, { mixed: rn / rd > 1 && rn % rd !== 0 }),
    hint: 'Change mixed numbers to improper fractions first.',
    steps: [`${frac(N1, d1)} ${div ? DIVIDE : TIMES} ${frac(N2, d2)}`, div ? `= ${frac(N1, d1)} ${TIMES} ${frac(d2, N2)} = ${frac(rn, rd)}` : `= ${frac(rn, rd)}`, `= ${mixed(rn, rd)}`],
  })
}

const pct_convert = (level: Level): Question => {
  if (level === 1) {
    const p = pick([5, 8, 12, 15, 25, 30, 45, 50, 60, 75, 80, 95, 120, 3, 7])
    if (chance()) {
      return q({
        prompt: `Write ${p}% as a decimal.`,
        answer: numA(p / 100),
        hint: 'Per cent means “out of 100”. Divide by 100 (move the decimal point two places left).',
        steps: [`${p}% = ${p} ${DIVIDE} 100 = ${num(p / 100)}`],
      })
    }
    const dval = p / 100
    return q({
      prompt: `Write ${num(dval)} as a percentage.`,
      answer: numA(p),
      suffix: '%',
      hint: 'Multiply by 100 (move the decimal point two places right).',
      steps: [`${num(dval)} ${TIMES} 100 = ${p}%`],
    })
  }
  if (level === 2) {
    const p = pick([10, 20, 25, 40, 75, 35, 60, 15, 4, 12, 45, 80, 65, 2])
    if (chance()) {
      const g = gcd(p, 100)
      return q({
        prompt: `Write ${p}% as a fraction in simplest form.`,
        answer: fracA(p, 100),
        hint: 'Write the percentage over 100, then simplify.',
        steps: [`${p}% = ${frac(p, 100)}`, `Divide top and bottom by ${g}: ${fracS(p, 100)}`],
      })
    }
    const [n, d] = pick([[1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [1, 2], [7, 10], [3, 20], [9, 25], [11, 50], [1, 8], [3, 8]])
    return q({
      prompt: `Write ${frac(n, d)} as a percentage.`,
      answer: numA((n / d) * 100),
      suffix: '%',
      hint: 'Multiply the fraction by 100%.',
      steps: [`${frac(n, d)} ${TIMES} 100% = ${frac(n * 100, d)}%`, `= ${num((n * 100) / d)}%`],
    })
  }
  const items = sample(
    [
      { h: frac(3, 5), v: 0.6 },
      { h: '0.58', v: 0.58 },
      { h: '62%', v: 0.62 },
      { h: frac(5, 8), v: 0.625 },
      { h: '0.6', v: 0.6 + 1e-6 },
      { h: '59%', v: 0.59 },
      { h: frac(2, 3), v: 2 / 3 },
      { h: '0.65', v: 0.65 },
      { h: frac(7, 10), v: 0.7 },
      { h: '64%', v: 0.64 },
    ].filter((x, i, arr) => arr.findIndex((y) => Math.abs(y.v - x.v) < 1e-3) === i),
    4,
  )
  const asc = items.slice().sort((a, b) => a.v - b.v)
  const fmt = (arr: typeof items) => arr.map((x) => x.h).join(', ')
  const desc = asc.slice().reverse()
  let other = shuffle(items)
  while (fmt(other) === fmt(asc) || fmt(other) === fmt(desc)) other = shuffle(items)
  let other2 = shuffle(items)
  while ([fmt(asc), fmt(desc), fmt(other)].includes(fmt(other2))) other2 = shuffle(items)
  return q({
    prompt: `Which list is in ascending order (smallest first)?<div class="big">${fmt(items)}</div>`,
    answer: mcA(fmt(asc), [fmt(desc), fmt(other), fmt(other2)]),
    hint: 'Convert every number to the same form, e.g. a decimal, before comparing.',
    steps: [`As decimals: ${items.map((x) => `${x.h} = ${num(Number(x.v.toFixed(3)))}`).join('; ')}`, `Ascending: ${fmt(asc)}`],
  })
}

const pct_of = (level: Level): Question => {
  if (level === 1) {
    const p = pick([10, 25, 50, 20, 75, 5, 1])
    const unit = 100 / gcd(p, 100)
    const amt = unit * int(2, 30)
    const r = (p * amt) / 100
    const isMoney = chance()
    return q({
      prompt: `Find ${p}% of ${isMoney ? '$' + amt : num(amt) + ' kg'}.`,
      answer: numA(r),
      prefix: isMoney ? '$' : undefined,
      suffix: isMoney ? undefined : 'kg',
      hint: p === 10 ? 'To find 10%, divide by 10.' : p === 50 ? '50% is half.' : p === 25 ? '25% is one quarter: divide by 4.' : `${p}% = ${fracS(p, 100)}`,
      steps: [`${p}% = ${fracS(p, 100)}`, `${fracS(p, 100)} of ${num(amt)} = ${num(r)}`],
    })
  }
  if (level === 2) {
    if (chance()) {
      const p = pick([12, 15, 35, 45, 8, 65, 85, 17.5, 2.5, 62])
      const amt = pick([40, 60, 80, 120, 240, 360, 500, 75, 250, 1200])
      return q({
        prompt: `Find ${num(p)}% of ${num(amt)}.`,
        answer: numA((p * amt) / 100),
        calc: true,
        hint: 'Change the percentage to a decimal and multiply.',
        steps: [`${num(p)}% = ${num(p / 100)}`, `${num(p / 100)} ${TIMES} ${num(amt)} = ${num((p * amt) / 100)}`],
      })
    }
    const total = pick([20, 25, 40, 50, 80, 200])
    const part = int(1, total - 1)
    const p = (part / total) * 100
    if (!Number.isInteger(p * 10)) return pct_of(2)
    const name = pick(['Mia', 'Jack', 'Priya', 'Leo', 'Sienna'])
    return q({
      prompt: `${name} scored ${part} out of ${total} on a test. What percentage is this?`,
      answer: numA(p),
      suffix: '%',
      hint: 'Write it as a fraction, then multiply by 100%.',
      steps: [`${frac(part, total)} ${TIMES} 100% = ${num(p)}%`],
    })
  }
  const a = pick([18, 21, 27, 34, 36, 42, 45])
  const at = pick([20, 25, 30, 40, 50])
  const pB = pick([80, 82, 84, 85, 86, 88, 90])
  const pA = (a / at) * 100
  if (Math.abs(pA - pB) < 0.5 || a >= at) return pct_of(3)
  const [n1, n2] = sample(['Ava', 'Noah', 'Zara', 'Cooper', 'Mei', 'Arjun'], 2)
  const better = pA > pB ? n1 : n2
  return q({
    prompt: `${n1} scored ${a} out of ${at} in a quiz. ${n2} scored ${pB}% in the same quiz. Who did better?`,
    answer: mcFixedA([n1, n2], better),
    calc: true,
    hint: `Change ${n1}’s score to a percentage.`,
    steps: [`${n1}: ${frac(a, at)} ${TIMES} 100% = ${num(Number(pA.toFixed(2)))}%`, `${n2}: ${pB}%`, `${better} did better.`],
  })
}

// ------------------------------------------------------------------ Topics

export const Y7A: Topic[] = [
  {
    id: 'y7-integers',
    year: 7,
    title: 'Integers',
    strand: 'Number and algebra',
    outcomes: ['MA4-INT-C-01'],
    blurb: 'Compare, add, subtract, multiply and divide positive and negative whole numbers.',
    colour: 205,
    skills: [
      {
        id: 'y7-int-compare',
        title: 'Comparing and ordering integers',
        outcomes: ['MA4-INT-C-01'],
        summary: 'Use a number line to compare and order positive and negative numbers.',
        learn: {
          intro: '<p><b>Integers</b> are whole numbers that can be positive, negative or zero: …, −3, −2, −1, 0, 1, 2, 3, …</p><p>On a number line, numbers increase as you move to the right. So −2 is greater than −5, even though 5 is bigger than 2.</p>',
          keyPoints: ['&lt; means “is less than” and &gt; means “is greater than”.', 'Any positive number is greater than any negative number.', 'The further a negative number is from zero, the smaller it is.', '<b>Ascending</b> means smallest to largest; <b>descending</b> means largest to smallest.'],
          vocab: [['integer', 'a positive or negative whole number, or zero'], ['ascending', 'increasing order'], ['descending', 'decreasing order']],
        },
        gen: int_compare,
        levels: { 1: 'Compare two integers with < or >', 2: 'Order four integers', 3: 'Temperature problems' },
      },
      {
        id: 'y7-int-addsub',
        title: 'Adding and subtracting integers',
        outcomes: ['MA4-INT-C-01'],
        summary: 'Add and subtract integers, including subtracting a negative.',
        learn: {
          intro: '<p>Use a number line: adding moves you right, subtracting moves you left.</p><p>When two signs sit side by side, combine them first.</p>',
          keyPoints: ['Adding a negative is the same as subtracting: 5 + (−3) = 5 − 3 = 2.', 'Subtracting a negative is the same as adding: 5 − (−3) = 5 + 3 = 8.', 'Work from left to right when there are several additions and subtractions.'],
        },
        gen: int_addsub,
        levels: { 1: 'One negative, number line', 2: 'Adding and subtracting negatives', 3: 'Three terms and worded problems' },
      },
      {
        id: 'y7-int-muldiv',
        title: 'Multiplying and dividing integers',
        outcomes: ['MA4-INT-C-01'],
        summary: 'Use the sign rules to multiply and divide integers.',
        learn: {
          intro: '<p>Multiply or divide the numbers as usual, then decide the sign.</p>',
          keyPoints: ['Same signs → positive answer: (−4) × (−3) = 12.', 'Different signs → negative answer: (−4) × 3 = −12.', 'With several factors, count the negatives: an even number gives a positive answer, an odd number gives a negative answer.', 'A negative number squared is positive: (−5)² = 25.'],
        },
        gen: int_muldiv,
        levels: { 1: 'One negative factor', 2: 'Both negative, division', 3: 'Three factors, powers of negatives' },
      },
      {
        id: 'y7-int-orderops',
        title: 'Order of operations',
        outcomes: ['MA4-INT-C-01'],
        summary: 'Apply the order of operations to expressions with integers.',
        learn: {
          intro: '<p>To get the same answer as everyone else, we follow an agreed order of operations.</p>',
          keyPoints: ['1. Brackets', '2. Powers and square roots', '3. Multiplication and division, from left to right', '4. Addition and subtraction, from left to right'],
        },
        gen: int_orderops,
        levels: { 1: 'Two operations', 2: 'Brackets and negatives', 3: 'Powers, brackets and negatives' },
      },
    ],
  },
  {
    id: 'y7-angles',
    year: 7,
    title: 'Angles',
    strand: 'Measurement and space',
    outcomes: ['MA4-ANG-C-01'],
    blurb: 'Classify angles and use angle relationships, including angles on parallel lines.',
    colour: 18,
    skills: [
      {
        id: 'y7-ang-classify',
        title: 'Types of angles',
        outcomes: ['MA4-ANG-C-01'],
        summary: 'Classify angles as acute, right, obtuse, straight, reflex or a revolution.',
        learn: {
          intro: '<p>An angle measures the amount of turn between two arms that meet at a point called the vertex. Angles are measured in degrees (°).</p>',
          keyPoints: ['<b>Acute</b>: less than 90°', '<b>Right</b>: exactly 90° (shown with a small square)', '<b>Obtuse</b>: more than 90° but less than 180°', '<b>Straight</b>: exactly 180°', '<b>Reflex</b>: more than 180° but less than 360°', '<b>Revolution</b>: exactly 360°'],
        },
        gen: ang_classify,
        levels: { 1: 'Classify from a diagram', 2: 'Classify from a size, including borderline cases', 3: 'Clock-face angles' },
      },
      {
        id: 'y7-ang-relationships',
        title: 'Angle relationships',
        outcomes: ['MA4-ANG-C-01'],
        summary: 'Use angles on a straight line, at a point, vertically opposite, complementary and supplementary angles.',
        learn: {
          intro: '<p>Many unknown angles can be found from a few facts. Always state the reason you used.</p>',
          keyPoints: ['Angles on a straight line add to 180° (they are <b>supplementary</b>).', 'Angles in a right angle add to 90° (they are <b>complementary</b>).', 'Angles at a point add to 360°.', '<b>Vertically opposite</b> angles are equal.'],
        },
        gen: ang_relationships,
        levels: { 1: 'One step', 2: 'Several angles, complements and supplements', 3: 'Write and solve an equation' },
      },
      {
        id: 'y7-ang-parallel',
        title: 'Angles on parallel lines',
        outcomes: ['MA4-ANG-C-01'],
        summary: 'Identify corresponding, alternate and co-interior angles and use them to find unknowns.',
        learn: {
          intro: '<p>A <b>transversal</b> is a line that crosses two or more other lines. When it crosses parallel lines (marked with arrows), special pairs of angles are formed.</p>',
          keyPoints: ['<b>Corresponding</b> angles are equal (F shape).', '<b>Alternate</b> angles are equal (Z shape).', '<b>Co-interior</b> angles add to 180° (C shape).', 'If one of these relationships holds, the lines must be parallel.'],
        },
        gen: ang_parallel,
        levels: { 1: 'Name the relationship; equal angles', 2: 'Including co-interior angles', 3: 'Two steps or equations' },
      },
    ],
  },
  {
    id: 'y7-whole-numbers',
    year: 7,
    title: 'Whole numbers and indices',
    strand: 'Number and algebra',
    outcomes: ['MA4-IND-C-01', 'MA4-INT-C-01'],
    blurb: 'Index notation, square and cube roots, primes, prime factors, HCF and LCM.',
    colour: 265,
    skills: [
      {
        id: 'y7-ind-notation',
        title: 'Index notation',
        outcomes: ['MA4-IND-C-01'],
        summary: 'Write repeated multiplication in index form and evaluate powers.',
        learn: {
          intro: '<p>Index notation is a short way to write repeated multiplication. In 2<sup>5</sup>, 2 is the <b>base</b> and 5 is the <b>index</b> (or power).</p><p>2<sup>5</sup> = 2 × 2 × 2 × 2 × 2 = 32</p>',
          keyPoints: ['The index tells you how many times the base is multiplied by itself.', 'A number squared has index 2; a number cubed has index 3.', 'Powers of 10: 10<sup>3</sup> = 1000 (the index is the number of zeros).', 'On this site, type powers with ^, for example 2^5.'],
        },
        gen: ind_notation,
        levels: { 1: 'Write in index form; evaluate', 2: 'Expressions with powers; two bases', 3: 'Find the index; compare powers' },
      },
      {
        id: 'y7-ind-roots',
        title: 'Square roots and cube roots',
        outcomes: ['MA4-IND-C-01'],
        summary: 'Find square and cube roots and estimate square roots.',
        learn: {
          intro: '<p>Finding a square root undoes squaring: since 7<sup>2</sup> = 49, √49 = 7. Finding a cube root undoes cubing: since 4<sup>3</sup> = 64, ∛64 = 4.</p>',
          keyPoints: ['Perfect squares: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144…', 'Perfect cubes: 1, 8, 27, 64, 125, 1000…', 'Treat the square root sign like a bracket: √(9 + 16) = √25 = 5.', 'To estimate √50, find the perfect squares either side: 49 &lt; 50 &lt; 64, so √50 is between 7 and 8.'],
        },
        gen: ind_roots,
        levels: { 1: 'Perfect squares and cubes', 2: 'Expressions with roots', 3: 'Estimate square roots' },
      },
      {
        id: 'y7-wn-primes',
        title: 'Primes and prime factors',
        outcomes: ['MA4-IND-C-01'],
        summary: 'Identify primes and write numbers as a product of prime factors.',
        learn: {
          intro: '<p>A <b>prime</b> number has exactly two factors: 1 and itself (2, 3, 5, 7, 11, 13…). A <b>composite</b> number has more than two factors. The number 1 is neither prime nor composite.</p><p>Every composite number can be written as a product of primes, for example 72 = 2<sup>3</sup> × 3<sup>2</sup>.</p>',
          keyPoints: ['Use a factor tree: split the number into two factors, and keep going until every branch ends in a prime.', 'Write the primes in ascending order using index notation.', 'Type answers like 2^3 × 3^2 (you can use * instead of ×).'],
        },
        gen: wn_primes,
        levels: { 1: 'Identify primes; small numbers', 2: 'Prime factorisation up to 200', 3: 'Larger numbers; square roots from prime factors' },
      },
      {
        id: 'y7-wn-hcf-lcm',
        title: 'HCF and LCM',
        outcomes: ['MA4-INT-C-01', 'MA4-IND-C-01'],
        summary: 'Find highest common factors and lowest common multiples, and use them in problems.',
        learn: {
          intro: '<p>The <b>highest common factor (HCF)</b> is the largest number that divides into both numbers. The <b>lowest common multiple (LCM)</b> is the smallest number that both numbers divide into.</p>',
          keyPoints: ['HCF of 24 and 36: factors of 24 are 1, 2, 3, 4, 6, 8, 12, 24; factors of 36 are 1, 2, 3, 4, 6, 9, 12, 18, 36. HCF = 12.', 'LCM of 4 and 6: multiples of 4 are 4, 8, 12…; multiples of 6 are 6, 12… LCM = 12.', 'Sharing into equal groups → HCF. Events lining up again → LCM.'],
        },
        gen: wn_hcf_lcm,
        levels: { 1: 'HCF', 2: 'LCM', 3: 'Worded problems' },
      },
    ],
  },
  {
    id: 'y7-fractions',
    year: 7,
    title: 'Fractions and percentages',
    strand: 'Number and algebra',
    outcomes: ['MA4-FRC-C-01'],
    blurb: 'Equivalent fractions, operations with fractions, and percentages.',
    colour: 145,
    skills: [
      {
        id: 'y7-frac-simplify',
        title: 'Equivalent fractions',
        outcomes: ['MA4-FRC-C-01'],
        summary: 'Simplify fractions, find equivalent fractions and compare fractions.',
        learn: {
          intro: '<p>Equivalent fractions have the same value: 1/2 = 2/4 = 3/6. Multiply or divide the numerator and denominator by the same number to make an equivalent fraction.</p>',
          keyPoints: ['To simplify, divide the numerator and denominator by their HCF.', 'To compare fractions, rewrite them with a common denominator.', 'Type fractions with a slash, e.g. 3/4.'],
        },
        gen: frac_simplify,
        levels: { 1: 'Simplify', 2: 'Missing numbers', 3: 'Compare fractions' },
      },
      {
        id: 'y7-frac-mixed',
        title: 'Mixed numbers and improper fractions',
        outcomes: ['MA4-FRC-C-01'],
        summary: 'Convert between mixed numbers and improper fractions.',
        learn: {
          intro: '<p>An <b>improper fraction</b> has a numerator bigger than its denominator, e.g. 11/4. A <b>mixed number</b> has a whole number part and a fraction part, e.g. 2 3/4.</p>',
          keyPoints: ['Improper → mixed: divide; the remainder goes over the denominator. 11 ÷ 4 = 2 remainder 3, so 11/4 = 2 3/4.', 'Mixed → improper: multiply the whole number by the denominator and add the numerator. 2 3/4 = (2 × 4 + 3)/4 = 11/4.', 'Type mixed numbers with a space: 2 3/4.'],
        },
        gen: frac_mixed,
        levels: { 1: 'Improper to mixed', 2: 'Mixed to improper', 3: 'Larger numbers' },
      },
      {
        id: 'y7-frac-addsub',
        title: 'Adding and subtracting fractions',
        outcomes: ['MA4-FRC-C-01'],
        summary: 'Add and subtract fractions and mixed numbers.',
        learn: {
          intro: '<p>You can only add or subtract fractions when they have the same denominator.</p>',
          keyPoints: ['Same denominators: add or subtract the numerators. 2/7 + 3/7 = 5/7.', 'Different denominators: rewrite with the lowest common denominator. 1/3 + 1/4 = 4/12 + 3/12 = 7/12.', 'Mixed numbers: convert to improper fractions first.', 'Always simplify your answer.'],
        },
        gen: frac_addsub,
        levels: { 1: 'Same denominator', 2: 'Different denominators', 3: 'Mixed numbers' },
      },
      {
        id: 'y7-frac-muldiv',
        title: 'Multiplying and dividing fractions',
        outcomes: ['MA4-FRC-C-01'],
        summary: 'Find a fraction of a quantity; multiply and divide fractions.',
        learn: {
          intro: '<p>“Of” means multiply: 3/4 of 20 = 3/4 × 20 = 15.</p>',
          keyPoints: ['Multiply: numerator × numerator, denominator × denominator. 2/3 × 4/5 = 8/15.', 'Divide: multiply by the reciprocal of the second fraction. 2/3 ÷ 4/5 = 2/3 × 5/4 = 10/12 = 5/6.', 'Change mixed numbers to improper fractions before multiplying or dividing.'],
        },
        gen: frac_muldiv,
        levels: { 1: 'Fraction of a quantity', 2: 'Multiply and divide fractions', 3: 'Mixed numbers' },
      },
      {
        id: 'y7-pct-convert',
        title: 'Fractions, decimals and percentages',
        outcomes: ['MA4-FRC-C-01'],
        summary: 'Convert between fractions, decimals and percentages, and order them.',
        learn: {
          intro: '<p>Per cent means “out of 100”. 35% = 35/100 = 0.35.</p>',
          keyPoints: ['Percentage → decimal: divide by 100.', 'Decimal → percentage: multiply by 100.', 'Fraction → percentage: multiply by 100%.', 'Percentage → fraction: write over 100 and simplify.'],
        },
        gen: pct_convert,
        levels: { 1: 'Percentages and decimals', 2: 'Percentages and fractions', 3: 'Order mixed forms' },
      },
      {
        id: 'y7-pct-of',
        title: 'Percentage of a quantity',
        outcomes: ['MA4-FRC-C-01'],
        summary: 'Find a percentage of an amount and express one quantity as a percentage of another.',
        learn: {
          intro: '<p>To find a percentage of an amount, change the percentage to a fraction or decimal and multiply.</p>',
          keyPoints: ['10% = 1/10, so divide by 10. 25% = 1/4. 50% = 1/2.', 'Calculator method: 35% of 80 = 0.35 × 80 = 28.', 'To write a score as a percentage: score ÷ total × 100%.'],
        },
        gen: pct_of,
        levels: { 1: 'Common percentages', 2: 'Any percentage; express as a percentage', 3: 'Compare results' },
      },
    ],
  },
]
