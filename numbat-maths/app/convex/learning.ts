// Student progress, results and tasks.
import { mutation, query } from "./_generated/server"
import { v } from "convex/values"
import { getStudent, getTeacher, ownedClass } from "./lib/security"

const fail = (message: string) => ({ ok: false as const, message })
const ITEM_RE = /^[a-z0-9-]+(:[a-z0-9-]+)?$/
export const DEFAULT_GOAL = 5
export const MAX_HISTORY = 2000

/** Saves a finished practice set or topic test and updates the student's best result. */
export const recordAttempt = mutation({
  args: {
    token: v.string(),
    itemId: v.string(),
    kind: v.union(v.literal("practice"), v.literal("test")),
    correct: v.number(),
    total: v.number(),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const s = await getStudent(ctx, args.token)
    if (!s) return fail("Log in to save your progress.")
    if (!ITEM_RE.test(args.itemId) || args.itemId.length > 80) return fail("Unknown activity.")
    if (args.kind === "test" && !args.itemId.startsWith("test:")) return fail("Unknown activity.")
    const total = Math.round(args.total)
    if (total < 1 || total > 30) return fail("Invalid result.")
    const correct = Math.max(0, Math.min(total, Math.round(args.correct * 2) / 2))
    const score = Math.round((correct / total) * 100)
    const now = Date.now()
    // Points: 10 per mark, with a small bonus for a strong result. Capped so results cannot be inflated.
    const points = Math.min(400, Math.round(correct * 10) + (score >= 80 ? 20 : 0))
    await ctx.db.insert("attempts", { studentId: s._id, classId: s.classId, itemId: args.itemId, kind: args.kind, correct, total, score, points, finishedAt: now })
    const existing = await ctx.db
      .query("progress")
      .withIndex("by_student_item", (q) => q.eq("studentId", s._id).eq("itemId", args.itemId))
      .first()
    let best = score
    if (existing) {
      best = Math.max(existing.best, score)
      await ctx.db.patch(existing._id, { best, last: score, attempts: existing.attempts + 1, mastered: best >= 80, updatedAt: now })
    } else {
      await ctx.db.insert("progress", { studentId: s._id, classId: s.classId, itemId: args.itemId, best, last: score, attempts: 1, mastered: best >= 80, updatedAt: now })
    }
    await ctx.db.patch(s._id, { points: s.points + points, lastActive: now })
    return { ok: true, score, best, points, mastered: best >= 80, newBest: !existing || score > existing.best }
  },
})

export const myProgress = query({
  args: { token: v.optional(v.string()) },
  returns: v.any(),
  handler: async (ctx, { token }) => {
    const s = await getStudent(ctx, token)
    if (!s) return fail("Not logged in.")
    const progress = await ctx.db
      .query("progress")
      .withIndex("by_student", (q) => q.eq("studentId", s._id))
      .collect()
    // History for the weekly goal, streaks and badges (newest first)
    const history = await ctx.db
      .query("attempts")
      .withIndex("by_student", (q) => q.eq("studentId", s._id))
      .order("desc")
      .take(MAX_HISTORY)
    const c = await ctx.db.get(s.classId)
    const log = history.map((a) => ({ itemId: a.itemId, kind: a.kind, score: a.score, finishedAt: a.finishedAt }))
    return {
      ok: true,
      points: s.points,
      goal: c?.weeklyGoal ?? DEFAULT_GOAL,
      items: Object.fromEntries(progress.map((p) => [p.itemId, { best: p.best, last: p.last, attempts: p.attempts, mastered: p.mastered, updatedAt: p.updatedAt }])),
      recent: log.slice(0, 8),
      log,
    }
  },
})

export const myTasks = query({
  args: { token: v.optional(v.string()) },
  returns: v.any(),
  handler: async (ctx, { token }) => {
    const s = await getStudent(ctx, token)
    if (!s) return fail("Not logged in.")
    const tasks = await ctx.db
      .query("assignments")
      .withIndex("by_class", (q) => q.eq("classId", s.classId))
      .collect()
    return {
      ok: true,
      tasks: tasks
        .map((a) => ({ id: a._id, title: a.title, items: a.items, dueDate: a.dueDate ?? null, createdAt: a.createdAt }))
        .sort((a, b) => (a.dueDate ?? Infinity) - (b.dueDate ?? Infinity) || b.createdAt - a.createdAt),
    }
  },
})

export const createTask = mutation({
  args: { token: v.string(), classId: v.id("classes"), title: v.string(), items: v.array(v.string()), dueDate: v.optional(v.number()) },
  returns: v.any(),
  handler: async (ctx, { token, classId, title, items, dueDate }) => {
    const t = await getTeacher(ctx, token)
    if (!t) return fail("Please log in as a teacher.")
    const c = await ownedClass(ctx, t._id, classId)
    if (!c) return fail("Class not found.")
    const clean = Array.from(new Set(items.filter((i) => ITEM_RE.test(i)))).slice(0, 30)
    if (clean.length === 0) return fail("Choose at least one skill or test.")
    const name = title.replace(/\s+/g, " ").trim().slice(0, 80) || "Practice task"
    const id = await ctx.db.insert("assignments", { classId: c._id, title: name, items: clean, dueDate, createdAt: Date.now() })
    return { ok: true, id }
  },
})

export const deleteTask = mutation({
  args: { token: v.string(), taskId: v.id("assignments") },
  returns: v.any(),
  handler: async (ctx, { token, taskId }) => {
    const t = await getTeacher(ctx, token)
    if (!t) return fail("Please log in as a teacher.")
    const a = await ctx.db.get(taskId)
    if (!a || !(await ownedClass(ctx, t._id, a.classId))) return fail("Task not found.")
    await ctx.db.delete(a._id)
    return { ok: true }
  },
})
