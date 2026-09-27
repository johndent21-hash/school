// Skill drill pages for Chapter 6 Geometrical figures: page 1 practises the Easy basics, page 2 the Medium basics (lib/drill.js).
const P = (x, y, N) => `(${N(x)}, ${N(y)})`;
const triAngles = (a, b, c) => (a === 90 || b === 90 || c === 90 ? 'right' : a > 90 || b > 90 || c > 90 ? 'obtuse' : 'acute');
const triSides = (a, b, c) => (a === b && b === c ? 'equilateral' : a === b || b === c || a === c ? 'isosceles' : 'scalene');

// Angles written with x that add to total (180 for a triangle, 360 for a quadrilateral): e.g. x°, 2x°, 3x°.
const angleSum = (total, ri, pick) => {
  const n = total === 180 ? 3 : 4, x = ri(10, 80);
  const parts = Array.from({ length: n - 1 }, () => pick([[1, 0], [2, 0], [3, 0], [1, ri(1, 6) * 5], [2, ri(1, 4) * 5]]));
  const used = parts.reduce((t, [m, c]) => t + m * x + c, 0), last = total - used;
  if (last < 10 || parts.some(([m, c]) => m * x + c >= 180)) return ['', ''];
  const show = ([m, c]) => `${m === 1 ? '' : m}<i>x</i>${c ? ` + ${c}` : ''}°`;
  return [[...parts.map(show), `${last}°`].join(', '), `x = ${x}`];
};
const SHAPES = [['square', 4, 4], ['rectangle', 2, 2], ['rhombus', 2, 2], ['parallelogram', 0, 2], ['kite', 1, 1], ['isosceles trapezium', 1, 1], ['equilateral triangle', 3, 3], ['isosceles triangle', 1, 1],
  ['scalene triangle', 0, 1], ['regular pentagon', 5, 5], ['regular hexagon', 6, 6], ['regular octagon', 8, 8], ['circle', 'infinitely many', 'infinite'], ['semicircle', 1, 1]];
// Capital letters: [letter, axes of symmetry, order of rotational symmetry]
const LETTERS = [['A', 1, 1], ['B', 1, 1], ['C', 1, 1], ['D', 1, 1], ['E', 1, 1], ['F', 0, 1], ['H', 2, 2], ['I', 2, 2], ['M', 1, 1], ['N', 0, 2], ['O', 2, 2], ['S', 0, 2], ['T', 1, 1], ['U', 1, 1], ['V', 1, 1], ['W', 1, 1], ['X', 2, 2], ['Z', 0, 2], ['L', 0, 1], ['K', 1, 1], ['Y', 1, 1]];

module.exports = {
  '6.01': ({ round, ri, pick, N }) => ({
    easy: [
      round('translate (slide) the point. Write where it ends up.', 24, () => { const x = ri(-6, 6), y = ri(-6, 6), dx = ri(1, 6) * pick([1, -1]), dy = ri(0, 6) * pick([1, -1]); const w = `${Math.abs(dx)} ${dx > 0 ? 'right' : 'left'}${dy ? `, ${Math.abs(dy)} ${dy > 0 ? 'up' : 'down'}` : ''}`; return [`${P(x, y, N)}: ${w}`, P(x + dx, y + dy, N)]; }, { cols: 3 }),
      round('reflect (flip) the point in the axis given.', 16, () => { const x = ri(-8, 8), y = ri(-8, 8), ax = pick(['x', 'y']); return !x || !y ? ['', ''] : [`${P(x, y, N)} in the ${ax}-axis`, ax === 'x' ? P(x, -y, N) : P(-x, y, N)]; }),
    ],
    medium: [
      round('rotate (turn) the point about the origin.', 15, () => { const x = ri(-6, 6), y = ri(-6, 6), t = pick(['90° clockwise', '90° anticlockwise', '180°']); if (!x || !y) return ['', '']; const r = t === '180°' ? [-x, -y] : t === '90° clockwise' ? [y, -x] : [-y, x]; return [`${P(x, y, N)}, ${t}`, P(r[0], r[1], N)]; }, { cols: 3 }),
      round('name the transformation that moves the first point to the second.', 15, () => { const x = ri(1, 7) * pick([1, -1]), y = ri(1, 7) * pick([1, -1]), k = ri(0, 3); if (x === y || x === -y) return ['', '']; const to = [[x, -y], [-x, y], [-x, -y], [x + 3, y]][k]; return [`${P(x, y, N)} → ${P(to[0], to[1], N)}`, ['reflection in the x-axis', 'reflection in the y-axis', 'rotation of 180° about O', 'translation 3 right'][k]]; }, { cols: 3 }),
    ],
  }),
  '6.02': ({ round, ri, pick, list, N }) => ({
    easy: [
      list('name the transformation: translation, reflection or rotation.', [['a slide', 'translation'], ['a flip', 'reflection'], ['a turn', 'rotation'], ['a mirror image', 'reflection'], ['moving 5 units up', 'translation'],
        ['turning 90° about a point', 'rotation'], ['a clock hand moving', 'rotation'], ['your reflection in a lake', 'reflection'], ['a lift going up', 'translation'], ['a wheel turning', 'rotation'], ['a car driving straight', 'translation'],
        ['a butterfly\'s two wings', 'reflection'], ['a door opening', 'rotation'], ['a chess rook moving', 'translation']], { cols: 2 }),
      round('two translations. Write the single translation that does the same.', 15, () => { const a = ri(1, 7), b = ri(1, 7), d1 = pick(['right', 'left']), d2 = pick(['right', 'left']); const t = (d1 === 'right' ? a : -a) + (d2 === 'right' ? b : -b); return [`${a} ${d1}, then ${b} ${d2}`, t === 0 ? 'no movement' : `${Math.abs(t)} ${t > 0 ? 'right' : 'left'}`]; }, { cols: 3 }),
    ],
    medium: [
      round('do both transformations in order. Where does the point end up?', 12, () => { const x = ri(-5, 5), y = ri(-5, 5), dx = ri(1, 5), ax = pick(['x', 'y']); if (!x || !y) return ['', '']; const [tx, ty] = [x + dx, y]; return [`${P(x, y, N)}: ${dx} right, then reflect in the ${ax}-axis`, ax === 'x' ? P(tx, -ty, N) : P(-tx, ty, N)]; }, { cols: 2 }),
      round('the point moved from the first position to the second. Describe the single translation.', 12, () => { const x = ri(-6, 6), y = ri(-6, 6), dx = ri(-6, 6), dy = ri(-6, 6); if (!dx && !dy) return ['', '']; return [`${P(x, y, N)} → ${P(x + dx, y + dy, N)}`, [dx ? `${Math.abs(dx)} ${dx > 0 ? 'right' : 'left'}` : '', dy ? `${Math.abs(dy)} ${dy > 0 ? 'up' : 'down'}` : ''].filter(Boolean).join(', ')]; }, { cols: 3 }),
    ],
  }),
  '6.03': ({ list, round, ri }) => ({
    easy: [
      list('how many axes (lines) of symmetry?', SHAPES.map(([s, a]) => [s, a]), { cols: 3 }),
      list('how many axes of symmetry does each capital letter have?', LETTERS.slice(0, 20).map(([l, a]) => [`<b style="font-size:12pt">${l}</b>`, a]), { cols: 5 }),
    ],
    medium: [
      round('how many axes of symmetry does a regular polygon with this many sides have?', 16, () => { const n = ri(3, 20); return [`${n} sides`, n]; }),
      list('true or false?', [['A square has 4 axes of symmetry.', 'true'], ['Every triangle has an axis of symmetry.', 'false'], ['A parallelogram has 2 axes of symmetry.', 'false'], ['A kite has 1 axis of symmetry.', 'true'],
        ['A regular hexagon has 6 axes of symmetry.', 'true'], ['A rectangle\'s diagonals are axes of symmetry.', 'false'], ['A circle has infinitely many axes of symmetry.', 'true'], ['An isosceles triangle has 1 axis of symmetry.', 'true'],
        ['A rhombus\'s diagonals are axes of symmetry.', 'true'], ['The letter N has an axis of symmetry.', 'false'], ['A scalene triangle has no axes of symmetry.', 'true'], ['A regular octagon has 4 axes of symmetry.', 'false']], { cols: 2 }),
    ],
  }),
  '6.04': ({ list, round, ri }) => ({
    easy: [
      list('order of rotational symmetry (write 1 for none).', SHAPES.map(([s, , o]) => [s, o]), { cols: 3 }),
      list('order of rotational symmetry of each capital letter (write 1 for none).', LETTERS.slice(0, 20).map(([l, , o]) => [`<b style="font-size:12pt">${l}</b>`, o]), { cols: 5 }),
    ],
    medium: [
      round('a regular polygon has this many sides. Write its order of rotational symmetry and the smallest angle of turn.', 15, () => { const n = [3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36, 40, 45][ri(0, 15)]; return [`${n} sides`, `order ${n}, ${360 / n}°`]; }, { cols: 3 }),
      list('true or false?', [['A square has rotational symmetry of order 4.', 'true'], ['A rectangle has rotational symmetry of order 4.', 'false'], ['A parallelogram has rotational symmetry.', 'true'], ['A kite has rotational symmetry.', 'false'],
        ['The letter S has rotational symmetry of order 2.', 'true'], ['An equilateral triangle turns onto itself every 120°.', 'true'], ['Every shape has rotational symmetry of at least order 1.', 'true'], ['A regular pentagon turns onto itself every 60°.', 'false'],
        ['A shape with order 2 looks the same upside down.', 'true'], ['The letter T has rotational symmetry of order 2.', 'false'], ['A rhombus has order 2.', 'true'], ['A regular hexagon has order 6.', 'true']], { cols: 2 }),
    ],
  }),
  '6.05': ({ round, ri, pick }) => ({
    easy: [
      round('classify by angles: acute, right or obtuse.', 24, () => { const a = ri(20, 120), b = ri(20, 180 - a - 10), c = 180 - a - b; return c < 5 ? ['', ''] : [`${a}°, ${b}°, ${c}°`, triAngles(a, b, c)]; }),
      round('classify by sides: equilateral, isosceles or scalene.', 16, () => { const k = ri(0, 2), a = ri(3, 12); const s = k === 0 ? [a, a, a] : k === 1 ? [a, a, ri(2, 2 * a - 1)] : [a, a + ri(1, 3), a + ri(4, 6)]; return [`${s.join(' cm, ')} cm`, triSides(...s)]; }),
    ],
    medium: [
      round('classify by sides and by angles.', 15, () => { const k = ri(0, 3); const [ang, sid] = [[[60, 60, 60], 'equilateral'], [[90, 45, 45], 'isosceles'], [[ri(35, 80), 0, 0], 'isosceles'], [[ri(95, 130), ri(20, 40), 0], 'scalene']][k]; let [a, b] = ang; let c; if (k === 2) { b = (180 - a) / 2; if (!Number.isInteger(b)) return ['', '']; c = b; } else if (k === 3) c = 180 - a - b; else c = ang[2]; return [`angles ${a}°, ${b}°, ${c}°`, `${sid}, ${triAngles(a, b, c)}`]; }, { cols: 3 }),
      round('is it possible to draw this triangle? Write yes or no.', 12, () => { const t = pick([['a right-angled isosceles triangle', 'yes'], ['a triangle with two right angles', 'no'], ['an obtuse equilateral triangle', 'no'], ['a right-angled scalene triangle', 'yes'], ['an acute isosceles triangle', 'yes'],
        ['a triangle with angles 90°, 60° and 40°', 'no'], ['an obtuse isosceles triangle', 'yes'], ['a triangle with two obtuse angles', 'no'], ['a triangle with sides 3 cm, 4 cm and 10 cm', 'no'], ['an acute scalene triangle', 'yes'],
        ['a triangle with angles 100°, 40°, 40°', 'yes'], ['a right-angled equilateral triangle', 'no'], ['a triangle with sides 5 cm, 5 cm and 9 cm', 'yes'], ['a triangle with angles 30°, 60°, 90°', 'yes']]); return t; }, { cols: 2 }),
    ],
  }),
  '6.06': ({ round, ri, pick }) => ({
    easy: [
      round('two angles of a triangle are given. Find the third. (Angles add to 180°.)', 24, () => { const a = ri(15, 120), b = ri(15, 165 - a); return [`${a}° and ${b}°`, `${180 - a - b}°`]; }),
      round('a right-angled triangle has this angle. Find the other one.', 16, () => { const a = ri(5, 85); return [`${a}°`, `${90 - a}°`]; }),
    ],
    medium: [
      round('isosceles triangle: find the missing angles.', 16, () => { if (ri(0, 1)) { const apex = ri(10, 160); return apex % 2 ? ['', ''] : [`apex angle ${apex}°`, `${(180 - apex) / 2}° and ${(180 - apex) / 2}°`]; } const base = ri(20, 85); return [`base angle ${base}°`, `apex ${180 - 2 * base}°, other base ${base}°`]; }, { cols: 2 }),
      round('the angles of a triangle are given. Find x.', 12, () => angleSum(180, ri, pick), { cols: 3 }),
    ],
  }),
  '6.07': ({ round, ri }) => ({
    easy: [
      round('the two interior opposite angles are given. Find the exterior angle (add them).', 24, () => { const a = ri(15, 100), b = ri(15, 160 - a); return [`${a}° and ${b}°`, `${a + b}°`]; }),
      round('an exterior angle is given. Find the interior angle next to it.', 16, () => { const e = ri(20, 170); return [`${e}°`, `${180 - e}°`]; }),
    ],
    medium: [
      round('the exterior angle and one interior opposite angle are given. Find the other interior opposite angle.', 16, () => { const e = ri(50, 170), a = ri(10, e - 10); return [`exterior ${e}°, ${a}°`, `${e - a}°`]; }, { cols: 2 }),
      round('find x. The exterior angle equals the sum of the interior opposite angles.', 12, () => { const a = ri(20, 70), x = ri(15, 80); return [`exterior ${a + x}°, interior opposite ${a}° and <i>x</i>°`, `x = ${x}`]; }, { cols: 3 }),
    ],
  }),
  '6.08': ({ list }) => ({
    easy: [
      list('name the quadrilateral.', [['4 equal sides and 4 right angles', 'square'], ['4 right angles, opposite sides equal', 'rectangle'], ['4 equal sides, no right angles', 'rhombus'], ['2 pairs of parallel sides', 'parallelogram'],
        ['exactly 1 pair of parallel sides', 'trapezium'], ['2 pairs of equal adjacent sides', 'kite'], ['a rectangle with 4 equal sides', 'square'], ['a parallelogram with a right angle', 'rectangle'], ['a parallelogram with 4 equal sides', 'rhombus'],
        ['a trapezium with equal legs', 'isosceles trapezium'], ['diagonals cross at 90° and one diagonal bisects the other', 'kite'], ['opposite angles equal, no right angles, sides not all equal', 'parallelogram']], { cols: 2 }),
      list('true or false?', [['Every square is a rectangle.', 'true'], ['Every rectangle is a square.', 'false'], ['Every square is a rhombus.', 'true'], ['Every rhombus is a parallelogram.', 'true'], ['A kite is a parallelogram.', 'false'],
        ['A trapezium has two pairs of parallel sides.', 'false'], ['Every rectangle is a parallelogram.', 'true'], ['A rhombus has 4 right angles.', 'false'], ['A quadrilateral has 4 sides.', 'true'], ['Every parallelogram is a rectangle.', 'false']], { cols: 2 }),
    ],
    medium: [
      list('how many pairs of parallel sides? How many right angles?', [['square', '2 pairs, 4'], ['rectangle', '2 pairs, 4'], ['rhombus', '2 pairs, 0'], ['parallelogram', '2 pairs, 0'], ['trapezium', '1 pair, 0 (a right trapezium has 2)'], ['kite', '0 pairs, 0'],
        ['isosceles trapezium', '1 pair, 0']], { cols: 3 }),
      list('name the most specific quadrilateral.', [['a quadrilateral with 2 pairs of parallel sides and equal diagonals', 'rectangle'], ['a rhombus with a right angle', 'square'], ['a quadrilateral with one pair of parallel sides and equal legs', 'isosceles trapezium'],
        ['a quadrilateral whose diagonals bisect each other at right angles', 'rhombus'], ['a quadrilateral whose diagonals bisect each other', 'parallelogram'], ['a kite with 4 equal sides', 'rhombus'], ['a quadrilateral whose diagonals are equal and bisect each other at 90°', 'square'],
        ['a quadrilateral with only one diagonal as an axis of symmetry', 'kite']], { cols: 2 }),
    ],
  }),
  '6.09': ({ round, ri, pick }) => ({
    easy: [
      round('three angles of a quadrilateral are given. Find the fourth. (Angles add to 360°.)', 24, () => { const a = ri(50, 140), b = ri(50, 140), c = ri(50, 140), d = 360 - a - b - c; return d < 20 || d > 250 ? ['', ''] : [`${a}°, ${b}°, ${c}°`, `${d}°`]; }, { cols: 3 }),
      round('a parallelogram has this angle. Find the other three angles.', 12, () => { const a = ri(20, 170); return a === 90 ? ['', ''] : [`${a}°`, `${180 - a}°, ${a}°, ${180 - a}°`]; }, { cols: 3 }),
    ],
    medium: [
      round('a kite has two equal opposite angles, x. Find x.', 12, () => { const a = ri(40, 150), b = ri(30, 150); const r = 360 - a - b; return r % 2 || r < 40 ? ['', ''] : [`other angles ${a}° and ${b}°`, `x = ${r / 2}`]; }, { cols: 3 }),
      round('the angles of a quadrilateral are given. Find x.', 12, () => angleSum(360, ri, pick), { cols: 3 }),
    ],
  }),
  '6.10': ({ list }) => ({
    easy: [
      list('true or false?', [['The diagonals of a rectangle are equal.', 'true'], ['The diagonals of a rhombus meet at 90°.', 'true'], ['The diagonals of a parallelogram are equal.', 'false'], ['The diagonals of a square are equal and meet at 90°.', 'true'],
        ['The opposite sides of a parallelogram are equal.', 'true'], ['The opposite angles of a rhombus are equal.', 'true'], ['A kite has two pairs of equal opposite sides.', 'false'], ['The diagonals of a parallelogram bisect each other.', 'true'],
        ['A trapezium always has a right angle.', 'false'], ['The diagonals of a kite meet at 90°.', 'true'], ['All the angles of a rectangle are 90°.', 'true'], ['A rhombus has equal diagonals.', 'false'], ['Co-interior angles in a parallelogram add to 180°.', 'true'],
        ['The diagonals of a rhombus bisect its angles.', 'true'], ['A square is a special kite.', 'true'], ['The adjacent sides of a rectangle are always equal.', 'false']], { cols: 2 }),
      list('which quadrilaterals have this property? Name all you know.', [['diagonals are equal', 'square, rectangle, isosceles trapezium'], ['diagonals meet at 90°', 'square, rhombus, kite'], ['all sides equal', 'square, rhombus'],
        ['opposite angles equal', 'square, rectangle, rhombus, parallelogram'], ['diagonals bisect each other', 'square, rectangle, rhombus, parallelogram'], ['exactly one pair of parallel sides', 'trapezium']], { cols: 2 }),
    ],
    medium: [
      list('use the properties to find the missing value.', [['rectangle: one diagonal is 13 cm. The other?', '13 cm'], ['rhombus: one side is 7 cm. The perimeter?', '28 cm'], ['parallelogram: one angle is 70°. The angle next to it?', '110°'],
        ['square: diagonals meet at what angle?', '90°'], ['rhombus: one angle is 50°. The opposite angle?', '50°'], ['rectangle: half a diagonal is 6 cm. The whole diagonal?', '12 cm'], ['kite: angles 100°, 80°, 80°. The fourth?', '100°'],
        ['parallelogram: sides 9 cm and 5 cm. The perimeter?', '28 cm'], ['rhombus: perimeter 36 cm. One side?', '9 cm'], ['isosceles trapezium: one base angle is 65°. The other base angle?', '65°'],
        ['square: perimeter 48 cm. The side?', '12 cm'], ['parallelogram: one angle is 125°. The opposite angle?', '125°']], { cols: 2 }),
      list('give a reason: why is each statement true?', [['A square is a rectangle.', 'it has 4 right angles and opposite sides equal'], ['A square is a rhombus.', 'it has 4 equal sides'], ['A rhombus is a parallelogram.', 'both pairs of opposite sides are parallel'],
        ['A rectangle is a parallelogram.', 'both pairs of opposite sides are parallel'], ['A rhombus is a kite.', 'it has two pairs of equal adjacent sides'], ['A square is a kite.', 'it has two pairs of equal adjacent sides']], { cols: 2 }),
    ],
  }),
};
