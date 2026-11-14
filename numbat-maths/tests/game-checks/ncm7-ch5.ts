// Independent answers for the Chapter 5 (Algebra and equations) class games, used by tests/games.test.ts.
// The algebra is read back off the page with this file's own small parser (implicit multiplication binds tighter
// than × and ÷, as in 15ap ÷ 5p), and options are compared by evaluating them at several sets of values:
//  - "simplify" questions: exactly one option has the same value as the question's expression at every test point,
//    and no two options are the same expression;
//  - equations: exactly one option makes both sides equal, and it is the equation's only solution;
//  - word questions: this file's own reading of each phrase or story, then the same tests.
import type { GameQuestion, GameSet } from '../../src/lib/game/types'
import type { Ctx, Expect } from './ncm7-ch1'

export type Env = Record<string, number>
export type F = (e: Env) => number

/** the page's HTML as compact text: fractions become ((top)/(bottom)), powers ^(n), no spaces */
export function txt(html: string): string {
  return html
    .replace(/<span class="frac"[^>]*><span class="fn">(.*?)<\/span><span class="fd">(.*?)<\/span><\/span>/g, '(($1)/($2))')
    .replace(/<sup>(.*?)<\/sup>/g, '^($1)')
    .replace(/<[^>]*>/g, '')
    .replace(/&#9633;/g, '□')
    .replace(/\s+/g, '')
}

/** a parser for the algebra the games show */
export function parse(src: string): F {
  const s = src.replace(/−/g, '-').replace(/×/g, '*').replace(/÷/g, '/')
  let i = 0
  const expr = (): F => {
    let f = term()
    while (s[i] === '+' || s[i] === '-') {
      const op = s[i++]
      const a = f
      const g = term()
      f = op === '+' ? (e) => a(e) + g(e) : (e) => a(e) - g(e)
    }
    return f
  }
  const term = (): F => {
    let f = group()
    while (s[i] === '*' || s[i] === '/') {
      const op = s[i++]
      const a = f
      const g = group()
      f = op === '*' ? (e) => a(e) * g(e) : (e) => a(e) / g(e)
    }
    return f
  }
  // side-by-side factors (3ab, 2(x + 1)) multiply before × and ÷ are done
  const group = (): F => {
    let f = unary()
    while (i < s.length && /[0-9A-Za-z□(]/.test(s[i])) {
      const a = f
      const g = power()
      f = (e) => a(e) * g(e)
    }
    return f
  }
  const unary = (): F => {
    if (s[i] === '-') {
      i++
      const g = unary()
      return (e) => -g(e)
    }
    return power()
  }
  const power = (): F => {
    const b = atom()
    if (s[i] === '^') {
      i++
      const x = atom()
      return (e) => b(e) ** x(e)
    }
    return b
  }
  const atom = (): F => {
    const c = s[i]
    if (c === '(') {
      i++
      const f = expr()
      if (s[i] !== ')') throw new Error(`no closing bracket in "${s}"`)
      i++
      return f
    }
    const n = s.slice(i).match(/^\d+(\.\d+)?/)
    if (n) {
      i += n[0].length
      const x = Number(n[0])
      return () => x
    }
    if (c && /[A-Za-z□]/.test(c)) {
      i++
      return (e) => {
        if (!(c in e)) throw new Error(`no value for ${c}`)
        return e[c]
      }
    }
    throw new Error(`cannot read "${s}" at ${i}`)
  }
  const f = expr()
  if (i !== s.length) throw new Error(`cannot read "${s}" past ${i}`)
  return f
}
export const lettersIn = (s: string) => [...new Set(s.replace(/\^\(\d+\)/g, '').match(/[A-Za-z□]/g) ?? [])]
/** test points: every letter gets a different value, none of them 0 or 1 */
const POINTS = [
  [3, 7, 2, 5, 11, 13],
  [-2, 4, 9, 6, 3, 8],
  [5, -3, 7, 2, 4, 6],
  [1.5, 2.5, -4, 3, 7, 9],
]
function envs(letters: string[]): Env[] {
  return POINTS.map((p) => Object.fromEntries(letters.map((l, k) => [l, p[k % p.length] + Math.floor(k / p.length)])))
}
const close = (x: number, y: number) => Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(x), Math.abs(y))
/** two expressions (or a function) agree at every test point */
export function same(a: F, b: F, letters: string[]): boolean {
  return envs(letters).every((e) => close(a(e), b(e)))
}

/** a term's letters and powers, e.g. "3ab^(2)" → "a1b2" (for like terms) */
function signature(t: string): string {
  const body = t.replace(/^[-−]?\d*/, '')
  const pow: Record<string, number> = {}
  for (const m of body.matchAll(/([A-Za-z])(?:\^\((\d+)\))?/g)) pow[m[1]] = (pow[m[1]] ?? 0) + Number(m[2] ?? 1)
  return Object.keys(pow)
    .sort()
    .map((l) => l + pow[l])
    .join('')
}

/** the terms of a sum, split at + and − outside brackets: "3x−2y+5" → ["3x", "−2y", "+5"] */
function splitTerms(s: string): string[] {
  const out: string[] = []
  let depth = 0
  let cur = ''
  for (let k = 0; k < s.length; k++) {
    const c = s[k]
    if (c === '(') depth++
    if (c === ')') depth--
    if (depth === 0 && k > 0 && /[+\-−]/.test(c) && !/[(^]/.test(s[k - 1])) {
      out.push(cur)
      cur = ''
    }
    cur += c
  }
  out.push(cur)
  return out.map((t) => t.replace(/^\+/, '')).filter((t) => !/^[-−]?\d+(\.\d+)?$/.test(t) || true)
}

export function rework(set: GameSet, q: GameQuestion, ctx: Ctx): Expect {
  const kind = `${set.exercise} ${q.meta.t}`
  let want: Expect = null
  try {
    want = solve(kind, q, ctx)
  } catch (e) {
    ctx.fail(`could not be read: ${(e as Error).message}`)
    return null
  }
  if (want && 'text' in want && !['5.01 law', '5.10 isEq'].includes(kind)) {
    const why = ctx.plain(q.why).replace(/\s/g, '').toLowerCase()
    if (!why.includes(want.text.replace(/\s/g, '').toLowerCase())) ctx.fail(`the explanation does not reach ${want.text}`)
  }
  return want
}

function solve(kind: string, q: GameQuestion, ctx: Ctx): Expect {
  const prompt = txt(q.prompt)
  const words = ctx.plain(q.prompt)
  const bigHtml = q.prompt.match(/<div class="big">(.*?)<\/div>/)?.[1] ?? ''
  const bigT = txt(bigHtml)
  const opts = q.options.map(txt)
  const shown = q.options.map(ctx.plain)
  /** the one option equal to f at every test point; no two options may be the same expression */
  const theSame = (f: F, letters: string[]): Expect => {
    const all = [...new Set([...letters, ...opts.flatMap(lettersIn)])]
    const fs = opts.map(parse)
    for (let a = 0; a < 4; a++) for (let b = a + 1; b < 4; b++) if (same(fs[a], fs[b], all)) ctx.fail(`"${shown[a]}" and "${shown[b]}" are the same expression`)
    const hits = fs.map((g, k) => (same(f, g, all) ? k : -1)).filter((k) => k >= 0)
    if (hits.length !== 1) ctx.fail(`${hits.length} options are equal to the answer`)
    return hits.length ? { text: shown[hits[0]] } : null
  }
  /** the one option "x = n" that solves the equation, which must have exactly one solution */
  const solves = (eq: string): Expect => {
    const [l, r] = eq.split('=')
    const L = lettersIn(eq)
    if (L.length !== 1) throw new Error(`"${eq}" does not have one unknown`)
    const x = L[0]
    const f = (t: number) => parse(l)({ [x]: t }) - parse(r)({ [x]: t })
    const f0 = f(0)
    const raw = -f0 / (f(1) - f0)
    const root = Math.abs(raw - Math.round(raw)) < 1e-9 ? Math.round(raw) : raw
    if (!close(f(root), 0) || !close(f(root + 3), 3 * (f(1) - f0))) throw new Error(`"${eq}" is not a linear equation`)
    const hits = opts.filter((o) => {
      const m = o.match(new RegExp(`^${x}=([-−]?\\d+)$`))
      return m && close(f(Number(m[1].replace('−', '-'))), 0)
    })
    if (hits.length !== 1) ctx.fail(`${hits.length} options solve the equation`)
    if (!Number.isInteger(root)) ctx.fail(`the solution ${root} is not a whole number`)
    return { text: `${x} = ${root < 0 ? '−' + -root : root}` }
  }

  switch (kind) {
    // ---------------------------------------------------------------- 5.01, 5.02: arithmetic
    case '5.01 sum':
    case '5.01 product':
    case '5.01 tens':
    case '5.02 nine':
    case '5.02 eleven':
    case '5.02 eightTwelve':
      return { v: parse(bigT)({}) }
    case '5.01 law': {
      const triples = [
        [7, 3, 2],
        [5, 11, 4],
        [13, 2, 6],
      ]
      const always = opts.map((o) => {
        const [l, r] = o.split('=')
        return triples.every(([a, b, c]) => close(parse(l)({ a, b, c }), parse(r)({ a, b, c })))
      })
      const findFalse = /not/.test(prompt)
      const hits = always.map((t, k) => (t !== findFalse ? k : -1)).filter((k) => k >= 0)
      if (hits.length !== 1) ctx.fail(`${hits.length} options fit`)
      return { text: shown[hits[0]] }
    }
    case '5.02 blank': {
      const [l, r] = bigT.split('=')
      const L = parse(l)({})
      const R = parse(r)
      const r0 = R({ '□': 0 })
      const box = (L - r0) / (R({ '□': 1 }) - r0)
      if (!Number.isInteger(box)) ctx.fail('the box is not a whole number')
      return { v: box }
    }
    // ---------------------------------------------------------------- 5.03–5.09: the same expression
    case '5.03 simplify':
    case '5.06 collect':
    case '5.07 collect':
    case '5.07 mixed':
    case '5.08 mult':
    case '5.08 powers':
    case '5.08 neg':
    case '5.09 div':
    case '5.09 fracs': {
      const want = theSame(parse(bigT), lettersIn(bigT))
      // and the answer is fully simplified: no two like terms left in it
      if (want && 'text' in want) {
        const sigs = splitTerms(txt(q.options[q.correct])).map(signature)
        if (new Set(sigs).size !== sigs.length) ctx.fail(`the answer "${want.text}" still has like terms`)
      }
      return want
    }
    case '5.03 expanded': {
      // the right option lists the number once and each letter as often as its power, nothing else
      const tm = bigT.match(/^(\d+)((?:[a-z](?:\^\(\d+\))?)+)$/)!
      const want = { c: Number(tm[1]), p: {} as Record<string, number> }
      for (const l of tm[2].matchAll(/([a-z])(?:\^\((\d+)\))?/g)) want.p[l[1]] = Number(l[2] ?? 1)
      const ok = shown.map((o) => {
          const f = o.replace(/\s/g, '').split('×')
          const nums = f.filter((x) => /^\d+$/.test(x))
          const ls = f.filter((x) => /^[a-z]$/.test(x))
          if (nums.length !== 1 || nums.length + ls.length !== f.length || Number(nums[0]) !== want.c) return false
          const p: Record<string, number> = {}
          for (const l of ls) p[l] = (p[l] ?? 0) + 1
          return Object.keys({ ...p, ...want.p }).every((l) => p[l] === want.p[l])
        })
      if (ok.filter(Boolean).length !== 1) ctx.fail(`${ok.filter(Boolean).length} options are the expanded form`)
      return { text: shown[ok.indexOf(true)] ?? '' }
    }
    case '5.03 notEqual': {
      const target = parse(prompt.match(/notequalto(.+)\?$/)![1])
      const L = [...new Set(opts.flatMap(lettersIn))]
      const odd = opts.map((o, k) => (same(parse(o), target, L) ? -1 : k)).filter((k) => k >= 0)
      if (odd.length !== 1) ctx.fail(`${odd.length} options are not equal to it`)
      return { text: shown[odd[0]] }
    }
    case '5.04 words':
    case '5.04 twoStep': {
      const phrase = (words.match(/means ‘(.+?)\s*’/)?.[1] ?? '').replace(/\s+/g, ' ').replace(/ ,/g, ',').trim()
      const RULES: [RegExp, (m: RegExpMatchArray) => F][] = [
        [/^(\d+) more than (\w)$/, (m) => (e) => e[m[2]] + Number(m[1])],
        [/^(\d+) less than (\w)$/, (m) => (e) => e[m[2]] - Number(m[1])],
        [/^(\w) decreased by (\d+)$/, (m) => (e) => e[m[1]] - Number(m[2])],
        [/^(\d+) decreased by (\w)$/, (m) => (e) => Number(m[1]) - e[m[2]]],
        [/^(\w) increased by (\d+)$/, (m) => (e) => e[m[1]] + Number(m[2])],
        [/^the product of (\d+) and (\w)$/, (m) => (e) => Number(m[1]) * e[m[2]]],
        [/^(\w) divided by (\d+)$/, (m) => (e) => e[m[1]] / Number(m[2])],
        [/^the sum of (\w) and (\d+)$/, (m) => (e) => e[m[1]] + Number(m[2])],
        [/^triple (\w)$/, (m) => (e) => 3 * e[m[1]]],
        [/^half of (\w)$/, (m) => (e) => e[m[1]] / 2],
        [/^(\w) squared$/, (m) => (e) => e[m[1]] ** 2],
        [/^(\w) cubed$/, (m) => (e) => e[m[1]] ** 3],
        [/^one-tenth of (\w)$/, (m) => (e) => e[m[1]] / 10],
        [/^(\d+) times the sum of (\w) and (\d+)$/, (m) => (e) => Number(m[1]) * (e[m[2]] + Number(m[3]))],
        [/^double (\w), then subtract (\d+)$/, (m) => (e) => 2 * e[m[1]] - Number(m[2])],
        [/^(\w) multiplied by (\d+), then (\d+) added$/, (m) => (e) => Number(m[2]) * e[m[1]] + Number(m[3])],
        [/^the sum of (\w) and (\d+), divided by 2$/, (m) => (e) => (e[m[1]] + Number(m[2])) / 2],
      ]
      for (const [re, make] of RULES) {
        const m = phrase.match(re)
        if (m) return theSame(make(m), [])
      }
      throw new Error(`no reading of "${phrase}"`)
    }
    case '5.04 story': {
      const STORY: [RegExp, (m: RegExpMatchArray) => F][] = [
        [/has (\w) boys and (\w) girls/, (m) => (e) => e[m[1]] + e[m[2]]],
        [/Each of (\w) guests eats (\d+) sausage rolls/, (m) => (e) => Number(m[2]) * e[m[1]]],
        [/has (\w) students and (\w) of them are away/, (m) => (e) => e[m[1]] - e[m[2]]],
        [/sell for \$(\d+) each\. How many dollars do (\w) rolls earn/, (m) => (e) => Number(m[1]) * e[m[2]]],
        [/is (\w) years old\. How old will Jo be in (\d+) years/, (m) => (e) => e[m[1]] + Number(m[2])],
        [/^(\w) cards are shared equally among (\d+) players/, (m) => (e) => e[m[1]] / Number(m[2])],
        [/A box holds (\d+) pens\. How many pens are in (\w) boxes/, (m) => (e) => Number(m[1]) * e[m[2]]],
      ]
      for (const [re, make] of STORY) {
        const m = words.match(re)
        if (m) return theSame(make(m), [])
      }
      throw new Error('no reading of the story')
    }
    // ---------------------------------------------------------------- 5.05: substitution
    case '5.05 sub':
    case '5.05 square': {
      const m = prompt.match(/^Findthevaluewhen(\w)=([-−]?\d+):/)!
      return { v: parse(bigT)({ [m[1]]: Number(m[2].replace('−', '-')) }) }
    }
    case '5.05 many': {
      const m = prompt.match(/^If(\w)=([-−]?\d+),(\w)=([-−]?\d+)and(\w)=([-−]?\d+),find:/)!
      const n = (s: string) => Number(s.replace('−', '-'))
      return { v: parse(bigT)({ [m[1]]: n(m[2]), [m[3]]: n(m[4]), [m[5]]: n(m[6]) }) }
    }
    case '5.05 formula': {
      const m = prompt.match(/^If(\w)=(.+),find(\w)when(\w)=([-−]?\d+)\.$/)!
      if (m[1] !== m[3]) ctx.fail('asks for a different letter')
      return { v: parse(m[2])({ [m[4]]: Number(m[5].replace('−', '-')) }) }
    }
    // ---------------------------------------------------------------- 5.06: counted from the drawing
    case '5.06 cups':
    case '5.06 envelopes': {
      const svg = q.diagram ?? ''
      const cups = (svg.match(/class="sh cup"/g) ?? []).length
      const env = (svg.match(/class="sh2 env"/g) ?? []).length
      const balls = (svg.match(/class="obj ball"/g) ?? []).length
      if (!cups) ctx.fail('no cups drawn')
      if ((env > 0) !== /envelope/.test(words)) ctx.fail('envelopes drawn but not explained, or the other way round')
      return theSame((e) => cups * e.x + env * (e.y ?? 0) + balls, ['x', 'y'])
    }
    // ---------------------------------------------------------------- 5.07: like terms
    case '5.07 like': {
      const target = signature(prompt.match(/liketermto(.+)\?$/)![1])
      const hits = opts.map((o, k) => (signature(o) === target ? k : -1)).filter((k) => k >= 0)
      if (hits.length !== 1) ctx.fail(`${hits.length} options are like terms`)
      return { text: shown[hits[0]] }
    }
    // ---------------------------------------------------------------- 5.10–5.12: equations
    case '5.10 inspect':
    case '5.10 check':
    case '5.11 solve':
    case '5.12 two':
    case '5.12 neg':
    case '5.12 fracEq':
      return solves(bigT)
    case '5.10 isEq': {
      const findEq = !/expression/.test(prompt)
      const hits = opts.map((o, k) => (o.includes('=') === findEq ? k : -1)).filter((k) => k >= 0)
      if (hits.length !== 1) ctx.fail(`${hits.length} options fit`)
      return { text: shown[hits[0]] }
    }
    case '5.11 step': {
      // the inverse operation leaves the pronumeral on its own
      const [l] = bigT.split('=')
      const x = lettersIn(l)[0]
      const lhs = parse(l)
      const hits = shown.filter((o) => {
        const m = o.match(/^(Add|Subtract|Multiply by|Divide by) (\d+)$/)!
        const k = Number(m[2])
        const g: F = { Add: (e: Env) => lhs(e) + k, Subtract: (e: Env) => lhs(e) - k, 'Multiply by': (e: Env) => lhs(e) * k, 'Divide by': (e: Env) => lhs(e) / k }[m[1] as 'Add']
        return same(g, (e) => e[x], [x])
      })
      if (hits.length !== 1) ctx.fail(`${hits.length} options leave the pronumeral on its own`)
      return { text: hits[0] }
    }
    case '5.12 first': {
      const m = prompt.match(/solves(.+?)=(.+?)andfirstwrites(.+?)=(.+?)\.What/)!
      const [l0, r0, l1, r1] = [parse(m[1]), parse(m[2])({}), parse(m[3]), parse(m[4])({})]
      const x = lettersIn(m[1])[0]
      const hits = shown.filter((o) => {
        const p = o.match(/^(Add|Subtract|Divide by) (\d+)$/)!
        const k = Number(p[2])
        const op = (t: number) => (p[1] === 'Add' ? t + k : p[1] === 'Subtract' ? t - k : t / k)
        return same((e) => op(l0(e)), l1, [x]) && close(op(r0), r1)
      })
      if (hits.length !== 1) ctx.fail(`${hits.length} options turn the first line into the second`)
      return { text: hits[0] }
    }
    // ---------------------------------------------------------------- 5.13: problems
    case '5.13 model': {
      const STORY: [RegExp, (m: RegExpMatchArray) => [string, number]][] = [
        [/^(\d+)ticketscost\$(\d+)altogether\.(\w)isthepriceofoneticket/, (m) => [m[3], Number(m[2]) / Number(m[1])]],
        [/^Anumber(\w)isdoubledandtheresultis(\d+)\./, (m) => [m[1], Number(m[2]) / 2]],
        [/^Anumber(\w)has(\d+)takenawayandtheresultis(\d+)\./, (m) => [m[1], Number(m[3]) + Number(m[2])]],
        [/has(\w)stickers\.Johas(\d+)timesasmany,whichis(\d+)\./, (m) => [m[1], Number(m[3]) / Number(m[2])]],
        [/is(\w)yearsold\.In(\d+)years\w+willbe(\d+)\./, (m) => [m[1], Number(m[3]) - Number(m[2])]],
      ]
      for (const [re, read] of STORY) {
        const m = prompt.match(re)
        if (!m) continue
        const [x, value] = read(m)
        const hits = opts.filter((o) => {
          const [l, r] = o.split('=')
          if (lettersIn(o).join('') !== x) ctx.fail(`"${o}" uses a different letter`)
          return close(parse(l)({ [x]: value }), parse(r)({ [x]: value }))
        })
        if (hits.length !== 1) ctx.fail(`${hits.length} equations fit the story's answer ${value}`)
        return { text: ctx.plain(q.options[opts.indexOf(hits[0])]) }
      }
      throw new Error('no reading of the story')
    }
    case '5.13 solveWords': {
      let m = prompt.match(/^Anumberisdoubledandtheresultis(\d+)\./)
      if (m) return { v: Number(m[1]) / 2 }
      m = prompt.match(/^Anumberhas(\d+)takenawayandtheresultis(\d+)\./)
      if (m) return { v: Number(m[2]) + Number(m[1]) }
      m = prompt.match(/^Anumberisdividedby(\d+)andtheresultis(\d+)\./)
      if (m) return { v: Number(m[2]) * Number(m[1]) }
      m = prompt.match(/^(\d+)ticketscost\$(\d+)altogether\.Howmanydollarsisoneticket/)
      if (m) return { v: Number(m[2]) / Number(m[1]) }
      throw new Error('no reading of the problem')
    }
    case '5.13 think': {
      const m = prompt.match(/multipliesitby(\d+),then(adds|subtracts)(\d+)\.Theansweris([-−]?\d+)\./)!
      const R = Number(m[4].replace('−', '-'))
      const n = (m[2] === 'adds' ? R - Number(m[3]) : R + Number(m[3])) / Number(m[1])
      if (!Number.isInteger(n)) ctx.fail('the number is not whole')
      return { v: n }
    }
  }
  ctx.fail('no independent check for this kind of question')
  return null
}
