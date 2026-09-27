// A worksheet booklet made from a blended chapter (for its title, goals and lesson list) and a content.js of
// worksheet questions (lib/worksheet.js). room.json in the chapter folder holds column rooms set by tools/fit-worksheets.js.
const fs = require('fs'), path = require('path');
const worksheet = require('./worksheet');
const { kit } = require('./drill');

module.exports = (dir, blended, content, { numberLine } = {}) => {
  const file = path.join(dir, 'room.json');
  const rooms = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : {};
  return {
    ...blended,
    format: 'worksheet',
    homework: false,
    fileName: blended.fileName.replace(/-Lessons$/, '-Worksheets'),
    lessons: blended.lessons.map(({ spec }) => {
      if (!content[spec.code]) throw new Error(`no worksheet content for ${spec.code}`);
      return worksheet({ code: spec.code, title: spec.title, numberLine, room: rooms[spec.code] }, content[spec.code](kit(`worksheet ${spec.code}`)));
    }),
  };
};
