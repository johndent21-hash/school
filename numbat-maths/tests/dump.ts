// Prints sample questions as plain text for a manual "second teacher" check.
// Usage: ONLY=y7-ang K=3 npx tsx tests/dump.ts
import { setSeed } from '../src/lib/maths/rand'
import { answerText } from '../src/lib/maths/check'
import type { Level } from '../src/lib/maths/types'
import { ALL_TOPICS } from '../src/content/index'

const K = Number(process.env.K ?? 2)
const only = process.env.ONLY ?? ''
const seed0 = Number(process.env.SEED ?? 1)
const strip = (h: string) =>
  h
    .replace(/<span class="frac"[^>]*><span class="fn">(.*?)<\/span><span class="fd">(.*?)<\/span><\/span>/g, '[$1/$2]')
    .replace(/<sup>(.*?)<\/sup>/g, '^$1')
    .replace(/<tr>/g, '\n   | ')
    .replace(/<\/t[dh]>/g, ' | ')
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&ensp;/g, ' ')
    .replace(/&#9633;/g, '□')

for (const t of ALL_TOPICS) {
  for (const s of t.skills) {
    if (!s.id.startsWith(only)) continue
    console.log(`\n=== ${s.id}: ${s.title}`)
    for (const lvl of [1, 2, 3] as Level[]) {
      for (let k = 0; k < K; k++) {
        setSeed(seed0 * 1000 + k * 31 + lvl * 7)
        const qn = s.gen(lvl)
        const diag = qn.diagram ? ` [diagram: ${(qn.diagram.match(/>([^<>]{1,30})<\/text>/g) || []).map((m) => m.replace(/<[^>]*>|^>/g, '')).join(', ')}]` : ''
        const ans = qn.answer.kind === 'mc' ? `MC {${qn.answer.options.map(strip).join(' / ')}} -> ${strip(qn.answer.options[qn.answer.correct])}` : answerText(qn.answer)
        console.log(`L${lvl}: ${strip(qn.prompt)}${diag}${qn.prefix ? ' ' + strip(qn.prefix) : ''} ⇒ ${ans}${qn.suffix ? ' ' + strip(qn.suffix) : ''}`)
        console.log(`    steps: ${qn.steps.map(strip).join(' || ')}`)
      }
    }
  }
}
