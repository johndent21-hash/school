// Graphs and drawing templates for the booklets.
// SVG units are millimetres: a viewBox 88 wide prints 88 mm wide when shown at full width.

const C = {
  blue: '#3f63be', charcoal: '#3d3b3c', sand: '#c2bea8', lightBlue: '#9fb3e6', grey: '#7d7a70',
  grid: '#e2dfd3', gridMajor: '#c9c5b4', ink: '#26292e',
};

const svg = (w, h, body, cls = 'graph') =>
  `<svg class="${cls}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" style="aspect-ratio:${w}/${h}; --w:${w}mm; --ar:${w}/${h}">${body}</svg>`;

const text = (x, y, t, { size = 2.6, anchor = 'start', weight = 400, fill = C.ink, rotate = null } = {}) =>
  `<text x="${+x.toFixed ? x.toFixed(2) : x}" y="${+y.toFixed ? y.toFixed(2) : y}" font-size="${size}" text-anchor="${anchor}" font-weight="${weight}" fill="${fill}"${rotate !== null ? ` transform="rotate(${rotate} ${x} ${y})"` : ''}>${t}</text>`;

const multiline = (x, y, t, opts) => String(t).split('\n').map((line, i) => text(x, y + i * (opts.size || 2.6) * 1.15, line, opts)).join('');
const line = (x1, y1, x2, y2, stroke, width) => `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="${stroke}" stroke-width="${width}"/>`;
const title = (w, t) => text(w / 2, 4.5, t, { size: 3, anchor: 'middle', weight: 600 });

// The dot-circle symbol echoes the circles in Marni Tuala's artwork.
const symbol = (cx, cy, part = 1) => {
  const dots = [];
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * 2 * Math.PI;
    const x = Math.sin(a) * 2.25, y = -Math.cos(a) * 2.25;
    if (part < 1 && x > 0.01) continue;
    dots.push(`<circle cx="${(cx + x).toFixed(2)}" cy="${(cy + y).toFixed(2)}" r="0.5" fill="${C.sand}"/>`);
  }
  const centre = part < 1
    ? `<path d="M${cx},${cy - 1.4} A1.4,1.4 0 0 0 ${cx},${cy + 1.4} Z" fill="${C.blue}"/>`
    : `<circle cx="${cx}" cy="${cy}" r="1.4" fill="${C.blue}"/>`;
  return centre + dots.join('');
};
const inlineSymbol = `<svg class="sym" viewBox="-2.9 -2.9 5.8 5.8">${symbol(0, 0)}</svg>`;

const pictureGraph = ({ title: t, rows, key, w = 88, labelW = 22 }) => {
  const rowH = 6.2, top = 8;
  let body = title(w, t);
  rows.forEach(([label, n], i) => {
    const y = top + i * rowH + rowH / 2;
    body += text(2, y + 0.9, label, { size: 2.6 });
    for (let s = 0; s < Math.ceil(n); s++) body += symbol(labelW + 3 + s * 6, y, n - s === 0.5 ? 0.5 : 1);
  });
  const ky = top + rows.length * rowH + 4.5;
  body += `<rect x="${w - 40}" y="${ky - 3.6}" width="38" height="7" rx="1.2" fill="none" stroke="${C.sand}" stroke-width="0.3"/>`;
  body += symbol(w - 36, ky - 0.1) + text(w - 32.5, ky + 0.9, `= ${key}`, { size: 2.6 });
  return svg(w, ky + 4.5, body);
};

// Vertical scale: either a regular scale (yMin..max by step) or a list of `ticks` drawn equally spaced
// (used to show an uneven, misleading scale). `breakAxis` draws a zigzag to show the axis does not start at 0.
const makeScale = ({ yMin = 0, max, step, ticks, yb, yt }) => {
  if (ticks) {
    const gap = (yb - yt) / (ticks.length - 1);
    const sy = (v) => {
      for (let i = 0; i < ticks.length - 1; i++) {
        if (v <= ticks[i + 1]) return yb - (i + (v - ticks[i]) / (ticks[i + 1] - ticks[i])) * gap;
      }
      return yt;
    };
    return { sy, lines: ticks.map((v) => ({ v, major: true })) };
  }
  const sy = (v) => yb - ((v - yMin) / (max - yMin)) * (yb - yt);
  const lines = [];
  for (let v = yMin; v <= max + 1e-9; v += step) lines.push({ v: +v.toFixed(4) });
  return { sy, lines };
};

const axes = (x0, x1, yb, yt) =>
  line(x0, yt - 1, x0, yb, C.charcoal, 0.35) + line(x0, yb, x1, yb, C.charcoal, 0.35);

const columnGraph = ({ title: t, cats, values, max, step = 1, labelEvery = step, yMin = 0, ticks, yTitle, xTitle,
  w = 88, h = 54, breakAxis = false, bars = C.blue, valueLabels = false }) => {
  const x0 = 13, x1 = w - 2, yb = h - (xTitle ? 13 : 10), yt = 8;
  const { sy, lines } = makeScale({ yMin, max, step, ticks, yb, yt });
  let body = title(w, t);
  lines.forEach(({ v }) => {
    const major = ticks ? true : Math.abs(((v - yMin) / labelEvery) - Math.round((v - yMin) / labelEvery)) < 1e-6;
    body += line(x0, sy(v), x1, sy(v), major ? C.gridMajor : C.grid, major ? 0.25 : 0.18);
    if (major) body += text(x0 - 1.2, sy(v) + 0.9, v, { size: 2.4, anchor: 'end' });
  });
  const bw = (x1 - x0) / cats.length;
  cats.forEach((c, i) => {
    const x = x0 + i * bw;
    const fill = Array.isArray(bars) ? bars[i] : bars;
    body += `<rect x="${(x + bw * 0.18).toFixed(2)}" y="${sy(values[i]).toFixed(2)}" width="${(bw * 0.64).toFixed(2)}" height="${(yb - sy(values[i])).toFixed(2)}" fill="${fill}"/>`;
    if (valueLabels) body += text(x + bw / 2, sy(values[i]) - 0.8, values[i], { size: 2.3, anchor: 'middle', weight: 600 });
    body += multiline(x + bw / 2, yb + 3.2, c, { size: 2.3, anchor: 'middle' });
  });
  body += axes(x0, x1, yb, yt);
  if (breakAxis) body += `<polyline points="${x0 - 1.4},${yb - 2} ${x0 + 1.4},${yb - 3} ${x0 - 1.4},${yb - 4} ${x0 + 1.4},${yb - 5}" fill="#fff" stroke="${C.charcoal}" stroke-width="0.35"/>`;
  body += text(3, (yt + yb) / 2, yTitle, { size: 2.4, anchor: 'middle', rotate: -90 });
  if (xTitle) body += text((x0 + x1) / 2, h - 1.5, xTitle, { size: 2.4, anchor: 'middle' });
  return svg(w, h, body);
};

const lineGraph = ({ title: t, xs, ys, max, yMin = 0, step = 1, labelEvery = 5, yTitle, xTitle, w = 88, h = 48 }) => {
  const x0 = 13, x1 = w - 3, yb = h - 10, yt = 8;
  const { sy, lines } = makeScale({ yMin, max, step, yb, yt });
  const sx = (i) => x0 + 3 + i * ((x1 - x0 - 6) / (xs.length - 1));
  let body = title(w, t);
  lines.forEach(({ v }) => {
    const major = Math.abs(((v - yMin) / labelEvery) - Math.round((v - yMin) / labelEvery)) < 1e-6;
    body += line(x0, sy(v), x1, sy(v), major ? C.gridMajor : C.grid, major ? 0.25 : 0.15);
    if (major) body += text(x0 - 1.2, sy(v) + 0.9, v, { size: 2.4, anchor: 'end' });
  });
  xs.forEach((m, i) => {
    body += line(sx(i), yt, sx(i), yb, C.grid, 0.15);
    body += text(sx(i), yb + 3.2, m, { size: 2.2, anchor: 'middle' });
  });
  body += `<polyline points="${ys.map((v, i) => `${sx(i).toFixed(2)},${sy(v).toFixed(2)}`).join(' ')}" fill="none" stroke="${C.blue}" stroke-width="0.6"/>`;
  body += ys.map((v, i) => `<circle cx="${sx(i).toFixed(2)}" cy="${sy(v).toFixed(2)}" r="0.75" fill="${C.blue}"/>`).join('');
  body += axes(x0, x1, yb, yt);
  body += text(3, (yt + yb) / 2, yTitle, { size: 2.4, anchor: 'middle', rotate: -90 });
  body += text((x0 + x1) / 2, h - 1.8, xTitle, { size: 2.4, anchor: 'middle' });
  return svg(w, h, body);
};

// Slices: [label, value, colour, labelInside]. Numbers are not shown unless the label includes them.
const sectorGraph = ({ title: t, slices, w = 88, h = 48 }) => {
  const cx = w / 2 + 4, cy = 28.5, r = 16.5;
  const total = slices.reduce((s, x) => s + x[1], 0);
  let a0 = 0, body = title(w, t);
  const pt = (a, rr) => [cx + rr * Math.sin(a), cy - rr * Math.cos(a)];
  slices.forEach(([label, v, fill, inside]) => {
    const a1 = a0 + (v / total) * 2 * Math.PI;
    const [xA, yA] = pt(a0, r), [xB, yB] = pt(a1, r);
    body += `<path d="M${cx},${cy} L${xA.toFixed(2)},${yA.toFixed(2)} A${r},${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${xB.toFixed(2)},${yB.toFixed(2)} Z" fill="${fill}" stroke="#fff" stroke-width="0.4"/>`;
    const mid = (a0 + a1) / 2;
    if (inside) {
      const [lx, ly] = pt(mid, r * 0.55);
      body += multiline(lx, ly + 1, label, { size: 2.6, anchor: 'middle', weight: 600, fill: '#fff' });
    } else {
      const [ex, ey] = pt(mid, r * 0.85), [ox, oy] = pt(mid, r + 3);
      const left = ox < cx;
      body += `<polyline points="${ex.toFixed(2)},${ey.toFixed(2)} ${ox.toFixed(2)},${oy.toFixed(2)} ${(ox + (left ? -2 : 2)).toFixed(2)},${oy.toFixed(2)}" fill="none" stroke="${C.charcoal}" stroke-width="0.2"/>`;
      body += text(ox + (left ? -2.6 : 2.6), oy + 0.9, label, { size: 2.6, anchor: left ? 'end' : 'start' });
    }
    a0 = a1;
  });
  return svg(w, h, body);
};

// Divided bar graph with a 0–100% scale underneath. parts: [label, percent, colour, darkText]
// Wide parts are labelled inside the bar; narrow parts are named in a legend under the scale.
const dividedBar = ({ title: t, parts, w = 88 }) => {
  const x0 = 4, x1 = w - 4, y0 = 9, bh = 11;
  let x = x0, body = title(w, t);
  const legend = [];
  parts.forEach(([label, pct, fill, dark]) => {
    const bw = ((x1 - x0) * pct) / 100;
    body += `<rect x="${x.toFixed(2)}" y="${y0}" width="${bw.toFixed(2)}" height="${bh}" fill="${fill}" stroke="#fff" stroke-width="0.4"/>`;
    if (bw > 12) body += text(x + bw / 2, y0 + bh / 2 + 0.9, label, { size: 2.4, anchor: 'middle', weight: 600, fill: dark ? C.ink : '#fff' });
    else legend.push([label, fill]);
    x += bw;
  });
  const sy = y0 + bh + 1.5;
  body += line(x0, sy, x1, sy, C.charcoal, 0.3);
  for (let p = 0; p <= 100; p += 10) {
    const px = x0 + ((x1 - x0) * p) / 100;
    body += line(px, sy, px, sy + (p % 50 === 0 ? 1.8 : 1.1), C.charcoal, 0.3);
    if (p % 20 === 0) body += text(px, sy + 4.4, `${p}%`, { size: 2.2, anchor: 'middle' });
  }
  let lx = x0, ly = sy + 9;
  legend.forEach(([label, fill]) => {
    body += `<rect x="${lx}" y="${ly - 2.2}" width="3" height="3" fill="${fill}"/>` + text(lx + 4, ly + 0.4, label, { size: 2.4 });
    lx += 6 + label.length * 1.5;
  });
  return svg(w, ly + (legend.length ? 3 : -4), body);
};

// Dot plot. counts: { value: frequency }
const dotPlot = ({ title: t, min, max, step = 1, counts, xTitle, w = 88, dotR = 1.25, h }) => {
  const maxCount = Math.max(...Object.values(counts));
  const x0 = 5, x1 = w - 5, gap = dotR * 2 + 0.6;
  const height = h || Math.max(22, (t ? 9 : 3) + maxCount * gap + (xTitle ? 11 : 8));
  const yb = height - 10;
  const n = Math.round((max - min) / step);
  const sx = (v) => x0 + ((v - min) / (max - min)) * (x1 - x0);
  let body = t ? title(w, t) : '';
  body += line(x0 - 2, yb, x1 + 2, yb, C.charcoal, 0.35);
  for (let i = 0; i <= n; i++) {
    const v = +(min + i * step).toFixed(4);
    body += line(sx(v), yb, sx(v), yb + 1.4, C.charcoal, 0.3);
    body += text(sx(v), yb + 4.2, v, { size: 2.3, anchor: 'middle' });
  }
  Object.entries(counts).forEach(([v, c]) => {
    for (let k = 0; k < c; k++) body += `<circle cx="${sx(+v).toFixed(2)}" cy="${(yb - dotR - 0.6 - k * gap).toFixed(2)}" r="${dotR}" fill="${C.blue}"/>`;
  });
  if (xTitle) body += text((x0 + x1) / 2, height - 1.5, xTitle, { size: 2.4, anchor: 'middle' });
  return svg(w, height, body);
};

// Blank number line for students to draw a dot plot on. labels=false leaves the scale for students to write.
const dotPlotTemplate = ({ min = 0, max = 10, step = 1, labels = true, ticks, w = 176, h = 34, xTitle = '' }) => {
  const x0 = 6, x1 = w - 6, yb = h - 9;
  const n = ticks || Math.round((max - min) / step);
  let body = line(x0 - 3, yb, x1 + 3, yb, C.charcoal, 0.4);
  for (let i = 0; i <= n; i++) {
    const x = x0 + (i / n) * (x1 - x0);
    body += line(x, yb, x, yb + 1.6, C.charcoal, 0.35);
    if (labels) body += text(x, yb + 4.6, +(min + i * step).toFixed(4), { size: 2.6, anchor: 'middle' });
  }
  if (xTitle) body += text(w / 2, h - 0.8, xTitle, { size: 2.6, anchor: 'middle' });
  else if (!labels) body += text(w / 2, h - 0.8, 'Write your own scale under the line, then label the axis.', { size: 2.3, anchor: 'middle', fill: C.grey });
  return svg(w, h, body, 'graph template');
};

// ---------- stem-and-leaf plots (HTML tables) ----------
const leafText = (leaves) => leaves.join('&nbsp;&nbsp;');
const stemLeaf = ({ title: t, rows, key }) => `
  <div class="sl">
    ${t ? `<p class="sl-title">${t}</p>` : ''}
    <table><tr><th>Stem</th><th>Leaf</th></tr>
    ${rows.map(([s, l]) => `<tr><td class="stem">${s}</td><td class="leaf">${leafText(l)}</td></tr>`).join('')}
    </table>
    ${key ? `<p class="sl-key">Key: ${key}</p>` : ''}
  </div>`;

// Blank stem-and-leaf plot for students. stems: array of stems to pre-fill, or a number of blank rows.
const stemLeafTemplate = ({ stems, key = true, title: t = '' }) => {
  const rows = Array.isArray(stems) ? stems : Array.from({ length: stems }, () => '');
  return `
  <div class="sl template">
    ${t ? `<p class="sl-title">${t}</p>` : ''}
    <table><tr><th>Stem</th><th>Leaf</th></tr>
    ${rows.map((s) => `<tr><td class="stem">${s}</td><td class="leaf"></td></tr>`).join('')}
    </table>
    ${key ? '<p class="sl-key">Key: ____ | ____ = ________</p>' : ''}
  </div>`;
};

// Back-to-back stem-and-leaf plot. rows: [leftLeaves (already written right-to-left order), stem, rightLeaves]
const backToBack = ({ left, right, rows, key, title: t }) => `
  <div class="sl b2b">
    ${t ? `<p class="sl-title">${t}</p>` : ''}
    <table><tr><th class="l">${left}</th><th>Stem</th><th class="r">${right}</th></tr>
    ${rows.map(([l, s, r]) => `<tr><td class="leaf l">${leafText(l)}</td><td class="stem">${s}</td><td class="leaf r">${leafText(r)}</td></tr>`).join('')}
    </table>
    ${key ? `<p class="sl-key">Key: ${key}</p>` : ''}
  </div>`;

const backToBackTemplate = ({ left, right, stems, key = true }) => {
  const rows = Array.isArray(stems) ? stems : Array.from({ length: stems }, () => '');
  return `
  <div class="sl b2b template">
    <table><tr><th class="l">${left}</th><th>Stem</th><th class="r">${right}</th></tr>
    ${rows.map((s) => `<tr><td class="leaf l"></td><td class="stem">${s}</td><td class="leaf r"></td></tr>`).join('')}
    </table>
    ${key ? '<p class="sl-key">Key: ____ | ____ = ________</p>' : ''}
  </div>`;
};

// Square grid paper for drawing graphs. The box grows to fill its container.
const gridPaper = (label = '') => `<div class="grid-paper">${label ? `<span class="grid-label">${label}</span>` : ''}</div>`;

// Frequency / data table
const table = (head, rows, cls = '') => `
  <table class="data-table ${cls}"><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr>
  ${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</table>`;

module.exports = {
  C, svg, text, line, symbol, inlineSymbol, pictureGraph, columnGraph, lineGraph, sectorGraph, dividedBar,
  dotPlot, dotPlotTemplate, stemLeaf, stemLeafTemplate, backToBack, backToBackTemplate, gridPaper, table,
};
