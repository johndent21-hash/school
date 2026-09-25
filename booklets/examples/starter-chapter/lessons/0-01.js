// STARTER LESSON: a complete, commented lesson using every building block.
// Copy this file, rename it (e.g. 11-01.js), add it to chapter.js, and replace the content.
// For bigger real examples, see year7/ch10-analysing-data/lessons/.
//
// Page rules (the build checks these and warns you):
//  - A lesson has an even number of pages (2, 4 or 6).
//  - The exit ticket goes at the bottom of the second-last page; the last page ends with L.tearBack()
//    so the back of the ticket is blank when it is torn off.
//  - Nothing may overflow a page. If the build says "content overflows", move something to another page.
//
// Colours: WE DO (charcoal) = copy the teacher. YOU DO (blue) = work alone. Do not use them for anything else.

const G = require('../../../lib/graphs');   // graphs and drawing templates
const S = require('../../../lib/stats');    // mean, median, mode, range (use these for answers)
const { banner, weDo, youDo, q, qDraw, qs, qsGrid, qGrid, extension, example, worked, graphCard, split, makeLesson } = require('../../../lib/layout');

module.exports = (chapter) => {
  // The lesson code and title appear on the lesson badge, page headers and contents page.
  const L = makeLesson({ chapter, code: '0.01', title: 'A sample lesson' });

  const data = [4, 7, 5, 8, 6, 7, 3];

  const pages = [
    // ---------- PAGE 1 ----------
    // { first: true } gives the lesson title, date line, learning intentions, success criteria and key terms.
    L.page('Start here · Level 1', `
      ${L.intro({
        li: ['learning intention 1', 'learning intention 2'],
        sc: ['success criterion 1', 'success criterion 2', 'success criterion 3'],
        terms: ['Term one', 'Term two', 'Term three'],   // 1 to 3 key terms
      })}
      ${L.notes()}
      ${banner(1)}
      ${split(
        graphCard(G.dotPlot({ title: 'A dot plot', min: 3, max: 8, counts: { 3: 1, 4: 1, 5: 1, 6: 1, 7: 2, 8: 1 } })),
        weDo(`<div class="col">${example('Example 1', 'First teacher example.')}${example('Example 2', 'Second teacher example.')}</div>`, 'fill'),
      )}
      ${youDo('Set A. Short answers go in the box on the right.', qsGrid(['Question one', 'Question two', 'Question three', 'Question four', 'Question five',
        'Question six', 'Question seven', 'Question eight', 'Question nine', 'Question ten']))}
    `, { first: true }),

    // ---------- PAGE 2 (last page) ----------
    // A 2-page lesson has its exit ticket on page 1 in a real booklet; here we show the other pieces instead.
    // In a 4-page lesson: page 3 ends with L.exitTicket({...}) and page 4 ends with L.tearBack().
    L.page('Level 2 · Summary', `
      ${banner(2)}
      ${weDo(split(example('Example 3', 'A teacher example with a working box.'),
        example('Example 4', 'A teacher example with a drawing template.', `<div class="template-card">${G.dotPlotTemplate({ min: 0, max: 10, w: 88, h: 22 })}</div>`), 'ex-row tall'))}
      ${youDo('Set B. Show your working.', `<div class="work-grid r2">
        ${q(1, `Find the mean of ${data.join(', ')}.`)}
        ${q(2, 'A question with a working box.')}
        ${qDraw(3, 'Draw a stem-and-leaf plot.', G.stemLeafTemplate({ stems: [1, 2, 3] }))}
        ${qDraw(4, 'Draw a column graph.', G.gridPaper())}
      </div>`, 'grow')}
      ${L.summaryBanner}
      <div class="summary-grid">
        <div class="steps-card"><b>Remember</b><ol><li>Step one.</li><li>Step two.</li><li>Step three.</li><li>Step four.</li></ol></div>
        ${worked(1, 'Level 1', 'Question', ['Step 1', 'Step 2'], '<b>Answer:</b> ...')}
        ${worked(2, 'Level 2', 'Question', ['Step 1', 'Step 2'], '<b>Answer:</b> ...')}
        ${worked(3, 'Level 3', 'Question', ['Step 1', 'Step 2'], '<b>Answer:</b> ...')}
        ${worked(4, 'Extension', 'Question', ['Step 1', 'Step 2'], '<b>Answer:</b> ...')}
      </div>
    `),
  ];

  // Answers go into the separate teacher answer-key PDF. Calculate statistics with S so they are always right.
  const answers = [
    ['Set A', ['answer 1', 'answer 2', 'answer 3', 'answer 4', 'answer 5', 'answer 6', 'answer 7', 'answer 8', 'answer 9', 'answer 10']],
    ['Set B', [`mean = ${S.fmt(S.mean(data))}`, '...', '...', '...']],
  ];

  return { code: '0.01', title: 'A sample lesson', pages, answers };
};
