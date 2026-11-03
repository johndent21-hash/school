// Year 9 Coordinate geometry and graphs, following New Century Maths 9 (3rd edition, Cengage) Chapter 11
// exercise by exercise. The questions are the site's own: they practise the same kinds of question as each
// exercise, in the same easy-to-hard order (Foundation = the start of the exercise, Challenge = the end), but
// none of the textbook's wording or numbers are copied.
// Syllabus: 11.01–11.03 MA5-LIN-C-01, 11.04–11.08 MA5-LIN-C-02, 11.10–11.11 MA5-NLI-C-01 (all core).
// 11.09 Direct variation is Path content (MA5-RAT-P-01) and is labelled as an extension, as is Power plus.
import type { Level, Question, Skill, TestItem } from '@/lib/maths/types'
import * as G from '@/lib/maths/diagrams5'
import {
  D, MINUS, TIMES, DIVIDE, bnum, chance, dollars, ex, exprA, frac, fracA, fracS, gcd, int, mcA, mcFixedA, money, nonZero, num, numA, pick, pointA, q, round, sample,
  shuffle, sqrt, v,
} from './helpers'

const LIN1 = ['MA5-LIN-C-01']
const LIN2 = ['MA5-LIN-C-02']
const NLI = ['MA5-NLI-C-01']
const big = (s: string) => `<div class="big">${s}</div>`
type P = [number, number]
const pt = (x: number, y: number) => `(${num(x)}, ${num(y)})`
const named = (L: string, p: P) => `${v(L)}${pt(p[0], p[1])}`
const isSq = (n: number) => Number.isInteger(Math.sqrt(n))
const NAMES: [string, string][] = [['A', 'B'], ['P', 'Q'], ['M', 'N'], ['G', 'H'], ['W', 'X'], ['K', 'L'], ['R', 'S'], ['C', 'D'], ['E', 'F'], ['Y', 'Z']]
const sqTerm = (d: number) => (d < 0 ? `(${num(d)})<sup>2</sup>` : `${num(d)}<sup>2</sup>`)
/** a number plane that fits these points with a margin */
function fit(pts: P[], pad = 1, minSpan = 6) {
  const xs = pts.map((p) => p[0])
  const ys = pts.map((p) => p[1])
  let [xmin, xmax, ymin, ymax] = [Math.min(...xs, 0) - pad, Math.max(...xs, 0) + pad, Math.min(...ys, 0) - pad, Math.max(...ys, 0) + pad]
  while (xmax - xmin < minSpan) xmax++
  while (ymax - ymin < minSpan) ymax++
  return { xmin: Math.floor(xmin), xmax: Math.ceil(xmax), ymin: Math.floor(ymin), ymax: Math.ceil(ymax) }
}
/** HTML for y = mx + c, with m = mn/md */
function lineEq(mn: number, md: number, c: number, y = 'y'): string {
  const g = gcd(Math.abs(mn), md) || 1
  mn /= g
  md /= g
  let s = ''
  if (mn !== 0) {
    if (md === 1) s = mn === 1 ? v('x') : mn === -1 ? `${MINUS}${v('x')}` : `${num(mn)}${v('x')}`
    else s = `${mn < 0 ? MINUS : ''}${frac(Math.abs(mn), md)}${v('x')}`
  }
  if (c !== 0 || s === '') s = s === '' ? num(c) : `${s} ${c < 0 ? MINUS : '+'} ${num(Math.abs(c))}`
  return `${v(y)} = ${s}`
}
/** plain text for labels inside diagrams (SVG can't hold the HTML fractions), e.g. "y = x/2 − 3" */
function lineLabel(mn: number, md: number, c: number): string {
  const g = gcd(Math.abs(mn), md) || 1
  mn /= g
  md /= g
  const sign = mn < 0 ? MINUS : ''
  const a = Math.abs(mn)
  const m = mn === 0 ? '' : md === 1 ? `${sign}${a === 1 ? '' : a}x` : `${sign}${a === 1 ? '' : a}x/${md}`
  if (!m) return `y = ${num(c)}`
  return c === 0 ? `y = ${m}` : `y = ${m} ${c < 0 ? MINUS : '+'} ${num(Math.abs(c))}`
}
/** plain expression for checking, e.g. "2x/5 + 3" */
function lineExpr(mn: number, md: number, c: number): string {
  const g = gcd(Math.abs(mn), md) || 1
  mn /= g
  md /= g
  const m = mn === 0 ? '' : md === 1 ? (mn === 1 ? 'x' : mn === -1 ? '-x' : `${mn}x`) : `${mn}x/${md}`
  if (!m) return String(c)
  return c === 0 ? m : `${m} ${c < 0 ? '-' : '+'} ${Math.abs(c)}`
}

// ================================================================== 11.01 The length of an interval

/** two points whose run and rise are both non-zero */
function twoPoints(lo: number, hi: number, maxRun = 9): [P, P] {
  for (;;) {
    const a: P = [int(lo, hi), int(lo, hi)]
    const b: P = [int(lo, hi), int(lo, hi)]
    const dx = Math.abs(b[0] - a[0])
    const dy = Math.abs(b[1] - a[1])
    if (dx > 0 && dy > 0 && dx <= maxRun && dy <= maxRun) return [a, b]
  }
}
const TRIPLES: [number, number][] = [[3, 4], [4, 3], [6, 8], [8, 6], [5, 12], [12, 5]]

function lengthSteps(a: P, b: P, L: [string, string]): string[] {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const d2 = dx * dx + dy * dy
  return [
    `Make a right-angled triangle with ${v(L[0] + L[1])} as the hypotenuse. Run = ${num(Math.abs(dx))}, rise = ${num(Math.abs(dy))}.`,
    `${v(L[0] + L[1])}<sup>2</sup> = ${num(Math.abs(dx))}<sup>2</sup> + ${num(Math.abs(dy))}<sup>2</sup> = ${num(dx * dx)} + ${num(dy * dy)} = ${num(d2)}`,
    isSq(d2) ? `${v(L[0] + L[1])} = ${sqrt(d2)} = ${num(Math.sqrt(d2))} units` : `${v(L[0] + L[1])} = ${sqrt(d2)} ≈ ${num(round(Math.sqrt(d2), 1), 1)} units`,
  ]
}

function lenGrid(): Question {
  const L = pick(NAMES)
  let a: P
  let b: P
  if (chance(0.4)) {
    const [r, s] = pick(TRIPLES.filter((t) => t[0] <= 8 && t[1] <= 8))
    a = [int(-6, 6 - r), int(-5, 5 - s)]
    b = chance() ? [a[0] + r, a[1] + s] : [a[0] + r, a[1] - s]
    if (b[1] < -6) b = [a[0] + r, a[1] + s]
  } else [a, b] = twoPoints(-6, 6, 7)
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const d2 = dx * dx + dy * dy
  return q({
    prompt: `Find the length of the interval ${v(L[0] + L[1])}. Give your answer correct to one decimal place if it is not a whole number.`,
    diagram: G.plane({ ...fit([a, b]), segments: [{ a, b, legs: true }], points: [{ x: a[0], y: a[1], label: L[0], pos: 'sw' }, { x: b[0], y: b[1], label: L[1], pos: 'ne' }] }),
    answer: isSq(d2) ? numA(Math.sqrt(d2)) : numA(Math.sqrt(d2), 1),
    suffix: 'units',
    calc: !isSq(d2),
    hint: 'Count the run and the rise of the dashed right-angled triangle, then use Pythagoras’ theorem.',
    steps: lengthSteps(a, b, L),
    meta: { t: 'len', a, b, dp: isSq(d2) ? null : 1 },
  })
}

function runRise(): Question {
  const L = pick(NAMES)
  const [a, b] = twoPoints(-5, 6, 8)
  const which = pick(['run', 'rise'] as const)
  const val = which === 'run' ? Math.abs(b[0] - a[0]) : Math.abs(b[1] - a[1])
  return q({
    prompt: `${named(L[0], a)} and ${named(L[1], b)} are joined to make the hypotenuse of a right-angled triangle. How long is the ${which === 'run' ? 'horizontal side (the run)' : 'vertical side (the rise)'} of the triangle?`,
    diagram: G.plane({ ...fit([a, b]), segments: [{ a, b, legs: true }], points: [{ x: a[0], y: a[1], label: L[0], pos: 'sw' }, { x: b[0], y: b[1], label: L[1], pos: 'ne' }] }),
    answer: numA(val),
    suffix: 'units',
    hint: which === 'run' ? 'Find the difference between the x-coordinates.' : 'Find the difference between the y-coordinates.',
    steps: [which === 'run' ? `The x-coordinates are ${num(a[0])} and ${num(b[0])}. The difference is ${num(val)}.` : `The y-coordinates are ${num(a[1])} and ${num(b[1])}. The difference is ${num(val)}.`],
    meta: { t: which, a, b },
  })
}

function lenText(form: 'surd' | 'dp'): Question {
  const L = pick(NAMES)
  let a: P
  let b: P
  do [a, b] = twoPoints(-9, 9, 11)
  while (isSq((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2))
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const d2 = dx * dx + dy * dy
  return q({
    prompt:
      form === 'surd'
        ? `Find the exact distance between ${named(L[0], a)} and ${named(L[1], b)}. Write it as a surd.`
        : `Find the distance between ${named(L[0], a)} and ${named(L[1], b)}, correct to one decimal place.`,
    answer: form === 'surd' ? numA(d2) : numA(Math.sqrt(d2), 1),
    prefix: form === 'surd' ? '√' : undefined,
    suffix: 'units',
    calc: form === 'dp',
    hint: form === 'surd' ? 'Find the run and the rise from the coordinates, then use Pythagoras’ theorem. Leave the answer as √ of a number.' : 'Find the run and the rise, use Pythagoras’ theorem, then round.',
    steps: [
      `Run = ${num(b[0])} ${MINUS} ${bnum(a[0])} = ${num(dx)}, rise = ${num(b[1])} ${MINUS} ${bnum(a[1])} = ${num(dy)}`,
      `${v('d')}<sup>2</sup> = ${sqTerm(dx)} + ${sqTerm(dy)} = ${num(d2)}`,
      form === 'surd' ? `${v('d')} = ${sqrt(d2)} units (exact)` : `${v('d')} = ${sqrt(d2)} ≈ ${num(round(Math.sqrt(d2), 1), 1)} units`,
    ],
    meta: { t: form === 'surd' ? 'len-surd' : 'len', a, b, dp: 1 },
  })
}

function lenMC(): Question {
  const L = pick(NAMES)
  let a: P
  let b: P
  do [a, b] = twoPoints(-8, 8, 10)
  while (Math.abs(b[0] - a[0]) === Math.abs(b[1] - a[1]))
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const d2 = dx * dx + dy * dy
  const wrong = [(a[0] + b[0]) ** 2 + (a[1] + b[1]) ** 2, Math.abs(dx * dx - dy * dy), (Math.abs(dx) + Math.abs(dy)) ** 2, d2 + 2 * Math.abs(dx), Math.abs(dx) + Math.abs(dy)].filter((w) => w !== d2 && w > 0)
  return q({
    prompt: `What is the exact distance between ${named(L[0], a)} and ${named(L[1], b)}?`,
    answer: mcA(`${sqrt(d2)} units`, Array.from(new Set(wrong)).slice(0, 3).map((w) => `${sqrt(w)} units`)),
    hint: 'Square the run and the rise, add them, then take the square root.',
    steps: [`Run = ${num(Math.abs(dx))}, rise = ${num(Math.abs(dy))}`, `${v('d')}<sup>2</sup> = ${num(dx * dx)} + ${num(dy * dy)} = ${num(d2)}, so ${v('d')} = ${sqrt(d2)} units.`],
    meta: { t: 'len-mc', a, b },
  })
}

function triangleType(): Question {
  const R: P = [int(-4, 2), int(-4, 2)]
  let p = int(1, 4)
  let s = int(-3, 4)
  if (p === Math.abs(s)) s = s + 1 === 0 ? 2 : s + 1
  const kind = pick(['iso', 'iso', 'scalene'] as const)
  let S: P = [R[0] + p, R[1] + s]
  let T: P = [R[0] + s, R[1] + p] // a reflection in the line y − R.y = x − R.x through R: RS = RT
  if (kind === 'scalene') {
    T = [R[0] + int(-3, 4), R[1] + int(2, 6)]
    const d = (u: P, w: P) => (u[0] - w[0]) ** 2 + (u[1] - w[1]) ** 2
    const ok = (x: P, y: P, z: P) => d(x, y) !== d(y, z) && d(x, y) !== d(x, z) && d(x, z) !== d(y, z) && (y[0] - x[0]) * (z[1] - x[1]) !== (y[1] - x[1]) * (z[0] - x[0])
    while (!ok(R, S, T)) {
      p = int(1, 5)
      S = [R[0] + p, R[1] + int(-3, 3)]
      T = [R[0] + int(-3, 4), R[1] + int(2, 6)]
    }
  }
  const d = (u: P, w: P) => (u[0] - w[0]) ** 2 + (u[1] - w[1]) ** 2
  const [rs, st, rt] = [d(R, S), d(S, T), d(R, T)]
  const correct = rs === rt || rs === st || st === rt ? 'isosceles' : 'scalene'
  return q({
    prompt: `The vertices of triangle ${v('RST')} are ${named('R', R)}, ${named('S', S)} and ${named('T', T)}. Find the length of each side. What type of triangle is ${v('RST')}?`,
    answer: mcFixedA(['scalene', 'isosceles', 'equilateral'], correct),
    hint: 'Find all three lengths as surds and compare them.',
    steps: [`${v('RS')} = ${sqrt(rs)}, ${v('ST')} = ${sqrt(st)}, ${v('RT')} = ${sqrt(rt)}`, correct === 'isosceles' ? 'Two sides are equal, so the triangle is isosceles.' : 'All three sides are different, so the triangle is scalene.'],
    meta: { t: 'tri-type', R, S, T },
  })
}

function trianglePerimeter(): Question {
  const pts: P[] = []
  const d = (u: P, w: P) => Math.sqrt((u[0] - w[0]) ** 2 + (u[1] - w[1]) ** 2)
  for (;;) {
    pts.length = 0
    for (let i = 0; i < 3; i++) pts.push([int(-6, 7), int(-5, 7)])
    const [A, B, C] = pts
    const area2 = Math.abs((B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0]))
    if (area2 >= 8 && d(A, B) > 2 && d(B, C) > 2 && d(A, C) > 2) break
  }
  const [A, B, C] = pts
  const P = d(A, B) + d(B, C) + d(A, C)
  return q({
    prompt: `A triangle is made by joining ${named('A', A)}, ${named('B', B)} and ${named('C', C)}. Find the perimeter of triangle ${v('ABC')}, correct to one decimal place.`,
    answer: numA(P, 1),
    suffix: 'units',
    calc: true,
    hint: 'Find each side length with Pythagoras’ theorem (keep the full calculator values), add them, then round.',
    steps: [`${v('AB')} = ${sqrt((A[0] - B[0]) ** 2 + (A[1] - B[1]) ** 2)}, ${v('BC')} = ${sqrt((B[0] - C[0]) ** 2 + (B[1] - C[1]) ** 2)}, ${v('AC')} = ${sqrt((A[0] - C[0]) ** 2 + (A[1] - C[1]) ** 2)}`, `Perimeter = ${num(round(d(A, B), 3))} + ${num(round(d(B, C), 3))} + ${num(round(d(A, C), 3))} … ≈ ${num(round(P, 1), 1)} units`],
    meta: { t: 'perim', pts },
  })
}

function trapezium(): Question {
  // right trapezium: vertical left side, horizontal top and bottom, slanted right side
  const x0 = int(-5, -1)
  const y0 = int(-3, 1)
  const h = pick([3, 4, 6, 8])
  const top = int(3, 7)
  const extra = h === 3 ? 4 : h === 4 ? 3 : h === 6 ? 8 : 6 // 3-4-5 and 6-8-10 triangles
  const M: P = [x0, y0 + h]
  const N: P = [x0 + top, y0 + h]
  const Pp: P = [x0 + top + extra, y0]
  const T: P = [x0, y0]
  const slant = Math.sqrt(h * h + extra * extra)
  const ask = pick(['perimeter', 'area'] as const)
  const perim = top + (top + extra) + h + slant
  const area = ((top + top + extra) / 2) * h
  return q({
    prompt: `A quadrilateral is made by joining ${named('M', M)}, ${named('N', N)}, ${named('P', Pp)} and ${named('T', T)}. Find its ${ask}.`,
    diagram: G.plane({ ...fit([M, N, Pp, T]), shape: [M, N, Pp, T], points: [{ x: M[0], y: M[1], label: 'M', pos: 'nw' }, { x: N[0], y: N[1], label: 'N', pos: 'ne' }, { x: Pp[0], y: Pp[1], label: 'P', pos: 'se' }, { x: T[0], y: T[1], label: 'T', pos: 'sw' }] }),
    answer: numA(ask === 'perimeter' ? perim : area),
    suffix: ask === 'perimeter' ? 'units' : 'square units',
    hint: ask === 'perimeter' ? 'Count the horizontal and vertical sides, and use Pythagoras’ theorem for the sloping side.' : 'It is a trapezium: area = ½ × (sum of the parallel sides) × height.',
    steps:
      ask === 'perimeter'
        ? [`${v('MN')} = ${top}, ${v('TP')} = ${top + extra}, ${v('MT')} = ${h}`, `${v('NP')}<sup>2</sup> = ${extra}<sup>2</sup> + ${h}<sup>2</sup> = ${extra * extra + h * h}, so ${v('NP')} = ${num(slant)}`, `Perimeter = ${top} + ${top + extra} + ${h} + ${num(slant)} = ${num(perim)} units`]
        : [`${v('MNPT')} is a trapezium: ${v('MN')} = ${top} and ${v('TP')} = ${top + extra} are parallel, and the height is ${h}.`, `Area = ½ × (${top} + ${top + extra}) × ${h} = ${num(area)} square units`],
    meta: { t: 'trap-' + ask, M, N, P: Pp, T },
  })
}

export const ex1101 = (level: Level): Question => {
  if (level === 1) return chance(0.7) ? lenGrid() : runRise()
  if (level === 2) return pick([() => lenText('surd'), () => lenText('dp'), lenMC, lenGrid])()
  return pick([triangleType, trianglePerimeter, trapezium])()
}

// ================================================================== 11.02 The midpoint of an interval

function midSteps(a: P, b: P): string[] {
  const mx = (a[0] + b[0]) / 2
  const my = (a[1] + b[1]) / 2
  return [`Average of the x-coordinates: (${num(a[0])} + ${bnum(b[0])}) ${DIVIDE} 2 = ${num(mx)}`, `Average of the y-coordinates: (${num(a[1])} + ${bnum(b[1])}) ${DIVIDE} 2 = ${num(my)}`, `The midpoint is ${pt(mx, my)}.`]
}

function midPoint(withDiagram: boolean, negatives: boolean, halves: boolean): Question {
  const L = pick(NAMES)
  let a: P
  let b: P
  do {
    a = negatives ? [int(-9, 9), int(-9, 9)] : [int(0, 10), int(0, 10)]
    b = negatives ? [int(-9, 9), int(-9, 9)] : [int(0, 10), int(0, 10)]
  } while ((a[0] === b[0] && a[1] === b[1]) || (!halves && ((a[0] + b[0]) % 2 !== 0 || (a[1] + b[1]) % 2 !== 0)) || (withDiagram && (Math.abs(a[0] - b[0]) > 8 || Math.abs(a[1] - b[1]) > 8)))
  const m: P = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  return q({
    prompt: `Find the midpoint of the interval joining ${named(L[0], a)} and ${named(L[1], b)}.`,
    diagram: withDiagram ? G.plane({ ...fit([a, b]), segments: [{ a, b }], points: [{ x: a[0], y: a[1], label: `${L[0]}${pt(a[0], a[1])}`, pos: 'sw' }, { x: b[0], y: b[1], label: `${L[1]}${pt(b[0], b[1])}`, pos: 'ne' }] }) : undefined,
    answer: pointA(m[0], m[1]),
    hint: 'Average the x-coordinates, then average the y-coordinates.',
    steps: midSteps(a, b),
    meta: { t: 'mid', a, b },
  })
}

function midMC(): Question {
  const L = pick(NAMES)
  let a: P
  let b: P
  do {
    a = [int(-8, 9), int(-8, 9)]
    b = [int(-8, 9), int(-8, 9)]
  } while ((a[0] + b[0]) % 2 !== 0 || (a[1] + b[1]) % 2 !== 0 || a[0] === b[0] || a[1] === b[1])
  const m: P = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  const wrong = [pt(a[0] + b[0], a[1] + b[1]), pt((b[0] - a[0]) / 2, (b[1] - a[1]) / 2), pt(m[1], m[0]), pt(-m[0], m[1])]
  return q({
    prompt: `What is the midpoint of ${named(L[0], a)} and ${named(L[1], b)}?`,
    answer: mcA(pt(m[0], m[1]), wrong.filter((w) => w !== pt(m[0], m[1])).slice(0, 3)),
    hint: 'The midpoint’s coordinates are the averages of the endpoints’ coordinates.',
    steps: midSteps(a, b),
    meta: { t: 'mid-mc', a, b },
  })
}

function quarterPoints(): Question {
  const A: P = [int(-6, 0), int(-5, 0)]
  const B: P = [A[0] + 4 * int(1, 3), A[1] + 4 * pick([1, 2])]
  const k = pick([1, 2, 3])
  const names = ['Q', 'P', 'R']
  const target: P = [A[0] + ((B[0] - A[0]) * k) / 4, A[1] + ((B[1] - A[1]) * k) / 4]
  const marks = [1, 2, 3].map((j) => ({ x: A[0] + ((B[0] - A[0]) * j) / 4, y: A[1] + ((B[1] - A[1]) * j) / 4, label: names[j - 1], pos: 'nw' as const }))
  return q({
    prompt: `The interval from ${named('A', A)} to ${named('B', B)} is split into 4 equal parts by the points ${v('Q')}, ${v('P')} and ${v('R')}, in that order. Find the coordinates of ${v(names[k - 1])}.`,
    diagram: G.plane({ ...fit([A, B]), segments: [{ a: A, b: B }], points: [{ x: A[0], y: A[1], label: 'A', pos: 'sw' }, { x: B[0], y: B[1], label: 'B', pos: 'ne' }, ...marks] }),
    answer: pointA(target[0], target[1]),
    hint: `${v('P')} is the midpoint of ${v('AB')}. ${v('Q')} is the midpoint of ${v('AP')}, and ${v('R')} is the midpoint of ${v('PB')}.`,
    steps: [
      `${v('P')} = midpoint of ${v('AB')} = ${pt((A[0] + B[0]) / 2, (A[1] + B[1]) / 2)}`,
      k === 2 ? `So ${v('P')} is ${pt(target[0], target[1])}.` : k === 1 ? `${v('Q')} = midpoint of ${v('A')} and ${v('P')} = ${pt(target[0], target[1])}` : `${v('R')} = midpoint of ${v('P')} and ${v('B')} = ${pt(target[0], target[1])}`,
    ],
    meta: { t: 'quarter', A, B, k },
  })
}

function rectangleDiagonals(): Question {
  // a tilted rectangle: W, X = W + u, Y = W + u + w, Z = W + w with w at right angles to u
  const W: P = [int(-5, -2), int(-1, 2)]
  const u: P = [int(2, 4), int(1, 3)]
  const k = pick([1, 2])
  const w: P = [u[1] * k, -u[0] * k]
  const X: P = [W[0] + u[0], W[1] + u[1]]
  const Y: P = [X[0] + w[0], X[1] + w[1]]
  const Z: P = [W[0] + w[0], W[1] + w[1]]
  const which = pick(['WY', 'XZ'] as const)
  const [p1, p2] = which === 'WY' ? [W, Y] : [X, Z]
  const m: P = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2]
  return q({
    prompt: `${v('WXYZ')} is a rectangle with ${named('W', W)}, ${named('X', X)}, ${named('Y', Y)} and ${named('Z', Z)}. Find the midpoint of the diagonal ${v(which)}.`,
    diagram: G.plane({ ...fit([W, X, Y, Z]), shape: [W, X, Y, Z], points: [{ x: W[0], y: W[1], label: 'W', pos: 'w' }, { x: X[0], y: X[1], label: 'X', pos: 'n' }, { x: Y[0], y: Y[1], label: 'Y', pos: 'e' }, { x: Z[0], y: Z[1], label: 'Z', pos: 's' }] }),
    answer: pointA(m[0], m[1]),
    hint: 'Average the coordinates of the two ends of the diagonal.',
    steps: [...midSteps(p1, p2), 'Both diagonals have this midpoint: the diagonals of a rectangle bisect each other.'],
    meta: { t: 'mid', a: p1, b: p2 },
  })
}

function isoscelesMidpoint(): Question {
  const M: P = [int(-2, 3), int(-1, 4)]
  const u: P = [int(2, 4), pick([1, 2, 3])]
  const Pp: P = [M[0] - u[0], M[1] - u[1]]
  const Q: P = [M[0] + u[0], M[1] + u[1]]
  const t = pick([1, 2])
  const R: P = [M[0] + u[1] * t, M[1] - u[0] * t]
  const mr2 = (R[0] - M[0]) ** 2 + (R[1] - M[1]) ** 2
  return q({
    prompt: `Triangle ${v('PQR')} has ${named('P', Pp)}, ${named('Q', Q)} and ${named('R', R)}. ${v('M')} is the midpoint of ${v('PQ')}. Find the exact length of ${v('MR')}${isSq(mr2) ? '' : ' as a surd'}.`,
    answer: numA(isSq(mr2) ? Math.sqrt(mr2) : mr2),
    prefix: isSq(mr2) ? undefined : '√',
    suffix: 'units',
    hint: `First find ${v('M')} by averaging the coordinates of ${v('P')} and ${v('Q')}. Then use Pythagoras’ theorem for ${v('MR')}.`,
    steps: [`${v('M')} = ${pt(M[0], M[1])}`, `Run from ${v('M')} to ${v('R')} = ${num(Math.abs(R[0] - M[0]))}, rise = ${num(Math.abs(R[1] - M[1]))}`, `${v('MR')}<sup>2</sup> = ${num((R[0] - M[0]) ** 2)} + ${num((R[1] - M[1]) ** 2)} = ${num(mr2)}, so ${v('MR')} = ${sqrt(mr2)}${isSq(mr2) ? ` = ${num(Math.sqrt(mr2))}` : ''} units`],
    meta: { t: 'iso-mr', P: Pp, Q, R },
  })
}

export const ex1102 = (level: Level): Question => {
  if (level === 1) return chance(0.5) ? midPoint(true, false, false) : midPoint(false, false, false)
  if (level === 2) return chance(0.75) ? midPoint(false, true, true) : midMC()
  return pick([quarterPoints, rectangleDiagonals, isoscelesMidpoint])()
}

// ================================================================== 11.03 The gradient of a line

function gradSteps(rise: number, run: number): string[] {
  return [`Rise = ${num(rise)}, run = ${num(run)}`, `${v('m')} = ${frac('rise', 'run')} = ${frac(num(rise), num(run))}${gcd(Math.abs(rise), run) > 1 || run === 1 ? ' = ' + fracS(rise, run) : ''}`]
}

function gradSign(): Question {
  const rise = nonZero(-8, 8)
  const run = int(1, 8)
  return q({
    prompt: 'Is the gradient of this line positive or negative?',
    diagram: G.slopeTriangle(rise, run, false),
    answer: mcFixedA(['positive', 'negative'], rise > 0 ? 'positive' : 'negative'),
    hint: 'Read from left to right. Going up means a positive gradient; going down means negative.',
    steps: [rise > 0 ? 'The line goes up from left to right, so its gradient is positive.' : 'The line goes down from left to right, so its gradient is negative.'],
    meta: { t: 'sign', rise, run },
  })
}

function gradTriangle(): Question {
  const rise = nonZero(-12, 12)
  const run = int(1, 8)
  return q({
    prompt: 'Find the gradient of this line.',
    diagram: G.slopeTriangle(rise, run),
    answer: fracA(rise, run, { allowDecimal: true }),
    hint: 'Gradient = rise ÷ run. A line going down has a negative rise.',
    steps: gradSteps(rise, run),
    meta: { t: 'grad', rise, run },
  })
}

function gradGrid(): Question {
  const L = pick(NAMES)
  let a: P
  let b: P
  do [a, b] = twoPoints(-6, 6, 8)
  while (a[0] === b[0])
  if (a[0] > b[0]) [a, b] = [b, a]
  const rise = b[1] - a[1]
  const run = b[0] - a[0]
  return q({
    prompt: `Find the gradient of the interval ${v(L[0] + L[1])}.`,
    diagram: G.plane({ ...fit([a, b]), segments: [{ a, b }], points: [{ x: a[0], y: a[1], label: L[0], pos: 'nw' }, { x: b[0], y: b[1], label: L[1], pos: 'ne' }] }),
    answer: fracA(rise, run, { allowDecimal: true }),
    hint: 'Count the run (across, left to right) and the rise (up is positive, down is negative).',
    steps: gradSteps(rise, run),
    meta: { t: 'grad', rise, run },
  })
}

function gradPoints(): Question {
  const L = pick(NAMES)
  let a: P
  let b: P
  do [a, b] = twoPoints(-9, 9, 14)
  while (a[0] === b[0])
  const rise = b[1] - a[1]
  const run = b[0] - a[0]
  const [r, s] = run < 0 ? [-rise, -run] : [rise, run]
  return q({
    prompt: `Find the gradient of the interval joining ${named(L[0], a)} and ${named(L[1], b)}.`,
    answer: fracA(rise, run, { allowDecimal: true }),
    hint: 'Gradient = difference in y ÷ difference in x, taking both differences in the same direction.',
    steps: [`Difference in y: ${num(b[1])} ${MINUS} ${a[1] < 0 ? `(${num(a[1])})` : num(a[1])} = ${num(rise)}`, `Difference in x: ${num(b[0])} ${MINUS} ${a[0] < 0 ? `(${num(a[0])})` : num(a[0])} = ${num(run)}`, `${v('m')} = ${frac(num(rise), num(run))} = ${fracS(r, s)}`],
    meta: { t: 'grad', rise, run },
  })
}

function gradPairMC(): Question {
  const [kn, kd] = pick([[2, 1], [-1, 1], [0, 1], [3, 1], [-2, 1], [1, 2], [-1, 3]] as [number, number][])
  const make = (gn: number, gd: number): string => {
    const x = int(-6, 4)
    const y = int(-6, 6)
    const t = pick([1, 2, 3])
    return `${pt(x, y)}, ${pt(x + gd * t, y + gn * t)}`
  }
  const right = make(kn, kd)
  const cands: [number, number][] = [[-kn, kd], [kd, Math.abs(kn) || 1], [kn + kd, kd], [kn, kd + 1], [1, 1], [-1, 1], [2, 1], [-2, 1], [0, 1]]
  // different gradients from the right one and from each other, and four different pairs of points
  const seen = new Set<number>([kn / kd])
  const grads = cands.filter(([n, d]) => d > 0 && !seen.has(n / d) && (seen.add(n / d), true))
  const wrong: string[] = []
  for (const [n, d] of sample(grads, 3)) {
    let pair = make(n, d)
    while (pair === right || wrong.includes(pair)) pair = make(n, d)
    wrong.push(pair)
  }
  return q({
    prompt: `Which pair of points makes an interval with a gradient of ${fracS(kn, kd)}?`,
    answer: mcA(right, wrong),
    hint: 'For each pair, work out rise ÷ run.',
    steps: [`For ${right}: rise ÷ run = ${fracS(kn, kd)}.`],
    meta: { t: 'pair', kn, kd },
  })
}

function lineOnGrid(): Question {
  // a line through two lattice points with a fractional gradient
  const run = pick([2, 3, 4, 5])
  let rise = nonZero(-3, 3)
  if (gcd(Math.abs(rise), run) !== 1) rise = rise > 0 ? 1 : -1
  const a: P = [int(-6, -2), int(-3, 3)]
  const b: P = [a[0] + run * 2, a[1] + rise * 2]
  return q({
    prompt: `Find the gradient of the line through the two marked points.`,
    diagram: G.plane({ ...fit([a, b], 2), lines: [{ m: rise / run, c: a[1] - (rise / run) * a[0] }], points: [{ x: a[0], y: a[1] }, { x: b[0], y: b[1] }] }),
    answer: fracA(rise, run, { allowDecimal: true }),
    hint: 'Count the run and rise between the two marked points, then simplify.',
    steps: [...gradSteps(rise * 2, run * 2)],
    meta: { t: 'grad', rise, run },
  })
}

function parallelSides(): Question {
  // V0 V1 V2 V3 with V0V1 parallel to V3V2: a parallelogram (same length) or a trapezium (twice as long)
  const cross = (a: P, b: P, c: P, d: P) => (b[0] - a[0]) * (d[1] - c[1]) - (b[1] - a[1]) * (d[0] - c[0])
  const kind = pick(['trap', 'trap', 'para'] as const)
  let V: P[]
  for (;;) {
    const V0: P = [int(-5, -2), int(-4, 1)]
    const u: P = [int(2, 4), int(-2, 2)]
    const w: P = [pick([-2, -1, 1, 2]), int(3, 5)]
    const long = kind === 'trap' ? 2 : 1
    const V3: P = [V0[0] + w[0], V0[1] + w[1]]
    V = [V0, [V0[0] + u[0], V0[1] + u[1]], [V3[0] + u[0] * long, V3[1] + u[1] * long], V3]
    // no vertical sides, and only the intended sides parallel
    const sides = [0, 1, 2, 3].map((i) => [V[i], V[(i + 1) % 4]] as [P, P])
    if (sides.some(([a, b]) => a[0] === b[0])) continue
    const otherPair = cross(V[1], V[2], V[3], V[0]) === 0
    if (kind === 'trap' && otherPair) continue
    break
  }
  const shift = pick([0, 1])
  const [Pp, Q, R, S] = [0, 1, 2, 3].map((i) => V[(i + shift) % 4])
  const g = (a: P, b: P) => fracS(b[1] - a[1], b[0] - a[0])
  const correct = kind === 'para' ? 'a parallelogram' : shift === 0 ? 'PQ and RS' : 'QR and SP'
  return q({
    prompt:
      kind === 'para'
        ? `${v('PQRS')} has vertices ${named('P', Pp)}, ${named('Q', Q)}, ${named('R', R)} and ${named('S', S)}. Find the gradient of each side. What type of quadrilateral is ${v('PQRS')}?`
        : `${v('PQRS')} has vertices ${named('P', Pp)}, ${named('Q', Q)}, ${named('R', R)} and ${named('S', S)}. Find the gradient of each side. Which pair of sides is parallel?`,
    diagram: G.plane({ ...fit([Pp, Q, R, S]), shape: [Pp, Q, R, S], points: [{ x: Pp[0], y: Pp[1], label: 'P', pos: 'sw' }, { x: Q[0], y: Q[1], label: 'Q', pos: 'se' }, { x: R[0], y: R[1], label: 'R', pos: 'ne' }, { x: S[0], y: S[1], label: 'S', pos: 'nw' }] }),
    answer: kind === 'para' ? mcFixedA(['a parallelogram', 'a trapezium', 'a kite'], correct) : mcFixedA(['PQ and RS', 'QR and SP', 'No sides are parallel'], correct),
    hint: 'Parallel sides have the same gradient.',
    steps: [
      `Gradients: ${v('PQ')} ${g(Pp, Q)}, ${v('QR')} ${g(Q, R)}, ${v('RS')} ${g(R, S)}, ${v('SP')} ${g(S, Pp)}`,
      kind === 'para' ? 'Both pairs of opposite sides have equal gradients, so both pairs are parallel: it is a parallelogram.' : `Only ${v(correct.slice(0, 2))} and ${v(correct.slice(-2))} have the same gradient, so they are the parallel sides (it is a trapezium).`,
    ],
    meta: { t: 'parallel', kind, P: Pp, Q, R, S },
  })
}

function collinear(): Question {
  const A: P = [int(-6, 2), int(-6, 4)]
  const run = int(1, 4)
  const rise = nonZero(-4, 4)
  const t = int(2, 3)
  const yes = chance()
  const B: P = [A[0] + run, A[1] + rise]
  const C: P = [A[0] + run * t, A[1] + rise * t + (yes ? 0 : pick([-1, 1]))]
  const g1 = fracS(rise, run)
  const g2 = fracS(C[1] - B[1], C[0] - B[0])
  return q({
    prompt: `Do the points ${named('A', A)}, ${named('B', B)} and ${named('C', C)} lie on the same straight line (are they collinear)?`,
    answer: mcFixedA(['Yes', 'No'], yes ? 'Yes' : 'No'),
    hint: `Compare the gradient of ${v('AB')} with the gradient of ${v('BC')}.`,
    steps: [`Gradient of ${v('AB')} = ${g1}`, `Gradient of ${v('BC')} = ${g2}`, yes ? 'The gradients are equal and the intervals share point B, so the points are collinear.' : 'The gradients are different, so the points are not collinear.'],
    meta: { t: 'collinear', A, B, C },
  })
}

export const ex1103 = (level: Level): Question => {
  if (level === 1) return chance(0.35) ? gradSign() : gradTriangle()
  if (level === 2) return pick([gradGrid, gradPoints, gradPoints, gradPairMC])()
  return pick([lineOnGrid, parallelSides, collinear])()
}

// ================================================================== 11.04 Graphing linear equations

function tableValue(): Question {
  const m = nonZero(-3, 3)
  const c = int(-5, 5)
  const xs = [-2, -1, 0, 1, 2]
  const ask = pick(xs)
  const y = m * ask + c
  return q({
    prompt: `Complete this table of values for ${lineEq(m, 1, c)}. What is the missing ${v('y')}-value?`,
    diagram: D.hTable([[v('x'), ...xs.map((x) => num(x))], [v('y'), ...xs.map((x) => (x === ask ? '?' : num(m * x + c)))]]),
    answer: numA(y),
    hint: `Substitute ${v('x')} = ${num(ask)} into the equation.`,
    steps: [`${v('y')} = ${num(m)} ${TIMES} ${bnum(ask)} ${c < 0 ? MINUS : '+'} ${num(Math.abs(c))} = ${num(y)}`],
    meta: { t: 'table', m, c, x: ask },
  })
}

/** a line in one of the textbook's forms, with its gradient and intercept */
function formLine(): { html: string; m: number; c: number; xi: number } {
  const kind = pick(['mx+c', 'mx+c', 'x+y', 'x-y'] as const)
  if (kind === 'x+y') {
    const k = nonZero(-8, 8)
    return { html: `${v('x')} + ${v('y')} = ${num(k)}`, m: -1, c: k, xi: k }
  }
  if (kind === 'x-y') {
    const k = nonZero(-8, 8)
    return { html: `${v('x')} ${MINUS} ${v('y')} = ${num(k)}`, m: 1, c: -k, xi: k }
  }
  const m = pick([-4, -3, -2, -1, 1, 2, 3, 4])
  const xi = nonZero(-5, 5)
  const c = -m * xi
  return { html: lineEq(m, 1, c), m, c, xi }
}

function intercepts(): Question {
  const l = formLine()
  const which = pick(['x', 'y'] as const)
  const ans = which === 'x' ? l.xi : l.c
  return q({
    prompt: `Find the ${v(which)}-intercept of the line ${l.html}.`,
    answer: numA(ans),
    hint: which === 'x' ? `The ${v('x')}-intercept is where ${v('y')} = 0. Substitute ${v('y')} = 0 and solve.` : `The ${v('y')}-intercept is where ${v('x')} = 0. Substitute ${v('x')} = 0.`,
    steps: which === 'x' ? [`Substitute ${v('y')} = 0 into ${l.html}.`, `Solving gives ${v('x')} = ${num(l.xi)}, so the ${v('x')}-intercept is ${num(l.xi)}.`] : [`Substitute ${v('x')} = 0 into ${l.html}.`, `This gives ${v('y')} = ${num(l.c)}, so the ${v('y')}-intercept is ${num(l.c)}.`],
    meta: { t: 'intercept', which, m: l.m, c: l.c },
  })
}

function xInterceptMC(): Question {
  const m = pick([-4, -3, -2, 2, 3, 4])
  const xi = nonZero(-4, 4)
  const c = -m * xi
  return q({
    prompt: `What is the ${v('x')}-intercept of the graph of ${v('y')} = ${num(c)} ${m < 0 ? MINUS : '+'} ${num(Math.abs(m))}${v('x')}?`,
    answer: mcA(num(xi), [num(c), num(-c), num(-xi), num(m)]),
    hint: `Put ${v('y')} = 0 and solve for ${v('x')}.`,
    steps: [`0 = ${num(c)} ${m < 0 ? MINUS : '+'} ${num(Math.abs(m))}${v('x')}`, `${v('x')} = ${num(xi)}`],
    meta: { t: 'intercept', which: 'x', m, c },
  })
}

/** an equation through (or just missing) the point p, in one of the textbook's forms, with LHS and RHS working */
function testForm(p: P, yes: boolean): { html: string; lhs: string; lhsVal: number; rhs: string; rhsVal: number } {
  const [x, y] = p
  const off = yes ? 0 : nonZero(-3, 3)
  const kind = pick(['mx+c', 'x-y', 'x+ay', 'x-ay'] as const)
  if (kind === 'mx+c') {
    const m = nonZero(-3, 3)
    const c = y - m * x + off
    return { html: lineEq(m, 1, c), lhs: num(y), lhsVal: y, rhs: `${num(m)} ${TIMES} ${bnum(x)} ${c < 0 ? MINUS : '+'} ${num(Math.abs(c))}`, rhsVal: m * x + c }
  }
  if (kind === 'x-y') {
    const k = x - y + off
    return { html: `${v('x')} ${MINUS} ${v('y')} = ${num(k)}`, lhs: `${num(x)} ${MINUS} ${bnum(y)}`, lhsVal: x - y, rhs: num(k), rhsVal: k }
  }
  const a = pick([2, 3])
  const sign = kind === 'x+ay' ? 1 : -1
  const k = x + sign * a * y + off
  return { html: `${v('x')} ${sign > 0 ? '+' : MINUS} ${a}${v('y')} = ${num(k)}`, lhs: `${num(x)} ${sign > 0 ? '+' : MINUS} ${a} ${TIMES} ${bnum(y)}`, lhsVal: x + sign * a * y, rhs: num(k), rhsVal: k }
}

function onLine(): Question {
  const p: P = [int(-5, 6), int(-6, 6)]
  const f = testForm(p, chance())
  const on = f.lhsVal === f.rhsVal
  return q({
    prompt: `Does the point ${pt(p[0], p[1])} lie on the line ${f.html}?`,
    answer: mcFixedA(['Yes', 'No'], on ? 'Yes' : 'No'),
    hint: 'Substitute the coordinates into both sides of the equation. If LHS = RHS, the point is on the line.',
    steps: [`LHS = ${f.lhs} = ${num(f.lhsVal)}`, `RHS = ${f.rhs} = ${num(f.rhsVal)}`, on ? 'LHS = RHS, so the point lies on the line.' : 'LHS ≠ RHS, so the point does not lie on the line.'],
    meta: { t: 'online', p, eq: f.html },
  })
}

function whichPointOn(): Question {
  const k = nonZero(-6, 6)
  const x = int(-4, 4)
  const right: P = [x, x - k] // x − y = k
  const wrong: P[] = []
  while (wrong.length < 3) {
    const w: P = [int(-4, 4), int(-6, 6)]
    if (w[0] - w[1] !== k && !wrong.some((o) => o[0] === w[0] && o[1] === w[1])) wrong.push(w)
  }
  return q({
    prompt: `Which of these points lies on the line ${v('x')} ${MINUS} ${v('y')} = ${num(k)}?`,
    answer: mcA(pt(right[0], right[1]), wrong.map((w) => pt(w[0], w[1]))),
    hint: `For each point, work out ${v('x')} ${MINUS} ${v('y')}. Which one gives ${num(k)}?`,
    steps: [`For ${pt(right[0], right[1])}: ${num(right[0])} ${MINUS} ${bnum(right[1])} = ${num(k)} ✓`],
    meta: { t: 'whichpoint', k, right },
  })
}

function hvGraph(): Question {
  // two vertical and two horizontal lines, labelled a to d
  const xs = sample([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5], 2)
  const ys = sample([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5], 2)
  const lines = shuffle([...xs.map((x) => ({ kind: 'x' as const, k: x })), ...ys.map((y) => ({ kind: 'y' as const, k: y }))])
  const labels = ['a', 'b', 'c', 'd']
  const ask = int(0, 3)
  const L = lines[ask]
  const opts = [`${v('x')} = ${num(L.k)}`, `${v('y')} = ${num(L.k)}`, `${v('x')} = ${num(-L.k)}`, `${v('y')} = ${num(-L.k)}`]
  return q({
    prompt: `What is the equation of line ${v(labels[ask])}?`,
    diagram: G.plane({
      xmin: -6,
      xmax: 6,
      ymin: -6,
      ymax: 6,
      vlines: lines.map((l, i) => (l.kind === 'x' ? { x: l.k, label: labels[i] } : null)).filter((x): x is { x: number; label: string } => !!x),
      lines: lines.map((l, i) => (l.kind === 'y' ? { m: 0, c: l.k, label: labels[i] } : null)).filter((x): x is { m: number; c: number; label: string } => !!x),
    }),
    answer: mcFixedA(opts, opts[L.kind === 'x' ? 0 : 1]),
    hint: 'A vertical line has every x-coordinate the same: x = a number. A horizontal line has every y-coordinate the same: y = a number.',
    steps: [L.kind === 'x' ? `Line ${v(labels[ask])} is vertical and crosses the ${v('x')}-axis at ${num(L.k)}, so its equation is ${v('x')} = ${num(L.k)}.` : `Line ${v(labels[ask])} is horizontal and crosses the ${v('y')}-axis at ${num(L.k)}, so its equation is ${v('y')} = ${num(L.k)}.`],
    meta: { t: 'hv', kind: L.kind, k: L.k },
  })
}

function describeLine(): Question {
  const k = int(1, 7)
  const a = nonZero(-6, 6)
  const b = nonZero(-6, 6)
  const items: [string, 'x' | 'y', number][] = [
    [`a horizontal line that crosses the ${v('y')}-axis at ${num(b)}`, 'y', b],
    [`a vertical line that goes through ${pt(a, b)}`, 'x', a],
    [`a line where every point is ${k} ${k === 1 ? 'unit' : 'units'} above the ${v('x')}-axis`, 'y', k],
    [`a line where every point is ${k} ${k === 1 ? 'unit' : 'units'} below the ${v('x')}-axis`, 'y', -k],
    [`a line where every point is ${k} ${k === 1 ? 'unit' : 'units'} to the left of the ${v('y')}-axis`, 'x', -k],
    [`a line where every point is ${k} ${k === 1 ? 'unit' : 'units'} to the right of the ${v('y')}-axis`, 'x', k],
    [`the line parallel to the ${v('x')}-axis that passes through ${pt(a, b)}`, 'y', b],
    [`a horizontal line that goes through ${pt(a, b)}`, 'y', b],
  ]
  const [desc, axis, val] = pick(items)
  return q({
    prompt: `Write the equation of ${desc}.`,
    answer: numA(val),
    prefix: `${v(axis)} =`,
    hint: axis === 'y' ? 'On a horizontal line, every point has the same y-coordinate.' : 'On a vertical line, every point has the same x-coordinate.',
    steps: [axis === 'y' ? `Every point has ${v('y')}-coordinate ${num(val)}, so the line is ${v('y')} = ${num(val)}.` : `Every point has ${v('x')}-coordinate ${num(val)}, so the line is ${v('x')} = ${num(val)}.`],
    meta: { t: 'describe', axis, val },
  })
}

function throughTwo(): Question {
  const a = nonZero(-6, 6)
  const b1 = intExceptLocal(-6, 8, a)
  let b2 = intExceptLocal(-6, 8, b1)
  if (b2 === a) b2 = b1 + 1 === a ? b1 + 2 : b1 + 1
  const vertical = chance()
  const P1: P = vertical ? [a, b1] : [b1, a]
  const P2: P = vertical ? [a, b2] : [b2, a]
  const xa = `${v('x')} = ${num(a)}`
  const ya = `${v('y')} = ${num(a)}`
  const correct = vertical ? xa : ya
  return q({
    prompt: `A line goes through the points ${pt(P1[0], P1[1])} and ${pt(P2[0], P2[1])}. What is its equation?`,
    answer: mcA(correct, [vertical ? ya : xa, `${v('x')} = ${num(b1)}`, `${v('y')} = ${num(b1)}`]),
    hint: 'Which coordinate is the same for both points?',
    steps: [vertical ? `Both points have ${v('x')}-coordinate ${num(a)}, so the line is vertical: ${v('x')} = ${num(a)}.` : `Both points have ${v('y')}-coordinate ${num(a)}, so the line is horizontal: ${v('y')} = ${num(a)}.`],
    meta: { t: 'through', P1, P2 },
  })
}
function intExceptLocal(lo: number, hi: number, not: number): number {
  for (;;) {
    const x = int(lo, hi)
    if (x !== not) return x
  }
}

function crossingPoint(): Question {
  const X = int(-4, 5)
  const Y = int(-8, 8)
  const m1 = nonZero(-3, 3)
  let m2 = nonZero(-3, 3)
  if (m2 === m1) m2 = m1 > 0 ? -m1 : m1 - 1 || 2
  const c1 = Y - m1 * X
  const c2 = Y - m2 * X
  const on1: P = [X + 1, Y + m1] // on the first line only
  const on2: P = [X - 1, Y - m2] // on the second line only
  const neither: P = [Y, X]
  const wrong = [on1, on2, neither].filter((p) => !(p[0] === X && p[1] === Y)).map((p) => pt(p[0], p[1]))
  return q({
    prompt: `The lines ${lineEq(m1, 1, c1)} and ${lineEq(m2, 1, c2)} cross at one of these points. Which one?`,
    answer: mcA(pt(X, Y), wrong),
    hint: 'The crossing point lies on both lines: substitute each point into both equations.',
    steps: [`At ${pt(X, Y)}: ${num(m1)} ${TIMES} ${bnum(X)} ${c1 < 0 ? MINUS : '+'} ${num(Math.abs(c1))} = ${num(Y)} ✓`, `and ${num(m2)} ${TIMES} ${bnum(X)} ${c2 < 0 ? MINUS : '+'} ${num(Math.abs(c2))} = ${num(Y)} ✓, so it lies on both lines.`],
    meta: { t: 'cross', m1, c1, m2, c2, X, Y },
  })
}

function rectangleArea(): Question {
  const [x1, x2] = sample([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6], 2).sort((a, b) => a - b)
  const [y1, y2] = sample([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6], 2).sort((a, b) => a - b)
  const area = (x2 - x1) * (y2 - y1)
  return q({
    prompt: `The lines ${v('x')} = ${num(x1)}, ${v('x')} = ${num(x2)}, ${v('y')} = ${num(y1)} and ${v('y')} = ${num(y2)} are graphed on the same number plane. What is the area of the rectangle they enclose?`,
    answer: numA(area),
    suffix: 'square units',
    hint: 'The width is the distance between the vertical lines; the height is the distance between the horizontal lines.',
    steps: [`Width = ${num(x2)} ${MINUS} ${bnum(x1)} = ${num(x2 - x1)}`, `Height = ${num(y2)} ${MINUS} ${bnum(y1)} = ${num(y2 - y1)}`, `Area = ${num(x2 - x1)} ${TIMES} ${num(y2 - y1)} = ${num(area)} square units`],
    meta: { t: 'rect', x1, x2, y1, y2 },
  })
}

function axisEquation(): Question {
  const which = pick(['x', 'y'] as const)
  const opts = [`${v('x')} = 0`, `${v('y')} = 0`, `${v('y')} = ${v('x')}`, `${v('x')} = 1`]
  return q({
    prompt: `What is the equation of the ${v(which)}-axis?`,
    answer: mcFixedA(opts, which === 'x' ? opts[1] : opts[0]),
    hint: `Every point on the ${v(which)}-axis has the same value of one coordinate. Which one is always 0?`,
    steps: [which === 'x' ? `Every point on the ${v('x')}-axis has ${v('y')}-coordinate 0, so its equation is ${v('y')} = 0.` : `Every point on the ${v('y')}-axis has ${v('x')}-coordinate 0, so its equation is ${v('x')} = 0.`],
    meta: { t: 'axis', which },
  })
}

export const ex1104 = (level: Level): Question => {
  if (level === 1) return chance(0.4) ? tableValue() : intercepts()
  if (level === 2) return pick([onLine, onLine, whichPointOn, hvGraph, xInterceptMC])()
  return pick([describeLine, throughTwo, crossingPoint, rectangleArea, axisEquation])()
}

// ================================================================== 11.05 The gradient–intercept equation y = mx + c

function readMC(level: 1 | 2): Question {
  const which = pick(['gradient', 'y-intercept'] as const)
  let html: string
  let mn: number
  let md = 1
  let cn: number
  let cd = 1
  const how: string[] = []
  if (level === 1) {
    mn = pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5])
    cn = chance(0.2) ? 0 : nonZero(-9, 11)
    html = lineEq(mn, 1, cn)
  } else {
    const kind = pick(['ax/b', 'x/b', 'c-mx', 'frac-x', 'const', 'x-p/q'] as const)
    if (kind === 'ax/b') {
      md = pick([2, 3, 4, 5])
      mn = pick([1, 2, 3, 5, 7].filter((a) => gcd(a, md) === 1 && a !== md))
      cn = nonZero(-9, 9)
      html = `${v('y')} = ${frac(`${mn === 1 ? '' : mn}${v('x')}`, md)} ${cn < 0 ? MINUS : '+'} ${num(Math.abs(cn))}`
      how.push(`${frac(`${mn === 1 ? '' : mn}${v('x')}`, md)} is the same as ${frac(mn, md)}${v('x')}.`)
    } else if (kind === 'x/b') {
      md = pick([2, 3, 4, 5])
      mn = 1
      cn = nonZero(-11, 9)
      html = `${v('y')} = ${frac(v('x'), md)} ${cn < 0 ? MINUS : '+'} ${num(Math.abs(cn))}`
      how.push(`${frac(v('x'), md)} is the same as ${frac(1, md)}${v('x')}.`)
    } else if (kind === 'c-mx') {
      const k = pick([1, 2, 3, 4, 5])
      mn = -k
      cn = nonZero(1, 11)
      html = `${v('y')} = ${num(cn)} ${MINUS} ${k === 1 ? '' : k}${v('x')}`
      how.push(`Rewrite it as ${lineEq(mn, 1, cn)}.`)
    } else if (kind === 'frac-x') {
      md = pick([3, 4, 5])
      mn = pick([-2, -1, 1, 2, 3, 4].filter((a) => gcd(Math.abs(a), md) === 1))
      cn = nonZero(-6, 8)
      html = lineEq(mn, md, cn)
    } else if (kind === 'const') {
      mn = 0
      cn = nonZero(-9, 9)
      html = `${v('y')} = ${num(cn)}`
      how.push(`There is no ${v('x')}-term, so the gradient is 0: it is a horizontal line.`)
    } else {
      mn = 1
      cd = 2
      cn = -pick([1, 3, 5, 7, 9])
      html = `${v('y')} = ${v('x')} ${MINUS} ${frac(-cn, cd)}`
    }
  }
  const [n, d] = which === 'gradient' ? [mn, md] : [cn, cd]
  return q({
    prompt: `What is the ${which === 'gradient' ? 'gradient' : `${v('y')}-intercept`} of the line ${html}?`,
    answer: d === 1 ? numA(n) : fracA(n, d, { allowDecimal: true }),
    hint: `In ${v('y')} = ${v('m')}${v('x')} + ${v('c')}, ${v('m')} is the gradient and ${v('c')} is the ${v('y')}-intercept.`,
    steps: [...how, `${v('m')} = ${fracS(mn, md)} and ${v('c')} = ${fracS(cn, cd)}, so the ${which === 'gradient' ? 'gradient' : `${v('y')}-intercept`} is ${fracS(n, d)}.`],
    meta: { t: 'read', which, mn, md, cn, cd },
  })
}

function whichEquationMC(): Question {
  const k = pick([2, 3, 4, 5, 6, 7])
  const want = pick(['gradient', 'y-intercept'] as const)
  if (want === 'gradient') {
    const opts = [`${v('y')} = ${v('x')} + ${k}`, `${v('y')} = ${k} ${MINUS} ${v('x')}`, `${v('y')} = ${k}`, `${v('y')} = ${k}${v('x')}`]
    return q({
      prompt: `Which equation has a gradient of ${k}?`,
      answer: mcA(opts[3], opts.slice(0, 3)),
      hint: `The gradient is the number multiplying ${v('x')}.`,
      steps: [`In ${v('y')} = ${k}${v('x')}, the number multiplying ${v('x')} is ${k}.`],
      meta: { t: 'which-m', k },
    })
  }
  const opts = [`${v('y')} = ${k} ${MINUS} ${v('x')}`, `${v('y')} = ${k} + ${v('x')}`, `${v('y')} = ${v('x')} ${MINUS} ${k}`, `${v('y')} = ${MINUS}${k}${v('x')}`]
  return q({
    prompt: `Which equation has a ${v('y')}-intercept of ${MINUS}${k}?`,
    answer: mcA(opts[2], [opts[0], opts[1], opts[3]]),
    hint: `The ${v('y')}-intercept is the number added on (with its sign).`,
    steps: [`${v('y')} = ${v('x')} ${MINUS} ${k} has ${v('c')} = ${MINUS}${k}.`],
    meta: { t: 'which-c', k },
  })
}

function writeEquation(): Question {
  const frac1 = chance(0.4)
  const md = frac1 ? pick([2, 3, 4, 5]) : 1
  const mn = frac1 ? pick([-3, -2, -1, 1, 2, 3].filter((a) => gcd(Math.abs(a), md) === 1)) : nonZero(-6, 6)
  const c = nonZero(-8, 8)
  return q({
    prompt: `Write the equation of the line with a gradient of ${fracS(mn, md)} and a ${v('y')}-intercept of ${num(c)}.`,
    answer: exprA(lineExpr(mn, md, c)),
    prefix: `${v('y')} =`,
    hint: `Substitute ${v('m')} and ${v('c')} into ${v('y')} = ${v('m')}${v('x')} + ${v('c')}.${md > 1 ? ' Type a fraction gradient like 2x/3 or (2/3)x.' : ''}`,
    steps: [`${v('m')} = ${fracS(mn, md)}, ${v('c')} = ${num(c)}`, `${lineEq(mn, md, c)}`],
    meta: { t: 'write', mn, md, c },
  })
}

function steeper(): Question {
  const pairs: [number, number][] = []
  const a = nonZero(-6, 6)
  let b = nonZero(-6, 6)
  if (chance(0.2)) b = -a
  else while (Math.abs(b) === Math.abs(a)) b = nonZero(-6, 6)
  pairs.push([a, nonZero(-8, 8)], [b, nonZero(-8, 8)])
  const e1 = lineEq(pairs[0][0], 1, pairs[0][1])
  const e2 = lineEq(pairs[1][0], 1, pairs[1][1])
  const correct = Math.abs(a) === Math.abs(b) ? 'They are equally steep' : Math.abs(a) > Math.abs(b) ? e1 : e2
  return q({
    prompt: `Which line is steeper?`,
    answer: mcFixedA([e1, e2, 'They are equally steep'], correct),
    hint: 'Compare the sizes of the gradients and ignore the signs: a larger number means a steeper line.',
    steps: [`The gradients are ${num(a)} and ${num(b)}.`, Math.abs(a) === Math.abs(b) ? 'They have the same size, so the lines are equally steep (one goes up, the other goes down).' : `${num(Math.max(Math.abs(a), Math.abs(b)))} is larger than ${num(Math.min(Math.abs(a), Math.abs(b)))}, so ${correct} is steeper.`],
    meta: { t: 'steeper', a, b },
  })
}

function matchSketch(): Question {
  const m = pick([-3, -2, -1, 1, 2, 3])
  const xi = nonZero(-3, 3)
  const c = -m * xi
  const opts = [lineEq(m, 1, c), lineEq(-m, 1, c), lineEq(m, 1, -c), lineEq(c, 1, m)]
  return q({
    prompt: 'Which equation matches this graph?',
    diagram: G.sketch({ kind: 'line', m, c }),
    answer: mcA(opts[0], opts.slice(1)),
    hint: 'Read the y-intercept, then decide whether the line goes up or down from left to right. Check the x-intercept too.',
    steps: [`The ${v('y')}-intercept is ${num(c)} and the ${v('x')}-intercept is ${num(xi)}.`, `Gradient = rise ÷ run = ${frac(num(-c), num(xi))} = ${num(m)}`, `So the equation is ${opts[0]}.`],
    note: 'Sketch: not drawn to scale.',
    meta: { t: 'match-line', m, c },
  })
}

function stepFromIntercept(): Question {
  const md = pick([1, 2, 3, 4])
  const mn = pick([-3, -2, -1, 1, 2, 3].filter((a) => gcd(Math.abs(a), md) === 1))
  const c = nonZero(-5, 5)
  const target: P = [md, c + mn]
  return q({
    prompt: `To graph ${lineEq(mn, md, c)}, start at the ${v('y')}-intercept and use the gradient to find a second point: move ${md} ${md === 1 ? 'unit' : 'units'} right, then ${Math.abs(mn)} ${Math.abs(mn) === 1 ? 'unit' : 'units'} ${mn > 0 ? 'up' : 'down'}. Which point do you reach?`,
    answer: pointA(target[0], target[1]),
    hint: `The ${v('y')}-intercept is the point (0, ${num(c)}).`,
    steps: [`Start at (0, ${num(c)}).`, `Right ${md}: ${v('x')} = ${md}. ${mn > 0 ? 'Up' : 'Down'} ${Math.abs(mn)}: ${v('y')} = ${num(c)} ${mn > 0 ? '+' : MINUS} ${Math.abs(mn)} = ${num(c + mn)}.`, `The point is ${pt(target[0], target[1])}.`],
    meta: { t: 'step', mn, md, c },
  })
}

export const ex1105 = (level: Level): Question => {
  if (level === 1) return chance(0.75) ? readMC(1) : whichEquationMC()
  if (level === 2) return pick([() => readMC(2), () => readMC(2), writeEquation, steeper])()
  return pick([matchSketch, stepFromIntercept, writeEquation])()
}

// ================================================================== 11.06 Finding the equation of a line

function equationFromGrid(): Question {
  const m = pick([-3, -2, -1, 1, 2, 3])
  const c = int(-4, 4)
  const x1 = pick([1, 2])
  const a: P = [0, c]
  const b: P = [x1, c + m * x1]
  return q({
    prompt: 'Find the equation of this line.',
    diagram: G.plane({ xmin: -5, xmax: 5, ymin: -6, ymax: 6, lines: [{ m, c }], points: [{ x: a[0], y: a[1] }, { x: b[0], y: b[1] }] }),
    answer: exprA(lineExpr(m, 1, c)),
    prefix: `${v('y')} =`,
    hint: 'Read the y-intercept. Then find the gradient from the two marked points: rise ÷ run.',
    steps: [`Between the marked points: run = ${x1}, rise = ${num(m * x1)}, so the gradient is ${num(m * x1)} ${DIVIDE} ${x1} = ${num(m)}.`, `${v('y')}-intercept ${v('c')} = ${num(c)}`, `The equation is ${lineEq(m, 1, c)}.`],
    meta: { t: 'eq', mn: m, md: 1, c },
  })
}

function equationFromSketch(level: 2 | 3): Question {
  const kind = level === 2 ? pick(['point', 'intercepts'] as const) : pick(['intercepts-frac', 'match'] as const)
  if (kind === 'match') {
    const m = pick([-1, 1])
    const c = pick([-1, 1])
    const opts = [lineEq(m, 1, c), lineEq(-m, 1, c), lineEq(m, 1, -c), lineEq(-m, 1, -c)]
    return q({
      prompt: 'Which equation matches this graph?',
      diagram: G.sketch({ kind: 'line', m, c }),
      answer: mcFixedA([lineEq(1, 1, -1), lineEq(1, 1, 1), lineEq(-1, 1, -1), lineEq(-1, 1, 1)], opts[0]),
      hint: 'Is the gradient positive or negative? Where does the line cross the y-axis?',
      steps: [`The line goes ${m > 0 ? 'up' : 'down'} from left to right, so the gradient is ${num(m)}. It crosses the ${v('y')}-axis at ${num(c)}.`, `So the equation is ${opts[0]}.`],
      note: 'Sketch: not drawn to scale.',
      meta: { t: 'eq-mc', mn: m, md: 1, c },
    })
  }
  let mn: number
  let md: number
  let c: number
  let diagram: string
  let how: string
  if (kind === 'point') {
    c = int(-4, 5)
    const px = pick([-4, -3, -2, 2, 3, 4, 5])
    const rise = nonZero(-6, 6)
    mn = rise
    md = px
    if (md < 0) {
      mn = -mn
      md = -md
    }
    const g = gcd(Math.abs(mn), md)
    mn /= g
    md /= g
    diagram = G.sketch({ kind: 'line', m: rise / px, c, showX: false, point: [px, c + rise] })
    how = `Between (0, ${num(c)}) and ${pt(px, c + rise)}: rise = ${num(rise)}, run = ${num(px)}, so ${v('m')} = ${fracS(rise, px)}.`
  } else {
    // both intercepts shown
    let xi: number
    if (kind === 'intercepts') {
      xi = nonZero(-6, 6)
      c = nonZero(-6, 6)
    } else {
      const pairs: [number, number][] = [[1.5, -3], [-1.5, 3], [2.5, 5], [-2.5, -5], [-5, 2], [5, -2], [3, 2], [-3, -2], [4, -6], [-4, 6]]
      ;[xi, c] = pick(pairs)
    }
    // gradient = −c / xi, as a fraction
    const twice = Number.isInteger(xi) ? 1 : 2
    mn = -c * twice
    md = xi * twice
    if (md < 0) {
      mn = -mn
      md = -md
    }
    const g = gcd(Math.abs(mn), md)
    mn /= g
    md /= g
    diagram = G.sketch({ kind: 'line', m: -c / xi, c })
    how = `The line goes from (${num(xi)}, 0) to (0, ${num(c)}): rise = ${num(c)}, run = ${num(-xi)}, so ${v('m')} = ${fracS(mn, md)}.`
  }
  return q({
    prompt: 'Find the equation of this line.',
    diagram,
    answer: exprA(lineExpr(mn, md, c)),
    prefix: `${v('y')} =`,
    hint: `Use the ${v('y')}-intercept for ${v('c')}, and two points on the line for the gradient. Type a fraction gradient like 2x/3 or (2/3)x.`,
    steps: [how, `${v('c')} = ${num(c)}`, `The equation is ${lineEq(mn, md, c)}.`],
    note: 'Sketch: not drawn to scale.',
    meta: { t: 'eq', mn, md, c },
  })
}

export const ex1106 = (level: Level): Question => (level === 1 ? equationFromGrid() : equationFromSketch(level === 2 ? 2 : 3))

// ================================================================== 11.07 Solving linear equations graphically

function solveGraph(level: Level): Question {
  const md = level === 3 ? 2 : 1
  const mn = level === 1 ? pick([1, 2, 3]) : level === 2 ? pick([-3, -2, -1, 1, 2]) : pick([-1, 1])
  const c = int(-4, 4)
  const x0 = level === 3 ? pick([-6, -4, -2, 2, 4, 6]) : int(-3, 4)
  const k = (mn * x0) / md + c
  if (Math.abs(k) > 9 || (x0 === 0 && level > 1)) return solveGraph(level)
  const lhs = lineEq(mn, md, c).replace(`${v('y')} = `, '')
  const box = fit([[0, c], [x0, k]], 2, 8)
  return q({
    prompt: `Use the graph of ${lineEq(mn, md, c)} to solve ${lhs} = ${num(k)}.`,
    diagram: G.plane({ ...box, lines: [{ m: mn / md, c, label: lineLabel(mn, md, c) }], guides: level === 1 ? [{ y: k }] : [] }),
    answer: numA(x0),
    prefix: `${v('x')} =`,
    hint: `Find where the line has a ${v('y')}-value of ${num(k)}. Read the ${v('x')}-coordinate of that point.`,
    steps: [
      `Draw a horizontal line at ${v('y')} = ${num(k)}. It meets the graph at ${pt(x0, k)}.`,
      `So ${v('x')} = ${num(x0)}.`,
      `Check: ${md === 1 ? num(mn) : fracS(mn, md)} ${TIMES} ${bnum(x0)}${c === 0 ? '' : ` ${c < 0 ? MINUS : '+'} ${num(Math.abs(c))}`} = ${num(k)} ✓`,
    ],
    meta: { t: 'solve', mn, md, c, k },
  })
}

function meetHorizontal(): Question {
  const m = pick([-3, -2, -1, 1, 2, 3])
  const x0 = int(-4, 4)
  const k = int(-5, 6)
  const c = k - m * x0
  return q({
    prompt: `At which point do the lines ${lineEq(m, 1, c)} and ${v('y')} = ${num(k)} cross?`,
    answer: pointA(x0, k),
    hint: `On the line ${v('y')} = ${num(k)}, every point has ${v('y')} = ${num(k)}. Solve ${lineEq(m, 1, c).replace(`${v('y')} = `, '')} = ${num(k)}.`,
    steps: [`${lineEq(m, 1, c).replace(`${v('y')} = `, '')} = ${num(k)}`, `${v('x')} = ${num(x0)}`, `The lines cross at ${pt(x0, k)}.`],
    meta: { t: 'meet-h', m, c, k },
  })
}

export const ex1107 = (level: Level): Question => (level === 2 && chance(0.35) ? meetHorizontal() : solveGraph(level))

// ================================================================== 11.08 Applying linear equations

const RATES = [16, 17.5, 18, 20, 24, 25, 30]
function niceTop(v0: number, step: number) {
  return Math.ceil(v0 / step) * step
}

function payGraph(): Question {
  const r = pick(RATES)
  const who = pick(['Mia', 'Liam', 'Ava', 'Noah', 'Isla', 'Arjun', 'Mei', 'Jarrah', 'Sienna', 'Kai'])
  const ystep = r <= 20 ? 20 : r === 24 ? 40 : 50
  const ymax = niceTop(r * 10, ystep)
  // hours where the pay sits exactly on a grid line (every half step), so it can be read
  const readable = [2, 3, 4, 5, 6, 7, 8].filter((t) => Number.isInteger((r * t) / (ystep / 2)))
  const t = pick(readable)
  const ask = pick(['gradient', 'read', 'equation'] as const)
  const graph = G.lineGraph({ xmax: 10, xstep: 1, xlabel: 'Time, t (hours)', ymax, ystep, ylabel: 'Pay, P ($)', minor: 2, series: [{ pts: [[0, 0], [10, r * 10]] }], marks: ask === 'gradient' ? [[t, r * t]] : [] })
  if (ask === 'gradient')
    return q({
      prompt: `The graph shows ${who}’s pay for different numbers of hours worked. What is the gradient of the line? (It is ${who}’s rate of pay in dollars per hour.)`,
      diagram: graph,
      answer: numA(r),
      prefix: '$',
      suffix: 'per hour',
      hint: `Use the marked point: gradient = pay ÷ hours.`,
      steps: [`The marked point is (${t}, ${num(r * t)}).`, `Gradient = ${frac(num(r * t), t)} = ${num(r)}, so the pay is ${dollars(r)} per hour.`],
      meta: { t: 'apply', kind: 'rate', r },
    })
  if (ask === 'read')
    return q({
      prompt: `The graph shows ${who}’s pay for different numbers of hours worked. Use the graph to find ${who}’s pay for ${t} hours.`,
      diagram: G.lineGraph({ xmax: 10, xstep: 1, xlabel: 'Time, t (hours)', ymax, ystep, ylabel: 'Pay, P ($)', minor: 2, series: [{ pts: [[0, 0], [10, r * 10]] }] }),
      answer: numA(r * t),
      prefix: '$',
      hint: `Go up from ${t} hours to the line, then across to the Pay axis.`,
      steps: [`From ${v('t')} = ${t}, go up to the line and across: ${v('P')} = ${num(r * t)}.`, `${who} earns ${dollars(r * t)} for ${t} hours.`],
      meta: { t: 'apply', kind: 'pay', r, x: t },
    })
  const hours = pick([3.5, 4.5, 7.5, 12, 15, 21, 2.5])
  return q({
    prompt: `${who} is paid ${dollars(r)} per hour, so the pay is ${v('P')} = ${num(r)}${v('t')}, where ${v('t')} is the number of hours worked. Use the equation to find the pay for ${num(hours)} hours.`,
    answer: numA(round(r * hours, 2)),
    prefix: '$',
    calc: true,
    hint: `Substitute ${v('t')} = ${num(hours)}.`,
    steps: [`${v('P')} = ${num(r)} ${TIMES} ${num(hours)} = ${num(round(r * hours, 2))}`, `The pay is ${dollars(r * hours)}.`],
    meta: { t: 'apply', kind: 'pay', r, x: hours },
  })
}

function fixedPlusRate(level: Level): Question {
  const ctx = pick([
    { who: 'A taxi', fixedWord: 'flagfall', fixed: pick([2.9, 3.5, 3.6, 4.2]), rate: pick([1.8, 2.1, 2.25, 2.4]), per: 'kilometre', unit: 'km', x: 'distance' },
    { who: 'A ride-share service', fixedWord: 'booking fee', fixed: pick([2.5, 3, 3.5]), rate: pick([1.5, 1.75, 2, 2.2]), per: 'kilometre', unit: 'km', x: 'distance' },
    { who: 'An electrician', fixedWord: 'call-out fee', fixed: pick([80, 90, 110, 120]), rate: pick([60, 70, 80, 95]), per: 'hour', unit: 'hours', x: 'time' },
    { who: 'A plumber', fixedWord: 'call-out fee', fixed: pick([75, 95, 125]), rate: pick([65, 85, 90]), per: 'hour', unit: 'hours', x: 'time' },
  ])
  const intro = `${ctx.who} charges a ${ctx.fixedWord} of ${dollars(ctx.fixed)} plus ${dollars(ctx.rate)} per ${ctx.per}, so the cost is ${v('C')} = ${num(ctx.rate)}${v('x')} + ${num(ctx.fixed)}, where ${v('x')} is the ${ctx.x} in ${ctx.unit}.`
  if (level === 3) {
    const x = ctx.unit === 'km' ? int(4, 40) : pick([1.5, 2, 2.5, 3, 3.25, 4, 4.5, 5, 6.25])
    const cost = round(ctx.rate * x + ctx.fixed, 2)
    return q({
      prompt: `${intro} The cost was ${money(cost)}. How many ${ctx.unit === 'km' ? 'kilometres was the trip' : 'hours did the job take'}?`,
      answer: numA(x),
      suffix: ctx.unit,
      calc: true,
      hint: `Solve ${num(ctx.rate)}${v('x')} + ${num(ctx.fixed)} = ${num(cost)}: subtract the ${ctx.fixedWord} first, then divide by the rate.`,
      steps: [`${num(ctx.rate)}${v('x')} = ${num(cost)} ${MINUS} ${num(ctx.fixed)} = ${num(round(cost - ctx.fixed, 2))}`, `${v('x')} = ${num(round(cost - ctx.fixed, 2))} ${DIVIDE} ${num(ctx.rate)} = ${num(x)} ${ctx.unit}`],
      meta: { t: 'apply', kind: 'inverse', rate: ctx.rate, fixed: ctx.fixed, cost },
    })
  }
  const x = ctx.unit === 'km' ? int(3, 60) : pick([1, 2, 3, 1.5, 2.5, 3.5, 5.25])
  const cost = ctx.rate * x + ctx.fixed
  if (level === 2 && chance(0.35))
    return q({
      prompt: `${intro} What does the vertical intercept of the graph of this equation represent?`,
      answer: mcA(`the ${ctx.fixedWord} of ${dollars(ctx.fixed)}`, [`the cost per ${ctx.per}`, `the total cost of a long ${ctx.unit === 'km' ? 'trip' : 'job'}`, `the ${ctx.x} when the cost is $0`]),
      hint: `The vertical intercept is the cost when ${v('x')} = 0.`,
      steps: [`When ${v('x')} = 0, ${v('C')} = ${num(ctx.fixed)}: the ${ctx.fixedWord}, paid before any ${ctx.unit === 'km' ? 'travelling' : 'work'} starts.`],
      meta: { t: 'apply', kind: 'meaning' },
    })
  return q({
    prompt: `${intro} Find the cost for ${num(x)} ${x === 1 && ctx.unit === 'hours' ? 'hour' : ctx.unit}.`,
    answer: numA(round(cost, 2)),
    prefix: '$',
    calc: true,
    hint: `Substitute ${v('x')} = ${num(x)} into the equation.`,
    steps: [`${v('C')} = ${num(ctx.rate)} ${TIMES} ${num(x)} + ${num(ctx.fixed)} = ${num(round(cost, 2))}`, `The cost is ${dollars(cost)}.`],
    meta: { t: 'apply', kind: 'forward', rate: ctx.rate, fixed: ctx.fixed, x },
  })
}

function depreciation(): Question {
  const V0 = pick([1200, 1500, 1800, 2400, 3000, 3600, 4000])
  const life = pick([4, 5, 6, 8].filter((n) => V0 % n === 0 && (V0 / n) % 50 === 0))
  const d = V0 / life
  const item = pick(['laptop', 'photocopier', 'TV', 'phone', 'ride-on mower'])
  const ystep = V0 <= 1800 ? 200 : 500
  const ask = pick(['gradient', 'value', 'intercept'] as const)
  const graph = G.lineGraph({ xmax: life, xstep: 1, xlabel: 'Years, n', ymax: niceTop(V0, ystep), ystep, ylabel: 'Value, V ($)', minor: 2, series: [{ pts: [[0, V0], [life, 0]] }] })
  if (ask === 'gradient')
    return q({
      prompt: `The graph shows the value of a ${item} that loses the same amount of value each year. What is the gradient of the line?`,
      diagram: graph,
      answer: numA(-d),
      hint: 'Use the two intercepts: gradient = rise ÷ run. The line goes down, so the gradient is negative.',
      steps: [`The line goes from (0, ${num(V0)}) to (${life}, 0).`, `Gradient = ${frac(num(-V0), life)} = ${num(-d)}: the ${item} loses ${dollars(d)} each year.`],
      meta: { t: 'apply', kind: 'dep-grad', V0, life },
    })
  if (ask === 'intercept')
    return q({
      prompt: `The graph shows the value of a ${item} over time. What is the vertical intercept, and what does it represent?`,
      diagram: graph,
      answer: mcA(`${dollars(V0)}: the value when it was bought`, [`${dollars(d)}: the loss in value each year`, `${life}: the number of years until it is worth $0`, `${dollars(V0 / 2)}: its value halfway through`]),
      hint: 'The vertical intercept is the value when n = 0.',
      steps: [`When ${v('n')} = 0, ${v('V')} = ${num(V0)}: the value when the ${item} was new.`],
      meta: { t: 'apply', kind: 'dep-int', V0 },
    })
  const n = pick([1.5, 2.5, 3, 3.5, 2, 1].filter((x) => x < life))
  return q({
    prompt: `A ${item} is worth ${v('V')} = ${MINUS}${num(d)}${v('n')} + ${num(V0)} dollars after ${v('n')} years. What is it worth after ${num(n)} ${n === 1 ? 'year' : 'years'}?`,
    answer: numA(V0 - d * n),
    prefix: '$',
    hint: `Substitute ${v('n')} = ${num(n)}.`,
    steps: [`${v('V')} = ${MINUS}${num(d)} ${TIMES} ${num(n)} + ${num(V0)} = ${num(V0 - d * n)}`, `It is worth ${dollars(V0 - d * n)}.`],
    meta: { t: 'apply', kind: 'dep-value', V0, d, n },
  })
}

function inverseProblems(): Question {
  const kind = pick(['savings', 'temperature', 'tank', 'sausage'] as const)
  if (kind === 'savings') {
    const start = pick([80, 100, 120, 150, 200])
    const w = pick([10, 12, 15, 20, 25])
    const weeks = int(6, 30)
    const target = start + w * weeks
    return q({
      prompt: `${pick(['Zara', 'Leo', 'Ruby', 'Hugo', 'Layla'])} has saved $${start} and adds $${w} each week, so the savings after ${v('w')} weeks are ${v('S')} = ${w}${v('w')} + ${start}. After how many weeks will the savings reach $${num(target)}?`,
      answer: numA(weeks),
      suffix: 'weeks',
      hint: `Solve ${w}${v('w')} + ${start} = ${num(target)}.`,
      steps: [`${w}${v('w')} = ${num(target)} ${MINUS} ${start} = ${num(target - start)}`, `${v('w')} = ${num(target - start)} ${DIVIDE} ${w} = ${weeks}`],
      meta: { t: 'apply', kind: 'inverse', rate: w, fixed: start, cost: target },
    })
  }
  if (kind === 'temperature') {
    const C = pick([-10, -5, 5, 10, 15, 20, 25, 30, 35, 40])
    const F = 1.8 * C + 32
    const toF = chance()
    return q({
      prompt: toF
        ? `Temperatures in degrees Celsius (°C) can be converted to degrees Fahrenheit (°F) with ${v('F')} = 1.8${v('C')} + 32. Convert ${num(C)}°C to °F.`
        : `Temperatures can be converted with ${v('F')} = 1.8${v('C')} + 32. What temperature in °C is ${num(F)}°F?`,
      answer: numA(toF ? F : C),
      suffix: toF ? '°F' : '°C',
      calc: true,
      hint: toF ? `Substitute ${v('C')} = ${num(C)}.` : `Solve 1.8${v('C')} + 32 = ${num(F)}: subtract 32, then divide by 1.8.`,
      steps: toF ? [`${v('F')} = 1.8 ${TIMES} ${bnum(C)} + 32 = ${num(F)}`] : [`1.8${v('C')} = ${num(F)} ${MINUS} 32 = ${num(F - 32)}`, `${v('C')} = ${num(F - 32)} ${DIVIDE} 1.8 = ${num(C)}`],
      meta: { t: 'apply', kind: toF ? 'temp-f' : 'temp-c', C },
    })
  }
  if (kind === 'tank') {
    const W0 = pick([1200, 1800, 2400, 3000, 3600])
    const r = pick([20, 30, 40, 60, 80].filter((x) => W0 % x === 0))
    return q({
      prompt: `A leaking tank holds ${v('W')} = ${num(W0)} ${MINUS} ${r}${v('t')} litres of water after ${v('t')} hours. After how many hours will the tank be empty?`,
      answer: numA(W0 / r),
      suffix: 'hours',
      hint: `The tank is empty when ${v('W')} = 0.`,
      steps: [`0 = ${num(W0)} ${MINUS} ${r}${v('t')}`, `${r}${v('t')} = ${num(W0)}, so ${v('t')} = ${num(W0)} ${DIVIDE} ${r} = ${num(W0 / r)} hours`],
      meta: { t: 'apply', kind: 'inverse', rate: -r, fixed: W0, cost: 0 },
    })
  }
  const fixed = pick([30, 45, 60, 75])
  const each = pick([0.8, 1.2, 1.5, 0.75])
  const n = pick([40, 60, 80, 100, 120, 150, 200, 250])
  const budget = round(fixed + each * n, 2)
  return q({
    prompt: `For a school fundraiser, the cost of making ${v('x')} sausage sandwiches is ${v('C')} = ${num(each)}${v('x')} + ${fixed} dollars. How many sandwiches can be made for ${money(budget)}?`,
    answer: numA(n),
    suffix: 'sandwiches',
    calc: true,
    hint: `Solve ${num(each)}${v('x')} + ${fixed} = ${num(budget)}.`,
    steps: [`${num(each)}${v('x')} = ${num(budget)} ${MINUS} ${fixed} = ${num(round(budget - fixed, 2))}`, `${v('x')} = ${num(round(budget - fixed, 2))} ${DIVIDE} ${num(each)} = ${n}`],
    meta: { t: 'apply', kind: 'inverse', rate: each, fixed, cost: budget },
  })
}

export const ex1108 = (level: Level): Question => {
  if (level === 1) return chance(0.6) ? payGraph() : fixedPlusRate(1)
  if (level === 2) return pick([depreciation, depreciation, () => fixedPlusRate(2)])()
  return chance(0.5) ? fixedPlusRate(3) : inverseProblems()
}

// ================================================================== 11.09 Direct variation (Path)

const VARY = [
  { y: 'S', x: 'M', ctx: 'The stretch, S cm, of a spring is directly proportional to the mass, M kg, hanging from it.', yu: 'cm', xu: 'kg', ks: [0.5, 0.625, 0.75, 1.25, 1.5, 2.5] },
  { y: 'M', x: 'V', ctx: 'The mass, M grams, of a metal is directly proportional to its volume, V cm³.', yu: 'g', xu: 'cm³', ks: [2.7, 7.9, 8.9, 11.3, 1.75] },
  { y: 'D', x: 't', ctx: 'The distance, D km, a cyclist travels at a steady speed varies directly as the time, t hours.', yu: 'km', xu: 'hours', ks: [18, 22, 24, 27.5, 30] },
  { y: 'V', x: 't', ctx: 'The volume, V litres, of water in a tank being filled is directly proportional to the time, t minutes.', yu: 'L', xu: 'minutes', ks: [40, 45, 60, 75, 80] },
  { y: 'I', x: 'D', ctx: 'The interest, I dollars, earned in one year varies directly as the amount deposited, D dollars.', yu: 'dollars', xu: 'dollars', ks: [0.025, 0.03, 0.04, 0.045, 0.05] },
]

function findK(): Question {
  const c = pick(VARY)
  const k = pick(c.ks)
  const x1 = pick(c.y === 'I' ? [800, 1200, 1600, 2000, 2500] : [2, 4, 5, 8, 10, 12, 16, 20])
  const y1 = round(k * x1, 4)
  if (chance(0.3)) {
    const opts = [num(k), num(round(x1 * y1, 4)), num(round(y1 - x1, 4)), num(round(x1 / y1, 4))]
    return q({
      prompt: `${v(c.y)} varies directly as ${v(c.x)}, so ${v(c.y)} = ${v('k')}${v(c.x)}. When ${v(c.x)} = ${num(x1)}, ${v(c.y)} = ${num(y1)}. What is the value of ${v('k')}?`,
      answer: mcA(opts[0], opts.slice(1)),
      calc: true,
      hint: `Substitute both values into ${v(c.y)} = ${v('k')}${v(c.x)}, then divide.`,
      steps: [`${num(y1)} = ${v('k')} ${TIMES} ${num(x1)}`, `${v('k')} = ${num(y1)} ${DIVIDE} ${num(x1)} = ${num(k)}`],
      meta: { t: 'vary-k', x1, y1 },
    })
  }
  return q({
    prompt: `${c.ctx} When ${v(c.x)} = ${num(x1)}, ${v(c.y)} = ${num(y1)}. Find the constant of variation, ${v('k')}, in ${v(c.y)} = ${v('k')}${v(c.x)}.`,
    answer: numA(k),
    prefix: `${v('k')} =`,
    calc: true,
    hint: `${v('k')} = ${v(c.y)} ÷ ${v(c.x)}`,
    steps: [`${num(y1)} = ${v('k')} ${TIMES} ${num(x1)}`, `${v('k')} = ${num(y1)} ${DIVIDE} ${num(x1)} = ${num(k)}`],
    meta: { t: 'vary-k', x1, y1 },
  })
}

function useVariation(reverse: boolean): Question {
  const c = pick(VARY)
  const k = pick(c.ks)
  const x1 = pick(c.y === 'I' ? [800, 1200, 1600, 2000, 2500] : [2, 4, 5, 8, 10, 12, 16, 20])
  const y1 = round(k * x1, 4)
  const x2 = pick(c.y === 'I' ? [500, 1500, 3000, 4500] : [3, 6, 7, 9, 14, 15, 18, 25, 30].filter((x) => x !== x1))
  const y2 = round(k * x2, 4)
  const rounded = Math.abs(round(y2, 2) - y2) > 1e-9
  return q({
    prompt: reverse
      ? `${c.ctx} When ${v(c.x)} = ${num(x1)}, ${v(c.y)} = ${num(y1)}. Find ${v(c.x)} when ${v(c.y)} = ${num(y2)}.`
      : `${c.ctx} When ${v(c.x)} = ${num(x1)}, ${v(c.y)} = ${num(y1)}. Find ${v(c.y)} when ${v(c.x)} = ${num(x2)}${rounded ? ', correct to two decimal places' : ''}.`,
    answer: reverse ? numA(x2) : rounded ? numA(y2, 2) : numA(y2),
    prefix: reverse ? `${v(c.x)} =` : `${v(c.y)} =`,
    suffix: reverse ? c.xu : c.yu,
    calc: true,
    hint: `First find ${v('k')} from the values you are given. Then use ${v(c.y)} = ${v('k')}${v(c.x)}.`,
    steps: [
      `${v('k')} = ${num(y1)} ${DIVIDE} ${num(x1)} = ${num(k)}, so ${v(c.y)} = ${num(k)}${v(c.x)}.`,
      reverse ? `${num(y2)} = ${num(k)}${v(c.x)}, so ${v(c.x)} = ${num(y2)} ${DIVIDE} ${num(k)} = ${num(x2)}` : `${v(c.y)} = ${num(k)} ${TIMES} ${num(x2)} = ${num(y2)}`,
    ],
    meta: { t: reverse ? 'vary-x' : 'vary-y', x1, y1, x2, y2 },
  })
}

function variationProblem(): Question {
  const kind = pick(['cooling', 'double', 'runner'] as const)
  if (kind === 'cooling') {
    const drop1 = pick([4, 5, 6, 8])
    const t1 = pick([3, 4, 5].filter((x) => x !== drop1))
    const drop2 = pick([10, 12, 15, 20])
    const t2 = round((t1 * drop2) / drop1, 4)
    const right = num(round(t2, 2))
    const wrongs = [(drop1 * drop2) / t1, t1 + (drop2 - drop1), (drop1 * t1) / drop2, drop2 / t1, t2 * 2].map((w) => num(round(w, 2))).filter((w) => w !== right)
    const opts = [right, ...Array.from(new Set(wrongs)).slice(0, 3)]
    return q({
      prompt: `As an object cools, the drop in temperature varies directly with time. The temperature drops ${drop1}°C in ${t1} minutes. How long would it take to drop ${drop2}°C?`,
      answer: mcA(`${opts[0]} min`, opts.slice(1).map((o) => `${o} min`)),
      calc: true,
      hint: 'Find the drop per minute first (the constant of variation).',
      steps: [`Drop = ${v('k')} × time: ${v('k')} = ${drop1} ${DIVIDE} ${t1} = ${num(round(drop1 / t1, 4))}°C per minute`, `Time = ${drop2} ${DIVIDE} ${num(round(drop1 / t1, 4))} = ${num(round(t2, 2))} minutes`],
      meta: { t: 'vary-x', x1: t1, y1: drop1, x2: t2, y2: drop2 },
    })
  }
  if (kind === 'double') {
    const D1 = pick([1200, 1500, 1600, 2000, 2400])
    const rate = pick([0.025, 0.03, 0.035, 0.04])
    const I1 = round(D1 * rate, 2)
    const D2 = D1 * 2
    return q({
      prompt: `The interest earned on a deposit varies directly as the size of the deposit. A deposit of $${num(D1)} earns $${num(I1)} interest. How much interest would a deposit of $${num(D2)} earn?`,
      answer: numA(round(I1 * 2, 2)),
      prefix: '$',
      calc: true,
      hint: 'If the deposit doubles, what happens to the interest?',
      steps: [`$${num(D2)} is double $${num(D1)}.`, `When one variable doubles, the other doubles too: 2 × $${num(I1)} = $${num(round(I1 * 2, 2))}.`],
      meta: { t: 'vary-y', x1: D1, y1: I1, x2: D2, y2: I1 * 2 },
    })
  }
  const d1 = pick([6.6, 8.25, 9.9, 7.2])
  const t1 = pick([36, 44, 40, 48])
  const ask = pick(['hour', 'time'] as const)
  const k = d1 / t1
  if (ask === 'hour')
    return q({
      prompt: `The distance a runner travels varies directly as time. The runner covers ${num(d1)} km in ${t1} minutes. How far will the runner go in one hour, at the same pace? Answer correct to two decimal places.`,
      answer: numA(k * 60, 2),
      suffix: 'km',
      calc: true,
      hint: 'One hour is 60 minutes. Find the distance per minute first.',
      steps: [`${v('k')} = ${num(d1)} ${DIVIDE} ${t1} = ${num(round(k, 5))} km per minute`, `Distance = ${num(round(k, 5))} … × 60 ≈ ${num(round(k * 60, 2), 2)} km`],
      meta: { t: 'vary-y', x1: t1, y1: d1, x2: 60, y2: k * 60, dp: 2 },
    })
  const d2 = pick([10, 12, 21, 24])
  return q({
    prompt: `The distance a runner travels varies directly as time. The runner covers ${num(d1)} km in ${t1} minutes. How long will it take to run ${d2} km at the same pace? Answer in minutes, correct to one decimal place.`,
    answer: numA(d2 / k, 1),
    suffix: 'minutes',
    calc: true,
    hint: 'Find the distance per minute, then divide the distance by it.',
    steps: [`${v('k')} = ${num(d1)} ${DIVIDE} ${t1} = ${num(round(k, 5))} … km per minute`, `Time = ${d2} ${DIVIDE} ${num(round(k, 5))} … ≈ ${num(round(d2 / k, 1), 1)} minutes`],
    meta: { t: 'vary-x', x1: t1, y1: d1, x2: d2 / k, y2: d2, dp: 1 },
  })
}

export const ex1109 = (level: Level): Question => {
  if (level === 1) return findK()
  if (level === 2) return useVariation(false)
  return chance(0.4) ? useVariation(true) : variationProblem()
}

// ================================================================== 11.10 Graphing quadratic equations y = ax² + c

const A_VALUES: [number, number][] = [[1, 1], [2, 1], [3, 1], [-1, 1], [-2, 1], [-3, 1], [1, 2], [-1, 2], [5, 1], [1, 4]]
function quadEq(an: number, ad: number, c: number): string {
  const a = an < 0 ? MINUS : ''
  const coef = Math.abs(an) === 1 && ad === 1 ? '' : ad === 1 ? num(Math.abs(an)) : frac(Math.abs(an), ad)
  const cTerm = c === 0 ? '' : ` ${c < 0 ? MINUS : '+'} ${num(Math.abs(c))}`
  return `${v('y')} = ${a}${coef}${v('x')}<sup>2</sup>${cTerm}`
}

/** the coefficient of x² written before a bracket: '' for 1, '−' for −1, '2 × ' otherwise */
const coefText = (an: number, ad: number) => (an === 1 && ad === 1 ? '' : an === -1 && ad === 1 ? MINUS : `${ad === 1 ? num(an) : fracS(an, ad)} × `)

function quadTable(): Question {
  const [an, ad] = pick(A_VALUES)
  const c = chance(0.4) ? 0 : nonZero(-5, 5)
  const xs = [-3, -2, -1, 0, 1, 2, 3]
  const ask = pick(xs.filter((x) => x !== 0 && (ad === 1 || (x * x) % ad === 0)))
  const y = (an * ask * ask) / ad + c
  return q({
    prompt: `Complete this table of values for ${quadEq(an, ad, c)}. What is the missing ${v('y')}-value?`,
    diagram: D.hTable([[v('x'), ...xs.map((x) => num(x))], [v('y'), ...xs.map((x) => (x === ask ? '?' : (ad === 1 || (x * x) % ad === 0) ? num((an * x * x) / ad + c) : ''))]]),
    answer: numA(y),
    hint: `Square ${v('x')} first, then multiply and add. Remember (${MINUS}2)<sup>2</sup> = 4.`,
    steps: [
      `${v('y')} = ${coefText(an, ad)}(${num(ask)})<sup>2</sup>${c === 0 ? '' : ` ${c < 0 ? MINUS : '+'} ${num(Math.abs(c))}`}`,
      `= ${coefText(an, ad)}${ask * ask}${c === 0 ? '' : ` ${c < 0 ? MINUS : '+'} ${num(Math.abs(c))}`} = ${num(y)}`,
    ],
    meta: { t: 'qtable', an, ad, c, x: ask },
  })
}

function quadVertexOrShape(): Question {
  const [an, ad] = pick(A_VALUES)
  const c = int(-6, 6)
  const ask = pick(['vertex', 'concave', 'yint'] as const)
  if (ask === 'vertex')
    return q({
      prompt: `What are the coordinates of the vertex (turning point) of the parabola ${quadEq(an, ad, c)}?`,
      answer: pointA(0, c),
      hint: `${v('y')} = ${v('a')}${v('x')}<sup>2</sup> + ${v('c')} is the parabola ${v('y')} = ${v('a')}${v('x')}<sup>2</sup> moved up or down by ${v('c')}. Its vertex is on the ${v('y')}-axis.`,
      steps: [`The vertex of ${v('y')} = ${v('a')}${v('x')}<sup>2</sup> is (0, 0). Adding ${num(c)} moves it to (0, ${num(c)}).`],
      meta: { t: 'qvertex', c },
    })
  if (ask === 'yint')
    return q({
      prompt: `What is the ${v('y')}-intercept of the parabola ${quadEq(an, ad, c)}?`,
      answer: numA(c),
      hint: `Substitute ${v('x')} = 0.`,
      steps: [`When ${v('x')} = 0, ${v('y')} = ${num(c)}.`],
      meta: { t: 'qyint', c },
    })
  return q({
    prompt: `Is the parabola ${quadEq(an, ad, c)} concave up or concave down?`,
    answer: mcFixedA(['concave up', 'concave down'], an > 0 ? 'concave up' : 'concave down'),
    hint: `Look at the sign of the number in front of ${v('x')}<sup>2</sup>.`,
    steps: [an > 0 ? `The coefficient of ${v('x')}<sup>2</sup> is positive, so the parabola is concave up (opens upwards).` : `The coefficient of ${v('x')}<sup>2</sup> is negative, so the parabola is concave down (opens downwards).`],
    meta: { t: 'qconcave', an },
  })
}

function wider(): Question {
  const sizes: [number, number][] = [[1, 4], [1, 3], [1, 2], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1]]
  const [a1, b1] = pick(sizes)
  let [a2, b2] = pick(sizes)
  const same = chance(0.2)
  if (same) [a2, b2] = [a1, b1]
  else while (a2 * b1 === a1 * b2) [a2, b2] = pick(sizes)
  const s1 = pick([1, -1])
  const s2 = same ? -s1 : pick([1, -1])
  const e1 = quadEq(s1 * a1, b1, 0)
  const e2 = quadEq(s2 * a2, b2, 0)
  const correct = same ? 'They are the same width' : a1 / b1 < a2 / b2 ? e1 : e2
  return q({
    prompt: 'Which parabola is wider?',
    answer: mcFixedA([e1, e2, 'They are the same width'], correct),
    hint: `The smaller the size of ${v('a')} (ignoring its sign), the wider the parabola.`,
    steps: [`The sizes of ${v('a')} are ${fracS(a1, b1)} and ${fracS(a2, b2)}.`, same ? 'They are equal, so the parabolas are the same width (one opens up, the other down).' : `${correct} has the smaller ${v('a')}, so it is wider.`],
    meta: { t: 'qwider', a1: (s1 * a1) / b1, a2: (s2 * a2) / b2 },
  })
}

function quadStatement(): Question {
  const an = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6])
  let c = nonZero(-6, 6)
  if (c === an || an + c === 0) c = c + (c > 0 ? 1 : -1)
  const truths = [`It is concave ${an > 0 ? 'up' : 'down'}.`, `Its vertex is (0, ${num(c)}).`, `It passes through (1, ${num(an + c)}).`, `Its ${v('y')}-intercept is ${num(c)}.`]
  const falses = [`It is concave ${an > 0 ? 'down' : 'up'}.`, `Its vertex is (0, ${num(an)}).`, `It passes through (1, ${num(an - c)}).`, `It is symmetrical about the ${v('x')}-axis.`, `Its ${v('y')}-intercept is ${num(an)}.`]
  const ti = int(0, 3)
  const t = truths[ti]
  // don't pair a statement with its own opposite
  const fpool = falses.filter((_, i) => i !== ti && !(ti === 3 && i === 4) && !(ti === 1 && i === 1))
  return q({
    prompt: `Which statement about the parabola ${quadEq(an, 1, c)} is correct?`,
    answer: mcA(t, sample(fpool, 3)),
    hint: `Check each statement: the sign of ${v('a')}, the vertex (0, ${v('c')}), and substitute ${v('x')} = 1.`,
    steps: [`${v('a')} = ${num(an)}, so it is concave ${an > 0 ? 'up' : 'down'}. The vertex and ${v('y')}-intercept are at ${v('y')} = ${num(c)}. When ${v('x')} = 1, ${v('y')} = ${num(an + c)}.`, `So the correct statement is: ${t}`],
    meta: { t: 'qstatement', an, c, truth: t },
  })
}

function quadMatch(): Question {
  const a = pick([1, -1, 2, -2])
  const c = pick([-3, -2, -1, 1, 2, 3])
  const opts = [quadEq(a, 1, c), quadEq(-a, 1, c), quadEq(a, 1, -c), quadEq(-a, 1, -c)]
  return q({
    prompt: 'Which equation matches this parabola?',
    diagram: G.plane({ xmin: -4, xmax: 4, ymin: -7, ymax: 7, curves: [{ fn: (x) => a * x * x + c }] }),
    answer: mcA(opts[0], opts.slice(1)),
    hint: 'Is it concave up or concave down? Where is its vertex?',
    steps: [`It is concave ${a > 0 ? 'up' : 'down'}, so ${v('a')} is ${a > 0 ? 'positive' : 'negative'}. The vertex is (0, ${num(c)}), so ${v('c')} = ${num(c)}.`, `${opts[0]} (check: when ${v('x')} = 1, ${v('y')} = ${num(a + c)}).`],
    meta: { t: 'qmatch', a, c },
  })
}

function quadXIntercepts(): Question {
  const k = int(1, 6)
  const a = pick([1, 1, 2, -1])
  const c = -a * k * k
  return q({
    prompt: `Where does the parabola ${quadEq(a, 1, c)} cut the ${v('x')}-axis? Give both ${v('x')}-values.`,
    answer: { kind: 'nums', values: [k, -k] },
    prefix: `${v('x')} =`,
    hint: `On the ${v('x')}-axis, ${v('y')} = 0. Solve ${quadEq(a, 1, c).replace(`${v('y')} = `, '')} = 0.`,
    steps: [`${a === 1 ? '' : a === -1 ? MINUS : num(a)}${v('x')}<sup>2</sup> = ${num(-c)}${a === 1 ? '' : `, so ${v('x')}<sup>2</sup> = ${num(k * k)}`}`, `${v('x')} = ±${k}`],
    meta: { t: 'qxint', a, c },
  })
}

function quadShift(): Question {
  const c = nonZero(-6, 6)
  const [an, ad] = pick(A_VALUES)
  const u = Math.abs(c) === 1 ? '1 unit' : `${Math.abs(c)} units`
  const opts = [`moved up ${u}`, `moved down ${u}`, `moved left ${u}`, `moved right ${u}`]
  return q({
    prompt: `How is the graph of ${quadEq(an, ad, c)} related to the graph of ${quadEq(an, ad, 0)}?`,
    answer: mcFixedA(opts, c > 0 ? opts[0] : opts[1]),
    hint: `Adding a number to ${v('a')}${v('x')}<sup>2</sup> changes every ${v('y')}-value by that amount.`,
    steps: [`Every ${v('y')}-value is ${c > 0 ? 'increased' : 'decreased'} by ${Math.abs(c)}, so the parabola is moved ${c > 0 ? 'up' : 'down'} ${u}. Its vertex moves from (0, 0) to (0, ${num(c)}).`],
    meta: { t: 'qshift', c },
  })
}

export const ex1110 = (level: Level): Question => {
  if (level === 1) return chance(0.5) ? quadTable() : quadVertexOrShape()
  if (level === 2) return pick([wider, quadStatement, quadVertexOrShape, quadShift])()
  return pick([quadMatch, quadXIntercepts, quadStatement])()
}

// ================================================================== 11.11 Applying quadratic equations

function droppedObject(level: Level): Question {
  const k = int(2, 6)
  const H = 5 * k * k // so it lands after k seconds
  const thing = pick(['A stone is dropped from a cliff', 'A ball is dropped from a balcony', 'A rock falls from a ledge', 'A water balloon is dropped from a rooftop'])
  const eq = `${v('h')} = ${num(H)} ${MINUS} 5${v('t')}<sup>2</sup>`
  if (level === 1) {
    const t = int(1, k - 1)
    return q({
      prompt: `${thing}. Its height above the ground after ${v('t')} seconds is ${eq} metres. What is its height after ${t} ${t === 1 ? 'second' : 'seconds'}?`,
      answer: numA(H - 5 * t * t),
      suffix: 'm',
      hint: `Substitute ${v('t')} = ${t}. Square ${v('t')} first.`,
      steps: [`${v('h')} = ${num(H)} ${MINUS} 5 ${TIMES} ${t}<sup>2</sup> = ${num(H)} ${MINUS} ${5 * t * t} = ${num(H - 5 * t * t)} m`],
      meta: { t: 'drop-h', H, time: t },
    })
  }
  const ask = pick(['ground', 'fallen', 'meaning', 'between'] as const)
  if (ask === 'ground')
    return q({
      prompt: `${thing}. Its height above the ground after ${v('t')} seconds is ${eq} metres. After how many seconds does it hit the ground?`,
      answer: numA(k),
      suffix: 'seconds',
      hint: `It hits the ground when ${v('h')} = 0.`,
      steps: [`0 = ${num(H)} ${MINUS} 5${v('t')}<sup>2</sup>, so 5${v('t')}<sup>2</sup> = ${num(H)} and ${v('t')}<sup>2</sup> = ${k * k}.`, `${v('t')} = ${k} seconds (time can’t be negative).`],
      meta: { t: 'drop-ground', H },
    })
  if (ask === 'fallen') {
    const t = int(1, k - 1)
    return q({
      prompt: `${thing}. Its height above the ground after ${v('t')} seconds is ${eq} metres. How far has it fallen after ${t} ${t === 1 ? 'second' : 'seconds'}?`,
      answer: numA(5 * t * t),
      suffix: 'm',
      hint: 'Find its height at that time, then subtract from the starting height.',
      steps: [`Height after ${t} s: ${num(H)} ${MINUS} 5 ${TIMES} ${t * t} = ${num(H - 5 * t * t)} m`, `It has fallen ${num(H)} ${MINUS} ${num(H - 5 * t * t)} = ${num(5 * t * t)} m.`],
      meta: { t: 'drop-fallen', H, time: t },
    })
  }
  if (ask === 'between') {
    const t = int(1, k - 1)
    return q({
      prompt: `${thing}. Its height above the ground after ${v('t')} seconds is ${eq} metres. How far does it fall during the ${['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth'][t]} second (from ${v('t')} = ${t - 1} to ${v('t')} = ${t})?`,
      answer: numA(5 * t * t - 5 * (t - 1) * (t - 1)),
      suffix: 'm',
      hint: 'Find the heights at the start and end of that second and subtract.',
      steps: [`At ${v('t')} = ${t - 1}: ${v('h')} = ${num(H - 5 * (t - 1) ** 2)}. At ${v('t')} = ${t}: ${v('h')} = ${num(H - 5 * t * t)}.`, `It falls ${num(H - 5 * (t - 1) ** 2)} ${MINUS} ${num(H - 5 * t * t)} = ${num(5 * t * t - 5 * (t - 1) ** 2)} m.`],
      meta: { t: 'drop-between', H, time: t },
    })
  }
  return q({
    prompt: `${thing}. Its height above the ground after ${v('t')} seconds is ${eq} metres. What does the vertical intercept, ${num(H)}, represent?`,
    answer: mcA('the height it is dropped from, in metres', ['the time it takes to reach the ground', 'how far it falls each second', 'its greatest speed']),
    hint: `The vertical intercept is the height when ${v('t')} = 0.`,
    steps: [`When ${v('t')} = 0, ${v('h')} = ${num(H)}: the starting height, ${num(H)} m.`],
    meta: { t: 'drop-meaning', H },
  })
}

function bridgeOrDish(): Question {
  if (chance()) {
    const [H, half] = pick([[16, 40], [20, 50], [25, 50], [12, 40], [18, 30], [24, 40]] as [number, number][])
    const a = H / (half * half)
    const ask = pick(['top', 'width', 'height'] as const)
    const eq = `${v('h')} = ${MINUS}${num(a)}${v('x')}<sup>2</sup> + ${H}`
    const intro = `An arch bridge follows the parabola ${eq}, where ${v('h')} metres is the height of the arch and ${v('x')} metres is the horizontal distance from the centre.`
    if (ask === 'top')
      return q({
        prompt: `${intro} What is the height of the arch at its highest point?`,
        answer: numA(H),
        suffix: 'm',
        hint: `The highest point is at the centre, where ${v('x')} = 0.`,
        steps: [`When ${v('x')} = 0, ${v('h')} = ${H}. The parabola is concave down, so this is the highest point: ${H} m.`],
        meta: { t: 'bridge-top', a, H },
      })
    if (ask === 'width')
      return q({
        prompt: `${intro} How wide is the arch at ground level (where ${v('h')} = 0)?`,
        answer: numA(2 * half),
        suffix: 'm',
        calc: true,
        hint: `Solve ${num(a)}${v('x')}<sup>2</sup> = ${H}. The arch reaches the ground on both sides of the centre.`,
        steps: [`0 = ${MINUS}${num(a)}${v('x')}<sup>2</sup> + ${H}, so ${v('x')}<sup>2</sup> = ${H} ${DIVIDE} ${num(a)} = ${half * half}`, `${v('x')} = ±${half}, so the width is 2 × ${half} = ${2 * half} m.`],
        meta: { t: 'bridge-width', a, H },
      })
    const x = pick([10, 20, half / 2].filter((u) => u < half))
    return q({
      prompt: `${intro} What is the height of the arch ${num(x)} m from the centre?`,
      answer: numA(round(H - a * x * x, 4)),
      suffix: 'm',
      calc: true,
      hint: `Substitute ${v('x')} = ${num(x)}.`,
      steps: [`${v('h')} = ${MINUS}${num(a)} ${TIMES} ${num(x)}<sup>2</sup> + ${H} = ${num(round(H - a * x * x, 4))} m`],
      meta: { t: 'bridge-height', a, H, x },
    })
  }
  const a = pick([0.02, 0.04, 0.05, 0.1, 0.25])
  const r = pick([2, 3, 4, 5, 6].filter((x) => a * x * x <= 3))
  const ask = pick(['depth', 'radius'] as const)
  const d = round(a * r * r, 4)
  return q({
    prompt:
      ask === 'depth'
        ? `The inside of a satellite dish follows the parabola ${v('y')} = ${num(a)}${v('x')}<sup>2</sup>, where ${v('y')} metres is the depth and ${v('x')} metres is the radius. Find the depth where the radius is ${r} m.`
        : `The inside of a satellite dish follows the parabola ${v('y')} = ${num(a)}${v('x')}<sup>2</sup>, where ${v('y')} metres is the depth and ${v('x')} metres is the radius. Find the radius where the depth is ${num(d)} m.`,
    answer: numA(ask === 'depth' ? d : r),
    suffix: 'm',
    calc: true,
    hint: ask === 'depth' ? `Substitute ${v('x')} = ${r}.` : `Solve ${num(a)}${v('x')}<sup>2</sup> = ${num(d)}: divide, then take the square root.`,
    steps: ask === 'depth' ? [`${v('y')} = ${num(a)} ${TIMES} ${r}<sup>2</sup> = ${num(d)} m`] : [`${v('x')}<sup>2</sup> = ${num(d)} ${DIVIDE} ${num(a)} = ${r * r}`, `${v('x')} = ${r} m (a radius is positive)`],
    meta: { t: ask === 'depth' ? 'dish-depth' : 'dish-radius', a, r },
  })
}

export const ex1111 = (level: Level): Question => {
  if (level === 1) return droppedObject(1)
  if (level === 2) return droppedObject(2)
  return chance(0.75) ? bridgeOrDish() : droppedObject(2)
}

// ================================================================== Power plus

function midpointReverse(): Question {
  const M: P = [int(-4, 5), int(-4, 5)]
  const X: P = [int(-6, 6), int(-6, 6)]
  if (X[0] === M[0] && X[1] === M[1]) X[0] += 2
  const Y: P = [2 * M[0] - X[0], 2 * M[1] - X[1]]
  return q({
    prompt: `${named('M', M)} is the midpoint of the interval ${v('XY')}. ${v('X')} is ${pt(X[0], X[1])}. What are the coordinates of ${v('Y')}?`,
    answer: pointA(Y[0], Y[1]),
    hint: `Going from ${v('X')} to ${v('M')} is half the journey. Go the same distance again from ${v('M')}.`,
    steps: [`From ${v('X')} to ${v('M')}: ${v('x')} changes by ${num(M[0] - X[0])}, ${v('y')} changes by ${num(M[1] - X[1])}.`, `Do the same again from ${v('M')}: ${v('Y')} = ${pt(Y[0], Y[1])}.`],
    meta: { t: 'pp-mid', M, X },
  })
}

function lineThrough(): Question {
  const q1 = pick([2, 3, 4])
  const p1 = pick([1, 2, -1, -2, 3].filter((x) => gcd(Math.abs(x), q1) === 1))
  const c = int(-4, 4)
  const k = q1 * int(2, 4)
  const B: P = [q1, c + p1]
  return q({
    prompt: `A line goes through ${named('A', [0, c])} and ${named('B', B)}. It also goes through point ${v('C')}, which has ${v('x')}-coordinate ${k}. Find the ${v('y')}-coordinate of ${v('C')}.`,
    answer: numA(c + (p1 * k) / q1),
    hint: 'Find the equation of the line first: the gradient from A and B, and the y-intercept from A.',
    steps: [`Gradient = ${frac(num(p1), q1)}, ${v('y')}-intercept = ${num(c)}: ${lineEq(p1, q1, c)}`, `When ${v('x')} = ${k}: ${v('y')} = ${fracS(p1, q1)} × ${k} ${c < 0 ? MINUS : '+'} ${num(Math.abs(c))} = ${num(c + (p1 * k) / q1)}`],
    meta: { t: 'pp-line', p1, q1, c, k },
  })
}

function parallelogramFourth(): Question {
  const A: P = [int(-4, 1), int(-3, 3)]
  const B: P = [A[0] + int(2, 5), A[1] + int(-1, 3)]
  const C: P = [B[0] + int(-2, 2), B[1] + int(3, 5)]
  const Dp: P = [A[0] + C[0] - B[0], A[1] + C[1] - B[1]]
  return q({
    prompt: `${v('ABCD')} is a parallelogram with ${named('A', A)}, ${named('B', B)} and ${named('C', C)}. Find the coordinates of ${v('D')}.`,
    answer: pointA(Dp[0], Dp[1]),
    hint: `Opposite sides of a parallelogram are equal and parallel: the step from ${v('B')} to ${v('C')} is the same as the step from ${v('A')} to ${v('D')}.`,
    steps: [`From ${v('B')} to ${v('C')}: ${v('x')} changes by ${num(C[0] - B[0])}, ${v('y')} changes by ${num(C[1] - B[1])}.`, `Do the same from ${v('A')}: ${v('D')} = ${pt(Dp[0], Dp[1])}.`],
    meta: { t: 'pp-para', A, B, C },
  })
}

function circleRadius(): Question {
  const C: P = [int(-3, 4), int(-3, 4)]
  const [dx, dy] = pick([[3, 4], [4, 3], [5, 12], [6, 8], [8, 6], [2, 3], [1, 4], [4, 5]] as P[])
  const A: P = [C[0] - dx, C[1] - dy]
  const r2 = dx * dx + dy * dy
  if (chance(0.5))
    return q({
      prompt: `A circle has its centre at ${named('C', C)}. The point ${named('A', A)} lies on the circle. Find the ${isSq(r2) ? 'radius' : 'exact radius, as a surd'}.`,
      answer: numA(isSq(r2) ? Math.sqrt(r2) : r2),
      prefix: isSq(r2) ? undefined : '√',
      suffix: 'units',
      hint: 'The radius is the distance from the centre to a point on the circle.',
      steps: [`Run = ${dx}, rise = ${dy}`, `${v('r')}<sup>2</sup> = ${dx * dx} + ${dy * dy} = ${r2}, so ${v('r')} = ${sqrt(r2)}${isSq(r2) ? ` = ${Math.sqrt(r2)}` : ''} units`],
      meta: { t: 'pp-radius', C, A },
    })
  const dist = pick([Math.ceil(Math.sqrt(r2)) + 1, Math.floor(Math.sqrt(r2)) - 1].filter((x) => x > 0))
  return q({
    prompt: `A circle has its centre at ${named('C', C)}, and ${named('A', A)} lies on the circle. A point ${v('P')} is ${dist} units from ${v('C')}. Is ${v('P')} inside or outside the circle?`,
    answer: mcFixedA(['inside', 'on the circle', 'outside'], dist * dist > r2 ? 'outside' : 'inside'),
    hint: `Compare ${dist} with the radius ${v('CA')}.`,
    steps: [`Radius = ${sqrt(r2)} ≈ ${num(round(Math.sqrt(r2), 2))}`, dist * dist > r2 ? `${dist} is more than the radius, so ${v('P')} is outside the circle.` : `${dist} is less than the radius, so ${v('P')} is inside the circle.`],
    meta: { t: 'pp-inside', C, A, dist },
  })
}

function squareVertex(): Question {
  const V: P = [int(-3, 2), int(-3, 2)]
  const [dx, dy] = pick([[3, 0], [0, 3], [2, 2], [3, 1], [1, 3], [4, 0]] as P[])
  const M: P = [V[0] + dx, V[1] + dy]
  const opposite: P = [2 * M[0] - V[0], 2 * M[1] - V[1]]
  const adj1: P = [M[0] - dy, M[1] + dx]
  const adj2: P = [M[0] + dy, M[1] - dx]
  if (chance(0.5))
    return q({
      prompt: `${named('V', V)} is a vertex of a square. The diagonals of the square cross at ${named('M', M)}. Find the vertex opposite ${v('V')}.`,
      answer: pointA(opposite[0], opposite[1]),
      hint: `${v('M')} is the midpoint of the diagonal from ${v('V')} to the opposite vertex.`,
      steps: [`From ${v('V')} to ${v('M')}: across ${num(dx)}, up ${num(dy)}. Do it again: ${pt(opposite[0], opposite[1])}.`],
      meta: { t: 'pp-sq-opp', V, M },
    })
  const wrong: P[] = [[M[0] + dx, M[1] + dy + 1], [V[0] + dy, V[1] + dx], [M[0] - dx, M[1] + dy]]
  const ok = (p: P) => !(p[0] === adj1[0] && p[1] === adj1[1]) && !(p[0] === adj2[0] && p[1] === adj2[1]) && !(p[0] === opposite[0] && p[1] === opposite[1])
  return q({
    prompt: `${named('V', V)} is a vertex of a square. The diagonals of the square cross at ${named('M', M)}. Which of these points is another vertex of the square, next to ${v('V')}?`,
    answer: mcA(pt(adj1[0], adj1[1]), wrong.filter(ok).map((p) => pt(p[0], p[1]))),
    hint: 'The diagonals of a square are equal, bisect each other and cross at right angles. Turn the step from M to V through a right angle.',
    steps: [`From ${v('M')} to ${v('V')}: (${num(-dx)}, ${num(-dy)}). A quarter turn of this step gives (${num(-dy)}, ${num(dx)}).`, `So ${pt(adj1[0], adj1[1])} is a vertex next to ${v('V')} (the other one is ${pt(adj2[0], adj2[1])}).`],
    meta: { t: 'pp-sq-adj', V, M },
  })
}

export const exPowerPlus11 = (level: Level): Question => {
  if (level === 1) return chance() ? midpointReverse() : lineThrough()
  if (level === 2) return chance() ? parallelogramFourth() : circleRadius()
  return chance(0.6) ? squareVertex() : triangleType()
}

// ================================================================== Topic test: Test Yourself 11 order (core sections)

const T = (skill: string, level: Level, gen: () => Question): TestItem => ({ skill, level, gen: () => gen() })

export const NCM11_TEST: TestItem[] = [
  T('y9-cg-distance', 2, () => (chance() ? lenText('surd') : lenText('dp'))),
  T('y9-cg-midpoint', 2, () => midPoint(false, true, true)),
  T('y9-cg-gradient', 2, gradPoints),
  T('y9-cg-graphing', 2, intercepts),
  T('y9-cg-graphing', 2, onLine),
  T('y9-cg-graphing', 3, rectangleArea),
  T('y9-cg-ymxc', 2, () => readMC(2)),
  T('y9-cg-equation', 2, () => equationFromSketch(2)),
  T('y9-cg-solve', 1, () => solveGraph(1)),
  T('y9-cg-apply', 2, () => fixedPlusRate(2)),
  T('y9-cg-parabola', 2, () => (chance() ? quadVertexOrShape() : wider())),
  T('y9-cg-quadapply', 2, () => droppedObject(2)),
]

// ================================================================== Skills, in textbook order

const ref = (n: string) => `NCM 9 Ex ${n}`

export const NCM11_SKILLS: Skill[] = [
  {
    id: 'y9-cg-distance',
    title: 'The length of an interval',
    ref: ref('11.01'),
    outcomes: LIN1,
    summary: 'Find the distance between two points with Pythagoras’ theorem, as a surd or a rounded decimal.',
    learn: {
      intro: `<p>An <b>interval</b> is the part of a line between two endpoints. To find its length on a number plane, make a right-angled triangle with the interval as the hypotenuse. The horizontal side is the <b>run</b> and the vertical side is the <b>rise</b>.</p><p>Then use Pythagoras’ theorem: length<sup>2</sup> = run<sup>2</sup> + rise<sup>2</sup>. For ${v('P')}(${MINUS}4, ${MINUS}2) and ${v('Q')}(2, 6): run = 6, rise = 8, so ${v('PQ')}<sup>2</sup> = 36 + 64 = 100 and ${v('PQ')} = 10 units.</p>`,
      keyPoints: [
        'Run = difference between the x-coordinates; rise = difference between the y-coordinates.',
        `If the answer is not a whole number, leave it as an exact <b>surd</b> such as ${sqrt(65)}, or round it (${sqrt(65)} ≈ 8.06).`,
        `Optional (Path): the distance formula ${v('d')} = √((${v('x')}<sub>2</sub> ${MINUS} ${v('x')}<sub>1</sub>)<sup>2</sup> + (${v('y')}<sub>2</sub> ${MINUS} ${v('y')}<sub>1</sub>)<sup>2</sup>) does the same thing.`,
      ],
      vocab: [['interval', 'part of a line with two endpoints'], ['surd', 'an exact square root that is not a whole number, such as √65']],
    },
    gen: ex1101,
    levels: { 1: 'Lengths on a number plane; run and rise', 2: 'Distances between points as surds and decimals', 3: 'Perimeters, areas and types of triangles and quadrilaterals' },
  },
  {
    id: 'y9-cg-midpoint',
    title: 'The midpoint of an interval',
    ref: ref('11.02'),
    outcomes: LIN1,
    summary: 'Find the point halfway between two points by averaging their coordinates.',
    learn: {
      intro: `<p>The <b>midpoint</b> of an interval is the point exactly halfway between its endpoints. Its ${v('x')}-coordinate is the average of the two ${v('x')}-coordinates, and its ${v('y')}-coordinate is the average of the two ${v('y')}-coordinates.</p><p>For ${v('A')}(5, ${MINUS}2) and ${v('B')}(1, 6): (5 + 1) ÷ 2 = 3 and (${MINUS}2 + 6) ÷ 2 = 2, so the midpoint is (3, 2).</p>`,
      keyPoints: ['Average the x-coordinates, then average the y-coordinates.', 'Midpoints can have halves: type (1, 3.5).', `Optional (Path): the midpoint formula ${v('M')} = ((${v('x')}<sub>1</sub> + ${v('x')}<sub>2</sub>) ÷ 2, (${v('y')}<sub>1</sub> + ${v('y')}<sub>2</sub>) ÷ 2).`],
      vocab: [['midpoint', 'the point halfway between two given points']],
    },
    gen: ex1102,
    levels: { 1: 'Whole-number midpoints', 2: 'Negatives and halves', 3: 'Quarter points, rectangle diagonals, triangles' },
  },
  {
    id: 'y9-cg-gradient',
    title: 'The gradient of a line',
    ref: ref('11.03'),
    outcomes: LIN1,
    summary: 'Measure steepness as rise ÷ run, and use it to compare and test lines.',
    learn: {
      intro: `<p>The <b>gradient</b> (${v('m')}) of a line tells you how steep it is: ${v('m')} = rise ÷ run. Read from left to right: a line going up has a positive gradient, a line going down has a negative gradient, and a horizontal line has gradient 0.</p><p>From ${v('A')}(${MINUS}4, 2) to ${v('B')}(4, 6): run = 8, rise = 4, so ${v('m')} = ${frac(4, 8)} = ${frac(1, 2)}.</p>`,
      keyPoints: ['The run is always taken left to right, so it is positive. A drop is a negative rise.', 'The bigger the size of the gradient, the steeper the line.', 'Parallel lines have equal gradients. Points are collinear when the gradients between them are equal.', `Optional (Path): ${v('m')} = (${v('y')}<sub>2</sub> ${MINUS} ${v('y')}<sub>1</sub>) ÷ (${v('x')}<sub>2</sub> ${MINUS} ${v('x')}<sub>1</sub>).`],
      vocab: [['gradient', 'the steepness of a line: rise ÷ run'], ['collinear', 'lying on the same straight line']],
    },
    gen: ex1103,
    levels: { 1: 'Positive or negative; rise over run', 2: 'Gradients on a number plane and between points', 3: 'Lines, parallel sides and collinear points' },
  },
  {
    id: 'y9-cg-graphing',
    title: 'Graphing linear equations',
    ref: ref('11.04'),
    outcomes: LIN2,
    summary: 'Use tables of values and intercepts, test points, and work with horizontal and vertical lines.',
    learn: {
      intro: `<p>A <b>linear equation</b> such as ${v('y')} = 2${v('x')} + 1 graphs as a straight line. Make a table of values, plot the points and rule a line through them.</p><p>The <b>${v('x')}-intercept</b> is where the line cuts the ${v('x')}-axis (${v('y')} = 0); the <b>${v('y')}-intercept</b> is where it cuts the ${v('y')}-axis (${v('x')} = 0). A point lies on a line if its coordinates make the equation true (LHS = RHS).</p>`,
      keyPoints: [`A horizontal line has equation ${v('y')} = a number; a vertical line has equation ${v('x')} = a number.`, `The ${v('x')}-axis is ${v('y')} = 0 and the ${v('y')}-axis is ${v('x')} = 0.`, 'Two lines cross at the point that lies on both of them.'],
      vocab: [['linear equation', 'an equation whose graph is a straight line'], ['x-intercept', 'where a graph cuts the x-axis'], ['y-intercept', 'where a graph cuts the y-axis']],
    },
    gen: ex1104,
    levels: { 1: 'Tables of values; intercepts', 2: 'Testing points; horizontal and vertical lines', 3: 'Lines from descriptions; crossing points; areas' },
  },
  {
    id: 'y9-cg-ymxc',
    title: 'The gradient–intercept equation y = mx + c',
    ref: ref('11.05'),
    outcomes: LIN2,
    summary: 'Read the gradient and y-intercept from y = mx + c, write equations and graph lines from them.',
    learn: {
      intro: `<p>In ${v('y')} = ${v('m')}${v('x')} + ${v('c')}, ${v('m')} is the gradient and ${v('c')} is the ${v('y')}-intercept. This is the <b>gradient–intercept form</b>.</p><p>${v('y')} = 3 ${MINUS} 5${v('x')} is the same as ${v('y')} = ${MINUS}5${v('x')} + 3, so ${v('m')} = ${MINUS}5 and ${v('c')} = 3. ${v('y')} = ${frac(`3${v('x')}`, 4)} ${MINUS} 1 has ${v('m')} = ${frac(3, 4)} and ${v('c')} = ${MINUS}1.</p>`,
      keyPoints: ['To graph: plot the y-intercept, then use the gradient (run across, rise up or down) to find a second point.', 'Compare steepness by the size of m, ignoring its sign.', 'Type fraction gradients like 3x/4 or (3/4)x.'],
      vocab: [['gradient–intercept form', 'y = mx + c'], ['vertical intercept', 'the y-intercept, or the starting value when other letters are used']],
    },
    gen: ex1105,
    levels: { 1: 'Read m and c', 2: 'Fractions and rearranged forms; write the equation; steeper lines', 3: 'Match graphs; graph from m and c' },
  },
  {
    id: 'y9-cg-equation',
    title: 'Finding the equation of a line',
    ref: ref('11.06'),
    outcomes: LIN2,
    summary: 'Find y = mx + c from a graph: read c, then find the gradient from two points.',
    learn: {
      intro: `<p>To find the equation of a line from its graph, read the ${v('y')}-intercept (${v('c')}), then pick two points on the line and find the gradient (${v('m')} = rise ÷ run). Put them into ${v('y')} = ${v('m')}${v('x')} + ${v('c')}.</p><p>A line through (0, ${MINUS}3) and (2, 1) has ${v('m')} = 4 ÷ 2 = 2 and ${v('c')} = ${MINUS}3, so ${v('y')} = 2${v('x')} ${MINUS} 3.</p>`,
      keyPoints: ['Check your equation with another point on the line.', 'If you know both intercepts, use them as your two points.', 'A line that goes down from left to right has a negative gradient.'],
    },
    gen: ex1106,
    levels: { 1: 'From a number plane', 2: 'From a sketch with labelled points', 3: 'Fraction gradients; match the equation' },
  },
  {
    id: 'y9-cg-solve',
    title: 'Solving linear equations graphically',
    ref: ref('11.07'),
    outcomes: LIN2,
    summary: 'Solve equations such as 2x − 3 = 5 by reading a graph.',
    learn: {
      intro: `<p>To solve 2${v('x')} ${MINUS} 3 = 5 graphically, graph ${v('y')} = 2${v('x')} ${MINUS} 3. Every point on the line has ${v('y')} = 2${v('x')} ${MINUS} 3, so look for the point where ${v('y')} = 5: draw a horizontal line at ${v('y')} = 5 and read the ${v('x')}-coordinate where it meets the graph. Here it is (4, 5), so ${v('x')} = 4.</p>`,
      keyPoints: ['Check the solution by substituting it back into the equation.', 'The lines y = 2x + 3 and y = 1 cross where 2x + 3 = 1.'],
    },
    gen: ex1107,
    levels: { 1: 'With a guide line drawn', 2: 'Negative gradients; where two lines cross', 3: 'Fraction gradients' },
  },
  {
    id: 'y9-cg-apply',
    title: 'Applying linear equations',
    ref: ref('11.08'),
    outcomes: LIN2,
    summary: 'Use linear graphs and equations for pay, costs, depreciation, conversions and savings.',
    learn: {
      intro: `<p>Many real situations are linear: a fixed amount plus a steady rate. A taxi with a $3.50 flagfall and $2.25 per kilometre costs ${v('C')} = 2.25${v('x')} + 3.5 for ${v('x')} km. The <b>gradient</b> is the rate (dollars per kilometre) and the <b>vertical intercept</b> is the starting amount (the flagfall).</p><p>Use the graph to read values, and the equation for exact answers or values beyond the graph.</p>`,
      keyPoints: ['A line through the origin means no fixed amount (for example, pay = rate × hours).', 'A negative gradient means the amount goes down each unit, such as depreciation or fuel being used.', 'To find the input from a total, solve the equation: subtract the fixed amount, then divide by the rate.'],
      vocab: [['flagfall', 'the fixed starting charge for a taxi trip'], ['depreciation', 'loss of value over time']],
    },
    gen: ex1108,
    levels: { 1: 'Pay rates from graphs; costs from equations', 2: 'Depreciation; meaning of the intercept', 3: 'Working backwards from a total' },
  },
  {
    id: 'y9-cg-variation',
    title: 'Direct variation',
    ref: ref('11.09'),
    tag: 'extension',
    outcomes: ['MA5-RAT-P-01'],
    summary: 'Path content (beyond the core): y = kx, finding and using the constant of variation.',
    learn: {
      intro: `<p>This is <b>Path</b> content in the NSW syllabus, beyond the core. If ${v('y')} is <b>directly proportional</b> to ${v('x')} (${v('y')} varies directly as ${v('x')}), then ${v('y')} = ${v('k')}${v('x')}, where ${v('k')} is the <b>constant of variation</b>. Its graph is a straight line through (0, 0) with gradient ${v('k')}.</p><p>If a spring stretches 5 cm with an 8 kg mass, ${v('k')} = 5 ÷ 8 = 0.625, so ${v('S')} = 0.625${v('M')}. A 20 kg mass stretches it 0.625 × 20 = 12.5 cm.</p>`,
      keyPoints: ['Find k by dividing: k = y ÷ x.', 'If x doubles, y doubles; if x halves, y halves.', 'To find x from y, divide y by k.'],
      vocab: [['directly proportional', 'one variable is a constant multiple of the other: y = kx'], ['constant of variation', 'the number k in y = kx']],
    },
    gen: ex1109,
    levels: { 1: 'Find k', 2: 'Use y = kx', 3: 'Work backwards; problems' },
  },
  {
    id: 'y9-cg-parabola',
    title: 'Graphing quadratic equations y = ax² + c',
    ref: ref('11.10'),
    outcomes: NLI,
    summary: 'Tables of values, vertex, concavity, width and shifts of parabolas.',
    learn: {
      intro: `<p>The graph of ${v('y')} = ${v('x')}<sup>2</sup> is a U-shaped curve called a <b>parabola</b>. Its <b>vertex</b> (turning point) is (0, 0) and its axis of symmetry is the ${v('y')}-axis.</p><p>In ${v('y')} = ${v('a')}${v('x')}<sup>2</sup> + ${v('c')}: if ${v('a')} is positive the parabola is <b>concave up</b>; if negative, <b>concave down</b>. The bigger the size of ${v('a')}, the narrower the parabola. Adding ${v('c')} moves it up or down, so its vertex and ${v('y')}-intercept are (0, ${v('c')}).</p>`,
      keyPoints: [`Square first: when ${v('x')} = ${MINUS}2, ${v('x')}<sup>2</sup> = 4.`, `${v('y')} = 2${v('x')}<sup>2</sup> and ${v('y')} = ${MINUS}2${v('x')}<sup>2</sup> are the same width; one opens up and the other down.`, `It cuts the ${v('x')}-axis where ${v('y')} = 0, for example ${v('x')}<sup>2</sup> ${MINUS} 9 = 0 gives ${v('x')} = ±3.`],
      vocab: [['parabola', 'the U-shaped graph of a quadratic equation'], ['vertex', 'the turning point of a parabola'], ['concave up', 'opening upwards, like a smile']],
    },
    gen: ex1110,
    levels: { 1: 'Tables of values; vertex; concave up or down', 2: 'Wider or narrower; true statements; shifts', 3: 'Match the graph; x-intercepts' },
  },
  {
    id: 'y9-cg-quadapply',
    title: 'Applying quadratic equations',
    ref: ref('11.11'),
    outcomes: NLI,
    summary: 'Falling objects, arches and dishes modelled by y = ax² + c.',
    learn: {
      intro: `<p>Parabolas model many real things. A ball dropped from 45 m has height ${v('h')} = 45 ${MINUS} 5${v('t')}<sup>2</sup> metres after ${v('t')} seconds. The vertical intercept (45) is the starting height, and it hits the ground when ${v('h')} = 0: 5${v('t')}<sup>2</sup> = 45, so ${v('t')} = 3 seconds.</p>`,
      keyPoints: ['Substitute to find a height or depth; solve to find a time or distance.', 'Ignore negative times and lengths: they don’t make sense in the situation.', 'The highest point of an arch y = −ax² + c is at the centre, where x = 0.'],
    },
    gen: ex1111,
    levels: { 1: 'Heights by substituting', 2: 'Hitting the ground; distance fallen', 3: 'Arches and satellite dishes' },
  },
  {
    id: 'y9-cg-powerplus',
    title: 'Power plus: coordinate geometry challenges',
    ref: 'NCM 9 Power plus',
    tag: 'extension',
    outcomes: LIN1,
    summary: 'Harder problems: missing endpoints and vertices, lines through points, circles and squares.',
    learn: {
      intro: '<p>These questions combine distance, midpoint and gradient. Draw a quick sketch, mark what you know, and use the steps between points.</p>',
      keyPoints: ['If M is the midpoint of XY, the step from X to M equals the step from M to Y.', 'Opposite sides of a parallelogram are equal and parallel, so they have the same steps.', 'The diagonals of a square are equal, bisect each other and meet at right angles.'],
    },
    gen: exPowerPlus11,
    levels: { 1: 'Missing endpoints; points on a line', 2: 'Parallelograms; circles', 3: 'Squares; isosceles triangles' },
  },
]
