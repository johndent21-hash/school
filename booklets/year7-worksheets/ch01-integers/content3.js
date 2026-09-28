// Calm two-page lessons for Chapter 1 (lib/worksheet3.js), in the style of the Freefall sheets. Every question is
// written out by hand so each step grows in small, deliberate changes. The working lines (one step a line, the answer
// last) make the fading scaffolds: worked, answer blank, numbers blank, blank.
const D = require('../../lib/diagrams');

// Number lines for the questions: blank (just the start) and done (the jumps drawn).
const nl = (min, max, start, moves) => ({ fig: D.jumps({ min, max, start, done: false, every: 1 }), figDone: D.jumps({ min, max, start, moves, every: 1 }) });

module.exports = {
  '1.04': { steps: [
    { title: 'Adding a positive',
      how: { text: '<p>Start at the first number.</p><p>Adding a positive number: move <b>right</b>.</p><p class="ex">−3 + 5: start at −3, move 5 right. Land on 2.</p>', fig: D.jumps({ min: -6, max: 6, start: -3, moves: [5], every: 1 }) },
      rounds: [{ text: 'Draw the jump. Write where you land. The last one has no number line.',
        we: [{ q: '−2 + 4', ...nl(-8, 5, -2, [4]), lines: ['= 2'] }],
        you: [
          { q: '−4 + 3', ...nl(-8, 5, -4, [3]), lines: ['= −1'] },
          { q: '−5 + 2', ...nl(-8, 5, -5, [2]), lines: ['= −3'] },
          { q: '−6 + 4', ...nl(-8, 5, -6, [4]), lines: ['= −2'] },
          { q: '−3 + 7', ...nl(-8, 5, -3, [7]), lines: ['= 4'] },
          { q: '−7 + 7', lines: ['= 0'] },
        ] }] },
    { title: 'Adding a negative',
      how: { text: '<p>Adding a negative number: move <b>left</b>.</p><p>+ (−4) means the same as − 4.</p><p class="ex">3 + (−5) = 3 − 5 = −2</p>', fig: D.jumps({ min: -4, max: 5, start: 3, moves: [-5], every: 1 }) },
      rounds: [{ text: 'Rewrite + (−) as −. Then work it out.', two: true,
        we: [{ q: '6 + (−2)', lines: ['= 6 − 2', '= 4'] }, { q: '−2 + (−3)', lines: ['= −2 − 3', '= −5'] }],
        you: [
          { q: '7 + (−3)', lines: ['= 7 − 3', '= 4'] },
          { q: '5 + (−5)', lines: ['= 5 − 5', '= 0'] },
          { q: '2 + (−6)', lines: ['= 2 − 6', '= −4'] },
          { q: '4 + (−10)', lines: ['= 4 − 10', '= −6'] },
          { q: '−1 + (−4)', lines: ['= −1 − 4', '= −5'] },
          { q: '−3 + (−6)', lines: ['= −3 − 6', '= −9'] },
        ] }] },
    { title: 'Zero pairs',
      how: { text: '<p>A + and a − make a <b>zero pair</b>. They cancel out.</p><p>So take the difference. The sign with more wins.</p><p class="ex">−6 + 4: 6 − 4 = 2. − has more: −2.</p>', fig: D.counters({ pos: 4, neg: 6, pairs: true }) },
      rounds: [{ text: 'Take the difference. Which sign has more?', two: true,
        we: [{ q: '−5 + 8', lines: ['8 − 5 = 3', '+ has more: 3'] }, { q: '6 + (−9)', lines: ['9 − 6 = 3', '− has more: −3'] }],
        you: [
          { q: '−7 + 10', lines: ['10 − 7 = 3', '+ has more: 3'] },
          { q: '−9 + 4', lines: ['9 − 4 = 5', '− has more: −5'] },
          { q: '8 + (−12)', lines: ['12 − 8 = 4', '− has more: −4'] },
          { q: '−15 + 20', lines: ['20 − 15 = 5', '+ has more: 5'] },
          { q: '25 + (−40)', lines: ['40 − 25 = 15', '− has more: −15'] },
          { q: '−36 + 50', lines: ['50 − 36 = 14', '+ has more: 14'] },
        ] }] },
    { title: 'Three numbers',
      how: { text: '<p>Add from left to right, one jump at a time.</p><p class="ex">−4 + 9 + (−7) = 5 + (−7) = −2</p>', fig: D.jumps({ min: -5, max: 6, start: -4, moves: [9, -7], every: 1 }) },
      rounds: [{ text: 'Add from left to right. Draw the jumps when there is a number line.',
        we: [{ q: '1 + (−4) + 5', ...nl(-6, 6, 1, [-4, 5]), lines: ['= −3 + 5', '= 2'] }],
        you: [
          { q: '2 + (−5) + 4', ...nl(-6, 6, 2, [-5, 4]), lines: ['= −3 + 4', '= 1'] },
          { q: '−3 + 6 + (−2)', ...nl(-6, 6, -3, [6, -2]), lines: ['= 3 + (−2)', '= 1'] },
          { q: '12 + (−15) + (−6)', lines: ['= −3 + (−6)', '= −9'] },
          { q: '−20 + 8 + 15', lines: ['= −12 + 15', '= 3'] },
        ] }] },
    { title: 'Adding in real life',
      how: { text: '<p>Write the story as a sum.</p><p>Up, rises and gains are <b>positive</b>.</p><p>Down, falls and spending are <b>negative</b>.</p><p class="ex">−6°C, then it warms up 10°C:<br>−6 + 10 = 4°C</p>' },
      rounds: [{ text: 'Write a sum. Then answer the question.',
        we: [{ q: 'It is −5°C. The temperature rises 8°C. What is the temperature now?', lines: ['−5 + 8', '= 3°C'] }],
        you: [
          { q: 'It is −4°C at dawn. By lunch it has warmed up 9°C. What is the temperature at lunch?', lines: ['−4 + 9', '= 5°C'] },
          { q: 'A lift is at level −2. It goes up 5 floors. Which level is it on now?', lines: ['−2 + 5', '= level 3'] },
          { q: 'Sam has $15 in the bank. Sam spends $40 using credit. What is the balance now?', lines: ['15 + (−40)', '= −$25'] },
          { q: 'A diver is at −18&nbsp;m. She swims up 7&nbsp;m, then down 4&nbsp;m. Where is she now?', lines: ['−18 + 7 + (−4)', '= −11 + (−4)', '= −15 m'] },
        ] }] },
    { title: 'Is it right?',
      how: { text: '<p>Work it out yourself first.</p><p>Then compare. Say yes or no, and give the right answer.</p><p class="ex">Kim says 3 + (−5) = −2.<br>3 − 5 = −2. Yes, Kim is right.</p>' },
      rounds: [{ text: 'Is it right? Explain your answer.',
        we: [{ q: 'Tom says −6 + 2 = −8. Is he right?', lines: ['start at −6, move 2 right', '= −4', 'No. The answer is −4.'] }],
        you: [
          { q: 'Mia says −8 + 5 = −13. Is she right?', lines: ['start at −8, move 5 right', '= −3', 'No. The answer is −3.'] },
          { q: 'Ben says −7 + 3 + (−3) = −7. Is he right?', lines: ['3 + (−3) is a zero pair', '−7 + 0 = −7', 'Yes. Ben is right.'] },
          { q: 'Ali says −4 + ☐ = 2 means ☐ = −2. Is he right?', lines: ['from −4 to 2 is 6 right', '☐ = 6', 'No. ☐ is 6, not −2.'] },
          { q: 'Jo says adding always makes a number bigger. Is Jo right?', lines: ['4 + (−6) = −2', '−2 is smaller than 4', 'No. It can get smaller.'] },
        ] }] },
  ] },
};
