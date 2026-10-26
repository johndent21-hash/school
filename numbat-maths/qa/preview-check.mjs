// Smoke test of the stand-alone preview page (served at :3200 inside a stand-in for the viewer's skeleton)
import { chromium } from 'playwright'
const url = 'http://127.0.0.1:3200/index.html'
const browser = await chromium.launch()
const out = []
for (const [w, scheme] of [[1280, 'light'], [390, 'dark']]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 860 }, colorScheme: scheme })
  const page = await ctx.newPage()
  const errors = [], hosts = new Set()
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)) })
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message.slice(0, 200)))
  page.on('request', (r) => { const h = new URL(r.url()).host; if (!h.startsWith('127.0.0.1')) hosts.add(h) })
  const shot = (n) => page.screenshot({ path: `/tmp/claude-0/shots/pv_${w}_${n}.png`, fullPage: true })
  await page.goto(url, { waitUntil: 'networkidle' }); await page.waitForTimeout(800); await shot('landing')
  await page.getByRole('link', { name: /Start practising/ }).click(); await page.waitForTimeout(400)
  await page.getByRole('tab', { name: 'Year 8' }).click(); await page.waitForTimeout(300); await shot('home')
  await page.getByRole('link', { name: /Pythagoras/ }).first().click(); await page.waitForTimeout(400)
  await page.getByRole('link', { name: 'Practise' }).first().click(); await page.waitForTimeout(400)
  await page.getByRole('button', { name: 'Start practice set' }).click()
  // two wrong tries reveal the answer, then answer Q2 wrong once and stop via the in-page bar
  for (let k = 0; k < 2; k++) { await page.locator('.answer-input').fill('987654'); await page.getByRole('button', { name: 'Check' }).click(); await page.waitForTimeout(150) }
  await shot('practice_reveal')
  await page.getByRole('button', { name: /Next question/ }).click()
  await page.getByRole('button', { name: 'Stop' }).click(); await page.waitForTimeout(200)
  const bar = await page.locator('[role=alert]').textContent().catch(() => 'NO BAR')
  await page.locator('[role=alert]').getByRole('button', { name: 'Stop' }).click(); await page.waitForTimeout(300)
  const back = await page.getByRole('button', { name: 'Start practice set' }).isVisible()
  // topic test: finish with blanks through the in-page bar
  await page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: /Pythagoras/ }).click(); await page.waitForTimeout(400)
  await page.getByRole('link', { name: 'Start test' }).click(); await page.waitForTimeout(400)
  await page.getByRole('button', { name: 'Start the test' }).click()
  for (let k = 0; k < 10; k++) { await page.getByRole('button', { name: /^(Next|Finish test)$/ }).click(); await page.waitForTimeout(60); await page.getByRole('button', { name: /^(Next|Finish test)$/ }).click(); await page.waitForTimeout(60) }
  await page.locator('[role=alert]').getByRole('button', { name: 'Finish test' }).click(); await page.waitForTimeout(500)
  const testScore = (await page.locator('.q-card p').nth(1).textContent())?.replace(/\s+/g, ' ')
  await shot('test_results')
  // teacher area is switched off
  await page.getByRole('link', { name: /Numbat Maths home/ }).click(); await page.waitForTimeout(300)
  const teacherLink = page.getByRole('link', { name: /Teacher log in|Teachers/ }).first()
  await teacherLink.click(); await page.waitForTimeout(300)
  const locked = await page.getByRole('heading', { name: /switched off in this preview/ }).isVisible()
  await shot('teacher')
  const sw = await page.evaluate(() => document.documentElement.scrollWidth)
  out.push(`${w}/${scheme}: stopBar="${bar?.slice(0, 50)}" backToStart=${back} test="${testScore}" teacherLocked=${locked} scrollW=${sw} hosts=[${[...hosts].join(', ')}] errors=[${errors.join(' | ')}]`)
  await ctx.close()
}
console.log(out.join('\n'))
await browser.close()
