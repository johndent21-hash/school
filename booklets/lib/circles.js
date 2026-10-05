// "Times-table circles" theme for the research-designed booklets (year7-own/).
// A times-table circle: put n points evenly around a circle, numbered 0 to n − 1. Join each point k to point m × k
// (counting round past n − 1 back to 0). The straight lines build a curve: m = 2 gives a heart shape (a cardioid),
// m = 3 a kidney shape, and in general a curve with m − 1 points touching the circle. Each lesson has its own circle:
// lesson n of a chapter uses the (n + 1) times table, so the badge on every exercise is different.
// Colours: one palette per chapter (deep, main, tint) with charcoal ink and a warm accent. Colour is only ever a second
// signal: labels, icons and borders carry the meaning on a black-and-white copy.

const INK = '#23272e';
const PALETTES = {
  teal: { deep: '#0b5f5b', main: '#127c76', mid: '#79bdb6', tint: '#e5f2f0', line: '#4fb3aa' },
};
const ACCENT = { deep: '#a5610d', main: '#d98e2b', light: '#f2c27a', tint: '#fbf1e2' };
const pal = (chapter) => PALETTES[(chapter && chapter.palette) || 'teal'];

// Colour for a fraction t (0 to 1) along a list of hex stops.
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (stops, t) => {
  const s = Math.min(stops.length - 2, Math.floor(t * (stops.length - 1)));
  const u = t * (stops.length - 1) - s, a = hex(stops[s]), b = hex(stops[s + 1]);
  return `#${a.map((v, i) => Math.round(v + (b[i] - v) * u).toString(16).padStart(2, '0')).join('')}`;
};

// The circle as an SVG. viewBox is −1.08 … 1.08 so the ring and dots fit. stops: colours from the first line to the
// last; groups: how many colour bands (fewer = smaller file). rotate: degrees, where point 0 sits (180 = on the left).
const timesCircle = ({ m = 2, n = 120, stops = [INK, INK], groups = 24, width = 0.006, ring = null, dots = null, cls = 'tc-circle', rotate = 180, opacity = 1 } = {}) => {
  const P = (k) => { const a = ((rotate + (360 * k) / n) * Math.PI) / 180; return [Math.cos(a), -Math.sin(a)]; };
  const f = (v) => v.toFixed(3).replace(/\.?0+$/, '');
  const bands = Array.from({ length: groups }, () => []);
  for (let k = 1; k < n; k++) {
    const j = (m * k) % n;
    if (j === k) continue;
    const [x1, y1] = P(k), [x2, y2] = P(j);
    bands[Math.min(groups - 1, Math.floor((k / n) * groups))].push(`M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}`);
  }
  const paths = bands.map((d, g) => (d.length ? `<path stroke="${mix(stops, groups === 1 ? 0 : g / (groups - 1))}" d="${d.join('')}"/>` : '')).join('');
  const ringSvg = ring ? `<circle r="1" fill="none" stroke="${ring}" stroke-width="${width * 2.2}"/>` : '';
  const dotSvg = dots ? Array.from({ length: n }, (_, k) => { const [x, y] = P(k); return `<circle cx="${f(x)}" cy="${f(y)}" r="${dots.r}" fill="${dots.fill}"/>`; }).join('') : '';
  return `<svg class="${cls}" viewBox="-1.08 -1.08 2.16 2.16" xmlns="http://www.w3.org/2000/svg" opacity="${opacity}"><g fill="none" stroke-width="${width}" stroke-linecap="round">${paths}</g>${ringSvg}${dotSvg}</svg>`;
};


// The colour run used for circle lines on charcoal: teal, through sand, to amber.
const STOPS = ['#2fa79d', '#9fd3c7', '#f3e3c0', '#e9a54a', '#d4782a'];
// Which times table a lesson uses: lesson n of the chapter uses n + 1 (1.01 → 2, … 1.10 → 11). The review uses 12.
const indexOf = (code) => { const m = /^\d+\.(\d+)$/.exec(code); return m ? +m[1] : 11; };
const tableOf = (code) => indexOf(code) + 1;
const badge = (code, opts = {}) => timesCircle({ m: tableOf(code), n: 90, stops: STOPS, width: 0.012, groups: 12, ...opts });

// ---------- icons (24 × 24, drawn with lines so they print cleanly) ----------
const ICON_PATHS = {
  donow: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  think: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.2v.5h5V16c0-.9.4-1.6 1.1-2.2A6 6 0 0 0 12 3z"/>',
  idea: '<path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z"/><path d="M4 17a3 3 0 0 1 3-3h11"/>',
  learn: '<path d="M2 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H2zM22 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z"/>',
  board: '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20l4-4 4 4"/><path d="M7 9l3 3 6-5"/>',
  pencil: '<path d="M4 20l1-4.5L16.5 4l3.5 3.5L8.5 19z"/><path d="M14 6.5l3.5 3.5"/>',
  talk: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>',
  check: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
  pattern: '<circle cx="6" cy="6" r="1.6"/><circle cx="12" cy="6" r="1.6"/><circle cx="18" cy="6" r="1.6"/><circle cx="6" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="6" cy="18" r="1.6"/>',
  practice: '<path d="M17 3l4 4-4 4"/><path d="M3 11V9a2 2 0 0 1 2-2h16"/><path d="M7 21l-4-4 4-4"/><path d="M21 13v2a2 2 0 0 1-2 2H3"/>',
  further: '<path d="M2 21l7-12 4 6 3-4 6 10z"/><path d="M9 9V3l5 2-5 2"/>',
  exit: '<path d="M14 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="M9 17l5-5-5-5"/><path d="M14 12H3"/>',
  review: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>',
};
const icon = (name, cls = 'tc-ic') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[name]}</svg>`;

// Progress through the chapter: one segment per lesson, lessons done filled, this lesson marked.
const progress = (codes, current) => { const i = codes.indexOf(current); return `<div class="tc-prog">${codes.map((c, k) => `<span class="${k < i ? 'done' : k === i ? 'on' : ''}">${k === i ? `<b>${c === 'Review' ? 'Review' : c}</b>` : ''}</span>`).join('')}</div>`; };

// The edge tab: on the outside edge of the sheet (right on a front page, left on a back page), lower for each lesson,
// so a lesson can be found by flicking through the booklet.
const tab = (code, back) => `<div class="tc-tab ${back ? 'back' : ''}" style="top:${36 + (indexOf(code) - 1) * 21.5}mm"><span>${code === 'Review' ? 'Review' : code}</span></div>`;

const foot = (chapter) => `<footer class="tc-foot"><span>Kingscliff High School · Year ${chapter.year} Mathematics</span><span class="tc-pn">{{PN}}</span><span>Chapter ${chapter.number} · ${chapter.title}</span></footer>`;

// ---------- front pages ----------
const cover = (chapter, lessons) => `
<section class="page tc-cover">
  <div class="tcc-label"><img class="tcc-logo" src="{{ASSETSREL}}/kingscliff-logo.png" alt="Kingscliff High School"><div class="tcc-name"><span>Name</span><i></i><span>Class</span><i></i><span>Teacher</span><i></i></div></div>
  <div class="tcc-art">${timesCircle({ m: 2, n: 300, stops: STOPS, width: 0.0036, groups: 40, ring: '#59616c', cls: 'tcc-big', rotate: 90 })}</div>
  <div class="tcc-titles">
    <p class="tcc-year">Year ${chapter.year} Mathematics</p>
    <p class="tcc-ch">Chapter ${chapter.number}</p>
    <h1>${chapter.title}</h1>
    <p class="tcc-sub">Learn it <span>/</span> Practise it <span>/</span> Remember it</p>
  </div>
  <div class="tcc-row">${lessons.map((l) => `<div>${badge(l.code, { cls: 'tcc-badge', ring: '#59616c', width: 0.016 })}<b>${l.code === 'Review' ? 'Review' : l.code}</b></div>`).join('')}</div>
  <p class="tcc-credit">On the cover: the 2 times table drawn on a circle of 300 points. Each lesson has its own times-table circle.</p>
</section>`;

const KEY = [
  ['donow', 'Do now', 'Start straight away, from memory.'],
  ['think', 'Think first', 'Have a go before the lesson. An example gives the answer.'],
  ['idea', 'Words and Big idea', 'Fill in the Big idea with your teacher.'],
  ['talk', 'Explain', 'Tick the better reason. Be ready to say why.'],
  ['check', 'Check', 'Everyone answers, so your teacher knows who is ready.'],
  ['pattern', 'Spot the pattern', 'One thing changes each time. Watch the answers.'],
  ['practice', 'Mixed practice', 'Mostly today\'s skill. Check with the mixed-up answers.'],
  ['further', 'Go further', 'Finished? Questions that make you think harder.'],
  ['exit', 'Exit ticket', 'Three questions on your own. Then your marked score.'],
];

// A small, numbered times-table circle for the inside cover: 10 points, each joined to the point twice its number.
const howCircle = () => {
  const n = 10, P = (k) => { const a = ((90 - 36 * k) * Math.PI) / 180; return [Math.cos(a), -Math.sin(a)]; };
  const lines = Array.from({ length: n }, (_, k) => { const j = (2 * k) % n; if (j === k) return ''; const [x1, y1] = P(k), [x2, y2] = P(j); return `<line x1="${x1.toFixed(3)}" y1="${y1.toFixed(3)}" x2="${x2.toFixed(3)}" y2="${y2.toFixed(3)}" stroke="${k === 6 ? ACCENT.main : '#127c76'}" stroke-width="${k === 6 ? 0.05 : 0.025}"/>`; }).join('');
  const pts = Array.from({ length: n }, (_, k) => { const [x, y] = P(k); return `<circle cx="${x.toFixed(3)}" cy="${y.toFixed(3)}" r="0.055" fill="${INK}"/><text x="${(x * 1.2).toFixed(3)}" y="${(y * 1.2 + 0.07).toFixed(3)}" font-size="0.2" text-anchor="middle" fill="${INK}" font-weight="700">${k}</text>`; }).join('');
  return `<svg class="tci-how" viewBox="-1.35 -1.35 2.7 2.7" xmlns="http://www.w3.org/2000/svg"><circle r="1" fill="none" stroke="#b9c2c0" stroke-width="0.02"/>${lines}${pts}</svg>`;
};

const insideCover = (chapter, lessons) => `
<section class="page tc-inside">
  <header class="tc-slim"><div class="tc-code">Start</div><div class="tc-slim-t"><b>How this booklet works</b><span>Year ${chapter.year} · Chapter ${chapter.number}: ${chapter.title}</span></div></header>
  <div class="content">
    <div class="tci-top">
      <div>
        <p class="tci-lead">Every lesson is <b>one double-sided sheet</b>. Each new exercise starts with a dark number block and its own times-table circle. <b>Page 1</b>: learn it. <b>Page 2</b>: practise it.</p>
        <div class="tci-learn">
          <div class="tc-ex tci-demo"><span class="tc-lab">${icon('board', 'tc-lic')}Example</span><p>Shaded. Your teacher works it out with you. <b>Copy their working</b> onto the lines.</p></div>
          <div class="tci-arrow">→</div>
          <div class="tc-you tci-demo"><span class="tc-lab">${icon('pencil', 'tc-lic')}Your turn</span><p>White, with a strong border. <b>Now you try</b> one just like it, on your own.</p></div>
        </div>
        <div class="tci-key">${KEY.map(([ic, name, text]) => `<div><i class="tc-icw">${icon(ic)}</i><p><b>${name}</b> ${text}</p></div>`).join('')}</div>
      </div>
      <div class="tci-map">
        <div data-p="Page 1: learn it"><span class="band" style="flex:0 0 9mm">Exercise number</span><span style="flex:0 0 8mm">Do now</span><span style="flex:0 0 5mm">Think first</span><span style="flex:0 0 10mm">Words · Big idea</span><span class="pair" style="flex:1 1 auto"><i>Example</i><i>Your<br>turn</i></span><span style="flex:0 0 7mm">Check</span></div>
        <div data-p="Page 2: practise it"><span class="band" style="flex:0 0 5mm">Lesson</span><span style="flex:0 0 11mm">Spot the pattern</span><span style="flex:1 1 auto">Mixed practice</span><span style="flex:0 0 13mm">Go further</span><span style="flex:0 0 10mm">Exit ticket</span></div>
      </div>
    </div>
    <h2 class="tci-h">Contents and progress tracker</h2>
    <table class="tci-contents"><tr><th></th><th></th><th>Lesson</th><th>Page</th><th>Date</th><th>Done</th></tr>
      ${lessons.map((l) => `<tr><td class="bd">${badge(l.code, { cls: 'tci-badge', stops: ['#127c76', '#0b5f5b'], width: 0.016, groups: 1, ring: '#9aa5a3' })}</td><td><span class="tci-chip">${l.code === 'Review' ? 'R' : l.code}</span></td><td>${l.title}</td><td class="pg">${l.startPage}</td><td class="date"></td><td class="tick"><i></i></td></tr>`).join('')}
    </table>
    <h2 class="tci-h">In this chapter you will</h2>
    <ul class="tci-goals">${chapter.goals.map((g) => `<li>${g}</li>`).join('')}</ul>
    <div class="tci-about">
      ${howCircle()}
      <div>
        <h3>About the circles</h3>
        <p>Put 10 points around a circle, numbered 0 to 9. Join each point to the point <b>twice</b> its number. After 9, count on from 0 again: so 6 joins to 12, which is point 2. Use 300 points and the lines draw the heart shape on the cover. Lesson 1 uses the 2 times table, lesson 2 the 3 times table, and so on. Count the points of each shape: always one less than the times table.</p>
        <h3>Acknowledgement of Country</h3>
        <p>We acknowledge the Bundjalung people, the Traditional Custodians of the land on which Kingscliff High School stands, and pay our respects to Elders past and present.</p>
      </div>
    </div>
  </div>
  ${foot(chapter)}
</section>`;

module.exports = { INK, PALETTES, ACCENT, STOPS, pal, mix, timesCircle, indexOf, tableOf, badge, icon, progress, tab, foot, cover, insideCover };
