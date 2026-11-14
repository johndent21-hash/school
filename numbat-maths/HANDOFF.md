# Handoff: audit the Year 7 and 8 class games, finish Year 9 Standard, then ask about improvements

For the next session. The user wants, in this order:

1. **Year 9 Standard** class games finished and published (nearly done, see Step 0).
2. **Years 7 and 8** (NCM 7 and NCM 8) checked for completeness, exercise by exercise against their textbooks, to the
   standard Year 9 Standard now meets. Fix gaps.
3. **Then ask the user** about improvements: issues to fix, better or different game ideas, new features. Give an
   honest size estimate for each and let the user choose. Do not build any of them until the user says so.

**High quality, low usage.** One board check of the changed chapters, one build and one publish per book batch, short
reports. Don't work on NCM 9 Advanced (paused after Ch 5; its Ch 1–5 stay in the repo, left out of builds) or Year 10.

## Rules

- Repo `johndent21-hash/school`, folder `numbat-maths/`, branch **`claude/numbat-maths-game-section-5nghxv`** only.
  No pull requests. Commit messages end with the attribution lines the session's system reminder gives. Commit only
  when the full test run prints `all passed`.
- Syllabus: NSW Mathematics K–10 (2022), PDF in each textbook repo (`NESA - mathematics_k_10_2022 (S4, S5, LS).pdf`).
  Every set lists its outcome code; check the syllabus line, don't guess. Stage 3 or earlier-stage work says "revision";
  Path content has empty `outcomes` and a teacher note saying extension (with the code).
- Never copy textbook wording, names or numbers into questions.
- Preview artifact: https://claude.ai/artifact/NHrcC9eBrYkDQ8f8CXFiYU (NCM 7, NCM 8, NCM 9 Standard). `read` it once
  before republishing; publish the same scratchpad file name (`numbat-maths-1-9.html`), no icon.

## Step 0: Year 9 Standard — done

Done in the previous session (commit `1123f5a`): the exercise-by-exercise audit of all 13 chapters. It now has 91 sets
and 253 kinds, 13 new kinds with independent checks, and every planted error was caught. N=400 tests passed. Details
are in the README's Year 9 Standard entry and the header of `src/content/games/ncm9s.ts`.

Board check (changed chapters 1, 2, 3, 5, 6, 8–13 and all 13 chapter games): everything fitted with no page errors,
except **2.03 spills 11–13 px sideways on the iPad (1180 × 720) and small (1024 × 640) screens**. That set reuses the
NCM 8 Pythagoras kinds (`ncm8-ch1` 1.03 `hyp`/`exact`), so the fix belongs in `ncm8-ch1.ts`; do it in the NCM 8 audit
below. Built without NCM 9 Advanced, preview check clean, **published as Version 23** of the artifact (14 Nov 2026).
Nothing left to do here; start at Step 1.

Left as found in 9 Std, to raise with the user in Step 3: 6.03/6.04 networks have no "is it connected" question
(Path, extension); 7.05 has no "no solution" question; the NCM 9 Advanced kind `costs` (reused in 9 Std 3.06) uses the
textbook's name "Alla" (it is in `ncm9-ch3.ts`, a 9 Advanced file, so it was not changed).

## Step 1: NCM 8 audit — done (14 Nov 2026)

Textbook: `johndent21-hash/Year-8-Advanced` (public). All 121 exercises checked question type by question type. Added
(each with an independent check and a planted error caught): recognising surds (1.01, outcomes now IND + FRC, teacher
note on the word "surd"), a shorter side as a surd (1.04, mixed into 1.05), screen/cone/isosceles problems (1.08),
integer word problems and decimal + and − (2.02, 2.05, reused from NCM 7), estimating square and cube roots (2.08),
simplifying surds (2.09, ext, from 9 Adv), HCF/LCM from prime factors (2.10, outcomes IND + FRC), simplify-then-evaluate
(2.11), two-bracket expand and simplify (3.07), capacity from inside measurements (5.14), uniform/unimodal/bimodal/
multimodal (7.11), best measure of centre (7.12), chance words, impossible probabilities, letters (8.01, 8.05, from
NCM 7), a 2-step both-sides kind (9.03, which is now Stage 4 MA4-EQU-C-01 with a note that 3-step ones are Stage 5),
how many solutions x² = c has (9.05). Fixed: "12 cm cm" (1.06), "a octagon" (4.07), extension notes for polygons
(MA5-GEO-P-01) and networks (MA5-NET-P-01, they had said "not in the syllabus"), the book's name "Majid" and a 40 km/h
walker (10.08). The **2.03 sideways spill is fixed** (`pad: 52` in `rightTri`, ncm8-ch1). Ch 6, 11, 12 needed nothing.
Not added, by syllabus: index laws with pronumerals (2.11, 2.12; Stage 5).

**Steps 1 and 2 are board-checked and published as Version 24 (14 Nov 2026).** Board check: every changed set, all
NCM 7 and NCM 8 chapter games and 9 Std Ch 2, at all four sizes: no overflow, no spill, no page errors, except NCM 8
8.02 (a 22 px spill on iPad from a floating-point option, 0.00000000000000002776, made by NCM 7 11.05 `value`); fixed
by working in tenths, and `tests/games.test.ts` now fails any prompt or option showing floating-point residue.

## Step 2: NCM 7 audit — done (14 Nov 2026)

Textbook: public repo `johndent21-hash/Year-7-Standard` (12 chapter PDFs; clone with GIT_LFS_SKIP_SMUDGE=1). All 123
exercises have a set (same numbers). Added: sign of sums/differences/products/quotients (1.04–1.07), common factors
(3.11), multiples (3.12), bigger or smaller with a fraction (4.06, 4.07) or a decimal (7.05, 7.08), expanded form
(5.03), which triangles can be drawn (6.05), convex quadrilaterals (6.08), increasing/decreasing lines (9.06). The
expanded-form, triangle, convex and incdec kinds were first written for NCM 8 and **moved to NCM 7** (NCM 8 3.01, 4.03,
4.04 and 11.06 now reuse them; checks moved too) because NCM 8 files import NCM 7, not the reverse. Fixed: 6.09 gave a
parallelogram or rhombus a 90° angle (a rectangle or square); the check now rejects it. "Liam" (an NCM 8 textbook name)
replaced by "Ravi" in the NCM 7 name lists. Ch 2, 8, 10, 11, 12 needed nothing.

## How to audit (this worked well for 9 Std)

For each chapter:

1. List the book's question stems: `pdftotext -layout "<chapter>.pdf" $S/c.txt; qa/stems.sh $S/c.txt`. The script
   misses some stems, so read a few raw lines with `sed -n` when an exercise looks thin.
2. List the sets and their kinds: `npx tsx tests/sample-kinds.ts --sets ncm8 <chapter>`. `kind<source>` means reused.
3. For each question type in the exercise, ask: is it covered by a kind at the right level? Before writing a new
   kind, look for one to reuse: `npx tsx tests/sample-kinds.ts --list ncm7` (or ncm8, ncm9) lists every original kind.
   Then `npx tsx tests/sample-kinds.ts "ncm7-ch1 1.03 statement"` prints three sample questions. This is much
   cheaper than reading code.
4. Check the outcome against the syllabus content for that exercise. In the 9 Std audit the 2.01 and 10.01 outcomes
   were wrong.
5. Reuse inside a set: `reuse(CHAPTER, 'exercise', 'kind', 'newName?')`, or the book's own local equivalent. A new kind
   is `gq({t, prompt, diagram?, correct, wrong | inOrder, why, meta: {}})`, with these limits:
   - exactly 4 options, each ≤ 42 characters;
   - prompt ≤ 175 characters;
   - wrong options: likely mistakes first, then spares;
   - `why` contains the answer;
   - each set needs ≥ 15 different questions.

   Then add a `solve` case to the chapter's checker that works the answer out from what the student sees, never from
   `meta`. Plant an error once for each new kind: `python3 qa/plant.py <file> "exact old" "wrong"`. Prefer text-only kinds,
   since a new drawing needs a screenshot check.

## Commands (from `numbat-maths/`; `S` = the session scratchpad)

```
npm ci; (cd harness && npm ci); ln -sfn /opt/node-tools/node_modules/playwright node_modules/playwright   # fresh container
npx tsc --noEmit -p tsconfig.json 2>&1 | grep -v playwright
N=150 npx tsx tests/games.test.ts > $S/t.log 2>&1; grep -E "^\s+[0-9]+ × " $S/t.log | sort | uniq | head; tail -1 $S/t.log
grep -A2 "^FAIL" $S/t.log | head                       # details of the first failures
N=400 npx tsx tests/games.test.ts > $S/t.log 2>&1; tail -1 $S/t.log   # before every commit: must print "all passed"
```

### Board check, build and publish (once per batch, at the end)

```
cd harness && ./sync.sh                                    # never while a board check runs
# dev server, in the background with the longest timeout, from harness/:
VITE_PREVIEW_ONLY=1 VITE_CONVEX_URL=https://preview-only.convex.cloud VITE_STAGE1=1 VITE_STAGE2=1 npx vite dev --port 3102 --host 127.0.0.1
# changed chapters only, in the background, all logged to one file (ONLY is a prefix: ncm8-1 also matches 10–12; use ncm8-1.):
for o in ncm8-1. ncm8-ch1 ...; do echo "=== $o"; ONLY=$o SHOTS=$S/board/$o node qa/game-check.mjs; done > $S/board/all.log 2>&1
grep -E "^===|games played|errors" $S/board/all.log
# build WITHOUT NCM 9 Advanced: delete the { id: 'ncm9', … } entry from src/content/games/index.ts, build, then restore it
cd harness && VITE_STAGE1=1 VITE_STAGE2=1 ./build-preview.sh $S/numbat-maths-1-9.html "Numbat Maths 1–9"
git checkout src/content/games/index.ts
node qa/game-preview-check.mjs $S/numbat-maths-1-9.html
grep -c "New Century Maths 9 Advanced" $S/numbat-maths-1-9.html   # must be 0
```

## Pitfalls already hit (don't repeat)

- **Distractors equal to the answer** leave fewer than 3 wrong options (2 × 2 = 2 + 2; answer 0 or 1; (0, 0)). Always
  add spares.
- **Distractors equal in value to the answer.** The checker catches these: (−2)⁻² = 2⁻², so a negative base is only a
  distractor when the index is odd.
- **`inOrder` lists:** the right answer must be able to fall in every slot.
- **Floating point:** round with whole numbers, and use relative tolerances for tiny numbers. Algebraic fractions need
  non-whole test points.
- **Plain text of a prompt** puts spaces where tags were. Normalise `\s+([.?,)])`, but never touch the colons in ratios.
- **A planted error equal to a listed distractor** makes `gq` throw instead of testing the checker. Plant another value.
- **Heredocs:** the Bash safety check rejects heredocs containing `$${`. Write Python edit scripts to a scratchpad file.
- **Outcome codes:**
  - square roots: MA4-IND-C-01
  - irrational numbers: MA4-FRC-C-01
  - surds: MA5-IND-P-02
  - factorising with negative or indexed common factors: MA5-ALG-P-01
  - metric prefixes: MA5-MAG-C-01
  - capacity and volume units: MA4-VOL-C-01
  - multistage with and without replacement: MA5-PRO-C-01
  - Venn diagrams and two-way tables: MA5-PRO-P-01
  - networks: MA5-NET-P-01
  - direct variation: MA5-RAT-P-01
- **Import direction:** NCM 8 files import NCM 7 (and 9 Adv imports NCM 8), never the reverse. A kind both books need
  goes in the lower book and the higher one reuses it; move its check with it.
- **Fall-through `case` chains** in checkers: insert a new `case` before a chain, not inside it.
- **Reading the artifact:** a `read` of it costs a lot of context (2.5 MB page). Do it once, only right before
  publishing.

## Step 3: ask the user about improvements (after Steps 0–2 are published)

Use `AskUserQuestion` (multi-select), or a short list in chat. For each idea, give one line on what it is and a size.
Be honest that the size is an estimate. Claude cannot see the user's weekly allowance. So give sizes relative to the
**Year 9 Standard audit session** (13 chapters audited, 13 new kinds, tests, board check, publish = **1 unit**). The user
can compare that with how much of their week that session used.

Sizes:

- **XS:** under 0.05 unit.
- **S:** about 0.1–0.2.
- **M:** about 0.3–0.6.
- **L:** 1–2 units.

Candidate ideas, from the previous session (check each is still true before offering it):

**Issues to fix**

- ~~2.03 sideways spill on iPad and small screens~~ fixed in Step 1 (Version 24).
- Small gaps left after the NCM 7/8 audit (S–M): inserting grouping symbols (NCM 7 1.08, NCM 8 2.04), coordinates
  that are not whole numbers (syllabus MA4-LIN-C-01; NCM 7 9.02–9.03), raffle and "or" questions in NCM 7 11.02 (the
  NCM 8 kinds would move down), non-monic binomial products (NCM 8 3.11, extension); with the 9 Std ones below.
- The open-top cylinder question (NCM 8 12.05 `open`) shows a closed cylinder (S).
- Remove the textbook's name "Alla" from the 9 Advanced `costs` kind (XS, but it touches a 9 Advanced file: ask).
- The artifact viewer blocks the page's plain download links (the publish warns about it), so any "download" button does
  nothing in the preview. The buttons are the CSV exports (`app/src/lib/csv.ts`, used by `RatingsSheet.tsx` and
  `teacher-class.tsx`). Fix: use the artifact `downloads` capability in the preview build, or hide them there (S).
- Trigonometry (9 Std Ch 4) is played without calculators, so it only asks for the ratio or the set-up. An optional
  "calculator allowed" mode with rounded answers (M).

**Different game types** (reuse the existing question makers)

- *Spot the mistake:* show a worked solution with one wrong line; teams pick the line. This hits the syllabus's
  reasoning and communicating parts (M–L: needs working steps per kind; start with a few chapters).
- *Year revision mix:* one game drawing from every chapter studied so far, weighted to older chapters, for yearly-exam
  revision (S–M).
- *Exit ticket:* 5 questions at the end of a lesson with a class summary of which ones went wrong (M; storing results
  touches the backend).
- *Speed round / buzzer:* the first team to answer correctly scores (M).

**Features**

- Print a game as a worksheet with an answer key, as a PDF (M).
- A teacher view of the questions the class most often gets wrong (M–L).
- Finish NCM 9 Advanced (Ch 6 onwards) or start Year 10 Standard/Advanced (L each). The user has paused these; only
  offer them.

Ask; don't build. When the user picks, record the choices in this file for the session that builds them.

## Step 4: the user's choices (14 Nov 2026) — build these next, in this order

Sizes are estimates against the 9 Std audit session (= 1 unit); the NCM 7 + 8 audit was about 1.5–2 units. Total for
everything chosen: about 5 units. The order groups work that shares machinery; it is a recommendation, not the user's.

1. **Fixes (about 0.6):** open-top cylinder drawing (NCM 8 12.05 `open`, `D.cylinder` has no open option yet); preview
   download buttons (CSV exports; artifact `downloads` capability or hide in the preview); remove "Alla" from the 9 Adv
   `costs` kind (the user approved editing that 9 Adv file for this); the small leftover gaps listed in Step 3.
2. **PDF worksheets and topic tests (about 0.6–0.9)** with the **year revision mix game (about 0.3)**, which also picks
   across chapters. The user's answers:
   - Scope: both a one-click sheet per exercise and a builder (tick exercises or question kinds from the bank, set how
     many of each; worksheet or topic test).
   - Answer style: **chosen per question** (written with working space and an answer line, or the game's four options).
   - Answer key: a **separate key printout** (not at the back of the student sheet). Default to answer plus the
     short working from `why`; the user did not say, so confirm when showing the first version.
   - PDF method: **print-ready page + the browser's Print → Save as PDF** (no PDF library).
   - Topic tests follow the user's standing rules: outcome codes listed, sections labelled by difficulty (kinds have
     `d` 1 or 2), marks adding to the stated total, a realistic time allowance; offer Version A / Version B (seeds).
3. **Speed round / buzzer game (about 0.3–0.5)** and **trigonometry calculator mode (about 0.3–0.5)**.
4. **Exit ticket (about 0.4–0.6)** and **teacher view of most-missed questions (about 0.5–1.5)**: both store results
   (backend), so build the storage once.
5. **Spot the mistake (about 0.5–1.5):** worked steps per kind; start with a few chapters.

Not chosen: resuming NCM 9 Advanced or starting Year 10 (still paused).
