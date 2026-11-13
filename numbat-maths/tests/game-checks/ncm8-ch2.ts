// Independent answers for the NCM 8 Chapter 2 (Working with numbers) class games, used by tests/games.test.ts.
// Kinds reused from NCM 7 are sent to the checker of the chapter they came from, as that exercise. New kinds are
// worked here: index-law questions with exact whole-number arithmetic (BigInt), so the one option equal in value to
// the expression is found by computing, not by reading the index; surds and powers of negatives by direct
// calculation; fractions to decimals by division.
import type { GameQuestion, GameSet } from '../../src/lib/game/types'
import { NCM7_CH1 } from '../../src/content/games/ncm7-ch1'
import { NCM7_CH3 } from '../../src/content/games/ncm7-ch3'
import { NCM7_CH5 } from '../../src/content/games/ncm7-ch5'
import { NCM7_CH7 } from '../../src/content/games/ncm7-ch7'
import type { Ctx, Expect } from './ncm7-ch1'
import { rework as rework1 } from './ncm7-ch1'
import { rework as rework3 } from './ncm7-ch3'
import { rework as rework5 } from './ncm7-ch5'
import { rework as rework7 } from './ncm7-ch7'

/** where each NCM 8 exercise's reused kinds came from: [NCM 7 chapter, its checker, the exercises to look in] */
const FROM: Record<string, [typeof NCM7_CH1, typeof rework1, string[]]> = {
  '2.01': [NCM7_CH5, rework5, ['5.01', '5.02']],
  '2.02': [NCM7_CH1, rework1, ['1.04', '1.05']],
  '2.03': [NCM7_CH1, rework1, ['1.06', '1.07']],
  '2.04': [NCM7_CH1, rework1, ['1.08']],
  '2.05': [NCM7_CH7, rework7, ['7.01', '7.10']],
  '2.06': [NCM7_CH7, rework7, ['7.06', '7.08']],
  '2.07': [NCM7_CH7, rework7, ['7.09']],
  '2.08': [NCM7_CH3, rework3, ['3.07', '3.08']],
  '2.10': [NCM7_CH3, rework3, ['3.10']],
}

/** "6^5" → 6^5 exactly */
function power(s: string): bigint | null {
  const m = s.replace(/\s/g, '').match(/^(\d+)\^(\d+)$/)
  return m ? BigInt(m[1]) ** BigInt(m[2]) : null
}
/** an index expression from the page, exactly */
function indexValue(s: string): bigint {
  const t = s.replace(/\s/g, '').replace(/−/g, '-')
  let m = t.match(/^\((\d+)\^(\d+)\)\^(\d+)$/)
  if (m) return (BigInt(m[1]) ** BigInt(m[2])) ** BigInt(m[3])
  m = t.match(/^(\d+)×(\d+)\^(\d+)$/)
  if (m) return BigInt(m[1]) * BigInt(m[2]) ** BigInt(m[3])
  m = t.match(/^(\d+)\^(\d+)×(\d+)\^(\d+)÷(\d+)\^(\d+)$/)
  if (m) return (BigInt(m[1]) ** BigInt(m[2]) * BigInt(m[3]) ** BigInt(m[4])) / BigInt(m[5]) ** BigInt(m[6])
  m = t.match(/^(\d+)\^(\d+)×(\d+)\^(\d+)$/)
  if (m) return BigInt(m[1]) ** BigInt(m[2]) * BigInt(m[3]) ** BigInt(m[4])
  m = t.match(/^(\d+)\^(\d+)÷(\d+)\^(\d+)$/)
  if (m) {
    const [a, b] = [BigInt(m[1]) ** BigInt(m[2]), BigInt(m[3]) ** BigInt(m[4])]
    if (a % b !== 0n) throw new Error('not a whole number')
    return a / b
  }
  const p = power(t)
  if (p !== null) return p
  throw new Error(`cannot read "${s}"`)
}
/** the value of a simple surd option: "7", "√7", "2√7" */
function surdValue(s: string): number {
  const t = s.replace(/\s/g, '')
  let m = t.match(/^(\d+)?√(\d+)$/)
  if (m) return Number(m[1] ?? 1) * Math.sqrt(Number(m[2]))
  m = t.match(/^\d+$/)
  if (m) return Number(t)
  throw new Error(`cannot read "${s}"`)
}

export function rework(set: GameSet, q: GameQuestion, ctx: Ctx): Expect {
  const t = q.meta.t as string
  const route = FROM[set.exercise]
  if (route) {
    const [ch, check, exs] = route
    const ex = exs.find((e) => ch.sets.find((s) => s.exercise === e)?.makers.some((m) => m.t === t))
    if (ex) return check({ ...set, exercise: ex }, q, ctx)
  }
  let want: Expect = null
  try {
    want = solve(`${set.exercise} ${t}`, q, ctx)
  } catch (e) {
    ctx.fail(`could not be read: ${(e as Error).message}`)
    return null
  }
  if (want && 'text' in want && !ctx.plain(q.why).replace(/\s/g, '').includes(want.text.replace(/\s/g, ''))) ctx.fail(`the explanation does not reach ${want.text}`)
  return want
}

function solve(kind: string, q: GameQuestion, ctx: Ctx): Expect {
  const bigHtml = q.prompt.match(/<div class="big">(.*?)<\/div>/)?.[1] ?? ''
  const bigText = ctx.plain(bigHtml)
  const shown = q.options.map(ctx.plain)
  const one = (ok: boolean[], what: string): Expect => {
    const hits = ok.map((x, k) => (x ? k : -1)).filter((k) => k >= 0)
    if (hits.length !== 1) ctx.fail(`${hits.length} options ${what}`)
    return hits.length ? { text: shown[hits[0]] } : null
  }

  switch (kind) {
    case '2.01 compensate': {
      const m = bigText.match(/^(\d+) ([+−]) (\d+)$/)!
      return { v: m[2] === '+' ? Number(m[1]) + Number(m[3]) : Number(m[1]) - Number(m[3]) }
    }
    case '2.07 term': {
      const m = bigText.match(/^\((\d+)\/(\d+)\)$/)!
      const v = Number(m[1]) / Number(m[2])
      return one(
        shown.map((o) => Math.abs(Number(o) - v) < 1e-12),
        `equal ${m[1]}/${m[2]}`,
      )
    }
    case '2.08 negPower': {
      const m = bigText.replace(/\s/g, '').match(/^\(−(\d+)\)\^(\d+)$/)!
      return { v: (-Number(m[1])) ** Number(m[2]) }
    }
    case '2.09 square':
    case '2.09 product': {
      // read the radicands from the HTML: (√a)², √a × √b, √(a²)
      const rads = [...bigHtml.matchAll(/<span class="rad">(.*?)<\/span>/g)].map((m) => m[1])
      let v: number
      if (rads.length === 2) v = Math.sqrt(Number(rads[0]) * Number(rads[1]))
      else if (/<sup>2<\/sup>$/.test(bigHtml) && !/<sup>/.test(rads[0])) v = Number(rads[0])
      else {
        const r = rads[0].match(/^(\d+)<sup>2<\/sup>$/)!
        v = Math.sqrt(Number(r[1]) ** 2)
      }
      return one(
        shown.map((o) => Math.abs(surdValue(o) - v) < 1e-9),
        `equal ${v}`,
      )
    }
    case '2.11 multiply':
    case '2.11 divide':
    case '2.11 mixed':
    case '2.12 power': {
      const v = indexValue(bigText)
      return one(
        shown.map((o) => power(o) === v),
        'equal the expression',
      )
    }
    case '2.12 zero':
      return { v: Number(indexValue(bigText)) }
  }
  ctx.fail('no independent check for this kind of question')
  return null
}
