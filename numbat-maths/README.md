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
  Basic in Year 7; √, x², xʸ, π and Ans from Year 8; sin, cos, tan and their inverses (degrees) in Year 9 for trigonometry.
- **Rewards** (`app/src/lib/rewards.ts`, `Rewards.tsx`): levels from points (Joey to Numbat), 19 badges, a weekly goal ring
  (default 5 sets a week, set per class by the teacher) and a streak of weeks in a row the goal was met. All worked out
  from results, so nothing extra is stored.
- **Teacher overview and charts** (`app/src/lib/insights.ts`, `Charts.tsx`): who practised this week, who may need help,
  the skills the class finds hardest, task completion, and week-by-week charts for the class and each student.
- **Example class** (`app/src/lib/demo.ts`): in the stand-alone preview the teacher pages use 24 made-up students so they
  can be tried without log-ins; changes are switched off there.

The live app is built on Macaly (TanStack Start + Convex). This folder is the source of truth for the parts written here:

| Folder | What it is | Where it lives in the Macaly app |
| --- | --- | --- |
| `src/content/` | Years 7–9: 35 topics, 124 skills. Years 1–2 (Stage 1): 18 topics, 50 skills (`y1*.ts`, `y2*.ts`). Years 3–4 (Stage 2): 21 topics, 75 skills (`y3*.ts`, `y4*.ts`). Each skill is a question generator with Foundation / Standard / Challenge levels | `src/content/` |
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
ONLY=y8-pyt-hyp K=5 npx tsx tests/dump.ts    # print sample questions for one skill
npx tsx tests/keypad.test.ts                 # every typed answer (Years 1–9) can be entered with the keypad and is marked right
npx tsx tests/calc.test.ts                   # calculator arithmetic, errors and display
TZ=Australia/Sydney npx tsx tests/rewards.test.ts    # levels, Monday weeks (incl. daylight saving), streaks, badges
TZ=Australia/Sydney npx tsx tests/insights.test.ts   # teacher overview numbers, recounted against the example class

cd backend-test && npm install --legacy-peer-deps && ./sync.sh && npx vitest run   # backend logic in memory

cd harness && npm install && ./sync.sh && npm run dev                              # local copy of the site on :3100
node qa/sweep.mjs     # answers every skill's practice set through the browser (needs qa/ids.json)
VITE_STAGE1=1 VITE_STAGE2=1 npm run dev; IDS=qa/ids-s1.json node qa/sweep.mjs     # the same for Years 1–2 (ids-s2.json: Years 3–4)

node qa/keypad-check.mjs    # (with Years 1–4 on) answers questions with the on-screen keypad (phone) and tries the calculator
node qa/rewards-check.mjs                                                          # guest rewards: celebration after a set, home dashboard
VITE_PREVIEW_ONLY=1 npx vite dev --port 3102; node qa/teacher-demo-check.mjs       # example class on the teacher pages

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
