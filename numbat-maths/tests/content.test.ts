// Generates many questions for every skill and level and checks them:
//  - no NaN/undefined/Infinity anywhere
//  - the stored answer is accepted by the marker (self-consistency)
//  - multiple-choice options are distinct
//  - where the prompt is a plain arithmetic expression, an independent evaluation agrees with the answer
import { setSeed } from '../src/lib/maths/rand'
import { checkAnswer, answerText } from '../src/lib/maths/check'
import type { Level, Question, Topic } from '../src/lib/maths/types'
import { ALL_TOPICS } from '../src/content/index'
import { parse, evaluate, equivalent, variables } from '../src/lib/maths/expr'

const N = Number(process.env.N ?? 400)
const only = process.env.ONLY
let failures = 0
let checked = 0
let independent = 0
const fail = (id: string, lvl: number, msg: string, qn?: Question) => {
  failures++
  if (failures < 60) console.log(`FAIL ${id} L${lvl}: ${msg}` + (qn ? `\n   prompt: ${strip(qn.prompt).slice(0, 220)}\n   answer: ${JSON.stringify(qn.answer).slice(0, 200)}` : ''))
}

function strip(html: string): string {
  return html
    .replace(/<span class="frac"[^>]*><span class="fn">(.*?)<\/span><span class="fd">(.*?)<\/span><\/span>/g, '(($1)/($2))')
    .replace(/<sup>(.*?)<\/sup>/g, '^($1)')
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&ensp;|&#9633;/g, ' ')
}

/** Independent evaluation of the expression inside <div class="big"> for "Calculate/Evaluate" prompts. */
function independentValue(qn: Question): number | null {
  if (!/^(Calculate|Evaluate)/.test(qn.prompt)) return null
  const m = qn.prompt.match(/<div class="big">(.*)<\/div>/)
  if (!m) return null
  let s = m[1]
  if (/sqrt|root-idx/.test(s)) {
    s = s.replace(/<span class="sqrt"><sup class="root-idx">3<\/sup>√<span class="rad">(.*?)<\/span><\/span>/g, 'Math.cbrt($1)')
    s = s.replace(/<span class="sqrt">√<span class="rad">(.*?)<\/span><\/span>/g, 'Math.sqrt($1)')
  }
  s = strip(s)
    .replace(/−/g, '-')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/ /g, ' ')
    .replace(/\^/g, '**')
  // mixed numbers "2 (3)/(4)" -> (2+3/4)
  s = s.replace(/(\d+)\s+\((\d+)\)\/\((\d+)\)/g, '($1+$2/$3)')
  s = s.replace(/(\d) (\d{3})/g, '$1$2')
  if (/[a-zA-Z]/.test(s.replace(/Math\.(sqrt|cbrt)/g, ''))) return null
  // unary minus before ** needs brackets in JS: -2**2 is a syntax error
  s = s.replace(/(^|[^\w)])-(\d+(?:\.\d+)?)\*\*/g, '$1(-$2)**')
  try {
    // eslint-disable-next-line no-new-func
    const val = Function(`"use strict"; return (${s});`)()
    return typeof val === 'number' && Number.isFinite(val) ? val : null
  } catch {
    return null
  }
}


/** Converts question HTML maths to an ASCII expression for the parser. */
function htmlToExpr(html: string): string | null {
  if (/sqrt|root-idx/.test(html)) return null
  let s = html
  for (let k = 0; k < 3; k++)
    s = s.replace(/<span class="frac"[^>]*><span class="fn">((?:(?!<span class="frac").)*?)<\/span><span class="fd">((?:(?!<span class="frac").)*?)<\/span><\/span>/g, '(($1)/($2))')
  s = s.replace(/<sup>(.*?)<\/sup>/g, '^($1)')
  s = s.replace(/<[^>]*>/g, '').replace(/\u2212/g, '-').replace(/×/g, '*').replace(/÷/g, '/').replace(/\u2009/g, '')
  if (/[^0-9a-zA-Z+\-*/^(). =]/.test(s)) return null
  return s
}

/** Independent algebra check: Solve → substitute; Simplify/Expand/Factorise → equivalence. */
function independentAlgebra(qn: Question): boolean | null {
  const m = qn.prompt.match(/<div class="big">(.*)<\/div>/)
  if (!m) return null
  const e = htmlToExpr(m[1])
  if (!e) return null
  try {
    if (/^Solve/.test(qn.prompt) && (qn.answer.kind === 'num' || qn.answer.kind === 'frac') && e.includes('=')) {
      const [l, r] = e.split('=')
      const L = parse(l)
      const R = parse(r)
      const vars = [...new Set([...variables(L), ...variables(R)])]
      if (vars.length !== 1) return null
      const val = qn.answer.kind === 'num' ? qn.answer.value : qn.answer.n / qn.answer.d
      const env = { [vars[0]]: val }
      return Math.abs(evaluate(L, env) - evaluate(R, env)) < 1e-6
    }
    if (/^(Simplify|Expand|Factorise)/.test(qn.prompt) && qn.answer.kind === 'expr' && !e.includes('=')) {
      return equivalent(parse(e), parse(qn.answer.expr))
    }
  } catch {
    return null
  }
  return null
}

function valueOf(qn: Question): number | null {
  const a = qn.answer
  if (a.kind === 'num') return a.value
  if (a.kind === 'frac') return a.n / a.d
  return null
}

for (const topic of ALL_TOPICS as Topic[]) {
  for (const skill of topic.skills) {
    if (only && !skill.id.startsWith(only)) continue
    for (const lvl of [1, 2, 3] as Level[]) {
      for (let i = 0; i < N; i++) {
        setSeed(i * 7919 + lvl * 104729 + skill.id.length * 13)
        let qn: Question
        try {
          qn = skill.gen(lvl)
        } catch (e) {
          fail(skill.id, lvl, 'threw ' + (e as Error).message)
          break
        }
        checked++
        const blob = qn.prompt + (qn.diagram ?? '') + qn.steps.join(' ') + qn.hint + JSON.stringify(qn.answer)
        if (/NaN|undefined|Infinity|\[object/.test(blob)) {
          fail(skill.id, lvl, 'bad text: ' + (blob.match(/.{0,40}(NaN|undefined|Infinity|\[object).{0,40}/)?.[0] ?? ''), qn)
          continue
        }
        if (!qn.steps.length || !qn.prompt) fail(skill.id, lvl, 'empty prompt or steps', qn)
        if (qn.diagram && qn.diagram.includes('<svg') && /<(i|sup|b|div|p|br)[ >]/.test(qn.diagram)) fail(skill.id, lvl, 'HTML tag inside SVG diagram', qn)
        if (/<svg/.test(qn.prompt)) fail(skill.id, lvl, 'SVG inside prompt', qn)
        const a = qn.answer
        if (a.kind === 'mc') {
          if (new Set(a.options).size !== a.options.length) fail(skill.id, lvl, 'duplicate MC options: ' + a.options.join(' | '), qn)
          if (a.correct < 0 || a.correct >= a.options.length) fail(skill.id, lvl, 'bad mc index', qn)
          if (!checkAnswer(a, String(a.correct)).correct) fail(skill.id, lvl, 'mc self-check failed', qn)
          continue
        }
        if (a.kind === 'num' && !Number.isFinite(a.value)) fail(skill.id, lvl, 'non-finite answer', qn)
        const txt = answerText(a)
        const r = checkAnswer(a, txt)
        if (!r.correct) fail(skill.id, lvl, `answer text "${txt}" not accepted: ${r.feedback ?? ''}`, qn)
        const ia = independentAlgebra(qn)
        if (ia !== null) {
          independent++
          if (!ia) fail(skill.id, lvl, 'independent algebra check failed', qn)
        }
        const iv = independentValue(qn)
        const val = valueOf(qn)
        if (iv !== null && val !== null) {
          independent++
          if (Math.abs(iv - val) > 1e-6 * Math.max(1, Math.abs(iv))) fail(skill.id, lvl, `independent value ${iv} != answer ${val}`, qn)
        }
      }
    }
  }
}
console.log(`checked ${checked} questions, ${independent} independently evaluated, ${failures} failures`)
if (failures) process.exit(1)
