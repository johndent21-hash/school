// Year 10 transition, Chapter 1 Financial mathematics: seven two-page lessons (lib/lesson-two.js), each an Easy page
// and a Medium page of WE DO examples and YOU DO rounds. Easier than the Cambridge MATHS GOLD Year 10 chapter
// review it is based on: calculators allowed, friendly numbers. Each lesson is in lessons/<code>.js, and every
// answer is calculated (helpers.js).
//   node build.js year10-transition/ch01-financial-maths        the booklet and its answers
//   node build.js year10-transition/preview/1.4                 one lesson on its own (see preview/README)
const fs = require('fs');
const path = require('path');
const two = require('../../lib/lesson-two');
const front = require('../../lib/gold-front');

const plan = [['1.1', 'Percentages, fractions and decimals'], ['1.2', 'Percentage increase and decrease'], ['1.3', 'Profit, mark-up and discount'], ['1.4', 'Wages and overtime'],
  ['1.5', 'Commission, gross and net income'], ['1.6', 'Simple interest and loans'], ['1.7', 'Compound interest']].map(([code, title]) => ({ code, title }));
const file = (code) => path.join(__dirname, 'lessons', `${code}.js`);
const lesson = (code) => two(require(file(code)));

const chapter = {
  year: 10, number: 1, title: 'Financial mathematics', series: 'Year 10 transition',
  fileName: 'Year10-Transition-Ch01-Financial-Maths', art: 'gold-spiral', accent: '#0b3d2e', bodyClass: 'theme-mb theme-gold',
  homework: false,
  plan, // every lesson, for the cover and contents
  goals: ['change between percentages, fractions and decimals', 'find a percentage of an amount, and increase or decrease an amount by a percentage', 'work out profit, mark-ups and discounts',
    'calculate wages, overtime, commission and net income', 'calculate simple interest and compound interest'],
  front: [front.cover, front.insideCover],
  lessons: plan.filter((p) => fs.existsSync(file(p.code))).map((p) => lesson(p.code)),
};

// One lesson on its own, with no front pages, for checking a lesson while it is written.
chapter.only = (code) => ({ ...chapter, front: [], fileName: `Preview-${code}`, lessons: [lesson(code)] });

module.exports = chapter;
