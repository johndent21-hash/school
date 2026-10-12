// Two-page lesson (Year 10 transition series): a slim header, then an Easy page and a Medium page, each a
// WE DO example (parts the teacher works on the board) followed by YOU DO rounds of short questions.
// No key terms, notes, extension, exit ticket or summary: the lesson is the WE DO and YOU DO boxes.
//
//  page 1: lesson title and date, learning intention and success criteria, Easy WE DO, Easy YOU DO rounds
//  page 2: Medium WE DO, Medium YOU DO rounds
//
// spec:
//   code, title
//   li: 'one learning intention'          sc: ['success criterion', ..]   (2 or 3)
//   easy, medium: {
//     ex: { stem, parts: [..] }  exAns: [..]   the WE DO example (a part is text, { t, fig } or { t, draw })
//     hint: 'the method, in one line'          shown at the top of the YOU DO box
//     rounds: [{ text, items, ans, cols?, work? }]   as in lib/drill.js: work gives each question a working box
//   }
const { mbPage, banner, youDo } = require('./layout');
const { exBlock, roundHtml, hint } = require('./lesson-blend').parts;

const LEVEL_WORD = ['', 'Easy', 'Medium'];
const qn = (n) => `${n} question${n === 1 ? '' : 's'}`;
const total = (rounds) => rounds.reduce((t, x) => t + x.items.length, 0);

const header = (spec) => `
  <div class="lesson-title two">
    <div class="lesson-badge"><span>Lesson</span><b>${spec.code}</b></div>
    <h1>${spec.title}</h1>
    <div class="date-line"><span>Date</span><i></i></div>
  </div>
  <div class="li-sc two">
    <div class="card"><h3>Learning intention</h3><p>We are learning to ${spec.li}</p></div>
    <div class="card"><h3>Success criteria</h3><ul class="ticks">${spec.sc.map((x) => `<li>I can ${x}</li>`).join('')}</ul></div>
  </div>`;

// The YOU DO box of one level: the method hint, then the rounds, numbered on through the level.
const practice = (lvl, L) => {
  let from = 1;
  const body = L.rounds.map((x, i) => { const h = roundHtml(x, i, from); from += x.items.length; return h; }).join('');
  const work = L.rounds.some((x) => x.work);
  return youDo(`<b class="lvl-word l${lvl}">${LEVEL_WORD[lvl]}</b> work down the box, one round at a time. Write each answer on its line${work ? ' (show working in the boxes)' : ''}.<span class="count">${qn(total(L.rounds))}</span>`,
    `${hint(L.hint)}${body}`, 'grow skill-zone');
};

const level = (lvl, L) => `
  ${banner(lvl, `${LEVEL_WORD[lvl]} · ${qn(total(L.rounds))}`)}
  ${exBlock(lvl, L.ex, `parts-${L.ex.parts.length}`)}
  ${practice(lvl, L)}`;

module.exports = (spec) => (chapter) => {
  ['easy', 'medium'].forEach((k) => {
    const L = spec[k];
    if (!L.exAns || L.exAns.length !== L.ex.parts.length) throw new Error(`${spec.code} ${k}: the example has ${L.ex.parts.length} parts but ${L.exAns ? L.exAns.length : 0} answers`);
    L.rounds.forEach((x) => { if (x.items.length !== x.ans.length) throw new Error(`${spec.code} ${k}: round "${x.text}" has ${x.items.length} questions but ${x.ans.length} answers`); });
  });
  const page = (section, body, first) => mbPage(chapter, { code: spec.code, title: spec.title, section, body, first, cls: 'two-page' });
  const pages = [
    page('Easy', `${header(spec)}${level(1, spec.easy)}`, true),
    page('Medium', level(2, spec.medium)),
  ];
  const L = 'abcdefgh';
  const answers = [
    ['WE DO examples (teacher)', [...spec.easy.exAns.map((a, i) => `Ex 1${L[i]}: ${a}`), ...spec.medium.exAns.map((a, i) => `Ex 2${L[i]}: ${a}`)]],
    ['Easy', spec.easy.rounds.flatMap((x) => x.ans)],
    ['Medium', spec.medium.rounds.flatMap((x) => x.ans)],
  ];
  return { code: spec.code, title: spec.title, pages, answers, spec };
};
