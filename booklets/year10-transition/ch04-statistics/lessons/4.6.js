// Lesson 4.6 Symmetrical or skewed (two pages: Easy, then Medium). See lib/lesson-two.js for the fields.
// Easy: name the shape of histograms and dot plots: symmetrical, positively skewed (tail to the right) or negatively
// skewed (tail to the left). Medium: describe a distribution (its shape, any outlier, where most values lie) and compare
// the mean with the median; the page ends with word problems. Every question is a small graph on a card.
// From the Chapter 4 review: the 16 TV-watching values (short-answer 6c: symmetrical or skewed?), the Medium WE DO.
const { fmt, problems, histogram, dotPlot, classes, tally, sum } = require('../helpers');

// ---------- graphs ----------
// A small histogram for its shape only (no class labels): values are the column heights.
// Only the bottom and top gridlines are numbered: the shape is what matters.
const shapeH = (v) => { const max = Math.max(...v) + 1; return histogram({ classes: v.map(() => ''), values: v, max, step: max, labelEvery: max, yTitle: '', w: 40, h: 22 }); };
// A small dot plot from counts { value: how many }.
// Wide ranges are numbered every 2, so the numbers do not crowd.
const shapeD = (counts) => { const ks = Object.keys(counts).map(Number), lo = Math.min(...ks), hi = Math.max(...ks), step = hi - lo > 8 ? 2 : 1; return dotPlot({ min: lo - ((hi - lo) % step), max: hi, step, counts, w: 40, dotR: 1.1 }); };
const SYM = 'symmetrical', POS = 'positively skewed', NEG = 'negatively skewed';

// ---------- statistics ----------
const sorted = (xs) => [...xs].sort((a, b) => a - b);
const mean = (xs) => sum(xs) / xs.length;
const median = (xs) => { const s = sorted(xs), m = s.length / 2; return s.length % 2 ? s[Math.floor(m)] : (s[m - 1] + s[m]) / 2; };
const r1 = (v) => fmt(Math.round(v * 10) / 10);

const TV = [6, 5, 11, 13, 24, 8, 1, 12, 7, 6, 14, 10, 9, 16, 8, 3]; // the review's data
const tvC = classes(0, 5, 5), tvF = tally(TV, 0, 5, 5);
const cards = (text, list, o = {}) => ({ text, figs: true, cols: 4, prefix: 'Shape:', items: list.map(([fig]) => ({ fig })), ans: list.map(([, a]) => a), ...o });
const EASY = { figH: 21 };
// a dot plot with one value far from the rest
const outQ = (counts, out) => [shapeD(counts), String(out)];
// a labelled histogram to describe: its shape and the class with the most values
const descQ = (start, w, v, shape) => { const c = classes(start, w, v.length); return [histogram({ classes: c, values: v, max: Math.max(...v) + 1, step: 1, labelEvery: 2, yTitle: 'Frequency', w: 72, h: 30 }), `${shape}; most in ${c[v.indexOf(Math.max(...v))]}`]; };
const MARKS = [45, 48, 50, 52, 55, 12];

module.exports = {
  code: '4.6', title: 'Symmetrical or skewed',
  li: 'describe the shape of a set of data, and spot outliers.',
  sc: ['say whether a graph is symmetrical or skewed', 'find an outlier and where most of the data lie', 'say whether the mean or the median is bigger in skewed data'],
  easy: {
    ex: { stem: 'Look at where the tail is: the side where the columns (or dots) get short and spread out.', parts: [
      { t: 'Shape?', fig: shapeH([1, 3, 6, 3, 1]) }, { t: 'Shape?', fig: shapeH([7, 5, 3, 2, 1]) }, { t: 'Shape?', fig: shapeH([1, 2, 3, 5, 7]) }, { t: 'Shape?', fig: shapeD({ 1: 5, 2: 3, 3: 2, 4: 1, 5: 1 }) }] },
    exAns: [`${SYM}: both sides match`, `${POS}: the tail is on the right`, `${NEG}: the tail is on the left`, `${POS}: the tail is on the right`],
    hint: 'Symmetrical: the two sides match · Positively skewed: the tail is on the right · Negatively skewed: the tail is on the left.',
    rounds: [
      cards('name the shape of each histogram.', [[shapeH([2, 5, 8, 5, 2]), SYM], [shapeH([8, 6, 4, 2, 1]), POS], [shapeH([1, 1, 3, 6, 9]), NEG], [shapeH([3, 7, 4, 2, 1]), POS]], EASY),
      cards('name the shape of each dot plot.', [[shapeD({ 1: 1, 2: 3, 3: 5, 4: 3, 5: 1 }), SYM], [shapeD({ 1: 1, 2: 1, 3: 2, 4: 4, 5: 6 }), NEG], [shapeD({ 1: 6, 2: 4, 3: 2, 4: 1, 5: 1 }), POS], [shapeD({ 1: 2, 2: 4, 3: 4, 4: 2 }), SYM]], EASY),
      cards('symmetrical, positively skewed or negatively skewed?', [[shapeH([9, 7, 5, 3, 2, 1, 1]), POS], [shapeH([1, 1, 2, 3, 5, 7, 9]), NEG], [shapeH([1, 3, 5, 7, 5, 3, 1]), SYM], [shapeD({ 10: 5, 11: 4, 12: 2, 13: 1, 14: 1 }), POS]], EASY),
    ],
  },
  medium: {
    ex: { stem: 'Hours of TV watched by 16 people. Describe the shape and where most values lie.',
      fig: histogram({ classes: tvC, values: tvF, max: Math.max(...tvF) + 1, step: 1, xTitle: 'Hours', w: 80, h: 46 }), parts: [
        'Is the data symmetrical or skewed?', 'Where do most of the values lie?', `The mean is ${r1(mean(TV))} and the median is ${fmt(median(TV))}. Which is bigger?`, 'Why is that one bigger?'] },
    exAns: [`${POS} (the tail is on the right)`, `${tvC[1]} and ${tvC[2]} hours (${tvF[1] + tvF[2]} of the ${TV.length} people)`, `the mean (${r1(mean(TV))} > ${fmt(median(TV))})`, 'the few big values in the tail pull the mean up'],
    hint: 'Describe: the shape, any outlier (a value far from the rest), and where most values lie · In positively skewed data, the mean is bigger than the median.',
    rounds: [
      cards('each dot plot has an outlier. Write the outlier.', [outQ({ 2: 1, 3: 3, 4: 4, 5: 2, 12: 1 }, 12), outQ({ 20: 1, 31: 2, 32: 4, 33: 3, 34: 1 }, 20), outQ({ 5: 2, 6: 3, 7: 2, 15: 1 }, 15), outQ({ 1: 1, 8: 2, 9: 4, 10: 3 }, 1)], { prefix: 'Outlier:' }),
      cards('name the shape and the class with the most values.', [descQ(0, 10, [2, 6, 9, 5, 1], SYM), descQ(10, 5, [8, 6, 3, 2, 1], POS), descQ(50, 10, [1, 2, 4, 6, 9], NEG), descQ(0, 2, [7, 9, 5, 2, 1], POS)], { prefix: 'Shape, most:', cols: 2, figH: 30 }),
      problems('solve each problem. Show your working.', [
        ['The house prices in a town are positively skewed. Which is bigger, the mean or the median? Why?', 'the mean: the few very expensive houses (the tail) pull the mean up'],
        [`The test marks were ${MARKS.join(', ')}. Which mark is the outlier? Find the mean with and without it (1 d.p.).`,
          `outlier ${Math.min(...MARKS)}; mean with it ${r1(mean(MARKS))}, without it ${r1(mean(MARKS.filter((x) => x !== Math.min(...MARKS))))}`],
      ]),
    ],
  },
};
