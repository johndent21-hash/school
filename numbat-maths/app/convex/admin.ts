// Maintenance functions. These are internal: they can only be run by the site owner
// from the Convex dashboard or CLI, never from the website.
import { internalMutation } from "./_generated/server"
import { v } from "convex/values"
import { hashSecret } from "./lib/security"

/** Removes a teacher account together with its classes, students and results. */
export const deleteTeacherByEmail = internalMutation({
  args: { email: v.string() },
  returns: v.any(),
  handler: async (ctx, { email }) => {
    const t = await ctx.db
      .query("teachers")
      .withIndex("by_email", (q) => q.eq("email", email.trim().toLowerCase()))
      .first()
    if (!t) return { ok: false, message: "No teacher with that email." }
    const classes = await ctx.db
      .query("classes")
      .withIndex("by_teacher", (q) => q.eq("teacherId", t._id))
      .collect()
    let removed = 0
    for (const c of classes) {
      for (const s of await ctx.db
        .query("students")
        .withIndex("by_class", (q) => q.eq("classId", c._id))
        .collect()) {
        for (const p of await ctx.db
          .query("progress")
          .withIndex("by_student", (q) => q.eq("studentId", s._id))
          .collect())
          await ctx.db.delete(p._id)
        for (const a of await ctx.db
          .query("attempts")
          .withIndex("by_student", (q) => q.eq("studentId", s._id))
          .collect())
          await ctx.db.delete(a._id)
        for (const ss of await ctx.db
          .query("sessions")
          .withIndex("by_student", (q) => q.eq("studentId", s._id))
          .collect())
          await ctx.db.delete(ss._id)
        await ctx.db.delete(s._id)
        removed++
      }
      for (const a of await ctx.db
        .query("assignments")
        .withIndex("by_class", (q) => q.eq("classId", c._id))
        .collect())
        await ctx.db.delete(a._id)
      await ctx.db.delete(c._id)
    }
    for (const s of await ctx.db.query("sessions").collect()) {
      if (s.teacherId === t._id) await ctx.db.delete(s._id)
    }
    await ctx.db.delete(t._id)
    return { ok: true, classes: classes.length, students: removed }
  },
})

/** Sets a new password for a teacher who has forgotten theirs. */
export const resetTeacherPassword = internalMutation({
  args: { email: v.string(), newPassword: v.string() },
  returns: v.any(),
  handler: async (ctx, { email, newPassword }) => {
    if (newPassword.length < 8) return { ok: false, message: "Use at least 8 characters." }
    const t = await ctx.db
      .query("teachers")
      .withIndex("by_email", (q) => q.eq("email", email.trim().toLowerCase()))
      .first()
    if (!t) return { ok: false, message: "No teacher with that email." }
    await ctx.db.patch(t._id, { passHash: await hashSecret(newPassword), failedAttempts: 0, lockedUntil: undefined })
    return { ok: true }
  },
})
