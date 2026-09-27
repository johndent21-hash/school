// Three-column worksheet: one page per lesson, in the style of the Freefall Mathematics worksheets.
// The columns get harder from left to right (Easy, Medium, Challenging). The top of each column (about a quarter)
// is a WE DO block: a speech bubble saying what to do, then the teacher's examples, left unworked with space for
// the working. The rest of the column is YOU DO. Question numbers run on across the columns.
//   column 1  quick answers on a line (the Easy drill rounds; a second bubble where the instruction changes)
//   column 2  two lines of working (the Medium drill); the first questions carry a scaffold that fades out
//   column 3  three lines of working (the Set D questions and the extension)
// The lesson spec is the blended spec (lib/blend.js), plus scaffold: [column 2 scaffold, column 3 scaffold].
const { mbPage } = require('./layout');
const { pairExamples } = require('./lesson-blend');

const plainText = (t) => String(typeof t === 'object' ? t.t : t).replace(/<[^>]+>/g, '');
const txt = (it) => (typeof it === 'string' ? it : it.t);
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const L = 'abcd';

// The worksheet's own character: the Mandelbrot set, with eyes.
const mascot = (() => {
  // Main cardioid (cusp on the right), the round bulb on its left and a tiny bulb on the antenna, like the real set.
  const pts = [];
  for (let k = 0; k <= 72; k++) { const t = (k / 72) * 2 * Math.PI, r = 6 * (1 - Math.cos(t)); pts.push([31 + r * Math.cos(t), 12 + r * Math.sin(t)]); }
  const path = `M${pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' L')} Z`;
  const eye = (x) => `<circle cx="${x}" cy="10" r="2" fill="#fff" stroke="#3d3b3c" stroke-width="0.35"/><circle cx="${x - 0.5}" cy="10.4" r="0.95" fill="#3d3b3c"/>`;
  return `<svg class="ff-mascot" viewBox="0 0 34 24" xmlns="http://www.w3.org/2000/svg"><line x1="3" y1="12" x2="13" y2="12" stroke="#3d3b3c" stroke-width="0.4"/><circle cx="5.2" cy="12" r="1" fill="#8fa3ea" stroke="#3d3b3c" stroke-width="0.35"/><circle cx="16" cy="12" r="3.1" fill="#8fa3ea" stroke="#3d3b3c" stroke-width="0.45"/><path d="${path}" fill="#8fa3ea" stroke="#3d3b3c" stroke-width="0.5"/>${eye(22.5)}${eye(27)}<path d="M23.5,15.2 Q25,16.6 26.5,15.2" fill="none" stroke="#3d3b3c" stroke-width="0.45" stroke-linecap="round"/></svg>`;
})();
const bubble = (text, side = 'left') => `<div class="ff-talk ${side}">${side === 'right' ? mascot : ''}<div class="ff-bubble">${text}</div>${side === 'left' ? mascot : ''}</div>`;

// WE DO: the bubble, then the examples with blank space for the teacher's working.
const weDo = (lvl, instruction, ex) => `
  <div class="ff-we">
    ${bubble(instruction, lvl === 2 ? 'right' : 'left')}
    <div class="ff-head"><span class="zone-pill">WE DO</span><span>Examples. Copy your teacher's working.</span></div>
    <div class="ff-ex n${ex.parts.some((p) => typeof p === 'object' && p.draw) ? 1 : ex.parts.length}">${ex.parts.map((p, i) => `
      <div class="ff-exq"><p><span class="part-l">${L[i]}</span>${txt(p)}</p>${typeof p === 'object' && p.draw ? `<div class="ff-draw">${p.draw}</div>` : '<div class="ff-space"></div>'}</div>`).join('')}
    </div>
  </div>`;

const num = (n) => `<span class="ff-n">${n}</span>`;
const lines = (k, scaffold) => Array.from({ length: k }, (_, i) => `<i class="ff-l">${i === 0 && scaffold ? `<em>${scaffold}</em>` : ''}</i>`).join('');

// Column 1: question, then an answer line on the right.
const quickList = (items, from) => items.map((it, i) => `<div class="ff-row">${num(from + i)}<span class="ff-q">${txt(it)}</span><span class="ff-a"></span></div>`).join('');
// Columns 2 and 3: question, then lines for working. scaffolds[i] is written (grey) on the first line of question i.
const workList = (items, from, k, scaffolds = []) => items.map((it, i) => `
  <div class="ff-cell">${num(from + i)}<span class="ff-q">${txt(it)}</span>${typeof it === 'object' && it.draw ? `<div class="ff-draw">${it.draw}</div>` : lines(k, scaffolds[i])}</div>`).join('');

module.exports = (spec) => (chapter) => {
  const sk = spec.skills || { easy: [], medium: [] };
  const ex = spec.ex || pairExamples(spec.we, spec.stems, spec.exFigs);
  const plainRound = (x) => !x.fig && !x.work && x.items.every((it) => typeof it === 'string' || (!it.fig && !it.draw));
  const [sc2, sc3] = spec.scaffold || [];
  const answers = [];
  let n = 0;

  // Each YOU DO area is about 175 mm tall. Questions are added while the estimated height still fits.
  const ROOM = 172, BUBBLE = 12;
  const lineCount = (it, chars) => Math.max(1, Math.ceil(plainText(it).length / chars));
  const take = (items, room, h) => { let used = 0, k = 0; while (k < items.length && used + h(items[k]) <= room) used += h(items[k++]); return [k, used]; };

  // Column 1: up to two Easy rounds, a quick answer on a line (about 20 characters a line beside the answer line).
  const easy = sk.easy.filter(plainRound).slice(0, 2);
  const h1 = (it) => 5.5 + 4.2 * lineCount(it, 20);
  const c1 = []; let left = ROOM;
  easy.forEach((x, r) => {
    const [k, used] = take(x.items, r === 0 && easy[1] ? Math.min(left * 0.55, left) : left - (r ? BUBBLE : 0), h1);
    if (!k) return;
    c1.push(`${r ? `<div class="ff-sub">${bubble(cap(x.text))}</div>` : ''}${quickList(x.items.slice(0, k), n + 1)}`);
    answers.push(...x.ans.slice(0, k)); n += k; left -= used + (r ? BUBBLE : 0);
  });
  const col1Ans = answers.splice(0);

  // Column 2: the Medium rounds with two lines of working. Short questions sit two to a row.
  const med = sk.medium.filter(plainRound).slice(0, 2);
  const scaff = [sc2, sc2, sc2 ? '= ________' : undefined];
  const c2 = []; left = ROOM; const firstC2 = n + 1;
  med.forEach((x, r) => {
    const two = x.items.every((it) => plainText(it).length <= 17);
    const h2 = (it) => 2.5 + 4.2 * lineCount(it, two ? 15 : 32) + 2 * 6.3;
    const room = (r === 0 && med[1] ? left * 0.6 : left) - (r ? BUBBLE : 0);
    let [k, used] = take(two ? x.items.filter((_, i) => i % 2 === 0) : x.items, room, h2);
    if (two) k = Math.min(x.items.length, k * 2);
    if (!k) return;
    c2.push(`${r ? `<div class="ff-sub">${bubble(cap(x.text), 'right')}</div>` : ''}<div class="ff-grid ${two ? 'two' : 'one'}">${workList(x.items.slice(0, k), n + 1, 2, r ? [] : scaff)}</div>`);
    answers.push(...x.ans.slice(0, k)); n += k; left -= used + (r ? BUBBLE : 0);
  });
  const col2Ans = answers.splice(0);

  // Column 3: challenge questions and the extension, three lines of working each (a number line when drawn).
  const hard = [...spec.d.items.map((it, i) => [it, spec.ans.d[i]]), ...spec.ext.qs.map((it, i) => [it, spec.ans.ext[i]])];
  const h3 = ([it]) => 3 + 4.2 * lineCount(it, 30) + (typeof it === 'object' && it.draw ? 16 : 3 * 6.3);
  const [k3] = take(hard, ROOM, h3);
  const c3items = hard.slice(0, k3);
  const firstC3 = n + 1;
  const c3 = `<div class="ff-grid one">${workList(c3items.map((x) => x[0]), n + 1, 3, [sc3])}</div>`;
  const col3Ans = c3items.map((x) => x[1]); n += c3items.length;

  const col = (lvl, word, we, body, note) => `
    <div class="ff-col l${lvl}">
      ${we}
      <div class="ff-you">
        <div class="ff-head you"><span class="zone-pill">YOU DO</span><b class="lvl-word l${lvl}">${word}</b><span>${note}</span></div>
        ${body}
      </div>
    </div>`;
  const body = `
    <div class="ff-title"><h2>${spec.title}</h2><p>Kingscliff High School · Year ${chapter.year} Mathematics · Chapter ${chapter.number}: ${chapter.title} · Lesson ${spec.code}</p></div>
    <div class="ff-frame">
      ${col(1, 'Easy', weDo(1, cap(easy[0] ? easy[0].text : ex[0].stem), ex[0]), c1.join(''), `Questions 1–${col1Ans.length}. Answer on the line.`)}
      ${col(2, 'Medium', weDo(2, `Now show your working. ${cap(med[0] ? med[0].text : ex[1].stem)}`, ex[1]), c2.join(''), `Questions ${firstC2}–${firstC3 - 1}. Show your working.`)}
      ${col(3, 'Challenging', weDo(3, `${cap(spec.d.text)} Show every step on the lines.`, ex[2]), c3, `Questions ${firstC3}–${n}. Show every step.`)}
    </div>`;

  const exAns = spec.ex ? spec.exAns : null;
  const weAns = exAns ? exAns.flatMap((parts, k) => parts.map((a, i) => `Ex ${k + 1}${L[i]}: ${a}`)) : spec.ans.we.map((a, i) => `Ex ${Math.floor(i / 2) + 1}${L[i % 2]}: ${a}`);
  return {
    code: spec.code, title: spec.title, spec,
    pages: [mbPage(chapter, { code: spec.code, title: spec.title, section: 'Worksheet', body, first: true, cls: 'ff-page' })],
    // One numbered list, so the numbers match the worksheet (Easy 1–…, then Medium, then Challenging).
    answers: [['WE DO examples (teacher)', weAns], [`Questions: Easy 1–${col1Ans.length}, Medium ${firstC2}–${firstC3 - 1}, Challenging ${firstC3}–${n}`, [...col1Ans, ...col2Ans, ...col3Ans]]],
  };
};
