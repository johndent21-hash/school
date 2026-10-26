// Dates in Australian English.

const DAY = 24 * 60 * 60 * 1000

export function shortDate(ms: number): string {
  return new Intl.DateTimeFormat('en-AU', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(ms))
}

export function longDate(ms: number): string {
  return new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(ms))
}

export function ago(ms: number | null | undefined): string {
  if (!ms) return 'Never'
  const diff = Date.now() - ms
  if (diff < 60 * 1000) return 'Just now'
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)} min ago`
  if (diff < DAY) return `${Math.floor(diff / 3600000)} h ago`
  const days = Math.floor(diff / DAY)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return shortDate(ms)
}

/** End of the chosen day (local time) for a yyyy-mm-dd date input. */
export function endOfDay(value: string): number | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d, 23, 59, 59).getTime()
}

export function isOverdue(due: number | null): boolean {
  return !!due && due < Date.now()
}
