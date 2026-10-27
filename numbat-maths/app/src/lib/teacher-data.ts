// Data for the teacher pages. On the full site it comes from the server; in the stand-alone
// preview (log-ins off) it comes from the made-up example class in demo.ts.
import { useQuery } from 'convex/react'
import { toast } from 'sonner'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { DEMO_CLASS_ID, demoActivity, demoClasses, demoReport, demoStudentDetail } from './demo'
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
