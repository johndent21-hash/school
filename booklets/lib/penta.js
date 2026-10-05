// "Pentagon" theme for the research-designed booklets (year7-own/): a Sierpinski pentagon and a rainbow.
// Each lesson in a chapter takes one colour of the rainbow, in order (1.01 red … 1.10 magenta), so a student can see
// where a lesson starts, find it by its edge tab, and see how far through the chapter they are. The chapter review
// uses the whole rainbow. Colours are only ever a second signal: every part also has a label, an icon or a border, so
// the pages still work on a black-and-white copier.

// Lesson colours: deep (bars, labels, white text on it) and tint (backgrounds). Deep shades all carry white text.
const HUES = [
  { deep: '#c0392b', tint: '#fcebe8', mid: '#e8776b' }, // red
  { deep: '#c2570c', tint: '#fdeedf', mid: '#f0995a' }, // orange
  { deep: '#a07206', tint: '#fbf3d9', mid: '#e3b43c' }, // amber
  { deep: '#5b861b', tint: '#eef5e0', mid: '#9cc45a' }, // lime
  { deep: '#1d7c4a', tint: '#e2f2e9', mid: '#5fb487' }, // green
  { deep: '#0e787b', tint: '#dff1f1', mid: '#4fb2b4' }, // teal
  { deep: '#1e66a6', tint: '#e1ecf7', mid: '#5f9ad3' }, // blue
  { deep: '#3a4ead', tint: '#e6e9f7', mid: '#7c8be0' }, // indigo
  { deep: '#633f9c', tint: '#ece6f6', mid: '#a083d0' }, // violet
  { deep: '#982f7d', tint: '#f6e5f1', mid: '#d070b6' }, // magenta
];
const REVIEW = { deep: '#2b2d42', tint: '#f1f1f4', mid: '#8d8fa6' };
const RAINBOW = `linear-gradient(90deg, ${HUES.map((h, i) => `${h.mid} ${(i / (HUES.length - 1)) * 100}%`).join(', ')})`;
// The colour for a lesson code ('1.04' → the 4th colour); anything else (the review) is the dark ink.
const hueOf = (code) => { const m = /^\d+\.(\d+)$/.exec(code); return m ? HUES[(+m[1] - 1) % HUES.length] : REVIEW; };
const indexOf = (code) => { const m = /^\d+\.(\d+)$/.exec(code); return m ? +m[1] : HUES.length + 1; };

// ---------- the Sierpinski pentagon ----------
// Five copies of a pentagon, each (3 − √5)/2 ≈ 0.382 times as big, placed in its corners; repeated `depth` times.
// colour(x, y) chooses each small pentagon's colour; by default a rainbow around the centre.
const R_SCALE = (3 - Math.sqrt(5)) / 2;
const hsl = (h, s, l) => `hsl(${Math.round(h)} ${s}% ${l}%)`;
const pentaflake = ({ depth = 4, colour, cls = 'pf-flake', opacity = 1 } = {}) => {
  const R = 50, cx = 47.55, cy = 50; // viewBox 95.1 × 90.45, the pentagon's own bounding box
  const buckets = new Map();
  const leaf = (x, y, r) => {
    const pts = Array.from({ length: 5 }, (_, k) => { const a = ((-90 + 72 * k) * Math.PI) / 180; return `${(x + r * Math.cos(a)).toFixed(2)},${(y + r * Math.sin(a)).toFixed(2)}`; });
    const c = colour ? colour(x, y) : hsl((((Math.atan2(y - cy, x - cx) * 180) / Math.PI + 90 + 360) % 360), 72, 54);
    if (!buckets.has(c)) buckets.set(c, []);
    buckets.get(c).push(`M${pts.join('L')}Z`);
  };
  const go = (x, y, r, d) => {
    if (d === 0) return leaf(x, y, r);
    const s = r * R_SCALE;
    for (let k = 0; k < 5; k++) { const a = ((-90 + 72 * k) * Math.PI) / 180; go(x + (r - s) * Math.cos(a), y + (r - s) * Math.sin(a), s, d - 1); }
  };
  go(cx, cy, R, depth);
  // Round the rainbow hues into 30 colour groups, so the file stays small.
  const groups = new Map();
  for (const [c, ds] of buckets) {
    const m = /hsl\((\d+)/.exec(c); const key = m ? hsl(Math.round(+m[1] / 12) * 12 % 360, 72, 54) : c;
    groups.set(key, (groups.get(key) || []).concat(ds));
  }
  return `<svg class="${cls}" viewBox="0 0 95.1 90.45" xmlns="http://www.w3.org/2000/svg" opacity="${opacity}">${[...groups].map(([c, ds]) => `<path fill="${c}" d="${ds.join('')}"/>`).join('')}</svg>`;
};

// ---------- icons (24 × 24, drawn with lines so they print cleanly) ----------
const ICON_PATHS = {
  donow: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  think: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.2v.5h5V16c0-.9.4-1.6 1.1-2.2A6 6 0 0 0 12 3z"/>',
  idea: '<path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z"/><path d="M4 17a3 3 0 0 1 3-3h11"/>',
  learn: '<path d="M2 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H2zM22 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z"/>',
  eye: '<path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3"/>',
  pencil: '<path d="M4 20l1-4.5L16.5 4l3.5 3.5L8.5 19z"/><path d="M14 6.5l3.5 3.5"/>',
  check: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
  pattern: '<circle cx="6" cy="6" r="1.6"/><circle cx="12" cy="6" r="1.6"/><circle cx="18" cy="6" r="1.6"/><circle cx="6" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="6" cy="18" r="1.6"/>',
  practice: '<path d="M17 3l4 4-4 4"/><path d="M3 11V9a2 2 0 0 1 2-2h16"/><path d="M7 21l-4-4 4-4"/><path d="M21 13v2a2 2 0 0 1-2 2H3"/>',
  further: '<path d="M2 21l7-12 4 6 3-4 6 10z"/><path d="M9 9V3l5 2-5 2"/>',
  exit: '<path d="M14 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="M9 17l5-5-5-5"/><path d="M14 12H3"/>',
  why: '<path d="M9.2 9a3 3 0 1 1 4.2 2.7c-.9.4-1.4 1.1-1.4 2V15"/><circle cx="12" cy="18.5" r=".6"/>',
  review: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>',
};
const icon = (name, cls = 'pf-ic') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[name]}</svg>`;

// The chapter spectrum: one segment per lesson, the current one marked. Shows where you are in the chapter.
const spectrum = (codes, current) => `<div class="pf-spec">${codes.map((c) => { const h = hueOf(c); return `<span class="${c === current ? 'on' : ''}" style="background:${h.mid}"></span>`; }).join('')}</div>`;

// The edge tab: on the outside edge of the sheet (right on a front page, left on a back page), lower for each lesson.
const tab = (code, back) => { const h = hueOf(code), i = indexOf(code); return `<div class="pf-tab ${back ? 'back' : ''}" style="top:${40 + (i - 1) * 21}mm;background:${h.deep}"><span>${code === 'Review' ? 'R' : code}</span></div>`; };

const foot = (chapter) => `<footer class="pf-foot"><span>Kingscliff High School · Year ${chapter.year} Mathematics</span><span class="pf-pn">{{PN}}</span><span>Chapter ${chapter.number} · ${chapter.title}</span></footer>`;

// ---------- front pages ----------
const cover = (chapter, lessons) => {
  const codes = lessons.map((l) => l.code);
  return `
<section class="page pf-cover">
  <div class="pfc-top"><img class="pfc-logo" src="{{ASSETSREL}}/kingscliff-logo.png" alt="Kingscliff High School"><div class="pfc-name"><span>Name</span><i></i><span>Class</span><i></i></div></div>
  <div class="pfc-titles">
    <p class="pfc-year">Year ${chapter.year} Mathematics</p>
    <p class="pfc-ch">Chapter ${chapter.number}</p>
    <h1>${chapter.title}</h1>
    <p class="pfc-sub">Learn it <span>·</span> Practise it <span>·</span> Remember it</p>
  </div>
  <div class="pfc-art">${pentaflake({ depth: 4, cls: 'pfc-flake' })}</div>
  <div class="pfc-lessons">${lessons.map((l) => { const h = hueOf(l.code); return `<div style="--d:${h.deep};--t:${h.tint}"><b>${l.code === 'Review' ? 'R' : l.code}</b><span>${l.title}</span></div>`; }).join('')}</div>
  <p class="pfc-credit">On the cover: a <b>Sierpinski pentagon</b>. It is made of 5 copies of itself, each about 0.38 times as big, again and again forever. Each lesson in this booklet has its own colour from the rainbow around it.</p>
</section>`;
};

const KEY = [
  ['donow', 'Do now', 'Start straight away, from memory: quick questions from earlier lessons.'],
  ['think', 'Think first', 'Have a go at a puzzle before the lesson. It is fine to be unsure.'],
  ['idea', 'Words and Big idea', 'The new words and the one idea that today is all about.'],
  ['check', 'Check', 'Everyone answers one question. It tells your teacher who is ready for page 2.'],
  ['pattern', 'Spot the pattern', 'Each question changes one thing. Look for what happens to the answer.'],
  ['practice', 'Practice', 'Drill today\'s skill until it is quick, then mix it up with a few earlier ideas.'],
  ['further', 'Go further', 'Finished? Puzzles that make you think harder.'],
  ['exit', 'Exit ticket', 'Three questions on your own. Then circle how you went.'],
];
const insideCover = (chapter, lessons) => `
<section class="page pf-inside">
  <header class="pf-slim" style="--d:${REVIEW.deep};--t:${REVIEW.tint}"><div class="pf-code">Start</div><div class="pf-slim-t"><b>How this booklet works</b><span>Year ${chapter.year} · Chapter ${chapter.number}: ${chapter.title}</span></div><div class="pf-rain"></div></header>
  <div class="content">
    <div class="pfi-top"><div>
    <p class="pfi-lead">Every lesson is <b>one double-sided sheet</b> in its own colour of the rainbow. A coloured band and an edge tab show where each new exercise starts. <b>Page 1</b>: learn it. <b>Page 2</b>: practise it.</p>
    <div class="pfi-learn">
      <div class="pf-ex pfi-demo" style="--d:${HUES[6].deep};--t:${HUES[6].tint}"><span class="pf-lab">${icon('eye', 'pf-lic')}Worked example</span><p>Shaded, with the working done for you in blue. <b>Read it</b> and ask yourself why each step works.</p></div>
      <div class="pfi-arrow">${'→'}</div>
      <div class="pf-you pfi-demo" style="--d:${HUES[6].deep};--t:${HUES[6].tint}"><span class="pf-lab">${icon('pencil', 'pf-lic')}Your turn</span><p>White, with a strong border. <b>You write here.</b> Each one gives you a little less help than the last.</p></div>
    </div>
    <div class="pfi-key">${KEY.map(([ic, name, text]) => `<div><i class="pf-icw">${icon(ic)}</i><p><b>${name}</b> ${text}</p></div>`).join('')}</div>
    </div>
    <div class="pfi-map">
      <div data-p="Page 1: learn it"><span class="band" style="flex:0 0 9mm">Exercise band</span><span style="flex:0 0 8mm">Do now</span><span style="flex:0 0 5mm">Think first</span><span style="flex:0 0 9mm">Words · Big idea</span><span class="pair" style="flex:1 1 auto"><i>Worked<br>example</i><i>Your<br>turn</i></span><span style="flex:0 0 7mm">Check</span></div>
      <div data-p="Page 2: practise it"><span class="band" style="flex:0 0 5mm">Lesson band</span><span style="flex:0 0 11mm">Spot the pattern</span><span style="flex:1 1 auto">Practice<br>drill, then mix it up</span><span style="flex:0 0 13mm">Go further</span><span style="flex:0 0 10mm">Exit ticket</span></div>
    </div></div>
    <h2 class="pfi-h">Contents and progress tracker</h2>
    <table class="pfi-contents"><tr><th></th><th>Lesson</th><th>Page</th><th>Date</th><th>Done</th></tr>
      ${lessons.map((l) => { const h = hueOf(l.code); return `<tr><td><span class="pfi-chip" style="background:${l.code === 'Review' ? RAINBOW : h.deep}">${l.code === 'Review' ? 'R' : l.code}</span></td><td>${l.title}</td><td class="pg">${l.startPage}</td><td class="date"></td><td class="tick"><i></i></td></tr>`; }).join('')}
    </table>
    <h2 class="pfi-h">In this chapter you will</h2>
    <ul class="pfi-goals">${chapter.goals.map((g) => `<li>${g}</li>`).join('')}</ul>
    <div class="pfi-about">
      <div class="pfi-mini">${pentaflake({ depth: 3, cls: 'pfi-flake' })}</div>
      <div>
        <h3>About the pentagon</h3>
        <p>The Sierpinski pentagon is a <b>fractal</b>: zoom in on any corner and you see the whole shape again. Every time you go one level deeper, there are 5 times as many pentagons.</p>
        <h3>Acknowledgement of Country</h3>
        <p>We acknowledge the Bundjalung people, the Traditional Custodians of the land on which Kingscliff High School stands, and pay our respects to Elders past and present.</p>
      </div>
    </div>
  </div>
  ${foot(chapter)}
</section>`;

module.exports = { HUES, REVIEW, RAINBOW, hueOf, indexOf, pentaflake, icon, spectrum, tab, foot, cover, insideCover };
