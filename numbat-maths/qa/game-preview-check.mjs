// The built stand-alone page (the one published as an artifact): the class games, played by clicking only.
// The page has no addresses of its own (every reload starts at the home page), so a game in progress must be
// offered again from the home page. Also a quick look that the rest of the site still opens.
// Usage: node qa/game-preview-check.mjs path/to/built-page.html      SHOTS=/some/folder to keep screenshots
import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { mkdirSync, readFileSync } from 'node:fs'

const file = process.argv[2]
if (!file) throw new Error('give the built page: node qa/game-preview-check.mjs out.html')
const shots = process.env.SHOTS ?? '/tmp/claude-0/shots'
mkdirSync(shots, { recursive: true })
// the same wrapper the viewer puts around a published page
const skeleton =
  '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;box-sizing:border-box}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:#000}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>\n'
const html = skeleton + readFileSync(file, 'utf8') + '\n</body></html>'
const server = createServer((req, res) => {
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
  res.end(html)
}).listen(0, '127.0.0.1')
await new Promise((r) => server.once('listening', r))
const url = `http://127.0.0.1:${server.address().port}/`

const browser = await chromium.launch()
const errs = []
const hosts = new Set()
const log = (x) => console.log(x)

for (const [w, h, scheme] of [
  [1366, 660, 'light'],
  [1920, 950, 'dark'],
]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: scheme })
  const page = await ctx.newPage()
  page.setDefaultTimeout(8000)
  page.on('pageerror', (e) => errs.push(`${w} ${e.message}`))
  page.on('console', (m) => m.type() === 'error' && !/Failed to load resource|WebSocket|convex/i.test(m.text()) && errs.push(`${w} console ${m.text().slice(0, 200)}`))
  page.on('request', (r) => {
    const host = new URL(r.url()).host
    if (!host.startsWith('127.0.0.1')) hosts.add(host)
  })
  const shot = (name) => page.screenshot({ path: `${shots}/pv_game_${w}_${name}.png` })
  const fits = () => page.evaluate(() => Math.max(0, document.documentElement.scrollHeight - window.innerHeight))

  await page.goto(url, { waitUntil: 'load' })
  await page.getByRole('link', { name: /Play a class game on the board/ }).waitFor()
  log(`${w}×${h} ${scheme}: home page opens; title "${await page.title()}"`)
  // the rest of the site still opens
  await page.getByRole('link', { name: /Start practising/ }).click()
  await page.getByRole('tab', { name: 'Year 7' }).click()
  await page.getByRole('link', { name: /Area and volume/ }).first().click()
  await page.locator('#topic-games').waitFor()
  log(`   Year 7 Area and volume topic: ${await page.locator('ol > li').count()} skills; link to class games ${await page.locator('#topic-games').count()}`)
  await page.locator('#topic-games').locator('xpath=ancestor::section').getByRole('link', { name: /Choose a game/ }).click()

  // the games page, then one whole game by clicking
  await page.getByRole('heading', { name: 'Class games' }).waitFor()
  log(`   games page: ${await page.locator('ol a[href^="/game?id="]').count()} exercises (${await page.getByRole('link', { name: /^Play NCM 7 Exercise/ }).count()} showing: the topic's chapter opens by itself) and ${await page.getByRole('link', { name: /Whole chapter mix/ }).count()} chapter mix`)
  await shot('games')
  await page.getByRole('link', { name: /^Play NCM 7 Exercise 8\.06/ }).click()
  await page.getByRole('radio', { name: '5', exact: true }).click()
  await page.getByRole('radio', { name: 'No timer' }).click()
  await page.getByRole('button', { name: /Start the game/ }).click()
  let tall = 0
  for (let k = 0; k < 5; k++) {
    await page.locator('.gb-prompt').waitFor()
    tall = Math.max(tall, await fits())
    if (k === 1) await shot('ask')
    await page.getByRole('button', { name: 'Show the answer' }).click()
    await page.locator('.gb-opt.right').waitFor()
    await page.locator('button.gb-team').nth(k % 4).click()
    await page.locator('button.gb-team').nth((k + 1) % 4).click()
    tall = Math.max(tall, await fits())
    if (k === 1) await shot('answer')
    await page.locator('.gb-main').click()
    // one log a second; the main button waits for the last
    await page.locator('.gb-main:not([disabled])', { hasText: /Next question|See the winners/ }).waitFor()
    if (k === 1) {
      await page.waitForTimeout(700)
      await shot('dig')
    }
    await page.locator('.gb-main').click()
  }
  await page.locator('.gb-podium').waitFor()
  log(`   a 5-question game on Ex 8.06 played by clicking: "${(await page.locator('.gb-podium h1').textContent()).trim()}"; taller than the screen by ${tall}px`)
  await page.waitForTimeout(600)
  await shot('podium')

  // a second game, interrupted by a reload after two questions
  await page.getByRole('button', { name: /Choose another game/ }).click()
  await page.getByRole('link', { name: /Whole chapter mix/ }).last().click() // the last chapter on the page (Chapter 8)
  await page.getByRole('button', { name: /Start the game/ }).click()
  for (let k = 0; k < 2; k++) {
    await page.getByRole('button', { name: 'Show the answer' }).click()
    await page.locator('button.gb-team').first().click()
    await page.locator('.gb-main').click()
    await page.locator('.gb-main:not([disabled])', { hasText: /Next question/ }).click()
  }
  const q3 = await page.locator('.gb-prompt').textContent()
  const totals = (await page.locator('.gb-team .tscore').allTextContents()).map((s) => parseInt(s)).join(',')
  await page.reload({ waitUntil: 'load' })
  const banner = page.getByRole('region', { name: 'Class game in progress' })
  await banner.waitFor()
  await shot('home_banner')
  await banner.getByRole('link', { name: /Carry on/ }).click()
  await page.locator('.gb-prompt').waitFor()
  log(`   after a reload: the home page offers the game, and "Carry on" goes straight back to question 3 (${(await page.locator('.gb-prompt').textContent()) === q3}), totals kept (${(await page.locator('.gb-team .tscore').allTextContents()).map((s) => parseInt(s)).join(',') === totals})`)
  await page.getByRole('button', { name: /Leave game/ }).click()
  await page.getByRole('heading', { name: 'Class games' }).waitFor()
  log(`   leaving the game keeps it for later: ${await page.getByRole('region', { name: 'Class game in progress' }).count()} banner on the games page`)
  await ctx.close()
}
await browser.close()
server.close()
log(`other sites the page asks for: ${[...hosts].join(', ') || 'none'}`)
console.log(errs.length ? `\nPAGE ERRORS (${errs.length}):\n` + [...new Set(errs)].slice(0, 20).join('\n') : '\nno page errors')
if (errs.length) process.exit(1)
