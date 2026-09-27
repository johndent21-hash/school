// Three-column worksheet: one page per lesson, in the style of the Freefall Mathematics worksheets.
// The columns get harder from left to right (Easy, Medium, Challenging). Every column opens with a speech bubble
// saying exactly what to do, then two WE DO examples laid out just like the questions (the teacher works them live),
// then the YOU DO questions. A new bubble appears wherever the instruction changes. Question numbers run on across
// the columns.
//
// Gradual release in each YOU DO section (as on the Freefall sheets):
//   column 1  the first question of each round is answered for you, then answer on the line
//   column 2  the first question of each round is fully worked, the next has only the answers left blank, the next
//             has every number blank, then the lines are blank
//   column 3  the first question has only the answers blank, the next has every number blank, then blank lines
// Each round (each speech bubble) starts with WE DO examples: one of each kind of question that follows.
//
// content: [column 1 rounds, column 2 rounds, column 3 rounds]; a round is { text, gen }, gen() => { q, a, lines }
// where lines is the working (one step a line, the answer last). See year7-worksheets/ch01-integers/content.js.
const plainText = (t) => String(t).replace(/<[^>]+>/g, '');
const D = require('./diagrams');

// The worksheet's own character: the Mandelbrot set, with eyes.
const mascot = (() => {
  const pts = [];
  for (let k = 0; k <= 72; k++) { const t = (k / 72) * 2 * Math.PI, r = 6 * (1 - Math.cos(t)); pts.push([31 + r * Math.cos(t), 12 + r * Math.sin(t)]); }
  const path = `M${pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' L')} Z`;
  const eye = (x) => `<circle cx="${x}" cy="10" r="2" fill="#fff" stroke="#3d3b3c" stroke-width="0.35"/><circle cx="${x - 0.5}" cy="10.4" r="0.95" fill="#3d3b3c"/>`;
  return `<svg class="ff-mascot" viewBox="0 0 34 24" xmlns="http://www.w3.org/2000/svg"><line x1="3" y1="12" x2="13" y2="12" stroke="#3d3b3c" stroke-width="0.4"/><circle cx="5.2" cy="12" r="1" fill="#8fa3ea" stroke="#3d3b3c" stroke-width="0.35"/><circle cx="16" cy="12" r="3.1" fill="#8fa3ea" stroke="#3d3b3c" stroke-width="0.45"/><path d="${path}" fill="#8fa3ea" stroke="#3d3b3c" stroke-width="0.5"/>${eye(22.5)}${eye(27)}<path d="M23.5,15.2 Q25,16.6 26.5,15.2" fill="none" stroke="#3d3b3c" stroke-width="0.45" stroke-linecap="round"/></svg>`;
})();
const bubble = (text, side) => `<div class="ff-talk ${side}">${side === 'right' ? mascot : ''}<div class="ff-bubble">${text}</div>${side === 'left' ? mascot : ''}</div>`;

// Scaffolds made from the worked lines: 'full' shows them, 'answer' blanks the numbers on the last line,
// 'numbers' blanks every number (the structure stays), 'blank' leaves empty lines.
const NUM = /[−-]?\$?\d+(?:\.\d+)?/g;
const scaffold = (lines, level) => lines.map((l, i) => (level === 'full' ? l : level === 'answer' ? (i === lines.length - 1 ? l.replace(NUM, '____') : l) : level === 'numbers' ? l.replace(NUM, '____') : ''));
const LEVELS = { 2: ['full', 'answer', 'numbers'], 3: ['answer', 'numbers'] };

const num = (label, cls = '') => `<span class="ff-n ${cls}">${label}</span>`;
const quick = (label, it, shown) => `<div class="ff-row">${num(label)}<span class="ff-q">${it.q}</span><span class="ff-a">${shown ? `<b class="ff-done">${it.a}</b>` : ''}</span></div>`;
const work = (label, it, level, minLines) => {
  const ls = it.lines || [it.a];
  const shown = scaffold(ls, level);
  while (shown.length < minLines) shown.push('');
  return `<div class="ff-cell">${num(label)}<span class="ff-q">${it.q}</span>${shown.map((l) => `<i class="ff-l">${l ? `<b class="ff-done${level === 'full' ? '' : ' part'}">${l}</b>` : ''}</i>`).join('')}</div>`;
};

// A pool of different questions from a generator (a question of '' means "skip this one").
// gen(i) is told the index of the question it makes, so rounds with several kinds of question (kinds: n) take turns.
const pool = (gen, n = 40) => { const seen = new Set(), out = []; for (let t = 0; out.length < n && t < n * 30; t++) { const it = gen(out.length); if (!it || !it.q || seen.has(it.q)) continue; seen.add(it.q); out.push(it); } return out; };

// numberLine: { min, max } puts a number line across the top of the page for students to use.
module.exports = ({ code, title, numberLine }, content) => (chapter) => {
  // The room in a column is about 260 mm. Estimated heights (mm) decide how many questions fit.
  const ROOM = numberLine ? 238 : 258, BUBBLE = 13, TAG = 5;
  const lineCount = (t, chars) => Math.max(1, Math.ceil(plainText(t).length / chars));
  const hQuick = (it) => 3.2 + 4.2 * lineCount(it.q, 20);
  const hWork = (two) => (it) => 2.6 + 4.2 * lineCount(it.q, two ? 15 : 31) + Math.max(two ? 2 : 2, (it.lines || [1]).length) * 6.2;
  let n = 0;
  const answers = [], examples = [];

  // Every round starts with WE DO: one example of each kind of question in it (two when there is only one kind and
  // it opens the column), laid out just like the questions. Then YOU DO, fading from worked to blank.
  const column = (c, rounds) => {
    const side = c === 2 ? 'right' : 'left';
    let left = ROOM, html = '', ex = 0;
    rounds.forEach((rd, r) => {
      const items = pool(rd.gen);
      const two = c === 2 && items.every((it) => plainText(it.q).length <= 17 && (it.lines || []).every((l) => plainText(l).length <= 18));
      const h = c === 1 ? hQuick : hWork(two);
      const perRow = two ? 2 : 1, set = c === 1 ? 'list' : two ? 'two' : 'one';
      left -= BUBBLE;
      html += bubble(rd.text, side);
      const exItems = items.splice(0, rd.kinds || (r === 0 ? 2 : 1));
      exItems.forEach((it) => examples.push(`Column ${c}, E${++ex}: ${it.q} → ${(it.lines || [it.a]).join('; ')}`));
      const exCells = exItems.map((it, i) => (c === 1 ? quick(`E${ex - exItems.length + i + 1}`, it) : work(`E${ex - exItems.length + i + 1}`, it, 'blank', (it.lines || [1]).length)));
      html += `<div class="ff-tag we"><span class="zone-pill">WE DO</span><span>With your teacher: copy the working.</span></div><div class="ff-set we ${set}">${exCells.join('')}</div><div class="ff-tag you"><span class="zone-pill">YOU DO</span><span>Your turn.</span></div>`;
      let exH = 0;
      for (let k = 0; k < exItems.length; k += perRow) exH += Math.max(...exItems.slice(k, k + perRow).map(h));
      left -= 2 * TAG + exH + 2;
      const room = r < rounds.length - 1 ? left * (rounds.length === 2 ? 0.55 : 0.4) : left;
      const out = []; let used = 0;
      for (let i = 0; i < items.length; i += perRow) {
        const row = items.slice(i, i + perRow), hh = Math.max(...row.map(h));
        if (used + hh > room) break;
        used += hh; out.push(...row);
      }
      left -= used;
      const cells = out.map((it, k) => {
        const label = String(++n);
        answers.push(it.a);
        return c === 1 ? quick(label, it, k === 0) : work(label, it, LEVELS[c][k] || 'blank', 2);
      });
      // Any spare room in the column is shared out between the YOU DO sets, as extra writing space.
      html += `<div class="ff-set fill ${set}" style="flex-grow:${Math.max(1, Math.round(used))}">${cells.join('')}</div>`;
    });
    return html;
  };

  const words = ['', 'Easy', 'Medium', 'Challenging'];
  const cols = content.map((rounds, i) => {
    const first = n + 1, html = column(i + 1, rounds);
    return `<div class="ff-col l${i + 1}"><div class="ff-level"><b class="lvl-word l${i + 1}">${words[i + 1]}</b><span>Questions ${first}–${n}</span></div>${html}</div>`;
  });
  const body = `
    <div class="ws-title"><h2><span>${code}</span>${title}</h2><p>Year ${chapter.year} · Chapter ${chapter.number}: ${chapter.title}</p></div>
    ${numberLine ? `<div class="ws-nl">${D.numberLine({ min: numberLine.min, max: numberLine.max, w: 176, h: 13 })}</div>` : ''}
    <div class="ff-frame">${cols.join('')}</div>`;
  const page = `
<section class="page mb ws-page">
  <div class="ws-strip"></div>
  <div class="content">${body}</div>
  <footer class="page-foot"><span>Kingscliff High School · Year ${chapter.year} Mathematics</span><span class="pn">{{PN}}</span><span>Chapter ${chapter.number} · ${chapter.title}</span></footer>
</section>`;
  return { code, title, pages: [page], answers: [['WE DO examples (teacher)', examples], ['Questions (in order: Easy, Medium, Challenging)', answers]] };
};
