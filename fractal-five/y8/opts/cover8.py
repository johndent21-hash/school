# -*- coding: utf-8 -*-
"""Year 8 Fractal Five title page: approved option C (light theme, stained-glass Apollonian gasket).

White page, Kingscliff logo without a box, ink #1C1A33, kicker, "The Fractal Five" with the YEAR pill on
the same line as "Five", rainbow bar, meta line, chip, TERM tab on the right edge, Name/Class box,
caption, light footer band (#F4F2FA) with a thin rainbow line on top. Artwork: the integer Apollonian
gasket (-1, 2, 2, 3) as vector SVG, R 68 mm, centred at (105, 183) mm, jewel palette by angle round the
centre, white leading, a soft sheen on the larger panes (art8.apollonian_glass). The gasket's SVG is
made once and cached in opts/art/apollonian_glass.svg.

    cover_html(version, term) -> (css, body)       version 'M' (Mainstream) or 'A' (Advanced)
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import art8 as A  # noqa: E402
import covers as K  # noqa: E402

INK, SUB = "#1C1A33", "#4A4762"
RUBY, AMBER, TOPAZ, EMERALD, SAPPHIRE, AMETHYST = A.PAL["jewel"]
WHITE = "#FFFFFF"
CACHE = os.path.join(HERE, "art", "apollonian_glass.svg")

ACCENTS = {
    "M": dict(five=RUBY, pill=(EMERALD, WHITE), pill_text="YEAR 8", tab=(SAPPHIRE, WHITE), kick=AMETHYST,
              chip=EMERALD),
    "A": dict(five=SAPPHIRE, pill=(AMETHYST, WHITE), pill_text="YEAR 8 ADVANCED", tab=(EMERALD, WHITE), kick=RUBY,
              chip=AMETHYST),
}
CAPTION = ("<b>Apollonian gasket</b><br>every circle touches three others; every curvature is a whole number")

BASE = K.CSS + f"""
.L {{ background:#FFFFFF; }}
.L .logo {{ background:none; padding:0; left:15mm; top:13mm; width:44mm; }}
.L .tr {{ color:#5B5874; }}
.L .ttl {{ position:absolute; left:15mm; top:48mm; width:170mm; }}
.L .big {{ font-size:54pt; color:{INK}; margin-top:3mm; }}
.L .big .yr {{ display:inline-block; font-family:'Pop'; font-weight:700; font-size:16pt; line-height:1;
               letter-spacing:.24em; border-radius:1.6mm; padding:2.1mm 2.0mm 1.6mm 3.0mm; margin-left:5.5mm;
               vertical-align:0.55em; }}
.L .big .yr.long {{ letter-spacing:.16em; padding:2.1mm 2.2mm 1.6mm 2.9mm; }}
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
"""


def grad(pal):
    stops = ", ".join(f"{c} {100 * i / (len(pal) - 1):.0f}%" for i, c in enumerate(pal))
    return f"linear-gradient(90deg, {stops})"


def version_css(v):
    o = ACCENTS[v]
    return (f".V{v} .kick {{ color:{o['kick']}; }} .V{v} .big em {{ font-style:normal; color:{o['five']}; }}"
            f".V{v} .big .yr {{ background:{o['pill'][0]}; color:{o['pill'][1]}; }}"
            f".V{v} .bar, .V{v} .hair {{ background:{grad(A.PAL['jewel'])}; }}"
            f".V{v} .chip {{ color:{o['chip']}; border-color:{o['chip']}; }}"
            f".V{v} .tab {{ background:{o['tab'][0]}; }} .V{v} .tab .v {{ color:{o['tab'][1]}; }}")


def gasket_svg():
    """The cover gasket as one vector SVG (cached: it is the same on all eight covers)."""
    if not os.path.exists(CACHE):
        os.makedirs(os.path.dirname(CACHE), exist_ok=True)
        svg = ('<svg xmlns="http://www.w3.org/2000/svg" class="art" width="210mm" height="297mm" '
               'viewBox="0 0 210 297">' + "".join(A.apollonian_glass()) + "</svg>")
        with open(CACHE, "w") as fh:
            fh.write(svg)
    return open(CACHE).read()


def chip_text(version, term):
    return "Formulas provided" if version == "M" or term <= 2 else "Formulas from memory"


def cover_html(version, term):
    o = ACCENTS[version]
    long_ = " long" if len(o["pill_text"]) > 8 else ""
    ttl = (f'<div class="ttl"><div class="kick">{K.KICK}</div><div class="big">The Fractal<br><em>Five</em>'
           f'<span class="yr{long_}">{o["pill_text"]}</span></div><div class="bar"></div>'
           f'<div class="meta">{K.META}</div><div class="chip">{chip_text(version, term)}</div></div>')
    top = (f'{K.logo()}<div class="tr">Mathematics<br>Year 8 &middot; Formula warm-ups</div>'
           f'<div class="tab"><div class="v">TERM {term}</div></div>')
    body = (f'<div class="page L V{version}">{gasket_svg()}{top}{ttl}{K.name_box()}'
            f'<div class="cap">{CAPTION}</div><div class="hair"></div>{K.foot()}</div>')
    return BASE + version_css(version), body
