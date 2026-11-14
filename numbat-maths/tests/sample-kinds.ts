// Three sample questions per kind, as plain text, to judge a kind before reusing it (cheaper than reading its code).
// Usage: npx tsx tests/sample-kinds.ts "ncm7-ch1 1.03 statement" "ncm9s-ch8 8.04 taxable" ...   (chapter id, exercise, kind)
//        npx tsx tests/sample-kinds.ts --list [ncm7|ncm8|ncm9]   lists every kind first made in a book (reused kinds left out)
//        npx tsx tests/sample-kinds.ts --sets ncm8 [chapter]       every set with its outcomes and kinds (kind<source> = reused)
import { GAME_BOOKS } from '../src/content/games/index'
import { setSeed } from '../src/lib/maths/rand'
const strip = (s: string) => s.replace(/<svg[\s\S]*?<\/svg>/g, '[SVG]').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
const args = process.argv.slice(2)
if (args[0] === '--list') {
  for (const b of GAME_BOOKS) {
    if (args[1] && b.id !== args[1]) continue
    for (const ch of b.chapters)
      for (const s of ch.sets) {
        const ks = s.makers.map((m) => (setSeed(3), m.make().meta.reused ? '' : m.t + (m.d === 2 ? '²' : ''))).filter(Boolean)
        if (ks.length) console.log(`${ch.id} ${s.exercise} ${s.title}: ${ks.join(' ')}`)
      }
  }
} else if (args[0] === '--sets') {
  for (const ch of GAME_BOOKS.find((b) => b.id === args[1])!.chapters) {
    if (args[2] && String(ch.number) !== args[2]) continue
    console.log(`== ${ch.id} ${ch.title}`)
    for (const s of ch.sets) {
      const ks = s.makers.map((m) => {
        setSeed(1)
        const src = m.make().meta.reused
        return src ? `${m.t}<${String(src).split('|').slice(0, 2).join(' ')}>` : m.t
      })
      console.log(`${s.exercise} ${s.title} [${s.outcomes.join(',') || 'ext'}] ${ks.join(' ')}`)
    }
  }
} else {
  const chs = GAME_BOOKS.flatMap((b) => b.chapters)
  for (const arg of args) {
    const [cid, ex, t] = arg.split(' ')
    const m = chs.find((c) => c.id === cid)?.sets.find((s) => s.exercise === ex)?.makers.find((k) => k.t === t)
    if (!m) { console.log(`== ${arg}: not found`); continue }
    console.log(`== ${arg}`)
    for (let i = 0; i < 3; i++) {
      setSeed(11 + i * 7)
      const q = m.make()
      console.log(`  ${strip(q.prompt)}${q.diagram ? ' [D]' : ''} | ${q.options.map(strip).join(' ; ')} | ✓${strip(q.options[q.correct])}`)
    }
  }
}
