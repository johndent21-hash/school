// Renders one generated question per Stage 1–2 skill and level (those with diagrams) for a visual check.
// Usage: STAGE2=1 ONLY=y4 npx tsx tests/gallery-s2q.ts out.png
import { readFileSync, writeFileSync } from 'node:fs'
import { setSeed } from '../src/lib/maths/rand'
import { answerText } from '../src/lib/maths/check'
import type { Level } from '../src/lib/maths/types'
import { STAGE1_TOPICS, STAGE2_TOPICS } from '../src/content/index'
const css = readFileSync(new URL('../src/maths.css', import.meta.url), 'utf8')
const only = process.env.ONLY ?? ''
const seed = Number(process.env.SEED ?? 3)
const out = process.argv[2] ?? '/tmp/claude-0/shots/s2q.png'
const cards: string[] = []
for (const t of [...STAGE1_TOPICS, ...STAGE2_TOPICS])
  for (const s of t.skills) {
    if (!s.id.startsWith(only)) continue
    for (const lvl of [1, 2, 3] as Level[]) {
      for (let k = 0; k < 6; k++) {
        setSeed(seed * 100 + k + lvl * 17)
        const q = s.gen(lvl)
        if (!q.diagram) continue
        const ans = q.answer.kind === 'mc' ? q.answer.options[q.answer.correct] : answerText(q.answer)
        cards.push(`<div class="card mx"><div class="meta">${s.id} L${lvl}</div><div class="p">${q.prompt}</div>${q.diagram}<div class="a">⇒ ${q.prefix ?? ''}${ans} ${q.suffix ?? ''}</div></div>`)
        break
      }
    }
  }
const html = `<!doctype html><meta charset="utf8"><style>
:root{--font-body:Arial,sans-serif;--font-math:'Times New Roman',serif;--foreground:222 40% 16%;--card:0 0% 100%;--primary:172 62% 30%;--accent-2:352 72% 50%;--sun:42 95% 55%;--sun-soft:45 100% 92%;--shape:200 60% 96%;--shape-2:200 50% 90%;--shape-3:200 40% 84%;--grid-line:210 30% 88%;--border:210 20% 80%;--muted:210 30% 95%;--muted-foreground:215 15% 40%}
body{font-family:Arial;margin:12px;display:grid;grid-template-columns:repeat(4,1fr);gap:10px;background:#f3f6f8;color:hsl(222 40% 16%)}
.card{background:#fff;border:1px solid #ccd;border-radius:8px;padding:8px;font-size:12px}.meta{font-size:10px;color:#888}.a{color:#070;font-weight:bold;margin-top:4px}.p{margin-bottom:4px}
.big{font-size:16px;margin:4px 0}.dg{width:100%;height:auto}${css}</style>${cards.join('')}`
writeFileSync('/tmp/claude-0/s2q.html', html)
const { chromium } = await import('playwright')
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1400, height: 900 } })
await p.goto('file:///tmp/claude-0/s2q.html')
await p.screenshot({ path: out, fullPage: true })
await b.close()
console.log(cards.length, 'cards ->', out)
