# Year 9 Formula Warm-Ups - build source (Oct 2026)

## CURRENT STATE (Oct 2026): The Fractal Five, Terms 1-4, content round 2
Outputs: out/The_Fractal_Five_Term_1.pdf .. _4.pdf (31 pages each: Sierpinski-pentagon title page +
30 sessions, 5 questions each, one per strand). Title page, layout, colours, fonts and Week 1
(samples.py) are unchanged - Week 1 page HTML is hash-checked against the approved sample (qa.py),
and the title page and Week 1 pages render pixel-identical to the Sept build.

### Setup (any Linux; tested on Ubuntu 24.04, Python 3.11)
    pip install weasyprint==70.0 pypdf numpy Pillow      (exactly 70.0: check.py walks its layout boxes)
    system libs: libpango-1.0-0 libpangoft2-1.0-0 libharfbuzz0b libcairo2 libgdk-pixbuf-2.0-0 (apt)
    fonts: Poppins + Open Sans TTFs are bundled in ../fonts (OFL). Install them so fontconfig can find
      'Open Sans' (the SVG diagrams ask for it by name):
      mkdir -p /usr/local/share/fonts/fractal-five && cp fonts/*.ttf /usr/local/share/fonts/fractal-five/ && fc-cache -f
      PFONT/OFONT (wu/wu.py) and PF/OF (opts/covers.py) point at ../fonts. pdffonts shows only
      Pop-* (Poppins), OS-* and Open-Sans-* (Open Sans) - no fallback faces.
    All paths are relative to this folder (no /home/claude).

### Build and check (run from this folder)
    python3 wu/build_all.py out 1,2,3,4    build the four PDFs + wu/answers_termN.json (~1 min)
    python3 wu/qa.py                       rule checks (below) + writes wu/formula_counts.md
    python3 wu/verify_answers.py           recompute all 600 answers independently from the printed
                                           question text, labels, tables and the drawing itself
    python3 wu/labelcheck.py [--all]       pixel check at 200 dpi: gap between every label and every
                                           line/arc/arrowhead/other label, from the rendered glyphs
    python3 wu/gallery.py all OUT.pdf new  every new pool item, for eyeballing at 200 dpi
Last run: overflow check passes (1 shrink round, all terms: a few cylinders scaled to 0.81);
qa.py 0 rule problems; verify_answers.py 600/600 match; labelcheck: no new-item label within
2.9 px (0.75 mm) of any line or 7.7 px of another label.

### What changed this round
a) Angles (strand A, 2 new families, new diagrams in wdia.py, drawn exactly from the angles):
   ang_line  - angles on a straight line (angles_line), at a point (angles_point), vertically opposite
               (vert_opp). Formulas: "Angles on a straight line add to 180 deg", "Angles at a point add
               to 360 deg", "Vertically opposite angles are equal".
   ang_par   - parallel lines (parallel): arrowheads on both lines, transversal at the real angle,
               corresponding / alternate / co-interior pairs. Each label is kept nearer its own
               crossing than the other one (so it cannot be misread). Formulas: "Corresponding/
               Alternate angles on parallel lines are equal", "Co-interior ... add to 180 deg".
   Unknown = bold deeper-blue x deg with a blue arc. Labels placed by _Room: every line, arc and
   arrowhead is registered and a label only goes where its box keeps clear of all of them.
b) Working backwards (no new family): ("rev", ...) items in a_rect, a_tri, a_para, v_rect, v_prism,
   speed, and circ at Level 2 - "The area of this rectangle is 48 cm^2. Find x." with x (bold blue) on
   the diagram. The scheduler makes the 2nd, 6th, ... appearance of these families in a term a
   working-backwards item, so about 1 in 4 (1 per term per family). Printed formula unchanged.
c) Percentages (strand D, 2 new families): pct_incdec (increase / decrease / discount / GST /
   population / wage; formulas "New amount = original x (100% + increase)" and "... (100% - decrease)")
   and pct_orig ("Original amount = known amount / its percentage x 100": discounts, increases,
   "15% of a number is 45").
d) Strand C, 2 new families: sa_cyl (closed cylinder, SA = 2 pi r^2 + 2 pi r h, existing cylinder
   diagram, radius or diameter) and capacity (rectangular or cylindrical tank; printed formula = the
   volume formula + the conversion: 1 cm^3 = 1 mL, 1000 cm^3 = 1 L or 1 m^3 = 1000 L).
Also: idx gained zero-index items (a^0 = 1: 7^0, 5^0 x 5^3, 3 x 10^0, 4^0 + 9^0; L2 x^0, 6y^0, (3m)^0,
   2^0 x 2^5); one per term (the 2nd idx slot), and idx now gets 4 slots a term so all four index
   formulas appear every term.
   a_semi now also covers quadrants and sectors (60, 120, 270, 45, 72, 150, 240, 40, 210 deg) with
   A = theta/360 x pi r^2 (key a_sector), drawn to scale (wdia.sector) with the angle marked (a
   square for a quadrant). Semicircles keep A = 1/2 pi r^2. The scheduler alternates the two.

### Scheduler rules (gen.py) - all checked by qa.py
- 5 questions per session, one per strand; Week 1 = samples.py, untouched.
- Rotation per strand: Week 1's families, the rest, then shuffled whole cycles; never the same family
  in consecutive sessions, and capacity never next to v_rect or v_cyl (it prints their formula).
- Every family >= 3 times a term (idx >= 4). Pools.draw: no item twice in a term, plus a signature
  check (question text + all printed labels) so nothing repeats Week 1 either; within a family it
  prefers the formula used least so far, so sub-formulas rotate (all formulas appear every term
  except some of the six capacity variants - see wu/formula_counts.md).
- Level 1 (T1-2): L1 pools only; every printed number whole (probabilities aside); tidy answers
  (whole numbers/dollars; 1 dp only where pi or a root makes it necessary and the question says so).
  One old L1 item gave a 1.5 m radius - now labelled as a 3 m diameter.
- Level 2 (T3-4): L2 pool + half of L1 (forward[::2] + working-backwards[::2]).
- Items whose figure cannot be drawn cleanly at 0.81 scale are skipped (as before). Known skips:
  7 kite items (pre-existing) and a_trap (10, 4, 5, 3, m) (top side too short for label + arrow).

### Diagram fixes in older families (generated weeks only; Week 1 untouched)
The pixel check found real collisions in the existing figures:
- trapezium: the parallel-side arrows sat exactly under the side labels (some overlapped, e.g.
  "10 m", "9.5 m"). trapezium(..., clear=True) now slides each arrow along its side clear of the label.
- tri_height: on tall triangles the height label ran into the sloping side. clear=True moves it
  lower / to the other side of the dashed height until clear.
- plane_line: when A or B sits on the y-axis its dot covered the axis number; clear=True nudges it.
- check.py now also catches a figure that is too tall for its cell: WeasyPrint then squeezes the
  question-text box and the last line of text is drawn over the figure (this hit the first sectors
  and a few cylinders); fix_overflow shrinks those figures automatically.
All three use opt-in parameters, so Week 1 output is byte-identical. Still present (left alone
because Week 1 is approved): T1 W1 S3 and T3 W1 S2 trapezium arrows 1.3-1.5 px from their labels;
the italic y axis title sits beside its arrowhead in every number plane (as designed).

### Files added this round
wu/qa.py, wu/verify_answers.py, wu/labelcheck.py, wu/formula_counts.md; wu/gallery.py rewritten
(new-items filter, captions with answers); fonts/ (Poppins, Open Sans, OFL licences).

---------------------------------------------------------------------------------------------------
HISTORY (Sept 2026) - kept for reference
---------------------------------------------------------------------------------------------------

Start-of-lesson warm-ups: 3 sessions/week x 10 weeks x 4 terms = 120 one-page sessions.
Each page: 5 simple questions in a centred 2-column table. Left = question + diagram,
right = ruled working scaffold (Formula / Substitute / 2 working lines / Answer).
Purpose: recall the Year 8 formulas and show full working, ready for Years 9-10.

STATUS (Sept 2026): sample booklets built for ALL FOUR TERMS - title page + Week 1 Sessions 1-3
each - and sent for approval. Next: build the full booklets (title page + 30 sessions each), one
separate PDF per term: Yr9_Formula_Warm-Ups_TermN.pdf.
Approved so far: the session page design (Term 1 Week 1 sample, earlier turn).
Requested this round: title page in a blue/charcoal Mandelbrot design, markedly different from the
other booklets but clearly the same family; each term a separate booklet with the same title page,
clearly marked Term 1-4; Terms 1-2 print the formula for students to copy before substituting.

## Setup
pip install weasyprint==70.0 --break-system-packages
Fonts: Poppins (system, /usr/share/fonts/truetype/google-fonts); Open Sans TTF +
Source Sans 3 OTF in ~/.local/share/fonts (raw.githubusercontent.com googlefonts/opensans,
adobe-fonts/source-sans release/OTF), then fc-cache -f.
Build samples: python3 build_samples.py OUTDIR   (4 PDFs; runs check.py on every cell first)
QA: check.py flags any question figure overflowing its cell. Also eyeball every diagram at 200 dpi.

## Files
wu.py     page engine (header, table geometry, working scaffold, CSS)
wdia.py   diagrams in Year 7/8 house blue, drawn to scale (rt_tri, tri_height, trapezium,
          circle_r, box, prism_area, cylinder, angle_tri, plane_line, journey)
bdia.py, g10.py  figure engine from the Advanced booklet build (wdia recolours its output)
samples.py  Week 1 Sessions 1-3 for Terms 1-4 (q(text, fig, formula_key, answer))
formulas.py FX[key] = (printed formula HTML, small) for all 32 formulas (Terms 1-2 print it)
cover_art.py title-page art (whole set, blue line art, contour rings, drafting grid) -> art/cover.jpg
w01.py    first Term 1 sample (superseded by samples.py)
faint.py, mkart.py  faint Mandelbrot art (300 dpi): art/foot.png footer, art/div.png header divider
art/logo_rgba.png   Kingscliff logo, specks removed, transparent background

## Design (approved direction pending)
White, photocopy-friendly page (no dark band); Year 7/8 palette: ink #35322D, blue #3B7FC0,
stone #F2EFE8. Header: logo, eyebrow, "Week N . Session N", Term chip, one-line instruction,
Name/Date box. Faint Mandelbrot needle as a divider under the header and as the footer.
Rows 46.6 mm, working lines 8.6 mm apart. Checked in greyscale.

## Rotation plan
Every session = one question from each of 5 strands:
  A geometry: Pythagoras (hyp, shorter side), angle sums (triangle, quad, polygon), exterior angle
  B area: rectangle, triangle, parallelogram, trapezium, rhombus/kite, circumference, circle, sector
  C volume/SA: prism V=Ah, rectangular prism, cylinder, SA rectangular prism, SA triangular prism
  D number: index laws, distributive law, % of quantity, % change, profit/loss, speed, scale factor
  E stats/prob/graphs: probability, complementary events, mean, range, gradient, y = mx + c
Week 1 uses 15 formulas; Week 2 uses the other 17; then cycle with new numbers/contexts,
so each formula appears about every 2 weeks (~18 times a year). Keep questions simple.


## Title page (cover(term) in wu.py)
Full-bleed charcoal blueprint: faint 5/25 mm drafting grid, the WHOLE Mandelbrot set as glowing blue
line art (distance-estimate core + glow, faint equipotential rings, dark blue-charcoal interior with a
soft inner glow). Family elements kept: logo in white box, small-caps kicker, Poppins title, short
accent bar, Kingscliff / Mathematics Faculty footer band. Term marked by a giant blue numeral.
Chip: "Formulas provided" (Terms 1-2) / "Formulas from memory" (Terms 3-4). Name/Class box.

## Working column
Terms 1-2: printed FORMULA strip (stone, blue bar) + Copy / Substitute / working / Answer (8.5 mm).
Terms 3-4: Formula / Substitute / working / working / Answer (8.6 mm). Header instruction says
"Copy the formula..." or "Write the formula..." to match.

## Sample answers (Week 1)
T1 S1: 10 cm | 35 cm2 | 60 cm3 | $12 | 7        S2: 67 | 50.3 cm2 | 96 cm3 | 80 km/h | 1/2
   S3: 12 cm | 32 cm2 | 282.7 cm3 | 5^7 | 2
T2 S1: 80 | 45 cm2 | 72 cm2 | 25% | 13          S2: 115 | 31.4 cm | 132 cm2 | $30 | 0.7
   S3: 720 deg | 24 cm2 | 90 cm3 | 4x + 12 | 11
T3 S1: 8.6 cm | 56.5 cm2 | 628.3 cm3 | 2.5 | 1/3  S2: 63 | 50 cm2 | 70 cm3 | 60 km/h | 13
   S3: 15 cm | 90 m2 | 148 cm2 | 7^5 | -2
T4 S1: 1080 deg | 44.0 cm | 140 cm3 | $84 | 13    S2: 113 | 54 cm2 | 336 cm2 | 15% | 1.8 s
   S3: 75 | 35 cm2 | 251.3 cm3 | $25 loss | 5/8

## Name and title-page options (Sept 2026)
Name choices offered: Formula Fluency (academic), Formula Foundations (professional), The Fractal Five
(fun, line "Five questions. Every lesson."), Fractal Fluency (combined). Awaiting the user's pick.
Three extra title-page options built with 'The Fractal Five' (../opts/covers.py -> one 3-page PDF):
  A Maurer rose r = sin 5θ, chords every 97° - approved blue/charcoal, polar grid, big term numeral
  B Penrose rhombus tiling (6 subdivisions) - cream/navy/coral/sunshine/mint/sky, circular medallion,
    coral term badge, title at the bottom
  C Newton's method for z^5 = 1 - five vivid basins (pink, orange, yellow, mint, blue) with ripple
    bands, rotated so an arm points down, top fades to midnight, yellow TERM tab on the right edge
Plus the original whole-Mandelbrot blueprint cover (wu.cover). Build: python3 opts/covers.py OUT.pdf 300
User preferred option C's colour scheme (midnight #120F24 + pink #FF3E8A, orange #FF8B2C, yellow #FFD23F,
mint #22E4AC, blue #3D8BFF; white title with yellow "Five", rainbow bar, yellow TERM tab). Three more in
that scheme (../opts/covers2.py -> The_Fractal_Five_Title_Page_Options_2.pdf):
  D Sierpinski pentagon - 5 copies scaled 1/phi^2 = 0.382, depth 5 (3125 pentagons), hue from the
    fractal address round the five-colour wheel, blurred glow layer (pent_glow.png)
  E Multibrot z^6 + c - five-fold cousin of the Mandelbrot, rotated so a lobe points up, rainbow glow by angle
  F Times table of 6 mod 360 on a circle - five-cusped envelope, poster layout (title at the bottom)
Awaiting the user's choice of name and title page before the full four-term build.

## FULL BUILD DONE (Sept 2026) - The Fractal Five, Terms 1-4
Name chosen: The Fractal Five ("Five questions. Every lesson."). Cover chosen: Sierpinski pentagon
(opts/covers2.py page D design, vivid midnight scheme), same on all four with TERM N tab; chip
"Formulas provided" (T1-2) / "Formulas from memory" (T3-4). Session headers now read
"Mathematics · Year 9 · The Fractal Five". Interior pages keep the approved charcoal/blue design.
Outputs: The_Fractal_Five_Term_1.pdf .. _4.pdf (31 pages each: title page + 30 sessions).
Rebuild: python3 wu/build_all.py OUTDIR 1,2,3,4   (Week 1 = samples.py; Weeks 2-10 = gen.py)
gen.py: curated number pools per formula (L1 Terms 1-2; L2 + half of L1 for Terms 3-4), strand
rotation with no formula in consecutive sessions, no repeated question within a term, figures
auto-shrunk if they overflow (none did). Answers for every question: wu/answers_termN.json
(ready for a teacher answer key if wanted). QA done: all diagram families rendered in galleries;
fixed quadrilateral proportions, kite/semicircle/circle/gradient label placement, short prisms.
