# Handoff: finish the Year 9 Standard class games

For the next session. Goal: **finish New Century Maths 9 (Standard)** to the same quality as NCM 7 and 8, as
efficiently as possible, then publish once and stop. Update this file when done.

## Status: done (14 Nov 2026)

The exercise-by-exercise audit is finished for all 13 chapters (91 sets, now 253 kinds). Every gap in the table below
was fixed, and the rest of the audit found more, all fixed: 1.08 HCF of terms; 1.09 binomials with negatives and
coefficients, perfect squares; 2.01 square roots (outcome corrected: square roots MA4-IND-C-01 and irrational numbers
MA4-FRC-C-01 are Stage 4, only the word "surd" is Path); 3.02 fractions to decimals and recurring decimals; 3.03 mixed
numerals and comparing; 3.04 ordering; 3.05 one amount as a percentage of another; 3.06 GST included; 3.07 finding
the rate or time; 3.08 rates (the book's 3.08 is ratios *and* rates); 5.05 writing negative indices; 6.01/6.02 reasons
for angle steps; 8.03 is "Commission, piecework and leave loading" in the book (retitled, leave loading moved there);
9.01 a missing score from the mean; 10.01 rebuilt (the book's 10.01 is length/mass/capacity/time prefixes, not area
or volume units; outcome MA5-MAG-C-01); 11.04 x-intercepts, horizontal and vertical lines; 11.05 steepest line;
11.10 concave up/down and vertex; 12.01 complements as percentages; 12.05 draws without replacement (dependent events
are core MA5-PRO-C-01). Ch 9 needs no quartiles or IQR (none in the chapter). 13 new kinds, each with an independent
check and a planted-error test (all caught). Board check (sets of Chapters 1, 2, 3, 5, 6, 8–13 and all 13 chapter
games) and the one publish: see the next commit.

Not done (left as found): Ch 4 and Ch 7 matched the book already. 6.03/6.04 networks have no "connected graph"
question (Path, extension). 7.05 has no "no solution" question. The NCM 9 Advanced kind `costs` (reused in 3.06) uses
the textbook's name "Alla" in its prompt; it lives in `ncm9-ch3.ts` (9 Advanced, paused), so it was not changed.
The open-top cylinder drawing (NCM 8 kind) is unchanged.

## Scope (from the user)

- **Do:** NCM 9 Standard only (`src/content/games/ncm9s.ts`, book id `ncm9s`, 13 chapters, 91 sets, 216 kinds).
- **Don't:** NCM 9 Advanced (paused after Ch 5; its Ch 1–5 stay in the repo but are left out of builds), 10 Standard,
  10 Advanced. Don't start them unless the user asks.
- **Quality must not drop; usage must be minimal.** Prefer reusing existing kinds; write new kinds only where an
  exercise has a question type nothing covers.
- Repo `johndent21-hash/school`, folder `numbat-maths/`, branch **`claude/numbat-maths-game-section-5nghxv`** only.
  No pull requests. Commit messages end with the attribution lines the session's system reminder gives.
- Preview: artifact https://claude.ai/artifact/NHrcC9eBrYkDQ8f8CXFiYU (Version 22 = NCM 7, NCM 8, NCM 9 Standard).
  `read` it once before republishing; publish the same scratchpad file name, no icon.
- Textbook: public repo `johndent21-hash/Year-9-Standard` (clone read-only:
  `GIT_LFS_SKIP_SMUDGE=1 git clone -q --depth 1 https://github.com/johndent21-hash/year-9-standard /home/user/johndent21-hash/year-9-standard`).
  PDFs `01 Algebra (1).pdf` … `13 Similar figures_compressed.pdf`, plus the NESA K–10 syllabus PDF. Never copy textbook
  wording or numbers.
- Syllabus: NSW Mathematics K–10 (2022). Every set lists its outcome; Stage 4 work is labelled revision; Path content
  has empty `outcomes` and a teacher note saying extension (code in the note).

## What "finish" means: an exercise-by-exercise coverage audit

Version 22 was built by matching **exercise titles** to existing kinds. The question types inside each exercise were
not checked one by one, and a spot check found real gaps. For each chapter:

1. List the textbook exercise's question stems (the command below), and the set's current kinds
   (`npx tsx tests/list-ncm9s.ts <chapter>`; `kind*` = written for 9 Std, `kind<source>` = reused).
2. For each question type in the exercise: covered by a kind at the right level? If not, add a kind (prefer
   reusing one from NCM 7/8/9 Adv; check `tests/list-ncm9s.ts`-style listings of those books) or write a new one.
3. Check the outcome code against the syllabus content for that exercise (not just the chapter).

**Gaps already found** (fix these first, then audit the remaining exercises the same way):

| Ex | Gap |
|---|---|
| 3.01 Integers | comparing (<, >) and ordering integers are missing; the set only has operations |
| 8.04 Income tax | taxable income = income − allowable deductions (and whether the book uses the Medicare levy); the set has only leave loading and a simple scale |
| 8.05 PAYG / net pay | check against the book (PAYG from a weekly or fortnightly amount, annual adjustments) |
| 10.01 Metric units | choosing a sensible unit; capacity and volume conversions (kL to mL) |
| 10.09 Volumes | V = lwh for boxes and converting volume units (cm³ ↔ m³, mm³) as well as V = Ah and cylinders |
| 13.03 Scale drawings | finding the scale from a drawn length and the real length (1 : n), not only using a given scale |

Likely worth checking closely: Ch 9 (data: confirm no quartiles or IQR are needed; a spot grep found none),
Ch 11.04–11.06 (the book's own graph types), Ch 6.01–6.02 (proofs or reasons?), 2.01 surds (the book's scope).

Known minor issues (fix only if cheap): once, the Chapter 2 mixed game spilled 11 px sideways on the 1024 × 640 screen
(not reproduced in 120 more questions); the open-top cylinder (10.08) uses the closed-cylinder drawing.

## How the Standard book is built

- `src/content/games/ncm9s.ts`: chapters made with `S(ch, exn, title, focus, outcomes, parts, note?)`, where each part
  is a reused kind `[CHAPTER, 'exercise', 'kind', 'newName?']` or a new maker `mk('kind', fn, d)`.
- `reuse()` keeps a kind's original source (`meta.reused`), so a reused kind is checked by the chapter that first
  made it. New kinds are checked by `tests/game-checks/ncm9s.ts` (one `solve` keyed by the kind name `t`), registered
  in `OTHER_CHAPTERS` in `tests/games.test.ts` for `ncm9s-6, -8, -10, -11, -12`. **Add the chapter key**
  (e.g. `'ncm9s-3': rework9S`) when a chapter gets its first new kind.
- A new kind: `gq({t, prompt, diagram?, correct, wrong | inOrder, why, meta: {}})`: exactly 4 options; prompt ≤ 175
  characters; options ≤ 42; wrong = likely mistakes first, then 2–3 spares (`wrongs()` helper adds spares);
  `why` must contain the answer. Each set needs ≥ 15 different questions (vary numbers; add a second kind if needed).
- The checker works the answer out from what the student sees (prompt text, SVG), never from `meta`; exactly one
  option may equal it.
- README: the Year 9 Standard entry (search "New Century Maths 9 (Standard)") lists the new kinds: keep it current.

## Commands (from `numbat-maths/`; `S=/tmp/claude-0/<session scratchpad>`)

```
npm ci; (cd harness && npm ci)                       # fresh container only; Playwright: ln -sfn /opt/node-tools/node_modules/playwright node_modules/playwright
npx tsc --noEmit -p tsconfig.json 2>&1 | grep -v playwright
N=150 npx tsx tests/games.test.ts > $S/t.log 2>&1; grep -E "^\s+[0-9]+ × " $S/t.log | sort | uniq | head; tail -1 $S/t.log
python3 qa/plant.py src/content/games/ncm9s.ts "exact old snippet" "wrong snippet"   # once per new kind
# textbook stems for one exercise (after pdftotext -layout of the chapter PDF into $S/c.txt):
n=$(grep -n "EXERCISE 3.01" $S/c.txt | cut -d: -f1); sed -n "$((n+1)),$((n+70))p" $S/c.txt | grep -E "^\s*[0-9]+\s+[A-Z]" | cut -c1-100
# full run before every commit; commit ONLY if it prints "all passed":
N=400 npx tsx tests/games.test.ts > $S/t.log 2>&1; tail -1 $S/t.log; grep -q "^all passed" $S/t.log && git commit ...
```

Board check (only the chapters you changed), build and publish, once at the end:

```
cd harness && ./sync.sh                              # never while a board check runs
# dev server: run in the background with the longest timeout (it dies when the container restarts)
VITE_PREVIEW_ONLY=1 VITE_CONVEX_URL=https://preview-only.convex.cloud VITE_STAGE1=1 VITE_STAGE2=1 npx vite dev --port 3102 --host 127.0.0.1
# per changed chapter, in the background, logging to a file (never pipe through tail):
ONLY=ncm9s-3. SHOTS=$S/board/3 node qa/game-check.mjs   # sets of Ch 3 (the dot stops ncm9s-1 matching 10–13)
ONLY=ncm9s-ch3 SHOTS=$S/board/ch3 node qa/game-check.mjs
# build WITHOUT the NCM 9 Advanced book: delete the { id: 'ncm9', … } entry from src/content/games/index.ts, build,
# then `git checkout src/content/games/index.ts`
cd harness && VITE_STAGE1=1 VITE_STAGE2=1 ./build-preview.sh $S/numbat-maths-1-9.html "Numbat Maths 1–9"
node qa/game-preview-check.mjs $S/numbat-maths-1-9.html
grep -c "New Century Maths 9 Advanced" $S/numbat-maths-1-9.html   # must be 0
```

## Pitfalls already hit (don't repeat)

- Distractors that equal the answer leave < 3 wrong options (e.g. 2 × 2 = 2 + 2, answer 0 or 1, (0, 0)): always add spares.
- `inOrder` lists: the right answer must be able to fall in every slot (a test checks this).
- Floating point: round with whole numbers (0.007005 to 3 s.f. came out as 0.007); use relative tolerances for tiny
  numbers; algebraic fractions need non-whole test points (denominators can be 0 at whole numbers).
- Plain text of a prompt puts spaces where tags were ("24π m ." / "sum of −1 ?"): normalise `\s+([.?,)])` but never
  touch colons (ratios "2 : 3").
- A planted error that equals a listed distractor makes `gq` throw instead of testing the checker: plant another value.
- The Bash safety check rejects heredocs containing `$${`: write Python edit scripts to a file in the scratchpad.
- Outcome codes: check the syllabus line, don't guess (surds are MA5-IND-P-02; algebraic negative indices are
  MA5-IND-P-01; networks MA5-NET-P-01; Venn/two-way MA5-PRO-P-01; direct variation MA5-RAT-P-01).
- `ONLY=ncm9s-1` also matches Chapters 10–13: use `ncm9s-1.`.

## Keeping usage down

- Audit with the two listing commands above; read only exercise stems, not whole chapters or whole source files.
- Send test output to a file and `grep` it; read files with `sed -n`/`grep`, not whole.
- No gallery screenshots unless a kind has a new kind of drawing (prefer text-only kinds).
- One board check of the changed chapters, one build, one publish, one short report to the user, then stop.
