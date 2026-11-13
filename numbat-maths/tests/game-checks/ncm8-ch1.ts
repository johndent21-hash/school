// Independent answers for the NCM 8 Chapter 1 (Pythagoras' theorem) class games, used by tests/games.test.ts.
// Each triangle is measured: the right-angle mark gives the right angle, so the side opposite it is the hypotenuse;
// each side label is matched to the side it sits beside; numbered sides must be drawn in proportion. The unknown is
// then worked out here (add the squares for the hypotenuse, subtract them for a shorter side). Word problems,
// triads and side-length tests are worked from the numbers in the question.
import type { GameQuestion, GameSet } from '../../src/lib/game/types'
import type { Ctx, Expect } from './ncm7-ch1'

type P = [number, number]
const NUM = '(-?[\\d.]+)'
const texts = (svg: string) =>
  [...svg.matchAll(new RegExp(`<text class="([^"]*)" x="${NUM}" y="${NUM}"[^>]*>(.*?)</text>`, 'g'))].map((m) => ({
    cls: m[1],
    p: [Number(m[2]), Number(m[3])] as P,
    s: m[4].replace(/<[^>]*>/g, ''),
  }))
const dist = (a: P, b: P) => Math.hypot(a[0] - b[0], a[1] - b[1])
const isSquare = (n: number) => Number.isInteger(Math.sqrt(n))

/** a drawn right-angled triangle: its corners, which one is the right angle, and each side's label and length */
function readTriangle(svg: string, ctx: Ctx) {
  const pts = svg
    .match(/<polygon class="sh" points="([^"]*)"/)![1]
    .split(' ')
    .map((s) => s.split(',').map(Number) as P)
  // the right-angle mark's corner is the polygon corner it sits in
  const rm = svg.match(/<path class="rm" d="M([\d.-]+),([\d.-]+) L([\d.-]+),([\d.-]+) L([\d.-]+),([\d.-]+)"/)!
  const mid: P = [(Number(rm[1]) + Number(rm[5])) / 2, (Number(rm[2]) + Number(rm[6])) / 2]
  const r = pts.reduce((b, p, i) => (dist(p, mid) < dist(pts[b], mid) ? i : b), 0)
  const sides = [0, 1, 2].map((i) => ({ a: i, b: (i + 1) % 3, len: dist(pts[i], pts[(i + 1) % 3]), label: null as string | null }))
  for (const t of texts(svg).filter((x) => /\bside\b/.test(x.cls))) {
    const near = sides.reduce((best, s) => {
      const m: P = [(pts[s.a][0] + pts[s.b][0]) / 2, (pts[s.a][1] + pts[s.b][1]) / 2]
      const bm: P = [(pts[best.a][0] + pts[best.b][0]) / 2, (pts[best.a][1] + pts[best.b][1]) / 2]
      return dist(t.p, m) < dist(t.p, bm) ? s : best
    })
    if (near.label) ctx.fail('two labels on one side')
    near.label = t.s.trim()
  }
  const hyp = sides.find((s) => s.a !== r && s.b !== r)!
  const angle = (() => {
    const [u, v] = [pts[(r + 1) % 3], pts[(r + 2) % 3]]
    const d1 = [u[0] - pts[r][0], u[1] - pts[r][1]]
    const d2 = [v[0] - pts[r][0], v[1] - pts[r][1]]
    return (Math.acos((d1[0] * d2[0] + d1[1] * d2[1]) / (Math.hypot(d1[0], d1[1]) * Math.hypot(d2[0], d2[1]))) * 180) / Math.PI
  })()
  if (Math.abs(angle - 90) > 0.3) ctx.fail(`the marked right angle is drawn as ${angle.toFixed(1)}°`)
  // numbered sides drawn in proportion
  const numbered = sides.filter((s) => s.label && /^\d+/.test(s.label))
  if (numbered.length >= 2) {
    const k = numbered[0].len / parseFloat(numbered[0].label!)
    if (numbered.some((s) => Math.abs(s.len / parseFloat(s.label!) / k - 1) > 0.02)) ctx.fail('the sides are not drawn to scale')
  }
  return { pts, r, sides, hyp }
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
  if (want && 'text' in want && !['1.05 which', '1.06 which', '1.06 test', '1.07 multiple', '1.02 rule'].includes(kind)) {
    if (!ctx.plain(q.why).replace(/\s/g, '').includes(want.text.replace(/\s/g, ''))) ctx.fail(`the explanation does not reach ${want.text}`)
  }
  return want
}

function solve(kind: string, q: GameQuestion, ctx: Ctx): Expect {
  const svg = q.diagram ?? ''
  const words = ctx.plain(q.prompt)
  const bigText = ctx.plain(q.prompt.match(/<div class="big">(.*?)<\/div>/)?.[1] ?? '')
  const shown = q.options.map(ctx.plain)
  const one = (ok: boolean[], what: string): Expect => {
    const hits = ok.map((x, k) => (x ? k : -1)).filter((k) => k >= 0)
    if (hits.length !== 1) ctx.fail(`${hits.length} options ${what}`)
    return hits.length ? { text: shown[hits[0]] } : null
  }
  /** the unknown side worked out from the other two: hypotenuse → add the squares, shorter side → subtract */
  const unknown = () => {
    const t = readTriangle(svg, ctx)
    const u = t.sides.find((s) => s.label && /^[a-z]\b/.test(s.label))!
    const known = t.sides.filter((s) => s !== u).map((s) => parseFloat(s.label!))
    const sq2 = u === t.hyp ? known[0] ** 2 + known[1] ** 2 : Math.abs(known[0] ** 2 - known[1] ** 2)
    // the unknown must also look right: drawn to the same scale as the known sides
    const k = t.sides.filter((s) => s !== u)[0].len / known[0]
    if (Math.abs(u.len / k - Math.sqrt(sq2)) > 0.02 * Math.sqrt(sq2)) ctx.fail('the unknown side is not drawn to scale')
    return { sq2, isHyp: u === t.hyp }
  }

  switch (kind) {
    case '1.01 sqrt': {
      const n = Number(bigText.replace(/[√\s]/g, ''))
      if (!isSquare(n)) ctx.fail('not a perfect square')
      return { v: Math.sqrt(n) }
    }
    case '1.01 between': {
      const n = Number(words.match(/√\s*(\d+)/)![1])
      const lo = Math.floor(Math.sqrt(n))
      return { text: `${lo} and ${lo + 1}` }
    }
    case '1.02 hyp': {
      const t = readTriangle(svg, ctx)
      const names = texts(svg).filter((x) => /\bvx\b/.test(x.cls))
      const nameAt = (i: number) => names.reduce((b, n) => (dist(n.p, t.pts[i]) < dist(b.p, t.pts[i]) ? n : b)).s
      const h = [nameAt(t.hyp.a), nameAt(t.hyp.b)].sort().join('')
      return { text: h }
    }
    case '1.02 rule': {
      const t = readTriangle(svg, ctx)
      const h = t.hyp.label!
      const legs = t.sides.filter((s) => s !== t.hyp).map((s) => s.label!)
      return one(
        shown.map((o) => {
          const m = o.replace(/\s/g, '').match(/^(\w)\^2=(\w)\^2\+(\w)\^2$/)
          return !!m && m[1] === h && [m[2], m[3]].sort().join() === legs.sort().join()
        }),
        "are Pythagoras' theorem",
      )
    }
    case '1.03 hyp':
    case '1.04 short':
    case '1.05 find': {
      const u = unknown()
      if (!isSquare(u.sq2)) ctx.fail('the answer is not a whole number')
      return { v: Math.sqrt(u.sq2) }
    }
    case '1.03 exact': {
      const u = unknown()
      if (isSquare(u.sq2)) ctx.fail('the exact answer is a whole number')
      return { text: `√${u.sq2}` }
    }
    case '1.05 which': {
      const u = unknown()
      return { text: u.isHyp ? 'Add their squares' : 'Subtract their squares' }
    }
    case '1.06 which':
      return one(
        shown.map((o) => {
          const s = o.split(',').map(Number).sort((a, b) => a - b)
          return s[0] ** 2 + s[1] ** 2 === s[2] ** 2
        }),
        'make a right-angled triangle',
      )
    case '1.06 test': {
      const s = [...words.matchAll(/(\d+) cm/g)].map((m) => Number(m[1])).sort((a, b) => a - b)
      const yes = s[0] ** 2 + s[1] ** 2 === s[2] ** 2
      return { text: yes ? `Yes: ${s[0]}² + ${s[1]}² = ${s[2]}²` : `No: ${s[0]}² + ${s[1]}² ≠ ${s[2]}²` }
    }
    case '1.07 complete': {
      const parts = bigText.replace(/[{}\s]/g, '').split(',')
      const known = parts.filter((x) => x !== '?').map(Number)
      const at = parts.indexOf('?')
      const v = at === 2 ? Math.sqrt(known[0] ** 2 + known[1] ** 2) : Math.sqrt(known[1] ** 2 - known[0] ** 2)
      if (!Number.isInteger(v)) ctx.fail('the missing number is not whole')
      return { v }
    }
    case '1.07 multiple':
      return one(
        shown.map((o) => {
          const s = o.replace(/[{}\s]/g, '').split(',').map(Number).sort((a, b) => a - b)
          return s[0] ** 2 + s[1] ** 2 === s[2] ** 2
        }),
        'are triads',
      )
    case '1.08 problem': {
      let m = words.match(/A ladder (\d+) m long .+? foot is (\d+) m from the wall/)
      if (m) return { text: `${Math.sqrt(Number(m[1]) ** 2 - Number(m[2]) ** 2)} m` }
      m = words.match(/is (\d+) cm wide and (\d+) cm long\. How long is its diagonal/)
      if (m) return { text: `${Math.hypot(Number(m[1]), Number(m[2]))} cm` }
      m = words.match(/sails (\d+) km south, then (\d+) km east/)
      if (m) return { text: `${Math.hypot(Number(m[1]), Number(m[2]))} km` }
      m = words.match(/rises (\d+) m over a horizontal distance of (\d+) m/)!
      return { text: `${Math.hypot(Number(m[1]), Number(m[2]))} m` }
    }
  }
  ctx.fail('no independent check for this kind of question')
  return null
}
