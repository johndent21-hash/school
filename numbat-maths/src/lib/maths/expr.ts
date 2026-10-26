// A small algebra parser for checking students' typed answers.
// Supports + − × ÷ ^, brackets, implicit multiplication (3x, 2ab, 4(x+1), (x+1)(x−2)),
// unicode signs and superscripts. Expressions are compared by evaluating at random points,
// and their written form can be checked (simplified, expanded, fully factorised...).

export type Node =
  | { t: 'num'; v: number }
  | { t: 'var'; n: string }
  | { t: 'add' | 'sub' | 'mul' | 'div' | 'pow'; a: Node; b: Node }
  | { t: 'neg'; a: Node }
  | { t: 'paren'; a: Node }

const SUPERS: Record<string, string> = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-',
}

/** Normalise unicode maths symbols to ASCII. */
export function normalise(s: string): string {
  let out = s
    .replace(/[−–—‐]/g, '-')
    .replace(/[×·∙⋅]/g, '*')
    .replace(/÷/g, '/')
    .replace(/[   ]/g, ' ')
    .replace(/π/g, 'pi')
  // superscripts -> ^(...)
  out = out.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/g, (m) => '^(' + [...m].map((c) => SUPERS[c]).join('') + ')')
  return out.trim()
}

type Tok = { k: 'num'; v: number } | { k: 'var'; n: string } | { k: 'op'; v: string } | { k: 'lp' } | { k: 'rp' }

function tokenize(s: string): Tok[] {
  const toks: Tok[] = []
  let i = 0
  while (i < s.length) {
    const c = s[i]
    if (c === ' ') {
      i++
      continue
    }
    if (/[0-9.]/.test(c)) {
      let j = i
      while (j < s.length && /[0-9.]/.test(s[j])) j++
      const str = s.slice(i, j)
      if ((str.match(/\./g) || []).length > 1 || str === '.') throw new Error('bad number')
      toks.push({ k: 'num', v: parseFloat(str) })
      i = j
      continue
    }
    if (s.startsWith('pi', i)) {
      toks.push({ k: 'num', v: Math.PI })
      i += 2
      continue
    }
    if (/[a-zA-Z]/.test(c)) {
      toks.push({ k: 'var', n: c })
      i++
      continue
    }
    if ('+-*/^'.includes(c)) {
      toks.push({ k: 'op', v: c })
      i++
      continue
    }
    if (c === '(' || c === '[') {
      toks.push({ k: 'lp' })
      i++
      continue
    }
    if (c === ')' || c === ']') {
      toks.push({ k: 'rp' })
      i++
      continue
    }
    throw new Error('unexpected character ' + c)
  }
  return toks
}

export function parse(input: string): Node {
  const toks = tokenize(normalise(input))
  let p = 0
  const peek = () => toks[p]
  const isOp = (v: string) => {
    const t = toks[p]
    return t && t.k === 'op' && t.v === v
  }

  function expr(): Node {
    let left = term()
    while (isOp('+') || isOp('-')) {
      const op = (toks[p++] as { v: string }).v
      const right = term()
      left = { t: op === '+' ? 'add' : 'sub', a: left, b: right }
    }
    return left
  }
  function term(): Node {
    let left = unary()
    for (;;) {
      const t = peek()
      if (!t) break
      if (t.k === 'op' && (t.v === '*' || t.v === '/')) {
        p++
        const right = unary()
        left = { t: t.v === '*' ? 'mul' : 'div', a: left, b: right }
      } else if (t.k === 'var' || t.k === 'lp' || (t.k === 'num' && (left.t === 'paren' || endsWithVar(left)))) {
        const right = power()
        left = { t: 'mul', a: left, b: right }
      } else break
    }
    return left
  }
  function unary(): Node {
    if (isOp('-')) {
      p++
      return { t: 'neg', a: unary() }
    }
    if (isOp('+')) {
      p++
      return unary()
    }
    return power()
  }
  function power(): Node {
    const base = atom()
    if (isOp('^')) {
      p++
      const e = unary()
      return { t: 'pow', a: base, b: e }
    }
    return base
  }
  function atom(): Node {
    const t = toks[p++]
    if (!t) throw new Error('unexpected end')
    if (t.k === 'num') return { t: 'num', v: t.v }
    if (t.k === 'var') return { t: 'var', n: t.n }
    if (t.k === 'lp') {
      const e = expr()
      const r = toks[p++]
      if (!r || r.k !== 'rp') throw new Error('missing )')
      return { t: 'paren', a: e }
    }
    throw new Error('unexpected token')
  }
  const result = expr()
  if (p !== toks.length) throw new Error('unexpected trailing input')
  return result
}

function endsWithVar(n: Node): boolean {
  if (n.t === 'var') return true
  if (n.t === 'pow') return true
  if (n.t === 'mul') return endsWithVar(n.b)
  return false
}

export function evaluate(n: Node, env: Record<string, number>): number {
  switch (n.t) {
    case 'num':
      return n.v
    case 'var':
      if (!(n.n in env)) return NaN
      return env[n.n]
    case 'add':
      return evaluate(n.a, env) + evaluate(n.b, env)
    case 'sub':
      return evaluate(n.a, env) - evaluate(n.b, env)
    case 'mul':
      return evaluate(n.a, env) * evaluate(n.b, env)
    case 'div':
      return evaluate(n.a, env) / evaluate(n.b, env)
    case 'pow':
      return Math.pow(evaluate(n.a, env), evaluate(n.b, env))
    case 'neg':
      return -evaluate(n.a, env)
    case 'paren':
      return evaluate(n.a, env)
  }
}

export function variables(n: Node, out = new Set<string>()): Set<string> {
  if (n.t === 'var') out.add(n.n)
  else if (n.t === 'neg' || n.t === 'paren') variables(n.a, out)
  else if (n.t !== 'num') {
    variables(n.a, out)
    variables(n.b, out)
  }
  return out
}

const SAMPLE_POINTS = [1.37, -0.83, 2.21, 0.47, -1.62, 3.09, 1.91, -2.43]

/** True when two expressions agree at several random-ish points. */
export function equivalent(a: Node, b: Node): boolean {
  const vars = Array.from(new Set([...variables(a), ...variables(b)])).sort()
  let checked = 0
  for (let k = 0; k < 8; k++) {
    const env: Record<string, number> = {}
    vars.forEach((name, i) => {
      env[name] = SAMPLE_POINTS[(k + i * 3) % SAMPLE_POINTS.length] + i * 0.13
    })
    const x = evaluate(a, env)
    const y = evaluate(b, env)
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue
    checked++
    const scale = Math.max(1, Math.abs(x), Math.abs(y))
    if (Math.abs(x - y) > 1e-7 * scale) return false
  }
  return checked >= 3
}

// ---------- Polynomial normal form (Laurent polynomials with real coefficients) ----------

type Mono = Record<string, number>
export type Poly = Map<string, { c: number; m: Mono }>

function monoKey(m: Mono): string {
  return Object.keys(m)
    .filter((k) => m[k] !== 0)
    .sort()
    .map((k) => k + m[k])
    .join('')
}

function addTo(p: Poly, c: number, m: Mono) {
  const key = monoKey(m)
  const cur = p.get(key)
  const nc = (cur ? cur.c : 0) + c
  if (Math.abs(nc) < 1e-12) p.delete(key)
  else p.set(key, { c: nc, m })
}

function polyAdd(a: Poly, b: Poly, sign = 1): Poly {
  const r: Poly = new Map()
  a.forEach(({ c, m }) => addTo(r, c, m))
  b.forEach(({ c, m }) => addTo(r, sign * c, m))
  return r
}

function polyMul(a: Poly, b: Poly): Poly {
  const r: Poly = new Map()
  a.forEach((x) =>
    b.forEach((y) => {
      const m: Mono = { ...x.m }
      for (const k of Object.keys(y.m)) m[k] = (m[k] || 0) + y.m[k]
      for (const k of Object.keys(m)) if (m[k] === 0) delete m[k]
      addTo(r, x.c * y.c, m)
    }),
  )
  return r
}

function constPoly(c: number): Poly {
  const r: Poly = new Map()
  if (c !== 0) r.set('', { c, m: {} })
  return r
}

export function toPoly(n: Node): Poly | null {
  switch (n.t) {
    case 'num':
      return constPoly(n.v)
    case 'var': {
      const r: Poly = new Map()
      r.set(n.n + '1', { c: 1, m: { [n.n]: 1 } })
      return r
    }
    case 'paren':
      return toPoly(n.a)
    case 'neg': {
      const a = toPoly(n.a)
      return a ? polyAdd(new Map(), a, -1) : null
    }
    case 'add':
    case 'sub': {
      const a = toPoly(n.a)
      const b = toPoly(n.b)
      return a && b ? polyAdd(a, b, n.t === 'add' ? 1 : -1) : null
    }
    case 'mul': {
      const a = toPoly(n.a)
      const b = toPoly(n.b)
      return a && b ? polyMul(a, b) : null
    }
    case 'div': {
      const a = toPoly(n.a)
      const b = toPoly(n.b)
      if (!a || !b || b.size !== 1) return null
      const [{ c, m }] = Array.from(b.values())
      const inv: Mono = {}
      for (const k of Object.keys(m)) inv[k] = -m[k]
      const r: Poly = new Map()
      r.set(monoKey(inv), { c: 1 / c, m: inv })
      return polyMul(a, r)
    }
    case 'pow': {
      const e = constValue(n.b)
      if (e === null || !Number.isInteger(e)) return null
      const a = toPoly(n.a)
      if (!a) return null
      if (e < 0) {
        if (a.size !== 1) return null
        const [{ c, m }] = Array.from(a.values())
        const mm: Mono = {}
        for (const k of Object.keys(m)) mm[k] = m[k] * e
        const r: Poly = new Map()
        r.set(monoKey(mm), { c: Math.pow(c, e), m: mm })
        return r
      }
      if (e > 20) return null
      let r = constPoly(1)
      for (let i = 0; i < e; i++) r = polyMul(r, a)
      return r
    }
  }
}

export function constValue(n: Node): number | null {
  if (variables(n).size > 0) return null
  const v = evaluate(n, {})
  return Number.isFinite(v) ? v : null
}

// ---------- Form checks on the student's written expression ----------

function stripParen(n: Node): Node {
  while (n.t === 'paren') n = n.a
  return n
}

/** Flatten a sum into signed terms. */
export function sumTerms(n: Node, sign = 1, out: { sign: number; node: Node }[] = []) {
  if (n.t === 'add') {
    sumTerms(n.a, sign, out)
    sumTerms(n.b, sign, out)
  } else if (n.t === 'sub') {
    sumTerms(n.a, sign, out)
    sumTerms(n.b, -sign, out)
  } else if (n.t === 'neg' && (n.a.t === 'add' || n.a.t === 'sub')) {
    // -(a+b) only arises with explicit brackets, keep as one term
    out.push({ sign: -sign, node: n.a })
  } else if (n.t === 'neg') {
    sumTerms(n.a, -sign, out)
  } else out.push({ sign, node: n })
  return out
}

/** Flatten a product into factors (division by a number is allowed as a factor). */
export function productFactors(n: Node, out: Node[] = []): Node[] {
  if (n.t === 'mul') {
    productFactors(n.a, out)
    productFactors(n.b, out)
  } else if (n.t === 'neg') {
    out.push({ t: 'num', v: -1 })
    productFactors(n.a, out)
  } else out.push(n)
  return out
}

function hasParenSum(n: Node): boolean {
  switch (n.t) {
    case 'paren': {
      const inner = stripParen(n)
      if (inner.t === 'add' || inner.t === 'sub') return true
      return hasParenSum(inner)
    }
    case 'num':
    case 'var':
      return false
    case 'neg':
      return hasParenSum(n.a)
    case 'pow':
      return hasParenSum(n.a)
    default:
      return hasParenSum(n.a) || hasParenSum(n.b)
  }
}

/** A term like 3x²y, −x, 5, x/2 or 3/(4x) — one number and each pronumeral at most once. */
function isSimpleTerm(n: Node): boolean {
  let numerators = 0
  let denominators = 0
  const seen = new Set<string>()
  function walk(m: Node, inDenominator: boolean): boolean {
    m = stripParen(m)
    if (m.t === 'num') {
      if (inDenominator) denominators++
      else numerators++
      return true
    }
    if (m.t === 'var') {
      const key = m.n
      if (seen.has(key)) return false
      seen.add(key)
      return true
    }
    if (m.t === 'pow') {
      const base = stripParen(m.a)
      if (constValue(m.b) === null) return false
      if (base.t === 'var') {
        if (seen.has(base.n)) return false
        seen.add(base.n)
        return true
      }
      if (base.t === 'num') {
        if (inDenominator) denominators++
        else numerators++
        return true
      }
      return false
    }
    if (m.t === 'neg') return walk(m.a, inDenominator)
    if (m.t === 'mul') return walk(m.a, inDenominator) && walk(m.b, inDenominator)
    if (m.t === 'div') {
      if (inDenominator) return false
      return walk(m.a, false) && walk(m.b, true)
    }
    return false
  }
  const ok = walk(n, false)
  return ok && numerators <= 1 && denominators <= 1
}

export function isSimplified(input: Node): { ok: boolean; why?: string } {
  if (hasParenSum(input)) return { ok: false, why: 'Remove the brackets.' }
  const poly = toPoly(input)
  const written = sumTerms(input)
  if (!written.every((t) => isSimpleTerm(t.node))) return { ok: false, why: 'Simplify each term fully.' }
  if (poly && written.length > Math.max(1, poly.size)) return { ok: false, why: 'Collect the like terms.' }
  return { ok: true }
}

export function isExpanded(input: Node): { ok: boolean; why?: string } {
  if (hasParenSum(input)) return { ok: false, why: 'Expand (remove) the brackets.' }
  return isSimplified(input)
}

export function isFullyFactorised(input: Node): { ok: boolean; why?: string } {
  const n = stripParen(input)
  if (input.t !== 'paren' && (n.t === 'add' || n.t === 'sub')) {
    return { ok: false, why: 'Write your answer as a product, with brackets.' }
  }
  const factors = productFactors(n)
  const sums = factors.map(stripParen).filter((f) => f.t === 'add' || f.t === 'sub')
  if (sums.length === 0) return { ok: false, why: 'Write your answer as a product, with brackets.' }
  for (const s of sums) {
    const p = toPoly(s)
    if (!p) continue
    const coefs = Array.from(p.values()).map((x) => x.c)
    if (coefs.every((c) => Number.isInteger(c))) {
      const g = coefs.reduce((a, c) => gcdInt(a, Math.abs(c)), 0)
      if (g > 1) return { ok: false, why: 'Not fully factorised: the bracket still has a common factor of ' + g + '.' }
    }
    const monos = Array.from(p.values()).map((x) => x.m)
    const vars = Object.keys(monos[0] || {})
    for (const v of vars) {
      if (monos.every((m) => (m[v] || 0) > 0)) {
        return { ok: false, why: `Not fully factorised: every term in the bracket still contains ${v}.` }
      }
    }
  }
  return { ok: true }
}

function gcdInt(a: number, b: number): number {
  while (b) [a, b] = [b, a % b]
  return a
}

function hasNegativeIndex(n: Node): boolean {
  switch (n.t) {
    case 'pow': {
      const e = constValue(n.b)
      if (e !== null && e < 0) return true
      return hasNegativeIndex(n.a)
    }
    case 'num':
    case 'var':
      return false
    case 'neg':
    case 'paren':
      return hasNegativeIndex(n.a)
    default:
      return hasNegativeIndex(n.a) || hasNegativeIndex(n.b)
  }
}

export function hasPositiveIndicesOnly(input: Node): { ok: boolean; why?: string } {
  if (hasNegativeIndex(input)) return { ok: false, why: 'Write your answer using positive indices only.' }
  return { ok: true }
}

function hasPow(n: Node): boolean {
  if (n.t === 'pow') return true
  if (n.t === 'num' || n.t === 'var') return false
  if (n.t === 'neg' || n.t === 'paren') return hasPow(n.a)
  return hasPow(n.a) || hasPow(n.b)
}

/** Index form: a single product such as 5^7, 12x^7 or 3a^4b^2 with each base once. */
export function isIndexForm(input: Node, expected: Node): { ok: boolean; why?: string } {
  const n = stripParen(input)
  if (n.t === 'add' || n.t === 'sub') return { ok: false, why: 'Write your answer as a single term.' }
  const factors = productFactors(n)
  let plainNumbers = 0
  const bases = new Set<string>()
  for (const f0 of factors) {
    const f = stripParen(f0)
    if (f.t === 'num') {
      if (f.v !== -1) plainNumbers++
      continue
    }
    if (f.t === 'var') {
      if (bases.has(f.n)) return { ok: false, why: 'Combine powers with the same base.' }
      bases.add(f.n)
      continue
    }
    if (f.t === 'pow') {
      const b = stripParen(f.a)
      const key = b.t === 'var' ? b.n : b.t === 'num' ? 'n' + b.v : '?'
      if (bases.has(key)) return { ok: false, why: 'Combine powers with the same base.' }
      bases.add(key)
      continue
    }
    if (f.t === 'div') return { ok: false, why: 'Simplify the division using the index laws.' }
    return { ok: false, why: 'Write your answer in index form.' }
  }
  if (plainNumbers > 1) return { ok: false, why: 'Multiply the numbers together.' }
  if (hasPow(expected) && !hasPow(input)) return { ok: false, why: 'Leave your answer in index form (use ^ for the power).' }
  return { ok: true }
}

/** One fraction such as (5x − 3)/6 or 7x/12, with the numerator expanded and collected. */
export function isSingleFraction(input: Node): { ok: boolean; why?: string } {
  const n = stripParen(input)
  if (n.t === 'add' || n.t === 'sub') return { ok: false, why: 'Write your answer as a single fraction.' }
  let num: Node = n
  if (n.t === 'div') num = n.a
  else if (n.t === 'mul' && stripParen(n.a).t === 'div') num = stripParen(n.a)
  const inner = stripParen(num)
  if (hasParenSum(inner)) return { ok: false, why: 'Expand and simplify the numerator.' }
  const res = isSimplified(inner)
  if (!res.ok) return { ok: false, why: 'Simplify the numerator.' }
  return { ok: true }
}
