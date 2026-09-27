// Worksheet questions for Chapter 2 Angles (lib/worksheet.js). See ../ch01-integers/content.js for the format.
const D = require('../../lib/diagrams');

const cls = (d) => (d < 90 ? 'acute' : d === 90 ? 'right' : d < 180 ? 'obtuse' : d === 180 ? 'straight' : d < 360 ? 'reflex' : 'revolution');
const LET = [...'ABCDEFGHKLMNPQRSTUVWXYZ'];
const three = (pick) => { const s = new Set(); while (s.size < 3) s.add(pick(LET)); return [...s]; };
const i_ = (v) => `<i>${v}</i>`;
// An angle drawn at its true size with 20 mm arms (long enough for a protractor), framed tightly so it prints full size.
const ang = (deg, rot = 0) => {
  const R = 20, rad = (d) => (d * Math.PI) / 180, P = (d, r) => [r * Math.cos(rad(d)), -r * Math.sin(rad(d))];
  const [x1, y1] = P(rot, R), [x2, y2] = P(rot + deg, R);
  const xs = [0, x1, x2], ys = [0, y1, y2];
  for (let d = rot; d <= rot + deg; d += 5) { const [x, y] = P(d, 5); xs.push(x); ys.push(y); }
  const m = 1.5, minX = Math.min(...xs) - m, w = Math.max(...xs) + m - minX, h0 = Math.max(...ys) - Math.min(...ys) + 2 * m, h = Math.max(h0, 14), minY = Math.min(...ys) - m - (h - h0) / 2;
  const [a1, b1] = P(rot, 5), [a2, b2] = P(rot + deg, 5), big = deg > 180 ? 1 : 0;
  return `<svg class="graph" viewBox="0 0 ${w.toFixed(1)} ${h.toFixed(1)}" xmlns="http://www.w3.org/2000/svg"><g transform="translate(${(-minX).toFixed(2)},${(-minY).toFixed(2)})" fill="none" stroke="#3d3b3c" stroke-width="0.45"><path d="M${x1.toFixed(2)},${y1.toFixed(2)} L0,0 L${x2.toFixed(2)},${y2.toFixed(2)}"/><path d="M${a1.toFixed(2)},${b1.toFixed(2)} A5,5 0 ${big} 0 ${a2.toFixed(2)},${b2.toFixed(2)}" stroke="#2f5fd0" stroke-width="0.4"/><circle r="0.6" fill="#3d3b3c"/></g></svg>`;
};
// Two rays from a point with letters: the marked angle is ∠ a b c.
const named = (a, b, c, d1, d2) => D.rays({ rays: [d1, d2], arcs: [{ from: d1, to: d2 }], ends: [a, c], centre: b, w: 34, h: 22, R: 11, cx: 12, cy: 16 });
// A straight line with a ray: the known angle and the pronumeral.
const straight = (g, la, lb) => D.rays({ rays: [0, g, 180], arcs: [{ from: 0, to: g, label: la }, { from: g, to: 180, label: lb, r: 6 }], w: 46, h: 25, cy: 20, R: 17 });
// A right angle split by a ray.
const rightSplit = (g, la, lb) => D.rays({ rays: [0, g, 90], arcs: [{ from: 0, to: g, label: la }, { from: g, to: 90, label: lb, r: 8 }], w: 34, h: 30, cx: 8, cy: 25, R: 21 });
// Two lines crossing: the angle g (between the right-hand rays) is labelled la, the one opposite lb, and the
// angles above and below (180 − g) are labelled lc and ld.
const cross = (g, la, lb, lc = '', ld = '') => { const h = g / 2; return D.rays({ rays: [h, 180 + h, 180 - h, 360 - h], arcs: [{ from: 360 - h, to: 360 + h, label: la }, { from: 180 - h, to: 180 + h, label: lb }, ...(lc ? [{ from: h, to: 180 - h, label: lc, r: 5 }] : []), ...(ld ? [{ from: 180 + h, to: 360 - h, label: ld, r: 5 }] : [])], w: 46, h: 30, R: 14 }); };
// Angles at a point: rays at the given directions, each angle between neighbours labelled.
const atPoint = (angles, labels) => { let d = 0; const dirs = angles.map((a) => { const x = d; d += a; return x; }); return D.rays({ rays: dirs, arcs: dirs.map((x, i) => ({ from: x, to: x + angles[i], label: labels[i], r: 5 + (i % 2) * 2 })), w: 46, h: 34, R: 14 }); };
// Parallel lines cut by a transversal: the given angle at one position, the pronumeral at another.
const POS = { corr: { ur: 'ur', ul: 'ul', ll: 'll', lr: 'lr' }, alt: { ll: 'ur', lr: 'ul' }, co: { ll: 'ul', lr: 'ur' } };
const pll = (kind, g, pick, lab = 'a', extra) => {
  const from = pick(Object.keys(POS[kind])), to = POS[kind][from];
  const top = kind === 'corr' ? pick(['top', 'bottom']) : 'top', other = top === 'top' ? 'bottom' : 'top';
  const tilt = from === 'ur' || from === 'll' ? g : 180 - g;
  const marks = [{ line: top, pos: from, label: `${g}°` }, { line: kind === 'corr' ? other : 'bottom', pos: to, label: lab }];
  if (extra) marks.push(extra(top, from, to, kind === 'corr' ? other : 'bottom'));
  return D.parallel({ tilt, marks, w: 52, h: 38 });
};
const RULE = { corr: 'corresponding angles are equal', alt: 'alternate angles are equal', co: 'co-interior angles add to 180°' };
const NAME = { corr: 'corresponding', alt: 'alternate', co: 'co-interior' };
const other = (kind, g) => (kind === 'co' ? 180 - g : g);

module.exports = {
  '2.01': ({ ri, pick }) => [
    [{ text: 'Which letter is the vertex? It is always the middle letter.', gen: () => { const [a, b, c] = three(pick); return { q: `∠${a}${b}${c}`, a: b }; } },
      { text: 'Name the marked angle with three letters. Put the vertex in the middle.', gen: () => { const [a, b, c] = three(pick), d1 = ri(0, 3) * 15, d2 = d1 + ri(4, 8) * 15; return { q: '', fig: named(a, b, c, d1, d2), a: `∠${a}${b}${c} or ∠${c}${b}${a}` }; } }],
    [{ text: 'Name each angle another way, then write its vertex and its two arms.', gen: () => { const [a, b, c] = three(pick); return { q: `∠${a}${b}${c}`, a: `∠${c}${b}${a}; vertex ${b}; arms ${b}${a}, ${b}${c}`, lines: [`also ∠${c}${b}${a}`, `vertex ${b}, arms ${b}${a} and ${b}${c}`] }; } }],
    [{ text: 'Use the diagram. Name the angles and the arms.', kinds: 2, gen: (i) => {
      const [a, b, c] = three(pick); let d; do d = pick(LET); while ([a, b, c].includes(d));
      if (i % 2 === 0) return { q: `Name the three angles at ${b}.`, fig: D.rays({ rays: [0, 50, 110], ends: [a, c, d], centre: b, w: 36, h: 24, R: 13, cx: 14, cy: 19 }), a: `∠${a}${b}${c}, ∠${c}${b}${d}, ∠${a}${b}${d}`, lines: [`small angles: ∠${a}${b}${c}, ∠${c}${b}${d}`, `whole angle: ∠${a}${b}${d}`] };
      return { q: `∠${a}${b}${c} and ∠${c}${b}${d} are next to each other. Name the vertex and the arm they share.`, a: `vertex ${b}, common arm ${b}${c}`, lines: [`vertex: ${b} (middle letter of both)`, `common arm: ${b}${c}`] };
    } }],
  ],
  '2.02': ({ ri, pick }) => [
    [{ text: 'Measure each angle with your protractor. Line up the base line on one arm.', gen: () => { const d = ri(3, 33) * 5; return { q: '', fig: ang(d, pick([0, 0, 20, 40])), fh: 20, a: `${d}°` }; } },
      { text: 'To draw a reflex angle, draw 360° − the angle. Write the angle you draw.', gen: () => { const d = ri(37, 71) * 5; return { q: `${d}°`, a: `${360 - d}°` }; } }],
    [{ text: 'Estimate the angle first, then measure it with your protractor.', gen: () => { const d = ri(3, 33) * 5 + ri(0, 4); return { q: 'Estimate, then measure.', fig: ang(d, pick([0, 30])), fh: 20, a: `${d}°`, lines: [`estimate: about ${Math.round(d / 10) * 10}°`, `measure: ${d}°`] }; } }],
    [{ text: 'Plan each drawing in steps. Then draw it on the back of the sheet.', kinds: 2, gen: (i) => {
      const d = ri(37, 70) * 5, e = ri(4, 16) * 5;
      if (i % 2 === 0) return { q: `How do you draw a reflex angle of ${d}°?`, a: `draw ${360 - d}°, mark the outside angle`, lines: [`360° − ${d}° = ${360 - d}°`, `draw ${360 - d}°, then mark the reflex angle outside it`] };
      return { q: `An angle is ${e}° less than a revolution. Find its size and classify it.`, a: `${360 - e}°, reflex`, lines: [`360° − ${e}° = ${360 - e}°`, `${360 - e}° is reflex`] };
    } }],
  ],
  '2.03': ({ ri, pick }) => [
    [{ text: 'Classify each angle: acute, right, obtuse, straight, reflex or revolution.', gen: () => { const d = pick([ri(1, 72) * 5, 90, 180, 360]); return { q: `${d}°`, a: cls(d) }; } },
      { text: 'Classify the angle drawn.', gen: () => { const d = pick([ri(2, 34) * 5, 90, ri(38, 70) * 5]); return { q: '', fig: ang(d, pick([0, 20])), fh: 20, a: cls(d) }; } }],
    [{ text: 'Add the two angles, then classify the total.', gen: () => { const a = ri(2, 40) * 5, b = ri(2, 40) * 5; return a + b > 360 ? { q: '' } : { q: `${a}° + ${b}°`, a: `${a + b}°, ${cls(a + b)}`, lines: [`${a}° + ${b}° = ${a + b}°`, `${a + b}° is ${cls(a + b)}`] }; } }],
    [{ text: 'Work out the size of each angle, then classify it.', kinds: 3, gen: (i) => {
      const h = ri(1, 11), x = ri(2, 17) * 5;
      return [
        { q: `The angle between the hands of a clock at ${h}:00.`, a: `${Math.min(h, 12 - h) * 30}°, ${cls(Math.min(h, 12 - h) * 30)}`, lines: ['each hour mark: 360° ÷ 12 = 30°', `${Math.min(h, 12 - h)} × 30° = ${Math.min(h, 12 - h) * 30}°`, `${cls(Math.min(h, 12 - h) * 30)}`] },
        { q: `A right angle plus ${x}°.`, a: `${90 + x}°, ${cls(90 + x)}`, lines: [`90° + ${x}° = ${90 + x}°`, `${cls(90 + x)}`] },
        { q: `A straight angle plus ${x}°.`, a: `${180 + x}°, ${cls(180 + x)}`, lines: [`180° + ${x}° = ${180 + x}°`, `${cls(180 + x)}`] },
      ][i % 3];
    } }],
  ],
  '2.04': ({ ri, pick }) => [
    [{ text: 'Find the complement. Complementary angles add to 90°.', gen: () => { const d = ri(1, 89); return { q: `${d}°`, a: `${90 - d}°` }; } },
      { text: 'Find the supplement. Supplementary angles add to 180°.', gen: () => { const d = ri(1, 179); return { q: `${d}°`, a: `${180 - d}°` }; } }],
    [{ text: 'Write an equation, then find the value of the pronumeral.', kinds: 2, gen: (i) => {
      const v = pick(['x', 'y', 'm', 'p']);
      if (i % 2 === 0) { const a = ri(10, 80); return { q: `${i_(v)}° and ${a}° are complementary.`, a: `${v} = ${90 - a}`, lines: [`${v} + ${a} = 90`, `${v} = 90 − ${a} = ${90 - a}`] }; }
      const a = ri(10, 170); return { q: `${i_(v)}° and ${a}° are supplementary.`, a: `${v} = ${180 - a}`, lines: [`${v} + ${a} = 180`, `${v} = 180 − ${a} = ${180 - a}`] };
    } }],
    [{ text: 'Write an equation from the diagram, then solve it.', kinds: 2, gen: (i) => {
      if (i % 2 === 0) { const x = ri(8, 25) * 2, g = 180 - 3 * x; return g <= 10 ? { q: '' } : { q: 'Find x.', fig: straight(g, `${g}°`, '3x°'), fh: 20, a: `x = ${x}`, lines: [`3x + ${g} = 180`, `3x = ${180 - g}`, `x = ${x}`] }; }
      const x = ri(10, 30), k = ri(1, 4) * 5; return 2 * x + k >= 90 ? { q: '' } : { q: 'Find x.', fig: rightSplit(x, 'x°', `(x + ${k})°`), fh: 22, a: `x = ${x}`, lines: [`x + x + ${k} = 90`, `2x = ${90 - k}`, `x = ${x}`] };
    } }],
  ],
  '2.05': ({ ri, pick }) => [
    [{ text: 'Angles on a straight line add to 180°. Find a.', gen: () => { const g = ri(5, 31) * 5; return { q: '', fig: straight(g, `${g}°`, 'a'), fh: 17, a: `a = ${180 - g}` }; } },
      { text: 'Vertically opposite angles are equal. Find b.', gen: () => { const g = ri(8, 28) * 5; return { q: '', fig: cross(g, `${g}°`, 'b'), fh: 19, a: `b = ${g}` }; } }],
    [{ text: 'Angles at a point add to 360°. Write an equation, then find a.', gen: () => { const b = ri(8, 26) * 5, c = ri(8, 26) * 5, a = 360 - b - c; return a < 40 ? { q: '' } : { q: 'Find a.', fig: atPoint([b, c, a], [`${b}°`, `${c}°`, 'a']), fh: 22, a: `a = ${a}`, lines: [`a + ${b} + ${c} = 360`, `a = 360 − ${b + c} = ${a}`] }; } }],
    [{ text: 'Find each pronumeral. Give a reason for each one.', gen: () => {
      const g = ri(8, 28) * 5;
      return { q: 'Find a, b and c.', fig: cross(g, `${g}°`, 'b', 'a', 'c'), fh: 22, a: `a = ${180 - g}, b = ${g}, c = ${180 - g}`, lines: [`b = ${g} (vertically opposite)`, `a = 180 − ${g} = ${180 - g} (straight line)`, `c = ${180 - g} (vertically opposite a)`] };
    } }],
  ],
  '2.06': ({ list, pick }) => [
    [{ text: 'Write the statement with a symbol: ∥ means parallel, ⊥ means perpendicular.', gen: () => { const [a, b, c, d] = pick([['A', 'B', 'C', 'D'], ['P', 'Q', 'R', 'S'], ['E', 'F', 'G', 'H'], ['K', 'L', 'M', 'N'], ['T', 'U', 'V', 'W'], ['X', 'Y', 'Z', 'W']]); return pick([0, 1]) ? { q: `${a}${b} is parallel to ${c}${d}`, a: `${a}${b} ∥ ${c}${d}` } : { q: `${a}${b} is perpendicular to ${c}${d}`, a: `${a}${b} ⊥ ${c}${d}` }; } },
      { text: 'Are the lines in each object parallel (∥), perpendicular (⊥) or neither?', gen: (i) => { const L = [['train tracks', '∥'], ['the letter T', '⊥'], ['the letter X', 'neither'], ['an equals sign', '∥'], ['a plus sign', '⊥'], ['the letter V', 'neither'], ['the letter H (sides)', '∥'], ['the letter L', '⊥'], ['a wall and floor', '⊥'], ['lines on ruled paper', '∥'], ['the letter K', 'neither'], ['the edges of a ruler', '∥'], ['the letter Z (top and bottom)', '∥'], ['a clock at 3:00', '⊥']]; const x = L[i % L.length]; return { q: x[0], a: x[1] }; } }],
    [{ text: 'Use the shape. Name the pairs of parallel sides, then the pairs of perpendicular sides (write none if there are none).', gen: (i) => {
      const [a, b, c, d] = pick([['A', 'B', 'C', 'D'], ['P', 'Q', 'R', 'S'], ['E', 'F', 'G', 'H'], ['K', 'L', 'M', 'N'], ['W', 'X', 'Y', 'Z'], ['T', 'U', 'V', 'W']]);
      const S = [
        ['rectangle', [[4, 4], [40, 4], [40, 20], [4, 20]], [0, 1, 2, 3], `${a}${b} ∥ ${d}${c}, ${a}${d} ∥ ${b}${c}`, `${a}${b} ⊥ ${b}${c} (every corner)`],
        ['parallelogram', [[10, 4], [44, 4], [36, 20], [2, 20]], [], `${a}${b} ∥ ${d}${c}, ${a}${d} ∥ ${b}${c}`, 'none'],
        ['right trapezium', [[4, 4], [30, 4], [42, 20], [4, 20]], [0, 3], `${a}${b} ∥ ${d}${c}`, `${a}${d} ⊥ ${a}${b}, ${a}${d} ⊥ ${d}${c}`],
        ['square', [[12, 2], [32, 2], [32, 22], [12, 22]], [0, 1, 2, 3], `${a}${b} ∥ ${d}${c}, ${a}${d} ∥ ${b}${c}`, `${a}${b} ⊥ ${b}${c} (every corner)`],
        ['trapezium', [[12, 4], [32, 4], [42, 20], [2, 20]], [], `${a}${b} ∥ ${d}${c}`, 'none'],
      ][i % 5];
      return { q: `${S[0][0].toUpperCase() + S[0].slice(1)} ${a}${b}${c}${d}`, fig: D.polygon({ pts: S[1].map(([x, y]) => [x + 5, y + 3]), vlabels: [a, b, c, d], right: S[2], w: 56, h: 30 }), a: `${S[3]}; ⊥: ${S[4]}`, lines: [`∥: ${S[3]}`, `⊥: ${S[4]}`] };
    } }],
    [{ text: 'Write the steps for each construction. Use a ruler and compasses, then draw it on the back of the sheet.', kinds: 3, gen: (i) => {
      const [a, b] = pick([['A', 'B'], ['C', 'D'], ['P', 'Q'], ['M', 'N'], ['X', 'Y'], ['E', 'F'], ['K', 'L']]), p = pick(['T', 'R', 'S', 'U', 'V', 'W', 'G', 'H']);
      if (p === a || p === b) return { q: '' };
      return [
        { q: `Construct a line perpendicular to ${a}${b} through the point ${p} on ${a}${b}.`, a: `arcs on ${a}${b} either side of ${p}; equal arcs from them cross; rule from ${p} through the crossing`, lines: [`compasses at ${p}: mark two points on ${a}${b}`, 'from each point: equal arcs that cross', `rule from ${p} through the crossing`] },
        { q: `Construct a line parallel to ${a}${b} through the point ${p} (not on ${a}${b}).`, a: `rule a transversal through ${p}; copy its angle with ${a}${b} at ${p}; rule the new arm`, lines: [`rule a line through ${p} that cuts ${a}${b}`, `copy the angle at ${p} (corresponding)`, `rule the new arm: it is ∥ to ${a}${b}`] },
        { q: `Construct the perpendicular bisector of the interval ${a}${b}.`, a: `equal arcs from ${a} and ${b} above and below; rule through the two crossings`, lines: [`compasses more than half of ${a}${b}`, `arcs from ${a} and from ${b}, above and below`, 'rule through the two crossings'] },
      ][i % 3];
    } }],
  ],
  '2.07': ({ ri, pick }) => [
    [{ text: 'The lines are parallel. Corresponding angles are equal. Write the corresponding angle.', gen: () => { const d = ri(20, 160); return { q: `corresponding to ${d}°`, a: `${d}°` }; } },
      { text: 'The lines are parallel. Find a. (Look for the F shape.)', gen: () => { const g = ri(5, 31) * 5; return { q: '', fig: pll('corr', g, pick), fh: 22, a: `a = ${g}` }; } }],
    [{ text: 'Find a and give the reason. Then find b, the angle next to a on the line.', gen: () => { const g = ri(5, 31) * 5; return { q: `a is corresponding to ${g}°.`, a: `a = ${g}, b = ${180 - g}`, lines: [`a = ${g} (corresponding angles, parallel lines)`, `b = 180 − ${g} = ${180 - g} (straight line)`] }; } }],
    [{ text: 'Corresponding angles are equal. Write an equation, then solve it.', gen: () => { const x = ri(5, 35), m = ri(2, 4), c = ri(1, 6) * 5; const g = m * x + c; return g >= 175 ? { q: '' } : { q: `Corresponding angles are (${m}${i_('x')} + ${c})° and ${g}°. Find x.`, a: `x = ${x}`, lines: [`${m}x + ${c} = ${g}`, `${m}x = ${g - c}`, `x = ${x}`] }; } }],
  ],
  '2.08': ({ ri, pick }) => [
    [{ text: 'The lines are parallel. Alternate angles are equal. Write the alternate angle.', gen: () => { const d = ri(20, 160); return { q: `alternate to ${d}°`, a: `${d}°` }; } },
      { text: 'The lines are parallel. Find a. (Look for the Z shape.)', gen: () => { const g = ri(5, 31) * 5; return { q: '', fig: pll('alt', g, pick), fh: 22, a: `a = ${g}` }; } }],
    [{ text: 'Find a and give the reason. Then find b, the angle next to a on the line.', gen: () => { const g = ri(5, 31) * 5; return { q: `a is alternate to ${g}°.`, a: `a = ${g}, b = ${180 - g}`, lines: [`a = ${g} (alternate angles, parallel lines)`, `b = 180 − ${g} = ${180 - g} (straight line)`] }; } }],
    [{ text: 'Alternate angles are equal. Write an equation, then solve it.', gen: () => { const x = ri(5, 35), m = ri(2, 4), c = ri(1, 6) * 5; const g = m * x - c; return g <= 10 || g >= 175 ? { q: '' } : { q: `Alternate angles are (${m}${i_('x')} − ${c})° and ${g}°. Find x.`, a: `x = ${x}`, lines: [`${m}x − ${c} = ${g}`, `${m}x = ${g + c}`, `x = ${x}`] }; } }],
  ],
  '2.09': ({ ri, pick }) => [
    [{ text: 'The lines are parallel. Co-interior angles add to 180°. Write the co-interior angle.', gen: () => { const d = ri(20, 160); return { q: `co-interior to ${d}°`, a: `${180 - d}°` }; } },
      { text: 'The lines are parallel. Find a. (Look for the C shape.)', gen: () => { const g = ri(5, 31) * 5; return { q: '', fig: pll('co', g, pick), fh: 22, a: `a = ${180 - g}` }; } }],
    [{ text: 'Write an equation, then find a. Give the reason.', gen: () => { const g = ri(20, 160); return { q: `a is co-interior to ${g}°.`, a: `a = ${180 - g}`, lines: [`a + ${g} = 180 (co-interior angles)`, `a = 180 − ${g} = ${180 - g}`] }; } }],
    [{ text: 'Co-interior angles add to 180°. Write an equation, then solve it.', gen: () => { const y = ri(10, 50), m = pick([2, 3, 4]); return (m + 1) * y !== 180 && 180 % (m + 1) !== 0 ? { q: '' } : ((yy) => ({ q: `Co-interior angles are ${i_('y')}° and ${m}${i_('y')}°. Find y and both angles.`, a: `y = ${yy}; ${yy}° and ${m * yy}°`, lines: [`y + ${m}y = 180`, `${m + 1}y = 180, so y = ${yy}`, `angles: ${yy}° and ${m * yy}°`] }))(180 / (m + 1)); } }],
  ],
  '2.10': ({ ri, pick }) => [
    [{ text: 'Which rule? Write corresponding, alternate or co-interior.', gen: (i) => { const L = [['F shape', 'corresponding'], ['Z shape', 'alternate'], ['C shape', 'co-interior'], ['same position at each crossing', 'corresponding'], ['between the lines, opposite sides', 'alternate'], ['between the lines, same side', 'co-interior'], ['the angles add to 180°', 'co-interior'], ['backwards Z (N shape)', 'alternate'], ['upside-down F', 'corresponding']]; const x = L[i % L.length]; return { q: x[0], a: x[1] }; } },
      { text: 'The lines are parallel. Find a.', gen: (i) => { const k = ['corr', 'alt', 'co'][i % 3], g = ri(5, 31) * 5; return { q: '', fig: pll(k, g, pick), fh: 22, a: `a = ${other(k, g)}` }; } }],
    [{ text: 'The lines are parallel. Find a, then write the rule you used.', kinds: 3, gen: (i) => { const k = ['corr', 'alt', 'co'][i % 3], g = ri(5, 31) * 5; return { q: 'Find a.', fig: pll(k, g, pick), fh: 22, a: `a = ${other(k, g)} (${NAME[k]})`, lines: [k === 'co' ? `a = 180 − ${g} = ${180 - g}` : `a = ${g}`, `${RULE[k]}`] }; } }],
    [{ text: 'Find each pronumeral in two steps. Give a reason for each step.', gen: () => {
      const g = ri(8, 28) * 5;
      return { q: 'Find y, then x.', fig: D.parallel({ tilt: g, marks: [{ line: 'top', pos: 'ur', label: `${g}°` }, { line: 'top', pos: 'ul', label: 'y' }, { line: 'bottom', pos: 'ul', label: 'x' }], w: 52, h: 38 }), fh: 22, a: `y = ${180 - g}, x = ${180 - g}`, lines: [`y = 180 − ${g} = ${180 - g} (straight line)`, `x = ${180 - g} (corresponding to y)`] };
    } }],
  ],
  '2.11': ({ ri, pick }) => [
    [{ text: 'Is AB ∥ CD? Write yes or no. Equal corresponding or alternate angles, or co-interior angles adding to 180°, mean yes.', gen: () => { const k = pick(['corresponding', 'alternate', 'co-interior']), a = ri(6, 30) * 5, b = k === 'co-interior' ? pick([180 - a, 180 - a, a + 5]) : pick([a, a, a + 5, 180 - a]); return a === 90 ? { q: '' } : { q: `${k}: ${a}° and ${b}°`, a: (k === 'co-interior' ? a + b === 180 : a === b) ? 'yes' : 'no' }; } }],
    [{ text: 'Is AB ∥ CD? Check the angle pair, then give the reason.', kinds: 3, gen: (i) => {
      const k = ['corresponding', 'alternate', 'co-interior'][i % 3], a = ri(6, 30) * 5, ok = ri(0, 2) > 0;
      const b = k === 'co-interior' ? (ok ? 180 - a : 185 - a) : ok ? a : a + 5;
      return a === 90 || b === a && k === 'co-interior' ? { q: '' } : { q: `${k[0].toUpperCase() + k.slice(1)} angles: ${a}° and ${b}°`, a: ok ? 'yes' : 'no', lines: [k === 'co-interior' ? `${a} + ${b} = ${a + b}` : `${a} ${a === b ? '=' : '≠'} ${b}`, ok ? `yes: ${k} angles ${k === 'co-interior' ? 'add to 180°' : 'are equal'}` : `no: ${k === 'co-interior' ? 'they do not add to 180°' : 'they are not equal'}`] };
    } }],
    [{ text: 'Find the value of x that makes AB ∥ CD. Show the equation.', kinds: 2, gen: (i) => {
      const x = ri(6, 30);
      if (i % 2 === 0) { const g = 3 * x + 10; return g >= 175 ? { q: '' } : { q: `Alternate angles are (3${i_('x')} + 10)° and ${g}°.`, a: `x = ${x}`, lines: [`3x + 10 = ${g}`, `3x = ${g - 10}`, `x = ${x}`] }; }
      const g = 180 - 2 * x; return g <= 10 ? { q: '' } : { q: `Co-interior angles are 2${i_('x')}° and ${g}°.`, a: `x = ${x}`, lines: [`2x + ${g} = 180`, `2x = ${180 - g}`, `x = ${x}`] };
    } }],
  ],
};
