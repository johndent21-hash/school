// Skill drill pages for Chapter 2 Angles: page 1 practises the Easy basics, page 2 the Medium basics (lib/drill.js).
const D = require('../../lib/diagrams');

const cls = (d) => (d < 90 ? 'acute' : d === 90 ? 'right' : d < 180 ? 'obtuse' : d === 180 ? 'straight' : d < 360 ? 'reflex' : 'revolution');
const letters = 'ABCDEFGHKLMNPQRSTUVWXYZ';
const three = (pick) => { const s = new Set(); while (s.size < 3) s.add(pick([...letters])); return [...s]; };
const ang = (deg, o = {}) => D.angle({ deg, labels: ['', '', ''], w: 30, h: 20, ...o });
// Two parallel lines and a transversal: the given angle at one position, a at another.
const POS = { corr: { ur: 'ur', ul: 'ul', ll: 'll', lr: 'lr' }, alt: { ll: 'ur', lr: 'ul' }, co: { ll: 'ul', lr: 'ur' } };
const pll = (kind, g, ri, pick) => {
  const from = pick(Object.keys(POS[kind])), to = POS[kind][from];
  const top = kind === 'corr' ? pick(['top', 'bottom']) : 'top';
  const tilt = from === 'ur' || from === 'll' ? g : 180 - g; // draw the given angle at its true size
  const other = top === 'top' ? 'bottom' : 'top';
  return D.parallel({ tilt, marks: [{ line: top, pos: from, label: `${g}°` }, { line: kind === 'corr' ? other : 'bottom', pos: to, label: 'a' }], w: 50, h: 38 });
};

module.exports = {
  '2.01': ({ round, list, pick, ri }) => ({
    easy: [
      round('which letter is the vertex of each angle?', 20, () => { const [a, b, c] = three(pick); return [`∠${a}${b}${c}`, b]; }),
      round('name the marked angle with three letters (vertex in the middle).', 9, () => {
        const [a, b, c] = three(pick), d1 = ri(0, 3) * 20, d2 = d1 + ri(3, 6) * 20;
        return [{ t: '', fig: D.rays({ rays: [d1, d2], arcs: [{ from: d1, to: d2 }], ends: [a, c], centre: b, w: 44, h: 26, R: 11, cx: 22, cy: 19 }) }, `∠${a}${b}${c} or ∠${c}${b}${a}`];
      }, { cols: 3 }),
    ],
    medium: [
      round('write the two arms of each angle.', 20, () => { const [a, b, c] = three(pick); return [`∠${a}${b}${c}`, `${b}${a} and ${b}${c}`]; }),
      list('true or false?', [['∠ABC and ∠CBA are the same angle.', 'true'], ['The vertex is the first letter.', 'false'], ['An angle has two arms.', 'true'], ['∠XYZ has its vertex at Y.', 'true'],
        ['∠PQR and ∠PRQ are the same angle.', 'false'], ['The arms of ∠LMN are ML and MN.', 'true'], ['∠DEF has its vertex at D.', 'false'], ['A ray starts at a point and goes on forever.', 'true'],
        ['∠KLM and ∠MLK are the same angle.', 'true'], ['∠STU has arms TS and TU.', 'true'], ['The size of an angle depends on the length of its arms.', 'false'], ['Two angles can share an arm.', 'true']], { cols: 2 }),
    ],
  }),
  '2.02': ({ round, ri }) => ({
    easy: [
      round('measure each angle with your protractor.', 12, () => { const d = ri(2, 34) * 5; return [{ t: '', fig: ang(d, { rot: ri(0, 2) * 15 }) }, `${d}°`]; }, { cols: 3 }),
      round('reflex angles: write the angle you draw with the protractor (360° − the angle).', 16, () => { const d = ri(37, 71) * 5; return [`${d}°`, `${360 - d}°`]; }),
    ],
    medium: [
      round('estimate first, then measure. Write your measurement.', 12, () => { const d = ri(2, 34) * 5 + pick2(ri); return [{ t: '', fig: ang(d, { rot: ri(0, 3) * 20 }) }, `${d}°`]; }, { cols: 3 }),
      round('draw each angle in your book, then label its type here.', 16, () => { const d = ri(1, 70) * 5; return [`${d}°`, cls(d)]; }),
    ],
  }),
  '2.03': ({ round, ri, list }) => ({
    easy: [
      round('classify each angle: acute, right, obtuse, straight, reflex or revolution.', 20, () => { const d = ri(1, 72) * 5; return [`${d}°`, cls(d)]; }),
      round('classify the angle.', 9, () => { const d = ri(2, 34) * 5; return [{ t: '', fig: ang(d, { rot: ri(0, 3) * 20 }) }, cls(d)]; }, { cols: 3 }),
    ],
    medium: [
      round('add the two angles, then classify the total.', 16, () => { const a = ri(2, 40) * 5, b = ri(2, 40) * 5; return a + b > 360 ? ['', ''] : [`${a}° + ${b}°`, `${a + b}°, ${cls(a + b)}`]; }),
      list('true or false?', [['An acute angle is less than 90°.', 'true'], ['A right angle is exactly 90°.', 'true'], ['180° is a reflex angle.', 'false'], ['Every obtuse angle is less than 180°.', 'true'],
        ['A revolution is 360°.', 'true'], ['91° is acute.', 'false'], ['A reflex angle is between 180° and 360°.', 'true'], ['Two right angles make a straight angle.', 'true'], ['Two acute angles always make an obtuse angle.', 'false'],
        ['Half a revolution is a straight angle.', 'true'], ['359° is reflex.', 'true'], ['An obtuse angle and a right angle can add to 200°.', 'true']], { cols: 2 }),
    ],
  }),
  '2.04': ({ round, ri }) => ({
    easy: [
      round('find the complement (they add to 90°).', 20, () => { const d = ri(1, 89); return [`${d}°`, `${90 - d}°`]; }),
      round('find the supplement (they add to 180°).', 20, () => { const d = ri(1, 179); return [`${d}°`, `${180 - d}°`]; }),
    ],
    medium: [
      round('are the two angles complementary (C), supplementary (S) or neither (N)?', 20, () => { const a = ri(5, 170); const k = ri(0, 2); const b = k === 0 && a < 90 ? 90 - a : k === 1 ? 180 - a : ri(5, 170); return [`${a}° and ${b}°`, a + b === 90 ? 'C' : a + b === 180 ? 'S' : 'N']; }),
      round('find the value of the pronumeral.', 15, () => { const k = ri(0, 1), a = k ? ri(10, 170) : ri(10, 80), x = ['x', 'y', 'm', 'p', 'k'][ri(0, 4)]; return [`${a}° and ${x}° are ${k ? 'supplementary' : 'complementary'}`, `${x} = ${(k ? 180 : 90) - a}`]; }, { cols: 3 }),
    ],
  }),
  '2.05': ({ round, ri }) => ({
    easy: [
      round('angles on a straight line add to 180°. Find a.', 20, () => { const b = ri(10, 170); return [`${b}° and a°`, `a = ${180 - b}`]; }),
      round('angles at a point add to 360°. Find a.', 16, () => { const b = ri(40, 170), c = ri(40, 170); return b + c >= 350 ? ['', ''] : [`${b}°, ${c}° and a°`, `a = ${360 - b - c}`]; }),
    ],
    medium: [
      round('two lines cross. One angle is given. Find the vertically opposite angle (v) and the angle next to it (n).', 12, () => { const b = ri(15, 165); return [`${b}°`, `v = ${b}°, n = ${180 - b}°`]; }, { cols: 3 }),
      round('find the pronumeral.', 9, () => {
        const b = ri(25, 150);
        return [{ t: '', fig: D.rays({ rays: [0, b, 180], arcs: [{ from: 0, to: b, label: `${b}°` }, { from: b, to: 180, label: 'a', r: 6 }], w: 44, h: 24, cy: 19, R: 16 }) }, `a = ${180 - b}`];
      }, { cols: 3 }),
      round('three angles on a straight line. Find a.', 8, () => { const b = ri(20, 80), c = ri(20, 80); return [`${b}°, ${c}° and a°`, `a = ${180 - b - c}`]; }),
    ],
  }),
  '2.06': ({ list }) => ({
    easy: [
      list('write the symbol for each statement: ∥ (parallel) or ⊥ (perpendicular).', [['AB is parallel to CD', 'AB ∥ CD'], ['PQ is perpendicular to RS', 'PQ ⊥ RS'], ['XY is parallel to ZW', 'XY ∥ ZW'], ['EF meets GH at 90°', 'EF ⊥ GH'],
        ['KL never meets MN', 'KL ∥ MN'], ['TU is at right angles to VW', 'TU ⊥ VW'], ['the rails of a train track', '∥'], ['a wall and the floor', '⊥'], ['the lines on ruled paper', '∥'], ['the hands of a clock at 3:00', '⊥'],
        ['opposite edges of a ruler', '∥'], ['the top and a side of a door', '⊥']], { cols: 2 }),
      list('parallel (P), perpendicular (⊥) or neither (N)?', [['the sides of a ladder', 'P'], ['a letter T', '⊥'], ['a letter X', 'N'], ['a letter H (the two sides)', 'P'], ['a letter L', '⊥'], ['a letter V', 'N'],
        ['the edges of a book (top and side)', '⊥'], ['a plus sign', '⊥'], ['an equals sign', 'P'], ['the lanes of a pool', 'P'], ['a letter Z (top and bottom)', 'P'], ['a letter K', 'N']], { cols: 3 }),
    ],
    medium: [
      list('true or false?', [['Parallel lines are the same distance apart everywhere.', 'true'], ['Perpendicular lines meet at 45°.', 'false'], ['Two lines perpendicular to the same line are parallel.', 'true'],
        ['Parallel lines can cross.', 'false'], ['A square has two pairs of parallel sides.', 'true'], ['A triangle can have two parallel sides.', 'false'], ['The symbol ⊥ means perpendicular.', 'true'],
        ['Arrows on lines show they are parallel.', 'true'], ['A rectangle has 4 pairs of perpendicular sides.', 'true'], ['Lines that meet at 89° are perpendicular.', 'false'], ['A transversal crosses two or more lines.', 'true'],
        ['Vertical and horizontal lines are perpendicular.', 'true']], { cols: 2 }),
      list('construction steps: what do you use for each step? Write ruler, compasses or both.', [['draw a line segment', 'ruler'], ['draw arcs from each end of a segment', 'compasses'], ['join the two points where the arcs cross', 'ruler'],
        ['mark equal distances along a line', 'compasses'], ['measure a length', 'ruler'], ['draw a circle', 'compasses'], ['bisect a line segment', 'both'], ['construct a perpendicular from a point', 'both'],
        ['copy an angle', 'both'], ['construct a parallel line', 'both']], { cols: 2 }),
    ],
  }),
  '2.07': ({ round, ri, pick }) => ({
    easy: [
      round('the lines are parallel. Corresponding angles are equal. Find the corresponding angle.', 16, () => { const d = ri(20, 160); return [`${d}°`, `${d}°`]; }),
      round('the lines are parallel. Find a.', 12, () => { const g = ri(5, 31) * 5; return [{ t: '', fig: pll('corr', g, ri, pick) }, `a = ${g}`]; }, { cols: 3 }),
    ],
    medium: [
      round('the lines are parallel. Find a, then the angle next to it on the line (b).', 12, () => { const g = ri(5, 31) * 5; return [`corresponding to ${g}°`, `a = ${g}, b = ${180 - g}`]; }, { cols: 3 }),
      round('corresponding angles are equal. Find x.', 16, () => { const x = ri(5, 40), m = ri(2, 4), c = ri(0, 30); return m * x + c >= 175 ? ['', ''] : [`${m}x${c ? ` + ${c}` : ''} = ${m * x + c}`, `x = ${x}`]; }),
      round('are these corresponding angles on parallel lines? Write yes or no.', 8, () => { const a = ri(30, 150), b = pick([a, a, 180 - a, a + ri(3, 9)]); return a === 90 ? ['', ''] : [`${a}° and ${b}°`, a === b ? 'yes' : 'no']; }),
    ],
  }),
  '2.08': ({ round, ri, pick }) => ({
    easy: [
      round('the lines are parallel. Alternate angles are equal. Find the alternate angle.', 16, () => { const d = ri(20, 160); return [`${d}°`, `${d}°`]; }),
      round('the lines are parallel. Find a.', 12, () => { const g = ri(5, 31) * 5; return [{ t: '', fig: pll('alt', g, ri, pick) }, `a = ${g}`]; }, { cols: 3 }),
    ],
    medium: [
      round('the lines are parallel. Find the alternate angle (a) and the co-interior angle (c).', 15, () => { const g = ri(10, 170); return [`${g}°`, `a = ${g}°, c = ${180 - g}°`]; }, { cols: 3 }),
      round('alternate angles are equal. Find x.', 16, () => { const x = ri(5, 40), m = ri(2, 4), c = ri(0, 30); return m * x + c >= 175 ? ['', ''] : [`${m}x${c ? ` + ${c}` : ''} = ${m * x + c}`, `x = ${x}`]; }),
    ],
  }),
  '2.09': ({ round, ri, pick }) => ({
    easy: [
      round('the lines are parallel. Co-interior angles add to 180°. Find the co-interior angle.', 16, () => { const d = ri(20, 160); return [`${d}°`, `${180 - d}°`]; }),
      round('the lines are parallel. Find a.', 12, () => { const g = ri(5, 31) * 5; return [{ t: '', fig: pll('co', g, ri, pick) }, `a = ${180 - g}`]; }, { cols: 3 }),
    ],
    medium: [
      round('co-interior angles on parallel lines. Find y.', 16, () => { const y = ri(5, 60), g = 180 - 2 * y; return g <= 0 ? ['', ''] : [`y° + y° + ${g}° = 180°`, `y = ${y}`]; }, { cols: 3 }),
      round('are the lines parallel? The co-interior angles are given. Write yes or no.', 16, () => { const a = ri(30, 150), b = pick([180 - a, 180 - a, 180 - a + ri(2, 8), 180 - a - ri(2, 8)]); return [`${a}° and ${b}°`, a + b === 180 ? 'yes' : 'no']; }),
    ],
  }),
  '2.10': ({ round, ri, pick, list }) => ({
    easy: [
      list('which rule? Write corresponding, alternate or co-interior.', [['F shape', 'corresponding'], ['Z shape', 'alternate'], ['C (or U) shape', 'co-interior'], ['same position at each crossing', 'corresponding'],
        ['between the lines, on opposite sides of the transversal', 'alternate'], ['between the lines, on the same side of the transversal', 'co-interior'], ['the angles are equal (Z)', 'alternate'], ['the angles add to 180°', 'co-interior'],
        ['backwards F shape', 'corresponding'], ['backwards Z (an N shape)', 'alternate'], ['upside-down F shape', 'corresponding'], ['a C shape facing left', 'co-interior']], { cols: 2 }),
      round('the lines are parallel. Find a.', 9, () => { const k = pick(['corr', 'alt', 'co']), g = ri(5, 31) * 5; return [{ t: '', fig: pll(k, g, ri, pick) }, `a = ${k === 'co' ? 180 - g : g}`]; }, { cols: 3 }),
    ],
    medium: [
      round('the lines are parallel. Find a and give the rule.', 12, () => { const k = pick(['corr', 'alt', 'co']), g = ri(5, 31) * 5; return [{ t: '', fig: pll(k, g, ri, pick) }, `a = ${k === 'co' ? 180 - g : g} (${{ corr: 'corresponding', alt: 'alternate', co: 'co-interior' }[k]})`]; }, { cols: 3 }),
      round('the lines are parallel. One angle is given. Find the other three angles at the same crossing.', 12, () => { const g = ri(15, 165); return g === 90 ? ['', ''] : [`${g}°`, `${g}°, ${180 - g}°, ${180 - g}°`]; }, { cols: 3 }),
    ],
  }),
  '2.11': ({ round, ri, pick }) => ({
    easy: [
      round('is AB ∥ CD? Write yes or no.', 24, () => {
        const k = pick(['Corresponding', 'Alternate', 'Co-interior']), a = ri(30, 150);
        const b = k === 'Co-interior' ? pick([180 - a, 180 - a, a]) : pick([a, a, 180 - a, a + ri(2, 9)]);
        return a === 90 ? ['', ''] : [`${k}: ${a}° and ${b}°`, (k === 'Co-interior' ? a + b === 180 : a === b) ? 'yes' : 'no'];
      }, { cols: 3 }),
    ],
    medium: [
      round('find x so that AB ∥ CD.', 15, () => {
        const k = pick(['corresponding', 'alternate', 'co-interior']), a = ri(6, 33) * 5;
        return [`${k} angles: ${a}° and x°`, `x = ${k === 'co-interior' ? 180 - a : a}`];
      }, { cols: 3 }),
      round('give the reason: which pair of angles proves AB ∥ CD?', 12, () => {
        const k = pick(['corresponding', 'alternate', 'co-interior']), a = ri(6, 33) * 5;
        return [`${k === 'co-interior' ? `${a}° and ${180 - a}°` : `${a}° and ${a}°`}, ${k === 'corresponding' ? 'F shape' : k === 'alternate' ? 'Z shape' : 'C shape'}`, `${k} angles are ${k === 'co-interior' ? 'supplementary' : 'equal'}`];
      }, { cols: 2 }),
    ],
  }),
};

// A few degrees off a multiple of 5, so the estimate-then-measure round is not all tidy numbers.
function pick2(ri) { return ri(0, 4); }
