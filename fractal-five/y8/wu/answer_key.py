# -*- coding: utf-8 -*-
"""Teacher answer key for one booklet: A4, two pages - all 30 sessions on page 1 (Week, Session, Q1-Q5
with units), the NSW Stage 4 outcomes practised on page 2 - the booklet's fonts, no images. Reads
wu/answers_{M|A}_termN.json, which build_all.py writes from the same sessions it prints.

    python3 wu/answer_key.py OUTDIR [M,A] [1,2,3,4]
"""
import html
import json
import os
import re
import sys

from weasyprint import HTML

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import gen  # noqa: E402
import wu  # noqa: E402

NAME = {"M": "The_Fractal_Five_Year_8", "A": "The_Fractal_Five_Year_8_Advanced"}


def strands(version, term):
    y8 = gen.year8(version, term)
    return ["A  Angles &amp; shapes" + (" + Pythagoras" if y8 else ""), "B  Measurement",
            "C  Number &amp; percentages" + (" + index laws" if y8 else ""), "D  Algebra, ratio &amp; rates",
            "E  Number plane, data &amp; chance"]


# NSW Mathematics K-10 Syllabus (2022), Stage 4. The NESA site could not be reached from the build machine,
# so none of these codes was confirmed there (see the note printed under the list).
OUTCOMES_Y7 = [
    ("A", "MA4-ANG-C-01 complementary and supplementary angles, angles at a point, vertically opposite angles, "
          "angles on parallel lines; MA4-GEO-C-01 angle sum of a triangle and a quadrilateral, exterior angle of "
          "a triangle"),
    ("B", "MA4-LEN-C-01 perimeter, circumference, length units; MA4-ARE-C-01 area of rectangles, squares, "
          "triangles, parallelograms and composite shapes, area units; MA4-VOL-C-01 volume of rectangular prisms, "
          "volume and capacity units"),
    ("C", "MA4-INT-C-01 order of operations with integers; MA4-IND-C-01 powers, square and cube roots; "
          "MA4-FRC-C-01 fraction and percentage of a quantity, one quantity as a percentage of another, "
          "fractions, decimals and percentages, multiplying and dividing by 10, 100 and 1000*"),
    ("D", "MA4-ALG-C-01 substitution, the distributive law; MA4-EQU-C-01 one- and two-step equations; "
          "MA4-RAT-C-01 simplifying ratios, sharing in a ratio, rates, best buys, speed; 24-hour time and time "
          "differences*"),
    ("E", "MA4-LIN-C-01 tables of values, reading points on the number plane; MA4-DAT-C-01 dot plots; "
          "MA4-DAT-C-02 mean, median, mode and range; MA4-PRO-C-01 probability, complementary events, "
          "experimental probability*"),
]
OUTCOMES_Y8 = [
    ("A", "MA4-PYT-C-01 Pythagoras&rsquo; theorem (hypotenuse and shorter side; Pythagorean triples)"),
    ("B", "MA4-ARE-C-01 area of trapeziums, rhombuses and kites, and circles (this replaces rectangles and unit "
          "conversions in Terms 3&ndash;4)"),
    ("C", "MA4-IND-C-01 index laws (multiply, divide, power of a power) with numerical bases; the questions with "
          "pronumeral bases are Stage 5 content (MA5-IND-C-01), included as asked; MA4-FRC-C-01 percentage "
          "increase and decrease, percentage profit and loss*"),
]
NOTES = [
    "Codes are from the NSW Mathematics K&ndash;10 Syllabus (2022). The NESA website could not be reached from "
    "the build machine, so <b>none of these codes was confirmed on the NESA site</b>; they match the codes used "
    "in the Year 9 and Year 10 keys.",
    "* the topic is in this outcome as far as could be checked, but where it sits in the syllabus (or, for "
    "24-hour time, whether it is Stage 3 revision with no Stage 4 code) could not be confirmed.",
]


def fmt(ans, fam):
    """Answer text -> HTML: powers as superscripts, pronumerals in italics, true minus signs."""
    a = html.escape(ans)
    a = re.sub(r"\^(−?-?\d+)", lambda m: f"<sup>{m.group(1).replace('-', '−')}</sup>", a)
    if fam in ("idx_laws", "distrib", "equation"):
        a = re.sub(r"(?<![A-Za-z])([a-z])(?![a-z])", r"<i>\1</i>", a)
    return a


def given_note(version, term):
    if gen.given(version, term):
        return "Formulas printed for students in every question."
    return ("Formulas from memory. Terms 3&ndash;4 add the Year 8 families (Pythagoras; trapezium, rhombus and kite, "
            "circle area; index laws; percentage change, profit and loss).")


def key_html(version, term, rows):
    by = {}
    for r in rows:
        by.setdefault((r["week"], r["session"]), {})[r["q"]] = r
    trs = []
    for w in range(1, 11):
        for k in (1, 2, 3):
            qs = by[(w, k)]
            wk = f'<td class="wk" rowspan="3">{w}</td>' if k == 1 else ""
            cls = ' class="first"' if k == 1 else ""
            cells = "".join(f"<td>{fmt(qs[i]['answer'], qs[i]['family'])}</td>" for i in range(1, 6))
            trs.append(f"<tr{cls}>{wk}<td class='ss'>{k}</td>{cells}</tr>")
    head = "".join(f"<th>Q{i + 1}<span>{s}</span></th>" for i, s in enumerate(strands(version, term)))
    table = (f'<table><thead><tr><th class="wk">Week</th><th class="ss">Session</th>{head}</tr></thead>'
             f'<tbody>{"".join(trs)}</tbody></table>')
    outc = OUTCOMES_Y7 + (OUTCOMES_Y8 if gen.year8(version, term) else [])
    oc = "".join(f"<div><b>{s}</b> {t}</div>" for s, t in outc)
    notes = "".join(f'<div class="ocn">{n}</div>' for n in NOTES)
    stage = ("Stage 4 (Year 7 revision" + ("; Year 8 content in Terms 3&ndash;4" if gen.year8(version, term) else "")
             + ") &middot; MAO-WM-01 working mathematically throughout")
    return f"""<div class="hd"><div class="eyb">Mathematics &middot; {gen.VERSIONS[version]} &middot; The Fractal Five</div>
<div class="ttl">Term {term} <em>answer key</em></div>
<div class="sub">{given_note(version, term)} Answers with &pi; are rounded to 1 decimal place, as each question says;
probabilities are fractions in simplest form; every other answer is exact.</div></div>
{table}
<div class="oc"><div class="och">NSW Mathematics K&ndash;10 (2022) outcomes practised &middot; {stage}</div>{oc}{notes}</div>"""


def css():
    return f"""
@font-face {{ font-family:'Pop'; src:url('file://{wu.PFONT}/Poppins-Medium.ttf'); font-weight:500; }}
@font-face {{ font-family:'Pop'; src:url('file://{wu.PFONT}/Poppins-Bold.ttf'); font-weight:700; }}
@font-face {{ font-family:'OS'; src:url('file://{wu.OFONT}/OpenSans-Regular.ttf'); font-weight:400; }}
@font-face {{ font-family:'OS'; src:url('file://{wu.OFONT}/OpenSans-Italic.ttf'); font-weight:400; font-style:italic; }}
@font-face {{ font-family:'OS'; src:url('file://{wu.OFONT}/OpenSans-SemiBold.ttf'); font-weight:600; }}
@font-face {{ font-family:'OS'; src:url('file://{wu.OFONT}/OpenSans-Bold.ttf'); font-weight:700; }}
@page {{ size:A4; margin:11mm 12mm 11mm 12mm;
         @bottom-right {{ content:"Page " counter(page) " of " counter(pages); font-family:'Pop'; font-size:6.5pt;
                          letter-spacing:.14em; text-transform:uppercase; color:#8A857C; }} }}
* {{ box-sizing:border-box; margin:0; padding:0; }}
body {{ font-family:'OS'; font-size:8.6pt; color:{wu.INK}; line-height:1.25; }}
sup {{ font-size:0.68em; vertical-align:0.45em; line-height:0; }}
.hd {{ margin-bottom:3mm; }}
.eyb {{ font-family:'Pop'; font-weight:500; font-size:6.6pt; letter-spacing:.22em; text-transform:uppercase; color:{wu.MUTED}; }}
.ttl {{ font-family:'Pop'; font-weight:700; font-size:18pt; margin-top:0.6mm; }}
.ttl em {{ font-style:normal; color:{wu.BLUE}; }}
.sub {{ font-size:8pt; color:{wu.TXT2}; margin-top:0.8mm; }}
table {{ width:100%; border-collapse:collapse; table-layout:fixed; }}
thead {{ display:table-header-group; }}
th {{ background:{wu.STONE}; font-family:'Pop'; font-weight:500; font-size:7pt; letter-spacing:.12em; text-transform:uppercase;
      text-align:left; padding:1.4mm 1.6mm; border:0.3mm solid {wu.BORDER}; vertical-align:bottom; }}
th span {{ display:block; letter-spacing:.02em; text-transform:none; font-size:6.4pt; color:{wu.TXT2}; margin-top:0.3mm; }}
th.wk {{ width:11mm; }} th.ss {{ width:14mm; }}
td {{ border:0.3mm solid {wu.BORDER}; padding:1.25mm 1.6mm; vertical-align:top; }}
td.wk {{ font-family:'Pop'; font-weight:700; font-size:11pt; color:{wu.BLUE}; text-align:center; vertical-align:middle; }}
td.ss {{ font-family:'Pop'; font-weight:500; text-align:center; color:{wu.TXT2}; }}
tr.first td {{ border-top:0.7mm solid {wu.BORDER}; }}
tr {{ page-break-inside:avoid; }}
.oc {{ break-before:page; font-size:8.4pt; color:{wu.TXT2}; line-height:1.4; }}
.oc > div {{ margin-bottom:1.6mm; }}
.oc .och {{ font-family:'Pop'; font-weight:500; font-size:7pt; letter-spacing:.12em; text-transform:uppercase; color:{wu.INK}; margin-bottom:2.4mm; }}
.oc b {{ font-family:'Pop'; font-weight:700; color:{wu.BLUE}; margin-right:1mm; }}
.oc .ocn b {{ font-family:'OS'; font-weight:700; color:{wu.TXT2}; margin:0; }}
.ocn {{ font-size:7.6pt; margin-top:2.4mm; color:{wu.MUTED}; }}
"""


def build_key(version, term, outdir):
    rows = json.load(open(os.path.join(HERE, f"answers_{version}_term{term}.json")))
    assert len(rows) == 150
    out = os.path.join(outdir, f"{NAME[version]}_Term_{term}_Answers.pdf")
    title = f"The Fractal Five — {gen.VERSIONS[version]}, Term {term} — Answer key"
    doc = (f"<!DOCTYPE html><html><head><meta charset='utf-8'><title>{title}</title>"
           f"<meta name='author' content='Kingscliff High School Mathematics Faculty'>"
           f"<style>{css()}</style></head><body>{key_html(version, term, rows)}</body></html>")
    HTML(string=doc, base_url=HERE).write_pdf(out)
    return out


if __name__ == "__main__":
    outdir = sys.argv[1] if len(sys.argv) > 1 else "out"
    versions = sys.argv[2].split(",") if len(sys.argv) > 2 else ["M", "A"]
    terms = [int(t) for t in sys.argv[3].split(",")] if len(sys.argv) > 3 else [1, 2, 3, 4]
    for v in versions:
        for t in terms:
            print(build_key(v, t, outdir))
