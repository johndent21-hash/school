// Lesson 2.7 Volume and capacity (two pages: Easy, then Medium). See lib/lesson-two.js for the fields.
// Easy: rectangular prisms and cubes, V = length × width × height. Medium: triangular prisms (V = area of the end ×
// length), cylinders (V = π × r² × h, to 1 decimal place) and capacity (1 cm³ = 1 mL, 1000 cm³ = 1 L, 1 m³ = 1000 L);
// the page ends with word problems. Every question is a labelled diagram (helpers.js).
// From the Chapter 2 review: the 6 × 4 × 3 prism (multiple-choice 8: 72 cm³), the cube with side 3 cm (multiple-choice 9:
// 27 cm³), the cylinder with radius 2 cm and height 6 cm (multiple-choice 10: about 75 mL) and the tank with diameter 8 m
// and height 2 m (extended response 1).
const { fmt, d1, problems, cuboid, triPrism, cyl } = require('../helpers');

// ---------- answers ----------
const PI = Math.PI;
const cu = (v, u) => `${fmt(v)} ${u}³`;
const boxW = (l, w, h, u) => `${fmt(l)} × ${fmt(w)} × ${fmt(h)} = ${cu(l * w * h, u)}`;
const cubeW = (s, u) => `${fmt(s)} × ${fmt(s)} × ${fmt(s)} = ${cu(s ** 3, u)}`;
// A triangular prism with right-angled ends (legs b and h): V = ½ × b × h × L
const triW = (b, h, L, u) => `½ × ${fmt(b)} × ${fmt(h)} × ${fmt(L)} = ${fmt((b * h) / 2)} × ${fmt(L)} = ${cu((b * h * L) / 2, u)}`;
const cylV = (r, h) => PI * r * r * h;
const cylW = (v, h, u, kind) => { const r = kind === 'd' ? v / 2 : v; return `${kind === 'd' ? `r = ${fmt(r)}, ` : ''}π × ${fmt(r)}² × ${fmt(h)} = ${d1(cylV(r, h))} ${u}³`; };
// The capacity of a box in cm: cm³ ÷ 1000 = L
const litres = (l, w, h) => `${boxW(l, w, h, 'cm')} = ${fmt((l * w * h) / 1000)} L`;

// ---------- the questions ----------
const cards = (text, list, o = {}) => ({ text, figs: true, cols: 4, prefix: 'V =', items: list.map((x) => ({ t: '', fig: x.fig })), ans: list.map((x) => x.ans), ...o });
const EASY = { figH: 22 }; // page 1 also holds the lesson header, so its diagram cards are a little shorter
const cubeQ = (s, u) => ({ fig: cuboid(s, s, s, u), ans: cubeW(s, u) });
const boxQ = (l, w, h, u) => ({ fig: cuboid(l, w, h, u), ans: boxW(l, w, h, u) });
const triQ = (b, h, c, L, u) => ({ fig: triPrism(b, h, c, L, u), ans: triW(b, h, L, u) });
const cylQ = (v, h, u, kind = 'r') => ({ fig: cyl(v, h, u, kind), ans: cylW(v, h, u, kind) });
const capQ = (l, w, h) => ({ fig: cuboid(l, w, h, 'cm'), ans: litres(l, w, h) });

const tank = { d: 8, h: 2 };
const fish = { l: 60, w: 30, h: 40 };

module.exports = {
  code: '2.7', title: 'Volume and capacity',
  li: 'find the volume of prisms and cylinders, and change volume to capacity.',
  sc: ['find the volume of a cube and a rectangular prism', 'find the volume of a triangular prism and a cylinder', 'change cm³ to mL and L'],
  easy: {
    ex: { stem: 'Volume (V) is the space inside a solid. V = length × width × height. Volume is in cubic units (cm³, m³).', parts: [
      { t: 'Cube', fig: cuboid(2, 2, 2, 'm') }, { t: 'Rectangular prism', fig: cuboid(5, 3, 2, 'cm') }, { t: 'Rectangular prism', fig: cuboid(10, 2, 4, 'm') }, { t: 'Rectangular prism', fig: cuboid(6, 4, 5, 'mm') }] },
    exAns: [cubeW(2, 'm'), boxW(5, 3, 2, 'cm'), boxW(10, 2, 4, 'm'), boxW(6, 4, 5, 'mm')],
    hint: 'V = length × width × height · Cube: V = side × side × side · Volume units are cubed (cm³, m³).',
    rounds: [
      cards('find the volume of each cube.', [cubeQ(3, 'cm'), cubeQ(5, 'm'), cubeQ(10, 'cm'), cubeQ(4, 'mm')], EASY),
      cards('find the volume of each rectangular prism.', [boxQ(6, 4, 3, 'cm'), boxQ(8, 5, 2, 'm'), boxQ(10, 10, 3, 'cm'), boxQ(7, 2, 5, 'mm')], EASY),
      cards('find the volume of each rectangular prism.', [boxQ(12, 5, 4, 'cm'), boxQ(20, 6, 10, 'cm'), boxQ(9, 3, 2, 'm'), boxQ(2.5, 2, 4, 'm')], EASY),
    ],
  },
  medium: {
    ex: { stem: 'Prism: V = area of the end × length · Cylinder: V = π × r² × h · 1 cm³ holds 1 mL.', parts: [
      { t: 'Triangular prism', fig: triPrism(4, 3, 5, 10, 'cm') }, { t: 'Cylinder', fig: cyl(2, 6, 'cm') },
      'How many millilitres does the cylinder in b hold?', 'A box holds 2\u00a0000 cm³. How many litres is that?'] },
    exAns: [triW(4, 3, 10, 'cm'), cylW(2, 6, 'cm', 'r'), `1 cm³ = 1 mL, so ${d1(cylV(2, 6))} mL`, `2 000 ÷ 1 000 = ${fmt(2000 / 1000)} L`],
    hint: 'Triangular prism: V = ½ × base × height × length · Cylinder: V = π × r² × h (round to 1 d.p.) · 1 cm³ = 1 mL · 1\u00a0000 cm³ = 1 L · 1 m³ = 1\u00a0000 L.',
    rounds: [
      cards('find the volume of each triangular prism.', [triQ(6, 8, 10, 5, 'cm'), triQ(5, 12, 13, 10, 'm'), triQ(4, 4, 5.7, 2, 'cm'), triQ(12, 9, 15, 20, 'm')]),
      cards('find the volume of each cylinder. Round to 1 decimal place.', [cylQ(3, 10, 'cm'), cylQ(1, 2, 'm'), cylQ(5, 4, 'cm'), cylQ(10, 2, 'm', 'd')]),
      cards('find the volume of each box in cm³, then its capacity in litres (÷ 1\u00a0000).', [capQ(20, 20, 10), capQ(50, 20, 10), capQ(30, 10, 10), capQ(25, 20, 10)], { prefix: 'L =' }),
      problems('solve each problem. Show your working.', [
        [`A water tank is a cylinder with a diameter of ${fmt(tank.d)} m and a height of ${fmt(tank.h)} m. Find its volume (to 1 decimal place). How many litres does it hold? (1 m³ = 1\u00a0000 L)`,
          `r = ${fmt(tank.d / 2)}, π × ${fmt(tank.d / 2)}² × ${fmt(tank.h)} = ${d1(cylV(tank.d / 2, tank.h))} m³, about ${fmt(Math.round(cylV(tank.d / 2, tank.h) * 1000))} L`],
        [`A fish tank is ${fmt(fish.l)} cm long, ${fmt(fish.w)} cm wide and ${fmt(fish.h)} cm high. How many litres of water does it hold when full?`, litres(fish.l, fish.w, fish.h)],
      ]),
    ],
  },
};
