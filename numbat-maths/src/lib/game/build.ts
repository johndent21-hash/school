// Builds the questions of a class game. The same seed always gives the same questions, so a game
// interrupted by a page refresh can carry on where it stopped.
import { random, setSeed, shuffle } from '@/lib/maths/rand'
import type { GameChapter, GameItem, GameMaker, GameQuestion, GameSet } from './types'

export const GAME_LENGTHS = [5, 8, 10, 12, 15] as const
export const DEFAULT_LENGTH = 10

/** The kinds a game may ask: calculator kinds only when calculators are allowed. */
export const playable = (set: GameSet, calc = false): GameMaker[] => set.makers.filter((m) => calc || !m.calc)
/** Whether a set (or any set of a chapter) has calculator kinds, so the set-up page offers calculators. */
export const hasCalc = (sets: GameSet[]) => sets.some((s) => s.makers.some((m) => m.calc))

/** Two questions are the same if they look the same on the board. */
const key = (q: GameQuestion) => q.prompt + '|' + (q.diagram ?? '') + '|' + q.options[q.correct]

function fresh(maker: GameMaker, seen: Set<string>, tries: number): GameQuestion | null {
  for (let i = 0; i < tries; i++) {
    const q = maker.make()
    const k = key(q)
    if (!seen.has(k)) {
      seen.add(k)
      return q
    }
  }
  return null
}

/**
 * The order question types are asked in: every type once before any type repeats. The first time round
 * the most basic forms come first; after that the order is mixed, never the same type twice in a row.
 */
function makerOrder(makers: GameMaker[], count: number): GameMaker[] {
  const out: GameMaker[] = []
  while (out.length < count) {
    const pass = shuffle(makers)
    if (out.length === 0) pass.sort((a, b) => (a.d ?? 1) - (b.d ?? 1))
    else if (pass.length > 1 && pass[0] === out[out.length - 1]) pass.push(pass.shift() as GameMaker)
    out.push(...pass)
  }
  return out.slice(0, count)
}

/** A game on one exercise. */
export function buildGame(set: GameSet, seed: number, count: number, calc = false): GameItem[] {
  setSeed(seed)
  const seen = new Set<string>()
  const makers = playable(set, calc)
  const order = makerOrder(makers, count)
  const items: GameItem[] = []
  order.forEach((m, i) => {
    let q = fresh(m, seen, 40)
    if (!q) {
      // this type has run out of new questions: another type steps in, but not the type just asked or the one coming next
      const before = items[i - 1]?.q.meta.t
      const after = order[i + 1]?.t
      const others = shuffle(makers.filter((o) => o !== m))
      const spare = [...others.filter((o) => o.t !== before && o.t !== after), ...others]
      q = spare.reduce<GameQuestion | null>((found, o) => found ?? fresh(o, seen, 20), null) ?? m.make()
    }
    items.push({ q, set, calc: !!makers.find((o) => o.t === q!.meta.t)?.calc })
  })
  return items
}

/** A whole-chapter revision game: the exercises in textbook order, one question from each, then round again. */
export function buildChapterGame(chapter: GameChapter, seed: number, count: number, calc = false): GameItem[] {
  setSeed(seed)
  const seen = new Set<string>()
  const sets = chapter.sets
  // with fewer questions than exercises, spread them across the chapter rather than stopping partway through
  const picks: GameSet[] = []
  if (count >= sets.length) for (let i = 0; i < count; i++) picks.push(sets[i % sets.length])
  else {
    const chosen = shuffle(sets.map((_, i) => i)).slice(0, count).sort((a, b) => a - b)
    for (const i of chosen) picks.push(sets[i])
  }
  return picks.map((set) => {
    const makers = shuffle(playable(set, calc))
    let used = makers[0]
    const q = makers.reduce<GameQuestion | null>((found, m) => found ?? ((used = m), fresh(m, seen, 20)), null) ?? makers[0].make()
    return { q, set, calc: !!used.calc }
  })
}

/**
 * A year revision mix: chapters drawn at random, weighted towards the older ones (the oldest chapter about twice as
 * often as the newest, which students have just been tested on), never the same chapter twice in a row; then a
 * random exercise of that chapter.
 */
export function buildRevisionGame(chapters: GameChapter[], seed: number, count: number, calc = false): GameItem[] {
  setSeed(seed)
  const seen = new Set<string>()
  const n = chapters.length
  const weight = chapters.map((_, i) => (n === 1 ? 1 : 1 + (n - 1 - i) / (n - 1)))
  const sum = weight.reduce((t, w) => t + w, 0)
  const items: GameItem[] = []
  let last = -1
  while (items.length < count) {
    let r = random() * sum
    let c = 0
    while (c < n - 1 && r >= weight[c]) r -= weight[c++]
    if (c === last && n > 1) continue
    last = c
    const sets = shuffle(chapters[c].sets)
    let q: GameQuestion | null = null
    for (const set of sets) {
      let used: GameMaker | undefined
      q = shuffle(playable(set, calc)).reduce<GameQuestion | null>((found, m) => found ?? ((used = m), fresh(m, seen, 20)), null)
      if (q) {
        items.push({ q, set, calc: !!used?.calc })
        break
      }
    }
    if (!q) items.push({ q: playable(sets[0], calc)[0].make(), set: sets[0] })
  }
  return items
}

/** The times a question can be suggested (seconds); they are all timer choices. */
export const SUGGEST_STEPS = [15, 20, 30, 45, 60, 90, 120] as const

const plainText = (h: string) => h.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

/**
 * A suggested time for a question, estimated from what the class has to do: reading the question and the choices
 * (about 12 characters a second, the choices at half weight), each step of the working in its explanation (about
 * 3.5 s for each +, −, ×, ÷ or =, and 6 s for each square or square root, not counting the ² of cm²), plus time for a
 * diagram, a calculator and the harder (d2) kinds; rounded up to the next of SUGGEST_STEPS. A kind can set its own
 * (GameMaker.secs) where the estimate doesn't fit.
 */
export function suggestedSecs(it: GameItem): number {
  const maker = it.set.makers.find((m) => m.t === it.q.meta.t)
  if (maker?.secs) return maker.secs
  const why = plainText(it.q.why)
  const heavy = (why.match(/√|(?<!m)[²³]|\^/g) ?? []).length
  const light = (why.match(/ [+−×÷] | = /g) ?? []).length
  const read = plainText(it.q.prompt).length + it.q.options.map(plainText).join('').length / 2
  const raw = 6 + read / 12 + 3.5 * light + 6 * heavy + (it.q.diagram ? 6 : 0) + (it.calc ? 20 : 0) + ((maker?.d ?? 1) === 2 ? 5 : 0)
  return SUGGEST_STEPS.find((s) => s >= raw) ?? 120
}

/** A short fingerprint of a game's questions, so a saved game is only resumed if it rebuilds the same questions. */
export function gameCheck(items: GameItem[]): string {
  let h = 0
  for (const it of items) for (const ch of key(it.q)) h = (Math.imul(h, 31) + ch.charCodeAt(0)) | 0
  return `${items.length}:${(h >>> 0).toString(36)}`
}
