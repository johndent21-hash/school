// Progress for the current viewer. Students' results come from the server;
// guests' results are kept on their own device only.
import { useCallback, useEffect, useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useSession } from './session'
import { useSafeQuery } from './safe-query'
import { loadJson, saveJson } from './storage'
import type { Topic } from './maths/types'
import { DEFAULT_GOAL, pointsFor, rewardSummary, type RewardSummary } from './rewards'

export { pointsFor }

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
const GUEST_LOG_KEY = 'numbat.guestLog' // every finished set, newest first, with points
const GUEST_GOAL_KEY = 'numbat.guestGoal'
const GUEST_LOG_MAX = 1000

type GuestLogEntry = RecentAttempt & { points: number }

export interface ProgressData {
  loading: boolean
  items: ProgressMap
  recent: RecentAttempt[]
  /** Every finished set, newest first (for the weekly goal, streaks and badges) */
  log: RecentAttempt[]
  points: number
  goal: number
}

const EMPTY = { items: {}, recent: [], log: [], points: 0, goal: DEFAULT_GOAL }

/** Guests choose their own weekly goal; students' goal is set by their teacher. */
export function setGuestGoal(goal: number) {
  saveJson(GUEST_GOAL_KEY, goal)
  window.dispatchEvent(new Event('numbat-guest-progress'))
}

function readGuest() {
  const log = loadJson<GuestLogEntry[]>(GUEST_LOG_KEY, [])
  const goal = Number(loadJson<number>(GUEST_GOAL_KEY, DEFAULT_GOAL))
  return {
    items: loadJson<ProgressMap>(GUEST_KEY, {}),
    recent: loadJson<RecentAttempt[]>(GUEST_RECENT_KEY, []),
    log,
    points: log.reduce((t, e) => t + (e.points || 0), 0),
    goal: Number.isInteger(goal) && goal >= 1 && goal <= 20 ? goal : DEFAULT_GOAL,
  }
}


export function useProgress(): ProgressData {
  const { student, token } = useSession()
  const query = useSafeQuery(api.learning.myProgress, student && token ? { token } : 'skip')
  const data = (query.error ? { ok: false } : query.data) as
    | { ok: true; items: ProgressMap; recent: RecentAttempt[]; log?: RecentAttempt[]; points: number; goal?: number }
    | { ok: false }
    | undefined
  // null until this device's saved results have been read
  const [guest, setGuest] = useState<Omit<ProgressData, 'loading'> | null>(null)

  useEffect(() => {
    if (student) return
    const read = () => setGuest(readGuest())
    read()
    window.addEventListener('numbat-guest-progress', read)
    return () => window.removeEventListener('numbat-guest-progress', read)
  }, [student])

  if (student) {
    if (data === undefined) return { loading: true, ...EMPTY }
    if (!data.ok) return { loading: false, ...EMPTY }
    return { loading: false, items: data.items, recent: data.recent, log: data.log ?? data.recent, points: data.points, goal: data.goal ?? DEFAULT_GOAL }
  }
  return guest ? { loading: false, ...guest } : { loading: true, ...EMPTY }
}

/** Level, weekly goal, streak and badges for the current viewer. */
export function useRewards(): { loading: boolean; summary: RewardSummary; goal: number } {
  const p = useProgress()
  const summary = rewardSummary({ points: p.points, items: p.items, log: p.log, goal: p.goal, now: Date.now() })
  return { loading: p.loading, summary, goal: p.goal }
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
  const { student, teacher, parent, token } = useSession()
  const record = useMutation(api.learning.recordAttempt)

  return useCallback(
    async (itemId: string, kind: 'practice' | 'test', correct: number, total: number): Promise<SaveResult> => {
      const score = Math.round((correct / total) * 100)
      const points = pointsFor(correct, total)
      if (teacher) return { saved: false, score, points: 0, best: score, newBest: false, message: 'Teacher preview: results are not saved.' }
      if (parent) return { saved: false, score, points: 0, best: score, newBest: false, message: 'Parent view: practice here isn’t saved to your child’s results.' }
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
      const entry = { itemId, kind, score, finishedAt: Date.now() }
      const recent = loadJson<RecentAttempt[]>(GUEST_RECENT_KEY, [])
      recent.unshift(entry)
      saveJson(GUEST_RECENT_KEY, recent.slice(0, 8))
      const log = loadJson<GuestLogEntry[]>(GUEST_LOG_KEY, [])
      log.unshift({ ...entry, points })
      saveJson(GUEST_LOG_KEY, log.slice(0, GUEST_LOG_MAX))
      window.dispatchEvent(new Event('numbat-guest-progress'))
      return { saved: true, score, points, best, newBest: !prev || score > prev.best }
    },
    [student, teacher, parent, token, record],
  )
}

/** Skills mastered in a topic, whether it has been started, and the best topic-test result. */
export function topicStats(t: Topic, items: ProgressMap) {
  const test = items[`test:${t.id}`]
  const mastered = t.skills.filter((s) => items[s.id]?.mastered).length
  const started = t.skills.some((s) => items[s.id]) || !!test
  return { mastered, total: t.skills.length, started, test }
}
