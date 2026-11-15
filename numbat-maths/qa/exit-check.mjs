import { chromium } from "playwright"
// (preview dev server on :3102) the teacher's Exit tickets tab with the example class, the student's /exit page (answered and handed
// in), the parent page and the old parent link, at laptop and phone sizes: page errors and sideways spill.
// Usage: node qa/exit-check.mjs [screenshot folder]
const S = process.argv[2] || "/tmp"
;(async () => {
  const b = await chromium.launch()
  const errors = []
  for (const [w, h, tag] of [[1280, 800, 'lap'], [390, 844, 'phone']]) {
    const p = await b.newPage({ viewport: { width: w, height: h } })
    p.on('pageerror', (e) => errors.push(`${tag} ${p.url()}: ${e.message}`))
    p.on('console', (m) => m.type() === 'error' && errors.push(`${tag} console: ${m.text().slice(0, 200)}`))
    for (const [path, name] of [['/teacher-class?id=demo-class&tab=exit', 'exit-tab'], ['/exit', 'exit-student'], ['/parent', 'parent'], ['/join?as=parent', 'join-parent']]) {
      await p.goto('http://127.0.0.1:3102' + path, { waitUntil: 'networkidle' })
      await p.waitForTimeout(800)
      const spill = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      if (spill > 1) errors.push(`${tag} ${name}: page spills ${spill}px sideways`)
      await p.screenshot({ path: `${S}/${tag}-${name}.png`, fullPage: true })
    }
    // answer the example ticket: pick B everywhere, hand in
    await p.goto('http://127.0.0.1:3102/exit', { waitUntil: 'networkidle' })
    for (let k = 0; k < 5; k++) {
      await p.locator('.mc-option').nth(1).click()
      const next = p.getByRole('button', { name: /^Next/ })
      if (await next.count()) await next.click()
    }
    await p.getByRole('button', { name: 'Hand in', exact: true }).click()
    await p.getByRole('button', { name: 'Hand it in' }).click()
    await p.waitForTimeout(300)
    await p.screenshot({ path: `${S}/${tag}-exit-result.png`, fullPage: true })
    const txt = await p.locator('h1').first().innerText()
    if (!/Handed in/.test(txt)) errors.push(`${tag}: hand-in did not show results (${txt})`)
    await p.close()
  }
  console.log(errors.length ? errors.join('\n') : 'no errors')
  await b.close()
})()
