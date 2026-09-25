// 10.07 Analysing dot plots and stem-and-leaf plots: range, median, mode and mean from plots; outliers; choosing a measure.
const G = require('../../../lib/graphs');
const S = require('../../../lib/stats');
const { banner, weDo, youDo, q, qDraw, qs, qsGrid, qGrid, extension, example, worked, graphCard, split, makeLesson } = require('../../../lib/layout');

module.exports = (chapter) => {
  const L = makeLesson({ chapter, code: '10.07', title: 'Analysing dot plots and stem-and-leaf plots' });
  const all = (xs) => `range ${S.fmt(S.range(xs))}, median ${S.fmt(S.median(xs))}, mode ${S.modeText(xs)}, mean ${S.fmt(S.mean(xs))}`;

  const siblings = { 0: 3, 1: 5, 2: 4, 3: 2, 5: 1 };
  const goals = { 0: 2, 1: 3, 2: 5, 3: 3, 4: 1, 6: 1 };
  const yoga = [[2, [4, 6]], [3, [1, 1, 5, 8]], [4, [0, 2, 7]], [5, [3]]];
  const ex3 = { 2: 2, 3: 3, 4: 1, 5: 2, 6: 4 };
  const ex4 = [[1, [5, 8]], [2, [0, 3, 3, 7]], [3, [1, 4, 4, 4, 9]], [4, [2]]];
  const books = { 0: 1, 1: 3, 2: 6, 3: 4, 4: 3, 5: 2, 9: 1 };
  const homework = [[1, [0, 5, 5, 8]], [2, [0, 2, 5, 5, 5, 9]], [3, [0, 4, 5]], [4, [5]]];
  const ex5 = { 1: 2, 2: 4, 3: 3, 4: 1, 15: 1 };
  const tests = { 5: 1, 6: 3, 7: 5, 8: 6, 9: 3, 10: 2 };
  const concert = [[1, [5, 6, 7, 7, 8, 9]], [2, [0, 1, 1, 1, 3, 5]], [3, [2, 4]], [4, []], [5, []], [6, [8]]];
  const exitData = { 1: 2, 2: 3, 3: 4, 4: 1, 8: 1 };

  const v = {
    siblings: S.expand(siblings), goals: S.expand(goals), yoga: S.fromStemLeaf(yoga), ex3: S.expand(ex3), ex4: S.fromStemLeaf(ex4),
    books: S.expand(books), homework: S.fromStemLeaf(homework), ex5: S.expand(ex5), tests: S.expand(tests), concert: S.fromStemLeaf(concert), exit: S.expand(exitData),
  };
  const count = (xs, f) => xs.filter(f).length;
  const without = (xs, x) => { const i = xs.indexOf(x); return xs.filter((_, j) => j !== i); };

  const setA = ['How many games were played?', 'What is the most goals in a game?', 'What is the range?', 'What is the mode?', 'What is the median?',
    'How many goals were scored in total?', 'What is the mean (2 decimal places)?', 'Which value is an outlier?', 'In how many games were more than 2 goals scored?', 'What fraction of games had 0 goals?'];
  const setB = ['How many people are in the class?', 'Who is the youngest?', 'Who is the oldest?', 'What is the range?', 'What is the mode?',
    'What is the median?', 'What is the total of the ages?', 'What is the mean age?', 'How many are under 30?', 'What does 3 | 5 stand for?'];
  const setC = ['Books: find the range.', 'Books: find the mode.', 'Books: find the median.', 'Books: find the mean.', 'Books: which value is an outlier? Does it make the mean bigger or smaller?',
    'Homework: find the range.', 'Homework: find the mode.', 'Homework: find the median.', 'Homework: find the mean (2 d.p.).', 'Homework: how many students spent more than 30 minutes?'];

  const pages = [
    L.page('Start here · Level 1', `
      ${L.intro({
        li: ['find the range, median, mode and mean from a dot plot', 'find the same statistics from a stem-and-leaf plot', 'choose the best measure for data with an outlier'],
        sc: ['use the <b>frequency</b> of each value to find the total and the mean', 'count to the middle position of a plot to find the <b>median</b>', 'explain how an <b>outlier</b> changes the mean and median'],
        terms: ['Frequency', 'Measure of centre', 'Spread'],
      })}
      ${L.notes()}
      ${banner(1)}
      ${split(graphCard(G.dotPlot({ title: 'Number of siblings', min: 0, max: 5, counts: siblings, xTitle: 'Siblings' })),
        weDo(`<div class="col">${example('Example 1', 'Find the range and the mode.')}${example('Example 2', 'Find the median and the mean.')}</div>`, 'fill'))}
    `, { first: true }),

    L.page('Level 1', `
      ${youDo('Set A. Use the goals dot plot.', split(graphCard(G.dotPlot({ title: 'Goals scored per game', min: 0, max: 6, counts: goals, xTitle: 'Goals' })), `<div class="short-list">${setA.map((t, i) => qs(i + 1, t)).join('')}</div>`))}
      ${youDo('Set B. Ages of people in a yoga class.', split(graphCard(G.stemLeaf({ rows: yoga, key: '3 | 1 = 31 years' })), `<div class="short-list">${setB.map((t, i) => qs(i + 1, t)).join('')}</div>`, 'grow'), 'grow')}
    `),

    L.page('Level 2', `
      ${banner(2)}
      ${weDo(split(
        example('Example 3', `Find the range, median, mode and mean.${G.dotPlot({ min: 2, max: 6, counts: ex3, w: 60, dotR: 1.1 })}`),
        example('Example 4', `Find the range, median, mode and mean.${G.stemLeaf({ rows: ex4, key: '2 | 3 = 23' })}`), 'ex-row grow-row'), 'grow')}
    `),

    L.page('Level 2', `
      ${youDo('Set C. Questions 1–5 use the books dot plot and 6–10 use the homework plot.', `
        ${split(graphCard(G.dotPlot({ title: 'Books read in a month', min: 0, max: 9, counts: books, dotR: 1.05 })), graphCard(G.stemLeaf({ title: 'Minutes spent on homework', rows: homework, key: '2 | 5 = 25 min' })))}
        ${qGrid(setC)}`, 'grow')}
    `),

    L.page('Level 3', `
      ${banner(3)}
      ${weDo(split(
        example('Example 5', `Find the mean and median. Then remove the outlier and find them again.${G.dotPlot({ min: 1, max: 15, counts: ex5, w: 80, dotR: 1 })}`),
        example('Example 6', 'Which measure (mean, median or mode) best describes the data in Example 5? Explain.'), 'ex-row tall'))}
      ${youDo('Set D. Questions 1–4 use the test scores dot plot.', `
        ${split(graphCard(G.dotPlot({ title: 'Test scores out of 10', min: 5, max: 10, counts: tests, dotR: 1 })),
          `<div class="col">${q(1, 'Find the mean, median, mode and range of the test scores.')}${q(2, 'A student who was away scores 2. Find the new mean and median.')}</div>`, 'grow-row')}
        ${qGrid(['Which measure changed more in Question 2? Why?', 'Could one more student raise the class mean to 8? Explain.'], { start: 3 })}`, 'grow')}
    `),

    L.page('Level 3', `
      ${youDo('Set D continued. Questions 5–8 use the concert plot.', `
        ${split(graphCard(G.stemLeaf({ title: 'Ages at a concert', rows: concert, key: '2 | 1 = 21 years' })),
          `<div class="col">${q(5, 'Find the mean, median, mode and range of the concert ages.')}${q(6, 'Which age is an outlier? How can you tell?')}</div>`)}
        ${qGrid(['Remove the outlier. Find the new mean and range.', 'Which measure best describes a typical age at the concert? Why?'], { start: 7 })}
        ${split(qDraw(9, 'Draw a dot plot of 9 values with mode 4, median 5, range 6 and smallest value 2.', `<div class="template-card">${G.dotPlotTemplate({ min: 1, max: 9, w: 88, h: 30 })}</div>`),
          q(10, 'Why are the mean and median of a symmetric dot plot about the same?'))}`, 'grow')}
    `),

    L.page('Extension · Exit ticket', `
      ${extension(worked(4, 'Worked example', 'A dot plot shows 10 values with a mean of 3. Nine of the values are 1, 2, 2, 3, 3, 4, 4, 5, 5. What is the tenth value?',
        ['Total of all 10 values: 10 × 3 = 30', 'Total of the nine values: 29', 'Tenth value: 30 − 29 = 1'], '<b>Answer:</b> 1',
        `<div class="diagram">${G.dotPlot({ min: 1, max: 5, counts: { 1: 2, 2: 2, 3: 2, 4: 2, 5: 2 }, w: 60, dotR: 1.1 })}</div>`),
        `${q('E1', 'A stem-and-leaf plot shows 23, 25, 2?, 30, 34. The mean is 28. What is the missing leaf?')}
         ${q('E2', 'Add one value to 4, 5, 5, 6, 9 so that the median becomes 5.5. Which values work?')}
         ${q('E3', 'Make up six values where the mean is bigger than the median. Explain how you did it.')}`)}
      ${L.exitTicket({ graph: G.dotPlot({ title: 'Pets per student', min: 1, max: 8, counts: exitData, w: 60, dotR: 1.1 }), questions: ['What is the mode?', 'Find the median and the range.', 'Find the mean. What happens to the mean if the 8 is removed?'] })}
    `),

    L.page('Summary', `
      ${L.summary('From a plot', ['<b>Range</b>: highest − lowest.', '<b>Mode</b>: tallest stack or most repeated leaf.', '<b>Median</b>: count to the middle position.', '<b>Mean</b>: add every value (value × frequency), then divide.'], [
        worked(1, 'Level 1', 'Find the range and mode of the siblings dot plot.', ['Range: highest − lowest = 5 − 0 = 5', 'The tallest stack is above 1'], '<b>Answer:</b> range 5, mode 1',
          `<div class="diagram">${G.dotPlot({ min: 0, max: 5, counts: siblings, w: 60 })}</div>`),
        worked(2, 'Level 2', 'Find the median of this plot.', ['There are 7 values, so the median is the 4th', 'Count along: 21, 24, 24, <b>30</b>'], '<b>Answer:</b> 30',
          `<div class="diagram">${G.stemLeaf({ rows: [[2, [1, 4, 4]], [3, [0, 5]], [4, [2, 6]]], key: '2 | 1 = 21' })}</div>`),
        worked(3, 'Level 3', 'Find the mean of the siblings dot plot.', ['Total: 0×3 + 1×5 + 2×4 + 3×2 + 5×1 = 24', 'There are 15 values: 24 ÷ 15 = 1.6'], '<b>Answer:</b> 1.6',
          `<div class="diagram">${G.dotPlot({ min: 0, max: 5, counts: siblings, w: 60 })}</div>`),
        worked(4, 'Extension', 'Why does an outlier change the mean more than the median?', ['The mean adds up every value, so one big value adds a lot', 'The median only uses the middle position'], '<b>Answer:</b> the outlier pulls the mean towards it',
          `<div class="diagram">${G.dotPlot({ min: 1, max: 15, counts: ex5, w: 64 })}</div>`),
      ])}
      ${L.tearBack()}
    `),
  ];

  const tests2 = [...v.tests, 2];
  const concertNo = without(v.concert, 68);
  const answers = [
    ['WE DO examples', [`Ex 1: range ${S.range(v.siblings)}, mode ${S.modeText(v.siblings)}`, `Ex 2: median ${S.fmt(S.median(v.siblings))}, mean ${S.fmt(S.mean(v.siblings))}`, `Ex 3: ${all(v.ex3)}`, `Ex 4: ${all(v.ex4)}`,
      `Ex 5: with 15: mean ${S.fmt(S.mean(v.ex5))}, median ${S.fmt(S.median(v.ex5))}; without: mean ${S.fmt(S.mean(without(v.ex5, 15)))}, median ${S.fmt(S.median(without(v.ex5, 15)))}`, 'Ex 6: the median (or mode), because the outlier 15 pulls the mean up']],
    ['Set A', [`${v.goals.length}`, '6', `${S.range(v.goals)}`, S.modeText(v.goals), S.fmt(S.median(v.goals)), `${S.sum(v.goals)}`, S.fmt(S.mean(v.goals)), '6', `${count(v.goals, (x) => x > 2)}`, `${count(v.goals, (x) => x === 0)}/15`]],
    ['Set B', [`${v.yoga.length}`, '24', '53', `${S.range(v.yoga)}`, S.modeText(v.yoga), S.fmt(S.median(v.yoga)), `${S.sum(v.yoga)}`, S.fmt(S.mean(v.yoga)), `${count(v.yoga, (x) => x < 30)}`, '35 years']],
    ['Set C', [`${S.range(v.books)}`, S.modeText(v.books), S.fmt(S.median(v.books)), S.fmt(S.mean(v.books)), '9; it makes the mean bigger',
      `${S.range(v.homework)} min`, `${S.modeText(v.homework)} min`, `${S.fmt(S.median(v.homework))} min`, `${S.fmt(S.mean(v.homework))} min`, `${count(v.homework, (x) => x > 30)}`]],
    ['Set D', [all(v.tests), `mean ${S.fmt(S.mean(tests2))}, median ${S.fmt(S.median(tests2))}`, 'The mean: the low score of 2 lowers the total, but the middle position barely moves',
      `No: total is ${S.sum(v.tests)}; for a mean of 8 with 21 students the total must be 168, so they would need ${168 - S.sum(v.tests)} out of 10`,
      all(v.concert), '68: it is far from all the other ages (15 to 34)', `mean ${S.fmt(S.mean(concertNo))}, range ${S.range(concertNo)}`, 'The median (or mode), because the outlier pulls the mean up',
      'e.g. 2, 4, 4, 4, 5, 6, 7, 8, 8 drawn as a dot plot (mode 4, median 5, range 6)', 'Values are balanced on both sides of the middle, so the mean sits in the middle too']],
    ['Extension', ['Total 5 × 28 = 140; 140 − 112 = 28, so the leaf is 8', 'Any value of 6 or more', 'e.g. 1, 2, 3, 4, 5, 30: one large value pulls the mean up']],
    ['Exit ticket', [`Level 1: ${S.modeText(v.exit)}`, `Level 2: median ${S.fmt(S.median(v.exit))}, range ${S.range(v.exit)}`, `Level 3: mean ${S.fmt(S.mean(v.exit))}; without the 8 it drops to ${S.fmt(S.mean(without(v.exit, 8)))}`]],
  ];

  return { code: '10.07', title: 'Analysing dot plots and stem-and-leaf plots', pages, answers };
};
