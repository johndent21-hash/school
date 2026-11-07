// Year 9 Earning money, following New Century Maths 9 (3rd edition, Cengage) Chapter 8 exercise by exercise.
// The questions are the site's own: they practise the same kinds of question as each exercise, in the same
// easy-to-hard order (Foundation = the start of the exercise, Challenge = the end), but none of the textbook's
// wording or numbers are copied.
// Syllabus: MA5-FIN-C-01 (Stage 5 core, financial mathematics: earning money and tax).
// Tax: the textbook prints the 2023–24 resident tax table. These questions use the 2026–27 resident rates instead
// (the 15% bracket from 1 July 2026), plus the 2% Medicare levy, with the year shown on every table. PAYG amounts
// are given in the question rather than read from the ATO's weekly withholding schedule.
// Conventions as in NCM 9: 52 weeks a year for wage earners, 52.18 for salary earners; each question says which.
import type { Level, Question, Skill, TestItem } from '@/lib/maths/types'
import { D, chance, int, mcA, mcFixedA, name, num, numA, pick, q, random, sample } from './helpers'

const FIN = ['MA5-FIN-C-01']
const ref = (e: string) => `NCM 9 Ex ${e}`
const big = (s: string) => `<div class="big">${s}</div>`
/** dollars and cents with NSW digit grouping: $1 234.50 */
const $ = (x: number, cents = true) => '$' + num(Math.round(x * 100) / 100, cents ? 2 : undefined)
/** round to the nearest cent, exactly as a person would (half-cents up) */
const cent = (x: number) => Math.round(Number((x * 100).toFixed(6))) / 100
const money = (value: number) => ({ answer: numA(cent(value), 2), prefix: '$' })

// ---------------------------------------------------------------- 2026–27 resident tax (ATO), in whole cents

export const TAX_YEAR = '2026–27'
export const BRACKETS: [number, number, number, number][] = [
  // [from, to, base tax in dollars, cents per dollar over `from − 1`]
  [0, 18200, 0, 0],
  [18201, 45000, 0, 15],
  [45001, 135000, 4020, 30],
  [135001, 190000, 31020, 37],
  [190001, Infinity, 51370, 45],
]
/** income tax in cents on a whole-dollar taxable income */
export function taxCents(ti: number): number {
  const b = BRACKETS.find(([lo, hi]) => ti >= lo && ti <= hi)!
  return b[2] * 100 + b[3] * (ti - (b[0] - 1))
}
const medicareCents = (ti: number) => 2 * ti
function taxTable(): string {
  // non-breaking spaces inside amounts, so $45 000 never splits across two lines
  const nb = (x: number) => num(x).replace(/ /g, '\u00a0')
  const rows = BRACKETS.map(([lo, hi, base, c]) => [
    hi === Infinity ? `$${nb(lo)} and over` : lo === 0 ? `$0 – $${nb(hi)}` : `$${nb(lo)} – $${nb(hi)}`,
    c === 0 ? 'Nil' : base === 0 ? `${c}c for each $1 over $${nb(lo - 1)}` : `$${nb(base)} plus ${c}c for each $1 over $${nb(lo - 1)}`,
  ])
  return `<p class="text-sm"><b>Resident tax rates ${TAX_YEAR}</b> (ATO). The Medicare levy of 2% of taxable income is extra.</p>` + D.table(['Taxable income', 'Tax on this income'], rows)
}

// ================================================================= 8.01 Wages and salaries

function wages(level: Level): Question {
  const who = name()
  if (level === 1) {
    const kind = pick(['week', 'week', 'days', 'annualFromWeek', 'annualFromMonth'] as const)
    if (kind === 'annualFromMonth') {
      const m = int(40, 120) * 100 + pick([0, 25, 50, 75])
      return q({ prompt: `${who} earns ${$(m, false)} per month. What is ${who}’s annual salary?`, ...money(12 * m), hint: 'There are 12 months in a year.', steps: [`12 × ${$(m)} = ${$(12 * m)}`], meta: { t: 'fin', kind, m } })
    }
    if (kind === 'annualFromWeek') {
      const w = int(900, 2400)
      return q({ prompt: `${who} earns ${$(w, false)} per week. What is this per year? (Use 52 weeks in a year.)`, ...money(52 * w), hint: 'Multiply the weekly amount by 52.', steps: [`52 × ${$(w)} = ${$(52 * w)}`], meta: { t: 'fin', kind, w } })
    }
    const rate = int(1700, 4500) / 100
    if (kind === 'days') {
      const days = pick([3, 4, 5])
      const h = pick([6, 7, 7.5, 8])
      const total = cent(days * h * rate)
      return q({ prompt: `${who} works ${num(h)} hours a day for ${days} days a week and is paid ${$(rate)} per hour. Find ${who}’s weekly wage.`, ...money(total), hint: 'Find the hours in the week first, then multiply by the hourly rate.', steps: [`Hours = ${days} × ${num(h)} = ${num(days * h)}`, `Wage = ${num(days * h)} × ${$(rate)} = ${$(total)}`], meta: { t: 'fin', kind, days, h, rate } })
    }
    const h = pick([20, 25, 30, 35, 36, 37.5, 38, 38.5, 40])
    const total = cent(h * rate)
    return q({ prompt: `${who} earns ${$(rate)} per hour and works ${num(h)} hours in a week. What is ${who}’s weekly wage?`, ...money(total), hint: 'Weekly wage = hours × hourly rate.', steps: [`${num(h)} × ${$(rate)} = ${$(total)}`], meta: { t: 'fin', kind: 'week', h, rate } })
  }
  if (level === 2) {
    const kind = pick(['salaryWeek', 'salaryFortnight', 'salaryMonth', 'compare', 'hourly'] as const)
    const sal = int(52, 160) * 1000 + pick([0, 140, 360, 500, 780])
    if (kind === 'salaryWeek' || kind === 'salaryFortnight') {
      const wk = cent(sal / 52.18)
      const value = kind === 'salaryWeek' ? wk : cent(2 * wk)
      return q({ prompt: `${who} earns a salary of ${$(sal, false)} p.a. How much is this ${kind === 'salaryWeek' ? 'per week' : 'per fortnight'}, correct to the nearest cent? (Use 52.18 weeks in a year${kind === 'salaryFortnight' ? ', and 1 fortnight = 2 weeks' : ''}.)`, ...money(value), calc: true, hint: 'Salary ÷ 52.18 gives the weekly amount.' + (kind === 'salaryFortnight' ? ' Round the weekly amount to the cent, then double it.' : ''), steps: [`${$(sal)} ÷ 52.18 = ${$(sal / 52.18)}… ≈ ${$(wk)} per week`, ...(kind === 'salaryFortnight' ? [`2 × ${$(wk)} = ${$(value)} per fortnight`] : [])], meta: { t: 'fin', kind, sal } })
    }
    if (kind === 'salaryMonth') return q({ prompt: `${who} earns a salary of ${$(sal, false)} p.a. How much is this per month, correct to the nearest cent?`, ...money(sal / 12), calc: true, hint: 'There are 12 months in a year.', steps: [`${$(sal)} ÷ 12 = ${$(cent(sal / 12))}`], meta: { t: 'fin', kind, sal } })
    if (kind === 'compare') {
      const salary = sal
      const fort = int(1800, 6000)
      const wkA = cent(salary / 52.18)
      const wkB = cent(fort / 2)
      if (Math.abs(wkA - wkB) < 1) return wages(level)
      return q({
        prompt: `Job A pays a salary of ${$(salary, false)} p.a. Job B pays ${$(fort, false)} per fortnight. Which job pays more per week? (Use 52.18 weeks in a year.)`,
        answer: mcFixedA(['Job A', 'Job B'], wkA > wkB ? 'Job A' : 'Job B'),
        calc: true,
        hint: 'Change both to weekly amounts: salary ÷ 52.18, and fortnightly ÷ 2.',
        steps: [`Job A: ${$(salary)} ÷ 52.18 ≈ ${$(wkA)} per week`, `Job B: ${$(fort)} ÷ 2 = ${$(wkB)} per week`, `${wkA > wkB ? 'Job A' : 'Job B'} pays ${$(Math.abs(wkA - wkB))} more per week.`],
        meta: { t: 'fin', kind, salary, fort },
      })
    }
    const h = pick([30, 35, 36, 38, 40])
    const pay = cent(h * (int(2200, 5200) / 100))
    return q({ prompt: `${who} was paid ${$(pay)} for working ${h} hours. What is ${who}’s hourly rate of pay?`, ...money(pay / h), calc: true, hint: 'Hourly rate = pay ÷ hours.', steps: [`${$(pay)} ÷ ${h} = ${$(cent(pay / h))}`], meta: { t: 'fin', kind, pay, h } })
  }
  // level 3: shifts across midnight, timesheets, hourly rate from a salary
  const kind = pick(['shift', 'timesheet', 'salaryHourly'] as const)
  if (kind === 'shift') {
    const start = pick([18, 19, 20, 21, 22])
    const startMin = pick([0, 0, 30])
    const end = pick([2, 3, 4, 5, 6])
    const before = 24 - start - startMin / 60
    const after = end + pick([0, 0, 0.5])
    const r1 = int(1500, 3200) / 100
    const r2 = cent(r1 * pick([1.25, 1.5]))
    const total = cent(before * r1 + after * r2)
    const fmt = (h: number) => `${((Math.floor(h) + 11) % 12) + 1}:${String(Math.round((h % 1) * 60)).padStart(2, '0')} ${h >= 12 ? 'p.m.' : 'a.m.'}`
    return q({
      prompt: `${who} is paid ${$(r1)} per hour before midnight and ${$(r2)} per hour after midnight. How much does ${who} earn for a shift from ${fmt(start + startMin / 60)} to ${fmt(after)}?`,
      ...money(total),
      calc: true,
      hint: 'Split the shift at midnight and work out each part at its own rate.',
      steps: [`Before midnight: ${num(before)} h × ${$(r1)} = ${$(cent(before * r1))}`, `After midnight: ${num(after)} h × ${$(r2)} = ${$(cent(after * r2))}`, `Total = ${$(total)}`],
      meta: { t: 'fin', kind, before, after, r1, r2 },
    })
  }
  if (kind === 'timesheet') {
    const rate = int(2200, 3200) / 100
    const sat = cent(rate * 1.5)
    const days = sample(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], int(3, 4))
    const order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    days.sort((a, b) => order.indexOf(a) - order.indexOf(b))
    const rows: [string, number, number][] = days.map((d) => {
      const s = pick([6.5, 7, 7.5, 8, 8.5, 9, 11])
      return [d, s, s + pick([5, 5.5, 6, 7, 7.5, 8, 8.5])]
    })
    rows.push(['Saturday', pick([8, 9, 10, 10.5]), 0])
    rows[rows.length - 1][2] = rows[rows.length - 1][1] + pick([4, 5, 6])
    const t = (h: number) => `${((Math.floor(h) + 11) % 12) + 1}:${h % 1 ? '30' : '00'} ${h >= 12 ? 'p.m.' : 'a.m.'}`
    const weekday = rows.slice(0, -1).reduce((s, r) => s + r[2] - r[1], 0)
    const satH = rows[rows.length - 1][2] - rows[rows.length - 1][1]
    const total = cent(weekday * rate + satH * sat)
    return q({
      prompt: `${who} is paid ${$(rate)} per hour on weekdays and ${$(sat)} per hour on Saturdays. Find ${who}’s total pay for this week.`,
      diagram: D.table(['Day', 'Hours worked'], rows.map((r) => [r[0], `${t(r[1])} – ${t(r[2])}`])),
      ...money(total),
      calc: true,
      hint: 'Work out the hours for each day, add the weekday hours, then multiply each total by its rate.',
      steps: [`Weekday hours = ${num(weekday)}, Saturday hours = ${num(satH)}`, `${num(weekday)} × ${$(rate)} + ${num(satH)} × ${$(sat)} = ${$(total)}`],
      meta: { t: 'fin', kind, rows, rate, sat },
    })
  }
  const sal = int(60, 140) * 1000
  const h = pick([35, 36, 37.5, 38, 40])
  const hourly = cent(sal / 52.18 / h)
  return q({ prompt: `${who} earns a salary of ${$(sal, false)} p.a. and works ${num(h)} hours a week. Find ${who}’s hourly rate of pay, correct to the nearest cent. (Use 52.18 weeks in a year.)`, ...money(sal / 52.18 / h), calc: true, hint: 'Find the weekly amount (÷ 52.18), then divide by the hours in a week.', steps: [`${$(sal)} ÷ 52.18 ÷ ${num(h)} = ${$(hourly)}`], meta: { t: 'fin', kind, sal, h } })
}

// ================================================================= 8.02 Overtime pay

function overtime(level: Level): Question {
  const who = name()
  const rate = int(2000, 4200) / 100
  if (level === 1) {
    const normal = pick([35, 36, 38, 40])
    const ot = int(2, 8)
    const mult = pick([1.5, 1.5, 2])
    const total = cent(normal * rate + ot * rate * mult)
    return q({
      prompt: `${who} works ${normal} hours at ${$(rate)} per hour and ${ot} hours of overtime at ${mult === 1.5 ? 'time-and-a-half' : 'double time'}. Calculate ${who}’s total pay.`,
      ...money(total),
      calc: true,
      hint: `${mult === 1.5 ? 'Time-and-a-half is 1.5' : 'Double time is 2'} × the normal rate.`,
      steps: [`Normal pay = ${normal} × ${$(rate)} = ${$(cent(normal * rate))}`, `Overtime = ${ot} × ${$(rate)} × ${mult} = ${$(cent(ot * rate * mult))}`, `Total = ${$(total)}`],
      meta: { t: 'fin', kind: 'ot', normal, ot, mult, rate },
    })
  }
  if (level === 2) {
    if (chance()) {
      const wk = pick([35, 36, 38])
      const sat = int(3, 8)
      const sun = int(2, 6)
      const total = cent(wk * rate + sat * rate * 1.5 + sun * rate * 2)
      return q({
        prompt: `${who} is paid ${$(rate)} per hour, time-and-a-half on Saturdays and double time on Sundays. This week ${who} worked ${wk} hours from Monday to Friday, ${sat} hours on Saturday and ${sun} hours on Sunday. Calculate the total pay.`,
        ...money(total),
        calc: true,
        hint: 'Work out each day type separately, then add.',
        steps: [`Weekdays: ${wk} × ${$(rate)} = ${$(cent(wk * rate))}`, `Saturday: ${sat} × ${$(rate)} × 1.5 = ${$(cent(sat * rate * 1.5))}`, `Sunday: ${sun} × ${$(rate)} × 2 = ${$(cent(sun * rate * 2))}`, `Total = ${$(total)}`],
        meta: { t: 'fin', kind: 'weekend', wk, sat, sun, rate },
      })
    }
    const hours = int(39, 46)
    const n1 = Math.min(hours, 38)
    const n2 = Math.min(Math.max(hours - 38, 0), 3)
    const n3 = Math.max(hours - 41, 0)
    const total = cent(n1 * rate + n2 * rate * 1.5 + n3 * rate * 2)
    return q({
      prompt: `An award pays ${$(rate)} per hour for the first 38 hours in a week, time-and-a-half for the next 3 hours, and double time for every hour after that. How much does ${who} earn for working ${hours} hours?`,
      ...money(total),
      calc: true,
      hint: 'Split the hours: the first 38, the next 3 (up to 41), and the rest.',
      steps: [`38 × ${$(rate)} = ${$(cent(n1 * rate))}`, `${n2} × ${$(rate)} × 1.5 = ${$(cent(n2 * rate * 1.5))}`, ...(n3 ? [`${n3} × ${$(rate)} × 2 = ${$(cent(n3 * rate * 2))}`] : []), `Total = ${$(total)}`],
      meta: { t: 'fin', kind: 'award', hours, rate },
    })
  }
  // level 3: the hourly rate from the total
  const normal = 38
  const a = int(2, 6)
  const b = int(1, 5)
  const eq = normal + 1.5 * a + 2 * b
  const total = cent(eq * rate)
  return q({
    prompt: `Last week ${who} worked ${normal} normal hours, ${a} hours at time-and-a-half and ${b} hour${b === 1 ? '' : 's'} at double time, and was paid ${$(total)}. What is ${who}’s normal hourly rate of pay?`,
    ...money(rate),
    calc: true,
    hint: 'Change everything to the equivalent number of normal hours, then divide the pay by it.',
    steps: [`Equivalent hours = ${normal} + ${a} × 1.5 + ${b} × 2 = ${num(eq)}`, `Rate = ${$(total)} ÷ ${num(eq)} = ${$(rate)}`],
    meta: { t: 'fin', kind: 'rateFromTotal', a, b, total },
  })
}

// ================================================================= 8.03 Commission, piecework and leave loading

function commission(level: Level): Question {
  const who = name()
  if (level === 1) {
    if (chance()) {
      const pct = pick([2, 2.5, 3, 4, 5, 6, 7.5, 8, 10, 12])
      const sales = int(20, 400) * 100 + pick([0, 50])
      return q({ prompt: `${who} is paid ${num(pct)}% commission on sales. How much commission does ${who} earn on sales of ${$(sales, false)}?`, ...money((pct / 100) * sales), calc: true, hint: `${num(pct)}% means ${num(pct)} ÷ 100.`, steps: [`${num(pct)}% × ${$(sales)} = ${$(cent((pct / 100) * sales))}`], meta: { t: 'fin', kind: 'comm', pct, sales } })
    }
    const each = pick([0.35, 0.45, 0.6, 0.85, 1.2, 2.5, 7.5, 12])
    const n = int(30, 600)
    const items = pick(['toys assembled', 'boxes of fruit picked', 'cars washed', 'shirts sewn', 'pamphlets delivered'])
    return q({ prompt: `${who} is paid ${each < 1 ? `${Math.round(each * 100)} cents` : $(each)} for each of the ${items}. How much does ${who} earn for ${n}?`, ...money(each * n), calc: true, hint: 'Piecework: pay for each item × the number of items.', steps: [`${n} × ${$(each)} = ${$(cent(each * n))}`], meta: { t: 'fin', kind: 'piece', each, n } })
  }
  if (level === 2) {
    const kind = pick(['retainer', 'excess', 'tiered', 'royalty'] as const)
    if (kind === 'retainer') {
      const ret = int(4, 12) * 100
      const pct = pick([1.5, 2, 2.5, 3])
      const sales = int(100, 900) * 1000
      return q({ prompt: `A real estate agent is paid a retainer of ${$(ret, false)} per month plus ${num(pct)}% commission on sales. Find the agent’s income in a month with sales of ${$(sales, false)}.`, ...money(ret + (pct / 100) * sales), calc: true, hint: 'Add the retainer to the commission.', steps: [`Commission = ${num(pct)}% × ${$(sales)} = ${$(cent((pct / 100) * sales))}`, `Income = ${$(ret)} + ${$(cent((pct / 100) * sales))} = ${$(cent(ret + (pct / 100) * sales))}`], meta: { t: 'fin', kind, ret, pct, sales } })
    }
    if (kind === 'excess') {
      const over = int(2, 10) * 1000
      const pct = pick([4, 5, 5.5, 6, 8])
      const sales = over + int(5, 60) * 500
      return q({ prompt: `${who} is paid ${num(pct)}% commission on sales over ${$(over, false)} each week. How much commission does ${who} earn in a week with sales of ${$(sales, false)}?`, ...money((pct / 100) * (sales - over)), calc: true, hint: `Only the sales above ${$(over, false)} earn commission.`, steps: [`${$(sales)} − ${$(over)} = ${$(sales - over)}`, `${num(pct)}% × ${$(sales - over)} = ${$(cent((pct / 100) * (sales - over)))}`], meta: { t: 'fin', kind, over, pct, sales } })
    }
    if (kind === 'tiered') {
      const first = 100000
      const p1 = pick([2, 2.5, 3])
      const p2 = pick([1, 1.25, 1.5, 2])
      const price = int(250, 1500) * 1000
      const value = (p1 / 100) * first + (p2 / 100) * (price - first)
      return q({
        prompt: `An agent earns ${num(p1)}% commission on the first ${$(first, false)} of a sale and ${num(p2)}% on the rest. Find the commission on a house sold for ${$(price, false)}.`,
        ...money(value),
        calc: true,
        hint: `Work out the commission on the first ${$(first, false)} and on the remaining ${$(price - first, false)} separately.`,
        steps: [`${num(p1)}% × ${$(first)} = ${$(cent((p1 / 100) * first))}`, `${num(p2)}% × ${$(price - first)} = ${$(cent((p2 / 100) * (price - first)))}`, `Total = ${$(cent(value))}`],
        meta: { t: 'fin', kind, p1, p2, price },
      })
    }
    const pct = pick([8, 10, 12, 12.5, 15])
    const price = int(1995, 4995) / 100
    const copies = int(200, 20000)
    return q({ prompt: `An author earns a ${num(pct)}% royalty on each book sold. The book sells for ${$(price)}. How much does the author earn if ${num(copies)} copies are sold?`, ...money((pct / 100) * price * copies), calc: true, hint: 'Royalty per book × number of books.', steps: [`${num(pct)}% × ${$(price)} × ${num(copies)} = ${$(cent((pct / 100) * price * copies))}`], meta: { t: 'fin', kind, pct, price, copies } })
  }
  // level 3: leave loading, holiday pay, tiered piecework
  const kind = pick(['loadingWage', 'loadingSalary', 'holidayPay', 'pieceTiers'] as const)
  if (kind === 'pieceTiers') {
    const r1 = pick([0.95, 1.15, 1.4])
    const r2 = cent(r1 + pick([0.3, 0.5]))
    const cap = pick([300, 400, 500])
    const n = cap + int(20, 260)
    return q({ prompt: `A process worker is paid ${$(r1)} per article for the first ${cap} articles each week, then ${$(r2)} for each article after that. How much does the worker earn for ${n} articles?`, ...money(cap * r1 + (n - cap) * r2), calc: true, hint: `Pay the first ${cap} at one rate and the other ${n - cap} at the higher rate.`, steps: [`${cap} × ${$(r1)} + ${n - cap} × ${$(r2)} = ${$(cent(cap * r1 + (n - cap) * r2))}`], meta: { t: 'fin', kind, r1, r2, cap, n } })
  }
  if (kind === 'loadingSalary') {
    const sal = int(55, 150) * 1000
    const wk = cent(sal / 52.18)
    const loading = cent(0.175 * wk * 4)
    return q({ prompt: `${who} earns a salary of ${$(sal, false)} p.a. Find ${who}’s annual leave loading of 17.5% on 4 weeks’ pay. (Use 52.18 weeks in a year, and round the weekly pay to the nearest cent first.)`, ...money(loading), calc: true, hint: 'Weekly pay = salary ÷ 52.18. Loading = 17.5% × 4 weeks’ pay.', steps: [`Weekly pay = ${$(sal)} ÷ 52.18 ≈ ${$(wk)}`, `Loading = 17.5% × 4 × ${$(wk)} = ${$(loading)}`], meta: { t: 'fin', kind, sal } })
  }
  const rate = int(2200, 4000) / 100
  const h = pick([35, 38, 40])
  const wk = cent(rate * h)
  const loading = cent(0.175 * 4 * wk)
  if (kind === 'loadingWage') return q({ prompt: `${who} works ${h} hours a week at ${$(rate)} per hour. Calculate ${who}’s annual leave loading of 17.5% on 4 weeks’ pay.`, ...money(loading), calc: true, hint: 'Find a normal week’s pay, then 17.5% of 4 weeks’ pay.', steps: [`Weekly pay = ${h} × ${$(rate)} = ${$(wk)}`, `Loading = 17.5% × 4 × ${$(wk)} = ${$(loading)}`], meta: { t: 'fin', kind, h, rate } })
  return q({ prompt: `${who} works ${h} hours a week at ${$(rate)} per hour. How much holiday pay does ${who} get for 4 weeks of annual leave, including the 17.5% leave loading?`, ...money(4 * wk + loading), calc: true, hint: 'Holiday pay = 4 weeks’ normal pay + 17.5% of it (or 4 weeks’ pay × 1.175).', steps: [`4 weeks’ pay = 4 × ${$(wk)} = ${$(4 * wk)}`, `Loading = 17.5% × ${$(4 * wk)} = ${$(loading)}`, `Holiday pay = ${$(cent(4 * wk + loading))}`], meta: { t: 'fin', kind: 'holidayPay', h, rate } })
}

// ================================================================= 8.04 Income tax

function incomeTax(level: Level): Question {
  const who = name()
  const gross = int(24, 220) * 1000 + int(0, 999)
  const deds = sample([['work clothes', int(150, 900)], ['union fees', int(200, 800)], ['a charity donation', int(50, 600)], ['tools', int(100, 1500)], ['car expenses', int(300, 2500)], ['self-education', int(200, 1800)]] as [string, number][], int(1, 3)).map(([w, a]) => [w, a + int(0, 99) / 100] as [string, number])
  const dedTotal = deds.reduce((s, d) => s + d[1], 0)
  const ti = Math.floor(gross - dedTotal + 1e-9)
  const list = deds.map(([w, a]) => `${$(a)} for ${w}`).join(', ').replace(/, ([^,]*)$/, ' and $1')
  if (level === 1) {
    return q({
      prompt: `${who} earned ${$(gross, false)} this year and can claim allowable deductions of ${list}. Find ${who}’s taxable income, rounded down to the nearest dollar.`,
      answer: numA(ti),
      prefix: '$',
      calc: true,
      hint: 'Taxable income = gross income − allowable deductions. Round down to a whole dollar.',
      steps: [`Deductions = ${$(dedTotal)}`, `${$(gross)} − ${$(dedTotal)} = ${$(gross - dedTotal)}`, `Taxable income = ${$(ti, false)} (rounded down)`],
      meta: { t: 'tax', kind: 'taxable', gross, deds: deds.map((d) => d[1]) },
    })
  }
  if (level === 2) {
    const t = int(15, 250) * 1000 + int(0, 999)
    return q({
      prompt: `Use the tax table to find the income tax payable on a taxable income of ${$(t, false)}.`,
      diagram: taxTable(),
      ...money(taxCents(t) / 100),
      calc: true,
      hint: 'Find the row the income falls in. Add the base amount to the cents per dollar over the bottom of that row.',
      steps: [`${$(t, false)} is in the row ${BRACKETS.find(([lo, hi]) => t >= lo && t <= hi)!.slice(0, 2).map((x) => (x === Infinity ? 'and over' : '$' + num(x))).join(' – ')}.`, `Tax = ${$(taxCents(t) / 100)}`],
      meta: { t: 'tax', kind: 'fromTable', ti: t },
    })
  }
  // level 3: from weekly or fortnightly pay plus interest, less deductions, to tax
  const per = pick(['week', 'fortnight'] as const)
  const pay = per === 'week' ? int(700, 3500) : int(1400, 7000)
  const interest = int(50, 900) + int(0, 99) / 100
  const grossY = pay * (per === 'week' ? 52 : 26)
  const tiY = Math.floor(grossY + interest - dedTotal + 1e-9)
  return q({
    prompt: `${who} earns ${$(pay, false)} per ${per} and received ${$(interest)} in bank interest. Allowable deductions are ${list}. Use the tax table to find ${who}’s income tax payable for the year. (Use ${per === 'week' ? 52 : 26} ${per}s in a year.)`,
    diagram: taxTable(),
    ...money(taxCents(tiY) / 100),
    calc: true,
    hint: 'Find the gross income for the year, add the interest, subtract the deductions and round down. Then use the table.',
    steps: [`Gross = ${pay} × ${per === 'week' ? 52 : 26} = ${$(grossY)}`, `Taxable income = ${$(grossY)} + ${$(interest)} − ${$(dedTotal)} ≈ ${$(tiY, false)} (rounded down)`, `Tax = ${$(taxCents(tiY) / 100)}`],
    meta: { t: 'tax', kind: 'full', pay, per, interest, deds: deds.map((d) => d[1]) },
  })
}

// ================================================================= 8.05 PAYG tax and net pay

function payg(level: Level): Question {
  const who = name()
  if (level === 1) {
    if (chance()) {
      const gross = int(900, 2600) + int(0, 99) / 100
      const tax = cent(gross * (0.12 + random() * 0.18))
      const extras = sample([['superannuation contributions', int(20, 120)], ['union fees', int(8, 25)], ['health insurance', int(30, 90)]] as [string, number][], int(1, 2))
      const net = cent(gross - tax - extras.reduce((s, e) => s + e[1], 0))
      return q({
        prompt: `${who}’s gross pay this week is ${$(gross)}. From it, ${$(tax)} PAYG tax is withheld${extras.map(([w, a]) => `, ${$(a, false)} goes to ${w}`).join('')}. Find ${who}’s net pay.`,
        ...money(net),
        calc: true,
        hint: 'Net pay = gross pay − all deductions (tax and the others).',
        steps: [`${$(gross)} − ${$(tax)}${extras.map(([, a]) => ` − ${$(a)}`).join('')} = ${$(net)}`],
        meta: { t: 'payg', kind: 'net', gross, tax, extras: extras.map((e) => e[1]) },
      })
    }
    const w = int(150, 650) + int(0, 99) / 100
    const n = pick([4, 8, 13, 26, 52])
    return q({ prompt: `${$(w)} PAYG tax is withheld from ${who}’s pay each week. How much PAYG tax is withheld over ${n} weeks?`, ...money(w * n), calc: true, hint: 'Multiply the weekly amount by the number of weeks.', steps: [`${n} × ${$(w)} = ${$(cent(w * n))}`], meta: { t: 'payg', kind: 'total', w, n } })
  }
  const ti = int(30, 200) * 1000 + int(0, 999)
  const taxC = taxCents(ti)
  const medC = medicareCents(ti)
  if (level === 2) {
    const ask = pick(['medicare', 'total'] as const)
    if (ask === 'medicare') return q({ prompt: `${who} has a taxable income of ${$(ti, false)}. Find the Medicare levy of 2% of taxable income.`, ...money(medC / 100), calc: true, hint: 'Medicare levy = 2% × taxable income.', steps: [`2% × ${$(ti)} = ${$(medC / 100)}`], meta: { t: 'payg', kind: 'medicare', ti } })
    return q({
      prompt: `${who} has a taxable income of ${$(ti, false)}. Use the tax table to find the total tax payable, including the Medicare levy of 2% of taxable income.`,
      diagram: taxTable(),
      ...money((taxC + medC) / 100),
      calc: true,
      hint: 'Income tax from the table + 2% of the taxable income.',
      steps: [`Income tax = ${$(taxC / 100)}`, `Medicare levy = 2% × ${$(ti)} = ${$(medC / 100)}`, `Total = ${$((taxC + medC) / 100)}`],
      meta: { t: 'payg', kind: 'totalTax', ti },
    })
  }
  // level 3: refund or debt at the end of the year
  const owed = (taxC + medC) / 100
  const refund = chance(0.6)
  const diff = int(80, 2500) + int(0, 99) / 100
  const paid = cent(refund ? owed + diff : owed - diff)
  const weekly = cent(paid / 52)
  const paidW = cent(weekly * 52)
  const real = cent(paidW - owed)
  if (Math.abs(real) < 1) return payg(level)
  return q({
    prompt: `${who} has a taxable income of ${$(ti, false)}. ${$(weekly)} PAYG tax was withheld every week for 52 weeks. Using the tax table and the 2% Medicare levy, will ${who} get a refund or have a tax debt, and of how much?`,
    diagram: taxTable(),
    answer: mcA(`${real > 0 ? 'A refund' : 'A tax debt'} of ${$(Math.abs(real))}`, [`${real > 0 ? 'A tax debt' : 'A refund'} of ${$(Math.abs(real))}`, `${real > 0 ? 'A refund' : 'A tax debt'} of ${$(Math.abs(cent(paidW - taxC / 100)))}`, `${real > 0 ? 'A refund' : 'A tax debt'} of ${$(Math.abs(real) + 100)}`]),
    calc: true,
    hint: 'Total PAYG paid = 52 × the weekly amount. Tax owed = income tax + Medicare levy. If more was paid than owed, the difference is refunded.',
    steps: [`PAYG paid = 52 × ${$(weekly)} = ${$(paidW)}`, `Owed = ${$(taxC / 100)} + ${$(medC / 100)} = ${$(owed)}`, `${real > 0 ? 'Refund' : 'Tax debt'} = ${$(Math.abs(real))}`],
    meta: { t: 'payg', kind: 'refund', ti, weekly },
  })
}

// ================================================================= Power plus (extension)

function ppNetFromSalary(): Question {
  const sal = int(50, 180) * 1000
  const taxC = taxCents(sal)
  const medC = medicareCents(sal)
  const net = (sal * 100 - taxC - medC) / 100
  return q({
    prompt: `${name()} has a taxable income of ${$(sal, false)} and no other deductions. Using the tax table and the 2% Medicare levy, what is the take-home pay for the year?`,
    diagram: taxTable(),
    ...money(net),
    calc: true,
    hint: 'Take-home pay = income − income tax − Medicare levy.',
    steps: [`Tax = ${$(taxC / 100)}, Medicare levy = ${$(medC / 100)}`, `${$(sal)} − ${$(taxC / 100)} − ${$(medC / 100)} = ${$(net)}`],
    meta: { t: 'payg', kind: 'net', ti: sal },
  })
}
function ppRaise(): Question {
  const sal = int(60, 130) * 1000
  const pct = pick([2, 2.5, 3, 3.5, 4])
  // sal is a whole number of thousands and pct a multiple of 0.5%, so the new salary is whole dollars
  // (rounded, because 88 000 × 1.025 is 90 199.999… in floating point)
  const newSal = Math.round(sal * (1 + pct / 100))
  const extra = (newSal * 100 - taxCents(newSal) - 2 * newSal - (sal * 100 - taxCents(sal) - 2 * sal)) / 100
  return q({
    prompt: `A worker on a salary of ${$(sal, false)} gets a ${num(pct)}% pay rise. Using the tax table and the 2% Medicare levy, by how much does their take-home pay for the year go up? (The new salary is the new taxable income.)`,
    diagram: taxTable(),
    ...money(extra),
    calc: true,
    hint: 'Work out take-home pay (income − tax − Medicare levy) before and after the rise.',
    steps: [`New salary = ${$(newSal)}`, `Increase in take-home pay = ${$(cent(extra))}`],
    meta: { t: 'payg', kind: 'raise', sal, pct },
  })
}
const exPP = (level: Level): Question => (level === 3 ? ppRaise() : ppNetFromSalary())

// ================================================================= skills, test

const T = (skill: string, level: Level, gen: () => Question): TestItem => ({ skill, level, gen: () => gen() })

export const NCM8_TEST: TestItem[] = [
  // about three per exercise (16 in all), in the order of Test Yourself 8
  T('y9-fin-wages', 1, () => wages(1)),
  T('y9-fin-wages', 2, () => wages(2)),
  T('y9-fin-wages', 3, () => wages(3)),
  T('y9-fin-overtime', 1, () => overtime(1)),
  T('y9-fin-overtime', 2, () => overtime(2)),
  T('y9-fin-overtime', 3, () => overtime(3)),
  T('y9-fin-commission', 1, () => commission(1)),
  T('y9-fin-commission', 2, () => commission(2)),
  T('y9-fin-commission', 3, () => commission(3)),
  T('y9-fin-commission', 3, () => commission(3)),
  T('y9-fin-tax', 1, () => incomeTax(1)),
  T('y9-fin-tax', 2, () => incomeTax(2)),
  T('y9-fin-tax', 3, () => incomeTax(3)),
  T('y9-fin-payg', 1, () => payg(1)),
  T('y9-fin-payg', 2, () => payg(2)),
  T('y9-fin-payg', 3, () => payg(3)),
]

export const NCM8_SKILLS: Skill[] = [
  {
    id: 'y9-fin-wages',
    title: 'Wages and salaries',
    ref: ref('8.01'),
    outcomes: FIN,
    summary: 'Weekly wages from hourly rates; salaries per week, fortnight and month; comparing jobs.',
    learn: {
      intro: '<p>A <b>wage</b> is paid by the hour; a <b>salary</b> is a fixed amount per year (p.a.), paid weekly, fortnightly or monthly.</p><p>NCM 9 uses 1 year = 52 weeks for wage earners and 52.18 weeks for salary earners (365¼ ÷ 7 ≈ 52.18). Each question says which to use.</p>',
      keyPoints: ['Weekly wage = hours × hourly rate.', 'Salary per week = salary ÷ 52.18; per month = salary ÷ 12.', 'To compare jobs, change both to the same period (e.g. per week or per hour).'],
      vocab: [['wage', 'pay calculated on the hours worked'], ['salary', 'a fixed yearly amount, not depending on the hours worked'], ['p.a.', 'per annum: per year']],
    },
    gen: wages,
    levels: { 1: 'Weekly wages; yearly amounts', 2: 'Salaries per week, fortnight, month; comparing; hourly rates', 3: 'Shifts across midnight, timesheets, hourly rate from a salary' },
  },
  {
    id: 'y9-fin-overtime',
    title: 'Overtime pay',
    ref: ref('8.02'),
    outcomes: FIN,
    summary: 'Time-and-a-half and double time.',
    learn: {
      intro: '<p>Overtime is paid for hours beyond the normal ones: <b>time-and-a-half</b> is 1.5 × the normal rate and <b>double time</b> is 2 ×.</p><p>Equivalent hours: 38 normal hours + 4 at time-and-a-half = 38 + 4 × 1.5 = 44 normal hours of pay.</p>',
      keyPoints: ['Work out each kind of hour separately, then add.', 'To find the hourly rate from the pay, divide by the equivalent number of normal hours.'],
    },
    gen: overtime,
    levels: { 1: 'Normal hours plus overtime', 2: 'Weekends and awards', 3: 'Hourly rate from the total pay' },
  },
  {
    id: 'y9-fin-commission',
    title: 'Commission, piecework and leave loading',
    ref: ref('8.03'),
    outcomes: FIN,
    summary: 'Commission as a percentage of sales, pay per item, royalties, and 17.5% leave loading.',
    learn: {
      intro: '<p><b>Commission</b> is a percentage of the value of sales; <b>piecework</b> pays a fixed amount per item; a <b>royalty</b> pays artists and authors a share of sales.</p><p><b>Annual leave loading</b> is an extra 17.5% of 4 weeks’ normal pay, paid with holidays.</p>',
      keyPoints: ['Commission on a sliding scale: work out each part of the sale separately.', 'Holiday pay = 4 weeks’ pay + 17.5% of it = 4 weeks’ pay × 1.175.'],
    },
    gen: commission,
    levels: { 1: 'Commission and piecework', 2: 'Retainers, sales over a target, tiered rates, royalties', 3: 'Leave loading, holiday pay, tiered piecework' },
  },
  {
    id: 'y9-fin-tax',
    title: 'Income tax',
    ref: ref('8.04'),
    outcomes: FIN,
    summary: 'Taxable income and income tax from the 2026–27 tax table.',
    learn: {
      intro: `<p><b>Taxable income</b> = gross income − allowable deductions, rounded down to the nearest dollar. Income tax is then worked out from the resident tax table (${TAX_YEAR} rates below; the textbook prints an earlier year’s table).</p>${taxTable()}`,
      keyPoints: ['Interest earned is added to income.', 'In each row, tax = the base amount + the cents per dollar above the bottom of the row.', 'Rates change over time: always check the year of a tax table.'],
      vocab: [['allowable deduction', 'a work-related expense or donation that is not taxed'], ['taxable income', 'gross income minus allowable deductions']],
    },
    gen: incomeTax,
    levels: { 1: 'Taxable income', 2: 'Tax from the table', 3: 'From weekly or fortnightly pay to the tax payable' },
  },
  {
    id: 'y9-fin-payg',
    title: 'PAYG tax and net pay',
    ref: ref('8.05'),
    outcomes: FIN,
    summary: 'Net pay, the Medicare levy, and a tax refund or debt.',
    learn: {
      intro: '<p>Employers withhold <b>PAYG</b> (Pay As You Go) tax from each pay. <b>Net pay</b> is what is left after PAYG tax and other deductions.</p><p>At the end of the year, the total tax owed (income tax + the 2% Medicare levy) is compared with the PAYG tax paid: overpaid tax comes back as a <b>refund</b>; underpaid tax is a <b>tax debt</b>.</p>',
      keyPoints: ['Medicare levy = 2% of taxable income.', 'Refund if PAYG paid > tax owed; debt if PAYG paid < tax owed.'],
    },
    gen: payg,
    levels: { 1: 'Net pay; PAYG over several weeks', 2: 'Medicare levy and total tax', 3: 'Refund or tax debt' },
  },
  {
    id: 'y9-fin-powerplus',
    title: 'Power plus: earning money',
    ref: 'NCM 9 Power plus 8',
    tag: 'extension',
    outcomes: FIN,
    summary: 'Take-home pay for a year, and what a pay rise is really worth after tax.',
    learn: {
      intro: '<p>A pay rise is taxed at the top rate the income falls into, so take-home pay goes up by less than the rise.</p>',
      keyPoints: ['Take-home pay = income − income tax − Medicare levy.'],
    },
    gen: exPP,
    levels: { 1: 'Take-home pay', 2: 'Take-home pay', 3: 'The effect of a pay rise' },
  },
]
