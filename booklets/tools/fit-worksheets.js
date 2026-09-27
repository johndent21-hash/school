// Builds a worksheet booklet and, while any page fails the layout check, lowers the column room of the lessons on
// those pages (by 8 mm a round) and builds again. The rooms are saved in the chapter folder as room.json.
//   node tools/fit-worksheets.js year7-worksheets/ch02-angles
const { execSync } = require('child_process');
const fs = require('fs'), path = require('path');
const dir = process.argv[2], file = path.join(dir, 'room.json');
for (let round = 1; round <= 10; round++) {
  const out = execSync(`node build.js ${dir} 2>&1`, { cwd: path.join(__dirname, '..') }).toString();
  // Only space problems (overflow, cut-off text, content running off the page or into the tear zone) change the rooms.
  const bad = [...out.matchAll(/^\s*page (\d+): .*(overflow|cut off|runs off|spills|tear)/gm)].map((m) => +m[1]).filter((p, i, a) => a.indexOf(p) === i);
  if (!bad.length) { const other = [...out.matchAll(/^\s*page \d+: .*/gm)].map((m) => m[0].trim()); console.log(`${dir}: fits (round ${round})${other.length ? `; other problems:\n  ${other.join('\n  ')}` : ''}`); process.exit(0); }
  delete require.cache[require.resolve(path.resolve(dir, 'chapter.js'))];
  const chapter = require(path.resolve(dir, 'chapter.js'));
  const rooms = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : {};
  bad.forEach((p) => { const l = chapter.lessons[p - 3]; if (!l) return; rooms[l.code] = (rooms[l.code] || l.room) - 8; });
  fs.writeFileSync(file, JSON.stringify(rooms, null, 1));
  console.log(`round ${round}: pages ${bad.join(', ')} → ${JSON.stringify(rooms)}`);
}
console.log(`${dir}: still has problems`); process.exit(1);
