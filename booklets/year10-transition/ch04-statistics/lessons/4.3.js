// Lesson 4.3 Histograms (two pages: Easy, then Medium). See lib/lesson-two.js for the fields.
// Easy reads histograms; Medium finds percentage frequencies and draws histograms from a frequency table.
// The TV and basketball data are the Chapter 4 review's own (short-answer questions 6 and 7), grouped into classes.
const { fmt, pct, problems, histogram, freqTable, classes, tally, sum } = require('../helpers');

// The review's data: hours of TV watched by 16 people, and a basketball team's points in 14 matches.
const TV = [6, 5, 11, 13, 24, 8, 1, 12, 7, 6, 14, 10, 9, 16, 8, 3];
const PTS = [20, 19, 24, 37, 42, 34, 38, 49, 28, 15, 38, 32, 50, 29];

const tv = { cls: classes(0, 5, 5), f: tally(TV, 0, 5, 5) };
const pts = { cls: classes(10, 10, 5), f: tally(PTS, 10, 10, 5) };
const seed = { cls: classes(0, 10, 5), f: [4, 8, 12, 5, 1] };

// The class with the most (or fewest) values, and how many are in classes from index i on (or before it).
const top = (d) => d.cls[d.f.indexOf(Math.max(...d.f))];
const low = (d) => d.cls[d.f.indexOf(Math.min(...d.f))];
const from = (d, i) => sum(d.f.slice(i));
const below = (d, i) => sum(d.f.slice(0, i));
// Gridlines every 1, numbered every 1 (or every 2 when the tallest column is over 8).
const hist = (d, o) => { const max = Math.max(...d.f) + 1; return histogram({ classes: d.cls, values: d.f, max, step: 1, labelEvery: max > 9 ? 2 : 1, w: 80, h: 46, ...o }); };

// Medium: frequency tables to draw as histograms.
const marks = { cls: classes(0, 10, 5), f: [1, 3, 6, 7, 3] };
const sport = { cls: ['0–2', '3–5', '6–8', '9–11'], f: [5, 9, 4, 2] };
const blank = (d, xTitle) => histogram({ classes: d.cls, max: Math.max(...d.f) + 1, step: 1, xTitle, w: 56, h: 46, blank: true });
const drawItem = (d, head, xTitle) => ({ t: 'Draw a histogram for the table. Then name the most common class.', fig: `<div class="tbl-hist">${freqTable(d.cls, d.f, { head })}${blank(d, xTitle)}</div>` });
const walk = { cls: classes(0, 10, 4), f: [6, 8, 4, 2] };
const pctOf = (f, T) => pct((f / T) * 100);

module.exports = {
  code: '4.3', title: 'Histograms',
  li: 'read a histogram, and draw one from a frequency table.',
  sc: ['read the frequency of a class from a histogram', 'find the most common class and the total', 'draw a histogram and find percentage frequencies'],
  easy: {
    ex: { stem: 'A histogram is a column graph for class intervals. Its columns touch.', fig: hist(tv, { title: 'Hours of TV watched in a week', xTitle: 'Hours' }), parts: [
      'How many people watched 5–9 hours?', 'Which class is the most common?', 'How many people were surveyed?', 'How many people watched 10 hours or more?'] },
    exAns: [`${tv.f[1]} people`, `${top(tv)} hours`, `${tv.f.join(' + ')} = ${sum(tv.f)} people`, `${tv.f.slice(2).join(' + ')} = ${from(tv, 2)} people`],
    hint: 'Read across from the top of a column to the frequency axis · Total = add up all the columns · “10 or more” = add the columns from 10 up.',
    rounds: [
      { text: 'use the histogram of seedling heights.', fig: hist(seed, { title: 'Heights of seedlings', xTitle: 'Height (cm)' }), cols: 2,
        items: ['How many seedlings are 10–19 cm?', 'How many seedlings are 30–39 cm?', 'Which class has the most seedlings?', 'Which class has the fewest seedlings?', 'How many seedlings are there in total?', 'How many seedlings are 30 cm or taller?'],
        ans: [String(seed.f[1]), String(seed.f[3]), `${top(seed)} cm`, `${low(seed)} cm`, String(sum(seed.f)), String(from(seed, 3))] },
      { text: 'use the histogram of points scored by a basketball team.', fig: hist(pts, { title: 'Points scored in each match', xTitle: 'Points' }), cols: 2,
        items: ['How many matches had 20–29 points?', 'How many matches had 40–49 points?', 'Which class is the most common?', 'How many matches did the team play?', 'How many matches had fewer than 30 points?', 'How many matches had 40 points or more?'],
        ans: [String(pts.f[1]), String(pts.f[3]), `${top(pts)} points`, String(sum(pts.f)), String(below(pts, 2)), String(from(pts, 3))] },
    ],
  },
  medium: {
    ex: { stem: 'Minutes taken to walk to school. Percentage frequency = frequency ÷ total × 100.', parts: [
      { t: 'Find the total, then the percentage frequency of each class.', fig: freqTable(walk.cls, walk.f, { head: 'Minutes', pct: true, blank: true }) },
      { t: 'Draw the histogram.', draw: histogram({ classes: walk.cls, max: Math.max(...walk.f) + 1, step: 1, xTitle: 'Minutes', w: 76, h: 46, blank: true }) }] },
    exAns: [`total ${sum(walk.f)} · ${walk.cls.map((c, i) => `${c}: ${walk.f[i]} ÷ ${sum(walk.f)} × 100 = ${pctOf(walk.f[i], sum(walk.f))}`).join(' · ')}`,
      `columns that touch, heights ${walk.f.join(', ')}; frequency up the side, minutes along the bottom`],
    hint: 'Percentage frequency = frequency ÷ total × 100 · Draw a histogram: label both axes, columns touch, leave a half-column gap at the start.',
    rounds: [
      { text: 'find each percentage frequency (frequency ÷ total × 100).', cols: 4,
        ...((list) => ({ items: list.map(([f, T]) => `${f} out of ${T}`), ans: list.map(([f, T]) => pctOf(f, T)) }))([[5, 20], [3, 10], [8, 40], [6, 25], [18, 30], [12, 50], [7, 20], [4, 16]]) },
      { text: 'draw each histogram on its grid.', figs: true, cols: 2, figH: 47, prefix: 'Most common:',
        items: [drawItem(marks, 'Mark', 'Mark (out of 50)'), drawItem(sport, 'Hours', 'Hours of sport')],
        ans: [`columns ${marks.f.join(', ')}; most common ${top(marks)}`, `columns ${sport.f.join(', ')}; most common ${top(sport)} hours`] },
      problems('solve each problem. Show your working.', [
        ((n, k) => [`${n} people were asked how many hours of TV they watch. ${k} of them said 0–4 hours. What percentage is this?`, pctOf(k, n)])(16, 4),
        ((c) => [`The columns of a histogram are ${c.join(', ')} high. How many values are there? What percentage are in the tallest column?`, `${fmt(sum(c))} values, ${pctOf(Math.max(...c), sum(c))}`])([3, 8, 6, 3]),
      ]),
    ],
  },
};
