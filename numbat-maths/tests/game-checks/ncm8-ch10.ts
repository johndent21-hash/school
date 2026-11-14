// Independent answers for the NCM 8 Chapter 10 (Ratios and rates) class games, used by tests/games.test.ts.
// Kinds reused from NCM 7 Chapter 12 (meta.reused) are checked by that chapter's checks, so only the new kinds are here.
// Answers are worked out from the numbers in the question with this file's own unit table (lengths in centimetres,
// times in minutes), and exactly one option must have that value (options in other units are converted first, so an
// option that is the same length in a different unit would also count, and fail the "exactly one" rule).
// Units of rates come from a key written here.
import type { GameQuestion, GameSet } from '../../src/lib/game/types'
import type { Ctx, Expect } from './ncm7-ch1'

const CM: Record<string, number> = { cm: 1, m: 100, km: 100_000 }
const close = (a: number, b: number) => Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(a), Math.abs(b))
const n = (s: string) => Number(s.replace(/[\s ]/g, ''))
/** "1 h 30 min", "45 min", "2 h" → minutes */
function minutes(s: string): number {
  const m = s.match(/^(?:(\d+) h)?\s*(?:(\d+) min)?$/)
  if (!m || (!m[1] && !m[2])) throw new Error(`not a time: "${s}"`)
  return Number(m[1] ?? 0) * 60 + Number(m[2] ?? 0)
}
const UNIT_KEY: [RegExp, string][] = [
  [/cost of petrol/, '$/L'],
  [/speed of a car/, 'km/h'],
  [/fills a bath/, 'L/min'],
  [/heart rate/, 'beats/min'],
  [/price of apples/, '$/kg'],
  [/printer prints/, 'pages/min'],
  [/fuel use/, 'L/100 km'],
  [/rate of pay/, '$/h'],
]

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
  const words = ctx.plain(q.prompt).replace(/\s+([.?,)])/g, '$1')
  const shown = q.options.map(ctx.plain)
  /** exactly one option has value v when read by `read` */
  const one = (v: number, read: (o: string) => number | null, what: string): Expect => {
    const vals = shown.map(read)
    if (vals.some((x) => x === null)) ctx.fail(`an option cannot be read as ${what}`)
    const hits = vals.map((x, i) => (x !== null && close(x, v) ? i : -1)).filter((i) => i >= 0)
    if (hits.length !== 1) ctx.fail(`${hits.length} options equal ${v} (${what})`)
    return hits.length ? { text: shown[hits[0]] } : null
  }
  const lenCm = (o: string) => {
    const m = o.match(/^([\d\s .]+) (cm|m|km)$/)
    return m ? n(m[1]) * CM[m[2]] : null
  }
  const withUnit = (unit: string) => (o: string) => {
    const m = o.match(new RegExp(`^([\\d\\s\\u00a0.]+) ${unit.replace(/[/$]/g, '\\$&')}$`))
    return m ? n(m[1]) : null
  }
  switch (kind) {
    case '10.02 fraction': {
      const m = words.match(/The ratio of (.+?) to (.+?) is (\d+) : (\d+)\. What fraction are (.+?)\?/)!
      const [a, c] = [Number(m[3]), Number(m[4])]
      const part = m[5] === m[1] ? a : m[5] === m[2] ? c : NaN
      if (Number.isNaN(part)) throw new Error('asks about neither part')
      const t = a + c
      let [p, d] = [part, t]
      for (let k = Math.min(p, d); k > 1; k--) if (p % k === 0 && d % k === 0) [p, d] = [p / k, d / k]
      return { text: `(${p}/${d})` }
    }
    case '10.03 map': {
      const m = words.match(/scale of 1 : ([\d ]+)\. Two towns are ([\d.]+) cm apart/)!
      return one(n(m[1]) * Number(m[2]), lenCm, 'a length')
    }
    case '10.03 toMap': {
      const m = words.match(/scale of 1 : ([\d ]+)\. A road is ([\d.\s]+) (m|km) long/)!
      return one((n(m[2]) * CM[m[3]]) / n(m[1]), lenCm, 'a length')
    }
    case '10.03 scale': {
      const m = words.match(/scale 1 cm : ([\d.]+) (m|km) as a ratio/)!
      return one(Number(m[1]) * CM[m[2]], (o) => {
        const r = o.match(/^1 : ([\d\s ]+)$/)
        return r ? n(r[1]) : null
      }, 'a scale')
    }
    case '10.04 three': {
      const m = words.match(/\$([\d ]+) is shared between (\w+), (\w+) and (\w+) in the ratio (\d+) : (\d+) : (\d+)\. How much does (\w+) get\?/)!
      const total = n(m[1])
      const r = [Number(m[5]), Number(m[6]), Number(m[7])]
      const i = [m[2], m[3], m[4]].indexOf(m[8])
      if (i < 0) throw new Error('unknown person')
      return one((total * r[i]) / (r[0] + r[1] + r[2]), (o) => {
        const d = o.match(/^\$([\d\s ]+)$/)
        return d ? n(d[1]) : null
      }, 'money')
    }
    case '10.05 units': {
      const k = UNIT_KEY.find(([re]) => re.test(words))?.[1]
      if (!k) throw new Error('not in the key')
      return { text: k }
    }
    case '10.08 speed': {
      const m = words.match(/travels (\d+) km in (.+?)\. What is the average speed/)!
      return one(Number(m[1]) / (minutes(m[2]) / 60), withUnit('km/h'), 'a speed')
    }
    case '10.08 distance': {
      const m = words.match(/(?:walks|rides|travels) at (\d+) km\/h for (.+?)\. How far/)!
      return one(Number(m[1]) * (minutes(m[2]) / 60), withUnit('km'), 'a distance')
    }
    case '10.08 time': {
      const m = words.match(/drive (\d+) km at (\d+) km\/h\?/)!
      const t = (Number(m[1]) / Number(m[2])) * 60
      return one(t, (o) => {
        try {
          return minutes(o)
        } catch {
          return null
        }
      }, 'a time')
    }
    case '10.09 convert': {
      let m = words.match(/Convert ([\d.]+) km\/h to m\/s/)
      if (m) return one((Number(m[1]) * 1000) / 3600, withUnit('m/s'), 'm/s')
      m = words.match(/Convert ([\d.]+) m\/s to km\/h/)
      if (m) return one((Number(m[1]) * 3600) / 1000, withUnit('km/h'), 'km/h')
      m = words.match(/runs at ([\d.]+) L\/min\. What is this in litres per hour/)
      if (m) return one(Number(m[1]) * 60, withUnit('L/h'), 'L/h')
      m = words.match(/costs \$([\d.]+)\/kg\. What is this in cents per gram/)!
      return one((Number(m[1]) * 100) / 1000, withUnit('c/g'), 'c/g')
    }
  }
  ctx.fail('no independent check for this kind of question')
  return null
}
