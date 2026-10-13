// Lesson 2.1 Converting units (two pages: Easy, then Medium). See lib/lesson-two.js for the fields.
// Easy: length (km, m, cm, mm) with a conversion chart. Medium: mass, capacity and time with a chart of the facts.
// Nearly every question is a picture of an object with its measurement on it (drawn below); the Medium page ends
// with word problems. From the Chapter 2 review (short-answer question 1): 5.3 km in m, and 1 day in seconds.
const { fmt, problems } = require('../helpers');
const { svg, text, line, C } = require('../../../lib/graphs');

// ---------- units: how many of the smallest unit each one is ----------
const U = { mm: 1, cm: 10, m: 1000, km: 1e6, g: 1, kg: 1e3, t: 1e6, mL: 1, L: 1e3, s: 1, min: 60, h: 3600, day: 86400 };
const WORD = { s: 'second', min: 'minute', h: 'hour', day: 'day' }; // time is written in words
const NAME = { t: 'tonnes', s: 'seconds', min: 'minutes', h: 'hours', day: 'days' };
// 15, 'cm' → '15 cm' · 4, 'min' → '4 minutes' · 1, 'day' → '1 day'
const m = (v, u) => (WORD[u] ? `${fmt(v)} ${WORD[u]}${v === 1 ? '' : 's'}` : `${fmt(v)} ${u}`);
const conv = (v, a, b) => +((v * U[a]) / U[b]).toFixed(9);
const by = (a, b) => (U[a] > U[b] ? `× ${fmt(U[a] / U[b])}` : `÷ ${fmt(U[b] / U[a])}`);
// The working, one step for each jump on the chart: steps(2, ['h', 'min', 's']) → '2 × 60 = 120 minutes, 120 × 60 = 7 200 seconds'
const steps = (v, chain) => chain.slice(1).map((u, i) => { const a = conv(v, chain[0], chain[i]), b = conv(v, chain[0], u); return `${fmt(a)} ${by(chain[i], u)} = ${m(b, u)}`; }).join(', ');
const ask = (v, a, b) => `Change ${m(v, a)} to ${NAME[b] || b}.`;

// A picture question: draw(label, value) shows the measurement; the answer is worked out from the same numbers.
const pic = (draw, v, a, b) => ({ fig: draw(m(v, a), v), t: `Change to ${NAME[b] || b}.`, ans: m(conv(v, a, b), b) });
const pics = (text, list, o = {}) => ({ text, figs: true, cols: 4, items: list.map(({ fig, t }) => ({ fig, t })), ans: list.map((x) => x.ans), ...o });
const EASY = { figH: 22 }; // page 1 also holds the lesson header, so its picture cards are a little shorter

// ---------- drawing (mm) ----------
const f2 = (n) => +n.toFixed(2);
const TS = 3.3; // label size
const XC = C.blue, DC = '#b5532f'; // × arrows blue, ÷ arrows rust
const T = (x, y, s, o = {}) => text(f2(x), f2(y), s, { size: TS, anchor: 'middle', weight: 700, ...o });
const R = (x, y, w, h, fill = '#eef1f9', o = {}) => `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" rx="${o.rx || 0}" fill="${fill}" stroke="${o.stroke || C.charcoal}" stroke-width="${o.sw ?? 0.4}"/>`;
const P = (d, fill = '#eef1f9', o = {}) => `<path d="${d}" fill="${fill}" stroke="${o.stroke || C.charcoal}" stroke-width="${o.sw ?? 0.4}" stroke-linejoin="round"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>`;
const O = (cx, cy, r, fill = '#eef1f9', o = {}) => `<circle cx="${f2(cx)}" cy="${f2(cy)}" r="${f2(r)}" fill="${fill}" stroke="${o.stroke || C.charcoal}" stroke-width="${o.sw ?? 0.4}"/>`;
const E = (cx, cy, rx, ry, fill = '#eef1f9', o = {}) => `<ellipse cx="${f2(cx)}" cy="${f2(cy)}" rx="${f2(rx)}" ry="${f2(ry)}" fill="${fill}" stroke="${o.stroke || C.charcoal}" stroke-width="${o.sw ?? 0.4}"/>`;
// An arrowhead with its tip at (x, y), pointing in direction ang (radians, y down).
const head = (x, y, ang, col = XC, a = 1.5, b = 0.75) => { const c = Math.cos(ang), s = Math.sin(ang); return `<path d="M${f2(x)},${f2(y)} L${f2(x - a * c + b * s)},${f2(y - a * s - b * c)} L${f2(x - a * c - b * s)},${f2(y - a * s + b * c)} Z" fill="${col}"/>`; };
// Measurement arrows: across (label above) or up the side (label on the left).
const dimH = (x1, x2, y, label) => line(x1, y, x2, y, XC, 0.3) + head(x1, y, Math.PI) + head(x2, y, 0)
  + line(x1, y - 1.3, x1, y + 1.3, XC, 0.3) + line(x2, y - 1.3, x2, y + 1.3, XC, 0.3) + T((x1 + x2) / 2, y - 1.6, label);
const dimV = (x, y1, y2, label) => line(x, y1, x, y2, XC, 0.3) + head(x, y1, -Math.PI / 2) + head(x, y2, Math.PI / 2)
  + line(x - 1.3, y1, x + 1.3, y1, XC, 0.3) + line(x - 1.3, y2, x + 1.3, y2, XC, 0.3) + T(x - 1.6, (y1 + y2) / 2 + 1.2, label, { anchor: 'end' });
const est = (s, size = TS) => String(s).length * size * 0.56; // about how wide a label is
// A tall object drawn by body(x) at x..x+w, with its height arrow (and label) on its left.
const tall = (label, w, body) => { const x = est(label) + 3.5; return svg(f2(x + w + 5), 24, dimV(x, 2, 22, label) + body(x + 3)); };

// Length (Easy)
const pencil = (L) => svg(42, 15, dimH(3, 39, 5.8, L) + R(3, 8, 3.2, 5.5, '#f2b8b0', { rx: 0.8 }) + R(6, 8, 2.6, 5.5, '#c9c5b4')
  + R(8.6, 8, 23.4, 5.5, '#f3d36b') + line(8.6, 9.85, 32, 9.85, '#c9a43a', 0.25) + line(8.6, 11.65, 32, 11.65, '#c9a43a', 0.25)
  + P('M32,8 L39,10.75 L32,13.5 Z', '#f1d9b0') + P('M36.6,9.83 L39,10.75 L36.6,11.67 Z', C.charcoal));
const ruler = (L) => {
  let b = dimH(3, 39, 5.8, L) + R(3, 8, 36, 6.2, '#f3e2b3', { rx: 0.6 });
  for (let i = 0; i <= 30; i++) { const x = 4 + i * (34 / 30); b += line(x, 8, x, 8 + (i % 10 === 0 ? 3 : i % 5 === 0 ? 2.2 : 1.3), C.charcoal, 0.2); }
  return svg(42, 15.5, b);
};
const nail = (L) => svg(42, 15, dimH(3, 39, 5.8, L) + R(4.6, 10.2, 29.6, 1.6, '#c9c5b4') + P('M34.2,10.2 L39,11 L34.2,11.8 Z', '#c9c5b4') + R(3, 8, 1.8, 6, '#c9c5b4', { rx: 0.4 }));
const surfboard = (L) => svg(42, 17, dimH(3, 39, 5.8, L) + P('M3,12 C3,9.2 9,8.4 19,8.4 C29,8.4 35.5,10 39,12 C35.5,14 29,15.6 19,15.6 C9,15.6 3,14.8 3,12 Z', '#f7e3a1') + line(5.5, 12, 36.5, 12, XC, 0.5));
const fish = (L) => svg(42, 18.5, dimH(3, 39, 5.8, L) + P('M3,8.6 L10,13 L3,17.4 Z', '#9fb3e6') + E(24, 13, 15, 5, '#c6d3f1')
  + P('M30.5,9.2 Q28.6,13 30.5,16.8', 'none', { sw: 0.3 }) + O(34.5, 11.8, 0.8, C.charcoal, { sw: 0 }));
const coin = (L) => svg(40, 22.5, O(20, 11.5, 10, '#e8c766') + O(20, 11.5, 8.6, 'none', { stroke: '#b8962e', sw: 0.3 })
  + line(10.4, 11.5, 29.6, 11.5, XC, 0.3) + head(10.2, 11.5, Math.PI) + head(29.8, 11.5, 0) + T(20, 9.7, L));
const door = (L) => tall(L, 12, (x) => R(x, 2, 12, 20, '#e8d3b5') + R(x + 2, 4, 8, 7, 'none', { sw: 0.3 }) + R(x + 2, 13, 8, 7, 'none', { sw: 0.3 })
  + O(x + 10, 12.3, 0.7, C.charcoal, { sw: 0 }) + line(x - 3, 22, x + 15, 22, C.charcoal, 0.5));
const tree = (L) => tall(L, 14, (x) => R(x + 5.6, 14, 2.8, 8, '#b5835a') + E(x + 7, 8.5, 7, 6.5, '#9fcf8f') + line(x - 3, 22, x + 17, 22, C.charcoal, 0.5));
const phone = (L) => tall(L, 11, (x) => R(x, 2, 11, 20, C.charcoal, { rx: 1.6 }) + R(x + 1, 4.2, 9, 14.6, '#9fb3e6', { sw: 0 }) + O(x + 5.5, 20.4, 0.7, '#fff', { sw: 0 }));
const sign = (place) => (L) => svg(40, 23, R(19, 13, 2, 9.5, '#c9c5b4', { sw: 0.3 }) + R(2, 1, 36, 13, '#2f7d4f', { rx: 1.5 }) + R(3, 2, 34, 11, 'none', { rx: 1, stroke: '#fff', sw: 0.3 })
  + T(20, 6.6, place, { fill: '#fff', size: 3.2 }) + T(17, 11.8, L, { fill: '#fff', size: 3.6 }) + line(27.5, 10.6, 32.5, 10.6, '#fff', 0.6) + head(34, 10.6, 0, '#fff', 1.7, 1));
const track = (L) => svg(40, 22, R(4, 1.5, 32, 14, '#e39a7f', { rx: 7 }) + R(6.8, 3.5, 26.4, 10, 'none', { rx: 5, stroke: '#fff', sw: 0.3 })
  + R(9.5, 5.5, 21, 6, '#bfe0a8', { rx: 3 }) + T(20, 20.6, `1 lap = ${L}`));
const trail = (L) => svg(42, 21, T(21, 3.8, `Fun run: ${L}`) + P('M4,18 C10,8 16,21 23,14 S32,9 36,16', 'none', { stroke: '#e39a7f', sw: 1.1, dash: '1.6 1' })
  + O(4, 18, 1, C.charcoal, { sw: 0 }) + line(36, 16, 36, 7.4, C.charcoal, 0.4) + P('M36,7.4 L40.5,9 L36,10.6 Z', '#c0392b', { sw: 0.2 }));

// Mass, capacity and time (Medium)
const bag = (name) => (L) => svg(30, 24, P('M6.5,4.5 L23.5,4.5 L26,22 Q15,23.6 4,22 Z', '#f5efe0') + P('M6.5,4.5 L8,2 L10,4.5 L12,2 L14,4.5 L16,2 L18,4.5 L20,2 L22,4.5 L23.5,2 L23.5,4.5', 'none', { sw: 0.3 })
  + T(15, 11.6, name, { size: 2.8, fill: DC }) + T(15, 17.8, L, { size: 3.6 }));
const scale = (L) => svg(40, 23, O(14, 8.4, 3, '#e06c5a') + O(26, 8.4, 3, '#e06c5a') + O(20, 7.4, 3.2, '#e06c5a') + line(20, 4.2, 20.6, 2.6, C.charcoal, 0.4)
  + R(6, 11.4, 28, 1.6, '#c9c5b4') + P('M5,13 L35,13 L33,22 L7,22 Z', '#d7dbe6') + R(11.5, 14.6, 17, 5.6, '#f4f8ec', { rx: 0.8 }) + T(20, 18.6, L));
const truck = (L) => svg(44, 22, R(3, 4, 24, 11, '#f3d36b') + T(15, 11.4, L, { size: 3.6 }) + P('M28,7.5 L36,7.5 L40.5,12 L40.5,16.5 L28,16.5 Z', '#9fb3e6')
  + P('M30,9 L35.3,9 L38.2,12 L30,12 Z', '#fff', { sw: 0.3 }) + R(3, 15, 37.5, 2.2, C.charcoal, { sw: 0 })
  + O(9, 18.6, 2.7, C.charcoal, { sw: 0 }) + O(9, 18.6, 1, '#c9c5b4', { sw: 0 }) + O(34, 18.6, 2.7, C.charcoal, { sw: 0 }) + O(34, 18.6, 1, '#c9c5b4', { sw: 0 }));
const car = (L) => svg(43, 21, P('M3,16.5 L3,12.5 Q4,11 8,10.5 L13,6 Q14.5,5 17,5 L27,5 Q29,5 30.5,6.4 L34.5,10.5 Q38.5,11 40,12.5 L40,16.5 Z', '#e39a7f')
  + P('M14.6,10.2 L17.4,6.6 L21.2,6.6 L21.2,10.2 Z', '#fff', { sw: 0.3 }) + P('M23,10.2 L23,6.6 L28,6.6 L31.6,10.2 Z', '#fff', { sw: 0.3 })
  + O(11, 17, 3, C.charcoal, { sw: 0 }) + O(11, 17, 1.1, '#c9c5b4', { sw: 0 }) + O(32, 17, 3, C.charcoal, { sw: 0 }) + O(32, 17, 1.1, '#c9c5b4', { sw: 0 }) + T(21.5, 14.8, L));
const bottle = (L) => svg(22, 24, P('M8.6,3 L13.4,3 L13.4,5.4 Q17,7 17,10.5 L17,22 Q17,23 16,23 L6,23 Q5,23 5,22 L5,10.5 Q5,7 8.6,5.4 Z', '#cfe3f5')
  + R(8.3, 0.8, 5.4, 2.4, XC, { rx: 0.4 }) + R(5, 12, 12, 6.6, '#fff', { sw: 0.3 }) + T(11, 16.6, L));
const jug = (L) => svg(34, 24, P('M24.6,6 Q30.5,6 30,12 Q29.5,17.5 23.8,17.5', 'none', { sw: 1.2 }) + P('M7.5,11 L24.7,11 L23.5,22.5 L8.5,22.5 Z', '#9fc4ef', { sw: 0 })
  + P('M7,3 L4.6,1.8 L6.6,4.6 L8.5,22.5 L23.5,22.5 L25.2,3 Z', 'none') + [7, 11, 15, 19].map((y) => line(f2(7.6 + (y - 3) * 0.05), y, f2(11 + (y - 3) * 0.05), y, C.charcoal, 0.3)).join('')
  + T(16.2, 18.2, L));
const can = (L) => svg(24, 24, R(5, 3, 14, 19, '#e06c5a', { sw: 0 }) + line(5, 3, 5, 22, C.charcoal, 0.4) + line(19, 3, 19, 22, C.charcoal, 0.4)
  + P('M5,22 A7,1.5 0 0 0 19,22', '#e06c5a') + E(12, 3, 7, 1.5, '#d7dbe6') + R(5, 9.4, 14, 6.6, '#fff', { sw: 0.3 }) + T(12, 14, L, { size: 3.1 }));
const bucket = (L) => svg(30, 24, P('M6,8 Q15,-3.5 24,8', 'none', { sw: 0.5 }) + P('M4.5,7 L25.5,7 L23,22.5 L7,22.5 Z', '#9fb3e6') + R(4, 6.2, 22, 1.6, '#c6d3f1', { rx: 0.6 }) + T(15, 16.8, L, { size: 3.6 }));
const stopwatch = (L) => {
  let b = R(8.6, 2.6, 2.8, 2.4, '#c9c5b4', { rx: 0.3 }) + O(10, 14, 8.2, '#eef1f9') + O(10, 14, 6.8, '#fff', { sw: 0.2 });
  for (let k = 0; k < 12; k++) { const a = (k * Math.PI) / 6; b += line(10 + 5.6 * Math.sin(a), 14 - 5.6 * Math.cos(a), 10 + 6.6 * Math.sin(a), 14 - 6.6 * Math.cos(a), C.charcoal, 0.3); }
  return svg(40, 24, b + line(10, 14, 13.4, 9.6, DC, 0.5) + O(10, 14, 0.7, C.charcoal, { sw: 0 }) + T(21, 15.2, L, { anchor: 'start' }));
};
const hourglass = (L) => svg(40, 24, P('M4.5,3.6 L13.5,3.6 L9.8,12 L13.5,20.4 L4.5,20.4 L8.2,12 Z', '#f4f7fc') + P('M6.1,7.2 L11.9,7.2 L9.7,12 L8.3,12 Z', '#e8c766', { sw: 0 })
  + P('M5.6,20.4 L12.4,20.4 L9,16.4 Z', '#e8c766', { sw: 0 }) + R(3, 2, 12, 1.6, '#b5835a', { rx: 0.4 }) + R(3, 20.4, 12, 1.6, '#b5835a', { rx: 0.4 }) + T(18, 13.2, L, { anchor: 'start' }));
const calendar = (L, n) => {
  let b = R(2, 1.5, 36, 16.5, '#fff') + R(2, 1.5, 36, 4.4, XC, { sw: 0.4 });
  for (let r = 0; r < 2; r++) for (let c = 0; c < 7; c++) b += R(2 + c * (36 / 7), 5.9 + r * 6.05, 36 / 7, 6.05, r === 0 && c >= 2 && c < 2 + n ? '#f3d36b' : '#fff', { sw: 0.25 });
  return svg(40, 23.5, b + T(20, 22.4, `Camp: ${L}`));
};
const sunMoon = (L) => {
  let b = '';
  for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4; b += line(10 + 5.2 * Math.cos(a), 8.5 + 5.2 * Math.sin(a), 10 + 7 * Math.cos(a), 8.5 + 7 * Math.sin(a), '#c9a43a', 0.5); }
  return svg(40, 21.5, b + O(10, 8.5, 4, '#f3d36b') + P('M30,3 A6,6 0 1 0 35.5,12.6 A4.6,4.6 0 1 1 30,3 Z', '#c9c5b4') + T(20, 9.7, '+', { size: 4 }) + T(20, 20, L, { size: 3.6 }));
};

// ---------- the conversion charts (WE DO) ----------
// Easy: km → m → cm → mm, × over the top and ÷ underneath.
const lengthChart = () => {
  const u = ['km', 'm', 'cm', 'mm'], bw = 13, bh = 9, gap = 10, top = 15.5, bx = (i) => 2 + i * (bw + gap);
  let b = T(2, 3.8, 'Big unit → small unit: × (multiply)', { anchor: 'start', fill: XC, size: 3.2 }) + T(2, 39.2, 'Small unit → big unit: ÷ (divide)', { anchor: 'start', fill: DC, size: 3.2 });
  u.forEach((s, i) => { b += R(bx(i), top, bw, bh, '#eef1f9', { rx: 1.2 }) + T(bx(i) + bw / 2, top + bh / 2 + 1.4, s, { size: 3.9 }); });
  u.slice(1).forEach((s, i) => {
    const x1 = bx(i) + bw / 2 + 1.5, x2 = bx(i + 1) + bw / 2 - 1.5, mx = (x1 + x2) / 2;
    const ya = top - 0.5, ca = top - 9.4, yb = top + bh + 0.5, cb = yb + 9.4;
    b += P(`M${f2(x1)},${f2(ya)} Q${f2(mx)},${f2(ca)} ${f2(x2)},${f2(ya)}`, 'none', { stroke: XC, sw: 0.45 }) + head(x2, ya, Math.atan2(ya - ca, x2 - mx), XC)
      + T(mx, (ya + ca) / 2 - 1.3, by(u[i], s), { fill: XC, size: 3.2 });
    b += P(`M${f2(x2)},${f2(yb)} Q${f2(mx)},${f2(cb)} ${f2(x1)},${f2(yb)}`, 'none', { stroke: DC, sw: 0.45 }) + head(x1, yb, Math.atan2(yb - cb, x1 - mx), DC)
      + T(mx, (yb + cb) / 2 + 3.6, by(s, u[i]), { fill: DC, size: 3.2 });
  });
  return svg(86, 41, b);
};
// Medium: mass, capacity and time, each a row of units with × and ÷ between them.
const factsChart = () => {
  const rows = [['Mass', ['t', 'kg', 'g']], ['Capacity', ['L', 'mL']], ['Time', ['day', 'h', 'min', 's']]];
  const bw = 11, bh = 9.5, gap = 12, rh = 16.6, bx = (i) => 2 + i * (bw + gap);
  let b = '';
  rows.forEach(([name, u], r) => {
    const y0 = r * rh, top = y0 + 5;
    b += T(2, y0 + 3.6, name, { anchor: 'start', size: 3.2 });
    u.forEach((s, i) => { b += R(bx(i), top, bw, bh, '#eef1f9', { rx: 1.2 }) + T(bx(i) + bw / 2, top + bh / 2 + 1.3, s, { size: 3.7 }); });
    u.slice(1).forEach((s, i) => {
      const x1 = bx(i) + bw + 1, x2 = bx(i + 1) - 1, mx = (x1 + x2) / 2;
      b += line(x1, top + 4.1, x2 - 1, top + 4.1, XC, 0.4) + head(x2, top + 4.1, 0, XC, 1.4, 0.7) + T(mx, top + 2.7, by(u[i], s), { fill: XC, size: 2.9 });
      b += line(x1 + 1, top + 5.6, x2, top + 5.6, DC, 0.4) + head(x1, top + 5.6, Math.PI, DC, 1.4, 0.7) + T(mx, top + 9.1, by(s, u[i]), { fill: DC, size: 2.9 });
    });
  });
  return svg(84, f2(3 * rh + 3.6), b + T(2, 3 * rh + 2.6, 't = tonnes · h = hours · min = minutes · s = seconds', { anchor: 'start', size: 2.9, weight: 500 }));
};

// ---------- the questions ----------
const ex1 = [[4, 'm', 'cm'], [7, 'cm', 'mm'], [3000, 'm', 'km'], [250, 'cm', 'm']];
const ex2 = [[3, ['kg', 'g']], [2500, ['mL', 'L']], [5, ['min', 's']], [2, ['h', 'min', 's']]];
const fact = (a, b) => `1 ${WORD[a] || a} = ${m(U[a] / U[b], b)}`;
const run = { km: 5.3, done: 2800 }; // the review's 5.3 km
const juice = { L: 2, glass: 250 };

module.exports = {
  code: '2.1', title: 'Converting units',
  li: 'convert between units of length, mass, capacity and time.',
  sc: ['change between km, m, cm and mm', 'change between g, kg and t, and between mL and L', 'change between seconds, minutes, hours and days'],
  easy: {
    ex: { stem: 'Use the chart. Big unit to small unit: multiply. Small unit to big unit: divide.', fig: lengthChart(),
      parts: ex1.map(([v, a, b]) => ask(v, a, b)) },
    exAns: ex1.map(([v, a, b]) => steps(v, [a, b])),
    hint: `${fact('km', 'm')} · ${fact('m', 'cm')} · ${fact('cm', 'mm')} · Big unit → small unit: × · Small unit → big unit: ÷.`,
    rounds: [
      pics('change each length to the smaller unit. Multiply (×).', [pic(pencil, 15, 'cm', 'mm'), pic(door, 2, 'm', 'cm'), pic(sign('Kingscliff'), 12, 'km', 'm'), pic(ruler, 30, 'cm', 'mm')], EASY),
      pics('change each length to the bigger unit. Divide (÷).', [pic(coin, 25, 'mm', 'cm'), pic(tree, 600, 'cm', 'm'), pic(track, 400, 'm', 'km'), pic(nail, 30, 'mm', 'cm')], EASY),
      pics('multiply or divide? Change each length to the unit shown.', [pic(surfboard, 1.8, 'm', 'cm'), pic(fish, 45, 'cm', 'm'), pic(trail, 2.5, 'km', 'm'), pic(phone, 150, 'mm', 'cm')], EASY),
    ],
  },
  medium: {
    ex: { stem: 'Mass and capacity use × 1 000. Time uses × 60 and × 24.', fig: factsChart(),
      parts: ex2.map(([v, c]) => ask(v, c[0], c[c.length - 1])) },
    exAns: ex2.map(([v, c]) => steps(v, c)),
    hint: `${fact('t', 'kg')} · ${fact('kg', 'g')} · ${fact('L', 'mL')} · ${fact('day', 'h')} · ${fact('h', 'min')} · ${fact('min', 's')}.`,
    rounds: [
      pics('mass. Change each one to the unit shown.', [pic(bag('FLOUR'), 2, 'kg', 'g'), pic(scale, 750, 'g', 'kg'), pic(truck, 3, 't', 'kg'), pic(car, 1500, 'kg', 't')]),
      pics('capacity. Change each one to the unit shown.', [pic(bottle, 1.5, 'L', 'mL'), pic(jug, 500, 'mL', 'L'), pic(can, 375, 'mL', 'L'), pic(bucket, 9, 'L', 'mL')]),
      pics('time. Change each one to the unit shown.', [pic(stopwatch, 4, 'min', 's'), pic(hourglass, 180, 's', 'min'), pic(calendar, 3, 'day', 'h'), pic(sunMoon, 1, 'day', 's')]),
      problems('solve each problem. Show your working.', [
        [`Ava is in a ${m(run.km, 'km')} fun run. Ava has run ${m(run.done, 'm')} so far. How many metres does Ava still have to run?`,
          `${m(conv(run.km, 'km', 'm'), 'm')} − ${m(run.done, 'm')} = ${m(conv(run.km, 'km', 'm') - run.done, 'm')}`],
        [`A jug holds ${m(juice.L, 'L')} of juice. Each glass holds ${m(juice.glass, 'mL')}. How many glasses can Leo fill?`,
          `${m(conv(juice.L, 'L', 'mL'), 'mL')} ÷ ${m(juice.glass, 'mL')} = ${fmt(conv(juice.L, 'L', 'mL') / juice.glass)} glasses`],
      ]),
    ],
  },
};
