// Year 10 transition, Chapter 1 Financial mathematics: seven two-page lessons, each an Easy page and a Medium page of
// WE DO examples and YOU DO rounds. Easier than the Cambridge MATHS GOLD Year 10 chapter review it is based on:
// calculators allowed, friendly numbers. Each lesson is in lessons/<code>.js; every answer is calculated (../helpers.js).
module.exports = require('../chapter')({
  dir: __dirname, number: 1, title: 'Financial mathematics', art: 'gold-spiral', fileName: 'Year10-Transition-Ch01-Financial-Maths',
  plan: [['1.1', 'Percentages, fractions and decimals'], ['1.2', 'Percentage increase and decrease'], ['1.3', 'Profit, mark-up and discount'], ['1.4', 'Wages and overtime'],
    ['1.5', 'Commission, gross and net income'], ['1.6', 'Simple interest and loans'], ['1.7', 'Compound interest']],
  goals: ['change between percentages, fractions and decimals', 'find a percentage of an amount, and increase or decrease an amount by a percentage', 'work out profit, mark-ups and discounts',
    'calculate wages, overtime, commission and net income', 'calculate simple interest and compound interest'],
});
