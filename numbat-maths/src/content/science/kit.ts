// Tools for the science lessons: question banks, particle and atom diagrams, a heating curve, and element data.
// Science questions are mostly multiple choice, with some calculations (density, concentration, subatomic particles).
import type { Generator, Level, Question } from '@/lib/maths/types'
import { mcA, mcFixedA, numA, pick, random, sample, shuffle } from '../helpers'

/** A multiple-choice item: the question, the right answer, wrong answers (3 are used, chosen at random if more) and
 *  the one-line explanation shown as the worked solution. */
export interface MC {
  t: string
  q: string
  a: string
  w: string[]
  why: string
  hint?: string
  d?: string
  /** keep the options in this order (e.g. A, B, C, D for a labelled diagram) */
  fixed?: string[]
  meta?: Record<string, unknown>
}
/** A calculation with a number answer. */
export interface NUM {
  t: string
  q: string
  n: number
  dp?: number
  unit?: string
  why: string[]
  hint?: string
  d?: string
  /** a calculation that allows a calculator (density, concentration); reading values does not */
  calc?: boolean
  meta?: Record<string, unknown>
}
type Item = MC | NUM
/** a bank entry: a fixed item, or a maker for items that change each time; l is the level it belongs to */
export type Entry = (Item & { l: Level }) | { l: Level; f: () => Item }

const isNum = (x: Item): x is NUM => 'n' in x

export function toQuestion(x: Item, hint: string): Question {
  if (isNum(x))
    return {
      prompt: x.q,
      diagram: x.d,
      answer: numA(x.n, x.dp),
      suffix: x.unit,
      hint: x.hint ?? hint,
      steps: x.why,
      calc: x.calc ?? false,
      meta: { t: x.t, ...(x.meta ?? {}) },
    }
  // wrong answers: never the right one, never twice
  const wrong = x.w.filter((w, i) => w !== x.a && x.w.indexOf(w) === i)
  if (wrong.length < 3) throw new Error(`science item "${x.t}" needs at least 3 wrong answers: ${x.q}`)
  return {
    prompt: x.q,
    diagram: x.d,
    answer: x.fixed ? mcFixedA(x.fixed, x.a) : mcA(x.a, sample(wrong, 3)),
    hint: x.hint ?? hint,
    steps: [x.why],
    meta: { t: x.t, ...(x.meta ?? {}) },
  }
}

/** A generator from a bank: a random entry of the level asked for (or the nearest level that has entries). */
export function bank(hint: string, entries: Entry[]): Generator {
  const by = (l: Level) => entries.filter((e) => e.l === l)
  for (const l of [1, 2, 3] as Level[]) if (by(l).length === 0) throw new Error(`a science bank has no level ${l} entries`)
  return (level: Level) => {
    const e = pick(by(level))
    return toQuestion('f' in e ? e.f() : e, hint)
  }
}

export const b = (s: string) => `<b>${s}</b>`
/** chemical formulas with subscripts: "H2O" → H₂O as HTML */
export const chem = (f: string) => f.replace(/(\d+)/g, '<sub>$1</sub>')
export const LETTERS = ['A', 'B', 'C', 'D']

/* ---------------------------------------------------------------- particle diagrams */

/** what a box of particles shows */
export type Box =
  | 'solid'
  | 'liquid'
  | 'gas'
  | 'element' // single atoms of one kind
  | 'elementMolecules' // molecules of one kind of atom (e.g. O₂)
  | 'compound' // molecules made of two kinds of atom
  | 'mixElements' // two kinds of single atoms
  | 'mixElementCompound' // single atoms and molecules of a compound
  | 'mixCompounds' // two different compounds

const S = 120 // box size
const R = 8 // particle radius
const f = (x: number) => Math.round(x * 10) / 10

function atom(x: number, y: number, k: number) {
  return `<circle class="at${k}" cx="${f(x)}" cy="${f(y)}" r="${R}"/>`
}
/** spread positions, n of them chosen at random with a little jitter: a 4 × 4 grid for single atoms, or a 3 × 3 grid
 *  with wider gaps for molecules (two atoms side by side), so separate molecules never touch */
function spread(n: number, x0: number, y0: number, molecules = false): [number, number][] {
  const slots: [number, number][] = []
  const [k, step, edge] = molecules ? [3, 36, 24] : [4, 28, 18]
  for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) slots.push([x0 + edge + i * step + (random() - 0.5) * 4, y0 + edge + j * step + (random() - 0.5) * 4])
  return shuffle(slots).slice(0, n)
}

/** the particles of one box, drawn with its top-left corner at (x0, y0) */
export function boxBody(kind: Box, x0: number, y0: number): string {
  const out: string[] = [`<rect class="ln" x="${x0}" y="${y0}" width="${S}" height="${S}" rx="6"/>`]
  const k1 = 1
  const k2 = 2
  if (kind === 'solid') {
    // touching, in rows: a regular arrangement
    for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) out.push(atom(x0 + 12 + i * 2 * R * 1.0 + R * 0.0, y0 + S - 12 - j * 2 * R, k1))
  } else if (kind === 'liquid') {
    // touching but jumbled, filling the bottom of the box
    const pts: [number, number][] = []
    for (let j = 0; j < 3; j++) for (let i = 0; i < 6; i++) if (random() < 0.85) pts.push([x0 + 12 + i * 16 + (j % 2) * 5 + (random() - 0.5) * 3, y0 + S - 12 - j * 15 + (random() - 0.5) * 3])
    for (const [x, y] of pts) out.push(atom(Math.min(x, x0 + S - 10), y, k1))
  } else if (kind === 'gas') {
    for (const [x, y] of spread(6, x0, y0)) out.push(atom(x, y, k1))
  } else if (kind === 'element') {
    for (const [x, y] of spread(6, x0, y0)) out.push(atom(x, y, k1))
  } else if (kind === 'elementMolecules') {
    for (const [x, y] of spread(5, x0, y0, true)) out.push(atom(x - 6, y, k2), atom(x + 6, y, k2))
  } else if (kind === 'compound') {
    for (const [x, y] of spread(5, x0, y0, true)) out.push(atom(x - 6, y, k1), atom(x + 6, y, k2))
  } else if (kind === 'mixElements') {
    spread(8, x0, y0).forEach(([x, y], i) => out.push(atom(x, y, i % 2 ? k1 : 3)))
  } else if (kind === 'mixElementCompound') {
    spread(7, x0, y0, true).forEach(([x, y], i) => (i % 2 ? out.push(atom(x, y, 3)) : out.push(atom(x - 6, y, k1), atom(x + 6, y, k2))))
  } else {
    spread(6, x0, y0, true).forEach(([x, y], i) => (i % 2 ? out.push(atom(x - 6, y, k1), atom(x + 6, y, k2)) : out.push(atom(x - 6, y, 3), atom(x + 6, y, 4))))
  }
  return out.join('')
}

const svg = (w: number, h: number, label: string, body: string, max = 520) =>
  `<svg class="dg" viewBox="0 0 ${w} ${h}" style="max-width:${max}px" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`

/** One box of particles. */
export const particleBox = (kind: Box, label: string) => svg(S + 4, S + 4, label, boxBody(kind, 2, 2), 170)

/** Four boxes labelled A to D, in the order given. */
export function fourBoxes(kinds: Box[]): string {
  const body = kinds.map((k, i) => boxBody(k, 2 + i * (S + 14), 2) + `<text x="${2 + i * (S + 14) + S / 2}" y="${S + 22}" text-anchor="middle">${LETTERS[i]}</text>`).join('')
  return svg(4 * S + 3 * 14 + 4, S + 30, 'Four boxes of particles labelled A, B, C and D', body)
}

/* ---------------------------------------------------------------- the planetary (Bohr) model of an atom */

/** electrons in each shell for the first 20 elements: 2, 8, 8, 2 */
export const shells = (z: number) => [Math.min(z, 2), Math.min(Math.max(z - 2, 0), 8), Math.min(Math.max(z - 10, 0), 8), Math.max(z - 18, 0)].filter((x) => x > 0)

/** An atom: the nucleus with its protons and neutrons, and the electrons on their shells. */
export function bohr(z: number, n: number, label = 'A model of an atom'): string {
  const cx = 110
  const cy = 110
  const radii = [38, 62, 86, 104]
  const parts: string[] = []
  shells(z).forEach((count, s) => {
    parts.push(`<circle class="ln thin" cx="${cx}" cy="${cy}" r="${radii[s]}"/>`)
    for (let i = 0; i < count; i++) {
      const a = (2 * Math.PI * i) / count - Math.PI / 2 + s * 0.3
      parts.push(`<circle class="el" cx="${f(cx + radii[s] * Math.cos(a))}" cy="${f(cy + radii[s] * Math.sin(a))}" r="5"/>`)
    }
  })
  parts.push(`<circle class="nuc" cx="${cx}" cy="${cy}" r="22"/>`)
  parts.push(`<text x="${cx}" y="${cy - 3}" text-anchor="middle" class="small">${z}p</text><text x="${cx}" y="${cy + 13}" text-anchor="middle" class="small">${n}n</text>`)
  return svg(220, 220, label, parts.join(''), 230)
}

/* ---------------------------------------------------------------- heating curve of water */

export interface Curve {
  /** times (minutes) where each section ends: warming ice, melting, warming water, boiling, warming steam */
  ends: number[]
}
/** A heating curve: ice at −20 °C heated steadily; sections labelled A to E. */
export function heatingCurve(c: Curve): string {
  const W = 420
  const H = 260
  const L0 = 50
  const B0 = 220
  const tMax = c.ends[4]
  const X = (t: number) => L0 + (t / tMax) * (W - L0 - 20)
  const Y = (T: number) => B0 - ((T + 20) / 140) * (B0 - 20)
  const pts: [number, number][] = [
    [0, -20],
    [c.ends[0], 0],
    [c.ends[1], 0],
    [c.ends[2], 100],
    [c.ends[3], 100],
    [c.ends[4], 120],
  ]
  const parts: string[] = []
  for (let T = -20; T <= 120; T += 20) parts.push(`<line class="grid" x1="${L0}" x2="${W - 20}" y1="${f(Y(T))}" y2="${f(Y(T))}"/><text x="${L0 - 6}" y="${f(Y(T) + 5)}" text-anchor="end" class="small">${T < 0 ? '−' + -T : T}</text>`)
  for (let t = 0; t <= tMax; t += 2) parts.push(`<line class="grid" y1="20" y2="${B0}" x1="${f(X(t))}" x2="${f(X(t))}"/><text x="${f(X(t))}" y="${B0 + 18}" text-anchor="middle" class="small">${t}</text>`)
  parts.push(`<line class="axis" x1="${L0}" y1="${B0}" x2="${W - 20}" y2="${B0}"/><line class="axis" x1="${L0}" y1="20" x2="${L0}" y2="${B0}"/>`)
  parts.push(`<polyline class="plot" points="${pts.map(([t, T]) => `${f(X(t))},${f(Y(T))}`).join(' ')}"/>`)
  for (let i = 0; i < 5; i++) {
    const [t1, T1] = pts[i]
    const [t2, T2] = pts[i + 1]
    parts.push(`<text x="${f((X(t1) + X(t2)) / 2)}" y="${f((Y(T1) + Y(T2)) / 2 - 10)}" text-anchor="middle" class="hl">${LETTERS.concat('E')[i]}</text>`)
  }
  parts.push(`<text x="${(L0 + W - 20) / 2}" y="${H - 2}" text-anchor="middle" class="small">Time (minutes)</text>`)
  parts.push(`<text x="14" y="${(20 + B0) / 2}" text-anchor="middle" class="small" transform="rotate(-90 14 ${(20 + B0) / 2})">Temperature (°C)</text>`)
  return svg(W, H, 'Heating curve of water: temperature against time', parts.join(''), 460)
}

/* ---------------------------------------------------------------- elements */

export type Kind = 'metal' | 'non-metal' | 'metalloid'
export interface El {
  z: number
  sym: string
  name: string
  /** mass number of the most common isotope */
  mass: number
  kind: Kind
  group: number
  period: number
  /** state at room temperature (25 °C) */
  state: 'solid' | 'liquid' | 'gas'
}
// Groups numbered 1–18. Mass numbers are those of each element's most common isotope.
export const ELEMENTS: El[] = [
  { z: 1, sym: 'H', name: 'hydrogen', mass: 1, kind: 'non-metal', group: 1, period: 1, state: 'gas' },
  { z: 2, sym: 'He', name: 'helium', mass: 4, kind: 'non-metal', group: 18, period: 1, state: 'gas' },
  { z: 3, sym: 'Li', name: 'lithium', mass: 7, kind: 'metal', group: 1, period: 2, state: 'solid' },
  { z: 4, sym: 'Be', name: 'beryllium', mass: 9, kind: 'metal', group: 2, period: 2, state: 'solid' },
  { z: 5, sym: 'B', name: 'boron', mass: 11, kind: 'metalloid', group: 13, period: 2, state: 'solid' },
  { z: 6, sym: 'C', name: 'carbon', mass: 12, kind: 'non-metal', group: 14, period: 2, state: 'solid' },
  { z: 7, sym: 'N', name: 'nitrogen', mass: 14, kind: 'non-metal', group: 15, period: 2, state: 'gas' },
  { z: 8, sym: 'O', name: 'oxygen', mass: 16, kind: 'non-metal', group: 16, period: 2, state: 'gas' },
  { z: 9, sym: 'F', name: 'fluorine', mass: 19, kind: 'non-metal', group: 17, period: 2, state: 'gas' },
  { z: 10, sym: 'Ne', name: 'neon', mass: 20, kind: 'non-metal', group: 18, period: 2, state: 'gas' },
  { z: 11, sym: 'Na', name: 'sodium', mass: 23, kind: 'metal', group: 1, period: 3, state: 'solid' },
  { z: 12, sym: 'Mg', name: 'magnesium', mass: 24, kind: 'metal', group: 2, period: 3, state: 'solid' },
  { z: 13, sym: 'Al', name: 'aluminium', mass: 27, kind: 'metal', group: 13, period: 3, state: 'solid' },
  { z: 14, sym: 'Si', name: 'silicon', mass: 28, kind: 'metalloid', group: 14, period: 3, state: 'solid' },
  { z: 15, sym: 'P', name: 'phosphorus', mass: 31, kind: 'non-metal', group: 15, period: 3, state: 'solid' },
  { z: 16, sym: 'S', name: 'sulfur', mass: 32, kind: 'non-metal', group: 16, period: 3, state: 'solid' },
  { z: 17, sym: 'Cl', name: 'chlorine', mass: 35, kind: 'non-metal', group: 17, period: 3, state: 'gas' },
  { z: 18, sym: 'Ar', name: 'argon', mass: 40, kind: 'non-metal', group: 18, period: 3, state: 'gas' },
  { z: 19, sym: 'K', name: 'potassium', mass: 39, kind: 'metal', group: 1, period: 4, state: 'solid' },
  { z: 20, sym: 'Ca', name: 'calcium', mass: 40, kind: 'metal', group: 2, period: 4, state: 'solid' },
  { z: 26, sym: 'Fe', name: 'iron', mass: 56, kind: 'metal', group: 8, period: 4, state: 'solid' },
  { z: 29, sym: 'Cu', name: 'copper', mass: 63, kind: 'metal', group: 11, period: 4, state: 'solid' },
  { z: 30, sym: 'Zn', name: 'zinc', mass: 64, kind: 'metal', group: 12, period: 4, state: 'solid' },
  { z: 35, sym: 'Br', name: 'bromine', mass: 79, kind: 'non-metal', group: 17, period: 4, state: 'liquid' },
  { z: 47, sym: 'Ag', name: 'silver', mass: 107, kind: 'metal', group: 11, period: 5, state: 'solid' },
  { z: 50, sym: 'Sn', name: 'tin', mass: 120, kind: 'metal', group: 14, period: 5, state: 'solid' },
  { z: 53, sym: 'I', name: 'iodine', mass: 127, kind: 'non-metal', group: 17, period: 5, state: 'solid' },
  { z: 74, sym: 'W', name: 'tungsten', mass: 184, kind: 'metal', group: 6, period: 6, state: 'solid' },
  { z: 79, sym: 'Au', name: 'gold', mass: 197, kind: 'metal', group: 11, period: 6, state: 'solid' },
  { z: 80, sym: 'Hg', name: 'mercury', mass: 202, kind: 'metal', group: 12, period: 6, state: 'liquid' },
  { z: 82, sym: 'Pb', name: 'lead', mass: 208, kind: 'metal', group: 14, period: 6, state: 'solid' },
]
export const el = (sym: string) => ELEMENTS.find((e) => e.sym === sym)!
/** the first 20, used for atomic structure (chlorine is left out of neutron questions: two common isotopes) */
export const FIRST20 = ELEMENTS.filter((e) => e.z <= 20)
export const cap = (s: string) => s[0].toUpperCase() + s.slice(1)

/** a fixed multiple-choice entry: level, kind, question, right answer, wrong answers, explanation */
export const m = (l: Level, t: string, q: string, a: string, w: string[], why: string, extra: Partial<MC> = {}): Entry => ({ l, t, q, a, w, why, ...extra })
/** an entry made fresh each time */
export const mk = (l: Level, f: () => Item): Entry => ({ l, f })
/** a number shown to a sensible number of decimal places, without trailing zeros */
export const nf = (x: number, dp = 2) => String(Math.round(x * 10 ** dp) / 10 ** dp)
