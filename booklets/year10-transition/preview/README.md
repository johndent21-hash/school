# Lesson previews

Build one lesson on its own while you write it (no cover, no inside cover):

```
mkdir -p year10-transition/preview/1.4
echo "module.exports = require('../../ch01-financial-maths/chapter.js').only('1.4');" > year10-transition/preview/1.4/chapter.js
node build.js year10-transition/preview/1.4 --shots /tmp/shots
```

The preview folders are not committed (see `.gitignore`).
