// Year 2 (Stage 1, Part B) — Maps and length; Shapes, turns and area; 3D objects and volume; Mass and time
import type { Level, Question, Topic } from '@/lib/maths/types'
import { D, D2, MINUS, chance, int, mcA, mcFixedA, numA, pick, q, sample, shuffle, timeA } from './helpers'
import * as D3 from '@/lib/maths/diagrams3'
import { digital, plural, timeWords } from './s2'

const cap = (s: string) => s[0].toUpperCase() + s.slice(1)

// ------------------------------------------------------------------ Maps and length (Geometric measure B)

const PLACES = ['School', 'Park', 'Shop', 'Pool', 'Library', 'Farm', 'Beach', 'Zoo']

function town() {
  const cells = shuffle(Array.from({ length: 30 }, (_, i) => [(i % 6) + 1, Math.floor(i / 6) + 1] as [number, number])).slice(0, 7)
  const labels = shuffle(PLACES).slice(0, 7)
  return cells.map(([col, row], i) => ({ col, row, label: labels[i] }))
}

const gm_maps = (level: Level): Question => {
  const items = town()
  const map = D2.gridMap(6, 5, items)
  const at = (c: number, r: number) => items.find((x) => x.col === c && x.row === r)
  if (level === 1) {
    const rels = [
      ['directly above', 0, 1],
      ['directly below', 0, -1],
      ['just to the left of', -1, 0],
      ['just to the right of', 1, 0],
    ] as const
    const options = items.flatMap((a) => rels.filter(([, dx, dy]) => at(a.col + dx, a.row + dy)).map((r) => [a, r] as const))
    if (!options.length) return gm_maps(level)
    const [a, [word, dx, dy]] = pick(options)
    const b = at(a.col + dx, a.row + dy)!
    return q({
      prompt: `Look at the map. What is ${word} the ${a.label}?`,
      diagram: map,
      answer: mcA(b.label, sample(items.filter((x) => x !== a && x !== b).map((x) => x.label), 3)),
      hint: 'Find the starting place first, then look next to it.',
      steps: [`The ${b.label} is ${word} the ${a.label}.`],
    })
  }
  const pairs = items.flatMap((a) => items.filter((b) => b !== a && b.col !== a.col && b.row !== a.row).map((b) => [a, b] as const))
  const [a, b] = pick(pairs)
  const dx = b.col - a.col
  const dy = b.row - a.row
  const desc = (x: number, y: number) => `${plural(Math.abs(x), 'square')} ${x > 0 ? 'right' : 'left'}, then ${plural(Math.abs(y), 'square')} ${y > 0 ? 'up' : 'down'}`
  if (level === 2) {
    return q({
      prompt: `Start at the ${a.label}. Go ${desc(dx, dy)}. Where are you?`,
      diagram: map,
      answer: mcA(b.label, sample(items.filter((x) => x !== a && x !== b).map((x) => x.label), 3)),
      hint: 'Move across first, then up or down.',
      steps: [`From the ${a.label}, ${desc(dx, dy)} reaches the ${b.label}.`],
    })
  }
  const right = desc(dx, dy)
  const wrongs = [...new Set([desc(-dx, dy), desc(dx, -dy), desc(-dx, -dy), desc(dy === 0 ? 1 : dy, dx === 0 ? 1 : dx)])].filter((w) => w !== right)
  return q({
    prompt: `Which path goes from the ${a.label} to the ${b.label}?`,
    diagram: map,
    answer: mcA(right, wrongs.slice(0, 3)),
    hint: 'Is the second place to the left or right? Is it up or down?',
    steps: [`The ${b.label} is ${plural(Math.abs(dx), 'square')} ${dx > 0 ? 'right' : 'left'} and ${plural(Math.abs(dy), 'square')} ${dy > 0 ? 'up' : 'down'} from the ${a.label}.`],
  })
}

const gm_cm = (level: Level): Question => {
  if (level === 1) {
    const n = int(3, 11)
    const obj = pick(['pencil', 'crayon', 'straw', 'ribbon'])
    return q({
      prompt: `How long is the ${obj}?`,
      diagram: D2.ruler(12, 0, n * 10),
      answer: numA(n),
      suffix: 'cm',
      hint: 'The end of the object lines up with a number on the ruler.',
      steps: [`The ${obj} starts at 0 and ends at ${n}.`, `It is ${n} cm long.`],
    })
  }
  if (level === 2) {
    const kind = pick(['m-cm', 'unit', 'estimate'])
    if (kind === 'm-cm')
      return q({ prompt: 'How many centimetres are in 1 metre?', answer: numA(100), suffix: 'cm', hint: 'Centi means one hundredth.', steps: ['1 metre = 100 centimetres.'] })
    if (kind === 'unit') {
      const [thing, unit] = pick([
        ['the length of the playground', 'metres'],
        ['the length of a pencil', 'centimetres'],
        ['the height of a door', 'metres'],
        ['the length of your hand', 'centimetres'],
        ['the width of a book', 'centimetres'],
        ['the length of a swimming pool', 'metres'],
      ])
      return q({
        prompt: `Which unit would you use to measure ${thing}?`,
        answer: mcFixedA(['centimetres', 'metres'], unit),
        hint: 'Use metres for long things and centimetres for short things.',
        steps: [`${cap(thing)} is best measured in ${unit}.`],
      })
    }
    const [thing, right, wrongs] = pick([
      ['a pencil', '15 cm', ['15 m', '1 cm']],
      ['a door', '2 m', ['2 cm', '20 m']],
      ['a paperclip', '3 cm', ['3 m', '30 cm']],
      ['a classroom', '9 m', ['9 cm', '90 m']],
    ] as [string, string, string[]][])
    return q({
      prompt: `About how long (or tall) is ${thing}?`,
      answer: mcA(right, wrongs),
      hint: 'A metre is about one big step. A centimetre is about the width of your finger.',
      steps: [`${cap(thing)} is about ${right}.`],
    })
  }
  const a = int(12, 45)
  const b = int(a + 4, 70)
  const [x, y] = sample(['ribbon', 'string', 'scarf', 'snake', 'belt'], 2)
  return q({
    prompt: `The ${x} is ${a} cm long. The ${y} is ${b} cm long. How much longer is the ${y}?`,
    answer: numA(b - a),
    suffix: 'cm',
    hint: 'Find the difference.',
    steps: [`${b} ${MINUS} ${a} = ${b - a}`],
  })
}

const gm_informal = (level: Level): Question => {
  if (level === 1) {
    const n = int(2, 5)
    const obj = pick(['bench', 'rope', 'table', 'mat'])
    return q({
      prompt: `How many pencils long is the ${obj}?`,
      diagram: D3.measureUnits(n, 'pencil', obj),
      answer: numA(n),
      suffix: 'pencils',
      hint: 'Count the pencils from one end to the other.',
      steps: [`The ${obj} is ${n} pencils long.`],
    })
  }
  if (level === 2) {
    const objs = sample(['rope', 'ribbon', 'snake', 'scarf'], 3)
    const lens = sample([4, 5, 6, 7, 8, 9, 10, 11], 3)
    const longest = chance()
    const v = longest ? Math.max(...lens) : Math.min(...lens)
    return q({
      prompt: `Each was measured in blocks. Which is the ${longest ? 'longest' : 'shortest'}?<p>${objs.map((o, i) => `${cap(o)}: ${lens[i]} blocks`).join('<br>')}</p>`,
      answer: mcFixedA(objs.map(cap), cap(objs[lens.indexOf(v)])),
      hint: `They all use the same unit, so the ${longest ? 'most' : 'fewest'} blocks is the ${longest ? 'longest' : 'shortest'}.`,
      steps: [`${cap(objs[lens.indexOf(v)])} has the ${longest ? 'most' : 'fewest'} blocks (${v}).`],
    })
  }
  if (chance()) {
    const p = int(3, 7)
    return q({
      prompt: `A desk is ${p} pencils long. It is also ${2 * p} paperclips long. Which unit is longer?`,
      answer: mcFixedA(['the pencil', 'the paperclip', 'they are the same'], 'the pencil'),
      hint: 'A longer unit is needed fewer times.',
      steps: [`Only ${p} pencils are needed but ${2 * p} paperclips, so a pencil is longer.`],
    })
  }
  return q({
    prompt: 'Mia and her dad both measure the room in hand spans. They get different answers. Why?',
    answer: mcA('Their hands are different sizes', ['The room changed size', 'They counted the same', 'Hand spans are always the same size']),
    hint: 'Think about the unit they used.',
    steps: ['Different people have different-sized hands. That is why we use standard units like metres.'],
  })
}

const gm_eighths = (level: Level): Question => {
  if (level === 1) {
    const ask = pick([
      ['How many eighths make a whole?', 8, 'A whole cut into 8 equal parts makes eighths: 8 eighths.'],
      ['How many quarters make a half?', 2, '2 quarters are the same length as a half.'],
      ['How many eighths make a quarter?', 2, 'Halve a quarter to get 2 eighths.'],
    ] as [string, number, string][])
    return q({ prompt: ask[0], answer: numA(ask[1]), hint: 'Picture a strip being halved again and again.', steps: [ask[2]] })
  }
  if (level === 2) {
    const equal = chance()
    const widths = equal ? Array(8).fill(1) : shuffle([1, 1, 1, 1, 1, 1, 2, 2])
    return q({
      prompt: 'Is this strip cut into eighths?',
      diagram: D3.stripParts(widths),
      answer: mcFixedA(['Yes', 'No'], equal ? 'Yes' : 'No'),
      hint: 'Eighths are 8 parts that are all the same size.',
      steps: [equal ? 'There are 8 equal parts, so they are eighths.' : 'The parts are not all the same size, so they are not eighths.'],
    })
  }
  if (chance()) {
    const k = int(1, 7)
    return q({
      prompt: 'The strip is cut into eighths. How many eighths are shaded?',
      diagram: D2.fractionStrip(8, k),
      answer: numA(k),
      suffix: k === 1 ? 'eighth' : 'eighths',
      hint: 'Count the shaded parts.',
      steps: [`${plural(k, 'part')} of 8 ${k === 1 ? 'is' : 'are'} shaded: ${plural(k, 'eighth')}.`],
    })
  }
  const ask = pick([
    ['When you halve a quarter, what do you get?', 'an eighth', ['a half', 'a whole', 'a quarter'], 'Half of a quarter is an eighth.'],
    ['4 eighths are the same as…', 'a half', ['a quarter', 'a whole', 'an eighth'], '4 of the 8 equal parts is half the strip.'],
    ['2 eighths are the same as…', 'a quarter', ['a half', 'a whole', 'an eighth'], '2 eighths make a quarter.'],
  ] as [string, string, string[], string][])
  return q({ prompt: ask[0], answer: mcA(ask[1], ask[2]), hint: 'Halve a whole: halves. Halve again: quarters. Halve again: eighths.', steps: [ask[3]] })
}

// ------------------------------------------------------------------ Shapes, turns and area (Two-dimensional spatial structure B)

const DIRS = ['up', 'right', 'down', 'left']

const sh_turns = (level: Level): Question => {
  if (level === 3 && chance(0.4)) {
    const [from, to, turn] = pick([
      [12, 6, 'a half turn'],
      [12, 3, 'a quarter turn'],
      [3, 6, 'a quarter turn'],
      [6, 12, 'a half turn'],
      [12, 12, 'a full turn'],
    ] as [number, number, string][])
    return q({
      prompt: from === to ? 'The minute hand goes all the way around, from 12 back to 12. What turn is that?' : `The minute hand moves clockwise from ${from} to ${to}. What turn is that?`,
      answer: mcFixedA(['a quarter turn', 'a half turn', 'a full turn'], turn),
      hint: 'From 12 to 3 is a quarter turn. From 12 to 6 is a half turn.',
      steps: [`It is ${turn}.`],
    })
  }
  const d = int(0, 3) as 0 | 1 | 2 | 3
  const k = level === 1 ? pick([1, 2]) : level === 2 ? 1 : pick([3, 4])
  const cw = level === 2 ? false : level === 1 ? true : chance()
  const end = (d + (cw ? k : 4 - (k % 4))) % 4
  const turn = ['', 'a quarter turn', 'a half turn', 'three quarter turns', 'a full turn'][k]
  return q({
    prompt: `The arrow points ${DIRS[d]}. It makes ${turn}${k === 2 || k === 4 ? '' : cw ? ' clockwise' : ' anticlockwise'}. Which way does it point now?`,
    diagram: D3.arrow(d),
    answer: mcFixedA(DIRS, DIRS[end]),
    hint: 'Clockwise goes the way clock hands go: up, right, down, left.',
    steps: [k === 4 ? 'A full turn goes all the way around, back to the start.' : `Turning ${cw ? 'clockwise' : 'anticlockwise'} from ${DIRS[d]}: ${Array.from({ length: k + 1 }, (_, i) => DIRS[(d + (cw ? i : 4 - i)) % 4]).join(' → ')}.`, `It points ${DIRS[end]}.`],
  })
}

const sh_combine = (level: Level): Question => {
  if (level === 1) {
    const it = pick([
      ['Two squares the same size are put side by side. What shape do they make?', 'a rectangle', ['a triangle', 'a circle', 'a hexagon'], 'Two squares side by side make a rectangle.'],
      ['A square is cut from corner to corner. What two shapes are made?', 'two triangles', ['two squares', 'two circles', 'two rectangles'], 'The cut makes two triangles.'],
    ] as [string, string, string[], string][])
    return q({ prompt: it[0], answer: mcA(it[1], it[2]), hint: 'Draw it to check.', steps: [it[3]] })
  }
  if (level === 2) {
    const it = pick([
      ['Four small squares are put together, 2 across and 2 down. What shape do they make?', 'a bigger square', ['a triangle', 'a long rectangle', 'a pentagon'], 'A 2 by 2 block of squares is a bigger square.'],
      ['Six triangles meet in the middle with no gaps. What shape can they make?', 'a hexagon', ['a square', 'a circle', 'a pentagon'], 'Six triangles around a point can make a hexagon.'],
    ] as [string, string, string[], string][])
    return q({ prompt: it[0], answer: mcA(it[1], it[2]), hint: 'Picture the pieces fitting together.', steps: [it[3]] })
  }
  const it = pick([
    ['A square is cut along both lines from corner to corner. How many triangles are made?', 4, 'The two cuts cross in the middle and make 4 triangles.'],
    ['How many small squares make a big square that is 3 small squares across and 3 down?', 9, '3 rows of 3 squares: 3 + 3 + 3 = 9.'],
    ['How many triangles are in a hexagon cut from the middle to each corner?', 6, 'A hexagon has 6 corners, so there are 6 triangles.'],
  ] as [string, number, string][])
  return q({ prompt: it[0], answer: numA(it[1]), hint: 'Draw a sketch and count.', steps: [it[2]] })
}

const sh_area = (level: Level): Question => {
  const r = int(2, 5)
  const c = int(3, 6)
  if (level === 1) {
    const cells: [number, number][] = []
    for (let i = 0; i < c; i++) for (let j = 0; j < r; j++) cells.push([i + 1, j + 1])
    return q({
      prompt: 'Square tiles cover the mat in rows. How many tiles are there?',
      diagram: D2.cellGrid(c + 2, r + 2, cells),
      answer: numA(r * c),
      suffix: 'tiles',
      hint: 'Count one row, then add a row at a time.',
      steps: [`${plural(r, 'row')} of ${c}: ${Array.from({ length: r }, () => c).join(' + ')} = ${r * c}`],
    })
  }
  if (level === 2) {
    return q({
      prompt: `A path is covered with ${r} rows of square tiles. There are ${c} tiles in each row. How many tiles is that?`,
      answer: numA(r * c),
      suffix: 'tiles',
      hint: `Add ${c} for each row.`,
      steps: [`${Array.from({ length: r }, () => c).join(' + ')} = ${r * c}`],
    })
  }
  const r2 = int(2, 5)
  const c2 = int(3, 6)
  if (r * c === r2 * c2) return sh_area(level)
  const [bigN, smallN] = r * c > r2 * c2 ? ['the red mat', 'the blue mat'] : ['the blue mat', 'the red mat']
  return q({
    prompt: `The red mat is covered by ${r} rows of ${c} tiles. The blue mat is covered by ${r2} rows of ${c2} tiles. How many more tiles does ${bigN} need than ${smallN}?`,
    answer: numA(Math.abs(r * c - r2 * c2)),
    suffix: 'tiles',
    hint: 'Find each total, then the difference.',
    steps: [`Red: ${r * c} tiles. Blue: ${r2 * c2} tiles.`, `${Math.max(r * c, r2 * c2)} ${MINUS} ${Math.min(r * c, r2 * c2)} = ${Math.abs(r * c - r2 * c2)}`],
  })
}

// ------------------------------------------------------------------ 3D objects and volume (Three-dimensional spatial structure B)

const PRISMS = [
  { label: 'cube', draw: () => D.rectPrism(2, 2, 2, '', '', ''), faces: 6, edges: 12, vertices: 8, faceShape: 'squares' },
  { label: 'rectangular prism', draw: () => D.rectPrism(3, 1.6, 1.4, '', '', ''), faces: 6, edges: 12, vertices: 8, faceShape: 'rectangles' },
  { label: 'triangular prism', draw: () => D2.solid('prism', 3), faces: 5, edges: 9, vertices: 6, faceShape: '2 triangles and 3 rectangles' },
]

const td_faces = (level: Level): Question => {
  if (level === 1) {
    const it = pick([
      ['What shape is each face of a cube?', 'a square', ['a circle', 'a triangle', 'a pentagon']],
      ['What shape are the two flat ends of a cylinder?', 'circles', ['squares', 'triangles', 'rectangles']],
      ['What shape are the two ends of a triangular prism?', 'triangles', ['circles', 'squares', 'hexagons']],
    ] as [string, string, string[]][])
    return q({ prompt: it[0], answer: mcA(it[1], it[2]), hint: 'Picture the flat surfaces of the object.', steps: [`${cap(it[1])}.`] })
  }
  const p = pick(PRISMS)
  const what = level === 2 ? 'faces' : pick(['edges', 'vertices'] as const)
  return q({
    prompt: `This is a ${p.label}. How many ${what} does it have? (Dashed lines show the edges you cannot see.)`,
    diagram: p.draw(),
    answer: numA(p[what]),
    hint: { faces: 'Faces are the flat surfaces. Count the hidden ones too.', edges: 'Edges are where two faces meet. Count top, bottom and sides.', vertices: 'Vertices are the corners. Count the top corners and the bottom corners.' }[what],
    steps: [what === 'faces' ? `A ${p.label} has ${p.faces} faces: ${p.faceShape}.` : `A ${p.label} has ${p[what]} ${what}.`],
  })
}

const td_volume = (level: Level): Question => {
  if (level <= 2) {
    const l = int(2, 4)
    const w = level === 1 ? 1 : int(1, 2)
    const h = level === 1 ? 1 : 2
    return q({
      prompt: 'How many blocks were used to make this model?',
      diagram: D2.cubeStack(l, w, h),
      answer: numA(l * w * h),
      suffix: 'blocks',
      hint: h > 1 ? 'Count the top layer, then double it for 2 layers.' : 'Count the blocks, including any at the back.',
      steps: h > 1 ? [`Top layer: ${l * w} blocks.`, `2 layers: ${l * w} + ${l * w} = ${2 * l * w}`] : [`There are ${l * w} blocks.`],
    })
  }
  if (chance()) {
    const n = pick([6, 8, 10, 12])
    const r = 2
    return q({
      prompt: `Model A is ${r} rows of ${n / r} blocks. Model B is 1 long row of ${n} blocks. Which model has more blocks?`,
      answer: mcFixedA(['Model A', 'Model B', 'They have the same number'], 'They have the same number'),
      hint: 'Count the blocks in each model.',
      steps: [`Model A: ${n / r} + ${n / r} = ${n} blocks. Model B: ${n} blocks.`, 'They look different but use the same number of blocks.'],
    })
  }
  const caps = sample([5, 6, 7, 8, 9, 10, 11], 3)
  const names = ['Jug A', 'Jug B', 'Jug C']
  const most = chance()
  const v = most ? Math.max(...caps) : Math.min(...caps)
  return q({
    prompt: `Jug A holds ${caps[0]} cups. Jug B holds ${caps[1]} cups. Jug C holds ${caps[2]} cups. Which jug holds the ${most ? 'most' : 'least'}?`,
    answer: mcFixedA(names, names[caps.indexOf(v)]),
    hint: `The ${most ? 'most' : 'fewest'} cups means it holds the ${most ? 'most' : 'least'}.`,
    steps: [`${names[caps.indexOf(v)]} holds ${v} cups, the ${most ? 'most' : 'least'}.`],
  })
}

// ------------------------------------------------------------------ Mass and time (Non-spatial measure B)

const nsm_mass = (level: Level): Question => {
  const [a, b] = sample(['apple', 'pear', 'orange', 'potato', 'onion', 'lemon'], 2)
  if (level === 1) {
    const x = int(4, 12)
    let y = int(4, 12)
    while (y === x) y = int(4, 12)
    return q({
      prompt: `The ${a} balances ${x} blocks. The ${b} balances ${y} blocks. How many more blocks does the ${x > y ? a : b} need than the ${x > y ? b : a}?`,
      answer: numA(Math.abs(x - y)),
      suffix: 'blocks',
      hint: 'Find the difference.',
      steps: [`${Math.max(x, y)} ${MINUS} ${Math.min(x, y)} = ${Math.abs(x - y)}`],
    })
  }
  if (level === 2) {
    if (chance()) {
      return q({
        prompt: `The ${a} is balanced with big blocks. Then it is balanced with small blocks. Which needs more blocks?`,
        answer: mcFixedA(['the big blocks', 'the small blocks', 'the same number'], 'the small blocks'),
        hint: 'Small blocks are lighter, so you need more of them.',
        steps: ['Each small block is lighter, so more of them are needed to balance.'],
      })
    }
    return q({
      prompt: 'A ball of playdough is squashed flat. Does its mass change?',
      answer: mcFixedA(['No, it has the same mass', 'Yes, it is heavier', 'Yes, it is lighter'], 'No, it has the same mass'),
      hint: 'Nothing was added or taken away.',
      steps: ['Changing the shape does not change the mass.'],
    })
  }
  const things = sample(['apple', 'pear', 'orange', 'potato', 'onion'], 3)
  const ms = sample([5, 6, 7, 8, 9, 10, 11, 12], 3)
  const heavy = chance()
  const v = heavy ? Math.max(...ms) : Math.min(...ms)
  return q({
    prompt: `Each was balanced with blocks. Which is the ${heavy ? 'heaviest' : 'lightest'}?<p>${things.map((t, i) => `${cap(t)}: ${ms[i]} blocks`).join('<br>')}</p>`,
    answer: mcFixedA(things.map(cap), cap(things[ms.indexOf(v)])),
    hint: `${heavy ? 'More' : 'Fewer'} blocks means ${heavy ? 'heavier' : 'lighter'}.`,
    steps: [`${cap(things[ms.indexOf(v)])} needs the ${heavy ? 'most' : 'fewest'} blocks (${v}).`],
  })
}

const nsm_clock = (level: Level): Question => {
  const h = int(1, 12)
  if (level <= 2) {
    const m = level === 1 ? 15 : 45
    return q({
      prompt: 'What time does the clock show?',
      diagram: D2.clock(h, m),
      answer: timeA(h, m),
      hint: m === 15 ? 'The long hand on 3 means quarter past.' : 'The long hand on 9 means quarter to the next hour.',
      steps: m === 15 ? [`The long hand points to 3: 15 minutes past.`, `The short hand is just past ${h}.`, `It is ${timeWords(h, 15)}: ${digital(h, 15)}.`] : [`The long hand points to 9: 45 minutes past, or quarter to.`, `The short hand is nearly at ${(h % 12) + 1}, so the hour that has passed is ${h}.`, `It is ${timeWords(h, 45)}: ${digital(h, 45)}.`],
    })
  }
  if (chance()) {
    const n = pick([3, 6, 9])
    return q({
      prompt: `The long hand points to ${n}. How many minutes past the hour is it?`,
      answer: numA(5 * n),
      suffix: 'minutes',
      hint: '3 is quarter past (15), 6 is half past (30), 9 is quarter to (45).',
      steps: [`${n} on the clock means ${5 * n} minutes.`],
    })
  }
  const m = pick([15, 30, 45])
  const right = timeWords(h, m)
  const wrongs = [...new Set([timeWords(h, 60 - m === 0 ? 30 : 60 - m), timeWords((h % 12) + 1, m), timeWords(h, m === 30 ? 15 : 30)])].filter((w) => w !== right)
  return q({
    prompt: `Which words match ${digital(h, m)}?`,
    answer: mcA(right, wrongs),
    hint: ':15 is quarter past. :30 is half past. :45 is quarter to the next hour.',
    steps: [`${digital(h, m)} is ${right}.`],
  })
}

const nsm_duration = (level: Level): Question => {
  if (level === 1) {
    const it = pick([
      ['How many days are in a week?', 7, 'days', 'Monday to Sunday is 7 days.'],
      ['How many minutes are in an hour?', 60, 'minutes', 'An hour is 60 minutes.'],
      ['How many seconds are in a minute?', 60, 'seconds', 'A minute is 60 seconds.'],
    ] as [string, number, string, string][])
    if (chance(0.4))
      return q({
        prompt: 'Which is the longest time?',
        answer: mcA('an hour', ['a minute', 'a second']),
        hint: 'A second is very short. An hour is long.',
        steps: ['1 hour = 60 minutes, and 1 minute = 60 seconds, so an hour is the longest.'],
      })
    return q({ prompt: it[0], answer: numA(it[1]), suffix: it[2], hint: 'Use what you know about time.', steps: [it[3]] })
  }
  if (level === 2) {
    const m = pick([2, 4, 6, 9, 10, 11])
    const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m]
    const start = int(0, 6)
    const today = int(1, days - 8)
    const gap = pick([7, 14, int(2, 6), int(8, 13)])
    if (today + gap > days) return nsm_duration(level)
    const month = D3.MONTHS[m]
    const askWeeks = gap % 7 === 0 && chance()
    return q({
      prompt: `Today is ${month} ${today}. The party is on ${month} ${today + gap}. How many ${askWeeks ? 'weeks' : 'days'} until the party?`,
      diagram: D3.calendar(month, start, days, today + gap),
      answer: numA(askWeeks ? gap / 7 : gap),
      suffix: askWeeks ? (gap === 7 ? 'week' : 'weeks') : 'days',
      hint: askWeeks ? 'Each week is 7 days.' : `Count on from ${today} to ${today + gap}.`,
      steps: askWeeks ? [`From ${today} to ${today + gap} is ${gap} days.`, `${gap} days = ${plural(gap / 7, 'week')}.`] : [`${today + gap} ${MINUS} ${today} = ${gap} days.`],
    })
  }
  const h = int(1, 11)
  const [m1, m2] = pick([
    [0, 30],
    [15, 45],
    [30, 60],
    [0, 15],
    [15, 30],
    [45, 60],
  ])
  const what = pick(['A TV show', 'Art class', 'Swimming', 'A music lesson'])
  const end = m2 === 60 ? digital(h + 1, 0) : digital(h, m2)
  const endWords = m2 === 60 ? timeWords(h + 1, 0) : timeWords(h, m2)
  return q({
    prompt: `${what} starts at ${timeWords(h, m1)} and finishes at ${endWords}. How long does it go for?`,
    answer: numA(m2 - m1),
    suffix: 'minutes',
    hint: 'Each quarter of an hour is 15 minutes.',
    steps: [`${digital(h, m1)} to ${end} is ${m2 - m1} minutes.`],
  })
}

// ------------------------------------------------------------------ topics

export const Y2B: Topic[] = [
  {
    id: 'y2-maps-length',
    year: 2,
    title: 'Maps and length',
    strand: 'Measurement and space',
    outcomes: ['MA1-GM-01', 'MA1-GM-02', 'MA1-GM-03'],
    blurb: 'Simple maps and paths, centimetres and metres, comparing lengths and eighths of a length.',
    colour: 140,
    skills: [
      {
        id: 'y2-gm-maps',
        title: 'Maps and paths',
        outcomes: ['MA1-GM-01'],
        summary: 'Find places on a simple map and describe paths.',
        learn: {
          intro: '<p>A map shows where places are. We describe paths with left, right, up and down.</p>',
          keyPoints: ['Directly above means in the square straight above.', 'Describe the path one move at a time.'],
        },
        gen: gm_maps,
        levels: { 1: 'next to and above', 2: 'follow a path', 3: 'choose the path' },
      },
      {
        id: 'y2-gm-cm',
        title: 'Centimetres and metres',
        outcomes: ['MA1-GM-02'],
        summary: 'Measure in centimetres, choose metres or centimetres, and estimate.',
        learn: {
          intro: '<p>We measure long things in <b>metres</b> (m) and short things in <b>centimetres</b> (cm). There are 100 centimetres in 1 metre.</p>',
          keyPoints: ['Start measuring at 0 on the ruler.', 'A metre is about one big step.'],
        },
        gen: gm_cm,
        levels: { 1: 'read a ruler', 2: 'm or cm; estimating', 3: 'compare lengths' },
      },
      {
        id: 'y2-gm-informal',
        title: 'Comparing lengths',
        outcomes: ['MA1-GM-02'],
        summary: 'Compare and order lengths, and see why we need standard units.',
        learn: {
          intro: '<p>To compare lengths fairly, measure them all with the same unit.</p>',
          keyPoints: ['A longer unit is needed fewer times.', 'Hand spans differ between people, so we use metres and centimetres.'],
        },
        gen: gm_informal,
        levels: { 1: 'measure with pencils', 2: 'longest and shortest', 3: 'unit size; standard units' },
      },
      {
        id: 'y2-gm-eighths',
        title: 'Halves, quarters and eighths',
        outcomes: ['MA1-GM-03'],
        summary: 'Halve lengths again and again to make quarters and eighths.',
        learn: {
          intro: '<p>Halve a strip to make halves. Halve again to make quarters. Halve again to make eighths.</p>',
          keyPoints: ['8 eighths make a whole.', '2 eighths make a quarter.', '4 eighths make a half.'],
        },
        gen: gm_eighths,
        levels: { 1: 'how many parts', 2: 'eighths or not', 3: 'shaded eighths; matching parts' },
      },
    ],
  },
  {
    id: 'y2-shapes-area',
    year: 2,
    title: 'Shapes, turns and area',
    strand: 'Measurement and space',
    outcomes: ['MA1-2DS-01', 'MA1-2DS-02'],
    blurb: 'Quarter, half and full turns, joining and cutting shapes, and area in rows of tiles.',
    colour: 320,
    skills: [
      {
        id: 'y2-2d-turns',
        title: 'Turns',
        outcomes: ['MA1-2DS-01'],
        summary: 'Describe quarter, half and full turns, clockwise and anticlockwise.',
        learn: {
          intro: '<p>A quarter turn is like the minute hand moving from 12 to 3. Two quarter turns make a half turn. Four make a full turn.</p>',
          keyPoints: ['Clockwise: the way clock hands move.', 'Anticlockwise: the other way.'],
        },
        gen: sh_turns,
        levels: { 1: 'clockwise turns', 2: 'anticlockwise turns', 3: 'three-quarter and full turns; clock hands' },
      },
      {
        id: 'y2-2d-combine',
        title: 'Joining and cutting shapes',
        outcomes: ['MA1-2DS-01'],
        summary: 'Say what shapes are made when shapes are joined or cut.',
        learn: {
          intro: '<p>Shapes can be put together to make new shapes, or cut into smaller shapes.</p>',
          keyPoints: ['Two squares side by side make a rectangle.', 'Cutting a square corner to corner makes two triangles.'],
        },
        gen: sh_combine,
        levels: { 1: 'squares and triangles', 2: 'bigger shapes', 3: 'how many pieces' },
      },
      {
        id: 'y2-2d-area',
        title: 'Area in rows of tiles',
        outcomes: ['MA1-2DS-02'],
        summary: 'Use rows and columns of square tiles to find and compare areas.',
        learn: {
          intro: '<p>Tiles in rows and columns help us count area quickly: 3 rows of 5 tiles is 5 + 5 + 5 = 15 tiles.</p>',
          keyPoints: ['Count one row, then add it once for each row.'],
        },
        gen: sh_area,
        levels: { 1: 'count rows of tiles', 2: 'rows without a picture', 3: 'compare two areas' },
      },
    ],
  },
  {
    id: 'y2-3d-volume',
    year: 2,
    title: '3D objects and volume',
    strand: 'Measurement and space',
    outcomes: ['MA1-3DS-01', 'MA1-3DS-02'],
    blurb: 'Faces, edges and vertices of prisms, and comparing volumes with blocks and cups.',
    colour: 190,
    skills: [
      {
        id: 'y2-3d-faces',
        title: 'Faces, edges and vertices',
        outcomes: ['MA1-3DS-01'],
        summary: 'Describe prisms using faces, edges and vertices.',
        learn: {
          intro: '<p>A <b>face</b> is a flat surface. An <b>edge</b> is where two faces meet. A <b>vertex</b> is a corner.</p>',
          keyPoints: ['A cube has 6 faces, 12 edges and 8 vertices.', 'A triangular prism has 5 faces, 9 edges and 6 vertices.'],
        },
        gen: td_faces,
        levels: { 1: 'shapes of faces', 2: 'count faces', 3: 'count edges or vertices' },
      },
      {
        id: 'y2-3d-volume',
        title: 'Blocks and cups',
        outcomes: ['MA1-3DS-02'],
        summary: 'Measure volume with blocks and compare how much jugs hold.',
        learn: {
          intro: '<p>We can measure the volume of a model by counting its blocks. Models can look different but use the same number of blocks.</p>',
          keyPoints: ['Count the top layer, then the layers.', 'More cups means a jug holds more.'],
        },
        gen: td_volume,
        levels: { 1: 'one layer of blocks', 2: 'two layers', 3: 'same volume; most and least' },
      },
    ],
  },
  {
    id: 'y2-mass-time',
    year: 2,
    title: 'Mass and time',
    strand: 'Measurement and space',
    outcomes: ['MA1-NSM-01', 'MA1-NSM-02'],
    blurb: 'Measuring mass with blocks, quarter past and quarter to, and using calendars and minutes.',
    colour: 45,
    skills: [
      {
        id: 'y2-nsm-mass',
        title: 'Measuring mass with blocks',
        outcomes: ['MA1-NSM-01'],
        summary: 'Compare masses using the number of blocks needed to balance.',
        learn: {
          intro: '<p>Put an object on one side of a balance and add blocks to the other side until it is level. Count the blocks.</p>',
          keyPoints: ['More blocks means heavier.', 'Changing the shape does not change the mass.'],
        },
        gen: nsm_mass,
        levels: { 1: 'how many more blocks', 2: 'block size; same mass', 3: 'heaviest and lightest' },
      },
      {
        id: 'y2-nsm-clock',
        title: 'Quarter past and quarter to',
        outcomes: ['MA1-NSM-02'],
        summary: 'Read clocks to the quarter-hour.',
        learn: {
          intro: '<p>When the long hand points to 3, it is quarter past. When it points to 9, it is quarter to the next hour.</p>',
          keyPoints: ['Quarter past 4 is 4:15.', 'Quarter to 5 is 4:45.'],
        },
        gen: nsm_clock,
        levels: { 1: 'quarter past', 2: 'quarter to', 3: 'minutes and words' },
      },
      {
        id: 'y2-nsm-duration',
        title: 'How long?',
        outcomes: ['MA1-NSM-02'],
        summary: 'Use calendars and clocks to work out how long things take.',
        learn: {
          intro: '<p>There are 7 days in a week, 60 minutes in an hour and 60 seconds in a minute.</p>',
          keyPoints: ['Count on in a calendar to find days until an event.', 'From quarter past to quarter to is 30 minutes.'],
        },
        gen: nsm_duration,
        levels: { 1: 'units of time', 2: 'days and weeks on a calendar', 3: 'quarter-hour durations' },
      },
    ],
  },
]
