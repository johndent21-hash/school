// Independent answers for the NCM 9 Chapter 4 (Trigonometry) class games, used by tests/games.test.ts.
// Triangles are read from the drawing: the right-angle mark gives the right angle, the angle label gives the marked
// angle (its drawn size must match a degree label, or the ratio of the labelled sides), and each side label is matched
// to the side it sits beside. The hypotenuse is the side away from the right angle, the opposite side the one away
// from the marked angle, the adjacent side the third. From those roles this file writes the expected ratio, equation
// or length itself. Degrees and minutes, bearings and the worded problems are worked from the numbers in the question.
import type { GameQuestion, GameSet } from '../../src/lib/game/types'
import type { Ctx, Expect } from './ncm7-ch1'

type P = [number, number]
type Role = 'opp' | 'adj' | 'hyp'
const NUMS = '(-?[\\d.]+)'
const dist = (a: P, b: P) => Math.hypot(a[0] - b[0], a[1] - b[1])
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
const texts = (svg: string) =>
  [...svg.matchAll(new RegExp(`<text class="([^"]*)" x="${NUMS}" y="${NUMS}"[^>]*>(.*?)</text>`, 'g'))].map((m) => ({ cls: m[1], p: [+m[2], +m[3]] as P, s: m[4].replace(/<[^>]*>/g, '').trim() }))
const pad3 = (x: number) => String(x).padStart(3, '0')

/** the triangle: each role's label (or undefined), the marked angle's label and its drawn size */
function readTri(svg: string, ctx: Ctx) {
  const pts = svg.match(/<polygon class="sh" points="([^"]*)"/)![1].split(' ').map((s) => s.split(',').map(Number) as P)
  const rm = svg.match(new RegExp(`<path class="rm" d="M${NUMS},${NUMS} L${NUMS},${NUMS} L${NUMS},${NUMS}"`))!
  const rmMid: P = [(+rm[1] + +rm[5]) / 2, (+rm[2] + +rm[6]) / 2]
  const R = pts.reduce((b, p, i) => (dist(p, rmMid) < dist(pts[b], rmMid) ? i : b), 0)
  const T = texts(svg)
  const angT = T.find((t) => /\bang\b/.test(t.cls))!
  const A = pts.reduce((b, p, i) => (i !== R && (b === R || dist(p, angT.p) < dist(pts[b], angT.p)) ? i : b), R === 0 ? 1 : 0)
  if (A === R) throw new Error('the angle mark is at the right angle')
  const O = [0, 1, 2].find((i) => i !== R && i !== A)!
  // the drawn size of the marked angle
  const v1 = [pts[R][0] - pts[A][0], pts[R][1] - pts[A][1]]
  const v2 = [pts[O][0] - pts[A][0], pts[O][1] - pts[A][1]]
  const drawn = (Math.acos((v1[0] * v2[0] + v1[1] * v2[1]) / (Math.hypot(v1[0], v1[1]) * Math.hypot(v2[0], v2[1]))) * 180) / Math.PI
  const rightDrawn = (() => {
    const a = [pts[A][0] - pts[R][0], pts[A][1] - pts[R][1]]
    const c = [pts[O][0] - pts[R][0], pts[O][1] - pts[R][1]]
    return Math.abs(a[0] * c[0] + a[1] * c[1]) / (Math.hypot(a[0], a[1]) * Math.hypot(c[0], c[1])) < 0.005
  })()
  if (!rightDrawn) ctx.fail('the right angle is not drawn as a right angle')
  const sideOf: Record<Role, [number, number]> = { hyp: [A, O], opp: [R, O], adj: [R, A] }
  const labels: Partial<Record<Role, string>> = {}
  for (const t of T.filter((x) => /\bside\b/.test(x.cls))) {
    const role = (Object.keys(sideOf) as Role[]).reduce((best, r) => {
      const m = (k: Role): P => [(pts[sideOf[k][0]][0] + pts[sideOf[k][1]][0]) / 2, (pts[sideOf[k][0]][1] + pts[sideOf[k][1]][1]) / 2]
      return dist(t.p, m(r)) < dist(t.p, m(best)) ? r : best
    })
    if (labels[role]) ctx.fail('two labels on one side')
    labels[role] = t.s
  }
  return { labels, mark: angT.s, drawn }
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
  const words = ctx.plain(q.prompt).replace(/\s+([.?,)])/g, '$1')
  const tri = () => readTri(svg, ctx)
  /** labelled sides must fit the drawn angle (tan of the drawn angle = opposite ÷ adjacent, and so on) */
  const fitsDrawing = (L: Partial<Record<Role, string>>, drawn: number) => {
    const n = (r: Role) => Number(L[r])
    const t = Math.tan((drawn * Math.PI) / 180)
    const ok = L.opp && L.adj ? Math.abs(n('opp') / n('adj') - t) < 0.02 * t : L.opp && L.hyp ? Math.abs(n('opp') / n('hyp') - Math.sin((drawn * Math.PI) / 180)) < 0.01 : L.adj && L.hyp ? Math.abs(n('adj') / n('hyp') - Math.cos((drawn * Math.PI) / 180)) < 0.01 : true
    if (!ok) ctx.fail('the side labels do not fit the drawn angle')
  }
  switch (kind) {
    case '4.01 side': {
      const { labels, drawn } = tri()
      fitsDrawing(labels, drawn)
      const role: Role = /hypotenuse/.test(words) ? 'hyp' : /opposite/.test(words) ? 'opp' : 'adj'
      return { text: labels[role]! }
    }
    case '4.02 ratio': {
      const { labels, drawn } = tri()
      fitsDrawing(labels, drawn)
      const f = words.match(/Find (sin|cos|tan) θ/)![1]
      const [top, bottom] = f === 'sin' ? ['opp', 'hyp'] : f === 'cos' ? ['adj', 'hyp'] : ['opp', 'adj']
      const [a, c] = [Number(labels[top as Role]), Number(labels[bottom as Role])]
      const g = gcd(a, c)
      return { text: `(${a / g}/${c / g})` }
    }
    case '4.03 similar': {
      const m = words.match(/opposite (\d+), adjacent (\d+), hypotenuse (\d+)\. In a similar triangle the (\w+) is (\d+)\. Find its (\w+)\./)!
      const len: Record<string, number> = { opposite: +m[1], adjacent: +m[2], hypotenuse: +m[3] }
      if (len.opposite ** 2 + len.adjacent ** 2 !== len.hypotenuse ** 2) ctx.fail('the first triangle is not right-angled')
      return { v: (len[m[6]] * Number(m[5])) / len[m[4]] }
    }
    case '4.04 dm': {
      let m = words.match(/Write (\d+(?:\.\d+)?)° in degrees and minutes/)
      if (m) {
        const x = Number(m[1])
        const d = Math.floor(x)
        const min = Math.round((x - d) * 60)
        if (Math.abs((x - d) * 60 - min) > 1e-9) ctx.fail('not a whole number of minutes')
        return { text: `${d}°${min}′` }
      }
      m = words.match(/Write (\d+)°(\d+)′ in degrees, as a decimal/)!
      return { text: `${Number(m[1]) + Number(m[2]) / 60}°` }
    }
    case '4.04 round': {
      const m = words.match(/Round (\d+)°(\d+)′ to the nearest degree/)!
      if (Number(m[2]) === 30) ctx.fail('exactly half way')
      return { text: `${Number(m[1]) + (Number(m[2]) > 30 ? 1 : 0)}°` }
    }
    case '4.05 numer':
    case '4.06 numer':
    case '4.06 denom': {
      const { labels, mark, drawn } = tri()
      const a = Number(mark.replace('°', ''))
      if (Math.abs(drawn - a) > 0.5) ctx.fail(`the ${a}° angle is drawn as ${drawn.toFixed(1)}°`)
      const x = (Object.keys(labels) as Role[]).find((r) => labels[r] === 'x')!
      const known = (Object.keys(labels) as Role[]).find((r) => labels[r] !== 'x')!
      const k = labels[known]
      const f = (['sin', 'cos', 'tan'] as const).find((g) => {
        const pair = g === 'sin' ? ['opp', 'hyp'] : g === 'cos' ? ['adj', 'hyp'] : ['opp', 'adj']
        return pair.includes(x) && pair.includes(known)
      })!
      const top = f === 'cos' ? 'adj' : 'opp'
      const want = x === top ? `x = ${k} ${f} ${a}°` : `x = ${k} ÷ ${f} ${a}°`
      if (kind.endsWith('denom') !== (x !== top)) ctx.fail('x is not where this kind puts it')
      return { text: want }
    }
    // calculator questions: worked out here with Math.sin etc. from what the page shows, then rounded
    case '4.04 calcRatio': {
      const m = words.match(/find (sin|cos|tan) (\d+)°, correct to 4 decimal places/)!
      const r = (Number(m[2]) * Math.PI) / 180
      const v = m[1] === 'sin' ? Math.sin(r) : m[1] === 'cos' ? Math.cos(r) : Math.tan(r)
      return { text: v.toFixed(4) }
    }
    case '4.05 calcSide':
    case '4.06 calcSide':
    case '4.06 calcDiv': {
      if (!/correct to 1 decimal place/.test(words)) ctx.fail('the rounding is not stated')
      const { labels, mark, drawn } = tri()
      const a = Number(mark.replace('°', ''))
      if (Math.abs(drawn - a) > 0.5) ctx.fail(`the ${a}° angle is drawn as ${drawn.toFixed(1)}°`)
      const x = (Object.keys(labels) as Role[]).find((r) => labels[r] === 'x')!
      const known = (Object.keys(labels) as Role[]).find((r) => labels[r] !== 'x')!
      const k = Number(labels[known])
      // lengths from the angle: hyp = 1, opp = sin a, adj = cos a; x is in proportion to the known side
      const r = (a * Math.PI) / 180
      const len: Record<Role, number> = { hyp: 1, opp: Math.sin(r), adj: Math.cos(r) }
      const v = (k * len[x]) / len[known]
      if (kind.endsWith('calcDiv') !== (x === 'hyp' || (x === 'adj' && known === 'opp'))) ctx.fail('x is not where this kind puts it')
      if (Math.abs(((v * 10) % 1) - 0.5) < 0.01) ctx.fail('too close to a rounding boundary')
      return { text: v.toFixed(1) }
    }
    case '4.07 calcAngle': {
      if (!/nearest degree/.test(words)) ctx.fail('the rounding is not stated')
      const { labels, drawn } = tri()
      const n = (s?: string) => (s === undefined ? undefined : Number(s))
      const [o, ad, h] = [n(labels.opp), n(labels.adj), n(labels.hyp)]
      // the angle from whichever two sides are given, by the cosine of the angle in a right triangle
      const th = (Math.atan2(o ?? Math.sqrt(h! ** 2 - ad! ** 2), ad ?? Math.sqrt(h! ** 2 - o! ** 2)) * 180) / Math.PI
      if (Math.abs(drawn - th) > 0.5) ctx.fail(`θ = ${th.toFixed(1)}° is drawn as ${drawn.toFixed(1)}°`)
      return { text: `${Math.round(th)}°` }
    }
    case '4.07 angle': {
      const { labels, drawn } = tri()
      fitsDrawing(labels, drawn)
      const f = labels.opp && labels.hyp ? 'sin' : labels.adj && labels.hyp ? 'cos' : 'tan'
      const [top, bottom] = f === 'sin' ? [labels.opp, labels.hyp] : f === 'cos' ? [labels.adj, labels.hyp] : [labels.opp, labels.adj]
      return { text: `θ = ${f}⁻¹(${top}/${bottom})` }
    }
    case '4.08 depression': {
      const a = words.match(/is (\d+)°\./)![1]
      return { text: `${a}°` }
    }
    case '4.08 height': {
      const a = words.match(/elevation of the top is (\d+)°/)![1]
      let m = words.match(/stands (\d+) m from the base/)
      if (m) return { text: `h = ${m[1]} tan ${a}°` }
      m = words.match(/tower is (\d+) m tall/)!
      return { text: `d = ${m[1]} ÷ tan ${a}°` }
    }
    case '4.09 toTrue': {
      const m = words.match(/compass bearing ([NS])(\d+)°([EW])/)!
      const a = Number(m[2])
      const t = m[1] === 'N' ? (m[3] === 'E' ? a : 360 - a) : m[3] === 'E' ? 180 - a : 180 + a
      return { text: `${pad3(t)}°T` }
    }
    case '4.09 back': {
      const t = Number(words.match(/bearing of B from A is (\d+)°T/)![1])
      return { text: `${pad3((t + 180) % 360)}°T` }
    }
    case '4.10 component': {
      const m = words.match(/sails (\d+) km on a bearing of (\d+)°T\. Which expression gives how far (east|north)/)!
      const t = Number(m[2])
      return { text: `${m[1]} ${m[3] === 'east' ? 'sin' : 'cos'} ${t}°` }
    }
    case '4.10 distance': {
      const m = words.match(/cycles (\d+) km due (\w+), then (\d+) km due (\w+)\./)!
      const perpendicular = (['north', 'south'].includes(m[2]) ? 1 : 0) !== (['north', 'south'].includes(m[4]) ? 1 : 0)
      if (!perpendicular) ctx.fail('the two legs are not at right angles')
      return { text: `${Math.hypot(Number(m[1]), Number(m[3]))} km` }
    }
  }
  ctx.fail('no independent check for this kind of question')
  return null
}
