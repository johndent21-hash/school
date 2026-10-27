// Visual check of the Stage 1 diagram builders. Usage: npx tsx tests/gallery3.ts
import * as D3 from '../src/lib/maths/diagrams3'
import { readFileSync, writeFileSync } from 'node:fs'
const css = readFileSync(new URL('../src/maths.css', import.meta.url), 'utf8')
const items: [string, string][] = [
  ['ten frame 7', D3.tenFrames([{ n: 7, cls: 'tfa' }])],
  ['ten frames 8+5', D3.tenFrames([{ n: 8, cls: 'tfa' }, { n: 5, cls: 'tfb' }], 2)],
  ['base ten 2,4,7', D3.baseTen(2, 4, 7)],
  ['base ten 0,5,3', D3.baseTen(0, 5, 3)],
  ['pairs 9', D3.pairs(9)],
  ['groups 3x4', D3.equalGroups(3, 4)],
  ['groups 6x5 + 2', D3.equalGroups(6, 5, 2)],
  ['row', D3.objectRow(['cat', 'ball', 'book', 'cup', 'hat'])],
  ['clips 5.5', D3.measureUnits(5.5, 'paperclip', 'crayon')],
  ['blocks 7', D3.measureUnits(7, 'block')],
  ['pencils 3', D3.measureUnits(3, 'pencil')],
  ['strip uneven', D3.stripParts([1, 2], [0])],
  ['balance left heavy', D3.balance('apple', 'banana', -1)],
  ['balance level', D3.balance('pear', '6 blocks', 0)],
  ['sphere', D3.sphere()],
  ['cone', D3.cone()],
  ['arrow right', D3.arrow(1)],
  ['pattern', D3.shapePattern(['circle', 'square', 'triangle', 'circle', 'square', 'triangle', 'star', 'heart'])],
  ['pentagon', D3.polygonShape([[0, 0], [4, 0], [5, 3], [2, 5], [-1, 3]])],
  ['calendar', D3.calendar('March', 2, 31, 14)],
]
const cards = items.map(([t, s]) => `<div class="card mx"><div class="meta">${t}</div>${s}</div>`).join('')
const html = `<!doctype html><meta charset="utf8"><style>
:root{--font-body:Arial,sans-serif;--font-math:'Times New Roman',serif;--foreground:222 40% 16%;--card:0 0% 100%;--primary:172 62% 30%;--accent-2:352 72% 50%;--sun:42 95% 55%;--sun-soft:45 100% 92%;--shape:200 60% 96%;--shape-2:200 50% 90%;--shape-3:200 40% 84%;--grid-line:210 30% 88%;--border:210 20% 80%;--muted:210 30% 95%;--muted-foreground:215 15% 40%}
body{font-family:Arial;margin:12px;display:grid;grid-template-columns:repeat(4,1fr);gap:10px;background:#f3f6f8;color:hsl(222 40% 16%)}
.card{background:#fff;border:1px solid #ccd;border-radius:8px;padding:8px}.meta{font-size:11px;color:#888}${css}</style>${cards}`
writeFileSync('/tmp/claude-0/gallery3.html', html)
const { chromium } = await import('playwright')
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1400, height: 900 } })
await p.goto('file:///tmp/claude-0/gallery3.html')
await p.screenshot({ path: '/tmp/claude-0/shots/gallery3.png', fullPage: true })
await b.close()
console.log('ok')
