"""Raster art for the Year 10 inside pages, all JPEG (quality 70, longest side 1200 px):

  art/strip_top.jpg   faint pastel Sierpinski-triangle strip under the header (triangles ~8 mm tall)
  art/strip_foot.jpg  the same at the foot of the page (~12 mm tall), fading towards the table
  art/logo.jpg        Kingscliff logo flattened onto white

A strip is a row of depth-3 Sierpinski triangles, alternately point-up and point-down so they make a
continuous band, coloured left to right round the pastel wheel at about 45% opacity on white and
faded out at both ends.

    python3 wu/mkart.py [preview]      (preview: 400 px wide copies in /tmp for checking)
"""
import math
import os
import sys

import numpy as np
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ART = os.path.join(HERE, "art")
sys.path.insert(0, os.path.join(os.path.dirname(HERE), "opts"))
from art_opts import wheel, PASTEL  # noqa: E402

LONGEST, Q = 1200, 70
SS = 4                      # supersampling for clean edges


def smooth(t):
    t = np.clip(t, 0, 1)
    return t * t * (3 - 2 * t)


def sier(a, b, c, depth, out):
    if depth == 0:
        out.append((a, b, c))
        return
    ab, bc, ca = [((p[0] + q[0]) / 2, (p[1] + q[1]) / 2) for p, q in ((a, b), (b, c), (c, a))]
    sier(a, ab, ca, depth - 1, out)
    sier(ab, b, bc, depth - 1, out)
    sier(ca, bc, c, depth - 1, out)


def strip(path, w_mm, h_mm, tri_h, y_mid, opacity=0.45, end_fade=0.17, top_fade=None, shrink=0.87,
          width_px=LONGEST):
    """Row of alternating Sierpinski triangles tri_h mm tall, centred on y_mid (mm from the top)."""
    W, H = width_px * SS, int(round(width_px * h_mm / w_mm)) * SS
    k = W / w_mm
    side = tri_h * 2 / math.sqrt(3)
    step = side / 2
    y0, y1 = y_mid - tri_h / 2, y_mid + tri_h / 2
    # one triangle centred on the page's centre line, then step out both ways
    n = int(w_mm / step) + 4
    pieces = []
    for i in range(-n, n + 1):
        xl = w_mm / 2 - side / 2 + i * step
        if xl + side < 0 or xl > w_mm:
            continue
        if i % 2 == 0:
            tri = ((xl, y1), (xl + side, y1), (xl + side / 2, y0))
        else:
            tri = ((xl, y0), (xl + side, y0), (xl + side / 2, y1))
        out = []
        sier(*tri, 3, out)
        pieces += out
    ink = Image.new("RGB", (W, H), (0, 0, 0))     # colour layer
    cov = Image.new("L", (W, H), 0)               # coverage layer
    di, dc = ImageDraw.Draw(ink), ImageDraw.Draw(cov)
    for a, b, c in pieces:
        g = ((a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3)
        pts = [((g[0] + shrink * (p[0] - g[0])) * k, (g[1] + shrink * (p[1] - g[1])) * k) for p in (a, b, c)]
        col = tuple(int(round(v * 255)) for v in wheel(g[0] / w_mm, PASTEL))
        di.polygon(pts, fill=col)
        dc.polygon(pts, fill=255)
    ink = ink.resize((W // SS, H // SS), Image.LANCZOS)
    cov = cov.resize((W // SS, H // SS), Image.LANCZOS)
    rgb = np.asarray(ink, float) / 255.0
    a = np.asarray(cov, float) / 255.0
    rgb = rgb / np.maximum(a[..., None], 1e-6)                    # un-premultiply the edges
    h, w = a.shape
    xx = (np.arange(w) + 0.5) / w
    yy = (np.arange(h) + 0.5) / h * h_mm
    fade = (smooth(xx / end_fade) * smooth((1 - xx) / end_fade))[None, :] * np.ones((h, 1))
    if top_fade:                                                  # fainter towards the table above
        lo, hi, f0 = top_fade
        fade = fade * (f0 + (1 - f0) * smooth((yy - lo) / (hi - lo)))[:, None]
    alpha = (a * opacity * fade)[..., None]
    out = 1.0 * (1 - alpha) + np.clip(rgb, 0, 1) * alpha
    Image.fromarray(np.clip(out * 255 + 0.5, 0, 255).astype(np.uint8)).save(path, quality=Q, optimize=True)
    return path


def logo(path):
    im = Image.open(os.path.join(ART, "logo_rgba.png")).convert("RGBA")
    s = min(1.0, LONGEST / max(im.size))
    if s < 1:
        im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    base = Image.new("RGB", im.size, (255, 255, 255))
    base.paste(im, mask=im.split()[3])
    base.save(path, quality=Q, optimize=True)
    return path


# page geometry (wu.css): .divart top 26.9 mm, 11.6 mm tall; .foot at the bottom, 17 mm tall
TOP = dict(w_mm=210, h_mm=11.6, tri_h=8.0, y_mid=5.8)
FOOT = dict(w_mm=210, h_mm=17.0, tri_h=12.0, y_mid=9.6, top_fade=(2.0, 12.0, 0.25))

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "preview":
        strip("/tmp/strip_top_prev.jpg", width_px=400, **TOP)
        strip("/tmp/strip_foot_prev.jpg", width_px=400, **FOOT)
        print("previews in /tmp")
    else:
        strip(os.path.join(ART, "strip_top.jpg"), **TOP)
        strip(os.path.join(ART, "strip_foot.jpg"), **FOOT)
        logo(os.path.join(ART, "logo.jpg"))
        for n in ("strip_top.jpg", "strip_foot.jpg", "logo.jpg"):
            p = os.path.join(ART, n)
            print(n, Image.open(p).size, os.path.getsize(p) // 1024, "KB")
