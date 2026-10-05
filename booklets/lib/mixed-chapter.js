// A mixed-practice worksheet booklet (lib/mixed.js) made from a blended chapter (for its title, goals, colour, artwork
// and lesson list) and the chapter's content.js. Questions from earlier lessons come from year7-mixed/bank.js.
const path = require('path');
const mixed = require('./mixed');
const MB = require('./blend-front');

const HOWTO = `
    <div class="howto">
      <div><span class="step">1</span><span>Each lesson is <b>one double-sided sheet</b>. Write your name, class and date at the top.</span></div>
      <div class="we"><span class="zone-pill">WE DO</span><span><b>The grey box at the top.</b> Your teacher shows the key idea with two or three examples. <b>Copy every step</b> into the space.</span></div>
      <div><span class="step">2</span><span>Then work down the <b>columns</b>, left to right. They get harder as you go: <b class="lvl-word l1">Easy</b> <b class="lvl-word l1">Easy</b> <b class="lvl-word l2">Medium</b> on page 1, then <b class="lvl-word l2">Medium</b> <b class="lvl-word l3">Challenging</b> <b class="lvl-word l3">Challenging</b> on page 2.</span></div>
      <div><span class="step">3</span><span>Most questions practise <b>today's skill</b>. A question marked <span class="mx-from">from 1.03</span> comes from an earlier lesson, to keep it fresh. Stuck? Look back at that lesson.</span></div>
      <div style="grid-column: 1 / -1"><span class="step">4</span><span>Each question tells you what to do: read it carefully. Show your working on the lines. The first question with working in each Easy column shows you how to set it out.</span></div>
    </div>`;

module.exports = (dir, blended) => {
  const content = require(path.join(dir, 'content.js'));
  const bank = require('../year7-mixed/bank')();
  return {
    ...blended,
    format: 'worksheet',
    homework: false,
    fit: mixed.fit,
    kindLabel: 'Mixed practice worksheets',
    howto: HOWTO,
    fileName: blended.fileName.replace(/-Lessons$/, '-Mixed-Practice'),
    front: [MB.worksheetCover, MB.insideCover],
    lessons: blended.lessons.map(({ spec }) => {
      if (!content[spec.code]) throw new Error(`no mixed-practice content for ${spec.code}`);
      return mixed({ code: spec.code, title: spec.title }, content[spec.code], bank);
    }),
  };
};
