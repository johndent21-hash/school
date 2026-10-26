// Year 4 (Stage 2, Part B) — Position, length and angles; 2D shapes and area; 3D objects and capacity; Mass and time
import type { Level, Question, Topic } from '@/lib/maths/types'
import type { ShapeKind } from '@/lib/maths/diagrams2'
import { D, D2, L, MINUS, TIMES, DIVIDE, NOT_TO_SCALE, chance, int, mcA, mcFixedA, name, num, numA, pick, q, sample, shuffle, timeA } from './helpers'
import { addMinutes, digital, plural } from './s2'

const big = (s: string) => `<div class="big">${s}</div>`
const sq = '<span class="box">&#9633;</span>'

// ------------------------------------------------------------------ Position, length and angles (Geometric measure B)

const DIRS = ['north', 'east', 'south', 'west']
const PLACES = ['Park', 'Shop', 'Pool', 'Zoo', 'Farm', 'Bank', 'Lake', 'Gym', 'Cafe', 'Hall', 'Tent', 'Fort']

function mapItems(cols: number, rows: number, k: number) {
  const cells = shuffle(Array.from({ length: cols * rows }, (_, i) => [(i % cols) + 1, Math.floor(i / cols) + 1] as [number, number])).slice(0, k)
  const labels = shuffle(PLACES).slice(0, k)
  return cells.map(([col, row], i) => ({ col, row, label: labels[i] }))
}

const moveText = (dx: number, dy: number) => {
  const parts: string[] = []
  if (dx) parts.push(`${plural(Math.abs(dx), 'square')} ${dx > 0 ? 'east' : 'west'}`)
  if (dy) parts.push(`${plural(Math.abs(dy), 'square')} ${dy > 0 ? 'north' : 'south'}`)
  return parts.join(' and ')
}

const gm_compass = (level: Level): Question => {
  if (level === 1) {
    const start = int(0, 3)
    const k = pick([1, 2, 3])
    const cw = chance()
    const end = (start + (cw ? k : 4 - k)) % 4
    const turn = ['', 'a quarter turn', 'a half turn', 'a three-quarter turn'][k]
    return q({
      prompt: `You are facing ${DIRS[start]}. You make ${turn} ${cw ? 'clockwise' : 'anticlockwise'}. Which direction are you facing now?`,
      answer: mcFixedA(['north', 'east', 'south', 'west'], DIRS[end]),
      hint: 'Clockwise from north goes north, east, south, west. Each step is a quarter turn.',
      steps: [...(k > 1 ? [`${cap(turn)} is ${plural(k, 'quarter turn')}.`] : []), `Going ${cw ? 'clockwise' : 'anticlockwise'} from ${DIRS[start]}: ${Array.from({ length: k + 1 }, (_, i) => DIRS[(start + (cw ? i : 4 - i)) % 4]).join(' → ')}.`],
    })
  }
  const items = mapItems(6, 5, 7)
  const map = D2.gridMap(6, 5, items, { compass: true })
  let a = pick(items)
  let b = pick(items)
  let guard = 0
  while ((a === b || a.col === b.col || a.row === b.row) && guard++ < 60) {
    a = pick(items)
    b = pick(items)
  }
  if (a === b || a.col === b.col || a.row === b.row) return gm_compass(level)
  const dx = b.col - a.col
  const dy = b.row - a.row
  if (level === 2) {
    return q({
      prompt: `Start at the ${a.label} (${D2.gridRef(a.col, a.row)}). Walk ${moveText(dx, dy)}. Where are you now?`,
      diagram: map,
      answer: mcA(b.label, sample(items.filter((x) => x !== a && x !== b).map((x) => x.label), 3)),
      hint: 'North is up the map, east is to the right.',
      steps: [`${Math.abs(dx)} ${dx > 0 ? 'east' : 'west'} from ${D2.gridRef(a.col, a.row)} reaches column ${D2.gridRef(b.col, 1)[0]}.`, `${Math.abs(dy)} ${dy > 0 ? 'north' : 'south'} reaches ${D2.gridRef(b.col, b.row)}: the ${b.label}.`],
    })
  }
  const back = moveText(-dx, -dy)
  const wrongs = [moveText(dx, dy), moveText(-dy, -dx), moveText(dx, -dy), moveText(-dx, dy)].filter((w) => w !== back)
  return q({
    prompt: `${name()} walks from the ${a.label} to the ${b.label}: ${moveText(dx, dy)}. Which directions lead back from the ${b.label} to the ${a.label}?`,
    diagram: map,
    answer: mcA(back, [...new Set(wrongs)].slice(0, 3)),
    hint: 'To go back, reverse each direction: east ↔ west, north ↔ south.',
    steps: [`Reverse each part: ${dx > 0 ? 'east becomes west' : 'west becomes east'}, ${dy > 0 ? 'north becomes south' : 'south becomes north'}.`, `The way back is ${back}.`],
  })
}

const cap = (s: string) => s[0].toUpperCase() + s.slice(1)

const sideLengths = (kind: ShapeKind) => {
  const p = D2.shapePoints(kind)
  return p.map((a, i) => Math.hypot(p[(i + 1) % p.length][0] - a[0], p[(i + 1) % p.length][1] - a[1]))
}

const gm_perimeter = (level: Level): Question => {
  if (level === 1) {
    const w = int(4, 15)
    const h = int(2, w - 1)
    return q({
      prompt: 'What is the perimeter of this rectangle?',
      diagram: D.rectangle(w, h, `${w} cm`, `${h} cm`),
      answer: numA(2 * (w + h)),
      suffix: 'cm',
      hint: 'The perimeter is the distance all the way around. A rectangle has two of each side length.',
      steps: [`${w} + ${h} + ${w} + ${h} = ${2 * (w + h)} cm`],
      note: NOT_TO_SCALE,
    })
  }
  if (level === 2) {
    const kind = pick(['trapezium', 'kite', 'irregular quadrilateral', 'parallelogram'] as ShapeKind[])
    const raw = sideLengths(kind)
    const scale = int(2, 4) / Math.min(...raw)
    const sides = raw.map((x) => Math.max(1, Math.round(x * scale * 1.5)))
    // keep matching sides matching
    if (kind === 'kite') sides[3] = sides[0]
    if (kind === 'kite') sides[2] = sides[1]
    if (kind === 'parallelogram') {
      sides[2] = sides[0]
      sides[3] = sides[1]
    }
    const unit = pick(['cm', 'm'])
    const total = sides.reduce((s, x) => s + x, 0)
    return q({
      prompt: `What is the perimeter of this ${kind === 'irregular quadrilateral' ? 'quadrilateral' : kind}?`,
      diagram: D2.shapeWithSides(
        kind,
        sides.map((x) => `${x} ${unit}`),
      ),
      answer: numA(total),
      suffix: unit,
      hint: 'Add all four side lengths.',
      steps: [`${sides.join(' + ')} = ${total} ${unit}`],
      note: NOT_TO_SCALE,
    })
  }
  const kind = pick(['rect', 'square', 'squareSide'])
  if (kind === 'square') {
    const s = int(3, 25)
    return q({
      prompt: `A square garden has sides of ${s} m. What is its perimeter?`,
      answer: numA(4 * s),
      suffix: 'm',
      hint: 'A square has 4 equal sides.',
      steps: [`4 ${TIMES} ${s} = ${4 * s} m`],
    })
  }
  if (kind === 'squareSide') {
    const s = int(3, 12)
    return q({
      prompt: `A square has a perimeter of ${4 * s} cm. How long is each side?`,
      answer: numA(s),
      suffix: 'cm',
      hint: 'The 4 sides are equal, so share the perimeter into 4.',
      steps: [`${4 * s} ${DIVIDE} 4 = ${s} cm`],
    })
  }
  const w = int(5, 15)
  const h = int(2, w - 1)
  return q({
    prompt: `A rectangle has a perimeter of ${2 * (w + h)} cm. Its length is ${w} cm. What is its width?`,
    answer: numA(h),
    suffix: 'cm',
    hint: 'Two lengths plus two widths make the perimeter.',
    steps: [`Two lengths: 2 ${TIMES} ${w} = ${2 * w} cm`, `Two widths: ${2 * (w + h)} ${MINUS} ${2 * w} = ${2 * h} cm`, `One width: ${2 * h} ${DIVIDE} 2 = ${h} cm`],
  })
}

const dec2 = (x: number) => num(Math.round(x * 100) / 100)

const gm_convert = (level: Level): Question => {
  if (level === 1) {
    const kind = pick(['m-cm', 'cm-mm', 'mm-cm', 'cm-m'])
    const k = int(2, 9)
    const map: Record<string, [string, number, string]> = {
      'm-cm': [`${k} m`, 100 * k, 'cm'],
      'cm-mm': [`${k} cm`, 10 * k, 'mm'],
      'mm-cm': [`${10 * k} mm`, k, 'cm'],
      'cm-m': [`${100 * k} cm`, k, 'm'],
    }
    const [from, ans, unit] = map[kind]
    return q({
      prompt: `Convert ${from} to ${unit === 'cm' ? 'centimetres' : unit === 'mm' ? 'millimetres' : 'metres'}.`,
      answer: numA(ans),
      suffix: unit,
      hint: '1 m = 100 cm and 1 cm = 10 mm.',
      steps: [`${from} = ${ans} ${unit}`],
    })
  }
  if (level === 2) {
    const kind = pick(['cm-m', 'm-cm', 'mm-cm', 'cm-mm'])
    if (kind === 'cm-m') {
      const c = int(101, 499)
      if (c % 100 === 0) return gm_convert(level)
      return q({
        prompt: `Write ${c} cm in metres, using a decimal.`,
        answer: numA(c / 100),
        suffix: 'm',
        hint: '100 cm = 1 m, so each centimetre is one hundredth of a metre.',
        steps: [`${c} cm = ${Math.floor(c / 100)} m ${c % 100} cm`, `${c % 100} cm = ${c % 100} hundredths of a metre`, `= ${dec2(c / 100)} m`],
      })
    }
    if (kind === 'm-cm') {
      const c = int(101, 499)
      if (c % 10 === 0) return gm_convert(level)
      return q({
        prompt: `Complete:${big(`${dec2(c / 100)} m = ${sq} cm`)}`,
        answer: numA(c),
        suffix: 'cm',
        hint: '1 m = 100 cm.',
        steps: [`${dec2(c / 100)} m = ${dec2(c / 100)} ${TIMES} 100 cm = ${c} cm`],
      })
    }
    const mm = int(21, 149)
    if (mm % 10 === 0) return gm_convert(level)
    if (kind === 'mm-cm')
      return q({
        prompt: `Write ${mm} mm in centimetres, using a decimal.`,
        answer: numA(mm / 10),
        suffix: 'cm',
        hint: '10 mm = 1 cm, so each millimetre is one tenth of a centimetre.',
        steps: [`${mm} mm = ${Math.floor(mm / 10)} cm ${mm % 10} mm = ${dec2(mm / 10)} cm`],
      })
    return q({
      prompt: `Complete:${big(`${dec2(mm / 10)} cm = ${sq} mm`)}`,
      answer: numA(mm),
      suffix: 'mm',
      hint: '1 cm = 10 mm.',
      steps: [`${dec2(mm / 10)} ${TIMES} 10 = ${mm} mm`],
    })
  }
  if (chance()) {
    const total = int(15, 39) * 10
    const cut = int(25, Math.floor(total / 2))
    return q({
      prompt: `A ribbon is ${dec2(total / 100)} m long. ${name()} cuts off ${cut} cm. How much ribbon is left, in centimetres?`,
      answer: numA(total - cut),
      suffix: 'cm',
      hint: 'Change the metres to centimetres first.',
      steps: [`${dec2(total / 100)} m = ${total} cm`, `${total} ${MINUS} ${cut} = ${total - cut} cm`],
    })
  }
  const set = new Set<number>()
  while (set.size < 4) set.add(int(102, 198))
  const vals = [...set]
  const forms = [(v: number) => `${dec2(v / 100)} m`, (v: number) => `${v} cm`, (v: number) => `1 m ${v - 100} cm`]
  const labels = vals.map((v, i) => forms[i % 3](v))
  const max = Math.max(...vals)
  return q({
    prompt: 'Which length is the longest?',
    answer: mcFixedA(labels, labels[vals.indexOf(max)]),
    hint: 'Write them all in centimetres.',
    steps: [vals.map((v, i) => `${labels[i]} = ${v} cm`).join(', '), `The longest is ${labels[vals.indexOf(max)]}.`],
  })
}

const ANGLE_NAMES = ['acute', 'right', 'obtuse', 'straight', 'reflex', 'revolution']
const angleType = (a: number) => (a < 90 ? 'acute' : a === 90 ? 'right' : a < 180 ? 'obtuse' : a === 180 ? 'straight' : a < 360 ? 'reflex' : 'revolution')
const ANGLE_WHY: Record<string, string> = {
  acute: 'less than a right angle (less than a quarter turn)',
  right: 'exactly a quarter turn',
  obtuse: 'more than a right angle but less than a straight angle',
  straight: 'a half turn: the arms make a straight line',
  reflex: 'more than a half turn but less than a full turn',
  revolution: 'a full turn',
}

const gm_angles = (level: Level): Question => {
  if (level === 1) {
    const size = pick([int(25, 70), 90, int(110, 160)])
    const correct = size < 90 ? 'Less than a right angle' : size === 90 ? 'Equal to a right angle' : 'Greater than a right angle'
    return q({
      prompt: 'Compare this angle with a right angle.',
      diagram: D2.plainAngle(size),
      answer: mcFixedA(['Less than a right angle', 'Equal to a right angle', 'Greater than a right angle'], correct),
      hint: 'Imagine the corner of a page placed on the angle.',
      steps: [`The angle is ${correct.toLowerCase()}.`],
    })
  }
  if (level === 2) {
    const size = pick([int(25, 75), 90, int(105, 165), 180])
    const t = angleType(size)
    return q({
      prompt: 'What type of angle is this?',
      diagram: D2.plainAngle(size),
      answer: mcFixedA(['acute', 'right', 'obtuse', 'straight'], t),
      hint: 'Compare it with a right angle (a quarter turn) and a straight angle (a half turn).',
      steps: [`It is ${ANGLE_WHY[t]}, so it is ${t === 'acute' || t === 'obtuse' ? 'an' : 'a'} ${t} angle.`],
    })
  }
  if (chance(0.45)) {
    const ask = pick([
      ['A three-quarter turn makes what type of angle?', 'reflex'],
      ['A full turn makes what type of angle?', 'revolution'],
      ['A half turn makes what type of angle?', 'straight'],
      ['An angle that is more than a half turn but less than a full turn is called what?', 'reflex'],
    ])
    return q({
      prompt: ask[0],
      answer: mcFixedA(ANGLE_NAMES, ask[1]),
      hint: 'Right = quarter turn, straight = half turn, revolution = full turn.',
      steps: [`It is ${ANGLE_WHY[ask[1]]}: ${ask[1] === 'acute' || ask[1] === 'obtuse' ? 'an' : 'a'} ${ask[1]} angle.`],
    })
  }
  const size = pick([int(25, 75), int(105, 165), int(200, 330)])
  const t = angleType(size)
  return q({
    prompt: 'What type of angle is marked?',
    diagram: D2.plainAngle(size),
    answer: mcFixedA(['acute', 'obtuse', 'straight', 'reflex'], t),
    hint: 'Look at the marked turn. Is it more than a half turn?',
    steps: [`The marked angle is ${ANGLE_WHY[t]}, so it is ${t === 'acute' || t === 'obtuse' ? 'an' : 'a'} ${t} angle.`],
  })
}

// ------------------------------------------------------------------ 2D shapes and area (2DS B)

const sh_area = (level: Level): Question => {
  if (level === 1) {
    const w = int(4, 10)
    const h = int(3, 7)
    const cells: [number, number][] = []
    for (let c = 0; c < w; c++) for (let r = 0; r < h; r++) cells.push([c + 1, r + 1])
    return q({
      prompt: 'The rectangle is drawn on a grid of 1 cm squares. What is its area?',
      diagram: D2.cellGrid(w + 2, h + 2, cells),
      answer: numA(w * h),
      suffix: 'cm²',
      hint: 'Use rows and columns instead of counting by ones.',
      steps: [`${h} rows of ${w} squares: ${h} ${TIMES} ${w} = ${w * h} cm²`],
    })
  }
  if (level === 2) {
    let w = 0
    let h = 0
    do {
      w = int(2, 9)
      h = int(2, 6)
    } while ((w * h) % 2 !== 0)
    return q({
      prompt: 'The right-angled triangle is drawn on a grid of 1 cm squares. What is its area?',
      diagram: D2.triangleOnGrid(w + 2, h + 2, w, h),
      answer: numA((w * h) / 2),
      suffix: 'cm²',
      hint: 'The triangle is half of a rectangle. Find the rectangle’s area, then halve it.',
      steps: [`The rectangle around it is ${w} cm by ${h} cm: ${w} ${TIMES} ${h} = ${w * h} cm².`, `The triangle is half of it: ${w * h} ${DIVIDE} 2 = ${(w * h) / 2} cm².`],
    })
  }
  if (chance()) {
    const l = int(4, 12)
    const w = int(3, l)
    const room = pick(['classroom floor', 'garden bed', 'basketball key', 'school vegetable patch'])
    return q({
      prompt: `A ${room} is a rectangle ${l} m long and ${w} m wide. What is its area?`,
      answer: numA(l * w),
      suffix: 'm²',
      hint: 'Imagine it covered in rows of square metres.',
      steps: [`${w} rows of ${l} square metres: ${w} ${TIMES} ${l} = ${l * w} m²`],
    })
  }
  let a: [number, number]
  let b: [number, number]
  do {
    a = [int(3, 9), int(3, 9)]
    b = [int(3, 9), int(3, 9)]
  } while (a[0] === a[1] || b[0] === b[1] || a[0] * a[1] === b[0] * b[1] || Math.abs(a[0] * a[1] - b[0] * b[1]) > 6 || a[0] + a[1] === b[0] + b[1])
  const A = `${a[0]} cm by ${a[1]} cm`
  const B = `${b[0]} cm by ${b[1]} cm`
  const bigger = a[0] * a[1] > b[0] * b[1] ? A : B
  return q({
    prompt: `Which rectangle has the larger area: ${A} or ${B}?`,
    answer: mcFixedA([A, B], bigger),
    hint: 'Estimate first, then multiply to check.',
    steps: [`${a[0]} ${TIMES} ${a[1]} = ${a[0] * a[1]} cm²`, `${b[0]} ${TIMES} ${b[1]} = ${b[0] * b[1]} cm²`, `${bigger} has the larger area.`],
  })
}

const sh_samearea = (level: Level): Question => {
  if (level === 1) {
    const [w, h] = pick([
      [4, 6],
      [3, 8],
      [2, 9],
      [4, 9],
      [3, 10],
      [5, 8],
    ] as [number, number][])
    const area = w * h
    const pairs: [number, number][] = []
    for (let x = 1; x * x <= area; x++) if (area % x === 0 && x !== w && x !== h && x !== 1 && x * x !== area) pairs.push([x, area / x])
    if (!pairs.length) return sh_samearea(level)
    const right = pick(pairs)
    const wrongSet = new Set<string>()
    for (const [x, y] of [
      [w + 1, h - 1],
      [w, h + 1],
      [w - 1, h],
      [right[0] + 1, right[1]],
      [w + 2, h - 2],
    ])
      if (x > 0 && y > 0 && x * y !== area) wrongSet.add(`${x} cm by ${y} cm`)
    return q({
      prompt: `Which rectangle has the same area as a rectangle ${w} cm by ${h} cm?`,
      answer: mcA(`${right[0]} cm by ${right[1]} cm`, [...wrongSet].slice(0, 3)),
      hint: `First find the area: ${w} ${TIMES} ${h}.`,
      steps: [`${w} ${TIMES} ${h} = ${area} cm²`, `${right[0]} ${TIMES} ${right[1]} = ${area} cm² too, so it has the same area with different side lengths.`],
    })
  }
  if (level === 2) {
    const s = int(2, 9)
    const t = int(3, 10)
    if (s === t) return sh_samearea(level)
    return q({
      prompt: `A rectangle has an area of ${s * t} cm². One side is ${s} cm long. How long is the other side?`,
      answer: numA(t),
      suffix: 'cm',
      hint: `${s} ${TIMES} what = ${s * t}?`,
      steps: [`${s * t} ${DIVIDE} ${s} = ${t} cm`],
    })
  }
  const area = pick([12, 18, 20, 24, 28, 30, 32])
  const pairs: string[] = []
  for (let x = 1; x * x < area; x++) if (area % x === 0) pairs.push(`${x} by ${area / x}`)
  return q({
    prompt: `How many different rectangles with whole-centimetre sides have an area of ${area} cm²? (A 2 by 6 rectangle and a 6 by 2 rectangle count as the same.)`,
    answer: numA(pairs.length),
    hint: `Find pairs of numbers that multiply to ${area}. Start with 1.`,
    steps: [`Pairs that multiply to ${area}: ${pairs.join(', ')}.`, `There are ${pairs.length} rectangles.`],
  })
}

const sh_combine = (level: Level): Question => {
  type Item = [string, string, string[], string]
  const L1: Item[] = [
    ['Two identical squares are joined side to side. What shape do they make?', 'a rectangle', ['a triangle', 'a pentagon', 'a kite'], 'Two equal squares side by side make a shape with 4 right angles and two longer sides: a rectangle.'],
    ['A square is cut along one diagonal. What two shapes are made?', 'two right-angled triangles', ['two rectangles', 'two squares', 'two trapeziums'], 'The diagonal joins opposite corners, so each half has 3 sides and a right angle.'],
    ['A square is cut in half by a line joining the middles of two opposite sides. What two shapes are made?', 'two rectangles', ['two triangles', 'two squares', 'two kites'], 'Each half keeps 4 right angles but is longer than it is wide: a rectangle.'],
  ]
  const L2: Item[] = [
    ['Two identical equilateral triangles are joined along one side. What shape do they make?', 'a rhombus', ['a square', 'a hexagon', 'a trapezium'], 'The new shape has 4 equal sides and no right angles: a rhombus.'],
    ['Three identical equilateral triangles are joined in a row, the middle one pointing down. What shape do they make?', 'a trapezium', ['a rectangle', 'a hexagon', 'a square'], 'The shape has one pair of parallel sides of different lengths: a trapezium.'],
    ['A right-angled triangle is cut off one end of a parallelogram and moved to the other end. What shape is made?', 'a rectangle', ['a kite', 'a rhombus', 'a triangle'], 'Moving the triangle makes all four corners right angles: a rectangle.'],
  ]
  if (level === 3) {
    const ask = pick([
      ['How many identical equilateral triangles fit together, meeting at the centre, to make a regular hexagon?', 6, 'Joining the centre to each of the 6 corners makes 6 equilateral triangles.'],
      ['How many identical right-angled triangles, made by cutting a rectangle along its diagonal, make the whole rectangle?', 2, 'One diagonal cuts a rectangle into 2 identical right-angled triangles.'],
      ['A regular hexagon is cut in half through two opposite corners. How many trapeziums are made?', 2, 'The cut makes 2 identical trapeziums.'],
      ['An isosceles trapezium is split into one rectangle and some right-angled triangles. How many triangles?', 2, 'Cutting straight down from the two top corners leaves a rectangle in the middle and a triangle at each end: 2 triangles.'],
    ] as [string, number, string][])
    return q({ prompt: ask[0], answer: numA(ask[1]), hint: 'Draw a sketch to help.', steps: [ask[2]] })
  }
  const it = pick(level === 1 ? L1 : L2)
  return q({
    prompt: it[0],
    answer: mcA(it[1], it[2]),
    hint: 'Draw a quick sketch, then count the sides and check the angles.',
    steps: [it[3]],
  })
}

const sh_tessellate = (level: Level): Question => {
  if (level === 1) {
    const yes = pick(['square', 'equilateral triangle', 'regular hexagon', 'rectangle'])
    return q({
      prompt: 'Which shape will tessellate on its own (fit together with no gaps and no overlaps)?',
      answer: mcA(yes, ['circle', 'regular pentagon', 'regular octagon']),
      hint: 'Picture lots of the same shape covering a floor. Would there be gaps?',
      steps: [`Copies of ${/^[aeiou]/.test(yes) ? 'an' : 'a'} ${yes} fit together with no gaps or overlaps.`, 'Circles, regular pentagons and regular octagons leave gaps.'],
    })
  }
  if (level === 2) {
    const no = pick(['circle', 'regular pentagon', 'regular octagon'])
    return q({
      prompt: 'Which shape will <b>not</b> tessellate on its own?',
      answer: mcA(no, sample(['square', 'equilateral triangle', 'regular hexagon', 'rectangle'], 3)),
      hint: 'Which shape would leave gaps when you put copies together?',
      steps: [`Copies of a ${no} leave gaps, so it does not tessellate on its own.`],
    })
  }
  const [shape, n] = pick([
    ['squares', 4],
    ['equilateral triangles', 6],
    ['regular hexagons', 3],
  ] as [string, number][])
  return q({
    prompt: `In a tessellation of ${shape}, how many shapes meet at each corner point?`,
    answer: numA(n),
    hint: 'The angles that meet at a point must make a full turn.',
    steps: [`${n} ${shape} meet at each point, making a full turn with no gaps.`],
  })
}

// ------------------------------------------------------------------ 3D objects and capacity (3DS B)

const SOLIDS: { label: string; kind: 'prism' | 'pyramid'; n: number }[] = [
  { label: 'triangular prism', kind: 'prism', n: 3 },
  { label: 'rectangular prism', kind: 'prism', n: 4 },
  { label: 'pentagonal prism', kind: 'prism', n: 5 },
  { label: 'hexagonal prism', kind: 'prism', n: 6 },
  { label: 'triangular pyramid', kind: 'pyramid', n: 3 },
  { label: 'square pyramid', kind: 'pyramid', n: 4 },
  { label: 'pentagonal pyramid', kind: 'pyramid', n: 5 },
  { label: 'hexagonal pyramid', kind: 'pyramid', n: 6 },
]
export const solidCounts = (kind: 'prism' | 'pyramid', n: number) =>
  kind === 'prism' ? { faces: n + 2, edges: 3 * n, vertices: 2 * n } : { faces: n + 1, edges: 2 * n, vertices: n + 1 }

const td_features = (level: Level): Question => {
  if (level === 3 && chance(0.25)) {
    const flat = chance()
    return q({
      prompt: `How many ${flat ? 'flat' : 'curved'} surfaces does a cylinder have?`,
      diagram: D.cylinder(1, 1.4, '', ''),
      answer: numA(flat ? 2 : 1),
      hint: 'Look at the ends and the side.',
      steps: [flat ? 'The two ends are flat circles: 2 flat surfaces.' : 'The side is one curved surface.'],
    })
  }
  const s = pick(SOLIDS)
  const c = solidCounts(s.kind, s.n)
  const what = L(level, 'faces', 'vertices', 'edges') as 'faces' | 'vertices' | 'edges'
  const how = {
    faces: s.kind === 'prism' ? `${s.n} rectangular faces around the sides + 2 ends = ${c.faces}` : `${s.n} triangular faces + 1 base = ${c.faces}`,
    vertices: s.kind === 'prism' ? `${s.n} corners on the top + ${s.n} on the bottom = ${c.vertices}` : `${s.n} corners on the base + 1 apex = ${c.vertices}`,
    edges: s.kind === 'prism' ? `${s.n} on the top + ${s.n} on the bottom + ${s.n} joining them = ${c.edges}` : `${s.n} around the base + ${s.n} up to the apex = ${c.edges}`,
  }[what]
  return q({
    prompt: `This is a ${s.label}. How many ${what} does it have? (Dashed lines show hidden edges.)`,
    diagram: D2.solid(s.kind, s.n),
    answer: numA(c[what]),
    hint: { faces: 'Count the flat surfaces, including the ones you cannot see.', vertices: 'Count the corners, top and bottom.', edges: 'Count the lines where two faces meet, in groups.' }[what],
    steps: [how],
  })
}

const td_ml = (level: Level): Question => {
  if (level === 1) {
    if (chance(0.4)) {
      const ask = pick([
        ['Which container holds about 250 mL?', 'a cup', ['a bucket', 'a bathtub', 'a teaspoon']],
        ['Which container holds about 5 mL?', 'a teaspoon', ['a cup', 'a jug', 'a bucket']],
        ['Which container holds about 2 L?', 'a large bottle of milk', ['a teaspoon', 'an egg cup', 'a swimming pool']],
      ] as [string, string, string[]][])
      return q({ prompt: ask[0], answer: mcA(ask[1], ask[2]), hint: '1 L = 1000 mL. A cup is about 250 mL.', steps: [`${cap(ask[1])}.`] })
    }
    const k = int(1, 9)
    return q({
      prompt: k === 1 ? 'How many millilitres are in 1 litre?' : `How many millilitres are in ${k} litres?`,
      answer: numA(1000 * k),
      suffix: 'mL',
      hint: '1 L = 1000 mL',
      steps: [`${k} ${TIMES} 1000 = ${num(1000 * k)} mL`],
    })
  }
  if (level === 2) {
    const max = pick([1000, 2000])
    const step = 100
    const labelEvery = max === 1000 ? 200 : 500
    const lv = int(1, max / step - 1) * step
    return q({
      prompt: 'How much water is in the jug, in millilitres?',
      diagram: D2.jug(max, step, labelEvery, lv),
      answer: numA(lv),
      suffix: 'mL',
      hint: `The labelled marks go up in ${labelEvery} mL. How much is each small mark worth?`,
      steps: [`The labels go up by ${labelEvery} mL and there ${labelEvery / step === 1 ? 'is' : 'are'} ${labelEvery / step} spaces between labels, so each mark is ${step} mL.`, `The water is at ${num(lv)} mL.`],
    })
  }
  if (chance()) {
    const bottle = pick([1000, 1500, 2000])
    const glass = pick([200, 250])
    const k = int(2, Math.floor(bottle / glass) - 1)
    return q({
      prompt: `A bottle holds ${bottle >= 1000 && bottle % 1000 === 0 ? `${bottle / 1000} L` : `1 L ${bottle - 1000} mL`} of juice. ${name()} pours ${k} glasses of ${glass} mL. How much juice is left in the bottle?`,
      answer: numA(bottle - k * glass),
      suffix: 'mL',
      hint: 'Change litres to millilitres first.',
      steps: [`The bottle holds ${num(bottle)} mL.`, `${k} ${TIMES} ${glass} = ${num(k * glass)} mL poured`, `${num(bottle)} ${MINUS} ${num(k * glass)} = ${num(bottle - k * glass)} mL`],
    })
  }
  const set = new Set<number>()
  while (set.size < 4) set.add(int(18, 32) * 50)
  const vals = [...set]
  const show = (v: number, i: number) => (i % 2 === 0 && v > 1000 ? `${Math.floor(v / 1000)} L ${v % 1000} mL` : `${num(v)} mL`)
  const labels = vals.map(show)
  const max = Math.max(...vals)
  return q({
    prompt: 'Which container holds the most?',
    answer: mcFixedA(labels, labels[vals.indexOf(max)]),
    hint: 'Change them all to millilitres.',
    steps: [vals.map((v, i) => `${labels[i]} = ${num(v)} mL`).join(', '), `The most is ${labels[vals.indexOf(max)]}.`],
  })
}

// ------------------------------------------------------------------ Mass and time (NSM B)

const nsm_grams = (level: Level): Question => {
  if (level === 1) {
    if (chance(0.4)) {
      const g = pick(['an apple', 'a pencil', 'a slice of bread', 'a mobile phone'])
      return q({
        prompt: 'Which would you weigh in grams rather than kilograms?',
        answer: mcA(g, ['a dog', 'a bag of potatoes', 'a bicycle']),
        hint: 'Light objects are measured in grams. 1000 g = 1 kg.',
        steps: [`${cap(g)} is much lighter than 1 kg, so grams are best.`],
      })
    }
    const k = int(1, 9)
    return q({
      prompt: k === 1 ? 'How many grams are in 1 kilogram?' : `How many grams are in ${k} kg?`,
      answer: numA(1000 * k),
      suffix: 'g',
      hint: '1 kg = 1000 g',
      steps: [`${k} ${TIMES} 1000 = ${num(1000 * k)} g`],
    })
  }
  if (level === 2) {
    const v = int(1, 19) * 50
    return q({
      prompt: 'What mass do the scales show?',
      diagram: D2.dialScale(1000, 100, 2, v),
      answer: numA(v),
      suffix: 'g',
      hint: 'The numbers go up by 100 g. Each small mark halfway between is 50 g.',
      steps: [`Each small mark is 50 g.`, `The needle points to ${v} g.`],
    })
  }
  if (chance()) {
    const v = int(1, 19) * 250
    return q({
      prompt: 'The scales are marked in kilograms. What mass do they show, in grams?',
      diagram: D2.dialScale(5000, 1000, 4, v, true),
      answer: numA(v),
      suffix: 'g',
      hint: 'There are 4 spaces between each kilogram, so each small mark is 250 g.',
      steps: [`Each small mark is 1000 ${DIVIDE} 4 = 250 g.`, `The needle shows ${Math.floor(v / 1000)} kg and ${v % 1000} g = ${num(v)} g.`],
    })
  }
  const kg = int(1, 4)
  const g = int(1, 19) * 50
  if (chance()) {
    return q({
      prompt: `Complete:${big(`${kg} kg ${g} g = ${sq} g`)}`,
      answer: numA(kg * 1000 + g),
      suffix: 'g',
      hint: '1 kg = 1000 g',
      steps: [`${kg} kg = ${num(kg * 1000)} g`, `${num(kg * 1000)} + ${g} = ${num(kg * 1000 + g)} g`],
    })
  }
  const other = kg * 1000 + g + pick([-1, 1]) * int(1, 6) * 50
  const A = `${kg} kg ${g} g`
  const B = `${num(other)} g`
  const heavier = kg * 1000 + g > other ? A : B
  return q({
    prompt: `Which is heavier: ${A} or ${B}?`,
    answer: mcFixedA([A, B], heavier),
    hint: 'Write both masses in grams.',
    steps: [`${A} = ${num(kg * 1000 + g)} g`, `${num(Math.max(kg * 1000 + g, other))} g > ${num(Math.min(kg * 1000 + g, other))} g, so ${heavier} is heavier.`],
  })
}

const nsm_digital = (level: Level): Question => {
  if (level === 1) {
    if (chance(0.4)) {
      const ask = pick([
        ['Which would you time in seconds?', 'running 50 metres', ['a school holiday', 'a soccer season', 'a movie']],
        ['Which would you time in seconds?', 'tying your shoelaces', ['a school term', 'a sleepover', 'a long drive']],
      ] as [string, string, string[]][])
      return q({ prompt: ask[0], answer: mcA(ask[1], ask[2]), hint: 'Seconds are for very short events.', steps: [`${cap(ask[1])} takes only a short time, so seconds are best.`] })
    }
    const k = int(1, 5)
    return q({
      prompt: k === 1 ? 'How many seconds are in 1 minute?' : `How many seconds are in ${k} minutes?`,
      answer: numA(60 * k),
      suffix: 'seconds',
      hint: '1 minute = 60 seconds',
      steps: [`${k} ${TIMES} 60 = ${60 * k} seconds`],
    })
  }
  if (level === 2) {
    const h = int(1, 12)
    const m = int(2, 58)
    if (m % 15 === 0) return nsm_digital(level)
    return q({
      prompt: `A digital clock shows <b>${digital(h, m)}</b>. How many minutes until the next hour?`,
      answer: numA(60 - m),
      suffix: 'minutes',
      hint: 'An hour has 60 minutes. Subtract the minutes shown from 60.',
      steps: [`The hour is ${h}; the minutes are ${m}.`, `60 ${MINUS} ${m} = ${60 - m} minutes until ${digital((h % 12) + 1, 0)}.`],
    })
  }
  if (chance()) {
    const mi = int(1, 4)
    const s = int(5, 55)
    return q({
      prompt: `Complete:${big(`${mi} min ${s} s = ${sq} s`)}`,
      answer: numA(mi * 60 + s),
      suffix: 's',
      hint: '1 minute = 60 seconds',
      steps: [`${mi} min = ${mi * 60} s`, `${mi * 60} + ${s} = ${mi * 60 + s} s`],
    })
  }
  const times = sample(Array.from({ length: 50 }, (_, i) => 70 + i), 3)
  const people = sample(['Ava', 'Ben', 'Chloe', 'Dev', 'Ella', 'Finn'], 3)
  const fmt = (t: number, i: number) => (i === 1 ? `${t} s` : `1 min ${t - 60} s`)
  const labels = times.map(fmt)
  const best = times.indexOf(Math.min(...times))
  return q({
    prompt: `Three swimmers' times: ${people.map((p, i) => `${p} ${labels[i]}`).join(', ')}. The fastest time wins. Who won?`,
    answer: mcFixedA(people, people[best]),
    hint: 'Change the times to seconds. The fastest has the smallest time.',
    steps: [times.map((t, i) => `${people[i]}: ${t} s`).join(', '), `${people[best]} has the smallest time.`],
  })
}

const EVENTS: [string, number, number, 'am' | 'pm'][] = [
  ['eats breakfast', 7, 15, 'am'],
  ['arrives at school', 8, 45, 'am'],
  ['has recess', 10, 50, 'am'],
  ['eats lunch', 12, 30, 'pm'],
  ['leaves school', 3, 10, 'pm'],
  ['has soccer training', 5, 30, 'pm'],
  ['eats dinner', 6, 20, 'pm'],
  ['goes to bed', 8, 15, 'pm'],
]

const nsm_ampm = (level: Level): Question => {
  if (level === 1) {
    if (chance(0.35)) {
      const midday = chance()
      return q({
        prompt: midday ? 'Which time is 5 minutes after midday (noon)?' : 'Which time is 5 minutes after midnight?',
        answer: midday ? mcFixedA(['12:05 am', '12:05 pm'], '12:05 pm') : mcFixedA(['12:05 am', '12:05 pm'], '12:05 am'),
        hint: 'am times run from midnight to midday. pm times run from midday to midnight.',
        steps: [midday ? 'Times just after midday (noon) are pm: 12:05 pm.' : 'Times just after midnight are am: 12:05 am.'],
      })
    }
    const [what, h, m, ap] = pick(EVENTS)
    const who = name()
    return q({
      prompt: `${who} ${what} at ${digital(h, m)}. Is that am or pm?`,
      answer: mcFixedA(['am', 'pm'], ap),
      hint: 'am is between midnight and midday. pm is between midday and midnight.',
      steps: [`${who} ${what} ${ap === 'am' ? 'in the morning' : h === 12 ? 'just after midday' : 'in the afternoon or evening'}, so it is ${digital(h, m)} ${ap}.`],
    })
  }
  if (level === 2) {
    const [what, h, m, ap] = pick(EVENTS)
    const who = name()
    return q({
      prompt: `The clock shows the time ${who} ${what}. Write the time with am or pm.`,
      diagram: D2.clock(h, m),
      answer: timeA(h, m, ap),
      hint: 'Read the clock, then think: morning (am) or afternoon/evening (pm)?',
      steps: [`The clock shows ${digital(h, m)}.`, `${who} ${what} ${ap === 'am' ? 'in the morning' : h === 12 ? 'just after midday' : 'in the afternoon or evening'}, so it is ${digital(h, m)} ${ap}.`],
    })
  }
  // duration across midday
  const sh = int(9, 11)
  const sm = int(1, 11) * 5
  const dur = int(13, 30) * 5
  const [eh, em] = addMinutes(sh, sm, dur)
  if ((eh >= sh && eh !== 12) || (eh === 12 && em === 0)) return nsm_ampm(level)
  const what = pick(['A school excursion', 'A cricket match', 'A swimming carnival', 'A movie'])
  const toNoon = (12 - sh) * 60 - sm
  return q({
    prompt: `${what} starts at ${digital(sh, sm)} am and finishes at ${digital(eh, em)} pm. How long does it go for, in minutes?`,
    answer: numA(dur),
    suffix: 'minutes',
    hint: 'Count on to 12:00 midday first, then add the time after midday.',
    steps: [`${digital(sh, sm)} am to 12:00 midday is ${toNoon} minutes.`, `12:00 midday to ${digital(eh, em)} pm is ${dur - toNoon} minutes.`, `${toNoon} + ${dur - toNoon} = ${dur} minutes`],
  })
}

// ------------------------------------------------------------------ topics

export const Y4B: Topic[] = [
  {
    id: 'y4-position-length',
    year: 4,
    title: 'Position, length and angles',
    strand: 'Measurement and space',
    outcomes: ['MA2-GM-01', 'MA2-GM-02', 'MA2-GM-03'],
    blurb: 'Compass directions on grid maps, perimeter, converting lengths with decimals, and types of angles.',
    colour: 140,
    skills: [
      {
        id: 'y4-gm-compass',
        title: 'Compass directions',
        outcomes: ['MA2-GM-01'],
        summary: 'Use north, south, east and west to follow and describe routes.',
        learn: {
          intro: '<p>On most maps, <b>north</b> is up, <b>south</b> is down, <b>east</b> is right and <b>west</b> is left.</p>',
          keyPoints: ['Clockwise: N → E → S → W. Each step is a quarter turn.', 'To come back, reverse each direction.'],
        },
        gen: gm_compass,
        levels: { 1: 'compass turns', 2: 'follow directions on a grid map', 3: 'return journeys' },
      },
      {
        id: 'y4-gm-perimeter',
        title: 'Perimeter',
        outcomes: ['MA2-GM-02'],
        summary: 'Find the perimeter of rectangles, squares and other quadrilaterals.',
        learn: {
          intro: '<p>The <b>perimeter</b> is the distance all the way around the boundary of a shape.</p>',
          keyPoints: ['Add all the side lengths.', 'Rectangle: two lengths and two widths.', 'Square: 4 equal sides.'],
        },
        gen: gm_perimeter,
        levels: { 1: 'rectangles', 2: 'other quadrilaterals', 3: 'squares and missing sides' },
      },
      {
        id: 'y4-gm-convert',
        title: 'Converting lengths',
        outcomes: ['MA2-GM-02'],
        summary: 'Convert between m, cm and mm, using decimals to 2 places.',
        learn: {
          intro: '<p>135 cm is 1 m and 35 cm, written 1.35 m. 47 mm is 4.7 cm.</p>',
          keyPoints: ['1 m = 100 cm, so 1 cm = 0.01 m.', '1 cm = 10 mm, so 1 mm = 0.1 cm.'],
        },
        gen: gm_convert,
        levels: { 1: 'whole-number conversions', 2: 'decimal notation', 3: 'problems and comparing' },
      },
      {
        id: 'y4-gm-angles',
        title: 'Types of angles',
        outcomes: ['MA2-GM-03'],
        summary: 'Compare angles with a right angle and name them: acute, right, obtuse, straight, reflex, revolution.',
        learn: {
          intro: '<p>Angles are named by comparing them with quarter turns.</p>',
          keyPoints: ['Acute: less than a right angle.', 'Right: a quarter turn.', 'Obtuse: between a right angle and a straight angle.', 'Straight: a half turn.', 'Reflex: between a half turn and a full turn.', 'Revolution: a full turn.'],
        },
        gen: gm_angles,
        levels: { 1: 'compare with a right angle', 2: 'acute, right, obtuse, straight', 3: 'reflex and revolution' },
      },
    ],
  },
  {
    id: 'y4-shapes-area',
    year: 4,
    title: '2D shapes and area',
    strand: 'Measurement and space',
    outcomes: ['MA2-2DS-01', 'MA2-2DS-02', 'MA2-2DS-03'],
    blurb: 'Area of rectangles and right-angled triangles, same area with different sides, combining shapes and tessellations.',
    colour: 320,
    skills: [
      {
        id: 'y4-2d-area',
        title: 'Area of rectangles and triangles',
        outcomes: ['MA2-2DS-03'],
        summary: 'Find areas using a square-centimetre grid, and compare areas.',
        learn: {
          intro: '<p>A right-angled triangle drawn on a grid is half of a rectangle, so its area is half the rectangle’s area.</p>',
          keyPoints: ['Rectangle: rows × squares in each row.', 'Right-angled triangle: half of the rectangle around it.', 'Large areas are measured in square metres (m²).'],
        },
        gen: sh_area,
        levels: { 1: 'rectangles on a grid', 2: 'right-angled triangles', 3: 'square metres; which is larger' },
      },
      {
        id: 'y4-2d-same-area',
        title: 'Same area, different shape',
        outcomes: ['MA2-2DS-03'],
        summary: 'Rectangles with different side lengths can have the same area.',
        learn: {
          intro: '<p>A 4 cm by 6 cm rectangle and a 3 cm by 8 cm rectangle both have an area of 24 cm².</p>',
          keyPoints: ['Find pairs of numbers that multiply to the area.', 'Missing side = area ÷ known side.'],
        },
        gen: sh_samearea,
        levels: { 1: 'which rectangle has the same area', 2: 'missing side', 3: 'how many rectangles' },
      },
      {
        id: 'y4-2d-combine',
        title: 'Combining and splitting shapes',
        outcomes: ['MA2-2DS-01'],
        summary: 'Describe the shapes made by joining or cutting common shapes.',
        learn: {
          intro: '<p>Shapes can be joined to make new shapes, or split into smaller ones. Sketching helps.</p>',
          keyPoints: ['Two equal squares make a rectangle.', 'A diagonal splits a rectangle into two right-angled triangles.', 'Six equilateral triangles make a regular hexagon.'],
        },
        gen: sh_combine,
        levels: { 1: 'squares and rectangles', 2: 'triangles, rhombuses and trapeziums', 3: 'how many pieces' },
      },
      {
        id: 'y4-2d-tessellate',
        title: 'Tessellations',
        outcomes: ['MA2-2DS-02'],
        summary: 'Identify shapes that tessellate.',
        learn: {
          intro: '<p>A <b>tessellation</b> is a pattern of shapes that covers a surface with no gaps and no overlaps. Shapes can be reflected, translated or rotated to fit.</p>',
          keyPoints: ['Squares, rectangles, equilateral triangles and regular hexagons tessellate.', 'Circles and regular pentagons do not.'],
        },
        gen: sh_tessellate,
        levels: { 1: 'which shape tessellates', 2: 'which does not', 3: 'shapes meeting at a point' },
      },
    ],
  },
  {
    id: 'y4-3d-capacity',
    year: 4,
    title: '3D objects and capacity',
    strand: 'Measurement and space',
    outcomes: ['MA2-3DS-01', 'MA2-3DS-02'],
    blurb: 'Faces, edges and vertices of prisms and pyramids, and capacity in millilitres and litres.',
    colour: 190,
    skills: [
      {
        id: 'y4-3d-features',
        title: 'Faces, edges and vertices',
        outcomes: ['MA2-3DS-01'],
        summary: 'Count the faces, edges and vertices of prisms and pyramids.',
        learn: {
          intro: '<p>A <b>face</b> is a flat surface, an <b>edge</b> is where two faces meet, and a <b>vertex</b> is a corner where edges meet.</p>',
          keyPoints: ['A triangular prism has 5 faces, 9 edges and 6 vertices.', 'A square pyramid has 5 faces, 8 edges and 5 vertices.', 'A cylinder has 2 flat surfaces and 1 curved surface.'],
        },
        gen: td_features,
        levels: { 1: 'faces', 2: 'vertices', 3: 'edges; cylinders' },
      },
      {
        id: 'y4-3d-ml',
        title: 'Millilitres and litres',
        outcomes: ['MA2-3DS-02'],
        summary: 'Measure, convert and compare capacities in mL and L.',
        learn: {
          intro: '<p>A <b>millilitre</b> (mL) is a small unit of capacity. 1000 mL = 1 L. A cup holds about 250 mL.</p>',
          keyPoints: ['Read the scale at the top of the liquid.', '1 L 250 mL = 1250 mL'],
        },
        gen: td_ml,
        levels: { 1: 'benchmarks and 1 L = 1000 mL', 2: 'read a jug in mL', 3: 'problems and comparing' },
      },
    ],
  },
  {
    id: 'y4-mass-time',
    year: 4,
    title: 'Mass and time',
    strand: 'Measurement and space',
    outcomes: ['MA2-NSM-01', 'MA2-NSM-02'],
    blurb: 'Grams and kilograms on scales, seconds and digital time, and am and pm.',
    colour: 45,
    skills: [
      {
        id: 'y4-nsm-grams',
        title: 'Grams and kilograms',
        outcomes: ['MA2-NSM-01'],
        summary: 'Read scales and convert between grams and kilograms.',
        learn: {
          intro: '<p>Light things are measured in <b>grams</b> (g). 1000 g = 1 kg.</p>',
          keyPoints: ['Work out what each small mark on the scales is worth.', '2 kg 350 g = 2350 g'],
        },
        gen: nsm_grams,
        levels: { 1: 'grams or kilograms; 1 kg = 1000 g', 2: 'read scales in grams', 3: 'kilograms and grams' },
      },
      {
        id: 'y4-nsm-digital',
        title: 'Seconds and digital time',
        outcomes: ['MA2-NSM-02'],
        summary: 'Use seconds, read digital clocks and find the time to the next hour.',
        learn: {
          intro: '<p>On a digital clock the hour comes first, then the minutes: 7:38 is 38 minutes past 7. There are 60 seconds in a minute.</p>',
          keyPoints: ['Minutes to the next hour = 60 − minutes shown.', '2 min 15 s = 135 s'],
        },
        gen: nsm_digital,
        levels: { 1: 'seconds', 2: 'minutes to the next hour', 3: 'minutes and seconds' },
      },
      {
        id: 'y4-nsm-ampm',
        title: 'am and pm',
        outcomes: ['MA2-NSM-02'],
        summary: 'Write times with am and pm, and find durations across midday.',
        learn: {
          intro: '<p><b>am</b> times are from midnight to midday. <b>pm</b> times are from midday (noon) to midnight.</p>',
          keyPoints: ['7:15 am is in the morning; 7:15 pm is in the evening.', 'To find a duration across midday, count on to 12:00 first.'],
        },
        gen: nsm_ampm,
        levels: { 1: 'am or pm', 2: 'clock times with am or pm', 3: 'durations across midday' },
      },
    ],
  },
]
