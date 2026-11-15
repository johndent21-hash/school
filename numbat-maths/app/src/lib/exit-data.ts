// The student's open exit ticket: from the server, or in the stand-alone preview the example class's open ticket
// (answered locally, never saved).
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { demoOpenTicket } from './demo-exit'
import { PREVIEW_ONLY } from './preview'
import { useSession } from './session'

export interface MyTicket {
  id: string
  gameId: string
  title: string
  seed: number
  count: number
  calc: boolean
  check: string
  createdAt: number
}
export type MyExit =
  | { ok: true; ticket: null }
  | { ok: true; ticket: MyTicket; done: { choices: number[]; correct: number; total: number } | null; example?: boolean }
  | { ok: false; message: string }

export function useMyExitTicket(): MyExit | undefined {
  const { token, student } = useSession()
  const live = useQuery(api.exits.myExitTicket, !PREVIEW_ONLY && token && student ? { token } : 'skip')
  if (PREVIEW_ONLY) {
    const t = demoOpenTicket()
    return t ? { ok: true, ticket: t, done: null, example: true } : { ok: true, ticket: null }
  }
  return live as MyExit | undefined
}

/** Hands in the answers; returns the mark, or an error message. In the preview it marks locally. */
export function useSubmitExit() {
  const { token } = useSession()
  const submit = useMutation(api.exits.submitExitTicket)
  return async (ticketId: string, choices: number[]): Promise<{ ok: true; correct: number; total: number } | { ok: false; message: string }> => {
    if (PREVIEW_ONLY) {
      const t = demoOpenTicket()
      if (!t) return { ok: false, message: 'This example ticket has closed.' }
      return { ok: true, correct: choices.filter((c, i) => c === t.qs[i].correct).length, total: t.count }
    }
    try {
      return (await submit({ token: token!, ticketId: ticketId as Id<'exitTickets'>, choices })) as { ok: true; correct: number; total: number } | { ok: false; message: string }
    } catch {
      return { ok: false, message: 'That didn’t send. Check your internet connection and try again.' }
    }
  }
}
