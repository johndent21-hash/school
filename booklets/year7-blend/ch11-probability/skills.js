// Skill drill pages for Chapter 11 Probability: page 1 practises the Easy basics, page 2 the Medium basics (lib/drill.js).
const { F, simp, fmt, gcd } = require('../../lib/calc');

const Fr = (n, d) => { const [a, b] = simp([n, d]); return b === 1 ? String(a) : F(a, b); };
const word = (p) => (p === 0 ? 'impossible' : p === 1 ? 'certain' : p < 0.5 ? 'unlikely' : p === 0.5 ? 'even chance' : 'likely');
const COL = ['red', 'blue', 'green', 'yellow', 'white', 'black'];

module.exports = {
  '11.01': ({ list, round, ri, pick }) => ({
    easy: [
      list('how many outcomes are in the sample space?', [['tossing a coin', 2], ['rolling a die', 6], ['choosing a day of the week', 7], ['choosing a month', 12], ['choosing a card from a deck', 52], ['choosing a letter of the alphabet', 26],
        ['spinning a spinner with 5 equal sectors', 5], ['choosing a suit of cards', 4], ['choosing a vowel', 5], ['choosing a digit (0 to 9)', 10], ['choosing a letter from MATHS', 5], ['choosing a season', 4], ['choosing an even number from 1 to 10', 5],
        ['choosing a colour of the rainbow', 7], ['rolling an 8-sided die', 8]], { cols: 3 }),
      list('list the sample space.', [['tossing a coin', 'H, T'], ['rolling a die', '1, 2, 3, 4, 5, 6'], ['choosing a letter from CAT', 'C, A, T'], ['choosing a suit', 'hearts, diamonds, clubs, spades'], ['a spinner with red, blue, green', 'red, blue, green'],
        ['choosing an odd number less than 10', '1, 3, 5, 7, 9'], ['choosing a weekend day', 'Saturday, Sunday'], ['choosing a vowel', 'a, e, i, o, u'], ['choosing a prime less than 12', '2, 3, 5, 7, 11'], ['choosing a letter from BOOK', 'B, O, K']], { cols: 2 }),
    ],
    medium: [
      list('how many outcomes are there for both together? (Multiply.)', [['toss a coin and roll a die', 12], ['toss two coins', 4], ['roll two dice', 36], ['toss three coins', 8], ['spin a 4-sector spinner and toss a coin', 8], ['choose a day of the week and toss a coin', 14],
        ['roll a die and spin a 3-sector spinner', 18], ['choose a suit and toss a coin', 8], ['choose a shirt (3) and pants (4)', 12], ['choose an entrée (2), main (5) and dessert (3)', 30], ['roll two 4-sided dice', 16], ['choose a month and a day of the week', 84]], { cols: 3 }),
      list('are the outcomes equally likely? Write yes or no.', [['tossing a fair coin', 'yes'], ['rolling a fair die', 'yes'], ['whether it rains tomorrow', 'no'], ['spinning a spinner with equal sectors', 'yes'], ['spinning a spinner with one large sector', 'no'], ['winning or losing a footy match', 'no'],
        ['choosing a card from a shuffled deck', 'yes'], ['a bag with 5 red and 1 blue: the colour', 'no'], ['the gender of the next baby born', 'yes (about)'], ['passing or failing a test', 'no']], { cols: 2 }),
    ],
  }),
  '11.02': ({ round, ri, pick }) => ({
    easy: [
      round('find the probability as a fraction in simplest form.', 24, () => { const a = ri(1, 9), b = ri(1, 9), [c1, c2] = [pick(COL), pick(COL)]; if (c1 === c2) return ['', '']; return [`${a} ${c1}, ${b} ${c2}: P(${c1})`, Fr(a, a + b)]; }, { cols: 3 }),
      round('a fair die is rolled. Find the probability.', 16, () => { const e = pick([['a 4', 1], ['an even number', 3], ['an odd number', 3], ['more than 4', 2], ['less than 3', 2], ['a 7', 0], ['a multiple of 3', 2], ['a number from 1 to 6', 6], ['a prime', 3], ['not a 6', 5], ['a 1 or a 2', 2], ['at least 5', 2], ['a factor of 6', 4], ['a square number', 2], ['less than 10', 6], ['a multiple of 5', 1]]); return [`P(${e[0]})`, Fr(e[1], 6)]; }),
    ],
    medium: [
      round('a letter is chosen at random from the word. Find the probability.', 15, () => { const w = pick(['PROBABILITY', 'MATHEMATICS', 'KINGSCLIFF', 'AUSTRALIA', 'STATISTICS', 'BANANA', 'PARALLEL']), l = pick([...new Set(w)]); const n = [...w].filter((x) => x === l).length; return [`${w}: P(${l})`, Fr(n, w.length)]; }, { cols: 3 }),
      round('write the probability as a fraction, a decimal and a percentage.', 12, () => { const d = pick([2, 4, 5, 10, 20, 25]), n = ri(1, d - 1); return gcd(n, d) > 1 ? ['', ''] : [`${n} chances in ${d}`, `${F(n, d)} = ${fmt(n / d)} = ${fmt((n / d) * 100)}%`]; }, { cols: 3 }),
    ],
  }),
  '11.03': ({ round, list, ri, pick }) => ({
    easy: [
      round('write the chance word: impossible, unlikely, even chance, likely or certain.', 24, () => { const k = ri(0, 2); const p = pick([0, 0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.75, 0.8, 0.9, 0.95, 1, 0.05]); return k === 0 ? [fmt(p), word(p)] : k === 1 ? [`${fmt(p * 100)}%`, word(p)] : [Fr(Math.round(p * 20), 20), word(p)]; }),
      list('which chance word describes the event?', [['the sun rises tomorrow', 'certain'], ['rolling a 7 on a normal die', 'impossible'], ['tossing heads', 'even chance'], ['rolling a number less than 6', 'likely'], ['snow in Kingscliff in summer', 'impossible (or very unlikely)'],
        ['rolling a 6', 'unlikely'], ['choosing a red card from a deck', 'even chance'], ['a baby born on a weekday', 'likely'], ['winning the lottery', 'unlikely'], ['rolling a number from 1 to 6', 'certain'], ['picking a vowel from ORANGE', 'even chance'], ['picking an ace from a deck', 'unlikely']], { cols: 2 }),
    ],
    medium: [
      round('which is more likely? Change to decimals to compare.', 16, () => { const a = pick([[1, 4], [2, 5], [3, 8], [1, 3], [3, 5], [7, 10], [5, 8], [2, 3]]), p = ri(1, 19) * 5; return Math.abs(a[0] / a[1] - p / 100) < 1e-9 ? ['', ''] : [`${F(a[0], a[1])} or ${p}%`, a[0] / a[1] > p / 100 ? F(a[0], a[1]) : `${p}%`]; }),
      round('a bag of counters is described. Is picking red impossible, unlikely, even chance, likely or certain?', 12, () => { const r = ri(0, 8), b = ri(0, 8); if (r + b === 0) return ['', '']; return [`${r} red, ${b} blue`, word(r / (r + b))]; }, { cols: 3 }),
    ],
  }),
  '11.04': ({ round, ri, pick }) => ({
    easy: [
      round('find the expected number: probability × number of trials.', 24, () => { const [e, n, d] = pick([['heads', 1, 2], ['a 6 on a die', 1, 6], ['an even number on a die', 1, 2], ['a red card', 1, 2], ['a heart', 1, 4], ['a 1 or 2 on a die', 1, 3]]), t = d * ri(2, 30); return [`${e} in ${t} trials`, (n * t) / d]; }, { cols: 3 }),
      round('find the experimental probability (relative frequency) as a fraction in simplest form.', 16, () => { const t = pick([20, 30, 40, 50, 60, 100]), a = ri(1, t - 1); return [`${a} out of ${t}`, Fr(a, t)]; }),
    ],
    medium: [
      round('find the experimental probability as a percentage. Compare it with the theoretical probability.', 12, () => { const t = pick([20, 40, 50, 100]), a = ri(Math.round(t / 6) - 3, Math.round(t / 6) + 5); return a < 1 ? ['', ''] : [`a 6 came up ${a} times in ${t} rolls`, `${fmt((a / t) * 100, 1)}% (theory 16.7%)`]; }, { cols: 2 }),
      round('find the expected number.', 12, () => { const s = pick([4, 5, 8, 10]), k = ri(1, s - 1), t = s * ri(3, 20); return [`a spinner has ${s} equal sectors, ${k} shaded; ${t} spins land on shaded`, (k * t) / s]; }, { cols: 3 }),
    ],
  }),
  '11.05': ({ round, list, ri, pick }) => ({
    easy: [
      round('find P(not E): subtract P(E) from 1.', 24, () => { const d = pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20]), n = ri(1, d - 1); return gcd(n, d) > 1 ? ['', ''] : [`P(E) = ${F(n, d)}`, F(d - n, d)]; }),
      round('find P(not E).', 16, () => { const p = ri(1, 99); return ri(0, 1) ? [`P(E) = ${fmt(p / 100)}`, fmt(1 - p / 100)] : [`P(E) = ${p}%`, `${100 - p}%`]; }),
    ],
    medium: [
      list('describe the complementary event.', [['rolling a 6', 'not rolling a 6 (rolling 1 to 5)'], ['tossing heads', 'tossing tails'], ['choosing a red card', 'choosing a black card'], ['rolling an even number', 'rolling an odd number'], ['winning', 'not winning (losing or drawing)'],
        ['choosing a vowel', 'choosing a consonant'], ['it rains', 'it does not rain'], ['rolling less than 3', 'rolling 3 or more'], ['choosing a heart', 'choosing a club, diamond or spade'], ['passing the test', 'failing the test']], { cols: 2 }),
      round('find P(not the colour given) as a fraction.', 12, () => { const a = ri(1, 9), b = ri(1, 9), c = ri(1, 9), [c1, c2, c3] = COL.slice(0, 3); const t = a + b + c, x = pick([[c1, a], [c2, b], [c3, c]]); return [`${a} red, ${b} blue, ${c} green: P(not ${x[0]})`, Fr(t - x[1], t)]; }, { cols: 3 }),
    ],
  }),
};
