// Blended booklet, Chapter 2 Angles. Six pages a lesson: the diagrams and constructions need the room.
const blend = require('../../lib/blend');

const cls = (d) => (d < 90 ? 'acute' : d === 90 ? 'right' : d < 180 ? 'obtuse' : d === 180 ? 'straight' : d < 360 ? 'reflex' : 'revolution');
const deg = (xs) => xs.map((x) => `${x}°`);

module.exports = blend(require('../../year7/ch02-angles/chapter.js'), {
  fileName: 'Year7-Ch02-Angles-Lessons', pages: 6,
  more: {
    '2.01': { stems: ['Name the angle, then draw an angle from its name.', 'Name the angles at O.', 'Name the marked angle, then answer the question.'],
      drill: { text: 'Quick drill: which letter is the vertex of each angle?', cols: 4, items: ['∠ABC', '∠PQR', '∠XYZ', '∠DEF', '∠MNK', '∠STU', '∠GHJ', '∠BKT'], ans: ['B', 'Q', 'Y', 'E', 'N', 'T', 'H', 'K'], hw: ['∠LMN', 'M', 'Which letter is the vertex?'] } },
    '2.02': { stems: ['Measure the angle, then draw an angle of the given size.', 'Measure the angle, then draw an angle of the given size.', 'Draw each reflex angle.'],
      drill: { text: 'Quick drill: for each reflex angle, write the angle you draw with the protractor (360° − the angle).', cols: 4, items: deg([210, 300, 195, 270, 250, 330, 185, 240]), ans: deg([150, 60, 165, 90, 110, 30, 175, 120]), hw: ['225°', '135°', 'What angle do you draw with the protractor to make this reflex angle?'] } },
    '2.03': { stems: ['Classify each angle.', 'Answer each question.', 'Name and classify, then explain.'],
      drill: { text: 'Quick drill: classify each angle (acute, right, obtuse, straight, reflex or revolution).', cols: 4, items: deg([34, 145, 250, 360, 89, 91, 179, 181, 300, 5]), ans: [34, 145, 250, 360, 89, 91, 179, 181, 300, 5].map(cls), hw: ['154°', 'obtuse', 'Classify the angle.'] } },
    '2.04': { stems: ['Find the complement and the supplement.', 'Find the value of the pronumeral.', 'Find x, then answer the question.'],
      drill: { text: 'Quick drill: complement (C) or supplement (S) of each angle.', cols: 4, items: ['C of 25°', 'C of 68°', 'C of 12°', 'C of 81°', 'S of 30°', 'S of 115°', 'S of 172°', 'S of 64°', 'S of 90°', 'C of 45°'], ans: deg([65, 22, 78, 9, 150, 65, 8, 116, 90, 45]), hw: ['S of 128°', '52°', 'Find the supplement.'] } },
    '2.05': { stems: ['Find the value of each pronumeral. Give a reason.', 'Angles at a point: find the pronumeral.', 'Find each pronumeral. Give a reason.'],
      drill: { text: 'Quick drill: find the unknown angle.', cols: 2, items: ['Straight line: 55° and a°', 'Straight line: 36° and b°', 'Straight line: 40°, 65° and c°', 'Point: 120°, 120° and f°', 'Point: 90°, 125°, 78° and h°', 'Vertically opposite: 118° and a°', 'Vertically opposite: 72° and c°', 'Straight line: 64° and e°'], ans: ['125°', '144°', '75°', '120°', '67°', '118°', '72°', '116°'], hw: ['Point: 95°, 145° and g°', '120°', 'Find the unknown angle.'] } },
    '2.06': { stems: ['Name the lines, then explain the symbols.', 'Construct the line. Use a ruler and compasses.', 'Construct the line, then give examples.'] },
    '2.07': { stems: ['Mark the corresponding angle, then find the pronumeral.', 'Find the pronumeral, then answer the question.', 'Find x and y, then answer the question.'],
      drill: { text: 'Quick drill: the lines are parallel. Find the corresponding angle.', cols: 4, items: deg([65, 110, 38, 142, 90, 75, 120, 51]), ans: deg([65, 110, 38, 142, 90, 75, 120, 51]), hw: ['84°', '84°', 'The lines are parallel. Find the corresponding angle.'] } },
    '2.08': { stems: ['Mark the alternate angle, then find the pronumeral.', 'Find k, then answer the question.', 'Find a and b, then explain.'],
      drill: { text: 'Quick drill: the lines are parallel. One angle is given. Find its alternate angle (A) or the angle next to it on the line (L).', cols: 4, items: ['A: 60°', 'A: 115°', 'A: 48°', 'L: 48°', 'A: 130°', 'L: 130°', 'A: 72°', 'L: 72°'], ans: deg([60, 115, 48, 132, 130, 50, 72, 108]), hw: ['A: 37°', '37°', 'The lines are parallel. Find the alternate angle.'] } },
    '2.09': { stems: ['Mark the co-interior angle, then find the pronumeral.', 'Find m, then answer the question.', 'Find p and q, then name the three rules.'],
      drill: { text: 'Quick drill: the lines are parallel. Find the co-interior angle.', cols: 4, items: deg([120, 75, 95, 60, 145, 30, 110, 88]), ans: deg([60, 105, 85, 120, 35, 150, 70, 92]), hw: ['132°', '48°', 'The lines are parallel. Find the co-interior angle.'] } },
    '2.10': { stems: ['Find the pronumeral. Give a reason.', 'Find each pronumeral. Give reasons.', 'Find each pronumeral, then explain.'],
      drill: { text: 'Quick drill: which rule? Write corresponding, alternate or co-interior, and equal or add to 180°.', cols: 2, items: ['F shape', 'Z shape', 'C shape', 'same position at each line', 'between the lines, opposite sides', 'between the lines, same side'], ans: ['corresponding, equal', 'alternate, equal', 'co-interior, add to 180°', 'corresponding, equal', 'alternate, equal', 'co-interior, add to 180°'], hw: ['Z shape', 'alternate, equal', 'Which rule is this?'] } },
    '2.11': { stems: ['Is AB ∥ CD? Give a reason.', 'Decide whether AB ∥ CD, then find the x that makes AB ∥ CD.', 'Answer each question.'],
      drill: { text: 'Quick drill: is AB ∥ CD? Write yes or no.', cols: 2, items: ['Alternate: 64° and 64°', 'Co-interior: 108° and 72°', 'Corresponding: 45° and 54°', 'Co-interior: 90° and 90°', 'Alternate: 101° and 79°', 'Corresponding: 113° and 113°'], ans: ['yes', 'yes', 'no', 'yes', 'no', 'yes'], hw: ['Co-interior: 105° and 85°', 'no', 'Is AB ∥ CD?'] } },
  },
});
