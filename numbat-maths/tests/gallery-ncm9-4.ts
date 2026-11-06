// Visual check of Year 9 Trigonometry (NCM 9 Chapter 4): a few questions of each kind, with diagrams.
// Usage: npx tsx tests/gallery-ncm9-4.ts   (writes a page and a screenshot under /tmp/claude-0)
import { readFileSync, writeFileSync } from 'node:fs'
import { setSeed } from '../src/lib/maths/rand'
import { answerText } from '../src/lib/maths/check'
import { NCM4_SKILLS as NCM1_SKILLS } from "../src/content/y9-ncm4"
import type { Level } from '../src/lib/maths/types'

const css = readFileSync(new URL('../src/maths.css', import.meta.url), 'utf8')
const cards: string[] = []
for (const s of NCM1_SKILLS) {
  const seenTypes = new Set<string>()
  for (const lvl of [1, 2, 3] as Level[])
    for (let i = 0; i < 60; i++) {
      setSeed(i * 101 + lvl)
      const qn = s.gen(lvl)
      const m = (qn.meta ?? {}) as Record<string, unknown>; const key = [m.t, m.kind, m.ask, m.shape, m.mode, m.mc, m.which, m.form, m.to, m.known, m.want, qn.diagram ? 'd' : ''].join(':')
      if (seenTypes.has(key) || seenTypes.size >= 12) continue
      seenTypes.add(key)
      const a = qn.answer.kind === 'mc' ? qn.answer.options[qn.answer.correct] : answerText(qn.answer)
      cards.push(`<div class="card"><div class="meta">${s.ref} · L${lvl}${qn.calc ? ' · calc' : ''}</div><div class="q">${qn.prompt}</div>${qn.diagram ?? ''}${qn.note ? `<div class="meta">${qn.note}</div>` : ''}<div class="ans">Answer: ${a}</div><ol class="st">${qn.steps.map((x) => `<li>${x}</li>`).join('')}</ol></div>`)
    }
  // worked example, if the skill has its own
  if (s.example) {
    setSeed(7)
    const ex = s.example(2)
    cards.push(`<div class="card"><div class="meta">${s.ref} · worked example</div><div class="q">${ex.prompt}</div>${ex.diagram ?? ''}<ol class="st">${ex.steps.map((x) => `<li>${x}</li>`).join('')}</ol></div>`)
  }
}
const html = `<!doctype html><meta charset="utf8"><style>
:root{--font-body:Arial,sans-serif;--font-math:'Times New Roman',serif;--foreground:222 40% 16%;--card:0 0% 100%;--primary:172 62% 30%;--accent-2:352 72% 50%;--sun:42 95% 55%;--sun-soft:45 100% 92%;--shape:200 60% 96%;--shape-2:200 50% 90%;--shape-3:200 40% 84%;--grid-line:210 30% 88%;--border:210 20% 80%;--muted:210 30% 95%;--muted-foreground:215 15% 40%}
body{font-family:Arial;margin:12px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;background:#f3f6f8;color:hsl(222 40% 16%);font-size:13px}
.card{background:#fff;border:1px solid #ccd;border-radius:8px;padding:8px}.meta{font-size:11px;color:#888}.ans{font-weight:bold;color:#0a6}.st{font-size:11px;color:#555;padding-left:16px}
.big{font-size:18px;margin:4px 0}.frac{display:inline-flex;flex-direction:column;text-align:center;vertical-align:middle}.fd{border-top:1px solid}
table{border-collapse:collapse;margin:4px 0}td,th{border:1px solid #bbb;padding:2px 6px}${css}</style>${cards.join('')}`
writeFileSync('/tmp/claude-0/gallery-ncm9-4.html', html)
const { chromium } = await import('playwright')
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1500, height: 900 } })
await p.goto('file:///tmp/claude-0/gallery-ncm9-4.html')
const h = await p.evaluate(() => document.body.scrollHeight)
for (let k = 0; k * 2400 < h; k++) await p.screenshot({ path: `/tmp/claude-0/shots/ncm94_${k}.png`, fullPage: true, clip: { x: 0, y: k * 2400, width: 1500, height: Math.min(2400, h - k * 2400) } })
await b.close()
console.log('cards', cards.length, 'height', h)
