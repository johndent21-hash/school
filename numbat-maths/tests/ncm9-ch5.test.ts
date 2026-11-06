// Independent checks for Year 9 Indices (New Century Maths 9, Chapter 5).
// Answers are worked out again here without the generator's working:
//  - index laws: the question as asked (built from its own numbers and letters, never from the answer) and the answer
//    are evaluated at random values of every letter and must agree; the numbers and letters in the question must be
//    the ones on the page; multiple choice must have exactly one option equal to the question;
//  - significant figures: counted and rounded again from the number as written, with exact decimal arithmetic;
//  - scientific notation: the numbers are read back from the page and the calculation re-done;
//  - everyday problems: re-worked from the numbers in the words.
// The rounding asked for in words must match the marking, and every answer the page shows must be accepted.
// Usage: npx tsx tests/ncm9-ch5.test.ts   (N per skill and level, default 400)
import { setSeed } from '../src/lib/maths/rand'
import { answerText, checkAnswer } from '../src/lib/maths/check'
import { evaluate, normalise, parse } from '../src/lib/maths/expr'
import type { Level, Question } from '../src/lib/maths/types'
import { NCM5_SKILLS, NCM5_TEST } from '../src/content/y9-ncm5'
import { findTopic } from '../src/content/index'

const N = Number(process.env.N ?? 400)
let failures = 0
let independent = 0
const counts: Record<string, number> = {}
const strip = (h: string) =>
  h
    .replace(/<span class="frac"[^>]*><span class="fn">(.*?)<\/span><span class="fd">(.*?)<\/span><\/span>/g, '(($1)/($2))')
    .replace(/<sup>(.*?)<\/sup>/g, '^($1)')
    .replace(/<[^>]*>/g, '')
    .replace(/&emsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
const fail = (id: string, msg: string, qn?: Question) => {
  failures++
  if (failures <= Number(process.env.SHOW ?? 40)) console.log(`FAIL ${id}: ${msg}` + (qn ? `\n   ${strip(qn.prompt).slice(0, 220)}\n   answer ${JSON.stringify(qn.answer).slice(0, 200)}` : ''))
}
const done = (what: string) => {
  independent++
  counts[what] = (counts[what] ?? 0) + 1
}
const near = (x: number, y: number, tol = 1e-9) => Math.abs(x - y) <= tol * Math.max(1e-300, Math.abs(x), Math.abs(y))

/** the value of a parseable expression at the given letter values */
const val = (s: string, env: Record<string, number>) => evaluate(parse(normalise(s)), env)
/** an option or answer shown as HTML, back to something the parser reads */
const htmlToExpr = (h: string) =>
  h
    .replace(/<span class="frac"[^>]*><span class="fn">(.*?)<\/span><span class="fd">(.*?)<\/span><\/span>/g, '(($1)/($2))')
    .replace(/<sup>(.*?)<\/sup>/g, '^($1)')
    .replace(/<[^>]*>/g, '')
    .replace(/−/g, '-')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/\s+/g, '')

/** two expressions agree at several random values of their letters (letters as indices too) */
function agree(a: string, b: string): boolean {
  const letters = Array.from(new Set((a + b).replace(/sqrt|pi/g, '').match(/[a-z]/g) ?? []))
  for (let k = 0; k < 6; k++) {
    const env: Record<string, number> = {}
    for (const l of letters) env[l] = 1.1 + ((k * 7 + l.charCodeAt(0)) % 13) / 9
    const x = val(a, env)
    const y = val(b, env)
    if (!Number.isFinite(x) || !Number.isFinite(y) || !near(x, y, 1e-7)) return false
  }
  return true
}

// ---------------------------------------------------------------- exact decimals (significant figures)

/** a decimal string as an exact fraction of 10s: digits × 10^exp */
function dec(s: string): { digits: bigint; exp: number } {
  const t = s.replace(/[\s,]/g, '')
  const [w, f = ''] = t.split('.')
  return { digits: BigInt((w + f).replace(/^0+(?=\d)/, '') || '0'), exp: -f.length }
}
/** round a positive decimal (as a string) to sf significant figures, half up: returns a decimal string */
function sfRoundStr(s: string, sf: number): number {
  const { digits, exp } = dec(s)
  const ds = digits.toString()
  if (ds.length <= sf) return Number(s.replace(/\s/g, ''))
  const drop = ds.length - sf
  let keep = BigInt(ds.slice(0, sf))
  if (Number(ds[sf]) >= 5) keep += 1n
  return Number(`${keep}e${exp + drop}`)
}
/** round any positive number to sf significant figures, from its exact digits in exponential form */
function sfRoundNum(x: number, sf: number): number {
  const [mant, e] = x.toExponential(14).split('e')
  const ds = mant.replace('.', '')
  let keep = BigInt(ds.slice(0, sf))
  if (Number(ds[sf]) >= 5) keep += 1n
  return Number(`${keep}e${Number(e) - sf + 1}`)
}
/** the textbook's rule for counting: from the first non-zero digit; trailing zeros of a whole number don't count */
function countSFStr(s: string): number {
  const t = s.replace(/[\s,]/g, '')
  const lead = t.replace(/^[0.]+/, '')
  if (t.includes('.')) return lead.replace('.', '').length
  return lead.replace(/0+$/, '').length
}

// ---------------------------------------------------------------- scientific notation read back from the page

const SCI = /(\d+(?:\.\d+)?) × 10\^\((−?\d+)\)/g
const sciNums = (p: string) => [...p.matchAll(SCI)].map((m) => Number(`${m[1]}e${m[2].replace('−', '-')}`))

function checkSfWords(id: string, qn: Question, sf: number | undefined) {
  const m = strip(qn.prompt).match(/correct to (one|\d) significant figure/)
  const want = m ? (m[1] === 'one' ? 1 : Number(m[1])) : undefined
  if (want !== sf) fail(id, `words ask for ${want} significant figures, marking uses ${sf}`, qn)
}

// ---------------------------------------------------------------- the checks

function check(id: string, qn: Question) {
  const a = qn.answer
  const m = (qn.meta ?? {}) as Record<string, unknown>
  const t = m.t as string
  const p = strip(qn.prompt)
  if (a.kind === 'mc') {
    if (new Set(a.options).size !== a.options.length) fail(id, 'duplicate options', qn)
  } else if (!checkAnswer(a, answerText(a)).correct) fail(id, `answer text "${answerText(a)}" not accepted`, qn)
  if (/NaN|undefined|Infinity|\$\{|\[object/.test(qn.prompt + qn.steps.join(' ') + qn.hint)) fail(id, 'bad text', qn)
  if (/ {2}| ,|\.\.(?!\.)/.test(p)) fail(id, 'wording slip', qn)

  switch (t) {
    case 'expr': {
      const qs = m.q as string
      // the question's numbers and letters are the ones on the page
      const pageNums = new Set((p.replace(/−/g, '-').match(/\d+/g) ?? []).map(Number))
      for (const n of (qs.match(/\d+/g) ?? []).map(Number)) if (!pageNums.has(n) && n !== 1) fail(id, `number ${n} isn’t on the page`, qn)
      for (const l of new Set(qs.match(/[a-z]/g) ?? [])) if (!p.includes(l)) fail(id, `letter ${l} isn’t on the page`, qn)
      if (a.kind === 'mc') {
        const hits = a.options.map((o) => {
          try {
            return agree(qs, htmlToExpr(o))
          } catch {
            return false
          }
        })
        if (hits.filter(Boolean).length !== 1 || !hits[a.correct]) fail(id, `${hits.filter(Boolean).length} options equal the question`, qn)
        return done('index laws (multiple choice)')
      }
      const ans = a.kind === 'expr' ? a.expr : a.kind === 'num' ? String(a.value) : a.kind === 'frac' ? `${a.n}/${a.d}` : null
      if (ans === null) return fail(id, `unexpected answer kind ${a.kind}`, qn)
      if (!agree(qs, ans)) return fail(id, `answer ${ans} doesn’t equal the question ${qs}`, qn)
      // the form asked for in words is the one marked
      if (/index notation/.test(p) && a.kind === 'expr' && a.form !== 'singlePower') fail(id, 'asks for index notation, marking doesn’t', qn)
      if (/positive ind/.test(p) && a.kind === 'expr' && a.form !== 'positiveIndices') fail(id, 'asks for positive indices, marking doesn’t', qn)
      if (/negative index/.test(p) && a.kind === 'expr' && a.form !== 'negativeIndex') fail(id, 'asks for a negative index, marking doesn’t', qn)
      return done(m.varIndex ? 'letters as indices' : 'index laws')
    }
    case 'value': {
      // re-evaluate the expression on the page with plain arithmetic
      const big = qn.prompt.match(/<div class="big">(.*)<\/div>/)?.[1] ?? ''
      let s = htmlToExpr(big).replace(/\^/g, '**')
      s = s.replace(/(^|[^\w)])-(\d+)\*\*/g, '$1(-$2)**')
      let x: number
      try {
        x = Function(`"use strict"; return (${s});`)()
      } catch {
        return fail(id, `couldn’t evaluate ${s}`, qn)
      }
      const got = a.kind === 'num' ? a.value : a.kind === 'frac' ? a.n / a.d : NaN
      if (!near(x, got, 1e-9)) fail(id, `expected ${x}, answer ${got}`, qn)
      if (/as a fraction/.test(p) && a.kind !== 'frac') fail(id, 'asks for a fraction', qn)
      return done('evaluated from the page')
    }
    case 'mcProd': {
      if (a.kind !== 'mc') return fail(id, 'not multiple choice', qn)
      const mm = p.match(/\(−(\d+) × (\d+)\)\^\(2\)/)
      if (!mm) return fail(id, 'not read', qn)
      const x = (-Number(mm[1]) * Number(mm[2])) ** 2
      const vals = a.options.map((o) => Function(`return (${htmlToExpr(o)})`)() as number)
      if (vals.filter((v) => v === x).length !== 1 || vals[a.correct] !== x) fail(id, 'options', qn)
      return done('power of a product (multiple choice)')
    }
    case 'sfCount': {
      const s = m.s as string
      if (!p.includes(s.replace(/\B(?=(\d{3})+(?!\d))/g, (x) => x).slice(0, 1))) fail(id, 'number not on the page', qn)
      if (a.kind !== 'num' || a.value !== countSFStr(s)) fail(id, `expected ${countSFStr(s)} significant figures`, qn)
      return done('significant figures counted')
    }
    case 'sfRound': {
      const s = m.s as string
      const sf = m.sf as number
      const x = sfRoundStr(s, sf)
      if (!p.replace(/\s/g, '').includes(s.replace(/\s/g, ''))) fail(id, 'number not on the page', qn)
      const words = p.match(/(?:to|correct to) (one|\d) significant figure/)
      if (!words || (words[1] === 'one' ? 1 : Number(words[1])) !== sf) fail(id, 'significant figures in the words differ', qn)
      if (a.kind === 'mc') {
        const vals = a.options.map((o) => Number(strip(o).replace(/\s/g, '')))
        if (vals.filter((v) => v === x).length !== 1 || vals[a.correct] !== x) fail(id, `options don’t have exactly one ${x}`, qn)
      } else if (a.kind !== 'num' || a.value !== x) fail(id, `expected ${x}, answer ${JSON.stringify(a)}`, qn)
      return done('rounded to significant figures')
    }
    case 'sfCalc': {
      // evaluate the expression on the page with plain arithmetic
      const big = htmlToExpr(qn.prompt.match(/<div class="big">(.*)<\/div>/)?.[1] ?? '')
      let x: number
      try {
        x = Function(`"use strict"; return (${big});`)()
      } catch {
        return fail(id, `couldn’t evaluate ${big}`, qn)
      }
      const sf = Number(p.match(/correct to (\d) significant/)?.[1])
      const r = sfRoundNum(Math.abs(x), sf) * Math.sign(x)
      if (a.kind !== 'num' || !near(a.value, r, 1e-12)) fail(id, `expected ${r}`, qn)
      return done('calculation to significant figures')
    }
    case 'toSci': {
      const s = (m.s as string).replace(/\s/g, '')
      if (!p.replace(/\s/g, '').includes(s)) fail(id, 'number not on the page', qn)
      const x = Number(s)
      if (a.kind !== 'sci' || !near(a.value, x, 1e-12)) fail(id, `expected ${x}`, qn)
      return done('to scientific notation')
    }
    case 'fromSci': {
      const xs = sciNums(p)
      if (xs.length !== 1) return fail(id, 'number not read', qn)
      if (a.kind !== 'num' || !near(a.value, xs[0], 1e-12)) fail(id, `expected ${xs[0]}`, qn)
      return done('from scientific notation')
    }
    case 'sciLarger': {
      if (a.kind !== 'mc') return fail(id, 'not multiple choice', qn)
      const xs = a.options.map((o) => sciNums(strip(o))[0])
      if (xs[a.correct] !== Math.max(...xs) || xs[0] === xs[1]) fail(id, 'larger number not marked', qn)
      return done('larger in scientific notation')
    }
    case 'sciOrder': {
      if (a.kind !== 'mc') return fail(id, 'not multiple choice', qn)
      const desc = /descending/.test(p)
      const ok = a.options.map((o) => {
        const xs = sciNums(strip(o))
        return xs.every((x, i) => i === 0 || (desc ? xs[i - 1] > x : xs[i - 1] < x))
      })
      if (ok.filter(Boolean).length !== 1 || !ok[a.correct]) fail(id, 'ordering options', qn)
      return done('ordering in scientific notation')
    }
    case 'sciCalc': {
      const xs = sciNums(p)
      let x: number
      if (m.kind === 'mul') x = xs[0] * xs[1]
      else if (m.kind === 'div') x = xs[0] / xs[1]
      else if (m.kind === 'pow') x = xs[0] ** Number(p.match(/\)\^\((\d)\)/)?.[1])
      else x = Math.sqrt(xs[0])
      if (a.kind !== 'sci' || !near(a.value, x, 1e-10)) fail(id, `expected ${x}, answer ${JSON.stringify(a)}`, qn)
      return done('calculation in scientific notation')
    }
    case 'sciRound': {
      const xs = sciNums(p)
      const x = m.kind === 'mul' ? xs[0] * xs[1] : m.kind === 'div' ? xs[0] / xs[1] : xs[0] ** 3
      if (a.kind !== 'sci') return fail(id, 'not scientific notation', qn)
      checkSfWords(id, qn, a.sf)
      const r = sfRoundNum(x, a.sf!)
      if (!near(a.value, r, 1e-12)) fail(id, `expected ${r}`, qn)
      return done('rounded scientific notation')
    }
    case 'sciProblem':
      return checkProblem(id, qn, p, m.kind as string)
    case 'subst': {
      const mm = p.match(/If u = (\d+), v = (\d+) and w = (\d+)/)
      if (!mm) return fail(id, 'values not read', qn)
      const x = val(m.q as string, { u: +mm[1], v: +mm[2], w: +mm[3] })
      const got = a.kind === 'num' ? a.value : a.kind === 'frac' ? a.n / a.d : NaN
      if (!near(x, got)) fail(id, `expected ${x}`, qn)
      if (!agree(m.q as string, htmlToExpr(qn.prompt.match(/<div class="big">(.*)<\/div>/)?.[1] ?? '').replace(/\*\*/g, '^'))) fail(id, 'expression on the page differs', qn)
      return done('substitution')
    }
    case 'lastDigit': {
      const mm = p.match(/last digit of (\d+)\^\((\d+)\)/)
      if (!mm) return fail(id, 'not read', qn)
      const d = Number(BigInt(mm[1]) ** BigInt(mm[2]) % 10n)
      if (a.kind !== 'num' || a.value !== d) fail(id, `expected ${d}`, qn)
      return done('last digit')
    }
    case 'sciWords': {
      const mm = p.match(/Write ([\d.]+) (\w+) in scientific/)
      const powers: Record<string, number> = { thousand: 3, million: 6, billion: 9, thousandths: -3, millionths: -6, billionths: -9 }
      if (!mm) return fail(id, 'not read', qn)
      const x = Number(`${mm[1]}e${powers[mm[2]]}`)
      if (a.kind !== 'sci' || !near(a.value, x, 1e-12)) fail(id, `expected ${x}`, qn)
      return done('number words to scientific notation')
    }
    case 'sciForm': {
      const xs = sciNums(p)
      if (a.kind !== 'sci' || !near(a.value, xs[0], 1e-12)) fail(id, `expected ${xs[0]}`, qn)
      return done('tidying scientific notation')
    }
    default:
      fail(id, `no check for ${t}`, qn)
  }
}

function checkProblem(id: string, qn: Question, p: string, kind: string) {
  const a = qn.answer
  const n = (re: RegExp) => Number((p.match(re)?.[1] ?? 'NaN').replace(/\s/g, ''))
  let x: number
  switch (kind) {
    case 'atoms':
      x = n(/collection of (\d+) × 10/) * 1e9 * n(/about ([\d.]+) × 10\^\(9\) atoms/) * 1e9
      break
    case 'pages':
      x = (n(/is ([\d.]+) cm thick/) * 10) / n(/has (\d+) pages/)
      break
    case 'sunlight':
      x = (n(/Earth is ([\d.]+) × 10\^\(8\)/) * 1e8) / 3e5
      break
    case 'hydrogen':
      x = n(/about (\d+) million tonnes/) * 1e6 * 365.25 * 24 * 60 * 60
      break
    case 'lightYear':
      x = 3e5 * (/366/.test(p) ? 366 : 365) * 86400
      break
    case 'thunder':
      x = (n(/storm is (\d+) km/) * 1000) / 330
      break
    default:
      return fail(id, `no check for problem ${kind}`, qn)
  }
  if (!Number.isFinite(x)) return fail(id, 'numbers not read', qn)
  if (a.kind === 'sci') {
    if (a.sf) {
      checkSfWords(id, qn, a.sf)
      x = sfRoundNum(x, a.sf)
    }
    if (!near(a.value, x, 1e-10)) fail(id, `expected ${x}, answer ${a.value}`, qn)
  } else if (a.kind === 'num') {
    const dp = /one decimal place/.test(p) ? 1 : /nearest second/.test(p) ? 0 : undefined
    if (dp !== a.dp) fail(id, `words say ${dp} dp, marking uses ${a.dp}`, qn)
    if (Math.round(a.value * 10 ** (dp ?? 0)) !== Math.round(x * 10 ** (dp ?? 0))) fail(id, `expected ${x}`, qn)
  } else fail(id, 'unexpected answer', qn)
  done(`problem: ${kind}`)
}

// ---------------------------------------------------------------- run

for (const s of NCM5_SKILLS)
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
  NCM5_TEST.forEach((it, k) => check(`test Q${k + 1}`, it.gen!(it.level)))
}
const topic = findTopic('y9-indices')
if (!topic || topic.test?.length !== 16) fail('topic', 'topic missing or test is not 16 questions')
if (topic && topic.skills.filter((s) => s.tag !== 'extension').map((s) => s.ref).join(',') !== ['5.01', '5.02', '5.03', '5.04', '5.05', '5.06', '5.07', '5.08', '5.09'].map((e) => `NCM 9 Ex ${e}`).join(',')) fail('topic', 'core skills out of exercise order')
for (const it of NCM5_TEST) if (!NCM5_SKILLS.some((s) => s.id === it.skill && s.tag !== 'extension')) fail('topic', `test skill ${it.skill} missing or extension`)
// the textbook's examples, counted and rounded by this file's own rules
for (const [s, n] of [['63.70', 4], ['0.00305', 3], ['7600', 2], ['47321', 5], ['0.0001592', 4], ['809000', 3], ['0.02070', 4]] as [string, number][]) if (countSFStr(s) !== n) fail('sf rules', `${s} should have ${n}`)
for (const [s, sf, r] of [['56.357', 3, 56.4], ['9.249', 3, 9.25], ['548307', 3, 548000], ['0.00739', 1, 0.007], ['0.025', 1, 0.03], ['0.963', 1, 1], ['2.675', 3, 2.68]] as [string, number, number][]) if (sfRoundStr(s, sf) !== r) fail('sf rules', `${s} to ${sf} should be ${r}, got ${sfRoundStr(s, sf)}`)
console.log(`${failures === 0 ? 'PASS' : 'FAIL'}: ${failures} failures, ${independent} answers re-worked independently`)
console.log(Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(' · '))
process.exit(failures ? 1 : 0)
