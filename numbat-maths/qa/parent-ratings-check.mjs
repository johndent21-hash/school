// Lesson-ratings sheet and parent view in preview mode (VITE_PREVIEW_ONLY=1 on :3102).
// Navigation after the first load uses links, because the example ratings live in memory.
import { chromium } from 'playwright'
const base = process.env.BASE ?? 'http://127.0.0.1:3102'
const browser = await chromium.launch()
const out = []
const errs = []
for (const [w, scheme, touch] of [[1280, 'light', false], [390, 'dark', true]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, colorScheme: scheme, hasTouch: touch, isMobile: touch })
  const page = await ctx.newPage()
  page.on('pageerror', (e) => errs.push(`${w} ` + e.message))
  page.on('console', (m) => m.type() === 'error' && errs.push(`${w} console ` + m.text().slice(0, 200)))
  page.on('dialog', (d) => { errs.push(`${w} dialog: ${d.message()}`); d.dismiss() })
  const shot = (n) => page.screenshot({ path: `/tmp/claude-0/shots/pr_${n}_${w}.png`, fullPage: !touch })
  const tag = (s) => out.push(`${w}: ${s}`)

  await page.goto(`${base}/teacher-class?id=demo-class&tab=ratings`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  const heads = await page.locator('.rs-head').count()
  const rows = await page.locator('.rsheet tbody tr').count()
  const lastRated = await page.locator('.rsheet tfoot td').nth(heads - 1).textContent()
  tag(`sheet: ${heads} lesson columns, ${rows} students, last column rated ${lastRated}`)
  await shot('sheet')
  // type ratings into the last column: click first student's cell, type 4, 3, a, 2
  const lastColCell = (s) => page.locator('.rsheet tbody tr').nth(s).locator('.rs-cell').nth(heads - 1)
  await lastColCell(0).click()
  for (const k of ['4', '3', 'a', '2']) await page.keyboard.press(k)
  const typed = await Promise.all([0, 1, 2, 3, 4].map((s) => lastColCell(s).textContent()))
  const selName = await page.locator('.rs-bar strong').first().textContent()
  tag(`typed 4,3,A,2 -> ${JSON.stringify(typed)}; now selected: ${selName}`)
  // tap-to-pick on the next student
  await page.locator('.rs-bar .rs-pick', { hasText: /^1/ }).click()
  tag(`picked 1 -> ${await lastColCell(4).textContent()}; classes ${await lastColCell(4).getAttribute('class')}`)
  // arrow up and clear
  await lastColCell(5).focus()
  await page.keyboard.press('ArrowUp')
  await page.keyboard.press('Backspace')
  await page.waitForTimeout(100)
  tag(`cleared -> "${await lastColCell(4).textContent()}"`)
  await page.getByRole('button', { name: 'Done' }).click()
  // fill blanks with 3
  await page.locator('.rs-head').nth(heads - 1).click()
  await page.getByRole('button', { name: /without a number a 3/ }).click()
  await page.waitForTimeout(150)
  tag(`after fill: rated ${await page.locator('.rsheet tfoot td').nth(heads - 1).textContent()}`)
  // add a lesson
  await page.getByRole('button', { name: 'Close' }).click().catch(() => {})
  await page.locator('input[type=date]').first().fill('2026-11-02')
  await page.getByPlaceholder('e.g. Period 3, Quiz').fill('Test lesson')
  await page.getByRole('button', { name: 'Add lesson' }).click()
  await page.waitForTimeout(250)
  const heads2 = await page.locator('.rs-head').count()
  tag(`added lesson: columns ${heads2}, last header "${(await page.locator('.rs-head').nth(heads2 - 1).textContent()).replace(/\s+/g, ' ')}", selected ${await page.locator('.rs-bar strong').first().textContent().catch(() => 'none')}`)
  await page.keyboard.press('4')
  // delete it again
  await page.locator('.rs-head').nth(heads2 - 1).click()
  await page.getByRole('button', { name: 'Delete lesson' }).first().click()
  await page.locator('.confirm-bar, [role=alertdialog], .feedback').getByRole('button', { name: 'Delete lesson' }).click().catch(async () => {
    await page.getByRole('button', { name: 'Delete lesson' }).last().click()
  })
  await page.waitForTimeout(200)
  tag(`deleted: columns ${await page.locator('.rs-head').count()}`)
  await page.getByRole('button', { name: /Download CSV/ }).click()
  await shot('sheet_after')

  // overview picks up rating concerns
  await page.getByRole('tab', { name: 'Overview' }).click()
  await page.waitForTimeout(300)
  tag(`overview needs help: ${(await page.locator('#needs-help + ul').textContent()).replace(/\s+/g, ' ').slice(0, 300)}`)

  // student report shows the In class section
  await page.locator('#needs-help + ul a').first().click()
  await page.waitForTimeout(300)
  tag(`student report: ${(await page.locator('#student-in-class').locator('..').locator('..').locator('p.font-bold').first().textContent())}`)

  // parent view via the header link (client-side, so the in-memory edits carry over)
  await page.getByRole('link', { name: 'Parents' }).click()
  await page.waitForTimeout(400)
  tag(`parent h1: ${await page.locator('h1').textContent()} | tiles: ${(await page.locator('.stat-value').allTextContents()).join(' | ')}`)
  tag(`parent sentence: ${await page.locator('#in-class + div p.font-bold').first().textContent()}`)
  const weeks = await page.locator('.rh-week').count()
  const firstWeek = (await page.locator('.rh-week').first().textContent()).replace(/\s+/g, ' ')
  tag(`parent weeks shown ${weeks}; newest: ${firstWeek}`)
  await shot('parent_ava')
  await page.locator('select').first().selectOption('demo-3')
  await page.waitForTimeout(300)
  tag(`Zara: ${await page.locator('h1').textContent()} | ${await page.locator('#in-class + div p.font-bold').first().textContent()}`)
  await shot('parent_zara')
  tag(`scrollWidth ${await page.evaluate(() => document.documentElement.scrollWidth)}`)
  await ctx.close()
}
console.log(out.join('\n'))
console.log('errors:', errs.length ? errs : 'none')
await browser.close()
