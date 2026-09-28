// Calm two-page worksheet, modelled closely on the Freefall Mathematics sheets: one double-sided sheet per lesson,
// three columns a page, six steps from Easy (1–2) to Medium (3–4) to Challenging (5–6).
// Every question is written out by hand in the lesson file, so the progression is deliberate.
//
// A step: { title, how: { text, fig? }, rounds: [{ text, two?, we: [item], you: [item] }] }
//   how.text   at most three short lines plus one worked example (HTML; use <p> for each line)
//   text       the speech bubble: one plain instruction
//   two        two questions to a row (short questions, as in Freefall's middle column)
//   we         WE DO examples: one of each kind of question in the round, laid out exactly like the YOU DO
//   you        YOU DO questions (about 4–6 a step)
// step.check: an optional last question with no scaffold ({ q, lines }).
// An item: { q, lines, fig?, figDone? }. lines is the working, one step a line, the answer last.
//   fig is a picture under the question; figDone is the same picture completed, shown while the question is worked.
// The YOU DO questions of a step fade: fully worked, then only the answer blank, then every number blank (the
// structure stays), then blank. The rows share the column evenly, so spare room becomes writing space.
const D = require('./diagrams');
const { bubble, blankLine, viewBox } = require('./worksheet').helpers;

// Blanking a line keeps its structure. A sentence answer keeps its start: "No. The answer is −3." becomes
// "Yes / No. The answer is ___." and "Yes. Ben is right." becomes "Yes / No. ________".
const blank = (l) => {
  const m = /^(Yes|No)\.\s*(.*)$/.exec(l);
  if (!m) return blankLine(l);
  const rest = blankLine(m[2]);
  return `Yes / No. ${rest}`;
};
const scaffold = (lines, level) => lines.map((l, i) => (level === 'full' ? l : level === 'answer' ? (i === lines.length - 1 ? blank(l) : l) : level === 'numbers' ? blank(l) : ''));

const FADE = ['full', 'answer', 'numbers'];
const figBox = (fig) => { if (!fig) return ''; const vb = viewBox(fig); return `<div class="cw-fig" style="height:${vb ? Math.min(30, vb[1] * Math.min(1.1, 56 / vb[0])).toFixed(1) : 20}mm">${fig}</div>`; };

// One question: number, question, picture, then the lines (worked, part-worked or blank).
const cell = (label, it, level) => {
  const shown = scaffold(it.lines, level), fig = (level === 'full' || level === 'answer') && it.figDone ? it.figDone : it.fig;
  const lines = shown.map((l) => `<i class="cw-l">${l ? `<b class="ff-done${level === 'full' ? '' : ' part'}">${l}</b>` : ''}</i>`).join('');
  return `<div class="cw-cell"><div class="cw-qrow"><span class="ff-n">${label}</span><span class="cw-q">${it.q}</span></div>${figBox(fig)}<div class="cw-lines">${lines}</div></div>`;
};

module.exports = ({ code, title, numberLine }, steps) => Object.assign((chapter) => {
  let n = 0, ex = 0;
  const answers = []; // [heading, worked solutions] for each step
  const worked = (label, it) => `<b>${label}</b> ${it.q}<br><span class="aw">${it.lines.join(' &ensp;·&ensp; ')}</span>`;
  const words = [['l1', 'Easy'], ['l1', 'Easy'], ['l2', 'Medium'], ['l2', 'Medium'], ['l3', 'Challenging'], ['l3', 'Challenging']];

  const column = (step, s) => {
    const side = s % 3 === 1 ? 'right' : 'left';
    // The level (Easy, Medium, Challenging) sits small in the corner of the HOW TO box, so titles never wrap.
    const level = `<span class="cw-lvl ${words[s][0]}">${words[s][1]}</span>`;
    let html = `<div class="cw-head"><span class="cw-stepn">Step ${s + 1}</span><span class="cw-title">${step.title}</span>${step.how ? '' : level}</div>`;
    if (step.how) html += `<div class="cw-how"><div class="cw-how-h"><span>How to</span>${level}</div>${step.how.text}${step.how.fig ? figBox(step.how.fig) : ''}</div>`;
    let k = 0; // the fade runs across the whole step
    const sol = []; sol.plain = true;
    answers.push([`Step ${s + 1}: ${step.title}`, sol]);
    step.rounds.forEach((rd) => {
      html += bubble(rd.text, side);
      const we = rd.we.map((it) => { ++ex; sol.push(worked(`E${ex} (WE DO)`, it)); return cell(`E${ex}`, it, 'blank'); });
      html += `<div class="cw-tag"><span class="zone-pill we">WE DO</span></div><div class="cw-set we${rd.two ? ' two' : ''}">${we.join('')}</div>`;
      const you = rd.you.map((it) => { ++n; sol.push(worked(String(n), it)); return cell(String(n), it, FADE[k++] || 'blank'); });
      html += `<div class="cw-tag"><span class="zone-pill you">YOU DO</span></div><div class="cw-set you${rd.two ? ' two' : ''}" style="flex-grow:${rd.you.length}">${you.join('')}</div>`;
    });
    // An optional last question with no scaffold at all: one line, answered alone.
    if (step.check) { ++n; sol.push(worked(`${n} (Check yourself)`, step.check)); html += `<div class="cw-check"><span class="cw-check-h">Check yourself</span>${cell(String(n), { ...step.check, lines: step.check.lines.map(() => '') }, 'blank')}</div>`; }
    return `<div class="ff-col cw-col ${words[s][0]}">${html}</div>`;
  };

  const cols = steps.map(column);
  const page = (p) => `
<section class="page mb ws-page ws2 cw">
  <div class="ws-strip"></div>
  <div class="content">
    <div class="ws-title"><h2><span>${code}</span>${title}${p ? '<em> (continued)</em>' : ''}</h2><p>Year ${chapter.year} · Chapter ${chapter.number}: ${chapter.title} · page ${p + 1} of 2</p></div>
    ${p ? '' : '<div class="cw-name"><span>Name</span><i></i><span>Class</span><i class="short"></i><span>Date</span><i class="short"></i></div>'}
    ${numberLine ? `<div class="ws-nl">${D.numberLine({ min: numberLine.min, max: numberLine.max, w: 176, h: 13 })}</div>` : ''}
    <div class="ff-frame">${cols.slice(3 * p, 3 * p + 3).join('')}</div>
  </div>
  <footer class="page-foot"><span>Kingscliff High School · Year ${chapter.year} Mathematics</span><span class="pn">{{PN}}</span><span>Chapter ${chapter.number} · ${chapter.title}</span></footer>
</section>`;
  return { code, title, pages: [page(0), page(1)], answers };
}, { code, pagesEach: 2 });
