import { chromium } from 'playwright'
const base = process.argv[2]
const paths = process.argv.slice(3)
const width = Number(process.env.W || 1280)
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width, height: 900 } })
const page = await ctx.newPage()
const errors = []
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`[${m.type()}] ${m.text().slice(0, 400)}`) })
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message.slice(0, 400)}`))
for (const p of paths) {
  errors.length = 0
  await page.goto(base + p, { waitUntil: 'networkidle', timeout: 90000 }).catch((e) => errors.push('goto ' + e.message.slice(0, 200)))
  await page.waitForTimeout(2000)
  const name = (process.env.PREFIX || '') + (p.replace(/[^a-z0-9]+/gi, '_') || 'root')
  await page.screenshot({ path: `/tmp/claude-0/shots/${name}.png`, fullPage: !process.env.NOFULL })
  const h = await page.evaluate(() => document.body.scrollWidth > window.innerWidth ? `HSCROLL ${document.body.scrollWidth}` : 'ok')
  console.log(p, '->', await page.title(), '|', h, '|', errors.slice(0, 8).join(' || '))
}
await browser.close()
