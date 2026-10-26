// Shared helpers for writing question generators.
import type { Answer, ExprForm, Level, Question } from '@/lib/maths/types'
import { mc } from '@/lib/maths/rand'

export * from '@/lib/maths/format'
export * from '@/lib/maths/rand'
export * as D from '@/lib/maths/diagrams'

/** Pick a value by level. */
export function L<T>(level: Level, a: T, b: T, c: T): T {
  return level === 1 ? a : level === 2 ? b : c
}

export const q = (x: Question): Question => x

export const numA = (value: number, dp?: number): Answer => ({ kind: 'num', value, dp })
export const tolA = (value: number, tol: number): Answer => ({ kind: 'num', value, tol })
export const fracA = (n: number, d: number, opts: { mixed?: boolean; improper?: boolean; allowDecimal?: boolean } = {}): Answer => ({
  kind: 'frac',
  n: d < 0 ? -n : n,
  d: Math.abs(d),
  simplest: true,
  ...opts,
})
export const mcA = (correct: string, wrong: string[]): Answer => ({ kind: 'mc', ...mc(correct, wrong) })
export const mcFixedA = (options: string[], correct: string): Answer => {
  const idx = options.indexOf(correct)
  if (idx < 0) throw new Error('mcFixedA: missing ' + correct)
  return { kind: 'mc', options, correct: idx }
}
export const exprA = (expr: string, form: ExprForm = 'any'): Answer => ({ kind: 'expr', expr, form })
export const pointA = (x: number, y: number): Answer => ({ kind: 'point', x, y })
export const ratioA = (...parts: number[]): Answer => ({ kind: 'ratio', parts })

export const NOT_TO_SCALE = 'Diagram not drawn to scale.'
