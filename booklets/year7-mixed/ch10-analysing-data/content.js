// Chapter 10 Analysing data: mixed-practice questions (lib/mixed.js). Every question stands on its own.
const G = require('../../lib/graphs');
const S = require('../../lib/stats');
const { fmt, F } = require('../../lib/calc');

const N = (v) => fmt(v, 2);
const sorted = (xs) => [...xs].sort((a, b) => a - b);
const counts = (xs) => { const c = {}; xs.forEach((x) => { c[x] = (c[x] || 0) + 1; }); return c; };
const list = (xs) => xs.map(N).join(', ');
const slRows = (xs) => { const lo = Math.floor(Math.min(...xs) / 10), hi = Math.floor(Math.max(...xs) / 10); const r = []; for (let s = lo; s <= hi; s++) r.push([s, sorted(xs).filter((x) => Math.floor(x / 10) === s).map((x) => x % 10)]); return r; };
// n whole numbers from lo to hi whose total divides by n (so the mean is a whole number).
const dataSet = (K, n, lo, hi) => { for (let t = 0; t < 50; t++) { const xs = Array.from({ length: n }, () => K.ri(lo, hi)); if (xs.reduce((a, b) => a + b, 0) % n === 0) return xs; } return null; };
const modeOk = (xs) => S.modes(xs).length === 1 && Object.values(counts(xs)).filter((c) => c === Math.max(...Object.values(counts(xs)))).length === 1;
const SPORTS = ['Soccer', 'Netball', 'Cricket', 'Swim', 'Tennis'];
const FILLS = [G.C.blue, G.C.sand, G.C.lightBlue, G.C.grey];
const pie = (slices, title) => G.sectorGraph({ title, slices: slices.map(([l, v], i) => [l, v, FILLS[i % 4]]), w: 70, h: 48 });
const col = (cats, values, o = {}) => G.columnGraph({ title: 'Favourite sport', cats, values, max: Math.ceil(Math.max(...values) / 2) * 2 + 2, step: 2, labelEvery: 2, yTitle: 'Students', w: 64, h: 46, ...o });
const dots = (xs, lo, hi, t) => G.dotPlot({ title: t, min: lo, max: hi, counts: counts(xs), w: 62 });
const NAMES = ['Ali', 'Mia', 'Zac', 'Lena', 'Kai', 'Ruby', 'Tom', 'Priya', 'Jack', 'Aisha', 'Noah', 'Chloe'];

module.exports = {
  '10.01': {
    idea: 'Read the title, the axis labels and the scale first. Then read the value off the graph. A sector graph shows parts of a whole: the full circle is 100%.',
    ex: [['How many students chose Netball?', ['scale goes up in 2s', '8 students'], col(SPORTS.slice(0, 4), [6, 8, 4, 10])], ['How many more chose Cricket than Soccer?', ['Cricket 10, Soccer 6', '10 − 6 = 4']], ['What fraction of the students chose Soccer?', ['total 6 + 8 + 4 + 10 = 28', `${F(6, 28)} = ${F(3, 14)}`]]],
    exFh: 34, exH: 72,
    look: ['4.12'],
    e: [
      (K) => { const v = SPORTS.slice(0, 4).map(() => K.ri(1, 7) * 2), k = K.ri(0, 3); return { q: `How many students chose ${SPORTS[k]}?`, fig: col(SPORTS.slice(0, 4), v), fh: 36, a: N(v[k]) }; },
      (K) => { const v = SPORTS.slice(0, 4).map(() => K.ri(1, 7) * 2); return new Set(v).size < 4 ? null : { q: 'Which sport was the most popular?', fig: col(SPORTS.slice(0, 4), v), fh: 36, a: SPORTS[v.indexOf(Math.max(...v))] }; },
      (K) => { const slices = K.pick([[['Bus', 50], ['Car', 25], ['Walk', 25]], [['Bus', 25], ['Car', 50], ['Bike', 25]], [['Dog', 50], ['Cat', 25], ['Fish', 12.5], ['Bird', 12.5]]]), k = K.ri(0, slices.length - 1); return { q: `What percentage of the class chose ${slices[k][0]}?`, fig: pie(slices, slices[0][0] === 'Dog' ? 'Favourite pet' : 'How students get to school'), fh: 34, a: `${N(slices[k][1])}%`, key: slices.map((s) => s.join()).join() + k }; },
    ],
    m: [
      (K) => { const v = SPORTS.slice(0, 4).map(() => K.ri(1, 7) * 2), [p, q] = K.shuffle([0, 1, 2, 3]), [a, b] = v[p] > v[q] ? [p, q] : [q, p]; return v[a] === v[b] ? null : { q: `How many more students chose ${SPORTS[a]} than ${SPORTS[b]}?`, fig: col(SPORTS.slice(0, 4), v), fh: 36, w: [`${SPORTS[a]} ${v[a]}, ${SPORTS[b]} ${v[b]}`, `${v[a]} − ${v[b]} = ${v[a] - v[b]}${v[a] < v[b] ? ' (fewer)' : ''}`] }; },
      (K) => { const v = SPORTS.slice(0, 4).map(() => K.ri(1, 7) * 2); const t = v.reduce((a, b) => a + b, 0); return { q: 'How many students were surveyed altogether?', fig: col(SPORTS.slice(0, 4), v), fh: 36, w: [v.join(' + '), `= ${t}`] }; },
      (K) => { const ys = [K.ri(14, 20)]; for (let i = 1; i < 6; i++) ys.push(Math.min(34, Math.max(10, ys[i - 1] + K.ri(-2, 5)))); const xs = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']; const i = ys.indexOf(Math.max(...ys)); return { q: 'In which month was it warmest? By how much did it change from January to June?', fig: G.lineGraph({ title: 'Mean maximum temperature', xs, ys, max: 35, yMin: 10, step: 5, labelEvery: 5, yTitle: '°C', xTitle: 'Month', w: 62, h: 46 }), fh: 34, w: [`warmest: ${xs[i]} (${ys[i]}°C)`, `${ys[5]} − ${ys[0]} = ${ys[5] - ys[0]}°C`] }; },
    ],
    c: [
      (K) => { const v = SPORTS.slice(0, 4).map(() => K.ri(1, 7) * 2), k = K.ri(0, 3); const t = v.reduce((a, b) => a + b, 0); return { q: `What percentage of the students chose ${SPORTS[k]}? Round to a whole number.`, fig: col(SPORTS.slice(0, 4), v), fh: 36, w: [`${v[k]} out of ${t}`, `${v[k]} ÷ ${t} × 100 ≈ ${Math.round((v[k] / t) * 100)}%`] }; },
      (K) => { const total = K.pick([40, 60, 80, 120]), slices = [['Bus', 50], ['Car', 25], ['Walk', 25]]; return { q: `${total} students were surveyed. How many walk to school?`, fig: pie(slices, 'How students get to school'), fh: 34, w: [`Walk is 25% (a quarter)`, `${total} ÷ 4 = ${total / 4} students`], key: `walk${total}` }; },
      (K) => { const per = K.pick([2, 4, 5, 10]), rows = [['Mon', K.ri(2, 6)], ['Tue', K.ri(1, 6) + 0.5], ['Wed', K.ri(2, 6)]]; const k = K.ri(0, 2); return { q: `Each symbol stands for ${per} books. How many books were borrowed on ${rows[k][0]}?`, fig: G.pictureGraph({ title: 'Library books borrowed', rows, key: `${per} books`, w: 64, labelW: 12 }), fh: 30, w: [`${N(rows[k][1])} symbols`, `${N(rows[k][1])} × ${per} = ${N(rows[k][1] * per)} books`] }; },
    ],
  },

  '10.02': {
    idea: 'A graph can mislead: a scale that does not start at 0, an uneven scale, a picture that grows in two directions, or missing labels. Always read the numbers, not just the size of the bars.',
    ex: [['Why is this graph misleading?', ['the scale starts at 50, not 0', 'small differences look big'], G.columnGraph({ title: 'Sales', cats: ['A', 'B', 'C'], values: [52, 56, 54], max: 58, yMin: 50, step: 2, labelEvery: 2, breakAxis: true, yTitle: 'Sales', w: 60, h: 44 })], ['Bar B looks 3 times as tall as bar A. Is B really 3 times A?', ['A is 52, B is 56', 'no: only 4 more']], ['A scale goes 0, 10, 20, 50, 100 with equal gaps. What is wrong?', ['the gaps are not equal steps', 'uneven scale']]],
    exFh: 34, exH: 72,
    look: ['10.01'],
    e: [
      (K) => { const base = K.pick([50, 100, 200]), v = [base + K.ri(1, 4) * 2, base + K.ri(5, 8) * 2]; return { q: 'Where does the vertical scale start? Why could this mislead?', fig: G.columnGraph({ title: 'Election votes', cats: ['Us', 'Them'], values: v, max: base + 18, yMin: base, step: 2, labelEvery: 4, breakAxis: true, yTitle: 'Votes', w: 56, h: 44 }), fh: 34, a: `at ${base}; the difference looks bigger than it is`, n: 2 }; },
      (K) => { const [q, a] = K.pick([['A graph has no labels on its axes. Why is that a problem?', 'You cannot tell what is being measured or in what units.'], ['A graph has no title. Why is that a problem?', 'You cannot tell what the data is about.'], ['A picture graph uses a bigger picture for a bigger number, making it taller and wider. Why can this mislead?', 'The area grows much faster than the number, so it looks far bigger.']]); return { q, a, n: 2, key: q }; },
    ],
    m: [
      (K) => { const base = K.pick([40, 60, 80]), a = base + K.ri(1, 3) * 2, b = base + K.ri(6, 9) * 2; return { q: `Bar A is ${a} and bar B is ${b}. The scale starts at ${base}. How many times as tall does B look? How many times as big is B really?`, w: [`looks: ${b - base} ÷ ${a - base} = ${N((b - base) / (a - base))} times`, `really: ${b} ÷ ${a} ≈ ${N(b / a)} times`] }; },
      (K) => { const ticks = K.pick([[0, 10, 20, 50, 100], [0, 5, 10, 50, 100], [0, 100, 200, 500, 1000]]); return { q: `A scale is marked ${ticks.join(', ')} with equal gaps. What is wrong with it?`, a: 'The steps are not equal, so the bars are not in proportion.', n: 2, key: ticks.join() }; },
    ],
    c: [
      (K) => { const base = K.pick([50, 100]), v = [base + K.ri(1, 3) * 2, base + K.ri(4, 6) * 2, base + K.ri(7, 9) * 2]; return { q: 'Redraw this graph so it is not misleading. What would you change?', fig: G.columnGraph({ title: 'Sales', cats: ['A', 'B', 'C'], values: v, max: base + 20, yMin: base, step: 2, labelEvery: 4, breakAxis: true, yTitle: 'Sales', w: 56, h: 44 }), fh: 34, a: 'Start the vertical scale at 0 (with even steps), so the bars are in proportion.', n: 2 }; },
      (K) => { const who = K.pick(NAMES), a = K.ri(20, 30), b = a + K.ri(1, 3); return { q: `${who}'s ad says sales "rocketed" from ${a} to ${b} thousand, with a graph whose scale starts at ${a - 1} thousand. Is "rocketed" fair? Explain.`, a: `No. The rise is only ${b - a} thousand (about ${Math.round(((b - a) / a) * 100)}%); the cut scale makes it look huge.`, n: 2 }; },
    ],
  },

  '10.03': {
    idea: 'In a dot plot each dot is one value, stacked above the number line. Count the dots for the number of values. The tallest stack is the most common value.',
    ex: [['How many values are in the dot plot?', ['count every dot', '12'], dots([2, 3, 3, 4, 4, 4, 4, 5, 5, 6, 8, 3], 1, 9)], ['Which value is the most common?', ['tallest stack', '4']], ['Draw a dot plot of 1, 3, 3, 4, 4, 4, 6.', ['number line from 1 to 6', 'one dot for each value']]],
    exFh: 30, exH: 70,
    look: ['10.01'],
    e: [
      (K) => { const xs = Array.from({ length: K.ri(9, 14) }, () => K.ri(1, 8)); return { q: 'How many values are in the dot plot?', fig: dots(xs, 0, 9), fh: 26, a: N(xs.length) }; },
      (K) => { const xs = Array.from({ length: K.ri(9, 14) }, () => K.ri(1, 8)); return !modeOk(xs) ? null : { q: 'Which value is the most common?', fig: dots(xs, 0, 9), fh: 26, a: N(S.modes(xs)[0]) }; },
      (K) => { const xs = Array.from({ length: K.ri(9, 14) }, () => K.ri(1, 8)), v = K.ri(2, 7); return { q: `How many values are more than ${v}?`, fig: dots(xs, 0, 9), fh: 26, a: N(xs.filter((x) => x > v).length) }; },
    ],
    m: [
      (K) => { const xs = sorted(Array.from({ length: 8 }, () => K.ri(2, 9))); return { q: `Draw a dot plot of ${list(K.shuffle(xs))}.`, fig: G.dotPlotTemplate({ min: 0, max: 10, w: 62, h: 18 }), n: 0, a: `dots: ${Object.entries(counts(xs)).map(([v, c]) => `${v}×${c}`).join(', ')}` }; },
      (K) => { const xs = Array.from({ length: K.ri(10, 14) }, () => K.ri(3, 7)); xs.push(K.pick([0, 10])); return { q: 'Is there an outlier (a value far from the others)? What is it?', fig: dots(xs, 0, 10), fh: 26, a: `yes: ${xs[xs.length - 1]}` }; },
      (K) => { const xs = Array.from({ length: K.ri(10, 14) }, () => K.ri(1, 8)), v = K.ri(3, 6); return { q: `What fraction of the values are less than ${v}?`, fig: dots(xs, 0, 9), fh: 26, w: [`${xs.filter((x) => x < v).length} out of ${xs.length}`, F(xs.filter((x) => x < v).length, xs.length)] }; },
    ],
    c: [
      (K) => { const xs = Array.from({ length: K.ri(10, 14) }, () => K.ri(2, 8)); return { q: 'Describe the data: where is the cluster, and what is the spread?', fig: dots(xs, 0, 10), fh: 26, w: [`most values between ${Math.min(...xs)} and ${Math.max(...xs)}`, `cluster around ${S.median(xs)}`] }; },
      (K) => { const xs = Array.from({ length: 10 }, () => K.ri(1, 6)); return { q: 'Some students were asked how many pets they have. What percentage have 3 or more?', fig: dots(xs, 0, 7), fh: 26, w: [`${xs.filter((x) => x >= 3).length} out of 10`, `${xs.filter((x) => x >= 3).length * 10}%`] }; },
    ],
  },

  '10.04': {
    idea: 'In a stem-and-leaf plot, the stem is the tens digit and each leaf is a units digit: 3 | 5 means 35. An ordered plot has its leaves from smallest to largest.',
    ex: [['Write the values in the second row.', ['stem 3, leaves 2, 5, 7', '32, 35, 37'], G.stemLeaf({ rows: [[2, [4, 8]], [3, [2, 5, 7]], [4, [1, 6]]], key: '2 | 4 = 24' })], ['How many values are in the plot?', ['count the leaves', '7']], ['Draw an ordered stem-and-leaf plot of 43, 27, 35, 41, 29, 38.', ['stems 2, 3, 4', '2 | 7 9, 3 | 5 8, 4 | 1 3']]],
    exFh: 30, exH: 70,
    look: ['10.03'],
    e: [
      (K) => { const xs = Array.from({ length: K.ri(8, 11) }, () => K.ri(12, 49)); const rows = slRows(xs), r = K.pick(rows.filter((x) => x[1].length)); return { q: `Write the values in the row with stem ${r[0]}.`, fig: G.stemLeaf({ rows, key: `${rows[0][0]} | 5 = ${rows[0][0]}5` }), a: r[1].map((l) => r[0] * 10 + l).join(', ') }; },
      (K) => { const xs = Array.from({ length: K.ri(8, 12) }, () => K.ri(12, 49)); return { q: 'How many values are in the plot?', fig: G.stemLeaf({ rows: slRows(xs), key: '2 | 5 = 25' }), a: N(xs.length) }; },
      (K) => { const xs = Array.from({ length: K.ri(8, 11) }, () => K.ri(12, 59)); return { q: 'What are the smallest and the largest values?', fig: G.stemLeaf({ rows: slRows(xs), key: '2 | 5 = 25' }), a: `${Math.min(...xs)} and ${Math.max(...xs)}` }; },
    ],
    m: [
      (K) => { const xs = Array.from({ length: 8 }, () => K.ri(21, 58)); return { q: `Draw an ordered stem-and-leaf plot of ${list(xs)}.`, w: slRows(xs).map(([s, l]) => `${s} | ${l.join(' ')}`).slice(0, 4), n: 3 }; },
      (K) => { const xs = Array.from({ length: K.ri(9, 12) }, () => K.ri(30, 79)), v = K.ri(45, 65); return { q: `How many values are ${v} or more?`, fig: G.stemLeaf({ rows: slRows(xs), key: '3 | 5 = 35' }), a: N(xs.filter((x) => x >= v).length) }; },
    ],
    c: [
      (K) => { const xs = Array.from({ length: 10 }, () => K.ri(40, 99)); const pass = xs.filter((x) => x >= 50).length; return { q: 'These are test marks out of 100. The pass mark is 50. What percentage passed?', fig: G.stemLeaf({ rows: slRows(xs), key: '6 | 3 = 63' }), w: [`${pass} out of 10 passed`, `${pass * 10}%`] }; },
      (K) => { const xs = Array.from({ length: 9 }, () => K.ri(12, 48)); return { q: 'Which stem has the most leaves? What does that tell you?', fig: G.stemLeaf({ rows: slRows(xs), key: '1 | 2 = 12' }), w: [`stem ${slRows(xs).sort((a, b) => b[1].length - a[1].length)[0][0]}`, 'most values are in that ten'] }; },
    ],
  },

  '10.05': {
    idea: 'The mean is the total divided by how many values: the "fair share". The mode is the value that occurs most often (there can be more than one, or none).',
    ex: [['Find the mean of 4, 7, 9, 6, 9.', ['total 35, 5 values', '35 ÷ 5 = 7']], ['Find the mode of 4, 7, 9, 6, 9.', ['9 occurs twice', 'mode 9']], ['The mean of 5 numbers is 8. Four of them are 6, 9, 7, 10. Find the fifth.', ['total 5 × 8 = 40', '40 − 32 = 8']]],
    look: ['10.03', '3.03'],
    e: [
      (K) => { const xs = dataSet(K, K.ri(4, 6), 1, 12); return !xs ? null : { q: `Find the mean of ${list(xs)}.`, a: N(S.mean(xs)) }; },
      (K) => { const xs = Array.from({ length: 7 }, () => K.ri(1, 9)); return !modeOk(xs) ? null : { q: `Find the mode of ${list(xs)}.`, a: N(S.modes(xs)[0]) }; },
      (K) => { const xs = dataSet(K, 4, 10, 40); return !xs ? null : { q: `Find the total of ${list(xs)}, then the mean.`, a: `${xs.reduce((a, b) => a + b, 0)}; ${N(S.mean(xs))}` }; },
    ],
    m: [
      (K) => { const xs = dataSet(K, K.ri(5, 7), 10, 60); return !xs ? null : { q: `Find the mean of ${list(xs)}.`, w: [`total: ${xs.reduce((a, b) => a + b, 0)}`, `${xs.reduce((a, b) => a + b, 0)} ÷ ${xs.length} = ${N(S.mean(xs))}`] }; },
      (K) => { const xs = Array.from({ length: 6 }, () => K.ri(15, 40)); const m = S.mean(xs); return { q: `Find the mean of ${list(xs)}, to 1 decimal place.`, w: [`${xs.reduce((a, b) => a + b, 0)} ÷ ${xs.length}`, `≈ ${(Math.round(m * 10) / 10).toFixed(1)}`] }; },
      (K) => { const xs = dataSet(K, 5, 2, 10); return !xs ? null : { q: `${K.pick(NAMES)} scored ${list(xs)} goals in five games. Find the mean and the mode.`, w: [`mean: ${xs.reduce((a, b) => a + b, 0)} ÷ 5 = ${N(S.mean(xs))}`, `mode: ${S.modeText(xs)}`] }; },
    ],
    c: [
      (K) => { const n = 5, m = K.ri(6, 15), xs = Array.from({ length: 4 }, () => K.ri(m - 4, m + 4)); const last = n * m - xs.reduce((a, b) => a + b, 0); return last < 0 ? null : { q: `The mean of five numbers is ${m}. Four of them are ${list(xs)}. Find the fifth.`, w: [`total: 5 × ${m} = ${n * m}`, `${n * m} − ${xs.reduce((a, b) => a + b, 0)} = ${last}`] }; },
      (K) => { const xs = dataSet(K, 4, 60, 90); if (!xs) return null; const t = xs.reduce((a, b) => a + b, 0), want = S.mean(xs) + 2; return { q: `Test marks: ${list(xs)}. What must the next mark be to make the mean ${N(want)}?`, w: [`new total: 5 × ${N(want)} = ${N(5 * want)}`, `${N(5 * want)} − ${t} = ${N(5 * want - t)}`] }; },
      (K) => { const xs = dataSet(K, 5, 3, 12); if (!xs) return null; return { q: `Find the mean of ${list(xs)}. Then add 10 to every value. What is the new mean?`, w: [`mean: ${N(S.mean(xs))}`, `new mean: ${N(S.mean(xs) + 10)} (10 more)`] }; },
    ],
  },

  '10.06': {
    idea: 'The median is the middle value when the data is in order: for an even number of values, it is halfway between the two middle ones. The range is the largest value minus the smallest.',
    ex: [['Find the median of 8, 3, 9, 5, 6.', ['in order: 3, 5, 6, 8, 9', 'median 6']], ['Find the median of 4, 10, 7, 2.', ['in order: 2, 4, 7, 10', '(4 + 7) ÷ 2 = 5.5']], ['Find the range of 12, 25, 18, 9, 21.', ['largest 25, smallest 9', '25 − 9 = 16']]],
    look: ['10.05'],
    e: [
      (K) => { const xs = Array.from({ length: K.pick([5, 7]) }, () => K.ri(1, 20)); return { q: `Find the median of ${list(xs)}.`, a: N(S.median(xs)) }; },
      (K) => { const xs = Array.from({ length: K.ri(5, 7) }, () => K.ri(1, 50)); return { q: `Find the range of ${list(xs)}.`, a: N(S.range(xs)) }; },
      (K) => { const xs = Array.from({ length: K.ri(5, 7) }, () => K.ri(1, 30)); return { q: `Write ${list(xs)} in order, smallest first.`, a: list(sorted(xs)) }; },
    ],
    m: [
      (K) => { const xs = Array.from({ length: K.pick([6, 8]) }, () => K.ri(1, 30)); return { q: `Find the median of ${list(xs)}.`, w: [`in order: ${list(sorted(xs))}`, `median: ${N(S.median(xs))}`] }; },
      (K) => { const xs = Array.from({ length: K.pick([5, 7]) }, () => K.ri(10, 60)); return { q: `Find the median and the range of ${list(xs)}.`, w: [`in order: ${list(sorted(xs))}`, `median ${N(S.median(xs))}, range ${N(S.range(xs))}`] }; },
      (K) => { const xs = Array.from({ length: 6 }, () => -K.ri(1, 9) + K.ri(0, 6)); return { q: `Morning temperatures (°C): ${list(xs)}. Find the range.`, w: [`highest ${N(Math.max(...xs))}, lowest ${N(Math.min(...xs))}`, `${N(Math.max(...xs))} − ${Math.min(...xs) < 0 ? `(${N(Math.min(...xs))})` : N(Math.min(...xs))} = ${N(S.range(xs))}°C`] }; },
    ],
    c: [
      (K) => { const xs = Array.from({ length: 5 }, () => K.ri(10, 30)), r = S.range(xs), hi = Math.max(...xs); return { q: `The range of a set is ${r}. The largest value is ${hi}. What is the smallest?`, w: [`${hi} − smallest = ${r}`, `smallest = ${hi - r}`] }; },
      (K) => { const xs = Array.from({ length: 6 }, () => K.ri(5, 25)); const out = K.ri(70, 99); return { q: `Find the mean and the median of ${list([...xs, out])}. Which is the better "typical" value? Why?`, w: [`mean ${N(Math.round(S.mean([...xs, out]) * 10) / 10)}, median ${N(S.median([...xs, out]))}`, `median: the outlier ${out} pulls the mean up`] }; },
      (K) => { const a = K.ri(2, 8), b = a + K.ri(2, 6); return { q: `Four numbers have a median of ${N((a + b) / 2)}. The two middle numbers are ${a} and ☐. Find ☐.`, w: [`(${a} + ☐) ÷ 2 = ${N((a + b) / 2)}`, `☐ = ${b}`] }; },
    ],
  },

  '10.07': {
    idea: 'To find statistics from a plot, first list the values in order (a dot plot or an ordered stem-and-leaf plot already shows them in order). Then find the range, median, mode and mean.',
    ex: [['Find the range and the mode.', ['range 8 − 2 = 6', 'mode 4'], dots([2, 3, 3, 4, 4, 4, 5, 6, 8], 1, 9)], ['Find the median.', ['9 values: the 5th', 'median 4']], ['Find the mean.', ['total 39', '39 ÷ 9 ≈ 4.3']]],
    exFh: 30, exH: 70,
    look: ['10.06', '10.04'],
    e: [
      (K) => { const xs = Array.from({ length: K.ri(9, 12) }, () => K.ri(1, 9)); return { q: 'Find the range.', fig: dots(xs, 0, 10), fh: 26, a: N(S.range(xs)) }; },
      (K) => { const xs = Array.from({ length: K.ri(9, 12) }, () => K.ri(1, 9)); return !modeOk(xs) ? null : { q: 'Find the mode.', fig: dots(xs, 0, 10), fh: 26, a: N(S.modes(xs)[0]) }; },
      (K) => { const xs = Array.from({ length: K.ri(8, 10) }, () => K.ri(20, 59)); return { q: 'Find the range.', fig: G.stemLeaf({ rows: slRows(xs), key: '2 | 4 = 24' }), a: `${Math.max(...xs)} − ${Math.min(...xs)} = ${S.range(xs)}` }; },
    ],
    m: [
      (K) => { const xs = Array.from({ length: K.pick([9, 11]) }, () => K.ri(1, 9)); return { q: 'Find the median.', fig: dots(xs, 0, 10), fh: 26, w: [`${xs.length} values: the ${(xs.length + 1) / 2}th`, `median ${N(S.median(xs))}`] }; },
      (K) => { const xs = Array.from({ length: K.pick([7, 9]) }, () => K.ri(20, 59)); return { q: 'Find the median.', fig: G.stemLeaf({ rows: slRows(xs), key: '2 | 4 = 24' }), w: [`${xs.length} values: the ${(xs.length + 1) / 2}th`, `median ${N(S.median(xs))}`] }; },
      (K) => { const xs = dataSet(K, K.pick([8, 10]), 1, 9); return !xs ? null : { q: 'Find the mean.', fig: dots(xs, 0, 10), fh: 26, w: [`total ${xs.reduce((a, b) => a + b, 0)}, ${xs.length} values`, `mean ${N(S.mean(xs))}`] }; },
    ],
    c: [
      (K) => { const xs = dataSet(K, 8, 20, 59); return !xs ? null : { q: 'Find the mean, median and range.', fig: G.stemLeaf({ rows: slRows(xs), key: '2 | 4 = 24' }), w: [`mean ${xs.reduce((a, b) => a + b, 0)} ÷ 8 = ${N(S.mean(xs))}`, `median ${N(S.median(xs))}, range ${S.range(xs)}`] }; },
      (K) => { const xs = Array.from({ length: 10 }, () => K.ri(2, 8)); return { q: 'One more value of 10 is added. Which statistics change: range, median or mode?', fig: dots(xs, 0, 10), fh: 26, w: [`range ${S.range(xs)} → ${S.range([...xs, 10])}; median ${N(S.median(xs))} → ${N(S.median([...xs, 10]))}`, `mode: ${S.modeText(xs)} → ${S.modeText([...xs, 10])}`] }; },
    ],
  },

  '10.08': {
    idea: 'To compare two sets of data, compare a centre (the mean or median: which is higher?) and the spread (the range: which is more consistent?). Then write a sentence about what it means.',
    ex: [['Class A: 5, 7, 8, 8, 9. Class B: 3, 6, 8, 9, 10. Compare the medians.', ['A: 8, B: 8', 'the same']], ['Compare the ranges. Which class is more consistent?', ['A: 4, B: 7', 'A (smaller range)']], ['Which class did better overall? Use the mean.', ['A: 37 ÷ 5 = 7.4, B: 36 ÷ 5 = 7.2', 'A, just']]],
    look: ['10.07', '10.06'],
    e: [
      (K) => { const a = Array.from({ length: 5 }, () => K.ri(1, 20)), b = Array.from({ length: 5 }, () => K.ri(1, 20)); return S.range(a) === S.range(b) ? null : { q: `Set A: ${list(a)}. Set B: ${list(b)}. Which set has the larger range?`, a: `${S.range(a) > S.range(b) ? 'A' : 'B'} (${S.range(a)} and ${S.range(b)})` }; },
      (K) => { const a = Array.from({ length: 5 }, () => K.ri(1, 20)), b = Array.from({ length: 5 }, () => K.ri(1, 20)); return S.median(a) === S.median(b) ? null : { q: `Set A: ${list(a)}. Set B: ${list(b)}. Which set has the higher median?`, a: `${S.median(a) > S.median(b) ? 'A' : 'B'} (${N(S.median(a))} and ${N(S.median(b))})` }; },
    ],
    m: [
      (K) => { const a = dataSet(K, 5, 40, 80), b = dataSet(K, 5, 40, 80); return !a || !b || S.mean(a) === S.mean(b) ? null : { q: `Team A scored ${list(a)}. Team B scored ${list(b)}. Compare the means.`, w: [`A: ${N(S.mean(a))}, B: ${N(S.mean(b))}`, `${S.mean(a) > S.mean(b) ? 'A' : 'B'} has the higher mean`] }; },
      (K) => { const c = K.ri(10, 15), a = [c - 1, c, c, c + 1, c + 1].map((x) => x), b = [c - 6, c - 2, c, c + 3, c + 5]; return { q: `Runner A's times (s): ${list(a)}. Runner B's: ${list(b)}. Who is more consistent? Explain.`, w: [`ranges: A ${S.range(a)}, B ${S.range(b)}`, 'A: a smaller range means less spread'] }; },
    ],
    c: [
      (K) => { const a = Array.from({ length: 7 }, () => K.ri(20, 49)), b = Array.from({ length: 7 }, () => K.ri(25, 59)); const ra = slRows([...a, ...b]).map(([s]) => [sorted(a).filter((x) => Math.floor(x / 10) === s).map((x) => x % 10).reverse(), s, sorted(b).filter((x) => Math.floor(x / 10) === s).map((x) => x % 10)]); return { q: 'Compare the two classes using the medians and the ranges.', fig: G.backToBack({ left: 'Class A', right: 'Class B', rows: ra, key: '2 | 4 = 24' }), w: [`medians: A ${N(S.median(a))}, B ${N(S.median(b))}`, `ranges: A ${S.range(a)}, B ${S.range(b)}`] }; },
      (K) => { const a = dataSet(K, 6, 1, 6), b = dataSet(K, 6, 1, 6); return !a || !b ? null : { q: `Two dice were each rolled 6 times. Die A: ${list(a)}. Die B: ${list(b)}. Compare the mean and range of each.`, w: [`A: mean ${N(S.mean(a))}, range ${S.range(a)}`, `B: mean ${N(S.mean(b))}, range ${S.range(b)}`] }; },
    ],
  },
};
