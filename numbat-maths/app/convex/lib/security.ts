// Password/PIN hashing and session helpers shared by the Convex functions.
import type { QueryCtx, MutationCtx } from "../_generated/server"
import type { Doc, Id } from "../_generated/dataModel"

const enc = new TextEncoder()

function toHex(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let s = ""
  for (const b of bytes) s += b.toString(16).padStart(2, "0")
  return s
}

export function randomHex(bytes: number): string {
  const a = new Uint8Array(bytes)
  crypto.getRandomValues(a)
  return toHex(a)
}

async function pbkdf2(secret: string, salt: string, iterations: number): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), "PBKDF2", false, ["deriveBits"])
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: enc.encode(salt), iterations, hash: "SHA-256" }, key, 256)
  return toHex(bits)
}

async function sha256Iterated(secret: string, salt: string, rounds: number): Promise<string> {
  let data = enc.encode(salt + ":" + secret)
  for (let i = 0; i < rounds; i++) {
    data = new Uint8Array(await crypto.subtle.digest("SHA-256", data))
  }
  return toHex(data)
}

/** Returns "method$salt$hash". PBKDF2 when the runtime supports it, otherwise iterated SHA-256. */
export async function hashSecret(secret: string): Promise<string> {
  const salt = randomHex(16)
  try {
    return `pbkdf2-60000$${salt}$${await pbkdf2(secret, salt, 60000)}`
  } catch {
    return `sha256-2000$${salt}$${await sha256Iterated(secret, salt, 2000)}`
  }
}

export async function verifySecret(secret: string, stored: string | undefined): Promise<boolean> {
  if (!stored) return false
  const [method, salt, hash] = stored.split("$")
  let check = ""
  if (method === "pbkdf2-60000") check = await pbkdf2(secret, salt, 60000)
  else if (method === "sha256-2000") check = await sha256Iterated(secret, salt, 2000)
  else return false
  // constant-time compare
  if (check.length !== hash.length) return false
  let diff = 0
  for (let i = 0; i < check.length; i++) diff |= check.charCodeAt(i) ^ hash.charCodeAt(i)
  return diff === 0
}

export const DAY = 24 * 60 * 60 * 1000

export async function getSession(ctx: QueryCtx | MutationCtx, token: string | undefined): Promise<Doc<"sessions"> | null> {
  if (!token || token.length < 20) return null
  const s = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("token", token))
    .unique()
  if (!s || s.expiresAt < Date.now()) return null
  return s
}

export async function getTeacher(ctx: QueryCtx | MutationCtx, token: string | undefined): Promise<Doc<"teachers"> | null> {
  const s = await getSession(ctx, token)
  if (!s || s.kind !== "teacher" || !s.teacherId) return null
  return await ctx.db.get(s.teacherId)
}

export async function getStudent(ctx: QueryCtx | MutationCtx, token: string | undefined): Promise<Doc<"students"> | null> {
  const s = await getSession(ctx, token)
  if (!s || s.kind !== "student" || !s.studentId) return null
  return await ctx.db.get(s.studentId)
}

/** The child a parent is signed in for (parents sign in with their child's class code, name and PIN). */
export async function getParentChild(ctx: QueryCtx | MutationCtx, token: string | undefined): Promise<Doc<"students"> | null> {
  const s = await getSession(ctx, token)
  if (!s || s.kind !== "parent" || !s.studentId) return null
  return await ctx.db.get(s.studentId)
}

/** Removes a student's lesson ratings (used when a student, lesson or class is deleted). */
export async function deleteRatingsFor(ctx: MutationCtx, by: { studentId: Id<"students"> } | { lessonId: Id<"lessons"> }) {
  const rows =
    "studentId" in by
      ? await ctx.db
          .query("ratings")
          .withIndex("by_student", (q) => q.eq("studentId", by.studentId))
          .collect()
      : await ctx.db
          .query("ratings")
          .withIndex("by_lesson", (q) => q.eq("lessonId", by.lessonId))
          .collect()
  for (const r of rows) await ctx.db.delete(r._id)
}

/** The class, if it belongs to this teacher. */
export async function ownedClass(ctx: QueryCtx | MutationCtx, teacherId: Id<"teachers">, classId: Id<"classes">): Promise<Doc<"classes"> | null> {
  const c = await ctx.db.get(classId)
  if (!c || c.teacherId !== teacherId) return null
  return c
}

export async function createSession(
  ctx: MutationCtx,
  data: { kind: "teacher"; teacherId: Id<"teachers"> } | { kind: "student" | "parent"; studentId: Id<"students"> },
  days: number,
): Promise<string> {
  const token = randomHex(32)
  await ctx.db.insert("sessions", { token, ...data, expiresAt: Date.now() + days * DAY })
  return token
}

const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"

export async function newClassCode(ctx: MutationCtx): Promise<string> {
  for (let tries = 0; tries < 50; tries++) {
    const a = new Uint8Array(6)
    crypto.getRandomValues(a)
    let code = ""
    for (const b of a) code += CODE_CHARS[b % CODE_CHARS.length]
    const existing = await ctx.db
      .query("classes")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first()
    if (!existing) return code
  }
  throw new Error("Could not create a unique class code")
}

export function cleanName(s: string): string {
  return s.replace(/\s+/g, " ").trim().slice(0, 60)
}
