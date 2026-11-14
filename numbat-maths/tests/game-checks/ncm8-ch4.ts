// Independent answers for the NCM 8 Chapter 4 (Geometry) class games, used by tests/games.test.ts.
// 4.01–4.06 reuse NCM 7 Chapter 2 and 6 kinds (meta.from) and go to those chapters' checkers, so only the new
// extension kinds are here. Polygon questions are worked from the polygon's name or the angle in the prompt.
// Networks are read from the drawing alone: every edge's ends must sit on drawn vertices, each vertex is named by
// the letter beside it, degrees are counted from the edges, and the network must be connected with no edges crossing.
// Tracing follows Euler: 0 odd vertices → start anywhere; exactly 2 → start at an odd vertex; more → impossible.
import type { GameQuestion, GameSet } from '../../src/lib/game/types'
import type { Ctx, Expect } from './ncm7-ch1'

type P = [number, number]
const SIDES: Record<string, number> = { triangle: 3, quadrilateral: 4, pentagon: 5, hexagon: 6, heptagon: 7, octagon: 8, nonagon: 9, decagon: 10, hendecagon: 11, dodecagon: 12 }
const dist = (a: P, b: P) => Math.hypot(a[0] - b[0], a[1] - b[1])
const orient = (a: P, b: P, c: P) => Math.sign((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]))

/** the network as drawn: vertex names, and edges as pairs of vertex indices */
function readNetwork(svg: string, ctx: Ctx) {
  const nodes = [...svg.matchAll(/<circle class="[^"]*\bnode\b[^"]*" cx="([\d.-]+)" cy="([\d.-]+)"/g)].map((m) => [Number(m[1]), Number(m[2])] as P)
  const labels = [...svg.matchAll(/<text class="[^"]*" x="([\d.-]+)" y="([\d.-]+)"[^>]*>([A-Z])<\/text>/g)].map((m) => ({ p: [Number(m[1]), Number(m[2])] as P, s: m[3] }))
  if (nodes.length < 3 || labels.length !== nodes.length) ctx.fail(`${nodes.length} vertices but ${labels.length} letters`)
  // each vertex takes the nearest letter, and no letter is used twice
  const names = nodes.map((p) => labels.reduce((b, l) => (dist(l.p, p) < dist(b.p, p) ? l : b)).s)
  if (new Set(names).size !== names.length) ctx.fail('two vertices read as the same letter')
  const at = (p: P) => {
    const i = nodes.findIndex((n) => dist(n, p) < 0.6)
    if (i < 0) ctx.fail('an edge ends away from every vertex')
    return i
  }
  const edges = [...svg.matchAll(/<line class="[^"]*\bedge\b[^"]*" x1="([\d.-]+)" y1="([\d.-]+)" x2="([\d.-]+)" y2="([\d.-]+)"/g)].map(
    (m) => [at([Number(m[1]), Number(m[2])]), at([Number(m[3]), Number(m[4])])] as [number, number],
  )
  const keys = edges.map(([a, b]) => [a, b].sort().join('-'))
  if (new Set(keys).size !== keys.length) ctx.fail('an edge is drawn twice')
  if (edges.some(([a, b]) => a === b)) ctx.fail('an edge is a loop')
  // edges that cross would look like an extra vertex
  for (let i = 0; i < edges.length; i++)
    for (let j = i + 1; j < edges.length; j++) {
      const [a, b] = edges[i].map((k) => nodes[k])
      const [c, d] = edges[j].map((k) => nodes[k])
      if (new Set([...edges[i], ...edges[j]]).size === 4 && orient(a, b, c) * orient(a, b, d) < 0 && orient(c, d, a) * orient(c, d, b) < 0) ctx.fail('two edges cross')
    }
  // an edge must not pass through a vertex it does not end at
  for (const [a, b] of edges)
    nodes.forEach((p, k) => {
      if (k === a || k === b) return
      const [u, v] = [nodes[a], nodes[b]]
      const t = ((p[0] - u[0]) * (v[0] - u[0]) + (p[1] - u[1]) * (v[1] - u[1])) / dist(u, v) ** 2
      const foot: P = [u[0] + t * (v[0] - u[0]), u[1] + t * (v[1] - u[1])]
      if (t > 0 && t < 1 && dist(foot, p) < 8) ctx.fail('an edge passes through another vertex')
    })
  // connected
  const seen = new Set([0])
  for (let grew = true; grew; ) {
    grew = false
    for (const [a, b] of edges)
      if (seen.has(a) !== seen.has(b)) {
        seen.add(a)
        seen.add(b)
        grew = true
      }
  }
  if (seen.size !== nodes.length) ctx.fail('the network is not connected')
  const degree = (i: number) => edges.reduce((n, [a, b]) => n + (a === i ? 1 : 0) + (b === i ? 1 : 0), 0)
  return { names, edges, degree }
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
  const words = ctx.plain(q.prompt)
  const polygon = () => {
    const m = words.match(/\b(triangle|quadrilateral|pentagon|hexagon|heptagon|octagon|nonagon|decagon|hendecagon|dodecagon)\b/)
    if (!m) throw new Error('no polygon named')
    return SIDES[m[1]]
  }
  const shown = q.options.map(ctx.plain)
  const one = (ok: boolean[], what: string): Expect => {
    const hits = ok.map((x, k) => (x ? k : -1)).filter((k) => k >= 0)
    if (hits.length !== 1) ctx.fail(`${hits.length} options ${what}`)
    return hits.length ? { text: shown[hits[0]] } : null
  }
  switch (kind) {
    case '4.03 possible': {
      // an equilateral triangle is always acute-angled; two obtuse or two right angles already reach 180°
      const can = shown.map((o) => !(/^Equilateral/.test(o) && !/acute/.test(o)) && !/^With two (obtuse|right)/.test(o))
      if (!shown.every((o) => /^(Equilateral|Isosceles|Scalene) and (acute|right|obtuse)-angled$|^With two (obtuse|right) angles$/.test(o))) ctx.fail('an option cannot be read')
      return /CAN/.test(words) ? one(can, 'can be drawn') : one(can.map((c) => !c), 'are impossible')
    }
    case '4.04 convex': {
      const a = [...words.matchAll(/(\d+)°/g)].map((m) => Number(m[1]))
      if (a.length !== 4 || a.reduce((x, y) => x + y) !== 360) ctx.fail('the four angles do not add to 360°')
      return { text: a.every((x) => x < 180) ? 'Yes: every angle is less than 180°' : 'No: one angle is more than 180°' }
    }
    case '4.07 sum':
      return { text: `${(polygon() - 2) * 180}°` }
    case '4.07 regular': {
      const n = polygon()
      const each = ((n - 2) * 180) / n
      if (!Number.isInteger(each)) ctx.fail('the angle is not a whole number of degrees')
      return { text: `${each}°` }
    }
    case '4.07 sides': {
      const s = Number(words.match(/angle sum of ([\d\s]+)°/)![1].replace(/\s/g, ''))
      if (s % 180 !== 0) ctx.fail('the angle sum is not a multiple of 180°')
      return { v: s / 180 + 2 }
    }
    case '4.08 degree': {
      const g = readNetwork(q.diagram ?? '', ctx)
      const name = words.match(/degree of vertex ([A-Z])\b/)![1]
      const i = g.names.indexOf(name)
      if (i < 0) throw new Error(`no vertex ${name} in the drawing`)
      return { v: g.degree(i) }
    }
    case '4.08 trace': {
      const g = readNetwork(q.diagram ?? '', ctx)
      const odd = g.names.filter((_, i) => g.degree(i) % 2 === 1).length
      if (odd % 2 !== 0) ctx.fail('an odd number of odd vertices (impossible)')
      return { text: odd === 0 ? 'Yes, starting anywhere' : odd === 2 ? 'Yes, but only from an odd vertex' : 'No: more than 2 odd vertices' }
    }
  }
  ctx.fail('no independent check for this kind of question')
  return null
}
