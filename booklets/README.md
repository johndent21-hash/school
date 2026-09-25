# Year 7 Mathematics booklets

Printable A4 lesson booklets for Kingscliff High School, themed with artwork by Marni Tuala.

## Chapter 10: Analysing data

`year7/ch10-analysing-data/Year7-Ch10-Analysing-Data.pdf`: 42-page student booklet. It has a cover, a "how to use this booklet" page with contents, and one lesson per exercise (10.01 to 10.08).
`year7/ch10-analysing-data/Year7-Ch10-Analysing-Data-Answers.pdf`: teacher answer key. Statistics answers are calculated by the build script, not typed.

Print double-sided. Every lesson starts on a right-hand page, and each exit ticket backs onto a blank area of the next page.

## Adding another chapter

1. Copy `year7/ch10-analysing-data` to a new folder, e.g. `year7/ch11-...`.
2. Edit `chapter.js` (number, title, goals, syllabus) and write one file per lesson in `lessons/`.
3. Run `node booklets/build.js year7/ch11-...` (needs Playwright installed globally).

Shared code lives in `lib/`: `layout.js` (pages, WE DO / YOU DO panels, questions, exit tickets), `graphs.js` (graphs and drawing templates), `stats.js` (mean, median, mode, range) and `theme.css`.
The build warns about any page that overflows, any working box that is too small, and anything that runs into the tear-off area.
