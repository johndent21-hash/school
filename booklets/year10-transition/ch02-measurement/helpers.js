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
// To 1 decimal place, always showing the decimal (answers with π): 37.699 → '37.7', 44 → '44.0'
const d1 = (v) => { const x = dp1(v); return Number.isInteger(x) ? `${fmt(x)}.0` : fmt(x); };

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

// ---------- circles (mm): drawn for lessons 2.3 and 2.5 ----------
const CTS = 3.3; // label size on circle diagrams
const FILL = '#eef1f9', LC = C.blue;
const CT = (x, y, s, o = {}) => text(f2(x), f2(y), s, { size: CTS, anchor: 'middle', weight: 700, ...o });
// A label on top of the shape gets a halo in the fill colour, so the outline never runs through it.
const halo = (s) => `<g stroke="${FILL}" stroke-width="1.3" stroke-linejoin="round" style="paint-order:stroke">${s}</g>`;
const cdot = (x, y) => `<circle cx="${f2(x)}" cy="${f2(y)}" r="0.65" fill="${C.charcoal}"/>`;
const outline = (d) => `<path d="${d}" fill="${FILL}" stroke="${C.charcoal}" stroke-width="0.45" stroke-linejoin="round"/>`;
const est = (s) => String(s).length * CTS * 0.62; // about how wide a label is (bold)
// A short tick across a side (equal sides), at (x, y), along direction (dx, dy) of the side.
const tick = (x, y, dx, dy) => line(x - dy * 1.3, y + dx * 1.3, x + dy * 1.3, y - dx * 1.3, C.charcoal, 0.35);

// A circle with its radius (kind 'r', centre to edge) or diameter (kind 'd', all the way across) drawn in blue,
// its length written just above the line.
const circ = (v, u, kind) => {
  const r = 10, cx = 11.5, cy = 10.6, s = len(v, u);
  // a radius label is kept clear of the circle's edge (a long one starts a little left of the centre)
  const lx = kind === 'd' ? cx : Math.min(cx + r / 2, cx + r * 0.78 - est(s) / 2);
  return svg(23, 21.2, `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${FILL}" stroke="${C.charcoal}" stroke-width="0.45"/>`
    + line(kind === 'd' ? cx - r : cx, cy, cx + r, cy, LC, 0.6) + cdot(cx, cy) + halo(CT(lx, cy - 1.6, s)));
};
// A semicircle, flat side down. kind 'd': the diameter (the flat side) is labelled; 'r': the radius from the centre.
const semi = (v, u, kind) => {
  const r = 15, cx = 16.5, cy = 16, s = len(v, u);
  const lx = kind === 'd' ? cx : Math.min(cx + r / 2, cx + r * 0.9 - est(s) / 2);
  return svg(33, 17, outline(`M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r},${cy} Z`)
    + line(kind === 'd' ? cx - r : cx, cy, cx + r, cy, LC, 0.6) + cdot(cx, cy) + halo(CT(lx, cy - 1.8, s)));
};
// A quarter circle: the right angle at the bottom left, both straight sides are radii (ticks: they are equal).
const quarter = (v, u) => {
  const r = 17, x0 = 2.5, y0 = 18, s = len(v, u);
  return svg(22, 23, outline(`M${x0},${y0} L${x0 + r},${y0} A${r},${r} 0 0 0 ${x0},${y0 - r} Z`)
    + `<polyline points="${x0 + 2.4},${y0} ${x0 + 2.4},${y0 - 2.4} ${x0},${y0 - 2.4}" fill="none" stroke="${C.charcoal}" stroke-width="0.3"/>`
    + line(x0, y0, x0 + r, y0, LC, 0.6) + tick(x0 + r / 2, y0, 1, 0) + tick(x0, y0 - r / 2, 0, -1) + cdot(x0, y0)
    + CT(x0 + r / 2, y0 + 4.4, s));
};
// A rectangle (L long, w high) with a semicircle on its right-hand end. The dashed line is not part of the perimeter.
const rectSemi = (L, w, u) => {
  const H = 13, W = Math.max(13, Math.min(20, (H * L) / w)), r = H / 2, sw = len(w, u);
  const x = est(sw) + 2.6, y = 4.6;
  return svg(f2(x + W + r + 1), f2(y + H + 0.8), outline(`M${x},${y} L${x + W},${y} A${r},${r} 0 0 1 ${x + W},${y + H} L${x},${y + H} Z`)
    + `<line x1="${x + W}" y1="${y}" x2="${x + W}" y2="${y + H}" stroke="${C.grey}" stroke-width="0.35" stroke-dasharray="1.2 1"/>`
    + `<polyline points="${x + 2.4},${y + H} ${x + 2.4},${y + H - 2.4} ${x},${y + H - 2.4}" fill="none" stroke="${C.charcoal}" stroke-width="0.3"/>`
    + CT(x + W / 2, y - 1.4, len(L, u)) + CT(x - 1.4, y + H / 2 + 1.2, sw, { anchor: 'end' }));
};

// ---------- prisms and cylinders (mm): drawn for lessons 2.6 and 2.7 ----------
const PTS = 3.3; // label size on prism diagrams
const FRONT = '#eef1f9', TOP = '#f7f7f7', SIDE = '#e3e6ef';
const pest = (s) => String(s).length * PTS * 0.68; // about how wide a bold label is
const plab = (v, u) => `${fmt(v)} ${u}`;
const PT = (x, y, s, o = {}) => text(f2(x), f2(y), s, { size: PTS, weight: 700, ...o });
const phalo = (s, fill = FRONT) => `<g stroke="${fill}" stroke-width="1.3" stroke-linejoin="round" style="paint-order:stroke">${s}</g>`;
const pface = (pts, fill) => `<polygon points="${pts.map((p) => p.map(f2).join(',')).join(' ')}" fill="${fill}" stroke="${C.charcoal}" stroke-width="0.45" stroke-linejoin="round"/>`;
const pdash = (a, b) => `<line x1="${f2(a[0])}" y1="${f2(a[1])}" x2="${f2(b[0])}" y2="${f2(b[1])}" stroke="${C.grey}" stroke-width="0.3" stroke-dasharray="1.1 0.9"/>`;
// Wrap a drawing in an svg cropped to [x0, y0, x1, y1] (mm).
const pcrop = ([x0, y0, x1, y1], body) => svg(f2(x1 - x0), f2(y1 - y0), `<g transform="translate(${f2(-x0)} ${f2(-y0)})">${body}</g>`);

// A rectangular prism l long, w wide (going back) and h high, in oblique view. Labels: l under the front, h on the
// left, w along the bottom edge going back. Drawn roughly in proportion.
const cuboid = (l, w, h, u) => {
  const k = Math.min(20 / l, 12 / h, 14 / w), L = clamp(l * k, 9, 20), H = clamp(h * k, 5, 12), D = clamp(w * k, 4, 10);
  const dx = D * 0.8, dy = D * 0.55, x = 0, y = dy;
  const F = [[x, y], [x + L, y], [x + L, y + H], [x, y + H]], top = [[x, y], [x + L, y], [x + L + dx, y - dy], [x + dx, y - dy]],
    side = [[x + L, y], [x + L + dx, y - dy], [x + L + dx, y + H - dy], [x + L, y + H]];
  const sh = plab(h, u), sw = plab(w, u);
  const body = pface(top, TOP) + pface(side, SIDE) + pface(F, FRONT)
    + PT(x + L / 2, y + H + 4, plab(l, u), { anchor: 'middle' }) + PT(x - 1.2, y + H / 2 + 1.2, sh, { anchor: 'end' })
    + PT(x + L + dx / 2 + 1.6, y + H - dy / 2 + 2.6, sw);
  return pcrop([x - pest(sh) - 2, -1.2, x + L + dx + pest(sw) + 1, y + H + 5.4], body);
};
// A triangular prism: the front triangle, pushed back (to the right and up) by the prism's length.
// right: a right-angled triangle (base b along the bottom, height h up the left side, slanted side c).
// otherwise: an isosceles triangle (base b, dashed height h, two equal sides s, shown by tick marks).
const triPrism = (b, h, c, L, u, right = true) => {
  const k = right ? Math.min(15 / b, 11 / h) : Math.min(19 / b, 12 / h), B = clamp(b * k, right ? 9 : 14, right ? 15 : 19), H = clamp(h * k, right ? 6 : 8, right ? 11 : 12), D = clamp(L * 1.1, 9, right ? 18 : 14);
  const dx = D * 0.85, dy = D * 0.42, y0 = dy + 1;
  const A = right ? [0, y0] : [B / 2, y0], P = [0, y0 + H], Q = [B, y0 + H];
  const mv = (p) => [p[0] + dx, p[1] - dy];
  const back = [mv(A), mv(P), mv(Q)];
  let body = pdash(back[1], back[0]) + pdash(back[1], back[2]) + pdash(P, back[1]);
  body += pface([A, mv(A), mv(Q), Q], TOP) + (right ? '' : pface([A, mv(A), back[1], P], TOP)) + pface([A, P, Q], FRONT);
  const sb = plab(b, u), sh = plab(h, u), sc = plab(c, u), sL = plab(L, u);
  body += PT(B / 2, y0 + H + 4, sb, { anchor: 'middle' });
  let x0 = -1.2;
  if (right) {
    body += `<polyline points="0,${f2(y0 + H - 2.2)} 2.2,${f2(y0 + H - 2.2)} 2.2,${f2(y0 + H)}" fill="none" stroke="${C.charcoal}" stroke-width="0.3"/>`;
    body += PT(-1.2, y0 + H / 2 + 1.2, sh, { anchor: 'end' }) + phalo(PT(B / 2 + 1.4, y0 + H / 2 - 0.6, sc), TOP);
    x0 = -pest(sh) - 2;
  } else {
    const M = [B / 2, y0 + H];
    body += pdash(A, M) + `<polyline points="${f2(M[0])},${f2(M[1] - 2)} ${f2(M[0] + 2)},${f2(M[1] - 2)} ${f2(M[0] + 2)},${f2(M[1])}" fill="none" stroke="${C.charcoal}" stroke-width="0.3"/>`;
    body += phalo(PT(B / 2 + 1, y0 + H * 0.72, sh, { size: 3, fill: C.blue }));
    [[A, P], [A, Q]].forEach(([p, q]) => { const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2, ux = q[0] - p[0], uy = q[1] - p[1], n = Math.hypot(ux, uy); body += line(mx - (uy / n) * 1.3, my + (ux / n) * 1.3, mx + (uy / n) * 1.3, my - (ux / n) * 1.3, C.charcoal, 0.35); });
    body += PT(B / 4 - 2, y0 + H / 2, sc, { anchor: 'end' });
    x0 = Math.min(-1.2, B / 4 - 3 - pest(sc));
  }
  body += PT(B + dx / 2 + 1.6, y0 + H - dy / 2 + 2.6, sL);
  return pcrop([x0, -0.6, B + dx + pest(sL) + 1, y0 + H + 5.4], body);
};

// A cylinder, upright, with its radius (kind 'r') or diameter ('d') drawn across the top and its height on the left.
const cyl = (v, h, u, kind = 'r') => {
  const R = 8.5, ry = R * 0.33, H = clamp(h * 2.2, 9, 14), sv = plab(v, u), sh = plab(h, u), x0 = -pest(sh) - 2;
  const cx = R, top = ry + 4.6, bot = top + H;
  let body = `<path d="M0,${f2(top)} L0,${f2(bot)} A${R},${f2(ry)} 0 0 0 ${f2(2 * R)},${f2(bot)} L${f2(2 * R)},${f2(top)}" fill="${FRONT}" stroke="${C.charcoal}" stroke-width="0.45"/>`
    + `<path d="M0,${f2(bot)} A${R},${f2(ry)} 0 0 1 ${f2(2 * R)},${f2(bot)}" fill="none" stroke="${C.grey}" stroke-width="0.3" stroke-dasharray="1.1 0.9"/>`
    + `<ellipse cx="${cx}" cy="${f2(top)}" rx="${R}" ry="${f2(ry)}" fill="${TOP}" stroke="${C.charcoal}" stroke-width="0.45"/>`
    + `<circle cx="${cx}" cy="${f2(top)}" r="0.55" fill="${C.charcoal}"/>`;
  body += kind === 'd' ? line(0, top, 2 * R, top, C.blue, 0.6) + PT(cx, top - ry - 1.2, sv, { anchor: 'middle' })
    : line(cx, top, 2 * R, top, C.blue, 0.6) + PT(cx + R / 2, top - ry - 1.2, sv, { anchor: 'middle' });
  body += PT(-1.2, (top + bot) / 2 + 1.2, sh, { anchor: 'end' });
  return pcrop([x0, -0.4, Math.max(2 * R + 1, cx + R / 2 + pest(sv) / 2 + 1), bot + ry + 1], body);
};

module.exports = { ...base, len, area, vol, dp1, d1, shape, dims, rect, square, rightTri, tri, para, trap, rhombus,
  circ, semi, quarter, rectSemi, circle: D.circle, sectorShape: D.sectorShape, cuboid, triPrism, cyl, prism: D.prism };
