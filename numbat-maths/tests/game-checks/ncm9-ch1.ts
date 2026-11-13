// Independent answers for the NCM 9 Chapter 1 (Algebra) class games, used by tests/games.test.ts.
// Kinds reused from NCM 8 Chapter 3 (meta.reused) are checked by that chapter's checks, so only the new kinds are here.
// The algebra is read with the NCM 7 Chapter 5 parser and options are compared by value at several test points:
//  - simplify and expand questions: exactly one option equals the question's expression;
//  - factorise questions: exactly one option is equal AND fully factorised: a number (optional) times brackets,
//    each bracket a two-term linear expression with no common factor left inside;
//  - "two numbers with product p and sum s": checked directly.
import type { GameQuestion, GameSet } from '../../src/lib/game/types'
import type { Ctx, Expect } from './ncm7-ch1'
import { lettersIn, parse, txt } from './ncm7-ch5'

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b))
type F = ReturnType<typeof parse>
/** equal at several non-whole test points (whole numbers can make an algebraic fraction's denominator 0) */
const POINTS = [0.37, 1.91, -2.43, 3.17, -0.71]
function same(a: F, b: F, letters: string[]): boolean {
  return POINTS.every((p, i) => {
    const env = Object.fromEntries(letters.map((l, k) => [l, p + 0.53 * k + 0.11 * i]))
    const [x, y] = [a(env), b(env)]
    return Number.isFinite(x) && Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(x), Math.abs(y))
  })
}

/** k(ax + b)(cx + d)…: every bracket linear in one letter, two terms, coefficients with no common factor */
function fullyFactorised(o: string): boolean {
  const s = o.replace(/−/g, '-')
  const m = s.match(/^(-?\d*)((?:\([^()]+\)(?:\^\(2\))?)+)$/)
  if (!m) return false
  const brackets = [...m[2].matchAll(/\(([^()]+)\)/g)].map((x) => x[1])
  if (brackets.length < 1 || (brackets.length === 1 && !/\^\(2\)/.test(m[2]))) return false
  return brackets.every((b) => {
    const terms = b.match(/[+-]?[^+-]+/g)!
    if (terms.length !== 2) return false
    const cs = terms.map((t) => {
      const tm = t.match(/^([+-]?)(\d*)([a-z]?)$/)
      if (!tm) return NaN
      return Number(tm[2] || '1') * (tm[1] === '-' ? -1 : 1)
    })
    const lettered = terms.filter((t) => /[a-z]/.test(t)).length
    return cs.every((c) => !Number.isNaN(c)) && lettered === 1 && gcd(cs[0], cs[1]) === 1
  })
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
  const bigT = txt(q.prompt.match(/<div class="big">(.*?)<\/div>/)?.[1] ?? '')
  const opts = q.options.map(txt)
  const shown = q.options.map(ctx.plain)
  const letters = () => [...new Set([...lettersIn(bigT), ...opts.flatMap(lettersIn)])]
  const equal = () => {
    const f = parse(bigT)
    return opts.map((o) => same(parse(o), f, letters()))
  }
  const one = (ok: boolean[], what: string): Expect => {
    const hits = ok.map((x, k) => (x ? k : -1)).filter((k) => k >= 0)
    if (hits.length !== 1) ctx.fail(`${hits.length} options ${what}`)
    return hits.length ? { text: shown[hits[0]] } : null
  }
  switch (kind) {
    case '1.03 same':
    case '1.03 unlike':
    case '1.04 times':
    case '1.05 neg':
    case '1.05 simplify':
    case '1.10 mixed':
    case '1.15 cancel':
      return one(equal(), 'equal the expression')
    case '1.11 dots':
    case '1.11 group':
    case '1.12 monic':
    case '1.13 nonMonic':
    case '1.14 mixed': {
      if (!/Factorise/.test(txt(q.prompt))) throw new Error('not a factorising question')
      const eq = equal()
      return one(opts.map((o, k) => eq[k] && fullyFactorised(o)), 'are equal and fully factorised')
    }
    case '1.12 pair': {
      const m = ctx.plain(q.prompt).replace(/−\s*/g, '-').replace(/\s+\?/g, '?').match(/product of (-?\d+) and a sum of (-?\d+)\?/)!
      const [P, S] = [Number(m[1]), Number(m[2])]
      return one(
        shown.map((o) => {
          const n = o.replace(/−/g, '-').match(/^(-?\d+) and (-?\d+)$/)
          return !!n && Number(n[1]) * Number(n[2]) === P && Number(n[1]) + Number(n[2]) === S
        }),
        'multiply and add correctly',
      )
    }
  }
  ctx.fail('no independent check for this kind of question')
  return null
}
