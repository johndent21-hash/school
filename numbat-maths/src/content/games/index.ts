// Class games, organised the way the textbooks are: book → chapter → exercise.
import type { GameBook, GameChapter, GameSet } from '@/lib/game/types'
import { NCM7_CH8 } from './ncm7-ch8'

export const GAME_BOOKS: GameBook[] = [
  {
    id: 'ncm7',
    short: 'NCM 7',
    title: 'New Century Maths 7',
    year: 7,
    stage: 'Stage 4',
    chapters: [NCM7_CH8],
  },
]

export interface FoundGame {
  book: GameBook
  chapter: GameChapter
  /** the exercise; undefined for a whole-chapter mix */
  set?: GameSet
}

const index = new Map<string, FoundGame>()
for (const book of GAME_BOOKS)
  for (const chapter of book.chapters) {
    index.set(chapter.id, { book, chapter })
    for (const set of chapter.sets) index.set(set.id, { book, chapter, set })
  }

/** A game by its id: an exercise ("ncm7-8.05") or a whole chapter ("ncm7-ch8"). */
export function findGame(id: string): FoundGame | undefined {
  return index.get(id)
}

/** "NCM 7 Ex 8.05 · Area of a rectangle" or "NCM 7 Chapter 8 · Area and volume: whole chapter mix" */
export function gameTitle(g: FoundGame): string {
  return g.set ? `${g.set.ref} · ${g.set.title}` : `${g.chapter.ref} · ${g.chapter.title}: whole chapter mix`
}

export const ALL_GAME_SETS: GameSet[] = GAME_BOOKS.flatMap((b) => b.chapters.flatMap((c) => c.sets))
