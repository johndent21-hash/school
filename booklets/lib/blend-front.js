// Front pages and the homework booklet for the Mandelbrot-theme (blended) series.
const { mbPage, youDo, q, qDraw, graphCard } = require('./layout');

const mbImg = (chapter, kind) => `{{ASSETSREL}}/mandelbrot/${(chapter.accent || '#7d3c98').slice(1)}-${kind}.png`;

const cover = (chapter, lessons, { kind = 'Lesson booklet', sub, list = true } = {}) => `
<section class="page mb-cover">
  <div class="mbc-band">
    <img class="mbc-logo" src="{{ASSETSREL}}/kingscliff-logo.png" alt="Kingscliff High School">
    <div class="mbc-titles">
      <span class="mbc-kicker">Mathematics · Year ${chapter.year} · ${kind}</span>
      <h1 class="${chapter.title.length > 18 ? 'long' : ''}">Chapter ${chapter.number}: <span>${chapter.title}</span></h1>
      <p class="mbc-sub">${sub || `${lessons.length} lessons · one lesson for each exercise · each lesson is one hour`}</p>
      <p class="mbc-outcome"><b>NSW syllabus outcome</b><br>${chapter.syllabus.replace(/^NSW Mathematics K–10 Syllabus \(2022\),?\s*/, '')}</p>
    </div>
    <div class="mbc-name"><span>Name</span><i></i><span>Class</span><i></i></div>
  </div>
  <div class="mbc-spine"></div>
  <div class="mbc-body">
    <div class="mbc-badge"><span>Chapter</span><b>${chapter.number}</b></div>
    ${list ? `<div class="mbc-lessons">${lessons.map((l) => `<div><b>${l.code}</b>${l.title}</div>`).join('')}</div>` : ''}
  </div>
  <div class="mbc-art" style="background-image:url(${mbImg(chapter, 'light')})"></div>
</section>`;

const HOWTO = `
    <div class="howto">
      <div><span class="step">1</span><span>Each lesson is <b>one hour</b>. Start with the <b>learning intentions</b> and <b>success criteria</b>, write the <b>key terms</b> and use the <b>notes</b> box.</span></div>
      <div><span class="step">2</span><span>Every lesson has three levels: <b class="lvl-word l1">Easy</b>, then <b class="lvl-word l2">Medium</b>, then <b class="lvl-word l3">Challenging</b>. Work down the page: the questions get harder as you go.</span></div>
      <div class="we"><span class="zone-pill">WE DO</span><span><b>Grey boxes.</b> Your teacher works each example (parts a, b, c) on the board. <b>Copy every step</b> into the space.</span></div>
      <div class="you"><span class="zone-pill">YOU DO</span><span><b>Blue boxes.</b> Now it is your turn. Work on your own. Quick drill answers go on the line; show working in the boxes.</span></div>
      <div><span class="step">3</span><span>Finished early? Try the <b>extension</b>. At the end, <b>show off your skill</b> on the tear-off exit ticket and hand it in.</span></div>
      <div><span class="step">4</span><span>Missed a lesson? Each lesson ends with a <b>summary</b> with a worked example for every level. Start there.</span></div>
    </div>`;

const insideCover = (chapter, lessons) => mbPage(chapter, { title: chapter.title, section: 'Start here', body: `
    <p class="section-title">How to use this booklet</p>
    ${HOWTO}
    <p class="section-title">Contents and progress tracker</p>
    <table class="contents tracker${lessons.length > 10 ? ' tight' : ''}">
      <tr><th>Lesson</th><th>Topic</th><th style="text-align:right">Page</th><th>Date</th><th style="text-align:center">Done</th></tr>
      ${lessons.map((l) => `<tr><td class="code">${l.code}</td><td>${l.title}</td><td class="pg">${l.startPage}</td><td class="date"></td><td class="tick"><i></i></td></tr>`).join('')}
    </table>
    <p class="section-title">In this chapter you will</p>
    <ul class="goals">${chapter.goals.map((g) => `<li>${g}</li>`).join('')}</ul>
    <div class="mb-ack grow">
      <div class="mb-ack-art" style="background-image:url(${mbImg(chapter, 'light')})"></div>
      <div>
        <h3>About the artwork</h3>
        <p>The pictures in this booklet are parts of the <b>Mandelbrot set</b>, drawn by a computer that repeats one simple rule, z → z² + c, thousands of times for every point. Maths can make beautiful things.</p>
        <h3>Acknowledgement of Country</h3>
        <p>We acknowledge the Bundjalung people, the Traditional Custodians of the land on which Kingscliff High School stands, and pay our respects to Elders past and present.</p>
      </div>
    </div>` });

// ---------- homework: a short mixed revision booklet sent home with the lesson booklet ----------
// From each lesson: one Easy question (an unused drill item if there is one), and the exit ticket's Medium and
// Challenging questions. The questions are mixed across the lessons, and each is tagged with its lesson.
const BAD = /Example \d|Set [A-D]\b|Question \d|reason you used|\bMia\b|Keith|the (lake|library|stadium|car park|student centre|main campus)|\bD9\b|in the diagram|Why\?$|dogs to all/i;
const NEEDSFIG = /Find [a-z]\b|Measure|Name the angle|shown|grid reference|timetable|\b(bus|train) trip|catch|the ([a-z]+ )?(graph|plot|diagram|map|timetable|spinner|dot plot|stem)|^Use the/i;
const plain = (t) => String(typeof t === 'object' ? t.t : t).replace(/<[^>]+>/g, '');
// A homework question must make sense on its own: no "Set A" or "Example 5", and a diagram when it needs one.
// `fig` is the diagram that goes with the question (from its set or exit ticket), `spare` the lesson's homework
// diagram; either is shown only when the question needs one.
const usable = ([q, a, fig, spare]) => {
  const own = typeof q === 'object' && (q.fig || q.draw);
  const needs = NEEDSFIG.test(plain(q));
  if (BAD.test(plain(q))) return null;
  if (needs && !own && !fig && !spare) return null;
  return [q, a, own || !needs ? undefined : fig || spare];
};
const firstUsable = (cands) => cands.map(usable).find(Boolean);
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const lead = (text, it) => (typeof it === 'string' ? `<span class="hw-lead">${cap(text)}</span> ${it}` : { ...it, t: `<span class="hw-lead">${cap(text)}</span> ${it.t}` });
// Set items that lean on the item before ("P(dark)" after "15 dark, 13 milk …: P(white)") are left out.
const ALONE = /^(P\(|Truck)/;
const fromSet = (set, ans, spare) => (set.given ? [] : set.items).map((it, i) => (ALONE.test(plain(it)) ? null : [lead(set.text, it), ans[i], set.fig, spare])).filter(Boolean).reverse();
const pick = (l) => {
  const s = l.spec;
  // Easy: a homework drill question if the lesson has one, else a question from Set B, with its instruction.
  const easy = firstUsable([...(s.drill && s.drill.hw ? [[lead(s.drill.hw[2] || (s.drill.text || s.a.text).replace(/^Quick drill:\s*/, ''), s.drill.hw[0]), s.drill.hw[1], undefined, s.hwFig]] : []), ...fromSet(s.b, s.ans.b, s.hwFig)]);
  const medium = firstUsable([[s.exit.qs[1], s.ans.exit[1], s.exit.fig, s.hwFig], ...fromSet(s.c, s.ans.c, s.hwFig)]);
  const hard = firstUsable([[s.exit.qs[2], s.ans.exit[2], s.exit.fig, s.hwFig], ...fromSet(s.d, s.ans.d, s.hwFig)]);
  return { easy, medium, hard, code: l.code };
};
const mix = (xs) => xs.map((x, i) => [((i * 7) % xs.length) + i / 100, x]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
const tag = (code) => `<span class="hw-tag">Lesson ${code}</span>`;
const homework = (chapter, lessons) => {
  const picks = lessons.map(pick);
  const E = mix(picks.filter((p) => p.easy).map((p) => [p.easy[0], p.easy[1], p.code, p.easy[2]]));
  const M = mix(picks.filter((p) => p.medium).map((p) => [p.medium[0], p.medium[1], p.code, p.medium[2]]));
  const H = mix(picks.filter((p, i) => p.hard && (lessons.length <= 6 || i % 2 === 0)).map((p) => [p.hard[0], p.hard[1], p.code, p.hard[2]])).slice(0, 6);
  // One list, easiest first; each question shows its level. Ten questions a page, two columns.
  const all = [...E.map((x) => [x, 1]), ...M.map((x) => [x, 2]), ...H.map((x) => [x, 3])];
  const word = ['', 'Easy', 'Medium', 'Challenging'];
  const cell = ([x, lvl], n) => {
    const [t, , code, fig] = x;
    const label = `<b class="lvl-word l${lvl} mini">${word[lvl]}</b>`;
    return typeof t === 'object' && t.draw ? qDraw(n, `${label}${t.t} ${tag(code)}`, t.draw)
      : q(n, `${label}${typeof t === 'object' ? t.t : t} ${tag(code)}${(typeof t === 'object' && t.fig) || fig ? `<div class="inline-fig">${(typeof t === 'object' && t.fig) || fig}</div>` : ''}`);
  };
  const title = `${chapter.title}: homework`;
  const intro = `<div class="hw-intro"><b>Mixed revision homework.</b> These questions mix all the lessons in Chapter ${chapter.number}, from <b class="lvl-word l1">Easy</b> to <b class="lvl-word l3">Challenging</b>. Each one is tagged with its lesson, so you can look back at that lesson's summary if you get stuck. Show your working in the boxes.</div>`;
  const per = 10, pages = [];
  for (let i = 0; i < all.length; i += per) {
    const part = all.slice(i, i + per);
    const grid = `<div class="work-grid hw" style="grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(${Math.ceil(per / 2)}, 1fr); grid-auto-flow: row">${part.map((it, k) => cell(it, i + k + 1)).join('')}</div>`;
    pages.push(mbPage(chapter, { title, section: `Homework · page ${pages.length + 1}`, body: `${i === 0 ? intro : ''}${youDo(`mixed revision.<span class="count">questions ${i + 1}–${i + part.length} of ${all.length}</span>`, grid, 'grow')}` }));
  }
  if (pages.length % 2 === 0) pages.push(mbPage(chapter, { title, section: 'Homework · extra space', body: youDo('extra working space. Write the question number next to your working.', '<div class="work-grid" style="grid-template-rows:1fr"><div class="q"><div class="box"></div></div></div>', 'grow') }));
  let k = 0;
  const answers = [['Answers (question, lesson)', all.map(([x, lvl]) => `${++k}. ${x[1]} (${word[lvl]}, ${x[2]})`)]];
  return { pages: [cover(chapter, lessons, { kind: 'Homework booklet', sub: `Mixed revision of all ${lessons.length} lessons · ${all.length} questions`, list: false }), ...pages], answers };
};

module.exports = { cover, insideCover, homework };
