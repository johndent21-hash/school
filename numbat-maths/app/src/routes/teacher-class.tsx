// One class: students and PINs, the markbook, tasks and class settings.
import { useMemo, useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { ArrowLeft, Download, KeyRound, Pencil, Printer, Trash2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { PageLoading, Shell } from '@/components/numbat/Shell'
import { findTopic, topicsForYear, YEARS } from '@/content'
import { ago, endOfDay, isOverdue, shortDate } from '@/lib/dates'
import { masteryOf, shareState } from '@/lib/mastery'
import { pageHead } from '@/lib/meta'
import { itemLabel, testItemId } from '@/lib/practice'
import { topicStats, type ProgressMap } from '@/lib/progress'
import { useSession } from '@/lib/session'
import { useMounted } from '@/lib/use-mounted'
import { cn } from '@/lib/utils'

type Tab = 'students' | 'markbook' | 'tasks' | 'settings'
const TABS: { id: Tab; label: string }[] = [
  { id: 'students', label: 'Students' },
  { id: 'markbook', label: 'Markbook' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'settings', label: 'Settings' },
]

export const Route = createFileRoute('/teacher-class')({
  validateSearch: (s: Record<string, unknown>): { id?: string; tab?: Tab } => ({
    id: typeof s.id === 'string' ? s.id : undefined,
    tab: TABS.some((t) => t.id === s.tab) ? (s.tab as Tab) : undefined,
  }),
  head: () => pageHead('/teacher-class'),
  component: ClassPage,
})

interface ReportStudent {
  id: Id<'students'>
  name: string
  hasPin: boolean
  locked: boolean
  points: number
  lastActive: number | null
  progress: ProgressMap
}
interface ReportTask {
  id: Id<'assignments'>
  title: string
  items: string[]
  dueDate: number | null
  createdAt: number
}
interface Report {
  ok: true
  class: { id: Id<'classes'>; name: string; year: number; code: string }
  students: ReportStudent[]
  assignments: ReportTask[]
}

function ClassPage() {
  const mounted = useMounted()
  const { ready, teacher } = useSession()
  if (!mounted || !ready) return <Shell><PageLoading /></Shell>
  if (!teacher)
    return (
      <Shell>
        <div className="mx-auto grid max-w-md gap-4 text-center">
          <h1 className="font-display text-3xl font-semibold">Teachers only</h1>
          <Link to="/teacher" className="btn btn-primary">
            Teacher log in
          </Link>
        </div>
      </Shell>
    )
  return (
    <Shell>
      <ClassView />
    </Shell>
  )
}

function ClassView() {
  const { id, tab = 'students' } = Route.useSearch()
  const { token } = useSession()
  const report = useQuery(api.classes.classReport, token && id ? { token, classId: id as Id<'classes'> } : 'skip') as Report | { ok: false; message: string } | undefined

  if (!id) return <p className="feedback bad">No class chosen.</p>
  if (report === undefined) return <PageLoading />
  if (!report.ok)
    return (
      <div className="grid gap-3">
        <p className="feedback bad">{report.message}</p>
        <Link to="/teacher" className="btn btn-ghost w-fit">
          Back to my classes
        </Link>
      </div>
    )
  const c = report.class

  return (
    <div className="grid gap-6">
      <Link to="/teacher" className="btn btn-ghost btn-sm w-fit">
        <ArrowLeft size={16} aria-hidden="true" /> My classes
      </Link>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">{c.name}</h1>
          <p className="text-muted-foreground">
            Year {c.year} · {report.students.length} students
          </p>
        </div>
        <div className="panel flex items-center gap-3 px-4 py-2">
          <span className="text-sm font-bold text-muted-foreground">Class code</span>
          <span className="chip-code font-display text-2xl font-semibold tracking-widest">{c.code}</span>
        </div>
      </header>

      <div className="tabs w-fit" role="tablist" aria-label="Class sections">
        {TABS.map((t) => (
          <Link key={t.id} to="/teacher-class" search={{ id, tab: t.id }} role="tab" aria-selected={tab === t.id} className={tab === t.id ? 'active' : ''} replace>
            {t.label}
          </Link>
        ))}
      </div>

      {tab === 'students' && <StudentsTab report={report} />}
      {tab === 'markbook' && <Markbook report={report} />}
      {tab === 'tasks' && <TasksTab report={report} />}
      {tab === 'settings' && <SettingsTab report={report} />}
    </div>
  )
}

/* ---------------- Students ---------------- */

function StudentsTab({ report }: { report: Report }) {
  const { token } = useSession()
  const add = useMutation(api.classes.addStudents)
  const reset = useMutation(api.classes.resetPin)
  const remove = useMutation(api.classes.removeStudent)
  const rename = useMutation(api.classes.renameStudent)
  const [names, setNames] = useState('')
  const [busy, setBusy] = useState(false)
  const c = report.class

  const addNames = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    const list = names
      .split(/\r?\n|,|\t/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (list.length === 0) return
    setBusy(true)
    try {
      const r = (await add({ token, classId: c.id, names: list })) as { ok: true; added: number; skipped: string[] } | { ok: false; message: string }
      if (!r.ok) toast.error(r.message)
      else {
        toast.success(`Added ${r.added} student${r.added === 1 ? '' : 's'}.`)
        if (r.skipped.length) toast.info(`Skipped (already in the class or class full): ${r.skipped.join(', ')}`)
        setNames('')
      }
    } finally {
      setBusy(false)
    }
  }

  const act = async (fn: () => Promise<unknown>, okText: string) => {
    const r = (await fn()) as { ok: boolean; message?: string }
    if (r.ok) toast.success(okText)
    else toast.error(r.message ?? 'Something went wrong.')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <section className="panel overflow-hidden">
        {report.students.length === 0 ? (
          <p className="p-5 text-muted-foreground">No students yet. Add their names to get started.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-3 py-2">PIN</th>
                  <th className="px-3 py-2">Last active</th>
                  <th className="px-3 py-2 text-right">Points</th>
                  <th className="px-3 py-2">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {report.students.map((s) => (
                  <tr key={s.id} className="border-t border-border">
                    <td className="px-4 py-2 font-bold">
                      <Link to="/teacher-student" search={{ id: s.id }} className="text-primary hover:underline">
                        {s.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2">
                      {s.locked ? <span className="m-badge m-practise">Locked</span> : s.hasPin ? <span className="m-badge m-mastered">Set</span> : <span className="m-badge m-none">Not yet</span>}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{ago(s.lastActive)}</td>
                    <td className="px-3 py-2 text-right font-bold tabular-nums">{s.points.toLocaleString('en-AU')}</td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          title="Reset PIN"
                          aria-label={`Reset ${s.name}'s PIN`}
                          onClick={() => {
                            if (token && window.confirm(`Reset ${s.name}'s PIN? They will choose a new one next time they log in.`))
                              void act(() => reset({ token, studentId: s.id }), `${s.name} can now choose a new PIN.`)
                          }}
                        >
                          <KeyRound size={15} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          title="Rename"
                          aria-label={`Rename ${s.name}`}
                          onClick={() => {
                            const n = window.prompt('New name', s.name)
                            if (token && n && n.trim() && n.trim() !== s.name) void act(() => rename({ token, studentId: s.id, name: n }), 'Name changed.')
                          }}
                        >
                          <Pencil size={15} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          title="Remove from class"
                          aria-label={`Remove ${s.name}`}
                          onClick={() => {
                            if (token && window.confirm(`Remove ${s.name} and all their results? This can’t be undone.`))
                              void act(() => remove({ token, studentId: s.id }), `${s.name} removed.`)
                          }}
                        >
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <aside className="grid content-start gap-4">
        <form className="panel grid gap-3 p-4" onSubmit={addNames}>
          <h2 className="font-display flex items-center gap-2 text-lg font-semibold">
            <UserPlus size={18} aria-hidden="true" /> Add students
          </h2>
          <label className="grid gap-1">
            <span className="text-sm text-muted-foreground">One name per line. You can paste a column from a spreadsheet. Use first name and last initial, e.g. Ava T.</span>
            <textarea className="field min-h-36 text-base" value={names} onChange={(e) => setNames(e.target.value)} placeholder={'Ava T\nLiam N\nZara K'} />
          </label>
          <button type="submit" className="btn btn-primary" disabled={busy || !names.trim()}>
            Add to class
          </button>
        </form>
        <div className="panel grid gap-2 p-4 text-sm">
          <h2 className="font-display text-lg font-semibold">How students log in</h2>
          <ol className="grid list-decimal gap-1 pl-5 text-muted-foreground">
            <li>Go to this website and type the class code <strong className="chip-code text-foreground">{report.class.code}</strong>.</li>
            <li>Tap their name.</li>
            <li>Choose a 4-digit PIN the first time, then use it every time.</li>
          </ol>
          <p className="text-muted-foreground">Forgotten PIN? Press the key button next to their name.</p>
          <Link to="/teacher-cards" search={{ id: report.class.id }} className="btn btn-ghost btn-sm w-fit">
            <Printer size={15} aria-hidden="true" /> Print login cards
          </Link>
        </div>
      </aside>
    </div>
  )
}

/* ---------------- Markbook ---------------- */

function cellClass(best: number | undefined, attempts: number | undefined): string {
  return `m-${masteryOf(best === undefined ? null : { best, attempts: attempts ?? 0 })}`
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function Markbook({ report }: { report: Report }) {
  const [year, setYear] = useState(report.class.year)
  const [view, setView] = useState<string>('overview')
  const topics = topicsForYear(year)
  const topic = view === 'overview' ? undefined : findTopic(view)
  const students = report.students

  if (students.length === 0) return <p className="panel p-5 text-muted-foreground">Add students to see the markbook.</p>

  const exportCsv = () => {
    if (topic) {
      const cols = [...topic.skills.map((s) => ({ id: s.id, title: s.title })), { id: testItemId(topic.id), title: 'Topic test' }]
      downloadCsv(`${report.class.name} - ${topic.title}.csv`, [
        ['Student', ...cols.map((c) => c.title)],
        ...students.map((s) => [s.name, ...cols.map((c) => (s.progress[c.id] ? s.progress[c.id].best : ''))]),
      ])
    } else {
      downloadCsv(`${report.class.name} - Year ${year} overview.csv`, [
        ['Student', 'Points', ...topics.flatMap((t) => [`${t.title}: skills mastered`, `${t.title}: test best`])],
        ...students.map((s) => [
          s.name,
          s.points,
          ...topics.flatMap((t) => {
            const st = topicStats(t, s.progress)
            return [`${st.mastered}/${st.total}`, st.test ? st.test.best : '']
          }),
        ]),
      ])
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="grid gap-1">
          <span className="label">Year</span>
          <select
            className="field"
            value={year}
            onChange={(e) => {
              setYear(Number(e.target.value))
              setView('overview')
            }}
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                Year {y}
              </option>
            ))}
          </select>
        </label>
        <label className="grid min-w-56 gap-1">
          <span className="label">Show</span>
          <select className="field" value={view} onChange={(e) => setView(e.target.value)}>
            <option value="overview">All topics (overview)</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="btn btn-ghost" onClick={exportCsv}>
          <Download size={16} aria-hidden="true" /> Download CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-2 text-sm" aria-label="Key">
        <span className="m-badge m-mastered">80%+ mastered</span>
        <span className="m-badge m-getting">50–79%</span>
        <span className="m-badge m-practise">below 50%</span>
        <span className="m-badge m-none">not started</span>
      </div>

      <div className="panel max-h-[70vh] overflow-auto">
        {topic ? (
          <table className="markbook">
            <thead>
              <tr>
                <th className="text-left">Student</th>
                {topic.skills.map((s) => (
                  <th key={s.id} className="rot" title={s.title}>
                    <div>{s.title}</div>
                  </th>
                ))}
                <th className="rot" title="Topic test">
                  <div>Topic test</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <th>
                    <Link to="/teacher-student" search={{ id: s.id }} className="hover:underline">
                      {s.name}
                    </Link>
                  </th>
                  {[...topic.skills.map((k) => k.id), testItemId(topic.id)].map((itemId) => {
                    const p = s.progress[itemId]
                    return (
                      <td key={itemId} className={cn('m-cell', cellClass(p?.best, p?.attempts))} title={p ? `Best ${p.best}% · ${p.attempts} attempt${p.attempts === 1 ? '' : 's'}` : 'Not started'}>
                        {p ? `${p.best}` : '–'}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="markbook">
            <thead>
              <tr>
                <th className="text-left">Student</th>
                <th className="rot">
                  <div>Points</div>
                </th>
                {topics.map((t) => (
                  <th key={t.id} className="rot" title={t.title}>
                    <div>{t.title}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <th>
                    <Link to="/teacher-student" search={{ id: s.id }} className="hover:underline">
                      {s.name}
                    </Link>
                  </th>
                  <td className="font-bold tabular-nums">{s.points}</td>
                  {topics.map((t) => {
                    const st = topicStats(t, s.progress)
                    return (
                      <td
                        key={t.id}
                        className={cn('m-cell cursor-pointer', `m-${shareState(st.mastered, st.total, st.started)}`)}
                        title={`${t.title}: ${st.mastered} of ${st.total} skills mastered${st.test ? `, test best ${st.test.best}%` : ''}`}
                        onClick={() => setView(t.id)}
                      >
                        {st.started ? `${st.mastered}/${st.total}` : '–'}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        {topic ? 'Cells show each student’s best score (%). Hover for attempts.' : 'Cells show skills mastered in each topic. Click a cell to open that topic.'}
      </p>
    </div>
  )
}

/* ---------------- Tasks ---------------- */

function TasksTab({ report }: { report: Report }) {
  const { token } = useSession()
  const create = useMutation(api.learning.createTask)
  const del = useMutation(api.learning.deleteTask)
  const [topicId, setTopicId] = useState(topicsForYear(report.class.year)[0]?.id ?? '')
  const [picked, setPicked] = useState<string[]>([])
  const [title, setTitle] = useState('')
  const [due, setDue] = useState('')
  const [busy, setBusy] = useState(false)
  const topic = findTopic(topicId)

  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || picked.length === 0) return
    setBusy(true)
    try {
      const auto = topic ? `${topic.title} practice` : 'Practice task'
      const r = (await create({ token, classId: report.class.id, title: title.trim() || auto, items: picked, dueDate: endOfDay(due) })) as { ok: boolean; message?: string }
      if (r.ok) {
        toast.success('Task set. Students see it on their home page.')
        setPicked([])
        setTitle('')
        setDue('')
      } else toast.error(r.message ?? 'Could not set the task.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
      <section className="grid content-start gap-3">
        <h2 className="font-display text-xl font-semibold">Tasks</h2>
        {report.assignments.length === 0 && <p className="panel p-5 text-muted-foreground">No tasks yet. Use the form to set one.</p>}
        {report.assignments.map((t) => (
          <TaskCard key={t.id} task={t} students={report.students} onDelete={() => token && void del({ token, taskId: t.id })} />
        ))}
      </section>

      <form className="panel grid content-start gap-4 p-4" onSubmit={submit}>
        <h2 className="font-display text-xl font-semibold">Set a task</h2>
        <label className="grid gap-1">
          <span className="label">Topic</span>
          <select className="field" value={topicId} onChange={(e) => setTopicId(e.target.value)}>
            {YEARS.map((y) => (
              <optgroup key={y} label={`Year ${y}`}>
                {topicsForYear(y).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        {topic && (
          <fieldset className="grid gap-1">
            <legend className="label">Choose skills and tests</legend>
            {[...topic.skills.map((s) => ({ id: s.id, title: s.title })), { id: testItemId(topic.id), title: 'Topic test' }].map((it) => (
              <label key={it.id} className="flex items-start gap-2 rounded-lg px-1 py-1 hover:bg-muted">
                <input type="checkbox" className="mt-1 size-4 accent-primary" checked={picked.includes(it.id)} onChange={() => toggle(it.id)} />
                <span className={it.id.startsWith('test:') ? 'font-bold' : ''}>{it.title}</span>
              </label>
            ))}
          </fieldset>
        )}
        {picked.length > 0 && (
          <div className="grid gap-1">
            <span className="label">In this task ({picked.length})</span>
            <div className="flex flex-wrap gap-1">
              {picked.map((id) => (
                <button key={id} type="button" className="chip hover:line-through" onClick={() => toggle(id)} title="Remove">
                  {itemLabel(id).title} ×
                </button>
              ))}
            </div>
          </div>
        )}
        <label className="grid gap-1">
          <span className="label">Task name (optional)</span>
          <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={topic ? `${topic.title} practice` : ''} maxLength={80} />
        </label>
        <label className="grid gap-1">
          <span className="label">Due date (optional)</span>
          <input className="field" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
        </label>
        <button type="submit" className="btn btn-primary" disabled={busy || picked.length === 0}>
          Set task
        </button>
        <p className="text-sm text-muted-foreground">A skill counts as done when the student finishes a practice set after the task is set. Topics from any year can be mixed.</p>
      </form>
    </div>
  )
}

function TaskCard({ task, students, onDelete }: { task: ReportTask; students: ReportStudent[]; onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  const status = useMemo(
    () =>
      students.map((s) => {
        const done = task.items.filter((id) => (s.progress[id]?.updatedAt ?? 0) >= task.createdAt).length
        return { s, done }
      }),
    [students, task],
  )
  const complete = status.filter((x) => x.done === task.items.length).length

  return (
    <div className="panel grid gap-3 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-lg font-semibold">{task.title}</h3>
          <p className="text-sm text-muted-foreground">
            Set {shortDate(task.createdAt)}
            {task.dueDate ? ` · ${isOverdue(task.dueDate) ? 'was due' : 'due'} ${shortDate(task.dueDate)}` : ''}
          </p>
        </div>
        <span className={cn('m-badge', complete === students.length && students.length > 0 ? 'm-mastered' : 'm-getting')}>
          {complete} / {students.length} finished
        </span>
      </div>
      <ul className="flex flex-wrap gap-1">
        {task.items.map((id) => (
          <li key={id} className="chip">
            {itemLabel(id).title}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(!open)} aria-expanded={open}>
          {open ? 'Hide' : 'Show'} who has finished
        </button>
        <button
          type="button"
          className="btn btn-danger btn-sm"
          onClick={() => {
            if (window.confirm(`Delete the task “${task.title}”? Students’ results are kept.`)) onDelete()
          }}
        >
          <Trash2 size={14} aria-hidden="true" /> Delete
        </button>
      </div>
      {open && (
        <ul className="grid gap-1 text-sm sm:grid-cols-2">
          {status.map(({ s, done }) => (
            <li key={s.id} className="flex items-center justify-between gap-2 rounded-lg bg-muted px-2 py-1">
              <span>{s.name}</span>
              <span className={cn('m-badge', done === task.items.length ? 'm-mastered' : done > 0 ? 'm-getting' : 'm-none')}>
                {done}/{task.items.length}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ---------------- Settings ---------------- */

function SettingsTab({ report }: { report: Report }) {
  const { token } = useSession()
  const navigate = useNavigate()
  const update = useMutation(api.classes.updateClass)
  const remove = useMutation(api.classes.deleteClass)
  const [name, setName] = useState(report.class.name)
  const [year, setYear] = useState(report.class.year)

  return (
    <div className="grid max-w-xl gap-6">
      <form
        className="panel grid gap-4 p-5"
        onSubmit={async (e) => {
          e.preventDefault()
          if (!token) return
          const r = (await update({ token, classId: report.class.id, name, year })) as { ok: boolean; message?: string }
          if (r.ok) toast.success('Class updated.')
          else toast.error(r.message ?? 'Could not update the class.')
        }}
      >
        <h2 className="font-display text-xl font-semibold">Class details</h2>
        <label className="grid gap-1">
          <span className="label">Class name</span>
          <input className="field" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
        </label>
        <label className="grid gap-1">
          <span className="label">Year</span>
          <select className="field" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                Year {y}
              </option>
            ))}
          </select>
          <span className="text-sm text-muted-foreground">Students start on this year’s topics. They can still open the other years.</span>
        </label>
        <button type="submit" className="btn btn-primary w-fit">
          Save
        </button>
      </form>

      <section className="panel grid gap-3 p-5">
        <h2 className="font-display text-xl font-semibold text-destructive">Delete class</h2>
        <p className="text-sm text-muted-foreground">Removes the class, its students, their results and its tasks. This can’t be undone.</p>
        <button
          type="button"
          className="btn btn-danger w-fit"
          onClick={async () => {
            if (!token) return
            const typed = window.prompt(`Type the class name (${report.class.name}) to delete it.`)
            if (typed?.trim() !== report.class.name) return
            const r = (await remove({ token, classId: report.class.id })) as { ok: boolean; message?: string }
            if (r.ok) {
              toast.success('Class deleted.')
              void navigate({ to: '/teacher' })
            } else toast.error(r.message ?? 'Could not delete the class.')
          }}
        >
          <Trash2 size={16} aria-hidden="true" /> Delete this class
        </button>
      </section>
    </div>
  )
}
