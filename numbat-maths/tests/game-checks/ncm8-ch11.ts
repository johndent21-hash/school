// Independent answers for the NCM 8 Chapter 11 (Graphing linear equations) class games, used by tests/games.test.ts.
// Kinds reused from NCM 7 Chapter 9 (meta.reused) are checked by that chapter's checks, so only the new kinds are here.
//  - equations are read with the NCM 7 Chapter 5 parser; an option "y = …" is right when it gives the right values;
//  - tables are read cell by cell from the picture; a table is linear when every change in y is the same;
//  - a line on the number plane is read from the drawing: its two ends turned into coordinates with the axis numbers,
//    giving its gradient and y-intercept (they must be whole numbers);
//  - intersections, gradients from two points and graphical solutions are worked out here.
import type { GameQuestion, GameSet } from '../../src/lib/game/types'
import type { Ctx, Expect } from './ncm7-ch1'
import { parse, txt } from './ncm7-ch5'

type P = [number, number]
const NUMS = '(-?[\\d.]+)'
const close = (a: number, b: number) => Math.abs(a - b) < 1e-6
const neg = (n: number) => (n < 0 ? `−${-n}` : String(n))
const int = (s: string) => Number(s.replace('−', '-'))

/** "y=2x−3" (compact text) → a function of its letter */
function rule(eq: string): { y: string; x: string; f: (v: number) => number } {
  const [l, r] = eq.split('=')
  const x = (r.match(/[a-z]/) ?? ['x'])[0]
  return { y: l, x, f: (v) => parse(r)({ [x]: v }) }
}
/** slope and intercept of a rule, checked to be linear */
function mc(f: (v: number) => number, ctx: Ctx): [number, number] {
  const c = f(0)
  const m = f(1) - c
  if (!close(f(5), 5 * m + c) || !close(f(-3), -3 * m + c)) ctx.fail('the rule is not linear')
  return [m, c]
}

/** a table picture: { x: [...], y: [...] } */
function readTable(svg: string): { xs: number[]; ys: number[] } {
  const cells = [...svg.matchAll(/<text class="[^"]*\bcell r(\d+) c(\d+)"[^>]*>([^<]*)<\/text>/g)].map((m) => ({ r: +m[1], c: +m[2], s: m[3] }))
  const row = (r: number) => cells.filter((c) => c.r === r && c.c > 0).sort((a, b) => a.c - b.c).map((c) => int(c.s))
  return { xs: row(0), ys: row(1) }
}

/** the line drawn on a number plane, as [gradient, y-intercept] */
function readLine(svg: string, ctx: Ctx): [number, number] {
  const T = [...svg.matchAll(new RegExp(`<text class="dl tiny" x="${NUMS}" y="${NUMS}" text-anchor="(\\w+)"[^>]*>([^<]*)</text>`, 'g'))].map((m) => ({ x: +m[1], y: +m[2], a: m[3], v: int(m[4]) }))
  const fit = (pts: { px: number; v: number }[]) => {
    const [p, q] = [pts[0], pts[pts.length - 1]]
    const k = (q.v - p.v) / (q.px - p.px)
    // pixel positions are rounded to 0.01, so allow a little
    if (pts.some((t) => Math.abs(p.v + (t.px - p.px) * k - t.v) > 0.01)) ctx.fail('the axis numbers are not evenly spaced')
    return (px: number) => p.v + (px - p.px) * k
  }
  const X = fit(T.filter((t) => t.a === 'middle').map((t) => ({ px: t.x, v: t.v })))
  // y labels sit 1 px below their grid line in some planes, so fit them as they are and round the result
  const Y = fit(T.filter((t) => t.a === 'end').map((t) => ({ px: t.y, v: t.v })))
  const m = svg.match(new RegExp(`<line class="plot" x1="${NUMS}" y1="${NUMS}" x2="${NUMS}" y2="${NUMS}"`))!
  const [a, b]: P[] = [[X(+m[1]), Y(+m[2])], [X(+m[3]), Y(+m[4])]]
  const grad = (b[1] - a[1]) / (b[0] - a[0])
  const icpt = a[1] - grad * a[0]
  const [G, C] = [Math.round(grad), Math.round(icpt)]
  if (Math.abs(grad - G) > 0.02 || Math.abs(icpt - C) > 0.05) ctx.fail(`the drawn line is not a whole-number line (${grad.toFixed(3)}, ${icpt.toFixed(3)})`)
  return [G, C]
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
  const T = txt(q.prompt)
  const opts = q.options.map(txt)
  const shown = q.options.map(ctx.plain)
  const one = (ok: (o: string) => boolean, what: string): Expect => {
    const hits = opts.map((o, i) => (ok(o) ? i : -1)).filter((i) => i >= 0)
    if (hits.length !== 1) ctx.fail(`${hits.length} options ${what}`)
    return hits.length ? { text: shown[hits[0]] } : null
  }
  /** an option equation with slope m and intercept c (as y = …) */
  const isLine = (m: number, c: number) => (o: string) => {
    if (!/^[a-zA-Z]=/.test(o)) return false
    const r = rule(o)
    return [-2, 0, 1, 3].every((v) => close(r.f(v), m * v + c))
  }
  switch (kind) {
    case '11.01 value': {
      const m = T.match(/rule(y=[^,]+),.*whenx=([−-]?\d+)\?/)!
      return { text: neg(rule(m[1]).f(int(m[2]))) }
    }
    case '11.02 rule': {
      const { xs, ys } = readTable(svg)
      return one((o) => /^y=/.test(o) && xs.every((x, i) => close(rule(o).f(x), ys[i])), 'fit the table')
    }
    case '11.03 nth': {
      const terms = (T.match(/<?(?:pattern)?((?:[−-]?\d+,)+)…/)?.[1] ?? T.match(/pattern(.*?)…/)![1]).split(',').filter(Boolean).map(int)
      return one((o) => /^T=/.test(o) && terms.every((t, i) => close(rule(o).f(i + 1), t)), 'give the pattern')
    }
    case '11.03 term': {
      const m = T.match(/rule(T=[^.]+?)\.Whatistermnumber(\d+)\?/)!
      return { text: neg(rule(m[1]).f(Number(m[2]))) }
    }
    case '11.05 linear': {
      const { ys } = readTable(svg)
      const d = ys.slice(1).map((y, i) => y - ys[i])
      return { text: d.every((x) => x === d[0]) ? 'Yes: the same change in y each time' : 'No: the change in y is not the same' }
    }
    case '11.07 fromGraph': {
      const [m, c] = readLine(svg, ctx)
      return one(isLine(m, c), 'match the line')
    }
    case '11.08 parallel': {
      const [m, c] = mc(rule(T.match(/parallelto(y=.+)\?$/)![1]).f, ctx)
      return one((o) => {
        const [a, k] = mc(rule(o).f, ctx)
        return a === m && k !== c
      }, 'are parallel')
    }
    case '11.08 intercept': {
      const [, c] = mc(rule(T.match(/line(y=.+?)crossthe/)![1]).f, ctx)
      return { text: `(0, ${neg(c)})` }
    }
    case '11.08 steepest': {
      const ms = opts.map((o) => Math.abs(mc(rule(o).f, ctx)[0]))
      const top = Math.max(...ms)
      return one((o) => Math.abs(mc(rule(o).f, ctx)[0]) === top, 'are the steepest')
    }
    case '11.09 gradient': {
      const m = T.match(/\(([−-]?\d+),([−-]?\d+)\)and\(([−-]?\d+),([−-]?\d+)\)/)!
      const [x1, y1, x2, y2] = [m[1], m[2], m[3], m[4]].map(int)
      const g = (y2 - y1) / (x2 - x1)
      if (!Number.isInteger(g)) ctx.fail('the gradient is not whole')
      return { text: neg(g) }
    }
    case '11.10 read': {
      const [m, c] = mc(rule(T.match(/interceptof(y=.+)\?$/)![1]).f, ctx)
      return { text: `gradient ${neg(m)}, y-intercept ${neg(c)}` }
    }
    case '11.10 write': {
      const m = T.match(/gradient([−-]?\d+)andy-intercept([−-]?\d+)\?/)!
      return one(isLine(int(m[1]), int(m[2])), 'have that gradient and intercept')
    }
    case '11.11 apply': {
      const f = T.match(/([A-Za-z])=([^,]+?),where|holds([A-Za-z])=([^l]+?)litres/)!
      const [lhs, rhs] = f[1] ? [f[1], f[2]] : [f[3], f[4]]
      const letter = (rhs.match(/[a-z]/) ?? [''])[0]
      const fn = (v: number) => parse(rhs)({ [letter]: v })
      let m = T.match(/Whatdoesa(\d+)kmtripcost\?/)
      if (m) return { text: `$${fn(Number(m[1]))}` }
      m = T.match(/Howfarcanyougofor\$(\d+)\?/)
      if (m) {
        const [a, b] = mc(fn, ctx)
        return { text: `${(Number(m[1]) - b) / a} km` }
      }
      m = T.match(/after(\d+)minutes\?/)!
      void lhs
      return { text: `${fn(Number(m[1]))} L` }
    }
    case '11.12 graph': {
      const [m, c] = readLine(svg, ctx)
      const said = mc(rule(T.match(/graphof(y=.+?)\.Use/)![1]).f, ctx)
      if (said[0] !== m || said[1] !== c) ctx.fail('the graph is not the line the question names')
      const y = int(T.match(/solve.+=([−-]?\d+)\.$/)![1])
      const x = (y - c) / m
      if (!Number.isInteger(x)) ctx.fail('the solution is not on a grid line')
      return one((o) => o === `x=${x < 0 ? '−' + -x : x}`, 'solve the equation')
    }
    case '11.13 intersect': {
      const m = T.match(/lines(y=.+?)and(y=.+?)meet\?/)!
      const [m1, c1] = mc(rule(m[1]).f, ctx)
      const [m2, c2] = mc(rule(m[2]).f, ctx)
      if (m1 === m2) throw new Error('parallel lines')
      const x = (c2 - c1) / (m1 - m2)
      return { text: `(${neg(x)}, ${neg(m1 * x + c1)})` }
    }
  }
  ctx.fail('no independent check for this kind of question')
  return null
}
