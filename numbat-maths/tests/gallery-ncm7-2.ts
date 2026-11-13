// Visual check of Year 7 Angles (NCM 7 Chapter 2): a few questions of every kind, with their diagrams,
// answers and working, as cards. Usage: npx tsx tests/gallery-ncm7-2.ts
// ONLY=2.07 to look at one exercise; K = how many of each kind (default 2). Writes under SHOTS (default /tmp/claude-0/shots).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { setSeed } from '../src/lib/maths/rand'
import { answerText } from '../src/lib/maths/check'
import { NCM2_SKILLS } from '../src/content/y7-ncm2'
import type { Level } from '../src/lib/maths/types'

const shots = process.env.SHOTS ?? '/tmp/claude-0/shots'
mkdirSync(shots, { recursive: true })
const only = process.env.ONLY ?? ''
const K = Number(process.env.K ?? 2)
const css = readFileSync(new URL('../src/maths.css', import.meta.url), 'utf8')
const cards: string[] = []
for (const s of NCM2_SKILLS) {
  if (only && !(s.ref ?? '').includes(only)) continue
  for (const lvl of [1, 2, 3] as Level[]) {
    const seen: Record<string, number> = {}
    for (let i = 0; i < 400; i++) {
      setSeed(i * 101 + lvl * 13 + 3)
      const qn = s.gen(lvl)
      const key = String(qn.meta?.t ?? '') + (qn.meta?.rel ?? '') + (qn.meta?.kind ?? '') + (qn.meta?.variant ?? '') + (['parallel', 'perpendicular', 'true'].includes(String(qn.meta?.ask)) ? qn.meta?.ask : '') + (qn.meta?.box ?? '') + (qn.meta?.base ?? '') + (qn.meta?.k ?? '') + (qn.meta?.hand ?? '') + (qn.meta?.write ?? '')
      if ((seen[key] ?? 0) >= K) continue
      seen[key] = (seen[key] ?? 0) + 1
      const a = qn.answer.kind === 'mc' ? `<div class="opts">${qn.answer.options.map((o, k) => `<span class="${k === (qn.answer as any).correct ? 'ok' : ''}">${o}</span>`).join('')}</div>` : `<div class="ans">Answer: ${qn.prefix ?? ''} ${answerText(qn.answer)}${qn.suffix ?? ''}</div>`
      cards.push(
        `<div class="card"><div class="meta">${s.ref} · L${lvl} · ${qn.meta?.t ?? ''}</div><div class="q">${qn.prompt}</div>${qn.diagram ?? ''}${qn.note ? `<div class="meta">${qn.note}</div>` : ''}${a}<div class="hint">Hint: ${qn.hint}</div><ol class="st">${qn.steps.map((x) => `<li>${x}</li>`).join('')}</ol></div>`,
      )
    }
  }
}
const html = `<!doctype html><meta charset="utf8"><style>
:root{--font-body:Arial,sans-serif;--font-math:'Times New Roman',serif;--foreground:222 40% 16%;--card:0 0% 100%;--primary:172 62% 30%;--accent-2:352 72% 50%;--sun:42 95% 55%;--sun-soft:45 100% 92%;--shape:200 60% 96%;--shape-2:200 50% 90%;--shape-3:200 40% 84%;--grid-line:210 30% 80%;--border:210 20% 80%;--muted:210 30% 95%;--muted-foreground:215 15% 40%}
body{font-family:Arial;margin:12px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;background:#f3f6f8;color:hsl(222 40% 16%);font-size:13px}
.card{background:#fff;border:1px solid #ccd;border-radius:8px;padding:8px}.meta{font-size:11px;color:#888}.q{font-weight:bold}.ans{font-weight:bold;color:#0a6}.hint{font-size:11px;color:#a60;margin-top:3px}.st{font-size:11px;color:#555;padding-left:16px;margin:3px 0}
.opts{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px}.opts span{border:1px solid #bbb;border-radius:6px;padding:1px 6px}.opts .ok{background:#cfe;border-color:#0a6;font-weight:bold}
.big{font-size:18px;margin:4px 0}${css}</style>${cards.join('')}`
writeFileSync(`${shots}/gallery-ncm7-2.html`, html)
const { chromium } = await import('playwright')
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1500, height: 900 } })
await p.goto(`file://${shots}/gallery-ncm7-2.html`)
const h = await p.evaluate(() => document.body.scrollHeight)
let n = 0
for (let k = 0; k * 1500 < h; k++, n++) await p.screenshot({ path: `${shots}/ncm7_2_${k}.png`, fullPage: true, clip: { x: 0, y: k * 1500, width: 1500, height: Math.min(1500, h - k * 1500) } })
await b.close()
console.log('cards', cards.length, 'height', h, 'screenshots', n)
