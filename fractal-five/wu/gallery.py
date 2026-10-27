"""Render every pool item of the given families as a figure gallery, for checking by eye (200 dpi).

    python3 wu/gallery.py FAMILIES OUT.pdf [new]

FAMILIES is a comma-separated list of family names, or 'all'. With 'new', only the items added in
Oct 2026 are drawn: the six new families, working-backwards items, sectors and zero-index items.
Each cell shows the family, the item, the question text and the answer computed from it.
"""
import html
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from weasyprint import HTML  # noqa: E402
import gen  # noqa: E402

NEW_FAMS = {"ang_line", "ang_par", "pct_incdec", "pct_orig", "sa_cyl", "capacity"}


def is_new(fam, it):
    return fam in NEW_FAMS or (isinstance(it, tuple) and it and it[0] in ("rev", "sec", "zero"))


fams = list(gen.GEN) if sys.argv[1] == "all" else sys.argv[1].split(",")
out = sys.argv[2]
only_new = len(sys.argv) > 3 and sys.argv[3] == "new"
cells = []
for fam in fams:
    items = []
    for it in gen.L1[fam] + gen.L2[fam]:
        if it not in items and (not only_new or is_new(fam, it)):
            items.append(it)
    for it in items:
        text, figf, key, ans = gen.GEN[fam](it)
        s = 1.0 if gen.lines(text) == 1 else 0.9
        try:
            fig = figf(s)
        except Exception as e:
            fig = f"<b style='color:red'>ERROR {html.escape(str(e))}</b>"
        lvl = "L1" if it in gen.L1[fam] else "L2"
        plain = html.escape(re.sub(r"<[^>]+>", "", text))
        cells.append(f'<div class="c"><div class="n">{fam} {lvl} {html.escape(str(it)[:70])}<br>'
                     f'<b>{plain}</b> &rarr; {ans}</div><div class="f">{fig}</div></div>')
doc = f"""<html><head><meta charset='utf-8'><style>
@page {{ size:180mm 268mm; margin:4mm; }}
body {{ font-family:'Open Sans'; margin:0; }}
.c {{ display:inline-block; width:84.5mm; height:50mm; border:0.2mm solid #ccc; margin:0.5mm; vertical-align:top;
      position:relative; overflow:hidden; }}
.n {{ font-size:5.6pt; color:#888; text-align:left; padding:0.5mm 1mm; height:7.5mm; overflow:hidden; line-height:1.25; }}
.n b {{ color:#555; font-weight:600; }}
.f {{ height:41mm; display:flex; align-items:center; justify-content:center; }}
.f svg {{ display:block; }}
</style></head><body>{''.join(cells)}</body></html>"""
HTML(string=doc).write_pdf(out)
print(len(cells), "figures")
