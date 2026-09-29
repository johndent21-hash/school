// Chapter 1 Integers, research-designed lessons (lib/own.js, ../DESIGN.md). Every question is written by hand.
// Lines in a worked example or "Your turn" are the working, one step a line, answer last.
const D = require('../../lib/diagrams');

const line = (min, max, start, moves, done = true) => D.jumps({ min, max, start, moves, done, every: 1 });

module.exports = {
  '1.04': {
    canDo: 'add positive and negative integers',
    doNow: [
      { from: '1.03', q: '−7 ☐ −2&ensp;Write &lt; or &gt;.', a: '−7 &lt; −2' },
      { from: '1.03', q: 'Order smallest to largest: 4, −6, 0, −1', a: '−6, −1, 0, 4' },
      { from: '1.01', q: 'What is the opposite of −9?', a: '9' },
      { from: '1.02', q: 'Start at −4. Move 6 right. Where do you land?', a: '2' },
    ],
    think: { q: 'It is −3°C at 6 am. By noon it is 5°C warmer. What is the temperature at noon?', a: '2°C' },
    words: [
      ['sum:', 'the answer to an addition.'],
      ['−3:', 'say "negative three".'],
      ['zero pair:', '+1 and −1 make 0.'],
    ],
    big: {
      text: '<p>Start at the first number. Adding a <u>positive</u>: move <b>right</b>. Adding a <u>negative</u>: move <b>left</b>.</p>',
      figs: [line(-6, 6, -4, [5]), line(-6, 6, 3, [-5])],
    },
    pairs: [
      { ex: { q: '−5 + 3', fig: line(-7, 3, -5, [3]), lines: ['start at −5, move 3 right', '= −2'] },
        you: { q: '−6 + 4', fig: line(-7, 3, -6, [4], false), lines: ['start at −6, move 4 right', '= −2'] },
        why: { q: 'We moved right. Why?', a: 'We added a positive number (+3), and adding a positive moves right.' } },
      { ex: { q: '2 + (−5)', fig: line(-4, 4, 2, [-5]), lines: ['start at 2, move 5 left', '= −3'] },
        you: { q: '3 + (−7)', fig: line(-5, 4, 3, [-7], false), lines: ['start at 3, move 7 left', '= −4'] },
        why: { q: '2 − 5 also moves 5 left from 2. What does that tell you about 2 + (−5)?', a: '2 + (−5) is the same as 2 − 5. Adding a negative is the same as subtracting.' } },
      { ex: { q: '−4 + (−3)', lines: ['= −4 − 3', '= −7'] },
        you: { q: '−2 + (−6)', lines: ['= −2 − 6', '= −8'] },
        why: { q: 'Tom says −4 + (−3) = 7. What went wrong?', a: 'Tom used "two negatives make a positive". That rule is about multiplying, not adding. Adding a negative moves left, so −4 + (−3) = −7.' } },
    ],
    hinge: {
      q: 'Work out&ensp;−2 + 5',
      options: ['−7', '3', '−3', '7'], answer: 'B',
      why: {
        A: 'added the sizes and kept the minus sign ("symmetric" error). Re-teach with Example 1 on the number line.',
        B: 'correct.',
        C: 'moved the wrong way, or did 5 − 2 and kept the minus. Act it out: start at −2, walk 5 steps right.',
        D: 'ignored the negative sign. Check they read −2 as a place left of zero (Words box).',
      },
    },
    pattern: {
      text: 'Each question changes one thing. Work them out, then look down the answers.',
      items: [
        { q: '−3 + 3', a: '0' }, { q: '−3 + 2', a: '−1' }, { q: '−3 + 1', a: '−2' }, { q: '−3 + 0', a: '−3' },
        { q: '−3 + (−1)', a: '−4' }, { q: '−3 + (−2)', a: '−5' }, { q: '−3 + (−3)', a: '−6' }, { q: '−30 + (−30)', a: '−60' },
      ],
      notice: 'What happens to the answer each time the number added goes down by 1?',
      noticeA: 'The answer goes down by 1 too. Adding a negative carries on the pattern: it makes the answer smaller.',
    },
    mixed: [
      { from: '1.04', q: '−8 + 5', a: '−3' },
      { from: '1.03', q: 'Which is larger: −8 or 5?', a: '5' },
      { from: '1.04', q: '6 + (−9)', a: '−3' },
      { from: '1.02', q: 'How far apart are −8 and 5?', a: '13' },
      { from: '1.04', q: '−7 + (−2)', a: '−9' },
      { from: '1.01', q: 'What is the opposite of −12?', a: '12' },
      { from: '1.04', q: '−15 + 15', a: '0' },
      { from: '1.04', q: '−6 + ☐ = −1', a: '☐ = 5' },
      { from: '1.04', q: 'A diver is at −12 m. She rises 5 m. Where is she now?', a: '−12 + 5 = −7 m' },
      { from: '1.03', q: 'Order smallest to largest: <span class="nw">−3 + 4</span>, −3, <span class="nw">−3 + (−4)</span>', a: '−3 + (−4), −3, −3 + 4 (that is −7, −3, 1)' },
    ],
    further: [
      { q: 'Always, sometimes or never true? "Adding a negative number makes the answer smaller." Explain.', a: 'Always. Adding a negative always moves left, so the answer is always smaller than the starting number.' },
      { q: 'Find two integers that add to −3. Then find two more, where one of them is positive.', a: 'e.g. −1 + (−2) = −3; e.g. 2 + (−5) = −3' },
      { q: 'Start at −4. Add 2, 6 and −5 in any order. Where do you finish? Does the order matter?', a: '−4 + 2 + 6 + (−5) = −1. The order does not matter.', n: 2 },
    ],
    exit: [
      { q: '−7 + 3', a: '−4' },
      { q: '4 + (−9)', a: '−5' },
      { q: 'It is −6°C. It warms up 10°C. What is the temperature now?', a: '−6 + 10 = 4°C' },
    ],
    teacher: {
      misconception: 'Treating −2 + 5 as "−(2 + 5)" (the symmetric error), and carrying "two negatives make a positive" over from multiplication into addition.',
      next: 'Most students B: go on to page 2. Students with A, C or D: a short re-teach at the board with Examples 1 and 2 on the number line (walk it out), then Your turn 1 and 2 again before page 2. Students who finish Mixed practice: Go further.',
      think: 'Take answers without judging. Show a thermometer: start at −3, count up 5. Link to Example 1: the same move on a sideways number line.',
    },
  },
};
