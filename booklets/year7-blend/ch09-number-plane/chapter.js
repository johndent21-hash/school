// Blended booklet, Chapter 9 The number plane. Six pages a lesson: number planes need space to draw.
const blend = require('../../lib/blend');

const base = require('../../year7/ch09-number-plane/chapter.js');
const spec = (code) => base.lessons.find((f) => f.spec.code === code).spec;
const map = spec('9.01').a.fig;
const D = (text, pairs, hw, cols = 3) => ({ text, cols, items: pairs.map((p) => p[0]), ans: pairs.map((p) => p[1]), hw });
const quad = ([x, y]) => (x === 0 && y === 0 ? 'origin' : x === 0 ? 'y-axis' : y === 0 ? 'x-axis' : x > 0 ? (y > 0 ? '1st' : '4th') : (y > 0 ? '2nd' : '3rd'));
const pt = ([x, y]) => `(${String(x).replace('-', '−')}, ${String(y).replace('-', '−')})`;

module.exports = blend(base, {
  fileName: 'Year7-Ch09-Number-plane-Lessons', pages: 6,
  more: {
    '9.01': { hwFig: map, exFigs: [map, map, map], stems: ['Use the map. What is at each grid reference?', 'Use the map. Write the grid references.', 'Use the map, then explain.'],
      drill: D('Quick drill: use the map in Set A. What is at:', [['B2', 'car park'], ['C3', 'car park'], ['G2', 'lake'], ['B8', 'stadium'], ['I8', 'student centre'], ['H10', 'main campus']], ['I10', 'main campus', 'Use the campus map. What is at the grid reference?']) },
    '9.02': { stems: ['Plot and label the points.', 'Read the coordinates, then explain.', 'Plot, join and name the shape.'],
      drill: D('Quick drill: write the x-coordinate (x) or the y-coordinate (y).', [['x of (4, 7)', '4'], ['y of (4, 7)', '7'], ['x of (0, 3)', '0'], ['y of (6, 0)', '0'], ['y of (2, 9)', '9'], ['x of (8, 1)', '8']], ['x of (5, 2)', '5', 'Write the x-coordinate.']) },
    '9.03': { stems: ['Label the quadrants, then name the quadrant.', 'Read the coordinates, then name the quadrant.', 'Plot and join, then write points.'],
      drill: D('Quick drill: which quadrant or axis?', [[2, -5], [-4, -1], [-3, 6], [0, -2], [5, 5], [-7, 0], [1, -1], [-2, 3], [0, 0]].map((p) => [pt(p), quad(p)]), [pt([-6, -2]), '3rd', 'Which quadrant is the point in?'], 3) },
    '9.04': { stems: ['Plot the table, then describe the pattern.', 'Plot the table, then describe the pattern.', 'Find the pattern, then predict.'],
      drill: D('Quick drill: write each table column as a point (x, y).', [['x = 0, y = 3', '(0, 3)'], ['x = 2, y = −1', '(2, −1)'], ['x = −4, y = 0', '(−4, 0)'], ['x = −1, y = −5', '(−1, −5)'], ['x = 5, y = 5', '(5, 5)'], ['x = 0, y = 0', '(0, 0)']], ['x = −3, y = 2', '(−3, 2)', 'Write the column as a point (x, y).']) },
    '9.05': { stems: ['Complete each table from its rule.', 'Complete each table from its rule.', 'Find the rule for each table.'],
      drill: D('Quick drill: find y.', [['y = x + 4, x = 2', '6'], ['y = 3x, x = 5', '15'], ['y = x − 7, x = 1', '−6'], ['y = 2x + 1, x = 3', '7'], ['y = 10 − x, x = 4', '6'], ['y = 4x − 2, x = 0', '−2'], ['y = −x, x = −3', '3'], ['y = 2x − 5, x = −1', '−7'], ['y = x ÷ 2, x = 8', '4']], ['y = 3x + 2, x = −2', '−4', 'Find y.']) },
    '9.06': { stems: ['Complete a table, then graph the line.', 'Does the point lie on the line?', 'Graph the line, then answer.'],
      drill: D('Quick drill: does the point lie on y = 2x + 1? Write yes or no.', [['(0, 1)', 'yes'], ['(1, 3)', 'yes'], ['(2, 4)', 'no'], ['(−1, −1)', 'yes'], ['(3, 7)', 'yes'], ['(−2, −4)', 'no']], ['(4, 9)', 'yes', 'Does the point lie on y = 2x + 1?']) },
  },
});
