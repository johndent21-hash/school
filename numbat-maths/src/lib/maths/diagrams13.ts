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
