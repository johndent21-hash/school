// Blended booklet, Chapter 5A Algebra (exercises 5.01 to 5.09). Chapter 5 is split in two, like the revision booklets.
const blend = require('../../lib/blend');
const { ev, F } = require('../../lib/calc');

const al = (s) => s.replace(/([a-zA-Z])/g, '<i>$1</i>').replace(/\^(\d+)/g, '<sup>$1</sup>').replace(/(^|[\s(=×÷])-/g, '$1−').replace(/ - /g, ' − ');
const fa = (n, d) => F(al(n), al(d));
const dr = (text, items, hw, cols = 4) => ({ text, items, ans: items.map((e) => ev(e)), hw: [hw, ev(hw)], cols });
// Word questions: only the single-letter pronumerals go in italics.
const alw = (s) => s.replace(/\b([a-zA-Z])\b/g, '<i>$1</i>');
const alD = (text, pairs, hw, cols = 4) => ({ text, cols, items: pairs.map((p) => alw(p[0])), ans: pairs.map((p) => al(p[1])), hw: [alw(hw[0]), al(hw[1]), hw[2]] });

module.exports = blend(require('../../year7/ch05-algebra-equations/chapter.js'), {
  fileName: 'Year7-Ch05A-Algebra-Lessons', pages: 4, accent: '#148f77',
  only: ['5.01', '5.02', '5.03', '5.04', '5.05', '5.07', '5.08', '5.09'],
  chapter: { number: '5A', title: 'Algebra',
    goals: ['use the commutative, associative and distributive laws', 'use variables and algebraic notation', 'write expressions from words', 'substitute into expressions and formulas', 'add, subtract, multiply and divide algebraic terms'],
    syllabus: 'NSW Mathematics K–10 Syllabus (2022), Stage 4 Number and algebra: MA4-ALG-C-01 generalises number properties to operate with algebraic expressions.' },
  more: {
    '5.01': { stems: ['Evaluate by pairing friendly numbers.', 'Evaluate by pairing friendly numbers.', 'Evaluate mentally.'],
      drill: dr('Quick drill: pair friendly numbers.', ['6 + 27 + 4', '55 + 19 + 45', '2 × 43 × 5', '4 × 9 × 25', '8 + 71 + 2', '20 × 7 × 5', '33 + 48 + 7', '5 × 13 × 2'], '25 × 17 × 4') },
    '5.02': { stems: ['Use the distributive law.', 'Use the distributive law.', 'Use the distributive law.'],
      drill: dr('Quick drill: use the distributive law.', ['16 × 5', '21 × 6', '19 × 4', '32 × 3', '99 × 7', '41 × 5', '18 × 9', '102 × 4'], '49 × 6') },
    '5.03': { stems: ['Write the rule, then simplify.', 'Simplify.', 'Write in expanded form.'],
      drill: alD('Quick drill: simplify.', [['a + a + a', '3a'], ['4 × b', '4b'], ['y × 3 × 2', '6y'], ['m × n', 'mn'], ['k × k', 'k^2'], ['p ÷ 3', 'p/3'], ['2 × x × y × 5', '10xy'], ['t + t − t', 't']], ['c × 7 × d', '7cd', 'Simplify.']) },
    '5.04': { stems: ['Write an expression using N.', 'Write an expression.', 'Write an expression.'],
      drill: alD('Quick drill: write an expression.', [['5 more than x', 'x + 5'], ['x less 8', 'x - 8'], ['double x', '2x'], ['x shared by 3', 'x/3'], ['x squared', 'x^2'], ['the product of x and y', 'xy']], ['10 less than 4 times x', '4x - 10', 'Write an expression.'], 3) },
    '5.05': { stems: ['Substitute a = 2, b = 5 and c = 6.', 'Substitute, then use the formula C = 30h + 19.', 'Substitute into C = 30h + 19.'],
      drill: { text: 'Quick drill: if x = 3 and y = 4, evaluate.', cols: 4, items: ['x + y', '2x', 'xy', 'y − x', '5y', 'x²', '3x + y', '10 − y'].map(al), ans: ['7', '6', '12', '1', '20', '9', '13', '6'], hw: [al('2x + 3y'), '18', 'If x = 3 and y = 4, evaluate.'] } },
    '5.07': { stems: ['Simplify by collecting like terms.', 'Simplify by collecting like terms.', 'Simplify. Collect each kind of term separately.'],
      drill: alD('Quick drill: simplify.', [['4a + 3a', '7a'], ['9x − 5x', '4x'], ['2m + m', '3m'], ['6k − k', '5k'], ['3p + 2q + p', '4p + 2q'], ['8y − 3y + y', '6y'], ['5ab + 2ab', '7ab'], ['7c − 7c', '0']], ['6t + 4 + 2t', '8t + 4', 'Simplify.']) },
    '5.08': { stems: ['Simplify.', 'Simplify.', 'Simplify. Watch the signs.'],
      drill: alD('Quick drill: simplify.', [['5 × 2x', '10x'], ['3a × 4', '12a'], ['x × y × 2', '2xy'], ['m × m', 'm^2'], ['2p × 3q', '6pq'], ['4k × k', '4k^2'], ['-3 × 5y', '-15y'], ['-2a × (-4b)', '8ab']], ['6x × 3y', '18xy', 'Simplify.']) },
    '5.09': { stems: ['Simplify.', 'Simplify. Write the division as a fraction.', 'Simplify.'],
      drill: alD('Quick drill: simplify.', [['12a ÷ 4', '3a'], ['18m ÷ 6', '3m'], ['10x ÷ x', '10'], ['24pq ÷ 8p', '3q'], ['6ab ÷ 3b', '2a'], ['15k ÷ 5k', '3']], ['28xy ÷ 7y', '4x', 'Simplify.'], 3) },
  },
});
