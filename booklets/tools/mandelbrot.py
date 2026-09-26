"""Draws the Mandelbrot set artwork for the blended booklet series, tinted to each booklet's colour.

  python3 tools/mandelbrot.py            (needs numpy and Pillow)

Writes assets/mandelbrot/<hex>-light.png (cover strip: pale field, dark set) and <hex>-dark.png (header band: charcoal field, glowing edge).
"""
import numpy as np
from PIL import Image
import os, sys

OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'mandelbrot')
COLOURS = ['#c0392b', '#e67e22', '#b7950b', '#229954', '#148f77', '#0b5345', '#7d3c98', '#d63384', '#8d5524', '#6b8e23', '#00838f', '#7b1f4b', '#6c5b7b']
CHARCOAL = np.array([0x3d, 0x3b, 0x3c]) / 255

def rgb(h):
    h = h.lstrip('#'); return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)]) / 255

def escape(w, h, cx, cy, span, it=160):
    x = np.linspace(cx - span / 2, cx + span / 2, w)
    y = np.linspace(cy - span * h / w / 2, cy + span * h / w / 2, h)
    c = x[None, :] + 1j * y[:, None]
    z = np.zeros_like(c); n = np.zeros(c.shape); alive = np.ones(c.shape, bool)
    for i in range(it):
        z[alive] = z[alive] ** 2 + c[alive]
        esc = alive & (np.abs(z) > 4)
        n[esc] = i + 1 - np.log2(np.log(np.abs(z[esc])) + 1e-9)
        alive &= ~esc
    n[alive] = -1
    return n

def render(n, colour, mode):
    inside = n < 0
    t = np.clip(np.where(inside, 0, n) / (40 if mode == 'light' else 90), 0, 1) ** (0.55 if mode == 'light' else 0.8)  # 0 = far away, 1 = close to the set
    acc = rgb(colour)
    if mode == 'light':
        field = np.array([1, 1, 1]) * 0.97
        tint = acc * 0.55 + 0.45  # pale accent
        img = field[None, None, :] * (1 - t[..., None]) + tint[None, None, :] * t[..., None]
        edge = np.clip((t - 0.75) / 0.25, 0, 1)[..., None]
        img = img * (1 - edge) + acc[None, None, :] * edge
        img[inside] = CHARCOAL
    else:
        img = CHARCOAL[None, None, :] * (1 - t[..., None]) + acc[None, None, :] * t[..., None]
        glow = np.clip((t - 0.8) / 0.2, 0, 1)[..., None]
        img = img * (1 - glow) + (acc * 0.4 + 0.6)[None, None, :] * glow
        img[inside] = CHARCOAL * 0.55
    return Image.fromarray((np.clip(img, 0, 1) * 255).astype('uint8'))

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    wide = escape(2400, 420, -1.25, 0.0, 2.7)          # the antenna and the left bulbs, the main body at the right edge (cover strip)
    band = escape(2400, 240, -1.768, 0.0, 0.2, 300)   # the small copy of the set on the antenna (header band)
    for c in COLOURS:
        render(wide, c, 'light').save(os.path.join(OUT, f'{c[1:]}-light.png'), optimize=True)
        render(band, c, 'dark').save(os.path.join(OUT, f'{c[1:]}-dark.png'), optimize=True)
        print('written', c)
