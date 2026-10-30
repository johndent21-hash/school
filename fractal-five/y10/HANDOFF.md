# The Fractal Five - Year 10: build source (Oct 2026)

Start-of-lesson formula warm-ups for Kingscliff High School, Year 10. Four booklets (Terms 1-4), each a
title page + 30 one-page sessions (Weeks 1-10, Sessions 1-3), 5 questions per session, one from each
strand. Built from the Year 9 Fractal Five code (four-priorities version, branch
`claude/vibrant-johnson-piris7`), copied into this folder; the Year 9 code in `../wu`, `../opts` is unchanged.

## Outputs (out/)
    The_Fractal_Five_Year_10_Term_N.pdf          31 pages each, 370-412 KB
    The_Fractal_Five_Year_10_Term_N_Answers.pdf  teacher key: A4, 2 pages (all 30 sessions on page 1,
                                                 syllabus outcomes on page 2), no images, ~26 KB
    Year10_Sample.pdf, Year10_Gallery.pdf        approval sample (title pages + Week 1 of each term) and
                                                 every new pool item as it prints, with its answer
    The_Fractal_Five_Year_10_BUILD_SOURCE.zip    this folder (code, art, fonts), no out/

## Setup (Linux, Python 3.11-3.13)
    pip install weasyprint==70.0 pypdf numpy scipy Pillow     (exactly 70.0: check.py walks its layout boxes)
    apt: libpango-1.0-0 libpangoft2-1.0-0 libharfbuzz0b libcairo2 libgdk-pixbuf-2.0-0 poppler-utils
    fonts: Poppins + Open Sans TTFs are in fonts/ (OFL). Install them so fontconfig finds 'Open Sans'
      (the SVG diagrams ask for it by name):
      mkdir -p /usr/local/share/fonts/fractal-five && cp fonts/*.ttf /usr/local/share/fonts/fractal-five/ && fc-cache -f
    PFONT/OFONT (wu/wu.py) and PF/OF (opts/covers.py) point at fonts/. All paths are relative to this
    folder (the old /home/claude paths were already gone in the four-priorities version).
    pdffonts shows only Pop-* (Poppins) and OS-* / Open-Sans-* faces. Never use a character the fonts
    lack (e.g. U+2153 one-third: use frac('1', '3')) or a fallback face gets embedded.

## Build and check (run from this folder)
    python3 wu/build_all.py out 1,2,3,4    four booklets + four answer keys + wu/answers_termN.json (~2 min)
    python3 wu/build_all.py out sample     out/Year10_Sample.pdf
    python3 wu/gallery.py out/Year10_Gallery.pdf [families]
    python3 wu/qa.py                       rule checks + writes wu/formula_counts.md (family/formula counts)
    python3 wu/verify_answers.py --sample 20   independent recompute of all 600 answers (+20 shown in full)
    python3 wu/labelcheck.py               200 dpi pixel gaps: label to line/arc/arrowhead and label to label
    python3 wu/mkart.py                    re-make the inside-page JPEGs (strips, logo)
Last run (final build): overflow check passes in all terms (2 shrink rounds; a few cylinders/sectors at
0.81); qa.py 0 rule problems; verify_answers.py 600/600; labelcheck 0 touching (smallest gap 2.1 px =
0.55 mm, label to label 8.7 px).

## Files
    wu/build_all.py   cover_pdf (title page), build (booklet), build_sample, overflow fixing, PDF merge
                      (pypdf, identical objects merged so the logo is stored once)
    wu/wu.py          page engine (Year 9 layout); Q.show_formula prints a formula in a from-memory term
    wu/gen.py         pools (L1 Terms 1-2, L2 Terms 3-4), generators, scheduler - see below
    wu/formulas.py    FX[key] = (printed formula HTML, small font?) for every formula key
    wu/wdia.py        diagrams; Year 10 additions at the end: trig_fig, elev_fig, similar_rects2, pyramid,
                      cone, sector(hi_arc=True), _vdim (height dimension line), _mark_angle
    wu/bdia.py        figure engine from the Advanced booklets; trig() gained bold_hi, angle_unknown, extra
    wu/check.py       overflow check: every figure inside its cell, text not squeezed, formula strip fits
    wu/answer_key.py  teacher answer keys from wu/answers_termN.json
    wu/qa.py, wu/verify_answers.py, wu/labelcheck.py, wu/gallery.py   QA (above)
    wu/mkart.py       strip_top.jpg (8 mm triangles), strip_foot.jpg (12 mm, fades towards the table), logo.jpg
    opts/art_opts.py  PASTEL, sierpinski_triangle_svg (depth 6, 87% shrink, hue by angle round the centre),
                      triangle_bg_jpg (midnight + 3 mm blurred glow, one JPEG); Year 9 option art kept
    opts/covers.py, opts/covers2.py   title-page CSS ('V' page, now pastel, with the .yr YEAR 10 pill)

## Design
Title page: Year 9 'V' layout on midnight #120F24; pastel pink #FF9EC7, peach #FFC29E, butter #FFE38F, mint
#9EEBCB, sky #9EC8FF ("Five", tab, chip border butter; kicker pink; rainbow bar through all five); YEAR 10
pill (Poppins Bold 16 pt, #120F24 on mint); vector Sierpinski triangle (side 160 mm, base 250 mm from the
top) over opts/art/tri_bg.jpg (background + glow); chip "Formulas provided" (T1-2) / "Formulas from memory".
Inside pages: approved Year 9 layout; header "Mathematics · Year 10 · The Fractal Five"; faint pastel
Sierpinski strips (45% on white, darkest grey 221/255, so they photocopy as a light texture).
Every raster image is a quality-70 JPEG, longest side <= 1200 px; diagrams and the triangle are vector.

## Strands and families (gen.STRANDS)
    A  pyth_hyp pyth_short trig_ratio trig_top trig_bottom trig_angle similar
    B  a_circle arc sector sa_rect sa_cyl v_prism v_cyl capacity  (+ v_pyramid v_cone, Term 4 only)
    C  pct_change pct_original profit_pct interest wages salary commission holiday_pay
    D  idx zero_neg sci formula_sub ratio speed
    E  gradient linear mean prob prob_not freq
Reused from Year 9: pyth_*, a_circle, sa_rect, sa_cyl, v_prism (incl. working backwards), v_cyl, speed
(incl. working backwards), gradient, prob, prob_not; pct_change = Year 9 pct_incdec; pct_original = Year 9
pct_orig; linear + "state the gradient and y-intercept"; mean + frequency tables; idx + coefficients
(the zero index moved to zero_neg).

## Scheduler rules (all checked by qa.py)
- One question per strand per session; all 30 sessions generated (no hand-made Week 1).
- Strand order = whole shuffled cycles of its families: no family in consecutive sessions, and
  trig_ratio / trig_top / trig_bottom never next to each other (they print the same formula).
- Every family >= 3 times a term; Term 4 strand B has 10 families, so exactly 3 each.
- Term 4 Week 1 contains a pyramid or a cone (strand_sequence retries until it does).
- No repeated question in a term (gen.qsig = text + figure labels + answer). Term 2 (Term 4) prefers items
  Term 1 (Term 3) did not use: 10 of Term 2's 150 repeat a Term 1 question, Terms 3 and 4 share none.
- Within a family the least-used formula key comes next, so sub-formulas rotate.
- Terms 3-4 (Level 2 = L2 pool + half of L1): about a third of trig_top + trig_angle are angle of
  elevation / depression (gen.elev_slot); v_prism and speed keep Year 9's 1-in-4 working backwards.
- formula_sub avoids y = mx + c in a session whose strand E question is linear.
- Term 4 v_pyramid / v_cone set q.show_formula, so their formula strip prints in a from-memory term.
- Negative indices use numerical bases only (core MA5-IND-C-01); pronumerals only with the zero index.

## Diagram notes
- trig_fig: bdia.trig wrapped in wdia.recolour, always drawn wide (longer leg horizontal) so a small
  angle's label has room; the angle is marked by _wedge_mark (clear of every side, mark and label, and
  clearly nearer its own vertex than the other acute one). verify_answers.py reads the roles of the
  sides from the drawing and checks the drawn angle and side ratios.
- elev_fig: same triangle on a ground line with the object's name above it; depression marks the angle
  between a dashed horizontal and the line of sight at the observer.
- pyramid / cone: the drawings are too small to fit the height label beside the dashed height without
  crossing an edge, so the height is labelled on an arrowed dimension line beside the solid (extension
  lines at the apex level and the base centre's level); the dashed height and right-angle mark stay.
- sector: Year 9's wdia.sector (to scale, right-angle square for 90 deg); arc-length questions highlight the arc.

## Syllabus (listed on page 2 of each answer key)
The NESA site could not be reached from the build machine; codes were cross-checked with secondary
sources (school scope-and-sequence documents, search results). Topics marked * on the key: the code is
right for the topic but where the content sits within it was not checked against NESA (arc length and
sector area, percentages, mean from frequency tables, relative/expected frequency, substitution).
Path content: only the Term 4 pyramid and cone questions (MA5-VOL-P-01).
