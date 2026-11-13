// Independent answers for the Chapter 7 (Decimals) class games, used by tests/games.test.ts.
// Every number is read back off the page as an exact fraction (4.723 → 4723/1000) and worked with this file's own
// arithmetic: sums, products and quotients exactly, rounding half up on the digits, recurring decimals turned back
// into fractions from their dots. The hundredths grid is counted square by square.
import type { GameQuestion, GameSet } from '../../src/lib/game/types'
import type { Ctx, Expect } from './ncm7-ch1'

type R = [number, number]
const gcd = (a: number, c: number): number => (c === 0 ? Math.abs(a) : gcd(c, a % c))
const norm = ([n, d]: R): R => {
  const g = gcd(n, d) || 1
  return d / g < 0 ? [-n / g, -d / g] : [n / g, d / g]
}
const val = (r: R) => r[0] / r[1]
/** "4.723" → 4723/1000; "36 000" → 36000 */
function dec(s: string): R {
  const m = s.replace(/ /g, '').replace('−', '-').match(/^(-?)(\d+)(?:\.(\d+))?$/)
  if (!m) throw new Error(`not a decimal: "${s}"`)
  const f = m[3] ?? ''
  return norm([(m[1] ? -1 : 1) * Number(m[2] + f), 10 ** f.length])
}
const op = (a: R, o: string, c: R): R =>
  norm(o === '+' ? [a[0] * c[1] + c[0] * a[1], a[1] * c[1]] : o === '−' ? [a[0] * c[1] - c[0] * a[1], a[1] * c[1]] : o === '×' ? [a[0] * c[0], a[1] * c[1]] : [a[0] * c[1], a[1] * c[0]])
/** an exact decimal written out, with dp places if given (rounding is done before this) */
function show(r: R, dp?: number): string {
  const [n, d] = norm(r)
  let k = 0
  while (10 ** k % d !== 0) {
    k++
    if (k > 12) throw new Error('not a terminating decimal')
  }
  const places = dp ?? k
  const whole = Math.round((n * 10 ** places) / d)
  const s = String(Math.abs(whole)).padStart(places + 1, '0')
  const ip = s.slice(0, s.length - places)
  const fp = s.slice(s.length - places)
  const grouped = ip.length >= 5 ? ip.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : ip
  return (whole < 0 ? '−' : '') + grouped + (places ? '.' + fp : '')
}
/** round an exact decimal to r places, half up (all values here are positive) */
function roundHalfUp(x: R, r: number): R {
  const [n, d] = norm(x)
  return norm([Math.floor((n * 10 ** r + d / 2) / d), 10 ** r])
}
const money = (r: R) => '$' + show(r, 2)
/** a recurring decimal from the page's HTML: 0.1<span class="rec">6</span> → 1/6 */
function recurringValue(html: string): R {
  const s = html.replace(/<span class="rec">(\d)<\/span>/g, '[$1]')
  const m = s.match(/^(\d+)\.([\d[\]]*)$/)
  if (!m) throw new Error(`cannot read "${html}"`)
  const body = m[2]
  const first = body.indexOf('[')
  if (first < 0) return norm(op(dec(m[1]), '+', dec('0.' + body)))
  const last = body.lastIndexOf(']')
  const pre = body.slice(0, first).replace(/[[\]]/g, '')
  const rep = body.slice(first, last + 1).replace(/[[\]]/g, '')
  if (body.slice(last + 1)) throw new Error('digits after the repeating part')
  // x = whole + (pre·rep − pre) / (10^|pre| · (10^|rep| − 1))
  const top = Number(pre + rep) - Number(pre || '0')
  const bottom = 10 ** pre.length * (10 ** rep.length - 1)
  return norm([Number(m[1]) * bottom + top, bottom])
}
const isRecurring = ([n, d]: R) => {
  let q = norm([n, d])[1]
  for (const p of [2, 5]) while (q % p === 0) q /= p
  return q !== 1
}

export function rework(set: GameSet, q: GameQuestion, ctx: Ctx): Expect {
  const kind = `${set.exercise} ${q.meta.t}`
  const want = solve(kind, q, ctx)
  if (want && 'text' in want && !['7.09 which', '7.08 rewrite', '7.04 missing'].includes(kind)) {
    if (!ctx.plain(q.why).replace(/\s/g, '').includes(want.text.replace(/\s/g, ''))) ctx.fail(`the explanation does not reach ${want.text}`)
  }
  return want
}

function solve(kind: string, q: GameQuestion, ctx: Ctx): Expect {
  const words = ctx.plain(q.prompt)
  const bigText = ctx.plain(q.prompt.match(/<div class="big">(.*?)<\/div>/)?.[1] ?? '')
  const shown = q.options.map(ctx.plain)
  const NUMS = (s: string) => [...s.matchAll(/\d[\d ]*(?:\.\d+)?/g)].map((m) => m[0].trim())
  const one = (ok: boolean[], what: string): Expect => {
    const hits = ok.map((x, k) => (x ? k : -1)).filter((k) => k >= 0)
    if (hits.length !== 1) ctx.fail(`${hits.length} options ${what}`)
    return hits.length ? { text: shown[hits[0]] } : null
  }
  const evalBig = (): R => {
    const m = bigText.match(/^([\d .]+?) ([+−×÷]) ([\d .]+)$/)
    if (!m) throw new Error(`cannot read "${bigText}"`)
    return op(dec(m[1]), m[2], dec(m[3]))
  }

  switch (kind) {
    case '7.01 places': {
      const x = words.match(/does (\d+\.\d+) have/)![1]
      return { v: x.split('.')[1].length }
    }
    case '7.01 order': {
      const largest = /largest/.test(words)
      const vs = shown.map((o) => val(dec(o)))
      const best = largest ? Math.max(...vs) : Math.min(...vs)
      return one(vs.map((x) => x === best), `are the ${largest ? 'largest' : 'smallest'}`)
    }
    case '7.01 between': {
      const [lo, hi] = NUMS(words).map((s) => val(dec(s)))
      return one(shown.map((o) => val(dec(o)) > lo && val(dec(o)) < hi), 'are between them')
    }
    case '7.02 toFrac': {
      const r = dec(words.match(/Write ([\d.]+) as a fraction/)![1])
      // the answer in simplest form; other options equal in value must not be simplified
      for (const o of shown) {
        const m = o.match(/^\((\d+)\/(\d+)\)$/)
        if (m && Number(m[1]) / Number(m[2]) === val(r) && gcd(Number(m[1]), Number(m[2])) === 1 && o !== `(${r[0]}/${r[1]})`) ctx.fail('two options are in simplest form and equal')
      }
      return { text: `(${r[0]}/${r[1]})` }
    }
    case '7.02 toDec': {
      const m = bigText.match(/^\((\d+)\/(\d+)\)$/)!
      return { text: show([Number(m[1]), Number(m[2])]) }
    }
    case '7.02 shaded': {
      const all = (q.diagram!.match(/class="fpart/g) ?? []).length
      const on = (q.diagram!.match(/class="fpart on"/g) ?? []).length
      if (all !== 100) ctx.fail(`the grid has ${all} squares`)
      return { text: show([on, 100]) }
    }
    case '7.03 add':
    case '7.03 sub':
    case '7.04 times':
    case '7.04 divide':
    case '7.06 times':
    case '7.06 whole':
    case '7.06 small':
    case '7.07 divide':
    case '7.08 divide':
      return { text: show(evalBig()) }
    case '7.03 change': {
      const [cost, paid] = [...words.matchAll(/\$(\d+(?:\.\d+)?)/g)].map((m) => dec(m[1]))
      return { text: money(op(paid, '−', cost)) }
    }
    case '7.04 missing': {
      const m = bigText.match(/^([\d.]+) ([×÷]) □ = ([\d .]+)$/)!
      const r = m[2] === '×' ? op(dec(m[3]), '÷', dec(m[1])) : op(dec(m[1]), '÷', dec(m[3]))
      return { text: show(r) }
    }
    case '7.05 related': {
      const m = words.match(/^(\d+) × (\d+) = ([\d ]+)\. What is ([\d.]+) × ([\d.]+)\?/)!
      if (Number(m[1]) * Number(m[2]) !== Number(m[3].replace(/ /g, ''))) ctx.fail('the whole-number product is wrong')
      return { text: show(op(dec(m[4]), '×', dec(m[5]))) }
    }
    case '7.05 estimate': {
      const m = words.match(/estimate of ([\d.]+) × ([\d.]+)\?/)!
      const exact = val(dec(m[1])) * val(dec(m[2]))
      const ds = shown.map((o) => Math.abs(val(dec(o)) - exact))
      const best = Math.min(...ds)
      const second = Math.min(...ds.filter((x) => x !== best))
      if (second < 2 * best) ctx.fail('the best estimate is not clear-cut')
      return one(ds.map((x) => x === best), 'are nearest')
    }
    case '7.07 share': {
      const m = words.match(/^\$([\d.]+) is shared equally between (\d+)/)!
      return { text: money(op(dec(m[1]), '÷', [Number(m[2]), 1])) }
    }
    case '7.08 rewrite': {
      const target = val(evalBig())
      return one(
        shown.map((o) => {
          const m = o.match(/^([\d .]+) ÷ ([\d .]+)$/)!
          return Math.abs(val(op(dec(m[1]), '÷', dec(m[2]))) - target) < 1e-9
        }),
        'have the same answer',
      )
    }
    case '7.09 which': {
      const findRec = /recurring/.test(words)
      return one(
        shown.map((o) => {
          const m = o.match(/^\((\d+)\/(\d+)\)$/)!
          return isRecurring([Number(m[1]), Number(m[2])]) === findRec
        }),
        `are ${findRec ? 'recurring' : 'terminating'}`,
      )
    }
    case '7.09 convert': {
      const m = bigText.match(/^\((\d+)\/(\d+)\)$/)!
      const f = norm([Number(m[1]), Number(m[2])])
      return one(
        q.options.map((o) => {
          const r = recurringValue(o)
          return r[0] === f[0] && r[1] === f[1]
        }),
        `equal ${f[0]}/${f[1]}`,
      )
    }
    case '7.10 round':
    case '7.10 carry': {
      const m = words.match(/^Round ([\d.]+) to (\d) decimal/)!
      const r = Number(m[2])
      return { text: show(roundHalfUp(dec(m[1]), r), r) }
    }
    case '7.11 cost': {
      const m = words.match(/^(\d+) .+? cost \$([\d.]+) each/)!
      return { text: money(op([Number(m[1]), 1], '×', dec(m[2]))) }
    }
    case '7.11 bottles': {
      const m = words.match(/holds ([\d.]+) L\. .+ from a tub of ([\d.]+) L/)!
      return { v: Math.floor(val(op(dec(m[2]), '÷', dec(m[1])))) }
    }
    case '7.11 perimeter': {
      const m = words.match(/is ([\d.]+) m long and ([\d.]+) m wide/)!
      return { v: val(op([2, 1], '×', op(dec(m[1]), '+', dec(m[2])))), unit: 'm' }
    }
  }
  ctx.fail('no independent check for this kind of question')
  return null
}
