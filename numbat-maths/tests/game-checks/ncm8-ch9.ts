// Independent answers for the NCM 8 Chapter 9 (Equations) class games, used by tests/games.test.ts.
// Kinds reused from NCM 7 Chapter 5 (meta.reused) are checked by that chapter's checks, so only the new kinds are here.
// The algebra is read back off the page with the NCM 7 Chapter 5 parser (tests/game-checks/ncm7-ch5.ts):
//  - linear equations are solved here (the equation must really be linear, with one whole-number solution), and
//    exactly one option "x = …" makes both sides equal;
//  - "first step" and "expand" options are judged by what they do to the equation (the expanded equation must have
//    the same left side as the original, as an expression, and the same right side);
//  - x² = c and ax² = c: the right option is the ± pair whose squares give c (exact √ when c is not a square);
//  - formulas: the formula and the given values are read from the italic letters in the prompt, and the equation
//    for the unknown is solved here;
//  - changing the subject: each option is substituted back into the original formula at several sets of values, and
//    exactly one must make it true every time.
import type { GameQuestion, GameSet } from '../../src/lib/game/types'
import type { Ctx, Expect } from './ncm7-ch1'
import { lettersIn, parse, txt } from './ncm7-ch5'

const close = (a: number, b: number) => Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(a), Math.abs(b))
const bigOf = (html: string) => txt(html.match(/<div class="big">(.*?)<\/div>/)?.[1] ?? '')

/** the root of a linear equation lhs = rhs in one letter (fails if it is not linear) */
function linearRoot(eq: string, x: string): number {
  const [l, r] = eq.split('=')
  const f = (t: number) => parse(l)({ [x]: t }) - parse(r)({ [x]: t })
  const f0 = f(0)
  const slope = f(1) - f0
  if (close(slope, 0)) throw new Error(`"${eq}" has no single solution`)
  const root = -f0 / slope
  if (!close(f(root + 3), 3 * slope) || !close(f(root - 7), -7 * slope)) throw new Error(`"${eq}" is not linear`)
  return Math.abs(root - Math.round(root)) < 1e-9 ? Math.round(root) : root
}

/**
 * The prompt's algebra as compact text: italic letters kept, letters of ordinary words turned into "#", fractions
 * ((a)/(b)) and powers ^(n), so "needs <i>T</i> = 3<i>N</i> + 1 toothpicks" becomes "#####T=3N+1##########".
 */
function algebra(html: string): string {
  return html
    .replace(/<span class="frac"[^>]*><span class="fn">(.*?)<\/span><span class="fd">(.*?)<\/span><\/span>/g, '(($1)/($2))')
    .replace(/<sup>(.*?)<\/sup>/g, '^($1)')
    .replace(/<i>([^<]*)<\/i>/g, '\u0001$1\u0002')
    .replace(/<[^>]*>/g, '')
    .replace(/[A-Za-z]+(?![^\u0001]*\u0002)/g, (w) => '#'.repeat(w.length))
    .replace(/[\u0001\u0002\s]/g, '')
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
  const opts = q.options.map(txt)
  const shown = q.options.map(ctx.plain)
  const words = ctx.plain(q.prompt).replace(/\s+([.?,)])/g, '$1')
  const big = bigOf(q.prompt)
  const one = (ok: (o: string) => boolean, what: string): Expect => {
    const hits = opts.map((o, i) => (ok(o) ? i : -1)).filter((i) => i >= 0)
    if (hits.length !== 1) ctx.fail(`${hits.length} options ${what}`)
    return hits.length ? { text: shown[hits[0]] } : null
  }
  /** "x = 7" options: exactly one is the root */
  const rootOption = (eq: string) => {
    const L = lettersIn(eq)
    if (L.length !== 1) throw new Error(`"${eq}" does not have one unknown`)
    const root = linearRoot(eq, L[0])
    if (!Number.isInteger(root)) ctx.fail(`the solution ${root} is not a whole number`)
    return one((o) => {
      const m = o.match(new RegExp(`^${L[0]}=([-−]?\\d+)$`))
      return !!m && Number(m[1].replace('−', '-')) === root
    }, 'solve the equation')
  }

  switch (kind) {
    case '9.03 both':
    case '9.04 brackets':
      return rootOption(big)
    case '9.03 first': {
      const L = lettersIn(big)[0]
      const r = parse(big.split('=')[1])
      const c = r({ [L]: 1 }) - r({ [L]: 0 })
      if (!(c > 0) || !Number.isInteger(c)) throw new Error('no positive term on the right')
      return { text: `Subtract ${c === 1 ? '' : c}${L} from both sides` }
    }
    case '9.04 expand': {
      const eq = txt(q.prompt).match(/bracketsin(.+?=\d+)gives/)![1]
      const L = lettersIn(eq)[0]
      const [l, r] = eq.split('=')
      return one((o) => {
        const [ol, or] = o.split('=')
        return [-3, 0, 2, 5, 11].every((t) => close(parse(ol)({ [L]: t }), parse(l)({ [L]: t }))) && close(parse(or)({}), parse(r)({}))
      }, 'are the expanded equation')
    }
    case '9.05 square':
    case '9.05 ax2':
    case '9.05 surd': {
      const m = big.match(/^(\d*)([a-z])\^\(2\)=(\d+)$/)!
      const a = m[1] ? Number(m[1]) : 1
      const c = Number(m[3])
      if (c % a !== 0) throw new Error('c is not a multiple of a')
      const sq = c / a
      const root = Math.sqrt(sq)
      if (kind === '9.05 surd' && Number.isInteger(root)) ctx.fail('the surd question has a whole-number answer')
      if (kind !== '9.05 surd' && !Number.isInteger(root)) ctx.fail('the answer is not a whole number')
      if (kind === '9.05 surd' && !/exact/.test(words)) ctx.fail('exact answers not asked for')
      return one((o) => {
        const w = o.match(new RegExp(`^${m[2]}=±(\\d+)$`))
        if (w) return Number(w[1]) ** 2 === sq
        const s = o.match(new RegExp(`^${m[2]}=±√(\\d+)$`))
        return !!s && Number(s[1]) === sq
      }, 'give both solutions')
    }
    case '9.06 rect': {
      const m = words.match(/length is (\d+) cm more than its width\. Its perimeter is (\d+) cm/)!
      // 2w + 2(w + more) = P
      const w = linearRoot(`2w+2(w+${m[1]})=${m[2]}`, 'w')
      return { text: `${w} cm` }
    }
    case '9.07 formula': {
      const A = algebra(q.prompt)
      const f = A.match(/([A-Za-z])=([0-9A-Za-z+\-−()/^]+)/)!
      const given = Object.fromEntries([...A.slice(f.index! + f[0].length).matchAll(/([A-Za-z])=(\d+)(?![A-Za-z(\d])/g)].map((g) => [g[1], Number(g[2])]))
      const letters = lettersIn(`${f[1]}=${f[2]}`)
      const unknown = letters.filter((l) => !(l in given))
      if (unknown.length !== 1) throw new Error(`unknowns: ${unknown.join(',')}`)
      const u = unknown[0]
      const lhs = (t: number) => (f[1] === u ? t : given[f[1]])
      const g = (t: number) => lhs(t) - parse(f[2])({ ...given, [u]: t })
      const g0 = g(0)
      const root = -g0 / (g(1) - g0)
      if (!close(g(root), 0) || !close(g(root + 2) - g(root), 2 * (g(1) - g0))) throw new Error('the formula is not linear in the unknown')
      if (!Number.isInteger(Math.round(root * 1e9) / 1e9)) ctx.fail('the answer is not a whole number')
      return { v: Math.round(root) }
    }
    case '9.08 subject': {
      const [L, R] = big.split('=')
      const subj = txt(q.prompt).match(/^Make(\w)thesubject/)![1]
      const letters = lettersIn(big)
      const others = letters.filter((l) => l !== subj)
      return one((o) => {
        const [ol, or] = o.split('=')
        if (ol !== subj) return false
        // at several sets of values for the other letters, the option's value of the subject satisfies the formula
        return [1.5, 2.7, 4.1, 7.3].every((base, i) => {
          const env: Record<string, number> = {}
          others.forEach((l, k) => (env[l] = base + 1.3 * k + i))
          env[subj] = parse(or)(env)
          return close(parse(L)(env), parse(R)(env))
        })
      }, 'rearrange the formula correctly')
    }
  }
  ctx.fail('no independent check for this kind of question')
  return null
}
