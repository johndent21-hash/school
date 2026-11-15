// The teacher's exit tickets for one class: start one from any class-game exercise or chapter, see who has handed it
// in, what each question's wrong answers were (with the mistake behind each, where the question kind labels it), and
// the kinds of question the class most often gets wrong over all its tickets.
import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { CheckCircle2, ClipboardCheck, Lock, Play, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { GAME_BOOKS } from '@/content/games'
import { hasCalc } from '@/lib/game/build'
import { DEFAULT_EXIT_SIZE, EXIT_OPEN_DAYS, EXIT_SIZES, kindExercise, mostMissed, newExitTicket, summarise, ticketItems, type ExitTicket } from '@/lib/game/exit'
import type { GameItem } from '@/lib/game/types'
import { ago, shortDate } from '@/lib/dates'
import { PREVIEW_ONLY } from '@/lib/preview'
import { useExitActions, useExitTickets } from '@/lib/teacher-data'
import { cn } from '@/lib/utils'
import { ConfirmBar } from './ConfirmBar'
import { Diagram, MathHtml } from './MathHtml'
import { PageLoading } from './Shell'

const LETTERS = ['A', 'B', 'C', 'D']
const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0)

interface Student {
  id: string
  name: string
}

export function ExitTicketsTab({ classId, year, students }: { classId: string; year: number; students: Student[] }) {
  const data = useExitTickets(classId)
  const names = useMemo(() => new Map(students.map((s) => [s.id, s.name])), [students])
  // the questions of each ticket, rebuilt from its seed (null when the site has changed since it was made)
  const items = useMemo(() => {
    const m = new Map<string, GameItem[] | null>()
    if (data?.ok) for (const t of data.tickets) m.set(t.id, ticketItems(t))
    return m
  }, [data])

  if (data === undefined) return <PageLoading />
  if (!data.ok) return <p className="feedback bad">{data.message}</p>
  const open = data.tickets.find((t) => t.open)

  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6">
      <StartTicket classId={classId} year={year} hasOpen={!!open} />
      <MostMissed tickets={data.tickets} items={items} />
      <section className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3" aria-label="Exit tickets">
        <h2 className="font-display text-xl font-semibold">Exit tickets</h2>
        {data.tickets.length === 0 ? (
          <p className="panel p-5 text-muted-foreground">No exit tickets yet. Start one above at the end of a lesson.</p>
        ) : (
          data.tickets.map((t) => <TicketCard key={t.id} t={t} classId={classId} items={items.get(t.id) ?? null} names={names} students={students} />)
        )}
      </section>
    </div>
  )
}

/* ---------------- starting a ticket ---------------- */

function StartTicket({ classId, year, hasOpen }: { classId: string; year: number; hasOpen: boolean }) {
  const actions = useExitActions(classId)
  const books = GAME_BOOKS
  const [bookId, setBookId] = useState(() => (books.find((b) => b.year === year) ?? books[0]).id)
  const book = books.find((b) => b.id === bookId) ?? books[0]
  const [chapterId, setChapterId] = useState(book.chapters[0].id)
  const chapter = book.chapters.find((c) => c.id === chapterId) ?? book.chapters[0]
  const [gameId, setGameId] = useState(chapter.sets[0].id)
  const set = chapter.sets.find((s) => s.id === gameId)
  const [count, setCount] = useState<number>(DEFAULT_EXIT_SIZE)
  const [calc, setCalc] = useState(false)
  const [busy, setBusy] = useState(false)
  const calcOffered = hasCalc(set ? [set] : chapter.sets)

  const start = async () => {
    const t = newExitTicket(set ? set.id : chapter.id, count, calcOffered && calc)
    if (!t) return
    setBusy(true)
    const { items: _items, ...ticket } = t
    const err = await actions.create(ticket)
    setBusy(false)
    if (err) toast.error(err)
    else if (!PREVIEW_ONLY) toast.success('Exit ticket started. Students will see it on their home page.')
  }

  return (
    <section className="panel grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4 p-5" aria-labelledby="start-exit">
      <div className="grid gap-1">
        <h2 id="start-exit" className="flex items-center gap-2 font-display text-xl font-semibold">
          <ClipboardCheck size={20} aria-hidden="true" /> Start an exit ticket
        </h2>
        <p className="text-sm text-muted-foreground">
          A few quick questions from a class game, answered on students’ own devices at the end of the lesson. Students see it on their home page
          until you close it, for up to {EXIT_OPEN_DAYS} days. Starting a new one closes the last one.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="grid min-w-0 gap-1">
          <span className="label">Book</span>
          <select
            className="field w-full min-w-0"
            value={book.id}
            onChange={(e) => {
              const b = books.find((x) => x.id === e.target.value) ?? books[0]
              setBookId(b.id)
              setChapterId(b.chapters[0].id)
              setGameId(b.chapters[0].sets[0].id)
            }}
          >
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title}
              </option>
            ))}
          </select>
        </label>
        <label className="grid min-w-0 gap-1">
          <span className="label">Chapter</span>
          <select
            className="field w-full min-w-0"
            value={chapter.id}
            onChange={(e) => {
              const c = book.chapters.find((x) => x.id === e.target.value) ?? book.chapters[0]
              setChapterId(c.id)
              setGameId(c.sets[0].id)
            }}
          >
            {book.chapters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.number}. {c.title}
              </option>
            ))}
          </select>
        </label>
        <label className="grid min-w-0 gap-1">
          <span className="label">Exercise</span>
          <select className="field w-full min-w-0" value={gameId} onChange={(e) => setGameId(e.target.value)}>
            {chapter.sets.map((s) => (
              <option key={s.id} value={s.id}>
                {s.exercise} {s.title}
              </option>
            ))}
            <option value={chapter.id}>Whole chapter mix</option>
          </select>
        </label>
      </div>
      <div className="flex flex-wrap items-end gap-5">
        <fieldset className="grid gap-2">
          <legend className="label">Questions</legend>
          <div className="tabs w-fit" role="radiogroup" aria-label="Number of questions">
            {EXIT_SIZES.map((n) => (
              <button key={n} type="button" role="radio" aria-checked={n === count} className={n === count ? 'active' : ''} onClick={() => setCount(n)}>
                {n}
              </button>
            ))}
          </div>
        </fieldset>
        {calcOffered && (
          <label className="flex items-center gap-2 pb-2">
            <input type="checkbox" checked={calc} onChange={(e) => setCalc(e.target.checked)} />
            <span>Calculators allowed</span>
          </label>
        )}
        <button type="button" className="btn btn-primary" onClick={() => void start()} disabled={busy}>
          <Play size={18} aria-hidden="true" /> {hasOpen ? 'Start a new exit ticket' : 'Start exit ticket'}
        </button>
        {PREVIEW_ONLY && (
          <Link to="/exit" className="btn btn-ghost h-auto text-left" style={{ whiteSpace: 'normal' }}>
            Try the open example ticket as a student
          </Link>
        )}
      </div>
      {set?.teacherNote && <p className="text-sm text-muted-foreground">{set.teacherNote}</p>}
    </section>
  )
}

/* ---------------- most missed ---------------- */

function MostMissed({ tickets, items }: { tickets: ExitTicket[]; items: Map<string, GameItem[] | null> }) {
  const list = useMemo(() => mostMissed(tickets).filter((m) => m.rate >= 0.25).slice(0, 8), [tickets])
  if (list.length === 0) return null
  return (
    <section className="panel grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3 p-5" aria-labelledby="most-missed">
      <div className="grid gap-1">
        <h2 id="most-missed" className="font-display text-xl font-semibold">
          Most missed
        </h2>
        <p className="text-sm text-muted-foreground">
          The kinds of question this class gets wrong most often, over all its exit tickets, with the mistakes behind the wrong answers.
        </p>
      </div>
      <ol className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3">
        {list.map((m) => {
          const ex = items.get(m.example.ticketId)?.[m.example.i]
          const shown = m.mistakes.slice(0, 3)
          return (
            <li key={m.kind} className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-2 rounded-lg border border-border p-3">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-display text-2xl font-semibold text-[hsl(var(--accent-2))]">{pct(m.wrong, m.asked)}%</span>
                <span className="text-sm text-muted-foreground">
                  wrong ({m.wrong} of {m.asked} answers)
                </span>
                <span className="chip chip-book">{kindExercise(m.kind)}</span>
              </div>
              {ex && (
                <div className="text-sm">
                  <span className="text-muted-foreground">For example: </span>
                  <MathHtml inline className="exit-sum" html={ex.q.prompt.replace(/<div class="big">/g, ' <span>').replace(/<\/div>/g, '</span>')} />
                </div>
              )}
              <ul className="flex flex-wrap gap-2 text-sm">
                {shown.map((x, k) => (
                  <li key={k} className="chip h-auto max-w-full" style={{ whiteSpace: 'normal' }}>
                    {x.label ? `“${x.label}”` : 'another wrong choice or left out'} × {x.n}
                  </li>
                ))}
              </ul>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

/* ---------------- one ticket ---------------- */

function TicketCard({ t, classId, items, names, students }: { t: ExitTicket; classId: string; items: GameItem[] | null; names: Map<string, string>; students: Student[] }) {
  const actions = useExitActions(classId)
  const [confirm, setConfirm] = useState(false)
  const sum = useMemo(() => summarise(t), [t])
  const handedIn = new Set(t.answers.map((a) => a.studentId))
  const missing = students.filter((s) => !handedIn.has(s.id))
  const avg = t.answers.length ? t.answers.reduce((x, a) => x + a.correct, 0) / t.answers.length : 0
  const who = (ids: string[]) =>
    ids
      .map((id) => names.get(id) ?? 'a removed student')
      .sort((a, b) => a.localeCompare(b))
      .join(', ')

  return (
    <article className={cn('panel grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3 p-4', t.open && 'border-2 border-[hsl(var(--primary))]')}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <h3 className="font-display text-lg font-semibold">{t.title}</h3>
          <p className="text-sm text-muted-foreground">
            {shortDate(t.createdAt)} ({ago(t.createdAt)}) · {t.count} questions{t.calc ? ' · calculators allowed' : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {t.open ? (
            <span className="chip font-bold">Open</span>
          ) : (
            <span className="chip">
              <Lock size={14} aria-hidden="true" /> Closed
            </span>
          )}
          {t.open && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => void actions.close(t.id).then((e) => e && toast.error(e))}>
              Close it
            </button>
          )}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirm(true)} aria-label={`Delete the exit ticket ${t.title}`}>
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>
      </header>
      {confirm && (
        <ConfirmBar
          message="Delete this exit ticket and every student’s answers to it?"
          confirmLabel="Delete"
          cancelLabel="Keep it"
          danger
          onConfirm={() => {
            setConfirm(false)
            void actions.remove(t.id).then((e) => e && toast.error(e))
          }}
          onCancel={() => setConfirm(false)}
        />
      )}
      <p className="flex flex-wrap gap-x-5 gap-y-1">
        <span>
          <strong>{t.answers.length}</strong> of {students.length} handed in
        </span>
        {t.answers.length > 0 && (
          <span>
            Average <strong>{Math.round(avg * 10) / 10}</strong> out of {t.count}
          </span>
        )}
      </p>
      {t.answers.length > 0 && (
        <details open={t.open} className="min-w-0">
          <summary className="cursor-pointer font-bold">Question by question</summary>
          {!items && <p className="mt-2 text-sm text-muted-foreground">The site’s questions have changed since this ticket was made, so only the results are shown.</p>}
          <ol className="mt-3 grid min-w-0 gap-3">
            {sum.map((s) => {
              const it = items?.[s.i]
              return (
                <li key={s.i} className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-2 rounded-lg border border-border p-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-bold">Question {s.i + 1}</span>
                    <span className={cn('font-bold', pct(s.right, s.answered) < 60 && 'text-[hsl(var(--accent-2))]')}>
                      {pct(s.right, s.answered)}% right ({s.right} of {s.answered})
                    </span>
                  </div>
                  {it ? (
                    <div className="grid min-w-0 gap-2 text-sm sm:grid-cols-[minmax(0,1fr)_auto]">
                      <MathHtml html={it.q.prompt} className="exit-sum min-w-0 overflow-x-auto" />
                      {it.q.diagram && (
                        <div className="max-w-[220px]">
                          <Diagram svg={it.q.diagram} note={it.q.note} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{kindExercise(s.kind)}</p>
                  )}
                  <ul className="grid gap-1 text-sm">
                    {[0, 1, 2, 3].map((o) => {
                      const right = o === t.qs[s.i].correct
                      const label = t.qs[s.i].mistakes[o]
                      const w = s.wrong.find((x) => x.option === o)
                      return (
                        <li key={o} className="grid grid-cols-[2rem_1fr_auto] items-center gap-2">
                          <span className={cn('font-bold', right && 'text-[hsl(var(--success))]')}>{right ? <CheckCircle2 size={16} aria-label="right answer" /> : LETTERS[o]}</span>
                          <span className="min-w-0">
                            {it && <MathHtml inline html={it.q.options[o]} />}
                            {!right && label && <span className="text-muted-foreground"> · {label}</span>}
                            {w && <span className="block text-xs text-muted-foreground">{who(w.who)}</span>}
                          </span>
                          <span className="tabular-nums">{s.counts[o]}</span>
                        </li>
                      )
                    })}
                    {s.skipped > 0 && <li className="text-muted-foreground">Left out: {s.skipped}</li>}
                  </ul>
                </li>
              )
            })}
          </ol>
          {missing.length > 0 && (
            <p className="mt-3 text-sm text-muted-foreground">
              Not handed in: {missing.map((m) => m.name).join(', ')}
            </p>
          )}
        </details>
      )}
    </article>
  )
}
