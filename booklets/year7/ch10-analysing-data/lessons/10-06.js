// 10.06 The median and range: odd and even counts, negatives and decimals, working backwards, effect of outliers.
const G = require('../../../lib/graphs');
const S = require('../../../lib/stats');
const { banner, weDo, youDo, q, qDraw, qs, qsGrid, qGrid, extension, example, worked, graphCard, split, makeLesson } = require('../../../lib/layout');

module.exports = (chapter) => {
  const L = makeLesson({ chapter, code: '10.06', title: 'The median and range' });
  const list = (xs) => xs.map((x) => (x < 0 ? `−${-x}` : x)).join(', ');

  const setA = [[2, 3, 3, 5, 8], [1, 4, 4, 6, 9], [7, 2, 5, 2, 9], [6, 1, 8, 6, 3], [10, 12, 11, 10, 15], [4, 9, 7, 9, 2, 5, 9], [15, 13, 14, 13, 18], [8, 3, 6, 3, 1, 5, 3], [20, 25, 22, 25, 21], [5, 7, 6, 7, 9, 4, 8]];
  const setB = [[3, 8, 5, 10], [14, 6, 23, 9, 11], [1, 1, 6, 4], [25, 30, 18, 22], [100, 85, 92, 97], [6, 6, 6, 6], [45, 12, 33, 50, 19], [7.5, 3.2, 6.1], [0, 15, 9, 3], [-2, 5, 1, 3]];
  const setC = [
    ['', [4, 9, 2, 7]],
    ['', [11, 15, 12, 18, 14, 20]],
    ['', [3.5, 1.2, 4.8, 2.6, 3.1]],
    ['', [9, 2, 6, 11, 4, 8]],
    ['Temperatures (°C): ', [-4, 2, -1, 5, 0, 3]],
    ['Temperatures (°C) for a week: ', [21, 24, 19, 24, 22, 23, 21]],
    ['Scores: 1 three times, 2 four times, 3 twice, 4 once', S.expand({ 1: 3, 2: 4, 3: 2, 4: 1 })],
    ['Heights (cm): ', [150, 145, 160, 155, 148, 152]],
    ['Prices ($): ', [100, 250, 175, 300, 125]],
    ['Goals: 0 twice, 1 four times, 2 three times, 3 once', S.expand({ 0: 2, 1: 4, 2: 3, 3: 1 })],
  ];
  const cText = ([label, xs]) => (label.includes('twice') ? label : `${label}${list(xs)}`);
  const ex4 = [[2, [4, 8]], [3, [1, 5, 5, 9]], [4, [2]]];
  const family = [42, 40, 14, 11, 8, 1];

  const setD = [
          'Write a set of five numbers with a median of 6 and a range of 8.',
          'The range of a data set is 15 and the smallest value is 7. What is the largest value?',
          'The number 20 is added to 4, 6, 7, 8, 10. How do the median and range change?',
          'Class A: median 65, range 40. Class B: median 60, range 10. Which class is more consistent? Which did better?',
          'Explain why one very large value changes the mean a lot but the median only a little.',
          'Six numbers have a median of 10. Four are 4, 8, 13 and 15. The other two are equal. What are they?',
          'Write five numbers with median 8, range 10, smallest 3 and mean 8.',
          'Heights (cm): 180, 175, 190, 182 and one more. The median is 182 and the range is 20. Find the missing height.',
          'Can the range of a data set be 0? Explain.',
          `Ages in a family: ${list(family)}. Find the median and range. Does the median describe this family well?`,
  ];

  const pages = [
    L.page('Start here · Level 1', `
      ${L.intro({
        li: ['find the median and range of a set of data', 'find the median when there are two middle values', 'use the median and range to compare and describe data'],
        sc: ['put data <b>in order</b> and find the middle value', 'find the median of an even number of values', 'find the <b>range</b> by subtracting the lowest value from the highest'],
        terms: ['Median', 'Range'],
      })}
      ${L.notes()}
      ${banner(1)}
      ${weDo(split(example('Example 1', 'Find the <b>median</b> of: 3, 9, 4, 7, 4, 8, 5'), example('Example 2', 'Find the <b>range</b> of: 12, 5, 9, 20, 7'), 'ex-row grow-row'), 'grow')}
    `, { first: true }),

    L.page('Level 1', `
      ${youDo('Set A. Find the <b>median</b>. Put the numbers in order first!', qGrid(setA.map((xs) => list(xs))), 'grow')}
    `),

    L.page('Level 1 · Level 2', `
      ${youDo('Set B. Find the <b>range</b> (highest − lowest).', qsGrid(setB.map((xs) => list(xs)), { wide: true }))}
      ${banner(2)}
      ${weDo(split(
        example('Example 3', 'Find the median and range of: 8, 3, 10, 5, 7, 12'),
        example('Example 4', `Find the median and range of the data in this stem-and-leaf plot.${G.stemLeaf({ rows: ex4, key: '3 | 1 = 31' })}`), 'ex-row grow-row'), 'grow')}
    `),

    L.page('Level 2', `
      ${youDo('Set C. Find the <b>median</b> and the <b>range</b>.', qGrid(setC.map((c) => cText(c))), 'grow')}
    `),

    L.page('Level 3', `
      ${banner(3)}
      ${weDo(split(
        example('Example 5', 'Ages at a party: 11, 12, 12, 13, 12, 44. Find the median, range and mean. Which describes a typical age best?'),
        example('Example 6', 'Write five numbers with a median of 8 and a range of 10. The smallest is 3.'), 'ex-row tall'))}
      ${youDo('Set D. Show your working.', qGrid(setD.slice(0, 4)), 'grow')}
    `),

    L.page('Level 3', `
      ${youDo('Set D continued. Show your working.', qGrid(setD.slice(4), { start: 5 }), 'grow')}
    `),

    L.page('Extension · Exit ticket', `
      ${extension(worked(4, 'Worked example', '25 values are written in order. Which value is the median?',
        ['Add 1 to the number of values: 25 + 1 = 26', 'Halve it: 26 ÷ 2 = 13', 'The median is the 13th value (12 values sit on each side)'], '<b>Answer:</b> the 13th value',
        `<p class="tip"><b>Key idea:</b> the median is in position (n + 1) ÷ 2. If that ends in .5, average the two values either side.</p>
        <div class="diagram">${G.svg(84, 20, Array.from({ length: 25 }, (_, i) => `<circle cx="${(3 + i * 3.25).toFixed(2)}" cy="8" r="1.3" fill="${i === 12 ? G.C.blue : G.C.sand}"/>`).join('')
          + G.text(20, 16, '12 values', { size: 2.6, anchor: 'middle' }) + G.text(42, 16, '13th', { size: 2.6, anchor: 'middle', weight: 600, fill: G.C.blue }) + G.text(64, 16, '12 values', { size: 2.6, anchor: 'middle' }))}</div>`), `${q('E1', 'There are 40 values in order. Which two positions are used to find the median?')}${q('E2', 'Scores: 1 three times, 2 five times, 3 eight times, 4 four times. Find the median.')}${q('E3', 'Find the median of all the whole numbers from 1 to 100.')}`)}
      ${L.exitTicket({ questions: ['Find the median of: 9, 3, 7, 5, 11', 'Find the median and range of: 9, 3, 7, 3, 11, 6', 'Write five numbers with a median of 6 and a range of 10. The smallest is 2.'] })}
    `),

    L.page('Summary', `
      ${L.summary('Remember', ['Put the data <b>in order</b> first.', '<b>Median</b> = the middle value.', 'Two middle values? Add them and <b>divide by 2</b>.', '<b>Range</b> = highest − lowest.'], [
        worked(1, 'Level 1', 'Find the median of 7, 3, 9, 5, 4', ['Order: 3, 4, 5, 7, 9', 'Middle (3rd) value: 5'], '<b>Answer:</b> 5'),
        worked(2, 'Level 2', 'Find the median and range of 6, 2, 9, 4', ['Order: 2, 4, 6, 9', 'Two middle values: (4 + 6) ÷ 2 = 5', 'Range: 9 − 2 = 7'], '<b>Answer:</b> median 5, range 7'),
        worked(3, 'Level 3', 'Temperatures ranged from −3&nbsp;°C to 8&nbsp;°C. Find the range.', ['Range = highest − lowest', '8 − (−3) = 8 + 3 = 11'], '<b>Answer:</b> 11&nbsp;°C'),
        worked(4, 'Extension', 'Where is the median of 31 ordered values?', ['(31 + 1) ÷ 2 = 16'], '<b>Answer:</b> the 16th value'),
      ])}
      ${L.tearBack()}
    `),
  ];

  const mr = (xs) => `median ${S.fmt(S.median(xs))}, range ${S.fmt(S.range(xs))}`;
  const answers = [
    ['WE DO examples', ['Ex 1: 3, 4, 4, 5, 7, 8, 9 → 5', 'Ex 2: 20 − 5 = 15', `Ex 3: ${mr([8, 3, 10, 5, 7, 12])}`, `Ex 4: ${mr(S.fromStemLeaf(ex4))}`,
      `Ex 5: median 12, range 33, mean ${S.fmt(S.mean([11, 12, 12, 13, 12, 44]))}; the median, because 44 is an outlier`, 'Ex 6: e.g. 3, 5, 8, 9, 13']],
    ['Set A', setA.map((xs) => S.fmt(S.median(xs)))],
    ['Set B', setB.map((xs) => S.fmt(S.range(xs)))],
    ['Set C', setC.map(([, xs]) => mr(xs))],
    ['Set D', ['e.g. 2, 4, 6, 8, 10', '7 + 15 = 22', 'Median 7 → 7.5; range 6 → 16', 'Class B is more consistent (smaller range); Class A did better overall (higher median)',
      'The mean uses every value’s size, but the median only depends on the middle position', '10 and 10', 'e.g. 3, 6, 8, 10, 13', '195 cm', 'Yes, when every value is the same', `${mr(family)}. Not really: no one is aged about 12.5`]],
    ['Extension', ['The 20th and 21st', '20 values: 10th and 11th are both 3, so the median is 3', '50.5']],
    ['Exit ticket', ['Level 1: 7', `Level 2: ${mr([9, 3, 7, 3, 11, 6])}`, 'Level 3: e.g. 2, 4, 6, 9, 12']],
  ];

  return { code: '10.06', title: 'The median and range', pages, answers };
};
