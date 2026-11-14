// Independent answers for the Chapter 1 (Integers) class games, used by tests/games.test.ts.
// Each answer is worked out here from the numbers the question was made from, with plain JavaScript
// arithmetic, and the numbers are checked to be on the page. Diagrams are read back: the arrow on a
// number line is measured against the labelled ticks, and the thermometer mark against its scale.
import type { GameQuestion, GameSet } from '../../src/lib/game/types'

export type Expect = { v: number; unit?: string; pi?: boolean } | { text: string } | null
export interface Ctx {
  fail: (msg: string) => void
  /** the prompt and the diagram's words, as plain text */
  page: string
  plain: (h: string) => string
}

const n = (x: number) => (x < 0 ? '−' + -x : String(x))
const money = (x: number) => (x < 0 ? '−$' + -x : '$' + x)

/** the value at an x position on an integer number line, from its labelled ticks */
function numberLineValue(svg: string, x: number): number | null {
  const labels = [...svg.matchAll(/<text class="dl (?:small|tiny)[^"]*" x="([\d.]+)" y="[\d.]+"[^>]*>(−?\d+)<\/text>/g)].map((m) => [Number(m[1]), Number(m[2].replace('−', '-'))])
  if (labels.length < 2) return null
  const [a, b] = [labels[0], labels[labels.length - 1]]
  return a[1] + ((x - a[0]) / (b[0] - a[0])) * (b[1] - a[1])
}

export function rework(set: GameSet, q: GameQuestion, ctx: Ctx): Expect {
  const m = q.meta as Record<string, any>
  const has = (...xs: (string | number)[]) => xs.forEach((x) => !ctx.page.includes(typeof x === 'number' ? n(x) : x) && ctx.fail(`"${typeof x === 'number' ? n(x) : x}" is not on the page`))
  const svg = q.diagram ?? ''
  switch (`${set.exercise} ${m.t}`) {
    case '1.04 sign':
    case '1.05 sign':
    case '1.06 sign':
    case '1.07 sign': {
      // every pair of integers from −12 to 12 of the signs shown, worked out
      const w = ctx.plain(q.prompt).match(/\((positive|negative)\)\s*([+−×÷])\s*\((positive|negative)\)/)!
      const nums = (s: string) => Array.from({ length: 12 }, (_, i) => (s === 'positive' ? i + 1 : -(i + 1)))
      const f: Record<string, (a: number, b: number) => number> = { '+': (a, b) => a + b, '−': (a, b) => a - b, '×': (a, b) => a * b, '÷': (a, b) => a / b }
      const want: Record<string, string> = { '1.04': '+', '1.05': '−', '1.06': '×', '1.07': '÷' }
      if (w[2] !== want[set.exercise]) ctx.fail('the operation does not match the exercise')
      const vals = nums(w[1]).flatMap((a) => nums(w[3]).map((b) => f[w[2]](a, b)))
      return { text: vals.every((v) => v > 0) ? 'Always positive' : vals.every((v) => v < 0) ? 'Always negative' : 'Could be either' }
    }
    case '1.08 insert': {
      // every option must be the prompt's numbers and signs with brackets added; exactly one must give the target
      const [lhs, rhs] = ctx.plain(q.prompt.match(/<div class="big">(.*?)<\/div>/)?.[1] ?? '').split(' = ')
      const target = Number(rhs.replace('−', '-'))
      const evalJs = (e: string) => {
        const js = e.replace(/−/g, '-').replace(/×/g, '*')
        if (/[^0-9+\-*() ]/.test(js)) return ctx.fail(`cannot read "${e}"`), NaN
        return Function(`"use strict"; return (${js})`)() as number
      }
      const opts = q.options.map(ctx.plain)
      opts.forEach((o) => o.replace(/[()]/g, '') !== lhs && ctx.fail(`option "${o}" is not "${lhs}" with brackets`))
      if (evalJs(lhs) === target) ctx.fail('true without brackets')
      const hits = opts.filter((o) => evalJs(o) === target)
      if (hits.length !== 1) ctx.fail(`${hits.length} options make it true`)
      return { text: hits[0] ?? '' }
    }
    case '1.01 opposite':
      has(m.n)
      return { v: -m.n }
    case '1.01 integer':
      has(String(m.n))
      return { v: m.sg * m.n }
    case '1.01 word': {
      const pairs: Record<string, string> = { above: 'below', profit: 'loss', deposit: 'withdrawal', rise: 'fall', before: 'after', north: 'south', up: 'down', gain: 'lose' }
      const key = pairs[m.w] ?? Object.keys(pairs).find((k) => pairs[k] === m.w)
      return key ? { text: key } : (ctx.fail('no key for ' + m.w), null)
    }
    case '1.01 thermometer': {
      // vScale draws -40 at the bottom and 40 at the top: read the mark's height against the scale's labelled marks
      const marks = [...svg.matchAll(/<text class="dl tiny hl" x="[\d.]+" y="([\d.]+)"[^>]*>A<\/text>/g)].map((x) => Number(x[1]))
      const ticks = [...svg.matchAll(/<text class="dl tiny" x="[\d.]+" y="([\d.]+)"[^>]*>(−?\d+) ?°C<\/text>/g)].map((x) => [Number(x[1]), Number(x[2].replace('−', '-'))])
      if (marks.length !== 1 || ticks.length < 2) return ctx.fail('could not read the scale'), null
      const [p, r] = [ticks[0], ticks[ticks.length - 1]]
      const read = p[1] + ((marks[0] - p[0]) / (r[0] - p[0])) * (r[1] - p[1])
      if (Math.abs(read - m.temp) > 0.5) ctx.fail(`the mark is drawn at ${read.toFixed(1)}°C`)
      return { text: `${n(m.temp)}°C` }
    }
    case '1.02 arrow': {
      const ax = svg.match(/<text class="dl small hl" x="([\d.]+)" y="[\d.]+"[^>]*>A<\/text>/)?.[1]
      const read = ax ? numberLineValue(svg, Number(ax)) : null
      if (read === null || Math.round(read) !== m.v || Math.abs(read - m.v) > 0.05) ctx.fail(`arrow A is drawn at ${read}`)
      return { v: m.v }
    }
    case '1.02 move':
      has(m.start, String(Math.abs(m.move)))
      if (!ctx.page.includes(m.move > 0 ? 'right' : 'left')) ctx.fail('direction not shown')
      return { v: m.start + m.move }
    case '1.02 between': {
      has(m.a, m.c)
      let count = 0
      for (let x = m.a + 1; x < m.c; x++) count++
      return { v: count }
    }
    case '1.02 missing': {
      const qx = svg.match(/<text class="dl small hl" x="([\d.]+)" y="[\d.]+"[^>]*>\?<\/text>/)?.[1]
      const read = qx ? numberLineValue(svg, Number(qx)) : null
      if (read === null || Math.abs(read - m.ask) > 0.05) ctx.fail(`the ? is drawn at ${read}`)
      return { v: Math.round(read ?? NaN) }
    }
    case '1.03 extreme': {
      const xs = q.options.map((o) => Number(ctx.plain(o).replace('−', '-')))
      return { v: m.largest ? Math.max(...xs) : Math.min(...xs) }
    }
    case '1.03 statement': {
      // each statement is tested by evaluating it
      const truthy = q.options.filter((o) => {
        const s = ctx.plain(o).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/−/g, '-')
        const mm = s.match(/^(-?\d+) ([<>=]) (-?\d+)$/)
        if (!mm) return false
        const [x, y] = [Number(mm[1]), Number(mm[3])]
        return mm[2] === '<' ? x < y : mm[2] === '>' ? x > y : x === y
      })
      if (truthy.length !== 1) ctx.fail(`${truthy.length} true statements`)
      return { text: ctx.plain(truthy[0] ?? '') }
    }
    case '1.03 order': {
      const asc = (m.xs as number[]).slice().sort((x, y) => x - y)
      return { text: asc.map(n).join(', ') }
    }
  }
  // the four operations, order of operations: evaluate the expression shown
  const expr = ctx.plain(q.prompt.match(/<div class="big">(.*?)<\/div>/)?.[1] ?? '')
  if (['1.04', '1.05', '1.06', '1.07', '1.08'].includes(set.exercise) || (set.exercise === '1.09' && m.t === 'powers')) {
    const js = expr
      .replace(/−(\d+)\^2/g, '-($1**2)')
      .replace(/\((−?\d+)\)\^2/g, '(($1)**2)')
      .replace(/−/g, '-')
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
    if (/[^0-9+\-*/(). ]/.test(js)) return ctx.fail(`cannot read "${expr}"`), null
    // eslint-disable-next-line no-new-func
    return { v: Function(`"use strict"; return (${js})`)() as number }
  }
  switch (`${set.exercise} ${m.t}`) {
    case '1.09 key':
      has(m.n * -1)
      return { text: `(−) ${m.n}` }
    case '1.09 estimate': {
      has(m.a, String(m.c))
      const nearest100 = Math.round(m.a / 100) * 100
      if (Math.abs(nearest100 - m.a) > 5) ctx.fail('not close to a hundred')
      return { v: nearest100 / m.c }
    }
    case '1.10 temperature':
      has(`${n(m.start)}°C`, String(Math.abs(m.change)))
      if (!ctx.page.includes(m.change > 0 ? 'rose' : 'fell')) ctx.fail('direction not shown')
      return { text: `${n(m.start + m.change)}°C` }
    case '1.10 lift':
      has(m.start, String(m.down))
      return { v: m.start - m.down }
    case '1.10 bank':
      has(`$${m.had}`, `$${m.out}`)
      return { text: money(m.had - m.out) }
    case '1.10 difference': {
      has(String(m.hi), String(Math.abs(m.lo)))
      const unit = /bird|diver/.test(ctx.page) ? ' m' : '°C'
      return { text: `${m.hi - m.lo}${unit}` }
    }
  }
  ctx.fail('no independent check for this kind of question')
  return null
}
