// Lesson ratings: each lesson the teacher gives every student a number from 1 to 4
// (4 excellent, 3 good, 2 below expectations, 1 well below; 0 means absent).
// Teachers fill these in on a spreadsheet; parents see their own child's row.
import { mutation, query } from "./_generated/server"
import type { QueryCtx } from "./_generated/server"
import { v } from "convex/values"
import type { Id } from "./_generated/dataModel"
import { deleteRatingsFor, getTeacher, ownedClass } from "./lib/security"

const fail = (message: string) => ({ ok: false as const, message })
const NOT_TEACHER = "Please log in as a teacher."
const MAX_LESSONS = 400
const DATE_RE = /^(20\d\d)-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/

const cleanLabel = (s: string | undefined) => (s ?? "").replace(/\s+/g, " ").trim().slice(0, 40) || undefined
const validDate = (d: string) => {
  const m = d.match(DATE_RE)
  if (!m) return false
  const dt = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]))
  return dt.getUTCMonth() === +m[2] - 1 // rejects 31 April and the like
}

/** Lessons sorted oldest first (by date, then by when they were added). */
async function classLessons(ctx: QueryCtx, classId: Id<"classes">) {
  const lessons = await ctx.db
    .query("lessons")
    .withIndex("by_class", (q) => q.eq("classId", classId))
    .collect()
  return lessons.sort((a, b) => a.date.localeCompare(b.date) || a.createdAt - b.createdAt)
}

/** One student's rating in every lesson of their class (null where not rated yet). */
export async function ratingsForStudent(ctx: QueryCtx, classId: Id<"classes">, studentId: Id<"students">) {
  const lessons = await classLessons(ctx, classId)
  const mine = await ctx.db
    .query("ratings")
    .withIndex("by_student", (q) => q.eq("studentId", studentId))
    .collect()
  const byLesson = new Map(mine.map((r) => [r.lessonId, r.value]))
  return lessons.map((l) => ({ id: l._id, date: l.date, label: l.label ?? null, value: byLesson.get(l._id) ?? null }))
}

async function teacherLesson(ctx: any, token: string, lessonId: Id<"lessons">) {
  const t = await getTeacher(ctx, token)
  if (!t) return null
  const l = await ctx.db.get(lessonId)
  if (!l || !(await ownedClass(ctx, t._id, l.classId))) return null
  return l
}

export const classRatings = query({
  args: { token: v.optional(v.string()), classId: v.id("classes") },
  returns: v.any(),
  handler: async (ctx, { token, classId }) => {
    const t = await getTeacher(ctx, token)
    if (!t) return fail(NOT_TEACHER)
    const c = await ownedClass(ctx, t._id, classId)
    if (!c) return fail("Class not found.")
    const lessons = await classLessons(ctx, c._id)
    const ratings = await ctx.db
      .query("ratings")
      .withIndex("by_class", (q) => q.eq("classId", c._id))
      .collect()
    return {
      ok: true,
      lessons: lessons.map((l) => ({ id: l._id, date: l.date, label: l.label ?? null })),
      ratings: ratings.map((r) => ({ lessonId: r.lessonId, studentId: r.studentId, value: r.value })),
    }
  },
})

export const addLesson = mutation({
  args: { token: v.string(), classId: v.id("classes"), date: v.string(), label: v.optional(v.string()) },
  returns: v.any(),
  handler: async (ctx, { token, classId, date, label }) => {
    const t = await getTeacher(ctx, token)
    if (!t) return fail(NOT_TEACHER)
    const c = await ownedClass(ctx, t._id, classId)
    if (!c) return fail("Class not found.")
    if (!validDate(date)) return fail("Choose the date of the lesson.")
    const count = (
      await ctx.db
        .query("lessons")
        .withIndex("by_class", (q) => q.eq("classId", c._id))
        .collect()
    ).length
    if (count >= MAX_LESSONS) return fail(`A class can have up to ${MAX_LESSONS} lessons. Delete some old ones first.`)
    const id = await ctx.db.insert("lessons", { classId: c._id, date, label: cleanLabel(label), createdAt: Date.now() })
    return { ok: true, id }
  },
})

export const updateLesson = mutation({
  args: { token: v.string(), lessonId: v.id("lessons"), date: v.string(), label: v.optional(v.string()) },
  returns: v.any(),
  handler: async (ctx, { token, lessonId, date, label }) => {
    const l = await teacherLesson(ctx, token, lessonId)
    if (!l) return fail("Lesson not found.")
    if (!validDate(date)) return fail("Choose the date of the lesson.")
    await ctx.db.patch(l._id, { date, label: cleanLabel(label) })
    return { ok: true }
  },
})

export const deleteLesson = mutation({
  args: { token: v.string(), lessonId: v.id("lessons") },
  returns: v.any(),
  handler: async (ctx, { token, lessonId }) => {
    const l = await teacherLesson(ctx, token, lessonId)
    if (!l) return fail("Lesson not found.")
    await deleteRatingsFor(ctx, { lessonId: l._id })
    await ctx.db.delete(l._id)
    return { ok: true }
  },
})

async function upsert(ctx: any, l: { _id: Id<"lessons">; classId: Id<"classes"> }, studentId: Id<"students">, value: number | null) {
  const existing = await ctx.db
    .query("ratings")
    .withIndex("by_lesson_student", (q: any) => q.eq("lessonId", l._id).eq("studentId", studentId))
    .first()
  if (value === null) {
    if (existing) await ctx.db.delete(existing._id)
  } else if (existing) {
    if (existing.value !== value) await ctx.db.patch(existing._id, { value, updatedAt: Date.now() })
  } else {
    await ctx.db.insert("ratings", { lessonId: l._id, classId: l.classId, studentId, value, updatedAt: Date.now() })
  }
}

/** Sets one cell: 1–4, 0 for absent, or null to clear it. */
export const setRating = mutation({
  args: { token: v.string(), lessonId: v.id("lessons"), studentId: v.id("students"), value: v.union(v.number(), v.null()) },
  returns: v.any(),
  handler: async (ctx, { token, lessonId, studentId, value }) => {
    const l = await teacherLesson(ctx, token, lessonId)
    if (!l) return fail("Lesson not found.")
    if (value !== null && ![0, 1, 2, 3, 4].includes(value)) return fail("Use 1, 2, 3 or 4, or A for absent.")
    const s = await ctx.db.get(studentId)
    if (!s || s.classId !== l.classId) return fail("Student not found.")
    await upsert(ctx, l, s._id, value)
    return { ok: true }
  },
})

/** Gives every student without a rating in this lesson the same value (e.g. 3), to save typing. */
export const fillLesson = mutation({
  args: { token: v.string(), lessonId: v.id("lessons"), value: v.number() },
  returns: v.any(),
  handler: async (ctx, { token, lessonId, value }) => {
    const l = await teacherLesson(ctx, token, lessonId)
    if (!l) return fail("Lesson not found.")
    if (![0, 1, 2, 3, 4].includes(value)) return fail("Use 1, 2, 3 or 4, or A for absent.")
    const students = await ctx.db
      .query("students")
      .withIndex("by_class", (q) => q.eq("classId", l.classId))
      .collect()
    const rated = new Set(
      (
        await ctx.db
          .query("ratings")
          .withIndex("by_lesson", (q) => q.eq("lessonId", l._id))
          .collect()
      ).map((r) => r.studentId),
    )
    let filled = 0
    for (const s of students) {
      if (rated.has(s._id)) continue
      await ctx.db.insert("ratings", { lessonId: l._id, classId: l.classId, studentId: s._id, value, updatedAt: Date.now() })
      filled++
    }
    return { ok: true, filled }
  },
})
