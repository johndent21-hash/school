// Lesson 2.2 Perimeter (two pages: Easy, then Medium). See lib/lesson-two.js for the fields.
// Easy: add up the sides of shapes with every side labelled, or with equal sides shown by tick marks.
// Medium: find the missing sides first (shapes with some sides found from others, L-shapes and a U-shape); the page
// ends with word problems. From the Chapter 2 review: the perimeter of a square with side 2 cm (multiple-choice
// question 2) and of a 7 cm by 5 cm rectangle (short-answer question 3b).
// Every shape is drawn below (poly), with each side's length written outside it; every answer is worked out from the
// same numbers the diagram shows.
const { fmt, len, money, problems } = require('../helpers');
const { svg, text, line, C } = require('../../../lib/graphs');

// ---------- answers ----------
const sum = (list) => +list.reduce((t, v) => t + v, 0).toFixed(6);
// [4, 6, 7], 'cm' → '4 + 6 + 7 = 17 cm' · times(5, 4, 'cm') → '5 × 4 = 20 cm'
const plus = (list, u) => `${list.map((v) => fmt(v)).join(' + ')} = ${len(sum(list), u)}`;
const times = (n, s, u) => `${n} × ${fmt(s)} = ${len(+(n * s).toFixed(6), u)}`;

// ---------- drawing (mm) ----------
const f2 = (n) => +n.toFixed(2);
const TS = 3.4; // label size
const CW = { m: 0.88, c: 0.52, ' ': 0.28, '.': 0.28, '?': 0.56 }; // character widths (em); digits and letters about 0.6
const est = (s, size) => [...String(s)].reduce((t, ch) => t + (CW[ch] ?? 0.6), 0) * size; // about how wide a label is
const missing = (s) => s === '?' || /^[a-z]$/.test(s); // a side to find: written in blue
const inside = (pts, x, y) => {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};

// One shape: its corners pts (mm), a label for each side (side i joins pts[i] to pts[i + 1]) written just outside the
// shape at the fraction at[i] along it (default halfway), tick marks (how many on each side) and right-angle marks
// (corner indexes). The picture is cropped to the shape and its labels (and centred in minW mm, when that is wider).
const poly = ({ pts, sides = [], at = [], ticks = [], rights = [], ts = TS, minW = 0 }) => {
  const n = pts.length;
  let lo = [Infinity, Infinity], hi = [-Infinity, -Infinity];
  const grow = (x, y) => { lo = [Math.min(lo[0], x), Math.min(lo[1], y)]; hi = [Math.max(hi[0], x), Math.max(hi[1], y)]; };
  pts.forEach(([x, y]) => grow(x, y));
  // side i: its direction (ux, uy), its outward normal (nx, ny), its midpoint and the label point
  const geo = (i) => {
    const a = pts[i], c = pts[(i + 1) % n], L = Math.hypot(c[0] - a[0], c[1] - a[1]);
    const ux = (c[0] - a[0]) / L, uy = (c[1] - a[1]) / L, t = at[i] ?? 0.5;
    const px = a[0] + (c[0] - a[0]) * t, py = a[1] + (c[1] - a[1]) * t;
    let nx = -uy, ny = ux;
    if (inside(pts, px + nx * 0.4, py + ny * 0.4)) { nx = -nx; ny = -ny; }
    return { ux, uy, nx, ny, px, py, mx: (a[0] + c[0]) / 2, my: (a[1] + c[1]) / 2 };
  };
  let b = `<polygon points="${pts.map((p) => p.map(f2).join(',')).join(' ')}" fill="#eef1f9" stroke="${C.charcoal}" stroke-width="0.45" stroke-linejoin="round"/>`;
  rights.forEach((i) => {
    const p = pts[i], u = (q) => { const L = Math.hypot(q[0] - p[0], q[1] - p[1]); return [((q[0] - p[0]) / L) * 2.2, ((q[1] - p[1]) / L) * 2.2]; };
    const [ax, ay] = u(pts[(i + n - 1) % n]), [bx, by] = u(pts[(i + 1) % n]);
    b += `<polyline points="${f2(p[0] + ax)},${f2(p[1] + ay)} ${f2(p[0] + ax + bx)},${f2(p[1] + ay + by)} ${f2(p[0] + bx)},${f2(p[1] + by)}" fill="none" stroke="${C.charcoal}" stroke-width="0.3"/>`;
  });
  ticks.forEach((k, i) => {
    if (!k) return;
    const g = geo(i);
    for (let j = 0; j < k; j++) {
      const o = (j - (k - 1) / 2) * 1.1, cx = g.mx + g.ux * o, cy = g.my + g.uy * o;
      b += line(cx - g.nx * 1.3, cy - g.ny * 1.3, cx + g.nx * 1.3, cy + g.ny * 1.3, C.charcoal, 0.35);
    }
  });
  sides.forEach((s, i) => {
    if (!s) return;
    const g = geo(i), miss = missing(s), size = miss ? ts + 0.5 : ts, w = est(s, size);
    const anchor = g.nx > 0.3 ? 'start' : g.nx < -0.3 ? 'end' : 'middle';
    const tick = ticks[i] && Math.abs((at[i] ?? 0.5) - 0.5) < 0.2;
    const d = (tick ? 2.1 : 1.6) + (anchor === 'middle' ? (w / 2) * Math.abs(g.nx) : 0);
    const x = g.px + g.nx * d, yb = g.py + g.ny * d;
    const y = g.ny > 0.3 ? yb + 0.72 * size : g.ny < -0.3 ? yb - 0.15 : yb + 0.36 * size;
    const x1 = anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2;
    grow(x1, y - 0.74 * size); grow(x1 + w, y + 0.12 * size);
    b += text(f2(x), f2(y), s, { size, anchor, weight: miss ? 700 : 600, fill: miss ? C.blue : C.ink });
  });
  const m = 1, w = Math.max(hi[0] - lo[0] + 2 * m, minW);
  return svg(f2(w), f2(hi[1] - lo[1] + 2 * m), `<g transform="translate(${f2((w - (hi[0] - lo[0])) / 2 - lo[0])} ${f2(m - lo[1])})">${b}</g>`);
};

// The question number sits on the top-left corner of a diagram card: shift a wide picture right (inside the svg) so
// nothing is drawn under it. cw: the card's inside width (mm).
const clear = (fig, cw) => {
  const [w, h] = fig.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/).slice(1).map(Number), P = Math.min(w - (cw - 13), cw - w);
  return P > 0 ? svg(f2(w + P), h, `<g transform="translate(${f2(P)} 0)">${fig.slice(fig.indexOf('>') + 1, fig.lastIndexOf('</svg>'))}</g>`) : fig;
};

// A b by h shape drawn in proportion, at most W by H mm (never thinner than 8 mm).
const fit = (b, h, W, H) => { const k = Math.min(W / b, H / h); return [Math.max(b * k, 8), Math.max(h * k, 8)]; };
const lab = (v, u) => (v === '' ? '' : typeof v === 'string' ? v : len(v, u));

// Rectangle (b across, h up): lengths on the bottom and the left; tick marks show the equal sides (ticks: false for none).
const rectQ = (b, h, u, { ticks = true, W = 22, H = 13 } = {}) => {
  const [w, t] = fit(b, h, W, H);
  return poly({ pts: [[0, 0], [w, 0], [w, t], [0, t]], sides: ['', '', len(b, u), len(h, u)], ticks: ticks ? [1, 2, 1, 2] : [], rights: [3] });
};
const squareQ = (s, u, { ticks = true, W = 14 } = {}) => poly({ pts: [[0, 0], [W, 0], [W, W], [0, W]], sides: ['', '', len(s, u), ''], ticks: ticks ? [1, 1, 1, 1] : [], rights: [3] });
// Triangle from its three sides (base along the bottom, then the right side, then the left side), drawn in proportion.
// show: which sides to label · ticks: tick marks on each side (base, right, left)
const triQ = (base, right, left, u, { show = [1, 1, 1], ticks = [], W = 22, H = 12 } = {}) => {
  const x = (base ** 2 + left ** 2 - right ** 2) / (2 * base), y = Math.sqrt(left ** 2 - x ** 2), k = Math.min(W / base, H / y);
  return poly({ pts: [[0, y * k], [base * k, y * k], [x * k, 0]], sides: [base, right, left].map((v, i) => (show[i] ? len(v, u) : '')), ticks });
};
// A regular shape with n equal sides (tick marks on every side), its length on the bottom side.
const regular = (n, s, u, R = 8) => {
  const pts = Array.from({ length: n }, (_, k) => { const a = Math.PI / 2 + Math.PI / n + (k * 2 * Math.PI) / n; return [R * Math.cos(a), R * Math.sin(a)]; });
  return poly({ pts, sides: pts.map((_, i) => (i === n - 1 ? len(s, u) : '')), ticks: pts.map(() => 1) });
};
// Parallelogram: base b along the bottom, slanted side a on the left (sloping at 60°). rhombus: all sides ticked once.
const paraQ = (b, a, u, { ticks = true, rhombus = false, W = 20, H = 12 } = {}) => {
  const k = Math.min(W / b, H / (a * 0.866)), B = b * k, s = a * k * 0.5, h = a * k * 0.866;
  return poly({ pts: [[0, h], [B, h], [B + s, 0], [s, 0]], sides: [len(b, u), '', '', rhombus ? '' : len(a, u)], ticks: !ticks ? [] : rhombus ? [1, 1, 1, 1] : [1, 2, 1, 2] });
};
// Trapezium with a right angle on the left: top, slanted side, bottom and the left side all labelled.
const trapQ = (top, slant, bottom, left, u, { W = 22, H = 11 } = {}) => {
  const k = Math.min(W / bottom, H / left);
  return poly({ pts: [[0, 0], [top * k, 0], [bottom * k, left * k], [0, left * k]], sides: [top, slant, bottom, left].map((v) => len(v, u)), rights: [0, 3] });
};
// A five-sided "house": floor, wall, roof, roof, wall (all labelled).
const houseQ = (floor, wall, roof, u, { k = 2 } = {}) => {
  const F = floor * k, Wl = wall * k, rh = Math.sqrt(Math.max(roof ** 2 - (floor / 2) ** 2, 1)) * k;
  return poly({ pts: [[0, rh + Wl], [F, rh + Wl], [F, rh], [F / 2, 0], [0, rh]], sides: [floor, wall, roof, roof, wall].map((v) => len(v, u)), rights: [0, 1] });
};
// Any four-sided shape: drawn corners pts and the four lengths (bottom, right, top, left).
const quadQ = (pts, lens, u) => poly({ pts, sides: lens.map((v) => len(v, u)) });

// An L-shape W across and H up with a rectangle cut from one corner. Before flipping, the cut is at the top right:
// the top is A long and the cut is B deep. Sides, in order: top, side of the cut, bottom of the cut (the step), right,
// bottom, left. show: for each side, 1 = write its length, '?' or a letter = a side to find, 0 = nothing.
// flip: 'x' (cut at the top left), 'y' (bottom right) or 'xy' (bottom left).
const ell = ({ W, H, A, B, u, show, flip = '', w = 24, h = 13, ts, minW }) => {
  const real = [A, B, W - A, H - B, W, H], k = Math.min(w / W, h / H);
  let pts = [[0, 0], [A, 0], [A, B], [W, B], [W, H], [0, H]].map(([x, y]) => [x * k, y * k]);
  if (flip.includes('x')) pts = pts.map(([x, y]) => [W * k - x, y]);
  if (flip.includes('y')) pts = pts.map(([x, y]) => [x, H * k - y]);
  return { real, fig: poly({ pts, sides: show.map((s, i) => (s === 1 ? len(real[i], u) : s || '')), at: [0.5, 0.25, 0.75, 0.5, 0.5, 0.5], ts, minW }) };
};
// A U-shape W across and H up, with a gap N wide and D deep cut from the top, P from the left. Sides, in order:
// top left, left side of the gap, bottom of the gap, right side of the gap, top right, right, bottom, left.
const uShape = ({ W, H, P, N, D, u, show, w = 38, h = 17 }) => {
  const real = [P, D, N, D, W - P - N, H, W, H], k = Math.min(w / W, h / H);
  const pts = [[0, 0], [P, 0], [P, D], [P + N, D], [P + N, 0], [W, 0], [W, H], [0, H]].map(([x, y]) => [x * k, y * k]);
  return { real, fig: poly({ pts, sides: show.map((s, i) => (s === 1 ? len(real[i], u) : s || '')), at: [0.5, 0.25, 0.5, 0.75, 0.5, 0.5, 0.5, 0.5] }) };
};

// ---------- the questions ----------
// A round of diagram questions: each { fig, t?, ans }.
const CARD_W = { 3: 55.5, 4: 40.5 }; // inside width of a card, 3 or 4 to a row
const cards = (text, list, o = {}) => {
  const cols = o.cols || 4;
  return { text, figs: true, cols, prefix: 'P =', items: list.map(({ fig, t }) => ({ fig: t ? fig : clear(fig, CARD_W[cols]), t })), ans: list.map((x) => x.ans), ...o };
};
const EASY = { figH: 22 }; // page 1 also holds the lesson header, so its diagram cards are a little shorter
// Shapes whose every side is labelled: list the sides, add them up.
const allSides = (fig, list, u) => ({ fig, ans: plus(list, u) });
// n equal sides of length s
const equal = (fig, n, s, u, t) => ({ fig, t, ans: times(n, s, u) });

// Medium: find the missing side marked ? (the answer, then how: the whole side = the two parts added).
const findSide = (L, i, u) => {
  const r = L.real, parts = { 0: [4, 2, '−'], 2: [4, 0, '−'], 4: [0, 2, '+'], 1: [5, 3, '−'], 3: [5, 1, '−'], 5: [1, 3, '+'] }[i];
  const [p, q, op] = parts;
  return { fig: L.fig, ans: `${fmt(r[p])} ${op} ${fmt(r[q])} = ${len(r[i], u)}` };
};
// Medium: the perimeter of a composite shape, with the ? sides found first.
const perim = (L, show, u) => ({ fig: L.fig, ans: `? = ${show.map((s, i) => (s === '?' ? len(L.real[i], u) : null)).filter(Boolean).join(', ? = ')}; P = ${plus(L.real, u)}` });

// The Medium example: an L-shape with two sides (a and b) to find.
const exL = { W: 10, H: 8, A: 4, B: 5, u: 'm', show: [1, 'a', 'b', 1, 1, 1] };
const EXL = ell({ ...exL, w: 36, h: 28, ts: 4, minW: 70 });
const fence = 20; // dollars a metre

// Medium round 2: find ?
const r2 = [
  [{ W: 12, H: 8, A: 5, B: 4, u: 'm', show: [1, 0, '?', 0, 1, 0] }, 2],
  [{ W: 10, H: 9, A: 4, B: 5, u: 'cm', show: [0, '?', 0, 1, 0, 1], flip: 'x' }, 1],
  [{ W: 9, H: 7, A: 5, B: 3, u: 'm', show: [1, 0, 1, 0, '?', 0], flip: 'y' }, 4],
  [{ W: 10, H: 7, A: 4, B: 3, u: 'cm', show: [0, 1, 0, 1, 0, '?'], flip: 'xy' }, 5],
];
// Medium round 3: perimeter of composite shapes
const r3L = [
  { W: 9, H: 6, A: 4, B: 4, u: 'm', show: [1, '?', '?', 1, 1, 1], flip: 'x', w: 34, h: 16 },
  { W: 10, H: 6, A: 4, B: 4, u: 'cm', show: [1, 1, 1, '?', '?', 1], flip: 'y', w: 34, h: 16 },
];
const r3U = { W: 13, H: 6, P: 3, N: 7, D: 4, u: 'm', show: [1, 1, '?', 1, 1, '?', 1, 1] };

// Word problems
const paddock = { l: 50, w: 30, cost: 12 };
const park = { s: 200, laps: 3 };

module.exports = {
  code: '2.2', title: 'Perimeter',
  li: 'find the perimeter of a shape by adding up the lengths of all its sides.',
  sc: ['add up the sides of a shape to find its perimeter', 'use tick marks to find sides that are the same length', 'find missing sides first, then the perimeter'],
  easy: {
    ex: { stem: 'Perimeter is the distance around the outside. Add up the lengths of all the sides.', parts: [
      { t: 'Triangle', fig: triQ(8, 6, 5, 'cm') }, { t: 'Square', fig: squareQ(6, 'cm') }, { t: 'Hexagon', fig: regular(6, 3, 'm') }, { t: 'Rectangle', fig: rectQ(9, 4, 'm') }] },
    exAns: [plus([8, 6, 5], 'cm'), times(4, 6, 'cm'), times(6, 3, 'm'), plus([9, 4, 9, 4], 'm')],
    hint: 'Perimeter (P) = add up the lengths of all the sides · Sides with the same tick marks are the same length · Square: P = 4 × side.',
    rounds: [
      cards('find the perimeter of each shape. Add up all the sides.', [
        allSides(triQ(7, 6, 4, 'cm'), [7, 6, 4], 'cm'),
        allSides(quadQ([[0, 10], [18, 10], [14.5, 1], [3, 0]], [12, 7, 8, 9], 'm'), [12, 7, 8, 9], 'm'),
        allSides(trapQ(6, 5, 9, 4, 'mm', { W: 18, H: 9 }), [6, 5, 9, 4], 'mm'),
        allSides(houseQ(10, 4, 6, 'cm', { k: 1.6 }), [10, 4, 6, 6, 4], 'cm'),
      ], EASY),
      cards('every side is the same length (the tick marks show this). Find each perimeter.', [
        equal(squareQ(8, 'cm'), 4, 8, 'cm'),
        equal(regular(3, 7, 'm', 8.5), 3, 7, 'm'),
        equal(regular(5, 4, 'cm', 8), 5, 4, 'cm'),
        equal(paraQ(6, 6, 'mm', { rhombus: true, W: 15 }), 4, 6, 'mm'),
      ], EASY),
      cards('sides with the same tick marks are the same length. Find each perimeter.', [
        allSides(rectQ(6, 3, 'cm'), [6, 3, 6, 3], 'cm'),
        allSides(rectQ(5, 9, 'm'), [5, 9, 5, 9], 'm'),
        allSides(triQ(6, 8, 8, 'cm', { show: [1, 0, 1], ticks: [0, 1, 1] }), [6, 8, 8], 'cm'),
        allSides(paraQ(12, 5, 'mm', { W: 17 }), [12, 5, 12, 5], 'mm'),
      ], EASY),
    ],
  },
  medium: {
    ex: { stem: 'Sides a and b have no length on them. Find them first, then add up all the sides.', fig: EXL.fig, parts: [
      'Find side a.', 'Find side b.', 'Find the perimeter.', `Fencing costs ${money(fence)} a metre. Find the cost to fence the shape.`] },
    exAns: [`a = ${fmt(exL.H)} − ${fmt(exL.H - exL.B)} = ${len(exL.B, 'm')}`, `b = ${fmt(exL.W)} − ${fmt(exL.A)} = ${len(exL.W - exL.A, 'm')}`,
      `P = ${plus(EXL.real, 'm')}`, `${fmt(sum(EXL.real))} × ${money(fence)} = ${money(sum(EXL.real) * fence)}`],
    hint: 'Opposite sides of a rectangle are the same length · A missing side: the whole side = the two parts added, so take away the part you know · Then add up every side.',
    rounds: [
      cards('find each perimeter. Use the sides you know to find the others.', [
        { t: 'Square', fig: squareQ(2, 'cm', { ticks: false }), ans: times(4, 2, 'cm') },
        { t: 'Rectangle', fig: rectQ(7, 5, 'cm', { ticks: false }), ans: plus([7, 5, 7, 5], 'cm') },
        { t: 'Rectangle', fig: rectQ(4.5, 2, 'm', { ticks: false }), ans: plus([4.5, 2, 4.5, 2], 'm') },
        { t: 'Parallelogram', fig: paraQ(9, 6, 'mm', { ticks: false }), ans: plus([9, 6, 9, 6], 'mm') },
      ]),
      cards('find the length of each side marked ?.', r2.map(([s, i]) => findSide(ell(s), i, s.u)), { prefix: '? =' }),
      cards('find the perimeter of each shape. Find the ? sides first.', [
        ...r3L.map((s) => perim(ell(s), s.show, s.u)),
        perim(uShape(r3U), r3U.show, r3U.u),
      ], { cols: 3, figH: 25 }),
      problems('solve each problem. Show your working.', [
        [`A rectangular paddock is ${len(paddock.l, 'm')} long and ${len(paddock.w, 'm')} wide. Fencing costs ${money(paddock.cost)} a metre. How much does it cost to fence the paddock?`,
          `P = ${plus([paddock.l, paddock.w, paddock.l, paddock.w], 'm')}, ${fmt(2 * (paddock.l + paddock.w))} × ${money(paddock.cost)} = ${money(2 * (paddock.l + paddock.w) * paddock.cost)}`],
        [`Zoe runs around a square park ${park.laps} times. Each side of the park is ${len(park.s, 'm')} long. How far does Zoe run?`,
          `one lap = ${times(4, park.s, 'm')}, ${park.laps} × ${fmt(4 * park.s)} = ${len(park.laps * 4 * park.s, 'm')}`],
      ]),
    ],
  },
};
