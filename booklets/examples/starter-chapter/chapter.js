// STARTER CHAPTER: copy this folder to make a new chapter (e.g. year7/ch13-something).
// Every lesson is plain data passed to lesson(). lib/lesson.js turns it into the same 4-page, one-hour layout:
//   page 1  start here (LI, SC, key terms, notes), Level 1 WE DO examples 1–2, YOU DO Set A
//   page 2  YOU DO Set B, Level 2 WE DO examples 3–4, YOU DO Set C
//   page 3  Level 3 WE DO examples 5–6, YOU DO Set D, tear-off "show off your skill" exit ticket
//   page 4  extension (worked example + 2 questions), lesson summary, blank back of the exit ticket
// Run: node build.js examples/starter-chapter   then fix anything the layout check reports.
const lesson = require('../../lib/lesson');
const D = require('../../lib/diagrams'); // number lines, angles, parallel lines, polygons, grids, number planes, prisms, spinners…
const { ev } = require('../../lib/calc'); // ev('3 × (−4)') → '−12': work answers out so the key is always right

module.exports = {
  year: 7, stage: 4, number: 0, title: 'Starter chapter',
  accent: '#7d3c98', // the chapter colour: cover spine, badge and page headers. Never blue or charcoal (YOU DO / WE DO).
  fileName: 'Starter-Chapter',
  goals: ['what students will learn, one line each'],
  syllabus: 'NSW Mathematics K–10 Syllabus (2022): the outcome codes for this chapter.',
  lessons: [
    lesson({
      code: '0.01', title: 'Lesson title', // one lesson per Test Yourself exercise
      li: ['learning intention'],
      sc: ['success criterion 1', 'success criterion 2', 'success criterion 3'],
      terms: ['Key term 1', 'Key term 2'], // 1–3 terms; students write definitions
      // 6 WE DO examples: 1–2 Level 1, 3–4 Level 2, 5–6 Level 3. A string, or { t, fig } for a diagram, or { t, draw } for a drawing space.
      we: ['2 + 3 × 4', { t: 'Mark −3 on the number line.', draw: `<div class="template-card">${D.numberLine({ min: -5, max: 5, w: 88, h: 18 })}</div>` }, '(2 + 3) × 4', '20 − 4 × 3', '3 × (−2) + 8', 'Explain why 2 + 3 × 4 is not 20.'],
      // Sets: A and B Level 1, C Level 2, D Level 3. kind 'short' = small answer boxes, 'work' = working boxes.
      // Options: cols, keepShort, stack (diagram above the box), figSide + fig (big diagram with questions beside it).
      a: { text: 'Evaluate.', kind: 'short', items: ['4 + 2 × 3', '10 − 6 ÷ 2', '5 × 2 + 1', '8 ÷ 4 + 3', '9 − 3 × 2', '7 + 8 ÷ 2'] },
      b: { text: 'Evaluate.', kind: 'short', items: ['(4 + 2) × 3', '(10 − 6) ÷ 2', '5 × (2 + 1)', '(8 + 4) ÷ 3', '2 × (9 − 3)', '(7 + 8) ÷ 5'] },
      c: { text: 'Evaluate. Show your working.', kind: 'work', cols: 3, items: ['20 − 4 × 3', '3 × (−2) + 8', '(5 − 9) × 2', '18 ÷ (2 + 4)', '6 + 12 ÷ 3 − 1', '2 × 3 + 4 × 5'] },
      d: { text: 'Harder questions.', kind: 'work', items: ['[3 + (8 − 2)] × 2', '40 ÷ (2 × 5) + 6', 'Insert brackets to make 2 + 3 × 4 = 20.', 'Write your own question with the answer 10.'] },
      ext: { q: 'Use four 4s and any operations to make 7.', steps: ['Try 44 ÷ 4 = 11', '11 − 4 = 7'], a: '44 ÷ 4 − 4 = 7', qs: ['Use four 4s to make 9.', 'Use four 4s to make 0 in two ways.'] },
      summary: { steps: ['Brackets first.', 'Then × and ÷ from left to right.', 'Then + and − from left to right.', 'Check with a calculator.'],
        worked: [['2 + 3 × 4', ['3 × 4 = 12', '2 + 12'], ev('2 + 3 × 4')], ['(2 + 3) × 4', ['5 × 4'], ev('(2 + 3) × 4')], ['3 × (−2) + 8', ['−6 + 8'], ev('3 × (−2) + 8')], ['Four 4s make 7', ['44 ÷ 4 − 4'], '7']] },
      exit: { qs: ['Evaluate 5 + 2 × 3.', 'Evaluate (5 + 2) × 3.', 'Evaluate 24 ÷ (2 + 6) − 5.'] }, // Level 1, 2, 3
      // Every question needs an answer: the build stops if a count does not match.
      ans: { we: [ev('2 + 3 × 4'), 'dot at −3', ev('(2 + 3) × 4'), ev('20 − 4 × 3'), ev('3 × (−2) + 8'), '× is done before +'],
        a: ['4 + 2 × 3', '10 − 6 ÷ 2', '5 × 2 + 1', '8 ÷ 4 + 3', '9 − 3 × 2', '7 + 8 ÷ 2'].map((e) => ev(e)),
        b: ['(4 + 2) × 3', '(10 − 6) ÷ 2', '5 × (2 + 1)', '(8 + 4) ÷ 3', '2 × (9 − 3)', '(7 + 8) ÷ 5'].map((e) => ev(e)),
        c: ['20 − 4 × 3', '3 × (−2) + 8', '(5 − 9) × 2', '18 ÷ (2 + 4)', '6 + 12 ÷ 3 − 1', '2 × 3 + 4 × 5'].map((e) => ev(e)),
        d: [ev('[3 + (8 − 2)] × 2'), ev('40 ÷ (2 × 5) + 6'), '(2 + 3) × 4', 'own question'], ext: ['e.g. 4 + 4 + 4 ÷ 4', 'e.g. 4 − 4 + 4 − 4 and 44 − 44'], exit: [ev('5 + 2 × 3'), ev('(5 + 2) × 3'), ev('24 ÷ (2 + 6) − 5')] },
    }),
  ],
};
