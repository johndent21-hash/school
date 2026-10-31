"""Independent answer check for the Year 8 Fractal Five (both versions, all terms).

Recomputes every answer from what the student actually sees - the question text, the numbers and words
printed in its figure (SVG labels, table cells, the displayed expression) and, for angles, triangles,
polygons, composite shapes, dot plots and the number plane, the drawing itself - with its own rules,
without using any of gen.py's arithmetic. Angle figures: the drawn size of every marked angle must
match its label, and the answer must match the drawn size of the unknown angle. Shapes: every side
label must agree with the drawn side lengths (to scale), and a composite area is measured from the
drawn outline.

    python3 wu/verify_answers.py [M,A] [1,2,3,4] [--sample N]

--sample N also prints N randomly chosen questions in full with the recomputation (default 20).
"""
import math
import os
import random
import re
import sys
from decimal import Decimal, ROUND_HALF_UP
from fractions import Fraction

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

MINUS = "−"


# ------------------------------------------------------------------ reading --
def plain(h):
    h = re.sub(r'<span class="frac"><span class="fn">(.*?)</span><span class="fd">(.*?)</span></span>', r"\1/\2", h or "")
    h = re.sub(r"<sup>(.*?)</sup>", r"^\1", h)
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", h)).replace(MINUS, "-").replace(" ", " ").strip()


def nums(s):
    """Numbers in a string: grouped thousands (52 000) joined, minus signs kept."""
    s = s.replace(MINUS, "-").replace(" ", " ")
    s = re.sub(r"(?<=\d) (?=\d{3}\b)", "", s)
    return [float(v.replace(",", "")) for v in re.findall(r"-?\d+(?:\.\d+)?", s)]


def num(s):
    v = nums(s)
    assert v, s
    return v[0]


def svg_texts(fig):
    out = []
    for attrs, body in re.findall(r"<text\b([^>]*)>(.*?)</text>", fig or "", re.S):
        x = float(re.search(r'\bx="([-\d.]+)"', attrs).group(1))
        y = float(re.search(r'\by="([-\d.]+)"', attrs).group(1))
        size = float(re.search(r'font-size="([\d.]+)"', attrs).group(1))
        anchor = re.search(r'text-anchor="(\w+)"', attrs).group(1)
        t = plain(body)
        w = 0.56 * size * len(t)
        cx = x if anchor == "middle" else (x + w / 2 if anchor == "start" else x - w / 2)
        out.append((cx, y - 0.34 * size, t))
    return out


def pts(s):
    v = [float(a) for a in re.findall(r"-?[\d.]+", s)]
    return list(zip(v[::2], v[1::2]))


def polygons(fig):
    return [pts(p) for p in re.findall(r'<polygon points="([^"]+)"', fig or "")]


def polylines(fig):
    return [pts(p) for p in re.findall(r'<polyline points="([^"]+)"', fig or "")]


def lines_(fig):
    return [(tuple(map(float, m[:4])), m[4]) for m in
            re.findall(r'<line x1="([-\d.]+)" y1="([-\d.]+)" x2="([-\d.]+)" y2="([-\d.]+)"([^>]*)>', fig or "")]


def cells(fig):
    return [[plain(c) for c in re.findall(r"<td[^>]*>(.*?)</td>", row)] for row in re.findall(r"<tr>(.*?)</tr>", fig or "")]


def rows(fig):
    return {r[0]: r[1:] for r in cells(fig)}


def disp(fig):
    m = re.search(r'<div class="disp">(.*?)</div>', fig or "", re.S)
    return m.group(1) if m else ""


def seg_dist(p, a, b):
    ax, ay = b[0] - a[0], b[1] - a[1]
    t = max(0, min(1, ((p[0] - a[0]) * ax + (p[1] - a[1]) * ay) / (ax * ax + ay * ay)))
    return math.hypot(p[0] - a[0] - t * ax, p[1] - a[1] - t * ay)


def angle_at(V, P, Q):
    a = math.atan2(P[1] - V[1], P[0] - V[0])
    b = math.atan2(Q[1] - V[1], Q[0] - V[0])
    d = abs(a - b) % (2 * math.pi)
    return math.degrees(min(d, 2 * math.pi - d))


def r1(v):
    return float(Decimal(repr(v)).quantize(Decimal("0.1"), ROUND_HALF_UP))


def r2(v):
    return float(Decimal(repr(v)).quantize(Decimal("0.01"), ROUND_HALF_UP))


def unit_of(s):
    m = re.search(r"\d\s*(cm|mm|m|km)(?![a-z])", s)
    return m.group(1) if m else None


# ------------------------------------------------------------- triangles --
def triangle(q):
    """Return the triangle's roles and labels read from the drawing."""
    fig = q.fig
    tri = polygons(fig)[0]
    assert len(tri) == 3
    mark = [p for p in polylines(fig) if len(p) == 3]
    mc = (sum(p[0] for p in mark[0]) / 3, sum(p[1] for p in mark[0]) / 3)
    R = min(range(3), key=lambda i: math.dist(tri[i], mc))
    sides = {i: (tri[(i + 1) % 3], tri[(i + 2) % 3]) for i in range(3)}      # side i is opposite vertex i
    lab, ang = {}, None
    for x, y, t in svg_texts(fig):
        if t in ("tree", "tower", "cliff"):
            continue
        if "°" in t or "θ" in t:
            ang = (x, y, t)
            continue
        i = min(sides, key=lambda k: seg_dist((x, y), *sides[k]))
        assert i not in lab, ("two labels on one side", t)
        lab[i] = t
    V = None
    dashed_h = [ln for ln, a in lines_(fig) if "dasharray" in a and abs(ln[1] - ln[3]) < 0.01]
    if ang is not None:
        near = min((i for i in range(3) if i != R), key=lambda i: math.dist(tri[i], ang[:2]))
        V = near
        if dashed_h and any(math.dist(tri[near], ln[:2]) < 0.1 for ln in dashed_h):
            # angle of depression, marked between the horizontal and the line of sight at the observer:
            # it equals the angle at the other acute vertex (alternate angles)
            hz = [ln for ln in dashed_h if math.dist(tri[near], ln[:2]) < 0.1][0]
            other = [i for i in range(3) if i not in (R, near)][0]
            dep = angle_at(tri[near], hz[2:], tri[other])
            assert abs(dep - angle_at(tri[other], tri[near], tri[R])) < 0.05
            V = other
    role = {}
    for i, t in lab.items():
        role["hyp" if i == R else ("opp" if i == V else ("adj" if V is not None else f"leg{i}"))] = t
    return tri, R, V, role, ang


def tri_check(q, role, tri, R, V, ang):
    """The drawing must agree with the labels: side ratios and the marked angle."""
    known = {}
    for k, t in role.items():
        if re.fullmatch(r"-?\d+(\.\d+)? \w+", t):
            known[k] = num(t)
    idx = {"hyp": R}
    if V is not None:
        idx["opp"] = V
        idx["adj"] = [i for i in range(3) if i not in (R, V)][0]
    L = {i: math.dist(tri[(i + 1) % 3], tri[(i + 2) % 3]) for i in range(3)}
    ks = [k for k in known if k in idx]
    for a in ks:
        for b in ks:
            if a < b:
                assert abs(L[idx[a]] / L[idx[b]] - known[a] / known[b]) < 0.015 * known[a] / known[b], (a, b)
    if ang and "°" in ang[2] and V is not None:
        drawn = angle_at(tri[V], tri[(V + 1) % 3], tri[(V + 2) % 3])
        assert abs(drawn - num(ang[2])) < 0.6, (drawn, ang)


def v_pyth(q):
    tri, R, V, role, ang = triangle(q)
    tri_check(q, role, tri, R, V, ang)
    legs = [t for k, t in role.items() if k != "hyp"]
    u = unit_of(" ".join(role.values()))
    if not re.search(r"\d", role["hyp"]):
        a, b = [num(t) for t in legs]
        c = math.hypot(a, b)
    else:
        h = num(role["hyp"])
        g = num([t for t in legs if re.search(r"\d", t)][0])
        c = math.sqrt(h * h - g * g)
    val = r1(c)
    return [val], u, f"{val:g} {u}"




# ---------------------------------------------------------- angle figures --
DEGRE = re.compile(r"^(x|-?\d+(?:\.\d+)?)°$")


def deg_labels(fig):
    return [(x, y, t) for x, y, t in svg_texts(fig) if DEGRE.match(t.replace(" ", ""))]


def math_ang(O, P):
    return math.degrees(math.atan2(-(P[1] - O[1]), P[0] - O[0])) % 360


def v_vertex_angles(q):
    """Angles round one vertex (the dot): complementary (right-angle mark), supplementary (straight line),
    angles at a point, vertically opposite. Every label is checked against the drawn angle."""
    fig = q.fig
    m = re.search(r'<circle cx="([-\d.]+)" cy="([-\d.]+)" r="2.4" fill="#35322D"', fig)
    O = (float(m.group(1)), float(m.group(2)))
    rays = []
    for (x1, y1, x2, y2), _ in lines_(fig):
        p, qq = (x1, y1), (x2, y2)
        if math.dist(O, p) < 0.6:
            rays.append(math_ang(O, qq))
        elif math.dist(O, qq) < 0.6:
            rays.append(math_ang(O, p))
        elif seg_dist(O, p, qq) < 0.6:
            rays += [math_ang(O, p), math_ang(O, qq)]
    rays = sorted(set(round(r, 3) for r in rays))
    wedges = [(rays[i], (rays[(i + 1) % len(rays)] - rays[i]) % 360 or 360) for i in range(len(rays))]

    def wedge_of(x, y):
        a = math_ang(O, (x, y))
        for i, (st, sw) in enumerate(wedges):
            if (a - st) % 360 < sw:
                return i
        raise AssertionError("label outside every wedge")
    labs = [(wedge_of(x, y), t.replace(" ", "")) for x, y, t in deg_labels(fig)]
    assert len({w for w, _ in labs}) == len(labs), "two labels in one wedge"
    given = [(w, num(t)) for w, t in labs if not t.startswith("x")]
    (xw,) = [w for w, t in labs if t.startswith("x")]
    for w, v in given:
        assert abs(wedges[w][1] - v) < 0.6, ("label does not match drawing", v, wedges[w][1])
    right_mark = any(len(p) == 3 and math.dist(p[1], O) < 14 for p in polylines(fig))
    mids = {w: wedges[w][0] + wedges[w][1] / 2 for w, _ in labs}
    if right_mark:
        total, rule = 90, "comp"
    elif len(labs) == 2 and abs(((mids[labs[0][0]] - mids[labs[1][0]]) % 360) - 180) < 1:
        total, rule = None, "vert"
    else:
        S_ = sum(wedges[w][1] for w, _ in labs)
        total = 180 if abs(S_ - 180) < 1 else (360 if abs(S_ - 360) < 1 else None)
        rule = {180: "supp", 360: "point"}[total]
    x = given[0][1] if rule == "vert" else total - sum(v for _, v in given)
    assert abs(wedges[xw][1] - x) < 0.6, ("rule disagrees with the drawing", x, wedges[xw][1])
    return [x], "°", rule


def v_polygon_angles(q):
    """Triangle or quadrilateral with angles marked at its vertices (ang_tri, ang_quad); ang_ext: a
    triangle with one side produced, the exterior angle marked."""
    fig = q.fig
    P = polygons(fig)[0]
    n = len(P)
    labs = deg_labels(fig)
    ext = [ln for ln, a in lines_(fig) if any(math.dist(ln[:2], v) < 0.6 or math.dist(ln[2:], v) < 0.6 for v in P)]
    vals = {}
    import itertools
    perm = min(itertools.permutations(range(n), len(labs)),        # one label per vertex, nearest overall
               key=lambda pm: sum(math.dist(P[k], lb[:2]) for k, lb in zip(pm, labs)))
    for (x, y, t), i in zip(labs, perm):
        if ext and any(math.dist(e[:2], P[i]) < 0.6 or math.dist(e[2:], P[i]) < 0.6 for e in ext):
            e = ext[0]
            far = e[2:] if math.dist(e[:2], P[i]) < 0.6 else e[:2]
            other = [P[k] for k in range(n) if k != i and math.dist(P[k], far) > 1]
            nb = [P[(i - 1) % n], P[(i + 1) % n]]
            inner = max(nb, key=lambda p: abs((far[0] - P[i][0]) * (p[1] - P[i][1]) - (far[1] - P[i][1]) * (p[0] - P[i][0])))
            drawn = angle_at(P[i], far, inner)
            kind = "ext"
        else:
            drawn = angle_at(P[i], P[(i - 1) % n], P[(i + 1) % n])
            kind = "int"
        assert i not in vals
        vals[i] = (kind, t.replace(" ", ""), drawn)
    for kind, t, drawn in vals.values():
        if not t.startswith("x"):
            assert abs(num(t) - drawn) < 0.6, ("label does not match drawing", t, drawn)
    xk, _, xdrawn = [v for v in vals.values() if v[1].startswith("x")][0]
    if ext:
        ints = [num(t) for k, t, _ in vals.values() if k == "int" and not t.startswith("x")]
        if xk == "ext":
            x = sum(ints)
        else:
            e = [num(t) for k, t, _ in vals.values() if k == "ext"][0]
            x = e - sum(ints)
    else:
        x = (180 if n == 3 else 360) - sum(num(t) for _, t, _ in vals.values() if not t.startswith("x"))
    assert abs(x - xdrawn) < 0.6, ("rule disagrees with drawing", x, xdrawn)
    return [x], "°", ""


def v_parallel(q):
    """Two parallel lines and a transversal: from the drawing, the size of each marked angle and the
    relationship between the two marked angles (corresponding, alternate, co-interior)."""
    L = [ln for ln, a in lines_(q.fig)]
    hz = sorted({round(y1, 2) for x1, y1, x2, y2 in L if abs(y1 - y2) < 1e-6 and abs(x2 - x1) > 100})
    tr = [ln for ln in L if abs(ln[1] - ln[3]) > 1e-6]
    assert len(hz) == 2 and len(tr) == 1
    x1, y1, x2, y2 = tr[0]
    if y2 > y1:
        x1, y1, x2, y2 = x2, y2, x1, y1
    theta = math.degrees(math.atan2(y1 - y2, x2 - x1))

    def x_at(y):
        return x1 + (x2 - x1) * (y - y1) / (y2 - y1)
    V = {"T": (x_at(hz[0]), hz[0]), "B": (x_at(hz[1]), hz[1])}
    marks = []
    for x, y, t in deg_labels(q.fig):
        vert = min(V, key=lambda v: math.hypot(x - V[v][0], y - V[v][1]))
        quad = ("U" if y < V[vert][1] else "L") + ("R" if x > x_at(y) else "L")
        marks.append((vert, quad, t.replace(" ", ""), theta if quad in ("UR", "LL") else 180 - theta))
    (g,) = [m for m in marks if not m[2].startswith("x")]
    (xm,) = [m for m in marks if m[2].startswith("x")]
    assert abs(num(g[2]) - g[3]) < 0.6
    pair = {g[:2], xm[:2]}
    if g[1] == xm[1] and g[0] != xm[0]:
        rel = "corr"
    elif pair in ({("T", "LL"), ("B", "UR")}, {("T", "LR"), ("B", "UL")}):
        rel = "alt"
    elif pair in ({("T", "LL"), ("B", "UL")}, {("T", "LR"), ("B", "UR")}):
        rel = "coint"
    else:
        raise AssertionError("no relationship")
    x = num(g[2]) if rel in ("corr", "alt") else 180 - num(g[2])
    assert abs(x - xm[3]) < 0.6
    return [x], "°", rel


# ---------------------------------------------------------- measurement --
def side_labels(fig, P):
    """Assign each numeric label to the nearest side of polygon P -> {side index: label}."""
    out = {}
    for x, y, t in svg_texts(fig):
        if not re.search(r"\d", t):
            continue
        i = min(range(len(P)), key=lambda k: seg_dist((x, y), P[k], P[(k + 1) % len(P)]))
        assert i not in out, ("two labels on one side", t)
        out[i] = t
    return out


def v_perimeter(q):
    fig = q.fig
    rect = re.search(r'<rect x="([-\d.]+)" y="([-\d.]+)" width="([\d.]+)" height="([\d.]+)"', fig)
    texts = [t for _, _, t in svg_texts(fig)]
    u = unit_of(" ".join(texts))
    if rect:                                    # rectangle: length and width labelled
        w, h = float(rect.group(3)), float(rect.group(4))
        a, b = (num(t) for t in texts)
        assert abs(w / h - max(a, b) / min(a, b)) < 0.02 * w / h or abs(w / h - min(a, b) / max(a, b)) < 0.02
        return [2 * (a + b)], u, "rect"
    P = polygons(fig)[0]
    ticks = [ln for ln, a in lines_(fig) if 'stroke-width="1.1"' in a]
    if len(P) == 4 and len(ticks) == 4:          # square: equal sides marked, one labelled
        sides = [math.dist(P[i], P[(i + 1) % 4]) for i in range(4)]
        assert max(sides) - min(sides) < 0.5
        return [4 * num(texts[0])], u, "square"
    lab = side_labels(fig, P)
    assert len(lab) == len(P), "every side labelled"
    k = [num(lab[i]) / math.dist(P[i], P[(i + 1) % len(P)]) for i in lab]
    assert max(k) / min(k) < 1.02, "side labels do not match the drawing"
    return [sum(num(t) for t in lab.values())], u, "poly"


def circle_kind(fig):
    c = re.search(r'<circle cx="([-\d.]+)" cy="([-\d.]+)" r="([\d.]+)" fill="#FFFFFF"', fig)
    R = float(c.group(3))
    ln = [l_ for l_, a in lines_(fig)][0]
    L = math.hypot(ln[2] - ln[0], ln[3] - ln[1])
    assert abs(L - R) < 1 or abs(L - 2 * R) < 1
    return "d" if abs(L - 2 * R) < 1 else "r"


def v_circ(q):
    t = svg_texts(q.fig)[0][2]
    v = num(t)
    C = math.pi * v if circle_kind(q.fig) == "d" else 2 * math.pi * v
    assert "1 decimal place" in q.text
    return [r1(C)], unit_of(t), ""


def v_a_circle(q):
    t = svg_texts(q.fig)[0][2]
    r = num(t) / (2 if circle_kind(q.fig) == "d" else 1)
    assert "1 decimal place" in q.text
    return [r1(math.pi * r * r)], unit_of(t) + "²", ""


def v_a_rect(q):
    t = plain(q.text)
    texts = [x[2] for x in svg_texts(q.fig)]
    u = unit_of(" ".join(texts) + " " + t)
    if "square" in t:
        P = polygons(q.fig)[0]
        assert len(P) == 4 and len([ln for ln, a in lines_(q.fig) if 'stroke-width="1.1"' in a]) == 4
        return [num(texts[0]) ** 2], u + "²", ""
    if t.startswith("The area of"):
        known = [num(x) for x in texts if re.search(r"\d", x)][0]
        return [num(t) / known], u, ""
    a, b = (num(x) for x in texts)
    return [a * b], u + "²", ""


def base_height(q):
    """(base label, height label) of a triangle or parallelogram drawn on a horizontal base with a dashed
    height; the drawn base : height ratio must match the labels when both are numbers."""
    P = polygons(q.fig)[0]
    dash = [ln for ln, a in lines_(q.fig) if "dasharray" in a][0]
    base = max(((P[i], P[(i + 1) % len(P)]) for i in range(len(P))), key=lambda s: (s[0][1] + s[1][1]))
    bl = hl = None
    for x, y, t in svg_texts(q.fig):
        if seg_dist((x, y), *base) <= seg_dist((x, y), dash[:2], dash[2:]):
            bl = t
        else:
            hl = t
    if re.search(r"\d", bl) and re.search(r"\d", hl):
        drawn = math.dist(*base) / abs(dash[3] - dash[1])
        assert abs(drawn - num(bl) / num(hl)) < 0.02 * drawn
    return bl, hl


def v_a_tri(q):
    bl, hl = base_height(q)
    t = plain(q.text)
    u = unit_of(bl + " " + hl + " " + t)
    if t.startswith("The area of"):
        known = num(bl) if re.search(r"\d", bl) else num(hl)
        return [2 * num(t) / known], u, ""
    return [num(bl) * num(hl) / 2], u + "²", ""


def v_a_para(q):
    bl, hl = base_height(q)
    t = plain(q.text)
    u = unit_of(bl + " " + hl + " " + t)
    if t.startswith("The area of"):
        known = num(bl) if re.search(r"\d", bl) else num(hl)
        return [num(t) / known], u, ""
    return [num(bl) * num(hl)], u + "²", ""


def shoelace(P):
    return abs(sum(P[i][0] * P[(i + 1) % len(P)][1] - P[(i + 1) % len(P)][0] * P[i][1] for i in range(len(P)))) / 2


def v_a_comp(q):
    """Composite shape: the scale (units per px) from the labels of whole sides, every one agreeing, then
    the area measured from the drawn outline."""
    P = polygons(q.fig)[0]
    n = len(P)
    ks, u = [], None
    for x, y, t in svg_texts(q.fig):
        if not re.search(r"\d", t):
            continue
        u = unit_of(t)
        i = min(range(n), key=lambda k: seg_dist((x, y), P[k], P[(k + 1) % n]))
        d = seg_dist((x, y), P[i], P[(i + 1) % n])
        mid = ((P[i][0] + P[(i + 1) % n][0]) / 2, (P[i][1] + P[(i + 1) % n][1]) / 2)
        L = math.dist(P[i], P[(i + 1) % n])
        axis = abs(P[i][0] - P[(i + 1) % n][0]) < 0.01 or abs(P[i][1] - P[(i + 1) % n][1]) < 0.01
        if axis and d < 22 and math.dist((x, y), mid) < 0.45 * L + 20:
            whole_side = all(seg_dist(v, P[i], P[(i + 1) % n]) > 0.5 for v in
                             [p for p in P if p not in (P[i], P[(i + 1) % n])])
            ks.append((num(t) / L, t, whole_side))
    if n == 4:                                     # 'ramp': the base is split; use its left side and the base sum
        left = min(range(4), key=lambda i: (P[i][0] + P[(i + 1) % 4][0]))
        labs = {t: (x, y) for x, y, t in svg_texts(q.fig)}
        hl = min(labs, key=lambda t: seg_dist(labs[t], P[left], P[(left + 1) % 4]))
        k = num(hl) / math.dist(P[left], P[(left + 1) % 4])
        bottom = max(range(4), key=lambda i: P[i][1] + P[(i + 1) % 4][1])
        bl = [t for t in labs if t != hl and seg_dist(labs[t], P[bottom], P[(bottom + 1) % 4]) < 22]
        assert len(bl) == 2
        kb = sum(num(t) for t in bl) / math.dist(P[bottom], P[(bottom + 1) % 4])
        assert abs(kb / k - 1) < 0.02, "base labels do not match the drawing"
        # the dashed split meets the base where the left base label's part ends
        dash = [ln for ln, a in lines_(q.fig) if "dasharray" in a][0]
        xs = sorted([P[bottom][0], P[(bottom + 1) % 4][0]])
        lb = min(bl, key=lambda t: labs[t][0])
        assert abs((dash[0] - xs[0]) * k - num(lb)) < 0.02 * num(lb) + 0.05
    else:
        full = [kk for kk, t, w in ks if w]
        k = sorted(full)[len(full) // 2]
        assert max(full) / min(full) < 1.02, "side labels do not match the drawing"
    if n == 5:                                     # house: the roof height label must match the drawing too
        top = min(P, key=lambda p: p[1])
        eave = sorted(P, key=lambda p: p[1])[1][1]
        hts = [num(t) for x, y, t in svg_texts(q.fig) if re.search(r"\d", t)]
        assert any(abs(h_ - (eave - top[1]) * k) < 0.02 * h_ + 0.05 for h_ in hts), "roof height"
    A = shoelace(P) * k * k
    return [round(A)], u + "²", f"{A:.3f}"


def box_dims(q):
    return [x[2] for x in svg_texts(q.fig)]


def v_v_rect(q):
    labs = box_dims(q)
    t = plain(q.text)
    u = unit_of(" ".join(labs) + " " + t)
    if t.startswith("The volume of"):
        known = [num(x) for x in labs if re.search(r"\d", x)]
        return [num(t) / (known[0] * known[1])], u, ""
    a, b, c = (num(x) for x in labs)
    return [a * b * c], u + "³", ""


TO_BASE = {"mm": 1, "cm": 10, "m": 1000, "km": 10 ** 6, "cm²": 1, "m²": 100 * 100, "mL": 1, "cm³": 1, "L": 1000}
NAMES = {"millimetres": "mm", "centimetres": "cm", "metres": "m", "kilometres": "km", "square centimetres": "cm²",
         "square metres": "m²", "millilitres": "mL", "cubic centimetres": "cm³", "litres": "L"}


def v_units(q):
    t = plain(q.text)
    m = re.fullmatch(r"Convert ([\d. ]+) (\S+) to (.+)\.", t)
    v = Decimal(m.group(1).replace(" ", ""))
    tu = NAMES[m.group(3)]
    out = v * TO_BASE[m.group(2)] / TO_BASE[tu]
    return [float(out)], tu, ""


def v_a_trap(q):
    texts = sorted(svg_texts(q.fig), key=lambda x: x[1])
    top, h, bot = texts[0][2], texts[1][2], texts[2][2]
    return [num(h) * (num(top) + num(bot)) / 2], unit_of(top) + "²", ""


def v_a_kite(q):
    a, b = (num(x[2]) for x in svg_texts(q.fig))
    dl = [ln for ln, at in lines_(q.fig) if "dasharray" in at]
    if len(dl) == 2:
        L = sorted(math.hypot(l_[2] - l_[0], l_[3] - l_[1]) for l_ in dl)
        assert abs(L[1] / L[0] - max(a, b) / min(a, b)) < 0.03 * L[1] / L[0]
    return [a * b / 2], unit_of(svg_texts(q.fig)[0][2]) + "²", ""


# --------------------------------------------------------------- number --
def py_of(h):
    """Displayed HTML expression -> Python: roots, powers, stacked fractions, x and ÷, true minus."""
    h = re.sub(r'<span class="rad"><span class="ri">3</span>√<span class="rv">(.*?)</span></span>', r"cbrt(\1)", h)
    h = re.sub(r'<span class="rad">√<span class="rv">(.*?)</span></span>', r"sqrt(\1)", h)
    h = re.sub(r'<span class="frac"><span class="fn">(.*?)</span><span class="fd">(.*?)</span></span>', r"((\1)/(\2))", h)
    h = re.sub(r"<sup>(.*?)</sup>", r"**(\1)", h)
    h = re.sub(r"<[^>]+>", "", h).replace(MINUS, "-").replace("×", "*").replace("÷", "/")
    h = re.sub(r"(\d|\))\s*([a-z(])", r"\1*\2", h)
    h = re.sub(r"([a-z])\s*(?=[a-z(\d])", r"\1*", h) if not re.search(r"sqrt|cbrt", h) else h
    h = re.sub(r"\)\s*\(", ")*(", h)
    return h


def exact_root(v, k):
    r = round(float(v) ** (1 / k))
    assert r ** k == v, (v, k)
    return Fraction(r)


def evaluate(h, vals=None):
    e = re.sub(r"(?<![\w.])(\d+)(?![\w.])", r"F(\1)", py_of(h))
    env = {"F": Fraction, "sqrt": lambda v: exact_root(v, 2), "cbrt": lambda v: exact_root(v, 3), "__builtins__": {}}
    return eval(e, env, {k: Fraction(v) for k, v in (vals or {}).items()})  # noqa: S307 - our own printed text


def v_order_ops(q):
    return [evaluate(disp(q.fig))], None, ""


def money_or_unit(s):
    m = re.search(r"(\$|kg|km|m|L)\b|\$", s)
    if "$" in s:
        return "$"
    u = re.search(r"\d\s*(kg|km|m|L)\s*$", s.strip())
    return u.group(1) if u else None


def v_frac_qty(q):
    if q.fig:
        d = disp(q.fig)
        fr = re.search(r'class="fn">(\d+)</span><span class="fd">(\d+)<', d)
        rest = plain(d.split("</span></span>")[-1])
        Q_ = num(rest)
        return [Fraction(int(fr.group(1)), int(fr.group(2))) * Fraction(Q_)], None, ""
    fr = re.search(r'class="fn">(\d+)</span><span class="fd">(\d+)<', q.text)
    rest = plain(q.text.split("</span></span>")[1])
    Q_ = nums(rest)[0]
    return [Fraction(int(fr.group(1)), int(fr.group(2))) * Fraction(Q_)], None, ""


def v_pct_qty(q):
    p, Q_ = nums(plain(disp(q.fig)))
    return [Fraction(p) / 100 * Fraction(Q_)], None, ""


def v_pct_express(q):
    src = plain(disp(q.fig)) if q.fig else plain(q.text)
    a, b = nums(src)[:2]
    return [Fraction(a) / Fraction(b) * 100], "%", ""


def v_pow10(q):
    d = plain(disp(q.fig))
    a, op, p = re.fullmatch(r"([\d. ]+) ([×÷]) ([\d ]+)", d).groups()
    a, p = Decimal(a.replace(" ", "")), Decimal(p.replace(" ", ""))
    v = a * p if op == "×" else a / p
    return [], None, format(v.normalize(), "f").rstrip(".") if "." in format(v.normalize(), "f") else \
        re.sub(r"\B(?=(\d{3})+$)", " ", format(v.normalize(), "f")) if len(format(v.normalize(), "f")) >= 5 else \
        format(v.normalize(), "f")


def v_fdp(q):
    d = disp(q.fig)
    t = plain(q.text)
    fr = re.search(r'class="fn">(\d+)</span><span class="fd">(\d+)<', d)
    if fr:
        v = Fraction(int(fr.group(1)), int(fr.group(2)))
    elif "%" in plain(d):
        v = Fraction(Decimal(plain(d).rstrip("%"))) / 100
    else:
        v = Fraction(Decimal(plain(d)))
    if "fraction" in t:
        return [], None, f"{v.numerator}/{v.denominator}"
    if "percentage" in t:
        p = Decimal(v.numerator) / Decimal(v.denominator) * 100
        return [], None, format(p.normalize(), "f") + "%"
    dec = Decimal(v.numerator) / Decimal(v.denominator)
    return [], None, format(dec.normalize(), "f")


def v_idx_laws(q):
    d = disp(q.fig)
    m = re.fullmatch(r"\((.+?)<sup>(\d+)</sup>\)<sup>(\d+)</sup>", d)
    if m:
        b, e = plain(m.group(1)), int(m.group(2)) * int(m.group(3))
    else:
        m = re.fullmatch(r"(.+?)<sup>(\d+)</sup> ([×÷]) (.+?)<sup>(\d+)</sup>", d)
        b, b2 = plain(m.group(1)), plain(m.group(4))
        assert b == b2
        e = int(m.group(2)) + int(m.group(5)) if m.group(3) == "×" else int(m.group(2)) - int(m.group(5))
    return [], None, f"{b}^{e}"


def v_pct_change(q):
    t = plain(q.text)
    if "percentage" in t:                                      # profit / loss
        R = rows(q.fig)
        c, s = num(R["Cost price"][0]), num(R["Selling price"][0])
        pct = Fraction(Decimal(str(s))) / Fraction(Decimal(str(c))) * 100 - 100
        word = "profit" if pct > 0 else "loss"
        assert word in t
        return [abs(pct)], word, ""
    if q.fig and "<table" in q.fig:
        R = rows(q.fig)
        base = [v[0] for k, v in R.items() if k in ("Original price", "Weekly wage", "Population")][0]
        pk = [k for k in R if k in ("Discount", "Increase", "Decrease", "Pay rise")][0]
        p = Fraction(num(R[pk][0])) / 100
        up = pk in ("Increase", "Pay rise")
        new = Fraction(num(base)) * (1 + p if up else 1 - p)
    else:
        d = plain(disp(q.fig))
        up = d.startswith("Increase")
        a, p = nums(d)
        new = Fraction(a) * (1 + Fraction(p) / 100 if up else 1 - Fraction(p) / 100)
    return [new], None, ""


# -------------------------------------------------------------- algebra --
def given_values(t):
    return {k: Fraction(v) for k, v in re.findall(r"\b([a-z]) = (-?\d+)", t.replace(MINUS, "-"))}


def v_subst(q):
    vals = given_values(plain(q.text))
    return [evaluate(disp(q.fig), vals)], None, ""


def v_distrib(q):
    e = disp(q.fig)
    ans = q.answer.replace(MINUS, "-")
    ans_h = re.sub(r"([a-z])", r"<i>\1</i>", ans)
    letters = sorted(set(re.findall(r"[a-z]", plain(e))))
    for trial in range(4):
        vals = {c: Fraction(3 + 2 * i + 5 * trial) for i, c in enumerate(letters)}
        assert evaluate(e, vals) == evaluate(ans_h, vals), "expansion is wrong"
    assert not re.search(r"\(", ans), "not expanded"
    return [], None, q.answer


def v_equation(q):
    d = disp(q.fig)
    lhs, rhs = d.split(" = ")
    var = re.findall(r"<i>([a-z])</i>", d)[0]
    res = lambda v: evaluate(lhs, {var: v}) - evaluate(rhs, {var: v})   # noqa: E731
    r0, r1_ = res(0), res(1)
    sol = -r0 / (r1_ - r0)
    assert res(sol) == 0
    return [sol], None, f"{var} = {sol}"


UNITS_RATIO = {"cm": 1, "m": 100, "mm": Fraction(1, 10), "km": 100000, "min": 1, "h": 60}


def v_ratio_simp(q):
    d = plain(disp(q.fig))
    parts = []
    for p in d.split(":"):
        m = re.fullmatch(r"\s*(\d+)\s*([a-z]*)\s*", p)
        parts.append(Fraction(int(m.group(1))) * (UNITS_RATIO[m.group(2)] if m.group(2) else 1))
    g = math.gcd(*[int(p) for p in parts])
    return [], None, " : ".join(str(int(p) // g) for p in parts)


def v_ratio_share(q):
    t = plain(q.text)
    m = re.search(r"Share \$?([\d ]+?)(?: [a-z]+)? in the ratio ([\d : ]+)\.", t)
    amt = Fraction(int(m.group(1).replace(" ", "")))
    parts = [int(p) for p in m.group(2).split(":")]
    return [amt * p / sum(parts) for p in parts], None, ""


def v_rates(q):
    t = plain(q.text)
    if q.fig and "<table" in q.fig:
        offers = {}
        for k, v in rows(q.fig).items():
            qty, price = nums(v[0].replace("$", ""))
            offers[k] = Fraction(price) / Fraction(qty)
        best = min(offers, key=offers.get)
        assert sorted(offers.values())[0] < sorted(offers.values())[1]
        return [offers[best]], best, ""
    if "cost" in t:                                  # "3 kg of potatoes cost $12": price / quantity
        qty, price = nums(t.replace("$", ""))[:2]
        return [Fraction(price) / Fraction(qty)], None, ""
    a, b = nums(t.replace("$", ""))[:2]
    return [Fraction(a) / Fraction(b)], None, ""


def v_speed(q):
    t = plain(q.text)
    labs = [x[2] for x in svg_texts(q.fig) if re.search(r"\d|^x$", x[2])]
    if "average speed of" in t:
        v = Fraction(num(t.split("speed of")[1]))
        known = [x for x in labs if re.search(r"\d", x)][0]
        if re.search(r"hours?|seconds|minutes", known):
            return [v * Fraction(num(known))], None, ""
        return [Fraction(num(known)) / v], None, ""
    d = [x for x in labs if re.search(r"\d\s*(km|m)$", x)][0]
    tl = [x for x in labs if re.search(r"hours?|seconds|minutes", x)][0]
    dv, tv = Fraction(num(d)), Fraction(num(tl))
    if "minutes" in tl:
        assert "km/h" in t
        tv /= 60
    return [dv / tv], None, ""


def hm(s):
    h, m = s.split(":")
    return int(h) * 60 + int(m)


def v_time(q):
    t = plain(q.text)
    ts = re.findall(r"\b(\d{1,2}:\d\d)\b", t)
    m = re.match(r"Write (\d{1,2}):(\d\d) (am|pm) in 24-hour time\.", t)
    if m:
        h = int(m.group(1)) % 12 + (12 if m.group(3) == "pm" else 0)
        return [], None, f"{h:02d}:{m.group(2)}"
    m = re.match(r"Write (\d\d):(\d\d) in 12-hour time", t)
    if m:
        h = int(m.group(1))
        return [], None, f"{(h % 12) or 12}:{m.group(2)} {'am' if h < 12 else 'pm'}"
    if "runs for" in t or "takes" in t:
        dm = re.search(r"(?:(\d+) h )?(\d+) min", t)
        add = int(dm.group(1) or 0) * 60 + int(dm.group(2))
        e = hm(ts[0]) + add
        return [], None, f"{e // 60:02d}:{e % 60:02d}"
    d = hm(ts[1]) - hm(ts[0])
    h, mm = divmod(d, 60)
    return [], None, (f"{mm} minutes" if h == 0 else f"{h} h {mm} min")


# ------------------------------------------------- number plane, data, chance --
def rule_of(t):
    """'y = 2x + 3', 'y = 5 - x', 'y = 10 - 2x' -> (m, c)."""
    r = t.split("y = ")[1].split(".")[0].replace(" ", "")
    m = re.fullmatch(r"(-?\d*)x([+-]\d+)?", r)
    if m:
        k = m.group(1)
        return (int(k) if k not in ("", "-") else (1 if k == "" else -1)), int(m.group(2) or 0)
    m = re.fullmatch(r"(\d+)([+-])(\d*)x", r)
    return (1 if m.group(2) == "+" else -1) * int(m.group(3) or 1), int(m.group(1))


def v_table_vals(q):
    t = plain(q.text)
    m, c = rule_of(t)
    if "coordinates" in t:                         # read B from the grid; it must also fit the rule
        dots = [(float(a), float(b)) for a, b in re.findall(r'<circle cx="([-\d.]+)" cy="([-\d.]+)" r="3.0"', q.fig)]
        labs = {tt: (x, y) for x, y, tt in svg_texts(q.fig)}
        A_lab = [k for k in labs if k.startswith("A(")][0]
        ax, ay = (int(v) for v in nums(A_lab))
        Ad = min(dots, key=lambda d_: math.dist(d_, labs[A_lab]))
        Bd = min(dots, key=lambda d_: math.dist(d_, labs["B"]))
        grid = sorted({float(x1) for (x1, y1, x2, y2), a in lines_(q.fig) if abs(x1 - x2) < 1e-6 and 'stroke-width="0.7"' in a})
        u = grid[1] - grid[0]
        bx, by = ax + (Bd[0] - Ad[0]) / u, ay - (Bd[1] - Ad[1]) / u
        assert abs(bx - round(bx)) < 0.02 and abs(by - round(by)) < 0.02
        bx, by = round(bx), round(by)
        assert by == m * bx + c and ay == m * ax + c, "points not on the rule"
        return [], None, f"({bx}, {by})".replace("-", MINUS)
    C = cells(q.fig)
    xs = [int(num(v)) for v in C[0][1:]]
    ys = C[1][1:]
    ys = [y.replace("&nbsp;", "").strip() for y in ys]
    miss = [m * x + c for x, y in zip(xs, ys) if not y]
    for x, y in zip(xs, ys):
        if y:
            assert num(y) == m * x + c, "printed value does not fit the rule"
    return miss, None, ""


def dot_values(fig):
    """Scores from a dot plot: each dot's x mapped through the axis numbers."""
    nums_ = [(x, int(t)) for x, y, t in svg_texts(fig) if re.fullmatch(r"-?\d+", t)]
    (x0, v0), (x1, v1) = nums_[0], nums_[-1]
    step = (x1 - x0) / (v1 - v0)
    vals = []
    for cx, cy in re.findall(r'<circle cx="([-\d.]+)" cy="([-\d.]+)" r="3.8"', fig):
        v = v0 + (float(cx) - x0) / step
        assert abs(v - round(v)) < 0.02
        vals.append(round(v))
    return vals


def data_values(fig):
    if fig.lstrip().startswith("<svg"):
        return dot_values(fig)
    C = cells(fig)[0]
    return [num(v) for v in C if re.search(r"\d", v) and not re.fullmatch(r"[A-Za-z° ]+", v)]


def v_mean(q):
    v = data_values(q.fig)
    return [Fraction(sum(Fraction(x) for x in v), len(v))], None, ""


def v_med_mode(q):
    v = sorted(Fraction(Decimal(str(x))) for x in data_values(q.fig))
    t = plain(q.text)
    if "median" in t:
        n = len(v)
        med = v[n // 2] if n % 2 else (v[n // 2 - 1] + v[n // 2]) / 2
        return [med], None, ""
    from collections import Counter
    c = Counter(v).most_common()
    assert len(c) == 1 or c[0][1] > c[1][1], "no single mode"
    return [c[0][0]], None, ""


def v_range(q):
    v = data_values(q.fig)
    return [max(v) - min(v)], None, ""


DIE = {"an even number": 3, "a 5": 1, "a number less than 3": 2, "a multiple of 3": 2, "a number greater than 4": 2}


def v_prob(q):
    t = plain(q.text)
    if "marble" in t:
        R = rows(q.fig)
        cnt = [int(v) for v in R["Marbles"]]
        target = re.search(r"that it is (\w+)", t).group(1)
        return [Fraction(cnt[[c.lower() for c in R["Colour"]].index(target)], sum(cnt))], None, ""
    if "die" in t:
        ev = re.search(r"probability of rolling (.*)\.", t).group(1)
        return [Fraction(DIE[ev], 6)], None, ""
    word = plain(disp(q.fig)).replace(" ", "")
    letter = re.search(r"P\((\w)\)", t).group(1)
    return [Fraction(word.count(letter), len(word))], None, ""


def v_prob_not(q):
    d = disp(q.fig)
    m = re.search(r'class="fn">(\d+)</span><span class="fd">(\d+)<', d)
    return [1 - Fraction(int(m.group(1)), int(m.group(2)))], None, ""


def v_exp_prob(q):
    t = plain(q.text)
    if q.fig and "<table" in q.fig:
        R = rows(q.fig)
        f = [int(v) for v in R["Frequency"]]
        if "Colour" in R:
            target = re.search(r"probability of (\w+)\.", t).group(1)
            k = [c.lower() for c in R["Colour"]].index(target)
        else:
            face = re.search(r"rolling a (\d)", t).group(1)
            k = R["Number"].index(face)
        n = int(re.search(r"(\d+) times", t).group(1))
        assert n == sum(f), "trials do not match the table"
        return [Fraction(f[k], n)], None, ""
    c, n = nums(t)[:2]
    return [Fraction(int(c), int(n))], None, ""


CHECK = {"ang_comp": v_vertex_angles, "ang_point": v_vertex_angles, "ang_par": v_parallel,
         "ang_tri": v_polygon_angles, "ang_ext": v_polygon_angles, "ang_quad": v_polygon_angles,
         "pyth_hyp": v_pyth, "pyth_short": v_pyth,
         "perimeter": v_perimeter, "circ": v_circ, "a_rect": v_a_rect, "a_tri": v_a_tri, "a_para": v_a_para,
         "a_comp": v_a_comp, "v_rect": v_v_rect, "units": v_units, "a_trap": v_a_trap, "a_kite": v_a_kite,
         "a_circle": v_a_circle,
         "order_ops": v_order_ops, "idx_root": v_order_ops, "frac_qty": v_frac_qty, "pct_qty": v_pct_qty,
         "pct_express": v_pct_express, "pow10": v_pow10, "fdp": v_fdp, "idx_laws": v_idx_laws,
         "pct_change": v_pct_change,
         "subst": v_subst, "distrib": v_distrib, "equation": v_equation, "ratio_simp": v_ratio_simp,
         "ratio_share": v_ratio_share, "rates": v_rates, "speed": v_speed, "time": v_time,
         "table_vals": v_table_vals, "mean": v_mean, "med_mode": v_med_mode, "range": v_range, "prob": v_prob,
         "prob_not": v_prob_not, "exp_prob": v_exp_prob}


def answer_numbers(a):
    """Numbers in an answer string (fractions as fractions; grouped thousands joined)."""
    a = a.replace(MINUS, "-").replace("\u00a0", " ").replace("$", "")
    a = re.sub(r"(?<=\d) (?=\d{3}\b)", "", a)
    a = re.sub(r"\^\d+|[a-z]²|[a-z]³|m²|m³", "", a)
    out = []
    for m in re.finditer(r"-?\d+(?:\.\d+)?(?:/\d+)?", a):
        s = m.group(0)
        out.append(Fraction(s) if "/" in s else Fraction(Decimal(s)))
    return out


def verify(q):
    exp, extra, sym = CHECK[q.fam](q)
    a = q.answer.replace(MINUS, "-").replace("\u00a0", " ")
    if exp == []:                                        # symbolic answers: compare the text
        ok = a.replace(" ", "") == sym.replace(MINUS, "-").replace("\u00a0", "").replace(" ", "")
        return ok, sym
    got = answer_numbers(q.answer)
    if q.fam in ("rates",) and extra:                      # best buy: the letter, then the unit price
        ok = got == [Fraction(e) for e in exp] and a.split()[1] == extra.split()[-1]
    else:
        ok = len(got) == len(exp) and all(Fraction(g) == Fraction(e) if not isinstance(e, float)
                                          else abs(float(g) - e) < 1e-9 for g, e in zip(got, exp))
    if extra in ("profit", "loss"):
        ok = ok and extra in a
    elif extra == "°":
        ok = ok and a.endswith("°")
    elif extra == "%":
        ok = ok and a.endswith("%")
    elif extra and q.fam not in ("rates",):
        ok = ok and (a.endswith(" " + extra) or a.endswith(extra))
    shown = ", ".join(str(e) if isinstance(e, Fraction) and e.denominator != 1 else f"{float(e):g}" for e in exp)
    return ok, shown + (f" ({extra})" if extra else "") + (f" [{sym}]" if sym else "")


def main():
    argv = sys.argv[1:]
    n_sample = 20
    if "--sample" in argv:
        i = argv.index("--sample")
        n_sample = int(argv[i + 1])
        argv = argv[:i] + argv[i + 2:]
    versions = argv[0].split(",") if argv else ["M", "A"]
    terms = [int(t) for t in argv[1].split(",")] if len(argv) > 1 else [1, 2, 3, 4]
    import gen
    allq, bad = [], []
    for v in versions:
        for t in terms:
            S, _ = gen.generated_sessions(v, t)
            for s in S:
                for i, q in enumerate(s.qs):
                    name = f"{v} T{t} W{s.week} S{s.session} Q{i + 1} {q.fam}"
                    try:
                        ok, exp = verify(q)
                    except Exception as e:                   # noqa: BLE001 - report, don't stop
                        ok, exp = False, f"ERROR {type(e).__name__}: {e}"
                    allq.append((name, q, ok, exp))
                    if not ok:
                        bad.append((name, plain(q.text), q.answer, exp))
    print(f"{len(allq) - len(bad)}/{len(allq)} answers match the independent recomputation")
    for b in bad:
        print("  MISMATCH", *b)
    rng = random.Random(2026)
    print(f"\n{n_sample} random questions, recomputed:")
    for name, q, ok, exp in rng.sample(allq, min(n_sample, len(allq))):
        shown = plain(q.text)
        if q.fig and "<table" in q.fig:
            shown += "  [table: " + "; ".join(" ".join(c or "_" for c in r) for r in cells(q.fig)) + "]"
        elif q.fig and "disp" in q.fig:
            shown += "  [" + plain(disp(q.fig)) + "]"
        elif q.fig:
            shown += "  [figure labels: " + ", ".join(t for _, _, t in svg_texts(q.fig)) + "]"
        print(f"  {name}: {shown}\n      booklet: {q.answer}   recomputed: {exp}   {'OK' if ok else 'MISMATCH'}")
    return len(bad)


if __name__ == "__main__":
    sys.exit(1 if main() else 0)
