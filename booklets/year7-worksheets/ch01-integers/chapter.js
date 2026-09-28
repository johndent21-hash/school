// Chapter 1 worksheets: two pages (one double-sided sheet) a lesson, six steps from Easy to Challenging.
// Lessons written out in full in content3.js (the calm Freefall-style pilot) replace the generated ones in content2.js.
module.exports = require('../../lib/worksheet-chapter')(__dirname, require('../../year7-blend/ch01-integers/chapter.js'), { ...require('./content2'), ...require('./content3') }, { numberLine: { min: -15, max: 15 }, twoPage: true });
