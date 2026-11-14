// Independent answers for the NCM 9 Chapter 3 (Numeracy and calculation) class games, used by tests/games.test.ts.
// Reused kinds (meta.reused) are checked by their own chapters, so only the new kinds are here.
//  - recurring decimals are read from the page's dot notation (the digits from the first dotted digit to the last
//    repeat) and turned into an exact fraction here: 0.ab(cd) = (abcd − ab) / (10² × 99); the right option must be that
//    fraction in simplest form, and the only option equal to it;
//  - money, percentages, years and metres are worked from the numbers in the question; exactly one option must have
//    the value, and the explanation must reach it.
import type { GameQuestion, GameSet } from '../../src/lib/game/types'
import type { Ctx, Expect } from './ncm7-ch1'

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
const close = (a: number, b: number) => Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(a))
const n = (s: string) => Number(s.replace(/[\s ,]/g, ''))

/** the dot-notation decimal in the prompt as [numerator, denominator] in lowest terms */
function readRecurring(html: string): [number, number] {
  const big = html.match(/<div class="big">(.*?)<\/div>/)![1]
  const m = big.match(/^0\.(\d*)<span class="rec">(\d)<\/span>(?:(\d*)<span class="rec">(\d)<\/span>)?$/)
  if (!m) throw new Error(`not a recurring decimal: ${big}`)
  const pre = m[1]
  const rep = m[2] + (m[4] !== undefined ? (m[3] ?? '') + m[4] : '')
  const num = Number(pre + rep) - Number(pre || '0')
  const den = 10 ** pre.length * (10 ** rep.length - 1)
  const g = gcd(num, den)
  return [num / g, den / g]
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
  if (want && 'text' in want) {
    const why = ctx.plain(q.why).replace(/\s/g, '')
    const w = want.text.replace(/\s/g, '').replace(/^\((\d+)\/(\d+)\)$/, '$1/$2').replace(/years$/, '')
    if (!why.includes(w)) ctx.fail(`the explanation does not reach ${want.text}`)
  }
  return want
}

function solve(kind: string, q: GameQuestion, ctx: Ctx): Expect {
  const words = ctx.plain(q.prompt).replace(/\s+([.?,)])/g, '$1')
  const shown = q.options.map(ctx.plain)
  const one = (v: number, read: (o: string) => number | null, what: string): Expect => {
    const vals = shown.map(read)
    if (vals.some((x) => x === null)) ctx.fail(`an option cannot be read as ${what}`)
    const hits = vals.map((x, i) => (x !== null && close(x, v) ? i : -1)).filter((i) => i >= 0)
    if (hits.length !== 1) ctx.fail(`${hits.length} options equal ${v} (${what})`)
    return hits.length ? { text: shown[hits[0]] } : null
  }
  const money = (o: string) => {
    const m = o.match(/^\$([\d\s ,]+(?:\.\d\d)?)$/)
    return m ? n(m[1]) : null
  }
  const unit = (u: string) => (o: string) => {
    const m = o.match(new RegExp(`^([\\d.\\s\\u00a0]+)${u}$`))
    return m ? n(m[1]) : null
  }
  const dollars = [...words.matchAll(/\$([\d ,]+(?:\.\d+)?)/g)].map((m) => n(m[1]))
  switch (kind) {
    case '3.01 toFrac': {
      const [a, c] = readRecurring(q.prompt)
      const hits = shown.filter((o) => {
        const m = o.match(/^\((\d+)\/(\d+)\)$/)
        return !!m && Number(m[1]) * c === Number(m[2]) * a
      })
      if (hits.length !== 1) ctx.fail(`${hits.length} options equal ${a}/${c}`)
      if (hits[0] && hits[0] !== `(${a}/${c})`) ctx.fail('the right option is not in simplest form')
      return { text: `(${a}/${c})` }
    }
    case '3.02 over100': {
      const m = words.match(/is now (\d+)% of what it was a year ago\. A year ago it was ([\d ]+)( kg)?\./)!
      const v = (n(m[2]) * Number(m[1])) / 100
      return one(v, m[3] ? unit(' kg') : unit(''), m[3] ? 'kg' : 'a number')
    }
    case '3.03 costs': {
      const [buy, extra, sell] = dollars
      const cost = buy + extra
      return one(((sell - cost) / cost) * 100, unit('%'), 'a percentage')
    }
    case '3.04 months': {
      const [P] = dollars
      const r = Number(words.match(/at (\d+)% p\.a\./)![1])
      const m = Number(words.match(/for (\d+) months/)![1])
      return one((P * r * m) / 1200, money, 'money')
    }
    case '3.04 time': {
      const [P, I] = dollars
      const r = Number(words.match(/at (\d+)% p\.a\./)![1])
      return one(I / ((P * r) / 100), unit(' years'), 'years')
    }
    case '3.06 reaction': {
      const m = words.match(/travels at (\d+) km\/h\. How far does it go during a reaction time of ([\d.]+) s\?/)!
      const ms = (Number(m[1]) * 1000) / 3600
      return one(ms * Number(m[2]), unit(' m'), 'metres')
    }
  }
  ctx.fail('no independent check for this kind of question')
  return null
}
