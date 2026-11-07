// Statistics displays for NCM 9 Chapter 9 (Analysing data): a frequency histogram with a frequency axis and an
// optional frequency polygon, and ordered, unordered and back-to-back stem-and-leaf plots.
import { dot, line, svg, text } from './diagrams'

const f = (x: number) => Number(x.toFixed(2))
const fmt = (x: number) => (x < 0 ? '−' + String(-x) : String(x))

/**
 * Frequency histogram for consecutive whole-number scores `xs` with frequencies `fs`.
 * Each column is centred on its score, leaving a half-column gap after the frequency axis (as in NCM 9).
 * `polygon` joins the midpoints of the column tops, starting and ending on the horizontal axis one score
 * either side. With `hist: false` only the polygon is drawn.
 */
export function freqHist(
  xs: number[],
  fs: number[],
  o: { hist?: boolean; polygon?: boolean; xLabel?: string; title?: string } = {},
): string {
  const hist = o.hist !== false
  const W = 340
  const H = 236
  const left = 46
  const right = W - 12
  const top = o.title ? 32 : 14
  const bottom = H - (o.xLabel ? 44 : 28)
  const maxF = Math.max(...fs, 1)
  const step = maxF <= 10 ? 1 : maxF <= 20 ? 2 : 5
  const yMax = Math.ceil(maxF / step) * step
  const Y = (v: number) => bottom - (v / yMax) * (bottom - top)
  const slots = xs.length + 1
  const bw = (right - left) / slots
  const X = (i: number) => left + bw * (i + 1) // centre of the i-th score
  let body = ''
  for (let v = 0; v <= yMax; v += step) {
    body += line([left, Y(v)], [right, Y(v)], 'grid') + text([left - 6, Y(v)], String(v), 'dl tiny yv', 'end')
  }
  if (hist) {
    fs.forEach((fr, i) => {
      if (fr > 0) body += `<rect class="bar" x="${f(X(i) - bw / 2)}" y="${f(Y(fr))}" width="${f(bw)}" height="${f(Y(0) - Y(fr))}"/>`
    })
  }
  xs.forEach((x, i) => (body += line([X(i), bottom], [X(i), bottom + 4], 'axis') + text([X(i), bottom + 15], fmt(x), 'dl tiny xv')))
  if (o.polygon) {
    const pts: [number, number][] = [[X(-1), Y(0)], ...fs.map((fr, i) => [X(i), Y(fr)] as [number, number]), [X(xs.length), Y(0)]]
    body += `<polyline class="plot plot2 fpoly" points="${pts.map((p) => `${f(p[0])},${f(p[1])}`).join(' ')}"/>`
    pts.slice(1, -1).forEach((p) => (body += dot(p, 3.2, 'pt')))
  }
  body += line([left, bottom], [right, bottom], 'axis') + line([left, bottom], [left, top - 4], 'axis')
  body += `<text class="dl tiny" transform="translate(13 ${f((top + bottom) / 2)}) rotate(-90)" text-anchor="middle">Frequency</text>`
  if (o.xLabel) body += text([(left + right) / 2, H - 8], o.xLabel, 'dl tiny')
  if (o.title) body += text([(left + right) / 2, 16], o.title, 'dl small')
  const label = hist ? (o.polygon ? 'Frequency histogram and polygon' : 'Frequency histogram') : 'Frequency polygon'
  return svg(W, H, body, label, 400)
}

/** Stem and leaf of a value: whole-number values use tens and units; `dec: 1` uses units and tenths. */
function split(v: number, dec: 0 | 1): [number, number] {
  if (dec === 1) {
    const t = Math.round(v * 10)
    return [Math.floor(t / 10), t % 10]
  }
  return [Math.floor(v / 10), v % 10]
}

/** back-to-back leaves: single spaces (with letter-spacing in the CSS) so both sides fit on a phone */
const join = (ls: number[]) => ls.join(' ')

/**
 * Stem-and-leaf plot as an HTML table. `ordered: false` keeps the leaves in the order given.
 * `hide` replaces one value's leaf with "?" (for missing-value questions). Every stem from the lowest to the
 * highest is shown, including empty ones; `fromStem`/`toStem` widen that range.
 */
export function stemPlot(
  values: number[],
  o: { key: string; dec?: 0 | 1; ordered?: boolean; hide?: number; fromStem?: number; toStem?: number },
): string {
  const dec = o.dec ?? 0
  const vals = o.ordered === false ? values.slice() : values.slice().sort((a, b) => a - b)
  const stems = vals.map((v) => split(v, dec)[0])
  if (o.hide !== undefined) stems.push(split(o.hide, dec)[0])
  const lo = Math.min(...stems, o.fromStem ?? Infinity)
  const hi = Math.max(...stems, o.toStem ?? -Infinity)
  const rows = new Map<number, string[]>()
  for (let s = lo; s <= hi; s++) rows.set(s, [])
  if (o.hide !== undefined) rows.get(split(o.hide, dec)[0])!.push('?')
  vals.forEach((v) => {
    const [s, l] = split(v, dec)
    rows.get(s)!.push(String(l))
  })
  const body = Array.from(rows.entries())
    .map(([s, ls]) => `<tr><td class="stem">${s}</td><td class="leaf">${ls.join('&ensp;')}</td></tr>`)
    .join('')
  return `<div class="tablewrap"><table class="stemleaf"><thead><tr><th>Stem</th><th>Leaf</th></tr></thead><tbody>${body}</tbody></table><p class="key">${o.key}</p></div>`
}

/** Back-to-back stem-and-leaf plot: left leaves read outwards from the stem (smallest nearest the stem). */
export function stemPlot2(left: number[], right: number[], lName: string, rName: string, key: string): string {
  const L = left.slice().sort((a, b) => a - b)
  const R = right.slice().sort((a, b) => a - b)
  const all = [...L, ...R].map((v) => Math.floor(v / 10))
  const lo = Math.min(...all)
  const hi = Math.max(...all)
  let body = ''
  for (let s = lo; s <= hi; s++) {
    const l = L.filter((v) => Math.floor(v / 10) === s).map((v) => v % 10)
    const r = R.filter((v) => Math.floor(v / 10) === s).map((v) => v % 10)
    body += `<tr><td class="leaf leafL">${join(l.reverse())}</td><td class="stem">${s}</td><td class="leaf">${join(r)}</td></tr>`
  }
  return `<div class="tablewrap"><table class="stemleaf b2b"><thead><tr><th>${lName}</th><th>Stem</th><th>${rName}</th></tr></thead><tbody>${body}</tbody></table><p class="key">${key}</p></div>`
}
