// Visual check of the Year 7 angle diagrams (diagrams12): a spread of every picture, in light and dark.
// Usage: npx tsx tests/gallery-diagrams12.ts   -> writes a page and screenshots under SHOTS (default /tmp/claude-0/shots)
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import * as DG from '../src/lib/maths/diagrams12'

const shots = process.env.SHOTS ?? '/tmp/claude-0/shots'
mkdirSync(shots, { recursive: true })
const css = readFileSync(new URL('../src/maths.css', import.meta.url), 'utf8')
const cards: string[] = []
const card = (title: string, svg: string) => cards.push(`<div class="card"><div class="meta">${title}</div>${svg}</div>`)

for (const k of ['line', 'ray', 'interval'] as const) card(k, DG.lineKind(k, 'P', 'Q', k === 'ray' ? -25 : 18))
card('rays single 50', DG.rays({ vertex: 'Q', arms: [{ name: 'P', dir: 10 }, { name: 'R', dir: 60 }], marks: [{ from: 0, to: 1 }] }))
card('rays single 140', DG.rays({ vertex: 'G', arms: [{ name: 'H', dir: -20 }, { name: 'P', dir: 120 }], marks: [{ from: 0, to: 1 }] }))
card('rays three •', DG.rays({ vertex: 'Q', arms: [{ name: 'R', dir: 5 }, { name: 'S', dir: 45 }, { name: 'P', dir: 110 }], marks: [{ from: 0, to: 1, label: '•' }] }))
card('rays four • ×', DG.rays({ vertex: 'B', arms: [{ name: 'A', dir: 0 }, { name: 'C', dir: 30 }, { name: 'D', dir: 95 }, { name: 'E', dir: 170 }], marks: [{ from: 0, to: 1, label: '•' }, { from: 2, to: 3, label: '×' }] }))
card('rays five', DG.rays({ vertex: 'X', arms: [0, 1, 2, 3, 4].map((i) => ({ name: 'ABCDE'[i], dir: 10 + i * 38 })) }))
card('rays sizes', DG.rays({ vertex: 'V', arms: [{ name: 'A', dir: 15 }, { name: 'B', dir: 45 }, { name: 'C', dir: 95 }], marks: [{ from: 0, to: 1, label: '30°' }, { from: 1, to: 2, label: '50°' }] }))
card('crossing named', DG.rays({ vertex: 'K', arms: [{ name: 'W', dir: 20 }, { name: 'X', dir: 85 }, { name: 'Y', dir: 200 }, { name: 'Z', dir: 265 }] }))
for (const s of [35, 90, 130, 180, 250, 320, 360]) card(`turn ${s}`, DG.turn(s, s * 3))
card('row', DG.angleRow([{ size: 40, label: 'A', start: 20, arm: 50 }, { size: 120, label: 'B', start: 200, arm: 36 }, { size: 75, label: 'C', start: 100, arm: 44 }]))

card('protractor 50 right', DG.protractor({ angle: 50, base: 'right', names: ['A', 'O', 'B'] }))
card('protractor 125 left', DG.protractor({ angle: 125, base: 'left', names: ['M', 'Q', 'K'] }))
card('protractor 37 left', DG.protractor({ angle: 37, base: 'left' }))
card('protractor 163 right', DG.protractor({ angle: 163, base: 'right', names: ['T', 'E', 'X'] }))
for (const [rot, theta] of [[0, 60], [0, 125], [20, 75], [-25, 110], [90, 50], [90, 140], [0, 35], [0, 145]] as [number, number][]) {
  card(`all eight rot ${rot} θ ${theta}`, DG.transversal({ rot, theta, marks: ([0, 1] as const).flatMap((at) => ([0, 1, 2, 3] as const).map((pos) => ({ at, pos, label: `<i>${'abcdefgh'[at * 4 + pos]}</i>` }))) }))
}
card('• and letters', DG.transversal({ rot: 0, theta: 70, marks: [{ at: 0, pos: 0, label: '•' }, ...([0, 1, 2, 3] as const).map((pos) => ({ at: 1 as const, pos, label: `<i>${'pqrs'[pos]}</i>` }))] }))
card('• obtuse', DG.transversal({ rot: 15, theta: 60, marks: [{ at: 1, pos: 1, label: '•' }, { at: 0, pos: 3, label: '×' }] }))
card('sizes', DG.transversal({ rot: 0, theta: 65, marks: [{ at: 0, pos: 2, label: '65°' }, { at: 1, pos: 1, label: '<i>x</i>°' }] }))
card('sizes 2', DG.transversal({ rot: -15, theta: 118, marks: [{ at: 0, pos: 0, label: '118°' }, { at: 1, pos: 0, label: '<i>m</i>°' }] }))
card('named', DG.transversal({ rot: 0, theta: 70, marks: [], names: { l0: ['A', 'B'], l1: ['C', 'D'], x: ['X', 'Y'], t: ['E', 'F'] } }))
card('named turned', DG.transversal({ rot: 30, theta: 115, marks: [], names: { l0: ['P', 'Q'], l1: ['R', 'S'], x: ['M', 'N'], t: ['G', 'H'] } }))
card('not parallel 75/80', DG.transversal({ rot: 0, theta: 75, theta2: 80, marks: [{ at: 0, pos: 2, label: '75°' }, { at: 1, pos: 0, label: '80°' }], names: { l0: ['A', 'B'], l1: ['C', 'D'] } }))
card('not parallel 110/80', DG.transversal({ rot: 0, theta: 110, theta2: 100, marks: [{ at: 0, pos: 2, label: '110°' }, { at: 1, pos: 1, label: '80°' }], names: { l0: ['M', 'N'], l1: ['P', 'Q'] } }))
card('parallel unmarked', DG.transversal({ rot: 0, theta: 64, arrows: false, marks: [{ at: 0, pos: 3, label: '116°' }, { at: 1, pos: 1, label: '116°' }], names: { l0: ['A', 'B'], l1: ['C', 'D'] } }))
card(
  'lineSet',
  DG.lineSet({
    lines: [
      { a: 'A', b: 'B', p: [0, 3], q: [8, 3], arrows: 1 },
      { a: 'C', b: 'D', p: [0, 0.5], q: [8, 0.5], arrows: 1 },
      { a: 'E', b: 'F', p: [2, 4.5], q: [2, -1] },
      { a: 'G', b: 'H', p: [3.5, -1], q: [7.5, 4.5] },
    ],
    rights: [{ at: [2, 3], dir: 0 }],
    turn: 10,
  }),
)
card('map', DG.streetMap({ across: ['Banksia St', 'Wattle St', 'Waratah Ave'], up: ['Ironbark Rd', 'Mallee Rd'], slant: 'Brolga Pde' }))

const page = (dark: boolean) => `<!doctype html><meta charset="utf8"><style>
:root{--font-body:Arial,sans-serif;--font-math:'Times New Roman',serif;${
  dark
    ? '--foreground:210 30% 92%;--card:222 30% 14%;--primary:172 60% 55%;--accent-2:352 80% 65%;--sun:42 95% 55%;--sun-soft:45 40% 22%;--shape:200 30% 22%;--shape-2:200 30% 28%;--shape-3:200 30% 34%;--grid-line:215 20% 34%;--border:210 20% 30%;--muted:210 20% 20%;--muted-foreground:215 15% 70%'
    : '--foreground:222 40% 16%;--card:0 0% 100%;--primary:172 62% 30%;--accent-2:352 72% 50%;--sun:42 95% 55%;--sun-soft:45 100% 92%;--shape:200 60% 96%;--shape-2:200 50% 90%;--shape-3:200 40% 84%;--grid-line:210 30% 80%;--border:210 20% 80%;--muted:210 30% 95%;--muted-foreground:215 15% 40%'
}}
body{font-family:Arial;margin:12px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;background:${dark ? '#0d1320' : '#f3f6f8'};color:hsl(var(--foreground));font-size:13px}
.card{background:hsl(var(--card));border:1px solid #8896;border-radius:8px;padding:8px}.meta{font-size:11px;color:#888}${css}</style>${cards.join('')}`

const { chromium } = await import('playwright')
const br = await chromium.launch()
for (const dark of [false, true]) {
  const file = `${shots}/gallery-d12${dark ? '-dark' : ''}.html`
  writeFileSync(file, page(dark))
  const p = await br.newPage({ viewport: { width: 1500, height: 900 } })
  await p.goto(`file://${file}`)
  const h = await p.evaluate(() => document.body.scrollHeight)
  for (let k = 0; k * 1400 < h; k++) await p.screenshot({ path: `${shots}/d12${dark ? '_dark' : ''}_${k}.png`, clip: { x: 0, y: k * 1400, width: 1500, height: Math.min(1400, h - k * 1400) }, fullPage: true })
  console.log(dark ? 'dark' : 'light', 'height', h)
  await p.close()
}
await br.close()
console.log('cards', cards.length)
