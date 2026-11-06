// Year 9 Trigonometry, following New Century Maths 9 (3rd edition, Cengage) Chapter 4 exercise by exercise.
// The questions are the site's own: they practise the same kinds of question as each exercise, in the same
// easy-to-hard order (Foundation = the start of the exercise, Challenge = the end), but none of the textbook's
// wording or numbers are copied.
// Syllabus: MA5-TRG-C-01 (Stage 5 core, Trigonometry A): label the sides, the ratios from similar triangles,
// the calculator with degrees and minutes, unknown sides and unknown angles. Angles of elevation and depression
// and bearings (MA5-TRG-C-02, also core) are left to Year 10 by NCM 9, so they are not here. Power plus is an
// extension.
// Drawing and measuring tasks (Ex 4.03 and the investigations) give the measurements instead of asking students to
// draw and measure; the constructions themselves are left out.
// Every triangle is drawn to scale from the question's own angle; a squashed one says so on the page.
import type { Level, Question, Skill, TestItem } from '@/lib/maths/types'
import * as F from '@/lib/maths/diagrams6'
import { D, DIVIDE, NOT_TO_SCALE, TIMES, angleText, chance, degOf, dmsRound, dmsStr, frac, gcd, int, mcA, mcFixedA, num, numA, pick, q, random, round, sample, shuffle, sqrt, v } from './helpers'

const TRG = ['MA5-TRG-C-01']
const ref = (e: string) => `NCM 9 Ex ${e}`
const RAD = Math.PI / 180
const sinD = (d: number) => Math.sin(d * RAD)
const cosD = (d: number) => Math.cos(d * RAD)
const tanD = (d: number) => Math.tan(d * RAD)
const asinD = (x: number) => Math.asin(x) / RAD
const acosD = (x: number) => Math.acos(x) / RAD
const atanD = (x: number) => Math.atan(x) / RAD
type Fn = 'sin' | 'cos' | 'tan'
const FN: Record<Fn, (d: number) => number> = { sin: sinD, cos: cosD, tan: tanD }
const INV: Record<Fn, (x: number) => number> = { sin: asinD, cos: acosD, tan: atanD }
const TH = 'θ'
const PHI = 'φ'
const AL = 'α'
const inv = (fn: Fn) => `${fn}<sup>−1</sup>`
type Role = 'hyp' | 'opp' | 'adj'
const ROLE: Record<Role, string> = { hyp: 'hypotenuse', opp: 'opposite side', adj: 'adjacent side' }
const SHORT: Record<Role, string> = { hyp: 'hypotenuse', opp: 'opposite', adj: 'adjacent' }
/** the ratio that links two sides of the marked angle */
const fnFor = (x: Role, y: Role): Fn => {
  const s = new Set([x, y])
  return s.has('hyp') ? (s.has('opp') ? 'sin' : 'cos') : 'tan'
}
/** top and bottom of each ratio */
const PARTS: Record<Fn, [Role, Role]> = { sin: ['opp', 'hyp'], cos: ['adj', 'hyp'], tan: ['opp', 'adj'] }

const r6 = (x: number) => round(x, 6)
/** 12.649 110… shown as "12.6491…" */
const cut = (x: number) => (Math.abs(x - round(x, 4)) < 1e-9 ? num(round(x, 4)) : num(Math.floor(x * 1e4 + 1e-9) / 1e4, 4) + '…')
/** false when x sits too close to a rounding boundary at dp places, so the rounded answer is clear */
const clear = (x: number, dp: number) => {
  const t = x * 10 ** dp
  return Math.abs(t - Math.floor(t) - 0.5) > 0.02
}
const DPW: Record<number, string> = { 1: 'correct to one decimal place', 2: 'correct to 2 decimal places', 3: 'correct to 3 decimal places', 4: 'correct to 4 decimal places' }
const UNIT_WORD: Record<string, string> = { mm: 'millimetre', cm: 'centimetre', m: 'metre', km: 'kilometre' }
/** "correct to 2 decimal places", or "correct to the nearest metre" for dp 0 */
const roundWords = (dp: number, unit = '') => (dp === 0 ? `correct to the nearest ${UNIT_WORD[unit] ?? 'whole number'}` : DPW[dp])
const fmt = (x: number, dp: number) => num(round(x, dp), dp)

const PRON = ['a', 'b', 'c', 'd', 'e', 'g', 'h', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'w', 'x', 'y', 'z']
const NAMESETS: [string, string, string][] = [
  ['A', 'B', 'C'], ['P', 'Q', 'R'], ['X', 'Y', 'Z'], ['K', 'L', 'M'], ['D', 'E', 'F'], ['T', 'U', 'V'],
  ['G', 'H', 'J'], ['M', 'N', 'P'], ['R', 'S', 'T'], ['W', 'X', 'Y'], ['E', 'F', 'G'], ['L', 'M', 'N'],
]
/** three vertex names: [right-angle corner, the marked angle, the third corner] */
const names3 = () => shuffle(pick(NAMESETS)) as [string, string, string]
const sideName = (a: string, b: string) => [a, b].sort().join('')
const triName = (ns: string[]) => '△' + shuffle(ns).join('')
const ROTS = [0, 0, 0, 90, 180, 270, 20, 35, 110, 155, 200, 245, 290, 325]
/** Pythagorean triads [adjacent, opposite, hypotenuse]; their angles are all between 16° and 74°, so they are drawn to scale */
const BASE: [number, number, number][] = [
  [3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [12, 35, 37], [28, 45, 53], [33, 56, 65],
  [48, 55, 73], [36, 77, 85], [39, 80, 89], [65, 72, 97],
]
function triad(scale = true): [number, number, number] {
  const t = pick(BASE)
  const k = scale ? pick([1, 1, 1, 2, 3]) : 1
  const s = t.map((x) => x * k) as [number, number, number]
  return chance() ? s : [s[1], s[0], s[2]]
}

// ---------------------------------------------------------------- angles

interface Ang {
  v: number // size in degrees
  t: string // as written: 35°, 57.4° or 23°18′
}
const angW = (lo = 15, hi = 75): Ang => {
  const d = int(lo, hi)
  return { v: d, t: `${d}°` }
}
const angDM = (lo = 15, hi = 75): Ang => {
  const d = int(lo, hi - 1)
  const m = int(1, 59)
  return { v: degOf(d, m), t: angleText(d, m) }
}
const angD1 = (lo = 15, hi = 75): Ang => {
  let x = 0
  do x = int(lo * 10, hi * 10) / 10
  while (Number.isInteger(x))
  return { v: x, t: `${num(x)}°` }
}
const anyAng = (kind: 'whole' | 'dm' | 'mixed', lo = 15, hi = 75): Ang => (kind === 'whole' ? angW(lo, hi) : kind === 'dm' ? angDM(lo, hi) : pick([angW, angDM, angD1])(lo, hi))

// ---------------------------------------------------------------- the triangle

interface Tri {
  th: number // true size of the marked angle, in degrees
  mark: string // its label: θ, 35°, 23°18′ (or '' for an unlabelled arc)
  other?: string // label of the angle at the third corner (φ)
  opp?: string
  adj?: string
  hyp?: string
  names?: [string, string, string] // [right-angle corner, marked angle, third corner]
}
/** A right-angled triangle drawn to scale, turned and flipped at random. Very thin ones are squashed (and say so). */
function tri(t: Tri): { svg: string; note?: string } {
  const drawn = Math.min(75, Math.max(15, t.th))
  const squashed = Math.abs(drawn - t.th) > 0.01
  const [r, a, o] = F.rtPts(cosD(drawn), sinD(drawn), pick(ROTS), chance())
  const [kR, kA, kO] = t.names ?? ['R0', 'A0', 'O0']
  const sides: { a: string; b: string; text: string }[] = []
  if (t.opp) sides.push({ a: kR, b: kO, text: t.opp })
  if (t.adj) sides.push({ a: kR, b: kA, text: t.adj })
  if (t.hyp) sides.push({ a: kA, b: kO, text: t.hyp })
  const angles = [{ at: kA, a: kR, b: kO, text: t.mark }]
  if (t.other) angles.push({ at: kO, a: kR, b: kA, text: t.other })
  const svg = F.fig({
    pts: { [kR]: r, [kA]: a, [kO]: o },
    polys: [{ v: [kR, kA, kO] }],
    rights: [[kA, kR, kO]],
    sides,
    angles,
    names: t.names ? [kR, kA, kO] : [],
    label: 'Right-angled triangle',
  })
  return { svg, note: squashed ? NOT_TO_SCALE : undefined }
}
const SOH = 'SOH CAH TOA: sin = opposite ÷ hypotenuse, cos = adjacent ÷ hypotenuse, tan = opposite ÷ adjacent.'
const LABEL_HINT = `The hypotenuse is opposite the right angle. The opposite side faces the angle. The adjacent side runs from the angle to the right angle.`

/** wrong options for a numeric multiple choice: distinct, positive, and not the right answer */
function numOptions(right: number, wrong: number[], f: (x: number) => string): { correct: string; wrong: string[] } {
  const c = f(right)
  const out: string[] = []
  for (const w of wrong) {
    const s = f(w)
    if (w > 0 && Number.isFinite(w) && s !== c && !out.includes(s)) out.push(s)
  }
  let k = 1
  while (out.length < 3) {
    const s = f(right * (1 + 0.17 * k))
    if (s !== c && !out.includes(s)) out.push(s)
    k = k > 0 ? -k : -k + 1
  }
  return { correct: c, wrong: out.slice(0, 3) }
}

// ================================================================= 4.01 The sides of a right-angled triangle

function sideLength(): Question {
  const [a, b, c] = triad()
  const th = atanD(b / a)
  const ask = pick(['hyp', 'opp', 'adj'] as Role[])
  const val = { hyp: c, opp: b, adj: a }[ask]
  const { svg, note } = tri({ th, mark: TH, opp: String(b), adj: String(a), hyp: String(c) })
  return q({
    prompt: `For the marked angle ${TH}, what is the length of the ${ROLE[ask]}?`,
    diagram: svg,
    note,
    answer: numA(val),
    hint: LABEL_HINT,
    steps: [`The hypotenuse is opposite the right angle: ${c}.`, `The opposite side faces ${TH}: ${b}.`, `The adjacent side runs from ${TH} to the right angle: ${a}.`, `So the ${ROLE[ask]} is ${val}.`],
    meta: { t: 'sideLen', ask, opp: b, adj: a, hyp: c },
  })
}

function sideNameMC(): Question {
  const ns = names3()
  const [R, A, O] = ns
  const th = int(22, 68)
  const ask = pick(['hyp', 'opp', 'adj'] as Role[])
  const sides: Record<Role, string> = { hyp: sideName(A, O), opp: sideName(R, O), adj: sideName(R, A) }
  const { svg, note } = tri({ th, mark: '', names: ns })
  return q({
    prompt: `In ${triName(ns)}, name the ${ROLE[ask]} for the marked angle, ∠${A}.`,
    diagram: svg,
    note,
    answer: mcA(sides[ask], (['hyp', 'opp', 'adj'] as Role[]).filter((r) => r !== ask).map((r) => sides[r])),
    hint: LABEL_HINT,
    steps: [`The right angle is at ${R}, so the hypotenuse is ${sides.hyp}.`, `${sides.opp} faces ∠${A}, so it is the opposite side.`, `${sides.adj} runs from ∠${A} to the right angle, so it is the adjacent side.`, `The ${ROLE[ask]} is ${sides[ask]}.`],
    meta: { t: 'sideName', ask, R, A, O },
  })
}

function angleNameMC(): Question {
  const ns = names3()
  const [R, A, O] = ns
  const th = int(22, 68)
  const { svg, note } = tri({ th, mark: '', names: ns })
  const kind = pick(['oppHyp', 'oppLeg', 'adjLeg'] as const)
  const opts = ns.map((x) => `∠${x}`)
  let prompt: string
  let ans: string
  let why: string
  if (kind === 'oppHyp') {
    prompt = `In ${triName(ns)}, which angle is opposite the hypotenuse?`
    ans = R
    why = `The hypotenuse ${sideName(A, O)} is opposite the right angle, ∠${R}.`
  } else {
    // a leg: R with A or with O
    const end = pick([A, O])
    const leg = sideName(R, end)
    if (kind === 'oppLeg') {
      ans = end === A ? O : A
      prompt = `In ${triName(ns)}, which angle is opposite side ${leg}?`
      why = `${leg} doesn’t touch ∠${ans}: it is across from it.`
    } else {
      ans = end
      prompt = `In ${triName(ns)}, side ${leg} is adjacent to which acute angle?`
      why = `${leg} runs from ∠${end} to the right angle at ${R}, so it is adjacent to ∠${end}.`
    }
  }
  return q({
    prompt,
    diagram: svg,
    note,
    answer: mcFixedA(opts.slice().sort(), `∠${ans}`),
    hint: 'The side opposite an angle is the one it doesn’t touch. An adjacent side touches the angle (and is not the hypotenuse).',
    steps: [why, `The answer is ∠${ans}.`],
    meta: { t: 'angleName', kind, R, A, O, ans },
  })
}

function twoAngles(): Question {
  const [a, b, c] = triad()
  const th = atanD(b / a)
  const [pa, pb, pc] = sample(PRON, 3)
  const { svg, note } = tri({ th, mark: TH, other: PHI, adj: pa, opp: pb, hyp: pc })
  const ang = pick([TH, PHI])
  const ask = pick(['opp', 'adj'] as Role[])
  // for φ (at the third corner) the opposite and adjacent sides swap
  const forTh: Record<Role, string> = { opp: pb, adj: pa, hyp: pc }
  const forPhi: Record<Role, string> = { opp: pa, adj: pb, hyp: pc }
  const right = (ang === TH ? forTh : forPhi)[ask]
  return q({
    prompt: `Which side is the ${ROLE[ask]} for angle ${ang}?`,
    diagram: svg,
    note,
    answer: mcFixedA([pa, pb, pc].map((x) => `<i>${x}</i>`).sort(), `<i>${right}</i>`),
    hint: `The opposite and adjacent sides depend on which angle you are looking at. ${LABEL_HINT}`,
    steps: [`For ${TH}: opposite ${v(pb)}, adjacent ${v(pa)}.`, `For ${PHI}: opposite ${v(pa)}, adjacent ${v(pb)}.`, `The hypotenuse is ${v(pc)} for both.`, `The ${ROLE[ask]} for ${ang} is ${v(right)}.`],
    meta: { t: 'twoAngles', ang: ang === TH ? 'th' : 'phi', ask, opp: pb, adj: pa, hyp: pc, right },
  })
}

function falseStatement(): Question {
  const ns = names3()
  const [R, A, O] = ns
  const th = int(24, 66)
  const { svg, note } = tri({ th, mark: '', names: ns })
  const hyp = sideName(A, O)
  const rA = sideName(R, A)
  const rO = sideName(R, O)
  const truths = [
    `The hypotenuse is ${hyp}.`,
    `The side opposite ∠${A} is ${rO}.`,
    `The side adjacent to ∠${A} is ${rA}.`,
    `The side opposite ∠${O} is ${rA}.`,
    `The side adjacent to ∠${O} is ${rO}.`,
  ]
  const lies = [`The hypotenuse is ${pick([rA, rO])}.`, `The side opposite ∠${A} is ${rA}.`, `The side adjacent to ∠${A} is ${rO}.`, `The side opposite ∠${O} is ${rO}.`, `The side adjacent to ∠${O} is ${rA}.`, `The side adjacent to ∠${A} is ${hyp}.`]
  const lie = pick(lies)
  return q({
    prompt: `Which statement about ${triName(ns)} is <b>false</b>?`,
    diagram: svg,
    note,
    answer: mcA(lie, sample(truths, 3)),
    hint: `${LABEL_HINT} The hypotenuse is never called the adjacent side.`,
    steps: [`The right angle is at ${R}, so the hypotenuse is ${hyp}.`, `For ∠${A}: opposite ${rO}, adjacent ${rA}.`, `For ∠${O}: opposite ${rA}, adjacent ${rO}.`, `So “${lie}” is false.`],
    meta: { t: 'falseStatement', R, A, O, lie },
  })
}

function describe(): Question {
  const ns = names3()
  const [R, A, O] = ns
  const tn = triName(ns)
  if (chance()) {
    // where the marked angle is
    return q({
      prompt: `${tn} has hypotenuse ${sideName(A, O)}, and side ${sideName(R, O)} is opposite angle ${TH}. At which vertex is ${TH}? (Sketch the triangle first.)`,
      answer: mcFixedA(ns.slice().sort(), A),
      hint: `The hypotenuse is opposite the right angle. The side opposite ${TH} doesn’t touch ${TH}.`,
      steps: [`The hypotenuse ${sideName(A, O)} is opposite the right angle, so the right angle is at ${R}.`, `${sideName(R, O)} doesn’t touch ${A}, so ${TH} is at ${A}.`],
      meta: { t: 'describe', kind: 'theta', R, A, O, ans: A },
    })
  }
  // where the right angle is
  const leg = sideName(R, O)
  return q({
    prompt: `In ${tn}, side ${leg} is opposite ∠${A} and adjacent to ∠${O}. At which vertex is the right angle? (Sketch the triangle first.)`,
    answer: mcFixedA(ns.slice().sort(), R),
    hint: 'A side adjacent to an acute angle runs from that angle to the right angle.',
    steps: [`${leg} is adjacent to ∠${O}, so it runs from ${O} to the right angle.`, `The other end of ${leg} is ${R}, so the right angle is at ${R}.`, `Check: ${leg} doesn’t touch ${A}, so it is opposite ∠${A}.`],
    meta: { t: 'describe', kind: 'right', R, A, O, ans: R },
  })
}

function fixedSide(): Question {
  return q({
    prompt: 'Which side of a right-angled triangle stays the same, whichever acute angle is marked?',
    answer: mcA('the hypotenuse', ['the adjacent side', 'the opposite side', 'the shortest side']),
    hint: 'Which side is decided by the right angle, not by the marked angle?',
    steps: ['The opposite and adjacent sides swap when you mark the other acute angle.', 'The hypotenuse is always opposite the right angle, so it doesn’t change.'],
    meta: { t: 'fixedSide' },
  })
}

const ex401 = (level: Level): Question => {
  if (level === 1) return sideLength()
  if (level === 2) return chance(0.6) ? sideNameMC() : angleNameMC()
  const r = random()
  return r < 0.35 ? twoAngles() : r < 0.7 ? falseStatement() : r < 0.92 ? describe() : fixedSide()
}

// ================================================================= 4.02 The trigonometric ratios

function ratioFrac(level: Level = 1): Question {
  const [a, b, c] = triad(level >= 2)
  const th = atanD(b / a)
  const fn = pick(['sin', 'cos', 'tan'] as Fn[])
  const named = chance(0.4)
  const ns = named ? names3() : undefined
  const angName = ns ? ns[1] : TH
  const { svg, note } = tri({ th, mark: ns ? '' : TH, names: ns, opp: String(b), adj: String(a), hyp: String(c) })
  const val: Record<Role, number> = { opp: b, adj: a, hyp: c }
  const [top, bot] = PARTS[fn]
  const g = gcd(val[top], val[bot])
  return q({
    prompt: `Find ${fn} ${angName} as a fraction.`,
    diagram: svg,
    note,
    answer: { kind: 'frac', n: val[top] / g, d: val[bot] / g, simplest: false },
    hint: `${SOH} Label the sides for ${ns ? '∠' + angName : TH} first.`,
    steps: [
      `For ${ns ? '∠' + angName : TH}: opposite = ${b}, adjacent = ${a}, hypotenuse = ${c}.`,
      `${fn} ${angName} = ${frac(SHORT[top], SHORT[bot])} = ${frac(val[top], val[bot])}` + (g > 1 ? ` = ${frac(val[top] / g, val[bot] / g)}` : ''),
    ],
    meta: { t: 'ratioFrac', fn, opp: b, adj: a, hyp: c },
  })
}

/** the six ratios for θ (at the marked corner) and φ (at the third corner), as [top, bottom] roles for θ */
const SIX: { name: string; parts: [Role, Role] }[] = [
  { name: `sin ${TH}`, parts: ['opp', 'hyp'] },
  { name: `cos ${TH}`, parts: ['adj', 'hyp'] },
  { name: `tan ${TH}`, parts: ['opp', 'adj'] },
  { name: `sin ${PHI}`, parts: ['adj', 'hyp'] },
  { name: `cos ${PHI}`, parts: ['opp', 'hyp'] },
  { name: `tan ${PHI}`, parts: ['adj', 'opp'] },
]
function whichRatio(withNumbers: boolean): Question {
  let th: number
  let lab: Record<Role, string>
  if (withNumbers) {
    const [a, b, c] = triad(false)
    th = atanD(b / a)
    lab = { opp: String(b), adj: String(a), hyp: String(c) }
  } else {
    th = pick([int(25, 40), int(50, 65)])
    const [pa, pb, pc] = sample(PRON, 3)
    lab = { opp: pb, adj: pa, hyp: pc }
  }
  const { svg, note } = tri({ th, mark: TH, other: PHI, ...lab })
  const target = pick(SIX)
  const twin = SIX.find((s) => s !== target && s.parts[0] === target.parts[0] && s.parts[1] === target.parts[1])
  const wrong = sample(SIX.filter((s) => s !== target && s !== twin), 3).map((s) => s.name)
  const show = (r: Role) => (withNumbers ? lab[r] : `<i>${lab[r]}</i>`)
  const f = frac(show(target.parts[0]), show(target.parts[1]))
  return q({
    prompt: `Which ratio is equal to ${f}?`,
    diagram: svg,
    note,
    answer: mcA(target.name, wrong),
    hint: `${SOH} For ${PHI}, the opposite and adjacent sides are the other way round.`,
    steps: [
      `For ${TH}: opposite ${show('opp')}, adjacent ${show('adj')}, hypotenuse ${show('hyp')}.`,
      `For ${PHI}: opposite ${show('adj')}, adjacent ${show('opp')}, hypotenuse ${show('hyp')}.`,
      `${f} = ${target.name}` + (twin ? ` (it is also ${twin.name}, which isn’t one of the choices).` : '.'),
    ],
    meta: { t: 'whichRatio', top: target.parts[0], bot: target.parts[1], name: target.name },
  })
}

function trueStatement(): Question {
  const ns = names3()
  const [R, A, O] = ns
  const th = pick([int(24, 40), int(50, 66)])
  const { svg, note } = tri({ th, mark: '', names: ns })
  const right = pick([`sin ${A} = cos ${O}`, `cos ${A} = sin ${O}`, `sin ${O} = cos ${A}`, `cos ${O} = sin ${A}`])
  const wrongs = [`tan ${A} = tan ${O}`, `sin ${A} = sin ${O}`, `cos ${A} = cos ${O}`, `tan ${A} = sin ${O}`, `cos ${A} = tan ${O}`, `sin ${A} = tan ${O}`]
  return q({
    prompt: `Which statement is true for ${triName(ns)}?`,
    diagram: svg,
    note,
    answer: mcA(right, sample(wrongs, 3)),
    hint: `Write each ratio as a fraction of sides, e.g. sin ${A} = ${frac(sideName(R, O), sideName(A, O))}.`,
    steps: [
      `sin ${A} = ${frac(sideName(R, O), sideName(A, O))} and cos ${O} = ${frac(sideName(R, O), sideName(A, O))}, so sin ${A} = cos ${O}.`,
      `cos ${A} = ${frac(sideName(R, A), sideName(A, O))} and sin ${O} = ${frac(sideName(R, A), sideName(A, O))}, so cos ${A} = sin ${O}.`,
      `The true statement is ${right}.`,
    ],
    meta: { t: 'trueStatement', R, A, O, right },
  })
}

function fromRatio(): Question {
  const t = pick(BASE)
  const [a, b, c] = chance() ? t : ([t[1], t[0], t[2]] as [number, number, number])
  const val: Record<Role, number> = { adj: a, opp: b, hyp: c }
  const given = pick(['sin', 'cos', 'tan'] as Fn[])
  const ask = pick((['sin', 'cos', 'tan'] as Fn[]).filter((f) => f !== given))
  const L = pick(['A', 'B', 'P', 'R', 'X', 'Y'])
  const [gt, gb] = PARTS[given]
  const [at, ab] = PARTS[ask]
  const missing = (['opp', 'adj', 'hyp'] as Role[]).find((r) => r !== gt && r !== gb)!
  const sq = missing === 'hyp' ? `${v('x')}<sup>2</sup> = ${val[gt]}<sup>2</sup> + ${val[gb]}<sup>2</sup> = ${val.hyp ** 2}` : `${v('x')}<sup>2</sup> = ${val.hyp}<sup>2</sup> − ${val[gt === 'hyp' ? gb : gt]}<sup>2</sup> = ${val[missing] ** 2}`
  return q({
    prompt: `If ${given} ${L} = ${frac(val[gt], val[gb])}, find ${ask} ${L} as a fraction. (Draw a right-angled triangle.)`,
    answer: { kind: 'frac', n: val[at], d: val[ab], simplest: false },
    hint: `Draw a right-angled triangle with angle ${L}: the ${SHORT[gt]} side is ${val[gt]} and the ${SHORT[gb]} side is ${val[gb]}. Use Pythagoras’ theorem for the third side.`,
    steps: [
      `${given} ${L} = ${frac(SHORT[gt], SHORT[gb])}, so ${SHORT[gt]} = ${val[gt]} and ${SHORT[gb]} = ${val[gb]}. Let the ${SHORT[missing]} side be ${v('x')}.`,
      `${sq}, so ${v('x')} = ${val[missing]}.`,
      `${ask} ${L} = ${frac(SHORT[at], SHORT[ab])} = ${frac(val[at], val[ab])}`,
    ],
    meta: { t: 'fromRatio', given, ask, opp: b, adj: a, hyp: c },
  })
}

const ex402 = (level: Level): Question => {
  if (level === 1) return ratioFrac(1)
  if (level === 2) {
    const r = random()
    return r < 0.35 ? ratioFrac(2) : r < 0.75 ? whichRatio(false) : trueStatement()
  }
  return chance(0.65) ? fromRatio() : whichRatio(true)
}

// ================================================================= 4.03 Similar right-angled triangles

/** sides of a right-angled triangle with angle th, hypotenuse H mm, measured to the nearest mm */
const measure = (th: number, H: number) => ({ opp: Math.round(H * sinD(th)), adj: Math.round(H * cosD(th)), hyp: H })
type Meas = ReturnType<typeof measure>
const ratioOf = (fn: Fn, m: Meas) => m[PARTS[fn][0]] / m[PARTS[fn][1]]

function measuredRatio(): Question {
  for (;;) {
    const th = int(30, 60)
    const m = measure(th, int(60, 110))
    const fn = pick(['sin', 'cos', 'tan'] as Fn[])
    const val = ratioOf(fn, m)
    if (!clear(val, 2)) continue
    const ns = names3()
    const [, A] = ns
    const { svg, note } = tri({ th, mark: `${th}°`, names: ns, opp: `${m.opp} mm`, adj: `${m.adj} mm`, hyp: `${m.hyp} mm` })
    const [top, bot] = PARTS[fn]
    return q({
      prompt: `The sides of this triangle were measured to the nearest millimetre. Use the measurements to find ${fn} ${th}° as a decimal, ${DPW[2]}.`,
      diagram: svg,
      note,
      answer: numA(val, 2),
      calc: true,
      hint: `${SOH} Label the sides for the ${th}° angle at ${A}.`,
      steps: [`For the ${th}° angle: opposite = ${m.opp} mm, adjacent = ${m.adj} mm, hypotenuse = ${m.hyp} mm.`, `${fn} ${th}° = ${frac(SHORT[top], SHORT[bot])} = ${frac(m[top], m[bot])} = ${cut(val)} ≈ ${fmt(val, 2)}`, `(The calculator gives ${fn} ${th}° = ${cut(FN[fn](th))}: close, because the sides were only measured to the nearest millimetre.)`],
      meta: { t: 'measuredRatio', fn, ...m },
    })
  }
}

function similarTable(): Question {
  for (;;) {
    const th = int(28, 62)
    const Hs = sample([34, 42, 50, 57, 63, 71, 78, 86, 95, 104], 4).sort((x, y) => x - y)
    const rows = Hs.map((H) => measure(th, H))
    const fn = pick(['sin', 'cos', 'tan'] as Fn[])
    const vals = rows.map((r) => ratioOf(fn, r))
    const kind = pick(['missing', 'notice', 'error'] as const)
    const L = pick(['Y', 'A', 'P', 'M'])
    // short headings, as in the textbook, so the table fits beside the answer box
    const head = ['Triangle', 'Opp (mm)', 'Adj (mm)', 'Hyp (mm)']
    if (kind === 'missing') {
      const k = int(0, 3)
      if (!clear(vals[k], 2)) continue
      const table = D.table([...head, `${fn} ${L}`], rows.map((r, i) => [i + 1, r.opp, r.adj, r.hyp, i === k ? '?' : fmt(vals[i], 2)]))
      const [top, bot] = PARTS[fn]
      return q({
        prompt: `Four similar right-angled triangles each have an angle ${L} = ${th}°. Their sides were measured to the nearest millimetre. Find ${fn} ${L} for triangle ${k + 1}, ${DPW[2]}.`,
        diagram: table,
        answer: numA(vals[k], 2),
        calc: true,
        hint: `${fn} ${L} = ${frac(SHORT[top], SHORT[bot])}. Your answer should be close to the others in the column.`,
        steps: [`${fn} ${L} = ${frac(SHORT[top], SHORT[bot])} = ${frac(rows[k][top], rows[k][bot])} = ${cut(vals[k])} ≈ ${fmt(vals[k], 2)}`, `It is close to the other triangles’ values: in similar triangles the ratio stays the same.`],
        meta: { t: 'similarTable', kind, fn, row: rows[k] },
      })
    }
    if (kind === 'notice') {
      const table = D.table(head, rows.map((r, i) => [i + 1, r.opp, r.adj, r.hyp]))
      const typical = FN[fn](th)
      // the right value, its upside-down ratio and another ratio's value, as "all about …"
      const others = (['sin', 'cos', 'tan'] as Fn[]).filter((f) => f !== fn).map((f) => FN[f](th))
      const cand = [1 / typical, ...others].filter((x) => Math.abs(round(x, 2) - round(typical, 2)) >= 0.05)
      if (cand.length < 2) continue
      // short options, so they sit two to a row beside the table
      const wrong = [...cand.slice(0, 2).map((x) => `All about ${fmt(x, 2)}`), 'Bigger in bigger triangles']
      return q({
        prompt: `Four similar right-angled triangles each have an angle ${L} = ${th}°. Their sides were measured to the nearest millimetre. Work out ${fn} ${L} for each triangle. What do you notice?`,
        diagram: table,
        answer: mcA(`All about ${fmt(typical, 2)}`, wrong),
        calc: true,
        hint: `${fn} ${L} = ${frac(SHORT[PARTS[fn][0]], SHORT[PARTS[fn][1]])} for each triangle.`,
        steps: [`${fn} ${L} = ${frac(SHORT[PARTS[fn][0]], SHORT[PARTS[fn][1]])}: ` + vals.map((x) => fmt(x, 2)).join(', ') + '.', `They are all about ${fmt(typical, 2)}: in similar triangles the ratio is the same, whatever the size (the calculator gives ${fn} ${th}° = ${cut(typical)}).`],
        meta: { t: 'similarTable', kind, fn, th, vals },
      })
    }
    // one triangle was measured wrongly: its opposite side is out by 5 to 9 mm
    const k = int(0, 3)
    const bad = rows.map((r) => ({ ...r }))
    bad[k].opp += pick([-1, 1]) * int(5, 9)
    if (bad[k].opp <= 5) continue
    const sins = bad.map((r) => r.opp / r.hyp)
    const tans = bad.map((r) => r.opp / r.adj)
    const okRow = (i: number) => Math.abs(sins[i] - sinD(th)) < 0.025 && Math.abs(tans[i] - tanD(th)) < 0.04
    if (okRow(k) || [0, 1, 2, 3].some((i) => i !== k && !okRow(i))) continue
    const table = D.table(head, bad.map((r, i) => [i + 1, r.opp, r.adj, r.hyp]))
    return q({
      prompt: `Four similar right-angled triangles each have an angle ${L} = ${th}°. One of them was measured wrongly. Which one? (Work out a ratio such as sin ${L} for each.)`,
      diagram: table,
      answer: mcFixedA(['Triangle 1', 'Triangle 2', 'Triangle 3', 'Triangle 4'], `Triangle ${k + 1}`),
      calc: true,
      hint: 'In similar triangles each ratio is (nearly) the same. Look for the triangle whose ratio doesn’t fit.',
      steps: [`sin ${L} = ${frac('opposite', 'hypotenuse')}: ` + sins.map((x) => fmt(x, 2)).join(', ') + '.', `Triangle ${k + 1} doesn’t fit, so it was measured wrongly.`],
      meta: { t: 'similarTable', kind, th, rows: bad, k },
    })
  }
}

function constancy(): Question {
  for (;;) {
    const th = int(25, 65)
    const m = measure(th, int(30, 48))
    const kk = pick([2, 3, 4, 1.5, 2.5])
    const pair = pick([['opp', 'adj'], ['adj', 'opp'], ['opp', 'hyp'], ['adj', 'hyp'], ['hyp', 'opp']] as [Role, Role][])
    const [want, have] = pair
    const big = r6(kk * m[have])
    const ans = r6(kk * m[want])
    if (!Number.isInteger(big) || !Number.isInteger(ans)) continue
    const words = (r: Role) => (r === 'hyp' ? 'the hypotenuse' : `the side ${r === 'opp' ? 'opposite' : 'adjacent to'} the ${th}° angle`)
    const fn = fnFor(want, have)
    return q({
      prompt: `Two similar right-angled triangles both have a ${th}° angle. In the smaller triangle, ${words(want)} is ${m[want]} mm and ${words(have)} is ${m[have]} mm. In the larger triangle, ${words(have)} is ${big} mm. Use the ratio in the smaller triangle to find ${words(want)} in the larger triangle.`,
      answer: numA(ans),
      suffix: 'mm',
      calc: true,
      hint: `The ratio ${frac(SHORT[want], SHORT[have])} is the same in both triangles (it is a ${fn} ratio, or its upside-down).`,
      steps: [`In the smaller triangle, ${frac(SHORT[want], SHORT[have])} = ${frac(m[want], m[have])}.`, `In the larger triangle: ${frac(v('x'), big)} = ${frac(m[want], m[have])}`, `${v('x')} = ${big} ${TIMES} ${frac(m[want], m[have])} = ${num(ans)} mm`],
      meta: { t: 'constancy', small: m, want, have, big },
    })
  }
}

function whyConstant(): Question {
  const th = int(20, 70)
  const fn = pick(['sin', 'cos', 'tan'] as Fn[])
  return q({
    prompt: `Why is ${fn} ${th}° the same in every right-angled triangle with a ${th}° angle, whatever its size?`,
    answer: mcA('The triangles are similar, so their sides are in the same ratio.', [
      'The hypotenuse is always the same length.',
      'The calculator rounds the answer.',
      `The side opposite ${th}° is always the shortest side.`,
    ]),
    hint: 'Think about what is the same in triangles that have the same angles.',
    steps: ['Right-angled triangles with a ' + th + '° angle all have the same three angles, so they are similar.', 'Similar triangles are enlargements of each other, so the ratio of any two sides is the same.', `So ${fn} ${th}° is a fixed number, and the calculator can store it.`],
    meta: { t: 'whyConstant' },
  })
}

const ex403 = (level: Level): Question => {
  if (level === 1) return measuredRatio()
  if (level === 2) return similarTable()
  return chance(0.7) ? constancy() : whyConstant()
}

// ================================================================= 4.04 Trigonometry on a calculator

type EvalForm = 'plain' | 'times' | 'over' | 'divide'
function evalTrig(kind: 'whole' | 'dec' | 'dm', dp = 2): Question {
  for (;;) {
    const fn = pick(['sin', 'cos', 'tan'] as Fn[])
    const a: Ang = kind === 'whole' ? angW(3, fn === 'tan' ? 84 : 87) : kind === 'dec' ? (chance() ? angD1(3, 84) : (() => {
      const x = int(300, 8400) / 100
      return { v: x, t: `${num(x)}°` }
    })()) : angDM(3, 84)
    const form: EvalForm = kind === 'dm' ? pick(['times', 'over', 'divide'] as EvalForm[]) : pick(['plain', 'plain', 'times', 'over', 'divide'] as EvalForm[])
    const k = pick([int(2, 30), int(20, 900) / 10, int(100, 400)])
    const f = FN[fn](a.v)
    const val = form === 'plain' ? f : form === 'times' ? k * f : k / f
    if (!clear(val, dp) || Math.abs(val) > 99999) continue
    const expr = form === 'plain' ? `${fn} ${a.t}` : form === 'times' ? `${num(k)} ${fn} ${a.t}` : form === 'over' ? frac(num(k), `${fn} ${a.t}`) : `${num(k)} ${DIVIDE} ${fn} ${a.t}`
    return q({
      prompt: `Evaluate ${expr}, ${DPW[dp]}.`,
      answer: numA(val, dp),
      calc: 'trig',
      hint: (form === 'times' ? `${num(k)} ${fn} ${a.t} means ${num(k)} ${TIMES} ${fn} ${a.t}. ` : '') + (kind === 'dm' ? 'Enter the angle with the ° ′ ″ key: the degrees, ° ′ ″, the minutes, ° ′ ″. ' : '') + 'Make sure your calculator is in degrees mode.',
      steps: [`${expr} = ${cut(val)}`, `≈ ${fmt(val, dp)}`],
      meta: { t: 'evalTrig', fn, ang: a.v, form, k, dp },
    })
  }
}

function roundDeg(): Question {
  const kind = pick(['dm', 'dm', 'dms', 'dec'] as const)
  const d = int(2, 160)
  let value: number
  let text: string
  if (kind === 'dec') {
    value = int(d * 100 + 1, d * 100 + 99) / 100
    text = `${num(value)}°`
  } else {
    const m = pick([int(1, 59), int(25, 35), 30])
    const s = kind === 'dms' ? int(1, 59) : undefined
    value = degOf(d, m, s ?? 0)
    text = angleText(d, m, s)
  }
  const ans = Math.round(Number(value.toFixed(9)))
  const up = ans > Math.floor(value + 1e-9)
  return q({
    prompt: `Round ${text} to the nearest degree.`,
    answer: numA(value, 0),
    suffix: '°',
    hint: kind === 'dec' ? 'Look at the first decimal place.' : 'There are 60 minutes in a degree, so 30′ is halfway: 30′ or more rounds up.',
    steps: kind === 'dec' ? [`${text} ≈ ${ans}° (${up ? 'round up' : 'round down'})`] : [`${text}: the minutes are ${up ? '30′ or more, so round up' : 'less than 30′, so round down'}.`, `${text} ≈ ${ans}°`],
    meta: { t: 'roundDeg', value },
  })
}

function roundMin(): Question {
  const d = int(2, 160)
  const carry = chance(0.12)
  const m = carry ? 59 : int(0, 58)
  const s = carry ? int(30, 59) : pick([int(1, 59), int(25, 35), 30, int(1, 59) + 0.5])
  const value = degOf(d, m, s)
  const r = dmsRound(value, 'minute')
  const text = `${angleText(d, m)}${num(s)}″`
  return q({
    prompt: `Round ${text} to the nearest minute.`,
    answer: { kind: 'dms', value, to: 'minute' },
    hint: 'There are 60 seconds in a minute, so 30″ is halfway: 30″ or more rounds up. 60′ makes another degree.',
    steps: [`The seconds are ${num(s)}″: ${s >= 30 ? '30″ or more, so round up' : 'less than 30″, so round down'}.`, ...(carry ? [`${d}°59′ rounded up is ${d}°60′ = ${d + 1}°0′.`] : []), `${text} ≈ ${r.d}°${r.m}′`],
    meta: { t: 'roundMin', value },
  })
}

function toDMS(): Question {
  const d = int(1, 89)
  const places = pick([1, 2, 2, 3, 4])
  let value = 0
  do value = d + int(1, 10 ** places - 1) / 10 ** places
  while (Number.isInteger(r6(value * 60 * 2)) && chance(0.6)) // ties (30″) are allowed but rare
  value = r6(value)
  const exactMin = (value - d) * 60
  const r = dmsRound(value, 'minute')
  return q({
    prompt: `Convert ${num(value)}° to degrees and minutes, correct to the nearest minute.`,
    answer: { kind: 'dms', value, to: 'minute' },
    calc: 'trig',
    hint: `Multiply the decimal part by 60 to get the minutes, or type ${num(value)} = then press ° ′ ″ on the calculator.`,
    steps: [`${num(r6(value - d))}° ${TIMES} 60 = ${num(r6(exactMin))}′`, `${num(value)}° = ${d}°${num(r6(exactMin))}′ ≈ ${r.d}°${r.m}′`],
    meta: { t: 'toDMS', value },
  })
}

function guessCheck(): Question {
  for (;;) {
    const fn = pick(['sin', 'cos', 'tan'] as Fn[])
    const th = int(5, 85)
    const val = round(FN[fn](th), 4)
    if (Math.round(INV[fn](val)) !== th || val >= 1 && fn !== 'tan') continue
    return q({
      prompt: `Use your calculator to guess and check: find the angle ${TH}, to the nearest degree, if ${fn} ${TH} = ${num(val, 4)}.`,
      answer: numA(th, 0),
      suffix: '°',
      calc: 'trig',
      hint: `Try an angle, find its ${fn}, then go up or down. ${fn === 'cos' ? 'cos gets smaller as the angle gets bigger.' : `${fn} gets bigger as the angle gets bigger.`}`,
      steps: [`${fn} ${th - 1}° = ${num(round(FN[fn](th - 1), 4), 4)}, ${fn} ${th}° = ${num(val, 4)}, ${fn} ${th + 1}° = ${num(round(FN[fn](th + 1), 4), 4)}`, `${TH} ≈ ${th}°`],
      meta: { t: 'guessCheck', fn, val },
    })
  }
}

const ex404 = (level: Level): Question => {
  if (level === 1) return evalTrig(chance(0.65) ? 'whole' : 'dec', chance(0.85) ? 2 : 4)
  if (level === 2) {
    const r = random()
    return r < 0.33 ? roundDeg() : r < 0.66 ? roundMin() : evalTrig('dm')
  }
  const r = random()
  return r < 0.45 ? toDMS() : r < 0.75 ? guessCheck() : evalTrig('dm', chance() ? 2 : 4)
}

// ================================================================= 4.05 and 4.06 Finding an unknown side

interface SideCase {
  known: Role
  want: Role
}
/** 4.05: the unknown is on top of the ratio; 4.06: it is underneath */
const TOP_CASES: SideCase[] = [{ known: 'hyp', want: 'opp' }, { known: 'hyp', want: 'adj' }, { known: 'adj', want: 'opp' }]
const BOTTOM_CASES: SideCase[] = [{ known: 'opp', want: 'hyp' }, { known: 'adj', want: 'hyp' }, { known: 'opp', want: 'adj' }]
/** the unknown side from the known side, angle and roles (independent of how it is written) */
function solveSide(c: SideCase, k: number, th: number): { x: number; fn: Fn; under: boolean } {
  const fn = fnFor(c.known, c.want)
  const f = FN[fn](th)
  const [top] = PARTS[fn]
  // fn = top / bottom
  const under = top === c.known
  return { x: under ? k / f : k * f, fn, under }
}
/** working for a side: the ratio, the equation, rearranged, the value */
function sideSteps(c: SideCase, k: number, unit: string, a: Ang, p: string, dp: number): string[] {
  const { x, fn, under } = solveSide(c, k, a.v)
  const U = unit ? ' ' + unit : ''
  const ks = num(k)
  return [
    `The sides marked for ${a.t} are the ${SHORT[c.want]} (${v(p)}) and the ${SHORT[c.known]} (${ks}${U}), so use ${fn}.`,
    `${fn} ${a.t} = ${under ? frac(ks, v(p)) : frac(v(p), ks)}`,
    under ? `${v(p)} = ${frac(ks, `${fn} ${a.t}`)}` : `${v(p)} = ${ks} ${fn} ${a.t}`,
    `= ${cut(x)}`,
    `≈ ${fmt(x, dp)}${U}`,
  ]
}
const pickUnit = () => pick(['mm', 'cm', 'cm', 'm', 'm'])
const knownLen = (unit: string) => (unit === 'mm' ? int(40, 900) : chance(0.6) ? int(4, 60) : int(40, 600) / 10)

function sideDiagram(bottom: boolean, angKind: 'whole' | 'dm' | 'mixed', dpChoice?: number): Question {
  for (;;) {
    const c = pick(bottom ? BOTTOM_CASES : TOP_CASES)
    const a = anyAng(angKind, 15, 75)
    const unit = pickUnit()
    const k = knownLen(unit)
    const dp = dpChoice ?? pick([1, 2, 2])
    const { x } = solveSide(c, k, a.v)
    if (!clear(x, dp) || x > 5000) continue
    const p = pick(PRON)
    const lab: Partial<Record<Role, string>> = { [c.known]: `${num(k)} ${unit}`, [c.want]: p }
    const { svg, note } = tri({ th: a.v, mark: a.t, ...lab })
    return q({
      prompt: `Find the value of ${v(p)}, ${roundWords(dp)}.`,
      diagram: svg,
      note,
      answer: numA(x, dp),
      prefix: `${v(p)} =`,
      suffix: unit,
      calc: 'trig',
      hint: `Label the sides for ${a.t}. Which two are marked? ${SOH}` + (bottom ? ` ${v(p)} will end up underneath: swap it with the ratio.` : ''),
      steps: sideSteps(c, k, unit, a, p, dp),
      meta: { t: 'sideDiagram', known: c.known, want: c.want, k, ang: a.v, dp },
    })
  }
}

/** Multiple choice: which ratio is a/b, which expression gives the unknown, or which value is right */
function whichRatioSides(): Question {
  const th = pick([int(22, 40), int(50, 68)])
  const [pa, pb] = sample(PRON, 2)
  const pair = pick([['opp', 'hyp'], ['adj', 'hyp'], ['opp', 'adj']] as [Role, Role][])
  const fn = fnFor(pair[0], pair[1])
  const { svg, note } = tri({ th, mark: TH, [pair[0]]: pa, [pair[1]]: pb })
  return q({
    prompt: `Which trigonometric ratio is equal to ${frac(v(pa), v(pb))}?`,
    diagram: svg,
    note,
    answer: mcFixedA([`sin ${TH}`, `cos ${TH}`, `tan ${TH}`], `${fn} ${TH}`),
    hint: SOH,
    steps: [`For ${TH}, ${v(pa)} is the ${SHORT[pair[0]]} side and ${v(pb)} is the ${SHORT[pair[1]]}.`, `${frac(SHORT[pair[0]], SHORT[pair[1]])} = ${fn} ${TH}`],
    meta: { t: 'whichRatioSides', top: pair[0], bot: pair[1], fn },
  })
}

function whichExpr(bottom: boolean): Question {
  const c = pick(bottom ? BOTTOM_CASES : TOP_CASES)
  let a = angW(20, 70)
  while (a.v === 45) a = angW(20, 70) // the other angle would be 45° too
  const k = int(5, 60)
  const p = pick(PRON)
  const { svg, note } = tri({ th: a.v, mark: a.t, [c.known]: String(k), [c.want]: p })
  const { x } = solveSide(c, k, a.v)
  const exprs: { s: string; val: number; otherAngle?: boolean }[] = []
  for (const f of ['sin', 'cos', 'tan'] as Fn[]) {
    exprs.push({ s: `${k} ${f} ${a.t}`, val: k * FN[f](a.v) })
    exprs.push({ s: frac(k, `${f} ${a.t}`), val: k / FN[f](a.v) })
  }
  // tan of the other acute angle: right when it equals the answer, so it is only ever a wrong option
  const other = 90 - a.v
  exprs.push({ s: `${k} tan ${other}°`, val: k * tanD(other), otherAngle: true })
  const right = exprs.find((e) => Math.abs(e.val - x) < 1e-9 && !e.otherAngle)!
  const wrong = shuffle(exprs.filter((e) => Math.abs(e.val - x) > 1e-6 * x)).slice(0, 3).map((e) => e.s)
  return q({
    prompt: `Which expression gives the value of ${v(p)}?`,
    diagram: svg,
    note,
    answer: mcA(right.s, wrong),
    hint: `Label the sides for ${a.t}, choose the ratio, then rearrange to get ${v(p)} on its own.`,
    steps: sideSteps(c, k, '', a, p, 2).slice(0, 3),
    meta: { t: 'whichExpr', known: c.known, want: c.want, k, ang: a.v },
  })
}

function whichValue(bottom: boolean): Question {
  for (;;) {
    const c = pick(bottom ? BOTTOM_CASES : TOP_CASES)
    const a = chance() ? angW(20, 70) : angDM(20, 70)
    const unit = pick(['cm', 'm'])
    const k = int(80, 600) / 10
    const { x, fn } = solveSide(c, k, a.v)
    if (!clear(x, 2)) continue
    const p = pick(PRON)
    const { svg, note } = tri({ th: a.v, mark: a.t, [c.known]: `${num(k)} ${unit}`, [c.want]: p })
    const alts = (['sin', 'cos', 'tan'] as Fn[]).filter((f) => f !== fn).flatMap((f) => [k * FN[f](a.v), k / FN[f](a.v)])
    const opts = numOptions(x, [...alts, bottom ? k * FN[fn](a.v) : k / FN[fn](a.v)], (y) => `${fmt(y, 2)} ${unit}`)
    return q({
      prompt: `What is the value of ${v(p)}, ${DPW[2]}?`,
      diagram: svg,
      note,
      answer: mcA(opts.correct, opts.wrong),
      calc: 'trig',
      hint: `Label the sides for ${a.t}, then choose sin, cos or tan.`,
      steps: sideSteps(c, k, unit, a, p, 2),
      meta: { t: 'whichValue', known: c.known, want: c.want, k, ang: a.v },
    })
  }
}

/** A triangle described in words: △JKL is right-angled at K, JK = 35 m and ∠J = 63°. */
function sideDescribed(bottom: boolean): Question {
  for (;;) {
    const ns = names3()
    const [R, A, O] = ns
    const c = pick(bottom ? BOTTOM_CASES : TOP_CASES)
    const a = pick([angW, angW, angD1, angDM])(18, 72)
    const unit = pick(['mm', 'cm', 'm'])
    const k = unit === 'mm' ? int(50, 500) : chance() ? int(5, 60) : int(50, 600) / 10
    const dp = pick([0, 1, 2])
    const { x } = solveSide(c, k, a.v)
    if (!clear(x, dp)) continue
    const nameOf: Record<Role, string> = { hyp: sideName(A, O), opp: sideName(R, O), adj: sideName(R, A) }
    const style = chance()
    const intro = style ? `${triName(ns)} is right-angled at ${R}, ${nameOf[c.known]} = ${num(k)} ${unit} and ∠${A} = ${a.t}.` : `In ${triName(ns)}, ∠${R} = 90°, ∠${A} = ${a.t} and ${nameOf[c.known]} = ${num(k)} ${unit}.`
    const steps = sideSteps(c, k, unit, a, 'x', dp)
    return q({
      prompt: `${intro} Find the length of ${nameOf[c.want]}, ${roundWords(dp, unit)}.`,
      answer: numA(x, dp),
      suffix: unit,
      calc: 'trig',
      hint: `Sketch the triangle with the right angle at ${R} and mark ∠${A}. ${nameOf.hyp} is the hypotenuse.`,
      steps: [`Sketch it: the right angle is at ${R}, so ${nameOf.hyp} is the hypotenuse. For ∠${A}, ${nameOf.opp} is opposite and ${nameOf.adj} is adjacent. Let ${nameOf[c.want]} = ${v('x')}.`, ...steps],
      meta: { t: 'sideDescribed', known: c.known, want: c.want, k, ang: a.v, dp, R, A, O },
    })
  }
}

interface Ctx {
  prompt: string
  x: number
  dp: number
  unit: string
  steps: string[]
  hint: string
  meta: Record<string, unknown>
}
/** everyday problems where the unknown is on top: x = k × ratio */
function topContext(): Ctx {
  const kind = pick(['ladderGround', 'ladderPole', 'shadow', 'ramp', 'anchor', 'kite', 'wire', 'park', 'brace'] as const)
  switch (kind) {
    case 'ladderGround': {
      const L = pick([3, 3.5, 4, 4.5, 5, 6, 7.2])
      const th = int(62, 80)
      const x = L * sinD(th)
      return { prompt: `A ${num(L)} m ladder leans against a wall and makes an angle of ${th}° with the ground. How far up the wall does it reach, ${DPW[1]}?`, x, dp: 1, unit: 'm', hint: 'The ladder is the hypotenuse. The height up the wall is opposite the angle with the ground.', steps: [`sin ${th}° = ${frac(v('h'), num(L))}`, `${v('h')} = ${num(L)} sin ${th}° = ${cut(x)} ≈ ${fmt(x, 1)} m`], meta: { kind, L, th } }
    }
    case 'ladderPole': {
      const L = pick([5, 6, 6.5, 8])
      const th = int(12, 25)
      const x = L * cosD(th)
      return { prompt: `A ${num(L)} m ladder leans against a pole, making an angle of ${th}° with the pole. How far up the pole does it reach, correct to the nearest millimetre? (Answer in metres.)`, x, dp: 3, unit: 'm', hint: 'The angle is at the top, next to the pole. The height up the pole is adjacent to it.', steps: [`cos ${th}° = ${frac(v('h'), num(L))}`, `${v('h')} = ${num(L)} cos ${th}° = ${cut(x)} ≈ ${fmt(x, 3)} m (to the nearest mm)`], meta: { kind, L, th } }
    }
    case 'shadow': {
      const s = int(8, 40)
      const th = int(20, 60)
      const x = s * tanD(th)
      return { prompt: `A tree casts a shadow ${s} m long on flat ground. The Sun’s rays meet the ground at an angle of ${th}°. Find the height of the tree, correct to the nearest centimetre. (Answer in metres.)`, x, dp: 2, unit: 'm', hint: 'The shadow is adjacent to the angle; the tree is opposite it. Use tan.', steps: [`tan ${th}° = ${frac(v('h'), s)}`, `${v('h')} = ${s} tan ${th}° = ${cut(x)} ≈ ${fmt(x, 2)} m`], meta: { kind, s, th } }
    }
    case 'ramp': {
      const L = pick([4, 5, 6, 7.5, 8])
      const th = pick([3, 3.5, 4, 4.5, 5])
      const x = L * sinD(th)
      return { prompt: `A wheelchair ramp is ${num(L)} m long and makes an angle of ${num(th)}° with the ground. How high is the top of the ramp above the ground, ${DPW[2]}?`, x, dp: 2, unit: 'm', hint: 'The ramp is the hypotenuse; the height is opposite the angle.', steps: [`sin ${num(th)}° = ${frac(v('h'), num(L))}`, `${v('h')} = ${num(L)} sin ${num(th)}° = ${cut(x)} ≈ ${fmt(x, 2)} m`], meta: { kind, L, th } }
    }
    case 'anchor': {
      const L = int(40, 120) / 10
      const th = int(15, 40)
      const x = L * cosD(th)
      return { prompt: `A boat is anchored by a rope ${num(L)} m long. The rope makes an angle of ${th}° with the vertical. How deep is the water, ${DPW[1]}?`, x, dp: 1, unit: 'm', hint: 'The rope is the hypotenuse. The depth is the vertical side, next to the angle.', steps: [`cos ${th}° = ${frac(v('d'), num(L))}`, `${v('d')} = ${num(L)} cos ${th}° = ${cut(x)} ≈ ${fmt(x, 1)} m`], meta: { kind, L, th } }
    }
    case 'kite': {
      const L = int(60, 200)
      const th = int(25, 60)
      const x = L * sinD(th)
      return { prompt: `${pick(['Ari', 'Mia', 'Jai', 'Lena'])} flies a kite on a string ${L} m long. The string makes an angle of ${th}° with the horizontal. How high is the kite above their hand, correct to the nearest metre?`, x, dp: 0, unit: 'm', hint: 'The string is the hypotenuse; the height is opposite the angle.', steps: [`sin ${th}° = ${frac(v('h'), L)}`, `${v('h')} = ${L} sin ${th}° = ${cut(x)} ≈ ${fmt(x, 0)} m`], meta: { kind, L, th } }
    }
    case 'wire': {
      const h = int(4, 12)
      const th = int(20, 40)
      const x = h * tanD(th)
      return { prompt: `A support wire is attached to a pole ${h} m above the ground. It makes an angle of ${th}° with the pole. How far is the bottom of the wire from the base of the pole, correct to the nearest centimetre? (Answer in metres.)`, x, dp: 2, unit: 'm', hint: 'The angle is at the top, between the wire and the pole. The pole is adjacent; the distance along the ground is opposite.', steps: [`tan ${th}° = ${frac(v('d'), h)}`, `${v('d')} = ${h} tan ${th}° = ${cut(x)} ≈ ${fmt(x, 2)} m`], meta: { kind, h, th } }
    }
    case 'park': {
      const d = int(200, 700)
      const th = int(20, 40)
      const longer = chance()
      const x = longer ? d * cosD(th) : d * sinD(th)
      return { prompt: `A rectangular park has a straight path ${d} m long along its diagonal. The path makes an angle of ${th}° with the longer side. Find the length of the ${longer ? 'longer' : 'shorter'} side of the park, correct to the nearest metre.`, x, dp: 0, unit: 'm', hint: `The path is the hypotenuse. The longer side is adjacent to the ${th}° angle; the shorter side is opposite it.`, steps: [`${longer ? 'cos' : 'sin'} ${th}° = ${frac(v('x'), d)}`, `${v('x')} = ${d} ${longer ? 'cos' : 'sin'} ${th}° = ${cut(x)} ≈ ${fmt(x, 0)} m`], meta: { kind, d, th, longer } }
    }
    case 'brace': {
      const L = int(1400, 2400)
      const th = int(30, 60)
      const x = L * sinD(th)
      return { prompt: `A rectangular gate has a diagonal brace ${L} mm long. The brace makes an angle of ${th}° with the bottom of the gate. How tall is the gate, correct to the nearest millimetre?`, x, dp: 0, unit: 'mm', hint: 'The brace is the hypotenuse; the height of the gate is opposite the angle at the bottom.', steps: [`sin ${th}° = ${frac(v('h'), L)}`, `${v('h')} = ${L} sin ${th}° = ${cut(x)} ≈ ${fmt(x, 0)} mm`], meta: { kind, L, th } }
    }
  }
}
/** everyday problems where the unknown is underneath: x = k ÷ ratio */
function bottomContext(): Ctx {
  const kind = pick(['ladderFoot', 'ladderHigh', 'flagWire', 'glider', 'rampLength', 'balloon', 'aim'] as const)
  switch (kind) {
    case 'ladderFoot': {
      const d = int(150, 400)
      const th = int(60, 78)
      const x = d / cosD(th)
      return { prompt: `The foot of a ladder is ${d} cm from a wall, and the ladder makes an angle of ${th}° with the ground. How long is the ladder, correct to the nearest centimetre?`, x, dp: 0, unit: 'cm', hint: 'The distance from the wall is adjacent to the angle; the ladder is the hypotenuse.', steps: [`cos ${th}° = ${frac(d, v('L'))}`, `${v('L')} = ${frac(d, `cos ${th}°`)} = ${cut(x)} ≈ ${fmt(x, 0)} cm`], meta: { kind, d, th } }
    }
    case 'ladderHigh': {
      const h = int(30, 90) / 10
      const th = int(60, 78)
      const x = h / sinD(th)
      return { prompt: `A ladder reaches ${num(h)} m up a wall and makes an angle of ${th}° with the ground. How long is the ladder, ${DPW[2]}?`, x, dp: 2, unit: 'm', hint: 'The height up the wall is opposite the angle; the ladder is the hypotenuse.', steps: [`sin ${th}° = ${frac(num(h), v('L'))}`, `${v('L')} = ${frac(num(h), `sin ${th}°`)} = ${cut(x)} ≈ ${fmt(x, 2)} m`], meta: { kind, h, th } }
    }
    case 'flagWire': {
      const h = int(8, 20)
      const th = int(45, 65)
      const x = h / tanD(th)
      return { prompt: `A wire runs from the top of a ${h} m flagpole to the ground, meeting the ground at an angle of ${th}°. How far from the base of the flagpole is the wire anchored, ${DPW[1]}?`, x, dp: 1, unit: 'm', hint: 'The flagpole is opposite the angle at the ground; the distance along the ground is adjacent. Use tan.', steps: [`tan ${th}° = ${frac(h, v('d'))}`, `${v('d')} = ${frac(h, `tan ${th}°`)} = ${cut(x)} ≈ ${fmt(x, 1)} m`], meta: { kind, h, th } }
    }
    case 'glider': {
      const h = int(8, 25) / 10
      const th = int(10, 25)
      const x = h / sinD(th)
      return { prompt: `A glider is flying ${num(h)} km above the ground. To land, it descends in a straight line at an angle of ${th}° to the ground. How far does it travel before landing, ${DPW[1]}?`, x, dp: 1, unit: 'km', hint: 'The height is opposite the angle at the ground; the flight path is the hypotenuse.', steps: [`sin ${th}° = ${frac(num(h), v('d'))}`, `${v('d')} = ${frac(num(h), `sin ${th}°`)} = ${cut(x)} ≈ ${fmt(x, 1)} km`], meta: { kind, h, th } }
    }
    case 'rampLength': {
      const hc = int(30, 90)
      const th = pick([3, 4, 4.5, 5, 6])
      const x = hc / 100 / sinD(th)
      return { prompt: `The entrance to a library is ${hc} cm above the ground. A wheelchair ramp up to it makes an angle of ${num(th)}° with the ground. How long is the ramp, in metres, ${DPW[2]}?`, x, dp: 2, unit: 'm', hint: `Change ${hc} cm to metres first. The height is opposite the angle; the ramp is the hypotenuse.`, steps: [`${hc} cm = ${num(hc / 100)} m`, `sin ${num(th)}° = ${frac(num(hc / 100), v('L'))}`, `${v('L')} = ${frac(num(hc / 100), `sin ${num(th)}°`)} = ${cut(x)} ≈ ${fmt(x, 2)} m`], meta: { kind, hc, th } }
    }
    case 'balloon': {
      const d = int(10, 40)
      const th = int(60, 80)
      const x = d / cosD(th)
      return { prompt: `A hot air balloon is tied to the ground by a rope. It drifts ${d} m sideways, and the rope makes an angle of ${th}° with the ground. How long is the rope, ${DPW[1]}?`, x, dp: 1, unit: 'm', hint: 'The sideways distance is adjacent to the angle at the ground; the rope is the hypotenuse.', steps: [`cos ${th}° = ${frac(d, v('r'))}`, `${v('r')} = ${frac(d, `cos ${th}°`)} = ${cut(x)} ≈ ${fmt(x, 1)} m`], meta: { kind, d, th } }
    }
    case 'aim': {
      const miss = int(40, 90)
      const th = pick([1, 1.5, 2])
      const x = miss / tanD(th)
      return { prompt: `An archer aims straight at the centre of a target, but the arrow leaves ${num(th)}° off target and misses the centre by ${miss} mm. How far is the archer from the target, correct to the nearest millimetre?`, x, dp: 0, unit: 'mm', hint: 'The miss is opposite the small angle; the distance to the target is adjacent. Use tan.', steps: [`tan ${num(th)}° = ${frac(miss, v('d'))}`, `${v('d')} = ${frac(miss, `tan ${num(th)}°`)} = ${cut(x)} ≈ ${fmt(x, 0)} mm`], meta: { kind, miss, th } }
    }
  }
}
function contextQ(bottom: boolean): Question {
  for (;;) {
    const c = bottom ? bottomContext() : topContext()
    if (!clear(c.x, c.dp)) continue
    return q({
      prompt: c.prompt,
      answer: numA(c.x, c.dp),
      suffix: c.unit,
      calc: 'trig',
      hint: c.hint + ' A quick sketch helps.',
      steps: c.steps,
      meta: { t: 'context', ...c.meta, dp: c.dp },
    })
  }
}

/** Two steps: △ABC with BX perpendicular to AC. Find BX first, then CX. */
function altitude(): Question {
  for (;;) {
    const A = int(30, 55)
    const C = int(50, 75)
    const ab = int(12, 40)
    const bx = ab * sinD(A)
    const ax = ab * cosD(A)
    const cx = bx / tanD(C)
    const ask = chance(0.35) ? 'BX' : 'CX'
    const x = ask === 'BX' ? bx : cx
    if (!clear(x, 1)) continue
    const svg = F.fig({
      pts: { A: [0, 0], X: [ax, 0], B: [ax, bx], C: [ax + cx, 0] },
      polys: [{ v: ['A', 'B', 'C'] }],
      segs: [{ a: 'B', b: 'X' }],
      rights: [['B', 'X', 'C']],
      sides: [{ a: 'A', b: 'B', text: `${ab} cm`, away: 'C' }],
      angles: [
        { at: 'A', a: 'B', b: 'X', text: `${A}°` },
        { at: 'C', a: 'B', b: 'X', text: `${C}°` },
      ],
      names: ['A', 'B', 'C', 'X'],
      label: 'Triangle ABC with BX perpendicular to AC',
    })
    return q({
      prompt: `In △ABC, ∠A = ${A}°, ∠C = ${C}°, AB = ${ab} cm and BX is perpendicular to AC. Find the length of ${ask}, ${DPW[1]}.`,
      diagram: svg,
      answer: numA(x, 1),
      suffix: 'cm',
      calc: 'trig',
      hint: ask === 'BX' ? 'Use △ABX: AB is its hypotenuse and BX is opposite ∠A.' : 'First find BX in △ABX (don’t round it), then use △CBX, where BX is opposite ∠C and CX is adjacent.',
      steps:
        ask === 'BX'
          ? [`In △ABX: sin ${A}° = ${frac('BX', ab)}`, `BX = ${ab} sin ${A}° = ${cut(bx)} ≈ ${fmt(bx, 1)} cm`]
          : [`In △ABX: BX = ${ab} sin ${A}° = ${cut(bx)} (keep this in the calculator)`, `In △CBX: tan ${C}° = ${frac('BX', 'CX')}`, `CX = ${frac('BX', `tan ${C}°`)} = ${cut(cx)} ≈ ${fmt(cx, 1)} cm`],
      meta: { t: 'altitude', A, C, ab, ask },
    })
  }
}

const ex405 = (level: Level): Question => {
  if (level === 1) {
    const r = random()
    return r < 0.3 ? whichRatioSides() : r < 0.5 ? whichExpr(false) : sideDiagram(false, 'whole', 2)
  }
  if (level === 2) {
    const r = random()
    return r < 0.45 ? sideDiagram(false, 'dm') : r < 0.75 ? sideDescribed(false) : whichValue(false)
  }
  return chance(0.85) ? contextQ(false) : altitude()
}
const ex406 = (level: Level): Question => {
  if (level === 1) return chance(0.25) ? whichExpr(true) : sideDiagram(true, 'whole', 1)
  if (level === 2) {
    const r = random()
    return r < 0.45 ? sideDiagram(true, 'dm') : r < 0.75 ? sideDescribed(true) : whichValue(true)
  }
  return chance(0.8) ? contextQ(true) : altitude()
}

// ================================================================= 4.07 Finding an unknown angle

type AngTo = 'degree' | 'minute' | 'dp1'
const angAnswer = (value: number, to: AngTo) => (to === 'minute' ? { kind: 'dms' as const, value, to: 'minute' as const } : numA(value, to === 'dp1' ? 1 : 0))
const angWords: Record<AngTo, string> = { degree: 'correct to the nearest degree', minute: 'correct to the nearest minute', dp1: DPW[1] }
const angShow = (value: number, to: AngTo) => (to === 'minute' ? dmsStr(value) : `${fmt(value, to === 'dp1' ? 1 : 0)}°`)
/** an angle that isn't too close to a rounding boundary for the precision asked */
const angClear = (value: number, to: AngTo) => (to === 'minute' ? clear(value * 60, 0) : clear(value, to === 'dp1' ? 1 : 0))

function angleFromRatio(to: AngTo): Question {
  for (;;) {
    const fn = pick(['sin', 'cos', 'tan'] as Fn[])
    let shown: string
    let x: number
    if (chance(0.4)) {
      const d = int(2, 20)
      const n = fn === 'tan' ? int(1, 30) : int(1, d - 1)
      if (gcd(n, d) !== 1) continue
      x = n / d
      shown = frac(n, d)
    } else {
      x = fn === 'tan' ? int(50, 9000) / 1000 : int(500, 9990) / 10000
      shown = num(x)
    }
    const L = pick([TH, 'A', 'X', AL])
    const value = INV[fn](x)
    if (!angClear(value, to)) continue
    return q({
      prompt: `If ${fn} ${L} = ${shown}, find ${L}, ${angWords[to]}.`,
      answer: angAnswer(value, to),
      suffix: to === 'minute' ? undefined : '°',
      calc: 'trig',
      hint: `Use the inverse function: ${L} = ${inv(fn)}(${shown}). On the calculator press 2nd (or SHIFT) then ${fn}.` + (to === 'minute' ? ' Then press ° ′ ″ to see degrees and minutes.' : ''),
      steps: [`${L} = ${inv(fn)}(${shown})`, `= ${cut(value)}°`, `≈ ${angShow(value, to)}`],
      meta: { t: 'angleFromRatio', fn, x, to },
    })
  }
}

function angleFromTri(to: AngTo): Question {
  for (;;) {
    const unit = pickUnit()
    const pair = pick([['opp', 'hyp'], ['adj', 'hyp'], ['opp', 'adj']] as [Role, Role][])
    const lens: Partial<Record<Role, number>> = {}
    const big = unit === 'mm' ? int(30, 200) : chance() ? int(5, 40) : int(30, 300) / 10
    if (pair[1] === 'hyp') {
      lens.hyp = big
      lens[pair[0]] = unit === 'mm' ? int(10, big - 5) : chance() ? int(2, Math.max(3, Math.floor(big) - 1)) : int(10, Math.max(11, Math.floor(big * 10) - 5)) / 10
      if (lens[pair[0]]! >= big) continue
    } else {
      lens.opp = big
      lens.adj = unit === 'mm' ? int(20, 200) : chance() ? int(3, 40) : int(30, 300) / 10
    }
    const fn = fnFor(pair[0], pair[1])
    const ratio = lens[PARTS[fn][0]]! / lens[PARTS[fn][1]]!
    const value = INV[fn](ratio)
    if (value < 12 || value > 78 || !angClear(value, to)) continue
    const L = pick([TH, AL])
    const { svg, note } = tri({ th: value, mark: L, [pair[0]]: `${num(lens[pair[0]]!)} ${unit}`, [pair[1]]: `${num(lens[pair[1]]!)} ${unit}` })
    const top = num(lens[PARTS[fn][0]]!)
    const bot = num(lens[PARTS[fn][1]]!)
    return q({
      prompt: `Find the size of angle ${L}, ${angWords[to]}.`,
      diagram: svg,
      note,
      answer: angAnswer(value, to),
      suffix: to === 'minute' ? undefined : '°',
      calc: 'trig',
      hint: `Which two sides are marked for ${L}? Choose sin, cos or tan, then use the inverse function.`,
      steps: [`For ${L}, the marked sides are the ${SHORT[PARTS[fn][0]]} (${top}) and the ${SHORT[PARTS[fn][1]]} (${bot}), so use ${fn}.`, `${fn} ${L} = ${frac(top, bot)}`, `${L} = ${inv(fn)}(${frac(top, bot)}) = ${cut(value)}°`, `${L} ≈ ${angShow(value, to)}`],
      meta: { t: 'angleFromTri', fn, top: lens[PARTS[fn][0]], bot: lens[PARTS[fn][1]], to },
    })
  }
}

function angleDescribed(to: AngTo): Question {
  for (;;) {
    const ns = names3()
    const [R, A, O] = ns
    const pair = pick([['opp', 'hyp'], ['adj', 'hyp'], ['opp', 'adj']] as [Role, Role][])
    const unit = pick(['mm', 'cm', 'm'])
    const lens: Partial<Record<Role, number>> = {}
    if (pair[1] === 'hyp') {
      lens.hyp = unit === 'mm' ? int(40, 300) : int(30, 250) / 10
      lens[pair[0]] = unit === 'mm' ? int(10, lens.hyp - 5) : int(10, Math.round(lens.hyp * 10) - 5) / 10
    } else {
      lens.opp = unit === 'mm' ? int(20, 200) : int(20, 200) / 10
      lens.adj = unit === 'mm' ? int(20, 200) : int(20, 200) / 10
    }
    const fn = fnFor(pair[0], pair[1])
    const value = INV[fn](lens[PARTS[fn][0]]! / lens[PARTS[fn][1]]!)
    if (value < 8 || value > 82 || !angClear(value, to)) continue
    const nameOf: Record<Role, string> = { hyp: sideName(A, O), opp: sideName(R, O), adj: sideName(R, A) }
    const given = shuffle(pair).map((r) => `${nameOf[r]} = ${num(lens[r]!)} ${unit}`).join(' and ')
    const intro = chance() ? `${triName(ns)} is right-angled at ${R}, with ${given}.` : `In ${triName(ns)}, ∠${R} = 90°, ${given}.`
    const top = num(lens[PARTS[fn][0]]!)
    const bot = num(lens[PARTS[fn][1]]!)
    return q({
      prompt: `${intro} Find ∠${A}, ${angWords[to]}.`,
      answer: angAnswer(value, to),
      suffix: to === 'minute' ? undefined : '°',
      calc: 'trig',
      hint: `Sketch the triangle with the right angle at ${R}. For ∠${A}, ${nameOf.opp} is opposite, ${nameOf.adj} is adjacent and ${nameOf.hyp} is the hypotenuse.`,
      steps: [`For ∠${A}: ${nameOf[PARTS[fn][0]]} is the ${SHORT[PARTS[fn][0]]} side and ${nameOf[PARTS[fn][1]]} is the ${SHORT[PARTS[fn][1]]}, so use ${fn}.`, `${fn} ${A} = ${frac(top, bot)}`, `∠${A} = ${inv(fn)}(${frac(top, bot)}) = ${cut(value)}°`, `∠${A} ≈ ${angShow(value, to)}`],
      meta: { t: 'angleDescribed', fn, top: lens[PARTS[fn][0]], bot: lens[PARTS[fn][1]], to, R, A, O },
    })
  }
}

function angleMC(): Question {
  for (;;) {
    const q0 = angleFromTri('minute')
    const m = q0.meta as unknown as { fn: Fn; top: number; bot: number }
    const value = INV[m.fn](m.top / m.bot)
    // the right answer, the other two ratios and a rounding slip (the minutes cut off instead of rounded)
    const alts = (['sin', 'cos', 'tan'] as Fn[]).filter((f) => f !== m.fn).map((f) => {
      const r = m.top / m.bot
      return f === 'tan' || r < 1 ? INV[f](r) : NaN
    })
    const trunc = Math.floor(value * 60) / 60
    const cands = [trunc, ...alts, 90 - value].filter((x) => Number.isFinite(x) && dmsStr(x) !== dmsStr(value))
    const wrong = Array.from(new Set(cands.map((x) => dmsStr(x)))).slice(0, 3)
    if (wrong.length < 3) continue
    return q({ ...q0, prompt: q0.prompt.replace('Find the size of', 'What is the size of').replace(/, correct to the nearest minute\.$/, ', correct to the nearest minute?'), answer: mcA(dmsStr(value), wrong), suffix: undefined, meta: { ...q0.meta, t: 'angleMC' } })
  }
}

function angleContext(): Question {
  for (;;) {
    const kind = pick(['road', 'ladderWall', 'ladderGround', 'plane', 'sun', 'beach', 'cone', 'chain', 'foldLadder', 'ramp'] as const)
    let prompt = ''
    let fn: Fn = 'sin'
    let top = 0
    let bot = 0
    let to: AngTo = 'degree'
    let double = false
    let hint = ''
    switch (kind) {
      case 'road':
        top = int(20, 80)
        bot = pick([300, 400, 500, 1000])
        prompt = `A road rises ${top} m for every ${bot} m travelled along it. At what angle is the road inclined to the horizontal?`
        hint = 'The distance along the road is the hypotenuse; the rise is opposite the angle.'
        break
      case 'ladderWall':
        bot = int(8, 20)
        top = int(Math.ceil(bot * 0.75), bot - 1)
        fn = 'cos'
        prompt = `A ladder ${bot} m long leans against a building and reaches ${top} m up the building. Find the angle between the ladder and the building.`
        hint = 'The angle is at the top, between the ladder and the wall. The height up the wall is adjacent to it; the ladder is the hypotenuse.'
        break
      case 'ladderGround':
        bot = int(30, 90) / 10
        top = int(Math.ceil(bot * 8), Math.floor(bot * 9.6)) / 10
        prompt = `A ${num(bot)} m ladder reaches ${num(top)} m up a wall. What angle does the ladder make with the ground?`
        hint = 'The height up the wall is opposite the angle at the ground; the ladder is the hypotenuse.'
        break
      case 'plane':
        top = int(600, 1800)
        bot = int(1000, 4000)
        fn = 'tan'
        prompt = `A plane is coming in to land in a straight line. At a height of ${top} m, it is ${bot} m horizontally from the end of the runway. Find its angle of descent to the horizontal.`
        hint = 'The height is opposite the angle; the horizontal distance is adjacent. Use tan.'
        break
      case 'sun':
        top = int(30, 150) / 10
        bot = int(20, 150) / 10
        fn = 'tan'
        prompt = `A pole ${num(top)} m tall casts a shadow ${num(bot)} m long on flat ground. What angle do the Sun’s rays make with the ground?`
        hint = 'The pole is opposite the angle at the ground; the shadow is adjacent.'
        break
      case 'beach':
        bot = int(60, 150) / 10
        top = int(5, Math.floor(bot * 3)) / 10
        prompt = `A beach slopes down at a steady angle into the water. After walking ${num(bot)} m down the slope from the water’s edge, the water is ${num(top)} m deep. At what angle is the beach inclined to the horizontal?`
        hint = `The ${num(bot)} m slope is the hypotenuse; the depth is opposite the angle.`
        break
      case 'cone': {
        const D2 = int(20, 50)
        bot = int(Math.ceil(D2 * 0.6), D2)
        top = D2 / 2
        fn = 'cos'
        prompt = `A pile of sand is a cone with a base diameter of ${D2} m. It measures ${bot} m up the slope from the edge of the base to the top. Find the angle the slope makes with the ground.`
        hint = `The radius (half the diameter, ${num(top)} m) is adjacent to the angle; the slope is the hypotenuse.`
        break
      }
      case 'chain':
        top = int(15, 60)
        bot = int(top + 10, top + 60)
        prompt = `A ship is anchored in water ${top} m deep by a straight chain ${bot} m long. Find the angle the chain makes with the sea floor.`
        hint = 'The depth is opposite the angle at the sea floor; the chain is the hypotenuse.'
        break
      case 'foldLadder':
        bot = int(20, 40) / 10
        top = int(8, 16) / 20 // half the spread
        to = 'minute'
        double = true
        prompt = `The two arms of a fold-out ladder are each ${num(bot)} m long. When it is fully opened, the feet are ${num(2 * top)} m apart. Find the angle between the arms, correct to the nearest minute.`
        hint = 'Split the ladder into two right-angled triangles. Each has hypotenuse ' + num(bot) + ' m and a base of half the spread. Find half the angle, then double it.'
        break
      case 'ramp':
        bot = int(4, 15)
        top = int(3, 9) / 10
        prompt = `A ramp is ${bot} m long and rises ${num(top)} m. At what angle is the ramp inclined to the ground?`
        hint = 'The ramp is the hypotenuse; the rise is opposite the angle.'
        break
    }
    const ratio = top / bot
    if (fn !== 'tan' && ratio >= 1) continue
    const half = INV[fn](ratio)
    const value = double ? 2 * half : half
    if (!angClear(value, to)) continue
    const steps = double
      ? [`Half the angle: sin ${TH} = ${frac(num(top), num(bot))}, so ${TH} = ${cut(half)}°`, `The angle between the arms = 2 ${TIMES} ${cut(half)}° = ${cut(value)}°`, `≈ ${angShow(value, to)}`]
      : [`${fn} ${TH} = ${frac(num(top), num(bot))}`, `${TH} = ${inv(fn)}(${frac(num(top), num(bot))}) = ${cut(value)}°`, `${TH} ≈ ${angShow(value, to)}`]
    return q({
      prompt: prompt + (to === 'degree' ? ' Answer to the nearest degree.' : ''),
      answer: angAnswer(value, to),
      suffix: to === 'minute' ? undefined : '°',
      calc: 'trig',
      hint: hint + ' A sketch helps.',
      steps,
      meta: { t: 'angleContext', kind, fn, top, bot, to, double },
    })
  }
}

const ex407 = (level: Level): Question => {
  if (level === 1) return chance(0.45) ? angleFromRatio('degree') : angleFromTri('degree')
  if (level === 2) {
    const r = random()
    return r < 0.25 ? angleFromRatio('minute') : r < 0.55 ? angleFromTri('minute') : r < 0.85 ? angleDescribed(pick(['degree', 'minute', 'dp1'] as AngTo[])) : angleMC()
  }
  return angleContext()
}

// ================================================================= Power plus (extension)

function complement(): Question {
  let x = int(5, 85)
  while (x === 45) x = int(5, 85) // sin 45° = cos 45°, so the blank would have two answers
  const form = pick(['sinIs', 'cosIs', 'blankFn'] as const)
  if (form === 'blankFn') {
    const [f1, f2] = pick([['sin', 'cos'], ['cos', 'sin']] as [Fn, Fn][])
    return q({
      prompt: `Which ratio makes this true? &emsp; ___ ${x}° = ${f2} ${90 - x}°`,
      answer: mcFixedA(['sin', 'cos', 'tan'], f1),
      calc: 'trig',
      hint: 'Check both sides on your calculator, or think about the two acute angles of one right-angled triangle.',
      steps: [`${x}° + ${90 - x}° = 90°, so they are the two acute angles of a right-angled triangle.`, `The side opposite one is adjacent to the other, so ${f1} ${x}° = ${f2} ${90 - x}°.`],
      meta: { t: 'complement', form, x, f1, f2 },
    })
  }
  const [f1, f2] = form === 'sinIs' ? (['sin', 'cos'] as Fn[]) : (['cos', 'sin'] as Fn[])
  return q({
    prompt: `Complete: &emsp; ${f1} ${x}° = ${f2} ___°`,
    answer: numA(90 - x),
    suffix: '°',
    calc: 'trig',
    hint: `Work out ${f1} ${x}° on your calculator, then look for the angle whose ${f2} is the same. Or: the two acute angles of a right-angled triangle add to 90°.`,
    steps: [`In a right-angled triangle the acute angles add to 90°: ${x}° and ${90 - x}°.`, `The side opposite ${x}° is adjacent to ${90 - x}°, so ${f1} ${x}° = ${f2} ${90 - x}°.`],
    meta: { t: 'complement', form, x },
  })
}

function exactValue(): Question {
  const ask = pick(['cos30', 'tan30', 'tan60', 'sin45'] as const)
  const opts: Record<string, string> = {
    r32: frac(sqrt(3), 2),
    i3: frac(1, sqrt(3)),
    r3: sqrt(3),
    i2: frac(1, sqrt(2)),
    h: frac(1, 2),
    t3: frac(2, sqrt(3)),
  }
  const table = {
    cos30: { right: 'r32', given: `sin 30° = ${frac(1, 2)}`, name: 'cos 30°', tri: 'an equilateral triangle with sides 2 cut in half: sides 1, √3 and 2' },
    tan30: { right: 'i3', given: `sin 30° = ${frac(1, 2)}`, name: 'tan 30°', tri: 'an equilateral triangle with sides 2 cut in half: sides 1, √3 and 2' },
    tan60: { right: 'r3', given: `cos 60° = ${frac(1, 2)}`, name: 'tan 60°', tri: 'an equilateral triangle with sides 2 cut in half: sides 1, √3 and 2' },
    sin45: { right: 'i2', given: 'tan 45° = 1', name: 'sin 45°', tri: 'an isosceles right-angled triangle with shorter sides 1 and hypotenuse √2' },
  }[ask]
  const wrongKeys = Object.keys(opts).filter((k) => k !== table.right && !(ask === 'sin45' && k === 'h'))
  return q({
    prompt: `Given that ${table.given}, find the exact value of ${table.name}.`,
    answer: mcA(opts[table.right], sample(wrongKeys, 3).map((k) => opts[k])),
    hint: `Draw ${table.tri}, then use SOH CAH TOA.`,
    steps: [`Use ${table.tri}.`, `${table.name} = ${opts[table.right]}`],
    meta: { t: 'exactValue', ask },
  })
}

function identity(): Question {
  const [a, b, c] = pick(BASE.filter((t) => t[2] < 30))
  const given = pick(['sin', 'cos'] as Fn[])
  const gv = given === 'sin' ? b : a
  const ov = given === 'sin' ? a : b
  return q({
    prompt: `${TH} is an acute angle and ${given} ${TH} = ${frac(gv, c)}. Without finding ${TH}, find ${given === 'sin' ? 'cos' : 'sin'} ${TH} as a fraction.`,
    answer: { kind: 'frac', n: ov, d: c, simplest: false },
    hint: `(sin ${TH})<sup>2</sup> + (cos ${TH})<sup>2</sup> = 1, or draw the triangle and use Pythagoras’ theorem.`,
    steps: [`(${given === 'sin' ? 'cos' : 'sin'} ${TH})<sup>2</sup> = 1 − (${frac(gv, c)})<sup>2</sup> = ${frac(c * c - gv * gv, c * c)}`, `${given === 'sin' ? 'cos' : 'sin'} ${TH} = ${frac(ov, c)} (positive, because ${TH} is acute)`],
    meta: { t: 'identity', given, gv, c },
  })
}

function planeClimb(): Question {
  for (;;) {
    const th = int(8, 20)
    const gain = pick([300, 400, 500, 600])
    const d = gain / sinD(th)
    if (chance()) {
      if (!clear(d, 0)) continue
      return q({
        prompt: `A plane climbs in a straight line at an angle of ${th}° to the horizontal. How far must it fly along its flight path to gain ${gain} m in height? Answer to the nearest metre.`,
        answer: numA(d, 0),
        suffix: 'm',
        calc: 'trig',
        hint: 'The gain in height is opposite the angle; the flight path is the hypotenuse.',
        steps: [`sin ${th}° = ${frac(gain, v('d'))}`, `${v('d')} = ${frac(gain, `sin ${th}°`)} = ${cut(d)} ≈ ${fmt(d, 0)} m`],
        meta: { t: 'planeClimb', part: 'distance', th, gain },
      })
    }
    // the distance as stated (rounded to the metre), so the working uses the numbers on the page
    const half = Math.round(d) / 2
    const ang = asinD(gain / half)
    if (!clear(ang * 60, 0)) continue
    return q({
      prompt: `A plane climbing at ${th}° to the horizontal must fly ${num(Math.round(d))} m along its path to gain ${gain} m in height. At what angle must it climb to gain the same height in half that distance? Answer to the nearest minute.`,
      answer: { kind: 'dms', value: ang, to: 'minute' },
      calc: 'trig',
      hint: `Half the distance is ${num(half)} m. The ${gain} m gain is opposite the new angle, and the new path is the hypotenuse.`,
      steps: [`New path = ${num(Math.round(d))} ÷ 2 = ${num(half)} m`, `sin ${TH} = ${frac(gain, num(half))}`, `${TH} = ${inv('sin')}(${frac(gain, num(half))}) = ${cut(ang)}° ≈ ${dmsStr(ang)}`],
      meta: { t: 'planeClimb', part: 'angle', th, gain, half },
    })
  }
}

function nearestSecond(): Question {
  for (;;) {
    const unit = 'cm'
    const pair = pick([['opp', 'hyp'], ['adj', 'hyp'], ['opp', 'adj']] as [Role, Role][])
    const lens: Partial<Record<Role, number>> = {}
    if (pair[1] === 'hyp') {
      lens.hyp = int(150, 600) / 10
      lens[pair[0]] = int(50, Math.round(lens.hyp * 10) - 20) / 10
    } else {
      lens.opp = int(50, 500) / 10
      lens.adj = int(50, 500) / 10
    }
    const fn = fnFor(pair[0], pair[1])
    const value = INV[fn](lens[PARTS[fn][0]]! / lens[PARTS[fn][1]]!)
    if (value < 15 || value > 75 || !clear(value * 3600, 0)) continue
    const { svg, note } = tri({ th: value, mark: TH, [pair[0]]: `${num(lens[pair[0]]!)} ${unit}`, [pair[1]]: `${num(lens[pair[1]]!)} ${unit}` })
    const top = num(lens[PARTS[fn][0]]!)
    const bot = num(lens[PARTS[fn][1]]!)
    return q({
      prompt: `Find ${TH}, correct to the nearest second.`,
      diagram: svg,
      note,
      answer: { kind: 'dms', value, to: 'second' },
      calc: 'trig',
      hint: 'Choose the ratio, use the inverse function, then press ° ′ ″ to see degrees, minutes and seconds.',
      steps: [`${fn} ${TH} = ${frac(top, bot)}`, `${TH} = ${inv(fn)}(${frac(top, bot)}) = ${cut(value)}°`, `≈ ${dmsStr(value, 'second')}`],
      meta: { t: 'nearestSecond', fn, top: lens[PARTS[fn][0]], bot: lens[PARTS[fn][1]] },
    })
  }
}

const exPP = (level: Level): Question => {
  if (level === 1) return complement()
  if (level === 2) return chance() ? exactValue() : identity()
  return chance() ? planeClimb() : nearestSecond()
}

// ================================================================= skills, test

const T = (skill: string, level: Level, gen: () => Question): TestItem => ({ skill, level, gen: () => gen() })

export const NCM4_TEST: TestItem[] = [
  // about two questions per exercise (16 in all), in the order of Test Yourself 4
  T('y9-trg-sides', 1, sideLength),
  T('y9-trg-sides', 2, sideNameMC),
  T('y9-trg-ratios', 1, () => ratioFrac(1)),
  T('y9-trg-ratios', 3, fromRatio),
  T('y9-trg-similar', 1, measuredRatio),
  T('y9-trg-similar', 3, constancy),
  T('y9-trg-calc', 2, () => (chance() ? roundDeg() : roundMin())),
  T('y9-trg-calc', 2, () => (chance() ? evalTrig('whole', 4) : evalTrig('dm', 4))),
  T('y9-trg-calc', 3, toDMS),
  T('y9-trg-side', 2, () => sideDiagram(false, 'mixed')),
  T('y9-trg-side', 3, () => contextQ(false)),
  T('y9-trg-hyp', 1, () => sideDiagram(true, 'whole', 1)),
  T('y9-trg-hyp', 2, () => sideDiagram(true, 'dm', 1)),
  T('y9-trg-angle', 1, () => angleFromRatio('degree')),
  T('y9-trg-angle', 2, () => angleFromTri('degree')),
  T('y9-trg-angle', 2, () => angleDescribed('minute')),
]

export const NCM4_SKILLS: Skill[] = [
  {
    id: 'y9-trg-sides',
    title: 'The sides of a right-angled triangle',
    ref: ref('4.01'),
    outcomes: TRG,
    summary: 'Name the hypotenuse, and the opposite and adjacent sides for a marked angle.',
    learn: {
      intro: `<p>The three sides of a right-angled triangle have names that depend on the angle you are looking at, often called ${TH} (theta).</p><ul><li>The <b>hypotenuse</b> is the longest side, opposite the right angle. It doesn’t depend on ${TH}.</li><li>The <b>opposite side</b> faces ${TH}: it doesn’t touch it.</li><li>The <b>adjacent side</b> runs from ${TH} to the right angle (<i>adjacent</i> means “next to”).</li></ul>`,
      keyPoints: ['Find the right angle first: the hypotenuse is the side that doesn’t touch it.', 'Mark the other acute angle and the opposite and adjacent sides swap over.', 'Greek letters such as θ (theta), α (alpha), β (beta) and φ (phi) are often used for angles.'],
      vocab: [['hypotenuse', 'the longest side of a right-angled triangle, opposite the right angle'], ['opposite side', 'the side facing a given angle'], ['adjacent side', 'the side next to a given angle that runs to the right angle']],
    },
    gen: ex401,
    levels: { 1: 'Name the sides when they are numbered', 2: 'Name sides and angles with vertex letters', 3: 'Two marked angles, which statement is false, sketch from a description' },
  },
  {
    id: 'y9-trg-ratios',
    title: 'The trigonometric ratios',
    ref: ref('4.02'),
    outcomes: TRG,
    summary: 'Write sin, cos and tan of an angle as fractions of the sides.',
    learn: {
      intro: `<p>The three <b>trigonometric ratios</b> compare two sides of a right-angled triangle:</p><div class="big">sin ${TH} = ${frac('opposite', 'hypotenuse')} &emsp; cos ${TH} = ${frac('adjacent', 'hypotenuse')} &emsp; tan ${TH} = ${frac('opposite', 'adjacent')}</div><p>Remember them as <b>SOH CAH TOA</b>.</p>`,
      keyPoints: ['Label the sides for the angle first, then write the ratio.', 'The sine of one acute angle is the cosine of the other: sin A = cos B.', 'If you know one ratio, draw the triangle and use Pythagoras’ theorem to find the third side.'],
      vocab: [['sine (sin)', 'opposite ÷ hypotenuse'], ['cosine (cos)', 'adjacent ÷ hypotenuse'], ['tangent (tan)', 'opposite ÷ adjacent']],
    },
    gen: ex402,
    levels: { 1: 'sin, cos or tan as a fraction', 2: 'Ratios with pronumeral sides; which statement is true', 3: 'From one ratio to another (with Pythagoras’ theorem)' },
  },
  {
    id: 'y9-trg-similar',
    title: 'Similar right-angled triangles',
    ref: ref('4.03'),
    outcomes: TRG,
    summary: 'See that each ratio is the same in every right-angled triangle with the same angle.',
    learn: {
      intro: '<p>Right-angled triangles with the same acute angle are <b>similar</b>: they have the same shape but different sizes. Because the sides are enlarged by the same amount, the ratio of any two sides stays the same.</p><p>So sin 35° is the same number (about 0.57) in every right-angled triangle with a 35° angle. Measuring the sides of a triangle gives a value close to the calculator’s.</p>',
      keyPoints: ['Ratios from measured sides are close to, but not exactly, the calculator’s values, because measurements are rounded.', 'A ratio from one triangle works in any similar triangle.', 'In the textbook you draw and measure the triangles; here the measurements are given.'],
      vocab: [['similar triangles', 'triangles with the same angles: enlargements or reductions of each other']],
    },
    gen: ex403,
    levels: { 1: 'A ratio from measured sides', 2: 'Tables of similar triangles: missing value, pattern, a measuring mistake', 3: 'Use a ratio from one triangle in a similar one; why the ratios are constant' },
  },
  {
    id: 'y9-trg-calc',
    title: 'Trigonometry on a calculator',
    ref: ref('4.04'),
    outcomes: TRG,
    summary: 'Evaluate sin, cos and tan, and work with degrees, minutes and seconds.',
    learn: {
      intro: '<p>A scientific calculator stores the value of every ratio. Make sure it is in <b>degrees</b> mode.</p><p>One degree is split into 60 <b>minutes</b> (60′) and one minute into 60 <b>seconds</b> (60″). Enter 38°25′ with the ° ′ ″ key: 38 ° ′ ″ 25 ° ′ ″.</p>',
      keyPoints: ['4 cos 20° means 4 × cos 20°.', 'Rounding angles: 30′ (or 30″) is halfway, and rounds up.', 'To change 60.81° to degrees and minutes, type 60.81 = then press ° ′ ″, or multiply 0.81 by 60.', '57.4° is a decimal (57 and four-tenths degrees), not 57°4′.'],
      vocab: [['minute (′)', 'one-sixtieth of a degree'], ['second (″)', 'one-sixtieth of a minute']],
    },
    gen: ex404,
    levels: { 1: 'Evaluate sin, cos and tan expressions', 2: 'Round angles; expressions with degrees and minutes', 3: 'Decimal degrees to degrees and minutes; guess and check an angle' },
  },
  {
    id: 'y9-trg-side',
    title: 'Finding an unknown side',
    ref: ref('4.05'),
    outcomes: TRG,
    summary: 'Use sin, cos or tan to find a side that is on top of the ratio.',
    learn: {
      intro: `<p>Label the two sides you are working with (the one you know and the one you want) for the marked angle, then choose the ratio that uses them. For a hypotenuse of 15.2 m and the adjacent side ${v('d')} next to 58°:</p><div class="big">cos 58° = ${frac(v('d'), '15.2')} &emsp; so &emsp; ${v('d')} = 15.2 cos 58° ≈ 8.05 m</div>`,
      keyPoints: ['Identify the two marked sides, then decide: SOH, CAH or TOA?', 'Multiply both sides by the number underneath to get the unknown on its own.', 'Check the answer looks reasonable: a shorter side must be shorter than the hypotenuse.'],
    },
    gen: ex405,
    levels: { 1: 'Which ratio; which expression; whole-degree angles', 2: 'Angles in degrees and minutes; triangles described in words', 3: 'Ladders, ramps, shadows, kites and other problems' },
  },
  {
    id: 'y9-trg-hyp',
    title: 'Finding more unknown sides',
    ref: ref('4.06'),
    outcomes: TRG,
    summary: 'Find a side that ends up underneath the ratio, such as the hypotenuse.',
    learn: {
      intro: `<p>Sometimes the unknown is on the bottom of the fraction. Then it swaps places with the ratio:</p><div class="big">sin 32° = ${frac(7, v('x'))} &emsp; so &emsp; ${v('x')} = ${frac(7, 'sin 32°')} ≈ 13.2</div>`,
      keyPoints: ['Unknown on the bottom: divide the known side by the ratio.', 'The hypotenuse must come out longer than the other sides: if it doesn’t, check you divided.', 'For tan, you can also use the other acute angle (90° − θ) so the unknown is on top.'],
    },
    gen: ex406,
    levels: { 1: 'Find the hypotenuse; which expression', 2: 'Unknown underneath with any ratio; degrees and minutes; described triangles', 3: 'Ladders, ramps, gliders and a two-step problem' },
  },
  {
    id: 'y9-trg-angle',
    title: 'Finding an unknown angle',
    ref: ref('4.07'),
    outcomes: TRG,
    summary: 'Use sin⁻¹, cos⁻¹ or tan⁻¹ to find an angle, to the nearest degree or minute.',
    learn: {
      intro: `<p>If you know two sides, write the ratio as a fraction, then use the <b>inverse</b> function on the calculator (2nd or SHIFT, then sin, cos or tan):</p><div class="big">sin ${TH} = ${frac(9, 13)} &emsp; so &emsp; ${TH} = sin<sup>−1</sup>(${frac(9, 13)}) ≈ 43.81° ≈ 44°</div>`,
      keyPoints: ['Choose the ratio from the two known sides, just as for finding a side.', 'For degrees and minutes, press ° ′ ″ after the answer, then round to the nearest minute.', 'Check the angle looks right in the diagram.'],
      vocab: [['inverse (sin⁻¹)', 'works backwards: from the ratio to the angle']],
    },
    gen: ex407,
    levels: { 1: 'From a ratio or a triangle, to the nearest degree', 2: 'To the nearest minute; triangles described in words', 3: 'Roads, ladders, ramps, landing planes and other problems' },
  },
  {
    id: 'y9-trg-powerplus',
    title: 'Power plus: trigonometry',
    ref: 'NCM 9 Power plus 4',
    tag: 'extension',
    outcomes: TRG,
    summary: 'sin x = cos (90° − x), exact values, (sin θ)² + (cos θ)² = 1 and harder problems.',
    learn: {
      intro: `<p>The two acute angles of a right-angled triangle add to 90°, and the side opposite one is adjacent to the other. So <b>sin ${v('x')} = cos (90° − ${v('x')})</b>.</p><p>Half an equilateral triangle with sides 2 has sides 1, √3 and 2, which gives exact values such as cos 30° = ${frac(sqrt(3), 2)}.</p>`,
      keyPoints: ['sin 70° = cos 20°, cos 35° = sin 55°.', `(sin ${TH})<sup>2</sup> + (cos ${TH})<sup>2</sup> = 1 for every angle: it is Pythagoras’ theorem divided by the hypotenuse squared.`, 'Keep full calculator values between steps; round only at the end.'],
    },
    gen: exPP,
    levels: { 1: 'sin x = cos (90° − x)', 2: 'Exact values; finding cos θ from sin θ', 3: 'Climbing planes; angles to the nearest second' },
  },
]
