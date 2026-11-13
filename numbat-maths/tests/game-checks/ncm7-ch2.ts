// Independent answers for the Chapter 2 (Angles) class games, used by tests/games.test.ts.
// Every answer is worked out from the drawing where there is one: the protractor's arms are measured, the angle
// sizes written on a drawing are checked against the angles they sit in, and the relationship between two marked
// angles (corresponding, alternate, co-interior, vertically opposite) is worked out from where they are drawn.
import type { GameQuestion, GameSet } from '../../src/lib/game/types'
import { angLabels, angleAt, dirOf, lineAngle, near, readLetters, readPoint, readTransversal, rightMarks, segs, sizeOfLabel, vxLabels } from '../lib/angle-read'
import type { Ctx, Expect } from './ncm7-ch1'

const deg = (x: number) => `${x}°`
const TYPE = (a: number) => (a < 90 ? 'Acute' : a === 90 ? 'Right' : a < 180 ? 'Obtuse' : a === 180 ? 'Straight' : a < 360 ? 'Reflex' : 'Revolution')

export function rework(set: GameSet, q: GameQuestion, ctx: Ctx): Expect {
  const m = q.meta as Record<string, any>
  const svg = q.diagram ?? ''
  /** only drawings of two lines and a transversal are read as such (three rays from a point also have three lines) */
  const isTv = /aria-label="[^"]*transversal/.test(svg)
  const has = (...xs: string[]) => xs.forEach((x) => !ctx.page.includes(x) && ctx.fail(`"${x}" is not on the page`))
  /** the unknown's angle on a drawing of rays from one point, or of two lines and a transversal */
  const unknownSize = () => {
    const u = angLabels(svg).find((l) => /^[a-z]°$/.test(l.s))
    if (!u) return ctx.fail('no unknown on the drawing'), NaN
    const tv = isTv ? readTransversal(svg) : null
    if (tv) return tv.spot(u.p).size
    const pt = readPoint(svg)
    return pt ? pt.gapAt(u.p).size : NaN
  }
  /** every size written on a drawing is the size of the angle it sits in */
  const sizesTrue = () => {
    const tv = isTv ? readTransversal(svg) : null
    const pt = tv ? null : readPoint(svg)
    for (const l of angLabels(svg)) {
      const s = sizeOfLabel(l.s)
      if (s === null) continue
      const drawn = tv ? tv.spot(l.p).size : pt!.gapAt(l.p).size
      if (!near(drawn, s)) ctx.fail(`label ${l.s} sits in an angle of ${drawn.toFixed(1)}°`)
    }
  }
  switch (`${set.exercise} ${m.t}`) {
    case '2.01 vertex':
      return { text: m.name[1] }
    case '2.01 name': {
      const r = readLetters(svg)!
      const mark = angLabels(svg).find((l) => l.s === '•')!
      const gap = r.gapAt(mark.p)
      const letterOf = (ray: { end: [number, number] }) => Object.keys(r.arms).find((k) => r.arms[k] === ray)!
      const [x, y] = [letterOf(gap.lo), letterOf(gap.hi)]
      // either order is a correct name; the option offered must be one of them
      const opts = q.options.map(ctx.plain)
      const ok = opts.filter((o) => o === `∠${x}${r.vertex}${y}` || o === `∠${y}${r.vertex}${x}`)
      if (ok.length !== 1) ctx.fail(`${ok.length} options name the marked angle`)
      return { text: ok[0] ?? '' }
    }
    case '2.01 adjacent': {
      const r = readLetters(svg)!
      const target = ctx.plain(q.prompt).match(/∠(\w{3})/)![1]
      const ok = q.options.map(ctx.plain).filter((o) => {
        const nm = o.slice(1)
        if (nm[1] !== r.vertex || target[1] !== r.vertex) return false
        const common = [nm[0], nm[2]].filter((k) => [target[0], target[2]].includes(k))
        if (common.length !== 1) return false
        const outer = [nm[0], nm[2], target[0], target[2]].filter((k) => k !== common[0])
        return near(r.angle(nm)! + r.angle(target)!, r.angle(outer[0] + r.vertex + outer[1])!)
      })
      if (ok.length !== 1) ctx.fail(`${ok.length} options are adjacent`)
      return { text: ok[0] ?? '' }
    }
    case '2.02 protractor': {
      const arms = segs(svg, 'ln hlstroke')
      const size = Math.round(angleAt(arms[0][0], arms[0][1], arms[1][1]))
      if (size !== m.angle) ctx.fail(`the arms are drawn ${size}° apart`)
      return { text: deg(size) }
    }
    case '2.02 estimate': {
      const ls = segs(svg)
      const size = Math.round((dirOf(ls[0][0], ls[1][1]) - dirOf(ls[0][0], ls[0][1]) + 360) % 360)
      const opts = q.options.map((o) => parseInt(ctx.plain(o)))
      const nearest = opts.reduce((a, c) => (Math.abs(c - size) < Math.abs(a - size) ? c : a))
      if (opts.some((o) => o !== nearest && Math.abs(o - size) < 25)) ctx.fail('another choice is too close')
      return { text: deg(nearest) }
    }
    case '2.02 reflex':
      has(deg(m.small))
      return { text: deg(360 - m.small) }
    case '2.03 size':
      has(deg(m.a))
      return { text: TYPE(m.a) }
    case '2.03 drawn': {
      const ls = segs(svg)
      const size = Math.round((dirOf(ls[0][0], ls[1][1]) - dirOf(ls[0][0], ls[0][1]) + 360) % 360)
      if ((rightMarks(svg) === 1) !== (size === 90)) ctx.fail('right-angle square wrong')
      return { text: TYPE(size) }
    }
    case '2.03 which': {
      const want = ctx.page.match(/is an? (acute|obtuse|reflex) angle/)?.[1]
      const ok = q.options.map(ctx.plain).filter((o) => TYPE(parseInt(o)).toLowerCase() === want)
      if (ok.length !== 1) ctx.fail(`${ok.length} options are ${want}`)
      return { text: ok[0] ?? '' }
    }
    case '2.03 turn': {
      const what = ctx.page.match(/(a quarter turn|a half turn|a full turn|three-quarters of a turn)/)?.[1]
      const size = { 'a quarter turn': 90, 'a half turn': 180, 'a full turn': 360, 'three-quarters of a turn': 270 }[what ?? '']
      return size ? { text: deg(size) } : (ctx.fail('turn not stated'), null)
    }
    case '2.04 complement':
      has(deg(m.a))
      return { text: deg(90 - m.a) }
    case '2.04 supplement':
      has(deg(m.a))
      return { text: deg(180 - m.a) }
    case '2.04 line':
    case '2.04 right':
    case '2.05 vertOpp':
    case '2.05 beside':
    case '2.05 point': {
      sizesTrue()
      // from the drawing, and from the numbers on it by the angle fact
      const shown = angLabels(svg).map((l) => sizeOfLabel(l.s)).filter((x): x is number => x !== null)
      const total = m.t === 'line' ? 180 : m.t === 'right' ? 90 : m.t === 'point' ? 360 : null
      const byFact = total !== null ? total - shown.reduce((a, c) => a + c, 0) : m.t === 'vertOpp' ? shown[0] : 180 - shown[0]
      const drawn = unknownSize()
      if (!near(drawn, byFact)) ctx.fail(`the unknown is drawn ${drawn.toFixed(1)}°, the angle fact gives ${byFact}`)
      return { v: byFact }
    }
    case '2.06 symbol':
      return { text: m.par ? 'is parallel to' : 'is perpendicular to' }
    case '2.06 relation': {
      const ls = segs(svg)
      const a = lineAngle(ls[0], ls[1])
      const vx = vxLabels(svg).map((l) => l.s)
      const [n1, n2] = [vx[0] + vx[1], vx[2] + vx[3]]
      return { text: a < 0.05 ? `${n1} ∥ ${n2}` : near(a, 90, 0.05) ? `${n1} ⊥ ${n2}` : 'Neither' }
    }
    case '2.07 letter':
    case '2.08 letter':
    case '2.09 letter': {
      const tv = readTransversal(svg)!
      const dotL = angLabels(svg).find((l) => l.s === '•')!
      const hits = angLabels(svg).filter((l) => /^[a-z]$/.test(l.s) && tv.relation(tv.spot(dotL.p), tv.spot(l.p)) === m.rel)
      if (hits.length !== 1) ctx.fail(`${hits.length} letters are ${m.rel}`)
      if (!tv.parallel) ctx.fail('lines not parallel')
      return { text: hits[0]?.s ?? '' }
    }
    case '2.07 find':
    case '2.08 find':
    case '2.09 find':
    case '2.10 find':
    case '2.11 value': {
      const tv = readTransversal(svg)!
      sizesTrue()
      const g = angLabels(svg).find((l) => sizeOfLabel(l.s) !== null)!
      const u = angLabels(svg).find((l) => /^[a-z]°$/.test(l.s))!
      const rel = tv.relation(tv.spot(g.p), tv.spot(u.p))
      const a = sizeOfLabel(g.s)!
      const want = rel === 'co-interior' ? 180 - a : rel === 'corresponding' || rel === 'alternate' ? a : NaN
      if (m.t === 'find' && !tv.parallel) ctx.fail('lines not parallel')
      if (set.exercise !== '2.10' && set.exercise !== '2.11' && rel !== m.rel) ctx.fail(`the angles are drawn ${rel}`)
      if (!near(tv.spot(u.p).size, want)) ctx.fail('the unknown is not drawn at that size')
      return { v: want }
    }
    case '2.10 name': {
      const tv = readTransversal(svg)!
      const [p1, p2] = angLabels(svg).filter((l) => l.s === '•').map((l) => tv.spot(l.p))
      const rel = tv.relation(p1, p2)
      return { text: rel[0].toUpperCase() + rel.slice(1) }
    }
    case '2.11 prove': {
      const tv = readTransversal(svg)!
      const [g1, g2] = angLabels(svg).filter((l) => sizeOfLabel(l.s) !== null)
      const [s1, s2] = [tv.spot(g1.p), tv.spot(g2.p)]
      const rel = tv.relation(s1, s2)
      const rule = tv.wouldBeParallel(s1, sizeOfLabel(g1.s)!, s2, sizeOfLabel(g2.s)!)
      if (rule !== tv.parallel) ctx.fail(`the angle rule says ${rule}, the drawing says ${tv.parallel}`)
      if (!tv.parallel) return { text: 'No' }
      return { text: rel === 'alternate' ? 'Yes: alternate angles are equal' : rel === 'corresponding' ? 'Yes: corresponding angles are equal' : 'Yes: co-interior angles add to 180°' }
    }
  }
  ctx.fail('no independent check for this kind of question')
  return null
}
