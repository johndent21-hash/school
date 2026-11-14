// Class games for New Century Maths 8 (3rd edition, Cengage) Chapter 11, Graphing linear equations: one set of
// quick questions for each exercise, 11.01 to 11.13.
//
// The number plane, tables of values and graphing lines revise Year 7 (NCM 7 Chapter 9), so those sets reuse its
// kinds (checked by that chapter's checks, see reuse.ts). New kinds: tables with negative numbers, rules from
// decreasing tables, rules for number patterns, linear or not, increasing or decreasing, equations from graphs,
// comparing lines, gradient, y = mx + c, linear models, solving equations from a graph and intersecting lines
// (tests/game-checks/ncm8-ch11.ts).
//
// Syllabus: NSW Mathematics K–10 (2022), Stage 4 Linear relationships MA4-LIN-C-01 (11.01–11.08, 11.11–11.13).
// The gradient of a line (11.09, starred in the textbook) and the gradient–intercept form y = mx + c (11.10) are
// Stage 5 content (MA5-LIN-C-01), so they are marked as extension.
import type { GameChapter, GameQuestion, GameSet } from '@/lib/game/types'
import { gridTable } from '@/lib/maths/diagrams13'
import { D, chance, ex, gq, int, intExcept, mk, num, pick, sample } from './helpers'
import { NCM7_CH9 } from './ncm7-ch9'
import { reuse } from './reuse'

const LIN = 'MA4-LIN-C-01'
const EXT = 'Stage 5 content (MA5-LIN-C-01): extension for Year 8.'
const big = (s: string) => `<div class="big">${s}</div>`
const b = (s: string) => `<b>${s}</b>`
const neg = (n: number) => (n < 0 ? `−${-n}` : String(n))
/** "y = 2x − 3" as ex() source, tidy for m = ±1 and c = 0 */
function lineEq(m: number, c: number, y = 'y', x = 'x'): string {
  const mx = m === 0 ? '' : m === 1 ? x : m === -1 ? `-${x}` : `${m}${x}`
  if (!mx) return `${y} = ${c}`
  return `${y} = ${mx}${c === 0 ? '' : c > 0 ? ` + ${c}` : ` - ${-c}`}`
}
const eqHtml = (m: number, c: number, y?: string, x?: string) => ex(lineEq(m, c, y, x))
/** three different wrong equations, likely first */
function eqWrong(m: number, c: number, likely: [number, number][]): string[] {
  const out: string[] = []
  const right = eqHtml(m, c)
  for (const [a, k] of [...likely, [m, c + 1], [m + 1, c], [-m, c], [m, -c], [c, m]] as [number, number][]) {
    const e = eqHtml(a, k)
    if (e !== right && !out.includes(e)) out.push(e)
    if (out.length === 3) break
  }
  return out
}

const set = (exn: string, title: string, focus: string, outcomes: string[], makers: GameSet['makers'], extra: Partial<GameSet> = {}): GameSet => ({
  id: `ncm8-${exn}`,
  exercise: exn,
  ref: `NCM 8 Ex ${exn}`,
  title,
  focus,
  outcomes,
  makers,
  ...extra,
})
const R7 = (ex7: string, t: string, as?: string) => reuse(NCM7_CH9, ex7, t, as)

// ================================================================== 11.01 Tables of values

function m1101value(): GameQuestion {
  const m = intExcept(-4, 4, [0])
  const c = int(-6, 6)
  const x = intExcept(-5, 5, [0])
  const y = m * x + c
  return gq({
    t: 'value',
    prompt: `Using the rule ${eqHtml(m, c)}, what is the value of ${ex('y')} when ${ex(`x = ${x}`)}?`,
    correct: neg(y),
    // sign slips: −m × x, m × x − c, forgetting the sign of x
    wrong: [-m * x + c, m * x - c, m * Math.abs(x) + c, y + 1, y - 1].filter((v, k, a) => v !== y && a.indexOf(v) === k).map(neg),
    why: `${ex('y')} = ${m} × (${neg(x)}) ${c < 0 ? '−' : '+'} ${Math.abs(c)} = ${neg(m * x)} ${c < 0 ? '−' : '+'} ${Math.abs(c)} = ${neg(y)}.`,
    meta: {},
  })
}

const SET_1101 = set('11.01', 'Tables of values', 'Complete tables of values from a rule, including negative numbers.', [LIN], [R7('9.05', 'complete'), mk('value', m1101value)])

// ================================================================== 11.02 Finding the rule

function table(xs: number[], ys: number[]): string {
  return gridTable([['x', ...xs.map(neg)], ['y', ...ys.map(neg)]], 46, 46)
}

function m1102rule(): GameQuestion {
  const m = intExcept(-5, 5, [0, 1])
  const c = int(-6, 9)
  const x0 = int(-2, 1)
  const xs = [0, 1, 2, 3, 4].map((k) => x0 + k)
  return gq({
    t: 'rule',
    prompt: 'Which rule fits this table of values?',
    diagram: table(xs, xs.map((x) => m * x + c)),
    correct: eqHtml(m, c),
    // the first y as the constant, the gradient's sign lost, gradient and constant swapped
    wrong: eqWrong(m, c, [[m, m * x0 + c], [-m, c], [c, m], [1, m * x0 + c - x0]]),
    why: `${ex('y')} goes ${m > 0 ? 'up' : 'down'} by ${Math.abs(m)} each time ${ex('x')} goes up by 1, and ${ex('y')} = ${neg(c)} when ${ex('x')} = 0: ${eqHtml(m, c)}.`,
    meta: {},
  })
}

const SET_1102 = set('11.02', 'Finding the rule', 'Find the rule for a table of values, including decreasing tables.', [LIN], [R7('9.05', 'rule', 'ruleUp'), mk('rule', m1102rule)])

// ================================================================== 11.03 Finding rules for number patterns

function m1103nth(): GameQuestion {
  const d = intExcept(-6, 6, [0])
  const first = int(-5, 12)
  const c = first - d
  const terms = [1, 2, 3, 4].map((n) => d * n + c)
  return gq({
    t: 'nth',
    prompt: `Find the rule for the ${ex('n')}th term, ${ex('T')}, of the pattern${big(`${terms.map(neg).join(', ')}, …`)}`,
    correct: eqHtml(d, c, 'T', 'n'),
    wrong: [[d, first], [-d, c], [first, d], [d, c + d], [d, -c], [d, c + 1], [d + 1, c], [-d, first]].map(([a, k]) => eqHtml(a, k, 'T', 'n')).filter((e, i, a) => e !== eqHtml(d, c, 'T', 'n') && a.indexOf(e) === i),
    why: `The pattern goes ${d > 0 ? 'up' : 'down'} by ${Math.abs(d)} each time, so ${ex('T')} = ${d}${ex('n')} + something. When ${ex('n')} = 1, ${d} + ${neg(c)} = ${neg(first)}: ${eqHtml(d, c, 'T', 'n')}.`,
    meta: {},
  })
}

function m1103term(): GameQuestion {
  const d = int(2, 9)
  const c = int(-5, 9)
  const n = pick([10, 12, 15, 20, 25, 50, 100])
  const T = d * n + c
  return gq({
    t: 'term',
    prompt: `A pattern has the rule ${eqHtml(d, c, 'T', 'n')}. What is term number ${b(String(n))}?`,
    correct: neg(T),
    // n + d + c, d × (n + c), forgot the constant
    wrong: [n + d + c, d * (n + c), d * n, T + d, T - d].filter((v, k, a) => v !== T && a.indexOf(v) === k).map(neg),
    why: `${ex('T')} = ${d} × ${n} ${c < 0 ? '−' : '+'} ${Math.abs(c)} = ${neg(T)}.`,
    meta: {},
  })
}

const SET_1103 = set('11.03', 'Finding rules for number patterns', 'Write a rule for the nth term of a pattern, and use it to find any term.', [LIN], [mk('nth', m1103nth), mk('term', m1103term)])

// ================================================================== 11.04 revision: the number plane

const SET_1104 = set('11.04', 'The number plane', 'Read and plot points in all four quadrants, and name the quadrants and axes.', [LIN], [
  R7('9.02', 'read'),
  R7('9.03', 'read', 'readAll'),
  R7('9.03', 'quadrant'),
  R7('9.03', 'axis'),
])

// ================================================================== 11.05 Graphing number patterns

function m1105linear(): GameQuestion {
  const isLinear = chance()
  const xs = [1, 2, 3, 4, 5]
  let ys: number[]
  if (isLinear) {
    const m = intExcept(-4, 5, [0])
    const c = int(-3, 8)
    ys = xs.map((x) => m * x + c)
  } else {
    const kind = int(0, 2)
    ys = kind === 0 ? xs.map((x) => x * x) : kind === 1 ? xs.map((x) => 2 ** x) : xs.map((x) => x * x + int(0, 3))
  }
  return gq({
    t: 'linear',
    prompt: 'Would these points lie on a straight line when graphed?',
    diagram: table(xs, ys),
    correct: isLinear ? 'Yes: the same change in y each time' : 'No: the change in y is not the same',
    inOrder: ['Yes: the same change in y each time', 'Yes: x goes up by 1 each time', 'No: the change in y is not the same', 'No: some y values are negative'],
    why: `The changes in y are ${ys.slice(1).map((y, i) => neg(y - ys[i])).join(', ')}: ${isLinear ? 'all the same, so it is linear' : 'not all the same, so it is not linear'}.`,
    meta: {},
  })
}

const SET_1105 = set('11.05', 'Graphing number patterns', 'Plot a pattern from its table, and tell whether it is linear (the same change each time).', [LIN], [R7('9.04', 'pair'), R7('9.04', 'next'), mk('linear', m1105linear)])

// ================================================================== 11.06 Graphing linear equations

const SET_1106 = set('11.06', 'Graphing linear equations', 'Graph lines from their equations, and tell increasing from decreasing.', [LIN], [R7('9.06', 'onLine'), R7('9.06', 'graph'), R7('9.06', 'incdec')])

// ================================================================== 11.07 Finding the equation of a line

function plane(m: number, c: number): string {
  return D.numberPlane({ xmin: -5, xmax: 5, ymin: -6, ymax: 6, lines: [{ m, c }] })
}

function m1107fromGraph(): GameQuestion {
  const m = pick([-3, -2, -1, 1, 2, 3])
  const c = int(-3, 3)
  return gq({
    t: 'fromGraph',
    prompt: 'Which equation does this line show?',
    diagram: plane(m, c),
    correct: eqHtml(m, c),
    // the constant's sign, the gradient's sign, the two swapped, the x-intercept as constant
    wrong: eqWrong(m, c, [[m, -c], [-m, c], [c === 0 ? m + 1 : c, m], [m, c + m]]),
    why: `The line crosses the ${ex('y')}-axis at ${neg(c)}, and ${ex('y')} goes ${m > 0 ? 'up' : 'down'} by ${Math.abs(m)} for each 1 across: ${eqHtml(m, c)}.`,
    meta: {},
  })
}

const SET_1107 = set('11.07', 'Finding the equation of a line', 'Find the equation of a line from its graph.', [LIN], [mk('fromGraph', m1107fromGraph, 2)])

// ================================================================== 11.08 Comparing linear equations

function m1108parallel(): GameQuestion {
  const m = intExcept(-4, 5, [0])
  const c = int(-5, 5)
  const c2 = intExcept(-6, 6, [c])
  return gq({
    t: 'parallel',
    prompt: `Which line is parallel to ${eqHtml(m, c)}?`,
    correct: eqHtml(m, c2),
    wrong: [eqHtml(c2 === 0 ? m + 2 : c2, m), eqHtml(-m, c), eqHtml(m + 1, c), eqHtml(-m, c2)].filter((e, i, a) => e !== eqHtml(m, c2) && a.indexOf(e) === i),
    why: `Parallel lines have the same coefficient of ${ex('x')} (${neg(m)}); only the constant changes.`,
    meta: {},
  })
}

function m1108intercept(): GameQuestion {
  const m = intExcept(-5, 5, [0])
  const c = intExcept(-8, 8, [0, m, -m])
  return gq({
    t: 'intercept',
    prompt: `Where does the line ${eqHtml(m, c)} cross the ${ex('y')}-axis?`,
    correct: `(0, ${neg(c)})`,
    // the coefficient, the point the wrong way round, the sign lost
    wrong: [`(0, ${neg(m)})`, `(${neg(c)}, 0)`, `(0, ${neg(-c)})`, `(${neg(m)}, ${neg(c)})`],
    why: `On the ${ex('y')}-axis ${ex('x')} = 0, so ${ex('y')} = ${neg(c)}: the point (0, ${neg(c)}).`,
    meta: {},
  })
}

function m1108steepest(): GameQuestion {
  const ms = sample([1, 2, 3, 4, 5, -2, -3], 4)
  const top = ms.reduce((a, x) => (Math.abs(x) > Math.abs(a) ? x : a))
  if (ms.filter((x) => Math.abs(x) === Math.abs(top)).length > 1) return m1108steepest()
  const cs = ms.map(() => int(-4, 6))
  const opts = ms.map((m, i) => eqHtml(m, cs[i]))
  return gq({
    t: 'steepest',
    prompt: 'Which line is the steepest?',
    correct: opts[ms.indexOf(top)],
    wrong: opts.filter((_, i) => i !== ms.indexOf(top)),
    why: `The steepest line has the coefficient of ${ex('x')} furthest from 0 (positive or negative): ${opts[ms.indexOf(top)]}.`,
    meta: {},
  })
}

const SET_1108 = set('11.08', 'Comparing linear equations', 'Compare lines by the coefficient of x (steepness, parallel) and the constant (where they cross the y-axis).', [LIN], [
  mk('intercept', m1108intercept),
  mk('parallel', m1108parallel),
  mk('steepest', m1108steepest),
])

// ================================================================== 11.09 The gradient of a line (extension)

function m1109gradient(): GameQuestion {
  const m = pick([-3, -2, -1, 1, 2, 3, 4])
  const x1 = int(-3, 3)
  const run = int(1, 4)
  const y1 = int(-4, 5)
  const x2 = x1 + run
  const y2 = y1 + m * run
  return gq({
    t: 'gradient',
    prompt: `What is the gradient of the line through ${b(`(${neg(x1)}, ${neg(y1)})`)} and ${b(`(${neg(x2)}, ${neg(y2)})`)}?`,
    correct: neg(m),
    // the sign lost, the rise only, one out
    wrong: [-m, m * run, m + 1, m - 1, 2 * m].filter((v, i, a) => v !== m && a.indexOf(v) === i).map(neg),
    why: `Gradient = rise ÷ run = (${neg(y2)} − ${neg(y1)}) ÷ (${neg(x2)} − ${neg(x1)}) = ${neg(m * run)} ÷ ${run} = ${neg(m)}.`,
    meta: {},
  })
}

const SET_1109 = set('11.09', 'The gradient of a line', 'Gradient = rise ÷ run: positive for rising lines, negative for falling lines.', [], [mk('gradient', m1109gradient)], { teacherNote: EXT })

// ================================================================== 11.10 y = mx + c (extension)

function m1110read(): GameQuestion {
  const m = intExcept(-6, 6, [0])
  const c = intExcept(-8, 8, [0, m])
  return gq({
    t: 'read',
    prompt: `What are the gradient and ${ex('y')}-intercept of ${eqHtml(m, c)}?`,
    correct: `gradient ${neg(m)}, ${ex('y')}-intercept ${neg(c)}`,
    wrong: [`gradient ${neg(c)}, ${ex('y')}-intercept ${neg(m)}`, `gradient ${neg(m)}, ${ex('y')}-intercept ${neg(-c)}`, `gradient ${neg(-m)}, ${ex('y')}-intercept ${neg(c)}`],
    why: `In ${ex('y = mx + c')}, ${ex('m')} is the gradient and ${ex('c')} is the ${ex('y')}-intercept.`,
    meta: {},
  })
}

function m1110write(): GameQuestion {
  const m = intExcept(-6, 6, [0])
  const c = intExcept(-8, 8, [0, m])
  return gq({
    t: 'write',
    prompt: `Which line has gradient ${b(neg(m))} and ${ex('y')}-intercept ${b(neg(c))}?`,
    correct: eqHtml(m, c),
    wrong: eqWrong(m, c, [[c, m], [m, -c], [-m, c]]),
    why: `${ex('y = mx + c')} with ${ex('m')} = ${neg(m)} and ${ex('c')} = ${neg(c)}: ${eqHtml(m, c)}.`,
    meta: {},
  })
}

const SET_1110 = set('11.10', 'The equation y = mx + c', 'In y = mx + c, m is the gradient and c is the y-intercept.', [], [mk('read', m1110read), mk('write', m1110write)], { teacherNote: EXT })

// ================================================================== 11.11 Applying linear equations

function m1111apply(): GameQuestion {
  const k = int(0, 2)
  if (k === 0) {
    const rate = int(2, 4)
    const flag = int(3, 6)
    const d = int(2, 15)
    const back = chance()
    const cost = rate * d + flag
    return gq({
      t: 'apply',
      prompt: back
        ? `A taxi fare is ${ex(`c = ${rate}d + ${flag}`)}, where ${ex('c')} is the cost in dollars and ${ex('d')} the distance in km. How far can you go for ${b(`$${cost}`)}?`
        : `A taxi fare is ${ex(`c = ${rate}d + ${flag}`)}, where ${ex('c')} is the cost in dollars and ${ex('d')} the distance in km. What does a ${b(`${d} km`)} trip cost?`,
      correct: back ? `${d} km` : `$${cost}`,
      wrong: back
        ? [cost / rate, cost - flag, (cost + flag) / rate, d + 1, d + 2, d - 1, 2 * d].filter((v, i, a) => Number.isInteger(v) && v > 0 && v !== d && a.indexOf(v) === i).map((v) => `${v} km`)
        : [rate * (d + flag), rate * d, d + rate + flag, cost + rate].filter((v, i, a) => v !== cost && a.indexOf(v) === i).map((v) => `$${v}`),
      why: back ? `${cost} = ${rate}${ex('d')} + ${flag}, so ${rate}${ex('d')} = ${cost - flag} and ${ex('d')} = ${d} km.` : `${ex('c')} = ${rate} × ${d} + ${flag} = $${cost}.`,
      meta: {},
    })
  }
  const start = pick([400, 500, 600, 800, 1000])
  const drain = pick([20, 25, 40, 50])
  const t = int(2, Math.floor(start / drain) - 1)
  const V = start - drain * t
  return gq({
    t: 'apply',
    prompt: `A tank holds ${ex(`V = ${start} - ${drain}t`)} litres after ${ex('t')} minutes. How much is left after ${b(`${t} minutes`)}?`,
    correct: `${V} L`,
    wrong: [start + drain * t, drain * t, start - drain - t, V + drain].filter((v, i, a) => v > 0 && v !== V && a.indexOf(v) === i).map((v) => `${v} L`),
    why: `${ex('V')} = ${start} − ${drain} × ${t} = ${start} − ${drain * t} = ${V} L.`,
    meta: {},
  })
}

const SET_1111 = set('11.11', 'Applying linear equations', 'Use a linear rule from a real situation to find values.', [LIN], [mk('apply', m1111apply)])

// ================================================================== 11.12 Solving equations graphically

function m1112graph(): GameQuestion {
  const m = pick([1, 2, 3, -1, -2])
  const c = int(-3, 3)
  const x = int(-2, 3)
  const y = m * x + c
  if (y < -6 || y > 6) return m1112graph()
  return gq({
    t: 'graph',
    prompt: `This is the graph of ${eqHtml(m, c)}. Use it to solve ${ex(`${lineEq(m, c).slice(4)} = ${y}`)}.`,
    diagram: plane(m, c),
    correct: ex(`x = ${x}`),
    // read across to the wrong axis, sign slip, one square out
    wrong: [y, -x, x + 1, x - 1, x + 2].filter((v, i, a) => v !== x && a.indexOf(v) === i).map((v) => ex(`x = ${v}`)),
    why: `Go across from ${ex('y')} = ${neg(y)} to the line, then down to the ${ex('x')}-axis: ${ex('x')} = ${neg(x)}.`,
    meta: {},
  })
}

const SET_1112 = set('11.12', 'Solving linear equations graphically', 'Use the graph of a line to solve an equation: read across from the y value, then down to x.', [LIN], [mk('graph', m1112graph, 2)])

// ================================================================== 11.13 Intersecting lines

function m1113intersect(): GameQuestion {
  for (;;) {
    const x = int(-3, 4)
    const y = int(-3, 6)
    const m1 = intExcept(-3, 3, [0])
    const m2 = intExcept(-3, 3, [0, m1])
    const c1 = y - m1 * x
    const c2 = y - m2 * x
    if (Math.abs(c1) > 9 || Math.abs(c2) > 9) continue
    return gq({
      t: 'intersect',
      prompt: `Where do the lines ${eqHtml(m1, c1)} and ${eqHtml(m2, c2)} meet?`,
      correct: `(${neg(x)}, ${neg(y)})`,
      // the coordinates swapped, a point on only one line, the y-intercepts
      wrong: [`(${neg(y)}, ${neg(x)})`, `(${neg(x + 1)}, ${neg(m1 * (x + 1) + c1)})`, `(0, ${neg(c1)})`, `(${neg(x)}, ${neg(-y)})`, `(${neg(x - 1)}, ${neg(m2 * (x - 1) + c2)})`, `(${neg(x)}, ${neg(y + 1)})`].filter((s, i, a) => s !== `(${neg(x)}, ${neg(y)})` && a.indexOf(s) === i),
      why: `At (${neg(x)}, ${neg(y)}) both rules give ${ex('y')} = ${neg(y)}: ${m1} × ${neg(x)} ${c1 < 0 ? '−' : '+'} ${Math.abs(c1)} = ${neg(y)} and ${m2} × ${neg(x)} ${c2 < 0 ? '−' : '+'} ${Math.abs(c2)} = ${neg(y)}.`,
      meta: {},
    })
  }
}

const SET_1113 = set('11.13', 'Intersecting lines', 'Find where two lines meet: the point that fits both equations.', [LIN], [mk('intersect', m1113intersect, 2)])

export const NCM8_CH11: GameChapter = {
  id: 'ncm8-ch11',
  number: 11,
  title: 'Graphing linear equations',
  ref: 'NCM 8 Chapter 11',
  strand: 'Number and algebra',
  outcomes: [LIN],
  sets: [SET_1101, SET_1102, SET_1103, SET_1104, SET_1105, SET_1106, SET_1107, SET_1108, SET_1109, SET_1110, SET_1111, SET_1112, SET_1113],
  colour: 190,
  topics: [],
}
