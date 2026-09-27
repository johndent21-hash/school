// Chapter 1 Integers as three-column worksheets (lib/worksheet.js), one page per lesson, in the style of the
// Freefall Mathematics worksheets. The questions, with their working steps, are in content.js.
const worksheet = require('../../lib/worksheet');
const { kit } = require('../../lib/drill');
const blended = require('../../year7-blend/ch01-integers/chapter.js');
const content = require('./content');

module.exports = {
  ...blended,
  format: 'worksheet',
  homework: false,
  fileName: 'Year7-Ch01-Integers-Worksheets',
  lessons: blended.lessons.map(({ spec }) => worksheet({ code: spec.code, title: spec.title, numberLine: { min: -15, max: 15 } }, content[spec.code](kit(`worksheet ${spec.code}`)))),
};
