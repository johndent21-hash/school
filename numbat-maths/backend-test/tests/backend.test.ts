import { convexTest } from 'convex-test'
import { expect, test, vi } from 'vitest'
import schema from '../convex/schema'
import { api, internal } from '../convex/_generated/api'

const modules = import.meta.glob('../convex/**/*.*s')

test('teacher accounts, classes, student PIN log-in, results, tasks and clean-up', async () => {
  vi.stubEnv('TEACHER_SIGNUP_CODE', 'STAFF-TEST1')
  const t = convexTest(schema, modules)

  // --- teacher sign-up rules
  expect((await t.mutation(api.accounts.teacherSignUp, { name: 'Ms Lee', email: 'lee@school.nsw.edu.au', password: 'longenough1' })).ok).toBe(false)
  expect((await t.mutation(api.accounts.teacherSignUp, { name: 'Ms Lee', email: 'lee@school.nsw.edu.au', password: 'longenough1', signupCode: 'WRONG' })).ok).toBe(false)
  expect((await t.mutation(api.accounts.teacherSignUp, { name: 'Ms Lee', email: 'lee@school.nsw.edu.au', password: 'short', signupCode: 'staff-test1' })).message).toMatch(/8 characters/)
  expect((await t.mutation(api.accounts.teacherSignUp, { name: 'Ms Lee', email: 'not-an-email', password: 'longenough1', signupCode: 'STAFF-TEST1' })).ok).toBe(false)
  const su = await t.mutation(api.accounts.teacherSignUp, { name: 'Ms Lee', email: ' Lee@School.nsw.edu.au ', password: 'longenough1', signupCode: 'staff-test1' })
  expect(su.ok).toBe(true)
  const dup = await t.mutation(api.accounts.teacherSignUp, { name: 'Other', email: 'lee@school.nsw.edu.au', password: 'longenough1', signupCode: 'STAFF-TEST1' })
  expect(dup.ok).toBe(false)
  const tToken: string = su.token
  expect(await t.query(api.accounts.me, { token: tToken })).toMatchObject({ kind: 'teacher', name: 'Ms Lee', email: 'lee@school.nsw.edu.au' })
  expect(await t.query(api.accounts.me, { token: 'nonsense' })).toBeNull()
  expect(await t.query(api.accounts.me, {})).toBeNull()

  // --- teacher log-in and lockout
  expect((await t.mutation(api.accounts.teacherLogIn, { email: 'lee@school.nsw.edu.au', password: 'wrongpass' })).ok).toBe(false)
  const li = await t.mutation(api.accounts.teacherLogIn, { email: 'LEE@school.nsw.edu.au', password: 'longenough1' })
  expect(li.ok).toBe(true)
  for (let i = 0; i < 8; i++) await t.mutation(api.accounts.teacherLogIn, { email: 'lee@school.nsw.edu.au', password: 'bad' + i })
  const locked = await t.mutation(api.accounts.teacherLogIn, { email: 'lee@school.nsw.edu.au', password: 'longenough1' })
  expect(locked.ok).toBe(false)
  expect(locked.message).toMatch(/Too many attempts/)
  await t.mutation(internal.admin.resetTeacherPassword, { email: 'lee@school.nsw.edu.au', newPassword: 'brandnew123' })
  expect((await t.mutation(api.accounts.teacherLogIn, { email: 'lee@school.nsw.edu.au', password: 'brandnew123' })).ok).toBe(true)

  // --- classes
  expect((await t.mutation(api.classes.createClass, { token: tToken, name: '7MAT2', year: 10 })).ok).toBe(false)
  const cc = await t.mutation(api.classes.createClass, { token: tToken, name: '  7MAT2 ', year: 7 })
  expect(cc.ok).toBe(true)
  expect(cc.code).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/)
  const classId = cc.classId
  const add = await t.mutation(api.classes.addStudents, { token: tToken, classId, names: ['Ava T', 'Liam N', '', '  ', 'ava t', 'Zara K'] })
  expect(add).toMatchObject({ ok: true, added: 3, skipped: ['ava t'] })
  const mine = await t.query(api.classes.myClasses, { token: tToken })
  expect(mine.classes).toHaveLength(1)
  expect(mine.classes[0]).toMatchObject({ name: '7MAT2', year: 7, studentCount: 3, activeThisWeek: 0 })

  // a second teacher cannot see or change the first teacher's class
  const other = await t.mutation(api.accounts.teacherSignUp, { name: 'Mr Ng', email: 'ng@school.nsw.edu.au', password: 'longenough2', signupCode: 'STAFF-TEST1' })
  expect((await t.query(api.classes.classReport, { token: other.token, classId })).ok).toBe(false)
  expect((await t.mutation(api.classes.addStudents, { token: other.token, classId, names: ['Hacker'] })).ok).toBe(false)

  // --- student log-in
  const lookup = await t.query(api.accounts.classLookup, { code: ` ${cc.code.toLowerCase().slice(0, 3)}-${cc.code.toLowerCase().slice(3)} ` })
  expect(lookup.ok).toBe(true)
  expect(lookup).toMatchObject({ className: '7MAT2', year: 7, teacherName: 'Ms Lee' })
  expect(lookup.students.map((s: any) => s.name)).toEqual(['Ava T', 'Liam N', 'Zara K'])
  expect((await t.query(api.accounts.classLookup, { code: 'ZZZZZZ' })).ok).toBe(false)
  expect((await t.query(api.accounts.classLookup, { code: 'ABC' })).ok).toBe(false)
  const ava = lookup.students[0]
  const liam = lookup.students[1]
  expect((await t.mutation(api.accounts.studentLogIn, { code: cc.code, studentId: ava.id, pin: '2580' })).needsPin).toBe(true)
  expect((await t.mutation(api.accounts.studentSetPin, { code: cc.code, studentId: ava.id, pin: '1234' })).ok).toBe(false)
  expect((await t.mutation(api.accounts.studentSetPin, { code: cc.code, studentId: ava.id, pin: '7777' })).ok).toBe(false)
  expect((await t.mutation(api.accounts.studentSetPin, { code: cc.code, studentId: ava.id, pin: '25a0' })).ok).toBe(false)
  expect((await t.mutation(api.accounts.studentSetPin, { code: 'ZZZZZZ', studentId: ava.id, pin: '2580' })).ok).toBe(false)
  const sp = await t.mutation(api.accounts.studentSetPin, { code: cc.code, studentId: ava.id, pin: '2580' })
  expect(sp.ok).toBe(true)
  expect((await t.mutation(api.accounts.studentSetPin, { code: cc.code, studentId: ava.id, pin: '9999' })).message).toMatch(/already have a PIN/)
  const sToken: string = sp.token
  expect(await t.query(api.accounts.me, { token: sToken })).toMatchObject({ kind: 'student', name: 'Ava T', className: '7MAT2', year: 7, points: 0 })

  // wrong PINs, then lockout
  const w1 = await t.mutation(api.accounts.studentLogIn, { code: cc.code, studentId: ava.id, pin: '0000' })
  expect(w1.message).toMatch(/4 tries left/)
  for (let i = 0; i < 3; i++) await t.mutation(api.accounts.studentLogIn, { code: cc.code, studentId: ava.id, pin: '0000' })
  const w5 = await t.mutation(api.accounts.studentLogIn, { code: cc.code, studentId: ava.id, pin: '0000' })
  expect(w5.message).toMatch(/paused for 10 minutes/)
  const lockedRight = await t.mutation(api.accounts.studentLogIn, { code: cc.code, studentId: ava.id, pin: '2580' })
  expect(lockedRight.ok).toBe(false)
  let rep = await t.query(api.classes.classReport, { token: tToken, classId })
  expect(rep.students.find((s: any) => s.name === 'Ava T')).toMatchObject({ hasPin: true, locked: true })

  // --- results
  expect((await t.mutation(api.learning.recordAttempt, { token: tToken, itemId: 'y7-int-addsub', kind: 'practice', correct: 5, total: 10 })).ok).toBe(false)
  expect((await t.mutation(api.learning.recordAttempt, { token: sToken, itemId: 'Bad Id!', kind: 'practice', correct: 5, total: 10 })).ok).toBe(false)
  expect((await t.mutation(api.learning.recordAttempt, { token: sToken, itemId: 'y7-int-addsub', kind: 'test', correct: 5, total: 10 })).ok).toBe(false)
  expect((await t.mutation(api.learning.recordAttempt, { token: sToken, itemId: 'y7-int-addsub', kind: 'practice', correct: 5, total: 0 })).ok).toBe(false)
  const r1 = await t.mutation(api.learning.recordAttempt, { token: sToken, itemId: 'y7-int-addsub', kind: 'practice', correct: 7.5, total: 10 })
  expect(r1).toMatchObject({ ok: true, score: 75, best: 75, points: 75, mastered: false, newBest: true })
  const r2 = await t.mutation(api.learning.recordAttempt, { token: sToken, itemId: 'y7-int-addsub', kind: 'practice', correct: 9, total: 10 })
  expect(r2).toMatchObject({ ok: true, score: 90, best: 90, points: 110, mastered: true, newBest: true })
  const r3 = await t.mutation(api.learning.recordAttempt, { token: sToken, itemId: 'y7-int-addsub', kind: 'practice', correct: 3, total: 10 })
  expect(r3).toMatchObject({ score: 30, best: 90, mastered: true, newBest: false })
  // inflated input is clamped
  const r4 = await t.mutation(api.learning.recordAttempt, { token: sToken, itemId: 'test:y7-integers', kind: 'test', correct: 99, total: 10 })
  expect(r4).toMatchObject({ ok: true, score: 100, points: 120 })
  const prog = await t.query(api.learning.myProgress, { token: sToken })
  expect(prog.points).toBe(75 + 110 + 30 + 120)
  expect(prog.items['y7-int-addsub']).toMatchObject({ best: 90, last: 30, attempts: 3, mastered: true })
  expect(prog.recent[0].itemId).toBe('test:y7-integers')
  expect((await t.query(api.learning.myProgress, { token: tToken })).ok).toBe(false)

  // history, weekly goal and class activity (for rewards and the teacher overview)
  expect(prog.log.map((a: any) => a.score)).toEqual([100, 30, 90, 75])
  expect(prog.goal).toBe(5)
  expect((await t.mutation(api.classes.updateClass, { token: tToken, classId, name: '7MAT2', year: 7, weeklyGoal: 0 })).ok).toBe(false)
  expect((await t.mutation(api.classes.updateClass, { token: tToken, classId, name: '7MAT2', year: 7, weeklyGoal: 2.5 })).ok).toBe(false)
  expect((await t.mutation(api.classes.updateClass, { token: tToken, classId, name: '7MAT2', year: 7, weeklyGoal: 3 })).ok).toBe(true)
  expect((await t.query(api.learning.myProgress, { token: sToken })).goal).toBe(3)
  expect((await t.mutation(api.classes.updateClass, { token: tToken, classId, name: '7MAT2', year: 7 })).ok).toBe(true)
  expect((await t.query(api.classes.classReport, { token: tToken, classId })).class.weeklyGoal).toBe(3)
  const act = await t.query(api.classes.classActivity, { token: tToken, classId })
  expect(act.ok).toBe(true)
  expect(act.goal).toBe(3)
  expect(act.attempts).toHaveLength(4)
  expect(act.attempts[0]).toMatchObject({ studentId: ava.id, itemId: 'test:y7-integers', kind: 'test', score: 100 })
  // 75% then 90% on y7-int-addsub: mastered at the 90% set (the second attempt)
  expect(act.masteries).toHaveLength(1)
  expect(act.masteries[0]).toMatchObject({ studentId: ava.id, itemId: 'y7-int-addsub', t: act.attempts[2].finishedAt })
  expect((await t.query(api.classes.classActivity, { token: other.token, classId })).ok).toBe(false)
  expect((await t.query(api.classes.classActivity, { token: sToken, classId })).ok).toBe(false)
  const detail = await t.query(api.classes.studentDetail, { token: tToken, studentId: ava.id })
  expect(detail.attempts).toHaveLength(4)
  expect(detail.class.weeklyGoal).toBe(3)

  // --- tasks
  expect((await t.mutation(api.learning.createTask, { token: tToken, classId, title: 'HW', items: ['BAD ID'] })).ok).toBe(false)
  const task = await t.mutation(api.learning.createTask, { token: tToken, classId, title: '  Integers   homework ', items: ['y7-int-addsub', 'test:y7-integers', 'y7-int-addsub'], dueDate: Date.now() + 86400000 })
  expect(task.ok).toBe(true)
  expect((await t.mutation(api.learning.createTask, { token: other.token, classId, title: 'x', items: ['y7-int-addsub'] })).ok).toBe(false)
  const tasks = await t.query(api.learning.myTasks, { token: sToken })
  expect(tasks.tasks).toHaveLength(1)
  expect(tasks.tasks[0]).toMatchObject({ title: 'Integers homework', items: ['y7-int-addsub', 'test:y7-integers'] })
  rep = await t.query(api.classes.classReport, { token: tToken, classId })
  expect(rep.assignments).toHaveLength(1)
  expect(rep.students.find((s: any) => s.name === 'Ava T').progress['y7-int-addsub'].best).toBe(90)
  const det = await t.query(api.classes.studentDetail, { token: tToken, studentId: ava.id })
  expect(det).toMatchObject({ ok: true, student: { name: 'Ava T', points: 335 } })
  expect(det.attempts).toHaveLength(4)
  expect((await t.query(api.classes.studentDetail, { token: other.token, studentId: ava.id })).ok).toBe(false)
  expect((await t.mutation(api.learning.deleteTask, { token: other.token, taskId: task.id })).ok).toBe(false)
  expect((await t.mutation(api.learning.deleteTask, { token: tToken, taskId: task.id })).ok).toBe(true)

  // --- teacher resets the PIN: lock cleared, PIN cleared, old sessions ended
  expect((await t.mutation(api.classes.resetPin, { token: other.token, studentId: ava.id })).ok).toBe(false)
  expect((await t.mutation(api.classes.resetPin, { token: tToken, studentId: ava.id })).ok).toBe(true)
  expect(await t.query(api.accounts.me, { token: sToken })).toBeNull()
  expect((await t.mutation(api.accounts.studentLogIn, { code: cc.code, studentId: ava.id, pin: '2580' })).needsPin).toBe(true)
  const sp2 = await t.mutation(api.accounts.studentSetPin, { code: cc.code, studentId: ava.id, pin: '3691' })
  expect(sp2.ok).toBe(true)
  const back = await t.mutation(api.accounts.studentLogIn, { code: cc.code, studentId: ava.id, pin: '3691' })
  expect(back.ok).toBe(true)

  // a student's token cannot use teacher functions
  expect((await t.query(api.classes.myClasses, { token: back.token })).ok).toBe(false)
  expect((await t.mutation(api.classes.resetPin, { token: back.token, studentId: liam.id })).ok).toBe(false)

  // --- rename, remove, update, delete
  expect((await t.mutation(api.classes.renameStudent, { token: tToken, studentId: liam.id, name: ' Liam  Nguyen ' })).ok).toBe(true)
  expect((await t.mutation(api.classes.updateClass, { token: tToken, classId, name: '7MAT3', year: 8 })).ok).toBe(true)
  rep = await t.query(api.classes.classReport, { token: tToken, classId })
  expect(rep.class).toMatchObject({ name: '7MAT3', year: 8 })
  expect(rep.students.map((s: any) => s.name)).toContain('Liam Nguyen')
  expect((await t.mutation(api.classes.removeStudent, { token: tToken, studentId: ava.id })).ok).toBe(true)
  expect(await t.query(api.accounts.me, { token: back.token })).toBeNull()
  const leftovers = await t.run(async (ctx: any) => ({
    progress: (await ctx.db.query('progress').collect()).length,
    attempts: (await ctx.db.query('attempts').collect()).length,
  }))
  expect(leftovers).toEqual({ progress: 0, attempts: 0 })

  // logging out ends the session
  await t.mutation(api.accounts.logOut, { token: li.token })
  expect(await t.query(api.accounts.me, { token: li.token })).toBeNull()

  // owner clean-up removes everything for a teacher
  const del = await t.mutation(internal.admin.deleteTeacherByEmail, { email: 'lee@school.nsw.edu.au' })
  expect(del).toMatchObject({ ok: true, classes: 1, students: 2 })
  const counts = await t.run(async (ctx: any) => ({
    teachers: (await ctx.db.query('teachers').collect()).length,
    classes: (await ctx.db.query('classes').collect()).length,
    students: (await ctx.db.query('students').collect()).length,
    sessions: (await ctx.db.query('sessions').collect()).filter((s: any) => s.kind === 'student').length,
  }))
  expect(counts).toEqual({ teachers: 1, classes: 0, students: 0, sessions: 0 })
  expect(await t.query(api.accounts.me, { token: tToken })).toBeNull()
})

test('expired sessions are not accepted', async () => {
  vi.stubEnv('TEACHER_SIGNUP_CODE', '')
  const t = convexTest(schema, modules)
  const su = await t.mutation(api.accounts.teacherSignUp, { name: 'Ms Ray', email: 'ray@x.au', password: 'longenough1' })
  expect(su.ok).toBe(true)
  await t.run(async (ctx: any) => {
    const s = await ctx.db.query('sessions').first()
    await ctx.db.patch(s._id, { expiresAt: Date.now() - 1000 })
  })
  expect(await t.query(api.accounts.me, { token: su.token })).toBeNull()
})
