// Lesson 4.2 Frequency tables (two pages: Easy, then Medium). See lib/lesson-two.js for the fields.
// Easy: tally and frequency for single values or categories. Medium: class intervals (0–4, 5–9, …) and percentage
// frequency; the page ends with word problems. Each round has its data (a list or a table) beside the questions.
// From the Chapter 4 review: the 16 TV-watching values (short-answer 6), grouped into 0–4, 5–9, … in the Medium WE DO.
const { fmt, pct, table, classes, tally, sum, problems, C } = require('../helpers');

// ---------- drawing ----------
// Tally marks for n: groups of four strokes crossed by a fifth.
const tallyMarks = (n) => {
  const g = Math.floor(n / 5), r = n % 5, w = g * 6.4 + r * 1.3 + 0.6;
  let b = '';
  for (let i = 0; i < g; i++) { const x = i * 6.4; for (let k = 0; k < 4; k++) b += `<line x1="${x + 0.6 + k * 1.3}" y1="0.4" x2="${x + 0.6 + k * 1.3}" y2="4" stroke="${C.charcoal}" stroke-width="0.35"/>`; b += `<line x1="${x}" y1="3.4" x2="${x + 5.4}" y2="1" stroke="${C.charcoal}" stroke-width="0.35"/>`; }
  for (let k = 0; k < r; k++) b += `<line x1="${g * 6.4 + 0.6 + k * 1.3}" y1="0.4" x2="${g * 6.4 + 0.6 + k * 1.3}" y2="4" stroke="${C.charcoal}" stroke-width="0.35"/>`;
  return `<svg class="tally" viewBox="0 0 ${w.toFixed(2)} 4.4" style="width:${(w * 0.82).toFixed(2)}mm" xmlns="http://www.w3.org/2000/svg">${b}</svg>`;
};
const raw = (title, values) => `<div class="rawdata"><b>${title}</b>${values.join(', ')}</div>`;
// A frequency table to fill in: one row per category, blank Tally and Frequency cells (and a blank Total).
const blankTable = (head, cats, { pctCol = false } = {}) => table([head, 'Tally', 'Frequency', ...(pctCol ? ['%'] : [])],
  [...cats.map((c) => [c, '', '', ...(pctCol ? [''] : [])]), ['<b>Total</b>', '', '', ...(pctCol ? [''] : [])]]).replace(/<td><\/td>/g, '<td class="blank"></td>');
const pair = (a, b) => `<div class="fig-pair">${a}${b}</div>`;
const count = (data, v) => data.filter((x) => x === v).length;
const top = (cats, f) => cats[f.indexOf(Math.max(...f))];

// ---------- Easy ----------
const FRUIT = ['apple', 'banana', 'apple', 'grapes', 'mango', 'apple', 'banana', 'mango', 'apple', 'grapes', 'banana', 'apple', 'mango', 'apple', 'banana', 'apple'];
const fruits = ['apple', 'banana', 'grapes', 'mango'], ff = fruits.map((v) => count(FRUIT, v));
const PETS = [0, 1, 2, 1, 0, 3, 1, 2, 1, 1, 0, 2, 4, 1, 2, 1, 0, 1, 3, 1];
const petVals = [0, 1, 2, 3, 4], pf = petVals.map((v) => count(PETS, v));
const sports = ['Soccer', 'Netball', 'AFL', 'Cricket', 'Swimming'], sf = [7, 9, 4, 3, 2];

// ---------- Medium ----------
const TV = [6, 5, 11, 13, 24, 8, 1, 12, 7, 6, 14, 10, 9, 16, 8, 3]; // the review's data
const tvC = classes(0, 5, 5), tvF = tally(TV, 0, 5, 5);
const MARKS = [23, 41, 35, 18, 29, 44, 37, 26, 31, 9, 38, 45, 33, 27, 36, 15, 39, 42, 28, 34];
const mC = classes(0, 10, 5), mF = tally(MARKS, 0, 10, 5);
const ageC = ['10–14', '15–19', '20–24', '25–29', '30–34'], ageF = [3, 6, 8, 5, 3];
const p = (f, T) => pct((f / T) * 100);

module.exports = {
  code: '4.2', title: 'Frequency tables',
  li: 'organise data in frequency tables.',
  sc: ['use tally marks to count data', 'complete a frequency table and read it', 'group data into classes and find percentages'],
  easy: {
    ex: { stem: 'Count each answer with tally marks (a stroke for each one, every fifth crosses four). Frequency = how many.',
      fig: pair(raw('Favourite fruit of 16 students', FRUIT), blankTable('Fruit', fruits)), parts: [
        'Complete the tally column.', 'Complete the frequency column.', 'Which fruit is the most popular?', 'Check: add the frequencies. How many students?'] },
    exAns: [`tallies of ${ff.join(', ')}`, `${fruits.map((v, i) => `${v} ${ff[i]}`).join(', ')}`, top(fruits, ff), `${ff.join(' + ')} = ${sum(ff)} students`],
    hint: 'Frequency = the number of tally marks · Total frequency = the number of values.',
    rounds: [
      { text: 'use the data. Make a tally, then answer.', cols: 2, fig: pair(raw('Number of pets of 20 students', PETS), blankTable('Pets', petVals)),
        items: ['How many students have 0 pets?', 'How many students have 1 pet?', 'How many students have 2 pets?', 'How many students have 3 or more pets?', 'What is the most common number of pets?', 'What is the total frequency?'],
        ans: [String(pf[0]), String(pf[1]), String(pf[2]), String(pf[3] + pf[4]), String(petVals[pf.indexOf(Math.max(...pf))]), String(sum(pf))] },
      { text: 'use the tally table of favourite sports.', cols: 2,
        fig: table(['Sport', 'Tally', 'Frequency'], sports.map((s, i) => [s, tallyMarks(sf[i]), ''])).replace(/<td><\/td>/g, '<td class="blank"></td>'),
        items: ['Frequency of netball?', 'Frequency of AFL?', 'Which sport is the most popular?', 'Which sport is the least popular?', 'How many students were asked?', 'How many more chose soccer than cricket?'],
        ans: [String(sf[1]), String(sf[2]), top(sports, sf), sports[sf.indexOf(Math.min(...sf))], String(sum(sf)), String(sf[0] - sf[3])] },
    ],
  },
  medium: {
    ex: { stem: 'Group numbers into class intervals. Percentage frequency = frequency ÷ total × 100.',
      fig: pair(raw('Hours of TV watched by 16 people', TV), blankTable('Hours', tvC, { pctCol: true })), parts: [
        'Complete the tally column.', 'Complete the frequency column and the total.', 'Find the percentage frequency of each class.', 'Which class has the most people?'] },
    exAns: [`tallies of ${tvF.join(', ')}`, `${tvC.map((c, i) => `${c}: ${tvF[i]}`).join(', ')}; total ${sum(tvF)}`, tvF.map((f, i) => `${tvC[i]}: ${f} ÷ ${sum(tvF)} × 100 = ${p(f, sum(tvF))}`).join(' · '), `${top(tvC, tvF)} hours`],
    hint: 'Class 10–19 means 10 up to 19 · Percentage frequency = frequency ÷ total × 100 · The percentages add up to 100%.',
    rounds: [
      { text: 'group the test marks (out of 50) into classes, then answer.', cols: 2, fig: pair(raw('Test marks of 20 students', MARKS), blankTable('Mark', mC)),
        items: ['Frequency of 0–9?', 'Frequency of 20–29?', 'Frequency of 30–39?', 'Which class has the most students?', 'How many students scored 40 or more?', 'How many scored less than 20?'],
        ans: [String(mF[0]), String(mF[2]), String(mF[3]), top(mC, mF), String(mF[4]), String(mF[0] + mF[1])] },
      { text: 'find the percentage frequency of each class of ages (total 25).', cols: 2,
        fig: table(['Age', 'Frequency', '%'], [...ageC.map((c, i) => [c, ageF[i], '']), ['<b>Total</b>', `<b>${sum(ageF)}</b>`, '']]).replace(/<td><\/td>/g, '<td class="blank"></td>'),
        items: ageC.map((c) => `% aged ${c}?`).concat(['All the % added up?']),
        ans: ageF.map((f) => p(f, sum(ageF))).concat(['100%']) },
      problems('solve each problem. Show your working.', [
        ((f, T) => [`In a survey of ${T} people, ${f} said they walk to school. What percentage frequency is this?`, `${f} ÷ ${T} × 100 = ${p(f, T)}`])(9, 30),
        ((cls) => [`Ella groups the ages ${cls.join(', ')} into classes 10–19, 20–29 and 30–39. What is the frequency of each class?`,
          `10–19: ${cls.filter((x) => x < 20).length}, 20–29: ${cls.filter((x) => x >= 20 && x < 30).length}, 30–39: ${cls.filter((x) => x >= 30).length}`])([12, 25, 31, 18, 22, 27, 35, 14, 29, 20]),
      ]),
    ],
  },
};
