// Class games for New Century Maths 8 (3rd edition, Cengage) Chapter 4, Geometry: one set of quick questions for each
// exercise, 4.01 to 4.08.
//
// 4.01–4.06 revise Year 7 geometry (angles, parallel lines, triangles, quadrilaterals), so they reuse NCM 7 Chapter 2
// and 6 kinds, which are checked by those chapters' checks (see reuse.ts). New kinds are the starred extension work:
// the angle sum of a polygon and networks (tests/game-checks/ncm8-ch4.ts).
//
// Audit against the textbook, exercise by exercise (Nov 2026): added which triangles can be drawn (4.03) and convex
// or non-convex quadrilaterals (4.04), both from NCM 7; the extension notes now give the Stage 5 path outcomes.
//
// Syllabus: NSW Mathematics K–10 (2022), Stage 4: Angle relationships MA4-ANG-C-01 (4.01, 4.02) and Properties of
// geometrical figures MA4-GEO-C-01 (4.03–4.06). 4.07 (angle sum of a polygon) is starred as extension in the
// textbook and is Stage 5 path content (MA5-GEO-P-01); 4.08 (networks) is starred as extension and is Stage 5 path
// content (MA5-NET-P-01).
import type { GameChapter, GameQuestion, GameSet } from '@/lib/game/types'
import { D, gq, int, mk, num, pick, sample } from './helpers'
import { NCM7_CH2 } from './ncm7-ch2'
import { NCM7_CH6 } from './ncm7-ch6'
import { reuse } from './reuse'

const ANG = 'MA4-ANG-C-01'
const GEO = 'MA4-GEO-C-01'
const EXT_POLY = 'Marked as extension in the textbook: the angle sum of a polygon is Stage 5 path content (MA5-GEO-P-01).'
const EXT_NET = 'Marked as extension in the textbook: networks are Stage 5 path content (MA5-NET-P-01).'
const deg = (x: number) => `${num(x)}°`
const an = (w: string) => (/^[aeiou]/.test(w) ? `an ${w}` : `a ${w}`)

const set = (exn: string, title: string, focus: string, outcomes: string[], makers: GameSet['makers'], extra: Partial<GameSet> = {}): GameSet => ({
  id: `ncm8-${exn}`,
  exercise: exn,
  ref: `NCM 8 Ex ${exn}`,
  title,
  focus,
  outcomes,
  makers,
  ...extra,
})

const SET_401 = set('4.01', 'Angle geometry', 'Use complementary, supplementary, vertically opposite and revolution angles.', [ANG], [
  reuse(NCM7_CH2, '2.04', 'complement'),
  reuse(NCM7_CH2, '2.04', 'supplement'),
  reuse(NCM7_CH2, '2.05', 'vertOpp'),
  reuse(NCM7_CH2, '2.04', 'line'),
  reuse(NCM7_CH2, '2.05', 'point'),
])
const SET_402 = set('4.02', 'Angles on parallel lines', 'Name and use corresponding, alternate and co-interior angles, and prove lines parallel.', [ANG], [
  reuse(NCM7_CH2, '2.10', 'name'),
  reuse(NCM7_CH2, '2.07', 'find', 'corresponding'),
  reuse(NCM7_CH2, '2.08', 'find', 'alternate'),
  reuse(NCM7_CH2, '2.09', 'find', 'coInterior'),
  reuse(NCM7_CH2, '2.11', 'prove'),
])
const SET_403 = set('4.03', 'Classifying triangles', 'Classify triangles by their sides and angles.', [GEO], [reuse(NCM7_CH6, '6.05', 'drawn'), reuse(NCM7_CH6, '6.05', 'angles'), reuse(NCM7_CH6, '6.05', 'possible')])
const SET_404 = set('4.04', 'Classifying quadrilaterals', 'Name the special quadrilaterals from their markings and descriptions.', [GEO], [reuse(NCM7_CH6, '6.08', 'drawn'), reuse(NCM7_CH6, '6.08', 'describe'), reuse(NCM7_CH6, '6.08', 'convex')])
const SET_405 = set('4.05', 'Properties of quadrilaterals', 'Know the properties of the sides, angles and diagonals of the special quadrilaterals.', [GEO], [
  reuse(NCM7_CH6, '6.10', 'always'),
  reuse(NCM7_CH6, '6.10', 'which'),
])
const SET_406 = set('4.06', 'Angle sums of triangles and quadrilaterals', 'Use the angle sums 180° and 360°, the exterior angle of a triangle, and special quadrilaterals.', [GEO], [
  reuse(NCM7_CH6, '6.06', 'missing', 'triangle'),
  reuse(NCM7_CH6, '6.07', 'exterior'),
  reuse(NCM7_CH6, '6.09', 'missing', 'quadrilateral'),
  reuse(NCM7_CH6, '6.06', 'isosceles'),
  reuse(NCM7_CH6, '6.09', 'special'),
])

// ================================================================== 4.07 Angle sum of a polygon (extension)

const POLY: [number, string][] = [[5, 'pentagon'], [6, 'hexagon'], [7, 'heptagon'], [8, 'octagon'], [9, 'nonagon'], [10, 'decagon'], [12, 'dodecagon']]
/** three different wrong angles, likely first */
function angWrong(right: number, likely: number[]): string[] {
  const out: number[] = []
  for (const x of [...likely, right + 180, right - 180, right + 90]) {
    if (x !== right && x > 0 && !out.includes(x)) out.push(x)
    if (out.length === 3) break
  }
  return out.map(deg)
}

function m407sum(): GameQuestion {
  const [n, name] = pick(POLY)
  const s = (n - 2) * 180
  return gq({
    t: 'sum',
    prompt: `What is the angle sum of ${an(name)}?`,
    correct: deg(s),
    // n × 180°, (n − 1) × 180°, n × 360° ÷ 2 … the usual slips
    wrong: angWrong(s, [n * 180, (n - 1) * 180, (n - 3) * 180, n * 90]),
    why: `${an(name).replace(/^a/, 'A')} has ${n} sides, so it splits into ${n - 2} triangles: (${n} − 2) × 180° = ${deg(s)}.`,
    meta: { n },
  })
}

function m407regular(): GameQuestion {
  const [n, name] = pick(POLY.filter(([k]) => (((k - 2) * 180) / k) % 1 === 0))
  const each = ((n - 2) * 180) / n
  return gq({
    t: 'regular',
    prompt: `What size is each interior angle of a regular ${name}?`,
    correct: deg(each),
    // the whole angle sum, the exterior angle, (n − 1) × 180° ÷ n
    wrong: angWrong(each, [(n - 2) * 180, 360 / n, ...(((n - 1) * 180) % n === 0 ? [((n - 1) * 180) / n] : []), each + 10, each - 10]),
    why: `Angle sum (${n} − 2) × 180° = ${deg((n - 2) * 180)}, shared by ${n} equal angles: ${deg(each)}.`,
    meta: { n },
  })
}

function m407sides(): GameQuestion {
  const n = int(5, 12)
  const s = (n - 2) * 180
  return gq({
    t: 'sides',
    prompt: `A polygon has an angle sum of ${deg(s)}. How many sides does it have?`,
    correct: num(n),
    // forgot to add 2, divided by 360
    wrong: [num(n - 2), num(n - 1), num(n + 1), num(Math.round(s / 360) === n ? n + 2 : Math.round(s / 360))].filter((x, i, a) => a.indexOf(x) === i && x !== num(n)),
    why: `${deg(s)} ÷ 180° = ${n - 2} triangles, and a polygon with ${n} sides makes ${n} − 2 = ${n - 2} triangles. So ${n} sides.`,
    meta: { n },
  })
}

const SET_407 = set('4.07', 'Angle sum of a polygon', 'The angles of an n-sided polygon add to (n − 2) × 180°.', [], [mk('sum', m407sum), mk('regular', m407regular), mk('sides', m407sides, 2)], { teacherNote: EXT_POLY })

// ================================================================== 4.08 Networks (extension)

/** edges a–b and c–d of a polygon's vertices cross inside it when exactly one of c, d lies strictly between a and b */
const cross = ([a, b]: [number, number], [c, d]: [number, number]) => new Set([a, b, c, d]).size === 4 && (a < c && c < b) !== (a < d && d < b)
/** a network on 4–6 vertices placed around a circle, with no repeated edges and no edges crossing.
 *  parts: how many separate pieces it is in (1 = connected); a vertex with no edges is a piece of its own. */
function network(parts = 1): { names: string[]; pos: [number, number][]; edges: [number, number][] } {
  for (;;) {
    const n = int(Math.max(4, parts + 3), 6)
    const names = 'ABCDEF'.slice(0, n).split('')
    const all: [number, number][] = []
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) all.push([i, j])
    const edges = sample(all, parts === 1 ? int(n, Math.min(all.length, n + 3)) : int(n - parts, n))
    if (pieces(n, edges) !== parts || edges.some((e, k) => edges.slice(k + 1).some((f) => cross(e, f)))) continue
    const off = int(0, 59)
    const pos = names.map((_, i) => [130 + 95 * Math.cos(((360 * i) / n + off - 90) * (Math.PI / 180)), 120 + 95 * Math.sin(((360 * i) / n + off - 90) * (Math.PI / 180))] as [number, number])
    return { names, pos, edges }
  }
}
/** how many separate pieces n vertices and these edges make */
function pieces(n: number, edges: [number, number][]): number {
  const root = Array.from({ length: n }, (_, i) => i)
  const find = (i: number): number => (root[i] === i ? i : (root[i] = find(root[i])))
  for (const [a, b] of edges) root[find(a)] = find(b)
  return new Set(root.map((_, i) => find(i))).size
}
function drawNetwork(g: ReturnType<typeof network>): string {
  let body = ''
  for (const [a, b] of g.edges) body += `<line class="ln edge" x1="${g.pos[a][0].toFixed(1)}" y1="${g.pos[a][1].toFixed(1)}" x2="${g.pos[b][0].toFixed(1)}" y2="${g.pos[b][1].toFixed(1)}"/>`
  g.names.forEach((nm, i) => {
    body += `<circle class="pt node" cx="${g.pos[i][0].toFixed(1)}" cy="${g.pos[i][1].toFixed(1)}" r="5"/>`
    const dx = g.pos[i][0] - 130
    const dy = g.pos[i][1] - 120
    const L = Math.hypot(dx, dy) || 1
    body += D.text([g.pos[i][0] + (dx / L) * 17, g.pos[i][1] + (dy / L) * 17], nm, 'dl vx')
  })
  return D.svg(260, 240, body, 'A network of vertices and edges', 280)
}
const degree = (g: ReturnType<typeof network>, i: number) => g.edges.filter(([a, b]) => a === i || b === i).length

function m408degree(): GameQuestion {
  const g = network()
  const i = int(0, g.names.length - 1)
  const d = degree(g, i)
  return gq({
    t: 'degree',
    prompt: `What is the degree of vertex ${g.names[i]}?`,
    diagram: drawNetwork(g),
    correct: num(d),
    // the number of edges, the number of vertices, one out
    wrong: [num(g.edges.length), num(g.names.length), num(d + 1), num(Math.max(0, d - 1)), num(d + 2)].filter((x, k, a) => a.indexOf(x) === k && x !== num(d)),
    why: `${d} ${d === 1 ? 'edge meets' : 'edges meet'} at ${g.names[i]}, so its degree is ${d}.`,
    meta: { edges: g.edges, i },
  })
}

const TRACE = ['Yes, starting anywhere', 'Yes, but only from an odd vertex', 'No: more than 2 odd vertices', 'No: it has an even vertex']

function m408trace(): GameQuestion {
  let g: ReturnType<typeof network>, odd: number
  // each answer about as likely as the others
  const want = int(0, 2)
  do {
    g = network()
    odd = g.names.filter((_, i) => degree(g, i) % 2 === 1).length
  } while ((want === 0 && odd !== 0) || (want === 1 && odd !== 2) || (want === 2 && odd < 4))
  const k = odd === 0 ? 0 : odd === 2 ? 1 : 2
  return gq({
    t: 'trace',
    prompt: 'Can this network be drawn without lifting the pen or going over an edge twice?',
    diagram: drawNetwork(g),
    correct: TRACE[k],
    inOrder: TRACE,
    why: `It has ${odd} odd ${odd === 1 ? 'vertex' : 'vertices'}. ${['With 0 odd vertices you can start anywhere.', 'With exactly 2 odd vertices you must start at one of them.', 'With more than 2 odd vertices it cannot be done.'][k]}`,
    meta: { edges: g.edges },
  })
}

const CONNECTED = ['Yes, it is connected', 'No: it is in 2 separate parts', 'No: it is in 3 separate parts', 'No: it is in 4 separate parts']

function m408connected(): GameQuestion {
  const parts = pick([1, 1, 2, 2, 3])
  const g = network(parts)
  return gq({
    t: 'connected',
    prompt: 'Is this network connected? If not, how many separate parts is it in?',
    diagram: drawNetwork(g),
    correct: CONNECTED[parts - 1],
    inOrder: CONNECTED,
    why:
      parts === 1
        ? 'You can travel along edges from any vertex to every other vertex, so it is connected.'
        : `Some vertices cannot be reached from others: it is in ${parts} separate parts (a vertex with no edges is a part on its own), so it is not connected.`,
    meta: { edges: g.edges },
  })
}

const SET_408 = set('4.08', 'Networks', 'Find degrees of vertices, and decide whether a network can be traced (by counting odd vertices).', [], [mk('degree', m408degree), mk('trace', m408trace, 2), mk('connected', m408connected, 2)], { teacherNote: EXT_NET })

export const NCM8_CH4: GameChapter = {
  id: 'ncm8-ch4',
  number: 4,
  title: 'Geometry',
  ref: 'NCM 8 Chapter 4',
  strand: 'Measurement and space',
  outcomes: [ANG, GEO],
  sets: [SET_401, SET_402, SET_403, SET_404, SET_405, SET_406, SET_407, SET_408],
  colour: 40,
  topics: [],
}
