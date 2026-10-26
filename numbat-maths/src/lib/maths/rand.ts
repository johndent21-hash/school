// Random helpers. A seedable generator keeps tests reproducible.

let state = (Date.now() ^ 0x9e3779b9) >>> 0

export function setSeed(seed: number) {
  state = seed >>> 0
}

export function random(): number {
  // mulberry32
  state = (state + 0x6d2b79f5) >>> 0
  let t = state
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

/** Integer from a to b inclusive. */
export function int(a: number, b: number): number {
  return a + Math.floor(random() * (b - a + 1))
}

/** Integer from a to b inclusive, never zero. */
export function nonZero(a: number, b: number): number {
  for (;;) {
    const n = int(a, b)
    if (n !== 0) return n
  }
}

/** Integer from a to b inclusive, excluding the listed values. */
export function intExcept(a: number, b: number, except: number[]): number {
  for (let i = 0; i < 1000; i++) {
    const n = int(a, b)
    if (!except.includes(n)) return n
  }
  throw new Error('intExcept: no value available')
}

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(random() * arr.length)]
}

export function chance(p = 0.5): boolean {
  return random() < p
}

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Pick k distinct items. */
export function sample<T>(arr: readonly T[], k: number): T[] {
  return shuffle(arr).slice(0, k)
}

/** Multiple-choice helper: shuffles options and returns the new index of the correct one. */
export function mc(correct: string, wrong: string[]): { options: string[]; correct: number } {
  const uniqueWrong = Array.from(new Set(wrong.filter((w) => w !== correct)))
  const options = shuffle([correct, ...uniqueWrong])
  return { options, correct: options.indexOf(correct) }
}

/** Multiple-choice helper that keeps a fixed option order (e.g. Yes/No, angle types). */
export function mcFixed(options: string[], correct: string): { options: string[]; correct: number } {
  const idx = options.indexOf(correct)
  if (idx < 0) throw new Error('mcFixed: correct option missing: ' + correct)
  return { options, correct: idx }
}

export const NAMES = [
  'Mia', 'Liam', 'Ava', 'Noah', 'Isla', 'Jack', 'Zara', 'Oliver', 'Chloe', 'Kai',
  'Ruby', 'Lachlan', 'Priya', 'Ethan', 'Mei', 'Tama', 'Sienna', 'Hamish', 'Aaliyah', 'Leo',
  'Charlotte', 'Arjun', 'Grace', 'Ben', 'Layla', 'Cooper', 'Amelia', 'Hugo', 'Sofia', 'Jarrah',
]

export function name(): string {
  return pick(NAMES)
}

export function names(k: number): string[] {
  return sample(NAMES, k)
}
