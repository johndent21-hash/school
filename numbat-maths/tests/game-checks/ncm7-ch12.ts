// Independent answers for the Chapter 12 (Rates, ratio and time) class games, used by tests/games.test.ts.
// Ratios are simplified with this file's own HCF and unit table; rates, unit prices and trip times are worked out
// from the numbers in the question; travel graphs are read back off their axes; timetables cell by cell; clock
// times are turned into minutes after midnight here and back again.
import type { GameQuestion, GameSet } from '../../src/lib/game/types'
import type { Ctx, Expect } from './ncm7-ch1'

const gcd = (a: number, c: number): number => (c === 0 ? a : gcd(c, a % c))
const ratio = (a: number, b: number) => `${a / gcd(a, b)} : ${b / gcd(a, b)}`
const NUM = '(-?[\\d.]+)'
const texts = (svg: string) =>
  [...svg.matchAll(new RegExp(`<text class="([^"]*)" x="${NUM}" y="${NUM}"[^>]*>(.*?)</text>`, 'g'))].map((m) => ({
    cls: m[1],
    x: Number(m[2]),
    y: Number(m[3]),
    s: m[4].replace(/<[^>]*>/g, ''),
  }))
const cents = (x: number) => `$${(Math.round(x * 100) / 100).toFixed(2)}`
const span = (min: number) => (min < 60 ? `${min} min` : min % 60 === 0 ? `${min / 60} h` : `${Math.floor(min / 60)} h ${min % 60} min`)
/** "5:50 p.m." → minutes after midnight */
function from12(s: string): number {
  const m = s.match(/^(\d{1,2}):(\d\d) (a\.m\.|p\.m\.)$/)
  if (!m) throw new Error(`not a 12-hour time: "${s}"`)
  const h = Number(m[1]) % 12
  return (h + (m[3] === 'p.m.' ? 12 : 0)) * 60 + Number(m[2])
}
const to12 = (min: number) => {
  const h = Math.floor(min / 60)
  return `${h % 12 === 0 ? 12 : h % 12}:${String(min % 60).padStart(2, '0')} ${h < 12 ? 'a.m.' : 'p.m.'}`
}
const from24 = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3, 5))
const to24 = (min: number) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`
/** sizes of the units the ratio questions use, in the smaller unit */
const SIZE: Record<string, number> = { cm: 1, m: 100, g: 1, kg: 1000, min: 1, h: 60, c: 1, $: 100 }

export function rework(set: GameSet, q: GameQuestion, ctx: Ctx): Expect {
  const kind = `${set.exercise} ${q.meta.t}`
  let want: Expect = null
  try {
    want = solve(kind, q, ctx)
  } catch (e) {
    ctx.fail(`could not be read: ${(e as Error).message}`)
    return null
  }
  if (want && 'text' in want && !['12.05 best'].includes(kind)) {
    if (!ctx.plain(q.why).replace(/\s/g, '').includes(want.text.replace(/\s/g, ''))) ctx.fail(`the explanation does not reach ${want.text}`)
  }
  return want
}

function solve(kind: string, q: GameQuestion, ctx: Ctx): Expect {
  const svg = q.diagram ?? ''
  const words = ctx.plain(q.prompt)
  const bigText = ctx.plain(q.prompt.match(/<div class="big">(.*?)<\/div>/)?.[1] ?? '')
  const shown = q.options.map(ctx.plain)

  switch (kind) {
    case '12.01 shaded': {
      const all = (svg.match(/class="fpart/g) ?? []).length
      const on = (svg.match(/class="fpart on"/g) ?? []).length
      return { text: `${on} : ${all - on}` }
    }
    case '12.01 order': {
      const m = words.match(/has (\d+) boys and (\d+) girls\. What is the ratio of (boys|girls) to (boys|girls)\?/)!
      const n: Record<string, string> = { boys: m[1], girls: m[2] }
      return { text: `${n[m[3]]} : ${n[m[4]]}` }
    }
    case '12.02 simplify': {
      const m = bigText.match(/^(\d+) : (\d+)$/)!
      return { text: ratio(Number(m[1]), Number(m[2])) }
    }
    case '12.02 equiv': {
      const m = bigText.match(/^(\d+) : (\d+) = (□|\d+) : (□|\d+)$/)!
      const [a, b] = [Number(m[1]), Number(m[2])]
      const v = m[3] === '□' ? (a * Number(m[4])) / b : (b * Number(m[3])) / a
      if (!Number.isInteger(v)) ctx.fail('the box is not a whole number')
      return { v }
    }
    case '12.02 units': {
      const m = words.match(/ratio (\$?)(\d+) ?(cm|m|g|kg|min|h|c) : (\$?)(\d+) ?(cm|m|g|kg|min|h)?$/)!
      const left = Number(m[2]) * SIZE[m[1] || m[3]]
      const right = Number(m[5]) * SIZE[m[4] || m[6]]
      return { text: ratio(left, right) }
    }
    case '12.03 part': {
      const m = words.match(/ratio of boys to girls in a club is (\d+) : (\d+)\. There are (\d+) boys/)!
      return { v: (Number(m[3]) / Number(m[1])) * Number(m[2]) }
    }
    case '12.03 share': {
      const m = words.match(/\$(\d+) is shared in the ratio (\d+) : (\d+)\. How much is the (larger|smaller) share\?/)!
      const [t, a, b] = [Number(m[1]), Number(m[2]), Number(m[3])]
      const part = t / (a + b)
      return { text: `$${(m[4] === 'larger' ? Math.max(a, b) : Math.min(a, b)) * part}` }
    }
    case '12.04 rate': {
      let m = words.match(/travels (\d+) km in (\d+) hours/)
      if (m) return { text: `${Number(m[1]) / Number(m[2])} km/h` }
      m = words.match(/earns \$(\d+) in (\d+) hours/)
      if (m) return { text: `$${Number(m[1]) / Number(m[2])}/h` }
      m = words.match(/fills (\d+) L in (\d+) minutes/)
      if (m) return { text: `${Number(m[1]) / Number(m[2])} L/min` }
      m = words.match(/prints (\d+) pages in (\d+) minutes/)!
      return { text: `${Number(m[1]) / Number(m[2])} pages/min` }
    }
    case '12.05 unit': {
      const m = words.match(/^(\d+) .+? cost \$([\d.]+)\. What/)!
      return { text: cents(Number(m[2]) / Number(m[1])) }
    }
    case '12.05 best': {
      const each = shown.map((o) => {
        const m = o.match(/^(\d+) for \$([\d.]+)$/)!
        return Number(m[2]) / Number(m[1])
      })
      const lo = Math.min(...each)
      if (each.filter((x) => Math.abs(x - lo) < 1e-9).length !== 1) ctx.fail('two packs tie')
      return { text: shown[each.indexOf(lo)] }
    }
    case '12.06 apply': {
      let m = words.match(/types (\d+) words per minute\. How many words in (\d+) minutes/)
      if (m) return { text: `${Number(m[1]) * Number(m[2])} words` }
      m = words.match(/drips (\d+) mL each hour\. How much water drips in (\d+) hours/)
      if (m) return { text: `${Number(m[1]) * Number(m[2])} mL` }
      m = words.match(/travels at (\d+) km\/h\. How far does it go in (\d+) hours/)!
      return { text: `${Number(m[1]) * Number(m[2])} km` }
    }
    case '12.06 time': {
      const m = words.match(/travels (\d+) km at an average speed of (\d+) km\/h/)!
      const min = (Number(m[1]) / Number(m[2])) * 60
      if (!Number.isInteger(min)) ctx.fail('not a whole number of minutes')
      return { text: span(min) }
    }
    case '12.07 far':
    case '12.07 rest':
    case '12.07 speed': {
      const t = texts(svg)
      const xs = t.filter((c) => /\btx\b/.test(c.cls)).map((c) => ({ v: Number(c.s), p: c.x }))
      const ys = t.filter((c) => /\bty\b/.test(c.cls)).map((c) => ({ v: Number(c.s), p: c.y }))
      const fit = (l: { v: number; p: number }[]) => {
        const [a, b] = [l[0], l[l.length - 1]]
        const k = (b.p - a.p) / (b.v - a.v)
        return (p: number) => a.v + (p - a.p) / k
      }
      const [tx, dy] = [fit(xs), fit(ys)]
      const pts = svg
        .match(/<polyline class="plot" points="([^"]*)"/)![1]
        .split(' ')
        .map((s) => s.split(',').map(Number))
        .map(([x, y]) => [Math.round(tx(x) * 10) / 10, Math.round(dy(y) * 10) / 10])
      if (kind === '12.07 far') return { text: `${Math.max(...pts.map((p) => p[1]))} km` }
      if (kind === '12.07 rest') {
        const flats = pts.slice(1).map((p, i) => (p[1] === pts[i][1] && p[1] > 0 ? p[0] - pts[i][0] : 0)).filter((x) => x > 0)
        if (flats.length !== 1) ctx.fail(`${flats.length} stops on the graph`)
        return { text: `${flats[0]} ${flats[0] === 1 ? 'hour' : 'hours'}` }
      }
      const out = /way out/.test(words)
      const segs = pts.slice(1).map((p, i) => ({ dt: p[0] - pts[i][0], dd: p[1] - pts[i][1] }))
      const seg = segs.find((s) => (out ? s.dd > 0 : s.dd < 0))!
      return { text: `${Math.abs(seg.dd) / seg.dt} km/h` }
    }
    case '12.08 convert': {
      let m = words.match(/in (\d+) h (\d+) min\?/)
      if (m) return { v: Number(m[1]) * 60 + Number(m[2]) }
      m = words.match(/in ([\d.]+) hours\?/)!
      return { v: Math.round(Number(m[1]) * 60 * 1000) / 1000 }
    }
    case '12.08 decimal': {
      const m = words.match(/Write (\d+) h (\d+) min as a decimal/)!
      return { text: `${Number(m[1]) + Number(m[2]) / 60} h` }
    }
    case '12.09 to12':
      return { text: to12(from24(bigText)) }
    case '12.09 to24': {
      const m = words.match(/Write (.+?) in 24-hour time/)!
      return { text: to24(from12(m[1])) }
    }
    case '12.10 diff': {
      const m = words.match(/from (.+?) to (.+?)\?/)!
      return { text: span(from12(m[2]) - from12(m[1])) }
    }
    case '12.11 trip': {
      const t = texts(svg)
      const stops = t.filter((c) => /\bstop\b/.test(c.cls))
      const times = t.filter((c) => /\btime\b/.test(c.cls))
      const at = (name: string) => from24(times.find((c) => Math.abs(c.y - stops.find((s) => s.s === name)!.y) < 1)!.s)
      const m = words.match(/from (.+?) to (.+?)\?/)!
      const d = at(m[2]) - at(m[1])
      if (d <= 0) ctx.fail('the times do not go forward')
      return { text: span(d) }
    }
    case '12.12 zones': {
      const m = words.match(/^(\w+) is UTC \+ (\d+) and (\w+) is UTC \+ (\d+)\. When it is (.+?) in \1, what time is it in \3\?/)!
      return { text: to12(from12(m[5]) + (Number(m[4]) - Number(m[2])) * 60) }
    }
  }
  ctx.fail('no independent check for this kind of question')
  return null
}
