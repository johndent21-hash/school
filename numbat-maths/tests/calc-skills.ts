// Lists the skills whose practice sets allow a calculator (as qa/calc-ids.json, for qa/calc-check.mjs).
import fs from 'node:fs'
import { ALL_TOPICS } from '../src/content/index'
import { buildSet, setLevelsFor } from '../app/src/lib/practice'
const ids: string[] = []
for (const t of ALL_TOPICS) for (const s of t.skills) {
  let any = false
  for (let k = 0; k < 30 && !any; k++) any = buildSet(s, setLevelsFor(t.year), 300 + k).some((p) => p.q.calc)
  if (any) ids.push(s.id)
}
fs.writeFileSync('qa/calc-ids.json', JSON.stringify(ids, null, 0) + '\n')
console.log(`${ids.length} skills allow a calculator in practice`)
