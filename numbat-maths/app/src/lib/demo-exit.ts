// Example exit tickets for the made-up class in the stand-alone preview: real Year 7 Integers questions, with answers
// made up from each example student's profile. The same every time; dates are relative to today.
import { newExitTicket, type ExitTicket } from '@/lib/game/exit'
import { DEMO_CLASS_ID, demoProfile, demoReport, rng, type Kind } from './demo'

const DAY = 24 * 60 * 60 * 1000
// chance of getting a question right, by profile
const P: Record<Kind, number> = { strong: 0.92, steady: 0.72, struggling: 0.4, declining: 0.55, quiet: 0.68, never: 0 }

let cache: { day: number; tickets: ExitTicket[] } | null = null

/** [game, seed, days ago, still open, share of the class that has answered] */
const PLAN: [string, number, number, boolean, number][] = [
  ['ncm7-1.08', 7101, 0, true, 0.7],
  ['ncm7-1.05', 7102, 2, false, 0.95],
  ['ncm7-1.04', 7103, 7, false, 1],
  ['ncm7-1.06', 7104, 9, false, 0.9],
]

export function demoExitTickets(): ExitTicket[] {
  const now = Date.now()
  const day = Math.floor(now / DAY)
  if (cache && cache.day === day) return cache.tickets
  const students = demoReport().students
  const tickets = PLAN.map(([gameId, seed, ago, open, share], k): ExitTicket => {
    const t = newExitTicket(gameId, 5, false, seed)!
    const r = rng(seed)
    const createdAt = now - ago * DAY - (open ? 20 * 60 * 1000 : 0)
    const answers = students
      .filter((s) => demoProfile(s.id) !== 'never' && r() < share)
      .map((s) => {
        const p = P[demoProfile(s.id)]
        const choices = t.qs.map((q) => {
          if (r() < p) return q.correct
          if (r() < 0.05) return -1
          // a wrong answer: usually the first labelled mistake on the options, sometimes another wrong option
          const wrong = [0, 1, 2, 3].filter((o) => o !== q.correct)
          const labelled = wrong.filter((o) => q.mistakes[o])
          return labelled.length && r() < 0.7 ? labelled[Math.floor(r() * Math.min(2, labelled.length))] : wrong[Math.floor(r() * 3)]
        })
        return { studentId: s.id, choices, correct: choices.filter((c, i) => c === t.qs[i].correct).length, finishedAt: createdAt + (5 + r() * 10) * 60 * 1000 }
      })
    return { id: `demo-exit-${k + 1}`, gameId, title: t.title, seed, count: 5, calc: false, check: t.check, qs: t.qs, createdAt, open, answers }
  })
  cache = { day, tickets }
  return tickets
}

/** The ticket an example student would see now (the open one). */
export const demoOpenTicket = () => demoExitTickets().find((t) => t.open) ?? null
export { DEMO_CLASS_ID }
