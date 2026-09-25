// 10.03 Dot plots: reading dot plots, drawing them from data, mode, outliers and clusters.
const G = require('../../../lib/graphs');
const S = require('../../../lib/stats');
const { banner, weDo, youDo, q, qDraw, qs, example, worked, graphCard, split, makeLesson } = require('../../../lib/layout');

module.exports = (chapter) => {
  const L = makeLesson({ chapter, code: '10.03', title: 'Dot plots' });

  const pets = { 0: 4, 1: 6, 2: 5, 3: 3, 4: 1, 7: 1 };
  const sleep = { 6: 1, 7: 3, 8: 6, 9: 5, 10: 4, 12: 1 };
  const shoes = [6, 7, 7, 8, 8, 8, 9, 7, 8, 10, 9, 8, 7, 6, 8, 9];
  const temps = { 22: 1, 23: 2, 24: 4, 25: 6, 26: 7, 27: 5, 28: 3, 29: 1, 34: 1 };
  const texts = [5, 7, 3, 6, 5, 12, 6, 4, 5, 8, 6, 7, 5, 30, 6, 5, 9, 7, 4, 6, 5, 8, 6, 7, 5];
  const exitData = { 2: 1, 3: 3, 4: 5, 5: 2, 9: 1 };

  // Sanity checks on the data behind the answers.
  const count = (xs, f) => xs.filter(f).length;
  if (S.expand(sleep).length !== 20 || S.expand(temps).length !== 30 || texts.length !== 25 || shoes.length !== 16) throw new Error('10.03 data size');
  if (S.modeText(texts) !== '5' || S.modeText(shoes) !== '8' || S.modeText(S.expand(temps)) !== '26') throw new Error('10.03 modes');

  const g = {
    pets: G.dotPlot({ title: 'Number of pets owned by students in 7B', min: 0, max: 7, counts: pets, xTitle: 'Number of pets' }),
    sleep: G.dotPlot({ title: 'Hours of sleep of 20 students', min: 6, max: 12, counts: sleep, xTitle: 'Hours of sleep' }),
    temps: G.dotPlot({ title: 'Daily maximum temperature, Kingscliff, November', min: 22, max: 34, counts: temps, xTitle: 'Temperature (°C)', w: 176, dotR: 1.05 }),
    exit: G.dotPlot({ title: 'Goals in 12 netball games', min: 2, max: 9, counts: exitData, xTitle: 'Goals', w: 60, dotR: 1.1 }),
  };

  const setA = ['How many students were surveyed?', 'How many slept 8 hours?', 'How many slept 10 hours?', 'What is the mode?', 'What is the least sleep?',
    'What is the most sleep?', 'What is the outlier?', 'How many slept 9 hours or more?', 'How many slept less than 8 hours?', 'How many more slept 8 hours than 7?'];
  const setBShort = ['What is the mode?', 'How many wear size 9?', 'How many wear a size bigger than 8?', 'What is the smallest size?', 'How many wear size 7 or smaller?',
    'Is there an outlier? (yes/no)', 'What fraction wear size 8?', 'Which size is least common?'];
  const setC = ['What is the mode?', 'What is the outlier?', 'How many days were 25&nbsp;°C?', 'How many days were above 27&nbsp;°C?', 'What fraction of days were below 24&nbsp;°C?',
    'What percentage of days were 25&nbsp;°C?', 'How many days were 24 or 25&nbsp;°C?', 'What fraction of days were 26&nbsp;°C?', 'Where is the main cluster?', 'Give a reason for the outlier.'];
  const setD = ['What is the mode?', 'Which value(s) are outliers?', 'How many students sent more than 7 texts?', 'What fraction sent 5 or fewer texts? Simplify.',
    'What percentage sent exactly 6 texts?', 'Describe where the data clusters.', 'If the outlier is removed, does the mode change? Explain.',
    'Why is a dot plot a good choice for this data?', 'Write one sentence that sums up what the dot plot shows.'];

  const ext = split(worked(4, 'Worked example', 'Make up 8 values whose dot plot has a mode of 5, a cluster from 4 to 6, and an outlier at 12.',
    ['Put the most dots at 5: 5, 5, 5', 'Add values close by for the cluster: 4, 4, 6, 6', 'Add one value far away for the outlier: 12'],
    '<b>Answer:</b> 4, 4, 5, 5, 5, 6, 6, 12',
    `<div class="diagram">${G.dotPlot({ min: 3, max: 12, counts: { 4: 2, 5: 3, 6: 2, 12: 1 }, w: 80 })}</div>`),
    youDo('read the worked example, then try these.', `<div class="stack">
      ${qDraw('E1', 'Make up 10 values with a mode of 3 and one outlier. Draw the dot plot.', `<div class="template-card">${G.dotPlotTemplate({ ticks: 12, labels: false, w: 88, h: 17 })}</div>`)}
      ${q('E2', 'Of 30 values, ⅓ are 7s. There are twice as many 7s as 8s. How many 8s?')}
      ${q('E3', 'Why would a dot plot <b>not</b> suit the heights of 200 students?')}</div>`, 'fill'), 'ext grow');

  const pages = [
    L.page('Start here · Level 1', `
      ${L.intro({
        li: ['read information from a dot plot', 'draw a dot plot from a list of data', 'describe a dot plot using the mode, clusters and outliers'],
        sc: ['count how many times a value occurs and find the <b>mode</b>', 'draw a neat dot plot with an even scale and a label', 'spot an <b>outlier</b> and describe where the data <b>clusters</b>'],
        terms: ['Dot plot', 'Outlier', 'Cluster'],
      })}
      ${L.notes()}
      ${banner(1)}
      ${split(graphCard(g.pets), weDo(`<div class="col">${example('Example 1', 'How many students have 2 pets? How many students were surveyed?')}${example('Example 2', 'What is the mode? Which value is an outlier?')}</div>`, 'fill'))}
      ${youDo('Set A. Use the sleep dot plot.', split(graphCard(g.sleep), `<div class="short-list">${setA.map((t, i) => qs(i + 1, t)).join('')}</div>`))}
    `, { first: true }),

    L.page('Level 1 · Level 2', `
      ${youDo('Set B. Shoe sizes of 16 students.', `
        <p class="given"><b>Data:</b> ${shoes.join(', ')}</p>
        ${split(
          qDraw(1, 'Complete the frequency table.', G.table(['Size', '6', '7', '8', '9', '10'], [['Tally', '', '', '', '', ''], ['Frequency', '', '', '', '', '']], 'blank')),
          qDraw(2, 'Draw a dot plot of the shoe sizes.', `<div class="template-card">${G.dotPlotTemplate({ min: 5, max: 11, w: 88, h: 25, xTitle: 'Shoe size' })}</div>`))}
        <div class="short-grid" style="grid-template-rows: repeat(4, auto)">${setBShort.map((t, i) => qs(i + 3, t)).join('')}</div>`)}
      ${banner(2)}
      ${weDo(split(
        example('Example 3', 'Draw a dot plot for: 12, 14, 13, 12, 15, 12, 14, 20', `<div class="template-card">${G.dotPlotTemplate({ min: 11, max: 21, w: 88, h: 22 })}</div>`),
        example('Example 4', 'Describe the dot plot in Example 3. Where is the cluster? Is there an outlier?'), 'ex-row'))}
      ${youDo('Set C. Use the temperature dot plot.', `${graphCard(g.temps)}<div class="short-grid fill">${setC.map((t, i) => `<div class="qs wide-box"><span class="q-num">${i + 1}</span><span class="q-text">${t}</span><span class="box"></span></div>`).join('')}</div>`, 'grow')}
    `),

    L.page('Level 3 · Exit ticket', `
      ${banner(3, 'Finished Set D? Try the extension on the next page.')}
      ${weDo(`
        <p class="given"><b>Test scores out of 10:</b> 5, 6, 6, 7, 7, 7, 7, 8, 8, 8, 9, 9, 10, 2, 6, 7, 8, 9, 7, 8</p>
        ${split(example('Example 5', 'Draw a dot plot of the test scores. Choose your own scale and label it.', `<div class="template-card">${G.dotPlotTemplate({ ticks: 11, labels: false, w: 88, h: 24 })}</div>`),
          example('Example 6', 'Describe the shape of the data. What does it tell the teacher about the class?'), 'ex-row tall')}`)}
      ${youDo('Set D. Text messages sent in one day by 25 students.', `
        <p class="given"><b>Data:</b> ${texts.join(', ')}</p>
        ${qDraw(1, 'Draw a dot plot of the data. Choose a scale that fits every value, and label the axis.', `<div class="template-card">${G.dotPlotTemplate({ ticks: 30, labels: false, w: 176, h: 26 })}</div>`)}
        <div class="work-grid c3 r3">${setD.map((t, i) => q(i + 2, t)).join('')}</div>`, 'grow')}
      ${L.exitTicket({ graph: g.exit, questions: ['What is the mode?', 'What fraction of the games had 3 goals or fewer? Simplify.', 'Which value is the outlier? Describe where the other values cluster.'] })}
    `),

    L.page('Extension · Summary', `
      ${banner(4)}
      ${ext}
      ${L.summaryBanner}
      <div class="summary-grid">
        <div class="steps-card"><b>Drawing a dot plot</b><ol><li>Find the smallest and largest values.</li><li>Draw a number line with an <b>even scale</b>.</li><li>Put one dot per value above the line. Stack neatly.</li><li>Add a <b>title</b> and label the axis.</li></ol></div>
        ${worked(1, 'Level 1', 'How many students have 2 siblings? What is the mode?', ['Count the dots above 2: 4', 'Tallest stack is above 1'], '<b>Answer:</b> 4; mode 1',
          `<div class="diagram">${G.dotPlot({ min: 0, max: 4, counts: { 0: 2, 1: 5, 2: 4, 3: 1, 4: 1 }, w: 44, dotR: 1.1 })}</div>`)}
        ${worked(2, 'Level 2', 'Draw a dot plot for: 3, 5, 4, 5, 6, 5, 4', ['Line from 3 to 6', 'One dot for each value'], '<b>Answer:</b> mode 5',
          `<div class="diagram">${G.dotPlot({ min: 3, max: 6, counts: { 3: 1, 4: 2, 5: 3, 6: 1 }, w: 40, dotR: 1.1 })}</div>`)}
        ${worked(3, 'Level 3', 'What fraction of these 20 days were warmer than 25&nbsp;°C?', ['Dots above 26 and 27: 5 + 3 = 8', '8/20 = 2/5'], '<b>Answer:</b> 2/5 (40%)',
          `<div class="diagram">${G.dotPlot({ min: 22, max: 27, counts: { 22: 1, 23: 2, 24: 4, 25: 5, 26: 5, 27: 3 }, w: 44, dotR: 1.1 })}</div>`)}
        ${worked(4, 'Extension', 'Describe the dot plot using a cluster and an outlier.', ['Values bunch from 4 to 6', '12 is far away'], '<b>Answer:</b> cluster 4–6, outlier 12',
          `<div class="diagram">${G.dotPlot({ min: 3, max: 12, counts: { 4: 2, 5: 3, 6: 2, 12: 1 }, w: 50, dotR: 1.1 })}</div>`)}
      </div>
      ${L.tearBack()}
    `),
  ];

  const shoeCounts = [6, 7, 8, 9, 10].map((v) => count(shoes, (x) => x === v));
  const answers = [
    ['WE DO examples', ['Ex 1: 5 students have 2 pets; 20 students surveyed', 'Ex 2: mode 1; outlier 7', 'Ex 3: dots at 12 (3), 13 (1), 14 (2), 15 (1), 20 (1)', 'Ex 4: cluster from 12 to 15; outlier 20',
      'Ex 5: scale 0 to 10; dots at 2 (1), 5 (1), 6 (3), 7 (6), 8 (5), 9 (3), 10 (1)', 'Ex 6: most scores cluster from 6 to 9 (mode 7); 2 is an outlier, so one student may need help']],
    ['Set A', ['20', '6', '4', '8 hours', '6 hours', '12 hours', '12', '10', '4', '3']],
    ['Set B', [`Frequencies: size 6: ${shoeCounts[0]}, 7: ${shoeCounts[1]}, 8: ${shoeCounts[2]}, 9: ${shoeCounts[3]}, 10: ${shoeCounts[4]}`, 'Dot plot matching the table', '8', '3', '4', '6', '6', 'No', '6/16 = 3/8', '10']],
    ['Set C', ['26 °C', '34 °C', '6', '5', '3/30 = 1/10', '6/30 = 20%', '10', '7/30', 'About 24 °C to 27 °C (most days 23 °C to 29 °C)', 'e.g. a heatwave or hot westerly wind on one day']],
    ['Set D', ['Scale 0 to 30 (or 3 to 30); dots: 3 (1), 4 (2), 5 (7), 6 (6), 7 (4), 8 (2), 9 (1), 12 (1), 30 (1)', '5', '30 (12 is also well away from the cluster)', `${count(texts, (x) => x > 7)}`,
      `${count(texts, (x) => x <= 5)}/25 = 2/5`, `${count(texts, (x) => x === 6)}/25 = 24%`, 'Most values cluster from 4 to 8', 'No. The mode is still 5 because it has the most dots', 'Small data set of whole numbers, so every value can be shown', 'e.g. Most students sent 4 to 8 texts, 5 was most common, and one student sent 30']],
    ['Extension', ['Any 10 values with the most at 3 and one far away', '10 sevens, so 5 eights', 'Too many values and heights have decimals, so the dots would not fit; use a stem-and-leaf plot or grouped graph']],
    ['Exit ticket', ['Level 1: 4', 'Level 2: 4/12 = 1/3', 'Level 3: outlier 9; the other values cluster from 2 to 5 (mostly 3 to 4)']],
  ];

  return { code: '10.03', title: 'Dot plots', pages, answers };
};
