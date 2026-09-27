// Makes a blended (Mandelbrot-theme) chapter from an existing chapter's lesson content.
//   blend(require('../../year7/ch01-integers/chapter.js'), { fileName, accent, pages, more: { '1.04': { drill, ex, exAns, pages } } })
// `skills` is the chapter's skills.js (the Skill drill pages; see lib/drill.js). `art` names the Mandelbrot region.
// `inline: true` puts the skill drill inside the lesson pages (no extra pages; see lib/lesson-blend.js).
// `more` adds to or replaces fields of each lesson's spec (see lib/lesson-blend.js). `only` keeps some lessons (for split chapters).
const lessonBlend = require('./lesson-blend');
const { make } = require('./drill');

module.exports = (base, o = {}) => {
  const specs = base.lessons.map((f) => f.spec).filter((s) => !o.only || o.only.includes(s.code));
  return {
    ...base, ...o.chapter,
    theme: 'mandelbrot',
    art: o.art || 'whole-set',
    accent: o.accent || base.accent,
    pages: o.pages || 4,
    fileName: o.fileName,
    lessons: specs.map((s) => lessonBlend({ ...s, skills: make(o.skills, s.code), inline: o.inline, ...((o.more || {})[s.code] || {}) })),
  };
};
