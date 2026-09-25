// STARTER CHAPTER: copy this whole folder to begin a new booklet, e.g. year7/ch11-algebra.
// Everything the cover, inside cover and page headers show comes from here.
module.exports = {
  year: 7,
  stage: 4,
  number: 0,                         // chapter number (shown in the big badge on the cover)
  title: 'Starter chapter',          // chapter title (cover, spine, page headers)
  fileName: 'Starter-Chapter',       // name of the PDFs that are written
  goals: [                           // "In this chapter you will" list on page 2
    'see how every part of a lesson is written',
    'copy this lesson to start your own',
  ],
  syllabus: 'Write the NSW syllabus outcome codes and wording for this chapter here.',
  // One file per lesson, in order. Each lesson MUST have an even number of pages
  // (so every lesson starts on a right-hand page when printed double-sided).
  lessons: ['0-01'].map((f) => require(`./lessons/${f}`)),
};
