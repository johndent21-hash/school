// Independent answers for the Chapter 9 (Number plane) class games, used by tests/games.test.ts.
// Everything is read off the drawings: on a number plane, the axis numbers give the scale, then each dot and each
// drawn line is turned back into coordinates; on the town map, each place is matched to the column letter and row
// number it lines up with; tables of values are read cell by cell. Rules are read with this file's own parser.
import type { GameQuestion, GameSet } from '../../src/lib/game/types'
import type { Ctx, Expect } from './ncm7-ch1'

type P = [number, number]
const NUM = '(-?[\\d.]+)'
const texts = (svg: string) =>
  [...svg.matchAll(new RegExp(`<text class="([^"]*)" x="${NUM}" y="${NUM}"[^>]*>(.*?)</text>`, 'g'))].map((m) => ({
    cls: m[1],
    x: Number(m[2]),
    y: Number(m[3]),
    s: m[4].replace(/<[^>]*>/g, '').replace('−', '-'),
  }))
const close = (a: number, b: number, tol = 0.02) => Math.abs(a - b) <= tol
const show = ([x, y]: P) => `(${x < 0 ? '−' + -x : x}, ${y < 0 ? '−' + -y : y})`
const readPair = (s: string): P | null => {
  const m = s.replace(/−/g, '-').match(/^\((-?\d+), (-?\d+)\)$/)
  return m ? [Number(m[1]), Number(m[2])] : null
}

/** the number plane's scale, from its axis numbers: pixel = a + b × value, one fit for each axis */
function planeScale(svg: string) {
  const tiny = texts(svg).filter((t) => /\btiny\b/.test(t.cls) && /^-?\d+$/.test(t.s) && t.s !== '0')
  // x-axis numbers share one row; y-axis numbers share one column
  const rows = new Map<number, typeof tiny>()
  for (const t of tiny) rows.set(Math.round(t.y), [...(rows.get(Math.round(t.y)) ?? []), t])
  const xs = [...rows.values()].sort((a, b) => b.length - a.length)[0]
  const ys = tiny.filter((t) => !xs.includes(t))
  const fit = (pairs: [number, number][]) => {
    const [v0, p0] = pairs[0]
    const [v1, p1] = pairs[pairs.length - 1]
    const b = (p1 - p0) / (v1 - v0)
    const a = p0 - b * v0
    if (!pairs.every(([v, p]) => Math.abs(a + b * v - p) < 0.6)) throw new Error('axis numbers are not evenly spaced')
    return { a, b }
  }
  const X = fit(xs.map((t) => [Number(t.s), t.x] as [number, number]).sort((p, q) => p[0] - q[0]))
  const Y = fit(ys.map((t) => [Number(t.s), t.y] as [number, number]).sort((p, q) => p[0] - q[0]))
  return { toX: (px: number) => (px - X.a) / X.b, toY: (py: number) => (py - Y.a) / Y.b }
}
/** the labelled dots on a number plane, as coordinates */
function planePoints(svg: string): { label: string; p: P }[] {
  const sc = planeScale(svg)
  const dots = [...svg.matchAll(/<circle class="pt hlfill" cx="([\d.-]+)" cy="([\d.-]+)"/g)].map((m) => [Number(m[1]), Number(m[2])] as P)
  const labs = texts(svg).filter((t) => /\bsmall\b/.test(t.cls) && /^[A-Z]$/.test(t.s))
  return labs.map((l) => {
    const d = dots.reduce((best, q) => (Math.hypot(q[0] - l.x, q[1] - l.y) < Math.hypot(best[0] - l.x, best[1] - l.y) ? q : best))
    const p: P = [sc.toX(d[0]), sc.toY(d[1])]
    if (!close(p[0], Math.round(p[0])) || !close(p[1], Math.round(p[1]))) throw new Error('a point is not on grid lines')
    return { label: l.s, p: [Math.round(p[0]), Math.round(p[1])] as P }
  })
}
/** a rule "y = 2x + 1", "y = 6 − x" as a function of x */
function rule(s: string): (x: number) => number {
  const m = s.replace(/−/g, '-').replace(/\s+/g, '').match(/^y=(.+)$/)
  if (!m) throw new Error(`not a rule: "${s}"`)
  const terms = m[1].match(/[+-]?[^+-]+/g)!
  return (x) =>
    terms.reduce((t, term) => {
      const k = term.match(/^([+-]?)(\d*)(x?)$/)
      if (!k) throw new Error(`cannot read "${term}"`)
      const sign = k[1] === '-' ? -1 : 1
      const n = k[2] === '' ? 1 : Number(k[2])
      return t + sign * n * (k[3] ? x : 1)
    }, 0)
}
/** a table of values: the x cells and y cells matched by column */
function tableOf(svg: string): { x: number; y: number | null }[] {
  const t = texts(svg)
  const xs = t.filter((c) => /cellx/.test(c.cls))
  const ys = t.filter((c) => /celly/.test(c.cls))
  return xs.map((c) => {
    const y = ys.find((d) => Math.abs(d.x - c.x) < 1)!
    return { x: Number(c.s), y: y.s === '?' ? null : Number(y.s) }
  })
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
  if (want && 'text' in want && !['9.02 which', '9.03 quadrant', '9.03 axis', '9.05 rule', '9.06 graph', '9.01 what'].includes(kind)) {
    if (!ctx.plain(q.why).replace(/\s/g, '').includes(want.text.replace(/\s/g, ''))) ctx.fail(`the explanation does not reach ${want.text}`)
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
  const asked = (): P => readPair(words.match(/\((−?\d+), (−?\d+)\)/)![0])!

  switch (kind) {
    case '9.01 where':
    case '9.01 what': {
      const t = texts(svg)
      const cols = t.filter((c) => /colref/.test(c.cls))
      const rows = t.filter((c) => /rowref/.test(c.cls))
      const places = t.filter((c) => /place/.test(c.cls)).map((p) => {
        const col = cols.reduce((b, c) => (Math.abs(c.x - p.x) < Math.abs(b.x - p.x) ? c : b))
        const row = rows.reduce((b, r) => (Math.abs(r.y - p.y) < Math.abs(b.y - p.y) ? r : b))
        return { name: p.s, ref: col.s + row.s }
      })
      if (new Set(places.map((p) => p.ref)).size !== places.length) ctx.fail('two places share a square')
      if (kind === '9.01 where') {
        const name = words.match(/is the (.+?)\?/)![1]
        return { text: places.find((p) => p.name === name)!.ref }
      }
      const r = words.match(/square ([A-F]\d)\?/)![1]
      return { text: places.find((p) => p.ref === r)!.name }
    }
    case '9.02 read':
    case '9.03 read': {
      const pts = planePoints(svg)
      if (pts.length !== 1) ctx.fail(`${pts.length} labelled points`)
      return { text: show(pts[0].p) }
    }
    case '9.02 which': {
      const want = asked()
      const pts = planePoints(svg)
      const at = pts.filter((p) => p.p[0] === want[0] && p.p[1] === want[1])
      if (at.length !== 1) ctx.fail(`${at.length} points at ${show(want)}`)
      return { text: at[0]?.label ?? '' }
    }
    case '9.03 quadrant': {
      const [x, y] = asked()
      return { text: x > 0 ? (y > 0 ? 'First quadrant' : 'Fourth quadrant') : y > 0 ? 'Second quadrant' : 'Third quadrant' }
    }
    case '9.03 axis': {
      const [x, y] = asked()
      return { text: x === 0 && y === 0 ? 'At the origin' : y === 0 ? 'On the x -axis' : x === 0 ? 'On the y -axis' : '' }
    }
    case '9.04 pair': {
      const tab = tableOf(svg)
      return one(
        shown.map((o) => {
          const p = readPair(o)
          return !!p && tab.some((c) => c.x === p[0] && c.y === p[1])
        }),
        'come from the table',
      )
    }
    case '9.04 next': {
      const tab = tableOf(svg) as { x: number; y: number }[]
      const step = (tab[1].y - tab[0].y) / (tab[1].x - tab[0].x)
      if (!tab.every((c, i) => i === 0 || c.y - tab[i - 1].y === step * (c.x - tab[i - 1].x))) ctx.fail('the table is not a steady pattern')
      const x = Number(words.match(/when x = (\d+)/)![1])
      return { v: tab[0].y + step * (x - tab[0].x) }
    }
    case '9.05 complete': {
      const f = rule(words.match(/The rule is (y = .+?)\. Which number/)![1])
      const tab = tableOf(svg)
      for (const c of tab) if (c.y !== null && f(c.x) !== c.y) ctx.fail(`the table's pair (${c.x}, ${c.y}) does not fit the rule`)
      const gap = tab.filter((c) => c.y === null)
      if (gap.length !== 1) ctx.fail(`${gap.length} gaps in the table`)
      return { v: f(gap[0].x) }
    }
    case '9.05 rule': {
      const tab = tableOf(svg) as { x: number; y: number }[]
      return one(
        shown.map((o) => tab.every((c) => rule(o)(c.x) === c.y)),
        'fit every pair',
      )
    }
    case '9.06 onLine': {
      const f = rule(words.match(/on the line (y = .+?)\?/)![1])
      return one(
        shown.map((o) => {
          const p = readPair(o)!
          return f(p[0]) === p[1]
        }),
        'lie on the line',
      )
    }
    case '9.06 graph': {
      const sc = planeScale(svg)
      const l = svg.match(/<line class="plot" x1="([\d.-]+)" y1="([\d.-]+)" x2="([\d.-]+)" y2="([\d.-]+)"/)!
      const a: P = [sc.toX(Number(l[1])), sc.toY(Number(l[2]))]
      const b: P = [sc.toX(Number(l[3])), sc.toY(Number(l[4]))]
      const m = (b[1] - a[1]) / (b[0] - a[0])
      const c = a[1] - m * a[0]
      return one(
        shown.map((o) => [-2, 0, 3].every((x) => close(rule(o)(x), m * x + c, 0.05))),
        'match the drawn line',
      )
    }
  }
  ctx.fail('no independent check for this kind of question')
  return null
}
