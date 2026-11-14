// Independent answers for the NCM 9 Chapter 5 (Indices) class games, used by tests/games.test.ts.
// Reused kinds (meta.reused) are checked by their own chapters, so only the new kinds are here.
//  - index expressions are read with the NCM 7 Chapter 5 parser (√ and ∛ turned into powers ½ and ⅓) and compared by
//    value at several positive, non-whole test points; exactly one option may be equal, and it must have the form the
//    question asks for (no negative indices when a positive index is asked for; surd or index form);
//  - significant figures are counted and rounded here digit by digit (round half up on the decimal string);
//  - scientific notation: the right option must equal the number AND have 1 ≤ a < 10.
import type { GameQuestion, GameSet } from '../../src/lib/game/types'
import type { Ctx, Expect } from './ncm7-ch1'
import { lettersIn, parse, txt } from './ncm7-ch5'

// relative, so that 3 × 10⁻¹⁵ and 3 × 10⁻¹⁴ are told apart
const close = (a: number, b: number) => Number.isFinite(a) && (a === b || Math.abs(a - b) <= 1e-9 * Math.max(Math.abs(a), Math.abs(b)))
const prep = (s: string) => s.replace(/∛([a-z]|\d+)/g, '($1)^((1)/(3))').replace(/\s/g, '')
/** compact text with every √ span turned into a power ½ of its whole radicand */
const vtxt = (html: string) => txt(html.replace(/<span class="sqrt"><span class="rs">√<\/span><span class="rad">(.*?)<\/span><\/span>/g, '(($1))^(0.5)'))
const P = (s: string) => parse(prep(s))
const POINTS = [1.37, 2.91, 0.43, 3.17]
function sameValue(a: string, b: string): boolean {
  const L = [...new Set([...lettersIn(a), ...lettersIn(b)])]
  return POINTS.every((p, i) => {
    const env = Object.fromEntries(L.map((l, k) => [l, p + 0.61 * k + 0.07 * i]))
    return close(P(a)(env), P(b)(env))
  })
}

/** count significant figures of a written decimal */
function sigFigs(s: string): number {
  const t = s.replace(/^0\.0*/, '').replace('.', '').replace(/^0+/, '')
  if (!s.includes('.')) return t.replace(/0+$/, '').length
  return t.length
}
/** round a written decimal to s significant figures, half up, on its digits */
function roundSig(str: string, s: number): number {
  const neg = str.startsWith('-')
  const [ip, fp = ''] = str.replace('-', '').split('.')
  const digits = (ip + fp).split('').map(Number)
  const first = digits.findIndex((d) => d !== 0)
  const pointAt = ip.length
  const keep = first + s
  if (keep >= digits.length) return Number(str)
  let carry = digits[keep] >= 5 ? 1 : 0
  const out = digits.slice(0, keep)
  for (let k = out.length - 1; k >= 0 && carry; k--) {
    out[k] += carry
    carry = out[k] === 10 ? 1 : 0
    if (out[k] === 10) out[k] = 0
  }
  const all = [...(carry ? [1] : []), ...out, ...Array(Math.max(0, pointAt - keep)).fill(0)]
  const pt = pointAt + (carry ? 1 : 0)
  const v = Number(all.slice(0, pt).join('') + '.' + (all.slice(pt).join('') || '0'))
  return neg ? -v : v
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
  const big = vtxt(q.prompt.match(/<div class="big">(.*?)<\/div>/)?.[1] ?? '')
  const vals = q.options.map(vtxt)
  const prompt = txt(q.prompt)
  const opts = q.options.map(txt)
  const shown = q.options.map(ctx.plain)
  const words = ctx.plain(q.prompt).replace(/\s+([.?,)])/g, '$1')
  const one = (ok: boolean[], what: string): Expect => {
    const hits = ok.map((x, k) => (x ? k : -1)).filter((k) => k >= 0)
    if (hits.length !== 1) ctx.fail(`${hits.length} options ${what}`)
    return hits.length ? { text: shown[hits[0]] } : null
  }
  const num = (o: string) => Number(o.replace(/[\s ]/g, '').replace('−', '-'))
  const isSci = (o: string) => {
    const m = o.match(/^([\d.]+)×10\^\(([−-]?\d+)\)$/)
    return !!m && Number(m[1]) >= 1 && Number(m[1]) < 10
  }
  switch (kind) {
    case '5.02 alg':
    case '5.03 product':
    case '5.03 quotient':
    case '5.08 product':
    case '5.08 quotient':
    case '5.05 evalNeg':
    case '5.08 evalNeg':
    case '5.06 evalFrac':
    case '5.07 evalFrac':
    case '5.04 mix':
    case '5.08 mix':
      return one(vals.map((o) => sameValue(o, big)), 'equal the expression')
    case '5.05 alg':
      if (!/positiveindex/.test(prompt)) throw new Error('not asking for a positive index')
      return one(opts.map((o) => sameValue(o, big) && !/\^\([−-]/.test(o)), 'are equal with positive indices')
    case '5.07 surdForm': {
      const toSurd = /surdform/.test(prompt)
      return one(opts.map((o, i) => sameValue(vals[i], big) && (toSurd ? /[√∛]/.test(o) && !o.includes('^') : !/[√∛]/.test(o))), 'are equal and in the asked form')
    }
    case '5.09 count': {
      const s = words.match(/does (\S+) have\?/)![1]
      return { v: sigFigs(s) }
    }
    case '5.09 round': {
      const m = words.match(/Round ([\d .]+) to (\d) significant figures?\./)!
      const x = m[1].replace(/\s/g, '')
      const want = roundSig(x, Number(m[2]))
      return one(shown.map((o) => close(num(o), want)), 'are the rounded number')
    }
    case '5.10 toSci': {
      const x = num(ctx.plain(q.prompt.match(/<div class="big">(.*?)<\/div>/)![1]))
      const eq = opts.map((o) => close(P(o)({}), x))
      return one(opts.map((o, i) => eq[i] && isSci(o)), 'are equal and in scientific notation')
    }
    case '5.10 fromSci': {
      const v = P(big)({})
      return one(shown.map((o) => close(num(o), v)), 'equal the number')
    }
    case '5.10 order':
    case '5.11 order': {
      const vals = opts.map((o) => P(o)({}))
      if (!opts.every(isSci)) ctx.fail('an option is not in scientific notation')
      const top = Math.max(...vals)
      return one(vals.map((v) => v === top), 'are the largest')
    }
    case '5.11 calc': {
      const v = P(big)({})
      return one(opts.map((o) => close(P(o)({}), v) && isSci(o)), 'are equal and in scientific notation')
    }
  }
  ctx.fail('no independent check for this kind of question')
  return null
}
