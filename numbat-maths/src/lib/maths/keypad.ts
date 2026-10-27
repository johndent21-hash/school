// Which keys the on-screen maths keypad shows for a question.
// Keys depend only on the kind of answer, the year level and the letters in the question,
// never on the answer's value, so the keypad can't give the answer away (no minus key just
// because the answer is negative). tests/keypad.test.ts types every answer with these keys.

import type { Answer } from './types'

export interface PadKey {
  label: string
  insert: string
  title: string
}

export interface PadLayout {
  /** Keys beside 0 on the bottom row of the number pad (at most two). */
  extras: PadKey[]
  /** Symbol keys, shown in columns of four beside the number pad. */
  symbols: PadKey[]
}

const k = (label: string, insert: string, title: string): PadKey => ({ label, insert, title })

const DOT = k('.', '.', 'decimal point')
const MINUS = k('−', '−', 'minus or negative')
const PLUS = k('+', '+', 'plus')
const TIMES = k('×', '×', 'times')
const SLASH = k('/', '/', 'fraction bar or divide')
const POWER = k('xⁿ', '^', 'power: type ^ then the index, e.g. x^2')
const OPEN = k('(', '(', 'open bracket')
const CLOSE = k(')', ')', 'close bracket')
const COMMA = k(',', ', ', 'comma')
const SPACE = k('space', ' ', 'space between the whole number and the fraction')
const COLON = k(':', ':', 'colon')

/** Letters used as pronumerals: those in the answer and any shown in italics in the question. */
export function padLetters(a: Answer, prompt: string): string[] {
  const found = new Set<string>()
  if (a.kind === 'expr') for (const m of a.expr.replace(/sqrt|pi|frac/g, '').match(/[a-zA-Z]/g) ?? []) found.add(m)
  for (const m of prompt.matchAll(/<i>([a-zA-Z])<\/i>/g)) found.add(m[1])
  return Array.from(found).sort().slice(0, 4)
}

export function padLayout(a: Answer, year: number, prompt = ''): PadLayout {
  const secondary = year >= 7
  const decimals = year >= 3
  switch (a.kind) {
    case 'num':
      return { extras: decimals || a.dp !== undefined ? [DOT] : [], symbols: secondary ? [MINUS, SLASH] : [] }
    case 'frac':
      return {
        extras: a.mixed ? [SPACE] : a.allowDecimal ? [DOT] : [],
        symbols: [SLASH, ...(secondary ? [MINUS] : [])],
      }
    case 'nums':
      return { extras: [COMMA, ...(decimals ? [DOT] : [])], symbols: secondary ? [MINUS, k('±', '±', 'plus or minus')] : [] }
    case 'point':
      return { extras: [COMMA], symbols: [OPEN, CLOSE, MINUS, DOT] }
    case 'ratio':
      return { extras: [k(':', ' : ', 'ratio colon')], symbols: [] }
    case 'sci':
      return { extras: [DOT], symbols: [k('×10ⁿ', ' × 10^', 'times ten to the power'), MINUS] }
    case 'primefactors':
      return { extras: [], symbols: [k('×', ' × ', 'times'), POWER] }
    case 'expr': {
      const letters = padLetters(a, prompt).map((l) => k(l, l, `letter ${l}`))
      return { extras: [DOT], symbols: [...letters, PLUS, MINUS, TIMES, SLASH, POWER, OPEN, CLOSE] }
    }
    case 'time':
      return { extras: [COLON], symbols: a.ampm ? [k('am', ' am', 'am: midnight to midday'), k('pm', ' pm', 'pm: midday to midnight')] : [] }
    case 'text':
      // Grid references such as B3
      return { extras: [], symbols: 'ABCDEF'.split('').map((l) => k(l, l, `letter ${l}`)) }
    default:
      return { extras: [], symbols: [] }
  }
}
