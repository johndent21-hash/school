// Class games for New Century Maths 8 (3rd edition, Cengage) Chapter 12, Similar figures and surface area: one set of
// quick questions for each exercise, 12.01 to 12.05.
//
// Syllabus: NSW Mathematics K–10 (2022). Everything in this chapter is Stage 5 content: similar figures and scale
// factors (MA5-GEO-C-01, 12.01–12.03; 12.01 is starred in the textbook) and the surface area of right prisms and
// cylinders (MA5-ARE-C-01, 12.04–12.05). So every set is marked as extension for Year 8 (empty outcomes, a teacher
// note). The game is played without calculators: cylinder answers are exact (in terms of π).
// Answers are checked by tests/game-checks/ncm8-ch12.ts.
import type { GameChapter, GameQuestion, GameSet } from '@/lib/game/types'
import { D, DG, DIVIDE, NOT_TO_SCALE, TIMES, U, chance, gq, int, mk, num, numOpts, pick } from './helpers'

const EXT_SIM = 'Similar figures are Stage 5 content (MA5-GEO-C-01): extension for Year 8.'
const EXT_SA = 'Surface area of prisms and cylinders is Stage 5 content (MA5-ARE-C-01): extension for Year 8.'
const b = (s: string) => `<b>${s}</b>`
const it = (s: string) => `<i>${s}</i>`
const sq = (u: string) => u + '²'
const piU = (k: number, u: string) => `${num(k)}π ${u}`

const set = (exn: string, title: string, focus: string, makers: GameSet['makers'], note: string): GameSet => ({
  id: `ncm8-${exn}`,
  exercise: exn,
  ref: `NCM 8 Ex ${exn}`,
  title,
  focus,
  outcomes: [],
  makers,
  teacherNote: note,
})

// ================================================================== 12.01 Similar figures (extension)

function m1201which(): GameQuestion {
  const w = int(2, 6)
  let h = int(3, 9)
  if (h === w) h++
  const k = pick([2, 3, 4, 1.5, 2.5])
  const dims = (a: number, c: number) => `${num(a)} cm by ${num(c)} cm`
  const add = k === 1.5 || k === 2.5 ? 2 : k
  return gq({
    t: 'which',
    prompt: `A rectangle is ${b(dims(w, h))}. Which rectangle is similar to it?`,
    correct: dims(w * k, h * k),
    // the same amount added to each side, only one side scaled, sides scaled by different amounts
    wrong: [dims(w + add, h + add), dims(w * k, h), dims(w * k, h * (k + 1)), dims(w + 1, h * k)],
    why: `Similar shapes are enlargements: every side is multiplied by the same scale factor, here ${num(k)}.`,
    meta: {},
  })
}

function m1201factor(): GameQuestion {
  const a = int(2, 9)
  const up = chance(0.7)
  const k = up ? pick([2, 3, 4, 5]) : 0.5
  const img = a * k
  if (!up && !Number.isInteger(img)) return m1201factor()
  return gq({
    t: 'factor',
    prompt: `A shape is enlarged or reduced so that a side of ${b(`${a} cm`)} becomes ${b(`${num(img)} cm`)}. What is the scale factor?`,
    correct: num(k),
    // the difference, the other way round
    wrong: [img - a, a / img, img + a, k * 2, k + 1].filter((v, i, arr) => v > 0 && v !== k && arr.indexOf(v) === i).map((v) => num(Math.round(v * 100) / 100)),
    why: `Scale factor = image length ${DIVIDE} original length = ${num(img)} ${DIVIDE} ${a} = ${num(k)}.`,
    meta: {},
  })
}

const SET_1201 = set('12.01', 'Similar figures', 'Similar figures have the same shape: all sides enlarged or reduced by the same scale factor.', [mk('which', m1201which), mk('factor', m1201factor)], EXT_SIM)

// ================================================================== 12.02 Properties of similar figures (extension)

function m1202angle(): GameQuestion {
  const A = int(30, 80)
  const B = int(30, 150 - A)
  const C = 180 - A - B
  const k = pick([2, 3, 4])
  return gq({
    t: 'angle',
    prompt: `Triangle ${it('ABC')} (angle ${it('A')} = ${A}°, angle ${it('B')} = ${B}°) is enlarged by a scale factor of ${k} to triangle ${it('PQR')}, with ${it('P')} matching ${it('A')} and ${it('Q')} matching ${it('B')}. Find angle ${it('R')}.`,
    correct: `${C}°`,
    // the angle scaled too, one of the given angles, 180 − one angle
    wrong: [C * k, A, B, 180 - A, 180 - B, C + 10, 90].filter((v, i, arr) => v !== C && v < 360 && arr.indexOf(v) === i).map((v) => `${v}°`),
    why: `Matching angles of similar figures are equal; an enlargement does not change angles. Angle ${it('R')} = angle ${it('C')} = 180° − ${A}° − ${B}° = ${C}°.`,
    meta: {},
  })
}

function m1202ratio(): GameQuestion {
  const a = int(2, 9)
  const k = pick([2, 3, 4, 5])
  const bb = a * k
  return gq({
    t: 'ratio',
    prompt: `Two similar squares have sides of ${b(`${a} cm`)} and ${b(`${bb} cm`)}. What is the ratio of their matching sides, smaller : larger?`,
    correct: `1 : ${k}`,
    wrong: [`${k} : 1`, `1 : ${k * k}`, `1 : ${bb - a}`, `${a} : ${k}`].filter((s, i, arr) => s !== `1 : ${k}` && arr.indexOf(s) === i),
    why: `${a} : ${bb} = 1 : ${k} (divide both by ${a}). Every pair of matching sides is in this ratio.`,
    meta: {},
  })
}

const SET_1202 = set('12.02', 'Properties of similar figures', 'In similar figures matching angles are equal and matching sides are in the same ratio.', [mk('angle', m1202angle), mk('ratio', m1202ratio)], EXT_SIM)

// ================================================================== 12.03 Finding sides in similar figures (extension)

function m1203side(): GameQuestion {
  const AB = int(2, 9)
  let BC = int(3, 12)
  if (BC === AB) BC++
  const k = pick([2, 3, 1.5, 2.5, 4])
  const PQ = AB * k
  const QR = BC * k
  if (!Number.isInteger(PQ) || !Number.isInteger(QR)) return m1203side()
  return gq({
    t: 'side',
    prompt: `Triangles ${it('ABC')} and ${it('PQR')} are similar (${it('AB')} matches ${it('PQ')}, ${it('BC')} matches ${it('QR')}). ${it('AB')} = ${AB} cm, ${it('BC')} = ${BC} cm, ${it('PQ')} = ${PQ} cm. Find ${it('QR')}.`,
    correct: `${QR} cm`,
    // added the difference instead of multiplying, divided the wrong way, used the other side
    wrong: [BC + (PQ - AB), Math.round((BC / k) * 100) / 100, PQ, BC * k + 1].filter((v, i, arr) => v > 0 && v !== QR && arr.indexOf(v) === i).map((v) => `${num(v)} cm`),
    why: `Scale factor = ${PQ} ${DIVIDE} ${AB} = ${num(k)}. ${it('QR')} = ${BC} ${TIMES} ${num(k)} = ${QR} cm.`,
    meta: {},
  })
}

const SET_1203 = set('12.03', 'Finding sides in similar figures', 'Find the scale factor from a pair of matching sides, then use it to find an unknown side.', [mk('side', m1203side)], EXT_SIM)

// ================================================================== 12.04 Surface area of a prism (extension)

function m1204cube(): GameQuestion {
  const u = pick(['cm', 'm'])
  const s = int(2, 10)
  return gq({
    t: 'cube',
    prompt: 'Find the surface area of this cube.',
    diagram: DG.cube(U(s, u)),
    // one face, the volume, four faces
    ...numOpts(6 * s * s, [s * s, s * s * s, 4 * s * s, 12 * s], (x) => U(x, sq(u))),
    why: `A cube has 6 equal square faces: 6 ${TIMES} ${s}² = 6 ${TIMES} ${s * s} = ${6 * s * s} ${sq(u)}.`,
    meta: {},
  })
}

function m1204box(): GameQuestion {
  const u = pick(['cm', 'm'])
  const l = int(3, 10)
  const w = int(2, 8)
  const h = int(2, 8)
  const SA = 2 * (l * w + l * h + w * h)
  return gq({
    t: 'box',
    prompt: 'Find the surface area of this rectangular prism.',
    diagram: D.rectPrism(l, w, h, U(l, u), U(w, u), U(h, u)),
    // only three faces, the volume, the sum of the edges
    ...numOpts(SA, [SA / 2, l * w * h, 4 * (l + w + h), 2 * l * w + l * h + w * h], (x) => U(x, sq(u))),
    why: `Three pairs of rectangles: 2 ${TIMES} (${l} ${TIMES} ${w} + ${l} ${TIMES} ${h} + ${w} ${TIMES} ${h}) = 2 ${TIMES} ${SA / 2} = ${SA} ${sq(u)}.`,
    meta: {},
  })
}

function m1204tri(): GameQuestion {
  const u = 'cm'
  const [p, q, r] = pick([
    [3, 4, 5],
    [6, 8, 10],
    [5, 12, 13],
  ])
  const l = int(4, 12)
  const SA = p * q + (p + q + r) * l
  return gq({
    t: 'tri',
    prompt: 'Find the surface area of this triangular prism.',
    diagram: D.triPrism(p, q, l, U(p, u), U(q, u), U(l, u), U(r, u)),
    note: NOT_TO_SCALE,
    // both triangles counted as rectangles, one triangle only, the volume
    ...numOpts(SA, [2 * p * q + (p + q + r) * l, (p * q) / 2 + (p + q + r) * l, (p * q * l) / 2, (p + q) * l + p * q], (x) => U(x, sq(u))),
    why: `Two triangles: 2 ${TIMES} ½ ${TIMES} ${p} ${TIMES} ${q} = ${p * q}. Three rectangles: (${p} + ${q} + ${r}) ${TIMES} ${l} = ${(p + q + r) * l}. Total ${SA} cm².`,
    meta: {},
  })
}

const SET_1204 = set('12.04', 'Surface area of a prism', 'Add the areas of all the faces: use the net to see each one.', [mk('cube', m1204cube), mk('box', m1204box), mk('tri', m1204tri, 2)], EXT_SA)

// ================================================================== 12.05 Surface area of a cylinder (extension)

function m1205closed(): GameQuestion {
  const u = pick(['cm', 'm'])
  const r = int(2, 8)
  const h = int(2, 12)
  const k = 2 * r * r + 2 * r * h
  return gq({
    t: 'closed',
    prompt: 'Find the surface area of this closed cylinder, in terms of π.',
    diagram: D.cylinder(r, h, U(r, u), U(h, u)),
    note: NOT_TO_SCALE,
    // one end only, the curved surface only, the volume
    ...numOpts(k, [r * r + 2 * r * h, 2 * r * h, r * r * h, 2 * r * r + r * h], (x) => piU(x, sq(u))),
    why: `Two circles 2 ${TIMES} π${it('r')}² = ${2 * r * r}π and the curved surface 2π${it('rh')} = ${2 * r * h}π: total ${k}π ${sq(u)}.`,
    meta: {},
  })
}

function m1205curved(): GameQuestion {
  const u = pick(['cm', 'm'])
  const r = int(2, 8)
  const h = int(2, 12)
  const k = 2 * r * h
  return gq({
    t: 'curved',
    prompt: 'Find the area of the curved surface of this cylinder, in terms of π.',
    diagram: D.cylinder(r, h, U(r, u), U(h, u)),
    note: NOT_TO_SCALE,
    // πrh, the whole surface, the volume
    ...numOpts(k, [r * h, 2 * r * r + 2 * r * h, r * r * h, 2 * r * r], (x) => piU(x, sq(u))),
    why: `The curved surface unrolls into a rectangle ${it('C')} by ${it('h')}: 2π${it('r')} ${TIMES} ${it('h')} = 2π ${TIMES} ${r} ${TIMES} ${h} = ${k}π ${sq(u)}.`,
    meta: {},
  })
}

function m1205open(): GameQuestion {
  const u = 'cm'
  const r = int(2, 8)
  const d = 2 * r
  const h = int(2, 12)
  const k = r * r + 2 * r * h
  return gq({
    t: 'open',
    prompt: 'Find the outside surface area of this cylinder, which is open at the top, in terms of π.',
    diagram: D.cylinder(r, h, U(d, u), U(h, u), true),
    note: NOT_TO_SCALE,
    // both ends, the diameter used as the radius, no ends
    ...numOpts(k, [2 * r * r + 2 * r * h, d * d + 2 * d * h, 2 * r * h, r * r + r * h], (x) => piU(x, sq(u))),
    why: `The radius is ${d} ${DIVIDE} 2 = ${r}. One circle π${it('r')}² = ${r * r}π, plus the curved surface 2π${it('rh')} = ${2 * r * h}π: ${k}π cm².`,
    meta: {},
  })
}

const SET_1205 = set('12.05', 'Surface area of a cylinder', 'Surface area = two circles (2πr²) + the curved surface (2πrh), in terms of π.', [mk('curved', m1205curved), mk('closed', m1205closed), mk('open', m1205open, 2)], EXT_SA)

export const NCM8_CH12: GameChapter = {
  id: 'ncm8-ch12',
  number: 12,
  title: 'Similar figures and surface area',
  ref: 'NCM 8 Chapter 12',
  strand: 'Measurement and space',
  outcomes: [],
  sets: [SET_1201, SET_1202, SET_1203, SET_1204, SET_1205],
  colour: 50,
  topics: [],
}
