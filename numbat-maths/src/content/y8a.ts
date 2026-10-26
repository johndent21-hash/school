// Year 8 (Stage 4) — Indices, Algebraic techniques, Equations, Pythagoras' theorem
import type { Level, Question, Topic } from '@/lib/maths/types'
import {
  D, L, MINUS, TIMES, DIVIDE, bnum, chance, clean, ex, frac, fracA, gcd, int, intExcept, mcA, mcFixedA, nonZero, num,
  numA, pick, q, sample, shuffle, exprA, v, terms, coef, NOT_TO_SCALE, round, name, sqrt, money, signed,
} from './helpers'

const letter = () => pick(['a', 'b', 'm', 'n', 'p', 'x', 'y', 'k'])

// ------------------------------------------------------------------ Indices

const powTxt = (base: string, e: number) => (e === 1 ? base : `${base}^${e}`)

const ind_muldiv = (level: Level): Question => {
  if (level === 1) {
    const numeric = chance(0.4)
    const b = numeric ? String(pick([2, 3, 5, 7, 10])) : letter()
    const m = int(2, 9)
    const n = int(2, 8)
    const mul = chance()
    if (!mul && m <= n) return ind_muldiv(1)
    const r = mul ? m + n : m - n
    return q({
      prompt: `Simplify, leaving your answer in index form:<div class="big">${ex(`${b}^${m}`)} ${mul ? TIMES : DIVIDE} ${ex(`${b}^${n}`)}</div>`,
      answer: exprA(powTxt(b, r), 'singlePower'),
      hint: mul ? 'When multiplying powers with the same base, add the indices.' : 'When dividing powers with the same base, subtract the indices.',
      steps: [mul ? `Add the indices: ${m} + ${n} = ${r}` : `Subtract the indices: ${m} ${MINUS} ${n} = ${r}`, `= ${ex(powTxt(b, r))}`],
    })
  }
  if (level === 2) {
    const b = letter()
    const A = int(2, 9)
    const B = int(2, 9)
    const m = int(2, 9)
    const n = int(1, 7)
    if (chance()) {
      return q({
        prompt: `Simplify:<div class="big">${ex(`${A}${powTxt(b, m)}`)} ${TIMES} ${ex(`${B}${powTxt(b, n)}`)}</div>`,
        answer: exprA(`${A * B}${b}^${m + n}`, 'singlePower'),
        hint: 'Multiply the numbers, then add the indices.',
        steps: [`${A} ${TIMES} ${B} = ${A * B}`, `${ex(`${b}^${m}`)} ${TIMES} ${ex(powTxt(b, n))} = ${ex(`${b}^${m + n}`)}`, `= ${ex(`${A * B}${b}^${m + n}`)}`],
      })
    }
    const M = m + n
    return q({
      prompt: `Simplify:<div class="big">${frac(ex(`${A * B}${b}^${M}`), ex(`${A}${powTxt(b, n)}`))}</div>`,
      answer: exprA(`${B}${powTxt(b, m)}`, 'singlePower'),
      hint: 'Divide the numbers, then subtract the indices.',
      steps: [`${A * B} ${DIVIDE} ${A} = ${B}`, `${ex(`${b}^${M}`)} ${DIVIDE} ${ex(powTxt(b, n))} = ${ex(powTxt(b, m))}`, `= ${ex(`${B}${powTxt(b, m)}`)}`],
    })
  }
  const t = pick(['three', 'two-var', 'fraction'])
  if (t === 'three') {
    const b = letter()
    const [m, n, p] = [int(3, 8), int(2, 7), int(2, 6)]
    if (m + n - p < 1) return ind_muldiv(3)
    return q({
      prompt: `Simplify:<div class="big">${frac(ex(`${b}^${m} * ${b}^${n}`), ex(`${b}^${p}`))}</div>`,
      answer: exprA(powTxt(b, m + n - p), 'singlePower'),
      hint: 'Simplify the top first (add indices), then divide (subtract indices).',
      steps: [`Top: ${ex(`${b}^${m} * ${b}^${n}`)} = ${ex(`${b}^${m + n}`)}`, `${ex(`${b}^${m + n}`)} ${DIVIDE} ${ex(`${b}^${p}`)} = ${ex(powTxt(b, m + n - p))}`],
    })
  }
  const [p, r] = sample(['a', 'b', 'x', 'y', 'm', 'n'], 2).sort()
  if (t === 'two-var') {
    const A = int(2, 6)
    const B = int(2, 6)
    const [a1, b1, a2, b2] = [int(1, 5), int(1, 4), int(1, 4), int(1, 5)]
    const res = `${A * B}${powTxt(p, a1 + a2)}${powTxt(r, b1 + b2)}`
    return q({
      prompt: `Simplify:<div class="big">${ex(`${A}${powTxt(p, a1)}${powTxt(r, b1)}`)} ${TIMES} ${ex(`${B}${powTxt(p, a2)}${powTxt(r, b2)}`)}</div>`,
      answer: exprA(res, 'singlePower'),
      hint: 'Multiply the numbers. Then add the indices for each pronumeral separately.',
      steps: [`Numbers: ${A} ${TIMES} ${B} = ${A * B}`, `${v(p)}: ${a1} + ${a2} = ${a1 + a2}; ${v(r)}: ${b1} + ${b2} = ${b1 + b2}`, `= ${ex(res)}`],
    })
  }
  const B = int(2, 6)
  const k = int(2, 5)
  const [a1, b1] = [int(4, 8), int(2, 5)]
  const [a2, b2] = [int(1, a1 - 1), int(1, b1 - 1)]
  const res = `${k}${powTxt(p, a1 - a2)}${powTxt(r, b1 - b2)}`
  return q({
    prompt: `Simplify:<div class="big">${frac(ex(`${B * k}${p}^${a1}${r}^${b1}`), ex(`${B}${powTxt(p, a2)}${powTxt(r, b2)}`))}</div>`,
    answer: exprA(res, 'singlePower'),
    hint: 'Divide the numbers, then subtract the indices for each pronumeral.',
    steps: [`Numbers: ${B * k} ${DIVIDE} ${B} = ${k}`, `${v(p)}: ${a1} ${MINUS} ${a2} = ${a1 - a2}; ${v(r)}: ${b1} ${MINUS} ${b2} = ${b1 - b2}`, `= ${ex(res)}`],
  })
}

const ind_power_zero = (level: Level): Question => {
  const b = letter()
  if (level === 1) {
    if (chance(0.4)) {
      const base = pick(['7', '15', '2', '0.5', '100', b, `${int(2, 9)}${b}`])
      const isCoefTerm = /^\d+[a-z]$/.test(base)
      return q({
        prompt: `Evaluate:<div class="big">${isCoefTerm ? `(${ex(base)})` : ex(base)}<sup>0</sup></div>`,
        answer: numA(1),
        hint: 'Any number (except 0) to the power of zero equals 1.',
        steps: [`a<sup>0</sup> = 1 for any non-zero a.`, `= 1`],
      })
    }
    const m = int(2, 6)
    const n = int(2, 5)
    return q({
      prompt: `Simplify:<div class="big">(${ex(`${b}^${m}`)})<sup>${n}</sup></div>`,
      answer: exprA(`${b}^${m * n}`, 'singlePower'),
      hint: 'For a power of a power, multiply the indices.',
      steps: [`Multiply the indices: ${m} ${TIMES} ${n} = ${m * n}`, `= ${ex(`${b}^${m * n}`)}`],
    })
  }
  if (level === 2) {
    const t = pick(['coef0', 'mix', 'zeroExpr'])
    if (t === 'coef0') {
      const A = int(2, 9)
      return q({
        prompt: `Simplify:<div class="big">${A}${ex(b)}<sup>0</sup></div>`,
        answer: numA(A),
        hint: `The index 0 applies only to ${v(b)}, not to ${A}.`,
        steps: [`${ex(b)}<sup>0</sup> = 1`, `${A} ${TIMES} 1 = ${A}`],
      })
    }
    if (t === 'zeroExpr') {
      const A = int(2, 9)
      const B = int(2, 9)
      return q({
        prompt: `Evaluate:<div class="big">${A}<sup>0</sup> + ${B}${ex(b)}<sup>0</sup></div>`,
        answer: numA(1 + B),
        hint: 'Anything (except 0) to the power of zero is 1. Watch which part the index applies to.',
        steps: [`${A}<sup>0</sup> = 1`, `${B}${ex(b)}<sup>0</sup> = ${B} ${TIMES} 1 = ${B}`, `1 + ${B} = ${1 + B}`],
      })
    }
    const m = int(2, 4)
    const n = int(2, 3)
    const p = int(1, 6)
    return q({
      prompt: `Simplify:<div class="big">(${ex(`${b}^${m}`)})<sup>${n}</sup> ${TIMES} ${ex(powTxt(b, p))}</div>`,
      answer: exprA(`${b}^${m * n + p}`, 'singlePower'),
      hint: 'First the power of a power (multiply indices), then multiply (add indices).',
      steps: [`(${ex(`${b}^${m}`)})<sup>${n}</sup> = ${ex(`${b}^${m * n}`)}`, `${ex(`${b}^${m * n}`)} ${TIMES} ${ex(powTxt(b, p))} = ${ex(`${b}^${m * n + p}`)}`],
    })
  }
  const [p, r] = sample(['a', 'b', 'x', 'y', 'm', 'n'], 2).sort()
  const A = int(2, 5)
  const m = int(2, 4)
  const k = int(1, 3)
  const n = int(2, 3)
  const res = `${Math.pow(A, n)}${p}^${m * n}${powTxt(r, k * n)}`
  return q({
    prompt: `Simplify:<div class="big">(${ex(`${A}${p}^${m}${powTxt(r, k)}`)})<sup>${n}</sup></div>`,
    answer: exprA(res, 'singlePower'),
    hint: `Raise every factor inside the brackets to the power ${n}, including the number.`,
    steps: [`${A}<sup>${n}</sup> = ${Math.pow(A, n)}`, `(${ex(`${p}^${m}`)})<sup>${n}</sup> = ${ex(`${p}^${m * n}`)} and ${k === 1 ? ex(r) : '(' + ex(powTxt(r, k)) + ')'}<sup>${n}</sup> = ${ex(`${r}^${k * n}`)}`, `= ${ex(res)}`],
  })
}

// ------------------------------------------------------------------ Algebraic techniques

/** Expand a(bx + c) into terms. */
const alg_expand = (level: Level): Question => {
  const x = letter()
  if (level === 1) {
    const a = int(2, 9)
    const c = nonZero(-9, 9)
    const res = terms([
      [a, x],
      [a * c, ''],
    ])
    return q({
      prompt: `Expand:<div class="big">${a}(${ex(terms([[1, x], [c, '']]))})</div>`,
      answer: exprA(res, 'expanded'),
      hint: 'Multiply the number outside by each term inside the brackets.',
      steps: [`${a} ${TIMES} ${v(x)} = ${ex(coef(a, x))}`, `${a} ${TIMES} ${bnum(c)} = ${num(a * c)}`, `= ${ex(res)}`],
    })
  }
  if (level === 2) {
    if (chance()) {
      const a = -int(2, 8)
      const b = int(1, 5)
      const c = nonZero(-9, 9)
      const res = terms([
        [a * b, x],
        [a * c, ''],
      ])
      return q({
        prompt: `Expand:<div class="big">${MINUS}${-a}(${ex(terms([[b, x], [c, '']]))})</div>`,
        answer: exprA(res, 'expanded'),
        hint: 'Multiply each term inside by the negative number outside. Watch the signs.',
        steps: [`${num(a)} ${TIMES} ${ex(coef(b, x))} = ${ex(coef(a * b, x))}`, `${num(a)} ${TIMES} ${bnum(c)} = ${num(a * c)}`, `= ${ex(res)}`],
      })
    }
    const c = nonZero(-9, 9)
    const res = terms([
      [1, `${x}^2`],
      [c, x],
    ])
    return q({
      prompt: `Expand:<div class="big">${ex(x)}(${ex(terms([[1, x], [c, '']]))})</div>`,
      answer: exprA(res, 'expanded'),
      hint: `${v(x)} × ${v(x)} = ${v(x)}<sup>2</sup>`,
      steps: [`${v(x)} ${TIMES} ${v(x)} = ${ex(`${x}^2`)}`, `${v(x)} ${TIMES} ${bnum(c)} = ${ex(coef(c, x))}`, `= ${ex(res)}`],
    })
  }
  const [p, r] = sample(['a', 'b', 'x', 'y', 'm', 'n'], 2).sort()
  const a = nonZero(-5, 5)
  const b = nonZero(-5, 6)
  const c = nonZero(-6, 6)
  const res = terms([
    [a * b, `${p}^2`],
    [a * c, `${p}${r}`],
  ])
  return q({
    prompt: `Expand:<div class="big">${ex(coef(a, p))}(${ex(terms([[b, p], [c, r]]))})</div>`,
    answer: exprA(res, 'expanded'),
    hint: 'Multiply the term outside by each term inside, including signs.',
    steps: [`${ex(coef(a, p))} ${TIMES} ${b < 0 ? '(' + ex(coef(b, p)) + ')' : ex(coef(b, p))} = ${ex(coef(a * b, `${p}^2`))}`, `${ex(coef(a, p))} ${TIMES} ${c < 0 ? '(' + ex(coef(c, r)) + ')' : ex(coef(c, r))} = ${ex(coef(a * c, p + r))}`, `= ${ex(res)}`],
  })
}

const alg_expand_simplify = (level: Level): Question => {
  const x = letter()
  if (level === 1) {
    const a = int(2, 6)
    const c = int(1, 9)
    const k = nonZero(-8, 8)
    const res = terms([
      [a + k, x],
      [a * c, ''],
    ])
    if (a + k === 0) return alg_expand_simplify(1)
    return q({
      prompt: `Expand and simplify:<div class="big">${a}(${ex(`${x} + ${c}`)}) ${k < 0 ? MINUS : '+'} ${ex(coef(Math.abs(k), x))}</div>`,
      answer: exprA(res, 'expanded'),
      hint: 'Expand the brackets first, then collect like terms.',
      steps: [`Expand: ${ex(`${a}${x} + ${a * c}`)} ${k < 0 ? MINUS : '+'} ${ex(coef(Math.abs(k), x))}`, `Collect like terms: = ${ex(res)}`],
    })
  }
  if (level === 2) {
    const a = int(2, 6)
    const b = int(1, 9)
    const c = int(2, 5)
    const d = nonZero(-9, 9)
    const minus = chance(0.6)
    const cc = minus ? -c : c
    const X = a + cc
    const K = a * b + cc * d
    if (X === 0) return alg_expand_simplify(2)
    const res = terms([
      [X, x],
      [K, ''],
    ])
    return q({
      prompt: `Expand and simplify:<div class="big">${a}(${ex(`${x} + ${b}`)}) ${minus ? MINUS : '+'} ${c}(${ex(terms([[1, x], [d, '']]))})</div>`,
      answer: exprA(res, 'expanded'),
      hint: minus ? `Be careful: the ${MINUS}${c} multiplies both terms in the second bracket.` : 'Expand both brackets, then collect like terms.',
      steps: [`Expand: ${ex(terms([[a, x], [a * b, ''], [cc, x], [cc * d, '']]))}`, `Collect: ${v(x)} terms ${a} + ${bnum(cc)} = ${num(X)}; numbers ${a * b} + ${bnum(cc * d)} = ${num(K)}`, `= ${ex(res)}`],
    })
  }
  const a = nonZero(-6, 6)
  const b = int(2, 6)
  const c = nonZero(-8, 8)
  const X2 = 1
  const X1 = a - b
  const K = -b * c
  const res = terms([
    [X2, `${x}^2`],
    [X1, x],
    [K, ''],
  ])
  return q({
    prompt: `Expand and simplify:<div class="big">${ex(x)}(${ex(terms([[1, x], [a, '']]))}) ${MINUS} ${b}(${ex(terms([[1, x], [c, '']]))})</div>`,
    answer: exprA(res, 'expanded'),
    hint: `Expand each bracket. The ${MINUS}${b} multiplies both terms in the second bracket.`,
    steps: [`${ex(x)}(${ex(terms([[1, x], [a, '']]))}) = ${ex(terms([[1, `${x}^2`], [a, x]]))}`, `${MINUS}${b}(${ex(terms([[1, x], [c, '']]))}) = ${ex(terms([[-b, x], [-b * c, '']]))}`, `Collect like terms: ${ex(res)}`],
  })
}

const alg_factorise = (level: Level): Question => {
  const x = letter()
  if (level === 1) {
    const g = int(2, 9)
    let a = int(1, 6)
    let c = int(1, 9)
    while (gcd(a, c) !== 1) {
      a = int(1, 6)
      c = int(1, 9)
    }
    const minus = chance(0.4)
    const inner = terms([
      [a, x],
      [minus ? -c : c, ''],
    ])
    return q({
      prompt: `Factorise fully:<div class="big">${ex(terms([[g * a, x], [minus ? -g * c : g * c, '']]))}</div>`,
      answer: exprA(`${g}(${inner})`, 'factorised'),
      hint: 'Find the highest common factor of the terms and write it outside the brackets.',
      steps: [`HCF of ${g * a}${v(x)} and ${g * c} is ${g}.`, `${ex(terms([[g * a, x], [minus ? -g * c : g * c, '']]))} = ${g}(${ex(inner)})`, `Check by expanding: ${g} ${TIMES} ${ex(coef(a, x))} = ${ex(coef(g * a, x))} ✓`],
    })
  }
  if (level === 2) {
    if (chance()) {
      const g = int(2, 6)
      const a = int(1, 5)
      const c = nonZero(-9, 9)
      if (gcd(a, Math.abs(c)) !== 1) return alg_factorise(2)
      const inner = terms([
        [a, x],
        [c, ''],
      ])
      return q({
        prompt: `Factorise fully:<div class="big">${ex(terms([[g * a, `${x}^2`], [g * c, x]]))}</div>`,
        answer: exprA(`${g}${x}(${inner})`, 'factorised'),
        hint: `Both terms have a factor of ${g} and a factor of ${v(x)}.`,
        steps: [`HCF = ${g}${v(x)}`, `= ${g}${v(x)}(${ex(inner)})`],
      })
    }
    const g = int(2, 7)
    const c = int(1, 9)
    return q({
      prompt: `Factorise by taking out a negative common factor:<div class="big">${ex(`-${g}${x} - ${g * c}`)}</div>`,
      answer: exprA(`-${g}(${x} + ${c})`, 'factorised'),
      hint: `Take out ${MINUS}${g}. Dividing a negative term by a negative gives a positive.`,
      steps: [`HCF = ${MINUS}${g}`, `${ex(`-${g}${x}`)} ${DIVIDE} (${MINUS}${g}) = ${v(x)} and ${MINUS}${g * c} ${DIVIDE} (${MINUS}${g}) = ${c}`, `= ${MINUS}${g}(${ex(`${x} + ${c}`)})`],
    })
  }
  const [p, r] = sample(['a', 'b', 'x', 'y', 'm', 'n'], 2).sort()
  const g = int(2, 6)
  let a = int(1, 5)
  let c = nonZero(-5, 5)
  while (gcd(a, Math.abs(c)) !== 1) {
    a = int(1, 5)
    c = nonZero(-5, 5)
  }
  const inner = terms([
    [a, p],
    [c, r],
  ])
  return q({
    prompt: `Factorise fully:<div class="big">${ex(terms([[g * a, `${p}^2${r}`], [g * c, `${p}${r}^2`]]))}</div>`,
    answer: exprA(`${g}${p}${r}(${inner})`, 'factorised'),
    hint: 'Find the HCF of the numbers, then of each pronumeral.',
    steps: [`HCF of ${g * a} and ${Math.abs(g * c)} is ${g}; both terms contain ${v(p)} and ${v(r)}.`, `HCF = ${g}${v(p + r)}`, `= ${g}${v(p + r)}(${ex(inner)})`],
  })
}

// ------------------------------------------------------------------ Equations

const eq_both = (level: Level): Question => {
  const x = pick(['x', 'a', 'm', 'n', 'y', 'p'])
  const s = L(level, int(1, 12), nonZero(-10, 10), nonZero(-12, 12))
  let a = int(2, 9)
  let c = int(1, a - 1)
  if (level === 3 && chance()) {
    a = nonZero(-6, 8)
    c = intExcept(-6, 8, [a, 0])
  }
  const b = L(level, int(1, 15), nonZero(-15, 15), nonZero(-20, 20))
  const d = (a - c) * s + b
  const lhs = terms([
    [a, x],
    [b, ''],
  ])
  const rhs = terms([
    [c, x],
    [d, ''],
  ])
  return q({
    prompt: `Solve:<div class="big">${ex(lhs)} = ${ex(rhs)}</div>`,
    answer: numA(s),
    prefix: `${v(x)} =`,
    hint: `Get the ${v(x)} terms on one side first: ${c > 0 ? 'subtract' : 'add'} ${ex(coef(Math.abs(c), x))} ${c > 0 ? 'from' : 'to'} both sides.`,
    steps: [`${c > 0 ? 'Subtract' : 'Add'} ${ex(coef(Math.abs(c), x))} ${c > 0 ? 'from' : 'to'} both sides: ${ex(terms([[a - c, x], [b, '']]))} = ${num(d)}`, `${b > 0 ? 'Subtract ' + b + ' from' : 'Add ' + -b + ' to'} both sides: ${ex(coef(a - c, x))} = ${num(d - b)}`, ...(a - c === 1 ? [] : [`Divide by ${num(a - c)}: ${v(x)} = ${num(s)}`])],
  })
}

const eq_brackets = (level: Level): Question => {
  const x = pick(['x', 'a', 'm', 'n', 'y', 'k'])
  if (level === 1) {
    const a = int(2, 8)
    const s = int(1, 12)
    const b = nonZero(-9, 9)
    const rhs = a * (s + b)
    return q({
      prompt: `Solve:<div class="big">${a}(${ex(terms([[1, x], [b, '']]))}) = ${num(rhs)}</div>`,
      answer: numA(s),
      prefix: `${v(x)} =`,
      hint: `Either divide both sides by ${a} first, or expand the brackets first.`,
      steps: [`Divide both sides by ${a}: ${ex(terms([[1, x], [b, '']]))} = ${num(s + b)}`, `${b > 0 ? 'Subtract ' + b : 'Add ' + -b}: ${v(x)} = ${num(s)}`],
    })
  }
  if (level === 2) {
    const a = int(2, 6)
    const b = nonZero(-6, 6)
    const c = intExcept(1, 9, [a])
    const s = nonZero(-8, 10)
    const d = a * (s + b) - c * s
    const rhs = terms([
      [c, x],
      [d, ''],
    ])
    return q({
      prompt: `Solve:<div class="big">${a}(${ex(terms([[1, x], [b, '']]))}) = ${ex(rhs)}</div>`,
      answer: numA(s),
      prefix: `${v(x)} =`,
      hint: 'Expand the brackets, then get the pronumerals on one side.',
      steps: [`Expand: ${ex(terms([[a, x], [a * b, '']]))} = ${ex(rhs)}`, `${c < a ? 'Subtract ' + ex(coef(c, x)) + ' from both sides' : 'Subtract ' + ex(coef(a, x)) + ' from both sides'}: ${c < a ? ex(terms([[a - c, x], [a * b, '']])) + ' = ' + num(d) : num(a * b) + ' = ' + ex(terms([[c - a, x], [d, '']]))}`, `${v(x)} = ${num(s)}`],
    })
  }
  const a = int(2, 6)
  const b = nonZero(-6, 6)
  const c = int(2, 5)
  const dd = nonZero(-6, 6)
  if (a === c) return eq_brackets(3)
  const s = nonZero(-8, 8)
  const e = a * (s + b) - c * (s - dd)
  return q({
    prompt: `Solve:<div class="big">${a}(${ex(terms([[1, x], [b, '']]))}) ${MINUS} ${c}(${ex(terms([[1, x], [-dd, '']]))}) = ${num(e)}</div>`,
    answer: numA(s),
    prefix: `${v(x)} =`,
    hint: `Expand both brackets carefully: ${MINUS}${c} multiplies both terms in the second bracket.`,
    steps: [`Expand: ${ex(terms([[a, x], [a * b, ''], [-c, x], [c * dd, '']]))} = ${num(e)}`, `Collect: ${ex(terms([[a - c, x], [a * b + c * dd, '']]))} = ${num(e)}`, `${ex(coef(a - c, x))} = ${num(e - a * b - c * dd)}`, ...(a - c === 1 ? [] : [`${v(x)} = ${num(s)}`])],
  })
}

const eq_frac = (level: Level): Question => {
  const x = pick(['x', 'a', 'm', 'n', 'y', 'k'])
  if (level === 1) {
    const bb = int(2, 6)
    const c = int(1, 8)
    const a = nonZero(-9, 9)
    const s = bb * c - a
    return q({
      prompt: `Solve:<div class="big">${frac(ex(terms([[1, x], [a, '']])), bb)} = ${c}</div>`,
      answer: numA(s),
      prefix: `${v(x)} =`,
      hint: `Multiply both sides by ${bb} first.`,
      steps: [`Multiply both sides by ${bb}: ${ex(terms([[1, x], [a, '']]))} = ${bb * c}`, `${v(x)} = ${num(s)}`],
    })
  }
  if (level === 2) {
    const a = int(2, 5)
    const s = nonZero(-8, 10)
    const b = nonZero(-9, 9)
    const c = pick([2, 3, 4, 5, 6])
    if ((a * s + b) % c !== 0) return eq_frac(2)
    const d = (a * s + b) / c
    return q({
      prompt: `Solve:<div class="big">${frac(ex(terms([[a, x], [b, '']])), c)} = ${num(d)}</div>`,
      answer: numA(s),
      prefix: `${v(x)} =`,
      hint: `Multiply both sides by ${c}, then solve the two-step equation.`,
      steps: [`Multiply by ${c}: ${ex(terms([[a, x], [b, '']]))} = ${num(c * d)}`, `${b > 0 ? 'Subtract ' + b : 'Add ' + -b}: ${a}${v(x)} = ${num(c * d - b)}`, `Divide by ${a}: ${v(x)} = ${num(s)}`],
    })
  }
  const a = int(2, 4)
  const c = pick([3, 4, 5])
  const s = nonZero(-9, 9)
  const k = int(1, 6)
  // x/a + k = x/c + m  with integer s → choose s multiple of lcm
  const L2 = (a * c) / gcd(a, c)
  const S = s * L2
  if (a === c) return eq_frac(3)
  const m = S / a + k - S / c
  if (m === 0) return eq_frac(3)
  return q({
    prompt: `Solve:<div class="big">${frac(v(x), a)} + ${k} = ${frac(v(x), c)} ${m < 0 ? MINUS : '+'} ${Math.abs(m)}</div>`,
    answer: numA(S),
    prefix: `${v(x)} =`,
    hint: `Multiply every term by ${L2} (the lowest common multiple of ${a} and ${c}) to clear the fractions.`,
    steps: [`Multiply every term by ${L2}: ${ex(coef(L2 / a, x))} + ${k * L2} = ${ex(coef(L2 / c, x))} ${m < 0 ? MINUS : '+'} ${Math.abs(m * L2)}`, `Collect: ${ex(coef(L2 / a - L2 / c, x))} = ${num(m * L2 - k * L2)}`, `${v(x)} = ${num(S)}`],
  })
}

const eq_words = (level: Level): Question => {
  if (level === 1) {
    const w = int(4, 15)
    const k = int(2, 3)
    const P = 2 * (w + k * w)
    return q({
      prompt: `A rectangular vegetable garden is ${k} times as long as it is wide. Its perimeter is ${P} m. Find its width.`,
      answer: numA(w),
      suffix: 'm',
      hint: `Let the width be ${v('w')}. The length is ${k}${v('w')}.`,
      steps: [`2(${v('w')} + ${k}${v('w')}) = ${P}`, `${2 * (1 + k)}${v('w')} = ${P}`, `${v('w')} = ${w} m`],
    })
  }
  if (level === 2) {
    const fA = pick([20, 25, 30, 40])
    const rA = pick([4, 5, 6])
    const rB = rA + pick([2, 3, 4, 5])
    if (fA % (rB - rA) !== 0) return eq_words(2)
    const h = fA / (rB - rA)
    return q({
      prompt: `Bike hire company A charges $${fA} plus $${rA} per hour. Company B charges $${rB} per hour with no fee. For how many hours of hire do the two companies charge the same amount?`,
      answer: numA(h),
      suffix: 'hours',
      hint: `Let ${v('h')} be the number of hours. Write an expression for each company's cost and make them equal.`,
      steps: [`${fA} + ${rA}${v('h')} = ${rB}${v('h')}`, `${fA} = ${rB - rA}${v('h')}`, `${v('h')} = ${h}`],
    })
  }
  const kid = int(6, 14)
  const mult = pick([3, 4])
  const yrs = int(2, 8)
  // parent = mult * kid now; in yrs years: parent + yrs = k2 * (kid + yrs)
  const parent = mult * kid
  const ratio = (parent + yrs) / (kid + yrs)
  if (!Number.isInteger(ratio)) {
    // fall back to a sum-of-ages problem
    const nm = name()
    const sumNow = kid + parent
    return q({
      prompt: `${nm}’s dad is ${mult} times as old as ${nm}. In ${yrs} years’ time, the sum of their ages will be ${sumNow + 2 * yrs}. How old is ${nm} now?`,
      answer: numA(kid),
      suffix: 'years',
      hint: `Let ${nm}’s age now be ${v('a')}. In ${yrs} years: ${v('a')} + ${yrs} and ${mult}${v('a')} + ${yrs}.`,
      steps: [`(${v('a')} + ${yrs}) + (${mult}${v('a')} + ${yrs}) = ${sumNow + 2 * yrs}`, `${mult + 1}${v('a')} + ${2 * yrs} = ${sumNow + 2 * yrs}`, `${mult + 1}${v('a')} = ${sumNow}`, `${v('a')} = ${kid}`],
    })
  }
  const nm = name()
  return q({
    prompt: `${nm}’s mum is ${mult} times as old as ${nm}. In ${yrs} years she will be ${ratio} times as old as ${nm}. How old is ${nm} now?`,
    answer: numA(kid),
    suffix: 'years',
    hint: `Let ${nm}’s age now be ${v('a')}. Then mum is ${mult}${v('a')}. Write an equation for their ages in ${yrs} years.`,
    steps: [`${mult}${v('a')} + ${yrs} = ${ratio}(${v('a')} + ${yrs})`, `${mult}${v('a')} + ${yrs} = ${ratio}${v('a')} + ${ratio * yrs}`, `${mult - ratio === 1 ? '' : mult - ratio}${v('a')} = ${ratio * yrs - yrs}`, `${v('a')} = ${kid}`],
  })
}

const eq_formula = (level: Level): Question => {
  const t = L(level, pick(['v', 'P']), pick(['A', 'S', 'v2']), pick(['C', 'Ftri', 'P2']))
  if (t === 'v') {
    const u = int(0, 20)
    const a = int(2, 9)
    const tt = int(2, 10)
    const vv = u + a * tt
    return q({
      prompt: `Use the formula ${ex('v = u + at')} to find ${v('u')} when ${v('v')} = ${vv}, ${v('a')} = ${a} and ${v('t')} = ${tt}.`,
      answer: numA(u),
      prefix: `${v('u')} =`,
      hint: 'Substitute the values you know, then solve the equation.',
      steps: [`${vv} = ${v('u')} + ${a} ${TIMES} ${tt}`, `${vv} = ${v('u')} + ${a * tt}`, `${v('u')} = ${vv} ${MINUS} ${a * tt} = ${u}`],
    })
  }
  if (t === 'P') {
    const l = int(5, 25)
    const w = int(2, 15)
    const P = 2 * (l + w)
    return q({
      prompt: `The perimeter of a rectangle is ${ex('P = 2(l + w)')}. Find the width ${v('w')} when ${v('P')} = ${P} cm and ${v('l')} = ${l} cm.`,
      answer: numA(w),
      suffix: 'cm',
      hint: 'Substitute, then divide both sides by 2.',
      steps: [`${P} = 2(${l} + ${v('w')})`, `${P / 2} = ${l} + ${v('w')}`, `${v('w')} = ${w} cm`],
    })
  }
  if (t === 'A') {
    const b = int(3, 20)
    const h = int(2, 16)
    const A = (b * h) / 2
    return q({
      prompt: `The area of a triangle is ${ex('A = frac{1}{2}bh')}. Find the height ${v('h')} when ${v('A')} = ${num(A)} cm² and ${v('b')} = ${b} cm.`,
      answer: numA(h),
      suffix: 'cm',
      hint: 'Substitute, then solve: multiply both sides by 2, then divide by the base.',
      steps: [`${num(A)} = ${frac(1, 2)} ${TIMES} ${b} ${TIMES} ${v('h')}`, `${num(2 * A)} = ${b}${v('h')}`, `${v('h')} = ${h} cm`],
    })
  }
  if (t === 'S') {
    const n = int(5, 12)
    const S = (n - 2) * 180
    return q({
      prompt: `The sum of the interior angles of a polygon with ${v('n')} sides is ${ex('S = 180(n - 2)')}. How many sides does a polygon have if its angle sum is ${num(S)}°?`,
      answer: numA(n),
      hint: 'Substitute S, divide by 180, then add 2.',
      steps: [`${num(S)} = 180(${v('n')} ${MINUS} 2)`, `${v('n')} ${MINUS} 2 = ${n - 2}`, `${v('n')} = ${n}`],
    })
  }
  if (t === 'v2') {
    const d = int(60, 400)
    const tt = pick([2, 4, 5, 8])
    if (d % tt !== 0) return eq_formula(2)
    return q({
      prompt: `Average speed is given by ${ex('S = frac{D}{T}')}. A train has an average speed of ${d / tt} km/h. How long does it take to travel ${d} km?`,
      answer: numA(tt),
      suffix: 'hours',
      hint: `Substitute: ${d / tt} = ${d} ÷ T. Multiply both sides by T.`,
      steps: [`${d / tt} = ${frac(d, v('T'))}`, `${d / tt}${v('T')} = ${d}`, `${v('T')} = ${tt} hours`],
    })
  }
  if (t === 'C') {
    const C = int(20, 120)
    const r = C / (2 * Math.PI)
    return q({
      prompt: `The circumference of a circle is ${ex('C = 2pir')}. Find the radius of a circle with circumference ${C} cm, correct to 1 decimal place.`,
      answer: numA(r, 1),
      suffix: 'cm',
      calc: true,
      hint: 'Divide both sides by 2π.',
      steps: [`${C} = 2π${v('r')}`, `${v('r')} = ${C} ${DIVIDE} (2π) ≈ ${num(round(r, 1), 1)} cm`],
    })
  }
  if (t === 'Ftri') {
    const C = pick([-15, -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40])
    const F = (9 * C) / 5 + 32
    return q({
      prompt: `The formula ${ex('F = frac{9C}{5} + 32')} converts °C to °F. A thermometer reads ${num(F)}°F. What is this in °C?`,
      answer: numA(C),
      suffix: '°C',
      hint: 'Subtract 32, multiply by 5, then divide by 9.',
      steps: [`${num(F)} = ${frac('9' + v('C'), 5)} + 32`, `${num(F - 32)} = ${frac('9' + v('C'), 5)}`, `${num(5 * (F - 32))} = 9${v('C')}`, `${v('C')} = ${num(C)}`],
    })
  }
  const l = int(4, 20)
  const w = int(2, 12)
  const A = l * w
  return q({
    prompt: `A rectangle has area ${A} m² and length ${l} m. Use ${ex('A = lw')} to find its width, then find its perimeter.`,
    answer: numA(2 * (l + w)),
    suffix: 'm',
    hint: 'First solve for the width, then use P = 2(l + w).',
    steps: [`${A} = ${l}${v('w')}, so ${v('w')} = ${w} m`, `P = 2(${l} + ${w}) = ${2 * (l + w)} m`],
  })
}

// ------------------------------------------------------------------ Pythagoras

const TRIPLES: [number, number, number][] = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [8, 15, 17],
  [9, 12, 15],
  [7, 24, 25],
  [12, 16, 20],
  [15, 20, 25],
  [20, 21, 29],
  [9, 40, 41],
  [10, 24, 26],
  [12, 35, 37],
]

function triDiagram(a: number, b: number, labels: { base?: string; height?: string; hyp?: string }) {
  const ratio = b / a
  const scaled = ratio >= 0.35 && ratio <= 2.2
  return { diagram: D.rightTriangle(a, b, { ...labels, flip: chance(0.3) }), note: scaled ? undefined : NOT_TO_SCALE }
}

const pyt_hyp = (level: Level): Question => {
  const u = pick(['cm', 'm', 'mm'])
  if (level === 1) {
    const [a, b, c] = pick(TRIPLES)
    const sw = chance()
    const A = sw ? b : a
    const B = sw ? a : b
    const d = triDiagram(A, B, { base: `${A} ${u}`, height: `${B} ${u}`, hyp: v('c') })
    return q({
      prompt: `Find the length of the hypotenuse, ${v('c')}.`,
      ...d,
      answer: numA(c),
      suffix: u,
      hint: `Pythagoras’ theorem: ${ex('c^2 = a^2 + b^2')}, where ${v('c')} is the hypotenuse (the longest side, opposite the right angle).`,
      steps: [`${ex('c^2')} = ${a}<sup>2</sup> + ${b}<sup>2</sup>`, `${ex('c^2')} = ${a * a} + ${b * b} = ${c * c}`, `${v('c')} = ${sqrt(c * c)} = ${c} ${u}`],
    })
  }
  if (level === 2) {
    const a = int(2, 20)
    const b = int(2, 20)
    const c2 = a * a + b * b
    if (Number.isInteger(Math.sqrt(c2))) return pyt_hyp(2)
    const c = Math.sqrt(c2)
    const d = triDiagram(a, b, { base: `${a} ${u}`, height: `${b} ${u}`, hyp: v('x') })
    return q({
      prompt: `Find the value of ${v('x')}, correct to 1 decimal place.`,
      ...d,
      answer: numA(c, 1),
      suffix: u,
      calc: true,
      hint: `${v('x')} is the hypotenuse, so ${ex('x^2')} = ${a}<sup>2</sup> + ${b}<sup>2</sup>.`,
      steps: [`${ex('x^2')} = ${a}<sup>2</sup> + ${b}<sup>2</sup> = ${a * a} + ${b * b} = ${c2}`, `${v('x')} = ${sqrt(c2)} ≈ ${num(round(c, 1), 1)} ${u}`],
    })
  }
  if (chance()) {
    const w = int(30, 150)
    const h = int(20, 90)
    const dgl = Math.sqrt(w * w + h * h)
    return q({
      prompt: `A rectangular TV screen is ${w} cm wide and ${h} cm high. How long is its diagonal? Answer to the nearest centimetre.`,
      answer: numA(dgl, 0),
      suffix: 'cm',
      calc: true,
      hint: 'The diagonal is the hypotenuse of a right-angled triangle formed by the width and height.',
      steps: [`d<sup>2</sup> = ${w}<sup>2</sup> + ${h}<sup>2</sup> = ${w * w + h * h}`, `d = ${sqrt(w * w + h * h)} ≈ ${round(dgl, 0)} cm`],
    })
  }
  const a = int(12, 99) / 10
  const b = int(12, 99) / 10
  const c = Math.sqrt(a * a + b * b)
  const d = triDiagram(a, b, { base: `${num(a)} m`, height: `${num(b)} m`, hyp: v('h') })
  return q({
    prompt: `Find the value of ${v('h')}, correct to 2 decimal places.`,
    ...d,
    answer: numA(c, 2),
    suffix: 'm',
    calc: true,
    hint: 'Square the two shorter sides, add, then take the square root.',
    steps: [`${ex('h^2')} = ${num(a)}<sup>2</sup> + ${num(b)}<sup>2</sup> = ${num(clean(a * a))} + ${num(clean(b * b))} = ${num(clean(a * a + b * b))}`, `${v('h')} = ${sqrt(num(clean(a * a + b * b)))} ≈ ${num(round(c, 2), 2)} m`],
  })
}

const pyt_short = (level: Level): Question => {
  const u = pick(['cm', 'm'])
  if (level === 1) {
    const [a, b, c] = pick(TRIPLES)
    const findA = chance()
    const known = findA ? b : a
    const ans = findA ? a : b
    const d = triDiagram(a, b, findA ? { base: v('a'), height: `${b} ${u}`, hyp: `${c} ${u}` } : { base: `${a} ${u}`, height: v('a'), hyp: `${c} ${u}` })
    return q({
      prompt: `Find the value of ${v('a')}.`,
      ...d,
      answer: numA(ans),
      suffix: u,
      hint: 'To find a shorter side, subtract: (shorter side)² = (hypotenuse)² − (other side)².',
      steps: [`${ex('a^2')} = ${c}<sup>2</sup> ${MINUS} ${known}<sup>2</sup>`, `= ${c * c} ${MINUS} ${known * known} = ${ans * ans}`, `${v('a')} = ${sqrt(ans * ans)} = ${ans} ${u}`],
    })
  }
  if (level === 2) {
    const b = int(3, 20)
    const c = int(b + 1, b + 15)
    const a2 = c * c - b * b
    if (Number.isInteger(Math.sqrt(a2))) return pyt_short(2)
    const a = Math.sqrt(a2)
    const d = triDiagram(a, b, { base: v('y'), height: `${b} ${u}`, hyp: `${c} ${u}` })
    return q({
      prompt: `Find the value of ${v('y')}, correct to 1 decimal place.`,
      ...d,
      answer: numA(a, 1),
      suffix: u,
      calc: true,
      hint: 'The hypotenuse is given, so subtract the squares.',
      steps: [`${ex('y^2')} = ${c}<sup>2</sup> ${MINUS} ${b}<sup>2</sup> = ${c * c} ${MINUS} ${b * b} = ${a2}`, `${v('y')} = ${sqrt(a2)} ≈ ${num(round(a, 1), 1)} ${u}`],
    })
  }
  const L2 = pick([3, 3.5, 4, 4.5, 5, 6, 7.2])
  const foot = pick([0.8, 1, 1.2, 1.5, 1.8, 2])
  if (foot >= L2) return pyt_short(3)
  const h = Math.sqrt(L2 * L2 - foot * foot)
  return q({
    prompt: `A ${num(L2)} m ladder leans against a vertical wall. Its foot is ${num(foot)} m from the base of the wall on level ground. How far up the wall does the ladder reach? Answer correct to 2 decimal places.`,
    answer: numA(h, 2),
    suffix: 'm',
    calc: true,
    hint: 'The ladder is the hypotenuse. The wall and the ground make the right angle.',
    steps: [`${ex('h^2')} = ${num(L2)}<sup>2</sup> ${MINUS} ${num(foot)}<sup>2</sup> = ${num(clean(L2 * L2))} ${MINUS} ${num(clean(foot * foot))} = ${num(clean(L2 * L2 - foot * foot))}`, `${v('h')} = ${sqrt(num(clean(L2 * L2 - foot * foot)))} ≈ ${num(round(h, 2), 2)} m`],
  })
}

const pyt_test = (level: Level): Question => {
  if (level === 1) {
    const set = pick([['P', 'Q', 'R'], ['A', 'B', 'C'], ['X', 'Y', 'Z'], ['L', 'M', 'N'], ['D', 'E', 'F']])
    const names = shuffle(set) as [string, string, string]
    const pair = (u: string, w: string) => [u, w].sort().join('')
    const hyp = pair(names[1], names[2])
    const options = [pair(set[0], set[1]), pair(set[0], set[2]), pair(set[1], set[2])]
    return q({
      prompt: 'Which side is the hypotenuse of this right-angled triangle?',
      diagram: D.rightTriangle(int(3, 8), int(3, 8), { names, flip: chance() }),
      answer: mcFixedA(options, hyp),
      hint: 'The hypotenuse is the longest side. It is opposite the right angle.',
      steps: [`The right angle is at ${names[0]}.`, `The side opposite ${names[0]} is ${hyp}, so ${hyp} is the hypotenuse.`],
    })
  }
  const right = chance()
  let a: number, b: number, c: number
  if (right) [a, b, c] = pick(TRIPLES)
  else {
    ;[a, b, c] = pick(TRIPLES)
    c += pick([1, 2])
  }
  const sides = shuffle([a, b, c])
  const isRight = a * a + b * b === c * c
  if (level === 2) {
    return q({
      prompt: `A triangle has sides of length ${sides.join(' cm, ')} cm. Is it a right-angled triangle?`,
      answer: mcFixedA(['Yes', 'No'], isRight ? 'Yes' : 'No'),
      calc: true,
      hint: 'Test whether the square of the longest side equals the sum of the squares of the other two sides.',
      steps: [`Longest side: ${c}. ${c}<sup>2</sup> = ${c * c}`, `${a}<sup>2</sup> + ${b}<sup>2</sup> = ${a * a} + ${b * b} = ${a * a + b * b}`, isRight ? `These are equal, so the triangle is right-angled.` : `${a * a + b * b} ≠ ${c * c}, so the triangle is not right-angled.`],
    })
  }
  return q({
    prompt: `Is (${sides.join(', ')}) a Pythagorean triad?`,
    answer: mcFixedA(['Yes', 'No'], isRight ? 'Yes' : 'No'),
    hint: 'A Pythagorean triad is a set of three whole numbers that satisfy a² + b² = c².',
    steps: [`${a}<sup>2</sup> + ${b}<sup>2</sup> = ${a * a + b * b}`, `${c}<sup>2</sup> = ${c * c}`, isRight ? 'They are equal, so it is a Pythagorean triad.' : 'They are not equal, so it is not a Pythagorean triad.'],
  })
}

const pyt_apply = (level: Level): Question => {
  if (level === 1) {
    const [a, b, c] = pick(TRIPLES.filter((t) => t[2] <= 30))
    return q({
      prompt: `${name()} walks ${a * 10} m east and then ${b * 10} m north. How far are they from their starting point, in a straight line?`,
      answer: numA(c * 10),
      suffix: 'm',
      hint: 'Draw a diagram. East and north are at right angles.',
      steps: [`d<sup>2</sup> = ${a * 10}<sup>2</sup> + ${b * 10}<sup>2</sup> = ${a * a * 100} + ${b * b * 100} = ${c * c * 100}`, `d = ${c * 10} m`],
    })
  }
  if (level === 2) {
    const w = pick([40, 50, 60, 80, 90, 120])
    const l = pick([30, 60, 70, 100, 110, 150])
    const dgl = Math.sqrt(w * w + l * l)
    const save = w + l - dgl
    return q({
      prompt: `A rectangular park is ${l} m long and ${w} m wide. How much shorter is it to walk diagonally across the park than to walk along two sides from one corner to the opposite corner? Answer to the nearest metre.`,
      answer: numA(save, 0),
      suffix: 'm',
      calc: true,
      hint: 'Find the diagonal with Pythagoras, then compare it with the length + width.',
      steps: [`Diagonal = ${sqrt(`${l}<sup>2</sup> + ${w}<sup>2</sup>`)} = ${sqrt(l * l + w * w)} ≈ ${num(round(dgl, 2), 2)} m`, `Along two sides: ${l} + ${w} = ${l + w} m`, `Difference ≈ ${l + w} ${MINUS} ${num(round(dgl, 2), 2)} ≈ ${round(save, 0)} m`],
    })
  }
  const base = pick([6, 8, 10, 12, 14, 16, 20])
  const side = int(base / 2 + 2, base + 8)
  const h = Math.sqrt(side * side - (base / 2) * (base / 2))
  const A = (base * h) / 2
  return q({
    prompt: `An isosceles triangle has two equal sides of ${side} cm and a base of ${base} cm. Find its area, correct to 1 decimal place.`,
    diagram: D.triangleBH(base, h, `${base} cm`, v('h'), 0.5, [`${side} cm`, `${side} cm`]),
    note: NOT_TO_SCALE,
    answer: numA(A, 1),
    suffix: 'cm²',
    calc: true,
    hint: 'The height splits the base in half, making two right-angled triangles. Find the height first.',
    steps: [`Half the base = ${base / 2} cm`, `${ex('h^2')} = ${side}<sup>2</sup> ${MINUS} ${base / 2}<sup>2</sup> = ${side * side - (base / 2) ** 2}`, `${v('h')} = ${sqrt(side * side - (base / 2) ** 2)} ${Number.isInteger(h) ? '= ' + num(h) : '≈ ' + num(round(h, 3), 3)} cm`, `Area = ${frac(1, 2)} ${TIMES} ${base} ${TIMES} ${Number.isInteger(h) ? num(h) : num(round(h, 3), 3)} ${Number.isInteger(A) ? '=' : '≈'} ${num(round(A, 1), 1)} cm²`],
  })
}

// ------------------------------------------------------------------ Topics

export const Y8A: Topic[] = [
  {
    id: 'y8-indices',
    year: 8,
    title: 'Indices',
    strand: 'Number and algebra',
    outcomes: ['MA4-IND-C-01'],
    blurb: 'Index laws for multiplying, dividing and raising powers, and the zero index.',
    colour: 265,
    skills: [
      {
        id: 'y8-ind-muldiv',
        title: 'Multiplying and dividing powers',
        outcomes: ['MA4-IND-C-01'],
        summary: 'Use the index laws for multiplication and division.',
        learn: {
          intro: '<p>When powers have the <b>same base</b>, we can simplify them using index laws.</p>',
          keyPoints: ['Multiplying: add the indices. <i>a</i><sup>3</sup> × <i>a</i><sup>4</sup> = <i>a</i><sup>7</sup>', 'Dividing: subtract the indices. <i>a</i><sup>9</sup> ÷ <i>a</i><sup>2</sup> = <i>a</i><sup>7</sup>', 'Multiply or divide the coefficients (numbers) as normal: 3<i>a</i><sup>2</sup> × 5<i>a</i><sup>4</sup> = 15<i>a</i><sup>6</sup>', 'Type powers with ^, e.g. 15a^6.'],
        },
        gen: ind_muldiv,
        levels: { 1: 'One base', 2: 'With coefficients', 3: 'Combined; two pronumerals' },
      },
      {
        id: 'y8-ind-power-zero',
        title: 'Power of a power and the zero index',
        outcomes: ['MA4-IND-C-01'],
        summary: 'Raise a power to a power and use the zero index.',
        learn: {
          intro: '<p>(<i>a</i><sup>3</sup>)<sup>2</sup> = <i>a</i><sup>3</sup> × <i>a</i><sup>3</sup> = <i>a</i><sup>6</sup>. So for a power of a power, multiply the indices.</p>',
          keyPoints: ['(<i>a</i><sup>m</sup>)<sup>n</sup> = <i>a</i><sup>mn</sup>', '<i>a</i><sup>0</sup> = 1 for any non-zero <i>a</i>', '5<i>x</i><sup>0</sup> = 5 × 1 = 5, but (5<i>x</i>)<sup>0</sup> = 1', '(2<i>a</i><sup>3</sup>)<sup>2</sup> = 2<sup>2</sup> × <i>a</i><sup>6</sup> = 4<i>a</i><sup>6</sup>'],
        },
        gen: ind_power_zero,
        levels: { 1: 'Power of a power; zero index', 2: 'Mixed laws', 3: 'Brackets with coefficients' },
      },
    ],
  },
  {
    id: 'y8-algebra',
    year: 8,
    title: 'Algebraic techniques',
    strand: 'Number and algebra',
    outcomes: ['MA4-ALG-C-01'],
    blurb: 'Expand brackets, simplify and factorise algebraic expressions.',
    colour: 330,
    skills: [
      {
        id: 'y8-alg-expand',
        title: 'Expanding brackets',
        outcomes: ['MA4-ALG-C-01'],
        summary: 'Use the distributive law to expand brackets.',
        learn: {
          intro: '<p>The <b>distributive law</b>: <i>a</i>(<i>b</i> + <i>c</i>) = <i>ab</i> + <i>ac</i>. Multiply the term outside by every term inside.</p>',
          keyPoints: ['3(<i>x</i> + 4) = 3<i>x</i> + 12', '−2(<i>x</i> − 5) = −2<i>x</i> + 10 (negative × negative = positive)', '<i>x</i>(<i>x</i> + 3) = <i>x</i><sup>2</sup> + 3<i>x</i>'],
        },
        gen: alg_expand,
        levels: { 1: 'Positive number outside', 2: 'Negative or pronumeral outside', 3: 'Two pronumerals' },
      },
      {
        id: 'y8-alg-expand-simplify',
        title: 'Expanding and simplifying',
        outcomes: ['MA4-ALG-C-01'],
        summary: 'Expand brackets and collect like terms.',
        learn: {
          intro: '<p>Expand every bracket first, then collect like terms.</p>',
          keyPoints: ['3(<i>x</i> + 2) − 2(<i>x</i> − 1) = 3<i>x</i> + 6 − 2<i>x</i> + 2 = <i>x</i> + 8', 'The sign in front of a bracket belongs to the number you multiply by.'],
        },
        gen: alg_expand_simplify,
        levels: { 1: 'One bracket', 2: 'Two brackets', 3: 'Including x²' },
      },
      {
        id: 'y8-alg-factorise',
        title: 'Factorising',
        outcomes: ['MA4-ALG-C-01'],
        summary: 'Factorise expressions by taking out the highest common factor.',
        learn: {
          intro: '<p>Factorising is the reverse of expanding. Find the highest common factor (HCF) of all the terms and write it outside the brackets.</p>',
          keyPoints: ['6<i>x</i> + 12 = 6(<i>x</i> + 2)', '4<i>x</i><sup>2</sup> − 8<i>x</i> = 4<i>x</i>(<i>x</i> − 2)', 'Factorise <b>fully</b>: the bracket must not have any common factor left.', 'Check by expanding your answer.'],
        },
        gen: alg_factorise,
        levels: { 1: 'Numerical HCF', 2: 'HCF with a pronumeral; negative HCF', 3: 'Two pronumerals' },
      },
    ],
  },
  {
    id: 'y8-equations',
    year: 8,
    title: 'Equations',
    strand: 'Number and algebra',
    outcomes: ['MA4-EQU-C-01'],
    blurb: 'Equations with pronumerals on both sides, brackets and fractions; formulas and problems.',
    colour: 285,
    skills: [
      {
        id: 'y8-eq-both',
        title: 'Pronumerals on both sides',
        outcomes: ['MA4-EQU-C-01'],
        summary: 'Solve equations with the pronumeral on both sides.',
        learn: {
          intro: '<p>Move all the pronumeral terms to one side and the numbers to the other, keeping the equation balanced.</p>',
          keyPoints: ['5<i>x</i> + 3 = 2<i>x</i> + 18 → subtract 2<i>x</i>: 3<i>x</i> + 3 = 18 → subtract 3: 3<i>x</i> = 15 → <i>x</i> = 5', 'It is usually easiest to move the smaller pronumeral term.'],
        },
        gen: eq_both,
        levels: { 1: 'Whole-number answers', 2: 'Negative answers', 3: 'Negative coefficients' },
      },
      {
        id: 'y8-eq-brackets',
        title: 'Equations with brackets',
        outcomes: ['MA4-EQU-C-01'],
        summary: 'Solve equations that contain brackets.',
        learn: {
          intro: '<p>Expand the brackets first (or divide both sides by the number outside the bracket), then solve.</p>',
          keyPoints: ['3(<i>x</i> − 2) = 15 → <i>x</i> − 2 = 5 → <i>x</i> = 7', '2(<i>x</i> + 3) = <i>x</i> + 10 → 2<i>x</i> + 6 = <i>x</i> + 10 → <i>x</i> = 4'],
        },
        gen: eq_brackets,
        levels: { 1: 'One bracket', 2: 'Bracket and pronumeral on both sides', 3: 'Two brackets' },
      },
      {
        id: 'y8-eq-frac',
        title: 'Equations with fractions',
        outcomes: ['MA4-EQU-C-01'],
        summary: 'Solve equations involving fractions.',
        learn: {
          intro: '<p>Multiply both sides by the denominator to remove fractions.</p>',
          keyPoints: ['(<i>x</i> + 4)/3 = 5 → <i>x</i> + 4 = 15 → <i>x</i> = 11', 'With more than one fraction, multiply every term by the lowest common multiple of the denominators.'],
        },
        gen: eq_frac,
        levels: { 1: 'One fraction', 2: 'Two-step numerator', 3: 'Fractions on both sides' },
      },
      {
        id: 'y8-eq-words',
        title: 'Solving problems with equations',
        outcomes: ['MA4-EQU-C-01'],
        summary: 'Model real situations with equations and solve them.',
        learn: {
          intro: '<p>Define a pronumeral, write an equation, solve it, and answer in words.</p>',
          keyPoints: ['When two plans cost the same, set their expressions equal.', 'For age problems, add the same number of years to everyone.'],
        },
        gen: eq_words,
        levels: { 1: 'Perimeter', 2: 'Comparing costs', 3: 'Ages' },
      },
      {
        id: 'y8-eq-formula',
        title: 'Using formulas',
        outcomes: ['MA4-EQU-C-01', 'MA4-ALG-C-01'],
        summary: 'Substitute into formulas and solve for an unknown.',
        learn: {
          intro: '<p>Substitute the values you know into the formula, then solve the equation for the unknown.</p>',
          keyPoints: ['v = u + at: if v = 20, a = 3, t = 4 then 20 = u + 12, so u = 8.', 'Keep units in your final answer.'],
        },
        gen: eq_formula,
        levels: { 1: 'One step after substituting', 2: 'Two steps', 3: 'Calculator; multi-step' },
      },
    ],
  },
  {
    id: 'y8-pythagoras',
    year: 8,
    title: 'Pythagoras’ theorem',
    strand: 'Measurement and space',
    outcomes: ['MA4-PYT-C-01'],
    blurb: 'Find unknown sides of right-angled triangles and solve practical problems.',
    colour: 18,
    skills: [
      {
        id: 'y8-pyt-hyp',
        title: 'Finding the hypotenuse',
        outcomes: ['MA4-PYT-C-01'],
        summary: 'Use c² = a² + b² to find the longest side.',
        learn: {
          intro: '<p>In a right-angled triangle, the square of the hypotenuse equals the sum of the squares of the other two sides: <i>c</i><sup>2</sup> = <i>a</i><sup>2</sup> + <i>b</i><sup>2</sup>.</p>',
          keyPoints: ['The hypotenuse is the longest side, opposite the right angle.', 'Square, add, then take the square root.', 'Round only at the end.'],
        },
        gen: pyt_hyp,
        levels: { 1: 'Pythagorean triads', 2: 'Rounded answers', 3: 'Decimals and problems' },
      },
      {
        id: 'y8-pyt-short',
        title: 'Finding a shorter side',
        outcomes: ['MA4-PYT-C-01'],
        summary: 'Rearrange Pythagoras’ theorem to find a shorter side.',
        learn: {
          intro: '<p>To find a shorter side: <i>a</i><sup>2</sup> = <i>c</i><sup>2</sup> − <i>b</i><sup>2</sup>. Subtract, because the hypotenuse is the longest side.</p>',
          keyPoints: ['Check: your answer must be shorter than the hypotenuse.'],
        },
        gen: pyt_short,
        levels: { 1: 'Pythagorean triads', 2: 'Rounded answers', 3: 'Ladders' },
      },
      {
        id: 'y8-pyt-test',
        title: 'Right-angled triangles and triads',
        outcomes: ['MA4-PYT-C-01'],
        summary: 'Identify the hypotenuse and test whether a triangle is right-angled.',
        learn: {
          intro: '<p>If <i>c</i><sup>2</sup> = <i>a</i><sup>2</sup> + <i>b</i><sup>2</sup> (with <i>c</i> the longest side), the triangle is right-angled. Whole-number sets like (3, 4, 5) are <b>Pythagorean triads</b>.</p>',
          keyPoints: ['Square the longest side and compare it with the sum of the squares of the other two.', 'Multiples of a triad are also triads: (6, 8, 10).'],
        },
        gen: pyt_test,
        levels: { 1: 'Identify the hypotenuse', 2: 'Is it right-angled?', 3: 'Pythagorean triads' },
      },
      {
        id: 'y8-pyt-apply',
        title: 'Pythagoras problems',
        outcomes: ['MA4-PYT-C-01'],
        summary: 'Solve practical problems using Pythagoras’ theorem.',
        learn: {
          intro: '<p>Draw a diagram, find the right-angled triangle, label the hypotenuse, then use Pythagoras’ theorem.</p>',
          keyPoints: ['North–south and east–west directions are at right angles.', 'The height of an isosceles triangle cuts its base in half.'],
        },
        gen: pyt_apply,
        levels: { 1: 'Distances', 2: 'Shortcuts', 3: 'Two-step problems' },
      },
    ],
  },
]

void signed
void money
void fracA
void mcA
