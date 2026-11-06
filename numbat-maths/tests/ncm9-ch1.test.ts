// Independent checks for Year 9 Algebra (New Century Maths 9, Chapter 1).
// Each answer is checked against the expression printed in the question, by evaluating both at random
// values (so the generator's own working is never trusted); worded questions are re-read from their
// words; substitution questions are re-evaluated; "is this correct?" questions are tested for all values;
// factorised answers must be fully factorised; fraction answers must be in lowest terms; wrong options
// must really be wrong. Area diagrams are read back from the SVG. Wording is scanned for slips.
// Usage: npx tsx tests/ncm9-ch1.test.ts   (N per skill and level, default 400)
import { setSeed, random } from '../src/lib/maths/rand'
import { answerText, checkAnswer } from '../src/lib/maths/check'
import { isFullyFactorised, isLowestTerms, parse, normalise } from '../src/lib/maths/expr'
import type { Answer, Level, Question } from '../src/lib/maths/types'
import { NCM1_9_SKILLS, NCM1_9_TEST } from '../src/content/y9-ncm1'
import { findTopic } from '../src/content/index'

const N = Number(process.env.N ?? 400)
let failures = 0
let independent = 0
const counts: Record<string, number> = {}
const fail = (id: string, msg: string, qn?: Question) => {
  failures++
  if (failures <= 40) console.log(`FAIL ${id}: ${msg}` + (qn ? `\n   ${plainOf(qn.prompt).slice(0, 220)}\n   answer ${JSON.stringify(qn.answer).slice(0, 200)}` : ''))
}

// ---------------------------------------------------------------- reading the page's maths as plain text

/** HTML maths -> plain text: fractions as ((a)/(b)), powers as ^n, true minus as - */
function plainOf(html: string): string {
  let s = html
  // innermost fractions first, repeatedly
  for (let i = 0; i < 4; i++) s = s.replace(/<span class="frac"[^>]*><span class="fn">((?:(?!<span class="frac").)*?)<\/span><span class="fd">((?:(?!<span class="frac").)*?)<\/span><\/span>/g, '(($1)/($2))')
  return s
    .replace(/<sup>(.*?)<\/sup>/g, '^($1)')
    .replace(/<div class="big">(.*?)<\/div>/g, ' [[$1]] ')
    .replace(/<[^>]*>/g, '')
    .replace(/−/g, '-')
    .replace(/×/g, '*')
    // "a ÷ 9m" divides by the whole term 9m
    .replace(/÷\s*(-?[\d.]*[a-z](?:[a-z]|\^\(\d+\))*)/g, '/ ($1)')
    .replace(/÷/g, '/')
    .replace(/\s+/g, ' ')
    .trim()
}
/** plain maths -> a JS function of its pronumerals */
function fnOf(plain: string): ((env: Record<string, number>) => number) | null {
  let s = plain.replace(/\s+/g, '')
  s = s.replace(/\^\((-?\d+)\)/g, '^$1')
  // implicit multiplication
  for (let i = 0; i < 3; i++) s = s.replace(/(\d|\)|[a-zA-Z])(?=[a-zA-Z(])/g, '$1*')
  s = s.replace(/([a-zA-Z]|\))\^(\d+)/g, '$1**$2').replace(/(\d+)\^(\d+)/g, '$1**$2')
  // unary minus before a power needs brackets in JS
  s = s.replace(/(^|[(*/+-])-([a-zA-Z0-9.]+\*\*\d+)/g, '$1-($2)')
  if (/[^0-9a-zA-Z+\-*/(). ]/.test(s)) return null
  try {
    // eslint-disable-next-line no-new-func
    const f = Function('env', `"use strict"; with (env) { return (${s}); }`.replace('"use strict"; ', '')) as (env: Record<string, number>) => number
    return f
  } catch {
    return null
  }
}
const letters = (plain: string) => Array.from(new Set(plain.match(/[a-zA-Z]/g) ?? []))
/** two plain expressions are equal for several random values of their pronumerals */
function same(a: string, b: string): boolean | null {
  const fa = fnOf(a)
  const fb = fnOf(b)
  if (!fa || !fb) return null
  const ls = Array.from(new Set([...letters(a), ...letters(b)]))
  for (let k = 0; k < 6; k++) {
    const env: Record<string, number> = {}
    for (const l of ls) env[l] = Math.round((random() * 6 - 3) * 1000) / 1000 + 0.37
    let x: number
    let y: number
    try {
      x = fa(env)
      y = fb(env)
    } catch {
      return null
    }
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue
    if (Math.abs(x - y) > 1e-6 * Math.max(1, Math.abs(x))) return false
  }
  return true
}
const big = (qn: Question) => plainOf(qn.prompt).match(/\[\[(.*?)\]\]/)?.[1] ?? null
const answerPlain = (a: Answer) => (a.kind === 'expr' ? a.expr : a.kind === 'mc' ? plainOf(a.options[a.correct]) : a.kind === 'num' ? String(a.value) : '')
const optionsPlain = (a: Answer) => (a.kind === 'mc' ? a.options.map(plainOf) : [])

// ---------------------------------------------------------------- worded questions, re-read from their words

function phraseToExpr(w: string): string | null {
  const t = w.trim()
  const rules: [RegExp, (m: RegExpMatchArray) => string][] = [
    [/^the sum of (\w) and (\d+)$/, (m) => `${m[1]} + ${m[2]}`],
    [/^(\w) divided by (\d+)(\w)$/, (m) => `${m[1]}/(${m[2]}${m[3]})`],
    [/^(\w) divided by (\d+)$/, (m) => `${m[1]}/${m[2]}`],
    [/^(\d+) less than (\w)$/, (m) => `${m[2]} - ${m[1]}`],
    [/^the product of (\w) and (\d+)$/, (m) => `${m[1]}*${m[2]}`],
    [/^the product of (\w) and (\w)$/, (m) => `${m[1]}*${m[2]}`],
    [/^increase (\d+) by (\w)$/, (m) => `${m[1]} + ${m[2]}`],
    [/^multiply (\w) by (\d+)$/, (m) => `${m[1]}*${m[2]}`],
    [/^the difference between (\w) and (\d+)$/, (m) => `${m[1]} - ${m[2]}`],
    [/^the difference between (\d+)(\w) and (\d+)(\w)$/, (m) => `${m[1]}*${m[2]} - ${m[3]}*${m[4]}`],
    [/^divide (\d+) by (\w)$/, (m) => `${m[1]}/${m[2]}`],
    [/^decrease (\w) by (\d+)$/, (m) => `${m[1]} - ${m[2]}`],
    [/^decrease (\d+)(\w) by (\d+)(\w)$/, (m) => `${m[1]}*${m[2]} - ${m[3]}*${m[4]}`],
    [/^(\d+) decreased by (\w)$/, (m) => `${m[1]} - ${m[2]}`],
    [/^(\d+) more than (\w)$/, (m) => `${m[2]} + ${m[1]}`],
    [/^(\w) multiplied by itself$/, (m) => `${m[1]}*${m[1]}`],
    [/^subtract (\d+) from (\w)$/, (m) => `${m[2]} - ${m[1]}`],
    [/^subtract (\d+)(\w) from (\d+)(\w)$/, (m) => `${m[3]}*${m[4]} - ${m[1]}*${m[2]}`],
    [/^take (\w) away from (\d+)$/, (m) => `${m[2]} - ${m[1]}`],
    [/^(\d+) lots of (\w)$/, (m) => `${m[1]}*${m[2]}`],
    [/^double (\w)$/, (m) => `2*${m[1]}`],
    [/^the square of (\w)$/, (m) => `${m[1]}*${m[1]}`],
    [/^how many times (\w) goes into (\w)$/, (m) => `${m[2]}/${m[1]}`],
    [/^(\d+) less than double (\w)$/, (m) => `2*${m[2]} - ${m[1]}`],
    [/^(\d+) more than half of (\w)$/, (m) => `${m[2]}/2 + ${m[1]}`],
    [/^one-third of the product of (\w) and (\w)$/, (m) => `${m[1]}*${m[2]}/3`],
    [/^three times (\w), less (\d+)$/, (m) => `3*${m[1]} - ${m[2]}`],
    [/^(\d+) less than twice (\w)$/, (m) => `2*${m[2]} - ${m[1]}`],
    [/^(\d+) more than negative (\w)$/, (m) => `-${m[2]} + ${m[1]}`],
    // expressions described in words (Q4 style)
    [/^subtract (\w) from (\d+)$/, (m) => `${m[2]} - ${m[1]}`],
    [/^subtract (\d+) from (\w)$/, (m) => `${m[2]} - ${m[1]}`],
    [/^divide (\w) by (\d+)$/, (m) => `${m[1]}/${m[2]}`],
    [/^double (\w), then add (\d+)$/, (m) => `2*${m[1]} + ${m[2]}`],
    [/^subtract 3 lots of (\w) from (\d+)$/, (m) => `${m[2]} - 3*${m[1]}`],
    [/^double the square of (\w)$/, (m) => `2*${m[1]}^2`],
    [/^(\d+) more than a quarter of (\w)$/, (m) => `${m[2]}/4 + ${m[1]}`],
  ]
  for (const [re, f] of rules) {
    const m = t.match(re)
    if (m) return f(m)
  }
  return null
}

function thinkToExpr(n: string, w: string): string | null {
  let m = w.match(/^multiply it by (\d+) and then (add|subtract) (\d+)$/)
  if (m) return `${n}*${m[1]} ${m[2] === 'add' ? '+' : '-'} ${m[3]}`
  m = w.match(/^(add|subtract) (\d+) and then (multiply|divide) by (\d+)$/)
  if (m) return `(${n} ${m[1] === 'add' ? '+' : '-'} ${m[2]}) ${m[3] === 'multiply' ? '*' : '/'} ${m[4]}`
  m = w.match(/^divide it by (\d+) and then (add|subtract) (\d+)$/)
  if (m) return `${n}/${m[1]} ${m[2] === 'add' ? '+' : '-'} ${m[3]}`
  return null
}

function contextExpr(text: string): string | null {
  const t = text.replace(/’/g, "'")
  const rules: [RegExp, (m: RegExpMatchArray) => string][] = [
    [/is (\d+) years old\. .*age in (\w) years' time/, (m) => `${m[1]} + ${m[2]}`],
    [/is (\d+) years old\. .*age (\w) years ago/, (m) => `${m[1]} - ${m[2]}`],
    [/costs \$([\d.]+) plus \$([\d.]+) per kilometre.* trip of (\w) km/, (m) => `${m[1]} + ${m[2]}*${m[3]}`],
    [/cost, in dollars, of (\w) books at \$(\w) each/, (m) => `${m[1]}*${m[2]}`],
    [/GST of \$(\w) is added to a marked price of \$(\d+)/, (m) => `${m[2]} + ${m[1]}`],
    [/number of metres in (\w) km/, (m) => `1000*${m[1]}`],
    [/the average of ([\w, ]+) and (\w)\.$/, (m) => `(${[...m[1].split(', '), m[2]].join(' + ')})/${m[1].split(', ').length + 1}`],
    [/number of dollars in (\w) cents/, (m) => `${m[1]}/100`],
    [/a \$([\d ]+) TV sells for \$(\w)/, (m) => `${m[1].replace(/ /g, '')} - ${m[2]}`],
    [/change, in dollars, from \$100 after buying (\w) tickets at \$(\d+) each/, (m) => `100 - ${m[2]}*${m[1]}`],
    [/when \$(\d+) is shared equally among (\w) people/, (m) => `${m[1]}/${m[2]}`],
    [/other two angles are (\w)° and (\w)°/, (m) => `180 - ${m[1]} - ${m[2]}`],
    [/unequal angle is (\w)°/, (m) => `(180 - ${m[1]})/2`],
    [/for a (\d+) kg roast that needs (\w) minutes per kilogram plus (\d+) minutes extra/, (m) => `${m[1]}*${m[2]} + ${m[3]}`],
    [/next consecutive number after (\w) \+ (\d+)/, (m) => `${m[1]} + ${Number(m[2]) + 1}`],
    [/next odd number after the even number (\w)/, (m) => `${m[1]} + 1`],
    [/next even number after the even number (\w)/, (m) => `${m[1]} + 2`],
  ]
  for (const [re, f] of rules) {
    const m = t.match(re)
    if (m) return f(m)
  }
  return null
}

// ---------------------------------------------------------------- the checks

function check(id: string, qn: Question): string | null {
  const m = qn.meta as Record<string, any> & { t: string }
  const ans = qn.answer
  const text = plainOf(qn.prompt)
  const shown = big(qn)
  const right = answerPlain(ans)
  const mcWrongsDiffer = (expected: string) => {
    if (ans.kind !== 'mc') return null
    const opts = optionsPlain(ans)
    for (let i = 0; i < opts.length; i++) {
      if (i === ans.correct || !same(opts[i], expected)) continue
      // "factorise completely": an equal but only partly factorised option is rightly wrong
      if (m.t === 'factor' && !isFullyFactorised(parse(normalise(opts[i]))).ok) continue
      return `wrong option ${opts[i]} is also right`
    }
    return null
  }
  switch (m.t) {
    case 'words': {
      const e = phraseToExpr(m.words)
      if (!e) return `could not read the words "${m.words}"`
      if (same(right, e) !== true) return `answer ${right} is not "${m.words}" (${e})`
      return mcWrongsDiffer(e)
    }
    case 'think': {
      const w = text.match(/^Think of a number \((\w)\), (.*?)\. Write/)
      const e = w ? thinkToExpr(w[1], w[2]) : null
      if (!e) return 'could not read the steps'
      return same(right, e) === true ? null : `answer ${right} should be ${e}`
    }
    case 'toWords': {
      const e = phraseToExpr(right)
      const exprShown = text.match(/describe the expression (.*)\?$/)?.[1] ?? ''
      if (!e) return `could not read "${right}"`
      if (same(e, exprShown) !== true) return `"${right}" is not ${exprShown}`
      for (const o of optionsPlain(ans)) if (o !== right) {
        const oe = phraseToExpr(o)
        if (oe && same(oe, exprShown) === true) return `option "${o}" also describes it`
      }
      return null
    }
    case 'ctx': {
      if (m.kind === 'call') {
        const fee = Number(text.match(/connection fee of \$([\d.]+)/)![1])
        const per = Number(text.match(/plus \$([\d.]+) per minute/)![1])
        const k = text.match(/lasting (\w) minutes/)![1]
        const r = right.replace(/^\$\(|\)$/g, '')
        return same(r, `${fee} + ${per}*${k}`) === true ? null : 'call cost wrong'
      }
      const e = contextExpr(text)
      if (!e) return `could not read the situation: ${text}`
      return same(right, e) === true ? null : `answer ${right} should be ${e}`
    }
    case 'sub': {
      const f = fnOf(m.expr)
      if (!f) return `could not read ${m.expr}`
      // the values printed in the question are the ones used
      for (const [k, val] of Object.entries(m.vals as Record<string, number>)) {
        const got = text.match(new RegExp(`\\b${k} = (-?\\d+(?:\\.\\d+)?)`))
        // formulas give some values in words ("length 4.7 cm"): then the number must still be in the question
        if (got ? Number(got[1]) !== val : !text.includes(String(val).replace('-', '-'))) return `value of ${k} printed as ${got?.[1]}`
      }
      const want = f(m.vals)
      const got = ans.kind === 'mc' ? Number(right) : (ans as any).value
      if (ans.kind === 'num' && ans.dp !== undefined) return Math.abs(Math.round(got * 10 ** ans.dp) - Math.round(want * 10 ** ans.dp)) < 1e-9 && /decimal place/.test(text) ? null : `should be ${want} (rounded, and the question must say so)`
      if (!Number.isInteger(Math.round(want * 1e6) / 1e3)) return `answer ${want} needs rounding but the question doesn't say how`
      return Math.abs(got - want) < 1e-9 ? null : `should be ${want}`
    }
    case 'collect':
    case 'collect-mc':
    case 'prod':
    case 'prod-mc':
    case 'quot':
    case 'frac-sum':
    case 'frac-expr':
    case 'frac-ops':
    case 'expand':
    case 'factor':
    case 'pp-expr': {
      // the printed expression and the answer are equal for every value
      let printed = shown ?? text.match(/^(?:Simplify|Expand|Factorise) (.*?)( completely)?\.$/)?.[1] ?? text.match(/area diagram to expand (.*)\.$/)?.[1] ?? null
      // areas and volumes: multiply the dimensions given in the words or on the diagram
      const dims = text.match(/measures (\S+) by (\S+) by (\S+)\./)
      const tri = text.match(/base of (\S+) and a perpendicular height of (\S+)\./)
      if (!printed && dims) printed = `(${dims[1]})*(${dims[2]})*(${dims[3]})`
      if (!printed && tri) printed = `(${tri[1]})*(${tri[2]})/2`
      const cons = text.match(/^(.*) stands for an integer\. .* that is (\d+) more than it/)
      if (!printed && cons) printed = `${cons[1]} + ${cons[2]}`
      const garden = text.match(/longer sides are each (\d+) m longer than its shorter sides\. The longer sides are (\w) m long\. .*garden.s (area|perimeter)\./)
      if (!printed && garden) printed = garden[3] === 'area' ? `${garden[2]}*(${garden[2]} - ${garden[1]})` : `2*${garden[2]} + 2*(${garden[2]} - ${garden[1]})`
      const rect = text.match(/has length (.*) and width (.*)\. Write/)
      if (!printed && rect) printed = `(${rect[1]})*(${rect[2]})`
      const grow = text.match(/is (\d+) cm long and (\d+) cm wide\. Its length and width are both increased by (\w) cm/)
      if (!printed && grow) printed = `(${grow[1]} + ${grow[3]})*(${grow[2]} + ${grow[3]}) - ${grow[1]}*${grow[2]}`
      if (!printed && /area of this rectangle/.test(text) && qn.diagram) {
        const labs = [...qn.diagram.matchAll(/<text class="dl[^"]*"[^>]*>(.*?)<\/text>/g)].map((u) => plainOf(u[1].replace(/<tspan class="it">(.*?)<\/tspan>/g, '$1')))
        if (labs.length === 2) printed = `(${labs[0]})*(${labs[1]})`
      }
      const target = printed
      if (!target) return `could not find the expression in ${text}`
      const ok = same(target, right)
      if (ok !== true) return `answer ${right} is not equal to ${target} (${ok})`
      // form: factorised / lowest terms / expanded, judged on the answer itself
      if (m.t === 'factor') {
        const node = parse(normalise(right))
        if (!isFullyFactorised(node).ok) return `answer ${right} is not fully factorised`
        if (m.neg && !right.trim().startsWith('-')) return 'negative HCF not taken out'
      }
      if (/frac|quot/.test(m.t) && ans.kind === 'expr' && !isLowestTerms(parse(normalise(right))).ok) return `answer ${right} not in lowest terms`
      return mcWrongsDiffer(target)
    }
    case 'hcf': {
      // HCF of two terms, worked out separately
      const parts = [m.a, m.b].map((t: string) => {
        const c = Number(t.match(/^-?\d*/)![0] || 1)
        const p: Record<string, number> = {}
        for (const u of t.matchAll(/([a-z])(?:\^(\d+))?/g)) p[u[1]] = (p[u[1]] ?? 0) + Number(u[2] ?? 1)
        return { c: Math.abs(c), p }
      })
      const g = (x: number, y: number): number => (y ? g(y, x % y) : x)
      let h = String(g(parts[0].c, parts[1].c))
      for (const k of Object.keys(parts[0].p)) if (k in parts[1].p) h += `*${k}^${Math.min(parts[0].p[k], parts[1].p[k])}`
      if (same(right, h) !== true) return `HCF should be ${h}`
      // the printed terms match
      if (!/Complete the factorisation/.test(text)) {
        const shownTerms = text.match(/HCF\) of (.*) and (.*)\.$/)
        if (!shownTerms || same(shownTerms[1], m.a) !== true || same(shownTerms[2], m.b) !== true) return 'printed terms differ'
      } else {
        const eq = shown!.split('=')
        const box = eq[1].replace('□', `(${right})*`)
        if (same(eq[0], box) !== true) return `box value ${right} does not complete it`
      }
      return null
    }
    case 'subtest': {
      const L = fnOf(m.lhs)!
      const R = fnOf(m.rhs)!
      const atVals = Math.abs(L(m.vals) - R(m.vals)) < 1e-9
      const always = same(m.lhs, m.rhs) === true
      const said = right
      // "Correct" must be true for every value, not just the one tried
      if (said === 'Correct' && !always) return 'marked correct but the expressions differ'
      if (said === 'Incorrect' && atVals) return 'marked incorrect but the values agree'
      // the printed equation is the one tested
      if (same(shown!.split('=')[0], m.lhs) !== true || same(shown!.split('=')[1], m.rhs) !== true) return 'printed equation differs'
      return null
    }
    case 'perim': {
      const sum = (m.sides as string[]).map((s) => `(${s})`).join(' + ')
      return same(right, sum) === true ? null : `perimeter should be ${sum}`
    }
    case 'side':
      return same(`${m.n}*(${right})`, m.per) === true ? null : 'side length wrong'
    case 'sqside':
      return same(`(${right})^2`, `${m.k}*${m.x}^2`) === true ? null : 'square side wrong'
    default:
      return `no check for ${m.t}`
  }
}

/** area diagrams: the labelled parts multiply out to the expression in the question */
function checkArea(qn: Question): string | null {
  if (!qn.diagram?.includes('Area diagram')) return null
  const labels = [...qn.diagram.matchAll(/<text class="dl small" x="([\d.]+)" y="([\d.]+)" text-anchor="(\w+)"[^>]*>(.*?)<\/text>/g)].map((u) => ({ x: Number(u[1]), y: Number(u[2]), anchor: u[3], s: plainOf(u[4].replace(/<tspan class="it">(.*?)<\/tspan>/g, '$1').replace(/<tspan[^>]*>(.*?)<\/tspan>/g, '^($1)')) }))
  const cols = labels.filter((l) => l.anchor === 'middle' && l.y < 30).map((l) => l.s)
  const rows = labels.filter((l) => l.anchor === 'end').map((l) => l.s)
  const product = `(${cols.join(' + ')})*(${rows.join(' + ')})`
  const expr = plainOf(qn.prompt).match(/expand (.*)\.$/)?.[1]
  if (!expr) return 'no expression'
  return same(product, expr) === true ? null : `diagram parts ${product} don't match ${expr}`
}

// ---------------------------------------------------------------- wording and self-checks

const SLIPS = [/NaN|undefined|Infinity|\[object/, /\+ −|− −|\+ -|- -/, /(?<![\d.])1[a-z]\b(?![a-z])/, /(?<![\d.])0[a-z]\b/, /\^1\b/, /(?<![\d.])1 (units|minutes|years)\b/]
function wording(id: string, qn: Question) {
  const all = [qn.prompt, ...qn.steps, qn.hint].map(plainOf).join(' | ')
  for (const re of SLIPS) if (re.test(all)) fail(id, `wording slip ${re}: "${all.match(re)?.[0]}" in ${all.slice(0, 160)}`, qn)
  if (/-\d/.test(qn.steps.join(' ').replace(/<[^>]*>/g, '').replace(/\d-\d/g, ''))) fail(id, `hyphen used as a minus sign in the working: ${qn.steps.join(' | ').replace(/<[^>]*>/g, '').slice(0, 160)}`, qn)
  if (!qn.steps.length) fail(id, 'no worked steps', qn)
  const shownAns = qn.answer.kind === 'mc' ? null : answerText(qn.answer)
  if (shownAns !== null && !checkAnswer(qn.answer, shownAns).correct) fail(id, `marking rejects its own answer "${shownAns}"`, qn)
  if (qn.answer.kind === 'mc') {
    const o = qn.answer.options.map(plainOf)
    if (new Set(o).size !== o.length) fail(id, `repeated options ${o.join(' / ')}`, qn)
    if (o.length < 3 && !o.includes('Correct')) fail(id, `only ${o.length} options`, qn)
  }
}

for (const skill of NCM1_9_SKILLS)
  for (const lvl of [1, 2, 3] as Level[])
    for (let i = 0; i < N; i++) {
      setSeed(lvl * 100003 + i * 11 + skill.id.length)
      const qn = skill.gen(lvl)
      const key = `${skill.id} L${lvl} ${(qn.meta as { t: string }).t}`
      counts[key] = (counts[key] ?? 0) + 1
      wording(skill.id, qn)
      let r: string | null
      try {
        r = check(skill.id, qn) ?? checkArea(qn)
      } catch (e) {
        r = 'check crashed: ' + String(e).slice(0, 160)
      }
      if (r) fail(`${skill.id} L${lvl}`, r, qn)
      else independent++
    }

const topic = findTopic('y9-algebra')!
if (topic.test !== NCM1_9_TEST || NCM1_9_TEST.length !== 16) fail('test', 'topic test is not the 16-question chapter test')
const order = NCM1_9_TEST.map((t) => NCM1_9_SKILLS.findIndex((s) => s.id === t.skill))
if (order.some((x, i) => x < 0 || (i > 0 && x < order[i - 1]))) fail('test', 'test questions are not in textbook order')
for (const t of NCM1_9_TEST) {
  setSeed(7)
  const qn = t.gen!(t.level)
  const r = check(t.skill, qn)
  if (r) fail('test ' + t.skill, r, qn)
}
for (const s of NCM1_9_SKILLS) {
  if (!s.ref) fail(s.id, 'no textbook label')
  if ((s.id === 'y9-alg-powerplus') !== (s.tag === 'extension')) fail(s.id, 'extension label wrong')
}

console.log(Object.entries(counts).sort().map(([k, n]) => `${k}: ${n}`).join('\n'))
console.log(`\n${independent} answers re-worked independently`)
if (failures) {
  console.log(`${failures} failures`)
  process.exit(1)
}
console.log('All Chapter 1 (Year 9) checks passed')
