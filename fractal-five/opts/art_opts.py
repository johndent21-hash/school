# -*- coding: utf-8 -*-
"""Three alternative title pages for 'The Fractal Five' (Year 9 formula warm-ups).

A  Maurer rose r = sin 5θ, chords every 97°  - approved blue/charcoal scheme, polar grid
B  Penrose rhombus tiling (five-fold)         - fresh light scheme: cream, ink, coral, sunshine, mint, sky
C  Newton's method for z^5 = 1                - vivid dark scheme: five basins, five colours

Family elements kept on all three: Kingscliff logo in a white box, small-caps kicker,
Poppins title, accent bar, Name/Class box, term marker, and the Kingscliff /
Mathematics Faculty footer band.
"""
import cmath
import math
import os
import sys

import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
WU = os.path.join(os.path.dirname(HERE), "wu")
sys.path.insert(0, WU)
ART = os.path.join(HERE, "art")
os.makedirs(ART, exist_ok=True)
np.seterr(over="ignore", invalid="ignore", divide="ignore")


def f(x):
    return f"{x:.2f}".rstrip("0").rstrip(".")


# =============================================================== A: rose ====
def rose_svg(cx=105.0, cy=186.0, R=80.0, n=5, d=97):
    """Full-page SVG (mm units): charcoal gradient, polar grid, glowing Maurer rose."""
    el = []
    # (the charcoal gradient is painted by CSS behind this SVG)
    # polar grid: rings every 10 mm, spokes every 18 degrees (four per petal sector)
    for r in range(10, 171, 10):
        op = 0.085 if r % 50 == 0 else 0.045
        el.append(f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{r}" fill="none" stroke="#9CC3EA" '
                  f'stroke-opacity="{op}" stroke-width="0.2"/>')
    for k in range(20):
        t = math.radians(90 + 18 * k)
        x0, y0 = cx + 6 * math.cos(t), cy - 6 * math.sin(t)
        x1, y1 = cx + 170 * math.cos(t), cy - 170 * math.sin(t)
        op = 0.075 if k % 4 == 0 else 0.04
        el.append(f'<line x1="{f(x0)}" y1="{f(y0)}" x2="{f(x1)}" y2="{f(y1)}" stroke="#9CC3EA" '
                  f'stroke-opacity="{op}" stroke-width="0.2"/>')
    for i in range(28):                      # soft halo: stacked translucent discs
        rr = R * 1.3 * (1 - i / 28)
        el.append(f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{f(rr)}" fill="#3B7FC0" fill-opacity="0.011"/>')

    def P(theta_deg):
        t = math.radians(theta_deg)
        r = math.sin(n * t)
        return cx + R * r * math.cos(t), cy - R * r * math.sin(t)
    pts = [P(k * d) for k in range(361)]
    # chords: three strokes each, so crossings build up light where the lace is dense
    for w, op, col in ((1.9, 0.030, "#3B7FC0"), (0.8, 0.075, "#5A9DE0"), (0.22, 0.78, "#A9D1F7")):
        for (x0, y0), (x1, y1) in zip(pts[:-1], pts[1:]):
            el.append(f'<line x1="{f(x0)}" y1="{f(y0)}" x2="{f(x1)}" y2="{f(y1)}" stroke="{col}" '
                      f'stroke-opacity="{op}" stroke-width="{w}" stroke-linecap="round"/>')
    # the rose curve itself
    curve = [P(a / 8) for a in range(0, 1441)]
    dpath = "M" + " L".join(f"{f(x)},{f(y)}" for x, y in curve) + " Z"
    for w, op in ((2.6, 0.06), (1.1, 0.16), (0.5, 0.95)):
        el.append(f'<path d="{dpath}" fill="none" stroke="#DCEBFA" stroke-opacity="{op}" '
                  f'stroke-width="{w}" stroke-linejoin="round"/>')
    el.append(f'<circle cx="{f(cx)}" cy="{f(cy)}" r="1.1" fill="#EAF4FE"/>')
    return ('<svg xmlns="http://www.w3.org/2000/svg" class="artsvg" width="210mm" height="297mm" '
            'viewBox="0 0 210 297">' + "".join(el) + '</svg>')


# ============================================================ B: Penrose ====
PHI = (1 + 5 ** 0.5) / 2


def penrose_triangles(gens=7):
    """Robinson-triangle subdivision (P3 rhombs). type 0 = half of a thin rhomb, 1 = half of a thick one."""
    tris = []
    for i in range(10):
        B = cmath.rect(1, (2 * i - 1) * math.pi / 10)
        C = cmath.rect(1, (2 * i + 1) * math.pi / 10)
        if i % 2 == 0:
            B, C = C, B
        tris.append((0, 0j, B, C))
    for _ in range(gens):
        out = []
        for c, A, B, C in tris:
            if c == 0:
                Pp = A + (B - A) / PHI
                out += [(0, C, Pp, B), (1, Pp, C, A)]
            else:
                Q = B + (A - B) / PHI
                Rr = B + (C - B) / PHI
                out += [(1, Rr, C, A), (1, Q, Rr, B), (0, Rr, Q, A)]
        tris = out
    return tris


def penrose_svg(cx, cy, Rmm, scale_mm, gens=7, palette=None):
    """Circular Penrose medallion (mm units). Rhombs are coloured by type and by the
    direction of their shared diagonal (five directions), so the five-fold structure shows."""
    thick = palette["thick"]
    thin = palette["thin"]
    grout = palette["grout"]
    tris = penrose_triangles(gens)
    el = [f'<defs><clipPath id="medB"><circle cx="{f(cx)}" cy="{f(cy)}" r="{f(Rmm)}"/></clipPath></defs>',
          f'<g clip-path="url(#medB)">']
    for c, A, B, C in tris:
        pts = [(cx + scale_mm * z.real, cy - scale_mm * z.imag) for z in (A, B, C)]
        mx = sum(p[0] for p in pts) / 3 - cx
        my = sum(p[1] for p in pts) / 3 - cy
        if math.hypot(mx, my) > Rmm + 6:
            continue
        ang = math.degrees(math.atan2((C - B).imag, (C - B).real)) % 180.0
        k = int(round(ang / 36.0)) % 5
        col = (thick if c == 1 else thin)[k]
        pp = " ".join(f"{f(x)},{f(y)}" for x, y in pts)
        # the triangle is half a rhomb: stroke only its two outer edges (A-B, A-C) as grout
        el.append(f'<polygon points="{pp}" fill="{col}" stroke="{col}" stroke-width="0.12"/>')
    for c, A, B, C in tris:
        pts = [(cx + scale_mm * z.real, cy - scale_mm * z.imag) for z in (A, B, C)]
        mx = sum(p[0] for p in pts) / 3 - cx
        my = sum(p[1] for p in pts) / 3 - cy
        if math.hypot(mx, my) > Rmm + 6:
            continue
        (ax, ay), (bx, by), (qx, qy) = pts
        el.append(f'<polyline points="{f(qx)},{f(qy)} {f(ax)},{f(ay)} {f(bx)},{f(by)}" fill="none" '
                  f'stroke="{grout}" stroke-width="0.42" stroke-linejoin="round" stroke-linecap="round"/>')
    el.append('</g>')
    el.append(f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{f(Rmm)}" fill="none" stroke="{palette["ring"]}" '
              f'stroke-width="1.6"/>')
    el.append(f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{f(Rmm + 3.2)}" fill="none" stroke="{palette["ring"]}" '
              f'stroke-width="0.35" stroke-opacity="0.6"/>')
    return el


# ============================================================= C: Newton ====
def newton_art(W, H, cx_mm=105.0, cy_mm=198.0, mm_per_unit=62.0, maxit=60, cols=None, bg="#120F24",
               rot_deg=90.0, fade=(95.0, 165.0)):
    """Newton's method for z^5 = 1 over the whole page. Each point is coloured by the root
    it converges to and shaded by how many steps it took (smoothly)."""
    px_mm = 210.0 / W
    X = (np.arange(W) + 0.5) * px_mm
    roots = np.exp(2j * np.pi * np.arange(5) / 5)
    C = np.array([[int(h[i:i + 2], 16) for i in (1, 3, 5)] for h in cols], float) / 255.0
    out = np.zeros((H, W, 3))
    step = 256
    for r0 in range(0, H, step):
        r1 = min(H, r0 + step)
        Y = (np.arange(r0, r1) + 0.5) * px_mm
        XX, YY = np.meshgrid(X, Y)
        z = ((XX - cx_mm) / mm_per_unit) - 1j * ((YY - cy_mm) / mm_per_unit)
        z = z * np.exp(-1j * np.radians(rot_deg))      # turn the pattern: one arm points straight down
        n_it = np.full(z.shape, float(maxit))
        which = np.full(z.shape, -1)
        done = np.zeros(z.shape, bool)
        for i in range(maxit):
            z4 = z ** 4
            znew = z - (z4 * z - 1) / (5 * np.where(np.abs(z4) < 1e-300, 1e-300, z4))
            z = np.where(done, z, znew)
            d = np.abs(z[..., None] - roots[None, None, :])
            k = d.argmin(axis=-1)
            dm = d.min(axis=-1)
            newly = (~done) & (dm < 1e-3)
            # smooth count: fractional part from how far inside the tolerance we landed
            frac = np.clip(np.log(np.maximum(dm, 1e-12) / 1e-3) / np.log(1e-3), 0, 1)
            n_it = np.where(newly, i + 1 - frac, n_it)
            which = np.where(newly, k, which)
            done |= newly
            if done.all():
                break
        t = np.clip(n_it / 16.0, 0, 1)                      # 0 = instant, 1 = slow
        base = np.where(which[..., None] >= 0, C[np.maximum(which, 0)], 0.0)
        light = (1 - t) ** 0.55                             # bright where it converges fast
        edge = np.exp(-((t - 0.55) / 0.22) ** 2)            # a luminous seam near the boundaries
        ripple = 0.9 + 0.1 * np.cos(2 * np.pi * n_it)       # soft level bands around each root
        rgb = base * (0.18 + 0.82 * light[..., None]) * ripple[..., None] + edge[..., None] * 0.18
        rgb = np.where(which[..., None] >= 0, rgb, 0.0)
        # darken towards the top of the page so the title sits on midnight
        ymm = Y[:, None]
        k = np.clip((ymm - fade[0]) / (fade[1] - fade[0]), 0, 1)
        k = k * k * (3 - 2 * k)
        bgc = np.array([int(bg[i:i + 2], 16) for i in (1, 3, 5)], float) / 255.0
        rgb = rgb * k[..., None] + bgc * (1 - k[..., None]) * 1.0
        out[r0:r1] = rgb
    return Image.fromarray(np.clip(out * 255, 0, 255).astype(np.uint8))


# ====================================================== vivid palette set ====
VIVID = ["#FF3E8A", "#FF8B2C", "#FFD23F", "#22E4AC", "#3D8BFF"]
MID = "#120F24"


def _rgb(h):
    return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], float) / 255.0


def _hexc(c):
    c = np.clip(c, 0, 1)
    return "#%02X%02X%02X" % tuple(int(round(v * 255)) for v in c)


def wheel(t, cols=VIVID):
    """Smooth colour wheel through the five colours, t in [0, 1)."""
    C = np.array([_rgb(h) for h in cols])
    k = (np.asarray(t) % 1.0) * 5.0
    i0 = np.floor(k).astype(int) % 5
    fr = k - np.floor(k)
    i1 = (i0 + 1) % 5
    return C[i0] * (1 - fr)[..., None] + C[i1] * fr[..., None]


# ============================================ D: Sierpinski pentagon (SVG) ====
def _pent_shapes(depth):
    r = 1 - 1 / PHI
    V = [(math.cos(math.radians(90 + 72 * k)), math.sin(math.radians(90 + 72 * k))) for k in range(5)]
    shapes = []

    def rec(x, y, s, addr):
        if len(addr) == depth:
            shapes.append((x, y, s, addr))
            return
        for k in range(5):
            vx, vy = x + s * V[k][0], y + s * V[k][1]
            rec(vx + r * (x - vx), vy + r * (y - vy), s * r, addr + (k,))
    rec(0.0, 0.0, 1.0, ())
    return V, shapes


def _pent_hue(addr):
    """Position on the five-colour wheel from the fractal address: branch k sits on colour k,
    and each sub-branch leans towards the neighbouring branch it points at (so colours blend
    through the rainbow, never across it)."""
    t = float(addr[0])
    w = (0.36, 0.13, 0.05, 0.02)
    for lvl in range(1, len(addr)):
        dlt = (addr[lvl] - addr[0] + 2) % 5 - 2      # -2..2 relative to the main branch
        t += w[lvl - 1] * dlt
    return (t / 5.0) % 1.0


def sierpinski_pentagon_svg(cx=105.0, cy=186.0, R=88.0, depth=5, shrink=0.9):
    """The Sierpinski pentagon: five copies of itself, each scaled by 1/phi^2 = 0.382 towards a vertex."""
    V, shapes = _pent_shapes(depth)
    el = []
    for x, y, s, addr in shapes:
        col = wheel(_pent_hue(addr))
        light = 0.86 + 0.14 * (addr[-1] == addr[0]) + 0.08 * (addr[-2] == 0)
        pts = " ".join(f"{f(cx + R * (x + shrink * s * vx))},{f(cy - R * (y + shrink * s * vy))}" for vx, vy in V)
        el.append(f'<polygon points="{pts}" fill="{_hexc(col * light)}"/>')
    return el


def pentagon_glow_png(path, cx=105.0, cy=186.0, R=88.0, dpi=100, sigma_mm=3.2, strength=0.55):
    """Soft coloured glow behind the pentagon: the level-4 pieces rasterised and blurred."""
    from PIL import ImageDraw, ImageFilter
    W, H = int(round(210 / 25.4 * dpi)), int(round(297 / 25.4 * dpi))
    mm = dpi / 25.4
    V, shapes = _pent_shapes(4)
    im = Image.new("RGB", (W, H), (0, 0, 0))
    dr = ImageDraw.Draw(im)
    for x, y, s, addr in shapes:
        col = tuple(int(v * 255) for v in wheel(_pent_hue(addr)))
        pts = [((cx + R * (x + s * vx)) * mm, (cy - R * (y + s * vy)) * mm) for vx, vy in V]
        dr.polygon(pts, fill=col)
    im = im.filter(ImageFilter.GaussianBlur(sigma_mm * mm))
    a = np.array(im).astype(float) / 255.0
    alpha = np.clip(a.max(axis=2) * strength * 1.6, 0, strength)
    rgb = np.where(a.max(axis=2, keepdims=True) > 0, a / np.maximum(a.max(axis=2, keepdims=True), 1e-6), 0)
    out = np.dstack([rgb * 255, alpha * 255]).astype(np.uint8)
    Image.fromarray(out, "RGBA").save(path)
    return path


# =========================================== E: Multibrot z^6 + c (raster) ====
def multibrot_art(W, H, d=6, cx_mm=105.0, cy_mm=190.0, mm_per_unit=64.0, rot_deg=90.0, maxit=400,
                  bg=MID, fade=(96.0, 158.0)):
    """The degree-6 Multibrot set (five-fold symmetry). Glow from the distance estimate,
    hue running round the five colours by angle, soft escape bands, dark interior."""
    px_mm = 210.0 / W
    X = (np.arange(W) + 0.5) * px_mm
    out = np.zeros((H, W, 3))
    B = _rgb(bg)
    unit_px = mm_per_unit / px_mm
    for r0 in range(0, H, 200):
        r1 = min(H, r0 + 200)
        Y = (np.arange(r0, r1) + 0.5) * px_mm
        XX, YY = np.meshgrid(X, Y)
        w = ((XX - cx_mm) - 1j * (YY - cy_mm)) / mm_per_unit
        c = (w * np.exp(1j * np.radians(rot_deg))).ravel()
        n = c.size
        mu = np.full(n, -1.0)
        de = np.zeros(n)
        act = np.arange(n)
        z = np.zeros(n, complex)
        dz = np.zeros(n, complex)
        cc = c.copy()
        for i in range(maxit):
            dz = d * z ** (d - 1) * dz + 1.0
            z = z ** d + cc
            a = np.abs(z)
            m = a > 1e5
            if m.any():
                ids = act[m]
                mu[ids] = i + 1 - np.log(np.log(a[m])) / np.log(d)
                de[ids] = a[m] * np.log(a[m]) / np.maximum(np.abs(dz[m]), 1e-300)
                k = ~m
                act, z, dz, cc = act[k], z[k], dz[k], cc[k]
                if act.size == 0:
                    break
        mu = mu.reshape(r1 - r0, W)
        de = de.reshape(r1 - r0, W)
        esc = mu >= 0
        dd = np.where(esc, np.nan_to_num(de * unit_px, nan=0.0, posinf=1e9), 0.0)
        s = W / 2480.0
        core = np.where(esc, np.exp(-dd / (1.4 * s)), 0.0)
        glow = np.where(esc, np.exp(-dd / (10.0 * s)), 0.0)
        halo = np.where(esc, np.exp(-dd / (70.0 * s)), 0.0)
        ang = (np.angle(w) / (2 * np.pi) + 0.25) % 1.0          # colour wheel round the shape
        hue = wheel(ang)
        band = np.where(esc, 0.5 + 0.5 * np.cos(2 * np.pi * mu), 0.0)
        rgb = B + hue * (0.10 * halo + 0.55 * glow + 0.06 * band * halo)[..., None] + \
            (0.55 * hue + 0.45) * core[..., None] * 0.9
        # interior: midnight with a soft coloured rim just inside the edge
        from scipy.ndimage import distance_transform_edt
        din = distance_transform_edt(~esc)
        inner = np.exp(-din / (12.0 * s))
        fill = B * 0.75 + hue * (inner * 0.22)[..., None]
        rgb[~esc] = fill[~esc]
        k2 = np.clip(((Y[:, None]) - fade[0]) / (fade[1] - fade[0]), 0, 1)
        k2 = k2 * k2 * (3 - 2 * k2)
        rgb = rgb * k2[..., None] + B * (1 - k2[..., None])
        out[r0:r1] = rgb
    return Image.fromarray(np.clip(out * 255, 0, 255).astype(np.uint8))


# ====================================== F: times table of 6 on a circle (SVG) ====
def times_table_svg(cx=105.0, cy=118.0, R=78.0, N=360, m=6, cols=VIVID):
    """Join point n to point m*n (mod N) on a circle of N points. For m = 6 the chords
    wrap a five-cusped curve (an epicycloid with m - 1 = 5 cusps)."""
    P = [(cx + R * math.cos(math.radians(90 + 360 * k / N)), cy - R * math.sin(math.radians(90 + 360 * k / N)))
         for k in range(N)]
    el = []
    for i in range(24):                    # soft halo behind the circle
        rr = R * 1.18 * (1 - i / 24)
        el.append(f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{f(rr)}" fill="#6B4CFF" fill-opacity="0.010"/>')
    el.append(f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{f(R)}" fill="none" stroke="#FFFFFF" '
              f'stroke-opacity="0.22" stroke-width="0.35"/>')
    for w, op in ((1.4, 0.045), (0.32, 0.62)):
        for k in range(N):
            j = (m * k) % N
            if j == k:
                continue
            col = _hexc(wheel(k / N))
            (x0, y0), (x1, y1) = P[k], P[j]
            el.append(f'<line x1="{f(x0)}" y1="{f(y0)}" x2="{f(x1)}" y2="{f(y1)}" stroke="{col}" '
                      f'stroke-opacity="{op}" stroke-width="{w}" stroke-linecap="round"/>')
    for k in range(0, N, 1):
        x, y = P[k]
        el.append(f'<circle cx="{f(x)}" cy="{f(y)}" r="0.32" fill="#FFFFFF" fill-opacity="0.55"/>')
    for k in range(0, N, N // (m - 1)):   # the five fixed points (cusps)
        x, y = P[k]
        el.append(f'<circle cx="{f(x)}" cy="{f(y)}" r="1.25" fill="#FFFFFF"/>')
    return el
