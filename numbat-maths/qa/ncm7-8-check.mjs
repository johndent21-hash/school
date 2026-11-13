// Year 7 Area and volume following NCM 7 Chapter 8, in the running app: the topic page, lesson pages and worked
// examples, the 18-question topic test answered with the right answers, and every skill practised on a
// phone-sized screen (answers accepted, nothing wider than the screen, diagrams fully visible).
// Dev harness on :3102 (BASE to change). Screenshots under SHOTS (default /tmp/claude-0/shots).
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
const base = process.env.BASE ?? 'http://127.0.0.1:3102'
const shots = process.env.SHOTS ?? '/tmp/claude-0/shots'
mkdirSync(shots, { recursive: true })
const browser = await chromium.launch()
const errs = []
const log = (x) => console.log(x)
const SKILLS = ['y7-ms-metric', 'y7-ms-perimeter', 'y7-ms-circumference', 'y7-ms-areaunits', 'y7-ms-rect', 'y7-ms-triangle', 'y7-ms-parallelogram', 'y7-ms-composite', 'y7-ms-prisms', 'y7-ms-volunits', 'y7-ms-rectprism', 'y7-ms-prismvol', 'y7-ms-capacity', 'y7-ms-powerplus']

const answer = async (page) => {
  const ans = await page.evaluate(() => window.__ans)
  if (ans.startsWith('MC')) await page.locator('.mc-option').nth(Number(ans.slice(2))).click()
  else await page.locator('.answer-input').fill(ans)
  return ans
}

// ---- desktop
{
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage()
  page.setDefaultTimeout(8000)
  page.on('pageerror', (e) => errs.push('desktop ' + e.message))
  page.on('console', (m) => m.type() === 'error' && errs.push('desktop console ' + m.text().slice(0, 160)))
  await page.goto(`${base}/topic?id=y7-area-volume`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  const skills = await page.locator('ol > li .font-display').allTextContents()
  const chips = await page.locator('.chip-book').allTextContents()
  log(`topic: ${skills.length} skills: ${skills.map((s) => s.trim()).join(' | ')}`)
  log(`chips: ${chips.join(' | ')}; extension=${await page.locator('.chip-ext').count()} extra=${await page.getByText('Extra practice (not in the textbook)').count()}`)
  log(`test blurb: ${(await page.locator('#test + p, #test ~ p').first().textContent()).trim()}`)
  await page.screenshot({ path: `${shots}/ncm7_8_topic.png`, fullPage: true })

  // lesson pages: the words, the key points and a worked example with a diagram
  for (const id of ['y7-ms-circumference', 'y7-ms-triangle', 'y7-ms-capacity']) {
    await page.goto(`${base}/lesson?id=${id}&tab=learn`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(300)
    const ex = page.locator('section[aria-label="Worked example"]')
    const hasDiagram = await ex.locator('svg.dg').count()
    for (let k = 0; k < 6; k++) {
      const next = page.getByRole('button', { name: /Show the first step|Next step/ })
      if (!(await next.count())) break
      await next.first().click()
      await page.waitForTimeout(80)
    }
    log(`lesson ${id}: chips ${(await page.locator('header .chip').allTextContents()).join(' | ')}; example diagram ${hasDiagram}; key points ${await page.locator('main li').count()}`)
    await page.screenshot({ path: `${shots}/ncm7_8_lesson_${id}.png`, fullPage: true })
  }

  // topic test: 18 questions, all answered correctly
  await page.goto(`${base}/test?id=y7-area-volume`, { waitUntil: 'networkidle' })
  log(`test intro: ${(await page.locator('ul li').first().textContent()).trim()}`)
  await page.getByRole('button', { name: /Start/ }).click()
  await page.waitForTimeout(200)
  const n = await page.locator('.progress-dots button').count()
  for (let k = 0; k < n; k++) {
    await answer(page)
    if (k === 3 || k === 11 || k === 16) await page.screenshot({ path: `${shots}/ncm7_8_test_q${k + 1}.png`, fullPage: true })
    await page.getByRole('button', { name: /^(Next|Finish)/ }).last().click()
    await page.waitForTimeout(120)
  }
  await page.waitForTimeout(500)
  log(`test: ${n} questions; result ${(await page.locator('.q-card p.font-display').first().textContent()).replace(/\s+/g, ' ')}`)
  await page.screenshot({ path: `${shots}/ncm7_8_testresult.png`, fullPage: false })
  await page.context().close()
}

// ---- phone: every skill, a practice set answered with the right answers
{
  const page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, colorScheme: 'dark' })).newPage()
  page.setDefaultTimeout(6000)
  page.on('pageerror', (e) => errs.push('phone ' + e.message))
  page.on('console', (m) => m.type() === 'error' && errs.push('phone console ' + m.text().slice(0, 160)))
  let tried = 0
  let right = 0
  let wide = 0
  let clipped = 0
  const notes = []
  const smallest = { w: 9999, what: '' }
  for (const skill of SKILLS) {
    await page.goto(`${base}/lesson?id=${skill}&tab=practice`, { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: 'Start practice set' }).click()
    const n = await page.locator('.progress-dots span').count()
    let shot = 0
    for (let k = 0; k < n; k++) {
      await page.waitForTimeout(60)
      // nothing wider than the screen, and the whole diagram inside it
      const m = await page.evaluate(() => {
        const svg = document.querySelector('.q-card svg.dg, main svg.dg')
        const r = svg ? svg.getBoundingClientRect() : null
        return { sw: document.documentElement.scrollWidth, vw: window.innerWidth, left: r ? r.left : 0, right: r ? r.right : 0, w: r ? r.width : 0, label: svg ? svg.getAttribute('aria-label') : '' }
      })
      if (m.sw > m.vw + 1) wide++
      if (m.w && (m.left < -0.5 || m.right > m.vw + 0.5)) clipped++
      if (m.w && m.w < smallest.w) Object.assign(smallest, { w: Math.round(m.w), what: `${skill} ${m.label}` })
      if (m.w && shot < 2 && (k === 2 || k === 9 || k === 16)) {
        await page.screenshot({ path: `${shots}/ncm7_8_phone_${skill}_${shot++}.png` })
      }
      await answer(page)
      await page.locator('button.btn-primary.btn-lg', { hasText: 'Check' }).first().click()
      await page.waitForTimeout(90)
      tried++
      if (await page.locator('.feedback.good').count()) right++
      else if (notes.length < 8) notes.push(`${skill} Q${k + 1}: ${((await page.locator('.q-card .feedback, .feedback.bad').first().textContent().catch(() => '')) ?? '').slice(0, 100)}`)
      const next = page.getByRole('button', { name: /Next question|See my results/ })
      if (await next.count()) await next.first().click()
    }
    await page.waitForTimeout(200)
    const summary = (await page.locator('main').textContent()).replace(/\s+/g, ' ').match(/(\d+) (?:out of|of|\/) ?(\d+)/)
    log(`phone ${skill}: ${n} questions; summary ${summary ? summary[0] : '?'}`)
  }
  notes.forEach(log)
  log(`phone totals: ${tried} answered, ${right} marked correct on the spot; pages wider than the screen: ${wide}; diagrams off the screen: ${clipped}; narrowest diagram ${smallest.w}px (${smallest.what})`)
  await page.context().close()
}

log(errs.length ? `ERRORS: ${[...new Set(errs)].join(' | ')}` : 'no page errors')
await browser.close()
