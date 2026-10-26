// Progress for the current viewer. Students' results come from the server;
// guests' results are kept on their own device only.
import { useCallback, useEffect, useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useSession } from './session'
import { useSafeQuery } from './safe-query'
import { loadJson, saveJson } from './storage'
import type { Topic } from './maths/types'

export interface ItemProgress {
  best: number
  last?: number
  attempts: number
  mastered: boolean
  updatedAt: number
}

export type ProgressMap = Record<string, ItemProgress>

export interface RecentAttempt {
  itemId: string
  kind: 'practice' | 'test'
  score: number
  finishedAt: number
}

export interface Task {
  id: string
  title: string
  items: string[]
  dueDate: number | null
  createdAt: number
}

export interface SaveResult {
  saved: boolean
  score: number
  points: number
  best: number
  newBest: boolean
  message?: string
}

const GUEST_KEY = 'numbat.guestProgress'
const GUEST_RECENT_KEY = 'numbat.guestRecent'

/** Points use the same rule as the server: 10 per mark plus 20 for 80% or better. */
export function pointsFor(correct: number, total: number): number {
  const score = Math.round((correct / total) * 100)
  return Math.min(400, Math.round(correct * 10) + (score >= 80 ? 20 : 0))
}

export function useProgress(): { loading: boolean; items: ProgressMap; recent: RecentAttempt[] } {
  const { student, token } = useSession()
  const query = useSafeQuery(api.learning.myProgress, student && token ? { token } : 'skip')
  const data = (query.error ? { ok: false } : query.data) as { ok: true; items: ProgressMap; recent: RecentAttempt[] } | { ok: false } | undefined
  const [guest, setGuest] = useState<{ items: ProgressMap; recent: RecentAttempt[] }>({ items: {}, recent: [] })

  useEffect(() => {
    if (student) return
    const read = () => setGuest({ items: loadJson<ProgressMap>(GUEST_KEY, {}), recent: loadJson<RecentAttempt[]>(GUEST_RECENT_KEY, []) })
    read()
    window.addEventListener('numbat-guest-progress', read)
    return () => window.removeEventListener('numbat-guest-progress', read)
  }, [student])

  if (student) {
    if (data === undefined) return { loading: true, items: {}, recent: [] }
    if (!data.ok) return { loading: false, items: {}, recent: [] }
    return { loading: false, items: data.items, recent: data.recent }
  }
  return { loading: false, items: guest.items, recent: guest.recent }
}

export function useTasks(): Task[] | undefined {
  const { student, token } = useSession()
  const query = useSafeQuery(api.learning.myTasks, student && token ? { token } : 'skip')
  const data = (query.error ? { ok: false } : query.data) as { ok: true; tasks: Task[] } | { ok: false } | undefined
  if (!student) return []
  if (data === undefined) return undefined
  return data.ok ? data.tasks : []
}

/**
 * Saves a finished practice set or test. Students' results go to the server; guests'
 * stay in this browser; teachers previewing the site save nothing.
 */
export function useSaveResult() {
  const { student, teacher, token } = useSession()
  const record = useMutation(api.learning.recordAttempt)

  return useCallback(
    async (itemId: string, kind: 'practice' | 'test', correct: number, total: number): Promise<SaveResult> => {
      const score = Math.round((correct / total) * 100)
      const points = pointsFor(correct, total)
      if (teacher) return { saved: false, score, points: 0, best: score, newBest: false, message: 'Teacher preview: results are not saved.' }
      if (student && token) {
        try {
          const r = (await record({ token, itemId, kind, correct, total })) as
            | { ok: true; score: number; best: number; points: number; newBest: boolean }
            | { ok: false; message: string }
          if (r.ok) return { saved: true, score: r.score, points: r.points, best: r.best, newBest: r.newBest }
          return { saved: false, score, points: 0, best: score, newBest: false, message: r.message }
        } catch {
          return { saved: false, score, points: 0, best: score, newBest: false, message: 'Your result could not be saved. Check your internet connection.' }
        }
      }
      const items = loadJson<ProgressMap>(GUEST_KEY, {})
      const prev = items[itemId]
      const best = Math.max(prev?.best ?? 0, score)
      items[itemId] = { best, last: score, attempts: (prev?.attempts ?? 0) + 1, mastered: best >= 80, updatedAt: Date.now() }
      saveJson(GUEST_KEY, items)
      const recent = loadJson<RecentAttempt[]>(GUEST_RECENT_KEY, [])
      recent.unshift({ itemId, kind, score, finishedAt: Date.now() })
      saveJson(GUEST_RECENT_KEY, recent.slice(0, 8))
      window.dispatchEvent(new Event('numbat-guest-progress'))
      return { saved: true, score, points, best, newBest: !prev || score > prev.best }
    },
    [student, teacher, token, record],
  )
}

/** Skills mastered in a topic, whether it has been started, and the best topic-test result. */
export function topicStats(t: Topic, items: ProgressMap) {
  const test = items[`test:${t.id}`]
  const mastered = t.skills.filter((s) => items[s.id]?.mastered).length
  const started = t.skills.some((s) => items[s.id]) || !!test
  return { mastered, total: t.skills.length, started, test }
}
