// Core content types shared by the question engine, the content files and the UI.

export type Level = 1 | 2 | 3

export const LEVEL_NAMES: Record<Level, string> = {
  1: 'Foundation',
  2: 'Standard',
  3: 'Challenge',
}

export type Answer =
  // Any real number. Fractions, mixed numbers and decimals are all accepted.
  // dp: the answer is rounded to this many decimal places (more precise answers are also accepted).
  | { kind: 'num'; value: number; dp?: number; tol?: number }
  // An exact fraction n/d. simplest: must be fully simplified.
  // allowDecimal: an exact decimal equal to the fraction is also accepted.
  | { kind: 'frac'; n: number; d: number; simplest?: boolean; allowDecimal?: boolean; mixed?: boolean; improper?: boolean }
  // Multiple choice. options are HTML strings.
  | { kind: 'mc'; options: string[]; correct: number }
  // Algebraic expression, checked for equivalence by evaluation.
  // form: extra requirements on how the answer is written.
  | { kind: 'expr'; expr: string; form?: ExprForm }
  // Coordinates (x, y)
  | { kind: 'point'; x: number; y: number }
  // Ratio a : b (: c), must be in simplest whole-number form
  | { kind: 'ratio'; parts: number[] }
  // Prime factorisation of a whole number using index notation
  | { kind: 'primefactors'; value: number }
  // Scientific notation a × 10^n
  | { kind: 'sci'; value: number; sf?: number }
  // Several numbers in any order, e.g. the two solutions of x² = 49 (accepts "±7", "7, −7", "7 and -7")
  | { kind: 'nums'; values: number[]; dp?: number }
  // Free text from a list of accepted answers (case-insensitive)
  | { kind: 'text'; accept: string[] }
  // A time of day such as 3:45 (12-hour). With ampm, the student must say am or pm.
  | { kind: 'time'; h: number; m: number; ampm?: 'am' | 'pm' }

export type ExprForm =
  | 'any'
  | 'simplified' // no brackets, like terms collected
  | 'expanded' // no brackets
  | 'factorised' // fully factorised with a bracket
  | 'positiveIndices' // no negative indices
  | 'singlePower' // a single power such as a^7 or 5^9
  | 'singleFraction' // one fraction with a simplified numerator, e.g. (5x - 3)/6

export interface Question {
  prompt: string // HTML
  diagram?: string // SVG/HTML
  answer: Answer
  prefix?: string // shown before the input, e.g. "x ="
  suffix?: string // shown after the input, e.g. "cm²"
  hint: string // HTML
  steps: string[] // worked solution, one HTML string per step
  calc?: boolean // calculator allowed
  note?: string // e.g. "Diagram not to scale"
}

export type Generator = (level: Level) => Question

export interface Skill {
  id: string
  title: string
  outcomes: string[]
  summary: string // one line, shown on topic page
  learn: {
    intro: string // HTML paragraph(s)
    keyPoints: string[] // HTML bullets
    vocab?: [string, string][]
  }
  gen: Generator
  levels?: Partial<Record<Level, string>> // what each level covers, for teachers
}

export interface Topic {
  id: string
  year: 1 | 2 | 3 | 4 | 7 | 8 | 9
  title: string
  strand: 'Number and algebra' | 'Measurement and space' | 'Statistics and probability'
  outcomes: string[]
  blurb: string
  skills: Skill[]
  colour: number // hue 0-360 used for the topic tile
}

export interface CheckResult {
  correct: boolean
  feedback?: string // shown when the answer is wrong, or right but with a note
  invalid?: boolean // could not be read; do not count as an attempt
}
