// Builds a chapter booklet and its answer key.
// Usage: node booklets/build.js year7/ch10-analysing-data [--shots <dir>]
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = __dirname;
const chapterDir = path.join(ROOT, process.argv[2] || 'year7/ch10-analysing-data');
const shotsIdx = process.argv.indexOf('--shots');
const shotsDir = shotsIdx > 0 ? process.argv[shotsIdx + 1] : null;

const noIndividual = process.argv.includes('--no-individual');

const chapter = require(path.join(chapterDir, 'chapter.js'));
const extrasFile = path.join(chapterDir, 'standalone.js');
const extras = fs.existsSync(extrasFile) ? require(extrasFile) : {};
const { lessonMeta, qGrid, youDo } = require('./lib/layout');
const theme = fs.readFileSync(path.join(ROOT, 'lib/theme.css'), 'utf8');
// Paths to assets are relative to the folder each booklet is written into.
const assetsFor = (dir) => path.relative(dir, path.join(ROOT, 'assets')).split(path.sep).join('/');
const cssFor = (dir) => theme.replaceAll('{{ASSETS}}', assetsFor(dir));
let assetsRel = assetsFor(chapterDir);

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

// ---------- standalone lesson booklets ----------
const slug = (t) => t.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '');
const footer = `<footer class="page-foot"><span>Artwork © Marni Tuala</span><span class="pn">{{PN}}</span><span>Kingscliff High School · Year ${chapter.year} Mathematics</span></footer>`;

const lessonCover = (l, index, total) => {
  const meta = lessonMeta[l.code] || { li: [] };
  return `
<section class="page cover">
  <div class="cover-art"></div>
  <div class="cover-spine"><span>YEAR ${chapter.year} · CHAPTER ${chapter.number} · LESSON ${l.code} · ${l.title.toUpperCase()}</span></div>
  <div class="cover-series"><span>Year ${chapter.year} Mathematics</span><span>Chapter ${chapter.number} · ${chapter.title}</span></div>
  <div class="cover-panel">
    <div class="cover-top">
      <img class="logo" src="${assetsRel}/kingscliff-logo.png" alt="Kingscliff High School">
      <div class="chapter-badge lesson"><span>Lesson</span><b>${l.code}</b></div>
    </div>
    <p class="cover-kicker">Year ${chapter.year} Mathematics · Chapter ${chapter.number}</p>
    <h1>${l.title}</h1>
    <div class="cover-progress"><span>Lesson ${index + 1} of ${total}</span>${Array.from({ length: total }, (_, i) => `<i class="${i === index ? 'on' : i < index ? 'done' : ''}"></i>`).join('')}</div>
    <div class="cover-learn"><b>In this lesson you will learn to:</b><ul>${meta.li.map((x) => `<li>${x}</li>`).join('')}</ul></div>
    <div class="cover-fields">
      <div><span>Name</span><i></i></div>
      <div><span>Class</span><i></i></div>
      <div><span>Teacher</span><i></i></div>
    </div>
  </div>
  <p class="cover-credit">Cover and theme artwork by <b>Marni Tuala</b></p>
</section>`;
};

const beforeYouStart = (l) => {
  const x = extras[l.code] || {};
  // Describe each page from what is on it: teacher examples (WE DO) and/or practice (YOU DO).
  const what = (p, i) => {
    if (i === 0) return 'Learning intentions, key terms, notes and Level 1 teacher examples';
    if (p.includes('data-exit="1"')) return 'Extension questions and the tear-off exit ticket';
    if (p.includes('Lesson summary')) return 'Lesson summary: a worked example for every level';
    const levels = [...new Set([...p.matchAll(/Level (\d)/g)].map((m) => m[1]))].sort();
    const parts = [p.includes('zone we') && '<span class="map-we">WE DO</span> teacher examples', p.includes('zone you') && '<span class="map-you">YOU DO</span> practice questions'].filter(Boolean);
    return `Level ${levels.join(' and ')}: ${parts.join(' and ')}`;
  };
  return `
<section class="page">
  <div class="art-strip"></div>
  <header class="page-head"><span>Year ${chapter.year} · Chapter ${chapter.number} · ${l.code} ${l.title}</span><span class="sec">Before you start</span></header>
  <div class="content">
    <p class="section-title">Before you start</p>
    <div class="bys-top">
      <div class="need"><b>You will need</b>${(x.need || ['Pencil', 'Ruler']).map((n) => `<span>${n}</span>`).join('')}</div>
      ${x.outcome ? `<p class="outcome"><b>Syllabus:</b> ${x.outcome}</p>` : ''}
    </div>
    <div class="howto">
      <div class="we"><span class="zone-pill">WE DO</span><span><b>Grey boxes.</b> Work with your teacher. Copy what they write on the board.</span></div>
      <div class="you"><span class="zone-pill">YOU DO</span><span><b>Blue boxes.</b> Work on your own. Show your working in the box.</span></div>
      <div><span class="step">1</span><span>Work through <b>Level 1</b>, then <b>Level 2</b>, then <b>Level 3</b>. Try the <b>extension</b> if you finish early.</span></div>
      <div><span class="step">2</span><span>At the end, <b>show off your skill</b>: answer one exit ticket question, tear it off and hand it in.</span></div>
    </div>
    <p class="section-title">Lesson map</p>
    <table class="contents">
      <tr><th>Page</th><th>What is on it</th><th style="text-align:center">Done</th></tr>
      ${l.pages.map((p, i) => `<tr><td class="code">${i + 3}</td><td>${what(p, i)}</td><td class="tick"><i></i></td></tr>`).join('')}
    </table>
    ${x.warmup ? youDo('Warm-up. These skills will help you in this lesson. Show your working.', qGrid(x.warmup.map(([q]) => q)), 'grow') : ''}
    <div class="ack-box">
      <div class="ack-art"></div>
      <div>
        <h3>Acknowledgement of artwork</h3>
        <p>The artwork used throughout this booklet series was created by <b>Marni Tuala</b>. We thank Marni for sharing this artwork with our school community.</p>
        <h3>Acknowledgement of Country</h3>
        <p>We acknowledge the Bundjalung people, the Traditional Custodians of the land on which Kingscliff High School stands, and pay our respects to Elders past and present.</p>
      </div>
    </div>
  </div>
  ${footer}
</section>`;
};

// ---------- assembly ----------
// Lays lessons out after the front pages, fills in {{L1}}… and {{PN}}, and checks exit ticket placement.
const assemble = (front, lessons) => {
  let next = front.length + 1;
  lessons.forEach((l) => {
    if (l.pages.length % 2) throw new Error(`${l.code} has ${l.pages.length} pages; lessons must have an even number of pages`);
    if (next % 2 === 0) throw new Error(`${l.code} would start on a left-hand page`);
    l.startPage = next;
    l.pages = l.pages.map((p) => p.replace(/\{\{L(\d)\}\}/g, (_, n) => l.startPage + +n - 1));
    next += l.pages.length;
  });
  const pages = [...front.map((f) => (typeof f === 'function' ? f() : f)), ...lessons.flatMap((l) => l.pages)].map((p, i) => p.replaceAll('{{PN}}', i + 1));
  pages.forEach((p, i) => {
    if (!p.includes('data-exit="1"')) return;
    if ((i + 1) % 2 === 0) throw new Error(`Exit ticket on even page ${i + 1}`);
    if (!pages[i + 1] || !pages[i + 1].includes('tear-zone back')) throw new Error(`Page ${i + 2} must leave the back of the exit ticket blank`);
  });
  return pages;
};

const doc = (dir, title, body, extraCss = '') => `<!doctype html>
<html lang="en-AU"><head><meta charset="utf-8"><title>${title}</title>
<style>${cssFor(dir)}${extraCss}</style></head><body>${body}</body></html>`;

const answersCss = `
  @page { size: A4; margin: 12mm 12mm 14mm; }
  .ans-header h1 { font-size: 14pt; margin-bottom: 3mm; border-bottom: 0.5mm solid var(--sand); padding-bottom: 2mm; }
  .ans-lesson { break-inside: auto; }
  .ans-lesson h2 { break-inside: avoid; break-after: avoid; }
  .ans-block { break-inside: avoid; }
  .ans-page { font-size: 8.5pt; color: var(--muted); font-weight: 400; }`;
const answerBlocks = (items) => items.map(([h, list]) => `<div class="ans-block"><h3>${h}</h3><ol>${list.map((a) => `<li>${a}</li>`).join('')}</ol></div>`).join('');
const answersHtml = (heading, lessons, pageLabel) => `
  <div class="ans-header"><h1>${heading}</h1></div>
  <div class="answers">
  ${lessons.map((l) => `<div class="ans-lesson"><h2>${l.code} ${l.title} <span class="ans-page">(${pageLabel} p. ${l.startPage})</span></h2>${answerBlocks(l.answers)}</div>`).join('')}
  </div>`;

const jobs = []; // { dir, name, html, check }

// 1. The whole-chapter booklet
{
  assetsRel = assetsFor(chapterDir);
  const lessons = chapter.lessons.map((make) => make(chapter));
  const pages = assemble([() => cover(lessons), () => insideCover(lessons)], lessons);
  const base = chapter.fileName;
  jobs.push({ dir: chapterDir, name: base, check: true, html: doc(chapterDir, `${chapter.title} booklet`, pages.join('\n')) });
  jobs.push({ dir: chapterDir, name: `${base}-Answers`, html: doc(chapterDir, `${chapter.title} answers`,
    answersHtml(`Year ${chapter.year} · Chapter ${chapter.number} · ${chapter.title}: answers (teacher copy)`, lessons, 'booklet'), answersCss) });
}

// 2. One booklet per lesson: cover, "before you start", then the lesson
if (!noIndividual) {
  const dir = path.join(chapterDir, 'individual');
  fs.mkdirSync(dir, { recursive: true });
  assetsRel = assetsFor(dir);
  chapter.lessons.forEach((make, index) => {
    const l = make(chapter);
    const pages = assemble([() => lessonCover(l, index, chapter.lessons.length), () => beforeYouStart(l)], [l]);
    const name = `Year${chapter.year}-${l.code}-${slug(l.title)}`;
    const x = extras[l.code] || {};
    const withWarmup = { ...l, answers: [...(x.warmup ? [['Warm-up', x.warmup.map(([, a]) => a)]] : []), ...l.answers] };
    jobs.push({ dir, name, check: true, html: doc(dir, `${l.code} ${l.title}`, pages.join('\n')) });
    jobs.push({ dir, name: `${name}-Answers`, html: doc(dir, `${l.code} answers`,
      answersHtml(`Year ${chapter.year} · Lesson ${l.code} ${l.title}: answers (teacher copy)`, [withWarmup], 'booklet'), answersCss) });
  });
}

(async () => {
  // Use Playwright from this folder (npm install), falling back to a global install.
  let pw;
  try { pw = require('playwright'); } catch { pw = require(require.resolve('playwright', { paths: [execSync('npm root -g').toString().trim()] })); }
  const browser = await pw.chromium.launch();
  const pg = await browser.newPage({ viewport: { width: 800, height: 1200 }, deviceScaleFactor: 1.4 });
  let totalProblems = 0;
  for (const job of jobs) {
    const file = path.join(job.dir, `${job.name}.html`);
    fs.writeFileSync(file, job.html);
    await pg.goto('file://' + file);
    await pg.evaluate(() => document.fonts.ready);
    if (job.check) {
      const problems = await pg.evaluate(`(${require('./lib/check').toString()})()`);
      totalProblems += problems.length;
      if (problems.length) console.warn(`${job.name}: ${problems.length} layout problem(s):\n  ` + problems.join('\n  '));
      if (shotsDir) {
        const out = path.join(shotsDir, job.name);
        fs.mkdirSync(out, { recursive: true });
        const pages = await pg.$$('.page');
        for (let i = 0; i < pages.length; i++) await pages[i].screenshot({ path: path.join(out, `p${String(i + 1).padStart(2, '0')}.png`) });
      }
    }
    await pg.pdf({ path: path.join(job.dir, `${job.name}.pdf`), format: 'A4', printBackground: true, preferCSSPageSize: true });
    console.log(`${path.relative(ROOT, path.join(job.dir, job.name))}.pdf written`);
  }
  console.log(totalProblems ? `${totalProblems} layout problem(s) in total` : 'Layout check: no problems found in any booklet');
  await browser.close();
})();
