// Student dashboard: tasks from the teacher, recent work and every topic for the year.
import { useEffect, useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { CalendarClock, CheckCircle2, Circle, History, Info } from 'lucide-react'
import { PageLoading, Shell } from '@/components/numbat/Shell'
import { ProgressBar } from '@/components/numbat/Mastery'
import { topicsForYear, YEARS } from '@/content'
import type { Topic } from '@/lib/maths/types'
import { ago, isOverdue, shortDate } from '@/lib/dates'
import { pageHead } from '@/lib/meta'
import { PREVIEW_ONLY } from '@/lib/preview'
import { itemLabel, itemLink } from '@/lib/practice'
import { topicStats, useProgress, useTasks, type ProgressMap, type Task } from '@/lib/progress'
import { firstName, useSession } from '@/lib/session'
import { load, save } from '@/lib/storage'
import { useMounted } from '@/lib/use-mounted'

export const Route = createFileRoute('/home')({
  validateSearch: (s: Record<string, unknown>): { year?: number } => {
    const y = Number(s.year)
    return { year: y === 7 || y === 8 || y === 9 ? y : undefined }
  },
  head: () => pageHead('/home'),
  component: HomePage,
})


function HomePage() {
  const mounted = useMounted()
  const { ready } = useSession()
  return <Shell>{mounted && ready ? <Dashboard /> : <PageLoading />}</Shell>
}

function Dashboard() {
  const { student, teacher } = useSession()
  const search = Route.useSearch()
  const navigate = useNavigate()
  const { items, recent, loading } = useProgress()
  const tasks = useTasks()
  const [year, setYear] = useState<number>(() => search.year ?? student?.year ?? (Number(load('numbat.guestYear')) || 7))

  useEffect(() => {
    if (search.year) setYear(search.year)
  }, [search.year])

  const pickYear = (y: number) => {
    setYear(y)
    if (!student) save('numbat.guestYear', String(y))
    void navigate({ to: '/home', search: { year: y }, replace: true })
  }

  const topics = topicsForYear(year)

  return (
    <div className="grid gap-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">{student ? `Hi ${firstName(student.name)}!` : teacher ? 'Student view' : 'Practise as a guest'}</h1>
          <p className="text-muted-foreground">
            {student ? `${student.className} · Year ${student.year}` : teacher ? 'This is what your students see. Nothing you do here is saved.' : 'Pick a year and a topic to start.'}
          </p>
        </div>
      </section>

      {!student && !teacher && !PREVIEW_ONLY && (
        <div className="feedback info flex items-start gap-2 text-sm">
          <Info size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p>
            You’re practising as a guest, so your results are kept on this device only. Got a class code?{' '}
            <Link to="/join" search={{}} className="underline">
              Log in here
            </Link>
            .
          </p>
        </div>
      )}

      {student && <Tasks tasks={tasks} items={items} />}

      {recent.length > 0 && (
        <section className="grid gap-3" aria-labelledby="recent">
          <h2 id="recent" className="font-display flex items-center gap-2 text-xl font-semibold">
            <History size={20} aria-hidden="true" /> Pick up where you left off
          </h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {recent.slice(0, 3).map((r, k) => {
              const l = itemLabel(r.itemId)
              const link = itemLink(r.itemId)
              return (
                <Link key={k} to={link.to} search={link.search} className="panel flex items-center gap-3 p-3 no-underline hover:border-primary">
                  <span className={`m-badge ${r.score >= 80 ? 'm-mastered' : r.score >= 50 ? 'm-getting' : 'm-practise'}`}>{r.score}%</span>
                  <span className="min-w-0">
                    <span className="block truncate font-bold">{l.title}</span>
                    <span className="block truncate text-sm text-muted-foreground">
                      {l.sub} · {ago(r.finishedAt)}
                    </span>
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      <section className="grid gap-4" aria-labelledby="topics">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="topics" className="font-display text-2xl font-semibold">
            Year {year} topics
          </h2>
          <div className="tabs" role="tablist" aria-label="Year">
            {YEARS.map((y) => (
              <button key={y} type="button" role="tab" aria-selected={y === year} className={y === year ? 'active' : ''} onClick={() => pickYear(y)}>
                Year {y}
              </button>
            ))}
          </div>
        </div>
        {student && year !== student.year && <p className="text-sm text-muted-foreground">You’re looking at Year {year}. Your class is Year {student.year}.</p>}
        {loading ? (
          <PageLoading />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((t, k) => (
              <TopicTile key={t.id} topic={t} items={items} number={k + 1} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function TopicTile({ topic, items, number }: { topic: Topic; items: ProgressMap; number: number }) {
  const s = topicStats(topic, items)
  return (
    <Link to="/topic" search={{ id: topic.id }} className="topic-tile" style={{ ['--hue' as string]: topic.colour }}>
      <div className="flex items-start gap-3">
        <span className="tile-mark" aria-hidden="true">
          {number}
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-lg font-semibold leading-snug">{topic.title}</h3>
          <p className="text-sm text-muted-foreground">
            {topic.skills.length} skills · {topic.strand}
          </p>
        </div>
      </div>
      <ProgressBar value={(s.mastered / s.total) * 100} label={`${topic.title}: ${s.mastered} of ${s.total} skills mastered`} tinted />
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="font-bold">
          {s.mastered} / {s.total} mastered
        </span>
        <span className="text-muted-foreground">{s.test ? `Test best ${s.test.best}%` : 'Test not tried'}</span>
      </div>
    </Link>
  )
}

function Tasks({ tasks, items }: { tasks: Task[] | undefined; items: ProgressMap }) {
  if (tasks === undefined) return <div className="skel h-24" />
  if (tasks.length === 0) return null
  return (
    <section className="grid gap-3" aria-labelledby="tasks">
      <h2 id="tasks" className="font-display flex items-center gap-2 text-xl font-semibold">
        <CalendarClock size={20} aria-hidden="true" /> Tasks from your teacher
      </h2>
      <div className="grid gap-3 md:grid-cols-2">
        {tasks.map((t) => {
          const done = t.items.filter((id) => (items[id]?.updatedAt ?? 0) >= t.createdAt)
          const complete = done.length === t.items.length
          return (
            <div key={t.id} className="panel grid gap-3 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="font-display text-lg font-semibold">{t.title}</h3>
                {complete ? (
                  <span className="m-badge m-mastered">Done</span>
                ) : t.dueDate ? (
                  <span className={`m-badge ${isOverdue(t.dueDate) ? 'm-practise' : 'm-none'}`}>
                    {isOverdue(t.dueDate) ? 'Overdue' : 'Due'} {shortDate(t.dueDate)}
                  </span>
                ) : null}
              </div>
              <ProgressBar value={(done.length / t.items.length) * 100} label={`${done.length} of ${t.items.length} done`} />
              <ul className="grid gap-1">
                {t.items.map((id) => {
                  const l = itemLabel(id)
                  const link = itemLink(id)
                  const ok = done.includes(id)
                  return (
                    <li key={id}>
                      <Link to={link.to} search={link.search} className="flex items-center gap-2 rounded-lg px-1 py-1 hover:bg-muted">
                        {ok ? <CheckCircle2 size={18} className="shrink-0 text-success" aria-label="Done" /> : <Circle size={18} className="shrink-0 text-muted-foreground" aria-label="To do" />}
                        <span className={ok ? 'text-muted-foreground line-through' : 'font-bold'}>{l.title}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>
    </section>
  )
}
