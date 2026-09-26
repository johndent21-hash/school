// Blended booklet, Chapter 5B Equations (exercises 5.10 to 5.13). The teacher's working space is split into
// "Balancing the sides" and "Inverse operations", as in the revision booklet's worked examples.
const blend = require('../../lib/blend');
const { F } = require('../../lib/calc');

const al = (s) => s.replace(/([a-zA-Z])/g, '<i>$1</i>');
const fa = (n, d) => F(al(n), al(d));
const solve = (text, pairs, hw, cols = 4) => ({ text, cols, items: pairs.map((p) => p[0]), ans: pairs.map((p) => p[1]), hw: [hw[0], hw[1], hw[2]] });
const EQ = (s) => s.replace(/([a-z])/g, '<i>$1</i>');

module.exports = blend(require('../../year7/ch05-algebra-equations/chapter.js'), {
  fileName: 'Year7-Ch05B-Equations-Lessons', pages: 4, accent: '#0b5345',
  only: ['5.10', '5.11', '5.12', '5.13'],
  chapter: { number: '5B', title: 'Equations',
    goals: ['check whether a value is a solution', 'solve equations by guess, check and improve', 'solve one-step and two-step equations using inverse operations', 'write and solve equations to solve problems'],
    syllabus: 'NSW Mathematics K–10 Syllabus (2022), Stage 4 Number and algebra: MA4-EQU-C-01 solves linear equations of up to two steps.' },
  more: {
    '5.10': { stems: ['Is the value a solution? Then solve by guess, check and improve.', 'Solve by guess, check and improve.', 'Solve by guess, check and improve.'],
      drill: solve('Quick drill: solve by guess and check.', [[EQ('x + 7 = 15'), '8'], [EQ('3y = 24'), '8'], [EQ('m − 5 = 9'), '14'], [EQ('2k + 3 = 11'), '4'], [EQ('5n = 45'), '9'], [EQ('p − 12 = 3'), '15']], [EQ('4a + 1 = 21'), '5', 'Solve by guess and check.'], 3) },
    '5.11': { exCols: ['Balancing the sides', 'Inverse operations'], stems: ['Solve. Show both methods.', 'Solve. Show both methods.', 'Solve. Show both methods.'],
      drill: solve('Quick drill: solve.', [[EQ('x + 9 = 4'), '−5'], [EQ('b − 6 = 9'), '15'], [EQ('m + 4 = 4'), '0'], [EQ('n − 15 = 5'), '20'], [EQ('8p = 56'), '7'], [EQ('4q = −20'), '−5'], [`${fa('r', '3')} = 7`, '21'], [EQ('c + 15 = 13'), '−2']], [EQ('e + 4 = −3'), '−7', 'Solve.']) },
    '5.12': { exCols: ['Balancing the sides', 'Inverse operations'], stems: ['Solve. Undo + or − first, then × or ÷.', 'Solve equations with a fraction.', 'Solve. Show every step.'],
      drill: solve('Quick drill: solve.', [[EQ('2x + 3 = 11'), '4'], [EQ('3y − 1 = 14'), '5'], [EQ('5a + 2 = 22'), '4'], [EQ('4m − 3 = 9'), '3'], [`${fa('k', '2')} + 1 = 5`, '8'], [`${fa('n', '3')} − 2 = 4`, '18']], [EQ('6t + 5 = 35'), '5', 'Solve.'], 3) },
    '5.13': { pages: 6, exCols: ['Write the equation', 'Solve it'], stems: ['Choose the equation, then solve it.', 'Write an equation, then solve it.', 'Write an equation, solve it and answer in a sentence.'],
      drill: solve('Quick drill: write an equation (use n), then solve it.', [['A number plus 11 is 30.', 'n + 11 = 30, n = 19'], ['A number times 6 is 42.', '6n = 42, n = 7'], ['A number minus 8 is 12.', 'n − 8 = 12, n = 20'], ['A number divided by 5 is 9.', 'n/5 = 9, n = 45']], ['Three times a number, plus 4, is 25.', '3n + 4 = 25, n = 7', 'Write an equation and solve it.'], 2) },
  },
});
