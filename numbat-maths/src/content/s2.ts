// Shared helpers for the Years 3–4 (Stage 2) content: number words, money and time.
import { MINUS, num } from './helpers'

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

function under100(n: number): string {
  if (n < 20) return ONES[n]
  return TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '')
}

function under1000(n: number): string {
  const h = Math.floor(n / 100)
  const r = n % 100
  if (!h) return under100(r)
  return ONES[h] + ' hundred' + (r ? ' and ' + under100(r) : '')
}

/** Australian English number names, e.g. 4056 -> "four thousand and fifty-six". Up to 999 999. */
export function words(n: number): string {
  if (n === 0) return 'zero'
  const th = Math.floor(n / 1000)
  const r = n % 1000
  if (!th) return under1000(r)
  const head = under1000(th) + ' thousand'
  if (!r) return head
  return head + (r < 100 ? ' and ' : ', ') + under1000(r)
}

/** Money from cents: 405 -> "$4.05". */
export function cash(cents: number): string {
  const neg = cents < 0
  const c = Math.abs(Math.round(cents))
  return (neg ? MINUS : '') + '$' + num(Math.floor(c / 100)) + '.' + String(c % 100).padStart(2, '0')
}

export function digital(h: number, m: number): string {
  return `${h}:${String(m).padStart(2, '0')}`
}

const MIN_WORDS: Record<number, string> = { 5: 'five', 10: 'ten', 15: 'quarter', 20: 'twenty', 25: 'twenty-five', 30: 'half' }
const HOUR_WORDS = ['twelve', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve']

/** "quarter past four", "twenty-five to nine", "seven o’clock", or "seventeen minutes past three". */
export function timeWords(h: number, m: number): string {
  const hw = (x: number) => HOUR_WORDS[((x - 1) % 12) + 1]
  if (m === 0) return `${hw(h)} o’clock`
  const mins = (x: number) => (x === 1 ? 'one minute' : `${words(x)} minutes`)
  if (m <= 30) return MIN_WORDS[m] ? `${MIN_WORDS[m]} past ${hw(h)}` : `${mins(m)} past ${hw(h)}`
  const to = 60 - m
  return MIN_WORDS[to] ? `${MIN_WORDS[to]} to ${hw(h + 1)}` : `${mins(to)} to ${hw(h + 1)}`
}

export const nextHour = (h: number) => (h % 12) + 1

/** Add minutes to a 12-hour clock time (am/pm ignored). */
export function addMinutes(h: number, m: number, add: number): [number, number] {
  const total = ((h % 12) * 60 + m + add) % 720
  const nh = Math.floor(total / 60)
  return [nh === 0 ? 12 : nh, total % 60]
}

export const plural = (n: number, one: string, many = one + 's') => `${num(n)} ${n === 1 ? one : many}`
