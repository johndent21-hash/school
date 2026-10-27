# -*- coding: utf-8 -*-
"""Title-page artwork for the Year 9 Formula Warm-Ups.

Deliberately unlike the other covers in the series (which are dense, fully
coloured close-ups): this is the WHOLE Mandelbrot set drawn as glowing blue line
art on the house charcoal, like a blueprint - a bright boundary line from the
distance estimate, a soft glow, faint equipotential contour rings around the set
and a fine drafting grid. The pages inside use the same set's needle as faint
strips, so cover and pages read as one product.
"""
import numpy as np
from PIL import Image

np.seterr(over="ignore", invalid="ignore", divide="ignore")


def _hex(h):
    h = h.lstrip("#")
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], float) / 255.0


BG_TOP, BG_BOT = _hex("#34312C"), _hex("#211F1C")
CORE, GLOW, HAZE = _hex("#BFDDF8"), _hex("#3F8BD6"), _hex("#3B7FC0")
INSIDE = _hex("#1B2129")
GRID = _hex("#8FB3D9")


def escape(c, maxit):
    """Smooth count mu (-1 inside), distance estimate (plane units)."""
    n = c.size
    mu = np.full(n, -1.0)
    de = np.zeros(n)
    x, y = c.real, c.imag
    q = (x - 0.25) ** 2 + y * y
    inside0 = (q * (q + (x - 0.25)) <= 0.25 * y * y) | ((x + 1) ** 2 + y * y <= 0.0625)
    act = np.where(~inside0)[0]
    cc = c[act]
    z = np.zeros(act.size, complex)
    dz = np.zeros(act.size, complex)
    for i in range(maxit):
        dz = 2.0 * z * dz + 1.0
        z = z * z + cc
        a2 = z.real * z.real + z.imag * z.imag
        m = a2 > 1e10
        if m.any():
            ids = act[m]
            az = np.sqrt(a2[m])
            mu[ids] = i + 1 - np.log2(np.log2(az))
            de[ids] = az * np.log(az) / np.maximum(np.abs(dz[m]), 1e-300)
            k = ~m
            act, z, dz, cc = act[k], z[k], dz[k], cc[k]
            if act.size == 0:
                break
    return mu, de


def render(W, H, mm_w=210.0, cx_mm=105.0, cy_mm=193.0, mm_per_unit=78.0, centre=(-0.765, 0.0),
           maxit=3000, rows=None, grid=True):
    px_mm = mm_w / W
    unit_px = mm_per_unit / px_mm                  # pixels per complex unit
    X = (np.arange(W) + 0.5) * px_mm
    out = np.zeros((H, W, 3))
    MU = np.full((H, W), -1.0)
    DE = np.zeros((H, W))
    y0, y1 = rows or (0, H)
    step = 160
    for r0 in range(y0, y1, step):
        r1 = min(y1, r0 + step)
        Y = (np.arange(r0, r1) + 0.5) * px_mm
        XX, YY = np.meshgrid(X, Y)
        re = centre[0] + (XX - cx_mm) / mm_per_unit
        im = centre[1] - (YY - cy_mm) / mm_per_unit
        mu, de = escape((re + 1j * im).ravel(), maxit)
        MU[r0:r1] = mu.reshape(r1 - r0, W)
        DE[r0:r1] = de.reshape(r1 - r0, W)
    # background: vertical charcoal gradient
    t = np.linspace(0, 1, H)[:, None, None]
    out[:] = BG_TOP * (1 - t) + BG_BOT * t
    esc = MU >= 0
    d = np.where(esc, np.nan_to_num(DE * unit_px, nan=0.0, posinf=1e9), 0.0)
    s = W / 2480.0                                  # keep line widths constant in mm
    core = np.where(esc, np.exp(-d / (1.3 * s)), 0.0)
    glow = np.where(esc, np.exp(-d / (9.0 * s)), 0.0)
    haze = np.where(esc, np.exp(-d / (70.0 * s)), 0.0)
    # faint equipotential rings: integer levels of the smooth count, anti-aliased by its gradient
    gy, gx = np.gradient(np.where(esc, MU, np.nan))
    gmag = np.nan_to_num(np.hypot(gx, gy), nan=1e9)
    fr = np.abs(MU - np.round(MU))
    ring = np.where(esc & (MU > 3) & (MU < 60), np.clip(1 - fr / np.maximum(gmag * 0.9, 1e-6), 0, 1), 0.0)
    ring *= np.clip((MU - 3) / 4, 0, 1)            # fade the outermost rings in
    out = out + haze[..., None] * HAZE * 0.16 + ring[..., None] * GLOW * 0.12
    out = out + glow[..., None] * GLOW * 0.62 + core[..., None] * CORE * 0.9
    # interior: dark blue-charcoal with a soft glow just inside the boundary
    from scipy.ndimage import distance_transform_edt
    din = distance_transform_edt(~esc)
    inner = np.exp(-din / (14.0 * s))[..., None]
    fill = INSIDE * (1 - inner * 0.9) + GLOW * inner * 0.28 + INSIDE * inner * 0.62
    out[~esc] = fill[~esc]
    # the boundary line also traces the edge of the interior
    edge = np.zeros((H, W), bool)
    ins = ~esc
    edge[1:-1, 1:-1] = ins[1:-1, 1:-1] & ~(ins[:-2, 1:-1] & ins[2:, 1:-1] & ins[1:-1, :-2] & ins[1:-1, 2:])
    out[edge] = out[edge] * 0.35 + CORE * 0.65
    if grid:
        mm = 1 / px_mm
        yy, xx = np.mgrid[0:H, 0:W]
        def lines(period_mm, width_px):
            gxl = np.abs(((xx + 0.5) / mm) % period_mm - period_mm / 2) - (period_mm / 2 - width_px / mm / 2)
            gyl = np.abs(((yy + 0.5) / mm) % period_mm - period_mm / 2) - (period_mm / 2 - width_px / mm / 2)
            return np.clip(np.maximum(gxl, gyl) * mm + 0.5, 0, 1)
        minor = lines(5.0, 1.0 * max(1, s * 3))
        major = lines(25.0, 1.4 * max(1, s * 3))
        g = np.maximum(minor * 0.035, major * 0.075)
        out = out * (1 - g[..., None]) + GRID * g[..., None]
    return Image.fromarray(np.clip(out * 255, 0, 255).astype(np.uint8))


if __name__ == "__main__":
    import sys
    dpi = int(sys.argv[1]) if len(sys.argv) > 1 else 300
    W, H = int(round(210 / 25.4 * dpi)), int(round(297 / 25.4 * dpi))
    im = render(W, H)
    im.save(sys.argv[2] if len(sys.argv) > 2 else "art/cover.jpg", quality=94, subsampling=0)
    print("cover art", W, H)
