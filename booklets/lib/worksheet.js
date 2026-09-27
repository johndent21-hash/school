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
// content: [column 1 rounds, column 2 rounds, column 3 rounds]; a round is { text, gen, kinds?, fig?, fh?, one? },
// gen(i) => { q, a, lines?, fig?, fh? } where lines is the working (one step a line, the answer last).
//   fig, fh    a diagram under the question, printed near its drawn size (fh caps its height in mm). In column 1 a
//              diagram question has the diagram in the middle of the row and the answer line on the right.
//   round.fig  a diagram the whole round uses (a map, a graph, a timetable), shown under the speech bubble
//   round.one  keep column 2 questions one to a row
// See year7-worksheets/ch01-integers/content.js.
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
const NUM = /[−-]?\$?\d+(?: \d{3})*(?:\.\d+)?/g; // 6 160 is one number
// A line with no numbers (a construction step, a reason) keeps its first two words and blanks the rest.
// A line with no numbers (a word answer, a reason) keeps only a label before a colon ("vertex: ____").
// Powers (cm², x³) are kept: their small digits are part of the unit or the letter, not an answer.
const keepSup = (l, fn) => { const sups = []; const t = l.replace(/<sup>[^<]*<\/sup>/g, (m) => { sups.push(m); return `\u0001${'abcdefghij'[sups.length - 1]}\u0001`; }); return fn(t).replace(/\u0001([a-j])\u0001/g, (_, k) => sups['abcdefghij'.indexOf(k)]); };
const blankLine = (l) => { NUM.lastIndex = 0; if (NUM.test(l.replace(/<sup>[^<]*<\/sup>/g, ''))) { NUM.lastIndex = 0; return keepSup(l, (t) => t.replace(NUM, '___')); } const k = l.indexOf(':'); return k > 0 && k < 24 ? `${l.slice(0, k + 1)} ________` : '________'; };
const scaffold = (lines, level) => lines.map((l, i) => (level === 'full' ? l : level === 'answer' ? (i === lines.length - 1 ? blankLine(l) : l) : level === 'numbers' ? blankLine(l) : ''));
const LEVELS = { 2: ['full', 'answer', 'numbers'], 3: ['answer', 'numbers'] };

const num = (label, cls = '') => `<span class="ff-n ${cls}">${label}</span>`;
// Diagrams print close to the size they were drawn (1 unit = 1 mm, so labels stay about 7 pt), shrunk only to fit
// the width available: about 36 mm beside a column 1 question, 56 mm across a working cell.
const viewBox = (fig) => { const m = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(fig || ''); return m ? [+m[1], +m[2]] : null; };
const figH = (it, width) => { if (!it.fig) return 0; const vb = viewBox(it.fig); return vb ? Math.min(it.fh || 24, vb[1] * Math.min(1.1, width / vb[0])) : it.fh || 20; };
const figHtml = (it, width) => (it.fig ? `<div class="ff-fig" style="height:${figH(it, width).toFixed(1)}mm">${it.fig}</div>` : '');
const quick = (label, it, shown) => (it.fig
  ? `<div class="ff-frow">${num(label)}${it.q ? `<span class="ff-q">${it.q}</span>` : ''}${figHtml(it, 36)}<span class="ff-a">${shown ? `<b class="ff-done">${it.a}</b>` : ''}</span></div>`
  : `<div class="ff-row">${num(label)}<span class="ff-q">${it.q}</span><span class="ff-a">${shown ? `<b class="ff-done">${it.a}</b>` : ''}</span></div>`);
const work = (label, it, level, minLines) => {
  const ls = it.lines || [it.a];
  const shown = scaffold(ls, level);
  while (shown.length < minLines) shown.push('');
  return `<div class="ff-cell">${num(label)}<span class="ff-q">${it.q}</span>${figHtml(it, 56)}${shown.map((l) => `<i class="ff-l${plainText(l).length > 36 ? ' long' : ''}">${l ? `<b class="ff-done${level === 'full' ? '' : ' part'}">${l}</b>` : ''}</i>`).join('')}</div>`;
};

// A pool of different questions from a generator (a question of '' means "skip this one").
// gen(i) is told the index of the question it makes, so rounds with several kinds of question (kinds: n) take turns.
// A question may be only a diagram (q: ''); two questions are the same only if their text and diagram both match.
const pool = (gen, n = 40) => {
  const seen = new Set(), out = [];
  for (let t = 0; out.length < n && t < n * 30; t++) {
    // t: the attempt number, for generators that step through a list. null ends a finite list.
    const it = gen(out.length, t); if (it === null) break; if (!it || !(it.q || it.fig)) continue;
    const key = `${it.q}|${it.fig || ''}`; if (seen.has(key)) continue;
    seen.add(key); out.push(it);
  }
  return out;
};

// numberLine: { min, max } puts a number line across the top of the page for students to use.
// room: the height (mm) the questions of a column may fill; tools/fit-worksheets.js lowers it for a lesson that overflows.
module.exports = ({ code, title, numberLine, room }, content) => Object.assign((chapter) => {
  // The room in a column is about 260 mm. Estimated heights (mm) decide how many questions fit.
  const ROOM = room || (numberLine ? 244 : 268), BUBBLE = 13, TAG = 5;
  const lineCount = (t, chars) => Math.max(1, Math.ceil(plainText(t).length / chars));
  const hQuick = (it) => (it.fig ? Math.max(8, figH(it, 36) + 2 + (it.q ? 4.2 : 0)) : 3.2 + 4.2 * lineCount(it.q, 20));
  const lineH = (l) => (/class="fr"/.test(l) ? 8.4 : 6.2); // a line with a stacked fraction is taller
  const hWork = (two) => (it) => 2.6 + 4.2 * lineCount(it.q, two ? 15 : 31) * (/class="fr"/.test(it.q) ? 1.4 : 1) + (it.fig ? figH(it, 56) + 1.5 : 0) + Math.max(2, (it.lines || [1]).length) * 6.2 + (it.lines || []).reduce((t, l) => t + lineH(l) - 6.2, 0);
  let n = 0;
  const answers = [], examples = [];

  // Every round starts with WE DO: one example of each kind of question in it (two when there is only one kind and
  // it opens the column), laid out just like the questions. Then YOU DO, fading from worked to blank.
  const column = (c, rounds) => {
    const side = c === 2 ? 'right' : 'left';
    let html = '', ex = 0;
    // First pass: each round's questions, layout and fixed height (bubble, round diagram, WE DO examples, tags).
    const plan = rounds.map((rd, r) => {
      const items = pool(rd.gen);
      const figs = items.some((it) => it.fig);
      const two = c === 1 ? false : c === 2 && !rd.one && items.every((it) => plainText(it.q).length <= 17 && !it.fig && (it.lines || []).every((l) => plainText(l).length <= 18));
      const h = c === 1 ? hQuick : hWork(two);
      const perRow = two ? 2 : 1, set = c === 1 ? 'list' : two ? 'two' : 'one';
      const exItems = items.splice(0, rd.kinds || (r === 0 ? 2 : 1));
      let exH = 0;
      for (let k = 0; k < exItems.length; k += perRow) exH += Math.max(...exItems.slice(k, k + perRow).map(h));
      return { rd, items, h, perRow, set, exItems, fixed: BUBBLE + (rd.fig ? (rd.fh || 40) + 1.5 : 0) + 2 * TAG + exH + 2 };
    });
    // Second pass: the room left is shared evenly between the rounds' YOU DO questions (a round passes on what it
    // does not use).
    let free = ROOM - plan.reduce((t, p) => t + p.fixed, 0);
    plan.forEach(({ rd, items, h, perRow, set, exItems }, r) => {
      html += bubble(rd.text, side);
      if (rd.fig) html += `<div class="ff-rfig" style="height:${rd.fh || 40}mm">${rd.fig}</div>`;
      exItems.forEach((it) => examples.push(`Column ${c}, E${++ex}: ${it.q || '(diagram)'} → ${(it.lines || [it.a]).join('; ')}`));
      const exCells = exItems.map((it, i) => (c === 1 ? quick(`E${ex - exItems.length + i + 1}`, it) : work(`E${ex - exItems.length + i + 1}`, it, 'blank', (it.lines || [1]).length)));
      html += `<div class="ff-tag we"><span class="zone-pill">WE DO</span><span>With your teacher: copy the working.</span></div><div class="ff-set we ${set}">${exCells.join('')}</div><div class="ff-tag you"><span class="zone-pill">YOU DO</span><span>Your turn.</span></div>`;
      const room = free / (plan.length - r);
      const out = []; let used = 0;
      for (let i = 0; i < items.length; i += perRow) {
        const row = items.slice(i, i + perRow), hh = Math.max(...row.map(h));
        if (used + hh > room) break;
        used += hh; out.push(...row);
      }
      free -= used;
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
}, { code, room: room || (numberLine ? 244 : 268) });
