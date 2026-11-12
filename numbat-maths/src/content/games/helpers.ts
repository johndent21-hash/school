// Helpers for writing class-game questions (see src/lib/game/types.ts).
import type { GameMaker, GameQuestion } from '@/lib/game/types'
import { clean, num } from '@/lib/maths/format'
import { shuffle } from '@/lib/maths/rand'

export * from '@/lib/maths/format'
export * from '@/lib/maths/rand'
export * as D from '@/lib/maths/diagrams'
export * as D2 from '@/lib/maths/diagrams2'
export * as DG from '@/lib/maths/diagrams11'

export const NOT_TO_SCALE = 'Diagram not drawn to scale.'

/** A number with its unit, kept together on one line: "8 cm", "2.5 L", "30 000 cm²". */
export const U = (x: number, unit: string) => `${num(x)} ${unit}`
export const sq = (u: string) => u + '²'
export const cu = (u: string) => u + '³'

const norm = (s: string) => s.replace(/[ \t\n]+/g, ' ').trim()

interface GqBase {
  /** the question type, used by the tests to re-work the answer */
  t: string
  prompt: string
  diagram?: string
  note?: string
  /** the right option */
  correct: string
  /** one line shown with the answer */
  why: string
  meta?: Record<string, unknown>
}

/**
 * Builds a game question.
 * wrong: the mistakes students are most likely to make, most likely first. The first three that differ
 * from the right option and from each other are used, and the four options are shuffled.
 * inOrder: all four options in the order to show them (e.g. units from smallest to largest), the right one included.
 */
export function gq(o: GqBase & ({ wrong: string[]; inOrder?: undefined } | { inOrder: string[]; wrong?: undefined })): GameQuestion {
  const right = norm(o.correct)
  let options: string[]
  if (o.inOrder) {
    options = o.inOrder.map(norm)
    if (options.length !== 4 || new Set(options).size !== 4) throw new Error(`gq(${o.t}): inOrder needs four different options`)
    if (!options.includes(right)) throw new Error(`gq(${o.t}): the right option "${right}" is not among the options`)
  } else {
    const wrong: string[] = []
    for (const w of o.wrong.map(norm)) {
      if (w !== right && !wrong.includes(w)) wrong.push(w)
      if (wrong.length === 3) break
    }
    if (wrong.length < 3) throw new Error(`gq(${o.t}): fewer than three different wrong options for "${right}"`)
    options = shuffle([right, ...wrong])
  }
  return {
    prompt: o.prompt,
    diagram: o.diagram,
    note: o.note,
    options,
    correct: options.indexOf(right),
    why: o.why,
    meta: { t: o.t, ...(o.meta ?? {}) },
  }
}

/**
 * Options that are numbers. wrong: likely wrong values, most likely first; values that equal the right
 * one, repeat, or are not positive are dropped, and spare values fill any gaps.
 */
export function numOpts(correct: number, wrong: number[], fmt: (x: number) => string): { correct: string; wrong: string[] } {
  const right = clean(correct)
  const out: number[] = []
  const add = (x: number) => {
    const v = clean(x)
    if (Number.isFinite(v) && v > 0 && v !== right && !out.includes(v)) out.push(v)
  }
  wrong.forEach(add)
  // spare values, only reached when the listed mistakes coincide with each other or with the answer
  for (const k of [2, 10, 0.5, 0.1, 3, 4, 100]) {
    if (out.length >= 3) break
    add(right * k)
  }
  return { correct: fmt(right), wrong: out.slice(0, 3).map(fmt) }
}

export const mk = (t: string, make: () => GameQuestion, d: 1 | 2 = 1): GameMaker => ({ t, make, d })
