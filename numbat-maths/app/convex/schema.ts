import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { authTables } from "@convex-dev/auth/server"

export default defineSchema({
  ...authTables,

  // Teachers sign in with email + password (custom sessions, see accounts.ts)
  teachers: defineTable({
    name: v.string(),
    email: v.string(),
    passHash: v.string(),
    createdAt: v.number(),
    failedAttempts: v.optional(v.number()),
    lockedUntil: v.optional(v.number()),
  }).index("by_email", ["email"]),

  // One row per signed-in device
  sessions: defineTable({
    token: v.string(),
    // "parent": a parent signed in with their child's class code, name and PIN (read-only)
    kind: v.union(v.literal("teacher"), v.literal("student"), v.literal("parent")),
    teacherId: v.optional(v.id("teachers")),
    studentId: v.optional(v.id("students")),
    expiresAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_student", ["studentId"]),

  classes: defineTable({
    teacherId: v.id("teachers"),
    name: v.string(),
    year: v.number(),
    code: v.string(),
    createdAt: v.number(),
    // practice sets or tests a week that count towards students' weekly goal (default 5)
    weeklyGoal: v.optional(v.number()),
  })
    .index("by_code", ["code"])
    .index("by_teacher", ["teacherId"]),

  // Students log in with their class code, their name and a 4-digit PIN
  students: defineTable({
    classId: v.id("classes"),
    name: v.string(),
    pinHash: v.optional(v.string()),
    failedAttempts: v.number(),
    lockedUntil: v.optional(v.number()),
    // how many times in a row the account has been paused for wrong PINs (each pause is longer)
    lockCount: v.optional(v.number()),
    points: v.number(),
    lastActive: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_class", ["classId"]),

  // Best result per student per item. itemId is a skill id, or "test:<topicId>" for a topic test.
  progress: defineTable({
    studentId: v.id("students"),
    classId: v.id("classes"),
    itemId: v.string(),
    best: v.number(),
    last: v.number(),
    attempts: v.number(),
    mastered: v.boolean(),
    updatedAt: v.number(),
  })
    .index("by_student", ["studentId"])
    .index("by_class", ["classId"])
    .index("by_student_item", ["studentId", "itemId"]),

  // Every finished practice set or test
  attempts: defineTable({
    studentId: v.id("students"),
    classId: v.id("classes"),
    itemId: v.string(),
    kind: v.union(v.literal("practice"), v.literal("test")),
    correct: v.number(),
    total: v.number(),
    score: v.number(),
    points: v.number(),
    finishedAt: v.number(),
  })
    .index("by_student", ["studentId"])
    .index("by_class", ["classId"]),

  // A lesson in the teacher's ratings sheet. date is the local calendar date, yyyy-mm-dd.
  lessons: defineTable({
    classId: v.id("classes"),
    date: v.string(),
    label: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_class", ["classId"]),

  // How a student went in a lesson: 4 excellent, 3 good, 2 below expectations, 1 well below, 0 absent
  ratings: defineTable({
    lessonId: v.id("lessons"),
    classId: v.id("classes"),
    studentId: v.id("students"),
    value: v.number(),
    updatedAt: v.number(),
  })
    .index("by_lesson", ["lessonId"])
    .index("by_class", ["classId"])
    .index("by_student", ["studentId"])
    .index("by_lesson_student", ["lessonId", "studentId"]),

  // Tasks a teacher sets for a class
  assignments: defineTable({
    classId: v.id("classes"),
    title: v.string(),
    items: v.array(v.string()),
    dueDate: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_class", ["classId"]),
})
