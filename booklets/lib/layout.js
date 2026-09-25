// Page and lesson building blocks shared by every booklet.
// Page numbers are written as {{PN}} and filled in when the whole booklet is assembled.

const dots = (n) => '<span class="lvl-dots">' + '<i></i>'.repeat(n) + '</span>';
const LEVELS = { 1: 'Level 1 · Getting started', 2: 'Level 2 · Building up', 3: 'Level 3 · Challenge', 4: 'Extension · Stretch yourself' };

const banner = (lvl, note = '') =>
  `<div class="banner">${dots(lvl)}<span class="banner-title">${LEVELS[lvl]}</span>${note ? `<span class="banner-note">${note}</span>` : ''}</div>`;

// WE DO (charcoal): students copy the teacher's working from the board. YOU DO (blue): students work on their own.
const weDo = (body, cls = '') => `
  <div class="zone we ${cls}"><div class="zone-head"><span class="zone-pill">WE DO</span><span class="zone-text">With your teacher: copy what they write on the board.</span></div>${body}</div>`;
const youDo = (txt, body, cls = '') => `
  <div class="zone you ${cls}"><div class="zone-head"><span class="zone-pill">YOU DO</span><span class="zone-text">On your own: ${txt}</span></div>${body}</div>`;

// A question whose blank working box fills the space its grid cell gives it.
const q = (label, txt, cls = '', extra = '') => `
  <div class="q ${cls}"><div class="q-head"><span class="q-num">${label}</span><span class="q-text">${txt}</span></div>${extra}<div class="box"></div></div>`;
// A question with a drawing area (grid paper, number line or stem-and-leaf template) instead of a plain box.
const qDraw = (label, txt, drawing, cls = '') => `
  <div class="q draw ${cls}"><div class="q-head"><span class="q-num">${label}</span><span class="q-text">${txt}</span></div><div class="draw-area">${drawing}</div></div>`;
// A short-answer question: text on the left, a small answer box on the right.
const qs = (label, txt) => `
  <div class="qs"><span class="q-num">${label}</span><span class="q-text">${txt}</span><span class="box"></span></div>`;
const example = (label, txt, drawing = '') => `
  <div class="q example"><div class="q-head"><span class="q-num ex">${label}</span><span class="q-text">${txt}</span></div>${drawing ? `<div class="draw-area">${drawing}</div>` : '<div class="box"></div>'}</div>`;

const worked = (lvl, title, question, steps, answer, extra = '') => `
  <div class="worked">
    <div class="worked-head">${dots(lvl)}<b>${title}</b></div>
    <div class="worked-q">${question}</div>
    <ol class="steps">${steps.map((s) => `<li>${s}</li>`).join('')}</ol>
    ${extra}
    <p class="worked-a">${answer}</p>
  </div>`;

const graphCard = (g, cls = '') => `<div class="graph-card ${cls}">${g}</div>`;
const split = (a, b, cls = '') => `<div class="split ${cls}">${a}${b}</div>`;

const makeLesson = ({ chapter, code, title }) => {
  const head = `Year ${chapter.year} · Chapter ${chapter.number} · ${code} ${title}`;
  const page = (section, body, { first = false } = {}) => `
<section class="page${first ? ' lesson-first' : ''}">
  <div class="art-strip"></div>
  <header class="page-head"><span>${head}</span><span class="sec">${section}</span></header>
  <div class="content">${body}</div>
  <footer class="page-foot"><span>Artwork © Marni Tuala</span><span class="pn">{{PN}}</span><span>Kingscliff High School · Year ${chapter.year} Mathematics</span></footer>
</section>`;

  const intro = ({ li, sc, terms }) => `
  <div class="lesson-title">
    <div class="lesson-badge"><span>Lesson</span><b>${code}</b></div>
    <h1>${title}</h1>
    <div class="date-line"><span>Date</span><i></i></div>
  </div>
  <div class="li-sc">
    <div class="card"><h3>Learning intentions</h3><p class="card-sub">We are learning to:</p><ul>${li.map((x) => `<li>${x}</li>`).join('')}</ul></div>
    <div class="card"><h3>Success criteria</h3><p class="card-sub">I can:</p><ul class="ticks">${sc.map((x) => `<li>${x}</li>`).join('')}</ul></div>
  </div>
  <div class="terms-head"><b>Key terms</b><span>Write the definition as your teacher explains it.</span></div>
  <div class="terms n${terms.length}">
    ${terms.map((t) => `<div class="term"><span class="term-name">${t}</span><i></i><i></i></div>`).join('')}
  </div>`;

  const notes = (cls = 'grow') => `<div class="notes ${cls}"><span class="notes-label">Notes</span></div>`;

  // The exit ticket sits in a fixed-height zone at the bottom of an odd page; the next page leaves the same zone blank.
  const exitTicket = ({ graph = '', questions }) => `
  <div class="tear-space"></div>
  <div class="tear-zone" data-exit="1">
    <div class="cut-line"><span>✂ Show off your skill: tear along this line and hand it to your teacher ✂</span></div>
    <div class="exit-head">
      <span class="zone-pill you-pill">YOU DO</span>
      <h2>Show off your skill</h2>
      <p>Choose <b>ONE</b> question. Show your working.</p>
      <div class="name-lines inline"><div><span>Name</span><i></i></div><div class="short"><span>Class</span><i></i></div></div>
    </div>
    <div class="exit-body${graph ? '' : ' no-graph'}">
      ${graph ? `<div class="graph-card exit-graph">${graph}</div>` : ''}
      ${questions.map((t, i) => q(`${dots(i + 1)} Level ${i + 1}`, t, 'exit-q')).join('')}
    </div>
  </div>`;

  const tearBack = () => `
  <div class="tear-space"></div>
  <div class="tear-zone back">
    <div class="cut-line"><span>✂</span></div>
    <div class="blank-note">This space is left blank on purpose. It is the back of your exit ticket.</div>
  </div>`;

  const summaryBanner = `<div class="banner summary"><span class="banner-title">Lesson summary</span><span class="banner-note">Missed the lesson? Start here.</span></div>`;

  return { page, intro, notes, exitTicket, tearBack, summaryBanner };
};

module.exports = { dots, banner, weDo, youDo, q, qDraw, qs, example, worked, graphCard, split, makeLesson };
