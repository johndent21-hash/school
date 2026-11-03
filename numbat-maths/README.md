# Numbat Maths

A Mathsonline-style practice site for NSW Years 7–9 (NSW Mathematics K–10 Syllabus, Stage 4 and Stage 5 core),
with optional Years 1–2 (Stage 1) and Years 3–4 (Stage 2).
Lessons with step-by-step worked examples, auto-marked practice sets, topic tests, class codes with student PINs,
a teacher markbook and tasks.

Also:
- **Maths keypad** (`app/src/components/numbat/MathKeypad.tsx`, keys chosen in `src/lib/maths/keypad.ts`): replaces the device
  keyboard on phones and tablets, opens from a button on computers. Keys depend on the answer type and year level only
  (never on the answer itself); Years 1–2 get bigger keys.
- **Calculator** (`Calculator.tsx`, arithmetic in `src/lib/maths/calc.ts`): only on questions marked "Calculator allowed".
  Basic in Year 7; √, x², xʸ, π and Ans from Year 8; sin, cos, tan and their inverses (degrees) on Year 9 trigonometry
  questions (`calc: 'trig'`), so other questions keep a shorter calculator that fits on the screen.
- **Rewards** (`app/src/lib/rewards.ts`, `Rewards.tsx`): levels from points (Joey to Numbat), 19 badges, a weekly goal ring
  (default 3 sets a week, set per class by the teacher) and a streak of weeks in a row the goal was met. All worked out
  from results, so nothing extra is stored.
- **Teacher overview and charts** (`app/src/lib/insights.ts`, `Charts.tsx`): who practised this week, who may need help,
  the skills the class finds hardest, task completion, and week-by-week charts for the class and each student.
- **Lesson ratings** (`app/convex/ratings.ts`, `RatingsSheet.tsx`): a colour-coded sheet where the teacher gives each student
  4 (excellent), 3 (good), 2 (below expectations), 1 (well below) or A (absent) for each lesson. Type or tap; the next student
  is selected after each entry. Students rated below expectations in 2 of their last 3 rated lessons appear under "May need help".
- **Parent view** (`app/src/routes/parent.tsx`, `app/convex/parents.ts`): parents log in at `/parent` with the same class code,
  name and PIN their child uses and get a read-only page with the lesson ratings and Numbat Maths practice. Wrong PINs pause the
  account for 10 minutes, then 20, 40 ... up to a day, so 4-digit PINs can't be guessed by trying them all.
- **Textbook alignment, Year 7 Integers** (`src/content/y7-ncm1.ts`): follows New Century Maths 7 (3rd edition) Chapter 1.
  One skill per exercise (Ex 1.01–1.10, labelled on the site), Power plus as an extension set, and a 12-question topic
  test in the order of Test Yourself 1. The questions are the site's own (no textbook wording or numbers), matching each
  exercise's question types from easy to hard. Questions with many right answers use the `open` answer kind, which checks
  the student's own numbers or calculation against the rule.
- **Textbook alignment, Year 9 Coordinate geometry and graphs** (`src/content/y9-ncm11.ts`, diagrams in
  `src/lib/maths/diagrams5.ts`): follows New Century Maths 9 (3rd edition) Chapter 11 the same way, one skill per exercise
  (Ex 11.01–11.11) and a 12-question topic test in the order of Test Yourself 11. Ex 11.09 Direct variation is Path content
  (MA5-RAT-P-01) and, like Power plus, is labelled Extension. The distance, midpoint and gradient formulas are shown as
  optional (Path) notes, as in the textbook; questions can all be done by counting the run and rise.
- **Textbook alignment, Year 9 Algebra** (`src/content/y9-ncm1.ts`): follows New Century Maths 9 Chapter 1 (Ex 1.01–1.09,
  Power plus as an extension, and a 12-question test in the order of Test Yourself 1). New answer forms in the marking:
  `lowestTerms` (a single fraction with nothing left to cancel, so 4r/10 is "not finished") and `negFactorised` (the
  negative HCF taken out). A denominator typed without brackets, such as 12/cd, gets a message asking for 12/(cd).
- **Textbook alignment, Year 9 Pythagoras’ theorem** (`src/content/y9-ncm2.ts`, diagrams in `src/lib/maths/diagrams6.ts`):
  follows New Century Maths 9 Chapter 2 (Ex 2.01–2.08, Power plus as an extension, a 12-question test in the order of
  Test Yourself 2). A new Year 9 topic; the Year 8 Pythagoras topic is unchanged. Every triangle, rectangle and
  trapezium is drawn to scale from the question's own numbers (squashed ones and 3D drawings say "Diagram not drawn
  to scale."). A calculator opened above multiple-choice options is a little shorter, so the choices and Check still fit.
- **Textbook alignment, Year 9 Numeracy and calculation** (`src/content/y9-ncm3.ts`): follows New Century Maths 9
  Chapter 3 (Ex 3.01–3.09, Power plus as an extension, a 12-question test in the order of Test Yourself 3). Simple
  interest moved here from the Year 9 "Earning money" topic. Recurring decimals use dot notation (`.rec` in
  `src/maths.css`: a dot over the first and last repeating digits).
- **Practice sets** (`app/src/lib/practice.ts`): 20 questions in Years 3–9 (8 Foundation, 8 Standard, 4 Challenge) and
  10 in Years 1–2 (3/4/3). A set never repeats an identical question: when a level runs out of new ones it borrows from
  the nearest level. Each set is built from a seed, so a student can **stop and carry on later** on the same device
  (`app/src/lib/resume.ts`; kept for 21 days, one per skill for each student or guest, and only offered while the set still
  rebuilds the same questions).
- **Focus mode** (`useFocusMode` in `Shell.tsx`, styles in `app.css`): while a practice set or test is being answered, the
  site header, footer and lesson tabs are hidden and, on wide landscape screens (iPads sideways, laptops), the question and
  diagram sit beside the answer box and keypad, so everything needed to answer fits on the screen without scrolling.
  Short screens (under 760 px) get a more compact keypad and calculator.
- **Example class** (`app/src/lib/demo.ts`): in the stand-alone preview the teacher pages use 24 made-up students so they
  can be tried without log-ins; changes are switched off there.

The live app is built on Macaly (TanStack Start + Convex). This folder is the source of truth for the parts written here:

| Folder | What it is | Where it lives in the Macaly app |
| --- | --- | --- |
| `src/content/` | Years 7–9: 37 topics, 165 skills. Years 1–2 (Stage 1): 18 topics, 50 skills (`y1*.ts`, `y2*.ts`). Years 3–4 (Stage 2): 21 topics, 75 skills (`y3*.ts`, `y4*.ts`). Each skill is a question generator with Foundation / Standard / Challenge levels | `src/content/` |
| `src/lib/maths/` | Formatting, answer checking (fractions, expressions, coordinates, scientific notation…), SVG diagrams | `src/lib/maths/` |
| `src/maths.css` | Maths typesetting and diagram styles | `src/maths.css` |
| `app/src/` | Pages, components, session and progress code, theme | `src/` |
| `app/convex/` | Backend: teacher accounts, classes, student PIN log-in, results, tasks | `convex/` |

## Checks

```bash
npm install
npx tsx tests/engine.test.ts                 # answer checker and formatting
N=400 npx tsx tests/content.test.ts          # every generator: self-check + independent re-calculation
STAGE1=1 STAGE2=1 N=300 npx tsx tests/content.test.ts # the same, including Years 1–4
npx tsx tests/primary.test.ts                # Years 1–4: answers recomputed from the drawn diagrams, plus wording checks
STAGE1=1 STAGE2=1 npx tsx tests/practice.test.ts  # set sizes and level mix, same seed = same set, no repeated questions
STAGE1=1 STAGE2=1 npx tsx tests/variety.test.ts   # the widened shape, turn, survey and sampling skills, re-worked independently
ONLY=y8-pyt-hyp K=5 npx tsx tests/dump.ts    # print sample questions for one skill
npx tsx tests/keypad.test.ts                 # every typed answer (Years 1–9) can be entered with the keypad and is marked right
npx tsx tests/calc.test.ts                   # calculator arithmetic, errors and display
npx tsx tests/open.test.ts                   # marking of questions with many right answers
npx tsx tests/ncm7-ch1.test.ts               # Year 7 Integers: every answer re-worked from its data, diagrams read back, wording
npx tsx tests/gallery-ncm1.ts                # screenshots of each kind of Integers question, for a visual check
npx tsx tests/ncm9-ch11.test.ts              # Year 9 Chapter 11: answers re-worked from the printed equations and the diagrams
npx tsx tests/gallery-ncm11.ts               # screenshots of each kind of Chapter 11 diagram question
npx tsx tests/ncm9-ch1.test.ts               # Year 9 Algebra: answers checked against the printed expression at random values
npx tsx tests/gallery-ncm9-1.ts              # screenshots of Chapter 1 (Year 9) questions
npx tsx tests/ncm9-ch2.test.ts               # Year 9 Pythagoras: answers re-worked from the diagrams and the printed numbers
npx tsx tests/gallery-ncm9-2.ts              # screenshots of Chapter 2 (Year 9) questions and diagrams
npx tsx tests/ncm9-ch3.test.ts               # Year 9 Numeracy: answers re-worked from the printed questions
npx tsx tests/gallery-ncm9-3.ts              # screenshots of Chapter 3 (Year 9) questions
TZ=Australia/Sydney npx tsx tests/rewards.test.ts    # levels, Monday weeks (incl. daylight saving), streaks, badges
TZ=Australia/Sydney npx tsx tests/insights.test.ts   # teacher overview numbers, recounted against the example class

cd backend-test && npm install --legacy-peer-deps && ./sync.sh && npx vitest run   # backend logic in memory

cd harness && npm install && ./sync.sh && npm run dev                              # local copy of the site on :3100
node qa/sweep.mjs     # answers every skill's practice set through the browser (needs qa/ids.json)
VITE_STAGE1=1 VITE_STAGE2=1 npm run dev; IDS=qa/ids-s1.json node qa/sweep.mjs     # the same for Years 1–2 (ids-s2.json: Years 3–4)

node qa/keypad-check.mjs    # (with Years 1–4 on) answers questions with the on-screen keypad (phone) and tries the calculator
node qa/rewards-check.mjs                                                          # guest rewards: celebration after a set, home dashboard
VITE_PREVIEW_ONLY=1 npx vite dev --port 3102; node qa/teacher-demo-check.mjs       # example class on the teacher pages
node qa/ncm1-check.mjs        # (dev server) Integers topic page, worked example, 12-question test, open answers on the keypad
node qa/parent-ratings-check.mjs                                                   # (same server) ratings sheet and example parent view
node qa/resume-check.mjs      # (same server) stop a practice set, come back, carry on; finishing clears the saved place
node qa/fit-sweep.mjs ipad    # (Years 1–4 on) every question fits without scrolling: laptop, chromebook, ipad or ipadair

cd harness && ./build-preview.sh out.html                                          # stand-alone preview page (log-ins off)
cd harness && VITE_STAGE1=1 VITE_STAGE2=1 ./build-preview.sh out.html "Numbat Maths 1–9"   # preview with Years 1–4 added
```

Years 1–2 are only included when the site is built with `VITE_STAGE1=1`, and Years 3–4 with `VITE_STAGE2=1`.
Years 1 and 3 follow the syllabus's Part A focus areas and Years 2 and 4 the Part B focus areas; schools may
split each stage differently.

`harness/` and `backend-test/` contain small stand-ins for files the Macaly template provides
(router, Convex provider, generated Convex API) so the site and backend can be tested outside Macaly.
`harness/sync.sh` adds a test-only hook that exposes the current answer to the browser tests; it is never in the app.

## Owner tasks (Convex CLI in the Macaly sandbox)

- Reset a teacher's password: `npx convex run admin:resetTeacherPassword '{"email":"…","newPassword":"…"}'`
- Remove a teacher and all their classes: `npx convex run admin:deleteTeacherByEmail '{"email":"…"}'`
- Teachers need the staff access code (Convex environment variable `TEACHER_SIGNUP_CODE`) to create an account.
