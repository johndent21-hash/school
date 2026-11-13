// Independent answers for the Chapter 4 (Fractions and percentages) class games, used by tests/games.test.ts.
// Each answer is worked out here from what the page shows: the sum, product or quotient is read back off the page
// and worked with this file's own exact fraction arithmetic; the strip drawing is measured; unit sizes come from
// this file's own table. Nothing is taken from the question's code.
//
// Every question is also checked for:
//  - no wrong option equal in value to the answer (in "simplest form" questions, an equal option is allowed only
//    when it is not in simplest form, as that is the mistake being tested);
//  - fractions written properly (mixed numerals with a proper fraction part, no denominator of 1);
//  - an explanation that ends up at the answer.
import type { GameQuestion, GameSet } from '../../src/lib/game/types'
import type { Ctx, Expect } from './ncm7-ch1'

type R = [number, number]
const gcd = (a: number, c: number): number => (c === 0 ? Math.abs(a) : gcd(c, a % c))
const norm = ([n, d]: R): R => {
  const g = gcd(n, d) || 1
  return [n / g, d / g]
}
const add = (a: R, c: R): R => norm([a[0] * c[1] + c[0] * a[1], a[1] * c[1]])
const sub = (a: R, c: R): R => norm([a[0] * c[1] - c[0] * a[1], a[1] * c[1]])
const mul = (a: R, c: R): R => norm([a[0] * c[0], a[1] * c[1]])
const div = (a: R, c: R): R => norm([a[0] * c[1], a[1] * c[0]])
const val = (r: R) => r[0] / r[1]

/** simplest form as the page shows it after plain(): "3", "(3/4)" or "2 (1/4)" */
function showMixed(r: R): string {
  const [n, d] = norm(r)
  if (d === 1) return String(n)
  const w = Math.floor(n / d)
  return w > 0 ? `${w} (${n - w * d}/${d})` : `(${n}/${d})`
}
/** simplest form with an improper fraction left improper */
function showImproper(r: R): string {
  const [n, d] = norm(r)
  return d === 1 ? String(n) : `(${n}/${d})`
}
const dec = (x: number) => String(Math.round(x * 1e6) / 1e6)

/** one number as the page writes it: "3", "(3/4)", "2 (1/4)" */
function term(s: string): R | null {
  let m = s.match(/^(\d+) \((\d+)\/(\d+)\)$/)
  if (m) return [Number(m[1]) * Number(m[3]) + Number(m[2]), Number(m[3])]
  m = s.match(/^\((\d+)\/(\d+)\)$/)
  if (m) return [Number(m[1]), Number(m[2])]
  m = s.match(/^(\d+)(?:\.(\d+))?$/)
  if (m) return norm([Number(m[1] + (m[2] ?? '')), 10 ** (m[2] ?? '').length])
  return null
}
/** "a op b", worked exactly */
function evaluate(expr: string): R | null {
  const m = expr.match(/^(.+?) ([+−×÷]) (.+)$/)
  if (!m) return null
  const a = term(m[1])
  const c = term(m[3])
  if (!a || !c) return null
  return { '+': add, '−': sub, '×': mul, '÷': div }[m[2] as '+']!(a, c)
}
/** the value of an option: fractions, decimals, percentages, money and measures */
function optionValue(o: string): number | null {
  const pct = o.match(/^(\d+(?:\.\d+)?)%$/)
  if (pct) return Number(pct[1]) / 100
  const money = o.match(/^\$(\d+)$/)
  if (money) return Number(money[1])
  const measure = o.match(/^(\d+) (kg|m|L|g)$/)
  if (measure) return Number(measure[1])
  const t = term(o)
  return t ? val(t) : null
}

/** sizes of the units the questions use, in the smaller unit */
const WHOLE: Record<string, [string, number]> = {
  'an hour': ['minutes', 60],
  'a day': ['hours', 24],
  'a kilogram': ['g', 1000],
  'a litre': ['mL', 1000],
  'a metre': ['cm', 100],
  'a dollar': ['cents', 100],
  'a kilometre': ['m', 1000],
}
const SMALLER: Record<string, [string, number]> = { m: ['cm', 100], km: ['m', 1000], kg: ['g', 1000], L: ['mL', 1000], h: ['min', 60], $: ['cents', 100] }

export function rework(set: GameSet, q: GameQuestion, ctx: Ctx): Expect {
  const want = solve(set, q, ctx)
  if (!want) return want
  const shown = q.options.map(ctx.plain)
  const right = shown[q.correct]
  // ---- every fraction written properly
  for (const o of shown) {
    const mx = o.match(/^(\d+) \((\d+)\/(\d+)\)$/)
    if (mx && (Number(mx[2]) === 0 || Number(mx[2]) >= Number(mx[3]))) ctx.fail(`"${o}" is not a proper mixed numeral`)
    const fr = o.match(/\((\d+)\/(\d+)\)/)
    if (fr && (Number(fr[2]) <= 1 || Number(fr[1]) === 0)) ctx.fail(`"${o}" has a denominator of 1 or a numerator of 0`)
  }
  // ---- no wrong option equal in value to the answer
  const target = 'text' in want ? optionValue(want.text) : want.v * (right.endsWith('%') ? 0.01 : 1)
  const simplest = /simplest form/.test(ctx.page)
  if (target !== null) {
    shown.forEach((o, i) => {
      if (i === q.correct) return
      const v = optionValue(o)
      if (v === null) return ctx.fail(`the option "${o}" is not a number like the answer`)
      if (Math.abs(v - target) < 1e-9) {
        const raw = o.match(/^\((\d+)\/(\d+)\)$/)
        if (!(simplest && raw && gcd(Number(raw[1]), Number(raw[2])) > 1)) ctx.fail(`the wrong option "${o}" equals the answer`)
      }
    })
  }
  // ---- the explanation reaches the answer
  if ('text' in want && !ctx.plain(q.why).replace(/\s/g, '').toLowerCase().includes(want.text.replace(/\s/g, '').toLowerCase())) ctx.fail(`the explanation does not reach ${want.text}`)
  return want
}

function solve(set: GameSet, q: GameQuestion, ctx: Ctx): Expect {
  const m = q.meta as Record<string, any>
  const page = ctx.page
  const bigText = ctx.plain(q.prompt.match(/<div class="big">(.*?)<\/div>/)?.[1] ?? '')
  const fracIn = (s: string): R | null => {
    const f = s.match(/\((\d+)\/(\d+)\)/)
    return f ? [Number(f[1]), Number(f[2])] : null
  }
  const shown = q.options.map(ctx.plain)
  /** the option that is largest or smallest in value, which must be the only one */
  const extreme = (): Expect => {
    const largest = /largest/.test(page)
    if (!largest && !/smallest/.test(page)) ctx.fail('neither largest nor smallest is asked for')
    const vs = shown.map(optionValue)
    if (vs.some((v) => v === null)) return ctx.fail('an option is not a number'), null
    const best = largest ? Math.max(...(vs as number[])) : Math.min(...(vs as number[]))
    if (vs.filter((v) => Math.abs(v! - best) < 1e-9).length !== 1) ctx.fail('two options share the largest or smallest value')
    return { text: shown[vs.indexOf(best)] }
  }

  switch (`${set.exercise} ${m.t}`) {
    // ---------------------------------------------------------------- 4.01
    case '4.01 shaded': {
      const all = [...(q.diagram ?? '').matchAll(/<rect class="fpart( on)?" x="[\d.]+" y="[\d.]+" width="([\d.]+)"/g)]
      const widths = all.map((r) => Number(r[2]))
      if (!all.length || Math.max(...widths) - Math.min(...widths) > 0.5) ctx.fail('the parts of the strip are not equal')
      const on = all.filter((r) => r[1]).length
      if (on === 0 || on === all.length) ctx.fail('none or all of the strip is shaded')
      return { text: showMixed([on, all.length]) }
    }
    case '4.01 equiv': {
      const e = bigText.match(/^\((\d+)\/(\d+)\) = \((□|\d+)\/(□|\d+)\)$/)
      if (!e) return ctx.fail(`cannot read "${bigText}"`), null
      const [n, d] = [Number(e[1]), Number(e[2])]
      const v = e[3] === '□' ? (n * Number(e[4])) / d : (Number(e[3]) * d) / n
      if (!Number.isInteger(v)) ctx.fail('the missing number is not a whole number')
      return { v }
    }
    case '4.01 simplify':
    case '4.01 mixed': {
      const t = term(bigText)
      if (!t) return ctx.fail(`cannot read "${bigText}"`), null
      return { text: showMixed(t) }
    }
    case '4.01 improper': {
      const t = term(bigText)
      if (!t || !/^\d+ \(/.test(bigText)) return ctx.fail(`"${bigText}" is not a mixed numeral`), null
      return { text: showImproper(t) }
    }
    // ---------------------------------------------------------------- 4.02
    case '4.02 unit':
    case '4.02 compare':
      return extreme()
    case '4.02 bench': {
      const f = fracIn(page)!
      if (f[0] === f[1]) ctx.fail('the fraction is 1')
      return { text: 2 * f[0] < f[1] ? 'Less than ½' : 2 * f[0] === f[1] ? 'Exactly ½' : f[0] < f[1] ? 'Between ½ and 1' : 'More than 1' }
    }
    // ---------------------------------------------------------------- 4.03, 4.04, 4.06, 4.07: worked exactly
    case '4.03 same':
    case '4.03 related':
    case '4.03 unrelated':
    case '4.04 addMixed':
    case '4.04 subMixed':
    case '4.04 fromWhole':
    case '4.04 carry':
    case '4.06 times':
    case '4.06 whole':
    case '4.06 cancel':
    case '4.06 mixedTimes':
    case '4.07 wholeBy':
    case '4.07 divide':
    case '4.07 byWhole': {
      const r = evaluate(bigText)
      if (!r) return ctx.fail(`cannot work out "${bigText}"`), null
      if (r[0] <= 0) ctx.fail('the answer is not positive')
      return { text: showMixed(r) }
    }
    case '4.07 reciprocal': {
      const t = term(page.match(/reciprocal of (.+?) ?\?/)?.[1] ?? '')
      if (!t) return ctx.fail('cannot read the number'), null
      return { text: showImproper([t[1], t[0]]) }
    }
    // ---------------------------------------------------------------- 4.05, 4.08
    case '4.05 of': {
      const e = page.match(/Find \((\d+)\/(\d+)\) of (\$?)(\d+)(?: (kg|m|L))? ?\./)
      if (!e) return ctx.fail('cannot read the question'), null
      const v = (Number(e[4]) * Number(e[1])) / Number(e[2])
      if (!Number.isInteger(v)) ctx.fail('the answer is not a whole number')
      return e[3] ? { text: `$${v}` } : { v, unit: e[5] ?? '' }
    }
    case '4.05 story': {
      const T = Number(page.match(/(\d+) (students|games|pages)/)?.[1])
      const f = fracIn(page)!
      return { v: (T * f[0]) / f[1] }
    }
    case '4.08 hour': {
      const f = fracIn(page)!
      return { v: (60 * f[0]) / f[1] }
    }
    case '4.08 left': {
      const e = page.match(/had \$(\d+) and spent \((\d+)\/(\d+)\) of it/)
      if (!e) return ctx.fail('cannot read the question'), null
      const T = Number(e[1])
      return { text: `$${T - (T * Number(e[2])) / Number(e[3])}` }
    }
    case '4.08 reverse': {
      const e = page.match(/^\((\d+)\/(\d+)\) of a number is (\d+)/)
      if (!e) return ctx.fail('cannot read the question'), null
      const v = (Number(e[3]) * Number(e[2])) / Number(e[1])
      if (!Number.isInteger(v)) ctx.fail('the number is not whole')
      return { v }
    }
    // ---------------------------------------------------------------- 4.09: the nearest whole number, and it must be clear-cut
    case '4.09 estSum':
    case '4.09 estDiff':
    case '4.09 estTimes': {
      const r = evaluate(bigText)
      if (!r) return ctx.fail(`cannot work out "${bigText}"`), null
      const x = val(r)
      const v = Math.round(x)
      if (Math.abs(x - v) > 0.4) ctx.fail(`${dec(x)} is too near halfway for "closest whole number"`)
      return { v }
    }
    // ---------------------------------------------------------------- 4.10
    case '4.10 toFrac': {
      const p = page.match(/Write (\d+(?:\.\d+)?) ?% as a fraction/)?.[1]
      if (!p) return ctx.fail('cannot read the percentage'), null
      const r = div(term(p)!, [100, 1])
      return { text: showMixed(r) }
    }
    case '4.10 toPct': {
      const s = page.match(/Write (.+?) as a percentage/)?.[1] ?? ''
      const t = term(s.trim())
      if (!t) return ctx.fail(`cannot read "${s}"`), null
      return { text: `${dec(val(t) * 100)}%` }
    }
    case '4.10 toDec': {
      const p = page.match(/Write (\d+) ?% as a decimal/)?.[1]
      return { text: dec(Number(p) / 100) }
    }
    case '4.10 order':
      return extreme()
    // ---------------------------------------------------------------- 4.11
    case '4.11 pctOf': {
      const e = page.match(/Find (\d+) ?% of (\$?)(\d+)/)
      if (!e) return ctx.fail('cannot read the question'), null
      const v = (Number(e[3]) * Number(e[1])) / 100
      if (!Number.isInteger(v)) ctx.fail('the answer is not a whole number')
      return e[2] ? { text: `$${v}` } : { v }
    }
    case '4.11 story': {
      let e = page.match(/A \$(\d+) jacket has (\d+)% off/)
      if (e) return { text: `$${(Number(e[1]) * Number(e[2])) / 100}` }
      e = page.match(/Of the (\d+) students in Year 7, (\d+)% catch a bus/)
      if (e) return { v: (Number(e[1]) * Number(e[2])) / 100 }
      e = page.match(/A (\d+) g bag of trail mix is (\d+)% nuts/)
      if (e) return { v: (Number(e[1]) * Number(e[2])) / 100, unit: 'g' }
      ctx.fail('cannot read the question')
      return null
    }
    case '4.11 tenPct': {
      const e = page.match(/10% of a number is (\d+) ?\. What is (\d+) ?% of the number/)
      if (!e) return ctx.fail('cannot read the question'), null
      const whole = Number(e[1]) * 10
      return { v: (whole * Number(e[2])) / 100 }
    }
    // ---------------------------------------------------------------- 4.12
    case '4.12 asPct': {
      const e = page.match(/scored (\d+) out of (\d+)/)
      if (!e) return ctx.fail('cannot read the score'), null
      return { text: `${dec((Number(e[1]) / Number(e[2])) * 100)}%` }
    }
    case '4.12 asFrac': {
      const e = page.match(/What fraction of (an? \w+) is (\d+) (\w+) ?\?/)
      const unit = e && WHOLE[e[1]]
      if (!e || !unit || unit[0] !== e[3]) return ctx.fail('cannot read the units'), null
      return { text: showMixed([Number(e[2]), unit[1]]) }
    }
    case '4.12 pctUnits': {
      const e = page.match(/What percentage of (\$)?(\d+) ?(m|km|kg|L|h)? is (\d+) (cm|m|g|mL|min|cents) ?\?/)
      const big = e && SMALLER[e[1] ?? e[3]]
      if (!e || !big || big[0] !== e[5]) return ctx.fail('cannot read the units'), null
      return { text: `${dec((Number(e[4]) / (Number(e[2]) * big[1])) * 100)}%` }
    }
  }
  ctx.fail('no independent check for this kind of question')
  return null
}
