# -*- coding: utf-8 -*-
"""Year 8 Fractal Five: five light-theme title-page options in one PDF (+ a contact-sheet PNG).

Same layout as the Year 9 and Year 10 covers (logo, kicker, title, YEAR pill, rainbow bar, meta, chip,
TERM tab, Name/Class box, caption, footer band), on a white page, each with a different fractal and a
different rainbow treatment.

    python3 covers8.py OUTDIR
"""
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
Y10_OPTS = os.path.join(os.path.dirname(HERE), "y10", "opts")
sys.path.insert(0, HERE)
sys.path.insert(0, Y10_OPTS)
from weasyprint import HTML  # noqa: E402
import art8 as A  # noqa: E402
import covers as K  # noqa: E402

INK, SUB = "#1C1A33", "#4A4762"

OPTIONS = [
    dict(key="A", name="Koch snowflake", nuance="neon", pal=A.PAL["neon"], art=A.koch_neon,
         five="#FF1F8E", pill=("#00B4FF", "#FFFFFF"), tab=("#7B4DFF", "#FFFFFF"), kick="#E0137A", chip="#7B4DFF",
         cap="every edge becomes four edges, each a third as long"),
    dict(key="B", name="Heighway dragon", nuance="iridescent", pal=A.PAL["iridescent"], art=A.dragon_iridescent,
         five="#8B5CF6", pill=("#5FEBC0", INK), tab=("#FF6EC7", INK), kick="#D9468F", chip="#8B5CF6",
         cap="fold a strip of paper in half, again and again"),
    dict(key="C", name="Apollonian gasket", nuance="stained glass", pal=A.PAL["jewel"], art=A.apollonian_glass,
         five="#D7263D", pill=("#1B998B", "#FFFFFF"), tab=("#2E86DE", "#FFFFFF"), kick="#6F2DBD", chip="#1B998B",
         cap="every circle touches three others; every curvature is a whole number"),
    dict(key="D", name="Pythagoras tree", nuance="watercolour", pal=A.PAL["watercolour"], art=A.pythagoras_wash,
         five="#D9578E", pill=("#7FD8BE", INK), tab=("#F4D35E", INK), kick="#3F8FD2", chip="#9B6CC9",
         cap="squares on the sides of a 3&ndash;4&ndash;5 right-angled triangle"),
    dict(key="E", name="Julia set", nuance="neon glow", pal=A.PAL["neon"], art=None,
         five="#7B4DFF", pill=("#FF1F8E", "#FFFFFF"), tab=("#00D68F", INK), kick="#0096D6", chip="#FF7A00",
         cap="<i>z</i> &rarr; <i>z</i><sup>2</sup> + <i>c</i> &nbsp;with&nbsp; <i>c</i> = &minus;0.73 + 0.19<i>i</i>"),
]

BASE = K.CSS + f"""
.L {{ background:#FFFFFF; }}
.L .logo {{ background:none; padding:0; left:15mm; top:13mm; width:44mm; }}
.L .tr {{ color:#5B5874; }}
.L .ttl {{ position:absolute; left:15mm; top:48mm; width:150mm; }}
.L .big {{ font-size:54pt; color:{INK}; margin-top:3mm; }}
.L .big .yr {{ display:inline-block; font-family:'Pop'; font-weight:700; font-size:16pt; line-height:1;
               letter-spacing:.24em; border-radius:1.6mm; padding:2.1mm 2.0mm 1.6mm 3.0mm; margin-left:5.5mm;
               vertical-align:0.55em; }}
.L .bar {{ width:46mm; margin:5.5mm 0 4.2mm 0; }}
.L .meta {{ color:{SUB}; }}
.L .chip {{ margin-top:3.6mm; background:#FFFFFF; }}
.L .tab {{ position:absolute; right:0; top:36mm; width:17mm; height:62mm; border-radius:2.2mm 0 0 2.2mm; }}
.L .tab .v {{ position:absolute; left:8.5mm; top:31mm; width:62mm; margin-left:-31mm; margin-top:-5mm; height:10mm;
              transform:rotate(-90deg); text-align:center; font-family:'Pop'; font-weight:700; font-size:15pt;
              letter-spacing:.2em; line-height:10mm; }}
.L .name {{ left:15mm; top:258mm; border:0.35mm solid #D9D6E5; }}
.L .cap {{ right:15mm; top:259mm; width:86mm; color:{INK}; text-align:right; line-height:1.5;
           background:rgba(255,255,255,0.85); padding:1.2mm 2.6mm; border-radius:1mm; }}
.L .cap b {{ margin-right:0; }}
.L .foot {{ background:#F4F2FA; color:{INK}; }}
.L .foot .r {{ color:#6A6785; }}
.L .hair {{ position:absolute; left:0; bottom:14mm; width:210mm; height:0.9mm; }}
.L .art {{ position:absolute; left:0; top:0; width:210mm; height:297mm; }}
.L img.jul {{ position:absolute; left:20mm; top:101mm; width:170mm; height:170mm; }}
"""


def grad(pal):
    stops = ", ".join(f"{c} {100 * i / (len(pal) - 1):.0f}%" for i, c in enumerate(pal))
    return f"linear-gradient(90deg, {stops})"


def option_css(o):
    k = o["key"]
    return (f".O{k} .kick {{ color:{o['kick']}; }} .O{k} .big em {{ font-style:normal; color:{o['five']}; }}"
            f".O{k} .big .yr {{ background:{o['pill'][0]}; color:{o['pill'][1]}; }}"
            f".O{k} .bar, .O{k} .hair {{ background:{grad(o['pal'])}; }}"
            f".O{k} .chip {{ color:{o['chip']}; border-color:{o['chip']}; }}"
            f".O{k} .tab {{ background:{o['tab'][0]}; }} .O{k} .tab .v {{ color:{o['tab'][1]}; }}")


def svg(elements):
    return ('<svg xmlns="http://www.w3.org/2000/svg" class="art" width="210mm" height="297mm" viewBox="0 0 210 297">'
            + "".join(elements) + "</svg>")


def page(o, term=1, julia=None):
    art = f'<img class="jul" src="file://{julia}">' if o["art"] is None else svg(o["art"]())
    chip = "Formulas provided" if term <= 2 else "Formulas from memory"
    ttl = (f'<div class="ttl"><div class="kick">{K.KICK}</div><div class="big">The Fractal<br><em>Five</em>'
           f'<span class="yr">YEAR 8</span></div><div class="bar"></div><div class="meta">{K.META}</div>'
           f'<div class="chip">{chip}</div></div>')
    top = (f'{K.logo()}<div class="tr">Mathematics<br>Year 8 &middot; Formula warm-ups</div>'
           f'<div class="tab"><div class="v">TERM {term}</div></div>')
    return (f'<div class="page L O{o["key"]}">{art}{top}{ttl}{K.name_box()}'
            f'<div class="cap"><b>{o["name"]}</b><br>{o["cap"]}</div><div class="hair"></div>{K.foot()}</div>')


def build(outdir):
    os.makedirs(outdir, exist_ok=True)
    jul = os.path.join(HERE, "julia.jpg")
    if not os.path.exists(jul):
        A.julia_jpg(jul)
    css = BASE + "".join(option_css(o) for o in OPTIONS)
    body = "".join(page(o, julia=jul) for o in OPTIONS)
    pdf = os.path.join(outdir, "Year8_Title_Page_Options.pdf")
    HTML(string=f"<!DOCTYPE html><html><head><meta charset='utf-8'><title>The Fractal Five - Year 8 title page "
                f"options</title><style>{css}</style></head><body>{body}</body></html>", base_url=HERE).write_pdf(pdf)
    return pdf


def contact_sheet(pdf, png, dpi=45):
    """All options side by side, labelled, for a quick comparison."""
    from PIL import Image, ImageDraw, ImageFont
    tmp = os.path.join(os.path.dirname(png), "_cs")
    subprocess.run(["pdftoppm", "-r", str(dpi), "-png", pdf, tmp], check=True)
    files = sorted(f for f in os.listdir(os.path.dirname(png)) if f.startswith("_cs"))
    ims = [Image.open(os.path.join(os.path.dirname(png), f)).convert("RGB") for f in files]
    w, h = ims[0].size
    pad, lab = 18, 34
    sheet = Image.new("RGB", (len(ims) * (w + pad) + pad, h + lab + 2 * pad), "#ECEAF3")
    d = ImageDraw.Draw(sheet)
    font = ImageFont.truetype(os.path.join(os.path.dirname(HERE), "y10", "fonts", "Poppins-Medium.ttf"), 15)
    for i, (im, o) in enumerate(zip(ims, OPTIONS)):
        x = pad + i * (w + pad)
        sheet.paste(im, (x, pad + lab))
        d.text((x, pad + 4), f"{o['key']}  {o['name']} - {o['nuance']}", fill="#1C1A33", font=font)
    sheet.save(png)
    for f in files:
        os.remove(os.path.join(os.path.dirname(png), f))
    return png


if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "out")
    pdf = build(out)
    print(pdf, os.path.getsize(pdf) // 1024, "KB")
    print(contact_sheet(pdf, os.path.join(out, "Year8_Title_Page_Options.png")))
