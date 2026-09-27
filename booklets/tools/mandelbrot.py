"""Draws the Mandelbrot set artwork for the blended booklet series.

  python3 tools/mandelbrot.py            (needs numpy and Pillow; about a minute)
  python3 tools/mandelbrot.py seahorse   (one region only)

The colours match the strip on the revision booklet covers: a soft periwinkle field, bright blue filaments close to
the set, and a charcoal set. Each booklet shows a different region of the set (REGIONS below; the chapter file names
its region with `art`). For each region it writes, in assets/mandelbrot/:
  <region>-cover.jpg  the cover picture (fades to white at the top)
  <region>-band.jpg   the strip on the right of each page's header band
  <region>-hw.jpg     a closer look at the same region, for the homework booklet's cover
"""
import numpy as np
from PIL import Image
import os, sys

OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'mandelbrot')

# c: centre, span: width of the view, it: iterations. hw: (x, y, width) of the homework picture (default: 4 times closer);
# band: (x, y, width) of the header strip (default: the cover view, a little closer). The header shows the strip's right half.
REGIONS = {
    'antenna':        dict(c=(-1.45, 0.0), span=1.1, it=400, hw=(-1.7685, 0.0, 0.075), band=(-1.64, 0.0, 0.42)),            # Ch 1: the set along the real axis
    'seahorse':       dict(c=(-0.7453, 0.1127), span=0.012, it=800),                               # Ch 2: seahorse valley
    'tentacles':      dict(c=(-1.7690, 0.0056), span=0.006, it=1200, hw=(-1.7677, 0.0058, 0.002)),                                 # Ch 3: the edge of a small copy of the set on the antenna
    'triple-spiral':  dict(c=(-0.0886, 0.6542), span=0.0045, it=900),                              # Ch 4
    'elephant':       dict(c=(0.2925, 0.0155), span=0.012, it=800),                                # Ch 5A: elephant valley
    'valley':         dict(c=(-0.748, 0.1), span=0.05, it=700),                                    # Ch 5B: the valley between the bulbs
    'period-3':       dict(c=(-0.1225, 0.745), span=0.6, it=500, hw=(-0.1225, 0.745, 0.35), band=(-0.37, 0.745, 1.0)),                                 # Ch 6: the top bulb
    'double-spiral':  dict(c=(-0.7437, 0.1318), span=0.004, it=900),                               # Ch 7
    'dendrite':       dict(c=(-0.16, 1.0405), span=0.035, it=800),                                 # Ch 8
    'whole-set':      dict(c=(-0.6, 0.0), span=3.0, it=300, hw=(-0.16, 1.0405, 0.25), band=(-1.65, 0.0, 3.4)),             # Ch 9: the whole set on the number plane
    'snowflake':      dict(c=(-0.5582, 0.6353), span=0.035, it=700),                               # Ch 10
    'feather':        dict(c=(0.3245, 0.04855), span=0.004, it=1200),                              # Ch 11
    'jellyfish':      dict(c=(-1.25066, 0.02012), span=0.0012, it=1200),                           # Ch 12
}

STOPS = [(0.0, (190, 197, 222)), (0.45, (168, 181, 222)), (0.7, (140, 162, 232)), (0.86, (96, 128, 236)), (0.95, (60, 80, 170)), (1.0, (40, 44, 70))]
INSIDE = (50, 49, 45)


def escape(w, h, cx, cy, span, it):
    """Smooth escape count for each pixel; -1 inside the set."""
    x = np.linspace(cx - span / 2, cx + span / 2, w)
    y = np.linspace(cy + span * h / w / 2, cy - span * h / w / 2, h)
    c = (x[None, :] + 1j * y[:, None]).ravel()
    n = np.full(c.size, -1.0)
    # Skip the main cardioid and the period-2 bulb: they are inside, and would cost every iteration.
    q = (c.real - 0.25) ** 2 + c.imag ** 2
    known = (q * (q + (c.real - 0.25)) <= 0.25 * c.imag ** 2) | ((c.real + 1) ** 2 + c.imag ** 2 <= 1 / 16)
    idx = np.nonzero(~known)[0]; cf = c[idx]; zf = np.zeros_like(cf)
    for i in range(it):
        zf = zf * zf + cf
        esc = np.abs(zf) > 16
        if esc.any():
            n[idx[esc]] = i + 1 - np.log2(np.log(np.abs(zf[esc])))
            keep = ~esc; zf, cf, idx = zf[keep], cf[keep], idx[keep]
        if idx.size == 0:
            break
    return n.reshape(h, w)


def colour(n, it):
    inside = n < 0
    t = np.clip(np.log1p(np.where(inside, 0, n)) / np.log1p(it * 0.6), 0, 1)
    img = np.zeros(n.shape + (3,))
    for (a, ca), (b, cb) in zip(STOPS, STOPS[1:]):
        m = (t >= a) & (t <= b); f = ((t - a) / (b - a))[m][:, None]
        img[m] = np.array(ca) * (1 - f) + np.array(cb) * f
    img[inside] = INSIDE
    return img


def save(img, path, fade=0.0):
    if fade:  # fade into the white page at the top, as on the revision booklet covers
        h = img.shape[0]
        a = (np.clip(np.arange(h) / (h * fade), 0, 1) ** 1.5)[:, None, None]
        img = img * a + 255 * (1 - a)
    Image.fromarray(np.clip(img, 0, 255).astype('uint8')).save(path, quality=86, optimize=True)


def draw(name, r):
    (cx, cy), span, it = r['c'], r['span'], r['it']
    save(colour(escape(2400, 1100, cx, cy, span, it), it), os.path.join(OUT, f'{name}-cover.jpg'), fade=0.14)
    bx, by, bs = r.get('band', (cx, cy, span * 0.6))
    save(colour(escape(2400, 260, bx, by, bs, it), it), os.path.join(OUT, f'{name}-band.jpg'))
    hx, hy, hs = r.get('hw', (cx, cy, span / 4))
    save(colour(escape(2400, 1100, hx, hy, hs, it + 300), it + 300), os.path.join(OUT, f'{name}-hw.jpg'), fade=0.14)
    print('written', name, flush=True)


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for name in sys.argv[1:] or REGIONS:
        draw(name, REGIONS[name])
