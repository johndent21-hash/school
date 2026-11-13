// Class games for New Century Maths 8 (3rd edition, Cengage) Chapter 3, Algebra: one set of quick questions for each
// exercise, 3.01 to 3.13.
//
// 3.01–3.05 revise Year 7 algebra, so they reuse the NCM 7 Chapter 5 question kinds (already checked). New kinds:
// expanding, factors and HCFs of terms, factorising (and factorising fully), and the starred extension work: index
// laws with pronumerals, negative common factors and binomial products. Wrong choices are the usual slips: only the
// first term multiplied, a sign lost, a factor left inside the brackets, the middle term of a perfect square
// forgotten. Checked by tests/game-checks/ncm8-ch3.ts, which compares every choice with the question by evaluating
// both at several sets of values.
//
// Syllabus: NSW Mathematics K–10 (2022), Stage 4, Algebraic techniques MA4-ALG-C-01 (3.01–3.05, 3.07–3.09).
// 3.06 (index laws with pronumerals) and 3.10–3.13 (negative common factors, binomial products) are starred as
// extension in the textbook and belong to Stage 5 (MA5-IND-C-01, MA5-ALG-P-01).
import type { GameChapter, GameMaker, GameQuestion, GameSet } from '@/lib/game/types'
import { chance, ex, gcd, gq, int, mk, num, pick, sample, v } from './helpers'
import { NCM7_CH5 } from './ncm7-ch5'

const ALG = 'MA4-ALG-C-01'
const EXT_IND = 'Marked as extension in the textbook: index laws with pronumerals are Stage 5 (MA5-IND-C-01).'
const EXT_ALG = 'Marked as extension in the textbook: this is Stage 5 path content (MA5-ALG-P-01).'
const big = (s: string) => `<div class="big">${s}</div>`
const E = ex
const LET = ['a', 'b', 'c', 'd', 'g', 'h', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'w', 'x', 'y', 'z']
function from(ex5: string, ...ts: string[]): GameMaker[] {
  const s = NCM7_CH5.sets.find((x) => x.exercise === ex5)!
  return ts.map((t) => s.makers.find((m) => m.t === t)!)
}
/** a term: (3, 'x') → "3x", (1, 'x') → "x", (−1, 'x') → "-x", (5, '') → "5" */
const term = (c: number, vs: string) => (vs === '' ? String(c) : c === 1 ? vs : c === -1 ? `-${vs}` : `${c}${vs}`)
/** a sum of terms with tidy signs */
const sum = (ts: [number, string][]) =>
  ts
    .filter(([c]) => c !== 0)
    .map(([c, vs], i) => (i === 0 ? term(c, vs) : c < 0 ? ` - ${term(-c, vs)}` : ` + ${term(c, vs)}`))
    .join('') || '0'

// ================================================================== 3.01–3.05: revision (NCM 7 Chapter 5)

const REVISE: [string, string, string, string[]][] = [
  ['3.01', 'Variables', 'Use algebra’s shorthand for products, powers and division.', ['5.03:simplify', '5.03:notEqual']],
  ['3.02', 'Creating algebraic expressions', 'Turn words into algebra, in the order the words give.', ['5.04:words', '5.04:story', '5.04:twoStep']],
  ['3.03', 'Substitution', 'Replace each pronumeral with its value, taking care with negatives and powers.', ['5.05:sub', '5.05:many', '5.05:formula', '5.05:square']],
  ['3.04', 'Adding and subtracting terms', 'Collect like terms: same letters, same powers.', ['5.07:like', '5.07:collect', '5.07:mixed']],
  ['3.05', 'Multiplying and dividing terms', 'Multiply or divide the numbers, then the letters.', ['5.08:mult', '5.08:powers', '5.08:neg', '5.09:div', '5.09:fracs']],
]
const LESSONS: Record<string, string[]> = { '3.03': [], '3.04': ['y8-alg-expand-simplify'] }
const revisionSets: GameSet[] = REVISE.map(([exn, title, focus, kinds]) => ({
  id: `ncm8-${exn}`,
  exercise: exn,
  ref: `NCM 8 Ex ${exn}`,
  title,
  focus,
  lessons: LESSONS[exn] ?? [],
  outcomes: [ALG],
  makers: kinds.flatMap((k) => {
    const [e5, t] = k.split(':')
    return from(e5, t)
  }),
}))

// ================================================================== 3.06 The index laws (extension)

function m306laws(): GameQuestion {
  const L = pick(LET)
  const kind = int(0, 3)
  // never 2 and 2, where adding and multiplying give the same number
  const a = int(2, 6)
  const b = a === 2 ? int(3, 5) : int(2, 5)
  const m = int(2, 7)
  const n = m === 2 ? int(3, 6) : int(2, 6)
  const P = (e: number) => (e === 1 ? L : `${L}^${e}`)
  const [expr, right, wrong] = [
    [`${L}^${m} * ${L}^${n}`, P(m + n), [P(m * n), `2${P(m + n)}`, P(m + n + 1), `${m + n}${L}`, P(m + n - 1)]],
    [`${a}${L}^${m} * ${b}${L}^${n}`, `${a * b}${P(m + n)}`, [`${a + b}${P(m + n)}`, `${a * b}${P(m * n)}`, `${a + b}${P(m * n)}`, `${a * b}${P(m + n + 1)}`]],
    [`${L}^${m + n} ÷ ${L}^${n}`, P(m), [P(m + 2 * n), ...((m + n) % n === 0 ? [P((m + n) / n)] : []), P(m + 1), P(m + n), `${m}${L}`]],
    [`(${L}^${m})^${n}`, P(m * n), [P(m + n), `${n}${P(m)}`, P(m * n + 1), `${m * n}${L}`]],
  ][kind] as [string, string, string[]]
  return gq({
    t: 'laws',
    prompt: `Simplify:${big(E(expr))}`,
    correct: E(right),
    wrong: wrong.filter((w) => w !== right).map(E),
    why: [`Multiplying: add the indices: ${E(right)}.`, `Multiply the numbers, add the indices: ${E(right)}.`, `Dividing: subtract the indices: ${E(right)}.`, `Power of a power: multiply the indices: ${E(right)}.`][kind],
    meta: { kind, L, a, b, m, n },
  })
}

function m306zero(): GameQuestion {
  const L = pick(LET)
  const k = int(2, 9)
  const kind = int(0, 1)
  const [expr, right, wrong] = [
    [`${L}^0`, '1', ['0', L, '10']],
    [`${k}${L}^0`, String(k), ['1', '0', `${k}${L}`]],
  ][kind] as [string, string, string[]]
  return gq({
    t: 'zero',
    prompt: `Simplify:${big(E(expr))}`,
    correct: E(right),
    wrong: wrong.map(E),
    why: kind === 0 ? `Any non-zero number to the power 0 is 1: ${E(expr)} = 1.` : `${E(`${L}^0`)} = 1, so ${E(expr)} = ${k} × 1 = ${k}.`,
    meta: { L, k, kind },
  })
}

const SET_306: GameSet = {
  id: 'ncm8-3.06',
  exercise: '3.06',
  ref: 'NCM 8 Ex 3.06',
  title: 'The index laws',
  focus: 'Use the index laws with pronumerals: add indices to multiply, subtract to divide, multiply for a power of a power.',
  outcomes: [],
  teacherNote: EXT_IND,
  makers: [mk('laws', m306laws), mk('zero', m306zero)],
}

// ================================================================== 3.07 Expanding expressions

function m307expand(): GameQuestion {
  const L = pick(LET)
  const kind = int(0, 3)
  const a = int(2, 9)
  // not 2 and 2, where a × b and a + b are the same
  const b = a === 2 ? pick([1, 3, 4, 5, 6, 7, 8, 9]) : int(1, 9)
  const [expr, right, wrong] = [
    // a(L + b)
    [`${a}(${L} + ${b})`, sum([[a, L], [a * b, '']]), [sum([[a, L], [b, '']]), sum([[a, L], [a + b, '']]), sum([[a + 1, L], [a * b, '']])]],
    // a(L − b)
    [`${a}(${L} - ${b})`, sum([[a, L], [-a * b, '']]), [sum([[a, L], [-b, '']]), sum([[a, L], [a * b, '']]), sum([[a, L], [-(a + b), '']])]],
    // −a(L − b)
    [`-${a}(${L} - ${b})`, sum([[-a, L], [a * b, '']]), [sum([[-a, L], [-a * b, '']]), sum([[-a, L], [-b, '']]), sum([[a, L], [-a * b, '']])]],
    // L(L + b)
    [`${L}(${L} + ${b})`, sum([[1, `${L}^2`], [b, L]]), [sum([[1, `${L}^2`], [b, '']]), sum([[2, L], [b, L]]), sum([[1, `${L}^2`], [b, `${L}^2`]])]],
  ][kind] as [string, string, string[]]
  return gq({
    t: 'expand',
    prompt: `Expand:${big(E(expr))}`,
    correct: E(right),
    wrong: wrong.filter((w) => w !== right).map(E),
    why: `Multiply every term inside the brackets by the term outside: ${E(right)}.`,
    meta: { kind, L, a, b },
  })
}

function m307simplify(): GameQuestion {
  const L = pick(LET)
  const a = int(2, 6)
  const b = int(1, 9)
  const c = int(2, 9)
  const plus = chance()
  // a(L + b) + cL  or  a(L + b) − c
  const [expr, right, wrong] = plus
    ? [`${a}(${L} + ${b}) + ${c}${L}`, sum([[a + c, L], [a * b, '']]), [sum([[a + c, L], [b, '']]), sum([[a * c, L], [a * b, '']]), sum([[a, L], [a * b + c, '']]), sum([[a + c + 1, L], [a * b, '']])]]
    : [`${a}(${L} + ${b}) - ${c}`, sum([[a, L], [a * b - c, '']]), [sum([[a, L], [b - c, '']]), sum([[a, L], [a * b + c, '']]), sum([[a - c, L], [a * b, '']]), sum([[a, L], [a * b - c + 1, '']])]]
  return gq({
    t: 'simplify',
    prompt: `Expand and simplify:${big(E(expr))}`,
    correct: E(right),
    wrong: wrong.filter((w) => w !== right).map(E),
    why: `Expand first: ${E(sum([[a, L], [a * b, '']]))}. Then collect like terms: ${E(right)}.`,
    meta: { L, a, b, c, plus },
  })
}

const SET_307: GameSet = {
  id: 'ncm8-3.07',
  exercise: '3.07',
  ref: 'NCM 8 Ex 3.07',
  title: 'Expanding expressions',
  focus: 'Expand brackets with the distributive law, then simplify.',
  lessons: ['y8-alg-expand', 'y8-alg-expand-simplify'],
  outcomes: [ALG],
  makers: [mk('expand', m307expand), mk('simplify', m307simplify, 2)],
}

// ================================================================== 3.08 Factorising algebraic terms

/** a term with a coefficient and letters with powers, as text for ex(): 12, {x: 2, y: 1} → "12x^2y" */
const mono = (c: number, pows: Record<string, number>) =>
  term(
    c,
    Object.keys(pows)
      .sort()
      .filter((l) => pows[l] > 0)
      .map((l) => (pows[l] === 1 ? l : `${l}^${pows[l]}`))
      .join(''),
  )

function m308hcf(): GameQuestion {
  const [L, M] = sample(LET, 2).sort()
  const g = pick([2, 3, 4, 5, 6])
  let p: number, q: number
  do {
    p = int(1, 6)
    q = int(1, 6)
  } while (p === q || gcd(p, q) !== 1)
  const e1 = int(1, 2)
  const e2 = int(1, 3)
  const withM = chance()
  const t1 = mono(g * p, { [L]: e1, ...(withM ? { [M]: 1 } : {}) })
  const t2 = mono(g * q, { [L]: e2 })
  const right = mono(g, { [L]: Math.min(e1, e2) })
  return gq({
    t: 'hcf',
    prompt: `What is the highest common factor of ${E(t1)} and ${E(t2)}?`,
    correct: E(right),
    // the number only, the letters only, the higher power, the product
    wrong: [E(String(g)), E(mono(1, { [L]: Math.min(e1, e2) })), E(mono(g, { [L]: Math.max(e1, e2) + (e1 === e2 ? 1 : 0) })), E(mono(g * p * q, { [L]: Math.min(e1, e2) })), E(mono(g, { [L]: Math.min(e1, e2), [M]: 1 }))].filter((w) => w !== E(right)),
    why: `HCF of the numbers: ${g}. Lowest power of ${v(L)} in both: ${E(mono(1, { [L]: Math.min(e1, e2) }))}. HCF: ${E(right)}.`,
    meta: { g, p, q, e1, e2, withM },
  })
}

function m308factor(): GameQuestion {
  const [L, M] = sample(LET, 2).sort()
  const c = pick([6, 10, 12, 15, 18, 20, 24])
  const t = mono(c, { [L]: 2, [M]: 1 })
  const divs = [2, 3, 4, 5, 6].filter((d) => c % d === 0)
  const nondivs = [4, 5, 7, 8, 9].filter((d) => c % d !== 0)
  const right = mono(pick(divs), { [L]: pick([1, 2]), ...(chance() ? { [M]: 1 } : {}) })
  return gq({
    t: 'factor',
    prompt: `Which is a factor of ${E(t)}?`,
    correct: E(right),
    // a number that does not divide, too high a power, a letter that is not there
    wrong: [E(mono(pick(nondivs), { [L]: 1 })), E(mono(pick(divs), { [L]: 3 })), E(mono(pick(divs), { [M]: 2 })), E(mono(1, { [pick(LET.filter((x) => x !== L && x !== M))]: 1 }))],
    why: `${E(right)} divides ${E(t)} exactly: its number divides ${c}, and its letters appear in ${E(t)} with at least the same powers.`,
    meta: { c, L, M },
  })
}

const SET_308: GameSet = {
  id: 'ncm8-3.08',
  exercise: '3.08',
  ref: 'NCM 8 Ex 3.08',
  title: 'Factorising algebraic terms',
  focus: 'Find the factors of a term and the highest common factor of two terms.',
  lessons: ['y8-alg-factorise'],
  outcomes: [ALG],
  makers: [mk('factor', m308factor), mk('hcf', m308hcf)],
}

// ================================================================== 3.09 Factorising expressions

function m309factorise(): GameQuestion {
  const L = pick(LET)
  const g = int(2, 9)
  let p: number, q: number
  do {
    p = int(1, 6)
    q = int(1, 9)
  } while (gcd(p, q) !== 1)
  const minus = chance()
  const expr = sum([[g * p, L], [minus ? -g * q : g * q, '']])
  const inside = sum([[p, L], [minus ? -q : q, '']])
  return gq({
    t: 'factorise',
    prompt: `Factorise:${big(E(expr))}`,
    correct: E(`${g}(${inside})`),
    // the HCF taken from one term only, the sign changed, the HCF put next to the wrong term
    wrong: [`${g}(${sum([[p, L], [minus ? -g * q : g * q, '']])})`, `${g}(${sum([[p, L], [minus ? q : -q, '']])})`, `${g * p}(${sum([[1, L], [minus ? -q : q, '']])})`, `${g}(${sum([[g * p, L], [minus ? -q : q, '']])})`].map(E),
    why: `The highest common factor of ${E(expr)} is ${g}: ${E(`${g}(${inside})`)}. Check by expanding.`,
    meta: { L, g, p, q, minus },
  })
}

function m309fully(): GameQuestion {
  const L = pick(LET)
  const g = pick([4, 6, 8, 9, 10, 12])
  const part = [2, 3, 5].find((f) => g % f === 0 && f !== g)!
  let p: number, q: number
  do {
    p = int(1, 5)
    q = int(1, 7)
  } while (gcd(p, q) !== 1)
  const expr = sum([[g * p, L], [g * q, '']])
  const right = `${g}(${sum([[p, L], [q, '']])})`
  return gq({
    t: 'fully',
    prompt: `Factorise fully:${big(E(expr))}`,
    correct: E(right),
    // only partly factorised (still a common factor inside), a wrong bracket
    wrong: [`${part}(${sum([[(g / part) * p, L], [(g / part) * q, '']])})`, `${g}(${sum([[p, L], [g * q, '']])})`, `${g}(${sum([[p, L], [q + 1, '']])})`].map(E),
    why: `The highest common factor is ${g}, not just ${part}: ${E(right)}.`,
    meta: { L, g, p, q },
  })
}

function m309letter(): GameQuestion {
  const L = pick(LET)
  const a = int(2, 9)
  const kind = int(0, 1)
  const [expr, right, wrong] = [
    [`${L}^2 + ${a}${L}`, `${L}(${L} + ${a})`, [`${L}(${L}^2 + ${a})`, `${L}(${L} + ${a}${L})`, `${a}${L}(${L} + 1)`]],
    [`${a}${L}^2 - ${a}${L}`, `${a}${L}(${L} - 1)`, [`${a}${L}(${L})`, `${a}(${L}^2 - 1)`, `${L}(${a}${L} - 1)`]],
  ][kind] as [string, string, string[]]
  return gq({
    t: 'letter',
    prompt: `Factorise fully:${big(E(expr))}`,
    correct: E(right),
    wrong: wrong.map(E),
    why: `Take out the highest common factor, ${kind === 0 ? v(L) : E(`${a}${L}`)}: ${E(right)}.`,
    meta: { L, a, kind },
  })
}

const SET_309: GameSet = {
  id: 'ncm8-3.09',
  exercise: '3.09',
  ref: 'NCM 8 Ex 3.09',
  title: 'Factorising expressions',
  focus: 'Factorise by taking out the highest common factor, and check by expanding.',
  lessons: ['y8-alg-factorise'],
  outcomes: [ALG],
  makers: [mk('factorise', m309factorise), mk('fully', m309fully, 2), mk('letter', m309letter, 2)],
}

// ================================================================== 3.10 Factorising with negative terms (extension)

function m310negative(): GameQuestion {
  const L = pick(LET)
  const g = int(2, 9)
  let p: number, q: number
  do {
    p = int(1, 5)
    q = int(1, 9)
  } while (gcd(p, q) !== 1)
  const minus = chance()
  const expr = sum([[-g * p, L], [minus ? -g * q : g * q, '']])
  const inside = sum([[p, L], [minus ? q : -q, '']])
  return gq({
    t: 'negative',
    prompt: `Factorise using a negative common factor:${big(E(expr))}`,
    correct: E(`-${g}(${inside})`),
    // the second sign not changed, a positive factor with a wrong bracket, the factor left in one term
    wrong: [`-${g}(${sum([[p, L], [minus ? -q : q, '']])})`, `${g}(${sum([[-p, L], [minus ? q : -q, '']])})`, `-${g}(${sum([[p, L], [minus ? g * q : -g * q, '']])})`].map(E),
    why: `Take out −${g}: every sign inside the brackets changes. ${E(`-${g}(${inside})`)}.`,
    meta: { L, g, p, q, minus },
  })
}

const SET_310: GameSet = {
  id: 'ncm8-3.10',
  exercise: '3.10',
  ref: 'NCM 8 Ex 3.10',
  title: 'Factorising with negative terms',
  focus: 'Take out a negative common factor: every sign inside the brackets changes.',
  outcomes: [],
  teacherNote: EXT_ALG,
  makers: [mk('negative', m310negative)],
}

// ================================================================== 3.11–3.13 Binomial products (extension)

/** a number in brackets when negative, with a true minus sign */
const bn = (k: number) => (k < 0 ? `(${num(k)})` : num(k))

function m311binomial(): GameQuestion {
  const L = pick(['x', 'y', 'a', 'm', 'n'])
  const a = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6])
  let b: number
  do b = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6])
  while (b === -a || b === a)
  const br = (k: number) => (k < 0 ? `(${L} - ${-k})` : `(${L} + ${k})`)
  const right = sum([[1, `${L}^2`], [a + b, L], [a * b, '']])
  return gq({
    t: 'binomial',
    prompt: `Expand:${big(E(`${br(a)}${br(b)}`))}`,
    correct: E(right),
    // the middle term forgotten, the numbers added and multiplied the wrong way round, a sign slip
    wrong: [sum([[1, `${L}^2`], [a * b, '']]), sum([[1, `${L}^2`], [a * b, L], [a + b, '']]), sum([[1, `${L}^2`], [a + b, L], [-a * b, '']]), sum([[1, `${L}^2`], [a - b, L], [a * b, '']])].filter((w) => w !== right).map(E),
    why: `Multiply each term in the first bracket by each term in the second: ${E(`${L}^2`)} + (${bn(a)} + ${bn(b)})${v(L)} + ${bn(a)} × ${bn(b)} = ${E(right)}.`,
    meta: { L, a, b },
  })
}

function m312square(): GameQuestion {
  const L = pick(['x', 'y', 'a', 'm', 'n'])
  const a = int(1, 9)
  const plus = chance()
  const right = sum([[1, `${L}^2`], [plus ? 2 * a : -2 * a, L], [a * a, '']])
  return gq({
    t: 'square',
    prompt: `Expand:${big(E(`(${L} ${plus ? '+' : '-'} ${a})^2`))}`,
    correct: E(right),
    // the middle term forgotten (or not doubled), the last term doubled instead of squared
    wrong: [sum([[1, `${L}^2`], [a * a, '']]), sum([[1, `${L}^2`], [plus ? a : -a, L], [a * a, '']]), sum([[1, `${L}^2`], [plus ? 2 * a : -2 * a, L], [2 * a, '']]), sum([[1, `${L}^2`], [plus ? -2 * a : 2 * a, L], [a * a, '']])].filter((w) => w !== right).map(E),
    why: `(${v(L)} ${plus ? '+' : '−'} ${a})² = ${v(L)}² ${plus ? '+' : '−'} 2 × ${a} × ${v(L)} + ${a}² = ${E(right)}.`,
    meta: { L, a, plus },
  })
}

function m313diff(): GameQuestion {
  const L = pick(['x', 'y', 'a', 'm', 'n'])
  const a = int(3, 12)
  const right = sum([[1, `${L}^2`], [-a * a, '']])
  return gq({
    t: 'diff',
    prompt: `Expand:${big(E(`(${L} + ${a})(${L} - ${a})`))}`,
    correct: E(right),
    // added instead of subtracted, the 2a middle term kept, doubled instead of squared
    wrong: [sum([[1, `${L}^2`], [a * a, '']]), sum([[1, `${L}^2`], [-2 * a, L], [-a * a, '']]), sum([[1, `${L}^2`], [-2 * a, '']]), sum([[1, `${L}^2`], [-a, '']])].map(E),
    why: `The middle terms cancel (${a}${v(L)} − ${a}${v(L)} = 0), leaving ${E(right)}.`,
    meta: { L, a },
  })
}

const extSet = (exn: string, title: string, focus: string, makers: GameMaker[]): GameSet => ({
  id: `ncm8-${exn}`,
  exercise: exn,
  ref: `NCM 8 Ex ${exn}`,
  title,
  focus,
  outcomes: [],
  teacherNote: EXT_ALG,
  makers,
})
const SET_311 = extSet('3.11', 'Expanding binomial products', 'Multiply each term of one bracket by each term of the other.', [mk('binomial', m311binomial)])
const SET_312 = extSet('3.12', 'Perfect squares', '(a + b)² = a² + 2ab + b²: do not forget the middle term.', [mk('square', m312square)])
const SET_313 = extSet('3.13', 'Difference of 2 squares', '(a + b)(a − b) = a² − b²: the middle terms cancel.', [mk('diff', m313diff)])

export const NCM8_CH3: GameChapter = {
  id: 'ncm8-ch3',
  number: 3,
  title: 'Algebra',
  ref: 'NCM 8 Chapter 3',
  strand: 'Number and algebra',
  outcomes: [ALG],
  sets: [...revisionSets, SET_306, SET_307, SET_308, SET_309, SET_310, SET_311, SET_312, SET_313],
  colour: 165,
  topics: ['y8-algebra'],
}
