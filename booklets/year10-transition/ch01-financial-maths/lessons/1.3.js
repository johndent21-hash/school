// Lesson 1.3 Profit, mark-up and discount (two pages: Easy, then Medium). See lib/lesson-two.js for the fields.
const { fmt, pct, money, round, problems } = require('../helpers');

// Profit or loss when something that cost c is sold for s: '$8 profit', '$15 loss'
const pl = (c, s) => `${money(Math.abs(s - c))} ${s >= c ? 'profit' : 'loss'}`;
// The price after a mark-up of r% (c + r% of c), or after a discount of r% (p − r% of p)
const up = (c, r) => c + (r / 100) * c;
const off = (p, r) => p - (r / 100) * p;
// Profit as a percentage of the cost price
const pctProfit = (c, s) => ((s - c) / c) * 100;
// One question and its answer, both made from the same numbers: ask([12, 20], (c, s) => question, (c, s) => answer)
const ask = (v, q, a) => [q(...v), a(...v)];
const example = (stem, list) => ({ ex: { stem, parts: list.map((x) => x[0]) }, exAns: list.map((x) => x[1]) });
// Medium example parts c and d use the same sale: c finds the profit, d writes it as a % of the cost price.
const SALE = [50, 60];

module.exports = {
  code: '1.3', title: 'Profit, mark-up and discount',
  li: 'work out profit, mark-ups and discounts, in dollars and as percentages.',
  sc: ['find the profit or loss when something is sold', 'find the new price after a mark-up or a discount', 'write a profit as a percentage of the cost price'],
  easy: {
    ...example('Cost price = what the shop pays. Selling price = what it sells for.', [
      ask([12, 20], (c, s) => `Cost ${money(c)}, sold ${money(s)}. Find the profit.`, (c, s) => `${fmt(s)} − ${fmt(c)} = ${pl(c, s)}`),
      ask([50, 35], (c, s) => `Cost ${money(c)}, sold ${money(s)}. Is it a profit or a loss? How much?`, (c, s) => `${fmt(c)} − ${fmt(s)} = ${pl(c, s)} (it sold for less than it cost)`),
      ask([40, 15], (c, m) => `Cost ${money(c)}, mark-up ${money(m)}. Find the selling\u00a0price.`, (c, m) => `${fmt(c)} + ${fmt(m)} = ${money(c + m)}`),
      ask([90, 25], (p, d) => `Price ${money(p)}, discount ${money(d)}. Find the sale\u00a0price.`, (p, d) => `${fmt(p)} − ${fmt(d)} = ${money(p - d)}`),
    ]),
    hint: 'Profit = selling price − cost price (if it sells for less than it cost, it is a loss) · Selling price = cost price + mark-up · Sale price = price − discount.',
    rounds: [
      round('find the profit.', [[20, 35], [30, 45], [50, 80], [25, 40], [100, 150], [8, 15], [60, 95], [200, 260]], ([c, s]) => `Cost ${money(c)}, sold ${money(s)}`, ([c, s]) => money(s - c)),
      round('find the profit or the loss. Write “profit” or “loss”.', [[40, 55], [30, 20], [90, 70], [15, 25], [120, 100], [65, 80], [200, 150], [45, 60]], ([c, s]) => `Cost ${money(c)}, sold ${money(s)}`, ([c, s]) => pl(c, s)),
      round('add the mark-up to the cost price to find the selling price.', [[20, 5], [40, 10], [35, 15], [80, 20], [150, 50], [12, 8], [250, 100], [64, 16]], ([c, m]) => `${money(c)}, mark-up ${money(m)}`, ([c, m]) => money(c + m)),
      round('take the discount off the price to find the sale price.', [[50, 10], [80, 20], [45, 5], [120, 30], [200, 40], [99, 9], [300, 75], [36, 12]], ([p, d]) => `${money(p)}, discount ${money(d)}`, ([p, d]) => money(p - d)),
    ],
  },
  medium: {
    ...example('Use a calculator. Show the sum you type in.', [
      ask([40, 25], (c, r) => `Cost ${money(c)}, mark-up ${pct(r)}. Find the selling\u00a0price.`,
        (c, r) => `mark-up = ${fmt(r / 100)} × ${fmt(c)} = ${money((r / 100) * c)}, so ${fmt(c)} + ${fmt((r / 100) * c)} = ${money(up(c, r))} (or ${fmt(c)} × ${fmt(1 + r / 100)})`),
      ask([60, 20], (p, r) => `Price ${money(p)}, discount ${pct(r)}. Find the sale\u00a0price.`,
        (p, r) => `discount = ${fmt(r / 100)} × ${fmt(p)} = ${money((r / 100) * p)}, so ${fmt(p)} − ${fmt((r / 100) * p)} = ${money(off(p, r))} (or ${fmt(p)} × ${fmt(1 - r / 100)})`),
      ask(SALE, (c, s) => `Cost ${money(c)}, sold ${money(s)}. Find the profit.`, (c, s) => `${fmt(s)} − ${fmt(c)} = ${pl(c, s)}`),
      ask(SALE, () => 'Write the profit in c as a % of the cost\u00a0price.', (c, s) => `${fmt(s - c)} ÷ ${fmt(c)} × 100 = ${pct(pctProfit(c, s))}`),
    ]),
    hint: 'Mark-up: find the % of the cost price, then add it on · Discount: find the % of the price, then take it off · % profit = profit ÷ cost price × 100.',
    rounds: [
      round('find the selling price after each mark-up.', [[48, 25], [80, 10], [60, 50], [200, 20], [120, 5], [36, 25], [90, 30], [64, 15]], ([c, r]) => `${money(c)}, mark-up ${pct(r)}`, ([c, r]) => money(up(c, r))),
      round('find the sale price after each discount.', [[70, 20], [80, 25], [150, 10], [45, 20], [300, 40], [96, 25], [250, 30], [88, 15]], ([p, r]) => `${money(p)}, discount ${pct(r)}`, ([p, r]) => money(off(p, r))),
      round('find the profit as a percentage of the cost price.', [[20, 25], [50, 80], [40, 44], [80, 120], [200, 230], [10, 13], [25, 35], [30, 60]], ([c, s]) => `Cost ${money(c)}, sold ${money(s)}`, ([c, s]) => pct(pctProfit(c, s))),
      problems('solve each problem. Show your working.', [
        ask([7.6, 50], (c, r) => `A shop pays ${money(c)} for a pen. It marks the pen up by ${pct(r)}. Find the selling price and the profit.`,
          (c, r) => `selling price ${money(up(c, r))}, profit ${money((r / 100) * c)}`),
        ask([7000, 40], (p, r) => `An airfare costs ${money(p)}. It is discounted by ${pct(r)}. What is the sale price?`, (p, r) => money(off(p, r))),
        ask([56, 26], (p, r) => `A shirt was ${money(p)}. It is discounted by ${pct(r)}. What is the sale price?`, (p, r) => money(off(p, r))),
        ask([80, 116], (c, s) => `Kim buys a bike for ${money(c)} and sells it for ${money(s)}. Find the profit as a percentage of the cost price.`, (c, s) => pct(pctProfit(c, s))),
      ]),
    ],
  },
};
