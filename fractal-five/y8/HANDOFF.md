# The Fractal Five - Year 8: build source (Oct 2026)

Start-of-lesson formula warm-ups for Kingscliff High School, Year 8, revising the Year 7 formulas. Two
versions, four booklets each (Terms 1-4); each booklet is a title page + 30 one-page sessions (Weeks 1-10,
Sessions 1-3), 5 questions per session, one from each strand. Built from the Year 10 Fractal Five engine
(`../y10`, branch `claude/wizardly-planck-4kkysi`) with the Year 9 generators and diagrams brought back
(`../wu`, branch `claude/vibrant-johnson-piris7`) and cover option C from `../y8_options`. The Year 9 and
Year 10 code is unchanged; everything here is a copy.

## Outputs (out/)
    The_Fractal_Five_Year_8_Term_N.pdf                    Mainstream, 31 pages, 383-394 KB
    The_Fractal_Five_Year_8_Advanced_Term_N.pdf           Advanced, 31 pages, 354-391 KB
    ..._Term_N_Answers.pdf                                teacher keys: A4, 2 pages (all 30 sessions on page 1,
                                                          Stage 4 outcomes on page 2), no images, 28-29 KB
    The_Fractal_Five_Year_8_BUILD_SOURCE.zip              this folder (code, art, fonts), no out/

## Setup (Linux, Python 3.11-3.13)
    pip install weasyprint==70.0 pypdf numpy scipy Pillow     (exactly 70.0: check.py walks its layout boxes)
    apt: libpango-1.0-0 libpangoft2-1.0-0 libharfbuzz0b libcairo2 libgdk-pixbuf-2.0-0 poppler-utils
    fonts: mkdir -p /usr/local/share/fonts/fractal-five && cp fonts/*.ttf /usr/local/share/fonts/fractal-five/ && fc-cache -f
All paths are relative to this folder. pdffonts shows only Pop-* (Poppins) and OS-* / Open-Sans-* faces.
The fonts have no cube-root sign (U+221B), no arrows and no U+2153: cube roots are a small raised 3 on the
radical sign (formulas.cbrt), and every other root/fraction is built from characters the fonts have.

## Build and check (run from this folder)
    python3 wu/build_all.py out [M,A] [1,2,3,4]   booklets + answer keys + wu/answers_{M|A}_termN.json (~4 min for all 8)
    python3 wu/build_all.py out covers            out/Year8_Covers.pdf (all eight title pages, for checking)
    python3 wu/qa.py                              rule checks + writes wu/formula_counts.md (family/formula counts)
    python3 wu/verify_answers.py --sample 20      independent recompute of all 1200 answers (+20 shown in full)
    python3 wu/labelcheck.py                      200 dpi pixel gaps: label to line/arc and label to label
    python3 wu/poolcheck.py [families]            every pool item set on a page and run through the overflow check
    python3 wu/gallery.py OUT.pdf [families]      every pool item as it prints, with its answer and formula
    python3 wu/gen.py                             self-test: every pool item generates and draws (also after shrinking)
    python3 wu/mkart.py                           re-make the inside-page JPEGs (strips, logo)
Last run (final build): overflow check passes in all 8 booklets (3 shrink rounds each); every formula strip
fits; qa.py 0 rule problems, 0 family repeats in consecutive sessions, 0 items repeated from the previous
term; verify_answers.py 1200/1200; labelcheck 527 figures, 1626 labels, 0 touching (smallest label-to-line
gap 2.4 px = 0.64 mm, label to label 4.9 px); inside page in greyscale: darkest strip pixel 204/255.

## Files
    wu/gen.py          pools (POOL), generators, weighted scheduler, both versions - see below
    wu/formulas.py     FX[key] = (printed formula HTML, size) for every formula key; sqrt/cbrt helpers
    wu/wu.py           page engine (Year 9/10 layout); Session(given=, version=); .xs strip size; .rad roots;
                       dtable(compact="x") for 6-8 scores
    wu/wdia.py         diagrams; Year 8 additions at the end: right_split (complementary), square (ticks),
                       poly_sides (every side labelled), composite ('L', 'house', 'ramp'), dot_plot; journey()
                       takes place names; plane_line(coords=) can leave a point's coordinates off
    wu/bdia.py         figure engine (unchanged)
    wu/build_all.py    cover_pdf (opts/cover8.py), build, fix_overflow, PDF merge (logo stored once)
    wu/answer_key.py   teacher keys from wu/answers_{M|A}_termN.json; outcome list on page 2
    wu/check.py        overflow check (unchanged engine); wu/poolcheck.py runs it over every pool item
    wu/qa.py, wu/verify_answers.py, wu/labelcheck.py, wu/gallery.py   QA (above)
    wu/mkart.py        strip_top.jpg (8 mm gaskets), strip_foot.jpg (12 mm, fades towards the table), logo.jpg
    opts/cover8.py     the title page (option C): accents per version, chip text, cached gasket SVG
    opts/art8.py       apollonian() / apollonian_glass() (and the other option art, unused)
    opts/covers.py, opts/art_opts.py   base cover CSS, logo, Name box, footer (from Year 9/10)

## Design
Title page = sample C: white page, logo without a box, ink #1C1A33, kicker, "The Fractal Five" with the pill
on the "Five" line, rainbow bar, meta line, chip, TERM N tab, Name/Class box, caption "Apollonian gasket -
every circle touches three others; every curvature is a whole number", light footer band #F4F2FA with a thin
rainbow line. Integer Apollonian gasket (-1, 2, 2, 3) as vector SVG, R 68 mm, centred (105, 183) mm, jewel
palette by angle (ruby #D7263D, amber #F46036, topaz #F2C14E, emerald #1B998B, sapphire #2E86DE, amethyst
#6F2DBD), white leading, sheen on the larger panes; cached in opts/art/apollonian_glass.svg.
  Mainstream: ruby "Five", emerald pill YEAR 8, sapphire tab, amethyst kicker, emerald chip "Formulas provided".
  Advanced: sapphire "Five", amethyst pill YEAR 8 ADVANCED (letter-spacing .16em; ends ~40 mm before the tab),
  emerald tab, ruby kicker, amethyst chip "Formulas provided" (T1-2) / "Formulas from memory" (T3-4).
Inside pages: Year 9/10 white layout and house blue; header "Mathematics · Year 8 · The Fractal Five".
Strips: a row of touching integer Apollonian gaskets, left to right round the jewel palette at 35% on white,
white leading, faded at both ends (the foot also towards the table). JPEG q70, 1200 px wide. To keep the
photocopy promise, any pixel darker than 216/255 (greyscale, before JPEG) is eased towards white, so after
JPEG the darkest strip pixel is 200-201 (on the printed page 204); in practice amethyst, ruby and the
darker sapphire/emerald panes print a little lighter than a plain 35%.

## Versions, strands and families (gen.Y7, gen.Y8_ADD)
    A  ang_comp ang_point ang_par ang_tri ang_ext ang_quad                    (+ pyth_hyp pyth_short)
    B  perimeter circ a_rect a_tri a_para a_comp v_rect units                 (+ a_trap a_kite a_circle; - a_rect units)
    C  order_ops idx_root frac_qty pct_qty pct_express pow10 fdp              (+ idx_laws pct_change)
    D  subst distrib equation ratio_simp ratio_share rates speed time
    E  table_vals mean med_mode range prob prob_not exp_prob
(+/-) = Advanced Terms 3-4 only. Mainstream: Year 7 families all year, formula printed. Advanced Terms 1-2:
the same families and pool, own seed, formula printed. Advanced Terms 3-4: Year 8 families added, formulas
from memory ("Write the formula" layout, no strip).
Weighting (gen.counts; table in wu/formula_counts.md):
  A  5 each; Adv T3-4: Pythagoras 4 + 4, angle families 4 (two of them 3: T3 ang_comp/ang_point, T4 ang_par/ang_quad)
  B  perimeter circ a_rect a_tri a_para a_comp 4, v_rect units 3; Adv T3-4: a_trap a_kite a_circle 4, the rest 3
  C  frac_qty pct_qty pct_express fdp 5; order_ops idx_root pow10 3 with one of them 4 (rotates by term);
     Adv T3-4: idx_laws order_ops idx_root pow10 3; pct_change 4; two of the other four at 4 (T3 frac_qty/pct_qty,
     T4 pct_express/fdp)
  D  subst distrib equation 5; ratio_simp ratio_share rates speed time 3
  E  4 each with two at 5, rotating by term (T1 mean/prob, T2 table_vals/med_mode, T3 exp_prob/prob_not,
     T4 range/table_vals)
Reused generators: Year 9 ang_line (point, vertically opposite, straight line), ang_par, ang_tri, ang_ext,
ang_quad, a_rect (+ working backwards), a_tri, a_para, circ, v_rect (box), pct_qty, distrib, speed, mean,
range, prob, prob_not, plane_line, kite, trapezium, idx (as idx_laws); Year 10 pyth_hyp/pyth_short (triples
only), a_circle, ratio (ratio_share), pct_change + profit_pct (pct_change), freq relative-frequency items
(exp_prob, answers as fractions).

## Scheduler and pools (all checked by qa.py)
- One question per strand per session; all 30 sessions generated.
- strand_sequence: each family's appearances spread evenly (ideal positions k x 30 / count, random phase and
  jitter), best of 3000 tries: no family in consecutive sessions (achieved everywhere), largest smallest gap.
- One pool per family (POOL, 653 items). Draw order within a family: the least-used formula key this term
  (sub-formulas rotate), then items the previous term of the same version did not use, then items used least
  in all earlier terms; no repeats within a term (gen.qsig = text + figure labels + answer).
- Working-backwards items (a_rect, a_tri, a_para, v_rect, speed) take about 1 in 4 appearances (SPECIAL).
- Whole numbers everywhere except: pi answers (1 dp; the question says so), pow10 and fdp (decimals by nature),
  units questions may start from a decimal ("Convert 3.5 m to centimetres") but every units answer is whole,
  probabilities are fractions in simplest form (prob_not now gives P(E) as a fraction, not a decimal).
- Composite shapes, polygons and kites use a minimum drawing size (they need the room for their labels);
  every other figure can shrink in the overflow fix.

## Syllabus (listed on page 2 of each answer key)
NESA's site (curriculum.nsw.edu.au) was blocked by this build environment's network policy, so no code was
confirmed there; the codes are the 2022 K-10 Stage 4 codes as used in the Year 9/10 keys. Marked * on the
key: multiplying/dividing by powers of 10 (MA4-FRC-C-01, may be Stage 3 revision), 24-hour time (no Stage 4
code found: probably Stage 3 revision), experimental probability (MA4-PRO-C-01 placement unconfirmed),
percentage change/profit and loss (MA4-FRC-C-01 placement unconfirmed). Beyond Stage 4: Advanced Terms 3-4
index-law questions with pronumeral bases are Stage 5 (MA5-IND-C-01), included as requested and labelled so.

## Mainstream easier (v2), Oct 2026
Mainstream only; Advanced is untouched (its 4 x 150 questions are identical to v1). gen.EASY_DROP
{family: predicate} removes items from the Mainstream pools in Pools.items() (version "M"); Pools.draw uses
self.items(fam). Removed: working backwards (a_rect, a_tri, a_para, v_rect, speed - SPECIAL then finds no rev
item and falls back to the ordinary ones); order_ops with a bracketed negative such as (-2) (8 items);
idx_root roots combined with another term (5); subst negative values (3); equation x/3 + 2 = 7, x/2 - 3 = 5;
fdp 3/8 and 0.125; ratio_simp three-part and unit-conversion items; units m2 <-> cm2 (4); speed with time
in minutes (2); med_mode medians of an even number of scores (3); time 12:30 am, 00:15 and both "add"
items; perimeter "pent". gen.EASY_ADD adds Mainstream-only ratio_simp (20, 35) and (32, 12) so the family
keeps 10; every other family keeps >= 10 (speed 9). Layout, formulas, weighting, diagrams, covers unchanged.
qa.py now checks each item against the version's pool (Pools(v, t).items), so a dropped item in Mainstream
is a rule problem. Checks (Mainstream rebuild): gen.py 0 problems; overflow fixed in 3 rounds per booklet;
qa.py 0 rule problems; verify_answers.py 600/600; labelcheck 261 figures, 806 labels, 0 touching.
Booklets 377-393 KB, keys 29 KB. out/ now holds the v2 Mainstream files under the same local names.
Drive (same folder), uploaded as new copies beside v1, which was kept:
Yr8_The_Fractal_Five_Term_N_Warm-Ups_v2.pdf, Yr8_The_Fractal_Five_Term_N_Answers_v2.pdf.

## Google Drive
Final booklets and keys: Kingscliff Maths Resources 7–12 / Year 08 / Warm-ups – The Fractal Five
(folder id 1Aw0XtHIrUh3BXfj-iZH6NgtMH7asojUr), named
Yr8_The_Fractal_Five_Term_N_Warm-Ups.pdf, Yr8_The_Fractal_Five_Term_N_Answers.pdf,
Yr8_Advanced_The_Fractal_Five_Term_N_Warm-Ups.pdf, Yr8_Advanced_The_Fractal_Five_Term_N_Answers.pdf.
Uploaded with drive-upload/upload.sh (branch claude/math-resources-drive-a5l2lp; Apps Script web app, needs
DRIVE_UPLOAD_URL / DRIVE_UPLOAD_KEY); re-upload a rebuilt file with --replace (the Drive connector cannot list
files the Apps Script creates; check the folder in Drive itself), e.g.
    bash upload.sh out/The_Fractal_Five_Year_8_Term_1.pdf 1Aw0XtHIrUh3BXfj-iZH6NgtMH7asojUr \
         Yr8_The_Fractal_Five_Term_1_Warm-Ups.pdf --replace
