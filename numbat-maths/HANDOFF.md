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

## Step 0: Year 9 Standard (check first, it may already be done)

Done in the previous session (commit `1123f5a`): the exercise-by-exercise audit of all 13 chapters. It now has 91 sets
and 253 kinds, 13 new kinds with independent checks, and every planted error was caught. N=400 tests passed. Details
are in the README's Year 9 Standard entry and the header of `src/content/games/ncm9s.ts`.

Board check (changed chapters 1, 2, 3, 5, 6, 8–13 and all 13 chapter games): everything fitted with no page errors,
except **2.03 spills 11–13 px sideways on the iPad (1180 × 720) and small (1024 × 640) screens**. That set reuses the
NCM 8 Pythagoras kinds (`ncm8-ch1` 1.03 `hyp`/`exact`), so the fix belongs in `ncm8-ch1.ts`; do it in the NCM 8 audit
below. (The rest of the board-check log was still running at handoff time; if `git log` shows no "published" commit
after `1123f5a`, build and publish as in "Build and publish" below before starting Step 1.)

Left as found in 9 Std, to raise with the user in Step 3: 6.03/6.04 networks have no "is it connected" question
(Path, extension); 7.05 has no "no solution" question; the NCM 9 Advanced kind `costs` (reused in 9 Std 3.06) uses the
textbook's name "Alla" (it is in `ncm9-ch3.ts`, a 9 Advanced file, so it was not changed).

## Step 1: NCM 8 audit (do this first, the textbook is to hand)

- Textbook: public repo `johndent21-hash/Year-8-Advanced` (`Chapter 1 Pythagoras_ Theorem.pdf` … `Chapter 12 Similar
  Figures and Surface Area.pdf`). Add it with `add_repo` if it is not in the session, then
  `GIT_LFS_SKIP_SMUDGE=1 git clone -q --depth 1 https://github.com/johndent21-hash/Year-8-Advanced /home/user/Year-8-Advanced`
  (if the PDFs come out as LFS pointer files, run `git lfs pull` in that folder).
- Already checked: **all 121 exercises in the book have a set** (121 of 121, same numbers). So this is a question-type
  audit, not a missing-sets job.
- NCM 8 kinds were mostly written for NCM 8 itself (less title-matching than 9 Std), so expect fewer gaps. The 9 Std
  audit still found NCM 8 kinds that sit below the book's level (e.g. `binomial` only does (x + p)(x + q) with p, q > 0;
  `square` (x² = c) has no "no solution" case). Check each exercise's question types the same way.
- Files: `src/content/games/ncm8-chN.ts`; checks in `tests/game-checks/ncm8-chN.ts` (`rework8ChN` in
  `OTHER_CHAPTERS` of `tests/games.test.ts`).

## Step 2: NCM 7 audit

- Textbook: not yet located. Probably the public repo **`johndent21-hash/Year-7-Standard`** (unchecked). Add it with
  `add_repo` and list its files before cloning. If NCM 7 isn't there, ask the user.
- NCM 7 has 12 chapters and 123 sets. First compare the book's exercise numbers with the sets (the command below),
  then audit question types.
- Files: `src/content/games/ncm7-chN.ts`. Checks: `tests/game-checks/ncm7-chN.ts`, **except Chapter 8, which is checked
  by `rework` inside `tests/games.test.ts`**.

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

- 2.03 sideways spill on iPad and small screens (S, if not already fixed in Step 1).
- The open-top cylinder question (NCM 8 12.05 `open`) shows a closed cylinder (S).
- Remove the textbook's name "Alla" from the 9 Advanced `costs` kind (XS, but it touches a 9 Advanced file: ask).
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
