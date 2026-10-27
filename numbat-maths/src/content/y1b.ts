// Year 1 (Stage 1, Part A) — Position and length; Shapes and area; 3D objects and capacity; Mass and time
import type { Level, Question, Topic } from '@/lib/maths/types'
import { D, D2, MINUS, chance, int, mcA, mcFixedA, names, numA, pick, q, sample, shuffle, timeA } from './helpers'
import * as D3 from '@/lib/maths/diagrams3'
import type { PatShape } from '@/lib/maths/diagrams3'
import { digital, plural, timeWords } from './s2'

const cap = (s: string) => s[0].toUpperCase() + s.slice(1)
const an = (w: string) => (/^[aeiou]/.test(w) ? 'an ' : 'a ') + w

// ------------------------------------------------------------------ Position and length (Geometric measure A)

const THINGS = ['cat', 'ball', 'book', 'cup', 'hat', 'drum', 'kite', 'shoe', 'bell', 'fish']

const gm_position = (level: Level): Question => {
  if (level === 3) {
    const items = shuffle(['Tree', 'Swing', 'Slide', 'Gate', 'Pond', 'Shed', 'Bench']).slice(0, 5)
    const cells = shuffle(Array.from({ length: 20 }, (_, i) => [(i % 5) + 1, Math.floor(i / 5) + 1] as [number, number])).slice(0, 5)
    const placed = items.map((label, i) => ({ col: cells[i][0], row: cells[i][1], label }))
    const pairsOk = placed.flatMap((a) => placed.filter((b) => b !== a && b.col !== a.col && b.row !== a.row && Math.abs(b.col - a.col) <= 3 && Math.abs(b.row - a.row) <= 2).map((b) => [a, b] as const))
    if (!pairsOk.length) return gm_position(level)
    const [a, b] = pick(pairsOk)
    const dx = b.col - a.col
    const dy = b.row - a.row
    return q({
      prompt: `Start at the ${a.label}. Go ${plural(Math.abs(dx), 'square')} ${dx > 0 ? 'right' : 'left'}, then ${plural(Math.abs(dy), 'square')} ${dy > 0 ? 'up' : 'down'}. Where are you?`,
      diagram: D2.gridMap(5, 4, placed),
      answer: mcA(b.label, sample(placed.filter((x) => x !== a && x !== b).map((x) => x.label), 3)),
      hint: 'Put your finger on the start. Move across first, then up or down.',
      steps: [`From the ${a.label}, go ${Math.abs(dx)} ${dx > 0 ? 'right' : 'left'} and ${Math.abs(dy)} ${dy > 0 ? 'up' : 'down'}.`, `You are at the ${b.label}.`],
    })
  }
  const row = sample(THINGS, 5)
  if (level === 1) {
    const i = int(1, 3)
    const left = chance()
    const ans = row[left ? i - 1 : i + 1]
    return q({
      prompt: `What is just to the ${left ? 'left' : 'right'} of the ${row[i]}?`,
      diagram: D3.objectRow(row),
      answer: mcA(ans, row.filter((x) => x !== ans && x !== row[i]).slice(0, 3)),
      hint: 'Find the left and right arrows under the shelf.',
      steps: [`The ${ans} is next to the ${row[i]}, on its ${left ? 'left' : 'right'}.`],
    })
  }
  if (chance()) {
    const i = int(0, 2)
    const ans = row[i + 1]
    return q({
      prompt: `What is between the ${row[i]} and the ${row[i + 2]}?`,
      diagram: D3.objectRow(row),
      answer: mcA(ans, row.filter((x) => x !== ans && x !== row[i] && x !== row[i + 2])),
      hint: '“Between” means in the middle of the two.',
      steps: [`The ${ans} is in the middle of the ${row[i]} and the ${row[i + 2]}.`],
    })
  }
  const i = int(0, 2)
  const ans = row[i + 2]
  return q({
    prompt: `What is 2 places to the right of the ${row[i]}?`,
    diagram: D3.objectRow(row),
    answer: mcA(ans, row.filter((x) => x !== ans && x !== row[i])),
    hint: 'Move one place right, then one more.',
    steps: [`One place right is the ${row[i + 1]}. Two places right is the ${ans}.`],
  })
}

const UNIT_NAMES = { paperclip: ['paperclip', 'paperclips'], block: ['block', 'blocks'], pencil: ['pencil', 'pencils'] } as const
const OBJS = ['crayon', 'ribbon', 'straw', 'snake', 'worm', 'rope']

const gm_informal = (level: Level): Question => {
  const kind = pick(['paperclip', 'block'] as const)
  const [one, many] = UNIT_NAMES[kind]
  const obj = pick(OBJS)
  if (level === 1) {
    const n = int(3, 9)
    return q({
      prompt: `How many ${many} long is the ${obj}?`,
      diagram: D3.measureUnits(n, kind, obj),
      answer: numA(n),
      suffix: many,
      hint: `Count the ${many} under the ${obj}, from one end to the other.`,
      steps: [`The ${obj} is ${n} ${many} long.`],
    })
  }
  if (level === 2) {
    const n = int(3, 8)
    const right = `${n} ${many} and a bit more`
    return q({
      prompt: `How long is the ${obj}?`,
      diagram: D3.measureUnits(n + 0.5, kind, obj),
      answer: mcFixedA([`${n - 1} ${many} and a bit more`, right, `${n + 1} ${many} and a bit more`], right),
      hint: `Count the whole ${many}. Is there a part of a ${one} left over?`,
      steps: [`${n} whole ${many} fit under the ${obj}.`, `A bit of the ${obj} is left over, so it is ${right}.`],
    })
  }
  if (chance()) {
    const thing = pick(['the table', 'the door', 'the mat', 'the bench'])
    const [p1, p2] = names(2)
    return q({
      prompt: `${p1} measures ${thing} with pencils. ${p2} measures ${thing} with paperclips. Who needs more units?`,
      answer: mcFixedA([p1, p2, 'They need the same number'], p2),
      hint: 'Smaller units are needed more times.',
      steps: ['A paperclip is shorter than a pencil.', `Shorter units are needed more times, so ${p2} needs more paperclips than ${p1} needs pencils.`],
    })
  }
  const a = int(6, 12)
  const b = int(2, a - 2)
  const x = pick(['rope', 'ribbon', 'path'])
  const y = pick(['string', 'stick', 'scarf'])
  return q({
    prompt: `The ${x} is ${a} ${many} long. The ${y} is ${b} ${many} long. How much longer is the ${x}?`,
    answer: numA(a - b),
    suffix: many,
    hint: `Find the difference between ${a} and ${b}.`,
    steps: [`${a} ${MINUS} ${b} = ${a - b}`],
  })
}

const gm_halves = (level: Level): Question => {
  if (level === 1) {
    const equal = chance()
    const widths = equal ? [1, 1] : pick([
      [1, 2],
      [2, 3],
      [3, 2],
      [2, 1],
    ])
    return q({
      prompt: 'Is this strip cut into halves?',
      diagram: D3.stripParts(widths),
      answer: mcFixedA(['Yes', 'No'], equal ? 'Yes' : 'No'),
      hint: 'Halves are 2 parts that are the same size.',
      steps: [equal ? 'The 2 parts are the same size, so they are halves.' : 'The 2 parts are not the same size, so they are not halves.'],
    })
  }
  if (level === 2) {
    const n = pick([2, 4])
    return q({
      prompt: 'The strip is cut into equal parts. What part is shaded?',
      diagram: D2.fractionStrip(n, 1),
      answer: mcFixedA(['a half', 'a quarter', 'a whole'], n === 2 ? 'a half' : 'a quarter'),
      hint: '2 equal parts are halves. 4 equal parts are quarters.',
      steps: [`The strip has ${n} equal parts, so each part is ${n === 2 ? 'a half' : 'a quarter'}.`],
    })
  }
  if (chance()) {
    const n = pick([2, 4])
    return q({
      prompt: `How many ${n === 2 ? 'halves' : 'quarters'} make a whole strip?`,
      answer: numA(n),
      hint: n === 2 ? 'Halves are 2 equal parts.' : 'Quarters are 4 equal parts.',
      steps: [`${n} ${n === 2 ? 'halves' : 'quarters'} make a whole.`],
    })
  }
  const equal = chance()
  const widths = equal ? [1, 1, 1, 1] : shuffle([1, 1, 2, 2])
  return q({
    prompt: 'Is this strip cut into quarters?',
    diagram: D3.stripParts(widths),
    answer: mcFixedA(['Yes', 'No'], equal ? 'Yes' : 'No'),
    hint: 'Quarters are 4 parts that are all the same size.',
    steps: [equal ? 'There are 4 parts and they are all the same size: quarters.' : 'There are 4 parts, but they are not all the same size, so they are not quarters.'],
  })
}

// ------------------------------------------------------------------ Shapes and area (Two-dimensional spatial structure A)

const SHAPE_NAMES: Record<number, string> = { 3: 'triangle', 4: 'quadrilateral', 5: 'pentagon', 6: 'hexagon', 8: 'octagon' }

/** Corner points of a convex polygon with n sides, not always regular, in any orientation. */
export function polyPoints(n: number, regular = false): [number, number][] {
  for (let tries = 0; tries < 50; tries++) {
    const turn = int(0, 359)
    const pts = Array.from({ length: n }, (_, i) => {
      const a = ((turn + (360 * i) / n + (regular ? 0 : int(-12, 12))) * Math.PI) / 180
      const r = regular ? 1 : 0.8 + int(0, 20) / 100
      return [r * Math.cos(a), r * Math.sin(a)] as [number, number]
    })
    // keep it convex with clear corners
    const ok = pts.every((p, i) => {
      const a = pts[(i - 1 + n) % n]
      const b = pts[(i + 1) % n]
      const cross = (p[0] - a[0]) * (b[1] - p[1]) - (p[1] - a[1]) * (b[0] - p[0])
      const la = Math.hypot(p[0] - a[0], p[1] - a[1])
      const lb = Math.hypot(b[0] - p[0], b[1] - p[1])
      return cross / (la * lb) > Math.sin((12 * Math.PI) / 180)
    })
    if (ok) return pts
  }
  return polyPoints(n, true)
}

const sh_shapes = (level: Level): Question => {
  const n = pick([3, 4, 5, 6, 8])
  const pts = polyPoints(n, chance(0.3))
  if (level === 1) {
    return q({
      prompt: 'What is the name of this shape?',
      diagram: D3.polygonShape(pts),
      answer: mcA(SHAPE_NAMES[n], sample(Object.values(SHAPE_NAMES).filter((x) => x !== SHAPE_NAMES[n]), 3)),
      hint: 'Count the sides. 3 sides: triangle. 4: quadrilateral. 5: pentagon. 6: hexagon. 8: octagon.',
      steps: [`The shape has ${n} sides, so it is ${an(SHAPE_NAMES[n])}.`],
    })
  }
  if (level === 2) {
    const sides = chance()
    return q({
      prompt: `How many ${sides ? 'sides' : 'vertices (corners)'} does this shape have?`,
      diagram: D3.polygonShape(pts),
      answer: numA(n),
      hint: sides ? 'Put your finger on one side and count around.' : 'Count the corners where two sides meet.',
      steps: [`The shape has ${n} ${sides ? 'sides' : 'vertices'}.`],
    })
  }
  const byVertices = chance()
  return q({
    prompt: `A shape has ${n} ${byVertices ? 'vertices' : 'sides'}. What is it called?`,
    answer: mcA(SHAPE_NAMES[n], sample(Object.values(SHAPE_NAMES).filter((x) => x !== SHAPE_NAMES[n]), 3)),
    hint: 'A shape has the same number of sides as vertices.',
    steps: [`A shape with ${n} ${byVertices ? 'vertices also has ' + n + ' sides' : 'sides'}. It is ${an(SHAPE_NAMES[n])}.`],
  })
}

const PAT: PatShape[] = ['circle', 'square', 'triangle', 'star', 'heart']

const sh_patterns = (level: Level): Question => {
  if (level === 3 && chance(0.4)) {
    const ask = pick([
      ['A shape slides across the page. Does its size change?', 'No, it stays the same size', ['Yes, it gets bigger', 'Yes, it gets smaller'], 'Sliding moves a shape. It does not change its size or shape.'],
      ['A triangle is flipped over (reflected). How many sides does it have now?', '3', ['2', '4'], 'Flipping does not change the shape, so it still has 3 sides.'],
      ['A square slides to the right. What shape is it now?', 'a square', ['a triangle', 'a circle'], 'Sliding does not change the shape.'],
    ] as [string, string, string[], string][])
    return q({ prompt: ask[0], answer: mcA(ask[1], ask[2]), hint: 'Slides and flips move a shape. They do not change it.', steps: [ask[3]] })
  }
  const unitLen = level === 1 ? 2 : 3
  const kinds = sample(PAT, level === 3 ? 3 : 2)
  const unit: PatShape[] = level === 1 ? [kinds[0], kinds[1]] : level === 2 ? (chance() ? [kinds[0], kinds[0], kinds[1]] : [kinds[0], kinds[1], kinds[1]]) : [kinds[0], kinds[1], kinds[2]]
  const total = unitLen * 2 + int(1, unitLen - 1)
  const items = Array.from({ length: total }, (_, i) => unit[i % unitLen])
  const next = unit[total % unitLen]
  return q({
    prompt: 'What shape comes next in the pattern?',
    diagram: D3.shapePattern(items),
    answer: mcFixedA([...new Set(unit)], next),
    hint: 'Find the part that repeats. Say the pattern out loud.',
    steps: [`The pattern repeats: ${unit.join(', ')}.`, `Next comes a ${next}.`],
  })
}

const sh_area = (level: Level): Question => {
  if (level === 3 && chance()) {
    return q({
      prompt: 'Big tiles and small tiles are used to cover the same table. Which needs more tiles?',
      answer: mcFixedA(['the big tiles', 'the small tiles', 'they need the same number'], 'the small tiles'),
      hint: 'Small tiles cover less each, so you need more of them.',
      steps: ['Each small tile covers less of the table.', 'So more small tiles are needed.'],
    })
  }
  const w = int(2, level === 1 ? 4 : 6)
  const h = int(2, level === 1 ? 3 : 4)
  const cells: [number, number][] = []
  for (let c = 0; c < w; c++) for (let r = 0; r < h; r++) cells.push([c + 1, r + 1])
  if (level === 3) {
    const w2 = int(2, 6)
    const h2 = int(2, 4)
    if (w * h === w2 * h2) return sh_area(level)
    const A = `Rug A: ${h} rows of ${w} tiles`
    const B = `Rug B: ${h2} rows of ${w2} tiles`
    return q({
      prompt: `Which rug is bigger?<p>${A}<br>${B}</p>`,
      answer: mcFixedA(['Rug A', 'Rug B'], w * h > w2 * h2 ? 'Rug A' : 'Rug B'),
      hint: 'Count the tiles each rug needs.',
      steps: [`Rug A: ${w * h} tiles. Rug B: ${w2 * h2} tiles.`, `Rug ${w * h > w2 * h2 ? 'A' : 'B'} needs more tiles, so it is bigger.`],
    })
  }
  return q({
    prompt: 'How many tiles cover the rug?',
    diagram: D2.cellGrid(w + 2, h + 2, cells),
    answer: numA(w * h),
    suffix: 'tiles',
    hint: level === 1 ? 'Count every shaded square.' : 'Count the tiles in one row, then count the rows.',
    steps: [`There ${h === 1 ? 'is 1 row' : `are ${h} rows`} of ${w} tiles.`, `${Array.from({ length: h }, () => w).join(' + ')} = ${w * h}`],
  })
}

// ------------------------------------------------------------------ 3D objects and capacity (Three-dimensional spatial structure A)

const OBJECTS3: { label: string; draw: () => string; rolls: boolean; faces: string }[] = [
  { label: 'cube', draw: () => D2.cubeStack(1, 1, 1), rolls: false, faces: 'It has 6 flat faces that are all squares.' },
  { label: 'sphere', draw: () => D3.sphere(), rolls: true, faces: 'It is round all over, with no flat faces.' },
  { label: 'cylinder', draw: () => D.cylinder(1, 1.4, '', ''), rolls: true, faces: 'It has 2 flat circle faces and a curved surface.' },
  { label: 'rectangular prism', draw: () => D.rectPrism(3, 1.6, 1.4, '', '', ''), rolls: false, faces: 'It has 6 flat faces that are rectangles.' },
]

const td_objects = (level: Level): Question => {
  if (level === 1) {
    const o = pick(OBJECTS3)
    return q({
      prompt: 'What is the name of this object?',
      diagram: o.draw(),
      answer: mcA(o.label, OBJECTS3.filter((x) => x !== o).map((x) => x.label)),
      hint: 'Look at its faces. Are they flat or curved?',
      steps: [`${o.faces} It is a ${o.label}.`],
    })
  }
  if (level === 2) {
    if (chance()) {
      const right = pick(['a ball', 'a box', 'a tin of food', 'a dice'])
      return q({
        prompt: 'Which one is a 3D object?',
        answer: mcA(right, ['a drawing of a circle', 'a drawing of a square', 'a drawing of a triangle']),
        hint: '3D objects are solid. You can pick them up. Flat drawings are 2D shapes.',
        steps: [`${cap(right)} is solid, so it is 3D. Drawings on paper are flat 2D shapes.`],
      })
    }
    const rolls = chance()
    const right = pick(OBJECTS3.filter((o) => o.rolls === rolls))
    return q({
      prompt: `Which object can ${rolls ? 'roll' : 'not roll'}?`,
      answer: mcA(right.label, OBJECTS3.filter((o) => o.rolls !== rolls).map((o) => o.label)),
      hint: 'Objects with a curved surface can roll.',
      steps: [`A ${right.label} ${rolls ? 'has a curved surface, so it can roll' : 'has only flat faces, so it cannot roll'}.`],
    })
  }
  const o = pick(OBJECTS3)
  const clue = { cube: 'I have 6 flat faces. They are all squares.', sphere: 'I have no flat faces. I am round all over.', cylinder: 'I have 2 flat faces that are circles, and one curved surface.', 'rectangular prism': 'I have 6 flat faces. They are rectangles, and they are not all squares.' }[o.label]!
  return q({
    prompt: `${clue} What am I?`,
    answer: mcA(o.label, OBJECTS3.filter((x) => x !== o).map((x) => x.label)),
    hint: 'Picture each object and check its faces.',
    steps: [`A ${o.label}: ${o.faces.toLowerCase()}`],
  })
}

const td_capacity = (level: Level): Question => {
  const a = int(4, 12)
  let b = int(3, 11)
  while (b === a) b = int(3, 11)
  const [x, y] = sample(['bucket', 'jug', 'bowl', 'pot', 'vase'], 2)
  if (level === 1) {
    return q({
      prompt: `The ${x} holds ${a} cups of water. The ${y} holds ${b} cups. Which holds more?`,
      answer: mcFixedA([`the ${x}`, `the ${y}`], a > b ? `the ${x}` : `the ${y}`),
      hint: 'More cups means it holds more.',
      steps: [`${Math.max(a, b)} cups is more than ${Math.min(a, b)} cups.`],
    })
  }
  if (level === 2) {
    const [big, small] = a > b ? [x, y] : [y, x]
    return q({
      prompt: `The ${x} holds ${a} cups of water. The ${y} holds ${b} cups. How many more cups does the ${big} hold than the ${small}?`,
      answer: numA(Math.abs(a - b)),
      suffix: 'cups',
      hint: 'Find the difference.',
      steps: [`${Math.max(a, b)} ${MINUS} ${Math.min(a, b)} = ${Math.abs(a - b)}`],
    })
  }
  if (chance()) {
    const l = int(2, 3)
    const w = int(1, 2)
    const h = int(1, 2)
    return q({
      prompt: 'Blocks are packed into a box with no gaps. How many blocks fill the box?',
      diagram: D2.cubeStack(l, w, h),
      answer: numA(l * w * h),
      suffix: 'blocks',
      hint: h > 1 ? 'Count the blocks on top, then count the layers.' : 'Count the blocks. Do not forget the ones at the back.',
      steps: h > 1 ? [`Top layer: ${l * w} blocks.`, `${h} layers: ${Array.from({ length: h }, () => l * w).join(' + ')} = ${l * w * h}`] : [`There are ${l * w} blocks.`],
    })
  }
  return q({
    prompt: 'A jug is filled using a big cup, then filled again using a small cup. Which cup is used more times?',
    answer: mcFixedA(['the big cup', 'the small cup', 'both the same'], 'the small cup'),
    hint: 'A small cup holds less each time.',
    steps: ['The small cup holds less, so it has to be filled more times.'],
  })
}

// ------------------------------------------------------------------ Mass and time (Non-spatial measure A)

const FRUIT = ['apple', 'banana', 'orange', 'pear', 'lemon', 'peach']

const nsm_balance = (level: Level): Question => {
  const [a, b] = sample(FRUIT, 2)
  if (level <= 2) {
    const tilt = pick([-1, 1] as const)
    const heavier = tilt === -1 ? a : b
    const lighter = tilt === -1 ? b : a
    const askHeavy = level === 1
    return q({
      prompt: `Which is ${askHeavy ? 'heavier' : 'lighter'}?`,
      diagram: D3.balance(a, b, tilt),
      answer: mcFixedA([`the ${a}`, `the ${b}`], `the ${askHeavy ? heavier : lighter}`),
      hint: 'The heavier side goes down. The lighter side goes up.',
      steps: [`The ${heavier} side is lower, so the ${heavier} is heavier and the ${lighter} is lighter.`],
    })
  }
  if (chance()) {
    return q({
      prompt: 'What does this balance show?',
      diagram: D3.balance(a, b, 0),
      answer: mcFixedA([`The ${a} is heavier`, `The ${b} is heavier`, 'They have the same mass'], 'They have the same mass'),
      hint: 'When a balance is level, both sides are the same.',
      steps: ['The balance is level, so the two have the same mass.'],
    })
  }
  const x = int(3, 9)
  let y = int(3, 9)
  while (y === x) y = int(3, 9)
  return q({
    prompt: `The ${a} balances ${x} blocks. The ${b} balances ${y} blocks. Which is heavier?`,
    answer: mcFixedA([`the ${a}`, `the ${b}`], x > y ? `the ${a}` : `the ${b}`),
    hint: 'More blocks means heavier.',
    steps: [`${Math.max(x, y)} blocks is more than ${Math.min(x, y)} blocks, so the ${x > y ? a : b} is heavier.`],
  })
}

const MONTHS = D3.MONTHS
const DAYS_IN = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

const nsm_months = (level: Level): Question => {
  if (level === 1) {
    const i = int(0, 11)
    const after = chance()
    const ans = MONTHS[(i + (after ? 1 : 11)) % 12]
    return q({
      prompt: `Which month comes ${after ? 'after' : 'before'} ${MONTHS[i]}?`,
      answer: mcA(ans, sample(MONTHS.filter((m) => m !== ans && m !== MONTHS[i]), 3)),
      hint: 'Say the months in order: January, February, March…',
      steps: [after ? `${MONTHS[i]}, then ${ans}.` : `${ans}, then ${MONTHS[i]}.`],
    })
  }
  if (level === 2) {
    if (chance(0.3))
      return q({ prompt: 'How many months are in a year?', answer: numA(12), hint: 'Count from January to December.', steps: ['There are 12 months in a year.'] })
    const k = int(1, 12)
    const ord = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth'][k - 1]
    return q({
      prompt: `Which month is the ${ord} month of the year?`,
      answer: mcA(MONTHS[k - 1], sample(MONTHS.filter((_, j) => j !== k - 1), 3)),
      hint: 'Count the months from January.',
      steps: [`${MONTHS.slice(0, k).join(', ')}: the ${ord} month is ${MONTHS[k - 1]}.`],
    })
  }
  if (chance()) {
    const i = pick([0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
    return q({
      prompt: `How many days are in ${MONTHS[i]}?`,
      answer: numA(DAYS_IN[i]),
      suffix: 'days',
      hint: '30 days has September, April, June and November. All the rest have 31, except February.',
      steps: [`${MONTHS[i]} has ${DAYS_IN[i]} days.`],
    })
  }
  const m = pick([0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
  const start = int(0, 6)
  const d = int(2, DAYS_IN[m])
  const dow = D3.DAYS[(start + d - 1) % 7]
  return q({
    prompt: `Look at the calendar. What day of the week is ${MONTHS[m]} ${d}?`,
    diagram: D3.calendar(MONTHS[m], start, DAYS_IN[m], d),
    answer: mcFixedA(D3.DAYS, dow),
    hint: 'Find the date, then look up to the top of its column.',
    steps: [`${MONTHS[m]} ${d} is in the ${dow.slice(0, 3)} column.`, `It is a ${dow}.`],
  })
}

const nsm_clock = (level: Level): Question => {
  const h = int(1, 12)
  if (level <= 2) {
    const m = level === 1 ? 0 : 30
    return q({
      prompt: 'What time does the clock show?',
      diagram: D2.clock(h, m),
      answer: timeA(h, m),
      hint: m === 0 ? 'The long hand points to 12. The short hand shows the hour.' : 'The long hand points to 6 for half past. The short hand is halfway to the next number.',
      steps: m === 0 ? [`The long hand points to 12 and the short hand points to ${h}.`, `It is ${timeWords(h, 0)}: ${digital(h, 0)}.`] : [`The long hand points to 6: half past.`, `The short hand is halfway between ${h} and ${(h % 12) + 1}, so it is ${timeWords(h, 30)}: ${digital(h, 30)}.`],
    })
  }
  const m = pick([0, 30])
  const right = timeWords(h, m)
  const wrongs = [timeWords(h, m === 0 ? 30 : 0), timeWords((h % 12) + 1, m), timeWords(h === 1 ? 12 : h - 1, m === 0 ? 30 : 0)]
  return q({
    prompt: `Which words match the time ${digital(h, m)}?`,
    answer: mcA(right, [...new Set(wrongs)].filter((w) => w !== right)),
    hint: ':00 means o’clock. :30 means half past.',
    steps: [`${digital(h, m)} is ${right}.`],
  })
}

// ------------------------------------------------------------------ topics

export const Y1B: Topic[] = [
  {
    id: 'y1-position-length',
    year: 1,
    title: 'Position and length',
    strand: 'Measurement and space',
    outcomes: ['MA1-GM-01', 'MA1-GM-02', 'MA1-GM-03'],
    blurb: 'Left and right, following paths, measuring with paperclips and blocks, and halves and quarters of lengths.',
    colour: 140,
    skills: [
      {
        id: 'y1-gm-position',
        title: 'Left, right and paths',
        outcomes: ['MA1-GM-01'],
        summary: 'Describe where things are and follow a path.',
        learn: {
          intro: '<p>Words like <b>left</b>, <b>right</b> and <b>between</b> tell us where things are.</p>',
          keyPoints: ['Between means in the middle of two things.', 'Follow a path one step at a time.'],
        },
        gen: gm_position,
        levels: { 1: 'left and right', 2: 'between; two places along', 3: 'follow a path on a map' },
      },
      {
        id: 'y1-gm-informal',
        title: 'Measuring with units',
        outcomes: ['MA1-GM-02'],
        summary: 'Measure lengths with paperclips and blocks placed end to end.',
        learn: {
          intro: '<p>To measure, put units end to end with no gaps and no overlaps, then count them.</p>',
          keyPoints: ['Say the unit: “6 blocks long”.', 'Smaller units are needed more times.'],
        },
        gen: gm_informal,
        levels: { 1: 'count the units', 2: 'a bit more left over', 3: 'compare lengths; unit size' },
      },
      {
        id: 'y1-gm-halves',
        title: 'Halves and quarters of a length',
        outcomes: ['MA1-GM-03'],
        summary: 'Recognise when a length is cut into halves or quarters.',
        learn: {
          intro: '<p>Halves are 2 equal parts. Quarters are 4 equal parts.</p>',
          keyPoints: ['The parts must be the same size.', '2 halves make a whole. 4 quarters make a whole.'],
        },
        gen: gm_halves,
        levels: { 1: 'halves or not', 2: 'half or quarter', 3: 'quarters or not' },
      },
    ],
  },
  {
    id: 'y1-shapes-area',
    year: 1,
    title: 'Shapes and area',
    strand: 'Measurement and space',
    outcomes: ['MA1-2DS-01', 'MA1-2DS-02'],
    blurb: 'Naming shapes by their sides, shape patterns, slides and flips, and covering with tiles.',
    colour: 320,
    skills: [
      {
        id: 'y1-2d-shapes',
        title: 'Naming shapes',
        outcomes: ['MA1-2DS-01'],
        summary: 'Name triangles, quadrilaterals, pentagons, hexagons and octagons.',
        learn: {
          intro: '<p>Shapes are named by how many sides they have. A shape has the same number of <b>vertices</b> (corners) as sides.</p>',
          keyPoints: ['3 sides: triangle', '4 sides: quadrilateral', '5 sides: pentagon', '6 sides: hexagon', '8 sides: octagon'],
        },
        gen: sh_shapes,
        levels: { 1: 'name the shape', 2: 'count sides or vertices', 3: 'name it from a clue' },
      },
      {
        id: 'y1-2d-patterns',
        title: 'Patterns, slides and flips',
        outcomes: ['MA1-2DS-01'],
        summary: 'Continue repeating shape patterns and describe slides and flips.',
        learn: {
          intro: '<p>A repeating pattern has a part that repeats again and again: circle, square, circle, square…</p>',
          keyPoints: ['Find the part that repeats.', 'Sliding or flipping a shape does not change its size.'],
        },
        gen: sh_patterns,
        levels: { 1: 'two-shape patterns', 2: 'patterns like AAB', 3: 'three-shape patterns; slides and flips' },
      },
      {
        id: 'y1-2d-area',
        title: 'Covering with tiles',
        outcomes: ['MA1-2DS-02'],
        summary: 'Measure area by counting tiles with no gaps or overlaps.',
        learn: {
          intro: '<p><b>Area</b> is how much surface something covers. We can measure it by counting tiles that cover it with no gaps.</p>',
          keyPoints: ['Count rows of tiles to help.', 'Smaller tiles are needed more times.'],
        },
        gen: sh_area,
        levels: { 1: 'count tiles', 2: 'rows of tiles', 3: 'compare areas; tile size' },
      },
    ],
  },
  {
    id: 'y1-3d-capacity',
    year: 1,
    title: '3D objects and capacity',
    strand: 'Measurement and space',
    outcomes: ['MA1-3DS-01', 'MA1-3DS-02'],
    blurb: 'Cubes, spheres, cylinders and rectangular prisms, and comparing how much containers hold.',
    colour: 190,
    skills: [
      {
        id: 'y1-3d-objects',
        title: '3D objects',
        outcomes: ['MA1-3DS-01'],
        summary: 'Name and describe cubes, spheres, cylinders and rectangular prisms.',
        learn: {
          intro: '<p>3D objects are solid. Their flat surfaces are called <b>faces</b>.</p>',
          keyPoints: ['Cube: 6 square faces.', 'Sphere: round all over.', 'Cylinder: 2 circle faces and a curved surface.', 'Rectangular prism: 6 rectangle faces.'],
        },
        gen: td_objects,
        levels: { 1: 'name the object', 2: '2D or 3D; which rolls', 3: 'what am I?' },
      },
      {
        id: 'y1-3d-capacity',
        title: 'How much does it hold?',
        outcomes: ['MA1-3DS-02'],
        summary: 'Compare containers using cups, and pack blocks into boxes.',
        learn: {
          intro: '<p>We can find how much a container holds by counting how many cups of water fill it.</p>',
          keyPoints: ['More cups means it holds more.', 'Pack blocks with no gaps to measure a box.'],
        },
        gen: td_capacity,
        levels: { 1: 'which holds more', 2: 'how many more cups', 3: 'packing blocks; cup size' },
      },
    ],
  },
  {
    id: 'y1-mass-time',
    year: 1,
    title: 'Mass and time',
    strand: 'Measurement and space',
    outcomes: ['MA1-NSM-01', 'MA1-NSM-02'],
    blurb: 'Using a balance, months of the year and calendars, and o’clock and half past.',
    colour: 45,
    skills: [
      {
        id: 'y1-nsm-balance',
        title: 'Heavier and lighter',
        outcomes: ['MA1-NSM-01'],
        summary: 'Use an equal-arm balance to compare masses.',
        learn: {
          intro: '<p>On a balance, the heavier side goes down. If both sides are level, they have the same mass.</p>',
          keyPoints: ['Down: heavier. Up: lighter.', 'Level: the same mass.'],
        },
        gen: nsm_balance,
        levels: { 1: 'which is heavier', 2: 'which is lighter', 3: 'level balances; blocks' },
      },
      {
        id: 'y1-nsm-months',
        title: 'Months and calendars',
        outcomes: ['MA1-NSM-02'],
        summary: 'Order the months, know how many days they have, and read a calendar.',
        learn: {
          intro: '<p>There are 12 months in a year, from January to December.</p>',
          keyPoints: ['30 days: April, June, September, November.', 'February has 28 days (29 in a leap year).', 'All the others have 31.'],
        },
        gen: nsm_months,
        levels: { 1: 'next and before', 2: 'order of the months', 3: 'days in a month; reading a calendar' },
      },
      {
        id: 'y1-nsm-clock',
        title: 'O’clock and half past',
        outcomes: ['MA1-NSM-02'],
        summary: 'Read clocks to the hour and half-hour.',
        learn: {
          intro: '<p>At o’clock, the long hand points to 12. At half past, the long hand points to 6 and the short hand is halfway between two numbers.</p>',
          keyPoints: ['3 o’clock is 3:00.', 'Half past 3 is 3:30.'],
        },
        gen: nsm_clock,
        levels: { 1: 'o’clock', 2: 'half past', 3: 'match words and times' },
      },
    ],
  },
]
