// Data for the teacher and parent pages. On the full site it comes from the server; in the
// stand-alone preview (log-ins off) it comes from the made-up example class in demo.ts.
import { useMemo, useSyncExternalStore } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { toast } from 'sonner'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import {
  DEMO_CLASS_ID,
  demoActivity,
  demoClasses,
  demoClassRatings,
  demoParentOverview,
  demoRatingActions,
  demoRatingsVersion,
  demoReport,
  demoStudentDetail,
  subscribeDemoRatings,
} from './demo'
import type { ActivityRow, Mastery } from './insights'
import { PREVIEW_ONLY } from './preview'
import { useSession } from './session'

type Fail = { ok: false; message: string }
const NOT_FOUND: Fail = { ok: false, message: 'Class not found.' }

export interface ClassActivity {
  ok: true
  goal: number
  since: number
  attempts: ActivityRow[]
  masteries: Mastery[]
}

/** In the preview, say that changes are switched off and return true. */
export function previewBlocked(): boolean {
  if (!PREVIEW_ONLY) return false
  toast.info('This is an example class, so changes are switched off in this preview. On the full site this works.')
  return true
}

export function useMyClasses() {
  const { token } = useSession()
  const live = useQuery(api.classes.myClasses, !PREVIEW_ONLY && token ? { token } : 'skip')
  return PREVIEW_ONLY ? { ok: true as const, classes: demoClasses() } : live
}

export function useClassReport(id: string | undefined) {
  const { token } = useSession()
  const live = useQuery(api.classes.classReport, !PREVIEW_ONLY && token && id ? { token, classId: id as Id<'classes'> } : 'skip')
  if (PREVIEW_ONLY) return id === DEMO_CLASS_ID ? demoReport() : NOT_FOUND
  return live
}

export function useClassActivity(id: string | undefined): ClassActivity | Fail | undefined {
  const { token } = useSession()
  const live = useQuery(api.classes.classActivity, !PREVIEW_ONLY && token && id ? { token, classId: id as Id<'classes'> } : 'skip')
  if (PREVIEW_ONLY) return id === DEMO_CLASS_ID ? demoActivity() : NOT_FOUND
  return live as ClassActivity | Fail | undefined
}

export function useStudentDetail(id: string | undefined) {
  const { token } = useSession()
  const live = useQuery(api.classes.studentDetail, !PREVIEW_ONLY && token && id ? { token, studentId: id as Id<'students'> } : 'skip')
  if (PREVIEW_ONLY) return id ? demoStudentDetail(id) : { ok: false as const, message: 'Student not found.' }
  return live
}

/* ---------------- lesson ratings ---------------- */

export interface ClassRatings {
  ok: true
  lessons: { id: string; date: string; label: string | null }[]
  ratings: { lessonId: string; studentId: string; value: number }[]
}

const noDemo = () => () => {}
const zero = () => 0

/** In the preview, re-render when the example ratings change (they are edited in memory). */
function useDemoVersion(): number {
  return useSyncExternalStore(PREVIEW_ONLY ? subscribeDemoRatings : noDemo, PREVIEW_ONLY ? demoRatingsVersion : zero, zero)
}

export function useClassRatings(id: string | undefined): ClassRatings | Fail | undefined {
  const { token } = useSession()
  const live = useQuery(api.ratings.classRatings, !PREVIEW_ONLY && token && id ? { token, classId: id as Id<'classes'> } : 'skip')
  const version = useDemoVersion()
  const demo = useMemo(() => (PREVIEW_ONLY && id === DEMO_CLASS_ID ? demoClassRatings() : null), [id, version])
  if (PREVIEW_ONLY) return demo ?? NOT_FOUND
  return live as ClassRatings | Fail | undefined
}

type Result = { ok: true; filled?: number; id?: string } | { ok: false; message: string }

/** Changes to the ratings sheet. Each returns an error message, or null when it worked. */
export function useRatingActions(classId: string) {
  const { token } = useSession()
  const setRatingM = useMutation(api.ratings.setRating)
  const fillM = useMutation(api.ratings.fillLesson)
  const addM = useMutation(api.ratings.addLesson)
  const updateM = useMutation(api.ratings.updateLesson)
  const deleteM = useMutation(api.ratings.deleteLesson)
  const run = async (fn: () => Promise<unknown>): Promise<string | null> => {
    try {
      const r = (await fn()) as Result
      return r.ok ? null : r.message
    } catch {
      return 'That didn’t save. Check your internet connection and try again.'
    }
  }
  return {
    setRating: (lessonId: string, studentId: string, value: number | null) =>
      PREVIEW_ONLY ? (demoRatingActions.setRating(lessonId, studentId, value), Promise.resolve(null)) : run(() => setRatingM({ token: token!, lessonId: lessonId as Id<'lessons'>, studentId: studentId as Id<'students'>, value })),
    fillLesson: (lessonId: string, value: number) =>
      PREVIEW_ONLY ? (demoRatingActions.fillLesson(lessonId, value), Promise.resolve(null)) : run(() => fillM({ token: token!, lessonId: lessonId as Id<'lessons'>, value })),
    addLesson: (date: string, label: string) =>
      PREVIEW_ONLY ? (demoRatingActions.addLesson(date, label.trim() || null), Promise.resolve(null)) : run(() => addM({ token: token!, classId: classId as Id<'classes'>, date, label })),
    updateLesson: (lessonId: string, date: string, label: string) =>
      PREVIEW_ONLY ? (demoRatingActions.updateLesson(lessonId, date, label.trim() || null), Promise.resolve(null)) : run(() => updateM({ token: token!, lessonId: lessonId as Id<'lessons'>, date, label })),
    deleteLesson: (lessonId: string) =>
      PREVIEW_ONLY ? (demoRatingActions.deleteLesson(lessonId), Promise.resolve(null)) : run(() => deleteM({ token: token!, lessonId: lessonId as Id<'lessons'> })),
  }
}

/* ---------------- parent view ---------------- */

export interface ParentOverview {
  ok: true
  child: { name: string; points: number; lastActive: number | null }
  class: { name: string; year: number; teacherName: string; weeklyGoal: number }
  items: Record<string, { best: number; last?: number; attempts: number; mastered: boolean; updatedAt: number }>
  log: { itemId: string; kind: 'practice' | 'test'; score: number; finishedAt: number }[]
  tasks: { id: string; title: string; items: string[]; dueDate: number | null; createdAt: number }[]
  lessons: { id: string; date: string; label: string | null; value: number | null }[]
}

export function useParentOverview(exampleChild?: string): ParentOverview | Fail | undefined {
  const { token, parent } = useSession()
  const live = useQuery(api.parents.parentOverview, !PREVIEW_ONLY && token && parent ? { token } : 'skip')
  const version = useDemoVersion()
  const demo = useMemo(() => (PREVIEW_ONLY ? demoParentOverview(exampleChild) : null), [exampleChild, version])
  if (PREVIEW_ONLY) return demo!
  return live as ParentOverview | Fail | undefined
}
