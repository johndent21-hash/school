// Formatting helpers that turn numbers and expressions into HTML.
// NSW conventions: true minus sign, spaces as thousands separators for 5+ digit numbers,
// italic pronumerals, × and ÷ signs.

export const MINUS = '−'
export const TIMES = '×'
export const DIVIDE = '÷'

export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a))
  b = Math.abs(Math.round(b))
  while (b) [a, b] = [b, a % b]
  return a
}

export function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b)
}

/** Round half away from zero to k decimal places, avoiding binary float surprises. */
export function round(x: number, k = 0): number {
  const s = Math.sign(x) || 1
  const a = Math.abs(x)
  const r = Number(Math.round(Number(a + 'e' + k)) + 'e-' + k)
  return s * r
}

/** Round to s significant figures. */
export function roundSF(x: number, s: number): number {
  if (x === 0) return 0
  const k = s - 1 - Math.floor(Math.log10(Math.abs(x)))
  if (k >= 0) return round(x, k)
  const f = Math.pow(10, -k)
  return (Math.sign(x) || 1) * Math.round(Math.abs(x) / f) * f
}

/** Remove floating point noise (e.g. 0.1 + 0.2). */
export function clean(x: number): number {
  return Number(x.toPrecision(12))
}

/** Plain-text number with NSW digit grouping, true minus sign. */
export function num(x: number, fixedDp?: number): string {
  x = clean(x)
  const neg = x < 0
  let s = fixedDp !== undefined ? Math.abs(x).toFixed(fixedDp) : String(Math.abs(x))
  if (s.includes('e')) s = Math.abs(x).toLocaleString('en-AU', { useGrouping: false, maximumFractionDigits: 20 })
  let [int, dec] = s.split('.')
  if (int.length >= 5) int = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return (neg ? MINUS : '') + int + (dec !== undefined ? '.' + dec : '')
}

/** Number wrapped in brackets if negative, for use after an operation sign. */
export function bnum(x: number): string {
  return x < 0 ? '(' + num(x) + ')' : num(x)
}

/** Signed term for building expressions: " + 3" or " − 3". */
export function signed(x: number): string {
  return x < 0 ? ' ' + MINUS + ' ' + num(-x) : ' + ' + num(x)
}

export function money(x: number): string {
  const neg = x < 0
  const s = num(Math.abs(round(x, 2)), 2)
  return (neg ? MINUS : '') + '$' + s
}

/** Money without cents when it is a whole number of dollars. */
export function dollars(x: number): string {
  return Number.isInteger(round(x, 2)) ? (x < 0 ? MINUS : '') + '$' + num(Math.abs(x)) : money(x)
}

export function deg(x: number): string {
  return num(x) + '°'
}

export function frac(n: number | string, d: number | string): string {
  const nn = typeof n === 'number' ? num(n) : n
  const dd = typeof d === 'number' ? num(d) : d
  const label = `${stripTags(nn)} over ${stripTags(dd)}`
  return `<span class="frac" role="math" aria-label="${label}"><span class="fn">${nn}</span><span class="fd">${dd}</span></span>`
}

/** A signed fraction n/d (d > 0), simplified, shown as an integer when possible. */
export function fracS(n: number, d: number): string {
  if (d < 0) {
    n = -n
    d = -d
  }
  const g = gcd(n, d) || 1
  n /= g
  d /= g
  if (d === 1) return num(n)
  return (n < 0 ? MINUS : '') + frac(Math.abs(n), d)
}

/** Fraction without simplifying. */
export function fracRaw(n: number, d: number): string {
  return (n < 0 ? MINUS : '') + frac(Math.abs(n), d)
}

/** Mixed number from an improper fraction (simplified). */
export function mixed(n: number, d: number): string {
  const g = gcd(n, d) || 1
  n /= g
  d /= g
  const neg = n < 0
  n = Math.abs(n)
  const w = Math.floor(n / d)
  const r = n % d
  if (r === 0) return (neg ? MINUS : '') + num(w)
  if (w === 0) return (neg ? MINUS : '') + frac(r, d)
  return (neg ? MINUS : '') + num(w) + ' ' + frac(r, d)
}

/** Text version of a fraction, used inside answers shown to students. */
export function fracText(n: number, d: number): string {
  const g = gcd(n, d) || 1
  return `${n / g}/${d / g}`
}

export function sup(s: string | number): string {
  return `<sup>${typeof s === 'number' ? num(s) : s}</sup>`
}

export function pow(base: string | number, e: string | number): string {
  const b = typeof base === 'number' ? (base < 0 ? '(' + num(base) + ')' : num(base)) : base
  return b + sup(e)
}

export function v(name: string): string {
  return `<i>${name}</i>`
}

export function sqrt(inner: string | number): string {
  const s = typeof inner === 'number' ? num(inner) : inner
  return `<span class="sqrt">√<span class="rad">${s}</span></span>`
}

export function cbrt(inner: string | number): string {
  const s = typeof inner === 'number' ? num(inner) : inner
  return `<span class="sqrt"><sup class="root-idx">3</sup>√<span class="rad">${s}</span></span>`
}

/**
 * Converts a plain expression string to HTML.
 * "3x^2 - 4xy + 2" -> 3<i>x</i><sup>2</sup> − 4<i>xy</i> + 2
 * Supports ^n, ^(-n), ^{...}, * (shown as ×), / (shown as ÷ when spaced " / "), frac{a}{b}.
 */
export function ex(s: string): string {
  let out = ''
  let i = 0
  while (i < s.length) {
    const c = s[i]
    if (s.startsWith('frac{', i)) {
      const [a, j] = readBraced(s, i + 4)
      const [b, k] = readBraced(s, j)
      out += frac(ex(a), ex(b))
      i = k
      continue
    }
    if (s.startsWith('sqrt{', i)) {
      const [a, j] = readBraced(s, i + 4)
      out += sqrt(ex(a))
      i = j
      continue
    }
    if (c === '^') {
      i++
      let e = ''
      if (s[i] === '{') {
        const [a, j] = readBraced(s, i)
        e = a
        i = j
      } else if (s[i] === '(') {
        const close = s.indexOf(')', i)
        e = s.slice(i + 1, close)
        i = close + 1
      } else {
        if (s[i] === '-') {
          e = '-'
          i++
        }
        // digits make up the index; a single letter is an index only on its own (e.g. a^n)
        while (i < s.length) {
          const ch = s[i]
          if (/[0-9.]/.test(ch)) {
            e += ch
            i++
          } else if (/[a-z]/i.test(ch) && (e === '' || e === '-')) {
            e += ch
            i++
            break
          } else break
        }
      }
      out += sup(ex(e))
      continue
    }
    if (/[a-zA-Zα-ωθ]/.test(c)) {
      out += `<i>${c}</i>`
      i++
      continue
    }
    if (c === '-') out += MINUS
    else if (c === '*') out += ' ' + TIMES + ' '
    else if (c === '÷') out += ' ' + DIVIDE + ' '
    else if (c === '<') out += '&lt;'
    else if (c === '>') out += '&gt;'
    else out += c
    i++
  }
  // merge adjacent italics: <i>x</i><i>y</i> -> <i>xy</i>
  return out.replace(/<\/i><i>/g, '').replace(/ {2,}/g, ' ')
}

function readBraced(s: string, i: number): [string, number] {
  // s[i] === '{'
  let depth = 0
  let j = i
  for (; j < s.length; j++) {
    if (s[j] === '{') depth++
    else if (s[j] === '}') {
      depth--
      if (depth === 0) break
    }
  }
  return [s.slice(i + 1, j), j + 1]
}

export function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

/** Linear expression ax + b as a plain string for ex(): handles 1, −1 and 0 coefficients. */
export function lin(a: number, b: number, x = 'x'): string {
  let s = ''
  if (a === 1) s = x
  else if (a === -1) s = '-' + x
  else if (a !== 0) s = `${a}${x}`
  if (b !== 0) {
    if (s === '') s = String(b)
    else s += b < 0 ? ` - ${-b}` : ` + ${b}`
  }
  return s === '' ? '0' : s
}

/** Term with coefficient: coef(3,'x') = '3x', coef(1,'x')='x', coef(-1,'x')='-x' */
export function coef(a: number, x: string): string {
  if (a === 1) return x
  if (a === -1) return '-' + x
  return `${a}${x}`
}

/** Join signed terms: terms([[3,'x'],[-2,'y'],[5,'']]) -> '3x - 2y + 5' */
export function terms(list: [number, string][]): string {
  let s = ''
  for (const [a, x] of list) {
    if (a === 0) continue
    const mag = Math.abs(a)
    const body = x === '' ? String(mag) : mag === 1 ? x : `${mag}${x}`
    if (s === '') s = (a < 0 ? '-' : '') + body
    else s += (a < 0 ? ' - ' : ' + ') + body
  }
  return s === '' ? '0' : s
}

export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

/** Decimal string for a terminating fraction or a rounded value. */
export function decimalOf(n: number, d: number): string {
  return num(clean(n / d))
}

/** "= 18" when the rounded value is exact, otherwise "≈ 18.33". */
export function approx(x: number, dp: number): string {
  const r = round(x, dp)
  return (Math.abs(r - x) < 1e-9 ? '= ' + num(r) : '≈ ' + num(r, dp))
}
