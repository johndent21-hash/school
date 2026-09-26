// Year 7 Chapter 6: Geometrical figures. One 4-page lesson per exercise in Test Yourself 6.
const lesson = require('../../lib/lesson');
const D = require('../../lib/diagrams');

const r = (d) => (d * Math.PI) / 180;
// Shift points (and any extra lines/labels) so the figure sits in its own box with a margin.
const P = (pts, o = {}, m = 6) => {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const dx = m - Math.min(...xs), dy = m - Math.min(...ys);
  const sh = (p) => [+(p[0] + dx).toFixed(2), +(p[1] + dy).toFixed(2)];
  const lines = (o.lines || []).map(([a, b]) => [sh(a), sh(b)]);
  const labels = (o.labels || []).map(([t, x, y]) => [t, ...sh([x, y])]);
  const all = [...pts, ...(o.lines || []).flat()];
  const w = Math.max(...all.map((p) => p[0])) + dx + m, h = Math.max(...all.map((p) => p[1])) + dy + m;
  return D.polygon({ ...o, pts: pts.map(sh), lines, labels, w: +w.toFixed(1), h: +h.toFixed(1) });
};
// Triangle with base angles A (left) and B (right), base along the bottom. Returns points [A, B, C].
const triPts = (A, B, base = 30) => {
  const s = Math.sin(r(A + B)), k = base / s;
  return [[0, 0], [base, 0], [+(k * Math.sin(r(B)) * Math.cos(r(A))).toFixed(2), +(-k * Math.sin(r(A)) * Math.sin(r(B))).toFixed(2)]];
};
const tri = (A, B, o = {}, base = 30) => P(triPts(A, B, base), o);
// Triangle with the base extended past B, showing the exterior angle at B.
const triExt = (A, B, labs, extLab, base = 26) => {
  const pts = triPts(A, B, base), [bx, by] = pts[1], C = pts[2];
  const u1 = [1, 0], L = Math.hypot(C[0] - bx, C[1] - by), u2 = [(C[0] - bx) / L, (C[1] - by) / L];
  const bis = [u1[0] + u2[0], u1[1] + u2[1]], bl = Math.hypot(...bis);
  return P(pts, { angles: labs, lines: [[[bx, by], [bx + 14, by]]], labels: [[extLab, bx + (bis[0] / bl) * 6.5, by + (bis[1] / bl) * 6.5 + 1]] });
};
const reg = (n, rad = 12, rot = -90) => Array.from({ length: n }, (_, i) => [+(rad * Math.cos(r(rot + (360 * i) / n))).toFixed(2), +(rad * Math.sin(r(rot + (360 * i) / n))).toFixed(2)]);
const shape = (pts, o = {}) => P(pts, { fill: '#dfe6f7', ...o });

const Q = {
  square: [[0, 0], [20, 0], [20, 20], [0, 20]], rect: [[0, 0], [30, 0], [30, 16], [0, 16]], rhombus: [[0, 11], [15, 0], [30, 11], [15, 22]],
  para: [[0, 16], [24, 16], [32, 0], [8, 0]], trap: [[0, 16], [32, 16], [24, 0], [8, 0]], kite: [[12, 0], [22, 8], [12, 28], [2, 8]],
  dart: [[0, 0], [14, 9], [28, 0], [14, 24]], rtrap: [[0, 0], [20, 0], [30, 16], [0, 16]], irreg: [[0, 4], [26, 0], [30, 18], [6, 20]],
  arrow: [[0, 6], [16, 6], [16, 0], [28, 11], [16, 22], [16, 16], [0, 16]], plus: [[8, 0], [16, 0], [16, 8], [24, 8], [24, 16], [16, 16], [16, 24], [8, 24], [8, 16], [0, 16], [0, 8], [8, 8]],
  L: [[0, 0], [8, 0], [8, 16], [18, 16], [18, 24], [0, 24]], H: [[0, 0], [6, 0], [6, 9], [16, 9], [16, 0], [22, 0], [22, 24], [16, 24], [16, 15], [6, 15], [6, 24], [0, 24]],
  S: [[0, 0], [20, 0], [20, 6], [6, 6], [6, 10], [20, 10], [20, 24], [0, 24], [0, 18], [14, 18], [14, 14], [0, 14]],
};
// Grid for transformation questions: shape in cell units.
const gridQ = (shapes, o = {}) => `<div class="template-card tgrid">${D.grid({ cols: 16, rows: 8, cell: 3.9, shapes: shapes.map((pts) => ({ pts })), ...o })}</div>`;
// A taller grid for questions in a panel that fills the rest of the page.
const gridT = (shapes, o = {}) => gridQ(shapes.map((pts) => pts.map(([x, y]) => [x, y + 4])), { rows: 14, ...o, ...(o.point ? { point: [o.point[0], o.point[1] + 4, o.point[2]] } : {}), ...(o.mirror ? { mirror: o.mirror[0] === o.mirror[2] ? [o.mirror[0], 0, o.mirror[2], 14] : [o.mirror[0], o.mirror[1] + 4, o.mirror[2], o.mirror[3] + 4] } : {}) });
const quad = (pts, labs) => P(pts, { angles: labs, angleDist: 6 });

module.exports = {
  year: 7, stage: 4, number: 6, title: 'Geometrical figures', accent: '#7d3c98',
  fileName: 'Year7-Ch06-Geometrical-figures',
  goals: ['reflect, translate and rotate shapes', 'find line and rotational symmetry', 'classify triangles and quadrilaterals', 'use the angle sums of triangles and quadrilaterals',
    'use the exterior angle of a triangle', 'describe the properties of special quadrilaterals'],
  syllabus: 'NSW Mathematics K–10 Syllabus (2022), Stage 4 Measurement and space: MA4-ANG-C-01 (angle relationships, triangles and quadrilaterals) and transformations of shapes on the Cartesian plane and grids.',
  lessons: [
    lesson({
      code: '6.01', title: 'Transforming shapes',
      li: ['reflect, translate and rotate a shape on a grid'],
      sc: ['<b>reflect</b> a shape across a mirror line', '<b>translate</b> a shape a given distance left, right, up or down', '<b>rotate</b> a shape 90°, 180° or 270° about a point'],
      terms: ['Reflect', 'Translate', 'Rotate'],
      we: [{ t: 'Reflect the shape in the dotted line.', draw: gridQ([[[2, 2], [5, 2], [5, 6], [2, 4]]], { mirror: [7, 0, 7, 8] }) }, { t: 'Translate the shape 5 right and 3 down.', draw: gridQ([[[1, 1], [4, 1], [4, 3], [1, 3]]]) },
        { t: 'Rotate 180° about O.', draw: gridQ([[[7, 4], [10, 4], [10, 2]]], { point: [7, 4, 'O'] }) }, { t: 'Rotate 90° clockwise about O.', draw: gridQ([[[7, 4], [7, 1], [9, 1]]], { point: [7, 4, 'O'] }) },
        { t: 'Reflect in the dotted line.', draw: gridQ([[[2, 1], [5, 1], [5, 3], [3, 5]]], { mirror: [7, 0, 7, 8] }) }, { t: 'Rotate 270° clockwise about O.', draw: gridQ([[[7, 4], [10, 4], [10, 3], [8, 2]]], { point: [7, 4, 'O'] }) }],
      a: { text: 'Reflect each shape in the dotted line.', kind: 'work', items: [{ t: '', draw: gridQ([[[2, 2], [5, 2], [5, 5]]], { mirror: [7, 0, 7, 8] }) }, { t: '', draw: gridQ([[[1, 1], [4, 1], [4, 2], [2, 3]]], { mirror: [0, 4, 14, 4] }) }] },
      b: { text: 'Translate each shape.', kind: 'work', items: [{ t: '4 units left, 1 unit up', draw: gridQ([[[8, 4], [11, 4], [11, 6], [8, 6]]]) }, { t: '4 units right, 6 units up', draw: gridQ([[[2, 6], [4, 6], [3, 8]]]) }] },
      c: { text: 'Rotate each shape about O.', kind: 'work', items: [{ t: '180°', draw: gridT([[[7, 4], [10, 4], [10, 2], [8, 2]]], { point: [7, 4, 'O'] }) }, { t: '90° clockwise', draw: gridT([[[7, 4], [11, 4], [11, 3]]], { point: [7, 4, 'O'] }) }] },
      d: { text: 'Transform each shape.', kind: 'work', items: [{ t: 'Rotate 270° clockwise about O.', draw: gridT([[[7, 4], [7, 1], [9, 2]]], { point: [7, 4, 'O'] }) }, { t: 'Reflect in the dotted line.', draw: gridT([[[2, 1], [4, 1], [4, 3], [2, 3]]], { mirror: [0, 0, 8, 8] }) }] },
      ext: { q: 'A shape is rotated 90° clockwise and then 180°. What single rotation does the same thing?', steps: ['Rotations about the same point add', '90° + 180° = 270°'], a: '270° clockwise (or 90° anticlockwise)', qs: ['Which single transformation is the same as reflecting in a vertical line and then in a horizontal line that crosses it?', 'Is a 90° clockwise rotation the same as a 270° anticlockwise rotation? Explain.'] },
      summary: { steps: ['<b>Reflect</b>: flip over the mirror line; same distance each side.', '<b>Translate</b>: slide; count units left/right then up/down.', '<b>Rotate</b>: turn about a point; use tracing paper.', 'The shape keeps its size and shape.'],
        worked: [['Reflect in a vertical line', ['Each vertex the same distance on the other side'], 'a mirror image'], ['Translate 5 right, 3 down', ['Move every vertex'], 'same shape, new position'], ['Rotate 180° about O', ['Each vertex goes through O to the other side'], 'upside down'], ['90° then 180°', ['Add'], '270° clockwise']] },
      exit: { qs: ['Name the transformation that flips a shape.', 'A point is at (2, 3) on a grid. Where is it after a translation 4 right and 1 down?', 'Describe what a 90° clockwise rotation does to an arrow pointing up.'] },
      ans: { we: ['mirror image on the right of the line', 'moved 5 right and 3 down', 'turned upside down through O', 'turned a quarter turn clockwise', 'mirror image below the line', 'turned three-quarters clockwise'], a: ['reflected to the right of x = 7', 'reflected below the line'], b: ['moved 4 left, 1 up', 'moved 4 right, 6 up'], c: ['rotated 180°', 'rotated 90° clockwise'], d: ['rotated 270° clockwise', 'reflected in the diagonal'],
        ext: ['a rotation of 180° about the point where the lines cross', 'Yes: both end in the same position'], exit: ['reflection', '(6, 2)', 'it points right'] },
    }),

    lesson({
      code: '6.02', title: 'Combined transformations',
      li: ['apply two or more transformations in order', 'describe a combined transformation'],
      sc: ['do each transformation in the order given', 'label each new image (A, A′, A″)', 'describe a combination that maps one shape onto another'],
      terms: ['Image', 'Combined transformation'],
      we: [{ t: 'Translate 5 right, 2 up; then reflect.', draw: gridQ([[[1, 5], [3, 5], [3, 7], [1, 7]]], { mirror: [10, 0, 10, 8] }) }, { t: 'Rotate 90° clockwise about A, then 3 left.', draw: gridQ([[[7, 5], [10, 5], [10, 3]]], { point: [7, 5, 'A'] }) },
        { t: 'Reflect in the dotted line, then translate 1 down.', draw: gridQ([[[2, 1], [5, 1], [5, 3]]], { mirror: [7, 0, 7, 8] }) }, 'Does the order matter? Try reflecting then translating versus translating then reflecting.',
        { t: 'Translate 5 right and 2 up, rotate 90° clockwise about A, then reflect in the dotted line.', draw: gridQ([[[1, 6], [3, 6], [3, 8], [1, 8]]], { point: [3, 6, 'A'], mirror: [11, 0, 11, 8] }) }, 'Describe two transformations that move a shape from the top-left to the bottom-right of a grid, upside down.'],
      a: { text: 'Do both transformations.', kind: 'work', items: [{ t: 'Translate 3 right; then reflect.', draw: gridQ([[[1, 1], [4, 1], [4, 3]]], { mirror: [9, 0, 9, 8] }) }, { t: 'Reflect; then translate 2 up.', draw: gridQ([[[2, 3], [5, 3], [5, 5], [2, 5]]], { mirror: [7, 0, 7, 8] }) }] },
      b: { text: 'Do both transformations.', kind: 'work', items: [{ t: 'Rotate 180° about O, then translate 2 down.', draw: gridQ([[[7, 3], [9, 3], [9, 1]]], { point: [7, 3, 'O'] }) }, { t: 'Translate 4 left, then rotate 90° clockwise about B.', draw: gridQ([[[8, 4], [11, 4], [11, 2]]], { point: [4, 4, 'B'] }) }] },
      c: { text: 'Do all three transformations.', kind: 'work', items: [{ t: 'Translate 5 right, 2 up; rotate 90° clockwise about A; reflect in the dotted line.', draw: gridT([[[1, 6], [3, 6], [3, 8], [1, 8]]], { point: [3, 6, 'A'], mirror: [11, 0, 11, 8] }) }, { t: 'Reflect in the dotted line; translate 1 left; rotate 180° about C.', draw: gridT([[[2, 2], [4, 2], [2, 5]]], { mirror: [6, 0, 6, 8], point: [8, 5, 'C'] }) }] },
      d: { text: 'Describe the transformations.', kind: 'work', items: [{ t: 'Describe how shape P moves onto shape Q.', fig: D.grid({ cols: 14, rows: 8, cell: 3.4, shapes: [{ pts: [[1, 1], [4, 1], [4, 3]] }, { pts: [[9, 7], [12, 7], [12, 5]], fill: '#f3d6a6' }], labels: [['P', 1.5, 2.6], ['Q', 10.8, 6.7]] }) }, { t: 'Find two different ways to move P onto Q.', fig: D.grid({ cols: 14, rows: 8, cell: 3.4, shapes: [{ pts: [[1, 1], [4, 1], [4, 3]] }, { pts: [[13, 1], [10, 1], [10, 3]], fill: '#f3d6a6' }], labels: [['P', 1.5, 2.6], ['Q', 11.5, 2.3]] }) }, 'Does a translation followed by a reflection give the same result as the reflection first? Give an example.', 'Which transformations never change the direction a shape faces?'] },
      ext: { q: 'A triangle has vertices (1, 1), (3, 1), (3, 4). It is reflected in the <i>y</i>-axis, then translated 2 units down. Where are the vertices?', steps: ['Reflect in y-axis: (−1, 1), (−3, 1), (−3, 4)', 'Down 2: subtract 2 from each y'], a: '(−1, −1), (−3, −1), (−3, 2)', qs: ['Reflect (2, 5) in the <i>x</i>-axis, then translate 3 left. Where is it?', 'Rotate (4, 1) by 180° about the origin. Where is it?'] },
      summary: { steps: ['Do the transformations in the order given.', 'Draw each image before doing the next.', 'Label them A, A′, A″.', 'Order can change the final position.'],
        worked: [['Translate then reflect', ['Slide first', 'Then flip over the line'], 'image A″'], ['Rotate then translate', ['Turn about the point', 'Then slide'], 'image A″'], ['Order matters?', ['Try both ways'], 'often yes'], ['Reflect in y-axis then down 2', ['(x, y) → (−x, y − 2)'], '(−1, −1), (−3, −1), (−3, 2)']] },
      exit: { qs: ['What does A′ mean?', 'A point (1, 2) is translated 3 right then 4 up. Where is it?', 'A point (2, 3) is reflected in the <i>x</i>-axis then translated 2 left. Where is it?'] },
      ans: { we: ['translated, then flipped over the line', 'rotated, then moved 3 left', 'reflected, then moved down 1', 'Often yes: the images end in different places', 'three images drawn in order', 'e.g. rotate 180°, then translate'], a: ['moved then flipped', 'flipped then moved up'], b: ['turned then moved down', 'moved then turned'], c: ['three images', 'three images'],
        d: ['e.g. rotate 180° then translate', 'reflect in a vertical line; or reflect then translate', 'Not always: e.g. a reflection in a horizontal line and a translation to the right give the same, but a translation up does not', 'translations'], ext: ['(−1, −5)', '(−4, −1)'], exit: ['the image after one transformation', '(4, 6)', '(0, −3)'] },
    }),

    lesson({
      code: '6.03', title: 'Line symmetry',
      li: ['find the axes of symmetry of a shape'],
      sc: ['know that an axis of symmetry divides a shape into two mirror images', 'draw every axis of symmetry on a shape', 'count the axes of symmetry'],
      terms: ['Line symmetry', 'Axis of symmetry'],
      we: [{ t: 'Draw the axes of symmetry.', fig: shape(Q.rect) }, { t: 'Draw the axes of symmetry.', fig: shape(Q.square) }, { t: 'How many axes?', fig: shape(reg(6)) }, { t: 'How many axes?', fig: shape(Q.para) }, { t: 'How many axes?', fig: shape(Q.H) }, 'How many axes of symmetry does a circle have?'],
      a: { text: 'Draw all the axes of symmetry. Write how many.', kind: 'work', cols: 3, items: [{ t: '', fig: shape(tri(60, 60, {}, 26) && triPts(60, 60, 26)) }, { t: '', fig: shape(Q.kite) }, { t: '', fig: shape(Q.rhombus) }, { t: '', fig: shape(Q.arrow) }, { t: '', fig: shape(Q.trap) }, { t: '', fig: shape(Q.L) }] },
      b: { text: 'Draw all the axes of symmetry. Write how many.', kind: 'work', cols: 3, items: [{ t: '', fig: shape(reg(5)) }, { t: '', fig: shape(Q.plus) }, { t: '', fig: shape(triPts(70, 70, 22)) }] },
      c: { text: 'Draw all the axes of symmetry. Write how many.', kind: 'work', cols: 3, items: [{ t: '', fig: shape(reg(8)) }, { t: '', fig: shape(Q.S) }, { t: '', fig: shape(Q.rtrap) }, { t: '', fig: shape(Q.dart) }, { t: '', fig: shape(triPts(90, 35, 26)) }, { t: '', fig: shape(Q.H) }] },
      d: { text: 'Think it through.', kind: 'work', items: ['How many axes of symmetry does a regular 10-sided shape have?', 'Which capital letters of the alphabet have exactly one axis of symmetry? List 5.', 'Draw a shape with exactly 2 axes of symmetry.', 'Can a triangle have exactly 2 axes of symmetry? Explain.'] },
      ext: { q: 'Complete the shape so that the dotted line is an axis of symmetry.', steps: ['Each point is reflected across the line', 'Join the reflected points'], a: 'a symmetric shape', fig: D.grid({ cols: 10, rows: 7, cell: 4, shapes: [{ pts: [[5, 1], [2, 2], [3, 5], [5, 6]] }], mirror: [5, 0, 5, 7] }), qs: [{ t: 'Complete the shape so both dotted lines are axes of symmetry.', draw: `<div class="template-card">${D.grid({ cols: 12, rows: 8, cell: 3.8, shapes: [{ pts: [[6, 1], [3, 2], [2, 4], [6, 4]] }], mirror: [6, 0, 6, 8] })}</div>` }, 'A regular polygon has 12 axes of symmetry. How many sides does it have?'] },
      summary: { steps: ['An <b>axis of symmetry</b> folds a shape onto itself.', 'Test by folding or with a mirror.', 'Draw the axes as dotted lines.', 'A regular polygon with n sides has n axes.'],
        worked: [['Rectangle', ['Vertical and horizontal only'], '2 axes'], ['Square', ['2 through sides, 2 diagonals'], '4 axes'], ['Parallelogram', ['No fold works'], '0 axes'], ['Regular 12-gon', ['n axes'], '12 axes']] },
      exit: { qs: ['How many axes of symmetry does an equilateral triangle have?', 'How many axes of symmetry does a kite have?', 'How many axes of symmetry does a regular hexagon have?'] },
      ans: { we: ['2', '4', '6', '0', '2', 'infinitely many'], a: ['3', '1', '2', '1', '1', '0'], b: ['5', '4', '1'], c: ['8', '0', '0', '1', '0', '2'],
        d: ['10', 'e.g. A, B, C, D, E, M, T, U, V, W, Y', 'e.g. a rectangle', 'No: 2 axes would make all sides equal, giving 3'], ext: ['a shape with 2 axes', '12'], exit: ['3', '1', '6'] },
    }),

    lesson({
      code: '6.04', title: 'Rotational symmetry',
      li: ['find the order of rotational symmetry of a shape'],
      sc: ['know a shape has rotational symmetry if it looks the same before a full turn', 'count the <b>order</b>: how many times it matches in one full turn', 'find the angle of each turn'],
      terms: ['Rotational symmetry', 'Order'],
      we: [{ t: 'Order of rotational symmetry?', fig: shape(Q.rect) }, { t: 'Order?', fig: shape(Q.square) }, { t: 'Order?', fig: shape(Q.para) }, { t: 'Order?', fig: shape(Q.kite) }, { t: 'Order?', fig: shape(Q.S) }, 'A shape has order 5. What is the smallest angle it turns to match itself?'],
      a: { text: 'Does the shape have rotational symmetry? If so, give its order.', kind: 'work', cols: 3, items: [{ t: '', fig: shape(triPts(60, 60, 26)) }, { t: '', fig: shape(Q.rhombus) }, { t: '', fig: shape(Q.trap) }, { t: '', fig: shape(reg(6)) }, { t: '', fig: shape(Q.L) }, { t: '', fig: shape(Q.plus) }] },
      b: { text: 'Give the order of rotational symmetry.', kind: 'work', cols: 3, items: [{ t: '', fig: shape(Q.H) }, { t: '', fig: shape(reg(5)) }, { t: '', fig: shape(Q.arrow) }] },
      c: { text: 'Give the order and the smallest angle of turn.', kind: 'work', cols: 3, items: [{ t: '', fig: shape(reg(8)) }, { t: '', fig: shape(Q.square) }, { t: '', fig: shape(Q.para) }, { t: '', fig: shape(Q.S) }, { t: '', fig: shape(reg(3, 13)) }, { t: '', fig: shape(Q.dart) }] },
      d: { text: 'Think it through.', kind: 'work', items: ['Which capital letters have rotational symmetry of order 2? List 4.', 'Can a shape have rotational symmetry but no line symmetry? Give an example.', 'A shape matches itself every 72°. What is its order?', 'Draw a shape with rotational symmetry of order 4.'] },
      ext: { q: 'A regular polygon matches itself every 40°. How many sides does it have?', steps: ['A full turn is 360°', '360 ÷ 40 = 9'], a: '9 sides', qs: ['A regular polygon matches itself every 30°. How many sides does it have?', 'Which has the larger angle of turn: order 6 or order 8? Explain.'] },
      summary: { steps: ['Turn the shape about its centre.', 'Count how many times it looks the same in one turn.', 'That count is the <b>order</b>.', 'Order 1 means no rotational symmetry. Angle = 360° ÷ order.'],
        worked: [['Rectangle', ['Matches at 180° and 360°'], 'order 2'], ['Square', ['Every 90°'], 'order 4'], ['Kite', ['Only at 360°'], 'no rotational symmetry'], ['Every 40°', ['360 ÷ 40'], '9 sides']] },
      exit: { qs: ['What is the order of rotational symmetry of a square?', 'Does a kite have rotational symmetry?', 'A shape has order 6. Find its smallest angle of turn.'] },
      ans: { we: ['2', '4', '2', 'none (order 1)', '2', '72°'], a: ['order 3', 'order 2', 'none', 'order 6', 'none', 'order 4'], b: ['2', '5', 'none'], c: ['8, 45°', '4, 90°', '2, 180°', '2, 180°', '3, 120°', 'none'],
        d: ['e.g. H, I, N, O, S, X, Z', 'Yes, e.g. a parallelogram or the letter S', '5', 'e.g. a square or a plus sign'], ext: ['12', 'order 6: 60° is larger than 45°'], exit: ['4', 'no', '60°'] },
    }),

    lesson({
      code: '6.05', title: 'Classifying triangles',
      li: ['classify triangles by their sides and by their angles'],
      sc: ['name triangles by sides: equilateral, isosceles, scalene', 'name triangles by angles: acute-angled, right-angled, obtuse-angled', 'find equal angles in an isosceles triangle'],
      terms: ['Isosceles', 'Scalene', 'Equilateral'],
      we: [{ t: 'Classify by sides and by angles.', fig: tri(60, 60, { ticks: [[0, 1], [1, 1], [2, 1]] }) }, { t: 'Classify by sides and by angles.', fig: tri(90, 35, { right: [0] }) },
        { t: 'Classify △FGH. Which angles are equal?', fig: tri(51.3, 51.3, { vlabels: ['F', 'H', 'G'], sides: ['5 cm', '4 cm', '4 cm'] }) }, { t: 'Classify by sides and angles.', fig: tri(25, 30, { angles: ['25°', '30°', '125°'] }) },
        'My angles are 60°, 80° and 40°. Classify me.', 'All my angles are equal. Classify me.'],
      a: { text: 'Classify each triangle by its sides.', kind: 'work', cols: 3, items: [{ t: '', fig: tri(70, 70, { ticks: [[1, 1], [2, 1]] }, 22) }, { t: '', fig: tri(40, 65) }, { t: '', fig: tri(60, 60, { ticks: [[0, 1], [1, 1], [2, 1]] }, 24) },
        { t: '', fig: tri(45, 45, { ticks: [[1, 1], [2, 1]], right: [2] }) }, { t: '', fig: tri(30, 110, {}, 24) }, { t: '', fig: tri(35, 35, { ticks: [[1, 1], [2, 1]] }) }] },
      b: { text: 'Classify each triangle by its angles.', kind: 'work', cols: 3, items: [{ t: '', fig: tri(90, 50, { right: [0] }) }, { t: '', fig: tri(55, 65) }, { t: '', fig: tri(20, 25, {}, 34) }] },
      c: { text: 'Classify each triangle by sides and by angles.', kind: 'work', cols: 3, items: [{ t: '', fig: tri(45, 45, { ticks: [[1, 1], [2, 1]], right: [2] }) }, { t: '', fig: tri(30, 30, { ticks: [[1, 1], [2, 1]] }, 34) }, { t: '', fig: tri(60, 60, { ticks: [[0, 1], [1, 1], [2, 1]] }, 24) },
        { t: '', fig: tri(90, 30, { right: [0] }) }, { t: '', fig: tri(50, 75) }, { t: '', fig: tri(72, 72, { ticks: [[1, 1], [2, 1]] }, 18) }] },
      d: { text: 'Classify each described triangle by sides and by angles.', kind: 'work', items: ['My angles are 60°, 80° and 40°.', 'My sides are 5 cm, 5 cm and 7 cm, and one angle is 90°. Is this possible? Explain.', 'My angles are 30°, 30° and 120°.', 'Can a triangle be right-angled and equilateral? Explain.'] },
      ext: { q: 'An isosceles triangle has one angle of 40°. What could the other two angles be?', steps: ['If 40° is one of the equal angles: 40°, 40°, 100°', 'If 40° is the apex: (180 − 40) ÷ 2 = 70°'], a: '40° and 100°, or 70° and 70°', qs: ['An isosceles triangle has one angle of 100°. Find the other two angles.', 'An isosceles triangle has one angle of 60°. What type of triangle is it?'] },
      summary: { steps: ['Sides: <b>equilateral</b> (3 equal), <b>isosceles</b> (2 equal), <b>scalene</b> (none).', 'Angles: <b>acute</b> (all < 90°), <b>right</b> (one 90°), <b>obtuse</b> (one > 90°).', 'Equal sides have matching tick marks.', 'Angles opposite equal sides are equal.'],
        worked: [['3 equal sides', ['All angles 60°'], 'equilateral, acute'], ['△FGH: 4 cm, 4 cm, 5 cm', ['Two equal sides'], 'isosceles; ∠F = ∠H'], ['25°, 30°, 125°', ['One obtuse angle'], 'scalene, obtuse'], ['Isosceles with a 40° angle', ['Two cases'], '40°, 100° or 70°, 70°']] },
      exit: { qs: ['Classify a triangle with sides 6, 6 and 6 cm.', 'Classify a triangle with angles 90°, 45° and 45°.', 'Classify a triangle with angles 110°, 35° and 35° by sides and angles.'] },
      ans: { we: ['equilateral, acute-angled', 'scalene, right-angled', 'isosceles, acute-angled; ∠F = ∠H', 'scalene, obtuse-angled', 'scalene, acute-angled', 'equilateral, acute-angled'], a: ['isosceles', 'scalene', 'equilateral', 'isosceles', 'scalene', 'isosceles'], b: ['right-angled', 'acute-angled', 'obtuse-angled'],
        c: ['isosceles, right-angled', 'isosceles, obtuse-angled', 'equilateral, acute-angled', 'scalene, right-angled', 'scalene, acute-angled', 'isosceles, acute-angled'], d: ['scalene, acute-angled', 'Yes: isosceles right-angled (the 7 cm side is the longest)', 'isosceles, obtuse-angled', 'No: equilateral angles are all 60°'], ext: ['40° and 40°', 'equilateral'], exit: ['equilateral', 'isosceles, right-angled', 'isosceles, obtuse-angled'] },
    }),

    lesson({
      code: '6.06', title: 'Angle sum of a triangle',
      li: ['use the angle sum of a triangle to find unknown angles'],
      sc: ['know the angles in a triangle add to 180°', 'use equal angles in isosceles and equilateral triangles', 'give reasons for each step'],
      terms: ['Angle sum', 'Reason'],
      we: [{ t: 'Find <i>x</i>.', fig: tri(43, 78, { angles: ['43°', '78°', 'x°'] }) }, { t: 'Find <i>u</i>.', fig: tri(90, 39, { angles: ['', '39°', 'u°'], right: [0] }) },
        { t: 'Find <i>a</i>.', fig: tri(22, 31, { angles: ['22°', '31°', 'a°'] }, 34) }, { t: 'Find <i>y</i> and <i>z</i>.', fig: tri(50, 50, { angles: ['50°', 'y°', 'z°'], ticks: [[1, 1], [2, 1]] }) },
        { t: 'Find <i>n</i> and <i>m</i> (isosceles).', fig: tri(62, 62, { angles: ['62°', 'n°', 'm°'], ticks: [[1, 1], [2, 1]] }) }, { t: 'Find ∠PQR.', fig: tri(72, 72, { vlabels: ['P', 'R', 'Q'], angles: ['72°', '', ''], ticks: [[1, 1], [2, 1]] }, 20) }],
      a: { text: 'Find the value of each variable.', kind: 'work', cols: 3, items: [{ t: '', fig: tri(43, 78, { angles: ['43°', '78°', 'x°'] }) }, { t: '', fig: tri(46, 58, { angles: ['46°', '58°', 'v°'] }) }, { t: '', fig: tri(60, 70, { angles: ['60°', '70°', 'k°'] }) },
        { t: '', fig: tri(35, 85, { angles: ['35°', 'd°', '60°'] }) }, { t: '', fig: tri(90, 39, { angles: ['', '39°', 'u°'], right: [0] }) }, { t: '', fig: tri(55, 45, { angles: ['p°', '45°', '80°'] }) }] },
      b: { text: 'Find the value of each variable.', kind: 'work', cols: 3, items: [{ t: '', fig: tri(22, 31, { angles: ['22°', '31°', 'a°'] }, 34) }, { t: '', fig: tri(42, 38, { angles: ['42°', '38°', 'p°'] }, 32) }, { t: '', fig: tri(90, 27, { angles: ['', 'w°', '63°'], right: [0] }) }] },
      c: { text: 'Isosceles and equilateral triangles. Find each variable.', kind: 'work', cols: 3, items: [{ t: '', fig: tri(50, 50, { angles: ['50°', 'y°', 'z°'], ticks: [[1, 1], [2, 1]] }) }, { t: '', fig: tri(62, 62, { angles: ['62°', 'n°', 'm°'], ticks: [[1, 1], [2, 1]] }) }, { t: '', fig: tri(60, 60, { angles: ['t°', 't°', 't°'], ticks: [[0, 1], [1, 1], [2, 1]] }, 24) },
        { t: '', fig: tri(35, 35, { angles: ['b°', 'b°', '110°'], ticks: [[1, 1], [2, 1]] }) }, { t: '', fig: tri(45, 45, { angles: ['c°', 'c°', ''], right: [2], ticks: [[1, 1], [2, 1]] }) }, { t: '', fig: tri(72, 72, { angles: ['72°', '', 'q°'], ticks: [[1, 1], [2, 1]] }, 20) }] },
      d: { text: 'Find the unknowns. Give reasons.', kind: 'work', items: ['The angles of a triangle are <i>x</i>°, 2<i>x</i>° and 3<i>x</i>°. Find <i>x</i>.', 'An isosceles triangle has an apex angle of 36°. Find the base angles.', 'Can a triangle have angles of 100° and 90°? Explain.', 'Two angles of a triangle are equal and the third is 20° more than each of them. Find all three.'] },
      ext: { q: 'Prove that the angles of a triangle add to 180° using a line parallel to the base.', steps: ['Draw a line through the top vertex parallel to the base', 'The two outer angles equal the base angles (alternate angles)', 'The three angles at the top form a straight line: 180°'], a: 'a + b + c = 180°', qs: ['Tear the corners off a paper triangle and place them together. What do you see?', 'Use the angle sum to explain why a triangle can have only one obtuse angle.'] },
      summary: { steps: ['Angles in a triangle add to <b>180°</b>.', 'Add the known angles, subtract from 180°.', 'Isosceles: base angles are equal.', 'Equilateral: every angle is 60°.'],
        worked: [['43°, 78°, x°', ['180 − 43 − 78'], 'x = 59'], ['Right angle and 39°', ['180 − 90 − 39'], 'u = 51'], ['Isosceles, apex 72° at P? no: base 72°', ['∠PQR = 180 − 72 − 72'], '36°'], ['Proof', ['Parallel line and alternate angles'], '180°']] },
      exit: { qs: ['Two angles of a triangle are 65° and 45°. Find the third.', 'A right-angled triangle has an angle of 28°. Find the other angle.', 'An isosceles triangle has base angles of 67°. Find the apex angle.'] },
      ans: { we: ['x = 59', 'u = 51', 'a = 127', 'y = 50, z = 80', 'n = 62, m = 56', '∠PQR = 36° (C)'], a: ['x = 59', 'v = 76', 'k = 50', 'd = 85', 'u = 51', 'p = 55'], b: ['a = 127', 'p = 100', 'w = 27'],
        c: ['y = 50, z = 80', 'n = 62, m = 56', 't = 60', 'b = 35', 'c = 45', 'q = 36'], d: ['x = 30', '72° each', 'No: 100 + 90 is already more than 180', ', 53⅓°, 53⅓°, 73⅓°'.slice(2)], ext: ['they form a straight line (180°)', 'two obtuse angles already add to more than 180°'], exit: ['70°', '62°', '46°'] },
    }),

    lesson({
      code: '6.07', title: 'Exterior angle of a triangle',
      li: ['use the exterior angle property of a triangle'],
      sc: ['identify an <b>exterior angle</b> of a triangle', 'know the exterior angle equals the sum of the two interior opposite angles', 'find unknown angles using this rule'],
      terms: ['Exterior angle', 'Interior opposite angles'],
      we: [{ t: 'Find <i>x</i>.', fig: triExt(59, 65, ['59°', '', '56°'], 'x°') }, { t: 'Find <i>x</i>.', fig: triExt(43, 69, ['43°', '', '68°'], 'x°') },
        { t: 'Find <i>x</i>.', fig: triExt(46, 22, ['46°', '', 'x°'], '158°') }, { t: 'Find <i>p</i>.', fig: triExt(42, 42, ['42°', '', 'p°'], '138°') },
        { t: 'Find <i>m</i> and <i>n</i>.', fig: triExt(42, 81, ['42°', 'n°', '57°'], 'm°') }, 'Why is the exterior angle always larger than each interior opposite angle?'],
      a: { text: 'Find the value of each variable.', kind: 'work', cols: 3, items: [{ t: '', fig: triExt(59, 65, ['59°', '', '56°'], 'x°') }, { t: '', fig: triExt(43, 69, ['43°', '', '68°'], 'x°') }, { t: '', fig: triExt(50, 70, ['50°', '', '60°'], 'a°') },
        { t: '', fig: triExt(35, 60, ['35°', '', '85°'], 'b°') }, { t: '', fig: triExt(70, 60, ['70°', '', '50°'], 'c°') }, { t: '', fig: triExt(30, 90, ['30°', '', '60°'], 'd°') }] },
      b: { text: 'Find the value of each variable.', kind: 'work', cols: 3, items: [{ t: '', fig: triExt(70, 40, ['70°', '', 'x°'], '140°') }, { t: '', fig: triExt(42, 42, ['42°', '', 'p°'], '138°') }, { t: '', fig: triExt(55, 50, ['y°', '', '75°'], '130°') }] },
      c: { text: 'Find each variable. Give reasons.', kind: 'work', cols: 3, items: [{ t: '', fig: triExt(42, 81, ['42°', 'n°', '57°'], 'm°') }, { t: '', fig: triExt(38, 72, ['38°', 'k°', '70°'], 'j°') }, { t: '', fig: triExt(55, 55, ['55°', 'r°', 's°'], '125°') },
        { t: '', fig: triExt(60, 60, ['t°', '', 't°'], '120°') }, { t: '', fig: triExt(28, 90, ['28°', 'u°', ''], 'v°') }, { t: '', fig: triExt(45, 75, ['45°', '', 'w°'], '105°') }] },
      d: { text: 'Harder problems.', kind: 'work', items: ['The interior opposite angles are <i>x</i>° and 2<i>x</i>°. The exterior angle is 111°. Find <i>x</i>.', 'The exterior angle of an isosceles triangle at the base is 110°. Find all three interior angles.', 'What do the three exterior angles of a triangle (one at each vertex) add to? Test with an equilateral triangle.', 'Can an exterior angle be acute? Explain.'] },
      ext: { q: 'Prove the exterior angle property using the angle sum.', steps: ['a + b + c = 180 (angle sum)', 'c + x = 180 (straight line)', 'So x = a + b'], a: 'The exterior angle equals the sum of the interior opposite angles', qs: ['An exterior angle is 4 times the interior angle next to it. Find the exterior angle.', 'The exterior angle is 130° and one interior opposite angle is 20° more than the other. Find both.'] },
      summary: { steps: ['An <b>exterior angle</b> is made by extending one side.', 'Exterior angle = sum of the two <b>interior opposite</b> angles.', 'Exterior + adjacent interior = 180°.', 'Give the reason: “exterior angle of a triangle”.'],
        worked: [['59° and 56° opposite', ['59 + 56'], 'x = 115'], ['46° + x = 158°', ['158 − 46'], 'x = 112'], ['42° + p = 138°', ['138 − 42'], 'p = 96'], ['Proof', ['Angle sum and straight line'], 'x = a + b']] },
      exit: { qs: ['Interior opposite angles 40° and 75°. Find the exterior angle.', 'The exterior angle is 125° and one interior opposite angle is 60°. Find the other.', 'The exterior angle is 140°. Find the adjacent interior angle.'] },
      ans: { we: ['x = 115', 'x = 111', 'x = 112', 'p = 96', 'm = 99, n = 81', 'it is the sum of both, so it is bigger than either'], a: ['x = 115', 'x = 111', 'a = 110', 'b = 120', 'c = 120', 'd = 90'], b: ['x = 70', 'p = 96', 'y = 55'],
        c: ['m = 99, n = 81', 'j = 108, k = 72', 'r = 55, s = 70', 't = 60', 'u = 62, v = 90', 'w = 60'], d: ['x = 37', '70°, 70°, 40°', '360°', 'Yes, if the adjacent interior angle is obtuse'], ext: ['144°', '55° and 75°'], exit: ['115°', '65°', '40°'] },
    }),

    lesson({
      code: '6.08', title: 'Quadrilaterals',
      li: ['classify quadrilaterals', 'describe the symmetry and definitions of special quadrilaterals'],
      sc: ['decide if a quadrilateral is <b>convex</b> or <b>non-convex</b>', 'name the special quadrilaterals', 'give the definition of each special quadrilateral'],
      terms: ['Convex', 'Parallelogram', 'Rhombus'],
      we: [{ t: 'Convex or non-convex?', fig: shape(Q.dart) }, { t: 'Name this quadrilateral.', fig: P(Q.para, { arrows: [[0, 1], [2, 1], [1, 2], [3, 2]] }) }, { t: 'Name this quadrilateral.', fig: P(Q.rhombus, { ticks: [[0, 1], [1, 1], [2, 1], [3, 1]] }) }, { t: 'Name this quadrilateral.', fig: P(Q.trap, { arrows: [[0, 1], [2, 1]] }) }, 'What is the definition of a rhombus?', 'What am I? I have one pair of parallel sides.'],
      a: { text: 'Convex or non-convex?', kind: 'work', cols: 3, items: [{ t: '', fig: shape(Q.irreg) }, { t: '', fig: shape(Q.dart) }, { t: '', fig: shape(Q.kite) }, { t: '', fig: shape([[0, 0], [30, 0], [22, 10], [30, 20], [0, 20]]) }, { t: '', fig: shape(Q.rtrap) }, { t: '', fig: shape([[0, 20], [10, 0], [14, 14], [30, 20]]) }] },
      b: { text: 'Name each special quadrilateral.', kind: 'work', cols: 3, items: [{ t: '', fig: P(Q.rect, { right: [0, 1, 2, 3] }) }, { t: '', fig: P(Q.kite, { ticks: [[0, 1], [3, 1], [1, 2], [2, 2]] }) }, { t: '', fig: P(Q.square, { right: [0, 1, 2, 3], ticks: [[0, 1], [1, 1], [2, 1], [3, 1]] }) }] },
      c: { text: 'For each shape in Set B and Examples 2–4, write the number of axes of symmetry and the order of rotational symmetry.', kind: 'work', cols: 3, items: ['Rectangle', 'Kite', 'Square', 'Parallelogram', 'Rhombus', 'Trapezium (isosceles)'] },
      d: { text: 'Definitions.', kind: 'work', items: ['What quadrilateral am I? I have both pairs of opposite sides parallel.', 'Write the definition of a rectangle.', 'Is a square a rhombus? Explain using definitions.', 'Is every rectangle a parallelogram? Explain.'] },
      ext: { q: 'Draw a family tree of the quadrilaterals.', steps: ['Quadrilateral → trapezium → parallelogram', 'Parallelogram → rectangle and rhombus', 'Rectangle and rhombus → square'], a: 'A square is a special rectangle and a special rhombus', qs: ['Where does a kite fit in the family tree? Is a rhombus a kite?', 'Which special quadrilaterals have exactly 2 axes of symmetry?'] },
      summary: { title: 'Definitions', steps: ['<b>Trapezium</b>: at least one pair of parallel sides. <b>Parallelogram</b>: both pairs parallel.', '<b>Rhombus</b>: parallelogram with all sides equal. <b>Rectangle</b>: parallelogram with a right angle.', '<b>Square</b>: rectangle with all sides equal. <b>Kite</b>: two pairs of equal adjacent sides.', '<b>Convex</b>: all angles less than 180°.'],
        worked: [['Dart shape', ['One angle is reflex'], 'non-convex'], ['Opposite sides parallel', ['Both pairs'], 'parallelogram'], ['Rhombus definition', ['Parallelogram, all sides equal'], 'a parallelogram with 4 equal sides'], ['Square in the family', ['Rectangle and rhombus'], 'both']] },
      exit: { qs: ['Is a square convex?', 'Name a quadrilateral with exactly one pair of parallel sides.', 'What is the definition of a parallelogram?'] },
      ans: { we: ['non-convex', 'parallelogram', 'rhombus', 'trapezium', 'a parallelogram with all sides equal', 'trapezium'], a: ['convex', 'non-convex', 'convex', 'non-convex', 'convex', 'non-convex'], b: ['rectangle', 'kite', 'square'],
        c: ['2 axes, order 2', '1 axis, none', '4 axes, order 4', '0 axes, order 2', '2 axes, order 2', '1 axis, none'], d: ['parallelogram', 'a parallelogram with a right angle', 'Yes: it is a parallelogram with all sides equal', 'Yes: both pairs of opposite sides are parallel'], ext: ['a kite is separate; yes, a rhombus is a kite', 'rectangle and rhombus'], exit: ['yes', 'trapezium', 'a quadrilateral with both pairs of opposite sides parallel'] },
    }),

    lesson({
      code: '6.09', title: 'Angle sum of a quadrilateral',
      li: ['use the angle sum of a quadrilateral to find unknown angles'],
      sc: ['know the angles in a quadrilateral add to 360°', 'find an unknown angle', 'use right angles and equal angles in special quadrilaterals'],
      terms: ['Angle sum', 'Quadrilateral'],
      we: [{ t: 'Find <i>y</i>.', fig: quad([[0, 22], [34, 22], [28, 0], [6, 2]], ['66°', '109°', '115°', 'y°']) }, { t: 'Find <i>x</i>.', fig: quad([[0, 22], [34, 22], [26, 0], [4, 4]], ['60°', '131°', '88°', 'x°']) },
        { t: 'Find <i>m</i>.', fig: quad([[0, 22], [34, 22], [30, 2], [4, 0]], ['95°', '98°', '141°', 'm°']) }, { t: 'Find <i>y</i>.', fig: quad([[0, 22], [34, 22], [34, 0], [8, 0]], ['121°', '', '', 'y°']) },
        'Why do the angles in a quadrilateral add to 360°?', 'Three angles of a quadrilateral are equal and the fourth is 90°. Find the equal angles.'],
      a: { text: 'Find the value of each variable.', kind: 'work', cols: 3, items: [{ t: '', fig: quad([[0, 22], [34, 22], [28, 0], [6, 2]], ['66°', '109°', '115°', 'y°']) }, { t: '', fig: quad([[0, 22], [34, 22], [26, 0], [4, 4]], ['60°', '131°', '88°', 'x°']) }, { t: '', fig: quad([[0, 22], [34, 22], [30, 2], [4, 0]], ['95°', '98°', '141°', 'm°']) },
        { t: '', fig: quad([[0, 20], [32, 20], [26, 0], [4, 0]], ['70°', '75°', 'a°', '110°']) }, { t: '', fig: quad([[0, 20], [30, 20], [34, 0], [2, 4]], ['85°', 'b°', '80°', '100°']) }, { t: '', fig: quad([[0, 22], [34, 22], [34, 0], [10, 0]], ['c°', '', '', '125°']) }] },
      b: { text: 'Find each variable.', kind: 'work', cols: 3, items: [{ t: '', fig: quad([[0, 22], [34, 22], [34, 0], [8, 0]], ['121°', '', '', 'y°']) }, { t: '', fig: quad([[0, 16], [24, 16], [32, 0], [8, 0]], ['d°', '117°', 'd°', 'e°']) }, { t: '', fig: quad([[12, 0], [22, 8], [12, 28], [2, 8]], ['80°', 'f°', '40°', 'f°']) }] },
      c: { text: 'Find each variable. Give reasons.', kind: 'work', cols: 3, items: [{ t: '', fig: quad([[0, 22], [34, 22], [28, 0], [6, 2]], ['2x°', '90°', '110°', 'x°']) }, { t: '', fig: quad([[0, 20], [32, 20], [26, 0], [4, 0]], ['k°', 'k°', '120°', '120°']) }, { t: '', fig: quad([[0, 11], [15, 0], [30, 11], [15, 22]], ['70°', 'p°', 'q°', 'r°']) },
        { t: '', fig: quad([[0, 22], [34, 22], [26, 0], [4, 4]], ['t°', 't°', 't°', '75°']) }, { t: '', fig: quad([[0, 22], [34, 22], [30, 2], [4, 0]], ['89°', '91°', 'u°', '93°']) }, { t: '', fig: quad([[0, 20], [30, 20], [34, 0], [2, 4]], ['3w°', '2w°', '3w°', '2w°']) }] },
      d: { text: 'Think it through.', kind: 'work', items: ['The angles of a quadrilateral are <i>x</i>°, 2<i>x</i>°, 3<i>x</i>° and 4<i>x</i>°. Find each angle.', 'Can a quadrilateral have 4 obtuse angles? Explain.', 'A parallelogram has one angle of 58°. Find the other three.', 'A kite has angles 120° and 60° between the unequal sides. Find the other two (equal) angles.'] },
      ext: { q: 'Find the angle sum of a pentagon by splitting it into triangles.', steps: ['Draw diagonals from one vertex: 3 triangles', '3 × 180°'], a: '540°', qs: ['Find the angle sum of a hexagon.', 'Find each angle of a regular pentagon.'] },
      summary: { steps: ['Angles in a quadrilateral add to <b>360°</b>.', 'A diagonal makes 2 triangles: 2 × 180°.', 'Add the known angles, subtract from 360°.', 'Use properties: opposite angles in a parallelogram are equal.'],
        worked: [['66°, 109°, 115°, y°', ['360 − 290'], 'y = 70'], ['60°, 131°, 88°, x°', ['360 − 279'], 'x = 81'], ['Two right angles and 121°', ['360 − 90 − 90 − 121'], 'y = 59'], ['Pentagon', ['3 triangles'], '540°']] },
      exit: { qs: ['Three angles are 90°, 90° and 70°. Find the fourth.', 'Three angles are 100°, 85° and 95°. Find the fourth.', 'A parallelogram has an angle of 65°. Find the other angles.'] },
      ans: { we: ['y = 70', 'x = 81', 'm = 26', 'y = 59', 'a diagonal splits it into 2 triangles: 2 × 180°', '90° each'], a: ['y = 70', 'x = 81', 'm = 26', 'a = 105', 'b = 95', 'c = 55'], b: ['y = 59', 'd = 63, e = 117', 'f = 120'],
        c: ['x = 53⅓', 'k = 60', 'p = 110, q = 70, r = 110', 't = 95', 'u = 87', 'w = 36'], d: ['36°, 72°, 108°, 144°', 'No: 4 × more than 90° is more than 360°', '122°, 58°, 122°', '90° each'], ext: ['720°', '108°'], exit: ['110°', '80°', '115°, 65°, 115°'] },
    }),

    lesson({
      code: '6.10', title: 'Properties of quadrilaterals',
      li: ['describe the side, angle and diagonal properties of special quadrilaterals'],
      sc: ['list the properties of a parallelogram', 'describe how the diagonals behave in each special quadrilateral', 'identify a quadrilateral from its properties'],
      terms: ['Diagonal', 'Bisect'],
      we: ['List 2 properties of a parallelogram.', 'EFGH is a parallelogram. Which is NOT true? A ∠EFG = ∠EHG  B EF = HG  C EF = FG  D ∠EFG + ∠FGH = 180°', 'What am I? All my angles are equal.', 'What am I? My diagonals are equal and bisect each other.', 'What am I? My diagonals bisect each other.', 'What am I? My opposite angles are equal.'],
      a: { text: 'True or false?', kind: 'short', items: ['A rectangle has equal diagonals.', 'A rhombus has 4 right angles.', 'The diagonals of a square are perpendicular.', 'A kite has 2 pairs of parallel sides.', 'A parallelogram has opposite sides equal.', 'A trapezium always has equal diagonals.'] },
      b: { text: 'Name all the quadrilaterals that have:', kind: 'short', items: ['4 equal sides', '4 right angles', 'opposite angles equal', 'diagonals perpendicular', 'exactly one pair of parallel sides', 'diagonals that bisect the angles'] },
      c: { text: 'Draw the diagonals and describe them (equal? bisect? perpendicular?).', kind: 'work', cols: 3, items: [{ t: 'Parallelogram', fig: P(Q.para) }, { t: 'Rectangle', fig: P(Q.rect) }, { t: 'Rhombus', fig: P(Q.rhombus) }, { t: 'Square', fig: P(Q.square) }, { t: 'Kite', fig: P(Q.kite) }, { t: 'Trapezium', fig: P(Q.trap) }] },
      d: { text: 'Use properties.', kind: 'work', items: ['ABCD is a parallelogram with AB = 7 cm, BC = 4 cm and ∠A = 65°. Find CD, AD and ∠C.', 'The diagonals of a rhombus are 6 cm and 8 cm. What angle do they meet at?', 'What am I? My diagonals are equal, bisect each other and are perpendicular.', 'What am I? I have one axis of symmetry and diagonals that are perpendicular.'] },
      ext: { q: 'A rhombus has diagonals 10 cm and 24 cm. Find its side length.', steps: ['Diagonals bisect each other at right angles: halves are 5 and 12', 'Side² = 5² + 12² = 169 (Pythagoras, from Stage 5)'], a: '13 cm', qs: ['A rectangle has sides 6 cm and 8 cm. Its diagonals are 10 cm. How far is the centre from each corner?', 'Explain why a square’s diagonals make angles of 45° with its sides.'] },
      summary: { title: 'Diagonals', steps: ['Parallelogram: diagonals <b>bisect</b> each other.', 'Rectangle: diagonals equal and bisect.', 'Rhombus: diagonals bisect at 90° and bisect the angles.', 'Square: all of these. Kite: one diagonal bisects the other at 90°.'],
        worked: [['Parallelogram properties', ['Opposite sides equal', 'Opposite angles equal'], 'any 2'], ['EFGH: which is not true?', ['Adjacent sides need not be equal'], 'C'], ['Diagonals equal and bisect', ['Rectangle family'], 'rectangle, square'], ['Rhombus diagonals 10, 24', ['Halves 5, 12'], '13 cm']] },
      exit: { qs: ['Name a quadrilateral with equal diagonals.', 'State one property of the diagonals of a rhombus.', 'What am I? My opposite sides are equal and all angles are 90°.'] },
      ans: { we: ['e.g. opposite sides equal; opposite angles equal; diagonals bisect each other', 'C', 'rectangle, square', 'rectangle, square', 'parallelogram, rectangle, rhombus, square', 'parallelogram, rectangle, rhombus, square'], a: ['true', 'false', 'true', 'false', 'true', 'false'],
        b: ['rhombus, square', 'rectangle, square', 'parallelogram, rhombus, rectangle, square', 'rhombus, square, kite', 'trapezium', 'rhombus, square'], c: ['bisect each other', 'equal, bisect', 'bisect at 90°', 'equal, bisect at 90°', 'one bisects the other at 90°', 'none of these (equal if isosceles)'],
        d: ['CD = 7 cm, AD = 4 cm, ∠C = 65°', '90°', 'square', 'kite'], ext: ['5 cm', 'the diagonal bisects each 90° angle'], exit: ['rectangle or square', 'they bisect each other at right angles', 'rectangle (or square)'] },
    }),
  ],
};
