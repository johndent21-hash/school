// Renders sample questions (with diagrams) into an HTML page and screenshots it, for a visual check.
// Usage: ONLY=y7-ang K=2 npx tsx tests/preview.ts  -> writes /tmp/claude-preview/<only>.png
import { setSeed } from '../src/lib/maths/rand'
import { answerText } from '../src/lib/maths/check'
import type { Level } from '../src/lib/maths/types'
import { ALL_TOPICS } from '../src/content/index'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

const K = Number(process.env.K ?? 1)
const only = process.env.ONLY ?? ''
const outDir = process.env.OUT ?? '/tmp/claude-0/preview'
mkdirSync(outDir, { recursive: true })
const css = readFileSync(new URL('../src/maths.css', import.meta.url), 'utf8')
let cards = ''
for (const t of ALL_TOPICS)
  for (const s of t.skills) {
    if (!s.id.startsWith(only)) continue
    for (const lvl of [1, 2, 3] as Level[])
      for (let k = 0; k < K; k++) {
        setSeed(1000 + k * 31 + lvl * 7)
        const qn = s.gen(lvl)
        if (!qn.diagram && !process.env.ALL) continue
        const ans = qn.answer.kind === 'mc' ? qn.answer.options[qn.answer.correct] : answerText(qn.answer)
        cards += `<div class="card mx"><div class="meta">${s.id} L${lvl}</div><div>${qn.prompt}</div>${qn.diagram ?? ''}${qn.note ? `<p class="note">${qn.note}</p>` : ''}<div class="ans">⇒ ${ans}</div></div>`
      }
  }
const html = `<!doctype html><meta charset="utf8"><style>
:root{--font-body:Arial,sans-serif;--font-math:'Times New Roman',serif;--foreground:222 40% 16%;--card:0 0% 100%;--primary:172 62% 30%;--accent-2:352 72% 50%;--sun:42 95% 55%;--shape:200 60% 96%;--shape-2:200 50% 90%;--shape-3:200 40% 84%;--grid-line:210 30% 88%;--border:210 20% 80%;--muted:210 30% 95%;--muted-foreground:215 15% 40%}
body{font-family:Arial;margin:12px;display:grid;grid-template-columns:repeat(3,1fr);gap:12px;background:#f3f6f8}
.card{background:#fff;border:1px solid #ccd;border-radius:8px;padding:10px;font-size:14px}.meta{font-size:11px;color:#888}.ans{color:#0a7;font-weight:bold}.note{font-size:11px;color:#a50}
${css}</style>${cards}`
const file = `${outDir}/${only || 'all'}.html`
writeFileSync(file, html)
const { chromium } = await import('playwright')
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } })
await page.goto('file://' + file)
await page.screenshot({ path: `${outDir}/${only || 'all'}.png`, fullPage: true })
await browser.close()
console.log('wrote', `${outDir}/${only || 'all'}.png`)
