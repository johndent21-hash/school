// Independent answers for the Chapter 11 (Probability) class games, used by tests/games.test.ts.
// Spinners are measured (every sector must be the same size) and their letters counted; die events, word events and
// complements are read with this file's own rules and counted over the outcomes 1 to 6; probabilities are written in
// simplest form here and compared with the marked choice.
import type { GameQuestion, GameSet } from '../../src/lib/game/types'
import type { Ctx, Expect } from './ncm7-ch1'

const gcd = (a: number, c: number): number => (c === 0 ? a : gcd(c, a % c))
const prob = (n: number, d: number) => (n === 0 ? '0' : n === d ? '1' : `(${n / gcd(n, d)}/${d / gcd(n, d)})`)
const DIE = [1, 2, 3, 4, 5, 6]

/** a spinner's letters, after checking that every sector has the same angle */
function spinnerLetters(svg: string, ctx: Ctx): string[] {
  const sectors = [...svg.matchAll(/<path class="sector[^"]*" d="M([\d.]+),([\d.]+) L([\d.]+),([\d.]+) A[\d.]+,[\d.]+ 0 0 1 ([\d.]+),([\d.]+) Z"/g)].map((m) => {
    const [cx, cy, x1, y1, x2, y2] = m.slice(1).map(Number)
    let a = (Math.atan2(y2 - cy, x2 - cx) - Math.atan2(y1 - cy, x1 - cx)) * (180 / Math.PI)
    a = ((a % 360) + 360) % 360
    return a
  })
  const letters = [...svg.matchAll(/<text class="dl spin"[^>]*>(.*?)<\/text>/g)].map((m) => m[1])
  if (sectors.length !== letters.length) ctx.fail(`${sectors.length} sectors but ${letters.length} letters`)
  if (sectors.some((a) => Math.abs(a - 360 / sectors.length) > 0.2)) ctx.fail('the sectors are not equal')
  return letters
}
/** this file's reading of a die event */
function dieEvent(s: string): number[] {
  const rules: [RegExp, (m: RegExpMatchArray) => (x: number) => boolean][] = [
    [/^an even number$/, () => (x) => x % 2 === 0],
    [/^an odd number$/, () => (x) => x % 2 === 1],
    [/^a number greater than (\d)$/, (m) => (x) => x > Number(m[1])],
    [/^a number less than (\d)$/, (m) => (x) => x < Number(m[1])],
    [/^an? (\d)$/, (m) => (x) => x === Number(m[1])],
    [/^a prime number$/, () => (x) => x === 2 || x === 3 || x === 5],
    [/^a multiple of (\d)$/, (m) => (x) => x % Number(m[1]) === 0],
    [/^a factor of (\d+)$/, (m) => (x) => Number(m[1]) % x === 0],
    [/^a whole number$/, () => () => true],
    [/^a number from (\d) to (\d)$/, (m) => (x) => x >= Number(m[1]) && x <= Number(m[2])],
    [/^a (\d) or a (\d)$/, (m) => (x) => x === Number(m[1]) || x === Number(m[2])],
    [/^an? (\d), (\d) or (\d)$/, (m) => (x) => [m[1], m[2], m[3]].map(Number).includes(x)],
    [/^an? (\d) or (\d)$/, (m) => (x) => x === Number(m[1]) || x === Number(m[2])],
  ]
  for (const [re, make] of rules) {
    const m = s.match(re)
    if (m) return DIE.filter(make(m))
  }
  throw new Error(`no reading of "${s}"`)
}
/** a value written as a decimal, a percentage or a fraction "(n/d)" */
function valueOf(s: string): number {
  const t = s.replace('−', '-')
  let m = t.match(/^(-?[\d.]+)%$/)
  if (m) return Number(m[1]) / 100
  m = t.match(/^\((\d+)\/(\d+)\)$/)
  if (m) return Number(m[1]) / Number(m[2])
  return Number(t)
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
  if (want && 'text' in want && !['11.01 likely', '11.03 words', '11.03 cannot', '11.05 name'].includes(kind)) {
    if (!ctx.plain(q.why).replace(/\s/g, '').includes(want.text.replace(/\s/g, ''))) ctx.fail(`the explanation does not reach ${want.text}`)
  }
  return want
}

function solve(kind: string, q: GameQuestion, ctx: Ctx): Expect {
  const svg = q.diagram ?? ''
  const words = ctx.plain(q.prompt).replace(/\s+([.?,:)])/g, '$1')
  const shown = q.options.map(ctx.plain)
  const one = (ok: boolean[], what: string): Expect => {
    const hits = ok.map((x, k) => (x ? k : -1)).filter((k) => k >= 0)
    if (hits.length !== 1) ctx.fail(`${hits.length} options ${what}`)
    return hits.length ? { text: shown[hits[0]] } : null
  }

  switch (kind) {
    case '11.01 count':
      return { v: new Set(spinnerLetters(svg, ctx)).size }
    case '11.01 likely': {
      const l = spinnerLetters(svg, ctx)
      const counts = new Map<string, number>()
      l.forEach((x) => counts.set(x, (counts.get(x) ?? 0) + 1))
      const top = Math.max(...counts.values())
      const best = [...counts.keys()].filter((k) => counts.get(k) === top)
      return best.length === 1 ? { text: best[0] } : { text: 'All are equally likely' }
    }
    case '11.02 die': {
      const e = words.match(/probability of rolling (.+?)\?/)![1]
      return { text: prob(dieEvent(e).length, 6) }
    }
    case '11.02 bag': {
      const m = words.match(/A bag has (.+?) (marbles|counters|jelly beans)\. .+ that it is (\w+)\?/)!
      const parts = [...m[1].matchAll(/(\d+) (\w+)/g)].map((p) => ({ n: Number(p[1]), c: p[2] }))
      const total = parts.reduce((t, p) => t + p.n, 0)
      return { text: prob(parts.find((p) => p.c === m[3])!.n, total) }
    }
    case '11.02 or': {
      const c = Object.fromEntries([...words.matchAll(/(\d+) (red|green|yellow|blue)\b/g)].map((x) => [x[2], Number(x[1])])) as Record<string, number>
      const m = words.match(/that it is (\w+) or (\w+)\?/)!
      if (m[1] === m[2] || c[m[1]] === undefined || c[m[2]] === undefined) ctx.fail('the two colours are not both in the jar')
      return { text: prob(c[m[1]] + c[m[2]], Object.values(c).reduce((t, x) => t + x, 0)) }
    }
    case '11.02 tickets': {
      const m = words.match(/buys (\d+) tickets in a raffle that sells ([\d ]+) tickets.+wins the one prize\?/)!
      return { text: prob(Number(m[1]), Number(m[2].replace(/\s/g, ''))) }
    }
    case '11.02 spin': {
      const l = spinnerLetters(svg, ctx)
      const want = words.match(/spinning (\w)\?/)![1]
      return { text: prob(l.filter((x) => x === want).length, l.length) }
    }
    case '11.03 words': {
      let p: number
      if (/tossing a coin and getting a head/.test(words)) p = 1 / 2
      else {
        const m = words.match(/chance of rolling (.+?) on a standard die\?/)!
        p = dieEvent(m[1]).length / 6
      }
      return { text: p === 0 ? 'Impossible' : p < 0.5 ? 'Unlikely' : p === 0.5 ? 'Even chance' : p < 1 ? 'Likely' : 'Certain' }
    }
    case '11.03 cannot':
      return one(
        shown.map((o) => {
          const v = valueOf(o)
          return v < 0 || v > 1
        }),
        'are outside 0 to 1',
      )
    case '11.03 letter': {
      const m = words.match(/word ([A-Z]+) is chosen at random\. .+ that it is ([A-Z])\?/)!
      return { text: prob(m[1].split('').filter((x) => x === m[2]).length, m[1].length) }
    }
    case '11.04 expected': {
      let m = words.match(/die is rolled (\d+) times/)
      if (m) return { v: Number(m[1]) / 6 }
      m = words.match(/coin is tossed (\d+) times/)
      if (m) return { v: Number(m[1]) / 2 }
      m = words.match(/(\d+) equal sectors, one of them blue\. It is spun (\d+) times/)!
      return { v: Number(m[2]) / Number(m[1]) }
    }
    case '11.04 observed': {
      const m = words.match(/tossed (\d+) times and landed heads (\d+) times/)!
      return { text: prob(Number(m[2]), Number(m[1])) }
    }
    case '11.05 value': {
      let m = words.match(/is (\d+)%\. What/)
      if (m) return { text: `${100 - Number(m[1])}%` }
      m = words.match(/is (0\.\d+)\. What/)
      if (m) return { text: String(Math.round((1 - Number(m[1])) * 1000) / 1000) }
      m = words.match(/is \((\d+)\/(\d+)\)\. What/)!
      return { text: prob(Number(m[2]) - Number(m[1]), Number(m[2])) }
    }
    case '11.05 name': {
      const e = dieEvent(words.match(/complement of rolling (.+?) on a die\?/)![1])
      const comp = DIE.filter((x) => !e.includes(x))
      return one(
        shown.map((o) => {
          const s = dieEvent(o.replace(/^Rolling /, ''))
          return s.length === comp.length && s.every((x) => comp.includes(x))
        }),
        'are the complement',
      )
    }
  }
  ctx.fail('no independent check for this kind of question')
  return null
}
