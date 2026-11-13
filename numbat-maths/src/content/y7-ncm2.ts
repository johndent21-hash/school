// Year 7 Angles, following New Century Maths 7 (3rd edition, Cengage) Chapter 2 exercise by exercise.
// The questions are the site's own: they practise the same kinds of question as each exercise, in the
// same easy-to-hard order (Foundation = the start of the exercise, Challenge = the end), but none of the
// textbook's wording, numbers or diagrams are copied. Drawing and construction tasks (which can't be marked
// on a screen) are replaced by reading, choosing and reasoning questions about the same ideas.
// Every diagram is drawn to scale from the question's own numbers.
import type { Level, Question, Skill, TestItem } from '@/lib/maths/types'
import { D, D2, DIVIDE, MINUS, TIMES, chance, deg, int, mcA, mcFixedA, name, num, numA, pick, q, sample, shuffle, tolA, v } from './helpers'
import * as DG from '@/lib/maths/diagrams12'
import { fig } from '@/lib/maths/diagrams6'

export const OUTCOMES = ['MA4-ANG-C-01']

type Pos = DG.Pos
const big = (s: string) => `<div class="big">${s}</div>`
const it = (s: string) => `<i>${s}</i>`
/** ∠PQR */
const A = (s: string) => `∠${s}`
/** an angle's label on a diagram: a size (65°) or a pronumeral (x°) */
const dl = (a: number) => `${num(a)}°`
const lab = (x: string) => `${it(x)}°`
// capital letters for points (no I or O, which look like 1 and 0)
const CAPS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'.split('')
const letters = (k: number) => sample(CAPS, k)
// pronumerals for unknown angles (no i, j, l, o, s, u, v or z, which are easy to misread)
const VARS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'k', 'm', 'n', 'p', 'q', 'r', 't', 'w', 'x', 'y']
const pron = () => pick(VARS)
/** a, b and c */
const listOf = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`)
const PAR = '∥'
const PERP = '⊥'

/** k arms in anticlockwise order from one vertex, with gaps of lo to hi degrees (multiples of 5) between them */
function fan(k: number, lo: number, hi: number): { vertex: string; arms: { name: string; dir: number }[] } {
  const ls = letters(k + 1)
  let d = 5 * int(-2, 6)
  const arms: { name: string; dir: number }[] = []
  for (let i = 0; i < k; i++) {
    arms.push({ name: ls[i + 1], dir: d })
    d += 5 * int(lo / 5, hi / 5)
  }
  return { vertex: ls[0], arms }
}

/** Angles round a point, in order anticlockwise. labels: the words beside each arc; '' for a bare arc (a square, if 90°); null for no mark. */
function roundPoint(sizes: number[], labels: (string | null)[], start = 15): string {
  let d = start
  const arms = sizes.map((s) => {
    const a = { name: '', dir: d }
    d += s
    return a
  })
  const marks = labels.flatMap((l, i) => (l === null ? [] : [{ from: i, to: (i + 1) % sizes.length, label: l, r: 22 + (i % 2) * 7 }]))
  return DG.rays({ vertex: '', arms, marks, len: 104 })
}

// ================================================================== 2.01 Naming angles

function lineKindQ(): Question {
  const [a, b] = letters(2)
  const kind = pick(['line', 'ray', 'interval'] as const)
  const options = [`The line ${a}${b}`, `The ray ${a}${b}`, `The interval ${a}${b}`, `The point ${a}`]
  const steps = {
    line: ['There is an arrow at both ends, so it goes on forever in both directions.', `It is the line ${a}${b}.`],
    ray: [`It starts at the point ${a} and has an arrow at the other end, so it goes on forever in one direction only.`, `It is the ray ${a}${b}.`],
    interval: ['It has a point at each end and no arrows, so it has a definite length.', `It is the interval ${a}${b} (also called a line segment).`],
  }[kind]
  return q({
    prompt: 'What does this diagram show?',
    diagram: DG.lineKind(kind, a, b, pick([-24, -12, 0, 14, 24])),
    answer: mcFixedA(options, options[['line', 'ray', 'interval'].indexOf(kind)]),
    hint: 'Count the arrows. A line has an arrow at both ends, a ray has one arrow, and an interval has none.',
    steps,
    meta: { t: 'lineKind', kind },
  })
}

function vertexQ(): Question {
  const [a, b, c] = letters(3)
  const nm = a + b + c
  if (chance(0.6))
    return q({
      prompt: `Which letter is at the vertex of ${A(nm)}?`,
      answer: mcFixedA([a, b, c].sort(), b),
      hint: 'The vertex is the point where the two arms meet. Look at the middle letter of the name.',
      steps: ['The middle letter always names the vertex.', `The vertex of ${A(nm)} is ${b}.`],
      meta: { t: 'vertex', name: nm },
    })
  return q({
    prompt: `What are the two arms of ${A(nm)}?`,
    answer: mcA(`${b}${a} and ${b}${c}`, [`${a}${b} and ${a}${c}`, `${c}${a} and ${c}${b}`, `${a}${c} and ${c}${a}`]),
    hint: 'Both arms start at the vertex, which is the middle letter of the name.',
    steps: [`The vertex is the middle letter, ${b}.`, `The arms go from ${b} to each of the other letters: ${b}${a} and ${b}${c}.`],
    meta: { t: 'arms', name: nm },
  })
}

/** one angle with a letter on its vertex and on each arm */
function oneAngle() {
  const [p, vx, r] = letters(3)
  const d = 15 * int(0, 23)
  const size = pick([35, 50, 65, 80, 100, 120, 140])
  const diagram = DG.rays({ vertex: vx, arms: [{ name: p, dir: d }, { name: r, dir: d + size }], marks: [{ from: 0, to: 1 }] })
  return { p, vx, r, diagram }
}

function nameSingle(): Question {
  const { p, vx, r, diagram } = oneAngle()
  const right = chance() ? p + vx + r : r + vx + p
  const wrong = shuffle([vx + p + r, p + r + vx, r + p + vx, vx + r + p]).slice(0, 3)
  return q({
    prompt: 'Which is a correct name for the angle shown?',
    diagram,
    answer: mcA(A(right), wrong.map(A)),
    hint: 'Start at the end of one arm, go to the vertex, then go to the end of the other arm. The vertex letter is in the middle.',
    steps: [`The vertex is ${vx}, so ${vx} must be the middle letter.`, `The angle is ${A(p + vx + r)} or ${A(r + vx + p)}. It can also be called ${A(vx)}, because it is the only angle at ${vx}.`],
    meta: { t: 'nameSingle', vertex: vx, arms: [p, r] },
  })
}

function nameNot(): Question {
  const { p, vx, r, diagram } = oneAngle()
  const wrong = pick([vx + p + r, p + r + vx, r + p + vx, vx + r + p])
  return q({
    prompt: 'Which of these is <b>not</b> a correct name for the angle shown?',
    diagram,
    answer: mcA(A(wrong), [A(vx), A(p + vx + r), A(r + vx + p)]),
    hint: 'In a 3-letter name, the vertex must be the middle letter.',
    steps: [`The vertex is ${vx}. The angle can be named ${A(vx)}, ${A(p + vx + r)} or ${A(r + vx + p)}.`, `${A(wrong)} is not correct: its middle letter is ${wrong[1]}, which is not the vertex.`],
    meta: { t: 'nameNot', vertex: vx, arms: [p, r] },
  })
}

function nameMarked(): Question {
  const fn = fan(3, 30, 55)
  const [a, b, c] = fn.arms.map((x) => x.name)
  const vx = fn.vertex
  const which = pick([0, 1])
  const [r1, r2] = which === 0 ? [a, b] : [b, c]
  const [o1, o2] = which === 0 ? [b, c] : [a, b]
  const flip = chance()
  return q({
    prompt: 'Name the angle marked •.',
    diagram: DG.rays({ ...fn, marks: [{ from: which, to: which + 1, label: '•' }] }),
    answer: mcA(A(flip ? r2 + vx + r1 : r1 + vx + r2), [A(o1 + vx + o2), A(a + vx + c), A(vx)]),
    hint: 'Find the two arms on either side of the •. Name the angle from the end of one arm, through the vertex, to the end of the other arm.',
    steps: [
      `The • is between the arms ${vx}${r1} and ${vx}${r2}.`,
      `The angle is ${A(r1 + vx + r2)} (or ${A(r2 + vx + r1)}).`,
      `${A(vx)} is not clear enough here, because 3 different angles have their vertex at ${vx}.`,
    ],
    meta: { t: 'nameMarked', vertex: vx, arms: [r1, r2], sym: '•' },
  })
}

function sharedArm(): Question {
  const fn = fan(3, 30, 55)
  const [a, b, c] = fn.arms.map((x) => x.name)
  const vx = fn.vertex
  return q({
    prompt: `${A(a + vx + b)} and ${A(b + vx + c)} are adjacent angles. Which arm do they share?`,
    diagram: DG.rays(fn),
    answer: mcA(`${vx}${b}`, [`${vx}${a}`, `${vx}${c}`, `${a}${c}`]),
    hint: 'Adjacent angles are next to each other. Which arm belongs to both angles?',
    steps: [`${A(a + vx + b)} has arms ${vx}${a} and ${vx}${b}. ${A(b + vx + c)} has arms ${vx}${b} and ${vx}${c}.`, `They share the arm ${vx}${b}, and lie on either side of it.`],
    meta: { t: 'sharedArm', vertex: vx, arms: [a, b, c] },
  })
}

function adjacentQ(level: Level): Question {
  if (level < 3) {
    const fn = fan(3, 30, 55)
    const [a, b, c] = fn.arms.map((x) => x.name)
    const vx = fn.vertex
    const first = chance()
    const [t1, t2] = first ? [a, b] : [b, c]
    const [r1, r2] = first ? [b, c] : [a, b]
    return q({
      prompt: `Which angle is adjacent to ${A(t1 + vx + t2)}?`,
      diagram: DG.rays(fn),
      answer: mcA(A(r1 + vx + r2), [A(vx + b + (first ? c : a)), A(a + c + vx), A(b + (first ? a : c) + vx)]),
      hint: 'Adjacent angles have the same vertex and share an arm. The vertex is always the middle letter.',
      steps: [`${A(t1 + vx + t2)} and ${A(r1 + vx + r2)} both have their vertex at ${vx} and share the arm ${vx}${b}.`, `So ${A(r1 + vx + r2)} is adjacent to ${A(t1 + vx + t2)}.`],
      meta: { t: 'adjacent', vertex: vx, target: [t1, t2], answer: [r1, r2] },
    })
  }
  // five arms: the wrong choices are angles that share no arm with the one asked about
  const fn = fan(5, 30, 40)
  const ns = fn.arms.map((x) => x.name)
  const vx = fn.vertex
  const i = int(0, 3)
  const j = i === 0 ? 1 : i === 3 ? 2 : pick([i - 1, i + 1])
  const others = [0, 1, 2, 3, 4].filter((k) => k !== i && k !== i + 1)
  const wrong = [
    [others[0], others[1]],
    [others[1], others[2]],
    [others[0], others[2]],
  ].map(([x, y]) => A(ns[x] + vx + ns[y]))
  const shared = j < i ? ns[i] : ns[i + 1]
  return q({
    prompt: `Which angle is adjacent to ${A(ns[i] + vx + ns[i + 1])}?`,
    diagram: DG.rays(fn),
    answer: mcA(A(ns[j] + vx + ns[j + 1]), wrong),
    hint: `Adjacent angles share an arm. Look for an angle that also has ${vx}${ns[i]} or ${vx}${ns[i + 1]} as an arm.`,
    steps: [`${A(ns[i] + vx + ns[i + 1])} has arms ${vx}${ns[i]} and ${vx}${ns[i + 1]}.`, `${A(ns[j] + vx + ns[j + 1])} shares the arm ${vx}${shared} and lies on the other side of it, so it is adjacent.`, 'The other choices do not share an arm with it.'],
    meta: { t: 'adjacent', vertex: vx, target: [ns[i], ns[i + 1]], answer: [ns[j], ns[j + 1]] },
  })
}

function markedTwo(): Question {
  const fn = fan(4, 30, 50)
  const ns = fn.arms.map((x) => x.name)
  const vx = fn.vertex
  const [i, j] = sample([0, 1, 2], 2)
  const askCross = chance()
  const k = askCross ? j : i
  const rest = [0, 1, 2].filter((x) => x !== k)
  return q({
    prompt: `Two angles are marked on this diagram. Name the angle marked ${askCross ? '×' : '•'}.`,
    diagram: DG.rays({ ...fn, marks: [{ from: i, to: i + 1, label: '•' }, { from: j, to: j + 1, label: '×' }] }),
    answer: mcA(A(ns[k] + vx + ns[k + 1]), [...rest.map((x) => A(ns[x] + vx + ns[x + 1])), A(ns[0] + vx + ns[3])]),
    hint: `Find the two arms on either side of the ${askCross ? '×' : '•'}. The vertex goes in the middle of the name.`,
    steps: [`The ${askCross ? '×' : '•'} is between the arms ${vx}${ns[k]} and ${vx}${ns[k + 1]}.`, `The angle is ${A(ns[k] + vx + ns[k + 1])} (or ${A(ns[k + 1] + vx + ns[k])}).`],
    meta: { t: 'nameMarked', vertex: vx, arms: [ns[k], ns[k + 1]], sym: askCross ? '×' : '•' },
  })
}

function countAngles(): Question {
  const k = pick([3, 4, 5])
  const fn = fan(k, 25, 35)
  const ns = fn.arms.map((x) => x.name)
  const vx = fn.vertex
  const rows: string[] = []
  const counts: number[] = []
  for (let span = 1; span < k; span++) {
    const list = Array.from({ length: k - span }, (_, i) => A(ns[i] + vx + ns[i + span]))
    counts.push(list.length)
    rows.push(`${span === 1 ? 'Between arms next to each other' : `Spanning ${span} gaps`}: ${list.join(', ')} (${list.length})`)
  }
  return q({
    prompt: `${k} arms meet at the point ${vx}. How many different angles have ${vx} as their vertex? Count every angle between 2 of the arms, but not reflex angles.`,
    diagram: DG.rays(fn),
    answer: numA((k * (k - 1)) / 2),
    hint: 'Count the small angles first, then the angles made from 2 small angles side by side, and so on.',
    steps: [...rows, `Total = ${counts.join(' + ')} = ${(k * (k - 1)) / 2}`],
    meta: { t: 'countAngles', k },
  })
}

export const ex201 = (level: Level): Question => {
  if (level === 1) return pick([lineKindQ, vertexQ, nameSingle])()
  if (level === 2) return pick([nameMarked, nameNot, sharedArm, () => adjacentQ(2)])()
  return pick([markedTwo, () => adjacentQ(3), countAngles])()
}

// ================================================================== 2.02 Measuring and drawing angles

function protractorRead(level: Level): Question {
  const base = level === 1 ? 'right' : pick(['right', 'left'] as const)
  let angle = level === 1 ? 10 * int(2, 16) : 5 * int(3, 33)
  if (level === 3) do angle = int(12, 168)
  while (angle % 5 === 0)
  const [a, o, b] = letters(3)
  const scale = base === 'right' ? 'inside' : 'outside'
  return q({
    prompt: `Use the protractor to find the size of ${A(a + o + b)}${level === 3 ? ', to the nearest degree' : ''}.`,
    diagram: DG.protractor({ angle, base, names: [a, o, b] }),
    answer: level === 3 ? tolA(angle, 1) : numA(angle),
    suffix: '°',
    hint: `The arm ${o}${a} lies along the base line. Start from the 0° it points to and read that scale.`,
    steps: [
      `The arm ${o}${a} points to 0° on the <b>${scale}</b> scale, so use the ${scale} scale.`,
      `Follow the ${scale} scale round to the arm ${o}${b}. It reads ${deg(angle)}.`,
      angle === 90 ? 'Both scales read 90° here: it is a right angle.' : `Check: the angle is ${angle < 90 ? 'smaller' : 'bigger'} than a right angle, so ${deg(angle)} makes sense and ${deg(180 - angle)} (the other scale) does not.`,
    ],
    meta: { t: 'protractor', angle, base },
  })
}

function estimateQ(): Question {
  const ladder = pick([
    [20, 60, 100, 140],
    [30, 70, 110, 150],
    [40, 80, 120, 160],
  ])
  const size = pick(ladder)
  const band = size < 45 ? 'It is less than half a right angle, so it is less than 45°.' : size < 90 ? 'It is more than half a right angle (45°) but less than a right angle (90°).' : size < 135 ? 'It is a little more than a right angle: between 90° and 135°.' : 'It is much more than a right angle, but less than a straight angle: between 135° and 180°.'
  return q({
    prompt: 'Estimate the size of this angle.',
    diagram: DG.turn(size, 15 * int(0, 23)),
    answer: mcFixedA(ladder.map(deg), deg(size)),
    hint: 'Compare it with a right angle (90°) and with half a right angle (45°).',
    steps: [band, `Of the choices, only ${deg(size)} fits.`],
    meta: { t: 'estimate', size },
  })
}

function whichScale(): Question {
  const small = 5 * int(4, 17)
  const acute = chance()
  const ans = acute ? small : 180 - small
  return q({
    prompt: `One arm of an angle lies along the base line of a protractor. The other arm passes through <b>${small}</b> on one scale and <b>${180 - small}</b> on the other scale. The angle is ${acute ? 'acute' : 'obtuse'}. What is its size?`,
    answer: numA(ans),
    suffix: '°',
    hint: acute ? 'An acute angle is less than 90°.' : 'An obtuse angle is more than 90° but less than 180°.',
    steps: [`The two readings are ${deg(small)} and ${deg(180 - small)}.`, acute ? `An acute angle is less than 90°, so the angle is ${deg(small)}.` : `An obtuse angle is more than 90°, so the angle is ${deg(180 - small)}.`],
    meta: { t: 'whichScale', small, acute },
  })
}

function orderAngles(): Question {
  const sizes = sample([25, 50, 75, 100, 125, 150], 3)
  const arms = shuffle([40, 48, 56])
  const items = sizes.map((size, i) => ({ size, label: 'ABC'[i], start: 15 * int(0, 23), arm: arms[i] }))
  const asc = items
    .slice()
    .sort((x, y) => x.size - y.size)
    .map((x) => x.label)
  const right = asc.join(', ')
  const reverse = asc.slice().reverse().join(', ')
  const all = ['A, B, C', 'A, C, B', 'B, A, C', 'B, C, A', 'C, A, B', 'C, B, A']
  return q({
    prompt: 'Write these 3 angles in order from smallest to largest.',
    diagram: DG.angleRow(items),
    answer: mcA(right, [reverse, ...shuffle(all.filter((o) => o !== right && o !== reverse)).slice(0, 2)]),
    hint: 'Look at how far one arm has turned from the other. The length of the arms does not matter.',
    steps: ['The size of an angle is the amount of turn between its arms, not how long the arms are.', `Smallest to largest: ${items.slice().sort((x, y) => x.size - y.size).map((x) => `${x.label} (about ${deg(x.size)})`).join(', ')}.`],
    meta: { t: 'order', sizes },
  })
}

function reflexFromInner(): Question {
  const inner = 5 * int(6, 34)
  const x = pron()
  const d = 15 * int(0, 23)
  return q({
    prompt: `The two arms make an angle of ${deg(inner)}. Find the value of ${v(x)}, the size of the reflex angle on the other side.`,
    diagram: DG.rays({ vertex: '', arms: [{ name: '', dir: d }, { name: '', dir: d + inner }], marks: [{ from: 0, to: 1, label: dl(inner), r: 30 }, { from: 1, to: 0, label: lab(x), r: 16 }] }),
    answer: numA(360 - inner),
    prefix: `${v(x)} =`,
    hint: 'The two angles together make a full turn (a revolution), which is 360°.',
    steps: ['The two angles make a revolution, so they add to 360°.', `${v(x)} = 360 ${MINUS} ${inner} = ${360 - inner}`],
    meta: { t: 'reflex', inner },
  })
}

function protractorReflex(): Question {
  const angle = 5 * int(8, 34)
  const base = pick(['right', 'left'] as const)
  const [a, o, b] = letters(3)
  return q({
    prompt: `The protractor measures the smaller angle between the arms ${o}${a} and ${o}${b}. Find the size of the <b>reflex</b> angle ${A(a + o + b)}.`,
    diagram: DG.protractor({ angle, base, names: [a, o, b] }),
    answer: numA(360 - angle),
    suffix: '°',
    hint: 'Read the angle on the protractor first. The reflex angle is the rest of the full turn of 360°.',
    steps: [`The arm ${o}${a} points to 0° on the ${base === 'right' ? 'inside' : 'outside'} scale, and that scale reads ${deg(angle)} at the arm ${o}${b}.`, `Reflex ${A(a + o + b)} = 360° ${MINUS} ${deg(angle)} = ${deg(360 - angle)}`],
    meta: { t: 'protractorReflex', angle, base },
  })
}

function reflexDraw(): Question {
  const angle = pick([195, 200, 204, 210, 215, 225, 236, 240, 250, 265, 270, 285, 290, 300, 310, 319, 325, 340])
  const who = name()
  return q({
    prompt: `${who} wants to draw a reflex angle of ${deg(angle)} with a protractor that only measures up to 180°. ${who} draws a smaller angle and marks the outside of it. What size should the smaller angle be?`,
    answer: numA(360 - angle),
    suffix: '°',
    hint: 'The smaller angle and the reflex angle together make a full turn of 360°.',
    steps: [`The two angles make a revolution: they add to 360°.`, `Smaller angle = 360° ${MINUS} ${deg(angle)} = ${deg(360 - angle)}`, `Draw ${deg(360 - angle)}, then mark the angle on the outside of the arms: it is ${deg(angle)}.`],
    meta: { t: 'reflexDraw', angle },
  })
}

export const ex202 = (level: Level): Question => {
  if (level === 1) return pick([() => protractorRead(1), () => protractorRead(1), estimateQ])()
  if (level === 2) return pick([() => protractorRead(2), () => protractorRead(2), orderAngles, whichScale, reflexFromInner])()
  return pick([() => protractorRead(3), protractorReflex, reflexDraw])()
}

// ================================================================== 2.03 Types of angles

const TYPES = ['Acute', 'Right', 'Obtuse', 'Straight', 'Reflex', 'Revolution']
const typeOf = (a: number) => (a < 90 ? 'Acute' : a === 90 ? 'Right' : a < 180 ? 'Obtuse' : a === 180 ? 'Straight' : a < 360 ? 'Reflex' : 'Revolution')
const an = (t: string) => (/^[AO]/i.test(t) ? 'an' : 'a')
const typeName = (t: string) => (t === 'Revolution' ? 'a revolution' : `${an(t)} ${t.toLowerCase()} angle`)
const TYPE_RULES = 'Acute: less than 90°. Right: exactly 90°. Obtuse: between 90° and 180°. Straight: exactly 180°. Reflex: between 180° and 360°. Revolution: exactly 360°.'
const TYPE_WHY: Record<string, string> = {
  Acute: 'It is smaller than a right angle (less than 90°).',
  Right: 'The small square shows a quarter turn: exactly 90°.',
  Obtuse: 'It is bigger than a right angle but smaller than a straight angle (between 90° and 180°).',
  Straight: 'The two arms make a straight line: a half turn of exactly 180°.',
  Reflex: 'It is bigger than a straight angle but less than a full turn (between 180° and 360°).',
  Revolution: 'The arm has turned all the way round: a full turn of exactly 360°.',
}

function classifyDiagram(): Question {
  const size = pick([5 * int(4, 15), 90, 5 * int(21, 33), 180, 10 * int(20, 34), 360])
  const t = typeOf(size)
  return q({
    prompt: 'What type of angle is shown?',
    diagram: DG.turn(size, 15 * int(0, 23)),
    answer: mcFixedA(TYPES, t),
    hint: TYPE_RULES,
    steps: [TYPE_WHY[t], `It is ${typeName(t)}.`],
    meta: { t: 'classifyDiagram', size },
  })
}

function classifySize(level: Level): Question {
  const a = level === 1 ? pick([int(12, 80), int(100, 170), int(190, 350), pick([90, 180, 360])]) : pick([1, 5, 44, 89, 91, 95, 126, 179, 181, 185, 205, 269, 271, 299, 345, 359, 90, 180, 360])
  const t = typeOf(a)
  return q({
    prompt: `What type of angle is ${deg(a)}?`,
    answer: mcFixedA(TYPES, t),
    hint: TYPE_RULES,
    steps: [TYPE_RULES, `${deg(a)} is ${typeName(t)}.`],
    meta: { t: 'classifySize', size: a },
  })
}

function turnDegrees(): Question {
  const [what, size, frac] = pick([
    ['a quarter turn', 90, 'one-quarter'],
    ['a half turn', 180, 'one-half'],
    ['a full turn', 360, 'all'],
    ['a three-quarter turn', 270, 'three-quarters'],
  ] as [string, number, string][])
  return q({
    prompt: `How many degrees are there in ${what}?`,
    answer: numA(size),
    suffix: '°',
    hint: 'A full turn (a revolution) is 360°.',
    steps: ['A full turn (a revolution) is 360°.', size === 360 ? 'A full turn is 360°: a revolution.' : `${what[0].toUpperCase() + what.slice(1)} is ${frac} of 360° = ${deg(size)}. It is ${typeName(typeOf(size))}.`],
    meta: { t: 'turnDegrees', size },
  })
}

function whichIsType(): Question {
  const special = pick([90, 180])
  const sizes = [int(8, 85), int(95, 175), int(185, 350), special].sort((x, y) => x - y)
  const want = typeOf(pick(sizes))
  const right = sizes.find((s) => typeOf(s) === want)!
  return q({
    prompt: `Which of these is ${typeName(want)}?`,
    answer: mcFixedA(sizes.map(deg), deg(right)),
    hint: TYPE_RULES,
    steps: sizes.map((s) => `${deg(s)} is ${typeName(typeOf(s))}.`),
    meta: { t: 'whichIsType', sizes, want },
  })
}

const TWO_TYPES = ['acute and obtuse', 'obtuse and acute', 'acute and reflex', 'obtuse and reflex']

function twoTypes(): Question {
  const [m, n] = sample(['a', 'b', 'c', 'd', 'm', 'n', 'p', 'q', 'x', 'y'], 2).sort()
  const first = pick([int(6, 15) * 5, int(21, 31) * 5])
  if (chance()) {
    const d = 15 * int(0, 23)
    return q({
      prompt: `What types of angles are ${it(m)} and ${it(n)}, in that order?`,
      diagram: DG.rays({ vertex: '', arms: [{ name: '', dir: d }, { name: '', dir: d + first }], marks: [{ from: 0, to: 1, label: it(m), r: 30 }, { from: 1, to: 0, label: it(n), r: 16 }] }),
      answer: mcFixedA(TWO_TYPES, `${typeOf(first).toLowerCase()} and reflex`),
      hint: 'Compare each angle with a right angle (90°) and a straight angle (180°).',
      steps: [`${it(m)} is ${first < 90 ? 'smaller than a right angle: acute' : 'bigger than a right angle but smaller than a straight angle: obtuse'}.`, `${it(n)} goes more than halfway round, so it is bigger than a straight angle: reflex.`],
      meta: { t: 'twoTypes', sizes: [first, 360 - first] },
    })
  }
  return q({
    prompt: `The angles ${it(m)} and ${it(n)} are on a straight line. What types of angles are ${it(m)} and ${it(n)}, in that order?`,
    diagram: D.anglesOnLine([first, 180 - first], [it(m), it(n)]),
    answer: mcFixedA(TWO_TYPES, first < 90 ? 'acute and obtuse' : 'obtuse and acute'),
    hint: 'Compare each angle with a right angle (90°).',
    steps: [`${it(m)} is ${first < 90 ? 'smaller' : 'bigger'} than a right angle: ${typeOf(first).toLowerCase()}.`, `${it(n)} is ${first < 90 ? 'bigger' : 'smaller'} than a right angle: ${typeOf(180 - first).toLowerCase()}.`],
    meta: { t: 'twoTypes', sizes: [first, 180 - first] },
  })
}

function clockType(): Question {
  const h = int(1, 11)
  const gaps = Math.min(h, 12 - h)
  const a = 30 * gaps
  const t = typeOf(a)
  return q({
    prompt: h === 6 ? 'What type of angle do the hands of this clock make at 6 o’clock?' : `What type of angle is the <b>smaller</b> angle between the hands of this clock at ${h} o’clock?`,
    diagram: D2.clock(h, 0),
    answer: mcFixedA(TYPES.slice(0, 4), t),
    hint: 'A full turn is 360° and there are 12 numbers on the clock, so each gap between numbers is 30°.',
    steps: [`Each gap between numbers is 360° ${DIVIDE} 12 = 30°.`, `At ${h} o’clock the hands are ${gaps} ${gaps === 1 ? 'gap' : 'gaps'} apart: ${gaps} ${TIMES} 30° = ${deg(a)}.`, `${deg(a)} is ${typeName(t)}.`],
    meta: { t: 'clock', h },
  })
}

function countType(): Question {
  const type = pick(['Acute', 'Obtuse', 'Reflex'])
  let sizes: number[]
  let k: number
  do {
    sizes = shuffle([...new Set([int(5, 85), int(5, 85), int(95, 175), int(95, 175), int(185, 355), int(185, 355), pick([90, 180, 360]), pick([89, 91, 179, 181])])]).slice(0, 6)
    k = sizes.filter((s) => typeOf(s) === type).length
  } while (sizes.length < 6 || k < 1 || k > 4)
  const hits = sizes.filter((s) => typeOf(s) === type)
  const rule = { Acute: 'less than 90°', Obtuse: 'between 90° and 180°', Reflex: 'between 180° and 360°' }[type]
  return q({
    prompt: `How many of these angles are <b>${type.toLowerCase()}</b>?${big(sizes.map(deg).join(', '))}`,
    answer: numA(k),
    hint: `${type} angles are ${rule}. Exactly 90°, 180° and 360° have their own names.`,
    steps: [`${type} angles are ${rule}.`, `${listOf(hits.map(deg))} ${k === 1 ? 'is' : 'are'} ${type.toLowerCase()}.`, `There ${k === 1 ? 'is 1' : `are ${k}`}.`],
    meta: { t: 'countType', sizes, type },
  })
}

export const ex203 = (level: Level): Question => {
  if (level === 1) return pick([classifyDiagram, classifyDiagram, () => classifySize(1), turnDegrees])()
  if (level === 2) return pick([() => classifySize(2), () => classifySize(2), whichIsType, classifyDiagram])()
  return pick([twoTypes, clockType, countType])()
}

// ================================================================== 2.04 Complementary and supplementary angles

function complementOf(level: Level): Question {
  let a = 5 * int(2, 16)
  if (level > 1) do a = int(3, 87)
  while (a % 5 === 0)
  return q({
    prompt: `Find the complement of ${deg(a)}.`,
    answer: numA(90 - a),
    suffix: '°',
    hint: 'Complementary angles add to 90°.',
    steps: ['Complementary angles add to 90°.', `90° ${MINUS} ${deg(a)} = ${deg(90 - a)}`],
    meta: { t: 'complement', a },
  })
}

function supplementOf(level: Level): Question {
  let a = 5 * int(2, 34)
  if (level > 1) do a = int(3, 177)
  while (a % 5 === 0)
  return q({
    prompt: `Find the supplement of ${deg(a)}.`,
    answer: numA(180 - a),
    suffix: '°',
    hint: 'Supplementary angles add to 180°.',
    steps: ['Supplementary angles add to 180°.', `180° ${MINUS} ${deg(a)} = ${deg(180 - a)}`],
    meta: { t: 'supplement', a },
  })
}

function isCompOrSupp(): Question {
  const a = int(12, 80)
  const kind = pick(['c', 's', 'n'] as const)
  const b = kind === 'c' ? 90 - a : kind === 's' ? 180 - a : pick([100 - a, 80 - a, 190 - a, 170 - a, 200 - a].filter((x) => x >= 5))
  const sum = a + b
  return q({
    prompt: `Are ${deg(a)} and ${deg(b)} complementary, supplementary or neither?`,
    answer: mcFixedA(['Complementary', 'Supplementary', 'Neither'], sum === 90 ? 'Complementary' : sum === 180 ? 'Supplementary' : 'Neither'),
    hint: 'Add the two angles. Complementary angles add to 90°; supplementary angles add to 180°.',
    steps: [`${deg(a)} + ${deg(b)} = ${deg(sum)}`, sum === 90 ? 'They add to 90°, so they are complementary.' : sum === 180 ? 'They add to 180°, so they are supplementary.' : 'They do not add to 90° or to 180°, so they are neither.'],
    meta: { t: 'compSupp', a, b },
  })
}

function addAdjacent(): Question {
  const a = 5 * int(6, 14)
  const b = 5 * int(6, 14)
  const [vx, p, m, r] = letters(4)
  const d = 5 * int(-2, 6)
  return q({
    prompt: `${A(p + vx + m)} = ${deg(a)} and ${A(m + vx + r)} = ${deg(b)}. Find the size of ${A(p + vx + r)}.`,
    diagram: DG.rays({ vertex: vx, arms: [{ name: p, dir: d }, { name: m, dir: d + a }, { name: r, dir: d + a + b }], marks: [{ from: 0, to: 1, label: dl(a), r: 24 }, { from: 1, to: 2, label: dl(b), r: 32 }] }),
    answer: numA(a + b),
    suffix: '°',
    hint: `${A(p + vx + r)} is made of the two adjacent angles put together.`,
    steps: [`${A(p + vx + m)} and ${A(m + vx + r)} are adjacent angles. Together they make ${A(p + vx + r)}.`, `${A(p + vx + r)} = ${deg(a)} + ${deg(b)} = ${deg(a + b)}`],
    meta: { t: 'addAdjacent', a, b },
  })
}

/** known angles and one unknown that together make `total`, in a random order */
function partsOf(total: 90 | 180, known: number[], x: string) {
  const u = total - known.reduce((s, k) => s + k, 0)
  const at = int(0, known.length)
  const sizes = [...known.slice(0, at), u, ...known.slice(at)]
  const labels = [...known.slice(0, at).map(dl), lab(x), ...known.slice(at).map(dl)]
  return { u, sizes, labels }
}

function inRightAngle(level: Level): Question {
  const x = pron()
  const known = level === 1 ? [int(20, 70)] : [int(22, 34), int(22, 34)]
  const { u, sizes, labels } = partsOf(90, known, x)
  return q({
    prompt: `The angles shown make a right angle. Find the value of ${v(x)}.`,
    diagram: D.splitAngle(sizes, labels, true),
    answer: numA(u),
    prefix: `${v(x)} =`,
    hint: 'Angles in a right angle add to 90°.',
    steps: [`${v(x)} + ${known.join(' + ')} = 90 (${known.length === 1 ? 'angles in a right angle are complementary' : 'angles in a right angle add to 90°'})`, `${v(x)} = 90 ${MINUS} ${known.join(` ${MINUS} `)} = ${u}`],
    meta: { t: 'inRight', known, x: u },
  })
}

function onLine(level: Level): Question {
  const x = pron()
  const known = level === 1 ? [int(25, 155)] : [int(30, 75), int(30, 75)]
  const { u, sizes, labels } = partsOf(180, known, x)
  return q({
    prompt: `The angles shown are on a straight line. Find the value of ${v(x)}.`,
    diagram: D.anglesOnLine(sizes, labels),
    answer: numA(u),
    prefix: `${v(x)} =`,
    hint: 'Angles on a straight line add to 180°.',
    steps: [`${v(x)} + ${known.join(' + ')} = 180 (${known.length === 1 ? 'angles on a straight line are supplementary' : 'angles on a straight line add to 180°'})`, `${v(x)} = 180 ${MINUS} ${known.join(` ${MINUS} `)} = ${u}`],
    meta: { t: 'onLine', known, x: u },
  })
}

function namePair(): Question {
  const kind = pick(['complementary', 'supplementary'] as const)
  const [vx, p, m, r] = letters(4)
  const total = kind === 'complementary' ? 90 : 180
  const d = kind === 'complementary' ? 15 * int(0, 23) : pick([0, 0, 10, -10])
  const part = kind === 'complementary' ? 5 * int(5, 13) : 5 * int(8, 28)
  const whole = A(p + vx + r)
  const right = `${A(p + vx + m)} and ${A(m + vx + r)}`
  return q({
    prompt: kind === 'complementary' ? `${whole} is a right angle. Which 2 angles are complementary?` : `${p}${vx}${r} is a straight line. Which 2 angles are supplementary?`,
    diagram: DG.rays({ vertex: vx, arms: [{ name: p, dir: d }, { name: m, dir: d + part }, { name: r, dir: d + total }], rightAt: kind === 'complementary' ? 0 : undefined }),
    answer: mcA(right, [`${A(p + vx + m)} and ${whole}`, `${A(m + vx + r)} and ${whole}`]),
    hint: kind === 'complementary' ? 'Complementary angles add to 90°. Which 2 angles fit together to make the right angle?' : 'Supplementary angles add to 180°. Which 2 angles fit together to make the straight angle?',
    steps: [`${A(p + vx + m)} and ${A(m + vx + r)} are adjacent angles that together make ${whole}, which is ${total}°.`, `Angles that add to ${total}° are ${kind}.`],
    meta: { t: 'namePair', kind },
  })
}

function leaningPost(): Question {
  const t = pick([15, 18, 20, 22, 25, 28, 30])
  const x = pron()
  return q({
    prompt: `A fence post should stand straight up (vertical), but it leans ${deg(t)} away from the vertical, as shown. The ground is level, and the small square shows the vertical line. Find the value of ${v(x)}, the angle between the post and the ground.`,
    diagram: DG.rays({
      vertex: '',
      arms: [
        { name: 'ground', dir: 0, len: 140 },
        { name: 'post', dir: 90 - t, len: 150 },
        { name: '', dir: 90, len: 150 },
      ],
      marks: [
        { from: 0, to: 1, label: lab(x), r: 34 },
        { from: 1, to: 2, label: dl(t), r: 100 },
      ],
      rightAt: 0,
    }),
    answer: numA(90 - t),
    prefix: `${v(x)} =`,
    hint: 'The vertical line and the level ground make a right angle.',
    steps: ['The vertical line is at right angles (90°) to the level ground.', `${v(x)} + ${t} = 90 (angles in a right angle are complementary)`, `${v(x)} = 90 ${MINUS} ${t} = ${90 - t}`],
    meta: { t: 'inRight', known: [t], x: 90 - t },
  })
}

function equalParts(): Question {
  const x = pron()
  const variant = pick(['line2', 'line3', 'right2'] as const)
  const k = variant === 'line3' ? 3 : 2
  const total = variant === 'right2' ? 90 : 180
  const val = variant === 'line2' ? int(25, 70) : variant === 'line3' ? int(25, 50) : int(20, 32)
  const a = total - k * val
  const at = int(0, k)
  const sizes = [...Array(at).fill(val), a, ...Array(k - at).fill(val)] as number[]
  const labels = sizes.map((s, i) => (i === at ? dl(a) : lab(x)))
  const kx = `${k}${v(x)}`
  return q({
    prompt: `The angles marked ${lab(x)} are equal. Find the value of ${v(x)}.`,
    diagram: total === 90 ? D.splitAngle(sizes, labels, true) : D.anglesOnLine(sizes, labels),
    answer: numA(val),
    prefix: `${v(x)} =`,
    hint: total === 90 ? 'Angles in a right angle add to 90°. Take away the angle you know, then share what is left equally.' : 'Angles on a straight line add to 180°. Take away the angle you know, then share what is left equally.',
    steps: [`${a} + ${Array(k).fill(v(x)).join(' + ')} = ${total} (${total === 90 ? 'angles in a right angle' : 'angles on a straight line'})`, `${kx} = ${total} ${MINUS} ${a} = ${total - a}`, `${v(x)} = ${total - a} ${DIVIDE} ${k} = ${val}`],
    meta: { t: 'equalParts', total, a, k, x: val },
  })
}

function compThenSupp(): Question {
  if (chance()) {
    const c = int(10, 80)
    return q({
      prompt: `The complement of an angle is ${deg(c)}. What is the supplement of the same angle?`,
      answer: numA(90 + c),
      suffix: '°',
      hint: 'Find the angle first: it and its complement add to 90°.',
      steps: [`The angle is 90° ${MINUS} ${deg(c)} = ${deg(90 - c)}.`, `Its supplement is 180° ${MINUS} ${deg(90 - c)} = ${deg(90 + c)}.`],
      meta: { t: 'compThenSupp', given: c, from: 'complement' },
    })
  }
  const s = int(100, 170)
  return q({
    prompt: `The supplement of an angle is ${deg(s)}. What is the complement of the same angle?`,
    answer: numA(s - 90),
    suffix: '°',
    hint: 'Find the angle first: it and its supplement add to 180°.',
    steps: [`The angle is 180° ${MINUS} ${deg(s)} = ${deg(180 - s)}.`, `Its complement is 90° ${MINUS} ${deg(180 - s)} = ${deg(s - 90)}.`],
    meta: { t: 'compThenSupp', given: s, from: 'supplement' },
  })
}

function timesAngle(): Question {
  const [total, k] = pick([
    [180, 2], [180, 3], [180, 4], [180, 5], [180, 8], [90, 2], [90, 4], [90, 5], [90, 8],
  ] as [number, number][])
  const small = total / (k + 1)
  const kind = total === 90 ? 'complementary' : 'supplementary'
  const times = k === 2 ? 'twice' : `${k} times`
  return q({
    prompt: `Two angles are ${kind}. One angle is ${times} the size of the other. Find the size of the smaller angle.`,
    answer: numA(small),
    suffix: '°',
    hint: `${kind[0].toUpperCase() + kind.slice(1)} angles add to ${total}°. Think of the smaller angle as 1 part and the bigger angle as ${k} parts.`,
    steps: [`The two angles add to ${total}° (${kind}).`, `The smaller angle is 1 part and the bigger angle is ${k} parts: ${k + 1} equal parts altogether.`, `Smaller angle = ${total}° ${DIVIDE} ${k + 1} = ${deg(small)}`, `Check: ${deg(small)} + ${deg(k * small)} = ${deg(total)}`],
    meta: { t: 'timesAngle', total, k },
  })
}

export const ex204 = (level: Level): Question => {
  if (level === 1) return pick([() => complementOf(1), () => supplementOf(1), addAdjacent, () => inRightAngle(1), () => onLine(1)])()
  if (level === 2) return pick([() => complementOf(2), () => supplementOf(2), isCompOrSupp, () => inRightAngle(2), () => onLine(2), namePair, leaningPost])()
  return pick([equalParts, equalParts, compThenSupp, timesAngle])()
}

// ================================================================== 2.05 Angles at a point and vertically opposite angles

/** two straight lines crossing: the angle on the right is theta; labels go [right, top, left, bottom] */
function crossTheta(level: Level): number {
  if (level === 1) return pick([40, 50, 60, 70, 110, 120, 130, 140])
  let t: number
  do t = int(35, 145)
  while (t > 80 && t < 100)
  return t
}

function vertOppLetter(): Question {
  const ls = shuffle(pick([['a', 'b', 'c', 'd'], ['p', 'q', 'r', 't'], ['w', 'x', 'y', 'k'], ['e', 'f', 'g', 'h'], ['m', 'n', 'c', 'd']]))
  const i = int(0, 3)
  const ans = ls[(i + 2) % 4]
  return q({
    prompt: `Which angle is vertically opposite angle ${it(ls[i])}?`,
    diagram: D.crossingLines(crossTheta(1), ls.map(it)),
    answer: mcFixedA(ls.filter((l) => l !== ls[i]).sort().map(it), it(ans)),
    hint: 'Vertically opposite angles face each other across the point where the lines cross. They do not share an arm.',
    steps: [`Angle ${it(ans)} is directly across the crossing point from angle ${it(ls[i])}.`, `The other 2 angles are next to (adjacent to) angle ${it(ls[i])}.`],
    meta: { t: 'vertOppLetter', ask: ls[i], ans },
  })
}

function vertOppFind(level: Level): Question {
  const theta = crossTheta(level)
  const i = int(0, 3)
  const a = i % 2 === 0 ? theta : 180 - theta
  const x = pron()
  const labels = ['', '', '', '']
  labels[i] = dl(a)
  labels[(i + 2) % 4] = lab(x)
  return q({
    prompt: `Two straight lines cross. Find the value of ${v(x)}.`,
    diagram: D.crossingLines(theta, labels),
    answer: numA(a),
    prefix: `${v(x)} =`,
    hint: 'Vertically opposite angles are equal.',
    steps: [`${v(x)} = ${a} (vertically opposite angles are equal)`],
    meta: { t: 'vertOpp', a },
  })
}

function crossAdjacent(): Question {
  const theta = crossTheta(2)
  const i = int(0, 3)
  const a = i % 2 === 0 ? theta : 180 - theta
  const x = pron()
  const labels = ['', '', '', '']
  labels[i] = dl(a)
  labels[(i + pick([1, 3])) % 4] = lab(x)
  return q({
    prompt: `Two straight lines cross. Find the value of ${v(x)}.`,
    diagram: D.crossingLines(theta, labels),
    answer: numA(180 - a),
    prefix: `${v(x)} =`,
    hint: `The ${deg(a)} angle and the angle ${lab(x)} are next to each other on a straight line.`,
    steps: [`${v(x)} + ${a} = 180 (angles on a straight line are supplementary)`, `${v(x)} = 180 ${MINUS} ${a} = ${180 - a}`],
    meta: { t: 'crossAdj', a },
  })
}

function twoVars(): Question {
  const theta = crossTheta(2)
  const i = int(0, 3)
  const a = i % 2 === 0 ? theta : 180 - theta
  const [p1, p2] = sample(VARS, 2).sort()
  const labels = ['', '', '', '']
  labels[i] = dl(a)
  // one unknown is across from the given angle, the other is beside it
  const across = chance()
  labels[(i + 2) % 4] = lab(across ? p1 : p2)
  labels[(i + pick([1, 3])) % 4] = lab(across ? p2 : p1)
  const [v1, v2] = across ? [a, 180 - a] : [180 - a, a]
  const opt = (x: number, y: number) => `${it(p1)} = ${x}, ${it(p2)} = ${y}`
  const [opp, adj] = across ? [p1, p2] : [p2, p1]
  return q({
    prompt: `Two straight lines cross. Find the values of ${v(p1)} and ${v(p2)}.`,
    diagram: D.crossingLines(theta, labels),
    answer: mcA(opt(v1, v2), [opt(v2, v1), opt(a, a), opt(180 - a, 180 - a)]),
    hint: 'One angle is vertically opposite the given angle. The other is next to it on a straight line.',
    steps: [`${v(opp)} = ${a} (vertically opposite angles are equal)`, `${v(adj)} = 180 ${MINUS} ${a} = ${180 - a} (angles on a straight line are supplementary)`],
    meta: { t: 'twoVars', a, across },
  })
}

function atPointQ(level: Level): Question {
  const x = pron()
  let known: number[]
  let u: number
  const box = level === 2 && chance(0.35)
  do {
    known = level === 1 ? [10 * int(6, 14), 10 * int(6, 14)] : box ? [90, int(50, 110), int(50, 110)] : [int(50, 110), int(50, 110), int(50, 110)]
    u = 360 - known.reduce((s, k) => s + k, 0)
  } while (u < 40 || u > 240 || u === 180 || known.includes(180))
  const order = shuffle(known.map((k, i) => ({ size: k, label: box && i === 0 ? '' : dl(k) })).concat([{ size: u, label: lab(x) }]))
  return q({
    prompt: `The angles shown meet at a point. Find the value of ${v(x)}.`,
    diagram: roundPoint(order.map((o) => o.size), order.map((o) => o.label), 5 * int(0, 17)),
    answer: numA(u),
    prefix: `${v(x)} =`,
    hint: box ? 'Angles at a point add to 360°. The small square shows a right angle (90°).' : 'Angles at a point (in a revolution) add to 360°.',
    steps: [...(box ? ['The small square shows a right angle: 90°.'] : []), `${v(x)} + ${known.join(' + ')} = 360 (angles at a point add to 360°)`, `${v(x)} = 360 ${MINUS} ${known.join(` ${MINUS} `)} = ${u}`],
    meta: { t: 'atPoint', known, x: u, box },
  })
}

/** two named lines crossing at a named point: the 4 angles in order round the point */
function namedCross() {
  const [k, w, x, y, z] = letters(5)
  const d = 5 * int(0, 8)
  const th = pick([50, 60, 70, 110, 120, 130])
  const diagram = DG.rays({ vertex: k, arms: [{ name: w, dir: d }, { name: x, dir: d + th }, { name: y, dir: d + 180 }, { name: z, dir: d + th + 180 }] })
  return { k, w, x, y, z, diagram, names: [w + k + x, x + k + y, y + k + z, z + k + w] }
}

function vertOppNamed(): Question {
  const { k, w, x, y, z, diagram, names } = namedCross()
  const i = int(0, 3)
  return q({
    prompt: `The straight lines ${w}${y} and ${x}${z} cross at ${k}. Which angle is vertically opposite ${A(names[i])}?`,
    diagram,
    answer: mcA(A(names[(i + 2) % 4]), [A(names[(i + 1) % 4]), A(names[(i + 3) % 4]), A(w + k + y)]),
    hint: 'Vertically opposite angles are across the crossing point from each other, and share no arms.',
    steps: [`${A(names[i])} and ${A(names[(i + 2) % 4])} are across the point ${k} from each other and share no arms.`, `${A(names[(i + 2) % 4])} is vertically opposite ${A(names[i])}, so the 2 angles are equal.`],
    meta: { t: 'vertOppNamed', ask: names[i], ans: names[(i + 2) % 4] },
  })
}

function suppNamed(): Question {
  const { k, w, x, y, z, diagram, names } = namedCross()
  const i = int(0, 3)
  const right = `${A(names[i])} and ${A(names[(i + 1) % 4])}`
  const line = i % 2 === 0 ? `${w}${y}` : `${x}${z}`
  return q({
    prompt: `The straight lines ${w}${y} and ${x}${z} cross at ${k}. Which 2 angles are supplementary?`,
    diagram,
    answer: mcA(right, [`${A(names[0])} and ${A(names[2])}`, `${A(names[1])} and ${A(names[3])}`]),
    hint: 'Supplementary angles add to 180°. Look for 2 angles side by side on a straight line.',
    steps: [`${right} are adjacent angles on the straight line ${line}, so they add to 180°.`, 'The other pairs are vertically opposite: they are equal, not supplementary.'],
    meta: { t: 'suppNamed', pair: [names[i], names[(i + 1) % 4]] },
  })
}

function equalAtPoint(): Question {
  const x = pron()
  if (chance(0.4)) {
    const n = pick([3, 4, 5, 6, 8])
    return q({
      prompt: `${n} equal angles meet at a point. Find the value of ${v(x)}.`,
      diagram: roundPoint(Array(n).fill(360 / n), Array(n).fill(lab(x)), 5 * int(0, 17)),
      answer: numA(360 / n),
      prefix: `${v(x)} =`,
      hint: 'Angles at a point add to 360°. Share 360° equally.',
      steps: [`${n} equal angles add to 360° (angles at a point)`, `${v(x)} = 360 ${DIVIDE} ${n} = ${360 / n}`],
      meta: { t: 'equalAtPoint', known: [], k: n, x: 360 / n },
    })
  }
  let known: number[]
  let val: number
  do {
    val = int(60, 140)
    const first = int(70, 110)
    known = chance() ? [360 - 2 * val] : [first, 360 - 2 * val - first]
  } while (known.some((k) => k < 45 || k > 170))
  const order = shuffle([...known.map((k) => ({ size: k, label: dl(k) })), { size: val, label: lab(x) }, { size: val, label: lab(x) }])
  const rest = 360 - known.reduce((s, k) => s + k, 0)
  return q({
    prompt: `The angles shown meet at a point. The angles marked ${lab(x)} are equal. Find the value of ${v(x)}.`,
    diagram: roundPoint(order.map((o) => o.size), order.map((o) => o.label), 5 * int(0, 17)),
    answer: numA(val),
    prefix: `${v(x)} =`,
    hint: 'Angles at a point add to 360°. Take away the angles you know, then halve what is left.',
    steps: [`${known.join(' + ')} + ${v(x)} + ${v(x)} = 360 (angles at a point)`, `2${v(x)} = 360 ${MINUS} ${known.join(` ${MINUS} `)} = ${rest}`, `${v(x)} = ${rest} ${DIVIDE} 2 = ${val}`],
    meta: { t: 'equalAtPoint', known, k: 2, x: val },
  })
}

function threeLines(): Question {
  const x = pron()
  let a: number, b: number, c: number
  do {
    a = int(40, 75)
    b = int(40, 75)
    c = 180 - a - b
  } while (c < 40)
  return q({
    prompt: `Three straight lines cross at one point. Find the value of ${v(x)}.`,
    diagram: roundPoint([a, b, c, a, b, c], [dl(a), dl(b), null, null, null, lab(x)], 5 * int(0, 11)),
    answer: numA(c),
    prefix: `${v(x)} =`,
    hint: `The angle vertically opposite ${lab(x)} sits on a straight line with the ${deg(a)} and ${deg(b)} angles.`,
    steps: [`The ${deg(a)} angle, the ${deg(b)} angle and the unmarked angle beside them lie on a straight line, so the unmarked angle is 180 ${MINUS} ${a} ${MINUS} ${b} = ${c}.`, `${v(x)} is vertically opposite that angle, so ${v(x)} = ${c}.`],
    meta: { t: 'threeLines', a, b },
  })
}

export const ex205 = (level: Level): Question => {
  if (level === 1) return pick([vertOppLetter, () => vertOppFind(1), () => atPointQ(1)])()
  if (level === 2) return pick([crossAdjacent, () => atPointQ(2), vertOppNamed, twoVars, () => vertOppFind(2)])()
  return pick([equalAtPoint, threeLines, suppNamed])()
}

// ================================================================== 2.06 Parallel and perpendicular lines

function symbolMeaning(write: boolean): Question {
  const [a, b, c, d] = letters(4)
  const l1 = a + b
  const l2 = c + d
  const rel = pick(['parallel', 'perpendicular'] as const)
  const sym = rel === 'parallel' ? PAR : PERP
  const meaning = `The symbol ${PAR} means “is parallel to”. The symbol ${PERP} means “is perpendicular to” (meets at right angles).`
  if (!write) {
    const options = [`${l1} is parallel to ${l2}`, `${l1} is perpendicular to ${l2}`, `${l1} is the same length as ${l2}`, `${l1} is adjacent to ${l2}`]
    return q({
      prompt: `What does this mean?${big(`${l1} ${sym} ${l2}`)}`,
      answer: mcFixedA(options, options[rel === 'parallel' ? 0 : 1]),
      hint: `${PAR} looks like 2 lines that never meet. ${PERP} looks like 2 lines meeting at a right angle.`,
      steps: [meaning, `${l1} ${sym} ${l2} means “${l1} is ${rel} to ${l2}”.`],
      meta: { t: 'symbol', rel, write },
    })
  }
  const options = [`${l1} ${PAR} ${l2}`, `${l1} ${PERP} ${l2}`, `${l1} = ${l2}`, `${l1} ∠ ${l2}`]
  return q({
    prompt: `Which of these says “${l1} is ${rel} to ${l2}” in symbols?`,
    answer: mcFixedA(options, options[rel === 'parallel' ? 0 : 1]),
    hint: `${PAR} looks like 2 lines that never meet. ${PERP} looks like 2 lines meeting at a right angle.`,
    steps: [meaning, `“${l1} is ${rel} to ${l2}” is written ${l1} ${sym} ${l2}.`],
    meta: { t: 'symbol', rel, write },
  })
}

const cosd = (d: number) => Math.cos((d * Math.PI) / 180)
const sind = (d: number) => Math.sin((d * Math.PI) / 180)
const LINE_RELS = ['Parallel', 'Perpendicular', 'Intersecting, but not perpendicular']

function lineRelation(): Question {
  const [a, b, c, d] = letters(4)
  const rel = pick(['parallel', 'perpendicular', 'intersecting'] as const)
  const turn = 5 * int(-6, 6)
  let diagram: string
  let steps: string[]
  if (rel === 'parallel') {
    diagram = DG.lineSet({ lines: [{ a, b, p: [0, 2.4], q: [7, 2.4], arrows: 1 }, { a: c, b: d, p: [0.6, 0], q: [7.6, 0], arrows: 1 }], turn })
    steps = ['Both lines are marked with the same arrowhead: the mark for parallel lines.', `They point in the same direction and never meet: ${a}${b} ${PAR} ${c}${d}.`]
  } else if (rel === 'perpendicular') {
    const xc = pick([2.5, 3.5, 4.5])
    diagram = DG.lineSet({ lines: [{ a, b, p: [0, 0], q: [7, 0] }, { a: c, b: d, p: [xc, -2.4], q: [xc, 2.8] }], rights: [{ at: [xc, 0], dir: 0 }], turn })
    steps = ['The small square shows that the lines meet at a right angle (90°).', `Lines that meet at right angles are perpendicular: ${a}${b} ${PERP} ${c}${d}.`]
  } else {
    const th = pick([35, 45, 55, 65, 115, 125, 135, 145])
    diagram = DG.lineSet({ lines: [{ a, b, p: [0, 0], q: [7, 0] }, { a: c, b: d, p: [3.5 - 2.6 * cosd(th), -2.6 * sind(th)], q: [3.5 + 3 * cosd(th), 3 * sind(th)] }], turn })
    steps = ['The lines cross, so they are not parallel.', 'There is no right-angle mark and the angle between them is clearly not 90°, so they are not perpendicular.']
  }
  return q({
    prompt: `How are the lines ${a}${b} and ${c}${d} related?`,
    diagram,
    answer: mcFixedA(LINE_RELS, LINE_RELS[['parallel', 'perpendicular', 'intersecting'].indexOf(rel)]),
    hint: 'Matching arrowheads mark parallel lines. A small square marks a right angle.',
    steps,
    meta: { t: 'lineRelation', rel, lines: [a + b, c + d] },
  })
}

function markMeaning(): Question {
  const arrow = chance()
  const options = ['The lines are parallel', 'The lines are perpendicular', 'The lines are the same length', 'The lines are rays']
  return q({
    prompt: arrow ? 'On a diagram, 2 lines are each marked with the same arrowhead in the middle. What does this show?' : 'On a diagram, a small square is drawn in the corner where 2 lines meet. What does this show?',
    answer: mcFixedA(options, options[arrow ? 0 : 1]),
    hint: 'One mark is for lines that never meet. The other is for lines that meet at 90°.',
    steps: [arrow ? 'Matching arrowheads are the mark for parallel lines: lines that point the same way and never meet.' : 'A small square marks a right angle (90°). Lines that meet at right angles are perpendicular.'],
    meta: { t: 'markMeaning', arrow },
  })
}

function intersectPoint(): Question {
  const [a, b, c, d, e] = letters(5)
  const th = pick([40, 55, 70, 110, 125, 140])
  const turn = 5 * int(-4, 4)
  // the name of the crossing point goes in one of the wide angles
  const wide = (th < 90 ? (th + 180) / 2 : th / 2) + turn
  return q({
    prompt: `At which point do the lines ${a}${b} and ${c}${d} intersect?`,
    diagram: DG.lineSet({
      lines: [{ a, b, p: [0, 0], q: [7, 0] }, { a: c, b: d, p: [3.5 - 2.6 * cosd(th), -2.6 * sind(th)], q: [3.5 + 2.8 * cosd(th), 2.8 * sind(th)] }],
      points: [{ name: e, at: [3.5, 0], dx: 18 * cosd(wide), dy: -18 * sind(wide) }],
      turn,
    }),
    answer: mcA(e, sample([a, b, c, d], 3)),
    hint: 'Lines intersect where they cross.',
    steps: [`The lines cross at the point ${e}.`, `We say ${a}${b} intersects ${c}${d} at ${e}.`],
    meta: { t: 'intersectPoint', point: e },
  })
}

function lineSetQ(level: Level): Question {
  const [a, b, c, d, e, f, g, h] = letters(8)
  const [AB, CD, EF, GH] = [a + b, c + d, e + f, g + h]
  const xe = pick([1.6, 2.2])
  const diagram = DG.lineSet({
    lines: [
      { a, b, p: [0, 2.6], q: [8, 2.6], arrows: 1, arrowAt: 0.93 },
      { a: c, b: d, p: [0, 0], q: [8, 0], arrows: 1, arrowAt: 0.93 },
      { a: e, b: f, p: [xe, 4], q: [xe, -1.4] },
      { a: g, b: h, p: [3.6, -1.4], q: [6.6, 4] },
    ],
    rights: level < 3 ? [{ at: [xe, 2.6], dir: 0 }, { at: [xe, 0], dir: 0 }] : [{ at: [xe, 2.6], dir: 0 }],
    turn: 5 * int(-4, 4),
  })
  const hint = 'Matching arrowheads mark parallel lines. A small square marks a right angle.'
  if (level === 3) {
    return q({
      prompt: `Only one right angle is marked on this diagram. Which line is perpendicular to ${CD}?`,
      diagram,
      answer: mcA(EF, [AB, GH]),
      hint: `${AB} and ${CD} are parallel. What does that tell you about a line that crosses ${AB} at right angles?`,
      steps: [`${EF} ${PERP} ${AB} (a right angle is marked).`, `${AB} ${PAR} ${CD} (matching arrowheads), so ${EF} crosses ${CD} at the same angle as it crosses ${AB}.`, `So ${EF} ${PERP} ${CD}.`],
      meta: { t: 'lineSet', ask: 'perpendicular', target: CD, answer: EF },
    })
  }
  const ask = pick(['parallel', 'perpendicular', 'true'] as const)
  if (ask === 'parallel') {
    const [target, ans] = chance() ? [AB, CD] : [CD, AB]
    return q({
      prompt: `Which line is parallel to ${target}?`,
      diagram,
      answer: mcA(ans, [EF, GH]),
      hint,
      steps: [`${target} and ${ans} are marked with matching arrowheads, so ${target} ${PAR} ${ans}.`],
      meta: { t: 'lineSet', ask, target, answer: ans },
    })
  }
  if (ask === 'perpendicular') {
    const [target, other] = chance() ? [AB, CD] : [CD, AB]
    return q({
      prompt: `Which line is perpendicular to ${target}?`,
      diagram,
      answer: mcA(EF, [other, GH]),
      hint,
      steps: [`A small square is marked where ${EF} crosses ${target}: they meet at right angles.`, `${EF} ${PERP} ${target}`],
      meta: { t: 'lineSet', ask, target, answer: EF },
    })
  }
  const right = pick([`${AB} ${PAR} ${CD}`, `${AB} ${PERP} ${EF}`, `${CD} ${PERP} ${EF}`])
  const wrong = sample([`${AB} ${PERP} ${CD}`, `${AB} ${PAR} ${EF}`, `${GH} ${PERP} ${EF}`, `${GH} ${PAR} ${EF}`, `${GH} ${PERP} ${AB}`, `${CD} ${PAR} ${GH}`], 3)
  return q({
    prompt: 'Which statement about this diagram is true?',
    diagram,
    answer: mcA(right, wrong),
    hint: `${PAR} means “is parallel to” and ${PERP} means “is perpendicular to”. Look for arrowheads and right-angle marks.`,
    steps: [`${AB} and ${CD} have matching arrowheads: ${AB} ${PAR} ${CD}.`, `${EF} crosses them both at right angles: ${AB} ${PERP} ${EF} and ${CD} ${PERP} ${EF}.`, `${GH} is not parallel or perpendicular to any of the other lines.`],
    meta: { t: 'lineSet', ask, statement: right },
  })
}

const STREETS = ['Banksia St', 'Wattle St', 'Waratah Ave', 'Ironbark Rd', 'Mallee Rd', 'Brolga Pde', 'Gymea St', 'Tallow St', 'Jacaranda Ave', 'Bilby Lane', 'Lorikeet Rd', 'Pandanus St']

function streetMapQ(): Question {
  const [h1, h2, h3, v1, v2, s] = sample(STREETS, 6)
  const across = shuffle([h1, h2, h3])
  const up = shuffle([v1, v2])
  const ask = pick(['parallel', 'perpendicular', 'parallelUp'] as const)
  const target = ask === 'parallelUp' ? up[0] : across[0]
  const ans = ask === 'parallel' ? across[1] : ask === 'perpendicular' ? up[0] : up[1]
  const wrong = ask === 'parallel' ? [v1, v2, s] : ask === 'perpendicular' ? [across[1], across[2], s] : [across[0], across[1], s]
  const word = ask === 'perpendicular' ? 'perpendicular' : 'parallel'
  return q({
    prompt: `On this street map, which street is ${word} to ${target}?`,
    diagram: DG.streetMap({ across: [h1, h2, h3], up: [v1, v2], slant: s }),
    answer: mcA(ans, wrong),
    hint: word === 'parallel' ? 'Parallel streets run in the same direction and never meet.' : 'Perpendicular streets cross at right angles, like the corner of a page.',
    steps: [word === 'parallel' ? `${ans} runs in the same direction as ${target} and never meets it, so it is parallel to ${target}.` : `${ans} crosses ${target} at right angles, so it is perpendicular to ${target}.`, `${s} cuts across at a slant, so it is not parallel or perpendicular to ${target}.`],
    meta: { t: 'map', ask: word, target, answer: ans },
  })
}

function countPairs(): Question {
  const m = pick([2, 3])
  const n = pick([2, 3])
  const ask = pick(['parallel', 'perpendicular'] as const)
  const W = 1.2 + (n - 1) * 1.7 + 1.6
  const top = (m - 1) * 1.5 + 1
  const lines = [
    ...Array.from({ length: m }, (_, i) => ({ a: '', b: '', p: [0, i * 1.5] as [number, number], q: [W, i * 1.5] as [number, number], arrows: 1, arrowAt: 0.95 })),
    ...Array.from({ length: n }, (_, j) => ({ a: '', b: '', p: [1.2 + j * 1.7, -1] as [number, number], q: [1.2 + j * 1.7, top] as [number, number], arrows: 2, arrowAt: 0.9 })),
  ]
  const c2 = (k: number) => (k * (k - 1)) / 2
  const pairs = (k: number) => `${k} ${k === 1 ? 'pair' : 'pairs'}`
  return q({
    prompt: `Lines with matching arrowheads are parallel, and one right angle is marked. How many pairs of ${ask} lines are in this diagram?`,
    diagram: DG.lineSet({ lines, rights: [{ at: [1.2, 0], dir: 0 }], turn: 5 * int(-3, 3), scale: 42 }),
    answer: numA(ask === 'parallel' ? c2(m) + c2(n) : m * n),
    hint: ask === 'parallel' ? 'Count the pairs among the lines with single arrowheads, then the pairs among the lines with double arrowheads.' : 'Every line with a single arrowhead is perpendicular to every line with double arrowheads.',
    steps:
      ask === 'parallel'
        ? [`${m} lines have single arrowheads: ${pairs(c2(m))}.`, `${n} lines have double arrowheads: ${pairs(c2(n))}.`, `Total = ${c2(m)} + ${c2(n)} = ${pairs(c2(m) + c2(n))}`]
        : ['One right angle is marked, and the other lines are parallel to those two lines.', 'So every line with a single arrowhead is perpendicular to every line with double arrowheads.', `${m} ${TIMES} ${n} = ${pairs(m * n)}`],
    meta: { t: 'countPairs', m, n, ask },
  })
}

function perpToSame(): Question {
  const [a, b, p, qq, r, s] = letters(6)
  const [ab, pq, rs] = [a + b, p + qq, r + s]
  const variant = pick(['perp', 'par', 'mixed'] as const)
  const stmt = { perp: `${pq} ${PERP} ${ab} and ${rs} ${PERP} ${ab}`, par: `${pq} ${PAR} ${ab} and ${rs} ${PAR} ${ab}`, mixed: `${pq} ${PAR} ${ab} and ${rs} ${PERP} ${ab}` }[variant]
  const steps = {
    perp: [`Both lines cross ${ab} at right angles, so they point in the same direction as each other.`, `${pq} ${PAR} ${rs}`],
    par: [`Both lines point in the same direction as ${ab}, so they point in the same direction as each other.`, `${pq} ${PAR} ${rs}`],
    mixed: [`${pq} points in the same direction as ${ab}, and ${rs} is at right angles to ${ab}.`, `So ${rs} is at right angles to ${pq} too: ${pq} ${PERP} ${rs}`],
  }[variant]
  const options = ['Parallel', 'Perpendicular', 'Neither']
  return q({
    prompt: `Three different lines are drawn on a flat page, where ${stmt}. How are ${pq} and ${rs} related?`,
    answer: mcFixedA(options, variant === 'mixed' ? 'Perpendicular' : 'Parallel'),
    hint: 'Sketch the 3 lines on paper, starting with ' + ab + '.',
    steps,
    meta: { t: 'perpToSame', variant },
  })
}

function quadFromLines(): Question {
  if (chance()) {
    const top = pick([2, 2.5, 3])
    const bot = pick([4.5, 5, 5.5])
    const off = pick([0.3, 0.7, 1.1])
    return q({
      prompt: 'Two parallel intervals of different lengths are drawn. Their ends are joined (the dashed lines) to make a quadrilateral. Which name describes the quadrilateral best?',
      diagram: fig({
        pts: { A: [0.8 + off, 2], B: [0.8 + off + top, 2], C: [bot, 0], D: [0, 0] },
        segs: [{ a: 'A', b: 'B' }, { a: 'D', b: 'C' }, { a: 'A', b: 'D', dash: true }, { a: 'B', b: 'C', dash: true }],
        arrows: [{ a: 'A', b: 'B', n: 1 }, { a: 'D', b: 'C', n: 1 }],
        label: 'Two parallel intervals with their ends joined',
      }),
      answer: mcFixedA(['Parallelogram', 'Rectangle', 'Rhombus', 'Trapezium'], 'Trapezium'),
      hint: 'How many pairs of parallel sides does the quadrilateral have?',
      steps: ['The 2 intervals are parallel, so the quadrilateral has a pair of parallel sides.', 'They are different lengths, so the 2 dashed sides cannot be parallel.', 'A quadrilateral like this is a trapezium.'],
      meta: { t: 'quad', variant: 'trapezium' },
    })
  }
  const p = pick([2.4, 2.7, 3])
  const h = pick([1.2, 1.5, 1.8])
  return q({
    prompt: 'Two intervals of different lengths cross at right angles, and each one cuts the other exactly in half. Their ends are joined (the dashed lines) to make a quadrilateral. Which name describes the quadrilateral best?',
    diagram: fig({
      pts: { L: [-p, 0], R: [p, 0], T: [0, h], B: [0, -h], M: [0, 0] },
      segs: [{ a: 'L', b: 'R' }, { a: 'T', b: 'B' }, { a: 'L', b: 'T', dash: true }, { a: 'T', b: 'R', dash: true }, { a: 'R', b: 'B', dash: true }, { a: 'B', b: 'L', dash: true }],
      rights: [['R', 'M', 'T']],
      ticks: [{ a: 'L', b: 'M', n: 1 }, { a: 'M', b: 'R', n: 1 }, { a: 'T', b: 'M', n: 2 }, { a: 'M', b: 'B', n: 2 }],
      label: 'Two intervals crossing at right angles with their ends joined',
    }),
    answer: mcFixedA(['Rectangle', 'Rhombus', 'Square'], 'Rhombus'),
    hint: 'The diagram is symmetrical about both intervals. What does that tell you about the 4 dashed sides?',
    steps: ['The diagram is symmetrical about both intervals, so the 4 dashed sides are all the same length.', 'The intervals are different lengths, so the corners are not right angles: it is not a square or a rectangle.', 'A quadrilateral with 4 equal sides is a rhombus.'],
    meta: { t: 'quad', variant: 'rhombus' },
  })
}

export const ex206 = (level: Level): Question => {
  if (level === 1) return pick([() => symbolMeaning(false), lineRelation, lineRelation, markMeaning, intersectPoint])()
  if (level === 2) return pick([() => lineSetQ(2), () => lineSetQ(2), streetMapQ, () => symbolMeaning(true)])()
  return pick([countPairs, perpToSame, quadFromLines, () => lineSetQ(3)])()
}

// ================================================================== Two lines and a transversal (2.07 to 2.11)

type Rel = 'corresponding' | 'alternate' | 'co-interior'
type Spot = { at: 0 | 1; pos: Pos }
const RELS: Rel[] = ['corresponding', 'alternate', 'co-interior']
/** the pairs for each relationship: [position at crossing 0, position at crossing 1] (positions as in diagrams12) */
const PAIRS: Record<Rel, [Pos, Pos][]> = {
  corresponding: [[0, 0], [1, 1], [2, 2], [3, 3]],
  alternate: [[2, 0], [3, 1]],
  'co-interior': [[2, 1], [3, 0]],
}
const ALL_POS: Pos[] = [0, 1, 2, 3]
const sizeAt = (theta: number, pos: Pos) => (pos % 2 === 0 ? theta : 180 - theta)
const REL_RULE: Record<Rel, string> = {
  corresponding: 'corresponding angles on parallel lines are equal',
  alternate: 'alternate angles on parallel lines are equal',
  'co-interior': 'co-interior angles on parallel lines are supplementary',
}
const REL_HINT: Record<Rel, string> = {
  corresponding: 'Corresponding angles are in matching positions at the 2 crossings: on the same side of their line and on the same side of the transversal.',
  alternate: 'Alternate angles are between the 2 lines, on opposite sides of the transversal.',
  'co-interior': 'Co-interior angles are between the 2 lines, on the same side of the transversal.',
}
const PARALLEL_GIVEN = 'The lines with arrowheads are parallel.'
/** where an angle is when the lines are level: above or below its line, and left or right of the transversal */
const WHERE: Record<Pos, { v: string; side: string }> = {
  0: { v: 'above', side: 'right' },
  1: { v: 'above', side: 'left' },
  2: { v: 'below', side: 'left' },
  3: { v: 'below', side: 'right' },
}

/** the tilt of the lines and the angle of the transversal, by level */
function layout(level: Level): { rot: number; theta: number; len?: number } {
  if (level === 1) return { rot: 0, theta: pick([55, 60, 65, 70, 75, 105, 110, 115, 120, 125]) }
  let theta: number
  do theta = int(50, 130)
  while (theta > 80 && theta < 100)
  if (level === 2) return { rot: pick([0, 0, 15, -15, 25, -25]), theta }
  const rot = pick([-30, -20, 0, 20, 30, 90])
  return rot === 90 ? { rot, theta, len: 96 } : { rot, theta }
}

/** one pair of angles of the given kind: g is the angle that is given, o is its partner at the other crossing */
function pairOf(rel: Rel): { g: Spot; o: Spot } {
  const [p0, p1] = pick(PAIRS[rel])
  return chance() ? { g: { at: 0, pos: p0 }, o: { at: 1, pos: p1 } } : { g: { at: 1, pos: p1 }, o: { at: 0, pos: p0 } }
}

function relLetter(rel: Rel): Question {
  const { rot, theta } = layout(1)
  const { g, o } = pairOf(rel)
  const ls = shuffle(pick([['a', 'b', 'c', 'd'], ['e', 'f', 'g', 'h'], ['p', 'q', 'r', 't'], ['w', 'x', 'y', 'k']]))
  const ans = it(ls[o.pos])
  const wg = WHERE[g.pos]
  const wo = WHERE[o.pos]
  const steps =
    rel === 'corresponding'
      ? [`The • is ${wg.v} its line, on the ${wg.side} of the transversal.`, `Angle ${ans} is in the matching position at the other crossing: ${wo.v} its line, on the ${wo.side} of the transversal.`]
      : rel === 'alternate'
        ? [`The • is between the parallel lines, on the ${wg.side} of the transversal.`, `Angle ${ans} is also between the lines, but on the other side of the transversal (the ${wo.side}).`]
        : [`The • is between the parallel lines, on the ${wg.side} of the transversal.`, `Angle ${ans} is also between the lines, and on the same side of the transversal (the ${wo.side}).`]
  return q({
    prompt: `${PARALLEL_GIVEN} Which angle is ${rel} to the angle marked •?`,
    diagram: DG.transversal({ rot, theta, marks: [{ ...g, label: '•' }, ...ALL_POS.map((pos) => ({ at: o.at, pos, label: it(ls[pos]) }))] }),
    answer: mcFixedA(ls.slice().sort().map(it), ans),
    hint: REL_HINT[rel],
    steps,
    meta: { t: 'relLetter', rel, ans: ls[o.pos] },
  })
}

function relFind(rel: Rel, level: Level, mixed = false): Question {
  const lay = layout(level)
  const { g, o } = pairOf(rel)
  const a = sizeAt(lay.theta, g.pos)
  const x = pron()
  const ans = rel === 'co-interior' ? 180 - a : a
  return q({
    prompt: `${PARALLEL_GIVEN} Find the value of ${v(x)}.`,
    diagram: DG.transversal({ ...lay, marks: [{ ...g, label: dl(a) }, { ...o, label: lab(x) }] }),
    answer: numA(ans),
    prefix: `${v(x)} =`,
    hint: mixed ? 'Decide whether the 2 marked angles are corresponding, alternate or co-interior. Corresponding and alternate angles are equal; co-interior angles add to 180°.' : `${REL_HINT[rel]} On parallel lines they ${rel === 'co-interior' ? 'add to 180°' : 'are equal'}.`,
    steps: rel === 'co-interior' ? [`${v(x)} + ${a} = 180 (${REL_RULE[rel]})`, `${v(x)} = 180 ${MINUS} ${a} = ${ans}`] : [`${v(x)} = ${a} (${REL_RULE[rel]})`],
    meta: { t: 'relFind', rel, a },
  })
}

function relPair(rel: Rel): Question {
  const lay = layout(2)
  const ls = shuffle('abcdefgh'.split(''))
  const at = (s: Spot) => ls[s.at * 4 + s.pos]
  const text = (s1: Spot, s2: Spot) => [at(s1), at(s2)].sort().map(it).join(' and ')
  const one = (r: Rel) => {
    const [p0, p1] = pick(PAIRS[r])
    return text({ at: 0, pos: p0 }, { at: 1, pos: p1 })
  }
  const vAt = pick([0, 1] as const)
  const vPos = pick([0, 1] as Pos[])
  const options: Record<string, string> = { corresponding: one('corresponding'), alternate: one('alternate'), 'co-interior': one('co-interior'), 'vertically opposite': text({ at: vAt, pos: vPos }, { at: vAt, pos: (vPos + 2) as Pos }) }
  return q({
    prompt: `${PARALLEL_GIVEN} Which of these pairs are ${rel} angles?`,
    diagram: DG.transversal({ ...lay, marks: ([0, 1] as const).flatMap((c) => ALL_POS.map((pos) => ({ at: c, pos, label: it(ls[c * 4 + pos]) }))) }),
    answer: mcA(options[rel], Object.keys(options).filter((k) => k !== rel).map((k) => options[k])),
    hint: REL_HINT[rel],
    steps: [`${options[rel]} are ${rel} angles.`, ...Object.keys(options).filter((k) => k !== rel).map((k) => `${options[k]} are ${k} angles.`)],
    meta: { t: 'relPair', rel },
  })
}

function relCount(rel: Rel): Question {
  const lay = layout(1)
  const ls = 'abcdefgh'.split('')
  const n = PAIRS[rel].length
  return q({
    prompt: `A transversal crosses 2 parallel lines and makes 8 angles. How many pairs of ${rel} angles are there?`,
    diagram: DG.transversal({ ...lay, marks: ([0, 1] as const).flatMap((c) => ALL_POS.map((pos) => ({ at: c, pos, label: it(ls[c * 4 + pos]) }))) }),
    answer: numA(n),
    hint: REL_HINT[rel],
    steps: [REL_HINT[rel], `The pairs are: ${PAIRS[rel].map(([p0, p1]) => `${it(ls[p0])} and ${it(ls[4 + p1])}`).join('; ')}.`, `There are ${n} pairs.`],
    meta: { t: 'relCount', rel },
  })
}

function relTwoStep(rel: Rel, mixed = false): Question {
  const lay = layout(3)
  const { g, o } = pairOf(rel)
  const k = pick([1, 2, 3])
  const xPos = ((o.pos + k) % 4) as Pos
  const a = sizeAt(lay.theta, g.pos)
  const partner = sizeAt(lay.theta, o.pos)
  const ans = sizeAt(lay.theta, xPos)
  const x = pron()
  return q({
    prompt: `${PARALLEL_GIVEN} Find the value of ${v(x)}.`,
    diagram: DG.transversal({ ...lay, marks: [{ ...g, label: dl(a) }, { at: o.at, pos: xPos, label: lab(x) }] }),
    answer: numA(ans),
    prefix: `${v(x)} =`,
    hint: mixed ? `This takes 2 steps. First find another angle at the same crossing as ${lab(x)}, using the parallel lines.` : `This takes 2 steps. First find the angle that is ${rel} to the ${deg(a)} angle.`,
    steps: [
      rel === 'co-interior' ? `The angle co-interior to the ${deg(a)} angle is 180° ${MINUS} ${deg(a)} = ${deg(partner)} (${REL_RULE[rel]}).` : `The angle ${rel} to the ${deg(a)} angle is also ${deg(a)} (${REL_RULE[rel]}).`,
      k === 2 ? `${v(x)} is vertically opposite that angle, so ${v(x)} = ${partner}.` : `${v(x)} is next to that angle on a straight line, so ${v(x)} = 180 ${MINUS} ${partner} = ${ans}.`,
    ],
    meta: { t: 'relTwoStep', rel, a, k },
  })
}

/** how to get from a known angle to another of the 8 angles */
function explain(g: Spot, t: Spot, a: number, what: string): string[] {
  const other = 180 - a
  if (g.at === t.at) return (t.pos + 4 - g.pos) % 4 === 2 ? [`${what} is vertically opposite the ${deg(a)} angle, so it is ${deg(a)}.`] : [`${what} is next to the ${deg(a)} angle on a straight line: 180° ${MINUS} ${deg(a)} = ${deg(other)}.`]
  const rel = DG.relation(g, t)
  if (rel === 'corresponding' || rel === 'alternate') return [`${what} and the ${deg(a)} angle are ${rel} angles on parallel lines, so ${what} is ${deg(a)}.`]
  if (rel === 'co-interior') return [`${what} and the ${deg(a)} angle are co-interior angles on parallel lines, so they add to 180°.`, `180° ${MINUS} ${deg(a)} = ${deg(other)}`]
  const first = `The angle in the matching position at the other crossing is also ${deg(a)} (corresponding angles on parallel lines).`
  return (t.pos + 4 - g.pos) % 4 === 2 ? [first, `${what} is vertically opposite that angle, so it is ${deg(a)}.`] : [first, `${what} is next to that angle on a straight line: 180° ${MINUS} ${deg(a)} = ${deg(other)}.`]
}

function eightFind(): Question {
  const lay = layout(2)
  const g: Spot = { at: pick([0, 1] as const), pos: pick(ALL_POS) }
  const a = sizeAt(lay.theta, g.pos)
  const spots: Spot[] = ([0, 1] as const).flatMap((c) => ALL_POS.map((pos) => ({ at: c, pos }))).filter((s) => !(s.at === g.at && s.pos === g.pos))
  const ls = 'abcdefg'.split('')
  const i = int(0, 6)
  const target = spots[i]
  const ans = sizeAt(lay.theta, target.pos)
  return q({
    prompt: `${PARALLEL_GIVEN} Find the size of angle ${it(ls[i])}.`,
    diagram: DG.transversal({ ...lay, marks: [{ ...g, label: dl(a) }, ...spots.map((s, k) => ({ ...s, label: it(ls[k]) }))] }),
    answer: numA(ans),
    suffix: '°',
    hint: `Every one of the 8 angles is either ${deg(a)} or ${deg(180 - a)}. Use vertically opposite angles, angles on a straight line and the parallel lines.`,
    steps: explain(g, target, a, `Angle ${it(ls[i])}`),
    meta: { t: 'eightFind', a, letter: ls[i] },
  })
}

function eightCount(): Question {
  const lay = layout(1)
  const g: Spot = { at: pick([0, 1] as const), pos: pick(ALL_POS) }
  const a = sizeAt(lay.theta, g.pos)
  const same = chance()
  return q({
    prompt: `${PARALLEL_GIVEN} One of the 8 angles is ${deg(a)}. How many of the other 7 angles are ${same ? `also ${deg(a)}` : deg(180 - a)}?`,
    diagram: DG.transversal({ ...lay, marks: [{ ...g, label: dl(a) }] }),
    answer: numA(same ? 3 : 4),
    hint: 'Use vertically opposite angles at each crossing, and corresponding angles between the crossings.',
    steps: [
      `At its own crossing, the angle vertically opposite the ${deg(a)} angle is also ${deg(a)}. The other 2 are 180° ${MINUS} ${deg(a)} = ${deg(180 - a)}.`,
      'The other crossing has the same 4 angles, because corresponding angles on parallel lines are equal.',
      same ? `So 4 angles are ${deg(a)}: 3 others as well as the one marked.` : `So 4 angles are ${deg(180 - a)}.`,
    ],
    meta: { t: 'eightCount', a, same },
  })
}

function transversalWord(): Question {
  if (chance()) {
    const options = ['A transversal', 'A parallel line', 'A perpendicular line', 'An interval']
    return q({
      prompt: 'What is the name for a line that crosses 2 or more other lines?',
      answer: mcFixedA(options, options[0]),
      hint: 'The word comes from “transverse”, which means “crossing”.',
      steps: ['A line that crosses 2 or more other lines is called a transversal.'],
      meta: { t: 'word' },
    })
  }
  return q({
    prompt: 'A transversal crosses 2 other lines. How many angles are made altogether?',
    diagram: DG.transversal({ ...layout(1), marks: [] }),
    answer: numA(8),
    hint: 'Count the angles at each crossing.',
    steps: ['There are 4 angles at each crossing.', `2 ${TIMES} 4 = 8 angles`],
    meta: { t: 'word' },
  })
}

export const ex207 = (level: Level): Question => {
  if (level === 1) return pick([() => relLetter('corresponding'), () => relLetter('corresponding'), () => relFind('corresponding', 1), () => relFind('corresponding', 1), transversalWord])()
  if (level === 2) return pick([() => relFind('corresponding', 2), () => relFind('corresponding', 2), () => relPair('corresponding'), () => relCount('corresponding')])()
  return pick([() => relTwoStep('corresponding'), eightFind, eightCount])()
}

// ================================================================== 2.08 Alternate angles on parallel lines

/** a Z made of 3 intervals: the top and bottom are parallel, and the angles at the 2 bends are alternate */
function zShape(): Question {
  const a = 5 * int(7, 14)
  const x = pron()
  const [pa, pb, pc, pd] = letters(4)
  const h = 2.2
  const w = 3.6
  const cx = w - h / Math.tan((a * Math.PI) / 180)
  const givenTop = chance()
  return q({
    prompt: `${pa}${pb} ${PAR} ${pc}${pd}. Find the value of ${v(x)}.`,
    diagram: fig({
      pts: { [pa]: [0, h], [pb]: [w, h], [pc]: [cx, 0], [pd]: [cx + w, 0] },
      segs: [{ a: pa, b: pb }, { a: pb, b: pc }, { a: pc, b: pd }],
      arrows: [{ a: pa, b: pb, n: 1 }, { a: pc, b: pd, n: 1 }],
      angles: [{ at: pb, a: pa, b: pc, text: givenTop ? dl(a) : lab(x), r: 26 }, { at: pc, a: pb, b: pd, text: givenTop ? lab(x) : dl(a), r: 26 }],
      names: [pa, pb, pc, pd],
      label: 'Two parallel intervals joined by a slanting interval',
    }),
    answer: numA(a),
    prefix: `${v(x)} =`,
    hint: `${pb}${pc} is a transversal crossing the parallel intervals. The 2 marked angles are between the parallel lines, on opposite sides of ${pb}${pc}.`,
    steps: [`${A(pa + pb + pc)} and ${A(pb + pc + pd)} are alternate angles: they are between the parallel lines, on opposite sides of the transversal ${pb}${pc}.`, `${v(x)} = ${a} (${REL_RULE.alternate})`],
    meta: { t: 'zShape', a },
  })
}

export const ex208 = (level: Level): Question => {
  if (level === 1) return pick([() => relLetter('alternate'), () => relFind('alternate', 1)])()
  if (level === 2) return pick([() => relFind('alternate', 2), () => relFind('alternate', 2), () => relPair('alternate'), () => relCount('alternate')])()
  return pick([() => relTwoStep('alternate'), zShape, eightCount])()
}

// ================================================================== 2.09 Co-interior angles on parallel lines

function coSum(): Question {
  const lay = layout(1)
  const { g, o } = pairOf('co-interior')
  return q({
    prompt: `${PARALLEL_GIVEN} The angles marked ○ and × are co-interior angles. What do they add to?`,
    diagram: DG.transversal({ ...lay, marks: [{ ...g, label: '○' }, { ...o, label: '×' }] }),
    answer: numA(180),
    suffix: '°',
    hint: 'Co-interior angles on parallel lines are supplementary.',
    steps: ['Co-interior angles are between the lines, on the same side of the transversal.', 'On parallel lines they are supplementary: ○ + × = 180°.'],
    meta: { t: 'coSum' },
  })
}

function coShape(): Question {
  const x = pron()
  const para = chance()
  const a = pick([55, 60, 65, 70, 75, 80, 100, 105, 110, 115, 120, 125])
  // the angle at C: never the one that would make the trapezium a parallelogram
  const b = pick([50, 60, 70, 80].filter((k) => k !== 180 - a))
  const side = 2.4
  const w = 5
  const ax = side * cosd(a)
  const ay = side * sind(a)
  const bx = para ? w + ax : w - ay / Math.tan((b * Math.PI) / 180)
  // the unknown is at A (beside D) or, in the trapezium, sometimes at B (beside C)
  const atB = !para && chance()
  const given = atB ? b : a
  return q({
    prompt: para ? `This is a parallelogram: both pairs of opposite sides are parallel. Find the value of ${v(x)}.` : `This is a trapezium. The 2 sides with arrowheads are parallel. Find the value of ${v(x)}.`,
    diagram: fig({
      pts: { A: [ax, ay], B: [bx, ay], C: [w, 0], D: [0, 0] },
      polys: [{ v: ['A', 'B', 'C', 'D'] }],
      arrows: [{ a: 'A', b: 'B', n: 1 }, { a: 'D', b: 'C', n: 1 }, ...(para ? [{ a: 'D', b: 'A', n: 2 }, { a: 'C', b: 'B', n: 2 }] : [])],
      angles: atB ? [{ at: 'C', a: 'D', b: 'B', text: dl(b), r: 24 }, { at: 'B', a: 'A', b: 'C', text: lab(x), r: 24 }] : [{ at: 'D', a: 'C', b: 'A', text: dl(a), r: 24 }, { at: 'A', a: 'D', b: 'B', text: lab(x), r: 24 }],
      label: para ? 'A parallelogram' : 'A trapezium',
    }),
    answer: numA(180 - given),
    prefix: `${v(x)} =`,
    hint: 'The side joining the 2 marked angles is a transversal that crosses the parallel sides. Both angles are between the parallel sides, on the same side of it.',
    steps: ['The 2 marked angles are between the parallel sides, on the same side of the side that joins them: they are co-interior angles.', `${v(x)} + ${given} = 180 (${REL_RULE['co-interior']})`, `${v(x)} = 180 ${MINUS} ${given} = ${180 - given}`],
    meta: { t: 'coShape', para, given },
  })
}

export const ex209 = (level: Level): Question => {
  if (level === 1) return pick([() => relLetter('co-interior'), () => relFind('co-interior', 1), () => relFind('co-interior', 1), coSum])()
  if (level === 2) return pick([() => relFind('co-interior', 2), () => relFind('co-interior', 2), () => relPair('co-interior'), () => relCount('co-interior')])()
  return pick([() => relTwoStep('co-interior'), coShape, eightFind])()
}

// ================================================================== 2.10 Angles on parallel lines

const REL_NAMES = ['Corresponding angles', 'Alternate angles', 'Co-interior angles', 'Vertically opposite angles']

function relName(): Question {
  const lay = layout(pick([1, 2] as Level[]))
  const kind = pick(['corresponding', 'alternate', 'co-interior', 'vertically opposite'] as const)
  let s1: Spot
  let s2: Spot
  if (kind === 'vertically opposite') {
    const c = pick([0, 1] as const)
    const p = pick([0, 1] as Pos[])
    s1 = { at: c, pos: p }
    s2 = { at: c, pos: (p + 2) as Pos }
  } else {
    const pr = pairOf(kind)
    s1 = pr.g
    s2 = pr.o
  }
  const why: Record<string, string> = {
    corresponding: 'They are in matching positions at the 2 crossings.',
    alternate: 'They are between the parallel lines, on opposite sides of the transversal.',
    'co-interior': 'They are between the parallel lines, on the same side of the transversal.',
    'vertically opposite': 'They are at the same crossing, facing each other across the point where the lines cross.',
  }
  return q({
    prompt: `${PARALLEL_GIVEN} What is the relationship between the 2 angles marked •?`,
    diagram: DG.transversal({ ...lay, marks: [{ ...s1, label: '•' }, { ...s2, label: '•' }] }),
    answer: mcFixedA(REL_NAMES, REL_NAMES[['corresponding', 'alternate', 'co-interior', 'vertically opposite'].indexOf(kind)]),
    hint: 'Are the angles at the same crossing? If not: are they both between the lines, and are they on the same side of the transversal?',
    steps: [why[kind], `They are ${kind} angles.`],
    meta: { t: 'relName', kind },
  })
}

const RULE_ENDS = ['are equal', 'add to 90°', 'add to 180°', 'add to 360°']

function ruleRecall(): Question {
  const rel = pick(RELS)
  return q({
    prompt: `Complete the sentence: when a transversal crosses parallel lines, ${rel} angles …`,
    answer: mcFixedA(RULE_ENDS, rel === 'co-interior' ? 'add to 180°' : 'are equal'),
    hint: 'Two of the 3 kinds of angle pairs are equal. The other kind is supplementary.',
    steps: ['Corresponding angles are equal. Alternate angles are equal. Co-interior angles are supplementary (add to 180°).', `${rel[0].toUpperCase() + rel.slice(1)} angles on parallel lines ${rel === 'co-interior' ? 'add to 180°' : 'are equal'}.`],
    meta: { t: 'rule', rel },
  })
}

const REASONS = ['Corresponding angles on parallel lines are equal', 'Alternate angles on parallel lines are equal', 'Co-interior angles on parallel lines are supplementary', 'Vertically opposite angles are equal']

function reasonQ(): Question {
  const rel = pick(RELS)
  const lay = layout(2)
  const { g, o } = pairOf(rel)
  const a = sizeAt(lay.theta, g.pos)
  const x = pron()
  const ans = rel === 'co-interior' ? 180 - a : a
  return q({
    prompt: `${PARALLEL_GIVEN} So ${v(x)} = ${ans}. Which reason is correct?`,
    diagram: DG.transversal({ ...lay, marks: [{ ...g, label: dl(a) }, { ...o, label: lab(x) }] }),
    answer: mcFixedA(REASONS, REASONS[RELS.indexOf(rel)]),
    hint: 'Decide where the 2 marked angles are: in matching positions, or between the lines on opposite sides or on the same side of the transversal.',
    steps: [REL_HINT[rel].replace(/^(\w+)-?(\w*) angles are/, 'The 2 marked angles are'), `They are ${rel} angles, so the reason is: ${REASONS[RELS.indexOf(rel)].toLowerCase()}.`],
    meta: { t: 'reason', rel, a },
  })
}

function namedRel(): Question {
  const [a, b, c, d, x, y, e, f] = letters(8)
  const lay = layout(2)
  // the 4 angles at each crossing, named by their letters (positions as in diagrams12)
  const nameAt = (s: Spot) => (s.at === 0 ? [b + x + e, e + x + a, a + x + y, y + x + b] : [d + y + x, x + y + c, c + y + f, f + y + d])[s.pos]
  const rel = pick(RELS)
  const { g, o } = pairOf(rel)
  const why = rel === 'corresponding' ? 'in the matching position at the other crossing' : rel === 'alternate' ? 'between the parallel lines, on the opposite side of the transversal' : 'between the parallel lines, on the same side of the transversal'
  return q({
    prompt: `${a}${b} ${PAR} ${c}${d}, and the transversal ${e}${f} crosses them at ${x} and ${y}. Which angle is ${rel} to ${A(nameAt(g))}?`,
    diagram: DG.transversal({ ...lay, marks: [], names: { l0: [a, b], l1: [c, d], x: [x, y], t: [e, f] } }),
    answer: mcA(A(nameAt(o)), ALL_POS.filter((p) => p !== o.pos).map((p) => A(nameAt({ at: o.at, pos: p })))),
    hint: `${REL_HINT[rel]} Find ${A(nameAt(g))} first: its vertex is the middle letter.`,
    steps: [`${A(nameAt(g))} has its vertex at ${g.at === 0 ? x : y}. The angle ${rel} to it has its vertex at ${o.at === 0 ? x : y}.`, `${A(nameAt(o))} is ${why}, so it is ${rel} to ${A(nameAt(g))}.`],
    meta: { t: 'namedRel', rel, ask: nameAt(g), ans: nameAt(o) },
  })
}

function xAndY(): Question {
  const lay = layout(2)
  // the given angle is between the lines: at the other crossing, one inside angle is alternate to it and the other is co-interior
  const [p0, p1] = pick(PAIRS.alternate)
  const flip = chance()
  const g: Spot = flip ? { at: 1, pos: p1 } : { at: 0, pos: p0 }
  const alt: Spot = flip ? { at: 0, pos: p0 } : { at: 1, pos: p1 }
  const co: Spot = { at: alt.at, pos: (alt.at === 0 ? 5 - alt.pos : 1 - alt.pos) as Pos }
  const a = sizeAt(lay.theta, g.pos)
  const [n1, n2] = sample(VARS, 2).sort()
  const altFirst = chance()
  const [v1, v2] = altFirst ? [a, 180 - a] : [180 - a, a]
  const opt = (s: number, t: number) => `${it(n1)} = ${s}, ${it(n2)} = ${t}`
  const [na, nc] = altFirst ? [n1, n2] : [n2, n1]
  return q({
    prompt: `${PARALLEL_GIVEN} Find the values of ${v(n1)} and ${v(n2)}.`,
    diagram: DG.transversal({ ...lay, marks: [{ ...g, label: dl(a) }, { ...alt, label: lab(na) }, { ...co, label: lab(nc) }] }),
    answer: mcA(opt(v1, v2), [opt(v2, v1), opt(a, a), opt(180 - a, 180 - a)]),
    hint: 'One unknown is alternate to the given angle. The other is co-interior to it.',
    steps: [`${v(na)} = ${a} (${REL_RULE.alternate})`, `${v(nc)} = 180 ${MINUS} ${a} = ${180 - a} (${REL_RULE['co-interior']})`],
    meta: { t: 'xAndY', a },
  })
}

export const ex210 = (level: Level): Question => {
  if (level === 1) return pick([relName, relName, ruleRecall, () => relFind(pick(RELS), 1, true), () => relFind(pick(RELS), 1, true)])()
  if (level === 2) return pick([() => relFind(pick(RELS), 2, true), () => relFind(pick(RELS), 2, true), reasonQ, namedRel])()
  return pick([xAndY, () => relTwoStep(pick(RELS), true), eightFind])()
}

// ================================================================== 2.11 Proving parallel lines

const fits = (rel: Rel) => (rel === 'co-interior' ? 'co-interior angles add to 180°' : `${rel} angles are equal`)
const failsTo = (rel: Rel) => (rel === 'co-interior' ? 'co-interior angles do not add to 180°' : `${rel} angles are not equal`)
const OFF = [-12, -9, -7, -5, -4, 4, 5, 7, 9, 12]

function isParallel(level: Level): Question {
  const rel: Rel = level === 1 ? pick(['alternate', 'corresponding'] as Rel[]) : pick(['alternate', 'corresponding', 'co-interior', 'co-interior'] as Rel[])
  const parallel = chance()
  const lay = layout(level === 1 ? 1 : 2)
  const theta2 = parallel ? lay.theta : lay.theta + pick(OFF)
  const [p0, p1] = pick(PAIRS[rel])
  const a = sizeAt(lay.theta, p0)
  const b = sizeAt(theta2, p1)
  const [l1, l2, l3, l4] = letters(4)
  const AB = l1 + l2
  const CD = l3 + l4
  const diagram = DG.transversal({ rot: lay.rot, theta: lay.theta, theta2, arrows: false, marks: [{ at: 0, pos: p0, label: dl(a) }, { at: 1, pos: p1, label: dl(b) }], names: { l0: [l1, l2], l1: [l3, l4] } })
  const compare = rel === 'co-interior' ? `${deg(a)} + ${deg(b)} = ${deg(a + b)}${a + b === 180 ? '' : ', not 180°'}` : a === b ? `Both angles are ${deg(a)}: they are equal.` : `${deg(a)} and ${deg(b)} are not equal.`
  const steps = [`The marked angles are ${rel} angles.`, compare, parallel ? `∴ ${AB} ${PAR} ${CD} (${fits(rel)})` : `∴ ${AB} is not parallel to ${CD} (${failsTo(rel)})`]
  if (level === 1) {
    const options = [`Yes, ${AB} ${PAR} ${CD}`, `No, ${AB} is not parallel to ${CD}`]
    return q({
      prompt: `Is ${AB} parallel to ${CD}?`,
      diagram,
      answer: mcFixedA(options, options[parallel ? 0 : 1]),
      hint: `The marked angles are ${rel} angles. The lines are parallel only if these angles are equal.`,
      steps,
      meta: { t: 'isParallel', rel, a, b },
    })
  }
  const options = ['Yes: alternate angles are equal', 'Yes: corresponding angles are equal', 'Yes: co-interior angles add to 180°', `No: ${AB} is not parallel to ${CD}`]
  return q({
    prompt: `Use the 2 marked angles to decide whether ${AB} ${PAR} ${CD}. Which is correct?`,
    diagram,
    answer: mcFixedA(options, parallel ? options[['alternate', 'corresponding', 'co-interior'].indexOf(rel)] : options[3]),
    hint: 'First decide whether the marked angles are alternate, corresponding or co-interior. Then test them: equal, or adding to 180°?',
    steps,
    meta: { t: 'isParallel', rel, a, b },
  })
}

function testRule(): Question {
  const rel = pick(RELS)
  return q({
    prompt: `Complete the sentence: 2 lines crossed by a transversal are parallel if a pair of ${rel} angles …`,
    answer: mcFixedA(RULE_ENDS, rel === 'co-interior' ? 'add to 180°' : 'are equal'),
    hint: 'These are the parallel-line rules used backwards.',
    steps: ['Two lines are parallel if alternate angles are equal, or corresponding angles are equal, or co-interior angles add to 180°.', `For ${rel} angles: they must ${rel === 'co-interior' ? 'add to 180°' : 'be equal'}.`],
    meta: { t: 'rule', rel },
  })
}

function valueForParallel(level: Level): Question {
  const rel = pick(RELS)
  const lay = layout(level === 3 ? 3 : 2)
  const { g, o } = pairOf(rel)
  const k = level === 3 ? pick([1, 2, 3]) : 0
  const xPos = ((o.pos + k) % 4) as Pos
  const a = sizeAt(lay.theta, g.pos)
  const partner = sizeAt(lay.theta, o.pos)
  const ans = sizeAt(lay.theta, xPos)
  const x = pron()
  const [l1, l2, l3, l4] = letters(4)
  const AB = l1 + l2
  const CD = l3 + l4
  return q({
    prompt: `Which value of ${v(x)} would prove that ${AB} ${PAR} ${CD}?`,
    diagram: DG.transversal({ ...lay, arrows: false, marks: [{ ...g, label: dl(a) }, { at: o.at, pos: xPos, label: lab(x) }], names: { l0: [l1, l2], l1: [l3, l4] } }),
    answer: numA(ans),
    prefix: `${v(x)} =`,
    hint: k === 0 ? `The marked angles are ${rel} angles. The lines are parallel if ${fits(rel)}.` : `The lines are parallel if ${fits(rel)}. Find the angle ${rel} to the ${deg(a)} angle first, then use it to find ${v(x)}.`,
    steps:
      k === 0
        ? [`The marked angles are ${rel} angles.`, `${AB} ${PAR} ${CD} if ${fits(rel)}.`, rel === 'co-interior' ? `${v(x)} = 180 ${MINUS} ${a} = ${ans}` : `${v(x)} = ${a}`]
        : [
            `${AB} ${PAR} ${CD} if ${fits(rel)}.`,
            `So the angle ${rel} to the ${deg(a)} angle must be ${deg(partner)}.`,
            k === 2 ? `${v(x)} is vertically opposite that angle, so ${v(x)} = ${partner}.` : `${v(x)} is next to that angle on a straight line, so ${v(x)} = 180 ${MINUS} ${partner} = ${ans}.`,
          ],
    meta: { t: 'valueFor', rel, a, k },
  })
}

function isParallelTwoStep(): Question {
  // 2 marked angles that are not a direct pair: one of them has to be moved across its crossing first
  let p0: Pos, p1: Pos, moveAt: 0 | 1, rel2: Rel
  for (;;) {
    p0 = pick(ALL_POS)
    p1 = pick(ALL_POS)
    if (DG.relation({ at: 0, pos: p0 }, { at: 1, pos: p1 }) !== 'none') continue
    const r0 = DG.relation({ at: 0, pos: ((p0 + 2) % 4) as Pos }, { at: 1, pos: p1 })
    const r1 = DG.relation({ at: 0, pos: p0 }, { at: 1, pos: ((p1 + 2) % 4) as Pos })
    if (r0 !== 'none') {
      moveAt = 0
      rel2 = r0 as Rel
      break
    }
    if (r1 !== 'none') {
      moveAt = 1
      rel2 = r1 as Rel
      break
    }
  }
  const parallel = chance()
  const lay = layout(2)
  const theta2 = parallel ? lay.theta : lay.theta + pick(OFF)
  const a = sizeAt(lay.theta, p0)
  const b = sizeAt(theta2, p1)
  const [l1, l2, l3, l4] = letters(4)
  const AB = l1 + l2
  const CD = l3 + l4
  const [moved, stay] = moveAt === 0 ? [a, b] : [b, a]
  const options = [`Yes, ${AB} ${PAR} ${CD}`, `No, ${AB} is not parallel to ${CD}`]
  return q({
    prompt: `Is ${AB} parallel to ${CD}?`,
    diagram: DG.transversal({ rot: lay.rot, theta: lay.theta, theta2, arrows: false, marks: [{ at: 0, pos: p0, label: dl(a) }, { at: 1, pos: p1, label: dl(b) }], names: { l0: [l1, l2], l1: [l3, l4] } }),
    answer: mcFixedA(options, options[parallel ? 0 : 1]),
    hint: 'The 2 marked angles are not alternate, corresponding or co-interior. Find the angle vertically opposite one of them first.',
    steps: [
      `The angle vertically opposite the ${deg(moved)} angle is also ${deg(moved)}.`,
      `That angle and the ${deg(stay)} angle are ${rel2} angles.`,
      rel2 === 'co-interior' ? `${deg(moved)} + ${deg(stay)} = ${deg(moved + stay)}${moved + stay === 180 ? '' : ', not 180°'}` : moved === stay ? `Both are ${deg(moved)}: they are equal.` : `${deg(moved)} and ${deg(stay)} are not equal.`,
      parallel ? `∴ ${AB} ${PAR} ${CD} (${fits(rel2)})` : `∴ ${AB} is not parallel to ${CD} (${failsTo(rel2)})`,
    ],
    meta: { t: 'isParallel2', a, b },
  })
}

export const ex211 = (level: Level): Question => {
  if (level === 1) return pick([() => isParallel(1), () => isParallel(1), () => isParallel(1), testRule])()
  if (level === 2) return pick([() => isParallel(2), () => isParallel(2), () => valueForParallel(2)])()
  return pick([isParallelTwoStep, () => valueForParallel(3)])()
}

// ================================================================== Power plus (extension)

function earthSpin(level: Level): Question {
  if (level === 1) {
    const h = int(2, 12)
    return q({
      prompt: `The Earth spins once on its axis (360°) every 24 hours. Through how many degrees does it spin in ${h} hours?`,
      answer: numA(15 * h),
      suffix: '°',
      hint: 'Find how far it spins in 1 hour first.',
      steps: [`In 1 hour: 360° ${DIVIDE} 24 = 15°`, `In ${h} hours: ${h} ${TIMES} 15° = ${deg(15 * h)}`],
      meta: { t: 'earth', minutes: 60 * h },
    })
  }
  const m = pick([2, 4, 8, 10, 12, 20, 30, 40])
  return q({
    prompt: `The Earth spins once on its axis (360°) every 24 hours. Through how many degrees does it spin in ${m} minutes?`,
    answer: numA(m / 4),
    suffix: '°',
    hint: 'Find how far it spins in 1 hour, then how long it takes to spin 1°.',
    steps: [`In 1 hour: 360° ${DIVIDE} 24 = 15°`, `1 hour is 60 minutes, so it spins 1° every 60 ${DIVIDE} 15 = 4 minutes.`, `In ${m} minutes: ${m} ${DIVIDE} 4 = ${deg(m / 4)}`],
    meta: { t: 'earth', minutes: m },
  })
}

function clockHand(level: Level): Question {
  if (level === 1) {
    const m = 5 * int(1, 11)
    return q({
      prompt: `Through how many degrees does the minute hand of a clock turn in ${m} minutes?`,
      answer: numA(6 * m),
      suffix: '°',
      hint: 'The minute hand makes a full turn (360°) in 60 minutes.',
      steps: [`In 1 minute: 360° ${DIVIDE} 60 = 6°`, `In ${m} minutes: ${m} ${TIMES} 6° = ${deg(6 * m)}`],
      meta: { t: 'clockHand', hand: 'minute', minutes: m },
    })
  }
  if (chance()) {
    const h = int(2, 11)
    return q({
      prompt: `Through how many degrees does the hour hand of a clock turn in ${h} hours?`,
      answer: numA(30 * h),
      suffix: '°',
      hint: 'The hour hand makes a full turn (360°) in 12 hours.',
      steps: [`In 1 hour: 360° ${DIVIDE} 12 = 30°`, `In ${h} hours: ${h} ${TIMES} 30° = ${deg(30 * h)}`],
      meta: { t: 'clockHand', hand: 'hour', minutes: 60 * h },
    })
  }
  const m = pick([10, 20, 30, 40, 50])
  return q({
    prompt: `Through how many degrees does the hour hand of a clock turn in ${m} minutes?`,
    answer: numA(m / 2),
    suffix: '°',
    hint: 'The hour hand turns 30° in 1 hour (60 minutes).',
    steps: [`In 1 hour (60 minutes): 360° ${DIVIDE} 12 = 30°`, `So it turns 1° every 2 minutes.`, `In ${m} minutes: ${m} ${DIVIDE} 2 = ${deg(m / 2)}`],
    meta: { t: 'clockHand', hand: 'hour', minutes: m },
  })
}

const FACING = ['The front', 'The right', 'The back', 'The left']

function turnsQ(level: Level): Question {
  const n = level === 2 ? 3 : 4
  let turns: number[]
  let net: number
  do {
    turns = Array.from({ length: n }, () => (chance() ? 1 : -1) * 10 * int(3, 24))
    net = turns.reduce((s, t) => s + t, 0)
  } while (net % 90 !== 0 || !turns.some((t) => t % 90 !== 0) || Math.abs(net) > 720)
  const rights = turns.filter((t) => t > 0)
  const lefts = turns.filter((t) => t < 0).map((t) => -t)
  const R = rights.reduce((s, t) => s + t, 0)
  const Lf = lefts.reduce((s, t) => s + t, 0)
  const way = net >= 0 ? 'right' : 'left'
  const mag = Math.abs(net)
  const rem = mag % 360
  const facing = FACING[(((net / 90) % 4) + 4) % 4]
  const sum = (xs: number[], total: number) => (xs.length > 1 ? `${xs.map(deg).join(' + ')} = ${deg(total)}` : deg(total))
  const steps: string[] = []
  if (rights.length) steps.push(`Right turns: ${sum(rights, R)}`)
  if (lefts.length) steps.push(`Left turns: ${sum(lefts, Lf)}`)
  if (net === 0) steps.push('The right turns and the left turns cancel out.')
  else if (R && Lf) steps.push(`Overall: ${deg(Math.max(R, Lf))} ${MINUS} ${deg(Math.min(R, Lf))} = ${deg(mag)} to the ${way}`)
  if (mag >= 360 && rem !== 0) steps.push(`A turn of 360° brings you back to where you started, so ${deg(mag)} is the same as ${deg(rem)} to the ${way}.`)
  steps.push(rem === 0 ? (mag === 0 ? 'You are facing the front again.' : `${deg(mag)} is ${mag / 360 === 1 ? 'a full turn' : `${mag / 360} full turns`}, so you are facing the front again.`) : `${deg(rem)} to the ${way} is ${rem / 90} quarter ${rem === 90 ? 'turn' : 'turns'}: you are facing ${facing.toLowerCase()}.`)
  return q({
    prompt: `You are standing facing the front of the room. You make these turns, one after the other: ${turns.map((t) => `${t > 0 ? 'right' : 'left'} ${deg(Math.abs(t))}`).join(', ')}. Which way are you facing now?`,
    answer: mcFixedA(FACING, facing),
    hint: 'Add up the right turns and the left turns, then find the difference. A turn of 360° brings you back to where you started.',
    steps,
    meta: { t: 'turns', turns },
  })
}

/** a bend between 2 parallel lines: the angle at the bend is the sum of the 2 angles at the lines */
function zigzag(): Question {
  const a = 5 * int(5, 13)
  const b = 5 * int(5, 13)
  const x = pron()
  const h = 3
  const m = 1.5
  const xp = (h - m) / Math.tan((a * Math.PI) / 180)
  const xq = m / Math.tan((b * Math.PI) / 180)
  const right = Math.max(xp, xq) + 1.2
  return q({
    prompt: `${PARALLEL_GIVEN} Find the value of ${v(x)}.`,
    diagram: fig({
      pts: { T1: [-0.9, h], T2: [right, h], U1: [-0.9, 0], U2: [right, 0], P: [xp, h], Q: [xq, 0], B: [0, m] },
      segs: [{ a: 'T1', b: 'T2' }, { a: 'U1', b: 'U2' }, { a: 'P', b: 'B' }, { a: 'B', b: 'Q' }],
      arrows: [{ a: 'P', b: 'T2', n: 1 }, { a: 'Q', b: 'U2', n: 1 }],
      angles: [{ at: 'P', a: 'T1', b: 'B', text: dl(a), r: 26 }, { at: 'Q', a: 'U1', b: 'B', text: dl(b), r: 26 }, { at: 'B', a: 'P', b: 'Q', text: lab(x), r: 20 }],
      label: 'A bent path between two parallel lines',
      maxH: 230,
    }),
    answer: numA(a + b),
    prefix: `${v(x)} =`,
    hint: 'Imagine a third line through the bend, parallel to the other 2 lines. It cuts the angle into 2 parts.',
    steps: [
      'Draw a third line through the bend, parallel to the other 2 lines. It cuts the angle at the bend into 2 parts.',
      `The top part is ${deg(a)} (${REL_RULE.alternate}).`,
      `The bottom part is ${deg(b)} (${REL_RULE.alternate}).`,
      `${v(x)} = ${a} + ${b} = ${a + b}`,
    ],
    meta: { t: 'zigzag', a, b },
  })
}

function rhombusPath(): Question {
  const [pd, pe, pf, pg] = letters(4)
  const len = pick([5, 6, 7, 8])
  const t = pick([50, 60, 70])
  const s = 3
  return q({
    prompt: `${pd}${pe} and ${pd}${pg} are both ${len} cm long, and the angle between them is not a right angle. A line through ${pg} is drawn parallel to ${pd}${pe}, and a line through ${pe} is drawn parallel to ${pd}${pg}. The lines meet at ${pf}. Which name describes the quadrilateral ${pd}${pe}${pf}${pg} best?`,
    diagram: fig({
      pts: { [pd]: [0, 0], [pe]: [s, 0], [pf]: [s + s * cosd(t), s * sind(t)], [pg]: [s * cosd(t), s * sind(t)] },
      segs: [{ a: pd, b: pe }, { a: pd, b: pg }, { a: pg, b: pf, dash: true }, { a: pe, b: pf, dash: true }],
      arrows: [{ a: pd, b: pe, n: 1 }, { a: pg, b: pf, n: 1 }, { a: pd, b: pg, n: 2 }, { a: pe, b: pf, n: 2 }],
      names: [pd, pe, pf, pg],
      label: 'Two equal intervals and two lines parallel to them',
    }),
    answer: mcFixedA(['Rectangle', 'Rhombus', 'Square'], 'Rhombus'),
    hint: 'Both pairs of opposite sides are parallel. What does that tell you about the lengths of the opposite sides?',
    steps: ['Both pairs of opposite sides are parallel, so the quadrilateral is a parallelogram.', `Opposite sides of a parallelogram are equal, so all 4 sides are ${len} cm long.`, 'It has 4 equal sides and no right angles: it is a rhombus.'],
    meta: { t: 'quad', variant: 'rhombus' },
  })
}

export const exPowerPlus = (level: Level): Question => {
  if (level === 1) return pick([() => earthSpin(1), () => clockHand(1)])()
  if (level === 2) return pick([() => earthSpin(2), () => clockHand(2), () => turnsQ(2)])()
  return pick([() => turnsQ(3), zigzag, rhombusPath])()
}

// ================================================================== Topic test (like Test Yourself 2)

const T = (skill: string, level: Level, gen: () => Question): TestItem => ({ skill, level, gen: () => gen() })

export const NCM2_TEST: TestItem[] = [
  T('y7-ang-naming', 1, vertexQ),
  T('y7-ang-naming', 2, () => adjacentQ(2)),
  T('y7-ang-naming', 2, nameMarked),
  T('y7-ang-measuring', 2, () => protractorRead(2)),
  T('y7-ang-measuring', 3, reflexDraw),
  T('y7-ang-classify', 1, classifyDiagram),
  T('y7-ang-compsupp', 2, () => complementOf(2)),
  T('y7-ang-compsupp', 2, () => supplementOf(2)),
  T('y7-ang-compsupp', 2, () => onLine(2)),
  T('y7-ang-point', 2, () => atPointQ(2)),
  T('y7-ang-lines', 2, () => lineSetQ(2)),
  T('y7-ang-corresponding', 1, () => relLetter('corresponding')),
  T('y7-ang-alternate', 1, () => relLetter('alternate')),
  T('y7-ang-cointerior', 1, () => relLetter('co-interior')),
  T('y7-ang-parallel', 1, relName),
  T('y7-ang-parallel', 2, () => relFind(pick(RELS), 2, true)),
  T('y7-ang-proving', 2, () => isParallel(2)),
  T('y7-ang-proving', 2, () => valueForParallel(2)),
]

// ================================================================== Skills, in textbook order

const ref = (n: string) => `NCM 7 Ex ${n}`

export const NCM2_SKILLS: Skill[] = [
  {
    id: 'y7-ang-naming',
    title: 'Naming angles',
    ref: ref('2.01'),
    outcomes: OUTCOMES,
    summary: 'Name points, lines, rays and intervals, and name angles with 1 or 3 letters.',
    learn: {
      intro:
        '<p>A <b>point</b> is a position, shown by a dot and named with a capital letter. A <b>line</b> goes on forever in both directions (arrows at both ends). A <b>ray</b> starts at a point and goes on forever in one direction (one arrow). An <b>interval</b> is the part of a line between 2 points, so it has a definite length.</p><p>An <b>angle</b> is the amount of turn between 2 <b>arms</b> that meet at a <b>vertex</b>. We name an angle with 3 letters, such as ∠PGH or ∠HGP: one letter from each arm, with the vertex in the middle. If it is the only angle at that vertex, 1 letter is enough: ∠G.</p>',
      keyPoints: [
        'The middle letter of an angle’s name is always the vertex.',
        'Use 3 letters when more than one angle shares the vertex, so it is clear which angle you mean.',
        '<b>Adjacent angles</b> are next to each other: they share a vertex and an arm, and lie on either side of that arm.',
        'The line AB, the ray AB and the interval AB are different things: check the arrows.',
      ],
      vocab: [
        ['vertex', 'the point where the 2 arms of an angle meet'],
        ['arm', 'one of the 2 rays that make an angle'],
        ['ray', 'part of a line that starts at a point and goes on forever in one direction'],
        ['interval', 'part of a line with a point at each end (also called a line segment)'],
        ['adjacent angles', 'angles that share a vertex and a common arm, and lie on either side of that arm'],
      ],
    },
    gen: ex201,
    levels: { 1: 'Lines, rays and intervals; the vertex and arms; naming one angle', 2: 'Naming a marked angle when several share a vertex; adjacent angles and their common arm', 3: 'Two marked angles; adjacent angles among 5 arms; counting all the angles at a vertex' },
  },
  {
    id: 'y7-ang-measuring',
    title: 'Measuring and drawing angles',
    ref: ref('2.02'),
    outcomes: OUTCOMES,
    summary: 'Read a protractor on either scale, estimate and compare angles, and work out reflex angles.',
    learn: {
      intro:
        '<p>Angles are measured in <b>degrees</b> (°) with a <b>protractor</b>. Put the centre mark on the vertex and line up the base line with one arm. That arm points to 0° on one of the 2 scales: read <b>that</b> scale where the other arm crosses it.</p><p>A protractor only goes up to 180°. For a <b>reflex angle</b>, measure the smaller angle on the other side and subtract it from 360°, because the 2 angles make a full turn. For example, if the smaller angle is 140°, the reflex angle is 360° − 140° = 220°.</p>',
      keyPoints: [
        'Estimate first: is the angle smaller or bigger than a right angle (90°)? That tells you which scale makes sense.',
        'The size of an angle is the amount of turn. Longer arms do not make a bigger angle.',
        'To draw a reflex angle such as 250°, draw 360° − 250° = 110° and mark the angle on the outside of the arms.',
        'Drawing angles with a protractor is practised in your book. This page practises reading the scales and the working out.',
      ],
      vocab: [
        ['protractor', 'an instrument for measuring and drawing angles'],
        ['degree', 'the unit for measuring angles; a full turn is 360°'],
        ['reflex angle', 'an angle between 180° and 360°'],
      ],
    },
    gen: ex202,
    levels: { 1: 'Reading a protractor to the nearest 10°; estimating', 2: 'Either scale, to the nearest 5°; ordering angles; a reflex angle from the angle on the other side', 3: 'Reading to the nearest degree; reflex angles with a protractor; planning how to draw a reflex angle' },
  },
  {
    id: 'y7-ang-classify',
    title: 'Types of angles',
    ref: ref('2.03'),
    outcomes: OUTCOMES,
    summary: 'Classify angles as acute, right, obtuse, straight, reflex or a revolution.',
    learn: {
      intro: '<p>Angles are sorted into 6 types by their size. Three of the types are an exact size (90°, 180° and 360°); the other three cover every size in between.</p>',
      keyPoints: [
        '<b>Acute</b>: less than 90°',
        '<b>Right</b>: exactly 90°, a quarter turn (marked with a small square)',
        '<b>Obtuse</b>: more than 90° but less than 180°',
        '<b>Straight</b>: exactly 180°, a half turn',
        '<b>Reflex</b>: more than 180° but less than 360°',
        '<b>Revolution</b>: exactly 360°, a full turn',
      ],
    },
    gen: ex203,
    levels: { 1: 'Classify from a diagram or an easy size; degrees in quarter, half and full turns', 2: 'Sizes close to 90°, 180° and 360°; choosing the angle of a given type', 3: 'Two angles in one diagram; angles between clock hands; counting the angles of one type in a list' },
  },
  {
    id: 'y7-ang-compsupp',
    title: 'Complementary and supplementary angles',
    ref: ref('2.04'),
    outcomes: OUTCOMES,
    summary: 'Find complements and supplements, and unknown angles in a right angle or on a straight line.',
    learn: {
      intro:
        '<p>Two angles are <b>complementary</b> if they add to 90°, and <b>supplementary</b> if they add to 180°. For example, 33° and 57° are complementary; 33° and 147° are supplementary.</p><p>Angles that fit together to make a right angle add to 90°. Angles that fit together on a straight line add to 180°. To find an unknown angle, write an equation and give the reason.</p>',
      keyPoints: [
        'Complement of an angle = 90° − the angle. Supplement = 180° − the angle.',
        'Angles in a right angle are complementary (add to 90°).',
        'Angles on a straight line are supplementary (add to 180°).',
        'To remember which is which: C comes before S in the alphabet, and 90 comes before 180.',
        'Set out your working with a reason: <i>x</i> + 130 = 180 (angles on a straight line), so <i>x</i> = 50.',
      ],
      vocab: [
        ['complementary angles', '2 angles that add to 90°'],
        ['supplementary angles', '2 angles that add to 180°'],
        ['variable', 'a letter that stands for a number (also called a pronumeral)'],
      ],
    },
    gen: ex204,
    levels: { 1: 'Complements and supplements of multiples of 5; one unknown in a right angle or on a line; adding adjacent angles', 2: 'Any whole-number angles; 3 angles; naming complementary and supplementary pairs; a leaning post', 3: 'Equal unknown angles; complement and supplement of the same angle; one angle a multiple of the other' },
  },
  {
    id: 'y7-ang-point',
    title: 'Angles at a point and vertically opposite angles',
    ref: ref('2.05'),
    outcomes: OUTCOMES,
    summary: 'Use angles at a point (360°) and vertically opposite angles (equal) to find unknown angles.',
    learn: {
      intro:
        '<p>Angles that meet at a point make a full turn, so they add to <b>360°</b>.</p><p>When 2 straight lines cross, they make 2 pairs of <b>vertically opposite angles</b>. Vertically opposite angles face each other across the crossing point, and they are <b>equal</b>.</p>',
      keyPoints: [
        'Angles at a point (in a revolution) add to 360°.',
        'Vertically opposite angles are equal.',
        'Angles next to each other where 2 lines cross are on a straight line, so they add to 180°.',
        'Why vertically opposite angles are equal: each of them is the supplement of the same angle between them.',
      ],
      vocab: [
        ['angles at a point', 'angles that share a vertex and together make a full turn'],
        ['vertically opposite angles', 'the 2 angles that face each other where 2 straight lines cross'],
      ],
    },
    gen: ex205,
    levels: { 1: 'Which angle is vertically opposite; finding it; 3 angles at a point', 2: '4 angles at a point, including a right angle; the angle beside a given angle; named angles; 2 unknowns', 3: 'Equal unknown angles at a point; 3 lines through a point; supplementary pairs where lines cross' },
  },
  {
    id: 'y7-ang-lines',
    title: 'Parallel and perpendicular lines',
    ref: ref('2.06'),
    outcomes: OUTCOMES,
    summary: 'Recognise parallel, perpendicular and intersecting lines, and use the symbols ∥ and ⊥.',
    learn: {
      intro:
        '<p>A line is named by 2 points on it, such as the line AB. Two lines <b>intersect</b> when they cross at a point.</p><p><b>Parallel lines</b> point in the same direction, stay the same distance apart and never meet. They are marked with matching arrowheads, and we write AB ∥ CD. <b>Perpendicular lines</b> meet at right angles (90°). The right angle is marked with a small square, and we write PQ ⊥ XY.</p>',
      keyPoints: [
        '∥ means “is parallel to”. ⊥ means “is perpendicular to”.',
        'Matching arrowheads mark parallel lines. A second set of parallel lines gets double arrowheads.',
        'A small square marks a right angle, so the lines there are perpendicular.',
        'If a line is perpendicular to one of 2 parallel lines, it is perpendicular to the other one as well.',
        'The textbook also constructs parallel and perpendicular lines with compasses. That is hands-on work for your book: this page practises recognising the lines and reasoning about them.',
      ],
      vocab: [
        ['intersect', 'to cross at a point'],
        ['parallel lines', 'lines that point in the same direction and never meet'],
        ['perpendicular lines', 'lines that meet at right angles'],
      ],
    },
    gen: ex206,
    levels: { 1: 'The symbols ∥ and ⊥; parallel, perpendicular or just intersecting; where lines intersect', 2: 'Finding parallel and perpendicular lines among 4 lines and on a street map; writing statements in symbols', 3: 'Counting pairs of lines; reasoning from one right angle; quadrilaterals made from parallel or perpendicular intervals' },
  },
  {
    id: 'y7-ang-corresponding',
    title: 'Corresponding angles on parallel lines',
    ref: ref('2.07'),
    outcomes: OUTCOMES,
    summary: 'Identify corresponding angles where a transversal crosses 2 lines, and use them on parallel lines.',
    learn: {
      intro:
        '<p>A <b>transversal</b> is a line that crosses 2 or more other lines. When it crosses 2 lines it makes 8 angles: 4 at each crossing.</p><p><b>Corresponding angles</b> are in matching positions at the 2 crossings: for example, both above their line and both on the right of the transversal. When the lines are <b>parallel</b>, corresponding angles are <b>equal</b>.</p>',
      keyPoints: [
        '“Corresponding” means “matching”.',
        'There are 4 pairs of corresponding angles.',
        'Corresponding angles on parallel lines are equal.',
        'Imagine sliding one crossing along the transversal onto the other: corresponding angles land on top of each other.',
        'Memory aid: corresponding angles make an F shape (it may be backwards or upside down).',
      ],
      vocab: [
        ['transversal', 'a line that crosses 2 or more other lines'],
        ['corresponding angles', 'angles in matching positions where a transversal crosses 2 lines'],
      ],
    },
    gen: ex207,
    levels: { 1: 'Find the corresponding angle; equal angles on level parallel lines', 2: 'Tilted lines; choosing the corresponding pair among all 8 angles; counting the pairs', 3: 'Two steps: a corresponding angle, then a straight line or vertically opposite angles; all 8 angles' },
  },
  {
    id: 'y7-ang-alternate',
    title: 'Alternate angles on parallel lines',
    ref: ref('2.08'),
    outcomes: OUTCOMES,
    summary: 'Identify alternate angles where a transversal crosses 2 lines, and use them on parallel lines.',
    learn: {
      intro: '<p><b>Alternate angles</b> are between the 2 lines, on opposite sides of the transversal. When the lines are <b>parallel</b>, alternate angles are <b>equal</b>.</p>',
      keyPoints: [
        '“Alternate” means “changing sides”: one angle is on each side of the transversal.',
        'Both angles must be between the 2 lines.',
        'There are 2 pairs of alternate angles.',
        'Alternate angles on parallel lines are equal.',
        'Memory aid: alternate angles make a Z shape (it may be backwards or stretched).',
      ],
      vocab: [['alternate angles', 'angles between 2 lines, on opposite sides of a transversal']],
    },
    gen: ex208,
    levels: { 1: 'Find the alternate angle; equal angles on level parallel lines', 2: 'Tilted lines; choosing the alternate pair among all 8 angles; counting the pairs', 3: 'Two steps; alternate angles in a Z made of intervals; how many of the 8 angles are equal' },
  },
  {
    id: 'y7-ang-cointerior',
    title: 'Co-interior angles on parallel lines',
    ref: ref('2.09'),
    outcomes: OUTCOMES,
    summary: 'Identify co-interior angles where a transversal crosses 2 lines, and use them on parallel lines.',
    learn: {
      intro:
        '<p><b>Co-interior angles</b> are between the 2 lines, on the same side of the transversal. When the lines are <b>parallel</b>, co-interior angles are <b>supplementary</b>: they add to 180°. They are not equal (unless both are 90°).</p>',
      keyPoints: [
        '“Co-interior” means “together inside”.',
        'There are 2 pairs of co-interior angles.',
        'Co-interior angles on parallel lines add to 180°.',
        'Memory aid: co-interior angles make a C or U shape.',
        'In a parallelogram or a trapezium, 2 angles next to each other between the parallel sides are co-interior.',
      ],
      vocab: [['co-interior angles', 'angles between 2 lines, on the same side of a transversal']],
    },
    gen: ex209,
    levels: { 1: 'Find the co-interior angle; what the pair adds to; subtracting from 180°', 2: 'Tilted lines; choosing the co-interior pair among all 8 angles; counting the pairs', 3: 'Two steps; parallelograms and trapeziums; any of the 8 angles' },
  },
  {
    id: 'y7-ang-parallel',
    title: 'Angles on parallel lines',
    ref: ref('2.10'),
    outcomes: OUTCOMES,
    summary: 'Choose between corresponding, alternate and co-interior angles to find unknown angles, giving reasons.',
    learn: {
      intro:
        '<p>When a transversal crosses <b>parallel</b> lines, there are 3 kinds of angle pairs to look for. First decide which kind of pair you have, then use its rule.</p><p>Write the reason in brackets, like this: <i>m</i> + 55 = 180 (co-interior angles on parallel lines), so <i>m</i> = 125.</p>',
      keyPoints: [
        'Corresponding angles (matching positions) are equal.',
        'Alternate angles (between the lines, opposite sides of the transversal) are equal.',
        'Co-interior angles (between the lines, same side of the transversal) add to 180°.',
        'These rules only work when the lines are parallel: look for the arrowheads.',
        'Always give the reason, for example: (alternate angles on parallel lines).',
      ],
    },
    gen: ex210,
    levels: { 1: 'Name the relationship; recall the rules; one-step unknowns', 2: 'Tilted lines; choosing the reason; naming angles with letters', 3: 'Two unknowns; two-step problems; any of the 8 angles' },
  },
  {
    id: 'y7-ang-proving',
    title: 'Proving parallel lines',
    ref: ref('2.11'),
    outcomes: OUTCOMES,
    summary: 'Use alternate, corresponding or co-interior angles to decide whether 2 lines are parallel.',
    learn: {
      intro:
        '<p>The angle rules also work backwards. If one pair of angles fits its rule, the lines <b>must</b> be parallel.</p><p>Two lines crossed by a transversal are parallel if a pair of alternate angles are equal, <b>or</b> a pair of corresponding angles are equal, <b>or</b> a pair of co-interior angles add to 180°. If the angles do not fit the rule, the lines are not parallel, even if they look parallel.</p>',
      keyPoints: [
        'You cannot tell that lines are parallel just by looking: use the angles.',
        'Write the conclusion with a reason: ∴ AB ∥ CD (alternate angles are equal).',
        'The symbol ∴ means “therefore”.',
        'If co-interior angles add to anything other than 180°, the lines are not parallel.',
        'In these questions the lines have no arrowheads, because whether they are parallel is what you have to decide.',
      ],
    },
    gen: ex211,
    levels: { 1: 'Alternate or corresponding angles: equal or not?; recalling the 3 tests', 2: 'All 3 tests, with the reason; the value that would make the lines parallel', 3: 'Angles that are not a direct pair: use vertically opposite angles or a straight line first' },
  },
  {
    id: 'y7-ang-powerplus',
    title: 'Power plus: angle challenges',
    ref: 'NCM 7 Power plus',
    tag: 'extension',
    outcomes: OUTCOMES,
    summary: 'Harder questions: how far the Earth and clock hands turn, where you face after a set of turns, and bends between parallel lines.',
    learn: {
      intro: '<p>These questions stretch what you know about angles. A full turn is 360°, so a half turn is 180° and a quarter turn is 90°.</p>',
      keyPoints: [
        'The Earth spins once (360°) in 24 hours, so it turns 15° each hour.',
        'The minute hand of a clock turns 360° in 60 minutes: 6° each minute. The hour hand turns 30° each hour.',
        'For a set of turns, add the right turns, add the left turns, then find the difference. Take away any full turns of 360°.',
        'For a bend between parallel lines, draw another parallel line through the bend and use alternate angles twice.',
      ],
    },
    gen: exPowerPlus,
    levels: { 1: 'Degrees turned by the Earth and by the minute hand of a clock', 2: 'Turning for a number of minutes; the hour hand; 3 turns in a row', 3: '4 turns in a row; a bend between parallel lines; a quadrilateral made with parallel lines' },
  },
]
