import { chromium } from 'playwright'
import fs from 'node:fs'
const base = 'http://127.0.0.1:3100'
const data = JSON.parse(fs.readFileSync(process.env.IDS || 'qa/ids.json', 'utf8'))
const only = process.env.ONLY
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 } })
const page = await ctx.newPage()
let errors = []
page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('WebSocket')) errors.push(m.text().slice(0, 200)) })
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message.slice(0, 200)))
page.on('dialog', (d) => d.accept())
const problems = []
let n = 0
for (const t of data) {
  const skills = only ? t.skills.filter((s) => s.startsWith(only)) : t.skills
  for (const s of skills) {
    errors = []
    await page.goto(`${base}/lesson?id=${s}&tab=practice`, { waitUntil: 'domcontentloaded' })
    await page.getByRole('button', { name: 'Start practice set' }).click({ timeout: 20000 })
    for (let k = 0; k < 10; k++) {
      const ans = await page.evaluate(() => window.__ans)
      if (ans.startsWith('MC')) await page.locator('.mc-option').nth(Number(ans.slice(2))).click()
      else await page.locator('.answer-input').fill(ans)
      await page.getByRole('button', { name: 'Check' }).click()
      const fb = page.locator('.feedback').first()
      await fb.waitFor({ timeout: 5000 })
      const cls = await fb.getAttribute('class')
      if (!cls.includes('good')) {
        problems.push(`${s} Q${k + 1} ans=[${ans}] fb=${(await fb.textContent()).slice(0, 100)}`)
        // finish this question
        await page.getByRole('button', { name: 'Show me how' }).click().catch(() => {})
      }
      n++
      await page.getByRole('button', { name: /Next question|See my results/ }).click()
    }
    const score = (await page.locator('.q-card p').first().textContent()).replace(/\s+/g, ' ')
    if (!score.startsWith('10 /')) problems.push(`${s} final ${score}`)
    if (errors.length) problems.push(`${s} console: ${errors.join(' | ')}`)
  }
  process.stdout.write(`${t.topic} done (${n})\n`)
}
console.log('QUESTIONS', n)
console.log('PROBLEMS', problems.length)
console.log(problems.join('\n'))
await browser.close()
