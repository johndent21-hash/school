"""Chapter 10 figure helpers (rebuilt): circles, sectors, annulus, cylinders, prisms."""
import math
from bdia import Fig, fitter, unit, centroid, OUT, INK, BLUE, FILL, BLUEF, SOFT, FS


def circ(label, kind="r", W=110, H=100):
    f = Fig(W, H)
    c, R = (62.0, 60.0), 44.0
    f.circle(c, R, fill=FILL)
    f.dot(c, r=2.4)
    if kind == "d":
        f.line((c[0] - R, c[1]), (c[0] + R, c[1]), BLUE, 1.6)
        f.text((c[0], c[1] - 9), label, size=11.5, color=BLUE)
    else:
        f.line(c, (c[0] + R, c[1]), BLUE, 1.6)
        f.text((c[0] + R / 2, c[1] - 9), label, size=11.5, color=BLUE)
    return f.svg()


def sector(ang, rlabel, W=110, H=100):
    f = Fig(W, H)
    R, c = 56.0, (70.0, 72.0)
    a0 = math.radians(-90 - ang / 2)
    a1 = a0 + math.radians(ang)
    p = (c[0] + R * math.cos(a0), c[1] + R * math.sin(a0))
    q = (c[0] + R * math.cos(a1), c[1] + R * math.sin(a1))
    large = 1 if ang > 180 else 0
    f.path(f"M{c[0]:.1f},{c[1]:.1f} L{p[0]:.1f},{p[1]:.1f} A{R},{R} 0 {large},1 {q[0]:.1f},{q[1]:.1f} Z",
           fill=BLUEF, stroke=OUT)
    f._ext(c[0] - R, c[1] - R)
    f._ext(c[0] + R, c[1] + (R if ang > 180 else 4))
    f.angle(c, p, q, f"{ang}\u00b0", reflex=ang > 180)
    f.side_label(c, p, rlabel, inside=q)
    return f.svg()


def annulus(Rlab, rlab, W=110, H=100):
    f = Fig(W, H)
    c, R, r = (62.0, 60.0), 46.0, 28.0
    f.circle(c, R, fill=BLUEF)
    f.circle(c, r, fill=FILL)
    f.dot(c, r=2.2)
    t = math.radians(-40)
    f.line(c, (c[0] + R * math.cos(t), c[1] + R * math.sin(t)), BLUE, 1.5)
    f.text((c[0] + R * 0.62 * math.cos(t) + 8, c[1] + R * 0.62 * math.sin(t) - 8), Rlab, size=11, color=BLUE)
    f.line(c, (c[0] - r, c[1]), INK, 1.4)
    f.text((c[0] - r / 2, c[1] + 11), rlab, size=11)
    return f.svg()


def cyl(rlab, hlab, dia=False, open_top=False, W=115, H=120):
    f = Fig(W, H)
    cx, rx, ry, top, bot = 60.0, 36.0, 11.0, 26.0, 124.0
    f.path(f"M{cx - rx},{top} L{cx - rx},{bot} A{rx},{ry} 0 0,0 {cx + rx},{bot} L{cx + rx},{top}", fill=FILL)
    f.path(f"M{cx - rx},{bot} A{rx},{ry} 0 0,1 {cx + rx},{bot}", dash="3.5 3")
    f.ellipse((cx, top), rx, ry, fill=FILL if open_top else SOFT)
    f._ext(cx - rx, bot + ry)
    if dia:
        f.line((cx - rx, top), (cx + rx, top), BLUE, 1.6)
        f.text((cx, top - ry - 6), rlab, size=11.5, color=BLUE)
    else:
        f.line((cx, top), (cx + rx, top), BLUE, 1.6)
        f.dot((cx, top), r=2.2)
        f.text((cx + rx / 2, top - 6), rlab, size=11.5, color=BLUE)
    f.text((cx + rx + 6, (top + bot) / 2), hlab, size=11.5, anchor="start")
    return f.svg()


def _hull(pts):
    P = sorted(set(pts))
    if len(P) < 3:
        return P
    def cr(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    lo, up = [], []
    for p in P:
        while len(lo) >= 2 and cr(lo[-2], lo[-1], p) <= 0:
            lo.pop()
        lo.append(p)
    for p in reversed(P):
        while len(up) >= 2 and cr(up[-2], up[-1], p) <= 0:
            up.pop()
        up.append(p)
    return lo[:-1] + up[:-1]


def prism3(face, labels=(), depth=10, seg=None, seg_label=None, W=150, H=104):
    k, ang = 0.42, math.radians(32)
    off = (depth * k * math.cos(ang), depth * k * math.sin(ang))
    back = [(x + off[0], y + off[1]) for x, y in face]
    T = fitter(list(face) + back, W, H, 20)
    Fq, Bq = [T(p) for p in face], [T(p) for p in back]
    n = len(face)
    hull = _hull([(round(p[0], 3), round(p[1], 3)) for p in Fq + Bq])
    on_hull = lambda p: (round(p[0], 3), round(p[1], 3)) in hull
    hidden = [not on_hull(Bq[i]) for i in range(n)]
    f = Fig(W, H)
    f.poly(hull, fill=SOFT, stroke="none", sw=0)
    for i in range(n):
        j = (i + 1) % n
        f.line(Bq[i], Bq[j], dash="3.5 3" if (hidden[i] or hidden[j]) else None)
        f.line(Fq[i], Bq[i], dash="3.5 3" if hidden[i] else None)
    f.poly(Fq, fill=FILL)
    cF = centroid(Fq)
    for key, text in labels:
        if isinstance(key, tuple):
            i = key[1]
            f.side_label(Fq[i], Bq[i], text, inside=cF, size=11)
        else:
            f.side_label(Fq[key], Fq[(key + 1) % n], text, inside=cF, size=11)
    if seg:
        a, b = T(seg[0]), T(seg[1])
        f.line(a, b, dash="3.5 3")
        if seg_label:
            f.text(((a[0] + b[0]) / 2 + 5, (a[1] + b[1]) / 2), seg_label, size=11, anchor="start")
    return f.svg()
