// A worksheet booklet made from a blended chapter (for its title, goals and lesson list) and a content.js of
// worksheet questions (lib/worksheet.js). room.json in the chapter folder holds column rooms set by tools/fit-worksheets.js.
const fs = require('fs'), path = require('path');
const worksheet = require('./worksheet');
const { kit } = require('./drill');

// twoPage: the two-page lessons of lib/worksheet2.js (content gives six steps a lesson).
module.exports = (dir, blended, content, { numberLine, twoPage } = {}) => {
  const file = path.join(dir, 'room.json');
  const rooms = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : {};
  return {
    ...blended,
    format: 'worksheet',
    calm: Object.values(content).every((c) => c.steps), // every lesson written out in full (lib/worksheet3.js)
    homework: false,
    fileName: blended.fileName.replace(/-Lessons$/, '-Worksheets'),
    lessons: blended.lessons.map(({ spec }) => {
      if (!content[spec.code]) throw new Error(`no worksheet content for ${spec.code}`);
      // A lesson written out in full ({ steps }) uses the calm template, lib/worksheet3.js.
      if (content[spec.code].steps) return require('./worksheet3')({ code: spec.code, title: spec.title, numberLine }, content[spec.code].steps);
      return (twoPage ? require('./worksheet2') : worksheet)({ code: spec.code, title: spec.title, numberLine, room: rooms[spec.code] }, content[spec.code](kit(`worksheet ${spec.code}`)));
    }),
  };
};
