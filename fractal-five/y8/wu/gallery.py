"""Every Year 8 pool item, drawn as it prints, for checking by eye (one PDF).

    python3 wu/gallery.py OUT.pdf [FAMILIES]

FAMILIES: comma-separated family names (default: all). Each cell shows the family and item, the question,
the answer computed from it, the printed formula, and the figure or table at the size it prints
(s = 1.0 for a one-line question, 0.9 for two lines).
"""
import html
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from weasyprint import HTML  # noqa: E402
import gen  # noqa: E402
import wu  # noqa: E402

STRAND = {f: X for X in "ABCDE" for f in gen.Y7[X] + gen.Y8_ADD.get(X, [])}
TITLE = {"A": "A  Angles and shapes (+ Pythagoras)", "B": "B  Measurement", "C": "C  Number and percentages",
         "D": "D  Algebra, ratio and rates", "E": "E  Number plane, data and chance"}


def cells_for(fam):
    out = []
    for it in gen.POOL[fam]:
        text, figf, key, ans, fx = gen.gen(fam, it)
        q = gen.mk(text, figf, key, ans, fx)
        tag = " &middot; Advanced Terms 3&ndash;4" if fam in gen.Y8_FAMS else ""
        rev = " &middot; working backwards" if gen.is_rev(it) else ""
        out.append(f'<div class="c"><div class="n">{fam}{tag}{rev} &middot; {html.escape(str(it)[:90])}</div>'
                   f'<div class="t">{text}</div><div class="ga">&rarr; <b>{html.escape(ans)}</b>'
                   f'<span class="gfx">{q.fx}</span></div><div class="f">{q.fig or ""}</div></div>')
    return out


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else "out/Year8_Gallery.pdf"
    fams = sys.argv[2].split(",") if len(sys.argv) > 2 else list(STRAND)
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
    doc = f"""<html><head><meta charset='utf-8'><title>The Fractal Five - Year 8 gallery</title><style>
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
</style></head><body><h1>The Fractal Five &middot; Year 8 &middot; gallery of every pool item</h1>
<div class="intro">Every pool item as it prints (figures at the printed size), with the answer computed from the
same numbers that label the figure and the formula printed with it.</div>
{''.join(body)}</body></html>"""
    HTML(string=doc, base_url=os.path.dirname(os.path.abspath(__file__))).write_pdf(out)
    print(n, "items ->", out)


if __name__ == "__main__":
    main()
