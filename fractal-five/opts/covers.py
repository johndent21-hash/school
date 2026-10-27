# -*- coding: utf-8 -*-
"""Build the three 'The Fractal Five' title-page options into one PDF."""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
WU = os.path.join(ROOT, "wu")
sys.path.insert(0, HERE)
sys.path.insert(0, WU)
from weasyprint import HTML  # noqa: E402
import art_opts as A  # noqa: E402

WUART = os.path.join(WU, "art")
PF = os.path.join(ROOT, "fonts")       # Poppins TTFs (bundled; also installed system-wide)
OF = os.path.join(ROOT, "fonts")       # Open Sans TTFs
TERM = 1
KICK = "Five questions. Every lesson."
META = "Weeks 1&ndash;10 &middot; 30 sessions &middot; 150 questions"

FONTS = f"""
@font-face {{ font-family:'Pop'; src:url('file://{PF}/Poppins-Regular.ttf'); font-weight:400; }}
@font-face {{ font-family:'Pop'; src:url('file://{PF}/Poppins-Medium.ttf'); font-weight:500; }}
@font-face {{ font-family:'Pop'; src:url('file://{PF}/Poppins-Bold.ttf'); font-weight:700; }}
@font-face {{ font-family:'OS'; src:url('file://{OF}/OpenSans-Regular.ttf'); font-weight:400; font-style:normal; }}
@font-face {{ font-family:'OS'; src:url('file://{OF}/OpenSans-Italic.ttf'); font-weight:400; font-style:italic; }}
@font-face {{ font-family:'OS'; src:url('file://{OF}/OpenSans-SemiBold.ttf'); font-weight:600; font-style:normal; }}
"""

CSS = FONTS + """
@page { size:A4; margin:0; }
* { box-sizing:border-box; margin:0; padding:0; }
body { font-family:'OS',sans-serif; }
.page { width:210mm; height:297mm; position:relative; overflow:hidden; break-after:page; }
.page:last-child { break-after:auto; }
.art { position:absolute; left:0; top:0; width:210mm; height:297mm; }
.logo { position:absolute; left:15mm; top:13mm; width:42mm; background:#fff; border-radius:1.8mm; padding:2mm 2.6mm; }
.logo img { width:100%; display:block; }
.tr { position:absolute; right:15mm; top:16.5mm; text-align:right; font-family:'Pop'; font-weight:500;
      font-size:7.3pt; letter-spacing:.24em; text-transform:uppercase; line-height:2; }
.kick { font-family:'Pop'; font-weight:500; font-size:8.8pt; letter-spacing:.26em; text-transform:uppercase; }
.big { font-family:'Pop'; font-weight:700; line-height:1.0; }
.big em { font-style:normal; }
.bar { width:30mm; height:1.4mm; border-radius:0.7mm; }
.meta { font-size:10pt; }
.chip { display:inline-block; font-family:'Pop'; font-weight:500; font-size:7.2pt; letter-spacing:.18em;
        text-transform:uppercase; border-radius:0.9mm; padding:0.7mm 2.4mm 0.4mm 2.7mm; border:0.35mm solid; }
.name { position:absolute; width:84mm; background:#fff; border-radius:1.8mm; padding:3mm 4mm 3.6mm 4mm; }
.name .f { display:flex; align-items:flex-end; }
.name .f + .f { margin-top:4.4mm; }
.name b { font-family:'Pop'; font-weight:500; font-size:6.8pt; letter-spacing:.18em; text-transform:uppercase;
          color:#35322D; width:15mm; }
.name i { flex:1; border-bottom:0.3mm solid #B9B4AA; height:5mm; }
.foot { position:absolute; left:0; bottom:0; width:210mm; height:14mm; padding:5.1mm 15mm 0 15mm;
        font-family:'Pop'; font-weight:700; font-size:7pt; letter-spacing:.24em; text-transform:uppercase; }
.foot .r { float:right; font-weight:500; }
.cap { position:absolute; font-size:7.6pt; letter-spacing:.04em; }
.cap b { font-family:'Pop'; font-weight:500; letter-spacing:.2em; text-transform:uppercase; font-size:6.6pt; margin-right:1.6mm; }

/* ---------- A: Maurer rose, blue / charcoal ---------- */
.A { background:linear-gradient(180deg, #34312C 0%, #1F1D1B 100%); }
.A .tr { color:#B9C9DA; }
.A .ttl { position:absolute; left:15mm; top:50mm; width:130mm; }
.A .kick { color:#7FB2E5; }
.A .big { font-size:48pt; color:#fff; margin-top:3mm; }
.A .big em { color:#5FA2E6; }
.A .bar { background:#3B7FC0; margin:5.5mm 0 4.2mm 0; }
.A .meta { color:#CFCAC1; }
.A .chip { margin-top:3.6mm; color:#A8D0F5; border-color:#5FA2E6; }
.A .term { position:absolute; right:15mm; top:38mm; text-align:right; }
.A .term .t { font-family:'Pop'; font-weight:500; font-size:10pt; letter-spacing:.34em; text-transform:uppercase;
              color:#B9C9DA; margin-right:-0.34em; }
.A .term .n { font-family:'Pop'; font-weight:700; font-size:168pt; line-height:0.92; color:#3B7FC0; margin-top:-2mm; }
.A .name { left:15mm; top:258mm; }
.A .cap { right:15mm; top:266mm; color:#8FB3D9; text-align:right; }
.A .foot { background:#1A1816; color:#fff; }
.A .foot .r { color:#B9C9DA; }

/* ---------- B: Penrose tiling, fresh light ---------- */
.B { background:#FBF6EC; }
.B .ttl { position:absolute; left:15mm; top:204mm; width:120mm; }
.B .kick { color:#E8503F; }
.B .big { font-size:50pt; color:#1D2B53; margin-top:2.6mm; }
.B .big em { color:#FF6B5B; }
.B .bar { background:#FFC145; margin:4.6mm 0 3.6mm 0; }
.B .meta { color:#4A5578; }
.B .chip { margin-top:3mm; color:#1D2B53; border-color:#1D2B53; }
.B .logo { border:0.35mm solid #E6DECF; }
.B .badge { position:absolute; left:22mm; top:58mm; width:38mm; height:38mm; border-radius:50%;
            background:#FF6B5B; color:#FBF6EC; text-align:center; border:1.4mm solid #FBF6EC; }
.B .badge .t { font-family:'Pop'; font-weight:500; font-size:8.4pt; letter-spacing:.3em; text-transform:uppercase;
               margin-top:5.2mm; margin-left:0.3em; }
.B .badge .n { font-family:'Pop'; font-weight:700; font-size:54pt; line-height:0.95; margin-top:-0.6mm; }
.B .name { left:111mm; top:246mm; border:0.35mm solid #D9D0BF; }
.B .cap { right:15mm; top:196mm; color:#4A5578; text-align:right; }
.B .foot { background:#1D2B53; color:#FBF6EC; }
.B .foot .r { color:#A9B4D6; }

/* ---------- C: Newton's method z^5 = 1, vivid dark ---------- */
.C { background:#120F24; }
.C .shade { position:absolute; left:0; top:0; width:210mm; height:170mm;
            background:linear-gradient(180deg, rgba(18,15,36,1) 0%, rgba(18,15,36,0.97) 38%, rgba(18,15,36,0.55) 72%, rgba(18,15,36,0) 100%); }
.C .tr { color:#C9C3E6; }
.C .ttl { position:absolute; left:15mm; top:48mm; width:150mm; }
.C .kick { color:#FF7AAE; }
.C .big { font-size:54pt; color:#fff; margin-top:3mm; }
.C .big em { color:#FFD23F; }
.C .bar { background:linear-gradient(90deg, #FF3E8A 0%, #FF8B2C 25%, #FFD23F 50%, #22E4AC 75%, #3D8BFF 100%);
          width:46mm; margin:5.5mm 0 4.2mm 0; }
.C .meta { color:#DAD5F0; }
.C .chip { margin-top:3.6mm; color:#FFE38A; border-color:#FFD23F; }
.C .tab { position:absolute; right:0; top:36mm; width:17mm; height:62mm; background:#FFD23F;
          border-radius:2.2mm 0 0 2.2mm; }
.C .tab .v { position:absolute; left:8.5mm; top:31mm; width:62mm; margin-left:-31mm; margin-top:-5mm; height:10mm;
             transform:rotate(-90deg); text-align:center; font-family:'Pop'; font-weight:700; font-size:15pt;
             letter-spacing:.2em; color:#120F24; line-height:10mm; }
.C .name { left:15mm; top:258mm; }
.C .cap { right:15mm; top:266mm; color:#fff; text-align:right; background:rgba(18,15,36,0.72);
          padding:1.2mm 2.6mm; border-radius:1mm; }
.C .foot { background:#0B0A16; color:#fff; }
.C .foot .r { color:#C9C3E6; }
"""


def logo():
    return f'<div class="logo"><img src="file://{WUART}/logo_rgba.png"></div>'


def title_block(extra=""):
    return (f'<div class="ttl"><div class="kick">{KICK}</div>'
            f'<div class="big">The Fractal<br><em>Five</em></div><div class="bar"></div>'
            f'<div class="meta">{META}</div><div class="chip">Formulas provided</div>{extra}</div>')


def name_box():
    return '<div class="name"><div class="f"><b>Name</b><i></i></div><div class="f"><b>Class</b><i></i></div></div>'


def foot():
    return '<div class="foot"><span>Kingscliff High School</span><span class="r">Mathematics Faculty</span></div>'


def page_A():
    return (f'<div class="page A"><div class="art">{A.rose_svg()}</div>{logo()}'
            f'<div class="tr">Mathematics<br>Year 9 &middot; Formula warm-ups</div>{title_block()}'
            f'<div class="term"><div class="t">Term</div><div class="n">{TERM}</div></div>'
            f'{name_box()}<div class="cap"><b>Maurer rose</b><i>r</i> = sin 5<i>&theta;</i> &nbsp;&middot;&nbsp; '
            f'361 chords, 97&deg; apart</div>{foot()}</div>')


PAL_B = {"thick": ["#1D2B53", "#3AA7E0", "#2EC4A6", "#2E5AA8", "#1FA3B5"],
         "thin": ["#FF6B5B", "#FFC145", "#FF8A5B", "#FFB03B", "#FF6B5B"],
         "grout": "#FBF6EC", "ring": "#1D2B53"}


def page_B():
    svg = ('<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 210 297">'
           + "".join(A.penrose_svg(140, 97, 94, 118, gens=6, palette=PAL_B)) + '</svg>')
    return (f'<div class="page B"><div class="art">{svg}</div>{logo()}'
            f'<div class="badge"><div class="t">Term</div><div class="n">{TERM}</div></div>'
            f'<div class="cap"><b>Penrose tiling</b>two tiles &middot; five-fold symmetry &middot; never repeats</div>'
            f'{title_block()}{name_box()}{foot()}</div>')


def page_C():
    return (f'<div class="page C"><img class="art" src="file://{os.path.join(HERE, "art", "newton.jpg")}">'
            f'{logo()}'
            f'<div class="tr">Mathematics<br>Year 9 &middot; Formula warm-ups</div>{title_block()}'
            f'<div class="tab"><div class="v">TERM {TERM}</div></div>'
            f'{name_box()}<div class="cap"><b>Newton&rsquo;s method</b><i>z</i><sup>5</sup> = 1 &nbsp;&middot;&nbsp; '
            f'five roots, five colours</div>{foot()}</div>')


NEWTON_COLS = ["#FF3E8A", "#FF8B2C", "#FFD23F", "#22E4AC", "#3D8BFF"]


def build(path, dpi=300, only=None):
    npath = os.path.join(HERE, "art", "newton.jpg")
    if not os.path.exists(npath) or os.environ.get("REDO_NEWTON"):
        W, H = int(round(210 / 25.4 * dpi)), int(round(297 / 25.4 * dpi))
        A.newton_art(W, H, cols=NEWTON_COLS).save(npath, quality=93, subsampling=0)
    pages = {"A": page_A, "B": page_B, "C": page_C}
    body = "".join(pages[k]() for k in (only or "ABC"))
    doc = (f"<!DOCTYPE html><html><head><meta charset='utf-8'><title>The Fractal Five - title page options</title>"
           f"<style>{CSS}</style></head><body>{body}</body></html>")
    HTML(string=doc, base_url=HERE).write_pdf(path)
    return path


if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "/tmp/opts.pdf"
    dpi = int(sys.argv[2]) if len(sys.argv) > 2 else 300
    only = sys.argv[3] if len(sys.argv) > 3 else None
    print(build(out, dpi, only))
