// Lesson 2.3 Circumference (two pages: Easy, then Medium). See lib/lesson-two.js for the fields.
// Easy: the radius and the diameter (d = 2 × r), then C = π × d and C = 2 × π × r. Medium: the perimeter of
// semicircles, quarter circles and a rectangle with a semicircle on one end. Every question is a labelled diagram
// (drawn below); the Medium page ends with word problems. Answers use the calculator's π, rounded to 1 decimal place.
// From the Chapter 2 review: the circumference of a circle with diameter 6 cm (multiple-choice question 4, in the
// Medium WE DO) and a circle of radius 3 m (short-answer question 4a, the garden bed problem).
const { fmt, len, d1, problems, circ, semi, quarter, rectSemi } = require('../helpers');

// ---------- answers ----------
const PI = Math.PI;
const u1 = (v, u) => `${d1(v)} ${u}`;
const circD = (d) => PI * d; // C = π × d
const circR = (r) => 2 * PI * r; // C = 2 × π × r
const semiP = (d) => (PI * d) / 2 + d; // half the circumference + the diameter
const quarterP = (r) => (2 * PI * r) / 4 + 2 * r; // a quarter of the circumference + 2 radii
const rsP = (L, w) => 2 * L + w + (PI * w) / 2; // rectangle sides (top, bottom, left) + half a circle of diameter w

// ---------- the questions ----------
// A round of diagram cards: cards(text, list, draw, answer, options)
const cards = (text, list, draw, ans, o = {}) => ({ text, figs: true, cols: 4, items: list.map((v) => ({ t: '', fig: draw(...v) })), ans: list.map((v) => ans(...v)), ...o });
const EASY = { figH: 22 }; // page 1 also holds the lesson header, so its diagram cards are a little shorter

// Easy, Round 1: find the diameter (radius shown) or the radius (diameter shown).
const dr = [[5, 'cm', 'r'], [8, 'cm', 'd'], [9, 'm', 'r'], [20, 'm', 'd']];
// Medium example: the review's circle (diameter 6 cm), a semicircle, a quarter circle, a rectangle with a semicircle.
const rev = 6, ex2 = { semi: 10, quarter: 4, rs: [12, 6] };
// Medium, Round 1: semicircles, some with the diameter shown and some with the radius.
const semis = [[8, 'cm', 'd'], [3, 'm', 'r'], [20, 'mm', 'd'], [9, 'cm', 'r']];
const semiAns = (v, u, k) => { const d = k === 'd' ? v : 2 * v; return `${k === 'r' ? `d = ${fmt(d)}; ` : ''}${d1((PI * d) / 2)} + ${fmt(d)} = ${u1(semiP(d), u)}`; };

module.exports = {
  code: '2.3', title: 'Circumference',
  li: 'find the circumference of a circle, and the perimeter of semicircles and quarter circles.',
  sc: ['change a radius to a diameter, and back', 'use C = π × d and C = 2 × π × r', 'find the perimeter of shapes with a curved side'],
  easy: {
    ex: { stem: 'The circumference (C) is the distance around a circle. Round to 1 decimal place.', parts: [
      { t: 'Find the diameter.', fig: circ(6, 'cm', 'r') }, { t: 'Find the radius.', fig: circ(14, 'm', 'd') },
      { t: 'Find C.', fig: circ(10, 'cm', 'd') }, { t: 'Find C.', fig: circ(4, 'm', 'r') }] },
    exAns: [`d = 2 × 6 = ${len(2 * 6, 'cm')}`, `r = 14 ÷ 2 = ${len(14 / 2, 'm')}`, `C = π × 10 = ${u1(circD(10), 'cm')}`, `C = 2 × π × 4 = ${u1(circR(4), 'm')}`],
    hint: 'Radius r: from the centre to the edge · Diameter d: all the way across, d = 2 × r · C = π × d or C = 2 × π × r. Use the π button, then round to 1 decimal place.',
    rounds: [
      { text: 'find the diameter (d = 2 × r) or the radius (r = d ÷ 2).', figs: true, cols: 4, ...EASY,
        items: dr.map(([v, u, k]) => ({ t: k === 'r' ? 'Find the diameter.' : 'Find the radius.', fig: circ(v, u, k) })),
        ans: dr.map(([v, u, k]) => (k === 'r' ? `d = ${len(2 * v, u)}` : `r = ${len(v / 2, u)}`)) },
      cards('the diameter is shown. Find each circumference: C = π × d.', [[4, 'cm'], [9, 'm'], [20, 'cm'], [15, 'mm']], (d, u) => circ(d, u, 'd'), (d, u) => u1(circD(d), u), { prefix: 'C =', ...EASY }),
      cards('the radius is shown. Find each circumference: C = 2 × π × r.', [[6, 'm'], [8, 'cm'], [11, 'mm'], [25, 'cm']], (r, u) => circ(r, u, 'r'), (r, u) => u1(circR(r), u), { prefix: 'C =', ...EASY }),
    ],
  },
  medium: {
    ex: { stem: 'Perimeter = the curved part + the straight sides. Round to 1 decimal place.', parts: [
      { t: 'Circle', fig: circ(rev, 'cm', 'd') }, { t: 'Semicircle', fig: semi(ex2.semi, 'cm', 'd') },
      { t: 'Quarter circle', fig: quarter(ex2.quarter, 'm') }, { t: 'Composite shape', fig: rectSemi(...ex2.rs, 'cm') }] },
    exAns: [`C = π × ${rev} = ${u1(circD(rev), 'cm')} (not 2 × π × ${rev}: ${rev} cm is the diameter)`,
      `½ × π × ${ex2.semi} + ${ex2.semi} = ${d1(circD(ex2.semi) / 2)} + ${ex2.semi} = ${u1(semiP(ex2.semi), 'cm')}`,
      `¼ × 2 × π × ${ex2.quarter} + ${ex2.quarter} + ${ex2.quarter} = ${d1(circR(ex2.quarter) / 4)} + ${2 * ex2.quarter} = ${u1(quarterP(ex2.quarter), 'm')}`,
      ((L, w) => `${L} + ${L} + ${w} + ½ × π × ${w} = ${fmt(2 * L + w)} + ${d1(circD(w) / 2)} = ${u1(rsP(L, w), 'cm')}`)(...ex2.rs)],
    hint: 'Semicircle: P = ½ × π × d + d · Quarter circle: P = ¼ × 2 × π × r + r + r · Composite shape: add the straight sides and the curved part (not the dashed line).',
    rounds: [
      cards('find the perimeter of each semicircle. If the radius is shown, find d first.', semis, semi, semiAns, { prefix: 'P =' }),
      cards('find the perimeter of each quarter circle.', [[2, 'cm'], [6, 'm'], [10, 'cm'], [8, 'mm']], quarter,
        (r, u) => `${d1(circR(r) / 4)} + ${fmt(2 * r)} = ${u1(quarterP(r), u)}`, { prefix: 'P =' }),
      cards('find the perimeter of each shape. Do not count the dashed line.', [[10, 4, 'cm'], [15, 8, 'm'], [20, 10, 'cm'], [6, 2, 'm']], rectSemi,
        (L, w, u) => `${fmt(2 * L + w)} + ${d1(circD(w) / 2)} = ${u1(rsP(L, w), u)}`, { prefix: 'P =' }),
      problems('solve each problem. Round to 1 decimal place.', [
        ((r) => [`A round garden bed has a radius of ${len(r, 'm')}. Edging goes all the way around it. How much edging is needed?`, `2 × π × ${r} = ${u1(circR(r), 'm')}`])(3),
        ((d) => [`A bike wheel has a diameter of ${len(d, 'cm')}. How far does the bike move when the wheel turns once?`, `π × ${d} = ${u1(circD(d), 'cm')}`])(60),
        ((d) => [`A window is a semicircle with a diameter of ${len(d, 'm')}. Lights go all the way around its edge. How long are the lights?`, `${d1(circD(d) / 2)} + ${d} = ${u1(semiP(d), 'm')}`])(2),
      ], { cols: 3 }),
    ],
  },
};
