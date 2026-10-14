// Lesson 4.1 Types of data (two pages: Easy, then Medium). See lib/lesson-two.js for the fields.
// Easy: categorical or numerical. Medium: nominal or ordinal (categorical), discrete or continuous (numerical); the page
// ends with word problems. Each question is a survey card (a question students were asked, with some answers) or a
// data card; each WE DO has a tree of the types of data beside it.
// From the Chapter 4 review: "What is your favourite sport to play?" (multiple-choice 6: categorical and nominal).
const { svg, text, line, C, problems } = require('../helpers');

// ---------- cards ----------
// A survey question with some of the answers given · a set of data with a heading
const ask = (q, eg) => `<div class="dcard q"><b>${q}</b><span class="bubble">${eg}</span></div>`;
const data = (head, eg) => `<div class="dcard"><b>${head}</b><span class="bubble">${eg}</span></div>`;

// ---------- the tree of data types ----------
const f2 = (n) => +n.toFixed(2);
const node = (x, y, w, t, sub, fill) => `<rect x="${f2(x - w / 2)}" y="${y}" width="${w}" height="${sub ? 9.6 : 6.4}" rx="1.4" fill="${fill}" stroke="${C.charcoal}" stroke-width="0.3"/>`
  + text(x, y + 4.4, t, { size: 3.1, anchor: 'middle', weight: 700 }) + (sub ? text(x, y + 8.1, sub, { size: 2.4, anchor: 'middle', fill: C.grey }) : '');
const join = (x1, y1, x2, y2) => line(x1, y1, x2, y2, C.grey, 0.35);
// full: also split categorical into nominal/ordinal and numerical into discrete/continuous
const tree = (full) => {
  const W = 84, H = full ? 46 : 31;
  let b = node(W / 2, 1, 22, 'Data', '', '#ffffff') + join(W / 2, 7.4, W * 0.27, 13) + join(W / 2, 7.4, W * 0.73, 13);
  b += node(W * 0.27, 13, 36, 'Categorical', 'words or groups', '#e6ecf8') + node(W * 0.73, 13, 36, 'Numerical', 'numbers', '#f7f0dc');
  if (full) {
    [[0.12, 'Nominal', 'no order'], [0.39, 'Ordinal', 'has an order'], [0.61, 'Discrete', 'counted'], [0.88, 'Continuous', 'measured']].forEach(([fx, t, s], i) => {
      b += join(W * (i < 2 ? 0.27 : 0.73), 22.6, W * fx, 29) + node(W * fx, 29, 20, t, s, i < 2 ? '#e6ecf8' : '#f7f0dc');
    });
  } else {
    b += text(W * 0.27, 27.5, 'e.g. colour, sport', { size: 2.5, anchor: 'middle' }) + text(W * 0.73, 27.5, 'e.g. age, height, pets', { size: 2.5, anchor: 'middle' });
  }
  return svg(W, H, b);
};

// ---------- the questions ----------
// cards(text, [[card, answer], ...], options)
const cards = (text, list, o = {}) => ({ text, figs: true, cols: 4, prefix: 'Type:', items: list.map(([fig]) => ({ fig })), ans: list.map(([, a]) => a), ...o });
const EASY = { figH: 20 };
const CAT = 'categorical', NUM = 'numerical';

module.exports = {
  code: '4.1', title: 'Types of data',
  li: 'sort data into categorical and numerical, and name each type.',
  sc: ['tell categorical data from numerical data', 'tell nominal data from ordinal data', 'tell discrete data from continuous data'],
  easy: {
    ex: { stem: 'Categorical data are words or groups. Numerical data are numbers you count or measure.', fig: tree(false), parts: [
      'What is your favourite colour?', 'How many pets do you have?', 'How tall are you?', 'What type of phone do you have?'] },
    exAns: [CAT, NUM, NUM, CAT],
    hint: 'Answers are words or groups (red, dog, bus) → categorical · Answers are numbers you count or measure (3 pets, 152 cm) → numerical.',
    rounds: [
      cards('a survey question and some answers. Is the data categorical or numerical?', [
        [ask('What is your favourite sport?', 'soccer, netball, AFL'), CAT], [ask('How many brothers and sisters do you have?', '0, 1, 2, 3'), NUM],
        [ask('What colour is your hair?', 'brown, black, red'), CAT], [ask('How long is your trip to school?', '5 min, 12 min, 20 min'), NUM]], EASY),
      cards('some data. Is it categorical or numerical?', [
        [data('Shoe sizes', '7, 8, 8, 9, 10'), NUM], [data('Pets', 'dog, cat, fish, dog'), CAT],
        [data('Temperatures', '21 °C, 24 °C, 19 °C'), NUM], [data('How students get to school', 'bus, walk, car, bus'), CAT]], EASY),
      cards('what kind of data would you collect? Categorical or numerical?', [
        [data('Colours of cars in the car park', 'white, red, …'), CAT], [data('Heights of plants', 'in cm'), NUM],
        [data('Favourite kinds of music', 'pop, rock, …'), CAT], [data('Goals scored in each game', '0, 1, 2, …'), NUM]], EASY),
    ],
  },
  medium: {
    ex: { stem: 'Categorical data can be nominal or ordinal. Numerical data can be discrete or continuous.', fig: tree(true), parts: [
      'What is your favourite sport to play?', 'What size drink: small, medium or large?', 'How many cars does your family have?', 'How long do you take to run 100 m?'] },
    exAns: ['categorical, nominal (no order)', 'categorical, ordinal (small → large has an order)', 'numerical, discrete (counted)', 'numerical, continuous (measured)'],
    hint: 'Nominal: groups with no order · Ordinal: groups with an order (small, medium, large) · Discrete: counted (whole numbers) · Continuous: measured (can have decimals).',
    rounds: [
      cards('categorical data. Nominal or ordinal?', [
        [ask('What colour are your eyes?', 'brown, blue, green'), 'nominal'], [ask('How was the movie?', 'poor, OK, good, great'), 'ordinal'],
        [ask('Which country were you born in?', 'Australia, Fiji, …'), 'nominal'], [ask('What size T-shirt do you wear?', 'S, M, L, XL'), 'ordinal']]),
      cards('numerical data. Discrete or continuous?', [
        [ask('How many texts did you send today?', '4, 15, 30'), 'discrete'], [data('Mass of newborn babies', '3.2 kg, 3.65 kg'), 'continuous'],
        [data('Number of people on a bus', '12, 25, 40'), 'discrete'], [data('Lengths of fish caught', '31.5 cm, 40 cm'), 'continuous']]),
      cards('name both: categorical or numerical, then the kind.', [
        [ask('How hot do you like your curry?', 'mild, medium, hot'), 'categorical, ordinal'], [data('Heights of trees', 'in metres'), 'numerical, continuous'],
        [ask('What is your favourite pizza topping?', 'ham, cheese, …'), 'categorical, nominal'], [data('Number of goals scored', '0, 1, 2, …'), 'numerical, discrete']], { prefix: '' }),
      problems('solve each problem.', [
        ['Write a survey question that gives numerical, discrete data.', 'e.g. “How many pets do you have?” (any question answered by counting)'],
        ['A survey asks: “How happy are you with the canteen? Not happy, OK, very happy.” What type of data is this? Explain.', 'categorical, ordinal: the answers are groups that have an order'],
      ]),
    ],
  },
};
