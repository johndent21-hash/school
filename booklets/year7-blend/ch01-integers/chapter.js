// Blended booklet, Chapter 1 Integers: the lessons of year7/ch01-integers, plus quick drill from the revision booklet.
const blend = require('../../lib/blend');
const { ev } = require('../../lib/calc');

// Quick drill of expressions: answers worked out, not typed.
const dr = (text, items, hw, cols = 4) => ({ text, items, ans: items.map((e) => ev(e)), hw: [hw, ev(hw)], cols });
const cmp = (a, b) => (ev(a).replace('−', '-') * 1 < ev(b).replace('−', '-') * 1 ? '<' : '>');
const lt = (pairs) => pairs.map(([a, b]) => `${a} ☐ ${b}`);

module.exports = blend(require('../../year7/ch01-integers/chapter.js'), {
  fileName: 'Year7-Ch01-Integers-Lessons', pages: 4,
  more: {
    '1.01': {
      stems: ['Write an integer for each situation, or its opposite.', 'Use integers to describe the movement.', 'Use opposites to find the number.'],
      drill: { text: 'Write the opposite of each integer.', cols: 3,
        items: ['−8', '12', '−25', '0', '40', '−1'],
        ans: ['8', '−12', '25', '0', '−40', '1'], hw: ['−13', '13', 'Write the opposite of the integer.'] },
    },
    '1.02': { stems: ['Mark the integers on the number line.', 'Mark the integers, then answer the question.', 'Choose a scale, then mark the integers.'] },
    '1.03': {
      stems: ['Decide true or false, then order the integers.', 'Write < or >, then order the integers.', 'Order the integers.'],
      drill: { text: 'Write < or > in the box.', cols: 4, items: lt([['−5', '−1'], ['−9', '−3'], ['0', '−4'], ['−6', '−7'], ['3', '−3'], ['−10', '2'], ['−15', '−20'], ['−30', '−3']]),
        ans: [['−5', '−1'], ['−9', '−3'], ['0', '−4'], ['−6', '−7'], ['3', '−3'], ['−10', '2'], ['−15', '−20'], ['−30', '−3']].map(([a, b]) => cmp(a, b)), hw: ['−7 ☐ −4', '<', 'Write < or > in the box.'] },
    },
    '1.04': { stems: ['Evaluate. Use the number line for part a.', 'Evaluate.', 'Solve.'],
      drill: dr('Quick drill: evaluate each sum.', ['−6 + 9', '−8 + (−5)', '3 + (−7)', '−4 + 10', '−12 + 5', '6 + (−11)', '−3 + (−6)', '15 + (−8)', '−20 + 4', '2 + (−9)'], '−14 + 6') },
    '1.05': { stems: ['Evaluate.', 'Evaluate.', 'Solve.'],
      drill: dr('Quick drill: evaluate.', ['10 − (−3)', '−5 − (−8)', '−3 − 8', '−6 − 4', '2 − (−9)', '−11 − (−4)', '0 − 7', '14 − (−6)', '−15 − 3', '−20 − (−5)'], '−4 − (−9)') },
    '1.06': { stems: ['Evaluate each product.', 'Evaluate.', 'Find the missing number, or explain.'],
      drill: dr('Quick drill: evaluate each product.', ['−3 × (−5)', '−7 × 2', '8 × (−3)', '−9 × (−2)', '5 × (−6)', '−4 × 7', '−10 × (−10)', '12 × (−2)', '−8 × 4', '−6 × (−6)'], '−11 × (−3)') },
    '1.07': { stems: ['Evaluate each quotient.', 'Evaluate. Work from left to right.', 'Solve.'],
      drill: dr('Quick drill: evaluate each quotient.', ['−36 ÷ 9', '−24 ÷ (−6)', '45 ÷ (−5)', '−40 ÷ 8', '−18 ÷ (−3)', '−56 ÷ 7', '30 ÷ (−6)', '−27 ÷ (−9)', '63 ÷ (−9)', '−72 ÷ (−8)'], '−48 ÷ 6') },
    '1.08': { stems: ['Evaluate. Use the order of operations.', 'Evaluate. Brackets first.', 'Evaluate. Show every step.'],
      drill: dr('Quick drill: evaluate. × and ÷ before + and −.', ['−3 + 4 × 2', '5 − 3 × (−4)', '−10 ÷ 2 + (−3)', '8 + (−2) × 3', '−6 × 2 + 5', '12 ÷ (−4) − 1', '−2 + (−3) × 4', '9 − 6 ÷ 3', '4 × (−3) − 2', '7 + 8 ÷ (−2)'], '−5 + 2 × (−3)') },
    '1.09': { stems: ['Use your calculator to evaluate.', 'Use your calculator. Enter the brackets.', 'Use your calculator.'],
      drill: dr('Quick drill: use your calculator.', ['−127 + 58', '−93 − 47', '−36 × 25', '−1260 ÷ (−35)', '482 − 715', '−19 × (−21)', '−2048 ÷ 64', '−350 + 1275'], '−64 × 15') },
    '1.10': { stems: ['Write a number sentence, then answer.', 'Write a number sentence, then answer.', 'Write a number sentence, then answer.'] },
  },
});
