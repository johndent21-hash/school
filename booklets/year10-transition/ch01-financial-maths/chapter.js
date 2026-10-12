// Year 10 transition, Chapter 1 Financial mathematics: seven two-page lessons (lib/lesson-two.js), each an Easy page
// and a Medium page of WE DO examples and YOU DO rounds. Easier than the Cambridge MATHS GOLD Year 10 chapter
// review it is based on: calculators allowed, friendly numbers. Every answer below is calculated.
const two = require('../../lib/lesson-two');
const front = require('../../lib/gold-front');
const { fmt, simp, F } = require('../../lib/calc');

// ---------- answer helpers ----------
const pct = (p) => `${fmt(p)}%`;
const frac = ([n, d]) => { const [a, b] = simp([n, d]); return b === 1 ? fmt(a) : F(a, b); };
const money = (v) => `$${Number.isInteger(+(+v).toFixed(6)) ? fmt(v) : (+v).toFixed(2)}`;
const pairs = (list, q, a) => ({ items: list.map((x) => q(x)), ans: list.map((x) => a(x)) });
const round = (text, list, q, a, o = {}) => ({ text, ...pairs(list, q, a), cols: 4, ...o });
const problems = (text, list, o = {}) => ({ text, items: list.map((x) => x[0]), ans: list.map((x) => x[1]), cols: 2, work: true, ...o });

const l101 = two({
  code: '1.1', title: 'Percentages, fractions and decimals',
  li: 'change between percentages, fractions and decimals, and find a percentage of an amount.',
  sc: ['change a percentage to a decimal or a fraction, and back again', 'find a percentage of an amount of money', 'write a score as a percentage'],
  easy: {
    ex: { stem: 'Change each one. Percent means “out of 100”.', parts: ['Write 45% as a decimal.', 'Write 0.6 as a percentage.', 'Write 20% as a fraction in simplest form.', `Write ${F(3, 4)} as a percentage.`] },
    exAns: [fmt(0.45), pct(60), frac([20, 100]), pct(75)],
    hint: '% → decimal: ÷ 100 · Decimal → %: × 100 · % → fraction: put it over 100, then simplify · Fraction → %: × 100.',
    rounds: [
      round('write each percentage as a decimal.', [50, 25, 70, 9, 36, 100, 4, 85], pct, (p) => fmt(p / 100)),
      round('write each decimal as a percentage.', [0.3, 0.75, 0.05, 0.62, 0.9, 0.01, 1, 0.48], fmt, (d) => pct(d * 100)),
      round('write each percentage as a fraction in simplest form.', [50, 25, 10, 75, 40, 30, 1, 60], pct, (p) => frac([p, 100])),
      round('write each fraction as a percentage.', [[1, 2], [1, 4], [1, 10], [3, 4], [1, 5], [7, 10], [2, 5], [9, 100]], ([n, d]) => F(n, d), ([n, d]) => pct((n / d) * 100)),
    ],
  },
  medium: {
    ex: { stem: 'Use a calculator. Show the sum you type in.', parts: ['Find 10% of $80.', 'Find 25% of $36.', 'Find 15% of $240.', 'Write 21 out of 60 as a percentage.'] },
    exAns: [`0.1 × 80 = ${money(8)}`, `0.25 × 36 = ${money(9)}`, `0.15 × 240 = ${money(36)}`, `21 ÷ 60 × 100 = ${pct(35)}`],
    hint: '% of an amount: change the % to a decimal, then × the amount (15% of $240 = 0.15 × 240) · Score as a %: score ÷ total × 100.',
    rounds: [
      round('find each amount.', [[10, 70], [50, 46], [25, 200], [20, 35], [5, 80], [1, 900], [75, 40], [30, 150]], ([p, a]) => `${pct(p)} of ${money(a)}`, ([p, a]) => money((p / 100) * a)),
      round('use a calculator to find each amount.', [[15, 60], [12, 350], [35, 80], [8, 125], [45, 120], [6, 250], [28, 89], [2.5, 400]], ([p, a]) => `${pct(p)} of ${money(a)}`, ([p, a]) => money((p / 100) * a)),
      round('write each test score as a percentage.', [[12, 20], [18, 25], [21, 60], [45, 50], [7, 10], [30, 40], [33, 60], [34, 40]], ([s, t]) => `${s} out of ${t}`, ([s, t]) => pct((s / t) * 100)),
      problems('solve each problem. Show your working.', [
        ['Mia scored 85% on a test marked out of 40. How many marks did Mia get?', `${fmt(0.85 * 40)} marks`],
        ['Sam saves 10% of a $450 pay. How much does Sam save?', money(0.1 * 450)],
        ['A school has 800 students. 35% of them catch the bus. How many students catch the bus?', `${fmt(0.35 * 800)} students`],
        ['Jay earned $600 and spent $150 on rent. What percentage of the money went on rent?', pct((150 / 600) * 100)],
      ]),
    ],
  },
});

module.exports = {
  year: 10, number: 1, title: 'Financial mathematics', series: 'Year 10 transition',
  fileName: 'Year10-Transition-Ch01-Financial-Maths', art: 'gold-spiral', accent: '#0b3d2e', bodyClass: 'theme-mb theme-gold',
  homework: false,
  // All seven lessons, for the cover (lessons are added to `lessons` as they are written).
  plan: [['1.1', 'Percentages, fractions and decimals'], ['1.2', 'Percentage increase and decrease'], ['1.3', 'Profit, mark-up and discount'], ['1.4', 'Wages and overtime'],
    ['1.5', 'Commission, gross and net income'], ['1.6', 'Simple interest and loans'], ['1.7', 'Compound interest']].map(([code, title]) => ({ code, title })),
  goals: ['change between percentages, fractions and decimals', 'find a percentage of an amount, and increase or decrease an amount by a percentage', 'work out profit, mark-ups and discounts',
    'calculate wages, overtime, commission and net income', 'calculate simple interest and compound interest'],
  front: [front.cover, front.insideCover],
  lessons: [l101],
};
