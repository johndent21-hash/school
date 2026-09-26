// Year 7 Chapter 11: Probability. One 4-page lesson per exercise in Test Yourself 11.
const lesson = require('../../lib/lesson');
const D = require('../../lib/diagrams');
const { svg, text, line } = require('../../lib/graphs');
const { F, simp } = require('../../lib/calc');

// Probability as a simplified stacked fraction.
const P = (n, d) => { if (n === 0) return '0'; if (n === d) return '1'; const [a, b] = simp([n, d]); return F(a, b); };
const pc = (n, d) => `${((n / d) * 100).toFixed(1)}%`;
const spin = D.spinner({ sectors: [{ label: '1', size: 4 }, { label: '2', size: 2 }, { label: '3', size: 6 }, { label: '4', size: 3 }, { label: '5', size: 1 }], w: 40, h: 40 });
const spin4 = D.spinner({ sectors: [{ label: 'A' }, { label: 'B' }, { label: 'C' }, { label: 'D' }], w: 36, h: 36 });
// Probability scale 0 to 1 with lettered marks.
const scale = (marks = [], words = true) => {
  const W = 92, x0 = 6, x1 = 86, y = 12;
  let b = line(x0, y, x1, y, '#3d3b3c', 0.5);
  [[0, '0'], [0.5, '½'], [1, '1']].forEach(([v, t]) => { const x = x0 + v * (x1 - x0); b += line(x, y - 1.5, x, y + 1.5, '#3d3b3c', 0.4) + text(x, y + 5, t, { size: 3, anchor: 'middle', weight: 600 }); });
  if (words) [['impossible', 0], ['even chance', 0.5], ['certain', 1]].forEach(([t, v]) => { b += text(x0 + v * (x1 - x0), y - 3.5, t, { size: 2.4, anchor: 'middle' }); });
  marks.forEach(([t, v]) => { const x = x0 + v * (x1 - x0); b += `<circle cx="${x}" cy="${y}" r="1" fill="#3f63be"/>` + text(x, y + 9.5, t, { size: 3, anchor: 'middle', weight: 700, fill: '#3f63be' }); });
  return svg(W, 24, b);
};

module.exports = {
  year: 7, stage: 4, number: 11, title: 'Probability', accent: '#922b21',
  fileName: 'Year7-Ch11-Probability',
  goals: ['list the sample space of an experiment', 'find the probability of simple events as fractions, decimals and percentages', 'use the probability scale and chance words', 'compare experimental and theoretical probability', 'find the probability of complementary events'],
  syllabus: 'NSW Mathematics K–10 Syllabus (2022), Stage 4 Statistics and probability: MA4-PRO-C-01 solves problems involving the probabilities of simple chance experiments.',
  lessons: [
    lesson({
      code: '11.01', title: 'Sample space',
      li: ['list the sample space of a chance experiment', 'decide whether outcomes are equally likely'],
      sc: ['list every possible outcome', 'write the sample space in braces { }', 'explain why outcomes are or are not equally likely'],
      terms: ['Outcome', 'Sample space', 'Equally likely'],
      we: ['List the sample space for tossing a coin.', 'List the sample space for rolling a die.', 'List the outcomes of a driving test.', 'List the classifications of a new film.', 'Set B spinner: how many outcomes? Are they equally likely?', 'List the sample space for the winner when Katrina plays Biljana at tennis.'],
      a: { text: 'List the sample space.', kind: 'short', items: ['Spinning a spinner with A, B, C, D', 'Choosing a day of the week', 'Choosing a vowel', 'Rolling a die', 'The result of a soccer match for one team', 'The season of a person’s birthday'] },
      b: { text: 'Use the spinner.', kind: 'short', figSide: true, fig: spin, items: ['How many outcomes?', 'Why aren’t they equally likely?', 'Which number is most likely?', 'Which is least likely?', 'Which number has a probability of 25%?'] },
      c: { text: 'List the sample space. Are the outcomes equally likely?', kind: 'work', cols: 3, items: ['The public transport students use to get to school', 'Choosing a letter from the word MATHS', 'Choosing a letter from the word APPLE', 'The number of heads when 2 coins are tossed', 'The colour of a traffic light when you arrive', 'Drawing a card suit from a deck'] },
      d: { text: 'Two-step experiments.', kind: 'work', items: ['List the sample space for tossing 2 coins (e.g. HT).', 'List all outcomes for spinning spinner ABCD and tossing a coin.', 'How many outcomes are there for rolling 2 dice? Explain.', 'Design a spinner with 4 outcomes that are not equally likely.'] },
      ext: { q: 'How many outcomes are there when 3 coins are tossed? List them.', steps: ['Each coin has 2 outcomes: 2 × 2 × 2', 'HHH, HHT, HTH, HTT, THH, THT, TTH, TTT'], a: '8 outcomes', qs: ['How many outcomes when 4 coins are tossed?', 'How many different 2-letter codes can be made from A, B, C if letters can repeat?'] },
      summary: { steps: ['An <b>outcome</b> is one possible result.', 'The <b>sample space</b> is the list of all outcomes.', 'Write it in braces: {H, T}.', 'Outcomes are <b>equally likely</b> if each has the same chance.'],
        worked: [['Tossing a coin', ['2 outcomes'], '{H, T}'], ['Rolling a die', ['6 outcomes'], '{1, 2, 3, 4, 5, 6}'], ['Spinner with unequal sectors', ['Different sector sizes'], 'not equally likely'], ['3 coins', ['2 × 2 × 2'], '8 outcomes']] },
      exit: { qs: ['List the sample space for choosing a primary colour.', 'How many outcomes are there when rolling a die?', 'Are the outcomes of a test (pass/fail) equally likely? Explain.'] },
      ans: { we: ['{H, T}', '{1, 2, 3, 4, 5, 6}', '{pass, fail}', '{G, PG, M, MA15+, R18+}', '5; no, the sectors are different sizes', '{Katrina, Biljana}'], a: ['{A, B, C, D}', '{Mon, Tue, Wed, Thu, Fri, Sat, Sun}', '{a, e, i, o, u}', '{1, 2, 3, 4, 5, 6}', '{win, draw, lose}', '{summer, autumn, winter, spring}'],
        b: ['5', 'the sectors are different sizes', '3', '5', '1'], c: ['e.g. {bus, train, ferry}: not equally likely', '{M, A, T, H, S}: equally likely', '{A, P, L, E}: P is more likely', '{0, 1, 2}: 1 is more likely', '{red, amber, green}: not equally likely', '{hearts, diamonds, clubs, spades}: equally likely'],
        d: ['{HH, HT, TH, TT}', 'A-H, A-T, B-H, B-T, C-H, C-T, D-H, D-T', '36 (6 × 6)', 'e.g. sectors of 180°, 90°, 45°, 45°'], ext: ['16', '9'], exit: ['{red, yellow, blue}', '6', 'no: it depends on the student'] },
    }),

    lesson({
      code: '11.02', title: 'Probability',
      li: ['find the probability of a simple event'],
      sc: ['use P(event) = number of favourable outcomes ÷ total outcomes', 'write probability as a fraction, decimal or percentage', 'round percentages to 1 decimal place'],
      terms: ['Probability', 'Event', 'At random'],
      we: ['On a die, find P(1).', 'On a die, find P(odd number).', 'On a die, find P(number less than 5).', 'A box has 15 dark, 13 milk and 12 white chocolates. Find P(white).', 'A truck has 325 boxes of books, 210 of rulers, 360 of paper and 145 of pens. Find P(rulers) as a % (1 d.p.).', 'Using the truck, find P(no pens) as a % (1 d.p.).'],
      a: { text: 'A die is rolled. Find the probability of rolling:', kind: 'short', items: ['a 6', 'an even number', 'a number less than 5', 'a 7', 'a number greater than 0', 'a 2 or a 3'] },
      b: { text: 'A letter is chosen at random from PROBABILITY. Find the probability of choosing:', kind: 'short', items: ['B', 'I', 'a vowel', 'Y', 'a letter in the word ROB', 'Z'] },
      c: { text: 'Find each probability as a fraction and a percentage (1 d.p.).', kind: 'work', cols: 3, items: ['15 dark, 13 milk, 12 white chocolates: P(white)', 'P(dark)', 'P(not milk)', 'Truck (1040 boxes): P(rulers)', 'P(exercise books or paper)', 'P(erasers)'] },
      d: { text: 'Problems.', kind: 'work', items: ['A class has 14 girls and 11 boys. One student is chosen at random. Find P(boy) as a decimal.', 'A raffle sells 250 tickets. You buy 4. Find your probability of winning as a percentage.', 'A bag has red and blue counters. P(red) = 0.35. What is P(blue)?', 'A bag has 12 counters and P(green) = ¼. How many are green?'] },
      ext: { q: 'A card is drawn from a standard deck of 52. Find P(red king).', steps: ['There are 2 red kings (hearts, diamonds)', `${F(2, 52)} simplifies`], a: F(1, 26), qs: ['Find P(a heart or a king) from a standard deck.', 'Find P(a picture card: J, Q, K) from a standard deck.'] },
      summary: { steps: ['P(event) = favourable outcomes ÷ total outcomes.', 'Probabilities are between 0 and 1.', 'Simplify fractions.', 'Percentage: × 100%, round as asked.'],
        worked: [['P(odd) on a die', ['3 odd of 6'], P(3, 6)], ['P(white chocolate)', ['12 of 40'], `${P(12, 40)} (C)`], ['P(rulers)', ['210 ÷ 1040'], pc(210, 1040)], ['P(red king)', ['2 of 52'], F(1, 26)]] },
      exit: { qs: ['Find P(5) on a die.', 'A bag has 3 red and 7 blue marbles. Find P(red).', 'Write your answer to Question 2 as a percentage.'] },
      ans: { we: [P(1, 6), P(3, 6), P(4, 6), `${P(12, 40)} (C)`, pc(210, 1040), pc(895, 1040)], a: [P(1, 6), P(3, 6), P(4, 6), '0', '1', P(2, 6)], b: [P(2, 11), P(2, 11), P(4, 11), P(1, 11), P(4, 11), '0'],
        c: [`${P(12, 40)}, 30.0%`, `${P(15, 40)}, 37.5%`, `${P(27, 40)}, 67.5%`, `${P(210, 1040)}, ${pc(210, 1040)}`, `${P(685, 1040)}, ${pc(685, 1040)}`, '0, 0%'], d: ['0.44', '1.6%', '0.65', '3'], ext: [P(16, 52), P(12, 52)], exit: [P(1, 6), P(3, 10), '30%'] },
    }),

    lesson({
      code: '11.03', title: 'The probability scale',
      li: ['describe chance using words and the probability scale'],
      sc: ['place events on a scale from 0 (impossible) to 1 (certain)', 'match probabilities to words such as unlikely and good chance', 'find probabilities from a jar of objects'],
      terms: ['Certain', 'Impossible', 'Even chance'],
      we: [{ t: 'Where on the scale is the chance that the next baby is a girl?', fig: scale([['A', 0.1], ['B', 0.5], ['C', 0.75], ['D', 1]], false) }, 'Which word describes a probability of 0.29?', 'Which is certain: choosing a 4 from {1, 2, 3, 4}; a red ball from green balls; an odd or even number on a die; a baby being a girl?', 'A jar has 1 red, 6 yellow, 2 white and 5 black jellybeans. Find P(yellow).', 'Find P(white or red).', 'Find P(blue) and P(not green).'],
      a: { text: 'Describe each event using a chance word.', kind: 'short', keepShort: true, items: ['The sun will rise tomorrow.', 'Rolling a 7 on a die.', 'A coin lands on heads.', 'It will snow in Sydney in January.', 'Rolling a number less than 6.', 'Your teacher is over 10 years old.'] },
      b: { text: 'Match each probability to a word: impossible, unlikely, even chance, likely, certain.', kind: 'short', items: ['0', '0.29', '½', '0.85', '1', '15%'] },
      c: { text: 'A jar has 1 red, 6 yellow, 2 white and 5 black jellybeans. Find:', kind: 'work', cols: 3, items: ['P(yellow)', 'P(white or red)', 'P(blue)', 'P(not green)', 'P(black)', 'P(not yellow)'] },
      d: { text: 'Mark each event on the scale.', kind: 'work', items: [{ t: 'Mark: A rolling an even number; B rolling a 6; C rolling a number from 1 to 6; D rolling a 0.', draw: `<div class="template-card">${scale()}</div>` }, 'Describe an event that is: (a) impossible (b) unlikely (c) certain.'] },
      ext: { q: 'A bag has 20 counters. P(red) = 0.4 and P(blue) = 0.35. The rest are green. How many are green?', steps: ['P(green) = 1 − 0.4 − 0.35 = 0.25', '0.25 × 20'], a: '5', qs: ['A spinner has P(red) = ⅓. It has 12 equal sectors. How many are red?', 'Design a bag of 10 marbles where P(blue) is “unlikely” and P(red) is “likely”.'] },
      summary: { steps: ['Probability goes from 0 (impossible) to 1 (certain).', '½ is an even chance.', 'Less than ½: unlikely. More than ½: likely.', 'Count the objects to find each probability.'],
        worked: [['Baby is a girl', ['About half'], 'B (even chance)'], ['0.29', ['Less than ½'], 'unlikely'], ['P(yellow)', ['6 of 14'], P(6, 14)], ['Green counters', ['0.25 × 20'], '5']] },
      exit: { qs: ['What is the probability of an impossible event?', 'Which word describes P = 0.9?', 'A bag has 3 red and 5 blue. Find P(not red).'] },
      ans: { we: ['B', 'unlikely', 'rolling an odd or even number on a die (C)', P(6, 14), P(3, 14), '0; 1'], a: ['certain', 'impossible', 'even chance', 'very unlikely', 'likely', 'certain'], b: ['impossible', 'unlikely', 'even chance', 'likely', 'certain', 'unlikely'],
        c: [P(6, 14), P(3, 14), '0', '1', P(5, 14), P(8, 14)], d: ['A at ½, B at ⅙, C at 1, D at 0', 'own examples'], ext: ['4', 'e.g. 2 blue, 7 red, 1 green'], exit: ['0', 'very likely', P(5, 8)] },
    }),

    lesson({
      code: '11.04', title: 'Experimental probability',
      li: ['compare experimental and theoretical probability'],
      sc: ['find theoretical probability from equally likely outcomes', 'find experimental (observed) probability from results', 'find expected frequency = probability × number of trials'],
      terms: ['Experimental probability', 'Expected frequency', 'Trial'],
      we: ['A coin is tossed 80 times. What is the theoretical P(head)?', 'What is the expected number of heads in 80 tosses?', 'It landed heads 24 times. What is the observed probability of a head?', 'How does the observed frequency compare with the expected frequency?', 'A die is rolled 60 times. How many 6s are expected?', 'Why do more trials give a better estimate?'],
      a: { text: 'Find the theoretical probability.', kind: 'short', items: ['P(head) on a coin', 'P(4) on a die', 'P(A) on spinner ABCD', 'P(even) on a die', 'P(red) from 3 red, 2 blue', 'P(vowel) from A, B, C, D, E'] },
      b: { text: 'Find the expected frequency.', kind: 'short', items: ['Heads in 80 tosses', '6s in 60 rolls', 'Even numbers in 50 rolls', 'A on spinner ABCD in 200 spins', 'Red in 100 draws (3 red, 2 blue, replaced)', 'Tails in 1000 tosses'] },
      c: { text: 'Find the observed (experimental) probability.', kind: 'work', cols: 3, items: ['24 heads in 80 tosses', '15 sixes in 60 rolls', '42 reds in 100 draws', '7 wins in 20 games', '130 A’s in 400 spins', '0 fives in 12 rolls'] },
      d: { text: 'Do an experiment. Toss a coin 20 times (or use results from your class).', kind: 'work', items: [{ t: 'Record your results in a tally table.', draw: `<div class="template-card"><table class="data-table" style="width:100%"><tr><th>Outcome</th><th>Tally</th><th>Frequency</th></tr><tr><td>Heads</td><td style="height:9mm"></td><td></td></tr><tr><td>Tails</td><td style="height:9mm"></td><td></td></tr></table></div>` }, 'Find your observed P(head). Compare it with the theoretical probability. Combine with the class results. What do you notice?'] },
      ext: { q: 'A spinner landed on red 45 times in 150 spins. Estimate how many times it will land on red in 1000 spins.', steps: ['Observed P(red) = 45 ÷ 150 = 0.3', '0.3 × 1000'], a: 'about 300 times', qs: ['A drawing pin landed point up 36 times in 60 throws. Estimate how many times it lands point up in 250 throws.', 'Is this spinner likely to have equal sectors if there are 4 colours? Explain.'] },
      summary: { steps: ['Theoretical P = favourable ÷ total (equally likely outcomes).', 'Observed P = number of times it happened ÷ number of trials.', 'Expected frequency = P × number of trials.', 'More trials: observed P gets closer to theoretical P.'],
        worked: [['Theoretical P(head)', ['1 of 2'], P(1, 2)], ['Expected heads in 80', ['½ × 80'], '40'], ['Observed P(head)', ['24 ÷ 80'], P(24, 80)], ['Red in 1000 spins', ['0.3 × 1000'], 'about 300']] },
      exit: { qs: ['What is the theoretical P(3) on a die?', 'How many 3s are expected in 120 rolls?', 'A 3 came up 25 times in 120 rolls. Find the observed P(3).'] },
      ans: { we: [P(1, 2), '40', P(24, 80), 'fewer heads than expected (24 vs 40)', '10', 'the results even out over many trials'], a: [P(1, 2), P(1, 6), P(1, 4), P(1, 2), P(3, 5), P(2, 5)], b: ['40', '10', '25', '50', '60', '500'],
        c: [P(24, 80), P(15, 60), P(42, 100), P(7, 20), P(130, 400), '0'], d: ['own results', 'answers vary; class results close to ½'], ext: ['about 150', 'no: red has P ≈ 0.3, not 0.25'], exit: [P(1, 6), '20', P(25, 120)] },
    }),

    lesson({
      code: '11.05', title: 'Complementary events',
      li: ['find the probability of complementary events'],
      sc: ['describe the <b>complement</b> of an event (“not” the event)', 'use P(not E) = 1 − P(E)', 'solve problems using complementary events'],
      terms: ['Complementary events', 'Complement'],
      we: ['Write the complement of selecting a queen from a deck, and its probability.', 'Write the complement of rolling a multiple of 3 on a die, and its probability.', 'Write the complement of buying the winning ticket out of 550 sold, and its probability.', 'Names Ashleigh, Hamish, Sarah, Jake, Hayley: find P(Hamish).', 'Find P(a girl’s name) and P(not beginning with H).', 'A bag has 8 brown, 4 black and 3 white marbles. Find P(not brown).'],
      a: { text: 'Write the complementary event.', kind: 'short', items: ['Rolling a 6', 'Getting a head', 'Drawing a red card', 'Winning a game (no draws)', 'Choosing a vowel', 'Rolling an even number'] },
      b: { text: 'Find P(not E).', kind: 'short', items: [`P(E) = ${F(1, 4)}`, 'P(E) = 0.3', 'P(E) = 45%', `P(E) = ${F(5, 12)}`, 'P(E) = 0.07', 'P(E) = 1'] },
      c: { text: 'Find each probability.', kind: 'work', cols: 3, items: ['P(not a queen) from a deck', 'P(not a multiple of 3) on a die', 'P(not winning) with 1 ticket of 550', 'P(not Hamish) from the 5 names', 'P(not brown): 8 brown, 4 black, 3 white', 'P(not a heart) from a deck'] },
      d: { text: 'Problems.', kind: 'work', items: ['The probability it will rain tomorrow is 0.35. What is the probability it will not rain?', 'P(a team wins) = 0.6 and P(draw) = 0.1. Find P(the team loses).', 'In a class, P(student has a pet) = 17/25. There are 25 students. How many do not have a pet?', 'Explain why P(E) + P(not E) = 1.'] },
      ext: { q: 'A spinner has P(red) = 0.2, P(blue) = 0.45, P(green) = the rest. Find P(not blue) and P(green).', steps: ['P(not blue) = 1 − 0.45', 'P(green) = 1 − 0.2 − 0.45'], a: 'P(not blue) = 0.55, P(green) = 0.35', qs: ['A bag has red, white and blue marbles. P(red) = ⅓ and P(white) = ¼. Find P(blue).', 'In 200 spins of the spinner above, how many times would you expect NOT green?'] },
      summary: { steps: ['The complement of E is “not E”.', 'E and not E cover all outcomes.', 'P(not E) = 1 − P(E).', 'Use it when “not” is easier to count.'],
        worked: [['Not a queen', ['4 queens of 52'], P(48, 52)], ['Not a multiple of 3', ['1 − ⅓'], P(4, 6)], ['Not brown', ['7 of 15'], P(7, 15)], ['Spinner', ['1 − 0.45'], '0.55']] },
      exit: { qs: ['Write the complement of rolling a 2.', 'If P(E) = 0.8, find P(not E).', 'A bag has 5 red, 3 blue and 2 green. Find P(not red).'] },
      ans: { we: [`not a queen, ${P(48, 52)}`, `not a multiple of 3, ${P(4, 6)}`, `not winning, ${P(549, 550)}`, P(1, 5), `${P(3, 5)}; ${P(3, 5)}`, P(7, 15)], a: ['not rolling a 6', 'getting a tail', 'drawing a black card', 'losing', 'choosing a consonant', 'rolling an odd number'],
        b: [F(3, 4), '0.7', '55%', F(7, 12), '0.93', '0'], c: [P(48, 52), P(4, 6), P(549, 550), P(4, 5), P(7, 15), P(39, 52)], d: ['0.65', '0.3', '8', 'an event either happens or it does not'], ext: [P(5, 12), '130'], exit: ['not rolling a 2', '0.2', P(5, 10)] },
    }),
  ],
};
