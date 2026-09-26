// Year 7 Chapter 9: The number plane. One 4-page lesson per exercise in Test Yourself 9.
const lesson = require('../../lib/lesson');
const D = require('../../lib/diagrams');
const { svg, text, line } = require('../../lib/graphs');
const { fmt } = require('../../lib/calc');

// A number plane for students to draw on (fills the space it is given).
const pl = (o = {}) => `<div class="template-card tplane">${D.plane({ min: -5, max: 5, cell: 4, ...o })}</div>`;
const tp = (g) => `<div class="template-card tplane">${g}</div>`;
const pl1 = (o = {}) => `<div class="template-card tplane">${D.plane({ min: 0, max: 8, ymin: 0, ymax: 8, cell: 4, ...o })}</div>`;
// Table of values; blank cells where y is to be found.
const tbl = (xn, xs, yn, ys = []) => `<table class="data-table"><tr><th><i>${xn}</i></th>${xs.map((x) => `<td>${fmt(x)}</td>`).join('')}</tr><tr><th><i>${yn}</i></th>${xs.map((_, i) => `<td>${ys[i] !== undefined ? fmt(ys[i]) : '&nbsp;'}</td>`).join('')}</tr></table>`;
const fill = (f, xs) => xs.map((x) => fmt(f(x))).join(', ');

// Campus map on a grid: columns A–J, rows 1–10. Features are placed in grid squares.
const map = (() => {
  const c = 6.2, o = 7, W = 10 * c + o + 3, H = 10 * c + o + 3;
  const X = (i) => o + i * c, Y = (j) => o + j * c; // i: 0..10 cols, j: 0..10 rows from the top (row 10 at top)
  let b = '';
  for (let i = 0; i <= 10; i++) b += line(X(i), Y(0), X(i), Y(10), '#d6d3c6', 0.25);
  for (let j = 0; j <= 10; j++) b += line(X(0), Y(j), X(10), Y(j), '#d6d3c6', 0.25);
  'ABCDEFGHIJ'.split('').forEach((L, i) => { b += text(X(i) + c / 2, o - 2, L, { size: 2.8, anchor: 'middle', weight: 600 }); });
  for (let r = 1; r <= 10; r++) b += text(o - 2, Y(10 - r) + c / 2 + 1, String(r), { size: 2.8, anchor: 'end', weight: 600 });
  const box = (col, row, w, h, fill, label) => { const i = col.charCodeAt(0) - 65, j = 10 - row - (h - 1); b += `<rect x="${X(i) + 0.4}" y="${Y(j) + 0.4}" width="${w * c - 0.8}" height="${h * c - 0.8}" rx="1" fill="${fill}" stroke="#3d3b3c" stroke-width="0.3"/>` + text(X(i) + (w * c) / 2, Y(j) + (h * c) / 2 + 1, label, { size: 2.3, anchor: 'middle', weight: 600 }); };
  const road = (x1, y1, x2, y2, label, lx, ly, rot = 0) => { b += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#c9c5b4" stroke-width="2.4"/>` + text(lx, ly, label, { size: 2.1, anchor: 'middle', rotate: rot }); };
  road(X(0), Y(4) + c / 2, X(10), Y(4) + c / 2, 'Gauss Rd', X(8) + c / 2, Y(4) + c / 2 + 0.8);
  road(X(4) + c / 2, Y(0), X(4) + c / 2, Y(10), 'Euclid St', X(4) + c / 2 + 0.8, Y(1) + 2, 90);
  box('F', 2, 2, 1, '#9fb3e6', 'Lake');
  box('D', 9, 1, 1, '#f3d6a6', 'Library');
  box('A', 8, 2, 1, '#c8e6c9', 'Stadium');
  box('H', 7, 2, 2, '#e8d5f0', 'Student Ctr');
  box('B', 2, 2, 2, '#eeeeee', 'Car park');
  box('G', 10, 3, 1, '#fde2e4', 'Main campus');
  return svg(W, H, b);
})();

module.exports = {
  year: 7, stage: 4, number: 9, title: 'The number plane', accent: '#6b8e23',
  fileName: 'Year7-Ch09-Number-plane',
  goals: ['use grid references on a map', 'plot and read points in the first quadrant', 'plot and read points in all four quadrants', 'plot points from tables and describe patterns', 'complete tables of values from rules', 'graph linear equations and test whether a point is on a line'],
  syllabus: 'NSW Mathematics K–10 Syllabus (2022), Stage 4 Number and algebra: MA4-LIN-C-01 creates and displays number patterns and graphs linear relationships on the Cartesian plane.',
  lessons: [
    lesson({
      code: '9.01', title: 'Grid references on maps',
      li: ['use grid references to find and describe locations on a map'],
      sc: ['read a grid reference: letter (across) then number (up)', 'state the feature at a grid reference', 'write the grid reference of a feature'],
      terms: ['Grid reference', 'Map'],
      we: ['Use the map in Set A. What is at F2?', 'What is at D9?', 'Write the grid reference of the library.', 'Which grid squares does the car park cover?', 'Describe how to walk from the lake to the library along the roads.', 'Why is the letter written before the number?'],
      a: { text: 'Use the map. What is at:', kind: 'short', figSide: true, fig: map, items: ['F2', 'D9', 'A8', 'H7'] },
      b: { text: 'Write a grid reference for:', kind: 'short', items: ['the library', 'the lake', 'the stadium', 'the car park', 'the student centre', 'the main campus'] },
      c: { text: 'Use the map.', kind: 'work', cols: 3, items: ['Name a grid square that Gauss Road passes through.', 'Name a grid square that Euclid Street passes through.', 'Where do Gauss Road and Euclid Street meet?', 'Which feature is furthest north (highest row)?', 'How many squares is the lake from the car park, across?', 'Which features are in column H?'] },
      d: { text: 'Draw your own.', kind: 'work', items: [{ t: 'Draw a map of your school on the grid. Mark 5 places and list their grid references.', draw: `<div class="template-card tgrid">${D.grid({ cols: 10, rows: 7, cell: 5 })}</div>` }, 'Write directions from one place to another using grid references.'] },
      ext: { q: 'A treasure is 3 squares right and 4 squares up from B2. Where is it?', steps: ['3 squares right of B is E', '4 squares up from 2 is 6'], a: 'E6', qs: ['From H7, go 5 left and 2 down. Where are you?', 'How many squares is it from A1 to J10 if you can only move up or right?'] },
      summary: { steps: ['A grid reference names a square.', 'Letter first (across), then number (up).', 'Large features may cover several squares.', 'Check by running your finger across, then up.'],
        worked: [['What is at F2?', ['Column F, row 2'], 'the lake'], ['Library', ['Column D, row 9'], 'D9'], ['Car park', ['Covers 4 squares'], 'B2, C2, B3, C3'], ['3 right, 4 up from B2', ['B → E, 2 → 6'], 'E6']] },
      exit: { qs: ['What is at A8?', 'Write the grid reference of the lake.', 'From D9 go 4 right and 2 down. What is there?'] },
      ans: { we: ['the lake', 'the library', 'D9', 'B2, C2, B3, C3', 'e.g. walk to Gauss Rd, west to Euclid St, then north', 'it is a convention so everyone reads it the same way'], a: ['lake', 'library', 'stadium', 'student centre'], b: ['D9', 'F2 or G2', 'A8 or B8', 'B2, B3, C2 or C3', 'H7, H8, I7 or I8', 'G10, H10 or I10'],
        c: ['e.g. A6', 'e.g. E1', 'E6', 'main campus (row 10)', '4 squares', 'student centre and main campus'], d: ['own map', 'own directions'], ext: ['C5', '18 squares'], exit: ['stadium', 'F2', 'student centre (H7)'] },
    }),

    lesson({
      code: '9.02', title: 'Points in the first quadrant',
      li: ['plot and read points on a number plane in the first quadrant'],
      sc: ['know the <b>x-coordinate</b> is across and the <b>y-coordinate</b> is up', 'plot a point (x, y)', 'read the coordinates of a point'],
      terms: ['Coordinates', 'Origin', 'Axis'],
      we: [{ t: 'Plot A(2, 3) and B(1, 6).', draw: pl1({ max: 6, ymax: 6 }) }, { t: 'Plot C(3, 0) and D(0, 4).', draw: pl1({ max: 6, ymax: 6 }) }, { t: 'Write the coordinates of P and Q.', draw: tp(D.plane({ min: 0, max: 6, ymin: 0, ymax: 6, cell: 4, points: [{ x: 4, y: 1, label: 'P' }, { x: 2, y: 5, label: 'Q' }] })) }, 'Is (2, 5) the same point as (5, 2)? Explain.', { t: 'Plot (1, 1), (5, 1), (5, 4), (1, 4) and join them. Name the shape.', draw: pl1({ max: 6, ymax: 6 }) }, 'What are the coordinates of the origin?'],
      a: { text: 'Plot and label each point on the same number plane.', kind: 'work', items: [{ t: 'A(2, 3), B(1, 6), C(3, 0)', draw: pl1() }, { t: 'D(0, 4), E(5, 2), F(6, 5)', draw: pl1() }] },
      b: { text: 'Write the coordinates of each point.', kind: 'short', figSide: true, fig: D.plane({ min: 0, max: 8, ymin: 0, ymax: 6, cell: 4, points: [{ x: 1, y: 2, label: 'A' }, { x: 4, y: 5, label: 'B' }, { x: 7, y: 1, label: 'C' }, { x: 0, y: 3, label: 'D' }, { x: 5, y: 0, label: 'E' }, { x: 6, y: 4, label: 'F' }] }), items: ['A', 'B', 'C', 'D', 'E', 'F'] },
      c: { text: 'Plot, join in order and name the shape.', kind: 'work', items: [{ t: '(1, 1), (6, 1), (6, 4), (1, 4), (1, 1)', draw: pl1() }, { t: '(2, 1), (6, 1), (4, 6), (2, 1)', draw: pl1() }] },
      d: { text: 'Think it through.', kind: 'work', items: [{ t: 'Three corners of a square are (1, 2), (5, 2) and (5, 6). Plot them and find the fourth corner.', draw: pl1() }, 'Name 3 points on the <i>x</i>-axis and 3 on the <i>y</i>-axis. What do you notice?'] },
      ext: { q: 'Find the midpoint of (2, 3) and (6, 7).', steps: ['Halfway across: (2 + 6) ÷ 2 = 4', 'Halfway up: (3 + 7) ÷ 2 = 5'], a: '(4, 5)', qs: ['Find the midpoint of (1, 8) and (5, 2).', 'A rectangle has corners (1, 1) and (7, 5). Find its area in square units.'] },
      summary: { steps: ['(x, y): x across first, then y up.', 'Start at the origin (0, 0).', 'Points on the x-axis have y = 0.', 'Points on the y-axis have x = 0.'],
        worked: [['Plot A(2, 3)', ['2 across, 3 up'], 'a dot labelled A'], ['Coordinates of P', ['4 across, 1 up'], '(4, 1)'], ['(2, 5) vs (5, 2)', ['Order matters'], 'different points'], ['Midpoint of (2, 3), (6, 7)', ['Average x and y'], '(4, 5)']] },
      exit: { qs: ['What is the x-coordinate of (7, 3)?', 'Where is the point (0, 5)?', 'A rectangle has corners (1, 2), (6, 2), (6, 5). Find the fourth corner.'] },
      ans: { we: ['plotted', 'plotted on the axes', 'P(4, 1), Q(2, 5)', 'No: (2, 5) is 2 across, 5 up', 'rectangle', '(0, 0)'], a: ['plotted', 'plotted'], b: ['(1, 2)', '(4, 5)', '(7, 1)', '(0, 3)', '(5, 0)', '(6, 4)'], c: ['rectangle', 'isosceles triangle'], d: ['(1, 6)', 'x-axis points have y = 0; y-axis points have x = 0'], ext: ['(3, 5)', '24 square units'], exit: ['7', 'on the y-axis, 5 up', '(1, 5)'] },
    }),

    lesson({
      code: '9.03', title: 'The number plane',
      li: ['plot and read points in all four quadrants'],
      sc: ['name the four quadrants', 'plot points with negative coordinates', 'state which quadrant a point is in from its signs'],
      terms: ['Quadrant', 'Origin'],
      we: [{ t: 'Label the quadrants 1st to 4th.', draw: pl({ min: -4, max: 4 }) }, 'In which quadrant is (−3, −3)?', { t: 'Write the coordinates of each point.', draw: tp(D.plane({ min: -4, max: 4, cell: 4, points: [{ x: 2, y: 3, label: 'A' }, { x: -3, y: 1, label: 'B' }, { x: -2, y: -4, label: 'C' }, { x: 4, y: -2, label: 'D' }] })) }, 'Which quadrant has a positive x-coordinate and a negative y-coordinate?', { t: 'Plot (1, 3), (2, 2), (3, 1), (2, 0), (1, −1), (0, −2), (−1, −1) and join.', draw: pl({ min: -4, max: 4 }) }, 'Write a point in the 2nd quadrant and a point on the y-axis.'],
      a: { text: 'Which quadrant or axis is each point on?', kind: 'short', keepShort: true, items: ['(−3, −3)', '(4, 2)', '(−1, 5)', '(3, −6)', '(0, 4)', '(−2, 0)'] },
      b: { text: 'Write the coordinates of each point.', kind: 'short', figSide: true, fig: D.plane({ min: -5, max: 5, ymin: -4, ymax: 4, cell: 3.6, points: [{ x: 1, y: 3, label: 'H' }, { x: -4, y: 2, label: 'B' }, { x: -3, y: -3, label: 'C' }, { x: 3, y: -2, label: 'A' }, { x: 0, y: -4, label: 'F' }, { x: -5, y: 0, label: 'J' }] }), items: ['H', 'B', 'C', 'A', 'F', 'J'] },
      c: { text: 'Plot and join.', kind: 'work', items: [{ t: '(1, 3), (2, 3), (2, 2), (3, 1), (2, 0), (2, −1), (1, −1), (0, −2), (−1, −1), (−2, −1), (−2, 0), (−3, 1), (−2, 2), (−2, 3), (−1, 3), (0, 4), (1, 3). What shape is it?', draw: pl() }, { t: 'Plot A(−4, −2), B(2, −2), C(2, 3). Find D so ABCD is a rectangle.', draw: pl() }] },
      d: { text: 'Think it through.', kind: 'work', items: ['In which quadrant is a point with a negative x-coordinate and a positive y-coordinate? A 1st  B 2nd  C 3rd  D 4th', 'What are the coordinates of the origin?', 'Reflect (3, −2) in the y-axis. Write the new point.', 'What is the distance between (−3, 2) and (4, 2)?'] },
      ext: { q: 'A square has corners (−2, −1) and (3, −1) along its bottom. Find the other two corners (above).', steps: ['Side length = 3 − (−2) = 5', 'Go up 5: y = −1 + 5 = 4'], a: '(3, 4) and (−2, 4)', qs: ['A triangle has corners (−3, 0), (3, 0) and (0, 4). Find its area.', 'Reflect the triangle (1, 1), (4, 1), (1, 3) in the x-axis. Write the new corners.'] },
      summary: { steps: ['The axes cross at the origin (0, 0).', '1st (+, +), 2nd (−, +), 3rd (−, −), 4th (+, −).', 'Quadrants go anticlockwise from top right.', 'Points on an axis are in no quadrant.'],
        worked: [['(−3, −3)', ['Both negative'], '3rd quadrant'], ['Point B', ['3 left, 1 up'], '(−3, 1)'], ['+x, −y', ['Bottom right'], '4th quadrant'], ['Square on (−2, −1), (3, −1)', ['Side 5, go up'], '(3, 4), (−2, 4)']] },
      exit: { qs: ['In which quadrant is (−4, 2)?', 'Write the coordinates of a point in the 4th quadrant.', 'Reflect (−2, 5) in the x-axis.'] },
      ans: { we: ['1st top right, 2nd top left, 3rd bottom left, 4th bottom right', '3rd', 'A(2, 3), B(−3, 1), C(−2, −4), D(4, −2)', '4th', 'a zigzag line', 'e.g. (−2, 3); e.g. (0, 5)'], a: ['3rd', '1st', '2nd', '4th', 'y-axis', 'x-axis'], b: ['(1, 3)', '(−4, 2)', '(−3, −3)', '(3, −2)', '(0, −4)', '(−5, 0)'],
        c: ['a flower / star shape (symmetrical)', 'D(−4, 3)'], d: ['B: 2nd', '(0, 0)', '(−3, −2)', '7 units'], ext: ['12 square units', '(1, −1), (4, −1), (1, −3)'], exit: ['2nd', 'e.g. (3, −1)', '(−2, −5)'] },
    }),

    lesson({
      code: '9.04', title: 'Plotting tables of values',
      li: ['plot points from a table and describe the pattern'],
      sc: ['read (x, y) pairs from a table', 'plot the points and join them with a ruler', 'describe the pattern (straight line, vertical, horizontal, increasing, decreasing)'],
      terms: ['Table of values', 'Pattern'],
      we: [{ t: 'Plot the table and describe the pattern.', fig: tbl('x', [-2, -2, -2, -2], 'y', [-2, -1, 0, 1]), draw: pl({ min: -4, max: 4 }) }, { t: 'Plot and describe.', fig: tbl('x', [-2, -1, 0, 2], 'y', [3, 3, 3, 3]), draw: pl({ min: -4, max: 4 }) },
        { t: 'Plot and describe.', fig: tbl('x', [0, 1, 2, 5], 'y', [5, 4, 3, 0]), draw: pl({ min: -1, max: 6, ymin: -1, ymax: 6 }) }, { t: 'Plot and describe.', fig: tbl('x', [-1, 0, 1, 2], 'y', [-1, 1, 3, 5]), draw: pl({ ymin: -2, ymax: 6 }) }, 'In the table in Example 4, what happens to y when x goes up by 1?', 'Predict y when x = 3 in Example 4.'],
      a: { text: 'Plot each table and join the points.', kind: 'work', items: [{ t: '', fig: tbl('x', [-2, -2, -2, -2], 'y', [-2, -1, 0, 1]), draw: pl() }, { t: '', fig: tbl('x', [-2, -1, 0, 2], 'y', [3, 3, 3, 3]), draw: pl() }] },
      b: { text: 'Write the table as a list of points.', kind: 'short', keepShort: true, items: [tbl('x', [0, 1, 2], 'y', [5, 4, 3]), tbl('x', [-1, 0, 1], 'y', [-1, 1, 3]), tbl('x', [1, 2, 3], 'y', [2, 4, 6]), tbl('x', [0, 2, 4], 'y', [1, 1, 1])] },
      c: { text: 'Plot, join and describe the pattern.', kind: 'work', items: [{ t: '', fig: tbl('x', [0, 1, 2, 5], 'y', [5, 4, 3, 0]), draw: pl({ min: -1, max: 6, ymin: -1, ymax: 6 }) }, { t: '', fig: tbl('x', [-1, 0, 1, 2], 'y', [-1, 1, 3, 5]), draw: pl({ ymin: -2, ymax: 6 }) }] },
      d: { text: 'Plot and describe.', kind: 'work', items: [{ t: '', fig: tbl('x', [-2, -1, 0, 1, 2], 'y', [4, 1, 0, 1, 4]), draw: pl({ ymin: -1, ymax: 5 }) }, 'Is the pattern in Question 1 a straight line? Describe it.'] },
      ext: { q: 'The points (0, 2), (1, 5), (2, 8) follow a pattern. Find y when x = 10.', steps: ['y goes up by 3 each time x goes up by 1', 'Start at 2 when x = 0: y = 3x + 2', '3 × 10 + 2'], a: '32', qs: ['The points (0, 7), (1, 5), (2, 3) follow a pattern. Find y when x = 6.', 'Find the rule for the points (1, 4), (2, 8), (3, 12).'] },
      summary: { steps: ['Each column of a table is a point (x, y).', 'Plot each point carefully.', 'Join them with a ruler if they line up.', 'Describe: horizontal, vertical, going up or going down.'],
        worked: [['x always −2', ['All points above/below each other'], 'vertical line'], ['y always 3', ['All points level'], 'horizontal line'], ['(0, 5), (1, 4), (2, 3)', ['y goes down 1'], 'line going down'], ['(0, 2), (1, 5), (2, 8)', ['y = 3x + 2'], '32 when x = 10']] },
      exit: { qs: [`Write the points in ${'this table'}: x = 0, 1, 2 and y = 3, 5, 7.`, 'Describe the pattern of the points (1, 4), (2, 4), (3, 4).', 'What happens to y each time x goes up by 1 for (0, 1), (1, 4), (2, 7)?'] },
      ans: { we: ['vertical line x = −2', 'horizontal line y = 3', 'straight line going down', 'straight line going up steeply', 'y goes up by 2', 'y = 7'], a: ['vertical line', 'horizontal line'], b: ['(0, 5), (1, 4), (2, 3)', '(−1, −1), (0, 1), (1, 3)', '(1, 2), (2, 4), (3, 6)', '(0, 1), (2, 1), (4, 1)'],
        c: ['straight line going down', 'straight line going up'], d: ['a U-shaped curve (parabola)', 'no, it is a curve'], ext: ['−5', 'y = 4x'], exit: ['(0, 3), (1, 5), (2, 7)', 'horizontal line', 'it goes up by 3'] },
    }),

    lesson({
      code: '9.05', title: 'Tables of values from rules',
      li: ['complete a table of values from a rule'],
      sc: ['substitute each x value into the rule', 'use negative numbers carefully', 'write the rule from a table'],
      terms: ['Rule', 'Substitute'],
      we: [{ t: 'Complete for <i>y</i> = <i>x</i> + 3.', fig: tbl('x', [-1, 0, 1, 2, 3], 'y') }, { t: 'Complete for <i>q</i> = 2<i>p</i> − 7.', fig: tbl('p', [-2, -1, 0, 1, 2], 'q') }, { t: 'Complete for <i>d</i> = 5 − <i>c</i>.', fig: tbl('c', [-1, 0, 1, 2, 3], 'd') }, { t: 'Complete for <i>y</i> = 3<i>x</i> + 1.', fig: tbl('x', [-2, -1, 0, 1, 2], 'y') }, { t: 'Find the rule.', fig: tbl('x', [0, 1, 2, 3], 'y', [4, 6, 8, 10]) }, { t: 'Find the rule.', fig: tbl('x', [1, 2, 3, 4], 'y', [7, 6, 5, 4]) }],
      a: { text: 'Complete each table.', kind: 'work', cols: 2, items: [{ t: '<i>y</i> = <i>x</i> + 3', fig: tbl('x', [-1, 0, 1, 2, 3], 'y') }, { t: '<i>y</i> = 2<i>x</i>', fig: tbl('x', [-1, 0, 1, 2, 3], 'y') }, { t: '<i>y</i> = <i>x</i> − 4', fig: tbl('x', [0, 1, 2, 3, 4], 'y') }, { t: '<i>y</i> = 5<i>x</i>', fig: tbl('x', [-2, -1, 0, 1, 2], 'y') }], stack: true },
      b: { text: 'Complete each table.', kind: 'work', cols: 2, stack: true, items: [{ t: '<i>q</i> = 2<i>p</i> − 7', fig: tbl('p', [-2, -1, 0, 1, 2], 'q') }, { t: '<i>d</i> = 5 − <i>c</i>', fig: tbl('c', [-1, 0, 1, 2, 3], 'd') }] },
      c: { text: 'Complete each table.', kind: 'work', cols: 2, stack: true, items: [{ t: '<i>y</i> = 3<i>x</i> + 1', fig: tbl('x', [-2, -1, 0, 1, 2], 'y') }, { t: '<i>y</i> = −2<i>x</i> + 3', fig: tbl('x', [-2, -1, 0, 1, 2], 'y') }, { t: '<i>y</i> = ½<i>x</i> − 2', fig: tbl('x', [-4, -2, 0, 2, 4], 'y') }, { t: '<i>y</i> = 10 − 3<i>x</i>', fig: tbl('x', [0, 1, 2, 3, 4], 'y') }] },
      d: { text: 'Find the rule for each table.', kind: 'work', stack: true, items: [{ t: '', fig: tbl('x', [0, 1, 2, 3], 'y', [4, 6, 8, 10]) }, { t: '', fig: tbl('x', [1, 2, 3, 4], 'y', [7, 6, 5, 4]) }, { t: '', fig: tbl('x', [0, 1, 2, 3], 'y', [-3, 1, 5, 9]) }, { t: '', fig: tbl('x', [-1, 0, 1, 2], 'y', [3, 0, -3, -6]) }] },
      ext: { q: 'Complete a table for y = x² − 1 using x = −2 to 2.', steps: ['Square first, then subtract 1', '(−2)² − 1 = 3'], a: 'y = 3, 0, −1, 0, 3', qs: ['Complete a table for y = x² + x using x = −2 to 2.', 'Find the rule: x = 1, 2, 3, 4 and y = 1, 4, 9, 16.'] },
      summary: { steps: ['Write the rule.', 'Replace x with each value (use brackets for negatives).', 'Calculate y.', 'To find a rule: how much does y change when x goes up 1? Then find the start value.'],
        worked: [['y = x + 3', ['−1 + 3 = 2, …'], fill((x) => x + 3, [-1, 0, 1, 2, 3])], ['q = 2p − 7', ['2 × (−2) − 7 = −11'], fill((p) => 2 * p - 7, [-2, -1, 0, 1, 2])], ['Rule for 4, 6, 8, 10', ['+2 each time, start 4'], 'y = 2x + 4'], ['y = x² − 1', ['Square first'], '3, 0, −1, 0, 3']] },
      exit: { qs: ['For y = x + 5, find y when x = −2.', 'For y = 4x − 1, complete for x = 0, 1, 2.', 'Find the rule: x = 0, 1, 2 and y = 1, 4, 7.'] },
      ans: { we: [fill((x) => x + 3, [-1, 0, 1, 2, 3]), fill((p) => 2 * p - 7, [-2, -1, 0, 1, 2]), fill((c) => 5 - c, [-1, 0, 1, 2, 3]), fill((x) => 3 * x + 1, [-2, -1, 0, 1, 2]), 'y = 2x + 4', 'y = 8 − x'],
        a: [fill((x) => x + 3, [-1, 0, 1, 2, 3]), fill((x) => 2 * x, [-1, 0, 1, 2, 3]), fill((x) => x - 4, [0, 1, 2, 3, 4]), fill((x) => 5 * x, [-2, -1, 0, 1, 2])], b: [fill((p) => 2 * p - 7, [-2, -1, 0, 1, 2]), fill((c) => 5 - c, [-1, 0, 1, 2, 3])],
        c: [fill((x) => 3 * x + 1, [-2, -1, 0, 1, 2]), fill((x) => -2 * x + 3, [-2, -1, 0, 1, 2]), fill((x) => x / 2 - 2, [-4, -2, 0, 2, 4]), fill((x) => 10 - 3 * x, [0, 1, 2, 3, 4])], d: ['y = 2x + 4', 'y = 8 − x', 'y = 4x − 3', 'y = −3x'], ext: [fill((x) => x * x + x, [-2, -1, 0, 1, 2]), 'y = x²'], exit: ['3', '−1, 3, 7', 'y = 3x + 1'] },
    }),

    lesson({
      code: '9.06', title: 'Graphing linear equations',
      li: ['graph a linear equation using a table of values', 'test whether a point lies on a line'],
      sc: ['complete a table of values for the equation', 'plot the points and rule a straight line through them', 'substitute a point into the equation to test it'],
      terms: ['Linear', 'Equation'],
      we: [{ t: 'Graph <i>y</i> = 2<i>x</i> − 1 for <i>x</i> = −1 to 2.', draw: pl({ min: -4, max: 4 }) }, { t: 'Graph <i>y</i> = −<i>x</i> + 3.', draw: pl({ min: -4, max: 4 }) }, 'Does (1, 5) lie on y = 3x + 2?', 'Does (−2, −4) lie on y = 3x + 2?', { t: 'Graph <i>y</i> = ½<i>x</i> − 2 for <i>x</i> = −4 to 4.', draw: pl({ min: -4, max: 4 }) }, 'Where does y = 2x − 1 cross the y-axis?'],
      a: { text: 'Complete a table, then graph.', kind: 'work', items: [{ t: '<i>y</i> = <i>x</i> + 1 (<i>x</i> = −2 to 2)', draw: pl() }, { t: '<i>y</i> = 2<i>x</i> − 1 (<i>x</i> = −1 to 2)', draw: pl() }] },
      b: { text: 'Does the point lie on <i>y</i> = 3<i>x</i> + 2? Write yes or no.', kind: 'short', items: ['(1, 2)', '(−1, 4)', '(−2, −4)', '(0, 2)', '(1, 5)', '(2, 8)'] },
      c: { text: 'Complete a table, then graph.', kind: 'work', items: [{ t: '<i>y</i> = −<i>x</i> + 3', draw: pl() }, { t: '<i>y</i> = ½<i>x</i> − 2', draw: pl() }] },
      d: { text: 'Graph and compare.', kind: 'work', items: [{ t: 'Graph <i>y</i> = <i>x</i> and <i>y</i> = <i>x</i> + 2 on the same plane. What do you notice?', draw: pl() }, 'Where do y = x + 1 and y = −x + 3 meet? (Use your graphs.)'] },
      ext: { q: 'Find the value of k if (2, k) lies on y = 4x − 3.', steps: ['Substitute x = 2', 'k = 4 × 2 − 3'], a: 'k = 5', qs: ['Find m if (m, 11) lies on y = 2x + 5.', 'Which of these lines are parallel: y = 2x + 1, y = x + 2, y = 2x − 3?'] },
      summary: { steps: ['Make a table with 3 or more x values.', 'Substitute to find y.', 'Plot and rule a line through all the points.', 'Test a point: substitute x and see if you get its y.'],
        worked: [['y = 2x − 1', [`x: −1, 0, 1, 2 → y: ${fill((x) => 2 * x - 1, [-1, 0, 1, 2])}`], 'a straight line through (0, −1)'], ['(1, 5) on y = 3x + 2?', ['3 × 1 + 2 = 5 ✓'], 'yes'], ['(−2, −4)', ['3 × (−2) + 2 = −4 ✓'], 'yes'], ['(2, k) on y = 4x − 3', ['8 − 3'], 'k = 5']] },
      exit: { qs: ['For y = x + 4, find y when x = 1.', 'Does (2, 5) lie on y = 2x + 1?', 'Does (−1, 3) lie on y = −2x + 1?'] },
      ans: { we: [`y: ${fill((x) => 2 * x - 1, [-1, 0, 1, 2])}; straight line`, `line through (0, 3) going down`, 'yes', 'yes', `y: ${fill((x) => x / 2 - 2, [-4, -2, 0, 2, 4])}`, '(0, −1)'], a: [`y: ${fill((x) => x + 1, [-2, -1, 0, 1, 2])}`, `y: ${fill((x) => 2 * x - 1, [-1, 0, 1, 2])}`],
        b: [[1, 2], [-1, 4], [-2, -4], [0, 2], [1, 5], [2, 8]].map(([x, y]) => (3 * x + 2 === y ? 'yes' : 'no')), c: [`y: ${fill((x) => -x + 3, [-2, -1, 0, 1, 2])}`, `y: ${fill((x) => x / 2 - 2, [-4, -2, 0, 2, 4])}`], d: ['parallel lines, 2 units apart', '(1, 2)'], ext: ['m = 3', 'y = 2x + 1 and y = 2x − 3'], exit: ['5', 'yes', 'yes'] },
    }),
  ],
};
