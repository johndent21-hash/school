// Class games: the games page, the set-up page and a whole game played through on the board, at the sizes
// teachers present on (a 1366 × 768 laptop on a projector, a full-HD panel, an iPad) plus a phone.
// Checks: no page errors, nothing needs scrolling while a question is up on a landscape screen, keys work,
// a game carries on after a refresh, and every game in the list starts.
// Dev harness in preview mode: VITE_PREVIEW_ONLY=1 npx vite dev --port 3102   (from harness/)
// Usage: node qa/game-check.mjs            SHOTS=/some/folder to keep screenshots; ONLY=ncm7-2 to play only some games;
//        SPEED=1 speed rounds (a team answers on every question); CALC=1 calculators allowed where offered
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const base = process.env.BASE ?? 'http://127.0.0.1:3102'
const shots = process.env.SHOTS ?? '/tmp/claude-0/shots'
mkdirSync(shots, { recursive: true })
const browser = await chromium.launch()
const errs = []
const out = []
const log = (x) => {
  out.push(x)
  console.log(x)
}
const shot = (page, name, full = false) => page.screenshot({ path: `${shots}/${name}.png`, fullPage: full })

async function newPage(viewport, opts = {}) {
  const ctx = await browser.newContext({ viewport, ...opts })
  const page = await ctx.newPage()
  page.setDefaultTimeout(8000)
  const tag = `${viewport.width}x${viewport.height}`
  page.on('pageerror', (e) => errs.push(`${tag} ${e.message}`))
  page.on('console', (m) => m.type() === 'error' && errs.push(`${tag} console ${m.text().slice(0, 200)}`))
  return page
}

/** How far the page is taller than the screen (0 = everything fits). */
const overflow = (page) => page.evaluate(() => Math.max(0, document.documentElement.scrollHeight - window.innerHeight))
/** Any element inside the stage that is wider than the stage (text or diagrams spilling out). */
const spill = (page) =>
  page.evaluate(() => {
    const stage = document.querySelector('.gb-stage')
    if (!stage) return 0
    const r = stage.getBoundingClientRect()
    let worst = 0
    for (const el of stage.querySelectorAll('*')) {
      const b = el.getBoundingClientRect()
      if (b.width === 0) continue
      worst = Math.max(worst, b.right - r.right, r.left - b.left)
    }
    return Math.round(worst)
  })

/** Plays one whole game with the mouse. marks(k) says which teams to tick on question k. */
async function playGame(page, tag, { marks, shootEvery = 99, checkFit = true }) {
  const total = Number((await page.locator('.gb-count').textContent()).match(/of (\d+)/)[1])
  let worstFit = 0
  let worstSpill = 0
  let smallest = 9999
  for (let k = 0; k < total; k++) {
    await page.locator('.gb-prompt').waitFor()
    if (checkFit) {
      const o = await overflow(page)
      if (o > worstFit) log(`   too tall by ${o}px (${tag}, question ${k + 1}): ${(await page.locator('.gb-prompt').textContent()).slice(0, 90)}`)
      worstFit = Math.max(worstFit, o)
      worstSpill = Math.max(worstSpill, await spill(page))
      // how tall the diagram is drawn: it must stay big enough to read from the back of the room
      const dg = page.locator('.gb-diagram .dg')
      if (await dg.count()) smallest = Math.min(smallest, Math.round((await dg.boundingBox()).height))
    }
    if (k % shootEvery === 0) await shot(page, `${tag}_q${k + 1}_ask`)
    // (only in a speed round: there the teams are buttons while the question is up)
    if (process.env.SPEED && (await page.locator('button.gb-team').count())) {
      // a team puts its hand up: the answer banner must fit too; then it is wrong, so the answer is shown as usual
      await page.keyboard.press('1')
      await page.locator('.gb-buzz').waitFor()
      if (checkFit) {
        const o = await overflow(page)
        if (o > worstFit) log(`   too tall by ${o}px with a team answering (${tag}, question ${k + 1})`)
        worstFit = Math.max(worstFit, o)
        worstSpill = Math.max(worstSpill, await spill(page))
      }
      if (k % shootEvery === 0) await shot(page, `${tag}_q${k + 1}_buzz`)
      await page.keyboard.press('n')
    }
    await page.getByRole('button', { name: 'Show the answer' }).click()
    await page.locator('.gb-opt.right').waitFor()
    if (checkFit) {
      worstFit = Math.max(worstFit, await overflow(page))
      worstSpill = Math.max(worstSpill, await spill(page))
      const dg = page.locator('.gb-diagram .dg')
      if (await dg.count()) {
        const hgt = Math.round((await dg.boundingBox()).height)
        if (hgt < 150) log(`   small diagram, ${hgt}px (${tag}, answer showing): ${(await page.locator('.gb-prompt').textContent()).slice(0, 70)}`)
        smallest = Math.min(smallest, hgt)
      }
    }
    const teams = page.locator('button.gb-team')
    for (const t of marks(k, await teams.count())) await teams.nth(t).click()
    if (k % shootEvery === 0) await shot(page, `${tag}_q${k + 1}_reveal`)
    await page.locator('.gb-main').click()
    // let the finds turn over, or skip the wait
    const showAll = page.getByRole('button', { name: 'Show all' })
    if (await showAll.count()) await showAll.click()
    await page.locator('.gb-main', { hasText: /Next question|See the winners/ }).waitFor()
    if (checkFit) worstFit = Math.max(worstFit, await overflow(page))
    if (k % shootEvery === 0) {
      await page.waitForTimeout(600) // let the cards finish popping in
      await shot(page, `${tag}_q${k + 1}_dug`)
    }
    await page.locator('.gb-main').click()
  }
  await page.locator('.gb-podium').waitFor()
  return { total, worstFit, worstSpill, smallest }
}

// ---------------------------------------------------------------- 1. laptop on a projector: the whole flow
{
  const page = await newPage({ width: 1366, height: 660 })
  await page.goto(`${base}/`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(300)
  log(`landing: class-games section ${await page.locator('#class-games').count()}, header link ${await page.locator('header a[href="/games"]').count()}`)
  await shot(page, 'landing', true)
  await page.locator('#class-games').locator('xpath=ancestor::section').getByRole('link', { name: /Choose a game/ }).click()
  await page.waitForURL('**/games')
  await page.waitForTimeout(300)
  const rows = await page.locator('section[aria-labelledby="ncm7-ch8"] ol > li .font-display').allTextContents()
  log(`games page: ${rows.length} exercises: ${rows.map((s) => s.trim()).join(' | ')}`)
  // chapters start folded; open Chapter 8
  const shownBefore = await page.getByRole('link', { name: /^Play NCM 7 Exercise/ }).count()
  await page.locator('#ncm7-ch8-toggle').click()
  log(`   folded chapters: ${shownBefore} exercises showing, then ${await page.getByRole('link', { name: /^Play NCM 7 Exercise/ }).count()} once Chapter 8 is opened (expanded ${await page.locator('#ncm7-ch8-toggle').getAttribute('aria-expanded')})`)
  await shot(page, 'games', true)

  await page.getByRole('link', { name: /^Play NCM 7 Exercise 8\.01/ }).click()
  await page.waitForURL('**/game?id=*')
  await page.waitForTimeout(300)
  log(`setup: title "${(await page.locator('h1').textContent()).trim()}", teams ${await page.locator('.gs-team').count()}`)
  await page.locator('details summary').click()
  log(`setup preview: ${await page.locator('.gs-preview').count()} questions, each with one right option: ${(await page.locator('.gs-preview').count()) === (await page.locator('.gs-preview-options li.right').count())}`)
  await shot(page, 'setup', true)
  await page.locator('details summary').click()
  // 5 teams, 8 questions, 10 seconds
  await page.getByRole('button', { name: 'One more team' }).click()
  await page.locator('.gs-team input').first().fill('Table 1')
  await page.getByRole('radio', { name: '8', exact: true }).click()
  await page.getByRole('radio', { name: '10 s' }).click()
  await page.getByRole('button', { name: /Start the game/ }).click()
  await page.locator('.gb').waitFor()
  log(`board: ${await page.locator('.gb-team').count()} teams, first "${(await page.locator('.gb-team .tname').first().textContent()).trim()}", ${(await page.locator('.gb-count').textContent()).replace(/\s+/g, ' ').trim()}, header hidden ${await page.locator('header.site-header').isHidden()}`)
  const r = await playGame(page, 'laptop', { marks: (k, n) => Array.from({ length: n }, (_, t) => t).filter((t) => (k + t) % 3 !== 0), shootEvery: 3 })
  log(`laptop 1366x660: ${r.total} questions played; taller than the screen by ${r.worstFit}px; spill ${r.worstSpill}px`)
  log(`podium: ${(await page.locator('.gb-podium h1').textContent()).trim()} | ${(await page.locator('.gb-rank').allTextContents()).map((s) => s.replace(/\s+/g, ' ').trim()).join(' | ')}`)
  await shot(page, 'laptop_podium', true)
  await page.getByRole('button', { name: /Play again/ }).click()
  await page.locator('.gb-prompt').waitFor()
  log(`play again: ${(await page.locator('.gb-count').textContent()).replace(/\s+/g, ' ').trim()}, totals ${(await page.locator('.gb-team .tscore').allTextContents()).map((s) => parseInt(s)).join(',')}`)
  await page.context().close()
}

// ---------------------------------------------------------------- 2. keys, the timer, undo and carrying on after a refresh
{
  const page = await newPage({ width: 1280, height: 720 })
  await page.goto(`${base}/game?id=ncm7-8.01`, { waitUntil: 'networkidle' })
  await page.getByRole('radio', { name: '5', exact: true }).click()
  await page.getByRole('radio', { name: '10 s' }).click()
  await page.getByRole('button', { name: /Start the game/ }).click()
  await page.locator('.gb-prompt').waitFor()
  const q1 = await page.locator('.gb-prompt').textContent()
  await page.waitForTimeout(2300)
  const secs = Number(await page.locator('.gb-secs').textContent())
  await page.keyboard.press('p')
  await page.waitForTimeout(1400)
  const paused = Number(await page.locator('.gb-secs').textContent())
  log(`timer: after 2.3 s shows ${secs} (from 10); paused with P stays at ${paused}`)
  await page.locator('body').click({ position: { x: 5, y: 5 } })
  await page.keyboard.press('Space')
  await page.locator('.gb-opt.right').waitFor()
  await page.keyboard.press('1')
  await page.keyboard.press('3')
  log(`keys: Space showed the answer; 1 and 3 ticked ${await page.locator('button.gb-team.is-on').count()} teams`)
  await page.keyboard.press('a')
  const all = await page.locator('button.gb-team.is-on').count()
  await page.keyboard.press('a')
  log(`keys: A ticked ${all}, A again left ${await page.locator('button.gb-team.is-on').count()}`)
  await page.keyboard.press('2')
  await page.keyboard.press('Enter')
  await page.locator('.gb-dig').waitFor()
  await page.keyboard.press('Space') // show all
  await page.waitForTimeout(200)
  const after = (await page.locator('.gb-team .tscore').allTextContents()).map((s) => parseInt(s))
  log(`dig: totals ${after.join(',')} (only team 2 dug: ${after[1] > 0 && after.filter((x) => x > 0).length === 1})`)
  await shot(page, 'keys_dug')
  await page.getByRole('button', { name: /Undo this dig/ }).click()
  await page.locator('.gb-opt.right').waitFor()
  log(`undo: totals ${(await page.locator('.gb-team .tscore').allTextContents()).map((s) => parseInt(s)).join(',')}, team 2 still ticked ${await page.locator('button.gb-team').nth(1).getAttribute('aria-pressed')}`)
  await page.locator('.gb-main').click()
  await page.getByRole('button', { name: 'Show all' }).click().catch(() => {})
  await page.locator('.gb-main', { hasText: /Next question/ }).click()
  await page.locator('.gb-prompt').waitFor()
  const q2 = await page.locator('.gb-prompt').textContent()
  const totalsBefore = (await page.locator('.gb-team .tscore').allTextContents()).map((s) => parseInt(s)).join(',')
  // a refresh in the middle of question 2
  await page.reload({ waitUntil: 'networkidle' })
  log(`refresh: set-up page offers to carry on: ${await page.getByRole('button', { name: /Carry on/ }).count()}`)
  await page.getByRole('button', { name: /Carry on/ }).click()
  await page.locator('.gb-prompt').waitFor()
  log(`carry on: same question ${(await page.locator('.gb-prompt').textContent()) === q2 && q2 !== q1}, ${(await page.locator('.gb-count').textContent()).replace(/\s+/g, ' ').trim()}, totals kept ${(await page.locator('.gb-team .tscore').allTextContents()).map((s) => parseInt(s)).join(',') === totalsBefore}`)
  // the home page and the games page offer it too
  await page.goto(`${base}/`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(300)
  log(`home page banner: ${await page.getByRole('region', { name: 'Class game in progress' }).count()}`)
  // time's up
  await page.goto(`${base}/game?id=ncm7-8.01`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /Start again/ }).click()
  await page.getByRole('button', { name: /Start the game/ }).click()
  await page.locator('.gb-timeup').waitFor({ timeout: 14000 })
  log(`time's up: "${(await page.locator('.gb-timeup').textContent()).trim()}", answer still hidden ${(await page.locator('.gb-opt.right').count()) === 0}`)
  await shot(page, 'timeup')
  // finish early
  await page.getByRole('button', { name: /Finish now/ }).click()
  await page.getByRole('button', { name: 'Finish now' }).last().click()
  await page.locator('.gb-podium').waitFor()
  log(`finish now: "${(await page.locator('.gb-podium h1').textContent()).trim()}"`)
  await page.context().close()
}

// ---------------------------------------------------------------- 3. every game starts, and its questions fit the board
for (const [w, h, name] of [
  [1366, 660, 'laptop'],
  [1920, 950, 'fullhd'],
  [1180, 720, 'ipad'],
  [1024, 640, 'small'],
]) {
  const page = await newPage({ width: w, height: h })
  await page.goto(`${base}/games`, { waitUntil: 'networkidle' })
  // ONLY=ncm7-2 plays just the games whose ids start with that (e.g. a newly added chapter)
  // every game in every book (one tab per textbook)
  const found = new Set()
  const tabs = page.getByRole('tab')
  const nTabs = await tabs.count()
  for (let i = 0; i < Math.max(1, nTabs); i++) {
    if (nTabs) await tabs.nth(i).click()
    for (const id of await page.locator('a[href^="/game?id="]').evaluateAll((as) => as.map((a) => new URL(a.href).searchParams.get('id')))) found.add(id)
  }
  const ids = [...found].filter((id) => !process.env.ONLY || id.startsWith(process.env.ONLY))
  let worst = { fit: 0, spill: 0, at: '' }
  let smallest = 9999
  for (const id of ids) {
    await page.goto(`${base}/game?id=${id}`, { waitUntil: 'networkidle' })
    const again = page.getByRole('button', { name: /Start again/ })
    if (await again.count()) await again.click()
    await page.getByRole('radio', { name: '15', exact: true }).click()
    await page.getByRole('radio', { name: 'No timer' }).click()
    // SPEED=1 plays speed rounds; CALC=1 allows calculators where a set has calculator questions
    await page.getByRole('radio', { name: process.env.SPEED ? 'Speed round' : 'Every team answers' }).click()
    const calcRadio = page.getByRole('radio', { name: 'Allowed', exact: true })
    if (process.env.CALC && (await calcRadio.count())) await calcRadio.click()
    await page.getByRole('button', { name: /Start the game/ }).click()
    const r = await playGame(page, `${name}_${id}`, { marks: (k, n) => (k % 4 === 3 ? [] : Array.from({ length: n }, (_, t) => t)), shootEvery: name === 'laptop' ? 5 : 99 })
    if (r.worstFit > worst.fit || r.worstSpill > worst.spill) worst = { fit: Math.max(worst.fit, r.worstFit), spill: Math.max(worst.spill, r.worstSpill), at: id }
    smallest = Math.min(smallest, r.smallest)
  }
  log(`${name} ${w}x${h}: ${ids.length} games played through (15 questions each); worst overflow ${worst.fit}px, worst spill ${worst.spill}px${worst.at ? ` (${worst.at})` : ''}; smallest diagram ${smallest}px tall`)
  await page.context().close()
}

// ---------------------------------------------------------------- 4. dark theme and a phone (a teacher trying it out)
{
  const page = await newPage({ width: 1366, height: 660 }, { colorScheme: 'dark' })
  await page.goto(`${base}/game?id=ncm7-ch8`, { waitUntil: 'networkidle' })
  const again = page.getByRole('button', { name: /Start again/ })
  if (await again.count()) await again.click()
  await page.getByRole('radio', { name: '5', exact: true }).click()
  await page.getByRole('button', { name: /Start the game/ }).click()
  await playGame(page, 'dark', { marks: (k, n) => Array.from({ length: n }, (_, t) => t), shootEvery: 2 })
  await shot(page, 'dark_podium', true)
  await page.context().close()
}
{
  const page = await newPage({ width: 390, height: 844 }, { hasTouch: true, isMobile: true })
  await page.goto(`${base}/games`, { waitUntil: 'networkidle' })
  await shot(page, 'phone_games', true)
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  await page.goto(`${base}/game?id=ncm7-8.01`, { waitUntil: 'networkidle' })
  const again = page.getByRole('button', { name: /Start again/ })
  if (await again.count()) await again.click()
  await shot(page, 'phone_setup', true)
  await page.getByRole('radio', { name: '5', exact: true }).click()
  await page.getByRole('button', { name: /Start the game/ }).click()
  const r = await playGame(page, 'phone', { marks: (k, n) => [k % n], shootEvery: 2, checkFit: false })
  const wide2 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  await shot(page, 'phone_podium', true)
  log(`phone 390x844: ${r.total} questions played; sideways scroll on games page ${wide}px, on the podium ${wide2}px`)
  await page.context().close()
}

await browser.close()
console.log(errs.length ? `\nPAGE ERRORS (${errs.length}):\n` + [...new Set(errs)].slice(0, 20).join('\n') : '\nno page errors')
if (errs.length) process.exit(1)
