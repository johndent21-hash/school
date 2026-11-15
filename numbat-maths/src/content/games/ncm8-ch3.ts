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
//
// Audit against the textbook, exercise by exercise (Nov 2026): added writing terms in expanded form (3.01, from
// NCM 7 5.03) and expanding and simplifying two brackets (3.07). Step 4 (Nov 2026): non-monic binomial products added to 3.11 (extension, like the rest of 3.11).
import type { GameChapter, GameMaker, GameQuestion, GameSet } from '@/lib/game/types'
import { type Miss, chance, ex, gcd, gq, int, miss, mk, num, pick, sample, v } from './helpers'
import { NCM7_CH5 } from './ncm7-ch5'

const ALG = 'MA4-ALG-C-01'
const EXT_IND = 'Marked as extension in the textbook: index laws with pronumerals are Stage 5 (MA5-IND-C-01).'
const EXT_ALG = 'Marked as extension in the textbook: this is Stage 5 path content (MA5-ALG-P-01).'
const big = (s: string) => `<div class="big">${s}</div>`
const E = ex
/** a wrong option as algebra, keeping its mistake label if it has one */
const EO = (w: string | Miss) => (typeof w === 'string' ? E(w) : miss(E(w.v), w.m))
const M = miss
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
  ['3.01', 'Variables', 'Use algebra’s shorthand for products, powers and division.', ['5.03:simplify', '5.03:notEqual', '5.03:expanded']],
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
    [`${L}^${m} * ${L}^${n}`, P(m + n), [M(P(m * n), 'multiplied the indices'), M(`2${P(m + n)}`, 'added the indices and doubled'), P(m + n + 1), M(`${m + n}${L}`, 'wrote the index as a coefficient'), P(m + n - 1)]],
    [`${a}${L}^${m} * ${b}${L}^${n}`, `${a * b}${P(m + n)}`, [M(`${a + b}${P(m + n)}`, 'added the numbers instead of multiplying'), M(`${a * b}${P(m * n)}`, 'multiplied the indices'), M(`${a + b}${P(m * n)}`, 'added the numbers, multiplied the indices'), `${a * b}${P(m + n + 1)}`]],
    [`${L}^${m + n} ÷ ${L}^${n}`, P(m), [M(P(m + 2 * n), 'added the indices'), ...((m + n) % n === 0 ? [M(P((m + n) / n), 'divided the indices')] : []), P(m + 1), M(P(m + n), 'left the index unchanged'), M(`${m}${L}`, 'wrote the index as a coefficient')]],
    [`(${L}^${m})^${n}`, P(m * n), [M(P(m + n), 'added the indices'), M(`${n}${P(m)}`, 'multiplied by the outer index'), P(m * n + 1), M(`${m * n}${L}`, 'wrote the index as a coefficient')]],
  ][kind] as [string, string, (string | Miss)[]]
  return gq({
    t: 'laws',
    prompt: `Simplify:${big(E(expr))}`,
    correct: E(right),
    wrong: wrong.map(EO),
    why: [`Multiplying: add the indices: ${E(right)}.`, `Multiply the numbers, add the indices: ${E(right)}.`, `Dividing: subtract the indices: ${E(right)}.`, `Power of a power: multiply the indices: ${E(right)}.`][kind],
    meta: { kind, L, a, b, m, n },
  })
}

function m306zero(): GameQuestion {
  const L = pick(LET)
  const k = int(2, 9)
  const kind = int(0, 1)
  const [expr, right, wrong] = [
    [`${L}^0`, '1', [M('0', 'thought a power of 0 gives 0'), M(L, 'thought a power of 0 leaves it unchanged'), '10']],
    [`${k}${L}^0`, String(k), [M('1', 'made the whole term 1, not just the pronumeral'), M('0', 'thought a power of 0 gives 0'), M(`${k}${L}`, 'thought a power of 0 leaves it unchanged')]],
  ][kind] as [string, string, (string | Miss)[]]
  return gq({
    t: 'zero',
    prompt: `Simplify:${big(E(expr))}`,
    correct: E(right),
    wrong: wrong.map(EO),
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
    [`${a}(${L} + ${b})`, sum([[a, L], [a * b, '']]), [M(sum([[a, L], [b, '']]), 'multiplied only the first term'), M(sum([[a, L], [a + b, '']]), 'added instead of multiplied'), sum([[a + 1, L], [a * b, '']])]],
    // a(L − b)
    [`${a}(${L} - ${b})`, sum([[a, L], [-a * b, '']]), [M(sum([[a, L], [-b, '']]), 'multiplied only the first term'), M(sum([[a, L], [a * b, '']]), 'lost the minus sign'), M(sum([[a, L], [-(a + b), '']]), 'added instead of multiplied')]],
    // −a(L − b)
    [`-${a}(${L} - ${b})`, sum([[-a, L], [a * b, '']]), [M(sum([[-a, L], [-a * b, '']]), 'negative × negative left negative'), M(sum([[-a, L], [-b, '']]), 'multiplied only the first term'), M(sum([[a, L], [-a * b, '']]), 'lost the negative outside the brackets')]],
    // L(L + b)
    [`${L}(${L} + ${b})`, sum([[1, `${L}^2`], [b, L]]), [M(sum([[1, `${L}^2`], [b, '']]), 'multiplied only the first term'), M(sum([[2, L], [b, L]]), 'wrote the pronumeral × itself as 2 times it'), M(sum([[1, `${L}^2`], [b, `${L}^2`]]), 'squared the pronumeral in both terms')]],
  ][kind] as [string, string, (string | Miss)[]]
  return gq({
    t: 'expand',
    prompt: `Expand:${big(E(expr))}`,
    correct: E(right),
    wrong: wrong.map(EO),
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
  const [expr, right, wrong]: [string, string, (string | Miss)[]] = plus
    ? [`${a}(${L} + ${b}) + ${c}${L}`, sum([[a + c, L], [a * b, '']]), [M(sum([[a + c, L], [b, '']]), 'multiplied only the first term'), M(sum([[a * c, L], [a * b, '']]), 'multiplied like terms instead of adding'), M(sum([[a, L], [a * b + c, '']]), 'added unlike terms'), sum([[a + c + 1, L], [a * b, '']])]]
    : [`${a}(${L} + ${b}) - ${c}`, sum([[a, L], [a * b - c, '']]), [M(sum([[a, L], [b - c, '']]), 'multiplied only the first term'), M(sum([[a, L], [a * b + c, '']]), 'added instead of subtracted'), M(sum([[a - c, L], [a * b, '']]), 'combined unlike terms'), sum([[a, L], [a * b - c + 1, '']])]]
  return gq({
    t: 'simplify',
    prompt: `Expand and simplify:${big(E(expr))}`,
    correct: E(right),
    wrong: wrong.map(EO),
    why: `Expand first: ${E(sum([[a, L], [a * b, '']]))}. Then collect like terms: ${E(right)}.`,
    meta: { L, a, b, c, plus },
  })
}

function m307twoBrackets(): GameQuestion {
  const L = pick(LET)
  const a = int(2, 6)
  const b = int(1, 9)
  let c: number
  do c = int(2, 5)
  while (c === a)
  const d = int(1, 9)
  const minus = chance()
  // a(L + b) − c(L + d)  or  a(L + b) + c(L − d): either way the constant is ab − cd
  const k = minus ? a - c : a + c
  const right = sum([[k, L], [a * b - c * d, '']])
  const wrong: (string | Miss)[] = minus
    ? [M(sum([[k, L], [a * b + c * d, '']]), 'lost the minus on the second bracket’s last term'), M(sum([[a + c, L], [a * b - c * d, '']]), 'lost the minus on the second bracket’s first term'), M(sum([[k, L], [b - d, '']]), 'multiplied only the first terms'), sum([[k, L], [a * b - c * d + 1, '']])]
    : [M(sum([[k, L], [a * b + c * d, '']]), 'lost the minus sign inside the second bracket'), M(sum([[k, L], [b - d, '']]), 'multiplied only the first terms'), M(sum([[a * c, L], [a * b - c * d, '']]), 'multiplied like terms instead of adding'), sum([[k, L], [a * b - c * d - 1, '']])]
  return gq({
    t: 'twoBrackets',
    prompt: `Expand and simplify:${big(E(minus ? `${a}(${L} + ${b}) - ${c}(${L} + ${d})` : `${a}(${L} + ${b}) + ${c}(${L} - ${d})`))}`,
    correct: E(right),
    // a sign lost on the second bracket, only the first term multiplied, the outside numbers multiplied; a spare
    wrong: wrong.map(EO),
    why: `Expand each bracket: ${E(sum([[a, L], [a * b, '']]))} and ${E(sum([[minus ? -c : c, L], [-c * d, '']]))}. Then collect like terms: ${E(right)}.`,
    meta: { L, a, b, c, d, minus },
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
  makers: [mk('expand', m307expand), mk('simplify', m307simplify, 2), mk('twoBrackets', m307twoBrackets, 2)],
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
    wrong: [miss(E(String(g)), 'left out the pronumeral'), miss(E(mono(1, { [L]: Math.min(e1, e2) })), 'left out the number'), miss(E(mono(g, { [L]: Math.max(e1, e2) + (e1 === e2 ? 1 : 0) })), 'did not take the lowest power'), miss(E(mono(g * p * q, { [L]: Math.min(e1, e2) })), 'used the LCM of the numbers'), miss(E(mono(g, { [L]: Math.min(e1, e2), [M]: 1 })), 'included a letter not in both terms')],
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
    wrong: [miss(E(mono(pick(nondivs), { [L]: 1 })), 'a number that does not divide it'), miss(E(mono(pick(divs), { [L]: 3 })), 'a power higher than in the term'), miss(E(mono(pick(divs), { [M]: 2 })), 'a power higher than in the term'), miss(E(mono(1, { [pick(LET.filter((x) => x !== L && x !== M))]: 1 })), 'a letter that is not in the term')],
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
    wrong: [M(`${g}(${sum([[p, L], [minus ? -g * q : g * q, '']])})`, 'divided only the first term by the HCF'), M(`${g}(${sum([[p, L], [minus ? q : -q, '']])})`, 'changed the sign inside'), M(`${g * p}(${sum([[1, L], [minus ? -q : q, '']])})`, 'took out the first term’s number, not the HCF'), M(`${g}(${sum([[g * p, L], [minus ? -q : q, '']])})`, 'divided only the second term by the HCF')].map(EO),
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
    wrong: [M(`${part}(${sum([[(g / part) * p, L], [(g / part) * q, '']])})`, 'not fully factorised: a common factor is left'), M(`${g}(${sum([[p, L], [g * q, '']])})`, 'divided only the first term by the HCF'), `${g}(${sum([[p, L], [q + 1, '']])})`].map(EO),
    why: `The highest common factor is ${g}, not just ${part}: ${E(right)}.`,
    meta: { L, g, p, q },
  })
}

function m309letter(): GameQuestion {
  const L = pick(LET)
  const a = int(2, 9)
  const kind = int(0, 1)
  const [expr, right, wrong] = [
    [`${L}^2 + ${a}${L}`, `${L}(${L} + ${a})`, [M(`${L}(${L}^2 + ${a})`, 'took out the pronumeral but left the square'), M(`${L}(${L} + ${a}${L})`, 'divided only the first term'), M(`${a}${L}(${L} + 1)`, 'took out a number that is not common')]],
    [`${a}${L}^2 - ${a}${L}`, `${a}${L}(${L} - 1)`, [M(`${a}${L}(${L})`, 'left out the 1 (the term divided by itself)'), M(`${a}(${L}^2 - 1)`, 'took out the number only'), M(`${L}(${a}${L} - 1)`, 'took out the letter only and lost a factor')]],
  ][kind] as [string, string, (string | Miss)[]]
  return gq({
    t: 'letter',
    prompt: `Factorise fully:${big(E(expr))}`,
    correct: E(right),
    wrong: wrong.map(EO),
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
    wrong: [M(`-${g}(${sum([[p, L], [minus ? -q : q, '']])})`, 'did not change the second sign'), M(`${g}(${sum([[-p, L], [minus ? q : -q, '']])})`, 'took out a positive factor'), M(`-${g}(${sum([[p, L], [minus ? g * q : -g * q, '']])})`, 'divided only the first term by the HCF')].map(EO),
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
    wrong: [M(sum([[1, `${L}^2`], [a * b, '']]), 'left out the middle term'), M(sum([[1, `${L}^2`], [a * b, L], [a + b, '']]), 'swapped the sum and the product'), M(sum([[1, `${L}^2`], [a + b, L], [-a * b, '']]), 'sign slip on the last term'), M(sum([[1, `${L}^2`], [a - b, L], [a * b, '']]), 'sign slip on the middle term')].map(EO),
    why: `Multiply each term in the first bracket by each term in the second: ${E(`${L}^2`)} + (${bn(a)} + ${bn(b)})${v(L)} + ${bn(a)} × ${bn(b)} = ${E(right)}.`,
    meta: { L, a, b },
  })
}

/** (px + a)(qx + b) with p or q bigger than 1 */
function m311nonmonic(): GameQuestion {
  const L = pick(['x', 'y', 'a', 'm', 'n'])
  const [p, q] = pick([[2, 1], [1, 2], [3, 1], [1, 3], [2, 3], [3, 2], [2, 2]])
  const a = pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5])
  let b: number
  // no middle term would make it a difference of two squares (3.13)
  do b = pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5])
  while (p * b + q * a === 0)
  const coef = (k: number) => (k === 1 ? '' : String(k))
  const br = (c: number, k: number) => (k < 0 ? `(${coef(c)}${L} - ${-k})` : `(${coef(c)}${L} + ${k})`)
  const right = sum([[p * q, `${L}^2`], [p * b + q * a, L], [a * b, '']])
  return gq({
    t: 'nonmonic',
    prompt: `Expand:${big(E(`${br(p, a)}${br(q, b)}`))}`,
    correct: E(right),
    // the inner and outer products swapped, the middle term as a + b (as if both coefficients were 1), the middle
    // term forgotten, a sign slip in the last term, then spares
    wrong: [
      sum([[p * q, `${L}^2`], [p * a + q * b, L], [a * b, '']]),
      sum([[p * q, `${L}^2`], [a + b, L], [a * b, '']]),
      sum([[p * q, `${L}^2`], [a * b, '']]),
      sum([[p * q, `${L}^2`], [p * b + q * a, L], [-a * b, '']]),
      sum([[p + q, `${L}^2`], [p * b + q * a, L], [a * b, '']]),
      sum([[p * q, `${L}^2`], [-(p * b + q * a), L], [a * b, '']]),
      sum([[p * q, `${L}^2`], [p * b + q * a, L], [a + b, '']]),
      sum([[p * q, `${L}^2`], [p * b + q * a + 1, L], [a * b, '']]),
    ]
      .filter((w) => w !== right)
      .map(E),
    why: `First, outer, inner, last: ${E(`${coef(p * q)}${L}^2`)} + ${bn(p * b)}${v(L)} + ${bn(q * a)}${v(L)} + ${bn(a * b)} = ${E(right)}.`,
    meta: { L, p, q, a, b },
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
const SET_311 = extSet('3.11', 'Expanding binomial products', 'Multiply each term of one bracket by each term of the other.', [mk('binomial', m311binomial), mk('nonmonic', m311nonmonic, 2)])
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
