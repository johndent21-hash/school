import { chromium } from 'playwright'
const base = 'http://127.0.0.1:3100'
const skill = process.argv[2] || 'y7-int-addsub'
const topic = process.argv[3] || 'y7-integers'
const W = Number(process.env.W || 1280)
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: W, height: 900 } })
const page = await ctx.newPage()
const errors = []
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 300)) })
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message.slice(0, 300)))
page.on('dialog', (d) => d.accept())
const shot = (n) => page.screenshot({ path: `/tmp/claude-0/shots/${n}.png`, fullPage: true })

function wrongFor(ans) {
  if (ans.startsWith('(')) return '(99, 98)'
  if (/^\d+ : \d+/.test(ans)) return '97 : 89'
  if (ans.includes('× 10^')) return '9.9 × 10^9'
  if (/\^/.test(ans) && /×/.test(ans)) return '3^7'
  if (ans.includes(',') || ans.startsWith('±')) return '987654, -987654'
  if (/^[a-z ]+$/i.test(ans) && !/^[a-z]$/.test(ans)) return 'zzz'
  return '987654'
}
async function answer(ans, right) {
  if (ans.startsWith('MC')) {
    const idx = Number(ans.slice(2))
    const opts = page.locator('.mc-option:not([disabled])')
    const n = await opts.count()
    if (right) await page.locator('.mc-option').nth(idx).click()
    else {
      for (let k = 0; k < n; k++) { const o = opts.nth(k); const all = page.locator('.mc-option'); /* pick first enabled that's not correct */ }
      const allN = await page.locator('.mc-option').count()
      for (let k = 0; k < allN; k++) { if (k !== idx && await page.locator('.mc-option').nth(k).isEnabled()) { await page.locator('.mc-option').nth(k).click(); break } }
    }
  } else {
    await page.locator('.answer-input').fill(right ? ans : wrongFor(ans))
  }
  await page.getByRole('button', { name: 'Check' }).click()
  await page.waitForTimeout(150)
  return (await page.locator('.feedback').first().textContent().catch(() => '')) ?? ''
}

// Learn tab
await page.goto(`${base}/lesson?id=${skill}&tab=learn`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)
await page.getByRole('button', { name: /Show the first step/ }).click()
await page.getByRole('button', { name: /Show all steps/ }).click().catch(() => {})
await page.waitForTimeout(300)
await shot(`learn_${skill}_W${W}`)

// Practice set
await page.goto(`${base}/lesson?id=${skill}&tab=practice`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
await page.getByRole('button', { name: 'Start practice set' }).click()
const log = []
for (let k = 0; k < 10; k++) {
  await page.waitForTimeout(200)
  const ans = await page.evaluate(() => window.__ans)
  const mode = k % 3
  let fb
  if (mode === 0) fb = [await answer(ans, true)]
  else if (mode === 1) fb = [await answer(ans, false), await answer(ans, true)]
  else fb = [await answer(ans, false), await answer(ans, false)]
  if (k === 1) await shot(`practice_q2_${skill}_W${W}`)
  if (k === 2) await shot(`practice_q3_reveal_${skill}_W${W}`)
  log.push(`Q${k + 1} [${ans}] ${fb.map((f) => f.trim().slice(0, 70)).join(' / ')}`)
  await page.getByRole('button', { name: /Next question|See my results/ }).click()
}
await page.waitForTimeout(800)
await shot(`practice_results_${skill}_W${W}`)
const score = await page.locator('.q-card p').first().textContent()
console.log(log.join('\n'))
console.log('RESULT', score?.replace(/\s+/g, ' '))

// Topic test
await page.goto(`${base}/test?id=${topic}`, { waitUntil: 'networkidle' })
await page.waitForTimeout(800)
await page.getByRole('button', { name: 'Start the test' }).click()
for (let k = 0; k < 10; k++) {
  await page.waitForTimeout(150)
  const ans = await page.evaluate(() => window.__ans)
  const right = k % 2 === 0
  if (ans.startsWith('MC')) {
    const idx = Number(ans.slice(2))
    await page.locator('.mc-option').nth(right ? idx : (idx + 1) % (await page.locator('.mc-option').count())).click()
  } else await page.locator('.answer-input').fill(right ? ans : wrongFor(ans))
  const btn = page.getByRole('button', { name: /^(Next|Finish test)$/ })
  await btn.click()
  await page.waitForTimeout(150)
  if ((await page.locator('.feedback.info').count()) > 0) { console.log('test warn Q' + (k + 1), ans); await btn.click() }
}
await page.waitForTimeout(1000)
await shot(`test_results_${topic}_W${W}`)
console.log('TEST', (await page.locator('.q-card p').nth(1).textContent())?.replace(/\s+/g, ' '))
await page.goto(`${base}/topic?id=${topic}`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
await shot(`topic_after_${topic}_W${W}`)
console.log('ERRORS', errors.join(' || ') || 'none')
await browser.close()
