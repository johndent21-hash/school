// Lesson 4.5 Stem-and-leaf plots (two pages: Easy, then Medium). See lib/lesson-two.js for the fields.
// Easy: reading an ordered stem-and-leaf plot. Medium: drawing an ordered plot from raw data (on a blank template), then
// finding the median and the range; the page ends with word problems.
// From the Chapter 4 review: the plot with stems 2 to 5 (multiple-choice 7 and 8: minimum 24, mode 31, the Easy WE DO),
// the basketball points (short-answer 7, the Medium WE DO) and the flying-fox counts (extended response 2, a word problem).
const { fmt, problems, stemLeaf, stemLeafTemplate, sum } = require('../helpers');

// ---------- data helpers ----------
const sorted = (xs) => [...xs].sort((a, b) => a - b);
const median = (xs) => { const s = sorted(xs), m = s.length / 2; return s.length % 2 ? s[Math.floor(m)] : (s[m - 1] + s[m]) / 2; };
const mode = (xs) => { const c = {}; xs.forEach((x) => { c[x] = (c[x] || 0) + 1; }); const top = Math.max(...Object.values(c)); return Object.keys(c).filter((k) => c[k] === top).join(' and '); };
// Stem-and-leaf rows from data: [[stem, [leaves]], …], every stem from the lowest to the highest
const rows = (xs) => { const s = sorted(xs), out = []; for (let st = Math.floor(s[0] / 10); st <= Math.floor(s[s.length - 1] / 10); st++) out.push([st, s.filter((x) => Math.floor(x / 10) === st).map((x) => x % 10)]); return out; };
const plot = (xs, title) => stemLeaf({ title, rows: rows(xs), key: `${rows(xs)[0][0]} | ${rows(xs)[0][1][0]} = ${rows(xs)[0][0]}${rows(xs)[0][1][0]}` });
const ordered = (xs) => rows(xs).map(([st, l]) => `${st} | ${l.join(' ')}`).join('; ');
const medW = (xs) => { const s = sorted(xs), m = s.length / 2; return s.length % 2 ? `the ${Math.ceil(m)}th value = ${fmt(median(xs))}` : `(${s[m - 1]} + ${s[m]}) ÷ 2 = ${fmt(median(xs))}`; };
const rangeW = (xs) => `${Math.max(...xs)} − ${Math.min(...xs)} = ${Math.max(...xs) - Math.min(...xs)}`;
const raw = (title, xs) => `<div class="rawdata"><b>${title}</b>${xs.join(', ')}</div>`;
const drawPair = (title, xs) => `<div class="fig-pair">${raw(title, xs)}${stemLeafTemplate({ stems: rows(xs).map(([s]) => s) })}</div>`;

// ---------- data ----------
const REV = [24, 29, 31, 31, 37, 38, 42, 44, 46, 50, 54]; // the review's plot (stems 2–5)
const AGES = [15, 18, 20, 23, 23, 27, 29, 31, 34, 36, 42];
const MARKS = [56, 62, 65, 68, 70, 73, 73, 73, 79, 81, 84, 87, 90, 95];
const PTS = [20, 19, 24, 37, 42, 34, 38, 49, 28, 15, 38, 32, 50, 29]; // the review's basketball points
const FOX = [73, 50, 36, 82, 15, 24, 73, 57, 65, 86, 51, 32, 21, 39]; // the review's flying-fox counts
const HW = [12, 25, 31, 18, 22, 27, 35, 14, 29, 20, 33, 26];
const BEACH = [23, 41, 35, 18, 29, 44, 37, 26, 31, 19, 38, 45];
const PLANT = [12, 15, 18, 20, 24, 24, 27, 31, 33, 36, 40];
const between = (xs, a, b) => xs.filter((x) => x >= a && x <= b).length;

module.exports = {
  code: '4.5', title: 'Stem-and-leaf plots',
  li: 'read and draw stem-and-leaf plots, and use them to find statistics.',
  sc: ['read the values in a stem-and-leaf plot', 'draw an ordered stem-and-leaf plot', 'find the median and range from a plot'],
  easy: {
    ex: { stem: 'The stem is the tens digit, the leaf is the units digit. The key shows how to read it.', fig: plot(REV, 'Scores'), parts: [
      'Write the values in the row with stem 3.', 'What is the smallest value?', 'What is the mode?', 'How many values are there?'] },
    exAns: [rows(REV).find(([s]) => s === 3)[1].map((l) => `3${l}`).join(', '), String(Math.min(...REV)), mode(REV), String(REV.length)],
    hint: 'Join the stem and the leaf: 3 | 7 = 37 · The smallest is the first leaf, the largest is the last · Count the leaves to find how many values.',
    rounds: [
      { text: 'use the plot of ages at a party.', cols: 2, fig: plot(AGES, 'Ages at a party'),
        items: ['What is the youngest age?', 'What is the oldest age?', 'What is the mode?', 'How many people are there?', 'How many people are in their 20s?', 'How many people are older than 30?'],
        ans: [String(Math.min(...AGES)), String(Math.max(...AGES)), mode(AGES), String(AGES.length), String(between(AGES, 20, 29)), String(AGES.filter((x) => x > 30).length)] },
      { text: 'use the plot of test marks.', cols: 2, fig: plot(MARKS, 'Test marks'),
        items: ['What is the lowest mark?', 'What is the highest mark?', 'What is the mode?', 'How many students are there?', 'How many marks are 80 or more?', 'What is the range?'],
        ans: [String(Math.min(...MARKS)), String(Math.max(...MARKS)), mode(MARKS), String(MARKS.length), String(MARKS.filter((x) => x >= 80).length), rangeW(MARKS)] },
    ],
  },
  medium: {
    ex: { stem: `Basketball points in ${PTS.length} matches: ${PTS.join(', ')}.`, parts: [
      { t: 'Draw an ordered stem-and-leaf plot.', draw: stemLeafTemplate({ stems: rows(PTS).map(([s]) => s) }) }, 'Find the median.', 'Find the range.', 'Where do most of the scores lie?'] },
    exAns: [ordered(PTS), medW(PTS), rangeW(PTS), `in the 20s and 30s (${between(PTS, 20, 39)} of the ${PTS.length} scores)`],
    hint: 'Write the stems down the side, then each leaf beside its stem, smallest to largest · Add a key · Median: count in from both ends.',
    rounds: [
      { text: 'draw an ordered plot on each template. Then find the median and range.', figs: true, cols: 2, figH: 44, prefix: 'Median, range:',
        items: [{ fig: drawPair('Ages of people at the beach', BEACH) }, { fig: drawPair('Minutes spent on homework', HW) }],
        ans: [`${ordered(BEACH)}; median ${medW(BEACH)}; range ${rangeW(BEACH)}`, `${ordered(HW)}; median ${medW(HW)}; range ${rangeW(HW)}`] },
      { text: 'use the plot of plant heights (cm).', cols: 2, fig: plot(PLANT, 'Heights of plants (cm)'),
        items: ['How many plants are there?', 'What is the median height?', 'What is the range?', 'How many plants are 30 cm or taller?'],
        ans: [String(PLANT.length), medW(PLANT), rangeW(PLANT), String(PLANT.filter((x) => x >= 30).length)] },
      problems('solve each problem. Show your working.', [
        [`Flying foxes in a fig tree were counted on ${FOX.length} days: ${FOX.join(', ')}. Write the counts in order, then find the median and the range.`, `${sorted(FOX).join(', ')}; median ${medW(FOX)}; range ${rangeW(FOX)}`],
        ((xs) => [`Sam says the median of ${xs.join(', ')} is ${xs[2]}. Explain the mistake and find the median.`, `there are ${xs.length} values (even), so the median is halfway between the two middle values: ${medW(xs)}`])([12, 15, 18, 40]),
      ]),
    ],
  },
};
