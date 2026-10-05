import sys, os, html
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from weasyprint import HTML
import gen
fams = sys.argv[1].split(",")
out = sys.argv[2]
cells = []
for fam in fams:
    items = []
    for it in gen.L1[fam] + gen.L2[fam]:
        if it not in items:
            items.append(it)
    for it in items:
        text, figf, key, ans = gen.GEN[fam](it)
        s = 1.0 if gen.lines(text) == 1 else 0.9
        try:
            fig = figf(s)
        except Exception as e:
            fig = f"<b style='color:red'>ERROR {html.escape(str(e))}</b>"
        cells.append(f'<div class="c"><div class="n">{fam} {html.escape(str(it))[:46]} &rarr; {ans}</div>{fig}</div>')
doc = f"""<html><head><meta charset='utf-8'><style>
@page {{ size:320mm 420mm; margin:4mm; }}
body {{ font-family:'Open Sans'; margin:0; }}
.c {{ display:inline-block; width:77mm; height:44mm; border:0.2mm solid #ccc; margin:0.5mm; vertical-align:top;
      text-align:center; position:relative; overflow:hidden; }}
.n {{ font-size:6pt; color:#888; text-align:left; padding:0.5mm 1mm; height:4mm; overflow:hidden; white-space:nowrap; }}
.c svg {{ display:block; margin:0.5mm auto 0 auto; }}
</style></head><body>{''.join(cells)}</body></html>"""
HTML(string=doc).write_pdf(out)
print(len(cells), "figures")
