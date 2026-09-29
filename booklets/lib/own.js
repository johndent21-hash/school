// Year 7 booklets designed from the research (see year7-own/DESIGN.md). One lesson is one double-sided A4 sheet.
//   Page 1, learn it:    Do now (retrieval) · Think first (optional) · Words + Big idea · Learn it (three faded
//                        example–problem pairs, each with a Why? prompt) · Check (hinge question)
//   Page 2, practise it: Spot the pattern (minimal variation) · Mixed practice (interleaved) · Go further · Exit ticket
// A lesson file gives the data; this file only lays it out. Worked lines use the same scaffold helpers as the
// worksheets: a "Your turn" fades from the structure given (numbers blank), to the first line given, to blank.
const D = require('./diagrams');
const { blankLine, viewBox } = require('./worksheet').helpers;

const esc = (t) => String(t);
const figBox = (fig, maxH = 22, w = 80) => {
  if (!fig) return '';
  const vb = viewBox(fig);
  const h = vb ? Math.min(maxH, vb[1] * Math.min(1.25, w / vb[0])) : maxH;
  return `<div class="ow-fig" style="height:${h.toFixed(1)}mm">${fig}</div>`;
};
const lines = (ls, shown) => ls.map((l, i) => `<i class="ow-l">${shown[i] ? `<b>${shown[i]}</b>` : ''}</i>`).join('');
// A "Your turn" fades by pair: 0 → structure given (numbers blank), 1 → first line's structure only, 2 → blank.
const fade = (ls, k) => ls.map((l, i) => (k === 0 ? blankLine(l) : k === 1 && i === 0 ? blankLine(l) : ''));
const tag = (t) => (t ? `<span class="ow-from">${t}</span>` : '');

module.exports = ({ code, title }, L) => Object.assign((chapter) => {
  const notes = [], worked = [];
  notes.plain = true; worked.plain = true;
  const w = (label, q, ls) => worked.push(`<b>${label}</b> ${q}<br><span class="aw">${[].concat(ls).join(' &ensp;·&ensp; ')}</span>`);

  // ---------- page 1: learn it ----------
  const doNow = `<section class="ow-block ow-dn"><h3><span class="ow-k">Do now</span><em>From memory. No notes.</em></h3>
    <div class="ow-dn-grid">${L.doNow.map((d, i) => { w(`Do now ${i + 1}`, d.q, d.a); return `<div class="ow-dn-cell">${tag(d.from)}<p><b>${i + 1}</b> ${d.q}</p><i class="ow-box"></i></div>`; }).join('')}</div></section>`;

  const think = L.think ? (w('Think first', L.think.q, L.think.a), `<section class="ow-block ow-think"><h3><span class="ow-k">Think first</span><em>Have a go before we learn it. It's fine to be unsure.</em></h3><div class="ow-think-row"><p>${L.think.q}</p><i class="ow-box wide"></i></div></section>`) : '';

  const big = `<section class="ow-block ow-big">
    <div class="ow-words"><h4>Words</h4>${L.words.map(([t, d]) => `<p><b>${t}</b> ${d}</p>`).join('')}</div>
    <div class="ow-idea"><h4>Big idea</h4>${L.big.text}</div><div class="ow-bigfigs">${(L.big.figs || []).map((f) => figBox(f, 13, 62)).join('')}</div></section>`;

  const pairs = L.pairs.map((p, k) => {
    w(`Example ${k + 1}`, p.ex.q, p.ex.lines);
    w(`Your turn ${k + 1}`, p.you.q, p.you.lines);
    if (p.why) notes.push(`<b>Why? (pair ${k + 1})</b> ${p.why.q}<br><span class="aw">${p.why.a}</span>`);
    const exCell = `<div class="ow-ex"><span class="ow-lab">Example ${k + 1}</span><p class="ow-q">${p.ex.q}</p>${figBox(p.ex.figDone || p.ex.fig, 14, 72)}<div class="ow-ls">${lines(p.ex.lines, p.ex.lines)}</div>${p.why ? `<p class="ow-why"><b>Why?</b> ${p.why.q}</p><i class="ow-l why"></i>` : ''}</div>`;
    const youCell = `<div class="ow-you"><span class="ow-lab">Your turn ${k + 1}</span><p class="ow-q">${p.you.q}</p>${figBox(p.you.fig, 14, 72)}<div class="ow-ls">${lines(p.you.lines, fade(p.you.lines, k))}</div></div>`;
    return `<div class="ow-pair">${exCell}${youCell}</div>`;
  }).join('');
  const learn = `<section class="ow-block ow-learn"><h3><span class="ow-k">Learn it</span><em>Read each example. Then do the one beside it. Stuck? Look back at the example.</em></h3>${pairs}</section>`;

  const opts = ['A', 'B', 'C', 'D'];
  const H = L.hinge;
  notes.unshift(`<b>Key misconception.</b> ${L.teacher.misconception}`);
  notes.push(`<b>Check (hinge).</b> ${H.q} Answer: <b>${H.answer}</b>.<br>${opts.map((o, i) => `${o} (${H.options[i]}): ${H.why[o]}`).join('<br>')}`);
  notes.push(`<b>Next.</b> ${L.teacher.next}`);
  if (L.think) notes.push(`<b>Think first.</b> ${L.teacher.think}`);
  const check = `<section class="ow-block ow-check"><h3><span class="ow-k">Check</span><em>Everyone answers. Circle one letter, then hold it up.</em></h3><div class="ow-check-row"><p>${H.q}</p>${H.options.map((o, i) => `<span class="ow-opt"><b>${opts[i]}</b>${o}</span>`).join('')}</div></section>`;

  // ---------- page 2: practise it ----------
  const P = L.pattern;
  P.items.forEach((it, i) => w(`Pattern ${i + 1}`, it.q, it.a));
  w('Notice', P.notice, P.noticeA);
  const pattern = `<section class="ow-block ow-pattern"><h3><span class="ow-k">Spot the pattern</span><em>${P.text}</em></h3>
    <div class="ow-pat-grid">${P.items.map((it, i) => `<p><b>${i + 1}</b> ${it.q} = <i class="ow-blank"></i></p>`).join('')}</div>
    <p class="ow-why"><b>What do you notice?</b> ${P.notice}</p><i class="ow-l why"></i><i class="ow-l why"></i></section>`;

  const mixed = `<section class="ow-block ow-mixed"><h3><span class="ow-k">Mixed practice</span><em>Today's skill mixed with earlier ones. Read each question carefully: they are not all the same kind.</em></h3>
    <div class="ow-mix-grid">${L.mixed.map((m, i) => { w(`Mixed ${i + 1}`, m.q, m.a); return `<div class="ow-mix-cell">${tag(m.from)}<p><b>${i + 1}</b> ${m.q}</p><i class="ow-l"></i></div>`; }).join('')}</div></section>`;

  const further = `<section class="ow-block ow-further"><h3><span class="ow-k">Go further</span><em>Finished? Try these. Explain your thinking.</em></h3>
    ${L.further.map((f, i) => { w(`Go further ${i + 1}`, f.q, f.a); return `<div class="ow-fur"><p><b>${i + 1}</b> ${f.q}</p>${'<i class="ow-l"></i>'.repeat(f.n || 2)}</div>`; }).join('')}</section>`;

  const exit = `<section class="ow-block ow-exit"><h3><span class="ow-k">Exit ticket</span><em>On your own. Hand it in.</em></h3>
    <div class="ow-exit-grid">${L.exit.map((e, i) => { w(`Exit ${i + 1}`, e.q, e.a); return `<div class="ow-exit-cell"><p><b>${i + 1}</b> ${e.q}</p><i class="ow-box"></i></div>`; }).join('')}</div>
    <p class="ow-rate">Today I can ${L.canDo}. <span>Not yet</span><span>Nearly</span><span>Got it</span></p></section>`;

  const head = (k) => `<div class="ow-head"><h2><span>${code}</span>${title}${k ? '<em> (page 2)</em>' : ''}</h2><p>Year ${chapter.year} · Chapter ${chapter.number}: ${chapter.title}</p></div>
    ${k ? '' : '<div class="cw-name"><span>Name</span><i></i><span>Class</span><i class="short"></i><span>Date</span><i class="short"></i></div>'}`;
  const page = (k, body) => `
<section class="page mb ws-page own">
  <div class="ws-strip"></div>
  <div class="content">${head(k)}${body}</div>
  <footer class="page-foot"><span>Kingscliff High School · Year ${chapter.year} Mathematics</span><span class="pn">{{PN}}</span><span>Chapter ${chapter.number} · ${chapter.title}</span></footer>
</section>`;
  return {
    code, title,
    pages: [page(0, doNow + think + big + learn + check), page(1, pattern + mixed + further + exit)],
    answers: [['Teacher notes', notes], ['Worked answers', worked]],
  };
}, { code, pagesEach: 2 });
