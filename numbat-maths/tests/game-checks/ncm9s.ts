// Independent answers for the new kinds in the NCM 9 Standard class games (src/content/games/ncm9s.ts), used by
// tests/games.test.ts. Reused kinds (meta.reused) are checked by the chapter that first made them.
// Every answer is worked out from what the question shows (binomial products, negative indices, angle reasons, Euler's
// formula, pay, taxable income, tax scales, PAYG tables, refunds, unit conversions, measurement error, interval length
// and midpoint, intercepts, horizontal and vertical lines, direct variation, parabolas, multistage probability, scales),
// and exactly one option must have that value; probabilities must be in simplest form.
import type { GameQuestion, GameSet } from '../../src/lib/game/types'
import type { Ctx, Expect } from './ncm7-ch1'

const close = (a: number, b: number) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b))
const n = (s: string) => Number(s.replace(/[\s ,$]/g, '').replace(/−/g, '-'))
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
const sgn = (v: number) => (v < 0 ? `−${-v}` : String(v))
/** "2h+8", "3−x" (no spaces) → [coefficient of the letter, constant] */
function linear(s: string): [number, number] {
  let [k, c] = [0, 0]
  const t = s.replace(/−/g, '-')
  for (const m of t.matchAll(/([+-]?)(\d*)([a-z]?)/g)) {
    if (!m[0]) continue
    const sign = m[1] === '-' ? -1 : 1
    if (m[3]) k += sign * (m[2] ? Number(m[2]) : 1)
    else if (m[2]) c += sign * Number(m[2])
  }
  return [k, c]
}
/** "6h^2 − 31h − 40" → [6, −31, −40]; null if it is not a polynomial in one letter of degree ≤ 2 */
function poly(o: string): number[] | null {
  const t = o.replace(/\s/g, '').replace(/−/g, '-')
  const out = [0, 0, 0]
  let used = ''
  for (const m of t.matchAll(/([+-]?)(\d*)([a-z]?)(\^2)?/g)) {
    if (!m[0]) continue
    used += m[0]
    const sign = m[1] === '-' ? -1 : 1
    const v = sign * (m[2] ? Number(m[2]) : 1)
    if (!m[3] && !m[2]) return null
    out[m[3] ? (m[4] ? 0 : 1) : 2] += m[3] ? v : sign * Number(m[2])
  }
  return used === t ? out : null
}

export function rework(set: GameSet, q: GameQuestion, ctx: Ctx): Expect {
  try {
    return solve(String(q.meta.t), q, ctx)
  } catch (e) {
    ctx.fail(`could not be read: ${(e as Error).message}`)
    return null
  }
}

function solve(t: string, q: GameQuestion, ctx: Ctx): Expect {
  const w = ctx.plain(q.prompt).replace(/\s+([.?,):])/g, '$1').replace(/\(\s+/g, '(')
  const shown = q.options.map(ctx.plain)
  /** exactly one option has value v when read with `read` */
  const one = (v: number, read: (o: string) => number | null, what: string): Expect => {
    const hits = shown.filter((o) => {
      const x = read(o)
      return x !== null && close(x, v)
    })
    if (hits.length !== 1) ctx.fail(`${hits.length} options equal ${v} (${what})`)
    return hits.length ? { text: hits[0] } : null
  }
  const money = (o: string) => (/^\$[\d\s ,]+(\.\d\d)?$/.test(o) ? n(o) : null)
  const unit = (u: string) => (o: string) => {
    const m = o.match(new RegExp(`^(−?[\\d.\\s\\u00a0]+)${u}$`))
    return m ? n(m[1]) : null
  }
  const dollars = [...w.matchAll(/\$([\d ,]+(?:\.\d+)?)/g)].map((m) => n(m[1]))
  const pt = (s: string) => s.match(/\((−?\d+(?:\.\d+)?), (−?\d+(?:\.\d+)?)\)/g)!.map((p) => p.slice(1, -1).split(', ').map(n))
  const prob = (num: number, den: number): Expect => {
    const g = gcd(num, den)
    const want = num === den ? '1' : `(${num / g}/${den / g})`
    const hits = shown.filter((o) => {
      const m = o.match(/^\((\d+)\/(\d+)\)$/)
      return m ? Number(m[1]) * den === Number(m[2]) * num : o === '1' ? num === den : false
    })
    if (hits.length !== 1) ctx.fail(`${hits.length} options equal ${num}/${den}`)
    return { text: want }
  }
  switch (t) {
    case 'euler': {
      const V = w.match(/(\d+) vertices/)?.[1]
      const E = w.match(/(\d+) edges/)?.[1]
      const Fc = w.match(/(\d+) faces/)?.[1]
      // V − E + F = 2
      const v = /How many faces/.test(w) ? 2 - n(V!) + n(E!) : /How many edges/.test(w) ? n(V!) + n(Fc!) - 2 : 2 + n(E!) - n(Fc!)
      return { v }
    }
    case 'wage': {
      const h = n(w.match(/for (\d+) hours/)![1])
      return one(dollars[0] * h, money, 'money')
    }
    case 'salary': {
      const weekly = dollars[0] / 52
      return one(/fortnightly/.test(w) ? weekly * 2 : weekly, money, 'money')
    }
    case 'overtime': {
      const m = w.match(/for (\d+) normal hours and (\d+) hours at (double time|time-and-a-half)/)!
      const r = dollars[0]
      return one(n(m[1]) * r + n(m[2]) * r * (m[3] === 'double time' ? 2 : 1.5), money, 'money')
    }
    case 'commission': {
      const p = n(w.match(/(\d+)% commission/)![1])
      const retainer = /retainer/.test(w) ? dollars[0] : 0
      const sales = dollars[dollars.length - 1]
      return one(retainer + (sales * p) / 100, money, 'money')
    }
    case 'piece': {
      const count = n(w.match(/pay for (\d+)\?/)![1])
      return one(dollars[0] * count, money, 'money')
    }
    case 'leave':
      return one((4 * dollars[0] * 17.5) / 100, money, 'money')
    case 'tax': {
      const c = n(w.match(/(\d+)c is paid for each \$1 over/)![1])
      const [free, income] = [dollars[0], dollars[dollars.length - 1]]
      return one(Math.max(0, income - free) * (c / 100), money, 'money')
    }
    case 'net': {
      const [gross, tax, other] = dollars
      return one(gross - tax - other, money, 'money')
    }
    case 'abs': {
      const m = w.match(/A measurement is ([\d.]+) (\w+), to the nearest (?:([\d.]+) )?(\w+)\./)!
      const step = m[3] ? Number(m[3]) : 1
      const half = step / 2
      if (/What is the absolute error/.test(w)) return one(half, unit(` ${m[2]}`), 'a length')
      const x = Number(m[1])
      const hits = shown.filter((o) => {
        const r = o.match(/^([\d.]+) \w+ to ([\d.]+) \w+$/)
        return !!r && close(Number(r[1]), x - half) && close(Number(r[2]), x + half)
      })
      if (hits.length !== 1) ctx.fail(`${hits.length} options give the limits`)
      return hits.length ? { text: hits[0] } : null
    }
    case 'pct': {
      const m = w.match(/measured as (\d+) (\w+), to the nearest \2\./)!
      return one((0.5 / Number(m[1])) * 100, unit('%'), 'a percentage')
    }
    case 'length': {
      const [[x1, y1], [x2, y2]] = pt(w)
      return { v: Math.hypot(x2 - x1, y2 - y1) }
    }
    case 'midpoint': {
      const [[x1, y1], [x2, y2]] = pt(w)
      const f = (v: number) => (v < 0 ? `−${-v}` : String(v))
      return { text: `(${f((x1 + x2) / 2)}, ${f((y1 + y2) / 2)})` }
    }
    case 'direct': {
      const m = w.match(/= (\d+) when \w = (\d+)\. Find \w when \w = (\d+)\./)!
      return { v: (Number(m[1]) / Number(m[2])) * Number(m[3]) }
    }
    case 'parabola': {
      const m = w.replace(/\s/g, '').match(/y=(−?\d*)x\^2([+−]\d+)?/)!
      const a = m[1] === '' ? 1 : m[1] === '−' ? -1 : n(m[1])
      const c = m[2] ? n(m[2].replace('+', '')) : 0
      const f = (v: number) => (v < 0 ? `−${-v}` : String(v))
      if (/turning point/.test(w)) return { text: `(0, ${f(c)})` }
      const x = n(w.replace(/\s/g, '').match(/whenx=(−?\d+)\?/)![1])
      return { text: f(a * x * x + c) }
    }
    case 'apply': {
      const m = w.replace(/\s/g, '').match(/h=(\d+)t−5t\^2.*after(\d+)s\?/)!
      const [v, s] = [Number(m[1]), Number(m[2])]
      return one(v * s - 5 * s * s, unit(' m'), 'metres')
    }
    case 'outcomes': {
      const stages: Record<string, number> = { coin: 2, die: 6, dice: 6, coins: 2 }
      const parts = w.match(/when (.+)\?/)![1]
      let total = 1
      for (const m of parts.matchAll(/(a|two|three) (coin|die|dice|coins|spinner with (\d+) equal sectors)/g)) {
        const count = m[1] === 'two' ? 2 : m[1] === 'three' ? 3 : 1
        const each = m[3] ? Number(m[3]) : stages[m[2]]
        total *= each ** count
      }
      return { v: total }
    }
    case 'tree': {
      let m = w.match(/has (\d+) red and (\d+) blue marbles\. One is drawn, replaced, and a second is drawn\. What is the probability that both are red\?/)
      if (m) {
        const [r, bl] = [Number(m[1]), Number(m[2])]
        return prob(r * r, (r + bl) * (r + bl))
      }
      // the sample space listed in full
      const coins = w.match(/(Two|Three) fair coins/)
      if (coins) {
        const k = coins[1] === 'Two' ? 2 : 3
        const all = Array.from({ length: 2 ** k }, (_, i) => Array.from({ length: k }, (_, j) => ((i >> j) & 1 ? 'H' : 'T')))
        const fav = /two heads/.test(w) ? all.filter((o) => o.every((x) => x === 'H')).length : /at least one head/.test(w) ? all.filter((o) => o.includes('H')).length : all.filter((o) => o.every((x) => x === 'T')).length
        return prob(fav, all.length)
      }
      if (/coin is tossed and a fair die/.test(w)) return prob(1, 12)
      m = w.match(/Two fair dice.*double six/)
      if (m) return prob(1, 36)
      throw new Error('unknown tree question')
    }
    // ---- added in the coverage audit
    case 'general': {
      // (ax + b)(cx + d) read from the prompt, expanded, and matched to the options as polynomials
      const m = w.replace(/\s/g, '').match(/simplify:\((.+?)\)\((.+?)\)/)!
      const [p, q] = [linear(m[1]), linear(m[2])]
      const want = [p[0] * q[0], p[0] * q[1] + p[1] * q[0], p[1] * q[1]]
      const hits = shown.filter((o) => {
        const got = poly(o)
        return !!got && got.every((v, i) => v === want[i])
      })
      if (hits.length !== 1) ctx.fail(`${hits.length} options equal ${want.join(', ')}`)
      return hits.length ? { text: hits[0] } : null
    }
    case 'negWrite': {
      const val = (s0: string) => {
        const m = s0.replace(/\s/g, '').match(/^(−)?(\(1\/)?(\(−\d+\)|\d+)\^(−?\d+)\)?$/)
        if (!m) return null
        const [base, e] = [n(m[3].replace(/[()]/g, '')), n(m[4])]
        return (m[1] ? -1 : 1) * (m[2] ? 1 / base ** e : base ** e)
      }
      const m = w.replace(/\s/g, '').match(/^Write(.+)usinga(negative|positive)index\.$/)!
      const v = val(m[1])!
      const negative = m[2] === 'negative'
      const hits = shown.filter((o) => {
        const x = val(o)
        const negIndex = /\^−/.test(o) && !/\(1\//.test(o)
        return x !== null && close(x, v) && negIndex === negative
      })
      if (hits.length !== 1) ctx.fail(`${hits.length} options equal ${v} in the right form`)
      return hits.length ? { text: hits[0] } : null
    }
    case 'reason': {
      let m: RegExpMatchArray | null
      const sum = (want: number, ...xs: string[]) => {
        if (xs.reduce((a, x) => a + n(x), 0) !== want) ctx.fail(`the angles do not add to ${want}`)
      }
      let want = ''
      if (/AB = BC = CA, so ∠A = 60°/.test(w)) want = 'Angles of an equilateral △ are 60°'
      else if ((m = w.match(/AB = AC and ∠B = (\d+)°, so ∠C = (\d+)°/))) {
        if (m[1] !== m[2]) ctx.fail('base angles differ')
        want = 'Base angles of an isosceles △ are equal'
      } else if ((m = w.match(/extended to D\. ∠A = (\d+)° and ∠B = (\d+)°, so ∠ACD = (\d+)°/))) {
        if (n(m[1]) + n(m[2]) !== n(m[3])) ctx.fail('exterior angle is not the sum')
        want = 'Exterior ∠ = sum of interior opposite ∠s'
      } else if ((m = w.match(/extended to D and ∠ACD = (\d+)°, so ∠ACB = (\d+)°/))) {
        sum(180, m[1], m[2])
        want = 'Angles on a straight line add to 180°'
      } else if ((m = w.match(/In △ABC, ∠A = (\d+)° and ∠B = (\d+)°, so ∠C = (\d+)°/))) {
        sum(180, m[1], m[2], m[3])
        want = 'Angle sum of a triangle is 180°'
      } else if ((m = w.match(/quadrilateral ABCD, ∠A = (\d+)°, ∠B = (\d+)° and ∠C = (\d+)°, so ∠D = (\d+)°/))) {
        sum(360, m[1], m[2], m[3], m[4])
        want = 'Angle sum of a quadrilateral is 360°'
      } else if ((m = w.match(/parallelogram and ∠A = (\d+)°, so ∠C = (\d+)°/))) {
        if (m[1] !== m[2]) ctx.fail('opposite angles differ')
        want = 'Opposite ∠s of a parallelogram are equal'
      } else if ((m = w.match(/parallelogram and ∠A = (\d+)°, so ∠B = (\d+)°/))) {
        sum(180, m[1], m[2])
        want = 'Co-interior angles, AD ∥ BC'
      } else if ((m = w.match(/kite with AB = AD and CB = CD\. ∠B = (\d+)°, so ∠D = (\d+)°/))) {
        if (m[1] !== m[2]) ctx.fail('kite angles differ')
        want = 'Kite: one pair of opposite ∠s are equal'
      } else if (/rhombus and its diagonals meet at E, so ∠AEB = 90°/.test(w)) want = 'Diagonals of a rhombus are perpendicular'
      else throw new Error('unknown step')
      return { text: want }
    }
    case 'taxable': {
      const k = /a fortnight/.test(w) ? 26 : /a week/.test(w) ? 52 : 1
      const [pay, d1, d2] = dollars
      return one(pay * k - d1 - d2, money, 'money')
    }
    case 'bracket': {
      const m = w.match(/tax is \$([\d ,]+) plus (\d+)c for each \$1 over \$([\d ,]+)\. Find the tax on \$([\d ,]+)\./)!
      return one(n(m[1]) + ((n(m[4]) - n(m[3])) * n(m[2])) / 100, money, 'money')
    }
    case 'payg': {
      const m = w.match(/weekly pay \$(\d+)–\$(\d+), \$(\d+) withheld; \$(\d+)–\$(\d+), \$(\d+) withheld\. \w+ earns \$(\d+) a week for (\d+) weeks/)!
      const [a1, b1, t1, a2, b2, t2, e, wk] = m.slice(1).map(n)
      const t = e >= a1 && e <= b1 ? t1 : e >= a2 && e <= b2 ? t2 : NaN
      return one(t * wk, money, 'money')
    }
    case 'refund': {
      const [tax, paid] = dollars
      const kind = paid > tax ? 'refund' : 'tax debt'
      const hits = shown.filter((o) => {
        const m = o.match(/^(refund|tax debt) of (\$[\d ,]+)$/)
        return !!m && m[1] === kind && close(n(m[2]), Math.abs(paid - tax))
      })
      if (hits.length !== 1) ctx.fail(`${hits.length} options give a ${kind} of ${Math.abs(paid - tax)}`)
      return hits.length ? { text: hits[0] } : null
    }
    case 'chain': {
      const SIZE: Record<string, number> = { mm: 1e-3, cm: 1e-2, m: 1, km: 1e3, mg: 1e-3, g: 1, kg: 1e3, t: 1e6, mL: 1e-3, L: 1, kL: 1e3, ML: 1e6 }
      const WORD: Record<string, string> = { millilitres: 'mL', litres: 'L', kilolitres: 'kL', megalitres: 'ML', millimetres: 'mm', centimetres: 'cm', kilometres: 'km', milligrams: 'mg', grams: 'g', kilograms: 'kg', tonnes: 't' }
      const m = w.match(/^Convert ([\d. ]+) (\w+) to (\w+)\.$/)!
      const to = WORD[m[3]]
      return { v: Number(((n(m[1]) * SIZE[m[2]]) / SIZE[to]).toPrecision(12)), unit: to }
    }
    case 'xInt': {
      const [mm, c] = linear(w.replace(/\s/g, '').match(/liney=(.+?)crossthe/)![1])
      return { text: `(${sgn(-c / mm)}, 0)` }
    }
    case 'hv': {
      const [[x, y]] = pt(w)
      return { text: /horizontal/.test(w) ? `y = ${sgn(y)}` : `x = ${sgn(x)}` }
    }
    case 'shape': {
      const m = w.replace(/\s/g, '').match(/y=(−?\d*)x\^2([+−]\d+)?\?/)!
      const a = m[1] === '' ? 1 : m[1] === '−' ? -1 : n(m[1])
      const c = m[2] ? n(m[2].replace('+', '')) : 0
      return { text: `concave ${a > 0 ? 'up' : 'down'}, vertex (0, ${sgn(c)})` }
    }
    case 'noRep': {
      const m = w.match(/has (\d+) red and (\d+) blue marbles\. Two are drawn without replacement\. What is the probability that both are red\?/)
      if (m) {
        const [r, bl] = [n(m[1]), n(m[2])]
        return prob(r * (r - 1), (r + bl) * (r + bl - 1))
      }
      const d = w.match(/The digits ([\d, ]+) are on (\d+) cards\. Two cards are drawn without replacement to make a 2-digit number/)!
      const k = d[1].split(',').length
      if (k !== n(d[2])) ctx.fail('the number of cards does not match the digits')
      return { v: k * (k - 1) }
    }
    case 'findScale': {
      const r6 = (x: number) => Math.round(x * 1e6) / 1e6
      let m = w.match(/is (\d+) cm long\. The real \w+ is ([\d.]+) m long/)
      if (m) return { text: `1 : ${r6((n(m[2]) * 100) / n(m[1]))}` }
      m = w.match(/ ([\d.]+) cm long\. The real one is (\d+) mm long/)!
      return { text: `${r6((n(m[1]) * 10) / n(m[2]))} : 1` }
    }
  }
  ctx.fail('no independent check for this kind of question')
  return null
}
