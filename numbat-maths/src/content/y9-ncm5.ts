// Year 9 Indices, following New Century Maths 9 (3rd edition, Cengage) Chapter 5 exercise by exercise.
// The questions are the site's own: they practise the same kinds of question as each exercise, in the same
// easy-to-hard order (Foundation = the start of the exercise, Challenge = the end), but none of the textbook's
// wording or numbers are copied.
// Syllabus: index laws (5.01–5.06) are MA5-IND-C-01, which covers algebraic expressions with positive-integer and zero
// indices and negative indices with numerical bases. Negative indices with pronumerals (NCM's PATH parts of 5.05 and
// 5.06, and the negative-index parts of 5.01 and 5.02) are MA5-IND-P-01, so they are a separate extension skill, left
// out of the topic test. Significant figures and scientific notation (5.07–5.09) are MA5-MAG-C-01. Power plus is an
// extension.
import type { ExprForm, Level, Question, Skill, TestItem } from '@/lib/maths/types'
import { D, DIVIDE, MINUS, TIMES, chance, ex, exprA, frac, gcd, int, mcA, mcFixedA, num, numA, pick, q, random, sample, shuffle, sqrt, v } from './helpers'

const IND = ['MA5-IND-C-01']
const IND_P = ['MA5-IND-P-01']
const MAG = ['MA5-MAG-C-01']
const ref = (e: string) => `NCM 9 Ex ${e}`
const LET = ['a', 'b', 'c', 'd', 'g', 'h', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'u', 'w', 'x', 'y', 'z']
const big = (s: string) => `<div class="big">${s}</div>`

// ---------------------------------------------------------------- terms: a coefficient and powers of letters

interface Mono {
  c: number // coefficient (a whole number, possibly negative)
  v: Record<string, number> // letter → index
}
const mono = (c: number, v: Record<string, number> = {}): Mono => ({ c, v })
const sortedVars = (m: Mono) => Object.keys(m.v).filter((k) => m.v[k] !== 0).sort()
/** "12m^8", "-x", "18r^3t^4", "1" */
function asc(m: Mono, forDisplay = false): string {
  const vs = sortedVars(m)
  const body = vs.map((k) => (m.v[k] === 1 ? k : `${k}^${m.v[k] < 0 ? `(${m.v[k]})` : m.v[k]}`)).join(forDisplay ? '' : '*')
  if (!vs.length) return String(m.c)
  if (m.c === 1) return body
  if (m.c === -1) return '-' + body
  return `${m.c}${forDisplay ? '' : '*'}${body}`
}
const show = (m: Mono) => ex(asc(m, true))
const mul = (a: Mono, b: Mono): Mono => {
  const out: Record<string, number> = { ...a.v }
  for (const k in b.v) out[k] = (out[k] ?? 0) + b.v[k]
  return mono(a.c * b.c, out)
}
const powM = (a: Mono, n: number): Mono => {
  const out: Record<string, number> = {}
  for (const k in a.v) out[k] = a.v[k] * n
  return mono(a.c ** n, out)
}
/** a ÷ b as a fraction in lowest terms with positive indices: [numerator, denominator] */
function divide(a: Mono, b: Mono): [Mono, Mono] {
  const g = gcd(Math.abs(a.c), Math.abs(b.c)) || 1
  let top = a.c / g
  let bot = b.c / g
  if (bot < 0) {
    top = -top
    bot = -bot
  }
  const nv: Record<string, number> = {}
  const dv: Record<string, number> = {}
  const keys = new Set([...Object.keys(a.v), ...Object.keys(b.v)])
  for (const k of keys) {
    const e = (a.v[k] ?? 0) - (b.v[k] ?? 0)
    if (e > 0) nv[k] = e
    if (e < 0) dv[k] = -e
  }
  return [mono(top, nv), mono(bot, dv)]
}
const isOne = (m: Mono) => m.c === 1 && sortedVars(m).length === 0
/** a fraction as a parseable answer and as HTML */
/** brackets only where needed: 5/h^4 and 12y^2/5, but 12/(5y^2) */
function fracAsc([n, d]: [Mono, Mono]): string {
  if (isOne(d)) return asc(n, true)
  const top = asc(n, true)
  const bot = asc(d, true)
  const productBelow = sortedVars(d).length + (d.c !== 1 ? 1 : 0) > 1
  return `${/^-/.test(top) && sortedVars(n).length ? `(${top})` : top}/${productBelow ? `(${bot})` : bot}`
}
const fracShow = ([n, d]: [Mono, Mono]) => (isOne(d) ? show(n) : frac(show(n), show(d)))
/** the form an answer must be in: one term in index form, or a fraction in lowest terms */
const formFor = ([, d]: [Mono, Mono]): ExprForm => (isOne(d) ? 'singlePower' : 'lowestTerms')
const randMono = (letters: string[], cRange: [number, number] | null, eMax = 9): Mono => {
  const v0: Record<string, number> = {}
  for (const k of letters) v0[k] = int(1, eMax)
  return mono(cRange ? int(cRange[0], cRange[1]) : 1, v0)
}
/** numbers to powers written as they are: 5^12 */
const p = (b: number | string, e: number | string) => (e === 1 ? String(b) : `${b}<sup>${String(e).replace('-', MINUS)}</sup>`)
const pa = (b: number | string, e: number) => (e === 1 ? String(b) : `${b}^${e < 0 ? `(${e})` : e}`)
const LAWS = 'Multiplying: add the indices. Dividing: subtract them. Multiply (or divide) the numbers in front separately.'

// ================================================================= 5.01 Multiplying and dividing terms with the same base

function numMulDiv(): Question {
  const a = pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 12])
  const kind = pick(['mul', 'mul', 'bare', 'div', 'divFrac', 'mc'] as const)
  if (kind === 'mc') {
    const m = int(6, 15)
    const n = int(2, 5)
    const div = chance()
    const right = div ? m - n : m + n
    const opts = div ? [p(a, m + n), p(a, right), p(1, m - n), p(a, m * n)] : [p(a, m - n), p(a, right), p(a * a, m + n), p(a * a, m * n)]
    const uniq = Array.from(new Set(opts))
    if (uniq.length < 4 || uniq.filter((o) => o === p(a, right)).length !== 1) return numMulDiv()
    return q({
      prompt: `Which expression is equal to ${p(a, m)} ${div ? DIVIDE : TIMES} ${p(a, n)}?`,
      answer: mcFixedA(uniq, p(a, right)),
      hint: div ? 'Dividing powers of the same base: keep the base, subtract the indices.' : 'Multiplying powers of the same base: keep the base, add the indices.',
      steps: [`${p(a, m)} ${div ? DIVIDE : TIMES} ${p(a, n)} = ${a}<sup>${m} ${div ? '−' : '+'} ${n}</sup> = ${p(a, right)}`],
      meta: { t: 'expr', q: `${a}^${m}${div ? '/' : '*'}${a}^${n}`, mc: pa(a, right) },
    })
  }
  const m = int(2, 9)
  const n = kind === 'bare' ? 1 : int(2, kind === 'mul' ? 9 : m - 1)
  if ((kind === 'div' || kind === 'divFrac') && n >= m) return numMulDiv()
  const div = kind === 'div' || kind === 'divFrac'
  const e = div ? m - n : m + n
  const order = kind === 'bare' && chance() ? [n, m] : [m, n]
  const shown = kind === 'divFrac' ? frac(p(a, m), p(a, n)) : `${p(a, order[0])} ${div ? DIVIDE : TIMES} ${p(a, order[1])}`
  return q({
    prompt: `Simplify, writing the answer in index notation.${big(shown)}`,
    answer: exprA(pa(a, e), 'singlePower'),
    hint: kind === 'bare' ? `${a} on its own is ${a}<sup>1</sup>. ` + LAWS : LAWS,
    steps: [`${shown} = ${a}<sup>${order[0]} ${div ? '−' : '+'} ${order[1]}</sup>`, `= ${p(a, e)}`],
    meta: { t: 'expr', q: `${pa(a, order[0])}${div ? '/' : '*'}${pa(a, order[1])}` },
  })
}

function algMulDiv(level: Level): Question {
  const [x, y] = sample(LET, 2).sort()
  const kind = level === 2 ? pick(['one', 'coef', 'coefDiv', 'two', 'twoDiv'] as const) : pick(['chain', 'chainNum', 'fracCoef', 'fracTwo', 'mc'] as const)
  let A: Mono
  let B: Mono
  let C: Mono | null = null
  let ops: ('*' | '/')[] = ['*']
  let asFraction = false
  switch (kind) {
    case 'one':
      A = mono(1, { [x]: pick([1, int(2, 9)]) })
      B = mono(1, { [x]: int(1, 10) })
      if (chance()) {
        ops = ['/']
        A = mono(1, { [x]: int(6, 20) })
        B = mono(1, { [x]: pick([1, int(2, A.v[x] - 1)]) })
        asFraction = chance()
      }
      break
    case 'coef':
      A = mono(int(2, 9), { [x]: int(1, 8) })
      B = mono(int(2, 9), { [x]: int(1, 8) })
      break
    case 'coefDiv': {
      const k = int(2, 8)
      B = mono(int(2, 7), { [x]: int(1, 5) })
      A = mono(B.c * k, { [x]: B.v[x] + int(1, 8) })
      ops = ['/']
      asFraction = chance()
      break
    }
    case 'two':
      A = mono(int(2, 9), { [x]: int(1, 6), [y]: int(1, 6) })
      B = mono(int(2, 9), { [x]: int(1, 6), [y]: int(1, 6) })
      break
    case 'twoDiv': {
      B = mono(int(2, 9), { [x]: int(1, 4), [y]: int(1, 4) })
      A = mono(B.c * int(1, 6), { [x]: B.v[x] + int(1, 6), [y]: B.v[y] + int(1, 6) })
      ops = ['/']
      asFraction = chance()
      break
    }
    case 'chain':
      A = mono(int(2, 6), { [x]: int(2, 8) })
      B = mono(int(2, 6), { [x]: int(1, 6) })
      C = mono(int(2, 6), { [x]: int(1, 5) })
      ops = ['*', '*']
      break
    case 'chainNum': {
      A = mono(1, { [x]: int(8, 15) })
      B = mono(1, { [x]: int(2, 5) })
      C = mono(1, { [x]: int(1, 4) })
      ops = pick([['/', '/'], ['*', '/'], ['/', '*']] as ('*' | '/')[][])
      break
    }
    case 'fracCoef':
      A = mono(int(2, 12), { [x]: int(3, 8) })
      B = mono(int(2, 9), { [x]: int(2, 7) })
      C = mono(int(5, 30), { [x]: int(2, 6) })
      ops = ['*', '/']
      break
    case 'fracTwo': {
      A = mono(int(2, 12), { [x]: int(2, 8), [y]: int(2, 9) })
      B = mono(int(2, 30), { [x]: int(1, 5), [y]: int(1, 5) })
      ops = ['/']
      asFraction = true
      break
    }
    case 'mc': {
      A = mono(int(2, 9), { [x]: int(3, 9) })
      B = mono(int(2, 9), { [x]: int(1, 5) })
      C = mono(int(2, 15), { [x]: int(1, 5) })
      ops = ['*', '/']
      break
    }
  }
  let res: [Mono, Mono] = [A, mono(1)]
  const parts = [A, B, ...(C ? [C] : [])]
  for (let i = 1; i < parts.length; i++) {
    const [n0, d0] = res
    res = ops[i - 1] === '*' ? divide(mul(n0, parts[i]), d0) : divide(n0, mul(d0, parts[i]))
  }
  // keep the answer one term (or a simple fraction) with whole-number indices
  if (kind === 'mc' && !isOne(res[1])) return algMulDiv(level)
  if ((kind === 'coefDiv' || kind === 'twoDiv' || kind === 'one' || kind === 'chainNum') && !isOne(res[1])) return algMulDiv(level)
  if (kind === 'chainNum' && sortedVars(res[0]).length === 0) return algMulDiv(level)
  if ((kind === 'fracCoef' || kind === 'fracTwo') && isOne(res[1])) return algMulDiv(level)
  const qAsc = parts.map((m, i) => (i === 0 ? '' : ops[i - 1]) + `(${asc(m)})`).join('')
  const shownQ = asFraction && parts.length === 2 ? frac(show(A), show(B)) : parts.map((m, i) => (i === 0 ? '' : ` ${ops[i - 1] === '*' ? TIMES : DIVIDE} `) + show(m)).join('')
  const steps = [
    ops.includes('/') && parts.length === 3 ? `Work from left to right, or write it as one fraction.` : `${ops[0] === '*' ? 'Multiply' : 'Divide'} the numbers and ${ops[0] === '*' ? 'add' : 'subtract'} the indices of each letter.`,
    `= ${fracShow(res)}`,
  ]
  if (kind === 'mc') {
    const right = asc(res[0], true)
    const n = res[0]
    const wrongs = [mono(n.c, { [x]: A.v[x] + B.v[x] + C!.v[x] }), mono(A.c * B.c, { [x]: n.v[x] }), mono(Math.max(1, Math.round((A.c * B.c) / 2)), { [x]: n.v[x] + 1 }), mono(n.c * 2, { [x]: n.v[x] })]
    const wrong = Array.from(new Set(wrongs.map((w) => asc(w, true)).filter((w) => w !== right))).slice(0, 3)
    if (wrong.length < 3) return algMulDiv(level)
    return q({
      prompt: `Which expression is equal to ${shownQ}?`,
      answer: mcA(ex(right), wrong.map((w) => ex(w))),
      hint: LAWS,
      steps,
      meta: { t: 'expr', q: qAsc, mc: asc(res[0]) },
    })
  }
  return q({
    prompt: `Simplify${isOne(res[1]) ? ', writing the answer in index notation' : ''}.${big(shownQ)}`,
    answer: exprA(fracAsc(res), formFor(res)),
    hint: LAWS + (isOne(res[1]) ? '' : ' If the numbers don’t divide exactly, leave a fraction in lowest terms.'),
    steps,
    meta: { t: 'expr', q: qAsc },
  })
}

const ex501 = (level: Level): Question => (level === 1 ? numMulDiv() : algMulDiv(level))

// ================================================================= 5.02 Power of a power

function powerOfPower(level: Level): Question {
  const x = pick(LET)
  if (level === 1) {
    if (chance(0.45)) {
      const a = pick([2, 3, 4, 5, 6, 7, 8, 9, 10])
      const m = int(2, 9)
      const n = int(2, 6)
      return q({
        prompt: `Simplify, writing the answer in index notation.${big(`(${p(a, m)})<sup>${n}</sup>`)}`,
        answer: exprA(pa(a, m * n), 'singlePower'),
        hint: 'Power of a power: multiply the indices.',
        steps: [`(${p(a, m)})<sup>${n}</sup> = ${a}<sup>${m} × ${n}</sup> = ${p(a, m * n)}`],
        meta: { t: 'expr', q: `(${a}^${m})^${n}` },
      })
    }
    const m = int(1, 9)
    const n = int(2, 8)
    const base = mono(1, { [x]: m })
    const res = powM(base, n)
    return q({
      prompt: `Simplify.${big(`(${show(base)})<sup>${n}</sup>`)}`,
      answer: exprA(asc(res, true), 'singlePower'),
      hint: 'Power of a power: multiply the indices.',
      steps: [`(${show(base)})<sup>${n}</sup> = ${v(x)}<sup>${m} × ${n}</sup> = ${show(res)}`],
      meta: { t: 'expr', q: `(${asc(base)})^${n}` },
    })
  }
  // a number in front, and (level 3) negatives
  const neg = level === 3 && chance(0.7)
  let c = neg ? -pick([1, 1, 2, 3, 4, 5, 10]) : pick([2, 3, 4, 5, 10])
  const n = level === 2 ? int(2, 4) : int(2, 5)
  const m = int(1, 6)
  if (Math.abs(c) ** n > 100000) c = c < 0 ? -2 : 2
  const base = mono(c, { [x]: m })
  const res = powM(base, n)
  if (level === 3 && chance(0.3)) {
    // multiple choice, with the sign and index slips
    const right = asc(res, true)
    const wrong = Array.from(new Set([asc(mono(-res.c, res.v), true), asc(mono(res.c, { [x]: m + n }), true), asc(mono(-res.c, { [x]: m + n }), true), asc(mono(c * n, res.v), true)].filter((w) => w !== right))).slice(0, 3)
    if (wrong.length < 3) return powerOfPower(level)
    return q({
      prompt: `Which expression is equal to (${show(base)})<sup>${n}</sup>?`,
      answer: mcA(ex(right), wrong.map((w) => ex(w))),
      hint: 'Raise the number and the letter to the power. A negative number to an odd power stays negative; to an even power it becomes positive.',
      steps: [`(${show(base)})<sup>${n}</sup> = (${c < 0 ? MINUS + -c : c})<sup>${n}</sup> × ${v(x)}<sup>${m} × ${n}</sup>`, `= ${show(res)}`],
      meta: { t: 'expr', q: `(${asc(base)})^${n}`, mc: asc(res) },
    })
  }
  return q({
    prompt: `Simplify.${big(`(${show(base)})<sup>${n}</sup>`)}`,
    answer: exprA(asc(res, true), 'singlePower'),
    hint: 'Raise the number in front to the power too, then multiply the indices.' + (c < 0 ? ' Watch the sign: an even power makes a negative number positive.' : ''),
    steps: [`(${show(base)})<sup>${n}</sup> = (${c === -1 ? MINUS + '1' : c < 0 ? MINUS + -c : c})<sup>${n}</sup> × (${p(v(x), m)})<sup>${n}</sup>`, `= ${show(res)}`],
    meta: { t: 'expr', q: `(${asc(base)})^${n}` },
  })
}
const ex502 = (level: Level): Question => powerOfPower(level)

// ================================================================= 5.03 Powers of products and quotients

function products(level: Level): Question {
  const [x, y, z] = sample(LET, 3).sort()
  if (level === 1) {
    if (chance(0.2)) {
      const a = -int(2, 9)
      const b = int(2, 9)
      const n = 2
      return q({
        prompt: `Which expression is equal to (${MINUS}${-a} ${TIMES} ${b})<sup>${n}</sup>?`,
        answer: mcA(`${a * a} ${TIMES} ${b * b}`, [`${MINUS}${a * a} ${TIMES} ${b * b}`, `${MINUS}${-2 * a} ${TIMES} ${2 * b}`, `${-2 * a} ${TIMES} ${2 * b}`]),
        hint: 'Square each number in the brackets. A negative number squared is positive.',
        steps: [`(${MINUS}${-a} ${TIMES} ${b})<sup>2</sup> = (${MINUS}${-a})<sup>2</sup> ${TIMES} ${b}<sup>2</sup> = ${a * a} ${TIMES} ${b * b}`],
        meta: { t: 'mcProd', a, b },
      })
    }
    const base = chance(0.5) ? mono(1, { [x]: int(1, 5), [y]: int(1, 5) }) : mono(int(2, 6), { [x]: int(1, 3), [y]: int(1, 4) })
    const n = base.c === 1 ? int(2, 7) : int(2, 4)
    const res = powM(base, n)
    return q({
      prompt: `Simplify.${big(`(${show(base)})<sup>${n}</sup>`)}`,
      answer: exprA(asc(res, true), 'singlePower'),
      hint: 'Raise every part of the product to the power: (ab)<sup>n</sup> = a<sup>n</sup>b<sup>n</sup>.',
      steps: [`Raise each part to the power ${n} (multiply each index by ${n}).`, `= ${show(res)}`],
      meta: { t: 'expr', q: `(${asc(base)})^${n}` },
    })
  }
  if (level === 2) {
    const kind = pick(['negProd', 'quot', 'quotNum', 'threeLetters'] as const)
    if (kind === 'quotNum') {
      const a = int(2, 5)
      const b = int(a + 1, 9)
      if (gcd(a, b) !== 1) return products(level)
      const neg = chance()
      const n = neg ? 3 : int(2, 3)
      const top = (neg ? -1 : 1) * a ** n
      return q({
        prompt: `Simplify.${big(`(${neg ? MINUS : ''}${frac(a, b)})<sup>${n}</sup>`)}`,
        answer: { kind: 'frac', n: top, d: b ** n },
        hint: 'Raise the top and the bottom to the power. A negative number to an odd power stays negative.',
        steps: [`= ${neg ? MINUS : ''}${frac(p(a, n), p(b, n))} = ${neg ? MINUS : ''}${frac(a ** n, b ** n)}`],
        meta: { t: 'value', value: top / b ** n },
      })
    }
    if (kind === 'quot') {
      const top = mono(int(1, 9), { [x]: int(1, 4) })
      const bot = chance() ? mono(1, { [y]: int(1, 3) }) : mono(int(2, 7), {})
      const n = int(2, 3)
      if (gcd(top.c, bot.c) !== 1) return products(level)
      const res: [Mono, Mono] = [powM(top, n), powM(bot, n)]
      return q({
        prompt: `Simplify.${big(`(${frac(show(top), show(bot))})<sup>${n}</sup>`)}`,
        answer: exprA(fracAsc(res), 'lowestTerms'),
        hint: 'Raise the numerator and the denominator to the power.',
        steps: [`= ${frac(`(${show(top)})<sup>${n}</sup>`, `(${show(bot)})<sup>${n}</sup>`)}`, `= ${fracShow(res)}`],
        meta: { t: 'expr', q: `((${asc(top)})/(${asc(bot)}))^${n}` },
      })
    }
    const base = kind === 'negProd' ? mono(-int(2, 9), { [x]: int(1, 5), [y]: int(1, 5) }) : mono(pick([1, 2, 3, 5]), { [x]: int(1, 4), [y]: int(1, 4), [z]: int(1, 4) })
    const n = Math.abs(base.c) > 5 ? 2 : int(2, 4)
    const res = powM(base, n)
    return q({
      prompt: `Simplify.${big(`(${show(base)})<sup>${n}</sup>`)}`,
      answer: exprA(asc(res, true), 'singlePower'),
      hint: 'Raise every part to the power, including the number and its sign.',
      steps: [`Raise each part to the power ${n}.`, `= ${show(res)}`],
      meta: { t: 'expr', q: `(${asc(base)})^${n}` },
    })
  }
  // level 3: combinations
  const kind = pick(['powTimes', 'divPow', 'quotPow', 'overPow'] as const)
  let qAsc = ''
  let shown = ''
  let res: [Mono, Mono]
  if (kind === 'powTimes') {
    const A = mono(int(2, 4), { [x]: int(2, 6), [y]: int(2, 6) })
    const n = int(2, 3)
    const B = mono(int(2, 6), { [x]: int(1, 5), [y]: int(1, 5) })
    res = divide(mul(powM(A, n), B), mono(1))
    qAsc = `(${asc(A)})^${n}*(${asc(B)})`
    shown = `(${show(A)})<sup>${n}</sup> ${TIMES} ${show(B)}`
  } else if (kind === 'divPow') {
    const B = mono(int(2, 4), { [x]: int(1, 3), [y]: int(1, 3) })
    const n = 2
    const Bn = powM(B, n)
    const A = mono(Bn.c * int(1, 5), { [x]: Bn.v[x] + int(1, 5), [y]: Bn.v[y] + int(0, 4) })
    res = divide(A, Bn)
    qAsc = `(${asc(A)})/(${asc(B)})^${n}`
    shown = `${show(A)} ${DIVIDE} (${show(B)})<sup>${n}</sup>`
  } else if (kind === 'quotPow') {
    const B = mono(1, { [x]: int(1, 3), [y]: int(1, 3) })
    const A = mono(int(2, 6), { [x]: B.v[x] + int(1, 3), [y]: B.v[y] + int(1, 4) })
    const n = int(2, 3)
    res = divide(powM(A, n), powM(B, n))
    qAsc = `((${asc(A)})/(${asc(B)}))^${n}`
    shown = `(${frac(show(A), show(B))})<sup>${n}</sup>`
  } else {
    const B = mono(1, { [x]: int(1, 2), [y]: int(1, 3) })
    const n = int(2, 3)
    const Bn = powM(B, n)
    const A = mono(int(2, 9), { [x]: Bn.v[x] + int(1, 4), [y]: Bn.v[y] + int(1, 4) })
    res = divide(A, Bn)
    qAsc = `(${asc(A)})/(${asc(B)})^${n}`
    shown = frac(show(A), `(${show(B)})<sup>${n}</sup>`)
  }
  if (!isOne(res[1])) return products(level)
  return q({
    prompt: `Simplify.${big(shown)}`,
    answer: exprA(fracAsc(res), 'singlePower'),
    hint: 'Do the powers of brackets first, then multiply or divide (add or subtract the indices).',
    steps: [`Expand the bracket raised to a power first.`, `= ${fracShow(res)}`],
    meta: { t: 'expr', q: qAsc },
  })
}
const ex503 = (level: Level): Question => products(level)

// ================================================================= 5.04 The zero index

interface Z {
  shown: string
  q: string // parseable
  value: string // parseable answer (number, or a letter that is left)
  why: string
}
function zeroOne(): Z {
  const x = pick(LET)
  const y = pick(LET.filter((l) => l !== x))
  const n = int(2, 12)
  const k = int(2, 9)
  const opts: Z[] = [
    { shown: p(n, 0), q: `${n}^0`, value: '1', why: `Any number to the power 0 is 1.` },
    { shown: `(${MINUS}${n})<sup>0</sup>`, q: `(-${n})^0`, value: '1', why: `The bracket is raised to the power 0, so it is 1.` },
    { shown: `${MINUS}${p(n, 0)}`, q: `-(${n}^0)`, value: '-1', why: `Only ${n} is raised to the power 0: ${MINUS}${p(n, 0)} = ${MINUS}1 ${TIMES} 1 = ${MINUS}1.` },
    { shown: `(${MINUS}${v(x)})<sup>0</sup>`, q: `(-${x})^0`, value: '1', why: `Everything in the bracket is raised to the power 0.` },
    { shown: `${MINUS}${v(x)}<sup>0</sup>`, q: `-(${x}^0)`, value: '-1', why: `Only ${v(x)} is raised to the power 0: ${MINUS}1 ${TIMES} 1 = ${MINUS}1.` },
    { shown: `(${k}${v(x)})<sup>0</sup>`, q: `(${k}*${x})^0`, value: '1', why: `The whole bracket is raised to the power 0.` },
    { shown: `${k}${v(x)}<sup>0</sup>`, q: `${k}*${x}^0`, value: String(k), why: `Only ${v(x)} is raised to the power 0: ${k} ${TIMES} 1 = ${k}.` },
    { shown: `(${v(x)} + ${k})<sup>0</sup>`, q: `(${x}+${k})^0`, value: '1', why: `The whole bracket is raised to the power 0.` },
    { shown: `(${frac(k, v(x))})<sup>0</sup>`, q: `(${k}/${x})^0`, value: '1', why: `The whole fraction is raised to the power 0.` },
    { shown: `${MINUS}${k}(${v(x)}<sup>2</sup>${v(y)}<sup>3</sup>)<sup>0</sup>`, q: `-${k}*(${x}^2*${y}^3)^0`, value: String(-k), why: `The bracket is 1, so it is ${MINUS}${k} ${TIMES} 1 = ${MINUS}${k}.` },
    { shown: `${v(x)}<sup>0</sup>${v(y)}`, q: `${x}^0*${y}`, value: y, why: `${v(x)}<sup>0</sup> = 1, so ${v(x)}<sup>0</sup>${v(y)} = ${v(y)}.` },
    { shown: `(${v(x)}${v(y)})<sup>0</sup>`, q: `(${x}*${y})^0`, value: '1', why: `The whole bracket is raised to the power 0.` },
  ]
  return pick(opts)
}
function zeroTwo(): Z {
  const x = pick(LET)
  const a = int(2, 9)
  const b = int(2, 9)
  const opts: Z[] = [
    { shown: `${p(a, 0)} + ${p(b, 0)}`, q: `${a}^0+${b}^0`, value: '2', why: `1 + 1 = 2` },
    { shown: `${p(a + 7, 0)} ${MINUS} ${p(b, 0)}`, q: `${a + 7}^0-${b}^0`, value: '0', why: `1 ${MINUS} 1 = 0` },
    { shown: `${a}${v(x)}<sup>0</sup> + (${a}${v(x)})<sup>0</sup>`, q: `${a}*${x}^0+(${a}*${x})^0`, value: String(a + 1), why: `${a} ${TIMES} 1 + 1 = ${a + 1}` },
    { shown: `${a}${v(x)}<sup>0</sup> ${MINUS} (${a}${v(x)})<sup>0</sup>`, q: `${a}*${x}^0-(${a}*${x})^0`, value: String(a - 1), why: `${a} ${TIMES} 1 ${MINUS} 1 = ${a - 1}` },
    { shown: `(${a}${v(x)})<sup>0</sup> + ${b}${v(x)}<sup>0</sup>`, q: `(${a}*${x})^0+${b}*${x}^0`, value: String(1 + b), why: `1 + ${b} ${TIMES} 1 = ${1 + b}` },
    { shown: `${p(a, 0)} ${TIMES} ${p(b, 0)}`, q: `${a}^0*${b}^0`, value: '1', why: `1 ${TIMES} 1 = 1` },
    { shown: `(${a}${v(x)})<sup>0</sup> ${MINUS} ${b}`, q: `(${a}*${x})^0-${b}`, value: String(1 - b), why: `1 ${MINUS} ${b} = ${1 - b}` },
    { shown: `${a}${v(x)}<sup>0</sup> + ${b}`, q: `${a}*${x}^0+${b}`, value: String(a + b), why: `${a} ${TIMES} 1 + ${b} = ${a + b}` },
    { shown: `${b + 2} ${MINUS} 2(${a}${v(x)})<sup>0</sup>`, q: `${b + 2}-2*(${a}*${x})^0`, value: String(b), why: `${b + 2} ${MINUS} 2 ${TIMES} 1 = ${b}` },
    { shown: `${p(a, 2)} ${TIMES} ${p(b, 0)}`, q: `${a}^2*${b}^0`, value: String(a * a), why: `${a * a} ${TIMES} 1 = ${a * a}` },
  ]
  return pick(opts)
}
function zeroThree(): Z {
  const [x, y] = sample(LET, 2)
  const a = int(2, 6)
  const b = int(2, 5)
  const n = int(2, 6)
  const opts: Z[] = [
    { shown: `(${a}${v(x)}<sup>0</sup>)<sup>3</sup>`, q: `(${a}*${x}^0)^3`, value: String(a ** 3), why: `${v(x)}<sup>0</sup> = 1, so (${a})<sup>3</sup> = ${a ** 3}` },
    { shown: `${a * b}${v(x)}<sup>0</sup> ${DIVIDE} ${b}`, q: `${a * b}*${x}^0/${b}`, value: String(a), why: `${a * b} ${TIMES} 1 ${DIVIDE} ${b} = ${a}` },
    { shown: `${a * b}${p(v(x), n)} ${DIVIDE} ${b}${p(v(x), n)}`, q: `${a * b}*${x}^${n}/(${b}*${x}^${n})`, value: String(a), why: `${a * b} ${DIVIDE} ${b} = ${a} and ${p(v(x), n)} ${DIVIDE} ${p(v(x), n)} = ${v(x)}<sup>0</sup> = 1` },
    { shown: `(${a}${p(v(x), n)})<sup>3</sup> ${DIVIDE} ${p(v(x), 3 * n)}`, q: `(${a}*${x}^${n})^3/${x}^${3 * n}`, value: String(a ** 3), why: `(${a}${p(v(x), n)})<sup>3</sup> = ${a ** 3}${p(v(x), 3 * n)}, and ${p(v(x), 3 * n)} ${DIVIDE} ${p(v(x), 3 * n)} = 1` },
    { shown: `(${a}${p(v(x), n)}${v(y)})<sup>0</sup> ${MINUS} ${b}(${p(v(x), 2)}${v(y)})<sup>0</sup>`, q: `(${a}*${x}^${n}*${y})^0-${b}*(${x}^2*${y})^0`, value: String(1 - b), why: `1 ${MINUS} ${b} ${TIMES} 1 = ${1 - b}` },
    { shown: `${a + 6}${v(x)}<sup>0</sup> ${MINUS} (${a}${v(x)}<sup>0</sup>)<sup>2</sup>`, q: `${a + 6}*${x}^0-(${a}*${x}^0)^2`, value: String(a + 6 - a * a), why: `${a + 6} ${MINUS} ${a}<sup>2</sup> = ${a + 6 - a * a}` },
    { shown: frac(`${a * b}${p(v(x), 0)}`, `(${b}${v(x)})<sup>0</sup>`), q: `${a * b}*${x}^0/(${b}*${x})^0`, value: String(a * b), why: `${a * b} ${TIMES} 1 ${DIVIDE} 1 = ${a * b}` },
  ]
  return pick(opts)
}
const ex504 = (level: Level): Question => {
  const z = level === 1 ? zeroOne() : level === 2 ? zeroTwo() : zeroThree()
  const isNum = /^-?\d+$/.test(z.value)
  return q({
    prompt: `Simplify.${big(z.shown)}`,
    answer: isNum ? numA(Number(z.value)) : exprA(z.value, 'simplified'),
    hint: 'Anything (except 0) to the power 0 is 1. Check what the power 0 applies to: only the term next to it, or the whole bracket.',
    steps: [z.why],
    meta: { t: 'expr', q: z.q, a: z.value },
  })
}

// ================================================================= 5.05 Negative indices

function negPositive(): Question {
  const kind = pick(['simp', 'simp', 'eval', 'eval', 'letter'] as const)
  if (kind === 'letter') {
    const x = pick(LET)
    const n = int(1, 9)
    return q({
      prompt: `Simplify using a positive index.${big(`${v(x)}<sup>${MINUS}${n}</sup>`)}`,
      answer: exprA(n === 1 ? `1/${x}` : `1/${x}^${n}`, 'positiveIndices'),
      hint: `A negative index means “one over”: a<sup>−n</sup> = ${frac(1, 'a<sup>n</sup>')}.`,
      steps: [`${v(x)}<sup>${MINUS}${n}</sup> = ${frac(1, p(v(x), n))}`],
      meta: { t: 'expr', q: `${x}^(-${n})` },
    })
  }
  const [b, e] = pick([[2, 1], [2, 3], [2, 5], [2, 7], [3, 2], [3, 3], [4, 3], [5, 2], [5, 4], [6, 2], [7, 2], [10, 2], [10, 3], [10, 6], [9, 2], [8, 2], [25, 1], [6, 1]] as [number, number][])
  if (kind === 'simp') {
    return q({
      prompt: `Simplify using a positive index.${big(`${b}<sup>${MINUS}${e}</sup>`)}`,
      answer: exprA(e === 1 ? `1/${b}` : `1/${b}^${e}`, 'positiveIndices'),
      hint: `A negative index means “one over”: a<sup>−n</sup> = ${frac(1, 'a<sup>n</sup>')}.`,
      steps: [`${b}<sup>${MINUS}${e}</sup> = ${frac(1, p(b, e))}`],
      meta: { t: 'expr', q: `${b}^(-${e})` },
    })
  }
  return q({
    prompt: `Evaluate, giving the answer as a fraction.${big(`${b}<sup>${MINUS}${e}</sup>`)}`,
    answer: { kind: 'frac', n: 1, d: b ** e },
    hint: `Write it as ${frac(1, p(b, e))}, then work out ${p(b, e)}.`,
    steps: [`${b}<sup>${MINUS}${e}</sup> = ${frac(1, p(b, e))} = ${frac(1, b ** e)}`],
    meta: { t: 'value', value: b ** -e },
  })
}

function negWrite(): Question {
  const kind = pick(['letter', 'number', 'coef', 'recip', 'recipFrac'] as const)
  const x = pick(LET)
  if (kind === 'recip' || kind === 'recipFrac') {
    const a = int(1, 9)
    const b = int(2, 10)
    if (gcd(a, b) !== 1 || a === b) return negWrite()
    const neg = kind === 'recipFrac' && chance()
    const isWhole = kind === 'recip'
    const shown = isWhole ? `${b}<sup>${MINUS}1</sup>` : `(${neg ? MINUS : ''}${frac(a, b)})<sup>${MINUS}1</sup>`
    const [n, d] = isWhole ? [1, b] : [(neg ? -1 : 1) * b, a]
    return q({
      prompt: `Simplify.${big(shown)}`,
      answer: { kind: 'frac', n, d },
      hint: 'A power of −1 gives the reciprocal: turn the fraction upside down.',
      steps: [`${shown} = ${isWhole ? frac(1, b) : (neg ? MINUS : '') + frac(b, a)}`],
      meta: { t: 'value', value: n / d },
    })
  }
  const n = int(1, 7)
  const c = int(2, 9)
  const base = kind === 'number' ? String(pick([2, 3, 4, 5, 7, 8, 10])) : x
  const shownBase = kind === 'number' ? base : v(x)
  const top = kind === 'coef' ? c : 1
  return q({
    prompt: `Write using a negative index.${big(frac(top, p(shownBase, n)))}`,
    answer: exprA(`${top === 1 ? '' : top + '*'}${base}^(-${n})`, 'negativeIndex'),
    hint: `${frac(1, 'a<sup>n</sup>')} = a<sup>−n</sup>. Type a negative index with ^, e.g. ${v('k')}^-2.`,
    steps: [`${frac(top, p(shownBase, n))} = ${top === 1 ? '' : top}${shownBase}<sup>${MINUS}${n}</sup>`],
    meta: { t: 'expr', q: `${top}/${base}^${n}`, neg: true },
  })
}

function negLaws(): Question {
  const kind = pick(['divIdx', 'divEval', 'fracPow', 'mixEval'] as const)
  if (kind === 'fracPow') {
    const a = int(1, 5)
    const b = int(2, 6)
    if (gcd(a, b) !== 1 || a === b) return negLaws()
    const e = int(2, 3)
    return q({
      prompt: `Evaluate, giving the answer as a fraction.${big(`(${frac(a, b)})<sup>${MINUS}${e}</sup>`)}`,
      answer: { kind: 'frac', n: b ** e, d: a ** e },
      hint: 'Flip the fraction to make the index positive: (a/b)<sup>−n</sup> = (b/a)<sup>n</sup>.',
      steps: [`(${frac(a, b)})<sup>${MINUS}${e}</sup> = (${frac(b, a)})<sup>${e}</sup> = ${frac(b ** e, a ** e)}`],
      meta: { t: 'value', value: (b / a) ** e },
    })
  }
  const a = pick([2, 3, 5, 10])
  const m = int(1, 6)
  const n = int(m + 1, m + 5)
  if (kind === 'divIdx') {
    return q({
      prompt: `Simplify, writing the answer with a positive index.${big(`${p(a, m)} ${DIVIDE} ${p(a, n)}`)}`,
      answer: exprA(`1/${pa(a, n - m)}`, 'positiveIndices'),
      hint: 'Subtract the indices, then write the negative power as “one over”.',
      steps: [`${p(a, m)} ${DIVIDE} ${p(a, n)} = ${a}<sup>${m} − ${n}</sup> = ${a}<sup>${MINUS}${n - m}</sup>`, `= ${frac(1, p(a, n - m))}`],
      meta: { t: 'expr', q: `${a}^${m}/${a}^${n}` },
    })
  }
  if (kind === 'divEval') {
    if (a ** (n - m) > 10000) return negLaws()
    return q({
      prompt: `Evaluate, giving the answer as a fraction.${big(`${p(a, m)} ${DIVIDE} ${p(a, n)}`)}`,
      answer: { kind: 'frac', n: 1, d: a ** (n - m) },
      hint: 'Subtract the indices, then write the negative power as a fraction.',
      steps: [`${p(a, m)} ${DIVIDE} ${p(a, n)} = ${a}<sup>${MINUS}${n - m}</sup> = ${frac(1, p(a, n - m))} = ${frac(1, a ** (n - m))}`],
      meta: { t: 'value', value: a ** (m - n) },
    })
  }
  const k = int(1, 4)
  const j = int(k, k + 3)
  const e = j - k
  return q({
    prompt: `Evaluate.${big(`${a}<sup>${MINUS}${k}</sup> ${TIMES} ${p(a, j)}`)}`,
    answer: numA(a ** e),
    hint: 'Add the indices: a negative index plus a positive one.',
    steps: [`${a}<sup>${MINUS}${k}</sup> ${TIMES} ${p(a, j)} = ${a}<sup>${MINUS}${k} + ${j}</sup> = ${p(a, e)} = ${a ** e}`],
    meta: { t: 'value', value: a ** e },
  })
}
const ex505 = (level: Level): Question => (level === 1 ? negPositive() : level === 2 ? negWrite() : negLaws())

// ================================================================= 5.06 Summary of the index laws

function summaryNum(): Question {
  const a = pick([2, 3, 4, 5, 6, 8, 9, 10])
  const m = int(2, 9)
  const n = int(2, 6)
  const k = int(1, 4)
  const forms = [
    { shown: `${p(a, m)} ${TIMES} ${p(a, n)} ${TIMES} ${p(a, k)}`, q: `${a}^${m}*${a}^${n}*${a}^${k}`, e: m + n + k },
    { shown: `(${p(a, m)})<sup>${n}</sup> ${DIVIDE} ${p(a, k)}`, q: `(${a}^${m})^${n}/${a}^${k}`, e: m * n - k },
    { shown: `${p(a, m + n)} ${DIVIDE} ${p(a, n)} ${TIMES} ${p(a, k)}`, q: `${a}^${m + n}/${a}^${n}*${a}^${k}`, e: m + k },
    { shown: frac(p(a, m * n + k), `(${p(a, m)})<sup>${n}</sup>`), q: `${a}^${m * n + k}/(${a}^${m})^${n}`, e: k },
    { shown: `(${p(a, m)})<sup>${n}</sup> ${TIMES} ${p(a, k)}`, q: `(${a}^${m})^${n}*${a}^${k}`, e: m * n + k },
  ]
  const f = pick(forms)
  return q({
    prompt: `Simplify, writing the answer in index notation.${big(f.shown)}`,
    answer: exprA(pa(a, f.e), 'singlePower'),
    hint: 'Power of a power: multiply. Multiplying: add. Dividing: subtract. Work from left to right.',
    steps: [`= ${p(a, f.e)}`],
    meta: { t: 'expr', q: f.q },
  })
}
function summaryEval(): Question {
  const a = pick([2, 3, 4, 5, 10])
  const m = int(1, 4)
  const n = int(1, 4)
  const forms: { shown: string; value: number; frac?: [number, number]; why: string }[] = [
    { shown: `(${MINUS}${a})<sup>${n + 1}</sup>`, value: (-a) ** (n + 1), why: `${n + 1} lots of ${MINUS}${a} multiplied: ${(n + 1) % 2 ? 'an odd power, so negative' : 'an even power, so positive'}.` },
    { shown: `(${p(a, m)})<sup>2</sup>`, value: a ** (2 * m), why: `= ${p(a, 2 * m)} = ${a ** (2 * m)}` },
    { shown: `${p(a, m + n)} ${DIVIDE} ${p(a, n)}`, value: a ** m, why: `= ${p(a, m)} = ${a ** m}` },
    { shown: `${p(a, n)} ${DIVIDE} ${p(a, m + n)}`, value: a ** -m, frac: [1, a ** m], why: `= ${a}<sup>${MINUS}${m}</sup> = ${frac(1, a ** m)}` },
    { shown: `${a}<sup>${MINUS}${m}</sup> ${TIMES} ${p(a, m)}`, value: 1, why: `= ${a}<sup>0</sup> = 1` },
    { shown: `${p(a, 0)} ${TIMES} ${p(a, m)}`, value: a ** m, why: `= 1 ${TIMES} ${a ** m} = ${a ** m}` },
    { shown: `${a}<sup>${MINUS}${m}</sup>`, value: a ** -m, frac: [1, a ** m], why: `= ${frac(1, p(a, m))} = ${frac(1, a ** m)}` },
  ]
  const f = pick(forms)
  return q({
    prompt: `Evaluate${f.frac ? ', giving the answer as a fraction' : ''}.${big(f.shown)}`,
    answer: f.frac ? { kind: 'frac', n: f.frac[0], d: f.frac[1] } : numA(f.value),
    hint: 'Use the index laws to get one power, then work it out.',
    steps: [f.why],
    meta: { t: 'value', value: f.value },
  })
}
function summaryAlg(): Question {
  const [x, y] = sample(LET, 2).sort()
  const kind = pick(['powSq', 'mulTwo', 'divTwo', 'powNeg', 'powTimesOver', 'quotSq'] as const)
  let qAsc = ''
  let shown = ''
  let res: [Mono, Mono]
  if (kind === 'powSq') {
    const A = mono(int(2, 5), { [x]: int(1, 4), [y]: int(1, 4) })
    const n = int(2, 3)
    res = [powM(A, n), mono(1)]
    qAsc = `(${asc(A)})^${n}`
    shown = `(${show(A)})<sup>${n}</sup>`
  } else if (kind === 'mulTwo') {
    const A = mono(int(2, 9), { [x]: int(1, 5), [y]: int(1, 5) })
    const B = mono(int(2, 9), { [x]: int(1, 5), [y]: int(1, 7) })
    res = [mul(A, B), mono(1)]
    qAsc = `(${asc(A)})*(${asc(B)})`
    shown = `${show(A)} ${TIMES} ${show(B)}`
  } else if (kind === 'divTwo') {
    const B = mono(int(2, 9), { [x]: int(1, 4), [y]: int(1, 5) })
    const A = mono(B.c * int(2, 6), { [x]: B.v[x] + int(1, 4), [y]: B.v[y] + int(1, 4) })
    res = divide(A, B)
    qAsc = `(${asc(A)})/(${asc(B)})`
    shown = frac(show(A), show(B))
  } else if (kind === 'powNeg') {
    const A = mono(-int(2, 4), { [x]: int(1, 3), [y]: 1 })
    const n = 3
    res = [powM(A, n), mono(1)]
    qAsc = `(${asc(A)})^${n}`
    shown = `(${show(A)})<sup>${n}</sup>`
  } else if (kind === 'powTimesOver') {
    // (x²y)⁴ × x³ ÷ y⁵ style: the answer can be a fraction
    const A = mono(1, { [x]: int(1, 3), [y]: 1 })
    const n = int(2, 4)
    const B = mono(1, { [x]: int(1, 4) })
    const C = mono(1, { [y]: int(1, 6) })
    res = divide(mul(powM(A, n), B), C)
    qAsc = `(${asc(A)})^${n}*${asc(B)}/${asc(C)}`
    shown = frac(`(${show(A)})<sup>${n}</sup> ${TIMES} ${show(B)}`, show(C))
  } else {
    const t = mono(int(1, 9), { [x]: 1 })
    const b = int(2, 12)
    if (gcd(t.c, b) !== 1) return summaryAlg()
    res = [powM(t, 2), mono(b * b)]
    qAsc = `((${asc(t)})/${b})^2`
    shown = `(${frac(show(t), b)})<sup>2</sup>`
  }
  return q({
    prompt: `Simplify.${big(shown)}`,
    answer: exprA(fracAsc(res), isOne(res[1]) ? 'singlePower' : 'lowestTerms'),
    hint: 'Brackets with powers first, then multiply and divide. Keep the indices positive.',
    steps: [`= ${fracShow(res)}`],
    meta: { t: 'expr', q: qAsc },
  })
}
const ex506 = (level: Level): Question => (level === 1 ? summaryNum() : level === 2 ? summaryEval() : summaryAlg())

// ================================================================= Path: negative indices with pronumerals (extension)

function negAlg(level: Level): Question {
  const [x, y] = sample(LET, 2).sort()
  let qAsc = ''
  let shown = ''
  let res: [Mono, Mono]
  const k = int(2, 9)
  const n = int(1, 5)
  const m = int(1, 5)
  const kinds = level === 1 ? (['coefNeg', 'mixed', 'bracket1'] as const) : level === 2 ? (['bracket2', 'twoNeg', 'recipVar', 'coefTwo'] as const) : (['mulNeg', 'divNeg', 'powNeg', 'coefMul'] as const)
  const kind = pick(kinds as readonly string[])
  switch (kind) {
    case 'coefNeg':
      res = [mono(k), mono(1, { [x]: n })]
      qAsc = `${k}*${x}^(-${n})`
      shown = `${k}${v(x)}<sup>${MINUS}${n}</sup>`
      break
    case 'mixed':
      res = [mono(1, { [y]: m }), mono(1, { [x]: n })]
      qAsc = `${x}^(-${n})*${y}^${m}`
      shown = `${v(x)}<sup>${MINUS}${n}</sup>${p(v(y), m)}`
      break
    case 'bracket1':
      res = [mono(1), mono(k, { [x]: 1 })]
      qAsc = `(${k}*${x})^(-1)`
      shown = `(${k}${v(x)})<sup>${MINUS}1</sup>`
      break
    case 'bracket2':
      res = [mono(1), mono(k * k, { [x]: 2 })]
      qAsc = `(${k}*${x})^(-2)`
      shown = `(${k}${v(x)})<sup>${MINUS}2</sup>`
      break
    case 'twoNeg':
      res = [mono(k), mono(1, { [x]: n, [y]: m })]
      qAsc = `${k}*${x}^(-${n})*${y}^(-${m})`
      shown = `${k}${v(x)}<sup>${MINUS}${n}</sup>${v(y)}<sup>${MINUS}${m}</sup>`
      break
    case 'recipVar': {
      const a = int(2, 9)
      res = [mono(a), mono(1, { [x]: 1 })]
      qAsc = `(${x}/${a})^(-1)`
      shown = `(${frac(v(x), a)})<sup>${MINUS}1</sup>`
      break
    }
    case 'coefTwo':
      res = [mono(k, { [x]: n }), mono(1, { [y]: m })]
      qAsc = `${k}*${x}^${n}*${y}^(-${m})`
      shown = `${k}${p(v(x), n)}${v(y)}<sup>${MINUS}${m}</sup>`
      break
    case 'mulNeg': {
      const a = int(3, 9)
      const b = int(1, 8)
      res = divide(mono(1, { [x]: a }), mono(1, { [x]: b }))
      qAsc = `${x}^${a}*${x}^(-${b})`
      shown = `${p(v(x), a)} ${TIMES} ${v(x)}<sup>${MINUS}${b}</sup>`
      break
    }
    case 'divNeg': {
      const a = int(1, 6)
      const b = int(1, 6)
      res = [mono(1), mono(1, { [x]: a + b })]
      qAsc = `${x}^(-${a})/${x}^${b}`
      shown = `${v(x)}<sup>${MINUS}${a}</sup> ${DIVIDE} ${p(v(x), b)}`
      break
    }
    case 'powNeg': {
      const c = int(2, 5)
      res = [mono(c), mono(1, { [x]: 4 })]
      qAsc = `${c}*(${x}^(-1))^4`
      shown = `${c}(${v(x)}<sup>${MINUS}1</sup>)<sup>4</sup>`
      break
    }
    default: {
      const a = int(2, 9)
      const b = int(2, 9)
      const e1 = int(2, 6)
      const e2 = int(1, e1 - 1)
      res = [mono(a * b, { [x]: e1 - e2 }), mono(1)]
      qAsc = `${a}*${x}^${e1}*${b}*${x}^(-${e2})`
      shown = `${a}${p(v(x), e1)} ${TIMES} ${b}${v(x)}<sup>${MINUS}${e2}</sup>`
    }
  }
  return q({
    prompt: `Simplify using positive indices.${big(shown)}`,
    answer: exprA(fracAsc(res), 'positiveIndices'),
    hint: `Only the part with the negative index moves below the fraction bar: 3${v('n')}<sup>−2</sup> = ${frac(3, `${v('n')}<sup>2</sup>`)}, but (3${v('n')})<sup>−2</sup> = ${frac(1, `9${v('n')}<sup>2</sup>`)}.`,
    steps: [`= ${fracShow(res)}`],
    meta: { t: 'expr', q: qAsc },
  })
}

// ================================================================= 5.07 Significant figures

/** round a number to sf significant figures, working on its decimal digits (so 2.675 → 2.68, not 2.67) */
export function sfRound(x: number, sf: number): number {
  if (x === 0) return 0
  const [mant, expPart] = Math.abs(x).toExponential(14).split('e')
  const digits = mant.replace('.', '')
  const e = Number(expPart)
  let k = BigInt(digits.slice(0, sf))
  if (Number(digits[sf]) >= 5) k += 1n
  return Math.sign(x) * Number(`${k}e${e - sf + 1}`)
}
/** significant figures in a number as written (the textbook's rules: trailing zeros of a whole number don't count) */
function countSF(s: string): number {
  const t = s.replace(/[\s,]/g, '')
  if (t.includes('.')) return t.replace('.', '').replace(/^0+/, '').length
  return t.replace(/^0+/, '').replace(/0+$/, '').length
}
const SFW = (n: number) => (n === 1 ? 'one significant figure' : `${n} significant figures`)
/** a decimal string with grouped digits, e.g. "0.000 159 2" or "47 321" */
function grouped(s: string): string {
  const [w, f] = s.split('.')
  const wg = w.length > 4 ? w.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : w
  if (f === undefined) return wg
  const fg = f.length > 4 ? f.replace(/(\d{3})(?=\d)/g, '$1 ') : f
  return `${wg}.${fg}`
}

function sfCount(): Question {
  const kind = pick(['whole', 'wholeZeros', 'decimal', 'small', 'between', 'trailing'] as const)
  let s = ''
  switch (kind) {
    case 'whole':
      s = String(int(100, 99999))
      if (s.endsWith('0')) s = s.slice(0, -1) + int(1, 9)
      break
    case 'wholeZeros':
      s = String(int(2, 999)) + '0'.repeat(int(2, 6))
      break
    case 'decimal':
      s = `${int(1, 999)}.${int(1, 99)}`
      if (s.endsWith('0')) s = s.slice(0, -1) + int(1, 9)
      break
    case 'small':
      s = '0.' + '0'.repeat(int(1, 4)) + String(int(1, 999))
      if (s.endsWith('0')) s = s.slice(0, -1) + int(1, 9)
      break
    case 'between':
      s = `${int(1, 9)}0${int(0, 9)}${int(1, 9)}`
      if (chance()) s = s.slice(0, 2) + '.' + s.slice(2)
      break
    case 'trailing':
      s = pick([`0.0${int(1, 9)}0`, `${int(1, 99)}.${int(1, 9)}0`, `0.${int(1, 9)}${int(0, 9)}0`, `${int(100, 999)}.${int(10, 99)}0`])
      break
  }
  const n = countSF(s)
  return q({
    prompt: `How many significant figures are in ${grouped(s)}?`,
    answer: numA(n),
    hint: 'Start counting at the first non-zero digit. Zeros between digits count; zeros at the end of a decimal count; zeros at the end of a whole number and at the start of a decimal are only placeholders.',
    steps: [kind === 'wholeZeros' ? 'The zeros at the end of a whole number are placeholders, so they don’t count.' : kind === 'small' ? 'The zeros at the start of a decimal are placeholders, so they don’t count.' : kind === 'trailing' ? 'A zero at the end of a decimal is significant.' : kind === 'between' ? 'Zeros between non-zero digits are significant.' : 'Every digit is significant.', `${grouped(s)} has ${SFW(n)}.`],
    meta: { t: 'sfCount', s },
  })
}

function sfRoundQ(level: Level): Question {
  for (;;) {
    let x: number
    let sf: number
    if (level === 1) {
      sf = pick([2, 3, 3])
      x = pick([int(10000, 999999), int(10000, 99999) / 1000, int(1000, 9999) / 100])
    } else {
      sf = pick([1, 2, 2])
      x = pick([int(100, 9999) / 10 ** int(4, 6), int(1001, 9999) / 10000, int(10, 99999) / 1000])
    }
    const s = String(x)
    if (countSF(s) <= sf) continue
    const r = sfRound(x, sf)
    if (level === 2 && chance(0.3)) {
      // multiple choice with the usual slips
      const wrongs = [sfRound(x, sf + 1), Number(r.toPrecision(sf)) * 10, sfRound(x, Math.max(1, sf - 1)), Number(String(x).slice(0, String(x).length - 1)) || x * 10]
      const w = Array.from(new Set(wrongs.filter((y) => y !== r).map((y) => num(y)))).slice(0, 3)
      if (w.length < 3) continue
      return q({
        prompt: `What is ${grouped(s)} rounded to ${SFW(sf)}?`,
        answer: mcA(num(r), w),
        hint: 'Count from the first non-zero digit, then look at the next digit to round.',
        steps: [`${grouped(s)} ≈ ${num(r)}`],
        meta: { t: 'sfRound', s, sf, mc: true },
      })
    }
    return q({
      prompt: `Round ${grouped(s)} to ${SFW(sf)}.`,
      answer: numA(r),
      hint: 'Start counting at the first non-zero digit. Look at the next digit: 5 or more rounds up. Keep zeros as placeholders in a whole number.',
      steps: [`The first ${sf === 1 ? 'significant figure' : `${sf} significant figures`} of ${grouped(s)} are counted from the first non-zero digit.`, `${grouped(s)} ≈ ${num(r)}`],
      meta: { t: 'sfRound', s, sf },
    })
  }
}

function sfContext(): Question {
  for (;;) {
    const kind = pick(['crowd', 'profit', 'writtenTo', 'calc'] as const)
    if (kind === 'writtenTo') {
      const s = String(int(10, 99999)) + '0'.repeat(int(2, 4))
      if (s.replace(/0+$/, '').length < 2) continue
      return q({
        prompt: `A news report says the population of a regional city is ${grouped(s)}. To how many significant figures has this number been written?`,
        answer: numA(countSF(s)),
        hint: 'The zeros at the end of a whole number are placeholders.',
        steps: [`${grouped(s)}: count the digits up to the last non-zero digit.`, `${SFW(countSF(s))}`],
        meta: { t: 'sfCount', s },
      })
    }
    if (kind === 'calc') {
      const a = int(100, 999) / 10
      const b = int(11, 99) / 10
      const c = int(101, 999) / 100
      const d = int(11, 99) / 10
      const sf = pick([2, 3, 4])
      const form = pick(['ab-cd', '(a-c)/b', '(a+c)/(b+d)'] as const)
      const val = form === 'ab-cd' ? a * b - c * d : form === '(a-c)/b' ? (a - c) / b : (a + c) / (b + d)
      const r = sfRound(val, sf)
      if (Math.abs(sfRound(val * (1 + 1e-6), sf) - r) > 0 || Math.abs(sfRound(val * (1 - 1e-6), sf) - r) > 0) continue // not on a rounding edge
      const shown = form === 'ab-cd' ? `${num(a)} ${TIMES} ${num(b)} ${MINUS} ${num(c)} ${TIMES} ${num(d)}` : form === '(a-c)/b' ? `(${num(a)} ${MINUS} ${num(c)}) ${DIVIDE} ${num(b)}` : frac(`${num(a)} + ${num(c)}`, `${num(b)} + ${num(d)}`)
      return q({
        prompt: `Use a calculator to evaluate this, correct to ${SFW(sf)}.${big(shown)}`,
        answer: numA(r),
        calc: true,
        hint: 'Use the calculator (with brackets where needed), then round to the number of significant figures asked for.',
        steps: [`= ${num(Number(val.toPrecision(9)))}…`, `≈ ${num(r)} (${SFW(sf)})`],
        meta: { t: 'sfCalc', a, b, c, d, form, sf },
      })
    }
    const x = kind === 'crowd' ? int(15000, 99999) : int(10000000, 99999999)
    const sf = kind === 'crowd' ? 3 : pick([1, 2])
    const r = sfRound(x, sf)
    return q({
      prompt: kind === 'crowd' ? `A total of ${grouped(String(x))} people went to a football final. Write this number correct to ${SFW(sf)}.` : `A company made a profit of $${grouped(String(x))}. Round the profit to ${SFW(sf)}.`,
      answer: numA(r),
      prefix: kind === 'profit' ? '$' : undefined,
      hint: 'Count from the first digit, round, then fill the rest of the places with zeros.',
      steps: [`${grouped(String(x))} ≈ ${num(r)}`],
      meta: { t: 'sfRound', s: String(x), sf },
    })
  }
}
const ex507 = (level: Level): Question => (level === 1 ? (chance(0.5) ? sfCount() : sfRoundQ(1)) : level === 2 ? sfRoundQ(2) : chance(0.3) ? sfCount() : sfContext())

// ================================================================= 5.08 Scientific notation

const sci = (m: number, n: number) => `${num(m)} ${TIMES} 10<sup>${n < 0 ? MINUS + -n : n}</sup>`
/** a number m × 10^n with m having 1 to 3 significant figures */
function sciNum(nLo: number, nHi: number): { m: number; n: number; value: number } {
  const digits = pick([1, 2, 2, 3])
  const m = digits === 1 ? int(1, 9) : digits === 2 ? int(11, 99) / 10 : int(101, 999) / 100
  const n = int(nLo, nHi)
  return { m: Number(m.toPrecision(digits)), n, value: Number(`${m}e${n}`) }
}
/** the decimal digits of x (to 12 significant figures), built from its exponential form so 4.72e-7 gives
 *  0.000000472 and not 0.000000471999… */
export function decStr(x: number): string {
  const [mant, e] = x.toExponential(11).split('e')
  const neg = mant.startsWith('-')
  const digits = mant.replace('-', '').replace('.', '').replace(/0+$/, '') || '0'
  const exp = Number(e)
  let out: string
  if (exp >= 0) out = digits.length > exp + 1 ? digits.slice(0, exp + 1) + '.' + digits.slice(exp + 1) : digits + '0'.repeat(exp + 1 - digits.length)
  else out = '0.' + '0'.repeat(-exp - 1) + digits
  return (neg ? '-' : '') + out
}
/** a decimal for writing on the page, e.g. 0.000 000 472 */
const plain = (value: number) => grouped(decStr(value))
/** x in scientific notation as HTML, with up to sig significant figures in front */
function sciOf(x: number, sig = 10): string {
  const [m, e] = x.toExponential(sig - 1).split('e')
  return sci(Number(m), Number(e))
}

function toSci(level: Level): Question {
  const s = level === 1 ? sciNum(1, 11) : sciNum(-9, -1)
  return q({
    prompt: `Write ${plain(s.value)} in scientific notation.`,
    answer: { kind: 'sci', value: s.value },
    hint: 'Write the significant figures as a number between 1 and 10, then count how many places the decimal point moves.' + (level === 1 ? '' : ' Small numbers have a negative power of 10.'),
    steps: [`Move the decimal point ${Math.abs(s.n)} place${Math.abs(s.n) === 1 ? '' : 's'} to the ${s.n > 0 ? 'left' : 'right'}.`, `${plain(s.value)} = ${sci(s.m, s.n)}`],
    meta: { t: 'toSci', s: plain(s.value) },
  })
}
function fromSci(level: Level): Question {
  const s = level === 1 ? sciNum(1, 8) : sciNum(-8, -1)
  return q({
    prompt: `Write ${sci(s.m, s.n)} as a decimal number.`,
    answer: numA(s.value),
    hint: s.n > 0 ? `Move the decimal point ${s.n} places to the right.` : `Move the decimal point ${-s.n} place${s.n === -1 ? '' : 's'} to the left.`,
    steps: [`${sci(s.m, s.n)} = ${plain(s.value)}`],
    meta: { t: 'fromSci', m: s.m, n: s.n },
  })
}
/** [what, smallest and largest number in front (×10), power of 10, unit]: realistic sizes */
const MEASURES: [string, number, number, number, string][] = [
  ['A blue whale can have a mass of up to', 13, 19, 5, 'kg'],
  ['The diameter of a red blood cell is about', 60, 80, -6, 'm'],
  ['The thickness of a sheet of paper is about', 10, 12, -4, 'm'],
  ['The distance from Earth to the Moon is about', 36, 41, 5, 'km'],
  ['The width of a human hair is about', 50, 90, -6, 'm'],
  ['The population of Australia is about', 26, 28, 7, 'people'],
  ['A bacterium is about', 10, 50, -7, 'm long'],
  ['The distance from the Sun to Neptune is about', 44, 46, 9, 'km'],
]
function sciMeasure(): Question {
  const [what, lo, hi, n, unit] = pick(MEASURES)
  const m = int(lo, hi) / 10
  const s = { m, n, value: Number(`${m}e${n}`) }
  return q({
    prompt: `${what} ${plain(s.value)} ${unit}. Write this number in scientific notation.`,
    answer: { kind: 'sci', value: s.value },
    suffix: unit === 'people' ? undefined : unit.split(' ')[0],
    hint: 'Write the significant figures as a number between 1 and 10, then count the places the decimal point moves.',
    steps: [`${plain(s.value)} = ${sci(s.m, s.n)}`],
    meta: { t: 'toSci', s: plain(s.value) },
  })
}
function sciCompare(): Question {
  if (chance()) {
    const a = sciNum(-9, 9)
    let b = sciNum(-9, 9)
    if (chance()) b = { ...b, n: a.n, value: Number(`${b.m}e${a.n}`) }
    if (a.value === b.value) return sciCompare()
    const big1 = a.value > b.value ? a : b
    return q({
      prompt: `Which number is larger?`,
      answer: mcFixedA([sci(a.m, a.n), sci(b.m, b.n)], sci(big1.m, big1.n)),
      hint: 'Compare the powers of 10 first (−3 is bigger than −7). If they are the same, compare the numbers in front.',
      steps: [a.n !== b.n ? `10<sup>${Math.max(a.n, b.n)}</sup> is larger than 10<sup>${Math.min(a.n, b.n)}</sup>.` : `The powers of 10 are the same, so compare ${num(a.m)} and ${num(b.m)}.`, `The larger number is ${sci(big1.m, big1.n)}.`],
      meta: { t: 'sciLarger', a: a.value, b: b.value },
    })
  }
  const nums = [sciNum(-6, 9), sciNum(-6, 9), sciNum(-6, 9)]
  if (new Set(nums.map((x) => x.value)).size < 3) return sciCompare()
  const desc = chance(0.3)
  const sorted = nums.slice().sort((x, y) => (desc ? y.value - x.value : x.value - y.value))
  const text = (arr: typeof nums) => arr.map((x) => sci(x.m, x.n)).join(', ')
  const perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]].map((o) => o.map((i) => sorted[i]))
  const right = text(sorted)
  const wrong = sample(perms.slice(1), 3).map(text)
  return q({
    prompt: `Write these numbers in ${desc ? 'descending' : 'ascending'} order.${big(text(shuffle(nums)))}`,
    answer: mcA(right, wrong),
    hint: `${desc ? 'Descending: largest first' : 'Ascending: smallest first'}. Compare the powers of 10 first.`,
    steps: [`In ${desc ? 'descending' : 'ascending'} order: ${right}`],
    meta: { t: 'sciOrder', values: sorted.map((x) => x.value), desc },
  })
}
const ex508 = (level: Level): Question => (level === 1 ? (chance() ? toSci(1) : fromSci(1)) : level === 2 ? pick([() => toSci(2), () => fromSci(2), sciMeasure])() : sciCompare())

// ================================================================= 5.09 Scientific notation on a calculator

function sciExact(): Question {
  const kind = pick(['mul', 'div', 'pow', 'root'] as const)
  const a = int(2, 4)
  const b = int(2, 3)
  const m = int(2, 9)
  const n = int(-6, 9)
  let shown = ''
  let value = 0
  if (kind === 'mul') {
    shown = `(${sci(a, m)}) ${TIMES} (${sci(b, n)})`
    value = a * b * 10 ** (m + n)
  } else if (kind === 'div') {
    const top = a * b
    shown = `(${sci(top, m)}) ${DIVIDE} (${sci(b, n)})`
    value = a * 10 ** (m - n)
  } else if (kind === 'pow') {
    const e = pick([2, 3])
    shown = `(${sci(a, m)})<sup>${e}</sup>`
    value = a ** e * 10 ** (m * e)
  } else {
    const r = int(2, 9)
    const k = int(1, 6)
    shown = sqrt(sci(r * r, 2 * k))
    value = r * 10 ** k
  }
  value = Number(value.toPrecision(12))
  return q({
    prompt: `Evaluate, giving the answer in scientific notation.${big(shown)}`,
    answer: { kind: 'sci', value },
    calc: true,
    hint: 'Use the ×10ˣ (or EXP) key, or work with the numbers and the powers of 10 separately.',
    steps: [`= ${plain(value)} = ${sciOf(value)}`],
    meta: { t: 'sciCalc', kind, value },
  })
}
function sciRound(): Question {
  const kind = pick(['mul', 'div', 'pow'] as const)
  const A = sciNum(2, 9)
  const B = sciNum(-5, 9)
  const sf = pick([2, 3])
  let value: number
  let shown: string
  if (kind === 'mul') {
    value = A.value * B.value
    shown = `(${sci(A.m, A.n)}) ${TIMES} (${sci(B.m, B.n)})`
  } else if (kind === 'div') {
    value = A.value / B.value
    shown = `(${sci(A.m, A.n)}) ${DIVIDE} (${sci(B.m, B.n)})`
  } else {
    value = A.value ** 3
    shown = `(${sci(A.m, A.n)})<sup>3</sup>`
  }
  const r = sfRound(value, sf)
  if (sfRound(value * (1 + 1e-7), sf) !== r || sfRound(value * (1 - 1e-7), sf) !== r) return sciRound()
  return q({
    prompt: `Evaluate, giving the answer in scientific notation correct to ${SFW(sf)}.${big(shown)}`,
    answer: { kind: 'sci', value: r, sf },
    calc: true,
    hint: 'Use the ×10ˣ (or EXP) key; no brackets are needed around each number. Then round to the significant figures asked for.',
    steps: [`= ${sciOf(value, 8)}…`, `≈ ${sciOf(r, sf)}`],
    meta: { t: 'sciRound', kind, a: A.value, b: B.value, sf },
  })
}
function sciProblem(): Question {
  const kind = pick(['atoms', 'pages', 'sunlight', 'hydrogen', 'lightYear', 'thunder'] as const)
  switch (kind) {
    case 'atoms': {
      const c = int(3, 9)
      const at = int(11, 99) / 10
      const value = Number((c * at).toPrecision(6)) * 10 ** 18
      return q({ prompt: `A collection of ${c} × 10<sup>9</sup> cells each contains about ${num(at)} × 10<sup>9</sup> atoms. About how many atoms is that altogether? Give the answer in scientific notation.`, answer: { kind: 'sci', value: Number(value.toPrecision(10)) }, calc: true, hint: 'Multiply the two numbers. Add the powers of 10.', steps: [`(${c} × 10<sup>9</sup>) × (${num(at)} × 10<sup>9</sup>) = ${num(Number((c * at).toPrecision(6)))} × 10<sup>18</sup>`, `= ${sciOf(value)}`], meta: { t: 'sciProblem', kind, c, at } })
    }
    case 'pages': {
      const cm = int(25, 60) / 10
      const pages = pick([500, 800, 1000, 1250, 1600, 2000, 2500]) // only 2s and 5s, so the answer ends
      const value = (cm * 10) / pages
      return q({ prompt: `A book is ${num(cm)} cm thick (not counting the cover) and has ${pages} pages. Find the thickness of one page in millimetres, in scientific notation.`, answer: { kind: 'sci', value: Number(value.toPrecision(10)) }, suffix: 'mm', calc: true, hint: 'Change centimetres to millimetres first, then divide by the number of pages.', steps: [`${num(cm)} cm = ${num(cm * 10)} mm`, `${num(cm * 10)} ÷ ${pages} = ${plain(value)} = ${sciOf(value)} mm`], meta: { t: 'sciProblem', kind, cm, pages } })
    }
    case 'sunlight': {
      const d = pick([1.44, 1.47, 1.5, 1.52])
      const value = (d * 1e8) / 3e5
      return q({ prompt: `The Earth is ${num(d)} × 10<sup>8</sup> km from the Sun, and light travels at 3 × 10<sup>5</sup> km/s. How many seconds does light from the Sun take to reach Earth, correct to the nearest second?`, answer: numA(value, 0), suffix: 's', calc: true, hint: 'Time = distance ÷ speed.', steps: [`(${num(d)} × 10<sup>8</sup>) ÷ (3 × 10<sup>5</sup>) = ${num(Number(value.toPrecision(10)))} s`], meta: { t: 'sciProblem', kind, d } })
    }
    case 'hydrogen': {
      const t = int(4, 7)
      const value = t * 1e6 * 365.25 * 24 * 3600
      const r = sfRound(value, 2)
      return q({ prompt: `The Sun uses about ${t} million tonnes of hydrogen every second. How many tonnes does it use in a year of 365.25 days? Give the answer in scientific notation, correct to 2 significant figures.`, answer: { kind: 'sci', value: r, sf: 2 }, suffix: 'tonnes', calc: true, hint: 'Work out the number of seconds in a year (365.25 × 24 × 60 × 60), then multiply.', steps: [`Seconds in a year = 365.25 × 24 × 60 × 60 = 31 557 600`, `${t} × 10<sup>6</sup> × 31 557 600 = ${sciOf(value, 5)}`, `≈ ${sciOf(r, 2)} tonnes`], meta: { t: 'sciProblem', kind, tt: t } })
    }
    case 'lightYear': {
      const days = pick([365, 366])
      const value = 3e5 * days * 24 * 3600
      const r = sfRound(value, 2)
      return q({ prompt: `Light travels at about 3 × 10<sup>5</sup> km per second. How far does it travel in a ${days === 366 ? 'leap year (366 days)' : 'year of 365 days'}? Give the answer in scientific notation, correct to 2 significant figures.`, answer: { kind: 'sci', value: r, sf: 2 }, suffix: 'km', calc: true, hint: 'Find the number of seconds in the year, then multiply by the speed.', steps: [`Seconds = ${days} × 24 × 60 × 60 = ${num(days * 86400)}`, `3 × 10<sup>5</sup> × ${num(days * 86400)} = ${sciOf(value, 5)}`, `≈ ${sciOf(r, 2)} km`], meta: { t: 'sciProblem', kind, days } })
    }
    case 'thunder': {
      const km = int(5, 40)
      const value = (km * 1000) / 330
      return q({ prompt: `A storm is ${km} km away. Sound travels at 330 metres per second. How long does the thunder take to reach you, correct to one decimal place?`, answer: numA(value, 1), suffix: 's', calc: true, hint: 'Change kilometres to metres, then time = distance ÷ speed.', steps: [`${km} km = ${num(km * 1000)} m`, `${num(km * 1000)} ÷ 330 = ${num(Number(value.toPrecision(8)))} ≈ ${num(Math.round(value * 10) / 10, 1)} s`], meta: { t: 'sciProblem', kind, km } })
    }
  }
}
const ex509 = (level: Level): Question => (level === 1 ? sciExact() : level === 2 ? sciRound() : sciProblem())

// ================================================================= Power plus (extension)

function ppSubstitute(): Question {
  const u = int(2, 3)
  const vv = int(2, 5)
  const w = int(2, 6)
  const forms: { shown: string; value: [number, number]; q: string }[] = [
    { shown: `${w}${v('w')}<sup>${MINUS}2</sup>`, value: [w, w * w], q: `${w}*w^(-2)` },
    { shown: `${MINUS}${v('u')}<sup>${MINUS}3</sup>`, value: [-1, u ** 3], q: `-(u^(-3))` },
    { shown: `${v('v')}${v('u')}<sup>3</sup>`, value: [vv * u ** 3, 1], q: `v*u^3` },
    { shown: `(${v('w')}${v('u')})<sup>2</sup>`, value: [(w * u) ** 2, 1], q: `(w*u)^2` },
    { shown: `(${frac(`2${v('v')}`, v('w'))})<sup>${MINUS}1</sup>`, value: [w, 2 * vv], q: `((2*v)/w)^(-1)` },
    { shown: `${v('u')}<sup>0</sup>(${v('v')}${v('w')})<sup>${MINUS}1</sup>`, value: [1, vv * w], q: `u^0*(v*w)^(-1)` },
  ]
  const f = pick(forms)
  const g = gcd(Math.abs(f.value[0]), f.value[1])
  const [n, d] = [f.value[0] / g, f.value[1] / g]
  return q({
    prompt: `If ${v('u')} = ${u}, ${v('v')} = ${vv} and ${v('w')} = ${w}, evaluate the expression below.${d !== 1 ? ' Give the answer as a fraction.' : ''}${big(f.shown)}`,
    answer: d === 1 ? numA(n) : { kind: 'frac', n, d },
    hint: 'Substitute, then use the index laws: a negative index means “one over”.',
    steps: [`Substitute ${v('u')} = ${u}, ${v('v')} = ${vv}, ${v('w')} = ${w}.`, `= ${d === 1 ? n : (n < 0 ? MINUS : '') + frac(Math.abs(n), d)}`],
    meta: { t: 'subst', q: f.q, u, v: vv, w },
  })
}
function ppVariableIndex(): Question {
  const x = pick(['a', 'b', 'n', 'p', 't'])
  const b = pick([2, 3, 5, 6, 10])
  const k = int(2, 4)
  const forms: { shown: string; ans: string; q: string; out: string }[] = [
    { shown: `${p(b, v(x))} ${TIMES} ${p(b, v(x))}`, ans: `${b}^(2${x})`, q: `${b}^${x}*${b}^${x}`, out: p(b, '2' + v(x)) },
    { shown: `${b}<sup>${v(x)} + ${k}</sup> ${DIVIDE} ${p(b, v(x))}`, ans: `${b ** k}`, q: `${b}^(${x}+${k})/${b}^${x}`, out: `${p(b, k)} = ${b ** k}` },
    { shown: `(${p(b, k)})<sup>${v(x)}</sup>`, ans: `${b}^(${k}${x})`, q: `(${b}^${k})^${x}`, out: p(b, k + v(x)) },
    { shown: `${p(b, v(x))} ${TIMES} (${p(b, v(x))})<sup>2</sup>`, ans: `${b}^(3${x})`, q: `${b}^${x}*(${b}^${x})^2`, out: p(b, '3' + v(x)) },
    { shown: `${b}<sup>${v(x)} − 1</sup> ${TIMES} ${b}<sup>${v(x)} + 1</sup>`, ans: `${b}^(2${x})`, q: `${b}^(${x}-1)*${b}^(${x}+1)`, out: p(b, '2' + v(x)) },
  ]
  const f = pick(forms)
  return q({
    prompt: `Simplify.${big(f.shown)}`,
    answer: exprA(f.ans),
    hint: 'The index laws work with letters as indices too: add, subtract or multiply the indices.',
    steps: [`= ${f.out}`],
    meta: { t: 'expr', q: f.q, varIndex: true },
  })
}
function ppSciForm(): Question {
  const kind = pick(['bigM', 'smallM', 'words'] as const)
  if (kind === 'words') {
    const w = pick([['thousand', 3], ['million', 6], ['billion', 9], ['thousandths', -3], ['millionths', -6], ['billionths', -9]] as [string, number][])
    const m = int(11, 99) / 10
    const value = Number(`${m}e${w[1]}`)
    return q({ prompt: `Write ${num(m)} ${w[0]} in scientific notation.`, answer: { kind: 'sci', value }, hint: `One ${w[0].replace(/s$/, '')} is 10<sup>${w[1] < 0 ? MINUS + -w[1] : w[1]}</sup>.`, steps: [`${num(m)} ${w[0]} = ${sci(m, w[1])}`], meta: { t: 'sciWords', m, e: w[1] } })
  }
  const big0 = kind === 'bigM'
  const m = big0 ? int(1001, 9999) / 10 : int(11, 99) / 100
  const n = big0 ? int(3, 9) : -int(3, 9)
  const value = Number(`${m}e${n}`)
  return q({
    prompt: `Write in scientific notation.${big(`${num(m)} ${TIMES} 10<sup>${n < 0 ? MINUS + -n : n}</sup>`)}`,
    answer: { kind: 'sci', value: Number(value.toPrecision(10)) },
    hint: 'The number in front must be between 1 and 10. Moving its decimal point changes the power of 10 to match.',
    steps: [`${num(m)} = ${sciOf(m)}`, `So the power of 10 changes by ${Number(m.toExponential().split('e')[1])}: ${sciOf(value)}`],
    meta: { t: 'sciForm', m, n },
  })
}
function ppLastDigit(): Question {
  const b = pick([2, 3, 7, 8])
  const e = int(20, 400)
  const cycle: number[] = []
  let d = b % 10
  do {
    cycle.push(d)
    d = (d * b) % 10
  } while (d !== cycle[0])
  const last = cycle[(e - 1) % cycle.length]
  return q({
    prompt: `What is the last digit of ${p(b, e)}?`,
    answer: numA(last),
    hint: `Look at the last digits of ${b}<sup>1</sup>, ${b}<sup>2</sup>, ${b}<sup>3</sup>, … They repeat in a cycle.`,
    steps: [`The last digits of powers of ${b} repeat: ${cycle.join(', ')}, … (a cycle of ${cycle.length}).`, `${e} ÷ ${cycle.length} leaves a remainder of ${e % cycle.length}, so the last digit is ${last}.`],
    meta: { t: 'lastDigit', b, e },
  })
}
const exPP = (level: Level): Question => (level === 1 ? ppSubstitute() : level === 2 ? (chance() ? ppVariableIndex() : ppSciForm()) : chance() ? ppLastDigit() : ppVariableIndex())

// ================================================================= skills, test

const T = (skill: string, level: Level, gen: () => Question): TestItem => ({ skill, level, gen: () => gen() })

export const NCM5_TEST: TestItem[] = [
  // about two questions per exercise (16 in all), in the order of Test Yourself 5 (its PATH question 6 is left out)
  T('y9-ind-muldiv', 1, numMulDiv),
  T('y9-ind-muldiv', 2, () => algMulDiv(2)),
  T('y9-ind-power', 1, () => powerOfPower(1)),
  T('y9-ind-power', 2, () => powerOfPower(2)),
  T('y9-ind-products', 1, () => products(1)),
  T('y9-ind-products', 2, () => products(2)),
  T('y9-ind-zero', 1, () => ex504(1)),
  T('y9-ind-neg', 1, negPositive),
  T('y9-ind-neg', 2, negWrite),
  T('y9-ind-summary', 1, summaryNum),
  T('y9-ind-summary', 3, summaryAlg),
  T('y9-num-sigfig', 1, () => sfRoundQ(1)),
  T('y9-num-sigfig', 2, () => sfRoundQ(2)),
  T('y9-num-sci', 2, () => toSci(2)),
  T('y9-num-sci', 1, () => fromSci(chance() ? 1 : 2)),
  T('y9-num-scicalc', 2, sciRound),
]

export const NCM5_SKILLS: Skill[] = [
  {
    id: 'y9-ind-muldiv',
    title: 'Multiplying and dividing terms with the same base',
    ref: ref('5.01'),
    outcomes: IND,
    summary: 'Add the indices to multiply, subtract them to divide.',
    learn: {
      intro: `<p>When terms have the same base, multiply by <b>adding</b> the indices and divide by <b>subtracting</b> them:</p><div class="big">a<sup>m</sup> × a<sup>n</sup> = a<sup>m + n</sup> &emsp; a<sup>m</sup> ÷ a<sup>n</sup> = a<sup>m − n</sup></div><p>Numbers in front are multiplied or divided as usual: 4${v('m')}<sup>2</sup> × 3${v('m')}<sup>6</sup> = 12${v('m')}<sup>8</sup>.</p>`,
      keyPoints: ['A base on its own has index 1: 10 = 10<sup>1</sup>, x = x<sup>1</sup>.', 'Keep the base: 5<sup>12</sup> × 5<sup>3</sup> = 5<sup>15</sup>, not 25<sup>15</sup>.', 'With several letters, deal with each letter separately.'],
      vocab: [['base', 'the number or letter being raised to a power, e.g. 2 in 2<sup>5</sup>'], ['index (power, exponent)', 'how many times the base is multiplied, e.g. 5 in 2<sup>5</sup>']],
    },
    gen: ex501,
    levels: { 1: 'Powers of numbers', 2: 'Terms with letters and numbers in front', 3: 'Three terms; answers with fractions' },
  },
  {
    id: 'y9-ind-power',
    title: 'Power of a power',
    ref: ref('5.02'),
    outcomes: IND,
    summary: 'Multiply the indices when a power is raised to another power.',
    learn: {
      intro: `<p>Raising a power to another power multiplies the indices:</p><div class="big">(a<sup>m</sup>)<sup>n</sup> = a<sup>m × n</sup></div><p>A number in front is raised to the power too: (5${v('v')}<sup>4</sup>)<sup>3</sup> = 125${v('v')}<sup>12</sup>.</p>`,
      keyPoints: ['(d<sup>3</sup>)<sup>5</sup> = d<sup>15</sup>: multiply, don’t add.', 'A negative number to an even power is positive; to an odd power it stays negative: (−3t<sup>4</sup>)<sup>3</sup> = −27t<sup>12</sup>.'],
    },
    gen: ex502,
    levels: { 1: 'Powers of powers', 2: 'With a number in front', 3: 'With negatives' },
  },
  {
    id: 'y9-ind-products',
    title: 'Powers of products and quotients',
    ref: ref('5.03'),
    outcomes: IND,
    summary: 'Raise every part of a product or fraction to the power.',
    learn: {
      intro: `<div class="big">(ab)<sup>n</sup> = a<sup>n</sup>b<sup>n</sup> &emsp; (${frac('a', 'b')})<sup>n</sup> = ${frac('a<sup>n</sup>', 'b<sup>n</sup>')}</div><p>Every factor inside the bracket, including the number in front and its sign, is raised to the power.</p>`,
      keyPoints: ['(−2gh<sup>2</sup>)<sup>5</sup> = −32g<sup>5</sup>h<sup>10</sup>.', '(4k<sup>2</sup>/5)<sup>3</sup> = 64k<sup>6</sup>/125.', 'Do the bracket powers first, then multiply or divide.'],
    },
    gen: ex503,
    levels: { 1: 'Powers of products', 2: 'Negatives and fractions', 3: 'Combined with multiplying and dividing' },
  },
  {
    id: 'y9-ind-zero',
    title: 'The zero index',
    ref: ref('5.04'),
    outcomes: IND,
    summary: 'Anything (except 0) to the power 0 is 1.',
    learn: {
      intro: `<p>a<sup>m</sup> ÷ a<sup>m</sup> = 1, and also a<sup>m − m</sup> = a<sup>0</sup>. So <b>a<sup>0</sup> = 1</b>.</p><p>Look closely at what the 0 applies to: (3r)<sup>0</sup> = 1, but 3r<sup>0</sup> = 3 × 1 = 3, and −8<sup>0</sup> = −1.</p>`,
      keyPoints: ['(−8)<sup>0</sup> = 1, but −8<sup>0</sup> = −1.', 'Work out each power of 0 first, then add, subtract, multiply or divide.'],
    },
    gen: ex504,
    levels: { 1: 'One term to the power 0', 2: 'Sums and differences', 3: 'Combined with the other index laws' },
  },
  {
    id: 'y9-ind-neg',
    title: 'Negative indices',
    ref: ref('5.05'),
    outcomes: IND,
    summary: 'A negative index means “one over”: a⁻ⁿ = 1/aⁿ.',
    learn: {
      intro: `<div class="big">a<sup>−n</sup> = ${frac(1, 'a<sup>n</sup>')} &emsp; a<sup>−1</sup> = ${frac(1, 'a')} &emsp; (${frac('a', 'b')})<sup>−1</sup> = ${frac('b', 'a')}</div><p>For example 2<sup>−3</sup> = ${frac(1, '2<sup>3</sup>')} = ${frac(1, 8)}. A negative index doesn’t make the number negative.</p>`,
      keyPoints: ['5<sup>−2</sup> = 1/25, not −25 and not −10.', 'Write 1/c<sup>3</sup> with a negative index as c<sup>−3</sup> (type c^-3).', 'A power of −1 gives the reciprocal: (2/7)<sup>−1</sup> = 7/2.'],
      vocab: [['reciprocal', 'one divided by the number: the reciprocal of 9 is 1/9, of 2/3 is 3/2']],
    },
    gen: ex505,
    levels: { 1: 'Positive index or a fraction', 2: 'Write with a negative index; power of −1', 3: 'Index laws that give negative indices' },
  },
  {
    id: 'y9-ind-summary',
    title: 'Summary of the index laws',
    ref: ref('5.06'),
    outcomes: IND,
    summary: 'Use all the index laws together.',
    learn: {
      intro: `<div class="big">a<sup>m</sup> × a<sup>n</sup> = a<sup>m+n</sup> &emsp; a<sup>m</sup> ÷ a<sup>n</sup> = a<sup>m−n</sup> &emsp; (a<sup>m</sup>)<sup>n</sup> = a<sup>mn</sup></div><div class="big">(ab)<sup>n</sup> = a<sup>n</sup>b<sup>n</sup> &emsp; a<sup>0</sup> = 1 &emsp; a<sup>−n</sup> = ${frac(1, 'a<sup>n</sup>')}</div>`,
      keyPoints: ['Powers of brackets first, then multiply and divide from left to right.', 'Leave answers with positive indices unless asked otherwise.'],
    },
    gen: ex506,
    levels: { 1: 'Powers of numbers in index notation', 2: 'Evaluate', 3: 'Algebraic terms' },
  },
  {
    id: 'y9-ind-negalg',
    title: 'Negative indices with pronumerals (Path)',
    ref: 'NCM 9 Ex 5.05–5.06 (Path)',
    tag: 'extension',
    outcomes: IND_P,
    summary: 'Simplify algebraic terms with negative indices, writing the answer with positive indices.',
    learn: {
      intro: `<p>Only the part with the negative index goes below the fraction bar: 3${v('n')}<sup>−2</sup> = ${frac(3, `${v('n')}<sup>2</sup>`)}, but (3${v('n')})<sup>−2</sup> = ${frac(1, `9${v('n')}<sup>2</sup>`)}.</p><p>The index laws work with negative indices too: ${v('q')}<sup>5</sup> × ${v('q')}<sup>−2</sup> = ${v('q')}<sup>3</sup>.</p>`,
      keyPoints: ['This is Path content (MA5-IND-P-01), beyond the core course.', 'p<sup>−2</sup>q<sup>3</sup> = q<sup>3</sup>/p<sup>2</sup>.', '(x/3)<sup>−1</sup> = 3/x.'],
    },
    gen: negAlg,
    levels: { 1: 'One negative index', 2: 'Brackets and two letters', 3: 'Index laws with negative indices' },
  },
  {
    id: 'y9-num-sigfig',
    title: 'Significant figures',
    ref: ref('5.07'),
    outcomes: MAG,
    summary: 'Count significant figures and round to a number of significant figures.',
    learn: {
      intro: '<p>The <b>first significant figure</b> is the first digit that isn’t 0. To round to 3 significant figures, keep 3 digits from there and round as usual: 548 307 ≈ 548 000, and 0.007 39 ≈ 0.007 to one significant figure.</p>',
      keyPoints: ['Zeros between other digits count: 0.003 05 has 3 significant figures.', 'Zeros at the end of a decimal count: 63.70 has 4.', 'Zeros at the end of a whole number, and at the start of a decimal, are placeholders: 7600 has 2.'],
      vocab: [['significant figures', 'the digits that tell how many, starting from the first non-zero digit']],
    },
    gen: ex507,
    levels: { 1: 'Count significant figures; round to 2 or 3', 2: 'Round decimals to 1 or 2', 3: 'Calculations and everyday numbers' },
  },
  {
    id: 'y9-num-sci',
    title: 'Scientific notation',
    ref: ref('5.08'),
    outcomes: MAG,
    summary: 'Write very large and very small numbers as m × 10ⁿ, and compare them.',
    learn: {
      intro: `<p>In <b>scientific notation</b> a number is written as ${v('m')} × 10<sup>${v('n')}</sup>, where ${v('m')} is between 1 and 10 and ${v('n')} is an integer: 764 000 000 000 = 7.64 × 10<sup>11</sup> and 0.000 000 472 = 4.72 × 10<sup>−7</sup>.</p><p>Type it as 7.64 × 10^11 (or 7.64 x 10^11).</p>`,
      keyPoints: ['Large numbers have positive powers of 10; small numbers (less than 1) have negative powers.', 'To compare, look at the powers of 10 first, then the numbers in front.'],
    },
    gen: ex508,
    levels: { 1: 'Large numbers', 2: 'Small numbers and measurements', 3: 'Compare and order' },
  },
  {
    id: 'y9-num-scicalc',
    title: 'Scientific notation on a calculator',
    ref: ref('5.09'),
    outcomes: MAG,
    summary: 'Calculate with scientific notation and round to significant figures.',
    learn: {
      intro: '<p>Enter a number in scientific notation with the ×10ˣ (or EXP) key: 4.25 ×10ˣ 7. You don’t need brackets around each number. Estimate first by rounding each number in front.</p>',
      keyPoints: ['(4.25 × 10<sup>7</sup>) × (8.2 × 10<sup>6</sup>) = 3.485 × 10<sup>14</sup>.', 'Round the number in front to the significant figures asked for.'],
    },
    gen: ex509,
    levels: { 1: 'Exact answers', 2: 'Rounded to significant figures', 3: 'Problems: light, sound, atoms and pages' },
  },
  {
    id: 'y9-ind-powerplus',
    title: 'Power plus: indices',
    ref: 'NCM 9 Power plus 5',
    tag: 'extension',
    outcomes: IND,
    summary: 'Substitution with negative indices, letters as indices, scientific notation and last digits.',
    learn: {
      intro: `<p>The index laws work with letters as the indices too: 5<sup>${v('a')}</sup> × 5<sup>${v('a')}</sup> = 5<sup>2${v('a')}</sup> and (3<sup>3</sup>)<sup>${v('p')}</sup> = 3<sup>3${v('p')}</sup>.</p><p>The last digits of powers repeat in cycles, e.g. 2, 4, 8, 6, 2, 4, …</p>`,
      keyPoints: ['Substitute first, then use the index laws.', 'For 438.2 × 10<sup>9</sup>, move the decimal point and change the power: 4.382 × 10<sup>11</sup>.'],
    },
    gen: exPP,
    levels: { 1: 'Substitution', 2: 'Letters as indices; tidying scientific notation', 3: 'Last digits of big powers' },
  },
]
