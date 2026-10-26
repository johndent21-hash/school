import type { Skill, Topic } from '@/lib/maths/types'
import { Y7A } from './y7a'
import { Y7B } from './y7b'
import { Y7C } from './y7c'
import { Y8A } from './y8a'
import { Y8B } from './y8b'
import { Y8C } from './y8c'
import { Y9A } from './y9a'
import { Y9B } from './y9b'
import { Y9C } from './y9c'
import { Y3A } from './y3a'
import { Y3B } from './y3b'
import { Y3C } from './y3c'
import { Y4A } from './y4a'
import { Y4B } from './y4b'
import { Y4C } from './y4c'

/** Years 3–4 (Stage 2). Only included in builds made with VITE_STAGE2=1 (or STAGE2=1 for tests). */
export const STAGE2_TOPICS: Topic[] = [...Y3A, ...Y3B, ...Y3C, ...Y4A, ...Y4B, ...Y4C]
const SECONDARY_TOPICS: Topic[] = [...Y7A, ...Y7B, ...Y7C, ...Y8A, ...Y8B, ...Y8C, ...Y9A, ...Y9B, ...Y9C]

const viteEnv = (import.meta as unknown as { env?: Record<string, string | undefined> }).env
export const INCLUDE_STAGE2 = viteEnv?.VITE_STAGE2 === '1' || (typeof process !== 'undefined' && process.env?.STAGE2 === '1')

export const ALL_TOPICS: Topic[] = INCLUDE_STAGE2 ? [...STAGE2_TOPICS, ...SECONDARY_TOPICS] : SECONDARY_TOPICS

export const YEARS: number[] = INCLUDE_STAGE2 ? [3, 4, 7, 8, 9] : [7, 8, 9]
export type Year = 3 | 4 | 7 | 8 | 9

/** Syllabus stage shown beside a year. Year 3 follows the Part A focus areas, Year 4 Part B. */
export const stageLabel = (y: number) => (y === 3 ? 'Stage 2 · Part A' : y === 4 ? 'Stage 2 · Part B' : y === 9 ? 'Stage 5 core' : 'Stage 4')
/** Tile colour (hue) for each year. */
export const yearHue = (y: number) => ({ 3: 28, 4: 140, 7: 172, 8: 205, 9: 352 })[y as Year] ?? 205
/** "Years 7–9", or "Years 3–4 and 7–9" when Stage 2 is included. */
export const YEAR_SPAN = INCLUDE_STAGE2 ? 'Years 3–4 and 7–9' : 'Years 7–9'

export function topicsForYear(year: number): Topic[] {
  return ALL_TOPICS.filter((t) => t.year === year)
}

const skillIndex = new Map<string, { skill: Skill; topic: Topic }>()
for (const t of ALL_TOPICS) for (const s of t.skills) skillIndex.set(s.id, { skill: s, topic: t })

export function findSkill(id: string): { skill: Skill; topic: Topic } | undefined {
  return skillIndex.get(id)
}

export function findTopic(id: string): Topic | undefined {
  return ALL_TOPICS.find((t) => t.id === id)
}
