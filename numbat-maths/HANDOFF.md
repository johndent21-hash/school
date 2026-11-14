# Handoff: Numbat Maths class games

Notes for picking up this work in a new session. Delete or update when the work is done.

## The job

Build the class game (`/games`, an on-the-board team quiz) for every exercise in the New Century Maths textbooks:
NCM 7 is done (all 12 chapters). Now **NCM 8**, then NCM 9, then NCM 10, one chapter at a time. The user said
"keep going with Year 8".

- Repo `johndent21-hash/school`, folder `numbat-maths/`. Branch **`claude/numbat-maths-game-section-5nghxv`** only. No pull requests.
- Textbook PDFs: repo `johndent21-hash/Year-8-Advanced` (`Chapter N *.pdf`); Year 9/10 repos likewise. Extract with
  `pdftotext` into the scratchpad and read only the exercise headings and a few sample questions. Never copy textbook wording or numbers.
- Syllabus: NSW Mathematics K–10 (2022). Put outcome codes on each set. Mark earlier-stage work as revision, and
  starred or later-stage work as extension (`teacherNote`, empty `outcomes`).
- Preview: artifact https://claude.ai/artifact/NHrcC9eBrYkDQ8f8CXFiYU (Version 22: NCM 7, NCM 8 and NCM 9 Standard; the partial NCM 9 Advanced book is left out of builds).
  A new session must `read` it before republishing. Same file name each time, no icon.
- Commit messages end with the attribution lines the session's system reminder gives.

## State right now

NCM 7 and NCM 8 are complete (published, Version 21): every chapter has class games, an independent checker, a README entry, and passes
`N=400 npx tsx tests/games.test.ts` with planted-error checks. **Year 9 Standard is done and PUBLISHED (Version 22)** (`ncm9s.ts`, 13 chapters, 91 sets; board-checked on all screens).
WORK IS STOPPED here at the user's request. Do not start 9 Advanced (Ch 6–13), 10 Standard or 10 Advanced unless
the user asks. When building, remove the `ncm9` (Advanced) book from `index.ts` first, then restore it. NCM 9 Advanced is PAUSED after Ch 5 (user's request,
to save usage); its Ch 1–5 are committed but not board-checked or published. After Year 9 Standard is published,
STOP updating the site: the user does not want 9 Advanced, 10 Standard or 10 Advanced done for now.

NCM 8 notes worth knowing:
- Reused kinds now record `meta.reused` (not `meta.from`, which the unit-conversion kinds already use for the unit).
- New drawings live in `src/lib/maths/diagrams13.ts`: `circleFeature`, `sectorGraph`, `freqTable`, `gridTable`.
- Later-stage chapters marked extension: 6.11 simple interest, 8.03–8.04 Venn/two-way, 9.03, 9.04, 9.08, 11.09,
  11.10, all of Chapter 12 (similar figures, surface area are Stage 5).
- Board check: run per chapter (`ONLY=ncm8-7` etc., plus `ONLY=ncm8-ch7` for chapter games), logging to a file in
  the background; a single `ONLY=ncm8` run takes over 25 minutes. Never pipe it through `tail` (output is lost if it
  is killed).

## How a chapter is built

- File `src/content/games/ncm8-chN.ts` exporting `NCM8_CHN: GameChapter`. One `GameSet` per exercise
  (`id 'ncm8-N.0k'`, `exercise`, `ref`, `title`, `focus`, `outcomes`, `makers`). Model files: `ncm8-ch1.ts` (new kinds),
  `ncm8-ch4.ts` (reuse).
- Each kind: `mk(t, make, d)`, d = 2 for the harder kinds. `make()` returns `gq({t, prompt, diagram?, correct, wrong | inOrder, why, meta})`:
  exactly 4 options; prompt ≤ 175 characters; options ≤ 42; wrong = likely mistakes, most likely first; `meta` must not use the key `t`.
- Revision of a Year 7 kind: `reuse(NCM7_CHx, 'x.yy', 'kind', 'newName?')`. It is checked by the Year 7 checker automatically.
- Checker `tests/game-checks/ncm8-chN.ts` exports `rework(set, q, ctx): Expect`, where `Expect` is `{v, unit?}`, `{text}` or `null`.
  It must work the answer out again from what the student sees (prompt text, SVG geometry), never from `meta` answers.
  Use exact arithmetic (BigInt or rationals) and check expressions are equal by testing values. `ctx.fail(msg)` reports a problem.
  Model: `tests/game-checks/ncm8-ch1.ts`; algebra helpers are in `tests/game-checks/ncm7-ch5.ts` (`parse`, `same`, `txt`).
- README (`numbat-maths/README.md`): one entry per chapter covering outcomes, revision and extension notes, and how the checker works.

## Commands (from `numbat-maths/`)

```
npm ci                                              # first time in a fresh container (check harness/ too)
npx tsc --noEmit -p tsconfig.json
N=400 npx tsx tests/games.test.ts 2>&1 | tail -15    # all game checks
SHOTS=$SCRATCH/shots ONLY=ncm8-4 ALL=1 K=1 npx tsx tests/gallery-games.ts   # gallery of every kind
cd harness && ./sync.sh                             # before a board check or build
# board check (one browser job at a time, never during sync):
cd harness && VITE_PREVIEW_ONLY=1 VITE_CONVEX_URL=https://preview-only.convex.cloud VITE_STAGE1=1 VITE_STAGE2=1 nohup npx vite dev --port 3102 --host 127.0.0.1 > $SCRATCH/dev.log 2>&1 &
ONLY=ncm8 SHOTS=$SCRATCH/shots node qa/game-check.mjs
# build for the artifact:
cd harness && VITE_STAGE1=1 VITE_STAGE2=1 ./build-preview.sh $SCRATCH/numbat-maths-1-9.html "Numbat Maths 1–9"
node qa/game-preview-check.mjs $SCRATCH/numbat-maths-1-9.html     # needs a static server on 3200 (see qa/)
git -c user.name="Claude" -c user.email="noreply@anthropic.com" commit ...; git push -u origin claude/numbat-maths-game-section-5nghxv
```

## Pitfalls already hit

- `meta.t` overwrote the kind name, so `gq` now throws if `meta` has `t`.
- Distractors that coincide with the answer (2 × 2 = 2 + 2, 4² = 2⁴, √225 = 15) leave fewer than 3 wrong options: add spare candidates.
- With `inOrder`, the right answer must not always fall in the same slot.
- The Bash safety check rejects heredocs containing `$${`. Write a Python edit script to the scratchpad and run it.
- A checker that normalises "text :" to "text:" breaks ratios such as "2 : 3"; leave colons alone.
- Each set needs at least 15 different questions (games of 15 must not repeat): a set with one fixed-wording kind fails.
- Options must be at most 42 characters; long sample/census descriptions had to be shortened.
- On the board, long words in options break the 4-across layout (see `GameBoard.tsx` row4 rule). Keep diagrams small.

## Keeping usage down

- Pipe test output through `tail` or `grep`. Read files in parts (`sed -n`), not whole.
- Look at gallery screenshots only for new diagram kinds, a few at a time. Images cost a lot.
- Board-check and publish once per batch of chapters, not after every chapter.
