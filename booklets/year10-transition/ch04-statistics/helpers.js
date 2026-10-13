// Chapter 4 helpers: the shared ones (../helpers.js), plus the graphs and tables the statistics lessons use.
const base = require('../helpers');
const G = require('../../lib/graphs');

const sum = (xs) => xs.reduce((a, b) => a + b, 0);
// A frequency table: classes and their frequencies, with a Total row. pct: add a percentage frequency column
// (blank: leave it and the total empty for students to fill in).
const freqTable = (classes, freqs, { head = 'Class', pct = false, blank = false, total = true } = {}) => {
  const T = sum(freqs);
  const rows = classes.map((c, i) => [c, freqs[i], ...(pct ? [blank ? '' : `${base.fmt((freqs[i] / T) * 100)}%`] : [])]);
  if (total) rows.push(['<b>Total</b>', blank ? '' : `<b>${T}</b>`, ...(pct ? [blank ? '' : '<b>100%</b>'] : [])]);
  return G.table([head, 'Frequency', ...(pct ? ['Percentage frequency'] : [])], rows, blank ? 'blank-pct' : '');
};
// Class intervals of width w from start: classes(0, 5, 4) → ['0–4', '5–9', '10–14', '15–19']
const classes = (start, w, n) => Array.from({ length: n }, (_, i) => `${start + i * w}–${start + (i + 1) * w - 1}`);
// Count the values in each class interval of width w from start.
const tally = (data, start, w, n) => Array.from({ length: n }, (_, i) => data.filter((x) => x >= start + i * w && x < start + (i + 1) * w).length);

module.exports = { ...base, ...G, sum, freqTable, classes, tally };
