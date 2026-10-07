// Chapter 9 The number plane: mixed-practice questions (lib/mixed.js). Every question stands on its own.
const D = require('../../lib/diagrams');
const { svg, text, line } = require('../../lib/graphs');
const { fmt } = require('../../lib/calc');

const N = (v) => fmt(v);
const P = (x, y) => `(${N(x)}, ${N(y)})`;
const i_ = (v) => `<i>${v}</i>`;
const COLS = 'ABCDEF';
const NAMES = ['Pool', 'Bank', 'Park', 'Zoo', 'Shop', 'Gym', 'Farm', 'Cafe', 'Mall', 'Beach', 'Club', 'Vet', 'Post', 'Oval'];
// A small town map, 6 columns (A–F) by 5 rows (1 at the bottom), with some places on it: [[name, col, row]].
const miniMap = (places) => {
  const c = 9.5, o = 6, W = 6 * c + o + 2, H = 5 * c + o + 2, X = (i) => o + i * c, Y = (j) => 1 + j * c;
  let b = '';
  for (let i = 0; i <= 6; i++) b += line(X(i), Y(0), X(i), Y(5), '#bcb8a8', 0.25);
  for (let j = 0; j <= 5; j++) b += line(X(0), Y(j), X(6), Y(j), '#bcb8a8', 0.25);
  COLS.split('').forEach((L, i) => { b += text(X(i) + c / 2, Y(5) + 4.2, L, { size: 3, anchor: 'middle', weight: 700 }); });
  for (let r = 1; r <= 5; r++) b += text(o - 1.5, Y(5 - r) + c / 2 + 1, String(r), { size: 3, anchor: 'end', weight: 700 });
  places.forEach(([nm, col, row]) => { const i = COLS.indexOf(col), j = 5 - row; b += `<rect x="${X(i) + 0.6}" y="${Y(j) + 0.6}" width="${c - 1.2}" height="${c - 1.2}" rx="1" fill="#dfe6fa"/>` + text(X(i) + c / 2, Y(j) + c / 2 + 1, nm, { size: 2.7, anchor: 'middle', weight: 600 }); });
  return svg(W, H, b);
};
// Four different places in four different squares.
const town = (K) => { const nm = K.shuffle(NAMES).slice(0, 4), seen = new Set(), out = []; while (out.length < 4) { const c = COLS[K.ri(0, 5)], r = K.ri(1, 5); if (seen.has(c + r)) continue; seen.add(c + r); out.push([nm[out.length], c, r]); } return out; };
const LET = 'ABCDEFGHJKLM';
const labelled = (pts, min, max) => D.plane({ min, max, cell: max - min > 8 ? 4 : 5, points: pts.map(([x, y], i) => ({ x, y, label: LET[i] })) });
const spread = (K, k, min, max, avoid0) => { const s = new Map(); while (s.size < k) { const x = K.ri(min, max), y = K.ri(min, max); if (avoid0 && (!x || !y)) continue; s.set(`${x},${y}`, [x, y]); } return [...s.values()]; };
const quad = (x, y) => (x === 0 && y === 0 ? 'the origin' : x === 0 ? 'the y-axis' : y === 0 ? 'the x-axis' : x > 0 ? (y > 0 ? '1st quadrant' : '4th quadrant') : y > 0 ? '2nd quadrant' : '3rd quadrant');
const rule = (m, c) => `${i_('y')} = ${m === 1 ? '' : m === -1 ? '−' : N(m)}${i_('x')}${c ? ` ${c < 0 ? '−' : '+'} ${Math.abs(c)}` : ''}`;
const table = (xs, ys) => `<table class="data-table"><tr><th>${i_('x')}</th>${xs.map((x) => `<td>${N(x)}</td>`).join('')}</tr><tr><th>${i_('y')}</th>${ys.map((y) => `<td>${y === null ? '' : N(y)}</td>`).join('')}</tr></table>`;
const moveTxt = (dx, dy) => [dx ? `${Math.abs(dx)} ${dx > 0 ? 'right' : 'left'}` : '', dy ? `${Math.abs(dy)} ${dy > 0 ? 'up' : 'down'}` : ''].filter(Boolean).join(', ');
const blank = (min, max) => D.plane({ min, max, cell: max - min > 8 ? 4 : 5 });

module.exports = {
  '9.01': {
    exH: 74, exFh: 34,
    idea: 'A grid reference gives the column letter first (across), then the row number (up). To describe a move, count the squares across, then up or down.',
    ex: [['What is at C2?', ['column C, row 2', 'the Bank'], miniMap([['Bank', 'C', 2], ['Zoo', 'E', 4], ['Park', 'A', 5]])], ['Give the grid reference of the Zoo.', ['column E, row 4', 'E4']], ['Describe the move from the Bank to the Zoo.', ['C to E: 2 right', 'row 2 to 4: 2 up']]],
    e: [
      (K) => { const t = town(K), [nm, c, r] = K.pick(t); return { q: `What is at grid reference ${c}${r}?`, fig: miniMap(t), fh: 40, a: nm }; },
      (K) => { const t = town(K), [nm, c, r] = K.pick(t); return { q: `Give the grid reference of the ${nm}.`, fig: miniMap(t), fh: 40, a: `${c}${r}` }; },
      ({ ri }) => { const c = ri(0, 3), r = ri(1, 3), dx = ri(1, 2), dy = ri(1, 2); return { q: `Start at ${COLS[c]}${r}. Move ${dx} right and ${dy} up. What is the grid reference now?`, a: `${COLS[c + dx]}${r + dy}` }; },
    ],
    m: [
      (K) => { const t = town(K), [a, b] = K.shuffle(t); const dx = COLS.indexOf(b[1]) - COLS.indexOf(a[1]), dy = b[2] - a[2]; return !dx || !dy ? null : { q: `Describe the move from the ${a[0]} to the ${b[0]}.`, fig: miniMap(t), fh: 40, w: [`${a[1]}${a[2]} to ${b[1]}${b[2]}`, moveTxt(dx, dy)] }; },
      ({ ri }) => { const c = ri(2, 5), r = ri(3, 5), dx = ri(1, c), dy = ri(1, r - 1); return { q: `Start at ${COLS[c]}${r}. Move ${dx} left and ${dy} down. What is the grid reference now?`, w: [`${COLS[c]} → ${COLS[c - dx]}, ${r} → ${r - dy}`, `${COLS[c - dx]}${r - dy}`] }; },
    ],
    c: [
      ({ ri }) => { const c = ri(0, 3), r = ri(1, 3), n = ri(1, 2), e = ri(1, 2); return { q: `North is up. From ${COLS[c]}${r}, walk ${n} square${n > 1 ? 's' : ''} north, then ${e} square${e > 1 ? 's' : ''} east. Where are you?`, w: [`north: row ${r} → ${r + n}`, `east: ${COLS[c]} → ${COLS[c + e]}, so ${COLS[c + e]}${r + n}`] }; },
      (K) => { const t = town(K), [a, b] = K.shuffle(t); const dx = COLS.indexOf(b[1]) - COLS.indexOf(a[1]), dy = b[2] - a[2]; return !dx || !dy ? null : { q: `How many squares is the shortest route from the ${a[0]} to the ${b[0]}, moving only across and up or down?`, fig: miniMap(t), fh: 40, w: [moveTxt(dx, dy), `${Math.abs(dx)} + ${Math.abs(dy)} = ${Math.abs(dx) + Math.abs(dy)} squares`] }; },
      ({ ri }) => { const c = ri(3, 5), r = ri(3, 5); return { q: `Which grid reference is 2 squares left and 2 squares down from ${COLS[c]}${r}? Is it on the same diagonal?`, a: `${COLS[c - 2]}${r - 2}; yes`, n: 2 }; },
    ],
  },

  '9.02': {
    exH: 74, exFh: 34,
    idea: 'A point is written (x, y): go across x first, then up y. The point (0, 0) is the origin, where the axes meet.',
    ex: [['Write the coordinates of A.', ['across 4, up 2', '(4, 2)'], labelled([[4, 2], [1, 5]], 0, 6)], ['Which point is at (1, 5)?', ['across 1, up 5', 'B']], ['A rectangle has corners (1, 1), (5, 1) and (5, 4). Find the fourth corner.', ['same x as (1, 1), same y as (5, 4)', '(1, 4)']]],
    look: ['9.01'],
    e: [
      (K) => { const pts = spread(K, 3, 0, 6), k = K.ri(0, 2); return { q: `Write the coordinates of ${LET[k]}.`, fig: labelled(pts, 0, 6), fh: 30, a: P(...pts[k]) }; },
      (K) => { const pts = spread(K, 3, 0, 6), k = K.ri(0, 2); return { q: `Which point is at ${P(...pts[k])}?`, fig: labelled(pts, 0, 6), fh: 30, a: LET[k] }; },
      ({ ri }) => { const x = ri(0, 9), y = ri(0, 9); return x === y ? null : { q: `What is the ${['x', 'y'][x % 2]}-coordinate of ${P(x, y)}?`.replace(/the (x|y)-/, (m, v) => `the ${i_(v)}-`), a: N(x % 2 ? y : x) }; },
    ],
    m: [
      ({ ri, pick }) => { const [nm, pts] = pick([['square', [[1, 1], [4, 1], [4, 4], [1, 4]]], ['rectangle', [[1, 2], [6, 2], [6, 5], [1, 5]]], ['right-angled triangle', [[1, 1], [5, 1], [1, 5]]], ['parallelogram', [[1, 1], [4, 1], [5, 4], [2, 4]]], ['kite', [[3, 1], [5, 3], [3, 6], [1, 3]]]]); return { q: `Plot ${pts.map((p) => P(...p)).join(', ')} and join them in order. Name the shape.`, fig: blank(0, 6), fh: 30, a: nm, key: nm }; },
      ({ ri }) => { const y = ri(1, 6), a = ri(0, 3), b = a + 2 * ri(1, 3); return { q: `Find the point halfway between ${P(a, y)} and ${P(b, y)}.`, w: [`x: halfway between ${a} and ${b} is ${(a + b) / 2}`, P((a + b) / 2, y)] }; },
      ({ ri }) => { const x = ri(0, 6), a = ri(0, 3), b = ri(a + 2, 9); return { q: `How long is the line from ${P(x, a)} to ${P(x, b)}?`, w: ['same x: count up', `${b} − ${a} = ${b - a} units`] }; },
    ],
    c: [
      ({ ri }) => { const x1 = ri(0, 3), x2 = x1 + ri(2, 4), y1 = ri(0, 3), y2 = y1 + ri(2, 4); return { q: `A rectangle has corners ${P(x1, y1)}, ${P(x2, y1)} and ${P(x2, y2)}. Find the fourth corner and the area.`, w: [`fourth corner: ${P(x1, y2)}`, `${x2 - x1} × ${y2 - y1} = ${(x2 - x1) * (y2 - y1)} square units`] }; },
      ({ ri }) => { const x = ri(1, 4), y = ri(1, 4), s = ri(2, 4); return { q: `${P(x, y)} and ${P(x + s, y)} are two corners of a square, and the square is above them. Find the other two corners.`, a: `${P(x, y + s)} and ${P(x + s, y + s)}` }; },
      ({ ri }) => { const x = ri(1, 5), y = ri(1, 5); return x === y ? null : { q: `A point is ${x} units across and ${y} up. Someone writes it as ${P(y, x)}. What went wrong?`, a: `x comes first: it is ${P(x, y)}.`, n: 2, key: `says ${ri(1, 2)}` }; },
    ],
  },

  '9.03': {
    exH: 74, exFh: 34,
    idea: 'The axes cross at the origin (0, 0). Left of the y-axis, x is negative. Below the x-axis, y is negative. The quadrants are numbered anticlockwise, starting at the top right.',
    ex: [['Write the coordinates of A.', ['3 left, 2 down', '(−3, −2)'], labelled([[-3, -2], [2, -4]], -5, 5)], ['Which quadrant is (−4, 1) in?', ['x negative, y positive', '2nd quadrant']], ['Reflect (3, −2) in the x-axis.', ['the sign of y changes', '(3, 2)']]],
    look: ['9.02', '1.02'],
    e: [
      (K) => { const pts = spread(K, 3, -4, 4, true), k = K.ri(0, 2); return { q: `Write the coordinates of ${LET[k]}.`, fig: labelled(pts, -4, 4), fh: 30, a: P(...pts[k]) }; },
      ({ ri, nz }) => { const x = nz(-9, 9), y = nz(-9, 9); return { q: `Which quadrant is ${P(x, y)} in?`, a: quad(x, y) }; },
      (K) => { const pts = spread(K, 3, -4, 4, true), k = K.ri(0, 2); return { q: `Which point is at ${P(...pts[k])}?`, fig: labelled(pts, -4, 4), fh: 30, a: LET[k] }; },
    ],
    m: [
      ({ nz, pick }) => { const x = nz(-8, 8), y = nz(-8, 8), ax = pick(['x', 'y']); return { q: `Reflect ${P(x, y)} in the ${i_(ax)}-axis.`, w: [`the sign of ${ax === 'x' ? 'y' : 'x'} changes`, ax === 'x' ? P(x, -y) : P(-x, y)] }; },
      ({ ri, nz }) => { const x = ri(-5, 5), y = ri(-5, 5), dx = nz(-6, 6), dy = nz(-6, 6); return { q: `Move ${P(x, y)} ${moveTxt(dx, dy)}. Where is it now?`, w: [`x: ${N(x)} ${dx > 0 ? '+' : '−'} ${Math.abs(dx)} = ${N(x + dx)}, y: ${N(y)} ${dy > 0 ? '+' : '−'} ${Math.abs(dy)} = ${N(y + dy)}`, P(x + dx, y + dy)] }; },
      ({ ri }) => { const x = ri(-6, -1), y = ri(1, 6); return { q: `How far is it from ${P(x, y)} to ${P(-x, y)}?`, w: [`${-x} to the y-axis, ${-x} more`, `${-2 * x} units`] }; },
    ],
    c: [
      ({ nz }) => { const x = nz(-6, 6), y = nz(-6, 6); return { q: `Rotate ${P(x, y)} by 180° about the origin. Which quadrant is the image in?`, w: [`both signs change: ${P(-x, y === 0 ? 0 : -y)}`, quad(-x, -y)] }; },
      ({ ri }) => { const a = ri(1, 4), b = ri(1, 4); return { q: `A square has corners ${P(-a, -b)}, ${P(a, -b)} and ${P(a, 2 * a - b)}. Find the fourth corner.`, w: ['same x as the first, same y as the third', P(-a, 2 * a - b)] }; },
      ({ ri }) => { const x = ri(1, 5), y = ri(1, 5); return { q: `${P(x, y)} is reflected in the y-axis, then in the x-axis. Where does it end up?`, w: [`y-axis: ${P(-x, y)}`, `x-axis: ${P(-x, -y)}`] }; },
    ],
  },

  '9.04': {
    exH: 74, exFh: 34,
    idea: 'Each column of a table of values gives a point (x, y). Plot the points. If they lie in a straight line, describe the pattern: how y changes each time x goes up by 1.',
    ex: [['Write the points from the table.', ['one point for each column', '(0, 1), (1, 3), (2, 5), (3, 7)'], table([0, 1, 2, 3], [1, 3, 5, 7])], ['Describe the pattern in the table.', ['y goes up by 2 each time', 'y starts at 1']], ['Plot the points. Do they lie in a straight line?', ['plot each point', 'yes'], blank(0, 7)]],
    look: ['9.02'],
    e: [
      ({ ri }) => { const m = ri(1, 3), c = ri(0, 4), xs = [0, 1, 2, 3]; return { q: 'Write the points from the table.', fig: table(xs, xs.map((x) => m * x + c)), a: xs.map((x) => P(x, m * x + c)).join(', ') }; },
      ({ ri }) => { const m = ri(1, 4), c = ri(0, 5), xs = [1, 2, 3, 4], k = ri(0, 3); return { q: `In the table, what is ${i_('y')} when ${i_('x')} = ${xs[k]}?`, fig: table(xs, xs.map((x) => m * x + c)), a: N(m * xs[k] + c) }; },
    ],
    m: [
      ({ ri, pick }) => { const m = pick([1, 2, 3, 4, 5, -1, -2]), c = ri(5, 12), xs = [0, 1, 2, 3]; return { q: 'Describe the pattern in the table.', fig: table(xs, xs.map((x) => m * x + c)), w: [`${i_('y')} goes ${m > 0 ? 'up' : 'down'} by ${Math.abs(m)} each time`, `${i_('y')} starts at ${c}`] }; },
      ({ ri }) => { const m = ri(2, 5), c = ri(0, 5), xs = [1, 2, 3, 4], k = ri(1, 3); return { q: 'Find the missing number in the table.', fig: table(xs, xs.map((x, i) => (i === k ? null : m * x + c))), w: [`${i_('y')} goes up by ${m}`, N(m * xs[k] + c)] }; },
      ({ ri, pick }) => { const xs = [0, 1, 2, 3], straight = pick([true, false]); const ys = straight ? xs.map((x) => 2 * x + 1) : xs.map((x) => x * x + 1); return { q: 'Do the points in the table lie in a straight line? Explain.', fig: table(xs, ys), a: straight ? 'Yes: y goes up by the same amount (2) each time.' : 'No: y goes up by 1, 3, 5 (not the same each time).', n: 2, key: String(straight) }; },
    ],
    c: [
      ({ ri }) => { const m = ri(2, 5), c = ri(1, 6), xs = [0, 1, 2, 3]; return { q: `Use the pattern to find ${i_('y')} when ${i_('x')} = 10.`, fig: table(xs, xs.map((x) => m * x + c)), w: [`starts at ${c}, up ${m} each time`, `${c} + 10 × ${m} = ${c + 10 * m}`] }; },
      ({ ri }) => { const m = ri(2, 5), c = ri(1, 6), xs = [1, 2, 3, 4]; return { q: 'Write a rule for the table.', fig: table(xs, xs.map((x) => m * x + c)), w: [`up ${m} each time: ${m}${i_('x')}, then + ${c}`, rule(m, c)] }; },
      ({ ri }) => { const m = ri(2, 4), c = ri(1, 4), xs = [0, 1, 2, 3]; return { q: 'Plot the points from the table and join them. Where does the line cross the y-axis?', fig: table(xs, xs.map((x) => m * x + c)), w: ['plot and join the points', `at ${P(0, c)}`] }; },
    ],
  },

  '9.05': {
    idea: 'To complete a table of values, substitute each x into the rule. For y = 2x + 1, when x = 3: y = 2 × 3 + 1 = 7.',
    ex: [[`Find ${i_('y')} when ${i_('x')} = 4, for ${rule(3, -2)}.`, ['y = 3 × 4 − 2', '= 10']], [`Complete the table for ${rule(2, 1)}.`, ['substitute x = 0, 1, 2, 3', 'y: 1, 3, 5, 7'], table([0, 1, 2, 3], [null, null, null, null])], [`Find ${i_('x')} when ${i_('y')} = 13, for ${rule(2, 3)}.`, ['2x + 3 = 13', 'x = 5']]],
    look: ['9.04', '5.05'],
    e: [
      ({ ri }) => { const m = ri(2, 5), c = ri(-5, 9), x = ri(1, 6); return { q: `Find ${i_('y')} when ${i_('x')} = ${x}, for ${rule(m, c)}.`, a: N(m * x + c) }; },
      ({ ri }) => { const m = ri(1, 4), c = ri(0, 5), xs = [0, 1, 2]; return { q: `Complete the table for ${rule(m, c)}.`, fig: table(xs, [null, null, null]), a: xs.map((x) => N(m * x + c)).join(', ') }; },
    ],
    m: [
      ({ ri }) => { const m = ri(2, 4), c = ri(-3, 5), xs = [-2, -1, 0, 1]; return { q: `Complete the table for ${rule(m, c)}.`, fig: table(xs, xs.map(() => null)), w: [`${i_('x')} = −2: ${m} × (−2) ${c < 0 ? '−' : '+'} ${Math.abs(c)} = ${N(-2 * m + c)}`, xs.map((x) => N(m * x + c)).join(', ')] }; },
      ({ ri, pick, shuffle }) => { const m = ri(2, 4), c = ri(1, 5), xs = [1, 2, 3]; const opts = shuffle([[m, c], [m + 1, c - 1], [c, m]].filter(([a, b]) => !(a === m && b === c) || true)); return new Set(opts.map((o) => o.join())).size < 3 ? null : { q: `Which rule fits the table: ${opts.map(([a, b]) => rule(a, b)).join(', or ')}?`, fig: table(xs, xs.map((x) => m * x + c)), w: ['test x = 1, 2 and 3 in each', rule(m, c)] }; },
      ({ ri, pick }) => { const m = pick([-1, -2, -3]), c = ri(4, 10), xs = [0, 1, 2, 3]; return { q: `Complete the table for ${rule(m, c)}.`, fig: table(xs, xs.map(() => null)), w: [`${i_('y')} goes down by ${-m}`, xs.map((x) => N(m * x + c)).join(', ')] }; },
    ],
    c: [
      ({ ri }) => { const m = ri(2, 5), c = ri(-4, 6), x = ri(2, 9); return { q: `Find ${i_('x')} when ${i_('y')} = ${N(m * x + c)}, for ${rule(m, c)}.`, w: [`${m}${i_('x')} ${c < 0 ? '−' : '+'} ${Math.abs(c)} = ${N(m * x + c)}`, `${i_('x')} = ${x}`] }; },
      ({ ri, pick }) => { const m = ri(2, 4), c = ri(1, 5), x = ri(1, 5), on = pick([true, false]); const y = m * x + c + (on ? 0 : pick([1, -1])); return { q: `Is ${P(x, y)} on the line ${rule(m, c)}? Show why.`, w: [`${m} × ${x} ${c < 0 ? '−' : '+'} ${Math.abs(c)} = ${m * x + c}`, on ? 'yes' : `no: ${m * x + c} ≠ ${y}`] }; },
      ({ ri }) => { const r = ri(2, 6), f = ri(3, 8); return { q: `A taxi charges $${f} plus $${r} a kilometre: C = ${r}${i_('k')} + ${f}. Complete a table for 0, 1, 2 and 3 km.`, w: ['substitute k = 0, 1, 2, 3', [0, 1, 2, 3].map((k) => `$${r * k + f}`).join(', ')] }; },
    ],
  },

  '9.06': {
    exH: 74, exFh: 34,
    idea: 'To graph a rule, make a table of values, plot the points and rule a straight line through them. A point lies on the line if its x and y make the rule true.',
    ex: [[`Graph ${rule(2, -1)} for ${i_('x')} = 0 to 3.`, ['table: (0, −1), (1, 1), (2, 3), (3, 5)', 'plot and rule a line'], blank(-1, 5)], [`Does (3, 10) lie on ${rule(3, 1)}?`, ['3 × 3 + 1 = 10', 'yes']], [`Where does ${rule(1, 4)} cross the ${i_('y')}-axis?`, ['x = 0: y = 4', '(0, 4)']]],
    look: ['9.05', '9.03'],
    e: [
      ({ ri, pick }) => { const m = ri(1, 4), c = ri(-3, 5), x = ri(0, 4), on = pick([true, false]); const y = m * x + c + (on ? 0 : 1); return { q: `Does ${P(x, y)} lie on the line ${rule(m, c)}?`, a: on ? 'yes' : 'no' }; },
      ({ ri }) => { const m = ri(1, 4), c = ri(-5, 6); return { q: `Where does ${rule(m, c)} cross the ${i_('y')}-axis?`, a: P(0, c) }; },
    ],
    m: [
      ({ ri }) => { const m = ri(1, 2), c = ri(-1, 1); return { q: `Complete a table for ${i_('x')} = 0, 1, 2, then graph ${rule(m, c)}.`, fig: blank(-2, 5), fh: 30, w: [[0, 1, 2].map((x) => P(x, m * x + c)).join(', '), 'plot and rule a line'] }; },
      ({ ri, pick }) => { const m = ri(1, 4), c = ri(-3, 5), x = ri(-2, 4), on = pick([true, false]); const y = m * x + c + (on ? 0 : 2); return { q: `Does ${P(x, y)} lie on the line ${rule(m, c)}? Show the check.`, w: [`${m} × ${x < 0 ? `(${N(x)})` : x} ${c < 0 ? '−' : '+'} ${Math.abs(c)} = ${N(m * x + c)}`, on ? 'yes' : `no: ${N(m * x + c)} ≠ ${N(y)}`] }; },
    ],
    c: [
      ({ ri }) => { const x = ri(1, 3), y = ri(2, 5), a = y - x, b = y + x; return { q: `Where do ${rule(1, a)} and ${rule(-1, b)} meet?`, w: ['make a table for each: find the same point', P(x, y)] }; },
      ({ ri }) => { const m = ri(2, 5), c = ri(1, 6); return { q: `A line goes through ${P(0, c)} and ${P(1, m + c)}. What is its rule?`, w: [`starts at ${c}, up ${m} for each 1 across`, rule(m, c)] }; },
      ({ ri }) => { const a = ri(2, 4), b = a + ri(1, 3); return { q: `Which line is steeper: ${rule(a, 1)} or ${rule(b, -2)}? Explain.`, a: `${rule(b, -2)}: y goes up by ${b} each step, not ${a}.`, n: 2 }; },
    ],
  },
};
