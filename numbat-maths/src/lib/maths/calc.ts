// The on-screen calculator's arithmetic: reads what the student keyed in (e.g. "2π×3²", "√(9+16)",
// "sin(30)") and works it out with the usual order of operations. Angles are in degrees.
// Missing closing brackets at the end are added, as on a school scientific calculator.

export type CalcResult = { ok: true; value: number } | { ok: false; message: string }

type Tok =
  | { t: 'num'; v: number }
  | { t: 'op'; v: '+' | '-' | '*' | '/' | '^' }
  | { t: 'sq' }
  | { t: 'fn'; v: 'sqrt' | 'sin' | 'cos' | 'tan' | 'asin' | 'acos' | 'atan' }
  | { t: '(' }
  | { t: ')' }

class CalcError extends Error {}
const syntax = () => new CalcError('Syntax error')
const maths = () => new CalcError('Maths error')

const FNS: [string, Tok & { t: 'fn' }][] = [
  ['sin⁻¹', { t: 'fn', v: 'asin' }],
  ['cos⁻¹', { t: 'fn', v: 'acos' }],
  ['tan⁻¹', { t: 'fn', v: 'atan' }],
  ['sin', { t: 'fn', v: 'sin' }],
  ['cos', { t: 'fn', v: 'cos' }],
  ['tan', { t: 'fn', v: 'tan' }],
  ['√', { t: 'fn', v: 'sqrt' }],
]

function tokenize(s: string, ans: number): Tok[] {
  const out: Tok[] = []
  let i = 0
  while (i < s.length) {
    const c = s[i]
    if (c === ' ') {
      i++
      continue
    }
    const m = s.slice(i).match(/^(\d+\.?\d*|\.\d+)/)
    if (m) {
      if (m[1] === '.') throw syntax()
      out.push({ t: 'num', v: parseFloat(m[1]) })
      i += m[1].length
      continue
    }
    if (s.startsWith('Ans', i)) {
      out.push({ t: 'num', v: ans })
      i += 3
      continue
    }
    if (c === 'π') {
      out.push({ t: 'num', v: Math.PI })
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

function applyFn(f: (Tok & { t: 'fn' })['v'], x: number): number {
  switch (f) {
    case 'sqrt':
      if (x < 0) throw maths()
      return Math.sqrt(x)
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

export function calculate(input: string, ans = 0): CalcResult {
  let toks: Tok[]
  try {
    toks = tokenize(input, ans)
  } catch (e) {
    return { ok: false, message: (e as Error).message }
  }
  if (toks.length === 0) return { ok: false, message: 'Type a calculation' }
  let p = 0
  const peek = () => toks[p]
  const startsPrimary = (t: Tok | undefined) => !!t && (t.t === 'num' || t.t === 'fn' || t.t === '(')

  const expr = (): number => {
    let v = term()
    for (;;) {
      const t = peek()
      if (t?.t === 'op' && (t.v === '+' || t.v === '-')) {
        p++
        const r = term()
        v = t.v === '+' ? v + r : v - r
      } else return v
    }
  }
  const term = (): number => {
    let v = unary()
    for (;;) {
      const t = peek()
      if (t?.t === 'op' && (t.v === '*' || t.v === '/')) {
        p++
        const r = unary()
        if (t.v === '/' && r === 0) throw maths()
        v = t.v === '*' ? v * r : v / r
      } else if (startsPrimary(t)) v *= unary() // 2π, 3(4 + 1), 5√(2)
      else return v
    }
  }
  const unary = (): number => {
    const t = peek()
    if (t?.t === 'op' && (t.v === '-' || t.v === '+')) {
      p++
      const v = unary()
      return t.v === '-' ? -v : v
    }
    return power()
  }
  const power = (): number => {
    const base = postfix()
    const t = peek()
    if (t?.t === 'op' && t.v === '^') {
      p++
      const e = unary() // right-associative, and allows 10^−3
      const v = Math.pow(base, e)
      if (Number.isNaN(v)) throw maths()
      return v
    }
    return base
  }
  const postfix = (): number => {
    let v = primary()
    while (peek()?.t === 'sq') {
      p++
      v = v * v
    }
    return v
  }
  const primary = (): number => {
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
    if (!Number.isFinite(v)) throw maths()
    return { ok: true, value: v }
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
