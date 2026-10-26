import { chromium } from 'playwright'
const base = 'http://127.0.0.1:3100'
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 375, height: 760 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 })
const page = await ctx.newPage()
const out = []
for (const [p, act] of [['/', null], ['/home?year=9', null], ['/lesson?id=y9-trg-side&tab=practice', 'start'], ['/lesson?id=y8-alg-factorise&tab=practice', 'start'], ['/teacher', null], ['/lesson?id=y9-data-quartiles&tab=learn', 'steps']]) {
  await page.goto(base + p, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  if (act === 'start') await page.getByRole('button', { name: 'Start practice set' }).click()
  if (act === 'steps') await page.getByRole('button', { name: /Show all steps/ }).click()
  await page.waitForTimeout(500)
  const name = 'm' + p.replace(/[^a-z0-9]+/gi, '_')
  await page.screenshot({ path: `/tmp/claude-0/shots/${name}.png`, fullPage: true })
  const wide = await page.evaluate(() => { const w = window.innerWidth; return [...document.querySelectorAll('body *')].filter((e) => e.getBoundingClientRect().right > w + 1 && getComputedStyle(e).position !== 'fixed').slice(0, 5).map((e) => e.tagName + '.' + (e.className?.baseVal ?? e.className)).join(', ') })
  out.push(`${p}: scrollW=${await page.evaluate(() => document.documentElement.scrollWidth)} overflow=[${wide}]`)
}
console.log(out.join('\n'))
await browser.close()
