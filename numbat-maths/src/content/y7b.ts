// Year 7 (Stage 4) — Algebra, Equations, Geometrical figures, Decimals
import type { Level, Question, Topic } from '@/lib/maths/types'
import { evaluate, parse } from '@/lib/maths/expr'
import {
  D, L, MINUS, TIMES, DIVIDE, bnum, chance, clean, deg, ex, frac, fracA, gcd, int, intExcept, mcA, mcFixedA,
  nonZero, num, numA, pick, q, sample, shuffle, exprA, v, terms, coef, money, NOT_TO_SCALE, round, name,
} from './helpers'

const it = (s: string) => `<tspan class="it">${s}</tspan>`

// ------------------------------------------------------------------ Algebra

const alg_words = (level: Level): Question => {
  const x = pick(['n', 'x', 'm', 'p', 'k', 'y', 'a', 'b'])
  const hint = 'Read the sentence carefully and decide which operation each phrase means: more/sum → +, less/difference → −, product/times → ×, divided/quotient → ÷.'
  if (level === 1) {
    const k = int(2, 12)
    const t = pick([
      [`${k} more than ${v(x)}`, `${x} + ${k}`, `“More than” means add.`],
      [`${v(x)} decreased by ${k}`, `${x} - ${k}`, `“Decreased by” means subtract.`],
      [`${k} less than ${v(x)}`, `${x} - ${k}`, `“${k} less than ${x}” means start with ${x} and take away ${k}.`],
      [`the product of ${k} and ${v(x)}`, `${k}${x}`, `“Product” means multiply. We write ${k} × ${x} as ${k}${x}.`],
      [`${v(x)} divided by ${k}`, `${x}/${k}`, `“Divided by” means ÷. We write ${x} ÷ ${k} as a fraction.`],
      [`twice ${v(x)}`, `2${x}`, `“Twice” means multiply by 2.`],
      [`the sum of ${v(x)} and ${k}`, `${x} + ${k}`, `“Sum” means add.`],
    ] as [string, string, string][])
    return q({
      prompt: `Write an algebraic expression for:<div class="big">${t[0]}</div>`,
      answer: exprA(t[1]),
      hint,
      steps: [t[2], `Expression: ${ex(t[1])}`],
    })
  }
  if (level === 2) {
    const a = int(2, 9)
    const k = int(2, 12)
    const t = pick([
      [`${k} less than ${a} times ${v(x)}`, `${a}${x} - ${k}`, `${a} times ${x} is ${a}${x}; then take away ${k}.`],
      [`half of ${v(x)}, plus ${k}`, `${x}/2 + ${k}`, `Half of ${x} is ${x}/2; then add ${k}.`],
      [`the sum of ${v(x)} and ${k}, multiplied by ${a}`, `${a}(${x} + ${k})`, `Add first (use brackets), then multiply by ${a}.`],
      [`${v(x)} squared, minus ${k}`, `${x}^2 - ${k}`, `${x} squared is ${x}<sup>2</sup>.`],
      [`${v(x)} subtracted from ${k * 3}`, `${k * 3} - ${x}`, `Start with ${k * 3} and take away ${x}.`],
      [`the product of ${v(x)} and ${a}, divided by ${k}`, `${a}${x}/${k}`, `Multiply first to get ${a}${x}, then divide by ${k}.`],
    ] as [string, string, string][])
    return q({
      prompt: `Write an algebraic expression for:<div class="big">${t[0]}</div>`,
      answer: exprA(t[1]),
      hint,
      steps: [t[2], `Expression: ${ex(t[1])}`],
    })
  }
  const nm = name()
  const t = pick([
    () => {
      const n = int(3, 9)
      const r = pick([2, 3, 4, 5])
      return [`Pens cost $${v('p')} each and a ruler costs $${r}. Write an expression for the total cost, in dollars, of ${n} pens and one ruler.`, `${n}p + ${r}`, `${n} pens cost ${n} × ${v('p')} = ${n}${v('p')} dollars. Add $${r} for the ruler.`]
    },
    () => [`A farm has ${v('c')} chickens and ${v('s')} sheep. Write an expression for the total number of legs.`, '2c + 4s', `Each chicken has 2 legs (2${v('c')}) and each sheep has 4 legs (4${v('s')}).`],
    () => {
      const d = int(2, 6)
      return [`${nm} is ${v('x')} years old. ${nm}’s cousin is ${d} years older. Write an expression for the sum of their ages.`, `2x + ${d}`, `The cousin is ${v('x')} + ${d}. Sum: ${v('x')} + ${v('x')} + ${d} = 2${v('x')} + ${d}.`]
    },
    () => {
      const d = int(2, 9)
      return [`A rectangle is ${v('w')} cm wide and ${d} cm longer than it is wide. Write an expression for its perimeter, in cm.`, `4w + ${2 * d}`, `Length = ${v('w')} + ${d}. Perimeter = 2 × width + 2 × length = 2${v('w')} + 2(${v('w')} + ${d}) = 4${v('w')} + ${2 * d}.`]
    },
    () => {
      const A = int(1, 4)
      const C = int(2, 5)
      return [`Movie tickets cost $${v('a')} for an adult and $${v('c')} for a child. Write an expression for the cost of ${A} adult${A > 1 ? 's' : ''} and ${C} children.`, `${A === 1 ? '' : A}a + ${C}c`, `${A} adult ticket${A > 1 ? 's' : ''}: ${A === 1 ? '' : A}${v('a')}. ${C} child tickets: ${C}${v('c')}.`]
    },
    () => {
      const per = pick([4, 6, 8, 10])
      const extra = int(2, 7)
      return [`Muffins come in boxes of ${per}. ${nm} buys ${v('b')} boxes and eats ${extra} muffins. Write an expression for the number of muffins left.`, `${per}b - ${extra}`, `${v('b')} boxes hold ${per}${v('b')} muffins. Take away the ${extra} eaten.`]
    },
  ])() as [string, string, string]
  return q({ prompt: t[0], answer: exprA(t[1]), hint: 'Use the pronumerals given. Build the expression one part at a time.', steps: [t[2], `Expression: ${ex(t[1])}`] })
}

/** Substitutes values into a template like "3*x - 2*y" and returns display strings. */
function substitute(template: string, vals: Record<string, number>) {
  const shown = ex(template.replace(/\*/g, ''))
  let sub = ''
  for (let i = 0; i < template.length; i++) {
    const c = template[i]
    if (/[a-z]/.test(c) && c in vals) {
      const val = vals[c]
      const nextIsPow = template[i + 1] === '^'
      sub += val < 0 || (nextIsPow && val < 0) ? `(${num(val)})` : num(val)
    } else if (c === '*') sub += ` ${TIMES} `
    else if (c === '^') {
      sub += `<sup>${template[i + 1]}</sup>`
      i++
    } else if (c === '-') sub += MINUS
    else if (c === '/') sub += ` ${DIVIDE} `
    else sub += c
  }
  const value = clean(evaluate(parse(template), vals))
  return { shown, sub: sub.replace(/ {2,}/g, ' '), value }
}

const alg_sub = (level: Level): Question => {
  if (level === 1) {
    const a = int(1, 10)
    const t = pick(['4*a + 2', '3*a - 5', '20 - 2*a', '5*(a + 1)', 'a^2 + 1', '6*a', '10 + 3*a'])
    const { shown, sub, value } = substitute(t, { a })
    return q({
      prompt: `Find the value of ${shown} when ${v('a')} = ${a}.`,
      answer: numA(value),
      hint: `Replace ${v('a')} with ${a}. Remember 4${v('a')} means 4 × ${v('a')}.`,
      steps: [`Substitute ${v('a')} = ${a}: ${sub}`, `= ${num(value)}`],
    })
  }
  if (level === 2) {
    const x = nonZero(-5, 6)
    const y = nonZero(-5, 6)
    const t = pick(['3*x - 2*y', 'x*y + 4', '2*x^2', 'x - y^2', '5*y - x', 'x^2 + y^2', '4*(x - y)'])
    const { shown, sub, value } = substitute(t, { x, y })
    return q({
      prompt: `Find the value of ${shown} when ${v('x')} = ${num(x)} and ${v('y')} = ${num(y)}.`,
      answer: numA(value),
      hint: 'Put negative numbers in brackets when you substitute. Follow the order of operations.',
      steps: [`Substitute: ${sub}`, `= ${num(value)}`],
    })
  }
  const t = pick(['P', 'A', 'v', 'F', 'frac'])
  if (t === 'P') {
    const l = int(12, 60) / 2
    const w = int(4, 24) / 2
    return q({
      prompt: `The perimeter of a rectangle is given by ${ex('P = 2l + 2w')}. Find ${v('P')} when ${v('l')} = ${num(l)} cm and ${v('w')} = ${num(w)} cm.`,
      answer: numA(2 * l + 2 * w),
      suffix: 'cm',
      hint: 'Substitute, then multiply before adding.',
      steps: [`${v('P')} = 2 ${TIMES} ${num(l)} + 2 ${TIMES} ${num(w)}`, `= ${num(2 * l)} + ${num(2 * w)}`, `= ${num(2 * l + 2 * w)} cm`],
    })
  }
  if (t === 'A') {
    const b = int(3, 20)
    const h = int(2, 15)
    return q({
      prompt: `The area of a triangle is given by ${ex('A = frac{1}{2}bh')}. Find ${v('A')} when ${v('b')} = ${b} m and ${v('h')} = ${h} m.`,
      answer: numA((b * h) / 2),
      suffix: 'm²',
      hint: `${ex('frac{1}{2}bh')} means ½ × ${v('b')} × ${v('h')}.`,
      steps: [`${v('A')} = ${frac(1, 2)} ${TIMES} ${b} ${TIMES} ${h}`, `= ${frac(1, 2)} ${TIMES} ${b * h}`, `= ${num((b * h) / 2)} m²`],
    })
  }
  if (t === 'v') {
    const u = int(0, 20)
    const a = nonZero(-4, 5)
    const tt = int(2, 9)
    return q({
      prompt: `The formula ${ex('v = u + at')} gives the speed of an object. Find ${v('v')} when ${v('u')} = ${u}, ${v('a')} = ${num(a)} and ${v('t')} = ${tt}.`,
      answer: numA(u + a * tt),
      hint: `${v('at')} means ${v('a')} × ${v('t')}.`,
      steps: [`${v('v')} = ${u} + ${bnum(a)} ${TIMES} ${tt}`, `= ${u} + ${bnum(a * tt)}`, `= ${num(u + a * tt)}`],
    })
  }
  if (t === 'F') {
    const C = pick([-10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 100])
    const F = (9 * C) / 5 + 32
    return q({
      prompt: `To change degrees Celsius to degrees Fahrenheit, use ${ex('F = frac{9C}{5} + 32')}. Find ${v('F')} when ${v('C')} = ${num(C)}.`,
      answer: numA(F),
      suffix: '°F',
      hint: `Multiply ${v('C')} by 9, divide by 5, then add 32.`,
      steps: [`${v('F')} = ${frac(`9 ${TIMES} ${bnum(C)}`, 5)} + 32`, `= ${frac(num(9 * C), 5)} + 32 = ${num((9 * C) / 5)} + 32`, `= ${num(F)}`],
    })
  }
  const c = pick([2, 3, 4, 5, 6])
  let a = nonZero(-12, 15)
  let b = nonZero(-12, 15)
  while ((a + b) % c !== 0 || a + b === 0) {
    a = nonZero(-12, 15)
    b = nonZero(-12, 15)
  }
  return q({
    prompt: `Find the value of ${ex('frac{a + b}{c}')} when ${v('a')} = ${num(a)}, ${v('b')} = ${num(b)} and ${v('c')} = ${c}.`,
    answer: numA((a + b) / c),
    hint: 'The fraction bar acts like a bracket: work out the top first.',
    steps: [`Top: ${num(a)} + ${bnum(b)} = ${num(a + b)}`, `${num(a + b)} ${DIVIDE} ${c} = ${num((a + b) / c)}`],
  })
}

const alg_like = (level: Level): Question => {
  const x = pick(['x', 'a', 'm', 'p', 'y'])
  if (level === 1) {
    const n = int(2, 3)
    const cs: number[] = []
    for (let i = 0; i < n; i++) cs.push(int(1, 12))
    if (n === 3 && chance()) cs[1] = -Math.min(cs[1], cs[0] - 1 || 1)
    const total = cs.reduce((s, c) => s + c, 0)
    if (total <= 0) return alg_like(1)
    const shown = terms(cs.map((c) => [c, x] as [number, string]))
    const ans = coef(total, x)
    return q({
      prompt: `Simplify:<div class="big">${ex(shown)}</div>`,
      answer: exprA(ans, 'simplified'),
      hint: `All the terms are like terms (they all contain ${v(x)}), so add or subtract their coefficients.`,
      steps: [`Add the coefficients: ${cs.map((c, i) => (i === 0 ? num(c) : c < 0 ? `${MINUS} ${-c}` : `+ ${c}`)).join(' ')} = ${total}`, `= ${ex(ans)}`],
    })
  }
  const [p, r] = sample(['x', 'y', 'a', 'b', 'm', 'n'], 2).sort()
  if (level === 2) {
    const c1 = nonZero(-9, 12)
    const c2 = nonZero(-9, 12)
    const c3 = nonZero(-9, 12)
    const c4 = nonZero(-9, 12)
    const list: [number, string][] = shuffle([
      [c1, p],
      [c2, r],
      [c3, p],
      [c4, r],
    ])
    if (list[0][0] < 0) list[0][0] = -list[0][0]
    const cp = list.filter((t) => t[1] === p).reduce((s, t) => s + t[0], 0)
    const cr = list.filter((t) => t[1] === r).reduce((s, t) => s + t[0], 0)
    if (cp === 0 || cr === 0) return alg_like(2)
    const ans = terms([
      [cp, p],
      [cr, r],
    ])
    return q({
      prompt: `Simplify:<div class="big">${ex(terms(list))}</div>`,
      answer: exprA(ans, 'simplified'),
      hint: `Group the ${v(p)} terms together and the ${v(r)} terms together. The sign belongs to the term after it.`,
      steps: [`${v(p)} terms: ${list.filter((t) => t[1] === p).map((t) => num(t[0])).join(', ')} → ${num(cp)}${v(p)}`, `${v(r)} terms: ${list.filter((t) => t[1] === r).map((t) => num(t[0])).join(', ')} → ${num(cr)}${v(r)}`, `= ${ex(ans)}`],
    })
  }
  const a1 = nonZero(-6, 7)
  const a2 = nonZero(-6, 7)
  const b1 = nonZero(-8, 8)
  const b2 = nonZero(-8, 8)
  const k = nonZero(-9, 9)
  const kind = chance() ? `${x}^2` : `${p}${r}`
  const list: [number, string][] = [
    [Math.abs(a1), kind],
    [b1, x],
    [a2, kind],
    [b2, x],
    [k, ''],
  ]
  const A = Math.abs(a1) + a2
  const B = b1 + b2
  if (A === 0 || B === 0) return alg_like(3)
  const ans = terms([
    [A, kind],
    [B, x],
    [k, ''],
  ])
  return q({
    prompt: `Simplify:<div class="big">${ex(terms(list))}</div>`,
    answer: exprA(ans, 'simplified'),
    hint: `${ex(kind)} and ${v(x)} are not like terms: the pronumerals must match exactly, including powers.`,
    steps: [`${ex(kind)} terms: ${num(Math.abs(a1))} + ${bnum(a2)} = ${num(A)}`, `${v(x)} terms: ${num(b1)} + ${bnum(b2)} = ${num(B)}`, `The number term stays: ${num(k)}`, `= ${ex(ans)}`],
  })
}

const alg_muldiv = (level: Level): Question => {
  const [p, r] = sample(['a', 'b', 'x', 'y', 'm', 'n'], 2).sort()
  if (level === 1) {
    const a = int(2, 9)
    const b = int(2, 9)
    const form = pick([0, 1])
    const shown = form === 0 ? `${a} ${TIMES} ${b}${v(p)}` : `${a}${v(p)} ${TIMES} ${b}`
    return q({
      prompt: `Simplify:<div class="big">${shown}</div>`,
      answer: exprA(`${a * b}${p}`, 'simplified'),
      hint: 'Multiply the numbers, then write the pronumeral after the number.',
      steps: [`${a} ${TIMES} ${b} = ${a * b}`, `= ${a * b}${v(p)}`],
    })
  }
  if (level === 2) {
    const t = pick([0, 1, 2, 3])
    if (t === 0) {
      const a = int(2, 9)
      const b = int(2, 9)
      return q({
        prompt: `Simplify:<div class="big">${a}${v(p)} ${TIMES} ${b}${v(r)}</div>`,
        answer: exprA(`${a * b}${p}${r}`, 'simplified'),
        hint: 'Multiply the numbers, then multiply the pronumerals. Write pronumerals in alphabetical order.',
        steps: [`${a} ${TIMES} ${b} = ${a * b} and ${v(p)} ${TIMES} ${v(r)} = ${v(p + r)}`, `= ${a * b}${v(p + r)}`],
      })
    }
    if (t === 1) {
      const b = int(2, 9)
      const k = int(2, 9)
      return q({
        prompt: `Simplify:<div class="big">${b * k}${v(p)} ${DIVIDE} ${b}</div>`,
        answer: exprA(`${k}${p}`, 'simplified'),
        hint: 'Divide the numbers.',
        steps: [`${b * k} ${DIVIDE} ${b} = ${k}`, `= ${k}${v(p)}`],
      })
    }
    if (t === 2) {
      const a = int(2, 7)
      const b = int(2, 7)
      return q({
        prompt: `Simplify:<div class="big">${a}${v(p)} ${TIMES} ${b}${v(p)}</div>`,
        answer: exprA(`${a * b}${p}^2`, 'simplified'),
        hint: `${v(p)} × ${v(p)} = ${v(p)}<sup>2</sup>`,
        steps: [`${a} ${TIMES} ${b} = ${a * b} and ${v(p)} ${TIMES} ${v(p)} = ${v(p)}<sup>2</sup>`, `= ${a * b}${v(p)}<sup>2</sup>`],
      })
    }
    const b = int(2, 8)
    const k = int(2, 8)
    return q({
      prompt: `Simplify:<div class="big">${frac(`${b * k}${v(p + r)}`, `${b}${v(p)}`)}</div>`,
      answer: exprA(`${k}${r}`, 'simplified'),
      hint: 'Divide the numbers, then cancel any pronumeral that appears on the top and bottom.',
      steps: [`${b * k} ${DIVIDE} ${b} = ${k}`, `${v(p + r)} ${DIVIDE} ${v(p)} = ${v(r)}`, `= ${k}${v(r)}`],
    })
  }
  const t = pick([0, 1, 2])
  if (t === 0) {
    const a = nonZero(-6, 6)
    const b = nonZero(-6, 6)
    const A = a < 0 ? `${MINUS}${-a}` : String(a)
    return q({
      prompt: `Simplify:<div class="big">${A}${v(p)} ${TIMES} ${b < 0 ? '(' + MINUS + -b + v(p + r) + ')' : b + v(p + r)}</div>`,
      answer: exprA(`${a * b}${p}^2${r}`, 'simplified'),
      hint: 'Sign first (same signs → positive), then numbers, then pronumerals.',
      steps: [`${num(a)} ${TIMES} ${bnum(b)} = ${num(a * b)}`, `${v(p)} ${TIMES} ${v(p + r)} = ${v(p)}<sup>2</sup>${v(r)}`, `= ${num(a * b)}${v(p)}<sup>2</sup>${v(r)}`],
    })
  }
  if (t === 1) {
    const b = int(2, 9)
    const k = nonZero(-8, 8)
    const top = -b * k
    return q({
      prompt: `Simplify:<div class="big">${num(top)}${v(p + r)} ${DIVIDE} (${MINUS}${b}${v(r)})</div>`,
      answer: exprA(coef(k, p), 'simplified'),
      hint: 'Divide the numbers (watch the signs), then cancel the common pronumeral.',
      steps: [`${num(top)} ${DIVIDE} (${MINUS}${b}) = ${num(k)}`, `${v(p + r)} ${DIVIDE} ${v(r)} = ${v(p)}`, `= ${ex(coef(k, p))}`],
    })
  }
  const a = int(2, 5)
  const b = int(2, 5)
  const c = int(2, 4)
  return q({
    prompt: `Simplify:<div class="big">${a}${v(p)} ${TIMES} ${b}${v(r)} ${TIMES} ${c}${v(p)}</div>`,
    answer: exprA(`${a * b * c}${p}^2${r}`, 'simplified'),
    hint: 'Multiply all the numbers, then all the pronumerals.',
    steps: [`${a} ${TIMES} ${b} ${TIMES} ${c} = ${a * b * c}`, `${v(p)} ${TIMES} ${v(r)} ${TIMES} ${v(p)} = ${v(p)}<sup>2</sup>${v(r)}`, `= ${a * b * c}${v(p)}<sup>2</sup>${v(r)}`],
  })
}

// ------------------------------------------------------------------ Equations

const eq_one = (level: Level): Question => {
  const x = pick(['x', 'a', 'm', 'n', 'y', 'p'])
  const sol = L(level, int(1, 15), nonZero(-15, 15), 0)
  if (level === 3) {
    const t = pick(['dec', 'frac', 'adddec'])
    if (t === 'dec') {
      const a = pick([2, 4, 5, 8])
      const s = int(1, 19) / (a === 8 ? 8 : a)
      if (Number.isInteger(s)) return eq_one(3)
      return q({
        prompt: `Solve:<div class="big">${a}${v(x)} = ${num(a * s)}</div>`,
        answer: numA(s),
        prefix: `${v(x)} =`,
        hint: `Divide both sides by ${a}.`,
        steps: [`${a}${v(x)} = ${num(a * s)}`, `Divide both sides by ${a}: ${v(x)} = ${num(a * s)} ${DIVIDE} ${a} = ${num(s)}`],
      })
    }
    if (t === 'frac') {
      const a = pick([3, 6, 7, 9])
      let b = int(1, 2 * a)
      while (b % a === 0) b = int(1, 2 * a)
      return q({
        prompt: `Solve, giving your answer as a fraction:<div class="big">${a}${v(x)} = ${b}</div>`,
        answer: fracA(b, a),
        prefix: `${v(x)} =`,
        hint: `Divide both sides by ${a}. The answer will be a fraction.`,
        steps: [`Divide both sides by ${a}:`, `${v(x)} = ${frac(b, a)}${gcd(a, b) > 1 ? ' = ' + frac(b / gcd(a, b), a / gcd(a, b)) : ''}`],
      })
    }
    const a = int(11, 99) / 10
    const s = int(11, 99) / 10
    return q({
      prompt: `Solve:<div class="big">${v(x)} + ${num(a)} = ${num(clean(a + s))}</div>`,
      answer: numA(s),
      prefix: `${v(x)} =`,
      hint: `Subtract ${num(a)} from both sides.`,
      steps: [`${v(x)} = ${num(clean(a + s))} ${MINUS} ${num(a)}`, `${v(x)} = ${num(s)}`],
    })
  }
  const t = pick(['add', 'sub', 'mul', 'div'])
  if (t === 'add') {
    const a = int(2, 20)
    return q({
      prompt: `Solve:<div class="big">${v(x)} + ${a} = ${num(sol + a)}</div>`,
      answer: numA(sol),
      prefix: `${v(x)} =`,
      hint: `Undo + ${a} by subtracting ${a} from both sides.`,
      steps: [`Subtract ${a} from both sides:`, `${v(x)} = ${num(sol + a)} ${MINUS} ${a} = ${num(sol)}`, `Check: ${bnum(sol)} + ${a} = ${num(sol + a)} ✓`],
    })
  }
  if (t === 'sub') {
    const a = int(2, 20)
    return q({
      prompt: `Solve:<div class="big">${v(x)} ${MINUS} ${a} = ${num(sol - a)}</div>`,
      answer: numA(sol),
      prefix: `${v(x)} =`,
      hint: `Undo − ${a} by adding ${a} to both sides.`,
      steps: [`Add ${a} to both sides:`, `${v(x)} = ${num(sol - a)} + ${a} = ${num(sol)}`, `Check: ${num(sol)} ${MINUS} ${a} = ${num(sol - a)} ✓`],
    })
  }
  if (t === 'mul') {
    const a = level === 1 ? int(2, 10) : nonZero(-9, 9)
    if (a === 1 || a === -1) return eq_one(level)
    return q({
      prompt: `Solve:<div class="big">${num(a)}${v(x)} = ${num(a * sol)}</div>`,
      answer: numA(sol),
      prefix: `${v(x)} =`,
      hint: `${num(a)}${v(x)} means ${num(a)} × ${v(x)}. Undo it by dividing both sides by ${num(a)}.`,
      steps: [`Divide both sides by ${num(a)}:`, `${v(x)} = ${num(a * sol)} ${DIVIDE} ${bnum(a)} = ${num(sol)}`],
    })
  }
  const a = int(2, 9)
  return q({
    prompt: `Solve:<div class="big">${frac(v(x), a)} = ${num(sol)}</div>`,
    answer: numA(sol * a),
    prefix: `${v(x)} =`,
    hint: `Undo ÷ ${a} by multiplying both sides by ${a}.`,
    steps: [`Multiply both sides by ${a}:`, `${v(x)} = ${num(sol)} ${TIMES} ${a} = ${num(sol * a)}`],
  })
}

const eq_two = (level: Level): Question => {
  const x = pick(['x', 'a', 'm', 'n', 'y', 'k'])
  if (level === 1) {
    const a = int(2, 9)
    const s = int(1, 12)
    const b = int(1, 20)
    const minus = chance(0.35) && a * s - b > 0
    const rhs = minus ? a * s - b : a * s + b
    return q({
      prompt: `Solve:<div class="big">${a}${v(x)} ${minus ? MINUS : '+'} ${b} = ${rhs}</div>`,
      answer: numA(s),
      prefix: `${v(x)} =`,
      hint: `First ${minus ? 'add' : 'subtract'} ${b} on both sides, then divide by ${a}.`,
      steps: [`${minus ? 'Add' : 'Subtract'} ${b} on both sides: ${a}${v(x)} = ${a * s}`, `Divide both sides by ${a}: ${v(x)} = ${s}`, `Check: ${a} ${TIMES} ${s} ${minus ? MINUS : '+'} ${b} = ${rhs} ✓`],
    })
  }
  if (level === 2) {
    if (chance()) {
      const a = int(2, 9)
      const s = nonZero(-10, 10)
      const b = nonZero(-15, 15)
      const rhs = a * s + b
      return q({
        prompt: `Solve:<div class="big">${a}${v(x)} ${b < 0 ? MINUS : '+'} ${Math.abs(b)} = ${num(rhs)}</div>`,
        answer: numA(s),
        prefix: `${v(x)} =`,
        hint: 'Undo the addition or subtraction first, then the multiplication.',
        steps: [`${b < 0 ? 'Add ' + -b + ' to' : 'Subtract ' + b + ' from'} both sides: ${a}${v(x)} = ${num(a * s)}`, `Divide both sides by ${a}: ${v(x)} = ${num(s)}`],
      })
    }
    const a = int(2, 6)
    const s0 = nonZero(-8, 8)
    const s = s0 * a
    const b = nonZero(-10, 10)
    const rhs = s0 + b
    return q({
      prompt: `Solve:<div class="big">${frac(v(x), a)} ${b < 0 ? MINUS : '+'} ${Math.abs(b)} = ${num(rhs)}</div>`,
      answer: numA(s),
      prefix: `${v(x)} =`,
      hint: `First ${b < 0 ? 'add ' + -b : 'subtract ' + b} on both sides, then multiply both sides by ${a}.`,
      steps: [`${b < 0 ? 'Add ' + -b : 'Subtract ' + b} on both sides: ${frac(v(x), a)} = ${num(s0)}`, `Multiply both sides by ${a}: ${v(x)} = ${num(s)}`],
    })
  }
  const t = pick(['bracketfrac', 'negcoef', 'fracsol'])
  if (t === 'bracketfrac') {
    const b = int(2, 6)
    const c = nonZero(-6, 8)
    const a = nonZero(-9, 9)
    const s = b * c - a
    return q({
      prompt: `Solve:<div class="big">${frac(`${v(x)} ${a < 0 ? MINUS : '+'} ${Math.abs(a)}`, b)} = ${num(c)}</div>`,
      answer: numA(s),
      prefix: `${v(x)} =`,
      hint: `Multiply both sides by ${b} first.`,
      steps: [`Multiply both sides by ${b}: ${v(x)} ${a < 0 ? MINUS : '+'} ${Math.abs(a)} = ${num(b * c)}`, `${a < 0 ? 'Add ' + -a + ' to' : 'Subtract ' + a + ' from'} both sides: ${v(x)} = ${num(s)}`],
    })
  }
  if (t === 'negcoef') {
    const a = int(10, 30)
    const b = int(2, 6)
    const s = nonZero(-6, 9)
    const rhs = a - b * s
    return q({
      prompt: `Solve:<div class="big">${a} ${MINUS} ${b}${v(x)} = ${num(rhs)}</div>`,
      answer: numA(s),
      prefix: `${v(x)} =`,
      hint: `Subtract ${a} from both sides, then divide by ${MINUS}${b}.`,
      steps: [`Subtract ${a} from both sides: ${MINUS}${b}${v(x)} = ${num(rhs - a)}`, `Divide both sides by ${MINUS}${b}: ${v(x)} = ${num(s)}`],
    })
  }
  const a = pick([3, 4, 5, 6])
  const b = int(1, 12)
  let r = int(b + 1, b + 20)
  while ((r - b) % a === 0) r++
  return q({
    prompt: `Solve, giving your answer as a fraction or mixed number:<div class="big">${a}${v(x)} + ${b} = ${r}</div>`,
    answer: fracA(r - b, a),
    prefix: `${v(x)} =`,
    hint: `Subtract ${b}, then divide by ${a}. The answer is not a whole number.`,
    steps: [`Subtract ${b} from both sides: ${a}${v(x)} = ${r - b}`, `Divide both sides by ${a}: ${v(x)} = ${frac(r - b, a)}${gcd(r - b, a) > 1 ? ' = ' + frac((r - b) / gcd(r - b, a), a / gcd(r - b, a)) : ''}`],
  })
}

const eq_words = (level: Level): Question => {
  if (level === 1) {
    const a = int(2, 6)
    const b = int(1, 15)
    const s = int(2, 15)
    const nm = name()
    const add = chance()
    const r = add ? a * s + b : a * s - b
    if (r <= 0) return eq_words(1)
    return q({
      prompt: `${nm} thinks of a number, multiplies it by ${a} and then ${add ? 'adds' : 'subtracts'} ${b}. The answer is ${r}. What was the number?`,
      answer: numA(s),
      hint: `Let the number be ${v('n')}. Write an equation: ${a}${v('n')} ${add ? '+' : MINUS} ${b} = ${r}.`,
      steps: [`Let the number be ${v('n')}: ${a}${v('n')} ${add ? '+' : MINUS} ${b} = ${r}`, `${add ? 'Subtract' : 'Add'} ${b}: ${a}${v('n')} = ${a * s}`, `Divide by ${a}: ${v('n')} = ${s}`],
    })
  }
  if (level === 2) {
    if (chance()) {
      const w = int(3, 20)
      const d = int(2, 9)
      const P = 2 * w + 2 * (w + d)
      return q({
        prompt: `A rectangle is ${d} cm longer than it is wide. Its perimeter is ${P} cm. How wide is it?`,
        answer: numA(w),
        suffix: 'cm',
        hint: `Let the width be ${v('w')}. The length is ${v('w')} + ${d}. Perimeter = 2 × width + 2 × length.`,
        steps: [`2${v('w')} + 2(${v('w')} + ${d}) = ${P}`, `4${v('w')} + ${2 * d} = ${P}`, `4${v('w')} = ${P - 2 * d}`, `${v('w')} = ${w} cm`],
      })
    }
    const kid = int(8, 14)
    const mult = int(3, 4)
    const sum = kid + mult * kid
    const [n1] = sample(['Jarrah', 'Mei', 'Hugo', 'Layla', 'Tama'], 1)
    return q({
      prompt: `${n1}’s mum is ${mult} times as old as ${n1}. The sum of their ages is ${sum}. How old is ${n1}?`,
      answer: numA(kid),
      suffix: 'years',
      hint: `Let ${n1}’s age be ${v('a')}. Mum’s age is ${mult}${v('a')}.`,
      steps: [`${v('a')} + ${mult}${v('a')} = ${sum}`, `${mult + 1}${v('a')} = ${sum}`, `${v('a')} = ${kid}`],
    })
  }
  if (chance()) {
    const n = int(5, 40)
    const k = pick([3, 4])
    const sum = k === 3 ? 3 * n + 3 : 4 * n + 6
    return q({
      prompt: `The sum of ${k === 3 ? 'three' : 'four'} consecutive whole numbers is ${sum}. What is the smallest of the numbers?`,
      answer: numA(n),
      hint: `Call the numbers ${v('n')}, ${v('n')} + 1, ${v('n')} + 2${k === 4 ? ', ' + v('n') + ' + 3' : ''}.`,
      steps: [k === 3 ? `${v('n')} + (${v('n')} + 1) + (${v('n')} + 2) = ${sum}` : `${v('n')} + (${v('n')} + 1) + (${v('n')} + 2) + (${v('n')} + 3) = ${sum}`, k === 3 ? `3${v('n')} + 3 = ${sum}` : `4${v('n')} + 6 = ${sum}`, `${k}${v('n')} = ${sum - (k === 3 ? 3 : 6)}`, `${v('n')} = ${n}`],
    })
  }
  const fee = pick([5, 8, 10, 12, 15])
  const per = pick([2, 3, 4, 2.5, 1.5])
  const h = int(2, 8)
  const total = fee + per * h
  return q({
    prompt: `A kayak hire shop on the Tweed River charges a $${fee} booking fee plus ${money(per)} for each hour. ${name()} paid ${money(total)}. For how many hours was the kayak hired?`,
    answer: numA(h),
    suffix: 'hours',
    hint: `Let the number of hours be ${v('h')}. Write an equation for the total cost.`,
    steps: [`${fee} + ${num(per)}${v('h')} = ${num(total)}`, `${num(per)}${v('h')} = ${num(total - fee)}`, `${v('h')} = ${num(total - fee)} ${DIVIDE} ${num(per)} = ${h}`],
  })
}

// ------------------------------------------------------------------ Geometrical figures

const geo_classify = (level: Level): Question => {
  if (level === 1) {
    const t = pick(['Equilateral', 'Isosceles', 'Scalene'])
    const [A, B, ticks] =
      t === 'Equilateral' ? [60, 60, [1, 1, 1]] : t === 'Isosceles' ? (() => { const b = pick([50, 55, 65, 70, 75]); return [b, b, [0, 1, 1]] })() : (() => { const a = pick([40, 50, 55]); return [a, a + pick([25, 30, 35]), [0, 0, 0]] })()
    return q({
      prompt: 'Classify this triangle by its sides. (Sides with the same marks are equal.)',
      diagram: D.triangle(A as number, B as number, { ticks: (t === 'Scalene' ? [1, 2, 3] : ticks) as [number, number, number] }),
      answer: mcFixedA(['Equilateral', 'Isosceles', 'Scalene'], t),
      hint: 'Equilateral: 3 equal sides. Isosceles: 2 equal sides. Scalene: no equal sides.',
      steps: [t === 'Equilateral' ? 'All three sides have the same mark, so they are all equal.' : t === 'Isosceles' ? 'Two sides have the same mark, so exactly two sides are equal.' : 'Each side has a different mark, so no sides are equal.', `It is ${t === 'Scalene' ? 'a' : 'an'} ${t.toLowerCase()} triangle.`],
    })
  }
  if (level === 2) {
    const t = pick(['Acute-angled', 'Right-angled', 'Obtuse-angled'])
    const big = t === 'Acute-angled' ? int(61, 85) : t === 'Right-angled' ? 90 : int(95, 140)
    const rest = 180 - big
    const a = int(Math.max(10, Math.ceil(rest / 2) - 30), Math.min(rest - 10, Math.floor(rest / 2) + 30))
    const angs = shuffle([big, a, rest - a])
    if (t === 'Acute-angled' && Math.max(...angs) >= 90) return geo_classify(2)
    return q({
      prompt: `A triangle has angles of ${deg(angs[0])}, ${deg(angs[1])} and ${deg(angs[2])}. Classify the triangle by its angles.`,
      answer: mcFixedA(['Acute-angled', 'Right-angled', 'Obtuse-angled'], t),
      hint: 'Look at the largest angle. Less than 90° → acute-angled. Exactly 90° → right-angled. More than 90° → obtuse-angled.',
      steps: [`The largest angle is ${deg(Math.max(...angs))}.`, `So the triangle is ${t.toLowerCase()}.`],
    })
  }
  const opts = ['Acute-angled isosceles', 'Right-angled isosceles', 'Obtuse-angled isosceles', 'Acute-angled scalene', 'Right-angled scalene', 'Obtuse-angled scalene']
  const iso = chance()
  let angs: number[]
  if (iso) {
    const base = pick([20, 30, 35, 45, 50, 65, 70, 75, 80])
    angs = shuffle([base, base, 180 - 2 * base])
  } else {
    const big = pick([90, int(60, 85), int(95, 130)])
    const a = int(15, 180 - big - 15)
    angs = shuffle([big, a, 180 - big - a])
    if (new Set(angs).size < 3) return geo_classify(3)
  }
  const mx = Math.max(...angs)
  const byAngle = mx < 90 ? 'Acute-angled' : mx === 90 ? 'Right-angled' : 'Obtuse-angled'
  const bySide = new Set(angs).size === 1 ? 'equilateral' : new Set(angs).size === 2 ? 'isosceles' : 'scalene'
  if (bySide === 'equilateral') return geo_classify(3)
  const correct = `${byAngle} ${bySide}`
  return q({
    prompt: `A triangle has angles of ${angs.map(deg).join(', ')}. Which description is correct?`,
    answer: mcA(correct, sample(opts.filter((o) => o !== correct), 3)),
    hint: 'Equal angles are opposite equal sides. Then look at the largest angle.',
    steps: [bySide === 'isosceles' ? 'Two angles are equal, so two sides are equal: isosceles.' : 'All three angles are different, so all sides are different: scalene.', `The largest angle is ${deg(mx)}, so it is ${byAngle.toLowerCase()}.`, `${correct}.`],
  })
}

const geo_triangle = (level: Level): Question => {
  if (level === 1) {
    const A = int(30, 90)
    const B = int(25, Math.min(110, 160 - A))
    const C = 180 - A - B
    const which = int(0, 2)
    const labels = [A + '°', B + '°', C + '°'] as [string, string, string]
    labels[which] = it('x') + '°'
    const known = [A, B, C].filter((_, i) => i !== which)
    return q({
      prompt: `Find the value of ${v('x')}.`,
      diagram: D.triangle(A, B, { angleLabels: labels }),
      answer: numA([A, B, C][which]),
      prefix: `${v('x')} =`,
      hint: 'The angles in a triangle add to 180°.',
      steps: ['Angle sum of a triangle is 180°.', `${v('x')} = 180 ${MINUS} ${known[0]} ${MINUS} ${known[1]} = ${[A, B, C][which]}`],
    })
  }
  if (level === 2) {
    const t = pick(['apexGiven', 'baseGiven', 'right'])
    if (t === 'right') {
      const a = int(20, 70)
      return q({
        prompt: `Find the value of ${v('x')}.`,
        diagram: D.triangle(90, a, { angleLabels: ['', a + '°', it('x') + '°'], rightAt: 0 }),
        answer: numA(90 - a),
        prefix: `${v('x')} =`,
        hint: 'The angles in a triangle add to 180°, and one angle is 90°.',
        steps: ['Angle sum of a triangle is 180°.', `${v('x')} = 180 ${MINUS} 90 ${MINUS} ${a} = ${90 - a}`],
      })
    }
    const base = pick([35, 40, 45, 50, 55, 65, 70, 72, 75, 38, 64, 52])
    const apex = 180 - 2 * base
    if (t === 'apexGiven') {
      return q({
        prompt: `The triangle is isosceles. Find the value of ${v('x')}.`,
        diagram: D.triangle(base, base, { angleLabels: [it('x') + '°', '', apex + '°'], ticks: [0, 1, 1] }),
        answer: numA(base),
        prefix: `${v('x')} =`,
        hint: 'In an isosceles triangle, the angles opposite the equal sides are equal.',
        steps: ['The two base angles are equal.', `2${v('x')} + ${apex} = 180`, `2${v('x')} = ${180 - apex}`, `${v('x')} = ${base}`],
      })
    }
    return q({
      prompt: `The triangle is isosceles. Find the value of ${v('y')}.`,
      diagram: D.triangle(base, base, { angleLabels: [base + '°', '', it('y') + '°'], ticks: [0, 1, 1] }),
      answer: numA(apex),
      prefix: `${v('y')} =`,
      hint: 'In an isosceles triangle, the angles opposite the equal sides are equal.',
      steps: [`The other base angle is also ${base}°.`, `${v('y')} = 180 ${MINUS} ${base} ${MINUS} ${base} = ${apex}`],
    })
  }
  const sets: [number, number, number][] = [
    [1, 2, 3],
    [1, 1, 2],
    [2, 3, 4],
    [1, 3, 5],
    [2, 2, 5],
    [3, 4, 5],
    [1, 2, 6],
  ]
  if (chance()) {
    const m = pick(sets)
    const s = m[0] + m[1] + m[2]
    if (180 % s !== 0) return geo_triangle(3)
    const x = 180 / s
    const labs = m.map((k) => (k === 1 ? it('x') : k + it('x')) + '°') as [string, string, string]
    return q({
      prompt: `Find the value of ${v('x')}.`,
      diagram: D.triangle(m[0] * x, m[1] * x, { angleLabels: labs }),
      answer: numA(x),
      prefix: `${v('x')} =`,
      hint: 'The angles add to 180°. Collect like terms, then solve.',
      steps: [ex(m.map((k) => (k === 1 ? 'x' : k + 'x')).join(' + ') + ' = 180'), ex(`${s}x = 180`), `${v('x')} = ${x}`],
    })
  }
  const d1 = pick([10, 15, 20, 25, 30])
  const d2 = pick([10, 20, 30, 40, 50].filter((z) => z !== d1))
  const x = (180 - d1 - d2) / 3
  if (!Number.isInteger(x) || x < 15) return geo_triangle(3)
  return q({
    prompt: `Find the value of ${v('x')}.`,
    diagram: D.triangle(x, x + d1, { angleLabels: [it('x') + '°', `(${it('x')} + ${d1})°`, `(${it('x')} + ${d2})°`] }),
    note: NOT_TO_SCALE,
    answer: numA(x),
    prefix: `${v('x')} =`,
    hint: 'The angles add to 180°.',
    steps: [ex(`x + (x + ${d1}) + (x + ${d2}) = 180`), ex(`3x + ${d1 + d2} = 180`), ex(`3x = ${180 - d1 - d2}`), `${v('x')} = ${x}`],
  })
}

const geo_exterior = (level: Level): Question => {
  const A = int(30, 80)
  const C = int(30, 85)
  if (A + C >= 160) return geo_exterior(level)
  const B = 180 - A - C
  const ext = A + C
  if (level === 1) {
    return q({
      prompt: `Find the value of ${v('x')}, the exterior angle.`,
      diagram: D.triangle(A, B, { angleLabels: [A + '°', '', C + '°'], extendBase: 'right', extLabel: it('x') + '°' }),
      answer: numA(ext),
      prefix: `${v('x')} =`,
      hint: 'The exterior angle of a triangle equals the sum of the two interior opposite angles.',
      steps: ['Exterior angle = sum of the interior opposite angles.', `${v('x')} = ${A} + ${C} = ${ext}`],
    })
  }
  if (level === 2) {
    if (chance()) {
      return q({
        prompt: `Find the value of ${v('x')}.`,
        diagram: D.triangle(A, B, { angleLabels: [it('x') + '°', '', C + '°'], extendBase: 'right', extLabel: ext + '°' }),
        answer: numA(A),
        prefix: `${v('x')} =`,
        hint: 'The exterior angle equals the sum of the two interior opposite angles.',
        steps: [`${v('x')} + ${C} = ${ext}`, `${v('x')} = ${ext} ${MINUS} ${C} = ${A}`],
      })
    }
    return q({
      prompt: `Find the value of ${v('y')}.`,
      diagram: D.triangle(A, B, { angleLabels: ['', it('y') + '°', ''], extendBase: 'right', extLabel: ext + '°' }),
      answer: numA(B),
      prefix: `${v('y')} =`,
      hint: 'The interior angle and the exterior angle sit on a straight line.',
      steps: ['Angles on a straight line add to 180°.', `${v('y')} = 180 ${MINUS} ${ext} = ${B}`],
    })
  }
  const m = pick([2, 3])
  const k = int(5, 30)
  const x = int(15, 45)
  const extV = m * x + k
  const a = extV - x
  if (a < 20 || extV > 165) return geo_exterior(3)
  return q({
    prompt: `Find the value of ${v('x')}.`,
    diagram: D.triangle(x, 180 - extV, { angleLabels: [it('x') + '°', '', a + '°'], extendBase: 'right', extLabel: `(${m}${it('x')} + ${k})°` }),
    note: NOT_TO_SCALE,
    answer: numA(x),
    prefix: `${v('x')} =`,
    hint: 'Exterior angle = sum of the interior opposite angles. Write an equation.',
    steps: [ex(`${m}x + ${k} = x + ${a}`), m - 1 === 1 ? `Subtract ${v('x')} and ${k} from both sides: ${v('x')} = ${x}` : ex(`${m - 1}x = ${a - k}`), ...(m - 1 === 1 ? [] : [`${v('x')} = ${x}`])],
  })
}

const QUAD_FACTS: [string, string][] = [
  ['has all four sides equal and all four angles equal to 90°', 'Square'],
  ['has all four sides equal, but its angles are not right angles', 'Rhombus'],
  ['has four right angles, but its sides are not all equal', 'Rectangle'],
  ['has two pairs of parallel sides, but no right angles and not all sides equal', 'Parallelogram'],
  ['has two pairs of equal adjacent sides (and is not a rhombus)', 'Kite'],
  ['has diagonals that bisect each other at right angles but are not equal in length', 'Rhombus'],
  ['has equal diagonals that bisect each other but do not meet at right angles', 'Rectangle'],
]

const geo_quad = (level: Level): Question => {
  if (level === 1) {
    let a = int(60, 130)
    let b = int(60, 130)
    let c = int(60, 130)
    let d = 360 - a - b - c
    while (d < 50 || d > 160) {
      a = int(60, 130)
      b = int(60, 130)
      c = int(60, 130)
      d = 360 - a - b - c
    }
    const labs: [string, string, string, string] = [a + '°', b + '°', c + '°', it('x') + '°']
    return q({
      prompt: `Find the value of ${v('x')}.`,
      diagram: D.quadrilateral([a, b, c, d], labs),
      answer: numA(d),
      prefix: `${v('x')} =`,
      hint: 'The angles in a quadrilateral add to 360°.',
      steps: ['Angle sum of a quadrilateral is 360°.', `${v('x')} = 360 ${MINUS} ${a} ${MINUS} ${b} ${MINUS} ${c} = ${d}`],
    })
  }
  if (level === 2) {
    if (chance()) {
      const [fact, shape] = pick(QUAD_FACTS)
      return q({
        prompt: `Which quadrilateral ${fact}?`,
        answer: mcFixedA(['Square', 'Rectangle', 'Rhombus', 'Parallelogram', 'Kite', 'Trapezium'], shape),
        hint: 'Think about the sides, angles and diagonals of each special quadrilateral.',
        steps: [`A ${shape.toLowerCase()} ${fact}.`],
      })
    }
    const a = int(55, 80)
    const opp = chance()
    return q({
      prompt: `${ex('ABCD')} is a parallelogram. Find the value of ${v('x')}.`,
      diagram: D.quadrilateral([a, 180 - a, a, 180 - a], opp ? [a + '°', '', it('x') + '°', ''] : [a + '°', it('x') + '°', '', '']),
      answer: numA(opp ? a : 180 - a),
      prefix: `${v('x')} =`,
      hint: 'In a parallelogram, opposite angles are equal and co-interior angles add to 180°.',
      steps: opp ? ['Opposite angles of a parallelogram are equal.', `${v('x')} = ${a}`] : ['Co-interior angles between parallel sides add to 180°.', `${v('x')} = 180 ${MINUS} ${a} = ${180 - a}`],
    })
  }
  const m = pick([
    [1, 2, 3, 4],
    [2, 3, 3, 4],
    [1, 1, 2, 2],
    [3, 4, 5, 6],
    [2, 2, 3, 3],
    [1, 2, 2, 3],
  ])
  const s = m.reduce((p, c) => p + c, 0)
  const x = 360 / s
  if (!Number.isInteger(x)) return geo_quad(3)
  const angs = shuffle(m.map((k) => k * x))
  const order = angs.map((g) => g / x)
  return q({
    prompt: `Find the value of ${v('x')}.`,
    diagram: D.quadrilateral(angs as [number, number, number, number], order.map((k) => (k === 1 ? it('x') : k + it('x')) + '°') as [string, string, string, string]),
    answer: numA(x),
    prefix: `${v('x')} =`,
    hint: 'The angles add to 360°. Collect the like terms.',
    steps: [ex(order.map((k) => (k === 1 ? 'x' : k + 'x')).join(' + ') + ' = 360'), ex(`${s}x = 360`), `${v('x')} = ${x}`],
  })
}

// ------------------------------------------------------------------ Decimals

const PLACES = ['tenths', 'hundredths', 'thousandths']

const dec_place = (level: Level): Question => {
  if (level === 1) {
    const whole = int(1, 99)
    const digits = sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 3)
    const pos = int(0, 2)
    const n = whole + digits[0] / 10 + digits[1] / 100 + digits[2] / 1000
    return q({
      prompt: `What is the place value of the digit <b>${digits[pos]}</b> in ${num(clean(n), 3)}?`,
      answer: mcFixedA(['ones', 'tenths', 'hundredths', 'thousandths'], PLACES[pos]),
      hint: 'After the decimal point the places are tenths, hundredths, thousandths…',
      steps: [`${num(clean(n), 3)}: ${digits[0]} is in the tenths place, ${digits[1]} is in the hundredths place and ${digits[2]} is in the thousandths place.`, `So ${digits[pos]} is in the ${PLACES[pos]} place.`],
    })
  }
  if (level === 2) {
    const dp = pick([1, 2])
    const n = clean(int(1000, 99999) / 1000)
    const r = round(n, dp)
    const next = Math.floor(n * Math.pow(10, dp + 1)) % 10
    return q({
      prompt: `Round ${num(n)} to ${dp} decimal place${dp > 1 ? 's' : ''}.`,
      answer: numA(r),
      hint: `Look at the digit in the ${PLACES[dp]} place. If it is 5 or more, round up.`,
      steps: [`The digit after the ${PLACES[dp - 1]} place is ${next}.`, next >= 5 ? `${next} is 5 or more, so round up.` : `${next} is less than 5, so round down (keep the digit the same).`, `${num(n)} ≈ ${num(r, dp)}`],
    })
  }
  const base = int(0, 6)
  const pool = sample([0.5, 0.45, 0.405, 0.54, 0.054, 0.45 + 0.005, 0.504, 0.4], 4).map((z) => clean(base + z))
  if (new Set(pool).size < 4) return dec_place(3)
  const asc = pool.slice().sort((a, b) => a - b)
  const fmt = (arr: number[]) => arr.map((z) => num(z)).join(', ')
  const byLen = pool.slice().sort((a, b) => String(a).length - String(b).length || a - b)
  const desc = asc.slice().reverse()
  let other = shuffle(pool)
  while ([fmt(asc), fmt(desc), fmt(byLen)].includes(fmt(other))) other = shuffle(pool)
  const wrong = Array.from(new Set([fmt(desc), fmt(byLen), fmt(other)])).filter((w) => w !== fmt(asc))
  while (wrong.length < 3) {
    const o = fmt(shuffle(pool))
    if (o !== fmt(asc) && !wrong.includes(o)) wrong.push(o)
  }
  return q({
    prompt: `Which list is in ascending order?<div class="big">${fmt(pool)}</div>`,
    answer: mcA(fmt(asc), wrong),
    hint: 'Line up the decimal points and add zeros so every number has the same number of decimal places.',
    steps: [`With three decimal places: ${pool.map((z) => num(z, 3)).join(', ')}`, `Ascending: ${fmt(asc)}`],
  })
}

const dec_addsub = (level: Level): Question => {
  if (level === 1) {
    const a = int(11, 199) / 10
    const b = int(11, 99) / 10
    const add = chance() || a <= b
    const r = clean(add ? a + b : a - b)
    return q({
      prompt: `Calculate:<div class="big">${num(a)} ${add ? '+' : MINUS} ${num(b)}</div>`,
      answer: numA(r),
      hint: 'Line up the decimal points.',
      steps: [`Line up the decimal points and ${add ? 'add' : 'subtract'}:`, `${num(a)} ${add ? '+' : MINUS} ${num(b)} = ${num(r)}`],
    })
  }
  if (level === 2) {
    const a = int(101, 2999) / 100
    const b = pick([int(1, 99) / 10, int(101, 999) / 100, int(1, 9)])
    const add = chance() || a <= b
    const r = clean(add ? a + b : a - b)
    return q({
      prompt: `Calculate:<div class="big">${num(a)} ${add ? '+' : MINUS} ${num(b)}</div>`,
      answer: numA(r),
      hint: 'Line up the decimal points. Fill gaps with zeros so both numbers have the same number of decimal places.',
      steps: [`Write with the same number of decimal places: ${num(a, 2)} ${add ? '+' : MINUS} ${num(b, 2)}`, `= ${num(r, 2)}`],
    })
  }
  const items = sample(
    [
      ['a meat pie', 4.5],
      ['a sausage roll', 3.8],
      ['a bottle of water', 2.5],
      ['a fruit cup', 3.2],
      ['a banana bread slice', 2.95],
      ['a juice', 2.85],
      ['an apple', 0.9],
      ['a sushi roll', 3.6],
    ] as [string, number][],
    3,
  )
  const total = clean(items.reduce((s, i) => s + i[1], 0))
  const paid = total > 10 ? 20 : 10
  return q({
    prompt: `At the school canteen, ${name()} buys ${items[0][0]} (${money(items[0][1])}), ${items[1][0]} (${money(items[1][1])}) and ${items[2][0]} (${money(items[2][1])}), and pays with a $${paid} note. How much change should they get?`,
    answer: numA(clean(paid - total)),
    prefix: '$',
    hint: 'Add the prices, then subtract the total from the amount paid.',
    steps: [`Total: ${items.map((i) => money(i[1])).join(' + ')} = ${money(total)}`, `Change: $${paid}.00 ${MINUS} ${money(total)} = ${money(paid - total)}`],
  })
}

const dec_muldiv = (level: Level): Question => {
  if (level === 1) {
    let n = int(1, 9999) / pick([10, 100, 1000])
    while (Number.isInteger(n)) n = int(1, 9999) / pick([10, 100, 1000])
    const p = pick([10, 100, 1000])
    const mul = chance()
    const r = clean(mul ? n * p : n / p)
    return q({
      prompt: `Calculate:<div class="big">${num(n)} ${mul ? TIMES : DIVIDE} ${num(p)}</div>`,
      answer: numA(r),
      hint: `${mul ? 'Multiplying' : 'Dividing'} by ${num(p)} moves every digit ${String(p).length - 1} place${p > 10 ? 's' : ''} to the ${mul ? 'left (the number gets bigger)' : 'right (the number gets smaller)'}.`,
      steps: [`Move the decimal point ${String(p).length - 1} place${p > 10 ? 's' : ''} to the ${mul ? 'right' : 'left'}.`, `${num(n)} ${mul ? TIMES : DIVIDE} ${num(p)} = ${num(r)}`],
    })
  }
  if (level === 2) {
    const t = pick(['dw', 'dd', 'div'])
    if (t === 'dw') {
      const a = int(11, 99) / 10
      const b = int(2, 9)
      return q({
        prompt: `Calculate:<div class="big">${num(a)} ${TIMES} ${b}</div>`,
        answer: numA(clean(a * b)),
        hint: 'Multiply as whole numbers, then put back the decimal places.',
        steps: [`${Math.round(a * 10)} ${TIMES} ${b} = ${Math.round(a * 10) * b}`, `There is 1 decimal place in the question, so the answer has 1 decimal place: ${num(clean(a * b))}`],
      })
    }
    if (t === 'dd') {
      const a = int(1, 9)
      const b = int(1, 9)
      const da = pick([1, 2])
      const A = a / Math.pow(10, da)
      const B = b / 10
      const r = clean(A * B)
      return q({
        prompt: `Calculate:<div class="big">${num(A)} ${TIMES} ${num(B)}</div>`,
        answer: numA(r),
        hint: 'Multiply the digits, then count the total number of decimal places in the question.',
        steps: [`${a} ${TIMES} ${b} = ${a * b}`, `There are ${da + 1} decimal places altogether, so the answer is ${num(r, da + 1)}.`],
      })
    }
    const b = int(2, 9)
    const r = int(11, 99) / 10
    const a = clean(r * b)
    return q({
      prompt: `Calculate:<div class="big">${num(a)} ${DIVIDE} ${b}</div>`,
      answer: numA(r),
      hint: 'Use short division and keep the decimal point in line.',
      steps: [`${num(a)} ${DIVIDE} ${b} = ${num(r)}`, `Check: ${num(r)} ${TIMES} ${b} = ${num(a)} ✓`],
    })
  }
  if (chance()) {
    const d = pick([0.2, 0.4, 0.5, 0.06, 0.03, 0.8, 0.25])
    const r = pick([12, 15, 30, 40, 80, 120, 6, 9])
    const a = clean(d * r)
    const shift = String(d).split('.')[1].length
    return q({
      prompt: `Calculate:<div class="big">${num(a)} ${DIVIDE} ${num(d)}</div>`,
      answer: numA(r),
      hint: 'Make the divisor a whole number: multiply both numbers by 10 or 100.',
      steps: [`Multiply both numbers by ${Math.pow(10, shift)}: ${num(clean(a * Math.pow(10, shift)))} ${DIVIDE} ${num(clean(d * Math.pow(10, shift)))}`, `= ${r}`],
    })
  }
  const price = pick([1.85, 1.92, 2.05, 1.79, 1.99])
  const litres = int(25, 60)
  const cost = round(price * litres, 2)
  return q({
    prompt: `Petrol costs ${money(price)} per litre. How much does it cost to buy ${litres} L? Give your answer to the nearest cent.`,
    answer: numA(cost, 2),
    prefix: '$',
    calc: true,
    hint: 'Multiply the price per litre by the number of litres.',
    steps: [`${num(price)} ${TIMES} ${litres} = ${num(clean(price * litres))}`, `≈ ${money(cost)}`],
  })
}

// ------------------------------------------------------------------ Topics

export const Y7B: Topic[] = [
  {
    id: 'y7-algebra',
    year: 7,
    title: 'Algebraic techniques',
    strand: 'Number and algebra',
    outcomes: ['MA4-ALG-C-01'],
    blurb: 'Write expressions, substitute, collect like terms, multiply and divide terms.',
    colour: 330,
    skills: [
      {
        id: 'y7-alg-words',
        title: 'Writing expressions',
        outcomes: ['MA4-ALG-C-01'],
        summary: 'Translate words into algebraic expressions.',
        learn: {
          intro: '<p>A <b>pronumeral</b> (or variable) is a letter that stands for a number. An <b>expression</b> combines numbers and pronumerals with operations, e.g. 3<i>n</i> + 2.</p>',
          keyPoints: ['3<i>n</i> means 3 × <i>n</i>. We leave out the × sign and write the number first.', '<i>n</i> ÷ 4 is written as a fraction: <i>n</i>/4.', '“5 less than <i>n</i>” is <i>n</i> − 5 (not 5 − <i>n</i>).', 'Use brackets to show something is done first: “the sum of <i>n</i> and 4, multiplied by 5” is 5(<i>n</i> + 4).'],
          vocab: [['sum', 'add'], ['difference', 'subtract'], ['product', 'multiply'], ['quotient', 'divide']],
        },
        gen: alg_words,
        levels: { 1: 'One operation', 2: 'Two operations', 3: 'Real-life situations' },
      },
      {
        id: 'y7-alg-sub',
        title: 'Substitution',
        outcomes: ['MA4-ALG-C-01'],
        summary: 'Substitute values into expressions and formulas.',
        learn: {
          intro: '<p>To <b>substitute</b>, replace each pronumeral with its value, then calculate using the order of operations.</p>',
          keyPoints: ['Put back the hidden × signs: 4<i>a</i> becomes 4 × <i>a</i>.', 'Put negative numbers in brackets: if <i>x</i> = −3, then <i>x</i><sup>2</sup> = (−3)<sup>2</sup> = 9.', 'A fraction bar works like a bracket: work out the top and bottom first.'],
        },
        gen: alg_sub,
        levels: { 1: 'One pronumeral, whole numbers', 2: 'Two pronumerals, negatives, squares', 3: 'Formulas' },
      },
      {
        id: 'y7-alg-like',
        title: 'Adding and subtracting like terms',
        outcomes: ['MA4-ALG-C-01'],
        summary: 'Simplify expressions by collecting like terms.',
        learn: {
          intro: '<p><b>Like terms</b> have exactly the same pronumerals with the same powers: 3<i>x</i> and −7<i>x</i> are like terms; 3<i>x</i> and 3<i>x</i><sup>2</sup> are not.</p>',
          keyPoints: ['Add or subtract the coefficients of like terms: 5<i>a</i> + 2<i>a</i> = 7<i>a</i>.', 'The sign in front of a term belongs to that term.', 'Unlike terms cannot be combined: 4<i>x</i> + 3<i>y</i> stays as it is.', 'Type powers with ^: x^2.'],
        },
        gen: alg_like,
        levels: { 1: 'One pronumeral', 2: 'Two pronumerals with negatives', 3: 'Squares, products and constants' },
      },
      {
        id: 'y7-alg-muldiv',
        title: 'Multiplying and dividing terms',
        outcomes: ['MA4-ALG-C-01'],
        summary: 'Multiply and divide algebraic terms.',
        learn: {
          intro: '<p>When multiplying terms, multiply the numbers and then the pronumerals. When dividing, divide the numbers and cancel common pronumerals.</p>',
          keyPoints: ['3<i>a</i> × 4<i>b</i> = 12<i>ab</i> (write pronumerals in alphabetical order)', '<i>m</i> × <i>m</i> = <i>m</i><sup>2</sup>', '20<i>xy</i> ÷ 5<i>x</i> = 4<i>y</i>', 'Use the sign rules for negatives.'],
        },
        gen: alg_muldiv,
        levels: { 1: 'Number × term', 2: 'Term × term, division', 3: 'Negatives and three terms' },
      },
    ],
  },
  {
    id: 'y7-equations',
    year: 7,
    title: 'Equations',
    strand: 'Number and algebra',
    outcomes: ['MA4-EQU-C-01'],
    blurb: 'Solve one-step and two-step equations, and use equations to solve problems.',
    colour: 285,
    skills: [
      {
        id: 'y7-eq-one',
        title: 'One-step equations',
        outcomes: ['MA4-EQU-C-01'],
        summary: 'Solve equations using one inverse operation.',
        learn: {
          intro: '<p>An <b>equation</b> says two expressions are equal. To solve it, do the <b>inverse operation</b> to both sides so the pronumeral is on its own.</p>',
          keyPoints: ['+ and − undo each other; × and ÷ undo each other.', '<i>x</i> + 7 = 12 → subtract 7 from both sides → <i>x</i> = 5', '3<i>x</i> = 21 → divide both sides by 3 → <i>x</i> = 7', 'Check by substituting your answer into the equation.'],
        },
        gen: eq_one,
        levels: { 1: 'Whole-number answers', 2: 'Negative answers and coefficients', 3: 'Decimal and fraction answers' },
      },
      {
        id: 'y7-eq-two',
        title: 'Two-step equations',
        outcomes: ['MA4-EQU-C-01'],
        summary: 'Solve equations that need two inverse operations.',
        learn: {
          intro: '<p>Undo the operations in reverse order: deal with + or − first, then × or ÷.</p>',
          keyPoints: ['3<i>x</i> + 5 = 26 → subtract 5: 3<i>x</i> = 21 → divide by 3: <i>x</i> = 7', '<i>x</i>/4 − 2 = 3 → add 2: <i>x</i>/4 = 5 → multiply by 4: <i>x</i> = 20', '(<i>x</i> + 3)/2 = 6 → multiply by 2 first: <i>x</i> + 3 = 12 → <i>x</i> = 9'],
        },
        gen: eq_two,
        levels: { 1: 'Whole-number answers', 2: 'Negatives and fractions', 3: 'Brackets over a fraction; fraction answers' },
      },
      {
        id: 'y7-eq-words',
        title: 'Solving problems with equations',
        outcomes: ['MA4-EQU-C-01'],
        summary: 'Write an equation from a worded problem and solve it.',
        learn: {
          intro: '<p>Choose a pronumeral for the unknown, write an equation from the information, solve it, and answer the question in words.</p>',
          keyPoints: ['Say what your pronumeral stands for, e.g. “Let <i>n</i> be the number”.', 'Check your answer makes sense in the problem.'],
        },
        gen: eq_words,
        levels: { 1: '“Think of a number”', 2: 'Perimeter and ages', 3: 'Consecutive numbers and costs' },
      },
    ],
  },
  {
    id: 'y7-geometry',
    year: 7,
    title: 'Geometrical figures',
    strand: 'Measurement and space',
    outcomes: ['MA4-GEO-C-01'],
    blurb: 'Classify triangles and quadrilaterals and find unknown angles in them.',
    colour: 38,
    skills: [
      {
        id: 'y7-geo-classify',
        title: 'Classifying triangles',
        outcomes: ['MA4-GEO-C-01'],
        summary: 'Classify triangles by their sides and by their angles.',
        learn: {
          intro: '<p>Triangles can be named by their sides or by their angles.</p>',
          keyPoints: ['Sides: <b>equilateral</b> (3 equal sides), <b>isosceles</b> (2 equal sides), <b>scalene</b> (no equal sides).', 'Angles: <b>acute-angled</b> (all angles less than 90°), <b>right-angled</b> (one 90° angle), <b>obtuse-angled</b> (one angle more than 90°).', 'Equal sides are shown with matching marks; equal sides are opposite equal angles.'],
        },
        gen: geo_classify,
        levels: { 1: 'By sides', 2: 'By angles', 3: 'Both together' },
      },
      {
        id: 'y7-geo-triangle',
        title: 'Angle sum of a triangle',
        outcomes: ['MA4-GEO-C-01'],
        summary: 'Use the angle sum of a triangle, including isosceles and right-angled triangles.',
        learn: {
          intro: '<p>The three angles of any triangle add to 180°.</p>',
          keyPoints: ['Isosceles triangles have two equal base angles (opposite the equal sides).', 'Equilateral triangles have three 60° angles.', 'In a right-angled triangle the other two angles add to 90°.'],
        },
        gen: geo_triangle,
        levels: { 1: 'Find the third angle', 2: 'Isosceles and right-angled triangles', 3: 'Equations' },
      },
      {
        id: 'y7-geo-exterior',
        title: 'Exterior angles of triangles',
        outcomes: ['MA4-GEO-C-01'],
        summary: 'Use the exterior angle of a triangle.',
        learn: {
          intro: '<p>An <b>exterior angle</b> is made by extending one side of a triangle.</p>',
          keyPoints: ['The exterior angle equals the sum of the two interior opposite angles.', 'The exterior angle and the interior angle next to it add to 180°.'],
        },
        gen: geo_exterior,
        levels: { 1: 'Find the exterior angle', 2: 'Find an interior angle', 3: 'Equations' },
      },
      {
        id: 'y7-geo-quad',
        title: 'Quadrilaterals',
        outcomes: ['MA4-GEO-C-01'],
        summary: 'Use the angle sum of a quadrilateral and the properties of special quadrilaterals.',
        learn: {
          intro: '<p>The four angles of any quadrilateral add to 360°.</p>',
          keyPoints: ['Parallelogram: opposite sides parallel and equal; opposite angles equal.', 'Rectangle: four right angles; equal diagonals.', 'Rhombus: four equal sides; diagonals meet at right angles.', 'Square: all the properties of a rectangle and a rhombus.', 'Kite: two pairs of equal adjacent sides.'],
        },
        gen: geo_quad,
        levels: { 1: 'Angle sum', 2: 'Properties; parallelograms', 3: 'Equations' },
      },
    ],
  },
  {
    id: 'y7-decimals',
    year: 7,
    title: 'Decimals',
    strand: 'Number and algebra',
    outcomes: ['MA4-FRC-C-01'],
    blurb: 'Place value, rounding and the four operations with decimals.',
    colour: 190,
    skills: [
      {
        id: 'y7-dec-place',
        title: 'Place value and rounding',
        outcomes: ['MA4-FRC-C-01'],
        summary: 'Understand decimal place value, round decimals and order them.',
        learn: {
          intro: '<p>In 3.472, the 4 is 4 tenths, the 7 is 7 hundredths and the 2 is 2 thousandths.</p>',
          keyPoints: ['To round, look at the next digit: 5 or more → round up; less than 5 → keep the digit.', 'To compare decimals, line up the decimal points and add zeros: 0.45 = 0.450, which is less than 0.5 = 0.500.'],
        },
        gen: dec_place,
        levels: { 1: 'Place value', 2: 'Rounding', 3: 'Ordering' },
      },
      {
        id: 'y7-dec-addsub',
        title: 'Adding and subtracting decimals',
        outcomes: ['MA4-FRC-C-01'],
        summary: 'Add and subtract decimals, including money.',
        learn: {
          intro: '<p>Line up the decimal points so that digits with the same place value are in the same column.</p>',
          keyPoints: ['Fill empty places with zeros: 4 − 1.36 = 4.00 − 1.36 = 2.64.', 'Money always has two decimal places for cents.'],
        },
        gen: dec_addsub,
        levels: { 1: 'One decimal place', 2: 'Different decimal places', 3: 'Money problems' },
      },
      {
        id: 'y7-dec-muldiv',
        title: 'Multiplying and dividing decimals',
        outcomes: ['MA4-FRC-C-01'],
        summary: 'Multiply and divide decimals, including by powers of 10.',
        learn: {
          intro: '<p>Multiplying by 10, 100 or 1000 makes a number bigger; dividing makes it smaller.</p>',
          keyPoints: ['× 100: move the decimal point 2 places right. ÷ 100: move it 2 places left.', 'Decimal × decimal: multiply the digits, then count the decimal places in the question. 0.3 × 0.4 = 0.12.', 'Dividing by a decimal: multiply both numbers by 10 or 100 first. 4.8 ÷ 0.06 = 480 ÷ 6 = 80.'],
        },
        gen: dec_muldiv,
        levels: { 1: 'Powers of 10', 2: 'Decimals and whole numbers', 3: 'Dividing by decimals; money' },
      },
    ],
  },
]
