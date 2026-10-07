// Chapter 11 Probability: mixed-practice questions (lib/mixed.js). Every question stands on its own.
const D = require('../../lib/diagrams');
const { F, simp, fmt } = require('../../lib/calc');

const N = (v) => fmt(v, 4);
const S = (n, d) => { const [a, b] = simp([n, d]); return b === 1 ? String(a) : F(a, b); };
const pct = (n, d) => `${fmt((n / d) * 100, 1)}%`;
const COLOURS = ['red', 'blue', 'green', 'yellow', 'white', 'black'];
const spin = (labels) => D.spinner({ sectors: labels.map((label) => ({ label })), w: 34, h: 34 });
const spinSized = (secs) => D.spinner({ sectors: secs.map(([label, size]) => ({ label, size })), w: 34, h: 34 });
const WORDS = ['MATHS', 'APPLE', 'BANANA', 'PENCIL', 'SCHOOL', 'SUMMER', 'RABBIT', 'TEACHER'];
const NAMES = ['Ali', 'Mia', 'Zac', 'Lena', 'Kai', 'Ruby', 'Tom', 'Priya', 'Jack', 'Aisha', 'Noah', 'Chloe'];
const bag = (K, k = 3) => { const cs = K.shuffle(COLOURS).slice(0, k); return cs.map((c) => [c, K.ri(1, 8)]); };
const bagText = (b) => b.map(([c, n]) => `${n} ${c}`).join(', ').replace(/, ([^,]*)$/, ' and $1');
const words = (p) => (p === 0 ? 'impossible' : p === 1 ? 'certain' : p === 0.5 ? 'even chance' : p < 0.5 ? 'unlikely' : 'likely');

module.exports = {
  '11.01': {
    idea: 'The sample space is the list of every possible outcome. Outcomes are equally likely when each one has the same chance of happening.',
    ex: [['List the sample space for rolling a die.', ['every face', '{1, 2, 3, 4, 5, 6}']], ['List the sample space for tossing two coins.', ['coin 1, then coin 2', '{HH, HT, TH, TT}']], ['Are the outcomes on this spinner equally likely?', ['the sectors are different sizes', 'no'], spinSized([['A', 2], ['B', 1], ['C', 1]])]],
    look: ['10.01'],
    e: [
      (K) => { const ls = K.shuffle(['A', 'B', 'C', 'D', 'E']).slice(0, K.ri(3, 5)); return { q: 'List the sample space for this spinner.', fig: spin(ls), fh: 26, a: `{${[...ls].sort().join(', ')}}` }; },
      (K) => { const w = K.pick(WORDS); return { q: `A letter is chosen from the word ${w}. List the sample space.`, a: `{${[...new Set(w)].join(', ')}}`, key: w }; },
      (K) => { const cs = K.shuffle(COLOURS).slice(0, 3); return { q: `A counter is picked from a bag of ${cs.join(', ')} counters. List the sample space.`, a: `{${cs.join(', ')}}` }; },
      (K) => { const n = K.pick([8, 10, 12]); return { q: `A number from 1 to ${n} is chosen. List the outcomes that are even.`, a: Array.from({ length: n / 2 }, (_, i) => 2 * i + 2).join(', '), key: `even${n}` }; },
      (K) => { const [q, a] = K.pick([['How many outcomes are there when you roll a die?', '6'], ['How many outcomes are there when you toss a coin?', '2'], ['How many outcomes are there when you choose a day of the week?', '7'], ['How many outcomes are there when you choose a month of the year?', '12']]); return { q, a, key: q }; },
    ],
    m: [
      (K) => { const b = bag(K); return { q: `A bag has ${bagText(b)} counters. Are the colours equally likely to be picked? Explain.`, a: new Set(b.map((x) => x[1])).size === 1 ? 'Yes: there are the same number of each.' : 'No: there are different numbers of each colour.', n: 2 }; },
      (K) => { const k = K.ri(0, 1); return k ? { q: 'Are the outcomes on this spinner equally likely?', fig: spinSized([['1', 1], ['2', 1], ['3', 2]]), fh: 26, a: 'no: 3 has a bigger sector', key: 'unequal' } : { q: 'Are the outcomes on this spinner equally likely?', fig: spin(['1', '2', '3', '4']), fh: 26, a: 'yes: the sectors are the same size', key: 'equal' }; },
      () => ({ q: 'List the sample space for tossing a coin and rolling a die.', w: ['H1, H2, H3, H4, H5, H6', 'T1, T2, T3, T4, T5, T6 (12 outcomes)'], key: 'coin die' }),
    ],
    c: [
      () => ({ q: 'Two dice are rolled and the numbers are added. List the possible totals. Are they equally likely?', w: ['2, 3, 4, …, 12', 'No: 7 can happen 6 ways, 2 only 1 way'], key: 'two dice' }),
      (K) => { const ls = K.shuffle(['A', 'B', 'C']); return { q: `List every order for the three letters ${ls.join(', ')}.`, w: ['ABC, ACB, BAC', 'BCA, CAB, CBA (6 orders)'], key: 'orders' }; },
      () => ({ q: 'Two coins are tossed. How many outcomes are in the sample space? How many give one head and one tail?', w: ['HH, HT, TH, TT: 4', 'one of each: HT and TH, so 2'], key: 'coins' }),
    ],
  },

  '11.02': {
    idea: 'When the outcomes are equally likely, P(event) = the number of outcomes in the event ÷ the total number of outcomes. Write it as a fraction, a decimal or a percentage.',
    ex: [['Find P(rolling an even number) on a die.', ['even: 2, 4, 6: 3 outcomes of 6', `= ${F(3, 6)} = ${F(1, 2)}`]], ['A bag has 3 red and 5 blue counters. Find P(red).', ['3 red out of 8', `= ${F(3, 8)}`]], ['Find P(a heart) from a full deck of 52 cards.', ['13 hearts', `${F(13, 52)} = ${F(1, 4)} = 25%`]]],
    look: ['11.01', '4.01'],
    e: [
      (K) => { const n = K.ri(1, 6); return { q: `A die is rolled. Find P(${n}).`, a: F(1, 6), key: `p${n}` }; },
      (K) => { const b = bag(K, 2), [c, n] = b[0], t = b[0][1] + b[1][1]; return { q: `A bag has ${bagText(b)} counters. One is picked. Find P(${c}).`, a: S(n, t) }; },
      (K) => { const [e, n] = K.pick([['an even number', 3], ['an odd number', 3], ['a number greater than 4', 2], ['a number less than 3', 2], ['a 1 or a 6', 2], ['a number greater than 2', 4]]); return { q: `A die is rolled. Find P(${e}).`, a: S(n, 6), key: e }; },
    ],
    m: [
      (K) => { const ls = K.pick([['A', 'B', 'A', 'C'], ['1', '2', '2', '2', '3', '1'], ['R', 'B', 'R', 'R', 'G'], ['X', 'Y', 'X', 'Y', 'X', 'Z', 'X', 'Z']]); const l = K.pick([...new Set(ls)]); const n = ls.filter((x) => x === l).length; return { q: `This spinner has equal sectors. Find P(${l}).`, fig: spin(ls), fh: 26, w: [`${n} out of ${ls.length}`, `= ${S(n, ls.length)}`] }; },
      (K) => { const [e, n] = K.pick([['a heart', 13], ['a king', 4], ['a red card', 26], ['the ace of spades', 1], ['a picture card (J, Q, K)', 12], ['a black 7', 2]]); return { q: `A card is picked from a full deck of 52. Find P(${e}). Write it as a fraction and a percentage.`, w: [`${S(n, 52)}`, `≈ ${pct(n, 52)}`], key: e }; },
      (K) => { const w = K.pick(WORDS), l = K.pick([...new Set(w)]), n = [...w].filter((x) => x === l).length; return { q: `A letter is picked from ${w}. Find P(${l}).`, w: [`${n} out of ${w.length} letters`, `= ${S(n, w.length)}`] }; },
    ],
    c: [
      () => ({ q: 'Two coins are tossed. Find P(two heads) and P(one head and one tail).', w: ['HH, HT, TH, TT', `P(HH) = ${F(1, 4)}, P(one of each) = ${F(1, 2)}`], key: 'coins' }),
      (K) => { const t = K.pick([[7, 6], [8, 5], [6, 5], [2, 1], [12, 1], [10, 3]]); return { q: `Two dice are rolled and the numbers added. Find P(a total of ${t[0]}).`, w: [`${t[1]} ways out of 36`, `= ${S(t[1], 36)}`], key: `t${t[0]}` }; },
      (K) => { const b = bag(K, 3), t = b.reduce((s, x) => s + x[1], 0), [c1, n1] = b[0], [c2, n2] = b[1]; return { q: `A bag has ${bagText(b)} counters. Find P(${c1} or ${c2}).`, w: [`${n1} + ${n2} = ${n1 + n2} out of ${t}`, `= ${S(n1 + n2, t)}`] }; },
    ],
  },

  '11.03': {
    idea: 'Probability goes from 0 (impossible) to 1 (certain). ½ is an even chance. Below ½ is unlikely; above ½ is likely.',
    ex: [['Describe a probability of 0.8 in words.', ['between ½ and 1', 'likely']], ['Describe the chance of rolling a 7 on a die.', ['a die only goes to 6', 'impossible: P = 0']], ['Order from least to most likely: rolling an even number, rolling a 6, rolling less than 7.', [`${F(1, 6)}, ${F(1, 2)}, 1`, '6, even, less than 7']]],
    look: ['11.02'],
    e: [
      (K) => { const p = K.pick([0, 0.1, 0.25, 0.5, 0.7, 0.9, 1, 0.05, 0.95]); return { q: `Describe a probability of ${N(p)} in words.`, a: words(p), key: `p${p}` }; },
      (K) => { const [e, w] = K.pick([['rolling a 7 on a die', 'impossible'], ['the sun rising tomorrow', 'certain'], ['a coin landing on heads', 'even chance'], ['rolling a 6 on a die', 'unlikely'], ['rolling less than 6 on a die', 'likely'], ['picking a red card from a deck', 'even chance']]); return { q: `Describe the chance of ${e}.`, a: w, key: e }; },
      (K) => { const [w, v] = K.pick([['impossible', '0'], ['certain', '1'], ['an even chance', '½ (0.5)']]); return { q: `What probability means ${w}?`, a: v, key: w }; },
    ],
    m: [
      (K) => { const [n, d] = K.pick([[1, 6], [5, 6], [1, 2], [3, 4], [1, 10], [2, 5], [7, 8]]); return { q: `A probability is ${F(n, d)}. Is the event unlikely, an even chance or likely? Write it as a decimal.`, w: [`${F(n, d)} = ${N(n / d)}`, words(n / d)], key: `${n}/${d}` }; },
      (K) => { const evs = K.shuffle([['rolling a 6 on a die', 1 / 6], ['tossing a head', 1 / 2], ['rolling a number less than 5', 4 / 6], ['rolling a 9 on a die', 0]]); return { q: `Order from least to most likely: ${evs.map((e) => e[0]).join('; ')}.`, a: [...evs].sort((a, b) => a[1] - b[1]).map((e) => e[0]).join('; '), n: 2, key: `order ${K.ri(1, 2)}` }; },
    ],
    c: [
      (K) => { const [w, a] = K.pick([['an even chance', 'e.g. a coin landing on tails'], ['certain', 'e.g. rolling less than 7 on a die'], ['impossible', 'e.g. rolling a 0 on a die'], ['unlikely but possible', 'e.g. rolling a 1 on a die']]); return { q: `Describe an event that is ${w}.`, a, n: 2, key: w }; },
      (K) => { const who = K.pick(NAMES), p = K.pick([1.2, 1.5, -0.2, 2]); return { q: `${who} says an event has a probability of ${N(p)}. Explain why that cannot be right.`, a: 'Probabilities are always from 0 to 1.', n: 2, key: `p${p}` }; },
    ],
  },

  '11.04': {
    idea: 'Experimental probability = the number of times the event happened ÷ the number of trials. With more trials it usually gets closer to the theoretical probability.',
    ex: [['A coin is tossed 50 times and lands heads 28 times. Find the experimental P(heads).', [`${F(28, 50)}`, '= 0.56']], ['What is the theoretical P(heads)? Compare.', [`${F(1, 2)} = 0.5`, 'close to 0.56']], ['A die is rolled 120 times. How many 3s do you expect?', [`${F(1, 6)} × 120`, '= 20']]],
    look: ['11.02', '4.12'],
    e: [
      (K) => { const t = K.pick([20, 40, 50, 100]), h = K.ri(Math.round(t * 0.35), Math.round(t * 0.65)); return { q: `A coin is tossed ${t} times and lands heads ${h} times. Find the experimental P(heads).`, a: `${S(h, t)} = ${N(h / t)}` }; },
      (K) => { const t = K.pick([60, 120, 300, 600]); return { q: `A die is rolled ${t} times. How many 6s would you expect?`, a: N(t / 6) }; },
      (K) => { const t = K.pick([10, 20, 25, 50]), n = K.ri(1, t - 1); return { q: `${K.pick(NAMES)} took ${t} free throws and scored ${n}. Find the experimental probability of scoring, as a percentage.`, a: pct(n, t) }; },
    ],
    m: [
      (K) => { const t = K.pick([30, 60, 90]), s = K.ri(t / 6 - 4, t / 6 + 6); return { q: `A die is rolled ${t} times and shows six ${s} times. Compare the experimental and theoretical P(six).`, w: [`experimental: ${S(s, t)} ≈ ${N(Math.round((s / t) * 100) / 100)}`, `theoretical: ${F(1, 6)} ≈ 0.17`] }; },
      (K) => { const b = K.pick([[2, 3], [1, 4], [3, 5]]), t = b[1] * K.pick([10, 20, 30]); return { q: `A spinner has P(blue) = ${F(...b)}. How many blues do you expect in ${t} spins?`, w: [`${F(...b)} × ${t}`, `= ${N((b[0] / b[1]) * t)}`] }; },
    ],
    c: [
      (K) => { const res = [K.ri(8, 12), K.ri(8, 12), K.ri(8, 12), K.ri(8, 12), K.ri(8, 12), K.ri(22, 28)], t = res.reduce((a, b) => a + b, 0); return { q: 'A die was rolled. Find the experimental P(6). Do you think the die is fair? Explain.', fig: `<table class="data-table"><tr><th>Face</th>${[1, 2, 3, 4, 5, 6].map((f) => `<td>${f}</td>`).join('')}</tr><tr><th>Count</th>${res.map((r) => `<td>${r}</td>`).join('')}</tr></table>`, w: [`${res[5]} out of ${t} ≈ ${N(Math.round((res[5] / t) * 100) / 100)}`, 'probably not: 6 came up far more often than the others'] }; },
      (K) => { const a = K.ri(4, 7), b = K.ri(46, 54); return { q: `${K.pick(NAMES)} tossed a coin 10 times and got ${a} heads. Another student tossed it 100 times and got ${b} heads. Whose result is a better estimate of P(heads)? Why?`, a: 'The 100 tosses: more trials usually give a result closer to the true probability.', n: 2 }; },
    ],
  },

  '11.05': {
    idea: 'The complement of an event is the event not happening. An event and its complement add to 1, so P(not A) = 1 − P(A).',
    ex: [['Find P(not rolling a 6) on a die.', [`1 − ${F(1, 6)}`, `= ${F(5, 6)}`]], ['P(rain) = 0.3. Find P(no rain).', ['1 − 0.3', '= 0.7']], ['What is the complement of rolling an even number?', ['the event does not happen', 'rolling an odd number']]],
    look: ['11.02', '11.03'],
    e: [
      (K) => { const p = K.ri(1, 9) / 10; return { q: `P(A) = ${N(p)}. Find P(not A).`, a: N(Math.round((1 - p) * 10) / 10) }; },
      (K) => { const n = K.ri(1, 6); return { q: `A die is rolled. Find P(not ${n}).`, a: F(5, 6), key: `n${n}` }; },
      (K) => { const [e, c] = K.pick([['rolling an even number', 'rolling an odd number'], ['tossing a head', 'tossing a tail'], ['winning a game (no draws)', 'losing the game'], ['picking a red card', 'picking a black card'], ['rolling a 6', 'rolling 1, 2, 3, 4 or 5']]); return { q: `What is the complement of ${e}?`, a: c, key: e }; },
    ],
    m: [
      (K) => { const p = K.ri(5, 95); return { q: `The chance of rain is ${p}%. What is the chance of no rain?`, w: [`100% − ${p}%`, `= ${100 - p}%`] }; },
      (K) => { const b = bag(K, 3), t = b.reduce((s, x) => s + x[1], 0), [c, n] = b[0]; return { q: `A bag has ${bagText(b)} counters. Find P(not ${c}).`, w: [`P(${c}) = ${S(n, t)}`, `P(not ${c}) = 1 − ${S(n, t)} = ${S(t - n, t)}`] }; },
      (K) => { const [n, d] = K.pick([[2, 7], [3, 8], [5, 12], [4, 9], [1, 5]]); return { q: `P(win) = ${F(n, d)}. There are no draws. Find P(lose).`, w: [`1 − ${F(n, d)}`, `= ${F(d - n, d)}`], key: `${n}/${d}` }; },
    ],
    c: [
      (K) => { const r = K.ri(1, 4) / 10, b = K.ri(2, 5) / 10; return r + b >= 1 ? null : { q: `A spinner lands on red, blue or green. P(red) = ${N(r)} and P(blue) = ${N(b)}. Find P(green).`, w: [`${N(r)} + ${N(b)} = ${N(Math.round((r + b) * 10) / 10)}`, `P(green) = ${N(Math.round((1 - r - b) * 10) / 10)}`] }; },
      (K) => { const t = K.pick([20, 30, 40, 50]), n = K.ri(3, t / 2); return { q: `In a class of ${t}, ${n} students walk to school. A student is picked. Find P(does not walk), as a percentage.`, w: [`${t - n} out of ${t}`, `= ${pct(t - n, t)}`] }; },
      (K) => { const who = K.pick(NAMES); return { q: `${who} says "P(rolling a 2) = ${F(1, 6)} and P(rolling a 3) = ${F(1, 6)}, so they are complementary." Is that right? Explain.`, a: `No. Complements must add to 1, and ${F(1, 6)} + ${F(1, 6)} = ${F(1, 3)}.`, n: 2, key: 'claim' }; },
    ],
  },
};
