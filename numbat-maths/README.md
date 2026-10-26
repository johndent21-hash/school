# Numbat Maths

A Mathsonline-style practice site for NSW Years 7–9 (NSW Mathematics K–10 Syllabus, Stage 4 and Stage 5 core),
with optional Years 3–4 (Stage 2).
Lessons with step-by-step worked examples, auto-marked practice sets, topic tests, class codes with student PINs,
a teacher markbook and tasks.

The live app is built on Macaly (TanStack Start + Convex). This folder is the source of truth for the parts written here:

| Folder | What it is | Where it lives in the Macaly app |
| --- | --- | --- |
| `src/content/` | Years 7–9: 35 topics, 124 skills. Years 3–4 (Stage 2): 21 topics, 75 skills (`y3*.ts`, `y4*.ts`). Each skill is a question generator with Foundation / Standard / Challenge levels | `src/content/` |
| `src/lib/maths/` | Formatting, answer checking (fractions, expressions, coordinates, scientific notation…), SVG diagrams | `src/lib/maths/` |
| `src/maths.css` | Maths typesetting and diagram styles | `src/maths.css` |
| `app/src/` | Pages, components, session and progress code, theme | `src/` |
| `app/convex/` | Backend: teacher accounts, classes, student PIN log-in, results, tasks | `convex/` |

## Checks

```bash
npm install
npx tsx tests/engine.test.ts                 # answer checker and formatting
N=400 npx tsx tests/content.test.ts          # every generator: self-check + independent re-calculation
STAGE2=1 N=300 npx tsx tests/content.test.ts # the same, including Years 3–4
STAGE2=1 npx tsx tests/stage2.test.ts        # Years 3–4: answers recomputed from the drawn diagrams, plus wording checks
ONLY=y8-pyt-hyp K=5 npx tsx tests/dump.ts    # print sample questions for one skill

cd backend-test && npm install --legacy-peer-deps && ./sync.sh && npx vitest run   # backend logic in memory

cd harness && npm install && ./sync.sh && npm run dev                              # local copy of the site on :3100
node qa/sweep.mjs     # answers every skill's practice set through the browser (needs qa/ids.json)
VITE_STAGE2=1 npm run dev; IDS=qa/ids-s2.json node qa/sweep.mjs                    # the same for Years 3–4

cd harness && ./build-preview.sh out.html                                          # stand-alone preview page (log-ins off)
cd harness && VITE_STAGE2=1 ./build-preview.sh out.html "Numbat Maths 3–9"         # preview with Years 3–4 added
```

Years 3 and 4 are only included when the site is built with `VITE_STAGE2=1`. Year 3 follows the syllabus's
Stage 2 Part A focus areas and Year 4 the Part B focus areas; schools may split Stage 2 differently.

`harness/` and `backend-test/` contain small stand-ins for files the Macaly template provides
(router, Convex provider, generated Convex API) so the site and backend can be tested outside Macaly.
`harness/sync.sh` adds a test-only hook that exposes the current answer to the browser tests; it is never in the app.

## Owner tasks (Convex CLI in the Macaly sandbox)

- Reset a teacher's password: `npx convex run admin:resetTeacherPassword '{"email":"…","newPassword":"…"}'`
- Remove a teacher and all their classes: `npx convex run admin:deleteTeacherByEmail '{"email":"…"}'`
- Teachers need the staff access code (Convex environment variable `TEACHER_SIGNUP_CODE`) to create an account.
