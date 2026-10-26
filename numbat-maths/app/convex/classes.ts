// Teacher tools: classes, students, PIN resets and the markbook.
import { mutation, query } from "./_generated/server"
import { v } from "convex/values"
import type { Id } from "./_generated/dataModel"
import type { MutationCtx } from "./_generated/server"
import { cleanName, getTeacher, newClassCode, ownedClass } from "./lib/security"

const fail = (message: string) => ({ ok: false as const, message })
const NOT_TEACHER = "Please log in as a teacher."

export const myClasses = query({
  args: { token: v.optional(v.string()) },
  returns: v.any(),
  handler: async (ctx, { token }) => {
    const t = await getTeacher(ctx, token)
    if (!t) return fail(NOT_TEACHER)
    const classes = await ctx.db
      .query("classes")
      .withIndex("by_teacher", (q) => q.eq("teacherId", t._id))
      .collect()
    const out: { id: Id<"classes">; name: string; year: number; code: string; createdAt: number; studentCount: number; activeThisWeek: number }[] = []
    for (const c of classes) {
      const students = await ctx.db
        .query("students")
        .withIndex("by_class", (q) => q.eq("classId", c._id))
        .collect()
      out.push({
        id: c._id,
        name: c.name,
        year: c.year,
        code: c.code,
        createdAt: c.createdAt,
        studentCount: students.length,
        activeThisWeek: students.filter((s) => s.lastActive && s.lastActive > Date.now() - 7 * 86400000).length,
      })
    }
    out.sort((a, b) => a.year - b.year || a.name.localeCompare(b.name))
    return { ok: true, classes: out }
  },
})

export const createClass = mutation({
  args: { token: v.string(), name: v.string(), year: v.number() },
  returns: v.any(),
  handler: async (ctx, { token, name, year }) => {
    const t = await getTeacher(ctx, token)
    if (!t) return fail(NOT_TEACHER)
    const n = cleanName(name)
    if (n.length < 1) return fail("Give the class a name, e.g. 7MAT2.")
    if (![3, 4, 7, 8, 9].includes(year)) return fail("Choose a year level.")
    const code = await newClassCode(ctx)
    const id = await ctx.db.insert("classes", { teacherId: t._id, name: n, year, code, createdAt: Date.now() })
    return { ok: true, classId: id, code }
  },
})

export const updateClass = mutation({
  args: { token: v.string(), classId: v.id("classes"), name: v.string(), year: v.number() },
  returns: v.any(),
  handler: async (ctx, { token, classId, name, year }) => {
    const t = await getTeacher(ctx, token)
    if (!t) return fail(NOT_TEACHER)
    const c = await ownedClass(ctx, t._id, classId)
    if (!c) return fail("Class not found.")
    if (![3, 4, 7, 8, 9].includes(year)) return fail("Choose a year level.")
    await ctx.db.patch(c._id, { name: cleanName(name) || c.name, year })
    return { ok: true }
  },
})

async function deleteStudentData(ctx: MutationCtx, studentId: Id<"students">) {
  for (const p of await ctx.db
    .query("progress")
    .withIndex("by_student", (q) => q.eq("studentId", studentId))
    .collect())
    await ctx.db.delete(p._id)
  for (const a of await ctx.db
    .query("attempts")
    .withIndex("by_student", (q) => q.eq("studentId", studentId))
    .collect())
    await ctx.db.delete(a._id)
  for (const s of await ctx.db
    .query("sessions")
    .withIndex("by_student", (q) => q.eq("studentId", studentId))
    .collect())
    await ctx.db.delete(s._id)
}

export const deleteClass = mutation({
  args: { token: v.string(), classId: v.id("classes") },
  returns: v.any(),
  handler: async (ctx, { token, classId }) => {
    const t = await getTeacher(ctx, token)
    if (!t) return fail(NOT_TEACHER)
    const c = await ownedClass(ctx, t._id, classId)
    if (!c) return fail("Class not found.")
    const students = await ctx.db
      .query("students")
      .withIndex("by_class", (q) => q.eq("classId", c._id))
      .collect()
    for (const s of students) {
      await deleteStudentData(ctx, s._id)
      await ctx.db.delete(s._id)
    }
    for (const a of await ctx.db
      .query("assignments")
      .withIndex("by_class", (q) => q.eq("classId", c._id))
      .collect())
      await ctx.db.delete(a._id)
    await ctx.db.delete(c._id)
    return { ok: true }
  },
})

export const addStudents = mutation({
  args: { token: v.string(), classId: v.id("classes"), names: v.array(v.string()) },
  returns: v.any(),
  handler: async (ctx, { token, classId, names }) => {
    const t = await getTeacher(ctx, token)
    if (!t) return fail(NOT_TEACHER)
    const c = await ownedClass(ctx, t._id, classId)
    if (!c) return fail("Class not found.")
    const existing = await ctx.db
      .query("students")
      .withIndex("by_class", (q) => q.eq("classId", c._id))
      .collect()
    const taken = new Set(existing.map((s) => s.name.toLowerCase()))
    let added = 0
    const skipped: string[] = []
    for (const raw of names) {
      const n = cleanName(raw)
      if (!n) continue
      if (taken.has(n.toLowerCase())) {
        skipped.push(n)
        continue
      }
      if (existing.length + added >= 60) {
        skipped.push(n)
        continue
      }
      taken.add(n.toLowerCase())
      await ctx.db.insert("students", { classId: c._id, name: n, failedAttempts: 0, points: 0, createdAt: Date.now() })
      added++
    }
    return { ok: true, added, skipped }
  },
})

export const renameStudent = mutation({
  args: { token: v.string(), studentId: v.id("students"), name: v.string() },
  returns: v.any(),
  handler: async (ctx, { token, studentId, name }) => {
    const t = await getTeacher(ctx, token)
    if (!t) return fail(NOT_TEACHER)
    const s = await ctx.db.get(studentId)
    if (!s || !(await ownedClass(ctx, t._id, s.classId))) return fail("Student not found.")
    const n = cleanName(name)
    if (!n) return fail("Enter a name.")
    await ctx.db.patch(s._id, { name: n })
    return { ok: true }
  },
})

export const removeStudent = mutation({
  args: { token: v.string(), studentId: v.id("students") },
  returns: v.any(),
  handler: async (ctx, { token, studentId }) => {
    const t = await getTeacher(ctx, token)
    if (!t) return fail(NOT_TEACHER)
    const s = await ctx.db.get(studentId)
    if (!s || !(await ownedClass(ctx, t._id, s.classId))) return fail("Student not found.")
    await deleteStudentData(ctx, s._id)
    await ctx.db.delete(s._id)
    return { ok: true }
  },
})

export const resetPin = mutation({
  args: { token: v.string(), studentId: v.id("students") },
  returns: v.any(),
  handler: async (ctx, { token, studentId }) => {
    const t = await getTeacher(ctx, token)
    if (!t) return fail(NOT_TEACHER)
    const s = await ctx.db.get(studentId)
    if (!s || !(await ownedClass(ctx, t._id, s.classId))) return fail("Student not found.")
    await ctx.db.patch(s._id, { pinHash: undefined, failedAttempts: 0, lockedUntil: undefined })
    for (const sess of await ctx.db
      .query("sessions")
      .withIndex("by_student", (q) => q.eq("studentId", s._id))
      .collect())
      await ctx.db.delete(sess._id)
    return { ok: true }
  },
})

/** Everything the class page needs: students, their best results and the class tasks. */
export const classReport = query({
  args: { token: v.optional(v.string()), classId: v.id("classes") },
  returns: v.any(),
  handler: async (ctx, { token, classId }) => {
    const t = await getTeacher(ctx, token)
    if (!t) return fail(NOT_TEACHER)
    const c = await ownedClass(ctx, t._id, classId)
    if (!c) return fail("Class not found.")
    const students = await ctx.db
      .query("students")
      .withIndex("by_class", (q) => q.eq("classId", c._id))
      .collect()
    const progress = await ctx.db
      .query("progress")
      .withIndex("by_class", (q) => q.eq("classId", c._id))
      .collect()
    const byStudent = new Map<string, Record<string, { best: number; attempts: number; mastered: boolean; updatedAt: number }>>()
    for (const p of progress) {
      const m = byStudent.get(p.studentId) ?? {}
      m[p.itemId] = { best: p.best, attempts: p.attempts, mastered: p.mastered, updatedAt: p.updatedAt }
      byStudent.set(p.studentId, m)
    }
    const assignments = await ctx.db
      .query("assignments")
      .withIndex("by_class", (q) => q.eq("classId", c._id))
      .collect()
    return {
      ok: true,
      class: { id: c._id, name: c.name, year: c.year, code: c.code },
      students: students
        .map((s) => ({
          id: s._id,
          name: s.name,
          hasPin: !!s.pinHash,
          locked: !!(s.lockedUntil && s.lockedUntil > Date.now()),
          points: s.points,
          lastActive: s.lastActive ?? null,
          progress: byStudent.get(s._id) ?? {},
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
      assignments: assignments
        .map((a) => ({ id: a._id, title: a.title, items: a.items, dueDate: a.dueDate ?? null, createdAt: a.createdAt }))
        .sort((a, b) => b.createdAt - a.createdAt),
    }
  },
})

export const studentDetail = query({
  args: { token: v.optional(v.string()), studentId: v.id("students") },
  returns: v.any(),
  handler: async (ctx, { token, studentId }) => {
    const t = await getTeacher(ctx, token)
    if (!t) return fail(NOT_TEACHER)
    const s = await ctx.db.get(studentId)
    if (!s) return fail("Student not found.")
    const c = await ownedClass(ctx, t._id, s.classId)
    if (!c) return fail("Student not found.")
    const progress = await ctx.db
      .query("progress")
      .withIndex("by_student", (q) => q.eq("studentId", s._id))
      .collect()
    const attempts = await ctx.db
      .query("attempts")
      .withIndex("by_student", (q) => q.eq("studentId", s._id))
      .order("desc")
      .take(100)
    return {
      ok: true,
      student: { id: s._id, name: s.name, points: s.points, lastActive: s.lastActive ?? null, hasPin: !!s.pinHash },
      class: { id: c._id, name: c.name, year: c.year },
      progress: Object.fromEntries(progress.map((p) => [p.itemId, { best: p.best, last: p.last, attempts: p.attempts, mastered: p.mastered, updatedAt: p.updatedAt }])),
      attempts: attempts.map((a) => ({ itemId: a.itemId, kind: a.kind, score: a.score, correct: a.correct, total: a.total, finishedAt: a.finishedAt })),
    }
  },
})
