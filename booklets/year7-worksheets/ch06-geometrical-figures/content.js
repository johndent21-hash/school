// Worksheet questions for Chapter 6 Geometrical figures (lib/worksheet.js). See ../ch01-integers/content.js.
const D = require('../../lib/diagrams');

const P = (x, y) => `(${x < 0 ? '−' : ''}${Math.abs(x)}, ${y < 0 ? '−' : ''}${Math.abs(y)})`;
const rad = (d) => (d * Math.PI) / 180;
// A triangle drawn with its true angles: base 34 long, angles A (left) and B (right). labels: [A, B, C] angle labels.
const tri = (A, B, labels, o = {}) => {
  const L = 34, tA = Math.tan(rad(A)), tB = Math.tan(rad(B));
  const x = (L * tB) / (tA + tB), y = x * tA;
  const s = y > 26 ? 26 / y : 1;
  const pts = [[0, 26], [L * s, 26], [x * s, 26 - y * s]];
  return D.fit(pts, { angles: labels, angleDist: 6.5, ...o }, 4);
};
const triSides = (a, b, c) => (a === b && b === c ? 'equilateral' : a === b || b === c || a === c ? 'isosceles' : 'scalene');
const triAngles = (a, b, c) => (Math.max(a, b, c) === 90 ? 'right' : Math.max(a, b, c) > 90 ? 'obtuse' : 'acute');
// Shapes: [name, axes of symmetry, order of rotational symmetry, points]
const SHAPES = [['square', 4, 4, [[0, 0], [20, 0], [20, 20], [0, 20]]], ['rectangle', 2, 2, [[0, 0], [30, 0], [30, 16], [0, 16]]], ['rhombus', 2, 2, [[14, 0], [28, 12], [14, 24], [0, 12]]],
  ['parallelogram', 0, 2, [[8, 0], [32, 0], [24, 16], [0, 16]]], ['kite', 1, 1, [[12, 0], [24, 8], [12, 26], [0, 8]]], ['isosceles trapezium', 1, 1, [[8, 0], [22, 0], [30, 16], [0, 16]]],
  ['equilateral triangle', 3, 3, [[12, 0], [24, 20.8], [0, 20.8]]], ['isosceles triangle', 1, 1, [[10, 0], [20, 24], [0, 24]]], ['scalene triangle', 0, 1, [[6, 0], [30, 20], [0, 16]]],
  ['regular hexagon', 6, 6, [0, 1, 2, 3, 4, 5].map((k) => [12 + 12 * Math.cos(rad(60 * k)), 11 + 12 * Math.sin(rad(60 * k))])],
  ['regular pentagon', 5, 5, [0, 1, 2, 3, 4].map((k) => [12 + 12 * Math.cos(rad(72 * k - 90)), 12 + 12 * Math.sin(rad(72 * k - 90))])]];
const shape = (i) => D.fit(SHAPES[i][3].map(([x, y]) => [+x.toFixed(2), +y.toFixed(2)]), { fill: '#dfe6fa' }, 3);
// A grid with a shape (grid squares) and optional mirror line or centre of turn.
const onGrid = (pts, o = {}) => D.grid({ cols: 10, rows: 7, cell: 4, shapes: [{ pts }], ...o });
const QUADS = [['square', 'all sides equal and all angles 90°'], ['rectangle', 'opposite sides equal, all angles 90°'], ['rhombus', 'all sides equal, opposite angles equal'], ['parallelogram', 'opposite sides parallel and equal'], ['trapezium', 'exactly one pair of parallel sides'], ['kite', 'two pairs of equal adjacent sides']];

module.exports = {
  '6.01': ({ ri, pick }) => [
    [{ text: 'Translate (slide) the point. Right and up add; left and down subtract.', gen: () => { const x = ri(-6, 6), y = ri(-6, 6), dx = ri(1, 6) * pick([1, -1]), dy = ri(1, 6) * pick([1, -1]); return { q: `${P(x, y)}: ${Math.abs(dx)} ${dx > 0 ? 'right' : 'left'}, ${Math.abs(dy)} ${dy > 0 ? 'up' : 'down'}`, a: P(x + dx, y + dy) }; } }],
    [{ text: 'Reflect the point in the axis. In the x-axis, change the sign of y; in the y-axis, change the sign of x.', gen: () => { const x = ri(-8, 8), y = ri(-8, 8), ax = pick(['x', 'y']); if (!x || !y) return { q: '' }; return { q: `${P(x, y)} in the ${ax}-axis`, a: ax === 'x' ? P(x, -y) : P(-x, y), lines: [`change the sign of ${ax === 'x' ? 'y' : 'x'}`, `→ ${ax === 'x' ? P(x, -y) : P(-x, y)}`] }; } }],
    [{ text: 'Rotate the point about the origin O. Use the rule, then check on the number plane.', kinds: 3, gen: (i) => { const x = ri(1, 6) * pick([1, -1]), y = ri(1, 6) * pick([1, -1]); if (x === y) return { q: '' }; return [
      { q: `Rotate ${P(x, y)} by 180° about O.`, a: P(-x, -y), lines: ['180°: (x, y) → (−x, −y)', `${P(x, y)} → ${P(-x, -y)}`] },
      { q: `Rotate ${P(x, y)} 90° clockwise about O.`, a: P(y, -x), lines: ['90° clockwise: (x, y) → (y, −x)', `${P(x, y)} → ${P(y, -x)}`] },
      { q: `Rotate ${P(x, y)} 90° anticlockwise about O.`, a: P(-y, x), lines: ['90° anticlockwise: (x, y) → (−y, x)', `${P(x, y)} → ${P(-y, x)}`] },
    ][i % 3]; } }],
  ],
  '6.02': ({ ri, pick }) => [
    [{ text: 'Name the transformation: translation, reflection or rotation.', gen: (i) => { const L = [['a slide', 'translation'], ['a flip', 'reflection'], ['a turn', 'rotation'], ['a mirror image', 'reflection'], ['moving 5 units up', 'translation'], ['a clock hand moving', 'rotation'], ['your reflection in a lake', 'reflection'], ['a lift going up', 'translation'], ['a wheel turning', 'rotation'], ['a door opening', 'rotation'], ['a car driving straight', 'translation'], ['a butterfly\'s wings', 'reflection'], ['a chess rook moving', 'translation'], ['a Ferris wheel', 'rotation']]; const x = L[i % L.length]; return { q: x[0], a: x[1] }; } },
      { text: 'Name the transformation that moves the shaded shape to the outlined shape.', gen: (i) => { const k = i % 3, a = ri(1, 2), b = ri(1, 2); const base = [[a, b], [a + 2, b], [a, b + 2]]; const img = k === 0 ? base.map(([x, y]) => [x + 5, y + 1]) : k === 1 ? base.map(([x, y]) => [10 - x, y]) : base.map(([x, y]) => [10 - x, 7 - y]); return { q: '', fig: D.grid({ cols: 10, rows: 7, cell: 3.6, shapes: [{ pts: base }, { pts: img, fill: 'none' }], mirror: k === 1 ? [5, 0, 5, 7] : undefined }), fh: 22, a: ['translation', 'reflection', 'rotation (180°)'][k] + (i >= 3 ? '' : '') }; } }],
    [{ text: 'Do both translations. Add the moves in each direction, then give one single translation.', gen: () => { const a = ri(1, 7), b = ri(1, 7), c = ri(1, 7), d = ri(1, 7); const h = a - c, v = b - d; if (!h || !v) return { q: '' }; return { q: `${a} right, ${b} up; then ${c} left, ${d} down`, a: `${Math.abs(h)} ${h > 0 ? 'right' : 'left'}, ${Math.abs(v)} ${v > 0 ? 'up' : 'down'}`, lines: [`across: ${a} − ${c} = ${h}`, `up/down: ${b} − ${d} = ${v}`, `${Math.abs(h)} ${h > 0 ? 'right' : 'left'}, ${Math.abs(v)} ${v > 0 ? 'up' : 'down'}`] }; } }],
    [{ text: 'Do the transformations in order. Write where the point is after each one.', kinds: 2, gen: (i) => { const x = ri(-5, 5), y = ri(-5, 5), dx = ri(1, 5); if (!x || !y) return { q: '' }; return i % 2 === 0
      ? { q: `${P(x, y)}: ${dx} right, then reflect in the x-axis`, a: P(x + dx, -y), lines: [`${dx} right: ${P(x + dx, y)}`, `reflect in x-axis: ${P(x + dx, -y)}`] }
      : { q: `${P(x, y)}: rotate 180° about O, then ${dx} left`, a: P(-x - dx, -y), lines: [`rotate 180°: ${P(-x, -y)}`, `${dx} left: ${P(-x - dx, -y)}`] }; } }],
  ],
  '6.03': ({ ri }) => [
    [{ text: 'How many axes (lines) of symmetry does the shape have? Fold it in your head.', gen: (i) => { const k = i % SHAPES.length; return { q: '', fig: shape(k), fh: 16, a: String(SHAPES[k][1]) }; } }],
    [{ text: 'How many axes of symmetry does a regular polygon have? It has one for every side.', gen: () => { const n = ri(3, 20); return { q: `a regular polygon with ${n} sides`, a: String(n), lines: [`${n} sides → ${n} axes`, `answer: ${n}`] }; } }],
    [{ text: 'Name the shape, then draw its axes of symmetry on it. How many are there?', gen: (i) => { const k = [0, 1, 2, 4, 5, 6, 9, 10][i % 8]; return { q: 'Name it and draw the axes.', fig: shape(k), fh: 20, a: `${SHAPES[k][0]}: ${SHAPES[k][1]}`, lines: [`shape: ${SHAPES[k][0]}`, `axes of symmetry: ${SHAPES[k][1]}`] }; } }],
  ],
  '6.04': ({ ri }) => [
    [{ text: 'What is the order of rotational symmetry? (How many times does it fit onto itself in one turn? Write 1 for none.)', gen: (i) => { const k = i % SHAPES.length; return { q: '', fig: shape(k), fh: 16, a: String(SHAPES[k][2]) }; } }],
    [{ text: 'A regular polygon: find the order of rotational symmetry, then the smallest angle of turn (360° ÷ order).', gen: () => { const n = [3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36][ri(0, 13)]; return { q: `${n} sides`, a: `order ${n}, ${360 / n}°`, lines: [`order ${n}`, `360° ÷ ${n} = ${360 / n}°`] }; } }],
    [{ text: 'Compare the two kinds of symmetry for each shape.', gen: (i) => { const k = i % SHAPES.length; const [nm, ax, ord] = SHAPES[k]; return { q: `${/^[aeiou]/.test(nm) ? "an" : "a"} ${nm}`, a: `${ax} axes; order ${ord}`, lines: [`axes of symmetry: ${ax}`, `order of rotation: ${ord}`] }; } }],
  ],
  '6.05': ({ ri, pick }) => [
    [{ text: 'Classify the triangle by its angles: acute, right or obtuse.', gen: () => { const a = ri(4, 24) * 5, b = ri(4, 24) * 5, c = 180 - a - b; if (c < 15) return { q: '' }; return { q: `${a}°, ${b}°, ${c}°`, a: triAngles(a, b, c) }; } },
      { text: 'Classify the triangle by its sides: equilateral, isosceles or scalene.', gen: () => { const k = ri(0, 2), a = ri(3, 12); const s = k === 0 ? [a, a, a] : k === 1 ? [a, a, ri(2, 2 * a - 1)] : [a, a + ri(1, 3), a + ri(4, 6)]; if (k === 1 && s[2] === a) return { q: '' }; return { q: `${s.join(' cm, ')} cm`, a: triSides(...s) }; } }],
    [{ text: 'Classify the triangle by its angles and by its sides (equal marks show equal sides).', gen: (i) => { const k = i % 3; const e = ri(7, 15) * 5; const [A, B] = [[e, e], [ri(5, 9) * 5, 90], [ri(6, 10) * 5, ri(3, 5) * 5]][k]; if (k === 2 && (A === B || 180 - A - B === A || 180 - A - B === B)) return { q: '' }; const C = 180 - A - B, iso = A === B; return { q: '', fig: tri(A, B, [`${A}°`, `${B}°`, `${C}°`], { ticks: iso ? (A === 60 ? [[0, 1], [1, 1], [2, 1]] : [[1, 1], [2, 1]]) : [], right: B === 90 ? [1] : [] }), fh: 22, a: `${A === 60 && B === 60 ? 'equilateral' : iso ? 'isosceles' : 'scalene'}, ${triAngles(A, B, C)}`, lines: [`angles: ${triAngles(A, B, C)}`, `sides: ${A === 60 && B === 60 ? 'equilateral' : iso ? 'isosceles' : 'scalene'}`] }; } }],
    [{ text: 'Can the triangle be drawn? Write yes or no, and explain.', gen: (i) => { const L = [['a right-angled isosceles triangle', 'yes', '90°, 45°, 45°'], ['a triangle with two right angles', 'no', '90° + 90° = 180° leaves 0°'], ['an obtuse equilateral triangle', 'no', 'equilateral angles are all 60°'], ['a right-angled scalene triangle', 'yes', 'e.g. 90°, 60°, 30°'], ['a triangle with two obtuse angles', 'no', 'two angles over 90° add to over 180°'], ['an obtuse isosceles triangle', 'yes', 'e.g. 120°, 30°, 30°'], ['an acute scalene triangle', 'yes', 'e.g. 50°, 60°, 70°'], ['a right-angled equilateral triangle', 'no', 'equilateral angles are all 60°']]; const x = L[i % L.length]; return { q: x[0], a: `${x[1]}: ${x[2]}`, lines: [`${x[1]}`, `because: ${x[2]}`] }; } }],
  ],
  '6.06': ({ ri, pick }) => [
    [{ text: 'The angles of a triangle add to 180°. Find the third angle.', gen: () => { const a = ri(15, 120), b = ri(15, 160 - a); return { q: `${a}° and ${b}°`, a: `${180 - a - b}°` }; } }],
    [{ text: 'Find a. Write the equation first.', gen: () => { const A = ri(6, 14) * 5, B = ri(6, 16) * 5, C = 180 - A - B; if (C < 20) return { q: '' }; return { q: 'Find a.', fig: tri(A, B, [`${A}°`, `${B}°`, 'a°']), fh: 20, a: `a = ${C}`, lines: [`a + ${A} + ${B} = 180`, `a = 180 − ${A + B} = ${C}`] }; } }],
    [{ text: 'Isosceles triangles have two equal angles (opposite the equal sides). Find each pronumeral.', kinds: 2, gen: (i) => { if (i % 2 === 0) { const apex = ri(4, 30) * 4; const base = (180 - apex) / 2; return { q: `The apex angle is ${apex}°. Find the base angles x.`, a: `x = ${base}`, lines: [`2x + ${apex} = 180`, `2x = ${180 - apex}`, `x = ${base}`] }; } const base = ri(8, 17) * 5; return { q: `A base angle is ${base}°. Find the apex angle y.`, a: `y = ${180 - 2 * base}`, lines: [`y + ${base} + ${base} = 180`, `y = 180 − ${2 * base}`, `y = ${180 - 2 * base}`] }; } }],
  ],
  '6.07': ({ ri }) => [
    [{ text: 'The exterior angle equals the sum of the two interior opposite angles.', gen: () => { const a = ri(15, 90), b = ri(15, 160 - a); return { q: `interior opposite: ${a}° and ${b}°`, a: `${a + b}°` }; } }],
    [{ text: 'Find x, the exterior angle. Write the rule and the sum.', gen: () => { const A = ri(7, 14) * 5, B = ri(6, 14) * 5; if (A + B > 160) return { q: '' }; const fig = D.fit([[0, 22], [30, 22], [(30 * Math.tan(rad(B))) / (Math.tan(rad(A)) + Math.tan(rad(B))), 22 - (30 * Math.tan(rad(B)) * Math.tan(rad(A))) / (Math.tan(rad(A)) + Math.tan(rad(B)))]], { angles: [`${A}°`, '', `${B}°`].slice(0, 3), lines: [[[30, 22], [42, 22]]], labels: [['x°', 36, 19]] }, 4); return { q: `The interior opposite angles are ${A}° and ${B}°.`, fig: tri(A, 180 - A - B, [`${A}°`, '', `${B}°`], { lines: [[[34, 26], [44, 26]]], labels: [['x°', 38, 23]] }), fh: 20, a: `x = ${A + B}`, lines: [`x = ${A} + ${B} (exterior angle)`, `x = ${A + B}`] }; } }],
    [{ text: 'Use the exterior angle rule backwards to find the missing interior angle.', gen: () => { const e = ri(10, 34) * 5, a = ri(3, e / 5 - 2) * 5; return { q: `The exterior angle is ${e}° and one interior opposite angle is ${a}°. Find the other, y.`, a: `y = ${e - a}`, lines: [`y + ${a} = ${e}`, `y = ${e} − ${a}`, `y = ${e - a}`] }; } }],
  ],
  '6.08': ({ ri, pick }) => [
    [{ text: 'Name each quadrilateral from its description.', gen: (i) => { const L = [['4 equal sides and 4 right angles', 'square'], ['4 right angles, opposite sides equal', 'rectangle'], ['4 equal sides, no right angles', 'rhombus'], ['2 pairs of parallel sides, no right angles', 'parallelogram'], ['exactly 1 pair of parallel sides', 'trapezium'], ['2 pairs of equal adjacent sides', 'kite'], ['a rectangle with 4 equal sides', 'square'], ['a parallelogram with a right angle', 'rectangle'], ['a parallelogram with 4 equal sides', 'rhombus']]; const x = L[i % L.length]; return { q: x[0], a: x[1] }; } }],
    [{ text: 'Name the quadrilateral, then give one property it has.', gen: (i) => { const k = [0, 1, 2, 3, 5, 4][i % 6]; const nm = SHAPES[k][0] === 'isosceles trapezium' ? 'trapezium' : SHAPES[k][0]; const pr = QUADS.find((q) => q[0] === nm); return { q: '', fig: shape(k), fh: 17, a: `${nm}: ${pr[1]}`, lines: [`name: ${nm}`, `property: ${pr[1]}`] }; } }],
    [{ text: 'True or false? Give a reason.', gen: (i) => { const L = [['Every square is a rectangle.', 'true', 'it has 4 right angles and opposite sides equal'], ['Every rectangle is a square.', 'false', 'its sides need not all be equal'], ['Every rhombus is a parallelogram.', 'true', 'both pairs of opposite sides are parallel'], ['A kite is a parallelogram.', 'false', 'its opposite sides are not parallel'], ['Every square is a rhombus.', 'true', 'all four sides are equal'], ['A trapezium has two pairs of parallel sides.', 'false', 'it has exactly one pair']]; const x = L[i % L.length]; return { q: x[0], a: `${x[1]}: ${x[2]}`, lines: [x[1], `because ${x[2]}`] }; } }],
  ],
  '6.09': ({ ri }) => [
    [{ text: 'The angles of a quadrilateral add to 360°. Find the fourth angle.', gen: () => { const a = ri(10, 28) * 5, b = ri(10, 28) * 5, c = ri(10, 28) * 5, d = 360 - a - b - c; return d < 30 || d > 200 ? { q: '' } : { q: `${a}°, ${b}°, ${c}°`, a: `${d}°` }; } }],
    [{ text: 'Find a. Write the equation first.', gen: () => { const a = ri(14, 22) * 5, b = ri(14, 22) * 5, c = ri(14, 22) * 5, d = 360 - a - b - c; if (d < 60 || d > 150) return { q: '' }; return { q: 'Find a. (Not to scale.)', fig: D.fit([[0, 22], [34, 22], [28, 0], [6, 4]], { angles: [`${a}°`, `${b}°`, `${c}°`, 'a°'], angleDist: 6 }, 4), fh: 20, a: `a = ${d}`, lines: [`a + ${a} + ${b} + ${c} = 360`, `a = 360 − ${a + b + c} = ${d}`] }; } }],
    [{ text: 'Use the properties of the shape, then the angle sum of 360°.', kinds: 2, gen: (i) => { if (i % 2 === 0) { const g = ri(8, 32) * 5; if (g === 90) return { q: '' }; return { q: `A parallelogram has an angle of ${g}°. Find the other three angles.`, a: `${180 - g}°, ${g}°, ${180 - g}°`, lines: [`opposite angle: ${g}°`, `co-interior: 180 − ${g} = ${180 - g}°`, `angles: ${g}°, ${180 - g}°, ${g}°, ${180 - g}°`] }; } const a = ri(14, 26) * 5, b = ri(8, 20) * 5, r = 360 - a - b; if (r % 2) return { q: '' }; return { q: `A kite has two equal angles x°, and its other angles are ${a}° and ${b}°. Find x.`, a: `x = ${r / 2}`, lines: [`2x + ${a} + ${b} = 360`, `2x = ${r}`, `x = ${r / 2}`] }; } }],
  ],
  '6.10': ({ ri }) => [
    [{ text: 'True or false?', gen: (i) => { const L = [['The diagonals of a rectangle are equal.', 'true'], ['The diagonals of a rhombus meet at 90°.', 'true'], ['The diagonals of a parallelogram are equal.', 'false'], ['A square has equal diagonals that meet at 90°.', 'true'], ['Opposite sides of a parallelogram are equal.', 'true'], ['A kite has two pairs of equal opposite sides.', 'false'], ['The diagonals of a parallelogram bisect each other.', 'true'], ['A rhombus has equal diagonals.', 'false'], ['The diagonals of a kite meet at 90°.', 'true'], ['Every angle of a rectangle is 90°.', 'true'], ['A trapezium always has a right angle.', 'false'], ['Co-interior angles of a parallelogram add to 180°.', 'true']]; const x = L[i % L.length]; return { q: x[0], a: x[1] }; } }],
    [{ text: 'Use the properties to find the missing value.', gen: (i) => { const a = ri(4, 15), g = ri(8, 32) * 5; const L = [
      [`A rectangle has one diagonal ${a} cm. How long is the other?`, `${a} cm`, ['rectangle: diagonals are equal', `${a} cm`]],
      [`A rhombus has a side of ${a} cm. Find its perimeter.`, `${4 * a} cm`, ['rhombus: all sides equal', `4 × ${a} = ${4 * a} cm`]],
      [`A parallelogram has an angle of ${g}°. Find the angle next to it.`, `${180 - g}°`, ['co-interior angles add to 180°', `180 − ${g} = ${180 - g}°`]],
      [`A square has a perimeter of ${4 * a} cm. Find a side.`, `${a} cm`, ['square: all sides equal', `${4 * a} ÷ 4 = ${a} cm`]],
      [`A rhombus has an angle of ${g}°. Find the opposite angle.`, `${g}°`, ['rhombus: opposite angles are equal', `${g}°`]],
    ][i % 5]; return g === 90 ? { q: '' } : { q: L[0], a: L[1], lines: L[2] }; } }],
    [{ text: 'Give a reason why each statement is true.', gen: (i) => { const L = [['A square is a rectangle.', 'it has four right angles', 'and opposite sides equal'], ['A square is a rhombus.', 'it has four equal sides', 'and opposite sides parallel'], ['A rhombus is a parallelogram.', 'both pairs of opposite sides', 'are parallel'], ['A rectangle is a parallelogram.', 'both pairs of opposite sides', 'are parallel and equal'], ['A rhombus is a kite.', 'it has two pairs of', 'equal adjacent sides'], ['A square is a kite.', 'it has two pairs of', 'equal adjacent sides']]; const x = L[i % L.length]; return { q: x[0], a: `${x[1]} ${x[2]}`, lines: [`because ${x[1]}`, x[2]] }; } }],
  ],
};
