// Year 3 (Stage 2, Part A) — Position, length and angles; 2D shapes and area; 3D objects and volume; Mass and time
import type { Level, Question, Topic } from '@/lib/maths/types'
import type { ShapeKind } from '@/lib/maths/diagrams2'
import { D, D2, L, MINUS, TIMES, chance, int, mcA, mcFixedA, name, num, numA, pick, q, sample, shuffle, textA, timeA } from './helpers'
import { addMinutes, digital, plural, timeWords } from './s2'

const big = (s: string) => `<div class="big">${s}</div>`
const an = (w: string) => (/^[aeiou]/i.test(w) ? 'an ' : 'a ') + w
const cap = (s: string) => s[0].toUpperCase() + s.slice(1)
const sq = '<span class="box">&#9633;</span>'

// ------------------------------------------------------------------ Position, length and angles (Geometric measure A)

const PLACES = ['Park', 'Shop', 'Pool', 'Zoo', 'Farm', 'Bank', 'Lake', 'Gym', 'Cafe', 'Hall', 'Tent', 'Fort']

function mapItems(cols: number, rows: number, k: number) {
  const cells = shuffle(Array.from({ length: cols * rows }, (_, i) => [(i % cols) + 1, Math.floor(i / cols) + 1] as [number, number])).slice(0, k)
  const labels = shuffle(PLACES).slice(0, k)
  return cells.map(([col, row], i) => ({ col, row, label: labels[i] }))
}

const gm_gridmap = (level: Level): Question => {
  const [cols, rows] = L(level, [5, 4], [6, 5], [6, 5])
  const items = mapItems(cols, rows, L(level, 5, 6, 7))
  const map = D2.gridMap(cols, rows, items)
  if (level === 1) {
    const it = pick(items)
    const ref = D2.gridRef(it.col, it.row)
    return q({
      prompt: `What is in square ${ref} on the map?`,
      diagram: map,
      answer: mcA(it.label, sample(items.filter((x) => x !== it).map((x) => x.label), 3)),
      hint: 'Find the letter along the bottom first, then go up to the number.',
      steps: [`Go along to column ${ref[0]}, then up to row ${ref.slice(1)}.`, `The ${it.label} is in ${ref}.`],
    })
  }
  if (level === 2) {
    const it = pick(items)
    const ref = D2.gridRef(it.col, it.row)
    return q({
      prompt: `What is the grid reference of the ${it.label}? Write the letter first, e.g. B3.`,
      diagram: map,
      answer: textA(ref, `${ref[0]} ${ref.slice(1)}`),
      hint: 'Read the letter below the square, then the number beside it.',
      steps: [`The ${it.label} is above the letter ${ref[0]} and beside the number ${ref.slice(1)}.`, `Its grid reference is ${ref}.`],
    })
  }
  let a = pick(items)
  let b = pick(items)
  let guard = 0
  while ((a === b || a.col === b.col || a.row === b.row) && guard++ < 50) {
    a = pick(items)
    b = pick(items)
  }
  if (a === b || a.col === b.col || a.row === b.row) return gm_gridmap(level)
  const dx = b.col - a.col
  const dy = b.row - a.row
  const move = `${plural(Math.abs(dx), 'square')} ${dx > 0 ? 'to the right' : 'to the left'} and ${plural(Math.abs(dy), 'square')} ${dy > 0 ? 'up' : 'down'}`
  return q({
    prompt: `Start at the ${a.label} (${D2.gridRef(a.col, a.row)}). Move ${move}. Where are you?`,
    diagram: map,
    answer: mcA(b.label, sample(items.filter((x) => x !== b && x !== a).map((x) => x.label), 3)),
    hint: 'Move across first, then up or down. Count the squares carefully.',
    steps: [`From ${D2.gridRef(a.col, a.row)}, ${Math.abs(dx)} ${dx > 0 ? 'right' : 'left'} takes you to column ${D2.gridRef(b.col, a.row)[0]}.`, `Then ${Math.abs(dy)} ${dy > 0 ? 'up' : 'down'} takes you to ${D2.gridRef(b.col, b.row)}, which is the ${b.label}.`],
  })
}

const OBJECTS = ['ribbon', 'crayon', 'straw', 'pencil']

const gm_ruler = (level: Level): Question => {
  const obj = pick(OBJECTS)
  if (level === 3) {
    const start = int(1, 3) * 10 + pick([0, 5])
    const end = start + int(25, 85)
    return q({
      prompt: `How long is the ${obj} in millimetres?`,
      diagram: D2.ruler(12, start, end),
      answer: numA(end - start),
      suffix: 'mm',
      hint: 'Each small mark is 1 mm. There are 10 mm in 1 cm.',
      steps: [`The ${obj} starts at ${start} mm (${num(start / 10)} cm) and ends at ${end} mm (${num(end / 10)} cm).`, `${end} ${MINUS} ${start} = ${end - start} mm`],
    })
  }
  const start = level === 1 ? 0 : int(1, 4)
  const end = start + int(3, level === 1 ? 11 : 12 - start - 1)
  if (end > 12) return gm_ruler(level)
  return q({
    prompt: `How long is the ${obj}?`,
    diagram: D2.ruler(12, start * 10, end * 10),
    answer: numA(end - start),
    suffix: 'cm',
    hint: level === 1 ? 'Read the number at the end of the object.' : 'The object does not start at 0. Subtract the start from the end, or count the centimetres.',
    steps: level === 1 ? [`It starts at 0 and ends at ${end} cm.`, `The ${obj} is ${end} cm long.`] : [`It starts at ${start} cm and ends at ${end} cm.`, `${end} ${MINUS} ${start} = ${end - start} cm`],
  })
}

const UNIT_ITEMS: [string, string][] = [
  ['the length of a netball court', 'metres'],
  ['the length of the classroom', 'metres'],
  ['the height of a tree', 'metres'],
  ['the width of a book', 'centimetres'],
  ['the length of your arm', 'centimetres'],
  ['the height of a cup', 'centimetres'],
  ['the length of an ant', 'millimetres'],
  ['the thickness of a coin', 'millimetres'],
  ['the width of a grain of rice', 'millimetres'],
]

const gm_units = (level: Level): Question => {
  if (level === 1) {
    if (chance(0.4)) {
      const [thing, unit] = pick(UNIT_ITEMS)
      return q({
        prompt: `Which unit is best for measuring ${thing}?`,
        answer: mcFixedA(['millimetres', 'centimetres', 'metres'], unit),
        hint: 'Metres for long things, centimetres for things about hand-sized, millimetres for tiny things.',
        steps: [`${thing[0].toUpperCase() + thing.slice(1)} is best measured in ${unit}.`],
      })
    }
    const toMm = chance()
    const k = int(2, 9)
    return q({
      prompt: toMm ? `How many millimetres are in ${k} cm?` : `How many centimetres are in ${k} m?`,
      answer: numA(toMm ? 10 * k : 100 * k),
      suffix: toMm ? 'mm' : 'cm',
      hint: toMm ? '1 cm = 10 mm' : '1 m = 100 cm',
      steps: [toMm ? `${k} ${TIMES} 10 = ${10 * k} mm` : `${k} ${TIMES} 100 = ${100 * k} cm`],
    })
  }
  if (level === 2) {
    const kind = pick(['m-cm', 'cm-mm', 'rev'])
    if (kind === 'm-cm') {
      const m = int(1, 4)
      const c = int(5, 95)
      return q({
        prompt: `Complete:${big(`${m} m ${c} cm = ${sq} cm`)}`,
        answer: numA(100 * m + c),
        suffix: 'cm',
        hint: '1 m = 100 cm',
        steps: [`${m} m = ${100 * m} cm`, `${100 * m} + ${c} = ${100 * m + c} cm`],
      })
    }
    if (kind === 'cm-mm') {
      const c = int(2, 15)
      const mm = int(1, 9)
      return q({
        prompt: `Complete:${big(`${c} cm ${mm} mm = ${sq} mm`)}`,
        answer: numA(10 * c + mm),
        suffix: 'mm',
        hint: '1 cm = 10 mm',
        steps: [`${c} cm = ${10 * c} mm`, `${10 * c} + ${mm} = ${10 * c + mm} mm`],
      })
    }
    const total = int(105, 395)
    if (total % 100 === 0) return gm_units(level)
    return q({
      prompt: `Complete:${big(`${total} cm = ${Math.floor(total / 100)} m ${sq} cm`)}`,
      answer: numA(total % 100),
      suffix: 'cm',
      hint: 'Every 100 cm makes 1 m.',
      steps: [`${total} cm = ${Math.floor(total / 100) * 100} cm + ${total % 100} cm`, `= ${Math.floor(total / 100)} m ${total % 100} cm`],
    })
  }
  // compare lengths given in mixed units
  const values = new Set<number>()
  while (values.size < 4) values.add(int(95, 260))
  const vals = [...values]
  const show = (v: number) => (chance() && v >= 100 && v % 100 !== 0 ? `${Math.floor(v / 100)} m ${v % 100} cm` : `${v} cm`)
  const labels = vals.map(show)
  const max = Math.max(...vals)
  return q({
    prompt: 'Which length is the longest?',
    answer: mcFixedA(labels, labels[vals.indexOf(max)]),
    hint: 'Change them all to centimetres first.',
    steps: [...vals.map((v, i) => `${labels[i]} = ${v} cm`), `The longest is ${labels[vals.indexOf(max)]}.`],
  })
}

const gm_angles = (level: Level): Question => {
  if (level === 1) {
    const kind = pick(['vertex', 'quarter', 'count'])
    if (kind === 'vertex')
      return q({
        prompt: 'What is the name of the point where the two arms of an angle meet?',
        answer: mcFixedA(['the vertex', 'the edge', 'the face', 'the corner piece'], 'the vertex'),
        hint: 'It starts with v.',
        steps: ['The two arms of an angle meet at the vertex.'],
      })
    if (kind === 'quarter')
      return q({
        prompt: 'A quarter turn makes what kind of angle?',
        answer: mcFixedA(['a right angle', 'a straight angle', 'a full turn', 'no angle'], 'a right angle'),
        hint: 'Think of the corner of a page.',
        steps: ['A quarter turn makes a right angle, like the corner of a book.'],
      })
    return q({
      prompt: 'How many quarter turns make one full turn?',
      answer: numA(4),
      hint: 'Turn a quarter at a time until you face the start again.',
      steps: ['4 quarter turns make a full turn.'],
    })
  }
  if (level === 2) {
    const same = chance(0.25)
    const small = int(30, 70)
    const large = same ? small : small + int(30, 70)
    const swap = chance()
    const [a, b] = swap ? [large, small] : [small, large]
    // the larger angle gets the shorter arms
    const armBig = int(55, 75)
    const armSmall = int(110, 140)
    const armA = a >= b ? armBig : armSmall
    const armB = a >= b ? armSmall : armBig
    const correct = same ? 'They are the same size' : a > b ? 'Angle A' : 'Angle B'
    return q({
      prompt: 'Which angle is bigger?',
      diagram: D2.twoAngles(a, b, armA, armB),
      answer: mcFixedA(['Angle A', 'Angle B', 'They are the same size'], correct),
      hint: 'The size of an angle is the amount of turn between the arms. The length of the arms does not matter.',
      steps: same ? ['Both angles have the same amount of turn between their arms.', 'The arms are different lengths, but that does not change the size of the angle.'] : [`${correct} has more turn between its arms.`, 'Its arms are shorter, but arm length does not change the size of an angle.'],
    })
  }
  const kind = pick(['half', 'three', 'clock'])
  if (kind === 'half')
    return q({
      prompt: 'How many right angles are there in a half turn?',
      answer: numA(2),
      hint: 'A right angle is a quarter turn.',
      steps: ['A half turn is 2 quarter turns.', 'So a half turn is 2 right angles.'],
    })
  if (kind === 'three')
    return q({
      prompt: (() => {
        const n = name()
        return `${n} faces the board and makes three quarter turns, all in the same direction. Through how many right angles has ${n} turned?`
      })(),
      answer: numA(3),
      hint: 'Each quarter turn is one right angle.',
      steps: ['3 quarter turns = 3 right angles.'],
    })
  const startN = pick([12, 3, 6, 9])
  const quarters = int(1, 3)
  const endN = ((startN + 3 * quarters - 1) % 12) + 1
  return q({
    prompt: `The minute hand of a clock moves clockwise from the ${startN} to the ${endN}. How many quarter turns is that?`,
    answer: numA(quarters),
    hint: 'A quarter turn on a clock moves the hand 3 numbers.',
    steps: [`From ${startN} to ${endN} is ${3 * quarters} numbers.`, `Every 3 numbers is a quarter turn, so it is ${plural(quarters, 'quarter turn')}.`],
  })
}

// ------------------------------------------------------------------ 2D shapes and area (2DS A)

const QUAD_NAMES: ShapeKind[] = ['square', 'rectangle', 'rhombus', 'parallelogram', 'trapezium', 'kite']
// names that would also be correct for a shape (inclusive definitions), so never offer them as wrong answers
const ALSO_TRUE: Partial<Record<ShapeKind, ShapeKind[]>> = {
  square: ['rectangle', 'rhombus', 'parallelogram', 'kite', 'trapezium'],
  rectangle: ['parallelogram', 'trapezium'],
  rhombus: ['parallelogram', 'kite', 'trapezium'],
  parallelogram: ['trapezium'],
}

export const PARALLEL_PAIRS: Partial<Record<ShapeKind, number>> = { square: 2, rectangle: 2, rhombus: 2, parallelogram: 2, trapezium: 1, kite: 0, 'irregular quadrilateral': 0 }
export const RIGHT_ANGLES: Partial<Record<ShapeKind, number>> = { square: 4, rectangle: 4, 'right-angled triangle': 1, parallelogram: 0, rhombus: 0, kite: 0, trapezium: 0, 'equilateral triangle': 0 }
export const SYMMETRY: Partial<Record<ShapeKind, number>> = {
  square: 4,
  rectangle: 2,
  rhombus: 2,
  kite: 1,
  'isosceles trapezium': 1,
  'equilateral triangle': 3,
  'isosceles triangle': 1,
  'scalene triangle': 0,
  parallelogram: 0,
  'regular pentagon': 5,
  'regular hexagon': 6,
  'regular octagon': 8,
  'irregular quadrilateral': 0,
}

const sh_quads = (level: Level): Question => {
  if (level === 1) {
    const kind = pick(QUAD_NAMES)
    const wrongs = QUAD_NAMES.filter((k) => k !== kind && !(ALSO_TRUE[kind] ?? []).includes(k))
    // pad with non-quadrilaterals when the inclusive definitions leave too few wrong names (e.g. for a square)
    const pad = ['triangle', 'pentagon', 'hexagon'].slice(0, Math.max(0, 3 - wrongs.length))
    return q({
      prompt: 'What is the best name for this shape?',
      diagram: D2.shape2D(kind, { turn: pick([0, 0, 15, -12]) }),
      answer: mcA(kind, [...sample(wrongs, 3 - pad.length), ...pad]),
      hint: 'Look at the sides: are any parallel? Are they all equal? Are there right angles?',
      steps: [
        {
          square: 'It has 4 equal sides and 4 right angles: a square.',
          rectangle: 'It has 4 right angles and opposite sides equal, but not all sides equal: a rectangle.',
          rhombus: 'It has 4 equal sides but no right angles: a rhombus.',
          parallelogram: 'It has 2 pairs of parallel sides, no right angles, and not all sides equal: a parallelogram.',
          trapezium: 'It has exactly 1 pair of parallel sides: a trapezium.',
          kite: 'It has 2 pairs of equal sides next to each other: a kite.',
        }[kind as 'square'],
      ],
    })
  }
  if (level === 2) {
    const kind = pick(['square', 'rectangle', 'rhombus', 'parallelogram', 'trapezium', 'kite', 'irregular quadrilateral'] as ShapeKind[])
    const n = PARALLEL_PAIRS[kind]!
    return q({
      prompt: 'How many pairs of parallel sides does this shape have?',
      diagram: D2.shape2D(kind),
      answer: numA(n),
      hint: 'Parallel sides go in the same direction and never meet, like train tracks.',
      steps: [n === 0 ? 'No two sides go in the same direction, so there are 0 pairs of parallel sides.' : `This shape (${an(kind)}) has ${plural(n, 'pair')} of parallel sides.`],
    })
  }
  if (chance(0.5)) {
    const kind = pick(['square', 'rectangle', 'right-angled triangle', 'parallelogram', 'rhombus', 'kite', 'trapezium'] as ShapeKind[])
    const n = RIGHT_ANGLES[kind]!
    return q({
      prompt: 'How many right angles does this shape have?',
      diagram: D2.shape2D(kind),
      answer: numA(n),
      hint: 'A right angle is a square corner. Check each corner with the corner of a page.',
      steps: [n === 0 ? 'None of the corners is a square corner: 0 right angles.' : `This ${kind} has ${plural(n, 'right angle')}.`],
    })
  }
  const ask = pick([
    ['Which quadrilateral has 4 equal sides but no right angles?', 'rhombus'],
    ['Which quadrilateral has exactly one pair of parallel sides?', 'trapezium'],
    ['Which quadrilateral has 4 right angles and 4 equal sides?', 'square'],
  ])
  const opts = ask[1] === 'trapezium' ? ['trapezium', 'kite', 'rectangle', 'rhombus'] : ask[1] === 'rhombus' ? ['rhombus', 'rectangle', 'trapezium', 'kite'] : ['square', 'trapezium', 'kite', 'parallelogram']
  return q({
    prompt: ask[0],
    answer: mcFixedA(opts, ask[1]),
    hint: 'Picture each shape and check its sides and corners.',
    steps: [`A ${ask[1]}.`],
  })
}

const sh_symmetry = (level: Level): Question => {
  if (level === 3 && chance(0.4)) {
    const correct = pick(['parallelogram', 'scalene triangle'] as ShapeKind[])
    const opts = shuffle([correct, 'rectangle', 'kite', 'equilateral triangle'])
    return q({
      prompt: 'Which shape has no lines of symmetry?',
      answer: mcFixedA(opts, correct),
      hint: 'A line of symmetry folds a shape into two halves that match exactly.',
      steps: [`A ${correct} cannot be folded so the halves match exactly.`, 'A rectangle has 2 lines, a kite has 1, and an equilateral triangle has 3.'],
    })
  }
  const pool: ShapeKind[] = L(level, ['rectangle', 'square', 'kite', 'isosceles triangle', 'isosceles trapezium'], ['parallelogram', 'scalene triangle', 'rhombus', 'equilateral triangle', 'rectangle', 'kite'], ['regular pentagon', 'regular hexagon', 'regular octagon', 'equilateral triangle', 'square'])
  const kind = pick(pool)
  const n = SYMMETRY[kind]!
  return q({
    prompt: 'How many lines of symmetry does this shape have?',
    diagram: D2.shape2D(kind),
    answer: numA(n),
    hint: 'Imagine folding the shape. How many different folds make the two halves match exactly?',
    steps: [n === 0 ? `There is no fold that makes two matching halves, so ${an(kind)} has 0 lines of symmetry.` : `${cap(an(kind))} has ${plural(n, 'line')} of symmetry.`],
  })
}

const sh_area = (level: Level): Question => {
  if (level === 3) {
    if (chance(0.35)) {
      const r = int(3, 6)
      const c = int(4, 8)
      return q({
        prompt: `A rug is covered by ${r} rows of square metre tiles, with ${c} tiles in each row. What is the area of the rug?`,
        answer: numA(r * c),
        suffix: 'm²',
        hint: 'Each tile is 1 square metre. Count the tiles: rows × tiles in each row.',
        steps: [`${r} ${TIMES} ${c} = ${r * c}`, `The area is ${r * c} square metres (m²).`],
      })
    }
    // L-shape made of two rectangles
    const w1 = int(2, 4)
    const h1 = int(3, 5)
    const w2 = int(2, 4)
    const h2 = int(1, h1 - 1)
    const cells: [number, number][] = []
    for (let c = 0; c < w1; c++) for (let r = 0; r < h1; r++) cells.push([c + 1, r + 1])
    for (let c = 0; c < w2; c++) for (let r = 0; r < h2; r++) cells.push([w1 + c + 1, h1 - h2 + r + 1])
    return q({
      prompt: 'Each small square is 1 square centimetre (1 cm²). What is the area of the shaded shape?',
      diagram: D2.cellGrid(w1 + w2 + 2, h1 + 2, cells),
      answer: numA(w1 * h1 + w2 * h2),
      suffix: 'cm²',
      hint: 'Split the shape into two rectangles and add their areas.',
      steps: [`Left part: ${h1} rows of ${w1} = ${w1 * h1} cm²`, `Right part: ${h2} ${h2 === 1 ? 'row' : 'rows'} of ${w2} = ${w2 * h2} cm²`, `Total: ${w1 * h1} + ${w2 * h2} = ${w1 * h1 + w2 * h2} cm²`],
    })
  }
  const w = L(level, int(2, 5), int(4, 10), 0)
  const h = L(level, int(2, 4), int(3, 8), 0)
  const cells: [number, number][] = []
  for (let c = 0; c < w; c++) for (let r = 0; r < h; r++) cells.push([c + 1, r + 1])
  return q({
    prompt: 'Each small square is 1 square centimetre (1 cm²). What is the area of the shaded rectangle?',
    diagram: D2.cellGrid(w + 2, h + 2, cells),
    answer: numA(w * h),
    suffix: 'cm²',
    hint: level === 1 ? 'Count the shaded squares.' : 'Count the squares in one row, then multiply by the number of rows.',
    steps: [`There are ${h} rows with ${w} squares in each row.`, `${h} ${TIMES} ${w} = ${w * h} cm²`],
  })
}

const sh_turns = (level: Level): Question => {
  const TURN = ['quarter turn', 'half turn', 'three-quarter turn', 'full turn']
  if (level === 1) {
    const k = int(1, 3)
    return q({
      prompt: `The minute hand starts at 12 and makes a ${TURN[k - 1]} clockwise. Which number does it point to now?`,
      answer: numA(3 * k),
      hint: 'A quarter turn moves the hand from 12 to 3.',
      steps: k === 1 ? ['A quarter turn moves the hand 3 numbers.', 'From 12, it points to 3.'] : [`A ${TURN[k - 1]} is ${plural(k, 'quarter turn')}.`, `Each quarter turn moves 3 numbers: ${k} ${TIMES} 3 = ${3 * k}, so it points to ${3 * k}.`],
    })
  }
  if (level === 2) {
    const from = pick([12, 3, 6, 9])
    const k = int(1, 3)
    const to = ((from + 3 * k - 1) % 12) + 1
    return q({
      prompt: `The minute hand moves clockwise from ${from} to ${to}. What turn is that?`,
      answer: mcFixedA(TURN, TURN[k - 1]),
      hint: 'Every 3 numbers on a clock is a quarter turn.',
      steps: [`From ${from} to ${to} clockwise is ${3 * k} numbers = ${plural(k, 'quarter turn')}.`, `That is a ${TURN[k - 1]}.`],
    })
  }
  const k = pick([1, 3])
  const other = 4 - k
  return q({
    prompt: `A ${TURN[k - 1]} clockwise ends in the same position as which turn anticlockwise?`,
    answer: mcFixedA(['a quarter turn', 'a half turn', 'a three-quarter turn', 'a full turn'], `a ${TURN[other - 1]}`),
    hint: 'Together, the two turns must make a full turn (4 quarter turns).',
    steps: [`${plural(k, 'quarter turn')} one way + ${plural(other, 'quarter turn')} the other way bring you to the same place, because ${k} + ${other} = 4.`, `So it is the same as a ${TURN[other - 1]} anticlockwise.`],
  })
}

// ------------------------------------------------------------------ 3D objects, capacity and volume (3DS A)

type Solid = { label: string; draw: () => string; kind: 'prism' | 'pyramid' | 'cylinder' }
const SOLIDS: Solid[] = [
  { label: 'triangular prism', draw: () => D2.solid('prism', 3), kind: 'prism' },
  { label: 'rectangular prism', draw: () => D2.solid('prism', 4), kind: 'prism' },
  { label: 'pentagonal prism', draw: () => D2.solid('prism', 5), kind: 'prism' },
  { label: 'hexagonal prism', draw: () => D2.solid('prism', 6), kind: 'prism' },
  { label: 'triangular pyramid', draw: () => D2.solid('pyramid', 3), kind: 'pyramid' },
  { label: 'square pyramid', draw: () => D2.solid('pyramid', 4), kind: 'pyramid' },
  { label: 'pentagonal pyramid', draw: () => D2.solid('pyramid', 5), kind: 'pyramid' },
  { label: 'cylinder', draw: () => D.cylinder(1, 1.4, '', ''), kind: 'cylinder' },
]

const td_objects = (level: Level): Question => {
  if (level === 1) {
    const s = pick(SOLIDS)
    return q({
      prompt: 'What is the name of this object?',
      diagram: s.draw(),
      answer: mcA(s.label, sample(SOLIDS.filter((x) => x !== s).map((x) => x.label), 3)),
      hint: 'Is it a prism (same shape at both ends), a pyramid (sides meet at a point) or a cylinder (curved surface)? Then look at the shape of the base.',
      steps: [s.kind === 'cylinder' ? 'It has a curved surface and two flat circles: a cylinder.' : s.kind === 'prism' ? `It has the same shape at both ends, so it is a prism. The ends are ${s.label.split(' ')[0]}, so it is a ${s.label}.` : `Its sides are triangles that meet at a point, so it is a pyramid. The base is ${s.label.split(' ')[0]}, so it is a ${s.label}.`],
    })
  }
  if (level === 2) {
    const s = pick(SOLIDS.filter((x) => x.kind !== 'cylinder'))
    const correct = s.kind === 'prism' ? 'A prism, because both ends are the same shape' : 'A pyramid, because its sides meet at a point'
    return q({
      prompt: 'Is this object a prism or a pyramid?',
      diagram: s.draw(),
      answer: mcFixedA(['A prism, because both ends are the same shape', 'A pyramid, because its sides meet at a point', 'A pyramid, because both ends are the same shape', 'A prism, because its sides meet at a point'], correct),
      hint: 'A prism has two matching ends joined by rectangles. A pyramid has one base and triangles meeting at a point.',
      steps: [`It is a ${s.label}.`, correct + '.'],
    })
  }
  const ask = pick([
    ['How many squares make a net of a cube?', 6, 'A cube has 6 square faces, so its net has 6 squares.'],
    ['A net of a triangular prism has 2 triangles. How many rectangles does it have?', 3, 'A triangular prism has 3 rectangular faces joining its 2 triangles.'],
    ['A net of a square pyramid has 1 square. How many triangles does it have?', 4, 'Each of the 4 sides of the square base has a triangle, so there are 4 triangles.'],
    ['A net of a rectangular prism is made of how many rectangles?', 6, 'A rectangular prism has 6 faces, so its net has 6 rectangles.'],
  ] as [string, number, string][])
  return q({
    prompt: ask[0],
    answer: numA(ask[1]),
    hint: 'A net is the object unfolded flat. It has one shape for every face.',
    steps: [ask[2]],
  })
}

const td_litres = (level: Level): Question => {
  if (level === 1) {
    const ask = pick([
      ['Which of these holds about 1 litre?', 'a carton of milk', ['a teaspoon', 'a bathtub', 'a swimming pool']],
      ['Which of these holds much more than 1 litre?', 'a bucket', ['an egg cup', 'a teaspoon', 'a drinking glass']],
      ['Which of these holds much less than 1 litre?', 'a teaspoon', ['a bucket', 'a bathtub', 'a fish tank']],
    ] as [string, string, string[]][])
    return q({
      prompt: ask[0],
      answer: mcA(ask[1], ask[2]),
      hint: 'A litre is about the amount in a carton of milk.',
      steps: [`${ask[1][0].toUpperCase() + ask[1].slice(1)}.`],
    })
  }
  if (level === 2) {
    const max = pick([4000, 5000])
    const level_ = int(1, max / 1000 - 1) * 1000
    return q({
      prompt: 'How many litres of water are in the jug?',
      diagram: D2.jug(max, 1000, 1000, level_, true),
      answer: numA(level_ / 1000),
      suffix: 'L',
      hint: 'Read the mark that the top of the water reaches.',
      steps: [`The water reaches the ${level_ / 1000} L mark.`, `There ${level_ === 1000 ? 'is 1 litre' : `are ${level_ / 1000} litres`} of water.`],
    })
  }
  const total = int(12, 40)
  const have = int(3, total - 3)
  const who = name()
  return q({
    prompt: pick([`A fish tank holds ${total} L of water. ${who} has poured in ${have} L. How many more litres are needed to fill it?`, `A paddling pool holds ${total} L. ${who} has put in ${have} L of water. How many more litres will fill it?`]),
    answer: numA(total - have),
    suffix: 'L',
    hint: 'Find the difference between how much it holds and how much is already in it.',
    steps: [`${total} ${MINUS} ${have} = ${total - have} L`],
  })
}

const td_cubes = (level: Level): Question => {
  if (level === 3 && chance(0.4)) {
    const layers = int(3, 6)
    const r = int(2, 4)
    const c = int(3, 6)
    return q({
      prompt: `A model is built from centimetre cubes. It has ${layers} layers, and each layer is ${r} rows of ${c} cubes. What is its volume?`,
      answer: numA(layers * r * c),
      suffix: 'cm³',
      hint: 'Find the number of cubes in one layer, then multiply by the number of layers.',
      steps: [`One layer: ${r} ${TIMES} ${c} = ${r * c} cubes`, `${layers} layers: ${layers} ${TIMES} ${r * c} = ${layers * r * c} cubes`, `Volume = ${layers * r * c} cm³`],
    })
  }
  const l = L(level, int(2, 4), int(2, 4), int(3, 5))
  const w = L(level, int(1, 3), int(2, 3), int(2, 4))
  const h = L(level, 1, int(2, 3), int(2, 4))
  return q({
    prompt: 'This model is made of centimetre cubes. Each cube has a volume of 1 cm³. What is the volume of the model?',
    diagram: D2.cubeStack(l, w, h),
    answer: numA(l * w * h),
    suffix: 'cm³',
    hint: h === 1 ? 'Count the cubes. Remember the ones at the back.' : 'Count the cubes in the top layer, then multiply by the number of layers.',
    steps: h === 1 ? [`The layer has ${plural(w, 'row')} of ${l} cubes: ${w} ${TIMES} ${l} = ${l * w}.`, `Volume = ${l * w} cm³`] : [`Top layer: ${w} rows of ${l} = ${l * w} cubes.`, `There are ${h} layers: ${h} ${TIMES} ${l * w} = ${l * w * h} cubes.`, `Volume = ${l * w * h} cm³`],
  })
}

// ------------------------------------------------------------------ Mass and time (Non-spatial measure A)

const nsm_kg = (level: Level): Question => {
  if (level === 1) {
    const ask = pick([
      ['Which object has a mass of about 1 kilogram?', 'a bag of sugar', ['a feather', 'a car', 'a paperclip']],
      ['Which object is heavier than 1 kilogram?', 'a bicycle', ['an apple', 'a pencil', 'a sock']],
      ['Which object is lighter than 1 kilogram?', 'a banana', ['a dog', 'a bike', 'a desk']],
    ] as [string, string, string[]][])
    return q({
      prompt: ask[0],
      answer: mcA(ask[1], ask[2]),
      hint: 'A 1 kg bag of sugar is a good benchmark.',
      steps: [`${ask[1][0].toUpperCase() + ask[1].slice(1)}.`],
    })
  }
  if (level === 2) {
    if (chance()) {
      const k = int(2, 9)
      const thing = pick(['A pumpkin', 'A watermelon', 'A bag of potatoes', 'A cat'])
      return q({
        prompt: `${thing} balances with ${k} one-kilogram masses on a pan balance. What is its mass?`,
        answer: numA(k),
        suffix: 'kg',
        hint: 'Each mass is 1 kg.',
        steps: [`${k} ${TIMES} 1 kg = ${k} kg`],
      })
    }
    const a = int(5, 15)
    const b = int(1, a - 1)
    return q({
      prompt: `A bag of potatoes has a mass of ${a} kg. A bag of onions has a mass of ${b} kg. How much heavier are the potatoes?`,
      answer: numA(a - b),
      suffix: 'kg',
      hint: 'Find the difference.',
      steps: [`${a} ${MINUS} ${b} = ${a - b} kg`],
    })
  }
  const parts = [int(2, 9), int(2, 9), int(2, 9)]
  const total = parts[0] + parts[1] + parts[2]
  if (chance()) {
    return q({
      prompt: `Three parcels have masses of ${parts[0]} kg, ${parts[1]} kg and ${parts[2]} kg. What is their total mass?`,
      answer: numA(total),
      suffix: 'kg',
      hint: 'Add the three masses.',
      steps: [`${parts[0]} + ${parts[1]} + ${parts[2]} = ${total} kg`],
    })
  }
  const limit = total + int(2, 9)
  return q({
    prompt: `A suitcase can hold up to ${limit} kg. It already has ${parts[0]} kg of clothes, ${parts[1]} kg of shoes and ${parts[2]} kg of books. How many more kilograms can go in?`,
    answer: numA(limit - total),
    suffix: 'kg',
    hint: 'Add what is already in it, then subtract from the limit.',
    steps: [`Already in: ${parts[0]} + ${parts[1]} + ${parts[2]} = ${total} kg`, `${limit} ${MINUS} ${total} = ${limit - total} kg`],
  })
}

const nsm_clock = (level: Level): Question => {
  const h = int(1, 12)
  const m = L(level, pick([0, 30]), pick([15, 45, 5, 10, 20, 25, 35, 40, 50, 55]), (() => {
    let x = 0
    do x = int(1, 59)
    while (x % 5 === 0)
    return x
  })())
  const nextH = (h % 12) + 1
  return q({
    prompt: 'What time does the clock show?',
    diagram: D2.clock(h, m),
    answer: timeA(h, m),
    hint: 'The short hand shows the hour. The long hand shows the minutes: each number is 5 minutes.',
    steps: [
      m === 0 ? `The long hand points to 12, so it is o’clock.` : `The long hand is ${m % 5 === 0 ? `on the ${m / 5}` : `${plural(m % 5, 'small mark')} after the ${Math.floor(m / 5) || 12}`}: ${m % 5 === 0 ? `${m / 5} ${TIMES} 5 = ${m}` : `${Math.floor(m / 5) * 5} + ${m % 5} = ${m}`} ${m === 1 ? 'minute' : 'minutes'} past the hour.`,
      m === 0 ? `The short hand points to ${h}.` : `The short hand is between ${h} and ${nextH}, so the hour is ${h}.`,
      `The time is ${digital(h, m)} (${timeWords(h, m)}).`,
    ],
  })
}

const nsm_timewords = (level: Level): Question => {
  if (level === 1 && chance(0.4)) {
    const n = int(1, 11)
    return q({
      prompt: `On a clock, the long hand points to the ${n}. How many minutes past the hour is it?`,
      answer: numA(5 * n),
      suffix: 'minutes',
      hint: 'Each number on the clock stands for 5 minutes when the long hand points to it.',
      steps: [`The ${n} on the clock also means ${n} ${TIMES} 5 = ${5 * n} minutes.`],
    })
  }
  if (level === 1) {
    const ask = pick([
      ['How many minutes are in half an hour?', 30],
      ['How many minutes are in a quarter of an hour?', 15],
      ['How many minutes are in one hour?', 60],
      ['How many minutes are in three-quarters of an hour?', 45],
    ] as [string, number][])
    return q({
      prompt: ask[0],
      answer: numA(ask[1]),
      suffix: 'minutes',
      hint: 'One hour is 60 minutes.',
      steps: [`${ask[1]} minutes.`],
    })
  }
  const h = int(1, 12)
  const m = pick([5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55])
  if (level === 2) {
    return q({
      prompt: `Write <b>${timeWords(h, m)}</b> as a digital time.`,
      answer: timeA(h, m),
      hint: '“Past” means after the hour. “To” means before the next hour: subtract from 60.',
      steps: m <= 30 ? [`${cap(timeWords(h, m))} is ${m} minutes after ${h}:00.`, `= ${digital(h, m)}`] : [`${cap(timeWords(h, m))} is ${60 - m} minutes before ${(h % 12) + 1}:00.`, `60 ${MINUS} ${60 - m} = ${m}, so it is ${digital(h, m)}.`],
    })
  }
  const correct = timeWords(h, m)
  const nh = (h % 12) + 1
  const wrongs = [timeWords(nh, m), m > 30 ? timeWords(h, 60 - m) : timeWords(h > 1 ? h - 1 : 12, 60 - m), m !== 30 ? timeWords(h, m > 30 ? 30 : 30 + (30 - m)) : timeWords(nh, 0)]
  return q({
    prompt: `Which words mean the same as ${digital(h, m)}?`,
    answer: mcA(correct, wrongs.filter((w) => w !== correct)),
    hint: 'If the minutes are more than 30, say how many minutes “to” the next hour.',
    steps: m <= 30 ? [`${digital(h, m)} is ${m} minutes past ${h}: “${correct}”.`] : [`${digital(h, m)} is ${60 - m} minutes before ${nh} o’clock: “${correct}”.`],
  })
}

const nsm_duration = (level: Level): Question => {
  const what = pick(['A swimming lesson', 'A school assembly', 'A soccer game', 'Art class', 'A movie'])
  if (level === 3) {
    const h = int(1, 11)
    const m = int(1, 11) * 5
    const dur = pick([20, 25, 35, 40, 45, 50, 55, 65, 75])
    const toHour = 60 - m
    if (dur === toHour || dur - toHour >= 60) return nsm_duration(level)
    const [eh, em] = addMinutes(h, m, dur)
    const top = digital((h % 12) + 1, 0)
    return q({
      prompt: `${what} starts at ${digital(h, m)} and goes for ${dur} minutes. What time does it finish?`,
      answer: timeA(eh, em),
      hint: 'Count on to the next hour first, then add the minutes that are left.',
      steps:
        dur < toHour
          ? [`${m} + ${dur} = ${m + dur}, which is still before the next hour.`, `It finishes at ${digital(eh, em)}.`]
          : [`From ${digital(h, m)} to ${top} is ${toHour} minutes.`, `${dur} ${MINUS} ${toHour} = ${dur - toHour} more minutes after ${top}.`, `It finishes at ${digital(eh, em)}.`],
    })
  }
  const h = int(1, 11)
  let m1: number
  let dur: number
  if (level === 1) {
    m1 = int(0, 6) * 5
    dur = int(2, Math.min(11, (60 - m1) / 5 - 1)) * 5
  } else {
    m1 = int(7, 11) * 5
    dur = int(Math.ceil((65 - m1) / 5), 11) * 5
    if (m1 + dur <= 60) return nsm_duration(level)
  }
  const [eh, em] = addMinutes(h, m1, dur)
  return q({
    prompt: `${what} starts at ${digital(h, m1)} and finishes at ${digital(eh, em)}. How long does it go for?`,
    answer: numA(dur),
    suffix: 'minutes',
    hint: 'Count on from the start time to the finish time.',
    steps:
      level === 1
        ? [`${em} ${MINUS} ${m1} = ${dur} minutes`]
        : [`From ${digital(h, m1)} to ${digital(eh, 0)} is ${60 - m1} minutes.`, `From ${digital(eh, 0)} to ${digital(eh, em)} is ${em} minutes.`, `${60 - m1} + ${em} = ${dur} minutes`],
  })
}

// ------------------------------------------------------------------ topics

export const Y3B: Topic[] = [
  {
    id: 'y3-position-length',
    year: 3,
    title: 'Position, length and angles',
    strand: 'Measurement and space',
    outcomes: ['MA2-GM-01', 'MA2-GM-02', 'MA2-GM-03'],
    blurb: 'Grid maps, measuring with rulers in centimetres and millimetres, and angles as turns.',
    colour: 140,
    skills: [
      {
        id: 'y3-gm-gridmap',
        title: 'Grid maps',
        outcomes: ['MA2-GM-01'],
        summary: 'Find places on a grid map using grid references, and follow directions.',
        learn: {
          intro: '<p>A grid map has letters along the bottom and numbers up the side. A <b>grid reference</b> such as C2 names one square: go across to C, then up to 2.</p>',
          keyPoints: ['Read across (the letter) before up (the number).', 'Move across first, then up or down, when following directions.'],
          vocab: [['grid reference', 'a letter and a number that name a square on a map']],
        },
        gen: gm_gridmap,
        levels: { 1: 'what is in a square', 2: 'write a grid reference', 3: 'follow directions on the map' },
      },
      {
        id: 'y3-gm-ruler',
        title: 'Measuring with a ruler',
        outcomes: ['MA2-GM-02'],
        summary: 'Measure lengths in centimetres and millimetres.',
        learn: {
          intro: '<p>Line up one end of the object with 0 on the ruler. If it does not start at 0, subtract the start from the end.</p>',
          keyPoints: ['The numbered marks are centimetres (cm).', 'The small marks are millimetres (mm). 10 mm = 1 cm.'],
        },
        gen: gm_ruler,
        levels: { 1: 'starting at 0, whole centimetres', 2: 'not starting at 0', 3: 'millimetres' },
      },
      {
        id: 'y3-gm-units',
        title: 'Metres, centimetres and millimetres',
        outcomes: ['MA2-GM-02'],
        summary: 'Choose units, convert between them and compare lengths.',
        learn: {
          intro: '<p>We measure long things in metres (m), shorter things in centimetres (cm) and tiny things in millimetres (mm).</p>',
          keyPoints: ['1 m = 100 cm', '1 cm = 10 mm', '1 m 35 cm = 135 cm'],
        },
        gen: gm_units,
        levels: { 1: 'choose a unit; simple conversions', 2: 'mixed units such as 1 m 35 cm', 3: 'compare lengths in mixed units' },
      },
      {
        id: 'y3-gm-angles',
        title: 'Angles and turns',
        outcomes: ['MA2-GM-03'],
        summary: 'Arms and vertex, right angles as quarter turns, and comparing angles.',
        learn: {
          intro: '<p>An angle is the amount of turn between two <b>arms</b> that meet at a <b>vertex</b>. A quarter turn makes a <b>right angle</b>.</p>',
          keyPoints: ['Longer arms do not make an angle bigger.', 'A half turn is 2 right angles; a full turn is 4.'],
          vocab: [
            ['vertex', 'the point where the two arms of an angle meet'],
            ['right angle', 'a quarter turn, like the corner of a page'],
          ],
        },
        gen: gm_angles,
        levels: { 1: 'angle words', 2: 'compare two angles', 3: 'turns as right angles' },
      },
    ],
  },
  {
    id: 'y3-shapes-area',
    year: 3,
    title: '2D shapes and area',
    strand: 'Measurement and space',
    outcomes: ['MA2-2DS-01', 'MA2-2DS-02', 'MA2-2DS-03'],
    blurb: 'Quadrilaterals, symmetry, turns and area in square centimetres and square metres.',
    colour: 320,
    skills: [
      {
        id: 'y3-2d-quads',
        title: 'Quadrilaterals',
        outcomes: ['MA2-2DS-01'],
        summary: 'Name quadrilaterals and describe their sides and angles.',
        learn: {
          intro: '<p>A <b>quadrilateral</b> has 4 straight sides. Special quadrilaterals are named by their sides and angles.</p>',
          keyPoints: ['Square: 4 equal sides, 4 right angles.', 'Rectangle: 4 right angles.', 'Rhombus: 4 equal sides.', 'Parallelogram: 2 pairs of parallel sides.', 'Trapezium: 1 pair of parallel sides.', 'Kite: 2 pairs of equal sides next to each other.'],
          vocab: [['parallel', 'lines that go in the same direction and never meet']],
        },
        gen: sh_quads,
        levels: { 1: 'name the quadrilateral', 2: 'count pairs of parallel sides', 3: 'right angles; which quadrilateral fits a description' },
      },
      {
        id: 'y3-2d-symmetry',
        title: 'Lines of symmetry',
        outcomes: ['MA2-2DS-02'],
        summary: 'Count the lines of symmetry of shapes.',
        learn: {
          intro: '<p>A <b>line of symmetry</b> divides a shape into two halves that are mirror images. If you fold along it, the halves match exactly.</p>',
          keyPoints: ['A rectangle has 2 lines of symmetry (not its diagonals).', 'A square has 4.', 'A parallelogram has none.'],
        },
        gen: sh_symmetry,
        levels: { 1: 'rectangles, squares, kites, isosceles shapes', 2: 'including shapes with 0 or 3 lines', 3: 'regular polygons' },
      },
      {
        id: 'y3-2d-area',
        title: 'Area in square units',
        outcomes: ['MA2-2DS-03'],
        summary: 'Find areas by counting square centimetres and using rows and columns.',
        learn: {
          intro: '<p><b>Area</b> is the amount of surface a shape covers. We measure it in square centimetres (cm²) or square metres (m²).</p>',
          keyPoints: ['Count squares, or use rows × squares in each row.', 'A shape can be split into rectangles to find its area.'],
        },
        gen: sh_area,
        levels: { 1: 'count squares', 2: 'rows × columns', 3: 'composite shapes; square metres' },
      },
      {
        id: 'y3-2d-turns',
        title: 'Quarter, half and three-quarter turns',
        outcomes: ['MA2-2DS-02'],
        summary: 'Describe turns using a clock face.',
        learn: {
          intro: '<p>A full turn brings you back to where you started. It is made of 4 quarter turns.</p>',
          keyPoints: ['On a clock, a quarter turn moves the hand 3 numbers.', 'A three-quarter turn one way ends where a quarter turn the other way ends.'],
        },
        gen: sh_turns,
        levels: { 1: 'turn the minute hand', 2: 'name the turn', 3: 'equivalent turns' },
      },
    ],
  },
  {
    id: 'y3-3d-volume',
    year: 3,
    title: '3D objects, capacity and volume',
    strand: 'Measurement and space',
    outcomes: ['MA2-3DS-01', 'MA2-3DS-02'],
    blurb: 'Prisms, pyramids and cylinders, nets, litres, and volume from cubic centimetres.',
    colour: 190,
    skills: [
      {
        id: 'y3-3d-objects',
        title: 'Prisms, pyramids and cylinders',
        outcomes: ['MA2-3DS-01'],
        summary: 'Name 3D objects and describe their nets.',
        learn: {
          intro: '<p>A <b>prism</b> has two matching ends joined by rectangles. A <b>pyramid</b> has one base and triangles that meet at a point. A <b>cylinder</b> has a curved surface and two circles.</p>',
          keyPoints: ['Prisms and pyramids are named after their base: triangular, square, pentagonal, hexagonal.', 'A net is a flat shape that folds up to make the object.'],
        },
        gen: td_objects,
        levels: { 1: 'name the object', 2: 'prism or pyramid, and why', 3: 'nets' },
      },
      {
        id: 'y3-3d-litres',
        title: 'Litres',
        outcomes: ['MA2-3DS-02'],
        summary: 'Estimate, read and compare capacities in litres.',
        learn: {
          intro: '<p><b>Capacity</b> is how much a container holds. A <b>litre</b> (L) is about a carton of milk.</p>',
          keyPoints: ['Read the scale at the top of the water.', 'One-litre containers can be different shapes.'],
        },
        gen: td_litres,
        levels: { 1: 'estimate against 1 litre', 2: 'read a jug in litres', 3: 'litre problems' },
      },
      {
        id: 'y3-3d-cubes',
        title: 'Volume with cubes',
        outcomes: ['MA2-3DS-02'],
        summary: 'Find volumes of models made from centimetre cubes.',
        learn: {
          intro: '<p><b>Volume</b> is the space an object takes up. A centimetre cube has a volume of 1 cubic centimetre (1 cm³).</p>',
          keyPoints: ['Count the cubes in one layer, then multiply by the number of layers.', 'Do not forget hidden cubes at the back.'],
        },
        gen: td_cubes,
        levels: { 1: 'one layer', 2: 'two or three layers', 3: 'larger models' },
      },
    ],
  },
  {
    id: 'y3-mass-time',
    year: 3,
    title: 'Mass and time',
    strand: 'Measurement and space',
    outcomes: ['MA2-NSM-01', 'MA2-NSM-02'],
    blurb: 'Kilograms, reading analog clocks to the minute, time words and durations.',
    colour: 45,
    skills: [
      {
        id: 'y3-nsm-kg',
        title: 'Kilograms',
        outcomes: ['MA2-NSM-01'],
        summary: 'Estimate, compare and add masses in kilograms.',
        learn: {
          intro: '<p><b>Mass</b> is how heavy something is. We measure it in kilograms (kg). A bag of sugar is about 1 kg.</p>',
          keyPoints: ['Compare objects with a 1 kg mass on a pan balance.', 'Add and subtract masses like other numbers.'],
        },
        gen: nsm_kg,
        levels: { 1: 'benchmark 1 kg', 2: 'pan balance; compare', 3: 'add masses; how much more fits' },
      },
      {
        id: 'y3-nsm-clock',
        title: 'Reading clocks',
        outcomes: ['MA2-NSM-02'],
        summary: 'Read analog clocks to the hour, half-hour, quarter-hour and minute.',
        learn: {
          intro: '<p>The <b>short hand</b> shows the hour. The <b>long hand</b> shows the minutes. Each number on the clock stands for 5 minutes.</p>',
          keyPoints: ['Long hand on 6: half past (30 minutes).', 'Long hand on 3: quarter past; on 9: quarter to.', 'Count the small marks to read to the minute.'],
        },
        gen: nsm_clock,
        levels: { 1: 'o’clock and half past', 2: 'quarters and 5-minute times', 3: 'to the minute' },
      },
      {
        id: 'y3-nsm-timewords',
        title: 'Time words and digital time',
        outcomes: ['MA2-NSM-02'],
        summary: 'Connect “quarter to”, “twenty past” and digital times.',
        learn: {
          intro: '<p>We can say times in words or write them in digital form. Quarter to four is 3:45.</p>',
          keyPoints: ['Past: minutes after the hour.', 'To: minutes before the next hour.', 'An hour is 60 minutes; half an hour is 30.'],
        },
        gen: nsm_timewords,
        levels: { 1: 'minutes in parts of an hour', 2: 'words to digital', 3: 'digital to words' },
      },
      {
        id: 'y3-nsm-duration',
        title: 'How long?',
        outcomes: ['MA2-NSM-02'],
        summary: 'Find how long events last, and when they finish.',
        learn: {
          intro: '<p>To find how long something takes, count on from the start time to the finish time. Count to the next hour first if you need to.</p>',
          keyPoints: ['2:40 to 3:00 is 20 minutes.', '3:00 to 3:25 is 25 minutes, so 2:40 to 3:25 is 45 minutes.'],
        },
        gen: nsm_duration,
        levels: { 1: 'within the hour', 2: 'across the hour', 3: 'finish times' },
      },
    ],
  },
]
