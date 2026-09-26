// Blended booklet, Chapter 10 Analysing data. Six pages a lesson: graphs and plots need room, and each WE DO
// example shows the graph it is about.
const blend = require('../../lib/blend');
const S = require('../../lib/stats');

const base = require('../../year7/ch10-analysing-data/chapter.js');
const sp = (code) => base.lessons.find((f) => f.spec.code === code).spec;
const D = (text, pairs, hw, cols = 3) => ({ text, cols, items: pairs.map((p) => p[0]), ans: pairs.map((p) => p[1]), hw });
const stat = (fn, sets, lab) => sets.map((xs) => [xs.join(', '), lab(xs)]);
const s1 = sp('10.01');

module.exports = blend(base, {
  fileName: 'Year7-Ch10-Analysing-Data-Lessons', pages: 6,
  more: {
    '10.01': { exFigs: [s1.a.fig, s1.b.fig, s1.c.fig], stems: ['Use the sector graph.', 'Use the picture graph.', 'Use the line graph.'],
      we: [...s1.we.slice(0, 5), 'Describe the trend from January to July.'], ans: { ...s1.ans, we: [...s1.ans.we.slice(0, 5), 'it falls steadily to a low in July'] },
      drill: D('Quick drill: reading scales. A column reaches the line shown. What is its value?', [['halfway between 10 and 20', '15'], ['2 small steps above 40 (steps of 5)', '50'], ['just below 30 on a scale of 2s', '28'], ['3 symbols, key: 1 symbol = 4 people', '12'], ['2½ symbols, key: 1 symbol = 10', '25'], ['a quarter of a circle of 80 people', '20']], ['half a circle of 60 people', '30', 'Reading graphs: what value is shown?'], 2) },
    '10.02': { exFigs: [sp('10.02').a.fig, sp('10.02').b.fig], stems: ['Use the line graph.', 'Use the column graph.', 'Think about misleading graphs.'],
      drill: D('Quick drill: misleading or fair? Write M or F.', [['The vertical axis starts at 50', 'M'], ['The scale goes 0, 10, 20, 30', 'F'], ['The scale goes 0, 10, 20, 50, 100', 'M'], ['There is no title or labels', 'M'], ['A picture is doubled in height and width', 'M'], ['The axis starts at 0 with a clear key', 'F']], ['The axis starts at 90', 'M', 'Is this graph misleading (M) or fair (F)?'], 2) },
    '10.03': { exFigs: [sp('10.03').a.fig, sp('10.03').a.fig], stems: ['Use the dot plot.', 'Use the dot plot.', 'Draw a dot plot, then describe.'],
      drill: D('Quick drill: find the mode.', [['2, 3, 3, 4, 5', '3'], ['7, 8, 8, 8, 9, 9', '8'], ['1, 1, 2, 2, 2, 3', '2'], ['10, 12, 12, 15', '12'], ['5, 6, 6, 7, 7, 7', '7'], ['0, 0, 1, 3, 3, 3, 4', '3']], ['4, 5, 5, 5, 6, 8', '5', 'Find the mode.']) },
    '10.04': { exFigs: [sp('10.04').a.fig, sp('10.04').a.fig], stems: ['Use the stem-and-leaf plot.', 'Use the stem-and-leaf plot.', 'Draw an ordered plot, then explain.'],
      drill: D('Quick drill: write the value (key 3 | 4 = 34).', [['2 | 7', '27'], ['5 | 0', '50'], ['1 | 9', '19'], ['8 | 3', '83'], ['10 | 4', '104'], ['6 | 6', '66']], ['4 | 1', '41', 'Write the value (key 3 | 4 = 34).']) },
    '10.05': { stems: ['Find the mean and the mode.', 'Find the mean and the mode.', 'Find the mean and mode, then solve.'],
      drill: D('Quick drill: find the mean.', stat(null, [[2, 4, 6], [1, 2, 3, 6], [5, 5, 5, 5], [10, 20, 30], [3, 4, 8], [0, 6, 6, 8]], (xs) => S.fmt(S.mean(xs))), ['7, 8, 9, 12', S.fmt(S.mean([7, 8, 9, 12])), 'Find the mean.']) },
    '10.06': { stems: ['Find the median and the range.', 'Find the median and the range.', 'Find the median and range, then compare.'],
      drill: D('Quick drill: find the median.', stat(null, [[1, 3, 5], [2, 4, 6, 8], [9, 3, 7], [5, 1, 4, 2], [10, 20, 30, 40, 50], [6, 6, 7, 9]], (xs) => S.fmt(S.median(xs))), ['8, 2, 6, 4', S.fmt(S.median([8, 2, 6, 4])), 'Find the median.']) },
    '10.07': { exFigs: [sp('10.07').a.fig, sp('10.07').b.fig, sp('10.07').b.fig], stems: ['Use the dot plot.', 'Use the stem-and-leaf plot.', 'Use the stem-and-leaf plot.'],
      drill: D('Quick drill: find the range.', stat(null, [[3, 9, 5], [12, 4, 20], [7, 7, 7], [15, 30, 25, 10], [0, 8, 3], [41, 56, 38]], (xs) => S.fmt(S.range(xs))), ['23, 17, 31, 29', S.fmt(S.range([23, 17, 31, 29])), 'Find the range.']) },
    '10.08': { exFigs: [sp('10.08').a.fig, sp('10.08').a.fig, sp('10.08').a.fig], stems: ['Use the back-to-back plot.', 'Use the back-to-back plot.', 'Compare the girls and the boys.'],
      drill: D('Quick drill: which group is more consistent (smaller range)?', [['A: range 12, B: range 30', 'A'], ['A: range 25, B: range 9', 'B'], ['A: 40 to 60, B: 20 to 90', 'A'], ['A: 5 to 50, B: 30 to 45', 'B']], ['A: range 18, B: range 7', 'B', 'Which group is more consistent?'], 2) },
  },
});
