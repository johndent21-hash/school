// Class games for New Century Maths 9 Advanced (Cengage) Chapter 4, Trigonometry: one set of quick questions for
// each exercise, 4.01 to 4.10.
//
// The game is played without calculators, so the kinds practise what a class can do on the board: naming sides,
// writing ratios from exact (Pythagorean-triad) sides, using similar triangles, degrees and minutes, choosing the
// equation that finds a side or an angle, angles of elevation and depression, and bearings. Working out the
// equations with a calculator is left for the exercise. Answers are checked by tests/game-checks/ncm9-ch4.ts.
//
// Syllabus: NSW Mathematics K–10 (2022), Stage 5 core. Trigonometry A, MA5-TRG-C-01 (4.01–4.07) and Trigonometry B,
// MA5-TRG-C-02 (angles of elevation and depression and bearings, 4.08–4.10).
import type { GameChapter, GameQuestion, GameSet } from '@/lib/game/types'
import { fig, rtPts } from '@/lib/maths/diagrams6'
import { type Miss, chance, frac, gq, int, miss, mk, mkCalc, num, pick, shuffle } from './helpers'

const TRG = 'MA5-TRG-C-01'
const TRG2 = 'MA5-TRG-C-02'
const CALC =
  'Played without calculators unless you allow them at set-up: then calculator questions (answers rounded) are mixed in with choosing the ratio or setting up the equation.'
const b = (s: string) => `<b>${s}</b>`
const it = (s: string) => `<i>${s}</i>`
const gcd = (a: number, c: number): number => (c === 0 ? a : gcd(c, a % c))
const F = (n: number, d: number) => frac(n / gcd(n, d), d / gcd(n, d))
const rad = (d: number) => (d * Math.PI) / 180
const deg = (r: number) => (r * 180) / Math.PI

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

// ================================================================== the triangle

const NAMESETS: [string, string, string][] = [
  ['A', 'B', 'C'], ['P', 'Q', 'R'], ['K', 'L', 'M'], ['D', 'E', 'F'], ['X', 'Y', 'Z'], ['G', 'H', 'J'], ['M', 'N', 'P'], ['R', 'S', 'T'],
]
/** [right-angle corner, marked-angle corner, third corner] */
const names3 = () => shuffle(pick(NAMESETS)) as [string, string, string]
const sideName = (a: string, c: string) => [a, c].sort().join('')
const ROTS = [0, 0, 90, 180, 270, 20, 35, 110, 155, 200, 245, 290, 325]
/** Pythagorean triads [adjacent, opposite, hypotenuse]; all angles between 16° and 74° */
const BASE: [number, number, number][] = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]]
function triad(): [number, number, number] {
  const t = pick(BASE)
  const k = pick([1, 1, 2, 3])
  const s = t.map((x) => x * k) as [number, number, number]
  return chance() ? s : [s[1], s[0], s[2]]
}

interface Tri {
  th: number // the marked angle's true size, in degrees
  mark: string // its label
  opp?: string
  adj?: string
  hyp?: string
  names?: [string, string, string]
}
/** a right-angled triangle drawn at its true angles, turned and flipped at random */
function tri(t: Tri): string {
  const [r, a, o] = rtPts(Math.cos(rad(t.th)), Math.sin(rad(t.th)), pick(ROTS), chance())
  const [kR, kA, kO] = t.names ?? ['R0', 'A0', 'O0']
  const sides: { a: string; b: string; text: string }[] = []
  if (t.opp) sides.push({ a: kR, b: kO, text: t.opp })
  if (t.adj) sides.push({ a: kR, b: kA, text: t.adj })
  if (t.hyp) sides.push({ a: kA, b: kO, text: t.hyp })
  return fig({
    pts: { [kR]: r, [kA]: a, [kO]: o },
    polys: [{ v: [kR, kA, kO] }],
    rights: [[kA, kR, kO]],
    sides,
    angles: [{ at: kA, a: kR, b: kO, text: t.mark }],
    names: t.names ? [kR, kA, kO] : [],
    label: 'Right-angled triangle',
  })
}

// ================================================================== 4.01 The sides of a right-angled triangle

function m401side(): GameQuestion {
  const [adj, opp, hyp] = triad()
  const th = deg(Math.atan2(opp, adj))
  const role = pick(['opposite', 'adjacent', 'hypotenuse'] as const)
  const len = { opposite: opp, adjacent: adj, hypotenuse: hyp }
  // the three sides, and a length that is not a side (opposite + adjacent − hypotenuse, or opposite + adjacent),
  // smallest to largest, so the right answer can be in any position
  const all = [adj, opp, hyp, pick([adj + opp - hyp, adj + opp])].sort((x, y) => x - y)
  return gq({
    t: 'side',
    prompt: role === 'hypotenuse' ? `How long is the ${b('hypotenuse')}?` : `How long is the side ${b(role)} to the angle θ?`,
    diagram: tri({ th, mark: 'θ', opp: num(opp), adj: num(adj), hyp: num(hyp) }),
    correct: num(len[role]),
    inOrder: all.map((x) => num(x)),
    why: { opposite: 'The opposite side faces the angle θ', adjacent: 'The adjacent side runs from θ to the right angle', hypotenuse: 'The hypotenuse is opposite the right angle' }[role] + `: ${num(len[role])}.`,
    meta: {},
  })
}

const SET_401 = set('4.01', 'The sides of a right-angled triangle', 'Name the hypotenuse, and the sides opposite and adjacent to a marked angle.', [TRG], [mk('side', m401side)])

// ================================================================== 4.02 The trigonometric ratios

function m402ratio(): GameQuestion {
  const [adj, opp, hyp] = triad()
  const th = deg(Math.atan2(opp, adj))
  const which = pick(['sin', 'cos', 'tan'] as const)
  const right = which === 'sin' ? F(opp, hyp) : which === 'cos' ? F(adj, hyp) : F(opp, adj)
  return gq({
    t: 'ratio',
    prompt: `Find ${b(`${which} θ`)} for this triangle.`,
    diagram: tri({ th, mark: 'θ', opp: num(opp), adj: num(adj), hyp: num(hyp) }),
    correct: right,
    // the other ratios, and the ratio upside down
    wrong: [miss(F(opp, hyp), 'used opposite ÷ hypotenuse (sin)'), miss(F(adj, hyp), 'used adjacent ÷ hypotenuse (cos)'), miss(F(opp, adj), 'used opposite ÷ adjacent (tan)'), miss(which === 'sin' ? F(hyp, opp) : which === 'cos' ? F(hyp, adj) : F(adj, opp), 'ratio upside down')],
    why: `${which} θ = ${which === 'sin' ? 'opposite ÷ hypotenuse' : which === 'cos' ? 'adjacent ÷ hypotenuse' : 'opposite ÷ adjacent'} = ${which === 'sin' ? `${opp}/${hyp}` : which === 'cos' ? `${adj}/${hyp}` : `${opp}/${adj}`}${gcd(which === 'cos' ? adj : opp, which === 'tan' ? adj : hyp) > 1 ? ' (simplified)' : ''}.`,
    meta: {},
  })
}

const SET_402 = set('4.02', 'The trigonometric ratios', 'sin θ = opposite ÷ hypotenuse, cos θ = adjacent ÷ hypotenuse, tan θ = opposite ÷ adjacent.', [TRG], [mk('ratio', m402ratio)])

// ================================================================== 4.03 Similar right-angled triangles

function m403similar(): GameQuestion {
  const [adj, opp, hyp] = pick(BASE)
  const k = int(2, 6)
  const [given, ask] = pick([
    ['hypotenuse', 'opposite'],
    ['hypotenuse', 'adjacent'],
    ['adjacent', 'opposite'],
    ['opposite', 'hypotenuse'],
  ] as [string, string][])
  const len: Record<string, number> = { opposite: opp, adjacent: adj, hypotenuse: hyp }
  const ans = len[ask] * k
  return gq({
    t: 'similar',
    prompt: `For angle θ, a right-angled triangle has opposite ${opp}, adjacent ${adj}, hypotenuse ${hyp}. In a similar triangle the ${given} is ${b(num(len[given] * k))}. Find its ${ask}.`,
    correct: num(ans),
    // added the difference, used the wrong ratio, the scale factor alone
    wrong: [len[ask] + (len[given] * k - len[given]), len[given] * k, k * (ask === 'opposite' ? adj : opp), ans + k, k].filter((x, i, a) => x !== ans && x > 0 && a.indexOf(x) === i).map((x) => num(x)),
    why: `The ratios stay the same in similar triangles: the scale factor is ${num(len[given] * k)} ÷ ${len[given]} = ${k}, so the ${ask} is ${len[ask]} × ${k} = ${num(ans)}.`,
    meta: {},
  })
}

const SET_403 = set('4.03', 'Similar right-angled triangles', 'Similar right-angled triangles with the same angle have the same trigonometric ratios.', [TRG], [mk('similar', m403similar)])

// ================================================================== 4.04 Trigonometry on a calculator: degrees and minutes

function m404dm(): GameQuestion {
  const d = int(10, 80)
  const m = pick([6, 12, 15, 18, 24, 30, 36, 42, 45, 48, 54])
  const dec = m / 60
  const toDM = chance()
  const dm = `${d}°${m}′`
  const dd = `${num(d + dec)}°`
  return gq({
    t: 'dm',
    prompt: toDM ? `Write ${b(dd)} in degrees and minutes.` : `Write ${b(dm)} in degrees, as a decimal.`,
    correct: toDM ? dm : dd,
    // the decimal digits read as minutes, divided by 100 instead of 60, one degree out
    wrong: toDM
      ? [miss(`${d}°${Math.round(dec * 100)}′`, 'read the decimal digits as minutes'), miss(`${d}°${Math.round(dec * 10)}′`, 'read the first decimal digit as minutes'), `${d}°${Math.round(dec * 100 * 0.6 + 1)}′`, `${d + 1}°${m}′`]
      : [miss(`${num(d + m / 100)}°`, 'wrote the minutes as decimal digits'), miss(`${num(d + m / 10)}°`, 'divided the minutes by 10, not 60'), `${num(d + 1 + dec)}°`, `${num(d + dec / 2)}°`],
    why: `There are 60 minutes in a degree: ${m}′ = ${m} ÷ 60 = ${num(dec)}°, so ${dm} = ${dd}.`,
    meta: {},
  })
}

function m404round(): GameQuestion {
  const d = int(10, 80)
  const m = intNot30()
  const up = m > 30
  return gq({
    t: 'round',
    prompt: `Round ${b(`${d}°${m}′`)} to the nearest degree.`,
    correct: `${up ? d + 1 : d}°`,
    // rounded the other way, kept the minutes as a decimal, rounded at 50′
    wrong: [miss(`${up ? d : d + 1}°`, 'rounded the wrong way'), miss(`${d}.${String(m).padStart(2, '0')}°`, 'wrote the minutes as decimal digits'), `${up ? d + 2 : d - 1}°`, miss(`${d + m}°`, 'added the minutes to the degrees')],
    why: `${m}′ is ${up ? 'more' : 'less'} than 30′ (half a degree), so round ${up ? 'up' : 'down'}: ${up ? d + 1 : d}°.`,
    meta: {},
  })
}
function intNot30(): number {
  const m = int(1, 59)
  return m === 30 ? 31 : m
}

// ================================================================== calculator questions (only when calculators are allowed)

/** a value to a fixed number of decimal places, with a true minus sign */
const fx = (x: number, dp: number) => (x < 0 ? '−' : '') + Math.abs(x).toFixed(dp)
const FN: Record<'sin' | 'cos' | 'tan', (r: number) => number> = { sin: Math.sin, cos: Math.cos, tan: Math.tan }

function m404calcRatio(): GameQuestion {
  for (;;) {
    const f = pick(['sin', 'cos', 'tan'] as const)
    const a = int(10, 80)
    if (a === 45) continue
    const v = FN[f](rad(a))
    const other = f === 'cos' ? 'sin' : 'cos'
    return gq({
      t: 'calcRatio',
      prompt: `Use a calculator to find ${b(`${f} ${a}°`)}, correct to 4 decimal places.`,
      correct: fx(v, 4),
      // the calculator in radians, the other ratio, cut off instead of rounded, the next angle
      wrong: [miss(fx(FN[f](a), 4), 'calculator in radians'), miss(fx(FN[other](rad(a)), 4), `pressed ${other} instead of ${f}`), miss(fx(Math.trunc(v * 1e4) / 1e4, 4), 'cut off instead of rounding'), fx(FN[f](rad(a + 1)), 4), miss(fx(1 / v, 4), 'found 1 ÷ the ratio')],
      why: `With the calculator in degrees, ${f} ${a}° = ${v.toFixed(6)}…, which is ${fx(v, 4)} to 4 decimal places.`,
      meta: {},
    })
  }
}

/** Find a side, rounded: x = k × ratio (numerator) or x = k ÷ ratio (denominator). */
function calcSide(t: string, denominator: boolean): GameQuestion {
  for (;;) {
    const a = int(20, 70)
    if (a === 45) continue
    const k = int(5, 40)
    const pairs: [Role, Role][] = denominator ? [['hyp', 'opp'], ['hyp', 'adj'], ['adj', 'opp']] : [['opp', 'hyp'], ['adj', 'hyp'], ['opp', 'adj']]
    const [x, known] = pick(pairs)
    const eq = sideEq(x, known, k, a)
    const f = eq.match(/(sin|cos|tan)/)![1] as 'sin' | 'cos' | 'tan'
    const r = FN[f](rad(a))
    const val = denominator ? k / r : k * r
    // too close to a rounding boundary to be fair
    if (Math.abs(((val * 10) % 1) - 0.5) < 0.04) continue
    const others = (['sin', 'cos', 'tan'] as const).filter((g) => g !== f)
    const labels: Partial<Record<Role, string>> = { [x]: 'x', [known]: num(k) }
    return gq({
      t,
      prompt: `Find ${it('x')}, correct to 1 decimal place.`,
      diagram: tri({ th: a, mark: `${a}°`, opp: labels.opp, adj: labels.adj, hyp: labels.hyp }),
      correct: fx(val, 1),
      // multiplied instead of divided (or the reverse), the other ratios, the calculator in radians
      wrong: [
        miss(fx(denominator ? k * r : k / r, 1), denominator ? 'multiplied instead of divided' : 'divided instead of multiplied'),
        miss(fx(denominator ? k / FN[others[0]](rad(a)) : k * FN[others[0]](rad(a)), 1), `used ${others[0]} instead of ${f}`),
        miss(fx(denominator ? k / FN[others[1]](rad(a)) : k * FN[others[1]](rad(a)), 1), `used ${others[1]} instead of ${f}`),
        miss(fx(denominator ? k / FN[f](a) : k * FN[f](a), 1), 'calculator in radians'),
        fx(val + 1, 1),
      ],
      why: `${showEq(eq)} = ${val.toFixed(3)}…, so ${it('x')} = ${fx(val, 1)} to 1 decimal place.`,
      meta: {},
    })
  }
}

function m407calcAngle(): GameQuestion {
  for (;;) {
    const f = pick(['sin', 'cos', 'tan'] as const)
    let top: number
    let bottom: number
    if (f === 'tan') {
      top = int(3, 40)
      bottom = int(3, 40)
      if (top === bottom) continue
    } else {
      bottom = int(8, 40)
      top = int(3, bottom - 2)
    }
    const r = top / bottom
    const th = deg(f === 'sin' ? Math.asin(r) : f === 'cos' ? Math.acos(r) : Math.atan(r))
    if (th < 16 || th > 74 || Math.abs((th % 1) - 0.5) < 0.05) continue
    const labels = f === 'sin' ? { opp: num(top), hyp: num(bottom) } : f === 'cos' ? { adj: num(top), hyp: num(bottom) } : { opp: num(top), adj: num(bottom) }
    const right = Math.round(th)
    const other = (g: 'sin' | 'cos' | 'tan') => Math.round(deg(g === 'sin' ? Math.asin(r) : g === 'cos' ? Math.acos(r) : Math.atan(r)))
    return gq({
      t: 'calcAngle',
      prompt: 'Find θ, correct to the nearest degree.',
      diagram: tri({ th, mark: 'θ', ...labels }),
      correct: `${right}°`,
      // the other angle of the triangle, the wrong inverse ratio, one degree out
      // (sin⁻¹ and cos⁻¹ only of a ratio below 1)
      wrong: [
        miss(`${Math.round(90 - th)}°`, f === 'tan' ? 'gave the other acute angle' : `used ${f === 'sin' ? 'cos' : 'sin'}⁻¹ (gives the other acute angle)`),
        ...(['sin', 'cos', 'tan'] as const).filter((g) => g !== f && (g === 'tan' || r < 1)).map((g) => miss(`${other(g)}°`, `used ${g}⁻¹ instead of ${f}⁻¹`)),
        miss(`${right + 1}°`, 'rounding slip'),
        miss(`${right - 1}°`, 'rounding slip'),
      ],
      why: `${f} θ = ${top}/${bottom}, so θ = ${f}⁻¹(${top}/${bottom}) = ${th.toFixed(2)}°…, which is ${right}° to the nearest degree.`,
      meta: {},
    })
  }
}

const SET_404 = set('4.04', 'Trigonometry on a calculator', 'Work with angles in degrees and minutes: 1° = 60′; round to the nearest degree.', [TRG], [mk('dm', m404dm), mk('round', m404round), mkCalc('calcRatio', m404calcRatio, 1)], CALC)

// ================================================================== 4.05–4.07 Finding sides and angles: choose the equation

type Role = 'opp' | 'adj' | 'hyp'
const RATIO: Record<string, [Role, Role]> = { sin: ['opp', 'hyp'], cos: ['adj', 'hyp'], tan: ['opp', 'adj'] }
/** the equation for x, given the side x and a known side k at angle a */
function sideEq(x: Role, known: Role, k: number, a: number): string {
  for (const [f, [top, bottom]] of Object.entries(RATIO)) {
    if (top === x && bottom === known) return `x = ${k} ${f} ${a}°`
    if (bottom === x && top === known) return `x = ${k} ÷ ${f} ${a}°`
  }
  throw new Error('no ratio')
}
const showEq = (s: string) => s.replace(/^x/, it('x'))

function sideQuestion(t: string, denominator: boolean): GameQuestion {
  const a = int(20, 70)
  const k = int(5, 40)
  // numerator: x is the top of the ratio and the known side the bottom; denominator: the other way round
  const pairs: [Role, Role][] = denominator
    ? [['hyp', 'opp'], ['hyp', 'adj'], ['adj', 'opp']]
    : [['opp', 'hyp'], ['adj', 'hyp'], ['opp', 'adj']]
  const [x, known] = pick(pairs)
  const right = sideEq(x, known, k, a)
  const labels: Partial<Record<Role, string>> = { [x]: 'x', [known]: num(k) }
  // the most likely slips first: the same ratio the other way up, then the other ratios
  const fRight = right.match(/(sin|cos|tan)/)![1]
  const wrongs: Miss[] = []
  for (const f of ['sin', 'cos', 'tan'])
    for (const form of [`x = ${k} ${f} ${a}°`, `x = ${k} ÷ ${f} ${a}°`])
      if (form !== right) wrongs.push(miss(form, f === fRight ? (denominator ? 'multiplied instead of divided' : 'divided instead of multiplied') : `used ${f} instead of ${fRight}`))
  wrongs.sort((p, q) => Number(!p.v.includes(fRight)) - Number(!q.v.includes(fRight)))
  return gq({
    t,
    prompt: `Which equation gives the value of ${it('x')}?`,
    diagram: tri({ th: a, mark: `${a}°`, opp: labels.opp, adj: labels.adj, hyp: labels.hyp }),
    correct: showEq(right),
    wrong: wrongs.slice(0, 5).map((w) => miss(showEq(w.v), w.m)),
    why: `${x === 'hyp' ? 'x is the hypotenuse' : x === 'opp' ? 'x is opposite the angle' : 'x is adjacent to the angle'} and ${num(k)} is the ${known === 'hyp' ? 'hypotenuse' : known === 'opp' ? 'opposite side' : 'adjacent side'}, so use ${fRight}: ${showEq(right)}.`,
    meta: {},
  })
}

const SET_405 = set('4.05', 'Finding an unknown side', 'Choose sin, cos or tan from the sides you know and want, then x = known × ratio.', [TRG], [mk('numer', () => sideQuestion('numer', false)), mkCalc('calcSide', () => calcSide('calcSide', false))], CALC)
const SET_406 = set('4.06', 'Finding more unknown sides', 'When x is on the bottom of the ratio, x = known ÷ ratio.', [TRG], [mk('denom', () => sideQuestion('denom', true)), mk('numer', () => sideQuestion('numer', false)), mkCalc('calcDiv', () => calcSide('calcDiv', true)), mkCalc('calcSide', () => calcSide('calcSide', false))], CALC)

function m407angle(): GameQuestion {
  const [adj, opp, hyp] = triad()
  const th = deg(Math.atan2(opp, adj))
  const f = pick(['sin', 'cos', 'tan'] as const)
  const [top, bottom] = f === 'sin' ? [opp, hyp] : f === 'cos' ? [adj, hyp] : [opp, adj]
  const labels = { opp: f === 'cos' ? undefined : num(opp), adj: f === 'sin' ? undefined : num(adj), hyp: f === 'tan' ? undefined : num(hyp) }
  const inv = (g: string, p: number, q: number) => `θ = ${g}⁻¹(${p}/${q})`
  const right = inv(f, top, bottom)
  const others = (['sin', 'cos', 'tan'] as const).filter((g) => g !== f)
  return gq({
    t: 'angle',
    prompt: 'Which equation gives the size of angle θ?',
    diagram: tri({ th, mark: 'θ', ...labels }),
    correct: right,
    // the ratio upside down, the wrong function
    wrong: [miss(inv(f, bottom, top), 'ratio upside down'), miss(inv(others[0], top, bottom), `used ${others[0]}⁻¹ instead of ${f}⁻¹`), miss(inv(others[1], top, bottom), `used ${others[1]}⁻¹ instead of ${f}⁻¹`), miss(`θ = ${f} (${top}/${bottom})`, 'used the ratio, not its inverse')],
    why: `The sides given are the ${f === 'sin' ? 'opposite and hypotenuse' : f === 'cos' ? 'adjacent and hypotenuse' : 'opposite and adjacent'}, so ${f} θ = ${top}/${bottom} and ${right}.`,
    meta: {},
  })
}

const SET_407 = set('4.07', 'Finding an unknown angle', 'Use the inverse ratio: θ = sin⁻¹(opposite ÷ hypotenuse), and so on.', [TRG], [mk('angle', m407angle, 2), mkCalc('calcAngle', m407calcAngle)], CALC)

// ================================================================== 4.08 Angles of elevation and depression

function m408depression(): GameQuestion {
  const a = int(12, 70)
  const [from, to] = pick([
    ['the top of a cliff', 'a boat'],
    ['a lighthouse', 'a yacht'],
    ['a balcony', 'a car'],
  ])
  const askDep = chance()
  return gq({
    t: 'depression',
    prompt: askDep
      ? `The angle of elevation of ${from} from ${to} is ${b(`${a}°`)}. What is the angle of depression of ${to} from ${from}?`
      : `The angle of depression of ${to} from ${from} is ${b(`${a}°`)}. What is the angle of elevation of ${from} from ${to}?`,
    correct: `${a}°`,
    // the complement, the supplement, double
    wrong: [`${90 - a}°`, `${180 - a}°`, `${2 * a}°`, `${a + 10}°`].filter((x) => x !== `${a}°`),
    why: 'The horizontal lines at the top and bottom are parallel, so the angles of elevation and depression are alternate angles: equal.',
    meta: {},
  })
}

function m408height(): GameQuestion {
  const a = int(15, 70)
  const d = 10 * int(2, 50)
  const askDist = chance(0.35)
  const right = askDist ? `d = h ÷ tan ${a}°` : `h = ${d} tan ${a}°`
  const h = 10 * int(2, 30)
  return gq({
    t: 'height',
    prompt: askDist
      ? `A tower is ${b(`${h} m`)} tall. From a point on level ground, the angle of elevation of the top is ${b(`${a}°`)}. Which equation gives the distance ${it('d')} to the base?`
      : `Emily stands ${b(`${d} m`)} from the base of a building. The angle of elevation of the top is ${b(`${a}°`)}. Which equation gives the height ${it('h')}?`,
    correct: askDist ? `d = ${h} ÷ tan ${a}°` : right,
    wrong: askDist
      ? [`d = ${h} tan ${a}°`, `d = ${h} ÷ sin ${a}°`, `d = ${h} cos ${a}°`, `d = ${h} sin ${a}°`]
      : [`h = ${d} ÷ tan ${a}°`, `h = ${d} sin ${a}°`, `h = ${d} cos ${a}°`, `h = ${d} ÷ sin ${a}°`],
    why: askDist
      ? `tan ${a}° = height ÷ distance = ${h} ÷ d, so d = ${h} ÷ tan ${a}°.`
      : `tan ${a}° = height ÷ distance = h ÷ ${d}, so h = ${d} tan ${a}°.`,
    meta: {},
  })
}

const SET_408 = set('4.08', 'Angles of elevation and depression', 'Angles of elevation and depression are alternate angles; use tan with the height and the distance.', [TRG2], [mk('depression', m408depression), mk('height', m408height, 2)], CALC)

// ================================================================== 4.09 Bearings

const pad3 = (x: number) => String(x).padStart(3, '0')
/** a compass bearing (N40°E) and its true bearing */
function compassBearing(): { c: string; t: number } {
  const a = int(5, 85)
  const [ns, ew] = [pick(['N', 'S']), pick(['E', 'W'])]
  const t = ns === 'N' ? (ew === 'E' ? a : 360 - a) : ew === 'E' ? 180 - a : 180 + a
  return { c: `${ns}${a}°${ew}`, t }
}

function m409toTrue(): GameQuestion {
  const { c, t } = compassBearing()
  const a = Number(c.match(/\d+/)![0])
  return gq({
    t: 'toTrue',
    prompt: `Write the compass bearing ${b(c)} as a true bearing.`,
    correct: `${pad3(t)}°T`,
    // the angle alone, measured from the wrong end, mirrored east and west
    wrong: [a, (t + 180) % 360, (360 - t) % 360, 180 - a, 90 + a, 270 - a, 180 + a, (t + 90) % 360].map((x) => `${pad3(x)}°T`),
    why: `True bearings are measured clockwise from north: ${c} is ${pad3(t)}°T.`,
    meta: {},
  })
}

function m409back(): GameQuestion {
  const t = int(5, 355)
  const back = (t + 180) % 360
  return gq({
    t: 'back',
    prompt: `The bearing of B from A is ${b(`${pad3(t)}°T`)}. What is the bearing of A from B?`,
    correct: `${pad3(back)}°T`,
    // the same bearing, 360° − the bearing, 90° added
    wrong: [t, (360 - t) % 360, (t + 90) % 360, (t + 270) % 360].map((x) => `${pad3(x)}°T`),
    why: `Going back is the opposite direction: add or subtract 180°: ${pad3(t)}° ${t < 180 ? '+' : '−'} 180° = ${pad3(back)}°T.`,
    meta: {},
  })
}

const SET_409 = set('4.09', 'Bearings', 'True bearings (clockwise from north, 3 digits) and compass bearings (N40°E); the reverse bearing differs by 180°.', [TRG2], [mk('toTrue', m409toTrue), mk('back', m409back)])

// ================================================================== 4.10 Problems involving bearings

function m410component(): GameQuestion {
  const t = int(15, 75)
  const d = 10 * int(3, 30)
  const askEast = chance()
  return gq({
    t: 'component',
    prompt: `A yacht sails ${b(`${d} km`)} on a bearing of ${b(`${pad3(t)}°T`)}. Which expression gives how far ${askEast ? 'east' : 'north'} it is of its start?`,
    correct: `${d} ${askEast ? 'sin' : 'cos'} ${t}°`,
    wrong: [`${d} ${askEast ? 'cos' : 'sin'} ${t}°`, `${d} tan ${t}°`, `${d} ÷ ${askEast ? 'sin' : 'cos'} ${t}°`, `${d} ÷ tan ${t}°`],
    why: `The bearing is measured from north. The ${askEast ? 'east distance is opposite' : 'north distance is adjacent to'} the ${t}° angle, with ${d} km as the hypotenuse: ${d} ${askEast ? 'sin' : 'cos'} ${t}°.`,
    meta: {},
  })
}

function m410distance(): GameQuestion {
  const [p, q, r] = pick(BASE.slice(0, 4))
  const k = pick([1, 2])
  const [a, c, h] = chance() ? [p * k, q * k, r * k] : [q * k, p * k, r * k]
  const [d1, d2] = pick([
    ['south', 'west'],
    ['north', 'east'],
    ['east', 'south'],
    ['west', 'north'],
  ])
  return gq({
    t: 'distance',
    prompt: `Jana cycles ${b(`${a} km`)} due ${d1}, then ${b(`${c} km`)} due ${d2}. How far is she from her starting point?`,
    correct: `${h} km`,
    // added the distances, the difference, the longer distance
    wrong: [a + c, Math.abs(c - a) || a + 1, Math.max(a, c), h + 1].filter((x, i, arr) => x !== h && arr.indexOf(x) === i).map((x) => `${x} km`),
    why: `The two legs are at right angles: √(${a}² + ${c}²) = √${a * a + c * c} = ${h} km.`,
    meta: {},
  })
}

const SET_410 = set('4.10', 'Problems involving bearings', 'Draw the bearings, find the right-angled triangle, then use Pythagoras or trigonometry.', [TRG2], [mk('distance', m410distance), mk('component', m410component, 2)], CALC)

export const NCM9_CH4: GameChapter = {
  id: 'ncm9-ch4',
  number: 4,
  title: 'Trigonometry',
  ref: 'NCM 9 Chapter 4',
  strand: 'Measurement and space',
  outcomes: [TRG, TRG2],
  sets: [SET_401, SET_402, SET_403, SET_404, SET_405, SET_406, SET_407, SET_408, SET_409, SET_410],
  colour: 205,
  topics: [],
}
