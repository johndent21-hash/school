// The teacher's lesson-ratings sheet: students down the side, lessons across the top.
// Tap a cell and pick 4, 3, 2, 1 or A (absent), or type them; arrow keys move, and after each
// rating the next student down is selected so a lesson can be filled in quickly.
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { AlertTriangle, ArrowDown, Download, Pencil, Plus, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmBar } from './ConfirmBar'
import { PageLoading } from './Shell'
import { downloadCsv } from '@/lib/csv'
import { PREVIEW_ONLY } from '@/lib/preview'
import { RATINGS, lessonDate, ratingClass, ratingInfo, ratingSummary, todayIso } from '@/lib/ratings'
import { previewBlocked, useClassRatings, useRatingActions } from '@/lib/teacher-data'
import { cn } from '@/lib/utils'

const SHOW_RECENT = 10

export function RatingKey({ withAbsent = true }: { withAbsent?: boolean }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5" aria-label="What the numbers mean">
      {RATINGS.filter((r) => withAbsent || r.value !== 0).map((r) => (
        <li key={r.key} className={cn('r-chip', ratingClass(r.value))}>
          <span className="r-swatch" aria-hidden="true">
            {r.short}
          </span>
          {r.label}
        </li>
      ))}
    </ul>
  )
}

export function RatingsSheet({ classId, className, students }: { classId: string; className: string; students: { id: string; name: string }[] }) {
  const data = useClassRatings(classId)
  const act = useRatingActions(classId)
  const [pending, setPending] = useState<Map<string, { v: number | null; n: number }>>(new Map())
  const [sel, setSel] = useState<{ l: number; s: number } | null>(null)
  const [col, setCol] = useState<number | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [newDate, setNewDate] = useState(todayIso())
  const [newLabel, setNewLabel] = useState('')
  const [edit, setEdit] = useState<{ date: string; label: string } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [jumpToNew, setJumpToNew] = useState(false)
  const cells = useRef(new Map<string, HTMLButtonElement>())
  const wrap = useRef<HTMLDivElement>(null)
  const counter = useRef(0)

  const lessons = data && data.ok ? data.lessons : []
  const shown = showAll ? lessons : lessons.slice(-SHOW_RECENT)
  const saved = useMemo(() => new Map((data && data.ok ? data.ratings : []).map((r) => [`${r.lessonId}|${r.studentId}`, r.value])), [data])
  const get = (lessonId: string, studentId: string): number | null => {
    const k = `${lessonId}|${studentId}`
    const p = pending.get(k)
    return p ? p.v : (saved.get(k) ?? null)
  }

  // newest lessons are on the right: start scrolled there
  useEffect(() => {
    if (wrap.current) wrap.current.scrollLeft = wrap.current.scrollWidth
  }, [shown.length])

  // after adding a lesson, start rating it from the first student
  useEffect(() => {
    if (jumpToNew && shown.length) {
      setSel({ l: shown.length - 1, s: 0 })
      setCol(null)
      setJumpToNew(false)
    }
  }, [jumpToNew, shown.length])

  if (data === undefined) return <PageLoading />
  if (!data.ok) return <p className="feedback bad">{data.message}</p>
  if (students.length === 0) return <p className="panel p-5 text-muted-foreground">Add students to start rating lessons.</p>

  const focusCell = (l: number, s: number) => requestAnimationFrame(() => cells.current.get(`${l}|${s}`)?.focus())
  const select = (l: number, s: number) => {
    setSel({ l, s })
    setCol(null)
    setEdit(null)
    setConfirmDelete(false)
    focusCell(l, s)
  }

  const set = async (l: number, s: number, v: number | null) => {
    const lesson = shown[l]
    const st = students[s]
    const k = `${lesson.id}|${st.id}`
    const n = ++counter.current
    setPending((p) => new Map(p).set(k, { v, n }))
    const err = await act.setRating(lesson.id, st.id, v)
    setPending((p) => {
      if (p.get(k)?.n !== n) return p
      const next = new Map(p)
      next.delete(k)
      return next
    })
    if (err) toast.error(err)
  }

  const rate = (v: number | null) => {
    if (!sel) return
    void set(sel.l, sel.s, v)
    if (v !== null && sel.s + 1 < students.length) select(sel.l, sel.s + 1)
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (!sel) return
    const k = e.key
    let handled = true
    if (/^[1-4]$/.test(k)) rate(Number(k))
    else if (k === 'a' || k === 'A') rate(0)
    else if (k === 'Backspace' || k === 'Delete') void set(sel.l, sel.s, null)
    else if (k === 'ArrowDown' || k === 'Enter') select(sel.l, Math.min(students.length - 1, sel.s + 1))
    else if (k === 'ArrowUp') select(sel.l, Math.max(0, sel.s - 1))
    else if (k === 'ArrowLeft') select(Math.max(0, sel.l - 1), sel.s)
    else if (k === 'ArrowRight') select(Math.min(shown.length - 1, sel.l + 1), sel.s)
    else if (k === 'Escape') setSel(null)
    else handled = false
    if (handled) e.preventDefault()
  }

  const addLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = await act.addLesson(newDate, newLabel)
    if (err) return void toast.error(err)
    setNewLabel('')
    setShowAll(false)
    setJumpToNew(true)
  }

  const exportCsv = () => {
    if (previewBlocked()) return
    downloadCsv(`${className} - lesson ratings.csv`, [
      ['Student', ...lessons.map((l) => `${l.date}${l.label ? ` ${l.label}` : ''}`)],
      ...students.map((s) => [
        s.name,
        ...lessons.map((l) => {
          const v = get(l.id, s.id)
          return v === null ? '' : v === 0 ? 'A' : v
        }),
      ]),
    ])
  }

  const lessonAt = col !== null ? shown[col] : null
  const selLesson = sel ? shown[sel.l] : null
  const selStudent = sel ? students[sel.s] : null
  const selValue = sel && selLesson && selStudent ? get(selLesson.id, selStudent.id) : null

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <form className="flex flex-wrap items-end gap-2" onSubmit={addLesson}>
          <label className="grid gap-1">
            <span className="label">Lesson date</span>
            <input className="field" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} required />
          </label>
          <label className="grid gap-1">
            <span className="label">Note (optional)</span>
            <input className="field w-44" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="e.g. Period 3, Quiz" maxLength={40} />
          </label>
          <button type="submit" className="btn btn-primary" disabled={!newDate}>
            <Plus size={16} aria-hidden="true" /> Add lesson
          </button>
        </form>
        <div className="flex flex-wrap gap-2">
          {lessons.length > SHOW_RECENT && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAll(!showAll)} aria-pressed={showAll}>
              {showAll ? `Show the last ${SHOW_RECENT} lessons` : `Show all ${lessons.length} lessons`}
            </button>
          )}
          <button type="button" className="btn btn-ghost btn-sm" onClick={exportCsv} disabled={lessons.length === 0}>
            <Download size={15} aria-hidden="true" /> Download CSV
          </button>
        </div>
      </div>

      <div className="grid gap-1">
        <RatingKey />
        <p className="text-sm text-muted-foreground">3 and 4 are at or above expectations; 1 and 2 are below. Parents see their own child’s row.</p>
        {PREVIEW_ONLY && <p className="text-sm text-muted-foreground">Example class: try it out. Changes here last until you reload the page.</p>}
      </div>

      {lessons.length === 0 ? (
        <p className="panel p-5 text-muted-foreground">No lessons yet. Choose a date above and press “Add lesson” to start a new column.</p>
      ) : (
        <div className="panel overflow-hidden">
          <div ref={wrap} className="rsheet-wrap" onKeyDown={onKey}>
            <table className="rsheet">
              <thead>
                <tr>
                  <th className="rs-name">Student</th>
                  {shown.map((l, li) => (
                    <th key={l.id} scope="col">
                      <button
                        type="button"
                        className={cn('rs-head', col === li && 'is-sel')}
                        onClick={() => {
                          setCol(col === li ? null : li)
                          setSel(null)
                          setEdit(null)
                          setConfirmDelete(false)
                        }}
                        aria-pressed={col === li}
                        title="Lesson options"
                      >
                        <span className="font-bold">{lessonDate(l.date).split(' ')[0]}</span>
                        <span>{lessonDate(l.date).split(' ').slice(1).join(' ')}</span>
                        <span className="rs-label">{l.label ?? ' '}</span>
                      </button>
                    </th>
                  ))}
                  <th className="rs-sum text-left">Last 5</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st, si) => {
                  const recent = lessons
                    .map((l) => get(l.id, st.id))
                    .filter((v) => v !== null && v > 0)
                    .slice(-5)
                  const sum = ratingSummary(recent)
                  return (
                    <tr key={st.id}>
                      <th scope="row" className="rs-name">
                        <Link to="/teacher-student" search={{ id: st.id }} className="hover:underline" title={st.name}>
                          {st.name}
                        </Link>
                      </th>
                      {shown.map((l, li) => {
                        const v = get(l.id, st.id)
                        const isSel = sel?.l === li && sel?.s === si
                        const k = `${l.id}|${st.id}`
                        return (
                          <td key={l.id}>
                            <button
                              type="button"
                              ref={(el) => {
                                if (el) cells.current.set(`${li}|${si}`, el)
                                else cells.current.delete(`${li}|${si}`)
                              }}
                              className={cn('rs-cell', ratingClass(v), isSel && 'is-sel', pending.has(k) && 'is-pending')}
                              tabIndex={isSel || (!sel && li === shown.length - 1 && si === 0) ? 0 : -1}
                              aria-label={`${st.name}, ${lessonDate(l.date)}: ${v === null ? 'no rating yet' : v === 0 ? 'absent' : `${v}, ${ratingInfo(v).label}`}`}
                              onClick={() => select(li, si)}
                            >
                              {v === null ? '' : ratingInfo(v).short}
                            </button>
                          </td>
                        )
                      })}
                      <td className="rs-sum">
                        {sum.rated === 0 ? (
                          '–'
                        ) : (
                          <span className={cn('inline-flex items-center gap-1', sum.below >= 2 && 'font-bold text-warning')}>
                            {sum.below >= 2 && <AlertTriangle size={13} aria-hidden="true" />}
                            {sum.ok} of {sum.rated} at 3+
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr>
                  <th className="rs-name text-left font-normal">Rated</th>
                  {shown.map((l) => (
                    <td key={l.id}>
                      {students.filter((st) => get(l.id, st.id) !== null).length}/{students.length}
                    </td>
                  ))}
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="rs-bar" aria-live="polite">
            {sel && selLesson && selStudent ? (
              <>
                <span className="mr-1 min-w-0">
                  <strong>{selStudent.name}</strong> · {lessonDate(selLesson.date)}
                  {selLesson.label ? ` · ${selLesson.label}` : ''}
                </span>
                {RATINGS.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    className={cn('rs-pick', ratingClass(r.value))}
                    aria-pressed={selValue === r.value}
                    title={r.label}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => rate(r.value)}
                  >
                    {r.short}
                    <span className="sr-only">{r.label}</span>
                  </button>
                ))}
                <button type="button" className="rs-pick r-none" onMouseDown={(e) => e.preventDefault()} onClick={() => void set(sel.l, sel.s, null)} title="Clear this cell">
                  Clear
                </button>
                <button type="button" className="btn btn-ghost btn-sm ml-auto" onClick={() => setSel(null)}>
                  <X size={15} aria-hidden="true" /> Done
                </button>
                <span className="hidden w-full text-xs text-muted-foreground sm:block">
                  <ArrowDown size={12} className="inline" aria-hidden="true" /> After each number the next student is selected. You can also type 1–4 or A; arrow keys move.
                </span>
              </>
            ) : lessonAt ? (
              <div className="grid w-full gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <strong>
                    {lessonDate(lessonAt.date)}
                    {lessonAt.label ? ` · ${lessonAt.label}` : ''}
                  </strong>
                  <button
                    type="button"
                    className="btn btn-soft btn-sm"
                    onClick={async () => {
                      const err = await act.fillLesson(lessonAt.id, 3)
                      if (err) toast.error(err)
                    }}
                  >
                    Give everyone without a number a 3
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEdit({ date: lessonAt.date, label: lessonAt.label ?? '' })}>
                    <Pencil size={14} aria-hidden="true" /> Change date or note
                  </button>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(true)}>
                    <Trash2 size={14} aria-hidden="true" /> Delete lesson
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm ml-auto" onClick={() => setCol(null)}>
                    <X size={15} aria-hidden="true" /> Close
                  </button>
                </div>
                {edit && (
                  <form
                    className="flex flex-wrap items-end gap-2"
                    onSubmit={async (e) => {
                      e.preventDefault()
                      const err = await act.updateLesson(lessonAt.id, edit.date, edit.label)
                      if (err) toast.error(err)
                      else {
                        setEdit(null)
                        setCol(null)
                      }
                    }}
                  >
                    <label className="grid gap-1">
                      <span className="label">Date</span>
                      <input className="field" type="date" value={edit.date} onChange={(e) => setEdit({ ...edit, date: e.target.value })} required />
                    </label>
                    <label className="grid gap-1">
                      <span className="label">Note</span>
                      <input className="field w-44" value={edit.label} onChange={(e) => setEdit({ ...edit, label: e.target.value })} maxLength={40} />
                    </label>
                    <button type="submit" className="btn btn-primary btn-sm">
                      Save
                    </button>
                  </form>
                )}
                {confirmDelete && (
                  <ConfirmBar
                    message={`Delete the lesson on ${lessonDate(lessonAt.date)} and all its ratings? Parents will no longer see it.`}
                    confirmLabel="Delete lesson"
                    cancelLabel="Keep it"
                    danger
                    onConfirm={async () => {
                      const err = await act.deleteLesson(lessonAt.id)
                      if (err) toast.error(err)
                      setConfirmDelete(false)
                      setCol(null)
                    }}
                    onCancel={() => setConfirmDelete(false)}
                  />
                )}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Tap a cell to give a rating, or tap a lesson’s date to fill, change or delete it.</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
