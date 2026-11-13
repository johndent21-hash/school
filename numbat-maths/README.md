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
- **Textbook alignment, Year 7 Angles** (`src/content/y7-ncm2.ts`, diagrams in `src/lib/maths/diagrams12.ts`): follows
  New Century Maths 7 Chapter 2 (Ex 2.01–2.11, Power plus as an extension, an 18-question test in the order of Test
  Yourself 2), replacing the old three-skill Angles topic (its mixed angle-relationships set is kept as "Extra practice").
  Every angle is drawn at its true size: a protractor with both scales (it uses the card's full width on a phone), angles
  named by letters, and two lines crossed by a transversal at any tilt, parallel or (for Ex 2.11) a few degrees off.
  Drawing and compass construction tasks can't be marked on screen, so they become reading, choosing and reasoning
  questions about the same ideas.
- **Textbook alignment, Year 7 Area and volume** (`src/content/y7-ncm8.ts`): follows New Century Maths 7 Chapter 8
  (Ex 8.01–8.13, Power plus as an extension, an 18-question test in the order of Test Yourself 8), replacing the old
  five-skill topic (same topic id, `y7-area-volume`, so the Chapter 8 class games still link to it; each game set now
  points at its own exercise's lesson). Flat shapes are drawn to scale, with dashed heights labelled on the line itself;
  drawings of solids say "Diagram not drawn to scale." Ruler, dot-paper and centicube tasks become reading, choosing and
  reasoning questions about the same ideas.
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
- **Textbook alignment, Year 9 Analysing data** (`src/content/y9-ncm9.ts`, displays in `src/lib/maths/diagrams9.ts`):
  follows New Century Maths 9 Chapter 9 (Ex 9.01–9.05, with the census and sampling part of 9.05 and all of 9.06 as Path
  extension skills, Power plus as an extension, a 12-question test in the order of Test Yourself 9), replacing the old
  Year 9 data topic (quartiles and box plots leave Year 9, as in NCM 9). MA4-DAT-C-01 and MA4-DAT-C-02 (Stage 4 content
  that NCM 9 teaches in Year 9); Path work MA5-DAT-P-01. New displays: a frequency histogram with a frequency axis and an
  optional frequency polygon, and ordered, unordered and back-to-back stem-and-leaf plots. Drawing tasks become reading
  and choosing questions. An outlier is a lowest or highest value whose gap to the next value is at least 4 and at least
  twice every other gap; "mean versus median" questions only use data where the mean really is pulled towards the tail
  (with small whole-number data a skewed shape can have the mean on the other side of the median).
- **Textbook alignment, Year 9 Surface area and volume** (`src/content/y9-ncm10.ts`, diagrams in
  `src/lib/maths/diagrams10.ts`): follows New Century Maths 9 Chapter 10 (Ex 10.01–10.09, Power plus as an extension, a
  16-question test in the order of Test Yourself 10), replacing the old Year 9 measurement topic. Outcomes:
  MA5-MAG-C-01 (units, precision, absolute and percentage error), MA4-LEN-C-01 and MA4-ARE-C-01 (composite shapes,
  quadrilaterals, circles and sectors), MA5-ARE-C-01 (composite areas, surface area of prisms and cylinders),
  MA4-VOL-C-01 and MA5-VOL-C-01 (volume and capacity). Percentage error was not found in the K–10 syllabus wording that
  could be reached; it is kept as core because NCM 9 teaches it as a core section. New diagrams: a measuring scale,
  sectors drawn at their true angle, a rectangle with a quadrant, and trapezoidal, tent and half-cylinder prisms.
  Measurements keep the decimal places their precision implies (20.10 m to the nearest 0.01 m).
- **Class games** (`/games` and `/game`; `app/src/routes/games.tsx`, `game.tsx`, `components/numbat/GameBoard.tsx`,
  `app/src/lib/board.ts`, styles in `app/src/game.css`): a five-minute team game for the whole class, played on the board
  with no student devices, to finish a lesson on one textbook exercise. Every team answers every question (four choices,
  A to D, on mini whiteboards); the teacher shows the answer and ticks each team that got it right; each of those teams
  digs up a log: mostly termites (points), sometimes a surprise (double dig, golden log, an echidna that got there first,
  a raid on the leading team, or a leapfrog over the team just ahead). Set-up is one page: 2 to 6 teams, 5 to 15
  questions, 10 to 45 seconds a question or no timer, and a "see the questions first" list for the teacher. Keys: Space or
  Enter for the next step, 1 to 6 to tick a team, A for all teams, P to pause the timer. The game's place is kept on the
  device (`numbat.game`), so a refresh or a sleeping laptop loses nothing, and "Undo this dig" fixes a mis-tick. The end
  screen ranks the teams and lists the questions the fewest teams got right.
  - **Questions** (`src/content/games/`, types in `src/lib/game/types.ts`): one set for each exercise, organised
    book → chapter → exercise. These are separate from the lessons' practice questions: every game question is ONE step,
    done in the head in about 15 seconds with friendly numbers, and its wrong choices are the answers the usual mistakes
    give. The questions are the site's own; none of the textbook's wording or numbers are copied. New Century Maths 7,
    all twelve chapters (each chapter also has a whole-chapter mix that takes one question from each exercise in
    textbook order). A question's details (`meta`) may not use the key `t`, which holds its kind; `gq()` refuses it:
    - **Chapter 1, Integers** (`ncm7-ch1.ts`, Ex 1.01–1.10, 34 kinds), MA4-INT-C-01. Ex 1.09 (integers and the
      calculator) is played without calculators, so its game practises estimating and checking signs.
    - **Chapter 2, Angles** (`ncm7-ch2.ts`, Ex 2.01–2.11, 29 kinds), MA4-ANG-C-01. Drawings are measured by the test:
      each size written on a drawing is checked against the angle as drawn.
    - **Chapter 3, Whole numbers** (`ncm7-ch3.ts`, Ex 3.01–3.12, 32 kinds), MA4-IND-C-01 (3.04, 3.07–3.10) and
      MA4-FRC-C-01 (3.11 highest common factor). 3.01–3.03 (rounding, multiplying, dividing) are revision of Stage 3 and
      are marked so; 3.05 (long division), 3.06 (Roman numerals, not in the K–10 syllabus) and 3.12 (lowest common
      multiple: the Stage 4 content names the HCF but not the LCM) are starred as extension in the textbook, and the
      games say so.
    - **Chapter 4, Fractions and percentages** (`ncm7-ch4.ts`, Ex 4.01–4.12, 41 kinds), MA4-FRC-C-01. "Simplest form"
      questions offer a partly simplified fraction as a wrong choice; every other wrong choice differs in value from the
      answer. Ex 4.09 (fractions and the calculator) is played without calculators, so its game practises estimating
      (every exact answer is within 0.4 of a whole number, so the nearest whole number is never in doubt).
    - **Chapter 5, Algebra and equations** (`ncm7-ch5.ts`, Ex 5.01–5.13, 40 kinds), MA4-ALG-C-01 (5.01–5.09) and
      MA4-EQU-C-01 (5.10–5.13). 5.01–5.02 use the commutative, associative and distributive laws with numbers, as the
      textbook does; the syllabus point is their generalisation to algebra, which 5.03–5.09 practise. Algebra is shown
      with ex() (italic pronumerals, number first, letters in alphabetical order). The test reads every expression back
      off the page with its own parser and compares options by evaluating them at four sets of values, so a wrong
      option that is secretly equal to the answer is caught; it found a real slip while the set was being written
      (x ÷ a = b marked b instead of ab).
    - **Chapter 6, Geometrical figures** (`ncm7-ch6.ts`, Ex 6.01–6.10, 23 kinds), MA4-GEO-C-01 (6.05–6.10).
      6.01–6.04 (transformations, line and rotational symmetry) have no Stage 4 content point: they are Stage 3
      content (two-dimensional spatial structure), and Stage 5 returns to them on the number plane (path
      MA5-LIN-P-01), so those games are marked as revision. (The Stage 3 placement was confirmed from a web search of
      the NSW Curriculum site; the site itself could not be opened from the build machine.) Every drawing is measured
      by the test: grid shapes sit on grid points and have no symmetry of their own, so translation, reflection and
      rotation can never be confused, and a "reflection" must be a true mirror image; axes and order of symmetry are
      found by reflecting and rotating the drawn vertices; each angle label is matched to its corner and must agree
      with the drawn angle to within 1°; quadrilaterals are named from their measured sides, parallel sides and right
      angles, and their tick, arrow and right-angle marks checked.
    - **Chapter 7, Decimals** (`ncm7-ch7.ts`, Ex 7.01–7.11, 28 kinds), MA4-FRC-C-01; 7.03 (adding and subtracting
      decimals) is Stage 3 content and marked as revision. Decimals are built from whole numbers, so every answer is
      exact; the test reads each number back as an exact fraction, rounds half up on the digits, and turns recurring
      decimals (dot notation, `.rec`) back into fractions to find the one option equal to the question's fraction.
    - **Chapter 8, Area and volume** (`ncm7-ch8.ts`, Ex 8.01–8.13, 84 kinds). Outcomes: MA4-LEN-C-01 (8.02 perimeter, 8.03
    circumference), MA4-ARE-C-01 (8.04–8.08) and MA4-VOL-C-01 (8.09 views and cross-sections of prisms, 8.10–8.13).
    Syllabus notes: 8.01's length, mass and time conversions are revision of earlier stages (only kL and ML are Stage 4);
    the textbook's questions on the meaning of prefixes are left out, because the syllabus places prefixes in Stage 5
    (MA5-MAG-C-01); square kilometres (in the syllabus, but only in the hardest questions of Ex 8.04) are left out of the
    quick game; estimates of a circumference use π ≈ 3 and exact answers are in terms of π, as in the textbook.
    - **Chapter 9, Number plane** (`ncm7-ch9.ts`, Ex 9.01–9.06, 13 kinds), MA4-LIN-C-01; 9.01 (grid references on a
      town map) is earlier-stage content and marked as revision. The test reads every drawing back: the plane's axis
      numbers give its scale, then each dot and the drawn line become coordinates and a rule; places on the map are
      matched to the column letter and row number they line up with; tables of values are read cell by cell.
    - **Chapter 10, Analysing data** (`ncm7-ch10.ts`, Ex 10.01–10.08, 18 kinds), MA4-DAT-C-01 (10.01–10.04) and
      MA4-DAT-C-02 (10.05–10.08). Stem-and-leaf plots and tables are drawn as pictures so they scale on the board. The
      test reads the data back off each drawing (column tops against the axis numbers, dots above each axis number,
      leaves joined to their stems, the key checked) and works out every statistic itself; each "misleading graph" is
      examined for every flaw and must have exactly one.
    - **Chapter 11, Probability** (`ncm7-ch11.ts`, Ex 11.01–11.05, 12 kinds), MA4-PRO-C-01 (single-step
      experiments only; two-step experiments are Stage 5). Spinners have equal sectors, coloured by letter; the test
      checks every sector's angle, counts the letters, reads die events and complements with its own rules over the
      outcomes 1 to 6, and writes each probability in simplest form itself.
    - **Chapter 12, Rates, ratio and time** (`ncm7-ch12.ts`, Ex 12.01–12.12, 22 kinds), MA4-RAT-C-01 (12.01–12.07,
      including distance–time graphs). Time (12.08–12.11: converting units of time, 24-hour time, time differences,
      timetables) has no Stage 4 content point and is marked as revision; 12.12 (world time zones) is starred as
      extension in the textbook and marked so. Time-zone questions state each place's UTC offset, so no outside facts
      are needed. The test reads travel graphs off their axes and timetables cell by cell, and converts every clock time
      to minutes after midnight itself.
    New Century Maths 8 (a second book tab on the games page), chapter by chapter:
    - **Chapter 1, Pythagoras' theorem** (`ncm8-ch1.ts`, Ex 1.01–1.08, 13 kinds), MA4-PYT-C-01, and MA4-FRC-C-01 for
      the square roots of 1.01. Exact answers (e.g. √41) are used, as the Stage 4 content asks; the word "surd" and its
      rules are left to the Stage 5 path (MA5-IND-P-01). Triangles are drawn to scale (diagrams6 `fig`, `rtPts`); the
      test finds the right angle from its mark, takes the side opposite as the hypotenuse, matches each label to its
      side, checks the drawing is in proportion and works out the unknown itself.
  - **Building a game** (`src/lib/game/build.ts`): a seed gives the same questions every time (that is how a game is
    carried on after a refresh); every kind of question comes up once, the most basic kinds first, before any kind
    repeats; no question appears twice in a game and no kind twice in a row.
  - **Luck** (`src/lib/game/luck.ts`): a correct answer never costs the team that gave it anything. Raids take at most
    30 termites, only from the team in front; a leapfrog swaps totals with the team JUST ahead, and only over a gap of 40
    to 150, so nobody goes from last to first in one go; at most one raid and one leapfrog a question. Simulated over
    20 000 games, teams that get 90%, 75%, 60% and 45% of questions right win 58%, 27%, 11% and 4% of games.
  - **Diagrams** (`src/lib/maths/diagrams11.ts`): triangles from their three sides, regular shapes with equal-side marks,
    triangles and parallelograms with a dashed perpendicular height and true slanted sides, composite shapes, prisms with
    a shaded cross-section, and solids built from cubes with a "front" arrow. On the board the diagram is scaled to the
    space left between the question and the choices, so no question needs scrolling.
  - **Live games on student devices** are not built: they need the server (a shared game code, students' answers and a
    live leaderboard), which the stand-alone preview does not have. The question sets already carry the four choices a
    tap-to-answer game needs.
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
| `src/content/` | Years 7–9: 38 topics, 197 skills. Years 1–2 (Stage 1): 18 topics, 50 skills (`y1*.ts`, `y2*.ts`). Years 3–4 (Stage 2): 21 topics, 75 skills (`y3*.ts`, `y4*.ts`). Each skill is a question generator with Foundation / Standard / Challenge levels | `src/content/` |
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
npx tsx tests/ncm7-ch2.test.ts               # Year 7 Angles: answers re-worked and every drawing measured (angles, parallels, labels clear of lines)
npx tsx tests/gallery-ncm7-2.ts              # screenshots of each kind of Angles question (ONLY=2.07 for one exercise)
npx tsx tests/gallery-diagrams12.ts          # the Angles diagrams in light and dark
npx tsx tests/ncm7-ch8.test.ts               # Year 7 Area and volume: answers re-worked with its own unit tables; every length label checked against its side
npx tsx tests/gallery-ncm7-8.ts              # screenshots of each kind of Area and volume question (ONLY=8.05 for one exercise)
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
npx tsx tests/ncm9-ch9.test.ts               # Year 9 Analysing data: data read back from the lists, tables, dots, columns and leaves shown
npx tsx tests/gallery-ncm9-9.ts              # screenshots of Chapter 9 (Year 9) questions
npx tsx tests/ncm9-ch10.test.ts              # Year 9 Surface area and volume: labels read off the diagrams, shapes and sector angles measured
npx tsx tests/gallery-ncm9-10.ts             # screenshots of Chapter 10 (Year 9) questions
npx tsx tests/games.test.ts                  # class games: every answer re-worked from its numbers, drawings measured, game building, luck rules
                                             # (each chapter's own re-working is in tests/game-checks/, e.g. ncm7-ch4.ts: exact fraction arithmetic)
K=3 npx tsx tests/games-dump.ts              # class games: sample questions as plain text (ONLY=ncm7-8.05 for one exercise)
npx tsx tests/gallery-games.ts               # class games: screenshots of every kind of diagram question
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
node qa/ncm7-2-check.mjs      # (dev server :3102) Angles topic and lessons, 18-question test, every skill practised on a phone
node qa/ncm7-8-check.mjs      # (dev server :3102) Area and volume topic and lessons, 18-question test, every skill on a phone
node qa/parent-ratings-check.mjs                                                   # (same server) ratings sheet and example parent view
node qa/resume-check.mjs      # (same server) stop a practice set, come back, carry on; finishing clears the saved place
node qa/fraction-calc-check.mjs  # (same server) stacked fraction boxes, fraction and mixed keys, F⇄D, "Put … in my answer box"
node qa/dms-check.mjs            # (same server) degrees and minutes: ° ′ keys on an iPad, "36 52" typed on a laptop
node qa/bar-height-check.mjs     # (same server) column graphs and histograms: every column drawn as tall as its value
node qa/fit-sweep.mjs ipad    # (Years 1–4 on) every question fits without scrolling: laptop, chromebook, ipad or ipadair
node qa/game-check.mjs        # (preview server on :3102) class games: set-up, a whole game, keys, timer, undo, carrying on after a refresh,
                              # then every game played through at four screen sizes with nothing needing scrolling
node qa/game-preview-check.mjs out.html   # the built stand-alone page: a class game played by clicking only, and carried on after a reload

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
