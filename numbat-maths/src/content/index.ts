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
import { Y1A } from './y1a'
import { Y1B } from './y1b'
import { Y1C } from './y1c'
import { Y2A } from './y2a'
import { Y2B } from './y2b'
import { Y2C } from './y2c'

/** Years 1–2 (Stage 1). Only included in builds made with VITE_STAGE1=1 (or STAGE1=1 for tests). */
export const STAGE1_TOPICS: Topic[] = [...Y1A, ...Y1B, ...Y1C, ...Y2A, ...Y2B, ...Y2C]
/** Years 3–4 (Stage 2). Only included in builds made with VITE_STAGE2=1 (or STAGE2=1 for tests). */
export const STAGE2_TOPICS: Topic[] = [...Y3A, ...Y3B, ...Y3C, ...Y4A, ...Y4B, ...Y4C]
export const SECONDARY_TOPICS: Topic[] = [...Y7A, ...Y7B, ...Y7C, ...Y8A, ...Y8B, ...Y8C, ...Y9A, ...Y9B, ...Y9C]

const viteEnv = (import.meta as unknown as { env?: Record<string, string | undefined> }).env
export const INCLUDE_STAGE2 = viteEnv?.VITE_STAGE2 === '1' || (typeof process !== 'undefined' && process.env?.STAGE2 === '1')
export const INCLUDE_STAGE1 = viteEnv?.VITE_STAGE1 === '1' || (typeof process !== 'undefined' && process.env?.STAGE1 === '1')

export const ALL_TOPICS: Topic[] = [...(INCLUDE_STAGE1 ? STAGE1_TOPICS : []), ...(INCLUDE_STAGE2 ? STAGE2_TOPICS : []), ...SECONDARY_TOPICS]

export const YEARS: number[] = [...(INCLUDE_STAGE1 ? [1, 2] : []), ...(INCLUDE_STAGE2 ? [3, 4] : []), 7, 8, 9]
export type Year = 1 | 2 | 3 | 4 | 7 | 8 | 9

/** Syllabus stage shown beside a year. Years 1 and 3 follow the Part A focus areas, Years 2 and 4 Part B. */
export const stageLabel = (y: number) =>
  ({ 1: 'Stage 1 · Part A', 2: 'Stage 1 · Part B', 3: 'Stage 2 · Part A', 4: 'Stage 2 · Part B', 9: 'Stage 5 core' })[y as 1] ?? 'Stage 4'
/** Tile colour (hue) for each year. */
export const yearHue = (y: number) => ({ 1: 265, 2: 45, 3: 28, 4: 140, 7: 172, 8: 205, 9: 352 })[y as Year] ?? 205
/** The years in this build, e.g. "Years 7–9" or "Years 1–4 and 7–9". */
export const YEAR_SPAN = INCLUDE_STAGE1 && INCLUDE_STAGE2 ? 'Years 1–4 and 7–9' : INCLUDE_STAGE2 ? 'Years 3–4 and 7–9' : INCLUDE_STAGE1 ? 'Years 1–2 and 7–9' : 'Years 7–9'
/** Primary stages in this build, e.g. "Stages 1 and 2". Empty when the build has no primary years. */
export const PRIMARY_STAGES = INCLUDE_STAGE1 && INCLUDE_STAGE2 ? 'Stages 1 and 2' : INCLUDE_STAGE1 ? 'Stage 1' : INCLUDE_STAGE2 ? 'Stage 2' : ''
/** Text for the landing-page chip, e.g. "NSW Years 1, 2, 3, 4, 7, 8 and 9 · Stages 1, 2, 4 and 5". */
export const BUILD_CHIP = (() => {
  const list = (xs: (string | number)[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}` : String(xs[0]))
  const stages = [...(INCLUDE_STAGE1 ? [1] : []), ...(INCLUDE_STAGE2 ? [2] : []), 4, 5]
  return `NSW Years ${list(YEARS)} · Stages ${list(stages)}`
})()

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
