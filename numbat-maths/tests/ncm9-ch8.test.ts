// Independent checks for Year 9 Earning money (New Century Maths 9, Chapter 8).
//  - Every answer is re-worked from the numbers in the words, with formulas written here.
//  - Tax uses a separately written 2026–27 resident tax calculation (marginal rates, bracket by bracket), and every
//    tax table shown must carry the year and the 2026–27 figures.
//  - Money answers are to the cent; the words must say which weeks-per-year convention to use when it matters.
// Usage: npx tsx tests/ncm9-ch8.test.ts   (N per skill and level, default 400)
import { setSeed } from '../src/lib/maths/rand'
import { answerText, checkAnswer } from '../src/lib/maths/check'
import type { Level, Question } from '../src/lib/maths/types'
import { NCM8_SKILLS, NCM8_TEST } from '../src/content/y9-ncm8'
import { findTopic } from '../src/content/index'

const N = Number(process.env.N ?? 400)
let failures = 0
let independent = 0
const counts: Record<string, number> = {}
const strip = (h: string) => h.replace(/<[^>]*>/g, ' ').replace(/&emsp;/g, ' ').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
const fail = (id: string, msg: string, qn?: Question) => {
  failures++
  if (failures <= Number(process.env.SHOW ?? 40)) console.log(`FAIL ${id}: ${msg}` + (qn ? `\n   ${strip(qn.prompt).slice(0, 260)}\n   answer ${JSON.stringify(qn.answer).slice(0, 160)}` : ''))
}
const c2 = (x: number) => Math.round(Number((x * 100).toFixed(6))) / 100
const money = (s: string) => Number(s.replace(/[$\s,]/g, ''))
const M = String.raw`\$([\d ]+(?:\.\d+)?)`

/** 2026–27 resident income tax, marginal rates applied bracket by bracket */
function tax2627(ti: number): number {
  const steps: [number, number][] = [[18200, 0], [45000, 0.15], [135000, 0.3], [190000, 0.37], [Infinity, 0.45]]
  let t = 0
  let lo = 0
  for (const [hi, r] of steps) {
    if (ti > lo) t += (Math.min(ti, hi) - lo) * r
    lo = hi
  }
  return c2(t)
}
// the published table values (each row's base amount) must agree with the marginal calculation
const TABLE_BASES: [number, number][] = [[45000, 4020], [135000, 31020], [190000, 51370]]
for (const [at, base] of TABLE_BASES) if (Math.abs(tax2627(at) - base) > 0.001) throw new Error(`tax table base at ${at} is wrong`)

function checkTable(id: string, qn: Question) {
  const d = qn.diagram ?? ''
  if (!/Resident tax rates 2026–27/.test(d)) fail(id, 'tax table without the 2026–27 label', qn)
  // four-digit numbers aren't grouped on the site (4020), five-digit ones are (31 020)
  for (const s of ['15c for each $1 over $18', '$4020 plus 30c', '$31 020 plus 37c', '$51 370 plus 45c']) if (!strip(d).replace(/,/g, ' ').includes(s.replace(/,/g, ' '))) fail(id, `tax table is missing “${s}”`, qn)
}

function check(id: string, qn: Question) {
  const a = qn.answer
  const m = (qn.meta ?? {}) as Record<string, unknown>
  const p = strip(qn.prompt)
  if (a.kind === 'mc') {
    if (new Set(a.options).size !== a.options.length) fail(id, 'duplicate options', qn)
  } else if (!checkAnswer(a, answerText(a)).correct) fail(id, 'answer text not accepted', qn)
  if (/NaN|undefined|Infinity|\$\{/.test(qn.prompt + qn.steps.join(' ') + qn.hint)) fail(id, 'bad text', qn)
  if (/÷ 52\.18/.test(qn.steps.join(' ')) && !/52\.18 weeks/.test(p)) fail(id, 'uses 52.18 weeks without saying so', qn)
  if (qn.diagram?.includes('tax')) checkTable(id, qn)
  const val = a.kind === 'num' ? a.value : NaN
  if (a.kind === 'num' && a.dp === 2 && qn.prefix !== '$') fail(id, 'money answer without a $ prefix', qn)
  const n = (re: RegExp) => {
    const mm = p.match(re)
    if (!mm) {
      fail(id, `not read: ${re}`, qn)
      return NaN
    }
    return money(mm[1])
  }
  const want = (x: number, what: string) => {
    independent++
    counts[what] = (counts[what] ?? 0) + 1
    if (!(Math.abs(val - c2(x)) < 0.0051)) fail(id, `${what}: expected ${c2(x)}, answer ${val}`, qn)
  }
  const kind = m.kind as string
  switch (kind) {
    case 'week':
      return want(n(/works ([\d.]+) hours/) * n(new RegExp(`earns ${M} per hour`)), 'weekly wage')
    case 'days':
      return want(n(/works ([\d.]+) hours a day/) * n(/for (\d) days/) * n(new RegExp(`paid ${M} per hour`)), 'wage from days')
    case 'annualFromWeek':
      return want(52 * n(new RegExp(`earns ${M} per week`)), 'yearly from weekly')
    case 'annualFromMonth':
      return want(12 * n(new RegExp(`earns ${M} per month`)), 'yearly from monthly')
    case 'salaryWeek':
      return want(n(new RegExp(`salary of ${M} p\\.a\\.`)) / 52.18, 'salary per week')
    case 'salaryFortnight':
      return want(2 * c2(n(new RegExp(`salary of ${M} p\\.a\\.`)) / 52.18), 'salary per fortnight')
    case 'salaryMonth':
      return want(n(new RegExp(`salary of ${M} p\\.a\\.`)) / 12, 'salary per month')
    case 'compare': {
      const A = n(new RegExp(`salary of ${M} p\\.a\\.`)) / 52.18
      const B = n(new RegExp(`pays ${M} per fortnight`)) / 2
      independent++
      counts['compare jobs'] = (counts['compare jobs'] ?? 0) + 1
      if (a.kind !== 'mc' || a.options[a.correct] !== (A > B ? 'Job A' : 'Job B')) fail(id, 'compare jobs', qn)
      return
    }
    case 'hourly':
      return want(n(new RegExp(`paid ${M} for`)) / n(/working (\d+) hours/), 'hourly rate')
    case 'shift': {
      // re-read the times: the shift crosses midnight
      const mm = p.match(/from (\d+):(\d\d) p\.m\. to (\d+):(\d\d) a\.m\./)
      if (!mm) return fail(id, 'times not read', qn)
      const start = (Number(mm[1]) % 12) + 12 + Number(mm[2]) / 60
      const end = (Number(mm[3]) % 12) + Number(mm[4]) / 60
      return want((24 - start) * n(new RegExp(`paid ${M} per hour before`)) + end * n(new RegExp(`and ${M} per hour after`)), 'shift across midnight')
    }
    case 'timesheet': {
      const rows = [...(qn.diagram ?? '').matchAll(/<th scope="row">(\w+)<\/th><td>(\d+):(\d\d) (a|p)\.m\. – (\d+):(\d\d) (a|p)\.m\.<\/td>/g)]
      const h = (hh: string, mm: string, ap: string) => (Number(hh) % 12) + (ap === 'p' ? 12 : 0) + Number(mm) / 60
      let wk = 0
      let sat = 0
      for (const r of rows) {
        const len = h(r[5], r[6], r[7]) - h(r[2], r[3], r[4])
        if (r[1] === 'Saturday') sat += len
        else wk += len
      }
      if (!rows.length) return fail(id, 'timesheet not read', qn)
      return want(wk * n(new RegExp(`paid ${M} per hour on weekdays`)) + sat * n(new RegExp(`and ${M} per hour on Saturdays`)), 'timesheet')
    }
    case 'salaryHourly':
      return want(n(new RegExp(`salary of ${M} p\\.a\\.`)) / 52.18 / n(/works ([\d.]+) hours a week/), 'hourly from salary')
    case 'ot': {
      const r = n(new RegExp(`hours at ${M} per hour`))
      const mult = /time-and-a-half/.test(p) ? 1.5 : 2
      return want(n(/works (\d+) hours at/) * r + n(/and (\d+) hours of overtime/) * r * mult, 'overtime')
    }
    case 'weekend': {
      const r = n(new RegExp(`paid ${M} per hour`))
      return want(r * (n(/worked (\d+) hours from Monday/) + 1.5 * n(/(\d+) hours on Saturday/) + 2 * n(/(\d+) hours on Sunday/)), 'weekend rates')
    }
    case 'award': {
      const r = n(new RegExp(`pays ${M} per hour`))
      const h = n(/for working (\d+) hours/)
      const pay = r * Math.min(h, 38) + 1.5 * r * Math.min(Math.max(h - 38, 0), 3) + 2 * r * Math.max(h - 41, 0)
      return want(pay, 'award')
    }
    case 'rateFromTotal': {
      const eqH = 38 + 1.5 * n(/hours, (\d+) hours at time-and-a-half/) + 2 * n(/and (\d+) hours? at double/)
      return want(n(new RegExp(`was paid ${M}\\.`)) / eqH, 'rate from total')
    }
    case 'comm':
      return want((n(/is paid ([\d.]+)% commission/) / 100) * n(new RegExp(`sales of ${M}\\?`)), 'commission')
    case 'piece': {
      const mm = p.match(/is paid (\d+) cents for each/)
      const each = mm ? Number(mm[1]) / 100 : n(new RegExp(`is paid ${M} for each`))
      return want(each * n(/earn for (\d+)\?/), 'piecework')
    }
    case 'retainer':
      return want(n(new RegExp(`retainer of ${M}`)) + (n(/plus ([\d.]+)% commission/) / 100) * n(new RegExp(`sales of ${M}\\.`)), 'retainer')
    case 'excess':
      return want((n(/is paid ([\d.]+)% commission/) / 100) * (n(new RegExp(`sales of ${M}\\?`)) - n(new RegExp(`sales over ${M} each`))), 'commission over a target')
    case 'tiered': {
      const first = n(new RegExp(`the first ${M} of`))
      const price = n(new RegExp(`sold for ${M}\\.`))
      return want((n(/earns ([\d.]+)% commission/) / 100) * first + (n(/and ([\d.]+)% on the rest/) / 100) * (price - first), 'tiered commission')
    }
    case 'royalty':
      return want((n(/earns a ([\d.]+)% royalty/) / 100) * n(new RegExp(`sells for ${M}\\.`)) * n(/if ([\d ]+) copies/), 'royalty')
    case 'pieceTiers': {
      const cap = n(/for the first (\d+) articles/)
      const k = n(/earn for (\d+) articles/)
      return want(cap * n(new RegExp(`is paid ${M} per article`)) + (k - cap) * n(new RegExp(`then ${M} for each`)), 'tiered piecework')
    }
    case 'loadingSalary':
      return want(0.175 * 4 * c2(n(new RegExp(`salary of ${M} p\\.a\\.`)) / 52.18), 'leave loading (salary)')
    case 'loadingWage':
      return want(0.175 * 4 * c2(n(/works (\d+) hours a week/) * n(new RegExp(`at ${M} per hour`))), 'leave loading (wage)')
    case 'holidayPay': {
      const wk = c2(n(/works (\d+) hours a week/) * n(new RegExp(`at ${M} per hour`)))
      return want(4 * wk + c2(0.175 * 4 * wk), 'holiday pay')
    }
    case 'taxable': {
      const deds = [...p.matchAll(new RegExp(`${M} for`, 'g'))].map((x) => money(x[1]))
      return want(Math.floor(n(new RegExp(`earned ${M} this year`)) - deds.reduce((s, x) => s + x, 0) + 1e-9), 'taxable income')
    }
    case 'fromTable':
      return want(tax2627(n(new RegExp(`taxable income of ${M}\\.`))), 'tax from the table')
    case 'full': {
      const per = /per week/.test(p) ? 52 : 26
      if (!new RegExp(`Use ${per} `).test(p)) fail(id, 'weeks or fortnights per year not stated', qn)
      const pay = n(new RegExp(`earns ${M} per`))
      const deds = [...p.matchAll(new RegExp(`${M} for`, 'g'))].map((x) => money(x[1]))
      const ti = Math.floor(pay * per + n(new RegExp(`received ${M} in bank`)) - deds.reduce((s, x) => s + x, 0) + 1e-9)
      return want(tax2627(ti), 'tax from pay')
    }
    case 'net': {
      if (/taxable income of/.test(p)) {
        const ti = n(new RegExp(`taxable income of ${M} and`))
        return want(ti - tax2627(ti) - 0.02 * ti, 'take-home pay')
      }
      const all = [...p.matchAll(new RegExp(M, 'g'))].map((x) => money(x[1]))
      return want(all[0] - all.slice(1).reduce((s, x) => s + x, 0), 'net pay')
    }
    case 'total':
      return want(n(new RegExp(`^${M} PAYG`)) * n(/over (\d+) weeks/), 'PAYG over weeks')
    case 'medicare':
      return want(0.02 * n(new RegExp(`taxable income of ${M}\\.`)), 'Medicare levy')
    case 'totalTax': {
      const ti = n(new RegExp(`taxable income of ${M}\\.`))
      return want(tax2627(ti) + 0.02 * ti, 'tax plus Medicare levy')
    }
    case 'refund': {
      const ti = n(new RegExp(`taxable income of ${M}\\.`))
      const paid = c2(52 * n(new RegExp(`${M} PAYG tax was withheld`)))
      const diff = c2(paid - tax2627(ti) - c2(0.02 * ti))
      independent++
      counts['refund or debt'] = (counts['refund or debt'] ?? 0) + 1
      if (a.kind !== 'mc') return fail(id, 'not mc', qn)
      const [w, f] = Math.abs(diff).toFixed(2).split('.')
      const right = `${diff > 0 ? 'A refund' : 'A tax debt'} of $${w.length > 4 ? w.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : w}.${f}`
      const shown = a.options.map((o) => strip(o))
      if (shown[a.correct] !== right || shown.filter((s) => s === right).length !== 1) fail(id, `expected “${right}”, marked “${shown[a.correct]}”`, qn)
      return
    }
    case 'raise': {
      const sal = n(new RegExp(`salary of ${M} gets`))
      const pct = n(/gets a ([\d.]+)% pay rise/)
      const after = Math.floor(sal * (1 + pct / 100) + 1e-9)
      const net = (x: number) => x - tax2627(x) - 0.02 * x
      return want(net(after) - net(sal), 'pay rise after tax')
    }
    default:
      fail(id, `no check for ${kind}`, qn)
  }
}

for (const s of NCM8_SKILLS)
  for (const lvl of [1, 2, 3] as Level[])
    for (let i = 0; i < N; i++) {
      setSeed(i * 7919 + lvl * 31 + s.id.length)
      try {
        check(`${s.id} L${lvl}`, s.gen(lvl))
      } catch (e) {
        fail(`${s.id} L${lvl}`, 'threw ' + (e as Error).message)
      }
    }
for (let i = 0; i < 100; i++) {
  setSeed(5000 + i)
  NCM8_TEST.forEach((it, k) => check(`test Q${k + 1}`, it.gen!(it.level)))
}
const topic = findTopic('y9-finance')
if (!topic || topic.test?.length !== 16) fail('topic', 'topic missing or test is not 16 questions')
for (const it of NCM8_TEST) if (!NCM8_SKILLS.some((s) => s.id === it.skill && s.tag !== 'extension')) fail('topic', `test skill ${it.skill} missing or extension`)
console.log(`${failures === 0 ? 'PASS' : 'FAIL'}: ${failures} failures, ${independent} answers re-worked independently`)
console.log(Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(' · '))
process.exit(failures ? 1 : 0)
