// Chapter 1 Integers as three-column worksheets (lib/worksheet.js), one page per lesson, in the style of the
// Freefall Mathematics worksheets. The content (examples, drill, challenge questions) comes from year7-blend.
const worksheet = require('../../lib/worksheet');
const blended = require('../../year7-blend/ch01-integers/chapter.js');

// Scaffolds for the first working lines: [column 2 (first two questions; the third gets "= ___"), column 3 (first question)].
const SCAFFOLD = {
  '1.01': ['−(−a) = a, so ___', 'I know that … so …'],
  '1.02': ['___ to 0, 0 to ___', 'Draw a number line first.'],
  '1.03': ['___ is further right', 'On a number line: …'],
  '1.04': ['= ___ + ___ = ___', 'Number sentence: ___ + ___ = ___'],
  '1.05': ['= ___ + ___ = ___', 'Number sentence: ___ − ___ = ___'],
  '1.06': ['= ___ × ___ = ___', 'Number sentence: ___ × ___ = ___'],
  '1.07': ['= ___ ÷ ___ = ___', 'Number sentence: ___ ÷ ___ = ___'],
  '1.08': ['× ÷ first: ___ = ___', 'Top: ___  Bottom: ___  = ___'],
  '1.09': ['I typed: ___ = ___', 'Estimate: ___ × ___ ≈ ___'],
  '1.10': ['___ + ___ = ___', 'Number sentence: ________ = ___'],
};

module.exports = {
  ...blended,
  format: 'worksheet',
  homework: false,
  fileName: 'Year7-Ch01-Integers-Worksheets',
  lessons: blended.lessons.map((l) => worksheet({ ...l.spec, scaffold: SCAFFOLD[l.spec.code] })),
};
