"""Raster art for the Year 8 inside pages, all JPEG (quality 70, 1200 px wide):

  art/strip_top.jpg   faint stained-glass Apollonian strip under the header (gaskets ~8 mm tall)
  art/strip_foot.jpg  the same at the foot of the page (~12 mm tall), fading towards the table
  art/logo.jpg        Kingscliff logo flattened onto white

A strip is a row of small integer Apollonian gaskets (-1, 2, 2, 3) touching side by side, coloured left
to right round the jewel palette at about 35% opacity on white, with white leading between the panes,
faded out at both ends. So the strips never compete with the questions or spoil a photocopy, no pixel
may be darker than GREY_MIN in greyscale (ITU-R 601 luma): the darkest panes (amethyst, ruby) are eased
just enough to meet it.

    python3 wu/mkart.py [preview]      (preview: 400 px wide copies in the scratch folder given by $TMPDIR)
"""
import math
import os
import sys

import numpy as np
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ART = os.path.join(HERE, "art")
sys.path.insert(0, os.path.join(os.path.dirname(HERE), "opts"))
from art8 import PAL, apollonian, wheel  # noqa: E402

LONGEST, Q = 1200, 70
SS = 4                      # supersampling for clean edges
OPACITY = 0.35
GREY_MIN = 216              # darkest allowed pixel in greyscale before JPEG (after JPEG: about 200)
JEWEL = PAL["jewel"]


def smooth(t):
    t = np.clip(t, 0, 1)
    return t * t * (3 - 2 * t)


def strip(path, w_mm, h_mm, dia, y_mid, opacity=OPACITY, end_fade=0.17, top_fade=None, width_px=LONGEST):
    """Row of touching Apollonian gaskets dia mm across, centred on y_mid (mm from the top of the image)."""
    W, H = width_px * SS, int(round(width_px * h_mm / w_mm)) * SS
    k = W / w_mm                                  # px per mm
    R = dia / 2
    circles = apollonian(min_r=0.12 / R)          # panes down to about 0.12 mm radius
    img = Image.new("RGB", (W, H), (255, 255, 255))
    d = ImageDraw.Draw(img)
    n = int(w_mm / dia) + 3
    for i in range(-n, n + 1):
        cx = w_mm / 2 + i * dia
        if cx + R < 0 or cx - R > w_mm:
            continue
        ring = tuple(int(round(c * 255)) for c in wheel(min(max(cx / w_mm, 0), 0.999), JEWEL))
        lw = max(1, int(round(0.22 * k)))
        d.ellipse(((cx - R) * k, (y_mid - R) * k, (cx + R) * k, (y_mid + R) * k), outline=ring, width=lw)
        for kk, z in sorted(circles[1:], key=lambda c: c[0]):
            rr = R / kk
            x, y = cx + R * z.real, y_mid - R * z.imag
            size = min(1.0, rr / (R * 0.5))
            c = wheel(min(max(x / w_mm, 0), 0.999), JEWEL)
            c = c * (0.62 + 0.38 * size) + (1 - (0.62 + 0.38 * size))        # small panes a little paler
            lead = max(0.07, min(0.3, rr * 0.07))                             # white leading (mm)
            r_in = rr - lead / 2
            if r_in * k < 0.6:
                continue
            col = tuple(int(round(v * 255)) for v in c)
            d.ellipse(((x - r_in) * k, (y - r_in) * k, (x + r_in) * k, (y + r_in) * k), fill=col)
    img = img.resize((W // SS, H // SS), Image.LANCZOS)
    rgb = np.asarray(img, float) / 255.0
    h, w = rgb.shape[:2]
    xx = (np.arange(w) + 0.5) / w
    yy = (np.arange(h) + 0.5) / h * h_mm
    fade = (smooth(xx / end_fade) * smooth((1 - xx) / end_fade))[None, :] * np.ones((h, 1))
    if top_fade:                                  # fainter towards the table above
        lo, hi, f0 = top_fade
        fade = fade * (f0 + (1 - f0) * smooth((yy - lo) / (hi - lo)))[:, None]
    alpha = (opacity * fade)[..., None]
    out = 1.0 - alpha * (1.0 - rgb)
    # cap the darkness: blend any pixel darker than GREY_MIN towards white until it reaches GREY_MIN
    L = (out @ np.array([0.299, 0.587, 0.114])) * 255
    kfix = np.where(L < GREY_MIN, (255 - GREY_MIN) / np.maximum(255 - L, 1e-6), 1.0)[..., None]
    out = 1.0 - kfix * (1.0 - out)
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
TOP = dict(w_mm=210, h_mm=11.6, dia=8.0, y_mid=5.8)
FOOT = dict(w_mm=210, h_mm=17.0, dia=12.0, y_mid=9.6, top_fade=(2.0, 12.0, 0.25))

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "preview":
        tmp = os.environ.get("TMPDIR", "/tmp")
        strip(os.path.join(tmp, "strip_top_prev.jpg"), width_px=400, **TOP)
        strip(os.path.join(tmp, "strip_foot_prev.jpg"), width_px=400, **FOOT)
        print("previews in", tmp)
    else:
        strip(os.path.join(ART, "strip_top.jpg"), **TOP)
        strip(os.path.join(ART, "strip_foot.jpg"), **FOOT)
        logo(os.path.join(ART, "logo.jpg"))
        for nm in ("strip_top.jpg", "strip_foot.jpg", "logo.jpg"):
            p = os.path.join(ART, nm)
            g = np.asarray(Image.open(p).convert("L"))
            print(nm, Image.open(p).size, os.path.getsize(p) // 1024, "KB, darkest grey", g.min())
