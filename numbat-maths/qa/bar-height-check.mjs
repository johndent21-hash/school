// Column graphs and histograms: every column must be drawn as tall as its height says.
// (A page-wide `.bar { height }` rule once squashed every SVG column to 9 px; CSS height overrides a <rect>'s height.)
// Usage: dev server on :3100 (VITE_STAGE1=1 VITE_STAGE2=1 for Years 3–4), then: node qa/bar-height-check.mjs
import { chromium } from 'playwright'
const base = process.env.BASE ?? 'http://127.0.0.1:3100'
const skills = process.argv.slice(2).length ? process.argv.slice(2) : ['y3-data-column', 'y4-data-scale', 'y7-data-graphs', 'y9-dat-displays', 'y9-dat-shape']
const b = await chromium.launch()
const page = await b.newPage({ viewport: { width: 1280, height: 800 } })
let columns = 0
const problems = []
for (const skill of skills) {
  await page.goto(`${base}/lesson?id=${skill}&tab=practice`, { waitUntil: 'networkidle' })
  await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('numbat.resume')).forEach((k) => localStorage.removeItem(k)))
  await page.reload({ waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Start practice set' }).click()
  await page.waitForTimeout(200)
  const n = await page.locator('.progress-dots span').count()
  let seen = 0
  for (let k = 0; k < n; k++) {
    const r = await page.evaluate(() =>
      [...document.querySelectorAll('.q-card svg rect.bar')].map((e) => {
        const svg = e.ownerSVGElement
        const scale = svg.getBoundingClientRect().height / svg.viewBox.baseVal.height
        return { want: Number(e.getAttribute('height')) * scale, got: e.getBoundingClientRect().height }
      }),
    )
    if (r.length) seen++
    for (const c of r) {
      columns++
      if (Math.abs(c.want - c.got) > 1) problems.push(`${skill} Q${k + 1}: column drawn ${c.got.toFixed(1)} px, should be ${c.want.toFixed(1)} px`)
    }
    const ans = await page.evaluate(() => window.__ans)
    if (ans.startsWith('MC')) await page.locator('.mc-option').nth(Number(ans.slice(2))).click()
    else await page.locator('.answer-input').fill(ans)
    await page.locator('button', { hasText: /^\s*Check\s*$/ }).last().click()
    await page.waitForTimeout(60)
    if (k < n - 1) await page.getByRole('button', { name: /Next question/ }).click()
  }
  if (!seen) problems.push(`${skill}: no column graph appeared in a whole set`)
}
await b.close()
problems.slice(0, 20).forEach((p) => console.log(p))
console.log(`${columns} columns measured, ${problems.length} problems`)
process.exit(problems.length ? 1 : 0)
