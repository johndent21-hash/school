// Class games for New Century Maths 7 (3rd edition, Cengage) Chapter 12, Rates, ratio and time: one set of quick
// questions for each exercise, 12.01 to 12.12.
//
// The questions are the site's own. Every question is ONE step with four choices; the wrong choices are the usual
// slips: a ratio written the wrong way round, a ratio only partly simplified, a rate with its units upside down,
// 2.5 hours read as 2 hours 50 minutes, 17:50 read as 7:50 p.m. Travel graphs and timetables are drawn and read
// back by the test (tests/game-checks/ncm7-ch12.ts).
//
// Syllabus: NSW Mathematics K–10 (2022), Stage 4, Ratios and rates MA4-RAT-C-01 (12.01–12.07, including
// distance–time graphs). Time (12.08–12.11) has no Stage 4 content point and is marked as revision; 12.12 (world
// time zones) is marked as extension in the textbook.
import type { GameChapter, GameQuestion, GameSet } from '@/lib/game/types'
import { D, D2, chance, gcd, gq, int, mk, money, num, pick, sample } from './helpers'

const RAT = 'MA4-RAT-C-01'
const REVISION = 'Revision of earlier stages: time calculations, 24-hour time and timetables have no content point in the Stage 4 syllabus.'
const EXTENSION = 'Marked as extension in the textbook; world time zones are not in the Stage 4 syllabus.'
const big = (s: string) => `<div class="big">${s}</div>`
const r = (a: number, b: number) => `${num(a)} : ${num(b)}`
const NAMES = ['Ava', 'Liam', 'Mia', 'Noah', 'Zara', 'Jack', 'Priya', 'Kai', 'Lily', 'Sam', 'Ella', 'Omar']
/** three different wrong whole numbers, likely first */
function intWrong(right: number, likely: number[]): string[] {
  const out: number[] = []
  for (const x of [...likely, right + 1, right - 1, right * 2, right + 10]) {
    if (x !== right && x > 0 && Number.isInteger(x) && !out.includes(x)) out.push(x)
    if (out.length === 3) break
  }
  return out.map((x) => num(x))
}

// ================================================================== 12.01 Ratios

function m1201shaded(): GameQuestion {
  const parts = pick([5, 6, 7, 8, 9, 10])
  let s: number
  do s = int(1, parts - 1)
  while (2 * s === parts)
  return gq({
    t: 'shaded',
    prompt: 'What is the ratio of shaded parts to unshaded parts?',
    diagram: D2.fractionStrip(parts, s),
    correct: r(s, parts - s),
    // the wrong way round, shaded to all parts, unshaded to all parts
    wrong: [r(parts - s, s), r(s, parts), r(parts - s, parts)],
    why: `${s} parts are shaded and ${parts - s} are not, so shaded : unshaded = ${r(s, parts - s)}. (The order matters.)`,
    meta: { parts, s },
  })
}

function m1201order(): GameQuestion {
  let a: number, b: number
  do {
    a = int(8, 18)
    b = int(8, 18)
  } while (a === b)
  const [first, second] = chance() ? (['girls', 'boys'] as const) : (['boys', 'girls'] as const)
  const n = { boys: a, girls: b }
  return gq({
    t: 'order',
    prompt: `A class has ${a} boys and ${b} girls. What is the ratio of ${first} to ${second}?`,
    correct: r(n[first], n[second]),
    wrong: [r(n[second], n[first]), r(n[first], a + b), r(n[second], a + b)],
    why: `${first} first, then ${second}: ${r(n[first], n[second])}.`,
    meta: { a, b, first },
  })
}

const SET_1201: GameSet = {
  id: 'ncm7-12.01',
  exercise: '12.01',
  ref: 'NCM 7 Ex 12.01',
  title: 'Ratios',
  focus: 'Write a ratio in the order the words give.',
  lessons: ['y7-rat-simplify'],
  outcomes: [RAT],
  makers: [mk('shaded', m1201shaded), mk('order', m1201order)],
}

// ================================================================== 12.02 Simplifying ratios

function m1202simplify(): GameQuestion {
  let a: number, b: number
  do {
    a = int(1, 9)
    b = int(1, 9)
  } while (a === b || gcd(a, b) !== 1)
  const k = pick([4, 6, 8, 9, 10, 12])
  const p = [2, 3, 5].find((f) => k % f === 0)!
  return gq({
    t: 'simplify',
    prompt: `Simplify:${big(r(a * k, b * k))}`,
    correct: r(a, b),
    // only partly simplified, the wrong way round, only one side divided
    wrong: [r((a * k) / p, (b * k) / p), r(b, a), r(a, b * k), r(a + 1, b + 1)],
    why: `Divide both sides by their highest common factor, ${k}: ${r(a, b)}.`,
    meta: { a, b, k },
  })
}

function m1202equiv(): GameQuestion {
  let a: number, b: number
  do {
    a = int(1, 9)
    b = int(1, 9)
  } while (a === b || gcd(a, b) !== 1)
  const k = int(2, 9)
  const left = chance()
  const ans = left ? a * k : b * k
  return gq({
    t: 'equiv',
    prompt: `What number goes in the box?${big(left ? `${r(a, b)} = □ : ${num(b * k)}` : `${r(a, b)} = ${num(a * k)} : □`)}`,
    correct: num(ans),
    // added instead of multiplying, the other side's number
    wrong: intWrong(ans, left ? [a + b * k - b, b * k, a * (k + 1)] : [b + a * k - a, a * k, b * (k + 1)]),
    why: `Both sides are multiplied by ${k}: ${left ? `${a} × ${k} = ${ans}` : `${b} × ${k} = ${ans}`}.`,
    meta: { a, b, k, left },
  })
}

function m1202units(): GameQuestion {
  const [small, bigU, f] = pick([['cm', 'm', 100], ['g', 'kg', 1000], ['min', 'h', 60], ['c', '$', 100]] as [string, string, number][])
  const W = int(1, 3)
  const step = f === 1000 ? 50 : 5
  const part = step * int(1, (f * W) / step - 1)
  const g = gcd(part, f * W)
  const showBig = bigU === '$' ? `$${W}` : `${W} ${bigU}`
  const showSmall = small === 'c' ? `${part}c` : `${part} ${small}`
  return gq({
    t: 'units',
    prompt: `Simplify the ratio ${showSmall} : ${showBig}`,
    correct: r(part / g, (f * W) / g),
    // the units ignored, then partly simplified or upside down
    wrong: [r(part / gcd(part, W), W / gcd(part, W)), r((f * W) / g, part / g), r(part / g, (f * W) / g + 1), r(part, f * W / 10)],
    why: `Change to the same unit: ${showBig} = ${num(f * W)} ${small === 'c' ? 'c' : small}. Then ${r(part, f * W)} = ${r(part / g, (f * W) / g)}.`,
    meta: { part, W, f },
  })
}

const SET_1202: GameSet = {
  id: 'ncm7-12.02',
  exercise: '12.02',
  ref: 'NCM 7 Ex 12.02',
  title: 'Simplifying ratios',
  focus: 'Simplify ratios by dividing both sides by the HCF, and find equivalent ratios.',
  lessons: ['y7-rat-simplify'],
  outcomes: [RAT],
  makers: [mk('equiv', m1202equiv), mk('simplify', m1202simplify), mk('units', m1202units, 2)],
}

// ================================================================== 12.03 Ratio problems

function m1203part(): GameQuestion {
  let a: number, b: number
  do {
    a = int(2, 9)
    b = int(2, 9)
  } while (a === b || gcd(a, b) !== 1)
  const k = int(3, 15)
  return gq({
    t: 'part',
    prompt: `The ratio of boys to girls in a club is ${r(a, b)}. There are ${a * k} boys. How many girls are there?`,
    correct: num(b * k),
    // used the ratio the wrong way, added the difference, the total
    wrong: intWrong(b * k, [Math.round((a * k * a) / b), a * k + (b - a), (a + b) * k, b * k + k]),
    why: `${a * k} ÷ ${a} = ${k} people in each part, so girls = ${b} × ${k} = ${b * k}.`,
    meta: { a, b, k },
  })
}

function m1203share(): GameQuestion {
  let a: number, b: number
  do {
    a = int(1, 7)
    b = int(1, 7)
  } while (a === b || gcd(a, b) !== 1)
  const k = int(3, 20)
  const total = (a + b) * k
  const larger = chance()
  const [x, y] = [a * k, b * k]
  const ans = larger ? Math.max(x, y) : Math.min(x, y)
  return gq({
    t: 'share',
    prompt: `$${total} is shared in the ratio ${r(a, b)}. How much is the ${larger ? 'larger' : 'smaller'} share?`,
    correct: `$${num(ans)}`,
    // divided by one side of the ratio, the other share, half each
    wrong: [`$${num(larger ? Math.min(x, y) : Math.max(x, y))}`, ...(total % 2 === 0 ? [`$${num(total / 2)}`] : []), `$${num(total / Math.max(a, b))}`, `$${num(ans + k)}`, `$${num(Math.abs(ans - k))}`, `$${num(ans * 2)}`, `$${num(x + y)}`, `$${num(ans + 1)}`].filter((s) => !/\./.test(s) && s !== '$0'),
    why: `${a} + ${b} = ${a + b} parts. One part = $${total} ÷ ${a + b} = $${k}. The ${larger ? 'larger' : 'smaller'} share is ${larger ? Math.max(a, b) : Math.min(a, b)} × $${k} = $${num(ans)}.`,
    meta: { a, b, k, larger },
  })
}

const SET_1203: GameSet = {
  id: 'ncm7-12.03',
  exercise: '12.03',
  ref: 'NCM 7 Ex 12.03',
  title: 'Ratio problems',
  focus: 'Use the unitary method to solve ratio problems and share an amount in a ratio.',
  lessons: ['y7-rat-divide'],
  outcomes: [RAT],
  makers: [mk('part', m1203part), mk('share', m1203share, 2)],
}

// ================================================================== 12.04 Rates

const RATES: { say: (a: number, b: number) => string; top: string; bottom: string; unit: string; flip: string }[] = [
  { say: (a, b) => `A car travels ${a} km in ${b} hours.`, top: 'km', bottom: 'h', unit: 'km/h', flip: 'h/km' },
  { say: (a, b) => `A worker earns $${a} in ${b} hours.`, top: '$', bottom: 'h', unit: '$/h', flip: 'h/$' },
  { say: (a, b) => `A tap fills ${a} L in ${b} minutes.`, top: 'L', bottom: 'min', unit: 'L/min', flip: 'min/L' },
  { say: (a, b) => `A printer prints ${a} pages in ${b} minutes.`, top: 'pages', bottom: 'min', unit: 'pages/min', flip: 'min/page' },
]

function m1204rate(): GameQuestion {
  const R = pick(RATES)
  const b = int(2, 6)
  const each = int(4, 30) * (R.top === 'km' ? 5 : 1)
  const a = each * b
  const showRate = (x: number, u: string) => (u === '$/h' ? `$${num(x)}/h` : `${num(x)} ${u}`)
  return gq({
    t: 'rate',
    prompt: `${R.say(a, b)} What is the rate?`,
    correct: showRate(each, R.unit),
    // multiplied instead, the units upside down
    wrong: [showRate(a * b, R.unit), R.unit === '$/h' ? `${num(each)} h/$` : `${num(each)} ${R.flip}`, showRate(a, R.unit), showRate(each + b, R.unit)],
    why: `${num(a)} ÷ ${b} = ${num(each)}, so the rate is ${showRate(each, R.unit)}.`,
    meta: { a, b, unit: R.unit },
  })
}

const SET_1204: GameSet = {
  id: 'ncm7-12.04',
  exercise: '12.04',
  ref: 'NCM 7 Ex 12.04',
  title: 'Rates',
  focus: 'Write a rate with two different units, simplified to “per one” of the second unit.',
  lessons: ['y7-rat-rates'],
  outcomes: [RAT],
  makers: [mk('rate', m1204rate)],
}

// ================================================================== 12.05 Best buys

function m1205unit(): GameQuestion {
  const n = pick([4, 5, 6, 8, 10])
  const each = 5 * int(8, 60)
  const item = pick(['eggs', 'muesli bars', 'apples', 'drink cans'])
  return gq({
    t: 'unit',
    prompt: `${n} ${item} cost ${money((n * each) / 100)}. What is the price of one?`,
    correct: money(each / 100),
    // a decimal point slip, multiplied, one out
    wrong: [money(each / 1000), money((n * each * n) / 100), money(each / 100 + 0.1), money(each / 100 - 0.05)],
    why: `${money((n * each) / 100)} ÷ ${n} = ${money(each / 100)}.`,
    meta: { n, each },
  })
}

function m1205best(): GameQuestion {
  // four packs, each with a different price per item (in cents)
  let packs: { n: number; cents: number }[]
  do packs = sample([2, 3, 4, 5, 6, 8, 10, 12], 4).map((n) => ({ n, cents: n * 5 * int(20, 40) + pick([0, 0, 5, 10, -5]) }))
  while (new Set(packs.map((p) => (p.cents / p.n).toFixed(4))).size < 4 || packs.some((p) => p.cents <= 0))
  const best = packs.reduce((a, p) => (p.cents / p.n < a.cents / a.n ? p : a))
  const say = (p: { n: number; cents: number }) => `${p.n} for ${money(p.cents / 100)}`
  return gq({
    t: 'best',
    prompt: 'Which pack of muesli bars is the best buy?',
    correct: say(best),
    inOrder: packs.sort((a, b) => a.n - b.n).map(say),
    why: `Price per bar: ${packs.map((p) => `${say(p)} is about ${money(Math.round(p.cents / p.n) / 100)}`).join(', ')}. The lowest is ${say(best)}.`,
    meta: { packs },
  })
}

const SET_1205: GameSet = {
  id: 'ncm7-12.05',
  exercise: '12.05',
  ref: 'NCM 7 Ex 12.05',
  title: 'Best buys',
  focus: 'Compare unit prices to find the best buy.',
  lessons: ['y7-rat-rates'],
  outcomes: [RAT],
  makers: [mk('unit', m1205unit), mk('best', m1205best, 2)],
}

// ================================================================== 12.06 Rate problems

const dur = (min: number) => (min < 60 ? `${min} min` : min % 60 === 0 ? `${min / 60} h` : `${Math.floor(min / 60)} h ${min % 60} min`)

function m1206apply(): GameQuestion {
  const kind = int(0, 2)
  const t = int(3, 12)
  const rate = [int(30, 70), 5 * int(2, 9), 5 * int(12, 20)][kind]
  const ans = rate * t
  const [prompt, unit] = [
    [`${pick(NAMES)} types ${rate} words per minute. How many words in ${t} minutes?`, 'words'],
    [`A tap drips ${rate} mL each hour. How much water drips in ${t} hours?`, 'mL'],
    [`A car travels at ${rate} km/h. How far does it go in ${t} hours?`, 'km'],
  ][kind]
  const show = (x: number) => `${num(x)} ${unit}`
  return gq({
    t: 'apply',
    prompt,
    correct: show(ans),
    // divided instead, added, one step out
    wrong: [show(rate + t), show(ans + rate), show(ans - rate), show(ans * 10)],
    why: `${rate} ${unit} each ${['minute', 'hour', 'hour'][kind]} for ${t} ${['minutes', 'hours', 'hours'][kind]}: ${rate} × ${t} = ${show(ans)}.`,
    meta: { kind, rate, hours: t },
  })
}

function m1206time(): GameQuestion {
  let speed: number, min: number
  do {
    speed = pick([40, 50, 60, 80, 100])
    min = pick([30, 90, 150, 210, 45, 75, 120, 180])
  } while ((speed * min) % 60 !== 0)
  const dist = (speed * min) / 60
  const hrs = min / 60
  return gq({
    t: 'time',
    prompt: `A bus travels ${dist} km at an average speed of ${speed} km/h. How long does the trip take?`,
    correct: dur(min),
    // 2.5 h read as 2 h 50 min, an hour out, the speed and distance divided the wrong way
    wrong: [`${Math.floor(hrs)} h ${Math.round((hrs % 1) * 100)} min`, dur(min + 60), dur(min + 30), dur(Math.max(15, min - 30))].filter((s) => s !== dur(min) && !/ 0 min/.test(s) && !/^0 h/.test(s)),
    why: `Time = distance ÷ speed = ${dist} ÷ ${speed} = ${num(hrs)} h = ${dur(min)}.`,
    meta: { speed, min },
  })
}

const SET_1206: GameSet = {
  id: 'ncm7-12.06',
  exercise: '12.06',
  ref: 'NCM 7 Ex 12.06',
  title: 'Rate problems',
  focus: 'Use a rate to find a total, or a time from a distance and a speed.',
  lessons: ['y7-rat-rates'],
  outcomes: [RAT],
  makers: [mk('apply', m1206apply), mk('time', m1206time, 2)],
}

// ================================================================== 12.07 Travel graphs

/** a distance–time graph: out at a steady speed, a rest, then home */
function travel(): { pts: [number, number][]; T: number; Dmax: number; step: number; who: string } {
  const step = pick([2, 5, 10])
  const d = step === 10 ? step * int(2, 4) : step * int(2, 5)
  const t1 = int(1, 2)
  const rest = int(1, 2)
  const back = int(1, 3)
  const pts: [number, number][] = [[0, 0], [t1, d], [t1 + rest, d], [t1 + rest + back, 0]]
  // about 2–10 km/h is walking pace; anything faster is a bike ride
  const who = d / t1 <= 10 && d / back <= 10 ? 'walker' : 'cyclist'
  return { pts, T: t1 + rest + back, Dmax: d + step, step, who }
}
function travelGraph(g: ReturnType<typeof travel>): string {
  const W = 330
  const H = 230
  const left = 50
  const bottom = H - 40
  const top = 14
  const right = W - 14
  const X = (t: number) => left + (t / g.T) * (right - left)
  const Y = (d: number) => bottom - (d / g.Dmax) * (bottom - top)
  let body = ''
  for (let t = 0; t <= g.T; t++) body += `<line class="grid" x1="${X(t).toFixed(1)}" y1="${top}" x2="${X(t).toFixed(1)}" y2="${bottom}"/>` + D.text([X(t), bottom + 13], String(t), 'dl tiny tx')
  for (let d = 0; d <= g.Dmax; d += g.step) body += `<line class="grid" x1="${left}" y1="${Y(d).toFixed(1)}" x2="${right}" y2="${Y(d).toFixed(1)}"/>` + D.text([left - 6, Y(d)], String(d), 'dl tiny ty', 'end')
  body += `<line class="axis" x1="${left}" y1="${bottom}" x2="${right}" y2="${bottom}"/><line class="axis" x1="${left}" y1="${bottom}" x2="${left}" y2="${top - 4}"/>`
  body += `<polyline class="plot" points="${g.pts.map(([t, d]) => `${X(t).toFixed(1)},${Y(d).toFixed(1)}`).join(' ')}"/>`
  body += D.text([(left + right) / 2, H - 8], 'Time (hours)', 'dl tiny')
  body += `<text class="dl tiny" transform="translate(12 ${(top + bottom) / 2}) rotate(-90)" text-anchor="middle">Distance from home (km)</text>`
  return D.svg(W, H, body, 'A travel graph', 380)
}

function m1207far(): GameQuestion {
  const g = travel()
  const d = g.pts[1][1]
  return gq({
    t: 'far',
    prompt: `How far from home did the ${g.who} go?`,
    diagram: travelGraph(g),
    correct: `${d} km`,
    // read the time instead, double (there and back), one gridline out
    wrong: [`${2 * d} km`, `${g.pts[1][0]} km`, `${d + g.step} km`, `${d - g.step} km`].filter((s) => s !== `${d} km` && !/^0 /.test(s)),
    why: `The highest point of the graph is at ${d} km.`,
    meta: { pts: g.pts },
  })
}

function m1207rest(): GameQuestion {
  const g = travel()
  const restH = g.pts[2][0] - g.pts[1][0]
  const say = (h: number) => `${h} ${h === 1 ? 'hour' : 'hours'}`
  return gq({
    t: 'rest',
    prompt: `For how long did the ${g.who} stop?`,
    diagram: travelGraph(g),
    correct: say(restH),
    // the time the rest ended, the whole trip, the time out
    wrong: [say(g.pts[2][0]), say(g.T), say(restH + 1), say(g.pts[1][0]), say(restH + 2), say(restH + 3)].filter((s, i, all) => s !== say(restH) && all.indexOf(s) === i),
    why: `The flat part of the graph (no change in distance) lasts from ${g.pts[1][0]} h to ${g.pts[2][0]} h: ${say(restH)}.`,
    meta: { pts: g.pts },
  })
}

function m1207speed(): GameQuestion {
  let g: ReturnType<typeof travel>, a: [number, number], b: [number, number], sp: number
  const back = chance()
  do {
    g = travel()
    ;[a, b] = back ? [g.pts[2], g.pts[3]] : [g.pts[0], g.pts[1]]
    sp = Math.abs(b[1] - a[1]) / (b[0] - a[0])
  } while (!Number.isInteger(sp))
  return gq({
    t: 'speed',
    prompt: `What was the ${g.who}'s speed on the way ${back ? 'home' : 'out'}?`,
    diagram: travelGraph(g),
    correct: `${sp} km/h`,
    // the distance only, the time only, distance × time
    wrong: [`${Math.abs(b[1] - a[1])} km/h`, `${b[0] - a[0]} km/h`, `${Math.abs(b[1] - a[1]) * (b[0] - a[0])} km/h`, `${sp + 1} km/h`, `${sp + 2} km/h`, `${sp * 2} km/h`].filter((s, i, all) => s !== `${sp} km/h` && all.indexOf(s) === i),
    why: `Speed = distance ÷ time = ${Math.abs(b[1] - a[1])} km ÷ ${b[0] - a[0]} h = ${sp} km/h.`,
    meta: { pts: g.pts, back },
  })
}

const SET_1207: GameSet = {
  id: 'ncm7-12.07',
  exercise: '12.07',
  ref: 'NCM 7 Ex 12.07',
  title: 'Travel graphs',
  focus: 'Read distance–time graphs: distances, stops (flat parts) and speeds (steepness).',
  lessons: ['y7-rat-rates'],
  outcomes: [RAT],
  makers: [mk('far', m1207far), mk('rest', m1207rest), mk('speed', m1207speed, 2)],
}

// ================================================================== time (12.08–12.12)

/** minutes after midnight as 12-hour time, e.g. 1070 → "5:50 p.m." (no times in the 12 o'clock hours) */
function t12(m: number): string {
  const h = Math.floor(m / 60)
  const mm = String(m % 60).padStart(2, '0')
  return `${h % 12 === 0 ? 12 : h % 12}:${mm} ${h < 12 ? 'a.m.' : 'p.m.'}`
}
const t24 = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
/** a time of day avoiding the 12 o'clock hours, where a.m. and p.m. are easily confused */
const clock = (pm?: boolean) => {
  let m: number
  do m = int(1, 22) * 60 + int(0, 11) * 5
  while (Math.floor(m / 60) % 12 === 0 || (pm !== undefined && (m >= 720) !== pm))
  return m
}

function m1208convert(): GameQuestion {
  const h = int(1, 5)
  const asDecimal = chance()
  // as a decimal, only minutes that give a short decimal (20 min would be 0.333… h)
  const extra = asDecimal ? pick([6, 12, 15, 30, 36, 45, 48]) : pick([15, 20, 30, 40, 45])
  const total = h * 60 + extra
  return gq({
    t: 'convert',
    prompt: asDecimal ? `How many minutes are in ${num(total / 60)} hours?` : `How many minutes are in ${h} h ${extra} min?`,
    correct: num(total),
    // 100 minutes in an hour, the decimal digits read as minutes
    wrong: intWrong(total, [h * 100 + extra, Math.round((total / 60) * 100), h * 60, h * 60 + Math.round(((total / 60) % 1) * 100)]),
    why: `${h} × 60 = ${h * 60} minutes, plus ${extra}: ${total} minutes.`,
    meta: { h, extra, asDecimal },
  })
}

function m1208decimal(): GameQuestion {
  const h = int(1, 6)
  const [mins, dec] = pick([[15, 0.25], [30, 0.5], [45, 0.75], [6, 0.1], [12, 0.2], [36, 0.6]] as [number, number][])
  return gq({
    t: 'decimal',
    prompt: `Write ${h} h ${mins} min as a decimal number of hours.`,
    correct: `${num(h + dec)} h`,
    // the minutes written after the point
    wrong: [`${h}.${String(mins).padStart(2, '0')} h`, `${num(h + mins / 100 + 0.1)} h`, `${num(h + dec + 0.05)} h`, `${num(h + 1 - dec)} h`].filter((s) => s !== `${num(h + dec)} h`),
    why: `${mins} minutes is ${mins} ÷ 60 = ${num(dec)} of an hour, so ${num(h + dec)} h.`,
    meta: { h, mins },
  })
}

const SET_1208: GameSet = {
  id: 'ncm7-12.08',
  exercise: '12.08',
  ref: 'NCM 7 Ex 12.08',
  title: 'Time calculations',
  focus: 'Convert between hours and minutes: there are 60 minutes in an hour, not 100.',
  outcomes: [],
  teacherNote: REVISION,
  makers: [mk('convert', m1208convert), mk('decimal', m1208decimal, 2)],
}

function m1209to12(): GameQuestion {
  const m = clock(true)
  const h = Math.floor(m / 60)
  const mm = String(m % 60).padStart(2, '0')
  return gq({
    t: 'to12',
    prompt: `Write in 12-hour time:${big(t24(m))}`,
    correct: t12(m),
    // took away 10 instead of 12, a.m. for p.m., left the hour alone, took away 11
    wrong: [`${h - 10}:${mm} p.m.`, `${h - 12}:${mm} a.m.`, `${h}:${mm} p.m.`, `${h - 11}:${mm} p.m.`],
    why: `Hours after 12 are p.m.: ${h} − 12 = ${h - 12}, so ${t12(m)}.`,
    meta: { m },
  })
}

function m1209to24(): GameQuestion {
  const m = clock()
  return gq({
    t: 'to24',
    prompt: `Write ${t12(m)} in 24-hour time.`,
    correct: t24(m),
    wrong: [t24((m + 720) % 1440), t24((m + 600) % 1440), t24((m + 60) % 1440), t24((m + 780) % 1440)],
    why: m >= 720 ? `p.m.: add 12 to the hour, so ${t24(m)}.` : `a.m.: keep the hour (with a 0 in front if needed), so ${t24(m)}.`,
    meta: { m },
  })
}

const SET_1209: GameSet = {
  id: 'ncm7-12.09',
  exercise: '12.09',
  ref: 'NCM 7 Ex 12.09',
  title: '24-hour time',
  focus: 'Change between 12-hour and 24-hour time.',
  outcomes: [],
  teacherNote: REVISION,
  makers: [mk('to12', m1209to12), mk('to24', m1209to24)],
}

function m1210diff(): GameQuestion {
  let a: number, b: number
  do {
    a = clock(false) + int(0, 4)
    b = a + int(70, 300)
  } while (a < 360 || b >= 1380 || (a % 60) <= (b % 60))
  const d = b - a
  const wrongHours = `${Math.floor(d / 60) + 1} h ${d % 60} min`
  const flipMins = `${Math.floor(d / 60)} h ${60 - (d % 60)} min`
  return gq({
    t: 'diff',
    prompt: `How long is it from ${t12(a)} to ${t12(b)}?`,
    correct: dur(d),
    // the hours counted on the clock face, the minutes taken the wrong way
    wrong: [wrongHours, flipMins, `${Math.floor(d / 60) + 1} h ${60 - (d % 60)} min`, dur(d + 10), dur(d - 10), dur(d + 60)].filter((s, i, all) => s !== dur(d) && all.indexOf(s) === i),
    why: `From ${t12(a)} to ${t12(b)}: ${dur(d)}. (Count on to the next hour, then whole hours, then the minutes.)`,
    meta: { a, b },
  })
}

const SET_1210: GameSet = {
  id: 'ncm7-12.10',
  exercise: '12.10',
  ref: 'NCM 7 Ex 12.10',
  title: 'Time differences',
  focus: 'Find the time between two times by counting on.',
  outcomes: [],
  teacherNote: REVISION,
  makers: [mk('diff', m1210diff)],
}

const STOPS = ['Central', 'Redfern', 'Strathfield', 'Parramatta', 'Blacktown', 'Penrith']

/** a train timetable drawn as a picture: stop names and 24-hour times */
function timetable(stops: string[], times: number[]): string {
  const rh = 32
  const W = 260
  let body = `<rect class="frame" x="1" y="1" width="${W - 2}" height="${rh * (stops.length + 1)}"/>`
  body += D.text([14, rh / 2 + 1], 'Station', 'dl small head', 'start') + D.text([W - 14, rh / 2 + 1], 'Departs', 'dl small head', 'end')
  stops.forEach((s, i) => {
    const y = rh * (i + 1)
    body += `<line class="ln thin" x1="1" y1="${y}" x2="${W - 1}" y2="${y}"/>`
    body += D.text([14, y + rh / 2], s, 'dl small stop', 'start') + D.text([W - 14, y + rh / 2], t24(times[i]), 'dl small time', 'end')
  })
  return D.svg(W, rh * (stops.length + 1) + 2, body, 'A train timetable', 300)
}

function m1211trip(): GameQuestion {
  const n = int(4, 5)
  const stops = STOPS.slice(0, n)
  const start = 360 + 5 * int(0, 144)
  const times = [start]
  for (let i = 1; i < n; i++) times.push(times[i - 1] + int(4, 18))
  const [i, j] = sample([...Array(n).keys()], 2).sort((x, y) => x - y)
  const d = times[j] - times[i]
  return gq({
    t: 'trip',
    prompt: `How long does the train take from ${stops[i]} to ${stops[j]}?`,
    diagram: timetable(stops, times),
    correct: dur(d),
    wrong: [dur(d + 10), dur(Math.abs(d - 10) || d + 5), dur(times[j] - times[0] === d ? d + 5 : times[j] - times[0]), dur(d + 1), dur(d + 20)].filter((s) => s !== dur(d)),
    why: `It leaves ${stops[i]} at ${t24(times[i])} and ${stops[j]} at ${t24(times[j])}: ${dur(d)}.`,
    meta: { stops, times, i, j },
  })
}

const SET_1211: GameSet = {
  id: 'ncm7-12.11',
  exercise: '12.11',
  ref: 'NCM 7 Ex 12.11',
  title: 'Timetables',
  focus: 'Read a timetable and find how long a trip takes.',
  outcomes: [],
  teacherNote: REVISION,
  makers: [mk('trip', m1211trip)],
}

const ZONES: [string, number][] = [
  ['Perth', 8],
  ['Sydney', 10],
  ['Auckland', 12],
  ['Tokyo', 9],
  ['London', 0],
  ['Dubai', 4],
  ['Singapore', 8],
]

function m1212zones(): GameQuestion {
  let a: [string, number], b: [string, number]
  do [a, b] = sample(ZONES, 2)
  while (a[1] === b[1])
  let m: number
  do m = clock()
  while (Math.floor((m + (b[1] - a[1]) * 60) / 60) % 12 === 0 || m + (b[1] - a[1]) * 60 < 60 || m + (b[1] - a[1]) * 60 >= 1380)
  const there = m + (b[1] - a[1]) * 60
  return gq({
    t: 'zones',
    prompt: `${a[0]} is UTC + ${a[1]} and ${b[0]} is UTC + ${b[1]}. When it is ${t12(m)} in ${a[0]}, what time is it in ${b[0]}?`,
    correct: t12(there),
    // the difference taken the wrong way, an hour out
    wrong: [t12(m - (b[1] - a[1]) * 60), t12(there + 60), t12(there - 60), t12(m)].filter((s, i, all) => all.indexOf(s) === i && s !== t12(there) && !/NaN|-/.test(s)),
    why: `${b[0]} is ${Math.abs(b[1] - a[1])} ${Math.abs(b[1] - a[1]) === 1 ? 'hour' : 'hours'} ${b[1] > a[1] ? 'ahead of' : 'behind'} ${a[0]}, so ${t12(there)}.`,
    meta: { a, b, m },
  })
}

const SET_1212: GameSet = {
  id: 'ncm7-12.12',
  exercise: '12.12',
  ref: 'NCM 7 Ex 12.12',
  title: 'World time zones',
  focus: 'Use time differences between places (given as UTC offsets) to convert times.',
  outcomes: [],
  teacherNote: EXTENSION,
  makers: [mk('zones', m1212zones)],
}

export const NCM7_CH12: GameChapter = {
  id: 'ncm7-ch12',
  number: 12,
  title: 'Rates, ratio and time',
  ref: 'NCM 7 Chapter 12',
  strand: 'Number and algebra',
  outcomes: [RAT],
  sets: [SET_1201, SET_1202, SET_1203, SET_1204, SET_1205, SET_1206, SET_1207, SET_1208, SET_1209, SET_1210, SET_1211, SET_1212],
  colour: 25,
  topics: ['y7-ratios'],
}

