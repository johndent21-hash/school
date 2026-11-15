// Exit tickets: a few class-game questions answered on students' own devices at the end of a lesson.
// The server keeps the game id and seed, and for each question only what marking and the summary need (the kind, the
// right option and the mistake labels, as plain text). Each device rebuilds the questions from the seed; the
// fingerprint (check) makes sure it got the same questions as when the ticket was made.
import { findGame, gameChapters, gameTitle } from '@/content/games'
import { buildChapterGame, buildGame, buildRevisionGame, gameCheck } from './build'
import type { GameItem } from './types'

export const EXIT_SIZES = [3, 5, 8] as const
export const DEFAULT_EXIT_SIZE = 5
/** students see an open ticket for this many days (the teacher can close it sooner); the server uses the same */
export const EXIT_OPEN_DAYS = 2

export interface ExitQ {
  /** "ncm8-3.07:expand": the exercise and the kind of question */
  kind: string
  correct: number
  /** the mistake behind each option (null for the right option and for unlabelled ones) */
  mistakes: (string | null)[]
}

export interface ExitAnswer {
  studentId: string
  /** the option chosen for each question, or −1 if left out */
  choices: number[]
  correct: number
  finishedAt: number
}

export interface ExitTicket {
  id: string
  gameId: string
  title: string
  seed: number
  count: number
  calc: boolean
  check: string
  qs: ExitQ[]
  createdAt: number
  open: boolean
  answers: ExitAnswer[]
}

/** The questions of a ticket, rebuilt from its game and seed; null if the game no longer exists. */
export function exitItems(gameId: string, seed: number, count: number, calc: boolean): GameItem[] | null {
  const g = findGame(gameId)
  if (!g) return null
  if (g.upTo) return buildRevisionGame(gameChapters(g), seed, count, calc)
  return g.set ? buildGame(g.set, seed, count, calc) : buildChapterGame(g.chapter, seed, count, calc)
}

/** The questions of a ticket, only if they are the same questions it was made with. */
export function ticketItems(t: { gameId: string; seed: number; count: number; calc: boolean; check: string }): GameItem[] | null {
  const items = exitItems(t.gameId, t.seed, t.count, t.calc)
  return items && gameCheck(items) === t.check ? items : null
}

export function exitSnapshot(items: GameItem[]): { qs: ExitQ[]; check: string } {
  return {
    qs: items.map((it) => ({
      kind: `${it.set.id}:${it.q.meta.t}`,
      correct: it.q.correct,
      mistakes: it.q.mistakes ? it.q.mistakes.slice() : [null, null, null, null],
    })),
    check: gameCheck(items),
  }
}

/** Everything the server needs to start a ticket: a new random seed and the questions it gives. */
export function newExitTicket(gameId: string, count: number, calc: boolean, seed = Math.floor(Math.random() * 2 ** 31)) {
  const g = findGame(gameId)
  const items = exitItems(gameId, seed, count, calc)
  if (!g || !items) return null
  return { gameId, title: gameTitle(g), seed, calc, ...exitSnapshot(items), items }
}

/** "NCM 8 Ex 3.07 · Expanding expressions" for a kind "ncm8-3.07:expand" */
export function kindExercise(kind: string): string {
  const setId = kind.split(':')[0]
  const g = findGame(setId)
  return g?.set ? `${g.set.ref} · ${g.set.title}` : setId
}

export interface QuestionSummary {
  i: number
  kind: string
  answered: number
  right: number
  skipped: number
  /** how many chose each option */
  counts: number[]
  /** the wrong options chosen, most often first, with the mistake each one shows (if labelled) */
  wrong: { option: number; label: string | null; n: number; who: string[] }[]
}

/** Question by question: how many got it right, and which wrong options were chosen. */
export function summarise(t: Pick<ExitTicket, 'qs' | 'answers'>): QuestionSummary[] {
  return t.qs.map((q, i) => {
    const counts = [0, 0, 0, 0]
    const who: string[][] = [[], [], [], []]
    let skipped = 0
    for (const a of t.answers) {
      const c = a.choices[i]
      if (c >= 0 && c <= 3) {
        counts[c]++
        who[c].push(a.studentId)
      } else skipped++
    }
    const wrong = [0, 1, 2, 3]
      .filter((o) => o !== q.correct && counts[o] > 0)
      .map((o) => ({ option: o, label: q.mistakes[o] ?? null, n: counts[o], who: who[o] }))
      .sort((x, y) => y.n - x.n || x.option - y.option)
    return { i, kind: q.kind, answered: t.answers.length, right: counts[q.correct], skipped, counts, wrong }
  })
}

export interface Missed {
  kind: string
  /** answers to this kind of question, over every ticket */
  asked: number
  wrong: number
  /** wrong ÷ asked */
  rate: number
  /** the mistakes behind the wrong answers, most common first (null: a wrong option with no label, or left out) */
  mistakes: { label: string | null; n: number }[]
  /** the most recent ticket and question of this kind, to show an example */
  example: { ticketId: string; i: number }
}

/**
 * The kinds of question the class most often gets wrong, over all its exit tickets: highest wrong rate first
 * (ties: more answers first). Kinds with fewer than minAnswers answers are left out, as a rate from one or two
 * answers says little.
 */
export function mostMissed(tickets: Pick<ExitTicket, 'id' | 'qs' | 'answers' | 'createdAt'>[], minAnswers = 4): Missed[] {
  const by = new Map<string, { asked: number; wrong: number; labels: Map<string | null, number>; example: { ticketId: string; i: number; at: number } }>()
  for (const t of tickets)
    t.qs.forEach((q, i) => {
      const m = by.get(q.kind) ?? { asked: 0, wrong: 0, labels: new Map(), example: { ticketId: t.id, i, at: -1 } }
      if (t.createdAt > m.example.at) m.example = { ticketId: t.id, i, at: t.createdAt }
      for (const a of t.answers) {
        const c = a.choices[i]
        m.asked++
        if (c === q.correct) continue
        m.wrong++
        const label = c >= 0 && c <= 3 ? (q.mistakes[c] ?? null) : null
        m.labels.set(label, (m.labels.get(label) ?? 0) + 1)
      }
      by.set(q.kind, m)
    })
  return [...by]
    .filter(([, m]) => m.asked >= minAnswers && m.wrong > 0)
    .map(([kind, m]) => ({
      kind,
      asked: m.asked,
      wrong: m.wrong,
      rate: m.wrong / m.asked,
      mistakes: [...m.labels].map(([label, n]) => ({ label, n })).sort((x, y) => y.n - x.n || Number(x.label === null) - Number(y.label === null)),
      example: { ticketId: m.example.ticketId, i: m.example.i },
    }))
    .sort((x, y) => y.rate - x.rate || y.asked - x.asked)
}
