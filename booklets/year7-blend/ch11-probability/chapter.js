// Blended booklet, Chapter 11 Probability. Four pages a lesson.
const blend = require('../../lib/blend');
const { F, simp } = require('../../lib/calc');

const base = require('../../year7/ch11-probability/chapter.js');
const sp = (code) => base.lessons.find((f) => f.spec.code === code).spec;
const P = (n, d) => { if (n === 0) return '0'; if (n === d) return '1'; const [a, b] = simp([n, d]); return F(a, b); };
const D = (text, pairs, hw, cols = 3) => ({ text, cols, items: pairs.map((p) => p[0]), ans: pairs.map((p) => p[1]), hw });

module.exports = blend(base, {
  fileName: 'Year7-Ch11-Probability-Lessons', pages: 4,
  more: {
    '11.01': { exFigs: [undefined, undefined, sp('11.01').b.fig], stems: ['List the sample space.', 'List all the possible outcomes.', 'Use the spinner, then list the outcomes.'],
      drill: D('Quick drill: how many outcomes are in the sample space?', [['tossing a coin', '2'], ['rolling a die', '6'], ['choosing a month', '12'], ['choosing a letter of the alphabet', '26'], ['spinning A, B, C, D, E', '5'], ['choosing a card suit', '4']], ['choosing a day of the week', '7', 'How many outcomes are in the sample space?']) },
    '11.02': { stems: ['A die is rolled. Find each probability.', 'Find each probability.', 'Find each probability as a percentage (1 d.p.).'],
      drill: D('Quick drill: a bag has 3 red, 5 blue and 2 green counters. Find:', [['P(red)', P(3, 10)], ['P(blue)', P(5, 10)], ['P(green)', P(2, 10)], ['P(red or green)', P(5, 10)], ['P(yellow)', '0'], ['P(not blue)', P(5, 10)]], ['P(blue or green)', P(7, 10), 'A bag has 3 red, 5 blue and 2 green counters. Find the probability.']) },
    '11.03': { stems: ['Use the probability scale and chance words.', 'Find each probability.', 'Find each probability.'],
      drill: D('Quick drill: write the chance word (impossible, unlikely, even chance, likely or certain).', [], ['0.95', 'likely (very likely)', 'Write the chance word for this probability.']) },
    '11.04': { stems: ['Find the theoretical probability and the expected number.', 'Find the observed probability, then compare.', 'Find the expected number, then explain.'],
      drill: D('Quick drill: find the expected number.', [['heads in 50 tosses', '25'], ['6s in 30 rolls', '5'], ['even numbers in 40 rolls', '20'], ['A on spinner ABCD in 100 spins', '25'], ['tails in 200 tosses', '100'], ['a 1 or 2 in 60 rolls', '20']], ['heads in 90 tosses', '45', 'Find the expected number.']) },
    '11.05': { stems: ['Write the complement and its probability.', 'Write the complement and its probability, then find P.', 'Find each probability.'],
      drill: D('Quick drill: find P(not E).', [['P(E) = 0.3', '0.7'], [`P(E) = ${F(1, 5)}`, F(4, 5)], ['P(E) = 45%', '55%'], ['P(E) = 0', '1'], [`P(E) = ${F(3, 8)}`, F(5, 8)], ['P(E) = 0.99', '0.01']], ['P(E) = 0.62', '0.38', 'Find P(not E).']) },
  },
});
