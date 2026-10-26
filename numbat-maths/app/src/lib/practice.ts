// Builds practice sets and topic tests from the question generators.
import type { Level, Question, Skill, Topic } from '@/lib/maths/types'
import { setSeed, shuffle } from '@/lib/maths/rand'
import { findSkill, findTopic } from '@/content'

/** A saved practice set: 3 Foundation, 4 Standard, 3 Challenge questions. */
export const SET_LEVELS: Level[] = [1, 1, 1, 2, 2, 2, 2, 3, 3, 3]
export const EXTRA_COUNT = 5
export const MASTERY = 80

export interface Posed {
  q: Question
  level: Level
  skill: Skill
}

/** Fresh randomness for each set, so two students never share a sequence. */
export function reseed() {
  let seed = Math.floor(Math.random() * 0xffffffff)
  try {
    const a = new Uint32Array(1)
    crypto.getRandomValues(a)
    seed = a[0]
  } catch {
    // Math.random fallback is fine
  }
  setSeed(seed)
}

function key(q: Question): string {
  return q.prompt + '|' + (q.diagram ?? '')
}

/** One question, avoiding repeats of questions already in the set. */
export function pose(skill: Skill, level: Level, seen: Set<string>): Posed {
  let last: Question | null = null
  for (let i = 0; i < 12; i++) {
    try {
      const q = skill.gen(level)
      last = q
      if (!seen.has(key(q))) {
        seen.add(key(q))
        return { q, level, skill }
      }
    } catch (e) {
      console.error('Question generator failed', skill.id, level, e)
    }
  }
  if (last) return { q: last, level, skill }
  throw new Error(`Could not make a question for ${skill.title}`)
}

export function buildSet(skill: Skill, levels: Level[]): Posed[] {
  reseed()
  const seen = new Set<string>()
  return levels.map((l) => pose(skill, l, seen))
}

/** Ten questions from across a topic, easy to hard, every skill used at least once where possible. */
export function buildTest(topic: Topic): Posed[] {
  reseed()
  const seen = new Set<string>()
  const order = shuffle(topic.skills)
  const picks = SET_LEVELS.map((_, i) => order[i % order.length])
  // keep the topic's own skill order within each level band so the test flows naturally
  const idx = (s: Skill) => topic.skills.indexOf(s)
  const bands: [number, number][] = [
    [0, 3],
    [3, 7],
    [7, 10],
  ]
  const sorted: Skill[] = []
  for (const [a, b] of bands) sorted.push(...picks.slice(a, b).sort((x, y) => idx(x) - idx(y)))
  return sorted.map((s, i) => pose(s, SET_LEVELS[i], seen))
}

export function testItemId(topicId: string): string {
  return `test:${topicId}`
}

/** Human-readable name for a progress item id. */
export function itemLabel(itemId: string): { title: string; sub: string; year?: number } {
  if (itemId.startsWith('test:')) {
    const t = findTopic(itemId.slice(5))
    return t ? { title: `${t.title}: topic test`, sub: `Year ${t.year}`, year: t.year } : { title: 'Topic test', sub: '' }
  }
  const f = findSkill(itemId)
  return f ? { title: f.skill.title, sub: `Year ${f.topic.year} · ${f.topic.title}`, year: f.topic.year } : { title: itemId, sub: '' }
}

/** Where a progress item is practised. */
export function itemLink(itemId: string): { to: '/test'; search: { id: string } } | { to: '/lesson'; search: { id: string; tab: 'practice' } } {
  if (itemId.startsWith('test:')) return { to: '/test', search: { id: itemId.slice(5) } }
  return { to: '/lesson', search: { id: itemId, tab: 'practice' } }
}
