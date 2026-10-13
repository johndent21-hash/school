// Chapter 2 helpers: the shared ones (../helpers.js), plus measurements with units and labelled shapes to draw.
// Shapes are drawn roughly in proportion (never too thin), with each side's length written on it.
const base = require('../helpers');
const { svg, text, line, C } = require('../../lib/graphs');
const D = require('../../lib/diagrams');

const { fmt } = base;
// 8, 'cm' → '8 cm' · area 40, 'cm' → '40 cm²' · volume → '60 cm³'
const len = (v, u) => `${fmt(v)} ${u}`;
const area = (v, u) => `${fmt(v)} ${u}²`;
const vol = (v, u) => `${fmt(v)} ${u}³`;
// Rounded to 1 decimal place (for answers with π): 31.4159 → 31.4
const dp1 = (v) => Math.round(v * 10) / 10;

// ---------- drawing ----------
const f2 = (n) => +n.toFixed(2);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const TS = 3.4; // label size (mm)
// Drawn width and height for a shape that is really b by h: about 30 mm wide, never thinner than 12 mm.
const dims = (b, h, W = 28, maxH = 17) => (h <= b ? [W, clamp((W * h) / b, 10, maxH)] : [clamp((maxH * b) / h, 12, W), maxH]);

// One shape: pts (mm), side labels (outside, at each side's midpoint), dashed lines, right-angle marks
// ([corner, towards1, towards2]), equal-side ticks (side indexes) and free labels ([text, x, y]).
const shape = ({ pts, sides = [], dash = [], rights = [], ticks = [], labels = [], m = 4.5 }) => {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const dx = m - Math.min(...xs) + (sides.some(Boolean) ? 9 : 0), dy = m - Math.min(...ys) + 1;
  const P = ([x, y]) => [f2(x + dx), f2(y + dy)];
  const q = pts.map(P);
  const n = q.length, cx = q.reduce((s, p) => s + p[0], 0) / n, cy = q.reduce((s, p) => s + p[1], 0) / n;
  let b = `<polygon points="${q.map((p) => p.join(',')).join(' ')}" fill="#eef1f9" stroke="${C.charcoal}" stroke-width="0.45"/>`;
  dash.forEach(([a, c]) => { const [x1, y1] = P(a), [x2, y2] = P(c); b += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C.grey}" stroke-width="0.35" stroke-dasharray="1.2 1"/>`; });
  rights.forEach(([p, a, c]) => {
    const [px, py] = P(p), u = (t) => { const [tx, ty] = P(t), L = Math.hypot(tx - px, ty - py); return [((tx - px) / L) * 2.4, ((ty - py) / L) * 2.4]; };
    const [ax, ay] = u(a), [bx, by] = u(c);
    b += `<polyline points="${f2(px + ax)},${f2(py + ay)} ${f2(px + ax + bx)},${f2(py + ay + by)} ${f2(px + bx)},${f2(py + by)}" fill="none" stroke="${C.charcoal}" stroke-width="0.3"/>`;
  });
  ticks.forEach((i) => {
    const a = q[i], c = q[(i + 1) % n], mx = (a[0] + c[0]) / 2, my = (a[1] + c[1]) / 2, L = Math.hypot(c[0] - a[0], c[1] - a[1]);
    const nx = -(c[1] - a[1]) / L, ny = (c[0] - a[0]) / L;
    b += line(mx - nx * 1.4, my - ny * 1.4, mx + nx * 1.4, my + ny * 1.4, C.charcoal, 0.35);
  });
  sides.forEach((s, i) => {
    if (!s) return;
    const a = q[i], c = q[(i + 1) % n], mx = (a[0] + c[0]) / 2, my = (a[1] + c[1]) / 2;
    // straight out from the side (its normal, turned away from the middle of the shape)
    const L = Math.hypot(c[0] - a[0], c[1] - a[1]); let nx = -(c[1] - a[1]) / L, ny = (c[0] - a[0]) / L;
    if (nx * (mx - cx) + ny * (my - cy) < 0) { nx = -nx; ny = -ny; }
    const anchor = Math.abs(nx) > 0.7 ? (nx > 0 ? 'start' : 'end') : 'middle';
    b += text(mx + nx * 1.8, my + ny * 1.8 + (ny > 0.5 ? 2.6 : ny < -0.5 ? -0.4 : 1.2), s, { size: TS, anchor, weight: 600 });
  });
  // labels inside the shape get a halo in the fill colour, so a dashed line never runs through them
  b += `<g stroke="#eef1f9" stroke-width="1.4" stroke-linejoin="round" style="paint-order:stroke">${labels.map(([t, x, y, anchor = 'start']) => { const [lx, ly] = P([x, y]); return text(lx, ly + 1.2, t, { size: TS, anchor, weight: 600, fill: C.blue }); }).join('')}</g>`;
  const W = Math.max(...q.map((p) => p[0])) + m + 9, H = Math.max(...q.map((p) => p[1])) + m + 2;
  return svg(f2(W), f2(H), b);
};

// Labelled shapes. b, h, a, x, y are the real lengths (numbers); u is the unit ('cm', 'm', 'mm').
const rect = (b, h, u) => { const [W, H] = dims(b, h); return shape({ pts: [[0, 0], [W, 0], [W, H], [0, H]], sides: ['', '', len(b, u), len(h, u)], rights: [[[0, H], [W, H], [0, 0]]] }); };
const square = (s, u) => { const W = 20; return shape({ pts: [[0, 0], [W, 0], [W, W], [0, W]], sides: ['', '', len(s, u), ''], ticks: [0, 1, 2, 3], rights: [[[0, W], [W, W], [0, 0]]] }); };
// A right-angled triangle: base along the bottom, height up the left side.
const rightTri = (b, h, u) => { const [W, H] = dims(b, h); return shape({ pts: [[0, H], [W, H], [0, 0]], sides: [len(b, u), '', len(h, u)], rights: [[[0, H], [W, H], [0, 0]]] }); };
// A triangle with its perpendicular height dashed (apex: where the top sits, as a fraction of the base).
const tri = (b, h, u, apex = 0.35) => {
  const [W, H] = dims(b, h), ax = W * apex;
  return shape({ pts: [[0, H], [W, H], [ax, 0]], sides: [len(b, u), '', ''], dash: [[[ax, 0], [ax, H]]], rights: [[[ax, H], [W, H], [ax, 0]]], labels: [[len(h, u), ax + 1.2, H * 0.45]] });
};
// A parallelogram with its perpendicular height dashed. slant: also label the slanted side (a length not needed).
const para = (b, h, u, slant) => {
  const [W, H] = dims(b, h, 26), s = 8;
  return shape({ pts: [[s, 0], [W + s, 0], [W, H], [0, H]], sides: ['', '', len(b, u), slant ? len(slant, u) : ''], dash: [[[s, 0], [s, H]]], rights: [[[s, H], [W, H], [s, 0]]], labels: [[len(h, u), s + 1.2, H * 0.45]] });
};
// A trapezium: parallel sides a (top) and b (bottom), perpendicular height h dashed.
const trap = (a, b, h, u) => {
  const [W, H] = dims(b, h), Wa = clamp((W * a) / b, 8, W - 6), l = (W - Wa) / 2;
  return shape({ pts: [[l, 0], [l + Wa, 0], [W, H], [0, H]], sides: [len(a, u), '', len(b, u), ''], dash: [[[l, 0], [l, H]]], rights: [[[l, H], [W, H], [l, 0]]], labels: [[len(h, u), l + 1.2, H * 0.45]] });
};
// A rhombus with its diagonals x (across) and y (up) dashed.
const rhombus = (x, y, u) => {
  const [W, H] = dims(x, y, 32, 20);
  return shape({ pts: [[W / 2, 0], [W, H / 2], [W / 2, H], [0, H / 2]], dash: [[[0, H / 2], [W, H / 2]], [[W / 2, 0], [W / 2, H]]], rights: [[[W / 2, H / 2], [W, H / 2], [W / 2, 0]]],
    labels: [[len(x, u), W * 0.25, H / 2 + 3.6, 'middle'], [len(y, u), W / 2 + 1.2, H * 0.3]] });
};

module.exports = { ...base, len, area, vol, dp1, shape, dims, rect, square, rightTri, tri, para, trap, rhombus,
  circle: D.circle, sectorShape: D.sectorShape, rectSemi: D.rectSemi, cylinder: D.cylinder, box: D.box, triPrism: D.triPrism, prism: D.prism };
