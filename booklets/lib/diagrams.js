// Maths diagrams for the booklets (SVG, units in mm). Kept simple and clear so they photocopy well.
const { C, svg, text, line } = require('./graphs');

const rad = (d) => (d * Math.PI) / 180;
const f = (n) => +n.toFixed(2);
const pt = (cx, cy, r, deg) => [f(cx + r * Math.cos(rad(deg))), f(cy - r * Math.sin(rad(deg)))];
const arcPath = (cx, cy, r, a0, a1) => {
  const [x0, y0] = pt(cx, cy, r, a0), [x1, y1] = pt(cx, cy, r, a1);
  const sweep = ((a1 - a0) % 360 + 360) % 360;
  return `<path d="M${x0},${y0} A${r},${r} 0 ${sweep > 180 ? 1 : 0} 0 ${x1},${y1}" fill="none" stroke="${C.blue}" stroke-width="0.35"/>`;
};
const dot = (x, y, r = 0.7, fill = C.charcoal) => `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="${fill}"/>`;
const T = (x, y, s, o = {}) => text(f(x), f(y), s, { size: 3, ...o });

// Number line. marks: { value: 'label' } puts a dot with a label above; blank: no numbers written.
const numberLine = ({ min = -5, max = 5, step = 1, marks = {}, blank = false, w = 88, h = 16, every = 1 }) => {
  const x0 = 5, x1 = w - 5, y = h - 7;
  const n = Math.round((max - min) / step);
  const sx = (v) => x0 + ((v - min) / (max - min)) * (x1 - x0);
  let b = line(x0 - 3, y, x1 + 3, y, C.charcoal, 0.4)
    + `<path d="M${x0 - 3},${y} l1.8,-1 v2 z M${x1 + 3},${y} l-1.8,-1 v2 z" fill="${C.charcoal}"/>`;
  for (let i = 0; i <= n; i++) {
    const v = +(min + i * step).toFixed(4);
    b += line(sx(v), y - 1, sx(v), y + 1, C.charcoal, 0.3);
    if (!blank && i % every === 0) b += T(sx(v), y + 4.2, String(v).replace('-', '−'), { size: 2.5, anchor: 'middle' });
  }
  Object.entries(marks).forEach(([v, lab]) => {
    b += dot(sx(+v), y, 1.1, C.blue);
    if (lab && lab !== true) b += T(sx(+v), y - 2.6, lab, { size: 2.6, anchor: 'middle', weight: 600 });
  });
  return svg(w, h, b);
};

// One angle. labels: [end of arm 1, vertex, end of arm 2]. Arm 1 is horizontal to the right.
const angle = ({ deg, labels = ['', '', ''], arcLabel = '', w = 44, h = 30, rot = 0, dotMark = false }) => {
  const cx = w / 2 - (deg < 90 ? 8 : 0), cy = deg > 180 ? h / 2 : h - 7, R = Math.min(w, h) * 0.5;
  const a1 = rot, a2 = rot + deg;
  const [x1, y1] = pt(cx, cy, R, a1), [x2, y2] = pt(cx, cy, R, a2);
  let b = line(cx, cy, x1, y1, C.charcoal, 0.45) + line(cx, cy, x2, y2, C.charcoal, 0.45) + arcPath(cx, cy, 5, a1, a2);
  const lp = (x, y, a, s) => { const [lx, ly] = pt(x, y, 2.8, a); return T(lx, ly + 1, s, { anchor: 'middle', weight: 600 }); };
  b += lp(x1, y1, a1, labels[0]) + lp(cx, cy, a1 + deg / 2 + 180, labels[1]) + lp(x2, y2, a2, labels[2]);
  if (arcLabel) { const [ax, ay] = pt(cx, cy, 9.5, a1 + deg / 2); b += T(ax, ay + 1, arcLabel, { size: 2.7, anchor: 'middle', fill: C.blue, weight: 600 }); }
  if (dotMark) { const [ax, ay] = pt(cx, cy, 3.2, a1 + deg / 2); b += dot(ax, ay, 0.8); }
  return svg(w, h, b);
};

// Rays from one point. rays: directions in degrees. arcs: [{ from, to, label, right }] between two directions.
// ends: labels at the end of each ray (same order as rays). line: draw rays as full lines through the point.
const rays = ({ rays: dirs, arcs = [], ends = [], centre = '', w = 60, h = 36, R = 15, cx, cy }) => {
  cx = cx ?? w / 2; cy = cy ?? h / 2;
  let b = dirs.map((d) => { const [x, y] = pt(cx, cy, R, d); return line(cx, cy, x, y, C.charcoal, 0.45); }).join('');
  arcs.forEach(({ from, to, label, right, r = 5 }) => {
    if (right) {
      const [ax, ay] = pt(cx, cy, 3, from), [bx, by] = pt(cx, cy, 3, to), [mx, my] = pt(cx, cy, 4.24, (from + to) / 2);
      b += `<polyline points="${ax},${ay} ${mx},${my} ${bx},${by}" fill="none" stroke="${C.blue}" stroke-width="0.35"/>`;
    } else b += arcPath(cx, cy, r, from, to);
    if (label) { const [lx, ly] = pt(cx, cy, r + 4.5, (from + ((to - from + 360) % 360) / 2)); b += T(lx, ly + 1, label, { size: 2.6, anchor: 'middle', fill: C.blue, weight: 600 }); }
  });
  ends.forEach((s, i) => { if (s) { const [x, y] = pt(cx, cy, R + 2.8, dirs[i]); b += T(x, y + 1, s, { size: 2.8, anchor: 'middle', weight: 600 }); } });
  if (centre) b += T(cx + 1.5, cy + 4, centre, { size: 2.8, weight: 600 });
  b += dot(cx, cy, 0.6);
  return svg(w, h, b);
};

// Two parallel lines cut by a transversal. marks: [{ line: 'top'|'bottom', pos: 'ur'|'ul'|'ll'|'lr', label }]
// ur = upper right of the intersection, ul = upper left, ll = lower left, lr = lower right.
const parallel = ({ tilt = 62, marks = [], w = 60, h = 38, arrows = true, names = [] }) => {
  const yT = 12, yB = 27, x0 = 4, x1 = w - 4;
  const dx = (yB - yT) / Math.tan(rad(tilt));
  const xT = w / 2 + dx / 2, xB = w / 2 - dx / 2;
  const ext = 8 / Math.tan(rad(tilt));
  let b = line(x0, yT, x1, yT, C.charcoal, 0.45) + line(x0, yB, x1, yB, C.charcoal, 0.45)
    + line(xT + ext, yT - 8, xB - ext, yB + 8, C.charcoal, 0.45);
  if (arrows) [yT, yB].forEach((y) => { b += `<path d="M${x1 - 10},${y - 1.2} l1.8,1.2 l-1.8,1.2" fill="none" stroke="${C.charcoal}" stroke-width="0.4"/>`; });
  const dirs = { ur: [0, tilt], ul: [tilt, 180], ll: [180, 180 + tilt], lr: [180 + tilt, 360] };
  marks.forEach(({ line: which, pos, label }) => {
    const [cx, cy] = which === 'top' ? [xT, yT] : [xB, yB];
    const [a0, a1] = dirs[pos];
    b += arcPath(cx, cy, 3.2, a0, a1);
    const [lx, ly] = pt(cx, cy, 7, (a0 + a1) / 2);
    b += T(lx, ly + 1, label, { size: 2.6, anchor: 'middle', fill: C.blue, weight: 600 });
  });
  names.forEach(([s, x, y]) => { b += T(x, y, s, { size: 2.8, weight: 600 }); });
  return svg(w, h, b);
};

// Polygon from points (mm). vlabels: vertex letters. sides: labels at side midpoints (pushed outwards).
// angles: labels inside each vertex. right: vertex indexes with a right-angle mark. ticks: [[side, n]] equal-side marks.
const polygon = ({ pts, vlabels = [], sides = [], angles = [], right = [], ticks = [], w, h, fill = 'none', dash = [], lines = [], labels = [], arrows = [], angleDist = 7.5 }) => {
  const n = pts.length;
  const cx = pts.reduce((s, p) => s + p[0], 0) / n, cy = pts.reduce((s, p) => s + p[1], 0) / n;
  let b = `<polygon points="${pts.map((p) => p.join(',')).join(' ')}" fill="${fill}" stroke="${C.charcoal}" stroke-width="0.45"/>`;
  lines.forEach(([p1, p2]) => { b += line(p1[0], p1[1], p2[0], p2[1], C.charcoal, 0.45); });
  labels.forEach(([t, x, y]) => { b += T(x, y, t, { size: 3.2, anchor: 'middle', fill: C.blue, weight: 600 }); });
  // arrows: [side index, count] marks a side as parallel with > arrowheads
  arrows.forEach(([i, k]) => {
    const a = pts[i], c = pts[(i + 1) % n], mx = (a[0] + c[0]) / 2, my = (a[1] + c[1]) / 2, dx = c[0] - a[0], dy = c[1] - a[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
    for (let j = 0; j < k; j++) { const px = mx + ux * j * 1.3, py = my + uy * j * 1.3; b += `<polyline points="${f(px - ux * 1.3 - uy * 1)},${f(py - uy * 1.3 + ux * 1)} ${f(px)},${f(py)} ${f(px - ux * 1.3 + uy * 1)},${f(py - uy * 1.3 - ux * 1)}" fill="none" stroke="${C.charcoal}" stroke-width="0.35"/>`; }
  });
  dash.forEach(([p1, p2]) => { b += `<line x1="${p1[0]}" y1="${p1[1]}" x2="${p2[0]}" y2="${p2[1]}" stroke="${C.grey}" stroke-width="0.35" stroke-dasharray="1.2 1"/>`; });
  const out = (x, y, d) => { const dx = x - cx, dy = y - cy, L = Math.hypot(dx, dy) || 1; return [x + (dx / L) * d, y + (dy / L) * d]; };
  vlabels.forEach((s, i) => { if (s) { const [x, y] = out(pts[i][0], pts[i][1], 3); b += T(x, y + 1, s, { size: 2.8, anchor: 'middle', weight: 600 }); } });
  sides.forEach((s, i) => {
    if (!s) return;
    const a = pts[i], c = pts[(i + 1) % n];
    const mx = (a[0] + c[0]) / 2, my = (a[1] + c[1]) / 2;
    const [x, y] = out(mx, my, 3.6);
    b += T(x, y + 1, s, { size: 3, anchor: 'middle' });
  });
  angles.forEach((s, i) => {
    if (!s) return;
    const [x, y] = pts[i];
    const dx = cx - x, dy = cy - y, L = Math.hypot(dx, dy);
    b += T(x + (dx / L) * angleDist, y + (dy / L) * angleDist + 1, s, { size: 3.2, anchor: 'middle', fill: C.blue, weight: 600 });
  });
  right.forEach((i) => {
    const p = pts[i], a = pts[(i + n - 1) % n], c = pts[(i + 1) % n];
    const u = (q) => { const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy); return [dx / L * 2.5, dy / L * 2.5]; };
    const [ax, ay] = u(a), [cx2, cy2] = u(c);
    b += `<polyline points="${p[0] + ax},${p[1] + ay} ${p[0] + ax + cx2},${p[1] + ay + cy2} ${p[0] + cx2},${p[1] + cy2}" fill="none" stroke="${C.charcoal}" stroke-width="0.3"/>`;
  });
  ticks.forEach(([i, k]) => {
    const a = pts[i], c = pts[(i + 1) % n];
    const mx = (a[0] + c[0]) / 2, my = (a[1] + c[1]) / 2, dx = c[0] - a[0], dy = c[1] - a[1], L = Math.hypot(dx, dy);
    for (let j = 0; j < k; j++) {
      const o = (j - (k - 1) / 2) * 1.2, px = mx + (dx / L) * o, py = my + (dy / L) * o;
      b += line(px - (dy / L) * 1.4, py + (dx / L) * 1.4, px + (dy / L) * 1.4, py - (dx / L) * 1.4, C.charcoal, 0.3);
    }
  });
  const W = w || Math.max(...pts.map((p) => p[0])) + 6, H = h || Math.max(...pts.map((p) => p[1])) + 6;
  return svg(W, H, b);
};

// Square grid with shapes drawn on it (for transformations and symmetry). Coordinates are in grid squares.
// shapes: [{ pts: [[x,y]..], fill }], mirror: [x1,y1,x2,y2] dotted line, point: [x,y,label] centre of rotation.
const grid = ({ cols = 12, rows = 8, cell = 4.5, shapes = [], mirror, point, labels = [] }) => {
  const W = cols * cell + 2, H = rows * cell + 2, o = 1;
  let b = '';
  for (let i = 0; i <= cols; i++) b += line(o + i * cell, o, o + i * cell, o + rows * cell, '#d6d3c6', 0.2);
  for (let j = 0; j <= rows; j++) b += line(o, o + j * cell, o + cols * cell, o + j * cell, '#d6d3c6', 0.2);
  shapes.forEach(({ pts, fill = C.lightBlue }) => {
    b += `<polygon points="${pts.map(([x, y]) => `${o + x * cell},${o + y * cell}`).join(' ')}" fill="${fill}" fill-opacity="0.8" stroke="${C.charcoal}" stroke-width="0.4"/>`;
  });
  if (mirror) { const [a, c, d, e] = mirror; b += `<line x1="${o + a * cell}" y1="${o + c * cell}" x2="${o + d * cell}" y2="${o + e * cell}" stroke="${C.charcoal}" stroke-width="0.45" stroke-dasharray="1.5 1.2"/>`; }
  if (point) { b += dot(o + point[0] * cell, o + point[1] * cell, 0.9, C.charcoal) + T(o + point[0] * cell + 1.3, o + point[1] * cell - 1.2, point[2] || '', { size: 2.8, weight: 600 }); }
  labels.forEach(([s, x, y]) => { b += T(o + x * cell, o + y * cell, s, { size: 2.8, weight: 600 }); });
  return svg(W, H, b);
};

// Cartesian number plane. points: [{ x, y, label }], segments: [[x1,y1,x2,y2]], blank: no points.
const plane = ({ min = -5, max = 5, ymin, ymax, cell = 4, points = [], segments = [], poly }) => {
  ymin = ymin ?? min; ymax = ymax ?? max;
  const cols = max - min, rows = ymax - ymin, o = 4;
  const W = cols * cell + 2 * o, H = rows * cell + 2 * o;
  const X = (x) => o + (x - min) * cell, Y = (y) => o + (ymax - y) * cell;
  let b = '';
  for (let x = min; x <= max; x++) b += line(X(x), Y(ymin), X(x), Y(ymax), '#dcd9cc', 0.2);
  for (let y = ymin; y <= ymax; y++) b += line(X(min), Y(y), X(max), Y(y), '#dcd9cc', 0.2);
  if (min <= 0 && max >= 0) b += line(X(0), Y(ymin), X(0), Y(ymax), C.charcoal, 0.4);
  if (ymin <= 0 && ymax >= 0) b += line(X(min), Y(0), X(max), Y(0), C.charcoal, 0.4);
  const ax = Math.max(min, Math.min(0, max)), ay = Math.max(ymin, Math.min(0, ymax));
  for (let x = min; x <= max; x++) if (x !== 0) b += T(X(x), Y(ay) + 3.4, String(x).replace('-', '−'), { size: 2.1, anchor: 'middle' });
  for (let y = ymin; y <= ymax; y++) if (y !== 0) b += T(X(ax) - 1, Y(y) + 0.8, String(y).replace('-', '−'), { size: 2.1, anchor: 'end' });
  b += T(X(max) + 1, Y(ay) + 1, 'x', { size: 2.8, weight: 600 }) + T(X(ax) + 1, Y(ymax) - 1, 'y', { size: 2.8, weight: 600 });
  if (poly) b += `<polyline points="${poly.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')}" fill="none" stroke="${C.blue}" stroke-width="0.5"/>`;
  segments.forEach(([a, c, d, e]) => { b += line(X(a), Y(c), X(d), Y(e), C.blue, 0.5); });
  points.forEach(({ x, y, label }) => { b += dot(X(x), Y(y), 0.9, C.blue) + (label ? T(X(x) + 1.2, Y(y) - 1.2, label, { size: 2.7, weight: 600 }) : ''); });
  return svg(W, H, b);
};

// Rectangular prism drawn in oblique projection with edge labels.
const box = ({ l = '', wd = '', ht = '', w = 56, h = 36, L = 30, H = 16, D = 10 }) => {
  const x = 6, y = h - 6, dx = D * 0.8, dy = D * 0.6;
  const P = (a, c) => `${f(a)},${f(c)}`;
  let b = `<polygon points="${P(x, y)} ${P(x + L, y)} ${P(x + L, y - H)} ${P(x, y - H)}" fill="#eef1f9" stroke="${C.charcoal}" stroke-width="0.45"/>`
    + `<polygon points="${P(x, y - H)} ${P(x + L, y - H)} ${P(x + L + dx, y - H - dy)} ${P(x + dx, y - H - dy)}" fill="#f7f7f7" stroke="${C.charcoal}" stroke-width="0.45"/>`
    + `<polygon points="${P(x + L, y)} ${P(x + L + dx, y - dy)} ${P(x + L + dx, y - H - dy)} ${P(x + L, y - H)}" fill="#e3e3e3" stroke="${C.charcoal}" stroke-width="0.45"/>`;
  b += T(x + L / 2, y + 4, l, { size: 2.7, anchor: 'middle' }) + T(x + L + dx / 2 + 2.5, y - dy / 2 + 1.5, wd, { size: 2.7 }) + T(x - 1.5, y - H / 2 + 1, ht, { size: 2.7, anchor: 'end' });
  return svg(w, h, b);
};

// Triangular prism (oblique). base and height of the triangle, and length.
const triPrism = ({ base = '', tri = '', len = '', w = 60, h = 36 }) => {
  const a = [6, h - 6], c = [28, h - 6], t = [17, h - 24], d = [18, -9];
  const S = (p) => `${f(p[0])},${f(p[1])}`, M = (p) => [p[0] + d[0], p[1] + d[1]];
  let b = `<polygon points="${S(a)} ${S(c)} ${S(t)}" fill="#eef1f9" stroke="${C.charcoal}" stroke-width="0.45"/>`
    + `<polygon points="${S(c)} ${S(M(c))} ${S(M(t))} ${S(t)}" fill="#e3e3e3" stroke="${C.charcoal}" stroke-width="0.45"/>`
    + `<polygon points="${S(t)} ${S(M(t))} ${S(M(a))} ${S(a)}" fill="#f7f7f7" stroke="${C.charcoal}" stroke-width="0.45" stroke-opacity="0.6"/>`
    + `<line x1="${t[0]}" y1="${t[1]}" x2="${t[0]}" y2="${a[1]}" stroke="${C.grey}" stroke-width="0.3" stroke-dasharray="1 0.8"/>`;
  b += T((a[0] + c[0]) / 2, a[1] + 4, base, { size: 2.7, anchor: 'middle' }) + T(t[0] + 1, (t[1] + a[1]) / 2 + 3, tri, { size: 2.5 })
    + T(c[0] + d[0] / 2 + 3, c[1] + d[1] / 2 + 2, len, { size: 2.7 });
  return svg(w, h, b);
};

// Circle with a radius or diameter drawn and labelled.
const circle = ({ label = '', diameter = false, w = 32, h = 32 }) => {
  const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 3;
  let b = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#eef1f9" stroke="${C.charcoal}" stroke-width="0.45"/>` + dot(cx, cy, 0.6);
  b += diameter ? line(cx - r, cy, cx + r, cy, C.blue, 0.45) : line(cx, cy, cx + r, cy, C.blue, 0.45);
  b += T(diameter ? cx : cx + r / 2, cy - 1.5, label, { size: 2.8, anchor: 'middle', weight: 600 });
  return svg(w, h, b);
};

// Spinner. sectors: [{ label, size }] (sizes are relative).
const spinner = ({ sectors, w = 36, h = 36 }) => {
  const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 2;
  const tot = sectors.reduce((s, x) => s + (x.size || 1), 0);
  const fills = [C.lightBlue, '#fff', C.sand, '#e8ecf6', '#d9d6c8', '#fff'];
  let a = 90, b = '';
  sectors.forEach((s, i) => {
    const sw = ((s.size || 1) / tot) * 360;
    const [x0, y0] = pt(cx, cy, r, a), [x1, y1] = pt(cx, cy, r, a - sw);
    b += `<path d="M${cx},${cy} L${x0},${y0} A${r},${r} 0 ${sw > 180 ? 1 : 0} 1 ${x1},${y1} Z" fill="${fills[i % fills.length]}" stroke="${C.charcoal}" stroke-width="0.4"/>`;
    const [lx, ly] = pt(cx, cy, r * 0.62, a - sw / 2);
    b += T(lx, ly + 1.1, s.label, { size: 3.2, anchor: 'middle', weight: 700 });
    a -= sw;
  });
  b += `<path d="M${cx},${cy} L${cx + r * 0.55},${cy - r * 0.3}" stroke="${C.charcoal}" stroke-width="0.7"/>` + dot(cx, cy, 1.1);
  return svg(w, h, b);
};

// A row of squares, some shaded (for ratios and fractions).
const squares = ({ n, shaded, cols = n, size = 5 }) => {
  const rows = Math.ceil(n / cols);
  let b = '';
  for (let i = 0; i < n; i++) {
    const x = 1 + (i % cols) * size, y = 1 + Math.floor(i / cols) * size;
    b += `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${i < shaded ? C.blue : '#fff'}" stroke="${C.charcoal}" stroke-width="0.35"/>`;
  }
  return svg(cols * size + 2, rows * size + 2, b);
};

// Fraction bar: a rectangle split into equal parts, some shaded.
const fractionBar = ({ parts, shaded, w = 60, h = 9 }) => {
  let b = '';
  const pw = (w - 2) / parts;
  for (let i = 0; i < parts; i++) b += `<rect x="${f(1 + i * pw)}" y="1" width="${f(pw)}" height="${h - 2}" fill="${i < shaded ? C.lightBlue : '#fff'}" stroke="${C.charcoal}" stroke-width="0.35"/>`;
  return svg(w, h, b);
};

// Blank protractor-sized space with a starting ray and point, for students to construct or draw angles.
const drawSpace = ({ label = '', w = 80, h = 30, ray = true }) => {
  const x = 8, y = h - 6;
  let b = ray ? line(x, y, x + 34, y, C.charcoal, 0.45) + dot(x, y, 0.8) + T(x - 1, y + 3.5, label, { size: 2.8, weight: 600 }) : '';
  return svg(w, h, b, 'graph template');
};

module.exports = { numberLine, angle, rays, parallel, polygon, grid, plane, box, triPrism, circle, spinner, squares, fractionBar, drawSpace };
