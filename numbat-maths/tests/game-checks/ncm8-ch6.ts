// Independent answers for the NCM 8 Chapter 6 (Fractions and percentages) class games, used by tests/games.test.ts.
// Kinds reused from NCM 7 Chapter 4 (meta.reused) are checked by that chapter's checks, so only the new kinds are here.
// Every answer is worked out from the amounts and percentages in the question, in exact arithmetic (percentages such
// as 33⅓% are kept as fractions), and then exactly one option must have that value: money must be written as whole
// dollars or with two decimal places, and the explanation must reach the answer.
import type { GameQuestion, GameSet } from '../../src/lib/game/types'
import type { Ctx, Expect } from './ncm7-ch1'

/** an exact fraction n/d (d > 0), kept in lowest terms */
type Q = [bigint, bigint]
const g = (a: bigint, b: bigint): bigint => (b === 0n ? (a < 0n ? -a : a) : g(b, a % b))
const Qn = (n: bigint, d = 1n): Q => {
  if (d < 0n) [n, d] = [-n, -d]
  const k = g(n, d) || 1n
  return [n / k, d / k]
}
const add = (a: Q, b: Q) => Qn(a[0] * b[1] + b[0] * a[1], a[1] * b[1])
const sub = (a: Q, b: Q) => add(a, [-b[0], b[1]])
const mul = (a: Q, b: Q) => Qn(a[0] * b[0], a[1] * b[1])
const div = (a: Q, b: Q) => Qn(a[0] * b[1], a[1] * b[0])
const eq = (a: Q, b: Q) => a[0] === b[0] && a[1] === b[1]
const HUNDRED: Q = [100n, 1n]

/** "1 200.50", "12½", "33⅓" → an exact fraction */
function dec(s: string): Q {
  s = s.replace(/[\s ]/g, '')
  const tail: Record<string, Q> = { '½': [1n, 2n], '⅓': [1n, 3n], '⅔': [2n, 3n] }
  let extra: Q = [0n, 1n]
  const last = s.slice(-1)
  if (tail[last]) {
    extra = tail[last]
    s = s.slice(0, -1)
  }
  const m = s.match(/^(\d*)(?:\.(\d+))?$/)
  if (!m) throw new Error(`not a number: "${s}"`)
  const whole = BigInt(m[1] || '0')
  const frac = m[2] ? Qn(BigInt(m[2]), 10n ** BigInt(m[2].length)) : ([0n, 1n] as Q)
  return add(add([whole, 1n], frac), extra)
}
const NUM = '(\\d{1,3}(?:[ \\u00a0]\\d{3})+|\\d+)(?:\\.(\\d+))?'
const money = (s: string): Q[] => [...s.matchAll(new RegExp(`\\$${NUM}`, 'g'))].map((m) => dec(m[1] + (m[2] ? '.' + m[2] : '')))
const pcts = (s: string): Q[] => [...s.matchAll(/(\d+(?:\.\d+)?[½⅓⅔]?)%/g)].map((m) => dec(m[1]))

/** the value an option shows, and whether it is written properly */
function optionValue(o: string): { v: Q; kind: string; ok: boolean } | null {
  let m = o.match(new RegExp(`^\\$${NUM}$`))
  if (m) return { v: dec(m[1] + (m[2] ? '.' + m[2] : '')), kind: 'money', ok: !m[2] || m[2].length === 2 }
  m = o.match(/^(\d+(?:\.\d+)?[½⅓⅔]?)%( p\.a\.)?$/)
  if (m) return { v: dec(m[1]), kind: m[2] ? 'pa' : 'pct', ok: true }
  m = o.match(/^× (\d+(?:\.\d+)?)$/)
  if (m) return { v: dec(m[1]), kind: 'times', ok: true }
  m = o.match(/^\((\d+)\/(\d+)\)$/)
  if (m) return { v: Qn(BigInt(m[1]), BigInt(m[2])), kind: 'frac', ok: true }
  m = o.match(new RegExp(`^${NUM}$`))
  if (m) return { v: dec(m[1] + (m[2] ? '.' + m[2] : '')), kind: 'num', ok: true }
  return null
}

const KEY: [RegExp, string][] = [[/what does n stand for\?/, 'the number of time periods (years)']]

export function rework(set: GameSet, q: GameQuestion, ctx: Ctx): Expect {
  const kind = `${set.exercise} ${q.meta.t}`
  let want: Expect = null
  try {
    want = solve(kind, q, ctx)
  } catch (e) {
    ctx.fail(`could not be read: ${(e as Error).message}`)
    return null
  }
  if (want && 'text' in want && kind !== '6.11 formula') {
    const why = ctx.plain(q.why).replace(/\s/g, '')
    // the value itself: "profit of $40" → "$40", "× 1.15" → "1.15", "8% p.a." → "8%"
    const w = want.text.replace(/^(profit|loss) of |^× | p\.a\.$/g, '').replace(/\s/g, '').replace(/^\((\d+)\/(\d+)\)$/, '$1/$2')
    if (!why.includes(w)) ctx.fail(`the explanation does not reach ${want.text}`)
  }
  return want
}

function solve(kind: string, q: GameQuestion, ctx: Ctx): Expect {
  const words = ctx.plain(q.prompt).replace(/\s+([.?,)])/g, '$1')
  const shown = q.options.map(ctx.plain)
  /** exactly one option has the value v (of the expected kind) */
  const one = (v: Q, want: string): Expect => {
    const vals = shown.map(optionValue)
    vals.forEach((x, i) => {
      if (!x) ctx.fail(`the option "${shown[i]}" cannot be read`)
      else if (!x.ok) ctx.fail(`the option "${shown[i]}" is not written properly`)
    })
    if (vals.some((x) => x && x.kind !== want)) ctx.fail(`the options are not all ${want}`)
    const hits = vals.map((x, i) => (x && eq(x.v, v) ? i : -1)).filter((i) => i >= 0)
    if (hits.length !== 1) ctx.fail(`${hits.length} options equal ${v[0]}/${v[1]}`)
    return hits.length ? { text: shown[hits[0]] } : null
  }
  const $ = money(words)
  const P = pcts(words)
  const plainNums = () => [...words.replace(/\$[\d\s .]+/g, '').matchAll(new RegExp(`(?<![\\d.])${NUM}(?![\\d%½⅓⅔]|\\.\\d)`, 'g'))].map((m) => dec(m[1] + (m[2] ? '.' + m[2] : '')))
  const ofPct = (x: Q, p: Q) => div(mul(x, p), HUNDRED)

  switch (kind) {
    case '6.04 special': {
      if (/as a fraction in simplest form/.test(words)) {
        const v = div(P[0], HUNDRED)
        return { text: `(${v[0]}/${v[1]})` }
      }
      const m = words.match(/Write \((\d+)\/(\d+)\) as a percentage/)!
      return one(mul(Qn(BigInt(m[1]), BigInt(m[2])), HUNDRED), 'pct')
    }
    case '6.07 increase':
    case '6.07 markup':
      return one(add($[0], ofPct($[0], P[0])), 'money')
    case '6.07 decrease':
    case '6.12 decrease':
      return one(sub($[0], ofPct($[0], P[0])), 'money')
    case '6.07 multiplier': {
      const up = /increases an amount/.test(words)
      if (!up && !/decreases an amount/.test(words)) throw new Error('no direction')
      const r = div(P[0], HUNDRED)
      return one(up ? add([1n, 1n], r) : sub([1n, 1n], r), 'times')
    }
    case '6.08 mental': {
      const x = $.length ? $[0] : plainNums()[0]
      return one(ofPct(x, P[0]), $.length ? 'money' : 'num')
    }
    case '6.09 onePct': {
      const part = plainNums()[0]
      if (!/What is 1% of the amount\?/.test(words)) throw new Error('not asking for 1%')
      return one(div(part, P[0]), 'num')
    }
    case '6.09 whole':
    case '6.09 story':
    case '6.12 whole': {
      const part = $.length ? $[0] : plainNums()[0]
      return one(div(mul(part, HUNDRED), P[0]), $.length ? 'money' : 'num')
    }
    case '6.09 after': {
      // the sale price is (100 − p)% of the original
      return one(div(mul($[0], HUNDRED), sub(HUNDRED, P[0])), 'money')
    }
    case '6.10 profit': {
      const [cost, sell] = $
      const diff = sub(sell, cost)
      const word = diff[0] > 0n ? 'profit' : 'loss'
      const amt = diff[0] < 0n ? Qn(-diff[0], diff[1]) : diff
      const hits = shown.filter((o) => o.startsWith(word + ' of ') && (() => {
        const v = optionValue(o.slice(word.length + 4))
        return v && v.ok && eq(v.v, amt)
      })())
      if (hits.length !== 1) ctx.fail(`${hits.length} options say ${word} of ${amt[0]}/${amt[1]}`)
      return hits.length ? { text: hits[0] } : null
    }
    case '6.10 pct': {
      const [cost, sell] = $
      const diff = sub(sell, cost)
      const wantWord = diff[0] > 0n ? 'profit' : 'loss'
      if (!words.includes(`What is the ${wantWord} as a percentage of the cost price`)) ctx.fail(`asks for the wrong one of profit and loss`)
      const amt: Q = diff[0] < 0n ? [-diff[0], diff[1]] : diff
      return one(mul(div(amt, cost), HUNDRED), 'pct')
    }
    case '6.10 gstAdd':
      if (!/plus GST \(10%\)/.test(words)) throw new Error('GST not stated')
      return one(mul($[0], Qn(11n, 10n)), 'money')
    case '6.10 gstIn':
      // the price is 110% of the price before GST, so GST is 1/11 of it
      return one(div($[0], [11n, 1n]), 'money')
    case '6.11 interest':
    case '6.11 total': {
      const n = BigInt(words.match(/for (\d+) years/)![1])
      const I = mul(ofPct($[0], P[0]), [n, 1n])
      return one(kind === '6.11 total' ? add($[0], I) : I, 'money')
    }
    case '6.11 rate': {
      const [Pr, I] = $
      const n = BigInt(words.match(/in (\d+) years/)![1])
      return one(div(mul(I, HUNDRED), mul(Pr, [n, 1n])), 'pa')
    }
    case '6.11 formula': {
      const k = KEY.find(([re]) => re.test(words))?.[1]
      if (!k) throw new Error('not in the key')
      return { text: k }
    }
    case '6.12 rest': {
      const total = plainNums()[0]
      return one(ofPct(total, sub(HUNDRED, P[0])), 'num')
    }
  }
  ctx.fail('no independent check for this kind of question')
  return null
}
