// Independent answers for the Chapter 3 (Whole numbers) class games, used by tests/games.test.ts.
// Each answer is worked out here from scratch with plain arithmetic: rounding with Math.round, divisibility with %,
// primes by trial division, roots by checking squares and cubes, Roman numerals by this file's own converter.
import type { GameQuestion, GameSet } from '../../src/lib/game/types'
import type { Ctx, Expect } from './ncm7-ch1'

const gcd = (a: number, c: number): number => (c === 0 ? a : gcd(c, a % c))
const prime = (n: number) => n > 1 && [...Array(Math.floor(Math.sqrt(n)) + 1).keys()].slice(2).every((k) => n % k !== 0)
const grouped = (x: number) => (String(x).length >= 5 ? String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : String(x))
/** Roman numeral to number, read right to left: a smaller numeral before a larger one is subtracted */
function fromRoman(s: string): number {
  const v: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }
  let total = 0
  let prev = 0
  for (const ch of s.split('').reverse()) {
    const x = v[ch]
    total += x < prev ? -x : x
    prev = Math.max(prev, x)
  }
  return total
}
/** the value of a product of prime powers written like "2^3 × 3" (after plain()) */
const productValue = (s: string) =>
  s
    .split('×')
    .map((p) => p.trim())
    .reduce((t, p) => {
      const [b, e] = p.split('^').map(Number)
      return t * b ** (e || 1)
    }, 1)
const allPrime = (s: string) => s.split('×').every((p) => prime(Number(p.trim().split('^')[0])))

export function rework(set: GameSet, q: GameQuestion, ctx: Ctx): Expect {
  const m = q.meta as Record<string, any>
  const has = (...xs: (string | number)[]) => xs.forEach((x) => !ctx.page.includes(typeof x === 'number' ? grouped(x) : x) && ctx.fail(`"${x}" is not on the page`))
  switch (`${set.exercise} ${m.t}`) {
    case '3.01 round':
      has(m.x)
      return { v: Math.round(m.x / m.p) * m.p }
    case '3.01 estimate':
      has(m.a, m.c)
      return { v: Math.round(m.a / 10) * 10 * (Math.round(m.c / 10) * 10) }
    case '3.01 sum':
      for (const x of m.xs) has(x)
      return { v: m.xs.reduce((t: number, x: number) => t + Math.round(x / 100) * 100, 0) }
    case '3.02 times4':
    case '3.02 times5':
    case '3.02 times9':
      has(m.n)
      return { v: m.n * m.k }
    case '3.02 story':
      has(`$${m.each}`, String(m.count))
      return { text: `$${grouped(m.each * m.count)}` }
    case '3.03 by4':
    case '3.03 by5':
    case '3.03 tens':
    case '3.05 longDiv':
      has(m.n)
      if (m.n % m.d !== 0) ctx.fail('does not divide exactly')
      return { v: m.n / m.d }
    case '3.03 boxes':
      has(m.n, String(m.size))
      return { v: Math.floor(m.n / m.size) }
    case '3.04 divisible': {
      const ok = q.options.filter((o) => Number(ctx.plain(o).replace(/ /g, '')) % m.d === 0)
      if (ok.length !== 1) ctx.fail(`${ok.length} options are divisible by ${m.d}`)
      return { text: ctx.plain(ok[0] ?? '') }
    }
    case '3.04 digitSum':
      has(m.x)
      return { v: String(m.x).split('').reduce((t, c) => t + Number(c), 0) }
    case '3.05 remainder':
      has(m.n, String(m.d))
      return { v: m.n % m.d }
    case '3.06 read': {
      const r = ctx.page.match(/What number is\s*([IVXLCDM]+)\s*\?/)?.[1] ?? ''
      return { v: fromRoman(r) }
    }
    case '3.06 write': {
      has(String(m.n))
      // the only option that reads back as the number, written the standard way (no four of a kind)
      const ok = q.options.map(ctx.plain).filter((o) => fromRoman(o) === m.n && !/IIII|XXXX|CCCC|VV|LL/.test(o))
      if (ok.length !== 1) ctx.fail(`${ok.length} options are ${m.n} in standard form`)
      return { text: ok[0] ?? '' }
    }
    case '3.07 evaluate':
      return { v: m.base ** m.e }
    case '3.07 write':
      return { text: `${m.base}^${m.e}` }
    case '3.07 parts':
      return { v: m.askBase ? m.base : m.e }
    case '3.08 sqrt': {
      has(`√${m.sq}`)
      const r = Math.round(Math.sqrt(m.sq))
      if (r * r !== m.sq) ctx.fail('not a perfect square')
      return { v: r }
    }
    case '3.08 cbrt': {
      const r = Math.round(Math.cbrt(m.c))
      if (r ** 3 !== m.c) ctx.fail('not a perfect cube')
      return { v: r }
    }
    case '3.08 between': {
      let lo = 0
      while ((lo + 1) * (lo + 1) <= m.x) lo++
      return { text: `${lo} and ${lo + 1}` }
    }
    case '3.08 isSquare': {
      const ok = q.options.map(ctx.plain).filter((o) => Number.isInteger(Math.sqrt(Number(o))))
      if (ok.length !== 1) ctx.fail(`${ok.length} square numbers among the options`)
      return { text: ok[0] ?? '' }
    }
    case '3.09 prime': {
      const ok = q.options.map(ctx.plain).filter((o) => prime(Number(o)))
      if (ok.length !== 1) ctx.fail(`${ok.length} primes among the options`)
      return { text: ok[0] ?? '' }
    }
    case '3.09 factors': {
      has(String(m.n))
      let count = 0
      for (let k = 1; k <= m.n; k++) if (m.n % k === 0) count++
      return { v: count }
    }
    case '3.09 composite': {
      const ok = q.options.map(ctx.plain).filter((o) => !prime(Number(o)) && Number(o) > 1)
      if (ok.length !== 1) ctx.fail(`${ok.length} composites among the options`)
      return { text: ok[0] ?? '' }
    }
    case '3.09 one':
      return { text: 'Neither prime nor composite' }
    case '3.10 form': {
      const ok = q.options.map(ctx.plain).filter((o) => allPrime(o) && productValue(o) === m.n)
      if (ok.length !== 1) ctx.fail(`${ok.length} options are prime factorisations of ${m.n}`)
      return { text: ok[0] ?? '' }
    }
    case '3.10 value':
      return { v: (m.ps as number[]).reduce((t, x) => t * x, 1) }
    case '3.11 common':
    case '3.12 multiple': {
      // worked from the words: the numbers in the question and each option
      const w = ctx.plain(q.prompt)
      const shown = q.options.map((o) => Number(ctx.plain(o).replace(/\s/g, '')))
      let ok: boolean[]
      if (m.t === 'common') {
        const [, a, b] = w.match(/common factor of (\d+) and (\d+)\?/)!.map(Number)
        ok = shown.map((x) => a % x === 0 && b % x === 0)
      } else {
        const n = Number(w.match(/a multiple of (\d+)\?/)![1])
        ok = shown.map((x) => (x % n === 0) !== /NOT/.test(w))
      }
      const hits = ok.filter(Boolean).length
      if (hits !== 1) ctx.fail(`${hits} options are right`)
      return { v: shown[ok.indexOf(true)] }
    }
    case '3.11 hcf':
      has(String(m.a), String(m.c))
      return { v: gcd(m.a, m.c) }
    case '3.12 lcm':
      has(String(m.a), String(m.c))
      return { v: (m.a * m.c) / gcd(m.a, m.c) }
  }
  ctx.fail('no independent check for this kind of question')
  return null
}
