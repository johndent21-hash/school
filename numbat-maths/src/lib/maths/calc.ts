// The on-screen calculator's arithmetic: reads what the student keyed in (e.g. "2π×3²", "√(9+16)",
// "sin(30)") and works it out with the usual order of operations. Angles are in degrees.
// Missing closing brackets at the end are added, as on a school scientific calculator.
// Fractions keyed with the fraction keys arrive as ⟦3|4⟧ (¾) or ⟦2|1|3⟧ (2⅓), and angles as 36°52′30″.
// Whole numbers, decimals and fractions are worked out exactly (as fractions), so the answer can be shown
// as a fraction; anything with π, √ of a non-square or trig is worked out as a decimal.

/** an exact fraction n/d in simplest form, d > 0 */
export type Exact = { n: bigint; d: bigint }
export type CalcResult = { ok: true; value: number; exact?: Exact } | { ok: false; message: string }
/** what Ans stands for: the last answer, exactly when it was exact */
export type AnsValue = number | { value: number; exact?: Exact }

type Val = { v: number; q: Exact | null }
type Tok =
  | { t: 'num'; v: Val }
  | { t: 'op'; v: '+' | '-' | '*' | '/' | '^' }
  | { t: 'sq' }
  | { t: 'fn'; v: 'sqrt' | 'sin' | 'cos' | 'tan' | 'asin' | 'acos' | 'atan' }
  | { t: '(' }
  | { t: ')' }

class CalcError extends Error {}
const syntax = () => new CalcError('Syntax error')
const maths = () => new CalcError('Maths error')

// ---------------------------------------------------------------- exact fractions
const BIG = 10n ** 30n
const absB = (x: bigint) => (x < 0n ? -x : x)
const gcdB = (a: bigint, b: bigint): bigint => {
  a = absB(a)
  b = absB(b)
  while (b) [a, b] = [b, a % b]
  return a
}
/** n/d in simplest form, or null if it has grown too big to be worth keeping exact */
function mk(n: bigint, d: bigint): Exact | null {
  if (d === 0n) throw maths()
  if (d < 0n) {
    n = -n
    d = -d
  }
  const g = gcdB(n, d) || 1n
  n /= g
  d /= g
  return absB(n) > BIG || d > BIG ? null : { n, d }
}
const toNum = (q: Exact) => Number(q.n) / Number(q.d)
const val = (q: Exact | null, fallback: number): Val => (q ? { v: toNum(q), q } : { v: fallback, q: null })
/** a decimal written in the input, read exactly: "12.5" → 25/2 */
function exactDecimal(text: string): Exact | null {
  const [w, f = ''] = text.split('.')
  return mk(BigInt((w || '0') + f), 10n ** BigInt(f.length))
}
const isqrt = (x: bigint): bigint | null => {
  if (x < 0n) return null
  const r = BigInt(Math.round(Math.sqrt(Number(x))))
  for (const c of [r - 1n, r, r + 1n]) if (c >= 0n && c * c === x) return c
  return null
}
const add = (a: Val, b: Val): Val => val(a.q && b.q ? mk(a.q.n * b.q.d + b.q.n * a.q.d, a.q.d * b.q.d) : null, a.v + b.v)
const neg = (a: Val): Val => ({ v: -a.v, q: a.q ? { n: -a.q.n, d: a.q.d } : null })
const mul = (a: Val, b: Val): Val => val(a.q && b.q ? mk(a.q.n * b.q.n, a.q.d * b.q.d) : null, a.v * b.v)
const div = (a: Val, b: Val): Val => {
  if (b.v === 0 || (b.q && b.q.n === 0n)) throw maths()
  return val(a.q && b.q ? mk(a.q.n * b.q.d, a.q.d * b.q.n) : null, a.v / b.v)
}
function pow(a: Val, e: Val): Val {
  if (a.q && e.q && e.q.d === 1n && absB(e.q.n) <= 200n) {
    const k = e.q.n
    if (k < 0n && a.q.n === 0n) throw maths()
    const p = absB(k)
    const r = mk(a.q.n ** p, a.q.d ** p)
    if (r) return val(k < 0n ? mk(r.d, r.n) : r, Math.pow(a.v, e.v))
  }
  const v = Math.pow(a.v, e.v)
  if (Number.isNaN(v)) throw maths()
  return { v, q: null }
}
/** a fraction keyed with the fraction keys: ⟦n|d⟧ or ⟦w|n|d⟧ (the sign of the whole number applies to all of it) */
function fractionLiteral(body: string): Val {
  const parts = body.split('|').map((p) => p.replace(/−/g, '-').trim())
  if (parts.some((p) => p === '' || p === '-')) throw new CalcError('Fill in every box')
  if (parts.some((p) => !/^-?(\d+\.?\d*|\.\d+)$/.test(p))) throw syntax()
  const read = (p: string) => {
    const negative = p.startsWith('-')
    const q = exactDecimal(negative ? p.slice(1) : p)!
    return negative ? { n: -q.n, d: q.d } : q
  }
  const [w, n, d] = parts.length === 3 ? parts.map(read) : [null, ...parts.map(read)]
  if (d!.n === 0n) throw maths()
  let q = mk(n!.n * d!.d, n!.d * d!.n)!
  if (w) {
    const wNeg = w.n < 0n
    const wAbs = { n: absB(w.n), d: w.d }
    const total = mk(wAbs.n * q.d + q.n * wAbs.d, wAbs.d * q.d)!
    q = wNeg ? { n: -total.n, d: total.d } : total
  }
  return { v: toNum(q), q }
}

const FNS: [string, Tok & { t: 'fn' }][] = [
  ['sin⁻¹', { t: 'fn', v: 'asin' }],
  ['cos⁻¹', { t: 'fn', v: 'acos' }],
  ['tan⁻¹', { t: 'fn', v: 'atan' }],
  ['sin', { t: 'fn', v: 'sin' }],
  ['cos', { t: 'fn', v: 'cos' }],
  ['tan', { t: 'fn', v: 'tan' }],
  ['√', { t: 'fn', v: 'sqrt' }],
]

function tokenize(s: string, ans: AnsValue): Tok[] {
  const out: Tok[] = []
  let i = 0
  while (i < s.length) {
    const c = s[i]
    if (c === ' ') {
      i++
      continue
    }
    if (c === '⟦') {
      const end = s.indexOf('⟧', i)
      if (end < 0) throw syntax()
      out.push({ t: 'num', v: fractionLiteral(s.slice(i + 1, end)) })
      i = end + 1
      continue
    }
    // an angle in degrees, minutes and seconds: 36°52′30″ (minutes and seconds optional)
    const dms = s.slice(i).match(/^(\d+\.?\d*)°(?:(\d+\.?\d*)′)?(?:(\d+\.?\d*)″)?/)
    if (dms) {
      const [deg, min = '0', sec = '0'] = dms.slice(1)
      const exact = (t: string): Val => ({ v: Number(t), q: exactDecimal(t.replace(/\.$/, '')) })
      const angle = add(add(exact(deg), div(exact(min), { v: 60, q: { n: 60n, d: 1n } })), div(exact(sec), { v: 3600, q: { n: 3600n, d: 1n } }))
      out.push({ t: 'num', v: angle })
      i += dms[0].length
      continue
    }
    const m = s.slice(i).match(/^(\d+\.?\d*|\.\d+)/)
    if (m) {
      if (m[1] === '.') throw syntax()
      out.push({ t: 'num', v: val(exactDecimal(m[1].replace(/\.$/, '')), parseFloat(m[1])) })
      i += m[1].length
      continue
    }
    if (s.startsWith('Ans', i)) {
      const a = typeof ans === 'number' ? { value: ans } : ans
      out.push({ t: 'num', v: a.exact ? { v: a.value, q: a.exact } : val(Number.isInteger(a.value) ? mk(BigInt(a.value), 1n) : null, a.value) })
      i += 3
      continue
    }
    if (c === 'π') {
      out.push({ t: 'num', v: { v: Math.PI, q: null } })
      i++
      continue
    }
    const fn = FNS.find(([name]) => s.startsWith(name, i))
    if (fn) {
      out.push(fn[1])
      i += fn[0].length
      continue
    }
    if (c === '²') out.push({ t: 'sq' })
    else if (c === '(') out.push({ t: '(' })
    else if (c === ')') out.push({ t: ')' })
    else if (c === '+') out.push({ t: 'op', v: '+' })
    else if (c === '-' || c === '−') out.push({ t: 'op', v: '-' })
    else if (c === '*' || c === '×') out.push({ t: 'op', v: '*' })
    else if (c === '/' || c === '÷') out.push({ t: 'op', v: '/' })
    else if (c === '^') out.push({ t: 'op', v: '^' })
    else throw syntax()
    i++
  }
  return out
}

const RAD = Math.PI / 180

function applyFn(f: (Tok & { t: 'fn' })['v'], a: Val): Val {
  if (f === 'sqrt') {
    if (a.v < 0) throw maths()
    if (a.q) {
      const n = isqrt(a.q.n)
      const d = isqrt(a.q.d)
      if (n !== null && d !== null) return { v: Math.sqrt(a.v), q: { n, d } }
    }
    return { v: Math.sqrt(a.v), q: null }
  }
  return { v: trig(f, a.v), q: null }
}
function trig(f: Exclude<(Tok & { t: 'fn' })['v'], 'sqrt'>, x: number): number {
  switch (f) {
    case 'sin':
      return Math.sin(x * RAD)
    case 'cos':
      return Math.cos(x * RAD)
    case 'tan': {
      // tan 90°, tan 270°, ... are undefined
      if (Math.abs(Math.cos(x * RAD)) < 1e-12) throw maths()
      return Math.tan(x * RAD)
    }
    case 'asin':
      if (Math.abs(x) > 1 + 1e-12) throw maths()
      return Math.asin(Math.max(-1, Math.min(1, x))) / RAD
    case 'acos':
      if (Math.abs(x) > 1 + 1e-12) throw maths()
      return Math.acos(Math.max(-1, Math.min(1, x))) / RAD
    case 'atan':
      return Math.atan(x) / RAD
  }
}

export function calculate(input: string, ans: AnsValue = 0): CalcResult {
  let toks: Tok[]
  try {
    toks = tokenize(input, ans)
  } catch (e) {
    if (e instanceof CalcError) return { ok: false, message: e.message }
    throw e
  }
  if (toks.length === 0) return { ok: false, message: 'Type a calculation' }
  let p = 0
  const peek = () => toks[p]
  const startsPrimary = (t: Tok | undefined) => !!t && (t.t === 'num' || t.t === 'fn' || t.t === '(')

  const expr = (): Val => {
    let v = term()
    for (;;) {
      const t = peek()
      if (t?.t === 'op' && (t.v === '+' || t.v === '-')) {
        p++
        const r = term()
        v = t.v === '+' ? add(v, r) : add(v, neg(r))
      } else return v
    }
  }
  const term = (): Val => {
    let v = unary()
    for (;;) {
      const t = peek()
      if (t?.t === 'op' && (t.v === '*' || t.v === '/')) {
        p++
        const r = unary()
        v = t.v === '*' ? mul(v, r) : div(v, r)
      } else if (startsPrimary(t)) v = mul(v, unary()) // 2π, 3(4 + 1), 5√(2)
      else return v
    }
  }
  const unary = (): Val => {
    const t = peek()
    if (t?.t === 'op' && (t.v === '-' || t.v === '+')) {
      p++
      const v = unary()
      return t.v === '-' ? neg(v) : v
    }
    return power()
  }
  const power = (): Val => {
    const base = postfix()
    const t = peek()
    if (t?.t === 'op' && t.v === '^') {
      p++
      const e = unary() // right-associative, and allows 10^−3
      return pow(base, e)
    }
    return base
  }
  const postfix = (): Val => {
    let v = primary()
    while (peek()?.t === 'sq') {
      p++
      v = mul(v, v)
    }
    return v
  }
  const primary = (): Val => {
    const t = peek()
    if (!t) throw syntax()
    if (t.t === 'num') {
      p++
      return t.v
    }
    if (t.t === 'fn') {
      p++
      return applyFn(t.v, postfix())
    }
    if (t.t === '(') {
      p++
      const v = expr()
      if (peek()?.t === ')') p++
      else if (p < toks.length) throw syntax()
      return v
    }
    throw syntax()
  }

  try {
    const v = expr()
    if (p < toks.length) throw syntax()
    if (!Number.isFinite(v.v)) throw maths()
    return v.q ? { ok: true, value: v.v, exact: v.q } : { ok: true, value: v.v }
  } catch (e) {
    if (e instanceof CalcError) return { ok: false, message: e.message }
    throw e
  }
}

/** Ten significant figures, like a school calculator's display. Very large or small numbers use scientific notation. */
export function calcDisplay(x: number): { text: string; sci: { m: string; n: number } | null } {
  const r = Number(x.toPrecision(10))
  if (r === 0) return { text: '0', sci: null }
  if (Math.abs(r) >= 1e10 || Math.abs(r) < 1e-6) {
    const [m, n] = r.toExponential(9).split('e')
    const mant = String(Number(m))
    return { text: `${mant} × 10^${Number(n)}`, sci: { m: mant, n: Number(n) } }
  }
  return { text: String(r), sci: null }
}

/** An exact answer as a fraction: sign, whole part (for a mixed numeral) and the fraction part. */
export function fractionParts(q: Exact): { neg: boolean; n: bigint; d: bigint; whole: bigint; rest: bigint } {
  const negative = q.n < 0n
  const n = absB(q.n)
  return { neg: negative, n, d: q.d, whole: n / q.d, rest: n % q.d }
}
/** Whether a fraction display makes sense: not a whole number, and a denominator a student could read. */
export const showsAsFraction = (q?: Exact) => !!q && q.d !== 1n && q.d < 10n ** 10n && absB(q.n) < 10n ** 12n

/** An angle in degrees as degrees, minutes and seconds (seconds to 2 decimal places), e.g. 36°52′11.63″. */
export function toDMS(x: number): { neg: boolean; d: number; m: number; s: number } {
  const negative = x < 0
  let total = Math.round(Math.abs(x) * 360000) // hundredths of a second
  const d = Math.floor(total / 360000)
  total -= d * 360000
  const m = Math.floor(total / 6000)
  total -= m * 6000
  return { neg: negative, d, m, s: total / 100 }
}
export function dmsText(x: number): string {
  const { neg: n, d, m, s } = toDMS(x)
  return `${n ? '−' : ''}${d}°${m}′${Number(s.toFixed(2))}″`
}
