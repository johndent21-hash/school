// Year 7 chemistry (the science section): every lesson's questions generated many times. Calculations are re-worked
// from the numbers in the question text; drawings are read back (heating curve, atom models, particle boxes); element
// data is checked against a separately typed table; practice sets are built as the site builds them.
//   N=200 npx tsx tests/science.test.ts
import { ALL_TOPICS, SCIENCE_TOPICS, findSkill, findTopic, topicsForYear } from '../src/content/index'
import { answerText, checkAnswer } from '../src/lib/maths/check'
import { setSeed } from '../src/lib/maths/rand'
import type { Level, Question } from '../src/lib/maths/types'
import { buildSet, setLevelsFor } from '../app/src/lib/practice'

const N = Number(process.env.N ?? 200)
let failures = 0
const seen = new Map<string, number>()
function fail(where: string, msg: string, q?: Question) {
  failures++
  const k = `${where}: ${msg}`
  seen.set(k, (seen.get(k) ?? 0) + 1)
  if ((seen.get(k) ?? 0) === 1 && failures < 60) console.log(`FAIL ${k}${q ? `\n   ${plain(q.prompt).slice(0, 160)}` : ''}`)
}
const plain = (h: string) =>
  h
    .replace(/<sub>(\d+)<\/sub>/g, '_$1')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
const nums = (s: string) => [...plain(s).matchAll(/−?\d+(?:\.\d+)?/g)].map((m) => Number(m[0].replace('−', '-')))
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6 * Math.max(1, Math.abs(a))

// ---- the element data, typed again separately: [symbol, atomic number, mass number of the most common isotope]
const PT: Record<string, [number, number]> = {
  H: [1, 1], He: [2, 4], Li: [3, 7], Be: [4, 9], B: [5, 11], C: [6, 12], N: [7, 14], O: [8, 16], F: [9, 19], Ne: [10, 20],
  Na: [11, 23], Mg: [12, 24], Al: [13, 27], Si: [14, 28], P: [15, 31], S: [16, 32], Cl: [17, 35], Ar: [18, 40], K: [19, 39], Ca: [20, 40],
}
const NAME: Record<string, string> = {
  hydrogen: 'H', helium: 'He', lithium: 'Li', beryllium: 'Be', boron: 'B', carbon: 'C', nitrogen: 'N', oxygen: 'O', fluorine: 'F', neon: 'Ne',
  sodium: 'Na', magnesium: 'Mg', aluminium: 'Al', silicon: 'Si', phosphorus: 'P', sulfur: 'S', chlorine: 'Cl', argon: 'Ar', potassium: 'K', calcium: 'Ca',
}
const arrangement = (z: number) => {
  const out: number[] = []
  let left = z
  for (const cap of [2, 8, 8, 18]) {
    if (left <= 0) break
    out.push(Math.min(cap, left))
    left -= cap
  }
  return out
}
const elementIn = (text: string) => {
  const t = plain(text).toLowerCase()
  const hit = Object.keys(NAME).find((n) => new RegExp(`\\b${n}\\b`).test(t))
  return hit ? NAME[hit] : null
}
/** atoms in a formula written with subscripts, e.g. C_6 H_12 O_6 */
function countFormula(f: string): Record<string, number> {
  const out: Record<string, number> = {}
  for (const m of f.replace(/\s/g, '').matchAll(/([A-Z][a-z]?)(?:_(\d+))?/g)) out[m[1]] = (out[m[1]] ?? 0) + Number(m[2] ?? 1)
  return out
}

// ---- drawings
/** the heating curve: time and temperature scales from the tick labels, then the polyline's vertices */
function readCurve(svg: string) {
  const texts = [...svg.matchAll(/<text x="([\d.]+)" y="([\d.]+)"[^>]*>([^<]*)<\/text>/g)].map((m) => ({ x: +m[1], y: +m[2], s: m[3] }))
  const timeTicks = texts.filter((t) => t.y === 238 && /^\d+$/.test(t.s))
  const tempTicks = texts.filter((t) => /^[−\d]+$/.test(t.s) && t.y !== 238).map((t) => ({ y: t.y - 5, T: Number(t.s.replace('−', '-')) }))
  const xt = (x: number) => {
    const [a, b] = [timeTicks[0], timeTicks[timeTicks.length - 1]]
    return Number(a.s) + ((x - a.x) / (b.x - a.x)) * (Number(b.s) - Number(a.s))
  }
  const yT = (y: number) => {
    const [a, b] = [tempTicks[0], tempTicks[tempTicks.length - 1]]
    return a.T + ((y - a.y) / (b.y - a.y)) * (b.T - a.T)
  }
  const pts = svg
    .match(/<polyline class="plot" points="([^"]+)"/)![1]
    .split(' ')
    .map((p) => p.split(',').map(Number))
    .map(([x, y]) => [Math.round(xt(x) * 10) / 10, Math.round(yT(y))] as [number, number])
  const labels = texts.filter((t) => /^[A-E]$/.test(t.s)).map((t) => ({ s: t.s, t: xt(t.x) }))
  return { pts, labels }
}
/** circles of each class in each of the four boxes of a fourBoxes drawing */
function readBoxes(svg: string): Set<string>[] {
  const boxes = [new Set<string>(), new Set<string>(), new Set<string>(), new Set<string>()]
  for (const m of svg.matchAll(/<circle class="(at\d)" cx="([\d.]+)"/g)) boxes[Math.min(3, Math.floor(+m[2] / 134))].add(m[1])
  return boxes
}
const KINDS_OF_ATOM: Record<string, number> = { solid: 1, liquid: 1, gas: 1, element: 1, elementMolecules: 1, compound: 2, mixElements: 2, mixElementCompound: 3, mixCompounds: 4 }

// ---- the science topics: three, 30 lessons numbered 1–30, Year 7, apart from the maths topics
const skills = SCIENCE_TOPICS.flatMap((t) => t.skills.map((s) => ({ s, t })))
if (skills.length !== 30) fail('science', `${skills.length} lessons, expected 30`)
skills.forEach(({ s }, i) => s.lessonNo !== i + 1 && fail(s.id, `lesson number ${s.lessonNo}, expected ${i + 1}`))
if (new Set(skills.map(({ s }) => s.id)).size !== 30) fail('science', 'two lessons share an id')
if (ALL_TOPICS.some((t) => t.subject === 'science') || topicsForYear(7).some((t) => t.subject === 'science')) fail('science', 'a science topic is listed with the maths topics')
for (const { s, t } of skills) {
  if (findSkill(s.id)?.skill !== s || findTopic(t.id) !== t) fail(s.id, 'not found by its id')
  if (!s.outcomes.some((o) => /^SC4-(SOL|PRT|CHG)-01$/.test(o))) fail(s.id, 'no chemistry outcome code')
  if (!s.learn.intro || s.learn.keyPoints.length < 2) fail(s.id, 'the lesson needs an introduction and key points')
}

// ---- every question
let checked = 0
let reworked = 0
for (const { s } of skills) {
  for (const level of [1, 2, 3] as Level[]) {
    for (let i = 0; i < N; i++) {
      setSeed(1000 + i * 7919 + level * 104729 + (s.lessonNo ?? 0) * 31)
      let q: Question
      try {
        q = s.gen(level)
      } catch (e) {
        fail(s.id, `threw ${(e as Error).message}`)
        break
      }
      checked++
      const where = `${s.id} ${q.meta?.t}`
      const blob = q.prompt + (q.diagram ?? '') + q.steps.join(' ') + (q.answer.kind === 'mc' ? q.answer.options.join(' ') : '')
      if (/undefined|NaN|\[object|null/.test(blob)) fail(where, 'bad text', q)
      if (!plain(q.prompt) || !q.steps.length || !plain(q.steps.join(' '))) fail(where, 'empty question or explanation', q)
      if (plain(q.prompt).length > 520) fail(where, 'question too long', q)
      // the right answer, typed as the site shows it, is marked right
      // (a multiple-choice answer is the chosen option's number, as the practice page sends it)
      if (!checkAnswer(q.answer, q.answer.kind === 'mc' ? String(q.answer.correct) : answerText(q.answer)).correct) fail(where, 'the answer is not accepted by the marking', q)
      let right = ''
      if (q.answer.kind === 'mc') {
        const o = q.answer.options
        if (o.length !== 4) fail(where, `${o.length} options`, q)
        if (new Set(o.map((x) => plain(x))).size !== o.length) fail(where, 'two options read the same', q)
        if (q.answer.correct < 0 || q.answer.correct >= o.length) fail(where, 'no right option', q)
        if (o.some((x) => plain(x).length > 150)) fail(where, 'an option is too long', q)
        right = plain(o[q.answer.correct])
      }
      const n = q.answer.kind === 'num' ? q.answer.value : NaN
      const P = nums(q.prompt.replace(/<table[\s\S]*<\/table>/, ''))
      const want = (v: number) => {
        reworked++
        if (!near(n, v)) fail(where, `expected ${v}, the answer is ${n}`, q)
      }
      const wantText = (v: string) => {
        reworked++
        if (right !== v) fail(where, `expected "${v}", the answer is "${right}"`, q)
      }
      const t = q.meta?.t
      // --- density and volume (Lessons 6–7): from the numbers in the question
      if (s.id === 'sci7-density' && t === 'calc') want(P[0] / P[1])
      if (s.id === 'sci7-density' && t === 'mass') want(P[0] * P[1])
      if (s.id === 'sci7-density' && t === 'volume') want(P[1] / P[0])
      if (s.id === 'sci7-density' && t === 'units') want((P[0] * 1000) / P[1])
      if (s.id === 'sci7-density' && t === 'floatSink') wantText(P[0] < 1 ? 'float' : 'sink')
      if (s.id === 'sci7-density' && t === 'identify') {
        const rho = P[0] / P[1]
        const table: [string, number][] = [['aluminium', 2.7], ['glass', 2.5], ['iron', 7.9], ['copper', 9.0], ['lead', 11.3], ['gold', 19.3]]
        wantText(table.find(([, d]) => Math.abs(d - rho) < 0.01)?.[0] ?? '?')
      }
      if (s.id === 'sci7-measure-density' && t === 'box') want(P[0] * P[1] * P[2])
      if (s.id === 'sci7-measure-density' && t === 'displace') want(P[1] - P[0])
      if (s.id === 'sci7-measure-density' && t === 'stoneDensity') want(P[0] / (P[2] - P[1]))
      if (s.id === 'sci7-measure-density' && t === 'liquidCalc') want((P[2] - P[0]) / P[1])
      // --- the heating curve (Lesson 4): read back from the drawing
      if (s.id === 'sci7-heating-curve' && q.diagram) {
        const { pts, labels } = readCurve(q.diagram)
        const temps = pts.map((p) => p[1])
        if (temps.join(',') !== '-20,0,0,100,100,120') fail(where, `the curve's temperatures read ${temps.join(',')}`, q)
        const segOf = (time: number) => pts.findIndex((p, k) => k > 0 && time <= p[0]) - 1
        // each letter sits over its own section, in order
        labels.forEach((l, k) => segOf(l.t) !== k && fail(where, `label ${l.s} is not over section ${k + 1}`, q))
        if (t === 'boilStart') want(pts[3][0])
        if (t === 'meltLength') want(pts[2][0] - pts[1][0])
        if (t === 'flatTemp') wantText(plain(q.prompt).includes('section B') ? '0 °C' : '100 °C')
        if (t === 'atTime') {
          const time = P[P.length - 1]
          wantText(['ice warming up', 'ice melting', 'liquid water warming up', 'water boiling', 'steam (water vapour) warming up'][segOf(time)])
        }
      }
      // --- solubility (Lesson 9): from the table printed in the question
      if (s.id === 'sci7-solubility') {
        const tbl = q.prompt.match(/<table[\s\S]*<\/table>/)?.[0]
        if (tbl && /^(readKNO3|diff|saturated|scale)$/.test(t ?? '')) {
          const temps = [...tbl.matchAll(/<th>(\d+)<\/th>/g)].map((m) => +m[1])
          const grams = [...tbl.matchAll(/<td>(\d+)<\/td>/g)].map((m) => +m[1])
          const at = (T: number) => grams[temps.indexOf(T)]
          const ask = nums(q.prompt.slice(q.prompt.indexOf('</table>')))
          if (t === 'readKNO3') want(at(ask[1]))
          if (t === 'diff') want(at(ask[1]) - at(ask[2]))
          if (t === 'scale') want((at(ask[1]) * ask[0]) / 100)
          if (t === 'saturated') {
            const [added, , T] = ask
            const max = at(T)
            reworked++
            if (added <= max ? !right.startsWith('it all dissolves, and') : !right.startsWith(`only ${max} g dissolves; ${added - max} g`)) fail(where, `wrong conclusion for ${added} g at ${T} °C`, q)
          }
        }
      }
      // --- concentration (Lesson 12)
      if (s.id === 'sci7-conc-calc') {
        if (t === 'gL') want(P[0] / P[1])
        if (t === 'gLmL') want(P[0] / (P[1] / 1000))
        if (t === 'gNeeded') want(P[0] * P[1])
        if (t === 'vv') want((P[0] / P[1]) * 100)
        if (t === 'vvNeeded') want((P[1] * P[0]) / 100)
        if (t === 'diluteCalc') want((P[1] * 100) / P[2])
      }
      // --- particle boxes (Lessons 2, 10, 13): the drawn box at the answer letter has the right kinds of atom
      if (q.diagram?.includes('Four boxes') && q.meta?.kinds) {
        const kinds = q.meta.kinds as string[]
        const drawn = readBoxes(q.diagram)
        kinds.forEach((k, j) => drawn[j].size !== KINDS_OF_ATOM[k] && fail(where, `box ${'ABCD'[j]} should show ${KINDS_OF_ATOM[k]} kinds of atom (${k}), it shows ${drawn[j].size}`, q))
        const target = (q.meta.target as string) ?? (s.id === 'sci7-dissolving' ? 'mixElements' : '')
        if (kinds.filter((k) => k === target).length !== 1) fail(where, `"${target}" is in ${kinds.filter((k) => k === target).length} boxes`, q)
        wantText('ABCD'[kinds.indexOf(target)])
      }
      // --- atoms (Lessons 20, 24): checked against the separately typed table, and the drawings counted
      if (q.diagram?.includes('nuc')) {
        const electrons = (q.diagram.match(/class="el"/g) ?? []).length
        const [pz, nn] = [...q.diagram.matchAll(/>(\d+)([pn])</g)].map((m) => +m[1])
        const sym = Object.keys(PT).find((k) => PT[k][0] === pz)!
        if (electrons !== pz) fail(where, `${electrons} electrons drawn for ${pz} protons`, q)
        if (nn !== PT[sym][1] - pz) fail(where, `${nn} neutrons drawn for ${sym}`, q)
        if (t === 'fromDiagram') want(pz)
        if (t === 'identify') wantText(Object.keys(NAME).find((k) => NAME[k] === sym)!)
      }
      if (s.id === 'sci7-shells') {
        const sym = elementIn(q.prompt)
        if (sym && (t === 'protons' || t === 'electrons')) want(PT[sym][0])
        if (sym && t === 'neutrons') want(PT[sym][1] - PT[sym][0])
        if (sym && t === 'arrangement') wantText(arrangement(PT[sym][0]).join(', '))
        if (sym && t === 'outer') want(arrangement(PT[sym][0]).slice(-1)[0])
        if (sym && t === 'groupLink') {
          const outer = arrangement(PT[sym][0]).slice(-1)[0]
          const other = NAME[right]
          reworked++
          if (!other || arrangement(PT[other][0]).slice(-1)[0] !== outer) fail(where, `${right} does not have ${outer} outer electrons`, q)
          for (const o of q.answer.kind === 'mc' ? q.answer.options : []) if (plain(o) !== right && NAME[plain(o)] && arrangement(PT[NAME[plain(o)]][0]).slice(-1)[0] === outer) fail(where, `wrong option ${plain(o)} also has ${outer} outer electrons`, q)
        }
      }
      if (s.id === 'sci7-periodic-table' && t === 'periodOf') {
        const sym = elementIn(q.prompt)
        if (!sym) fail(where, 'no element found in the question', q)
        else want(arrangement(PT[sym][0]).length)
      }
      if (s.id === 'sci7-symbols' && (t === 'symbol' || t === 'name')) {
        const sym = t === 'symbol' ? NAME[(plain(q.prompt).match(/symbol for (\w+)/) ?? [])[1]] : plain(q.prompt).match(/symbol (\w+) ?\?/)?.[1]
        if (t === 'symbol') wantText(sym ?? '?')
        else wantText(Object.keys(NAME).find((k) => NAME[k] === sym) ?? '?')
      }
      // --- formulas (Lesson 25): atoms counted from the formula as printed
      if (s.id === 'sci7-compounds') {
        const f = q.prompt.match(/<b>((?:[A-Z][a-z]?(?:<sub>\d+<\/sub>)?)+)<\/b>/)?.[1]
        if (f && t === 'totalAtoms') want(Object.values(countFormula(plain(f).replace(/ /g, ''))).reduce((a, b) => a + b, 0))
        if (f && t === 'countOne') {
          const sym = NAME[(plain(q.prompt).match(/How many (\w+) atoms/) ?? [])[1]] ?? { iron: 'Fe' }[(plain(q.prompt).match(/How many (\w+) atoms/) ?? [])[1] as 'iron']
          want(countFormula(plain(f).replace(/ /g, ''))[sym])
        }
        if (t === 'manyMolecules') want(2 * P[0])
      }
      // --- chemical change (Lessons 28–30)
      if (s.id === 'sci7-reaction-energy' && t === 'deltaT') want(P[1] - P[0])
      if (s.id === 'sci7-reaction-energy' && t === 'classifyTemp') wantText(P[1] > P[0] ? 'exothermic' : 'endothermic')
      if (s.id === 'sci7-word-equations' && t === 'countProducts') want(plain(q.prompt).split('→')[1].split('+').length)
    }
  }
}

// ---- a calculator only in the lessons with calculations (density, measuring density, solubility, concentration)
{
  const CALC = ['sci7-density', 'sci7-measure-density', 'sci7-solubility', 'sci7-conc-calc']
  for (const { s } of skills) {
    let any = false
    for (let i = 0; i < 300 && !any; i++) for (const l of [1, 2, 3] as Level[]) (setSeed(i * 13 + l), (any ||= !!s.gen(l).calc))
    if (any !== CALC.includes(s.id)) fail(s.id, any ? 'allows a calculator but has no calculations' : 'has calculations but no calculator')
  }
}

// ---- practice sets, as the site builds them (10 questions for science)
let worst = 0
for (const { s } of skills) {
  for (const seed of [1, 22, 333, 4444, 55555]) {
    const set = buildSet(s, setLevelsFor(7, 'science'), seed)
    if (set.length !== 10) fail(s.id, `practice set has ${set.length} questions`)
    const keys = set.map((p) => p.q.prompt + '|' + (p.q.diagram ?? '') + '|' + JSON.stringify(p.q.answer.kind === 'mc' ? [...p.q.answer.options].sort() : p.q.answer))
    const repeats = keys.length - new Set(keys).size
    worst = Math.max(worst, repeats)
    if (repeats > 0) fail(s.id, `a practice set repeats ${repeats} questions`)
  }
}

console.log(`science: ${SCIENCE_TOPICS.length} topics, ${skills.length} lessons; checked ${checked} questions, ${reworked} answers re-worked independently; most repeats in a practice set: ${worst}`)
if (failures) for (const [k, c] of [...seen].sort((a, b) => b[1] - a[1]).slice(0, 25)) console.log(`  ${String(c).padStart(5)} × ${k}`)
console.log(failures ? `${failures} FAILURES` : 'all passed')
if (failures) process.exit(1)
