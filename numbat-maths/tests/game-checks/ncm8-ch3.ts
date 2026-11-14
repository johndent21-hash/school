// Independent answers for the NCM 8 Chapter 3 (Algebra) class games, used by tests/games.test.ts.
// 3.01–3.05 reuse NCM 7 Chapter 5 kinds and go to that chapter's checker. New kinds use the same expression parser
// (tests/game-checks/ncm7-ch5.ts): an option is right when it equals the question's expression at several sets of
// values. For "factorise fully" questions an option equal in value is right only if nothing more can be taken out
// of its brackets; for factors and HCFs of terms, the terms are read as a number and letters with powers.
import type { GameQuestion, GameSet } from '../../src/lib/game/types'
import { NCM7_CH5 } from '../../src/content/games/ncm7-ch5'
import type { Ctx, Expect } from './ncm7-ch1'
import { lettersIn, parse, rework as rework5, same, txt } from './ncm7-ch5'

const FROM: Record<string, string[]> = { '3.01': ['5.03'], '3.02': ['5.04'], '3.03': ['5.05'], '3.04': ['5.07'], '3.05': ['5.08', '5.09'] }
const gcd = (a: number, c: number): number => (c === 0 ? Math.abs(a) : gcd(c, a % c))

/** a single term "12x^(2)y" → its number and its letters' powers */
function mono(s: string): { c: number; p: Record<string, number> } {
  const m = s.replace('−', '-').match(/^(-?\d*)((?:[a-z](?:\^\(\d+\))?)*)$/)
  if (!m) throw new Error(`not a single term: "${s}"`)
  const c = m[1] === '' ? 1 : m[1] === '-' ? -1 : Number(m[1])
  const p: Record<string, number> = {}
  for (const l of m[2].matchAll(/([a-z])(?:\^\((\d+)\))?/g)) p[l[1]] = (p[l[1]] ?? 0) + Number(l[2] ?? 1)
  return { c, p }
}
/** nothing more can be taken out: the terms inside the brackets have no common number (other than 1) or letter */
function fullyFactorised(o: string): boolean {
  const m = o.replace(/−/g, '-').match(/^(-?\d*[a-z]*)\((.+)\)$/)
  if (!m) return false
  const terms = m[2].match(/[+-]?[^+-]+/g)!.map((t) => mono(t.replace(/^\+/, '')))
  const g = terms.reduce((a, t) => gcd(a, t.c), 0)
  const common = Object.keys(terms[0].p).filter((l) => terms.every((t) => (t.p[l] ?? 0) > 0))
  return g === 1 && common.length === 0
}

export function rework(set: GameSet, q: GameQuestion, ctx: Ctx): Expect {
  const t = q.meta.t as string
  const exs = FROM[set.exercise]
  if (exs) {
    const ex = exs.find((e) => NCM7_CH5.sets.find((s) => s.exercise === e)?.makers.some((m) => m.t === t))
    if (!ex) {
      ctx.fail('reused kind not found in NCM 7 Chapter 5')
      return null
    }
    return rework5({ ...set, exercise: ex }, q, ctx)
  }
  let want: Expect = null
  try {
    want = solve(`${set.exercise} ${t}`, q, ctx)
  } catch (e) {
    ctx.fail(`could not be read: ${(e as Error).message}`)
    return null
  }
  if (want && 'text' in want && !['3.08 factor'].includes(`${set.exercise} ${t}`)) {
    if (!ctx.plain(q.why).replace(/\s/g, '').includes(want.text.replace(/\s/g, ''))) ctx.fail(`the explanation does not reach ${want.text}`)
  }
  return want
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
    case '3.06 laws':
    case '3.06 zero':
    case '3.07 expand':
    case '3.07 simplify':
    case '3.07 twoBrackets':
    case '3.09 factorise':
    case '3.11 binomial':
    case '3.11 nonmonic':
    case '3.12 square':
    case '3.13 diff':
      return one(equal(), 'equal the expression')
    case '3.09 fully':
    case '3.09 letter':
    case '3.10 negative': {
      const eq = equal()
      const ok = opts.map((o, k) => eq[k] && fullyFactorised(o) && (kind !== '3.10 negative' || /^[-−]/.test(o)))
      return one(ok, 'are equal and fully factorised')
    }
    case '3.08 hcf': {
      const terms = txt(q.prompt)
        .match(/factorof(.+)and(.+)\?$/)!
        .slice(1)
        .map(mono)
      const g = gcd(terms[0].c, terms[1].c)
      const p: Record<string, number> = {}
      for (const l of Object.keys(terms[0].p)) if (terms[1].p[l]) p[l] = Math.min(terms[0].p[l], terms[1].p[l])
      return one(
        opts.map((o) => {
          const m = mono(o)
          return m.c === g && Object.keys({ ...m.p, ...p }).every((l) => (m.p[l] ?? 0) === (p[l] ?? 0))
        }),
        'are the HCF',
      )
    }
    case '3.08 factor': {
      const target = mono(txt(q.prompt).match(/factorof(.+)\?$/)![1])
      return one(
        opts.map((o) => {
          const m = mono(o)
          return target.c % m.c === 0 && Object.keys(m.p).every((l) => (target.p[l] ?? 0) >= m.p[l])
        }),
        'divide the term',
      )
    }
  }
  ctx.fail('no independent check for this kind of question')
  return null
}
