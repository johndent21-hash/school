// (preview dev server on :3102) The science section: the science page, each topic page, and every lesson's Learn tab
// and practice set (answered correctly through the test hook, so every answer must be marked right), with no page
// errors; then the phone layout of the pages with diagrams, checked for sideways spill. SHOTS=folder for screenshots.
import { chromium } from 'playwright'
const base = process.env.BASE ?? 'http://127.0.0.1:3102'
const shots = process.env.SHOTS
const browser = await chromium.launch()
const problems = []
const errs = []
async function page(w, h) {
  const p = await browser.newPage({ viewport: { width: w, height: h } })
  p.on('pageerror', (e) => errs.push(`${w}px ${e.message.slice(0, 200)}`))
  p.on('dialog', (d) => d.accept())
  return p
}
const spill = (p) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)

// ---- every lesson on a laptop: Learn tab, then the practice set answered correctly
const p = await page(1280, 900)
await p.goto(`${base}/science`, { waitUntil: 'networkidle' })
const ids = await p.locator('a[href*="/lesson?id=sci"][href*="tab=practice"]').evaluateAll((as) => as.map((a) => new URL(a.href).searchParams.get('id')))
console.log(`science page: ${ids.length} lessons listed; subject switch shows ${await p.locator('.subject-switch a.active').textContent()}`)
if (shots) await p.screenshot({ path: `${shots}/science.png`, fullPage: true })
let answered = 0
for (const id of ids) {
  await p.goto(`${base}/lesson?id=${id}&tab=learn`, { waitUntil: 'networkidle' })
  if (!(await p.locator('h1').count())) problems.push(`${id}: no lesson heading`)
  if (await p.locator('a[href*="/test?"]').count()) problems.push(`${id}: links to a topic test`)
  await p.goto(`${base}/lesson?id=${id}&tab=practice`, { waitUntil: 'networkidle' })
  await p.getByRole('button', { name: 'Start practice set' }).click({ timeout: 20000 })
  const count = await p.locator('.progress-dots span').count()
  if (count !== 10) problems.push(`${id}: practice set has ${count} questions`)
  for (let k = 0; k < count; k++) {
    const ans = await p.evaluate(() => window.__ans)
    if (ans.startsWith('MC')) await p.locator('.mc-option').nth(Number(ans.slice(2))).click()
    else await p.locator('.answer-input').first().fill(ans)
    await p.getByRole('button', { name: 'Check' }).click()
    const fb = p.locator('.feedback.good, .feedback.bad').first()
    await fb.waitFor({ timeout: 5000 })
    if (!(await fb.getAttribute('class')).includes('good')) problems.push(`${id} Q${k + 1}: the right answer [${ans}] was not marked right: ${(await fb.textContent()).slice(0, 80)}`)
    answered++
    await p.getByRole('button', { name: /Next question|See my results/ }).click()
  }
  const score = (await p.locator('.q-card p').first().textContent()).replace(/\s+/g, ' ')
  if (!score.startsWith(`${count} / ${count}`)) problems.push(`${id}: final score ${score}`)
}
console.log(`practice: ${ids.length} sets, ${answered} questions answered`)
await p.close()

// ---- phone: the science page, a topic page, lessons with diagrams (Learn and a practice question)
const ph = await page(390, 844)
for (const path of ['/science', '/topic?id=sci7-solutions-mixtures', '/lesson?id=sci7-particles&tab=learn', '/lesson?id=sci7-heating-curve&tab=learn', '/lesson?id=sci7-shells&tab=learn', '/lesson?id=sci7-classify&tab=learn', '/lesson?id=sci7-solubility&tab=learn', '/lesson?id=sci7-symbols&tab=learn', '/home']) {
  await ph.goto(`${base}${path}`, { waitUntil: 'networkidle' })
  await ph.waitForTimeout(400)
  const s = await spill(ph)
  if (s > 1) problems.push(`phone ${path}: spills ${s}px sideways`)
  if (shots) await ph.screenshot({ path: `${shots}/phone${path.replace(/[/?=&]/g, '_')}.png`, fullPage: true })
}
for (const id of ['sci7-heating-curve', 'sci7-classify', 'sci7-shells']) {
  await ph.goto(`${base}/lesson?id=${id}&tab=practice`, { waitUntil: 'networkidle' })
  await ph.getByRole('button', { name: 'Start practice set' }).click()
  for (let k = 0; k < 10; k++) {
    const s = await spill(ph)
    if (s > 1) problems.push(`phone ${id} Q${k + 1}: spills ${s}px sideways`)
    if (shots && k < 2) await ph.screenshot({ path: `${shots}/phone_${id}_q${k + 1}.png`, fullPage: true })
    const ans = await ph.evaluate(() => window.__ans)
    if (ans.startsWith('MC')) await ph.locator('.mc-option').nth(Number(ans.slice(2))).click()
    else await ph.locator('.answer-input').first().fill(ans)
    await ph.getByRole('button', { name: 'Check' }).click()
    await ph.getByRole('button', { name: /Next question|See my results/ }).click()
  }
}
// the switch takes you between subjects
await ph.goto(`${base}/lesson?id=sci7-density&tab=learn`, { waitUntil: 'networkidle' })
const active = await ph.locator('.subject-switch a.active').textContent()
await ph.locator('.subject-switch a', { hasText: 'Maths' }).click()
await ph.waitForURL(/\/home/)
console.log(`switch: on a science lesson it shows ${active}; tapping Maths goes to ${new URL(ph.url()).pathname}`)
await ph.close()

console.log(errs.length ? `PAGE ERRORS\n${errs.slice(0, 10).join('\n')}` : 'no page errors')
console.log(problems.length ? `PROBLEMS ${problems.length}\n${problems.filter((x) => !x.includes('topic test')).concat(problems.filter((x) => x.includes('topic test')).slice(0, 2)).join('\n')}` : 'no problems')
await browser.close()
