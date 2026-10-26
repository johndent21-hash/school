// The correct answer, formatted for display after a question is marked.
import type { Answer, Question } from './maths/types'
import { answerText } from './maths/check'
import { ex, frac, mixed, num } from './maths/format'

export function answerHtml(a: Answer): string {
  switch (a.kind) {
    case 'num':
      // NSW digit grouping (90 000), keeping any required decimal places
      return a.dp !== undefined ? num(a.value, a.dp) : num(Number(a.value.toPrecision(12)))
    case 'mc':
      return a.options[a.correct]
    case 'expr':
      return ex(a.expr.replace(/\s*\*\s*(?=[a-zA-Z(])/g, ''))
    case 'frac': {
      if (a.d === 1 || (a.n / a.d) % 1 === 0) return answerText(a).replace(/-/g, '−')
      if (a.mixed) return mixed(a.n, a.d)
      const t = answerText(a)
      const [n, d] = t.split('/')
      return n.startsWith('-') ? '−' + frac(n.slice(1), d) : frac(n, d)
    }
    case 'sci':
    case 'primefactors':
      return ex(answerText(a).replace(/ × /g, '*'))
    default:
      return answerText(a).replace(/-/g, '−')
  }
}

/** "x = 5 cm" style answer line, including the question's prefix and suffix. */
export function fullAnswerHtml(q: Question): string {
  if (q.prefix === '$' && q.answer.kind === 'num') return '$' + num(q.answer.value, 2) + (q.suffix ? ' ' + q.suffix : '')
  const core = answerHtml(q.answer)
  if (q.answer.kind === 'mc') return core
  return [q.prefix, core, q.suffix].filter(Boolean).join(' ')
}
