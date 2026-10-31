Build "The Fractal Five – Year 8": start-of-lesson formula warm-up booklets for Kingscliff High School (NSW) that revise the Year 7 formulas. There are two versions, **Mainstream** and **Advanced**, each with four booklets (Terms 1–4). Each booklet is a title page plus 30 one-page sessions (Weeks 1–10, Sessions 1–3), with 5 questions per session, one from each of 5 strands. It's the Year 8 version of my Year 9 and Year 10 "The Fractal Five", so reuse that code.

Every decision is in this prompt. Don't read any textbook PDFs (the "Test Yourself" files are textbook scans), and only ask me something if it can't be done as written. Build straight through: there is no checkpoint this time, but run every check below before you show me anything.

## How to work efficiently
- Work directly in this session; don't use subagents.
- Start from the Year 10 code in `school/fractal-five/y10` (branch `claude/wizardly-planck-4kkysi`). It has the newest engine: layout, diagrams, scheduler, overflow and formula-strip checks, answer keys, `qa.py`, `verify_answers.py`, `labelcheck.py`, `gallery.py`. Read `y10/HANDOFF.md` first.
- Many Year 7 families already exist in the Year 9 code (`school/fractal-five/wu/gen.py`, `wdia.py`; branch `claude/vibrant-johnson-piris7` if it's not on yours). Bring back their generators, pools and diagrams rather than rewriting them.
- Copy `y10/wu`, `y10/opts` and `y10/fonts` into `school/fractal-five/y8/` and work only there. Don't change the Year 9 or Year 10 code.
- The cover is already designed: option C in `school/fractal-five/y8_options/` (`covers8.py`, `art8.py`, the `apollonian_glass` art). Reuse it.
- Keep terminal output short (pipe long output through tail). Render artwork at preview size first, then once at full size, and cache it. After a fix, rebuild only what changed.

## 1. Set up
- weasyprint==70.0 exactly, plus pypdf, numpy, scipy, Pillow, poppler-utils. Install the bundled Poppins and Open Sans fonts and confirm with pdffonts that only those are embedded. Never use a character the fonts lack (U+2153 "⅓" falls back to another font; use a stacked fraction).
- All paths relative to `y8/`.

## 2. Labels and outputs
- Session header: "Mathematics · Year 8 · The Fractal Five". Cover top right: "Mathematics / Year 8 · Formula warm-ups". PDF titles "The Fractal Five — Year 8, Term N" and "The Fractal Five — Year 8 Advanced, Term N".
- Outputs: `out/The_Fractal_Five_Year_8_Term_N.pdf` and `out/The_Fractal_Five_Year_8_Advanced_Term_N.pdf` (31 pages each), and an answer key for each: `out/The_Fractal_Five_Year_8_Term_N_Answers.pdf` and `out/The_Fractal_Five_Year_8_Advanced_Term_N_Answers.pdf`.

## 3. Title page (light theme)
Use sample C exactly: white page; Kingscliff logo without a box; ink #1C1A33; "Five questions. Every lesson." kicker; "The Fractal Five"; the pill on the same line as "Five"; rainbow bar; "Weeks 1–10 · 30 sessions · 150 questions"; chip; TERM N tab on the right edge; Name/Class box; light footer band (#F4F2FA) with a thin rainbow line on top.
- **Artwork:** the integer Apollonian gasket (−1, 2, 2, 3) as vector SVG, R 68 mm, centred at (105, 183) mm. Stained-glass jewel palette (ruby #D7263D, amber #F46036, topaz #F2C14E, emerald #1B998B, sapphire #2E86DE, amethyst #6F2DBD), coloured by angle round the centre, with white leading and a soft sheen on the larger panes.
- **Caption (keep it):** "Apollonian gasket – every circle touches three others; every curvature is a whole number".
- **Mainstream accents:** ruby "Five", emerald pill "YEAR 8" (white text), sapphire tab (white text), amethyst kicker, emerald chip.
- **Advanced accents:** sapphire "Five", amethyst pill "YEAR 8 ADVANCED" (white text), emerald tab (white text), ruby kicker, amethyst chip. Make sure the longer pill fits comfortably before the tab.
- **Chip:** Mainstream says "Formulas provided" in all terms. Advanced says "Formulas provided" in Terms 1–2 and "Formulas from memory" in Terms 3–4.

## 4. Inside pages
Keep the approved white layout and house blue from Years 9 and 10. Replace the strips with faint stained-glass Apollonian strips:
- A row of small integer Apollonian gaskets touching side by side, about 8 mm tall under the header and about 12 mm tall at the foot.
- Coloured left to right round the jewel palette at about 35% opacity on white, with white leading, fading out at both ends. The footer also fades towards the table.
- JPEG, quality 70, 1200 px wide. Check one page in greyscale: the darkest strip pixel should be no darker than about 200/255, so the strips never compete with the questions or spoil photocopies.

## 5. Questions
Generate all 30 sessions from `gen.py`.

**Rules**
- One question from each strand per session.
- No identical question twice in a term.
- Every family at least 3 times a term.
- The weighted families come up more often (counts below). A family may appear in consecutive sessions, but avoid it where the counts allow.
- Every answer computed in code from the same numbers that label the diagram.
- The overflow check must pass. No label may touch a line, arc or another label.

**Numbers**
- Whole numbers in every question and answer, in both versions and all terms.
- Exceptions:
  - Answers involving π are given to 1 decimal place, and the question says so.
  - The decimals and fraction–decimal–percentage families are about decimals, so decimals appear there.
  - Probabilities are fractions.
- Nothing harder than the Year 7 course (Year 8 Advanced Terms 3–4 excepted, below).

**Mainstream**
- Year 7 families only, in all four terms.
- The same level all year: one pool, with fresh numbers each term. A term prefers items the previous term didn't use.
- Formula printed in every question (the Terms 1–2 working column) in all four terms.

**Advanced**
- Terms 1–2 are the same Year 7 families and pool as Mainstream, drawn with their own seed, with the formula printed.
- Terms 3–4 add the Year 8 families below, and the formula is from memory (including the new Year 8 formulas).

**Contexts**
- Local Tweed/Kingscliff flavour where it fits naturally: Kingscliff Beach, Cudgen Creek, the Tweed River, Cabarita, Pottsville, Murwillumbah, Tweed Heads, the M1, surf club, touch footy, netball, rugby league, the markets.
- Keep distances realistic (for example Kingscliff to Murwillumbah about 25 km, to Tweed Heads about 15 km).
- Plain everyday wording; dollars and metric units.

Families are listed as: id – printed formula or rule – question – diagram – numbers. "Y9" or "Y10" means reuse that generator.

### A. Angles and shapes (6 families; 5 each)
- `ang_comp` – Complementary angles add to 90°; supplementary angles add to 180° – find *x* – a right angle split in two, or a straight angle split in two, drawn to scale (new diagram; Y9 `angles_line` for the straight one) – whole degrees.
- `ang_point` – Angles at a point add to 360°; vertically opposite angles are equal – Y9 `ang_line` point and vertically opposite items.
- `ang_par` – Corresponding angles are equal, alternate angles are equal, co-interior angles add to 180° – Y9 `ang_par`.
- `ang_tri` – *a* + *b* + *c* = 180° – Y9.
- `ang_ext` – Exterior angle = sum of the two interior opposite angles – Y9.
- `ang_quad` – *a* + *b* + *c* + *d* = 360° – Y9.
- **Advanced Terms 3–4 add** `pyth_hyp` (*c*² = *a*² + *b*²) and `pyth_short` (*a*² = *c*² − *b*²) from Y10, with Pythagorean triples only so answers stay whole. That makes 8 families, about 3–4 each, with Pythagoras at least 4 each.

### B. Measurement (8 families; area and perimeter weighted)
- `perimeter` – *P* = 2(*l* + *w*), *P* = 4*s* (and adding the sides of other shapes) – rectangle/square diagram (Y9 `rect`), plus simple polygons with every side labelled – whole cm/m.
- `circ` – *C* = π*d*, *C* = 2π*r* – Y9 circle diagrams – 1 decimal place.
- `a_rect` – *A* = *lw*, *A* = *s*² – Y9 `a_rect`, plus squares.
- `a_tri` – *A* = ½*bh* – Y9.
- `a_para` – *A* = *bh* – Y9.
- `a_comp` – Area of a composite shape = add (or subtract) the areas of its parts – L-shapes and rectangle + triangle shapes with every needed length labelled – new diagram, drawn to scale.
- `v_rect` – *V* = *lwh* – Y9 `box`.
- `units` – 1 cm = 10 mm, 1 m = 100 cm, 1 km = 1000 m, 1 m² = 10 000 cm², 1 cm³ = 1 mL, 1 L = 1000 mL – "Convert 3.5 m to cm" style, with a small table where it helps – whole-number answers.
- **Counts:** `perimeter`, `circ`, `a_rect`, `a_tri`, `a_para`, `a_comp` 4 each; `v_rect`, `units` 3 each.
- **Advanced Terms 3–4:** add `a_trap` (*A* = ½*h*(*a* + *b*)), `a_kite` (rhombus/kite, *A* = ½*xy*) and `a_circle` (*A* = π*r*², 1 dp) from Y9, 4 each. Drop `a_rect` and `units` in those terms only: rectangles still appear inside `perimeter` and `a_comp`. That leaves `perimeter`, `circ`, `a_tri`, `a_para`, `a_comp`, `v_rect` at 3 each.

### C. Number and percentages (7 families; fractions and percentages weighted)
- `order_ops` – Brackets first, then × and ÷ from left to right, then + and − from left to right – integers including negatives, e.g. −3 + 4 × (−2).
- `idx_root` – *a*ⁿ = *a* × *a* × … (n times); √ and ∛ – "Evaluate 2⁵", "√81 + ∛27".
- `frac_qty` – Fraction of a quantity = fraction × quantity – "Find ¾ of 60".
- `pct_qty` – Percentage of a quantity = percentage ÷ 100 × quantity – Y9 `pct_qty` (whole answers).
- `pct_express` – Percentage = part ÷ whole × 100% – "18 out of 24 as a percentage".
- `pow10` – Multiplying by 10, 100, 1000 moves the digits left; dividing moves them right – "3.7 × 100", "450 ÷ 1000".
- `fdp` – Fraction ↔ decimal ↔ percentage – "Write 3/8 as a decimal", "Write 0.35 as a fraction in simplest form", "Write 2/5 as a percentage".
- **Counts:** `frac_qty`, `pct_qty`, `pct_express`, `fdp` 5 each; `order_ops`, `idx_root`, `pow10` 3–4 each (total 30).
- **Advanced Terms 3–4 add:**
  - `idx_laws` – Y9 `idx`: multiply, divide, power of a power; numerical and pronumeral bases; whole indices.
  - `pct_change` – Y10: increase and decrease by a percentage, with percentage profit and loss as a sub-formula (Y10 `profit_pct`); whole numbers.
  - That makes 9 families: the five percentage and fraction families 3–4 each, the rest 3 each.

### D. Algebra, ratio and rates (8 families; equations and substitution weighted)
- `subst` – Substitute, then evaluate (the question's own rule) – "Find 3*a* + 2*b* when *a* = 4 and *b* = 5".
- `distrib` – *a*(*b* + *c*) = *ab* + *ac* – Y9.
- `equation` – Do the same to both sides – one-step and two-step, e.g. 3*x* + 5 = 20.
- `ratio_simp` – Divide both parts by their highest common factor – "Simplify 12 : 18".
- `ratio_share` – One part = amount ÷ total number of parts – Y10 `ratio` (whole shares).
- `rates` – Unit rate = amount ÷ number of units; best buy = lowest price per unit – "$6 for 3 kg", with a small comparison table for best buys.
- `speed` – Speed = distance ÷ time – Y9 (whole numbers, local journeys).
- `time` – 24-hour time and time differences – "A bus leaves Kingscliff at 08:45 and reaches Murwillumbah at 09:20. How long is the trip?"
- **Counts:** `subst`, `distrib`, `equation` 5 each; the other five 3 each.

### E. Number plane, data and chance (7 families; about 4–5 each)
- `table_vals` – Substitute each *x* into the rule – "Complete the table for *y* = 2*x* + 3" (missing values in a small table); some items read a point from a small number plane (Y9 `plane_line`).
- `mean` – Mean = sum of scores ÷ number of scores – Y9 (whole means).
- `med_mode` – Median = middle score when ordered; mode = most common – small data sets or a dot plot.
- `range` – Range = highest − lowest – Y9.
- `prob` – *P*(E) = favourable outcomes ÷ total outcomes – Y9.
- `prob_not` – *P*(not E) = 1 − *P*(E) – Y9.
- `exp_prob` – Experimental probability = frequency ÷ number of trials – results table (Y10 `freq` relative-frequency items).

## 6. Small files (this matters to me)
- Every raster image (logo, strips) is a JPEG at about quality 70, longest side about 1200 px.
- The gasket and all diagrams stay vector.
- Each booklet under 0.5 MB; each answer key under 100 KB. Report the sizes.

## 7. Build everything, then check
- Build all 8 booklets (31 pages each) and all 8 answer keys in the Year 10 format: A4, at most 2 pages, one row per session (Week, Session, Q1–Q5 with units), the booklet's fonts, no images. Page 2 lists the NSW Stage 4 outcomes practised. Mark any code you couldn't confirm on the NESA site, and tell me if NESA can't be reached.
- **Checks:**
  - the overflow check passes in all 8 booklets
  - recompute every answer with a separate script (the Year 10 `verify_answers.py` approach: from the printed text, labels and drawings), and show 20 random ones in full
  - a table of how many times each family appears in each term, for each version, showing the weighting
  - confirm there are no identical questions within a term
  - run the pixel label check
  - check one inside page in greyscale
  - look at every cover and two or three pages from each booklet
- Write `y8/HANDOFF.md` and zip the y8 code as `out/The_Fractal_Five_Year_8_BUILD_SOURCE.zip`.

## 8. Google Drive
- **Folder:** "Kingscliff Maths Resources 7–12" (id 1kJSCCR68EnUdiTqjzADZv-pyT8nUsgsj) › "Year 08" (id 17bcTCy0VtRdPgozJMvlzWKIOOhzOzGkl) › "Warm-ups – The Fractal Five". Create it if it isn't there, and don't touch my other folders.
- **Names:** `Yr8_The_Fractal_Five_Term_N_Warm-Ups.pdf`, `Yr8_The_Fractal_Five_Term_N_Answers.pdf`, `Yr8_Advanced_The_Fractal_Five_Term_N_Warm-Ups.pdf` and `Yr8_Advanced_The_Fractal_Five_Term_N_Answers.pdf`. Upload only these 16 final files, not samples or the source zip.
- **Duplicates:** check before uploading; if a file with the same name exists, ask me or add "v2".
- **Upload with** `drive-upload/upload.sh` from branch `claude/math-resources-drive-a5l2lp`. It goes through my Apps Script and needs DRIVE_UPLOAD_URL and DRIVE_UPLOAD_KEY. The Drive connector can't list files the Apps Script creates, so rely on the script's returned links.
- **If uploading fails:** tell me, then give me a zip arranged in the matching folder structure, with the exact Drive folder to drop it into.
- **Finish** with a short summary: what was built, the outcomes covered, what you checked, anything you fixed, anything you're unsure of, and in a line or two what went into Drive and where.
