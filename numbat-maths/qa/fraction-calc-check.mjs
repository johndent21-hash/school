// Checks the stacked fraction answer boxes and the fraction calculator in a real browser:
// typing fractions into the boxes (keyboard and the on-screen keypad), the fraction and mixed-numeral keys,
// the F⇄D key, and putting a calculator answer into the boxes. Usage: node qa/fraction-calc-check.mjs (dev server on :3100)
import { chromium } from 'playwright'
const base = process.env.BASE ?? 'http://127.0.0.1:3100'
const b = await chromium.launch()
const results = []
const ok = (name, pass, detail = '') => results.push(`${pass ? 'ok  ' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`)
const errors = []

let current = ''
async function startSet(page, skill) {
  current = skill
  await page.goto(`${base}/lesson?id=${skill}&tab=practice`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  await page.getByRole('button', { name: 'Start practice set' }).click()
  await page.waitForTimeout(200)
}
/** answer questions correctly until one matches, then stop on it */
async function seek(page, want, max = 45) {
  for (let k = 0; k < max; k++) {
    await page.waitForTimeout(120)
    if (await want()) return true
    const ans = await page.evaluate(() => window.__ans)
    if (ans.startsWith('MC')) await page.locator('.mc-option').nth(Number(ans.slice(2))).click()
    else await page.locator('.answer-input').first().fill(ans)
    // the main Check button (the keypad, open on touch screens, has its own Check key too)
    await page.getByRole('button', { name: 'Check', exact: true }).and(page.locator('.btn-primary')).click()
    const next = page.getByRole('button', { name: /Next question|See my results/ })
    const last = /See my results/.test(await next.innerText())
    await next.click()
    if (last) await startSet(page, current) // the set ran out: start another one
  }
  return false
}
const outText = (page) => page.locator('.calc-out').innerText()

// ---------- laptop: keyboard typing into the boxes, and the calculator
{
  const ctx = await b.newContext({ viewport: { width: 1366, height: 768 } })
  const page = await ctx.newPage()
  page.on('pageerror', (e) => errors.push(e.message))
  await startSet(page, 'y9-num-fractions')
  ok('fraction question shows stacked boxes', await seek(page, async () => (await page.locator('.frac-answer').count()) > 0))
  const ans = await page.evaluate(() => window.__ans)
  const m = ans.match(/^(?:(\d+) )?(-?\d+)\/(\d+)$/) ?? ans.match(/^(-?\d+)$/)
  if (m && ans.includes('/')) {
    const [, w, n, d] = m
    if (w) {
      if ((await page.locator('.frac-whole').count()) === 0) await page.getByRole('button', { name: 'Mixed numeral' }).click()
      await page.locator('.frac-whole').focus()
      await page.keyboard.type(w + ' ')
    } else await page.locator('.frac-box.answer-input').focus()
    await page.keyboard.type(`${n}/${d}`)
    const shown = await page.evaluate(() => [...document.querySelectorAll('.frac-box')].map((e) => e.value))
    ok('typing w n/d fills the boxes', shown.join('|') === (w ? `${w}|${n}|${d}` : `${n}|${d}`), shown.join('|'))
    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)
    await page.screenshot({ path: '/tmp/claude-0/shots/fracboxes-typed.png' })
    const fb = (await page.locator('.feedback').first().innerText().catch(() => '')).slice(0, 60)
    ok('typed fraction is marked right', /correct|right|well done|great|nice/i.test(fb) || (await page.locator('.frac-box.is-right').count()) > 0, `${ans} → ${fb}`)
    await page.getByRole('button', { name: /Next question|See my results/ }).click()
  } else ok('typing test skipped (answer was a whole number)', true, ans)

  // a Challenge fraction word problem: the calculator has the fraction keys
  const found = await seek(page, async () => (await page.locator('.frac-answer').count()) > 0 && (await page.locator('.q-card button[title="Show the calculator"]').count()) > 0)
  ok('fraction question with the calculator found', found)
  if (found) {
    await page.locator('.q-card button[title="Show the calculator"]').click()
    await page.waitForTimeout(200)
    const key = (title) => page.locator(`.calc .pad-key[title^="${title}"]`).first().click()
    const digit = (dd) => page.locator('.calc .pad-key.pad-digit', { hasText: new RegExp(`^${dd}$`) }).first().click()
    ok('fraction keys are there', (await page.locator('.calc .pad-key[title^="Fraction"]').count()) === 1 && (await page.locator('.calc .pad-key[title^="Mixed numeral"]').count()) === 1 && (await page.locator('.calc .pad-key[title^="Show the answer as"]').count()) === 1)
    // 2/3 + 1/4
    await key('Fraction'); await digit('2'); await key('Next box'); await digit('3')
    ok('a stacked fraction with two boxes appears', (await page.locator('.calc-expr .cfrac .cbox').count()) === 2)
    await page.locator('.calc .pad-key', { hasText: /^\+$/ }).click()
    await key('Fraction'); await digit('1'); await key('Next box'); await digit('4')
    await page.locator('.calc .pad-key', { hasText: /^=$/ }).click()
    await page.waitForTimeout(100)
    ok('2/3 + 1/4 = 11/12 shown as a fraction', (await outText(page)).replace(/\s+/g, '') === '1112', await outText(page))
    await key('Show the answer as')
    ok('F⇄D gives the decimal', (await outText(page)).startsWith('0.9166'), await outText(page))
    await key('Show the answer as')
    ok('F⇄D goes back to the fraction', (await outText(page)).replace(/\s+/g, '') === '1112')
    await page.screenshot({ path: '/tmp/claude-0/shots/fraccalc-laptop.png' })
    // 1½ + ¾ = 9/4 → 2¼ → 2.25, then put 2¼ in the answer box
    await page.locator('.calc .pad-key', { hasText: /^AC$/ }).click()
    await key('Mixed numeral'); await digit('1'); await key('Next box'); await digit('1'); await key('Next box'); await digit('2')
    await page.locator('.calc .pad-key', { hasText: /^\+$/ }).click()
    await key('Fraction'); await digit('3'); await key('Next box'); await digit('4')
    await page.locator('.calc .pad-key', { hasText: /^=$/ }).click()
    await page.waitForTimeout(100)
    ok('1½ + ¾ = 9/4', (await outText(page)).replace(/\s+/g, '') === '94', await outText(page))
    await key('Show the answer as')
    ok('F⇄D gives the mixed numeral 2¼', (await outText(page)).replace(/\s+/g, '') === '214', await outText(page))
    await page.screenshot({ path: '/tmp/claude-0/shots/fraccalc-mixed.png' })
    await page.getByRole('button', { name: /^Put 2 1\/4 in my answer box$/ }).click()
    await page.waitForTimeout(150)
    const boxes = await page.evaluate(() => [...document.querySelectorAll('.frac-box')].map((e) => e.value))
    ok('Put … fills the boxes', boxes.join('|') === '2|1|4', boxes.join('|'))
    await key('Show the answer as')
    ok('F⇄D then gives 2.25', (await outText(page)) === '2.25', await outText(page))
    // backspace into an empty box, and the empty-box message
    await page.locator('.calc .pad-key', { hasText: /^AC$/ }).click()
    await key('Fraction'); await digit('5')
    await page.locator('.calc .pad-key', { hasText: /^=$/ }).click()
    ok('an empty box says so', /Fill in every box/.test(await outText(page)), await outText(page))
  }
  await ctx.close()
}

// ---------- iPad: the on-screen keypad types into the boxes ("/" moves to the bottom box)
{
  const ctx = await b.newContext({ viewport: { width: 1024, height: 690 }, hasTouch: true, isMobile: true })
  const page = await ctx.newPage()
  page.on('pageerror', (e) => errors.push(e.message))
  await startSet(page, 'y9-num-fractions')
  const found = await seek(page, async () => (await page.locator('.frac-answer').count()) > 0 && (await page.evaluate(() => window.__ans)).includes('/') && !(await page.evaluate(() => window.__ans)).includes(' '))
  if (found) {
    const ans = await page.evaluate(() => window.__ans)
    const [n, d] = ans.split('/')
    const tap = (t) => page.locator('.mathpad .pad-key', { hasText: new RegExp(`^${t.replace('/', '\\/')}$`) }).first().click()
    for (const c of n.replace('-', '−')) await tap(c)
    await tap('/')
    for (const c of d) await tap(c)
    const shown = await page.evaluate(() => [...document.querySelectorAll('.frac-box')].map((e) => e.value))
    ok('keypad fills top then bottom', shown.join('|') === `${n.replace('-', '−')}|${d}`, shown.join('|'))
    await page.screenshot({ path: '/tmp/claude-0/shots/fracboxes-ipad.png' })
  } else ok('keypad test: no plain-fraction question found', false)
  await ctx.close()
}
await b.close()
console.log(results.join('\n'))
console.log('page errors:', errors.length ? errors.slice(0, 3) : 'none')
process.exit(results.some((r) => r.startsWith('FAIL')) || errors.length ? 1 : 0)
