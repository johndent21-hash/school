// Practice sets: 20 questions for Years 3–9 (8/8/4), 10 for Years 1–2 (3/4/3); the same seed rebuilds the
// same set (so a set can be resumed); and how often a set repeats a question.
//   STAGE1=1 STAGE2=1 npx tsx tests/practice.test.ts
import { ALL_TOPICS } from '../src/content/index'
import { buildSet, setCheck, setLevelsFor } from '../app/src/lib/practice'

let failures = 0
const fail = (m: string) => {
  failures++
  if (failures < 30) console.log('FAIL ' + m)
}
const mix = (y: number) => [1, 2, 3].map((l) => setLevelsFor(y).filter((x) => x === l).length).join('/')
for (const y of [1, 2]) if (mix(y) !== '3/4/3') fail(`Year ${y} levels ${mix(y)}`)
for (const y of [3, 4, 7, 8, 9]) if (mix(y) !== '8/8/4') fail(`Year ${y} levels ${mix(y)}`)

const repeats: [string, number][] = []
let sets = 0
for (const t of ALL_TOPICS) {
  for (const s of t.skills) {
    const levels = setLevelsFor(t.year)
    for (const seed of [11, 2024, 987654321]) {
      const a = buildSet(s, levels, seed)
      const b = buildSet(s, levels, seed)
      sets++
      if (a.length !== levels.length) fail(`${s.id}: ${a.length} questions`)
      if (a.some((p, i) => p.q.prompt !== b[i].q.prompt || JSON.stringify(p.q.answer) !== JSON.stringify(b[i].q.answer) || p.level !== b[i].level))
        fail(`${s.id}: the same seed gave a different set`)
      if (setCheck(a) !== setCheck(b)) fail(`${s.id}: the same set gave a different fingerprint`)
      if (setCheck(a) === setCheck(buildSet(s, levels, seed + 1))) fail(`${s.id}: two different sets gave the same fingerprint`)
      const keys = a.map((p) => p.q.prompt + (p.q.diagram ?? '') + JSON.stringify(p.q.answer.kind === 'mc' ? p.q.answer.options.slice().sort() : p.q.answer))
      const dup = keys.length - new Set(keys).size
      if (dup) repeats.push([`${s.id} (seed ${seed})`, dup])
    }
  }
}
console.log(`${sets} sets built twice from the same seed`)
const bySkill = new Map<string, number>()
for (const [k, d] of repeats) bySkill.set(k.split(' ')[0], Math.max(bySkill.get(k.split(' ')[0]) ?? 0, d))
console.log(`skills whose set repeated a question: ${bySkill.size}`)
console.log([...bySkill].sort((x, y) => y[1] - x[1]).map(([k, d]) => `${k}: up to ${d} repeated`).join('\n'))
if (failures) {
  console.log(`${failures} failures`)
  process.exit(1)
}
console.log('All practice-set checks passed')
