// Year 7 booklets designed from the research (see year7-own/DESIGN.md). One lesson is one double-sided A4 sheet.
//   Page 1, learn it:    Do now (retrieval) · Think first (optional) · Words + Big idea · Learn it (three faded
//                        worked example → your turn pairs, each with a Why? prompt) · Check (hinge question)
//   Page 2, practise it: Spot the pattern (minimal variation) · Practice (a drill of today's skill, then a short mix
//                        with at most two earlier ideas) · Go further · Exit ticket
// Look and feel: lib/penta.js (each lesson has its own rainbow colour, an opener band, an edge tab and a chapter
// spectrum). A lesson file gives the data; this file lays it out. A "Your turn" fades from the structure given
// (numbers blank), to the first line given, to blank.
const { blankLine, viewBox } = require('./worksheet').helpers;
const P5 = require('./penta');

const plain = (t) => String(t).replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, ' ');
const figBox = (fig, maxH = 22, w = 80) => {
  if (!fig) return '';
  const vb = viewBox(fig);
  const h = vb ? Math.min(maxH, vb[1] * Math.min(1.25, w / vb[0])) : maxH;
  return `<div class="pf-fig" style="height:${h.toFixed(1)}mm">${fig}</div>`;
};
const lines = (ls, shown) => ls.map((l, i) => `<i class="pf-l">${shown[i] ? `<b>${shown[i]}</b>` : ''}</i>`).join('');
const fade = (ls, k) => ls.map((l, i) => (k === 0 ? blankLine(l) : k === 1 && i === 0 ? blankLine(l) : ''));
const tag = (t) => (t ? `<span class="pf-from">from ${t}</span>` : '');
const head = (ic, name, note) => `<h3 class="pf-h"><i class="pf-icw">${P5.icon(ic)}</i><span>${name}</span>${note ? `<em>${note}</em>` : ''}</h3>`;
const vars = (code) => { const h = P5.hueOf(code); return `--d:${h.deep};--t:${h.tint};--m:${h.mid}`; };

// The page shell: page 1 opens the lesson with a full-width band; page 2 has a slim band. Both carry the edge tab and
// the chapter spectrum (which lesson of the chapter this is).
const shell = ({ code, title, chapter, codes, goal, k, body }) => {
  const n = P5.indexOf(code), total = codes.filter((c) => /^\d/.test(c)).length;
  const band = k === 0
    ? `<header class="pf-open">
    <div class="pf-num"><span>${code === 'Review' ? 'Chapter' : 'Exercise'}</span><b class="${code === 'Review' ? 'word' : ''}">${code === 'Review' ? 'Review' : code}</b>${P5.pentaflake({ depth: 3, colour: () => '#fff', cls: 'pf-numflake', opacity: 0.22 })}</div>
    <div class="pf-tt"><p class="pf-kick">Year ${chapter.year} · Chapter ${chapter.number}: ${chapter.title}${/^\d/.test(code) ? ` · lesson ${n} of ${total}` : ''}</p><h1 class="${title.length > 24 ? 'long' : ''}">${title}</h1>${goal ? `<p class="pf-goal"><b>Today I will</b> ${goal}.</p>` : ''}</div>
    <div class="pf-name"><span>Name</span><i></i><span>Class</span><i></i><span>Date</span><i></i></div>
    ${P5.spectrum(codes, code)}
  </header>`
    : `<header class="pf-slim"><div class="pf-code">${code === 'Review' ? 'R' : code}</div><div class="pf-slim-t"><b>${title}</b><span>Page 2 · ${code === 'Review' ? 'Keep going' : 'Practise it'}</span></div>${P5.spectrum(codes, code)}</header>`;
  return `
<section class="page pf own ${k ? 'p2' : 'p1'}" style="${vars(code)}">
  ${P5.tab(code, k === 1)}
  ${band}
  <div class="content">${body}</div>
  ${P5.foot(chapter)}
</section>`;
};

module.exports = ({ code, title }, L) => Object.assign((chapter) => {
  const notes = [], worked = [];
  notes.plain = true; worked.plain = true;
  const codes = chapter.lessonCodes || [code];
  const w = (label, q, ls) => worked.push(`<b>${label}</b> ${q}<br><span class="aw">${[].concat(ls).join(' &ensp;·&ensp; ')}</span>`);

  // ---------- page 1: learn it ----------
  const doNow = `<section class="pf-block pf-dn">${head('donow', 'Do now', 'From memory. No notes.')}
    <div class="pf-dn-grid">${L.doNow.map((d, i) => { w(`Do now ${i + 1}`, d.q, d.a); return `<div class="pf-dn-cell">${d.from ? `<span class="pf-from">${d.from}</span>` : ''}<p><b class="pf-n">${i + 1}</b> ${d.q}</p><i class="pf-box"></i></div>`; }).join('')}</div></section>`;

  const think = L.think ? (w('Think first', L.think.q, L.think.a), `<section class="pf-block pf-think"><div class="pf-think-row">${head('think', 'Think first')}<p>${L.think.q}<em> Have a go. It\'s fine to be unsure.</em></p><i class="pf-box wide"></i></div></section>`) : '';

  const big = `<section class="pf-block pf-big">
    <div class="pf-words">${head('idea', 'Words')}${L.words.map(([t, d]) => `<p><b>${t}</b> ${d}</p>`).join('')}</div>
    <div class="pf-idea"><p class="pf-idea-h">Big idea</p>${L.big.text}<div class="pf-bigfigs">${(L.big.figs || []).map((f) => figBox(f, L.big.fh || 13, 62)).join('')}</div></div></section>`;

  const pairs = L.pairs.map((p, k) => {
    w(`Example ${k + 1}`, p.ex.q, p.ex.lines);
    w(`Your turn ${k + 1}`, p.you.q, p.you.lines);
    if (p.why) notes.push(`<b>Why? (pair ${k + 1})</b> ${p.why.q}<br><span class="aw">${p.why.a}</span>`);
    const exCell = `<div class="pf-ex"><span class="pf-lab">${P5.icon('eye', 'pf-lic')}Worked example ${k + 1}</span><p class="pf-q">${p.ex.q}</p>${figBox(p.ex.figDone || p.ex.fig, p.fh || 14, 70)}<div class="pf-ls">${lines(p.ex.lines, p.ex.lines)}</div>${p.why ? `<p class="pf-why">${P5.icon('why', 'pf-wic')}<span><b>Why?</b> ${p.why.q}</span></p><i class="pf-l why"></i>` : ''}</div>`;
    const youCell = `<div class="pf-you"><span class="pf-lab">${P5.icon('pencil', 'pf-lic')}Your turn ${k + 1}</span><p class="pf-q">${p.you.q}</p>${figBox(p.you.fig, p.fh || 14, 70)}<div class="pf-ls">${lines(p.you.lines, fade(p.you.lines, k))}</div></div>`;
    return `<div class="pf-pair">${exCell}<div class="pf-arrow"><span>➜</span></div>${youCell}</div>`;
  }).join('');
  const learn = `<section class="pf-block pf-learn">${head('learn', 'Learn it', 'Read the worked example. Then do your turn beside it. Stuck? Look back at the example.')}${pairs}</section>`;

  const opts = ['A', 'B', 'C', 'D'];
  const H = L.hinge;
  notes.unshift(`<b>Key misconception.</b> ${L.teacher.misconception}`);
  notes.push(`<b>Check (hinge).</b> ${H.q} Answer: <b>${H.answer}</b>.<br>${opts.map((o, i) => `${o} (${H.options[i]}): ${H.why[o]}`).join('<br>')}`);
  notes.push(`<b>Next.</b> ${L.teacher.next}`);
  if (L.think) notes.push(`<b>Think first.</b> ${L.teacher.think}`);
  const check = `<section class="pf-block pf-check">${head('check', 'Check', 'Everyone answers. Circle one letter, then hold it up.')}<div class="pf-check-row"><p>${H.q}</p>${H.options.map((o, i) => `<span class="pf-opt"><b>${opts[i]}</b>${o}</span>`).join('')}</div></section>`;

  // ---------- page 2: practise it ----------
  const P = L.pattern;
  P.items.forEach((it, i) => w(`Pattern ${i + 1}`, it.q, it.a));
  w('Notice', P.notice, P.noticeA);
  const pattern = `<section class="pf-block pf-pattern">${head('pattern', 'Spot the pattern', P.text)}
    <div class="pf-pat-grid">${P.items.map((it, i) => `<p><b class="pf-n">${i + 1}</b> ${it.q}${/☐/.test(it.q) ? '&ensp;' : ' = '}<i class="pf-blank${/☐/.test(it.q) ? ' short' : ''}"></i></p>`).join('')}</div>
    <p class="pf-why">${P5.icon('why', 'pf-wic')}<span><b>What do you notice?</b> ${P.notice}</span></p><i class="pf-l why"></i></section>`;

  // Practice: a drill of today's skill (short questions answered on the line beside them), then a short mix with
  // today's skill in context and no more than two questions from earlier lessons.
  const drill = L.drill || [];
  if (drill.length) worked.push(`<b>Drill</b><br><span class="aw">${drill.map((d, i) => `${i + 1}) ${d.a}`).join(' &ensp; ')}</span>`);
  const drillCells = drill.map((d, i) => `<p class="pf-dr ${plain(d.q).length > 18 ? 'long' : ''}"><b class="pf-n">${i + 1}</b><span>${d.q}</span><i></i></p>`).join('');
  const mixCells = L.mixed.map((m, i) => { const n = drill.length + i + 1; w(`Practice ${n}`, m.q, m.a); return `<div class="pf-mix-cell ${m.from ? 'old' : ''}"><p>${tag(m.from)}<b class="pf-n">${n}</b> ${m.q}</p><i class="pf-l"></i></div>`; }).join('');
  const practice = `<section class="pf-block pf-prac">${head('practice', 'Practice', 'Get today\'s skill quick and accurate first. Then mix it up.')}
    <p class="pf-sub">Drill: ${L.canDo}</p><div class="pf-drill${L.drillCols === 2 ? ' two' : ''}">${drillCells}</div>
    <p class="pf-sub">Mix it up: read each one carefully</p><div class="pf-mix">${mixCells}</div></section>`;

  const further = `<section class="pf-block pf-further">${head('further', 'Go further', 'Finished? Try these. Explain your thinking.')}
    ${L.further.map((f, i) => { w(`Go further ${i + 1}`, f.q, f.a); return `<div class="pf-fur"><p><b class="pf-n">${i + 1}</b> ${f.q}</p>${'<i class="pf-l"></i>'.repeat(f.n || 2)}</div>`; }).join('')}</section>`;

  const exit = `<section class="pf-block pf-exit">${head('exit', 'Exit ticket', 'On your own. Hand it in.')}
    <div class="pf-exit-grid">${L.exit.map((e, i) => { w(`Exit ${i + 1}`, e.q, e.a); return `<div class="pf-exit-cell"><p><b class="pf-n">${i + 1}</b> ${e.q}</p><i class="pf-box"></i></div>`; }).join('')}</div>
    <p class="pf-rate">Today I can ${L.canDo}. <span>Not yet</span><span>Nearly</span><span>Got it</span></p></section>`;

  return {
    code, title,
    pages: [shell({ code, title, chapter, codes, goal: L.canDo, k: 0, body: doNow + think + big + learn + check }),
      shell({ code, title, chapter, codes, k: 1, body: pattern + practice + further + exit })],
    answers: [['Teacher notes', notes], ['Worked answers', worked]],
  };
}, { code, pagesEach: 2 });

// The chapter review: two pages of mixed questions from every lesson, each with its lesson's colour, then a check
// list of the lessons to go back to. items: [{ from, q, a, n? }], the first half on page 1.
module.exports.review = ({ code, title, intro }, items) => Object.assign((chapter) => {
  const worked = []; worked.plain = true;
  const codes = chapter.lessonCodes || [code];
  const half = Math.ceil(items.length / 2);
  const cells = (list, start) => list.map((m, i) => { worked.push(`<b>${start + i + 1}</b> ${m.q}<br><span class="aw">${m.a}</span>`); return `<div class="pf-mix-cell rev" style="${vars(m.from)}"><p><span class="pf-from chip">${m.from}</span><b class="pf-n">${start + i + 1}</b> ${m.q}</p>${'<i class="pf-l"></i>'.repeat(m.n || 2)}</div>`; }).join('');
  const lessons = [...new Set(items.map((m) => m.from))].sort();
  const block = (k, list, start) => `<section class="pf-block pf-prac pf-rev">${head('review', `Mixed review ${k}`, k === 'A' ? intro : 'Keep going. Each question shows which lesson it comes from.')}<div class="pf-mix">${cells(list, start)}</div></section>`;
  const track = `<section class="pf-block pf-exit">${head('check', 'What next?', 'Mark your answers with your teacher. Tick each lesson where you got every question right.')}
    <div class="pf-track">${lessons.map((l) => `<span style="${vars(l)}"><b>${l}</b><i></i></span>`).join('')}</div>
    <p class="pf-rate">Not ticked? Go back to that lesson's worked examples, then try its exit ticket again.</p></section>`;
  return {
    code, title,
    pages: [shell({ code, title, chapter, codes, goal: 'show what I remember from the whole chapter', k: 0, body: block('A', items.slice(0, half), 0) }),
      shell({ code, title, chapter, codes, k: 1, body: block('B', items.slice(half), half) + track })],
    answers: [['Worked answers', worked]],
  };
}, { code, pagesEach: 2 });
