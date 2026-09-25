// 10.08 Comparing data sets: back-to-back stem-and-leaf plots, comparing centre and spread, outliers, primary and secondary data.
const G = require('../../../lib/graphs');
const S = require('../../../lib/stats');
const { banner, weDo, youDo, q, qDraw, qs, qsGrid, qGrid, extension, example, worked, graphCard, split, makeLesson } = require('../../../lib/layout');

// Back-to-back rows: left leaves read outward from the stem (largest nearest the edge), right leaves in order.
const b2bRows = (left, right, stems) => stems.map((s) => [
  left.filter((x) => Math.floor(x / 10) === s).map((x) => x % 10).sort((a, b) => b - a), s,
  right.filter((x) => Math.floor(x / 10) === s).map((x) => x % 10).sort((a, b) => a - b),
]);

module.exports = (chapter) => {
  const L = makeLesson({ chapter, code: '10.08', title: 'Comparing data sets' });
  const all = (xs) => `mean ${S.fmt(S.mean(xs))}, median ${S.fmt(S.median(xs))}, mode ${S.modeText(xs)}, range ${S.fmt(S.range(xs))}`;
  const count = (xs, f) => xs.filter(f).length;

  const classA = { 4: 1, 5: 2, 6: 4, 7: 5, 8: 3, 9: 1 };
  const classB = { 2: 1, 3: 1, 5: 2, 6: 2, 7: 2, 8: 3, 9: 3, 10: 2 };
  const gymA = [18, 22, 25, 25, 27, 31, 33, 34, 38, 42, 45, 51];
  const gymB = [21, 24, 29, 33, 35, 35, 36, 39, 41, 44, 46, 48, 52, 57, 63];
  const classP = [34, 41, 45, 28, 39, 47, 52, 36];
  const classQ = [25, 31, 38, 29, 42, 33, 27, 35];
  const girls = [148, 152, 155, 157, 158, 160, 161, 161, 163, 166, 170];
  const boys = [145, 149, 150, 153, 156, 158, 158, 158, 162, 167, 171, 175];
  const r7 = [45, 52, 58, 61, 63, 64, 67, 68, 70, 72, 72, 75, 78, 81, 86];
  const t7 = [23, 38, 49, 55, 60, 66, 71, 74, 79, 83, 88, 90, 92, 95, 97];
  const amy = [12, 14, 13, 15, 14, 12];
  const beth = [5, 22, 8, 20, 18, 11];
  const teamA = [12, 15, 21, 24, 24, 30];
  const teamB = [18, 22, 25, 27, 28, 29];
  const shuffle = (xs) => [...xs].sort((a, b) => ((a * 7919) % 13) - ((b * 7919) % 13));
  const [vA, vB] = [S.expand(classA), S.expand(classB)];
  if (vA.length !== 16 || vB.length !== 16) throw new Error('10.08 dot plot sizes');

  const setA = ['How many people go to Gym A?', 'How many people go to Gym B?', 'Who is the youngest at Gym A?', 'Who is the oldest at Gym B?', 'What is the mode for Gym A?',
    'What is the mode for Gym B?', 'What is the range for Gym A?', 'What is the range for Gym B?', 'How many people are in their 30s altogether?', 'Which gym has older people in general?'];
  const setB = ['You measure the heights of your class.', 'You download rainfall data from the Bureau of Meteorology.', 'You hand out a survey at lunch.', 'You use Census results from the ABS.',
    'You count cars driving past the school gate.', 'You copy a population table from a textbook.', 'You time your friends running 100 m.', 'You use sports results from a news website.',
    'You toss a coin 50 times and record the results.', 'You use data from a science journal.'];

  const pages = [
    L.page('Start here · Level 1', `
      ${L.intro({
        li: ['compare two data sets using measures of centre and spread', 'draw and read a back-to-back stem-and-leaf plot', 'tell the difference between primary and secondary data'],
        sc: ['compare the <b>mean</b> or <b>median</b> to decide which group did better', 'compare the <b>range</b> to decide which group is more consistent', 'draw a <b>back-to-back stem-and-leaf plot</b> and write a conclusion'],
        terms: ['Back-to-back stem-and-leaf plot', 'Primary data', 'Secondary data'],
      })}
      ${L.notes()}
      ${banner(1)}
      ${split(graphCard(G.dotPlot({ title: 'Class A quiz scores', min: 2, max: 10, counts: classA, dotR: 1.1 })), graphCard(G.dotPlot({ title: 'Class B quiz scores', min: 2, max: 10, counts: classB, dotR: 1.1 })))}
      ${weDo(split(example('Example 1', 'Find the mode and the range of each class.'), example('Example 2', 'Find the median of each class. Which class did better? Which was more consistent?'), 'ex-row tall'))}
    `, { first: true }),

    L.page('Level 1', `
      ${youDo('Set A. Ages of people at two gyms.', split(graphCard(G.backToBack({ left: 'Gym A', right: 'Gym B', rows: b2bRows(gymA, gymB, [1, 2, 3, 4, 5, 6]), key: '3 | 5 = 35 years' })),
        `<div class="short-list">${setA.map((t, i) => qs(i + 1, t)).join('')}</div>`))}
      ${youDo('Set B. Is each one <b>primary</b> data (you collect it yourself) or <b>secondary</b> data (someone else collected it)? Write P or S.', qsGrid(setB), 'grow')}
    `),

    L.page('Level 2', `
      ${banner(2)}
      ${weDo(`<p class="given"><b>Spelling scores.</b> Class P: ${classP.join(', ')} &nbsp;&nbsp; Class Q: ${classQ.join(', ')}</p>
        ${split(example('Example 3', 'Draw a back-to-back stem-and-leaf plot of the scores.', G.backToBackTemplate({ left: 'Class P', right: 'Class Q', stems: [2, 3, 4, 5] })),
          example('Example 4', 'Find the median and range of each class. Compare the two classes.'), 'grow-row')}`, 'grow')}
    `),

    L.page('Level 2', `
      ${youDo('Set C. Heights (cm) of two Under-14 basketball squads.', `
        <p class="given"><b>Girls:</b> ${shuffle(girls).join(', ')}<br><b>Boys:</b> ${shuffle(boys).join(', ')}</p>
        ${split(`<div class="col">${qDraw(1, 'Draw a back-to-back stem-and-leaf plot. Put the girls on the left.', G.backToBackTemplate({ left: 'Girls', right: 'Boys', stems: [14, 15, 16, 17] }))}${q(2, 'Who is the tallest player? Which squad are they in?')}</div>`,
          `<div class="col">${q(3, 'Find the median height of each squad.')}${q(4, 'Find the mode of each squad.')}</div>`)}
        <div class="work-grid r4">
          ${q(5, 'Find the range of each squad.')}
          ${q(6, 'Find the mean of each squad (2 decimal places).')}
          ${q(7, 'Which squad is taller on average? Use a statistic.')}
          ${q(8, 'Which squad has heights that are more alike? Use a statistic.')}
          ${q(9, 'How many players in each squad are 160&nbsp;cm or taller?')}
          ${q(10, 'Write two sentences comparing the squads.')}
          ${q(11, 'The coach measured the players herself. Is this primary or secondary data?')}
          ${q(12, 'A coach wants the taller squad for a tournament. Which squad would you pick? Use two statistics.')}
        </div>`, 'grow')}
    `),

    L.page('Level 3', `
      ${banner(3)}
      ${weDo(`<p class="given"><b>Goals in 6 netball games.</b> Amy: ${amy.join(', ')} &nbsp;&nbsp; Beth: ${beth.join(', ')}</p>
        ${split(example('Example 5', 'Find the mean and the range for each player. Who is more consistent?'), example('Example 6', 'Which player would you pick for the grand final? Use the statistics to justify your choice.'), 'ex-row tall')}`)}
      ${youDo('Set D. Assignment marks (out of 100) for two classes.', `
        <p class="given"><b>7R:</b> ${shuffle(r7).join(', ')}<br><b>7T:</b> ${shuffle(t7).join(', ')}</p>
        ${split(`<div class="col">${qDraw(1, 'Draw a back-to-back stem-and-leaf plot. Put 7R on the left.', G.backToBackTemplate({ left: '7R', right: '7T', stems: [2, 3, 4, 5, 6, 7, 8, 9] }))}${q(2, 'What was the highest mark? Which class scored it?')}</div>`,
          `<div class="col">${q(3, 'Find the mean, median, mode and range of 7R.')}${q(4, 'Find the mean, median, mode and range of 7T.')}</div>`, 'grow')}`, 'grow')}
    `),

    L.page('Level 3', `
      ${youDo('Set D continued. Use your plot and statistics from the previous page.', `<div class="work-grid" style="grid-template-rows: repeat(3, minmax(0, 1fr))">
        ${q(5, 'Which class did better overall? Use the mean or median to explain.')}
        ${q(6, 'Which class was more consistent? Use the range to explain.')}
        ${q(7, 'Which mark in 7T could be called an outlier? Why?')}
        ${q(8, 'Remove that mark. Find the new mean and range for 7T.')}
        ${q(9, 'The teacher got the marks from her own mark book. Is this primary or secondary data? Explain.')}
        ${q(10, 'Write a conclusion comparing 7R and 7T using at least two statistics.')}
      </div>`, 'grow')}
    `),

    L.page('Extension · Exit ticket', `
      ${extension(worked(4, 'Worked example: combining groups', 'Class A has 10 students with a mean of 70. Class B has 15 students with a mean of 80. What is the mean of all 25 students?',
        ['Total for A: 10 × 70 = 700', 'Total for B: 15 × 80 = 1200', 'Total for everyone: 700 + 1200 = 1900', 'Mean: 1900 ÷ 25 = 76'], '<b>Answer:</b> 76 (not 75, because Class B is bigger)'),
        `${q('E1', 'A group of 8 has a mean of 12 and a group of 12 has a mean of 17. Find the mean of all 20.')}
         ${q('E2', 'Why is the combined mean not always halfway between the two means?')}
         ${q('E3', 'Make up two sets of 5 values with the same mean but different ranges.')}`)}
      ${L.exitTicket({ graph: G.backToBack({ left: 'Team A', right: 'Team B', rows: b2bRows(teamA, teamB, [1, 2, 3]), key: '2 | 4 = 24' }),
        questions: ['What is the highest score? Which team scored it?', 'Find the median of each team.', 'Which team was more consistent? Explain using the range.'] })}
    `),

    L.page('Summary', `
      ${L.summary('Comparing data sets', ['<b>Centre</b> (mean or median): which group is higher?', '<b>Spread</b> (range): smaller range = more consistent.', 'Look for <b>outliers</b> that change the mean.', '<b>Primary</b> data you collect; <b>secondary</b> data someone else collected.'], [
        worked(1, 'Level 1', 'In this back-to-back plot, what does the left leaf 3 on stem 2 stand for?', ['Left leaves belong to the left group (Team A)', 'Stem 2 and leaf 3 make 23'], '<b>Answer:</b> a score of 23 for Team A',
          `<div class="diagram">${G.backToBack({ left: 'Team A', right: 'Team B', rows: [[[7, 3], 2, [1, 5]], [[4], 3, [0, 2, 6]]], key: '2 | 3 = 23' })}</div>`),
        worked(2, 'Level 2', 'Medians: Class X 64, Class Y 71. Ranges: X 20, Y 45. Compare the classes.', ['Y has the higher median, so Y did better on average', 'X has the smaller range, so X is more consistent'], '<b>Answer:</b> Y scored higher; X was more consistent'),
        worked(3, 'Level 3', 'Amy: mean 13.3, range 3. Beth: mean 14, range 17. Who is more reliable?', ['The means are close', 'Amy’s range is much smaller, so her scores are more alike'], '<b>Answer:</b> Amy is more reliable'),
        worked(4, 'Extension', '4 values have a mean of 5 and 6 values have a mean of 10. What is the combined mean?', ['Totals: 4 × 5 = 20 and 6 × 10 = 60', 'Combined: 80 ÷ 10 = 8'], '<b>Answer:</b> 8 (not 7.5, because the second group is bigger)'),
      ])}
      ${L.tearBack()}
    `),
  ];

  const [r7noOut, t7noOut] = [r7, t7.filter((x) => x !== 23)];
  const answers = [
    ['WE DO examples', [`Ex 1: A mode ${S.modeText(vA)}, range ${S.range(vA)}; B modes ${S.modeText(vB)}, range ${S.range(vB)}`,
      `Ex 2: A median ${S.fmt(S.median(vA))}, B median ${S.fmt(S.median(vB))}. B did slightly better (higher median); A is more consistent (smaller range)`,
      `Ex 3: plot with stems 2–5, key e.g. 3 | 4 = 34`, `Ex 4: P median ${S.fmt(S.median(classP))}, range ${S.range(classP)}; Q median ${S.fmt(S.median(classQ))}, range ${S.range(classQ)}. P did better (higher median); Q is more consistent (smaller range)`,
      `Ex 5: Amy mean ${S.fmt(S.mean(amy))}, range ${S.range(amy)}; Beth mean ${S.fmt(S.mean(beth))}, range ${S.range(beth)}. Amy is more consistent`, 'Ex 6: e.g. Amy: similar mean but far more reliable. (Accept Beth if argued: she can score very high.)']],
    ['Set A', [`${gymA.length}`, `${gymB.length}`, `${Math.min(...gymA)}`, `${Math.max(...gymB)}`, S.modeText(gymA), S.modeText(gymB), `${S.range(gymA)}`, `${S.range(gymB)}`,
      `${count([...gymA, ...gymB], (x) => x >= 30 && x < 40)}`, `Gym B (median ${S.fmt(S.median(gymB))} vs ${S.fmt(S.median(gymA))})`]],
    ['Set B', ['P', 'S', 'P', 'S', 'P', 'S', 'P', 'S', 'P', 'S']],
    ['Set C', ['Stems 14–17; girls’ leaves on the left', '175 cm, boys', `girls ${S.fmt(S.median(girls))}, boys ${S.fmt(S.median(boys))}`, `girls ${S.modeText(girls)}, boys ${S.modeText(boys)}`,
      `girls ${S.range(girls)}, boys ${S.range(boys)}`, `girls ${S.fmt(S.mean(girls))}, boys ${S.fmt(S.mean(boys))}`, 'The girls have a slightly higher mean and median, but the squads are very similar', 'The girls (smaller range)',
      `girls ${count(girls, (x) => x >= 160)}, boys ${count(boys, (x) => x >= 160)}`, 'e.g. The squads have similar average heights. The boys’ heights are more spread out.', 'Primary', 'e.g. the girls: higher mean and median, and more consistent heights']],
    ['Set D', ['Stems 2–9; 7R leaves on the left', '97, 7T', all(r7), all(t7), `7T has a higher mean (${S.fmt(S.mean(t7))} vs ${S.fmt(S.mean(r7))}) and median (${S.median(t7)} vs ${S.median(r7)})`,
      `7R: range ${S.range(r7)} vs ${S.range(t7)}`, '23: it is well below the rest of 7T', `mean ${S.fmt(S.mean(t7noOut))}, range ${S.range(t7noOut)}`, 'Primary: she collected the marks herself',
      'e.g. 7T scored higher on average but their marks were much more spread out; 7R was more consistent']],
    ['Extension', ['96 + 204 = 300; 300 ÷ 20 = 15', 'The bigger group has more effect on the total', 'e.g. 5, 5, 5, 5, 5 and 1, 3, 5, 7, 9']],
    ['Exit ticket', ['Level 1: 30, Team A', `Level 2: A ${S.fmt(S.median(teamA))}, B ${S.fmt(S.median(teamB))}`, `Level 3: Team B (range ${S.range(teamB)} vs ${S.range(teamA)})`]],
  ];

  return { code: '10.08', title: 'Comparing data sets', pages, answers };
};
