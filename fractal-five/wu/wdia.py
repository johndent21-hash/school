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


def _k(lab):
    """Text style for a figure label: a label holding a pronumeral (<i>) is the unknown and is set
    in bold deeper blue; every other label stays charcoal (so existing figures are unchanged)."""
    return {"color": bdia.BLUE, "weight": 700} if "<i>" in str(lab) else {"color": bdia.INK}


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
def tri_height(base, apex_x, height, base_lab, h_lab, W=300, H=124, clear=False):
    """Triangle on a horizontal base with its perpendicular height dashed.
    clear=True (generated weeks): the height label goes to the first spot beside the dashed line,
    mid-height first, then lower down or on the other side, that keeps clear of every side; the
    default keeps the original placement (the approved Week 1 figures)."""
    A, B, C, Ft = (0, 0), (base, 0), (apex_x, height), (apex_x, 0)
    T, _ = fitter([A, B, C], W, H, pad=15)
    a, b, c, ft = T(A), T(B), T(C), T(Ft)
    f = Fig(W, H)
    f.poly([a, b, c], sw=1.5)
    f.line(c, ft, bdia.OUT, 1.2, dash="4 3")
    f.right_angle(ft, b, c, s=7)
    _lab(f, a, b, base_lab, c, "<i>" in base_lab)
    if not clear:
        f.text((ft[0] + 7, (c[1] + ft[1]) / 2), h_lab, size=FS, anchor="start", **_k(h_lab))
        return recolour(f.svg())
    room = _Room(margin=4.0)
    for p, q in ((a, b), (b, c), (c, a), (c, ft)):
        room.seg(p, q)
    room.seg((ft[0], ft[1] - 7), (ft[0] + 7, ft[1] - 7))
    room.seg((ft[0] + 7, ft[1] - 7), (ft[0] + 7, ft[1]))
    tw, th = 0.6 * FS * len(re.sub(r"<[^>]+>", "", h_lab)), 0.78 * FS
    for side, fy in ((1, 0.5), (1, 0.42), (1, 0.35), (-1, 0.5), (-1, 0.42), (-1, 0.35), (1, 0.28), (-1, 0.28)):
        y = ft[1] + fy * (c[1] - ft[1])
        x0 = ft[0] + 7 if side > 0 else ft[0] - 7 - tw
        if room.ok((x0, y - th / 2, x0 + tw, y + th / 2)):
            f.text((ft[0] + 7 * side, y), h_lab, size=FS, anchor="start" if side > 0 else "end", **_k(h_lab))
            return recolour(f.svg())
    raise AssertionError("no clear spot for the height label")


def trapezium(bottom, top, height, top_x, labs, W=300, H=118, clear=False):
    """Trapezium with parallel sides horizontal; dashed height from the top-left vertex.
    labs = (top label, bottom label, height label). clear=True (generated weeks) slides each
    parallel-side arrow along its side until it is clear of the side's label and the dashed height;
    the default keeps the arrows mid-side (the approved Week 1 figures)."""
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
    room = _Room(margin=3.0, gap=3.0)
    if clear:
        room.seg(d, ft)
        room.seg((ft[0], ft[1] - 7), (ft[0] + 7, ft[1] - 7))
        room.seg((ft[0] + 7, ft[1] - 7), (ft[0] + 7, ft[1]))
        for p, q, lab_, sgn in ((d, c, labs[0], -1), (a, b, labs[1], 1)):    # as side_label places them
            room.take(_tbox(((p[0] + q[0]) / 2, p[1] + 9 * sgn), lab_))
    for p, q in ((d, c), (a, b)):
        for t in ((0.5,) if not clear else (0.5, 0.64, 0.36, 0.74, 0.26, 0.82, 0.18, 0.88, 0.12, 0.92, 0.08)):
            mx = p[0] + t * (q[0] - p[0])
            ok = mx - 3 > p[0] + 5 and mx + 2.5 < q[0] - 5 and room.ok((mx - 4, p[1] - 4.2, mx + 3.5, p[1] + 4.2))
            if not clear or ok:
                break
        else:
            raise AssertionError("no clear spot for a parallel-side arrow")
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
    f.text((x, c[1] - 9), label, size=FS, **_k(label))
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
    f.text(((Q["A"][0] + Q["B"][0]) / 2, Q["A"][1] + 13), L, size=FS, **_k(L))
    mx, my = (Q["B"][0] + Q["F"][0]) / 2, (Q["B"][1] + Q["F"][1]) / 2
    f.text((mx + 7, my + 6), Wd, size=FS, anchor="start", **_k(Wd))
    f.text((Q["A"][0] - 7, (Q["A"][1] + Q["D"][1]) / 2), Hd, size=FS, anchor="end", **_k(Hd))
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
    f.text((mx + 6, my + 11), len_lab, size=FS, anchor="start", **_k(len_lab))
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
    f.text((cx + rx + 7, top - 1), r_lab, size=FS, anchor="start", **_k(r_lab))
    f.text((cx + rx + 7, (top + bot) / 2 + ry / 2), h_lab, size=FS, anchor="start", **_k(h_lab))
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
def plane_line(p1, p2, names=("A", "B"), xr=(0, 4), yr=(0, 5), u=17, W=None, H=None, clear=False):
    """Small first-quadrant number plane with a line through two labelled points.
    clear=True (generated weeks): an axis number beside a point that sits on that axis moves out a
    little, clear of the point's dot."""
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
    on_x = {px for px, py in (p1, p2) if py == y0} if clear else set()
    on_y = {py for px, py in (p1, p2) if px == x0} if clear else set()
    for gx in range(x0 + 1, x1 + 1):
        f.text((X(gx), Y(y0) + (12 if gx in on_x else 9)), str(gx), size=9.5, color=MUTED)
    for gy in range(y0 + 1, y1 + 1):
        f.text((X(x0) - (10.5 if gy in on_y else 7), Y(gy)), str(gy), size=9.5, color=MUTED)
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
    f.text(((xa + xb) / 2, y - 12), dist_lab, size=FS + 1, **_k(dist_lab))
    f.text(((xa + xb) / 2, y + 15), time_lab, size=FS + 1, **_k(time_lab))
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
    _lab(f, a, b, labs[0], centroid([a, b, c, d]), "<i>" in labs[0])
    f.text((ft[0] + 7, (d[1] + ft[1]) / 2), labs[1], size=FS, anchor="start", **_k(labs[1]))
    return recolour(f.svg())


def circle_d(label, R=46, W=150, H=112):
    """Circle with a labelled diameter."""
    f = Fig(W, H)
    c = (W / 2, H / 2)
    f.circle(c, R, sw=1.5)
    f.line((c[0] - R, c[1]), (c[0] + R, c[1]), bdia.OUT, 1.5)
    f.dot(c, r=2.4, fill=bdia.INK)
    f.text((c[0], c[1] - 10), label, size=FS, **_k(label))
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
    f.text(((a[0] + b[0]) / 2, a[1] + 13), labs[0], size=FS, **_k(labs[0]))
    f.text((b[0] + 7, (a[1] + b[1]) / 2), labs[1], size=FS, anchor="start", **_k(labs[1]))
    return recolour(f.svg())


# ======================================================== angle relationships ==
# Every label in these figures is placed by _Room: the figure registers each line, arc and
# arrowhead it draws, and a label only goes where its whole box keeps a clear margin from all
# of them and from every other label (AssertionError if no such spot exists).
def _pt_box(p, b):
    dx = max(b[0] - p[0], 0.0, p[0] - b[2])
    dy = max(b[1] - p[1], 0.0, p[1] - b[3])
    return math.hypot(dx, dy)


def _pt_seg(p, a, b):
    ax, ay = b[0] - a[0], b[1] - a[1]
    L2 = ax * ax + ay * ay
    t = 0.0 if L2 == 0 else max(0.0, min(1.0, ((p[0] - a[0]) * ax + (p[1] - a[1]) * ay) / L2))
    return math.hypot(p[0] - a[0] - t * ax, p[1] - a[1] - t * ay)


def _cross(a, b, c, d):
    def o(p, q, r):
        return (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])
    return o(a, b, c) * o(a, b, d) < 0 and o(c, d, a) * o(c, d, b) < 0


def _seg_box(a, b, box):
    """Distance between segment ab and box (x0, y0, x1, y1); 0 if they meet."""
    if _pt_box(a, box) == 0 or _pt_box(b, box) == 0:
        return 0.0
    x0, y0, x1, y1 = box
    cs = [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]
    if any(_cross(a, b, cs[i], cs[(i + 1) % 4]) for i in range(4)):
        return 0.0
    return min([_pt_box(a, box), _pt_box(b, box)] + [_pt_seg(c, a, b) for c in cs])


def _tbox(c, lab, size=FS):
    """Conservative box of a centred label (Open Sans: digits ~0.57 em, so 0.6 em per character)."""
    tw, th = 0.6 * size * len(re.sub(r"<[^>]+>", "", lab)), 0.78 * size
    return (c[0] - tw / 2, c[1] - th / 2, c[0] + tw / 2, c[1] + th / 2)


class _Room:
    def __init__(self, margin=4.5, gap=4.0):
        self.segs, self.boxes, self.m, self.gap = [], [], margin, gap

    def seg(self, p, q):
        self.segs.append((p, q))

    def arc(self, c, r, t0, t1, n=40):
        """Arc of radius r about c from screen angle t0 to t1 (radians, either direction)."""
        pts = [(c[0] + r * math.cos(t0 + (t1 - t0) * k / n), c[1] + r * math.sin(t0 + (t1 - t0) * k / n))
               for k in range(n + 1)]
        for p, q in zip(pts, pts[1:]):
            self.seg(p, q)

    def ok(self, box):
        if any(_seg_box(a, b, box) < self.m for a, b in self.segs):
            return False
        g = self.gap
        return all(box[2] + g < o[0] or o[2] + g < box[0] or box[3] + g < o[1] or o[3] + g < box[1]
                   for o in self.boxes)

    def take(self, box):
        self.boxes.append(box)


def _screen_angle(p, q):
    return math.atan2(q[1] - p[1], q[0] - p[0])


def _wedge_mark(f, room, V, t1, t2, lab, r=17, right=False, Lmax=110, others=()):
    """Mark the angle at V swept anticlockwise ON THE PAGE from direction t1 to t2 (math angles in
    degrees, y up), which may be reflex. Draws the arc (or a right-angle square), then puts the
    label on the bisector, as close to V as the room allows. Returns the label centre.
    others: other vertices in the figure; the label must sit clearly nearer V than any of them,
    so it cannot be read as belonging to another crossing."""
    unknown = "<i>" in lab
    col = bdia.BLUE if unknown else bdia.OUT
    sweep = (t2 - t1) % 360
    a1, a2 = math.radians(t1), math.radians(t1 + sweep)
    P1 = (V[0] + r * math.cos(a1), V[1] - r * math.sin(a1))
    P2 = (V[0] + r * math.cos(a2), V[1] - r * math.sin(a2))
    if right:
        s = 8
        u1 = (math.cos(a1), -math.sin(a1))
        u2 = (math.cos(a2), -math.sin(a2))
        A = (V[0] + s * u1[0], V[1] + s * u1[1])
        B = (A[0] + s * u2[0], A[1] + s * u2[1])
        C = (V[0] + s * u2[0], V[1] + s * u2[1])
        f.poly([A, B, C], close=False, stroke=bdia.OUT, sw=1.0)
        room.seg(A, B)
        room.seg(B, C)
        rr = s * 1.5
    else:
        big = 1 if sweep > 180 else 0
        # screen y is down, so an anticlockwise sweep on the page is sweep-flag 0
        f.path(f"M{_f(P1[0])},{_f(P1[1])} A{r},{r} 0 {big} 0 {_f(P2[0])},{_f(P2[1])}", stroke=col, sw=1.1)
        for k in range(25):
            t = a1 + (a2 - a1) * k / 24
            f._ext(V[0] + r * math.cos(t), V[1] - r * math.sin(t))
        room.arc(V, r, -a1, -a2)
        rr = r
    if not lab:
        return None
    mid = math.radians(t1 + sweep / 2)
    half = math.radians(sweep / 2)
    # try the bisector first, then directions fanning out towards the arms
    for frac_ in (0, 0.2, -0.2, 0.4, -0.4, 0.55, -0.55):
        th = mid + frac_ * half
        d = (math.cos(th), -math.sin(th))
        L = rr + 5
        while L < Lmax:
            c = (V[0] + L * d[0], V[1] + L * d[1])
            box = _tbox(c, lab)
            near = all(math.hypot(c[0] - o[0], c[1] - o[1]) > math.hypot(c[0] - V[0], c[1] - V[1]) + 12
                       for o in others)
            if near and room.ok(box):
                room.take(box)
                f.text(c, lab, size=FS, color=bdia.BLUE if unknown else bdia.INK, weight=700 if unknown else None)
                return c
            L += 0.5
    raise AssertionError(f"no clear spot for angle label {lab!r}")


def _check_deg(lab, value):
    m = re.fullmatch(r"(\d+(?:\.\d+)?)°", re.sub(r"<[^>]+>", "", lab))
    if m:
        assert abs(float(m.group(1)) - value) < 0.01, (lab, value)


def _dir(t):
    """Unit vector on the page for math angle t (degrees, anticlockwise, y up)."""
    return math.cos(math.radians(t)), -math.sin(math.radians(t))


def angles_line(parts, labs, W=300, H=124, below=False):
    """Angles on a straight line: a horizontal line through O with rays drawn at the exact
    cumulative angles. parts (degrees, summing to 180) are measured from the right-hand arm,
    anticlockwise (clockwise if below). labs = one label per part."""
    assert abs(sum(parts) - 180) < 1e-9 and len(parts) == len(labs)
    half = W / 2 - 8
    rho = min(H - 26, 0.78 * half)
    O = (W / 2, H - 13) if not below else (W / 2, 13)
    sg = -1 if below else 1
    f = Fig(W, H)
    room = _Room()
    E1, E2 = (O[0] + half, O[1]), (O[0] - half, O[1])
    f.line(E2, E1, bdia.OUT, 1.5)
    room.seg(E2, E1)
    cum = [0.0]
    for a in parts:
        cum.append(cum[-1] + a)
    for t in cum[1:-1]:
        u = _dir(sg * t)
        P = (O[0] + rho * u[0], O[1] + rho * u[1])
        f.line(O, P, bdia.OUT, 1.5)
        room.seg(O, P)
    f.dot(O, r=2.4, fill=bdia.INK)
    for i, (a, lab) in enumerate(zip(parts, labs)):
        _check_deg(lab, a)
        t1, t2 = (cum[i], cum[i + 1]) if not below else (-cum[i + 1], -cum[i])
        _wedge_mark(f, room, O, t1, t2, lab, r=17 if a >= 35 else 24)
    return recolour(f.svg())


def angles_point(parts, labs, W=300, H=124, rot=90):
    """Angles at a point: rays from O at the exact cumulative angles (starting at math angle rot),
    reaching out to an ellipse that fits the cell. parts sum to 360, each under 180."""
    assert abs(sum(parts) - 360) < 1e-9 and all(a < 180 for a in parts)
    b = H / 2 - 4
    a_ = min(W / 2 - 8, 1.9 * b)
    O = (W / 2, H / 2)
    f = Fig(W, H)
    room = _Room()
    cum = [rot]
    for a in parts[:-1]:
        cum.append(cum[-1] + a)
    for t in cum:
        u = _dir(t)
        rho = 1 / math.sqrt((u[0] / a_) ** 2 + (u[1] / b) ** 2)
        P = (O[0] + rho * u[0], O[1] + rho * u[1])
        f.line(O, P, bdia.OUT, 1.5)
        room.seg(O, P)
    f.dot(O, r=2.4, fill=bdia.INK)
    for i, (a, lab) in enumerate(zip(parts, labs)):
        _check_deg(lab, a)
        _wedge_mark(f, room, O, cum[i], cum[i] + a, lab, r=15 if a >= 40 else 22)
    return recolour(f.svg())


def vert_opp(theta, labs, W=300, H=124, tilt=0):
    """Two straight lines crossing at O. The angle theta between them is marked on the right and
    its vertically opposite angle on the left. labs = (right label, left label)."""
    b = H / 2 - 4
    a_ = min(W / 2 - 8, 2.2 * b)
    O = (W / 2, H / 2)
    d1, d2 = tilt - theta / 2, tilt + theta / 2
    f = Fig(W, H)
    room = _Room()
    for t in (d1, d2):
        u = _dir(t)
        rho = 1 / math.sqrt((u[0] / a_) ** 2 + (u[1] / b) ** 2)
        P, Q_ = (O[0] + rho * u[0], O[1] + rho * u[1]), (O[0] - rho * u[0], O[1] - rho * u[1])
        f.line(Q_, P, bdia.OUT, 1.5)
        room.seg(Q_, P)
    f.dot(O, r=2.4, fill=bdia.INK)
    for lab in labs:
        _check_deg(lab, theta)
    r = 16 if theta >= 40 else 24
    _wedge_mark(f, room, O, d1, d2, labs[0], r=r)
    _wedge_mark(f, room, O, d1 + 180, d2 + 180, labs[1], r=r)
    return recolour(f.svg())


# quadrant of an angle at a crossing: arms (horizontal direction, transversal direction)
_QUAD = {"UR": (0, "up"), "UL": (180, "up"), "LL": (180, "down"), "LR": (0, "down")}


def par_angle(theta, quad):
    """Size of the angle in quadrant quad where a transversal at theta degrees meets a horizontal line."""
    return theta if quad in ("UR", "LL") else 180 - theta


def parallel(theta, marks, W=300, H=126):
    """Two horizontal parallel lines (arrowheads) cut by a transversal at theta degrees to the
    right-hand direction. marks = [(vertex 'T' or 'B', quadrant 'UR'/'UL'/'LL'/'LR', label), ...];
    every numeric label is checked against the drawn angle."""
    g = 60.0                                  # gap between the parallel lines
    s_ = math.sin(math.radians(theta))
    ext = (H - 4 - g) / 2 / s_                # transversal runs this far past each line
    dx = g / math.tan(math.radians(theta))    # horizontal offset from B up to T
    yT, yB = (H - g) / 2, (H + g) / 2
    xB = W / 2 - dx / 2
    T, B = (xB + dx, yT), (xB, yB)
    u = _dir(theta)
    top = (T[0] + ext * u[0], T[1] + ext * u[1])
    bot = (B[0] - ext * u[0], B[1] - ext * u[1])
    f = Fig(W, H)
    room = _Room()
    for y in (yT, yB):
        f.line((6, y), (W - 6, y), bdia.OUT, 1.5)
        room.seg((6, y), (W - 6, y))
    f.line(bot, top, bdia.OUT, 1.5)
    room.seg(bot, top)
    V = {"T": T, "B": B}
    for vx, quad, lab in marks:
        _check_deg(lab, par_angle(theta, quad))
        hz, tr = _QUAD[quad]
        td = theta if tr == "up" else theta + 180
        # the wedge between the horizontal arm and the transversal arm, swept anticlockwise
        a, b_ = (hz, td) if (td - hz) % 360 < 180 else (td, hz)
        _wedge_mark(f, room, V[vx], a, b_, lab, r=16 if par_angle(theta, quad) >= 40 else 23,
                    others=[V[o] for o in "TB" if o != vx])
    # arrowheads: both lines, same direction, on the side away from the transversal, clear of labels
    mid = (T[0] + B[0]) / 2
    xs = [W * k / 40 for k in range(3, 38)]
    xs.sort(key=lambda x: -abs(x - mid))
    for x in xs:
        heads = []
        for y in (yT, yB):
            tip = (x + 2.6, y)
            heads.append([(x - 2.6, y - 3.4), tip, (x - 2.6, y + 3.4)])
        hb = [(min(p[0] for p in h) - 1, min(p[1] for p in h) - 1, max(p[0] for p in h) + 1, max(p[1] for p in h) + 1)
              for h in heads]
        # (each arrowhead sits on its own line, so it is checked against the labels and transversal only)
        lab_room = _Room(margin=6, gap=4)
        lab_room.boxes = room.boxes
        lab_room.seg(bot, top)
        if all(lab_room.ok(b) for b in hb) and all(abs(x - V[v][0]) > 28 for v in "TB"):
            for h in heads:
                f.poly(h, close=False, stroke=bdia.OUT, sw=1.3)
            break
    else:
        raise AssertionError("no clear spot for the parallel arrowheads")
    return recolour(f.svg())


def sector(theta, r_lab, W=300, H=118, Rmax=118):
    """Sector of angle theta degrees, to scale, with the angle marked at the centre (a square for
    90 degrees) and the radius labelled beside one straight edge, outside the sector."""
    best = None
    for p0 in (0, 90, 180, 270, 90 - theta / 2, 270 - theta / 2, -theta / 2):
        ts = [p0 + theta * k / 60 for k in range(61)]
        pts = [(0.0, 0.0)] + [(math.cos(math.radians(t)), math.sin(math.radians(t))) for t in ts]
        w = max(p[0] for p in pts) - min(p[0] for p in pts)
        h = max(p[1] for p in pts) - min(p[1] for p in pts)
        R = min((W - 70) / w, (H - 14) / h, Rmax)
        score = R + (6 if p0 == 0 else 0)
        if best is None or score > best[0] + 1e-9:
            best = (score, R, p0, pts)
    _, R, p0, pts = best
    x0 = min(p[0] for p in pts)
    y1 = max(p[1] for p in pts)
    w = max(p[0] for p in pts) - x0
    h = y1 - min(p[1] for p in pts)
    O = (W / 2 - (x0 + w / 2) * R, H / 2 + (y1 - h / 2) * R)
    E1 = (O[0] + R * math.cos(math.radians(p0)), O[1] - R * math.sin(math.radians(p0)))
    E2 = (O[0] + R * math.cos(math.radians(p0 + theta)), O[1] - R * math.sin(math.radians(p0 + theta)))
    big = 1 if theta > 180 else 0
    f = Fig(W, H)
    room = _Room()
    f.path(f"M{_f(O[0])},{_f(O[1])} L{_f(E1[0])},{_f(E1[1])} A{_f(R)},{_f(R)} 0 {big} 0 "
           f"{_f(E2[0])},{_f(E2[1])} Z", fill=FILL, sw=1.5)
    for k in range(61):
        t = math.radians(p0 + theta * k / 60)
        f._ext(O[0] + R * math.cos(t), O[1] - R * math.sin(t), 1)
    f._ext(*O)
    room.seg(O, E1)
    room.seg(O, E2)
    room.arc(O, R, -math.radians(p0), -math.radians(p0 + theta), n=80)
    f.dot(O, r=2.4, fill=bdia.INK)
    # radius label first: beside the edge whose outward side has room, mid-way along it
    placed = False
    for E, side in ((E1, -1), (E2, 1)):
        ux, uy = unit(O, E)
        nx, ny = side * uy, -side * ux               # outward normal (away from the sector)
        for t in (0.5, 0.6, 0.4, 0.7):
            for off in (9, 11, 13, 15):
                mx, my = O[0] + t * (E[0] - O[0]), O[1] + t * (E[1] - O[1])
                tw = 0.6 * FS * len(re.sub(r"<[^>]+>", "", r_lab))
                k = off + 0.5 * tw * abs(nx) + 0.39 * FS * abs(ny)
                c = (mx + k * nx, my + k * ny)
                box = _tbox(c, r_lab)
                if room.ok(box):
                    room.take(box)
                    f.text(c, r_lab, size=FS, **_k(r_lab))
                    placed = True
                    break
            if placed:
                break
        if placed:
            break
    assert placed, "no clear spot for the radius label"
    if abs(theta - 90) < 1e-9:
        _wedge_mark(f, room, O, p0, p0 + theta, "", right=True)
    else:
        _wedge_mark(f, room, O, p0, p0 + theta, f"{nfmt(theta)}°", r=17 if theta >= 40 else 26,
                    Lmax=R - 4)
    return recolour(f.svg())


def nfmt(v):
    return str(int(v)) if abs(v - round(v)) < 1e-9 else f"{v:g}"
