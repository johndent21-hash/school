// The parent view: everything about one child, read-only. Parents sign in with their
// child's class code, name and PIN (accounts.parentLogIn) and can only ever see that child.
import { query } from "./_generated/server"
import { v } from "convex/values"
import { getParentChild } from "./lib/security"
import { DEFAULT_GOAL, MAX_HISTORY } from "./learning"
import { ratingsForStudent } from "./ratings"

export const parentOverview = query({
  args: { token: v.optional(v.string()) },
  returns: v.any(),
  handler: async (ctx, { token }) => {
    const s = await getParentChild(ctx, token)
    if (!s) return { ok: false as const, message: "Please log in again." }
    const c = await ctx.db.get(s.classId)
    if (!c) return { ok: false as const, message: "Class not found." }
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
      child: { name: s.name, points: s.points, lastActive: s.lastActive ?? null },
      class: { name: c.name, year: c.year, teacherName: teacher?.name ?? "", weeklyGoal: c.weeklyGoal ?? DEFAULT_GOAL },
      items: Object.fromEntries(progress.map((p) => [p.itemId, { best: p.best, last: p.last, attempts: p.attempts, mastered: p.mastered, updatedAt: p.updatedAt }])),
      log: history.map((a) => ({ itemId: a.itemId, kind: a.kind, score: a.score, finishedAt: a.finishedAt })),
      tasks: tasks
        .map((a) => ({ id: a._id, title: a.title, items: a.items, dueDate: a.dueDate ?? null, createdAt: a.createdAt }))
        .sort((a, b) => b.createdAt - a.createdAt),
      lessons: await ratingsForStudent(ctx, c._id, s._id),
    }
  },
})
