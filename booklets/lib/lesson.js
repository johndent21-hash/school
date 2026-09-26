// Builds a 4-page, one-hour lesson from plain data, so every lesson in every chapter has the same shape.
//
//  Page 1: title, learning intentions, success criteria, key terms, notes, Level 1 WE DO, Set A
//  Page 2: Set B, Level 2 WE DO, Set C
//  Page 3: Level 3 WE DO, Set D, tear-off exit ticket
//  Page 4: extension, lesson summary, blank back of the exit ticket
//
// Spec (see any chapter file for real examples):
//  { code, title, li: [..], sc: [..], terms: [..],
//    we: [6 examples],                      // Examples 1–2 (Level 1), 3–4 (Level 2), 5–6 (Level 3)
//    a, b, c, d: set,                       // A and B = Level 1, C = Level 2, D = Level 3
//    ext: { q, steps: [..], a, fig?, qs: [2 questions] },
//    summary: { title, steps: [4 reminders], worked: [[question, [steps], answer, fig?] x4] },
//    exit: { fig?, qs: [L1, L2, L3] },
//    ans: { we: [..], a: [..], b: [..], c: [..], d: [..], ext: [..], exit: [..] } }
//  set:  { text: 'instruction', items: [..], kind: 'short' | 'work', cols?, fig?, given? }
//  item / example: 'text'  or  { t: 'text', fig: svg shown with the question, draw: html drawing area instead of a box }
const { banner, weDo, youDo, q, qDraw, dots, example, worked, graphCard, split, makeLesson } = require('./layout');

const txt = (it) => (typeof it === 'string' ? it : it.t);
const withFig = (it) => (typeof it === 'string' || !it.fig ? txt(it) : `${it.t}<div class="inline-fig">${it.fig}</div>`);

const ex = (n, it) => (typeof it === 'object' && it.draw ? example(`Example ${n}`, withFig(it), it.draw) : example(`Example ${n}`, withFig(it)));

const setBody = (set, start = 1) => {
  const items = set.items;
  const figTop = set.fig ? graphCard(set.fig, `set-fig${set.figWide ? ' wide' : ''}`) : '';
  const given = set.given ? `<p class="given">${set.given}</p>` : '';
  if (set.kind === 'short') {
    const rows = Math.ceil(items.length / 2);
    return `${given}${figTop}<div class="short-grid" style="grid-template-rows: repeat(${rows}, minmax(min-content, 1fr))">${items.map((it, i) =>
      `<div class="qs${set.wide !== false ? ' wide-box' : ''}"><span class="q-num">${i + start}</span><span class="q-text">${withFig(it)}</span><span class="box"></span></div>`).join('')}</div>`;
  }
  const cols = set.cols || 2;
  const rows = Math.ceil(items.length / cols);
  const cells = items.map((it, i) => (typeof it === 'object' && it.draw ? qDraw(i + start, withFig(it), it.draw) : q(i + start, withFig(it))));
  return `${given}${figTop}<div class="work-grid" style="grid-template-columns: repeat(${cols}, 1fr); grid-template-rows: repeat(${rows}, minmax(min-content, 1fr))">${cells.join('')}</div>`;
};

// Short-answer sets only suit a panel that keeps its natural height; in a panel that fills the page,
// questions get working boxes instead so there are no big gaps.
const setZone = (name, set, cls = 'grow') => youDo(`Set ${name}. ${set.text}`, setBody(cls === 'grow' && set.kind === 'short' && !set.fig && !set.keepShort ? { ...set, kind: 'work' } : set), cls);

module.exports = (spec) => (chapter) => {
  const L = makeLesson({ chapter, code: spec.code, title: spec.title });
  const [e1, e2, e3, e4, e5, e6] = spec.we;
  const exRow = (a, b, n) => weDo(split(ex(n, a), ex(n + 1, b), spec.tallExamples ? 'ex-row tall' : 'ex-row'));
  const s = spec.summary;

  const pages = [
    L.page('Start here · Level 1', `
      ${L.intro({ li: spec.li, sc: spec.sc, terms: spec.terms })}
      ${L.notes('fixed')}
      ${banner(1)}
      ${exRow(e1, e2, 1)}
      ${setZone('A', spec.a)}
    `, { first: true }),

    L.page('Level 1 · Level 2', `
      ${setZone('B', spec.b, spec.b.grow ? 'grow' : '')}
      ${banner(2)}
      ${exRow(e3, e4, 3)}
      ${setZone('C', spec.c)}
    `),

    L.page('Level 3 · Exit ticket', `
      ${banner(3, 'Finished Set D? Try the extension on the next page.')}
      ${exRow(e5, e6, 5)}
      ${setZone('D', spec.d)}
      ${L.exitTicket({ graph: spec.exit.fig || '', questions: spec.exit.qs })}
    `),

    L.page('Extension · Summary', `
      ${banner(4)}
      <div class="split ext grow">
        ${worked(4, 'Worked example', spec.ext.q, spec.ext.steps, `<b>Answer:</b> ${spec.ext.a}`, spec.ext.fig ? `<div class="diagram">${spec.ext.fig}</div>` : '')}
        ${youDo('read the worked example, then try these.', `<div class="stack">${spec.ext.qs.map((it, i) => (typeof it === 'object' && it.draw ? qDraw(`E${i + 1}`, withFig(it), it.draw) : q(`E${i + 1}`, withFig(it)))).join('')}</div>`, 'fill')}
      </div>
      ${L.summaryBanner}
      <div class="summary-grid">
        <div class="steps-card"><b>${s.title || 'Remember'}</b><ol>${s.steps.map((x) => `<li>${x}</li>`).join('')}</ol></div>
        ${s.worked.map(([wq, st, wa, fig], i) => worked(i + 1, i === 3 ? 'Extension' : `Level ${i + 1}`, wq, st, `<b>Answer:</b> ${wa}`, fig ? `<div class="diagram">${fig}</div>` : '')).join('')}
      </div>
      ${L.tearBack()}
    `),
  ];

  const A = spec.ans;
  const answers = [
    ['WE DO examples', A.we.map((a, i) => `Ex ${i + 1}: ${a}`)],
    ['Set A', A.a], ['Set B', A.b], ['Set C', A.c], ['Set D', A.d],
    ['Extension', A.ext], ['Exit ticket', A.exit.map((a, i) => `Level ${i + 1}: ${a}`)],
  ];
  // Every question needs an answer: catch missing ones at build time.
  [['a', spec.a], ['b', spec.b], ['c', spec.c], ['d', spec.d]].forEach(([k, set]) => {
    if (!A[k] || A[k].length !== set.items.length) throw new Error(`${spec.code}: Set ${k.toUpperCase()} has ${set.items.length} questions but ${A[k] ? A[k].length : 0} answers`);
  });
  if (A.we.length !== 6 || A.ext.length !== spec.ext.qs.length || A.exit.length !== 3) throw new Error(`${spec.code}: examples, extension or exit answers missing`);
  return { code: spec.code, title: spec.title, pages, answers };
};
