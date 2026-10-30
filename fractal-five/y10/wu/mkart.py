"""Year 10 raster art, every image a quality-70 JPEG with its longest side at most 1200 px:
  wu/art/logo.jpg        Kingscliff logo on white (from logo_rgba.png)
  wu/art/strip_top.jpg   faint pastel Sierpinski band under the header (triangles 8 mm tall)
  wu/art/strip_foot.jpg  faint pastel band at the foot of the page (12 mm, fading towards the table)
  opts/art/tri_bg.jpg    title-page background: midnight + the triangle's blurred glow
Cached: existing files are kept unless REDO=1 is set.   python3 wu/mkart.py [--preview DIR]
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
OPTS = os.path.join(os.path.dirname(HERE), "opts")
sys.path.insert(0, OPTS)
import art_opts as A  # noqa: E402

ART = os.path.join(HERE, "art")
TOP = dict(w_mm=210.0, h_mm=11.6, tri_h=8.0)                      # sits at top 26.9 mm (wu.css .divart)
FOOT = dict(w_mm=210.0, h_mm=17.0, tri_h=12.0, y_mid=9.6, fade_top=(2.0, 0.25))   # bottom 17 mm
COVER = dict(cx=105.0, base_y=250.0, side=160.0)


def make(force=False):
    jobs = [(os.path.join(ART, "logo.jpg"), lambda p: A.logo_jpg(os.path.join(ART, "logo_rgba.png"), p)),
            (os.path.join(ART, "strip_top.jpg"), lambda p: A.triangle_strip(p, **TOP)),
            (os.path.join(ART, "strip_foot.jpg"), lambda p: A.triangle_strip(p, **FOOT)),
            (os.path.join(OPTS, "art", "tri_bg.jpg"), lambda p: A.triangle_cover_bg(p, dpi=1200 / (297 / 25.4), **COVER))]
    os.makedirs(os.path.join(OPTS, "art"), exist_ok=True)
    for path, fn in jobs:
        if force or not os.path.exists(path):
            fn(path)
    return [p for p, _ in jobs]


if __name__ == "__main__":
    for p in make(force=bool(os.environ.get("REDO"))):
        from PIL import Image
        im = Image.open(p)
        print(f"{os.path.relpath(p, os.path.dirname(HERE))}: {im.format} {im.size[0]}x{im.size[1]}, "
              f"{os.path.getsize(p) / 1024:.1f} KB")
