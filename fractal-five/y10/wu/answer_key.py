# -*- coding: utf-8 -*-
"""Teacher answer key for one term: A4, two pages, one row per session (Week, Session, Q1-Q5 with
units), the booklet's fonts, no images. Reads wu/answers_termN.json, which build_all.py writes from
the same sessions it prints.

    python3 wu/answer_key.py OUTDIR [1,2,3,4]
"""
import html
import json
import os
import re
import sys

from weasyprint import HTML

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import wu  # noqa: E402

STRAND = ["A  Triangles &amp; similarity", "B  Area &amp; volume", "C  Percentages &amp; money",
          "D  Indices, formulas &amp; rates", "E  Graphs, data &amp; chance"]
OUTCOMES = [
    ("A", "MA4-PYT-C-01 Pythagoras&rsquo; theorem; MA5-TRG-C-01 trigonometric ratios (sides and angles); "
          "MA5-TRG-C-02 angles of elevation and depression (Terms 3&ndash;4); MA5-GEO-C-01 similar figures"),
    ("B", "MA4-ARE-C-01 area of circles and sectors*; MA4-LEN-C-01 arc length*; MA5-ARE-C-01 surface area of "
          "prisms and cylinders; MA5-VOL-C-01 volume of prisms and cylinders, capacity; MA5-VOL-P-01 (Path, "
          "Term 4 only) volume of pyramids and cones"),
    ("C", "MA5-FIN-C-01 simple interest, earning money (wages, overtime, salary, commission, leave loading); "
          "MA4-FRC-C-01 percentage increase and decrease, original amount, percentage profit and loss*"),
    ("D", "MA5-IND-C-01 index laws with coefficients, zero and negative indices (numerical bases); MA5-MAG-C-01 "
          "scientific notation; MA4-ALG-C-01 / MA5-EQU-C-01 substituting into formulas and solving*; "
          "MA4-RAT-C-01 ratios and rates (speed)"),
    ("E", "MA5-LIN-C-01 gradient and <i>y</i> = <i>mx</i> + <i>c</i>; MA4-DAT-C-02 mean, including frequency "
          "tables*; MA4-PRO-C-01 / MA5-PRO-C-01 probability, complementary events, relative and expected "
          "frequency*"),
]


def fmt(ans, fam):
    """Answer text -> HTML: powers as superscripts, pronumerals in italics, true minus signs."""
    a = html.escape(ans)
    a = re.sub(r"\^(−?-?\d+)", lambda m: f"<sup>{m.group(1).replace('-', '−')}</sup>", a)
    if fam in ("idx", "zero_neg"):
        a = re.sub(r"(?<![A-Za-z])([a-z])(?![a-z])", r"<i>\1</i>", a)
    if fam == "linear":
        a = a.replace("y-intercept", "<i>y</i>-intercept")
    return a.replace(" (or ", "<br><span class='alt'>or ").replace(" (= ", "<br><span class='alt'>= ") \
            .replace(")", "</span>") if ("(or " in ans or "(= " in ans) else a


def key_html(term, rows):
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
    head = "".join(f"<th>Q{i + 1}<span>{s}</span></th>" for i, s in enumerate(STRAND))
    given = ("Formulas printed for students in every question." if term <= 2 else
             "Formulas from memory" + (" (the pyramid and cone formulas are printed)." if term == 4 else "."))
    table = (f'<table><thead><tr><th class="wk">Week</th><th class="ss">Session</th>{head}</tr></thead>'
             f'<tbody>{"".join(trs)}</tbody></table>')
    outc = "".join(f"<div><b>{s}</b> {t}</div>" for s, t in OUTCOMES)
    return f"""<div class="hd"><div class="eyb">Mathematics &middot; Year 10 &middot; The Fractal Five</div>
<div class="ttl">Term {term} <em>answer key</em></div>
<div class="sub">{given} Lengths, areas and volumes are rounded only where the question says so
(1 decimal place, the nearest degree or the nearest cent).</div></div>
{table}
<div class="oc"><div class="och">NSW Mathematics K&ndash;10 (2022) outcomes practised &middot; Stage 5, with Stage 4 revision &middot; MAO-WM-01 throughout</div>{outc}
<div class="ocn">* the code is right for the topic, but where this content sits within it could not be checked against the NESA website.</div></div>"""


def css():
    return f"""
@font-face {{ font-family:'Pop'; src:url('file://{wu.PFONT}/Poppins-Medium.ttf'); font-weight:500; }}
@font-face {{ font-family:'Pop'; src:url('file://{wu.PFONT}/Poppins-Bold.ttf'); font-weight:700; }}
@font-face {{ font-family:'OS'; src:url('file://{wu.OFONT}/OpenSans-Regular.ttf'); font-weight:400; }}
@font-face {{ font-family:'OS'; src:url('file://{wu.OFONT}/OpenSans-Italic.ttf'); font-weight:400; font-style:italic; }}
@font-face {{ font-family:'OS'; src:url('file://{wu.OFONT}/OpenSans-SemiBold.ttf'); font-weight:600; }}
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
.alt {{ font-size:7.4pt; color:{wu.TXT2}; }}
.oc {{ margin-top:3mm; font-size:7.2pt; color:{wu.TXT2}; line-height:1.3; page-break-inside:avoid; }}
.oc .och {{ font-family:'Pop'; font-weight:500; font-size:6.6pt; letter-spacing:.12em; text-transform:uppercase; color:{wu.INK}; margin-bottom:0.8mm; }}
.oc b {{ font-family:'Pop'; font-weight:700; color:{wu.BLUE}; margin-right:1mm; }}
.ocn {{ font-size:6.6pt; margin-top:0.8mm; color:{wu.MUTED}; }}
"""


def build_key(term, outdir):
    rows = json.load(open(os.path.join(HERE, f"answers_term{term}.json")))
    assert len(rows) == 150
    out = os.path.join(outdir, f"The_Fractal_Five_Year_10_Term_{term}_Answers.pdf")
    title = f"The Fractal Five — Year 10, Term {term} — Answer key"
    doc = (f"<!DOCTYPE html><html><head><meta charset='utf-8'><title>{title}</title>"
           f"<meta name='author' content='Kingscliff High School Mathematics Faculty'>"
           f"<style>{css()}</style></head><body>{key_html(term, rows)}</body></html>")
    HTML(string=doc, base_url=HERE).write_pdf(out)
    return out


if __name__ == "__main__":
    outdir = sys.argv[1] if len(sys.argv) > 1 else "out"
    terms = [int(t) for t in sys.argv[2].split(",")] if len(sys.argv) > 2 else [1, 2, 3, 4]
    for t in terms:
        print(build_key(t, outdir))
