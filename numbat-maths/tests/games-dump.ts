// Prints sample class-game questions as plain text, for a "second teacher" read-through.
// Usage: ONLY=ncm7-8.05 K=4 npx tsx tests/games-dump.ts
import { setSeed } from '../src/lib/maths/rand'
import { ALL_GAME_SETS } from '../src/content/games/index'

const K = Number(process.env.K ?? 3)
const only = process.env.ONLY ?? ''
const seed0 = Number(process.env.SEED ?? 1)
export const strip = (h: string) =>
  h
    .replace(/<span class="frac"[^>]*><span class="fn">(.*?)<\/span><span class="fd">(.*?)<\/span><\/span>/g, '[$1/$2]')
    .replace(/<sup>(.*?)<\/sup>/g, '^$1')
    .replace(/<div class="big">/g, '  ')
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#9633;/g, '□')
    .replace(/ /g, ' ')

for (const s of ALL_GAME_SETS) {
  if (!s.id.startsWith(only)) continue
  console.log(`\n=== ${s.ref}: ${s.title}`)
  for (const m of s.makers) {
    for (let k = 0; k < K; k++) {
      setSeed(seed0 * 1000 + k * 31 + m.t.length * 7)
      const q = m.make()
      const labels = q.diagram ? ` [diagram: ${(q.diagram.match(/>([^<>]{1,40})<\/text>/g) || []).map((x) => x.replace(/<[^>]*>|^>/g, '').replace(/ /g, ' ')).join(', ')}]` : ''
      console.log(`${m.t}: ${strip(q.prompt)}${labels}`)
      console.log(`    ${q.options.map((o, i) => `${'ABCD'[i]}${i === q.correct ? '*' : ' '} ${strip(o)}`).join('   ')}`)
      console.log(`    why: ${strip(q.why)}`)
    }
  }
}
