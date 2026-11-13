// Independent answers for the Chapter 10 (Analysing data) class games, used by tests/games.test.ts.
// The data are read back off each drawing: column heights against the axis numbers, dots counted above each axis
// number, stem-and-leaf rows read leaf by leaf (and the key checked). Statistics are then worked out here from
// scratch. A "misleading graph" is examined for every flaw it has, and must have exactly one.
import type { GameQuestion, GameSet } from '../../src/lib/game/types'
import type { Ctx, Expect } from './ncm7-ch1'

const NUM = '(-?[\\d.]+)'
const texts = (svg: string) =>
  [...svg.matchAll(new RegExp(`<text class="([^"]*)" x="${NUM}" y="${NUM}"[^>]*>(.*?)</text>`, 'g'))].map((m) => ({
    cls: m[1],
    x: Number(m[2]),
    y: Number(m[3]),
    s: m[4].replace(/<[^>]*>/g, ''),
  }))
const sum = (xs: number[]) => xs.reduce((t, x) => t + x, 0)
const sorted = (xs: number[]) => xs.slice().sort((a, b) => a - b)
const median = (xs: number[]) => {
  const s = sorted(xs)
  const n = s.length
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2
}
function modes(xs: number[]): number[] {
  const c = new Map<number, number>()
  xs.forEach((x) => c.set(x, (c.get(x) ?? 0) + 1))
  const top = Math.max(...c.values())
  return [...c.keys()].filter((k) => c.get(k) === top)
}
const listIn = (s: string) => s.split(',').map((t) => Number(t.trim()))

/** a column graph: each category's value, from the top of its column measured against the axis numbers */
function columns(svg: string): { cat: string; v: number; w: number }[] {
  const t = texts(svg)
  const ticks = t.filter((x) => /^\d+$/.test(x.s) && /tiny/.test(x.cls) && !/bar/.test(x.cls)).filter((x, _, all) => Math.abs(x.x - Math.min(...all.map((a) => a.x))) < 2)
  const tk = ticks.map((x) => ({ v: Number(x.s), y: x.y })).sort((a, b) => a.v - b.v)
  const valueAt = (y: number) => {
    for (let i = 1; i < tk.length; i++) {
      const [a, b] = [tk[i - 1], tk[i]]
      if (y <= a.y + 0.01 && y >= b.y - 0.01) return a.v + ((a.y - y) / (a.y - b.y)) * (b.v - a.v)
    }
    throw new Error('a column is off the scale')
  }
  const cats = t.filter((x) => /tiny/.test(x.cls) && !/^\d+$/.test(x.s))
  return [...svg.matchAll(/<rect class="bar" x="([\d.]+)" y="([\d.]+)" width="([\d.]+)"/g)].map((m) => {
    const cx = Number(m[1]) + Number(m[3]) / 2
    const cat = cats.reduce((b, c) => (Math.abs(c.x - cx) < Math.abs(b.x - cx) ? c : b))
    return { cat: cat.s, v: valueAt(Number(m[2])), w: Number(m[3]) }
  })
}
/** a dot plot: every dot counted above the axis number it stands over */
function dots(svg: string): number[] {
  const nums = texts(svg).filter((x) => /tiny/.test(x.cls) && /^\d+$/.test(x.s))
  return [...svg.matchAll(/<circle class="pt hlfill" cx="([\d.]+)"/g)].map((m) => {
    const cx = Number(m[1])
    const n = nums.reduce((b, c) => (Math.abs(c.x - cx) < Math.abs(b.x - cx) ? c : b))
    if (Math.abs(n.x - cx) > 1) throw new Error('a dot is not above an axis number')
    return Number(n.s)
  })
}
/** a stem-and-leaf plot: each leaf joined to the stem on its row; the key must agree with stem × 10 + leaf */
function stemLeaf(svg: string, ctx: Ctx): number[] {
  const t = texts(svg)
  const stems = t.filter((x) => /\bstem\b/.test(x.cls))
  const leaves = t.filter((x) => /\bleaf\b/.test(x.cls))
  const key = t.find((x) => /\bkey\b/.test(x.cls))!.s.match(/(\d+) \| (\d) = (\d+)/)!
  if (Number(key[1]) * 10 + Number(key[2]) !== Number(key[3])) ctx.fail('the key does not read as stem × 10 + leaf')
  const out: number[] = []
  for (const l of leaves) {
    const st = stems.find((s) => Math.abs(s.y - l.y) < 1)!
    const ls = l.s.split(/\s+/).filter(Boolean).map(Number)
    if (ls.some((x, i) => i > 0 && x < ls[i - 1])) ctx.fail('the leaves are not in order')
    out.push(...ls.map((x) => Number(st.s) * 10 + x))
  }
  return out
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
  if (want && 'text' in want && !['10.02 flaw', '10.08 compare', '10.08 effect'].includes(kind)) {
    if (!ctx.plain(q.why).includes(want.text)) ctx.fail(`the explanation does not reach ${want.text}`)
  }
  return want
}

function solve(kind: string, q: GameQuestion, ctx: Ctx): Expect {
  const svg = q.diagram ?? ''
  const words = ctx.plain(q.prompt)
  const shown = q.options.map(ctx.plain)
  const one = (ok: boolean[], what: string): Expect => {
    const hits = ok.map((x, k) => (x ? k : -1)).filter((k) => k >= 0)
    if (hits.length !== 1) ctx.fail(`${hits.length} options ${what}`)
    return hits.length ? { text: shown[hits[0]] } : null
  }
  const colon = () => listIn(words.split(': ').pop()!)

  switch (kind) {
    case '10.01 read': {
      const c = columns(svg)
      const name = words.match(/chose (.+?)\?/)![1]
      const v = c.find((x) => x.cat === name)!.v
      if (Math.abs(v - Math.round(v)) > 0.02) ctx.fail('the column does not end on a whole number')
      return { v: Math.round(v) }
    }
    case '10.01 most': {
      const c = columns(svg)
      const most = /most/.test(words)
      const best = most ? Math.max(...c.map((x) => x.v)) : Math.min(...c.map((x) => x.v))
      const hits = c.filter((x) => Math.abs(x.v - best) < 0.01)
      if (hits.length !== 1) ctx.fail('two columns tie')
      return { text: hits[0].cat }
    }
    case '10.01 more': {
      const c = columns(svg)
      const m = words.match(/chose (.+?) than (.+?)\?/)!
      return { v: Math.round(c.find((x) => x.cat === m[1])!.v - c.find((x) => x.cat === m[2])!.v) }
    }
    case '10.02 flaw': {
      const t = texts(svg)
      const ticks = t.filter((x) => /tick/.test(x.cls)).map((x) => ({ v: Number(x.s), y: x.y })).sort((a, b) => a.v - b.v)
      const flaws: string[] = []
      if (ticks[0].v !== 0) flaws.push('start at 0')
      // equal gaps on the page must stand for equal amounts
      const ratio = ticks.slice(1).map((k, i) => (k.v - ticks[i].v) / (ticks[i].y - k.y))
      if (ratio.some((r) => Math.abs(r - ratio[0]) > 1e-6 * Math.abs(ratio[0]))) flaws.push('evenly spaced')
      const widths = [...svg.matchAll(/<rect class="bar"[^>]* width="([\d.]+)"/g)].map((m) => Number(m[1]))
      if (Math.max(...widths) - Math.min(...widths) > 0.5) flaws.push('different widths')
      if (!t.some((x) => /gtitle/.test(x.cls))) flaws.push('no title')
      if (flaws.length !== 1) return ctx.fail(`the graph has ${flaws.length} flaws: ${flaws.join(', ')}`), null
      return one(shown.map((o) => o.includes(flaws[0])), `describe the flaw (${flaws[0]})`)
    }
    case '10.03 mode': {
      const m = modes(dots(svg))
      if (m.length !== 1) ctx.fail(`${m.length} modes`)
      return { v: m[0] }
    }
    case '10.03 count': {
      const d = dots(svg)
      const m = words.match(/are (greater|less) than (\d+)\?/)!
      const cut = Number(m[2])
      return { v: d.filter((x) => (m[1] === 'greater' ? x > cut : x < cut)).length }
    }
    case '10.04 extreme': {
      const d = stemLeaf(svg, ctx)
      return { v: /largest/.test(words) ? Math.max(...d) : Math.min(...d) }
    }
    case '10.04 count': {
      const d = stemLeaf(svg, ctx)
      const m = words.match(/from (\d+) to (\d+)/)!
      return { v: d.filter((x) => x >= Number(m[1]) && x <= Number(m[2])).length }
    }
    case '10.05 mean': {
      const xs = colon()
      return { v: sum(xs) / xs.length }
    }
    case '10.05 mode': {
      const m = modes(colon())
      if (m.length !== 1) ctx.fail(`${m.length} modes`)
      return { v: m[0] }
    }
    case '10.05 missing': {
      const m = words.match(/mean of (\d+) numbers is (\d+)\. \w+ of them are (.+?)\. What/)!
      return { v: Number(m[1]) * Number(m[2]) - sum(listIn(m[3])) }
    }
    case '10.06 median':
      return { v: median(colon()) }
    case '10.06 range': {
      const xs = colon()
      return { v: Math.max(...xs) - Math.min(...xs) }
    }
    case '10.07 median': {
      const d = dots(svg)
      return { v: median(d) }
    }
    case '10.07 range': {
      const d = stemLeaf(svg, ctx)
      return { v: Math.max(...d) - Math.min(...d) }
    }
    case '10.07 outlier': {
      const d = dots(svg)
      // a score at least 4 away from every other score
      const far = [...new Set(d)].filter((x) => d.every((y) => y === x || Math.abs(y - x) >= 4))
      if (far.length !== 1) ctx.fail(`${far.length} outliers`)
      return { v: far[0] }
    }
    case '10.08 compare': {
      const m = words.match(/Class A: (.+?)\. Class B: (.+?)\. Which class has the greater (\w+)\?/)!
      const [a, b] = [listIn(m[1]), listIn(m[2])]
      const of = (xs: number[]) => (m[3] === 'mean' ? sum(xs) / xs.length : m[3] === 'median' ? median(xs) : Math.max(...xs) - Math.min(...xs))
      const [va, vb] = [of(a), of(b)]
      return { text: va > vb ? 'Class A' : vb > va ? 'Class B' : 'They are the same' }
    }
    case '10.08 effect': {
      const m = words.match(/The scores (.+?) have a mean of (\d+)\. A new score of (\d+) is added/)!
      const xs = listIn(m[1])
      if (sum(xs) / xs.length !== Number(m[2])) ctx.fail('the stated mean is wrong')
      const before = sum(xs) / xs.length
      const after = (sum(xs) + Number(m[3])) / (xs.length + 1)
      return { text: after > before ? 'The mean goes up' : after < before ? 'The mean goes down' : 'The mean stays the same' }
    }
  }
  ctx.fail('no independent check for this kind of question')
  return null
}
