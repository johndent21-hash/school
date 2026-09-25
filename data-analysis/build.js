// Builds the Year 7 Data Analysis lesson booklet (10.01 Interpreting graphs) and its answer key.
// Usage: node build.js   ->  writes booklet.html, answers.html and the matching PDFs.
const fs = require('fs');
const path = require('path');

const OUT = __dirname;
const LESSON = '10.01 Interpreting graphs';
const PDF_NAME = 'Year7-Interpreting-Graphs-10.01';

const C = { blue: '#3f63be', charcoal: '#3d3b3c', sand: '#c2bea8', lightBlue: '#9fb3e6', grey: '#7d7a70', grid: '#e2dfd3', gridMajor: '#c9c5b4', ink: '#26292e' };

// ---------- SVG graphs (units are mm, so a viewBox of 88 x 50 prints 88 mm wide at full width) ----------
const svg = (w, h, body) =>
  `<svg class="graph" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" style="aspect-ratio:${w}/${h}">${body}</svg>`;
const text = (x, y, t, { size = 2.6, anchor = 'start', weight = 400, fill = C.ink, rotate = null } = {}) =>
  `<text x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}" font-weight="${weight}" fill="${fill}"${rotate !== null ? ` transform="rotate(${rotate} ${x} ${y})"` : ''}>${t}</text>`;
const multiline = (x, y, t, opts) => t.split('\n').map((line, i) => text(x, y + i * (opts.size || 2.6) * 1.15, line, opts)).join('');

// The dot-circle symbol echoes the circles in Marni Tuala's artwork.
const symbol = (cx, cy, half = false) => {
  const dots = [];
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * 2 * Math.PI;
    const x = Math.sin(a) * 2.25, y = -Math.cos(a) * 2.25;
    if (half && x > 0.01) continue;
    dots.push(`<circle cx="${(cx + x).toFixed(2)}" cy="${(cy + y).toFixed(2)}" r="0.5" fill="${C.sand}"/>`);
  }
  const centre = half
    ? `<path d="M${cx},${cy - 1.4} A1.4,1.4 0 0 0 ${cx},${cy + 1.4} Z" fill="${C.blue}"/>`
    : `<circle cx="${cx}" cy="${cy}" r="1.4" fill="${C.blue}"/>`;
  return centre + dots.join('');
};

const pictureGraph = ({ title, rows, key, w = 88, labelW = 22 }) => {
  const rowH = 6.2, top = 8;
  let body = text(w / 2, 4.5, title, { size: 3, anchor: 'middle', weight: 600 });
  rows.forEach(([label, n], i) => {
    const y = top + i * rowH + rowH / 2;
    body += text(2, y + 0.9, label, { size: 2.6 });
    for (let s = 0; s < Math.ceil(n); s++) body += symbol(labelW + 3 + s * 6, y, n - s === 0.5);
  });
  const ky = top + rows.length * rowH + 4.5;
  body += `<rect x="${w - 40}" y="${ky - 3.6}" width="38" height="7" rx="1.2" fill="none" stroke="${C.sand}" stroke-width="0.3"/>`;
  body += symbol(w - 36, ky - 0.1) + text(w - 32.5, ky + 0.9, `= ${key}`, { size: 2.6 });
  return svg(w, ky + 4.5, body);
};

const columnGraph = ({ title, cats, values, max, step, labelEvery = step, yTitle, xTitle, w = 88, h = 58 }) => {
  const x0 = 13, x1 = w - 2, yb = h - (xTitle ? 13 : 10), yt = 8;
  const sy = (v) => yb - (v / max) * (yb - yt);
  let body = text(w / 2, 4.5, title, { size: 3, anchor: 'middle', weight: 600 });
  for (let v = 0; v <= max; v += step) {
    const major = v % labelEvery === 0;
    body += `<line x1="${x0}" x2="${x1}" y1="${sy(v)}" y2="${sy(v)}" stroke="${major ? C.gridMajor : C.grid}" stroke-width="${major ? 0.25 : 0.18}"/>`;
    if (major) body += text(x0 - 1.2, sy(v) + 0.9, v, { size: 2.4, anchor: 'end' });
  }
  const bw = (x1 - x0) / cats.length;
  cats.forEach((c, i) => {
    const x = x0 + i * bw;
    body += `<rect x="${x + bw * 0.18}" y="${sy(values[i])}" width="${bw * 0.64}" height="${yb - sy(values[i])}" fill="${C.blue}"/>`;
    body += multiline(x + bw / 2, yb + 3.2, c, { size: 2.3, anchor: 'middle' });
  });
  body += `<line x1="${x0}" x2="${x0}" y1="${yt - 1}" y2="${yb}" stroke="${C.charcoal}" stroke-width="0.35"/>`;
  body += `<line x1="${x0}" x2="${x1}" y1="${yb}" y2="${yb}" stroke="${C.charcoal}" stroke-width="0.35"/>`;
  body += text(3, (yt + yb) / 2, yTitle, { size: 2.4, anchor: 'middle', rotate: -90 });
  if (xTitle) body += text((x0 + x1) / 2, h - 1.5, xTitle, { size: 2.4, anchor: 'middle' });
  return svg(w, h, body);
};

const lineGraph = ({ title, xs, ys, max, yTitle, xTitle, w = 88, h = 48 }) => {
  const x0 = 13, x1 = w - 3, yb = h - 10, yt = 8;
  const sy = (v) => yb - (v / max) * (yb - yt);
  const sx = (i) => x0 + 3 + i * ((x1 - x0 - 6) / (xs.length - 1));
  let body = text(w / 2, 4.5, title, { size: 3, anchor: 'middle', weight: 600 });
  for (let v = 0; v <= max; v++) {
    const major = v % 5 === 0;
    body += `<line x1="${x0}" x2="${x1}" y1="${sy(v)}" y2="${sy(v)}" stroke="${major ? C.gridMajor : C.grid}" stroke-width="${major ? 0.25 : 0.15}"/>`;
    if (major) body += text(x0 - 1.2, sy(v) + 0.9, v, { size: 2.4, anchor: 'end' });
  }
  xs.forEach((m, i) => {
    body += `<line x1="${sx(i)}" x2="${sx(i)}" y1="${yt}" y2="${yb}" stroke="${C.grid}" stroke-width="0.15"/>`;
    body += text(sx(i), yb + 3.2, m, { size: 2.2, anchor: 'middle' });
  });
  body += `<polyline points="${ys.map((v, i) => `${sx(i)},${sy(v)}`).join(' ')}" fill="none" stroke="${C.blue}" stroke-width="0.6"/>`;
  body += ys.map((v, i) => `<circle cx="${sx(i)}" cy="${sy(v)}" r="0.75" fill="${C.blue}"/>`).join('');
  body += `<line x1="${x0}" x2="${x0}" y1="${yt - 1}" y2="${yb}" stroke="${C.charcoal}" stroke-width="0.35"/>`;
  body += `<line x1="${x0}" x2="${x1}" y1="${yb}" y2="${yb}" stroke="${C.charcoal}" stroke-width="0.35"/>`;
  body += text(3, (yt + yb) / 2, yTitle, { size: 2.4, anchor: 'middle', rotate: -90 });
  body += text((x0 + x1) / 2, h - 1.8, xTitle, { size: 2.4, anchor: 'middle' });
  return svg(w, h, body);
};

// Slices: [label, value, colour, labelInside]. No numbers are shown so students estimate from the angles.
const sectorGraph = ({ title, slices, w = 88, h = 48 }) => {
  const cx = w / 2 + 4, cy = 28.5, r = 16.5;
  const total = slices.reduce((s, x) => s + x[1], 0);
  let a0 = 0, body = text(w / 2, 4.5, title, { size: 3, anchor: 'middle', weight: 600 });
  const pt = (a, rr) => [cx + rr * Math.sin(a), cy - rr * Math.cos(a)];
  slices.forEach(([label, v, fill, inside]) => {
    const a1 = a0 + (v / total) * 2 * Math.PI;
    const [xA, yA] = pt(a0, r), [xB, yB] = pt(a1, r);
    body += `<path d="M${cx},${cy} L${xA.toFixed(2)},${yA.toFixed(2)} A${r},${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${xB.toFixed(2)},${yB.toFixed(2)} Z" fill="${fill}" stroke="#fff" stroke-width="0.4"/>`;
    const mid = (a0 + a1) / 2;
    if (inside) {
      const [lx, ly] = pt(mid, r * 0.55);
      body += text(lx, ly + 1, label, { size: 2.8, anchor: 'middle', weight: 600, fill: '#fff' });
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

// ---------- the graphs used in the lesson ----------
const G = {
  library: pictureGraph({
    title: 'Books borrowed from the library',
    rows: [['Monday', 3], ['Tuesday', 4.5], ['Wednesday', 2], ['Thursday', 5], ['Friday', 3.5]],
    key: '4 books',
  }),
  beach: columnGraph({
    title: 'Favourite beach activity of 7K',
    cats: ['Swimming', 'Surfing', 'Fishing', 'Beach\ncricket', 'Snorkel-\nling', 'Sand-\ncastles'],
    values: [8, 6, 2, 5, 3, 4], max: 10, step: 1, labelEvery: 2, yTitle: 'Number of students', h: 50,
  }),
  travel: sectorGraph({
    title: 'How 80 Year 7 students travel to school',
    slices: [['Bus', 40, C.blue, true], ['Car', 20, C.charcoal, true], ['Walk', 10, C.sand], ['Bike', 6, C.lightBlue], ['Scooter', 4, C.grey]],
  }),
  temp: lineGraph({
    title: 'Mean minimum temperature, Kingscliff',
    xs: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    ys: [20, 20, 19, 16, 12, 11, 9, 10, 12, 14, 17, 19], max: 22, yTitle: 'Temperature (°C)', xTitle: 'Month',
  }),
  ages: pictureGraph({
    title: 'Ages of people in a coastal town',
    rows: [['0–14 years', 4.5], ['15–24 years', 2.5], ['25–44 years', 5], ['45–64 years', 6], ['65+ years', 7]],
    key: '4% of people', labelW: 20,
  }),
  music: columnGraph({
    title: 'How Australians listen to music',
    cats: ['Stream-\ning', 'Radio', 'Down-\nloads', 'CDs', 'Vinyl', 'Other'],
    values: [55, 20, 10, 5, 5, 5], max: 60, step: 5, labelEvery: 10, yTitle: 'Percentage (%)', h: 47,
  }),
  pets: columnGraph({
    title: 'Pets owned by 7B',
    cats: ['Dog', 'Cat', 'Fish', 'Bird', 'No pet'],
    values: [9, 6, 3, 2, 5], max: 10, step: 1, labelEvery: 2, yTitle: 'Number of students', w: 60, h: 46,
  }),
};

// ---------- building blocks ----------
const sym = `<svg class="sym" viewBox="-2.9 -2.9 5.8 5.8">${symbol(0, 0)}</svg>`;
const dots = (n) => '<span class="lvl-dots">' + '<i></i>'.repeat(n) + '</span>';
const LEVELS = { 1: 'Level 1 · Getting started', 2: 'Level 2 · Building up', 3: 'Level 3 · Challenge', 4: 'Extension · Stretch yourself' };
const banner = (lvl, note = '') => `<div class="banner">${dots(lvl)}<span class="banner-title">${LEVELS[lvl]}</span>${note ? `<span class="banner-note">${note}</span>` : ''}</div>`;
// WE DO (charcoal): students copy the teacher's working from the board.
// YOU DO (blue): students work on their own.
const weDo = (body, cls = '') => `
  <div class="zone we ${cls}"><div class="zone-head"><span class="zone-pill">WE DO</span><span class="zone-text">With your teacher: copy what they write on the board.</span></div>${body}</div>`;
const youDo = (txt, body, cls = '') => `
  <div class="zone you ${cls}"><div class="zone-head"><span class="zone-pill">YOU DO</span><span class="zone-text">On your own: ${txt}</span></div>${body}</div>`;

// A question whose blank working box fills the space its grid cell gives it.
const q = (label, txt, cls = '') => `
  <div class="q ${cls}"><div class="q-head"><span class="q-num">${label}</span><span class="q-text">${txt}</span></div><div class="box"></div></div>`;
// A short-answer question: text on the left, a small answer box on the right.
const qs = (label, txt) => `
  <div class="qs"><span class="q-num">${label}</span><span class="q-text">${txt}</span><span class="box"></span></div>`;
const example = (label, txt) => `
  <div class="q example"><div class="q-head"><span class="q-num ex">${label}</span><span class="q-text">${txt}</span></div><div class="box"></div></div>`;
const worked = (lvl, title, question, steps, answer, extra = '') => `
  <div class="worked">
    <div class="worked-head">${dots(lvl)}<b>${title}</b></div>
    <p class="worked-q">${question}</p>
    <ol class="steps">${steps.map((s) => `<li>${s}</li>`).join('')}</ol>
    ${extra}
    <p class="worked-a">${answer}</p>
  </div>`;

let pageNo = 0;
const page = (section, body, { first = false, foot = '' } = {}) => {
  pageNo += 1;
  return `
<section class="page${first ? ' first' : ''}">
  <div class="art-strip"></div>
  ${first ? '' : `<header class="page-head"><span>Data Analysis · ${LESSON}</span><span class="sec">${section}</span></header>`}
  <div class="content">${body}</div>
  <footer class="page-foot"><span>${foot || 'Artwork © Marni Tuala'}</span><span class="pn">${pageNo}</span><span>Kingscliff High School · Year 7 Mathematics</span></footer>
</section>`;
};

// ---------- questions ----------
const setA = [
  'What does 1 symbol stand for?',
  'What does ½ a symbol stand for?',
  'How many books on Monday?',
  'How many books on Wednesday?',
  'How many books on Friday?',
  'Which day had the most books?',
  'Which day had the fewest books?',
  'How many more on Friday than Monday?',
  'How many on Monday and Tuesday?',
  'How many symbols show 16 books?',
];
const setB = [
  'How many chose surfing?',
  'How many chose fishing?',
  'Which was the most popular?',
  'Which was the least popular?',
  'Which activity had 5 votes?',
  'How many chose snorkelling?',
  'How many more swam than fished?',
  'How many chose surfing or fishing?',
  'How many students are in 7K?',
  'What does 1 gridline stand for?',
];
const setC = [
  'Which way of travel is the most common?',
  'Estimate how many students travel by car.',
  'Estimate how many students walk.',
  'True or false: fewer than 10 ride a bike.',
  'How many students do <b>not</b> catch the bus?',
  'Which 2 months are warmest? What is their mean minimum?',
  'Name 2 months with the same mean minimum.',
  'Which month has a mean minimum of 14&nbsp;°C?',
  'Which 2 months in a row have the biggest rise?',
  'Which 2 months in a row have the biggest drop?',
];
const setD = [
  'What percentage of people are aged 65+?',
  'What percentage of people are under 25?',
  'The town has 5000 people. How many are aged 0&#8209;14?',
  'How many symbols would show 30% of the town?',
  'Why might 65+ be the biggest group in this town?',
  'Which 2 ways of listening add up to 75% of people?',
  'What fraction of people listen to the radio?',
  'In a survey of 400 people, how many use downloads?',
  'Out of 400 people, how many more stream than use radio?',
  'How might this graph change in 10 years? Why?',
];

// ---------- pages ----------
const pages = [];

// Page 1: title, learning intentions, key terms, notes, Level 1 examples and Set A
pages.push(page('', `
  <div class="title-row">
    <img class="logo" src="assets/kingscliff-logo.png" alt="Kingscliff High School">
    <div class="title-text">
      <p class="kicker">Stage 4 · Year 7 · Data Analysis</p>
      <h1>${LESSON}</h1>
    </div>
    <div class="name-lines"><div><span>Name</span><i></i></div><div><span>Class</span><i></i></div></div>
  </div>
  <p class="ack">Artwork by <b>Marni Tuala</b> · We acknowledge the Bundjalung people, the Traditional Custodians of the land on which we learn.</p>
  <div class="li-sc">
    <div class="card"><h3>Learning intentions</h3><p class="card-sub">We are learning to:</p><ul>
      <li>read and interpret picture graphs, column graphs, sector graphs and line graphs</li>
      <li>explain what a graph tells us about real data</li></ul></div>
    <div class="card"><h3>Success criteria</h3><p class="card-sub">I can:</p><ul class="ticks">
      <li>use a <b>key</b> and a <b>scale</b> to read values from a graph</li>
      <li>estimate amounts from a <b>sector graph</b> using fractions of a circle</li>
      <li>compare values and give reasons for patterns in a graph</li></ul></div>
  </div>
  <div class="legend">
    <div class="legend-item we"><span class="zone-pill">WE DO</span><span>Grey boxes: work <b>with your teacher</b>. Copy the working from the board.</span></div>
    <div class="legend-item you"><span class="zone-pill">YOU DO</span><span>Blue boxes: work <b>on your own</b>. Show your working in the box.</span></div>
  </div>
  <div class="terms">
    ${['Key', 'Scale', 'Sector graph'].map((t) => `<div class="term"><span class="term-name">${t}</span><i></i><i></i></div>`).join('')}
  </div>
  <div class="notes grow"><span class="notes-label">Notes</span></div>
  ${banner(1)}
  <div class="split">
    <div class="graph-card">${G.library}</div>
    ${weDo(`<div class="col">${example('Example 1', 'How many books were borrowed on Tuesday?')}${example('Example 2', 'How many more books on Thursday than Wednesday?')}</div>`, 'fill')}
  </div>
  ${youDo('Set A. Use the library picture graph above.', `<div class="short-grid">${setA.map((t, i) => qs(i + 1, t)).join('')}</div>`)}
`, { first: true }));

// Page 2: Set B, Level 2 examples and Set C
pages.push(page('Level 1 and Level 2', `
  ${youDo('Set B. Use the column graph.', `<div class="split">
    <div class="graph-card">${G.beach}</div>
    <div class="short-list">${setB.map((t, i) => qs(i + 1, t)).join('')}</div>
  </div>`)}
  ${banner(2)}
  <div class="split"><div class="graph-card">${G.travel}</div><div class="graph-card">${G.temp}</div></div>
  ${weDo(`<div class="split ex-row">
    ${example('Example 3', 'What fraction of the students catch the bus? How many students is that?')}
    ${example('Example 4', 'Which month is coldest? How much colder is June than March?')}
  </div>`)}
  ${youDo('Set C. Questions 1–5 use the sector graph and 6–10 use the line graph.', `<div class="work-grid grow">${setC.map((t, i) => q(i + 1, t)).join('')}</div>`, 'grow')}
`));

// Page 3: Level 3 examples, Set D, and the tear-off exit ticket (odd page, so its back is page 4)
pages.push(page('Level 3 · Exit ticket', `
  ${banner(3, 'Finished Set D? Try the extension on page 4.')}
  <div class="split"><div class="graph-card">${G.ages}</div><div class="graph-card">${G.music}</div></div>
  ${weDo(`<div class="split ex-row">
    ${example('Example 5', 'What percentage of the town is 45+? How many is that out of 5000?')}
    ${example('Example 6', 'What % stream music? How might this look different 20 years ago?')}
  </div>`)}
  ${youDo('Set D. Questions 1–5 use the picture graph and 6–10 use the column graph.', `<div class="work-grid tall grow">${setD.map((t, i) => q(i + 1, t)).join('')}</div>`, 'grow')}
  <div class="tear-space"></div>
  <div class="tear-zone">
    <div class="cut-line"><span>✂ Show off your skill: tear along this line and hand it to your teacher ✂</span></div>
    <div class="exit-head">
      <span class="zone-pill you-pill">YOU DO</span>
      <h2>Show off your skill</h2>
      <p>Choose <b>ONE</b> question. Show your working.</p>
      <div class="name-lines inline"><div><span>Name</span><i></i></div><div class="short"><span>Class</span><i></i></div></div>
    </div>
    <div class="exit-body">
      <div class="graph-card">${G.pets}</div>
      ${q(`${dots(1)} Level 1`, 'How many students in 7B own a cat?', 'exit-q')}
      ${q(`${dots(2)} Level 2`, 'What fraction of the class owns a dog?', 'exit-q')}
      ${q(`${dots(3)} Level 3`, 'What percentage of 7B has no pet? Out of 200 Year 7s, how many would you expect to have no pet?', 'exit-q')}
    </div>
  </div>
`));

// Page 4: extension and summary on top; the bottom is left blank because it is the back of the exit ticket.
pages.push(page('Extension · Summary', `
  ${banner(4)}
  <div class="split ext grow">
    ${worked(4, 'Worked example',
      'In a survey of 72 students, the <b>Soccer</b> sector of a sector graph has an angle of 90°. How many students chose soccer?',
      ['A full circle is 360°, so 90° is 90/360 = ¼ of the circle', '¼ of 72 = 72 ÷ 4 = 18'],
      '<b>Answer:</b> 18 students chose soccer',
      `<div class="diagram">${svg(74, 40, `
        <circle cx="20" cy="20" r="16" fill="${C.sand}" opacity="0.45" stroke="${C.charcoal}" stroke-width="0.3"/>
        <path d="M20,20 L20,4 A16,16 0 0 1 36,20 Z" fill="${C.blue}" stroke="${C.charcoal}" stroke-width="0.3"/>
        <path d="M20,17 L23,17 L23,20" fill="none" stroke="#fff" stroke-width="0.4"/>
        ${text(27, 14, '90°', { size: 3.2, anchor: 'middle', weight: 600, fill: '#fff' })}
        ${text(14, 28, '270°', { size: 3, anchor: 'middle' })}
        ${text(40, 16, '90° out of 360°', { size: 2.8 })}
        ${text(40, 21, '= ¼ of the circle', { size: 2.8, weight: 600 })}
        ${text(40, 26, '= ¼ of the students', { size: 2.8 })}`)}</div>`)}
    ${youDo('read the worked example, then try these.', `<div class="col ext-qs">
      ${q('E1', 'A survey of 240 people has a <b>Tennis</b> sector of 60°. How many chose tennis?')}
      ${q('E2', 'In a survey of 180 people, 45 chose pizza. What angle should the pizza sector be?')}
      ${q('E3', 'In a picture graph, one symbol = 8 students. How many students do 3¾ symbols show? How would you show 20 students?')}
    </div>`, 'fill')}
  </div>
  <div class="banner summary"><span class="banner-title">Lesson summary</span><span class="banner-note">Missed the lesson? Start here.</span></div>
  <div class="summary-grid">
    <div class="steps-card"><b>Reading any graph</b><ol><li>Read the <b>title</b>: what is the graph about?</li><li>Check the <b>key</b> or the <b>scale</b> on each axis.</li><li>Use a ruler to line up bars and points with the scale.</li><li>Answer with the right <b>units</b> (students, °C, %).</li></ol></div>
    ${worked(1, 'Level 1', `In a picture graph, ${sym} = 10 students. A row shows 3½ symbols. How many students is that?`,
      ['3 full symbols = 3 × 10 = 30', 'Half a symbol = 10 ÷ 2 = 5', '30 + 5 = 35'], '<b>Answer:</b> 35 students')}
    ${worked(2, 'Level 2', 'A sector graph shows 80 people. The <b>Surfing</b> sector is a quarter of the circle. How many chose surfing?',
      ['A quarter means divide by 4', '80 ÷ 4 = 20'], '<b>Answer:</b> 20 people')}
    ${worked(3, 'Level 3', 'A graph shows 45% of 400 students catch the bus. How many students is that?',
      ['45% means 45 out of every 100', '400 has 4 hundreds, so 45 × 4 = 180'], '<b>Answer:</b> 180 students')}
    ${worked(4, 'Extension', 'A 120° sector shows the results for 90 people. How many people is that?',
      ['120/360 = ⅓ of the circle', '⅓ of 90 = 90 ÷ 3 = 30'], '<b>Answer:</b> 30 people')}
  </div>
  <div class="tear-space"></div>
  <div class="tear-zone back">
    <div class="cut-line"><span>✂</span></div>
    <div class="blank-note">This space is left blank on purpose. It is the back of your exit ticket.</div>
  </div>
`));

// ---------- answers (teacher copy) ----------
const answers = {
  'Level 1 · Teacher examples': ['Ex 1: 4½ symbols = 18 books', 'Ex 2: 20 − 8 = 12 more books'],
  'Level 1 · Set A': ['4 books', '2 books', '12', '8', '14', 'Thursday', 'Wednesday', '2', '12 + 18 = 30', '4 symbols'],
  'Level 1 · Set B': ['6', '2', 'Swimming', 'Fishing', 'Beach cricket', '3', '8 − 2 = 6', '6 + 2 = 8', '28', '1 student'],
  'Level 2 · Teacher examples': ['Ex 3: ½, so 40 students', 'Ex 4: July (9 °C); June is 19 − 11 = 8 °C colder than March'],
  'Level 2 · Set C': ['Bus', 'About 20 (a quarter)', 'About 10 (an eighth)', 'True (6)', '80 − 40 = 40', 'January and February, 20 °C', 'Jan and Feb (20 °C) or Mar and Dec (19 °C); also May and Sep (12 °C)', 'October', 'October to November (+3 °C)', 'April to May (−4 °C)'],
  'Level 3 · Teacher examples': ['Ex 5: 24% + 28% = 52%; 52% of 5000 = 2600', 'Ex 6: 55%. 20 years ago: little or no streaming; CDs, radio and downloads much bigger'],
  'Level 3 · Set D': ['28%', '18% + 10% = 28%', '18% of 5000 = 900', '7½ symbols', 'e.g. retirees move to the coast; young people leave for work or uni', 'Streaming and radio (55% + 20%)', '20% = ⅕', '10% of 400 = 40', '35% of 400 = 140', 'e.g. more streaming, fewer CDs and less radio'],
  'Extension': ['60/360 = ⅙; ⅙ of 240 = 40', '45/180 = ¼; ¼ of 360° = 90°', '3¾ × 8 = 30 students; 20 ÷ 8 = 2½ symbols'],
  'Exit ticket': ['Level 1: 6', 'Level 2: 9/25', 'Level 3: 5/25 = 20%; 20% of 200 = 40'],
};
const answerBody = Object.entries(answers).map(([k, v]) => `
  <div class="ans-block"><h3>${k}</h3><ol>${v.map((a) => `<li>${a}</li>`).join('')}</ol></div>`).join('');

// ---------- write files ----------
const css = fs.readFileSync(path.join(OUT, 'booklet.css'), 'utf8');
const doc = (title, body) => `<!doctype html>
<html lang="en-AU"><head><meta charset="utf-8"><title>${title}</title>
<style>${css}</style></head><body>${body}</body></html>`;

fs.writeFileSync(path.join(OUT, 'booklet.html'), doc('Interpreting Graphs Booklet', pages.join('\n')));
pageNo = 0;
fs.writeFileSync(path.join(OUT, 'answers.html'), doc('Interpreting Graphs Answers', page('Teacher answers', `
  <h2>Answers (teacher copy)</h2>
  <div class="answers">${answerBody}</div>`)));

(async () => {
  const { chromium } = require(require.resolve('playwright', { paths: [require('child_process').execSync('npm root -g').toString().trim()] }));
  const browser = await chromium.launch();
  const pg = await browser.newPage();
  for (const name of ['booklet', 'answers']) {
    await pg.goto('file://' + path.join(OUT, `${name}.html`));
    await pg.evaluate(() => document.fonts.ready);
    // Report anything that overflows its page, or a working box squeezed too small to write in.
    const problems = await pg.evaluate(() => [...document.querySelectorAll('.page')].flatMap((p, i) => {
      const c = p.querySelector('.content');
      const out = [];
      if (c.scrollHeight > c.clientHeight + 1) out.push(`page ${i + 1}: content overflows`);
      [...c.querySelectorAll('.q .box, .qs .box')].forEach((b) => { if (b.getBoundingClientRect().height < 20) out.push(`page ${i + 1}: a working box is under 5 mm tall`); });
      return out;
    }));
    if (problems.length) console.warn(`${name}:\n  ${[...new Set(problems)].join('\n  ')}`);
    await pg.pdf({ path: path.join(OUT, `${PDF_NAME}${name === 'answers' ? '-Answers' : ''}.pdf`), format: 'A4', printBackground: true, preferCSSPageSize: true });
    console.log(`${name}: done`);
  }
  await browser.close();
})();
