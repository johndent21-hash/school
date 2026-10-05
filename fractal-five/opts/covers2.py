# -*- coding: utf-8 -*-
"""Three more 'The Fractal Five' title pages in the vivid scheme the user chose (option C):
midnight #120F24, five colours pink/orange/yellow/mint/blue, white title with yellow 'Five',
rainbow bar, yellow TERM tab on the right edge, near-black footer band.

D  Sierpinski pentagon   - a pentagonal fractal: five copies of itself, each scaled by 1/phi^2
E  Multibrot z^6 + c     - the Mandelbrot set's five-fold cousin
F  Times table of 6      - join n to 6n (mod 360) on a circle: five cusps (not a fractal)
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from weasyprint import HTML  # noqa: E402
import art_opts as A  # noqa: E402
import covers as K  # noqa: E402

CSS = K.CSS + """
.V { background:#120F24; }
.V .tr { color:#C9C3E6; }
.V .kick { color:#FF7AAE; }
.V .big { font-size:54pt; color:#fff; margin-top:3mm; }
.V .big em { color:#FFD23F; }
.V .bar { background:linear-gradient(90deg, #FF3E8A 0%, #FF8B2C 25%, #FFD23F 50%, #22E4AC 75%, #3D8BFF 100%);
          width:46mm; margin:5.5mm 0 4.2mm 0; }
.V .meta { color:#DAD5F0; }
.V .chip { margin-top:3.6mm; color:#FFE38A; border-color:#FFD23F; }
.V .tab { position:absolute; right:0; top:36mm; width:17mm; height:62mm; background:#FFD23F;
          border-radius:2.2mm 0 0 2.2mm; }
.V .tab .v { position:absolute; left:8.5mm; top:31mm; width:62mm; margin-left:-31mm; margin-top:-5mm; height:10mm;
             transform:rotate(-90deg); text-align:center; font-family:'Pop'; font-weight:700; font-size:15pt;
             letter-spacing:.2em; color:#120F24; line-height:10mm; }
.V .cap { color:#fff; text-align:right; background:rgba(18,15,36,0.72); padding:1.2mm 2.6mm; border-radius:1mm; }
.V .foot { background:#0B0A16; color:#fff; }
.V .foot .r { color:#C9C3E6; }
.V .ttl { position:absolute; left:15mm; top:48mm; width:150mm; }
.V .name { left:15mm; top:258mm; }
.V .cap { right:15mm; top:261mm; line-height:1.55; }
.V .cap b { margin-right:0; }
/* F: poster layout - circle at the top, title at the bottom */
.F .ttl { top:203mm; }
.F .name { left:111mm; top:247mm; }
.F .cap { top:199.5mm; }
"""

TOP = (f'{K.logo()}<div class="tr">Mathematics<br>Year 9 &middot; Formula warm-ups</div>'
       f'<div class="tab"><div class="v">TERM {K.TERM}</div></div>')


def svg_page(elements):
    return ('<svg xmlns="http://www.w3.org/2000/svg" class="art" width="210mm" height="297mm" '
            'viewBox="0 0 210 297">' + "".join(elements) + '</svg>')


def page_D():
    glow = os.path.join(HERE, "art", "pent_glow.png")
    A.pentagon_glow_png(glow, cx=105, cy=187, R=78)
    art = svg_page(A.sierpinski_pentagon_svg(cx=105, cy=187, R=78, depth=5))
    return (f'<div class="page V D"><img class="art" src="file://{glow}">{art}{TOP}{K.title_block()}{K.name_box()}'
            f'<div class="cap"><b>Sierpi&nacute;ski pentagon</b><br>five copies of itself, each scaled by '
            f'1/<i>&phi;</i><sup>2</sup> &asymp; 0.382</div>{K.foot()}</div>')


def page_E():
    return (f'<div class="page V E"><img class="art" src="file://{os.path.join(HERE, "art", "multibrot.jpg")}">'
            f'{TOP}{K.title_block()}{K.name_box()}'
            f'<div class="cap"><b>Multibrot set</b><br><i>z</i> &rarr; <i>z</i><sup>6</sup> + <i>c</i> '
            f'&nbsp;&middot;&nbsp; the Mandelbrot set&rsquo;s five-fold cousin</div>{K.foot()}</div>')


def page_F():
    art = svg_page(A.times_table_svg(cx=105, cy=118, R=78, N=360, m=6))
    return (f'<div class="page V F">{art}{TOP}{K.title_block()}{K.name_box()}'
            f'<div class="cap"><b>Times table of 6</b>join <i>n</i> to 6<i>n</i> (mod 360) '
            f'&nbsp;&middot;&nbsp; five cusps appear</div>{K.foot()}</div>')


def build(path, dpi=300, only=None):
    mpath = os.path.join(HERE, "art", "multibrot.jpg")
    if not os.path.exists(mpath) or os.environ.get("REDO"):
        W, H = int(round(210 / 25.4 * dpi)), int(round(297 / 25.4 * dpi))
        A.multibrot_art(W, H, cx_mm=105.0, cy_mm=183.0, mm_per_unit=62.0, fade=(30.0, 60.0)).save(
            mpath, quality=93, subsampling=0)
    pages = {"D": page_D, "E": page_E, "F": page_F}
    body = "".join(pages[k]() for k in (only or "DEF"))
    doc = (f"<!DOCTYPE html><html><head><meta charset='utf-8'><title>The Fractal Five - title page options 2</title>"
           f"<style>{CSS}</style></head><body>{body}</body></html>")
    HTML(string=doc, base_url=HERE).write_pdf(path)
    return path


if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "/tmp/opts2.pdf"
    dpi = int(sys.argv[2]) if len(sys.argv) > 2 else 300
    only = sys.argv[3] if len(sys.argv) > 3 else None
    print(build(out, dpi, only))
