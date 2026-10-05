# -*- coding: utf-8 -*-
"""Diagrams for the Year 9 formula warm-ups.

Built on the booklet figure engine (bdia.Fig): shapes are drawn from real model
coordinates, so every figure is to scale and every mark agrees with its numbers.
Colours are the Year 7/8 house palette (blue outlines, charcoal labels), and
figures are sized in CSS px so labels print at a steady ~9.5 pt.
"""
import math
import re
import sys

sys.path.insert(0, __import__("os").path.dirname(__import__("os").path.abspath(__file__)))
import bdia  # noqa: E402
from bdia import Fig, unit, centroid, _f  # noqa: E402

INK = "#35322D"
OUT = "#3B7FC0"       # outlines
HI = "#1F5E9E"        # the unknown: deeper blue, bold italic
FILL = "#FFFFFF"
SOFT = "#E3ECF6"      # side face of a solid
SOFT2 = "#F0F5FA"     # top face of a solid
SHADE = "#D6E5F5"     # shaded cross-section
MUTED = "#8A857C"
GRIDC = "#D9E3EE"
FS = 13               # label size in px (about 9.75 pt)
FONT = "'Open Sans', OS, sans-serif"

_MAP = {bdia.OUT: OUT, bdia.BLUE: HI, bdia.INK: INK, bdia.SOFT: SOFT, bdia.SOFT2: SOFT2,
        bdia.BLUEF: SHADE, bdia.MUTED: MUTED, bdia.GRID: GRIDC, bdia.FONT: FONT}


def recolour(svg):
    for a, b in _MAP.items():
        svg = svg.replace(a, b)
    return svg


def fitter(pts, W, H, pad=18, padx=None):
    """Model (y up) -> SVG px, fitting pts into W x H with padding for labels."""
    px = pad if padx is None else padx
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    s = min((W - 2 * px) / ((x1 - x0) or 1), (H - 2 * pad) / ((y1 - y0) or 1))
    ox = (W - s * (x1 - x0)) / 2
    oy = (H - s * (y1 - y0)) / 2
    return (lambda p: (ox + (p[0] - x0) * s, H - oy - (p[1] - y0) * s)), s


def _lab(f, p, q, text, inside, unknown=False, off=9):
    f.side_label(p, q, text, inside, off=off, color=bdia.BLUE if unknown else bdia.INK,
                 size=FS, weight=700 if unknown else None)


# ---------------------------------------------------------------- Pythagoras --
def rt_tri(a, b, legs=("", ""), hyp="", unknown=None, orient=0, W=300, H=124):
    """Right-angled triangle, horizontal leg a and vertical leg b (to scale).
    orient: 0 right angle bottom-left, 1 bottom-right, 2 top-left, 3 top-right.
    Sides: 0 horizontal leg, 1 hypotenuse, 2 vertical leg. unknown = side index."""
    sx = -1 if orient in (1, 3) else 1
    sy = -1 if orient in (2, 3) else 1
    M = [(0, 0), (sx * a, 0), (0, sy * b)]
    T, _ = fitter(M, W, H, pad=15, padx=44)
    P = [T(p) for p in M]
    f = Fig(W, H)
    f.poly(P, sw=1.5)
    if unknown is not None:
        f.line(P[unknown], P[(unknown + 1) % 3], bdia.BLUE, 2.3)
    f.right_angle(P[0], P[1], P[2], s=8)
    c = centroid(P)
    for i, lab in ((0, legs[0]), (1, hyp), (2, legs[1])):
        if lab:
            _lab(f, P[i], P[(i + 1) % 3], lab, c, unknown == i)
    return recolour(f.svg())


# ------------------------------------------------------------------- areas --
def tri_height(base, apex_x, height, base_lab, h_lab, W=300, H=124):
    """Triangle on a horizontal base with its perpendicular height dashed."""
    A, B, C, Ft = (0, 0), (base, 0), (apex_x, height), (apex_x, 0)
    T, _ = fitter([A, B, C], W, H, pad=15)
    a, b, c, ft = T(A), T(B), T(C), T(Ft)
    f = Fig(W, H)
    f.poly([a, b, c], sw=1.5)
    f.line(c, ft, bdia.OUT, 1.2, dash="4 3")
    f.right_angle(ft, b, c, s=7)
    _lab(f, a, b, base_lab, c)
    f.text((ft[0] + 7, (c[1] + ft[1]) / 2), h_lab, size=FS, anchor="start", color=bdia.INK)
    return recolour(f.svg())


def trapezium(bottom, top, height, top_x, labs, W=300, H=118):
    """Trapezium with parallel sides horizontal; dashed height from the top-left vertex.
    labs = (top label, bottom label, height label)."""
    A, B = (0, 0), (bottom, 0)
    C, D = (top_x + top, height), (top_x, height)
    T, _ = fitter([A, B, C, D], W, H, pad=16, padx=20)
    a, b, c, d = T(A), T(B), T(C), T(D)
    ft = T((top_x, 0))
    f = Fig(W, H)
    f.poly([a, b, c, d], sw=1.5)
    f.line(d, ft, bdia.OUT, 1.2, dash="4 3")
    f.right_angle(ft, b, d, s=7)
    cen = centroid([a, b, c, d])
    _lab(f, d, c, labs[0], cen)
    _lab(f, a, b, labs[1], cen)
    f.text((ft[0] + 7, (d[1] + ft[1]) / 2), labs[2], size=FS, anchor="start", color=bdia.INK)
    # parallel-side arrows
    for p, q in ((d, c), (a, b)):
        mx = p[0] + 0.5 * (q[0] - p[0])
        f.poly([(mx - 3, p[1] - 3.2), (mx + 2.5, p[1]), (mx - 3, p[1] + 3.2)], close=False,
               stroke=bdia.OUT, sw=1.2)
    return recolour(f.svg())


def circle_r(label, R=46, W=150, H=112):
    """Circle with a labelled radius."""
    f = Fig(W, H)
    c = (W / 2, H / 2)
    f.circle(c, R, sw=1.5)
    f.line(c, (c[0] + R, c[1]), bdia.OUT, 1.5)
    f.dot(c, r=2.4, fill=bdia.INK)
    tw = 0.6 * FS * len(re.sub(r"<[^>]+>", "", label))
    x = min(c[0] + R / 2, c[0] + R - 5 - tw / 2)      # long labels slide inward, clear of the rim
    f.text((x, c[1] - 9), label, size=FS, color=bdia.INK)
    return recolour(f.svg())


# ----------------------------------------------------------------- volumes --
def box(l, w, h, labs, W=300, H=124, k=0.55, ang=35):
    """Rectangular prism, oblique view. labs = (length, width, height)."""
    dx, dy = k * w * math.cos(math.radians(ang)), k * w * math.sin(math.radians(ang))
    M = {"A": (0, 0), "B": (l, 0), "C": (l, h), "D": (0, h), "E": (dx, dy),
         "F": (l + dx, dy), "G": (l + dx, h + dy), "H": (dx, h + dy)}
    T, _ = fitter(list(M.values()), W, H, pad=15, padx=46)
    Q = {kk: T(v) for kk, v in M.items()}
    f = Fig(W, H)
    f.poly([Q["D"], Q["C"], Q["G"], Q["H"]], fill=bdia.SOFT2, sw=1.4)
    f.poly([Q["B"], Q["F"], Q["G"], Q["C"]], fill=bdia.SOFT, sw=1.4)
    f.poly([Q["A"], Q["B"], Q["C"], Q["D"]], sw=1.4)
    for a, b in (("A", "E"), ("E", "F"), ("E", "H")):
        f.line(Q[a], Q[b], bdia.OUT, 1.0, dash="4 3")
    L, Wd, Hd = labs
    f.text(((Q["A"][0] + Q["B"][0]) / 2, Q["A"][1] + 13), L, size=FS)
    mx, my = (Q["B"][0] + Q["F"][0]) / 2, (Q["B"][1] + Q["F"][1]) / 2
    f.text((mx + 7, my + 6), Wd, size=FS, anchor="start")
    f.text((Q["A"][0] - 7, (Q["A"][1] + Q["D"][1]) / 2), Hd, size=FS, anchor="end")
    return recolour(f.svg())


def prism_area(face, depth, area_lab, len_lab, W=300, H=108, k=0.8, ang=20, lab_at=None):
    """Prism with its cross-section shaded, drawn lying along its length (oblique view).
    face: polygon (model units) facing the reader; depth: prism length (same units).
    Hidden edges (those meeting a vertex hidden behind the solid) are dashed."""
    off = (k * depth * math.cos(math.radians(ang)), k * depth * math.sin(math.radians(ang)))
    back = [(x + off[0], y + off[1]) for x, y in face]
    T, _ = fitter(list(face) + back, W, H, pad=12, padx=40)
    Fq, Bq = [T(p) for p in face], [T(p) for p in back]
    n = len(face)
    from g10 import _hull
    key = lambda p: (round(p[0], 3), round(p[1], 3))
    hull = _hull([key(p) for p in Fq + Bq])
    hidden = [key(Bq[i]) not in hull for i in range(n)]
    f = Fig(W, H)
    f.poly(hull, fill=bdia.SOFT2, stroke="none", sw=0)
    f.poly(Fq, fill=bdia.BLUEF, stroke="none", sw=0)
    for i in range(n):          # hidden edges first, dashed, visible through the solid
        j = (i + 1) % n
        if hidden[i] or hidden[j]:
            f.line(Bq[i], Bq[j], bdia.OUT, 1.1, dash="4 3")
        if hidden[i]:
            f.line(Fq[i], Bq[i], bdia.OUT, 1.1, dash="4 3")
    for i in range(n):          # visible edges on top
        j = (i + 1) % n
        if not (hidden[i] or hidden[j]):
            f.line(Bq[i], Bq[j], bdia.OUT, 1.5)
        if not hidden[i]:
            f.line(Fq[i], Bq[i], bdia.OUT, 1.5)
    f.poly(Fq, fill="none", sw=1.5)
    if area_lab:
        cen = centroid(Fq) if lab_at is None else T(lab_at)
        f.text(cen, area_lab, size=FS, color=bdia.INK)
    # length label under the lowest visible receding edge
    vis = [t for t in range(n) if not hidden[t]]
    i = max(vis, key=lambda t: (Fq[t][1], Fq[t][0]))
    a, b = Fq[i], Bq[i]
    mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
    f.text((mx + 6, my + 11), len_lab, size=FS, anchor="start")
    return recolour(f.svg())


def cylinder(r, h, r_lab, h_lab, W=230, H=112, ry_k=0.3, dia=False):
    """Cylinder to scale (diameter 2r : height h), radius drawn on the top face;
    both labels sit to the right so the solid can use the full cell height."""
    s = min((H - 10) / (h + 2 * r * ry_k), (W - 110) / (2 * r))
    rx, ry, hh = r * s, r * s * ry_k, h * s
    cx = W / 2 - 22
    top = (H - hh) / 2
    bot = top + hh
    f = Fig(W, H)
    f.path(f"M{_f(cx - rx)},{_f(top)} L{_f(cx - rx)},{_f(bot)} A{_f(rx)},{_f(ry)} 0 0,0 "
           f"{_f(cx + rx)},{_f(bot)} L{_f(cx + rx)},{_f(top)}", fill=bdia.SOFT, sw=1.5)
    f.path(f"M{_f(cx - rx)},{_f(bot)} A{_f(rx)},{_f(ry)} 0 0,1 {_f(cx + rx)},{_f(bot)}",
           dash="4 3", sw=1.1)
    f.ellipse((cx, top), rx, ry, fill=bdia.SOFT2, sw=1.5)
    f._ext(cx - rx, bot + ry)
    f._ext(cx, top - ry)
    if dia:
        f.line((cx - rx, top), (cx + rx, top), bdia.OUT, 1.5)
    else:
        f.line((cx, top), (cx + rx, top), bdia.OUT, 1.5)
    f.dot((cx, top), r=2.3, fill=bdia.INK)
    f.text((cx + rx + 7, top - 1), r_lab, size=FS, anchor="start")
    f.text((cx + rx + 7, (top + bot) / 2 + ry / 2), h_lab, size=FS, anchor="start")
    return recolour(f.svg())


# ---------------------------------------------------------------- geometry --
def angle_tri(A, B, labs, W=300, H=126):
    """Triangle with base angles A (left) and B (right) drawn exactly.
    labs = (label at left, label at right, label at apex); a label with <i> is the unknown."""
    P0, P1, P2 = bdia.tri_pts(A, B, base=1.0)
    T, _ = fitter([P0, P1, P2], W, H, pad=10)
    a, b, c = T(P0), T(P1), T(P2)
    f = Fig(W, H)
    f.poly([a, b, c], sw=1.5)
    for v, p, q, lab in ((a, b, c, labs[0]), (b, c, a, labs[1]), (c, a, b, labs[2])):
        u1, u2 = unit(v, p), unit(v, q)
        ang = math.degrees(math.acos(max(-1, min(1, u1[0] * u2[0] + u1[1] * u2[1]))))
        plain = re.sub(r"<[^>]+>", "", lab)
        m = re.fullmatch(r"(\d+(?:\.\d+)?)\u00b0", plain)
        if m:
            assert abs(ang - float(m.group(1))) < 0.6, (plain, ang)
        _angle(f, v, p, q, lab, r=19, size=FS)
    return recolour(f.svg())


def _angle(f, V, P1, P2, lab, r=19, size=FS):
    """Angle arc with its label on the bisector, pushed out until the label box
    clears the arc and both arms by a steady margin."""
    unknown = "<i>" in lab
    f.arc(V, P1, P2, r=r, color=bdia.BLUE if unknown else bdia.OUT)
    u1, u2 = unit(V, P1), unit(V, P2)
    bx, by = u1[0] + u2[0], u1[1] + u2[1]
    L0 = math.hypot(bx, by)
    bis = (bx / L0, by / L0)
    plain = re.sub(r"<[^>]+>", "", lab)
    tw, th = 0.6 * size * len(plain), 0.78 * size

    def clear(L):
        cx, cy = V[0] + L * bis[0], V[1] + L * bis[1]
        corners = [(cx + a * tw / 2, cy + b * th / 2) for a in (-1, 1) for b in (-1, 1)]
        if min(math.hypot(x - V[0], y - V[1]) for x, y in corners) < r + 3.5:
            return False
        for (ux, uy) in (u1, u2):
            nx, ny = -uy, ux
            sgn = 1 if bis[0] * nx + bis[1] * ny > 0 else -1
            if min(sgn * ((x - V[0]) * nx + (y - V[1]) * ny) for x, y in corners) < 3.0:
                return False
        return True
    L = r + 4
    while not clear(L) and L < 120:
        L += 0.5
    f.text((V[0] + L * bis[0], V[1] + L * bis[1]), lab, size=size,
           color=bdia.BLUE if unknown else bdia.INK, weight=700 if unknown else None)


# ------------------------------------------------------------ number plane --
def plane_line(p1, p2, names=("A", "B"), xr=(0, 4), yr=(0, 5), u=17, W=None, H=None):
    """Small first-quadrant number plane with a line through two labelled points."""
    x0, x1 = xr
    y0, y1 = yr
    padl, padb, padt, padr = 18, 16, 12, 14
    Wp = padl + (x1 - x0) * u + padr
    Hp = padt + (y1 - y0) * u + padb
    X = lambda x: padl + (x - x0) * u
    Y = lambda y: padt + (y1 - y) * u
    f = Fig(Wp, Hp)
    for gx in range(x0, x1 + 1):
        f.line((X(gx), Y(y0)), (X(gx), Y(y1)), GRIDC, 0.7)
    for gy in range(y0, y1 + 1):
        f.line((X(x0), Y(gy)), (X(x1), Y(gy)), GRIDC, 0.7)
    f.arrow((X(x0), Y(y0)), (X(x1) + 9, Y(y0)), stroke=INK, sw=1.1, head=5)
    f.arrow((X(x0), Y(y0)), (X(x0), Y(y1) - 9), stroke=INK, sw=1.1, head=5)
    f.text((X(x1) + 12, Y(y0) + 1), "<i>x</i>", size=11, anchor="start", color=INK)
    f.text((X(x0) - 1, Y(y1) - 15), "<i>y</i>", size=11, color=INK)
    for gx in range(x0 + 1, x1 + 1):
        f.text((X(gx), Y(y0) + 9), str(gx), size=9.5, color=MUTED)
    for gy in range(y0 + 1, y1 + 1):
        f.text((X(x0) - 7, Y(gy)), str(gy), size=9.5, color=MUTED)
    f.text((X(x0) - 6, Y(y0) + 8), "0", size=9.5, color=MUTED)
    # the line, clipped to the grid
    (ax, ay), (bx, by) = p1, p2
    m = (by - ay) / (bx - ax)
    pts = []
    for x in (x0, x1):
        y = ay + m * (x - ax)
        if y0 <= y <= y1:
            pts.append((x, y))
    for y in (y0, y1):
        x = ax + (y - ay) / m
        if x0 <= x <= x1:
            pts.append((x, y))
    pts = sorted(set((round(x, 6), round(y, 6)) for x, y in pts))
    f.line((X(pts[0][0]), Y(pts[0][1])), (X(pts[-1][0]), Y(pts[-1][1])), OUT, 1.6)
    # point labels: first spot around the point that is clear of the line and of both axes
    lx0, ly0 = X(pts[0][0]), Y(pts[0][1])
    lx1, ly1 = X(pts[-1][0]), Y(pts[-1][1])
    Lx, Ly = lx1 - lx0, ly1 - ly0
    Ln = math.hypot(Lx, Ly)

    def side(x, y):
        return (Lx * (y - ly0) - Ly * (x - lx0)) / Ln
    for (px, py), nm in zip((p1, p2), names):
        lab = f"{nm}({px}, {py})"
        tw = 0.56 * 11.5 * len(lab)
        cx, cy = X(px), Y(py)
        spot = None
        for dx, dy in ((7, 9), (7, -9), (-7, 9), (-7, -9), (7, 0), (-7, 0)):
            bx0 = cx + dx if dx > 0 else cx + dx - tw
            box = (bx0 - 1.5, cy + dy - 7, bx0 + tw + 1.5, cy + dy + 7)
            ds = [side(x, y) for x in (box[0], box[2]) for y in (box[1], box[3])]
            clear_line = min(ds) > 2.5 or max(ds) < -2.5
            clear_axes = box[3] < Y(y0) - 2 and box[0] > X(x0) + 2
            if clear_line and clear_axes:
                spot = (bx0, cy + dy)
                break
        if spot is None:
            spot = (cx + 7, cy)
        f.rect(spot[0] - 1.5, spot[1] - 7, tw + 3, 14, fill=FILL, stroke="none", sw=0, rx=2)
        f.dot((cx, cy), r=3.0, fill=INK)
        f.text((spot[0], spot[1] + 0.5), lab, size=11.5, anchor="start", color=INK)
    return recolour(f.svg(crop=True))


def journey(dist_lab, time_lab, W=270, H=74):
    """A to B journey: arrowed line with the distance above and the time below."""
    f = Fig(W, H)
    y = H / 2
    xa, xb = 34, W - 34
    f.line((xa, y), (xb, y), OUT, 1.6)
    f.arrow((xb - 30, y), (xb - 6, y), stroke=OUT, sw=1.6, head=7)
    for x, nm in ((xa, "A"), (xb, "B")):
        f.circle((x, y), 4.2, fill=FILL, stroke=OUT, sw=1.6)
        f.text((x, y + 15), nm, size=FS, color=MUTED)
    f.text(((xa + xb) / 2, y - 12), dist_lab, size=FS + 1, color=INK)
    f.text(((xa + xb) / 2, y + 15), time_lab, size=FS + 1, color=INK)
    return recolour(f.svg())


# =================================================================== Terms 2-4 ==
def _solve2(a, b, c, d, e, f):
    """Solve [a b; c d] [x; y] = [e; f]."""
    det = a * d - b * c
    return (e * d - b * f) / det, (a * f - e * c) / det


def quad_angles(angles, labs, L1=None, W=300, H=124):
    """Convex quadrilateral whose interior angles (at P0..P3, anticlockwise from the
    bottom-left) are exactly `angles`. Side P0P1 is the base; P1P2 has length L1
    (base = 1); the last two sides close the shape. labs = labels at P0..P3."""
    assert abs(sum(angles) - 360) < 1e-9
    th = [0.0]
    for a in angles[1:]:
        th.append(th[-1] + math.radians(180 - a))
    u = [(math.cos(t), math.sin(t)) for t in th]

    def sides(l1):
        ex, ey = -(u[0][0] + l1 * u[1][0]), -(u[0][1] + l1 * u[1][1])
        return _solve2(u[2][0], u[3][0], u[2][1], u[3][1], ex, ey)
    if L1 is None:
        # choose the free side so the four sides are as even as possible (no cramped corners)
        best = None
        for i in range(0, 61):
            l1 = 0.35 + i * 0.025
            L2_, L3_ = sides(l1)
            if L2_ <= 0 or L3_ <= 0:
                continue
            sc = min(1, l1, L2_, L3_) / max(1, l1, L2_, L3_)
            if best is None or sc > best[0]:
                best = (sc, l1)
        assert best, "no convex quadrilateral"
        L1 = best[1]
    L2, L3 = sides(L1)
    assert L2 > 0.25 and L3 > 0.25, (L2, L3)
    P = [(0.0, 0.0), u[0]]
    P.append((P[1][0] + L1 * u[1][0], P[1][1] + L1 * u[1][1]))
    P.append((P[2][0] + L2 * u[2][0], P[2][1] + L2 * u[2][1]))
    # stand the shape on whichever side lets it draw largest in the wide, short cell
    best = None
    for k in range(4):
        (ax, ay), (bx, by) = P[k], P[(k + 1) % 4]
        t = -math.atan2(by - ay, bx - ax)
        R_ = [((x - ax) * math.cos(t) - (y - ay) * math.sin(t), (x - ax) * math.sin(t) + (y - ay) * math.cos(t))
              for x, y in P]
        w = max(p[0] for p in R_) - min(p[0] for p in R_)
        h = max(p[1] for p in R_) - min(p[1] for p in R_)
        sc = min((W - 20) / w, (H - 20) / h)
        if best is None or sc > best[0] + 1e-9:
            best = (sc, R_)
    P = best[1]
    T, _ = fitter(P, W, H, pad=10)
    Q = [T(p) for p in P]
    f = Fig(W, H)
    f.poly(Q, sw=1.5)
    n = 4
    for i in range(n):
        v, p, q = Q[i], Q[(i + 1) % n], Q[(i - 1) % n]
        uu, ww = unit(v, p), unit(v, q)
        got = math.degrees(math.acos(max(-1, min(1, uu[0] * ww[0] + uu[1] * ww[1]))))
        assert abs(got - angles[i]) < 0.6, (i, got, angles[i])
        _angle(f, v, p, q, labs[i], r=18, size=FS)
    return recolour(f.svg())


def ext_angle(A, C, labs, W=300, H=118):
    """Triangle with base angle A at the left, apex angle C, and the base produced to
    the right; the exterior angle there is marked. labs = (at A, at apex, exterior)."""
    B = 180 - A - C
    P0, P1, P2 = bdia.tri_pts(A, B, base=1.0)
    E = (1.42, 0.0)
    T, _ = fitter([P0, P1, P2, E], W, H, pad=12)
    a, b, c, e = T(P0), T(P1), T(P2), T(E)
    f = Fig(W, H)
    f.poly([a, b, c], sw=1.5)
    f.line(b, e, bdia.OUT, 1.5)
    _angle(f, a, b, c, labs[0], r=19)
    _angle(f, c, a, b, labs[1], r=19)
    _angle(f, b, e, c, labs[2], r=16)
    return recolour(f.svg())


def parallelogram(base, height, off, labs, W=300, H=118):
    """Parallelogram on a horizontal base, dashed perpendicular height from the top-left
    vertex. labs = (base label, height label)."""
    A, B, C, D = (0, 0), (base, 0), (base + off, height), (off, height)
    T, _ = fitter([A, B, C, D], W, H, pad=16, padx=22)
    a, b, c, d = T(A), T(B), T(C), T(D)
    ft = T((off, 0))
    f = Fig(W, H)
    f.poly([a, b, c, d], sw=1.5)
    f.line(d, ft, bdia.OUT, 1.2, dash="4 3")
    f.right_angle(ft, b, d, s=7)
    _lab(f, a, b, labs[0], centroid([a, b, c, d]))
    f.text((ft[0] + 7, (d[1] + ft[1]) / 2), labs[1], size=FS, anchor="start")
    return recolour(f.svg())


def circle_d(label, R=46, W=150, H=112):
    """Circle with a labelled diameter."""
    f = Fig(W, H)
    c = (W / 2, H / 2)
    f.circle(c, R, sw=1.5)
    f.line((c[0] - R, c[1]), (c[0] + R, c[1]), bdia.OUT, 1.5)
    f.dot(c, r=2.4, fill=bdia.INK)
    f.text((c[0], c[1] - 10), label, size=FS)
    return recolour(f.svg())


def semicircle(label, R=64, W=190, H=100, t=58):
    """Semicircle on its diameter with a radius drawn to the arc (t degrees)."""
    f = Fig(W, H)
    c = (W / 2, H - 14)
    f.path(f"M{_f(c[0] - R)},{_f(c[1])} A{R},{R} 0 0,1 {_f(c[0] + R)},{_f(c[1])} Z", fill=FILL, sw=1.5)
    f._ext(c[0] - R, c[1] - R)
    f._ext(c[0] + R, c[1] + 2)
    e = (c[0] + R * math.cos(math.radians(t)), c[1] - R * math.sin(math.radians(t)))
    f.line(c, e, bdia.OUT, 1.5)
    f.dot(c, r=2.4, fill=bdia.INK)
    m = ((c[0] + e[0]) / 2, (c[1] + e[1]) / 2)
    # right-aligned just left of the radius, in the wide part of the semicircle
    f.text((m[0] - 9, m[1] - 2), label, size=FS, anchor="end")
    return recolour(f.svg())


def polygon(n, W=300, H=122, rot=None):
    """Regular n-gon with every interior angle marked."""
    rot = (90 + 180 / n) if rot is None else rot
    P = [(math.cos(math.radians(rot + 360 * k / n)), math.sin(math.radians(rot + 360 * k / n)))
         for k in range(n)]
    T, _ = fitter(P, W, H, pad=6)
    Q = [T(p) for p in P]
    f = Fig(W, H)
    f.poly(Q, sw=1.5)
    for i in range(n):
        f.arc(Q[i], Q[(i + 1) % n], Q[(i - 1) % n], r=11, color=bdia.OUT)
    return recolour(f.svg())


def _inside_convex(box, poly, margin):
    """True if every corner of box (x0, y0, x1, y1) is inside the convex polygon by >= margin px."""
    x0, y0, x1, y1 = box
    n = len(poly)
    cx = sum(p[0] for p in poly) / n
    cy = sum(p[1] for p in poly) / n
    for i in range(n):
        (ax, ay), (bx, by) = poly[i], poly[(i + 1) % n]
        ex, ey = bx - ax, by - ay
        L = math.hypot(ex, ey)
        nx, ny = -ey / L, ex / L
        if (cx - ax) * nx + (cy - ay) * ny < 0:
            nx, ny = -nx, -ny
        for x, y in ((x0, y0), (x1, y0), (x0, y1), (x1, y1)):
            if (x - ax) * nx + (y - ay) * ny < margin:
                return False
    return True


def kite(left, right, half_h, labs, W=300, H=128):
    """Kite (rhombus when left == right) with its long diagonal horizontal, both diagonals
    dashed. labs = (horizontal diagonal label, vertical diagonal label). Each label goes to the
    first spot (preferred quarter first) where its whole box sits inside the shape, clear of
    the right-angle mark and of the other label."""
    P = [(-left, 0), (0, half_h), (right, 0), (0, -half_h)]
    T, _ = fitter(P, W, H, pad=6, padx=30)
    Q = [T(p) for p in P]
    o = T((0, 0))
    f = Fig(W, H)
    f.poly(Q, sw=1.5)
    f.line(Q[0], Q[2], bdia.OUT, 1.2, dash="4 3")
    f.line(Q[1], Q[3], bdia.OUT, 1.2, dash="4 3")
    f.right_angle(o, Q[2], Q[1], s=7)
    th = 0.78 * FS

    def tw(t):
        return 0.6 * FS * len(t)

    def apart(b1, b2, m=2.5):
        return b1[2] + m < b2[0] or b2[2] + m < b1[0] or b1[3] + m < b2[1] or b2[3] + m < b1[1]
    # long (horizontal) diagonal label: below it on the right first, then the other quarters
    w1 = tw(labs[0])
    long_box = None
    for side, end in ((1, Q[2]), (-1, Q[0])):
        for vert in (1, -1):
            for fx in [0.55 - i / 40 for i in range(0, 15)]:
                cx = o[0] + fx * (end[0] - o[0])
                y0 = o[1] + 3.5 if vert > 0 else o[1] - 3.5 - th
                box = (cx - w1 / 2, y0, cx + w1 / 2, y0 + th)
                clear = box[0] > o[0] + 9 if side > 0 else box[2] < o[0] - 9
                if clear and _inside_convex(box, Q, 3.0):
                    long_box = box
                    break
            if long_box:
                break
        if long_box:
            break
    assert long_box, "no room for the long-diagonal label"
    f.text(((long_box[0] + long_box[2]) / 2, (long_box[1] + long_box[3]) / 2), labs[0], size=FS)
    # short (vertical) diagonal label: beside it, upper-right first
    w2 = tw(labs[1])
    short = None
    for side in (1, -1):
        for vert in (-1, 1):
            tip = Q[1] if vert < 0 else Q[3]
            for fy in [0.55 - i / 40 for i in range(0, 15)]:
                cy = o[1] + fy * (tip[1] - o[1])
                x0 = o[0] + 5 if side > 0 else o[0] - 5 - w2
                box = (x0, cy - th / 2, x0 + w2, cy + th / 2)
                clear = box[3] < o[1] - 9 if vert < 0 else box[1] > o[1] + 9
                if clear and _inside_convex(box, Q, 3.0) and apart(box, long_box):
                    short = (box, side)
                    break
            if short:
                break
        if short:
            break
    assert short, "no room for the short-diagonal label"
    box, side = short
    if side > 0:
        f.text((box[0], (box[1] + box[3]) / 2), labs[1], size=FS, anchor="start")
    else:
        f.text((box[2], (box[1] + box[3]) / 2), labs[1], size=FS, anchor="end")
    return recolour(f.svg())


def tri_prism(a, b, L, labs, W=300, H=118, k=0.58, ang=22):
    """Right-angled triangular prism lying along its length: front face has the right angle
    at the bottom-left, legs a (base) and b (height). labs = (a, b, hypotenuse, length)."""
    face = [(0, 0), (a, 0), (0, b)]
    off = (k * L * math.cos(math.radians(ang)), k * L * math.sin(math.radians(ang)))
    back = [(x + off[0], y + off[1]) for x, y in face]
    T, _ = fitter(face + back, W, H, pad=12, padx=34)
    Fq, Bq = [T(p) for p in face], [T(p) for p in back]
    f = Fig(W, H)
    # faces: sloping top (hypotenuse), bottom-right rectangle is hidden, right side = base rectangle
    f.poly([Fq[1], Bq[1], Bq[2], Fq[2]], fill=bdia.SOFT2, sw=1.5)       # sloping face
    f.poly(Fq, fill=FILL, sw=1.5)                                         # front triangle
    f.line(Fq[0], Bq[0], bdia.OUT, 1.1, dash="4 3")                      # hidden edges
    f.line(Bq[0], Bq[1], bdia.OUT, 1.1, dash="4 3")
    f.line(Bq[0], Bq[2], bdia.OUT, 1.1, dash="4 3")
    f.right_angle(Fq[0], Fq[1], Fq[2], s=7)
    cF = centroid(Fq)
    _lab(f, Fq[0], Fq[1], labs[0], cF)                                   # base
    _lab(f, Fq[2], Fq[0], labs[1], cF)                                   # height
    mx, my = (Fq[1][0] + Fq[2][0]) / 2, (Fq[1][1] + Fq[2][1]) / 2        # hypotenuse, on the sloping face
    ux, uy = unit(Fq[1], Fq[2])
    nx, ny = uy, -ux
    if (cF[0] - mx) * nx + (cF[1] - my) * ny > 0:
        nx, ny = -nx, -ny
    lx, ly = mx + 19 * nx, my + 19 * ny
    tw = 0.6 * FS * len(labs[2])
    f.rect(lx - tw / 2 - 2, ly - 8, tw + 4, 16, fill=bdia.SOFT2, stroke="none", sw=0, rx=2)
    f.text((lx, ly), labs[2], size=FS)
    bx, by = (Fq[1][0] + Bq[1][0]) / 2, (Fq[1][1] + Bq[1][1]) / 2        # length
    f.text((bx + 6, by + 12), labs[3], size=FS, anchor="start")
    return recolour(f.svg())


def similar_rects(small, big, labs, W=300, H=112, names=("Original", "Image")):
    """Two similar rectangles side by side; the matching lengths are labelled."""
    (sl, sw), (bl, bw) = small, big
    gap = 1.6
    P = [(0, 0), (sl, sw), (sl + gap, 0), (sl + gap + bl, bw)]
    T, s = fitter(P, W, H, pad=18, padx=8)
    f = Fig(W, H)
    x0 = 0.0
    for (l, w), lab, nm in zip((small, big), labs, names):
        a, b = T((x0, 0)), T((x0 + l, w))
        f.rect(a[0], b[1], b[0] - a[0], a[1] - b[1], sw=1.5)
        f.text(((a[0] + b[0]) / 2, b[1] - 9), lab, size=FS)
        f.text(((a[0] + b[0]) / 2, a[1] + 12), nm, size=FS - 1.5, color=bdia.MUTED)
        x0 += l + gap
    return recolour(f.svg())


def dice_row(W=300, H=52, s=32, gap=12):
    """The six faces of a die, in order."""
    PIPS = {1: [(0, 0)], 2: [(-1, -1), (1, 1)], 3: [(-1, -1), (0, 0), (1, 1)],
            4: [(-1, -1), (1, -1), (-1, 1), (1, 1)], 5: [(-1, -1), (1, -1), (0, 0), (-1, 1), (1, 1)],
            6: [(-1, -1), (1, -1), (-1, 0), (1, 0), (-1, 1), (1, 1)]}
    Wt = 6 * s + 5 * gap
    f = Fig(Wt + 8, H)
    y0 = 4
    for i in range(6):
        x = 4 + i * (s + gap)
        f.rect(x, y0, s, s, sw=1.5, rx=5)
        cx, cy = x + s / 2, y0 + s / 2
        for px, py in PIPS[i + 1]:
            f.dot((cx + px * s * 0.26, cy + py * s * 0.26), r=2.9, fill=bdia.INK)
    return recolour(f.svg())


def rect(l, w, labs, W=300, H=112):
    """Rectangle with its length (below) and width (right) labelled."""
    T, _ = fitter([(0, 0), (l, w)], W, H, pad=16, padx=46)
    a, b = T((0, 0)), T((l, w))
    f = Fig(W, H)
    f.rect(a[0], b[1], b[0] - a[0], a[1] - b[1], sw=1.5)
    f.right_angle(a, (b[0], a[1]), (a[0], b[1]), s=7)
    f.text(((a[0] + b[0]) / 2, a[1] + 13), labs[0], size=FS)
    f.text((b[0] + 7, (a[1] + b[1]) / 2), labs[1], size=FS, anchor="start")
    return recolour(f.svg())
