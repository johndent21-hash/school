// Browser check of the maths keypad and calculator (dev harness on :3101 with Years 1–4 on).
// Answers questions using only the on-screen keys, on a phone (touch) and a computer.
import { chromium } from 'playwright'
const base = process.env.BASE ?? 'http://127.0.0.1:3100'
const browser = await chromium.launch()
const report = []
const errs = []

async function open(page, skill) {
  await page.goto(`${base}/lesson?id=${skill}&tab=practice`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Start practice set' }).click()
  await page.waitForTimeout(250)
}

// press keypad keys to type text (the text uses the keypad's own characters)
async function typeOnPad(page, text) {
  const keys = await page.locator('.mathpad .pad-grid button').evaluateAll((bs) => bs.map((b) => ({ label: b.textContent, title: b.getAttribute('title') })))
  const map = { '-': '−', '*': '×' }
  let i = 0
  let t = text.replace(/[-*]/g, (c) => map[c])
  const inserts = { '−': '−', '×': '×', '^': 'xⁿ', ', ': ',', ' : ': ':', ' am': 'am', ' pm': 'pm', ' ': 'space', ' × 10^': '×10ⁿ' }
  while (i < t.length) {
    const ch = t[i]
    // multi-character keys first
    const multi = Object.keys(inserts).filter((k) => k.length > 1 && t.startsWith(k, i)).sort((a, b) => b.length - a.length)[0]
    let label = multi ? inserts[multi] : inserts[ch] ?? ch
    let step = multi ? multi.length : 1
    if (!keys.some((k) => k.label === label) && ch === ' ') { i++; continue }
    if (!keys.some((k) => k.label === label)) return `no key for "${label}" in ${JSON.stringify(keys.map((k) => k.label))}`
    await page.locator('.mathpad .pad-grid button', { hasText: new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }).first().click()
    i += step
  }
  return null
}

async function answerSet(page, n, tag) {
  let right = 0, notes = []
  for (let k = 0; k < n; k++) {
    const ans = await page.evaluate(() => window.__ans)
    if (ans.startsWith('MC')) {
      await page.locator('.mc-option').nth(Number(ans.slice(2))).click()
      await page.getByRole('button', { name: 'Check', exact: true }).click()
    } else {
      const problem = await typeOnPad(page, ans)
      if (problem) { notes.push(`${tag} q${k + 1}: ${problem}`); break }
      const typed = await page.locator('.answer-input').inputValue()
      await page.locator('.mathpad .pad-go').click()
      if (k === 0) notes.push(`${tag} first answer "${ans}" typed as "${typed}"`)
    }
    await page.waitForTimeout(120)
    const good = await page.locator('.feedback.good').count()
    if (good) right++
    else notes.push(`${tag} q${k + 1} not marked right: ${(await page.locator('.feedback').first().textContent())?.slice(0, 80)}`)
    const nextBtn = page.getByRole('button', { name: /Next question|See my results/ })
    if (!(await nextBtn.count())) break
    if (k === n - 1) break
    await nextBtn.click()
    await page.waitForTimeout(120)
  }
  return { right, notes }
}

// ---------- phone (touch) ----------
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, colorScheme: 'dark' })
  const page = await ctx.newPage()
  page.on('pageerror', (e) => errs.push('phone ' + e.message))
  page.on('console', (m) => m.type() === 'error' && errs.push('phone console ' + m.text().slice(0, 160)))
  for (const [skill, n] of [['y7-alg-words', 10], ['y1-wn-count', 6], ['y3-gm-gridmap', 10], ['y4-nsm-ampm', 10], ['y4-nsm-ampm', 10], ['y7-frac-mixed', 6], ['y9-eq-quad', 4], ['y7-wn-primes', 5], ['y7-np-coords', 4], ['y7-rat-simplify', 4], ['y9-num-sci', 4], ['y7-alg-like', 6]]) {
    const ok = await page.goto(`${base}/lesson?id=${skill}&tab=practice`, { waitUntil: 'networkidle' }).then(() => page.getByRole('button', { name: 'Start practice set' }).count())
    if (!ok) { report.push(`${skill}: skill not found`); continue }
    await open(page, skill)
    const im = await page.locator('.answer-input').getAttribute('inputmode').catch(() => 'mc')
    const padOpen = await page.locator('.mathpad').count()
    const big = await page.locator('.mathpad-big').count()
    const keyH = padOpen ? await page.locator('.mathpad .pad-digit').first().evaluate((b) => b.getBoundingClientRect().height) : 0
    if (skill === 'y7-alg-words') await page.screenshot({ path: '/tmp/claude-0/shots/kp_phone_y7.png', fullPage: false })
    if (skill === 'y1-wn-count') await page.screenshot({ path: '/tmp/claude-0/shots/kp_phone_y1.png', fullPage: false })
    const r = await answerSet(page, n, skill)
    report.push(`${skill}: inputmode=${im} padOpen=${padOpen} big=${big} keyHeight=${Math.round(keyH)} right ${r.right}/${n}`)
    report.push(...r.notes.slice(0, 4).map((x) => '   ' + x))
  }
  // ABC key switches to the device keyboard and stays switched; Keypad button brings it back
  await open(page, 'y7-alg-words')
  await page.locator('.mathpad .pad-act').first().click()
  const afterAbc = [await page.locator('.mathpad').count(), await page.locator('.answer-input').getAttribute('inputmode')]
  await page.getByRole('button', { name: /Next question/ }).count()
  await page.reload({ waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Start practice set' }).click()
  const remembered = await page.locator('.mathpad').count()
  await page.locator('.pad-toggle').first().click()
  const back = [await page.locator('.mathpad').count(), await page.locator('.answer-input').getAttribute('inputmode')]
  report.push(`ABC key: pad=${afterAbc[0]} inputmode=${afterAbc[1]}; after reload pad=${remembered}; Keypad button: pad=${back[0]} inputmode=${back[1]}`)
  // calculator on a phone (Year 8 circles)
  await open(page, 'y8-len-circ')
  await page.locator('.pad-toggle', { hasText: 'Calculator' }).click().catch(() => page.getByRole('button', { name: /calculator/i }).first().click())
  await page.screenshot({ path: '/tmp/claude-0/shots/kp_phone_calc.png', fullPage: false })
  await ctx.close()
}

// ---------- computer ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await ctx.newPage()
  page.on('pageerror', (e) => errs.push('desktop ' + e.message))
  page.on('console', (m) => m.type() === 'error' && errs.push('desktop console ' + m.text().slice(0, 160)))
  await open(page, 'y9-trg-side')
  const padClosed = await page.locator('.mathpad').count()
  const focused = await page.evaluate(() => document.activeElement?.classList.contains('answer-input'))
  const calcBtn = page.getByRole('button', { name: /calculator/i }).first()
  await calcBtn.click()
  const calcTitle = await page.locator('.calc-head').textContent()
  const press = async (labels) => { for (const l of labels) await page.locator('.calc-keys button', { hasText: new RegExp(`^${l.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }).first().click() }
  await press(['1', '2', '×', 'sin', '3', '5', ')', '='])
  const out1 = await page.locator('.calc-out').textContent()
  await page.locator('.calc').getByRole('button', { name: /in my answer box/ }).click()
  const boxVal = await page.locator('.answer-input').inputValue()
  await press(['AC', '2nd', 'tan⁻¹', '1', ')', '='])
  const out2 = await page.locator('.calc-out').textContent()
  await press(['AC', '5', '÷', '0', '='])
  const out3 = await page.locator('.calc-out').textContent()
  await press(['AC', '√', '9', '+', '1', '6', '='])
  const out4 = await page.locator('.calc-out').textContent()
  await press(['+', '1', '='])
  const out5 = await page.locator('.calc-out').textContent()
  await page.screenshot({ path: '/tmp/claude-0/shots/kp_desktop_calc.png', fullPage: true })
  // typing still works with the keypad closed; keypad opens with its button
  await page.locator('.answer-input').fill('')
  await page.locator('.answer-input').type('4.5')
  const typed = await page.locator('.answer-input').inputValue()
  await page.getByRole('button', { name: /^keypad$/i }).first().click()
  const padOpen = await page.locator('.mathpad').count()
  const im = await page.locator('.answer-input').getAttribute('inputmode')
  report.push(`desktop: pad closed at start=${padClosed === 0} focused=${focused} calc="${calcTitle}" 12×sin(35)=${out1} -> box "${boxVal}"; tan⁻¹(1)=${out2}; 5÷0=${out3}; √(9+16)=${out4}; then +1=${out5}; typed "${typed}"; keypad opened=${padOpen} inputmode=${im}`)
  // Year 7 calculator is basic, Year 7 non-calculator question has no calculator
  await open(page, 'y7-pct-of')
  let found = 0
  for (let k = 0; k < 10 && !found; k++) {
    found = await page.getByRole('button', { name: /calculator/i }).count()
    if (!found) { await page.getByRole('button', { name: 'Show me how' }).click(); await page.getByRole('button', { name: /Next question/ }).click() }
  }
  if (found) {
    await page.getByRole('button', { name: /calculator/i }).first().click()
    report.push(`Year 7 calculator: "${await page.locator('.calc-head').textContent()}" keys=${await page.locator('.calc-keys button').count()} hasSqrt=${await page.locator('.calc-keys button', { hasText: '√' }).count()}`)
  } else report.push('Year 7: no calculator question met in 10')
  // expression preview
  await open(page, 'y7-alg-words')
  await page.locator('.answer-input').fill('x^2 + 3')
  report.push(`reads-as preview: ${await page.locator('text=Reads as').count()} -> ${(await page.locator('p', { hasText: 'Reads as' }).innerHTML().catch(() => '')).slice(0, 120)}`)
  await ctx.close()
}
console.log(report.join('\n'))
console.log('errors:', errs.length ? errs.slice(0, 10) : 'none')
await browser.close()
