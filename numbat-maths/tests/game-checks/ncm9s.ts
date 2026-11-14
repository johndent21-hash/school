// Independent answers for the new kinds in the NCM 9 Standard class games (src/content/games/ncm9s.ts), used by
// tests/games.test.ts. Reused kinds (meta.reused) are checked by the chapter that first made them.
// Every answer is worked out from the numbers in the question (Euler's formula, pay, tax, measurement error, interval
// length and midpoint, direct variation, parabolas, multistage probability), and exactly one option must have that
// value; probabilities must be in simplest form.
import type { GameQuestion, GameSet } from '../../src/lib/game/types'
import type { Ctx, Expect } from './ncm7-ch1'

const close = (a: number, b: number) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b))
const n = (s: string) => Number(s.replace(/[\s ,$]/g, '').replace(/−/g, '-'))
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))

export function rework(set: GameSet, q: GameQuestion, ctx: Ctx): Expect {
  try {
    return solve(String(q.meta.t), q, ctx)
  } catch (e) {
    ctx.fail(`could not be read: ${(e as Error).message}`)
    return null
  }
}

function solve(t: string, q: GameQuestion, ctx: Ctx): Expect {
  const w = ctx.plain(q.prompt).replace(/\s+([.?,):])/g, '$1').replace(/\(\s+/g, '(')
  const shown = q.options.map(ctx.plain)
  /** exactly one option has value v when read with `read` */
  const one = (v: number, read: (o: string) => number | null, what: string): Expect => {
    const hits = shown.filter((o) => {
      const x = read(o)
      return x !== null && close(x, v)
    })
    if (hits.length !== 1) ctx.fail(`${hits.length} options equal ${v} (${what})`)
    return hits.length ? { text: hits[0] } : null
  }
  const money = (o: string) => (/^\$[\d\s ,]+(\.\d\d)?$/.test(o) ? n(o) : null)
  const unit = (u: string) => (o: string) => {
    const m = o.match(new RegExp(`^(−?[\\d.\\s\\u00a0]+)${u}$`))
    return m ? n(m[1]) : null
  }
  const dollars = [...w.matchAll(/\$([\d ,]+(?:\.\d+)?)/g)].map((m) => n(m[1]))
  const pt = (s: string) => s.match(/\((−?\d+(?:\.\d+)?), (−?\d+(?:\.\d+)?)\)/g)!.map((p) => p.slice(1, -1).split(', ').map(n))
  const prob = (num: number, den: number): Expect => {
    const g = gcd(num, den)
    const want = num === den ? '1' : `(${num / g}/${den / g})`
    const hits = shown.filter((o) => {
      const m = o.match(/^\((\d+)\/(\d+)\)$/)
      return m ? Number(m[1]) * den === Number(m[2]) * num : o === '1' ? num === den : false
    })
    if (hits.length !== 1) ctx.fail(`${hits.length} options equal ${num}/${den}`)
    return { text: want }
  }
  switch (t) {
    case 'euler': {
      const V = w.match(/(\d+) vertices/)?.[1]
      const E = w.match(/(\d+) edges/)?.[1]
      const Fc = w.match(/(\d+) faces/)?.[1]
      // V − E + F = 2
      const v = /How many faces/.test(w) ? 2 - n(V!) + n(E!) : /How many edges/.test(w) ? n(V!) + n(Fc!) - 2 : 2 + n(E!) - n(Fc!)
      return { v }
    }
    case 'wage': {
      const h = n(w.match(/for (\d+) hours/)![1])
      return one(dollars[0] * h, money, 'money')
    }
    case 'salary': {
      const weekly = dollars[0] / 52
      return one(/fortnightly/.test(w) ? weekly * 2 : weekly, money, 'money')
    }
    case 'overtime': {
      const m = w.match(/for (\d+) normal hours and (\d+) hours at (double time|time-and-a-half)/)!
      const r = dollars[0]
      return one(n(m[1]) * r + n(m[2]) * r * (m[3] === 'double time' ? 2 : 1.5), money, 'money')
    }
    case 'commission': {
      const p = n(w.match(/(\d+)% commission/)![1])
      const retainer = /retainer/.test(w) ? dollars[0] : 0
      const sales = dollars[dollars.length - 1]
      return one(retainer + (sales * p) / 100, money, 'money')
    }
    case 'piece': {
      const count = n(w.match(/pay for (\d+)\?/)![1])
      return one(dollars[0] * count, money, 'money')
    }
    case 'leave':
      return one((4 * dollars[0] * 17.5) / 100, money, 'money')
    case 'tax': {
      const c = n(w.match(/(\d+)c is paid for each \$1 over/)![1])
      const [free, income] = [dollars[0], dollars[dollars.length - 1]]
      return one(Math.max(0, income - free) * (c / 100), money, 'money')
    }
    case 'net': {
      const [gross, tax, other] = dollars
      return one(gross - tax - other, money, 'money')
    }
    case 'abs': {
      const m = w.match(/A measurement is ([\d.]+) (\w+), to the nearest (?:([\d.]+) )?(\w+)\./)!
      const step = m[3] ? Number(m[3]) : 1
      const half = step / 2
      if (/What is the absolute error/.test(w)) return one(half, unit(` ${m[2]}`), 'a length')
      const x = Number(m[1])
      const hits = shown.filter((o) => {
        const r = o.match(/^([\d.]+) \w+ to ([\d.]+) \w+$/)
        return !!r && close(Number(r[1]), x - half) && close(Number(r[2]), x + half)
      })
      if (hits.length !== 1) ctx.fail(`${hits.length} options give the limits`)
      return hits.length ? { text: hits[0] } : null
    }
    case 'pct': {
      const m = w.match(/measured as (\d+) (\w+), to the nearest \2\./)!
      return one((0.5 / Number(m[1])) * 100, unit('%'), 'a percentage')
    }
    case 'length': {
      const [[x1, y1], [x2, y2]] = pt(w)
      return { v: Math.hypot(x2 - x1, y2 - y1) }
    }
    case 'midpoint': {
      const [[x1, y1], [x2, y2]] = pt(w)
      const f = (v: number) => (v < 0 ? `−${-v}` : String(v))
      return { text: `(${f((x1 + x2) / 2)}, ${f((y1 + y2) / 2)})` }
    }
    case 'direct': {
      const m = w.match(/= (\d+) when \w = (\d+)\. Find \w when \w = (\d+)\./)!
      return { v: (Number(m[1]) / Number(m[2])) * Number(m[3]) }
    }
    case 'parabola': {
      const m = w.replace(/\s/g, '').match(/y=(−?\d*)x\^2([+−]\d+)?/)!
      const a = m[1] === '' ? 1 : m[1] === '−' ? -1 : n(m[1])
      const c = m[2] ? n(m[2].replace('+', '')) : 0
      const f = (v: number) => (v < 0 ? `−${-v}` : String(v))
      if (/turning point/.test(w)) return { text: `(0, ${f(c)})` }
      const x = n(w.replace(/\s/g, '').match(/whenx=(−?\d+)\?/)![1])
      return { text: f(a * x * x + c) }
    }
    case 'apply': {
      const m = w.replace(/\s/g, '').match(/h=(\d+)t−5t\^2.*after(\d+)s\?/)!
      const [v, s] = [Number(m[1]), Number(m[2])]
      return one(v * s - 5 * s * s, unit(' m'), 'metres')
    }
    case 'outcomes': {
      const stages: Record<string, number> = { coin: 2, die: 6, dice: 6, coins: 2 }
      const parts = w.match(/when (.+)\?/)![1]
      let total = 1
      for (const m of parts.matchAll(/(a|two|three) (coin|die|dice|coins|spinner with (\d+) equal sectors)/g)) {
        const count = m[1] === 'two' ? 2 : m[1] === 'three' ? 3 : 1
        const each = m[3] ? Number(m[3]) : stages[m[2]]
        total *= each ** count
      }
      return { v: total }
    }
    case 'tree': {
      let m = w.match(/has (\d+) red and (\d+) blue marbles\. One is drawn, replaced, and a second is drawn\. What is the probability that both are red\?/)
      if (m) {
        const [r, bl] = [Number(m[1]), Number(m[2])]
        return prob(r * r, (r + bl) * (r + bl))
      }
      // the sample space listed in full
      const coins = w.match(/(Two|Three) fair coins/)
      if (coins) {
        const k = coins[1] === 'Two' ? 2 : 3
        const all = Array.from({ length: 2 ** k }, (_, i) => Array.from({ length: k }, (_, j) => ((i >> j) & 1 ? 'H' : 'T')))
        const fav = /two heads/.test(w) ? all.filter((o) => o.every((x) => x === 'H')).length : /at least one head/.test(w) ? all.filter((o) => o.includes('H')).length : all.filter((o) => o.every((x) => x === 'T')).length
        return prob(fav, all.length)
      }
      if (/coin is tossed and a fair die/.test(w)) return prob(1, 12)
      m = w.match(/Two fair dice.*double six/)
      if (m) return prob(1, 36)
      throw new Error('unknown tree question')
    }
  }
  ctx.fail('no independent check for this kind of question')
  return null
}
