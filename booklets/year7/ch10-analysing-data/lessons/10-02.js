// 10.02 Misleading graphs: axes that don't start at 0, uneven scales, missing data, pictures that grow in two directions.
const G = require('../../../lib/graphs');
const { banner, weDo, youDo, q, qDraw, qs, example, worked, graphCard, split, makeLesson } = require('../../../lib/layout');

module.exports = (chapter) => {
  const L = makeLesson({ chapter, code: '10.02', title: 'Misleading graphs' });
  const { C } = G;

  const g = {
    captain: G.columnGraph({ title: 'Votes for class captain', cats: ['Ava', 'Ben'], values: [52, 48], yMin: 46, max: 54, step: 1, labelEvery: 2, yTitle: 'Votes', h: 50 }),
    canteen: G.lineGraph({ title: 'Canteen sales', xs: ['2019', '2020', '2021', '2022', '2023', '2024'], ys: [41, 40, 43, 44, 45, 46], yMin: 39, max: 47, step: 1, labelEvery: 2, yTitle: 'Sales ($ thousands)', xTitle: 'Year', h: 50 }),
    P: G.columnGraph({ title: 'Graph P: students buying lunch', cats: ['Term 1', 'Term 2'], values: [120, 130], yMin: 115, max: 135, step: 5, labelEvery: 5, yTitle: 'Students', h: 46 }),
    Q: G.columnGraph({ title: 'Graph Q: students buying lunch', cats: ['Term 1', 'Term 2'], values: [120, 130], max: 140, step: 10, labelEvery: 20, yTitle: 'Students', h: 46 }),
    S: G.sectorGraph({ title: 'Favourite sport of Year 7', slices: [['Soccer\n45%', 45, C.blue, true], ['Netball\n30%', 30, C.charcoal, true], ['Cricket 20%', 20, C.sand], ['Other 15%', 15, C.lightBlue]], h: 46 }),
    T: G.lineGraph({ title: 'Visitors to the town museum', xs: ['2000', '2010', '2020', '2022', '2024'], ys: [10, 20, 30, 32, 34], max: 40, step: 2, labelEvery: 10, yTitle: 'Visitors (thousands)', xTitle: 'Year', h: 46 }),
    V: G.columnGraph({ title: 'Phone sales by brand', cats: ['Brand A', 'Brand B', 'Brand C'], values: [205, 200, 210], yMin: 195, max: 215, step: 5, labelEvery: 5, yTitle: 'Sales (thousands)', h: 46 }),
    exit: G.columnGraph({ title: 'Points scored', cats: ['Team A', 'Team B'], values: [84, 88], yMin: 80, max: 90, step: 2, labelEvery: 2, yTitle: 'Points', w: 60, h: 46 }),
  };

  const setA = [
    'The vertical axis starts at 0.', 'The vertical axis starts at 90, not 0.', 'The scale goes 0, 10, 20, 50, 100 with equal gaps.', 'Both axes are labelled with units.',
    'One bar is drawn wider than the others.', 'The graph has a clear title.', 'Some years are left out of a line graph.', 'A tilted 3D pie makes the front sector look bigger.',
    'The gridlines are evenly spaced.', 'A picture is drawn taller <b>and</b> wider to show a bigger value.',
  ];
  const setB = ['What were sales in 2019?', 'In which year were sales lowest?', 'What does the vertical axis start at?', 'Should it start at 0? (yes/no)', 'How much did sales rise from 2020 to 2024?',
    'On the graph, 2024 looks how many times higher than 2020?', 'True or false: sales more than doubled.', 'Which year had the biggest rise?', 'Are the axes labelled? (yes/no)', 'Name one thing that makes it misleading.'];
  const setC = ['Graph P: what does the vertical axis start at?', 'Graph Q: what does the vertical axis start at?', 'How many more students bought lunch in Term 2?',
    'In Graph P, Term 2’s bar looks how many times as tall as Term 1’s?', 'Which graph would the canteen use to show a big jump? Why?',
    'Sector graph: add the percentages. What is the total?', 'Why is the sector graph misleading?', 'Line graph: how many years are between 2000 and 2010?',
    'Line graph: how many years are between 2020 and 2022?', 'Why is the line graph’s horizontal axis misleading?'];

  const pages = [
    L.page('Start here · Level 1', `
      ${L.intro({
        li: ['spot features that make a graph misleading', 'explain the false impression a misleading graph gives', 'redraw a misleading graph so it is fair'],
        sc: ['check whether the vertical axis starts at 0 and has an even scale', 'explain how a graph makes a difference look bigger or smaller than it really is', 'redraw a graph with a fair scale, title and labels'],
        terms: ['Misleading graph', 'Scale', 'Axis'],
      })}
      ${L.notes()}
      ${banner(1)}
      ${split(graphCard(g.captain), weDo(`<div class="col">${example('Example 1', 'What is misleading about this graph?')}${example('Example 2', 'Ava’s bar looks 3 times as tall as Ben’s. How many more votes did Ava really get?')}</div>`, 'fill'))}
      ${youDo('Set A. Is each feature <b>fair</b> or <b>misleading</b>? Write F or M.', `<div class="short-grid">${setA.map((t, i) => qs(i + 1, t)).join('')}</div>`)}
    `, { first: true }),

    L.page('Level 1 · Level 2', `
      ${youDo('Set B. Use the canteen sales line graph.', split(graphCard(g.canteen), `<div class="short-list">${setB.map((t, i) => qs(i + 1, t)).join('')}</div>`))}
      ${banner(2)}
      <p class="given">Graphs P and Q show <b>the same data</b>: 120 students bought lunch in Term 1 and 130 in Term 2.</p>
      ${split(graphCard(g.P), graphCard(g.Q))}
      ${weDo(split(example('Example 3', 'Which graph makes the increase look bigger? Explain why.'), example('Example 4', 'In Graph P, Term 2’s bar looks 3 times as tall. Is that true? How many more students were there?'), 'ex-row'), 'grow')}
    `),

    L.page('Level 2 · Level 3', `
      ${split(graphCard(g.S), graphCard(g.T))}
      ${youDo('Set C. Questions 1–5 use Graphs P and Q (previous page). 6–7 use the sector graph and 8–10 the line graph.', `<div class="short-grid fill">${setC.map((t, i) => `<div class="qs wide-box"><span class="q-num">${i + 1}</span><span class="q-text">${t}</span><span class="box"></span></div>`).join('')}</div>`, 'grow')}
      ${banner(3)}
      ${weDo(split(
        `<div class="q example"><div class="q-head"><span class="q-num ex">Example 5</span><span class="q-text">Redraw the class captain graph (page {{L1}}) fairly: Ava 52 votes, Ben 48 votes.</span></div><div class="draw-area">${G.gridPaper()}</div></div>`,
        example('Example 6', 'Who might want to use the misleading class captain graph, and why?'), 'wide-left'), 'grow')}
    `),

    L.page('Level 3', `
      ${youDo('Set D. Questions 1–3 use the phone sales graph.', `
        ${split(`<div class="col">${graphCard(g.V)}${q(1, 'What does the graph suggest about Brand C compared with Brand B?')}${q(2, 'What are the real sales of Brands B and C? What is the difference?')}</div>`,
          qDraw(3, 'Redraw the phone sales graph fairly. Start the vertical axis at 0.', G.gridPaper()), 'grow')}
        ${split(qDraw(4, 'Redraw the canteen sales graph (Set B) with the vertical axis starting at 0. Sales ($ thousands): 41, 40, 43, 44, 45, 46 for 2019 to 2024.', G.gridPaper()),
          `<div class="col">${q(5, 'How does your new canteen graph change the impression?')}${q(6, 'A headline says “Crime has doubled!” The graph’s axis starts at 50 and crimes rose from 52 to 54. Is the headline true? Explain.')}</div>`, 'grow')}
        <div class="work-grid r2" style="flex:0.8 1 0">
          ${q(7, 'A house is drawn twice as tall <b>and</b> twice as wide to show prices doubling. Why is this misleading?')}
          ${q(8, 'Give two reasons someone might make a misleading graph on purpose.')}
          ${q(9, 'List three things every fair graph should have.')}
          ${q(10, 'A graph shows only the months when sales went up. Why is leaving data out misleading?')}
        </div>`, 'grow')}
    `),

    L.page('Extension · Exit ticket', `
      ${banner(4)}
      ${split(worked(4, 'Worked example',
        'A shop’s sales doubled. On a poster, the circle for this year has <b>twice the width and twice the height</b> of last year’s circle. How many times bigger does it look?',
        ['The width is 2 times as big', 'The height is 2 times as big', 'The area (how big it looks) is 2 × 2 = 4 times as big', 'Sales only doubled, so the picture exaggerates by 2 times'],
        '<b>Answer:</b> it looks 4 times bigger',
        `<div class="diagram">${G.svg(74, 36, `${G.symbol(14, 20)}
          <g transform="translate(46 18) scale(2.6)">${G.symbol(0, 0)}</g>
          ${G.text(14, 32, 'last year', { size: 2.8, anchor: 'middle' })}${G.text(46, 35, 'this year', { size: 2.8, anchor: 'middle' })}`)}</div>`),
        youDo('read the worked example, then try these.', `<div class="stack">
          ${q('E1', 'If a picture is made 3 times as wide and 3 times as tall, how many times bigger does it look?')}
          ${q('E2', 'Sales went from 100 to 150. A bag is drawn 1.5 times as tall and 1.5 times as wide. How many times bigger does it look? How should it be drawn fairly?')}
          ${qDraw('E3', 'Team X scored 20 goals and Team Y scored 22. Sketch a <b>misleading</b> column graph on the left and a <b>fair</b> one on the right.', split(G.gridPaper('misleading'), G.gridPaper('fair'), 'grow'))}</div>`, 'fill'), 'ext grow')}
      ${L.exitTicket({ graph: g.exit, questions: ['What number does the vertical axis start at?', 'Team B’s bar looks twice as tall as Team A’s. How many more points did Team B really score?', 'Explain why this graph is misleading and how you would fix it.'] })}
    `),

    L.page('Summary', `
      ${L.summaryBanner}
      <div class="summary-grid">
        <div class="steps-card"><b>Is this graph fair?</b><ol><li>Does the vertical axis start at <b>0</b> (or show a break ⚡)?</li><li>Is the <b>scale even</b> (equal gaps = equal amounts)?</li><li>Are the <b>title and axis labels</b> there?</li><li>Is <b>all the data</b> shown, with bars and pictures the same width?</li></ol></div>
      </div>
      <div class="summary-grid g2">
        ${worked(1, 'Level 1', 'A column graph’s vertical axis starts at 90. What is the problem?', ['Bar heights are measured from 90, not from 0', 'So small differences look huge'], '<b>Answer:</b> it is misleading. The axis should start at 0 or show a break.',
          `<div class="diagram">${G.columnGraph({ title: 'Test scores', cats: ['Mia', 'Tom'], values: [92, 96], yMin: 90, max: 98, step: 2, labelEvery: 2, yTitle: 'Score', w: 60, h: 40 })}</div>`)}
        ${worked(2, 'Level 2', 'Scores of 60 and 64 are drawn on an axis starting at 58. How many times as tall does the 64 bar look? What is the real difference?', ['Heights on the graph: 60 − 58 = 2 and 64 − 58 = 6', '6 ÷ 2 = 3, so the bar looks 3 times as tall', 'Real difference: 64 − 60 = 4'], '<b>Answer:</b> it looks 3 times as tall, but the real difference is only 4',
          `<div class="diagram">${G.columnGraph({ title: 'Misleading', cats: ['A', 'B'], values: [60, 64], yMin: 58, max: 66, step: 2, labelEvery: 2, yTitle: 'Score', w: 60, h: 40 })}</div>`)}
        ${worked(3, 'Level 3', 'Redraw the Level 2 graph fairly.', ['Start the vertical axis at 0 with an even scale', 'Plot the same values: 60 and 64', 'Add a title and label both axes', 'Make every bar the same width'], '<b>Answer:</b> the bars now look almost the same, which is the truth',
          `<div class="diagram">${G.columnGraph({ title: 'Fair', cats: ['A', 'B'], values: [60, 64], max: 70, step: 10, labelEvery: 10, yTitle: 'Score', w: 60, h: 40 })}</div>`)}
        ${worked(4, 'Extension', 'A picture is drawn twice as wide and twice as tall. How many times bigger does it look?', ['Area grows by width × height', '2 × 2 = 4'], '<b>Answer:</b> 4 times bigger, even though the value only doubled',
          `<div class="diagram">${G.svg(60, 30, `${G.symbol(12, 16)}<g transform="translate(40 15) scale(2.5)">${G.symbol(0, 0)}</g>`)}</div>`)}
      </div>
      ${L.tearBack()}
    `),
  ];

  const answers = [
    ['WE DO examples', ['Ex 1: the vertical axis starts at 46, not 0, so Ava’s lead looks huge', 'Ex 2: 52 − 48 = 4 more votes (not 3 times as many)', 'Ex 3: Graph P, because its axis starts at 115 so the bars’ heights show only the part above 115', 'Ex 4: No. 130 is only 10 more than 120', 'Ex 5: column graph starting at 0 with even scale, title and labels', 'Ex 6: Ava or her supporters, to make her win look bigger than it is']],
    ['Set A', ['F', 'M', 'M', 'F', 'M', 'F', 'M', 'M', 'F', 'M']],
    ['Set B', ['$41 000', '2020', '39', 'Yes', '$6000 (6 thousand)', 'About 7 times', 'False', '2020 to 2021 (+3)', 'Yes', 'The vertical axis starts at 39, not 0']],
    ['Set C', ['115', '0', '10', '3 times', 'Graph P, because the increase looks much bigger', '110%', 'The percentages add to more than 100%', '10 years', '2 years', 'Equal gaps show different lengths of time, so the growth looks like it slows down (it is really steady)']],
    ['Set D', ['Brand C looks about 3 times Brand B', 'B 200 000, C 210 000; difference 10 000', 'Fair column graph from 0', 'Fair line graph from 0', 'The rise looks small and steady, not dramatic', 'No: 54 is not double 52. The rise is only 2', 'It looks 4 times bigger, not 2 times', 'e.g. to sell a product, win a vote, make results look better or worse', 'e.g. title, labelled axes with units, scale starting at 0 with even gaps', 'The missing months could show sales going down, so the trend looks better than it is']],
    ['Extension', ['9 times', '1.5 × 1.5 = 2.25 times bigger; draw it the same size and use 1½ pictures, or make only one direction bigger', 'Misleading: axis starting near 19; fair: axis from 0']],
    ['Exit ticket', ['Level 1: 80', 'Level 2: 4 points', 'Level 3: the axis starts at 80, so the bars exaggerate the difference; start the axis at 0']],
  ];

  return { code: '10.02', title: 'Misleading graphs', pages, answers };
};
