// Chapter 1 Integers, designed from the research (../DESIGN.md, lib/own.js) in the times-table circles theme
// (lib/circles.js). Ten lessons, each one double-sided sheet, then a two-page chapter review.
const blended = require('../../year7-blend/ch01-integers/chapter.js');
const own = require('../../lib/own');
const TC = require('../../lib/circles');
const content = require('./content');

const specs = blended.lessons.filter(({ spec }) => content[spec.code]).map(({ spec }) => spec);

module.exports = {
  ...blended,
  theme: 'circles', palette: 'teal',
  format: 'worksheet',
  homework: false,
  fileName: 'Year7-Ch01-Integers-Booklet',
  front: [TC.cover, TC.insideCover],
  lessonCodes: [...specs.map((s) => s.code), 'Review'],
  lessons: [
    ...specs.map((s) => own({ code: s.code, title: s.title }, content[s.code])),
    own.review({ code: 'Review', title: 'Chapter review', intro: 'No notes. Show your working. Calculator only where it says so.' }, content.REVIEW),
  ],
};
