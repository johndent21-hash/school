// Class games for New Century Maths 7 (3rd edition, Cengage) Chapter 6, Geometrical figures: one set of quick
// questions for each exercise, 6.01 to 6.10.
//
// The questions are the site's own. Every question is ONE step with four choices. Drawings are to scale: shapes on
// a grid sit exactly on grid points, triangles and quadrilaterals are drawn from their angles, and the test
// measures every drawing (tests/game-checks/ncm7-ch6.ts).
//
// Syllabus: NSW Mathematics K–10 (2022). 6.05–6.10 are Stage 4, Properties of geometrical figures MA4-GEO-C-01.
// 6.01–6.04 (transformations and symmetry) have no Stage 4 content point: they are Stage 3 content
// (two-dimensional spatial structure), and Stage 5 returns to them on the number plane (path MA5-LIN-P-01).
import type { GameChapter, GameQuestion, GameSet } from '@/lib/game/types'
import { D, chance, gq, int, mk, num, pick, sample, shuffle } from './helpers'

type P = [number, number]
const GEO = 'MA4-GEO-C-01'
const REVISION =
  'Revision of Stage 3 (two-dimensional spatial structure): the Stage 4 syllabus has no content point for transformations or symmetry. Stage 5 returns to them on the number plane.'
const deg = (x: number) => `${num(x)}°`
const rad = (d: number) => (d * Math.PI) / 180
/** direction from a to b in degrees, anticlockwise from east, on screen (y down) */
const dir = (a: P, b: P) => ((Math.atan2(-(b[1] - a[1]), b[0] - a[0]) * 180) / Math.PI + 360) % 360
const fmt = (x: number) => String(Math.round(x * 10) / 10)

/** scale and centre points (y down) to fit a W × H box with padding */
function fitPts(pts: P[], W: number, H: number, pad: number): P[] {
  const xs = pts.map((p) => p[0])
  const ys = pts.map((p) => p[1])
  const w = Math.max(...xs) - Math.min(...xs) || 1
  const h = Math.max(...ys) - Math.min(...ys) || 1
  const k = Math.min((W - 2 * pad) / w, (H - 2 * pad) / h)
  const ox = (W - k * w) / 2 - k * Math.min(...xs)
  const oy = (H - k * h) / 2 - k * Math.min(...ys)
  return pts.map(([x, y]) => [ox + k * x, oy + k * y])
}
const polygon = (pts: P[], cls = 'sh') => `<polygon class="${cls}" points="${pts.map(([x, y]) => `${fmt(x)},${fmt(y)}`).join(' ')}"/>`

// ================================================================== shapes on a grid (6.01)

/** shapes with no symmetry at all, so a translation, a reflection and a rotation always look different */
const PIECES: { pts: P[]; inside: P }[] = [
  { pts: [[0, 0], [1, 0], [1, 2], [2, 2], [2, 3], [0, 3]], inside: [0.5, 0.5] }, // L, arms 3 and 2
  { pts: [[0, 0], [2, 0], [2, 2], [1, 2], [1, 3], [0, 3]], inside: [0.5, 0.5] }, // P
  { pts: [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [1, 2], [1, 4], [0, 4]], inside: [0.5, 0.5] }, // Y
]
const COLS = 14
const ROWS = 8
const GU = 26
const shift = (pts: P[], dx: number, dy: number): P[] => pts.map(([x, y]) => [x + dx, y + dy])
const box = (pts: P[]) => {
  const xs = pts.map((p) => p[0])
  const ys = pts.map((p) => p[1])
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }
}
/** turn about the origin: quarter turns clockwise on screen */
function turn(pts: P[], quarters: number): P[] {
  let out = pts
  for (let i = 0; i < quarters; i++) out = out.map(([x, y]) => [-y, x])
  return out
}
function gridPic(a: P[], aIn: P, b: P[], bIn: P): string {
  let body = ''
  for (let i = 0; i <= COLS; i++) body += `<line class="grid" x1="${10 + i * GU}" y1="10" x2="${10 + i * GU}" y2="${10 + ROWS * GU}"/>`
  for (let j = 0; j <= ROWS; j++) body += `<line class="grid" x1="10" y1="${10 + j * GU}" x2="${10 + COLS * GU}" y2="${10 + j * GU}"/>`
  const px = (pts: P[]) => pts.map(([x, y]) => [10 + x * GU, 10 + y * GU] as P)
  body += polygon(px(a), 'sh shapeA') + polygon(px(b), 'sh2 shapeB')
  body += D.text(px([aIn])[0], 'A', 'dl vx') + D.text(px([bIn])[0], 'B', 'dl vx')
  return D.svg(20 + COLS * GU, 20 + ROWS * GU, body, 'Shape A and shape B on a grid', 440)
}
/** shape A somewhere on the left of the grid, and its image B made by `move`, both on the grid and apart */
function placePair(move: (pts: P[]) => P[]): { a: P[]; aIn: P; b: P[]; bIn: P } {
  for (;;) {
    const piece = pick(PIECES)
    const q = int(0, 3)
    let a = turn(piece.pts, q)
    let aIn = turn([piece.inside], q)[0]
    const ba = box(a)
    const dx = int(1, 4) - ba.x0
    const dy = int(1, ROWS - 1 - (ba.y1 - ba.y0)) - ba.y0
    a = shift(a, dx, dy)
    aIn = [aIn[0] + dx, aIn[1] + dy]
    const moved = move([...a, aIn])
    const b = moved.slice(0, -1)
    const bIn = moved[moved.length - 1]
    const A = box(a)
    const B = box(b)
    const inside = B.x0 >= 0 && B.x1 <= COLS && B.y0 >= 0 && B.y1 <= ROWS
    const apart = B.x0 >= A.x1 + 1 || B.x1 <= A.x0 - 1 || B.y0 >= A.y1 + 1 || B.y1 <= A.y0 - 1
    if (inside && apart) return { a, aIn, b, bIn }
  }
}

const MOVES = ['Translation', 'Reflection', 'Rotation', 'Enlargement']

function m601which(): GameQuestion {
  const kind = int(0, 2)
  let pair: ReturnType<typeof placePair>
  if (kind === 0) {
    const dx = int(4, 9)
    const dy = int(-3, 3)
    pair = placePair((pts) => shift(pts, dx, dy))
  } else if (kind === 1) {
    // a true reflection: in a vertical mirror line, with no sliding along it
    const gap = int(1, 4)
    pair = placePair((pts) => {
      const c = box(pts.slice(0, -1)).x1 + gap / 2
      return pts.map(([x, y]) => [2 * c - x, y])
    })
  } else {
    const q = int(1, 3)
    const dx = int(5, 9)
    pair = placePair((pts) => {
      const t = turn(pts, q)
      const bt = box(t.slice(0, -1))
      const b0 = box(pts.slice(0, -1))
      return shift(t, b0.x0 - bt.x0 + dx, b0.y0 - bt.y0 + int(-1, 1))
    })
  }
  return gq({
    t: 'which',
    prompt: 'Which single transformation moves shape A onto shape B?',
    diagram: gridPic(pair.a, pair.aIn, pair.b, pair.bIn),
    correct: MOVES[kind],
    inOrder: MOVES,
    why: [
      'B is A slid across the grid without turning or flipping: a translation.',
      'B is a mirror image of A: a reflection.',
      'B is A turned (and not flipped): a rotation.',
    ][kind],
    meta: { kind },
  })
}

const slide = (dx: number, dy: number) =>
  [dx && `${Math.abs(dx)} ${Math.abs(dx) === 1 ? 'unit' : 'units'} ${dx > 0 ? 'right' : 'left'}`, dy && `${Math.abs(dy)} ${Math.abs(dy) === 1 ? 'unit' : 'units'} ${dy > 0 ? 'down' : 'up'}`]
    .filter(Boolean)
    .join(', ')

function m601slide(): GameQuestion {
  const dx = int(4, 9)
  const dy = pick([-3, -2, -1, 1, 2, 3])
  const pair = placePair((pts) => shift(pts, dx, dy))
  return gq({
    t: 'slide',
    prompt: 'Shape A is translated onto shape B. Describe the translation.',
    diagram: gridPic(pair.a, pair.aIn, pair.b, pair.bIn),
    correct: slide(dx, dy),
    // up and down mixed up, the numbers swapped, counted the gap between the shapes
    wrong: [slide(dx, -dy), slide(Math.abs(dy) === dx ? dx + 1 : Math.abs(dy), Math.sign(dy) * dx), slide(dx - (box(pair.a).x1 - box(pair.a).x0), dy), slide(dx + 1, dy)],
    why: `Follow one corner of A to the matching corner of B: ${slide(dx, dy)}.`,
    meta: { dx, dy },
  })
}

const SET_601: GameSet = {
  id: 'ncm7-6.01',
  exercise: '6.01',
  ref: 'NCM 7 Ex 6.01',
  title: 'Transformations',
  focus: 'Tell translations, reflections and rotations apart, and describe a translation on a grid.',
  outcomes: [],
  teacherNote: REVISION,
  makers: [mk('which', m601which), mk('slide', m601slide)],
}

// ================================================================== 6.02 Composite transformations

function m602translate(): GameQuestion {
  let a: P, b: P, s: P
  do {
    a = [pick([-5, -4, -3, -2, 2, 3, 4, 5]), pick([-4, -3, -2, 0, 2, 3, 4])]
    b = [pick([-5, -4, -3, -2, 2, 3, 4, 5]), pick([-4, -3, -2, 0, 2, 3, 4])]
    s = [a[0] + b[0], a[1] + b[1]]
  } while (s[0] === 0 || Math.sign(a[0]) === Math.sign(b[0]))
  return gq({
    t: 'translate',
    prompt: `A shape is translated ${slide(...a)}, then ${slide(...b)}. What single translation has the same effect?`,
    correct: slide(...s),
    // one direction reversed, the moves subtracted, the second move only
    wrong: [slide(a[0] - b[0], s[1]), slide(-s[0], s[1]), ...(s[1] ? [slide(s[0], -s[1])] : []), slide(a[0] - b[0], a[1] - b[1]), slide(...b), slide(s[0] + Math.sign(s[0]), s[1]), slide(s[0], s[1] + 1)],
    why: `Across: ${slide(a[0], 0)} and ${slide(b[0], 0)} make ${slide(s[0], 0)}. Up and down: ${s[1] ? slide(0, s[1]) : 'no move'}. Altogether: ${slide(...s)}.`,
    meta: { a, b },
  })
}

const TURNS = ['90° clockwise', '180°', '90° anticlockwise', 'No change (a full turn)']

function m602rotate(): GameQuestion {
  const t1 = pick([90, 180, 270])
  const t2 = pick([90, 180, 270])
  const say = (t: number) => (t === 180 ? '180°' : t === 90 ? '90° clockwise' : '90° anticlockwise')
  const total = (t1 + t2) % 360
  return gq({
    t: 'rotate',
    prompt: `A shape is rotated ${say(t1)} about a point, then ${say(t2)} about the same point. What single rotation has the same effect?`,
    correct: TURNS[total === 0 ? 3 : total / 90 - 1],
    inOrder: TURNS,
    why: `Count everything clockwise (90° anticlockwise is 270° clockwise): ${t1}° + ${t2}° = ${t1 + t2}°${t1 + t2 >= 360 ? `, which is ${total}° after a full turn` : ''}, so the answer is ${TURNS[total === 0 ? 3 : total / 90 - 1].toLowerCase()}.`,
    meta: { t1, t2 },
  })
}

const SET_602: GameSet = {
  id: 'ncm7-6.02',
  exercise: '6.02',
  ref: 'NCM 7 Ex 6.02',
  title: 'Composite transformations',
  focus: 'Combine two transformations into one: two translations make a translation, two turns about a point make a turn.',
  outcomes: [],
  teacherNote: REVISION,
  makers: [mk('translate', m602translate), mk('rotate', m602rotate)],
}

// ================================================================== 6.03 and 6.04 Symmetry

const regular = (n: number): P[] => Array.from({ length: n }, (_, k) => [Math.sin((2 * Math.PI * k) / n), -Math.cos((2 * Math.PI * k) / n)] as P)
/** named shapes, with their axes of symmetry and order of rotational symmetry */
const FIGURES: { name: string; pts: P[]; axes: number; order: number }[] = [
  { name: 'square', pts: [[0, 0], [1, 0], [1, 1], [0, 1]], axes: 4, order: 4 },
  { name: 'rectangle', pts: [[0, 0], [1.8, 0], [1.8, 1], [0, 1]], axes: 2, order: 2 },
  { name: 'rhombus', pts: [[0, 0.65], [1, 0], [2, 0.65], [1, 1.3]], axes: 2, order: 2 },
  { name: 'parallelogram', pts: [[0, 1], [1.6, 1], [2.2, 0], [0.6, 0]], axes: 0, order: 2 },
  { name: 'kite', pts: [[1, 0], [1.6, 0.6], [1, 2], [0.4, 0.6]], axes: 1, order: 1 },
  { name: 'isosceles trapezium', pts: [[0, 1], [2.2, 1], [1.6, 0], [0.6, 0]], axes: 1, order: 1 },
  { name: 'equilateral triangle', pts: regular(3), axes: 3, order: 3 },
  { name: 'isosceles triangle', pts: [[0, 2.2], [1, 0], [2, 2.2]], axes: 1, order: 1 },
  { name: 'scalene triangle', pts: [[0, 1.6], [2.6, 1.6], [0.9, 0]], axes: 0, order: 1 },
  { name: 'regular pentagon', pts: regular(5), axes: 5, order: 5 },
  { name: 'regular hexagon', pts: regular(6), axes: 6, order: 6 },
  { name: 'regular octagon', pts: regular(8), axes: 8, order: 8 },
]
const figure = (pts: P[]) => D.svg(240, 190, polygon(fitPts(pts, 240, 190, 24)), 'A shape', 260)
const numWrongFrom = (right: number, pool: number[]) => shuffle(pool.filter((x) => x !== right)).slice(0, 3)

function m603axes(): GameQuestion {
  const f = pick(FIGURES)
  return gq({
    t: 'axes',
    prompt: 'How many axes of symmetry does this shape have?',
    diagram: figure(f.pts),
    correct: String(f.axes),
    wrong: numWrongFrom(f.axes, [0, 1, 2, 3, 4, f.axes + 1, f.axes * 2].filter((x, i, a) => a.indexOf(x) === i)).map(String),
    why: `This ${f.name} can be folded onto itself along ${f.axes === 0 ? 'no line' : f.axes === 1 ? '1 line' : `${f.axes} different lines`}.`,
    meta: { name: f.name },
  })
}

function m603which(): GameQuestion {
  let four: typeof FIGURES
  do four = sample(FIGURES, 4)
  while (new Set(four.map((f) => f.axes)).size < 4)
  const right = pick(four)
  return gq({
    t: 'which',
    prompt: `Which shape has exactly ${right.axes} ${right.axes === 1 ? 'axis' : 'axes'} of symmetry?`,
    correct: cap(right.name),
    wrong: four.filter((f) => f !== right).map((f) => cap(f.name)),
    why: `A ${right.name} has ${right.axes} ${right.axes === 1 ? 'axis' : 'axes'} of symmetry.`,
    meta: { axes: right.axes },
  })
}
const cap = (s: string) => s[0].toUpperCase() + s.slice(1)

const SET_603: GameSet = {
  id: 'ncm7-6.03',
  exercise: '6.03',
  ref: 'NCM 7 Ex 6.03',
  title: 'Line symmetry',
  focus: 'Count the axes of symmetry of triangles, quadrilaterals and regular polygons.',
  outcomes: [],
  teacherNote: REVISION,
  makers: [mk('axes', m603axes), mk('which', m603which, 2)],
}

const orderText = (k: number) => (k === 1 ? 'None' : String(k))

function m604order(): GameQuestion {
  const f = pick(FIGURES)
  return gq({
    t: 'order',
    prompt: 'What is the order of rotational symmetry of this shape? (None if it has no rotational symmetry.)',
    diagram: figure(f.pts),
    correct: orderText(f.order),
    wrong: numWrongFrom(f.order, [1, 2, 3, 4, f.order + 1, f.order * 2].filter((x, i, a) => a.indexOf(x) === i)).map(orderText),
    why:
      f.order === 1
        ? `This ${f.name} only fits onto itself after a full turn, so it has no rotational symmetry.`
        : `This ${f.name} fits onto itself ${f.order} times in a full turn: order ${f.order}.`,
    meta: { name: f.name },
  })
}

function m604turn(): GameQuestion {
  const f = pick(FIGURES.filter((x) => x.order > 1))
  const a = 360 / f.order
  return gq({
    t: 'turn',
    prompt: `What is the smallest turn about its centre that fits a ${f.name} exactly onto itself?`,
    correct: deg(a),
    wrong: shuffle([45, 60, 72, 90, 120, 180, 360].filter((x) => x !== a)).slice(0, 3).map(deg),
    why: `It fits onto itself ${f.order} times in a full turn: 360° ÷ ${f.order} = ${deg(a)}.`,
    meta: { name: f.name },
  })
}

const SET_604: GameSet = {
  id: 'ncm7-6.04',
  exercise: '6.04',
  ref: 'NCM 7 Ex 6.04',
  title: 'Rotational symmetry',
  focus: 'Find the order of rotational symmetry, and the smallest turn that fits a shape onto itself.',
  outcomes: [],
  teacherNote: REVISION,
  makers: [mk('order', m604order), mk('turn', m604turn, 2)],
}

// ================================================================== 6.05 Classifying triangles

const ANGLE_TYPES = ['Acute-angled', 'Right-angled', 'Obtuse-angled', 'Not possible']

function m605angles(): GameQuestion {
  const kind = int(0, 3)
  let a: number, b: number, c: number
  if (kind === 1) {
    a = 90
    b = 5 * int(5, 13)
    c = 90 - b
  } else if (kind === 2) {
    a = 5 * int(20, 26)
    b = 5 * int(4, Math.floor((175 - a) / 5) - 4)
    c = 180 - a - b
  } else if (kind === 0) {
    do {
      a = 5 * int(10, 17)
      b = 5 * int(10, 17)
      c = 180 - a - b
    } while (c >= 90 || c < 30)
  } else {
    // the angles do not add to 180°
    a = 5 * int(10, 17)
    b = 5 * int(8, 14)
    c = 5 * int(4, 16) + pick([-10, 10])
    if (a + b + c === 180) c += 15
  }
  const angles = shuffle([a, b, c])
  return gq({
    t: 'angles',
    prompt: `A triangle has angles of ${angles.map(deg).join(', ').replace(/, ([^,]*)$/, ' and $1')}. What type of triangle is it?`,
    correct: ANGLE_TYPES[kind],
    inOrder: ANGLE_TYPES,
    why:
      kind === 3
        ? `${angles.join('° + ')}° = ${a + b + c}°, not 180°, so no triangle has these angles.`
        : `The angles add to 180°. The largest is ${deg(Math.max(a, b, c))}, so it is ${ANGLE_TYPES[kind].toLowerCase()}.`,
    meta: { angles },
  })
}

/** the three sides (in proportion to the sines of the opposite angles) differ by at least 8%, so they look different */
function clearlyScalene(a: number, b: number): boolean {
  const L = [a, b, 180 - a - b].map((x) => Math.sin(rad(x)))
  return [0, 1, 2].every((i) => Math.abs(L[i] - L[(i + 1) % 3]) / Math.max(L[i], L[(i + 1) % 3]) >= 0.08)
}

const TRI_KINDS: { sides: string; angles: string; make: () => [number, number] }[] = [
  { sides: 'Equilateral', angles: 'acute-angled', make: () => [60, 60] },
  { sides: 'Isosceles', angles: 'acute-angled', make: () => { const b = pick([50, 55, 65, 70, 75]); return [b, b] } },
  { sides: 'Isosceles', angles: 'right-angled', make: () => [45, 45] },
  { sides: 'Isosceles', angles: 'obtuse-angled', make: () => { const b = pick([20, 25, 30, 35]); return [b, b] } },
  {
    sides: 'Scalene',
    angles: 'acute-angled',
    make: () => {
      let a: number, b: number
      do {
        a = 5 * int(9, 16)
        b = 5 * int(9, 16)
      } while (180 - a - b > 80 || !clearlyScalene(a, b))
      return [a, b]
    },
  },
  { sides: 'Scalene', angles: 'right-angled', make: () => [90, pick([25, 30, 35, 55, 60, 65])] },
  {
    sides: 'Scalene',
    angles: 'obtuse-angled',
    make: () => {
      let a: number, b: number
      do {
        a = 5 * int(21, 26)
        b = 5 * int(4, 8)
      } while (180 - a - b < 20 || !clearlyScalene(a, b))
      return [a, b]
    },
  },
]
const triName = (k: { sides: string; angles: string }) => `${k.sides}, ${k.angles}`

function m605drawn(): GameQuestion {
  const k = pick(TRI_KINDS)
  const [A, B] = k.make()
  const C = 180 - A - B
  const eq = (x: number, y: number) => Math.abs(x - y) < 0.5
  // equal sides are opposite equal angles: AB is opposite C, BC opposite A, CA opposite B
  const ticks: [number, number, number] = eq(A, B) && eq(B, C) ? [1, 1, 1] : eq(A, B) ? [0, 1, 1] : eq(B, C) ? [1, 1, 0] : eq(A, C) ? [1, 0, 1] : [0, 0, 0]
  const rightAt = [A, B, C].findIndex((x) => eq(x, 90))
  const others = TRI_KINDS.filter((o) => o !== k)
  const near = others.filter((o) => o.sides === k.sides || o.angles === k.angles)
  return gq({
    t: 'drawn',
    prompt: 'Classify this triangle by its sides and by its angles.',
    diagram: D.triangle(A, B, { ticks, ...(rightAt >= 0 ? { rightAt } : {}) }),
    correct: triName(k),
    wrong: [...shuffle(near), ...shuffle(others)].map(triName),
    why: `${k.sides === 'Scalene' ? 'No sides are marked equal' : k.sides === 'Equilateral' ? 'All 3 sides are marked equal' : '2 sides are marked equal'}, and ${rightAt >= 0 ? 'it has a right angle' : k.angles === 'obtuse-angled' ? 'one angle is obtuse' : 'all angles are acute'}: ${triName(k).toLowerCase()}.`,
    meta: { A, B },
  })
}

const SET_605: GameSet = {
  id: 'ncm7-6.05',
  exercise: '6.05',
  ref: 'NCM 7 Ex 6.05',
  title: 'Classifying triangles',
  focus: 'Classify triangles by their sides (equilateral, isosceles, scalene) and by their angles (acute, right, obtuse).',
  lessons: ['y7-geo-classify'],
  outcomes: [GEO],
  makers: [mk('drawn', m605drawn), mk('angles', m605angles)],
}

// ================================================================== 6.06 Angle sum of a triangle

const pron = (l: string) => `<i>${l}</i>°`
/** two angles of a triangle (each at least 30°, the third too) */
function triAngles(): [number, number, number] {
  let a: number, b: number
  do {
    a = int(30, 110)
    b = int(30, 110)
  } while (180 - a - b < 30 || Math.abs(a - 90) < 3 || Math.abs(b - 90) < 3 || Math.abs(180 - a - b - 90) < 3)
  return [a, b, 180 - a - b]
}
const angleWrong = (right: number, likely: number[]) => {
  const out: number[] = []
  for (const x of [...likely, right + 10, right - 10, right + 5]) if (x > 0 && x !== right && !out.includes(x) && out.length < 3) out.push(x)
  return out
}

function m606missing(): GameQuestion {
  const angs = triAngles()
  const at = int(0, 2)
  const L = pick(['a', 'b', 'x', 'y', 'm'])
  const labels = angs.map((x, i) => (i === at ? pron(L) : deg(x))) as [string, string, string]
  const given = angs.filter((_, i) => i !== at)
  const s = given[0] + given[1]
  return gq({
    t: 'missing',
    prompt: `Find the value of <i>${L}</i>.`,
    diagram: D.triangle(angs[0], angs[1], { angleLabels: labels }),
    correct: num(angs[at]),
    // took from 360°, added the two angles, near misses
    wrong: angleWrong(angs[at], [360 - s, s, 90 - s > 0 ? 90 - s : angs[at] + 20]).map((x) => num(x)),
    why: `The angles of a triangle add to 180°: 180 − ${given[0]} − ${given[1]} = ${angs[at]}.`,
    meta: { angs, at },
  })
}

function m606right(): GameQuestion {
  // not too thin a triangle, so the labels have room
  const b = int(30, 60)
  const L = pick(['a', 'b', 'x', 'y'])
  const atB = chance()
  const labels: [string, string, string] = atB ? ['', `${b}°`, pron(L)] : ['', pron(L), `${b}°`]
  return gq({
    t: 'right',
    prompt: `Find the value of <i>${L}</i>.`,
    diagram: D.triangle(90, atB ? b : 90 - b, { rightAt: 0, angleLabels: labels }),
    correct: num(90 - b),
    wrong: angleWrong(90 - b, [180 - b, 180 - 90 - b + 10, b]).map((x) => num(x)),
    why: `The right angle is 90°, so the other two angles add to 90°: 90 − ${b} = ${90 - b}.`,
    meta: { b, atB },
  })
}

function m606words(): GameQuestion {
  const [a, b, c] = triAngles()
  return gq({
    t: 'words',
    prompt: `Two angles of a triangle are ${deg(a)} and ${deg(b)}. What size is the third angle?`,
    correct: deg(c),
    wrong: angleWrong(c, [360 - a - b, a + b, 180 - a]).map(deg),
    why: `180° − ${deg(a)} − ${deg(b)} = ${deg(c)}.`,
    meta: { a, b },
  })
}

function m606isosceles(): GameQuestion {
  const apexGiven = chance()
  const base = pick([35, 40, 45, 50, 55, 65, 70, 75, 80])
  const apex = 180 - 2 * base
  return gq({
    t: 'isosceles',
    prompt: apexGiven
      ? `An isosceles triangle has an apex angle of ${deg(apex)}. What size is each of the two equal base angles?`
      : `An isosceles triangle has two equal base angles of ${deg(base)}. What size is the third angle?`,
    correct: deg(apexGiven ? base : apex),
    wrong: (apexGiven ? angleWrong(base, [180 - apex, (180 - apex) / 2 + 10, 90 - apex / 2 + 5]) : angleWrong(apex, [180 - base, 90 - base, base])).map(deg),
    why: apexGiven ? `180° − ${deg(apex)} = ${deg(180 - apex)}, shared equally: ${deg(base)} each.` : `180° − ${deg(base)} − ${deg(base)} = ${deg(apex)}.`,
    meta: { base, apexGiven },
  })
}

const SET_606: GameSet = {
  id: 'ncm7-6.06',
  exercise: '6.06',
  ref: 'NCM 7 Ex 6.06',
  title: 'Angle sum of a triangle',
  focus: 'The angles of a triangle add to 180°: find the missing angle.',
  lessons: ['y7-geo-triangle'],
  outcomes: [GEO],
  makers: [mk('missing', m606missing), mk('words', m606words), mk('right', m606right), mk('isosceles', m606isosceles, 2)],
}

// ================================================================== 6.07 Exterior angle of a triangle

function m607exterior(): GameQuestion {
  let A: number, B: number
  do {
    A = int(30, 80)
    B = int(40, 110)
  } while (180 - A - B < 30)
  const C = 180 - A - B
  const L = pick(['x', 'y', 'a', 'p'])
  return gq({
    t: 'exterior',
    prompt: `Find the value of <i>${L}</i>.`,
    diagram: D.triangle(A, B, { angleLabels: [deg(A), '', deg(C)], extendBase: 'right', extLabel: pron(L) }),
    correct: num(A + C),
    // the interior angle next to it, one opposite angle only, from 360°
    wrong: angleWrong(A + C, [B, 180 - A, 360 - A - C, 180 - C]).map((x) => num(x)),
    why: `An exterior angle equals the sum of the two interior opposite angles: ${A} + ${C} = ${A + C}.`,
    meta: { A, B },
  })
}

function m607interior(): GameQuestion {
  let A: number, B: number
  do {
    A = int(30, 80)
    B = int(40, 110)
  } while (180 - A - B < 30)
  const C = 180 - A - B
  const L = pick(['x', 'y', 'a', 'p'])
  return gq({
    t: 'interior',
    prompt: `Find the value of <i>${L}</i>.`,
    diagram: D.triangle(A, B, { angleLabels: [deg(A), '', pron(L)], extendBase: 'right', extLabel: deg(A + C) }),
    correct: num(C),
    wrong: angleWrong(C, [A + C + A, 180 - A - C, 180 - C, A]).map((x) => num(x)),
    why: `The exterior angle ${A + C}° equals ${A}° + <i>${L}</i>°, so <i>${L}</i> = ${A + C} − ${A} = ${C}.`,
    meta: { A, B },
  })
}

const SET_607: GameSet = {
  id: 'ncm7-6.07',
  exercise: '6.07',
  ref: 'NCM 7 Ex 6.07',
  title: 'Exterior angle of a triangle',
  focus: 'An exterior angle of a triangle equals the sum of the two interior opposite angles.',
  lessons: ['y7-geo-exterior'],
  outcomes: [GEO],
  makers: [mk('exterior', m607exterior), mk('interior', m607interior, 2)],
}

// ================================================================== 6.08 Classifying quadrilaterals

const QUADS: { name: string; pts: () => P[] }[] = [
  { name: 'Square', pts: () => [[0, 0], [1, 0], [1, 1], [0, 1]] },
  { name: 'Rectangle', pts: () => { const w = pick([1.6, 1.8, 2]); return [[0, 0], [w, 0], [w, 1], [0, 1]] } },
  { name: 'Rhombus', pts: () => { const t = rad(pick([55, 60, 65, 70])); return [[0, 0], [1, 0], [1 + Math.cos(t), -Math.sin(t)], [Math.cos(t), -Math.sin(t)]] } },
  { name: 'Parallelogram', pts: () => { const t = rad(pick([55, 60, 65])); const s = pick([0.65, 0.7]); return [[0, 0], [1.6, 0], [1.6 + s * Math.cos(t), -s * Math.sin(t)], [s * Math.cos(t), -s * Math.sin(t)]] } },
  { name: 'Kite', pts: () => [[0, 0], [0.7, -0.6], [0, -1.9], [-0.7, -0.6]] },
  { name: 'Trapezium', pts: () => [[0, 0], [2, 0], [1.5, -1], [0.3, -1]] },
]

/** a quadrilateral with the usual marks: ticks on equal sides, arrows on parallel sides, squares in right angles */
function markedQuad(raw: P[]): string {
  const turnBy = rad(pick([0, 0, 10, -10, 15]))
  const rot = raw.map(([x, y]) => [x * Math.cos(turnBy) - y * Math.sin(turnBy), x * Math.sin(turnBy) + y * Math.cos(turnBy)] as P)
  const p = fitPts(rot, 300, 220, 34)
  let body = polygon(p)
  const side = (i: number) => [p[i], p[(i + 1) % 4]] as [P, P]
  const len = (i: number) => Math.hypot(side(i)[1][0] - side(i)[0][0], side(i)[1][1] - side(i)[0][1])
  // equal sides: group lengths within 1%
  const groups: number[][] = []
  for (let i = 0; i < 4; i++) {
    const g = groups.find((gr) => Math.abs(len(gr[0]) - len(i)) < 0.01 * len(i))
    if (g) g.push(i)
    else groups.push([i])
  }
  let t = 1
  for (const g of groups) {
    if (g.length < 2) continue
    for (const i of g) body += D.tick(side(i)[0], side(i)[1], t)
    t++
  }
  // parallel opposite sides
  let arrows = 1
  for (const [i, j] of [[0, 2], [1, 3]]) {
    const d1 = dir(side(i)[0], side(i)[1]) % 180
    const d2 = dir(side(j)[0], side(j)[1]) % 180
    const diff = Math.abs(d1 - d2) % 180
    if (Math.min(diff, 180 - diff) < 0.5) {
      // arrows point the same way along both sides
      body += D.arrowOnLine(side(i)[0], side(i)[1], arrows, 0.4) + D.arrowOnLine(side(j)[1], side(j)[0], arrows, 0.6)
      arrows++
    }
  }
  // right angles
  for (let i = 0; i < 4; i++) {
    const a = dir(p[i], p[(i + 1) % 4])
    const b = dir(p[i], p[(i + 3) % 4])
    let sw = (b - a + 360) % 360
    if (Math.abs(sw - 90) < 0.5) body += D.rightMark(p[i], a, 12)
    else if (Math.abs(sw - 270) < 0.5) body += D.rightMark(p[i], b, 12)
  }
  return D.svg(300, 220, body, 'A quadrilateral with its markings', 320)
}

function m608drawn(): GameQuestion {
  const q = pick(QUADS)
  return gq({
    t: 'drawn',
    prompt: 'What is the most exact name for this quadrilateral?',
    diagram: markedQuad(q.pts()),
    correct: q.name,
    wrong: sample(QUADS.filter((o) => o !== q), 3).map((o) => o.name),
    why: {
      Square: 'All sides are equal and all angles are right angles: a square.',
      Rectangle: 'All angles are right angles, but the sides are not all equal: a rectangle.',
      Rhombus: 'All sides are equal, but the angles are not right angles: a rhombus.',
      Parallelogram: 'Both pairs of opposite sides are parallel, the sides are not all equal and there are no right angles: a parallelogram.',
      Kite: 'Two pairs of equal sides next to each other, and no parallel sides: a kite.',
      Trapezium: 'Exactly one pair of parallel sides: a trapezium.',
    }[q.name]!,
    meta: { name: q.name },
  })
}

const DESCRIBE: [string, string][] = [
  ['All four sides are equal and every angle is a right angle.', 'Square'],
  ['Every angle is a right angle, but the four sides are not all equal.', 'Rectangle'],
  ['All four sides are equal, but no angle is a right angle.', 'Rhombus'],
  ['Both pairs of opposite sides are parallel, the sides are not all equal and no angle is a right angle.', 'Parallelogram'],
  ['It has exactly one pair of parallel sides.', 'Trapezium'],
  ['It has two pairs of equal sides next to each other, and no parallel sides.', 'Kite'],
]

function m608describe(): GameQuestion {
  const [d, name] = pick(DESCRIBE)
  return gq({
    t: 'describe',
    prompt: `Which quadrilateral is this? ${d}`,
    correct: name,
    wrong: sample(QUADS.map((x) => x.name).filter((x) => x !== name), 3),
    why: `${d} That describes a ${name.toLowerCase()}.`,
    meta: { name },
  })
}

const SET_608: GameSet = {
  id: 'ncm7-6.08',
  exercise: '6.08',
  ref: 'NCM 7 Ex 6.08',
  title: 'Classifying quadrilaterals',
  focus: 'Name the special quadrilaterals from their markings and descriptions: square, rectangle, rhombus, parallelogram, kite, trapezium.',
  lessons: ['y7-geo-quad'],
  outcomes: [GEO],
  makers: [mk('drawn', m608drawn), mk('describe', m608describe)],
}

// ================================================================== 6.09 Angle sum of a quadrilateral

function quadAngles(): [number, number, number, number] {
  for (;;) {
    const a = int(60, 130)
    const b = int(60, 130)
    const c = int(60, 130)
    const d = 360 - a - b - c
    if (d >= 60 && d <= 130 && [a, b, c, d].every((x) => Math.abs(x - 90) > 4)) return [a, b, c, d]
  }
}

function m609missing(): GameQuestion {
  const angs = quadAngles()
  const at = int(0, 3)
  const L = pick(['a', 'b', 'x', 'y', 'm'])
  const labels = angs.map((x, i) => (i === at ? pron(L) : deg(x))) as [string, string, string, string]
  const s = angs.reduce((t, x) => t + x, 0) - angs[at]
  return gq({
    t: 'missing',
    prompt: `Find the value of <i>${L}</i>.`,
    diagram: D.quadrilateral(angs, labels),
    correct: num(angs[at]),
    // used 180° instead of 360°, near misses
    wrong: angleWrong(angs[at], [540 - s, s - 180 > 0 ? s - 180 : angs[at] + 20, angs[at] + 10]).map((x) => num(x)),
    why: `The angles of a quadrilateral add to 360°: 360 − ${s} = ${angs[at]}.`,
    meta: { angs, at },
  })
}

function m609words(): GameQuestion {
  const angs = quadAngles()
  return gq({
    t: 'words',
    prompt: `Three angles of a quadrilateral are ${deg(angs[0])}, ${deg(angs[1])} and ${deg(angs[2])}. What size is the fourth angle?`,
    correct: deg(angs[3]),
    wrong: angleWrong(angs[3], [angs[3] + 180, 180 - angs[3] > 0 ? 180 - angs[3] : angs[3] + 20, angs[3] - 20]).map(deg),
    why: `360° − ${deg(angs[0])} − ${deg(angs[1])} − ${deg(angs[2])} = ${deg(angs[3])}.`,
    meta: { angs },
  })
}

function m609special(): GameQuestion {
  const kind = int(0, 2)
  const a = 5 * int(10, 25)
  if (kind === 2) {
    // kite: one pair of equal opposite angles
    let p: number, q: number
    do {
      p = 5 * int(14, 28)
      q = 5 * int(10, 18)
    } while ((360 - p - q) % 2 !== 0 || (360 - p - q) / 2 < 40 || (360 - p - q) / 2 === p || (360 - p - q) / 2 === q)
    const e = (360 - p - q) / 2
    return gq({
      t: 'special',
      prompt: `A kite has angles of ${deg(p)} and ${deg(q)}, and its other two angles are equal. What size is each of them?`,
      correct: deg(e),
      wrong: angleWrong(e, [360 - p - q, 180 - e, e + 20]).map(deg),
      why: `360° − ${deg(p)} − ${deg(q)} = ${deg(360 - p - q)}, shared equally: ${deg(e)} each.`,
      meta: { kind, p, q },
    })
  }
  const shape = kind === 0 ? 'parallelogram' : 'rhombus'
  const opposite = chance()
  return gq({
    t: 'special',
    prompt: `One angle of a ${shape} is ${deg(a)}. What size is the angle ${opposite ? 'opposite it' : 'next to it'}?`,
    correct: deg(opposite ? a : 180 - a),
    wrong: angleWrong(opposite ? a : 180 - a, [opposite ? 180 - a : a, 360 - a, 90 - a > 0 ? 90 - a : a + 30]).map(deg),
    why: opposite ? `Opposite angles of a ${shape} are equal: ${deg(a)}.` : `Angles next to each other in a ${shape} add to 180°: 180° − ${deg(a)} = ${deg(180 - a)}.`,
    meta: { kind, a, opposite },
  })
}

const SET_609: GameSet = {
  id: 'ncm7-6.09',
  exercise: '6.09',
  ref: 'NCM 7 Ex 6.09',
  title: 'Angle sum of a quadrilateral',
  focus: 'The angles of a quadrilateral add to 360°: find the missing angle, using the properties of special quadrilaterals.',
  lessons: ['y7-geo-quad'],
  outcomes: [GEO],
  makers: [mk('missing', m609missing), mk('words', m609words), mk('special', m609special, 2)],
}

// ================================================================== 6.10 Properties of quadrilaterals

const PROPS = [
  'All sides are equal',
  'Opposite sides are parallel',
  'All angles are right angles',
  'The diagonals are equal',
  'The diagonals bisect each other',
  'The diagonals are perpendicular',
  'Opposite angles are equal',
  'The diagonals bisect the angles',
  'All angles are equal',
]
/** which of PROPS are always true, by index */
const HAS: Record<string, number[]> = {
  rectangle: [1, 2, 3, 4, 6, 8],
  rhombus: [0, 1, 4, 5, 6, 7],
  parallelogram: [1, 4, 6],
  kite: [5],
}

function m610always(): GameQuestion {
  const shape = pick(Object.keys(HAS))
  const yes = HAS[shape]
  const no = PROPS.map((_, i) => i).filter((i) => !yes.includes(i))
  const right = pick(yes)
  return gq({
    t: 'always',
    prompt: `Which is always true for a ${shape}?`,
    correct: PROPS[right],
    wrong: sample(no, 3).map((i) => PROPS[i]),
    why: `In every ${shape}: ${PROPS[right].toLowerCase()}. The others are not true for every ${shape}.`,
    meta: { shape },
  })
}

const WHICH_610: [string, string, string[]][] = [
  ['has diagonals that are equal but not perpendicular', 'Rectangle', ['Square', 'Rhombus', 'Parallelogram']],
  ['has all sides equal, and diagonals that are perpendicular but not equal', 'Rhombus', ['Square', 'Kite', 'Rectangle']],
  ['has perpendicular diagonals but no parallel sides', 'Kite', ['Rhombus', 'Square', 'Parallelogram']],
  ['has both pairs of opposite sides parallel, but diagonals that are neither equal nor perpendicular', 'Parallelogram', ['Rectangle', 'Rhombus', 'Square']],
  ['has diagonals that are equal and perpendicular', 'Square', ['Rectangle', 'Rhombus', 'Kite']],
]

function m610which(): GameQuestion {
  const [what, right, wrong] = pick(WHICH_610)
  return gq({
    t: 'which',
    prompt: `Which quadrilateral ${what}?`,
    correct: right,
    wrong,
    why: `Only the ${right.toLowerCase()} ${what}.`,
    meta: { right },
  })
}

const SET_610: GameSet = {
  id: 'ncm7-6.10',
  exercise: '6.10',
  ref: 'NCM 7 Ex 6.10',
  title: 'Properties of quadrilaterals',
  focus: 'Know the properties of the sides, angles and diagonals of the special quadrilaterals.',
  lessons: ['y7-geo-quad'],
  outcomes: [GEO],
  makers: [mk('always', m610always), mk('which', m610which, 2)],
}

export const NCM7_CH6: GameChapter = {
  id: 'ncm7-ch6',
  number: 6,
  title: 'Geometrical figures',
  ref: 'NCM 7 Chapter 6',
  strand: 'Measurement and space',
  outcomes: [GEO],
  sets: [SET_601, SET_602, SET_603, SET_604, SET_605, SET_606, SET_607, SET_608, SET_609, SET_610],
  colour: 40,
  topics: ['y7-geometry'],
}
