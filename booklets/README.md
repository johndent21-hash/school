# Maths lesson booklet builder

This folder builds printable A4 lesson booklets as PDFs, plus a teacher answer key. The booklets use the Kingscliff High School Year 7 layout and artwork by **Marni Tuala**.

The finished example is **Year 7 Chapter 10: Analysing data** (`year7/ch10-analysing-data/`). Open its PDF to see what the builder produces.

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

This writes two PDFs into that chapter folder: the student booklet and `...-Answers.pdf`.

The build also checks the layout (`lib/check.js`) and prints a warning if:
- anything overflows a page, or spills out of the panel or box it sits in
- two blocks overlap, or text is cut off or runs into its answer box
- a working box, answer box, grid or template is too small to write in
- anything runs into a tear-off exit ticket

Fix the warnings before printing. Usually that means moving or shortening a question.

To try the commented starter lesson, run `npm run example`.

## 2b. Individual lesson booklets

The same command also makes a separate 10-page booklet for every lesson, in the chapter's `individual/` folder. Each one has:
- its own cover
- a **Before you start** page: what to bring, the syllabus outcome, a page-by-page lesson map with tick boxes, and a 4-question warm-up
- the lesson itself
- its own answer key, which includes the warm-up answers

The warm-up questions, the equipment list and the outcome for each lesson are in the chapter's `standalone.js`.
To build only the whole-chapter booklet, add `--no-individual`.

## 3. Make a new chapter

1. Copy `examples/starter-chapter` to a new folder, for example `year7/ch11-algebra`.
2. Edit `chapter.js`. Set the chapter number, the title, the PDF file name, the "In this chapter you will" goals and the syllabus outcomes. The cover, spine, contents and headers all update from this file.
3. In `lessons/`, write one file per exercise. Start from `0-01.js`, which explains every part of a lesson. For full lessons to copy from, see `year7/ch10-analysing-data/lessons/`.
4. List the lesson files, in order, in `chapter.js`, and add each lesson's warm-up to `standalone.js`.
5. Run `node build.js year7/ch11-algebra`.

## 4. The lesson format (keep it the same across the series)

Each lesson has these parts, in this order:

1. **Start here:** learning intentions, success criteria, 1–3 key terms (blank lines for the definitions), and a notes box.
2. **Level 1:** two **WE DO** teacher examples, then two **YOU DO** sets of 10 easy questions.
3. **Level 2:** two WE DO examples, then one YOU DO set of 10 questions.
4. **Level 3:** two WE DO examples, then one YOU DO set of 10 questions.
5. **Extension:** one worked example, then 2–3 extension questions.
6. **Lesson summary:** a worked example for every level, for students who missed the lesson.
7. **Show off your skill:** a tear-off exit ticket with a Level 1, 2 and 3 question. Students choose one.

Colour rules. These are what make the booklet easy for students to follow:

| Panel | Colour | Meaning |
|---|---|---|
| **WE DO** | Charcoal border, grey background | Copy the teacher's working from the board |
| **YOU DO** | Blue border, pale blue background | Work on your own |
| Level banners, summary | Sand (neutral) | Headings only |

Never use charcoal or blue for anything else.

Page rules. The build enforces these:
- Every lesson has an **even** number of pages (usually 8), so each lesson starts on a right-hand page when printed double-sided.
- The exit ticket (`L.exitTicket`) goes at the bottom of the **second-last** page of the lesson.
- The last page ends with `L.tearBack()`, which leaves the back of the ticket blank.
- Give each question enough room. The usual lesson is 8 pages: start page, Level 1 sets, Level 2 examples, Level 2 set, Level 3 examples, Level 3 set, extension and exit ticket, summary. Add pages rather than squeeze boxes.
- Working boxes have no lines in them. Students draw on grid paper or on the templates provided.

## 5. Building blocks (in `lib/`)

| File | What it gives you |
|---|---|
| `layout.js` | `qsGrid` (short answers), `qGrid` (questions with working boxes), `extension`, `L.summary`, `L.page`, `L.intro`, `L.notes`, `banner(level)`, `weDo(...)`, `youDo(text, ...)`, `q` (question with working box), `qs` (short answer with small box), `qDraw` (question with drawing area), `example`, `worked`, `split` (two columns), `graphCard`, `L.exitTicket`, `L.tearBack`, `L.summaryBanner` |
| `graphs.js` | Graphs: `pictureGraph`, `columnGraph` (including misleading axes), `lineGraph`, `sectorGraph`, `dividedBar`, `dotPlot`, `stemLeaf`, `backToBack`, `table`. Drawing templates: `gridPaper`, `dotPlotTemplate`, `stemLeafTemplate`, `backToBackTemplate`. |
| `stats.js` | `mean`, `median`, `modeText`, `range`, `fmt` (rounds to 2 decimal places), `expand` (turns a frequency table into a list of values), `fromStemLeaf`. Use these to work out answers so the answer key is always correct. |
| `theme.css` | All colours, fonts and spacing. The colours come from the artwork. |

Layout classes you can use in lesson files:
- `short-grid`: 10 short answers in 2 columns
- `short-list`: 10 short answers beside a graph
- `work-grid`: 10 questions with working boxes. Add `r2`, `r3` or `r4` for fewer rows, and `c3` for 3 columns.
- `stack`: questions in a column
- `ex-row` / `ex-row tall`: the height of the WE DO example boxes
- `grow` (on a panel): the panel fills the rest of the page

`{{L1}}`, `{{L2}}` and so on in a lesson's text are replaced with the page number of that lesson's first page, second page, and so on.

## 6. Assets and acknowledgements

- `assets/marni-tuala-artwork.jpg`: artwork by **Marni Tuala**. It is used with permission for this school's booklets. Always keep the credit on the cover, on page 2 and in every page footer. Check with the school before using it anywhere else.
- `assets/kingscliff-logo.png`: the school logo.
- `assets/lexend-*.woff2`: the Lexend font, chosen for readability (SIL Open Font License).
- The Acknowledgement of Country is on the inside cover, in `build.js`. Check the wording with your school.

## 7. Using an AI assistant (optional)

If you use Claude, or a similar assistant that can run code, you can hand it this folder and ask it to make a new chapter. For example:

> Using this booklet builder, make Chapter 11 from the attached exercise list. Follow the lesson format and colour rules in README.md, start from examples/starter-chapter, build it, and fix any warnings.
