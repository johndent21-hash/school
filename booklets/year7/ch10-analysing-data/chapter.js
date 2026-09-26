// Year 7 Chapter 10: Analysing data. One 4-page lesson per exercise in Test Yourself 10.
const lesson = require('../../lib/lesson');
const G = require('../../lib/graphs');
const S = require('../../lib/stats');
const { F } = require('../../lib/calc');

const { C } = G;
const st = (xs) => ({ mean: S.fmt(S.mean(xs)), median: S.fmt(S.median(xs)), mode: S.modeText(xs), range: S.fmt(S.range(xs)) });
const list = (xs) => xs.join(', ');
const dpT = (o) => `<div class="template-card">${G.dotPlotTemplate({ w: 88, h: 20, ...o })}</div>`;

// ---- data and graphs used in the lessons ----
const holiday = G.sectorGraph({ title: 'Favourite holiday destinations (80 people)', slices: [['Gold Coast', 30, C.blue, true], ['Uluru', 17, C.charcoal, true], ['Snowy Mtns', 15, C.sand], ['Kangaroo Is.', 10, C.lightBlue], ['Phillip Is.', 8, C.grey, true]] });
const dubboT = [18, 18, 15, 11, 7, 5, 3, 4, 7, 10, 13, 16];
const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const dubbo = G.lineGraph({ title: 'Mean minimum temperature, Dubbo', xs: months, ys: dubboT, max: 20, step: 1, labelEvery: 5, yTitle: 'Temperature (°C)', xTitle: 'Month' });
const religion = G.columnGraph({ title: 'Religion of Australians', cats: ['Catholic', 'Anglican', 'Other\nChristian', 'No\nreligion', 'Buddhist', 'Muslim', 'Other'], values: [22, 13, 16, 30, 3, 3, 5], max: 30, step: 5, labelEvery: 5, yTitle: 'Percentage', h: 52 });
const ages = G.pictureGraph({ title: 'Age of Australia’s population', rows: [['0–14', 6], ['15–24', 4], ['25–44', 9], ['45–64', 8], ['65+', 5.5]], key: '3% of population', labelW: 14 });
const profitYs = [2.2, 2.5, 2.9, 3.3, 3.6, 4.0];
const profit = G.lineGraph({ title: 'Company profits', xs: ['2014', '2015', '2016', '2017', '2018', '2019'], ys: profitYs, yMin: 2, max: 4, step: 0.5, labelEvery: 0.5, yTitle: 'Profit ($ millions)', xTitle: 'Year' });
const sales = G.columnGraph({ title: 'Ice-cream sales', cats: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], values: [52, 54, 51, 56, 58], yMin: 50, max: 60, step: 2, labelEvery: 2, yTitle: 'Sales', w: 70, h: 46 });
const bega = { 15: 1, 19: 1, 20: 2, 21: 3, 22: 4, 23: 5, 24: 4, 25: 4, 26: 3, 27: 2, 28: 1 };
const begaXs = S.expand(bega);
const begaPlot = G.dotPlot({ title: 'Maximum temperatures at Bega in April', min: 15, max: 28, counts: bega, xTitle: 'Temperature (°C)' });
const goals = { 0: 3, 1: 5, 2: 4, 3: 2, 4: 1, 7: 1 };
const goalsXs = S.expand(goals);
const goalPlot = G.dotPlot({ title: 'Goals scored per game', min: 0, max: 7, counts: goals, xTitle: 'Goals' });
const massRaw = [[7, [9, 5, 8, 1, 6, 9, 4]], [8, [2, 5, 0, 0, 8, 0, 3, 2, 4]], [9, [0, 8, 4, 2, 2, 0]], [10, [5, 6, 4]]];
const massXs = S.fromStemLeaf(massRaw);
const massPlot = G.stemLeaf({ title: 'Masses of football players (kg), unordered', rows: massRaw, key: '7 | 9 = 79 kg' });
const slRows = [[4, [5]], [5, [0, 0, 1, 2]], [6, [1, 3, 4, 6, 6, 6, 7, 8]], [7, [4, 5]]];
const slXs = S.fromStemLeaf(slRows);
const slPlot = G.stemLeaf({ title: 'Test scores', rows: slRows, key: '5 | 2 = 52' });
const d1 = [4, 3, 2, 5, 6, 4, 4], d2 = [6, 12, 11, 12, 10, 6, 6, 10, 6], d3 = [8, 4, 1, 1, 4, 1, 3, 6];
const girls = [75, 28, 37, 35, 60, 73, 69, 52, 94, 66, 55, 39, 48, 51, 53, 18, 29, 76, 59, 83];
const boys = [88, 29, 38, 72, 50, 74, 73, 30, 85, 10, 28, 93, 66, 17, 75, 40, 55, 62, 73, 58];
const b2bRows = (L, R, stems) => stems.map((s) => [S.sorted(L).filter((x) => Math.floor(x / 10) === s).map((x) => x % 10).reverse(), s, S.sorted(R).filter((x) => Math.floor(x / 10) === s).map((x) => x % 10)]);
const b2b = G.backToBack({ left: 'Girls', right: 'Boys', rows: b2bRows(girls, boys, [1, 2, 3, 4, 5, 6, 7, 8, 9]), key: '3 | 5 = 35' });
const slTxt = (xs, stems) => S.toStemLeaf(xs, stems).map(([s, l]) => `${s} | ${l.join(' ')}`).join('; ');
const sGirls = st(girls), sBoys = st(boys);

module.exports = {
  year: 7, stage: 4, number: 10, title: 'Analysing data', accent: '#00838f',
  fileName: 'Year7-Ch10-Analysing-Data',
  goals: ['interpret picture, column, sector and line graphs', 'identify misleading graphs', 'read and draw dot plots and stem-and-leaf plots', 'find the mean, mode, median and range', 'analyse data shown in plots', 'compare two sets of data'],
  syllabus: 'NSW Mathematics K–10 Syllabus (2022), Stage 4 Statistics: MA4-DAT-C-01 classifies and displays data using a variety of graphical representations; MA4-DAT-C-02 analyses simple datasets using measures of centre, range and shape of the data.',
  lessons: [
    lesson({
      code: '10.01', title: 'Interpreting graphs',
      li: ['read and interpret picture, sector, column and line graphs'],
      sc: ['read the title, axes, key and scale first', 'read values from a graph', 'answer questions and explain trends'],
      terms: ['Key', 'Scale', 'Sector graph'],
      we: ['Set A graph: what is the most popular destination?', 'Set A graph: which destination did 17 people prefer?', 'Set B graph: which age group has the smallest percentage?', 'Set B graph: what percentage are aged 15–24?', 'Set C graph: which months have the highest mean minimum? What is it?', 'Set D graph: why might this graph have been different 20 years ago?'],
      a: { text: 'Use the sector graph.', kind: 'short', figSide: true, fig: holiday, items: ['Most popular destination?', 'Which did 17 people prefer?', 'Estimate how many chose the Gold Coast.', 'True or false: fewer than 10 chose Phillip Island.'] },
      b: { text: 'Use the picture graph.', kind: 'short', figSide: true, fig: ages, items: ['Smallest age group?', 'Percentage aged 15–24?', 'Percentage aged 65+?', 'Why might 25–44 be the largest group?'] },
      c: { text: 'Use the line graph.', kind: 'short', figSide: true, fig: dubbo, items: ['Highest months and temperature?', 'Two months with the same temperature?', 'Which month has 10°C?', 'Coldest month?', 'Between which 2 months is the smallest drop?', 'Describe the trend from January to July.'] },
      d: { text: 'Use the column graph.', kind: 'short', figSide: true, fig: religion, items: ['What percentage are Catholic?', 'Which religion is followed by 13%?', 'What is the most common response?', 'How might this graph have been different 20 years ago?'] },
      ext: { q: 'In the sector graph, what angle is the Gold Coast sector?', steps: ['Gold Coast is 30 out of 80 people', `${F(30, 80)} × 360°`], a: '135°', qs: ['Find the angle of the Uluru sector (1 d.p.).', 'Draw a divided bar graph 16 cm long for the holiday data. How long is each part?'] },
      summary: { steps: ['Read the title, labels and key.', 'Check the scale on each axis.', 'Read values carefully with a ruler.', 'Describe trends: increasing, decreasing, highest, lowest.'],
        worked: [['Most popular (sector)', ['Largest sector'], 'Gold Coast'], ['15–24 (picture graph)', ['4 symbols × 3%'], '12%'], ['Highest mean minimum', ['Highest points'], 'Jan and Feb, 18°C'], ['Gold Coast angle', ['30/80 × 360'], '135°']] },
      exit: { qs: ['In the sector graph, which destination was least popular?', 'In the line graph, what is the mean minimum in April?', 'In the column graph, how many more % have no religion than are Catholic?'] },
      ans: { we: ['Gold Coast', 'Uluru', '15–24 years', '12%', 'Jan and Feb, 18°C', 'e.g. fewer people chose “no religion”'], a: ['Gold Coast', 'Uluru', '30', 'true (8)'], b: ['15–24 years', '12%', '16.5%', 'e.g. working-age adults and migrants'],
        c: ['Jan and Feb, 18°C', 'e.g. Jan and Feb (or May and Sep)', 'October', 'July (3°C)', 'May–June or June–July (2°C)', 'it falls steadily to a low in July'], d: ['22%', 'Anglican', 'No religion', 'e.g. more Christians and fewer “no religion”'],
        ext: [`${(17 / 80 * 360).toFixed(1)}°`, 'Gold Coast 6 cm, Uluru 3.4 cm, Snowy 3 cm, Kangaroo Is. 2 cm, Phillip Is. 1.6 cm'], exit: ['Phillip Island', '11°C', '8%'] },
    }),

    lesson({
      code: '10.02', title: 'Misleading graphs',
      li: ['identify features that make a graph misleading'],
      sc: ['check whether the vertical axis starts at zero', 'check the scale is even and the graph has labels', 'redraw a misleading graph correctly'],
      terms: ['Misleading', 'Broken axis'],
      we: ['Set A graph: what is incorrect about it?', 'Set A graph: what misleading impression does it give?', 'Set B graph: Thursday sales look double Wednesday’s. Is that true?', 'Set B graph: what are the actual sales on Wednesday and Thursday?', 'Name 3 other ways a graph can mislead.', 'Why would a company want a misleading graph?'],
      a: { text: 'Use the line graph.', kind: 'short', figSide: true, fig: profit, items: ['What is incorrect about the graph?', 'What impression does it give?', 'What was the profit in 2014?', 'By how much did profit grow from 2014 to 2019?'] },
      b: { text: 'Use the column graph.', kind: 'short', figSide: true, fig: sales, items: ['Where does the vertical axis start?', 'Wednesday’s sales?', 'Friday’s sales?', 'Does Friday have double Wednesday’s sales?'] },
      c: { text: 'Redraw the company profits graph correctly, starting the axis at 0.', kind: 'work', items: [{ t: 'Profits 2014–2019: 2.2, 2.5, 2.9, 3.3, 3.6, 4.0 ($ millions)', draw: G.gridPaper('Redraw here') }] },
      d: { text: 'Think it through.', kind: 'work', items: ['A graph uses pictures of bags of money; the 2019 bag is twice as tall and twice as wide as the 2014 bag. Why is this misleading?', 'A graph has no title and no labels on the axes. Why is this a problem?', 'A column graph has a scale 0, 10, 20, 50, 100. What is wrong?', 'Find a graph in a newspaper or online. Is it misleading? How?'] },
      ext: { q: 'Profit grew from $2.2 million to $4.0 million. By what percentage did it grow?', steps: ['Increase = 1.8 million', `${F('1.8', '2.2')} × 100%`], a: '≈ 81.8%', qs: ['On the misleading graph, the 2019 point looks about 8 times higher than 2014. Explain why.', 'Draw a graph of the same data that makes growth look very small.'] },
      summary: { steps: ['Check the vertical axis starts at 0 (or shows a break).', 'Check the scale goes up in equal steps.', 'Check there is a title and labelled axes.', 'Watch for pictures that change in 2 directions.'],
        worked: [['Profit graph', ['Axis starts at 2'], 'growth looks bigger'], ['Sales Wed vs Thu', ['51 vs 56'], 'not double'], ['Uneven scale 0, 10, 20, 50', ['Steps not equal'], 'misleading'], ['Growth %', ['1.8 ÷ 2.2'], '≈ 81.8%']] },
      exit: { qs: ['Give one reason a graph might be misleading.', 'A column graph’s axis starts at 90. Why is that a problem?', 'How should the company profits graph be fixed?'] },
      ans: { we: ['the vertical axis starts at $2 million, not 0', 'profits grew much faster than they did', 'no', '51 and 56', 'uneven scale, pictures, no labels, missing data', 'to impress investors'], a: ['axis does not start at 0', 'huge growth', '$2.2 million', '$1.8 million'], b: ['50', '51', '58', 'no'],
        c: ['line graph from 0 to 4 with even scale'], d: ['the area is 4 times bigger, not 2', 'you do not know what is shown', 'the steps are not equal', 'own answer'], ext: ['the axis starts at 2, so heights above 2 are compared (0.2 vs 2.0)', 'e.g. axis from 0 to 20'], exit: ['e.g. the axis does not start at 0', 'small differences look huge', 'start the vertical axis at 0 with an even scale'] },
    }),

    lesson({
      code: '10.03', title: 'Dot plots',
      li: ['read and draw dot plots'],
      sc: ['read the frequency of each value', 'find the mode and any outlier', 'draw a dot plot from data'],
      terms: ['Dot plot', 'Outlier', 'Mode'],
      we: ['Set A plot: what is the mode?', 'Set A plot: what is the outlier?', 'Set A plot: on how many days was it 25°C?', 'Set A plot: on what fraction of days was it below 20°C?', { t: 'Draw a dot plot: 2, 3, 3, 4, 4, 4, 5, 6, 6, 9', draw: dpT({ min: 0, max: 10 }) }, 'Describe the shape of the Set A plot.'],
      a: { text: 'Use the dot plot.', kind: 'short', figSide: true, fig: begaPlot, items: ['Mode?', 'Outlier?', 'Days at 25°C?', 'Fraction of days below 20°C?'] },
      b: { text: 'Use the dot plot.', kind: 'short', figSide: true, fig: goalPlot, items: ['How many games?', 'Mode?', 'Outlier?', 'How many games had 2 or more goals?'] },
      c: { text: 'Draw a dot plot for each set of data.', kind: 'work', items: [{ t: 'Number of pets: 0, 1, 1, 2, 0, 3, 1, 2, 1, 0, 4, 1', draw: dpT({ min: 0, max: 5 }) }, { t: 'Shoe sizes: 7, 8, 8, 9, 7, 10, 8, 9, 8, 6, 8, 9', draw: dpT({ min: 5, max: 11 }) }] },
      d: { text: 'Draw and analyse.', kind: 'work', items: [{ t: 'Minutes late: 0, 2, 1, 0, 3, 0, 15, 1, 2, 0, 1, 0. Draw a dot plot.', draw: dpT({ min: 0, max: 16, labels: true }) }, 'For Question 1, find the mode and the outlier. How does the outlier affect the data?'] },
      ext: { q: 'What percentage of April days at Bega were 25°C or more?', steps: ['Count: 25 (4) + 26 (3) + 27 (2) + 28 (1) = 10', `${F(10, 30)} × 100%`], a: '33.3%', qs: ['What percentage of games had no goals? (Set B)', 'Add a game with 3 goals to Set B. What is the new mode?'] },
      summary: { steps: ['Each dot is one piece of data.', 'Mode: the tallest column.', 'Outlier: far away from the rest.', 'Draw: a number line with an even scale, one dot per value.'],
        worked: [['Mode of Bega plot', ['Tallest column'], `${S.modeText(begaXs)}°C`], ['Outlier', ['Far from the rest'], '15°C'], ['Below 20°C', ['2 days out of 30'], F(1, 15)], ['25°C or more', ['10 of 30 days'], '33.3%']] },
      exit: { qs: ['What is a dot plot?', 'In Set B, what is the mode?', 'Draw a dot plot for 1, 2, 2, 3, 3, 3, 8. Which value is the outlier?'] },
      ans: { we: [`${S.modeText(begaXs)}°C`, '15°C', '4', F(1, 15), 'dot plot', 'most days between 20°C and 26°C, peak at 23°C'], a: [`${S.modeText(begaXs)}°C`, '15°C', '4', F(1, 15)], b: [String(goalsXs.length), S.modeText(goalsXs), '7', String(goalsXs.filter((x) => x >= 2).length)],
        c: ['dot plot', 'dot plot'], d: ['dot plot', 'mode 0, outlier 15; it makes the mean bigger'], ext: [`${(goals[0] / goalsXs.length * 100).toFixed(1)}%`, `still ${S.modeText([...goalsXs, 3])}`], exit: ['a graph with one dot for each value on a number line', S.modeText(goalsXs), '8'] },
    }),

    lesson({
      code: '10.04', title: 'Stem-and-leaf plots',
      li: ['read and draw ordered stem-and-leaf plots'],
      sc: ['read values from a stem-and-leaf plot using the key', 'order the leaves in each row', 'draw a stem-and-leaf plot from data'],
      terms: ['Stem', 'Leaf', 'Key'],
      we: ['Set A plot: how many players are there?', 'Set A plot: what is the lowest mass?', 'Set A plot: which mass occurs most often?', 'Set A plot: what is the highest mass?', { t: 'Draw an ordered stem-and-leaf plot for Set A.', draw: G.stemLeafTemplate({ stems: [7, 8, 9, 10] }) }, 'Why do we order the leaves?'],
      a: { text: 'Use the stem-and-leaf plot.', kind: 'short', figSide: true, fig: massPlot, items: ['How many players?', 'Lowest mass?', 'Most common mass?', 'Highest mass?'] },
      b: { text: 'Use the stem-and-leaf plot.', kind: 'short', figSide: true, fig: slPlot, items: ['How many scores?', 'Lowest score?', 'Highest score?', 'Mode?'] },
      c: { text: 'Draw an ordered stem-and-leaf plot.', kind: 'work', items: [{ t: '23, 35, 41, 28, 32, 45, 39, 27, 30, 44, 36, 21', draw: G.stemLeafTemplate({ stems: [2, 3, 4] }) }, { t: '67, 82, 75, 91, 78, 64, 88, 70, 73, 85, 79, 68', draw: G.stemLeafTemplate({ stems: [6, 7, 8, 9] }) }] },
      d: { text: 'Draw and analyse.', kind: 'work', items: [{ t: 'Order the Set A plot (masses of players).', draw: G.stemLeafTemplate({ stems: [7, 8, 9, 10] }) }, 'For the ordered plot, how many players weigh 90 kg or more? What fraction is that?'] },
      ext: { q: 'Write the data 3.4, 3.7, 4.1, 4.5, 4.5, 5.0, 5.2 as a stem-and-leaf plot.', steps: ['Stems are the whole numbers, leaves the tenths', 'Key: 3 | 4 = 3.4'], a: '3 | 4 7; 4 | 1 5 5; 5 | 0 2', qs: ['Draw a stem-and-leaf plot for 105, 112, 118, 121, 125, 130 (stems 10, 11, 12, 13).', 'What would a key of 2 | 5 = 0.25 mean?'] },
      summary: { steps: ['The stem is the tens digit; the leaf is the ones digit.', 'Always include a key, e.g. 7 | 9 = 79.', 'Order the leaves from smallest to largest.', 'Line the leaves up in columns so the plot shows the shape.'],
        worked: [['Players', ['Count the leaves'], String(massXs.length)], ['Lowest mass', ['First leaf of first stem'], `${Math.min(...massXs)} kg`], ['Ordered plot', ['Sort each row'], slTxt(massXs, [7, 8, 9, 10])], ['Decimals', ['Stem = whole number'], '3 | 4 7; 4 | 1 5 5; 5 | 0 2']] },
      exit: { qs: ['In the key 6 | 3 = 63, what is the stem?', 'Write the values in the row 4 | 0 2 7.', 'Draw an ordered stem-and-leaf plot for 12, 25, 17, 21, 14, 29.'] },
      ans: { we: [String(massXs.length), `${Math.min(...massXs)} kg`, `${S.modeText(massXs)} kg`, `${Math.max(...massXs)} kg`, slTxt(massXs, [7, 8, 9, 10]), 'to see the shape and find the median and mode easily'],
        a: [String(massXs.length), `${Math.min(...massXs)} kg`, `${S.modeText(massXs)} kg`, `${Math.max(...massXs)} kg`], b: [String(slXs.length), String(Math.min(...slXs)), String(Math.max(...slXs)), S.modeText(slXs)],
        c: [slTxt([23, 35, 41, 28, 32, 45, 39, 27, 30, 44, 36, 21], [2, 3, 4]), slTxt([67, 82, 75, 91, 78, 64, 88, 70, 73, 85, 79, 68], [6, 7, 8, 9])], d: [slTxt(massXs, [7, 8, 9, 10]), `${massXs.filter((x) => x >= 90).length} players, ${massXs.filter((x) => x >= 90).length}/${massXs.length}`],
        ext: ['10 | 5; 11 | 2 8; 12 | 1 5; 13 | 0', '25 hundredths (0.25)'], exit: ['6', '40, 42, 47', '1 | 2 4 7; 2 | 1 5 9'] },
    }),

    lesson({
      code: '10.05', title: 'Mean and mode',
      li: ['find the mean and mode of a set of data'],
      sc: ['find the mean: add the values, divide by how many', 'find the mode: the most common value', 'round the mean to 2 decimal places'],
      terms: ['Mean', 'Mode'],
      we: [`Find the mean of ${list(d1)}.`, `Find the mode of ${list(d1)}.`, `Find the mean of ${list(d2)}.`, `Find the mode of ${list(d2)}.`, `Find the mean and mode of ${list(d3)}.`, 'The mean of 4 numbers is 7. Three are 5, 8 and 9. Find the fourth.'],
      a: { text: 'Find the mode.', kind: 'short', items: [list(d1), list(d2), list(d3), '3, 7, 7, 2, 9, 3, 7', '10, 12, 15, 12, 10, 12', 'red, blue, red, green, blue, red'] },
      b: { text: 'Find the mean.', kind: 'short', items: ['2, 4, 6, 8', list(d1), '10, 20, 30, 40, 50', '5, 5, 5, 5', '1, 2, 3, 4, 5, 6', '7, 9, 11'] },
      c: { text: 'Find the mean (2 d.p.) and mode.', kind: 'work', cols: 3, items: [list(d2), list(d3), '12, 15, 11, 15, 17, 14', '3.5, 4.2, 3.5, 5.1', '45, 52, 38, 52, 61, 49, 52', '0, 0, 1, 2, 2, 2, 3, 5'] },
      d: { text: 'Problems.', kind: 'work', items: ['The mean of 4 numbers is 7. Three are 5, 8 and 9. Find the fourth.', 'Sam’s test marks are 72, 85, 68 and 91. What must he score on the next test for a mean of 80?', 'Write 5 numbers with a mean of 10 and a mode of 8.', 'Can a data set have more than one mode? Give an example.'] },
      ext: { q: 'A class of 25 has a mean mark of 64. A new student scores 90. Find the new mean.', steps: ['Total = 25 × 64 = 1600', 'New total 1690, 26 students', '1690 ÷ 26'], a: '65', qs: ['The mean of 6 numbers is 12. One number, 20, is removed. Find the new mean.', 'Explain why the mean does not have to be one of the data values.'] },
      summary: { steps: ['Mean = sum of values ÷ number of values.', 'Mode = the value that occurs most often.', 'There can be more than one mode, or none.', 'Round the mean to 2 decimal places.'],
        worked: [[list(d1), [`sum ${S.sum(d1)}, ${d1.length} values`], `mean ${S.fmt(S.mean(d1))}`], [list(d1), ['4 occurs 3 times'], 'mode 4'], [list(d3), [`sum ${S.sum(d3)} ÷ ${d3.length}`], `mean ${S.fmt(S.mean(d3))}, mode ${S.modeText(d3)}`], ['New student', ['1690 ÷ 26'], '65']] },
      exit: { qs: ['Find the mode: 5, 8, 5, 3, 5, 8.', 'Find the mean: 4, 6, 8, 10, 12.', 'Find the mean (2 d.p.): 3, 7, 7, 9.'] },
      ans: { we: [S.fmt(S.mean(d1)), S.modeText(d1), S.fmt(S.mean(d2)), S.modeText(d2), `${S.fmt(S.mean(d3))}; ${S.modeText(d3)}`, '6'], a: [S.modeText(d1), S.modeText(d2), S.modeText(d3), '7', '12', 'red'], b: ['5', S.fmt(S.mean(d1)), '30', '5', '3.5', '9'],
        c: [d2, d3, [12, 15, 11, 15, 17, 14], [3.5, 4.2, 3.5, 5.1], [45, 52, 38, 52, 61, 49, 52], [0, 0, 1, 2, 2, 2, 3, 5]].map((xs) => `${S.fmt(S.mean(xs))}; ${S.modeText(xs)}`), d: ['6', '84', 'e.g. 8, 8, 10, 11, 13', 'yes, e.g. 1, 1, 2, 2 (modes 1 and 2)'], ext: ['10.4', 'it is a balance point, e.g. mean of 1 and 2 is 1.5'], exit: ['5', '8', '6.5'] },
    }),

    lesson({
      code: '10.06', title: 'Median and range',
      li: ['find the median and range of a set of data'],
      sc: ['order the data before finding the median', 'find the middle value, or the mean of the two middle values', 'find the range: highest − lowest'],
      terms: ['Median', 'Range'],
      we: [`Find the median of ${list(d1)}.`, `Find the range of ${list(d1)}.`, `Find the median of ${list(d2)}.`, `Find the range of ${list(d2)}.`, `Find the median and range of ${list(d3)}.`, 'Which is affected more by an outlier: the median or the mean?'],
      a: { text: 'Find the range.', kind: 'short', items: [list(d1), list(d2), list(d3), '15, 3, 22, 9', '104, 97, 110, 99', '−3, 5, 2, −1'] },
      b: { text: 'Find the median.', kind: 'short', items: ['3, 5, 8, 9, 12', list(d1), '2, 4, 6, 8', '10, 7, 3, 9, 1', '4, 4, 5, 7, 9, 10', '20, 15, 30, 25'] },
      c: { text: 'Find the median and range.', kind: 'work', cols: 3, items: [list(d2), list(d3), '12, 15, 11, 15, 17, 14', '3.5, 4.2, 3.5, 5.1', '45, 52, 38, 52, 61, 49, 52', '100, 2, 3, 4, 5'] },
      d: { text: 'Problems.', kind: 'work', items: ['Find the mean, median, mode and range of 2, 3, 3, 4, 5, 25.', 'Which measure (mean or median) best describes the data in Question 1? Why?', 'Write 5 numbers with median 6 and range 10.', 'The range of a set is 12 and the lowest value is 45. What is the highest?'] },
      ext: { q: 'Five numbers have mean 6, median 5, mode 3 and range 8. Find them.', steps: ['Mode 3 and median 5: 3, 3, 5, ?, ?', 'Sum = 30, so the last two add to 19', 'Range 8: largest = 3 + 8 = 11, so the other is 8'], a: '3, 3, 5, 8, 11', qs: ['Four numbers have median 7, mode 9 and range 6. Find them (hint: 9 appears twice).', 'Why might a company report the median salary instead of the mean?'] },
      summary: { steps: ['Order the data first.', 'Median = the middle value.', 'Even number of values: median = mean of the middle two.', 'Range = highest − lowest.'],
        worked: [[list(d1), [`Ordered: ${list(S.sorted(d1))}`], `median ${S.fmt(S.median(d1))}`], [list(d2), [`Ordered: ${list(S.sorted(d2))}`], `median ${S.fmt(S.median(d2))}`], [list(d3), ['8 − 1'], `range ${S.range(d3)}`], ['mean 6, median 5, mode 3, range 8', ['Build the list'], '3, 3, 5, 8, 11']] },
      exit: { qs: ['Find the median: 6, 2, 9, 4, 7.', 'Find the range: 18, 5, 12, 30.', 'Find the median: 3, 8, 10, 11.'] },
      ans: { we: [S.fmt(S.median(d1)), String(S.range(d1)), S.fmt(S.median(d2)), String(S.range(d2)), `${S.fmt(S.median(d3))}; ${S.range(d3)}`, 'the mean'], a: [d1, d2, d3, [15, 3, 22, 9], [104, 97, 110, 99], [-3, 5, 2, -1]].map((xs) => String(S.range(xs))), b: [[3, 5, 8, 9, 12], d1, [2, 4, 6, 8], [10, 7, 3, 9, 1], [4, 4, 5, 7, 9, 10], [20, 15, 30, 25]].map((xs) => S.fmt(S.median(xs))),
        c: [d2, d3, [12, 15, 11, 15, 17, 14], [3.5, 4.2, 3.5, 5.1], [45, 52, 38, 52, 61, 49, 52], [100, 2, 3, 4, 5]].map((xs) => `${S.fmt(S.median(xs))}; ${S.fmt(S.range(xs))}`), d: [S.summary([2, 3, 3, 4, 5, 25]), 'the median: the outlier 25 pulls the mean up', 'e.g. 1, 4, 6, 8, 11', '57'], ext: ['3, 5, 9, 9', 'a few very high salaries make the mean misleading'], exit: ['6', '25', '9'] },
    }),

    lesson({
      code: '10.07', title: 'Analysing dot plots and stem-and-leaf plots',
      li: ['find the range, median, mode and mean from a dot plot or stem-and-leaf plot'],
      sc: ['list or count the data values from the plot', 'use the order of the plot to find the median', 'calculate the mean and range'],
      terms: ['Frequency', 'Cluster'],
      we: ['Set A dot plot: find the range.', 'Set A dot plot: find the median.', 'Set B stem-and-leaf: find the mode.', 'Set B stem-and-leaf: find the median.', 'Set B: find the mean (2 d.p.).', 'Describe where the data in Set B clusters.'],
      a: { text: 'Use the dot plot.', kind: 'short', figSide: true, fig: goalPlot, items: ['Range', 'Median', 'Mode', 'Mean (2 d.p.)'] },
      b: { text: 'Use the stem-and-leaf plot.', kind: 'short', figSide: true, fig: slPlot, items: ['Range', 'Median', 'Mode', 'Mean (2 d.p.)'] },
      c: { text: 'Use the dot plot of Bega temperatures.', kind: 'short', figSide: true, fig: begaPlot, items: ['Range', 'Median', 'Mode', 'Mean (2 d.p.)', 'Mean without the outlier (2 d.p.)', 'Which measure changed most when the outlier was removed?'] },
      d: { text: 'Use the stem-and-leaf plot of player masses (ordered).', kind: 'short', figSide: true, fig: G.stemLeaf({ title: 'Masses of players (kg)', rows: S.toStemLeaf(massXs, [7, 8, 9, 10]), key: '7 | 9 = 79 kg' }), items: ['Range', 'Median', 'Mode', 'Mean (2 d.p.)'] },
      ext: { q: 'One more player of mass 120 kg joins the team. How do the mean and median change?', steps: [`Old mean ${S.fmt(S.mean(massXs))}, median ${S.fmt(S.median(massXs))}`, `New mean ${S.fmt(S.mean([...massXs, 120]))}, median ${S.fmt(S.median([...massXs, 120]))}`], a: 'the mean rises more than the median', qs: ['Which measure would you use to describe the typical player’s mass? Why?', 'Remove the 7-goal game from the dot plot. Find the new mean.'] },
      summary: { steps: ['Count the values (n).', 'Range: highest − lowest.', 'Median: the value in position (n + 1) ÷ 2.', 'Mean: add all values (count dots × values) ÷ n.'],
        worked: [['Goals: range', ['7 − 0'], '7'], ['Goals: median', [`n = ${goalsXs.length}`], S.fmt(S.median(goalsXs))], ['Scores: mean', [`sum ${S.sum(slXs)} ÷ ${slXs.length}`], S.fmt(S.mean(slXs))], ['Add a 120 kg player', ['Mean moves more'], 'mean up more']] },
      exit: { qs: ['A dot plot has dots at 1, 2, 2, 3, 3, 3. Find the mode.', 'Find the median of 5 | 1 3 4 7 (key 5 | 1 = 51).', 'Find the range of 2 | 3 8, 3 | 0 5, 4 | 1 (key 2 | 3 = 23).'] },
      ans: { we: [String(S.range(goalsXs)), S.fmt(S.median(goalsXs)), S.modeText(slXs), S.fmt(S.median(slXs)), S.fmt(S.mean(slXs)), 'mostly in the 60s'], a: [String(S.range(goalsXs)), S.fmt(S.median(goalsXs)), S.modeText(goalsXs), S.fmt(S.mean(goalsXs))], b: [String(S.range(slXs)), S.fmt(S.median(slXs)), S.modeText(slXs), S.fmt(S.mean(slXs))],
        c: [String(S.range(begaXs)), S.fmt(S.median(begaXs)), S.modeText(begaXs), S.fmt(S.mean(begaXs)), S.fmt(S.mean(begaXs.filter((x) => x !== 15))), 'the range'], d: [String(S.range(massXs)), S.fmt(S.median(massXs)), S.modeText(massXs), S.fmt(S.mean(massXs))],
        ext: ['the median: it is not affected by extreme values', S.fmt(S.mean(goalsXs.filter((x) => x !== 7)))], exit: ['3', '53.5', '18'] },
    }),

    lesson({
      code: '10.08', title: 'Comparing data',
      li: ['compare two sets of data using plots and statistics'],
      sc: ['draw a back-to-back stem-and-leaf plot', 'find the mean, median, mode and range for each group', 'compare the groups and decide which is more consistent'],
      terms: ['Back-to-back', 'Consistent'],
      we: ['What does the Set A plot show?', 'What was the highest mark? Who scored it?', 'Find the median mark for the girls.', 'Find the range for the boys.', 'Compare the girls and the boys.', 'Which group is more consistent? Why?'],
      a: { text: 'Use the back-to-back plot of assignment marks.', kind: 'short', figSide: true, fig: b2b, items: ['Highest mark? Boy or girl?', 'Lowest mark? Boy or girl?', 'How many students scored in the 70s?', 'How many girls scored 50 or more?'] },
      b: { text: 'Find each statistic.', kind: 'short', items: ['Girls: mean', 'Girls: median', 'Girls: range', 'Boys: mean', 'Boys: median', 'Boys: range'] },
      c: { text: 'Draw a back-to-back stem-and-leaf plot.', kind: 'work', items: [{ t: 'Class A: 45, 52, 58, 61, 63, 67, 70, 74. Class B: 38, 49, 55, 56, 60, 72, 81, 88.', draw: G.backToBackTemplate({ left: 'Class A', right: 'Class B', stems: [3, 4, 5, 6, 7, 8] }) }, 'For Question 1, which class did better? Use the median and range.'] },
      d: { text: 'Compare and explain.', kind: 'work', items: ['Comment on the differences between the girls and the boys on the assignment.', 'Which group was more consistent? Give reasons.', 'Which measure (mean or median) would you use to compare these groups? Why?', 'Write 2 questions you could investigate by comparing two groups at school.'] },
      ext: { q: 'Two basketballers’ points in 5 games: Ana 12, 15, 14, 13, 16; Bo 5, 25, 8, 22, 10. Who is more consistent?', steps: ['Both have mean 14', 'Ana range 4; Bo range 20'], a: 'Ana (smaller range)', qs: ['Who would you pick for a game where you need at least 12 points? Why?', 'Make up two data sets with the same mean but very different ranges.'] },
      summary: { steps: ['Put the two groups on the two sides of the stems.', 'Leaves get larger moving away from the stem.', 'Compare centre: mean or median.', 'Compare spread: a smaller range means more consistent.'],
        worked: [['Highest mark', ['Largest leaf'], '94, a girl'], ['Girls median', ['Mean of the 10th and 11th'], sGirls.median], ['Boys range', [`${Math.max(...boys)} − ${Math.min(...boys)}`], sBoys.range], ['Ana vs Bo', ['Same mean, compare range'], 'Ana']] },
      exit: { qs: ['What is a back-to-back stem-and-leaf plot used for?', 'Group A range 12, group B range 30. Which is more consistent?', 'Group A median 65, group B median 58. Which did better?'] },
      ans: { we: ['the marks of the girls (left) and boys (right)', '94, a girl', sGirls.median, sBoys.range, `girls: mean ${sGirls.mean}, median ${sGirls.median}; boys: mean ${sBoys.mean}, median ${sBoys.median}`, `girls: range ${sGirls.range} vs boys ${sBoys.range}`],
        a: ['94, girl', '10, boy', String([...girls, ...boys].filter((x) => x >= 70 && x < 80).length), String(girls.filter((x) => x >= 50).length)], b: [sGirls.mean, sGirls.median, sGirls.range, sBoys.mean, sBoys.median, sBoys.range],
        c: ['Class A: 5 | 8 2, 4 | 5 …; Class B on the right', 'Class A: higher median, smaller range'], d: [`boys have a slightly higher median (${sBoys.median} vs ${sGirls.median}) but a larger range`, `girls: smaller range (${sGirls.range} vs ${sBoys.range})`, 'median, as there are some very low marks', 'own questions'], ext: ['Ana: she scores 12 or more every game', 'e.g. 5, 5, 5 and 0, 5, 10'], exit: ['comparing two groups', 'A', 'A'] },
    }),
  ],
};
