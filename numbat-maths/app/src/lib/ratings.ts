// Lesson ratings: each lesson the teacher gives each student a number from 1 to 4.
// 4 and 3 are where we want students to be; 2 and 1 are below expectations. 0 means absent.
// Colours were checked for colour-blind viewers (every pair stays apart), and the number is
// always printed in the cell, so colour is never the only cue.

export type RatingValue = 0 | 1 | 2 | 3 | 4

export const RATINGS: { value: RatingValue; key: string; label: string; short: string; ok: boolean | null }[] = [
  { value: 4, key: '4', label: 'Excellent', short: '4', ok: true },
  { value: 3, key: '3', label: 'Good', short: '3', ok: true },
  { value: 2, key: '2', label: 'Below expectations', short: '2', ok: false },
  { value: 1, key: '1', label: 'Well below expectations', short: '1', ok: false },
  { value: 0, key: 'A', label: 'Absent', short: 'A', ok: null },
]

export const ratingInfo = (v: number) => RATINGS.find((r) => r.value === v)!

/** CSS class for a cell: r4, r3, r2, r1, r0 (absent) or r-none. */
export const ratingClass = (v: number | null | undefined) => (v === null || v === undefined ? 'r-none' : `r${v}`)

export interface LessonRow {
  id: string
  date: string // yyyy-mm-dd
  label: string | null
  value: number | null
}

/** Counts over a set of lessons: rated (not absent), at or above expectations (3–4), below (1–2), absent. */
export function ratingSummary(values: (number | null)[]) {
  const rated = values.filter((v): v is number => v !== null && v > 0)
  return {
    rated: rated.length,
    ok: rated.filter((v) => v >= 3).length,
    below: rated.filter((v) => v <= 2).length,
    absent: values.filter((v) => v === 0).length,
  }
}

/* ---- dates: lessons store the local calendar date as yyyy-mm-dd ---- */

const pad = (n: number) => String(n).padStart(2, '0')
export const isoDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const todayIso = () => isoDate(new Date())
export const fromIso = (s: string) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
/** "Mon 27 Oct" */
export const lessonDate = (s: string) => {
  const d = fromIso(s)
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`
}
/** Monday of the lesson's week, as yyyy-mm-dd */
export const lessonWeek = (s: string) => {
  const d = fromIso(s)
  return isoDate(new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7)))
}
