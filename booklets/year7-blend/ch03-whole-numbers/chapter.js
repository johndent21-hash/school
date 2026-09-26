// Blended booklet, Chapter 3 Whole numbers. Four pages a lesson (little diagram space needed; 3.10 factor trees get six).
const blend = require('../../lib/blend');
const { ev, fmt, gcd } = require('../../lib/calc');

const dr = (text, items, hw, cols = 4, lead) => ({ text, items, ans: items.map((e) => ev(e)), hw: [hw, ev(hw), lead], cols });
const round = (n, to) => fmt(Math.round(n / to) * to);
const roman = (n) => [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']].reduce((s, [v, r]) => { while (n >= v) { s += r; n -= v; } return s; }, '');
const sup = (p) => `<sup>${p}</sup>`;
const isPrime = (n) => { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };
const hcf = (a, b) => String(gcd(a, b));
const lcm = (a, b) => String((a * b) / gcd(a, b));

module.exports = blend(require('../../year7/ch03-whole-numbers/chapter.js'), {
  fileName: 'Year7-Ch03-Whole-numbers-Lessons', pages: 4,
  more: {
    '3.01': { stems: ['Round 87 531 to the place given.', 'Estimate by rounding each number first.', 'Estimate by rounding each number first.'],
      drill: { text: 'Quick drill: round to the nearest hundred.', cols: 4, items: ['348', '1250', '7963', '15 049', '99 950', '608'], ans: [348, 1250, 7963, 15049, 99950, 608].map((n) => round(n, 100)), hw: ['4 862', '4900', 'Round to the nearest hundred.'] } },
    '3.02': { stems: ['Evaluate mentally.', 'Evaluate using the strategy given.', 'Evaluate on paper.'],
      drill: dr('Quick drill: evaluate mentally.', ['7 × 8', '9 × 6', '12 × 5', '40 × 3', '11 × 12', '25 × 6', '6 × 70', '8 × 125'], '15 × 4') },
    '3.03': { stems: ['Evaluate mentally.', 'Use short division.', 'Use short division.'],
      drill: dr('Quick drill: evaluate mentally.', ['56 ÷ 7', '81 ÷ 9', '120 ÷ 10', '4500 ÷ 100', '96 ÷ 8', '132 ÷ 11', '64 ÷ 4', '250 ÷ 5'], '144 ÷ 6') },
    '3.04': { stems: ['Use the tests for 2, 5 and 10, then for 3 and 9.', 'Use the tests for 4, 8 and 6.', 'Use divisibility tests to answer.'],
      drill: { text: 'Quick drill: find the digit sum. Is the number divisible by 3?', cols: 4, items: ['471', '1000', '2226', '5832', '1208', '999', '4815', '7102'], ans: ['12, yes', '1, no', '12, yes', '18, yes', '11, no', '27, yes', '18, yes', '10, no'], hw: ['2 541', '12, yes', 'Find the digit sum. Is it divisible by 3?'] } },
    '3.05': { stems: ['Use long division.', 'Use long division. Write any remainder.', 'Use long division, then answer the question.'],
      drill: dr('Quick drill: know your multiples.', ['13 × 4', '14 × 6', '23 × 3', '21 × 5', '18 × 4', '17 × 3', '22 × 4', '19 × 5'], '16 × 6') },
    '3.06': { stems: ['Write each Roman numeral as a number.', 'Write as a number, then write in Roman numerals.', 'Write each number in Roman numerals.'],
      drill: { text: 'Quick drill: write each number in Roman numerals.', cols: 4, items: ['3', '9', '14', '19', '40', '52', '99', '150'], ans: [3, 9, 14, 19, 40, 52, 99, 150].map(roman), hw: ['86', roman(86), 'Write in Roman numerals.'] } },
    '3.07': { stems: ['Write in index notation.', 'Evaluate each power.', 'Evaluate each power.'],
      drill: { text: 'Quick drill: evaluate each power.', cols: 4, items: [`2${sup(3)}`, `3${sup(2)}`, `5${sup(2)}`, `10${sup(3)}`, `4${sup(2)}`, `2${sup(5)}`, `1${sup(8)}`, `3${sup(3)}`], ans: ['8', '9', '25', '1000', '16', '32', '1', '27'], hw: [`2${sup(6)}`, '64', 'Evaluate the power.'] } },
    '3.08': { stems: ['Evaluate each square root.', 'Evaluate each cube root.', 'Evaluate, then estimate.'],
      drill: { text: 'Quick drill: evaluate.', cols: 4, items: ['√25', '√64', '√121', '√400', '∛27', '∛64', '∛125', '∛1000'], ans: ['5', '8', '11', '20', '3', '4', '5', '10'], hw: ['√169', '13', 'Evaluate.'] } },
    '3.09': { stems: ['List the factors, then decide.', 'List the primes, then decide.', 'List the numbers.'],
      drill: { text: 'Quick drill: prime (P) or composite (C)?', cols: 4, items: ['13', '21', '29', '33', '41', '49', '57', '61'], ans: [13, 21, 29, 33, 41, 49, 57, 61].map((n) => (isPrime(n) ? 'P' : 'C')), hw: ['37', 'P', 'Prime or composite?'] } },
    '3.10': { pages: 6, stems: ['Draw a factor tree for each number.', 'Write each number as a product of primes in index notation.', 'Use prime factors to find each root.'],
      drill: { text: 'Quick drill: write as a product of two prime numbers.', cols: 4, items: ['6', '15', '21', '35', '22', '39', '26', '77'], ans: ['2 × 3', '3 × 5', '3 × 7', '5 × 7', '2 × 11', '3 × 13', '2 × 13', '7 × 11'], hw: ['55', '5 × 11', 'Write as a product of two primes.'] } },
    '3.11': { stems: ['Find the HCF by listing factors.', 'Find the HCF.', 'Use factor trees to find the HCF.'],
      drill: { text: 'Quick drill: find the HCF.', cols: 4, items: ['4 and 6', '9 and 12', '10 and 25', '8 and 20', '18 and 24', '7 and 21', '15 and 40', '12 and 30'], ans: [[4, 6], [9, 12], [10, 25], [8, 20], [18, 24], [7, 21], [15, 40], [12, 30]].map(([a, b]) => hcf(a, b)), hw: ['16 and 40', hcf(16, 40), 'Find the HCF.'] } },
    '3.12': { stems: ['Find the LCM by listing multiples.', 'Find the LCM.', 'Use factor trees to find the LCM.'],
      drill: { text: 'Quick drill: find the LCM.', cols: 4, items: ['2 and 5', '3 and 4', '4 and 10', '6 and 9', '5 and 8', '6 and 10', '8 and 12', '9 and 12'], ans: [[2, 5], [3, 4], [4, 10], [6, 9], [5, 8], [6, 10], [8, 12], [9, 12]].map(([a, b]) => lcm(a, b)), hw: ['10 and 15', lcm(10, 15), 'Find the LCM.'] } },
  },
});
