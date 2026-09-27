// Worksheet questions for Chapter 9 The number plane (lib/worksheet.js). See ../ch01-integers/content.js.
// Rounds that need a map or a number plane show it under the speech bubble (round.fig).
const D = require('../../lib/diagrams');
const { svg, text, line } = require('../../lib/graphs');
const { fmt } = require('../../lib/calc');

const N = (v) => fmt(v);
const P = (x, y) => `(${N(x)}, ${N(y)})`;
const COLS = 'ABCDEFGH';
const PLACES = [['Pool', 'A', 1], ['Bank', 'C', 1], ['Park', 'F', 1], ['Zoo', 'H', 2], ['Shop', 'B', 2], ['Bus', 'E', 2], ['Gym', 'D', 3], ['Farm', 'A', 4], ['Cafe', 'G', 3],
  ['Mall', 'C', 4], ['Beach', 'H', 5], ['Club', 'E', 5], ['Fire', 'B', 6], ['Vet', 'F', 6], ['Post', 'D', 6], ['Oval', 'G', 4], ['Wharf', 'A', 6], ['Hotel', 'H', 6]];
const map = (() => {
  const c = 10, o = 7, W = 8 * c + o + 2, H = 6 * c + o + 2;
  const X = (i) => o + i * c, Y = (j) => 1 + j * c;
  let b = '';
  for (let i = 0; i <= 8; i++) b += line(X(i), Y(0), X(i), Y(6), '#bcb8a8', 0.25);
  for (let j = 0; j <= 6; j++) b += line(X(0), Y(j), X(8), Y(j), '#bcb8a8', 0.25);
  COLS.split('').forEach((L, i) => { b += text(X(i) + c / 2, Y(6) + 4.5, L, { size: 3.4, anchor: 'middle', weight: 700 }); });
  for (let r = 1; r <= 6; r++) b += text(o - 2, Y(6 - r) + c / 2 + 1.1, String(r), { size: 3.4, anchor: 'end', weight: 700 });
  PLACES.forEach(([name, col, row]) => { const i = COLS.indexOf(col), j = 6 - row; b += `<rect x="${X(i) + 0.8}" y="${Y(j) + 0.8}" width="${c - 1.6}" height="${c - 1.6}" rx="1.2" fill="#dfe6fa"/>` + text(X(i) + c / 2, Y(j) + c / 2 + 1, name, { size: 2.6, anchor: 'middle', weight: 600 }); });
  return svg(W, H, b);
})();
const LET = 'ABCDEFGHJKLMNPQR';
const labelled = (pts, min, max) => D.plane({ min, max, cell: 5, points: pts.map(([x, y], i) => ({ x, y, label: LET[i] })) });
const spread = (ri, k, min, max, avoid0) => { const s = new Map(); while (s.size < k) { const x = ri(min, max), y = ri(min, max); if (avoid0 && (!x || !y)) continue; s.set(`${x},${y}`, [x, y]); } return [...s.values()]; };
const quad = (x, y) => (x === 0 && y === 0 ? 'origin' : x === 0 ? 'y-axis' : y === 0 ? 'x-axis' : x > 0 ? (y > 0 ? '1st' : '4th') : y > 0 ? '2nd' : '3rd');
const rule = (m, c) => `y = ${m === 1 ? '' : m === -1 ? '−' : N(m)}x${c ? ` ${c < 0 ? '−' : '+'} ${Math.abs(c)}` : ''}`;
const at = (col, row) => PLACES.find(([, c, r]) => c === col && r === row);

module.exports = {
  '9.01': ({ ri, pick }) => {
    const ps = PLACES;
    return [
      [{ text: 'Use the map. What is at each grid reference? (Letter across, then number up.)', fig: map, fh: 44, gen: (i) => { const [nm, c, r] = ps[(i * 7) % ps.length]; return { q: `${c}${r}`, a: nm }; } }],
      [{ text: 'Use the map above. Write the grid reference, then describe the move from the first place.', one: true, gen: (_, i) => { const [a, ca, ra] = ps[(i * 5) % ps.length], [b, cb, rb] = ps[(i * 5 + 7) % ps.length]; const dc = COLS.indexOf(cb) - COLS.indexOf(ca), dr = rb - ra; if (!dc || !dr) return { q: '' }; return { q: `${a} to ${b}`, a: `${cb}${rb}; ${Math.abs(dc)} ${dc > 0 ? 'right' : 'left'}, ${Math.abs(dr)} ${dr > 0 ? 'up' : 'down'}`, lines: [`${b} is at ${cb}${rb}`, `${Math.abs(dc)} ${dc > 0 ? 'right' : 'left'}, ${Math.abs(dr)} ${dr > 0 ? 'up' : 'down'}`] }; } }],
      [{ text: 'Follow the directions on the map. Write where you end up.', gen: (_, i) => { const [a, ca, ra] = ps[(i * 3 + 1) % ps.length]; let t = null; for (let k = 0; k < 20 && !t; k++) { const c = COLS[ri(0, 7)], r = ri(1, 6); const p = at(c, r); if (p && p[0] !== a && c !== ca && r !== ra) t = p; } if (!t) return { q: '' }; const dc = COLS.indexOf(t[1]) - COLS.indexOf(ca), dr = t[2] - ra; return { q: `Start at the ${a}. Go ${Math.abs(dc)} ${dc > 0 ? 'right' : 'left'} and ${Math.abs(dr)} ${dr > 0 ? 'up' : 'down'}. Where are you?`, a: `${t[1]}${t[2]}, the ${t[0]}`, lines: [`start: ${ca}${ra}`, `across ${dc > 0 ? '+' : '−'}${Math.abs(dc)} → ${t[1]}; up/down ${dr > 0 ? '+' : '−'}${Math.abs(dr)} → ${t[2]}`, `${t[1]}${t[2]}: the ${t[0]}`] }; } }],
    ];
  },
  '9.02': ({ ri }) => {
    const pts = spread(ri, 16, 0, 8);
    return [
      [{ text: 'Write the coordinates of each point: across (x) first, then up (y).', fig: labelled(pts.slice(0, 10), 0, 8), fh: 58, gen: (i) => (i < 10 ? { q: `point ${LET[i]}`, a: P(...pts[i]) } : null) }],
      [{ text: 'The two points are on the same horizontal or vertical line. How far apart are they?', gen: () => { const a = ri(0, 10), b = ri(0, 10), c = ri(0, 10); if (b === c) return { q: '' }; return ri(0, 1) ? { q: `${P(a, b)} and ${P(a, c)}`, a: String(Math.abs(b - c)), lines: [`same x, so count up: ${Math.max(b, c)} − ${Math.min(b, c)}`, `= ${Math.abs(b - c)} units`] } : { q: `${P(b, a)} and ${P(c, a)}`, a: String(Math.abs(b - c)), lines: [`same y, so count across: ${Math.max(b, c)} − ${Math.min(b, c)}`, `= ${Math.abs(b - c)} units`] }; } }],
      [{ text: 'Three corners of a rectangle are given. Find the fourth corner. Sketch it first.', gen: () => { const x1 = ri(0, 4), x2 = ri(5, 9), y1 = ri(0, 4), y2 = ri(5, 9); return { q: `${P(x1, y1)}, ${P(x2, y1)}, ${P(x2, y2)}`, a: P(x1, y2), lines: [`same x as ${P(x1, y1)}: x = ${x1}`, `same y as ${P(x2, y2)}: y = ${y2}`, `fourth corner ${P(x1, y2)}`] }; } }],
    ];
  },
  '9.03': ({ ri, pick }) => {
    const pts = spread(ri, 10, -5, 5, true);
    return [
      [{ text: 'Which quadrant is the point in (1st, 2nd, 3rd or 4th)? Or is it on an axis?', gen: () => { const x = ri(-9, 9), y = ri(-9, 9); return { q: P(x, y), a: quad(x, y) }; } }],
      [{ text: 'Use the number plane. Write the coordinates of each point, then its quadrant.', fig: labelled(pts, -5, 5), fh: 50, gen: (i) => (i < 10 ? { q: `point ${LET[i]}`, a: `${P(...pts[i])}, ${quad(...pts[i])}`, lines: [`${P(...pts[i])}`, `${quad(...pts[i])} quadrant`] } : null) }],
      [{ text: 'Reflect the point in an axis. Describe what happens to the signs.', gen: () => { const x = ri(-8, 8), y = ri(-8, 8), a = pick(['x', 'y']); if (!x || !y) return { q: '' }; const r = a === 'x' ? [x, -y] : [-x, y]; return { q: `Reflect ${P(x, y)} in the ${a}-axis.`, a: P(...r), lines: [`${a}-axis: the ${a === 'x' ? 'y' : 'x'}-coordinate changes sign`, `${P(x, y)} → ${P(...r)}`, `quadrant: ${quad(x, y)} → ${quad(...r)}`] }; } }],
    ];
  },
  '9.04': ({ ri }) => [
    [{ text: 'Write each column of the table as a point (x, y).', gen: () => { const x = ri(-3, 6), y = ri(-5, 12); return { q: `x = ${N(x)}, y = ${N(y)}`, a: P(x, y) }; } }],
    [{ text: 'The points follow a pattern. What happens to y each time x goes up by 1? Write the next point.', gen: () => { const m = ri(-3, 5), c = ri(0, 9), s = ri(0, 3); if (!m) return { q: '' }; const pt = (x) => P(x, m * x + c); return { q: [s, s + 1, s + 2].map(pt).join(', '), a: pt(s + 3), lines: [`y goes ${m > 0 ? 'up' : 'down'} by ${Math.abs(m)}`, `next: ${pt(s + 3)}`] }; } }],
    [{ text: 'Plot the points on the grid, join them, and describe the pattern.', gen: () => { const m = ri(1, 3), c = ri(0, 3); const pts = [0, 1, 2, 3].map((x) => [x, m * x + c]); if (pts[3][1] > 12) return { q: '' }; return { q: `Plot ${pts.map((p) => P(...p)).join(', ')}.`, fig: D.plane({ min: 0, max: 5, ymin: 0, ymax: 12, cell: 3 }), fh: 42, a: `a straight line; y goes up by ${m}`, lines: [`the points make a straight line`, `each time x goes up 1, y goes up ${m}`] }; } }],
  ],
  '9.05': ({ ri }) => [
    [{ text: 'Substitute the value of x into the rule to find y.', gen: () => { const m = ri(2, 6), c = ri(-5, 9), x = ri(0, 8); if (!c) return { q: '' }; return { q: `${rule(m, c)}, x = ${x}`, a: N(m * x + c) }; } }],
    [{ text: 'Complete the table for x = 0, 1, 2, 3. Show the substitution for the first one.', gen: () => { const m = ri(1, 5), c = ri(0, 9); return { q: rule(m, c), a: [0, 1, 2, 3].map((x) => m * x + c).join(', '), lines: [`x = 0: y = ${m} × 0 + ${c} = ${c}`, `y: ${[0, 1, 2, 3].map((x) => m * x + c).join(', ')}`] }; } }],
    [{ text: 'Find the rule for the table: y = (how much y goes up)x + (y when x = 0).', gen: () => { const m = ri(1, 6), c = ri(0, 9); return { q: `x: 0, 1, 2, 3<br>y: ${[0, 1, 2, 3].map((x) => m * x + c).join(', ')}`, a: rule(m, c), lines: [`y goes up by ${m}, so ${m}x`, `when x = 0, y = ${c}`, `${rule(m, c)}`] }; } }],
  ],
  '9.06': ({ ri, pick }) => [
    [{ text: 'Does the point lie on the line? Substitute x and check y. Write yes or no.', gen: () => { const m = ri(1, 4), c = ri(-3, 5), x = ri(-3, 5), y = pick([m * x + c, m * x + c, m * x + c + ri(1, 3)]); return { q: `${P(x, y)}; ${rule(m, c)}`, a: y === m * x + c ? 'yes' : 'no' }; } }],
    [{ text: 'Make a table of values for x = −1, 0, 1. Write the points to plot.', gen: () => { const m = ri(1, 3) * pick([1, -1]), c = ri(-2, 4); return { q: rule(m, c), a: [-1, 0, 1].map((x) => P(x, m * x + c)).join(', '), lines: [`y: ${[-1, 0, 1].map((x) => N(m * x + c)).join(', ')}`, `points: ${[-1, 0, 1].map((x) => P(x, m * x + c)).join(', ')}`] }; } }],
    [{ text: 'Graph the line on the number plane. Then write where it cuts the y-axis.', gen: () => { const m = pick([1, 2, -1, -2]), c = ri(-2, 3); return { q: `Graph ${rule(m, c)}.`, fig: D.plane({ min: -4, max: 4, cell: 5 }), fh: 48, a: `cuts the y-axis at ${P(0, c)}`, lines: [`points: ${[-1, 0, 1].map((x) => P(x, m * x + c)).join(', ')}`, `cuts the y-axis at ${P(0, c)}`] }; } }],
  ],
};
