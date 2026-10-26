// One student's report for their teacher.
import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { ArrowLeft } from 'lucide-react'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { PageLoading, Shell } from '@/components/numbat/Shell'
import { MasteryBadge, ProgressBar } from '@/components/numbat/Mastery'
import { topicsForYear, YEARS } from '@/content'
import { ago, longDate } from '@/lib/dates'
import { masteryOf } from '@/lib/mastery'
import { pageHead } from '@/lib/meta'
import { itemLabel, testItemId } from '@/lib/practice'
import { topicStats, type ProgressMap } from '@/lib/progress'
import { useSession } from '@/lib/session'
import { useMounted } from '@/lib/use-mounted'

export const Route = createFileRoute('/teacher-student')({
  validateSearch: (s: Record<string, unknown>): { id?: string } => ({ id: typeof s.id === 'string' ? s.id : undefined }),
  head: () => pageHead('/teacher-student'),
  component: StudentPage,
})

interface Detail {
  ok: true
  student: { id: string; name: string; points: number; lastActive: number | null; hasPin: boolean }
  class: { id: string; name: string; year: number }
  progress: ProgressMap
  attempts: { itemId: string; kind: 'practice' | 'test'; score: number; correct: number; total: number; finishedAt: number }[]
}

function StudentPage() {
  const mounted = useMounted()
  const { ready, teacher } = useSession()
  return (
    <Shell>
      {!mounted || !ready ? (
        <PageLoading />
      ) : teacher ? (
        <StudentReport />
      ) : (
        <Link to="/teacher" className="btn btn-primary">
          Teacher log in
        </Link>
      )}
    </Shell>
  )
}

function StudentReport() {
  const { id } = Route.useSearch()
  const { token } = useSession()
  const data = useQuery(api.classes.studentDetail, token && id ? { token, studentId: id as Id<'students'> } : 'skip') as Detail | { ok: false; message: string } | undefined
  const [year, setYear] = useState<number | null>(null)

  if (!id) return <p className="feedback bad">No student chosen.</p>
  if (data === undefined) return <PageLoading />
  if (!data.ok) return <p className="feedback bad">{data.message}</p>

  const y = year ?? data.class.year
  const topics = topicsForYear(y)
  const tests = data.attempts.filter((a) => a.kind === 'test').length
  const practice = data.attempts.length - tests

  return (
    <div className="grid gap-6">
      <Link to="/teacher-class" search={{ id: data.class.id, tab: 'students' }} className="btn btn-ghost btn-sm w-fit">
        <ArrowLeft size={16} aria-hidden="true" /> {data.class.name}
      </Link>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">{data.student.name}</h1>
          <p className="text-muted-foreground">
            {data.class.name} · Year {data.class.year} · last active {ago(data.student.lastActive).toLowerCase()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="points-pill">{data.student.points.toLocaleString('en-AU')} points</span>
          <span className="chip">{practice} practice sets</span>
          <span className="chip">{tests} topic tests</span>
          {!data.student.hasPin && <span className="m-badge m-none">Hasn’t logged in yet</span>}
        </div>
      </header>

      <section className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold">Progress by topic</h2>
          <div className="tabs" role="tablist" aria-label="Year">
            {YEARS.map((yy) => (
              <button key={yy} type="button" role="tab" aria-selected={yy === y} className={yy === y ? 'active' : ''} onClick={() => setYear(yy)}>
                Year {yy}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {topics.map((t) => {
            const st = topicStats(t, data.progress)
            const test = data.progress[testItemId(t.id)]
            return (
              <details key={t.id} className="panel p-4" open={st.started}>
                <summary className="cursor-pointer">
                  <span className="font-display text-lg font-semibold">{t.title}</span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    {st.mastered}/{st.total} mastered{test ? ` · test best ${test.best}%` : ''}
                  </span>
                </summary>
                <div className="mt-3 grid gap-2">
                  <ProgressBar value={(st.mastered / st.total) * 100} label={`${st.mastered} of ${st.total} skills mastered`} />
                  <ul className="grid gap-1 text-sm">
                    {t.skills.map((s) => {
                      const p = data.progress[s.id]
                      return (
                        <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-border py-1 last:border-0">
                          <span>{s.title}</span>
                          <span className="flex items-center gap-2">
                            {p && (
                              <span className="text-muted-foreground">
                                {p.attempts}×, {ago(p.updatedAt).toLowerCase()}
                              </span>
                            )}
                            <MasteryBadge state={masteryOf(p)} best={p?.best} />
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </details>
            )
          })}
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="font-display text-2xl font-semibold">Recent activity</h2>
        {data.attempts.length === 0 ? (
          <p className="panel p-5 text-muted-foreground">No activity yet.</p>
        ) : (
          <div className="panel overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-4 py-2">When</th>
                  <th className="px-3 py-2">Activity</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2 text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {data.attempts.map((a, k) => {
                  const l = itemLabel(a.itemId)
                  return (
                    <tr key={k} className="border-t border-border">
                      <td className="whitespace-nowrap px-4 py-2 text-muted-foreground" title={longDate(a.finishedAt)}>
                        {ago(a.finishedAt)}
                      </td>
                      <td className="px-3 py-2">
                        <span className="font-bold">{l.title}</span>
                        <span className="block text-muted-foreground">{l.sub}</span>
                      </td>
                      <td className="px-3 py-2">{a.kind === 'test' ? 'Topic test' : 'Practice'}</td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        <span className={`m-badge m-${a.score >= 80 ? 'mastered' : a.score >= 50 ? 'getting' : 'practise'}`}>
                          {a.correct}/{a.total} · {a.score}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
