// One student's lesson ratings, a week per row (newest first), for parents and the student report.
import { useState } from 'react'
import { lessonDate, lessonWeek, ratingClass, ratingInfo, ratingSummary, type LessonRow } from '@/lib/ratings'
import { cn } from '@/lib/utils'

/** A sentence about the most recent rated lessons. */
export function ratingSentence(lessons: LessonRow[], first: string, last = 10): string {
  const recent = lessons.filter((l) => l.value !== null).slice(-last)
  const s = ratingSummary(recent.map((l) => l.value))
  if (recent.length === 0) return `No lessons have been rated for ${first} yet.`
  const n = recent.length === 1 ? 'lesson' : `${recent.length} lessons`
  return `In the last ${n}, ${first} was at or above expectations (3 or 4) in ${s.ok}, below expectations (1 or 2) in ${s.below}${s.absent ? `, and absent for ${s.absent}` : ''}.`
}

/** The last few ratings as small coloured squares. */
export function RatingStrip({ lessons, last = 10 }: { lessons: LessonRow[]; last?: number }) {
  const recent = lessons.filter((l) => l.value !== null).slice(-last)
  return (
    <ul className="rh-strip" aria-label="Most recent lesson ratings, oldest first">
      {recent.map((l) => (
        <li key={l.id} className={ratingClass(l.value)} title={`${lessonDate(l.date)}: ${l.value === 0 ? 'absent' : `${l.value}, ${ratingInfo(l.value!).label}`}`}>
          <span className="r-swatch">{ratingInfo(l.value!).short}</span>
        </li>
      ))}
    </ul>
  )
}

export function RatingsHistory({ lessons, first, weeks = 6 }: { lessons: LessonRow[]; first: string; weeks?: number }) {
  const [all, setAll] = useState(false)
  if (lessons.length === 0) return <p className="text-muted-foreground">No lessons have been rated yet.</p>

  const byWeek = new Map<string, LessonRow[]>()
  for (const l of lessons) {
    const w = lessonWeek(l.date)
    byWeek.set(w, [...(byWeek.get(w) ?? []), l])
  }
  const rows = [...byWeek.entries()].sort((a, b) => b[0].localeCompare(a[0]))
  const shown = all ? rows : rows.slice(0, weeks)

  return (
    <div className="grid gap-2">
      <div>
        {shown.map(([week, ls]) => (
          <div key={week} className="rh-week">
            <p className="text-sm font-bold">Week of {lessonDate(week).split(' ').slice(1).join(' ')}</p>
            <ul className="rh-tiles">
              {ls.map((l) => (
                <li
                  key={l.id}
                  className={cn('rh-tile', ratingClass(l.value))}
                  aria-label={`${lessonDate(l.date)}${l.label ? `, ${l.label}` : ''}: ${l.value === null ? 'not rated yet' : l.value === 0 ? 'absent' : `${l.value}, ${ratingInfo(l.value).label}`}`}
                >
                  <span className="r-swatch" aria-hidden="true">
                    {l.value === null ? '–' : ratingInfo(l.value).short}
                  </span>
                  <span aria-hidden="true">{lessonDate(l.date).split(' ')[0]}</span>
                  {l.label && (
                    <span aria-hidden="true" className="w-full truncate">
                      {l.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {rows.length > weeks && (
        <button type="button" className="btn btn-ghost btn-sm w-fit" onClick={() => setAll(!all)} aria-expanded={all}>
          {all ? 'Show recent weeks only' : `Show all ${rows.length} weeks`}
        </button>
      )}
      <p className="sr-only">{ratingSentence(lessons, first)}</p>
    </div>
  )
}
