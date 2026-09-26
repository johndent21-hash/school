# Maths lesson booklet builder

This folder builds printable A4 lesson booklets as PDFs, plus a teacher answer key. The booklets use the Kingscliff High School Year 7 layout and artwork by **Marni Tuala**.

There is one booklet per chapter of the Year 7 textbook (`year7/ch01-integers` to `year7/ch12-ratios-rates-time`). Each has one lesson for every exercise in that chapter's Test Yourself, and each lesson fits a one-hour period in 4 pages. Every chapter has its own colour and number on the cover, spine and page headers, so the booklets are easy to tell apart.

---

## 1. One-time setup

You need a computer running Windows, macOS or Linux.

1. Install **Node.js**, the LTS version, from <https://nodejs.org>.
2. Unzip this folder somewhere, for example `Documents/booklets`.
3. Open a terminal in that folder:
   - Windows: right-click the folder and choose "Open in Terminal".
   - Mac: right-click, then Services, then "New Terminal at Folder".
4. Run this once. It downloads the tools used to make PDFs, about 150 MB:

   ```
   npm run setup
   ```

## 2. Build a booklet

```
node build.js year7/ch10-analysing-data
```

To build all 12: `npm run build:all`.

This writes two PDFs into that chapter folder: the student booklet and `...-Answers.pdf` (teacher copy).

The build also checks the layout (`lib/check.js`) and prints a warning if:
- anything overflows a page, or spills out of the panel or box it sits in
- two blocks overlap, or text is cut off or runs into its answer box
- a working box, answer box, grid or template is too small to write in, or a diagram is squashed
- anything runs into a tear-off exit ticket

Fix the warnings before printing. Usually that means shortening a question, using `keepShort`, or removing one item.

## 3. Make a new chapter

1. Copy `examples/starter-chapter` to a new folder, for example `year7/ch13-something`.
2. Edit `chapter.js`: the chapter number, title, `accent` colour, PDF file name, goals and syllabus outcomes. The cover, spine, contents and headers all update from this file.
3. Write one `lesson({...})` per exercise. The starter file explains every field. For real lessons to copy from, see any `year7/ch*/chapter.js`.
4. Run `node build.js year7/ch13-something` and fix any warnings.

Chapter colours already used (keep new ones different, and never blue or charcoal):
1 red `#c0392b`, 2 orange `#e67e22`, 3 gold `#b7950b`, 4 green `#229954`, 5 teal `#148f77`, 6 purple `#7d3c98`, 7 pink `#d63384`, 8 brown `#8d5524`, 9 olive `#6b8e23`, 10 cyan `#00838f`, 11 wine `#7b1f4b`, 12 mauve `#6c5b7b`.

## 4. The lesson format (keep it the same across the series)

Each lesson is 4 pages and one hour. `lib/lesson.js` builds it from plain data, so every lesson has the same shape:

| Page | Contents |
|---|---|
| 1 | **Start here:** learning intentions, success criteria, 1–3 key terms (blank lines for definitions), notes box. **Level 1:** WE DO Examples 1–2, YOU DO Set A |
| 2 | YOU DO Set B. **Level 2:** WE DO Examples 3–4, YOU DO Set C |
| 3 | **Level 3:** WE DO Examples 5–6, YOU DO Set D, then the tear-off **Show off your skill** exit ticket (Level 1, 2 and 3 question; students choose one) |
| 4 | **Extension:** a worked example and 2 questions. **Lesson summary:** the steps plus a worked example for every level, for students who missed the lesson. The bottom of the page is left blank (the back of the exit ticket). |

Colour rules. These are what make the booklet easy for students to follow:

| Panel | Colour | Meaning |
|---|---|---|
| **WE DO** | Charcoal border, grey background | Copy the teacher's working from the board |
| **YOU DO** | Blue border, pale blue background | Work on your own |
| Level banners, summary | Sand (neutral) | Headings only |
| Chapter accent | One colour per chapter | Cover, spine, badges and page headers only |

Working boxes have no lines in them. Students draw on the grids, number planes and templates provided.

The build checks that every question has an answer and stops with a message if a count does not match.

## 5. Building blocks (in `lib/`)

| File | What it gives you |
|---|---|
| `lesson.js` | The 4-page lesson template. See the comment at the top and `examples/starter-chapter/chapter.js`. |
| `diagrams.js` | Maths diagrams: `numberLine`, `angle`, `rays`, `parallel` (lines cut by a transversal), `polygon` and `fit` (any shape with side, angle and vertex labels, ticks, right angles), `grid` (transformations), `plane` (number plane), `box`, `triPrism`, `prism`, `circle`, `spinner`, `squares`, `fractionBar`, `drawSpace`. |
| `graphs.js` | Statistics graphs: `pictureGraph`, `columnGraph`, `lineGraph` (also travel graphs), `sectorGraph`, `dividedBar`, `dotPlot`, `stemLeaf`, `backToBack`, `table`. Templates: `gridPaper`, `dotPlotTemplate`, `stemLeafTemplate`, `backToBackTemplate`. |
| `calc.js` | `ev('3 × (−4) + 2')` works out answers written the way they appear in the booklet; fraction helpers (`add`, `sub`, `mul`, `div`, `simp`, `mixed`) and `F(n, d)` for a stacked fraction. |
| `stats.js` | `mean`, `median`, `modeText`, `range`, `fmt`, `expand`, `fromStemLeaf`, `toStemLeaf`. |
| `layout.js` | The page, panel and question building blocks that `lesson.js` uses. |
| `check.js` | The layout checker. |
| `theme.css` | All colours, fonts and spacing. The colours come from the artwork. |

Useful set options in a lesson: `kind: 'short' | 'work'`, `cols`, `keepShort` (keep small answer boxes in a panel that fills the page), `stack` (diagram above its box), `figSide` with `fig` (a big graph or map with the questions listed beside it). An item or example can be text, `{ t, fig }` (with a diagram) or `{ t, draw }` (with a drawing space instead of a box).

## 6. Assets and acknowledgements

- `assets/marni-tuala-artwork.jpg`: artwork by **Marni Tuala**. It is used with permission for this school's booklets. Always keep the credit on the cover, on page 2 and in every page footer. Check with the school before using it anywhere else.
- `assets/kingscliff-logo.png`: the school logo.
- `assets/lexend-*.woff2`: the Lexend font, chosen for readability (SIL Open Font License).
- The Acknowledgement of Country is on the inside cover, in `build.js`. Check the wording with your school.

## 7. Using an AI assistant (optional)

If you use Claude, or a similar assistant that can run code, you can hand it this folder and ask it to make a new chapter. For example:

> Using this booklet builder, make a booklet from the attached Test Yourself, one 4-page lesson per exercise. Follow the lesson format and colour rules in README.md, start from examples/starter-chapter, build it, and fix any warnings.
