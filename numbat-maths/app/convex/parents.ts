// Parent and carer accounts. The teacher prints a parent code on each child's card. A parent types the code and
// chooses their own 6-digit PIN, which sets up a parent account; more children (brothers and sisters) are added to
// the same account with their own codes. Parents log in with any of their children's codes and their PIN.
// Everything a parent sees is read-only, and they can only ever see the children linked to their account.
import { mutation, query } from "./_generated/server"
import type { MutationCtx, QueryCtx } from "./_generated/server"
import type { Doc, Id } from "./_generated/dataModel"
import { v } from "convex/values"
import { cleanParentCode, createSession, getParent, hashSecret, parentChildren, verifySecret } from "./lib/security"
import { lockMinutes, waitText } from "./accounts"
import { DEFAULT_GOAL, MAX_HISTORY } from "./learning"
import { ratingsForStudent } from "./ratings"

const MINUTE = 60 * 1000
const fail = (message: string) => ({ ok: false as const, message })
export const MAX_CHILDREN = 8
/** parent accounts that may be linked to one child (e.g. two households) */
export const MAX_PARENTS_PER_CHILD = 4
const BAD_CODE = "We couldn’t find that parent code. Check it on the card, or ask the teacher for a new one."

async function childByCode(ctx: QueryCtx | MutationCtx, code: string): Promise<Doc<"students"> | null> {
  const clean = cleanParentCode(code)
  if (!clean) return null
  return await ctx.db
    .query("students")
    .withIndex("by_parent_code", (q) => q.eq("parentCode", clean))
    .first()
}

async function linksFor(ctx: QueryCtx | MutationCtx, studentId: Id<"students">) {
  return await ctx.db
    .query("parentLinks")
    .withIndex("by_student", (q) => q.eq("studentId", studentId))
    .collect()
}

function pinProblem(pin: string): string | null {
  if (!/^\d{6}$/.test(pin)) return "Your PIN must be exactly 6 digits."
  if (/^(\d)\1{5}$/.test(pin) || "0123456789".includes(pin) || "9876543210".includes(pin)) return "That PIN is too easy to guess. Choose another one."
  return null
}

/** Step 1 of setting up: the code shows whose card it is, so the parent can check before choosing a PIN. */
export const parentCodeLookup = query({
  args: { code: v.string() },
  returns: v.any(),
  handler: async (ctx, { code }) => {
    if (!cleanParentCode(code)) return fail("Parent codes have 8 letters and numbers.")
    const s = await childByCode(ctx, code)
    const c = s && (await ctx.db.get(s.classId))
    if (!s || !c) return fail(BAD_CODE)
    return { ok: true, childName: s.name, className: c.name, accounts: (await linksFor(ctx, s._id)).length }
  },
})

/** First time: a parent code and a new 6-digit PIN set up a parent account linked to that child. */
export const parentSignUp = mutation({
  args: { code: v.string(), pin: v.string() },
  returns: v.any(),
  handler: async (ctx, { code, pin }) => {
    const s = await childByCode(ctx, code)
    if (!s) return fail(BAD_CODE)
    const problem = pinProblem(pin)
    if (problem) return fail(problem)
    const links = await linksFor(ctx, s._id)
    if (links.length >= MAX_PARENTS_PER_CHILD) return fail("This child already has the most parent accounts allowed. Log in with your PIN instead, or ask the teacher.")
    // two accounts for one child with the same PIN could not be told apart at log-in
    for (const l of links) {
      const p = await ctx.db.get(l.parentId)
      if (p && (await verifySecret(pin, p.pinHash))) return fail("Choose a different PIN: another parent account for this child uses that one. If it is yours, log in instead.")
    }
    const now = Date.now()
    const parentId = await ctx.db.insert("parents", { pinHash: await hashSecret(pin), createdAt: now })
    await ctx.db.insert("parentLinks", { parentId, studentId: s._id, createdAt: now })
    const token = await createSession(ctx, { kind: "parent", parentId }, 60)
    return { ok: true, token }
  },
})

/**
 * Log in with any linked child's parent code and the parent's PIN. Wrong PINs pause log-ins with that code for 10
 * minutes, then 20, 40 ... up to a day. The pause is kept apart from the child's own PIN, so the child can still log in.
 */
export const parentLogIn = mutation({
  args: { code: v.string(), pin: v.string() },
  returns: v.any(),
  handler: async (ctx, { code, pin }) => {
    const s = await childByCode(ctx, code)
    if (!s) return fail(BAD_CODE)
    if (s.parentLockedUntil && s.parentLockedUntil > Date.now()) {
      return fail(`Too many wrong PINs. Try again in ${Math.ceil((s.parentLockedUntil - Date.now()) / MINUTE)} minutes.`)
    }
    const links = await linksFor(ctx, s._id)
    if (links.length === 0) return fail("No parent account uses this code yet. Choose “First time here” to set one up.")
    let found: Id<"parents"> | null = null
    if (/^\d{6}$/.test(pin))
      for (const l of links) {
        const p = await ctx.db.get(l.parentId)
        if (p && (await verifySecret(pin, p.pinHash))) {
          found = p._id
          break
        }
      }
    if (!found) {
      const n = (s.parentFailed ?? 0) + 1
      if (n >= 5) {
        const lockCount = s.parentLockCount ?? 0
        const mins = lockMinutes(lockCount)
        await ctx.db.patch(s._id, { parentFailed: 0, parentLockedUntil: Date.now() + mins * MINUTE, parentLockCount: lockCount + 1 })
        return fail(`That PIN is not right. Parent log-ins with this code are paused for ${waitText(mins)}.`)
      }
      await ctx.db.patch(s._id, { parentFailed: n })
      return fail(`That PIN is not right. ${5 - n} ${5 - n === 1 ? "try" : "tries"} left.`)
    }
    await ctx.db.patch(s._id, { parentFailed: 0, parentLockedUntil: undefined, parentLockCount: 0 })
    const token = await createSession(ctx, { kind: "parent", parentId: found }, 60)
    return { ok: true, token }
  },
})

/** A parent who is logged in adds another child (e.g. a brother or sister) with that child's parent code. */
export const parentAddChild = mutation({
  args: { token: v.string(), code: v.string() },
  returns: v.any(),
  handler: async (ctx, { token, code }) => {
    const p = await getParent(ctx, token)
    if (!p) return fail("Please log in again.")
    const s = await childByCode(ctx, code)
    if (!s) return fail(BAD_CODE)
    const mine = await ctx.db
      .query("parentLinks")
      .withIndex("by_parent", (q) => q.eq("parentId", p._id))
      .collect()
    if (mine.some((l) => l.studentId === s._id)) return { ok: true, studentId: s._id, already: true }
    if (mine.length >= MAX_CHILDREN) return fail(`A parent account can have up to ${MAX_CHILDREN} children.`)
    if ((await linksFor(ctx, s._id)).length >= MAX_PARENTS_PER_CHILD) return fail("This child already has the most parent accounts allowed. Ask the teacher.")
    await ctx.db.insert("parentLinks", { parentId: p._id, studentId: s._id, createdAt: Date.now() })
    return { ok: true, studentId: s._id }
  },
})

/** Takes a child off the parent's account (it does not change anything for the child). */
export const parentRemoveChild = mutation({
  args: { token: v.string(), studentId: v.id("students") },
  returns: v.any(),
  handler: async (ctx, { token, studentId }) => {
    const p = await getParent(ctx, token)
    if (!p) return fail("Please log in again.")
    for (const l of await ctx.db
      .query("parentLinks")
      .withIndex("by_parent", (q) => q.eq("parentId", p._id))
      .collect())
      if (l.studentId === studentId) await ctx.db.delete(l._id)
    return { ok: true }
  },
})

/** Everything about one of the parent's children (the first, if none is named), read-only. */
export const parentOverview = query({
  args: { token: v.optional(v.string()), studentId: v.optional(v.id("students")) },
  returns: v.any(),
  handler: async (ctx, { token, studentId }) => {
    const p = await getParent(ctx, token)
    if (!p) return { ok: false as const, message: "Please log in again." }
    const children = (await parentChildren(ctx, p._id)).sort((a, b) => a.student.name.localeCompare(b.student.name))
    if (children.length === 0) return { ok: false as const, noChildren: true, message: "No children are linked to this account. Add one with the parent code on their card." }
    const found = (studentId && children.find((x) => x.student._id === studentId)) || children[0]
    const s = found.student
    const c = found.cls
    const teacher = await ctx.db.get(c.teacherId)
    const progress = await ctx.db
      .query("progress")
      .withIndex("by_student", (q) => q.eq("studentId", s._id))
      .collect()
    const history = await ctx.db
      .query("attempts")
      .withIndex("by_student", (q) => q.eq("studentId", s._id))
      .order("desc")
      .take(MAX_HISTORY)
    const tasks = await ctx.db
      .query("assignments")
      .withIndex("by_class", (q) => q.eq("classId", c._id))
      .collect()
    return {
      ok: true,
      child: { id: s._id, name: s.name, points: s.points, lastActive: s.lastActive ?? null },
      class: { name: c.name, year: c.year, teacherName: teacher?.name ?? "", weeklyGoal: c.weeklyGoal ?? DEFAULT_GOAL },
      items: Object.fromEntries(progress.map((x) => [x.itemId, { best: x.best, last: x.last, attempts: x.attempts, mastered: x.mastered, updatedAt: x.updatedAt }])),
      log: history.map((a) => ({ itemId: a.itemId, kind: a.kind, score: a.score, finishedAt: a.finishedAt })),
      tasks: tasks
        .map((a) => ({ id: a._id, title: a.title, items: a.items, dueDate: a.dueDate ?? null, createdAt: a.createdAt }))
        .sort((a, b) => b.createdAt - a.createdAt),
      lessons: await ratingsForStudent(ctx, c._id, s._id),
    }
  },
})
