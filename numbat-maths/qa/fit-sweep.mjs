// Checks that everything needed to answer fits on the screen without scrolling, for every question of
// every skill's practice set: the question, diagram, answer box (or choices), keypad (touch screens) and
// Check button; with the calculator open on calculator questions; and the feedback and Next button after
// answering. Usage: node qa/fit-sweep.mjs <laptop|chromebook|ipad|ipadair> [ids.json ...]
import { chromium } from 'playwright'
import fs from 'node:fs'
const SCREENS = {
  laptop: { viewport: { width: 1366, height: 625 }, touch: false }, // 1366×768 laptop after the browser's bars and taskbar
  chromebook: { viewport: { width: 1280, height: 665 }, touch: false }, // 1280×800 Chromebook
  ipad: { viewport: { width: 1024, height: 690 }, touch: true }, // 9.7–10.2" iPad sideways, Safari bars showing
  ipadair: { viewport: { width: 1180, height: 750 }, touch: true }, // 10.9" iPad Air sideways
}
const name = process.argv[2]
const screen = SCREENS[name]
const files = process.argv.slice(3).length ? process.argv.slice(3) : ['qa/ids-s1.json', 'qa/ids-s2.json', 'qa/ids.json']
const skills = files.flatMap((f) => JSON.parse(fs.readFileSync(f, 'utf8')).flatMap((t) => t.skills))
const base = process.env.BASE ?? 'http://127.0.0.1:3100'
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: screen.viewport, hasTouch: screen.touch, isMobile: screen.touch })
const page = await ctx.newPage()
page.setDefaultTimeout(6000)
const problems = []
let checked = 0

const measure = (stage) =>
  page.evaluate((stage) => {
    const H = innerHeight
    const W = innerWidth
    const bad = []
    const need = (el, what) => {
      if (!el) return
      const r = el.getBoundingClientRect()
      if (r.height === 0) return
      if (r.bottom > H + 1 || r.top < -1 || r.right > W + 1) bad.push(`${what} ${Math.round(r.top)}–${Math.round(r.bottom)} of ${H}`)
    }
    const btn = (re) => [...document.querySelectorAll('button')].find((b) => re.test(b.textContent) && b.offsetParent)
    const card = document.querySelector('.q-card')
    need(card?.querySelector('.q-prompt'), 'question')
    need(card?.querySelector('.dg, .diagram, svg.dg'), 'diagram')
    if (stage === 'before') {
      need(card?.querySelector('.answer-row'), 'answer box')
      need(card?.querySelector('.mc-options'), 'choices')
      need(card?.querySelector('.mathpad'), 'keypad')
      need(btn(/^\s*Check\s*$/), 'Check')
    }
    if (stage === 'calc') {
      need(card?.querySelector('.calc'), 'calculator')
      need(card?.querySelector('.answer-row'), 'answer box')
      need(btn(/^\s*Check\s*$/), 'Check')
    }
    if (stage === 'after') {
      need(card?.querySelector('.feedback'), 'feedback')
      need(btn(/Next question|See my results/), 'Next')
    }
    return { bad, scrollY: scrollY, prompt: card?.querySelector('.q-prompt')?.textContent?.slice(0, 80) }
  }, stage)

for (const skill of skills) {
  try {
    await page.goto(`${base}/lesson?id=${skill}&tab=practice`, { waitUntil: 'networkidle' })
    // clear any saved place so each run starts a fresh set
    await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('numbat.resume')).forEach((k) => localStorage.removeItem(k)))
    await page.reload({ waitUntil: 'networkidle' })
    await page.getByRole('button', { name: 'Start practice set' }).click()
    await page.waitForTimeout(150)
    const n = await page.locator('.progress-dots span').count()
    for (let k = 0; k < n; k++) {
      const level = (await page.locator('.level-pill').first().textContent()) ?? ''
      const b = await measure('before')
      checked++
      if (b.bad.length || b.scrollY > 1) problems.push({ skill, q: k + 1, level, stage: 'answering', bad: b.bad, scrollY: b.scrollY, prompt: b.prompt })
      const calcBtn = page.locator('.q-card button[title="Show the calculator"]')
      if (await calcBtn.count()) {
        await calcBtn.click()
        const c = await measure('calc')
        if (c.bad.length) problems.push({ skill, q: k + 1, level, stage: 'calculator', bad: c.bad, prompt: c.prompt })
        await page.locator('.q-card button[title="Hide the calculator"]').click()
      }
      const ans = await page.evaluate(() => window.__ans)
      if (ans.startsWith('MC')) await page.locator('.mc-option').nth(Number(ans.slice(2))).click()
      else await page.locator('.answer-input').fill(ans)
      await page.locator('.q-side button', { hasText: /^\s*Check\s*$/ }).last().click()
      await page.waitForTimeout(60)
      const a = await measure('after')
      if (a.bad.length) problems.push({ skill, q: k + 1, level, stage: 'after answering', bad: a.bad, prompt: a.prompt })
      if (k < n - 1) await page.getByRole('button', { name: /Next question/ }).click()
    }
  } catch (e) {
    problems.push({ skill, error: String(e).slice(0, 160) })
  }
}
fs.writeFileSync(`/tmp/claude-0/fit-${name}.json`, JSON.stringify({ screen: name, checked, problems }, null, 1))
console.log(`${name}: ${checked} questions checked, ${problems.length} problems`)
await browser.close()
