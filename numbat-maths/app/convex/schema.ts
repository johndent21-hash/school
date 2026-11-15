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
    // "parent": a parent account (parent code + the parent's own PIN), read-only. Sessions from the old parent
    // log-in (the child's class code, name and PIN) have a studentId and no parentId; they are no longer accepted.
    kind: v.union(v.literal("teacher"), v.literal("student"), v.literal("parent")),
    teacherId: v.optional(v.id("teachers")),
    studentId: v.optional(v.id("students")),
    parentId: v.optional(v.id("parents")),
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
    // practice sets or tests a week that count towards students’ weekly goal (default 3)
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
    // the code on the child's card that a parent uses to set up a parent account and to log in (8 characters)
    parentCode: v.optional(v.string()),
    // wrong parent PINs entered with this child's parent code: kept apart from the child's own PIN, so a parent's
    // mistakes never lock the child out
    parentFailed: v.optional(v.number()),
    parentLockedUntil: v.optional(v.number()),
    parentLockCount: v.optional(v.number()),
  })
    .index("by_class", ["classId"])
    .index("by_parent_code", ["parentCode"]),

  // A parent or carer account: their own 6-digit PIN, linked to one or more children (parentLinks). Read-only.
  parents: defineTable({
    pinHash: v.string(),
    createdAt: v.number(),
  }),

  parentLinks: defineTable({
    parentId: v.id("parents"),
    studentId: v.id("students"),
    createdAt: v.number(),
  })
    .index("by_parent", ["parentId"])
    .index("by_student", ["studentId"]),

  // An exit ticket: a few class-game questions answered on students' own devices at the end of a lesson.
  // The questions are rebuilt on each device from gameId + seed (+ calc); check is their fingerprint, so a ticket made
  // before a site update is not answered with different questions. qs keeps what marking and the teacher's summary
  // need, as plain text: the question kind ("ncm8-3.07:expand"), the right option and each option's mistake label.
  exitTickets: defineTable({
    classId: v.id("classes"),
    gameId: v.string(),
    title: v.string(),
    seed: v.number(),
    count: v.number(),
    calc: v.boolean(),
    check: v.string(),
    qs: v.array(
      v.object({
        kind: v.string(),
        correct: v.number(),
        mistakes: v.array(v.union(v.string(), v.null())),
      }),
    ),
    createdAt: v.number(),
    closedAt: v.optional(v.number()),
  }).index("by_class", ["classId"]),

  // One student's answers to an exit ticket: the option chosen for each question (0–3, or −1 if left out)
  exitAnswers: defineTable({
    ticketId: v.id("exitTickets"),
    classId: v.id("classes"),
    studentId: v.id("students"),
    choices: v.array(v.number()),
    correct: v.number(),
    finishedAt: v.number(),
  })
    .index("by_ticket", ["ticketId"])
    .index("by_student", ["studentId"])
    .index("by_ticket_student", ["ticketId", "studentId"]),

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
