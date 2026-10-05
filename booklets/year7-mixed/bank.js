// Every lesson of the series in teaching order, for the questions from earlier lessons (lib/mixed.js).
// Year 6 skills come first, for the start of Chapter 1. A chapter whose content.js is missing is skipped.
const fs = require('fs'), path = require('path');

const ORDER = ['ch01-integers', 'ch02-angles', 'ch03-whole-numbers', 'ch04-fractions-percentages', 'ch05a-algebra', 'ch05b-equations',
  'ch06-geometrical-figures', 'ch07-decimals', 'ch08-area-volume', 'ch09-number-plane', 'ch10-analysing-data', 'ch11-probability', 'ch12-ratios-rates-time'];

module.exports = () => [
  ...Object.entries(require('./year6')).map(([code, L]) => ({ code, L: { ...L, tag: 'Year 6' } })),
  ...ORDER.flatMap((d) => {
    const file = path.join(__dirname, d, 'content.js');
    return fs.existsSync(file) ? Object.entries(require(file)).map(([code, L]) => ({ code, L })) : [];
  }),
];
module.exports.ORDER = ORDER;
