"""Faint Mandelbrot artwork for the Year 9 formula warm-up sheets.

Pale, print-friendly renders: the page stays white, the boundary of the set is
drawn as soft periwinkle filaments (distance-estimate glow) and the set itself
is a light grey-blue. Output is RGBA so the art can fade into the page.
"""
import numpy as np
np.seterr(over="ignore", invalid="ignore")
from PIL import Image


def _hex(h):
    h = h.lstrip("#")
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], float)


def render(cx, cy, half_w, W, H, maxit=1500, rotate=0.0):
    """Return (mu, de_px, inside) arrays for the window centred on cx+cy*i,
    half_w = half the window WIDTH in the complex plane."""
    half_h = half_w * H / W
    xs = np.linspace(-half_w, half_w, W)
    ys = np.linspace(half_h, -half_h, H)
    X, Y = np.meshgrid(xs, ys)
    if rotate:
        t = np.radians(rotate)
        X, Y = X * np.cos(t) - Y * np.sin(t), X * np.sin(t) + Y * np.cos(t)
    c = (cx + X + 1j * (cy + Y)).ravel()
    N = c.size
    mu = np.full(N, -1.0)
    de = np.full(N, 0.0)
    z = np.zeros(N, complex)
    dz = np.zeros(N, complex)
    act = np.arange(N)
    cc = c.copy()
    R2 = 1e8
    for i in range(maxit):
        dz = 2.0 * z * dz + 1.0
        z = z * z + cc
        a2 = z.real * z.real + z.imag * z.imag
        m = a2 > R2
        if m.any():
            ids = act[m]
            zm, dm = z[m], dz[m]
            az = np.abs(zm)
            mu[ids] = i + 1 - np.log2(np.log2(az))
            de[ids] = 2.0 * az * np.log(az) / np.maximum(np.abs(dm), 1e-300)
            k = ~m
            act, z, dz, cc = act[k], z[k], dz[k], cc[k]
            if act.size == 0:
                break
    px = 2 * half_w / W
    de_px = de / px
    inside = mu < 0
    return mu.reshape(H, W), de_px.reshape(H, W), inside.reshape(H, W)


def colourise(mu, de_px, inside, fil="#8FA3D9", deep="#5E77B8", setc="#B9C4DC",
              glow=5.0, strength=0.55, band=0.10, cycles=3.0):
    """Ink amount from the distance estimate: 1 on the boundary, fading to 0
    about `glow` pixels*(log) away. Returns RGBA float image (0-255, alpha 0-1)."""
    H, W = mu.shape
    esc = ~inside
    ink = np.zeros((H, W))
    d = np.nan_to_num(de_px[esc], nan=0.0, posinf=1e9)
    d = np.maximum(d, 1e-6)
    t = np.clip(1.0 - np.log1p(d) / np.log1p(glow ** 2), 0, 1)
    ink[esc] = t ** 1.6
    # a gentle two-tone variation along the filaments from the smooth count
    v = np.zeros((H, W))
    lv = np.log(mu[esc] + 1.0)
    order = np.argsort(np.argsort(lv))
    tt = (order + 0.5) / max(lv.size, 1)
    v[esc] = 0.5 + 0.5 * np.cos(2 * np.pi * (tt * cycles))
    A, B = _hex(fil), _hex(deep)
    rgb = A[None, None, :] * (1 - v[..., None]) + B[None, None, :] * v[..., None]
    alpha = ink * strength
    # faint background haze from the escape count (very light)
    haze = np.zeros((H, W))
    haze[esc] = tt ** 6
    alpha = np.maximum(alpha, haze * band)
    # the set itself
    S = _hex(setc)
    rgb[inside] = S
    alpha[inside] = strength * 1.25
    return rgb, np.clip(alpha, 0, 1)


def to_image(rgb, alpha, fade=None):
    a = alpha if fade is None else alpha * fade
    out = np.dstack([rgb, a[..., None] * 255.0])
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), "RGBA")


def flatten(img, bg=(255, 255, 255)):
    base = Image.new("RGB", img.size, bg)
    base.paste(img, mask=img.split()[3])
    return base
