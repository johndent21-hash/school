// A Year 10 transition chapter: two-page lessons (lib/lesson-two.js), one file each in <chapter>/lessons/<code>.js,
// with the gold-theme cover and inside cover (lib/gold-front.js). Each chapter's chapter.js calls this.
//   node build.js year10-transition/<chapter>            the booklet and its answers
//   node build.js year10-transition/preview/<code>       one lesson on its own (see preview/README.md)
const fs = require('fs');
const path = require('path');
const two = require('../lib/lesson-two');
const front = require('../lib/gold-front');

module.exports = ({ dir, number, title, art, fileName, plan, goals }) => {
  const file = (code) => path.join(dir, 'lessons', `${code}.js`);
  const lesson = (code) => two(require(file(code)));
  const lessons = plan.map(([code, t]) => ({ code, title: t }));
  const chapter = {
    year: 10, number, title, series: 'Year 10 transition',
    fileName, art, accent: '#0b3d2e', bodyClass: 'theme-mb theme-gold',
    homework: false,
    plan: lessons, // every lesson, for the cover and contents
    goals,
    front: [front.cover, front.insideCover],
    lessons: lessons.filter((p) => fs.existsSync(file(p.code))).map((p) => lesson(p.code)),
  };
  // One lesson on its own, with no front pages, for checking a lesson while it is written.
  chapter.only = (code) => ({ ...chapter, front: [], fileName: `Preview-${code}`, lessons: [lesson(code)] });
  return chapter;
};
