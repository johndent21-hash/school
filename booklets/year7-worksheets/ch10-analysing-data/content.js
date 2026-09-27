// Worksheet questions for Chapter 10 Analysing data (lib/worksheet.js). See ../ch01-integers/content.js.
// Graph rounds show their graph under the speech bubble (round.fig); every question in the round uses it.
const G = require('../../lib/graphs');
const { fmt } = require('../../lib/calc');

const sum = (xs) => xs.reduce((a, b) => a + b, 0);
const mean = (xs) => sum(xs) / xs.length;
const median = (xs) => { const s = [...xs].sort((a, b) => a - b), m = s.length / 2; return s.length % 2 ? s[Math.floor(m)] : (s[m - 1] + s[m]) / 2; };
const modes = (xs) => { const c = {}; xs.forEach((x) => { c[x] = (c[x] || 0) + 1; }); const top = Math.max(...Object.values(c)); return top === 1 ? 'no mode' : Object.keys(c).filter((k) => c[k] === top).join(' and '); };
const range = (xs) => Math.max(...xs) - Math.min(...xs);
const L = (xs) => xs.join(', ');
const sorted = (xs) => [...xs].sort((a, b) => a - b);
const counts = (xs) => { const c = {}; xs.forEach((x) => { c[x] = (c[x] || 0) + 1; }); return c; };
const slRows = (xs) => { const s = sorted(xs), rows = []; for (let st = Math.floor(s[0] / 10); st <= Math.floor(s[s.length - 1] / 10); st++) rows.push([st, s.filter((x) => Math.floor(x / 10) === st).map((x) => x % 10)]); return rows; };
const slText = (xs) => slRows(xs).map(([st, l]) => `${st} | ${l.join(' ')}`).join('<br>');
const d1 = (x) => fmt(Math.round(x * 10) / 10, 1);

module.exports = {
  '10.01': ({ ri, shuffle }) => {
    const cats = shuffle(['Soccer', 'Swim', 'Golf', 'AFL', 'Tennis', 'Rugby', 'Dance']).slice(0, 5), vals = cats.map(() => ri(2, 18));
    const cg = G.columnGraph({ title: 'Favourite sport of Year 7', cats, values: vals, max: 20, step: 2, labelEvery: 4, yTitle: 'Students', w: 76, h: 50 });
    const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'], full = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const temps = months.map((_, i) => Math.round(24 + 7 * Math.cos(((i + 0.3) / 12) * 2 * Math.PI) + ri(-1, 1)));
    const lg = G.lineGraph({ title: 'Mean maximum temperature', xs: months, ys: temps, max: 35, yMin: 10, step: 5, labelEvery: 5, yTitle: '°C', xTitle: 'Month', w: 64, h: 48 });
    const total = sum(vals);
    return [
      [{ text: 'Use the column graph. Read each column against the scale.', fig: cg, fh: 52, gen: (i) => (i < 5 ? { q: `How many chose ${cats[i]}?`, a: String(vals[i]) } : i === 5 ? { q: 'How many students altogether?', a: String(total) } : i === 6 ? { q: 'Which sport was most popular?', a: cats[vals.indexOf(Math.max(...vals))] } : null) },
       { text: 'Reading scales: the column ends halfway between two gridlines. What value does it show?', gen: () => { const st = [2, 4, 5, 10, 20, 50][ri(0, 5)], a = ri(1, 9) * st; return { q: `between ${a} and ${a + st}`, a: fmt(a + st / 2) }; } }],
      [{ text: 'Use the line graph. Read the value, then work out the change.', fig: lg, fh: 50, gen: (i) => { if (i > 9) return null; const a = i % 12, b = (i * 5 + 3) % 12; if (a === b) return { q: '' }; return { q: `From ${full[a]} to ${full[b]}`, a: `${temps[a]}°C to ${temps[b]}°C: ${temps[b] >= temps[a] ? 'up' : 'down'} ${Math.abs(temps[b] - temps[a])}°C`, lines: [`${full[a]}: ${temps[a]}°C, ${full[b]}: ${temps[b]}°C`, `change: ${Math.abs(temps[b] - temps[a])}°C ${temps[b] >= temps[a] ? 'up' : 'down'}`] }; } }],
      [{ text: 'Use the column graph in column 1. Answer each question; give fractions in simplest form.', kinds: 2, gen: (n) => {
        const cmp = (i) => { const a = i % 5, b = (i * 2 + 1) % 5; if (a === b || vals[a] === vals[b] || i > 9) return i > 9 ? null : { q: '' }; const [x, y] = vals[a] > vals[b] ? [a, b] : [b, a]; return { q: `How many more chose ${cats[x]} than ${cats[y]}? What percentage of the class is that (1 d.p.)?`, a: `${vals[x] - vals[y]}, ${d1(((vals[x] - vals[y]) / total) * 100)}%`, lines: [`${vals[x]} − ${vals[y]} = ${vals[x] - vals[y]}`, `${vals[x] - vals[y]} ÷ ${total} × 100 = ${d1(((vals[x] - vals[y]) / total) * 100)}%`] }; };
        const frac = (i) => { if (i > 7) return null; const k = i % 5; const [a, b] = [vals[k], total]; const g = (x, y) => (y ? g(y, x % y) : x); return { q: `What fraction, and what percentage (1 d.p.), chose ${cats[k]}?`, a: `${a / g(a, b)}/${b / g(a, b)}, ${d1((a / b) * 100)}%`, lines: [`${a} out of ${b}`, `fraction: ${a / g(a, b)}/${b / g(a, b)}`, `percentage: ${a} ÷ ${b} × 100 = ${d1((a / b) * 100)}%`] }; };
        return n % 2 === 0 ? cmp(n / 2) : frac((n - 1) / 2);
      } }],
    ];
  },
  '10.02': () => [
    [{ text: 'Misleading (M) or fair (F)?', gen: (i) => { const X = [['The vertical axis starts at 0.', 'F'], ['The vertical axis starts at 90.', 'M'], ['The columns are different widths.', 'M'], ['The scale has equal steps.', 'F'], ['The scale jumps 10, 50, 60.', 'M'], ['A picture is enlarged in two directions.', 'M'], ['It has a title and labelled axes.', 'F'], ['It is drawn in 3D so the front looks bigger.', 'M'], ['Each picture stands for the same amount.', 'F'], ['The axis has no numbers.', 'M'], ['The sectors add to 100%.', 'F'], ['The sectors add to 130%.', 'M'], ['There is a break mark on the axis.', 'F'], ['Some months are left out.', 'M']]; const x = X[i % X.length]; return i >= X.length ? null : { q: x[0], a: x[1] }; } }],
    [{ text: 'What makes the graph misleading? Write the problem, then how to fix it.', gen: (i) => { const X = [['The y-axis goes 0, 5, 10, 50, 100.', 'uneven scale', 'use equal steps'], ['The y-axis starts at 1000.', 'axis does not start at 0', 'start the axis at 0 (or show a break)'], ['A picture twice as tall is also twice as wide.', 'picture looks 4 times as big', 'enlarge in one direction only'], ['The axes have no titles.', 'missing labels', 'label both axes'], ['Only the months with rising sales are shown.', 'data left out', 'show every month'], ['A 3D sector graph is tilted.', 'front sectors look bigger', 'draw it flat']]; const x = X[i % X.length]; return i >= X.length ? null : { q: x[0], a: `${x[1]}; ${x[2]}`, lines: [`problem: ${x[1]}`, `fix: ${x[2]}`] }; } }],
    [{ text: 'The axis starts above 0. How many times taller does column B look? How many times bigger is it really (1 d.p.)?', gen: (i) => { const X = [[92, 96, 90], [51, 54, 50], [22, 30, 20], [105, 110, 100], [72, 80, 70], [11, 14, 10], [62, 68, 60]]; const [a, b, s] = X[i % X.length]; return i >= X.length ? null : { q: `A = ${a}, B = ${b}, axis starts at ${s}`, a: `looks ${fmt((b - s) / (a - s), 1)} times; really ${d1(b / a)} times`, lines: [`drawn: ${b - s} ÷ ${a - s} = ${fmt((b - s) / (a - s), 1)}`, `real: ${b} ÷ ${a} = ${d1(b / a)}`] }; } }],
  ],
  '10.03': ({ ri }) => {
    const d = [...Array.from({ length: 16 }, () => ri(3, 9)), 14];
    const dp = G.dotPlot({ title: 'Minutes to get to school', min: 2, max: 15, counts: counts(d), xTitle: 'Minutes', w: 64 });
    return [
      [{ text: 'Find the mode: the value that occurs most often.', gen: () => { const xs = Array.from({ length: 7 }, () => ri(1, 9)); const m = modes(xs); return m === 'no mode' || m.includes('and') ? { q: '' } : { q: L(xs), a: m }; } }],
      [{ text: 'Use the dot plot. Count the dots carefully.', fig: dp, fh: 40, gen: (i) => { const Q = [['How many values?', d.length], ['What is the mode?', modes(d)], ['What is the range?', range(d)], ['What is the smallest value?', Math.min(...d)], ['Which value is an outlier?', Math.max(...d)], [`How many took more than 6 minutes?`, d.filter((x) => x > 6).length]]; if (i >= Q.length) return null; const [q, a] = Q[i]; return { q, a: String(a), lines: [q.includes('range') ? `${Math.max(...d)} − ${Math.min(...d)}` : 'count from the plot', `= ${a}`] }; } }],
      [{ text: 'Draw a dot plot on the back of the sheet, then find the mode and the range.', gen: () => { const xs = Array.from({ length: 10 }, () => ri(1, 8)); const m = modes(xs); if (m === 'no mode') return { q: '' }; return { q: L(xs), a: `mode ${m}, range ${range(xs)}`, lines: [`ordered: ${L(sorted(xs))}`, `mode: ${m}`, `range: ${Math.max(...xs)} − ${Math.min(...xs)} = ${range(xs)}`] }; } }],
    ];
  },
  '10.04': ({ ri }) => {
    const d = Array.from({ length: 15 }, () => ri(21, 68)), rows = slRows(d);
    const fig = G.stemLeaf({ title: 'Test scores', rows, key: '2 | 7 = 27' });
    return [
      [{ text: 'Write the value shown (key: 3 | 4 means 34).', gen: () => { const s = ri(1, 9), l = ri(0, 9); return { q: `${s} | ${l}`, a: `${s}${l}` }; } }],
      [{ text: 'Use the stem-and-leaf plot. Read the leaves with their stem.', fig, fh: 16 + 6 * rows.length, gen: (i) => { const Q = [['How many scores are there?', d.length, 'count the leaves'], ['What is the lowest score?', Math.min(...d), 'first leaf, first row'], ['What is the highest score?', Math.max(...d), 'last leaf, last row'], ['What is the range?', range(d), `${Math.max(...d)} − ${Math.min(...d)}`], [`How many scores are in the ${rows[1][0]}0s?`, rows[1][1].length, `count the ${rows[1][0]} row`], ['How many scores are 50 or more?', d.filter((x) => x >= 50).length, 'count rows 5 and 6']]; if (i >= Q.length) return null; const [q, a, w] = Q[i]; return { q, a: String(a), lines: [w, `= ${a}`] }; } }],
      [{ text: 'Write an ordered stem-and-leaf plot for the data. Include a key.', gen: () => { const xs = Array.from({ length: 8 }, () => ri(12, 49)); return { q: L(xs), a: slText(xs).replace(/<br>/g, '; '), lines: [`ordered: ${L(sorted(xs))}`, ...slRows(xs).map(([st, l]) => `${st} | ${l.join(' ')}`)] }; } }],
    ];
  },
  '10.05': ({ ri }) => [
    [{ text: 'Find the mean: add the values, then divide by how many there are.', gen: () => { const k = ri(3, 5), xs = Array.from({ length: k }, () => ri(1, 20)); return sum(xs) % k ? { q: '' } : { q: L(xs), a: String(mean(xs)) }; } }],
    [{ text: 'Find the mean. Show the total and the division. Round to 1 d.p.', gen: () => { const xs = Array.from({ length: ri(4, 6) }, () => ri(5, 40)); return { q: L(xs), a: d1(mean(xs)), lines: [`total: ${xs.join(' + ')} = ${sum(xs)}`, `mean: ${sum(xs)} ÷ ${xs.length} = ${d1(mean(xs))}`] }; } }],
    [{ text: 'The mean is given. Find the missing value. Work out the total first.', gen: () => { const k = ri(3, 5), m = ri(5, 20), xs = Array.from({ length: k - 1 }, () => ri(1, 2 * m)); const last = m * k - sum(xs); return last < 0 ? { q: '' } : { q: `${L(xs)}, ?  (mean ${m})`, a: String(last), lines: [`total must be ${m} × ${k} = ${m * k}`, `known: ${sum(xs)}`, `missing: ${m * k} − ${sum(xs)} = ${last}`] }; } }],
  ],
  '10.06': ({ ri }) => [
    [{ text: 'Find the median: order the values, then take the middle one.', gen: () => { const xs = Array.from({ length: 5 }, () => ri(1, 30)); return { q: L(xs), a: String(median(xs)) }; } },
      { text: 'Find the range: largest − smallest.', gen: () => { const xs = Array.from({ length: 5 }, () => ri(1, 50)); return { q: L(xs), a: String(range(xs)) }; } }],
    [{ text: 'Even number of values: order them, then halve the sum of the middle two.', gen: () => { const xs = Array.from({ length: ri(2, 3) * 2 }, () => ri(1, 40)); const s = sorted(xs), m = s.length / 2; return { q: L(xs), a: fmt(median(xs), 1), lines: [`ordered: ${L(s)}`, `(${s[m - 1]} + ${s[m]}) ÷ 2 = ${fmt(median(xs), 1)}`] }; } }],
    [{ text: 'Find the median and the range. Show the ordered list.', gen: () => { const xs = Array.from({ length: ri(6, 8) }, () => ri(10, 60)); return { q: L(xs), a: `median ${fmt(median(xs), 1)}, range ${range(xs)}`, lines: [`ordered: ${L(sorted(xs))}`, `median: ${fmt(median(xs), 1)}`, `range: ${Math.max(...xs)} − ${Math.min(...xs)} = ${range(xs)}`] }; } }],
  ],
  '10.07': ({ ri }) => {
    const d = Array.from({ length: 11 }, () => ri(32, 78)), fig = G.stemLeaf({ title: 'Heights of seedlings (mm)', rows: slRows(d), key: '4 | 5 = 45 mm' });
    const e = [...Array.from({ length: 13 }, () => ri(5, 9)), 1], dp = G.dotPlot({ title: 'Hours of sleep', min: 0, max: 10, counts: counts(e), xTitle: 'Hours', w: 64 });
    return [
      [{ text: 'Use the stem-and-leaf plot.', fig, fh: 16 + 6 * slRows(d).length, gen: (i) => { const Q = [['How many values?', d.length], ['Lowest value', Math.min(...d)], ['Highest value', Math.max(...d)], ['Range', range(d)], ['Median', median(d)], ['Values below 50', d.filter((x) => x < 50).length]]; return i >= Q.length ? null : { q: Q[i][0], a: String(Q[i][1]) }; } },
       { text: 'Find the range of each stem-and-leaf plot (key 2 | 3 = 23).', gen: () => { const xs = Array.from({ length: 6 }, () => ri(10, 69)); return { q: slText(xs), a: String(range(xs)) }; } }],
      [{ text: 'Use the dot plot. Show how you found each answer.', fig: dp, fh: 40, gen: (i) => { const Q = [['Find the median.', median(e), `${e.length} values: the middle ones`], ['Find the mean (1 d.p.).', d1(mean(e)), `${sum(e)} ÷ ${e.length}`], ['Find the range.', range(e), `${Math.max(...e)} − ${Math.min(...e)}`], ['Find the mode.', modes(e), 'tallest column of dots']]; return i >= Q.length ? null : { q: Q[i][0], a: String(Q[i][1]), lines: [Q[i][2], `= ${Q[i][1]}`] }; } },
       { text: 'Find the median of the stem-and-leaf plot. Count to the middle leaf.', gen: () => { const xs = Array.from({ length: 7 }, () => ri(10, 59)); return { q: slText(xs), a: String(median(xs)), lines: [`7 values: the 4th`, `median = ${median(xs)}`] }; } }],
      [{ text: 'Find the mean and the median with and without the outlier. Which changes most?', gen: () => { const xs = [...Array.from({ length: 6 }, () => ri(10, 20)), ri(40, 60)]; const w = xs.slice(0, -1); return { q: L(xs), a: `mean ${d1(mean(xs))} → ${d1(mean(w))}; median ${median(xs)} → ${fmt(median(w), 1)}; the mean`, lines: [`with: mean ${d1(mean(xs))}, median ${median(xs)}`, `without ${xs[6]}: mean ${d1(mean(w))}, median ${fmt(median(w), 1)}`, 'the mean changes most'] }; } }],
    ];
  },
  '10.08': ({ ri }) => [
    [{ text: 'Which group is more consistent? (Smaller range.)', gen: () => { const a = ri(3, 30), b = ri(3, 30); return a === b ? { q: '' } : { q: `A: range ${a}, B: range ${b}`, a: a < b ? 'A' : 'B' }; } }],
    [{ text: 'Find the mean of each group. Which group has the higher mean?', gen: () => { const a = Array.from({ length: 4 }, () => ri(2, 20)), b = Array.from({ length: 4 }, () => ri(2, 20)); if (mean(a) === mean(b)) return { q: '' }; return { q: `A: ${L(a)}<br>B: ${L(b)}`, a: `${mean(a) > mean(b) ? 'A' : 'B'}`, lines: [`A: ${sum(a)} ÷ 4 = ${fmt(mean(a), 2)}`, `B: ${sum(b)} ÷ 4 = ${fmt(mean(b), 2)}`, `higher mean: ${mean(a) > mean(b) ? 'A' : 'B'}`] }; } }],
    [{ text: 'Compare the two classes: find the mean and the range of each, then write a sentence.', gen: () => { const a = Array.from({ length: 5 }, () => ri(5, 20)), b = Array.from({ length: 5 }, () => ri(5, 20)); if (mean(a) === mean(b) || range(a) === range(b)) return { q: '' }; return { q: `Class A: ${L(a)}<br>Class B: ${L(b)}`, a: `A mean ${d1(mean(a))}, range ${range(a)}; B mean ${d1(mean(b))}, range ${range(b)}`, lines: [`A: mean ${d1(mean(a))}, range ${range(a)}`, `B: mean ${d1(mean(b))}, range ${range(b)}`, `${mean(a) > mean(b) ? 'A' : 'B'} did better; ${range(a) < range(b) ? 'A' : 'B'} is more consistent`] }; } }],
  ],
};
