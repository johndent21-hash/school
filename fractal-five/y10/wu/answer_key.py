# -*- coding: utf-8 -*-
"""Teacher answer key for each term: A4, at most 2 pages, one row per session (Week, Session, then the
answers to Q1-Q5 with units, each with a short topic note). Same fonts as the booklets, no images.

    python3 wu/answer_key.py OUTDIR [TERMS]      (reads wu/answers_termN.json, written by build_all.py)
    -> OUTDIR/The_Fractal_Five_Year_10_Term_N_Answers.pdf
"""
import html
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from pypdf import PdfReader  # noqa: E402
from weasyprint import HTML  # noqa: E402
import gen  # noqa: E402
import wu  # noqa: E402

TOPIC = {
    "pyth_hyp": "Pythagoras: hypotenuse", "pyth_short": "Pythagoras: shorter side", "trig_ratio": "Trig ratio",
    "trig_top": "Trig: find a side (×)", "trig_bottom": "Trig: find a side (÷)", "trig_angle": "Trig: find an angle",
    "similar": "Similar figures", "a_circle": "Area of a circle", "arc": "Arc length", "sector": "Area of a sector",
    "sa_rect": "SA rectangular prism", "sa_cyl": "SA closed cylinder", "v_prism": "Volume of a prism",
    "v_cyl": "Volume of a cylinder", "capacity": "Capacity", "v_pyramid": "Volume of a pyramid",
    "v_cone": "Volume of a cone", "pct_change": "Percentage increase/decrease", "pct_original": "Original amount",
    "profit_pct": "Percentage profit/loss", "interest": "Simple interest", "wages": "Wages and overtime",
    "salary": "Salary", "commission": "Commission", "holiday_pay": "Holiday pay and leave loading",
    "idx": "Index laws", "zero_neg": "Zero and negative indices", "sci": "Scientific notation",
    "formula_sub": "Substitution into a formula", "ratio": "Dividing in a ratio", "speed": "Speed",
    "gradient": "Gradient", "linear": "y = mx + c", "mean": "Mean", "prob": "Probability",
    "prob_not": "Complementary events", "freq": "Relative / expected frequency"}
NOTE = {"trig_top": lambda r: "Angle of elevation/depression" if ("elevation" in r["question"] or "depression" in r["question"]) else None,
        "trig_angle": lambda r: "Angle of elevation/depression" if ("elevation" in r["question"] or "depression" in r["question"]) else None}
# Syllabus outcomes covered (NSW Mathematics K-10 Syllabus (2022), Stage 5 core, plus Stage 4 revision; the
# Term 4 pyramid and cone questions are Stage 5 Path content, MA5-VOL-P-01)
OUTCOMES = ("NSW Mathematics K–10 (2022). Stage 5 core: MA5-TRG-C-01, MA5-TRG-C-02 (trigonometry, incl. angles of "
            "elevation and depression), MA5-ARE-C-01, MA5-VOL-C-01, MA5-FIN-C-01, MA5-IND-C-01, MA5-LIN-C-01, "
            "MA5-ALG-C-01 / MA5-EQU-C-01 (formulas), MA5-NUM-C-01 (scientific notation), MA5-DAT-C-01, MA5-PRO-C-01. "
            "Stage 4 revision: MA4-PYT-C-01, MA4-ARE-C-01 (circles, sectors), MA4-RAT-C-01 (ratio, speed), "
            "MA4-PRO-C-01, MA4-LIN-C-01. Path (Term 4 only): MA5-VOL-P-01 (pyramids and cones).")


def cell(r):
    note = NOTE.get(r["family"], lambda r: None)(r) or TOPIC[r["family"]]
    return f'<td><div class="a">{gen.ans_html(r["answer"], r["family"])}</div><div class="t">{html.escape(note)}</div></td>'


def build(term, outdir):
    rows = json.load(open(os.path.join(HERE, f"answers_term{term}.json")))
    by = {}
    for r in rows:
        by.setdefault((r["week"], r["session"]), []).append(r)
    body = []
    for (w, s), rs in sorted(by.items()):
        rs = sorted(rs, key=lambda r: r["q"])
        cls = ' class="wk"' if s == 1 and w > 1 else ""
        body.append(f'<tr{cls}><td class="w">{w}</td><td class="s">{s}</td>' + "".join(cell(r) for r in rs) + "</tr>")
    chip = "Formulas provided" if term <= 2 else "Formulas from memory"
    heads = "".join(f'<th>Q{i + 1} <span>{X} &middot; {gen.STRAND_NAMES[X]}</span></th>' for i, X in enumerate("ABCDE"))
    css = wu.css().split("@page")[0] + """
@page { size:A4; margin:10mm 10mm 11mm 10mm;
        @bottom-right { content:"Page " counter(page) " of " counter(pages); font-family:'OS'; font-size:7pt; color:#8A857C; } }
body { font-family:'OS'; color:#35322D; font-size:8.2pt; }
h1 { font-family:'Pop'; font-weight:700; font-size:15pt; line-height:1.1; }
h1 em { font-style:normal; color:#3B7FC0; }
.eyb { font-family:'Pop'; font-weight:500; font-size:6.6pt; letter-spacing:.22em; text-transform:uppercase; color:#8A857C; margin-bottom:1mm; }
.sub { font-size:7.4pt; color:#4A4741; margin:1.2mm 0 2.6mm 0; line-height:1.4; }
table { width:100%; border-collapse:collapse; table-layout:fixed; }
th { font-family:'Pop'; font-weight:500; font-size:6.4pt; letter-spacing:.12em; text-transform:uppercase; text-align:left;
     background:#F2EFE8; border:0.3mm solid #CDC7BC; padding:1.1mm 1.4mm; vertical-align:bottom; line-height:1.25; }
th span { display:block; letter-spacing:.02em; text-transform:none; font-family:'OS'; font-size:6pt; color:#8A857C; }
td { border:0.3mm solid #CDC7BC; padding:0.9mm 1.4mm 0.8mm 1.4mm; vertical-align:top; }
td.w, td.s { text-align:center; font-family:'Pop'; font-weight:500; font-size:8pt; }
td.w { color:#3B7FC0; }
tr.wk td { border-top:0.6mm solid #B9B4AA; }
tr { break-inside:avoid; }
.a { font-size:8.6pt; color:#1F2A36; line-height:1.25; }
.t { font-size:5.9pt; color:#8A857C; line-height:1.2; margin-top:0.2mm; }
.foot { margin-top:2.4mm; font-size:6.3pt; color:#8A857C; line-height:1.4; }
"""
    doc = (f"<!DOCTYPE html><html><head><meta charset='utf-8'><title>The Fractal Five — Year 10, Term {term}: answers"
           f"</title><meta name='author' content='Kingscliff High School Mathematics Faculty'><style>{css}</style></head><body>"
           f'<div class="eyb">Mathematics &middot; Year 10 &middot; The Fractal Five &middot; teacher copy</div>'
           f"<h1>Term {term} <em>answers</em></h1>"
           f'<div class="sub">Weeks 1&ndash;10 &middot; 30 sessions &middot; 150 questions &middot; {chip}. '
           f"Answers to 1 decimal place, the nearest degree or the nearest cent where the question asks; "
           f"other answers are exact.</div>"
           f'<table><colgroup><col style="width:7mm"><col style="width:7mm">'
           + "".join('<col>' for _ in range(5)) + f'</colgroup><thead><tr><th>Wk</th><th>Ses</th>{heads}</tr></thead>'
           f'<tbody>{"".join(body)}</tbody></table>'
           f'<div class="foot">{OUTCOMES}</div></body></html>')
    out = os.path.join(outdir, f"The_Fractal_Five_Year_10_Term_{term}_Answers.pdf")
    HTML(string=doc, base_url=HERE).write_pdf(out)
    return out, len(PdfReader(out).pages), os.path.getsize(out)


if __name__ == "__main__":
    outdir = sys.argv[1] if len(sys.argv) > 1 else "out"
    terms = [int(t) for t in sys.argv[2].split(",")] if len(sys.argv) > 2 else [1, 2, 3, 4]
    os.makedirs(outdir, exist_ok=True)
    for t in terms:
        out, n, size = build(t, outdir)
        print(f"Term {t}: {out}  {n} page(s), {size / 1024:.0f} KB")
