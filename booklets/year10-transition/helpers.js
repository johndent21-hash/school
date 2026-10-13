// Answer and question helpers shared by every Year 10 transition lesson. Every answer is calculated with these.
const calc = require('../lib/calc');
const { simp, F } = calc;

// A number as the booklet writes it, with a non-breaking space in the thousands so $2 500 never splits across lines.
const fmt = (v, dp) => calc.fmt(v, dp).replace(/(\d) (?=\d{3}(?!\d))/g, '$1\u00a0');

// 35 → '35%'
const pct = (p) => `${fmt(p)}%`;
// [20, 100] → the stacked fraction 1/5 (a whole number when it simplifies to one)
const frac = ([n, d]) => { const [a, b] = simp([n, d]); return b === 1 ? fmt(a) : F(a, b); };
// 8 → '$8', 24.9 → '$24.90', 1395 → '$1 395' (cents shown only when there are some)
const money = (v) => { const x = +(+v).toFixed(2); return `$${Number.isInteger(x) ? fmt(x) : fmt(Math.trunc(x)) + '.' + Math.abs(x).toFixed(2).split('.')[1]}`; };
const pairs = (list, q, a) => ({ items: list.map((x) => q(x)), ans: list.map((x) => a(x)) });
// A round of short questions, four to a row, each with an answer line: round(text, values, value => question, value => answer)
const round = (text, list, q, a, o = {}) => ({ text, ...pairs(list, q, a), cols: 4, ...o });
// A round of word problems, two to a row, each with a working box: problems(text, [[question, answer], ..])
const problems = (text, list, o = {}) => ({ text, items: list.map((x) => x[0]), ans: list.map((x) => x[1]), cols: 2, work: true, ...o });

module.exports = { fmt, simp, F, pct, frac, money, round, problems };
