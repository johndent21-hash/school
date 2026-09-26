// Blended lesson template: the one-hour WE DO / YOU DO lesson, plus the quick drill of the revision booklets.
// Each lesson is 4 or 6 pages (spec.pages), chosen by how much room its diagrams and working need.
//
//  4 pages: 1 start here, Level 1 (Easy) WE DO + quick drill · 2 Easy set B, Level 2 (Medium) WE DO + set C
//           3 Level 3 (Challenging) WE DO + set D, exit ticket · 4 extension, summary, back of the ticket
//  6 pages: 1 start here, Level 1 WE DO · 2 quick drill + Easy set B · 3 Level 2 WE DO + set C
//           4 Level 3 WE DO + set D · 5 extension + exit ticket · 6 summary + back of the ticket
//
// The spec is the same as lib/lesson.js (use the .spec kept on each lesson) plus:
//   pages: 4 | 6
//   ex: [ { stem, parts: [..] } x3 ]    WE DO examples, one per level, each with parts a, b, c. Default: the 6 examples
//                                       of the old spec in pairs (Examples 1–2 → Example 1 a, b; and so on).
//   drill: { text, items: [..], ans: [..], cols?, hw?: [question, answer, instruction?] }   quick drill added to the Easy level;
//                                       hw is an extra drill question used in the homework booklet
//   exCols: ['Balancing the sides', 'Inverse operations']   split each teacher working space into labelled columns
//   exFigs: [fig, fig, fig]            a diagram shown inside each default example
//   stems: ['..', '..', '..']           clear instructions for the three default examples (when ex is not given)
//   hwFig: fig                         a diagram homework questions from this lesson may use (e.g. a map)
// A part is text, { t, fig } or { t, draw }. Parts are never worked: the teacher works them live and students copy.
const { banner, weDo, youDo, q, qDraw, worked, graphCard, split, makeLesson } = require('./layout');

const txt = (it) => (typeof it === 'string' ? it : it.t);
const withFig = (it) => (typeof it === 'string' || !it.fig ? txt(it) : `${it.t}<div class="inline-fig">${it.fig}</div>`);
const L = 'abcdefgh';
const qn = (n) => `${n} question${n === 1 ? '' : 's'}`;
const LEVEL_WORD = ['', 'Easy', 'Medium', 'Challenging'];

// One WE DO example: a clear question, then parts a, b, c each with a blank space for the teacher's working.
const teacherBox = (cols) => (cols ? `<div class="box teacher split-cols">${cols.map((c) => `<div><b>${c}</b></div>`).join('')}<span>Your teacher works this out. Copy every step.</span></div>`
  : '<div class="box teacher"><span>Your teacher works this out. Copy every step.</span></div>');
const exBlock = (n, ex, cls = '', cols) => weDo(`
  <div class="ex-head"><span class="q-num ex">Example ${n}</span><span class="ex-stem">${ex.stem}</span></div>
  ${ex.fig ? `<div class="ex-body"><div class="ex-fig">${ex.fig}</div>` : ''}
  <div class="ex-parts n${ex.parts.length}">${ex.parts.map((p, i) => `
    <div class="ex-part">
      <div class="q-head"><span class="part-l">${L[i]}</span><span class="q-text">${withFig(p)}</span></div>
      ${typeof p === 'object' && p.draw ? `<div class="draw-area">${p.draw}</div>` : teacherBox(cols)}
    </div>`).join('')}
  </div>${ex.fig ? '</div>' : ''}`, `ex-zone ${cls}`);

// Quick drill: short questions with an answer line, several to a row.
// subs: [[index, instruction]] starts a new instruction line before question index (0-based).
const drillBody = (items, cols, start = 1, subs = []) => `<div class="drill c${cols}">${items.map((it, i) =>
  `${subs.filter(([k]) => k === i).map(([, t]) => `<p class="drill-sub">Questions ${i + start}–${items.length + start - 1}: ${t}</p>`).join('')}<div class="dq"><span class="q-num">${i + start}</span><span class="q-text">${withFig(it)}</span><span class="ans-line"></span></div>`).join('')}</div>`;

const sideQ = (n, it) => `<div class="q side"><div class="q-head"><span class="q-num">${n}</span><span class="q-text">${it.t}</span></div><div class="side-row"><div class="side-fig">${it.fig}</div><div class="box"></div></div></div>`;

const setBody = (set, start = 1) => {
  const items = set.items;
  const figTop = set.fig ? graphCard(set.fig, `set-fig${set.figWide ? ' wide' : ''}`) : '';
  const given = set.given ? `<p class="given">${set.given}</p>` : '';
  if (set.figSide) return `${given}<div class="fig-side">${figTop}<div class="short-list">${items.map((it, i) =>
    `<div class="qs wide-box"><span class="q-num">${i + start}</span><span class="q-text">${withFig(it)}</span><span class="box"></span></div>`).join('')}</div></div>`;
  if (set.kind === 'short') {
    const rows = Math.ceil(items.length / 2);
    return `${given}${figTop}<div class="short-grid" style="grid-template-rows: repeat(${rows}, minmax(min-content, 1fr))">${items.map((it, i) =>
      `<div class="qs wide-box"><span class="q-num">${i + start}</span><span class="q-text">${withFig(it)}</span><span class="box"></span></div>`).join('')}</div>`;
  }
  const cols = set.cols || (items.length === 1 ? 1 : 2);
  const rows = Math.ceil(items.length / cols);
  const cells = items.map((it, i) => (typeof it === 'object' && it.draw ? qDraw(i + start, withFig(it), it.draw)
    : typeof it === 'object' && it.fig && !set.stack ? sideQ(i + start, it) : q(i + start, withFig(it))));
  return `${given}${figTop}<div class="work-grid" style="grid-template-columns: repeat(${cols}, 1fr); grid-template-rows: repeat(${rows}, minmax(min-content, 1fr))">${cells.join('')}</div>`;
};

const hint = (h) => (h ? `<div class="hint"><b>Remember</b><span>${h}</span></div>` : '');
// A YOU DO set: "Easy · Set A. instruction", a count on the right, a hint, then the questions.
const setZone = (lvl, name, set, h, cls = 'grow', start = 1) => {
  const shortToWork = cls.includes('grow') && set.kind === 'short' && !set.fig && !set.keepShort && !set.figSide;
  const body = set.kind === 'drill' ? drillBody(set.items, set.cols || 3, start, set.subs || []) : setBody(shortToWork ? { ...set, kind: 'work' } : set, start);
  return youDo(`<b class="lvl-word l${lvl}">${LEVEL_WORD[lvl]}</b> Set ${name}. ${set.subs && set.subs.length ? `Questions 1–${set.subs[0][0]}: ` : ''}${set.text.replace(/^Quick drill:\s*/, 'Quick drill: ')}<span class="count">${qn(set.items.length)}</span>`, `${hint(h)}${body}`, cls);
};

// exFigs: a diagram shown inside each example (e.g. the graph the questions are about); "Set A graph:" style
// references are then removed from the part text, since the graph is right there.
const unref = (it) => (typeof it === 'string' ? it.replace(/^Use the map in Set A\.\s*/, '').replace(/^Set [A-D] [a-z -]*?:\s*/i, '').replace(/the Set [A-D] (plot|graph)/, 'the $1').replace(/^./, (c) => c.toUpperCase()) : it);
const pairExamples = (we, stems = [], figs = []) => [0, 1, 2].map((k) => ({ stem: stems[k] || 'Work through each part with your teacher.', fig: figs[k],
  parts: [we[2 * k], we[2 * k + 1]].map((p) => (figs[k] ? unref(p) : p)) }));

module.exports = (spec) => (chapter) => {
  const Lx = makeLesson({ chapter, code: spec.code, title: spec.title });
  const six = (spec.pages || chapter.pages || 4) === 6;
  const ex = spec.ex || pairExamples(spec.we, spec.stems, spec.exFigs);
  const s = spec.summary;
  const h = (k) => (spec.hints ? spec.hints[k] : s.steps[k]);
  // Quick drill: the old Set A items plus any extra drill items, as short-answer drill.
  const drillItems = [...spec.a.items, ...(spec.drill ? spec.drill.items : [])];
  const aIsDrill = spec.a.kind === 'short' && !spec.a.fig && !spec.a.figSide && drillItems.every((it) => typeof it === 'string' || !it.draw);
  // The drill keeps Set A's instruction for its questions and shows the extra drill's own instruction where it starts.
  const A = aIsDrill ? { text: spec.a.text, kind: 'drill', items: drillItems, cols: spec.drill?.cols || spec.a.drillCols || 3,
    subs: spec.drill ? [[spec.a.items.length, spec.drill.text.replace(/^Quick drill:\s*/, '')]] : [] } : spec.a;
  // A lesson whose Set A has diagrams keeps it, and (6-page lessons only) gets its quick drill as a separate set.
  const Q = !aIsDrill && spec.drill && six ? { text: spec.drill.text, kind: 'drill', items: spec.drill.items, cols: spec.drill.cols || 3 } : null;
  const count = (set) => set.items.length;
  const easyN = count(A) + count(spec.b) + (Q ? count(Q) : 0);

  const ext = `<div class="split ext grow">
        ${worked(4, 'Worked example', spec.ext.q, spec.ext.steps, `<b>Answer:</b> ${spec.ext.a}`, spec.ext.fig ? `<div class="diagram">${spec.ext.fig}</div>` : '')}
        ${youDo('read the worked example, then try these.', `<div class="stack">${spec.ext.qs.map((it, i) => (typeof it === 'object' && it.draw ? qDraw(`E${i + 1}`, withFig(it), it.draw) : q(`E${i + 1}`, withFig(it)))).join('')}</div>`, 'fill')}
      </div>`;
  const summary = (cls = '') => `${Lx.summaryBanner}
      <div class="summary-grid${cls}">
        <div class="steps-card"><b>${s.title || 'Remember'}</b><ol>${s.steps.map((x) => `<li>${x}</li>`).join('')}</ol></div>
        ${s.worked.map(([wq, st, wa, fig], i) => worked(i + 1, i === 3 ? 'Extension' : `Level ${i + 1}`, wq, st, `<b>Answer:</b> ${wa}`, fig ? `<div class="diagram">${fig}</div>` : '')).join('')}
      </div>`;
  const exit = Lx.exitTicket({ graph: spec.exit.fig || '', questions: spec.exit.qs });

  const pages = six ? [
    Lx.page('Start here · Easy', `
      ${Lx.intro({ li: spec.li, sc: spec.sc, terms: spec.terms })}
      ${Lx.notes('fixed')}
      ${banner(1, `Easy · ${qn(easyN)}`)}
      ${exBlock(1, ex[0], 'grow', spec.exCols)}
    `, { first: true }),
    Lx.page('Easy', `
      ${setZone(1, 'A', A, h(0), '')}
      ${Q ? setZone(1, 'A2', Q, '', '') : ''}
      ${setZone(1, 'B', spec.b, '', 'grow')}
    `),
    Lx.page('Medium', `
      ${banner(2, `Medium · ${qn(count(spec.c))}`)}
      ${exBlock(2, ex[1], 'tall', spec.exCols)}
      ${setZone(2, 'C', spec.c, h(1))}
    `),
    Lx.page('Challenging', `
      ${banner(3, `Challenging · ${qn(count(spec.d))}`)}
      ${exBlock(3, ex[2], 'tall', spec.exCols)}
      ${setZone(3, 'D', spec.d, h(2))}
    `),
    Lx.page('Extension · Exit ticket', `
      ${banner(4, 'Finished Set D? Stretch yourself here.')}
      ${ext}
      ${exit}
    `),
    Lx.page('Summary · Reflection', `
      ${summary()}
      <div class="notes grow reflect"><span class="notes-label">My reflection: what did I learn today? Which question was hardest, and why?</span></div>
      ${Lx.tearBack()}
    `),
  ] : [
    Lx.page('Start here · Easy', `
      ${Lx.intro({ li: spec.li, sc: spec.sc, terms: spec.terms })}
      ${Lx.notes('fixed')}
      ${banner(1, `Easy · ${qn(easyN)}`)}
      ${exBlock(1, ex[0], '', spec.exCols)}
      ${setZone(1, 'A', A, h(0), aIsDrill && !spec.a.grow ? 'grow drill-zone' : 'grow')}
    `, { first: true }),
    Lx.page('Easy · Medium', `
      ${setZone(1, 'B', spec.b, '', spec.b.grow ? 'grow' : '')}
      ${banner(2, `Medium · ${qn(count(spec.c))}`)}
      ${exBlock(2, ex[1], '', spec.exCols)}
      ${setZone(2, 'C', spec.c, h(1))}
    `),
    Lx.page('Challenging · Exit ticket', `
      ${banner(3, `Challenging · ${qn(count(spec.d))} · then try the extension`)}
      ${exBlock(3, ex[2], '', spec.exCols)}
      ${setZone(3, 'D', spec.d, h(2))}
      ${exit}
    `),
    Lx.page('Extension · Summary', `
      ${banner(4)}
      ${ext}
      ${summary()}
      ${Lx.tearBack()}
    `),
  ];

  const A2 = spec.ans;
  const exAns = spec.ex ? spec.exAns : null; // [[a, b], [a, b], [a, b]] when spec.ex is given
  const weAns = exAns ? exAns.flatMap((parts, k) => parts.map((a, i) => `Ex ${k + 1}${L[i]}: ${a}`)) : A2.we.map((a, i) => `Ex ${Math.floor(i / 2) + 1}${L[i % 2]}: ${a}`);
  const aAns = [...A2.a, ...(spec.drill && aIsDrill ? spec.drill.ans : [])];
  const answers = [
    ['WE DO examples (teacher)', weAns],
    [`Easy · Set A${aIsDrill ? ' (quick drill)' : ''}`, aAns], ...(Q ? [['Easy · Set A2 (quick drill)', spec.drill.ans]] : []), ['Easy · Set B', A2.b], ['Medium · Set C', A2.c], ['Challenging · Set D', A2.d],
    ['Extension', A2.ext], ['Exit ticket', A2.exit.map((a, i) => `Level ${i + 1}: ${a}`)],
  ];
  if (spec.drill && spec.drill.items.length !== spec.drill.ans.length) throw new Error(`${spec.code}: drill has ${spec.drill.items.length} questions but ${spec.drill.ans.length} answers`);
  if (spec.ex && (!exAns || exAns.length !== 3 || exAns.some((a, k) => a.length !== spec.ex[k].parts.length))) throw new Error(`${spec.code}: example answers missing`);
  [['a', spec.a], ['b', spec.b], ['c', spec.c], ['d', spec.d]].forEach(([k, set]) => {
    if (!A2[k] || A2[k].length !== set.items.length) throw new Error(`${spec.code}: Set ${k.toUpperCase()} has ${set.items.length} questions but ${A2[k] ? A2[k].length : 0} answers`);
  });
  return { code: spec.code, title: spec.title, pages, answers, spec };
};
