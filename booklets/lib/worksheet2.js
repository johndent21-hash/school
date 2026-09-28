// Two-page worksheet: one double-sided sheet per lesson, in the style of the Freefall Mathematics worksheets.
// Six columns (three a page) take students through the lesson one step at a time, getting harder from left to right
// (steps 1–2 Easy, 3–4 Medium, 5–6 Challenging). Each step (column) has:
//   a heading      what this step is about
//   a HOW TO box   the explanation in full, with a picture (a number line with jumps, counters, a thermometer)
//   rounds         a speech bubble saying exactly what to do, WE DO examples laid out just like the questions (the
//                  teacher works them live), then YOU DO questions. Question numbers run on across the lesson.
// Gradual release in the YOU DO questions of a 'work' round: Easy and Medium steps show the first question fully worked,
// the next with only the answers blank, the next with every number blank, then blank lines; Challenging steps start
// at "answers blank". In a 'quick' round (one answer each) of an Easy step, the first question is answered.
//
// steps: [{ title, how: { text, fig, fh }, rounds }], how.text is HTML (use <p> for each point).
// A round is { text, gen, mode?, kinds?, we?, max?, min?, one?, fig?, fh? }:
//   mode    'quick' (an answer line beside each question) or 'work' (lines for the working; the default)
//   gen(i, t) => { q, a, lines?, fig?, figDone?, fh? }: lines is the working (one step a line, the answer last).
//           fig is a picture under the question; figDone is the same picture completed (the jumps drawn), shown when
//           the question is shown worked. null ends a finite list; { q: '' } skips.
//   kinds   the number of kinds of question gen takes turns at (one WE DO example of each); we: WE DO count
//   max     the most YOU DO questions (the rest of the room becomes writing space); min: working lines a question
// See year7-worksheets/ch01-integers/content2.js.
const D = require('./diagrams');
const W1 = require('./worksheet'); // for the shared helpers
const { bubble, scaffold, pool, plainText, viewBox } = W1.helpers;

const num = (label) => `<span class="ff-n">${label}</span>`;
const figH = (fig, fh, width) => { if (!fig) return 0; const vb = viewBox(fig); return vb ? Math.min(fh || 40, vb[1] * Math.min(1.15, width / vb[0])) : fh || 20; };
// A table sizes itself (fh is its estimated height); a diagram is printed near its drawn size.
const figHtml = (fig, fh, width) => (!fig ? '' : /^<table/.test(fig) ? `<div class="ff-fig ff-tbl">${fig}</div>` : `<div class="ff-fig" style="height:${figH(fig, fh, width).toFixed(1)}mm">${fig}</div>`);
const LEVELS = { easy: ['full', 'answer', 'numbers'], medium: ['full', 'answer', 'numbers'], hard: ['answer', 'numbers'] };

const quick = (label, it, shown) => {
  const fig = shown && it.figDone ? it.figDone : it.fig;
  return it.fig
    ? `<div class="ff-frow">${num(label)}${it.q ? `<span class="ff-q">${it.q}</span>` : ''}${figHtml(fig, it.fh, 38)}<span class="ff-a">${shown ? `<b class="ff-done">${it.a}</b>` : ''}</span></div>`
    : `<div class="ff-row">${num(label)}<span class="ff-q">${it.q}</span><span class="ff-a">${shown ? `<b class="ff-done">${it.a}</b>` : ''}</span></div>`;
};
const work = (label, it, level, minLines) => {
  const ls = it.lines || [it.a], shown = scaffold(ls, level);
  while (shown.length < minLines) shown.push('');
  const fig = level === 'full' && it.figDone ? it.figDone : it.fig;
  return `<div class="ff-cell">${num(label)}<span class="ff-q">${it.q}</span>${figHtml(fig, it.fh, 56)}${shown.map((l) => `<i class="ff-l${plainText(l).length > 36 ? ' long' : ''}">${l ? `<b class="ff-done${level === 'full' ? '' : ' part'}">${l}</b>` : ''}</i>`).join('')}</div>`;
};

// numberLine: { min, max } puts a number line across the top of both pages. room: the height (mm) a column may fill,
// one number for both pages or [page 1, page 2] (tools/fit-worksheets.js lowers it for a page that overflows).
const make = ({ code, title, numberLine, room }, steps) => Object.assign((chapter) => {
  const FULL = numberLine ? 246 : 262, ROOMS = Array.isArray(room) ? room : [room || FULL, room || FULL], BUBBLE = 13, TAG = 5, HEAD = 7;
  const lineCount = (t, chars) => Math.max(1, Math.ceil(plainText(t).length / chars));
  const hQuick = (it) => (it.fig ? 0.86 * Math.max(8, Math.max(figH(it.fig, it.fh, 38), figH(it.figDone, it.fh, 38)) + 2 + (it.q ? 4.4 * lineCount(it.q, 30) : 0)) : 2.8 + 3.8 * lineCount(it.q, 22));
  const lineH = (l) => (/class="fr"/.test(l) ? 8.4 : 6.2);
  const hWork = (two, minL) => (it) => 1 + 4.1 * lineCount(it.q, two ? 16 : 34) + (it.fig ? Math.max(figH(it.fig, it.fh, 56), figH(it.figDone, it.fh, 56)) + 1.5 : 0)
    + Math.max(minL, (it.lines || [1]).length) * 6.2 + (it.lines || []).reduce((t, l) => t + lineH(l) - 6.2, 0);
  // The HOW TO box: its heading, then each paragraph or line (<p>, <br>) at about 36 characters a line.
  const hHow = (how) => (how ? 6 + how.text.split(/<p>|<br>/).filter((t) => plainText(t).trim()).reduce((t, seg) => t + 3.75 * lineCount(seg, 36), 0) + 0.4 * (how.text.match(/<p>/g) || []).length + (how.fig ? figH(how.fig, how.fh, 54) + 1.5 : 0) : 0);
  let n = 0;
  const answers = [], examples = [];

  const column = (s, step) => {
    const level = s < 2 ? 'easy' : s < 4 ? 'medium' : 'hard', side = s % 3 === 1 ? 'right' : 'left';
    let html = '', ex = 0;
    const plan = step.rounds.map((rd, r) => {
      const items = pool(rd.gen), isQuick = rd.mode === 'quick', minL = rd.min || (items.some((it) => it.fig) ? 1 : 2);
      const two = !isQuick && !rd.one && items.every((it) => plainText(it.q).length <= 15 && !it.fig && (it.lines || []).every((l) => plainText(l).length <= 18));
      const h = isQuick ? hQuick : hWork(two, minL), perRow = two ? 2 : 1, set = isQuick ? 'list' : two ? 'two' : 'one';
      const exItems = items.splice(0, rd.we || rd.kinds || (isQuick ? 2 : 1));
      let exH = 0;
      for (let k = 0; k < exItems.length; k += perRow) exH += Math.max(...exItems.slice(k, k + perRow).map(h));
      return { rd, items, h, perRow, set, isQuick, minL, exItems, fixed: BUBBLE + (rd.fig ? (rd.fh || 40) + 1.5 : 0) + 2 * TAG + exH + 2 };
    });
    let free = ROOMS[s < 3 ? 0 : 1] - HEAD - (plainText(step.title).length > 24 ? 4.5 : 0) - hHow(step.how) - plan.reduce((t, p) => t + p.fixed, 0);
    // Share out the YOU DO questions: the next question goes to the round with the fewest so far, while it fits.
    const take = plan.map(() => ({ out: [], used: 0, next: 0 }));
    for (;;) {
      const cand = plan.map((p, r) => ({ p, r, t: take[r] }))
        .filter(({ p, t }) => t.next < p.items.length && t.out.length < (p.rd.max || (p.isQuick ? 8 : 6)))
        .map((c) => { const row = c.p.items.slice(c.t.next, c.t.next + c.p.perRow); return { ...c, row, hh: Math.max(...row.map(c.p.h)) }; })
        .filter((c) => c.hh <= free)
        .sort((a, b) => a.t.out.length - b.t.out.length || a.r - b.r);
      if (!cand.length) break;
      const c = cand[0]; c.t.out.push(...c.row); c.t.used += c.hh; c.t.next += c.p.perRow; free -= c.hh;
    }
    if (step.how) html += `<div data-est="${hHow(step.how).toFixed(1)}" class="ff-how"><div class="ff-how-h">How to</div>${step.how.text}${figHtml(step.how.fig, step.how.fh, 54)}</div>`;
    plan.forEach(({ rd, set, isQuick, minL, exItems }, r) => {
      html += bubble(rd.text, side);
      if (rd.fig) html += `<div class="ff-rfig" style="height:${rd.fh || 40}mm">${rd.fig}</div>`;
      exItems.forEach((it) => examples.push(`Step ${s + 1}, E${++ex}: ${it.q || '(diagram)'} → ${(it.lines || [it.a]).join('; ')}`));
      const exCells = exItems.map((it, i) => { const l = `E${ex - exItems.length + i + 1}`; return isQuick ? quick(l, it) : work(l, it, 'blank', Math.max(minL, (it.lines || [1]).length)); });
      html += `<div class="ff-tag we"><span class="zone-pill">WE DO</span><span>With your teacher: copy the working.</span></div><div class="ff-set we ${set}">${exCells.join('')}</div><div class="ff-tag you"><span class="zone-pill">YOU DO</span><span>Your turn.</span></div>`;
      const { out, used } = take[r];
      const cells = out.map((it, k) => {
        const label = String(++n);
        answers.push(it.a);
        return (isQuick ? quick(label, it, level === 'easy' && k === 0) : work(label, it, LEVELS[level][k] || 'blank', minL)).replace('<div class="', `<div data-est="${plan[r].h(it).toFixed(1)}" class="`);
      });
      html += `<div class="ff-set fill ${set}" style="flex-grow:${Math.max(1, Math.round(used))}">${cells.join('')}</div>`;
    });
    return html;
  };

  const words = { easy: ['l1', 'Easy'], medium: ['l2', 'Medium'], hard: ['l3', 'Challenging'] };
  const cols = steps.map((step, s) => {
    const first = n + 1, html = column(s, step), [cls, word] = words[s < 2 ? 'easy' : s < 4 ? 'medium' : 'hard'];
    return `<div class="ff-col ${cls}"><div class="ff-step"><b class="ff-stepn">Step ${s + 1}</b><span class="ff-stept">${step.title}</span></div><div class="ff-level"><b class="lvl-word ${cls}">${word}</b><span>Questions ${first}–${n}</span></div>${html}</div>`;
  });
  const page = (k) => `
<section class="page mb ws-page ws2">
  <div class="ws-strip"></div>
  <div class="content">
    <div class="ws-title"><h2><span>${code}</span>${title}${k ? '<em> (continued)</em>' : ''}</h2><p>Year ${chapter.year} · Chapter ${chapter.number}: ${chapter.title} · page ${k + 1} of 2</p></div>
    ${numberLine ? `<div class="ws-nl">${D.numberLine({ min: numberLine.min, max: numberLine.max, w: 176, h: 13 })}</div>` : ''}
    <div class="ff-frame">${cols.slice(3 * k, 3 * k + 3).join('')}</div>
  </div>
  <footer class="page-foot"><span>Kingscliff High School · Year ${chapter.year} Mathematics</span><span class="pn">{{PN}}</span><span>Chapter ${chapter.number} · ${chapter.title}</span></footer>
</section>`;
  return { code, title, pages: [page(0), page(1)], answers: [['WE DO examples (teacher)', examples], ['Questions', answers]] };
}, { code, room: Array.isArray(room) ? room : [room || (numberLine ? 246 : 262), room || (numberLine ? 246 : 262)], pagesEach: 2 });

module.exports = make;
