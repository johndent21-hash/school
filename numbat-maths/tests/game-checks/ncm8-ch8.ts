// Independent answers for the NCM 8 Chapter 8 (Probability) class games, used by tests/games.test.ts.
// Kinds reused from NCM 7 Chapter 11 (meta.reused) are checked by that chapter's checks, so only the new kinds are here.
//  - counts are read from the question (colours and numbers) and probabilities worked out as exact fractions; the one
//    option equal in value must be in simplest form, and no other option may equal it;
//  - Venn diagrams: each number is placed in its region by where it sits relative to the two circles (inside A only,
//    inside both, inside B only, outside both), and the circle names by which circle they sit above;
//  - two-way tables: read cell by cell; every row and column must add to its total (the missing cell is found from
//    its row, and must agree with its column);
//  - numbered balls 1–100 are counted here by testing every number.
import type { GameQuestion, GameSet } from '../../src/lib/game/types'
import type { Ctx, Expect } from './ncm7-ch1'

type P = [number, number]
const NUMS = '(-?[\\d.]+)'
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
const texts = (svg: string) =>
  [...svg.matchAll(new RegExp(`<text class="([^"]*)" x="${NUMS}" y="${NUMS}"[^>]*>(.*?)</text>`, 'g'))].map((m) => ({
    cls: m[1],
    p: [Number(m[2]), Number(m[3])] as P,
    s: m[4].replace(/<[^>]*>/g, '').trim(),
  }))

/** a probability option: "0", "1" or "(n/d)" → [n, d] as written */
function prob(o: string): [number, number] | null {
  if (o === '0') return [0, 1]
  if (o === '1') return [1, 1]
  const m = o.match(/^\((\d+)\/(\d+)\)$/)
  return m ? [Number(m[1]), Number(m[2])] : null
}

/** the Venn diagram's regions: only A, both, only B, neither, and the circle names */
function readVenn(svg: string, ctx: Ctx) {
  const circles = [...svg.matchAll(new RegExp(`<circle class="sh venn([AB])" cx="${NUMS}" cy="${NUMS}" r="${NUMS}"`, 'g'))].map((m) => ({ k: m[1], c: [+m[2], +m[3]] as P, r: +m[4] }))
  const [A, B] = ['A', 'B'].map((k) => circles.find((c) => c.k === k)!)
  const inside = (p: P, c: typeof A) => Math.hypot(p[0] - c.c[0], p[1] - c.c[1]) < c.r - 4
  const reg = { onlyA: NaN, both: NaN, onlyB: NaN, neither: NaN, nameA: '', nameB: '' }
  for (const t of texts(svg)) {
    if (/^\d+$/.test(t.s)) {
      const key = inside(t.p, A) ? (inside(t.p, B) ? 'both' : 'onlyA') : inside(t.p, B) ? 'onlyB' : 'neither'
      if (!Number.isNaN(reg[key])) ctx.fail(`two numbers in the region ${key}`)
      reg[key] = Number(t.s)
    } else {
      // a name sits above its own circle, nearer its centre than the other's
      const near = Math.abs(t.p[0] - A.c[0]) < Math.abs(t.p[0] - B.c[0]) ? 'nameA' : 'nameB'
      if (inside(t.p, A) || inside(t.p, B)) ctx.fail('a circle name is inside a circle')
      reg[near] = t.s
    }
  }
  if ([reg.onlyA, reg.both, reg.onlyB, reg.neither].some(Number.isNaN)) ctx.fail('a region has no number')
  return reg
}

/** a table picture: rows of cell strings */
function readGrid(svg: string): string[][] {
  const cells = [...svg.matchAll(/<text class="[^"]*\bcell r(\d+) c(\d+)"[^>]*>([^<]*)<\/text>/g)].map((m) => ({ r: +m[1], c: +m[2], s: m[3] }))
  const R = Math.max(...cells.map((c) => c.r))
  const C = Math.max(...cells.map((c) => c.c))
  return Array.from({ length: R + 1 }, (_, r) => Array.from({ length: C + 1 }, (_, c) => cells.find((x) => x.r === r && x.c === c)?.s ?? ''))
}

export function rework(set: GameSet, q: GameQuestion, ctx: Ctx): Expect {
  const kind = `${set.exercise} ${q.meta.t}`
  try {
    return solve(kind, q, ctx)
  } catch (e) {
    ctx.fail(`could not be read: ${(e as Error).message}`)
    return null
  }
}

function solve(kind: string, q: GameQuestion, ctx: Ctx): Expect {
  const svg = q.diagram ?? ''
  const words = ctx.plain(q.prompt).replace(/\s+([.?,:)])/g, '$1')
  const shown = q.options.map(ctx.plain)
  /** the one option equal to n/d, which must be in simplest form */
  const P = (n: number, d: number): Expect => {
    const vals = shown.map(prob)
    if (vals.some((v) => !v)) ctx.fail('an option is not a probability')
    const hits = vals.map((v, i) => (v && v[0] * d === n * v[1] ? i : -1)).filter((i) => i >= 0)
    if (hits.length !== 1) ctx.fail(`${hits.length} options equal ${n}/${d}`)
    if (!hits.length) return null
    const [a, c] = vals[hits[0]]!
    if (!(a === 0 || a === c || gcd(a, c) === 1) || (a !== 0 && a !== c && c === 1)) ctx.fail('the right option is not in simplest form')
    return { text: shown[hits[0]] }
  }
  /** "4 red, 2 green and 7 blue" → colour counts */
  const counts = () => Object.fromEntries([...words.matchAll(/(\d+) (red|green|yellow|blue)\b/g)].map((m) => [m[2], Number(m[1])])) as Record<string, number>
  switch (kind) {
    case '8.01 or':
    case '8.05 or': {
      const c = counts()
      const m = words.match(/that it is (\w+) or (\w+)\?/)!
      const total = Object.values(c).reduce((t, x) => t + x, 0)
      return P(c[m[1]] + c[m[2]], total)
    }
    case '8.02 not':
    case '8.05 not': {
      const c = counts()
      const col = words.match(/that it is not (\w+)\?/)![1]
      const total = Object.values(c).reduce((t, x) => t + x, 0)
      return P(total - c[col], total)
    }
    case '8.02 pct': {
      const p = Number(words.match(/is (\d+)%\./)![1])
      return { text: `${100 - p}%` }
    }
    case '8.03 count':
    case '8.03 prob': {
      const v = readVenn(svg, ctx)
      const total = v.onlyA + v.both + v.onlyB + v.neither
      const nameOf = (s: string) => (s === v.nameA ? 'A' : s === v.nameB ? 'B' : null)
      if (kind === '8.03 count') {
        if (/How many people were surveyed\?/.test(words)) return { v: total }
        if (/How many \w+ neither\?/.test(words)) return { v: v.neither }
        if (/How many \w+ both\?/.test(words)) return { v: v.both }
        if (/How many \w+ \w+ or \w+ \(or both\)\?/.test(words)) return { v: v.onlyA + v.both + v.onlyB }
        const m = words.match(/How many \w+ (\w+)\?/)!
        const which = nameOf(m[1])
        if (!which) throw new Error(`no circle called ${m[1]}`)
        return { v: which === 'A' ? v.onlyA + v.both : v.onlyB + v.both }
      }
      const m = words.match(/that they \w+ (only )?(\w+)\?/)!
      if (m[2] === 'both') return P(v.both, total)
      const which = nameOf(m[2])
      if (!which) throw new Error(`no circle called ${m[2]}`)
      const only = which === 'A' ? v.onlyA : v.onlyB
      return P(m[1] ? only : only + v.both, total)
    }
    case '8.04 missing':
    case '8.04 prob': {
      const g = readGrid(svg)
      const n = (r: number, c: number) => Number(g[r][c])
      // every row and column adds up (with the missing cell worked out from its row)
      let miss: [number, number] | null = null
      for (let r = 1; r <= 2; r++) for (let c = 1; c <= 2; c++) if (g[r][c] === '?') miss = [r, c]
      const val = (r: number, c: number) => (miss && miss[0] === r && miss[1] === c ? n(r, 3) - n(r, 3 - c) : n(r, c))
      for (let r = 1; r <= 3; r++) if (val(r, 1) + val(r, 2) !== n(r, 3)) ctx.fail(`row ${r} does not add up`)
      for (let c = 1; c <= 3; c++) if (val(1, c) + val(2, c) !== n(3, c)) ctx.fail(`column ${c} does not add up`)
      if (kind === '8.04 missing') {
        if (!miss) throw new Error('nothing missing')
        return { v: val(miss[0], miss[1]) }
      }
      const m = words.match(/that they are in (.+?) and (.+?)\?/)!
      const r = g.findIndex((row) => row[0] === m[1])
      const c = g[0].indexOf(m[2])
      if (r < 1 || r > 2 || c < 1 || c > 2) throw new Error('row or column not found')
      return P(n(r, c), n(3, 3))
    }
    case '8.05 balls': {
      const say = words.match(/that it shows (.+)\?/)![1]
      const tests: Record<string, (x: number) => boolean> = {
        'a multiple of 10': (x) => x % 10 === 0,
        'a multiple of 5': (x) => x % 5 === 0,
        'a number ending in 7': (x) => String(x).endsWith('7'),
        'a two-digit number': (x) => String(x).length === 2,
        'a perfect square': (x) => [1, 4, 9, 16, 25, 36, 49, 64, 81, 100].includes(x),
        'a number greater than 90': (x) => x > 90,
      }
      if (!tests[say]) throw new Error(`unknown event "${say}"`)
      return P(Array.from({ length: 100 }, (_, i) => i + 1).filter(tests[say]).length, 100)
    }
    case '8.05 tickets': {
      const m = words.match(/buys (\d+) tickets in a raffle that sells ([\d ]+) tickets/)!
      return P(Number(m[1]), Number(m[2].replace(/\s/g, '')))
    }
    case '8.05 coin':
      if (!/A fair coin/.test(words)) ctx.fail('the coin is not said to be fair')
      return P(1, 2)
    case '8.06 relFreq': {
      const m = words.match(/(\d+) times and got .+? (\d+) times/)!
      return P(Number(m[2]), Number(m[1]))
    }
    case '8.06 predict': {
      const m = words.match(/blue (\d+) times in (\d+) spins\. About how many blues would you expect in ([\d ]+) spins\?/)!
      return { v: (Number(m[1]) * Number(m[3].replace(/\s/g, ''))) / Number(m[2]) }
    }
  }
  ctx.fail('no independent check for this kind of question')
  return null
}
