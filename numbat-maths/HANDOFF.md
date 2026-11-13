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
- Preview: artifact https://claude.ai/artifact/NHrcC9eBrYkDQ8f8CXFiYU (Version 20 has NCM 7 Ch 1–12 and NCM 8 Ch 1).
  A new session must `read` it before republishing. Same file name each time, no icon.
- Commit messages end with the attribution lines the session's system reminder gives.

## State right now

| NCM 8 chapter | State |
|---|---|
| 1 Pythagoras' theorem | done, published |
| 2 Working with numbers | done, committed, not yet board-checked or published |
| 3 Algebra | done, committed, not yet board-checked or published |
| **4 Geometry** | **in progress**, see below |
| 5–12 | to do: Area and volume; Fractions and percentages; Investigating data; Probability; Equations; Ratios and rates; Graphing linear equations; Similar figures and surface area |

### Chapter 4: what's done and what's left

Done (committed as WIP): `src/content/games/ncm8-ch4.ts` (4.01–4.06 reuse NCM 7 Ch 2 and Ch 6 kinds through
`reuse()`; new 4.07 polygon angle sums and 4.08 networks, both extension), `src/content/games/reuse.ts`, registered
in `src/content/games/index.ts`, and the `meta.from` dispatch in `tests/games.test.ts`. It type-checks.

Left:
1. Write `tests/game-checks/ncm8-ch4.ts` for the new kinds only (reused kinds already go to the NCM 7 checkers):
   `4.07 sum | regular | sides` (read the polygon name or angle from the prompt text and work it out) and
   `4.08 degree | trace` (read the network from the SVG, not from meta: `circle.node` cx/cy, `line.edge` endpoints, the
   letter labels; count degrees and odd vertices; Euler: 0 odd → "Yes, starting anywhere", 2 odd → "Yes, but only from an odd vertex", more → "No: more than 2 odd vertices").
2. Register it as `'ncm8-4'` in `OTHER_CHAPTERS` in `tests/games.test.ts`.
3. `N=400 npx tsx tests/games.test.ts`, then planted errors (change a right answer and confirm the checker fails it), a quick gallery look, README entry, commit, push.

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
- On the board, long words in options break the 4-across layout (see `GameBoard.tsx` row4 rule). Keep diagrams small.

## Keeping usage down

- Pipe test output through `tail` or `grep`. Read files in parts (`sed -n`), not whole.
- Look at gallery screenshots only for new diagram kinds, a few at a time. Images cost a lot.
- Board-check and publish once per batch of chapters, not after every chapter.
