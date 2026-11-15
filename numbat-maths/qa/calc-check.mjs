// (preview dev server on :3102) Plays a practice set of every skill in qa/calc-ids.json and checks the Calculator
// button is on every question of the set, except questions marked "No calculator" (which must not have it).
// ONLY=y9-cg for skills starting with that.
import { chromium } from 'playwright'
import fs from 'node:fs'
const base = process.env.BASE ?? 'http://127.0.0.1:3102'
const ids = JSON.parse(fs.readFileSync('qa/calc-ids.json', 'utf8')).filter((s) => !process.env.ONLY || s.startsWith(process.env.ONLY))
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1100, height: 900 } })
let errors = []
page.on('pageerror', (e) => errors.push(e.message.slice(0, 200)))
page.on('dialog', (d) => d.accept())
const problems = []
let questions = 0
for (const s of ids) {
  errors = []
  await page.goto(`${base}/lesson?id=${s}&tab=practice`, { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: 'Start practice set' }).click({ timeout: 20000 })
  const count = await page.locator('.progress-dots span').count()
  const seen = []
  for (let k = 0; k < count; k++) {
    await page.getByRole('button', { name: 'Check' }).waitFor({ timeout: 10000 })
    const calcButton = await page.locator('button[title$="the calculator"]').count()
    const noCalc = await page.getByText('No calculator', { exact: true }).count()
    const allowed = await page.getByText('Calculator allowed', { exact: true }).count()
    seen.push(noCalc ? 'n' : calcButton ? 'c' : '-')
    if (noCalc && calcButton) problems.push(`${s} Q${k + 1}: marked "No calculator" but has the button`)
    if (allowed && !calcButton) problems.push(`${s} Q${k + 1}: "Calculator allowed" but no button`)
    // move on: answer if the hook gives a typed or multiple-choice answer, otherwise ask to be shown
    const ans = await page.evaluate(() => window.__ans)
    try {
      if (ans.startsWith('MC')) await page.locator('.mc-option').nth(Number(ans.slice(2))).click({ timeout: 2000 })
      else await page.locator('.answer-input').first().fill(ans, { timeout: 2000 })
      await page.getByRole('button', { name: 'Check' }).click({ timeout: 2000 })
    } catch {}
    const next = page.getByRole('button', { name: /Next question|See my results/ })
    for (let tries = 0; tries < 3 && !(await next.count()); tries++) {
      await page.getByRole('button', { name: 'Show me how' }).click({ timeout: 2000 }).catch(() => {})
      await page.getByRole('button', { name: 'Check' }).click({ timeout: 1000 }).catch(() => {})
    }
    await next.click({ timeout: 5000 })
    questions++
  }
  const marks = seen.join('')
  if (marks.includes('c') && marks.includes('-')) problems.push(`${s}: the Calculator button comes and goes: ${marks}`)
  if (errors.length) problems.push(`${s}: page errors: ${errors.join(' | ')}`)
  console.log(`${s.padEnd(24)} ${marks}`)
}
console.log(`${ids.length} practice sets, ${questions} questions (c = Calculator button, n = "No calculator", - = neither)`)
console.log(problems.length ? `PROBLEMS ${problems.length}\n${problems.join('\n')}` : 'no problems')
await browser.close()
