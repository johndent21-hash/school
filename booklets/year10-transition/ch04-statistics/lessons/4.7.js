// Lesson 4.7 Time-series graphs (two pages: Easy, then Medium). See lib/lesson-two.js for the fields.
// Easy: reading a time-series (line) graph. Medium: trends (upward, downward or no trend; a linear trend, as in the
// review's summary), the biggest change, describing it in words and a rough prediction; the page ends with word problems.
const { fmt, money, problems, lineGraph } = require('../helpers');

// ---------- graphs ----------
const big = (title, xs, ys, o) => lineGraph({ title, xs, ys, w: 84, h: 47, ...o });
// A small graph for its trend only (time 1, 2, 3, …)
// (no numbers up the side: only the direction of the line matters)
const small = (ys) => { const max = Math.ceil((Math.max(...ys) + 2) / 5) * 5; return lineGraph({ title: '', xs: ys.map((_, i) => i + 1), ys, max, step: max / 5, labelEvery: 1000, yTitle: '', xTitle: '', w: 40, h: 26 }); };
const UP = 'upward', DOWN = 'downward', NONE = 'no trend';

// ---------- data ----------
const TIMES = ['6 am', '8 am', '10 am', '12 pm', '2 pm', '4 pm', '6 pm'], TEMP = [12, 15, 19, 23, 25, 22, 17];
const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'], FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const ICE = [30, 28, 22, 15, 10, 6, 5, 7, 12, 18, 24, 29];
const WEEKS = [0, 1, 2, 3, 4, 5, 6], SUN = [5, 12, 25, 40, 60, 75, 82];
const YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025], KIDS = [620, 640, 655, 650, 680, 700, 715, 730];
const at = (xs, ys, x) => ys[xs.indexOf(x)];
const hi = (xs, ys) => xs[ys.indexOf(Math.max(...ys))], lo = (xs, ys) => xs[ys.indexOf(Math.min(...ys))];
// the biggest rise between two times next to each other
const bigRise = (xs, ys) => { let k = 1; for (let i = 1; i < ys.length; i++) if (ys[i] - ys[i - 1] > ys[k] - ys[k - 1]) k = i; return [xs[k - 1], xs[k], ys[k] - ys[k - 1]]; };
const drop = (xs, ys) => xs.find((_, i) => i > 0 && ys[i] < ys[i - 1]);
const LIN = [50, 46, 42, 38, 34];

const cards = (text, list, o = {}) => ({ text, figs: true, cols: 4, prefix: 'Trend:', items: list.map((ys) => ({ fig: small(ys) })), ans: list.map((ys) => trend(ys)), ...o });
// upward or downward when the last value is clearly above or below the first and the line mostly goes that way
const trend = (ys) => { const ups = ys.slice(1).filter((y, i) => y > ys[i]).length, downs = ys.length - 1 - ups; return ups >= ys.length - 2 && ys[ys.length - 1] > ys[0] ? UP : downs >= ys.length - 2 && ys[ys.length - 1] < ys[0] ? DOWN : NONE; };

module.exports = {
  code: '4.7', title: 'Time-series graphs',
  li: 'read time-series graphs and describe how the data change over time.',
  sc: ['read a value from a time-series graph', 'find the highest and lowest values', 'describe a trend and make a rough prediction'],
  easy: {
    ex: { stem: 'A time-series graph shows how something changes over time.', fig: big('Temperature during a day', TIMES, TEMP, { max: 30, yMin: 10, step: 2, labelEvery: 4, yTitle: '°C', xTitle: 'Time' }), parts: [
      'What was the temperature at 10 am?', 'What was the highest temperature? When?', 'What was the lowest temperature? When?', 'When was the temperature 22 °C?'] },
    exAns: [`${at(TIMES, TEMP, '10 am')} °C`, `${Math.max(...TEMP)} °C at ${hi(TIMES, TEMP)}`, `${Math.min(...TEMP)} °C at ${lo(TIMES, TEMP)}`, TIMES[TEMP.indexOf(22)]],
    hint: 'Find the time on the bottom axis, go up to the line, then across to read the value · The highest point is the biggest value.',
    rounds: [
      { text: 'use the graph of ice-cream sales (in $1 000s) at a beach shop.', cols: 2, fig: big('Ice-cream sales', MONTHS, ICE, { max: 35, step: 5, labelEvery: 5, yTitle: 'Sales ($1 000s)', xTitle: 'Month' }),
        items: ['Sales in March?', 'Sales in July?', 'Which month had the highest sales?', 'Which month had the lowest sales?', 'How much more was sold in January than in June?', 'In which month were sales 24?'],
        ans: [`${ICE[2]} (${money(ICE[2] * 1000)})`, `${ICE[6]} (${money(ICE[6] * 1000)})`, FULL[ICE.indexOf(Math.max(...ICE))], FULL[ICE.indexOf(Math.min(...ICE))], `${ICE[0]} − ${ICE[5]} = ${ICE[0] - ICE[5]} (${money((ICE[0] - ICE[5]) * 1000)})`, FULL[ICE.indexOf(24)]] },
      { text: 'use the graph of a sunflower’s height.', cols: 2, fig: big('Height of a sunflower', WEEKS, SUN, { max: 90, step: 10, labelEvery: 20, yTitle: 'cm', xTitle: 'Week' }),
        items: ['Height at week 2?', 'Height at week 5?', 'In which week was it 60 cm?', 'How much did it grow from week 3 to week 4?', 'How much did it grow from week 0 to week 6?', 'Between which weeks did it grow the most?'],
        ans: [`${SUN[2]} cm`, `${SUN[5]} cm`, `week ${WEEKS[SUN.indexOf(60)]}`, `${SUN[4]} − ${SUN[3]} = ${SUN[4] - SUN[3]} cm`, `${SUN[6]} − ${SUN[0]} = ${SUN[6] - SUN[0]} cm`, ((r) => `week ${r[0]} to week ${r[1]} (${r[2]} cm)`)(bigRise(WEEKS, SUN))] },
    ],
  },
  medium: {
    ex: { stem: 'The trend is the general direction of the line: upward, downward or no trend.', parts: [
      { t: 'Trend?', fig: small([2, 4, 5, 7, 8, 10]) }, { t: 'Trend?', fig: small([18, 16, 15, 12, 10, 9]) }, { t: 'Trend?', fig: small([6, 9, 5, 8, 6, 9]) },
      { t: `Values: ${LIN.join(', ')}. Describe the trend and predict the next value.`, fig: small(LIN) }] },
    exAns: [UP, DOWN, `${NONE} (it goes up and down)`, `a downward linear trend: down ${LIN[0] - LIN[1]} each time, so next ${LIN[LIN.length - 1] - (LIN[0] - LIN[1])}`],
    hint: 'Upward trend: the values mostly increase · Downward trend: they mostly decrease · Linear: it changes by about the same amount each time · Predict by carrying on the pattern.',
    rounds: [
      cards('upward, downward or no trend?', [[3, 5, 6, 8, 9, 11], [20, 18, 15, 13, 10, 8], [7, 9, 6, 8, 7, 9], [2, 4, 3, 6, 7, 9]]),
      { text: 'use the graph of the number of students at a school.', cols: 2, fig: big('Students at a school', YEARS.map((y) => `’${String(y).slice(2)}`), KIDS, { max: 750, yMin: 600, step: 10, labelEvery: 50, yTitle: 'Students', xTitle: 'Year' }),
        items: ['What is the trend?', 'In which year did the number drop?', 'How many more students in 2025 than in 2018?', 'Between which two years was the biggest increase?', 'About how many students would you predict for 2026?', 'How many students were there in 2022?'],
        ans: [UP, String(drop(YEARS, KIDS)), `${KIDS[7]} − ${KIDS[0]} = ${KIDS[7] - KIDS[0]}`, ((r) => `${r[0]} to ${r[1]} (+${r[2]})`)(bigRise(YEARS, KIDS)), `about ${KIDS[7] + 15} (it rises about 15 a year lately)`, String(KIDS[4])] },
      problems('solve each problem. Show your working.', [
        ((v) => [`A car was worth ${v.map((x) => money(x)).join(', ')} at the end of years 1 to 4. Describe the trend. Predict its value at the end of year 5.`,
          `a downward linear trend (down ${money(v[0] - v[1])} a year); year 5: ${money(v[3] - (v[0] - v[1]))}`])([20000, 17000, 14000, 11000]),
        ((a, b, n) => [`A shop’s sales went up steadily from ${a} to ${b} items a month over ${n} months. About how much did sales go up each month?`, `(${b} − ${a}) ÷ ${n} = ${fmt((b - a) / n)} items`])(120, 180, 6),
      ]),
    ],
  },
};
