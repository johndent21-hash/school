// Sign-up, log-in and "who am I" for teachers, students and parents.
import { mutation, query } from "./_generated/server"
import { v } from "convex/values"
import { cleanName, createSession, getSession, hashSecret, verifySecret } from "./lib/security"

const MINUTE = 60 * 1000
const fail = (message: string) => ({ ok: false as const, message })

export const me = query({
  args: { token: v.optional(v.string()) },
  returns: v.any(),
  handler: async (ctx, { token }) => {
    const s = await getSession(ctx, token)
    if (!s) return null
    if (s.kind === "teacher" && s.teacherId) {
      const t = await ctx.db.get(s.teacherId)
      if (!t) return null
      return { kind: "teacher", teacherId: t._id, name: t.name, email: t.email }
    }
    if (s.kind === "student" && s.studentId) {
      const st = await ctx.db.get(s.studentId)
      if (!st) return null
      const c = await ctx.db.get(st.classId)
      if (!c) return null
      return { kind: "student", studentId: st._id, name: st.name, classId: c._id, className: c.name, year: c.year, points: st.points }
    }
    if (s.kind === "parent" && s.studentId) {
      const st = await ctx.db.get(s.studentId)
      if (!st) return null
      const c = await ctx.db.get(st.classId)
      if (!c) return null
      return { kind: "parent", studentId: st._id, childName: st.name, classId: c._id, className: c.name, year: c.year }
    }
    return null
  },
})

export const teacherSignUp = mutation({
  args: { name: v.string(), email: v.string(), password: v.string(), signupCode: v.optional(v.string()) },
  returns: v.any(),
  handler: async (ctx, args) => {
    const name = cleanName(args.name)
    const email = args.email.trim().toLowerCase()
    const required = process.env.TEACHER_SIGNUP_CODE
    if (required && (args.signupCode ?? "").trim().toUpperCase() !== required.trim().toUpperCase()) {
      return fail("That staff access code is not right. Ask the site owner for the code.")
    }
    if (name.length < 2) return fail("Please enter your name.")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Please enter a valid email address.")
    if (args.password.length < 8) return fail("Use a password of at least 8 characters.")
    const existing = await ctx.db
      .query("teachers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first()
    if (existing) return fail("There is already an account with that email. Try logging in.")
    const passHash = await hashSecret(args.password)
    const teacherId = await ctx.db.insert("teachers", { name, email, passHash, createdAt: Date.now() })
    const token = await createSession(ctx, { kind: "teacher", teacherId }, 30)
    return { ok: true, token }
  },
})

export const teacherLogIn = mutation({
  args: { email: v.string(), password: v.string() },
  returns: v.any(),
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase()
    const t = await ctx.db
      .query("teachers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first()
    if (!t) return fail("Email or password is not right.")
    if (t.lockedUntil && t.lockedUntil > Date.now()) {
      return fail(`Too many attempts. Try again in ${Math.ceil((t.lockedUntil - Date.now()) / MINUTE)} minutes.`)
    }
    if (!(await verifySecret(args.password, t.passHash))) {
      const n = (t.failedAttempts ?? 0) + 1
      await ctx.db.patch(t._id, n >= 8 ? { failedAttempts: 0, lockedUntil: Date.now() + 15 * MINUTE } : { failedAttempts: n })
      return fail("Email or password is not right.")
    }
    await ctx.db.patch(t._id, { failedAttempts: 0, lockedUntil: undefined })
    const token = await createSession(ctx, { kind: "teacher", teacherId: t._id }, 30)
    return { ok: true, token }
  },
})

export const logOut = mutation({
  args: { token: v.string() },
  returns: v.null(),
  handler: async (ctx, { token }) => {
    const s = await getSession(ctx, token)
    if (s) await ctx.db.delete(s._id)
    return null
  },
})

/** Step 1 of student log-in: the class code shows the class name and its students. */
export const classLookup = query({
  args: { code: v.string() },
  returns: v.any(),
  handler: async (ctx, { code }) => {
    const clean = code.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()
    if (clean.length !== 6) return fail("Class codes have 6 letters and numbers.")
    const c = await ctx.db
      .query("classes")
      .withIndex("by_code", (q) => q.eq("code", clean))
      .first()
    if (!c) return fail("We couldn’t find a class with that code. Check it with your teacher.")
    const teacher = await ctx.db.get(c.teacherId)
    const students = await ctx.db
      .query("students")
      .withIndex("by_class", (q) => q.eq("classId", c._id))
      .collect()
    return {
      ok: true,
      code: c.code,
      className: c.name,
      year: c.year,
      teacherName: teacher?.name ?? "",
      students: students
        .map((s) => ({ id: s._id, name: s.name, hasPin: !!s.pinHash }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    }
  },
})

async function studentInClass(ctx: any, code: string, studentId: any) {
  const clean = code.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()
  const c = await ctx.db
    .query("classes")
    .withIndex("by_code", (q: any) => q.eq("code", clean))
    .first()
  if (!c) return null
  const s = await ctx.db.get(studentId)
  if (!s || s.classId !== c._id) return null
  return s
}

// Each pause for wrong PINs is twice as long as the last (10 minutes, 20, 40 ... up to a day),
// so a 4-digit PIN cannot be found by trying them all.
const lockMinutes = (lockCount: number) => Math.min(24 * 60, 10 * 2 ** lockCount)

/** Checks a PIN for a student or for their parent, who uses the same class code, name and PIN. */
async function checkPin(ctx: any, code: string, studentId: any, pin: string, as: "student" | "parent") {
  const s = await studentInClass(ctx, code, studentId)
  if (!s) return fail("Something went wrong. Start again with the class code.")
  if (!s.pinHash) {
    return as === "student"
      ? { ok: false, needsPin: true, message: "Choose a PIN first." }
      : fail("Your child hasn’t chosen a PIN yet. They choose one the first time they log in. Ask them, or their teacher.")
  }
  const reset = as === "student" ? "ask your teacher to reset your PIN" : "ask the teacher to reset the PIN"
  if (s.lockedUntil && s.lockedUntil > Date.now()) {
    return fail(`Too many wrong PINs. Try again in ${Math.ceil((s.lockedUntil - Date.now()) / MINUTE)} minutes, or ${reset}.`)
  }
  if (!/^\d{4}$/.test(pin) || !(await verifySecret(pin, s.pinHash))) {
    const n = s.failedAttempts + 1
    if (n >= 5) {
      const lockCount = s.lockCount ?? 0
      const mins = lockMinutes(lockCount)
      await ctx.db.patch(s._id, { failedAttempts: 0, lockedUntil: Date.now() + mins * MINUTE, lockCount: lockCount + 1 })
      const h = Math.floor(mins / 60)
      const m = mins % 60
      const wait = [h ? `${h} ${h === 1 ? "hour" : "hours"}` : "", m ? `${m} minutes` : ""].filter(Boolean).join(" ")
      return fail(`That PIN is not right. The account is paused for ${wait}. The teacher can reset the PIN.`)
    }
    await ctx.db.patch(s._id, { failedAttempts: n })
    return fail(`That PIN is not right. ${5 - n} ${5 - n === 1 ? "try" : "tries"} left.`)
  }
  await ctx.db.patch(s._id, { failedAttempts: 0, lockedUntil: undefined, lockCount: 0, ...(as === "student" ? { lastActive: Date.now() } : {}) })
  const token = await createSession(ctx, { kind: as, studentId: s._id }, 60)
  return { ok: true, token }
}

export const studentLogIn = mutation({
  args: { code: v.string(), studentId: v.id("students"), pin: v.string() },
  returns: v.any(),
  handler: async (ctx, { code, studentId, pin }) => checkPin(ctx, code, studentId, pin, "student"),
})

/** Parents log in with their child's class code, name and PIN, and get a read-only parent view. */
export const parentLogIn = mutation({
  args: { code: v.string(), studentId: v.id("students"), pin: v.string() },
  returns: v.any(),
  handler: async (ctx, { code, studentId, pin }) => checkPin(ctx, code, studentId, pin, "parent"),
})

/** First log-in: the student chooses a 4-digit PIN. Only works while no PIN is set. */
export const studentSetPin = mutation({
  args: { code: v.string(), studentId: v.id("students"), pin: v.string() },
  returns: v.any(),
  handler: async (ctx, { code, studentId, pin }) => {
    const s = await studentInClass(ctx, code, studentId)
    if (!s) return fail("Something went wrong. Start again with your class code.")
    if (s.pinHash) return fail("You already have a PIN. Enter it to log in.")
    if (!/^\d{4}$/.test(pin)) return fail("Your PIN must be exactly 4 digits.")
    if (/^(\d)\1{3}$/.test(pin) || pin === "1234") return fail("That PIN is too easy to guess. Choose another one.")
    await ctx.db.patch(s._id, { pinHash: await hashSecret(pin), failedAttempts: 0, lockedUntil: undefined, lockCount: 0, lastActive: Date.now() })
    const token = await createSession(ctx, { kind: "student", studentId: s._id }, 60)
    return { ok: true, token }
  },
})
