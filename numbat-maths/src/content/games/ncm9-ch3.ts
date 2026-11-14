// Class games for New Century Maths 9 Advanced (Cengage) Chapter 3, Numeracy and calculation: one set of quick
// questions for each exercise, 3.01 to 3.06.
//
// Most of the chapter revises Stage 4 (NCM 8 Chapters 2, 6 and 10; NCM 7 Chapter 12), so those sets reuse their kinds
// (checked by those chapters' checks, see reuse.ts). New kinds: recurring decimals to fractions, percentages over
// 100%, profit on total costs, simple interest for months and for an unknown time, and reaction distance
// (tests/game-checks/ncm9-ch3.ts).
//
// Syllabus: NSW Mathematics K–10 (2022).
// - Revision of Stage 4: MA4-FRC-C-01 (recurring decimals, percentages, profit, discounts, GST: 3.01–3.03) and
//   MA4-RAT-C-01 (ratios and rates: 3.05–3.06).
// - Stage 5 core: simple interest, Financial mathematics A, MA5-FIN-C-01 (3.04).
// - Converting a recurring decimal to a fraction is Stage 5 Path (Indices C, MA5-IND-P-02): extension.
import type { GameChapter, GameQuestion, GameSet } from '@/lib/game/types'
import { DIVIDE, TIMES, frac, gq, int, mk, num, pick } from './helpers'
import { NCM7_CH12 } from './ncm7-ch12'
import { NCM8_CH2 } from './ncm8-ch2'
import { NCM8_CH6 } from './ncm8-ch6'
import { NCM8_CH10 } from './ncm8-ch10'
import { reuse } from './reuse'

const FRC = 'MA4-FRC-C-01'
const RAT = 'MA4-RAT-C-01'
const FIN = 'MA5-FIN-C-01'
const big = (s: string) => `<div class="big">${s}</div>`
const b = (s: string) => `<b>${s}</b>`
const gcd = (a: number, c: number): number => (c === 0 ? a : gcd(c, a % c))
const F = (n: number, d: number) => frac(n / gcd(n, d), d / gcd(n, d))
/** money: "$45" or "$45.50" */
const $ = (x: number) => {
  const v = Math.round(x * 100) / 100
  return '$' + (Number.isInteger(v) ? num(v) : num(v, 2))
}
function wrongNums(right: number, likely: number[], fmt: (x: number) => string): string[] {
  const out: number[] = []
  for (const x of [...likely, right * 2, right / 2, right + 10, right * 10]) {
    const v = Math.round(x * 100) / 100
    if (v > 0 && Math.abs(v - right) > 1e-9 && !out.includes(v)) out.push(v)
    if (out.length === 3) break
  }
  return out.map(fmt)
}

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

// ================================================================== 3.01 Recurring decimals

const rec = (c: string) => `<span class="rec">${c}</span>`
/** dot notation: dots over the first and last repeating digits */
const recurring = (pre: string, rep: string) => `0.${pre}${rep.length === 1 ? rec(rep) : rec(rep[0]) + rep.slice(1, -1) + rec(rep[rep.length - 1])}`
/** recurring decimals and their fractions: [digits before the repeat, repeating digits] */
const REC: [string, string][] = [
  ['', '3'],
  ['', '6'],
  ['', '1'],
  ['', '4'],
  ['', '5'],
  ['', '7'],
  ['', '8'],
  ['', '09'],
  ['', '18'],
  ['', '27'],
  ['', '36'],
  ['', '45'],
  ['', '12'],
  ['1', '6'],
  ['8', '3'],
  ['0', '6'],
  ['2', '3'],
]
/** the fraction of 0.pre(rep) as [numerator, denominator] in lowest terms */
function recFrac(pre: string, rep: string): [number, number] {
  const n = Number(pre + rep) - Number(pre || '0')
  const d = 10 ** pre.length * (10 ** rep.length - 1)
  const g = gcd(n, d)
  return [n / g, d / g]
}

function m301toFrac(): GameQuestion {
  const [pre, rep] = pick(REC)
  const [n, d] = recFrac(pre, rep)
  // the digits over 10, 100 … (as if it stopped), over 9s with the wrong number of 9s, the repeat over 9s ignoring the start
  const stopped = Number(pre + rep)
  const tens = 10 ** (pre + rep).length
  const cand: [number, number][] = [
    [stopped, tens],
    [Number(rep), rep.length === 1 ? 99 : 9],
    pre ? [Number(rep), 10 ** rep.length - 1] : [Number(rep) + 1, 10 ** rep.length - 1],
    [n + 1, d],
    [n, d + 1],
    [n - 1, d],
    [n, d * 10],
    [Number(rep), 100],
  ]
  const out: string[] = []
  for (const [a, c] of cand) {
    if (a <= 0 || a >= c || a * d === n * c) continue
    const s = F(a, c)
    if (!out.includes(s)) out.push(s)
  }
  return gq({
    t: 'toFrac',
    prompt: `Write as a fraction in simplest form:${big(recurring(pre, rep))}`,
    correct: F(n, d),
    wrong: out,
    why: pre
      ? `If x = ${recurring(pre, rep)}, then ${10 ** (pre.length + rep.length)}x − ${10 ** pre.length}x = ${Number(pre + rep) - Number(pre)}, so ${10 ** pre.length * (10 ** rep.length - 1)}x = ${Number(pre + rep) - Number(pre)} and x = ${Number(pre + rep) - Number(pre)}/${10 ** pre.length * (10 ** rep.length - 1)} = ${n}/${d}.`
      : `The repeating block ${rep} over as many 9s as it has digits: ${Number(rep)}/${10 ** rep.length - 1} = ${n}/${d}.`,
    meta: {},
  })
}

const SET_301 = set(
  '3.01',
  'Recurring decimals',
  'Write fractions as terminating or recurring decimals (dot notation), and convert recurring decimals back to fractions.',
  [FRC],
  [reuse(NCM8_CH2, '2.07', 'term'), reuse(NCM8_CH2, '2.07', 'which'), reuse(NCM8_CH2, '2.07', 'convert'), mk('toFrac', m301toFrac, 2)],
  'Revision of Stage 4 (MA4-FRC-C-01). Converting a recurring decimal to a fraction is Stage 5 Path content (MA5-IND-P-02): extension.',
)

// ================================================================== 3.02 Applying percentages

function m302over100(): GameQuestion {
  for (;;) {
    const p = pick([105, 110, 115, 120, 125, 150, 175, 200, 250])
    const was = pick([20, 40, 60, 80, 84, 120, 160, 200, 240, 300, 400])
    const now = (was * p) / 100
    if (!Number.isInteger(now)) continue
    const [what, unit] = pick([
      ['A puppy’s mass', 'kg'],
      ['A town’s population', 'people'],
      ['The number of members of a club', 'members'],
    ] as [string, string][])
    const show = (x: number) => (unit === 'kg' ? `${num(x)} kg` : num(x))
    return gq({
      t: 'over100',
      prompt: `${what} is now ${b(`${p}%`)} of what it was a year ago. A year ago it was ${b(show(was))}. What is it now?`,
      correct: show(now),
      // added p% as an increase on top (100% + p%), took p% only of the increase, the increase alone
      wrong: wrongNums(now, [was + now, (was * (p - 100)) / 100, was + p, was * (p / 10)], show),
      why: `${p}% of ${show(was)} = ${num(p / 100)} ${TIMES} ${num(was)} = ${show(now)}.`,
      meta: {},
    })
  }
}

const SET_302 = set('3.02', 'Applying percentages', 'Find percentages of amounts, including more than 100%, and increase or decrease by a percentage.', [FRC], [
  reuse(NCM8_CH6, '6.07', 'increase'),
  reuse(NCM8_CH6, '6.07', 'decrease'),
  reuse(NCM8_CH6, '6.07', 'multiplier'),
  reuse(NCM8_CH6, '6.09', 'whole'),
  mk('over100', m302over100),
], 'Revision of Stage 4 (MA4-FRC-C-01).')

// ================================================================== 3.03 Profit, discounts and GST

function m303costs(): GameQuestion {
  for (;;) {
    const buy = 100 * int(10, 60)
    const extra = 100 * int(2, 20)
    const cost = buy + extra
    const p = pick([10, 15, 20, 25, 30, 40, 50])
    const profit = (cost * p) / 100
    if (!Number.isInteger(profit)) continue
    const sell = cost + profit
    return gq({
      t: 'costs',
      prompt: `${pick(['Priya', 'Omar', 'Zara', 'Kai'])} buys a car for ${b($(buy))}, spends ${b($(extra))} on repairs and sells it for ${b($(sell))}. What is the profit as a percentage of the total cost?`,
      correct: `${p}%`,
      // ignored the repairs, profit as a percentage of the selling price, the profit in hundreds
      wrong: [Math.round(((sell - buy) / buy) * 1000) / 10, Math.round((profit / sell) * 1000) / 10, p + 5, p * 2, Math.round((profit / buy) * 1000) / 10]
        .filter((x, i, a) => x !== p && x > 0 && a.indexOf(x) === i)
        .map((x) => `${num(x)}%`),
      why: `Total cost = ${$(buy)} + ${$(extra)} = ${$(cost)}. Profit = ${$(sell)} − ${$(cost)} = ${$(profit)}. ${$(profit)} ${DIVIDE} ${$(cost)} = ${p}%.`,
      meta: {},
    })
  }
}

const SET_303 = set('3.03', 'Profit, discounts and GST', 'Find profit and loss (as an amount and a percentage of cost), discounted prices, and GST.', [FRC], [
  reuse(NCM8_CH6, '6.10', 'profit'),
  reuse(NCM8_CH6, '6.10', 'pct'),
  reuse(NCM8_CH6, '6.10', 'gstAdd'),
  reuse(NCM8_CH6, '6.10', 'gstIn'),
  mk('costs', m303costs, 2),
], 'Revision of Stage 4 (MA4-FRC-C-01).')

// ================================================================== 3.04 Simple interest

function m304months(): GameQuestion {
  for (;;) {
    const P = pick([1200, 2400, 3000, 3600, 4800, 6000, 12_000])
    const r = pick([2, 3, 4, 5, 6, 8, 10])
    const m = pick([3, 4, 6, 8, 9, 18])
    const I = (P * r * m) / 1200
    if (!Number.isInteger(I)) continue
    return gq({
      t: 'months',
      prompt: `Find the simple interest on ${b($(P))} at ${b(`${r}% p.a.`)} for ${b(`${m} months`)}.`,
      correct: $(I),
      // months used as years, one year's interest, the interest for one month
      wrong: wrongNums(I, [(P * r * m) / 100, (P * r) / 100, (P * r) / 1200, P + I], $),
      why: `${m} months = ${m}/12 = ${num(m / 12)} years. ${$(P)} ${TIMES} ${r}% ${TIMES} ${num(m / 12)} = ${$(I)}.`,
      meta: {},
    })
  }
}

function m304time(): GameQuestion {
  for (;;) {
    const P = pick([500, 800, 1000, 2000, 2500, 4000, 5000])
    const r = pick([2, 4, 5, 6, 8, 10])
    const n = int(2, 8)
    const I = (P * r * n) / 100
    if (!Number.isInteger(I)) continue
    return gq({
      t: 'time',
      prompt: `For how many years must ${b($(P))} be invested at ${b(`${r}% p.a.`)} simple interest to earn ${b($(I))}?`,
      correct: `${n} years`,
      // divided by the rate only, by the principal only, one year's interest
      wrong: [I / r, Math.round((I / P) * 100) / 100, (P * r) / 100, n + 1, n * 2]
        .filter((x, i, a) => x !== n && x > 0 && a.indexOf(x) === i)
        .map((x) => `${num(x)} years`),
      why: `One year earns ${$(P)} ${TIMES} ${r}% = ${$((P * r) / 100)}. ${$(I)} ${DIVIDE} ${$((P * r) / 100)} = ${n} years.`,
      meta: {},
    })
  }
}

const SET_304 = set('3.04', 'Simple interest', 'Use I = Prn, with n in years (months ÷ 12), and rearrange it to find the time or rate.', [FIN], [
  reuse(NCM8_CH6, '6.11', 'formula'),
  reuse(NCM8_CH6, '6.11', 'interest'),
  reuse(NCM8_CH6, '6.11', 'total'),
  reuse(NCM8_CH6, '6.11', 'rate'),
  mk('months', m304months),
  mk('time', m304time, 2),
])

// ================================================================== 3.05 Ratios and rates (revision)

const SET_305 = set('3.05', 'Ratios and rates', 'Simplify ratios, share in a ratio and solve ratio problems.', [RAT], [
  reuse(NCM7_CH12, '12.02', 'simplify'),
  reuse(NCM7_CH12, '12.03', 'part'),
  reuse(NCM8_CH10, '10.04', 'three'),
  reuse(NCM8_CH10, '10.02', 'fraction'),
], 'Revision of Stage 4 (MA4-RAT-C-01).')

// ================================================================== 3.06 Converting rates

function m306reaction(): GameQuestion {
  const [kmh, ms] = pick([
    [36, 10],
    [54, 15],
    [72, 20],
    [90, 25],
    [108, 30],
  ])
  const t = pick([0.5, 0.8, 1, 1.2, 1.5, 2])
  const d = Math.round(ms * t * 100) / 100
  return gq({
    t: 'reaction',
    prompt: `A car travels at ${b(`${kmh} km/h`)}. How far does it go during a reaction time of ${b(`${num(t)} s`)}?`,
    correct: `${num(d)} m`,
    // km/h used as m/s, multiplied by 3.6 instead of dividing, the speed in m/s
    wrong: wrongNums(d, [kmh * t, Math.round(kmh * 3.6 * t * 100) / 100, ms, d * 10], (x) => `${num(x)} m`),
    why: `${kmh} km/h = ${kmh} ${DIVIDE} 3.6 = ${ms} m/s. In ${num(t)} s it goes ${ms} ${TIMES} ${num(t)} = ${num(d)} m.`,
    meta: {},
  })
}

const SET_306 = set('3.06', 'Converting rates', 'Convert rates between units, including km/h and m/s, and use them.', [RAT], [
  reuse(NCM8_CH10, '10.09', 'convert'),
  reuse(NCM8_CH10, '10.08', 'speed'),
  mk('reaction', m306reaction),
], 'Revision of Stage 4 (MA4-RAT-C-01).')

export const NCM9_CH3: GameChapter = {
  id: 'ncm9-ch3',
  number: 3,
  title: 'Numeracy and calculation',
  ref: 'NCM 9 Chapter 3',
  strand: 'Number and algebra',
  outcomes: [FIN],
  sets: [SET_301, SET_302, SET_303, SET_304, SET_305, SET_306],
  colour: 330,
  topics: [],
}

