// Independent checks for Year 9 Equations (New Century Maths 9, Chapter 7).
//  - Every equation is read back from the page and must be the one stored with the question (both sides agree at
//    test values); the answer is then substituted into it and must make it true.
//  - Multiple choice: exactly one option makes the equation true.
//  - Word problems and formulas are re-worked from the numbers in the words with formulas written here.
// Usage: npx tsx tests/ncm9-ch7.test.ts   (N per skill and level, default 400)
import { setSeed } from '../src/lib/maths/rand'
import { answerText, checkAnswer } from '../src/lib/maths/check'
import { evaluate, normalise, parse } from '../src/lib/maths/expr'
import type { Answer, Level, Question } from '../src/lib/maths/types'
import { NCM7_SKILLS, NCM7_TEST } from '../src/content/y9-ncm7'
import { findTopic } from '../src/content/index'

const N = Number(process.env.N ?? 400)
let failures = 0
let independent = 0
const counts: Record<string, number> = {}
const strip = (h: string) => h.replace(/<[^>]*>/g, '').replace(/&emsp;/g, ' ').replace(/\s+/g, ' ').trim()
const fail = (id: string, msg: string, qn?: Question) => {
  failures++
  if (failures <= Number(process.env.SHOW ?? 40)) console.log(`FAIL ${id}: ${msg}` + (qn ? `\n   ${strip(qn.prompt).slice(0, 220)}\n   answer ${JSON.stringify(qn.answer).slice(0, 160)}` : ''))
}
const done = (w: string) => {
  independent++
  counts[w] = (counts[w] ?? 0) + 1
}
const near = (a: number, b: number, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b))
const toExpr = (h: string) =>
  h
    .replace(/<span class="frac"[^>]*><span class="fn">(.*?)<\/span><span class="fd">(.*?)<\/span><\/span>/g, '(($1)/($2))')
    .replace(/<sup>(.*?)<\/sup>/g, '^($1)')
    .replace(/<[^>]*>/g, '')
    .replace(/−/g, '-')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/\s+/g, '')
const ev = (s: string, env: Record<string, number>) => evaluate(parse(normalise(s)), env)
/** the equation in the big box, as [left, right] */
function pageEquation(qn: Question): [string, string] | null {
  const big = qn.prompt.match(/<div class="big">(.*)<\/div>/)?.[1]
  if (!big) return null
  const parts = toExpr(big).split('=')
  return parts.length === 2 ? [parts[0], parts[1]] : null
}
const valueOf = (a: Answer): number | null => (a.kind === 'num' ? a.value : a.kind === 'frac' ? a.n / a.d : null)

function check(id: string, qn: Question) {
  const a = qn.answer
  const m = (qn.meta ?? {}) as Record<string, unknown>
  const t = m.t as string
  const p = strip(qn.prompt)
  if (a.kind === 'mc') {
    if (new Set(a.options).size !== a.options.length) fail(id, 'duplicate options', qn)
  } else if (!checkAnswer(a, answerText(a)).correct) fail(id, `answer text "${answerText(a)}" not accepted`, qn)
  if (/NaN|undefined|Infinity|\$\{/.test(qn.prompt + qn.steps.join(' ') + qn.hint)) fail(id, 'bad text', qn)

  switch (t) {
    case 'eq':
    case 'eqMC': {
      const x = m.x as string
      const eq = pageEquation(qn)
      if (!eq) return fail(id, 'equation not read', qn)
      // the page shows the stored equation
      for (const tv of [1.37, -2.61, 4.05]) {
        const env = { [x]: tv }
        if (!near(ev(eq[0], env) - ev(eq[1], env), ev(m.lhs as string, env) - ev(m.rhs as string, env), 1e-9) && !near(ev(eq[0], env) - ev(eq[1], env), -(ev(m.lhs as string, env) - ev(m.rhs as string, env)), 1e-9)) {
          return fail(id, `page shows ${eq.join(' = ')}, stored ${m.lhs} = ${m.rhs}`, qn)
        }
      }
      const holds = (s: number) => near(ev(eq[0], { [x]: s }), ev(eq[1], { [x]: s }), 1e-9)
      if (t === 'eqMC') {
        if (a.kind !== 'mc') return fail(id, 'not mc', qn)
        const hits = a.options.map((o) => holds(Number(toExpr(o).split('=')[1])))
        if (hits.filter(Boolean).length !== 1 || !hits[a.correct]) fail(id, `options that solve it: ${hits.join(',')}`, qn)
        return done('equation (multiple choice)')
      }
      const s = valueOf(a)
      if (s === null || !holds(s)) return fail(id, `${s} doesn’t solve ${eq.join(' = ')}`, qn)
      if (!new RegExp(`^${x} =`).test(strip(qn.prefix ?? ''))) fail(id, 'answer prefix doesn’t name the letter', qn)
      return done('substituted back')
    }
    case 'whichSol': {
      if (a.kind !== 'mc') return fail(id, 'not mc', qn)
      const sol = m.sol as number
      const hits = a.options.map((o) => {
        const [l, r] = toExpr(o).split('=')
        return near(ev(l, { x: sol }), ev(r, { x: sol }), 1e-9)
      })
      if (hits.filter(Boolean).length !== 1 || !hits[a.correct]) fail(id, `equations true at ${sol}: ${hits.join(',')}`, qn)
      return done('which equation')
    }
    case 'problem':
      return checkProblem(id, qn, p, m)
    case 'quad': {
      const eq = pageEquation(qn)
      const x = m.x as string
      if (!eq || a.kind !== 'nums') return fail(id, 'not read', qn)
      // solve independently: the equation is a·x² + b = c·(something); find x² by evaluating at 0 and 1
      const f = (u: number) => ev(eq[0], { [x]: u }) - ev(eq[1], { [x]: u })
      const A = f(1) - f(0) // coefficient of x² (the equation is linear in x²)
      const sq = -f(0) / A
      const r = Math.sqrt(sq)
      const want = [r, -r].sort((u, w) => u - w)
      const got = a.values.slice().sort((u, w) => u - w)
      const dp = a.dp
      const eq2 = (u: number, w: number) => (dp === undefined ? near(u, w, 1e-9) : Math.round(u * 10 ** dp) === Math.round(w * 10 ** dp))
      if (got.length !== 2 || !got.every((g, i) => eq2(g, want[i]))) fail(id, `expected ±${r}`, qn)
      if (/one decimal place/.test(p) !== (dp === 1)) fail(id, 'rounding words and marking differ', qn)
      return done('quadratic solved')
    }
    case 'noSol': {
      if (a.kind !== 'mc') return fail(id, 'not mc', qn)
      const hits = a.options.map((o) => {
        const [l, r] = toExpr(o).split('=')
        const f = (u: number) => ev(l, { [o.match(/<i>([a-z])<\/i>/)![1]]: u }) - ev(r, {})
        const sq = -f(0) / (f(1) - f(0))
        return sq < 0
      })
      if (hits.filter(Boolean).length !== 1 || !hits[a.correct]) fail(id, `no-solution options: ${hits.join(',')}`, qn)
      return done('no solution')
    }
    case 'formula': {
      // formulas written again here, by their order in the content file
      const F: [string, string][] = [['y', '5*x+c'], ['F', '9*C/5+32'], ['P', '2*(l+w)'], ['C', '120+65*h'], ['v', 'u+a*t'], ['S', '180*(n-2)'], ['A', 'b*h/2'], ['C', '4.2+2.25*d']]
      const [subj, rhs] = F[m.idx as number]
      const env: Record<string, number> = {}
      // the values given after “when” (not the numbers in the formula itself)
      for (const g of (p.split(' when ')[1] ?? '').matchAll(/\b([A-Za-z]) = (−?\d+(?:\.\d+)?)/g)) env[g[1]] = Number(g[2].replace('−', '-'))
      const which = m.which as string
      const s = valueOf(a)
      if (s === null) return fail(id, 'answer not a number', qn)
      env[which] = s
      const letters = new Set<string>([...(rhs.match(/[A-Za-z]/g) ?? []), subj])
      for (const l of letters) if (env[l] === undefined) return fail(id, `value of ${l} not on the page`, qn)
      if (!near(env[subj], ev(rhs, env), 1e-9)) fail(id, `${subj} = ${env[subj]} but ${rhs} gives ${ev(rhs, env)}`, qn)
      return done('formula')
    }
    case 'hire': {
      const budget = Number(p.match(/has \$(\d+)/)?.[1])
      const h = Math.floor((budget - 120) / 65)
      if (a.kind !== 'num' || a.value !== h) fail(id, `expected ${h}`, qn)
      return done('formula: whole hours')
    }
    case 'agesLater': {
      const k = Number(p.match(/is (\d) times/)?.[1])
      const child = Number(p.match(/who is (\d+)/)?.[1])
      const n = k * child - 2 * child
      if (a.kind !== 'num' || a.value !== n || k * child + n !== 2 * (child + n)) fail(id, `expected ${n}`, qn)
      return done('ages in the future')
    }
    default:
      fail(id, `no check for ${t}`, qn)
  }
}

function checkProblem(id: string, qn: Question, p: string, m: Record<string, unknown>) {
  const a = qn.answer
  const n = (re: RegExp) => Number((p.match(re)?.[1] ?? 'NaN').replace(/[,$]/g, ''))
  const kind = m.kind as string
  let ok = false
  const val = valueOf(a)
  switch (kind) {
    case 'numberWords':
      ok = val !== null && n(/subtracted from (\d+) times/) * val - n(/When (\d+) is subtracted/) === n(/answer is (\d+)/)
      break
    case 'fraction': {
      const [pp, qq] = (p.match(/When ([\w/-]+) of a number/)?.[1] ?? '').replace('two-thirds', '2/3').split('/').map(Number)
      ok = val !== null && near((pp * val) / qq + n(/increased by (\d+)/), n(/result is (\d+)/))
      break
    }
    case 'double':
      ok = val !== null && val + n(/^(\d+) more than a number/) === 2 * val + n(/same as (\d+) more than double/)
      break
    case 'rectangle': {
      const k = n(/is (\d) times as long/)
      const P = n(/perimeter is ([\d.]+) cm/)
      const w = P / (2 + 2 * k)
      ok = val !== null && near(val, /Find its width/.test(p) ? w : k * w)
      break
    }
    case 'rectangleMore': {
      const d = n(/is ([\d.]+) cm more/)
      ok = val !== null && near(2 * (val + val + d), n(/perimeter is ([\d.]+) cm/))
      break
    }
    case 'consecutive':
    case 'consecutiveOdd': {
      if (a.kind !== 'nums') break
      const vs = a.values.slice().sort((x, y) => x - y)
      const step = kind === 'consecutive' ? 1 : 2
      const parity = /even/.test(p) ? 0 : /odd/.test(p) ? 1 : null
      ok = vs.reduce((s, x) => s + x, 0) === n(/is (\d+)\. Find/) && vs.every((x, i) => i === 0 || x - vs[i - 1] === step) && (parity === null || vs.every((x) => Math.abs(x % 2) === parity))
      const count = Number(p.match(/sum of (\d) consecutive/)?.[1])
      if (vs.length !== count) ok = false
      break
    }
    case 'ages': {
      const older = n(/is (\d+) years older/)
      const k = n(/mother is (\d) times/)
      ok = val !== null && val + (val - older) + k * val === n(/three ages is (\d+)/) && val - older > 0
      break
    }
    case 'change': {
      const cnt = n(/bought (\d) sandwiches/)
      ok = val !== null && Math.abs(cnt * val + n(/got \$([\d.]+) change/) - n(/from a \$(\d+) note/)) < 0.005
      break
    }
    case 'coins': {
      const mm = p.match(/only (\$?\d+)(?:-cent)? and (\$?\d+)(?:-cent)? coins: (\d+) coins altogether, worth \$(\d+(?:\.\d+)?)/)
      if (!mm) break
      const cents = !mm[1].startsWith('$')
      const lo = Number(mm[1].replace('$', ''))
      const hi = Number(mm[2].replace('$', ''))
      const total = Number(mm[3])
      const value = Number(mm[4]) * (cents ? 100 : 1)
      ok = val !== null && Math.round(hi * val + lo * (total - val)) === Math.round(value) && val >= 0 && val <= total
      break
    }
    case 'heights': {
      const diff = n(/and (\d+) cm shorter/)
      const total = Math.round(n(/add to ([\d.]+) m/) * 100)
      ok = val !== null && val + 2 * val + 2 * val + diff === total
      break
    }
    case 'agesChain': {
      const k = n(/is (\d) times as old/)
      const older = n(/who is (\d+) years older/)
      ok = val !== null && val + (val + older) + k * (val + older) === n(/three ages is (\d+)/)
      break
    }
    default:
      return fail(id, `no check for problem ${kind}`, qn)
  }
  if (!ok) fail(id, `${kind}: the answer doesn’t fit the words`, qn)
  done(`problem: ${kind}`)
}

for (const s of NCM7_SKILLS)
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
  NCM7_TEST.forEach((it, k) => check(`test Q${k + 1}`, it.gen!(it.level)))
}
const topic = findTopic('y9-equations')
if (!topic || topic.test?.length !== 16) fail('topic', 'topic missing or test is not 16 questions')
for (const it of NCM7_TEST) if (!NCM7_SKILLS.some((s) => s.id === it.skill && s.tag !== 'extension')) fail('topic', `test skill ${it.skill} missing or extension`)
console.log(`${failures === 0 ? 'PASS' : 'FAIL'}: ${failures} failures, ${independent} answers re-worked independently`)
console.log(Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(' · '))
process.exit(failures ? 1 : 0)
