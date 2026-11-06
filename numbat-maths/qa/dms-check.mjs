// Browser check of angles in degrees and minutes (NCM 9 Chapter 4): on an iPad the keypad has ° and ′ keys and an
// answer tapped in with them is marked right; on a laptop "36 52" typed with spaces is marked right; a decimal
// angle of the right size gets a hint and isn't counted. Usage: node qa/dms-check.mjs (dev server on :3100)
import { chromium } from 'playwright'

const base = process.env.BASE ?? 'http://127.0.0.1:3100'
const b = await chromium.launch()
const results = []
const ok = (name, pass, detail = '') => results.push(`${pass ? 'ok  ' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`)
const errors = []

/** answer correctly until a degrees-and-minutes question comes up (the answer text has ′) */
async function findDms(page) {
  for (let k = 0; k < 60; k++) {
    await page.waitForTimeout(100)
    const ans = await page.evaluate(() => window.__ans)
    if (ans.includes('′')) return ans
    if (ans.startsWith('MC')) await page.locator('.mc-option').nth(Number(ans.slice(2))).click()
    else await page.locator('.answer-input').first().fill(ans)
    await page.getByRole('button', { name: 'Check', exact: true }).and(page.locator('.btn-primary')).click()
    const next = page.getByRole('button', { name: /Next question|See my results/ })
    const last = /See my results/.test(await next.innerText())
    await next.click()
    if (last) {
      await page.goto(`${base}/lesson?id=y9-trg-calc&tab=practice`, { waitUntil: 'networkidle' })
      await page.getByRole('button', { name: 'Start practice set' }).click()
    }
  }
  return null
}
async function start(page) {
  await page.goto(`${base}/lesson?id=y9-trg-calc&tab=practice`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Start practice set' }).click()
}

// ---------- iPad: tap the answer in with the keypad
{
  const ctx = await b.newContext({ viewport: { width: 1180, height: 820 }, hasTouch: true, isMobile: true })
  const page = await ctx.newPage()
  page.on('pageerror', (e) => errors.push(e.message))
  await start(page)
  const ans = await findDms(page)
  ok('a degrees-and-minutes question came up', !!ans, ans ?? '')
  if (ans) {
    const keys = await page.locator('.mathpad .pad-key').allInnerTexts()
    ok('keypad has ° and ′ keys', keys.includes('°') && keys.includes('′'), keys.join(' '))
    ok('placeholder shows the form', /°.*′/.test((await page.locator('.answer-input').getAttribute('placeholder')) ?? ''))
    for (const ch of ans) {
      const key = page.locator('.mathpad .pad-key', { hasText: new RegExp(`^${ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }).first()
      await key.click()
    }
    const typed = await page.locator('.answer-input').inputValue()
    ok('keypad typed the angle', typed === ans, `${typed} vs ${ans}`)
    await page.getByRole('button', { name: 'Check', exact: true }).and(page.locator('.btn-primary')).click()
    await page.waitForTimeout(200)
    const fb = (await page.locator('.feedback').first().innerText().catch(() => '')).slice(0, 60)
    ok('tapped angle is marked right', /correct|right|well done|great|nice|spot on|excellent|perfect/i.test(fb), fb)
    await page.screenshot({ path: '/tmp/claude-0/shots/dms-ipad.png' })
  }
  await ctx.close()
}

// ---------- laptop: type "36 52" style, and a decimal of the right size
{
  const ctx = await b.newContext({ viewport: { width: 1366, height: 768 } })
  const page = await ctx.newPage()
  page.on('pageerror', (e) => errors.push(e.message))
  await start(page)
  const ans = await findDms(page)
  if (ans) {
    const [d, m] = ans.replace('′', '').split('°')
    const decimal = (Number(d) + Number(m) / 60).toFixed(2)
    await page.locator('.answer-input').fill(decimal)
    await page.getByRole('button', { name: 'Check', exact: true }).and(page.locator('.btn-primary')).click()
    await page.waitForTimeout(200)
    const hint = (await page.locator('.q-side').innerText()).replace(/\s+/g, ' ')
    ok('a decimal of the right size gets a hint, not a mark', /degrees and minutes/.test(hint) && !(await page.getByRole('button', { name: /Next question/ }).count()), hint.slice(0, 120))
    await page.locator('.answer-input').fill(`${d} ${m}`)
    await page.getByRole('button', { name: 'Check', exact: true }).and(page.locator('.btn-primary')).click()
    await page.waitForTimeout(200)
    const fb = (await page.locator('.feedback').first().innerText().catch(() => '')).slice(0, 60)
    ok(`"${d} ${m}" typed with a space is marked right`, /correct|right|well done|great|nice|spot on|excellent|perfect/i.test(fb), fb)
  } else ok('a degrees-and-minutes question came up on the laptop', false)
  await ctx.close()
}

await b.close()
console.log(results.join('\n'))
console.log('page errors:', errors.length ? errors.join(' | ') : 'none')
process.exit(results.some((r) => r.startsWith('FAIL')) || errors.length ? 1 : 0)
