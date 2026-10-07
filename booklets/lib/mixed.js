// Mixed-practice worksheets in the Freefall style (year7-mixed/). One lesson is one double-sided A4 sheet.
//   Page 1: the lesson title and name line, then one full-width WE DO box: the key idea in a sentence and two or three
//           examples, printed blank, for the teacher to work live while students copy. Then three columns.
//   Page 2: three more columns.
// The six columns get harder from left to right and from page 1 to page 2:
//   Easy, Easy, Medium (page 1) · Medium, Challenging, Challenging (page 2).
// Every question stands on its own (it carries its own instruction), as in the Mixed practice of year7-own. Most are on
// today's skill. The rest come from earlier lessons and are marked "from 2.03". The share from earlier lessons grows
// along the sheet (see RAMP): almost none at the start, while the new skill is being learned, then about two in five on
// page 2, so overall about two in three questions are on today's skill and one in three on earlier lessons.
//
// A lesson (in a chapter's content.js):
//   idea   the key idea, one or two short sentences (printed at the top of the WE DO box)
//   ex     the examples the teacher models: [question, working lines, fig?]; the working goes in the answer booklet
//   e, m, c  kinds of question at each level (Easy, Medium, Challenging): (K, i) => { q, a?, w?, fig?, n? }
//          K is a seeded kit (lib/drill.js: ri, nz, pick, shuffle, N, B); i counts the questions made of this kind.
//          q  the question (HTML)     a  the answer (defaults to the last working line)
//          w  the working, one step a line, the answer last: the question gets that many lines (2 to 4)
//          n  the number of lines to give (default: 1 for a question with no working; 0 for a drawing question)
//          key  questions with the same key count as the same question (e.g. one claim with different names)
//          fig a diagram under the question
//          Return null (or nothing) to skip one, for example when the numbers do not suit.
//   look   earlier lessons whose questions look like today's (the best ones to mix in); optional
//   exH    height of the WE DO box in mm (default 56, or 64 when an example has a diagram); exFh caps example diagrams
//
// Columns are filled with more questions than fit. The build lays the page out, then drops questions from the
// bottom of each column until it fits (fit, run in the browser), numbers the questions and writes the answers for the
// questions that are left.
const { blankLine, viewBox } = require('./worksheet').helpers;
const { kit } = require('./drill');

const plain = (t) => String(t ?? '').replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, ' ');
// The share of each column's questions that come from earlier lessons.
const RAMP = [0.12, 0.25, 0.34, 0.42, 0.42, 0.42];
const LEVEL = [['l1', 'Easy'], ['l1', 'Easy'], ['l2', 'Medium'], ['l2', 'Medium'], ['l3', 'Challenging'], ['l3', 'Challenging']];
// How many rows each column may have at most (it then fills to fit): page 1 columns are shorter.
const CAP = [9, 9, 8, 11, 10, 10];

// Typesetting: keep numbers with their units, never split a calculation (−9 + ☐ = −2) across lines, and never leave
// a short last word alone on a line.
const OPD = '(?:\\d+(?=\\())?[(\\[]*[−+]?(?:\\$?\\d[\\d\\u00a0]*(?:[.,]\\d+)?(?:<i>[a-z]</i>(?:<sup>\\d+</sup>)?)*|☐|(?:<i>[a-z]</i>(?:<sup>\\d+</sup>)?)+)[)\\]]*(?:<sup>\\d+</sup>)?(?:°C?|%)?';
const EXPR = new RegExp(`${OPD}(?: (?:[+−×÷=☐]|&lt;|&gt;|≈) ${OPD})+`, 'g');
const keep = (t) => String(t).replace(/(\d) (\d{3})\b/g, '$1\u00a0$2').replace(/(\d) (mm|cm|m|km|g|kg|t|mL|L|s|h|min|°|%|cm²|m²|cm³|m³)(?=[\s.,?)]|$)/g, '$1\u00a0$2')
  .replace(/\b([Aa]) (?=(?:8|11(?!\d)|18(?!\d)|[aeioAEIO][a-z]{2,}))/g, '$1n ') // a 8 m → an 8 m, a octagon → an octagon
  .replace(EXPR, (m) => (m.length < 40 ? `<span class="nw">${m}</span>` : m)).replace(/ ([^\s<>]{1,7}(?:<\/\w+>)?)$/, '&nbsp;$1');

const figBox = (fig, width = 54, cap = 30) => {
  if (!fig) return '';
  if (/^\s*<(table|div)/.test(fig)) return `<div class="mx-fig html">${fig}</div>`;
  const vb = viewBox(fig);
  const h = vb ? Math.min(cap, vb[1] * Math.min(1.15, width / vb[0])) : 20;
  return `<div class="mx-fig" style="height:${h.toFixed(1)}mm">${fig}</div>`;
};

// One question's data, tidied: the answer and the number of lines.
const tidy = (it) => {
  if (!it || !(it.q || it.fig)) return null;
  const w = it.w && it.w.length ? it.w.map(String) : null;
  const a = it.a != null ? String(it.a) : w ? w[w.length - 1] : '';
  const n = it.n ?? (w ? Math.min(4, Math.max(2, w.length)) : 1); // n: 0 for a drawing question (the diagram is the space)
  return { ...it, w, a, n };
};
// Two short questions with one answer line each share a row.
const pairable = (it) => !it.fig && !it.from && it.n === 1 && plain(it.q).length <= 15;

// The blanked working that starts a column: the structure stays, the numbers go. A line with a long list of numbers
// keeps only its label ("24: ________").
const blankOne = (l) => {
  const nums = plain(l).match(/\d+/g) || [];
  if (/^(yes|no)\b/i.test(plain(l))) return 'yes / no: ________';
  if (nums.length <= 3) return blankLine(l);
  const m = /^([^:=]{1,18})([:=])/.exec(plain(l));
  return m ? `${m[1]}${m[2]} ____________` : '';
};
const scaffoldOf = (it) => (it.w && it.w.length >= 2 ? it.w.map((l, i) => (i < it.n ? blankOne(l) : '')) : null);

const cell = (it, k) => {
  const shown = it.scaffold || [];
  const lines = Array.from({ length: it.n }, (_, i) => `<i class="mx-l">${shown[i] ? `<b class="ff-done part">${shown[i]}</b>` : ''}${i === 0 && it.from ? `<span class="mx-from">from ${it.from}</span>` : ''}</i>`).join('');
  const tag = !it.n && it.from ? `<span class="mx-from">from ${it.from}</span>` : '';
  return `<div class="mx-q${it.from ? ' old' : ''}${it.n ? '' : ' draw'}" data-k="${k}"><div class="mx-qrow"><span class="ff-n">?</span><span class="mx-qt">${it.q ? keep(it.q) : ''}</span>${tag}</div>${figBox(it.fig, it.figW || 54, it.fh || 30)}<div class="mx-ls">${lines}</div></div>`;
};

// The earlier lessons a lesson draws on: the last three lessons of this chapter (most alike), older lessons of this
// chapter, and lessons of earlier chapters (or Year 6 skills before Chapter 1).
const sourcesFor = (code, bank, look = []) => {
  const at = bank.findIndex((x) => x.code === code);
  const before = at < 0 ? bank : bank.slice(0, at);
  const ch = code.split('.')[0];
  const same = before.filter((x) => x.code.split('.')[0] === ch);
  const recent = [...look.map((c) => before.find((x) => x.code === c)).filter(Boolean), ...same.slice(-3).reverse()].filter((x, i, a) => a.indexOf(x) === i);
  const older = same.filter((x) => !recent.includes(x));
  // Year 6 skills only while there is no earlier Year 7 chapter to look back on.
  const prev = before.filter((x) => x.code.split('.')[0] !== ch).filter((x, i, all) => !x.L.tag || all.every((y) => y.L.tag));
  return { recent, older, prev };
};
// The order in which the slots for earlier questions take their source.
const PATTERN = ['recent', 'prev', 'recent', 'older', 'recent', 'prev', 'older', 'recent'];

module.exports = ({ code, title }, L, bank = []) => Object.assign((chapter) => {
  const seen = new Set();
  const items = []; // every question placed on the sheet, in order; the fit keeps a prefix of each column
  const K = kit(`mixed ${code}`);
  const counters = new Map(); // calls per kind, so finite lists step through
  const make = (fn, k) => {
    for (let t = 0; t < 60; t++) {
      const i = counters.get(fn) || 0; counters.set(fn, i + 1);
      let it;
      try { it = tidy(fn(k, i)); } catch (e) { throw new Error(`${code}: a question generator failed: ${e.message}`); }
      if (!it) continue;
      const key = it.key ? `key:${it.key}` : `${plain(it.q)}|${it.fig || ''}`;
      if (seen.has(key)) continue;
      seen.add(key);
      return it;
    }
    return null;
  };

  // Earlier lessons, taken in turn.
  const src = sourcesFor(code, bank, L.look);
  // At the start of the series there is little to look back on: the share of earlier questions starts at a third of
  // the usual and reaches it by the third lesson.
  const y7 = [...src.recent, ...src.older, ...src.prev].filter((x) => !x.L.tag).length;
  const share = Math.min(1, (y7 + 1) / 3);
  const turn = { recent: 0, older: 0, prev: 0 };
  const prevOrder = K.shuffle(src.prev.slice(-24)); // spaced: a spread of lessons from earlier chapters
  let slot = 0;
  const used = new Map(); // questions taken from each earlier lesson, so its kinds take turns
  const earlier = (col) => {
    for (let t = 0; t < PATTERN.length * 2; t++) {
      const kind = PATTERN[(slot + t) % PATTERN.length];
      const list = kind === 'prev' ? prevOrder : src[kind];
      if (!list.length) continue;
      slot += t + 1;
      const lesson = list[turn[kind]++ % list.length];
      const lv = col < 2 || !(lesson.L.m || []).length ? 'e' : turn[kind] % 2 ? 'm' : 'e';
      const kinds = lesson.L[lv] && lesson.L[lv].length ? lesson.L[lv] : lesson.L.e;
      if (!kinds || !kinds.length) continue;
      const u = (used.get(lesson.code) || 0) + 1; used.set(lesson.code, u);
      const fn = kinds[u % kinds.length];
      const it = make(fn, kit(`mixed ${code} from ${lesson.code} ${slot}`));
      if (it) return { ...it, from: lesson.L.tag || lesson.code };
    }
    return null;
  };

  // Today's questions for each column: the column's kinds in turn, each column starting at a different kind.
  const kindsFor = (c) => {
    const e = L.e || [], m = L.m || [], ch = L.c || [];
    return [e, [...e.slice(1), ...e.slice(0, 1), ...m.slice(0, 1)], m, [...m.slice(1), ...m.slice(0, 1), ...ch.slice(0, 1)], ch, [...ch.slice(1), ...ch.slice(0, 1), ...m.slice(-1)]][c].filter(Boolean);
  };
  const columns = [0, 1, 2, 3, 4, 5].map((c) => {
    const kinds = kindsFor(c);
    if (!kinds.length) throw new Error(`${code}: no questions for column ${c + 1}`);
    const rows = [];
    let k = 0, old = 0, total = 0, scaffolded = false;
    while (rows.length < CAP[c]) {
      // An earlier question whenever the column's share of them has fallen behind (never first in a column).
      const wantOld = total > 0 && (old + 1) / (total + 1) <= RAMP[c] * share + 0.001 && (c > 0 || total >= 4);
      let it = wantOld ? earlier(c) : null;
      if (it) old++;
      else it = make(kinds[k++ % kinds.length], K);
      if (!it) { if (k > kinds.length * 40) break; continue; }
      total++;
      // Columns 1 and 2: the first question with working shows its structure, numbers blank.
      if (c < 2 && !scaffolded && !it.from && it.w && it.w.length >= 2) { it.scaffold = scaffoldOf(it); scaffolded = true; }
      const last = rows[rows.length - 1];
      if (last && last.length === 1 && pairable(last[0]) && pairable(it)) last.push(it);
      else rows.push([it]);
    }
    return rows;
  });

  const html = columns.map((rows, c) => {
    const body = rows.map((row) => `<div class="mx-row${row.length > 1 ? ' pair' : ''}">${row.map((it) => { items.push(it); return cell(it, items.length - 1); }).join('')}</div>`).join('');
    return `<div class="ff-col mx-col ${LEVEL[c][0]}"><div class="mx-colh"><b class="lvl-word ${LEVEL[c][0]}">${LEVEL[c][1]}</b><span class="mx-range"></span></div><div class="mx-list">${body}</div></div>`;
  });

  const exs = L.ex || [];
  const exBox = `<section class="mx-ex" style="height:${L.exH || (exs.some((x) => x[2]) ? 64 : 56)}mm">
      <div class="mx-ex-side"><span class="zone-pill">WE DO</span><p>Watch your teacher. Copy every step.</p></div>
      <div class="mx-ex-main"><p class="mx-idea"><b>Key idea</b> ${keep(L.idea)}</p>
      <div class="mx-ex-row" style="grid-template-columns:repeat(${exs.length}, minmax(0, 1fr))">${exs.map(([q, , fig], i) => `<div class="mx-ex-cell"><div class="mx-qrow"><span class="ff-n">E${i + 1}</span><span class="mx-qt">${keep(q)}</span></div>${figBox(fig, 160 / exs.length - 6, L.exFh || 26)}<div class="mx-ex-space"></div></div>`).join('')}</div></div>
    </section>`;

  const page = (p) => `
<section class="page mb ws-page mx p${p + 1}" data-lesson="${code}">
  <div class="ws-strip"></div>
  <div class="content">
    <div class="ws-title"><h2><span>${code}</span>${title}${p ? '<em> (continued)</em>' : ''}</h2><p>Year ${chapter.year} · Chapter ${chapter.number}: ${chapter.title} · page ${p + 1} of 2</p></div>
    ${p ? '' : `<div class="cw-name"><span>Name</span><i></i><span>Class</span><i class="short"></i><span>Date</span><i class="short"></i></div>${exBox}`}
    <div class="ff-frame mx-frame">${html.slice(3 * p, 3 * p + 3).join('')}</div>
  </div>
  <footer class="page-foot"><span>Kingscliff High School · Year ${chapter.year} Mathematics</span><span class="pn">{{PN}}</span><span>Chapter ${chapter.number} · ${chapter.title}</span></footer>
</section>`;

  const lesson = { code, title, pages: [page(0), page(1)], answers: [] };
  // After the fit: the answers of the questions left on the sheet, in order.
  lesson.setKept = (kept) => {
    const exAns = exs.map(([q, w], i) => `<b>E${i + 1}</b> ${q}<br><span class="aw">${[].concat(w).join(' &ensp;·&ensp; ')}</span>`);
    // Each answer on its own: the working where there is some (one step after another), else the answer.
    const qAns = kept.map((k, i) => { const it = items[k]; return `<b>${i + 1}</b> <span class="aw">${it.w && it.w.length > 1 ? it.w.join(' · ') : it.a}</span>${it.from ? ` <em class="ans-from">${it.from}</em>` : ''}`; });
    exAns.plain = true; qAns.plain = true; exAns.cls = 'ans-ex'; qAns.cls = 'ans-mx';
    lesson.answers = [['Examples (model these live)', exAns], [`Questions (${kept.filter((k) => !items[k].from).length} on today's skill, ${kept.filter((k) => items[k].from).length} from earlier lessons)`, qAns]];
    lesson.mix = [kept.filter((k) => !items[k].from).length, kept.filter((k) => items[k].from).length];
  };
  return lesson;
}, { code, pagesEach: 2 });

// Runs in the browser on the whole booklet: drop rows from the bottom of each column until the column fits, then
// number every lesson's questions in order and fill in each column's question range. Returns the questions kept
// (their data-k) for each lesson.
module.exports.fit = () => {
  document.querySelectorAll('.mx-list').forEach((list) => {
    let rows = list.querySelectorAll('.mx-row');
    while (rows.length > 2 && list.scrollHeight > list.clientHeight + 1) { rows[rows.length - 1].remove(); rows = list.querySelectorAll('.mx-row'); }
  });
  const kept = {};
  const counts = {};
  document.querySelectorAll('section.mx').forEach((page) => {
    const code = page.dataset.lesson;
    kept[code] = kept[code] || [];
    page.querySelectorAll('.mx-col').forEach((col) => {
      const first = kept[code].length + 1;
      col.querySelectorAll('.mx-q').forEach((q) => { kept[code].push(+q.dataset.k); q.querySelector('.ff-n').textContent = kept[code].length; });
      col.querySelector('.mx-range').textContent = `Questions ${first}–${kept[code].length}`;
    });
  });
  return kept;
};
module.exports.plain = plain;
module.exports.sourcesFor = sourcesFor;
