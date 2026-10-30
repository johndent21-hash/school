"""Gallery of the Year 10 question types, for checking by eye.

    python3 wu/gallery.py OUT.pdf          every new question type: a selection of items from each new
                                           family (all its sub-formulas and variants, both levels) and the
                                           new variants of the reused families
    python3 wu/gallery.py OUT.pdf all      every item of every new family and variant (for QA)

Each cell is drawn as it prints: the question, its figure at the printed size, the formula strip
(as printed in Terms 1-2, and in Term 4 for the pyramid and cone) and the answer computed from the
same numbers that label the figure.
"""
import html
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from weasyprint import HTML  # noqa: E402
import gen  # noqa: E402
import wu  # noqa: E402

NEW_FAMS = ["trig_ratio", "trig_top", "trig_bottom", "trig_angle", "similar", "arc", "sector", "capacity",
            "v_pyramid", "v_cone", "profit_pct", "interest", "wages", "salary", "commission", "holiday_pay",
            "zero_neg", "sci", "formula_sub", "ratio", "freq"]
# reused families with new Year 10 variants: (family, test for a new item)
NEW_VARIANTS = [("a_circle", lambda it: it[0] == "d"),
                ("idx", lambda it: isinstance(it[1], str) and (it[4] != 1 or it[5] != 1)),
                ("linear", lambda it: it[0] == "si"),
                ("mean", lambda it: it[0] == "freq")]
TAGS = {"elev", "dep", "rev", "si", "freq", "base", "zero", "neg", "to", "from", "exp", "rel", "disc", "inc", "part",
        "img", "org", "sale", "price", "plain$", "gst", "pop", "wage", "plainkg"}


def variant(fam, it):
    t = [x for x in (it if isinstance(it, tuple) else ()) if isinstance(x, str) and x in TAGS]
    dia = [x for x in it if isinstance(x, bool)] if isinstance(it, tuple) else []
    return (gen.GEN[fam](it)[2], tuple(t), tuple(dia))


def pick(fam, items, n):
    """Up to n items, covering every (formula, variant) of the family first, alternating the levels."""
    out, seen = [], set()
    for it in items:
        v = variant(fam, it[1])
        if v not in seen:
            seen.add(v)
            out.append(it)
    for it in items:
        if len(out) >= n:
            break
        if it not in out:
            out.append(it)
    return out[:max(n, len(seen))]


def level_items(fam, test=None):
    l1 = [("L1", it) for it in gen.L1.get(fam, []) if test is None or test(it)]
    l2 = [("L2", it) for it in gen.L2.get(fam, []) if test is None or test(it)]
    mixed = []
    for i in range(max(len(l1), len(l2))):
        mixed += l1[i:i + 1] + l2[i:i + 1]
    return mixed


def cell(fam, lvl, it):
    text, figf, key, ans = gen.GEN[fam](it)
    q = gen.mk(text, figf, key, ans)
    fx, small = gen.FX[key]
    prints = lvl == "L1" or fam in gen.TERM4_ONLY
    where = ("Term 4 only, formula printed" if fam in gen.TERM4_ONLY else
             ("Terms 1–2 (formula printed)" if lvl == "L1" else "Terms 3–4 (from memory)"))
    fxh = (f'<div class="gfx"><span class="fxl">Formula</span><span class="fxf{" sm" if small else ""}">{fx}</span></div>'
           if prints else '<div class="gfx none">Formula recalled from memory</div>')
    fig = q.fig or ""
    return (f'<div class="g"><div class="gn">{fam} &middot; {where} &middot; {html.escape(str(it))[:80]}</div>'
            f'<div class="gq"><span class="qn">Q</span><span class="qt">{q.text}</span></div>'
            f'<div class="gf">{fig}</div>{fxh}<div class="ga"><b>Answer</b> {gen.ans_html(ans, fam)}</div></div>')


def main():
    out = sys.argv[1]
    every = len(sys.argv) > 2 and sys.argv[2] == "all"
    blocks = []
    for X in "ABCDE":
        cells = []
        for fam in gen.STRANDS[X]:
            if fam in NEW_FAMS:
                items = level_items(fam)
                chosen = items if every else pick(fam, items, 6 if fam in ("v_pyramid", "v_cone") else 4)
            else:
                test = dict(NEW_VARIANTS).get(fam)
                if test is None:
                    continue
                items = level_items(fam, test)
                chosen = items if every else pick(fam, items, 2)
            cells += [cell(fam, lvl, it) for lvl, it in chosen]
        blocks.append(f'<div class="strand">{X} &nbsp; {gen.STRAND_NAMES[X]}</div>' + "".join(cells))
    intro = ('<div class="intro"><b>The Fractal Five &middot; Year 10 &middot; new question types</b><br>'
             'Every new family (and the new variants of the reused ones), drawn at the printed size. Each cell shows '
             'when it is used, the formula strip as printed, and the answer computed from the same numbers that '
             'label the figure. Diagrams are drawn to scale.</div>')
    css = wu.css() + """
@page { size:A4; margin:9mm 10mm; }
body { font-family:'OS'; font-size:10.5pt; color:#35322D; }
.intro { font-size:8.6pt; color:#4A4741; margin:0 0 3mm 0; line-height:1.45; }
.intro b { font-family:'Pop'; font-weight:700; font-size:11pt; color:#35322D; }
.strand { font-family:'Pop'; font-weight:700; font-size:8pt; letter-spacing:.18em; text-transform:uppercase; color:#3B7FC0;
      margin:2mm 0 1.5mm 0; break-after:avoid; width:100%; }
.g { display:inline-block; width:91.5mm; height:64.5mm; border:0.3mm solid #CDC7BC; border-radius:1.6mm; margin:0 1mm 1.6mm 0;
     vertical-align:top; position:relative; overflow:hidden; padding:1.6mm 3mm 0 3mm; break-inside:avoid; }
.gn { font-size:5.6pt; color:#9A948A; height:3.2mm; overflow:hidden; white-space:nowrap; }
.gq { display:flex; align-items:flex-start; margin-top:0.6mm; }
.qn { font-family:'Pop'; font-weight:700; font-size:11pt; line-height:1.3; color:#3B7FC0; width:6.4mm; flex:none; margin-top:-0.4mm; }
.qt { flex:1; line-height:1.4; }
.gf { position:absolute; left:3mm; right:3mm; top:15.5mm; bottom:16.5mm; display:flex; align-items:center; justify-content:center; }
.gf svg { display:block; }
.gfx { position:absolute; left:3mm; right:3mm; bottom:6.6mm; height:8.4mm; background:#F2EFE8; border-radius:1.1mm;
       display:flex; align-items:center; padding:0 3mm 0 4.4mm; }
.gfx::before { content:""; position:absolute; left:0; top:0; bottom:0; width:1.1mm; background:#3B7FC0; border-radius:1.1mm 0 0 1.1mm; }
.gfx.none { background:none; font-size:7pt; color:#9A948A; padding-left:0; }
.gfx.none::before { display:none; }
.ga { position:absolute; left:3mm; right:3mm; bottom:1.4mm; font-size:8.6pt; color:#1F5E9E; }
.ga b { font-family:'Pop'; font-weight:500; font-size:6.1pt; letter-spacing:.16em; text-transform:uppercase; margin-right:2mm; }
"""
    doc = (f"<!DOCTYPE html><html><head><meta charset='utf-8'><title>The Fractal Five - Year 10 - new question types"
           f"</title><style>{css}</style></head><body>{intro}{''.join(blocks)}</body></html>")
    HTML(string=doc, base_url=HERE).write_pdf(out)
    n = len(re.findall(r'<div class="g">', doc))
    print(f"{out}: {n} cells")


if __name__ == "__main__":
    main()
