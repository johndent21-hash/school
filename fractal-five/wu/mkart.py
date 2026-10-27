"""Render the faint Mandelbrot art used on the warm-up pages (300 dpi)."""
import sys, os
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from faint import render, colourise, to_image

DPI = 300
MM = DPI / 25.4
ART = os.path.join(os.path.dirname(os.path.abspath(__file__)), "art")


def strip(name, w_mm, h_mm, cx, cy, half_w, fade, maxit=2000, **kw):
    W, H = int(round(w_mm * MM)), int(round(h_mm * MM))
    mu, de, ins = render(cx, cy, half_w, W, H, maxit=maxit)
    rgb, a = colourise(mu, de, ins, glow=kw.pop("glow", 7.0), **kw)
    yy = np.linspace(0, 1, H)[:, None] * np.ones((1, W))
    xx = np.ones((H, 1)) * np.linspace(0, 1, W)[None, :]
    m = fade(xx, yy)
    im = to_image(rgb, a, m)
    im.save(os.path.join(ART, f"{name}.png"))
    return im


def smooth(t):
    t = np.clip(t, 0, 1)
    return t * t * (3 - 2 * t)


if __name__ == "__main__":
    # footer: the needle of the set, the period-3 minibrot, the cascade near -1.4
    strip("foot", 210, 17, -1.70, 0.0, 0.34,
          lambda x, y: smooth(y / 0.55), strength=0.50)
    # header band (option A): same family, set low in the band so the title sits above it
    strip("band", 210, 38, -1.70, 0.030, 0.34,
          lambda x, y: smooth((1 - y) / 0.35) * (0.35 + 0.65 * smooth((x - 0.25) / 0.45)),
          strength=0.42)
    # thin top edge (option C2): a narrower view of the needle, mirrored fade
    strip("top", 210, 9, -1.62, 0.0, 0.42,
          lambda x, y: smooth((1 - y) / 0.7), strength=0.42)
    print("art done")
