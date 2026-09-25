// 10.01 Interpreting graphs: picture, column, sector, line and divided bar graphs.
const G = require('../../../lib/graphs');
const { banner, weDo, youDo, q, qs, qsGrid, qGrid, extension, example, worked, graphCard, split, makeLesson } = require('../../../lib/layout');

module.exports = (chapter) => {
  const L = makeLesson({ chapter, code: '10.01', title: 'Interpreting graphs' });
  const { C } = G;

  const g = {
    library: G.pictureGraph({
      title: 'Books borrowed from the library',
      rows: [['Monday', 3], ['Tuesday', 4.5], ['Wednesday', 2], ['Thursday', 5], ['Friday', 3.5]],
      key: '4 books',
    }),
    beach: G.columnGraph({
      title: 'Favourite beach activity of 7K',
      cats: ['Swimming', 'Surfing', 'Fishing', 'Beach\ncricket', 'Snorkel-\nling', 'Sand-\ncastles'],
      values: [8, 6, 2, 5, 3, 4], max: 10, step: 1, labelEvery: 2, yTitle: 'Number of students', h: 50,
    }),
    travel: G.sectorGraph({
      title: 'How 80 Year 7 students travel to school',
      slices: [['Bus', 40, C.blue, true], ['Car', 20, C.charcoal, true], ['Walk', 10, C.sand], ['Bike', 6, C.lightBlue], ['Scooter', 4, C.grey]],
    }),
    temp: G.lineGraph({
      title: 'Mean minimum temperature, Kingscliff',
      xs: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      ys: [20, 20, 19, 16, 12, 11, 9, 10, 12, 14, 17, 19], max: 22, yTitle: 'Temperature (°C)', xTitle: 'Month',
    }),
    ages: G.pictureGraph({
      title: 'Ages of people in a coastal town',
      rows: [['0–14 years', 4.5], ['15–24 years', 2.5], ['25–44 years', 5], ['45–64 years', 6], ['65+ years', 7]],
      key: '4% of people', labelW: 20,
    }),
    music: G.dividedBar({
      title: 'How Australians listen to music',
      parts: [['Streaming', 55, C.blue], ['Radio', 20, C.charcoal], ['Downloads', 10, C.sand, true], ['CDs', 5, C.lightBlue], ['Vinyl', 5, C.grey], ['Other', 5, '#d9d6c8']],
    }),
    pets: G.columnGraph({
      title: 'Pets owned by 7B', cats: ['Dog', 'Cat', 'Fish', 'Bird', 'No pet'],
      values: [9, 6, 3, 2, 5], max: 10, step: 1, labelEvery: 2, yTitle: 'Number of students', w: 60, h: 46,
    }),
  };

  const setA = ['What does 1 symbol stand for?', 'What does ½ a symbol stand for?', 'How many books on Monday?', 'How many books on Wednesday?', 'How many books on Friday?',
    'Which day had the most books?', 'Which day had the fewest books?', 'How many more on Friday than Monday?', 'How many on Monday and Tuesday?', 'How many symbols show 16 books?'];
  const setB = ['How many chose surfing?', 'How many chose fishing?', 'Which was the most popular?', 'Which was the least popular?', 'Which activity had 5 votes?',
    'How many chose snorkelling?', 'How many more swam than fished?', 'How many chose surfing or fishing?', 'How many students are in 7K?', 'What does 1 gridline stand for?'];
  const setC = ['Which way of travel is the most common?', 'Estimate how many students travel by car.', 'Estimate how many students walk.', 'True or false: fewer than 10 ride a bike.',
    'How many students do <b>not</b> catch the bus?', 'Which 2 months are warmest? What is their mean minimum?', 'Name 2 months with the same mean minimum.',
    'Which month has a mean minimum of 14&nbsp;°C?', 'Which 2 months in a row have the biggest rise?', 'Which 2 months in a row have the biggest drop?'];
  const setD = ['What percentage of people are aged 65+?', 'What percentage of people are under 25?', 'Town of 5000 people: how many are 0&#8209;14?',
    'How many symbols would show 30% of the town?', 'Why might 65+ be the biggest group in this town?', 'Which 2 ways of listening add up to 75% of people?',
    'What fraction of people listen to the radio?', 'Survey of 400: how many use downloads?', 'Of 400: how many more stream than radio?',
    'How might this graph change in 10 years? Why?'];

  const pages = [
    L.page('Start here · Level 1', `
      ${L.intro({
        li: ['read and interpret picture, column, sector, line and divided bar graphs', 'explain what a graph tells us about real data'],
        sc: ['use a <b>key</b> and a <b>scale</b> to read values from a graph', 'estimate amounts from a <b>sector graph</b> using fractions of a circle', 'read percentages from a <b>divided bar graph</b> and give reasons for patterns'],
        terms: ['Key', 'Sector graph', 'Divided bar graph'],
      })}
      ${L.notes()}
      ${banner(1)}
      ${split(graphCard(g.library), weDo(`<div class="col">${example('Example 1', 'How many books were borrowed on Tuesday?')}${example('Example 2', 'How many more books on Thursday than Wednesday?')}</div>`, 'fill'))}
    `, { first: true }),

    L.page('Level 1', `
      ${youDo('Set A. Use the library picture graph.', split(graphCard(g.library), `<div class="short-list">${setA.map((t, i) => qs(i + 1, t)).join('')}</div>`))}
      ${youDo('Set B. Use the column graph.', split(graphCard(g.beach), `<div class="short-list">${setB.map((t, i) => qs(i + 1, t)).join('')}</div>`))}
    `),

    L.page('Level 2', `
      ${banner(2)}
      ${split(graphCard(g.travel), graphCard(g.temp))}
      ${weDo(split(example('Example 3', 'What fraction of the students catch the bus? How many students is that?'), example('Example 4', 'Which month is coldest? How much colder is June than March?'), 'ex-row tall'))}
      ${youDo('Set C. Questions 1–4 use the sector graph above.', qGrid(setC.slice(0, 4)), 'grow')}
    `),

    L.page('Level 2', `
      ${youDo('Set C continued. Question 5 uses the sector graph and 6–10 use the line graph.', `
        ${split(graphCard(g.travel), graphCard(g.temp))}
        ${qGrid(setC.slice(4), { start: 5 })}`, 'grow')}
    `),

    L.page('Level 3', `
      ${banner(3)}
      ${split(graphCard(g.ages), graphCard(g.music))}
      ${weDo(split(example('Example 5', 'What percentage of the town is 45+? How many is that out of 5000?'), example('Example 6', 'What % stream music? How might this look different 20 years ago?'), 'ex-row tall'))}
      ${youDo('Set D. Use the picture graph above.', qGrid(setD.slice(0, 4), { cols: 2 }), 'grow')}
    `),

    L.page('Level 3', `
      ${youDo('Set D continued. Question 5 uses the picture graph and 6–10 use the divided bar graph.', `
        ${split(graphCard(g.ages), graphCard(g.music))}
        ${qGrid(setD.slice(4), { start: 5, cols: 2 })}`, 'grow')}
    `),

    L.page('Extension · Exit ticket', `
      ${extension(worked(4, 'Worked example',
        'In a survey of 72 students, the <b>Soccer</b> sector of a sector graph has an angle of 90°. How many students chose soccer?',
        ['A full circle is 360°, so 90° is 90/360 = ¼ of the circle', '¼ of 72 = 72 ÷ 4 = 18'],
        '<b>Answer:</b> 18 students chose soccer',
        `<div class="diagram">${G.svg(74, 40, `
          <circle cx="20" cy="20" r="16" fill="${C.sand}" opacity="0.45" stroke="${C.charcoal}" stroke-width="0.3"/>
          <path d="M20,20 L20,4 A16,16 0 0 1 36,20 Z" fill="${C.blue}" stroke="${C.charcoal}" stroke-width="0.3"/>
          ${G.text(27, 14, '90°', { size: 3.2, anchor: 'middle', weight: 600, fill: '#fff' })}
          ${G.text(14, 28, '270°', { size: 3, anchor: 'middle' })}
          ${G.text(40, 16, '90° out of 360°', { size: 2.8 })}
          ${G.text(40, 21, '= ¼ of the circle', { size: 2.8, weight: 600 })}
          ${G.text(40, 26, '= ¼ of the students', { size: 2.8 })}`)}</div>`),
        `${q('E1', 'A survey of 240 people has a <b>Tennis</b> sector of 60°. How many chose tennis?')}
         ${q('E2', 'In a survey of 180 people, 45 chose pizza. What angle should the pizza sector be?')}
         ${q('E3', 'One symbol = 8 students. How many students do 3¾ symbols show? How would you show 20 students?')}`)}
      ${L.exitTicket({ graph: g.pets, questions: ['How many students in 7B own a cat?', 'What fraction of the class owns a dog?', 'What % of 7B has no pet? How many of 200 Year 7s would you expect to have no pet?'] })}
    `),

    L.page('Summary', `
      ${L.summary('Reading any graph', ['Read the <b>title</b>: what is the graph about?', 'Check the <b>key</b> or the <b>scale</b>.', 'Use a ruler to line up bars and points with the scale.', 'Answer with the right <b>units</b> (students, °C, %).'], [
        worked(1, 'Level 1', `In a picture graph, ${G.inlineSymbol} = 10 students. A row shows 3½ symbols. How many students is that?`, ['3 full symbols = 3 × 10 = 30', 'Half a symbol = 10 ÷ 2 = 5', '30 + 5 = 35'], '<b>Answer:</b> 35 students',
          `<div class="diagram">${G.pictureGraph({ title: '', rows: [['Row', 3.5]], key: '10 students', w: 70, labelW: 12 })}</div>`),
        worked(2, 'Level 2', 'A sector graph shows 80 people. The <b>Surfing</b> sector is a quarter of the circle. How many chose surfing?', ['A quarter means divide by 4', '80 ÷ 4 = 20'], '<b>Answer:</b> 20 people',
          `<div class="diagram">${G.sectorGraph({ title: '', slices: [['Surfing', 20, C.blue, true], ['Other', 60, C.sand]] })}</div>`),
        worked(3, 'Level 3', 'A divided bar graph shows 45% of 400 students catch the bus. How many students is that?', ['45% means 45 out of every 100', '400 has 4 hundreds, so 45 × 4 = 180'], '<b>Answer:</b> 180 students',
          `<div class="diagram">${G.dividedBar({ title: '', parts: [['Bus 45%', 45, C.blue], ['Car 35%', 35, C.charcoal], ['Walk 20%', 20, C.sand, true]] })}</div>`),
        worked(4, 'Extension', 'A 120° sector shows the results for 90 people. How many people is that?', ['120/360 = ⅓ of the circle', '⅓ of 90 = 90 ÷ 3 = 30'], '<b>Answer:</b> 30 people',
          `<div class="diagram">${G.sectorGraph({ title: '', slices: [['120°', 1, C.blue, true], ['240°', 2, C.sand]] })}</div>`),
      ])}
      ${L.tearBack()}
    `),
  ];

  const answers = [
    ['WE DO examples', ['Ex 1: 4½ symbols = 18 books', 'Ex 2: 20 − 8 = 12 more books', 'Ex 3: ½, so 40 students', 'Ex 4: July (9 °C); June is 19 − 11 = 8 °C colder than March', 'Ex 5: 24% + 28% = 52%; 52% of 5000 = 2600', 'Ex 6: 55%. 20 years ago there was little or no streaming; CDs, radio and downloads were much bigger']],
    ['Set A', ['4 books', '2 books', '12', '8', '14', 'Thursday', 'Wednesday', '2', '12 + 18 = 30', '4 symbols']],
    ['Set B', ['6', '2', 'Swimming', 'Fishing', 'Beach cricket', '3', '8 − 2 = 6', '6 + 2 = 8', '28', '1 student']],
    ['Set C', ['Bus', 'About 20 (a quarter)', 'About 10 (an eighth)', 'True (6)', '80 − 40 = 40', 'January and February, 20 °C', 'Jan and Feb (20 °C), Mar and Dec (19 °C) or May and Sep (12 °C)', 'October', 'October to November (+3 °C)', 'April to May (−4 °C)']],
    ['Set D', ['28%', '18% + 10% = 28%', '18% of 5000 = 900', '7½ symbols', 'e.g. retirees move to the coast; young people leave for work or uni', 'Streaming and radio (55% + 20%)', '20% = ⅕', '10% of 400 = 40', '35% of 400 = 140', 'e.g. even more streaming, fewer CDs, less radio']],
    ['Extension', ['60/360 = ⅙; ⅙ of 240 = 40', '45/180 = ¼; ¼ of 360° = 90°', '3¾ × 8 = 30 students; 20 ÷ 8 = 2½ symbols']],
    ['Exit ticket', ['Level 1: 6', 'Level 2: 9/25', 'Level 3: 5/25 = 20%; 20% of 200 = 40']],
  ];

  return { code: '10.01', title: 'Interpreting graphs', pages, answers };
};
