// Chapter 6 Geometrical figures: mixed-practice questions (lib/mixed.js). Every question stands on its own.
const D = require('../../lib/diagrams');

const rad = (d) => (d * Math.PI) / 180;
const NAMES = ['Ali', 'Mia', 'Zac', 'Lena', 'Kai', 'Ruby', 'Tom', 'Priya', 'Jack', 'Aisha', 'Noah', 'Chloe'];
const i_ = (v) => `<i>${v}</i>`;
// A triangle drawn with its true angles: base 34 long, angles A (left) and B (right). labels: [A, B, C] angle labels.
const triPts = (A, B) => {
  const L = 34, tA = Math.tan(rad(A)), tB = Math.tan(rad(B));
  const x = B === 90 ? L : (L * tB) / (tA + tB), y = B === 90 ? L * tA : x * tA;
  const s = y > 26 ? 26 / y : 1;
  return [[0, 26], [L * s, 26], [x * s, 26 - y * s]];
};
const tri = (A, B, labels, o = {}) => D.fit(triPts(A, B), { angles: labels, angleDist: 6.5, ...o }, 4);
// A triangle with its base extended to the right: the exterior angle at the right-hand vertex is labelled ext.
const extTri = (A, B, labels, ext) => { const p = triPts(A, B); return D.fit(p, { angles: [labels[0], '', labels[2]], angleDist: 6.5, lines: [[p[1], [p[1][0] + 13, 26]]], labels: [[ext, p[1][0] + 6, 23.5]] }, 4); };
const triSides = (a, b, c) => (a === b && b === c ? 'equilateral' : a === b || b === c || a === c ? 'isosceles' : 'scalene');
const triAngles = (a, b, c) => (Math.max(a, b, c) === 90 ? 'right-angled' : Math.max(a, b, c) > 90 ? 'obtuse-angled' : 'acute-angled');
// Shapes: [name, axes of symmetry, order of rotational symmetry, points]
const SHAPES = [['square', 4, 4, [[0, 0], [20, 0], [20, 20], [0, 20]]], ['rectangle', 2, 2, [[0, 0], [30, 0], [30, 16], [0, 16]]], ['rhombus', 2, 2, [[14, 0], [28, 12], [14, 24], [0, 12]]],
  ['parallelogram', 0, 2, [[8, 0], [32, 0], [24, 16], [0, 16]]], ['kite', 1, 1, [[12, 0], [24, 8], [12, 26], [0, 8]]], ['isosceles trapezium', 1, 1, [[8, 0], [22, 0], [30, 16], [0, 16]]],
  ['equilateral triangle', 3, 3, [[12, 0], [24, 20.8], [0, 20.8]]], ['isosceles triangle', 1, 1, [[10, 0], [20, 24], [0, 24]]], ['scalene triangle', 0, 1, [[6, 0], [30, 20], [0, 16]]],
  ['regular hexagon', 6, 6, [0, 1, 2, 3, 4, 5].map((k) => [12 + 12 * Math.cos(rad(60 * k)), 11 + 12 * Math.sin(rad(60 * k))])],
  ['regular pentagon', 5, 5, [0, 1, 2, 3, 4].map((k) => [12 + 12 * Math.cos(rad(72 * k - 90)), 12 + 12 * Math.sin(rad(72 * k - 90))])]];
const shape = (i) => D.fit(SHAPES[i][3].map(([x, y]) => [+x.toFixed(2), +y.toFixed(2)]), { fill: '#dfe6fa' }, 3);
const QUADS = [['square', 'all sides equal and all angles 90°'], ['rectangle', 'opposite sides equal, all angles 90°'], ['rhombus', 'all sides equal, opposite angles equal'], ['parallelogram', 'opposite sides parallel and equal'], ['trapezium', 'exactly one pair of parallel sides'], ['kite', 'two pairs of equal adjacent sides']];
// Letters: [letter, axes of symmetry, order of rotational symmetry]
const LETTERS = [['A', 1, 1], ['B', 1, 1], ['C', 1, 1], ['D', 1, 1], ['E', 1, 1], ['F', 0, 1], ['H', 2, 2], ['I', 2, 2], ['L', 0, 1], ['M', 1, 1], ['N', 0, 2], ['S', 0, 2], ['T', 1, 1], ['U', 1, 1], ['V', 1, 1], ['W', 1, 1], ['X', 2, 2], ['Z', 0, 2], ['P', 0, 1], ['R', 0, 1]];
// Small shapes on a grid (in grid squares), and the transformations of them.
const PIECES = [[[0, 0], [2, 0], [2, 1], [1, 1], [1, 2], [0, 2]], [[0, 0], [3, 0], [0, 2]], [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [0, 2]], [[0, 0], [2, 0], [2, 3], [1, 3], [1, 1], [0, 1]], [[0, 0], [3, 0], [3, 1], [1, 1], [1, 2], [0, 2]]];
const move = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy]);
const flipX = (pts, m) => pts.map(([x, y]) => [2 * m - x, y]); // reflect in the vertical line x = m
const turn90 = (pts, px, py) => pts.map(([x, y]) => [px - (y - py), py + (x - px)]); // a quarter turn clockwise about (px, py)
const turn180 = (pts, px, py) => pts.map(([x, y]) => [2 * px - x, 2 * py - y]);
const G = (o) => D.grid({ cols: 11, rows: 7, cell: 4, ...o });
const inGrid = (pts) => pts.every(([x, y]) => x >= 0 && x <= 11 && y >= 0 && y <= 7);
const across = (dx) => `${Math.abs(dx)} ${dx > 0 ? 'right' : 'left'}`;
const upDown = (dy) => `${Math.abs(dy)} ${dy < 0 ? 'up' : 'down'}`; // grid y runs down the page

module.exports = {
  '6.01': {
    idea: 'A translation slides a shape. A reflection flips it over a mirror line. A rotation turns it about a point. The shape keeps its size and shape: only its position changes.',
    ex: [['Translate the shape 4 right and 2 down. Draw the image.', ['move every corner 4 right, 2 down', 'join the new corners'], G({ shapes: [{ pts: move(PIECES[0], 1, 1) }] })], ['Reflect the shape in the dashed line.', ['each corner the same distance on the other side', 'join the new corners'], G({ shapes: [{ pts: move(PIECES[1], 1, 2) }], mirror: [5, 0, 5, 7] })], ['Rotate the shape 90° clockwise about the dot.', ['turn each corner a quarter turn', 'join the new corners'], G({ shapes: [{ pts: move(PIECES[2], 3, 1) }], point: [5, 3] })]],
    exFh: 26, exH: 70,
    e: [
      (K, i) => { const L = [['a slide', 'translation'], ['a flip', 'reflection'], ['a turn', 'rotation'], ['a mirror image', 'reflection'], ['moving 5 squares up', 'translation'], ['a clock hand moving', 'rotation'], ['your reflection in a lake', 'reflection'], ['a lift going up', 'translation'], ['a wheel turning', 'rotation'], ['a door opening', 'rotation'], ['a car driving straight ahead', 'translation'], ['the wings of a butterfly', 'reflection']]; const x = L[i % L.length]; return { q: `Is ${x[0]} a translation, a reflection or a rotation?`, a: x[1] }; },
      ({ ri, pick }) => { const p = move(pick(PIECES), ri(0, 1), ri(1, 3)), dx = ri(4, 7), dy = ri(-3, 3), img = move(p, dx, dy); return !inGrid(img) ? null : { q: 'Describe the translation from the shaded shape to the white shape.', fig: G({ shapes: [{ pts: p }, { pts: img, fill: '#fff' }] }), a: `${across(dx)}${dy ? `, ${upDown(dy)}` : ''}` }; },
      ({ ri, pick }) => { const k = ri(0, 2), p = move(pick(PIECES), 1, 2); const img = [move(p, 5, -1), flipX(p, 5), turn180(p, 5, 3.5)][k]; return { q: 'Name the transformation from the shaded shape to the white shape.', fig: G({ shapes: [{ pts: p }, { pts: img, fill: '#fff' }], mirror: k === 1 ? [5, 0, 5, 7] : undefined, point: k === 2 ? [5, 3.5] : undefined }), a: ['translation', 'reflection', 'rotation (half turn)'][k] }; },
    ],
    m: [
      ({ ri, pick }) => { const p = move(pick(PIECES), 1, ri(1, 2)), dx = ri(3, 6), dy = ri(-1, 2); return { q: `Translate the shape ${across(dx)}${dy ? ` and ${upDown(dy)}` : ''}. Draw the image.`, fig: G({ shapes: [{ pts: p }] }), n: 0, a: `image ${across(dx)}${dy ? `, ${upDown(dy)}` : ''} (check each corner)` }; },
      ({ ri, pick }) => { const p = move(pick(PIECES), ri(1, 2), ri(1, 4)); return { q: 'Reflect the shape in the dashed line. Draw the image.', fig: G({ shapes: [{ pts: p }], mirror: [5, 0, 5, 7] }), n: 0, a: 'mirror image: each corner the same distance from the line, on the other side' }; },
      ({ ri }) => { const d = ri(2, 6); return { q: `A point is ${d} squares to the left of a mirror line. Where is its image?`, a: `${d} squares to the right of the line` }; },
    ],
    c: [
      ({ pick }) => { const p = move(pick(PIECES), 2, 1); return { q: 'Rotate the shape 90° clockwise about the dot. Draw the image.', fig: G({ shapes: [{ pts: p }], point: [5, 3] }), n: 0, a: 'a quarter turn clockwise about the dot (check each corner)' }; },
      ({ pick }) => { const p = move(pick(PIECES), 2, 1); return { q: 'Rotate the shape 180° about the dot. Draw the image.', fig: G({ shapes: [{ pts: p }], point: [5, 3.5] }), n: 0, a: 'a half turn: each corner the same distance on the opposite side of the dot' }; },
      ({ pick }) => { const [q, a] = pick([['Does a reflection change the size of a shape? Does it change the way it faces?', 'No, the size stays the same. Yes, it faces the other way (it is flipped).'], ['Which transformations keep a shape facing the same way?', 'Translations (and full turns).'], ['A shape is turned 90° clockwise, then another 90° clockwise. What single turn does the same?', 'A half turn (180°).'], ['A shape is turned 90° clockwise. What turn brings it back?', '90° anticlockwise (or 270° clockwise).']]); return { q, a, n: 2, key: q }; },
    ],
  },

  '6.02': {
    idea: 'In a combined transformation, do the moves one at a time, in order. Two translations can be done as one: add up the moves across, and the moves up and down.',
    ex: [['Translate 3 right, 1 up, then 2 right, 4 down. Write it as one translation.', ['across: 3 + 2 = 5 right', 'up/down: 1 up, 4 down = 3 down', '5 right, 3 down']], ['Reflect the shape in the dashed line, then translate the image 2 down. Draw both.', ['reflect first', 'then move every corner 2 down'], G({ shapes: [{ pts: move(PIECES[0], 2, 1) }], mirror: [5, 0, 5, 7] })], ['A shape is turned 90° clockwise, then 180°. What single turn is that?', ['90° + 180° = 270° clockwise', 'the same as 90° anticlockwise']]],
    exFh: 26, exH: 70,
    look: ['6.01'],
    e: [
      ({ ri }) => { const a = ri(1, 7), b = ri(1, 7), c = ri(1, 7), d = ri(1, 7); return { q: `Translate ${a} right, then ${b} right. Write it as one translation.`, a: `${a + b} right` }; },
      ({ pick }) => { const [a, b] = pick([[90, 90], [90, 180], [180, 180], [90, 270], [180, 90]]); const t = (a + b) % 360; return { q: `A shape is turned ${a}° clockwise, then ${b}° clockwise. What single turn does the same?`, a: t === 0 ? 'a full turn: back where it started' : `${t}° clockwise` }; },
      ({ ri, pick }) => { const k = ri(0, 2), p = move(pick(PIECES), 1, 2); const img = [move(p, 5, -1), flipX(p, 5), turn180(p, 5, 3.5)][k]; return { q: 'Name the transformation from the shaded shape to the white shape.', fig: G({ shapes: [{ pts: p }, { pts: img, fill: '#fff' }], mirror: k === 1 ? [5, 0, 5, 7] : undefined, point: k === 2 ? [5, 3.5] : undefined }), a: ['translation', 'reflection', 'rotation (half turn)'][k] }; },
    ],
    m: [
      ({ ri }) => { const a = ri(1, 7), b = ri(1, 7), c = ri(1, 7), d = ri(1, 7); const h = a - c, v = b - d; return !h || !v ? null : { q: `Translate ${a} right, ${b} up, then ${c} left, ${d} down. Write it as one translation.`, w: [`across: ${a} − ${c} = ${h < 0 ? `−${-h}` : h}`, `up/down: ${b} − ${d} = ${v < 0 ? `−${-v}` : v}`, `${Math.abs(h)} ${h > 0 ? 'right' : 'left'}, ${Math.abs(v)} ${v > 0 ? 'up' : 'down'}`] }; },
      ({ pick }) => { const p = move(pick(PIECES), 1, 1); return { q: 'Reflect the shape in the dashed line, then translate the image 2 down. Draw both images.', fig: G({ shapes: [{ pts: p }], mirror: [5, 0, 5, 7] }), n: 0, a: 'first image on the other side of the line; second image 2 squares below it' }; },
      ({ ri, pick }) => { const p = move(pick(PIECES), 1, 2), dx = ri(2, 4); return { q: `Translate the shape ${dx} right, then reflect the image in the dashed line. Draw both images.`, fig: G({ shapes: [{ pts: p }], mirror: [7, 0, 7, 7] }), n: 0, a: `first image ${dx} right; then its mirror image in the line` }; },
    ],
    c: [
      ({ pick }) => { const [q, a] = pick([['Does the order matter if you reflect in a line and then translate along it? Try it.', 'No: moving along the mirror line gives the same result in either order.'], ['Does the order matter if you translate 3 right, then reflect in a vertical line? Try it.', 'Yes: the images end up in different places.'], ['Which single transformation is the same as two reflections in the same line?', 'None is needed: the shape is back where it started.']]); return { q, a, n: 2, key: q }; },
      ({ ri }) => { const a = ri(2, 6), b = ri(2, 6); return { q: `A shape is translated ${a} right and ${b} up. What translation brings it back?`, a: `${a} left and ${b} down` }; },
      ({ pick }) => { const p = move(pick(PIECES), 1, 1); return { q: 'Rotate the shape 180° about the dot, then translate the image 3 right. Draw both images.', fig: G({ shapes: [{ pts: p }], point: [4, 3.5] }), n: 0, a: 'a half turn about the dot, then that image moved 3 squares right' }; },
    ],
  },

  '6.03': {
    idea: 'An axis (line) of symmetry folds a shape onto itself: the two halves match exactly. A regular polygon has as many axes of symmetry as it has sides.',
    ex: [['How many axes of symmetry does a square have?', ['fold across, up and along each diagonal', '4 axes'], shape(0)], ['How many axes of symmetry does the letter E have?', ['fold across the middle', '1 axis']], ['How many axes of symmetry does a regular hexagon have?', ['one for every side', '6 axes']]],
    look: ['6.01'],
    e: [
      (K, i) => { const k = i % SHAPES.length; return { q: 'How many axes of symmetry does the shape have?', fig: shape(k), fh: 24, a: String(SHAPES[k][1]) }; },
      ({ pick }) => { const [l, ax] = pick(LETTERS); return { q: `How many axes of symmetry does the capital letter ${l} have?`, a: String(ax), key: `L${l}` }; },
      ({ ri }) => { const n = ri(3, 12); return { q: `How many axes of symmetry does a regular polygon with ${n} sides have?`, a: String(n) }; },
    ],
    m: [
      (K, i) => { const k = [0, 1, 2, 4, 5, 6, 9, 10][i % 8]; return { q: 'Name the shape, then draw its axes of symmetry. How many are there?', fig: shape(k), fh: 24, w: [`${SHAPES[k][0]}`, `${SHAPES[k][1]} ${SHAPES[k][1] === 1 ? 'axis' : 'axes'}`] }; },
      ({ pick }) => { const ws = pick([['MUM', 1], ['OXO', 2], ['BOB', 0], ['TOT', 1], ['HOH', 2], ['DAD', 0], ['WOW', 1]]); return { q: `How many axes of symmetry does the word ${ws[0]} have (in capitals)?`, a: String(ws[1]), key: ws[0] }; },
      ({ pick }) => { const [nm, ax] = pick([['square', 4], ['rectangle', 2], ['rhombus', 2], ['parallelogram', 0], ['kite', 1], ['isosceles triangle', 1], ['equilateral triangle', 3], ['scalene triangle', 0]]); return { q: `How many axes of symmetry does ${/^[aeiou]/.test(nm) ? 'an' : 'a'} ${nm} have?`, a: String(ax), key: nm }; },
    ],
    c: [
      ({ ri, pick }) => { const half = move(pick([[[0, 0], [2, 0], [2, 3], [0, 1]], [[0, 0], [3, 1], [3, 3], [0, 2]], [[1, 0], [3, 0], [3, 2], [0, 3]]]), 2, 2); return { q: 'The dashed line is an axis of symmetry. Draw the other half of the shape.', fig: G({ shapes: [{ pts: half }], mirror: [5, 0, 5, 7] }), n: 0, a: 'the mirror image of the half on the other side of the line' }; },
      ({ pick }) => { const [q, a] = pick([['Can a triangle have exactly two axes of symmetry? Explain.', 'No. A triangle has 0, 1 or 3 axes.'], ['Draw a quadrilateral with exactly one axis of symmetry. Name it.', 'a kite (or an isosceles trapezium)'], ['How many axes of symmetry does a circle have?', 'infinitely many (every diameter)']]); return { q, a, n: 2, key: q }; },
      ({ pick }) => { const [nm, ax] = pick([['regular octagon', 8], ['regular decagon', 10], ['regular 20-sided polygon', 20]]); return { q: `How many axes of symmetry does a ${nm} have? How many go through corners?`, w: [`${ax} axes`, `${ax / 2} go through opposite corners`] }; },
    ],
  },

  '6.04': {
    idea: 'A shape has rotational symmetry if it fits onto itself before a full turn. The order is how many times it fits onto itself in one full turn. The smallest angle of turn is 360° ÷ the order.',
    ex: [['What is the order of rotational symmetry of a square?', ['fits every quarter turn', 'order 4'], shape(0)], ['A regular pentagon: find the order and the smallest angle of turn.', ['order 5', '360° ÷ 5 = 72°']], ['What is the order of rotational symmetry of the letter S?', ['fits after a half turn', 'order 2']]],
    look: ['6.03'],
    e: [
      (K, i) => { const k = (i * 3 + 1) % SHAPES.length; return { q: 'What is the order of rotational symmetry? (Write 1 if it only fits after a full turn.)', fig: shape(k), fh: 24, a: String(SHAPES[k][2]) }; },
      ({ pick }) => { const [l, , ord] = pick(LETTERS); return { q: `What is the order of rotational symmetry of the capital letter ${l}?`, a: String(ord), key: `R${l}` }; },
      ({ ri }) => { const n = ri(3, 12); return { q: `What is the order of rotational symmetry of a regular polygon with ${n} sides?`, a: String(n) }; },
    ],
    m: [
      ({ pick }) => { const n = pick([3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36]); return { q: `A regular polygon has ${n} sides. Find its order of rotational symmetry and its smallest angle of turn.`, w: [`order ${n}`, `360° ÷ ${n} = ${360 / n}°`] }; },
      ({ pick }) => { const n = pick([2, 3, 4, 5, 6, 8, 10, 12]); return { q: `A shape has rotational symmetry of order ${n}. What is its smallest angle of turn?`, w: [`360° ÷ ${n}`, `= ${360 / n}°`] }; },
      (K, i) => { const k = (i * 5) % SHAPES.length; const [nm, ax, ord] = SHAPES[k]; return { q: `Give the number of axes of symmetry and the order of rotational symmetry of the shape.`, fig: shape(k), fh: 24, w: [`axes: ${ax}`, `order: ${ord}`] }; },
    ],
    c: [
      ({ pick }) => { const a = pick([45, 40, 30, 60, 72, 90, 120, 20]); return { q: `A shape fits onto itself every ${a}°. What is its order of rotational symmetry?`, w: [`360° ÷ ${a}°`, `= order ${360 / a}`] }; },
      ({ pick }) => { const [q, a] = pick([['Name a quadrilateral with rotational symmetry of order 2 but no axes of symmetry.', 'a parallelogram'], ['Name a shape with rotational symmetry of order 4.', 'a square'], ['Name a capital letter with rotational symmetry of order 2 but no axes of symmetry.', 'N, S or Z'], ['Name a triangle with rotational symmetry of order 3.', 'an equilateral triangle']]); return { q, a, key: q }; },
      ({ pick }) => { const [nm, ax, ord] = pick([['rectangle', 2, 2], ['kite', 1, 1], ['rhombus', 2, 2], ['regular hexagon', 6, 6], ['parallelogram', 0, 2]]); return { q: `Compare the line symmetry and the rotational symmetry of ${/^[aeiou]/.test(nm) ? 'an' : 'a'} ${nm}.`, w: [`axes of symmetry: ${ax}`, `order of rotation: ${ord}`], key: nm }; },
    ],
  },

  '6.05': {
    idea: 'By sides: equilateral (3 equal), isosceles (2 equal), scalene (none equal). By angles: acute-angled (all less than 90°), right-angled (one 90°), obtuse-angled (one more than 90°).',
    ex: [['Classify a triangle with sides 5 cm, 5 cm and 7 cm.', ['two sides equal', 'isosceles']], ['Classify a triangle with angles 30°, 50° and 100°.', ['one angle more than 90°', 'obtuse-angled']], ['Classify the triangle by its sides and its angles.', ['two marks: two equal sides', 'isosceles, right-angled'], tri(45, 90, ['45°', '', '45°'], { ticks: [[0, 1], [1, 1]], right: [1] })]],
    e: [
      ({ ri }) => { const a = ri(4, 24) * 5, b = ri(4, 24) * 5, c = 180 - a - b; return c < 15 ? null : { q: `Classify a triangle with angles ${a}°, ${b}° and ${c}° by its angles.`, a: triAngles(a, b, c) }; },
      ({ ri }) => { const k = ri(0, 2), a = ri(3, 12); const s = k === 0 ? [a, a, a] : k === 1 ? [a, a, ri(2, 2 * a - 1)] : [a, a + ri(1, 3), a + ri(4, 6)]; return k === 1 && s[2] === a ? null : { q: `Classify a triangle with sides ${s.join(' cm, ')} cm by its sides.`, a: triSides(...s) }; },
      ({ pick }) => { const [q, a] = pick([['How many equal sides does an equilateral triangle have?', '3'], ['How many equal sides does an isosceles triangle have?', '2'], ['What size is each angle of an equilateral triangle?', '60°'], ['How many right angles can a triangle have?', 'at most 1']]); return { q, a, key: q }; },
    ],
    m: [
      ({ ri }, i) => { const k = i % 3; const e = ri(7, 15) * 5; const [A, B] = [[e, e], [ri(5, 9) * 5, 90], [ri(6, 10) * 5, ri(3, 5) * 5]][k]; if (k === 2 && (A === B || 180 - A - B === A || 180 - A - B === B)) return null; const C = 180 - A - B; return { q: 'Classify the triangle by its sides and by its angles.', fig: tri(A, B, [`${A}°`, B === 90 ? '' : `${B}°`, `${C}°`], { ticks: A === B ? (A === 60 ? [[0, 1], [1, 1], [2, 1]] : [[1, 1], [2, 1]]) : [], right: B === 90 ? [1] : [] }), fh: 24, w: [A === 60 && B === 60 ? 'equilateral' : A === B || C === A || C === B ? 'isosceles' : 'scalene', triAngles(A, B, C)] }; },
      ({ ri }) => { const a = ri(4, 24) * 5, b = ri(4, 24) * 5, c = 180 - a - b; return c < 15 ? null : { q: `A triangle has angles ${a}°, ${b}° and ${c}°. Classify it by its angles and by its sides.`, w: [triAngles(a, b, c), a === b || b === c || a === c ? 'isosceles (two equal angles)' : 'scalene (no equal angles)'] }; },
    ],
    c: [
      ({ pick }) => { const [t, y, why] = pick([['a right-angled isosceles triangle', 'Yes', '90°, 45°, 45°'], ['a triangle with two right angles', 'No', '90° + 90° = 180° leaves nothing for the third angle'], ['an obtuse-angled equilateral triangle', 'No', 'equilateral angles are all 60°'], ['a right-angled scalene triangle', 'Yes', 'e.g. 90°, 60°, 30°'], ['a triangle with two obtuse angles', 'No', 'two angles over 90° add to more than 180°'], ['an obtuse-angled isosceles triangle', 'Yes', 'e.g. 120°, 30°, 30°']]); return { q: `Can you draw ${t}? Explain.`, a: `${y}: ${why}.`, n: 2, key: t }; },
      ({ ri }) => { const a = ri(3, 9), b = ri(3, 9), c = ri(3, 9); const ok = a + b > c && a + c > b && b + c > a; return { q: `Can a triangle have sides ${a} cm, ${b} cm and ${c} cm? Explain.`, a: ok ? `Yes: the two shorter sides add to more than the longest.` : `No: ${[a, b, c].sort((x, y) => x - y).slice(0, 2).join(' + ')} is not more than ${Math.max(a, b, c)}.`, n: 2 }; },
      ({ ri }) => { const a = ri(3, 12); return { q: `An isosceles triangle has two sides of ${a} cm and a perimeter of ${2 * a + a - 1} cm. How long is the third side?`, w: [`${2 * a + a - 1} − ${a} − ${a}`, `= ${a - 1} cm`] }; },
    ],
  },

  '6.06': {
    idea: 'The three angles of a triangle add to 180°. To find a missing angle, take the other two from 180°. In an isosceles triangle, the two base angles are equal.',
    ex: [['Two angles of a triangle are 65° and 80°. Find the third.', ['65 + 80 = 145', '180 − 145 = 35°']], ['Find a.', ['a + 50 + 70 = 180', 'a = 60'], tri(50, 70, ['50°', '70°', 'a°'])], ['An isosceles triangle has an apex angle of 40°. Find each base angle.', ['180 − 40 = 140', '140 ÷ 2 = 70°']]],
    look: ['6.05', '2.05'],
    e: [
      ({ ri }) => { const a = ri(15, 120), b = ri(15, 160 - a); return { q: `Two angles of a triangle are ${a}° and ${b}°. Find the third angle.`, a: `${180 - a - b}°` }; },
      ({ ri }) => { const A = ri(6, 14) * 5, B = ri(6, 16) * 5, C = 180 - A - B; return C < 20 ? null : { q: `Find ${i_('a')}.`, fig: tri(A, B, [`${A}°`, `${B}°`, 'a°']), fh: 22, a: `a = ${C}` }; },
      ({ ri }) => { const a = ri(10, 80); return { q: `A right-angled triangle has an angle of ${a}°. Find the third angle.`, a: `${90 - a}°` }; },
    ],
    m: [
      ({ ri }) => { const A = ri(6, 14) * 5, B = ri(6, 16) * 5, C = 180 - A - B; return C < 20 ? null : { q: `Find ${i_('a')}. Write the equation first.`, fig: tri(A, B, [`${A}°`, `${B}°`, 'a°']), fh: 22, w: [`a + ${A} + ${B} = 180`, `a = ${C}`] }; },
      ({ ri }) => { const apex = ri(4, 30) * 4; const base = (180 - apex) / 2; return { q: `An isosceles triangle has an apex angle of ${apex}°. Find each base angle.`, w: [`180 − ${apex} = ${180 - apex}`, `${180 - apex} ÷ 2 = ${base}°`] }; },
      ({ ri }) => { const base = ri(8, 17) * 5; return { q: `An isosceles triangle has a base angle of ${base}°. Find the apex angle.`, w: [`${base} + ${base} = ${2 * base}`, `180 − ${2 * base} = ${180 - 2 * base}°`] }; },
    ],
    c: [
      ({ pick }) => { const [a, b, c] = pick([[1, 2, 3], [2, 3, 4], [1, 1, 2], [1, 2, 6], [3, 4, 5], [1, 3, 5]]); const s = a + b + c; return 180 % s ? null : { q: `The angles of a triangle are ${a === 1 ? '' : a}${i_('x')}°, ${b === 1 ? '' : b}${i_('x')}° and ${c}${i_('x')}°. Find ${i_('x')} and each angle.`, w: [`${s}x = 180, x = ${180 / s}`, `angles: ${a * 180 / s}°, ${b * 180 / s}°, ${c * 180 / s}°`] }; },
      ({ ri }) => { const x = ri(15, 45), k = ri(1, 4) * 10; const third = 180 - (2 * x + k); return third <= 10 ? null : { q: `A triangle has angles ${i_('x')}°, (${i_('x')} + ${k})° and ${third}°. Find ${i_('x')}.`, w: [`x + x + ${k} + ${third} = 180`, `2x = ${180 - k - third}`, `x = ${x}`] }; },
      ({ ri, pick }) => { const a = ri(70, 100), b = ri(80, 110), who = pick(NAMES); return a + b <= 180 ? null : { q: `${who} says a triangle has angles of ${a}°, ${b}° and ${180 - a - b < 0 ? 10 : 180 - a - b}°. Is that possible? Explain.`, a: `No. ${a} + ${b} = ${a + b}, which is already more than 180°.`, n: 2 }; },
    ],
  },

  '6.07': {
    idea: 'An exterior angle of a triangle is made by extending one side. The exterior angle equals the sum of the two interior opposite angles.',
    ex: [['Find x, the exterior angle.', ['x = 50 + 60', 'x = 110'], extTri(50, 70, ['50°', '', '60°'], 'x°')], ['The interior opposite angles are 35° and 75°. Find the exterior angle.', ['35 + 75', '= 110°']], ['The exterior angle is 130°. One interior opposite angle is 45°. Find the other.', ['y + 45 = 130', 'y = 85°']]],
    look: ['6.06'],
    e: [
      ({ ri }) => { const a = ri(15, 90), b = ri(15, 160 - a); return { q: `The interior opposite angles are ${a}° and ${b}°. Find the exterior angle.`, a: `${a + b}°` }; },
      ({ ri }) => { const A = ri(7, 14) * 5, B = ri(6, 13) * 5; const C = 180 - A - B; return C < 20 || A + B > 155 ? null : { q: `Find ${i_('x')}, the exterior angle.`, fig: extTri(A, B, [`${A}°`, '', `${C}°`], 'x°'), fh: 22, a: `x = ${A + C}` }; },
      ({ ri }) => { const g = ri(20, 160); return { q: `An interior angle of a triangle is ${g}°. Find the exterior angle next to it.`, a: `${180 - g}°` }; },
    ],
    m: [
      ({ ri }) => { const A = ri(7, 14) * 5, B = ri(6, 13) * 5; const C = 180 - A - B; return C < 20 || A + B > 155 ? null : { q: `Find ${i_('x')}. Give the rule.`, fig: extTri(A, B, [`${A}°`, '', `${C}°`], 'x°'), fh: 22, w: [`x = ${A} + ${C}`, `x = ${A + C} (exterior angle)`] }; },
      ({ ri }) => { const e = ri(10, 34) * 5, a = ri(3, e / 5 - 2) * 5; return { q: `The exterior angle is ${e}° and one interior opposite angle is ${a}°. Find the other.`, w: [`y + ${a} = ${e}`, `y = ${e - a}°`] }; },
      ({ ri }) => { const A = ri(7, 14) * 5, B = ri(6, 13) * 5; const C = 180 - A - B; return C < 20 || A + B > 155 ? null : { q: `Find ${i_('y')}, then check with the angle sum.`, fig: extTri(A, B, ['y°', '', `${C}°`], `${A + C}°`), fh: 22, w: [`y + ${C} = ${A + C}`, `y = ${A}`] }; },
    ],
    c: [
      ({ ri }) => { const x = ri(15, 40), k = ri(1, 4) * 5, e = 2 * x + k; return e >= 170 ? null : { q: `The interior opposite angles are ${i_('x')}° and (${i_('x')} + ${k})°. The exterior angle is ${e}°. Find ${i_('x')}.`, w: [`x + x + ${k} = ${e}`, `2x = ${e - k}`, `x = ${x}`] }; },
      ({ ri }) => { const a = ri(30, 75); return { q: `An isosceles triangle has base angles of ${a}°. Find the exterior angle at a base vertex.`, w: [`interior base angle: ${a}°`, `exterior: 180 − ${a} = ${180 - a}°`] }; },
      ({ pick }) => { const [q, a] = pick([['Can an exterior angle of a triangle be acute? Explain.', 'Yes, when the interior angle next to it is obtuse.'], ['What do the three exterior angles of a triangle (one at each corner) add to?', '360°'], ['Explain why the exterior angle equals the two interior opposite angles.', 'Both it and the two opposite angles add to 180° with the same interior angle.']]); return { q, a, n: 2, key: q }; },
    ],
  },

  '6.08': {
    idea: 'Quadrilaterals have four sides. Square, rectangle, rhombus and parallelogram all have two pairs of parallel sides. A trapezium has exactly one pair. A kite has two pairs of equal sides next to each other.',
    ex: [['Name the quadrilateral: 4 equal sides, no right angles.', ['all sides equal', 'rhombus']], ['Name the quadrilateral and give one property.', ['two pairs of parallel sides, no right angles', 'parallelogram: opposite sides equal'], shape(3)], ['True or false: every square is a rectangle.', ['4 right angles, opposite sides equal', 'true']]],
    look: ['6.05'],
    e: [
      (K, i) => { const L = [['4 equal sides and 4 right angles', 'square'], ['4 right angles, and opposite sides equal', 'rectangle'], ['4 equal sides and no right angles', 'rhombus'], ['2 pairs of parallel sides and no right angles', 'parallelogram'], ['exactly 1 pair of parallel sides', 'trapezium'], ['2 pairs of equal sides next to each other', 'kite']]; const x = L[i % L.length]; return { q: `Name the quadrilateral: ${x[0]}.`, a: x[1] }; },
      (K, i) => { const k = [0, 1, 2, 3, 5, 4][i % 6]; return { q: 'Name the quadrilateral.', fig: shape(k), fh: 24, a: SHAPES[k][0] === 'isosceles trapezium' ? 'trapezium' : SHAPES[k][0] }; },
      ({ pick }) => { const [q, a] = pick([['How many sides does a quadrilateral have?', '4'], ['How many pairs of parallel sides does a trapezium have?', '1'], ['How many right angles does a rectangle have?', '4'], ['How many pairs of parallel sides does a parallelogram have?', '2']]); return { q, a, key: q }; },
    ],
    m: [
      (K, i) => { const k = [0, 1, 2, 3, 5, 4][i % 6]; const nm = SHAPES[k][0] === 'isosceles trapezium' ? 'trapezium' : SHAPES[k][0]; const pr = QUADS.find((q) => q[0] === nm); return { q: 'Name the quadrilateral, then give one property.', fig: shape(k), fh: 24, w: [nm, pr[1]] }; },
      (K, i) => { const L = [['Every square is a rectangle.', 'True: it has 4 right angles and opposite sides equal.'], ['Every rectangle is a square.', 'False: its sides need not all be equal.'], ['Every rhombus is a parallelogram.', 'True: both pairs of opposite sides are parallel.'], ['A kite is a parallelogram.', 'False: its opposite sides are not parallel.'], ['Every square is a rhombus.', 'True: all four sides are equal.'], ['A trapezium has two pairs of parallel sides.', 'False: it has exactly one pair.']]; const x = L[i % L.length]; return { q: `True or false? ${x[0]}`, a: x[1], n: 2 }; },
    ],
    c: [
      ({ pick }) => { const [q, a] = pick([['I have 4 equal sides. My diagonals are equal. What am I?', 'a square'], ['I have one pair of parallel sides and two equal sides that are not parallel. What am I?', 'an isosceles trapezium'], ['My opposite sides are parallel and I have a right angle. What two shapes could I be?', 'a rectangle or a square'], ['I have two pairs of equal sides next to each other and no parallel sides. What am I?', 'a kite']]); return { q, a, key: q }; },
      ({ pick }) => { const [a, b, why] = pick([['square', 'rectangle', 'a square is a special rectangle with all sides equal'], ['rhombus', 'parallelogram', 'a rhombus is a parallelogram with all sides equal'], ['square', 'rhombus', 'a square is a rhombus with right angles']]); return { q: `Explain why a ${a} is also a ${b}.`, a: why, n: 2, key: a + b }; },
      ({ pick }) => { const [q, a] = pick([['Which quadrilaterals have both pairs of opposite sides parallel?', 'square, rectangle, rhombus, parallelogram'], ['Which quadrilaterals have all four sides equal?', 'square, rhombus'], ['Which quadrilaterals have four right angles?', 'square, rectangle']]); return { q, a, n: 2, key: q }; },
    ],
  },

  '6.09': {
    idea: 'The four angles of a quadrilateral add to 360°: it can be cut into two triangles. To find a missing angle, take the other three from 360°.',
    ex: [['Three angles of a quadrilateral are 80°, 95° and 110°. Find the fourth.', ['80 + 95 + 110 = 285', '360 − 285 = 75°']], ['Find a.', ['a + 70 + 90 + 115 = 360', 'a = 85'], D.fit([[0, 22], [34, 22], [28, 0], [6, 4]], { angles: ['70°', '90°', '115°', 'a°'], angleDist: 6 }, 4)], ['A parallelogram has an angle of 65°. Find the other three angles.', ['opposite: 65°', 'next to it: 180 − 65 = 115°', '65°, 115°, 65°, 115°']]],
    look: ['6.06', '6.08'],
    e: [
      ({ ri }) => { const a = ri(10, 28) * 5, b = ri(10, 28) * 5, c = ri(10, 28) * 5, d = 360 - a - b - c; return d < 30 || d > 200 ? null : { q: `Three angles of a quadrilateral are ${a}°, ${b}° and ${c}°. Find the fourth.`, a: `${d}°` }; },
      ({ ri }) => { const a = ri(14, 22) * 5, b = ri(14, 22) * 5, c = ri(14, 22) * 5, d = 360 - a - b - c; return d < 60 || d > 150 ? null : { q: `Find ${i_('a')}. (Not to scale.)`, fig: D.fit([[0, 22], [34, 22], [28, 0], [6, 4]], { angles: [`${a}°`, `${b}°`, `${c}°`, 'a°'], angleDist: 6 }, 4), fh: 22, a: `a = ${d}` }; },
      ({ pick }) => { const [q, a] = pick([['What do the angles of a quadrilateral add to?', '360°'], ['What size is each angle of a rectangle?', '90°'], ['What do the angles of a triangle add to?', '180°']]); return { q, a, key: q }; },
    ],
    m: [
      ({ ri }) => { const a = ri(14, 22) * 5, b = ri(14, 22) * 5, c = ri(14, 22) * 5, d = 360 - a - b - c; return d < 60 || d > 150 ? null : { q: `Find ${i_('a')}. Write the equation first.`, fig: D.fit([[0, 22], [34, 22], [28, 0], [6, 4]], { angles: [`${a}°`, `${b}°`, `${c}°`, 'a°'], angleDist: 6 }, 4), fh: 22, w: [`a + ${a + b + c} = 360`, `a = ${d}`] }; },
      ({ ri }) => { const g = ri(8, 32) * 5; return g === 90 ? null : { q: `A parallelogram has an angle of ${g}°. Find the other three angles.`, w: [`opposite angle: ${g}°`, `next to it: 180 − ${g} = ${180 - g}°`] }; },
      ({ ri }) => { const a = ri(14, 26) * 5, b = ri(8, 20) * 5, r = 360 - a - b; return r % 2 ? null : { q: `A kite has two equal angles ${i_('x')}°. Its other angles are ${a}° and ${b}°. Find ${i_('x')}.`, w: [`2x + ${a + b} = 360`, `2x = ${r}, x = ${r / 2}`] }; },
    ],
    c: [
      ({ pick }) => { const [a, b, c, d] = pick([[1, 2, 3, 4], [2, 3, 3, 4], [1, 1, 2, 2], [3, 4, 5, 6], [1, 2, 2, 3]]); const s = a + b + c + d; return 360 % s ? null : { q: `The angles of a quadrilateral are in the ratio ${a} : ${b} : ${c} : ${d}. Write them as ${a === 1 ? '' : a}${i_('x')}°, ${b === 1 ? '' : b}${i_('x')}°, ${c}${i_('x')}°, ${d}${i_('x')}° and find ${i_('x')}.`, w: [`${s}x = 360`, `x = ${360 / s}`] }; },
      ({ ri }) => { const x = ri(20, 50), k = ri(1, 5) * 10, F = 360 - 4 * x - k; return F < 40 || F > 170 ? null : { q: `A quadrilateral has angles ${i_('x')}°, 2${i_('x')}°, (${i_('x')} + ${k})° and ${F}°. Find ${i_('x')}.`, w: [`4x + ${k} + ${F} = 360`, `4x = ${360 - k - F}`, `x = ${x}`] }; },
      ({ pick }) => { const [q, a] = pick([['Explain why the angles of a quadrilateral add to 360°.', 'A diagonal cuts it into two triangles: 2 × 180° = 360°.'], ['Can a quadrilateral have three obtuse angles? Explain.', 'Yes, e.g. 100°, 100°, 100°, 60° (they add to 360°).'], ['Can a quadrilateral have four obtuse angles? Explain.', 'No. Four angles over 90° add to more than 360°.']]); return { q, a, n: 2, key: q }; },
    ],
  },

  '6.10': {
    idea: 'Learn the properties: sides (equal? parallel?), angles (equal? right?) and diagonals (equal? meet at 90°? bisect each other?). Use them to find missing sides and angles.',
    ex: [['A rectangle has one diagonal 13 cm long. How long is the other?', ['rectangle: diagonals are equal', '13 cm']], ['A rhombus has a side of 7 cm. Find its perimeter.', ['all sides equal', '4 × 7 = 28 cm']], ['Do the diagonals of a kite meet at right angles?', ['one diagonal is an axis of symmetry', 'yes']]],
    look: ['6.08', '6.09'],
    e: [
      (K, i) => { const L = [['The diagonals of a rectangle are equal.', 'true'], ['The diagonals of a rhombus meet at 90°.', 'true'], ['The diagonals of a parallelogram are equal.', 'false'], ['A square has equal diagonals that meet at 90°.', 'true'], ['Opposite sides of a parallelogram are equal.', 'true'], ['A kite has two pairs of equal opposite sides.', 'false'], ['The diagonals of a parallelogram bisect each other.', 'true'], ['A rhombus has equal diagonals.', 'false'], ['The diagonals of a kite meet at 90°.', 'true']]; const x = L[i % L.length]; return { q: `True or false? ${x[0]}`, a: x[1] }; },
      ({ ri }) => { const a = ri(3, 15); return { q: `A rhombus has a side of ${a} cm. Find its perimeter.`, a: `${4 * a} cm` }; },
      ({ ri }) => { const a = ri(4, 15); return { q: `A rectangle has one diagonal ${a} cm long. How long is the other?`, a: `${a} cm` }; },
    ],
    m: [
      (K, i) => { const a = K.ri(4, 15), g = K.ri(8, 32) * 5; const L = [
        [`A parallelogram has an angle of ${g}°. Find the angle next to it.`, ['co-interior angles add to 180°', `180 − ${g} = ${180 - g}°`]],
        [`A square has a perimeter of ${4 * a} cm. Find a side.`, ['all sides equal', `${4 * a} ÷ 4 = ${a} cm`]],
        [`A rhombus has an angle of ${g}°. Find the opposite angle.`, ['opposite angles are equal', `${g}°`]],
        [`A rectangle is ${a} cm long and ${a + 3} cm wide. Find its perimeter.`, ['opposite sides equal', `2 × ${a} + 2 × ${a + 3} = ${4 * a + 6} cm`]],
      ][i % 4]; return g === 90 ? null : { q: L[0], w: L[1] }; },
      ({ pick }) => { const [nm, ans] = pick([['square', 'equal, meet at 90°, bisect each other'], ['rectangle', 'equal, bisect each other'], ['rhombus', 'meet at 90°, bisect each other'], ['parallelogram', 'bisect each other'], ['kite', 'meet at 90°, one bisects the other']]); return { q: `Describe the diagonals of a ${nm}.`, a: ans, n: 2, key: nm }; },
    ],
    c: [
      ({ pick }) => { const [q, a] = pick([['A quadrilateral has equal diagonals that meet at 90° and bisect each other. What is it?', 'a square'], ['A quadrilateral has diagonals that bisect each other but are not equal and do not meet at 90°. What is it?', 'a parallelogram'], ['A quadrilateral has equal diagonals that bisect each other but do not meet at 90°. What is it?', 'a rectangle']]); return { q, a, key: q }; },
      ({ ri }) => { const d1 = ri(3, 8) * 2, d2 = ri(3, 8) * 2; return d1 === d2 ? null : { q: `The diagonals of a rhombus are ${d1} cm and ${d2} cm. How far is it from the centre to each corner?`, w: ['the diagonals bisect each other', `${d1 / 2} cm and ${d2 / 2} cm`] }; },
      ({ pick }) => { const [s, why] = pick([['A square is a rectangle.', 'it has four right angles and opposite sides equal'], ['A square is a rhombus.', 'it has four equal sides'], ['A rhombus is a parallelogram.', 'both pairs of opposite sides are parallel'], ['A rhombus is a kite.', 'it has two pairs of equal sides next to each other']]); return { q: `Give a reason: ${s}`, a: why, n: 2, key: s }; },
    ],
  },
};
