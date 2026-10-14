// Lesson 2.5 Area of circles (two pages: Easy, then Medium). See lib/lesson-two.js for the fields.
// Easy: A = π × r², with the radius shown or the diameter shown (halve it first). Medium: semicircles, quarter circles
// and a rectangle with a semicircle on one end; the page ends with word problems. Every question is a labelled diagram
// (helpers.js). Answers use the calculator's π, rounded to 1 decimal place.
// From the Chapter 2 review: the area of a circle of radius 3 m (short-answer question 4b, Easy question 1) and a
// 90° sector as a quarter of a circle (multiple-choice question 7, the quarter circles).
const { fmt, d1, problems, circ, semi, quarter, rectSemi } = require('../helpers');

// ---------- answers ----------
const PI = Math.PI;
const a1 = (v, u) => `${d1(v)} ${u}²`; // an area to 1 decimal place
const circleA = (r) => PI * r * r;
// The working for a circle: radius shown → 'π × 3² = 28.3 m²'; diameter shown → 'r = 8 ÷ 2 = 4, π × 4² = 50.3 cm²'
const circleW = (v, u, k) => { const r = k === 'd' ? v / 2 : v; return `${k === 'd' ? `r = ${fmt(v)} ÷ 2 = ${fmt(r)}, ` : ''}π × ${fmt(r)}² = ${a1(circleA(r), u)}`; };
const semiW = (v, u, k) => { const r = k === 'd' ? v / 2 : v; return `${k === 'd' ? `r = ${fmt(r)}, ` : ''}½ × π × ${fmt(r)}² = ${a1(circleA(r) / 2, u)}`; };
const quarterW = (r, u) => `¼ × π × ${fmt(r)}² = ${a1(circleA(r) / 4, u)}`;
// A rectangle L by w with a semicircle (diameter w) on one end: the rectangle + half a circle of radius w ÷ 2.
const rsA = (L, w) => L * w + circleA(w / 2) / 2;
const rsW = (L, w, u) => `${fmt(L)} × ${fmt(w)} + ½ × π × ${fmt(w / 2)}² = ${fmt(L * w)} + ${d1(circleA(w / 2) / 2)} = ${a1(rsA(L, w), u)}`;

// ---------- the questions ----------
// A round of diagram cards: cards(text, list, draw, working, options)
const cards = (text, list, draw, ans, o = {}) => ({ text, figs: true, cols: 4, prefix: 'A =', items: list.map((v) => ({ t: '', fig: draw(...v) })), ans: list.map((v) => ans(...v)), ...o });
const EASY = { figH: 22 }; // page 1 also holds the lesson header, so its diagram cards are a little shorter

const ex1 = [[5, 'cm', 'r'], [2, 'm', 'r'], [8, 'cm', 'd'], [12, 'm', 'd']];
const ex2 = { semi: [10, 'cm', 'd'], quarter: [4, 'm'], rs: [12, 6, 'cm'], semiR: [6, 'm', 'r'] };

module.exports = {
  code: '2.5', title: 'Area of circles',
  li: 'find the area of circles, semicircles and quarter circles.',
  sc: ['find the area of a circle from its radius', 'halve the diameter to find the radius first', 'find the area of semicircles, quarter circles and composite shapes'],
  easy: {
    ex: { stem: 'A = π × r². If the diameter is shown, halve it to get r. Round to 1 decimal place.', parts: ex1.map((v) => ({ t: v[2] === 'r' ? 'Radius shown' : 'Diameter shown', fig: circ(...v) })) },
    exAns: ex1.map((v) => circleW(...v)),
    hint: 'A = π × r² (r² = r × r) · Diameter shown? Halve it first to get r · Use the π button, then round to 1 decimal place.',
    rounds: [
      cards('the radius is shown. Find each area.', [[3, 'm', 'r'], [4, 'cm', 'r'], [7, 'mm', 'r'], [10, 'cm', 'r']], circ, circleW, EASY),
      cards('the diameter is shown. Halve it, then find each area.', [[2, 'cm', 'd'], [14, 'm', 'd'], [20, 'cm', 'd'], [18, 'mm', 'd']], circ, circleW, EASY),
      cards('radius or diameter? Find each area.', [[1, 'm', 'r'], [4, 'cm', 'd'], [6, 'mm', 'r'], [30, 'cm', 'd']], circ, circleW, EASY),
    ],
  },
  medium: {
    ex: { stem: 'A semicircle is half a circle; a quarter circle (a 90° sector) is a quarter. Round to 1 decimal place.', parts: [
      { t: 'Semicircle', fig: semi(...ex2.semi) }, { t: 'Quarter circle', fig: quarter(...ex2.quarter) },
      { t: 'Composite shape', fig: rectSemi(...ex2.rs) }, { t: 'Semicircle', fig: semi(...ex2.semiR) }] },
    exAns: [semiW(...ex2.semi), quarterW(...ex2.quarter), rsW(...ex2.rs), semiW(...ex2.semiR)],
    hint: 'Semicircle: A = ½ × π × r² · Quarter circle: A = ¼ × π × r² · Composite shape: add the area of each part.',
    rounds: [
      cards('find the area of each semicircle. If the diameter is shown, halve it first.', [[6, 'cm', 'd'], [4, 'm', 'r'], [16, 'mm', 'd'], [7, 'cm', 'r']], semi, semiW),
      cards('find the area of each quarter circle.', [[1, 'm'], [3, 'cm'], [12, 'cm'], [5, 'mm']], quarter, quarterW),
      cards('find the area of each shape: the rectangle + the semicircle.', [[8, 4, 'cm'], [10, 6, 'm'], [16, 8, 'cm'], [5, 2, 'm']], rectSemi, rsW),
      problems('solve each problem. Round to 1 decimal place.', [
        ((d) => [`A round pizza has a diameter of ${fmt(d)} cm. What is the area of the pizza?`, `r = ${fmt(d / 2)}, π × ${fmt(d / 2)}² = ${a1(circleA(d / 2), 'cm')}`])(30),
        ((r) => [`A circular rug has a radius of ${fmt(r)} m. What area of floor does it cover?`, `π × ${fmt(r)}² = ${a1(circleA(r), 'm')}`])(1.5),
        ((r) => [`A sprinkler waters a circle with a radius of ${fmt(r)} m. What area of lawn does it water?`, `π × ${fmt(r)}² = ${a1(circleA(r), 'm')}`])(4),
      ], { cols: 3 }),
    ],
  },
};
