// Chapter 1 worksheets: calm two-page lessons (one double-sided sheet each), every question written out in
// content3.js. content.js (one page a lesson) and content2.js (generated two-page lessons) are kept for reference.
module.exports = require('../../lib/worksheet-chapter')(__dirname, require('../../year7-blend/ch01-integers/chapter.js'), require('./content3'), { numberLine: { min: -15, max: 15 }, twoPage: true });
