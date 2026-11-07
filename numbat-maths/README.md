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
  questions (`calc: 'trig'`), with a ° ′ ″ key for angles in degrees and minutes, so other questions keep a shorter
  calculator that fits on the screen. Arithmetic is exact (fractions are kept as fractions, using whole-number ratios),
  so 1/3 + 1/6 gives 1/2, not 0.5000000001.
- **Fraction answers** (`AnswerBox.tsx`): in Years 7–9 every fraction answer is typed into stacked boxes, a top box and a
  bottom box, plus a whole-number box for mixed numerals (shown when the answer must be mixed, or on request). A minus sign
  goes at the front. Typing "/" or a space moves to the next box, so "2 1/3" typed straight through still works.
- **Fraction calculator** (`Calculator.tsx`): on a calculator-allowed question whose answer is a fraction, the calculator
  gets a fraction key (a stacked fraction with an empty box on top and underneath), a mixed-numeral key, ◂ ▸ to move between
  boxes, and F⇄D, which shows the result as a fraction, then a mixed numeral, then a decimal. "Put … in my answer box"
  fills the stacked answer boxes. Other questions keep the ordinary scientific keys, and fraction sums practised by hand
  stay calculator-free.
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
  (Ex 11.01–11.11) and a 16-question topic test in the order of Test Yourself 11. Ex 11.09 Direct variation is Path content
  (MA5-RAT-P-01) and, like Power plus, is labelled Extension. The distance, midpoint and gradient formulas are shown as
  optional (Path) notes, as in the textbook; questions can all be done by counting the run and rise.
- **Textbook alignment, Year 9 Algebra** (`src/content/y9-ncm1.ts`): follows New Century Maths 9 Chapter 1 (Ex 1.01–1.09,
  Power plus as an extension, and a 16-question test in the order of Test Yourself 1). New answer forms in the marking:
  `lowestTerms` (a single fraction with nothing left to cancel, so 4r/10 is "not finished") and `negFactorised` (the
  negative HCF taken out). A denominator typed without brackets, such as 12/cd, gets a message asking for 12/(cd).
- **Textbook alignment, Year 9 Pythagoras’ theorem** (`src/content/y9-ncm2.ts`, diagrams in `src/lib/maths/diagrams6.ts`):
  follows New Century Maths 9 Chapter 2 (Ex 2.01–2.08, Power plus as an extension, a 16-question test in the order of
  Test Yourself 2). A new Year 9 topic; the Year 8 Pythagoras topic is unchanged. Every triangle, rectangle and
  trapezium is drawn to scale from the question's own numbers (squashed ones and 3D drawings say "Diagram not drawn
  to scale."). A calculator opened above multiple-choice options is a little shorter, so the choices and Check still fit.
- **Textbook alignment, Year 9 Numeracy and calculation** (`src/content/y9-ncm3.ts`): follows New Century Maths 9
  Chapter 3 (Ex 3.01–3.09, Power plus as an extension, a 16-question test in the order of Test Yourself 3). Simple
  interest moved here from the Year 9 "Earning money" topic. Recurring decimals use dot notation (`.rec` in
  `src/maths.css`: a dot over the first and last repeating digits).
- **Textbook alignment, Year 9 Trigonometry** (`src/content/y9-ncm4.ts`): follows New Century Maths 9 Chapter 4
  (Ex 4.01–4.07, Power plus as an extension, a 16-question test in the order of Test Yourself 4), replacing the old
  Year 9 trigonometry topic, and now sits straight after Numeracy and calculation. Outcome MA5-TRG-C-01. Angles of
  elevation and depression and bearings (MA5-TRG-C-02, also Stage 5 core) are left to Year 10 by NCM 9, so they are
  not in Year 9 any more. Ex 4.03’s draw-and-measure tasks give the measurements instead. Triangles are drawn to scale
  from their own angle, with the angle marked (`angles` in `fig`, `diagrams6.ts`). New answer kind `dms` (an angle in
  degrees and minutes, or seconds): it accepts 36°52′, 36°52', 36 52, and gives hints for a decimal angle, missing
  minutes or unrounded seconds; the keypad gets ° and ′ (and ″) keys.
- **Textbook alignment, Year 9 Indices** (`src/content/y9-ncm5.ts`): follows New Century Maths 9 Chapter 5 (Ex 5.01–5.09,
  Power plus as an extension, a 16-question test in the order of Test Yourself 5 without its Path question), replacing the
  old Year 9 indices topic. Index laws are MA5-IND-C-01 (algebraic terms with positive and zero indices, negative indices
  with numbers); negative indices with pronumerals are Path content (MA5-IND-P-01), so they are a separate extension skill.
  Significant figures and scientific notation are MA5-MAG-C-01 (the old topic said MA5-NUM-C-01, which isn’t a NESA code).
  New expression form `negativeIndex` (“write using a negative index”: 5k^-2, not 5/k^2). Number marking now compares
  relative to the size of the numbers, so 0.000 000 03 is no longer accepted for 0.000 000 030 2.
- **Textbook alignment, Year 9 Geometry and networks** (`src/content/y9-ncm6.ts`): follows New Century Maths 9 Chapter 6.
  A new Year 9 topic, after Indices. 6.01 Triangle geometry and 6.02 Quadrilateral geometry are Stage 4 content that
  NCM 9 revisits (MA4-GEO-C-01, MA4-ANG-C-01); 6.03 Networks and 6.04 Planar graphs and Euler’s formula are Path
  (MA5-NET-P-01), so they are extension skills, as is Power plus. The 12-question test uses 6.01 and 6.02 only. Angle
  diagrams are drawn to scale from the question's own angles (reflex angles and parallel arrows added to `fig`), and
  network diagrams keep every edge clear of vertices it doesn't join.
- **Textbook alignment, Year 9 Equations** (`src/content/y9-ncm7.ts`): follows New Century Maths 9 Chapter 7 (Ex 7.01–7.06,
  Power plus as an extension, a 16-question test in the order of Test Yourself 7), replacing the old Year 9 equations
  topic. Linear equations, problems and formulas are MA5-EQU-C-01. 7.05 (ax² = c) is an extension skill tagged
  MA5-EQU-P-01, because NESA puts quadratic equations in the Path outcomes (not confirmed for ax² = c: the NESA site
  is blocked from the build environment); NCM 9 doesn't mark it PATH. Non-whole solutions are typed as fractions (or
  exact decimals).
- **Textbook alignment, Year 9 Earning money** (`src/content/y9-ncm8.ts`): follows New Century Maths 9 Chapter 8
  (Ex 8.01–8.05, Power plus as an extension, a 16-question test in the order of Test Yourself 8), replacing the old Year 9
  earning money topic. MA5-FIN-C-01. Tax uses the **2026–27 resident rates** (nil to $18 200; 15%; $4020 + 30% over
  $45 000; $31 020 + 37% over $135 000; $51 370 + 45% over $190 000) plus the 2% Medicare levy, worked in whole cents,
  with the year on every table; the textbook prints the 2023–24 table. The rates were checked against several
  sources that agree with the legislated change (the ATO site is blocked from the build environment). Each question
  says whether to use 52 or 52.18 weeks a year, as NCM 9 does.
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
  can be tried without log-ins; changes are switched off there. Each made-up student has their own random stream, so the
  students meant to stand out (struggling, declining, never logged in) do so on every day of the week.

The live app is built on Macaly (TanStack Start + Convex). This folder is the source of truth for the parts written here:

| Folder | What it is | Where it lives in the Macaly app |
| --- | --- | --- |
| `src/content/` | Years 7–9: 38 topics, 186 skills. Years 1–2 (Stage 1): 18 topics, 50 skills (`y1*.ts`, `y2*.ts`). Years 3–4 (Stage 2): 21 topics, 75 skills (`y3*.ts`, `y4*.ts`). Each skill is a question generator with Foundation / Standard / Challenge levels | `src/content/` |
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
npx tsx tests/ncm9-ch4.test.ts               # Year 9 Trigonometry: answers re-worked from the triangle read back out of each diagram
npx tsx tests/gallery-ncm9-4.ts              # screenshots of Chapter 4 (Year 9) questions
npx tsx tests/ncm9-ch5.test.ts               # Year 9 Indices: question and answer evaluated at random values; sig figs and scientific notation re-done exactly
npx tsx tests/gallery-ncm9-5.ts              # screenshots of Chapter 5 (Year 9) questions
npx tsx tests/ncm9-ch6.test.ts               # Year 9 Geometry and networks: every angle measured back from the drawing; networks re-worked
npx tsx tests/gallery-ncm9-6.ts              # screenshots of Chapter 6 (Year 9) questions
npx tsx tests/ncm9-ch7.test.ts               # Year 9 Equations: equation read off the page, answer substituted back; problems re-worked
npx tsx tests/gallery-ncm9-7.ts              # screenshots of Chapter 7 (Year 9) questions
npx tsx tests/ncm9-ch8.test.ts               # Year 9 Earning money: re-worked from the words; tax with a separate bracket-by-bracket calculation
npx tsx tests/gallery-ncm9-8.ts              # screenshots of Chapter 8 (Year 9) questions
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
node qa/fraction-calc-check.mjs  # (same server) stacked fraction boxes, fraction and mixed keys, F⇄D, "Put … in my answer box"
node qa/dms-check.mjs            # (same server) degrees and minutes: ° ′ keys on an iPad, "36 52" typed on a laptop
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
