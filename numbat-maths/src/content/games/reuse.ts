// Reusing a question kind from another book's game set (e.g. an NCM 8 revision exercise using an NCM 7 kind).
// The question is made exactly as before; it is given the new set's kind name and remembers where it came from in
// meta.reused ("ncm7-ch2|2.07|find"), so tests/games.test.ts can check it with the original chapter's checks.
import type { GameChapter, GameMaker } from '@/lib/game/types'

export function reuse(ch: GameChapter, exercise: string, t: string, as = t): GameMaker {
  const set = ch.sets.find((s) => s.exercise === exercise)
  const m = set?.makers.find((k) => k.t === t)
  if (!m) throw new Error(`reuse: no kind "${t}" in ${ch.id} Ex ${exercise}`)
  return {
    t: as,
    d: m.d,
    make: () => {
      const q = m.make()
      // (not "from": unit-conversion kinds already use meta.from for the unit)
      if ('reused' in q.meta) throw new Error(`reuse: ${ch.id} ${t} already has meta.reused`)
      return { ...q, meta: { ...q.meta, t: as, reused: `${ch.id}|${exercise}|${t}` } }
    },
  }
}
