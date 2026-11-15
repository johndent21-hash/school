// Exit tickets: a few class-game questions answered on students' own devices at the end of a lesson, and the
// teacher's summary of which questions (and which wrong choices) the class got wrong.
import { mutation, query } from "./_generated/server"
import { v } from "convex/values"
import { getStudent, getTeacher, ownedClass } from "./lib/security"

const fail = (message: string) => ({ ok: false as const, message })
const DAY = 24 * 60 * 60 * 1000
/** students see an open ticket for this long after it is started (the teacher can close it sooner) */
export const TICKET_OPEN_DAYS = 2
export const TICKET_SIZES = [3, 5, 8]
// an exercise ("ncm8-3.07"), a whole chapter ("ncm8-ch3") or a year revision mix ("ncm8-rev7")
const GAME_RE = /^[a-z0-9]{2,8}-(\d{1,2}\.\d{2}|ch\d{1,2}|rev\d{1,2})$/
const KIND_RE = /^[a-z0-9.-]{3,20}:[A-Za-z0-9]{1,30}$/
const CHECK_RE = /^\d{1,2}:[a-z0-9]{1,8}$/

const question = v.object({ kind: v.string(), correct: v.number(), mistakes: v.array(v.union(v.string(), v.null())) })

const isOpen = (t: { closedAt?: number; createdAt: number }, now: number) => t.closedAt === undefined && now - t.createdAt < TICKET_OPEN_DAYS * DAY

/** The teacher starts an exit ticket for a class. Any ticket still open for the class is closed. */
export const createExitTicket = mutation({
  args: {
    token: v.string(),
    classId: v.id("classes"),
    gameId: v.string(),
    title: v.string(),
    seed: v.number(),
    calc: v.boolean(),
    check: v.string(),
    qs: v.array(question),
  },
  returns: v.any(),
  handler: async (ctx, a) => {
    const t = await getTeacher(ctx, a.token)
    if (!t) return fail("Please log in as a teacher.")
    const c = await ownedClass(ctx, t._id, a.classId)
    if (!c) return fail("Class not found.")
    if (!GAME_RE.test(a.gameId) || !CHECK_RE.test(a.check) || !Number.isInteger(a.seed) || a.seed < 0 || a.seed > 2 ** 31) return fail("Unknown activity.")
    if (!TICKET_SIZES.includes(a.qs.length) || Number(a.check.split(":")[0]) !== a.qs.length) return fail("An exit ticket has 3, 5 or 8 questions.")
    for (const q of a.qs) {
      if (!KIND_RE.test(q.kind) || !Number.isInteger(q.correct) || q.correct < 0 || q.correct > 3 || q.mistakes.length !== 4) return fail("Unknown activity.")
      if (q.mistakes[q.correct] !== null || q.mistakes.some((m) => m !== null && (m.length > 60 || /[<>]/.test(m)))) return fail("Unknown activity.")
    }
    const title = a.title.replace(/\s+/g, " ").trim().slice(0, 120) || "Exit ticket"
    const now = Date.now()
    for (const old of await ctx.db
      .query("exitTickets")
      .withIndex("by_class", (q) => q.eq("classId", c._id))
      .collect())
      if (old.closedAt === undefined) await ctx.db.patch(old._id, { closedAt: now })
    const id = await ctx.db.insert("exitTickets", {
      classId: c._id,
      gameId: a.gameId,
      title,
      seed: a.seed,
      count: a.qs.length,
      calc: a.calc,
      check: a.check,
      qs: a.qs,
      createdAt: now,
    })
    return { ok: true, id }
  },
})

async function ownedTicket(ctx: any, token: string, ticketId: any) {
  const t = await getTeacher(ctx, token)
  if (!t) return null
  const ticket = await ctx.db.get(ticketId)
  if (!ticket || !(await ownedClass(ctx, t._id, ticket.classId))) return null
  return ticket
}

export const closeExitTicket = mutation({
  args: { token: v.string(), ticketId: v.id("exitTickets") },
  returns: v.any(),
  handler: async (ctx, { token, ticketId }) => {
    const ticket = await ownedTicket(ctx, token, ticketId)
    if (!ticket) return fail("Exit ticket not found.")
    if (ticket.closedAt === undefined) await ctx.db.patch(ticket._id, { closedAt: Date.now() })
    return { ok: true }
  },
})

export const deleteExitTicket = mutation({
  args: { token: v.string(), ticketId: v.id("exitTickets") },
  returns: v.any(),
  handler: async (ctx, { token, ticketId }) => {
    const ticket = await ownedTicket(ctx, token, ticketId)
    if (!ticket) return fail("Exit ticket not found.")
    for (const a of await ctx.db
      .query("exitAnswers")
      .withIndex("by_ticket", (q) => q.eq("ticketId", ticket._id))
      .collect())
      await ctx.db.delete(a._id)
    await ctx.db.delete(ticket._id)
    return { ok: true }
  },
})

/** The class's exit tickets (newest first) with every student's answers, for the summary and most-missed view. */
export const classExitTickets = query({
  args: { token: v.optional(v.string()), classId: v.id("classes") },
  returns: v.any(),
  handler: async (ctx, { token, classId }) => {
    const t = await getTeacher(ctx, token)
    if (!t) return fail("Please log in as a teacher.")
    const c = await ownedClass(ctx, t._id, classId)
    if (!c) return fail("Class not found.")
    const now = Date.now()
    const tickets = await ctx.db
      .query("exitTickets")
      .withIndex("by_class", (q) => q.eq("classId", c._id))
      .order("desc")
      .take(60)
    const out = []
    for (const k of tickets) {
      const answers = await ctx.db
        .query("exitAnswers")
        .withIndex("by_ticket", (q) => q.eq("ticketId", k._id))
        .collect()
      out.push({
        id: k._id,
        gameId: k.gameId,
        title: k.title,
        seed: k.seed,
        count: k.count,
        calc: k.calc,
        check: k.check,
        qs: k.qs,
        createdAt: k.createdAt,
        open: isOpen(k, now),
        answers: answers.map((a) => ({ studentId: a.studentId, choices: a.choices, correct: a.correct, finishedAt: a.finishedAt })),
      })
    }
    return { ok: true, tickets: out }
  },
})

/** The open exit ticket for the student's class, if any, and their answers if they have done it. */
export const myExitTicket = query({
  args: { token: v.optional(v.string()) },
  returns: v.any(),
  handler: async (ctx, { token }) => {
    const s = await getStudent(ctx, token)
    if (!s) return fail("Not logged in.")
    const now = Date.now()
    const recent = await ctx.db
      .query("exitTickets")
      .withIndex("by_class", (q) => q.eq("classId", s.classId))
      .order("desc")
      .take(5)
    const k = recent.find((x) => isOpen(x, now))
    if (!k) return { ok: true, ticket: null }
    const mine = await ctx.db
      .query("exitAnswers")
      .withIndex("by_ticket_student", (q) => q.eq("ticketId", k._id).eq("studentId", s._id))
      .first()
    return {
      ok: true,
      ticket: { id: k._id, gameId: k.gameId, title: k.title, seed: k.seed, count: k.count, calc: k.calc, check: k.check, createdAt: k.createdAt },
      done: mine ? { choices: mine.choices, correct: mine.correct, total: k.count } : null,
    }
  },
})

/** A student hands in an exit ticket (once). Marked here against the ticket's right options. */
export const submitExitTicket = mutation({
  args: { token: v.string(), ticketId: v.id("exitTickets"), choices: v.array(v.number()) },
  returns: v.any(),
  handler: async (ctx, { token, ticketId, choices }) => {
    const s = await getStudent(ctx, token)
    if (!s) return fail("Log in to hand in your exit ticket.")
    const k = await ctx.db.get(ticketId)
    if (!k || k.classId !== s.classId) return fail("Exit ticket not found.")
    if (!isOpen(k, Date.now())) return fail("This exit ticket has closed.")
    if (choices.length !== k.count || choices.some((c) => !Number.isInteger(c) || c < -1 || c > 3)) return fail("Invalid answers.")
    const done = await ctx.db
      .query("exitAnswers")
      .withIndex("by_ticket_student", (q) => q.eq("ticketId", k._id).eq("studentId", s._id))
      .first()
    if (done) return fail("You have already handed in this exit ticket.")
    const correct = choices.filter((c, i) => c === k.qs[i].correct).length
    const now = Date.now()
    await ctx.db.insert("exitAnswers", { ticketId: k._id, classId: s.classId, studentId: s._id, choices, correct, finishedAt: now })
    await ctx.db.patch(s._id, { lastActive: now })
    return { ok: true, correct, total: k.count }
  },
})
