// Independent checks for Year 7 Integers (New Century Maths 7, Chapter 1).
// Every question type is re-worked here from scratch: from the numbers it was made from (meta),
// from the drawn diagram (arrow positions, scale marks, column heights), or by putting the answer
// back into the equation shown. Wording is scanned for slips such as "1 steps" or "+ −3".
// Usage: npx tsx tests/ncm7-ch1.test.ts   (N per skill and level, default 500)
import { setSeed } from '../src/lib/maths/rand'
import { answerText, checkAnswer } from '../src/lib/maths/check'
import type { Answer, Level, Question } from '../src/lib/maths/types'
import { NCM1_SKILLS, NCM1_TEST } from '../src/content/y7-ncm1'
import { findTopic } from '../src/content/index'

const N = Number(process.env.N ?? 500)
let failures = 0
let independent = 0
const counts: Record<string, number> = {}
const fail = (id: string, msg: string, qn?: Question) => {
  failures++
  if (failures <= 40) console.log(`FAIL ${id}: ${msg}` + (qn ? `\n   ${strip(qn.prompt).slice(0, 200)}\n   answer ${JSON.stringify(qn.answer).slice(0, 160)}` : ''))
}

const strip = (h: string) =>
  h
    .replace(/<span class="frac"[^>]*><span class="fn">(.*?)<\/span><span class="fd">(.*?)<\/span><\/span>/g, '(($1)/($2))')
    .replace(/<sup>(.*?)<\/sup>/g, '^($1)')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;|&#9633;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/** JS value of a written expression. −a^(n) means −(a^n), as on the page. */
function jsValue(expr: string): number | null {
  let s = expr.replace(/−/g, '-').replace(/×/g, '*').replace(/÷/g, '/').replace(/\[/g, '(').replace(/\]/g, ')').replace(/\^/g, '**')
  s = s.replace(/(^|[^\w)])-(\d+)\*\*\((\d+)\)/g, '$1-($2**$3)')
  if (/[^0-9+\-*/(). ]/.test(s)) return null
  try {
    // eslint-disable-next-line no-new-func
    const v = Function(`"use strict"; return (${s});`)()
    return typeof v === 'number' && Number.isFinite(v) ? v : null
  } catch {
    return null
  }
}

const value = (a: Answer): number | null => (a.kind === 'num' ? a.value : null)
const near = (x: number, y: number) => Math.abs(x - y) < 1e-6 * Math.max(1, Math.abs(y))
const bigOf = (qn: Question) => qn.prompt.match(/<div class="big">(.*?)<\/div>/)?.[1]

/** Reads a number line: maps x positions to values using two labelled ticks. */
function lineScale(svg: string): ((x: number) => number) | null {
  const labels = [...svg.matchAll(/<text class="dl (?:small|tiny)" x="([\d.]+)" y="[\d.]+"[^>]*>(−?[\d ]+)<\/text>/g)].map((m) => [Number(m[1]), Number(m[2].replace('−', '-').replace(/ /g, ''))])
  if (labels.length < 2) return null
  const [a, b] = [labels[0], labels[labels.length - 1]]
  return (x) => a[1] + ((x - a[0]) / (b[0] - a[0])) * (b[1] - a[1])
}

for (const skill of NCM1_SKILLS) {
  for (const lvl of [1, 2, 3] as Level[]) {
    for (let i = 0; i < N; i++) {
      setSeed(31 + i * 7919 + lvl * 104729 + skill.id.length * 17)
      const qn = skill.gen(lvl)
      const id = `${skill.id} L${lvl}`
      const t = (qn.meta?.t as string) ?? (qn.answer.kind === 'mc' ? 'mc' : 'plain')
      counts[`${skill.id}:${t}`] = (counts[`${skill.id}:${t}`] ?? 0) + 1
      const ans = value(qn.answer)
      const m = (qn.meta ?? {}) as Record<string, any>
      const text = strip(qn.prompt + ' ' + qn.steps.join(' ') + ' ' + qn.hint)

      // the stored answer is accepted by the marker
      if (qn.answer.kind !== 'mc' && !checkAnswer(qn.answer, answerText(qn.answer)).correct) fail(id, 'answer not accepted', qn)

      // wording
      if (/\b1 (steps|floors|points|places|marks|degrees|seconds|batters|negatives)\b/.test(text)) fail(id, 'plural slip: ' + text.match(/\b1 \w+/)?.[0], qn)
      // italic letters are pronumerals (a, b, n), not the word "a"
      const words = strip((qn.prompt + ' ' + qn.steps.join(' ') + ' ' + qn.hint).replace(/<i>[^<]*<\/i>/g, 'X'))
      if (/\ba [aeiou]/.test(words.replace(/a (unit|one|usual|user|uniform)/g, ''))) fail(id, 'article slip: ' + words.match(/\ba [aeiou]\w*/)?.[0], qn)
      const noTables = strip(qn.prompt.replace(/<table[\s\S]*?<\/table>/g, ' '))
      if (/[+×÷] −\d|− −\d|\(\+/.test(noTables)) fail(id, 'negative after an operator needs brackets: ' + noTables.match(/.{0,12}([+×÷] −\d|− −\d).{0,6}/)?.[0], qn)
      if (/−0\b|NaN|undefined/.test(text)) fail(id, 'bad number text', qn)

      // re-work the answer independently
      let expected: number | null = null
      switch (t) {
        case 'opposite': expected = -m.n; break
        case 'asInteger': expected = m.sg * m.n; break
        case 'yearInt': expected = m.year; break
        case 'calendar': expected = m.year - m.zero; break
        case 'tempDiff': expected = m.hot - m.cold; break
        case 'balance': expected = m.start + m.moves.reduce((x: number, y: number) => x + y, 0); break
        case 'between': {
          const want = Array.from({ length: m.b - m.a - 1 }, (_, k) => m.a + 1 + k)
          if (qn.answer.kind !== 'nums' || JSON.stringify(qn.answer.values.slice().sort((x, y) => x - y)) !== JSON.stringify(want)) fail(id, 'integers between wrong', qn)
          independent++
          break
        }
        case 'lessThan': {
          const want = Array.from({ length: m.lim - m.from }, (_, k) => m.from + k)
          if (qn.answer.kind !== 'nums' || JSON.stringify(qn.answer.values.slice().sort((x, y) => x - y)) !== JSON.stringify(want)) fail(id, 'integers less than wrong', qn)
          independent++
          break
        }
        case 'move':
        case 'steps': expected = m.start + m.moves.reduce((x: number, y: number) => x + y, 0); break
        case 'max': expected = Math.max(...m.vals); break
        case 'min': expected = Math.min(...m.vals); break
        case 'distance': expected = Math.abs(m.a - m.b); break
        case 'minusSq': expected = m.negInside ? m.n * m.n : -m.n * m.n; break
        case 'tempChange': expected = m.max - m.min; break
        case 'walk': expected = Math.abs(m.e - m.w); break
        case 'heights': expected = m.h1 - m.h2; break
        case 'divers': expected = Math.abs(m.a - m.b); break
        case 'profitFall': expected = m.from - m.to; break
        case 'profitTotal': expected = m.vals.reduce((x: number, y: number) => x + y, 0); break
        case 'overdraft': expected = m.had - m.out + m.dep; break
        case 'sub': expected = m.down - m.up; break
        case 'cricket': expected = m.scores.reduce((x: number, y: number) => x + y, 0) - 5 * m.scores.length + m.now; break
        case 'volcano': expected = m.below + m.height + m.above; break
        case 'bird': expected = m.ask ? m.speed * m.time : m.speed * m.time - m.h; break
        case 'statement': expected = Math.round((m.start + m.moves.reduce((x: number, y: number) => x + y, 0)) * 100) / 100; break
        case 'days': {
          if (m.ask) {
            let d = 0
            while (-m.owe + d * m.per <= 0) d++
            expected = d
          } else expected = -m.owe + m.per * m.days
          break
        }
        case 'savings': expected = 26 * m.save - 6 * m.loan; break
        case 'cube': expected = -m.m; break
        case 'average': expected = (m.a + m.b) / 2; break
        case 'gridMul': expected = m.a * m.b; break
        case 'gridDiv': expected = m.a / m.b; break
        case 'calcMissing':
        case 'missingAdd':
        case 'missingSub':
        case 'missingMul':
        case 'missingDiv':
        case 'missingOrder':
          break // checked by substitution below
      }
      if (expected !== null && ans !== null) {
        independent++
        if (!near(ans, expected)) fail(id, `${t}: answer ${ans}, re-worked ${expected}`, qn)
      }

      // put the answer back into a "missing number" equation
      const eq = bigOf(qn)
      if (/^Find the missing number/.test(qn.prompt) && eq && ans !== null) {
        const [l, r] = strip(eq).replace('___', `(${ans})`).split(' = ')
        const lv = jsValue(l)
        const rv = jsValue(r)
        independent++
        if (lv === null || rv === null || !near(lv, rv)) fail(id, `missing number ${ans} doesn't make ${strip(eq)} true (${lv} vs ${rv})`, qn)
      }

      // "Mark X's work": evaluate the expression ourselves
      if (t === 'mistake' && eq && ans !== null) {
        const v = jsValue(strip(eq).split(' = ')[0])
        independent++
        if (v === null || !near(v, ans)) fail(id, `mistake: expression is ${v}, answer ${ans}`, qn)
      }

      // open answers: the example must also satisfy the equation exactly as shown
      if (qn.answer.kind === 'open') {
        const a = qn.answer
        independent++
        if (a.rule.type === 'blanks' && eq) {
          const vals = a.example.split(',').map((x) => Number(x.trim()))
          let k = 0
          const filled = strip(eq).replace(/___/g, () => `(${vals[k++]})`)
          const [l, r] = filled.split(' = ')
          const lv = jsValue(l)
          const rv = jsValue(r)
          if (lv === null || rv === null || !near(lv, rv)) fail(id, `open example ${a.example} doesn't fit ${strip(eq)}`, qn)
          if (a.rule.negative && !vals.some((x) => x < 0)) fail(id, 'open example has no negative', qn)
          if (a.rule.noZero && vals.includes(0)) fail(id, 'open example has a zero', qn)
        }
        if (a.rule.type === 'brackets') {
          const plain = jsValue(strip(a.rule.expr))
          if (plain === null || near(plain, a.rule.target)) fail(id, 'brackets: target needs no brackets', qn)
          if (!new RegExp(`= ${String(a.rule.target).replace('-', '−')}`).test(strip(qn.prompt))) fail(id, 'brackets: target not shown', qn)
        }
        if (a.rule.type === 'use') {
          const shown = strip(qn.prompt).match(/integers (.*?) once/)?.[1]
          const listed = (shown ?? '').replace(/ and /, ', ').split(', ').map((x) => Number(x.replace('−', '-')))
          if (JSON.stringify(listed.slice().sort()) !== JSON.stringify(a.rule.numbers.slice().sort())) fail(id, `use: numbers shown ${shown} vs rule ${a.rule.numbers}`, qn)
          const v = jsValue(a.example)
          if (v === null || !near(v, a.rule.target)) fail(id, 'use: example does not equal target', qn)
        }
      }

      // diagrams: read the answer back off the drawing
      const svg = qn.diagram ?? ''
      if (t === 'arrow') {
        const letter = qn.prompt.match(/arrow <b>([A-D])<\/b>/)?.[1]
        const ax = svg.match(new RegExp(`<text class="dl small hl" x="([\\d.]+)" y="[\\d.]+"[^>]*>${letter}</text>`))?.[1]
        const toVal = lineScale(svg)
        independent++
        if (!ax || !toVal || !near(Math.round(toVal(Number(ax))), ans ?? NaN)) fail(id, `arrow ${letter} reads ${ax && toVal ? toVal(Number(ax)) : '?'} not ${ans}`, qn)
      }
      if (t === 'complete') {
        const ax = svg.match(/<text class="dl small hl" x="([\d.]+)" y="[\d.]+"[^>]*>\?<\/text>/)?.[1]
        const toVal = lineScale(svg)
        independent++
        if (!ax || !toVal || !near(Math.round(toVal(Number(ax)) * 1000) / 1000, ans ?? NaN)) fail(id, `? reads ${ax && toVal ? toVal(Number(ax)) : '?'} not ${ans}`, qn)
      }
      if (t === 'move') {
        const cx = svg.match(/<circle class="nlring" cx="([\d.]+)"/)?.[1]
        const toVal = lineScale(svg)
        independent++
        if (!cx || !toVal || !near(Math.round(toVal(Number(cx))), m.start)) fail(id, `marker drawn at ${cx && toVal ? toVal(Number(cx)) : '?'} not ${m.start}`, qn)
      }
      if (t === 'scaleRead' || t === 'scaleDiff') {
        // vScale: top 16, height 300, from 100 down to −60
        const toVal = (y: number) => 100 - ((y - 16) / 300) * 160
        const marks = [...svg.matchAll(/<text class="dl tiny hl" x="[\d.]+" y="([\d.]+)"[^>]*>([^<]+)<\/text>/g)].map((mm) => [mm[2], Math.round(toVal(Number(mm[1])))] as const)
        const named = (label: string) => marks.find(([l]) => label.includes(l))?.[1]
        const bold = [...qn.prompt.matchAll(/<b>(.*?)<\/b>/g)].map((mm) => mm[1])
        independent++
        if (t === 'scaleRead' && named(bold[0]) !== ans) fail(id, `scale mark for ${bold[0]} drawn at ${named(bold[0])}, answer ${ans}`, qn)
        if (t === 'scaleDiff' && (named(bold[0])! - named(bold[1])!) !== ans) fail(id, `scale marks differ by ${named(bold[0])! - named(bold[1])!}, answer ${ans}`, qn)
      }
      if (t === 'iceberg') {
        // vScale: top 16, height 300, from 40 down to −100
        const r = svg.match(/<rect class="sh" x="[\d.]+" y="([\d.]+)" width="[\d.]+" height="([\d.]+)"/)
        const toVal = (y: number) => 40 - ((y - 16) / 300) * 140
        const top = Math.round(toVal(Number(r?.[1])))
        const bottom = Math.round(toVal(Number(r?.[1]) + Number(r?.[2])))
        const want = m.ask === 'above' ? top : m.ask === 'below' ? -bottom : top - bottom
        independent++
        if (want !== ans) fail(id, `iceberg drawn from ${top} to ${bottom}, answer ${ans}`, qn)
      }
      if (t === 'profitFall' || t === 'profitTotal') {
        const bars = [...svg.matchAll(/<rect class="bar" x="[\d.]+" y="([\d.]+)" width="[\d.]+" height="([\d.]+)"/g)].map((mm) => [Number(mm[1]), Number(mm[2])])
        const zeroY = Number(svg.match(/<line class="axis" x1="58" y1="([\d.]+)" x2="366"/)?.[1])
        const gridYs = [...svg.matchAll(/<text class="dl tiny" x="50" y="([\d.]+)"[^>]*>(−?\d+)<\/text>/g)].map((mm) => [Number(mm[1]), Number(mm[2].replace('−', '-'))])
        const perPx = (gridYs[0][1] - gridYs[1][1]) / (gridYs[1][0] - gridYs[0][0])
        const vals = bars.map(([y, h]) => Math.round((Math.abs(y - zeroY) < 0.5 ? -h : h) * perPx))
        independent++
        if (JSON.stringify(vals) !== JSON.stringify(m.vals ?? vals) && t === 'profitTotal') fail(id, `columns drawn ${vals} vs data ${m.vals}`, qn)
        if (t === 'profitTotal' && vals.reduce((x, y) => x + y, 0) !== ans) fail(id, `columns total ${vals.reduce((x, y) => x + y, 0)}, answer ${ans}`, qn)
      }
      if (t === 'compare') {
        const a = qn.answer as Extract<Answer, { kind: 'mc' }>
        independent++
        if (!a.options[a.correct].startsWith(m.a < m.b ? '&lt;' : '&gt;')) fail(id, 'compare symbol wrong', qn)
      }
      if (t === 'order') {
        const a = qn.answer as Extract<Answer, { kind: 'mc' }>
        const want = m.vals.slice().sort((x: number, y: number) => (m.asc ? x - y : y - x)).map((x: number) => String(x).replace('-', '−')).join(', ')
        independent++
        if (a.options[a.correct] !== want) fail(id, `order: ${a.options[a.correct]} vs ${want}`, qn)
      }
      if (t === 'sq') {
        independent++
        if (qn.answer.kind !== 'nums' || JSON.stringify(qn.answer.values.slice().sort((x, y) => x - y)) !== JSON.stringify([-m.n, m.n])) fail(id, 'square roots wrong', qn)
      }
      if (t === 'sumProduct' && qn.answer.kind === 'nums') {
        const [x, y] = qn.answer.values
        independent++
        if (!strip(qn.prompt).includes(`sum of ${String(x + y).replace('-', '−')} and a product of ${String(x * y).replace('-', '−')}`)) fail(id, 'sum/product not as stated', qn)
      }
    }
  }
}

// the topic test follows Test Yourself 1: 12 questions in exercise order, calculator only on 1.09
const topic = findTopic('y7-integers')!
if (NCM1_TEST.length !== 12) fail('test', `has ${NCM1_TEST.length} questions, not 12`)
const order = NCM1_SKILLS.map((s) => s.id)
NCM1_TEST.forEach((item, k) => {
  if (!topic.skills.some((s) => s.id === item.skill)) fail('test', `unknown skill ${item.skill}`)
  if (k > 0 && order.indexOf(item.skill) < order.indexOf(NCM1_TEST[k - 1].skill)) fail('test', `question ${k + 1} is out of exercise order`)
  for (let i = 0; i < 300; i++) {
    setSeed(5 + i * 31 + k)
    const qn = item.gen!(item.level)
    if (qn.answer.kind !== 'mc' && !checkAnswer(qn.answer, answerText(qn.answer)).correct) fail('test', `Q${k + 1} answer not accepted`, qn)
    if (!!qn.calc !== (item.skill === 'y7-int-calc')) fail('test', `Q${k + 1} calculator flag is ${!!qn.calc}`, qn)
  }
})
if (topic.skills.filter((s) => s.ref?.startsWith('NCM 7 Ex')).map((s) => s.ref).join() !== Array.from({ length: 10 }, (_, k) => `NCM 7 Ex 1.${String(k + 1).padStart(2, '0')}`).join())
  fail('topic', 'exercises are not 1.01 to 1.10 in order')

console.log(Object.entries(counts).map(([k, v]) => `${k} ${v}`).join('\n'))
console.log(`${independent} independent checks`)
if (failures) {
  console.log(`${failures} failures`)
  process.exit(1)
}
console.log('All Chapter 1 checks passed')
