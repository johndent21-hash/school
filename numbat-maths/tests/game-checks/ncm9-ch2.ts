// Independent answers for the NCM 9 Chapter 2 (Pythagoras' theorem and surds) class games, used by tests/games.test.ts.
// The Pythagoras kinds are reused from NCM 8 Chapter 1 (meta.reused) and checked there, so only the surd kinds are here.
// Surds are read back off the page ("3√5", "√12", "7") and given exact values as k√n; the question's expression (one
// surd, or two joined by +, −, × or ÷) is worked out here. The right option must equal it in value AND be in simplest
// form (n has no square factor; a whole number when n = 1), and it must be the only option equal in value.
import type { GameQuestion, GameSet } from '../../src/lib/game/types'
import type { Ctx, Expect } from './ncm7-ch1'
import { txt } from './ncm7-ch5'

/** "3√5" → [3, 5]; "√12" → [1, 12]; "−√7" → [−1, 7]; "6" → [6, 1] */
function surd(s: string): [number, number] {
  const m = s.replace(/−/g, '-').match(/^(-?)(\d*)(?:√(\d+))?$/)
  if (!m || (!m[2] && !m[3])) throw new Error(`not a surd: "${s}"`)
  const k = (m[2] ? Number(m[2]) : 1) * (m[1] ? -1 : 1)
  return [k, m[3] ? Number(m[3]) : 1]
}
const value = ([k, n]: [number, number]) => k * Math.sqrt(n)
const squareFree = (n: number) => {
  for (let f = 2; f * f <= n; f++) if (n % (f * f) === 0) return false
  return true
}
const close = (a: number, b: number) => Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(a))

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
  const opts = q.options.map(txt)
  const shown = q.options.map(ctx.plain)
  const bigT = txt(q.prompt.match(/<div class="big">(.*?)<\/div>/)?.[1] ?? '')
  const one = (ok: boolean[], what: string): Expect => {
    const hits = ok.map((x, k) => (x ? k : -1)).filter((k) => k >= 0)
    if (hits.length !== 1) ctx.fail(`${hits.length} options ${what}`)
    return hits.length ? { text: shown[hits[0]] } : null
  }
  switch (kind) {
    case '2.02 isSurd': {
      const not = /NOT a surd/.test(txt(q.prompt).replace(/([a-z])([A-Z])/g, '$1 $2')) || /NOTasurd/.test(txt(q.prompt))
      return one(
        opts.map((o) => {
          const [k, n] = surd(o)
          const isSurd = k === 1 && !Number.isInteger(Math.sqrt(n))
          return not ? !isSurd : isSurd
        }),
        not ? 'are not surds' : 'are surds',
      )
    }
    case '2.03 simplify':
    case '2.04 like':
    case '2.04 simplifyAdd':
    case '2.05 mult':
    case '2.05 divide': {
      const m = bigT.replace(/−/g, '-').match(/^(.+?)([+\-×÷])(.+)$/)
      let v: number
      if (!m || m[1] === '') v = value(surd(bigT))
      else {
        const [a, b] = [value(surd(m[1])), value(surd(m[3]))]
        v = m[2] === '+' ? a + b : m[2] === '-' ? a - b : m[2] === '×' ? a * b : a / b
      }
      const eq = opts.map((o) => close(value(surd(o)), v))
      // a partly simplified surd (2√18 for √72) may appear as a wrong option only when simplest form is asked for
      const simplest = /simplestform/.test(txt(q.prompt))
      if (eq.filter(Boolean).length !== 1 && !simplest) ctx.fail(`${eq.filter(Boolean).length} options equal the value`)
      return one(
        opts.map((o, i) => {
          const [k, n] = surd(o)
          return eq[i] && squareFree(n) && (n !== 1 || Number.isInteger(k))
        }),
        'are equal and in simplest form',
      )
    }
  }
  ctx.fail('no independent check for this kind of question')
  return null
}
