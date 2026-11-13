// Diagrams for the NCM 8 class games: a circle with one part highlighted (radius, diameter, chord, tangent, arc,
// sector, segment, semicircle or quadrant). The geometry is exact, so the test can tell the parts apart by measuring
// the drawing (where each line ends, whether a shaded region includes the centre). Same CSS classes as the other
// diagrams, so they follow the light and dark themes.
import { dot, polar, rightMark, svg } from './diagrams'

type P = [number, number]
const f = (x: number) => Number(x.toFixed(2))

export type CirclePart = 'radius' | 'diameter' | 'chord' | 'tangent' | 'arc' | 'sector' | 'segment' | 'semicircle' | 'quadrant'

/**
 * A circle (centre dotted) with one part in the highlight colour. `turn` rotates the part (degrees) so the same part
 * does not always sit in the same place. Angles are as in polar(): 0 = right, 90 = up, anticlockwise.
 */
export function circleFeature(part: CirclePart, turn = 0): string {
  const c: P = [150, 125]
  const r = 90
  const at = (deg: number) => polar(c, r, deg + turn)
  const M = (p: P) => `${f(p[0])},${f(p[1])}`
  // a shaded region: anticlockwise from angle a to angle b, closed through the centre or straight back (a segment)
  const region = (a: number, b: number, viaCentre: boolean) => {
    const p = at(a)
    const q = at(b)
    const large = b - a > 180 ? 1 : 0
    return `<path class="sh hlfill part" d="M${viaCentre ? M(c) + ' L' : ''}${M(p)} A${r},${r} 0 ${large} 0 ${M(q)} Z"/>`
  }
  let body = `<circle class="sh" cx="${c[0]}" cy="${c[1]}" r="${r}"/>`
  let over = ''
  switch (part) {
    case 'radius':
      over = `<line class="ln hlstroke part" style="stroke-width:4" x1="${f(c[0])}" y1="${f(c[1])}" x2="${f(at(0)[0])}" y2="${f(at(0)[1])}"/>`
      break
    case 'diameter':
      over = `<line class="ln hlstroke part" style="stroke-width:4" x1="${f(at(0)[0])}" y1="${f(at(0)[1])}" x2="${f(at(180)[0])}" y2="${f(at(180)[1])}"/>`
      break
    case 'chord':
      over = `<line class="ln hlstroke part" style="stroke-width:4" x1="${f(at(20)[0])}" y1="${f(at(20)[1])}" x2="${f(at(130)[0])}" y2="${f(at(130)[1])}"/>`
      break
    case 'tangent': {
      const p = at(60)
      const along = (k: number): P => polar(p, k, 60 + turn + 90)
      over = `<line class="ln hlstroke part" style="stroke-width:4" x1="${f(along(-85)[0])}" y1="${f(along(-85)[1])}" x2="${f(along(85)[0])}" y2="${f(along(85)[1])}"/>`
      break
    }
    case 'arc':
      over = `<path class="arc hlstroke part" style="stroke-width:5" d="M${M(at(200))} A${r},${r} 0 0 0 ${M(at(290))}"/>`
      break
    case 'sector':
      body += region(-20, 110, true)
      break
    case 'segment':
      body += region(-30, 90, false)
      break
    case 'semicircle':
      body += region(0, 180, true)
      break
    case 'quadrant':
      body += region(0, 90, true) + rightMark(c, turn, 11)
      break
  }
  body += over + dot(c, 3)
  return svg(300, 250, body, 'Circle', 260)
}

/**
 * A sector graph: each item's sector is drawn at its true angle, starting at 12 o'clock and going clockwise, with
 * the item's name (and, if `showDeg`, its angle) written inside or just outside it.
 */
export function sectorGraph(items: { label: string; deg: number }[], showDeg = true): string {
  const c: P = [170, 125]
  const r = 95
  let body = ''
  let start = 90
  items.forEach((it, i) => {
    const end = start - it.deg
    const p = polar(c, r, start)
    const q = polar(c, r, end)
    body += `<path class="sh pie pie${i % 6}" d="M${f(c[0])},${f(c[1])} L${f(p[0])},${f(p[1])} A${r},${r} 0 ${it.deg > 180 ? 1 : 0} 1 ${f(q[0])},${f(q[1])} Z"/>`
    const midA = start - it.deg / 2
    const inside = it.deg >= 50
    const lp = polar(c, inside ? r * 0.58 : r + 26, midA)
    body += `<text class="dl small slice" x="${f(lp[0])}" y="${f(lp[1] - (showDeg ? 8 : 0))}" text-anchor="middle" dominant-baseline="central">${it.label}</text>`
    if (showDeg) body += `<text class="dl small sdeg" x="${f(lp[0])}" y="${f(lp[1] + 9)}" text-anchor="middle" dominant-baseline="central">${it.deg}°</text>`
    start = end
  })
  return svg(340, 250, body, 'Sector graph', 300)
}

/** A frequency table drawn as a picture (so it scales on the board): a heading row, then one row per value. */
export function freqTable(xs: (number | string)[], fs: number[], head: [string, string] = ['Score', 'Frequency']): string {
  const rowH = 26
  const W = 240
  const colX = [70, 175]
  const H = rowH * (xs.length + 1) + 4
  let body = `<rect class="frame" x="2" y="2" width="${W - 4}" height="${H - 4}"/>`
  body += `<line class="ln thin" x1="120" y1="2" x2="120" y2="${H - 2}"/>`
  for (let i = 1; i <= xs.length; i++) body += `<line class="ln thin" x1="2" y1="${2 + i * rowH}" x2="${W - 2}" y2="${2 + i * rowH}"/>`
  const cell = (row: number, col: number, s: string, cls = 'dl small') =>
    `<text class="${cls} cell r${row} c${col}" x="${colX[col]}" y="${f(2 + row * rowH + rowH / 2)}" text-anchor="middle" dominant-baseline="central">${s}</text>`
  body += cell(0, 0, head[0], 'dl small thead') + cell(0, 1, head[1], 'dl small thead')
  xs.forEach((x, i) => {
    body += cell(i + 1, 0, String(x)) + cell(i + 1, 1, String(fs[i]))
  })
  return svg(W, H, body, 'Frequency table', 240)
}
