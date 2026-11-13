// Class games for New Century Maths 7 (3rd edition, Cengage) Chapter 9, Number plane: one set of quick questions
// for each exercise, 9.01 to 9.06.
//
// The questions are the site's own. Every question is ONE step with four choices; the wrong choices are the usual
// slips: coordinates the wrong way round, a sign lost, counting from 1 instead of 0, a rule that fits one pair only.
// Drawings are measured by the test (tests/game-checks/ncm7-ch9.ts).
//
// Syllabus: NSW Mathematics K–10 (2022), Stage 4, Linear relationships MA4-LIN-C-01. 9.01 (grid references on a map)
// is earlier-stage content and marked as revision.
import type { GameChapter, GameQuestion, GameSet } from '@/lib/game/types'
import { D, MINUS, chance, gq, int, mk, num, pick, sample, shuffle, v } from './helpers'

type P = [number, number]
const LIN = 'MA4-LIN-C-01'
const REVISION = 'Revision of earlier stages: grid references on a map come before the number plane, which is Stage 4.'
const pt = ([x, y]: P) => `(${num(x)}, ${num(y)})`

// ================================================================== 9.01 Location using coordinates

const PLACES = ['Pool', 'Shop', 'Park', 'School', 'Farm', 'Lake', 'Library', 'Church', 'Oval', 'Bank', 'Café', 'Zoo']
const MAP_COLS = 'ABCDEF'
const MAP_ROWS = 4
const CW = 64
const CH = 46

/** a town map: lettered columns along the bottom, numbered rows up the side (1 at the bottom) */
function townMap(spots: { name: string; c: number; r: number }[]): string {
  const x0 = 34
  const y0 = 10
  let body = ''
  for (let i = 0; i <= MAP_COLS.length; i++) body += `<line class="grid" x1="${x0 + i * CW}" y1="${y0}" x2="${x0 + i * CW}" y2="${y0 + MAP_ROWS * CH}"/>`
  for (let j = 0; j <= MAP_ROWS; j++) body += `<line class="grid" x1="${x0}" y1="${y0 + j * CH}" x2="${x0 + MAP_COLS.length * CW}" y2="${y0 + j * CH}"/>`
  for (let i = 0; i < MAP_COLS.length; i++) body += D.text([x0 + (i + 0.5) * CW, y0 + MAP_ROWS * CH + 16], MAP_COLS[i], 'dl colref')
  for (let r = 1; r <= MAP_ROWS; r++) body += D.text([x0 - 16, y0 + (MAP_ROWS - r + 0.5) * CH], String(r), 'dl rowref')
  for (const s of spots) body += D.text([x0 + (s.c + 0.5) * CW, y0 + (MAP_ROWS - s.r + 0.5) * CH], s.name, 'dl small place')
  return D.svg(x0 + MAP_COLS.length * CW + 10, y0 + MAP_ROWS * CH + 30, body, 'A town map with grid squares', 440)
}
function mapSpots(n: number) {
  const cells = sample([...Array(MAP_COLS.length * MAP_ROWS).keys()], n)
  return sample(PLACES, n).map((name, i) => ({ name, c: cells[i] % MAP_COLS.length, r: 1 + Math.floor(cells[i] / MAP_COLS.length) }))
}
const ref = (c: number, r: number) => `${MAP_COLS[c]}${r}`

function m901where(): GameQuestion {
  const spots = mapSpots(5)
  const s = spots[0]
  // the letter and number swapped over, a square next door
  const swapped = s.r - 1 < MAP_COLS.length && s.c + 1 <= MAP_ROWS ? [ref(s.r - 1, s.c + 1)] : []
  const near = [
    [s.c + 1, s.r],
    [s.c - 1, s.r],
    [s.c, s.r + 1],
    [s.c, s.r - 1],
  ].filter(([c, r]) => c >= 0 && c < MAP_COLS.length && r >= 1 && r <= MAP_ROWS)
  return gq({
    t: 'where',
    prompt: `In which grid square is the ${s.name}?`,
    diagram: townMap(spots),
    correct: ref(s.c, s.r),
    // then the squares of the other places on the map
    wrong: [...swapped, ...shuffle(near).map(([c, r]) => ref(c, r)), ...spots.slice(1).map((o) => ref(o.c, o.r))],
    why: `The ${s.name} is in column ${MAP_COLS[s.c]} and row ${s.r}: ${ref(s.c, s.r)}. (Letter first, then number.)`,
    meta: { spots },
  })
}

function m901what(): GameQuestion {
  const spots = mapSpots(5)
  const s = pick(spots)
  return gq({
    t: 'what',
    prompt: `What is in grid square ${ref(s.c, s.r)}?`,
    diagram: townMap(spots),
    correct: s.name,
    wrong: spots.filter((o) => o !== s).map((o) => o.name),
    why: `Go along to column ${MAP_COLS[s.c]}, then up to row ${s.r}: the ${s.name}.`,
    meta: { spots },
  })
}

const SET_901: GameSet = {
  id: 'ncm7-9.01',
  exercise: '9.01',
  ref: 'NCM 7 Ex 9.01',
  title: 'Location using coordinates',
  focus: 'Use grid references (letter, then number) to find places on a map.',
  lessons: ['y7-np-coords'],
  outcomes: [],
  teacherNote: REVISION,
  makers: [mk('where', m901where), mk('what', m901what)],
}

// ================================================================== 9.02 The number plane (first quadrant)

/** wrong coordinates: the pair swapped, then one step out either way */
function coordWrong([x, y]: P, lo: number, hi: number): string[] {
  const cands: P[] = [[y, x], [x + 1, y], [x, y + 1], [x - 1, y], [x, y - 1], [x + 1, y + 1]]
  return cands.filter(([a, b2]) => (a !== x || b2 !== y) && a >= lo && a <= hi && b2 >= lo && b2 <= hi).map(pt)
}

function m902read(): GameQuestion {
  let p: P
  do p = [int(0, 7), int(0, 7)]
  while (p[0] === p[1])
  const L = pick(['P', 'Q', 'R', 'M', 'K'])
  return gq({
    t: 'read',
    prompt: `What are the coordinates of point ${L}?`,
    diagram: D.numberPlane({ xmin: 0, xmax: 8, ymin: 0, ymax: 8, points: [{ x: p[0], y: p[1], label: L }] }),
    correct: pt(p),
    wrong: coordWrong(p, 0, 8),
    why: `Go across ${p[0]} on the ${v('x')}-axis, then up ${p[1]}: ${pt(p)}. Across first, then up.`,
    meta: { p },
  })
}

function m902which(): GameQuestion {
  let p: P
  do p = [int(1, 7), int(1, 7)]
  while (p[0] === p[1])
  // the swapped point is always one of the others
  const others: P[] = [[p[1], p[0]]]
  while (others.length < 3) {
    const q: P = [int(0, 8), int(0, 8)]
    if (![p, ...others].some((o) => o[0] === q[0] && o[1] === q[1])) others.push(q)
  }
  const all = shuffle([p, ...others])
  const names = ['A', 'B', 'C', 'D']
  const at = all.indexOf(p)
  return gq({
    t: 'which',
    prompt: `Which point is at ${pt(p)}?`,
    diagram: D.numberPlane({ xmin: 0, xmax: 8, ymin: 0, ymax: 8, points: all.map((q, i) => ({ x: q[0], y: q[1], label: names[i] })) }),
    correct: names[at],
    inOrder: names,
    why: `Across ${p[0]}, then up ${p[1]}: point ${names[at]}.`,
    meta: { p },
  })
}

const SET_902: GameSet = {
  id: 'ncm7-9.02',
  exercise: '9.02',
  ref: 'NCM 7 Ex 9.02',
  title: 'The number plane',
  focus: 'Read and plot points (x, y) on the number plane: across first, then up.',
  lessons: ['y7-np-coords'],
  outcomes: [LIN],
  makers: [mk('read', m902read), mk('which', m902which)],
}

// ================================================================== 9.03 Quadrants of the number plane

const QUADS = ['First quadrant', 'Second quadrant', 'Third quadrant', 'Fourth quadrant']
/** a non-zero coordinate, kept off the edge of the drawn plane so its label has room */
const nz = () => pick([-4, -3, -2, -1, 1, 2, 3, 4])

function m903read(): GameQuestion {
  let p: P
  do p = [nz(), nz()]
  while (Math.abs(p[0]) === Math.abs(p[1]) || (p[0] > 0 && p[1] > 0))
  const L = pick(['P', 'Q', 'R', 'M', 'K'])
  return gq({
    t: 'read',
    prompt: `What are the coordinates of point ${L}?`,
    diagram: D.numberPlane({ xmin: -5, xmax: 5, ymin: -5, ymax: 5, points: [{ x: p[0], y: p[1], label: L }] }),
    correct: pt(p),
    // swapped, a sign lost on one or the other
    wrong: [pt([p[1], p[0]]), pt([-p[0], p[1]]), pt([p[0], -p[1]]), pt([-p[0], -p[1]])],
    why: `${p[0] < 0 ? `Left ${-p[0]}` : `Right ${p[0]}`}, then ${p[1] < 0 ? `down ${-p[1]}` : `up ${p[1]}`}: ${pt(p)}.`,
    meta: { p },
  })
}

function m903quadrant(): GameQuestion {
  const q = int(0, 3)
  const sx = q === 0 || q === 3 ? 1 : -1
  const sy = q < 2 ? 1 : -1
  const p: P = [sx * int(1, 9), sy * int(1, 9)]
  return gq({
    t: 'quadrant',
    prompt: `In which quadrant is the point ${pt(p)}?`,
    correct: QUADS[q],
    inOrder: QUADS,
    why: `${v('x')} is ${p[0] > 0 ? 'positive' : 'negative'} and ${v('y')} is ${p[1] > 0 ? 'positive' : 'negative'}: the ${QUADS[q].toLowerCase()}. (The quadrants go anticlockwise from the top right.)`,
    meta: { p },
  })
}

function m903axis(): GameQuestion {
  const onX = chance()
  const a = nz()
  const p: P = onX ? [a, 0] : [0, a]
  const OPTS = [`On the ${v('x')}-axis`, `On the ${v('y')}-axis`, 'At the origin', a > 0 ? 'In the first quadrant' : onX ? 'In the second quadrant' : 'In the fourth quadrant']
  return gq({
    t: 'axis',
    prompt: `Where is the point ${pt(p)}?`,
    correct: OPTS[onX ? 0 : 1],
    inOrder: OPTS,
    why: onX ? `Its ${v('y')}-coordinate is 0, so it is on the ${v('x')}-axis.` : `Its ${v('x')}-coordinate is 0, so it is on the ${v('y')}-axis.`,
    meta: { p },
  })
}

const SET_903: GameSet = {
  id: 'ncm7-9.03',
  exercise: '9.03',
  ref: 'NCM 7 Ex 9.03',
  title: 'Quadrants of the number plane',
  focus: 'Read and plot points with negative coordinates, and name the four quadrants.',
  lessons: ['y7-np-coords'],
  outcomes: [LIN],
  makers: [mk('read', m903read), mk('quadrant', m903quadrant), mk('axis', m903axis, 2)],
}

// ================================================================== tables of values (9.04, 9.05)

/** a table of values drawn as a picture, so it scales on the board like any other diagram */
function valueTable(xs: number[], ys: (number | null)[], xn = 'x', yn = 'y'): string {
  const cw = 54
  const ch = 40
  const w = (xs.length + 1) * cw
  let body = `<rect class="frame" x="1" y="1" width="${w}" height="${2 * ch}"/>`
  body += `<line class="ln thin" x1="1" y1="${1 + ch}" x2="${1 + w}" y2="${1 + ch}"/>`
  for (let i = 1; i <= xs.length; i++) body += `<line class="ln thin" x1="${1 + i * cw}" y1="1" x2="${1 + i * cw}" y2="${1 + 2 * ch}"/>`
  body += D.text([1 + cw / 2, 1 + ch / 2], `<i>${xn}</i>`, 'dl rowhead') + D.text([1 + cw / 2, 1 + 1.5 * ch], `<i>${yn}</i>`, 'dl rowhead')
  xs.forEach((x, i) => {
    body += D.text([1 + (i + 1.5) * cw, 1 + ch / 2], num(x), 'dl cellx')
    body += D.text([1 + (i + 1.5) * cw, 1 + 1.5 * ch], ys[i] === null ? '?' : num(ys[i]!), 'dl celly')
  })
  return D.svg(w + 2, 2 * ch + 2, body, 'A table of values', Math.round((w + 2) * 1.3))
}
const RULES: [number, number][] = [[1, 2], [1, 3], [2, 0], [2, 1], [3, 0], [2, -1], [1, -2], [3, -2], [-1, 6], [4, 0], [3, 1], [-2, 8]]
const ruleText = (m: number, c: number, xn = 'x', yn = 'y') => {
  const mx = m === 1 ? xn : m === -1 ? `-${xn}` : `${m}${xn}`
  if (m < 0) return `${yn} = ${c} - ${m === -1 ? xn : `${-m}${xn}`}`
  return `${yn} = ${mx}${c === 0 ? '' : c > 0 ? ` + ${c}` : ` - ${-c}`}`
}

function m904pair(): GameQuestion {
  const [m, c] = pick(RULES)
  const xs = sample([-2, -1, 0, 1, 2, 3, 4, 5], 4).sort((a, b) => a - b)
  const ys = xs.map((x) => m * x + c)
  const k = int(0, 3)
  const right: P = [xs[k], ys[k]]
  const j = (k + 1 + int(0, 2)) % 4
  const wrong: string[] = []
  for (const w of [[ys[k], xs[k]], [xs[k], ys[j]], [xs[j], ys[k]], [xs[k], ys[k] + 1], [xs[k] + 1, ys[k]], [xs[j], ys[j] - 1]] as P[]) {
    // a wrong pair must not be in the table at all
    if (!xs.some((x, i) => x === w[0] && ys[i] === w[1])) wrong.push(pt(w))
  }
  return gq({
    t: 'pair',
    prompt: 'Which ordered pair comes from this table of values?',
    diagram: valueTable(xs, ys),
    correct: pt(right),
    wrong,
    why: `Each column gives a pair (${v('x')}, ${v('y')}): ${pt(right)} is one of them.`,
    meta: { m, c, xs },
  })
}

function m904next(): GameQuestion {
  const [m, c] = pick(RULES.filter(([mm]) => mm > 0))
  const x0 = int(0, 2)
  const xs = [x0, x0 + 1, x0 + 2, x0 + 3]
  const ys = xs.map((x) => m * x + c)
  const ask = x0 + int(5, 7)
  const ans = m * ask + c
  return gq({
    t: 'next',
    prompt: `The pattern in this table continues. What is ${v('y')} when ${v('x')} = ${ask}?`,
    diagram: valueTable(xs, ys),
    correct: num(ans),
    // went up by 1 instead of the step, continued only one step, used x plus the step
    wrong: [num(ys[3] + (ask - xs[3])), num(ys[3] + m), num(ans + m), num(ans - m), num(ans + 1), num(ans - 1), num(ans + 2)],
    why: `${v('y')} goes up by ${m} each time ${v('x')} goes up by 1 (the rule is ${ex2(ruleText(m, c))}), so when ${v('x')} = ${ask}, ${v('y')} = ${num(ans)}.`,
    meta: { m, c, ask },
  })
}
/** a rule written with italic pronumerals and a true minus sign */
const ex2 = (s: string) => s.replace(/[a-z]/g, (l) => `<i>${l}</i>`).replace(/-/g, MINUS)

const SET_904: GameSet = {
  id: 'ncm7-9.04',
  exercise: '9.04',
  ref: 'NCM 7 Ex 9.04',
  title: 'Graphing tables of values',
  focus: 'Read ordered pairs from a table of values and continue its pattern.',
  lessons: ['y7-np-table'],
  outcomes: [LIN],
  makers: [mk('pair', m904pair), mk('next', m904next)],
}

// ================================================================== 9.05 Completing tables of values

function m905complete(): GameQuestion {
  const [m, c] = pick(RULES)
  const x = pick([-3, -2, -1, 2, 3, 4, 5, 6])
  const ans = m * x + c
  const xs = shuffle([x, ...sample([-1, 0, 1, 2, 3, 4, 5, 7, 8].filter((z) => z !== x), 3)])
  return gq({
    t: 'complete',
    prompt: `The rule is ${ex2(ruleText(m, c))}. Which number replaces the ? in the table?`,
    diagram: valueTable(xs, xs.map((z) => (z === x ? null : m * z + c))),
    correct: num(ans),
    // a sign slip, the + done before the ×, the x and the number joined
    wrong: [num(m * -x + c), num(m * (x + c)), num(ans + 1), num(ans - 1), num(m + x + c)],
    why: `${ex2(ruleText(m, c))} with ${v('x')} = ${num(x)}: ${v('y')} = ${num(ans)}.`,
    meta: { m, c, x },
  })
}

function m905rule(): GameQuestion {
  const [m, c] = pick(RULES)
  const xs = [0, 1, 2, 3]
  const ys = xs.map((x) => m * x + c)
  // rules that fit just one pair of the table, or have the step and start mixed up
  const others = RULES.filter(([mm, cc]) => !(mm === m && cc === c))
  const fitsOne = others.filter(([mm, cc]) => xs.some((x, i) => mm * x + cc === ys[i]))
  const pool = [...shuffle(fitsOne), ...shuffle(others)]
  return gq({
    t: 'rule',
    prompt: 'Which rule fits this table of values?',
    diagram: valueTable(xs, ys),
    correct: ex2(ruleText(m, c)),
    wrong: pool.map(([mm, cc]) => ex2(ruleText(mm, cc))),
    why: `Check every pair: ${xs.map((x, i) => `${v('x')} = ${x} gives ${num(ys[i])}`).join(', ')}. The rule is ${ex2(ruleText(m, c))}.`,
    meta: { m, c },
  })
}

const SET_905: GameSet = {
  id: 'ncm7-9.05',
  exercise: '9.05',
  ref: 'NCM 7 Ex 9.05',
  title: 'Completing tables of values',
  focus: 'Substitute into a rule to complete a table, and find the rule that fits every pair.',
  lessons: ['y7-np-table', 'y7-np-rule'],
  outcomes: [LIN],
  makers: [mk('complete', m905complete), mk('rule', m905rule, 2)],
}

// ================================================================== 9.06 Graphing linear equations

function m906onLine(): GameQuestion {
  const [m, c] = pick(RULES)
  const x = int(-2, 4)
  const right: P = [x, m * x + c]
  // the pair swapped, one out, the right y for a different x
  const cands: P[] = [[right[1], right[0]], [x, right[1] + 1], [x + 1, right[1]], [x, right[1] - 1], [x - 1, right[1]]]
  const wrong = cands.filter(([a, b2]) => m * a + c !== b2).map(pt)
  return gq({
    t: 'onLine',
    prompt: `Which point lies on the line ${ex2(ruleText(m, c))}?`,
    correct: pt(right),
    wrong,
    why: `Substitute ${v('x')} = ${num(x)}: ${v('y')} = ${num(right[1])}, so ${pt(right)} is on the line.`,
    meta: { m, c, x },
  })
}

function m906graph(): GameQuestion {
  const [m, c] = pick(RULES.filter(([mm, cc]) => Math.abs(mm) <= 2 && Math.abs(cc) <= 3))
  const others = RULES.filter(([mm, cc]) => !(mm === m && cc === c))
  // likely mix-ups: the step and the start swapped, the same start with another step, the same step with another start
  const near = others.filter(([mm, cc]) => mm === m || cc === c || (mm === c && cc === m))
  return gq({
    t: 'graph',
    prompt: 'Which rule does this line show?',
    diagram: D.numberPlane({ xmin: -4, xmax: 4, ymin: -4, ymax: 6, lines: [{ m, c }] }),
    correct: ex2(ruleText(m, c)),
    wrong: [...shuffle(near), ...shuffle(others)].map(([mm, cc]) => ex2(ruleText(mm, cc))),
    why: `The line crosses the ${v('y')}-axis at ${num(c)} and goes ${m > 0 ? 'up' : 'down'} ${Math.abs(m)} for each 1 across: ${ex2(ruleText(m, c))}.`,
    meta: { m, c },
  })
}

const SET_906: GameSet = {
  id: 'ncm7-9.06',
  exercise: '9.06',
  ref: 'NCM 7 Ex 9.06',
  title: 'Graphing linear equations',
  focus: 'Every point on a line fits its rule: test points, and match a line to its rule.',
  lessons: ['y7-np-rule'],
  outcomes: [LIN],
  makers: [mk('onLine', m906onLine), mk('graph', m906graph, 2)],
}

export const NCM7_CH9: GameChapter = {
  id: 'ncm7-ch9',
  number: 9,
  title: 'Number plane',
  ref: 'NCM 7 Chapter 9',
  strand: 'Number and algebra',
  outcomes: [LIN],
  sets: [SET_901, SET_902, SET_903, SET_904, SET_905, SET_906],
  colour: 190,
  topics: ['y7-number-plane'],
}
