// Marks a student's typed answer against a question's Answer.
// Form problems (e.g. "simplify your fraction") come back as invalid with feedback,
// so the student can fix them without losing the attempt.

import type { Answer, CheckResult } from './types'
import {
  equivalent,
  hasPositiveIndicesOnly,
  isExpanded,
  isFullyFactorised,
  isIndexForm,
  isSimplified,
  isSingleFraction,
  normalise,
  parse,
  type Node,
} from './expr'
import { gcd, round } from './format'

export interface Rational {
  n: number
  d: number
  kind: 'int' | 'decimal' | 'fraction' | 'mixed'
  decimals: number // decimal places written
}

/** Strip "x =", "$", units and percentage signs around a number. */
export function stripNumber(raw: string): string | null {
  let s = normalise(raw)
  s = s.replace(/^[a-zA-Z]\s*=\s*/, '') // x = 5
  s = s.replace(/^\$\s*/, '').replace(/^-\s*\$\s*/, '-').replace(/^([-+])\s+/, '$1')
  // thousands separators: 12,500 or 12 500
  if (/^-?\d{1,3}([, ]\d{3})+(\.\d+)?/.test(s) && !/^-?\d+ \d+\/\d+/.test(s)) {
    s = s.replace(/^(-?\d{1,3}(?:[, ]\d{3})+)/, (m) => m.replace(/[, ]/g, ''))
  }
  const m = s.match(/^([-+]?(?:\d+\s+\d+\s*\/\s*\d+|\d*\.?\d+(?:\s*\/\s*\d*\.?\d+)?))(.*)$/)
  if (!m) return null
  const rest = m[2].trim()
  // anything left must look like a unit, not more numbers
  if (rest && (/\d/.test(rest.replace(/\^\(?[23]\)?/g, '').replace(/[²³]/g, '')) || !/^[a-zA-Zµ°%\/\s.^()23]*$/.test(rest))) {
    return null
  }
  return m[1].replace(/\s*\/\s*/g, '/').trim()
}

export function parseRational(raw: string): Rational | null {
  const s = stripNumber(raw)
  if (s === null) return null
  const neg = s.startsWith('-')
  const body = s.replace(/^[-+]/, '')
  let mm: RegExpMatchArray | null
  if ((mm = body.match(/^(\d+)\s+(\d+)\/(\d+)$/))) {
    const w = +mm[1]
    const n = +mm[2]
    const d = +mm[3]
    if (d === 0) return null
    return { n: (neg ? -1 : 1) * (w * d + n), d, kind: 'mixed', decimals: 0 }
  }
  if ((mm = body.match(/^(\d+)\/(\d+)$/))) {
    const d = +mm[2]
    if (d === 0) return null
    return { n: (neg ? -1 : 1) * +mm[1], d, kind: 'fraction', decimals: 0 }
  }
  if ((mm = body.match(/^(\d*)\.(\d+)$/))) {
    const decs = mm[2].length
    if (decs > 9) {
      const v = parseFloat(body)
      return { n: (neg ? -1 : 1) * v, d: 1, kind: 'decimal', decimals: decs }
    }
    const d = Math.pow(10, decs)
    const n = +(mm[1] || '0') * d + +mm[2]
    return { n: (neg ? -1 : 1) * n, d, kind: 'decimal', decimals: decs }
  }
  if ((mm = body.match(/^(\d+)$/))) {
    return { n: (neg ? -1 : 1) * +mm[1], d: 1, kind: 'int', decimals: 0 }
  }
  if ((mm = body.match(/^(\d*\.?\d+)\/(\d*\.?\d+)$/))) {
    const v = parseFloat(mm[1]) / parseFloat(mm[2])
    if (!Number.isFinite(v)) return null
    return { n: (neg ? -1 : 1) * v, d: 1, kind: 'fraction', decimals: 0 }
  }
  return null
}

export function parseNumber(raw: string): number | null {
  const r = parseRational(raw)
  return r ? r.n / r.d : null
}

function close(a: number, b: number): boolean {
  return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b))
}

const UNREADABLE: CheckResult = {
  correct: false,
  invalid: true,
  feedback: 'I couldn’t read that answer. Type a number, e.g. 12, −3.5 or 3/4.',
}

export function checkAnswer(answer: Answer, rawInput: string): CheckResult {
  const input = (rawInput ?? '').trim()
  if (input === '') return { correct: false, invalid: true, feedback: 'Type an answer first.' }

  switch (answer.kind) {
    case 'num': {
      const r = parseRational(input)
      if (!r) return UNREADABLE
      const x = r.n / r.d
      if (answer.tol !== undefined) return { correct: Math.abs(x - answer.value) <= answer.tol + 1e-9 }
      if (answer.dp !== undefined) {
        const target = round(answer.value, answer.dp)
        if (r.kind !== 'fraction' && r.kind !== 'mixed' && r.decimals <= answer.dp) {
          return { correct: close(x, target) }
        }
        if (close(round(x, answer.dp), target)) {
          return {
            correct: false,
            invalid: true,
            feedback:
              answer.dp === 0
                ? 'Nearly there: round your answer to the nearest whole number.'
                : `Nearly there: round your answer to ${answer.dp} decimal place${answer.dp > 1 ? 's' : ''}.`,
          }
        }
        return { correct: false }
      }
      return { correct: close(x, answer.value) }
    }

    case 'frac': {
      const r = parseRational(input)
      if (!r) return UNREADABLE
      const equal = close(r.n * answer.d, answer.n * r.d)
      if (!equal) return { correct: false }
      if (r.kind === 'decimal' && answer.d !== 1 && !answer.allowDecimal) {
        return { correct: false, invalid: true, feedback: 'Right value. Now write it as a fraction, e.g. 3/4.' }
      }
      if (r.kind === 'fraction' || r.kind === 'mixed') {
        const num = r.kind === 'mixed' ? Math.abs(r.n) % r.d : r.n
        if (answer.simplest !== false && Number.isInteger(r.n) && gcd(num, r.d) > 1) {
          return { correct: false, invalid: true, feedback: 'Right value, but simplify the fraction fully.' }
        }
        if (answer.mixed && r.kind === 'fraction' && Math.abs(r.n) > r.d && r.d !== 1) {
          return { correct: false, invalid: true, feedback: 'Right value. Now write it as a mixed number, e.g. 2 1/3.' }
        }
        if (answer.improper && r.kind === 'mixed') {
          return { correct: false, invalid: true, feedback: 'Right value. Now write it as an improper fraction, e.g. 7/3.' }
        }
      }
      if (r.kind === 'fraction' && r.d === 1 && answer.d === 1) return { correct: true }
      return { correct: true }
    }

    case 'mc':
      return { correct: Number(input) === answer.correct }

    case 'nums': {
      let t = normalise(input).replace(/[a-zA-Z]\s*=\s*/g, '').replace(/\b(and|or)\b/gi, ',')
      const parts: number[] = []
      for (const raw of t.split(/[,;]/).map((x) => x.trim()).filter(Boolean)) {
        const pm = raw.match(/^(\+\/-|±)\s*(.*)$/)
        const n = parseNumber(pm ? pm[2] : raw)
        if (n === null) return { correct: false, invalid: true, feedback: 'Write the answers separated by a comma, e.g. 7, −7 (or ±7).' }
        if (pm) parts.push(n, -n)
        else parts.push(n)
      }
      const want = answer.values.slice().sort((a, b) => a - b)
      const got = parts.slice().sort((a, b) => a - b)
      const eq = (a: number, b: number) =>
        answer.dp !== undefined ? Math.abs(round(a, answer.dp) - round(b, answer.dp)) < 1e-9 : close(a, b)
      if (got.length < want.length && got.every((g) => want.some((w) => eq(g, w)))) {
        return { correct: false, invalid: true, feedback: `Nearly: there ${want.length === 2 ? 'are two answers' : `are ${want.length} answers`}. Give all of them.` }
      }
      if (got.length !== want.length) return { correct: false }
      return { correct: got.every((g, i) => eq(g, want[i])) }
    }

    case 'time': {
      const t = normalise(input).toLowerCase().replace(/\s+/g, ' ').trim()
      const mm = t.match(/^(\d{1,2})\s*(?:[:.]\s*(\d{1,2}))?\s*(am|pm|a\.m\.?|p\.m\.?)?(?:\s*o'?\s*clock)?$/)
      if (!mm) return { correct: false, invalid: true, feedback: 'Write the time with a colon, e.g. 3:45.' }
      let h = +mm[1]
      const mins = mm[2] === undefined ? 0 : +mm[2]
      if (mm[2] !== undefined && mm[2].length !== 2) return { correct: false, invalid: true, feedback: 'Write the minutes with two digits, e.g. 3:05.' }
      if (mins > 59 || h > 23) return { correct: false, invalid: true, feedback: 'That is not a time. Check the hours and minutes.' }
      const half = mm[3] ? (mm[3].startsWith('a') ? 'am' : 'pm') : null
      let given: 'am' | 'pm' | null = half
      if (h > 12) {
        // 24-hour time: accept if it names the right time
        given = 'pm'
        h -= 12
      } else if (h === 0) {
        given = 'am'
        h = 12
      }
      if (h === 0) h = 12
      const target = answer.h % 12 === 0 ? 12 : answer.h % 12
      if (answer.ampm && !given) return { correct: false, invalid: true, feedback: 'Say whether it is am or pm, e.g. 7:45 pm.' }
      return { correct: h === target && mins === answer.m && (!answer.ampm || given === answer.ampm) }
    }

    case 'text': {
      const norm = (t: string) => normalise(t).toLowerCase().replace(/\s+/g, ' ').replace(/[.!]$/, '').trim()
      return { correct: answer.accept.some((a) => norm(a) === norm(input)) }
    }

    case 'point': {
      const s = normalise(input).replace(/[()]/g, '').replace(/[a-z]\s*=\s*/gi, '')
      const parts = s.split(/[,;]/).map((p) => p.trim())
      if (parts.length !== 2) return { correct: false, invalid: true, feedback: 'Write the point as (x, y), e.g. (3, −2).' }
      const x = parseNumber(parts[0])
      const y = parseNumber(parts[1])
      if (x === null || y === null) return { correct: false, invalid: true, feedback: 'Write the point as (x, y), e.g. (3, −2).' }
      return { correct: close(x, answer.x) && close(y, answer.y) }
    }

    case 'ratio': {
      const parts = normalise(input).split(':').map((p) => parseNumber(p.trim()))
      if (parts.length < 2 || parts.some((p) => p === null)) {
        return { correct: false, invalid: true, feedback: 'Write the ratio using a colon, e.g. 3 : 4.' }
      }
      const ps = parts as number[]
      if (ps.length !== answer.parts.length) return { correct: false }
      const k = ps[0] / answer.parts[0]
      const proportional = ps.every((p, i) => close(p, answer.parts[i] * k)) && k > 0
      if (!proportional) return { correct: false }
      if (ps.every((p, i) => close(p, answer.parts[i]))) return { correct: true }
      return { correct: false, invalid: true, feedback: 'Equivalent ratio, but simplify it fully (whole numbers with no common factor).' }
    }

    case 'primefactors': {
      const s = normalise(input).replace(/\s+/g, '').replace(/x/gi, '*')
      const factors = s.split('*').filter(Boolean)
      const bases: number[] = []
      let product = 1
      for (const f of factors) {
        const m = f.match(/^(\d+)(?:\^\(?(\d+)\)?)?$/)
        if (!m) return { correct: false, invalid: true, feedback: 'Write it like 2^3 × 3^2 (use ^ for powers and × or * between factors).' }
        const b = +m[1]
        const e = m[2] ? +m[2] : 1
        bases.push(b)
        product *= Math.pow(b, e)
      }
      if (product !== answer.value) return { correct: false, feedback: `Those factors multiply to ${product}, not ${answer.value}.` }
      const notPrime = bases.find((b) => !isPrime(b))
      if (notPrime !== undefined) return { correct: false, feedback: `${notPrime} is not a prime number, so keep breaking it down.` }
      if (new Set(bases).size !== bases.length) {
        return { correct: false, invalid: true, feedback: 'Right primes. Now use index notation, e.g. 2 × 2 × 2 = 2^3.' }
      }
      return { correct: true }
    }

    case 'sci': {
      const s = normalise(input).replace(/\s+/g, '')
      const m = s.match(/^(-?\d+(?:\.\d+)?)(?:\*|x|X)10\^\(?(-?\d+)\)?$/)
      if (!m) {
        const plain = parseNumber(input)
        if (plain !== null && close(plain, answer.value)) {
          return { correct: false, invalid: true, feedback: 'Right value. Now write it in scientific notation, like 3.2 × 10^5.' }
        }
        if (/e/i.test(s)) return { correct: false, invalid: true, feedback: 'Write it as a × 10^n, not with E. For example 3.2 × 10^5.' }
        return { correct: false, invalid: true, feedback: 'Write it as a × 10^n, for example 3.2 × 10^5 or 4.07 × 10^-3.' }
      }
      const a = parseFloat(m[1])
      const n = parseInt(m[2], 10)
      const val = a * Math.pow(10, n)
      if (!close(val, answer.value)) return { correct: false }
      if (Math.abs(a) < 1 || Math.abs(a) >= 10) {
        return { correct: false, invalid: true, feedback: 'Right value, but the first number must be at least 1 and less than 10.' }
      }
      return { correct: true }
    }

    case 'expr': {
      let inputNode: Node
      let expectedNode: Node
      try {
        expectedNode = parse(answer.expr)
      } catch {
        return { correct: false, invalid: true, feedback: 'This question has a problem. Please tell your teacher.' }
      }
      try {
        const stripped = normalise(input).replace(/^[a-zA-Z]\s*=\s*/, '')
        inputNode = parse(stripped)
      } catch {
        return {
          correct: false,
          invalid: true,
          feedback: 'I couldn’t read that expression. Use ^ for powers, e.g. 3x^2 + 2x, and check your brackets.',
        }
      }
      if (!equivalent(inputNode, expectedNode)) return { correct: false }
      const form = answer.form ?? 'any'
      let res: { ok: boolean; why?: string } = { ok: true }
      if (form === 'simplified') res = isSimplified(inputNode)
      else if (form === 'expanded') res = isExpanded(inputNode)
      else if (form === 'factorised') res = isFullyFactorised(inputNode)
      else if (form === 'positiveIndices') res = hasPositiveIndicesOnly(inputNode)
      else if (form === 'singlePower') res = isIndexForm(inputNode, expectedNode)
      else if (form === 'singleFraction') res = isSingleFraction(inputNode)
      if (!res.ok) return { correct: false, invalid: true, feedback: 'That’s equivalent, but not finished. ' + (res.why ?? '') }
      return { correct: true }
    }
  }
}

export function isPrime(n: number): boolean {
  if (n < 2 || !Number.isInteger(n)) return false
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false
  return true
}

/** The answer as plain text, for "The answer was ..." messages. */
export function answerText(a: Answer): string {
  switch (a.kind) {
    case 'num':
      return a.dp !== undefined
        ? round(a.value, a.dp).toFixed(a.dp)
        : Number(a.value.toPrecision(12)).toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 })
    case 'frac': {
      const g = a.simplest === false ? 1 : gcd(a.n, a.d) || 1
      const n = a.n / g
      const d = a.d / g
      if (d === 1) return String(n)
      if (a.mixed && Math.abs(n) > d) {
        const w = Math.trunc(n / d)
        return `${w} ${Math.abs(n) % d}/${d}`
      }
      return `${n}/${d}`
    }
    case 'mc':
      return a.options[a.correct].replace(/<[^>]*>/g, '')
    case 'expr':
      return a.expr
    case 'point':
      return `(${a.x}, ${a.y})`
    case 'ratio':
      return a.parts.join(' : ')
    case 'primefactors':
      return primeFactorText(a.value)
    case 'sci': {
      const n = Math.floor(Math.log10(Math.abs(a.value)))
      const m = Number((a.value / Math.pow(10, n)).toPrecision(10))
      return `${m} × 10^${n}`
    }
    case 'text':
      return a.accept[0]
    case 'time':
      return `${a.h % 12 === 0 ? 12 : a.h % 12}:${String(a.m).padStart(2, '0')}${a.ampm ? ' ' + a.ampm : ''}`
    case 'nums': {
      const vals = a.values.slice().sort((x, y) => x - y)
      if (vals.length === 2 && Math.abs(vals[0] + vals[1]) < 1e-12 && vals[1] !== 0) {
        return `±${a.dp !== undefined ? round(vals[1], a.dp).toFixed(a.dp) : vals[1]}`
      }
      return vals.map((x) => (a.dp !== undefined ? round(x, a.dp).toFixed(a.dp) : String(x))).join(', ')
    }
  }
}

export function primeFactors(n: number): [number, number][] {
  const out: [number, number][] = []
  for (let p = 2; p * p <= n; p++) {
    let e = 0
    while (n % p === 0) {
      n /= p
      e++
    }
    if (e) out.push([p, e])
  }
  if (n > 1) out.push([n, 1])
  return out
}

export function primeFactorText(n: number): string {
  return primeFactors(n)
    .map(([p, e]) => (e > 1 ? `${p}^${e}` : `${p}`))
    .join(' × ')
}
