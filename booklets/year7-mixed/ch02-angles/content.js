// Chapter 2 Angles: mixed-practice questions (lib/mixed.js). Every question stands on its own.
const D = require('../../lib/diagrams');

const cls = (d) => (d < 90 ? 'acute' : d === 90 ? 'right' : d < 180 ? 'obtuse' : d === 180 ? 'straight' : d < 360 ? 'reflex' : 'revolution');
const LET = [...'ABCDEFGHKLMNPQRSTUVWXYZ'];
const three = (pick) => { const s = new Set(); while (s.size < 3) s.add(pick(LET)); return [...s]; };
const four = (pick) => { const s = new Set(); while (s.size < 4) s.add(pick(LET)); return [...s]; };
const i_ = (v) => `<i>${v}</i>`;
const NAMES = ['Ali', 'Mia', 'Zac', 'Lena', 'Kai', 'Ruby', 'Tom', 'Priya', 'Jack', 'Aisha', 'Noah', 'Chloe', 'Leo', 'Sienna'];
// An angle drawn at its true size with 20 mm arms (long enough for a protractor).
const ang = (deg, rot = 0) => {
  const R = 20, rad = (d) => (d * Math.PI) / 180, P = (d, r) => [r * Math.cos(rad(d)), -r * Math.sin(rad(d))];
  const [x1, y1] = P(rot, R), [x2, y2] = P(rot + deg, R);
  const xs = [0, x1, x2], ys = [0, y1, y2];
  for (let d = rot; d <= rot + deg; d += 5) { const [x, y] = P(d, 5); xs.push(x); ys.push(y); }
  const m = 1.5, minX = Math.min(...xs) - m, w = Math.max(...xs) + m - minX, h0 = Math.max(...ys) - Math.min(...ys) + 2 * m, h = Math.max(h0, 14), minY = Math.min(...ys) - m - (h - h0) / 2;
  const [a1, b1] = P(rot, 5), [a2, b2] = P(rot + deg, 5), big = deg > 180 ? 1 : 0;
  return `<svg class="graph" viewBox="0 0 ${w.toFixed(1)} ${h.toFixed(1)}" xmlns="http://www.w3.org/2000/svg"><g transform="translate(${(-minX).toFixed(2)},${(-minY).toFixed(2)})" fill="none" stroke="#3d3b3c" stroke-width="0.45"><path d="M${x1.toFixed(2)},${y1.toFixed(2)} L0,0 L${x2.toFixed(2)},${y2.toFixed(2)}"/><path d="M${a1.toFixed(2)},${b1.toFixed(2)} A5,5 0 ${big} 0 ${a2.toFixed(2)},${b2.toFixed(2)}" stroke="#2f5fd0" stroke-width="0.4"/><circle r="0.6" fill="#3d3b3c"/></g></svg>`;
};
const named = (a, b, c, d1, d2) => D.rays({ rays: [d1, d2], arcs: [{ from: d1, to: d2 }], ends: [a, c], centre: b, w: 34, h: 22, R: 11, cx: 12, cy: 16 });
const fan = (ends, centre, dirs = [0, 50, 110]) => D.rays({ rays: dirs, ends, centre, w: 38, h: 24, R: 13, cx: 15, cy: 19 });
const straight = (g, la, lb) => D.rays({ rays: [0, g, 180], arcs: [{ from: 0, to: g, label: la }, { from: g, to: 180, label: lb, r: 6 }], w: 46, h: 25, cy: 20, R: 17 });
const straight3 = (g1, g2, la, lb, lc) => D.rays({ rays: [0, g1, g1 + g2, 180], arcs: [{ from: 0, to: g1, label: la }, { from: g1, to: g1 + g2, label: lb, r: 7 }, { from: g1 + g2, to: 180, label: lc, r: 5 }], w: 50, h: 27, cy: 22, R: 18 });
const rightSplit = (g, la, lb) => D.rays({ rays: [0, g, 90], arcs: [{ from: 0, to: g, label: la }, { from: g, to: 90, label: lb, r: 8 }], w: 34, h: 30, cx: 8, cy: 25, R: 21 });
const cross = (g, la, lb, lc = '', ld = '') => { const h = g / 2; return D.rays({ rays: [h, 180 + h, 180 - h, 360 - h], arcs: [{ from: 360 - h, to: 360 + h, label: la }, { from: 180 - h, to: 180 + h, label: lb }, ...(lc ? [{ from: h, to: 180 - h, label: lc, r: 5 }] : []), ...(ld ? [{ from: 180 + h, to: 360 - h, label: ld, r: 5 }] : [])], w: 46, h: 30, R: 14 }); };
const atPoint = (angles, labels) => { let d = 0; const dirs = angles.map((a) => { const x = d; d += a; return x; }); return D.rays({ rays: dirs, arcs: dirs.map((x, i) => ({ from: x, to: x + angles[i], label: labels[i], r: 5 + (i % 2) * 2 })), w: 46, h: 34, R: 14 }); };
const space = () => D.drawSpace({ w: 54, h: 24 });
// Parallel lines cut by a transversal: the given angle at one position, the pronumeral at another.
const POS = { corr: { ur: 'ur', ul: 'ul', ll: 'll', lr: 'lr' }, alt: { ll: 'ur', lr: 'ul' }, co: { ll: 'ul', lr: 'ur' } };
const pll = (kind, g, pick, lab = 'a') => {
  const from = pick(Object.keys(POS[kind])), to = POS[kind][from];
  const top = kind === 'corr' ? pick(['top', 'bottom']) : 'top', other = top === 'top' ? 'bottom' : 'top';
  const tilt = from === 'ur' || from === 'll' ? g : 180 - g;
  return D.parallel({ tilt, marks: [{ line: top, pos: from, label: `${g}°` }, { line: kind === 'corr' ? other : 'bottom', pos: to, label: lab }], w: 52, h: 38 });
};
const RULE = { corr: 'corresponding angles are equal', alt: 'alternate angles are equal', co: 'co-interior angles add to 180°' };
const NAME = { corr: 'corresponding', alt: 'alternate', co: 'co-interior' };
const other = (kind, g) => (kind === 'co' ? 180 - g : g);

module.exports = {
  '2.01': {
    idea: 'Name an angle with three letters, with the vertex (the corner) in the middle: ∠ABC has vertex B. Adjacent angles share a vertex and an arm.',
    ex: [['Name the marked angle.', ['vertex in the middle', '∠PQR or ∠RQP'], named('P', 'Q', 'R', 15, 105)], ['Name the vertex and the arms of ∠XYZ.', ['vertex: Y', 'arms: YX and YZ']], ['Name the three angles at O.', ['small: ∠AOB, ∠BOC', 'whole: ∠AOC'], fan(['A', 'B', 'C'], 'O')]],
    e: [
      ({ pick }) => { const [a, b, c] = three(pick); return { q: `Which letter is the vertex of ∠${a}${b}${c}?`, a: b }; },
      ({ pick, ri }) => { const [a, b, c] = three(pick), d1 = ri(0, 3) * 15, d2 = d1 + ri(4, 8) * 15; return { q: 'Name the marked angle with three letters.', fig: named(a, b, c, d1, d2), a: `∠${a}${b}${c} or ∠${c}${b}${a}` }; },
      ({ pick }) => { const [a, b, c] = three(pick); return { q: `Write ∠${a}${b}${c} another way.`, a: `∠${c}${b}${a}` }; },
    ],
    m: [
      ({ pick }) => { const [a, b, c] = three(pick); return { q: `Name the vertex and the two arms of ∠${a}${b}${c}.`, w: [`vertex: ${b}`, `arms: ${b}${a} and ${b}${c}`] }; },
      ({ pick }) => { const [a, b, c, d] = four(pick); return { q: `Name the three angles at ${b}.`, fig: fan([a, c, d], b), w: [`small: ∠${a}${b}${c}, ∠${c}${b}${d}`, `whole: ∠${a}${b}${d}`] }; },
      ({ pick }) => { const [a, b, c, d] = four(pick); return { q: `∠${a}${b}${c} and ∠${c}${b}${d} are adjacent. Name the arm they share.`, a: `${b}${c}` }; },
      ({ pick }) => { const [a, b, c, d] = four(pick); return { q: `Name a pair of adjacent angles in the diagram.`, fig: fan([a, c, d], b), a: `∠${a}${b}${c} and ∠${c}${b}${d}` }; },
    ],
    c: [
      ({ pick, ri }) => { const [p, q, r, s] = four(pick), x = ri(15, 60), y = ri(15, 60); return { q: `∠${p}${q}${r} = ${x}° and ∠${r}${q}${s} = ${y}° are adjacent. They do not overlap. Find ∠${p}${q}${s}.`, w: [`${x}° + ${y}°`, `= ${x + y}°`] }; },
      ({ pick }) => { const [a, b, c, d] = four(pick); const o = pick(['O', 'V', 'J']); return [a, b, c, d].includes(o) ? null : { q: `How many different angles are at ${o}? Name them.`, fig: D.rays({ rays: [0, 40, 85, 140], ends: [a, b, c, d], centre: o, w: 40, h: 25, R: 13, cx: 17, cy: 20 }), w: ['6 angles', `∠${a}${o}${b}, ∠${b}${o}${c}, ∠${c}${o}${d}`, `∠${a}${o}${c}, ∠${b}${o}${d}, ∠${a}${o}${d}`] }; },
      ({ pick }) => { const [a, b, c] = three(pick), [d, e, f] = three(pick); return b === e ? null : { q: `Are ∠${a}${b}${c} and ∠${d}${e}${f} adjacent? Explain.`, a: `No. They have different vertices (${b} and ${e}).`, n: 2 }; },
    ],
  },

  '2.02': {
    idea: 'Put the centre of the protractor on the vertex. Line up 0° with one arm, then count up from 0° on that scale. For a reflex angle, measure the angle inside and take it from 360°.',
    ex: [['Measure the angle.', ['0° on the bottom arm', '= 55°'], ang(55)], ['Draw an angle of 130° on the ray.', ['centre on the end, 0° on the ray', 'mark 130°, rule the arm'], space()], ['How do you draw a reflex angle of 250°?', ['360° − 250° = 110°', 'draw 110°, mark the outside']]],
    e: [
      ({ ri, pick }) => { const d = ri(3, 33) * 5; return { q: 'Measure the angle.', fig: ang(d, pick([0, 0, 20, 40])), fh: 22, a: `${d}°` }; },
      ({ ri }) => { const d = ri(37, 71) * 5; return { q: `To draw a reflex angle of ${d}°, what angle do you draw first?`, w: [`360° − ${d}°`, `= ${360 - d}°`] }; },
      ({ ri }) => { const d = ri(3, 33) * 5; return d === 90 ? null : { q: `Is ${d}° more or less than a right angle?`, a: d > 90 ? 'more' : 'less' }; },
    ],
    m: [
      ({ ri, pick }) => { const d = ri(3, 33) * 5 + ri(1, 4); return { q: 'Estimate the angle. Then measure it.', fig: ang(d, pick([0, 30])), fh: 22, w: [`estimate: about ${Math.round(d / 10) * 10}°`, `measure: ${d}°`] }; },
      ({ ri }) => { const d = ri(4, 34) * 5; return { q: `Draw an angle of ${d}° on the ray.`, fig: space(), n: 0, a: `${d}° (check with a protractor)` }; },
      ({ ri }) => { const d = ri(38, 68) * 5; return { q: 'Measure the reflex angle (the one marked outside).', fig: ang(d, 0), fh: 24, w: [`inside angle: ${360 - d}°`, `360° − ${360 - d}° = ${d}°`] }; },
    ],
    c: [
      ({ ri }) => { const d = ri(38, 68) * 5; return { q: `Draw a reflex angle of ${d}° on the ray.`, fig: space(), n: 0, w: [`360° − ${d}° = ${360 - d}°`, `draw ${360 - d}°, mark the outside`] }; },
      ({ ri }) => { const e = ri(4, 16) * 5; return { q: `An angle is ${e}° less than a revolution. Find its size and classify it.`, w: [`360° − ${e}° = ${360 - e}°`, `${360 - e}° is reflex`] }; },
      ({ ri }) => { const a = ri(1, 5), b = ri(a + 2, 11); return { q: `The minute hand turns from ${a} to ${b} on a clock. Through what angle does it turn?`, w: [`each number: 360° ÷ 12 = 30°`, `${b - a} × 30° = ${(b - a) * 30}°`] }; },
      ({ ri, pick }) => { const d = ri(4, 16) * 5, who = pick(NAMES); return { q: `${who} measured an angle as ${180 - d}°, but it is clearly acute. What mistake was made? What is the angle?`, a: `Read the wrong scale. The angle is ${d}°.`, n: 2 }; },
    ],
  },

  '2.03': {
    idea: 'Acute: less than 90°. Right: 90°. Obtuse: between 90° and 180°. Straight: 180°. Reflex: between 180° and 360°. Revolution: 360°.',
    ex: [['Classify 135°.', ['between 90° and 180°', 'obtuse']], ['Classify 270°.', ['between 180° and 360°', 'reflex']], ['Classify the angle between the clock hands at 4:00.', ['4 × 30° = 120°', 'obtuse']]],
    look: ['2.02'],
    e: [
      ({ ri, pick }) => { const d = pick([ri(1, 17) * 5, ri(19, 35) * 5, ri(37, 71) * 5, 90, 180, 360]); return { q: `Classify an angle of ${d}°.`, a: cls(d) }; },
      ({ ri, pick }) => { const d = pick([ri(2, 16) * 5, 90, ri(20, 34) * 5]); return { q: 'Classify the angle.', fig: ang(d, pick([0, 20])), fh: 20, a: cls(d) }; },
      ({ pick }) => { const t = pick(['acute', 'obtuse', 'reflex']); return { q: `Write the size of any ${t} angle.`, a: { acute: 'between 0° and 90°', obtuse: 'between 90° and 180°', reflex: 'between 180° and 360°' }[t] }; },
    ],
    m: [
      ({ ri }) => { const a = ri(2, 40) * 5, b = ri(2, 40) * 5; return a + b > 360 ? null : { q: `Add the angles, then classify the total: ${a}° + ${b}°`, w: [`${a}° + ${b}° = ${a + b}°`, `${cls(a + b)}`] }; },
      ({ ri }) => { const h = ri(1, 11), d = Math.min(h, 12 - h) * 30; return { q: `Find the angle between the clock hands at ${h}:00. Classify it.`, w: [`${Math.min(h, 12 - h)} × 30° = ${d}°`, cls(d)] }; },
      ({ ri, pick }) => { const x = ri(2, 17) * 5, [n, v] = pick([['a right angle', 90], ['a straight angle', 180]]); return { q: `Find ${n} plus ${x}°. Classify it.`, w: [`${v}° + ${x}° = ${v + x}°`, cls(v + x)] }; },
      ({ ri }) => { const d = ri(38, 70) * 5; return { q: `A reflex angle is ${d}°. Find the other angle at the vertex and classify it.`, w: [`360° − ${d}° = ${360 - d}°`, cls(360 - d)] }; },
    ],
    c: [
      ({ pick }) => { const [q, a] = pick([['Can two acute angles add to a reflex angle? Explain.', 'No. Each is less than 90°, so the total is less than 180°.'], ['Can two obtuse angles add to a reflex angle? Explain.', 'Yes. Each is more than 90°, so the total is more than 180°.'], ['Can an obtuse angle and an acute angle add to a right angle? Explain.', 'No. The obtuse angle alone is more than 90°.']]); return { q, a, n: 2 }; },
      ({ pick }) => { const [t, k, v] = pick([['two right angles', 2, 90], ['three right angles', 3, 90], ['one and a half right angles', 1.5, 90], ['three angles of 60° together', 3, 60], ['five angles of 45° together', 5, 45]]); const d = k * v; return { q: `An angle is the size of ${t}. Find its size and classify it.`, w: [`${k} × ${v}° = ${d}°`, cls(d)], key: t }; },
      ({ ri }) => { const n = ri(3, 8); return 360 % n ? null : { q: `A revolution is cut into ${n} equal angles. Find one angle and classify it.`, w: [`360° ÷ ${n} = ${360 / n}°`, cls(360 / n)] }; },
      ({ ri }) => { const h = ri(1, 5), d = h * 30; return { q: `The hands of a clock show ${h}:00. Find the reflex angle between them.`, w: [`small angle: ${d}°`, `360° − ${d}° = ${360 - d}°`] }; },
    ],
  },

  '2.04': {
    idea: 'Complementary angles add to 90°. Supplementary angles add to 180°. To find the missing angle, take it away from 90° or from 180°.',
    ex: [['Find the complement of 35°.', ['90° − 35°', '= 55°']], ['Find the supplement of 112°.', ['180° − 112°', '= 68°']], ['Find x.', ['3x + 60 = 180', '3x = 120', 'x = 40'], straight(60, '60°', '3x°')]],
    look: ['2.03'],
    e: [
      ({ ri }) => { const d = ri(5, 85); return { q: `Find the complement of ${d}°.`, a: `${90 - d}°` }; },
      ({ ri }) => { const d = ri(5, 175); return { q: `Find the supplement of ${d}°.`, a: `${180 - d}°` }; },
      ({ ri, pick }) => { const a = ri(10, 80), b = pick([90 - a, 90 - a, 100 - a]); return { q: `Are ${a}° and ${b}° complementary?`, a: a + b === 90 ? 'yes' : `no (they add to ${a + b}°)` }; },
      ({ ri }) => { const g = ri(5, 31) * 5; return { q: `Find ${i_('a')}.`, fig: straight(g, `${g}°`, 'a'), fh: 18, a: `a = ${180 - g}` }; },
    ],
    m: [
      ({ ri, pick }) => { const v = pick(['x', 'y', 'm']), a = ri(10, 80); return { q: `${i_(v)}° and ${a}° are complementary. Find ${i_(v)}.`, w: [`${v} + ${a} = 90`, `${v} = ${90 - a}`] }; },
      ({ ri, pick }) => { const v = pick(['x', 'p', 'k']), a = ri(10, 170); return { q: `${i_(v)}° and ${a}° are supplementary. Find ${i_(v)}.`, w: [`${v} + ${a} = 180`, `${v} = ${180 - a}`] }; },
      ({ ri }) => { const g = ri(3, 16) * 5; return { q: `Find ${i_('b')}.`, fig: rightSplit(g, `${g}°`, 'b'), fh: 22, w: [`b + ${g} = 90`, `b = ${90 - g}`] }; },
      ({ ri, pick }) => { const a = ri(20, 160), b = pick([180 - a, 180 - a, 190 - a]); return { q: `Are ${a}° and ${b}° supplementary? Explain.`, a: a + b === 180 ? `Yes. ${a} + ${b} = 180.` : `No. ${a} + ${b} = ${a + b}, not 180.` }; },
    ],
    c: [
      ({ ri }) => { const x = ri(8, 25) * 2, g = 180 - 3 * x; return g <= 10 ? null : { q: `Find ${i_('x')}.`, fig: straight(g, `${g}°`, '3x°'), fh: 20, w: [`3x + ${g} = 180`, `3x = ${180 - g}`, `x = ${x}`] }; },
      ({ ri }) => { const k = ri(1, 4) * 10, x = (90 - k) / 2; return { q: `Find ${i_('x')}.`, fig: rightSplit(x, 'x°', `(x + ${k})°`), fh: 22, w: [`x + x + ${k} = 90`, `2x = ${90 - k}`, `x = ${x}`] }; },
      ({ pick }) => { const [k, word, total] = pick([[2, 'twice', 90], [2, 'twice', 180], [3, 'three times', 180], [5, 'five times', 180], [4, 'four times', 90]]); const x = (k * total) / (k + 1); return Number.isInteger(x) ? { q: `An angle is ${word} its ${total === 90 ? 'complement' : 'supplement'}. Find the angle.`, w: [`x = ${k}(${total} − x)`, `${k + 1}x = ${k * total}`, `x = ${x}°`] } : null; },
      ({ ri }) => { const a = ri(10, 80); return { q: `Find the supplement of the complement of ${a}°.`, w: [`complement: ${90 - a}°`, `supplement: 180° − ${90 - a}° = ${90 + a}°`] }; },
    ],
  },

  '2.05': {
    idea: 'Angles on a straight line add to 180°. Angles at a point add to 360°. Vertically opposite angles are equal.',
    ex: [['Find a.', ['a + 125 = 180', 'a = 55'], straight(125, '125°', 'a')], ['Find b.', ['b + 130 + 110 = 360', 'b = 120'], atPoint([130, 110, 120], ['130°', '110°', 'b'])], ['Find c. Give a reason.', ['c = 70', 'vertically opposite angles'], cross(70, '70°', 'c')]],
    look: ['2.04'],
    e: [
      ({ ri }) => { const g = ri(5, 31) * 5; return { q: `Find ${i_('a')}.`, fig: straight(g, `${g}°`, 'a'), fh: 18, a: `a = ${180 - g}` }; },
      ({ ri }) => { const g = ri(8, 28) * 5; return { q: `Find ${i_('b')}.`, fig: cross(g, `${g}°`, 'b'), fh: 20, a: `b = ${g}` }; },
      ({ ri }) => { const a = ri(8, 20) * 5, b = ri(8, 20) * 5; return { q: `Angles at a point are ${a}°, ${b}° and ${i_('c')}°. Find ${i_('c')}.`, w: [`c = 360 − ${a} − ${b}`, `c = ${360 - a - b}`] }; },
    ],
    m: [
      ({ ri }) => { const b = ri(8, 26) * 5, c = ri(8, 26) * 5, a = 360 - b - c; return a < 40 ? null : { q: `Find ${i_('a')}.`, fig: atPoint([b, c, a], [`${b}°`, `${c}°`, 'a']), fh: 22, w: [`a + ${b} + ${c} = 360`, `a = ${a}`] }; },
      ({ ri }) => { const g1 = ri(4, 12) * 5, g2 = ri(4, 12) * 5; return g1 + g2 > 150 ? null : { q: `Find ${i_('c')}.`, fig: straight3(g1, g2, `${g1}°`, `${g2}°`, 'c'), fh: 20, w: [`c + ${g1} + ${g2} = 180`, `c = ${180 - g1 - g2}`] }; },
      ({ ri }) => { const g = ri(8, 28) * 5; return { q: `Find ${i_('a')}, ${i_('b')} and ${i_('c')}.`, fig: cross(g, `${g}°`, 'b', 'a', 'c'), fh: 22, w: [`b = ${g} (vert. opp.)`, `a = 180 − ${g} = ${180 - g}`, `c = ${180 - g} (vert. opp.)`] }; },
    ],
    c: [
      ({ pick }) => { const [k1, k2, k3] = pick([[1, 2, 3], [2, 3, 4], [1, 3, 5], [1, 1, 2], [2, 2, 5]]); const s = k1 + k2 + k3; return 360 % s ? null : { q: `Angles at a point are ${k1 === 1 ? '' : k1}${i_('x')}°, ${k2 === 1 ? '' : k2}${i_('x')}° and ${k3}${i_('x')}°. Find ${i_('x')}.`, w: [`${s}x = 360`, `x = ${360 / s}`] }; },
      ({ ri }) => { const x = ri(10, 40), k = ri(1, 6) * 5, g = 2 * x + k; return g >= 170 ? null : { q: `Vertically opposite angles are (2${i_('x')} + ${k})° and ${g}°. Find ${i_('x')}.`, w: [`2x + ${k} = ${g}`, `2x = ${g - k}`, `x = ${x}`] }; },
      ({ ri }) => { const x = ri(5, 30) * 2, g = 180 - 4 * x; return g <= 10 ? null : { q: `On a straight line, the angles are ${g}°, ${i_('x')}° and 3${i_('x')}°. Find ${i_('x')}.`, w: [`4x + ${g} = 180`, `4x = ${180 - g}`, `x = ${x}`] }; },
      ({ ri, pick }) => { const g = ri(8, 28) * 5, who = pick(NAMES); return { q: `${who} says the angle next to a ${g}° angle on a straight line is also ${g}°. Is that right? Explain.`, a: `No. Angles on a straight line add to 180°, so it is ${180 - g}°.`, n: 2 }; },
    ],
  },

  '2.06': {
    idea: 'Parallel lines (∥) never meet: they stay the same distance apart. Perpendicular lines (⊥) meet at a right angle.',
    ex: [['Write with a symbol: AB is perpendicular to CD.', ['⊥ means perpendicular', 'AB ⊥ CD']], ['Name the parallel sides of rectangle PQRS.', ['opposite sides', 'PQ ∥ SR, PS ∥ QR'], D.polygon({ pts: [[9, 7], [45, 7], [45, 23], [9, 23]], vlabels: ['P', 'Q', 'R', 'S'], right: [0, 1, 2, 3], w: 54, h: 30 })], ['Construct a line perpendicular to AB through P, a point on AB.', ['arcs on AB either side of P', 'equal arcs cross; rule from P']]],
    e: [
      ({ pick }) => { const [a, b, c, d] = four(pick); return pick([0, 1]) ? { q: `Write with a symbol: ${a}${b} is parallel to ${c}${d}.`, a: `${a}${b} ∥ ${c}${d}` } : { q: `Write with a symbol: ${a}${b} is perpendicular to ${c}${d}.`, a: `${a}${b} ⊥ ${c}${d}` }; },
      (K, i) => { const L = [['train tracks', 'parallel'], ['the letter T', 'perpendicular'], ['the letter X', 'neither'], ['an equals sign', 'parallel'], ['a plus sign', 'perpendicular'], ['the letter V', 'neither'], ['the two sides of the letter H', 'parallel'], ['the letter L', 'perpendicular'], ['a wall and the floor', 'perpendicular'], ['lines on ruled paper', 'parallel'], ['the letter K', 'neither'], ['the long edges of a ruler', 'parallel']]; const x = L[i % L.length]; return { q: `Are the lines in ${x[0]} parallel, perpendicular or neither?`, a: x[1] }; },
      ({ pick }) => { const [a, b, c, d] = four(pick), s = pick(['∥', '⊥']); return { q: `Write in words: ${a}${b} ${s} ${c}${d}`, a: `${a}${b} is ${s === '∥' ? 'parallel' : 'perpendicular'} to ${c}${d}` }; },
    ],
    m: [
      ({ pick }, i) => {
        const [a, b, c, d] = pick([['A', 'B', 'C', 'D'], ['P', 'Q', 'R', 'S'], ['E', 'F', 'G', 'H'], ['K', 'L', 'M', 'N'], ['W', 'X', 'Y', 'Z']]);
        const S = [
          ['rectangle', [[4, 4], [40, 4], [40, 20], [4, 20]], [0, 1, 2, 3], `${a}${b} ∥ ${d}${c}, ${a}${d} ∥ ${b}${c}`, `every corner, e.g. ${a}${b} ⊥ ${b}${c}`],
          ['parallelogram', [[10, 4], [44, 4], [36, 20], [2, 20]], [], `${a}${b} ∥ ${d}${c}, ${a}${d} ∥ ${b}${c}`, 'none'],
          ['right trapezium', [[4, 4], [30, 4], [42, 20], [4, 20]], [0, 3], `${a}${b} ∥ ${d}${c}`, `${a}${d} ⊥ ${a}${b}, ${a}${d} ⊥ ${d}${c}`],
          ['trapezium', [[12, 4], [32, 4], [42, 20], [2, 20]], [], `${a}${b} ∥ ${d}${c}`, 'none'],
        ][i % 4];
        return { q: `Name the parallel sides and the perpendicular sides of ${S[0]} ${a}${b}${c}${d}.`, fig: D.polygon({ pts: S[1].map(([x, y]) => [x + 5, y + 3]), vlabels: [a, b, c, d], right: S[2], w: 56, h: 30 }), w: [`∥: ${S[3]}`, `⊥: ${S[4]}`] };
      },
      ({ pick }) => { const [a, b, c, d] = four(pick); return { q: `${a}${b} ⊥ ${c}${d}. What size is the angle where they meet?`, a: '90°' }; },
      ({ pick }) => { const [x, y] = pick([['parallel', 'never meet'], ['perpendicular', 'meet at 90°']]); return { q: `Draw two lines that are ${x}. Mark them with the right symbol.`, fig: D.drawSpace({ w: 54, h: 22, ray: false }), n: 0, a: `two lines that ${y}, marked ${x === 'parallel' ? 'with arrows' : 'with a right-angle mark'}` }; },
    ],
    c: [
      ({ pick }) => { const [a, b] = pick([['A', 'B'], ['P', 'Q'], ['M', 'N']]), p = pick(['T', 'W', 'V']); return { q: `Write the steps to construct a line perpendicular to ${a}${b} through the point ${p} on ${a}${b}.`, w: [`compasses at ${p}: mark two points on ${a}${b}`, 'from each point, equal arcs that cross', `rule from ${p} through the crossing`], key: 'construct perpendicular' }; },
      () => ({ q: 'Construct a line perpendicular to the ray at its end point. Use compasses.', fig: D.drawSpace({ w: 54, h: 30 }), n: 0, a: 'a line at 90° to the ray through its end point (check with a set square)' }),
      ({ pick }) => { const [a, b] = pick([['A', 'B'], ['P', 'Q'], ['M', 'N']]), p = pick(['T', 'W', 'V']); return { q: `Write the steps to construct a line parallel to ${a}${b} through the point ${p}, which is not on ${a}${b}.`, w: [`rule a line through ${p} that cuts ${a}${b}`, `copy the angle it makes at ${p}`, `rule the new arm: it is ∥ to ${a}${b}`], key: 'construct parallel' }; },
      ({ pick }) => { const [s1, s2, ans] = pick([['⊥', '⊥', '∥'], ['∥', '∥', '∥'], ['∥', '⊥', '⊥']]); return { q: `AB ${s1} CD and CD ${s2} EF. What can you say about AB and EF?`, a: `AB ${ans} EF`, n: 2, key: `logic ${s1}${s2}` }; },
      ({ pick }) => { const [a, b] = pick([['A', 'B'], ['P', 'Q'], ['C', 'D']]); return { q: `Write the steps to construct the perpendicular bisector of the interval ${a}${b}.`, w: [`compasses more than half of ${a}${b}`, `arcs from ${a} and from ${b}, above and below`, 'rule through the two crossings'], key: 'construct bisector' }; },
      ({ pick }) => { const [a, b, c, d] = pick([['A', 'B', 'C', 'D'], ['P', 'Q', 'R', 'S'], ['W', 'X', 'Y', 'Z']]); return { q: `In rectangle ${a}${b}${c}${d}, which sides are perpendicular to ${a}${b}? Which side is parallel to ${a}${b}?`, w: [`⊥ to ${a}${b}: ${a}${d} and ${b}${c}`, `∥ to ${a}${b}: ${d}${c}`] }; },
      () => ({ q: 'Through a point P, how many lines can you draw that are parallel to a line AB?', a: 'one', key: 'one parallel' }),
    ],
  },

  '2.07': {
    idea: 'When a line crosses two parallel lines, corresponding angles are equal. They are in the same position at each crossing: look for an F shape.',
    ex: [['The lines are parallel. Find a.', ['corresponding angles are equal', 'a = 70'], D.parallel({ tilt: 70, marks: [{ line: 'top', pos: 'ur', label: '70°' }, { line: 'bottom', pos: 'ur', label: 'a' }], w: 52, h: 38 })], ['Find b, the angle next to a on the line.', ['b + 70 = 180 (straight line)', 'b = 110']], ['Corresponding angles are (2x + 10)° and 70°. Find x.', ['2x + 10 = 70', '2x = 60', 'x = 30']]],
    look: ['2.05'],
    e: [
      ({ ri, pick }) => { const g = ri(5, 31) * 5; return { q: `The lines are parallel. Find ${i_('a')}.`, fig: pll('corr', g, pick), fh: 30, a: `a = ${g}` }; },
      ({ ri }) => { const d = ri(20, 160); return { q: `The lines are parallel. An angle is ${d}°. What is its corresponding angle?`, a: `${d}°` }; },
      ({ ri, pick }) => { const g = ri(8, 28) * 5, [p, q] = pick([['p', 'q'], ['q', 'p']]); return { q: `The lines are parallel. Which angle, ${i_('p')} or ${i_('q')}, corresponds to the ${g}° angle?`, fig: D.parallel({ tilt: g, marks: [{ line: 'top', pos: 'ur', label: `${g}°` }, { line: 'bottom', pos: 'ur', label: p }, { line: 'bottom', pos: 'ul', label: q }], w: 52, h: 38 }), fh: 30, a: p }; },
    ],
    m: [
      ({ ri }) => { const g = ri(5, 31) * 5; return { q: `${i_('a')} is corresponding to ${g}°, and ${i_('b')} is next to ${i_('a')} on a straight line. Find ${i_('a')} and ${i_('b')}.`, w: [`a = ${g} (corresponding)`, `b = 180 − ${g} = ${180 - g}`] }; },
      ({ ri, pick }) => { const g = ri(5, 31) * 5; return { q: `Find ${i_('a')}. Give a reason.`, fig: pll('corr', g, pick), fh: 30, w: [`a = ${g}`, 'corresponding angles, ∥ lines'] }; },
      ({ ri }) => { const x = ri(5, 35), c = ri(1, 6) * 5, g = x + c; return { q: `Corresponding angles are (${i_('x')} + ${c})° and ${g}°. Find ${i_('x')}.`, w: [`x + ${c} = ${g}`, `x = ${x}`] }; },
    ],
    c: [
      ({ ri }) => { const x = ri(5, 35), m = ri(2, 4), c = ri(1, 6) * 5, g = m * x + c; return g >= 175 ? null : { q: `Corresponding angles are (${m}${i_('x')} + ${c})° and ${g}°. Find ${i_('x')}.`, w: [`${m}x + ${c} = ${g}`, `${m}x = ${g - c}`, `x = ${x}`] }; },
      ({ ri }) => { const g = ri(8, 28) * 5; return { q: `Find ${i_('y')}, then ${i_('x')}. Give reasons.`, fig: D.parallel({ tilt: g, marks: [{ line: 'top', pos: 'ur', label: `${g}°` }, { line: 'top', pos: 'ul', label: 'y' }, { line: 'bottom', pos: 'ul', label: 'x' }], w: 52, h: 38 }), fh: 30, w: [`y = 180 − ${g} = ${180 - g} (straight)`, `x = ${180 - g} (corresponding)`] }; },
      ({ ri, pick }) => { const g = ri(5, 31) * 5, who = pick(NAMES); return { q: `${who} says corresponding angles always add to 180°. Is that right? Explain.`, a: 'No. Corresponding angles on parallel lines are equal.', n: 2, key: 'claim 2.07' }; },
    ],
  },

  '2.08': {
    idea: 'Alternate angles are between the parallel lines, on opposite sides of the line that crosses them. They are equal: look for a Z shape.',
    ex: [['The lines are parallel. Find a.', ['alternate angles are equal', 'a = 50'], D.parallel({ tilt: 50, marks: [{ line: 'top', pos: 'll', label: '50°' }, { line: 'bottom', pos: 'ur', label: 'a' }], w: 52, h: 38 })], ['a is alternate to 115°. Find a, then b next to it on the line.', ['a = 115 (alternate)', 'b = 180 − 115 = 65']], ['Alternate angles are (3x − 15)° and 60°. Find x.', ['3x − 15 = 60', '3x = 75', 'x = 25']]],
    look: ['2.07'],
    e: [
      ({ ri, pick }) => { const g = ri(5, 31) * 5; return { q: `The lines are parallel. Find ${i_('a')}.`, fig: pll('alt', g, pick), fh: 30, a: `a = ${g}` }; },
      ({ ri }) => { const d = ri(20, 160); return { q: `The lines are parallel. What is the alternate angle to ${d}°?`, a: `${d}°` }; },
      ({ pick }) => { const [q, a] = pick([['Are alternate angles between the parallel lines or outside them?', 'between them'], ['Are alternate angles on the same side of the crossing line, or on opposite sides?', 'opposite sides'], ['What letter shape do alternate angles make?', 'Z (or N)']]); return { q, a }; },
    ],
    m: [
      ({ ri }) => { const g = ri(5, 31) * 5; return { q: `${i_('a')} is alternate to ${g}°, and ${i_('b')} is next to ${i_('a')} on the line. Find ${i_('a')} and ${i_('b')}.`, w: [`a = ${g} (alternate)`, `b = 180 − ${g} = ${180 - g}`] }; },
      ({ ri, pick }) => { const g = ri(5, 31) * 5; return { q: `Find ${i_('a')}. Give a reason.`, fig: pll('alt', g, pick), fh: 30, w: [`a = ${g}`, 'alternate angles, ∥ lines'] }; },
      ({ ri }) => { const x = ri(10, 60), c = ri(1, 6) * 5, g = x - c; return { q: `Alternate angles are (${i_('x')} − ${c})° and ${g}°. Find ${i_('x')}.`, w: [`x − ${c} = ${g}`, `x = ${x}`] }; },
    ],
    c: [
      ({ ri }) => { const x = ri(10, 35), m = ri(2, 4), c = ri(1, 6) * 5, g = m * x - c; return g <= 10 || g >= 175 ? null : { q: `Alternate angles are (${m}${i_('x')} − ${c})° and ${g}°. Find ${i_('x')}.`, w: [`${m}x − ${c} = ${g}`, `${m}x = ${g + c}`, `x = ${x}`] }; },
      ({ ri, pick }) => { const k = pick(['alt', 'corr']), g = ri(5, 31) * 5; return { q: `Find ${i_('a')}. Is it a corresponding or an alternate angle?`, fig: pll(k, g, pick), fh: 30, w: [`a = ${g}`, NAME[k]] }; },
      ({ ri }) => { const g = ri(8, 28) * 5; return { q: `Find ${i_('p')}, then ${i_('q')}. Give reasons.`, fig: D.parallel({ tilt: g, marks: [{ line: 'top', pos: 'lr', label: `${180 - g}°` }, { line: 'bottom', pos: 'ul', label: 'p' }, { line: 'bottom', pos: 'ur', label: 'q' }], w: 52, h: 38 }), fh: 30, w: [`p = ${180 - g} (alternate)`, `q = 180 − ${180 - g} = ${g} (straight)`] }; },
    ],
  },

  '2.09': {
    idea: 'Co-interior angles are between the parallel lines, on the same side of the line that crosses them. They add to 180°: look for a C shape.',
    ex: [['The lines are parallel. Find a.', ['a + 110 = 180 (co-interior)', 'a = 70'], D.parallel({ tilt: 70, marks: [{ line: 'top', pos: 'll', label: '110°' }, { line: 'bottom', pos: 'ul', label: 'a' }], w: 52, h: 38 })], ['a is co-interior to 65°. Find a.', ['a + 65 = 180', 'a = 115']], ['Co-interior angles are y° and 2y°. Find y.', ['y + 2y = 180', '3y = 180', 'y = 60']]],
    look: ['2.08', '2.07'],
    e: [
      ({ ri, pick }) => { const g = ri(5, 31) * 5; return { q: `The lines are parallel. Find ${i_('a')}.`, fig: pll('co', g, pick), fh: 30, a: `a = ${180 - g}` }; },
      ({ ri }) => { const d = ri(20, 160); return { q: `The lines are parallel. What is the co-interior angle to ${d}°?`, w: [`180° − ${d}°`, `= ${180 - d}°`] }; },
      ({ pick }) => { const [q, a] = pick([['Do co-interior angles add to 90°, add to 180°, or are they equal?', 'add to 180°'], ['What letter shape do co-interior angles make?', 'C (or U)'], ['Are co-interior angles on the same side of the crossing line?', 'yes']]); return { q, a }; },
    ],
    m: [
      ({ ri }) => { const g = ri(20, 160); return { q: `${i_('a')} is co-interior to ${g}°. Write an equation and find ${i_('a')}.`, w: [`a + ${g} = 180`, `a = ${180 - g}`] }; },
      ({ ri, pick }) => { const g = ri(5, 31) * 5; return { q: `Find ${i_('a')}. Give a reason.`, fig: pll('co', g, pick), fh: 30, w: [`a = 180 − ${g} = ${180 - g}`, 'co-interior angles, ∥ lines'] }; },
      ({ ri, pick }) => { const a = ri(30, 150), b = pick([180 - a, 180 - a, 170 - a]); return { q: `Can ${a}° and ${b}° be co-interior angles on parallel lines? Explain.`, a: a + b === 180 ? `Yes. ${a} + ${b} = 180.` : `No. ${a} + ${b} = ${a + b}, not 180.`, n: 2 }; },
    ],
    c: [
      ({ pick }) => { const m = pick([2, 3, 4, 5, 8, 9]); const y = 180 / (m + 1); return { q: `Co-interior angles are ${i_('y')}° and ${m}${i_('y')}°. Find ${i_('y')} and both angles.`, w: [`y + ${m}y = 180`, `${m + 1}y = 180, so y = ${y}`, `angles: ${y}° and ${m * y}°`] }; },
      ({ ri }) => { const x = ri(10, 40), c = ri(1, 4) * 10, g = 180 - (2 * x + c); return g <= 10 ? null : { q: `Co-interior angles are (2${i_('x')} + ${c})° and ${g}°. Find ${i_('x')}.`, w: [`2x + ${c} + ${g} = 180`, `2x = ${180 - c - g}`, `x = ${x}`] }; },
      ({ ri, pick }) => { const k = pick(['alt', 'co', 'corr']), g = ri(5, 31) * 5; return { q: `Find ${i_('a')}. Name the angle pair.`, fig: pll(k, g, pick), fh: 30, w: [`a = ${other(k, g)}`, NAME[k]] }; },
    ],
  },

  '2.10': {
    idea: 'To find an unknown angle on parallel lines: spot the pair (F corresponding, Z alternate, C co-interior), use the rule, and give the reason.',
    ex: [['Which rule? Find a.', ['Z shape: alternate', 'a = 65'], D.parallel({ tilt: 65, marks: [{ line: 'top', pos: 'll', label: '65°' }, { line: 'bottom', pos: 'ur', label: 'a' }], w: 52, h: 38 })], ['Find b. Give a reason.', ['C shape: co-interior', 'b = 180 − 65 = 115'], D.parallel({ tilt: 65, marks: [{ line: 'top', pos: 'll', label: '65°' }, { line: 'bottom', pos: 'ul', label: 'b' }], w: 52, h: 38 })], ['Find y, then x. Give reasons.', ['y = 180 − 50 = 130 (straight)', 'x = 130 (corresponding)'], D.parallel({ tilt: 50, marks: [{ line: 'top', pos: 'ur', label: '50°' }, { line: 'top', pos: 'ul', label: 'y' }, { line: 'bottom', pos: 'ul', label: 'x' }], w: 52, h: 38 })]],
    look: ['2.09', '2.08', '2.07'],
    e: [
      (K, i) => { const L = [['an F shape', 'corresponding'], ['a Z shape', 'alternate'], ['a C shape', 'co-interior'], ['angles in the same position at each crossing', 'corresponding'], ['angles between the lines, on opposite sides', 'alternate'], ['angles between the lines, on the same side', 'co-interior']]; const x = L[i % L.length]; return { q: `Which angle pair is ${x[0]}?`, a: x[1] }; },
      ({ ri, pick }, i) => { const k = ['corr', 'alt', 'co'][i % 3], g = ri(5, 31) * 5; return { q: `The lines are parallel. Find ${i_('a')}.`, fig: pll(k, g, pick), fh: 30, a: `a = ${other(k, g)}` }; },
      ({ pick }) => { const k = pick(['corr', 'alt', 'co']); return { q: `Complete the rule: ${NAME[k]} angles on parallel lines …`, a: RULE[k].replace(/^\S+ angles /, '') }; },
    ],
    m: [
      ({ ri, pick }, i) => { const k = ['co', 'alt', 'corr'][i % 3], g = ri(5, 31) * 5; return { q: `Find ${i_('a')}. Write the rule you used.`, fig: pll(k, g, pick), fh: 30, w: [k === 'co' ? `a = 180 − ${g} = ${180 - g}` : `a = ${g}`, RULE[k]] }; },
      ({ ri }) => { const g = ri(8, 28) * 5; return { q: `Find ${i_('y')}, then ${i_('x')}. Give reasons.`, fig: D.parallel({ tilt: g, marks: [{ line: 'top', pos: 'ur', label: `${g}°` }, { line: 'top', pos: 'ul', label: 'y' }, { line: 'bottom', pos: 'ul', label: 'x' }], w: 52, h: 38 }), fh: 30, w: [`y = 180 − ${g} = ${180 - g} (straight)`, `x = ${180 - g} (corresponding)`] }; },
      ({ ri, pick }) => { const k = pick(['alt', 'co']), g = ri(20, 160); return { q: `${i_('m')} and ${g}° are ${NAME[k]} angles on parallel lines. Find ${i_('m')}.`, w: [k === 'co' ? `m + ${g} = 180` : `m = ${g}`, `m = ${other(k, g)}`] }; },
    ],
    c: [
      ({ ri }) => { const g = ri(8, 28) * 5; return { q: `Find ${i_('p')} and ${i_('q')}. Give a reason for each.`, fig: D.parallel({ tilt: g, marks: [{ line: 'top', pos: 'ur', label: `${g}°` }, { line: 'bottom', pos: 'll', label: 'p' }, { line: 'bottom', pos: 'ul', label: 'q' }], w: 52, h: 38 }), fh: 30, w: [`p = ${g} (corresponding, then vert. opp.)`, `q = 180 − ${g} = ${180 - g} (straight line)`] }; },
      ({ ri }) => { const x = ri(10, 35), g = 3 * x + 15; return g >= 175 ? null : { q: `Alternate angles on parallel lines are (3${i_('x')} + 15)° and ${g}°. Find ${i_('x')}.`, w: [`3x + 15 = ${g}`, `3x = ${g - 15}`, `x = ${x}`] }; },
      ({ ri, pick }) => { const g = ri(5, 31) * 5, k = pick(['co', 'alt']), who = pick(NAMES); const wrong = k === 'co' ? g : 180 - g; return { q: `The angles are ${NAME[k]}. ${who} says ${i_('a')} = ${wrong} when the other angle is ${g}°. Is that right? Explain.`, a: `No. ${k === 'co' ? `Co-interior angles add to 180°, so a = ${180 - g}.` : `Alternate angles are equal, so a = ${g}.`}`, n: 2 }; },
    ],
  },

  '2.11': {
    idea: 'Two lines are parallel if corresponding angles are equal, or alternate angles are equal, or co-interior angles add to 180°.',
    ex: [['Alternate angles are 64° and 64°. Is AB ∥ CD?', ['64 = 64', 'yes: alternate angles are equal']], ['Co-interior angles are 105° and 85°. Is AB ∥ CD?', ['105 + 85 = 190', 'no: they do not add to 180°']], ['Co-interior angles are 2x° and 120°. Find x so that AB ∥ CD.', ['2x + 120 = 180', '2x = 60', 'x = 30']]],
    look: ['2.10', '2.09'],
    e: [
      ({ ri, pick }) => { const k = pick(['corresponding', 'alternate', 'co-interior']), a = ri(6, 30) * 5, b = k === 'co-interior' ? pick([180 - a, 180 - a, a + 5]) : pick([a, a, a + 5, 180 - a]); return a === 90 ? null : { q: `${k[0].toUpperCase() + k.slice(1)} angles are ${a}° and ${b}°. Is AB ∥ CD?`, a: (k === 'co-interior' ? a + b === 180 : a === b) ? 'yes' : 'no' }; },
      ({ pick }) => { const k = pick(['corresponding', 'alternate', 'co-interior']); return { q: `For AB ∥ CD, what must be true of ${k} angles?`, a: k === 'co-interior' ? 'they add to 180°' : 'they are equal' }; },
    ],
    m: [
      ({ ri }, i) => { const k = ['corresponding', 'alternate', 'co-interior'][i % 3], a = ri(6, 30) * 5, ok = ri(0, 2) > 0; const b = k === 'co-interior' ? (ok ? 180 - a : 185 - a) : ok ? a : a + 5; return a === 90 ? null : { q: `${k[0].toUpperCase() + k.slice(1)} angles are ${a}° and ${b}°. Is AB ∥ CD? Give a reason.`, w: [k === 'co-interior' ? `${a} + ${b} = ${a + b}` : `${a} ${a === b ? '=' : '≠'} ${b}`, ok ? `yes: ${k} angles ${k === 'co-interior' ? 'add to 180°' : 'are equal'}` : `no: ${k === 'co-interior' ? 'they do not add to 180°' : 'they are not equal'}`] }; },
      ({ ri }) => { const x = ri(6, 30), g = 180 - 2 * x; return g <= 10 ? null : { q: `Co-interior angles are 2${i_('x')}° and ${g}°. Find ${i_('x')} so that AB ∥ CD.`, w: [`2x + ${g} = 180`, `2x = ${180 - g}`, `x = ${x}`] }; },
    ],
    c: [
      ({ ri }) => { const x = ri(6, 30), g = 3 * x + 10; return g >= 175 ? null : { q: `Alternate angles are (3${i_('x')} + 10)° and ${g}°. Find ${i_('x')} so that AB ∥ CD.`, w: [`3x + 10 = ${g}`, `3x = ${g - 10}`, `x = ${x}`] }; },
      ({ ri }) => { const a = ri(6, 30) * 5; return a === 90 ? null : { q: `A line crosses AB and CD. One angle at AB is ${a}°. The co-interior angle at CD is ${180 - a + 5}°. Are the lines parallel? Explain.`, a: `No. ${a} + ${185 - a} = 185, not 180.`, n: 2 }; },
      ({ ri, pick }) => { const a = ri(6, 30) * 5, who = pick(NAMES); return a === 90 ? null : { q: `${who} says AB ∥ CD because co-interior angles are both ${a}°. Is that right? Explain.`, a: `No. Co-interior angles must add to 180°; ${a} + ${a} = ${2 * a}.`, n: 2 }; },
    ],
  },
};
