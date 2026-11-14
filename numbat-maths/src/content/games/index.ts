// Class games, organised the way the textbooks are: book → chapter → exercise.
import type { GameBook, GameChapter, GameSet } from '@/lib/game/types'
import { NCM7_CH1 } from './ncm7-ch1'
import { NCM7_CH2 } from './ncm7-ch2'
import { NCM7_CH3 } from './ncm7-ch3'
import { NCM7_CH4 } from './ncm7-ch4'
import { NCM7_CH5 } from './ncm7-ch5'
import { NCM7_CH6 } from './ncm7-ch6'
import { NCM7_CH7 } from './ncm7-ch7'
import { NCM7_CH8 } from './ncm7-ch8'
import { NCM7_CH9 } from './ncm7-ch9'
import { NCM7_CH10 } from './ncm7-ch10'
import { NCM7_CH11 } from './ncm7-ch11'
import { NCM7_CH12 } from './ncm7-ch12'
import { NCM8_CH1 } from './ncm8-ch1'
import { NCM8_CH2 } from './ncm8-ch2'
import { NCM8_CH3 } from './ncm8-ch3'
import { NCM8_CH4 } from './ncm8-ch4'
import { NCM8_CH5 } from './ncm8-ch5'
import { NCM8_CH6 } from './ncm8-ch6'
import { NCM8_CH7 } from './ncm8-ch7'
import { NCM8_CH8 } from './ncm8-ch8'
import { NCM8_CH9 } from './ncm8-ch9'
import { NCM8_CH10 } from './ncm8-ch10'
import { NCM8_CH11 } from './ncm8-ch11'
import { NCM8_CH12 } from './ncm8-ch12'
import { NCM9_CH1 } from './ncm9-ch1'
import { NCM9_CH2 } from './ncm9-ch2'
import { NCM9_CH3 } from './ncm9-ch3'
import { NCM9_CH4 } from './ncm9-ch4'
import { NCM9_CH5 } from './ncm9-ch5'

export const GAME_BOOKS: GameBook[] = [
  {
    id: 'ncm7',
    short: 'NCM 7',
    title: 'New Century Maths 7',
    year: 7,
    stage: 'Stage 4',
    chapters: [NCM7_CH1, NCM7_CH2, NCM7_CH3, NCM7_CH4, NCM7_CH5, NCM7_CH6, NCM7_CH7, NCM7_CH8, NCM7_CH9, NCM7_CH10, NCM7_CH11, NCM7_CH12],
  },
  {
    id: 'ncm8',
    short: 'NCM 8',
    title: 'New Century Maths 8',
    year: 8,
    stage: 'Stage 4',
    chapters: [NCM8_CH1, NCM8_CH2, NCM8_CH3, NCM8_CH4, NCM8_CH5, NCM8_CH6, NCM8_CH7, NCM8_CH8, NCM8_CH9, NCM8_CH10, NCM8_CH11, NCM8_CH12],
  },
  {
    id: 'ncm9',
    short: 'NCM 9',
    title: 'New Century Maths 9 Advanced',
    year: 9,
    stage: 'Stage 5',
    chapters: [NCM9_CH1, NCM9_CH2, NCM9_CH3, NCM9_CH4, NCM9_CH5],
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

/** The games chapter that goes with a lesson topic, if there is one. */
export function gamesForTopic(topicId: string): FoundGame | undefined {
  for (const book of GAME_BOOKS) for (const chapter of book.chapters) if (chapter.topics?.includes(topicId)) return { book, chapter }
  return undefined
}

export const ALL_GAME_SETS: GameSet[] = GAME_BOOKS.flatMap((b) => b.chapters.flatMap((c) => c.sets))
