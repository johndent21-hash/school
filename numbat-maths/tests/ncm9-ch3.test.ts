// Independent checks for Year 9 Numeracy and calculation (New Century Maths 9, Chapter 3).
// Answers are worked out again here without the generator's working, mostly from the question as printed:
// expressions are read back from the prompt and evaluated, fractions, mixed numerals, percentages, money and
// recurring decimals (dot notation) are parsed from the HTML, and units are converted with this file's own table.
// Every multiple-choice question must have exactly one right option, the rounding asked for in words must
// match the marking, and the wording is scanned for slips.
// Usage: npx tsx tests/ncm9-ch3.test.ts   (N per skill and level, default 400)
import { setSeed } from '../src/lib/maths/rand'
import { answerText, checkAnswer } from '../src/lib/maths/check'
import type { Answer, Level, Question } from '../src/lib/maths/types'
import { NCM3_9_SKILLS, NCM3_9_TEST } from '../src/content/y9-ncm3'
import { findTopic } from '../src/content/index'

const N = Number(process.env.N ?? 400)
let failures = 0
let independent = 0
const counts: Record<string, number> = {}
/** HTML → text: fractions as ((n)/(d)), powers as ^e, recurring digits as [d] */
const strip = (h: string) =>
  h
    .replace(/<span class="frac"[^>]*><span class="fn">(.*?)<\/span><span class="fd">(.*?)<\/span><\/span>/g, '(($1)/($2))')
    .replace(/<span class="rec">(\d)<\/span>/g, '[$1]')
    .replace(/<sup>(.*?)<\/sup>/g, '^$1')
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&emsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
const fail = (id: string, msg: string, qn?: Question) => {
  failures++
  if (failures <= Number(process.env.SHOW ?? 40)) console.log(`FAIL ${id}: ${msg}` + (qn ? `\n   ${strip(qn.prompt).slice(0, 260)}\n   answer ${JSON.stringify(qn.answer).slice(0, 220)}` : ''))
}
const near = (x: number, y: number, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1, Math.abs(y))
const rnd = (x: number, dp: number) => Math.round(x * 10 ** dp * (1 + 1e-12)) / 10 ** dp
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a))
/** numbers in text, with NSW spacing (12 500), true minus signs and $ signs */
const nums = (t: string) => (t.replace(/−/g, '-').replace(/(\d) (?=\d{3}\b)/g, '$1').match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number)
/** a number written in text: whole, decimal, fraction ((n)/(d)) or mixed w ((n)/(d)) */
function readNumber(t: string): number | null {
  t = t.trim().replace(/−/g, '-').replace(/\$/g, '').replace(/(\d) (?=\d{3}\b)/g, '$1')
  let m = t.match(/^(-?\d+) ?\(\((\d+)\)\/\((\d+)\)\)$/)
  if (m) return Number(m[1]) + Number(m[2]) / Number(m[3])
  m = t.replace(/ /g, '').match(/^\(\((-?\d+)\)\/\((\d+)\)\)$/)
  if (m) return Number(m[1]) / Number(m[2])
  if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t)
  m = t.match(/^(\d+)\/(\d+)$/)
  if (m) return Number(m[1]) / Number(m[2])
  return null
}
/** a number as an exact fraction [n, d]: whole, decimal, fraction or mixed numeral */
function readRational(t: string): [number, number] | null {
  t = t.trim().replace(/^\$/, '')
  let m = t.match(/^(\d+) ?\(\((\d+)\)\/\((\d+)\)\)$/)
  if (m) return [Number(m[1]) * Number(m[3]) + Number(m[2]), Number(m[3])]
  m = t.match(/^\(\((\d+)\)\/\((\d+)\)\)$/)
  if (m) return [Number(m[1]), Number(m[2])]
  m = t.match(/^(\d+)(?:\.(\d+))?$/)
  if (m) return [Number(m[1] + (m[2] ?? '')), 10 ** (m[2]?.length ?? 0)]
  return null
}
/** a decimal in dot notation, e.g. 0.[2]7[3] or 8.9[3] */
function readRecurring(t: string): number | null {
  const m = t.trim().match(/^(\d+)\.(\d*)(\[\d\](?:\d*\[\d\])?|\[\d\])?$/)
  if (!m) return readNumber(t)
  const whole = Number(m[1])
  let pre = m[2]
  let rep = ''
  if (m[3]) {
    rep = m[3].replace(/[[\]]/g, '')
  } else if (!pre) return whole
  // the dots must be on the first and last repeating digits
  const value = (p: string, r: string) => {
    const a = p ? Number(p) / 10 ** p.length : 0
    if (!r) return whole + a
    return whole + a + Number(r) / (10 ** r.length - 1) / 10 ** p.length
  }
  if (m[3] && !/^\[\d\](\d*\[\d\])?$/.test(m[3])) return null
  return value(pre, rep)
}
/** evaluate an expression as printed */
function evalText(t: string): number | null {
  let js = t
    .replace(/−/g, '-')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/(\d) (?=\d{3}\b)/g, '$1')
  // −8^2 means −(8^2)
  js = js.replace(/(^|[^\w)\]])-(\d+(?:\.\d+)?)\^(\d)/g, '$1-($2**$3)').replace(/\^(\d)/g, '**$1')
  if (/[^0-9+\-*/(). ]/.test(js)) return null
  try {
    // eslint-disable-next-line no-new-func
    return Function(`"use strict"; return (${js})`)() as number
  } catch {
    return null
  }
}
const numOf = (a: Answer): number | null => (a.kind === 'num' ? a.value : a.kind === 'frac' ? a.n / a.d : null)
const mcOpts = (a: Answer) => (a.kind === 'mc' ? a.options.map(strip) : [])
const mcRight = (a: Answer) => (a.kind === 'mc' ? strip(a.options[a.correct]) : '')
/** exactly one option passes the test, and it is the one marked right */
function oneRight(id: string, qn: Question, test: (o: string) => boolean, what: string) {
  independent++
  const ok = mcOpts(qn.answer).map(test)
  if (ok.filter(Boolean).length !== 1 || qn.answer.kind !== 'mc' || !ok[qn.answer.correct]) fail(id, `${what}: options ${mcOpts(qn.answer).join(' | ')} → ${ok.join(',')}`, qn)
}

// ---------------------------------------------------------------- rounding asked for in words
type Want = number | 'exact' | 'either1' | 'either2' | 'five'
function wanted(prompt: string): Want {
  const t = strip(prompt).replace(/A decimal with three decimal places/, '')
  if (/nearest 5 cents/.test(t)) return 'five'
  if (/one decimal place where necessary|one decimal place if needed/.test(t)) return 'either1'
  if (/nearest cent/.test(t)) return 2
  if (/one decimal place|nearest 0\.1/.test(t)) return 1
  if (/two decimal places|nearest hundredth/.test(t)) return 2
  if (/three decimal places/.test(t)) return 3
  if (/nearest (whole number|dollar|second|day|metre)/.test(t)) return 0
  return 'exact'
}
function checkValue(id: string, qn: Question, truth: number, how: string) {
  const a = qn.answer
  independent++
  const v = numOf(a)
  if (v === null) return fail(id, `expected a number or fraction answer (${how})`, qn)
  const w = wanted(qn.prompt)
  const dp = a.kind === 'num' ? a.dp : undefined
  if (w === 'five') {
    if (!near(v, Math.round(truth * 20) / 20) || dp !== undefined) fail(id, `nearest 5 cents: ${v} vs ${truth} (${how})`, qn)
    return
  }
  if (typeof w === 'number') {
    if (dp !== w) return fail(id, `the words ask for ${w} dp, the marking uses ${dp} (${how})`, qn)
    if (!near(rnd(v, w), rnd(truth, w), 1e-12)) fail(id, `value ${v}, expected ${truth} (${how})`, qn)
    return
  }
  if (w === 'either1') {
    if (dp === undefined ? !near(v, truth) || !Number.isInteger(Math.round(truth * 10 * 1e6) / 1e6) : dp !== 1 || !near(rnd(v, 1), rnd(truth, 1)))
      fail(id, `“where necessary”: ${v} dp ${dp}, expected ${truth} (${how})`, qn)
    return
  }
  // money answers carry 2 dp even when exact; anything else must be exact
  if (dp !== undefined && !(dp === 2 && (qn.prefix === '$' || /^\$/.test(String(qn.prefix))) && near(rnd(truth, 2), truth)) && !(dp === 2 && near(rnd(truth, 2), truth)))
    fail(id, `rounded answer (dp ${dp}) but no rounding asked for (${how})`, qn)
  if (!near(v, truth, 1e-9)) fail(id, `value ${v}, expected ${truth} (${how})`, qn)
}

// ---------------------------------------------------------------- units for rate conversions (this file's own table)
const SIZE: Record<string, number> = {
  mm: 0.001, cm: 0.01, m: 1, km: 1000, g: 1, kg: 1000, t: 1e6, mL: 1, L: 1000, c: 1, cents: 1, $: 100,
  s: 1, min: 60, h: 3600, day: 86400, week: 7 * 86400, year: 52 * 7 * 86400, 'm^2': 1, ha: 10000, sheep: 1,
}

function check(id: string, qn: Question) {
  const m = (qn.meta ?? { t: '?' }) as Record<string, unknown> & { t: string }
  counts[m.t] = (counts[m.t] ?? 0) + 1
  const text = strip(qn.prompt)
  const all = text + ' ' + strip(qn.steps.join(' ')) + ' ' + mcOpts(qn.answer).join(' ')
  if (/NaN|undefined|Infinity|\[object/.test(all)) fail(id, 'NaN/undefined in the text', qn)
  const slip = /(?<![\d.])1 (units|metres|centimetres|hours|years|days|kilograms|students|cars|goals)\b|\+ −|− −|\s,|\.\.(?!\.)| {2}|\(\)|\$-|\$−/
  if (slip.test(all)) fail(id, `wording slip: ${all.match(slip)?.[0]}`, qn)
  if (qn.answer.kind !== 'mc' && qn.answer.kind !== 'open' && !checkAnswer(qn.answer, answerText(qn.answer)).correct) fail(id, 'the answer key does not mark itself right', qn)
  if (qn.answer.kind === 'mc') {
    const o = mcOpts(qn.answer)
    if (new Set(o).size !== o.length) fail(id, 'repeated options', qn)
    if (o.length < 2) fail(id, 'fewer than two options', qn)
  }
  const t = m.t
  const big = (qn.prompt.match(/<div class="big">(.*?)<\/div>/) ?? [])[1] ?? ''
  switch (t) {
    case 'cmp': {
      const [a, b] = nums(strip(big))
      oneRight(id, qn, (o) => (o === '<' ? a < b : a > b), 'compare')
      break
    }
    case 'orderint':
    case 'orderdec':
    case 'orderfrac':
    case 'orderforms': {
      const asc = /ascending/.test(text)
      const items = strip(big).split(', ')
      const val = (s: string) => (s.endsWith('%') ? (readNumber(s.slice(0, -1)) ?? NaN) / 100 : (readNumber(s) ?? NaN))
      if (items.some((s0) => Number.isNaN(val(s0)))) fail(id, `can't read ${items}`, qn)
      const key = (xs: number[]) => xs.map((x) => x.toFixed(9)).sort().join()
      // an option is right when it holds the same numbers as the question, in the asked order
      oneRight(id, qn, (o) => {
        const vs = o.split(', ').map(val)
        const sorted = vs.every((x, i) => i === 0 || (asc ? vs[i - 1] < x : vs[i - 1] > x))
        return sorted && key(vs) === key(items.map(val))
      }, 'ordering')
      break
    }
    case 'expr': {
      const e = text.replace(/^(Evaluate|Without a calculator, evaluate) /, '').replace(/\.$/, '')
      const x = /^(Evaluate|Without)/.test(text) ? evalText(e) : null
      const truth = x ?? evalText(String(m.plain).replace(/frac\((-?\d+),(-?\d+)\)/g, '(($1)/($2))').replace(/-/g, '−').replace(/\*/g, '×').replace(/\//g, '÷'))
      if (x === null && /^Evaluate/.test(text)) fail(id, `can't read the expression ${e}`, qn)
      if (truth === null) return fail(id, 'no value', qn)
      checkValue(id, qn, truth, 'printed expression')
      break
    }
    case 'temp': {
      const [start, up, down] = nums(text.replace(/6 am|1 pm|8 pm/g, ''))
      checkValue(id, qn, start + up - down, 'temperatures')
      break
    }
    case 'tempdiff': {
      const [hi, lo] = nums(text)
      checkValue(id, qn, hi - lo, 'difference')
      break
    }
    case 'open': {
      independent++
      if (qn.answer.kind !== 'open') return fail(id, 'not open', qn)
      if (!checkAnswer(qn.answer, qn.answer.example).correct) fail(id, `example ${qn.answer.example} is marked wrong`, qn)
      const T = m.target as number
      const tries: Record<string, [string, boolean]> = {
        sum: [`7, ${T - 7}`, true],
        difference: [`2, ${2 - T}`, true],
        product: [`${-T}, 1`, false],
        quotient: [`${T * 3}, 3`, true],
      }
      const [inp, ok] = tries[m.kind as string]
      if (checkAnswer(qn.answer, inp).correct !== ok) fail(id, `${inp} marked ${!ok}`, qn)
      if (checkAnswer(qn.answer, `${-T}, 1`).correct && m.kind !== 'product') fail(id, 'a wrong pair is accepted', qn)
      break
    }
    case 'pair': {
      const lim = m.lim as number
      const diff = m.diff as number
      if (!text.includes(`less than ${lim}`) || !text.includes(`difference of ${diff}`)) fail(id, 'wording', qn)
      oneRight(id, qn, (o) => {
        const [p, r] = nums(o)
        return p < lim && r < lim && Math.abs(p - r) === diff
      }, 'pair')
      break
    }
    case 'f2d': {
      checkValue(id, qn, readNumber(text.match(/\(\([\d ]+\)\/\([\d ]+\)\)/)![0].replace(/ /g, ''))!, 'fraction')
      break
    }
    case 'd2f': {
      const x = nums(text)[0]
      checkValue(id, qn, x, 'decimal')
      break
    }
    case 'between': {
      const [a, b] = nums(text)
      oneRight(id, qn, (o) => Number(o) > a && Number(o) < b, 'between')
      break
    }
    case 'judges': {
      const s = nums(text.split(':')[1].split('. The')[0]).sort((p, r) => p - r)
      checkValue(id, qn, s.slice(1, 6).reduce((x, y) => x + y, 0), 'scores')
      break
    }
    case 'equivdiv': {
      const [a, b] = nums(text.split('work out ')[1])
      oneRight(id, qn, (o) => {
        const [x, y] = nums(o)
        return near(x / y, a / b, 1e-9)
      }, 'same division')
      break
    }
    case 'round': {
      const x = nums(text)[0]
      const dp = /whole number/.test(text) ? 0 : nums(text)[1]
      if (qn.answer.kind !== 'num' || qn.answer.dp !== dp || !near(qn.answer.value, rnd(x, dp))) fail(id, `round ${x} to ${dp}`, qn)
      independent++
      break
    }
    case 'whichround': {
      const T = nums(text)[0]
      oneRight(id, qn, (o) => rnd(Number(o), 2) === T, 'rounds to')
      break
    }
    case 'recur': {
      const shown = text.match(/Write (\d+)\.(\d+)…/)!
      const x = Number(`${shown[1]}.${shown[2]}`)
      const prefixOk = (o: string) => {
        const v = readRecurring(o)
        if (v === null) return false
        // the shown digits continue with the same repeating pattern well past what is printed
        const s = v.toFixed(14)
        return s.startsWith(x.toFixed(shown[2].length)) && /\[/.test(o) && near(v, Number(s), 1e-12) && consistentRepeat(o, shown[2])
      }
      oneRight(id, qn, prefixOk, 'dot notation')
      break
    }
    case 'f2rec': {
      const fm = text.match(/Convert (?:(\d+) )?\(\((\d+)\)\/\((\d+)\)\)/)!
      const value = (fm[1] ? Number(fm[1]) : 0) + Number(fm[2]) / Number(fm[3])
      let d = Number(fm[3])
      while (d % 2 === 0) d /= 2
      while (d % 5 === 0) d /= 5
      const recurring = d !== 1
      oneRight(id, qn, (o) => {
        const [num0, label] = o.split(', ')
        const v = readRecurring(num0)
        return v !== null && near(v, value, 1e-12) && label === (recurring ? 'recurring' : 'terminating') && (recurring ? /\[/.test(num0) : !/\[/.test(num0))
      }, 'fraction to decimal')
      break
    }
    case 'fromrec': {
      const decs = text.match(/\d+\.[\d[\]]+/g) ?? []
      const target = readRecurring(decs[1])
      if (target === null) return fail(id, 'cannot read the recurring decimal', qn)
      checkValue(id, qn, target, 'dot notation')
      break
    }
    case 'range': {
      const T = Number(text.match(/rounded to (\d+\.\d+)/)![1])
      checkValue(id, qn, /smallest/.test(text) ? T - 0.005 : T + 0.004, 'rounding range')
      break
    }
    case 'early': {
      const [a, b] = nums(text.split('work out ')[1])
      const n2 = text.split(' and ')[1].split(' were')[0]
      independent++
      if (mcRight(qn.answer) !== `${n2}’s answer`) fail(id, 'the student who rounded at the end is right', qn)
      if (rnd(rnd(a, 1) * rnd(b, 1), 1) === rnd(a * b, 1)) fail(id, 'both methods give the same answer', qn)
      break
    }
    case 'frval': {
      const fm = text.match(/(?:(\d+) )?\(\((\d+)\)\/\((\d+)\)\)/)!
      const v = (fm[1] ? Number(fm[1]) : 0) + Number(fm[2]) / Number(fm[3])
      checkValue(id, qn, v, 'fraction')
      const a = qn.answer
      if (a.kind === 'frac') {
        if (/improper/.test(text) && !a.improper) fail(id, 'should require an improper fraction', qn)
        if (/mixed numeral/.test(text) && !a.mixed) fail(id, 'should require a mixed numeral', qn)
      }
      break
    }
    case 'larger': {
      const fs = (text.match(/\(\(\d+\)\/\(\d+\)\)/g) ?? []).map((s) => readNumber(s)!)
      oneRight(id, qn, (o) => near(readNumber(o)!, Math.max(...fs)), 'larger fraction')
      break
    }
    case 'frop': {
      // the expression after "Evaluate", "Find", or the numbers of a word problem
      const ev = text.match(/^Evaluate (.*?)\. Give/)
      let truth: number | null = null
      if (ev) {
        const e = ev[1].replace(/(\d+) \(\((\d+)\)\/\((\d+)\)\)/g, '($1+(($2)/($3)))')
        truth = evalText(e)
      } else if (/^Find/.test(text)) {
        const fm = text.match(/^Find \(\((\d+)\)\/\((\d+)\)\) of \$?([\d ]+)/)!
        truth = (Number(fm[1]) / Number(fm[2])) * Number(fm[3].replace(/ /g, ''))
      }
      const a = m.a as number[]
      const b = m.b as number[]
      const fromMeta = { '+': a[0] / a[1] + b[0] / b[1], '-': a[0] / a[1] - b[0] / b[1], '*': (a[0] / a[1]) * (b[0] / b[1]), '/': a[0] / a[1] / (b[0] / b[1]) }[m.op as string]!
      if (truth !== null && !near(truth, fromMeta, 1e-9)) fail(id, 'printed expression and meta disagree', qn)
      checkValue(id, qn, truth ?? fromMeta, truth === null ? 'meta' : 'printed')
      if (qn.answer.kind === 'frac' && gcd(qn.answer.n, qn.answer.d) !== 1 && qn.answer.simplest === false) fail(id, 'not simplest', qn)
      break
    }
    case 'frbetween': {
      const fs = (text.match(/\(\(\d+\)\/\(\d+\)\)/g) ?? []).map((s) => readNumber(s)!)
      oneRight(id, qn, (o) => {
        const v = readNumber(o)!
        return v > fs[0] && v < fs[1]
      }, 'fraction between')
      break
    }
    case 'box': {
      const [k, k1] = nums(text.split('between ')[1])
      const top = /\(\(☐\)/.test(text)
      const other = nums(text.match(/\(\((☐|\d+)\)\/\((☐|\d+)\)\)/)![0].replace('☐', ''))[0]
      oneRight(id, qn, (o) => {
        const x = Number(o)
        const v = top ? x / other : other / x
        return v > k && v < k1
      }, 'box')
      break
    }
    case 'lessons': {
      const total = nums(text)[0]
      const each = readNumber(text.match(/lasts (\d+ \(\(\d+\)\/\(\d+\)\))/)![1])!
      checkValue(id, qn, Math.ceil(total / each - 1e-9), 'classes (round up)')
      break
    }
    case 'rest': {
      const fs = (text.match(/\(\(\d+\)\/\(\d+\)\)/g) ?? []).map((s) => readNumber(s)!)
      checkValue(id, qn, 1 - fs.reduce((x, y) => x + y, 0), 'rest of the day')
      break
    }
    case 'pct2f':
    case 'pct2d': {
      const p = readNumber(text.match(/Write (.*?)% as/)![1])!
      checkValue(id, qn, p / 100, 'percentage')
      break
    }
    case 'topct': {
      const s = text.match(/^Write (.*?) as a percentage/)![1]
      checkValue(id, qn, readNumber(s)! * 100, 'to a percentage')
      break
    }
    case 'tf': {
      const parts = strip(big).split(/ ([<>]) /)
      const val = (s: string) => (s.endsWith('%') ? readNumber(s.slice(0, -1))! / 100 : readNumber(s)!)
      const truth = parts[1] === '>' ? val(parts[0]) > val(parts[2]) : val(parts[0]) < val(parts[2])
      oneRight(id, qn, (o) => (o === 'True') === truth, 'true or false')
      break
    }
    case 'pctof': {
      let p: number
      let Q: number
      const fm = text.match(/^Find (.*?)% of \$?([\d .]+?)(?: (kg|m|L|t))?\.(?: |$)/)
      if (fm) {
        p = readNumber(fm[1])!
        Q = Number(fm[2].replace(/ /g, ''))
      } else {
        const pp = m.p as number[]
        p = pp[0] / pp[1]
        Q = m.Q as number
        if (!text.includes(`${pp[0] / pp[1]}%`)) fail(id, 'percentage not shown', qn)
      }
      checkValue(id, qn, (p * Q) / 100, 'percentage of a quantity')
      break
    }
    case 'crowd': {
      const [total, p] = nums(text)
      checkValue(id, qn, /What percentage/.test(text) ? 100 - p : (total * (100 - p)) / 100, 'crowd')
      break
    }
    case 'incdec': {
      const Q = m.Q as number
      const p = m.p as number
      const up = m.up as boolean
      if (!text.replace(/(\d) (?=\d{3}\b)/g, '$1').includes(String(Q)) && !text.includes(Q.toFixed(2))) fail(id, `${Q} not shown`, qn)
      const truth = m.ask === 'profit' ? (Q * p) / 100 : Q * (1 + (up ? p : -p) / 100)
      if (qn.answer.kind === 'mc') oneRight(id, qn, (o) => near(Number(o.replace(/[$ ]/g, '')), Math.round(truth * 100) / 100), 'sale price')
      else checkValue(id, qn, truth, 'increase/decrease')
      break
    }
    case 'express': {
      const fm = text.match(/Write (\$?)([\d.]+)(c| s| min| h| mm| m| cm| g| kg| mL| L| days?)? out of (\$?)([\d.]+)(c| s| min| h| mm| m| cm| g| kg| mL| L| days?)? as/)
      if (!fm) {
        // "earns $W … spends $x of it on …"
        const [W, x] = nums(text)
        checkValue(id, qn, (x / W) * 100, 'part of wage')
        break
      }
      const unit = (dollar: string, u?: string) => (dollar ? 100 : u ? SIZE[u.trim().replace(/^days$/, 'day')] : 1)
      checkValue(id, qn, ((Number(fm[2]) * unit(fm[1], fm[3])) / (Number(fm[5]) * unit(fm[4], fm[6]))) * 100, 'part of whole')
      break
    }
    case 'marks': {
      const [a, b, c, d] = nums(text)
      oneRight(id, qn, (o) => (o === m.s1) === a / b > c / d, 'better mark')
      break
    }
    case 'unitary': {
      checkValue(id, qn, (m.part as number) / ((m.p as number) / 100), 'unitary')
      break
    }
    case 'successive': {
      const p = nums(text)[0]
      oneRight(id, qn, (o) => o === `a decrease of ${(p * p) / 100}%`, 'successive change')
      break
    }
    case 'profit': {
      const C = m.C as number
      const S = m.S as number
      checkValue(id, qn, m.ask === 'cost' ? C : m.ask === 'amount' ? Math.abs(S - C) : (Math.abs(S - C) / C) * 100, 'profit/loss')
      break
    }
    case 'pctdisc': {
      const [O, S] = nums(text.split('from ')[1])
      checkValue(id, qn, ((O - S) / O) * 100, 'percentage discount')
      break
    }
    case 'original': {
      const p = nums(text).find((x, i, a) => text.includes(`${x}%`))!
      const S = nums(text.split('$')[1])[0]
      checkValue(id, qn, S / (1 - p / 100), 'original price')
      break
    }
    case 'costfromprofit': {
      const p = nums(text)[0]
      const S = nums(text.split('sell for $')[1])[0]
      oneRight(id, qn, (o) => near(Number(o.replace(/[$ ]/g, '')), S / (1 + p / 100), 1e-9), 'cost price')
      break
    }
    case 'gst': {
      const x = nums(text.split('$')[1])[0]
      const truth = m.incl ? (m.ask === 'gst' ? x / 11 : x / 1.1) : m.ask === 'gst' ? x / 10 : x * 1.1
      checkValue(id, qn, truth, 'GST')
      break
    }
    case 'twodisc': {
      const d1 = m.d1 as number
      const d2 = m.d2 as number
      const total = (1 - (1 - d1 / 100) * (1 - d2 / 100)) * 100
      if (m.ask === 'same') oneRight(id, qn, (o) => o === `No: it is ${Math.round(total * 1e6) / 1e6}% off`, 'two discounts')
      else checkValue(id, qn, m.ask === 'price' ? (m.P as number) * (1 - d1 / 100) * (1 - d2 / 100) : total, 'two discounts')
      break
    }
    case 'si': {
      const P = nums(text.split('$')[1])[0]
      const r = readNumber(text.match(/at (.*?)% p\.a\./)![1]) ?? nums(text.match(/at (.*?)% p\.a\./)![1])[0]
      const tm = text.match(/for (\d+) (years|months|days|weeks)/)!
      const n = Number(tm[1]) / { years: 1, months: 12, days: 365, weeks: 52 }[tm[2] as 'years']!
      const I = (P * r * n) / 100
      checkValue(id, qn, /final value/.test(text) ? P + I : I, 'I = Prn')
      break
    }
    case 'sirate': {
      const P = m.P as number
      const I = m.I as number
      const n = nums(text.match(/(\d+) years/)![0])[0]
      checkValue(id, qn, (I / (P * n)) * 100, 'rate')
      break
    }
    case 'sitime': {
      const [P, I] = [m.P as number, m.I as number]
      const r = nums(text.match(/at ([\d.]+)% p\.a\./)![1])[0]
      const per = /months/.test(text) ? 12 : /days/.test(text) ? 365 : 1
      checkValue(id, qn, (I / ((P * r) / 100)) * per, 'time')
      break
    }
    case 'siloan': {
      const [P, R, y] = [m.P as number, m.R as number, m.y as number]
      const total = R * 12 * y
      checkValue(id, qn, m.ask === 'total' ? total : m.ask === 'interest' ? total - P : ((total - P) / (P * y)) * 100, 'flat-rate loan')
      break
    }
    case 'ratio': {
      // read each term exactly (whole number, decimal, fraction, mixed numeral, money or a unit), same units, then simplify
      const body = text.match(/ratio (.*)\.$/)![1]
      const terms = body.split(' : ').map((s0) => {
        const t0 = s0.trim()
        let f = readRational(t0)
        let k = 1
        if (!f) {
          const mm = t0.match(/^(\$?)([\d.]+)(c| (\w+))$/)!
          f = readRational(mm[2])!
          k = mm[1] ? 100 : mm[3] === 'c' ? 1 : SIZE[mm[4]]
          if (t0.startsWith('$')) k = 100
        } else if (t0.startsWith('$')) k = 100
        return [f[0] * Math.round(k * 1000), f[1] * 1000] as [number, number]
      })
      const L = terms.reduce((l, f) => (l * f[1]) / gcd(l, f[1]), 1)
      const ints = terms.map((f) => (f[0] * L) / f[1])
      const g = ints.reduce((x, y) => gcd(x, y))
      const want = ints.map((x) => x / g)
      independent++
      if (qn.answer.kind !== 'ratio' || qn.answer.parts.join() !== want.join()) fail(id, `ratio ${body} → ${want.join(' : ')}`, qn)
      break
    }
    case 'ratiofind': {
      const [a, b] = [m.a as number, m.b as number]
      checkValue(id, qn, m.knownFirst ? ((m.known as number) / a) * b : ((m.known as number) / b) * a, 'ratio')
      break
    }
    case 'ratiofind4': {
      const parts = (text.match(/= ([\d : ]+)\./)![1]).split(' : ').map(Number)
      const known = nums(text.split('orders ')[1])[0]
      checkValue(id, qn, (known / parts[3]) * parts[m.ask as number], 'ratio of colours')
      break
    }
    case 'divide': {
      const parts = (text.match(/ratio ([\d : ]+)\./)![1]).trim().split(' : ').map(Number)
      const total = m.total as number
      const truth = (total * parts[m.which as number]) / parts.reduce((x, y) => x + y, 0)
      if (m.mc) oneRight(id, qn, (o) => Number(o.split(' ')[0]) === rnd(truth, 2), 'share')
      else checkValue(id, qn, truth, 'share')
      break
    }
    case 'rate':
      checkValue(id, qn, (m.numer as number) / (m.den as number), 'rate')
      break
    case 'rateuse':
      checkValue(id, qn, (m.rate as number) * (m.amount as number), 'distance')
      break
    case 'wage': {
      const day = m.day as number
      checkValue(id, qn, m.ask === 'rate' ? day / 8 : m.ask === 'week' ? (day / 8) * 38 : (m.target as number) / day, 'wage')
      break
    }
    case 'meat': {
      const rate = (m.cost as number) / (m.kg as number)
      checkValue(id, qn, m.ask === 'rate' ? rate : m.ask === 'other' ? rate * (m.other as number) : (m.budget as number) / rate, 'price per kg')
      break
    }
    case 'heart':
      checkValue(id, qn, m.ask === 'hour' ? (m.bpm as number) * 60 : ((m.beats as number) / (m.bpm as number)) * 60, 'heartbeats')
      break
    case 'fuel':
      checkValue(id, qn, ((m.rate as number) * (m.km as number)) / 100, 'fuel')
      break
    case 'fuel2':
      checkValue(id, qn, ((m.L as number) / (m.km as number)) * 100, 'L/100 km')
      break
    case 'births':
      checkValue(id, qn, ((m.births as number) / (m.rate as number)) * 1000, 'population')
      break
    case 'carat': {
      const c = m.c as number
      if (m.ask === 'ratio') {
        independent++
        const g = gcd(c, 24 - c)
        if (qn.answer.kind !== 'ratio' || qn.answer.parts.join() !== [c / g, (24 - c) / g].join()) fail(id, 'carat ratio', qn)
      } else checkValue(id, qn, ((m.mass as number) * c) / 24, 'gold mass')
      break
    }
    case 'density':
      checkValue(id, qn, ((m.popM as number) * 1e6) / (m.area as number), 'density')
      break
    case 'convert': {
      if (/Convert this speed/.test(text)) {
        checkValue(id, qn, nums(text.split(' at ')[1])[0] * 3.6, 'm/s to km/h')
        break
      }
      const cm = text.match(/Convert (\$?)([\d.]+)(c)? ?([^/ ]*)\/(\S+?) to (\S+?)\/(\S+?)(,|\.)/)!
      const fromN = cm[1] ? '$' : cm[3] ? 'c' : cm[4]
      const toN = cm[6] === 'cents' ? 'c' : cm[6]
      const f = (u: string) => SIZE[u] ?? NaN
      const truth = (Number(cm[2]) * f(fromN) * f(cm[7])) / (f(toN) * f(cm[5]))
      if (Number.isNaN(truth)) fail(id, `units ${cm.slice(1).join('|')}`, qn)
      checkValue(id, qn, truth, 'unit conversion')
      break
    }
    case 'reaction':
      checkValue(id, qn, ((m.v as number) / 3.6) * (m.time as number), 'reaction distance')
      break
    case 'ppbetween': {
      const a = m.a as number
      const lo = 1 / a
      const hi = 1 / (a - 1)
      checkValue(id, qn, lo + ((hi - lo) / 4) * (m.which as number), 'equally spaced')
      break
    }
    case 'markup': {
      const mk = m.m as number
      checkValue(id, qn, (mk / (100 + mk)) * 100, 'markup')
      break
    }
    case 'third': {
      const f = m.f as number[]
      checkValue(id, qn, (m.S as number) / (1 - f[0] / f[1]), 'reduced by a fraction')
      break
    }
    case 'ratiochain': {
      const { a, b, c, d } = m as unknown as Record<string, number>
      const x = a * d
      const y = c * b
      const g = gcd(x, y)
      independent++
      if (qn.answer.kind !== 'ratio' || qn.answer.parts.join() !== [x / g, y / g].join()) fail(id, 'ratio chain', qn)
      break
    }
    case 'ratiogift': {
      const { x, y, z, gift } = m as unknown as Record<string, number>
      const k = (2 * gift) / (y - x)
      if (!near(y * k - gift, x * k + gift)) fail(id, 'not equal after the gift', qn)
      checkValue(id, qn, z * k, 'ratio puzzle')
      break
    }
    case 'double':
      checkValue(id, qn, 100 / (m.r as number), 'doubling time')
      break
    case 'avgspeed': {
      const [s1, s2] = [m.s1 as number, m.s2 as number]
      const avg = (2 * s1 * s2) / (s1 + s2)
      // the driver at the steady average of the two speeds arrives first, because the other's true average is lower
      if (!(avg < (s1 + s2) / 2)) fail(id, 'average speed', qn)
      oneRight(id, qn, (o) => o === text.split(' drives the whole')[0].split('. ').pop(), 'average speed')
      break
    }
    default:
      fail(id, `no check for ${t}`, qn)
  }
}
/** the printed digits fit the dotted pattern, e.g. 0.273273… and 0.[2]7[3] */
function consistentRepeat(o: string, digits: string): boolean {
  const mm = o.match(/^\d+\.(\d*)(\[\d\](?:(\d*)\[\d\])?)$/)
  if (!mm) return false
  const pre = mm[1]
  const rep = mm[2].replace(/[[\]]/g, '')
  let s = pre
  while (s.length < digits.length + rep.length) s += rep
  return s.startsWith(digits)
}

for (const s of NCM3_9_SKILLS)
  for (const lvl of [1, 2, 3] as Level[])
    for (let i = 0; i < N; i++) {
      setSeed(i * 7919 + lvl * 31 + s.id.length)
      const qn = s.gen(lvl)
      try {
        check(`${s.id} L${lvl}`, qn)
      } catch (e) {
        fail(`${s.id} L${lvl}`, `checker could not read the question (${(e as Error).message})`, qn)
      }
    }
for (let i = 0; i < 100; i++) {
  setSeed(9000 + i)
  NCM3_9_TEST.forEach((it, k) => check(`test Q${k + 1}`, it.gen!(it.level)))
}
const topic = findTopic('y9-numeracy')
if (!topic || topic.test?.length !== 12) fail('topic', 'topic missing or the test is not 12 questions')
for (const it of NCM3_9_TEST) if (!NCM3_9_SKILLS.some((s) => s.id === it.skill)) fail('topic', `test skill ${it.skill} missing`)
if (findTopic('y9-finance')?.skills.some((s) => s.id === 'y9-fin-interest')) fail('topic', 'simple interest is still in Earning money')
console.log(`${failures === 0 ? 'PASS' : 'FAIL'}: ${failures} failures, ${independent} answers re-worked independently`)
console.log(Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(' · '))
process.exit(failures ? 1 : 0)
