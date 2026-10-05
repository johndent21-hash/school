// Year 7 booklets designed from the research (see year7-own/DESIGN.md). One lesson is one double-sided A4 sheet.
//   Page 1, learn it:    Do now (retrieval) · Think first (optional) · Words + Big idea (a cloze, filled in with the
//                        teacher) · Learn it (three example → your turn pairs: the example is blank, for the teacher
//                        to model live; each has an Explain prompt) · Check (hinge question)
//   Page 2, practise it: Spot the pattern (minimal variation) · Mixed practice (about 80% today's skill, 20% earlier
//                        lessons, marked) · Go further · Exit ticket
// Look and feel: lib/circles.js. A lesson file gives the data; this file lays it out. A "Your turn" fades from the
// structure given (numbers blank), to the first line given, to blank.
const { blankLine, viewBox } = require('./worksheet').helpers;
const TC = require('./circles');

const figBox = (fig, maxH = 22, w = 80) => {
  if (!fig) return '';
  const vb = viewBox(fig);
  const h = vb ? Math.min(maxH, vb[1] * Math.min(1.25, w / vb[0])) : maxH;
  return `<div class="tc-fig" style="height:${h.toFixed(1)}mm">${fig}</div>`;
};
const lines = (n, shown = []) => Array.from({ length: n }, (_, i) => `<i class="tc-l">${shown[i] ? `<b>${shown[i]}</b>` : ''}</i>`).join('');
const fade = (ls, k) => ls.map((l, i) => (k === 0 ? blankLine(l) : k === 1 && i === 0 ? blankLine(l) : ''));
const head = (ic, name, note) => `<h3 class="tc-h"><i class="tc-icw">${TC.icon(ic)}</i><span>${name}</span>${note ? `<em>${note}</em>` : ''}</h3>`;
const from = (t) => (t ? `<span class="tc-from">from ${t}</span>` : '');
// The Big idea is a cloze: [[word]] marks a gap, sized to the word, filled in with the teacher.
const gap = (w) => `<span class="tc-gap" style="width:${Math.max(13, w.replace(/<[^>]+>|&[a-z]+;/g, 'x').length * 2.3).toFixed(1)}mm"></span>`;
const cloze = (t) => t.replace(/\[\[(.+?)\]\]/g, (_, w) => gap(w));
const filled = (t) => t.replace(/\[\[(.+?)\]\]/g, (_, w) => `<u><b>${w}</b></u>`);
const plain = (t) => String(t).replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, ' ');
// Typesetting: never leave a short last word (like "3?") alone on a line, and never split a list of numbers.
const list = (t) => t.replace(/(?:−?\d+(?:°C)?, )+−?\d+(?:°C)?/g, (m) => `<span class="nw">${m}</span>`);
const keep = (t) => list(String(t).replace(/(\d) (\d{3})\b/g, '$1\u00a0$2').replace(/(\d) (m|km|cm|floors?|hours?|minutes?)\b/g, '$1\u00a0$2')).replace(/ ([^\s<>]{1,9}(?:<\/\w+>)?)$/, '&nbsp;$1');

// The page shell: page 1 opens the lesson with a full-width band (a dark number block with the lesson's times-table
// circle, the title and "Today I will"); page 2 has a slim band. Both carry the edge tab and the chapter progress bar.
const shell = ({ code, title, chapter, codes, goal, k, body }) => {
  const n = TC.indexOf(code), total = codes.filter((c) => /^\d/.test(c)).length, rev = code === 'Review';
  const band = k === 0
    ? `<header class="tc-open">
    <div class="tc-num"><span>${rev ? 'Chapter' : 'Exercise'}</span><b class="${rev ? 'word' : ''}">${rev ? 'Review' : code}</b>${TC.badge(code, { cls: 'tc-numcircle', ring: '#59616c' })}</div>
    <div class="tc-tt"><p class="tc-kick">Year ${chapter.year} · Chapter ${chapter.number}: ${chapter.title}${rev ? '' : ` · lesson ${n} of ${total}`}</p><h1 class="${title.length > 24 ? 'long' : ''}">${title}</h1>${goal ? `<p class="tc-goal"><b>Today I will</b> ${goal}.</p>` : ''}</div>
    <div class="tc-name"><span>Name</span><i></i><span>Class</span><i></i><span>Date</span><i></i></div>
    ${TC.progress(codes, code)}
  </header>`
    : `<header class="tc-slim"><div class="tc-code">${rev ? 'Review' : code}</div><div class="tc-slim-t"><b>${title}</b><span>Page 2 · ${rev ? 'Keep going' : 'Practise it'}</span></div>${TC.progress(codes, code)}</header>`;
  return `
<section class="page tc own ${k ? 'p2' : 'p1'}">
  ${TC.tab(code, k === 1)}
  ${band}
  <div class="content">${body}</div>
  ${TC.foot(chapter)}
</section>`;
};

module.exports = ({ code, title }, L) => Object.assign((chapter) => {
  const notes = [], worked = [];
  notes.plain = true; worked.plain = true;
  const codes = chapter.lessonCodes || [code];
  const w = (label, q, ls) => worked.push(`<b>${label}</b> ${q}<br><span class="aw">${[].concat(ls).join(' &ensp;·&ensp; ')}</span>`);

  // ---------- page 1: learn it ----------
  const doNow = `<section class="tc-block tc-dn">${head('donow', 'Do now', 'From memory. No notes.')}
    <div class="tc-dn-grid">${L.doNow.map((d, i) => { w(`Do now ${i + 1}`, d.q, d.a); return `<div class="tc-dn-cell"><p><b class="tc-n">${i + 1}</b> ${keep(d.q)}</p><i class="tc-box">${from(d.from)}</i></div>`; }).join('')}</div></section>`;

  const think = L.think ? (w('Think first', L.think.q, L.think.a), `<section class="tc-block tc-think"><div class="tc-think-row">${head('think', 'Think first', 'Have a go.')}<p>${keep(L.think.q)}</p><i class="tc-box wide"></i></div></section>`) : '';

  notes.push(`<b>Big idea (fill in together).</b> ${filled(L.big.text)}`);
  const big = `<section class="tc-block tc-big">
    <div class="tc-words">${head('idea', 'Words')}${L.words.map(([t, d]) => `<p><b>${t}</b> ${d}</p>`).join('')}</div>
    <div class="tc-idea"><p class="tc-idea-h">Big idea <em>Fill in the gaps with your teacher.</em></p><p class="tc-cloze">${cloze(keep(L.big.text))}</p><div class="tc-bigfigs">${(L.big.figs || []).map((f) => figBox(f, L.big.fh || 13, 62)).join('')}</div></div></section>`;

  const pairs = L.pairs.map((p, k) => {
    w(`Example ${k + 1} (model this)`, p.ex.q, p.ex.lines);
    w(`Your turn ${k + 1}`, p.you.q, p.you.lines);
    notes.push(`<b>Explain ${k + 1}.</b> ${p.why.q}<br><span class="aw">${p.why.a}</span>`);
    const exCell = `<div class="tc-ex"><span class="tc-lab">${TC.icon('board', 'tc-lic')}Example ${k + 1}</span><p class="tc-q">${keep(p.ex.q)}</p>${figBox(p.ex.fig, p.fh || 14, 70)}<div class="tc-ls">${lines(p.ex.lines.length)}</div>
      <p class="tc-why"><b>${TC.icon('talk', 'tc-wic')}Explain</b><span>${keep(p.why.q)}</span></p><i class="tc-l why"><span>${p.why.s}</span></i></div>`;
    const youCell = `<div class="tc-you"><span class="tc-lab">${TC.icon('pencil', 'tc-lic')}Your turn ${k + 1}</span><p class="tc-q">${keep(p.you.q)}</p>${figBox(p.you.fig, p.fh || 14, 70)}<div class="tc-ls">${lines(p.you.lines.length, fade(p.you.lines, k))}</div></div>`;
    return `<div class="tc-pair">${exCell}<div class="tc-arrow"><span>➜</span></div>${youCell}</div>`;
  }).join('');
  const learn = `<section class="tc-block tc-learn">${head('learn', 'Learn it', 'Your teacher works through each example with you: copy the working. Then try your turn beside it.')}${pairs}</section>`;

  const opts = ['A', 'B', 'C', 'D'];
  const H = L.hinge;
  notes.unshift(`<b>Key misconception.</b> ${L.teacher.misconception}`);
  notes.push(`<b>Check (hinge).</b> ${H.q} Answer: <b>${H.answer}</b>.<br>${opts.map((o, i) => `${o} (${H.options[i]}): ${H.why[o]}`).join('<br>')}`);
  notes.push(`<b>Next.</b> ${L.teacher.next}`);
  if (L.think) notes.push(`<b>Think first.</b> ${L.teacher.think}`);
  const check = `<section class="tc-block tc-check">${head('check', 'Check', 'Everyone answers. Circle one letter, then hold it up.')}<div class="tc-check-row"><p>${H.q}</p>${H.options.map((o, i) => `<span class="tc-opt"><b>${opts[i]}</b>${o}</span>`).join('')}</div></section>`;

  // ---------- page 2: practise it ----------
  const P = L.pattern;
  P.items.forEach((it, i) => w(`Pattern ${i + 1}`, it.q, it.a));
  w('What do you notice?', P.notice, P.noticeA);
  const pattern = `<section class="tc-block tc-pattern">${head('pattern', 'Spot the pattern', P.text)}
    <div class="tc-pat-grid${P.wide ? ' wide' : ''}">${P.items.map((it, i) => `<p><b class="tc-n">${i + 1}</b> ${it.q}${/☐/.test(it.q) ? '&ensp;' : ' = '}<i class="tc-blank${/☐/.test(it.q) ? ' short' : ''}"></i></p>`).join('')}</div>
    <p class="tc-notice"><b>What do you notice?</b> ${keep(P.notice)}</p><i class="tc-l why"></i></section>`;

  // Mixed practice: about four in five questions on today's skill (short drill first, then in context), and about one
  // in five from earlier lessons, spread through and marked "from 1.0x".
  const mixed = `<section class="tc-block tc-prac">${head('practice', 'Mixed practice', 'Mostly today\'s skill. Questions marked "from" are from earlier lessons. Show your working.')}
    <div class="tc-mix">${L.mixed.map((m, i) => { w(`Mixed ${i + 1}`, m.q, m.a); return `<div class="tc-mix-cell ${m.from ? 'old' : ''}"><p><b class="tc-n">${i + 1}</b> ${keep(m.q)}</p><i class="tc-l">${from(m.from)}</i></div>`; }).join('')}</div></section>`;

  const further = `<section class="tc-block tc-further">${head('further', 'Go further', 'Finished? Try these. Explain your thinking.')}
    ${L.further.map((f, i) => { w(`Go further ${i + 1}`, f.q, f.a); return `<div class="tc-fur"><p><b class="tc-n">${i + 1}</b> ${keep(f.q)}</p>${'<i class="tc-l"></i>'.repeat(f.n || 2)}</div>`; }).join('')}</section>`;

  const exit = `<section class="tc-block tc-exit">${head('exit', 'Exit ticket', 'On your own. Hand it in.')}
    <div class="tc-exit-grid">${L.exit.map((e, i) => { w(`Exit ${i + 1}`, e.q, e.a); return `<div class="tc-exit-cell"><p><b class="tc-n">${i + 1}</b> ${keep(e.q)}</p><i class="tc-box"></i></div>`; }).join('')}</div>
    <p class="tc-rate">Today I can ${L.canDo}. <span>Not yet</span><span>Nearly</span><span>Got it</span></p></section>`;

  return {
    code, title,
    pages: [shell({ code, title, chapter, codes, goal: L.canDo, k: 0, body: doNow + think + big + learn + check }),
      shell({ code, title, chapter, codes, k: 1, body: pattern + mixed + further + exit })],
    answers: [['Teacher notes', notes], ['Worked answers', worked]],
  };
}, { code, pagesEach: 2 });

// The chapter review: two pages of mixed questions from every lesson, each marked with its lesson, then a check list
// of the lessons to go back to. items: [{ from, q, a, n? }], the first half on page 1.
module.exports.review = ({ code, title, intro }, items) => Object.assign((chapter) => {
  const worked = []; worked.plain = true;
  const codes = chapter.lessonCodes || [code];
  const half = Math.ceil(items.length / 2);
  const cells = (list, start) => list.map((m, i) => { worked.push(`<b>${start + i + 1}</b> ${m.q}<br><span class="aw">${m.a}</span>`); return `<div class="tc-rev-cell"><p><span class="tc-chip">${m.from}</span><b class="tc-n">${start + i + 1}</b> ${keep(m.q)}</p>${'<i class="tc-l"></i>'.repeat(m.n || 2)}</div>`; }).join('');
  const lessons = [...new Set(items.map((m) => m.from))].sort();
  const block = (k, list, start) => `<section class="tc-block tc-prac tc-rev">${head('review', `Mixed review ${k}`, k === 'A' ? intro : 'Keep going. Each question shows which lesson it comes from.')}<div class="tc-rev-grid">${cells(list, start)}</div></section>`;
  const track = `<section class="tc-block tc-exit">${head('check', 'What next?', 'Mark your answers with your teacher. Tick each lesson where you got every question right.')}
    <div class="tc-track">${lessons.map((l) => `<span><b>${l}</b><i></i></span>`).join('')}</div>
    <p class="tc-rate">Not ticked? Go back to that lesson's examples, then try its exit ticket again.</p></section>`;
  return {
    code, title,
    pages: [shell({ code, title, chapter, codes, goal: 'show what I remember from the whole chapter', k: 0, body: block('A', items.slice(0, half), 0) }),
      shell({ code, title, chapter, codes, k: 1, body: block('B', items.slice(half), half) + track })],
    answers: [['Worked answers', worked]],
  };
}, { code, pagesEach: 2 });
module.exports.plain = plain;
