"""Independent answer check for the Year 10 Fractal Five.

Recomputes every answer from what the student actually sees - the question text, the numbers and
words printed in its figure (SVG labels, table cells, displayed expression) and, for triangles and
sectors, the drawing itself - with its own formulas, without using any of gen.py's arithmetic. For
right-angled triangles it finds the right angle and the marked angle from the drawing, works out
which labelled side is opposite, adjacent or the hypotenuse from where each label sits, and checks
that the drawn angle and side ratios agree with the labels.

    python3 wu/verify_answers.py [TERMS] [--sample N]

--sample N also prints N randomly chosen questions with the working (default 20).
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
    h = re.sub(r"<sup>(.*?)</sup>", r"^\1", h or "")
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


def v_trig(q):
    tri, R, V, role, ang = triangle(q)
    tri_check(q, role, tri, R, V, ang)
    text = plain(q.text)
    u = unit_of(" ".join(role.values()))
    m = re.search(r"Write (sin|cos|tan) θ as a fraction", text)
    if m:
        o, a, h = (num(role[k]) for k in ("opp", "adj", "hyp"))
        assert abs(o * o + a * a - h * h) < 1e-9
        fr = {"sin": Fraction(int(o), int(h)), "cos": Fraction(int(a), int(h)), "tan": Fraction(int(o), int(a))}[m.group(1)]
        return [fr], None, str(fr)
    if "θ" in ang[2]:                                    # find the angle
        k = {k: num(t) for k, t in role.items()}
        if "opp" in k and "hyp" in k:
            th = math.degrees(math.asin(k["opp"] / k["hyp"]))
        elif "adj" in k and "hyp" in k:
            th = math.degrees(math.acos(k["adj"] / k["hyp"]))
        else:
            th = math.degrees(math.atan(k["opp"] / k["adj"]))
        assert "nearest degree" in text
        drawn = angle_at(tri[V], tri[(V + 1) % 3], tri[(V + 2) % 3])
        assert abs(drawn - th) < 0.6
        return [round(th)], None, f"{round(th)}°"
    th = math.radians(num(ang[2]))
    unk = [k for k, t in role.items() if not re.search(r"\d", t)][0]
    kn = [k for k in role if k != unk][0]
    v = num(role[kn])
    H = {"hyp": v, "opp": v / math.sin(th), "adj": v / math.cos(th)}[kn]
    x = {"hyp": H, "opp": H * math.sin(th), "adj": H * math.cos(th)}[unk]
    assert "1 decimal place" in text
    return [r1(x)], u, f"{r1(x):g} {u}"


# --------------------------------------------------------------- shapes --
def v_similar(q):
    rects = [tuple(map(float, m)) for m in
             re.findall(r'<rect x="([-\d.]+)" y="([-\d.]+)" width="([\d.]+)" height="([\d.]+)"', q.fig)]
    assert len(rects) == 2
    info = [{} for _ in rects]
    for x, y, t in svg_texts(q.fig):
        for i, (rx, ry, rw, rh) in enumerate(rects):
            if t in ("Original", "Image") and rx <= x <= rx + rw and y > ry + rh:
                info[i]["name"] = t
            elif rx <= x <= rx + rw and y < ry:
                info[i]["l"] = t
            elif x > rx + rw and ry <= y <= ry + rh and x - (rx + rw) < 40:
                info[i]["w"] = t
    o = [d for d in info if d["name"] == "Original"][0]
    im = [d for d in info if d["name"] == "Image"][0]
    for d, (rx, ry, rw, rh) in zip(info, rects):        # drawn in proportion
        if re.search(r"\d", d["l"]) and re.search(r"\d", d["w"]):
            assert abs(rw / rh - num(d["l"]) / num(d["w"])) < 0.02 * rw / rh
    pair = "l" if re.search(r"\d", o["l"]) and re.search(r"\d", im["l"]) else "w"
    k = num(im[pair]) / num(o[pair])
    other = "l" if pair == "w" else "w"
    x = num(o[other]) * k if not re.search(r"\d", im[other]) else num(im[other]) / k
    u = unit_of(o[pair])
    return [x], u, f"{x:g} {u}"


def v_sector(q):
    m = re.search(r'<path d="M([-\d.]+),([-\d.]+) L([-\d.]+),([-\d.]+) A([\d.]+),[\d.]+ 0 (\d) 0 ([-\d.]+),([-\d.]+) Z"', q.fig)
    O, E1, E2 = (float(m.group(1)), float(m.group(2))), (float(m.group(3)), float(m.group(4))), \
        (float(m.group(7)), float(m.group(8)))
    drawn = angle_at(O, E1, E2)
    if m.group(6) == "1":
        drawn = 360 - drawn
    texts = svg_texts(q.fig)
    angs = [t for _, _, t in texts if "°" in t]
    th = num(angs[0]) if angs else 90.0
    if not angs:
        assert any(len(p) == 3 for p in polylines(q.fig))     # the right-angle square
    assert abs(drawn - th) < 0.5, (drawn, th)
    rl = [t for _, _, t in texts if "°" not in t][0]
    r, u = num(rl), unit_of(rl)
    if "arc length" in q.text:
        assert 'stroke-width="2.4"' in q.fig                 # the arc is highlighted
        v = th / 360 * 2 * math.pi * r
        return [r1(v)], u, f"{r1(v):g} {u}"
    v = th / 360 * math.pi * r * r
    return [r1(v)], u + "²", f"{r1(v):g} {u}²"


def v_circle(q):
    c = re.search(r'<circle cx="([-\d.]+)" cy="([-\d.]+)" r="([\d.]+)" fill="#FFFFFF"', q.fig)
    R = float(c.group(3))
    ln = [l_ for l_, a in lines_(q.fig)][0]
    L = math.hypot(ln[2] - ln[0], ln[3] - ln[1])
    t = svg_texts(q.fig)[0][2]
    v = num(t)
    r = v / 2 if abs(L - 2 * R) < 1 else v
    assert abs(L - R) < 1 or abs(L - 2 * R) < 1
    a = math.pi * r * r
    return [r1(a)], unit_of(t) + "²", f"{r1(a):g}"


def box_labels(q):
    return [num(t) for _, _, t in svg_texts(q.fig)], unit_of(svg_texts(q.fig)[0][2])


def v_sa_rect(q):
    (l, w, h), u = box_labels(q)
    return [2 * (l * w + l * h + w * h)], u + "²", ""


def v_capacity(q):
    (l, w, h), u = box_labels(q)
    assert u == "cm"
    cap = l * w * h / 1000
    if "decimal place" in q.text:
        cap = r1(cap)
    return [cap], "L", ""


def cyl_parts(q):
    """(radius, height, unit) of a cylinder or cone, reading whether the base line is a diameter."""
    e = re.search(r'<ellipse cx="([-\d.]+)" cy="([-\d.]+)" rx="([\d.]+)"', q.fig)
    if e:
        cx, cy, rx = (float(e.group(i)) for i in (1, 2, 3))
    else:                                                    # cone: the base ellipse is in the outline path
        m = re.search(r'A([\d.]+),([\d.]+) 0 1,0', q.fig)
        rx = float(m.group(1))
        cy = max(ln[1] for ln, a in lines_(q.fig) if "dasharray" not in a and abs(ln[1] - ln[3]) < 0.01)
    base = [ln for ln, a in lines_(q.fig) if "dasharray" not in a and abs(ln[1] - ln[3]) < 0.01 and abs(ln[1] - cy) < 0.5
            and ln[0] != ln[2] and 'stroke-width="1.5"' in a]
    L = abs(base[0][2] - base[0][0])
    dia = abs(L - 2 * rx) < 1.5
    assert dia or abs(L - rx) < 1.5
    texts = svg_texts(q.fig)
    rlab = min(texts, key=lambda t: abs(t[1] - cy))
    hlab = [t for t in texts if t is not rlab][0]
    r = num(rlab[2]) / (2 if dia else 1)
    return r, num(hlab[2]), unit_of(rlab[2])


def v_cyl(q):
    r, h, u = cyl_parts(q)
    if q.fam == "sa_cyl":
        return [r1(2 * math.pi * r * r + 2 * math.pi * r * h)], u + "²", ""
    return [r1(math.pi * r * r * h)], u + "³", ""


def v_cone(q):
    r, h, u = cyl_parts(q)
    return [r1(math.pi * r * r * h / 3)], u + "³", ""


def v_pyramid(q):
    (l, w, h), u = box_labels(q)
    return [l * w * h / 3], u + "³", ""


def v_prism(q):
    t = plain(q.text)
    A = num(t)
    u = unit_of(t)
    if "the volume is" in t:
        V = nums(t)[1]
        return [V / A], u, ""
    L = num(svg_texts(q.fig)[0][2])
    return [A * L], u + "³", ""


def v_speed(q):
    t = plain(q.text)
    labs = [x[2] for x in svg_texts(q.fig) if x[2] not in ("A", "B")]
    if "average speed of" in t:
        v = num(t.split("speed of")[1])
        known = [x for x in labs if re.search(r"\d", x)][0]
        if re.search(r"hours|seconds|minutes", known):
            tt = num(known)
            return [v * tt], None, ""
        return [num(known) / v], None, ""
    d, tl = labs
    dv, tv = num(d), num(tl)
    if "minutes" in tl:
        tv /= 60
    return [dv / tv], None, ""


# ------------------------------------------------------------------ money --
def pct_of(s):
    return num(s) / 100


def money_v(s):
    return num(s)


def v_pct_change(q):
    t = plain(q.text)
    if q.fig and "<table" in q.fig:
        R = rows(q.fig)
        base = [v[0] for k, v in R.items() if k in ("Original price", "Weekly wage", "Price before GST", "Population")][0]
        pk = [k for k in R if k in ("Discount", "Increase", "Decrease", "Pay rise", "GST")][0]
        p = pct_of(R[pk][0])
        up = pk in ("Increase", "Pay rise", "GST")
        new = money_v(base) * (1 + p if up else 1 - p)
    else:
        d = plain(disp(q.fig))
        up = d.startswith("Increase")
        a, p = nums(d)
        new = a * (1 + p / 100 if up else 1 - p / 100)
    return [r2(new + 1e-9)], None, ""


def v_pct_original(q):
    t = plain(q.text)
    if q.fig and "<table" in q.fig:
        R = rows(q.fig)
        if "Discount" in R:
            return [r2(money_v(R["Sale price"][0]) / (1 - pct_of(R["Discount"][0])))], None, ""
        newk = [k for k in R if k.startswith("New")][0]
        return [r2(money_v(R[newk][0]) / (1 + pct_of(R["Increase"][0])))], None, ""
    p, part = nums(plain(disp(q.fig)))
    return [r2(part / (p / 100))], None, ""


def v_profit(q):
    R = rows(q.fig)
    c, s = money_v(R["Cost price"][0]), money_v(R["Selling price"][0])
    pct = (s - c) / c * 100
    word = "profit" if pct > 0 else "loss"
    assert word in plain(q.text)
    return [abs(pct)], word, ""


def years(s):
    s = s.replace("½", ".5")
    v = num(s)
    return v / 12 if "month" in s else v


def v_interest(q):
    R = rows(q.fig)
    P = money_v([v for k, v in R.items() if k.startswith("Amount")][0][0])
    r = pct_of(R["Interest rate"][0])
    n = years(R["Time"][0])
    return [r2(P * r * n)], None, ""


def v_wages(q):
    t = plain(q.text)
    if not q.fig:
        rate, hrs = nums(t)[:2]
        return [r2(rate * hrs)], None, ""
    R = rows(q.fig)
    rate, hrs = money_v(R["Hourly rate"][0]), num(R["Normal hours"][0])
    ot_k = [k for k in R if k in ("Time-and-a-half", "Double time")][0]
    mult = 1.5 if ot_k == "Time-and-a-half" else 2
    return [r2(rate * hrs + mult * rate * num(R[ot_k][0]))], None, ""


def v_salary(q):
    t = plain(q.text)
    sal = num(t)
    div = 52 if "weekly" in t else 26
    pay = sal / div
    if abs(pay * 100 - round(pay * 100)) > 1e-6:
        assert "nearest cent" in t
    return [r2(pay)], None, ""


def v_commission(q):
    R = rows(q.fig)
    if "Weekly base wage" in R:
        return [r2(money_v(R["Weekly base wage"][0]) + pct_of(R["Commission"][0]) * money_v(R["Sales this week"][0]))], None, ""
    return [r2(pct_of(R["Commission rate"][0]) * money_v(R["Value of sales"][0]))], None, ""


def v_holiday(q):
    R = rows(q.fig)
    w = money_v(R["Weekly pay"][0])
    weeks = num(R["Holiday"][0])
    load = pct_of(R["Leave loading"][0])
    return [r2(weeks * w * (1 + load))], None, ""


# ------------------------------------------------------------ algebra --
TERM = re.compile(r"(\d*)\s*(?:×\s*)?(?:<i>([a-z])</i>|(\d+))(?:<sup>([^<]+)</sup>)?")


def parse_term(h):
    """'3<i>x</i><sup>4</sup>' -> (3, 'x', 4); '2<sup>3</sup>' -> (1, 2, 3)."""
    h = h.strip()
    m = re.fullmatch(r"(\d*)<i>([a-z])</i>(?:<sup>([^<]+)</sup>)?", h)
    if m:
        return int(m.group(1) or 1), m.group(2), int((m.group(3) or "1").replace(MINUS, "-"))
    m = re.fullmatch(r"(\d+)<sup>([^<]+)</sup>", h)
    if m:
        return 1, int(m.group(1)), int(m.group(2).replace(MINUS, "-"))
    m = re.fullmatch(r"(\d+)", h)
    return int(m.group(1)), None, 1


def v_idx(q):
    d = disp(q.fig)
    m = re.fullmatch(r"\((.*)\)<sup>(\d+)</sup>", d)
    if m:
        c, b, e = parse_term(m.group(1))
        n = int(m.group(2))
        return [], None, f"{'' if c ** n == 1 else c ** n}{b}^{e * n}"
    op = "×" if "×" in d else "÷"
    a, b_ = d.split(f" {op} ")
    c1, b, e1 = parse_term(a)
    c2, b2, e2 = parse_term(b_)
    assert b == b2
    c = c1 * c2 if op == "×" else Fraction(c1, c2)
    e = e1 + e2 if op == "×" else e1 - e2
    c = int(c)
    return [], None, f"{'' if c == 1 else c}{b}" + ("" if e == 1 else f"^{e}")


def v_zero_neg(q):
    d = disp(q.fig).replace(MINUS, "-")
    m = re.fullmatch(r"\((\d+)<i>([a-z])</i>\)<sup>0</sup>", d)
    if m:
        return [], None, "1"
    m = re.fullmatch(r"(\d*)<i>([a-z])</i><sup>(-?\d+)</sup>", d)
    if m:
        k, p, e = m.group(1), m.group(2), int(m.group(3))
        if e == 0:
            return [], None, k or "1"
        assert e < 0
        return [], None, f"{k or 1}/{p}^{-e}"
    total = Fraction(0)
    for term in d.split(" + "):
        mm = re.fullmatch(r"(\d+)<sup>(-?\d+)</sup>", term)
        total += Fraction(int(mm.group(1))) ** int(mm.group(2)) if mm else Fraction(int(term))
    return [], None, str(total)


def v_sci(q):
    d = plain(disp(q.fig))
    if "×" in d:
        a, e = re.fullmatch(r"([\d.]+) × 10\^(-?\d+)", d).groups()
        v = Decimal(a).scaleb(int(e))
        s = format(v.normalize(), "f")
        w, _, fpart = s.partition(".")
        w = re.sub(r"\B(?=(\d{3})+$)", " ", w) if len(w) >= 5 else w
        return [], None, w + ("." + fpart if fpart else "")
    v = Decimal(d.replace(" ", ""))
    e = v.adjusted()
    a = format(v.scaleb(-e).normalize(), "f")
    return [], None, f"{a} × 10^{e}"


def v_formula_sub(q):
    f = plain(disp(q.fig))
    lhs, rhs = [s.strip() for s in f.split("=")]
    t = plain(q.text)
    find = re.match(r"Find (\w) when", t).group(1)
    vals = {k: float(v) for k, v in re.findall(r"(\w) = (-?\d+(?:\.\d+)?)", t)}
    expr = rhs.replace("½", "0.5*").replace(" ", "")
    expr = re.sub(r"(\d)([A-Za-z(])", r"\1*\2", expr)
    expr = re.sub(r"([A-Za-z])(?=[A-Za-z(])", r"\1*", expr)

    def res(x):
        env = dict(vals)
        env[find] = x
        return env[lhs] - eval(expr, {}, env)            # noqa: S307 - our own printed formula
    r0, r1_ = res(0.0), res(1.0)
    return [round(-r0 / (r1_ - r0), 9)], None, ""


def v_ratio(q):
    t = plain(q.text)
    m = re.search(r"Share \$?([\d. ]+?)(?: \w+)? in the ratio ([\d : ]+)\.", t)
    amt = num(m.group(1))
    parts = [int(p) for p in m.group(2).split(":")]
    return [r2(amt * p / sum(parts)) for p in parts], None, ""


# ------------------------------------------------------- graphs and data --
def v_gradient(q):
    P = [tuple(map(int, m)) for m in re.findall(r"[AB]\((-?\d+), (-?\d+)\)", plain(q.fig))]
    (x1, y1), (x2, y2) = P
    return [Fraction(y2 - y1, x2 - x1)], None, ""


def v_linear(q):
    d = plain(disp(q.fig)).replace(" ", "")
    m = re.fullmatch(r"y=(-?[\d.]*)x([+-][\d.]+)?", d)
    if m:
        ms = m.group(1)
        mm = float(ms) if ms not in ("", "-") else (1.0 if ms == "" else -1.0)
        c = float(m.group(2) or 0)
    else:
        m = re.fullmatch(r"y=(-?[\d.]+)([+-])([\d.]*)x", d)
        c = float(m.group(1))
        mm = (1 if m.group(2) == "+" else -1) * float(m.group(3) or 1)
    t = plain(q.text)
    if "gradient" in t:
        return [mm, c], None, ""
    x = num(t.split("x =")[1])
    return [mm * x + c], None, ""


def v_mean(q):
    C = cells(q.fig)
    if len(C) == 2:
        xs, fs = [num(v) for v in C[0][1:]], [num(v) for v in C[1][1:]]
        m = sum(a * b for a, b in zip(xs, fs)) / sum(fs)
    else:
        v = [num(x) for x in C[0][1:]]
        m = sum(v) / len(v)
    if "decimal place" in q.text:
        m = r1(m)
    return [m], None, ""


def v_prob(q):
    t = plain(q.text)
    if "marble" in t:
        R = rows(q.fig)
        cols = R["Colour"]
        cnt = [int(v) for v in R["Marbles"]]
        target = re.search(r"that it is (\w+)", t).group(1)
        return [Fraction(cnt[[c.lower() for c in cols].index(target)], sum(cnt))], None, ""
    if "die" in t:
        ev = re.search(r"probability of rolling (.*)\.", t).group(1)
        fav = {"an even number": 3, "a 5": 1, "a number less than 3": 2, "a multiple of 3": 2, "a prime number": 3,
               "a number greater than 1": 5}[ev]
        return [Fraction(fav, 6)], None, ""
    word = plain(disp(q.fig)).replace(" ", "")
    letter = re.search(r"P\((\w)\)", t).group(1)
    return [Fraction(word.count(letter), len(word))], None, ""


def v_prob_not(q):
    d = disp(q.fig)
    m = re.search(r'class="fn">(\d+)</span><span class="fd">(\d+)<', d)
    if m:
        return [1 - Fraction(int(m.group(1)), int(m.group(2)))], None, ""
    p = Fraction(plain(d).split("=")[1].strip())
    return [1 - p], None, ""


def v_freq(q):
    t = plain(q.text)
    m = re.search(r"rolled ([\d ]+) times. How many times would you expect (.*)\?", t)
    if m:
        n = num(m.group(1))
        fav = {"a 4": 1, "an even number": 3, "a number greater than 4": 2, "a 1 or a 2": 2}[m.group(2)]
        return [n * fav / 6], None, ""
    m = re.search(r"tossed (\d+) times. How many heads", t)
    if m:
        return [int(m.group(1)) / 2], None, ""
    if t.startswith("On how many"):
        C = cells(q.fig)
        return [float(Fraction(C[0][1])) * num(C[1][1])], None, ""
    if "spinner" in t:
        R = rows(q.fig)
        target = re.search(r"relative frequency of (\w+)\.", t).group(1)
        cnt = [int(v) for v in R["Frequency"]]
        return [Fraction(cnt[[c.lower() for c in R["Colour"]].index(target)], sum(cnt))], None, ""
    c, n = nums(t)[:2]
    return [Fraction(int(c), int(n))], None, ""


CHECK = {"pyth_hyp": v_pyth, "pyth_short": v_pyth, "trig_ratio": v_trig, "trig_top": v_trig, "trig_bottom": v_trig,
         "trig_angle": v_trig, "similar": v_similar, "a_circle": v_circle, "arc": v_sector, "sector": v_sector,
         "sa_rect": v_sa_rect, "sa_cyl": v_cyl, "v_prism": v_prism, "v_cyl": v_cyl, "capacity": v_capacity,
         "v_pyramid": v_pyramid, "v_cone": v_cone, "pct_change": v_pct_change, "pct_original": v_pct_original,
         "profit_pct": v_profit, "interest": v_interest, "wages": v_wages, "salary": v_salary,
         "commission": v_commission, "holiday_pay": v_holiday, "idx": v_idx, "zero_neg": v_zero_neg, "sci": v_sci,
         "formula_sub": v_formula_sub, "ratio": v_ratio, "speed": v_speed, "gradient": v_gradient,
         "linear": v_linear, "mean": v_mean, "prob": v_prob, "prob_not": v_prob_not, "freq": v_freq}


def answer_numbers(a):
    """Numbers in an answer string, with fractions read as fractions (the first of 'x (or y)')."""
    a = a.split(" (or ")[0].replace(MINUS, "-").replace(" ", " ")
    a = re.sub(r"(?<=\d) (?=\d{3}\b)", "", a)
    out = []
    for m in re.finditer(r"-?\d+(?:\.\d+)?(?:/\d+)?", a):
        s = m.group(0)
        out.append(Fraction(s) if "/" in s else float(s))
    return out


def same(exp, got):
    if len(exp) != len(got):
        return False
    for e, g in zip(exp, got):
        if isinstance(e, Fraction) or isinstance(g, Fraction):
            if Fraction(e).limit_denominator(10 ** 6) != Fraction(g).limit_denominator(10 ** 6):
                return False
        elif abs(e - g) > 1e-6 * max(1, abs(e)):
            return False
    return True


def verify(q):
    exp, extra, sym = CHECK[q.fam](q)
    a = q.answer.replace(MINUS, "-").replace(" ", " ")
    if exp == []:                                        # symbolic answers: compare the text
        ok = a.replace(" ", "") == sym.replace(" ", "")
    else:
        ok = same(exp, answer_numbers(q.answer))
        if extra in ("profit", "loss"):
            ok = ok and extra in a
        elif extra and extra not in ("L",):
            ok = ok and a.endswith(extra)
        elif extra == "L":
            ok = ok and a.endswith(" L")
    return ok, (sym or ", ".join(str(round(float(e), 4)) for e in exp))


def main():
    argv = sys.argv[1:]
    if "--sample" in argv:
        i = argv.index("--sample")
        argv = argv[:i] + argv[i + 2:]
    args = [a for a in argv if not a.startswith("--")]
    terms = [int(t) for t in args[0].split(",")] if args else [1, 2, 3, 4]
    n_sample = int(sys.argv[sys.argv.index("--sample") + 1]) if "--sample" in sys.argv else 20
    import gen
    allq, bad = [], []
    for t in terms:
        S, _ = gen.generated_sessions(t)
        for s in S:
            for i, q in enumerate(s.qs):
                name = f"T{t} W{s.week} S{s.session} Q{i + 1} {q.fam}"
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
            shown += "  [table: " + "; ".join(" ".join(r) for r in cells(q.fig)) + "]"
        elif q.fig and "disp" in q.fig:
            shown += "  [" + plain(disp(q.fig)) + "]"
        elif q.fig:
            shown += "  [figure: " + ", ".join(t for _, _, t in svg_texts(q.fig)) + "]"
        print(f"  {name}: {shown}\n      booklet: {q.answer}   recomputed: {exp}   {'OK' if ok else 'MISMATCH'}")
    return len(bad)


if __name__ == "__main__":
    sys.exit(1 if main() else 0)
