// Chapter 1 Integers, designed from the research (../DESIGN.md, lib/own.js). One double-sided sheet per lesson.
// Ten lessons, then a two-page chapter review of mixed questions.
const blended = require('../../year7-blend/ch01-integers/chapter.js');
const own = require('../../lib/own');
const content = require('./content');

const HOWTO = `
    <div class="howto">
      <div><span class="step">1</span><span><b>Page 1: learn it.</b> Start with the <b>Do now</b>, from memory. Then read each worked <b>Example</b> and do the <b>Your turn</b> beside it. Each Your turn gives you a little less help.</span></div>
      <div><span class="step">2</span><span><b>Check.</b> Everyone answers the one question at the end of page 1. It tells your teacher who is ready for page 2.</span></div>
      <div class="we"><span class="zone-pill">PAGE 2</span><span><b>Spot the pattern</b>, then <b>Mixed practice</b>: today's skill mixed with earlier ones, so you have to choose the method. Finished? <b>Go further</b>.</span></div>
      <div class="you"><span class="zone-pill">EXIT</span><span>The <b>Exit ticket</b> is on your own. Circle how you went: Not yet, Nearly or Got it.</span></div>
    </div>`;

module.exports = {
  ...blended,
  format: 'worksheet',
  homework: false,
  kindLabel: 'Learn it · Practise it',
  howto: HOWTO,
  fileName: 'Year7-Ch01-Integers-Booklet',
  lessons: [
    ...blended.lessons.filter(({ spec }) => content[spec.code]).map(({ spec }) => own({ code: spec.code, title: spec.title }, content[spec.code])),
    own.review({ code: 'Review', title: 'Chapter review', intro: 'No notes. Show your working. Calculator only where it says so.' }, content.REVIEW),
  ],
};
