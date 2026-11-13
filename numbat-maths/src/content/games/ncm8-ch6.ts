// Class games for New Century Maths 8 (3rd edition, Cengage) Chapter 6, Fractions and percentages: one set of quick
// questions for each exercise, 6.01 to 6.12.
//
// 6.01–6.06 revise Year 7 (NCM 7 Chapter 4), so those sets reuse its kinds (checked by that chapter's checks, see
// reuse.ts). New kinds: fractional percentages (12½% = ⅛), percentage increase and decrease, mark-ups, mental
// percentages, the unitary method, profit and loss, GST and simple interest (tests/game-checks/ncm8-ch6.ts).
//
// Syllabus: NSW Mathematics K–10 (2022), Stage 4 Fractions, decimals and percentages MA4-FRC-C-01 (6.01–6.10, 6.12:
// percentage increase and decrease, profit and loss, GST, the unitary method). 6.11 (simple interest) is Stage 5
// content (MA5-FIN-C-01) and is marked as extension.
import type { GameChapter, GameQuestion, GameSet } from '@/lib/game/types'
import { DIVIDE, TIMES, chance, frac, gq, int, mk, num, pick } from './helpers'
import { NCM7_CH4 } from './ncm7-ch4'
import { reuse } from './reuse'

const FRC = 'MA4-FRC-C-01'
const EXT_SI = 'Simple interest is Stage 5 content (MA5-FIN-C-01): extension for Year 8.'
const b = (s: string) => `<b>${s}</b>`
const it = (s: string) => `<i>${s}</i>`
/** money: whole dollars as "$45", otherwise with cents "$45.50" */
const $ = (x: number) => {
  const v = Math.round(x * 100) / 100
  return '$' + (Number.isInteger(v) ? num(v) : num(v, 2))
}
const pc = (x: number) => `${num(x)}%`
/** up to three different positive wrong values, likely first, then spares */
function wrongs(right: number, likely: number[], spare: number[] = [right * 2, right / 2, right + 10, right * 10]): number[] {
  const out: number[] = []
  for (const x of [...likely, ...spare]) {
    const v = Math.round(x * 100) / 100
    if (v > 0 && Math.abs(v - right) > 1e-9 && !out.includes(v)) out.push(v)
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
const R7 = (ex: string, t: string, as?: string) => reuse(NCM7_CH4, ex, t, as)

// ================================================================== 6.01–6.03 revision of Year 7 fractions

const SET_601 = set('6.01', 'Fractions', 'Convert between mixed numerals and improper fractions, simplify and compare fractions.', [FRC], [
  R7('4.01', 'equiv'),
  R7('4.01', 'simplify'),
  R7('4.01', 'mixed'),
  R7('4.01', 'improper'),
  R7('4.02', 'compare'),
])
const SET_602 = set('6.02', 'Adding and subtracting fractions', 'Add and subtract fractions and mixed numerals using a common denominator.', [FRC], [
  R7('4.03', 'same'),
  R7('4.03', 'related'),
  R7('4.03', 'unrelated'),
  R7('4.04', 'addMixed'),
  R7('4.04', 'subMixed'),
  R7('4.04', 'fromWhole'),
])
const SET_603 = set('6.03', 'Multiplying and dividing fractions', 'Multiply fractions (cancelling first) and divide by multiplying by the reciprocal.', [FRC], [
  R7('4.06', 'times'),
  R7('4.06', 'cancel'),
  R7('4.06', 'mixedTimes'),
  R7('4.07', 'reciprocal'),
  R7('4.07', 'divide'),
  R7('4.07', 'byWhole'),
])

// ================================================================== 6.04 Percentages, fractions and decimals

/** percentages with a fraction part, and their simplest fractions */
const SPECIAL: [string, number, number, number][] = [
  // shown, value, numerator, denominator
  ['12½%', 12.5, 1, 8],
  ['37½%', 37.5, 3, 8],
  ['62½%', 62.5, 5, 8],
  ['87½%', 87.5, 7, 8],
  ['33⅓%', 100 / 3, 1, 3],
  ['66⅔%', 200 / 3, 2, 3],
  ['2½%', 2.5, 1, 40],
  ['7½%', 7.5, 3, 40],
]

function m604special(): GameQuestion {
  const k = int(0, SPECIAL.length - 1)
  const [shown, , nn, d] = SPECIAL[k]
  const others = SPECIAL.filter((_, i) => i !== k)
  if (chance()) {
    return gq({
      t: 'special',
      prompt: `Write ${b(shown)} as a fraction in simplest form.`,
      correct: frac(nn, d),
      // a neighbouring special fraction, the percentage over 100 with the half dropped
      wrong: [...others.filter(([, , a, c]) => c === d || a === nn).map(([, , a, c]) => frac(a, c)), frac(Math.floor(SPECIAL[k][1]), 100), ...others.map(([, , a, c]) => frac(a, c))],
      why: `${shown} means ${shown.slice(0, -1)} out of 100, and ${nn}/${d} ${TIMES} 100% = ${shown}. So ${shown} = ${nn}/${d}.`,
      meta: {},
    })
  }
  return gq({
    t: 'special',
    prompt: `Write ${frac(nn, d)} as a percentage.`,
    correct: shown,
    wrong: [...others.filter(([, , a, c]) => c === d).map(([s]) => s), ...others.map(([s]) => s)],
    why: `${nn}/${d} ${TIMES} 100% = ${shown}.`,
    meta: {},
  })
}

const SET_604 = set('6.04', 'Percentages, fractions and decimals', 'Convert between percentages, fractions and decimals, including percentages such as 12½%.', [FRC], [
  R7('4.10', 'toPct'),
  R7('4.10', 'toFrac'),
  R7('4.10', 'toDec'),
  R7('4.10', 'order'),
  mk('special', m604special, 2),
])

// ================================================================== 6.05, 6.06 revision: fractions and percentages of quantities

const SET_605 = set('6.05', 'Fraction and percentage of a quantity', 'Find a fraction or percentage of an amount.', [FRC], [
  R7('4.05', 'of'),
  R7('4.05', 'story'),
  R7('4.11', 'pctOf'),
  R7('4.11', 'story', 'pctStory'),
])
const SET_606 = set('6.06', 'Expressing amounts as fractions and percentages', 'Write one amount as a fraction or percentage of another, in the same units.', [FRC], [
  R7('4.12', 'asFrac'),
  R7('4.12', 'asPct'),
  R7('4.12', 'pctUnits'),
])

// ================================================================== 6.07 Percentage increase and decrease

/** a percentage and an amount for which the change is a whole number of dollars */
function change(): { p: number; x: number; d: number } {
  for (;;) {
    const p = pick([5, 10, 15, 20, 25, 30, 40, 50, 12.5, 75])
    const x = pick([20, 40, 60, 80, 120, 160, 200, 240, 300, 400, 500, 640, 800])
    const d = (x * p) / 100
    if (Number.isInteger(d)) return { p, x, d }
  }
}

function m607increase(): GameQuestion {
  const { p, x, d } = change()
  return gq({
    t: 'increase',
    prompt: `Increase ${b($(x))} by ${b(pc(p))}.`,
    correct: $(x + d),
    // only the increase, decreased instead, added the percentage as dollars
    wrong: wrongs(x + d, [d, x - d, x + p]).map($),
    why: `${pc(p)} of ${$(x)} is ${$(d)}. ${$(x)} + ${$(d)} = ${$(x + d)}.`,
    meta: {},
  })
}

function m607decrease(): GameQuestion {
  const { p, x, d } = change()
  const thing = pick(['A jacket priced at', 'A bike priced at', 'A phone priced at', 'A concert ticket priced at'])
  const story = chance()
  return gq({
    t: 'decrease',
    prompt: story ? `${thing} ${b($(x))} is reduced by ${b(pc(p))}. What is the new price?` : `Decrease ${b($(x))} by ${b(pc(p))}.`,
    correct: $(x - d),
    // only the decrease, increased instead, took the percentage as dollars
    wrong: wrongs(x - d, [d, x + d, x - p]).map($),
    why: `${pc(p)} of ${$(x)} is ${$(d)}. ${$(x)} − ${$(d)} = ${$(x - d)}.`,
    meta: {},
  })
}

function m607multiplier(): GameQuestion {
  const p = pick([3, 4, 5, 6, 8, 12, 15, 20, 25, 30, 35, 40])
  const up = chance()
  const right = up ? 1 + p / 100 : 1 - p / 100
  const show = (m: number) => `${TIMES} ${num(Math.round(m * 10000) / 10000)}`
  // the percentage as a whole number, the change on its own, the other direction, a decimal place out
  const cand = [up ? 1 - p / 100 : 1 + p / 100, p / 100, 1 + p / 10, up ? p / 10 : 1 - p / 10, p]
  const out: string[] = []
  for (const c of cand) if (c > 0 && Math.abs(c - right) > 1e-9 && !out.includes(show(c))) out.push(show(c))
  return gq({
    t: 'multiplier',
    prompt: `Which calculation ${up ? 'increases' : 'decreases'} an amount by ${b(pc(p))}?`,
    correct: show(right),
    wrong: out,
    why: up ? `100% + ${p}% = ${100 + p}% = ${num(right)}.` : `100% − ${p}% = ${100 - p}% = ${num(right)}.`,
    meta: {},
  })
}

function m607markup(): GameQuestion {
  const { p, x, d } = change()
  const who = pick(['A shop buys a lamp', 'A bakery makes a cake', 'A store buys a pair of jeans', 'A dealer buys a guitar'])
  return gq({
    t: 'markup',
    prompt: `${who} for ${b($(x))} and marks it up by ${b(pc(p))}. What is the selling price?`,
    correct: $(x + d),
    wrong: wrongs(x + d, [d, x - d, x + p]).map($),
    why: `The mark-up is ${pc(p)} of ${$(x)} = ${$(d)}. Selling price = ${$(x)} + ${$(d)} = ${$(x + d)}.`,
    meta: {},
  })
}

const SET_607 = set('6.07', 'Percentage increase and decrease', 'Increase or decrease an amount by a percentage, including mark-ups, and use a multiplier such as × 1.15.', [FRC], [
  mk('increase', m607increase),
  mk('decrease', m607decrease),
  mk('markup', m607markup),
  mk('multiplier', m607multiplier, 2),
])

// ================================================================== 6.08 Percentages without calculators

const MENTAL: [number, string][] = [
  [50, 'halve it'],
  [25, 'halve it, then halve again'],
  [75, 'find 25% and multiply by 3'],
  [10, 'divide by 10'],
  [5, 'find 10% and halve it'],
  [1, 'divide by 100'],
  [20, 'find 10% and double it'],
  [15, 'add 10% and 5%'],
  [12.5, 'find 25% and halve it'],
  [2.5, 'find 5% and halve it'],
]

function m608mental(): GameQuestion {
  for (;;) {
    const [p, how] = pick(MENTAL)
    const x = pick([40, 60, 80, 120, 160, 200, 240, 300, 320, 400, 480, 600, 800, 1000, 1200])
    const ans = (x * p) / 100
    if (!Number.isInteger(ans)) continue
    const money = chance()
    const show = (v: number) => (money ? $(v) : num(v))
    return gq({
      t: 'mental',
      prompt: `Without a calculator, find ${b(pc(p))} of ${b(show(x))}.`,
      correct: show(ans),
      // a power of 10 out, the rest, the percentage as an amount
      wrong: wrongs(ans, [ans * 10, x - ans, ans / 10, ans + p]).map(show),
      why: `To find ${pc(p)}, ${how}: ${pc(p)} of ${show(x)} = ${show(ans)}.`,
      meta: {},
    })
  }
}

const SET_608 = set('6.08', 'Percentages without calculators', 'Find percentages mentally from 50%, 25%, 10%, 5% and 1%.', [FRC], [
  mk('mental', m608mental),
  R7('4.11', 'tenPct'),
  R7('4.11', 'pctOf'),
])

// ================================================================== 6.09 The unitary method

function unitary(): { p: number; whole: number; part: number } {
  for (;;) {
    const p = pick([5, 8, 10, 12, 15, 20, 25, 30, 40, 60, 75])
    const whole = pick([40, 60, 80, 120, 150, 200, 240, 300, 400, 500, 600, 800, 1200, 1500])
    const part = (whole * p) / 100
    if (Number.isInteger(part)) return { p, whole, part }
  }
}

function m609onePct(): GameQuestion {
  const { p, whole, part } = unitary()
  return gq({
    t: 'onePct',
    prompt: `${b(pc(p))} of an amount is ${b(num(part))}. What is ${b('1%')} of the amount?`,
    correct: num(whole / 100),
    // multiplied, the whole amount, divided the wrong way
    wrong: wrongs(whole / 100, [part * p, whole, p / part, part / 10]).map((v) => num(v)),
    why: `Divide by ${p}: 1% is ${num(part)} ${DIVIDE} ${p} = ${num(whole / 100)}.`,
    meta: {},
  })
}

function m609whole(): GameQuestion {
  const { p, whole, part } = unitary()
  const money = chance()
  const show = (v: number) => (money ? $(v) : num(v))
  return gq({
    t: 'whole',
    prompt: `${b(pc(p))} of an amount is ${b(show(part))}. What is the whole amount?`,
    correct: show(whole),
    // p% of the part, 1% only, part + p
    wrong: wrongs(whole, [(part * p) / 100, whole / 100, part + p, part * p]).map(show),
    why: `1% is ${show(part)} ${DIVIDE} ${p} = ${show(whole / 100)}, so 100% is ${show(whole / 100)} ${TIMES} 100 = ${show(whole)}.`,
    meta: {},
  })
}

function m609story(): GameQuestion {
  const { p, whole, part } = unitary()
  const k = int(0, 2)
  const prompt = [
    `A deposit of ${b(pc(p))} on a fridge is ${b($(part))}. What is the full price of the fridge?`,
    `${b(num(part))} people at a concert were under 18. This was ${b(pc(p))} of the crowd. How big was the crowd?`,
    `Mia has saved ${b($(part))}, which is ${b(pc(p))} of the cost of a trip. What does the trip cost?`,
  ][k]
  const show = (v: number) => (k === 1 ? num(v) : $(v))
  return gq({
    t: 'story',
    prompt,
    correct: show(whole),
    wrong: wrongs(whole, [(part * p) / 100, part + (part * p) / 100, whole / 100, part * p]).map(show),
    why: `${pc(p)} is ${show(part)}, so 1% is ${show(whole / 100)} and 100% is ${show(whole)}.`,
    meta: {},
  })
}

function m609after(): GameQuestion {
  for (;;) {
    const p = pick([10, 20, 25, 40, 50])
    const whole = pick([40, 60, 80, 100, 120, 160, 200, 240, 300, 400])
    const now = (whole * (100 - p)) / 100
    if (!Number.isInteger(now)) continue
    return gq({
      t: 'after',
      prompt: `After a ${b(pc(p))} discount, a pair of shoes costs ${b($(now))}. What was the original price?`,
      correct: $(whole),
      // added p% of the sale price back on, the discount only, the sale price plus p dollars
      wrong: wrongs(whole, [now + (now * p) / 100, now + p, (now * p) / 100, now * 2]).map($),
      why: `The sale price is ${100 - p}% of the original. 1% is ${$(now)} ${DIVIDE} ${100 - p} = ${$(whole / 100)}, so 100% is ${$(whole)}.`,
      meta: {},
    })
  }
}

const SET_609 = set('6.09', 'The unitary method', 'Find 1% first, then 100%: work back from a percentage to the whole amount.', [FRC], [
  mk('onePct', m609onePct),
  mk('whole', m609whole),
  mk('story', m609story),
  mk('after', m609after, 2),
])

// ================================================================== 6.10 Profit, loss and GST

function m610profit(): GameQuestion {
  const cost = 10 * int(3, 60)
  let sell = 10 * int(3, 60)
  if (sell === cost) sell += 20
  const gain = sell > cost
  const amt = Math.abs(sell - cost)
  const item = pick(['a bike', 'a guitar', 'a skateboard', 'a laptop', 'a surfboard'])
  const word = gain ? 'profit' : 'loss'
  return gq({
    t: 'profit',
    prompt: `Sam bought ${item} for ${b($(cost))} and sold it for ${b($(sell))}. What was the profit or loss?`,
    correct: `${word} of ${$(amt)}`,
    wrong: [`${gain ? 'loss' : 'profit'} of ${$(amt)}`, `${word} of ${$(sell)}`, `${word} of ${$(cost + sell)}`, `${gain ? 'loss' : 'profit'} of ${$(sell)}`, `${word} of ${$(cost)}`, `${word} of ${$(2 * amt)}`],
    why: `${gain ? 'Sold for more than it cost: profit' : 'Sold for less than it cost: loss'} = ${$(Math.max(sell, cost))} − ${$(Math.min(sell, cost))} = ${$(amt)}.`,
    meta: {},
  })
}

function m610pct(): GameQuestion {
  for (;;) {
    const cost = pick([20, 40, 50, 80, 100, 120, 200, 250, 400, 500])
    const p = pick([5, 10, 20, 25, 30, 40, 50])
    const amt = (cost * p) / 100
    if (!Number.isInteger(amt)) continue
    const gain = chance()
    const sell = gain ? cost + amt : cost - amt
    return gq({
      t: 'pct',
      prompt: `An item that cost ${b($(cost))} is sold for ${b($(sell))}. What is the ${gain ? 'profit' : 'loss'} as a percentage of the cost price?`,
      correct: pc(p),
      // as a percentage of the selling price, the amount as a percentage, the other way round
      wrong: [pc(Math.round((amt / sell) * 1000) / 10), pc(amt), pc(Math.round((sell / cost) * 1000) / 10), pc(p * 2), pc(p / 2), pc(100 - p), pc(p + 10)].filter((x) => x !== pc(p)),
      why: `${gain ? 'Profit' : 'Loss'} = ${$(amt)}. ${$(amt)} ÷ ${$(cost)} ${TIMES} 100% = ${pc(p)}.`,
      meta: {},
    })
  }
}

function m610gstAdd(): GameQuestion {
  const pre = pick([20, 30, 40, 50, 60, 80, 90, 120, 150, 200, 250, 300, 450, 600, 800])
  return gq({
    t: 'gstAdd',
    prompt: `A plumber charges ${b($(pre))} plus GST (10%). What is the total price including GST?`,
    correct: $(pre * 1.1),
    // the GST alone, 1% added, 10 dollars added
    wrong: wrongs(pre * 1.1, [pre * 0.1, pre + 10, pre * 1.01, pre * 0.9]).map($),
    why: `GST = 10% of ${$(pre)} = ${$(pre * 0.1)}. Total = ${$(pre)} + ${$(pre * 0.1)} = ${$(pre * 1.1)}.`,
    meta: {},
  })
}

function m610gstIn(): GameQuestion {
  const pre = pick([10, 20, 30, 40, 50, 60, 80, 100, 120, 150, 200, 300])
  const total = pre * 1.1
  return gq({
    t: 'gstIn',
    prompt: `A price of ${b($(total))} includes 10% GST. How much of the price is GST?`,
    correct: $(pre * 0.1),
    // 10% of the total (the common mistake), the price before GST, 11% of it
    wrong: wrongs(pre * 0.1, [total * 0.1, pre, total * 0.11, total / 10 + 1]).map($),
    why: `The price is 110% of the price before GST, so GST = ${$(total)} ${DIVIDE} 11 = ${$(pre * 0.1)} (not 10% of ${$(total)}).`,
    meta: {},
  })
}

const SET_610 = set('6.10', 'Profit, loss and GST', 'Find profit and loss (also as a percentage of the cost price), add 10% GST, and find the GST in a price.', [FRC], [
  mk('profit', m610profit),
  mk('gstAdd', m610gstAdd),
  mk('pct', m610pct),
  mk('gstIn', m610gstIn, 2),
])

// ================================================================== 6.11 Simple interest (extension)

function si(): { P: number; r: number; n: number; I: number } {
  for (;;) {
    const P = pick([200, 400, 500, 600, 800, 1000, 1200, 1500, 2000, 2500, 3000, 4000, 5000])
    const r = pick([2, 3, 4, 5, 6, 8, 10])
    const n = int(2, 6)
    const I = (P * r * n) / 100
    if (Number.isInteger(I)) return { P, r, n, I }
  }
}

function m611interest(): GameQuestion {
  const { P, r, n, I } = si()
  return gq({
    t: 'interest',
    prompt: `Find the simple interest on ${b($(P))} at ${b(`${r}% p.a.`)} for ${b(`${n} years`)}.`,
    correct: $(I),
    // one year only, the total amount, forgot to divide by 100
    wrong: wrongs(I, [I / n, P + I, P * r * n, I * 10]).map($),
    why: `${it('I')} = ${it('Prn')} = ${$(P)} ${TIMES} ${r}% ${TIMES} ${n} = ${$(P * (r / 100))} ${TIMES} ${n} = ${$(I)}.`,
    meta: {},
  })
}

function m611total(): GameQuestion {
  const { P, r, n, I } = si()
  return gq({
    t: 'total',
    prompt: `Jo borrows ${b($(P))} at ${b(`${r}% p.a.`)} simple interest for ${b(`${n} years`)}. How much does Jo pay back altogether?`,
    correct: $(P + I),
    // the interest only, one year's interest added, n years of r% compounded… kept simple: P × r
    wrong: wrongs(P + I, [I, P + I / n, P * r, P + r * n]).map($),
    why: `Interest = ${$(P)} ${TIMES} ${r}% ${TIMES} ${n} = ${$(I)}. Total = ${$(P)} + ${$(I)} = ${$(P + I)}.`,
    meta: {},
  })
}

const m611formula = () =>
  gq({
    t: 'formula',
    prompt: `In the simple interest formula ${it('I')} = ${it('Prn')}, what does ${it('n')} stand for?`,
    correct: 'the number of time periods (years)',
    wrong: ['the amount borrowed or invested', 'the interest rate', 'the total paid back'],
    why: 'P is the principal, r the interest rate per period and n the number of periods.',
    meta: { v: 'n' },
  })

function m611rate(): GameQuestion {
  const { P, r, n, I } = si()
  return gq({
    t: 'rate',
    prompt: `${b($(P))} earns ${b($(I))} simple interest in ${b(`${n} years`)}. What is the interest rate per year?`,
    correct: `${r}% p.a.`,
    wrong: [r * n, r * 2, Math.round((I / P) * 1000) / 10, r + 1, r - 1].filter((x) => x > 0 && x !== r).map((x) => `${num(x)}% p.a.`),
    why: `Each year earns ${$(I)} ${DIVIDE} ${n} = ${$(I / n)}, and ${$(I / n)} ÷ ${$(P)} = ${r}%.`,
    meta: {},
  })
}

const SET_611 = set('6.11', 'Simple interest', 'Use I = Prn to find simple interest, the total repaid and the interest rate.', [], [
  mk('formula', m611formula),
  mk('interest', m611interest),
  mk('total', m611total),
  mk('rate', m611rate, 2),
], { teacherNote: EXT_SI })

// ================================================================== 6.12 Percentage problems

function m612rest(): GameQuestion {
  for (;;) {
    const p = pick([20, 25, 30, 40, 45, 55, 60, 65, 70, 75, 80])
    const total = pick([200, 240, 300, 400, 500, 600, 800, 1000, 1200])
    const part = (total * p) / 100
    if (!Number.isInteger(part)) continue
    const k = int(0, 2)
    const [prompt, ask] = [
      [`At a school of ${b(num(total))} students, ${b(pc(p))} are girls. How many students are boys?`, 'boys'],
      [`In a box of ${b(num(total))} apples, ${b(pc(p))} are red and the rest are green. How many are green?`, 'green'],
      [`Of ${b(num(total))} people surveyed, ${b(pc(p))} said yes and the rest said no. How many said no?`, 'no'],
    ][k]
    return gq({
      t: 'rest',
      prompt,
      correct: num(total - part),
      // the part asked about, (100 − p) as a number, half
      wrong: wrongs(total - part, [part, 100 - p, total / 2, total - p]).map((v) => num(v)),
      why: `${100 - p}% are ${ask}: ${100 - p}% of ${num(total)} = ${num(total - part)}. (Or ${num(total)} − ${num(part)}.)`,
      meta: {},
    })
  }
}

const SET_612 = set('6.12', 'Percentage problems', 'Choose the right method for a mix of percentage problems.', [FRC], [
  mk('rest', m612rest),
  mk('decrease', m607decrease),
  R7('4.12', 'asPct'),
  mk('whole', m609whole, 2),
])

export const NCM8_CH6: GameChapter = {
  id: 'ncm8-ch6',
  number: 6,
  title: 'Fractions and percentages',
  ref: 'NCM 8 Chapter 6',
  strand: 'Number and algebra',
  outcomes: [FRC],
  sets: [SET_601, SET_602, SET_603, SET_604, SET_605, SET_606, SET_607, SET_608, SET_609, SET_610, SET_611, SET_612],
  colour: 330,
  topics: [],
}
