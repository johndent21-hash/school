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

export const ALL_TOPICS: Topic[] = [...Y7A, ...Y7B, ...Y7C, ...Y8A, ...Y8B, ...Y8C, ...Y9A, ...Y9B, ...Y9C]

export const YEARS = [7, 8, 9] as const
export type Year = (typeof YEARS)[number]

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
