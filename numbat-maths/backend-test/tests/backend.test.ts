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
  expect(prog.goal).toBe(3)
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

test('parent accounts (parent code + own PIN), and lesson ratings', async () => {
  vi.stubEnv('TEACHER_SIGNUP_CODE', '')
  const t = convexTest(schema, modules)
  const tok: string = (await t.mutation(api.accounts.teacherSignUp, { name: 'Ms Lee', email: 'lee@x.au', password: 'longenough1' })).token
  const other: string = (await t.mutation(api.accounts.teacherSignUp, { name: 'Mr Ng', email: 'ng@x.au', password: 'longenough2' })).token
  const cc = await t.mutation(api.classes.createClass, { token: tok, name: '8MAT1', year: 8 })
  const classId = cc.classId
  await t.mutation(api.classes.addStudents, { token: tok, classId, names: ['Ava T', 'Ben K', 'Cara M'] })
  const [ava, ben, cara] = (await t.query(api.accounts.classLookup, { code: cc.code })).students

  const sToken: string = (await t.mutation(api.accounts.studentSetPin, { code: cc.code, studentId: ava.id, pin: '2580' })).token

  // the old parent log-in (the child's class code, name and PIN) is switched off, and its sessions are not accepted
  await expect(t.mutation(api.accounts.parentLogIn, { code: cc.code, studentId: ava.id, pin: '2580' })).rejects.toThrow()
  const oldTok = 'f'.repeat(64)
  await t.run(async (ctx: any) => ctx.db.insert('sessions', { token: oldTok, kind: 'parent', studentId: ava.id, expiresAt: Date.now() + 1e9 }))
  expect(await t.query(api.accounts.me, { token: oldTok })).toBeNull()
  expect((await t.query(api.parents.parentOverview, { token: oldTok })).ok).toBe(false)

  // every student has a parent code (8 characters), different from the class code
  let rep = await t.query(api.classes.classReport, { token: tok, classId })
  const codeOf = (name: string) => rep.students.find((s: any) => s.name === name).parentCode as string
  for (const s of rep.students) expect(s.parentCode).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}$/)
  expect(new Set(rep.students.map((s: any) => s.parentCode)).size).toBe(3)
  const [avaCode, benCode, caraCode] = [codeOf('Ava T'), codeOf('Ben K'), codeOf('Cara M')]
  // a student added before parent codes gets one when the teacher opens the cards
  await t.run(async (ctx: any) => ctx.db.patch(cara.id, { parentCode: undefined }))
  expect(await t.mutation(api.classes.ensureParentCodes, { token: tok, classId })).toMatchObject({ ok: true, made: 1 })
  expect(await t.mutation(api.classes.ensureParentCodes, { token: tok, classId })).toMatchObject({ ok: true, made: 0 })
  expect((await t.mutation(api.classes.ensureParentCodes, { token: other, classId })).ok).toBe(false)
  rep = await t.query(api.classes.classReport, { token: tok, classId })
  expect(codeOf('Cara M')).not.toBe(caraCode)

  // setting up: the code shows whose card it is
  const dashed = (c: string) => ` ${c.slice(0, 4).toLowerCase()}-${c.slice(4)} `
  expect(await t.query(api.parents.parentCodeLookup, { code: dashed(avaCode) })).toMatchObject({ ok: true, childName: 'Ava T', className: '8MAT1', accounts: 0 })
  expect((await t.query(api.parents.parentCodeLookup, { code: 'ABCD' })).ok).toBe(false)
  expect((await t.query(api.parents.parentCodeLookup, { code: 'ZZZZZZZZ' })).ok).toBe(false)
  expect((await t.query(api.parents.parentCodeLookup, { code: cc.code })).ok).toBe(false)
  for (const pin of ['111111', '123456', '987654', '12345', '1234567', '12a456'])
    expect((await t.mutation(api.parents.parentSignUp, { code: avaCode, pin })).ok).toBe(false)
  expect((await t.mutation(api.parents.parentSignUp, { code: 'ZZZZZZZZ', pin: '482913' })).ok).toBe(false)
  const ps = await t.mutation(api.parents.parentSignUp, { code: dashed(avaCode), pin: '482913' })
  expect(ps.ok).toBe(true)
  const pTok: string = ps.token
  const me1 = await t.query(api.accounts.me, { token: pTok })
  expect(me1).toMatchObject({ kind: 'parent', children: [{ id: ava.id, name: 'Ava T', className: '8MAT1', year: 8 }] })
  // the child's own log-in still works alongside, and is a student session, not a parent one
  expect(await t.query(api.accounts.me, { token: sToken })).toMatchObject({ kind: 'student', name: 'Ava T' })
  // a parent code can't log a parent in as the child, and the child's PIN can't open the parent account
  expect((await t.mutation(api.parents.parentLogIn, { code: avaCode, pin: '2580' })).ok).toBe(false)
  await t.run(async (ctx: any) => ctx.db.patch(ava.id, { parentFailed: 0 }))
  // a second household: another account for the same child, which must use a different PIN
  expect((await t.mutation(api.parents.parentSignUp, { code: avaCode, pin: '482913' })).message).toMatch(/different PIN/)
  const ps2 = await t.mutation(api.parents.parentSignUp, { code: avaCode, pin: '730194' })
  expect(ps2.ok).toBe(true)
  const me2 = await t.query(api.accounts.me, { token: ps2.token })
  expect(me2.parentId).not.toBe(me1.parentId)
  // log in on another device: the code and PIN find the right account
  const li1 = await t.mutation(api.parents.parentLogIn, { code: avaCode, pin: '482913' })
  expect((await t.query(api.accounts.me, { token: li1.token })).parentId).toBe(me1.parentId)
  const li2 = await t.mutation(api.parents.parentLogIn, { code: avaCode, pin: '730194' })
  expect((await t.query(api.accounts.me, { token: li2.token })).parentId).toBe(me2.parentId)
  expect((await t.mutation(api.parents.parentLogIn, { code: benCode, pin: '482913' })).message).toMatch(/First time/)
  // brothers and sisters: Ben added to the first account with his code; then that account logs in with Ben's code too
  expect((await t.mutation(api.parents.parentAddChild, { token: sToken, code: benCode })).ok).toBe(false)
  expect((await t.mutation(api.parents.parentAddChild, { token: pTok, code: 'ZZZZZZZZ' })).ok).toBe(false)
  expect(await t.mutation(api.parents.parentAddChild, { token: pTok, code: benCode })).toMatchObject({ ok: true, studentId: ben.id })
  expect(await t.mutation(api.parents.parentAddChild, { token: pTok, code: benCode })).toMatchObject({ ok: true, already: true })
  expect((await t.query(api.accounts.me, { token: pTok })).children.map((c: any) => c.name)).toEqual(['Ava T', 'Ben K'])
  expect((await t.query(api.accounts.me, { token: ps2.token })).children.map((c: any) => c.name)).toEqual(['Ava T'])
  const viaBen = await t.mutation(api.parents.parentLogIn, { code: benCode, pin: '482913' })
  expect((await t.query(api.accounts.me, { token: viaBen.token })).parentId).toBe(me1.parentId)
  expect((await t.query(api.parents.parentOverview, { token: pTok, studentId: ben.id })).child.name).toBe('Ben K')
  // a child not linked to the account is never shown, even if asked for by id
  expect((await t.query(api.parents.parentOverview, { token: ps2.token, studentId: ben.id })).child.name).toBe('Ava T')
  expect((await t.query(api.parents.parentOverview, { token: pTok, studentId: cara.id })).child.name).toBe('Ava T')
  // the teacher sees how many parent accounts each child has
  rep = await t.query(api.classes.classReport, { token: tok, classId })
  expect(rep.students.map((s: any) => s.parentAccounts)).toEqual([2, 1, 0])

  // the parent view is read-only and limited to the child
  expect((await t.mutation(api.learning.recordAttempt, { token: pTok, itemId: 'y8-pyt-hyp', kind: 'practice', correct: 8, total: 10 })).ok).toBe(false)
  expect((await t.query(api.learning.myProgress, { token: pTok })).ok).toBe(false)
  expect((await t.query(api.ratings.classRatings, { token: pTok, classId })).ok).toBe(false)
  expect((await t.query(api.classes.classReport, { token: pTok, classId })).ok).toBe(false)
  expect((await t.query(api.parents.parentOverview, { token: sToken })).ok).toBe(false)
  expect((await t.query(api.parents.parentOverview, { token: tok })).ok).toBe(false)
  await t.mutation(api.learning.recordAttempt, { token: sToken, itemId: 'y8-pyt-hyp', kind: 'practice', correct: 8, total: 10 })
  await t.mutation(api.classes.updateClass, { token: tok, classId, name: '8MAT1', year: 8, weeklyGoal: 4 })
  let po = await t.query(api.parents.parentOverview, { token: pTok })
  expect(po).toMatchObject({ ok: true, child: { name: 'Ava T', points: 100 }, class: { name: '8MAT1', year: 8, teacherName: 'Ms Lee', weeklyGoal: 4 } })
  expect(po.items['y8-pyt-hyp']).toMatchObject({ best: 80, mastered: true })
  expect(po.log).toHaveLength(1)
  expect(po.lessons).toEqual([])

  // --- lessons and ratings
  expect((await t.mutation(api.ratings.addLesson, { token: tok, classId, date: '2026-02-30' })).ok).toBe(false)
  expect((await t.mutation(api.ratings.addLesson, { token: tok, classId, date: '27/10/2026' })).ok).toBe(false)
  expect((await t.mutation(api.ratings.addLesson, { token: other, classId, date: '2026-10-27' })).ok).toBe(false)
  const l1 = (await t.mutation(api.ratings.addLesson, { token: tok, classId, date: '2026-10-27', label: '  Period   2 ' })).id
  const l2 = (await t.mutation(api.ratings.addLesson, { token: tok, classId, date: '2026-10-28' })).id
  const l0 = (await t.mutation(api.ratings.addLesson, { token: tok, classId, date: '2026-10-20' })).id
  expect((await t.mutation(api.ratings.setRating, { token: tok, lessonId: l1, studentId: ava.id, value: 4 })).ok).toBe(true)
  expect((await t.mutation(api.ratings.setRating, { token: tok, lessonId: l1, studentId: ava.id, value: 3 })).ok).toBe(true) // changed
  expect((await t.mutation(api.ratings.setRating, { token: tok, lessonId: l1, studentId: ava.id, value: 5 })).ok).toBe(false)
  expect((await t.mutation(api.ratings.setRating, { token: tok, lessonId: l1, studentId: ava.id, value: 2.5 })).ok).toBe(false)
  expect((await t.mutation(api.ratings.setRating, { token: other, lessonId: l1, studentId: ava.id, value: 1 })).ok).toBe(false)
  expect((await t.mutation(api.ratings.setRating, { token: pTok, lessonId: l1, studentId: ava.id, value: 4 })).ok).toBe(false)
  await t.mutation(api.ratings.setRating, { token: tok, lessonId: l1, studentId: ben.id, value: 2 })
  // a student from another class can't be rated in this lesson
  const cc2 = await t.mutation(api.classes.createClass, { token: tok, name: '8MAT2', year: 8 })
  await t.mutation(api.classes.addStudents, { token: tok, classId: cc2.classId, names: ['Dan P'] })
  const dan = (await t.query(api.accounts.classLookup, { code: cc2.code })).students[0]
  expect((await t.mutation(api.ratings.setRating, { token: tok, lessonId: l1, studentId: dan.id, value: 3 })).ok).toBe(false)
  // fill the blanks: only Cara has no rating in lesson 1
  expect(await t.mutation(api.ratings.fillLesson, { token: tok, lessonId: l1, value: 3 })).toMatchObject({ ok: true, filled: 1 })
  await t.mutation(api.ratings.setRating, { token: tok, lessonId: l2, studentId: ava.id, value: 0 }) // absent
  await t.mutation(api.ratings.setRating, { token: tok, lessonId: l1, studentId: ben.id, value: null }) // cleared
  let cr = await t.query(api.ratings.classRatings, { token: tok, classId })
  expect(cr.lessons.map((l: any) => [l.date, l.label])).toEqual([['2026-10-20', null], ['2026-10-27', 'Period 2'], ['2026-10-28', null]])
  expect(cr.ratings).toHaveLength(3)
  expect((await t.query(api.ratings.classRatings, { token: other, classId })).ok).toBe(false)
  po = await t.query(api.parents.parentOverview, { token: pTok })
  expect(po.lessons.map((l: any) => [l.date, l.label, l.value])).toEqual([['2026-10-20', null, null], ['2026-10-27', 'Period 2', 3], ['2026-10-28', null, 0]])
  expect((await t.query(api.classes.studentDetail, { token: tok, studentId: ava.id })).lessons.map((l: any) => l.value)).toEqual([null, 3, 0])
  expect((await t.mutation(api.ratings.updateLesson, { token: tok, lessonId: l2, date: '2026-10-29', label: 'Excursion' })).ok).toBe(true)
  expect((await t.mutation(api.ratings.deleteLesson, { token: other, lessonId: l0 })).ok).toBe(false)
  expect((await t.mutation(api.ratings.deleteLesson, { token: tok, lessonId: l2 })).ok).toBe(true)
  cr = await t.query(api.ratings.classRatings, { token: tok, classId })
  expect(cr.lessons.map((l: any) => l.date)).toEqual(['2026-10-20', '2026-10-27'])
  expect(cr.ratings).toHaveLength(2)

  // --- wrong parent PINs pause parent log-ins with that code (10, 20 ... minutes), but never the child's own log-in
  for (let i = 0; i < 4; i++) await t.mutation(api.parents.parentLogIn, { code: avaCode, pin: '999999' })
  expect((await t.mutation(api.parents.parentLogIn, { code: avaCode, pin: '999999' })).message).toMatch(/paused for 10 minutes/)
  expect((await t.mutation(api.parents.parentLogIn, { code: avaCode, pin: '482913' })).message).toMatch(/Too many wrong PINs/)
  expect((await t.mutation(api.accounts.studentLogIn, { code: cc.code, studentId: ava.id, pin: '2580' })).ok).toBe(true)
  const unlockParent = () => t.run(async (ctx: any) => ctx.db.patch(ava.id, { parentLockedUntil: Date.now() - 1 }))
  await unlockParent()
  for (let i = 0; i < 4; i++) await t.mutation(api.parents.parentLogIn, { code: avaCode, pin: '999999' })
  expect((await t.mutation(api.parents.parentLogIn, { code: avaCode, pin: '999999' })).message).toMatch(/paused for 20 minutes/)
  await unlockParent()
  expect((await t.mutation(api.parents.parentLogIn, { code: avaCode, pin: '482913' })).ok).toBe(true)
  expect(await t.run(async (ctx: any) => (await ctx.db.get(ava.id)).parentLockCount)).toBe(0)

  // --- wrong student PINs pause the student's account for longer each time (10, 20, 40 minutes ...)
  for (let i = 0; i < 4; i++) await t.mutation(api.accounts.studentLogIn, { code: cc.code, studentId: ava.id, pin: '1111' })
  expect((await t.mutation(api.accounts.studentLogIn, { code: cc.code, studentId: ava.id, pin: '1111' })).message).toMatch(/paused for 10 minutes/)
  const unlock = () => t.run(async (ctx: any) => ctx.db.patch(ava.id, { lockedUntil: Date.now() - 1 }))
  await unlock()
  for (let i = 0; i < 4; i++) await t.mutation(api.accounts.studentLogIn, { code: cc.code, studentId: ava.id, pin: '1111' })
  expect((await t.mutation(api.accounts.studentLogIn, { code: cc.code, studentId: ava.id, pin: '1111' })).message).toMatch(/paused for 20 minutes/)
  await unlock()
  for (let i = 0; i < 5; i++) await t.mutation(api.accounts.studentLogIn, { code: cc.code, studentId: ava.id, pin: '1111' })
  await unlock()
  for (let i = 0; i < 4; i++) await t.mutation(api.accounts.studentLogIn, { code: cc.code, studentId: ava.id, pin: '1111' })
  expect((await t.mutation(api.accounts.studentLogIn, { code: cc.code, studentId: ava.id, pin: '1111' })).message).toMatch(/paused for 1 hour 20 minutes\./)
  await unlock()
  expect((await t.mutation(api.accounts.studentLogIn, { code: cc.code, studentId: ava.id, pin: '2580' })).ok).toBe(true)
  expect(await t.run(async (ctx: any) => (await ctx.db.get(ava.id)).lockCount)).toBe(0)

  // the teacher resetting the child's PIN does not touch the parent accounts
  await t.mutation(api.classes.resetPin, { token: tok, studentId: ava.id })
  expect(await t.query(api.accounts.me, { token: pTok })).toMatchObject({ kind: 'parent' })
  // a new parent code (lost card): the old code stops working and the child is unlinked from every parent account
  expect((await t.mutation(api.classes.newStudentParentCode, { token: other, studentId: ava.id })).ok).toBe(false)
  expect((await t.mutation(api.classes.newStudentParentCode, { token: pTok, studentId: ava.id })).ok).toBe(false)
  const fresh = await t.mutation(api.classes.newStudentParentCode, { token: tok, studentId: ava.id })
  expect(fresh.code).toMatch(/^[A-Z2-9]{8}$/)
  expect(fresh.code).not.toBe(avaCode)
  expect((await t.query(api.parents.parentCodeLookup, { code: avaCode })).ok).toBe(false)
  expect((await t.mutation(api.parents.parentLogIn, { code: avaCode, pin: '482913' })).ok).toBe(false)
  expect((await t.query(api.accounts.me, { token: pTok })).children.map((c: any) => c.name)).toEqual(['Ben K'])
  expect(await t.query(api.parents.parentOverview, { token: ps2.token })).toMatchObject({ ok: false, noChildren: true })
  expect(await t.query(api.parents.parentCodeLookup, { code: fresh.code })).toMatchObject({ ok: true, childName: 'Ava T', accounts: 0 })
  // taking a child off the account
  await t.mutation(api.parents.parentRemoveChild, { token: pTok, studentId: ben.id })
  expect((await t.query(api.accounts.me, { token: pTok })).children).toEqual([])
  await t.mutation(api.parents.parentAddChild, { token: pTok, code: benCode })

  // removing a student removes their ratings; deleting the class removes its lessons
  await t.mutation(api.classes.removeStudent, { token: tok, studentId: cara.id })
  expect(await t.run(async (ctx: any) => (await ctx.db.query('ratings').collect()).length)).toBe(1)
  // removing a student unlinks them from parent accounts
  await t.mutation(api.classes.removeStudent, { token: tok, studentId: ben.id })
  expect((await t.query(api.accounts.me, { token: pTok })).children).toEqual([])
  expect(await t.run(async (ctx: any) => (await ctx.db.query('parentLinks').collect()).length)).toBe(0)
  await t.mutation(api.classes.deleteClass, { token: tok, classId })
  expect(await t.run(async (ctx: any) => [(await ctx.db.query('lessons').collect()).length, (await ctx.db.query('ratings').collect()).length])).toEqual([0, 0])
})

test('exit tickets: started by the teacher, answered once by each student, marked on the server', async () => {
  vi.stubEnv('TEACHER_SIGNUP_CODE', '')
  const t = convexTest(schema, modules)
  const tok: string = (await t.mutation(api.accounts.teacherSignUp, { name: 'Ms Lee', email: 'lee@x.au', password: 'longenough1' })).token
  const other: string = (await t.mutation(api.accounts.teacherSignUp, { name: 'Mr Ng', email: 'ng@x.au', password: 'longenough2' })).token
  const cc = await t.mutation(api.classes.createClass, { token: tok, name: '8MAT1', year: 8 })
  const classId = cc.classId
  await t.mutation(api.classes.addStudents, { token: tok, classId, names: ['Ava T', 'Ben K'] })
  const [ava, ben] = (await t.query(api.accounts.classLookup, { code: cc.code })).students
  const aTok: string = (await t.mutation(api.accounts.studentSetPin, { code: cc.code, studentId: ava.id, pin: '2580' })).token
  const bTok: string = (await t.mutation(api.accounts.studentSetPin, { code: cc.code, studentId: ben.id, pin: '3691' })).token
  const cc2 = await t.mutation(api.classes.createClass, { token: tok, name: '8MAT2', year: 8 })
  await t.mutation(api.classes.addStudents, { token: tok, classId: cc2.classId, names: ['Dan P'] })
  const dan = (await t.query(api.accounts.classLookup, { code: cc2.code })).students[0]
  const dTok: string = (await t.mutation(api.accounts.studentSetPin, { code: cc2.code, studentId: dan.id, pin: '1470' })).token

  const q = (correct: number, label: string | null = null) => ({ kind: 'ncm8-3.07:expand', correct, mistakes: [0, 1, 2, 3].map((i) => (i === correct ? null : i === (correct + 1) % 4 ? label : null)) })
  const good = { token: tok, classId, gameId: 'ncm8-3.07', title: 'NCM 8 Ex 3.07 · Expanding expressions', seed: 12345, calc: false, check: '5:k3j9a', qs: [q(0, 'multiplied only the first term'), q(1), q(2), q(3), q(0)] }
  // checks on what the teacher sends
  expect((await t.mutation(api.exits.createExitTicket, { ...good, token: other })).ok).toBe(false)
  expect((await t.mutation(api.exits.createExitTicket, { ...good, token: aTok })).ok).toBe(false)
  expect((await t.mutation(api.exits.createExitTicket, { ...good, gameId: '<script>' })).ok).toBe(false)
  expect((await t.mutation(api.exits.createExitTicket, { ...good, qs: good.qs.slice(0, 4), check: '4:k3j9a' })).ok).toBe(false)
  expect((await t.mutation(api.exits.createExitTicket, { ...good, check: '8:k3j9a' })).ok).toBe(false)
  expect((await t.mutation(api.exits.createExitTicket, { ...good, qs: [{ ...q(0), correct: 4 }, q(1), q(2), q(3), q(0)] })).ok).toBe(false)
  expect((await t.mutation(api.exits.createExitTicket, { ...good, qs: [{ ...q(0), mistakes: ['x', null, null, null] }, q(1), q(2), q(3), q(0)] })).ok).toBe(false)
  expect((await t.mutation(api.exits.createExitTicket, { ...good, qs: [q(0, '<b>x</b>'), q(1), q(2), q(3), q(0)] })).ok).toBe(false)
  expect((await t.mutation(api.exits.createExitTicket, { ...good, qs: [{ ...q(0), kind: 'expand' }, q(1), q(2), q(3), q(0)] })).ok).toBe(false)
  expect(await t.query(api.exits.myExitTicket, { token: aTok })).toEqual({ ok: true, ticket: null })
  const k1 = await t.mutation(api.exits.createExitTicket, good)
  expect(k1.ok).toBe(true)

  // students in the class see it; a student in another class does not
  let mine = await t.query(api.exits.myExitTicket, { token: aTok })
  expect(mine).toMatchObject({ ok: true, ticket: { id: k1.id, gameId: 'ncm8-3.07', seed: 12345, count: 5, calc: false, check: '5:k3j9a' }, done: null })
  expect(mine.ticket.qs).toBeUndefined()
  expect((await t.query(api.exits.myExitTicket, { token: dTok })).ticket).toBeNull()
  expect((await t.mutation(api.exits.submitExitTicket, { token: dTok, ticketId: k1.id, choices: [0, 1, 2, 3, 0] })).ok).toBe(false)
  expect((await t.mutation(api.exits.submitExitTicket, { token: tok, ticketId: k1.id, choices: [0, 1, 2, 3, 0] })).ok).toBe(false)
  // answers: one per question, each 0–3 or −1 (left out)
  expect((await t.mutation(api.exits.submitExitTicket, { token: aTok, ticketId: k1.id, choices: [0, 1, 2, 3] })).ok).toBe(false)
  expect((await t.mutation(api.exits.submitExitTicket, { token: aTok, ticketId: k1.id, choices: [0, 1, 2, 4, 0] })).ok).toBe(false)
  expect((await t.mutation(api.exits.submitExitTicket, { token: aTok, ticketId: k1.id, choices: [0, 1, 2, 1.5, 0] })).ok).toBe(false)
  expect(await t.mutation(api.exits.submitExitTicket, { token: aTok, ticketId: k1.id, choices: [1, 1, 2, -1, 0] })).toEqual({ ok: true, correct: 3, total: 5 })
  expect((await t.mutation(api.exits.submitExitTicket, { token: aTok, ticketId: k1.id, choices: [0, 1, 2, 3, 0] })).message).toMatch(/already/)
  expect((await t.query(api.exits.myExitTicket, { token: aTok })).done).toEqual({ choices: [1, 1, 2, -1, 0], correct: 3, total: 5 })

  // the teacher's view: every answer; not for another teacher
  let list = await t.query(api.exits.classExitTickets, { token: tok, classId })
  expect(list.tickets).toHaveLength(1)
  expect(list.tickets[0]).toMatchObject({ id: k1.id, open: true, count: 5, qs: good.qs, answers: [{ studentId: ava.id, choices: [1, 1, 2, -1, 0], correct: 3 }] })
  expect((await t.query(api.exits.classExitTickets, { token: other, classId })).ok).toBe(false)
  expect((await t.query(api.exits.classExitTickets, { token: aTok, classId })).ok).toBe(false)

  // a new ticket closes the one before; a closed ticket can't be handed in
  const k2 = await t.mutation(api.exits.createExitTicket, { ...good, gameId: 'ncm8-ch3', seed: 99, qs: good.qs.slice(0, 3), check: '3:abc' })
  expect(k2.ok).toBe(true)
  expect((await t.mutation(api.exits.submitExitTicket, { token: bTok, ticketId: k1.id, choices: [0, 1, 2, 3, 0] })).message).toMatch(/closed/)
  expect((await t.query(api.exits.myExitTicket, { token: bTok })).ticket.id).toBe(k2.id)
  list = await t.query(api.exits.classExitTickets, { token: tok, classId })
  expect(list.tickets.map((k: any) => [k.gameId, k.open])).toEqual([['ncm8-ch3', true], ['ncm8-3.07', false]])
  // the teacher closes it; or it closes itself after two days
  expect((await t.mutation(api.exits.closeExitTicket, { token: other, ticketId: k2.id })).ok).toBe(false)
  expect((await t.mutation(api.exits.closeExitTicket, { token: tok, ticketId: k2.id })).ok).toBe(true)
  expect((await t.query(api.exits.myExitTicket, { token: bTok })).ticket).toBeNull()
  const k3 = await t.mutation(api.exits.createExitTicket, { ...good, seed: 7 })
  await t.run(async (ctx: any) => ctx.db.patch(k3.id, { createdAt: Date.now() - 2.1 * 24 * 3600 * 1000 }))
  expect((await t.query(api.exits.myExitTicket, { token: bTok })).ticket).toBeNull()
  expect((await t.mutation(api.exits.submitExitTicket, { token: bTok, ticketId: k3.id, choices: [0, 1, 2, 3, 0] })).ok).toBe(false)

  // clean-up: deleting a ticket removes its answers; removing a student removes theirs; deleting the class removes tickets
  expect((await t.mutation(api.exits.deleteExitTicket, { token: other, ticketId: k1.id })).ok).toBe(false)
  await t.mutation(api.exits.deleteExitTicket, { token: tok, ticketId: k1.id })
  expect(await t.run(async (ctx: any) => (await ctx.db.query('exitAnswers').collect()).length)).toBe(0)
  const k4 = await t.mutation(api.exits.createExitTicket, good)
  await t.mutation(api.exits.submitExitTicket, { token: bTok, ticketId: k4.id, choices: [0, 1, 2, 3, 0] })
  await t.mutation(api.classes.removeStudent, { token: tok, studentId: ben.id })
  expect(await t.run(async (ctx: any) => (await ctx.db.query('exitAnswers').collect()).length)).toBe(0)
  await t.mutation(api.classes.deleteClass, { token: tok, classId })
  expect(await t.run(async (ctx: any) => (await ctx.db.query('exitTickets').collect()).length)).toBe(0)
})
