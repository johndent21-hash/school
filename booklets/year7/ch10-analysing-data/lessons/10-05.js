// 10.05 The mean and mode: calculating from lists, frequency tables and dot plots; missing values; effect of outliers.
const G = require('../../../lib/graphs');
const S = require('../../../lib/stats');
const { banner, weDo, youDo, q, qs, example, worked, split, makeLesson } = require('../../../lib/layout');

module.exports = (chapter) => {
  const L = makeLesson({ chapter, code: '10.05', title: 'The mean and mode' });
  const list = (xs) => xs.join(', ');

  const setA = [[2, 4, 6], [5, 7, 9], [1, 3, 5, 7], [10, 20, 30], [3, 5, 4, 8], [6, 6, 9, 3], [2, 8, 5, 7, 3], [12, 15, 18], [4, 9, 2, 5, 10], [7, 11, 9, 13]];
  const setB = [[2, 3, 3, 5, 8], [1, 4, 4, 6, 9], [7, 2, 5, 2, 9], [6, 1, 8, 6, 3], [10, 12, 11, 10, 15], [4, 9, 7, 9, 2, 5, 9], [1, 2, 3, 4, 5], [6, 2, 8, 2, 6, 5], null, [20, 25, 22, 25, 21]];
  const setC = [
    ['', [5, 3, 2, 6, 7, 5, 5]],
    ['', [9, 5, 2, 2, 5, 2, 4, 7]],
    ['', [12, 15, 11, 15, 10, 14]],
    ['', [2.5, 3.5, 4, 6]],
    ['Temperatures (°C) for a week: ', [21, 24, 19, 24, 22, 23, 21]],
    ['Goals in 8 games: ', [2, 0, 3, 1, 2, 4, 2, 2]],
    ['Pocket money ($): ', [15, 20, 10, 25, 20, 30]],
    ['Scores: 1 three times, 2 four times, 3 twice, 4 once', S.expand({ 1: 3, 2: 4, 3: 2, 4: 1 })],
    ['Goals: 0 twice, 1 four times, 2 three times, 3 once', S.expand({ 0: 2, 1: 4, 2: 3, 3: 1 })],
    ['Heights (cm): ', [150, 145, 160, 155, 148, 152]],
  ];
  const cText = ([label, xs]) => (label.includes('times') || label.includes('twice') ? label : `${label}${list(xs)}`);
  const exitMM = [3, 7, 7, 2, 9, 5];

  const pages = [
    L.page('Start here · Level 1', `
      ${L.intro({
        li: ['calculate the mean and the mode of a set of data', 'use the mean to find a missing value', 'decide whether the mean or the mode better describes the data'],
        sc: ['find the <b>mean</b> by adding the values and dividing by how many there are', 'find the <b>mode</b>, and tell when there is no mode or more than one', 'work backwards from the mean to find a missing value'],
        terms: ['Mean', 'Mode'],
      })}
      ${L.notes('fixed')}
      ${banner(1)}
      ${weDo(split(example('Example 1', 'Find the <b>mean</b> of: 4, 7, 5, 8, 6'), example('Example 2', 'Find the <b>mode</b> of: 3, 9, 4, 7, 4, 8, 5'), 'ex-row tall'))}
      ${youDo('Set A. Find the <b>mean</b> of each set of numbers.', `<div class="work-grid">${setA.map((xs, i) => q(i + 1, list(xs))).join('')}</div>`, 'grow')}
    `, { first: true }),

    L.page('Level 1 · Level 2', `
      ${youDo('Set B. Find the <b>mode</b>. Write “no mode” if there isn’t one.', `<div class="short-grid">${setB.map((xs, i) => qs(i + 1, xs ? list(xs) : 'red, blue, red, green, blue, red')).join('')}</div>`)}
      ${banner(2)}
      ${weDo(split(
        example('Example 3', 'Find the mean and mode of: 5, 9, 8, 6, 9, 7. Round the mean to 2 decimal places.'),
        example('Example 4', `Find the mean and mode of the scores in this table.<br>${G.table(['Score', '1', '2', '3', '4'], [['Frequency', '2', '5', '4', '1']])}`), 'ex-row tall'))}
      ${youDo('Set C. Find the <b>mean</b> and the <b>mode</b>. Round the mean to 2 decimal places where needed.', `<div class="work-grid">${setC.map((c, i) => q(i + 1, cText(c))).join('')}</div>`, 'grow')}
    `),

    L.page('Level 3 · Exit ticket', `
      ${banner(3, 'Finished Set D? Try the extension on the next page.')}
      ${weDo(split(
        example('Example 5', 'The mean of five numbers is 8. Four of them are 6, 9, 5 and 10. Find the fifth number.'),
        example('Example 6', 'Ages at a party: 11, 12, 12, 13, 12, 44. Find the mean and mode. Which better describes a typical age?'), 'ex-row tall'))}
      ${youDo('Set D. Show your working.', `<div class="work-grid">
        ${q(1, 'The mean of four numbers is 6. Three of them are 4, 7 and 8. Find the fourth.')}
        ${q(2, 'The mean of five test scores is 72. Four are 68, 75, 70 and 80. Find the fifth.')}
        ${q(3, 'Write a set of five numbers with a mean of 6 and a mode of 4.')}
        ${q(4, 'For 3, 5, 6, 6, 40, find the mean and mode. Which is the better measure? Why?')}
        ${q(5, 'The number 20 is added to 4, 6, 7, 8, 10. How does the mean change?')}
        ${q(6, 'Mia scored 7, 8, 6 and 9 on four quizzes. What must she score next to have a mean of 8?')}
        ${q(7, 'The mean of six numbers is 15. One is removed and the mean of the other five is 14. Which number was removed?')}
        ${q(8, 'Shoe sizes sold: 7, 8, 8, 9, 10, 8, 11. Should the shop use the mean or the mode to decide what to order? Why?')}
        ${q(9, 'The mean of three whole numbers in a row (like 4, 5, 6) is 17. What are the numbers?')}
        ${q(10, 'Class A: 12, 15, 15, 18, 20. Class B: 10, 14, 16, 19, 21. Compare their means and modes.')}</div>`, 'grow')}
      ${L.exitTicket({ questions: ['Find the mean of: 4, 6, 8, 10, 12', `Find the mean and mode of: ${list(exitMM)}`, 'The mean of four numbers is 9. Three of them are 7, 12 and 5. Find the fourth number.'] })}
    `),

    L.page('Extension · Summary', `
      ${banner(4)}
      ${split(worked(4, 'Worked example', 'The mean age of four friends is 13. A fifth friend joins and the mean age becomes 14. How old is the new friend?',
        ['Total of four ages: 4 × 13 = 52', 'Total of five ages: 5 × 14 = 70', 'New friend: 70 − 52 = 18', 'Check: 70 ÷ 5 = 14 ✓'], '<b>Answer:</b> 18 years old',
        '<p class="tip"><b>Key idea:</b> mean × number of values = total.</p>'),
        youDo('read the worked example, then try these.', `<div class="stack">
          ${q('E1', 'The mean mark of 10 students is 65. One test is re-marked and gains 15 marks. What is the new mean?')}
          ${q('E2', 'The mean of 8 numbers is 12. The numbers 5 and 9 are removed. What is the mean of the rest?')}
          ${q('E3', 'Can the mean be a number that is not in the data? Give an example.')}</div>`, 'fill'), 'ext grow')}
      ${L.summaryBanner}
      <div class="summary-grid">
        <div class="steps-card"><b>Remember</b><ol><li><b>Mean</b> = total of the values ÷ number of values.</li><li><b>Mode</b> = the value that appears most often.</li><li>There can be <b>no mode</b> or <b>more than one</b> mode.</li><li>An <b>outlier</b> pulls the mean towards it; the mode is not affected.</li></ol></div>
        ${worked(1, 'Level 1', 'Find the mean and mode of 3, 5, 7, 5, 10', ['Total: 3 + 5 + 7 + 5 + 10 = 30', '5 values, so 30 ÷ 5 = 6', '5 appears most'], '<b>Answer:</b> mean 6, mode 5')}
        ${worked(2, 'Level 2', 'Find the mean and mode of 7, 8, 6, 9, 9, 5, 8', ['Total = 52, 7 values', '52 ÷ 7 = 7.428… ≈ 7.43', '8 and 9 both appear twice'], '<b>Answer:</b> mean 7.43, modes 8 and 9')}
        ${worked(3, 'Level 3', 'The mean of 4 scores is 15. Three are 12, 18, 14. Find the fourth.', ['Total needed: 4 × 15 = 60', 'Known total: 44', '60 − 44 = 16'], '<b>Answer:</b> 16')}
        ${worked(4, 'Extension', '5 numbers have a mean of 10. A sixth is added and the mean is 12. What was added?', ['5 × 10 = 50', '6 × 12 = 72', '72 − 50 = 22'], '<b>Answer:</b> 22')}
      </div>
      ${L.tearBack()}
    `),
  ];

  const mm = (xs) => `mean ${S.fmt(S.mean(xs))}, mode ${S.modeText(xs)}`;
  const answers = [
    ['WE DO examples', ['Ex 1: 30 ÷ 5 = 6', 'Ex 2: 4', `Ex 3: ${mm([5, 9, 8, 6, 9, 7])}`, `Ex 4: ${mm(S.expand({ 1: 2, 2: 5, 3: 4, 4: 1 }))} (total 28 ÷ 12)`, 'Ex 5: 5 × 8 = 40; 40 − 30 = 10',
      `Ex 6: ${mm([11, 12, 12, 13, 12, 44])}; the mode (12) is better because 44 is an outlier`]],
    ['Set A', setA.map((xs) => S.fmt(S.mean(xs)))],
    ['Set B', setB.map((xs) => (xs ? S.modeText(xs) : 'red'))],
    ['Set C', setC.map(([, xs]) => mm(xs))],
    ['Set D', ['24 − 19 = 5', '360 − 293 = 67', 'e.g. 4, 4, 5, 8, 9', `${mm([3, 5, 6, 6, 40])}; the mode, because 40 is an outlier`, `Mean goes from 7 to ${S.fmt(S.mean([4, 6, 7, 8, 10, 20]))} (up about 2.17)`,
      '5 × 8 = 40; 40 − 30 = 10', '90 − 70 = 20', 'The mode (size 8), because it is the size sold most often', '16, 17, 18', `Both means are 16; A has mode 15, B has no mode`]],
    ['Extension', ['650 + 15 = 665; 665 ÷ 10 = 66.5', `96 − 14 = 82; 82 ÷ 6 = ${S.fmt(82 / 6)}`, 'Yes, e.g. 1, 2, 3, 4 has mean 2.5']],
    ['Exit ticket', ['Level 1: 8', `Level 2: ${mm(exitMM)}`, 'Level 3: 36 − 24 = 12']],
  ];

  return { code: '10.05', title: 'The mean and mode', pages, answers };
};
