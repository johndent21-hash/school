// Class games for New Century Maths 8 (3rd edition, Cengage) Chapter 10, Ratios and rates: one set of quick
// questions for each exercise, 10.01 to 10.10.
//
// Ratios, sharing, rates, best buys, rate problems and travel graphs revise Year 7 (NCM 7 Chapter 12), so those sets
// reuse its kinds (checked by that chapter's checks, see reuse.ts). New kinds: one part as a fraction of the whole,
// scale maps, three-part ratios, units of rates, speed, distance and time, and converting rates
// (tests/game-checks/ncm8-ch10.ts).
//
// Syllabus: NSW Mathematics K–10 (2022), Stage 4 Ratios and rates MA4-RAT-C-01 throughout (scale maps are real-life
// ratio problems; speed and converting rates are rates; travel graphs are distance–time graphs).
import type { GameChapter, GameQuestion, GameSet } from '@/lib/game/types'
import { DIVIDE, TIMES, chance, frac, gq, int, mk, num, pick } from './helpers'
import { NCM7_CH12 } from './ncm7-ch12'
import { reuse } from './reuse'

const RAT = 'MA4-RAT-C-01'
const b = (s: string) => `<b>${s}</b>`
const gcd = (a: number, c: number): number => (c === 0 ? a : gcd(c, a % c))
/** three different positive wrong values, likely first, then spares */
function wrongs(right: number, likely: number[], fmt: (x: number) => string): string[] {
  const out: number[] = []
  for (const x of [...likely, right * 2, right / 2, right + 1, right * 10, right / 10]) {
    const v = Number(x.toPrecision(10))
    if (v > 0 && Math.abs(v - right) > 1e-9 && !out.includes(v)) out.push(v)
    if (out.length === 3) break
  }
  return out.map(fmt)
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
const R7 = (ex: string, t: string, as?: string) => reuse(NCM7_CH12, ex, t, as)

// ================================================================== 10.01, 10.02 Ratios and ratio problems

function m1002fraction(): GameQuestion {
  for (;;) {
    const a = int(1, 9)
    const c = int(1, 9)
    if (a === c || gcd(a, c) !== 1) continue
    const [A, C] = pick([
      ['boys', 'girls'],
      ['cats', 'dogs'],
      ['red beads', 'blue beads'],
    ])
    const askA = chance()
    const n = askA ? a : c
    const total = a + c
    return gq({
      t: 'fraction',
      prompt: `The ratio of ${A} to ${C} is ${b(`${a} : ${c}`)}. What fraction are ${b(askA ? A : C)}?`,
      correct: frac(n, total),
      // the ratio as a fraction, the other part, the other way round
      wrong: [frac(a, c), frac(askA ? c : a, total), frac(c, a), frac(1, total), frac(n, total + 1)].filter((s, k, arr) => arr.indexOf(s) === k && s !== frac(n, total) && !(a === 1 && c === 1)),
      why: `There are ${a} + ${c} = ${total} parts, and ${n} of them are ${askA ? A : C}: ${n}/${total}.`,
      meta: {},
    })
  }
}

const SET_1001 = set('10.01', 'Ratios', 'Write, compare and simplify ratios, in the same units.', [RAT], [
  R7('12.01', 'shaded'),
  R7('12.02', 'equiv'),
  R7('12.02', 'simplify'),
  R7('12.02', 'units'),
])
const SET_1002 = set('10.02', 'Ratio problems', 'Use ratios to find unknown amounts, and write one part as a fraction of the whole.', [RAT], [R7('12.03', 'part'), mk('fraction', m1002fraction)])

// ================================================================== 10.03 Scale maps and plans

const SCALES = [1000, 2000, 5000, 10_000, 20_000, 25_000, 50_000, 100_000, 200_000, 250_000, 500_000, 1_000_000]
/** a real length in cm, written in the most sensible unit */
const realLen = (cm: number) => (cm >= 100_000 ? `${num(cm / 100_000)} km` : `${num(cm / 100)} m`)

function m1003map(): GameQuestion {
  const s = pick(SCALES)
  const d = pick([2, 3, 4, 5, 6, 7, 8, 1.5, 2.5, 12])
  const real = d * s
  const unit = real >= 100_000 ? 'km' : 'm'
  const conv = unit === 'km' ? 100_000 : 100
  return gq({
    t: 'map',
    prompt: `A map has a scale of ${b(`1 : ${num(s)}`)}. Two towns are ${b(`${num(d)} cm`)} apart on the map. How far apart are they really?`,
    correct: `${num(real / conv)} ${unit}`,
    // a power of 10 out in the unit change, divided instead of multiplied
    wrong: wrongs(real / conv, [(real / conv) * 10, real / conv / 10, real / conv / 100, (real / conv) * 100], (x) => `${num(x)} ${unit}`),
    why: `1 cm on the map is ${num(s)} cm really. ${num(d)} × ${num(s)} = ${num(real)} cm = ${num(real / conv)} ${unit}.`,
    meta: {},
  })
}

function m1003toMap(): GameQuestion {
  const s = pick(SCALES.filter((x) => x >= 10_000))
  const d = pick([2, 3, 4, 5, 6, 8, 10, 1.5])
  const real = d * s
  const shown = realLen(real)
  return gq({
    t: 'toMap',
    prompt: `A map has a scale of ${b(`1 : ${num(s)}`)}. A road is ${b(shown)} long. How long is it on the map?`,
    correct: `${num(d)} cm`,
    wrong: wrongs(d, [d * 10, d / 10, d * 100], (x) => `${num(x)} cm`),
    why: `${shown} = ${num(real)} cm. ${num(real)} ${DIVIDE} ${num(s)} = ${num(d)} cm.`,
    meta: {},
  })
}

function m1003scale(): GameQuestion {
  const [cmTo, unit, f] = pick([
    [pick([2, 5, 10, 20, 50]), 'm', 100],
    [pick([1, 2, 5, 10]), 'km', 100_000],
  ] as [number, string, number][])
  const s = cmTo * f
  return gq({
    t: 'scale',
    prompt: `Write the map scale ${b(`1 cm : ${cmTo} ${unit}`)} as a ratio without units.`,
    correct: `1 : ${num(s)}`,
    wrong: wrongs(s, [s / 10, s * 10, cmTo, s / 100], (x) => `1 : ${num(x)}`),
    why: `${cmTo} ${unit} = ${num(s)} cm, so 1 cm : ${num(s)} cm = 1 : ${num(s)}.`,
    meta: {},
  })
}

const SET_1003 = set('10.03', 'Scale maps and plans', 'Use a map scale 1 : n to find real distances and map distances.', [RAT], [mk('scale', m1003scale), mk('map', m1003map), mk('toMap', m1003toMap, 2)])

// ================================================================== 10.04 Dividing a quantity in a ratio

function m1004three(): GameQuestion {
  for (;;) {
    const r = [int(1, 6), int(1, 6), int(1, 6)]
    if (new Set(r).size < 2) continue
    const parts = r[0] + r[1] + r[2]
    const each = pick([5, 10, 20, 25, 50, 100])
    const total = parts * each
    const names = ['Ana', 'Ben', 'Chen']
    const i = int(0, 2)
    const ans = r[i] * each
    return gq({
      t: 'three',
      prompt: `${b(`$${num(total)}`)} is shared between ${names.join(', ').replace(/, ([^,]*)$/, ' and $1')} in the ratio ${b(r.join(' : '))}. How much does ${b(names[i])} get?`,
      correct: `$${num(ans)}`,
      // total ÷ their number, a third each, another person's share
      wrong: wrongs(ans, [Math.round(total / r[i]), Math.round(total / 3), r[(i + 1) % 3] * each, each, ans + each, ans * 2], (x) => `$${num(Math.round(x))}`),
      why: `${r.join(' + ')} = ${parts} parts, so 1 part is $${num(total)} ${DIVIDE} ${parts} = $${num(each)}. ${names[i]}: ${r[i]} ${TIMES} $${num(each)} = $${num(ans)}.`,
      meta: {},
    })
  }
}

const SET_1004 = set('10.04', 'Dividing a quantity in a ratio', 'Share an amount in a given ratio: total parts, the value of 1 part, then each share.', [RAT], [R7('12.03', 'share'), mk('three', m1004three)])

// ================================================================== 10.05 Rates

const RATE_UNITS: [string, string, string[]][] = [
  ['the cost of petrol', '$/L', ['L/$', '$/km', 'km/h']],
  ['the speed of a car', 'km/h', ['h/km', 'km/L', 'm²/h']],
  ['how fast a tap fills a bath', 'L/min', ['min/L', 'L/km', '$/L']],
  ['a heart rate', 'beats/min', ['min/beat', 'beats/km', 'km/h']],
  ['the price of apples', '$/kg', ['kg/$', '$/m', 'kg/h']],
  ['how fast a printer prints', 'pages/min', ['min/page', 'pages/kg', '$/page']],
  ["a car's fuel use", 'L/100 km', ['km/h', '$/L', 'L/h']],
  ['the rate of pay for a job', '$/h', ['h/$', '$/kg', 'km/h']],
]

function m1005units(): GameQuestion {
  const [what, right, wrong] = pick(RATE_UNITS)
  return gq({
    t: 'units',
    prompt: `Which units suit ${b(what)}?`,
    correct: right,
    wrong,
    why: `${what[0].toUpperCase() + what.slice(1)} compares the two quantities in ${right}.`,
    meta: {},
  })
}

const SET_1005 = set('10.05', 'Rates', 'Write rates in simplest form with suitable units.', [RAT], [R7('12.04', 'rate'), mk('units', m1005units)])

// ================================================================== 10.06, 10.07 revision: best buys and rate problems

const SET_1006 = set('10.06', 'Best buys', 'Compare unit prices to find the best buy.', [RAT], [R7('12.05', 'unit'), R7('12.05', 'best')])
const SET_1007 = set('10.07', 'Rate problems', 'Use a rate to find a total amount or a time.', [RAT], [R7('12.06', 'apply'), R7('12.06', 'time')])

// ================================================================== 10.08 Speed

/** a time in minutes, written as hours and minutes */
const hm = (min: number) => (min % 60 === 0 ? `${min / 60} h` : min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${min % 60} min`)

function m1008speed(): GameQuestion {
  for (;;) {
    const v = pick([4, 5, 6, 8, 10, 12, 15, 16, 20, 24, 30, 40, 48, 60, 72, 80, 90, 100])
    const t = pick([15, 20, 30, 40, 45, 90, 120, 150, 180])
    const d = (v * t) / 60
    if (!Number.isInteger(d)) continue
    return gq({
      t: 'speed',
      prompt: `A cyclist travels ${b(`${d} km`)} in ${b(hm(t))}. What is the average speed in km/h?`,
      correct: `${v} km/h`,
      // distance ÷ minutes, distance × time, ignored that the time is not 1 hour
      wrong: wrongs(v, [Math.round((d / t) * 100) / 100, d, (d * t) / 60, d / Math.floor(t / 60 || 1)], (x) => `${num(x)} km/h`),
      why: `${hm(t)} = ${num(t / 60)} h. Speed = ${d} ${DIVIDE} ${num(t / 60)} = ${v} km/h.`,
      meta: {},
    })
  }
}

function m1008distance(): GameQuestion {
  for (;;) {
    const v = pick([4, 5, 6, 8, 10, 12, 20, 40, 60, 80, 90, 100])
    const t = pick([15, 20, 30, 45, 90, 120, 150, 180])
    const d = (v * t) / 60
    if (!Number.isInteger(d)) continue
    return gq({
      t: 'distance',
      prompt: `Majid walks at ${b(`${v} km/h`)} for ${b(hm(t))}. How far does he go?`,
      correct: `${d} km`,
      // speed × minutes, speed ÷ time, the speed itself
      wrong: wrongs(d, [v * t, v / (t / 60), v, v + t / 60], (x) => `${num(x)} km`),
      why: `Distance = speed × time = ${v} × ${num(t / 60)} = ${d} km.`,
      meta: {},
    })
  }
}

function m1008time(): GameQuestion {
  for (;;) {
    const v = pick([40, 50, 60, 80, 90, 100, 110])
    const t = pick([30, 45, 90, 120, 150, 180, 210, 240])
    const d = (v * t) / 60
    if (!Number.isInteger(d)) continue
    const wrongT = [Math.round((d / v) * 100), (d * 60) / v + 30, t + 60, t - 30, t * 2].filter((x) => x > 0 && x !== t && Number.isInteger(x))
    const out: string[] = []
    for (const w of wrongT) if (!out.includes(hm(w))) out.push(hm(w))
    return gq({
      t: 'time',
      prompt: `How long does it take to drive ${b(`${d} km`)} at ${b(`${v} km/h`)}?`,
      correct: hm(t),
      // decimal hours read as h and min (e.g. 1.5 h as 1 h 50 min)
      wrong: [Math.floor(t / 60) > 0 && t % 60 === 30 ? `${Math.floor(t / 60)} h 50 min` : '', ...out].filter((x) => x && x !== hm(t)),
      why: `Time = distance ÷ speed = ${d} ${DIVIDE} ${v} = ${num(t / 60)} h = ${hm(t)}.`,
      meta: {},
    })
  }
}

const SET_1008 = set('10.08', 'Speed', 'Use speed = distance ÷ time, and work out distances and times.', [RAT], [mk('speed', m1008speed), mk('distance', m1008distance), mk('time', m1008time, 2)])

// ================================================================== 10.09 Converting rates

function m1009convert(): GameQuestion {
  const k = int(0, 3)
  if (k === 0) {
    const ms = pick([5, 10, 15, 20, 25, 30])
    return gq({
      t: 'convert',
      prompt: `Convert ${b(`${num(ms * 3.6)} km/h`)} to m/s.`,
      correct: `${ms} m/s`,
      wrong: wrongs(ms, [ms * 3.6 * 3.6, ms * 3.6 * 1000, (ms * 3.6) / 60, ms * 6], (x) => `${num(Math.round(x * 100) / 100)} m/s`),
      why: `1 km/h = 1000 m ÷ 3600 s, so divide by 3.6: ${num(ms * 3.6)} ${DIVIDE} 3.6 = ${ms} m/s.`,
      meta: {},
    })
  }
  if (k === 1) {
    const ms = pick([2, 5, 10, 15, 20, 25])
    return gq({
      t: 'convert',
      prompt: `Convert ${b(`${ms} m/s`)} to km/h.`,
      correct: `${num(ms * 3.6)} km/h`,
      wrong: wrongs(ms * 3.6, [ms / 3.6, ms * 60, ms * 3600, ms * 36], (x) => `${num(Math.round(x * 100) / 100)} km/h`),
      why: `${ms} m every second is ${ms} × 3600 = ${num(ms * 3600)} m every hour = ${num(ms * 3.6)} km/h.`,
      meta: {},
    })
  }
  if (k === 2) {
    const perMin = pick([2, 3, 4, 5, 6, 8, 12, 15])
    return gq({
      t: 'convert',
      prompt: `A tap runs at ${b(`${perMin} L/min`)}. What is this in litres per hour?`,
      correct: `${perMin * 60} L/h`,
      wrong: wrongs(perMin * 60, [perMin * 100, perMin / 60, perMin * 24, perMin * 3600], (x) => `${num(Math.round(x * 1000) / 1000)} L/h`),
      why: `There are 60 minutes in an hour: ${perMin} × 60 = ${perMin * 60} L/h.`,
      meta: {},
    })
  }
  const perKg = pick([2, 4, 5, 8, 10, 12, 15, 20, 30])
  return gq({
    t: 'convert',
    prompt: `Cheese costs ${b(`$${perKg}/kg`)}. What is this in cents per gram?`,
    correct: `${num(perKg / 10)} c/g`,
    wrong: wrongs(perKg / 10, [perKg, perKg * 10, perKg / 100, perKg / 1000], (x) => `${num(x)} c/g`),
    why: `$${perKg} = ${perKg * 100} cents and 1 kg = 1000 g: ${perKg * 100} ÷ 1000 = ${num(perKg / 10)} c/g.`,
    meta: {},
  })
}

const SET_1009 = set('10.09', 'Converting rates', 'Convert rates between units, such as km/h and m/s.', [RAT], [mk('convert', m1009convert)])

// ================================================================== 10.10 revision: travel graphs

const SET_1010 = set('10.10', 'Travel graphs', 'Read distance–time graphs: distances, rests and speeds.', [RAT], [R7('12.07', 'far'), R7('12.07', 'rest'), R7('12.07', 'speed')])

export const NCM8_CH10: GameChapter = {
  id: 'ncm8-ch10',
  number: 10,
  title: 'Ratios and rates',
  ref: 'NCM 8 Chapter 10',
  strand: 'Number and algebra',
  outcomes: [RAT],
  sets: [SET_1001, SET_1002, SET_1003, SET_1004, SET_1005, SET_1006, SET_1007, SET_1008, SET_1009, SET_1010],
  colour: 25,
  topics: [],
}
