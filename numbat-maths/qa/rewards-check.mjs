// Guest rewards flow: finish practice sets and a test, check the celebration and the home dashboard.
import { chromium } from 'playwright'
const base = process.env.BASE ?? 'http://127.0.0.1:3100'
const browser = await chromium.launch()
const out = []
const errs = []
for (const [w, scheme] of [[1280, 'light'], [390, 'dark']]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, colorScheme: scheme })
  const page = await ctx.newPage()
  page.on('pageerror', (e) => errs.push(`${w} ` + e.message))
  page.on('console', (m) => m.type() === 'error' && errs.push(`${w} console ` + m.text().slice(0, 160)))
  async function practice(skill, allRight = true) {
    await page.goto(`${base}/lesson?id=${skill}&tab=practice`, { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: 'Start practice set' }).click()
    for (let k = 0; k < 10; k++) {
      const ans = await page.evaluate(() => window.__ans)
      if (!allRight && k < 6) {
        await page.getByRole('button', { name: 'Show me how' }).click()
      } else if (ans.startsWith('MC')) {
        await page.locator('.mc-option').nth(Number(ans.slice(2))).click()
        await page.getByRole('button', { name: 'Check', exact: true }).click()
      } else {
        await page.locator('.answer-input').fill(ans)
        await page.locator('.answer-input').press('Enter')
      }
      await page.waitForTimeout(60)
      await page.getByRole('button', { name: /Next question|See my results/ }).click()
      await page.waitForTimeout(60)
    }
    await page.waitForTimeout(300)
    return {
      score: (await page.locator('.q-card p.font-display').first().textContent())?.replace(/\s+/g, ' '),
      celebrate: (await page.locator('.celebrate-box').textContent().catch(() => '')).replace(/\s+/g, ' ').slice(0, 220),
      ring: await page.locator('.goal-ring').first().getAttribute('aria-label').catch(() => null),
      points: await page.locator('.points-pill').first().textContent().catch(() => null),
    }
  }
  const r1 = await practice('y7-int-addsub', false)
  out.push(`${w}: set 1 (40%): ${JSON.stringify(r1)}`)
  if (w === 1280) await page.screenshot({ path: '/tmp/claude-0/shots/rw_result1.png', fullPage: true })
  const r2 = await practice('y7-int-addsub')
  out.push(`${w}: set 2 (100%): ${JSON.stringify(r2)}`)
  await page.screenshot({ path: `/tmp/claude-0/shots/rw_result2_${w}.png`, fullPage: true })
  await page.goto(`${base}/home?year=7`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(300)
  const panel = (await page.locator('section[aria-labelledby="my-progress"]').textContent()).replace(/\s+/g, ' ').slice(0, 400)
  out.push(`${w}: home panel: ${panel}`)
  await page.locator('section[aria-labelledby="my-progress"]').screenshot({ path: `/tmp/claude-0/shots/rw_home_${w}.png` })
  // guest goal change
  await page.locator('section[aria-labelledby="my-progress"] select').selectOption('2')
  await page.waitForTimeout(200)
  out.push(`${w}: after goal 2: ${await page.locator('.goal-ring').first().getAttribute('aria-label')} | ${(await page.locator('section[aria-labelledby="my-progress"]').textContent()).match(/Goal reached!|more sets? to go/)?.[0]}`)
  await page.getByRole('button', { name: 'See all badges' }).click()
  out.push(`${w}: badges shown ${await page.locator('.badge-tile').count()}, earned ${await page.locator('.badge-tile.is-earned').count()}`)
  await ctx.close()
}
console.log(out.join('\n'))
console.log('errors:', errs.length ? errs : 'none')
await browser.close()
