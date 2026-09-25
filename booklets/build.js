// Builds a chapter booklet and its answer key.
// Usage: node booklets/build.js year7/ch10-analysing-data [--shots <dir>]
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = __dirname;
const chapterDir = path.join(ROOT, process.argv[2] || 'year7/ch10-analysing-data');
const shotsIdx = process.argv.indexOf('--shots');
const shotsDir = shotsIdx > 0 ? process.argv[shotsIdx + 1] : null;

const chapter = require(path.join(chapterDir, 'chapter.js'));
const assetsRel = path.relative(chapterDir, path.join(ROOT, 'assets')).split(path.sep).join('/');
const css = fs.readFileSync(path.join(ROOT, 'lib/theme.css'), 'utf8').replaceAll('{{ASSETS}}', assetsRel);

// ---------- cover and inside cover ----------
const cover = (lessons) => `
<section class="page cover">
  <div class="cover-art"></div>
  <div class="cover-spine"><span>YEAR ${chapter.year} · CHAPTER ${chapter.number} · ${chapter.title.toUpperCase()}</span></div>
  <div class="cover-series"><span>Year ${chapter.year} Mathematics</span><span>Stage ${chapter.stage}</span></div>
  <div class="cover-panel">
    <div class="cover-top">
      <img class="logo" src="${assetsRel}/kingscliff-logo.png" alt="Kingscliff High School">
      <div class="chapter-badge"><span>Chapter</span><b>${chapter.number}</b></div>
    </div>
    <p class="cover-kicker">Year ${chapter.year} Mathematics · Chapter ${chapter.number}</p>
    <h1>${chapter.title}</h1>
    <div class="cover-lessons">${lessons.map((l) => `<div><b>${l.code}</b>${l.title}</div>`).join('')}</div>
    <div class="cover-fields">
      <div><span>Name</span><i></i></div>
      <div><span>Class</span><i></i></div>
      <div><span>Teacher</span><i></i></div>
    </div>
  </div>
  <p class="cover-credit">Cover and theme artwork by <b>Marni Tuala</b></p>
</section>`;

const insideCover = (lessons) => `
<section class="page">
  <div class="art-strip"></div>
  <header class="page-head"><span>Year ${chapter.year} · Chapter ${chapter.number} · ${chapter.title}</span><span class="sec">Start here</span></header>
  <div class="content">
    <p class="section-title">How to use this booklet</p>
    <div class="howto">
      <div><span class="step">1</span><span>Each lesson starts with <b>learning intentions</b> and <b>success criteria</b>. Write the <b>key terms</b> as your teacher explains them, and use the <b>notes</b> box.</span></div>
      <div><span class="step">2</span><span>Work through the levels in order: Level 1 ${'<span class="lvl-dots"><i></i></span>'}, then Level 2, then Level 3. Extension questions stretch you further.</span></div>
      <div class="we"><span class="zone-pill">WE DO</span><span><b>Grey boxes with a dark border.</b> Work with your teacher. Copy what they write on the board.</span></div>
      <div class="you"><span class="zone-pill">YOU DO</span><span><b>Blue boxes.</b> Work on your own. Show your working in the box and write your answer.</span></div>
      <div><span class="step">3</span><span>Some questions ask you to <b>draw</b> a graph, dot plot or stem-and-leaf plot. Use the grid or template given and a ruler.</span></div>
      <div><span class="step">4</span><span>At the end of each lesson, <b>show off your skill</b>: choose one question, then tear off the ticket and hand it in.</span></div>
      <div style="grid-column: 1 / -1"><span class="step">5</span><span>Missed a lesson? Each lesson ends with a <b>summary</b> that has a worked example for every level. Start there, then try the questions.</span></div>
    </div>
    <p class="section-title">Contents</p>
    <table class="contents">
      <tr><th>Lesson</th><th>Topic</th><th style="text-align:right">Page</th><th style="text-align:center">Done</th></tr>
      ${lessons.map((l) => `<tr><td class="code">${l.code}</td><td>${l.title}</td><td class="pg">${l.startPage}</td><td class="tick"><i></i></td></tr>`).join('')}
    </table>
    <p class="section-title">In this chapter you will</p>
    <ul class="goals">${chapter.goals.map((g) => `<li>${g}</li>`).join('')}</ul>
    <p style="font-size:8.5pt;color:var(--muted)">${chapter.syllabus}</p>
    <div class="ack-box grow">
      <div class="ack-art"></div>
      <div>
        <h3>Acknowledgement of artwork</h3>
        <p>The artwork used throughout this booklet series was created by <b>Marni Tuala</b>. We thank Marni for sharing this artwork with our school community.</p>
        <h3>Acknowledgement of Country</h3>
        <p>We acknowledge the Bundjalung people, the Traditional Custodians of the land on which Kingscliff High School stands, and pay our respects to Elders past and present.</p>
      </div>
    </div>
  </div>
  <footer class="page-foot"><span>Artwork © Marni Tuala</span><span class="pn">{{PN}}</span><span>Kingscliff High School · Year ${chapter.year} Mathematics</span></footer>
</section>`;

// ---------- assemble ----------
const lessons = chapter.lessons.map((make) => make(chapter));
let next = 3; // page 1 is the cover, page 2 the inside cover
lessons.forEach((l) => {
  if (l.pages.length % 2) throw new Error(`${l.code} has ${l.pages.length} pages; lessons must have an even number of pages`);
  l.startPage = next;
  // {{L1}}, {{L2}} ... refer to a page of the same lesson by its position.
  l.pages = l.pages.map((p) => p.replace(/\{\{L(\d)\}\}/g, (_, n) => l.startPage + +n - 1));
  next += l.pages.length;
});
const allPages = [cover(lessons), insideCover(lessons), ...lessons.flatMap((l) => l.pages)];
let pn = 0;
const pagesHtml = allPages.map((p) => { pn += 1; return p.replaceAll('{{PN}}', pn); });

// Each exit ticket must be on an odd (right-hand) page and backed by a blank tear zone on the next page.
pagesHtml.forEach((p, i) => {
  if (!p.includes('data-exit="1"')) return;
  if ((i + 1) % 2 === 0) throw new Error(`Exit ticket on even page ${i + 1}`);
  if (!pagesHtml[i + 1] || !pagesHtml[i + 1].includes('tear-zone back')) throw new Error(`Page ${i + 2} must leave the back of the exit ticket blank`);
});

const doc = (title, body, extraCss = '') => `<!doctype html>
<html lang="en-AU"><head><meta charset="utf-8"><title>${title}</title>
<style>${css}${extraCss}</style></head><body>${body}</body></html>`;

const base = chapter.fileName;
fs.writeFileSync(path.join(chapterDir, `${base}.html`), doc(`${chapter.title} booklet`, pagesHtml.join('\n')));

const answersHtml = `
  <div class="ans-header"><h1>Year ${chapter.year} · Chapter ${chapter.number} · ${chapter.title}: answers (teacher copy)</h1></div>
  <div class="answers">
  ${lessons.map((l) => `<div class="ans-lesson"><h2>${l.code} ${l.title} <span class="ans-page">(booklet p. ${l.startPage})</span></h2>
    ${l.answers.map(([h, items]) => `<div class="ans-block"><h3>${h}</h3><ol>${items.map((a) => `<li>${a}</li>`).join('')}</ol></div>`).join('')}</div>`).join('')}
  </div>`;
fs.writeFileSync(path.join(chapterDir, `${base}-Answers.html`), doc(`${chapter.title} answers`, answersHtml, `
  @page { size: A4; margin: 12mm 12mm 14mm; }
  .ans-header h1 { font-size: 14pt; margin-bottom: 3mm; border-bottom: 0.5mm solid var(--sand); padding-bottom: 2mm; }
  .ans-lesson { break-inside: auto; }
  .ans-lesson h2 { break-inside: avoid; break-after: avoid; }
  .ans-block { break-inside: avoid; }
  .ans-page { font-size: 8.5pt; color: var(--muted); font-weight: 400; }`));

(async () => {
  const { chromium } = require(require.resolve('playwright', { paths: [execSync('npm root -g').toString().trim()] }));
  const browser = await chromium.launch();
  const pg = await browser.newPage({ viewport: { width: 800, height: 1200 }, deviceScaleFactor: 1.4 });
  for (const name of [base, `${base}-Answers`]) {
    await pg.goto('file://' + path.join(chapterDir, `${name}.html`));
    await pg.evaluate(() => document.fonts.ready);
    if (name === base) {
      const problems = await pg.evaluate(() => [...document.querySelectorAll('.page')].flatMap((p, i) => {
        const out = [];
        const c = p.querySelector('.content');
        if (!c) return out;
        const cb = c.getBoundingClientRect().bottom;
        c.querySelectorAll('.worked, .q, .zone').forEach((el) => { if (el.getBoundingClientRect().bottom > cb + 1) out.push(`page ${i + 1}: a box runs off the page`); });
        if (c && c.scrollHeight > c.clientHeight + 1) out.push(`page ${i + 1}: content overflows by ${Math.round((c.scrollHeight - c.clientHeight) / 3.78)} mm`);
        p.querySelectorAll('.q .box').forEach((b) => { if (b.getBoundingClientRect().height < 26) out.push(`page ${i + 1}: a working box is under 7 mm tall (${(b.closest('.q').querySelector('.q-text') || {}).textContent})`); });
        p.querySelectorAll('.grid-paper').forEach((b) => { if (b.getBoundingClientRect().height < 110) out.push(`page ${i + 1}: grid paper under 30 mm tall`); });
        // anything that runs into the tear-off zone
        const tz = p.querySelector('.tear-zone');
        if (tz) {
          const top = tz.getBoundingClientRect().top;
          [...c.querySelectorAll('.zone, .worked, .q, .graph-card, .banner, .summary-grid, .notes')].filter((el) => !el.closest('.tear-zone'))
            .forEach((el) => { if (el.getBoundingClientRect().bottom > top + 1) out.push(`page ${i + 1}: content runs into the tear-off zone`); });
        }
        return out;
      }));
      if (problems.length) console.warn([...new Set(problems)].join('\n'));
      if (shotsDir) {
        fs.mkdirSync(shotsDir, { recursive: true });
        const pages = await pg.$$('.page');
        for (let i = 0; i < pages.length; i++) await pages[i].screenshot({ path: path.join(shotsDir, `p${String(i + 1).padStart(2, '0')}.png`) });
      }
    }
    await pg.pdf({ path: path.join(chapterDir, `${name}.pdf`), format: 'A4', printBackground: true, preferCSSPageSize: true });
    console.log(`${name}.pdf written`);
  }
  await browser.close();
})();
