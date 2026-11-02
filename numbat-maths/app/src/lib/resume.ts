// A practice set a student stopped partway through, kept on this device so they can carry on later.
// The questions aren't stored: the set's seed rebuilds exactly the same questions. Each student (or a
// guest) on a shared device has their own saved sets.
import { load, loadJson, save, saveJson } from './storage'
import type { Level } from './maths/types'

export interface ItemProgressState {
  tries: number
  credit: number | null
  revealed: boolean
  hint: boolean
  wrong: number[]
  given: string
}

export interface SavedRun {
  v: 1
  skillId: string
  seed: number
  levels: Level[]
  states: ItemProgressState[]
  /** the question they were up to (0-based) */
  i: number
  /** a fingerprint of the whole set (see setCheck), to check the rebuilt set really is the same one */
  check: string
  savedAt: number
}

const KEEP_DAYS = 21
const key = (who: string, skillId: string) => `numbat.resume.${who}.${skillId}`

export function loadRun(who: string, skillId: string): SavedRun | null {
  const r = loadJson<SavedRun | null>(key(who, skillId), null)
  if (!r || r.v !== 1 || r.skillId !== skillId) return null
  if (Date.now() - r.savedAt > KEEP_DAYS * 86_400_000) {
    clearRun(who, skillId)
    return null
  }
  return r
}

export function saveRun(who: string, run: Omit<SavedRun, 'v' | 'savedAt'>) {
  saveJson(key(who, run.skillId), { ...run, v: 1, savedAt: Date.now() })
}

export function clearRun(who: string, skillId: string) {
  if (load(key(who, skillId)) !== null) save(key(who, skillId), null)
}

/** How many questions are finished, and the marks so far. */
export function runProgress(r: SavedRun) {
  const done = r.states.filter((s) => s.credit !== null)
  return { done: done.length, marks: done.reduce((t, s) => t + (s.credit ?? 0), 0), total: r.levels.length }
}
