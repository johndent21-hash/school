// Year 7 Integers following NCM 7 Chapter 1: topic page, lesson example, open answers via the keypad,
// the 12-question topic test and the Year 7 calculator keys. Dev harness on :3100 (Years 1–4 on or off).
import { chromium } from 'playwright'
const base = process.env.BASE ?? 'http://127.0.0.1:3100'
const browser = await chromium.launch()
const out = []
const errs = []
const log = (x) => {
  out.push(x)
  console.log(x)
}

// ---- desktop
{
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage()
  page.setDefaultTimeout(8000)
  page.on('pageerror', (e) => errs.push('desktop ' + e.message))
  page.on('console', (m) => m.type() === 'error' && errs.push('desktop console ' + m.text().slice(0, 160)))
  await page.goto(`${base}/topic?id=y7-integers`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(300)
  const skills = await page.locator('ol > li .font-display').allTextContents()
  const chips = await page.locator('.chip-book').allTextContents()
  log(`topic: ${skills.length} skills: ${skills.map((s) => s.trim()).join(' | ')}`)
  log(`chips: ${chips.join(' | ')}; extension=${await page.locator('.chip-ext').count()} extra=${await page.getByText('Extra practice (not in the textbook)').count()}`)
  log(`test blurb: ${(await page.locator('#test + p, #test ~ p').first().textContent()).trim()}`)
  await page.screenshot({ path: '/tmp/claude-0/shots/ncm1_topic.png', fullPage: true })

  // worked example on a number line for 1.04
  await page.goto(`${base}/lesson?id=y7-int-add&tab=learn`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(300)
  log(`lesson 1.04 chips: ${(await page.locator('header .chip').allTextContents()).join(' | ')}; example has number line: ${await page.locator('section[aria-label="Worked example"] svg[aria-label="Number line"]').count()}`)
  await page.getByRole('button', { name: /Show the first step/ }).click()
  await page.getByRole('button', { name: /Next step/ }).click()
  await page.getByRole('button', { name: /Next step/ }).click()
  log(`example answer: ${(await page.locator('section[aria-label="Worked example"] .feedback').textContent()).trim()}`)
  await page.screenshot({ path: '/tmp/claude-0/shots/ncm1_lesson.png', fullPage: true })

  // topic test: 12 questions, answered with the right answers, calculator on question 10 has (−) and x²
  await page.goto(`${base}/test?id=y7-integers`, { waitUntil: 'networkidle' })
  log(`test intro: ${(await page.locator('ul li').first().textContent()).trim()}`)
  await page.getByRole('button', { name: /Start/ }).click()
  await page.waitForTimeout(200)
  const n = await page.locator('.progress-dots button').count()
  let calcKeys = ''
  for (let k = 0; k < n; k++) {
    const ans = await page.evaluate(() => window.__ans)
    if (k === 9) {
      const btn = page.getByRole('button', { name: /^calculator$/i })
      if (await btn.count()) {
        await btn.click()
        calcKeys = (await page.locator('.calc-keys button').allTextContents()).slice(0, 5).join(' ')
        await page.locator('.calc-keys button[aria-label^="sign change"]').click()
        for (const key of ['5', 'x²', '=']) await page.locator('.calc-keys button', { hasText: new RegExp(`^${key}$`) }).first().click()
        calcKeys += ` | (−)5²= ${await page.locator('.calc-out').textContent()}`
      } else calcKeys = 'no calculator button'
    }
    if (ans.startsWith('MC')) await page.locator('.mc-option').nth(Number(ans.slice(2))).click()
    else await page.locator('.answer-input').fill(ans)
    await page.getByRole('button', { name: /^(Next|Finish)/ }).last().click()
    await page.waitForTimeout(120)
  }
  await page.waitForTimeout(400)
  log(`test: ${n} questions; result ${(await page.locator('.q-card p.font-display').first().textContent()).replace(/\s+/g, ' ')}; Q10 calculator: ${calcKeys}`)
  await page.screenshot({ path: '/tmp/claude-0/shots/ncm1_testresult.png', fullPage: false })
  await page.context().close()
}

// ---- phone: open answers typed on the keypad
{
  const page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, colorScheme: 'dark' })).newPage()
  page.setDefaultTimeout(5000)
  page.on('pageerror', (e) => errs.push('phone ' + e.message))
  let tried = 0
  let right = 0
  const notes = []
  for (const skill of ['y7-int-add', 'y7-int-sub', 'y7-int-mul', 'y7-int-div', 'y7-int-orderops', 'y7-int-powerplus']) {
    await page.goto(`${base}/lesson?id=${skill}&tab=practice`, { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: 'Start practice set' }).click()
    const n = await page.locator('.progress-dots span').count()
    for (let k = 0; k < n; k++) {
      const ans = await page.evaluate(() => window.__ans)
      const isOpen = await page.locator('.answer-input').getAttribute('placeholder').then((p) => p === 'e.g. −3, 10' || p === 'Type the calculation').catch(() => false)
      if (ans.startsWith('MC')) await page.locator('.mc-option').nth(Number(ans.slice(2))).click()
      else if (isOpen) {
        tried++
        // type the example on the keypad, key by key
        const t = ans.replace(/-/g, '−').replace(/\*/g, '×').replace(/\//g, '÷')
        let missing = ''
        for (const ch of t) {
          if (ch === ' ') continue
          const ok = await page.evaluate((label) => {
            const b = [...document.querySelectorAll('.mathpad .pad-grid button')].find((x) => x.textContent === label)
            if (b) b.click()
            return !!b
          }, ch)
          if (!ok) missing += ch
        }
        if (missing) notes.push(`${skill}: no key for ${missing}`)
        const typed = await page.locator('.answer-input').inputValue()
        await page.locator('.mathpad .pad-go').click()
        await page.waitForTimeout(100)
        const good = await page.locator('.feedback.good').count()
        if (good) right++
        else notes.push(`${skill}: "${ans}" typed "${typed}" -> ${(await page.locator('.feedback').first().textContent())?.slice(0, 90)}`)
        if (tried === 1) await page.screenshot({ path: '/tmp/claude-0/shots/ncm1_open_phone.png' })
      } else await page.locator('.answer-input').fill(ans)
      if (!isOpen) await page.getByRole('button', { name: 'Check', exact: true }).click().catch(() => {})
      await page.waitForTimeout(80)
      const nextBtn = page.getByRole('button', { name: /Next question|See my results/ })
      if (!(await nextBtn.count())) {
        await page.getByRole('button', { name: 'Show me how' }).click().catch(() => {})
      }
      if (k < n - 1) await page.getByRole('button', { name: /Next question/ }).click().catch(() => {})
    }
  }
  log(`phone open answers typed on the keypad: ${right}/${tried} marked right`)
  notes.slice(0, 5).forEach(log)
  await page.context().close()
}
console.log(out.join('\n'))
console.log('errors:', errs.length ? errs.slice(0, 8) : 'none')
await browser.close()
