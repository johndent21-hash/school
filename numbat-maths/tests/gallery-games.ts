// Visual check of the class-game questions: one or two of every kind, drawn as they are on the board.
// Usage: npx tsx tests/gallery-games.ts            ONLY=ncm7-8.06 to look at one exercise, ALL=1 to include questions without diagrams
// Writes a page and screenshots under SHOTS (default /tmp/claude-0/shots).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { setSeed } from '../src/lib/maths/rand'
import { ALL_GAME_SETS } from '../src/content/games/index'

const shots = process.env.SHOTS ?? '/tmp/claude-0/shots'
mkdirSync(shots, { recursive: true })
const only = process.env.ONLY ?? ''
const all = process.env.ALL === '1'
const K = Number(process.env.K ?? 2)
const css = readFileSync(new URL('../src/maths.css', import.meta.url), 'utf8')
const cards: string[] = []
for (const s of ALL_GAME_SETS) {
  if (!s.id.startsWith(only)) continue
  for (const m of s.makers) {
    const seen = new Set<string>()
    for (let i = 0; i < 80 && seen.size < K; i++) {
      setSeed(i * 131 + m.t.length * 17 + 5)
      const q = m.make()
      if (!q.diagram && !all) break
      const key = q.diagram ?? q.prompt
      if (seen.has(key)) continue
      seen.add(key)
      cards.push(
        `<div class="card"><div class="meta">${s.exercise} · ${m.t}</div><div class="q">${q.prompt}</div>${q.diagram ?? ''}${q.note ? `<div class="meta">${q.note}</div>` : ''}` +
          `<div class="opts">${q.options.map((o, k) => `<span class="${k === q.correct ? 'ok' : ''}">${'ABCD'[k]} ${o}</span>`).join('')}</div><div class="why">${q.why}</div></div>`,
      )
    }
  }
}
const html = `<!doctype html><meta charset="utf8"><style>
:root{--font-body:Arial,sans-serif;--font-math:'Times New Roman',serif;--foreground:222 40% 16%;--card:0 0% 100%;--primary:172 62% 30%;--accent-2:352 72% 50%;--sun:42 95% 55%;--sun-soft:45 100% 92%;--shape:200 60% 96%;--shape-2:200 50% 90%;--shape-3:200 40% 84%;--grid-line:210 30% 88%;--border:210 20% 80%;--muted:210 30% 95%;--muted-foreground:215 15% 40%}
body{font-family:Arial;margin:12px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;background:#f3f6f8;color:hsl(222 40% 16%);font-size:13px}
.card{background:#fff;border:1px solid #ccd;border-radius:8px;padding:8px}.meta{font-size:11px;color:#888}.q{font-weight:bold}.why{font-size:11px;color:#555;margin-top:4px}
.opts{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px}.opts span{border:1px solid #bbb;border-radius:6px;padding:1px 6px}.opts .ok{background:#cfe;border-color:#0a6;font-weight:bold}
.big{font-size:18px;margin:4px 0}.frac{display:inline-flex;flex-direction:column;text-align:center;vertical-align:middle;font-size:.85em}.fd{border-top:1px solid}${css}</style>${cards.join('')}`
writeFileSync(`${shots}/gallery-games.html`, html)
const { chromium } = await import('playwright')
const br = await chromium.launch()
const p = await br.newPage({ viewport: { width: 1500, height: 900 } })
await p.goto(`file://${shots}/gallery-games.html`)
const h = await p.evaluate(() => document.body.scrollHeight)
let n = 0
for (let k = 0; k * 1500 < h; k++, n++) await p.screenshot({ path: `${shots}/gallery_games_${k}.png`, fullPage: true, clip: { x: 0, y: k * 1500, width: 1500, height: Math.min(1500, h - k * 1500) } })
await br.close()
console.log('cards', cards.length, 'height', h, 'screenshots', n)
