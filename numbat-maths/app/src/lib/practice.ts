// Builds practice sets and topic tests from the question generators.
import type { Level, Question, Skill, Topic } from '@/lib/maths/types'
import { setSeed, shuffle } from '@/lib/maths/rand'
import { findSkill, findTopic } from '@/content'


/** Years 1–2: 10 questions (3 Foundation, 4 Standard, 3 Challenge). */
export const SET_LEVELS: Level[] = [1, 1, 1, 2, 2, 2, 2, 3, 3, 3]
/** Years 3 and up: 20 questions (8 Foundation, 8 Standard, 4 Challenge). */
export const SET_LEVELS_20: Level[] = [...Array(8).fill(1), ...Array(8).fill(2), ...Array(4).fill(3)]

/** The levels of a saved practice set for a year group. */
export function setLevelsFor(year: number): Level[] {
  return year <= 2 ? SET_LEVELS : SET_LEVELS_20
}
export const EXTRA_COUNT = 5
export const MASTERY = 80

export interface Posed {
  q: Question
  level: Level
  skill: Skill
}

/** A fresh random seed, so two students never share a sequence. */
export function newSeed(): number {
  let seed = Math.floor(Math.random() * 0xffffffff)
  try {
    const a = new Uint32Array(1)
    crypto.getRandomValues(a)
    seed = a[0]
  } catch {
    // Math.random fallback is fine
  }
  return seed
}

/** Fresh randomness for each set or test. */
export function reseed() {
  setSeed(newSeed())
}

function key(q: Question): string {
  return q.prompt + '|' + (q.diagram ?? '')
}

/** A question at this level that isn't already in the set, or null if none turns up. */
function fresh(skill: Skill, level: Level, seen: Set<string>, tries: number): Posed | null {
  for (let i = 0; i < tries; i++) {
    try {
      const q = skill.gen(level)
      if (!seen.has(key(q))) {
        seen.add(key(q))
        return { q, level, skill }
      }
    } catch (e) {
      console.error('Question generator failed', skill.id, level, e)
    }
  }
  return null
}

/** One question, avoiding repeats of questions already in the set (used for topic tests). */
export function pose(skill: Skill, level: Level, seen: Set<string>): Posed {
  const p = fresh(skill, level, seen, 12)
  if (p) return p
  return { q: skill.gen(level), level, skill }
}

// When a level has run out of new questions, borrow from the nearest other level before repeating one
const NEIGHBOURS: Record<Level, Level[]> = { 1: [2, 3], 2: [1, 3], 3: [2, 1] }

/** A practice set. The same seed always gives the same questions, so a set can be resumed later. */
export function buildSet(skill: Skill, levels: Level[], seed?: number): Posed[] {
  if (seed === undefined) reseed()
  else setSeed(seed)
  const seen = new Set<string>()
  return levels.map((l) => {
    const p = fresh(skill, l, seen, 60) ?? NEIGHBOURS[l].reduce<Posed | null>((found, other) => found ?? fresh(skill, other, seen, 30), null)
    // only if the skill has fewer different questions than the set needs
    return p ?? { q: skill.gen(l), level: l, skill }
  })
}

/** A short fingerprint of a whole set, so a saved set is only resumed if it rebuilds exactly the same questions. */
export function setCheck(set: Posed[]): string {
  let h = 0
  for (const p of set) for (const ch of p.q.prompt + JSON.stringify(p.q.answer)) h = (Math.imul(h, 31) + ch.charCodeAt(0)) | 0
  return `${set.length}:${(h >>> 0).toString(36)}`
}

/**
 * A topic test. Topics with a fixed plan (e.g. following the textbook's chapter test) use it;
 * otherwise ten questions from across the topic, easy to hard, every skill used at least once where possible.
 */
export function buildTest(topic: Topic): Posed[] {
  reseed()
  const seen = new Set<string>()
  if (topic.test) {
    return topic.test.map((item) => {
      const skill = topic.skills.find((s) => s.id === item.skill) ?? topic.skills[0]
      return pose(item.gen ? { ...skill, gen: item.gen } : skill, item.level, seen)
    })
  }
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
  return f
    ? { title: f.skill.title, sub: `Year ${f.topic.year} · ${f.topic.title}${f.skill.ref ? ` · ${f.skill.ref}` : ''}`, year: f.topic.year }
    : { title: itemId, sub: '' }
}

/** Where a progress item is practised. */
export function itemLink(itemId: string): { to: '/test'; search: { id: string } } | { to: '/lesson'; search: { id: string; tab: 'practice' } } {
  if (itemId.startsWith('test:')) return { to: '/test', search: { id: itemId.slice(5) } }
  return { to: '/lesson', search: { id: itemId, tab: 'practice' } }
}
