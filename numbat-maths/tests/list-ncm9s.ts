// Lists every NCM 9 Standard set with its outcomes and kinds (reused kinds show their source), for the coverage audit.
// Usage: npx tsx tests/list-ncm9s.ts [chapter number]
import { NCM9S_CHAPTERS } from '../src/content/games/ncm9s'
import { setSeed } from '../src/lib/maths/rand'
const only = process.argv[2]
for (const ch of NCM9S_CHAPTERS) {
  if (only && String(ch.number) !== only) continue
  console.log(`== Ch ${ch.number} ${ch.title}`)
  for (const s of ch.sets) {
    const kinds = s.makers.map((m) => {
      setSeed(1)
      const src = m.make().meta.reused
      return src ? `${m.t}<${String(src).split('|').slice(0, 2).join(' ')}>` : `${m.t}*`
    })
    console.log(`${s.exercise} ${s.title} [${s.outcomes.join(',') || 'ext'}] ${kinds.join(' ')}`)
  }
}
