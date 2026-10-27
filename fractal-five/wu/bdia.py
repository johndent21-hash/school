# -*- coding: utf-8 -*-
"""SVG diagram library for the Year 9 ADVANCED revision booklets.

Neon recolour of the test-set library: violet outlines, white fill, magenta for
anything the question points at, labels in Source Sans 3.

Every label passes through _txt(), which turns <i>, <b>, <sup>, <sub> into
<tspan> runs. (Raw HTML tags inside <svg> are HTML5 breakout tags and close the
SVG early, so nothing goes in raw.)

Fig is a coordinate-based builder: shapes are drawn from their real
coordinates and every angle arc, right-angle mark and side label is computed
from the same points, so a diagram cannot disagree with its own numbers.
"""
import math
import re

INK, FILL, BLUE, MUTED = "#2E2B36", "#FFFFFF", "#D81B8F", "#726C85"
OUT = "#5A2BE6"
SOFT, SOFT2, GRID, BLUEF = "#ECE8FA", "#F5F3FD", "#DDD8E8", "#FBE3F3"
CORAL = "#FF2E88"
FS = 12
GEO = 1.3          # geometry scale inside every fitted figure (labels keep their size)
FONT = "SS3, 'Source Sans 3', 'OS', sans-serif"

_TOK = re.compile(r"(</?(?:i|b|sup|sub)>)")


def _esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def _txt(s):
    """Label markup -> SVG tspans with explicit baseline shifts."""
    s = str(s)
    out, it, bo, sh = [], False, False, 0
    for tok in _TOK.split(s):
        if not tok:
            continue
        if tok == "<i>":
            it = True
        elif tok == "</i>":
            it = False
        elif tok == "<b>":
            bo = True
        elif tok == "</b>":
            bo = False
        elif tok == "<sup>":
            sh = 1
        elif tok == "<sub>":
            sh = -1
        elif tok in ("</sup>", "</sub>"):
            sh = 0
        else:
            t = tok.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
            a = []
            if it:
                a.append('font-style="italic"')
            if bo:
                a.append('font-weight="700"')
            if sh == 1:
                a.append('baseline-shift="super" font-size="70%"')
            elif sh == -1:
                a.append('baseline-shift="sub" font-size="70%"')
            out.append(f'<tspan {" ".join(a)}>{_esc(t)}</tspan>' if a else _esc(t))
    return "".join(out)


def _f(x):
    return f"{x:.2f}".rstrip("0").rstrip(".")


def unit(p, q):
    dx, dy = q[0] - p[0], q[1] - p[1]
    L = math.hypot(dx, dy) or 1.0
    return dx / L, dy / L


def centroid(pts):
    return sum(p[0] for p in pts) / len(pts), sum(p[1] for p in pts) / len(pts)


class Fig:
    def __init__(self, w, h):
        self.w, self.h = w, h
        self.el = []
        self.bb = [1e9, 1e9, -1e9, -1e9]

    def _ext(self, x, y, r=0.0):
        b = self.bb
        b[0], b[1] = min(b[0], x - r), min(b[1], y - r)
        b[2], b[3] = max(b[2], x + r), max(b[3], y + r)

    # ------------------------------------------------------------ primitives
    def line(self, p, q, stroke=OUT, sw=1.3, dash=None, cap="round"):
        self._ext(*p, sw); self._ext(*q, sw)
        d = f' stroke-dasharray="{dash}"' if dash else ""
        self.el.append(f'<line x1="{_f(p[0])}" y1="{_f(p[1])}" x2="{_f(q[0])}" y2="{_f(q[1])}" '
                       f'stroke="{stroke}" stroke-width="{sw}" stroke-linecap="{cap}"{d}/>')

    def poly(self, pts, fill=FILL, stroke=OUT, sw=1.3, close=True, dash=None, op=None):
        tag = "polygon" if close else "polyline"
        for pt in pts:
            self._ext(*pt, sw)
        d = f' stroke-dasharray="{dash}"' if dash else ""
        o = f' fill-opacity="{op}"' if op is not None else ""
        pp = " ".join(f"{_f(x)},{_f(y)}" for x, y in pts)
        self.el.append(f'<{tag} points="{pp}" fill="{fill if close else "none"}"{o} stroke="{stroke}" '
                       f'stroke-width="{sw}" stroke-linejoin="round"{d}/>')

    def rect(self, x, y, w, h, fill=FILL, stroke=OUT, sw=1.3, rx=0, dash=None):
        self._ext(x, y, sw); self._ext(x + w, y + h, sw)
        d = f' stroke-dasharray="{dash}"' if dash else ""
        self.el.append(f'<rect x="{_f(x)}" y="{_f(y)}" width="{_f(w)}" height="{_f(h)}" rx="{rx}" '
                       f'fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{d}/>')

    def circle(self, c, r, fill=FILL, stroke=OUT, sw=1.3, dash=None):
        self._ext(c[0], c[1], r + sw)
        d = f' stroke-dasharray="{dash}"' if dash else ""
        self.el.append(f'<circle cx="{_f(c[0])}" cy="{_f(c[1])}" r="{_f(r)}" fill="{fill}" '
                       f'stroke="{stroke}" stroke-width="{sw}"{d}/>')

    def ellipse(self, c, rx, ry, fill=FILL, stroke=OUT, sw=1.3, dash=None):
        self._ext(c[0] - rx, c[1] - ry, sw); self._ext(c[0] + rx, c[1] + ry, sw)
        d = f' stroke-dasharray="{dash}"' if dash else ""
        self.el.append(f'<ellipse cx="{_f(c[0])}" cy="{_f(c[1])}" rx="{_f(rx)}" ry="{_f(ry)}" '
                       f'fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{d}/>')

    def path(self, d, fill="none", stroke=OUT, sw=1.3, dash=None):
        dd = f' stroke-dasharray="{dash}"' if dash else ""
        self.el.append(f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" '
                       f'stroke-linejoin="round" stroke-linecap="round"{dd}/>')

    def dot(self, p, r=2.4, fill=INK):
        self._ext(p[0], p[1], r)
        self.el.append(f'<circle cx="{_f(p[0])}" cy="{_f(p[1])}" r="{r}" fill="{fill}"/>')

    def text(self, p, s, size=FS, anchor="middle", color=INK, weight=None, italic=False, rot=None):
        tw = 0.56 * size * len(re.sub(r"<[^>]+>", "", str(s)))
        x0 = p[0] - tw / 2 if anchor == "middle" else (p[0] - tw if anchor == "end" else p[0])
        if not rot:
            self._ext(x0, p[1] - size * 0.62); self._ext(x0 + tw, p[1] + size * 0.62)
        else:
            self._ext(p[0], p[1], tw / 2 + 2)
        w = f' font-weight="{weight}"' if weight else ""
        it = ' font-style="italic"' if italic else ""
        r = f' transform="rotate({rot} {_f(p[0])} {_f(p[1])})"' if rot else ""
        self.el.append(f'<text x="{_f(p[0])}" y="{_f(p[1] + size * 0.34)}" font-family="{FONT}" '
                       f'font-size="{size}" text-anchor="{anchor}" fill="{color}"{w}{it}{r}>{_txt(s)}</text>')

    def arrow(self, p, q, stroke=INK, sw=1.2, head=6):
        self.line(p, q, stroke, sw)
        ux, uy = unit(p, q)
        a = (q[0] - head * ux + head * 0.45 * uy, q[1] - head * uy - head * 0.45 * ux)
        b = (q[0] - head * ux - head * 0.45 * uy, q[1] - head * uy + head * 0.45 * ux)
        self.poly([q, a, b], fill=stroke, stroke=stroke, sw=0.8)

    # --------------------------------------------------------------- marks --
    def right_angle(self, v, p1, p2, s=7, stroke=OUT):
        u1, u2 = unit(v, p1), unit(v, p2)
        a = (v[0] + s * u1[0], v[1] + s * u1[1])
        b = (a[0] + s * u2[0], a[1] + s * u2[1])
        c = (v[0] + s * u2[0], v[1] + s * u2[1])
        self.poly([a, b, c], close=False, stroke=stroke, sw=1.0)

    def arc(self, v, p1, p2, r=15, label=None, lr=None, color=OUT, lcolor=INK, size=FS, fill=None):
        a1 = math.atan2(p1[1] - v[1], p1[0] - v[0])
        a2 = math.atan2(p2[1] - v[1], p2[0] - v[0])
        d = (a2 - a1) % (2 * math.pi)
        if d > math.pi:
            a1, a2 = a2, a1
            d = 2 * math.pi - d
        s = (v[0] + r * math.cos(a1), v[1] + r * math.sin(a1))
        e = (v[0] + r * math.cos(a2), v[1] + r * math.sin(a2))
        self._ext(*s); self._ext(*e)
        if fill:
            self.path(f"M{_f(v[0])},{_f(v[1])} L{_f(s[0])},{_f(s[1])} A{r},{r} 0 0 1 {_f(e[0])},{_f(e[1])} Z",
                      fill=fill, stroke="none", sw=0)
        self.path(f"M{_f(s[0])},{_f(s[1])} A{r},{r} 0 0 1 {_f(e[0])},{_f(e[1])}", stroke=color, sw=1.1)
        if label:
            m = a1 + d / 2
            R = lr if lr else r + 10
            self.text((v[0] + R * math.cos(m), v[1] + R * math.sin(m)), label, size=size, color=lcolor)

    def side_label(self, p, q, s, inside, off=10, color=INK, size=FS, weight=None):
        mx, my = (p[0] + q[0]) / 2, (p[1] + q[1]) / 2
        ux, uy = unit(p, q)
        nx, ny = -uy, ux
        if (inside[0] - mx) * nx + (inside[1] - my) * ny > 0:
            nx, ny = -nx, -ny
        # push a little more for near-horizontal sides (text is wider than tall)
        k = off + 0.27 * size * len(re.sub(r"<[^>]+>", "", str(s))) * abs(nx)
        self.text((mx + k * nx, my + k * ny), s, size=size, color=color, weight=weight)

    def angle(self, V, P1, P2, lab, size=FS, r=None, color=None, Lmax=None, reflex=False):
        """Angle arc at V between rays V->P1 and V->P2 (the smaller angle), with the label pushed
        along the bisector until its box clears both rays. Magenta if the label is a pronumeral."""
        u1, u2 = unit(V, P1), unit(V, P2)
        cr = u1[0] * u2[1] - u1[1] * u2[0]
        ang = math.acos(max(-1.0, min(1.0, u1[0] * u2[0] + u1[1] * u2[1])))
        m = math.atan2(u1[1], u1[0]) + (ang / 2) * (1 if cr > 0 else -1)
        plain = re.sub(r"<[^>]+>", "", str(lab or ""))
        unknown = "<i>" in str(lab or "")
        col = color or (BLUE if unknown else OUT)
        r = r or (15 if math.degrees(ang) >= 30 else 22)
        if reflex:
            t1, t2 = math.atan2(u1[1], u1[0]), math.atan2(u2[1], u2[0])
            if (t2 - t1) % (2 * math.pi) < math.pi:
                t1, t2 = t2, t1
            st = (V[0] + r * math.cos(t1), V[1] + r * math.sin(t1))
            en = (V[0] + r * math.cos(t2), V[1] + r * math.sin(t2))
            for kk in range(12):
                th = t1 + ((t2 - t1) % (2 * math.pi)) * kk / 11
                self._ext(V[0] + r * math.cos(th), V[1] + r * math.sin(th))
            self.path(f"M{_f(st[0])},{_f(st[1])} A{r},{r} 0 1 1 {_f(en[0])},{_f(en[1])}", stroke=col, sw=1.1)
            if lab:
                ls = size - 1
                L = r + 8 + 0.28 * ls * len(plain)
                self.text((V[0] - L * math.cos(m), V[1] - L * math.sin(m)), lab, size=ls,
                          color=BLUE if unknown else INK)
            return
        self.arc(V, P1, P2, r=r, color=col)
        if not lab:
            return
        ls = size - 1
        tw, th = 0.56 * ls * len(plain), 0.78 * ls
        bis = (math.cos(m), math.sin(m))

        def clear(L):
            cx, cy = V[0] + L * bis[0], V[1] + L * bis[1]
            for (ux, uy) in (u1, u2):
                nx, ny = -uy, ux
                sgn = 1 if bis[0] * nx + bis[1] * ny > 0 else -1
                if min(sgn * ((cx + a * tw / 2 - V[0]) * nx + (cy + b * th / 2 - V[1]) * ny)
                       for a in (-1, 1) for b in (-1, 1)) < 2.0:
                    return False
            return True
        L, top = r + 10, (Lmax or 1e9)
        while L < top and not clear(L):
            L += 1
        self.text((V[0] + L * bis[0], V[1] + L * bis[1]), lab, size=ls,
                  color=BLUE if unknown else INK)

    def ticks(self, p, q, n=1, L=5, stroke=OUT):
        mx, my = (p[0] + q[0]) / 2, (p[1] + q[1]) / 2
        ux, uy = unit(p, q)
        nx, ny = -uy, ux
        for i in range(n):
            o = (i - (n - 1) / 2) * 3.2
            c = (mx + o * ux, my + o * uy)
            self.line((c[0] - L * nx, c[1] - L * ny), (c[0] + L * nx, c[1] + L * ny), stroke, 1.1)

    def svg(self, crop=True):
        if crop and self.bb[0] < 1e8:
            m = 3
            x0, y0 = self.bb[0] - m, self.bb[1] - m
            w, h = self.bb[2] - self.bb[0] + 2 * m, self.bb[3] - self.bb[1] + 2 * m
        else:
            x0, y0, w, h = 0, 0, self.w, self.h
        return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{_f(w)}" height="{_f(h)}" '
                f'viewBox="{_f(x0)} {_f(y0)} {_f(w)} {_f(h)}">' + "".join(self.el) + "</svg>")


# ---------------------------------------------------------------- fitting --
def fit(pts, W, H, pad=24, flipy=True):
    """Scale and translate model points (y up) into a W x H box."""
    W, H = W * GEO, H * GEO
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    sx = (W - 2 * pad) / ((x1 - x0) or 1)
    sy = (H - 2 * pad) / ((y1 - y0) or 1)
    s = min(sx, sy)
    ox = (W - s * (x1 - x0)) / 2
    oy = (H - s * (y1 - y0)) / 2
    if flipy:
        return [(ox + (p[0] - x0) * s, H - oy - (p[1] - y0) * s) for p in pts]
    return [(ox + (p[0] - x0) * s, oy + (p[1] - y0) * s) for p in pts]


def tri(model, W=190, H=128, sides=None, hi=None, right=None, angles=None, verts=None,
        pad=24, arc_r=16, fill=FILL, size=FS):
    """General triangle from model coordinates (y up).
    sides:  {i: label} for side i (vertex i -> vertex i+1)
    hi:     set of side indices drawn and labelled in magenta (the unknowns)
    right:  vertex index with the right-angle mark
    angles: {i: label} angle arcs at vertex i ('' for an unlabelled arc)
    verts:  list of vertex names, drawn outside each vertex"""
    P = fit(model, W, H, pad)
    f = Fig(W, H)
    f.poly(P, fill=fill)
    c = centroid(P)
    hi = hi or set()
    for i in (hi or []):
        f.line(P[i], P[(i + 1) % 3], BLUE, 2.2)
    if right is not None:
        f.right_angle(P[right], P[(right + 1) % 3], P[(right - 1) % 3])
    for i, lab in (angles or {}).items():
        col = BLUE if lab and ("<i>" in lab and "\u00b0" not in lab) else OUT
        f.arc(P[i], P[(i + 1) % 3], P[(i - 1) % 3], r=arc_r, label=lab or None, color=col,
              lcolor=BLUE if col == BLUE else INK, size=size - 1, lr=arc_r + 11)
    for i, lab in (sides or {}).items():
        f.side_label(P[i], P[(i + 1) % 3], lab, c, off=9, color=BLUE if i in hi else INK, size=size)
    if verts:
        for i, nm in enumerate(verts):
            ux, uy = unit(c, P[i])
            f.text((P[i][0] + 10 * ux, P[i][1] + 10 * uy), nm, size=size, color=INK)
    return f.svg()


def rt(a, b, W=190, H=128, legs=("", ""), hyp="", hi=None, orient=0, angles=None, verts=None,
       pad=24, size=FS, rot=0):
    """Right-angled triangle with horizontal leg a and vertical leg b (model units).
    orient rotates/reflects the picture: 0 right angle bottom-left, 1 bottom-right,
    2 top-left, 3 top-right. Side 0 = horizontal leg, 1 = hypotenuse, 2 = vertical leg.
    angles: {'h': label at the vertex on the horizontal leg, 'v': at the vertical leg}."""
    sx = -1 if orient in (1, 3) else 1
    sy = -1 if orient in (2, 3) else 1
    R, A, B = (0, 0), (sx * a, 0), (0, sy * b)
    model = [R, A, B]
    if rot:
        cr, sr = math.cos(math.radians(rot)), math.sin(math.radians(rot))
        model = [(x * cr - y * sr, x * sr + y * cr) for x, y in model]
    sides = {0: legs[0], 1: hyp, 2: legs[1]}
    sides = {k: val for k, val in sides.items() if val}
    ang = {}
    for k, lab in (angles or {}).items():
        ang[1 if k == "h" else 2] = lab
    return tri(model, W, H, sides=sides, hi=hi, right=0, angles=ang, verts=verts, pad=pad, size=size)


def fitter(pts, W, H, pad=24, padx=None):
    """Return T(p): model (y up) -> SVG coords, fitting pts into W x H."""
    px = pad if padx is None else padx
    W, H = W * GEO, H * GEO
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    s = min((W - 2 * px) / ((x1 - x0) or 1), (H - 2 * pad) / ((y1 - y0) or 1))
    ox = (W - s * (x1 - x0)) / 2
    oy = (H - s * (y1 - y0)) / 2
    return lambda p: (ox + (p[0] - x0) * s, H - oy - (p[1] - y0) * s)


def shape(model, W=190, H=128, sides=None, hi=None, rights=(), segs=(), pad=24, padx=None,
          fill=FILL, size=FS, verts=None, marks=(), texts=(), ticks=(), closed=True, arcs=()):
    """General figure from a polygon in model coordinates (y up).
    sides:  {i: label} for edge i (vertex i -> i+1); hi: edges drawn/labelled in magenta
    rights: vertex indices of the polygon that get a right-angle mark
    segs:   extra segments [(p, q, label, style)] style in {'dash', 'solid', 'hi', 'hidash'}
    marks:  extra right-angle marks [(v, p1, p2)] in model coordinates
    texts:  free labels [(p, text, dict(size=.., color=.., anchor=..))]
    ticks:  equal-length marks [(p, q, n)]
    arcs:   angle arcs [(v, p1, p2, label)] in model coordinates"""
    allp = list(model) + [pt for s in segs for pt in s[:2]] + [t[0] for t in texts]
    T = fitter(allp, W, H, pad, padx)
    P = [T(p) for p in model]
    f = Fig(W, H)
    if closed:
        f.poly(P, fill=fill)
    else:
        f.poly(P, close=False)
    c = centroid(P)
    hi = set(hi or ())
    for i in hi:
        f.line(P[i], P[(i + 1) % len(P)], BLUE, 2.2)
    for (p, q, lab, *st) in segs:
        style = st[0] if st else "dash"
        a, b = T(p), T(q)
        if style == "dash":
            f.line(a, b, OUT, 1.1, dash="4 3")
        elif style == "hidash":
            f.line(a, b, BLUE, 1.8, dash="5 3")
        elif style == "hi":
            f.line(a, b, BLUE, 2.2)
        else:
            f.line(a, b, OUT, 1.3)
        if lab:
            mid = ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)
            ux, uy = unit(a, b)
            nx, ny = -uy, ux
            k = 9 + 0.27 * size * len(re.sub(r"<[^>]+>", "", str(lab))) * abs(nx)
            # put the label on the side away from the polygon centroid unless told otherwise
            if (c[0] - mid[0]) * nx + (c[1] - mid[1]) * ny > 0:
                nx, ny = -nx, -ny
            f.text((mid[0] + k * nx, mid[1] + k * ny), lab, size=size,
                   color=BLUE if style in ("hi", "hidash") else INK)
    for v in rights:
        n = len(P)
        f.right_angle(P[v], P[(v + 1) % n], P[(v - 1) % n])
    for (v, p1, p2) in marks:
        f.right_angle(T(v), T(p1), T(p2))
    for (p, q, n) in ticks:
        f.ticks(T(p), T(q), n)
    for (v, p1, p2, lab) in arcs:
        f.angle(T(v), T(p1), T(p2), lab, size=size)
    for i, lab in (sides or {}).items():
        f.side_label(P[i], P[(i + 1) % len(P)], lab, c, off=9, color=BLUE if i in hi else INK, size=size)
    if verts:
        for i, nm in enumerate(verts):
            if nm:
                ux, uy = unit(c, P[i])
                f.text((P[i][0] + 10 * ux, P[i][1] + 10 * uy), nm, size=size, color=INK)
    for (p, s, kw) in texts:
        f.text(T(p), s, **kw)
    return f.svg()


def north(f, x, y, L=16):
    f.arrow((x, y + L), (x, y), stroke=MUTED, sw=1.1, head=5)
    f.text((x, y - 7), "N", size=10, color=MUTED, weight=700)


def box3d(l, w, h, W=180, H=124, labels=("", "", ""), diag=None, face_diag=False, pad=22, k=0.5, ang=30,
          fill=FILL, size=FS, hi_edges=()):
    """Rectangular prism in oblique projection. labels = (length, width/depth, height).
    diag: label for the space diagonal (front-bottom-left -> back-top-right), drawn in magenta.
    face_diag: also draw the base diagonal dashed (the first Pythagoras step)."""
    dx, dy = k * w * math.cos(math.radians(ang)), k * w * math.sin(math.radians(ang))
    P = {"A": (0, 0), "B": (l, 0), "C": (l, h), "D": (0, h),
         "E": (dx, dy), "F": (l + dx, dy), "G": (l + dx, h + dy), "Hh": (dx, h + dy)}
    T = fitter(list(P.values()), W, H, pad)
    Q = {kk: T(vv) for kk, vv in P.items()}
    f = Fig(W, H)
    f.poly([Q["A"], Q["B"], Q["C"], Q["D"]], fill=fill)
    f.poly([Q["D"], Q["C"], Q["G"], Q["Hh"]], fill=SOFT2)
    f.poly([Q["B"], Q["F"], Q["G"], Q["C"]], fill=SOFT)
    for a, b in (("A", "E"), ("E", "F"), ("E", "Hh")):
        f.line(Q[a], Q[b], OUT, 1.0, dash="4 3")
    if face_diag:
        f.line(Q["A"], Q["F"], OUT, 1.1, dash="4 3")
    if diag is not None:
        f.line(Q["A"], Q["G"], BLUE, 2.0)
        m = ((Q["A"][0] + Q["G"][0]) / 2, (Q["A"][1] + Q["G"][1]) / 2)
        if diag:
            f.text((m[0] - 10, m[1] - 8), diag, size=size, color=BLUE)
    L, Wd, Hd = labels
    if L:
        f.text(((Q["A"][0] + Q["B"][0]) / 2, Q["A"][1] + 13), L, size=size)
    if Wd:
        f.text(((Q["B"][0] + Q["F"][0]) / 2 + 8, (Q["B"][1] + Q["F"][1]) / 2 + 8), Wd, size=size, anchor="start")
    if Hd:
        f.text((Q["A"][0] - 7, (Q["A"][1] + Q["D"][1]) / 2), Hd, size=size, anchor="end")
    return f.svg()


def walk(legs, W=160, H=120, labels=(), close_label="", pad=26, size=FS, start="P", end=None):
    """Compass walk: legs = [(dx, dy), ...] in km (east +, north +). Draws the path, a dashed
    magenta straight-line return, a north arrow and the start point."""
    pts = [(0.0, 0.0)]
    for dx, dy in legs:
        pts.append((pts[-1][0] + dx, pts[-1][1] + dy))
    T = fitter(pts, W, H, pad)
    P = [T(p) for p in pts]
    f = Fig(W, H)
    for i in range(len(P) - 1):
        f.arrow(P[i], P[i + 1], stroke=OUT, sw=1.4, head=6)
        if i < len(labels) and labels[i]:
            c = centroid(P)
            f.side_label(P[i], P[i + 1], labels[i], c, off=9, size=size)
    f.line(P[0], P[-1], BLUE, 1.8, dash="5 3")
    if close_label:
        m = ((P[0][0] + P[-1][0]) / 2, (P[0][1] + P[-1][1]) / 2)
        c = centroid(P)
        ux, uy = unit(P[0], P[-1])
        nx, ny = -uy, ux
        if (c[0] - m[0]) * nx + (c[1] - m[1]) * ny < 0:
            nx, ny = -nx, -ny
        f.text((m[0] + 11 * nx, m[1] + 11 * ny), close_label, size=size, color=BLUE)
    f.dot(P[0])
    f.text((P[0][0] - 8, P[0][1] - 6), start, size=size - 1, color=MUTED)
    if end:
        f.dot(P[-1])
        f.text((P[-1][0] + 8, P[-1][1] - 6), end, size=size - 1, color=MUTED)
    north(f, W - 12, 14)
    return f.svg()


# ------------------------------------------------------------ trigonometry --
def trig(ang, at="h", opp="", adj="", hyp="", hi=(), orient=0, lab=None, W=150, H=92, verts=None,
         size=FS, pad=22, show_angle=True):
    """Right-angled triangle drawn with its TRUE angle `ang` (degrees) at the acute vertex on the
    horizontal leg (at='h') or on the vertical leg (at='v'). Sides are named relative to that
    angle: opp, adj, hyp (labels). hi: subset of {'opp', 'adj', 'hyp'} drawn in magenta.
    orient: 0 right angle bottom-left, 1 bottom-right, 2 top-left, 3 top-right.
    lab: angle label (default '<ang>deg'); a label with <i> and no degree sign is magenta.
    verts: names for (right-angle vertex, horizontal-leg vertex, vertical-leg vertex)."""
    t = math.tan(math.radians(ang))
    a, b = (1.0, t) if at == "h" else (t, 1.0)
    sx = -1 if orient in (1, 3) else 1
    sy = -1 if orient in (2, 3) else 1
    P = fit([(0, 0), (sx * a, 0), (0, sy * b)], W, H, pad)
    R, A, Bv = P
    f = Fig(W, H)
    f.poly(P)
    c = centroid(P)
    # side index: 0 horizontal leg R-A, 1 hypotenuse A-B, 2 vertical leg B-R
    ends = {0: (R, A), 1: (A, Bv), 2: (Bv, R)}
    role = {"hyp": 1, "opp": 2 if at == "h" else 0, "adj": 0 if at == "h" else 2}
    for k in hi:
        p, q = ends[role[k]]
        f.line(p, q, BLUE, 2.2)
    f.right_angle(R, A, Bv)
    if show_angle:
        V, P1, P2 = (A, R, Bv) if at == "h" else (Bv, R, A)
        lab = lab if lab is not None else f"{ang:g}\u00b0"
        f.angle(V, P1, P2, lab, size=size, Lmax=0.9 * math.dist(V, R))
    for k, labl in (("opp", opp), ("adj", adj), ("hyp", hyp)):
        if labl:
            p, q = ends[role[k]]
            f.side_label(p, q, labl, c, off=9, color=BLUE if k in hi else INK, size=size)
    if verts:
        for pt, nm in zip(P, verts):
            if nm:
                ux, uy = unit(c, pt)
                f.text((pt[0] + 10 * ux, pt[1] + 10 * uy), nm, size=size, color=INK)
    return f.svg()



# ------------------------------------------------------- angle geometry ----
class Geo:
    """Coordinate geometry figure: P = {name: (x, y)} in model units (y up). Every mark is
    computed from the same points, so the picture cannot disagree with its numbers."""

    def __init__(self, P, W=150, H=100, pad=20, extra=()):
        self.P = dict(P)
        self.T = fitter(list(self.P.values()) + list(extra), W, H, pad)
        self.Q = {k: self.T(v) for k, v in self.P.items()}
        self.f = Fig(W, H)
        vals = list(self.Q.values())
        self.c = (sum(p[0] for p in vals) / len(vals), sum(p[1] for p in vals) / len(vals))

    def pt(self, k):
        return self.Q[k] if isinstance(k, str) else self.T(k)

    def poly(self, names, fill=FILL, sw=1.3):
        self.f.poly([self.pt(n) for n in names], fill=fill, sw=sw)
        return self

    def seg(self, a, b, color=OUT, sw=1.3, dash=None):
        self.f.line(self.pt(a), self.pt(b), color, sw, dash=dash)
        return self

    def ray(self, a, b, k=1.25, color=OUT, sw=1.3):
        """Line from a through b, extended beyond b by factor k of |ab|."""
        A, B_ = self.pt(a), self.pt(b)
        E = (A[0] + k * (B_[0] - A[0]), A[1] + k * (B_[1] - A[1]))
        self.f.line(A, E, color, sw)
        return E

    def ang(self, v, a, b, lab="", r=None, color=None, reflex=False):
        V, A, B_ = self.pt(v), self.pt(a), self.pt(b)
        plain = re.sub(r"<[^>]+>", "", str(lab or ""))
        m = re.fullmatch(r"(\d+(?:\.\d+)?)\u00b0", plain)
        if m:   # a numeric label must match the drawn angle
            u, w = unit(V, A), unit(V, B_)
            got = math.degrees(math.acos(max(-1.0, min(1.0, u[0] * w[0] + u[1] * w[1]))))
            if reflex:
                got = 360 - got
            assert abs(got - float(m.group(1))) < 0.6, f"angle label {plain} but drawn {got:.1f}"
        self.f.angle(V, A, B_, lab, r=r, color=color, reflex=reflex)
        return self

    def ra(self, v, a, b, s=7):
        self.f.right_angle(self.pt(v), self.pt(a), self.pt(b), s=s)
        return self

    def tick(self, a, b, n=1):
        self.f.ticks(self.pt(a), self.pt(b), n)
        return self

    def par(self, a, b, n=1, at=0.5):
        """n chevrons on segment a-b (at fraction `at`), pointing from a to b."""
        A, B_ = self.pt(a), self.pt(b)
        ux, uy = unit(A, B_)
        nx, ny = -uy, ux
        mx, my = A[0] + at * (B_[0] - A[0]), A[1] + at * (B_[1] - A[1])
        s = 5.0
        for i in range(n):
            o = (i - (n - 1) / 2) * 4.2
            tip = (mx + (o + s / 2) * ux, my + (o + s / 2) * uy)
            p1 = (tip[0] - s * ux + 0.62 * s * nx, tip[1] - s * uy + 0.62 * s * ny)
            p2 = (tip[0] - s * ux - 0.62 * s * nx, tip[1] - s * uy - 0.62 * s * ny)
            self.f.poly([p1, tip, p2], close=False, stroke=OUT, sw=1.2)
        return self

    def name(self, k, text=None, d=10, away=None, size=FS):
        p = self.pt(k)
        ref = self.pt(away) if away is not None else self.c
        ux, uy = unit(ref, p)
        self.f.text((p[0] + d * ux, p[1] + d * uy), text if text is not None else k, size=size)
        return self

    def text(self, p, s, **kw):
        self.f.text(self.pt(p), s, **kw)
        return self

    def dot(self, k, r=2.2):
        self.f.dot(self.pt(k), r)
        return self

    def svg(self):
        return self.f.svg()


def tri_pts(A, B, base=1.0):
    """Model points of a triangle with angle A at (0,0) and B at (base,0), apex above."""
    ta, tb = math.tan(math.radians(A)), math.tan(math.radians(B))
    x = base * tb / (ta + tb)
    return (0.0, 0.0), (base, 0.0), (x, x * ta)


# ---------------------------------------------------------------- networks --
def net(pos, edges, W=150, H=100, pad=18, names=True, vr=3.0, size=FS, hi=(), label_off=11):
    """Network drawing. pos = {name: (x, y)} (y up); edges = [(a, b) or (a, b, bend)], where
    bend (fraction of the edge length) curves the edge; (a, a) draws a loop.
    hi: edges drawn in magenta (for walks/paths)."""
    T = fitter(list(pos.values()), W, H, pad)
    Q = {k: T(v) for k, v in pos.items()}
    f = Fig(W, H)
    nb = {k: [] for k in pos}
    for e in edges:
        a, b = e[0], e[1]
        bend = e[2] if len(e) > 2 else 0.0
        col, sw = (BLUE, 2.2) if (a, b) in hi or (b, a) in hi else (OUT, 1.5)
        if a == b:
            p = Q[a]
            f.circle((p[0], p[1] - 9), 9, fill="none", stroke=col, sw=sw)
            nb[a].extend([(p[0], p[1] - 60)] * 2)
            continue
        nb[a].append(Q[b])
        nb[b].append(Q[a])
        if not bend:
            f.line(Q[a], Q[b], col, sw)
        else:
            A, B_ = Q[a], Q[b]
            L = math.dist(A, B_)
            ux, uy = unit(A, B_)
            cx = (A[0] + B_[0]) / 2 - uy * bend * L
            cy = (A[1] + B_[1]) / 2 + ux * bend * L
            f.path(f"M{_f(A[0])},{_f(A[1])} Q{_f(cx)},{_f(cy)} {_f(B_[0])},{_f(B_[1])}", stroke=col, sw=sw)
            f._ext((A[0] + 2 * cx + B_[0]) / 4, (A[1] + 2 * cy + B_[1]) / 4)
    for k, p in Q.items():
        f.dot(p, vr, fill=INK)
    if names:
        allc = (sum(p[0] for p in Q.values()) / len(Q), sum(p[1] for p in Q.values()) / len(Q))
        for k, p in Q.items():
            if nb[k]:
                mx = sum(q[0] for q in nb[k]) / len(nb[k])
                my = sum(q[1] for q in nb[k]) / len(nb[k])
                ux, uy = unit((mx, my), p)
                if abs(ux) < 1e-6 and abs(uy) < 1e-6:
                    ux, uy = unit(allc, p)
            else:
                ux, uy = unit(allc, p)
            f.text((p[0] + label_off * ux, p[1] + label_off * uy), k, size=size, italic=True)
    return f.svg()
