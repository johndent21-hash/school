// Lesson 1.2 Percentage increase and decrease (two pages: Easy, then Medium). See lib/lesson-two.js for the fields.
const { fmt, pct, money, round, problems } = require('../helpers');

// The new amount after a change of p% (up = increase, otherwise decrease).
const change = (a, p, up) => a + (up ? 1 : -1) * (p / 100) * a;
// The multiplier for a change of p%: increase by 8% → 1.08, decrease by 8% → 0.92.
const mult = (p, up) => (100 + (up ? p : -p)) / 100;
// Two-step working for an example: "10% of $40 = $4 · $40 + $4 = $44".
const twoStep = (a, p, up) => `${pct(p)} of ${money(a)} = ${money((p / 100) * a)} · ${money(a)} ${up ? '+' : '−'} ${money((p / 100) * a)} = ${money(change(a, p, up))}`;
// One-step working for an example: "100% + 8% = 108% · 20 × 1.08 = $21.60".
const oneStep = (a, p, up) => `100% ${up ? '+' : '−'} ${pct(p)} = ${pct(100 + (up ? p : -p))} · ${fmt(a)} × ${fmt(mult(p, up))} = ${money(a * mult(p, up))}`;
const word = (up) => (up ? 'Increase' : 'Decrease');
const GST = 10;

module.exports = {
  code: '1.2', title: 'Percentage increase and decrease',
  li: 'increase and decrease an amount by a percentage, and work with GST.',
  sc: ['increase or decrease an amount by a percentage', 'use a multiplier such as × 1.08 or × 0.92', 'add GST to a price, and find the GST in a price'],
  easy: {
    ex: { stem: 'Find the percentage first. Then add it on (increase) or take it away (decrease).', parts: ['Increase $40 by\u00a010%.', 'Decrease $60 by\u00a010%.', 'Increase $80 by\u00a025%.', 'Decrease $200 by\u00a05%.'] },
    exAns: [twoStep(40, 10, true), twoStep(60, 10, false), twoStep(80, 25, true), twoStep(200, 5, false)],
    hint: 'Find the % of the amount (10% of $40 = $4) · Increase: add it on ($44) · Decrease: take it away ($36).',
    rounds: [
      round('increase each amount by 10%.', [20, 70, 30, 120, 90, 250, 500, 15], money, (a) => money(change(a, 10, true))),
      round('decrease each amount by 10%.', [50, 80, 20, 300, 70, 140, 400, 35], money, (a) => money(change(a, 10, false))),
      round('increase or decrease each amount.', [[true, 40, 50], [false, 80, 25], [true, 60, 20], [false, 300, 5], [true, 100, 25], [false, 30, 50], [true, 400, 5], [false, 50, 20]],
        ([up, a, p]) => `${word(up)} ${money(a)}<br>by ${pct(p)}`, ([up, a, p]) => money(change(a, p, up))),
      round('a price goes up or down. Find the new price.', [[60, true, 10], [40, false, 25], [120, true, 50], [90, false, 20], [20, true, 5], [200, true, 25], [16, false, 50], [500, false, 5]],
        ([a, up, p]) => `${money(a)}, ${up ? 'up' : 'down'} ${pct(p)}`, ([a, up, p]) => money(change(a, p, up))),
    ],
  },
  medium: {
    ex: { stem: 'Use a multiplier and a calculator. Show the sum you type in.', parts: ['Increase $20 by 8%.', 'Decrease $20 by 8%.', 'Add 10% GST to $70.', 'Find the GST in $110 (GST inc.).'] },
    exAns: [oneStep(20, 8, true), oneStep(20, 8, false), `${fmt(70)} × ${fmt(mult(GST, true))} = ${money(70 * mult(GST, true))}`, `GST = ${fmt(110)} ÷ 11 = ${money(110 / 11)}`],
    hint: 'Increase by 8%: × 1.08 · Decrease by 8%: × 0.92 · Add GST: × 1.1 · GST in a price (GST inc.): ÷ 11.',
    rounds: [
      round('write the multiplier for each change.', [[true, 15], [false, 30], [true, 20], [false, 5], [true, 50], [false, 12], [true, 3], [false, 25]],
        ([up, p]) => `${word(up)} by ${pct(p)}`, ([up, p]) => fmt(mult(p, up))),
      round('use a multiplier to find each new amount.', [[true, 80, 15], [false, 250, 12], [true, 968, 12], [false, 4900, 7], [true, 45, 6], [false, 360, 35], [true, 1200, 3], [false, 89, 20]],
        ([up, a, p]) => `${money(a)}, ${up ? 'up' : 'down'} ${pct(p)}`, ([up, a, p]) => money(a * mult(p, up))),
      round('add 10% GST to each price.', [40, 90, 250, 18], money, (a) => money(a * mult(GST, true))),
      round('each price includes GST. Find the GST in it.', [22, 44, 99, 330], money, (a) => money(a / 11)),
      problems('solve each problem. Show your working.', [
        ['A price tag says “$55 (GST inc.)”. How much GST is included in the price?', money(55 / 11)],
        ['Ali earns $25 an hour. Ali gets a 4% pay rise. What is Ali’s new pay per hour?', `${money(25 * mult(4, true))} an hour`],
        ['A car is worth $18 000. Its value goes down by 15% in one year. What is the car worth now?', money(18000 * mult(15, false))],
        ['A school has 900 students. The number goes up by 6%. How many students are there now?', `${fmt(900 * mult(6, true))} students`],
      ]),
    ],
  },
};
