// Class games for New Century Maths 9 Advanced (Cengage) Chapter 1, Algebra: one set of quick questions for each
// exercise, 1.01 to 1.15.
//
// Much of the chapter extends NCM 8 Chapter 3, so those sets reuse its kinds (checked by that chapter's checks, see
// reuse.ts). New kinds: adding, subtracting, multiplying and dividing algebraic fractions, expanding with negatives,
// mixed expansions, factorising by grouping and difference of two squares, quadratic trinomials (monic and
// non-monic), mixed factorisations and simplifying algebraic fractions by factorising (tests/game-checks/ncm9-ch1.ts).
//
// Syllabus: NSW Mathematics K–10 (2022), Stage 5.
// - Core, Algebraic techniques A, MA5-ALG-C-01: algebraic fractions with numerical denominators (1.03), expanding
//   (1.05) and binomial products (1.07). 1.01–1.02 revise Stage 4 (MA4-ALG-C-01).
// - Path, Algebraic techniques B, MA5-ALG-P-01: operations with algebraic fractions (1.04), factorising with the
//   HCF (1.06) and monic quadratic trinomials (1.12).
// - Path, Algebraic techniques C, MA5-ALG-P-02: special products (1.08–1.10, starred), factorising special products
//   and grouping (1.11), non-monic trinomials (1.13), mixed factorisations (1.14, starred) and algebraic fractions
//   simplified by factorising (1.15, starred).
// Path content is beyond the core, so those sets are labelled extension in their teacher notes (with the outcome).
import type { GameChapter, GameQuestion, GameSet } from '@/lib/game/types'
import { chance, ex, gq, int, intExcept, mk, pick } from './helpers'
import { NCM8_CH3 } from './ncm8-ch3'
import { reuse } from './reuse'

const ALG4 = 'MA4-ALG-C-01'
const ALG = 'MA5-ALG-C-01'
const P1 = 'Stage 5 Path content (Algebraic techniques B, MA5-ALG-P-01): extension beyond the core.'
const P2 = 'Stage 5 Path content (Algebraic techniques C, MA5-ALG-P-02): extension beyond the core.'
const big = (s: string) => `<div class="big">${s}</div>`
const E = ex
const LET = ['a', 'b', 'k', 'm', 'n', 'p', 't', 'x', 'y']
const gcd = (a: number, c: number): number => (c === 0 ? Math.abs(a) : gcd(c, a % c))
const lcm = (a: number, c: number) => (a * c) / gcd(a, c)
/** a term: (3, 'x') → "3x", (1, 'x') → "x", (−1, 'x') → "-x", (5, '') → "5" */
const term = (c: number, vs: string) => (vs === '' ? String(c) : c === 1 ? vs : c === -1 ? `-${vs}` : `${c}${vs}`)
/** a sum of terms with tidy signs */
const sum = (ts: [number, string][]) =>
  ts
    .filter(([c]) => c !== 0)
    .map(([c, vs], i) => (i === 0 ? term(c, vs) : c < 0 ? ` - ${term(-c, vs)}` : ` + ${term(c, vs)}`))
    .join('') || '0'
/** a linear bracket (ax + b) */
const lin = (a: number, L: string, b: number) => `(${sum([[a, L], [b, '']])})`
/** a quadratic ax² + bx + c */
const quad = (a: number, b: number, c: number, L: string) => sum([[a, `${L}^2`], [b, L], [c, '']])
/** a fraction n/d as ex() source, simplified, with the sign out the front */
function fr(n: number, d: number, top = ''): string {
  const g = gcd(n, d) || 1
  let [a, c] = [n / g, d / g]
  if (c < 0) [a, c] = [-a, -c]
  const t = top ? term(a, top) : String(a)
  if (c === 1) return t
  return a < 0 ? `-frac{${top ? term(-a, top) : -a}}{${c}}` : `frac{${t}}{${c}}`
}
/** three different wrong options, likely first */
const pickWrong = (right: string, likely: string[]) => likely.filter((w, i) => w !== right && likely.indexOf(w) === i)

const set = (exn: string, title: string, focus: string, outcomes: string[], makers: GameSet['makers'], note?: string): GameSet => ({
  id: `ncm9-${exn}`,
  exercise: exn,
  ref: `NCM 9 Ex ${exn}`,
  title,
  focus,
  outcomes,
  makers,
  ...(note ? { teacherNote: note } : {}),
})
const R8 = (ex8: string, t: string, as?: string) => reuse(NCM8_CH3, ex8, t, as)

// ================================================================== 1.01, 1.02 revision

const SET_101 = set('1.01', 'Adding and subtracting terms', 'Collect like terms: same letters, same powers.', [ALG4], [R8('3.04', 'like'), R8('3.04', 'collect'), R8('3.04', 'mixed')], 'Revision of Stage 4 (MA4-ALG-C-01).')
const SET_102 = set('1.02', 'Multiplying and dividing terms', 'Multiply or divide the numbers, then the letters.', [ALG4], [R8('3.05', 'mult'), R8('3.05', 'powers'), R8('3.05', 'neg'), R8('3.05', 'div')], 'Revision of Stage 4 (MA4-ALG-C-01).')

// ================================================================== 1.03 Adding and subtracting algebraic fractions

function m103same(): GameQuestion {
  const L = pick(LET)
  const d = int(3, 11)
  const a = int(1, d - 1)
  const c = int(1, d)
  const minus = chance(0.4) && a > c
  const n = minus ? a - c : a + c
  return gq({
    t: 'same',
    prompt: `Simplify:${big(E(`frac{${term(a, L)}}{${d}} ${minus ? '-' : '+'} frac{${term(c, L)}}{${d}}`))}`,
    correct: E(fr(n, d, L)),
    // added the denominators too, multiplied the tops, forgot to simplify is allowed only when already simplest
    wrong: pickWrong(E(fr(n, d, L)), [E(fr(n, 2 * d, L)), E(fr(minus ? a + c : Math.abs(a - c) || a + c + 1, d, L)), E(fr(a * c, d, `${L}^2`)), E(fr(n + 1, d, L)), E(fr(n, d + 1, L))]),
    why: `The denominators are the same, so ${minus ? 'subtract' : 'add'} the numerators: ${E(`${term(a, L)} ${minus ? '-' : '+'} ${term(c, L)} = ${term(n, L)}`)}, over ${d}.`,
    meta: {},
  })
}

function m103unlike(): GameQuestion {
  for (;;) {
    const L = pick(LET)
    const [d1, d2] = [int(2, 6), int(2, 7)]
    if (d1 === d2 || d1 % d2 === 0 || d2 % d1 === 0) continue
    const [a, c] = [int(1, 4), int(1, 4)]
    const D = lcm(d1, d2)
    const minus = chance(0.4)
    const n = minus ? a * (D / d1) - c * (D / d2) : a * (D / d1) + c * (D / d2)
    if (n === 0) continue
    return gq({
      t: 'unlike',
      prompt: `Simplify:${big(E(`frac{${term(a, L)}}{${d1}} ${minus ? '-' : '+'} frac{${term(c, L)}}{${d2}}`))}`,
      correct: E(fr(n, D, L)),
      // added tops and bottoms, kept one denominator, sign slip
      wrong: pickWrong(E(fr(n, D, L)), [E(fr(minus ? a - c || 1 : a + c, d1 + d2, L)), E(fr(minus ? a - c || 1 : a + c, D, L)), E(fr(minus ? a * (D / d1) + c * (D / d2) : n + 1, D, L)), E(fr(n, d1 * d2 + 1, L)), E(fr(n + 2, D, L))]),
      why: `Use the common denominator ${D}: ${E(`frac{${term(a * (D / d1), L)}}{${D}} ${minus ? '-' : '+'} frac{${term(c * (D / d2), L)}}{${D}}`)} = ${E(fr(n, D, L))}.`,
      meta: {},
    })
  }
}

const SET_103 = set('1.03', 'Adding and subtracting algebraic fractions', 'Use a common denominator, then add or subtract the numerators.', [ALG], [mk('same', m103same), mk('unlike', m103unlike, 2)])

// ================================================================== 1.04 Multiplying and dividing algebraic fractions (Path)

function m104times(): GameQuestion {
  const L = pick(LET)
  const [a, b, c, d] = [int(1, 6), int(2, 7), int(2, 9), int(2, 6)]
  const divide = chance()
  // (aL/b) × (c/(dL)) = ac/(bd);  (aL/b) ÷ (dL/c) = ac/(bd)
  const n = a * c
  const den = b * d
  const prompt = divide ? `frac{${term(a, L)}}{${b}} ÷ frac{${term(d, L)}}{${c}}` : `frac{${term(a, L)}}{${b}} × frac{${c}}{${term(d, L)}}`
  return gq({
    t: 'times',
    prompt: `Simplify:${big(E(prompt))}`,
    correct: E(fr(n, den)),
    // the second fraction not flipped (for ÷), the letter kept, multiplied across the wrong way
    wrong: pickWrong(E(fr(n, den)), [E(divide ? fr(a * d, b * c, `${L}^2`) : fr(n, den, `${L}^2`)), E(fr(n, den, L)), E(fr(a * d, b * c)), E(fr(n + den, den)), E(fr(den, n))]),
    why: divide ? `Flip the second fraction and multiply; the ${E(L)} cancels: ${E(fr(n, den))}.` : `Multiply the tops and the bottoms; the ${E(L)} cancels: ${E(fr(n, den))}.`,
    meta: {},
  })
}

const SET_104 = set('1.04', 'Multiplying and dividing algebraic fractions', 'Multiply tops and bottoms, cancelling common factors; to divide, multiply by the reciprocal.', [], [mk('times', m104times)], P1)

// ================================================================== 1.05 Expanding expressions

function m105neg(): GameQuestion {
  const L = pick(LET)
  const a = -int(2, 7)
  const b = int(2, 9)
  const c = intExcept(-9, 9, [0])
  return gq({
    t: 'neg',
    prompt: `Expand:${big(E(`${a}(${sum([[b, L], [c, '']])})`))}`,
    correct: E(sum([[a * b, L], [a * c, '']])),
    // the sign of the second term not changed, only the first term multiplied
    wrong: pickWrong(E(sum([[a * b, L], [a * c, '']])), [E(sum([[a * b, L], [-a * c, '']])), E(sum([[a * b, L], [c, '']])), E(sum([[-a * b, L], [a * c, '']])), E(sum([[a + b, L], [a * c, '']]))]),
    why: `Multiply each term inside by ${a}: ${a} × ${E(term(b, L))} = ${E(term(a * b, L))} and ${a} × ${c} = ${a * c}.`,
    meta: {},
  })
}

function m105simplify(): GameQuestion {
  const L = pick(LET)
  const [p, q] = [int(2, 6), int(2, 5)]
  const [b, d] = [intExcept(-6, 6, [0]), intExcept(-6, 6, [0])]
  const minus = chance()
  const s = minus ? -1 : 1
  // p(L + b) ± q(L + d)
  const right = sum([[p + s * q, L], [p * b + s * q * d, '']])
  return gq({
    t: 'simplify',
    prompt: `Expand and simplify:${big(E(`${p}(${sum([[1, L], [b, '']])}) ${minus ? '-' : '+'} ${q}(${sum([[1, L], [d, '']])})`))}`,
    correct: E(right),
    // the minus applied to the first term only, the second bracket's number not multiplied
    wrong: pickWrong(E(right), [E(sum([[p + s * q, L], [p * b + q * d, '']])), E(sum([[p + s * q, L], [p * b + s * d, '']])), E(sum([[p + q, L], [p * b - s * q * d, '']])), E(sum([[p + s * q + 1, L], [p * b + s * q * d, '']]))]),
    why: `${E(`${p}(${sum([[1, L], [b, '']])})`)} = ${E(sum([[p, L], [p * b, '']]))} and ${minus ? '−' : '+'}${q}(…) gives ${E(sum([[s * q, L], [s * q * d, '']]))}. Collect like terms: ${E(right)}.`,
    meta: {},
  })
}

const SET_105 = set('1.05', 'Expanding expressions', 'Multiply every term in the brackets, taking care with negatives, then collect like terms.', [ALG], [R8('3.07', 'expand'), mk('neg', m105neg), mk('simplify', m105simplify, 2)])

// ================================================================== 1.06, 1.07–1.09 reuse

const SET_106 = set('1.06', 'Factorising expressions', 'Take out the highest common factor, including negative and algebraic factors.', [], [R8('3.09', 'factorise'), R8('3.09', 'fully'), R8('3.10', 'negative')], P1)
const SET_107 = set('1.07', 'Expanding binomial products', 'Multiply each term in the first bracket by each term in the second.', [ALG], [R8('3.11', 'binomial')])
const SET_108 = set('1.08', 'Perfect squares', '(a + b)² = a² + 2ab + b²: square, double the product, square.', [], [R8('3.12', 'square')], P2)
const SET_109 = set('1.09', 'Difference of two squares', '(a + b)(a − b) = a² − b²: the middle terms cancel.', [], [R8('3.13', 'diff')], P2)

// ================================================================== 1.10 Mixed expansions (Path)

function m110mixed(): GameQuestion {
  const L = pick(['x', 'a', 'm', 'y'])
  const a = int(1, 6)
  const b = int(1, 6)
  const kind = int(0, 1)
  // (L + a)² − (L + b)(L − b)  or  (L + a)(L − a) + (L + b)²
  const [q, right] =
    kind === 0
      ? [`(${L} + ${a})^2 - (${L} + ${b})(${L} - ${b})`, sum([[2 * a, L], [a * a + b * b, '']])]
      : [`(${L} + ${a})(${L} - ${a}) + (${L} - ${b})^2`, sum([[2, `${L}^2`], [-2 * b, L], [b * b - a * a, '']])]
  const wrong =
    kind === 0
      ? [sum([[2 * a, L], [a * a - b * b, '']]), sum([[1, `${L}^2`], [2 * a, L], [a * a + b * b, '']]), sum([[a, L], [a * a + b * b, '']]), sum([[2 * a, L], [a * a + b * b + 1, '']])]
      : [sum([[2, `${L}^2`], [2 * b, L], [b * b - a * a, '']]), sum([[2, `${L}^2`], [-2 * b, L], [b * b + a * a, '']]), sum([[2, `${L}^2`], [-b, L], [b * b - a * a, '']]), sum([[1, `${L}^2`], [-2 * b, L], [b * b - a * a, '']])]
  return gq({
    t: 'mixed',
    prompt: `Expand and simplify:${big(E(q))}`,
    correct: E(right),
    wrong: pickWrong(E(right), wrong.map(E)),
    why: `Expand each part (perfect square, difference of two squares), keep the sign in front of the second part, then collect like terms: ${E(right)}.`,
    meta: {},
  })
}

const SET_110 = set('1.10', 'Mixed expansions', 'Expand perfect squares, differences of squares and binomial products together, then simplify.', [], [mk('mixed', m110mixed, 2)], P2)

// ================================================================== 1.11 Factorising special binomial products (Path)

function m111dots(): GameQuestion {
  const L = pick(['x', 'a', 'm', 'y', 'k'])
  const p = pick([1, 1, 2, 3])
  const q = int(1, 10)
  if (p > 1 && gcd(p, q) !== 1) return m111dots()
  const expr = sum([[p * p, `${L}^2`], [-q * q, '']])
  const right = `${lin(p, L, q)}${lin(p, L, -q)}`
  return gq({
    t: 'dots',
    prompt: `Factorise:${big(E(expr))}`,
    correct: E(right),
    // a perfect square, both signs the same, the square root not taken
    wrong: pickWrong(E(right), [E(`${lin(p, L, -q)}^2`), E(`${lin(p, L, q)}^2`), E(`${lin(p, L, q * q)}${lin(p, L, -q * q)}`), E(`${lin(p * p, L, q)}${lin(1, L, -q)}`), E(`${lin(p, L, 2 * q)}${lin(p, L, -2 * q)}`), E(`${lin(p, L, q + 1)}${lin(p, L, -q - 1)}`)]),
    why: `${E(expr)} = (${E(term(p, L))})² − ${q}², a difference of two squares: ${E(right)}.`,
    meta: {},
  })
}

function m111group(): GameQuestion {
  const [x, y] = pick([
    ['a', 'b'],
    ['x', 'y'],
    ['m', 'n'],
  ])
  const p = int(2, 6)
  const q = intExcept(-7, 7, [0, p])
  // (x + p)(y + q) = xy + qx + py + pq
  const expr = `${x}${y} ${q < 0 ? '-' : '+'} ${Math.abs(q)}${x} + ${p}${y} ${p * q < 0 ? '-' : '+'} ${Math.abs(p * q)}`
  const right = `${lin(1, x, p)}${lin(1, y, q)}`
  return gq({
    t: 'group',
    prompt: `Factorise by grouping in pairs:${big(E(expr))}`,
    correct: E(right),
    wrong: pickWrong(E(right), [E(`${lin(1, x, q)}${lin(1, y, p)}`), E(`${lin(1, x, -p)}${lin(1, y, -q)}`), E(`${lin(1, x, p)}${lin(1, y, -q)}`), E(`${lin(1, x, p * q)}${lin(1, y, 1)}`)]),
    why: `${E(`${x}(${y} ${q < 0 ? '-' : '+'} ${Math.abs(q)})`)} + ${p}(${E(`${y} ${q < 0 ? '-' : '+'} ${Math.abs(q)}`)}) = ${E(right)}.`,
    meta: {},
  })
}

const SET_111 = set('1.11', 'Factorising special binomial products', 'Factorise a difference of two squares, and four-term expressions by grouping in pairs.', [], [mk('dots', m111dots), mk('group', m111group, 2)], P2)

// ================================================================== 1.12 Factorising monic quadratic trinomials (Path)

function m112pair(): GameQuestion {
  const r = intExcept(-9, 9, [0])
  const s = intExcept(-9, 9, [0, -r])
  const [P, S] = [r * s, r + s]
  const pr = (a: number, c: number) => `${Math.min(a, c) < 0 ? '−' + -Math.min(a, c) : Math.min(a, c)} and ${Math.max(a, c) < 0 ? '−' + -Math.max(a, c) : Math.max(a, c)}`
  const cand: [number, number][] = [[-r, -s], [r, -s], [-r, s], [S, 1], [P, 1], [r + 1, s - 1]]
  const out: string[] = []
  for (const [a, c] of cand) if (!(a * c === P && a + c === S) && !out.includes(pr(a, c))) out.push(pr(a, c))
  return gq({
    t: 'pair',
    prompt: `Which two numbers have a product of ${b(P)} and a sum of ${b(S)}?`,
    correct: pr(r, s),
    wrong: out,
    why: `${pr(r, s).replace(' and ', ' × ')} = ${P < 0 ? '−' + -P : P} and ${pr(r, s).replace(' and ', ' + ')} = ${S < 0 ? '−' + -S : S}.`,
    meta: {},
  })
}
function b(n: number) {
  return `<b>${n < 0 ? '−' + -n : n}</b>`
}

function m112monic(): GameQuestion {
  const L = pick(['x', 'a', 'm', 'y', 'k', 'n'])
  const r = intExcept(-9, 9, [0])
  const s = intExcept(-9, 9, [0, -r])
  const expr = quad(1, r + s, r * s, L)
  const right = `${lin(1, L, r)}${lin(1, L, s)}`
  return gq({
    t: 'monic',
    prompt: `Factorise:${big(E(expr))}`,
    correct: E(right),
    // the signs swapped, numbers that add but do not multiply, numbers that multiply but do not add
    wrong: pickWrong(E(right), [E(`${lin(1, L, -r)}${lin(1, L, -s)}`), E(`${lin(1, L, -r)}${lin(1, L, s)}`), E(`${lin(1, L, r + s)}${lin(1, L, 1)}`), E(`${lin(1, L, r * s)}${lin(1, L, 1)}`), E(`${lin(1, L, r)}${lin(1, L, -s)}`)]),
    why: `Find two numbers with product ${r * s} and sum ${r + s}: ${r} and ${s}. So ${E(expr)} = ${E(right)}.`,
    meta: {},
  })
}

const SET_112 = set('1.12', 'Factorising quadratic trinomials', 'For x² + bx + c, find two numbers that multiply to c and add to b.', [], [mk('pair', m112pair), mk('monic', m112monic, 2)], P1)

// ================================================================== 1.13 Non-monic trinomials (Path)

function m113nonMonic(): GameQuestion {
  for (;;) {
    const L = pick(['x', 'a', 'm', 'y'])
    const p = int(2, 5)
    const r = intExcept(-7, 7, [0])
    const s = intExcept(-7, 7, [0])
    if (gcd(p, r) !== 1) continue
    // (pL + r)(L + s) = pL² + (ps + r)L + rs
    const B = p * s + r
    if (B === 0) continue
    const expr = quad(p, B, r * s, L)
    const right = `${lin(p, L, r)}${lin(1, L, s)}`
    return gq({
      t: 'nonMonic',
      prompt: `Factorise:${big(E(expr))}`,
      correct: E(right),
      // the numbers in the wrong brackets, the signs swapped
      wrong: pickWrong(E(right), [E(`${lin(p, L, s)}${lin(1, L, r)}`), E(`${lin(p, L, -r)}${lin(1, L, -s)}`), E(`${lin(p, L, r)}${lin(1, L, -s)}`), E(`${lin(1, L, r)}${lin(p, L, -s)}`)].filter((w) => w !== E(`${lin(1, L, s)}${lin(p, L, r)}`))),
      why: `Check by expanding: ${E(right)} = ${E(expr)}.`,
      meta: {},
    })
  }
}

const SET_113 = set('1.13', 'Factorising non-monic quadratic trinomials', 'Factorise ax² + bx + c (a ≠ 1) and check by expanding.', [], [mk('nonMonic', m113nonMonic, 2)], P2)

// ================================================================== 1.14 Mixed factorisations (Path)

function m114mixed(): GameQuestion {
  const L = pick(['x', 'a', 'm', 'y'])
  const k = int(2, 5)
  if (chance()) {
    const q = int(1, 9)
    const expr = sum([[k, `${L}^2`], [-k * q * q, '']])
    const right = `${k}${lin(1, L, q)}${lin(1, L, -q)}`
    return gq({
      t: 'mixed',
      prompt: `Factorise fully:${big(E(expr))}`,
      correct: E(right),
      // stopped after the common factor, no common factor taken out, a perfect square
      wrong: pickWrong(E(right), [E(`${k}(${sum([[1, `${L}^2`], [-q * q, '']])})`), E(`${lin(k, L, q)}${lin(k, L, -q)}`), E(`${k}${lin(1, L, -q)}^2`), E(`${k}${lin(1, L, q * q)}${lin(1, L, -1)}`)]),
      why: `Take out ${k} first: ${E(`${k}(${sum([[1, `${L}^2`], [-q * q, '']])})`)}, then the difference of two squares: ${E(right)}.`,
      meta: {},
    })
  }
  const r = intExcept(-6, 6, [0])
  const s = intExcept(-6, 6, [0, -r, r])
  const expr = quad(k, k * (r + s), k * r * s, L)
  const right = `${k}${lin(1, L, r)}${lin(1, L, s)}`
  return gq({
    t: 'mixed',
    prompt: `Factorise fully:${big(E(expr))}`,
    correct: E(right),
    wrong: pickWrong(E(right), [E(`${k}(${quad(1, r + s, r * s, L)})`), E(`${lin(k, L, k * r)}${lin(1, L, s)}`), E(`${k}${lin(1, L, -r)}${lin(1, L, -s)}`), E(`${lin(1, L, r)}${lin(1, L, s)}`)]),
    why: `Take out ${k} first: ${E(`${k}(${quad(1, r + s, r * s, L)})`)}, then factorise the trinomial: ${E(right)}.`,
    meta: {},
  })
}

const SET_114 = set('1.14', 'Mixed factorisations', 'Always take out a common factor first, then look for a difference of squares or a trinomial.', [], [mk('mixed', m114mixed, 2)], P2)

// ================================================================== 1.15 Simplifying algebraic fractions by factorising (Path)

function m115cancel(): GameQuestion {
  const L = pick(['x', 'a', 'm', 'y'])
  const r = intExcept(-8, 8, [0])
  const s = intExcept(-8, 8, [0, r, -r])
  const dots = chance(0.4)
  // numerator (L + r)(L + s) or (L + r)(L − r), denominator (L + r)
  const top = dots ? sum([[1, `${L}^2`], [-r * r, '']]) : quad(1, r + s, r * s, L)
  const keep = dots ? sum([[1, L], [-r, '']]) : sum([[1, L], [s, '']])
  return gq({
    t: 'cancel',
    prompt: `Simplify:${big(E(`frac{${top}}{${sum([[1, L], [r, '']])}}`))}`,
    correct: E(keep),
    // cancelled the wrong factor, cancelled terms not factors, sign slip
    wrong: pickWrong(E(keep), [E(sum([[1, L], [dots ? r : r, '']])), E(sum([[1, L], [dots ? -r * r - r : r * s - r, '']])), E(sum([[1, L], [dots ? r : -s, '']])), E(sum([[1, L], [dots ? -r + 1 : s + 1, '']])), E(sum([[1, `${L}`], [dots ? -r * r : r * s, '']]))]),
    why: `Factorise the top: ${E(dots ? `${lin(1, L, r)}${lin(1, L, -r)}` : `${lin(1, L, r)}${lin(1, L, s)}`)}. Cancel the common factor ${E(lin(1, L, r))}: ${E(keep)}.`,
    meta: {},
  })
}

const SET_115 = set('1.15', 'Simplifying algebraic fractions', 'Factorise first, then cancel common factors (whole brackets, never single terms).', [], [mk('cancel', m115cancel, 2)], P2)

export const NCM9_CH1: GameChapter = {
  id: 'ncm9-ch1',
  number: 1,
  title: 'Algebra',
  ref: 'NCM 9 Chapter 1',
  strand: 'Number and algebra',
  outcomes: [ALG],
  sets: [SET_101, SET_102, SET_103, SET_104, SET_105, SET_106, SET_107, SET_108, SET_109, SET_110, SET_111, SET_112, SET_113, SET_114, SET_115],
  colour: 265,
  topics: [],
}
