// 10.04 Stem-and-leaf plots: reading, ordering and drawing stem-and-leaf plots, including decimals and 3-digit data.
const G = require('../../../lib/graphs');
const S = require('../../../lib/stats');
const { banner, weDo, youDo, q, qDraw, qs, qsGrid, qGrid, extension, example, worked, graphCard, split, makeLesson } = require('../../../lib/layout');

module.exports = (chapter) => {
  const L = makeLesson({ chapter, code: '10.04', title: 'Stem-and-leaf plots' });

  const surf = [[1, [2, 5, 8]], [2, [0, 3, 3, 7]], [3, [1, 4]], [4, [6]]];
  const spelling = [[2, [4, 8]], [3, [0, 2, 5, 5, 9]], [4, [1, 3, 3, 3, 6, 8]], [5, [0]]];
  const rugby = [[7, [9, 5, 8, 1, 6]], [8, [4, 2, 5, 0, 0, 8, 3]], [9, [0, 8, 4, 2, 2, 2]], [10, [5, 4]]];
  const exitPlot = [[3, [5, 1, 8]], [4, [2, 0, 6, 6]], [5, [3]]];
  const times = [14.2, 13.8, 15.1, 14.6, 13.5, 14.2, 16.0, 15.4, 14.9, 13.8, 14.2];
  const scores = [118, 124, 131, 109, 127, 124, 135, 112, 140];

  const sp = S.fromStemLeaf(spelling), rg = S.fromStemLeaf(rugby);
  if (sp.length !== 14 || rg.length !== 20 || S.modeText(sp) !== '43' || S.modeText(rg) !== '92' || S.modeText(times) !== '14.2') throw new Error('10.04 data check');
  const count = (xs, f) => xs.filter(f).length;
  const ordered = (rows) => rows.map(([s, l]) => `${s} | ${[...l].sort((a, b) => a - b).join(' ')}`).join('; ');

  const setA = ['How many students sat the test?', 'What was the lowest mark?', 'What was the highest mark?', 'What is the mode?', 'How many scored in the 30s?',
    'How many scored 40 or more?', 'What is the stem of 35?', 'What is the leaf of 48?', 'How many scored less than 30?', 'What number does 4 | 6 stand for?'];
  const setC = ['What is the lowest mass?', 'What is the highest mass?', 'Which mass occurs most often?', 'How many players weigh less than 80&nbsp;kg?',
    'How many weigh 90&nbsp;kg or more?', 'What fraction weigh in the 80s?', 'What percentage weigh 100&nbsp;kg or more?', 'Why is an ordered plot easier to read?'];

  const pages = [
    L.page('Start here · Level 1', `
      ${L.intro({
        li: ['read values from a stem-and-leaf plot', 'put a stem-and-leaf plot in order', 'draw a stem-and-leaf plot from a list of data'],
        sc: ['split a number into its <b>stem</b> and <b>leaf</b> and read the key', 'rewrite an unordered plot as an ordered plot', 'draw an ordered stem-and-leaf plot with a key, including decimals'],
        terms: ['Stem-and-leaf plot', 'Stem', 'Leaf'],
      })}
      ${L.notes()}
      ${banner(1)}
      ${split(graphCard(G.stemLeaf({ title: 'Ages of people in a surf class', rows: surf, key: '2 | 3 = 23 years' })),
        weDo(`<div class="col">${example('Example 1', 'Write all the ages in the 2 row.')}${example('Example 2', 'How many people are in the class? Who is youngest and oldest?')}</div>`, 'fill'))}
    `, { first: true }),

    L.page('Level 1', `
      ${youDo('Set A. Spelling test marks out of 50.', split(graphCard(G.stemLeaf({ rows: spelling, key: '3 | 5 = 35 marks' })), `<div class="short-list">${setA.map((t, i) => qs(i + 1, t)).join('')}</div>`))}
      ${youDo('Set B. Stems and leaves.', `
        ${qsGrid(['Stem and leaf of 47?', 'Stem and leaf of 63?', 'Stem and leaf of 105?', 'Stem and leaf of 9?', 'Order the leaves: 5 | 8 2 6 1', 'Order the leaves: 7 | 4 0 9 3 3'], { wide: true })}
        ${split(qDraw(7, 'Draw an ordered stem-and-leaf plot of:<br>23, 31, 27, 35, 22, 40, 38, 31, 26, 44', G.stemLeafTemplate({ stems: [2, 3, 4] })),
          `<div class="col">${q(8, 'How many values are in the 30s?')}${q(9, 'What is the mode?')}${q(10, 'What is the highest value?')}</div>`, 'grow')}`, 'grow')}
    `),

    L.page('Level 2', `
      ${banner(2)}
      ${weDo(`
        ${example('Example 3', 'Rewrite this unordered plot as an ordered plot.', split(graphCard(G.stemLeaf({ title: 'Unordered', rows: [[6, [8, 2, 5]], [7, [3, 0, 9, 1]], [8, [4, 4, 0]]], key: '7 | 3 = 73' })), G.stemLeafTemplate({ stems: [6, 7, 8] })))}
        ${example('Example 4', 'Draw an ordered stem-and-leaf plot of: 56, 43, 61, 48, 55, 59, 62, 47, 55', split(G.stemLeafTemplate({ stems: 3 }), '<div class="box"></div>'))}`)}
      ${youDo('Set C. Masses of rugby players (kg). Questions 3–10 are on the next page.', split(graphCard(G.stemLeaf({ title: 'Unordered plot', rows: rugby, key: '8 | 4 = 84 kg' })),
        `<div class="col">${qDraw(1, 'Rewrite the plot as an ordered stem-and-leaf plot.', G.stemLeafTemplate({ stems: [7, 8, 9, 10] }))}${q(2, 'How many players are there?')}</div>`, 'wide-right grow'), 'grow')}
    `),

    L.page('Level 2 · Level 3', `
      ${youDo('Set C continued. Use the rugby plot on the previous page.', qGrid(setC, { start: 3 }), 'grow')}
      ${banner(3)}
      ${weDo(split(
        example('Example 5', 'Heights (cm): 142, 155, 138, 149, 151, 160, 147, 138, 153. Use the first two digits as the stem.', G.stemLeafTemplate({ stems: 4 })),
        example('Example 6', 'Decimals: 2.4, 3.1, 2.8, 3.5, 4.0, 2.4, 3.9. Stem = whole number, leaf = tenths.', G.stemLeafTemplate({ stems: 3 }))))}
    `),

    L.page('Level 3', `
      ${youDo('Set D. Decimals.', `
        <p class="given"><b>100 m sprint times (seconds):</b> ${times.map((t) => t.toFixed(1)).join(', ')}</p>
        ${split(qDraw(1, 'Draw an ordered stem-and-leaf plot of the times. Include a key.', G.stemLeafTemplate({ stems: 5 })),
          `<div class="col">${q(2, 'How many runners were there?')}${q(3, 'What was the fastest time?')}</div>`)}
        ${qGrid(['What is the mode?', 'How many ran under 14 seconds?', 'What fraction ran 15 seconds or slower?', 'What is the difference between the fastest and slowest times?'], { start: 4 })}`, 'grow')}
    `),

    L.page('Level 3', `
      ${youDo('Set D continued. 3-digit numbers.', `
        <p class="given"><b>Scores in a video game:</b> ${scores.join(', ')}</p>
        ${split(qDraw(8, 'Draw an ordered stem-and-leaf plot of the scores. Include a key.', G.stemLeafTemplate({ stems: 6 })),
          `<div class="col">${q(9, 'Which stems did you use? Why?')}</div>`)}
        ${qGrid(['Why must a stem-and-leaf plot have a key?', 'Give one advantage of a stem-and-leaf plot over a column graph.'], { start: 10, cols: 1 })}`, 'grow')}
    `),

    L.page('Extension · Exit ticket', `
      ${extension(worked(4, 'Worked example: split stems',
        'Many values share a stem: 41, 42, 42, 44, 45, 46, 47, 47, 48, 49, 52, 53. Draw a split-stem plot.',
        ['Split each stem into two rows', 'Row “4” holds leaves 0 to 4; row “4*” holds leaves 5 to 9', 'Do the same for 5 if you need to'],
        '<b>Answer:</b> the long row is split, so it is easier to read',
        `<div class="diagram">${G.stemLeaf({ rows: [['4', [1, 2, 2, 4]], ['4*', [5, 6, 7, 7, 8, 9]], ['5', [2, 3]]], key: '4* | 7 = 47' })}</div>`),
        `${qDraw('E1', 'Draw a split-stem plot of: 20, 21, 23, 25, 26, 28, 31, 32, 37', G.stemLeafTemplate({ stems: ['2', '2*', '3', '3*'] }))}
         ${q('E2', 'A plot has the key 5 | 2 = 0.52. What number does 6 | 7 stand for?')}
         ${q('E3', 'When is it useful to split the stems?')}`)}
      ${L.exitTicket({ graph: G.stemLeaf({ title: 'Unordered plot', rows: exitPlot, key: '4 | 2 = 42' }), questions: ['How many values are in the plot?', 'Write the 4 row with its leaves in order.', 'What fraction of the values are 40 or more? What is the mode?'] })}
    `),

    L.page('Summary', `
      ${L.summary('Drawing a stem-and-leaf plot', ['Choose the <b>stems</b> (usually the tens) and write them down the left.', 'Write each <b>leaf</b> (the units) next to its stem.', 'Rewrite with the leaves <b>in order</b>, smallest first.', 'Always add a <b>key</b>, e.g. 3 | 5 = 35.'], [
        worked(1, 'Level 1', 'What values are in the 3 row?', ['The stem 3 means 30-something', 'Put each leaf after the stem: 32, 35, 37'], '<b>Answer:</b> 32, 35 and 37',
          `<div class="diagram">${G.stemLeaf({ rows: [[2, [4, 8]], [3, [2, 5, 7]], [4, [1]]], key: '3 | 2 = 32' })}</div>`),
        worked(2, 'Level 2', 'Order this plot: 5 | 7 2 9 &nbsp; 6 | 3 0 8 1', ['Keep the stems', 'Sort each row’s leaves from smallest to largest'], '<b>Answer:</b> 5 | 2 7 9 and 6 | 0 1 3 8',
          `<div class="diagram">${G.stemLeaf({ rows: [[5, [2, 7, 9]], [6, [0, 1, 3, 8]]], key: '5 | 2 = 52' })}</div>`),
        worked(3, 'Level 3', 'Draw a plot of 2.3, 3.6, 2.9, 3.1, 4.2', ['Stem = whole number, leaf = tenths', 'Stems 2, 3, 4', 'Order the leaves and add a key'], '<b>Answer:</b> key 2 | 3 = 2.3',
          `<div class="diagram">${G.stemLeaf({ rows: [[2, [3, 9]], [3, [1, 6]], [4, [2]]], key: '2 | 3 = 2.3' })}</div>`),
        worked(4, 'Extension', 'Why split a stem into 4 and 4*?', ['A row with lots of leaves is hard to read', '4 takes leaves 0–4 and 4* takes 5–9'], '<b>Answer:</b> it spreads out crowded data',
          `<div class="diagram">${G.stemLeaf({ rows: [['4', [0, 2, 3]], ['4*', [5, 7, 8, 9]]], key: '4* | 7 = 47' })}</div>`),
      ])}
      ${L.tearBack()}
    `),
  ];

  const answers = [
    ['WE DO examples', ['Ex 1: 20, 23, 23, 27', 'Ex 2: 10 people; youngest 12, oldest 46', 'Ex 3: 6 | 2 5 8, 7 | 0 1 3 9, 8 | 0 4 4', 'Ex 4: 4 | 3 7 8, 5 | 5 5 6 9, 6 | 1 2 (key 4 | 3 = 43)',
      'Ex 5: 13 | 8 8, 14 | 2 7 9, 15 | 1 3 5, 16 | 0 (key 14 | 2 = 142 cm)', 'Ex 6: 2 | 4 4 8, 3 | 1 5 9, 4 | 0 (key 2 | 4 = 2.4)']],
    ['Set A', [`${sp.length}`, `${Math.min(...sp)}`, `${Math.max(...sp)}`, S.modeText(sp), `${count(sp, (x) => x >= 30 && x < 40)}`, `${count(sp, (x) => x >= 40)}`, '3', '8', `${count(sp, (x) => x < 30)}`, '46']],
    ['Set B', ['4 | 7', '6 | 3', '10 | 5', '0 | 9', '1 2 6 8', '0 3 3 4 9', '2 | 2 3 6 7, 3 | 1 1 5 8, 4 | 0 4', '4', '31', '44']],
    ['Set C', [`Ordered: ${ordered(rugby)}`, `${rg.length} players`, `${Math.min(...rg)} kg`, `${Math.max(...rg)} kg`, `${S.modeText(rg)} kg`, `${count(rg, (x) => x < 80)}`, `${count(rg, (x) => x >= 90)}`,
      `${count(rg, (x) => x >= 80 && x < 90)}/20`, `${count(rg, (x) => x >= 100)}/20 = 10%`, 'You can see the lowest, highest and most common values straight away']],
    ['Set D', ['13 | 5 8 8, 14 | 2 2 2 6 9, 15 | 1 4, 16 | 0 (key 13 | 5 = 13.5 s)', `${times.length}`, `${Math.min(...times)} s`, `${S.modeText(times)} s`, `${count(times, (x) => x < 14)}`, `${count(times, (x) => x >= 15)}/11`, `${S.fmt(Math.max(...times) - Math.min(...times))} s`,
      '10 | 9, 11 | 2 8, 12 | 4 4 7, 13 | 1 5, 14 | 0 (key 12 | 4 = 124)', '10 to 14: the first two digits, so every leaf is one digit', 'So the reader knows what the numbers mean (e.g. 2 | 4 could be 24 or 2.4)', 'It shows every actual value, and still shows the shape']],
    ['Extension', ['2 | 0 1 3, 2* | 5 6 8, 3 | 1 2, 3* | 7', '0.67', 'When one stem has many leaves, so the data is bunched up']],
    ['Exit ticket', ['Level 1: 8', 'Level 2: 4 | 0 2 6 6', 'Level 3: 5/8; mode 46']],
  ];

  return { code: '10.04', title: 'Stem-and-leaf plots', pages, answers };
};
