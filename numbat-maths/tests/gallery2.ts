// Visual check of the Stage 2 diagram builders.
import * as D2 from '../src/lib/maths/diagrams2'
import { readFileSync, writeFileSync } from 'node:fs'
const css = readFileSync(new URL('../src/maths.css', import.meta.url), 'utf8')
const items: [string, string][] = [
  ['clock 3:00', D2.clock(3, 0)], ['clock 7:45', D2.clock(7, 45)], ['clock 10:23', D2.clock(10, 23)],
  ['ruler 2.3cm→9.1cm', D2.ruler(12, 23, 91)], ['number line 0–1000', D2.numberLine({ min: 0, max: 1000, parts: 10, labels: [0, 500, 1000], marks: [{ value: 700, label: 'A' }] })],
  ['number line quarters 0–2', D2.numberLine({ min: 0, max: 2, parts: 8, labelFracDen: 4, marks: [{ value: 1.25, label: 'B' }] })],
  ['strip 3/5', D2.fractionStrip(5, 3)], ['wall', D2.fractionWall([{ parts: 1, shaded: 1, label: '1' }, { parts: 2, shaded: 1 }, { parts: 4, shaded: 2 }, { parts: 8, shaded: 4 }])],
  ['circle 3/8', D2.circleParts(8, 3)], ['array 4x6', D2.dotArray(4, 6)], ['covered array 5x7', D2.dotArray(5, 7, { fromRow: 1, fromCol: 1 })],
  ['grid map', D2.gridMap(5, 4, [{ col: 2, row: 3, label: 'Park' }, { col: 4, row: 1, label: 'Shop' }, { col: 1, row: 1, label: 'Pool' }], { compass: true })],
  ['tally', D2.tallyChart([{ label: 'Cricket', count: 7 }, { label: 'Soccer', count: 12 }, { label: 'Netball', count: 5 }], 'Sport')],
  ['jug 650 mL', D2.jug(1000, 50, 100, 650)], ['jug 2.5 L', D2.jug(4000, 250, 1000, 2500, true)],
  ['dial 1.7 kg', D2.dialScale(5000, 1000, 10, 1700, true)], ['dial 350 g', D2.dialScale(1000, 100, 2, 350)],
  ['cubes 4x3x2', D2.cubeStack(4, 3, 2)], ['tri prism', D2.solid('prism', 3)], ['square prism', D2.solid('prism', 4)], ['hex prism', D2.solid('prism', 6)],
  ['square pyramid', D2.solid('pyramid', 4)], ['tri pyramid', D2.solid('pyramid', 3)], ['pent pyramid', D2.solid('pyramid', 5)],
  ['kite', D2.shape2D('kite', { markRight: true })], ['rhombus', D2.shape2D('rhombus')], ['trapezium', D2.shape2D('trapezium')], ['rectangle', D2.shape2D('rectangle', { markRight: true })],
  ['right tri', D2.shape2D('right-angled triangle', { markRight: true })], ['hexagon', D2.shape2D('regular hexagon')], ['cells', D2.cellGrid(8, 6, [[1, 1], [2, 1], [3, 1], [1, 2], [2, 2], [3, 2], [1, 3]])],
  ['tri on grid 6x4', D2.triangleOnGrid(9, 6, 6, 4)],
]
const cards = items.map(([t, s]) => `<div class="card mx"><div class="meta">${t}</div>${s}</div>`).join('')
const html = `<!doctype html><meta charset="utf8"><style>
:root{--font-body:Arial,sans-serif;--font-math:'Times New Roman',serif;--foreground:222 40% 16%;--card:0 0% 100%;--primary:172 62% 30%;--accent-2:352 72% 50%;--sun:42 95% 55%;--sun-soft:45 100% 92%;--shape:200 60% 96%;--shape-2:200 50% 90%;--shape-3:200 40% 84%;--grid-line:210 30% 88%;--border:210 20% 80%;--muted:210 30% 95%;--muted-foreground:215 15% 40%}
body{font-family:Arial;margin:12px;display:grid;grid-template-columns:repeat(4,1fr);gap:10px;background:#f3f6f8}
.card{background:#fff;border:1px solid #ccd;border-radius:8px;padding:8px}.meta{font-size:11px;color:#888}${css}</style>${cards}`
writeFileSync('/tmp/claude-0/gallery2.html', html)
const { chromium } = await import('playwright')
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1400, height: 900 } })
await p.goto('file:///tmp/claude-0/gallery2.html')
await p.screenshot({ path: '/tmp/claude-0/shots/gallery2.png', fullPage: true })
await b.close()
console.log('ok')
