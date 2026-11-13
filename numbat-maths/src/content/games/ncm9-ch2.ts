// Class games for New Century Maths 9 Advanced (Cengage) Chapter 2, Pythagoras' theorem and surds: one set of quick
// questions for each exercise, 2.01 to 2.09.
//
// The Pythagoras exercises (2.01, 2.06–2.09) revise Stage 4 and reuse NCM 8 Chapter 1 kinds (checked by that chapter's
// checks, see reuse.ts). New kinds are the surd work: recognising surds, simplifying, adding and subtracting,
// multiplying and dividing (tests/game-checks/ncm9-ch2.ts).
//
// Syllabus: NSW Mathematics K–10 (2022). Pythagoras' theorem is Stage 4 (MA4-PYT-C-01), so those sets are revision.
// Surds (2.02–2.05; 2.03 starred) are Stage 5 Path content, Indices C, MA5-IND-P-01, so those sets are labelled
// extension beyond the core.
import type { GameChapter, GameQuestion, GameSet } from '@/lib/game/types'
import { chance, ex, gq, int, mk, pick, sample } from './helpers'
import { NCM8_CH1 } from './ncm8-ch1'
import { reuse } from './reuse'

const PYT = 'MA4-PYT-C-01'
const REV = 'Revision of Stage 4 (MA4-PYT-C-01).'
const SURD = 'Stage 5 Path content (Indices C, MA5-IND-P-01): extension beyond the core.'
const big = (s: string) => `<div class="big">${s}</div>`
const SQUAREFREE = [2, 3, 5, 6, 7, 10, 11, 13, 14, 15]
/** k√n as ex() source: "3sqrt{5}", "sqrt{5}", "3" (n = 1) */
const surd = (k: number, n: number) => (n === 1 ? String(k) : k === 1 ? `sqrt{${n}}` : k === -1 ? `-sqrt{${n}}` : `${k}sqrt{${n}}`)
const S = (k: number, n: number) => ex(surd(k, n))
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
const R8 = (ex8: string, t: string, as?: string) => reuse(NCM8_CH1, ex8, t, as)

const SET_201 = set('2.01', 'Finding the hypotenuse', 'Name the hypotenuse and find it with c² = a² + b², exactly or as a whole number.', [PYT], [R8('1.02', 'hyp', 'name'), R8('1.03', 'hyp'), R8('1.03', 'exact')], REV)

// ================================================================== 2.02 Surds (Path)

function m202isSurd(): GameQuestion {
  const surds = sample([2, 3, 5, 6, 7, 8, 10, 12, 15, 18, 20, 24, 27, 50], 1)
  const notSurds = sample([4, 9, 16, 25, 36, 49, 64, 81, 100, 144], 3)
  const askNot = chance(0.4)
  if (askNot) {
    const sq = notSurds[0]
    const others = sample([2, 3, 5, 6, 7, 8, 10, 12, 15, 18, 20, 24, 27, 50], 3)
    return gq({
      t: 'isSurd',
      prompt: 'Which of these is NOT a surd?',
      correct: S(1, sq),
      wrong: others.map((n) => S(1, n)),
      why: `${S(1, sq)} = ${Math.sqrt(sq)}, a whole number, so it is rational, not a surd.`,
      meta: {},
    })
  }
  return gq({
    t: 'isSurd',
    prompt: 'Which of these is a surd?',
    correct: S(1, surds[0]),
    wrong: notSurds.map((n) => S(1, n)),
    why: `${S(1, surds[0])} is not a whole number or fraction: it is irrational, a surd. The others are perfect squares.`,
    meta: {},
  })
}

const SET_202 = set('2.02', 'Surds', 'A surd is a square root that is irrational: √n where n is not a perfect square.', [], [mk('isSurd', m202isSurd), R8('1.01', 'between')], SURD)

// ================================================================== 2.03 Simplifying surds (Path)

function m203simplify(): GameQuestion {
  const k = int(2, 6)
  const n = pick(SQUAREFREE.slice(0, 7))
  const N = k * k * n
  // a smaller square factor taken out, the square factor not square-rooted, k and n swapped
  const wrong: string[] = [S(k * k, n), S(n, k), S(k, n + 1), S(k + 1, n)]
  for (let f = 2; f < k; f++) if (k % f === 0) wrong.unshift(S(f, (k / f) * (k / f) * n))
  return gq({
    t: 'simplify',
    prompt: `Write in simplest form:${big(S(1, N))}`,
    correct: S(k, n),
    wrong: pickWrong(S(k, n), wrong),
    why: `${N} = ${k * k} × ${n}, and ${k * k} is a perfect square: ${S(1, N)} = √${k * k} × √${n} = ${S(k, n)}.`,
    meta: {},
  })
}

const SET_203 = set('2.03', 'Simplifying surds', 'Take out the largest square factor: √(a²b) = a√b.', [], [mk('simplify', m203simplify)], SURD)

// ================================================================== 2.04 Adding and subtracting surds (Path)

function m204like(): GameQuestion {
  const n = pick(SQUAREFREE)
  const a = int(2, 9)
  const c = int(1, 8)
  const minus = chance(0.4) && a > c
  const k = minus ? a - c : a + c
  return gq({
    t: 'like',
    prompt: `Simplify:${big(ex(`${surd(a, n)} ${minus ? '-' : '+'} ${surd(c, n)}`))}`,
    correct: S(k, n),
    // the numbers under the root added too, the other operation, multiplied
    wrong: pickWrong(S(k, n), [S(k, 2 * n), S(minus ? a + c : Math.abs(a - c) || a + c + 1, n), S(a * c, n), S(k, n * n), S(k + 1, n), S(k - 1, n), S(k, n + 1)]),
    why: `Like surds add like terms: ${a} ${minus ? '−' : '+'} ${c} = ${k}, so ${S(k, n)}.`,
    meta: {},
  })
}

function m204simplifyAdd(): GameQuestion {
  const n = pick([2, 3, 5])
  const [p, q] = sample([1, 2, 3, 4, 5], 2)
  const minus = chance(0.3) && p > q
  // √(p²n) ± √(q²n) = (p ± q)√n
  const k = minus ? p - q : p + q
  const A = p * p * n
  const B = q * q * n
  return gq({
    t: 'simplifyAdd',
    prompt: `Simplify:${big(ex(`sqrt{${A}} ${minus ? '-' : '+'} sqrt{${B}}`))}`,
    correct: S(k, n),
    // added under the root, not simplified first (unlike surds kept), the coefficients multiplied
    wrong: pickWrong(S(k, n), [S(1, minus ? A - B : A + B), S(p * q, n), S(k, 2 * n), S(minus ? p + q : Math.abs(p - q) || k + 1, n), S(k + 1, n)]),
    why: `${ex(`sqrt{${A}}`)} = ${S(p, n)} and ${ex(`sqrt{${B}}`)} = ${S(q, n)}, so the answer is ${S(k, n)}.`,
    meta: {},
  })
}

const SET_204 = set('2.04', 'Adding and subtracting surds', 'Only like surds can be added or subtracted: simplify first to find them.', [], [mk('like', m204like), mk('simplifyAdd', m204simplifyAdd, 2)], SURD)

// ================================================================== 2.05 Multiplying and dividing surds (Path)

function m205mult(): GameQuestion {
  const [m, n] = sample([2, 3, 5, 7, 11], 2)
  const [a, c] = [int(1, 6), int(2, 6)]
  return gq({
    t: 'mult',
    prompt: `Simplify:${big(ex(`${surd(a, m)} × ${surd(c, n)}`))}`,
    correct: S(a * c, m * n),
    // the roots added, the coefficients added, only the numbers outside multiplied
    wrong: pickWrong(S(a * c, m * n), [S(a * c, m + n), S(a + c, m * n), S(a * c * m, n), S(a * c * m * n, 1), S(a * c + 1, m * n)]),
    why: `Multiply the numbers outside (${a} × ${c} = ${a * c}) and under the roots (${m} × ${n} = ${m * n}): ${S(a * c, m * n)}.`,
    meta: {},
  })
}

function m205divide(): GameQuestion {
  const [m, n] = sample([2, 3, 5, 7], 2)
  const c = int(1, 4)
  const k = int(2, 5)
  const a = c * k
  // (a√(mn)) ÷ (c√n) = k√m
  return gq({
    t: 'divide',
    prompt: `Simplify:${big(ex(`${surd(a, m * n)} ÷ ${surd(c, n)}`))}`,
    correct: S(k, m),
    // the roots subtracted, the numbers outside not divided, divided the wrong way
    wrong: pickWrong(S(k, m), [S(k, m * n - n), S(a, m), S(k, n), S(k * m, 1), S(k + 1, m)]),
    why: `Divide the numbers outside (${a} ÷ ${c} = ${k}) and under the roots (${m * n} ÷ ${n} = ${m}): ${S(k, m)}.`,
    meta: {},
  })
}

const SET_205 = set('2.05', 'Multiplying and dividing surds', '√a × √b = √(ab) and √a ÷ √b = √(a/b): numbers outside with numbers outside, inside with inside.', [], [mk('mult', m205mult), mk('divide', m205divide, 2)], SURD)

// ================================================================== 2.06–2.09 revision of Pythagoras

const SET_206 = set('2.06', 'Finding a shorter side', 'Subtract the squares to find a shorter side.', [PYT], [R8('1.04', 'short'), R8('1.05', 'which')], REV)
const SET_207 = set('2.07', "Pythagoras' theorem problems", 'Draw the right-angled triangle, then use Pythagoras to solve the problem.', [PYT], [R8('1.08', 'problem'), R8('1.05', 'find')], REV)
const SET_208 = set('2.08', 'Testing for right-angled triangles', 'If a² + b² = c² for the longest side c, the triangle is right-angled.', [PYT], [R8('1.06', 'test'), R8('1.06', 'which')], REV)
const SET_209 = set('2.09', 'Pythagorean triads', 'Whole numbers with a² + b² = c², and their multiples.', [PYT], [R8('1.07', 'complete'), R8('1.07', 'multiple')], REV)

export const NCM9_CH2: GameChapter = {
  id: 'ncm9-ch2',
  number: 2,
  title: "Pythagoras' theorem and surds",
  ref: 'NCM 9 Chapter 2',
  strand: 'Number and algebra',
  outcomes: [PYT],
  sets: [SET_201, SET_202, SET_203, SET_204, SET_205, SET_206, SET_207, SET_208, SET_209],
  colour: 205,
  topics: [],
}
