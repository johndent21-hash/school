// Independent answers for the NCM 8 Chapter 12 (Similar figures and surface area) class games, used by
// tests/games.test.ts. Similar-figure questions are worked from the lengths and angles in the question (a rectangle
// option is similar when both its sides are the same multiple of the original's). Surface areas are worked from the
// drawing's labels: a cube's one edge, a box's three edges (the formula is symmetrical, so which is which does not
// matter), and a triangular prism's four labels, where the three that form a right-angled triangle (a² + b² = c²) are
// the triangle's sides and the fourth is the length (two different readings would fail). Cylinders are read as in
// Chapter 5: the highlighted line is a radius or a diameter by its drawn length, and the height label is the one to
// the right of the cylinder.
import type { GameQuestion, GameSet } from '../../src/lib/game/types'
import type { Ctx, Expect } from './ncm7-ch1'

const NUMS = '(-?[\\d.]+)'
const val = (s: string) => Number(s.replace(/[\s ]/g, ''))
const labels = (svg: string) =>
  [...svg.matchAll(new RegExp(`<text class="dl side" x="${NUMS}" y="${NUMS}"[^>]*>([^<]*)</text>`, 'g'))].map((m) => {
    const s = m[3].replace(/ /g, ' ')
    const L = s.match(/^([\d.\s]+) (mm|cm|m)$/)
    if (!L) throw new Error(`not a length: "${s}"`)
    return { x: +m[1], y: +m[2], v: val(L[1]), u: L[2] }
  })

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
  const words = ctx.plain(q.prompt).replace(/\s+([.?,)])/g, '$1').replace(/\(\s+/g, '(')
  const shown = q.options.map(ctx.plain)
  const one = (ok: (o: string) => boolean, what: string): Expect => {
    const hits = shown.filter(ok)
    if (hits.length !== 1) ctx.fail(`${hits.length} options ${what}`)
    return hits.length ? { text: hits[0] } : null
  }
  switch (kind) {
    case '12.01 which': {
      const m = words.match(/A rectangle is ([\d.]+) cm by ([\d.]+) cm\./)!
      const [w, h] = [Number(m[1]), Number(m[2])]
      return one((o) => {
        const d = o.match(/^([\d.]+) cm by ([\d.]+) cm$/)
        return !!d && Math.abs(Number(d[1]) / w - Number(d[2]) / h) < 1e-9 && Number(d[1]) !== w
      }, 'are similar')
    }
    case '12.01 factor': {
      const m = words.match(/a side of ([\d.]+) cm becomes ([\d.]+) cm/)!
      return { v: Number(m[2]) / Number(m[1]) }
    }
    case '12.02 angle': {
      const m = words.match(/angle A = (\d+)°, angle B = (\d+)°/)!
      if (!/P matching A and Q matching B\. Find angle R/.test(words)) throw new Error('matching not stated')
      return { text: `${180 - Number(m[1]) - Number(m[2])}°` }
    }
    case '12.02 ratio': {
      const m = words.match(/sides of (\d+) cm and (\d+) cm/)!
      const k = Number(m[2]) / Number(m[1])
      if (!Number.isInteger(k)) ctx.fail('the ratio is not 1 : a whole number')
      return { text: `1 : ${k}` }
    }
    case '12.03 side': {
      const m = words.match(/AB = (\d+) cm, BC = (\d+) cm, PQ = (\d+) cm\. Find QR/)!
      if (!/AB matches PQ, BC matches QR/.test(words)) throw new Error('matching sides not stated')
      return { text: `${(Number(m[2]) * Number(m[3])) / Number(m[1])} cm` }
    }
    case '12.04 cube': {
      const L = labels(svg)
      if (L.length !== 1) ctx.fail('a cube with more than one label')
      return { v: 6 * L[0].v ** 2, unit: L[0].u + '²' }
    }
    case '12.04 box': {
      const L = labels(svg)
      if (L.length !== 3) ctx.fail(`${L.length} edges labelled`)
      const [a, b, c] = L.map((x) => x.v)
      return { v: 2 * (a * b + a * c + b * c), unit: L[0].u + '²' }
    }
    case '12.04 tri': {
      const L = labels(svg).map((x) => x.v)
      if (L.length !== 4) ctx.fail(`${L.length} lengths labelled`)
      const results = new Set<number>()
      for (let i = 0; i < 4; i++) {
        const rest = L.filter((_, k) => k !== i).sort((x, y) => x - y)
        if (rest[0] ** 2 + rest[1] ** 2 === rest[2] ** 2) results.add(rest[0] * rest[1] + (rest[0] + rest[1] + rest[2]) * L[i])
      }
      if (results.size !== 1) ctx.fail(`${results.size} ways to read the prism`)
      if (!/not drawn to scale/i.test(ctx.plain(q.note ?? ''))) ctx.fail('not said to be not to scale')
      return { v: [...results][0], unit: labels(svg)[0].u + '²' }
    }
    case '12.05 closed':
    case '12.05 curved':
    case '12.05 open': {
      const rx = Number(svg.match(/<ellipse class="sh sh2"[^>]* rx="([\d.]+)"/)![1])
      const cx = Number(svg.match(/<ellipse class="sh sh2" cx="([\d.]+)"/)![1])
      const ln = svg.match(new RegExp(`<line class="ln hlstroke" x1="${NUMS}" y1="${NUMS}" x2="${NUMS}" y2="${NUMS}"`))!
      const len = Math.hypot(+ln[1] - +ln[3], +ln[2] - +ln[4])
      const shows = Math.abs(len - rx) < 1 ? 'radius' : Math.abs(len - 2 * rx) < 1 ? 'diameter' : null
      if (!shows) ctx.fail('the labelled line is neither a radius nor a diameter')
      const L = labels(svg)
      const hl = L.find((t) => t.x > cx + rx)!
      const rl = L.find((t) => t !== hl)!
      const r = shows === 'diameter' ? rl.v / 2 : rl.v
      const h = hl.v
      if (!/in terms of π/.test(words)) ctx.fail('not asked in terms of π')
      const k = kind === '12.05 curved' ? 2 * r * h : kind === '12.05 open' ? r * r + 2 * r * h : 2 * r * r + 2 * r * h
      if (kind === '12.05 open' && !/open at the top/.test(words)) ctx.fail('the open end is not stated')
      return { v: k, unit: hl.u + '²', pi: true }
    }
  }
  ctx.fail('no independent check for this kind of question')
  return null
}
