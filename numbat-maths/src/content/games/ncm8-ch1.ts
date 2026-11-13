// Class games for New Century Maths 8 (3rd edition, Cengage) Chapter 1, Pythagoras' theorem: one set of quick
// questions for each exercise, 1.01 to 1.08.
//
// The questions are the site's own. Every question is ONE step with four choices; the wrong choices are the usual
// slips: adding the sides instead of their squares, forgetting the square root, adding the squares when a shorter
// side is wanted, taking the longest side as one of the legs. Triangles are drawn to scale from their side lengths
// and measured by the test (tests/game-checks/ncm8-ch1.ts).
//
// Syllabus: NSW Mathematics K–10 (2022), Stage 4, Right-angled triangles (Pythagoras' theorem) MA4-PYT-C-01, and
// for square roots (1.01) Fractions, decimals and percentages MA4-FRC-C-01 (irrational numbers, approximations).
import type { GameChapter, GameQuestion, GameSet } from '@/lib/game/types'
import { chance, gq, int, mk, num, pick, sample, shuffle, sqrt } from './helpers'
import { fig, rtPts, type P } from '@/lib/maths/diagrams6'

const PYT = 'MA4-PYT-C-01'
const FRC = 'MA4-FRC-C-01'
const big = (s: string) => `<div class="big">${s}</div>`
const sq = (x: number | string) => `${x}<sup>2</sup>`
/** Pythagorean triads, short sides first; none so thin that the drawing gets hard to read */
const TRIADS: [number, number, number][] = [
  [3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [12, 16, 20], [15, 20, 25], [10, 24, 26], [20, 21, 29], [7, 24, 25], [12, 35, 37],
]
const UNITS = ['cm', 'm', 'mm']
/** three different wrong whole numbers, likely first */
function intWrong(right: number, likely: number[]): string[] {
  const out: number[] = []
  for (const x of [...likely, right + 1, right - 1, right + 2, right * 2]) {
    if (x !== right && x > 0 && Number.isInteger(x) && !out.includes(x)) out.push(x)
    if (out.length === 3) break
  }
  return out.map((x) => num(x))
}

/**
 * A right-angled triangle drawn to scale, legs p and q, turned a little and sometimes mirrored; corners named
 * (right angle at R). `lab` gives the text for each side: [leg along p (R–P), leg along q (R–Q), hypotenuse (P–Q)].
 */
function rightTri(p: number, q: number, lab: [string, string, string], names?: [string, string, string]): string {
  const [R, Pp, Qp] = rtPts(p, q, pick([0, 0, 10, -10, 20, 180, 90]), chance())
  // the corners are called R, P, Q unless names are given (right angle first)
  const [r, a, b] = names ?? ['R', 'P', 'Q']
  const pts: Record<string, P> = { [r]: R, [a]: Pp, [b]: Qp }
  return fig({
    pts,
    polys: [{ v: [r, a, b] }],
    rights: [[a, r, b]],
    sides: [
      ...(lab[0] ? [{ a: r, b: a, text: lab[0] }] : []),
      ...(lab[1] ? [{ a: r, b, text: lab[1] }] : []),
      ...(lab[2] ? [{ a, b, text: lab[2] }] : []),
    ],
    names: names ? [r, a, b] : undefined,
    label: 'A right-angled triangle',
  })
}

// ================================================================== 1.01 Square roots

function m101sqrt(): GameQuestion {
  const n = int(4, 30)
  return gq({
    t: 'sqrt',
    prompt: `Evaluate:${big(sqrt(n * n))}`,
    correct: num(n),
    // halved instead, a near miss
    wrong: intWrong(n, [(n * n) / 2, n + 1, n - 1, n * 2]),
    why: `${n} × ${n} = ${n * n}, so ${sqrt(n * n)} = ${n}.`,
    meta: { n },
  })
}

function m101between(): GameQuestion {
  let x: number
  do x = int(5, 150)
  while (Number.isInteger(Math.sqrt(x)))
  const lo = Math.floor(Math.sqrt(x))
  return gq({
    t: 'between',
    prompt: `${sqrt(x)} lies between which two whole numbers?`,
    correct: `${lo} and ${lo + 1}`,
    // the number halved, one pair out either way
    wrong: [`${lo - 1} and ${lo}`, `${lo + 1} and ${lo + 2}`, `${Math.floor(x / 2)} and ${Math.floor(x / 2) + 1}`, `${lo + 2} and ${lo + 3}`].filter((s) => s !== `${lo} and ${lo + 1}`),
    why: `${lo}² = ${lo * lo} and ${lo + 1}² = ${(lo + 1) * (lo + 1)}, and ${x} is between them, so ${sqrt(x)} is between ${lo} and ${lo + 1}.`,
    meta: { x },
  })
}

const SET_101: GameSet = {
  id: 'ncm8-1.01',
  exercise: '1.01',
  ref: 'NCM 8 Ex 1.01',
  title: 'Square roots and surds',
  focus: 'Find square roots of perfect squares, and estimate other square roots between whole numbers.',
  lessons: ['y8-pyt-hyp'],
  outcomes: [FRC],
  makers: [mk('sqrt', m101sqrt), mk('between', m101between)],
}

// ================================================================== 1.02 Discovering Pythagoras' theorem

function m102hyp(): GameQuestion {
  const [a, b] = pick(TRIADS)
  const names = sample(pick([['A', 'B', 'C'], ['L', 'M', 'N'], ['P', 'Q', 'R'], ['X', 'Y', 'Z'], ['D', 'E', 'F']]), 3) as [string, string, string]
  const side = (u: string, v: string) => [u, v].sort().join('')
  const hyp = side(names[1], names[2])
  // the three sides in alphabetical order, so the answer can be in any place
  const opts = [side(names[0], names[1]), side(names[0], names[2]), hyp].sort()
  return gq({
    t: 'hyp',
    prompt: 'Which side is the hypotenuse?',
    diagram: rightTri(a, b, ['', '', ''], names),
    correct: hyp,
    inOrder: [...opts, 'None of them'],
    why: `The hypotenuse is the longest side, opposite the right angle at ${names[0]}: ${hyp}.`,
    meta: { a, b, names },
  })
}

function m102rule(): GameQuestion {
  const [x, y, z] = sample(['a', 'b', 'c', 'm', 'n', 'p', 'x', 'y', 'z'], 3)
  // legs x and y, hypotenuse z
  const it = (s: string) => `<i>${s}</i>`
  const eq = (h: string, l1: string, l2: string) => `${sq(it(h))} = ${sq(it(l1))} + ${sq(it(l2))}`
  return gq({
    t: 'rule',
    prompt: "Which is Pythagoras' theorem for this triangle?",
    diagram: rightTri(int(3, 6), int(3, 6), [x, y, z]),
    correct: eq(z, x, y),
    // a leg taken as the longest side, the sides not squared
    wrong: [eq(x, y, z), eq(y, x, z), `${it(z)} = ${it(x)} + ${it(y)}`],
    why: `The hypotenuse ${it(z)} is opposite the right angle, so ${eq(z, x, y)}.`,
    meta: { x, y, z },
  })
}

const SET_102: GameSet = {
  id: 'ncm8-1.02',
  exercise: '1.02',
  ref: 'NCM 8 Ex 1.02',
  title: "Discovering Pythagoras' theorem",
  focus: 'Find the hypotenuse (the longest side, opposite the right angle) and write the theorem for a triangle.',
  lessons: ['y8-pyt-hyp'],
  outcomes: [PYT],
  makers: [mk('hyp', m102hyp), mk('rule', m102rule)],
}

// ================================================================== 1.03 Finding the hypotenuse

function m103hyp(): GameQuestion {
  const [a, b, c] = pick(TRIADS)
  const u = pick(UNITS)
  const L = pick(['x', 'c', 'h', 'd'])
  return gq({
    t: 'hyp',
    prompt: `Find the value of <i>${L}</i>.`,
    diagram: rightTri(a, b, [`${a} ${u}`, `${b} ${u}`, `<i>${L}</i> ${u}`]),
    correct: num(c),
    // added the sides, no square root, subtracted
    wrong: intWrong(c, [a + b, a * a + b * b, b - a > 0 ? Math.round(Math.sqrt(b * b - a * a)) : c + 3, c + 1]),
    why: `${sq('<i>' + L + '</i>')} = ${sq(a)} + ${sq(b)} = ${a * a} + ${b * b} = ${c * c}, so <i>${L}</i> = ${sqrt(c * c)} = ${c}.`,
    meta: { a, b },
  })
}

function m103exact(): GameQuestion {
  let a: number, b: number
  do {
    a = int(1, 7)
    b = int(2, 8)
  } while (Number.isInteger(Math.sqrt(a * a + b * b)))
  const s = a * a + b * b
  const L = pick(['x', 'c', 'h'])
  return gq({
    t: 'exact',
    prompt: `Find the exact value of <i>${L}</i>.`,
    diagram: rightTri(a, b, [`${a} m`, `${b} m`, `<i>${L}</i> m`]),
    correct: sqrt(s),
    // no square root, the sides added, the squares subtracted
    wrong: [num(s), sqrt(a + b), sqrt(Math.abs(b * b - a * a)), num(a + b)].filter((o) => o !== sqrt(s)),
    why: `${sq('<i>' + L + '</i>')} = ${sq(a)} + ${sq(b)} = ${s}, so <i>${L}</i> = ${sqrt(s)} (exact).`,
    meta: { a, b },
  })
}

const SET_103: GameSet = {
  id: 'ncm8-1.03',
  exercise: '1.03',
  ref: 'NCM 8 Ex 1.03',
  title: 'Finding the hypotenuse',
  focus: 'Square the two shorter sides, add, then take the square root.',
  lessons: ['y8-pyt-hyp'],
  outcomes: [PYT],
  makers: [mk('hyp', m103hyp), mk('exact', m103exact, 2)],
}

// ================================================================== 1.04 Finding a shorter side

function m104short(): GameQuestion {
  const [a, b, c] = pick(TRIADS)
  const u = pick(UNITS)
  const L = pick(['x', 'y', 'a', 'b'])
  const findA = chance()
  const [known, ans] = findA ? [b, a] : [a, b]
  const lab: [string, string, string] = findA ? [`<i>${L}</i> ${u}`, `${b} ${u}`, `${c} ${u}`] : [`${a} ${u}`, `<i>${L}</i> ${u}`, `${c} ${u}`]
  return gq({
    t: 'short',
    prompt: `Find the value of <i>${L}</i>.`,
    diagram: rightTri(a, b, lab),
    correct: num(ans),
    // added the squares, subtracted the sides, no square root
    wrong: intWrong(ans, [Math.round(Math.sqrt(c * c + known * known)), c - known, c * c - known * known, ans + 2]),
    why: `${sq('<i>' + L + '</i>')} = ${sq(c)} − ${sq(known)} = ${c * c} − ${known * known} = ${ans * ans}, so <i>${L}</i> = ${ans}.`,
    meta: { a, b, findA },
  })
}

const SET_104: GameSet = {
  id: 'ncm8-1.04',
  exercise: '1.04',
  ref: 'NCM 8 Ex 1.04',
  title: 'Finding a shorter side',
  focus: 'Square the hypotenuse and the known side, subtract, then take the square root.',
  lessons: ['y8-pyt-short'],
  outcomes: [PYT],
  makers: [mk('short', m104short)],
}

// ================================================================== 1.05 Hypotenuse or shorter side?

const HS = ['Add their squares', 'Subtract their squares', 'Add the two sides', 'Subtract the two sides']

function m105which(): GameQuestion {
  const [a, b, c] = pick(TRIADS)
  const L = pick(['x', 'y', 'm', 'k'])
  const kind = int(0, 2)
  const lab: [string, string, string] = kind === 0 ? [`${a}`, `${b}`, `<i>${L}</i>`] : kind === 1 ? [`<i>${L}</i>`, `${b}`, `${c}`] : [`${a}`, `<i>${L}</i>`, `${c}`]
  const right = kind === 0 ? 0 : 1
  return gq({
    t: 'which',
    prompt: `How do you find ${sq(`<i>${L}</i>`)} from the other two sides?`,
    diagram: rightTri(a, b, lab),
    correct: HS[right],
    wrong: HS.filter((_, i) => i !== right),
    why: kind === 0 ? `<i>${L}</i> is opposite the right angle, so it is the hypotenuse: add their squares.` : `<i>${L}</i> is next to the right angle, so it is a shorter side: subtract their squares.`,
    meta: { kind },
  })
}

function m105find(): GameQuestion {
  const [a, b, c] = pick(TRIADS)
  const L = pick(['x', 'y', 'm', 'k'])
  const hyp = chance()
  const lab: [string, string, string] = hyp ? [`${a}`, `${b}`, `<i>${L}</i>`] : [`${a}`, `<i>${L}</i>`, `${c}`]
  const ans = hyp ? c : b
  const other = hyp ? Math.sqrt(b * b - a * a) : Math.sqrt(c * c + a * a)
  return gq({
    t: 'find',
    prompt: `Find the value of <i>${L}</i>.`,
    diagram: rightTri(a, b, lab),
    correct: num(ans),
    // the other operation, the sides added or subtracted
    wrong: intWrong(ans, [Math.round(other), hyp ? a + b : c - a, hyp ? b - a : c + a, ans + 1]),
    why: hyp
      ? `<i>${L}</i> is the hypotenuse: ${sq(a)} + ${sq(b)} = ${c * c}, so <i>${L}</i> = ${c}.`
      : `<i>${L}</i> is a shorter side: ${sq(c)} − ${sq(a)} = ${b * b}, so <i>${L}</i> = ${b}.`,
    meta: { hyp },
  })
}

const SET_105: GameSet = {
  id: 'ncm8-1.05',
  exercise: '1.05',
  ref: 'NCM 8 Ex 1.05',
  title: 'Hypotenuse or shorter side?',
  focus: 'Decide whether the unknown is the hypotenuse (add the squares) or a shorter side (subtract them).',
  lessons: ['y8-pyt-short'],
  outcomes: [PYT],
  makers: [mk('which', m105which), mk('find', m105find, 2)],
}

// ================================================================== 1.06 Testing for right-angled triangles

/** three side lengths that are not a right-angled triangle, close to a triad */
function nearMiss(): [number, number, number] {
  for (;;) {
    const [a, b, c] = pick(TRIADS)
    const t: [number, number, number] = shuffle([[a, b, c + 1], [a + 1, b, c], [a, b + 1, c], [a, b, c - 1]] as [number, number, number][])[0]
    const s = [...t].sort((x, y) => x - y)
    if (s[0] + s[1] > s[2] && s[0] * s[0] + s[1] * s[1] !== s[2] * s[2]) return t
  }
}
const sides = (t: number[]) => t.join(' cm, ').replace(/, (\d+)$/, ' cm and $1') + ' cm'

function m106which(): GameQuestion {
  const right = shuffle([...pick(TRIADS)])
  const others = [nearMiss(), nearMiss(), nearMiss()].map((t) => shuffle([...t]))
  const say = (t: number[]) => t.join(', ')
  if (new Set([right, ...others].map(say)).size < 4) return m106which()
  return gq({
    t: 'which',
    prompt: 'Which set of side lengths (in cm) makes a right-angled triangle?',
    correct: say(right),
    wrong: others.map(say),
    why: `Test the longest side: ${(() => {
      const s = [...right].sort((x, y) => x - y)
      return `${s[0]}² + ${s[1]}² = ${s[0] * s[0] + s[1] * s[1]} = ${s[2]}²`
    })()}, so ${say(right)} is right-angled.`,
    meta: { right },
  })
}

function m106test(): GameQuestion {
  const isRight = chance()
  const t = isRight ? [...pick(TRIADS)] : nearMiss()
  const s = [...t].sort((x, y) => x - y)
  const sum = s[0] * s[0] + s[1] * s[1]
  const OPTS = [`Yes: ${s[0]}² + ${s[1]}² = ${s[2]}²`, `No: ${s[0]}² + ${s[1]}² ≠ ${s[2]}²`, `Yes: ${s[0]} + ${s[1]} > ${s[2]}`, `No: ${s[2]} is the longest side`]
  return gq({
    t: 'test',
    prompt: `A triangle has sides ${sides(shuffle(t))}. Is it right-angled?`,
    correct: OPTS[isRight ? 0 : 1],
    wrong: OPTS.filter((_, i) => i !== (isRight ? 0 : 1)),
    why: `${s[0]}² + ${s[1]}² = ${sum} and ${s[2]}² = ${s[2] * s[2]}: ${sum === s[2] * s[2] ? 'equal, so it is right-angled' : 'not equal, so it is not right-angled'}.`,
    meta: { sides: t },
  })
}

const SET_106: GameSet = {
  id: 'ncm8-1.06',
  exercise: '1.06',
  ref: 'NCM 8 Ex 1.06',
  title: 'Testing for right-angled triangles',
  focus: 'Use the converse of Pythagoras’ theorem: if a² + b² = c², the triangle is right-angled.',
  lessons: ['y8-pyt-test'],
  outcomes: [PYT],
  makers: [mk('test', m106test), mk('which', m106which, 2)],
}

// ================================================================== 1.07 Pythagorean triads

function m107complete(): GameQuestion {
  const [a, b, c] = pick(TRIADS)
  const hide = int(0, 2)
  const shown = [a, b, c].map((x, i) => (i === hide ? '?' : String(x)))
  const ans = [a, b, c][hide]
  return gq({
    t: 'complete',
    prompt: `Complete the Pythagorean triad:${big(`{${shown.join(', ')}}`)}`,
    correct: num(ans),
    wrong: intWrong(ans, hide === 2 ? [a + b, c + 1, b + 1] : [c - [a, b][1 - hide], c + [a, b][1 - hide], ans + 2]),
    why: `${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c} = ${c}², so the missing number is ${ans}.`,
    meta: { a, b, c, hide },
  })
}

function m107multiple(): GameQuestion {
  const k = int(2, 7)
  const base = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17]] as [number, number, number][])
  const right = base.map((x) => x * k)
  // an added number instead of a multiple, one side multiplied wrongly
  const w1 = base.map((x) => x + k)
  const w2 = [base[0] * k, base[1] * k, base[2] * k + 1]
  const w3 = [base[0] * k, base[1] * (k + 1), base[2] * k]
  const say = (t: number[]) => `{${t.join(', ')}}`
  return gq({
    t: 'multiple',
    prompt: `{${base.join(', ')}} is a Pythagorean triad. Which of these is also a triad?`,
    correct: say(right),
    wrong: [w1, w2, w3].map(say),
    why: `Multiplying every number in a triad by the same number (here ${k}) gives another triad: ${say(right)}.`,
    meta: { k, base },
  })
}

const SET_107: GameSet = {
  id: 'ncm8-1.07',
  exercise: '1.07',
  ref: 'NCM 8 Ex 1.07',
  title: 'Pythagorean triads',
  focus: 'Test and complete Pythagorean triads, and make new ones by multiplying.',
  lessons: ['y8-pyt-test'],
  outcomes: [PYT],
  makers: [mk('complete', m107complete), mk('multiple', m107multiple, 2)],
}

// ================================================================== 1.08 Pythagoras' theorem problems

function m108problem(): GameQuestion {
  const [a, b, c] = pick(TRIADS)
  const kind = int(0, 3)
  const [prompt, ans, unit, likely] = [
    [`A ladder ${c} m long leans against a wall. Its foot is ${a} m from the wall. How high up the wall does it reach?`, b, 'm', [c - a, Math.round(Math.sqrt(c * c + a * a))]],
    [`A rectangle is ${a} cm wide and ${b} cm long. How long is its diagonal?`, c, 'cm', [a + b, 2 * (a + b)]],
    [`A ship sails ${a} km south, then ${b} km east. How far is it from where it started?`, c, 'km', [a + b, b - a]],
    [`A ramp rises ${a} m over a horizontal distance of ${b} m. How long is the sloping surface?`, c, 'm', [a + b, b - a]],
  ][kind] as [string, number, string, number[]]
  return gq({
    t: 'problem',
    prompt,
    correct: `${num(ans)} ${unit}`,
    wrong: intWrong(ans, likely).map((x) => `${x} ${unit}`),
    why: kind === 0 ? `The ladder is the hypotenuse: height² = ${c}² − ${a}² = ${b * b}, so the height is ${b} m.` : `The answer is the hypotenuse: ${a}² + ${b}² = ${c * c}, so it is ${c} ${unit}.`,
    meta: { a, b, c, kind },
  })
}

const SET_108: GameSet = {
  id: 'ncm8-1.08',
  exercise: '1.08',
  ref: 'NCM 8 Ex 1.08',
  title: "Pythagoras' theorem problems",
  focus: 'Find the right-angled triangle in a problem, then decide which side is unknown.',
  lessons: ['y8-pyt-apply'],
  outcomes: [PYT],
  makers: [mk('problem', m108problem)],
}

export const NCM8_CH1: GameChapter = {
  id: 'ncm8-ch1',
  number: 1,
  title: "Pythagoras' theorem",
  ref: 'NCM 8 Chapter 1',
  strand: 'Measurement and space',
  outcomes: [PYT],
  sets: [SET_101, SET_102, SET_103, SET_104, SET_105, SET_106, SET_107, SET_108],
  colour: 205,
  topics: ['y8-pythagoras'],
}
