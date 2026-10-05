// Chapter 1 Integers, designed from the research (../DESIGN.md, lib/own.js) in the pentagon theme (lib/penta.js).
// Ten lessons, each one double-sided sheet in its own rainbow colour, then a two-page chapter review.
const blended = require('../../year7-blend/ch01-integers/chapter.js');
const own = require('../../lib/own');
const P5 = require('../../lib/penta');
const content = require('./content');

const specs = blended.lessons.filter(({ spec }) => content[spec.code]).map(({ spec }) => spec);

module.exports = {
  ...blended,
  theme: 'penta',
  format: 'worksheet',
  homework: false,
  fileName: 'Year7-Ch01-Integers-Booklet',
  front: [P5.cover, P5.insideCover],
  lessonCodes: [...specs.map((s) => s.code), 'Review'],
  lessons: [
    ...specs.map((s) => own({ code: s.code, title: s.title }, content[s.code])),
    own.review({ code: 'Review', title: 'Chapter review', intro: 'No notes. Show your working. Calculator only where it says so.' }, content.REVIEW),
  ],
};
