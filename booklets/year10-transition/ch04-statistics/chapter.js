// Year 10 transition, Chapter 4 Statistics: seven two-page lessons (Easy page, Medium page), easier than the Cambridge
// MATHS GOLD Year 10 Chapter 4 review, with the probability left out. Most questions are about a graph, table or plot;
// each Medium page ends with 2 or 3 word problems. Calculators allowed.
module.exports = require('../chapter')({
  dir: __dirname, number: 4, title: 'Statistics', art: 'gold-triple', fileName: 'Year10-Transition-Ch04-Statistics',
  plan: [['4.1', 'Types of data'], ['4.2', 'Frequency tables'], ['4.3', 'Histograms'], ['4.4', 'Mean, median, mode and range'], ['4.5', 'Stem-and-leaf plots'],
    ['4.6', 'Symmetrical or skewed'], ['4.7', 'Time-series graphs']],
  goals: ['sort data into categorical and numerical, and name each type', 'organise data in frequency tables with class intervals and percentage frequency', 'read and draw histograms',
    'find the mean, median, mode and range', 'read and draw stem-and-leaf plots', 'describe data as symmetrical or skewed', 'read time-series graphs and describe trends'],
});
