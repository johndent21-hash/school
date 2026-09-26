// Blended booklet, Chapter 4 Fractions and percentages. Four pages a lesson.
const blend = require('../../lib/blend');
const { F, simp, add, sub, mul, div, mixed, fmt } = require('../../lib/calc');

const f = (n, d, w) => F(n, d, w);
const S = (x, asMixed = true) => { const [n, d] = simp(x); if (d === 1) return fmt(n); const neg = n < 0, a = Math.abs(n), w = Math.floor(a / d); return (neg ? '−' : '') + (asMixed && w ? F(a % d, d, w) : F(a, d)); };
const m = mixed;
const pct = (n, d) => `${fmt((n / d) * 100, 2)}%`;
// Drill from [question, [n, d] answer] pairs.
const drill = (text, pairs, hw, cols = 4) => ({ text, cols, items: pairs.map((p) => p[0]), ans: pairs.map((p) => (Array.isArray(p[1]) ? S(p[1]) : p[1])), hw: [hw[0], Array.isArray(hw[1]) ? S(hw[1]) : hw[1], hw[2]] });

module.exports = blend(require('../../year7/ch04-fractions-percentages/chapter.js'), {
  fileName: 'Year7-Ch04-Fractions-and-percentages-Lessons', pages: 4,
  more: {
    '4.01': { stems: ['Convert between mixed numerals and improper fractions.', 'Complete each pair of equivalent fractions.', 'Simplify each fraction.'],
      drill: drill('Quick drill: simplify each fraction.', [[f(6, 8), [6, 8]], [f(10, 15), [10, 15]], [f(12, 16), [12, 16]], [f(9, 27), [9, 27]], [f(14, 21), [14, 21]], [f(20, 50), [20, 50]]], [f(18, 24), [18, 24], 'Simplify.']) },
    '4.02': { stems: ['Which fraction is larger?', 'Order from smallest to largest.', 'Order from smallest to largest.'],
      drill: drill('Quick drill: which is larger?', [[`${f(2, 5)} or ${f(3, 5)}`, f(3, 5)], [`${f(1, 2)} or ${f(3, 8)}`, f(1, 2)], [`${f(2, 3)} or ${f(3, 4)}`, f(3, 4)], [`${f(5, 6)} or ${f(7, 9)}`, f(5, 6)], [`${f(3, 10)} or ${f(1, 4)}`, f(3, 10)], [`${f(4, 7)} or ${f(1, 2)}`, f(4, 7)]], [`${f(5, 8)} or ${f(2, 3)}`, f(2, 3), 'Which is larger?']) },
    '4.03': { stems: ['Evaluate. The denominators are the same.', 'Evaluate. Use a common denominator.', 'Evaluate. Use the lowest common denominator.'],
      drill: drill('Quick drill: evaluate.', [[`${f(1, 5)} + ${f(2, 5)}`, add([1, 5], [2, 5])], [`${f(7, 9)} − ${f(4, 9)}`, sub([7, 9], [4, 9])], [`${f(1, 2)} + ${f(1, 4)}`, add([1, 2], [1, 4])], [`${f(2, 3)} − ${f(1, 6)}`, sub([2, 3], [1, 6])], [`${f(1, 3)} + ${f(1, 4)}`, add([1, 3], [1, 4])], [`${f(3, 4)} − ${f(2, 3)}`, sub([3, 4], [2, 3])]], [`${f(2, 5)} + ${f(1, 3)}`, add([2, 5], [1, 3]), 'Evaluate.']) },
    '4.04': { stems: ['Evaluate. Add the whole numbers, then the fractions.', 'Evaluate.', 'Evaluate. Change to improper fractions.'],
      drill: drill('Quick drill: evaluate.', [[`${f(1, 3, 2)} + ${f(1, 3, 1)}`, add(m(2, 1, 3), m(1, 1, 3))], [`${f(3, 5, 4)} − ${f(1, 5, 2)}`, sub(m(4, 3, 5), m(2, 1, 5))], [`3 − ${f(1, 4)}`, sub([3, 1], [1, 4])], [`${f(1, 2, 1)} + ${f(1, 2, 1)}`, add(m(1, 1, 2), m(1, 1, 2))], [`${f(3, 4, 2)} + ${f(1, 2)}`, add(m(2, 3, 4), [1, 2])], [`${f(1, 6, 5)} − ${f(5, 6, 1)}`, sub(m(5, 1, 6), m(1, 5, 6))]], [`${f(2, 3, 3)} + ${f(1, 2, 1)}`, add(m(3, 2, 3), m(1, 1, 2)), 'Evaluate.']) },
    '4.05': { stems: ['Evaluate.', 'Evaluate in the unit given.', 'Evaluate in the unit given.'],
      drill: drill('Quick drill: evaluate.', [[`${f(1, 3)} of 18`, '6'], [`${f(1, 5)} of 40`, '8'], [`${f(3, 4)} of 20`, '15'], [`${f(2, 3)} of 12`, '8'], [`${f(5, 8)} of 32`, '20'], [`${f(3, 10)} of 50`, '15']], [`${f(2, 5)} of 35`, '14', 'Evaluate.']) },
    '4.06': { stems: ['Evaluate.', 'Evaluate. Cancel first.', 'Evaluate. Change to improper fractions first.'],
      drill: drill('Quick drill: evaluate.', [[`${f(1, 2)} × ${f(1, 3)}`, mul([1, 2], [1, 3])], [`${f(2, 5)} × ${f(3, 4)}`, mul([2, 5], [3, 4])], [`${f(3, 8)} × 4`, mul([3, 8], [4, 1])], [`${f(5, 6)} × ${f(3, 10)}`, mul([5, 6], [3, 10])], [`6 × ${f(2, 3)}`, mul([6, 1], [2, 3])], [`${f(4, 9)} × ${f(3, 8)}`, mul([4, 9], [3, 8])]], [`${f(2, 3)} × ${f(9, 10)}`, mul([2, 3], [9, 10]), 'Evaluate.']) },
    '4.07': { stems: ['Write the reciprocal, then divide.', 'Evaluate. Multiply by the reciprocal.', 'Evaluate. Change to improper fractions first.'],
      drill: drill('Quick drill: evaluate.', [[`6 ÷ ${f(1, 2)}`, div([6, 1], [1, 2])], [`${f(1, 3)} ÷ 2`, div([1, 3], [2, 1])], [`${f(3, 4)} ÷ ${f(1, 4)}`, div([3, 4], [1, 4])], [`${f(2, 5)} ÷ ${f(4, 5)}`, div([2, 5], [4, 5])], [`${f(5, 6)} ÷ ${f(1, 3)}`, div([5, 6], [1, 3])], [`4 ÷ ${f(2, 3)}`, div([4, 1], [2, 3])]], [`${f(3, 8)} ÷ ${f(3, 4)}`, div([3, 8], [3, 4]), 'Evaluate.']) },
    '4.08': { pages: 6, stems: ['Read the problem, then answer.', 'Read the problem, then answer.', 'Read the problem, then answer.'],
      drill: drill('Quick drill: what fraction is left?', [[`${f(1, 4)} is eaten`, f(3, 4)], [`${f(2, 5)} is spent`, f(3, 5)], [`${f(1, 3)} and ${f(1, 3)} are used`, f(1, 3)], [`${f(1, 2)} and ${f(1, 4)} are sold`, f(1, 4)], [`${f(3, 8)} is poured out`, f(5, 8)], [`${f(1, 6)} and ${f(1, 3)} are given away`, f(1, 2)]], [`${f(1, 5)} and ${f(1, 2)} are eaten`, f(3, 10), 'What fraction is left?'], 3) },
    '4.09': { stems: ['Use the fraction key on your calculator.', 'Use your calculator to convert and evaluate.', 'Use your calculator. Use brackets.'],
      drill: drill('Quick drill: use your calculator.', [[`${f(5, 12)} + ${f(7, 18)}`, add([5, 12], [7, 18])], [`${f(11, 15)} − ${f(3, 10)}`, sub([11, 15], [3, 10])], [`${f(7, 12)} × ${f(9, 14)}`, mul([7, 12], [9, 14])], [`${f(5, 9)} ÷ ${f(10, 27)}`, div([5, 9], [10, 27])]], [`${f(4, 15)} + ${f(5, 6)}`, add([4, 15], [5, 6]), 'Use your calculator.']) },
    '4.10': { stems: ['Write as a fraction and a decimal.', 'Write as a fraction and a decimal, then as a percentage.', 'Write as a percentage.'],
      drill: { text: 'Quick drill: complete the conversion.', cols: 4, items: ['25% = ? (fraction)', '0.6 = ?%', `${f(1, 5)} = ?%`, '40% = ? (decimal)', `${f(3, 4)} = ?%`, '0.07 = ?%'], ans: [f(1, 4), '60%', '20%', '0.4', '75%', '7%'], hw: [`${f(9, 20)} = ?%`, '45%', 'Complete the conversion.'] } },
    '4.11': { stems: ['Find mentally.', 'Find the percentage of the quantity.', 'Find, then solve the problem.'],
      drill: { text: 'Quick drill: find mentally.', cols: 4, items: ['10% of 70', '50% of 64', '25% of 120', '1% of 300', '20% of 55', '75% of 40'], ans: ['7', '32', '30', '3', '11', '30'], hw: ['5% of 180', '9', 'Find mentally.'] } },
    '4.12': { stems: ['Write as a fraction and a percentage.', 'Change to the same units, then write as a fraction and a percentage.', 'Write as a percentage, then compare.'],
      drill: { text: 'Quick drill: write as a percentage.', cols: 4, items: ['3 out of 10', '9 out of 20', '12 out of 25', '17 out of 50', '30 out of 40', '4 out of 5'], ans: [[3, 10], [9, 20], [12, 25], [17, 50], [30, 40], [4, 5]].map(([a, b]) => pct(a, b)), hw: ['21 out of 30', pct(21, 30), 'Write as a percentage.'] } },
  },
});
