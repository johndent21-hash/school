// Class games for New Century Maths 7 (3rd edition, Cengage) Chapter 2, Angles: one set of quick questions
// for each exercise, 2.01 to 2.11.
//
// The questions are the site's own. Every question is ONE step, done in the head in about 15 seconds,
// with four choices. Every angle is drawn at its true size (the same drawings as the lessons). The wrong
// choices are the usual mistakes: the vertex not in the middle of an angle's name, reading the wrong
// protractor scale, confusing complementary with supplementary, and mixing up corresponding, alternate
// and co-interior angles.
//
// Syllabus: NSW Mathematics K–10 (2022), Stage 4, Angle relationships MA4-ANG-C-01.
import type { GameChapter, GameQuestion, GameSet } from '@/lib/game/types'
import { MINUS, chance, gq, int, mk, num, pick, sample, shuffle } from './helpers'
import * as D from '@/lib/maths/diagrams'
import * as DG from '@/lib/maths/diagrams12'

const ANG = 'MA4-ANG-C-01'
const b = (s: string) => `<b>${s}</b>`
const it = (s: string) => `<i>${s}</i>`
const deg = (x: number) => `${num(x)}°`
const lab = (x: string) => `${it(x)}°`
const CAPS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'.split('')
const VARS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'k', 'm', 'n', 'p', 'q', 'r', 't', 'w', 'x', 'y']
/** three wrong sizes: likely mistakes first, then near misses; never the right size or a size of 0 or less */
function degWrong(right: number, likely: number[]): string[] {
  const out: number[] = []
  for (const x of [...likely, right + 10, right - 10, right + 20, right + 5]) {
    if (x !== right && x > 0 && x <= 360 && !out.includes(x)) out.push(x)
    if (out.length === 3) break
  }
  return out.map((x) => deg(x))
}

/** the same for plain numbers (values of a pronumeral) */
function numWrong(right: number, likely: number[]): string[] {
  return degWrong(right, likely).map((x) => x.replace('°', ''))
}

// ================================================================== 2.01 Naming angles

function m201vertex(): GameQuestion {
  const [a, v, c] = sample(CAPS, 3)
  return gq({
    t: 'vertex',
    prompt: `Which letter is the ${b('vertex')} of ∠${a}${v}${c}?`,
    correct: v,
    inOrder: [a, v, c, sample(CAPS.filter((x) => ![a, v, c].includes(x)), 1)[0]].sort(),
    why: `The middle letter of an angle's name is always its vertex: ${v}.`,
    meta: { name: a + v + c },
  })
}

function m201name(): GameQuestion {
  const [v, p, q, r] = sample(CAPS, 4)
  const d = 5 * int(-2, 6)
  const s1 = 5 * int(6, 10)
  const s2 = 5 * int(6, 10)
  const which = pick([0, 1])
  const [x, y] = which === 0 ? [p, q] : [q, r]
  return gq({
    t: 'name',
    prompt: 'What is the name of the angle marked •?',
    diagram: DG.rays({ vertex: v, arms: [{ name: p, dir: d }, { name: q, dir: d + s1 }, { name: r, dir: d + s1 + s2 }], marks: [{ from: which, to: which + 1, label: '•' }] }),
    correct: `∠${x}${v}${y}`,
    wrong: [`∠${v}${x}${y}`, which === 0 ? `∠${q}${v}${r}` : `∠${p}${v}${q}`, `∠${p}${v}${r}`],
    why: `The • is between the arms ${v}${x} and ${v}${y}, and the vertex ${v} goes in the middle: ∠${x}${v}${y}.`,
    meta: { vertex: v, arms: [x, y], all: [p, q, r] },
  })
}

function m201adjacent(): GameQuestion {
  const [v, p, q, r] = sample(CAPS, 4)
  const d = 5 * int(-2, 6)
  return gq({
    t: 'adjacent',
    prompt: `Which angle is ${b('adjacent')} to ∠${p}${v}${q}?`,
    diagram: DG.rays({ vertex: v, arms: [{ name: p, dir: d }, { name: q, dir: d + 5 * int(6, 10) }, { name: r, dir: d + 5 * int(18, 22) }] }),
    correct: `∠${q}${v}${r}`,
    wrong: [`∠${p}${v}${r}`, `∠${v}${q}${r}`, `∠${q}${r}${v}`],
    why: `∠${q}${v}${r} has the same vertex and shares the arm ${v}${q}, so it is adjacent to ∠${p}${v}${q}.`,
    meta: { vertex: v, p, q, r },
  })
}

const SET_201: GameSet = {
  id: 'ncm7-2.01',
  exercise: '2.01',
  ref: 'NCM 7 Ex 2.01',
  title: 'Naming angles',
  focus: 'Name angles with three letters (the vertex in the middle) and find adjacent angles.',
  lessons: ['y7-ang-naming'],
  outcomes: [ANG],
  makers: [mk('vertex', m201vertex), mk('name', m201name), mk('adjacent', m201adjacent, 2)],
}

// ================================================================== 2.02 Measuring and drawing angles

function m202protractor(): GameQuestion {
  const angle = 10 * int(2, 16)
  const base = pick(['right', 'left'] as const)
  return gq({
    t: 'protractor',
    prompt: `What is the size of this angle?`,
    diagram: DG.protractor({ angle, base }),
    correct: deg(angle),
    wrong: degWrong(angle, [180 - angle, angle + 10, angle - 10]),
    why: `One arm points to 0° on the ${base === 'right' ? 'inside' : 'outside'} scale, so read that scale: ${deg(angle)}.`,
    meta: { angle, base },
  })
}

function m202estimate(): GameQuestion {
  const ladder = pick([
    [20, 60, 110, 160],
    [30, 80, 120, 150],
    [40, 70, 130, 170],
  ])
  const size = pick(ladder)
  return gq({
    t: 'estimate',
    prompt: 'Which is the best estimate of the size of this angle?',
    diagram: DG.turn(size, 15 * int(0, 23)),
    correct: deg(size),
    inOrder: ladder.map((x) => deg(x)),
    why: size < 90 ? `It is smaller than a right angle (90°): about ${deg(size)}.` : `It is bigger than a right angle (90°) but less than a straight angle: about ${deg(size)}.`,
    meta: { size },
  })
}

function m202reflex(): GameQuestion {
  const small = 10 * int(3, 16)
  return gq({
    t: 'reflex',
    prompt: `The smaller angle between two arms is ${b(deg(small))}. What is the ${b('reflex')} angle on the other side?`,
    correct: deg(360 - small),
    wrong: degWrong(360 - small, [180 - small, 180 + small, small]),
    why: `The two angles make a full turn of 360°: 360 ${MINUS} ${small} = ${360 - small}°.`,
    meta: { small },
  })
}

const SET_202: GameSet = {
  id: 'ncm7-2.02',
  exercise: '2.02',
  ref: 'NCM 7 Ex 2.02',
  title: 'Measuring and drawing angles',
  focus: 'Read a protractor on the right scale, estimate angles, and find reflex angles from the angle on the other side.',
  lessons: ['y7-ang-measuring'],
  outcomes: [ANG],
  teacherNote: 'Measuring and drawing with a protractor is revision of earlier stages; the syllabus point for this chapter is using angle relationships.',
  makers: [mk('protractor', m202protractor), mk('estimate', m202estimate), mk('reflex', m202reflex, 2)],
}

// ================================================================== 2.03 Types of angles

const TYPES = ['Acute', 'Right', 'Obtuse', 'Straight', 'Reflex', 'Revolution']
const typeOf = (a: number) => (a < 90 ? 'Acute' : a === 90 ? 'Right' : a < 180 ? 'Obtuse' : a === 180 ? 'Straight' : a < 360 ? 'Reflex' : 'Revolution')
const RULE: Record<string, string> = {
  Acute: 'less than 90°',
  Right: 'exactly 90°',
  Obtuse: 'between 90° and 180°',
  Straight: 'exactly 180°',
  Reflex: 'between 180° and 360°',
  Revolution: 'exactly 360°',
}
/** four of the six types, in their usual order, always including the right one */
function fourTypes(right: string): string[] {
  const others = sample(TYPES.filter((t) => t !== right), 3)
  return TYPES.filter((t) => t === right || others.includes(t))
}

function m203size(): GameQuestion {
  const a = pick([int(10, 85), int(95, 175), int(185, 355), 90, 180, 360])
  const t = typeOf(a)
  return gq({
    t: 'size',
    prompt: `What type of angle is ${b(deg(a))}?`,
    correct: t,
    inOrder: fourTypes(t),
    why: `${t} angles are ${RULE[t]}.`,
    meta: { a },
  })
}

function m203drawn(): GameQuestion {
  const a = pick([5 * int(5, 15), 90, 5 * int(21, 33), 180, 10 * int(20, 34)])
  const t = typeOf(a)
  return gq({
    t: 'drawn',
    prompt: 'What type of angle is shown?',
    diagram: DG.turn(a, 15 * int(0, 23)),
    correct: t,
    inOrder: fourTypes(t),
    why: `It is ${RULE[t]}: ${t === 'Acute' || t === 'Obtuse' ? 'an' : 'a'} ${t.toLowerCase()} angle.`,
    meta: { a },
  })
}

function m203turn(): GameQuestion {
  const [what, size] = pick([
    ['a quarter turn', 90],
    ['a half turn', 180],
    ['a full turn', 360],
    ['three-quarters of a turn', 270],
  ] as [string, number][])
  return gq({
    t: 'turn',
    prompt: `How many degrees are in ${b(what)}?`,
    correct: deg(size),
    inOrder: [90, 180, 270, 360].map((x) => deg(x)),
    why: `A full turn is 360°, so ${what} is ${deg(size)}.`,
    meta: { size },
  })
}

function m203which(): GameQuestion {
  const want = pick(['Acute', 'Obtuse', 'Reflex'])
  const sizes = [int(10, 85), int(95, 175), int(185, 350), pick([90, 180])]
  return gq({
    t: 'which',
    prompt: `Which of these is ${b(want === 'Acute' || want === 'Obtuse' ? `an ${want.toLowerCase()}` : `a ${want.toLowerCase()}`)} angle?`,
    correct: deg(sizes[['Acute', 'Obtuse', 'Reflex'].indexOf(want)]),
    inOrder: sizes.slice().sort((x, y) => x - y).map((x) => deg(x)),
    why: `${want} angles are ${RULE[want]}: ${deg(sizes[['Acute', 'Obtuse', 'Reflex'].indexOf(want)])}.`,
    meta: { want, sizes },
  })
}

const SET_203: GameSet = {
  id: 'ncm7-2.03',
  exercise: '2.03',
  ref: 'NCM 7 Ex 2.03',
  title: 'Types of angles',
  focus: 'Classify angles as acute, right, obtuse, straight, reflex or a revolution.',
  lessons: ['y7-ang-classify'],
  outcomes: [ANG],
  makers: [mk('size', m203size), mk('drawn', m203drawn), mk('turn', m203turn), mk('which', m203which, 2)],
}

// ================================================================== 2.04 Complementary and supplementary angles

function m204complement(): GameQuestion {
  const a = int(5, 85)
  return gq({
    t: 'complement',
    prompt: `What is the ${b('complement')} of ${deg(a)}?`,
    correct: deg(90 - a),
    wrong: degWrong(90 - a, [180 - a, 360 - a, a]),
    why: `Complementary angles add to 90°: 90 ${MINUS} ${a} = ${90 - a}°.`,
    meta: { a },
  })
}

function m204supplement(): GameQuestion {
  const a = int(5, 175)
  return gq({
    t: 'supplement',
    prompt: `What is the ${b('supplement')} of ${deg(a)}?`,
    correct: deg(180 - a),
    wrong: degWrong(180 - a, [a < 90 ? 90 - a : a - 90, 360 - a, a]),
    why: `Supplementary angles add to 180°: 180 ${MINUS} ${a} = ${180 - a}°.`,
    meta: { a },
  })
}

function m204line(): GameQuestion {
  let a: number
  do a = int(25, 155)
  while (Math.abs(a - 90) < 6)
  const x = pick(VARS)
  const first = chance()
  return gq({
    t: 'line',
    prompt: `The angles are on a straight line. Find ${it(x)}.`,
    diagram: D.anglesOnLine(first ? [a, 180 - a] : [180 - a, a], first ? [deg(a), lab(x)] : [lab(x), deg(a)]),
    correct: num(180 - a),
    wrong: numWrong(180 - a, [Math.abs(90 - a), a, 360 - a]),
    why: `Angles on a straight line add to 180°: ${it(x)} = 180 ${MINUS} ${a} = ${180 - a}.`,
    meta: { a },
  })
}

function m204right(): GameQuestion {
  const a = int(15, 75)
  const x = pick(VARS)
  return gq({
    t: 'right',
    prompt: `The angles make a right angle. Find ${it(x)}.`,
    diagram: D.splitAngle([a, 90 - a], [deg(a), lab(x)], true),
    correct: num(90 - a),
    wrong: numWrong(90 - a, [180 - a, a, 90 + a]),
    why: `Angles in a right angle add to 90°: ${it(x)} = 90 ${MINUS} ${a} = ${90 - a}.`,
    meta: { a },
  })
}

const SET_204: GameSet = {
  id: 'ncm7-2.04',
  exercise: '2.04',
  ref: 'NCM 7 Ex 2.04',
  title: 'Complementary and supplementary angles',
  focus: 'Complementary angles add to 90°; supplementary angles add to 180°.',
  lessons: ['y7-ang-compsupp'],
  outcomes: [ANG],
  makers: [mk('complement', m204complement), mk('supplement', m204supplement), mk('right', m204right), mk('line', m204line)],
}

// ================================================================== 2.05 Angles at a point and vertically opposite angles

function crossTheta(): number {
  let t: number
  do t = int(35, 145)
  while (t > 80 && t < 100)
  return t
}

function m205vertOpp(): GameQuestion {
  const theta = crossTheta()
  const i = int(0, 3)
  const a = i % 2 === 0 ? theta : 180 - theta
  const x = pick(VARS)
  const labels = ['', '', '', '']
  labels[i] = deg(a)
  labels[(i + 2) % 4] = lab(x)
  return gq({
    t: 'vertOpp',
    prompt: `Two straight lines cross. Find ${it(x)}.`,
    diagram: D.crossingLines(theta, labels),
    correct: num(a),
    wrong: numWrong(a, [180 - a, 360 - a, Math.abs(90 - a)]),
    why: `Vertically opposite angles are equal: ${it(x)} = ${a}.`,
    meta: { a },
  })
}

function m205beside(): GameQuestion {
  const theta = crossTheta()
  const i = int(0, 3)
  const a = i % 2 === 0 ? theta : 180 - theta
  const x = pick(VARS)
  const labels = ['', '', '', '']
  labels[i] = deg(a)
  labels[(i + pick([1, 3])) % 4] = lab(x)
  return gq({
    t: 'beside',
    prompt: `Two straight lines cross. Find ${it(x)}.`,
    diagram: D.crossingLines(theta, labels),
    correct: num(180 - a),
    wrong: numWrong(180 - a, [a, 360 - a, Math.abs(90 - a)]),
    why: `${it(x)} and ${a}° are on a straight line: ${it(x)} = 180 ${MINUS} ${a} = ${180 - a}.`,
    meta: { a },
  })
}

function m205point(): GameQuestion {
  let p: number, r: number
  do {
    p = 10 * int(6, 15)
    r = 10 * int(6, 15)
  } while (p + r > 300 || p + r < 160 || 360 - p - r === 180)
  const u = 360 - p - r
  const x = pick(VARS)
  const order = shuffle([
    { s: p, l: deg(p) },
    { s: r, l: deg(r) },
    { s: u, l: lab(x) },
  ])
  let d = 5 * int(0, 11)
  const arms = order.map((o) => {
    const arm = { name: '', dir: d }
    d += o.s
    return arm
  })
  return gq({
    t: 'point',
    prompt: `The angles meet at a point. Find ${it(x)}.`,
    diagram: DG.rays({ vertex: '', arms, marks: order.map((o, k) => ({ from: k, to: (k + 1) % 3, label: o.l, r: 22 + (k % 2) * 7 })), len: 104 }),
    correct: num(u),
    wrong: numWrong(u, [180 - p - r, p + r, u + 10]),
    why: `Angles at a point add to 360°: ${it(x)} = 360 ${MINUS} ${p} ${MINUS} ${r} = ${u}.`,
    meta: { p, r },
  })
}

const SET_205: GameSet = {
  id: 'ncm7-2.05',
  exercise: '2.05',
  ref: 'NCM 7 Ex 2.05',
  title: 'Angles at a point and vertically opposite angles',
  focus: 'Angles at a point add to 360°; vertically opposite angles are equal.',
  lessons: ['y7-ang-point'],
  outcomes: [ANG],
  makers: [mk('vertOpp', m205vertOpp), mk('beside', m205beside), mk('point', m205point, 2)],
}

// ================================================================== 2.06 Parallel and perpendicular lines

function m206symbol(): GameQuestion {
  const par = chance()
  return gq({
    t: 'symbol',
    prompt: `What does the symbol ${b(par ? '∥' : '⊥')} mean?`,
    correct: par ? 'is parallel to' : 'is perpendicular to',
    inOrder: ['is parallel to', 'is perpendicular to', 'is equal to', 'is an angle of'],
    why: par ? '∥ means “is parallel to”: two lines that never meet.' : '⊥ means “is perpendicular to”: lines that meet at a right angle.',
    meta: { par },
  })
}

function m206relation(): GameQuestion {
  const [a, c, d, e] = sample(CAPS, 4)
  const rel = pick(['parallel', 'perpendicular', 'intersecting'] as const)
  const turn = 5 * int(-6, 6)
  const cos = (x: number) => Math.cos((x * Math.PI) / 180)
  const sin = (x: number) => Math.sin((x * Math.PI) / 180)
  let diagram: string
  if (rel === 'parallel') diagram = DG.lineSet({ lines: [{ a, b: c, p: [0, 2.4], q: [7, 2.4], arrows: 1 }, { a: d, b: e, p: [0.6, 0], q: [7.6, 0], arrows: 1 }], turn })
  else if (rel === 'perpendicular') diagram = DG.lineSet({ lines: [{ a, b: c, p: [0, 0], q: [7, 0] }, { a: d, b: e, p: [3.5, -2.4], q: [3.5, 2.8] }], rights: [{ at: [3.5, 0], dir: 0 }], turn })
  else {
    const th = pick([40, 50, 130, 140])
    diagram = DG.lineSet({ lines: [{ a, b: c, p: [0, 0], q: [7, 0] }, { a: d, b: e, p: [3.5 - 2.6 * cos(th), -2.6 * sin(th)], q: [3.5 + 3 * cos(th), 3 * sin(th)] }], turn })
  }
  const right = rel === 'parallel' ? `${a}${c} ∥ ${d}${e}` : rel === 'perpendicular' ? `${a}${c} ⊥ ${d}${e}` : 'Neither'
  return gq({
    t: 'relation',
    prompt: 'Which is true for these two lines?',
    diagram,
    correct: right,
    inOrder: [`${a}${c} ∥ ${d}${e}`, `${a}${c} ⊥ ${d}${e}`, `${a}${c} = ${d}${e}`, 'Neither'],
    why: rel === 'parallel' ? 'Matching arrowheads show parallel lines.' : rel === 'perpendicular' ? 'The small square shows a right angle: the lines are perpendicular.' : 'The lines cross, but not at a right angle: they are neither parallel nor perpendicular.',
    meta: { rel },
  })
}

const SET_206: GameSet = {
  id: 'ncm7-2.06',
  exercise: '2.06',
  ref: 'NCM 7 Ex 2.06',
  title: 'Parallel and perpendicular lines',
  focus: 'Recognise parallel and perpendicular lines and use the symbols ∥ and ⊥.',
  lessons: ['y7-ang-lines'],
  outcomes: [ANG],
  teacherNote: 'The textbook’s compass constructions are left for hands-on work in books.',
  makers: [mk('symbol', m206symbol), mk('relation', m206relation)],
}

// ================================================================== 2.07 to 2.11 two lines and a transversal

type Rel = 'corresponding' | 'alternate' | 'co-interior'
type Spot = { at: 0 | 1; pos: DG.Pos }
const PAIRS: Record<Rel, [DG.Pos, DG.Pos][]> = {
  corresponding: [
    [0, 0],
    [1, 1],
    [2, 2],
    [3, 3],
  ],
  alternate: [
    [2, 0],
    [3, 1],
  ],
  'co-interior': [
    [2, 1],
    [3, 0],
  ],
}
const sizeAt = (theta: number, pos: DG.Pos) => (pos % 2 === 0 ? theta : 180 - theta)
const RULE_TEXT: Record<Rel, string> = {
  corresponding: 'Corresponding angles on parallel lines are equal',
  alternate: 'Alternate angles on parallel lines are equal',
  'co-interior': 'Co-interior angles on parallel lines add to 180°',
}
function pairOf(rel: Rel): { g: Spot; o: Spot } {
  const [p0, p1] = pick(PAIRS[rel])
  return chance() ? { g: { at: 0, pos: p0 }, o: { at: 1, pos: p1 } } : { g: { at: 1, pos: p1 }, o: { at: 0, pos: p0 } }
}
function lay(): { rot: number; theta: number } {
  let theta: number
  do theta = int(50, 130)
  while (theta > 80 && theta < 100)
  return { rot: pick([0, 0, 15, -15]), theta }
}

/** find the unknown: equal for corresponding and alternate angles, 180 − for co-interior */
function relFind(rel: Rel): GameQuestion {
  const L = lay()
  const { g, o } = pairOf(rel)
  const a = sizeAt(L.theta, g.pos)
  const x = pick(VARS)
  const ans = rel === 'co-interior' ? 180 - a : a
  return gq({
    t: 'find',
    prompt: `The lines with arrows are parallel. Find ${it(x)}.`,
    diagram: DG.transversal({ ...L, marks: [{ ...g, label: deg(a) }, { ...o, label: lab(x) }] }),
    correct: num(ans),
    wrong: numWrong(ans, [180 - ans, 360 - a, Math.abs(90 - a)]),
    why: rel === 'co-interior' ? `${RULE_TEXT[rel]}: ${it(x)} = 180 ${MINUS} ${a} = ${ans}.` : `${RULE_TEXT[rel]}: ${it(x)} = ${a}.`,
    meta: { rel, a },
  })
}

/** which lettered angle is in the given relationship to the angle marked • */
function relLetter(rel: Rel): GameQuestion {
  const L = lay()
  const { g, o } = pairOf(rel)
  const ls = shuffle(pick([['a', 'b', 'c', 'd'], ['e', 'f', 'g', 'h'], ['p', 'q', 'r', 't'], ['w', 'x', 'y', 'k']]))
  return gq({
    t: 'letter',
    prompt: `The lines with arrows are parallel. Which angle is ${b(rel)} to the angle marked •?`,
    diagram: DG.transversal({ ...L, marks: [{ ...g, label: '•' }, ...([0, 1, 2, 3] as DG.Pos[]).map((pos) => ({ at: o.at, pos, label: it(ls[pos]) }))] }),
    correct: it(ls[o.pos]),
    inOrder: ls.slice().sort().map((x) => it(x)),
    why:
      rel === 'corresponding'
        ? `Angle ${it(ls[o.pos])} is in the matching position at the other crossing.`
        : rel === 'alternate'
          ? `Angle ${it(ls[o.pos])} is between the lines, on the other side of the transversal.`
          : `Angle ${it(ls[o.pos])} is between the lines, on the same side of the transversal.`,
    meta: { rel, ans: ls[o.pos] },
  })
}

const relSet = (ex: string, rel: Rel, title: string, lesson: string): GameSet => ({
  id: `ncm7-${ex}`,
  exercise: ex,
  ref: `NCM 7 Ex ${ex}`,
  title,
  focus: `${RULE_TEXT[rel]}.`,
  lessons: [lesson],
  outcomes: [ANG],
  makers: [mk('letter', () => relLetter(rel)), mk('find', () => relFind(rel))],
})

const SET_207 = relSet('2.07', 'corresponding', 'Corresponding angles on parallel lines', 'y7-ang-corresponding')
const SET_208 = relSet('2.08', 'alternate', 'Alternate angles on parallel lines', 'y7-ang-alternate')
const SET_209 = relSet('2.09', 'co-interior', 'Co-interior angles on parallel lines', 'y7-ang-cointerior')

function m210name(): GameQuestion {
  const L = lay()
  const kind = pick(['corresponding', 'alternate', 'co-interior', 'vertically opposite'] as const)
  let s1: Spot
  let s2: Spot
  if (kind === 'vertically opposite') {
    const c = pick([0, 1] as const)
    const p = pick([0, 1] as DG.Pos[])
    s1 = { at: c, pos: p }
    s2 = { at: c, pos: ((p + 2) % 4) as DG.Pos }
  } else {
    const pr = pairOf(kind)
    s1 = pr.g
    s2 = pr.o
  }
  const names = ['Corresponding', 'Alternate', 'Co-interior', 'Vertically opposite']
  return gq({
    t: 'name',
    prompt: 'What kind of angles are the two angles marked •?',
    diagram: DG.transversal({ ...L, marks: [{ ...s1, label: '•' }, { ...s2, label: '•' }] }),
    correct: names[['corresponding', 'alternate', 'co-interior', 'vertically opposite'].indexOf(kind)],
    inOrder: names,
    why: {
      corresponding: 'They are in matching positions at the two crossings.',
      alternate: 'They are between the lines, on opposite sides of the transversal.',
      'co-interior': 'They are between the lines, on the same side of the transversal.',
      'vertically opposite': 'They are at the same crossing, facing each other.',
    }[kind],
    meta: { kind },
  })
}

function m210mixed(): GameQuestion {
  return relFind(pick(['corresponding', 'alternate', 'co-interior'] as Rel[]))
}

const SET_210: GameSet = {
  id: 'ncm7-2.10',
  exercise: '2.10',
  ref: 'NCM 7 Ex 2.10',
  title: 'Angles on parallel lines',
  focus: 'Choose the right relationship (corresponding, alternate or co-interior) to find unknown angles.',
  lessons: ['y7-ang-parallel'],
  outcomes: [ANG],
  makers: [mk('name', m210name), mk('find', m210mixed)],
}

const PROVE = ['Yes: alternate angles are equal', 'Yes: corresponding angles are equal', 'Yes: co-interior angles add to 180°', 'No']

function m211prove(): GameQuestion {
  const rel = pick(['alternate', 'corresponding', 'co-interior'] as Rel[])
  const parallel = chance()
  const L = lay()
  const theta2 = parallel ? L.theta : L.theta + pick([-9, -7, -5, 5, 7, 9])
  const [p0, p1] = pick(PAIRS[rel])
  const a = sizeAt(L.theta, p0)
  const c = sizeAt(theta2, p1)
  const [l1, l2, l3, l4] = sample(CAPS, 4)
  return gq({
    t: 'prove',
    prompt: `Is ${l1}${l2} parallel to ${l3}${l4}?`,
    diagram: DG.transversal({ rot: L.rot, theta: L.theta, theta2, arrows: false, marks: [{ at: 0, pos: p0, label: deg(a) }, { at: 1, pos: p1, label: deg(c) }], names: { l0: [l1, l2], l1: [l3, l4] } }),
    correct: parallel ? PROVE[['alternate', 'corresponding', 'co-interior'].indexOf(rel)] : 'No',
    inOrder: PROVE,
    why: parallel
      ? `They are ${rel} angles, and they ${rel === 'co-interior' ? `add to ${a + c}°` : 'are equal'}, so the lines are parallel.`
      : `They are ${rel} angles, but ${rel === 'co-interior' ? `they add to ${a + c}°, not 180°` : `${a}° and ${c}° are not equal`}, so the lines are not parallel.`,
    meta: { rel, a, c },
  })
}

function m211value(): GameQuestion {
  const rel = pick(['alternate', 'corresponding', 'co-interior'] as Rel[])
  const L = lay()
  const { g, o } = pairOf(rel)
  const a = sizeAt(L.theta, g.pos)
  const x = pick(VARS)
  const ans = rel === 'co-interior' ? 180 - a : a
  const [l1, l2, l3, l4] = sample(CAPS, 4)
  return gq({
    t: 'value',
    prompt: `Which value of ${it(x)} would make ${l1}${l2} parallel to ${l3}${l4}?`,
    diagram: DG.transversal({ ...L, arrows: false, marks: [{ ...g, label: deg(a) }, { ...o, label: lab(x) }], names: { l0: [l1, l2], l1: [l3, l4] } }),
    correct: num(ans),
    wrong: numWrong(ans, [180 - ans, 360 - a, Math.abs(90 - a)]),
    why: rel === 'co-interior' ? `Co-interior angles must add to 180°: ${it(x)} = 180 ${MINUS} ${a} = ${ans}.` : `${rel[0].toUpperCase() + rel.slice(1)} angles must be equal: ${it(x)} = ${a}.`,
    meta: { rel, a },
  })
}

const SET_211: GameSet = {
  id: 'ncm7-2.11',
  exercise: '2.11',
  ref: 'NCM 7 Ex 2.11',
  title: 'Proving parallel lines',
  focus: 'Lines are parallel if alternate or corresponding angles are equal, or co-interior angles add to 180°.',
  lessons: ['y7-ang-proving'],
  outcomes: [ANG],
  makers: [mk('prove', m211prove), mk('value', m211value)],
}

export const NCM7_CH2: GameChapter = {
  id: 'ncm7-ch2',
  number: 2,
  title: 'Angles',
  ref: 'NCM 7 Chapter 2',
  strand: 'Measurement and space',
  outcomes: [ANG],
  sets: [SET_201, SET_202, SET_203, SET_204, SET_205, SET_206, SET_207, SET_208, SET_209, SET_210, SET_211],
  colour: 18,
  topics: ['y7-angles'],
}
