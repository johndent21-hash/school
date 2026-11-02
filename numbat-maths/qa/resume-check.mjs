// Stopping a practice set and carrying on later (on the same device), as a guest:
// answer 3 questions, Stop, come back later, Carry on from question 4 with the same questions and marks;
// finishing the set clears the saved place; "Start a new set" starts again; a saved set that no longer
// rebuilds the same questions (e.g. after an update) is not offered.
// Usage: node qa/resume-check.mjs   (dev harness on :3100)
import { chromium } from 'playwright'
const base = process.env.BASE ?? 'http://127.0.0.1:3100'
const skill = process.env.SKILL ?? 'y7-int-add'
const browser = await chromium.launch()
const page = await (await browser.newContext({ viewport: { width: 1366, height: 625 } })).newPage()
page.setDefaultTimeout(8000)
let failures = 0
const ok = (cond, msg) => {
  console.log(`${cond ? 'ok  ' : 'FAIL'} ${msg}`)
  if (!cond) failures++
}
const url = `${base}/lesson?id=${skill}&tab=practice`
const prompt = () => page.locator('.q-card .q-prompt').first().innerText()
const score = () => page.locator('.focus-bar').getByText(/^Score /).innerText()
const resumeKeys = () => page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('numbat.resume')))
async function answer() {
  const ans = await page.evaluate(() => window.__ans)
  if (ans.startsWith('MC')) await page.locator('.mc-option').nth(Number(ans.slice(2))).click()
  else await page.locator('.answer-input').fill(ans)
  await page.locator('.q-side button', { hasText: /^\s*Check\s*$/ }).last().click()
}
const next = () => page.getByRole('button', { name: /Next question|See my results/ }).click()

await page.goto(url, { waitUntil: 'networkidle' })
await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('numbat.resume')).forEach((k) => localStorage.removeItem(k)))
await page.reload({ waitUntil: 'networkidle' })
ok((await page.getByText('You were up to question').count()) === 0, 'no saved set to begin with')

// --- answer 3, then stop
await page.getByRole('button', { name: 'Start practice set' }).click()
ok((await page.locator('.progress-dots span').count()) === 20, 'the set has 20 questions')
const firstPrompts = []
for (let k = 0; k < 3; k++) {
  firstPrompts.push(await prompt())
  await answer()
  await next()
}
const q4 = await prompt()
ok((await score()) === 'Score 3 / 20', `score after 3 correct answers: ${await score()}`)
await page.locator('.focus-bar').getByRole('button', { name: 'Stop' }).click()
ok(await page.getByText('Stop for now? Next time you can carry on from question 4.').isVisible(), 'stop message names question 4')
await page.locator('[role="alert"]').getByRole('button', { name: 'Stop' }).click()
ok(await page.getByText('You were up to question 4 of 20, with 3 marks so far.').isVisible(), 'the practice page offers to carry on')
ok((await resumeKeys()).length === 1, 'one saved set on this device')

// --- come back later
await page.reload({ waitUntil: 'networkidle' })
ok(await page.getByText('You were up to question 4 of 20, with 3 marks so far.').isVisible(), 'still offered after reloading the page')
await page.getByRole('button', { name: 'Carry on' }).click()
ok((await prompt()) === q4, 'carries on with the same question 4')
ok((await score()) === 'Score 3 / 20', 'the 3 marks are kept')
ok((await page.locator('.progress-dots span.full').count()) === 3, 'the first 3 dots show as right')

// --- finish the set: the saved place is cleared
for (let k = 3; k < 20; k++) {
  await answer()
  await next()
}
await page.waitForTimeout(400)
ok((await resumeKeys()).length === 0, 'finishing the set clears the saved place')
await page.goto(url, { waitUntil: 'networkidle' })
ok((await page.getByText('You were up to question').count()) === 0, 'no carry-on offer after finishing')

// --- start a new set instead of carrying on
await page.getByRole('button', { name: 'Start practice set' }).click()
await answer()
await next()
await page.locator('.focus-bar').getByRole('button', { name: 'Stop' }).click()
await page.locator('[role="alert"]').getByRole('button', { name: 'Stop' }).click()
ok(await page.getByText('You were up to question 2 of 20, with 1 mark so far.').isVisible(), '"1 mark" (singular) after one answer')
await page.getByRole('button', { name: 'Start a new set' }).click()
ok((await score()) === 'Score 0 / 20', 'a new set starts from 0')
await page.locator('.focus-bar').getByRole('button', { name: 'Stop' }).click() // on question 1 with nothing answered: leaves straight away
ok((await resumeKeys()).length === 0, 'the old saved set was cleared')

// --- a saved set that no longer matches is not offered
await page.getByRole('button', { name: 'Start practice set' }).click()
await answer()
await next()
await page.locator('.focus-bar').getByRole('button', { name: 'Stop' }).click()
await page.locator('[role="alert"]').getByRole('button', { name: 'Stop' }).click()
await page.evaluate(() => {
  const k = Object.keys(localStorage).find((x) => x.startsWith('numbat.resume'))
  const r = JSON.parse(localStorage.getItem(k))
  r.check = 'changed'
  localStorage.setItem(k, JSON.stringify(r))
})
await page.reload({ waitUntil: 'networkidle' })
ok((await page.getByText('You were up to question').count()) === 0, 'a set that has changed is not offered')
ok((await resumeKeys()).length === 0, 'and its saved place is removed')

await browser.close()
console.log(failures ? `${failures} failures` : 'All resume checks passed')
process.exit(failures ? 1 : 0)
