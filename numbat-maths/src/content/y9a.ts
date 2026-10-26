// Year 9 (Stage 5) — Algebra, Indices and numbers of any magnitude, Equations, Financial mathematics
import type { Level, Question, Topic } from '@/lib/maths/types'
import {
  D, L, MINUS, TIMES, DIVIDE, bnum, chance, clean, ex, frac, fracA, fracS, gcd, lcm, int, intExcept, mcA, mcFixedA,
  nonZero, num, numA, pick, q, sample, exprA, v, terms, coef, round, roundSF, name, sqrt, money, signed, approx, pow,
} from './helpers'

const letter = () => pick(['a', 'b', 'm', 'n', 'p', 'x', 'y', 'k', 'h', 't'])

/** a/b as an expression string "N x/D" for checker, simplified; x may be ''. */
function fracExpr(n: number, d: number, x = ''): string {
  if (d < 0) {
    n = -n
    d = -d
  }
  const g = gcd(n, d) || 1
  n /= g
  d /= g
  const top = x ? coef(n, x) : String(n)
  return d === 1 ? top : `${top}/${d}`
}
function fracHtml(n: number, d: number, x = ''): string {
  if (d < 0) {
    n = -n
    d = -d
  }
  const g = gcd(n, d) || 1
  n /= g
  d /= g
  const top = x ? ex(coef(Math.abs(n), x)) : num(Math.abs(n))
  return (n < 0 ? MINUS : '') + (d === 1 ? top : frac(top, d))
}

// ------------------------------------------------------------------ Algebra

const alg_frac_addsub = (level: Level): Question => {
  const x = letter()
  if (level <= 2) {
    const [p, qq] = L(level, sample([2, 3, 4, 5, 6, 8], 2), sample([3, 4, 5, 6, 7, 8, 10], 2), [0, 0])
    if (p === qq) return alg_frac_addsub(level)
    let a = level === 1 ? 1 : int(1, 5)
    while (gcd(a, p) !== 1) a = int(1, 5)
    let b = level === 1 ? 1 : int(1, 5)
    while (gcd(b, qq) !== 1) b = int(1, 5)
    const sub = level === 2 ? chance(0.6) : chance(0.3)
    const Ld = lcm(p, qq)
    const N = a * (Ld / p) + (sub ? -1 : 1) * b * (Ld / qq)
    if (N === 0) return alg_frac_addsub(level)
    const ans = fracExpr(N, Ld, x)
    return q({
      prompt: `Simplify:<div class="big">${frac(ex(coef(a, x)), p)} ${sub ? MINUS : '+'} ${frac(ex(coef(b, x)), qq)}</div>`,
      answer: exprA(ans, 'singleFraction'),
      hint: `Use a common denominator of ${Ld}, just like adding number fractions.`,
      steps: [`Common denominator: ${Ld}`, `${frac(ex(coef(a * (Ld / p), x)), Ld)} ${sub ? MINUS : '+'} ${frac(ex(coef(b * (Ld / qq), x)), Ld)}`, `= ${frac(ex(coef(N, x)), Ld)}${gcd(N, Ld) > 1 ? ' = ' + fracHtml(N, Ld, x) : ''}`],
    })
  }
  const [p, qq] = sample([2, 3, 4, 5], 2)
  const b1 = nonZero(-5, 5)
  const b2 = nonZero(-5, 5)
  const sub = chance(0.4)
  const Ld = lcm(p, qq)
  const k1 = Ld / p
  const k2 = Ld / qq
  const s2 = sub ? -1 : 1
  const X = k1 + s2 * k2
  const C = k1 * b1 + s2 * k2 * b2
  if (X === 0) return alg_frac_addsub(3)
  const numStr = terms([
    [X, x],
    [C, ''],
  ])
  const g = gcd(gcd(Math.abs(X), Math.abs(C)), Ld)
  const ans = g > 1 ? `(${terms([[X / g, x], [C / g, '']])})/${Ld / g}` : `(${numStr})/${Ld}`
  return q({
    prompt: `Simplify:<div class="big">${frac(ex(terms([[1, x], [b1, '']])), p)} ${sub ? MINUS : '+'} ${frac(ex(terms([[1, x], [b2, '']])), qq)}</div>`,
    answer: exprA(ans, 'singleFraction'),
    hint: `Common denominator ${Ld}. Put brackets around each numerator when you multiply it${sub ? ', and be careful subtracting the second numerator' : ''}.`,
    steps: [`= ${frac(`${k1}(${ex(terms([[1, x], [b1, '']]))})${sub ? ` ${MINUS} ` : ' + '}${k2}(${ex(terms([[1, x], [b2, '']]))})`, Ld)}`, `= ${frac(ex(terms([[k1, x], [k1 * b1, ''], [s2 * k2, x], [s2 * k2 * b2, '']])), Ld)}`, `= ${frac(ex(numStr), Ld)}${g > 1 ? ' = ' + frac(ex(terms([[X / g, x], [C / g, '']])), Ld / g) : ''}`],
  })
}

const alg_frac_muldiv = (level: Level): Question => {
  const x = letter()
  const coprime = (lo: number, hi: number, lo2: number, hi2: number): [number, number] => {
    for (;;) {
      const u = int(lo, hi)
      const w = int(lo2, hi2)
      if (gcd(u, w) === 1 && u !== w) return [u, w]
    }
  }
  if (level === 1) {
    const [a, b] = coprime(1, 9, 2, 9)
    const [c, d] = coprime(1, 9, 2, 9)
    const ans = fracExpr(a * c, b * d, x)
    return q({
      prompt: `Simplify:<div class="big">${frac(ex(coef(a, x)), b)} ${TIMES} ${frac(c, d)}</div>`,
      answer: exprA(ans, 'simplified'),
      hint: 'Multiply the numerators and the denominators, then simplify (or cancel first).',
      steps: [`= ${frac(ex(coef(a * c, x)), b * d)}`, gcd(a * c, b * d) > 1 ? `Simplify: ${fracHtml(a * c, b * d, x)}` : 'This is in simplest form.'],
    })
  }
  if (level === 2) {
    const [a, b] = coprime(1, 9, 2, 9)
    const [c, d] = coprime(1, 9, 2, 9)
    return q({
      prompt: `Simplify:<div class="big">${frac(ex(coef(a, x)), b)} ${DIVIDE} ${frac(ex(coef(c, x)), d)}</div>`,
      answer: fracA(a * d, b * c),
      hint: `Multiply by the reciprocal of the second fraction. The ${v(x)}’s cancel.`,
      steps: [`= ${frac(ex(coef(a, x)), b)} ${TIMES} ${frac(d, ex(coef(c, x)))}`, `= ${frac(a * d, b * c)}${gcd(a * d, b * c) > 1 ? ' = ' + fracS(a * d, b * c) : ''}`],
    })
  }
  const [p, r] = sample(['a', 'b', 'c', 'd', 'x', 'y'], 2).sort()
  const a = int(2, 9)
  const b = int(2, 6)
  const c = int(2, 9)
  const d = int(2, 6)
  const div = chance()
  // (a p / b r) × (c r / d p²)  or  (a p / b r) ÷ (c p / d r)
  if (div) {
    return q({
      prompt: `Simplify:<div class="big">${frac(ex(`${a}${p}`), ex(`${b}${r}`))} ${DIVIDE} ${frac(ex(`${c}${p}`), ex(`${d}${r}`))}</div>`,
      answer: fracA(a * d, b * c),
      hint: 'Flip the second fraction and multiply. Cancel the pronumerals.',
      steps: [`= ${frac(ex(`${a}${p}`), ex(`${b}${r}`))} ${TIMES} ${frac(ex(`${d}${r}`), ex(`${c}${p}`))}`, `= ${frac(a * d, b * c)}${gcd(a * d, b * c) > 1 ? ' = ' + fracS(a * d, b * c) : ''}`],
    })
  }
  const N = a * c
  const Dn = b * d
  const g = gcd(N, Dn)
  const ans = Dn / g === 1 ? `${N / g}/${p}` : `${N / g}/(${Dn / g}${p})`
  return q({
    prompt: `Simplify:<div class="big">${frac(ex(`${a}${p}`), ex(`${b}${r}`))} ${TIMES} ${frac(ex(`${c}${r}`), ex(`${d}${p}^2`))}</div>`,
    answer: exprA(ans, 'simplified'),
    hint: `Multiply, then cancel: ${v(r)} cancels completely and one ${v(p)} cancels.`,
    steps: [`= ${frac(ex(`${N}${p}${r}`), ex(`${Dn}${p}^2${r}`))}`, `Cancel ${v(p + r)} and simplify the numbers: ${frac(N / g, ex(`${Dn / g === 1 ? '' : Dn / g}${p}`))}`],
  })
}

const alg_expand_factor = (level: Level): Question => {
  const x = letter()
  if (level === 1) {
    if (chance()) {
      const a = int(5, 20)
      const b = int(2, 8)
      const c = int(1, 5)
      const d = nonZero(-6, 6)
      // a − b(cx + d)
      const res = terms([
        [-b * c, x],
        [a - b * d, ''],
      ])
      return q({
        prompt: `Expand and simplify:<div class="big">${a} ${MINUS} ${b}(${ex(terms([[c, x], [d, '']]))})</div>`,
        answer: exprA(res, 'expanded'),
        hint: `${MINUS}${b} multiplies both terms in the bracket.`,
        steps: [`= ${ex(terms([[a, ''], [-b * c, x], [-b * d, '']]))}`, `= ${ex(res)}`],
      })
    }
    const a = int(2, 6)
    const b = nonZero(-6, 6)
    const c = int(2, 6)
    const d = nonZero(-6, 6)
    const res = terms([
      [a + c, x],
      [a * b + c * d, ''],
    ])
    return q({
      prompt: `Expand and simplify:<div class="big">${a}(${ex(terms([[1, x], [b, '']]))}) + ${c}(${ex(terms([[1, x], [d, '']]))})</div>`,
      answer: exprA(res, 'expanded'),
      hint: 'Expand each bracket, then collect like terms.',
      steps: [`= ${ex(terms([[a, x], [a * b, ''], [c, x], [c * d, '']]))}`, `= ${ex(res)}`],
    })
  }
  if (level === 2) {
    if (chance()) {
      const g = int(2, 9)
      const c = int(1, 9)
      return q({
        prompt: `Factorise fully:<div class="big">${ex(`-${g}${x} + ${g * c}`)}</div>`,
        answer: exprA(`-${g}(${x} - ${c})`, 'factorised'),
        hint: `Take out ${MINUS}${g} (or ${g}). Check by expanding.`,
        steps: [`HCF = ${MINUS}${g}`, `= ${MINUS}${g}(${ex(`${x} - ${c}`)})`, `(${g}(${ex(`${c} - ${x}`)}) is also correct.)`],
      })
    }
    const [p, r] = sample(['h', 'k', 'm', 'n', 'p', 'x', 'y'], 2)
    const g = int(2, 6)
    let a = int(2, 5)
    let b = int(1, 4)
    while (gcd(a, b) !== 1) b = int(1, 4)
    return q({
      prompt: `Factorise fully:<div class="big">${ex(`${g * a}${p} - ${g * b}${r}${p}^2`)}</div>`,
      answer: exprA(`${g}${p}(${a} - ${b === 1 ? '' : b}${r}${p})`, 'factorised'),
      hint: `The HCF contains ${g} and ${v(p)}.`,
      steps: [`HCF = ${g}${v(p)}`, `= ${g}${v(p)}(${ex(`${a} - ${b === 1 ? '' : b}${r}${p}`)})`],
    })
  }
  const a = nonZero(-7, 7)
  const k = pick([-6, -5, -4, -3, -2, 2, 3, 4, 5, 6])
  const sgn = chance()
  // k(x + a) ± x(x + a)  → (x + a)(x ± k)  ... written as  k(x+a) + x(x+a)
  const inner = terms([
    [1, x],
    [a, ''],
  ])
  const prompt = sgn ? `${num(k)}(${ex(inner)}) + ${ex(x)}(${ex(inner)})` : `${ex(x)}(${ex(inner)}) ${k < 0 ? '+' : MINUS} ${Math.abs(k)}(${ex(inner)})`
  const other = sgn ? terms([[1, x], [k, '']]) : terms([[1, x], [-k, '']])
  return q({
    prompt: `Factorise:<div class="big">${prompt}</div>`,
    answer: exprA(`(${inner})(${other})`, 'factorised'),
    hint: `Both terms have the common factor (${ex(inner)}). Take it out like a single term.`,
    steps: [`The common factor is (${ex(inner)}).`, `= (${ex(inner)})(${ex(other)})`],
  })
}

const alg_binomial = (level: Level): Question => {
  const x = letter()
  if (level <= 2) {
    const a = L(level, int(1, 9), nonZero(-9, 9), 0)
    const b = L(level, int(1, 9), nonZero(-9, 9), 0)
    if (level === 2 && a > 0 && b > 0) return alg_binomial(2)
    const res = terms([
      [1, `${x}^2`],
      [a + b, x],
      [a * b, ''],
    ])
    return q({
      prompt: `Expand and simplify:<div class="big">(${ex(terms([[1, x], [a, '']]))})(${ex(terms([[1, x], [b, '']]))})</div>`,
      answer: exprA(res, 'expanded'),
      hint: 'Multiply each term in the first bracket by each term in the second (FOIL: firsts, outers, inners, lasts).',
      steps: [`= ${ex(terms([[1, `${x}^2`], [b, x], [a, x], [a * b, '']]))}`, `Collect like terms: ${ex(res)}`],
    })
  }
  const t = pick(['general', 'square', 'diff'])
  if (t === 'square') {
    const a = nonZero(-9, 9)
    const res = terms([
      [1, `${x}^2`],
      [2 * a, x],
      [a * a, ''],
    ])
    return q({
      prompt: `Expand and simplify:<div class="big">(${ex(terms([[1, x], [a, '']]))})<sup>2</sup></div>`,
      answer: exprA(res, 'expanded'),
      hint: `(${ex(terms([[1, x], [a, '']]))})² = (${ex(terms([[1, x], [a, '']]))})(${ex(terms([[1, x], [a, '']]))}). Do not just square each term.`,
      steps: [`= (${ex(terms([[1, x], [a, '']]))})(${ex(terms([[1, x], [a, '']]))})`, `= ${ex(`${x}^2`)} ${a < 0 ? MINUS : '+'} ${Math.abs(a)}${v(x)} ${a < 0 ? MINUS : '+'} ${Math.abs(a)}${v(x)} + ${a * a}`, `= ${ex(res)}`],
    })
  }
  if (t === 'diff') {
    const a = int(1, 9)
    const c = int(1, 4)
    const res = terms([
      [c * c, `${x}^2`],
      [-a * a, ''],
    ])
    return q({
      prompt: `Expand and simplify:<div class="big">(${ex(terms([[c, x], [a, '']]))})(${ex(terms([[c, x], [-a, '']]))})</div>`,
      answer: exprA(res, 'expanded'),
      hint: 'The middle terms cancel out.',
      steps: [`= ${ex(coef(c * c, `${x}^2`))} ${MINUS} ${ex(coef(a * c, x))} + ${ex(coef(a * c, x))} ${MINUS} ${a * a}`, `= ${ex(res)}`],
    })
  }
  const a = int(2, 5)
  const b = nonZero(-7, 7)
  const c = int(1, 4)
  const d = nonZero(-7, 7)
  const res = terms([
    [a * c, `${x}^2`],
    [a * d + b * c, x],
    [b * d, ''],
  ])
  return q({
    prompt: `Expand and simplify:<div class="big">(${ex(terms([[a, x], [b, '']]))})(${ex(terms([[c, x], [d, '']]))})</div>`,
    answer: exprA(res, 'expanded'),
    hint: 'Multiply every term in the first bracket by every term in the second.',
    steps: [`Firsts: ${ex(coef(a, x))} ${TIMES} ${ex(coef(c, x))} = ${ex(coef(a * c, `${x}^2`))}`, `Outers + inners: ${ex(coef(a, x))} ${TIMES} ${bnum(d)} + ${bnum(b)} ${TIMES} ${ex(coef(c, x))} = ${ex(coef(a * d + b * c, x))}`, `Lasts: ${bnum(b)} ${TIMES} ${bnum(d)} = ${num(b * d)}`, `= ${ex(res)}`],
  })
}

// ------------------------------------------------------------------ Indices and numbers of any magnitude

const ind_laws = (level: Level): Question => {
  const b = letter()
  if (level === 1) {
    const m = int(2, 4)
    const n = int(2, 3)
    const p = int(1, 6)
    const r = int(1, 8)
    const e = m * n + p - r
    if (e < 1) return ind_laws(1)
    return q({
      prompt: `Simplify:<div class="big">${frac(`(${ex(`${b}^${m}`)})<sup>${n}</sup> ${TIMES} ${ex(p === 1 ? b : `${b}^${p}`)}`, ex(r === 1 ? b : `${b}^${r}`))}</div>`,
      answer: exprA(e === 1 ? b : `${b}^${e}`, 'singlePower'),
      hint: 'Power of a power: multiply indices. Multiplying: add. Dividing: subtract.',
      steps: [`(${ex(`${b}^${m}`)})<sup>${n}</sup> = ${ex(`${b}^${m * n}`)}`, `${ex(`${b}^${m * n}`)} ${TIMES} ${ex(p === 1 ? b : `${b}^${p}`)} = ${ex(`${b}^${m * n + p}`)}`, `${ex(`${b}^${m * n + p}`)} ${DIVIDE} ${ex(r === 1 ? b : `${b}^${r}`)} = ${ex(e === 1 ? b : `${b}^${e}`)}`],
    })
  }
  const [p, r] = sample(['a', 'b', 'x', 'y', 'm', 'n'], 2).sort()
  if (level === 2) {
    const A = int(2, 4)
    const m = int(1, 4)
    const k = int(1, 3)
    const n = 2
    const B = int(2, 5)
    const s1 = int(1, 3)
    const s2 = int(1, 4)
    const C = A * A * B
    const res = `${C}${p}^${m * n + s1}${r}^${k * n + s2}`
    return q({
      prompt: `Simplify:<div class="big">(${ex(`${A}${m === 1 ? p : `${p}^${m}`}${k === 1 ? r : `${r}^${k}`}`)})<sup>2</sup> ${TIMES} ${ex(`${B}${s1 === 1 ? p : `${p}^${s1}`}${s2 === 1 ? r : `${r}^${s2}`}`)}</div>`,
      answer: exprA(res, 'singlePower'),
      hint: 'Square everything in the brackets first (including the number), then multiply.',
      steps: [`(${ex(`${A}${m === 1 ? p : `${p}^${m}`}${k === 1 ? r : `${r}^${k}`}`)})<sup>2</sup> = ${ex(`${A * A}${p}^${2 * m}${r}^${2 * k}`)}`, `${ex(`${A * A}${p}^${2 * m}${r}^${2 * k}`)} ${TIMES} ${ex(`${B}${s1 === 1 ? p : `${p}^${s1}`}${s2 === 1 ? r : `${r}^${s2}`}`)} = ${ex(res)}`],
    })
  }
  const A = int(2, 3)
  const m = int(2, 4)
  const k = int(1, 3)
  const n = pick([2, 3])
  const res = `${Math.pow(A, n)}${p}^${m * n}/${r}^${k * n}`
  return q({
    prompt: `Simplify:<div class="big">(${frac(ex(`${A}${p}^${m}`), ex(k === 1 ? r : `${r}^${k}`))})<sup>${n}</sup></div>`,
    answer: exprA(res, 'simplified'),
    hint: 'Raise the numerator and the denominator to the power.',
    steps: [`= ${frac(`${A}<sup>${n}</sup>(${ex(`${p}^${m}`)})<sup>${n}</sup>`, `(${ex(k === 1 ? r : `${r}^${k}`)})<sup>${n}</sup>`)}`, `= ${frac(ex(`${Math.pow(A, n)}${p}^${m * n}`), ex(`${r}^${k * n}`))}`],
  })
}

const ind_neg = (level: Level): Question => {
  if (level === 1) {
    const [b, e] = pick([[2, 3], [2, 1], [3, 2], [5, 1], [10, 2], [4, 2], [10, 3], [2, 4], [6, 1], [3, 3]] as [number, number][])
    return q({
      prompt: `Evaluate, as a fraction:<div class="big">${b}<sup>${MINUS}${e}</sup></div>`,
      answer: fracA(1, Math.pow(b, e), { allowDecimal: true }),
      hint: `A negative index means “one over”: ${b}<sup>${MINUS}${e}</sup> = 1 ÷ ${b}<sup>${e}</sup>.`,
      steps: [`${b}<sup>${MINUS}${e}</sup> = ${frac(1, `${b}<sup>${e}</sup>`)}`, `= ${frac(1, Math.pow(b, e))}`],
    })
  }
  const x = letter()
  if (level === 2) {
    const A = pick([1, 2, 3, 5, 7])
    const e = int(1, 6)
    return q({
      prompt: `Write with a positive index:<div class="big">${A === 1 ? '' : A}${ex(x)}<sup>${MINUS}${e}</sup></div>`,
      answer: exprA(e === 1 ? `${A}/${x}` : `${A}/${x}^${e}`, 'positiveIndices'),
      hint: `Only ${v(x)} has the negative index, so only ${v(x)} moves to the denominator.`,
      steps: [`${ex(x)}<sup>${MINUS}${e}</sup> = ${frac(1, ex(e === 1 ? x : `${x}^${e}`))}`, `So the answer is ${frac(A, ex(e === 1 ? x : `${x}^${e}`))}`],
    })
  }
  if (chance()) {
    const A = int(2, 9)
    const m = int(1, 4)
    const n = int(m + 2, m + 7)
    const e = n - m
    return q({
      prompt: `Simplify, writing your answer with positive indices:<div class="big">${ex(`${A}${x}^${m}`)} ${TIMES} ${ex(x)}<sup>${MINUS}${n}</sup></div>`,
      answer: exprA(e === 1 ? `${A}/${x}` : `${A}/${x}^${e}`, 'positiveIndices'),
      hint: `Add the indices: ${m} + (${MINUS}${n}).`,
      steps: [`${m} + (${MINUS}${n}) = ${MINUS}${e}`, `= ${A}${ex(x)}<sup>${MINUS}${e}</sup> = ${frac(A, ex(e === 1 ? x : `${x}^${e}`))}`],
    })
  }
  const [a, b] = pick([[2, 3], [3, 4], [1, 2], [2, 5], [3, 2], [4, 5]] as [number, number][])
  const e = pick([1, 2])
  return q({
    prompt: `Evaluate:<div class="big">(${frac(a, b)})<sup>${MINUS}${e}</sup></div>`,
    answer: fracA(Math.pow(b, e), Math.pow(a, e), { allowDecimal: true }),
    hint: 'A negative index flips the fraction: (a/b)<sup>−n</sup> = (b/a)<sup>n</sup>.',
    steps: [`(${frac(a, b)})<sup>${MINUS}${e}</sup> = (${frac(b, a)})<sup>${e}</sup>`, `= ${frac(Math.pow(b, e), Math.pow(a, e))}`],
  })
}

const SF_WORD = ['', 'one', 'two', 'three', 'four']

const num_sigfig = (level: Level): Question => {
  const sf = L(level, pick([1, 2]), pick([2, 3]), pick([2, 3, 4]))
  let x: number
  if (level === 1) x = int(1000, 99999) + (chance() ? 0 : int(1, 9) / 10)
  else if (level === 2) x = int(1001, 99999) / Math.pow(10, int(5, 7))
  else x = clean(int(101, 999) / int(7, 97))
  const r = roundSF(x, sf)
  if (level === 3) {
    const a = int(12, 99) / 10
    const b = int(2, 9) + int(1, 9) / 10
    const val = (a * a) / b
    const rr = roundSF(val, sf)
    return q({
      prompt: `Use a calculator to evaluate ${frac(`${num(a)}<sup>2</sup>`, num(b))}, correct to ${sf} significant figures.`,
      answer: numA(rr),
      calc: true,
      hint: 'Count significant figures from the first non-zero digit.',
      steps: [`${frac(`${num(a)}<sup>2</sup>`, num(b))} = ${num(Number(val.toPrecision(8)))}…`, `Correct to ${sf} significant figures: ${num(rr)}`],
    })
  }
  const digits = x.toPrecision(15).replace(/[-.]/g, '').replace(/^0+/, '')
  const next = Number(digits[sf])
  return q({
    prompt: `Round ${num(x)} correct to ${sf} significant figure${sf > 1 ? 's' : ''}.`,
    answer: numA(r),
    hint: 'Start counting at the first non-zero digit. Leading zeros are not significant.',
    steps: [`Counting from the first non-zero digit, the ${sf === 1 ? 'first significant figure is' : SF_WORD[sf] + ' significant figures are'} ${digits.slice(0, sf).split('').join(', ')}.`, `The next digit is ${next}, so round ${next >= 5 ? 'up' : 'down'}.`, `${num(x)} ≈ ${num(r)}`],
  })
}

function sciParts(v0: number): [number, number] {
  const n = Math.floor(Math.log10(Math.abs(v0)))
  return [Number((v0 / Math.pow(10, n)).toPrecision(10)), n]
}
const sciHtml = (v0: number) => {
  const [m, n] = sciParts(v0)
  return `${num(m)} ${TIMES} 10<sup>${n < 0 ? MINUS + -n : n}</sup>`
}

const num_sci = (level: Level): Question => {
  if (level === 1) {
    const m = int(11, 99) / 10
    const n = int(3, 9)
    const val = clean(m * Math.pow(10, n))
    return q({
      prompt: `Write ${num(val)} in scientific notation.`,
      answer: { kind: 'sci', value: val },
      hint: 'Move the decimal point so there is one non-zero digit in front of it. Count the places moved: that is the power of 10. Type it like 3.2 × 10^5.',
      steps: [`Move the decimal point ${n} places to the left.`, `${num(val)} = ${sciHtml(val)}`],
    })
  }
  if (level === 2) {
    const m = int(11, 99) / 10
    const n = -int(2, 7)
    const val = clean(m * Math.pow(10, n))
    if (chance()) {
      return q({
        prompt: `Write ${num(val)} in scientific notation.`,
        answer: { kind: 'sci', value: val },
        hint: 'For small numbers the power of 10 is negative. Type it like 4.07 × 10^-3.',
        steps: [`Move the decimal point ${-n} places to the right.`, `${num(val)} = ${sciHtml(val)}`],
      })
    }
    return q({
      prompt: `Write ${sciHtml(val)} as a decimal number.`,
      answer: numA(val),
      hint: `A power of 10<sup>${MINUS}${-n}</sup> means divide by 10 ${-n} times: move the decimal point ${-n} places to the left.`,
      steps: [`Move the decimal point ${-n} places left: ${num(val)}`],
    })
  }
  const a = int(11, 99) / 10
  const b = int(11, 99) / 10
  const m = int(2, 8)
  const n = pick([int(2, 6), -int(2, 6)])
  const op = pick(['*', '/'])
  const val = op === '*' ? a * Math.pow(10, m) * b * Math.pow(10, n) : (a * Math.pow(10, m)) / (b * Math.pow(10, n))
  const r = roundSF(val, 3)
  return q({
    prompt: `Evaluate, giving your answer in scientific notation correct to 3 significant figures:<div class="big">(${sciHtml(a * Math.pow(10, m))}) ${op === '*' ? TIMES : DIVIDE} (${sciHtml(b * Math.pow(10, n))})</div>`,
    answer: { kind: 'sci', value: r },
    calc: true,
    hint: 'Use the ×10ˣ (or EXP) key on your calculator.',
    steps: [`= ${num(Number(val.toPrecision(8)))}…`, `≈ ${sciHtml(r)}`],
  })
}

// ------------------------------------------------------------------ Equations

const eq_frac = (level: Level): Question => {
  const x = pick(['x', 'a', 'm', 'n', 'y', 'k'])
  if (level === 1) {
    const [p, r] = sample([2, 3, 4, 5, 6], 2)
    const Ld = lcm(p, r)
    const s = Ld * nonZero(-4, 6)
    const rhs = s / p + s / r
    return q({
      prompt: `Solve:<div class="big">${frac(v(x), p)} + ${frac(v(x), r)} = ${num(rhs)}</div>`,
      answer: numA(s),
      prefix: `${v(x)} =`,
      hint: `Multiply every term by ${Ld}.`,
      steps: [`Multiply every term by ${Ld}: ${Ld / p}${v(x)} + ${Ld / r}${v(x)} = ${num(rhs * Ld)}`, `${Ld / p + Ld / r}${v(x)} = ${num(rhs * Ld)}`, `${v(x)} = ${num(s)}`],
    })
  }
  if (level === 2) {
    const [p, r] = sample([2, 3, 4, 5, 6, 7], 2)
    const a = nonZero(-6, 6)
    const b = nonZero(-6, 6)
    // (x + a)/p = (x + b)/r  → r(x + a) = p(x + b) → (r - p)x = pb - ra
    if (r === p) return eq_frac(2)
    const num_ = p * b - r * a
    if (num_ % (r - p) !== 0) return eq_frac(2)
    const s = num_ / (r - p)
    return q({
      prompt: `Solve:<div class="big">${frac(ex(terms([[1, x], [a, '']])), p)} = ${frac(ex(terms([[1, x], [b, '']])), r)}</div>`,
      answer: numA(s),
      prefix: `${v(x)} =`,
      hint: `Cross-multiply: ${r}(${ex(terms([[1, x], [a, '']]))}) = ${p}(${ex(terms([[1, x], [b, '']]))}).`,
      steps: [`${r}(${ex(terms([[1, x], [a, '']]))}) = ${p}(${ex(terms([[1, x], [b, '']]))})`, `${ex(terms([[r, x], [r * a, '']]))} = ${ex(terms([[p, x], [p * b, '']]))}`, `${ex(coef(r - p, x))} = ${num(num_)}`, `${v(x)} = ${num(s)}`],
    })
  }
  const [p, r] = sample([2, 3, 4, 5], 2)
  const Ld = lcm(p, r)
  const a = int(1, 3)
  const b = nonZero(-5, 5)
  const c = nonZero(-5, 5)
  const s = nonZero(-8, 8)
  // (a x + b)/p − (x + c)/r = R
  const R = (a * s + b) / p - (s + c) / r
  if (!Number.isInteger(R)) return eq_frac(3)
  const k1 = Ld / p
  const k2 = Ld / r
  return q({
    prompt: `Solve:<div class="big">${frac(ex(terms([[a, x], [b, '']])), p)} ${MINUS} ${frac(ex(terms([[1, x], [c, '']])), r)} = ${num(R)}</div>`,
    answer: numA(s),
    prefix: `${v(x)} =`,
    hint: `Multiply every term by ${Ld}. Put brackets around each numerator.`,
    steps: [`${k1}(${ex(terms([[a, x], [b, '']]))}) ${MINUS} ${k2}(${ex(terms([[1, x], [c, '']]))}) = ${num(R * Ld)}`, `${ex(terms([[k1 * a, x], [k1 * b, ''], [-k2, x], [-k2 * c, '']]))} = ${num(R * Ld)}`, `${ex(terms([[k1 * a - k2, x], [k1 * b - k2 * c, '']]))} = ${num(R * Ld)}`, `${v(x)} = ${num(s)}`],
  })
}

const eq_brackets = (level: Level): Question => {
  const x = pick(['x', 'a', 'm', 'n', 'y', 'k'])
  const a = int(2, 6)
  const b = nonZero(-6, 6)
  const c = int(2, 6)
  const d = nonZero(-6, 6)
  const p = int(1, 4)
  if (level === 1 || level === 2) {
    // a(px + b) = c(x + d)  → (ap − c)x = cd − ab
    const k = a * p - c
    if (k === 0) return eq_brackets(level)
    const rhs = c * d - a * b
    if (level === 1 && rhs % k !== 0) return eq_brackets(1)
    const s = rhs / k
    if (level === 2 && (Number.isInteger(s) || !Number.isInteger(s * 12))) return eq_brackets(2)
    return q({
      prompt: `Solve${level === 2 ? ', giving your answer as a fraction if needed' : ''}:<div class="big">${a}(${ex(terms([[p, x], [b, '']]))}) = ${c}(${ex(terms([[1, x], [d, '']]))})</div>`,
      answer: level === 1 ? numA(s) : fracA(rhs, k, { allowDecimal: true }),
      prefix: `${v(x)} =`,
      hint: 'Expand both sides, then collect the pronumeral terms on one side.',
      steps: [`${ex(terms([[a * p, x], [a * b, '']]))} = ${ex(terms([[c, x], [c * d, '']]))}`, `${ex(coef(k, x))} = ${num(rhs)}`, `${v(x)} = ${level === 1 ? num(s) : fracS(rhs, k)}`],
    })
  }
  // e − f(x − g) = h(x + i)
  const e = int(5, 20)
  const f = int(2, 5)
  const g = nonZero(-5, 5)
  const h = int(2, 5)
  const i = nonZero(-5, 5)
  const k = -f - h
  const rhs = h * i - e - f * g
  if (rhs % k !== 0) return eq_brackets(3)
  const s = rhs / k
  return q({
    prompt: `Solve:<div class="big">${e} ${MINUS} ${f}(${ex(terms([[1, x], [-g, '']]))}) = ${h}(${ex(terms([[1, x], [i, '']]))})</div>`,
    answer: numA(s),
    prefix: `${v(x)} =`,
    hint: `Expand carefully: ${MINUS}${f} multiplies both terms in its bracket.`,
    steps: [`${ex(terms([[-f, x], [e + f * g, '']]))} = ${ex(terms([[h, x], [h * i, '']]))}`, `${ex(coef(-f - h, x))} = ${num(h * i - e - f * g)}`, `${v(x)} = ${num(s)}`],
  })
}

const eq_quad = (level: Level): Question => {
  const x = pick(['x', 'a', 'm', 'n', 'y', 'p'])
  if (level === 1) {
    const r = int(1, 15)
    return q({
      prompt: `Solve:<div class="big">${ex(`${x}^2`)} = ${r * r}</div>`,
      answer: { kind: 'nums', values: [r, -r] },
      prefix: `${v(x)} =`,
      hint: 'There are two solutions: a positive and a negative square root. Type them like ±7 or 7, −7.',
      steps: [`${v(x)} = ±${sqrt(r * r)}`, `${v(x)} = ±${r}`],
    })
  }
  if (level === 2) {
    if (chance()) {
      const a = int(2, 5)
      const r = int(1, 10)
      return q({
        prompt: `Solve:<div class="big">${a}${ex(`${x}^2`)} = ${a * r * r}</div>`,
        answer: { kind: 'nums', values: [r, -r] },
        prefix: `${v(x)} =`,
        hint: `Divide both sides by ${a} first.`,
        steps: [`${ex(`${x}^2`)} = ${r * r}`, `${v(x)} = ±${r}`],
      })
    }
    const c = nonZero(-20, 30)
    const r = int(1, 10)
    return q({
      prompt: `Solve:<div class="big">${ex(`${x}^2`)} ${c < 0 ? MINUS : '+'} ${Math.abs(c)} = ${r * r + c}</div>`,
      answer: { kind: 'nums', values: [r, -r] },
      prefix: `${v(x)} =`,
      hint: `${c < 0 ? 'Add' : 'Subtract'} ${Math.abs(c)} first.`,
      steps: [`${ex(`${x}^2`)} = ${r * r}`, `${v(x)} = ±${r}`],
    })
  }
  const k = pick([2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 15, 17, 20, 24, 30])
  const rt = Math.sqrt(k)
  return q({
    prompt: `Solve, giving your answers correct to 2 decimal places:<div class="big">${ex(`${x}^2`)} = ${k}</div>`,
    answer: { kind: 'nums', values: [rt, -rt], dp: 2 },
    prefix: `${v(x)} =`,
    calc: true,
    hint: 'Take the square root of both sides. Remember the negative solution.',
    steps: [`${v(x)} = ±${sqrt(k)}`, `${v(x)} ≈ ±${num(round(rt, 2), 2)}`],
  })
}

const eq_formula = (level: Level): Question => {
  if (level === 1) {
    if (chance()) {
      const M = int(45, 110)
      const h = int(150, 195) / 100
      const B = M / (h * h)
      return q({
        prompt: `The body mass index of an adult is ${ex('B = frac{M}{h^2}')}, where ${v('M')} is mass in kg and ${v('h')} is height in m. Find ${v('B')} for an adult with mass ${M} kg and height ${num(h)} m, correct to 1 decimal place.`,
        answer: numA(B, 1),
        calc: true,
        hint: 'Square the height first, then divide.',
        steps: [`${v('h')}<sup>2</sup> = ${num(h)}<sup>2</sup> = ${num(clean(h * h))}`, `${v('B')} = ${M} ${DIVIDE} ${num(clean(h * h))} ≈ ${num(round(B, 1), 1)}`],
      })
    }
    const d = int(3, 40)
    return q({
      prompt: `The cost, ${v('C')} dollars, of a taxi ride is ${ex('C = 5 + 2.4d')}, where ${v('d')} is the distance in km. Find the cost of a ${d} km ride.`,
      answer: numA(clean(5 + 2.4 * d), 2),
      prefix: '$',
      hint: 'Substitute d, multiply, then add.',
      steps: [`${v('C')} = 5 + 2.4 ${TIMES} ${d} = 5 + ${num(clean(2.4 * d))} = ${money(5 + 2.4 * d)}`],
    })
  }
  if (level === 2) {
    const d = int(3, 40)
    const C = clean(5 + 2.4 * d)
    return q({
      prompt: `A taxi fare is given by ${ex('C = 5 + 2.4d')}. ${name()} paid ${money(C)}. How far did they travel?`,
      answer: numA(d),
      suffix: 'km',
      hint: 'Substitute C and solve the equation for d.',
      steps: [`${num(C)} = 5 + 2.4${v('d')}`, `${num(clean(C - 5))} = 2.4${v('d')}`, `${v('d')} = ${num(clean(C - 5))} ${DIVIDE} 2.4 = ${d} km`],
    })
  }
  const t = pick([
    ['y = mx + c', 'x', '(y - c)/m', [`Subtract ${v('c')} from both sides: ${ex('y - c = mx')}`, `Divide both sides by ${v('m')}.`]],
    ['C = 5 + 2.4d', 'd', '(C - 5)/2.4', [`Subtract 5 from both sides: ${ex('C - 5 = 2.4d')}`, 'Divide both sides by 2.4.']],
    ['v = u + at', 'a', '(v - u)/t', [`Subtract ${v('u')} from both sides: ${ex('v - u = at')}`, `Divide both sides by ${v('t')}.`]],
    ['P = 2l + 2w', 'w', '(P - 2l)/2', [`Subtract 2${v('l')} from both sides: ${ex('P - 2l = 2w')}`, 'Divide both sides by 2.']],
    ['A = frac{1}{2}bh', 'h', '2A/b', [`Multiply both sides by 2: ${ex('2A = bh')}`, `Divide both sides by ${v('b')}.`]],
    ['S = frac{D}{T}', 'D', 'ST', [`Multiply both sides by ${v('T')}.`]],
  ] as [string, string, string, string[]][])
  const shown = t[2].includes('/') ? ex(t[2].replace(/^\(([^)]+)\)\/(.+)$/, 'frac{$1}{$2}').replace(/^(\w+)\/(\w+)$/, 'frac{$1}{$2}')) : ex(t[2])
  return q({
    prompt: `Make ${v(t[1])} the subject of the formula ${ex(t[0])}.`,
    answer: exprA(t[2]),
    prefix: `${v(t[1])} =`,
    hint: `Undo the operations around ${v(t[1])} in reverse order, doing the same thing to both sides.`,
    steps: [...t[3], `${v(t[1])} = ${shown}`],
  })
}

// ------------------------------------------------------------------ Financial mathematics

const fin_wages = (level: Level): Question => {
  if (level === 1) {
    const sal = int(450, 1200) * 100 + pick([0, 10, 50, 90])
    const [per, div] = pick([
      ['week', 52],
      ['fortnight', 26],
      ['month', 12],
    ] as [string, number][])
    return q({
      prompt: `${name()} earns an annual salary of $${num(sal)}. How much is this per ${per}? Give your answer to the nearest cent.`,
      answer: numA(round(sal / div, 2), 2),
      prefix: '$',
      calc: true,
      hint: `There are ${div} ${per}s in a year.`,
      steps: [`$${num(sal)} ${DIVIDE} ${div} ${approx(sal / div, 2).replace(/^([=≈]) /, '$1 $')}`],
    })
  }
  if (level === 2) {
    const rate = int(1650, 4500) / 100
    const hours = pick([15, 20, 25, 30, 35, 38])
    return q({
      prompt: `A ${pick(['chef', 'nurse', 'apprentice electrician', 'lifeguard', 'barista'])} is paid ${money(rate)} per hour and works ${hours} hours a week. Find the weekly pay.`,
      answer: numA(round(rate * hours, 2), 2),
      prefix: '$',
      calc: true,
      hint: 'Weekly pay = hourly rate × hours worked.',
      steps: [`${money(rate)} ${TIMES} ${hours} = ${money(rate * hours)}`],
    })
  }
  const gross = int(900, 2400) + int(0, 99) / 100
  const tax = round(gross * pick([0.12, 0.15, 0.18, 0.21]), 2)
  const union = pick([12.5, 15.2, 18.75, 0])
  const health = pick([24.6, 31.4, 45.9])
  const net = round(gross - tax - union - health, 2)
  return q({
    prompt: `Raj’s gross pay for a fortnight is ${money(gross)}. The deductions are: PAYG tax ${money(tax)}, health insurance ${money(health)}${union ? ` and union fees ${money(union)}` : ''}. What is Raj’s net pay?`,
    answer: numA(net, 2),
    prefix: '$',
    calc: true,
    hint: 'Net pay = gross pay − all deductions.',
    steps: [`Deductions: ${money(tax)} + ${money(health)}${union ? ' + ' + money(union) : ''} = ${money(tax + health + union)}`, `Net pay = ${money(gross)} ${MINUS} ${money(tax + health + union)} = ${money(net)}`],
  })
}

const fin_overtime = (level: Level): Question => {
  const rate = int(2200, 4200) / 100
  if (level === 1) {
    const h = int(2, 8)
    const kind = pick(['time-and-a-half', 'double time'])
    const f = kind === 'double time' ? 2 : 1.5
    return q({
      prompt: `Kai is paid ${money(rate)} per hour. How much is Kai paid for ${h} hours of overtime at ${kind}?`,
      answer: numA(round(rate * f * h, 2), 2),
      prefix: '$',
      calc: true,
      hint: `${kind === 'double time' ? 'Double time means 2 × the normal rate.' : 'Time-and-a-half means 1.5 × the normal rate.'}`,
      steps: [`Overtime rate: ${money(rate)} ${TIMES} ${f} = ${money(rate * f)} per hour`, `${h} hours: ${money(rate * f)} ${TIMES} ${h} = ${money(rate * f * h)}`],
    })
  }
  if (level === 2) {
    const normal = pick([35, 36, 38])
    const ot1 = int(2, 6)
    const ot2 = pick([0, 2, 3])
    const total = rate * normal + rate * 1.5 * ot1 + rate * 2 * ot2
    return q({
      prompt: `Riley works ${normal} hours at ${money(rate)} per hour, plus ${ot1} hours of overtime at time-and-a-half${ot2 ? ` and ${ot2} hours at double time` : ''}. Calculate Riley’s total pay for the week.`,
      answer: numA(round(total, 2), 2),
      prefix: '$',
      calc: true,
      hint: 'Work out each part of the pay separately, then add.',
      steps: [`Normal: ${normal} ${TIMES} ${money(rate)} = ${money(normal * rate)}`, `Time-and-a-half: ${ot1} ${TIMES} 1.5 ${TIMES} ${money(rate)} = ${money(ot1 * 1.5 * rate)}`, ...(ot2 ? [`Double time: ${ot2} ${TIMES} 2 ${TIMES} ${money(rate)} = ${money(ot2 * 2 * rate)}`] : []), `Total = ${money(total)}`],
    })
  }
  const weekly = int(1100, 2200)
  const loading = weekly * 4 * 0.175
  return q({
    prompt: `Zoe earns $${num(weekly)} per week. For 4 weeks of annual leave, Zoe is paid the normal 4 weeks’ pay plus a 17.5% holiday loading on that amount. What is Zoe’s total holiday pay?`,
    answer: numA(round(weekly * 4 + loading, 2), 2),
    prefix: '$',
    calc: true,
    hint: 'Find 4 weeks’ pay, then add 17.5% of it.',
    steps: [`4 weeks’ pay: 4 ${TIMES} $${num(weekly)} = $${num(weekly * 4)}`, `Loading: 17.5% ${TIMES} $${num(weekly * 4)} = ${money(loading)}`, `Total = ${money(weekly * 4 + loading)}`],
  })
}

const fin_commission = (level: Level): Question => {
  if (level === 1) {
    const p = pick([2, 3, 4, 5, 2.5, 1.5])
    const sales = int(80, 900) * 100
    return q({
      prompt: `A real estate agent earns ${num(p)}% commission on sales. How much commission is earned on a sale of $${num(sales)}?`,
      answer: numA(round((p / 100) * sales, 2), 2),
      prefix: '$',
      calc: true,
      hint: `Commission = ${num(p)}% of the sales.`,
      steps: [`${num(p / 100)} ${TIMES} $${num(sales)} = ${money((p / 100) * sales)}`],
    })
  }
  if (level === 2) {
    if (chance()) {
      const ret = pick([300, 400, 450, 500])
      const p = pick([3, 4, 5, 6])
      const sales = int(40, 300) * 100
      return q({
        prompt: `Nikky is paid a retainer of $${ret} per week plus ${p}% commission on sales. Find Nikky’s pay in a week with $${num(sales)} worth of sales.`,
        answer: numA(ret + (p / 100) * sales, 2),
        prefix: '$',
        calc: true,
        hint: 'Pay = retainer + commission.',
        steps: [`Commission: ${p}% of $${num(sales)} = ${money((p / 100) * sales)}`, `Pay = $${ret} + ${money((p / 100) * sales)} = ${money(ret + (p / 100) * sales)}`],
      })
    }
    const per = pick([0.35, 0.45, 0.6, 1.2, 2.5])
    const n = int(150, 900)
    return q({
      prompt: `A fruit picker is paid ${money(per)} per crate picked (piecework). How much is earned for picking ${n} crates?`,
      answer: numA(round(per * n, 2), 2),
      prefix: '$',
      calc: true,
      hint: 'Multiply the rate per item by the number of items.',
      steps: [`${money(per)} ${TIMES} ${n} = ${money(per * n)}`],
    })
  }
  const r1 = pick([3, 4, 5])
  const r2 = pick([1.5, 2, 2.5])
  const tier = 50000
  const sales = int(60, 200) * 1000
  const com = tier * (r1 / 100) + (sales - tier) * (r2 / 100)
  return q({
    prompt: `Sam is paid commission of ${r1}% on the first $50 000 of sales and ${num(r2)}% on all sales over $50 000. How much commission does Sam earn on sales of $${num(sales)}?`,
    answer: numA(round(com, 2), 2),
    prefix: '$',
    calc: true,
    hint: 'Split the sales into two parts and use the right rate for each part.',
    steps: [`First $50 000: ${r1}% ${TIMES} $50 000 = $${num(tier * r1 / 100)}`, `Remaining $${num(sales - tier)}: ${num(r2)}% ${TIMES} $${num(sales - tier)} = ${money(((sales - tier) * r2) / 100)}`, `Total = ${money(com)}`],
  })
}

const fin_interest = (level: Level): Question => {
  const P = int(20, 300) * 100
  const r = pick([2, 2.5, 3, 3.5, 4, 4.5, 5, 6])
  if (level === 1) {
    const n = int(2, 8)
    const I = P * (r / 100) * n
    return q({
      prompt: `Find the simple interest earned on $${num(P)} invested at ${num(r)}% p.a. for ${n} years.`,
      answer: numA(round(I, 2), 2),
      prefix: '$',
      calc: true,
      hint: `I = Prn, where r is written as a decimal (${num(r)}% = ${num(r / 100)}) and n is in years.`,
      steps: [`I = ${num(P)} ${TIMES} ${num(r / 100)} ${TIMES} ${n}`, `= ${money(I)}`],
    })
  }
  if (level === 2) {
    const months = pick([6, 9, 18, 30, 15])
    const I = P * (r / 100) * (months / 12)
    return q({
      prompt: `$${num(P)} is borrowed at ${num(r)}% p.a. simple interest for ${months} months. What is the total amount to be repaid?`,
      answer: numA(round(P + I, 2), 2),
      prefix: '$',
      calc: true,
      hint: `Change months to years: ${months} months = ${frac(months, 12)} of a year. Then add the interest to the principal.`,
      steps: [`n = ${months} ${DIVIDE} 12 = ${num(months / 12)} years`, `I = ${num(P)} ${TIMES} ${num(r / 100)} ${TIMES} ${num(months / 12)} = ${money(I)}`, `Total = $${num(P)} + ${money(I)} = ${money(P + I)}`],
    })
  }
  const n = int(2, 6)
  const I = P * (r / 100) * n
  if (chance()) {
    return q({
      prompt: `An investment of $${num(P)} earns $${num(I)} simple interest in ${n} years. What is the annual interest rate?`,
      answer: numA(r),
      suffix: '% p.a.',
      calc: true,
      hint: 'Substitute into I = Prn and solve for r. Then write r as a percentage.',
      steps: [`${num(I)} = ${num(P)} ${TIMES} r ${TIMES} ${n}`, `r = ${num(I)} ${DIVIDE} ${num(P * n)} = ${num(r / 100)}`, `r = ${num(r)}% p.a.`],
    })
  }
  return q({
    prompt: `How much must be invested at ${num(r)}% p.a. simple interest to earn $${num(I)} interest in ${n} years?`,
    answer: numA(P),
    prefix: '$',
    calc: true,
    hint: 'Substitute into I = Prn and solve for P.',
    steps: [`${num(I)} = P ${TIMES} ${num(r / 100)} ${TIMES} ${n}`, `P = ${num(I)} ${DIVIDE} ${num(clean((r / 100) * n))} = $${num(P)}`],
  })
}

// ------------------------------------------------------------------ Topics

export const Y9A: Topic[] = [
  {
    id: 'y9-algebra',
    year: 9,
    title: 'Algebraic techniques',
    strand: 'Number and algebra',
    outcomes: ['MA5-ALG-C-01'],
    blurb: 'Algebraic fractions, expanding and factorising, and binomial products.',
    colour: 330,
    skills: [
      {
        id: 'y9-alg-frac-addsub',
        title: 'Adding and subtracting algebraic fractions',
        outcomes: ['MA5-ALG-C-01'],
        summary: 'Add and subtract algebraic fractions with numerical denominators.',
        learn: {
          intro: '<p>Algebraic fractions work just like number fractions: find a common denominator, then add or subtract the numerators.</p>',
          keyPoints: ['<i>x</i>/3 + <i>x</i>/4 = 4<i>x</i>/12 + 3<i>x</i>/12 = 7<i>x</i>/12', 'With binomial numerators, use brackets: (<i>x</i> + 1)/2 − (<i>x</i> − 3)/3 = [3(<i>x</i> + 1) − 2(<i>x</i> − 3)]/6', 'Type answers like 7x/12 or (5x - 3)/6.'],
        },
        gen: alg_frac_addsub,
        levels: { 1: 'Like numerators', 2: 'Different coefficients; subtraction', 3: 'Binomial numerators' },
      },
      {
        id: 'y9-alg-frac-muldiv',
        title: 'Multiplying and dividing algebraic fractions',
        outcomes: ['MA5-ALG-C-01'],
        summary: 'Multiply and divide algebraic fractions, cancelling common factors.',
        learn: {
          intro: '<p>Multiply numerators and denominators. To divide, multiply by the reciprocal. Cancel common factors (numbers and pronumerals).</p>',
          keyPoints: ['(2<i>x</i>/3) × (9/4) = 18<i>x</i>/12 = 3<i>x</i>/2', '(4<i>a</i>/5) ÷ (2<i>a</i>/15) = (4<i>a</i>/5) × (15/2<i>a</i>) = 6'],
        },
        gen: alg_frac_muldiv,
        levels: { 1: 'Multiply by a number fraction', 2: 'Divide; pronumerals cancel', 3: 'Two pronumerals' },
      },
      {
        id: 'y9-alg-expand-factor',
        title: 'Expanding and factorising',
        outcomes: ['MA5-ALG-C-01'],
        summary: 'Expand and simplify; factorise using common factors, including binomial factors.',
        learn: {
          intro: '<p>Expanding removes brackets; factorising puts them back by taking out the highest common factor.</p>',
          keyPoints: ['12 − 6(2<i>x</i> − 3) = 12 − 12<i>x</i> + 18 = 30 − 12<i>x</i>', '15<i>k</i> − 10<i>hk</i><sup>2</sup> = 5<i>k</i>(3 − 2<i>hk</i>)', 'A bracket can be a common factor: 3(<i>y</i> − 6) + <i>y</i>(<i>y</i> − 6) = (<i>y</i> − 6)(3 + <i>y</i>)'],
        },
        gen: alg_expand_factor,
        levels: { 1: 'Expand and simplify', 2: 'Factorise with negative or pronumeral HCFs', 3: 'Binomial common factors' },
      },
      {
        id: 'y9-alg-binomial',
        title: 'Binomial products',
        outcomes: ['MA5-ALG-C-01'],
        summary: 'Expand products of two binomials, including perfect squares.',
        learn: {
          intro: '<p>(<i>a</i> + <i>b</i>)(<i>c</i> + <i>d</i>) = <i>ac</i> + <i>ad</i> + <i>bc</i> + <i>bd</i>. Multiply each term in the first bracket by each term in the second.</p>',
          keyPoints: ['(<i>x</i> + 2)(<i>x</i> + 3) = <i>x</i><sup>2</sup> + 3<i>x</i> + 2<i>x</i> + 6 = <i>x</i><sup>2</sup> + 5<i>x</i> + 6', '(<i>x</i> + 3)<sup>2</sup> = <i>x</i><sup>2</sup> + 6<i>x</i> + 9 (not <i>x</i><sup>2</sup> + 9)', '(<i>x</i> + 4)(<i>x</i> − 4) = <i>x</i><sup>2</sup> − 16'],
        },
        gen: alg_binomial,
        levels: { 1: 'Positive terms', 2: 'Negative terms', 3: 'Coefficients, squares, difference of squares' },
      },
    ],
  },
  {
    id: 'y9-indices',
    year: 9,
    title: 'Indices and scientific notation',
    strand: 'Number and algebra',
    outcomes: ['MA5-IND-C-01', 'MA5-NUM-C-01'],
    blurb: 'Index laws, negative indices, significant figures and scientific notation.',
    colour: 265,
    skills: [
      {
        id: 'y9-ind-laws',
        title: 'Using the index laws',
        outcomes: ['MA5-IND-C-01'],
        summary: 'Simplify expressions using several index laws.',
        learn: {
          intro: '<p>Apply the index laws one step at a time.</p>',
          keyPoints: ['a<sup>m</sup> × a<sup>n</sup> = a<sup>m+n</sup>', 'a<sup>m</sup> ÷ a<sup>n</sup> = a<sup>m−n</sup>', '(a<sup>m</sup>)<sup>n</sup> = a<sup>mn</sup>', '(ab)<sup>n</sup> = a<sup>n</sup>b<sup>n</sup> and (a/b)<sup>n</sup> = a<sup>n</sup>/b<sup>n</sup>'],
        },
        gen: ind_laws,
        levels: { 1: 'One pronumeral', 2: 'Powers of products', 3: 'Powers of fractions' },
      },
      {
        id: 'y9-ind-neg',
        title: 'Negative indices',
        outcomes: ['MA5-IND-C-01'],
        summary: 'Evaluate and simplify expressions with negative indices.',
        learn: {
          intro: '<p>A negative index means a reciprocal: a<sup>−n</sup> = 1/a<sup>n</sup>.</p>',
          keyPoints: ['2<sup>−3</sup> = 1/2<sup>3</sup> = 1/8', '3<i>x</i><sup>−2</sup> = 3/<i>x</i><sup>2</sup> (only <i>x</i> moves)', '(2/3)<sup>−2</sup> = (3/2)<sup>2</sup> = 9/4'],
        },
        gen: ind_neg,
        levels: { 1: 'Evaluate', 2: 'Positive indices', 3: 'Simplify; fractions' },
      },
      {
        id: 'y9-num-sigfig',
        title: 'Significant figures',
        outcomes: ['MA5-NUM-C-01'],
        summary: 'Round numbers to a given number of significant figures.',
        learn: {
          intro: '<p>Significant figures are counted from the first non-zero digit.</p>',
          keyPoints: ['48 362 ≈ 48 000 (2 s.f.)', '0.004 567 ≈ 0.004 57 (3 s.f.) — the leading zeros are not significant', 'Zeros between non-zero digits are significant: 3.07 has 3 s.f.'],
        },
        gen: num_sigfig,
        levels: { 1: 'Large numbers', 2: 'Small decimals', 3: 'Calculations' },
      },
      {
        id: 'y9-num-sci',
        title: 'Scientific notation',
        outcomes: ['MA5-NUM-C-01'],
        summary: 'Write very large and very small numbers in scientific notation and calculate with them.',
        learn: {
          intro: '<p>Scientific notation writes a number as a × 10<sup>n</sup>, where 1 ≤ a &lt; 10.</p>',
          keyPoints: ['320 000 = 3.2 × 10<sup>5</sup>', '0.004 07 = 4.07 × 10<sup>−3</sup>', 'Use your calculator’s ×10ˣ (EXP) key.', 'Type answers like 3.2 × 10^5 or 4.07 × 10^-3.'],
        },
        gen: num_sci,
        levels: { 1: 'Large numbers', 2: 'Small numbers; back to decimals', 3: 'Calculations' },
      },
    ],
  },
  {
    id: 'y9-equations',
    year: 9,
    title: 'Equations',
    strand: 'Number and algebra',
    outcomes: ['MA5-EQU-C-01'],
    blurb: 'Equations with fractions and brackets, simple quadratics, and formulas.',
    colour: 285,
    skills: [
      {
        id: 'y9-eq-frac',
        title: 'Equations with fractions',
        outcomes: ['MA5-EQU-C-01'],
        summary: 'Solve linear equations with algebraic fractions.',
        learn: {
          intro: '<p>Clear the fractions by multiplying every term by the lowest common multiple of the denominators.</p>',
          keyPoints: ['<i>x</i>/3 + <i>x</i>/4 = 7 → × 12: 4<i>x</i> + 3<i>x</i> = 84 → <i>x</i> = 12', '(<i>x</i> + 1)/2 = (<i>x</i> − 3)/5 → cross-multiply: 5(<i>x</i> + 1) = 2(<i>x</i> − 3)'],
        },
        gen: eq_frac,
        levels: { 1: 'Two fractions', 2: 'Cross-multiplying', 3: 'Binomial numerators' },
      },
      {
        id: 'y9-eq-brackets',
        title: 'Equations with brackets on both sides',
        outcomes: ['MA5-EQU-C-01'],
        summary: 'Expand brackets and solve, including fractional answers.',
        learn: {
          intro: '<p>Expand, collect the pronumeral terms on one side and the numbers on the other, then divide.</p>',
          keyPoints: ['3(2<i>x</i> − 1) = 2(<i>x</i> + 5) → 6<i>x</i> − 3 = 2<i>x</i> + 10 → 4<i>x</i> = 13 → <i>x</i> = 13/4'],
        },
        gen: eq_brackets,
        levels: { 1: 'Whole-number answers', 2: 'Fraction answers', 3: 'Negative multipliers' },
      },
      {
        id: 'y9-eq-quad',
        title: 'Simple quadratic equations',
        outcomes: ['MA5-EQU-C-01'],
        summary: 'Solve equations of the form ax² = c.',
        learn: {
          intro: '<p>An equation like <i>x</i><sup>2</sup> = 49 has two solutions, because 7<sup>2</sup> = 49 and (−7)<sup>2</sup> = 49.</p>',
          keyPoints: ['<i>x</i><sup>2</sup> = 49 → <i>x</i> = ±7', 'Get <i>x</i><sup>2</sup> on its own first: 3<i>x</i><sup>2</sup> = 75 → <i>x</i><sup>2</sup> = 25 → <i>x</i> = ±5', 'Type both answers, e.g. ±5 or 5, −5.'],
        },
        gen: eq_quad,
        levels: { 1: 'x² = c', 2: 'ax² = c and x² + b = c', 3: 'Non-perfect squares' },
      },
      {
        id: 'y9-eq-formula',
        title: 'Formulas',
        outcomes: ['MA5-EQU-C-01', 'MA5-ALG-C-01'],
        summary: 'Substitute into formulas, solve for unknowns and change the subject.',
        learn: {
          intro: '<p>A formula is an equation connecting several variables. You can substitute, solve, or rearrange it.</p>',
          keyPoints: ['To change the subject, undo the operations around the new subject in reverse order.', 'v = u + at → a = (v − u)/t'],
        },
        gen: eq_formula,
        levels: { 1: 'Substitute', 2: 'Solve after substituting', 3: 'Change the subject' },
      },
    ],
  },
  {
    id: 'y9-finance',
    year: 9,
    title: 'Earning money and interest',
    strand: 'Number and algebra',
    outcomes: ['MA5-FIN-C-01'],
    blurb: 'Wages and salaries, overtime and leave loading, commission, and simple interest.',
    colour: 145,
    skills: [
      {
        id: 'y9-fin-wages',
        title: 'Wages and salaries',
        outcomes: ['MA5-FIN-C-01'],
        summary: 'Convert salaries between periods, calculate wages and net pay.',
        learn: {
          intro: '<p>A <b>salary</b> is a fixed amount per year. A <b>wage</b> is paid per hour worked.</p>',
          keyPoints: ['1 year = 52 weeks = 26 fortnights = 12 months', 'Gross pay − deductions = net pay'],
        },
        gen: fin_wages,
        levels: { 1: 'Salary conversions', 2: 'Hourly wages', 3: 'Net pay' },
      },
      {
        id: 'y9-fin-overtime',
        title: 'Overtime and leave loading',
        outcomes: ['MA5-FIN-C-01'],
        summary: 'Calculate overtime at time-and-a-half and double time, and holiday loading.',
        learn: {
          intro: '<p>Overtime is paid at a higher rate than normal time.</p>',
          keyPoints: ['Time-and-a-half: 1.5 × normal rate', 'Double time: 2 × normal rate', 'Annual leave loading is usually 17.5% of 4 weeks’ pay.'],
        },
        gen: fin_overtime,
        levels: { 1: 'Overtime only', 2: 'Normal plus overtime', 3: 'Holiday loading' },
      },
      {
        id: 'y9-fin-commission',
        title: 'Commission and piecework',
        outcomes: ['MA5-FIN-C-01'],
        summary: 'Calculate commission, retainers, sliding scales and piecework pay.',
        learn: {
          intro: '<p><b>Commission</b> is a percentage of sales. <b>Piecework</b> pays a set amount per item.</p>',
          keyPoints: ['Retainer + commission = total pay', 'Sliding scale: use each rate only on its part of the sales.'],
        },
        gen: fin_commission,
        levels: { 1: 'Commission', 2: 'Retainer; piecework', 3: 'Sliding scale' },
      },
      {
        id: 'y9-fin-interest',
        title: 'Simple interest',
        outcomes: ['MA5-FIN-C-01'],
        summary: 'Use I = Prn to calculate interest, rates and principals.',
        learn: {
          intro: '<p>Simple interest is calculated only on the original amount (the principal): I = P<i>rn</i>.</p>',
          keyPoints: ['P = principal, r = interest rate per year as a decimal, n = number of years', 'Months → years: divide by 12', 'Total amount = P + I'],
        },
        gen: fin_interest,
        levels: { 1: 'Find the interest', 2: 'Months; total amount', 3: 'Find the rate or principal' },
      },
    ],
  },
]

void D
void intExcept
void mcA
void mcFixedA
void signed
void pow
