// Lesson 2.4 Area (two pages: Easy, then Medium). See lib/lesson-two.js for the fields.
// Every question is a labelled diagram (helpers.js); the Medium page ends with word problems.
const { area, money, problems, rect, square, rightTri, tri, para, trap, rhombus } = require('../helpers');

// A round of diagram questions: shapes(text, [[...numbers, unit], ...], draw, area formula)
const shapes = (text, list, draw, A, o = {}) => ({ text, items: list.map((v) => ({ t: '', fig: draw(...v) })), ans: list.map((v) => area(A(...v), v.find((x) => typeof x === 'string'))), cols: 4, figs: true, prefix: 'A =', ...o });
// Two kinds of shape in one round.
const mix = (text, a, b) => ({ ...a, text, items: [...a.items, ...b.items], ans: [...a.ans, ...b.ans] });
const EASY = { figH: 22 }; // page 1 also holds the lesson header, so its diagram cards are a little shorter
const R = (b, h) => b * h;
const Sq = (s) => s * s;
const Tri = (b, h) => (b * h) / 2;
const Trap = (a, b, h) => ((a + b) / 2) * h;
const Rh = (x, y) => (x * y) / 2;

module.exports = {
  code: '2.4', title: 'Area',
  li: 'find the area of common shapes, from rectangles to trapeziums.',
  sc: ['find the area of squares, rectangles and triangles', 'find the area of parallelograms, trapeziums and rhombuses', 'write area in square units (cm², m²)'],
  easy: {
    ex: { stem: 'Find the area of each shape. Area is measured in square units (cm², m²).', parts: [
      { t: 'Rectangle', fig: rect(8, 5, 'cm') }, { t: 'Square', fig: square(6, 'm') }, { t: 'Right-angled triangle', fig: rightTri(10, 4, 'cm') }, { t: 'Triangle', fig: tri(12, 7, 'm') }] },
    exAns: [`8 × 5 = ${area(R(8, 5), 'cm')}`, `6 × 6 = ${area(Sq(6), 'm')}`, `½ × 10 × 4 = ${area(Tri(10, 4), 'cm')}`, `½ × 12 × 7 = ${area(Tri(12, 7), 'm')}`],
    hint: 'Rectangle: A = length × width · Square: A = side × side · Triangle: A = ½ × base × height (the height meets the base at a right angle).',
    rounds: [
      mix('find the area of each rectangle and square.', shapes('', [[6, 4, 'cm'], [10, 3, 'm']], rect, R, EASY), shapes('', [[4, 'cm'], [9, 'm']], square, Sq)),
      shapes('find the area of each right-angled triangle.', [[8, 6, 'cm'], [10, 5, 'm'], [4, 9, 'cm'], [12, 3, 'mm']], rightTri, Tri, EASY),
      shapes('find the area of each triangle. Use the dashed height.', [[10, 6, 'cm'], [8, 5, 'm'], [14, 4, 'cm'], [6, 9, 'mm']], tri, Tri, EASY),
    ],
  },
  medium: {
    ex: { stem: 'Use the perpendicular height (the dashed line), not the slanted side.', parts: [
      { t: 'Parallelogram', fig: para(9, 4, 'cm') }, { t: 'Parallelogram', fig: para(10, 6, 'm', 7) }, { t: 'Trapezium', fig: trap(4, 6, 6, 'cm') }, { t: 'Rhombus', fig: rhombus(10, 6, 'cm') }] },
    exAns: [`9 × 4 = ${area(R(9, 4), 'cm')}`, `10 × 6 = ${area(R(10, 6), 'm')} (not 7)`, `½ × (4 + 6) × 6 = ${area(Trap(4, 6, 6), 'cm')}`, `½ × 10 × 6 = ${area(Rh(10, 6), 'cm')}`],
    hint: 'Parallelogram: A = base × height · Trapezium: A = ½ × (a + b) × h · Rhombus: A = ½ × x × y (x and y are the diagonals).',
    rounds: [
      shapes('find the area of each parallelogram.', [[7, 3, 'cm'], [12, 5, 'm', 6], [8, 8, 'mm'], [15, 4, 'cm', 5]], para, R),
      shapes('find the area of each trapezium.', [[3, 7, 4, 'cm'], [5, 9, 6, 'm'], [6, 10, 3, 'cm'], [2, 8, 5, 'mm']], trap, Trap),
      shapes('find the area of each rhombus.', [[8, 6, 'cm'], [12, 4, 'm'], [10, 10, 'mm'], [7, 4, 'cm']], rhombus, Rh),
      problems('solve each problem. Show your working.', [
        ['A rectangular lawn is 12 m long and 8 m wide. Turf costs $15 for each m². How much does it cost to turf the lawn?', `${area(R(12, 8), 'm')}, ${money(R(12, 8) * 15)}`],
        ['A triangular sail has a base of 3 m and a height of 5 m. Find the area of the sail.', area(Tri(3, 5), 'm')],
      ]),
    ],
  },
};
