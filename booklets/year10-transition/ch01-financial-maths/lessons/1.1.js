// Lesson 1.1 Percentages, fractions and decimals (two pages: Easy, then Medium). See lib/lesson-two.js for the fields.
const { fmt, F, pct, frac, money, round, problems } = require('../helpers');

module.exports = {
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
};
