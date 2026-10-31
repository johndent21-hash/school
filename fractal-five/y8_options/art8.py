# -*- coding: utf-8 -*-
"""Light-theme fractal artwork options for the Year 8 Fractal Five title page.

Each function returns SVG elements in page millimetres (A4, 210 x 297), centred on the art area between
the title block and the Name box, except julia_jpg, which writes one JPEG (quality 70, 1200 px).

  A koch_neon         Koch snowflakes, neon rainbow lines with a soft glow
  B dragon_iridescent four Heighway dragons tiling round a point, iridescent rainbow along the curve
  C apollonian_glass  Apollonian gasket, jewel-tone stained glass with white leading
  D pythagoras_wash   Pythagoras tree on a 3-4-5 triangle, watercolour rainbow by depth
  E julia_jpg         Julia set (spiral), neon rainbow filaments on white
"""
import cmath
import math

import numpy as np
from PIL import Image

PAL = {
    "neon": ["#FF1F8E", "#FF7A00", "#FFD000", "#00D68F", "#00B4FF", "#7B4DFF"],
    "iridescent": ["#FF4FB8", "#FF9F45", "#F2D531", "#2EDDA8", "#3AA6FF", "#9670FF"],
    "jewel": ["#D7263D", "#F46036", "#F2C14E", "#1B998B", "#2E86DE", "#6F2DBD"],
    "watercolour": ["#F27BA8", "#F7A072", "#F4D35E", "#7FD8BE", "#6CB4EE", "#B58BD8"],
}
CX, CY = 105.0, 183.0          # centre of the art area (mm): clear of the chip above and the Name box below


def f(x):
    return f"{x:.2f}".rstrip("0").rstrip(".")


def rgb(h):
    return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], float) / 255.0


def hexc(c):
    c = np.clip(c, 0, 1)
    return "#%02X%02X%02X" % tuple(int(round(v * 255)) for v in c)


def wheel(t, cols):
    """Smooth colour wheel through the palette, t in [0, 1)."""
    n = len(cols)
    k = (t % 1.0) * n
    i0 = int(math.floor(k)) % n
    fr = k - math.floor(k)
    return rgb(cols[i0]) * (1 - fr) + rgb(cols[(i0 + 1) % n]) * fr


def chunks(pts, n):
    for i in range(0, len(pts) - 1, n):
        yield i, pts[i:i + n + 1]


# ------------------------------------------------------------------ A: Koch ----
def koch_curve(a, b, depth):
    if depth == 0:
        return [a]
    (x1, y1), (x2, y2) = a, b
    dx, dy = (x2 - x1) / 3, (y2 - y1) / 3
    p1 = (x1 + dx, y1 + dy)
    p3 = (x1 + 2 * dx, y1 + 2 * dy)
    # the bump points outward for a triangle traced clockwise on the page (y down)
    p2 = (p1[0] + dx * 0.5 + dy * math.sqrt(3) / 2, p1[1] + dy * 0.5 - dx * math.sqrt(3) / 2)
    out = []
    for s, e in ((a, p1), (p1, p2), (p2, p3), (p3, b)):
        out += koch_curve(s, e, depth - 1)
    return out


def snowflake(cx, cy, R, depth, rot=0.0):
    V = [(cx + R * math.cos(math.radians(rot - 90 + 120 * k)), cy + R * math.sin(math.radians(rot - 90 + 120 * k)))
         for k in range(3)]
    pts = []
    for k in range(3):
        pts += koch_curve(V[k], V[(k + 1) % 3], depth)
    return pts + [pts[0]]


def koch_neon(pal=PAL["neon"]):
    el = []
    flakes = [(72, 5, 0.0, 0.0), (41.5, 4, 180.0, 0.33), (22, 4, 0.0, 0.66)]
    layers = [(2.6, 0.07), (1.1, 0.22), (0.38, 1.0)]       # glow, halo, core
    for w, op in layers:
        for R, d, rot, shift in flakes:
            pts = snowflake(CX, CY, R, d, rot)
            for i, seg in chunks(pts, 6):
                mx, my = seg[len(seg) // 2]
                t = (math.atan2(my - CY, mx - CX) / (2 * math.pi) + 0.25 + shift) % 1
                col = hexc(wheel(t, pal) * (0.92 if w < 1 else 1.0))
                p = " ".join(f"{f(x)},{f(y)}" for x, y in seg)
                el.append(f'<polyline points="{p}" fill="none" stroke="{col}" stroke-opacity="{op}" '
                          f'stroke-width="{w}" stroke-linejoin="round" stroke-linecap="round"/>')
    return el


# ---------------------------------------------------------------- B: dragon ----
def dragon_turns(n):
    s = []
    for _ in range(n):
        s = s + [1] + [-t for t in reversed(s)]
    return s


def dragon_iridescent(pal=PAL["iridescent"], n=11, size=172.0, rot=45.0):
    """One Heighway dragon (n folds), coloured along the curve, as a soft ribbon with a pearly highlight."""
    turns = dragon_turns(n)
    x, y, d = 0.0, 0.0, 0
    pts = [(x, y)]
    for t in [0] + turns:
        d = (d + t) % 4
        x += (1, 0, -1, 0)[d]
        y += (0, 1, 0, -1)[d]
        pts.append((x, y))
    c, sn = math.cos(math.radians(rot)), math.sin(math.radians(rot))
    pts = [(x * c - y * sn, x * sn + y * c) for x, y in pts]
    x0, x1 = min(p[0] for p in pts), max(p[0] for p in pts)
    y0, y1 = min(p[1] for p in pts), max(p[1] for p in pts)
    s = min(size / (x1 - x0), 140.0 / (y1 - y0))
    ox, oy = CX - s * (x0 + x1) / 2, CY - s * (y0 + y1) / 2
    P = [(ox + s * x, oy + s * y) for x, y in pts]
    L = len(P)
    el = []
    step = s
    for w, op, light in ((step * 0.9, 0.10, 0.0), (step * 0.42, 1.0, 0.0), (step * 0.12, 0.75, 1.0)):
        for i, seg in chunks(P, 12):
            cc = wheel(i / L, pal)
            if light:
                cc = cc * 0.3 + 0.7
            p = " ".join(f"{f(x)},{f(y)}" for x, y in seg)
            el.append(f'<polyline points="{p}" fill="none" stroke="{hexc(cc)}" stroke-opacity="{op}" '
                      f'stroke-width="{w}" stroke-linejoin="round" stroke-linecap="round"/>')
    return el


# ------------------------------------------------------------ C: Apollonian ----
def apollonian(min_r=0.0055):
    """Circles (curvature k, centre z) of the integer Apollonian gasket (-1, 2, 2, 3) in the unit circle:
    every curvature is a whole number."""
    outer = (-1.0, 0j)
    A, B = (2.0, complex(-0.5, 0)), (2.0, complex(0.5, 0))
    C, Dn = (3.0, complex(0, 2 / 3)), (3.0, complex(0, -2 / 3))
    circles = [outer, A, B, C, Dn]

    def new(a, b, c, old):
        k = 2 * (a[0] + b[0] + c[0]) - old[0]
        kz = 2 * (a[0] * a[1] + b[0] * b[1] + c[0] * c[1]) - old[0] * old[1]
        return (k, kz / k)

    # each gap is bounded by three touching circles; the fourth entry is the other circle touching all three
    stack = [(A, B, C, outer), (A, B, Dn, outer), (outer, A, C, B), (outer, B, C, A), (outer, A, Dn, B),
             (outer, B, Dn, A)]
    while stack:
        a, b, c, old = stack.pop()
        d = new(a, b, c, old)
        if 1 / d[0] < min_r:
            continue
        circles.append(d)
        stack += [(a, b, d, c), (b, c, d, a), (c, a, d, b)]
    return circles


def apollonian_glass(pal=PAL["jewel"], R=68.0):
    el = [f'<circle cx="{f(CX)}" cy="{f(CY)}" r="{f(R + 2.2)}" fill="none" stroke="#1C1A33" stroke-opacity="0.18" '
          f'stroke-width="0.35"/>',
          f'<circle cx="{f(CX)}" cy="{f(CY)}" r="{f(R)}" fill="#FFFFFF" stroke="#1C1A33" stroke-width="0.9"/>']
    circ = sorted(apollonian()[1:], key=lambda c: c[0])
    for k, z in circ:
        rr = R / k
        x, y = CX + R * z.real, CY - R * z.imag
        t = (math.atan2(-z.imag, z.real) / (2 * math.pi) + 0.25) % 1 if abs(z) > 1e-6 else 0.0
        size = min(1.0, rr / (R * 0.5))
        c = wheel(t, pal)
        c = c * (0.62 + 0.38 * size) + (1 - (0.62 + 0.38 * size)) * 1.0      # small circles a little paler
        lead = max(0.12, min(0.7, rr * 0.06))
        el.append(f'<circle cx="{f(x)}" cy="{f(y)}" r="{f(rr - lead / 2)}" fill="{hexc(c)}" stroke="#FFFFFF" '
                  f'stroke-width="{f(lead)}"/>')
        if rr > 3:                                     # a soft sheen on the bigger panes
            el.append(f'<circle cx="{f(x - rr * 0.28)}" cy="{f(y - rr * 0.3)}" r="{f(rr * 0.42)}" fill="#FFFFFF" '
                      f'fill-opacity="0.16"/>')
    return el


# ------------------------------------------------------------- D: Pythagoras ----
def pythagoras_wash(pal=PAL["watercolour"], depth=11, side=27.0):
    """Squares on the sides of a 3-4-5 right-angled triangle (angles 36.87 and 53.13 degrees), again and again."""
    th = math.atan2(3, 4)
    sq = []

    def rec(p, v, d):
        # p = bottom-left corner, v = bottom edge vector (left to right); the square rises to the left of v
        u = (-v[1], v[0]) if False else (v[1], -v[0])        # 'up' on the page (y down)
        P = [p, (p[0] + v[0], p[1] + v[1]), (p[0] + v[0] + u[0], p[1] + v[1] + u[1]), (p[0] + u[0], p[1] + u[1])]
        sq.append((P, d))
        if d == depth:
            return
        a, b = P[3], P[2]                                  # the top edge, left to right
        L = math.hypot(*v)
        ang = math.atan2(v[1], v[0])
        # left child on the leg of length L cos(th), rotated up by th
        l1 = L * math.cos(th)
        v1 = (l1 * math.cos(ang - th), l1 * math.sin(ang - th))
        rec(a, v1, d + 1)
        apex = (a[0] + v1[0], a[1] + v1[1])
        v2 = (b[0] - apex[0], b[1] - apex[1])
        rec(apex, v2, d + 1)
    rec((0.0, 0.0), (side, 0.0), 0)
    xs = [x for P, _ in sq for x, _ in P]
    ys = [y for P, _ in sq for _, y in P]
    ox = CX - (min(xs) + max(xs)) / 2
    oy = CY - (min(ys) + max(ys)) / 2 + 2
    el = []
    for P, d in sq:
        t = 0.62 + 0.9 * d / depth                          # trunk violet/blue, leaves pink-orange-gold
        c = wheel(t, pal)
        op = 0.82 if d < 3 else 0.62
        pp = " ".join(f"{f(x + ox)},{f(y + oy)}" for x, y in P)
        el.append(f'<polygon points="{pp}" fill="{hexc(c)}" fill-opacity="{op}" stroke="{hexc(c * 0.82)}" '
                  f'stroke-opacity="0.55" stroke-width="{f(max(0.08, 0.35 - d * 0.025))}" stroke-linejoin="round"/>')
    return el


# ----------------------------------------------------------------- E: Julia ----
def julia_jpg(path, pal=PAL["neon"], c=complex(-0.7269, 0.1889), px=1200, span=3.05, maxit=600):
    """Julia set as neon rainbow filaments on white (distance-estimate glow, hue from the smooth count),
    faded to white towards the square's edges. One JPEG, quality 70."""
    xs = np.linspace(-span / 2, span / 2, px)
    X, Y = np.meshgrid(xs, -xs)
    z = (X + 1j * Y).ravel() * np.exp(1j * math.radians(-28))
    n = z.size
    dz = np.ones(n, complex)
    mu = np.full(n, -1.0)
    de = np.zeros(n)
    act = np.arange(n)
    zz, dd = z.copy(), dz.copy()
    for i in range(maxit):
        dd = 2 * zz * dd
        zz = zz * zz + c
        a = np.abs(zz)
        m = a > 1e3
        if m.any():
            ids = act[m]
            mu[ids] = i + 1 - np.log(np.log(a[m])) / np.log(2)
            de[ids] = a[m] * np.log(a[m]) / np.maximum(np.abs(dd[m]), 1e-300)
            keep = ~m
            act, zz, dd = act[keep], zz[keep], dd[keep]
            if act.size == 0:
                break
    mu = mu.reshape(px, px)
    de = de.reshape(px, px) / (span / px)
    esc = mu >= 0
    core = np.where(esc, np.exp(-de / 0.9), 0.0)
    glow = np.where(esc, np.exp(-de / 7.0), 0.0)
    halo = np.where(esc, np.exp(-de / 40.0), 0.0)
    t = np.where(esc, (np.log(np.maximum(mu, 1)) * 0.55) % 1.0, 0.0)
    C = np.array([rgb(h) for h in pal])
    k = t * len(pal)
    i0 = np.floor(k).astype(int) % len(pal)
    fr = (k - np.floor(k))[..., None]
    col = C[i0] * (1 - fr) + C[(i0 + 1) % len(pal)] * fr
    ink = np.clip(0.95 * core + 0.42 * glow + 0.10 * halo, 0, 1)[..., None]
    out = 1 - ink * (1 - col)
    inside = ~esc
    out[inside] = np.array([0.975, 0.965, 1.0])                # the filled Julia set: a whisper of lilac
    rr = np.hypot(*np.meshgrid(np.linspace(-1, 1, px), np.linspace(-1, 1, px)))
    fade = np.clip((1.0 - rr) / 0.28, 0, 1)[..., None]
    fade = fade * fade * (3 - 2 * fade)
    out = out * fade + (1 - fade)
    Image.fromarray(np.clip(out * 255, 0, 255).astype(np.uint8)).save(path, quality=70, optimize=True)
    return path
