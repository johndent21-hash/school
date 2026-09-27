// Skill drill pages for Chapter 9 The number plane: page 1 practises the Easy basics, page 2 the Medium basics (lib/drill.js).
const D = require('../../lib/diagrams');
const { svg, text, line } = require('../../lib/graphs');

const P = (x, y, N) => `(${N(x)}, ${N(y)})`;
const COLS = 'ABCDEFGH';
// A town map for grid references: 8 columns (A–H) and 6 rows (1–6, 1 at the bottom), one place in each named square.
const PLACES = [['Pool', 'A', 1], ['Bank', 'C', 1], ['Park', 'F', 1], ['Zoo', 'H', 2], ['Shop', 'B', 2], ['Bus', 'E', 2], ['Gym', 'D', 3], ['Farm', 'A', 4], ['Cafe', 'G', 3],
  ['Mall', 'C', 4], ['Beach', 'H', 5], ['Club', 'E', 5], ['Fire', 'B', 6], ['Vet', 'F', 6], ['Post', 'D', 6], ['Oval', 'G', 4], ['Wharf', 'A', 6], ['Hotel', 'H', 6]];
const map = (() => {
  const c = 10, o = 7, W = 8 * c + o + 2, H = 6 * c + o + 2;
  const X = (i) => o + i * c, Y = (j) => 1 + j * c;
  let b = '';
  for (let i = 0; i <= 8; i++) b += line(X(i), Y(0), X(i), Y(6), '#bcb8a8', 0.25);
  for (let j = 0; j <= 6; j++) b += line(X(0), Y(j), X(8), Y(j), '#bcb8a8', 0.25);
  COLS.split('').forEach((L, i) => { b += text(X(i) + c / 2, Y(6) + 4.5, L, { size: 3.2, anchor: 'middle', weight: 700 }); });
  for (let r = 1; r <= 6; r++) b += text(o - 2, Y(6 - r) + c / 2 + 1.1, String(r), { size: 3.2, anchor: 'end', weight: 700 });
  PLACES.forEach(([name, col, row]) => { const i = COLS.indexOf(col), j = 6 - row; b += `<rect x="${X(i) + 0.8}" y="${Y(j) + 0.8}" width="${c - 1.6}" height="${c - 1.6}" rx="1.2" fill="#dfe6fa"/>` + text(X(i) + c / 2, Y(j) + c / 2 + 1, name, { size: 2.3, anchor: 'middle', weight: 600 }); });
  return svg(W, H, b);
})();
// A number plane with lettered points: pts [[x, y], …] labelled A, B, C, …
const LET = 'ABCDEFGHJKLMNPQR';
const labelled = (pts, min, max) => D.plane({ min, max, cell: max - min > 10 ? 4.6 : 6, points: pts.map(([x, y], i) => ({ x, y, label: LET[i] })) });
const spread = (ri, k, min, max) => { const s = new Map(); while (s.size < k) { const x = ri(min, max), y = ri(min, max); s.set(`${x},${y}`, [x, y]); } return [...s.values()]; };
const quad = (x, y) => (x === 0 && y === 0 ? 'origin' : x === 0 ? 'y-axis' : y === 0 ? 'x-axis' : x > 0 ? (y > 0 ? '1st' : '4th') : y > 0 ? '2nd' : '3rd');
// y = mx + c written neatly: y = 3x − 2, y = x, y = −x + 4
const rule = (m, c, N) => `y = ${m === 1 ? '' : m === -1 ? '−' : N(m)}x${c ? ` ${c < 0 ? '−' : '+'} ${Math.abs(c)}` : ''}`;
const tableTxt = (xs, f, N) => `<span class="mini-table">x: ${xs.map(N).join(', ')}<br>y: ${xs.map((x) => N(f(x))).join(', ')}</span>`;

module.exports = {
  '9.01': ({ list, shuffle, ri }) => {
    const ps = shuffle(PLACES);
    return {
      easy: [
        { ...list('use the map. What is at each grid reference?', ps.slice(0, 12).map(([n, c, r]) => [`${c}${r}`, n]), { cols: 2 }), fig: map },
        { ...list('write the grid reference of each place.', ps.slice(6, 18).map(([n, c, r]) => [n, `${c}${r}`]), { cols: 2 }), fig: map },
      ],
      medium: [
        { ...list('start at the place given and move. Where do you end up?', ps.slice(0, 10).map(([n, c, r]) => { const i = COLS.indexOf(c); let ni, nr; do { ni = ri(0, 7); nr = ri(1, 6); } while (ni === i || nr === r); const at = PLACES.find(([, cc, rr]) => cc === COLS[ni] && rr === nr); return [`${n}: ${Math.abs(ni - i)} ${ni > i ? 'right' : 'left'}, ${Math.abs(nr - r)} ${nr > r ? 'up' : 'down'}`, `${COLS[ni]}${nr}${at ? ` (${at[0]})` : ''}`]; }), { cols: 2 }), fig: map },
        { ...list('how many squares right (or left) and up (or down) from the first place to the second?', ps.slice(8, 18).map(([n, c, r], k) => { const [m, c2, r2] = ps[(k + 3) % 18]; const di = COLS.indexOf(c2) - COLS.indexOf(c), dr = r2 - r; return [`${n} to ${m}`, `${Math.abs(di)} ${di >= 0 ? 'right' : 'left'}, ${Math.abs(dr)} ${dr >= 0 ? 'up' : 'down'}`]; }), { cols: 2 }), fig: map },
      ],
    };
  },
  '9.02': ({ round, list, ri, N }) => {
    const pts = spread(ri, 12, 0, 8), pts2 = spread(ri, 12, 0, 8);
    return {
      easy: [
        { ...list('write the coordinates of each point.', pts.map(([x, y], i) => [`<b>${LET[i]}</b>`, P(x, y, N)]), { cols: 2, keep: true }), fig: labelled(pts, 0, 8) },
        round('write the x-coordinate (x) or the y-coordinate (y) of the point.', 16, () => { const x = ri(0, 12), y = ri(0, 12), k = ri(0, 1) ? 'x' : 'y'; return [`${k} of ${P(x, y, N)}`, k === 'x' ? x : y]; }),
      ],
      medium: [
        { ...list('which point is at these coordinates?', pts2.map(([x, y], i) => [P(x, y, N), LET[i]]), { cols: 2 }), fig: labelled(pts2, 0, 8) },
        round('the two points are on the same horizontal or vertical line. How far apart are they?', 12, () => { const a = ri(0, 10), b = ri(0, 10), c = ri(0, 10); return b === c ? ['', ''] : ri(0, 1) ? [`${P(a, b, N)} and ${P(a, c, N)}`, Math.abs(b - c)] : [`${P(b, a, N)} and ${P(c, a, N)}`, Math.abs(b - c)]; }, { cols: 3 }),
      ],
    };
  },
  '9.03': ({ round, list, ri, pick, N }) => {
    const pts = spread(ri, 12, -5, 5);
    return {
      easy: [
        round('which quadrant (1st, 2nd, 3rd or 4th) or which axis is the point on?', 24, () => { const x = ri(-9, 9), y = ri(-9, 9); return [P(x, y, N), quad(x, y)]; }),
        { ...list('write the coordinates of each point.', pts.map(([x, y], i) => [`<b>${LET[i]}</b>`, P(x, y, N)]), { cols: 2, keep: true }), fig: labelled(pts, -5, 5) },
      ],
      medium: [
        round('reflect the point in the axis given.', 16, () => { const x = ri(-8, 8), y = ri(-8, 8), a = pick(['x', 'y']); return !x || !y ? ['', ''] : [`${P(x, y, N)} in the ${a}-axis`, a === 'x' ? P(x, -y, N) : P(-x, y, N)]; }),
        list('which quadrant is described?', [['x negative, y positive', '2nd'], ['x positive, y negative', '4th'], ['both negative', '3rd'], ['both positive', '1st'], ['x = 0', 'on the y-axis'], ['y = 0', 'on the x-axis'],
          ['left of the y-axis, above the x-axis', '2nd'], ['right of the y-axis, below the x-axis', '4th'], ['left of the y-axis, below the x-axis', '3rd'], ['right of the y-axis, above the x-axis', '1st'], ['x and y are both zero', 'the origin'], ['(−a, a) for a positive number a', '2nd']], { cols: 3 }),
      ],
    };
  },
  '9.04': ({ round, ri, pick, N }) => ({
    easy: [
      round('write each column of the table as a point (x, y).', 10, () => { const m = ri(1, 4), c = ri(0, 6), xs = [0, 1, 2, 3]; return [tableTxt(xs, (x) => m * x + c, N), xs.map((x) => P(x, m * x + c, N)).join(', ')]; }, { cols: 2 }),
      round('the points follow a pattern. Write the next point.', 15, () => { const m = ri(1, 4), c = ri(0, 6), s = ri(0, 3); return [[s, s + 1, s + 2].map((x) => P(x, m * x + c, N)).join(', '), P(s + 3, m * (s + 3) + c, N)]; }, { cols: 3 }),
    ],
    medium: [
      round('describe the pattern: what happens to y each time x goes up by 1?', 12, () => { const m = ri(-3, 5), c = ri(0, 9); return m === 0 ? ['', ''] : [[0, 1, 2].map((x) => P(x, m * x + c, N)).join(', '), m > 0 ? `y goes up by ${m}` : `y goes down by ${-m}`]; }, { cols: 3 }),
      round('the points follow a pattern. Find the missing coordinate.', 15, () => { const m = ri(1, 5), c = ri(-3, 6); return [`${P(0, c, N)}, ${P(1, m + c, N)}, ${P(2, 2 * m + c, N)}, (5, ?)`, N(5 * m + c)]; }, { cols: 3 }),
    ],
  }),
  '9.05': ({ round, ri, pick, N }) => ({
    easy: [
      round('substitute to find y.', 24, () => { const m = ri(1, 6), c = ri(-5, 9), x = ri(0, 8), op = c < 0 ? '−' : '+'; return [`${rule(m, c, N)}, x = ${x}`, N(m * x + c)]; }, { cols: 3 }),
      round('complete the table: write the y-values for x = 0, 1, 2, 3.', 10, () => { const m = ri(1, 5), c = ri(0, 9); return [rule(m, c, N), [0, 1, 2, 3].map((x) => m * x + c).join(', ')]; }, { cols: 2 }),
    ],
    medium: [
      round('find the rule, y = … x + …', 12, () => { const m = ri(1, 6), c = ri(0, 9); return [tableTxt([0, 1, 2, 3], (x) => m * x + c, N), rule(m, c, N)]; }, { cols: 2 }),
      round('find x for the value of y given.', 15, () => { const m = ri(2, 6), c = ri(0, 9), x = ri(0, 10); return [`${rule(m, c, N)}, y = ${m * x + c}`, `x = ${x}`]; }, { cols: 3 }),
    ],
  }),
  '9.06': ({ round, ri, pick, N }) => ({
    easy: [
      round('does the point lie on the line? Write yes or no.', 24, () => { const m = ri(1, 4), c = ri(-3, 5), x = ri(-3, 5), y = pick([m * x + c, m * x + c, m * x + c + ri(1, 3)]); return [`${P(x, y, N)} on ${rule(m, c, N)}`, y === m * x + c ? 'yes' : 'no']; }, { cols: 3 }),
      round('write the points to plot for x = −1, 0, 1, 2.', 8, () => { const m = ri(1, 3), c = ri(-2, 4); return [rule(m, c, N), [-1, 0, 1, 2].map((x) => P(x, m * x + c, N)).join(', ')]; }, { cols: 2 }),
    ],
    medium: [
      round('the point lies on the line. Find the missing coordinate.', 16, () => { const m = ri(-3, 4), c = ri(-4, 6), x = ri(-4, 5); if (!m) return ['', '']; return [`(${N(x)}, ?) on ${rule(m, c, N)}`, N(m * x + c)]; }),
      round('where does the line cut the y-axis? Write the point.', 12, () => { const m = ri(-4, 5), c = ri(-6, 9); if (!m) return ['', '']; return [rule(m, c, N), P(0, c, N)]; }, { cols: 3 }),
    ],
  }),
};
