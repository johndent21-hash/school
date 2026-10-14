// Lesson 4.4 Mean, median, mode and range (two pages: Easy, then Medium). See lib/lesson-two.js for the fields.
// Easy: small sets of whole numbers (an odd number of values). Medium: an even number of values (the median is halfway
// between the two middle values), the mean to 1 decimal place and the effect of an outlier; the page ends with word
// problems. Each set of data is shown as number cards.
// From the Chapter 4 review: 2, 4, 3, 5, 10, 6 (multiple-choice 9), the median of 29, 12, 18, 26, 15, 22 (multiple-choice
// 10), the 13 adults' ages (short-answer 9) in the Medium WE DO, and 2, 7, 4, 8, 3, 6, 5 (short-answer 8a).
const { fmt, problems, sum } = require('../helpers');

// ---------- statistics ----------
const sorted = (xs) => [...xs].sort((a, b) => a - b);
const mean = (xs) => sum(xs) / xs.length;
const median = (xs) => { const s = sorted(xs), m = s.length / 2; return s.length % 2 ? s[Math.floor(m)] : (s[m - 1] + s[m]) / 2; };
const range = (xs) => Math.max(...xs) - Math.min(...xs);
const mode = (xs) => { const c = {}; xs.forEach((x) => { c[x] = (c[x] || 0) + 1; }); const top = Math.max(...Object.values(c)); return top === 1 ? 'no mode' : Object.keys(c).filter((k) => c[k] === top).join(' and '); };
const r1 = (v) => fmt(Math.round(v * 10) / 10);
// the working, as a teacher would write it
const meanW = (xs, dp = false) => `${sum(xs)} ÷ ${xs.length} = ${dp ? r1(mean(xs)) : fmt(mean(xs))}`;
const medW = (xs) => { const s = sorted(xs), m = s.length / 2; return `${s.join(', ')} → ${s.length % 2 ? fmt(s[Math.floor(m)]) : `(${s[m - 1]} + ${s[m]}) ÷ 2 = ${fmt(median(xs))}`}`; };
const rangeW = (xs) => `${Math.max(...xs)} − ${Math.min(...xs)} = ${range(xs)}`;

// ---------- cards ----------
const cardsOf = (xs) => `<div class="ncards">${xs.map((x) => `<span>${x}</span>`).join('')}</div>`;
const round = (text, sets, ans, o = {}) => ({ text, figs: true, cols: 4, items: sets.map((xs) => ({ fig: cardsOf(xs) })), ans: sets.map(ans), ...o });
const EASY = { figH: 18 };

const EX1 = [3, 7, 5, 7, 8];
const MC9 = [2, 4, 3, 5, 10, 6], MC10 = [29, 12, 18, 26, 15, 22];
const AGES = [40, 41, 37, 32, 48, 43, 32, 76, 29, 33, 26, 38, 87];
const OUT = [[5, 6, 7, 8, 49], [30, 32, 35, 35, 38, 90]];
const SA8 = [2, 7, 4, 8, 3, 6, 5];

module.exports = {
  code: '4.4', title: 'Mean, median, mode and range',
  li: 'find the mean, median, mode and range of a set of data.',
  sc: ['find the mean, the mode and the range', 'find the median of an odd or even number of values', 'explain how an outlier changes the mean'],
  easy: {
    ex: { stem: 'Use the data. Put the values in order first for the median.', fig: cardsOf(EX1), parts: ['Find the mean.', 'Find the median.', 'Find the mode.', 'Find the range.'] },
    exAns: [meanW(EX1), medW(EX1), mode(EX1), rangeW(EX1)],
    hint: 'Mean = total ÷ number of values · Median = the middle value in order · Mode = the most common · Range = highest − lowest.',
    rounds: [
      round('find the mean of each set.', [[2, 4, 6], [5, 5, 8, 2], [10, 20, 30, 40, 50], [1, 3, 5, 7, 9]], (xs) => meanW(xs), { prefix: 'Mean =', ...EASY }),
      round('put each set in order, then find the median.', [[3, 9, 1, 7, 5], [12, 4, 8], [6, 2, 9, 4, 7], [15, 11, 20, 13, 18]], medW, { prefix: 'Median =', ...EASY }),
      round('find the mode and the range of each set.', [[4, 2, 4, 8, 6], [9, 3, 9, 5, 1], [7, 7, 2, 10, 4], [12, 15, 12, 18, 11]], (xs) => `mode ${mode(xs)}, range ${rangeW(xs)}`, { prefix: 'Mode, range:', ...EASY }),
    ],
  },
  medium: {
    ex: { stem: 'With an even number of values, the median is halfway between the two middle values.', parts: [
      { t: 'Find the mean and the range.', fig: cardsOf(MC9) }, { t: 'Find the median.', fig: cardsOf(MC10) },
      { t: 'Ages of 13 adults: find the mean (1 d.p.) and the median.', fig: cardsOf(AGES) }, 'Why is the mean age bigger than the median age in c?'] },
    exAns: [`mean ${meanW(MC9)}, range ${rangeW(MC9)}`, medW(MC10), `mean ${meanW(AGES, true)}, median ${fmt(median(AGES))}`, `the two oldest ages (${Math.max(...AGES)} and ${sorted(AGES).slice(-2)[0]}) are outliers that pull the mean up`],
    hint: 'Even number of values: median = (two middle values added) ÷ 2 · Round the mean to 1 decimal place · An outlier (a very high or low value) pulls the mean towards it.',
    rounds: [
      round('an even number of values. Find each median.', [[3, 8, 5, 10], [12, 4, 9, 7], [20, 14, 18, 11, 16, 25], [1, 6, 2, 9, 5, 8]], medW, { prefix: 'Median =' }),
      round('find each mean, to 1 decimal place.', [[3, 5, 6], [10, 12, 15, 14], [2, 9, 4, 8, 5, 3], [21, 18, 25, 30, 16, 27]], (xs) => meanW(xs, true), { prefix: 'Mean =' }),
      round('each set has an outlier. Find the mean and median. Which is better?', OUT,
        (xs) => `mean ${meanW(xs, true)}, median ${fmt(median(xs))}; the median (the outlier ${Math.max(...xs)} pulls the mean up)`, { cols: 2, prefix: 'Mean, median:' }),
      problems('solve each problem. Show your working.', [
        [`Jo’s quiz scores were ${SA8.join(', ')}. Find the mean, the median and the range.`, `mean ${meanW(SA8)}, median ${fmt(median(SA8))}, range ${rangeW(SA8)}`],
        ((known, m) => [`The mean of 4 test marks is ${m}. Three of the marks are ${known.join(', ')}. What is the fourth mark?`, `total = 4 × ${m} = ${4 * m}; ${4 * m} − ${sum(known)} = ${4 * m - sum(known)}`])([12, 18, 14], 15),
      ]),
    ],
  },
};
