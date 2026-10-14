// Lesson 2.6 Surface area (two pages: Easy, then Medium). See lib/lesson-two.js for the fields.
// Easy: cubes and rectangular prisms (6 faces in 3 matching pairs). Medium: triangular prisms (2 triangles + 3
// rectangles); the page ends with word problems. Every question is a labelled prism (drawn below).
// From the Chapter 2 review: the summary's triangular prism (3 m, 4 m, 5 m, length 6 m: 84 m², the Medium WE DO), the
// rectangular prism 10 cm × 4 cm × 2 cm (short-answer 7b) and the triangular prism 9 m, 12 m, 15 m, length 20 m (7a).
const { fmt, problems, cuboid, triPrism } = require('../helpers');

// ---------- answers ----------
const sa = (v, u) => `${fmt(v)} ${u}²`;
const box = (l, w, h) => 2 * (l * w + l * h + w * h);
// '2 × 40 + 2 × 20 + 2 × 8 = 136 cm²' (top, front, side)
const boxW = (l, w, h, u) => `2 × ${fmt(l * w)} + 2 × ${fmt(l * h)} + 2 × ${fmt(w * h)} = ${sa(box(l, w, h), u)}`;
const cubeW = (s, u) => `6 × ${fmt(s)} × ${fmt(s)} = ${sa(6 * s * s, u)}`;
// A triangular prism: the triangle's base b and height h, its three sides, and the prism's length L.
const tri = (b, h, sides, L) => 2 * (b * h) / 2 + L * sides.reduce((t, s) => t + s, 0);
const triW = (b, h, sides, L, u) => `2 × ${fmt((b * h) / 2)} + ${sides.map((s) => `${fmt(L)} × ${fmt(s)}`).join(' + ')} = ${sa(tri(b, h, sides, L), u)}`;

// ---------- the questions ----------
const cards = (text, list, o = {}) => ({ text, figs: true, cols: 4, prefix: 'SA =', items: list.map((x) => ({ t: '', fig: x.fig })), ans: list.map((x) => x.ans), ...o });
const EASY = { figH: 22 }; // page 1 also holds the lesson header, so its diagram cards are a little shorter
const cubeQ = (s, u) => ({ fig: cuboid(s, s, s, u), ans: cubeW(s, u) });
const boxQ = (l, w, h, u) => ({ fig: cuboid(l, w, h, u), ans: boxW(l, w, h, u) });
// right-angled ends: legs b (base) and h, slanted side c · isosceles ends: base b, height h, equal sides s
const rightQ = (b, h, c, L, u) => ({ fig: triPrism(b, h, c, L, u), ans: triW(b, h, [b, h, c], L, u) });
const isoQ = (b, h, s, L, u) => ({ fig: triPrism(b, h, s, L, u, false), ans: triW(b, h, [b, s, s], L, u) });

const EX = { b: 4, h: 3, c: 5, L: 6, u: 'm' }; // the review summary's prism (b and h are the two shorter sides)

module.exports = {
  code: '2.6', title: 'Surface area',
  li: 'find the surface area of a prism by adding the areas of all its faces.',
  sc: ['find the surface area of a cube', 'find the surface area of a rectangular prism', 'find the surface area of a triangular prism'],
  easy: {
    ex: { stem: 'Surface area (SA) = the total area of all the faces. A rectangular prism has 6 faces in 3 matching pairs.', parts: [
      { t: 'Cube', fig: cuboid(3, 3, 3, 'cm') }, { t: 'Cube', fig: cuboid(5, 5, 5, 'm') }, { t: 'Rectangular prism', fig: cuboid(5, 3, 2, 'cm') }, { t: 'Rectangular prism', fig: cuboid(8, 2, 5, 'm') }] },
    exAns: [cubeW(3, 'cm'), cubeW(5, 'm'), boxW(5, 3, 2, 'cm'), boxW(8, 2, 5, 'm')],
    hint: 'SA = 2 × top + 2 × front + 2 × side (top = length × width, front = length × height, side = width × height) · Cube: SA = 6 × side × side.',
    rounds: [
      cards('find the surface area of each cube.', [cubeQ(2, 'cm'), cubeQ(4, 'm'), cubeQ(10, 'mm'), cubeQ(6, 'cm')], EASY),
      cards('find the surface area of each rectangular prism.', [boxQ(10, 2, 4, 'cm'), boxQ(6, 2, 3, 'm'), boxQ(5, 5, 2, 'cm'), boxQ(7, 1, 2, 'm')], EASY),
      cards('find the surface area of each rectangular prism.', [boxQ(12, 3, 5, 'cm'), boxQ(9, 4, 4, 'mm'), boxQ(20, 5, 10, 'cm'), boxQ(3, 3, 8, 'm')], EASY),
    ],
  },
  medium: {
    ex: { stem: 'A triangular prism has 5 faces: 2 triangles and 3 rectangles. Add them all.', fig: triPrism(EX.b, EX.h, EX.c, EX.L, EX.u), parts: [
      'How many faces does a triangular prism have?', 'Find the area of one triangle.', 'Find the area of the three rectangles.', 'Find the surface area.'] },
    exAns: ['5 faces: 2 triangles and 3 rectangles', `½ × ${EX.b} × ${EX.h} = ${sa((EX.b * EX.h) / 2, EX.u)}`,
      `${[EX.b, EX.h, EX.c].map((s) => `${EX.L} × ${s}`).join(' + ')} = ${sa(EX.L * (EX.b + EX.h + EX.c), EX.u)}`, triW(EX.b, EX.h, [EX.b, EX.h, EX.c], EX.L, EX.u)],
    hint: 'Each triangle: ½ × base × height · Each rectangle: the prism’s length × one side of the triangle · SA = 2 triangles + 3 rectangles.',
    rounds: [
      cards('find the surface area of each triangular prism (right-angled ends).', [rightQ(4, 3, 5, 10, 'cm'), rightQ(8, 6, 10, 5, 'm'), rightQ(12, 5, 13, 2, 'cm'), rightQ(12, 9, 15, 20, 'm')]),
      cards('find the surface area of each triangular prism. The dashed line is the height.', [isoQ(6, 4, 5, 10, 'cm'), isoQ(8, 3, 5, 6, 'm'), isoQ(10, 12, 13, 4, 'cm'), isoQ(16, 6, 10, 5, 'mm')]),
      cards('rectangular or triangular prism? Find each surface area.', [boxQ(2.5, 2, 4, 'm'), rightQ(6, 8, 10, 3, 'cm'), boxQ(1.5, 1, 2, 'm'), rightQ(5, 12, 13, 10, 'mm')]),
      problems('solve each problem. Show your working.', [
        ((s) => [`A gift box is a cube with sides of ${fmt(s)} cm. How much wrapping paper covers the whole box (with no overlap)?`, cubeW(s, 'cm')])(20),
        ((l, w, h) => [`A wooden box is ${fmt(l)} cm long, ${fmt(w)} cm wide and ${fmt(h)} cm high. Every face is painted. What area is painted?`, boxW(l, w, h, 'cm')])(50, 30, 20),
      ]),
    ],
  },
};
