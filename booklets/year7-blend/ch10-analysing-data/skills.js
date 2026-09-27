// Skill drill pages for Chapter 10 Analysing data: page 1 practises the Easy basics, page 2 the Medium basics (lib/drill.js).
const G = require('../../lib/graphs');
const { fmt } = require('../../lib/calc');

const sum = (xs) => xs.reduce((a, b) => a + b, 0);
const mean = (xs) => sum(xs) / xs.length;
const median = (xs) => { const s = [...xs].sort((a, b) => a - b), m = s.length / 2; return s.length % 2 ? s[Math.floor(m)] : (s[m - 1] + s[m]) / 2; };
const modes = (xs) => { const c = {}; xs.forEach((x) => { c[x] = (c[x] || 0) + 1; }); const top = Math.max(...Object.values(c)); return top === 1 ? 'no mode' : Object.keys(c).filter((k) => c[k] === top).join(' and '); };
const range = (xs) => Math.max(...xs) - Math.min(...xs);
const list = (xs) => xs.join(', ');
const data = (ri, k, lo, hi) => Array.from({ length: k }, () => ri(lo, hi));
const counts = (xs) => { const c = {}; xs.forEach((x) => { c[x] = (c[x] || 0) + 1; }); return c; };
// Stem-and-leaf rows from data: [[stem, [leaves…]], …]
const slRows = (xs) => { const s = [...xs].sort((a, b) => a - b), rows = []; for (let st = Math.floor(s[0] / 10); st <= Math.floor(s[s.length - 1] / 10); st++) rows.push([st, s.filter((x) => Math.floor(x / 10) === st).map((x) => x % 10)]); return rows; };
const slText = (xs) => slRows(xs).map(([st, l]) => `${st} | ${l.join(' ')}`).join('<br>');

module.exports = {
  '10.01': ({ ri, pick, shuffle, round }) => {
    const cats = shuffle(['Soccer', 'Netball', 'Cricket', 'Swim', 'Tennis', 'AFL']).slice(0, 5), vals = cats.map(() => ri(2, 18));
    const cg = G.columnGraph({ title: 'Favourite sport of Year 7', cats, values: vals, max: 20, step: 2, labelEvery: 4, yTitle: 'Students', w: 88, h: 56 });
    const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'], full = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const temps = months.map((_, i) => Math.round(24 + 7 * Math.cos(((i + 0.3) / 12) * 2 * Math.PI) + ri(-1, 1)));
    const lg = G.lineGraph({ title: 'Mean maximum temperature', xs: months, ys: temps, max: 35, yMin: 10, step: 5, labelEvery: 5, yTitle: '°C', xTitle: 'Month', w: 88, h: 52 });
    const total = sum(vals), top = cats[vals.indexOf(Math.max(...vals))];
    const i0 = ri(0, 4), i1 = (i0 + 2) % 5, m0 = ri(0, 11), m1 = (m0 + ri(3, 7)) % 12;
    return {
      easy: [
        { text: 'use the column graph. Read the scale carefully.', items: [...cats.map((c) => `How many chose ${c}?`), 'Which sport was most popular?', 'How many students were surveyed?', `How many more chose ${cats[i0]} than ${cats[i1]}?`], ans: [...vals.map(String), top, String(total), String(vals[i0] - vals[i1])], cols: 2, fig: cg },
        { text: 'use the line graph.', items: [`What was the temperature in ${full[m0]}?`, `What was the temperature in ${full[m1]}?`, 'Which month was hottest?', 'Which month was coldest?', `By how much did it change from ${full[m0]} to ${full[m1]}?`, 'What is the range of the temperatures?'],
          ans: [`${temps[m0]}°C`, `${temps[m1]}°C`, full[temps.indexOf(Math.max(...temps))], full[temps.indexOf(Math.min(...temps))], `${Math.abs(temps[m1] - temps[m0])}°C`, `${range(temps)}°C`], cols: 2, fig: lg },
        round('reading scales: a column ends exactly halfway between two gridlines. What value does it show?', 12, () => { const st = pick([2, 4, 5, 10, 20, 50]), a = ri(1, 9) * st; return [`between ${a} and ${a + st}`, fmt(a + st / 2)]; }),
      ],
      medium: [
        { text: 'use the column graph. Give fractions in simplest form and percentages to 1 d.p.', items: [...cats.slice(0, 3).map((c) => `What fraction chose ${c}?`), ...cats.slice(0, 3).map((c) => `What percentage chose ${c}?`), 'What is the mean number of students per sport?'],
          ans: [...vals.slice(0, 3).map((v) => `${v}/${total}`), ...vals.slice(0, 3).map((v) => `${fmt((v / total) * 100, 1)}%`), fmt(total / 5, 1)], cols: 2, fig: cg },
        { text: 'use the line graph.', items: ['In how many months was it above 25°C?', 'In how many months was it below 20°C?', 'Describe the trend from January to July.', 'Describe the trend from July to December.', 'Is this a place in the northern or southern hemisphere? Why?'],
          ans: [String(temps.filter((t) => t > 25).length), String(temps.filter((t) => t < 20).length), 'it gets colder (decreases)', 'it gets warmer (increases)', 'southern: it is coldest in June–August'], cols: 1, fig: lg },
        round('a survey result: write it as a percentage.', 12, () => { const b = pick([20, 25, 40, 50, 200]), a = ri(1, b - 1); return [`${a} of ${b} students`, `${fmt((a / b) * 100, 1)}%`]; }),
      ],
    };
  },
  '10.02': ({ list }) => ({
    easy: [
      list('misleading (M) or fair (F)?', [['The vertical axis starts at 0.', 'F'], ['The vertical axis starts at 90.', 'M'], ['The columns are different widths.', 'M'], ['The scale has equal steps.', 'F'], ['The scale jumps from 10 to 50 to 60.', 'M'],
        ['The pictures get bigger in two directions.', 'M'], ['The graph has a title and labelled axes.', 'F'], ['The graph is drawn in 3D, so the front column looks bigger.', 'M'], ['There is a break mark (⚡) shown on the axis.', 'F'], ['Only part of the data is shown to hide a fall.', 'M'],
        ['Each picture stands for the same amount.', 'F'], ['The axis has no numbers.', 'M'], ['The sector graph adds to 100%.', 'F'], ['The sectors add to 130%.', 'M']], { cols: 2 }),
      list('what makes the graph misleading? Choose: scale, axis start, picture size, or missing labels.', [['The y-axis goes 0, 5, 10, 50, 100.', 'scale'], ['The y-axis starts at 1000.', 'axis start'], ['A picture twice as tall is also twice as wide.', 'picture size'], ['The axes have no titles.', 'missing labels'],
        ['The columns start at 80 so small changes look huge.', 'axis start'], ['The steps on the axis are not equal.', 'scale'], ['The larger bag of money is drawn 3 times as wide.', 'picture size'], ['There is no title or key.', 'missing labels']], { cols: 2 }),
    ],
    medium: [
      list('explain why each graph could mislead a reader.', [['Sales went from 96 to 98. The axis starts at 95.', 'the second column looks 3 times as tall, but sales only rose about 2%'], ['A company shows only the months when profits rose.', 'the missing months hide the falls'],
        ['A graph of test scores has an axis from 60 to 70.', 'small differences look very large'], ['Pictures of houses: one house is drawn twice as tall and twice as wide.', 'its area is 4 times, so it looks 4 times as big'],
        ['A line graph squashes the time axis to make a rise look steep.', 'the change looks faster than it is'], ['A sector graph is tilted in 3D.', 'the front sector looks bigger than it is']], { cols: 1 }),
      list('the axis starts at the number given. How many times taller does column B look than column A? How many times bigger is it really? (1 d.p.)', [['A = 92, B = 96, axis starts at 90', 'looks 3 times; really 1.0 times'], ['A = 51, B = 54, axis starts at 50', 'looks 4 times; really 1.1 times'],
        ['A = 22, B = 30, axis starts at 20', 'looks 5 times; really 1.4 times'], ['A = 105, B = 110, axis starts at 100', 'looks 2 times; really 1.0 times'], ['A = 72, B = 80, axis starts at 70', 'looks 5 times; really 1.1 times'], ['A = 11, B = 14, axis starts at 10', 'looks 4 times; really 1.3 times']], { cols: 2 }),
    ],
  }),
  '10.03': ({ round, ri }) => {
    const d1 = data(ri, 18, 3, 11), d2 = [...data(ri, 16, 12, 18), ri(24, 27)];
    const plot = (xs, min, max, t) => G.dotPlot({ title: t, min, max, counts: counts(xs), xTitle: 'Value', w: 86 });
    const q = (xs) => [['How many values are there?', xs.length], ['What is the mode?', modes(xs)], ['What is the range?', range(xs)], ['What is the smallest value?', Math.min(...xs)], ['What is the largest value?', Math.max(...xs)], [`How many values are greater than ${median(xs)}?`, xs.filter((x) => x > median(xs)).length]];
    return {
      easy: [
        round('find the mode (the most common value).', 20, () => { const xs = data(ri, 7, 1, 9); const m = modes(xs); return m === 'no mode' || m.includes('and') ? ['', ''] : [list(xs), m]; }, { cols: 3 }),
        { text: 'use the dot plot.', items: q(d1).map((x) => x[0]), ans: q(d1).map((x) => String(x[1])), cols: 2, fig: plot(d1, 3, 11, 'Pets owned by families') },
      ],
      medium: [
        round('find the range (largest − smallest).', 16, () => { const xs = data(ri, 7, 2, 40); return [list(xs), range(xs)]; }, { cols: 3 }),
        { text: 'use the dot plot.', items: [...q(d2).map((x) => x[0]), 'Which value is an outlier?', 'Describe the cluster.'], ans: [...q(d2).map((x) => String(x[1])), String(Math.max(...d2)), `most values are from 12 to 18`], cols: 2, fig: plot(d2, 10, 28, 'Minutes to get to school') },
      ],
    };
  },
  '10.04': ({ round, ri }) => {
    const d = data(ri, 16, 21, 68), rows = slRows(d);
    const fig = G.stemLeaf({ title: 'Test scores', rows, key: '2 | 7 = 27' });
    return {
      easy: [
        round('write the value shown (key 3 | 4 = 34).', 24, () => { const s = ri(1, 9), l = ri(0, 9); return [`${s} | ${l}`, `${s}${l}`]; }),
        { text: 'use the stem-and-leaf plot.', items: ['How many scores are there?', 'What is the lowest score?', 'What is the highest score?', `How many scores are in the ${rows[1][0]}0s?`, 'How many scores are 50 or more?', 'What is the range?'],
          ans: [d.length, Math.min(...d), Math.max(...d), rows[1][1].length, d.filter((x) => x >= 50).length, range(d)].map(String), cols: 2, fig },
      ],
      medium: [
        round('write the values in the row (key 3 | 4 = 34).', 12, () => { const s = ri(1, 9), ls = data(ri, 4, 0, 9).sort((a, b) => a - b); return [`${s} | ${ls.join(' ')}`, ls.map((l) => `${s}${l}`).join(', ')]; }, { cols: 3 }),
        round('write a stem-and-leaf plot for the data.', 8, () => { const xs = data(ri, 7, 12, 49); return [list(xs), slText(xs).replace(/<br>/g, '; ')]; }, { cols: 2, work: true }),
      ],
    };
  },
  '10.05': ({ round, ri }) => ({
    easy: [
      round('find the mean: add the values, then divide by how many there are.', 20, () => { const k = ri(3, 5), xs = data(ri, k, 1, 20); return sum(xs) % k ? ['', ''] : [list(xs), mean(xs)]; }, { cols: 3 }),
      round('find the mode.', 16, () => { const xs = data(ri, 6, 1, 12); const m = modes(xs); return m === 'no mode' || m.includes('and') ? ['', ''] : [list(xs), m]; }),
    ],
    medium: [
      round('find the mean to 1 decimal place.', 12, () => { const xs = data(ri, ri(4, 7), 5, 50); return [list(xs), fmt(Math.round(mean(xs) * 10) / 10, 1)]; }, { cols: 3 }),
      round('the mean is given. Find the missing value.', 12, () => { const k = ri(3, 5), m = ri(5, 20), xs = data(ri, k - 1, 1, 2 * m); const last = m * k - sum(xs); return last < 0 ? ['', ''] : [`${list(xs)}, ?  (mean ${m})`, last]; }, { cols: 2 }),
    ],
  }),
  '10.06': ({ round, ri }) => ({
    easy: [
      round('find the median: order the values, then find the middle one.', 20, () => { const xs = data(ri, 5, 1, 30); return [list(xs), median(xs)]; }, { cols: 3 }),
      round('find the range.', 16, () => { const xs = data(ri, 5, 1, 50); return [list(xs), range(xs)]; }, { cols: 3 }),
    ],
    medium: [
      round('find the median. There is an even number of values: take the middle two and halve their sum.', 15, () => { const xs = data(ri, ri(2, 3) * 2, 1, 40); return [list(xs), fmt(median(xs), 1)]; }, { cols: 3 }),
      round('find the median and the range.', 12, () => { const xs = data(ri, ri(5, 8), 10, 60); return [list(xs), `median ${fmt(median(xs), 1)}, range ${range(xs)}`]; }, { cols: 3 }),
    ],
  }),
  '10.07': ({ round, ri }) => {
    const d = data(ri, 11, 32, 78), fig = G.stemLeaf({ title: 'Heights of seedlings (mm)', rows: slRows(d), key: '4 | 5 = 45 mm' });
    const e = [...data(ri, 13, 4, 9), 1], dp = G.dotPlot({ title: 'Hours of sleep', min: 0, max: 10, counts: counts(e), xTitle: 'Hours', w: 86 });
    return {
      easy: [
        round('find the range of the stem-and-leaf plot.', 12, () => { const xs = data(ri, 6, 10, 69); return [slText(xs), range(xs)]; }, { cols: 3 }),
        { text: 'use the stem-and-leaf plot. Give the mean to 1 d.p.', items: ['How many values?', 'Mode', 'Median', 'Range', 'Mean', 'How many values are below 50?'],
          ans: [d.length, modes(d), median(d), range(d), fmt(Math.round(mean(d) * 10) / 10, 1), d.filter((x) => x < 50).length].map(String), cols: 2, fig },
      ],
      medium: [
        { text: 'use the dot plot. Give the mean to 1 d.p.', items: ['How many values?', 'Mode', 'Median', 'Range', 'Mean', 'Which value is an outlier?', 'Find the range without the outlier.', 'Does the outlier change the median much?'],
          ans: [e.length, modes(e), median(e), range(e), fmt(Math.round(mean(e) * 10) / 10, 1), 1, range(e.slice(0, -1)), `no (it becomes ${median(e.slice(0, -1))})`].map(String), cols: 2, fig: dp },
        round('find the median of the stem-and-leaf plot.', 9, () => { const xs = data(ri, 7, 10, 59); return [slText(xs), median(xs)]; }, { cols: 3 }),
      ],
    };
  },
  '10.08': ({ round, ri }) => ({
    easy: [
      round('which group is more consistent (smaller range)?', 18, () => { const a = ri(3, 30), b = ri(3, 30); return a === b ? ['', ''] : [`A: range ${a}, B: range ${b}`, a < b ? 'A' : 'B']; }, { cols: 3 }),
      round('which group has the higher mean?', 10, () => { const a = data(ri, 4, 2, 20), b = data(ri, 4, 2, 20); return mean(a) === mean(b) ? ['', ''] : [`A: ${list(a)}<br>B: ${list(b)}`, `${mean(a) > mean(b) ? 'A' : 'B'} (${fmt(mean(a), 2)} and ${fmt(mean(b), 2)})`]; }, { cols: 2 }),
    ],
    medium: [
      round('find the mean and the range of each group. Which group did better? Which is more consistent?', 6, () => { const a = data(ri, 5, 5, 20), b = data(ri, 5, 5, 20); return [`Class A: ${list(a)}<br>Class B: ${list(b)}`, `A mean ${fmt(mean(a), 1)}, range ${range(a)}; B mean ${fmt(mean(b), 1)}, range ${range(b)}`]; }, { cols: 2, work: true }),
      round('find the median of each group. Which median is higher?', 6, () => { const a = data(ri, 5, 10, 60), b = data(ri, 5, 10, 60); return median(a) === median(b) ? ['', ''] : [`A: ${list(a)}<br>B: ${list(b)}`, `A ${median(a)}, B ${median(b)}: ${median(a) > median(b) ? 'A' : 'B'}`]; }, { cols: 2 }),
    ],
  }),
};
