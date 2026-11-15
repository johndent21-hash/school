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
  In a practice set, if any question allows a calculator, every question in the set does (`withSetCalculator` in
  `app/src/lib/practice.ts`), so the button stays put and never hints that an answer is a whole number; questions
  marked `noCalc` (they or their exercise say "without a calculator") are the exception and show "No calculator".
  Topic tests keep each question's own marking.
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
- **Parent accounts** (`app/src/routes/parent.tsx`, `app/convex/parents.ts`): each student has an 8-character parent code
  (`students.parentCode`, printed on the login cards; made for older students the first time the cards are opened,
  `classes.ensureParentCodes`). At `/parent` a parent chooses "First time here", types the code, checks the child's name
  and chooses their own 6-digit PIN; that makes a parent account (`parents`, linked to children by `parentLinks`).
  Brothers and sisters are added with their own codes ("Add a child"), so one log-in covers them all. Log-in is any linked
  child's code plus the parent's PIN. Read-only, and only the linked children. Wrong parent PINs pause parent log-ins with
  that code for 10 minutes, then 20, 40 ... up to a day; this pause is kept apart from the child's own PIN, so it never
  locks the child out. A second household can set up its own account with the same code and a different PIN (up to 4
  accounts per child). Teachers see how many parent accounts each student has (Students tab) and can give a student a new
  parent code (lost card), which unlinks the child from every parent account. The old parent log-in (the child's class
  code, name and PIN) was switched off on 15 Nov 2026; its sessions are no longer accepted and `/join?as=parent` explains
  the change. Forgotten parent PIN: set up again with the same code.
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
  questions, the time for each question, and a "see the questions first" list for the teacher (with each question's
  suggested time). Time: **Suggested** (the default) gives each question its own time from what it asks
  (`suggestedSecs` in `src/lib/game/build.ts`: reading, each step of the working in its explanation, squares and square
  roots counting more, a diagram, a calculator, d2; rounded up to 15, 20, 30, 45, 60, 90 or 120 s; a kind can set
  `secs`), or a fixed 10 s to 2 minutes, or no timer. During the game, −15 s and +15 s beside the clock (keys − and +)
  change the time left on that question and the time for every question after it (`adjust` in the saved game). After
  the dig the logs open one at a time, a second apart, and the next step waits for the last one (also with "reduce
  motion" on). Keys: Space or Enter for the next step, 1 to 6 to tick a team, A for all teams, P to pause the timer. The game's place is kept on the
  device (`numbat.game`), so a refresh or a sleeping laptop loses nothing, and "Undo this dig" fixes a mis-tick. The end
  screen ranks the teams and lists the questions the fewest teams got right.
  - **Speed round** (choose "Speed round" at set-up; `buzzIn`, `buzzRight`, `buzzWrong` in `app/src/lib/board.ts`): the
    first team to put a hand up answers. The teacher clicks that team (or presses 1–6); the clock stops; Right (Y) shows
    the answer with that team ticked, ready to dig; Wrong (N) puts that team out for the question and restarts the clock
    for the others. When every team has had a go, or nobody knows, "Show the answer" moves on. Same termites and luck.
  - **Calculators allowed** (set-up page, only where a set has calculator kinds): kinds made with `mkCalc` (`calc: true`)
    are left out of every game, worksheet and test unless the teacher allows calculators; then they are mixed in and
    marked "Calculator" on the board. So far: NCM 9 Ch 4 / 9 Std Ch 4 trigonometry, 4.04 a ratio to 4 decimal places,
    4.05–4.06 a side to 1 decimal place (× or ÷ the ratio), 4.07 an angle to the nearest degree. Wrong choices: the
    calculator in radians, the other ratio, × instead of ÷, the other acute angle. Checked by `tests/game-checks/ncm9-ch4.ts`
    from the drawing with `Math.sin` etc.
  - **Year revision mix** (`/game?id=ncm8-rev7` = NCM 8 Chapters 1–7; `buildRevisionGame` in `src/lib/game/build.ts`):
    questions from every chapter studied so far, chosen at random with the oldest chapter about twice as likely as the
    newest, never the same chapter twice in a row. Picked from a panel at the top of each book on `/games`.
  - **Worksheets and topic tests** (`/worksheet`, `app/src/routes/worksheet.tsx`; `src/lib/game/sheet.ts`): printable
    sheets from the same question bank. One click from any game's set-up page ("Print as a worksheet or test"), or build
    one: tick exercises across chapters and books, how many from each, and optionally which kinds. Every question starts
    as written (working space and an answer line at the bottom); any can be switched to its four choices, and questions
    that point at their choices ("Which of these…") always keep them. A topic test is grouped into Section A Foundation
    (d1), B Developing (d2) and C Extension (exercises with no outcome codes), with marks (choices 1; written 1, or 2 for
    d2), the total, and a time allowance (a minute a mark plus 5 minutes' reading, rounded up to 5). Outcome codes are
    listed at the top; Version A and B use different seeds; an optional school name prints above the title. The answer
    key prints separately (answer plus the short working from `why`, which a tick box can turn off). The printout is one
    stand-alone HTML document (its own styles, `sheetHtml`), previewed in a frame and printed with Print → Save as PDF;
    in the claude.ai preview, where printing may be blocked, it can be saved as an .html file instead (`saveText`,
    artifact `downloads` capability).
  - **Exit tickets** (class page → Exit tickets, `components/numbat/ExitTickets.tsx`; students at `/exit` and a card on
    their home page; `app/convex/exits.ts`; logic in `src/lib/game/exit.ts`): 3, 5 or 8 game questions from any exercise
    or whole chapter, answered once on each student's own device. Open until the teacher closes it, for up to 2 days;
    starting a new one closes the last. The server keeps the game id and seed, and per question only the kind, the right
    option and the mistake labels (plain text, never HTML); each device rebuilds the questions from the seed and checks
    their fingerprint (`gameCheck`), so a ticket made before a site update is never answered with different questions.
    The server marks the answers. The teacher sees who has handed in, each question with how many chose each option,
    the mistake behind each wrong option and who chose it, and **Most missed**: the kinds of question the class gets
    wrong most often over all its tickets (at least 4 answers, 25 % or more wrong), with the commonest mistakes.
  - **Mistake labels** (`miss()` in `src/content/games/helpers.ts`; `q.mistakes`): a wrong option can carry a short
    label naming the mistake that gives it ("multiplied only the first term"). Never shown in the game; used by the exit
    ticket summaries. Labels follow their option through the de-duplication and shuffle, and adding them does not change
    any question (`tests/fingerprints.ts` prints a fingerprint per exercise to compare before and after). So far:
    NCM 7 Ch 1, NCM 8 Ch 3 and NCM 9 Ch 4 / 9 Std Ch 4 (92 kinds, counting reuses). `tests/games.test.ts` checks every
    label is on a wrong option, short and plain, and that a "wrong sign" option is the answer's opposite.
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
    **Textbook audit of NCM 7 and NCM 8 (Nov 2026).** Every exercise of both books was compared with its set question
    type by question type (all 123 + 121 exercises already had a set). Added, each with an independent check and a
    planted error caught: NCM 7 sign of a sum/difference/product/quotient (1.04–1.07), common factors and multiples
    (3.11, 3.12), bigger or smaller when multiplying or dividing by a fraction or decimal (4.06, 4.07, 7.05, 7.08),
    expanded form (5.03), which triangles can be drawn (6.05), convex quadrilaterals (6.08), increasing or decreasing
    lines (9.06); NCM 8 recognising surds (1.01), a shorter side as a surd (1.04, 1.05), more Pythagoras contexts
    (1.08), estimating square and cube roots (2.08), HCF and LCM from prime factors (2.10), simplify-then-evaluate index
    laws (2.11), two-bracket expand and simplify (3.07), capacity from inside measurements (5.14), modes and the best
    measure of centre (7.11, 7.12), 2-step equations with pronumerals on both sides (9.03, now Stage 4 MA4-EQU-C-01)
    and how many solutions x² = c has (9.05), plus NCM 7 kinds reused where the NCM 8 book revises them. Fixed: "12 cm
    cm" (1.06), "a octagon" (4.07), the extension notes for polygons (MA5-GEO-P-01) and networks (MA5-NET-P-01), a
    parallelogram or rhombus with a right angle (NCM 7 6.09), textbook names (Majid, Liam), a 40 km/h walker, and the
    sideways spill of the Pythagoras triangles on small screens (wider drawing margin).
    New Century Maths 8 (a second book tab on the games page), chapter by chapter:
    - **Chapter 1, Pythagoras' theorem** (`ncm8-ch1.ts`, Ex 1.01–1.08, 16 kinds), MA4-PYT-C-01, and MA4-IND-C-01 and
      MA4-FRC-C-01 for the square roots of 1.01. Exact answers (e.g. √41) are used, as the Stage 4 content asks. 1.01
      asks which square roots are surds, as the textbook does (a teacher note says the word means a square root that is
      not exact, and that operating with surds is Stage 5 path, MA5-IND-P-02). Triangles are drawn to scale (diagrams6 `fig`, `rtPts`); the
      test finds the right angle from its mark, takes the side opposite as the hypotenuse, matches each label to its
      side, checks the drawing is in proportion and works out the unknown itself.
    - **Chapter 2, Working with numbers** (`ncm8-ch2.ts`, Ex 2.01–2.12, 37 kinds), MA4-INT-C-01 (2.02–2.04),
      MA4-FRC-C-01 (2.05–2.07), MA4-IND-C-01 (2.08, 2.10–2.12). This chapter revises Year 7, so those sets reuse the
      matching NCM 7 question kinds (`from(chapter, exercise, ...kinds)`); the NCM 8 checker sends each reused kind to
      the NCM 7 checker for the exercise it came from. New kinds: mental strategies (2.01, revision), terminating
      decimals, powers of negative numbers, (√a)² and √a × √b (2.09, starred as extension; surds are Stage 5 path),
      and the index laws, where wrong choices equal in value to the answer (e.g. 4² for 2⁴) are filtered out and the
      test compares every choice with the expression in exact BigInt arithmetic.
    - **Chapter 3, Algebra** (`ncm8-ch3.ts`, Ex 3.01–3.13, 28 kinds), MA4-ALG-C-01. 3.01–3.05 revise Year 7 and reuse
      the NCM 7 Chapter 5 kinds. New: expanding, factors and HCFs of terms, factorising and factorising fully. 3.06
      (index laws with pronumerals, Stage 5 MA5-IND-C-01) and 3.10–3.13 (negative common factors and binomial
      products, Stage 5 path MA5-ALG-P-01) are starred as extension in the textbook and marked so. The test reuses the
      Chapter 5 expression parser (now exported); for "factorise fully" an option equal in value is right only if
      nothing more can be taken out of its brackets.
    - **Chapter 4, Geometry** (`ncm8-ch4.ts`, Ex 4.01–4.08, 23 kinds), MA4-ANG-C-01 (4.01–4.02) and MA4-GEO-C-01
      (4.03–4.06). 4.01–4.06 revise Year 7 and reuse NCM 7 Chapter 2 and 6 kinds through `reuse()` (`reuse.ts`), which
      records the source in `meta.reused` so the test sends each question to the checker for the exercise it came from.
      New, both starred as extension in the textbook and marked so: 4.07 angle sum of a polygon (Stage 5 content) and
      4.08 networks (not in the K–10 syllabus). The test works polygon answers out from the name or angle sum in the
      question, and reads each network from the drawing alone (edge ends must sit on drawn vertices, each vertex takes
      its nearest letter, no edges cross or pass through a vertex, the network is connected), counts degrees, and decides
      tracing by Euler's rule (0 odd vertices: start anywhere; 2: start at an odd vertex; more: impossible).
    - **Chapter 5, Area and volume** (`ncm8-ch5.ts`, Ex 5.01–5.14, 65 kinds, 28 of them new), MA4-LEN-C-01 (5.01–5.03, and arcs and
      sector perimeters in 5.08), MA4-ARE-C-01 (5.04–5.10), MA4-VOL-C-01 (5.11–5.14); all Stage 4 core, sectors
      included. 5.03–5.06, 5.11, 5.12 and 5.14 revise Year 7 and mostly reuse NCM 7 Chapter 8 kinds. New: perimeters of
      quadrilaterals and composite shapes, parts of a circle (`circleFeature` in `diagrams13.ts`), radius from a
      circumference, km² and hectares, area of a circle, semicircle and quadrant, sectors (fraction of a circle, arc,
      area, perimeter), trapeziums, kites and rhombuses, cylinders. Played without calculators, so answers are exact (in
      terms of π) or estimates with π ≈ 3; the textbook's 1- and 2-decimal-place answers are left for the exercise. The
      test reads every drawing: labels are matched to the side they sit beside the middle of (a label beside two sides
      fails), drawings must be in proportion to their labels (cylinders say "not to scale" and are only checked for
      radius or diameter), sector angles are measured, and circle parts are recognised from the geometry (where a
      line's ends lie, whether it meets the circle once, whether a shaded region closes through the centre).
    - **Chapter 6, Fractions and percentages** (`ncm8-ch6.ts`, Ex 6.01–6.12, 52 kinds, 19 new), MA4-FRC-C-01.
      6.01–6.06 revise Year 7 and reuse NCM 7 Chapter 4 kinds. New: percentages such as 12½% and 33⅓% as fractions
      and back, percentage increase and decrease, mark-ups and multipliers (× 1.15), mental percentages, the unitary
      method (including working back from a discounted price), profit and loss (also as a percentage of the cost
      price), adding GST and finding the GST in a GST-inclusive price (÷ 11), and percentage problems. 6.11 (simple
      interest, I = Prn) is Stage 5 content (MA5-FIN-C-01) and marked as extension. The test reads the amounts and
      percentages from the question, works in exact fractions (so 33⅓% stays exact), requires exactly one option with
      the right value, money written as whole dollars or with 2 decimal places, and the explanation to reach the answer.
    - **Chapter 7, Investigating data** (`ncm8-ch7.ts`, Ex 7.01–7.12, 32 kinds, 16 new), MA4-DAT-C-01 (7.01–7.03,
      7.09, 7.10) and MA4-DAT-C-02 (7.04–7.08, 7.11, 7.12). Measures of centre and spread, dot plots, stem-and-leaf
      plots and comparing data revise Year 7 and reuse NCM 7 Chapter 10. New: sector graphs (`sectorGraph` in
      `diagrams13.ts`, sectors at their true angle), pictograms, line graphs, types of data (nominal, ordinal, discrete,
      continuous), census and sample, fair (random) samples, frequency tables drawn as pictures (`freqTable`),
      histograms and frequency polygons, choosing a graph, and the shape of a distribution. The test reads every
      graph back: sector angles measured and matched to their labels (adding to 360°), pictogram symbols counted
      against the key, line-graph points and histogram columns read against the axis numbers, tables cell by cell; the
      shape is decided from the frequencies (mirror image, all equal, or the side the tail is on). Types of data,
      census, fair samples and the best graph come from a key in the test.
    - **Chapter 8, Probability** (`ncm8-ch8.ts`, Ex 8.01–8.06, 22 kinds, 12 new), MA4-PRO-C-01. Sample spaces,
      probability, complements and expected frequencies revise Year 7 and reuse NCM 7 Chapter 11. New: "or" events,
      complements from counts and from percentages, numbered balls 1–100, raffles, independent coin tosses, relative
      frequency and prediction. 8.03 (Venn diagrams) and 8.04 (two-way tables, drawn as pictures with `gridTable`)
      are starred in the textbook and are Stage 5 Path content (MA5-PRO-P-01), so they are marked as extension. The
      test works every probability as an exact fraction (the right option must be in simplest form and the only one
      equal in value), places each Venn number in its region by its position relative to the circles, checks that
      every row and column of a two-way table adds to its total, and counts the numbered balls itself.
    - **Chapter 9, Equations** (`ncm8-ch9.ts`, Ex 9.01–9.08, 21 kinds, 10 new), MA4-EQU-C-01 (9.01, 9.02, 9.05–9.07).
      One- and two-step equations and equation problems revise Year 7 and reuse NCM 7 Chapter 5. New: x² = c and
      ax² = c (both answers, exact √ when c is not a square, as Stage 4 asks), rectangle problems and substituting into
      formulas. Pronumerals on both sides (9.03) and brackets (9.04, starred) are Stage 5 MA5-EQU-C-01, and changing
      the subject (9.08) is Stage 5 Path MA5-EQU-P-02: all marked extension. The test parses the algebra with the
      Chapter 5 parser, solves each linear equation itself (it must be linear with one whole-number root), reads a
      formula and its given values from the italic letters in the prompt, and checks a rearranged formula by
      substituting it back into the original at several sets of values.
    - **Chapter 10, Ratios and rates** (`ncm8-ch10.ts`, Ex 10.01–10.10, 24 kinds, 10 new), MA4-RAT-C-01. Ratios,
      sharing, rates, best buys, rate problems and travel graphs revise Year 7 and reuse NCM 7 Chapter 12. New: one
      part of a ratio as a fraction of the whole, scale maps (scale as a ratio, map to real and real to map), sharing in
      a three-part ratio, units of rates, speed, distance and time (minutes turned into hours, answers as h and min),
      and converting rates (km/h and m/s, L/min to L/h, $/kg to c/g). The test works each answer from the question
      with its own unit table and requires exactly one option of that value, converting options in other units first.
    - **Chapter 11, Graphing linear equations** (`ncm8-ch11.ts`, Ex 11.01–11.13, 26 kinds, 17 new), MA4-LIN-C-01.
      The number plane, tables of values and graphing lines revise Year 7 and reuse NCM 7 Chapter 9. New: rules with
      negative numbers, rules for decreasing tables and number patterns, linear or not, increasing or decreasing,
      the equation of a line from its graph, comparing lines (steepest, parallel, y-intercept), linear models (taxi
      fares, a draining tank), solving an equation from a graph, and where two lines meet. The gradient (11.09,
      starred) and y = mx + c (11.10) are Stage 5 (MA5-LIN-C-01) and marked as extension. The test reads tables cell
      by cell and the drawn line from its ends against the axis numbers (it must be a whole-number line, and the line a
      question names must be the one drawn), and solves rules, patterns and intersections itself.
    - **Chapter 12, Similar figures and surface area** (`ncm8-ch12.ts`, Ex 12.01–12.05, 12 kinds, all new). Every
      set is Stage 5 content, so all are marked as extension: similar figures and scale factors (MA5-GEO-C-01; 12.01
      starred) and the surface area of right prisms and cylinders (MA5-ARE-C-01). Similar-figure questions are worded
      (matching sides and angles named in the question); surface areas use the cube, box, triangular-prism and cylinder
      drawings, and cylinder answers are exact (in terms of π). The test reads the labels: a box's three edges (the
      formula is symmetrical), a triangular prism's four labels (the three that satisfy a² + b² = c² are the triangle,
      the fourth is the length; two readings would fail), and a cylinder's radius or diameter by its drawn length.
    New Century Maths 9 Advanced (a third book tab), chapter by chapter:
    - **Chapter 1, Algebra** (`ncm9-ch1.ts`, Ex 1.01–1.15, 27 kinds, 13 new). Stage 5 core MA5-ALG-C-01: algebraic
      fractions with numerical denominators (1.03), expanding (1.05), binomial products (1.07); 1.01–1.02 revise
      Stage 4. Path content is labelled extension in the teacher notes: MA5-ALG-P-01 (multiplying and dividing
      algebraic fractions, the HCF, monic trinomials) and MA5-ALG-P-02 (special products, grouping, difference of two
      squares, non-monic trinomials, mixed factorisations, simplifying by factorising). Reuses NCM 8 Chapter 3 kinds.
      The test compares options by value at non-whole test points (so a fraction's denominator is never 0), and a
      factorising answer must also be fully factorised (a number times linear brackets with no common factor inside).
    - **Chapter 2, Pythagoras' theorem and surds** (`ncm9-ch2.ts`, Ex 2.01–2.09, 18 kinds, 6 new). The Pythagoras
      exercises revise Stage 4 (MA4-PYT-C-01) and reuse NCM 8 Chapter 1. The surd exercises (2.02–2.05) are Stage 5
      Path (Indices C, MA5-IND-P-02) and labelled extension: recognising surds, simplest form, adding like surds
      (simplifying first), multiplying and dividing. The test gives every surd an exact k√n value, works out the
      question's expression, and requires the one option equal in value and in simplest form (a partly simplified
      surd may be a wrong option only when the question asks for simplest form).
    - **Chapter 3, Numeracy and calculation** (`ncm9-ch3.ts`, Ex 3.01–3.06, 27 kinds, 6 new). Mostly revision of
      Stage 4 (MA4-FRC-C-01, MA4-RAT-C-01), reusing NCM 8 Chapters 2, 6 and 10 and NCM 7 Chapter 12. 3.04 simple
      interest is Stage 5 core MA5-FIN-C-01. New: recurring decimals to fractions (Stage 5 Path MA5-IND-P-02,
      extension), percentages over 100%, profit on total cost, simple interest for months and for an unknown time, and
      reaction distance (km/h to m/s). The test reads the dot notation itself and turns the decimal into an exact
      fraction; money, percentages, years and metres are worked from the question, with exactly one option allowed.
    - **Chapter 4, Trigonometry** (`ncm9-ch4.ts`, Ex 4.01–4.10, 15 kinds, all new), Stage 5 core MA5-TRG-C-01
      (4.01–4.07) and MA5-TRG-C-02 (elevation, depression, bearings: 4.08–4.10). Played without calculators, so the
      kinds name sides, write ratios from Pythagorean-triad sides, use similar triangles, convert degrees and minutes,
      choose the equation for a side (x = 12 sin 35° or x = 12 ÷ sin 35°) or an angle (θ = tan⁻¹(5/12)), and work with
      elevation, depression and true and compass bearings. The test reads each triangle from the drawing (right-angle
      mark, marked angle, side labels matched to sides), checks the drawn angle against its label or the side lengths,
      works out the roles (hypotenuse, opposite, adjacent) and writes the expected ratio or equation itself.
    - **Chapter 5, Indices** (`ncm9-ch5.ts`, Ex 5.01–5.11). Index laws, zero and numerical negative indices
      (MA5-IND-C-01), significant figures and scientific notation (MA5-MAG-C-01); negative indices with pronumerals
      (MA5-IND-P-01) and fractional indices (MA5-IND-P-02) labelled extension. The test caught a real slip here:
      0.007005 to 3 significant figures was given as 0.007 (floating point); rounding is now done in whole numbers.
    - NCM 9 Advanced is **paused** after Chapter 5 at the user's request (Ch 6–13 not done; not board-checked or published).
    New Century Maths 9 (Standard) (`ncm9s.ts`, book id `ncm9s`): all 13 chapters, one set per exercise (91 sets, 253 kinds).
      Each exercise was audited question type by question type against the textbook (not just by title). Most sets reuse
      kinds from NCM 7, NCM 8 and NCM 9 Advanced (checked by the chapter that first made them; `reuse()` keeps a kind's
      original source when it is reused again). New kinds, checked by `tests/game-checks/ncm9s.ts`: binomial products
      with negatives and coefficients (MA5-ALG-C-01), writing negative indices (MA5-IND-C-01), reasons for angle steps in
      triangles and quadrilaterals (MA4-GEO-C-01), Euler's formula (Path, MA5-NET-P-01, extension), earning money (wages,
      salaries over 52 weeks, overtime, commission, piecework, leave loading, taxable income, tax from a scale stated in the
      question, PAYG from a table, refunds and tax debts, net pay; MA5-FIN-C-01), two-step metric conversions and absolute
      and percentage error (MA5-MAG-C-01), interval length and midpoint, x-intercepts, horizontal and vertical lines
      (MA5-LIN-C-01), direct variation (Path MA5-RAT-P-01, extension), parabolas and their shape (MA5-NLI-C-01), tree
      diagrams and draws without replacement (MA5-PRO-C-01), and finding the scale of a drawing (MA5-GEO-C-01). Each set
      lists its outcome; Stage 4 work the book revises says so; Path content has no outcome on the set and an extension
      note. Tax questions state their scale (the bracket questions use the 2024–25 resident rates), so they do not date.
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
npx tsx tests/exit.test.ts                   # exit tickets: every game rebuilds from its seed; summaries and most-missed worked by hand
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
node qa/exit-check.mjs [folder]          # (preview server on :3102) exit tickets: teacher tab, a student handing one in, parent pages; phone and laptop
npx tsx tests/calc-skills.ts; node qa/calc-check.mjs   # (preview server on :3102) every calculator skill's practice set: the button on every question

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
