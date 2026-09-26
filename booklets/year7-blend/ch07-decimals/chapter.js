// Blended booklet, Chapter 7 Decimals. Four pages a lesson.
const blend = require('../../lib/blend');
const { ev, F, simp } = require('../../lib/calc');

const dr = (text, items, hw, cols = 4) => ({ text, items, ans: items.map((e) => ev(e)), hw: [hw, ev(hw)], cols });
const toFr = (dec) => { const s = String(dec), dp = (s.split('.')[1] || '').length, [n, d] = simp([Math.round(dec * 10 ** dp), 10 ** dp]); return d === 1 ? String(n) : F(n, d); };
const rnd = (x, dp) => (Math.round(x * 10 ** dp + 1e-9) / 10 ** dp).toFixed(dp);
const larger = (a, b) => String(Math.max(a, b));
const rec = (d) => `<span class="rec">${d}</span>`;

module.exports = blend(require('../../year7/ch07-decimals/chapter.js'), {
  fileName: 'Year7-Ch07-Decimals-Lessons', pages: 4,
  more: {
    '7.01': { stems: ['Which is larger?', 'Write the place value, then order the decimals.', 'Order the decimals.'],
      drill: { text: 'Quick drill: which is larger?', cols: 4, items: [[0.8, 0.75], [1.2, 1.09], [0.06, 0.1], [3.45, 3.5], [7.07, 7.7], [0.505, 0.55]].map(([a, b]) => `${a} or ${b}`), ans: [[0.8, 0.75], [1.2, 1.09], [0.06, 0.1], [3.45, 3.5], [7.07, 7.7], [0.505, 0.55]].map(([a, b]) => larger(a, b)), hw: ['4.09 or 4.1', '4.1', 'Which is larger?'] } },
    '7.02': { stems: ['Write each decimal as a simplified fraction.', 'Write as a simplified fraction, then as a decimal.', 'Write each fraction as a decimal.'],
      drill: { text: 'Quick drill: write as a simplified fraction.', cols: 4, items: ['0.4', '0.25', '0.75', '0.06', '0.125', '0.35'], ans: [0.4, 0.25, 0.75, 0.06, 0.125, 0.35].map(toFr), hw: ['0.45', toFr(0.45), 'Write as a simplified fraction.'] } },
    '7.03': { stems: ['Evaluate. Line up the decimal points.', 'Evaluate. Fill gaps with zeros.', 'Evaluate.'],
      drill: dr('Quick drill: evaluate.', ['1.2 + 3.5', '4.8 − 1.3', '0.6 + 0.7', '5 − 1.4', '2.35 + 1.6', '7.2 − 0.45', '10 − 3.75', '0.08 + 0.9'], '6.4 − 2.85') },
    '7.04': { stems: ['Multiply by 10 and 100.', 'Multiply by 1000, then divide by 10.', 'Divide by 100 and 1000.'],
      drill: dr('Quick drill: evaluate.', ['3.6 × 10', '0.45 × 100', '2.1 × 1000', '48 ÷ 10', '5.7 ÷ 100', '360 ÷ 1000', '0.09 × 100', '12 ÷ 100'], '0.7 × 1000') },
    '7.05': { stems: ['Use 42 × 76 = 3192.', 'Use 42 × 76 = 3192.', 'Use 42 × 76 = 3192.'],
      drill: dr('Quick drill: given 14 × 23 = 322, find:', ['1.4 × 23', '14 × 2.3', '1.4 × 2.3', '140 × 23', '0.14 × 23', '1.4 × 0.23'], '0.14 × 0.23', 3) },
    '7.06': { stems: ['Evaluate. Count the decimal places.', 'Evaluate.', 'Evaluate.'],
      drill: dr('Quick drill: evaluate.', ['0.3 × 4', '1.2 × 3', '0.2 × 0.4', '2.5 × 4', '0.6 × 0.5', '1.1 × 7', '0.07 × 3', '4.2 × 0.1'], '0.8 × 0.9') },
    '7.07': { stems: ['Evaluate using short division.', 'Evaluate. Keep the decimal point in line.', 'Evaluate. Add zeros if needed.'],
      drill: dr('Quick drill: evaluate.', ['4.8 ÷ 2', '6.9 ÷ 3', '8.4 ÷ 4', '0.35 ÷ 5', '7.2 ÷ 6', '2.4 ÷ 8', '5.6 ÷ 7', '1.8 ÷ 9'], '9.6 ÷ 4') },
    '7.08': { stems: ['Evaluate. Make the divisor a whole number.', 'Evaluate.', 'Evaluate, then solve the problem.'],
      drill: dr('Quick drill: evaluate.', ['3 ÷ 0.5', '2.4 ÷ 0.2', '1.5 ÷ 0.3', '0.8 ÷ 0.4', '7 ÷ 0.1', '4.5 ÷ 0.9', '0.6 ÷ 0.02', '12 ÷ 0.4'], '5.6 ÷ 0.8') },
    '7.09': { stems: ['Write as a decimal.', 'Write as a decimal. Use dot notation.', 'Write as a recurring decimal.'],
      drill: { text: 'Quick drill: write as a decimal.', cols: 4, items: [F(1, 2), F(3, 5), F(1, 4), F(7, 10), F(1, 8), F(1, 3), F(9, 20), F(2, 9)], ans: ['0.5', '0.6', '0.25', '0.7', '0.125', `0.${rec(3)}`, '0.45', `0.${rec(2)}`], hw: [F(3, 8), '0.375', 'Write as a decimal.'] } },
    '7.10': { stems: ['Round to the place given.', 'Round to the place given.', 'Round to the place given.'],
      drill: { text: 'Quick drill: round to 1 decimal place.', cols: 4, items: ['2.36', '4.81', '0.95', '12.449', '7.05', '3.999'], ans: [2.36, 4.81, 0.95, 12.449, 7.05, 3.999].map((x) => rnd(x, 1)), hw: ['8.46', '8.5', 'Round to 1 decimal place.'] } },
    '7.11': { pages: 6, stems: ['Find the total or the price of one.', 'Find how much is left, then how much she must borrow.', 'Round money, then find the change.'],
      drill: { text: 'Quick drill: evaluate.', cols: 4, items: ['$2.50 + $1.75', '$10 − $3.60', '3 × $1.20', '$9.60 ÷ 4', '$50 − $12.35', '$0.85 × 6'], ans: ['$4.25', '$6.40', '$3.60', '$2.40', '$37.65', '$5.10'], hw: ['$20 − $7.45', '$12.55', 'Evaluate.'] } },
  },
});
