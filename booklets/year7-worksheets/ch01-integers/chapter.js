// Chapter 1 Integers as three-column worksheets (lib/worksheet.js), one page per lesson, in the style of the
// Freefall Mathematics worksheets. The questions, with their working steps, are in content.js.
module.exports = require('../../lib/worksheet-chapter')(__dirname, require('../../year7-blend/ch01-integers/chapter.js'), require('./content'), { numberLine: { min: -15, max: 15 } });
