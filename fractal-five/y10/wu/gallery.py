"""Every new Year 10 pool item, drawn as it prints, for checking by eye (one PDF).

    python3 wu/gallery.py OUT.pdf [FAMILIES]

FAMILIES: comma-separated family names (default: every family with new items). Each cell shows the
family, level and item, the question, the answer computed from it, the printed formula, and the
figure or table at the size it prints (s = 1.0 for a one-line question, 0.9 for two lines).
"""
import html
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from weasyprint import HTML  # noqa: E402
import gen  # noqa: E402
import wu  # noqa: E402
from formulas import FX  # noqa: E402

# families that are new for Year 10 (all their items), and reused families whose new item kinds are shown
NEW_FAMS = ["trig_ratio", "trig_top", "trig_bottom", "trig_angle", "similar", "arc", "sector", "capacity",
            "v_pyramid", "v_cone", "profit_pct", "interest", "wages", "salary", "commission", "holiday_pay",
            "zero_neg", "sci", "formula_sub", "ratio", "freq", "idx", "linear", "mean"]
NEW_KIND = {"idx": lambda it: it[1] != 1 or (it[0] != "pow" and it[4] != 1),     # with a coefficient
            "linear": lambda it: it[0] == "gi", "mean": lambda it: it[0] == "ft"}
STRAND = {f: X for X, fams in gen.STRANDS.items() for f in fams}
STRAND.update({"v_pyramid": "B", "v_cone": "B"})
TITLE = {"A": "A  Right-angled triangles and similar figures", "B": "B  Area, surface area and volume",
         "C": "C  Percentages and money", "D": "D  Indices, formulas and rates",
         "E": "E  Straight-line graphs, data and probability"}


def cells_for(fam):
    items = []
    for it in gen.L1[fam] + gen.L2[fam]:
        if it not in items and NEW_KIND.get(fam, lambda _: True)(it):
            items.append(it)
    out = []
    for it in items:
        text, figf, key, ans = gen.GEN[fam](it)
        s = 1.0 if gen.lines(text) == 1 else 0.9
        try:
            fig = figf(s) if figf else ""
        except Exception as e:          # noqa: BLE001 - show the failure in the gallery itself
            fig = f"<b style='color:red'>ERROR {html.escape(str(e))}</b>"
        lvl = "L1" if it in gen.L1[fam] else "L2"
        tag = " &middot; T4 only, formula printed" if fam in ("v_pyramid", "v_cone") else ""
        elev = " &middot; elevation/depression (T3-4)" if gen.is_elev(it) else ""
        out.append(f'<div class="c"><div class="n">{fam} {lvl}{tag}{elev} &middot; {html.escape(str(it)[:80])}</div>'
                   f'<div class="t">{text}</div><div class="ga">&rarr; <b>{html.escape(ans)}</b>'
                   f'<span class="gfx">{FX[key][0]}</span></div><div class="f">{fig}</div></div>')
    return out


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else "out/Year10_Gallery.pdf"
    fams = sys.argv[2].split(",") if len(sys.argv) > 2 else NEW_FAMS
    body, n = [], 0
    for X in "ABCDE":
        sel = [f for f in fams if STRAND[f] == X]
        if not sel:
            continue
        body.append(f'<h2>{TITLE[X]}</h2>')
        for f in sel:
            cs = cells_for(f)
            n += len(cs)
            body += cs
    doc = f"""<html><head><meta charset='utf-8'><title>The Fractal Five - Year 10 gallery of new items</title><style>
{wu.css()}
@page {{ size:A4; margin:8mm 9mm; }}
body {{ font-family:'OS'; margin:0; font-size:9pt; }}
h1 {{ font-family:'Pop'; font-size:15pt; margin:0 0 1mm 0; }}
.intro {{ font-size:8pt; color:#4A4741; margin-bottom:2mm; }}
h2 {{ font-family:'Pop'; font-weight:500; font-size:9pt; letter-spacing:.12em; text-transform:uppercase; color:#3B7FC0;
      margin:2.5mm 0 1mm 0; break-after:avoid; }}
.c {{ display:inline-block; width:94mm; height:62mm; border:0.2mm solid #CDC7BC; border-radius:1.5mm; margin:0.6mm;
      vertical-align:top; position:relative; overflow:hidden; padding:1.6mm 2.4mm; break-inside:avoid; }}
.n {{ font-size:5.6pt; color:#8A857C; line-height:1.25; height:5mm; overflow:hidden; }}
.t {{ font-size:9.5pt; line-height:1.3; }}
.ga {{ font-size:8pt; color:#1F5E9E; margin-top:0.6mm; }}
.ga .gfx {{ color:#4A4741; margin-left:3mm; font-size:7.6pt; }}
.ga .gfx .frac {{ font-size:0.84em; vertical-align:-0.66em; }}
.f {{ position:absolute; left:0; right:0; bottom:1.5mm; top:21mm; display:flex; align-items:center; justify-content:center; }}
.f svg {{ display:block; }}
.f .disp {{ font-size:15pt; }}
</style></head><body><h1>The Fractal Five &middot; Year 10 &middot; gallery of new items</h1>
<div class="intro">Every new pool item as it prints (figures at the printed size), with the answer computed from the
same numbers that label the figure and the formula printed in Terms 1&ndash;2 (and for the Term 4 pyramid and cone).
L1 = Terms 1&ndash;2 pool; L2 = Terms 3&ndash;4 pool (Terms 3&ndash;4 also draw on half of L1).</div>
{''.join(body)}</body></html>"""
    HTML(string=doc, base_url=os.path.dirname(os.path.abspath(__file__))).write_pdf(out)
    print(n, "items ->", out)


if __name__ == "__main__":
    main()
