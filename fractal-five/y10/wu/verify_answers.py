# -*- coding: utf-8 -*-
"""Independent answer check (Year 10).

Recomputes answers from what the student actually sees - the question text, the table cells, the
displayed expression and the labels printed in the figure - with its own formulas, without using any of
gen.py's arithmetic. In the trigonometry figures the sides' roles (opposite / adjacent / hypotenuse)
are read from the drawn triangle itself (the right angle and the marked angle located from the
geometry), and the drawn angle is checked against its label.

    python3 wu/verify_answers.py [TERMS] [--sample N]

--sample N checks N questions picked at random (seeded) across the terms and prints each one in full;
otherwise every question is checked and only mismatches are printed.
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
    s = re.sub(r"<[^>]+>", "", h or "").replace(MINUS, "-").replace(" ", "")
    return re.sub(r"\s+", " ", s).strip()


def svg_texts(fig):
    out = []
    for attrs, body in re.findall(r"<text\b([^>]*)>(.*?)</text>", fig or "", re.S):
        x = float(re.search(r'\bx="([-\d.]+)"', attrs).group(1))
        y = float(re.search(r'\by="([-\d.]+)"', attrs).group(1))
        anchor = (re.search(r'text-anchor="(\w+)"', attrs) or [None, "middle"])[1]
        out.append((x, y, plain(body), anchor))
    return out


def svg_lines(fig):
    return [tuple(float(v) for v in m) for m in
            re.findall(r'<line x1="([-\d.]+)" y1="([-\d.]+)" x2="([-\d.]+)" y2="([-\d.]+)"', fig or "")]


def cells(fig):
    return [[plain(c) for c in re.findall(r"<td[^>]*>(.*?)</td>", row)] for row in re.findall(r"<tr>(.*?)</tr>", fig or "")]


def nums(s):
    s = (s or "").replace(MINUS, "-").replace(" ", "").replace(",", "")
    return [float(v) for v in re.findall(r"-?\d+(?:\.\d+)?", s)]


def num(s):
    v = nums(s)
    assert v, s
    return v[0]


def is_x(t):
    return t.strip() in ("x", "θ")


# ---------------------------------------------------------------- rounding --
def rnd(v, places):
    return float(Decimal(repr(float(v))).quantize(Decimal(1).scaleb(-places), rounding=ROUND_HALF_UP))


def places_asked(text):
    t = plain(text)
    if "1 decimal place" in t:
        return 1
    if "nearest degree" in t:
        return 0
    if "nearest cent" in t:
        return 2
    return None


# ------------------------------------------------------------ trig figures --
def triangle(fig):
    m = re.search(r'<polygon points="([^"]+)"', fig)
    P = [tuple(float(v) for v in p.split(",")) for p in m.group(1).split()]
    assert len(P) == 3
    return P


def _seg_dist(p, a, b):
    ax, ay = b[0] - a[0], b[1] - a[1]
    t = max(0, min(1, ((p[0] - a[0]) * ax + (p[1] - a[1]) * ay) / (ax * ax + ay * ay)))
    return math.hypot(p[0] - a[0] - t * ax, p[1] - a[1] - t * ay)


def _angle_at(P, i):
    a, b, c = P[i], P[(i + 1) % 3], P[(i + 2) % 3]
    u = (b[0] - a[0], b[1] - a[1])
    w = (c[0] - a[0], c[1] - a[1])
    return math.degrees(math.acos((u[0] * w[0] + u[1] * w[1]) / (math.hypot(*u) * math.hypot(*w))))


def trig_roles(fig):
    """From the drawing: {'opp'|'adj'|'hyp': label text}, the marked angle's label, and its drawn size."""
    P = triangle(fig)
    ang = [_angle_at(P, i) for i in range(3)]
    R = min(range(3), key=lambda i: abs(ang[i] - 90))
    assert abs(ang[R] - 90) < 0.5, ang
    texts = [(x, y - 0.34 * 13, t) for x, y, t, _ in svg_texts(fig)]
    alab = [t for t in texts if "°" in t[2] or t[2] == "θ"]
    assert len(alab) == 1, texts
    ax, ay, at = alab[0]
    V = min((i for i in range(3) if i != R), key=lambda i: math.hypot(ax - P[i][0], ay - P[i][1]))
    sides = {}
    for x, y, t in texts:
        if (x, y, t) == alab[0]:
            continue
        k = min(range(3), key=lambda i: _seg_dist((x, y), P[i], P[(i + 1) % 3]))
        # side k joins P[k] and P[k+1]; it is opposite the third vertex
        opp_vertex = (k + 2) % 3
        role = "hyp" if opp_vertex == R else ("opp" if opp_vertex == V else "adj")
        sides[role] = t
    return sides, at, ang[V]


def side_val(t):
    return None if is_x(t) else num(t)


def solve_side(sides, theta):
    """The unknown side x from one known side and the angle."""
    th = math.radians(theta)
    known = {k: side_val(v) for k, v in sides.items() if not is_x(v)}
    (unk,) = [k for k, v in sides.items() if is_x(v)]
    (kk, kv), = known.items()
    ratio = {("hyp", "opp"): math.sin(th), ("hyp", "adj"): math.cos(th), ("adj", "opp"): math.tan(th)}
    if (kk, unk) in ratio:
        return kv * ratio[(kk, unk)]
    return kv / ratio[(unk, kk)]


def elev_parts(fig):
    """Elevation/depression figure: ground distance (label below the ground line), height, angle."""
    T = svg_texts(fig)
    lens = [(x, y, t) for x, y, t, _ in T if t not in ("tree", "tower", "cliff", "boat") and "°" not in t and t != "θ"]
    angle = [t for _, _, t, _ in T if "°" in t or t == "θ"]
    ground = max(lens, key=lambda r: r[1])
    height = [r for r in lens if r is not ground][0]
    return ground[2], height[2], angle[0]


# ------------------------------------------------------------- families --
def v_trig(q):
    t = plain(q.text)
    if "elevation" in t or "depression" in t:
        g, h, a = elev_parts(q.fig)
        if a == "θ":
            return math.degrees(math.atan2(num(h), num(g)))
        assert is_x(h)
        return num(g) * math.tan(math.radians(num(a)))
    sides, at, drawn = trig_roles(q.fig)
    if q.fam == "trig_ratio":
        r = re.search(r"Write (sin|cos|tan)", t).group(1)
        o, a_, h = (int(num(sides[k])) for k in ("opp", "adj", "hyp"))
        assert o * o + a_ * a_ == h * h
        assert abs(math.degrees(math.atan2(o, a_)) - drawn) < 0.5, "drawn angle"
        return {"sin": Fraction(o, h), "cos": Fraction(a_, h), "tan": Fraction(o, a_)}[r]
    if q.fam == "trig_angle":
        k = {k: num(v) for k, v in sides.items()}
        if "hyp" in k and "opp" in k:
            th = math.degrees(math.asin(k["opp"] / k["hyp"]))
        elif "hyp" in k:
            th = math.degrees(math.acos(k["adj"] / k["hyp"]))
        else:
            th = math.degrees(math.atan2(k["opp"], k["adj"]))
        assert abs(th - drawn) < 0.5, ("drawn angle", th, drawn)
        return th
    theta = num(at)
    assert abs(theta - drawn) < 0.5, ("drawn angle", theta, drawn)
    return solve_side(sides, theta)


def v_similar(q):
    T = svg_texts(q.fig)
    names = {t: x for x, y, t, _ in T if t in ("Original", "Image")}
    labs = [(x, y, t) for x, y, t, _ in T if t not in names]
    rect = {"Original": [], "Image": []}
    for x, y, t in labs:
        rect[min(names, key=lambda n: abs(names[n] - x))].append((x, y, t))
    def lw(rs):
        top = min(rs, key=lambda r: r[1])
        side = [r for r in rs if r is not top][0]
        return top[2], side[2]
    (ol, ow), (il, iw) = lw(rect["Original"]), lw(rect["Image"])
    sf = Fraction(str(num(il))) / Fraction(str(num(ol)))
    return float(sf * Fraction(str(num(ow)))) if is_x(iw) else float(Fraction(str(num(iw))) / sf)


def _circle_is_diameter(fig):
    L = max(math.hypot(x2 - x1, y2 - y1) for x1, y1, x2, y2 in svg_lines(fig))
    m = re.search(r'<circle cx="[-\d.]+" cy="[-\d.]+" r="([-\d.]+)" fill="#FFFFFF"', fig)
    return L > 1.5 * float(m.group(1))


def v_a_circle(q):
    (lab,) = [t for _, _, t, _ in svg_texts(q.fig)]
    r = num(lab) / (2 if _circle_is_diameter(q.fig) else 1)
    return math.pi * r * r


def v_sector(q):
    T = [t for _, _, t, _ in svg_texts(q.fig)]
    r = num([t for t in T if "°" not in t][0])
    deg = [t for t in T if "°" in t]
    th = num(deg[0]) if deg else 90.0              # a quadrant is marked with a right-angle square
    if not deg:
        assert re.search(r"<polyline", q.fig), "no angle label and no right-angle mark"
    return th / 360 * (2 * math.pi * r if q.fam == "arc" else math.pi * r * r)


def three(q):
    v = [num(t) for _, _, t, _ in svg_texts(q.fig)]
    assert len(v) == 3, v
    return v


def v_box(q):
    l, w, h = three(q)
    if q.fam == "sa_rect":
        return 2 * (l * w + l * h + w * h)
    if q.fam == "capacity":
        assert "cm" in q.fig
        return l * w * h / 1000
    return l * w * h / 3                            # pyramid


def _solid_r_h(q):
    T = svg_texts(q.fig)
    if q.fam == "v_cone":
        (h,) = [t for x, y, t, a in T if a == "end"]
        (rl,) = [t for x, y, t, a in T if a != "end"]
        m = re.search(r'A([-\d.]+),[-\d.]+ 0 0,0', q.fig)
        rx = float(m.group(1))
    else:
        rl, h = sorted(T, key=lambda r: r[1])[0][2], sorted(T, key=lambda r: r[1])[1][2]
        m = re.search(r'<ellipse cx="[-\d.]+" cy="[-\d.]+" rx="([-\d.]+)"', q.fig)
        rx = float(m.group(1))
    L = max(math.hypot(x2 - x1, y2 - y1) for x1, y1, x2, y2 in svg_lines(q.fig) if abs(y1 - y2) < 1e-6)
    dia = L > 1.5 * rx
    return num(rl) / (2 if dia else 1), num(h)


def v_solid(q):
    r, h = _solid_r_h(q)
    return {"sa_cyl": 2 * math.pi * r * r + 2 * math.pi * r * h, "v_cyl": math.pi * r * r * h,
            "v_cone": math.pi * r * r * h / 3}[q.fam]


def v_prism(q):
    t = plain(q.text)
    A = num(re.search(r"area of ([\d.]+)", t).group(1))
    (lab,) = [x for _, _, x, _ in svg_texts(q.fig)]
    if "volume is" in t:
        return num(re.search(r"volume is ([\d.]+)", t).group(1)) / A
    return A * num(lab)


def table_dict(fig):
    return {r[0]: r[1] for r in cells(fig) if len(r) == 2}


def v_pct_change(q):
    t, d = plain(q.text), table_dict(q.fig)
    if d:
        (amt,) = [num(v) for k, v in d.items() if k in ("Original price", "Weekly wage", "Price before GST", "Population")]
        (p,) = [num(v) for k, v in d.items() if "%" in v]
        dec = "Discount" in d or "Decrease" in d
    else:
        s = plain(q.fig)
        amt, p = nums(s)[0], nums(s)[1]
        dec = s.startswith("Decrease")
    return amt * (100 - p) / 100 if dec else amt * (100 + p) / 100


def v_pct_original(q):
    d = table_dict(q.fig)
    if not d:
        p, part = nums(plain(q.fig))
        return part / p * 100
    if "Discount" in d:
        return num(d["Sale price"]) / (100 - num(d["Discount"])) * 100
    new = [num(v) for k, v in d.items() if k.startswith("New")][0]
    return new / (100 + num(d["Increase"])) * 100


def v_profit_pct(q):
    d = table_dict(q.fig)
    c, s = num(d["Cost price"]), num(d["Selling price"])
    return abs(s - c) / c * 100


def v_interest(q):
    t = plain(q.text)
    P = num(re.search(r"\$([\d.]+)", t).group(1))
    r = num(re.search(r"([\d.]+)% per year", t).group(1))
    n, unit = re.search(r"for ([\d.]+) (years?|months)", t).groups()
    years = float(n) / (12 if unit == "months" else 1)
    return P * r / 100 * years


def v_wages(q):
    t = plain(q.text)
    if q.fig:
        d = table_dict(q.fig)
        rate, hrs = num(d["Hourly rate"]), num(d["Normal hours"])
        (ok,) = [k for k in d if k.startswith("Overtime")]
        k = 1.5 if "time-and-a-half" in ok else 2.0
        return rate * hrs + k * rate * num(d[ok])
    rate = num(re.search(r"\$([\d.]+) an hour", t).group(1))
    hrs = num(re.search(r"works ([\d.]+) hours", t).group(1))
    return rate * hrs


def v_salary(q):
    t = plain(q.text)
    sal = num(re.search(r"\$([\d.]+) a year", t).group(1))
    return sal / (52 if "weekly" in t else 26)


def v_commission(q):
    d = table_dict(q.fig)
    if "Weekly base wage" in d:
        return num(d["Weekly base wage"]) + num(d["Commission"]) / 100 * num(d["Sales this week"])
    return num(d["Commission rate"]) / 100 * num(d["Sales"])


def v_holiday(q):
    w = num(re.search(r"\$([\d.]+) a week", plain(q.text)).group(1))
    return 4 * w * 1.175


def v_idx(q):
    h = (q.fig or "").replace(MINUS, "-")
    term = r"(\d*)(?:<i>([a-z])</i>|(\d+))<sup>(\d+)</sup>"
    m = re.search(r"\(" + term + r"\)<sup>(\d+)</sup>", h)
    if m:
        c, var, base, e, n = m.groups()
        c = int(c or 1) ** int(n)
        e = int(e) * int(n)
    else:
        (c1, v1, b1, e1), (c2, v2, b2, e2) = re.findall(term, h)
        assert (v1, b1) == (v2, b2)
        var, base = v1, b1
        if "×" in h:
            c, e = int(c1 or 1) * int(c2 or 1), int(e1) + int(e2)
        else:
            assert int(c1 or 1) % int(c2 or 1) == 0
            c, e = int(c1 or 1) // int(c2 or 1), int(e1) - int(e2)
    sym = var or base
    return ("" if c == 1 else str(c)) + (sym if e == 1 else f"{sym}^{e}")


def _py_expr(h, var_values=None):
    s = plain(h).replace("×", "*").replace("÷", "/").replace("½", "(1/2)")
    s = re.sub(r"\s+", "", s)
    return s


def v_zero_neg(q):
    h = (q.fig or "").replace(MINUS, "-")
    h = re.sub(r"<sup>(-?\d+)</sup>", r"**(\1)", h)
    s = plain(h).replace("×", "*")
    s = re.sub(r"(\d)\s*([a-z(])", r"\1*\2", s)
    s = re.sub(r"\)\s*\*\*", r")**", s).replace(" ", "")
    s = re.sub(r"(?<![\w.])(\d+)(?![\w.])", r"_Fr(\1)", s)
    env = {k: Fraction(7) for k in "abcmnpxy"}
    env["_Fr"] = Fraction
    return eval(s, {"__builtins__": {}}, env)


def v_sci(q):
    s = plain(q.fig)
    if "Write in scientific" in plain(q.text):
        d = Decimal(s.replace(" ", ""))
        n = 0
        while abs(d) >= 10:
            d /= 10
            n += 1
        while abs(d) < 1:
            d *= 10
            n -= 1
        return f"{d.normalize()} × 10^{n}"
    a, n = re.search(r"([\d.]+) × 10(-?\d+)", s).groups()
    return str((Decimal(a) * Decimal(10) ** int(n)).normalize().__format__("f"))


def v_formula_sub(q):
    eq = plain(q.fig)
    lhs, rhs = [_implicit(x) for x in eq.split("=")]
    t = plain(q.text)
    unk = re.search(r"Find (\w+) when", t).group(1)
    givens = {k: Fraction(v.rstrip(".")) for k, v in re.findall(r"(\w+) = (-?[\d.]+)", t)}

    def g(u):
        env = dict(givens)
        env[unk] = Fraction(u)
        env["_Fr"] = Fraction
        return eval(lhs, {"__builtins__": {}}, env) - eval(rhs, {"__builtins__": {}}, env)
    g0, g1 = g(0), g(1)
    return -g0 / (g1 - g0)


def _implicit(s):
    """'1.8C + 32' -> '_Fr("1.8")*C+_Fr(32)': implicit products made explicit, numbers exact."""
    s = s.replace(" ", "").replace("½", "#")
    toks = re.findall(r"\d+\.\d+|\d+|#|[A-Za-z]|[()+\-*/]", s)
    out, prev = [], None
    for tk in toks:
        operand = tk[0].isdigit() or tk.isalpha() or tk in ("#", "(")
        if prev is not None and operand and (prev[0].isdigit() or prev.isalpha() or prev in ("#", ")")):
            out.append("*")
        if tk[0].isdigit():
            out.append(f'_Fr("{tk}")')
        elif tk == "#":
            out.append("_Fr(1, 2)")
        else:
            out.append(tk)
        prev = tk
    return "".join(out)


def v_ratio(q):
    t = plain(q.text)
    amt = num(re.search(r"Share \$?([\d.]+)", t).group(1))
    a, b = (int(x) for x in re.search(r"ratio (\d+) : (\d+)", t).groups())
    return (amt / (a + b) * a, amt / (a + b) * b)


def v_speed(q):
    t = plain(q.text)
    labs = [x for _, _, x, _ in svg_texts(q.fig) if x not in ("A", "B")]
    if "average speed of" in t:
        v = num(re.search(r"speed of ([\d.]+)", t).group(1))
        d_, tm = labs[0], labs[1]
        return v * num(tm) if is_x(d_) else num(d_) / v
    d_, tm = num(labs[0]), labs[1]
    hrs = num(tm) / 60 if "minutes" in tm else num(tm)
    return d_ / hrs


def v_gradient(q):
    pts = re.findall(r"([AB])\((-?\d+), (-?\d+)\)", plain(q.fig))
    (a, x1, y1), (b, x2, y2) = sorted(pts)
    return Fraction(int(y2) - int(y1), int(x2) - int(x1))


def _mc(disp):
    s = plain(disp).replace(" ", "")
    m = re.fullmatch(r"y=(-?[\d.]*)x([+-][\d.]+)?", s)
    ms, cs = m.groups()
    mv = {"": 1.0, "-": -1.0}.get(ms, None)
    mv = float(ms) if mv is None else mv
    return mv, float(cs) if cs else 0.0


def v_linear(q):
    m, c = _mc(q.fig)
    t = plain(q.text)
    if "State the gradient" in t:
        return (m, c)
    x = num(re.search(r"x = (-?[\d.]+)", t).group(1))
    return m * x + c


def v_mean(q):
    rows = cells(q.fig)
    if len(rows) == 2:
        xs, fs = [num(v) for v in rows[0][1:]], [num(v) for v in rows[1][1:]]
        return sum(x * f for x, f in zip(xs, fs)) / sum(fs)
    vals = [num(v) for v in rows[0][1:]]
    return sum(vals) / len(vals)


def v_prob(q):
    t = plain(q.text)
    if "marble" in t:
        rows = cells(q.fig)
        cols, counts = rows[0][1:], [int(num(c)) for c in rows[1][1:]]
        target = re.search(r"that it is (\w+)", t).group(1)
        return Fraction(counts[[c.lower() for c in cols].index(target)], sum(counts))
    if "die" in t:
        ev = re.search(r"rolling (.+)\.$", t).group(1)
        faces = range(1, 7)
        test = {"an even number": lambda n: n % 2 == 0, "a 5": lambda n: n == 5,
                "a number less than 3": lambda n: n < 3, "a multiple of 3": lambda n: n % 3 == 0,
                "a prime number": lambda n: n in (2, 3, 5), "a number greater than 1": lambda n: n > 1}[ev]
        return Fraction(sum(1 for n in faces if test(n)), 6)
    word = plain(q.fig).replace(" ", "")
    letter = re.search(r"P\((\w)\)", t).group(1)
    return Fraction(word.count(letter), len(word))


def v_prob_not(q):
    m = re.search(r'class="fn">(\d+)</span><span class="fd">(\d+)<', q.fig)
    if m:                                          # a stacked fraction
        return 1 - Fraction(int(m.group(1)), int(m.group(2)))
    return 1 - Fraction(plain(q.fig).split("=")[1].strip())


def v_freq(q):
    t = plain(q.text)
    if "expect" in t:
        n = max(nums(t))
        if "die" in t:
            if "even" in t:
                p = Fraction(1, 2)
            elif "greater than 4" in t:
                p = Fraction(2, 6)
            else:
                p = Fraction(1, 6)
        elif "coin" in t:
            p = Fraction(1, 2)
        elif "4 equal sections" in t:
            p = Fraction(1, 4)
        else:
            p = Fraction(str([v for v in nums(t) if v < 1][0]))
        return p * Fraction(str(n))
    a, b = sorted(int(v) for v in nums(t))
    return Fraction(a, b)


V = {"pyth_hyp": None, "pyth_short": None, "trig_ratio": v_trig, "trig_top": v_trig, "trig_bottom": v_trig,
     "trig_angle": v_trig, "similar": v_similar, "a_circle": v_a_circle, "arc": v_sector, "sector": v_sector,
     "sa_rect": v_box, "capacity": v_box, "v_pyramid": v_box, "sa_cyl": v_solid, "v_cyl": v_solid, "v_cone": v_solid,
     "v_prism": v_prism, "pct_change": v_pct_change, "pct_original": v_pct_original, "profit_pct": v_profit_pct,
     "interest": v_interest, "wages": v_wages, "salary": v_salary, "commission": v_commission,
     "holiday_pay": v_holiday, "idx": v_idx, "zero_neg": v_zero_neg, "sci": v_sci, "formula_sub": v_formula_sub,
     "ratio": v_ratio, "speed": v_speed, "gradient": v_gradient, "linear": v_linear, "mean": v_mean,
     "prob": v_prob, "prob_not": v_prob_not, "freq": v_freq}


def v_pyth(q):
    T = [t for _, _, t, _ in svg_texts(q.fig)]
    vals = [num(t) for t in T if not is_x(t) and t != "c"]
    if q.fam == "pyth_hyp":
        return math.hypot(*vals)
    h, g = max(vals), min(vals)
    return math.sqrt(h * h - g * g)


V["pyth_hyp"] = V["pyth_short"] = v_pyth


# -------------------------------------------------------------- compare --
def agrees(q, got):
    a = q.answer.replace(MINUS, "-").replace(" ", "").replace(",", "")
    pl = places_asked(q.text)
    if isinstance(got, str):
        return a.replace(" ", "") == got.replace("-", "-").replace(" ", "")
    if isinstance(got, tuple):
        exp = nums(a)
        return len(exp) == len(got) and all(abs(e - (rnd(g, 2) if "$" in a else g)) < 1e-6 for e, g in zip(exp, got))
    if isinstance(got, Fraction) and "/" in a:
        f_ = re.search(r"(-?\d+)/(\d+)", a)
        return Fraction(int(f_.group(1)), int(f_.group(2))) == got
    exp = nums(a)[0]
    g = float(got)
    if pl is not None:
        return abs(rnd(g, pl) - exp) < 1e-9
    if "$" in a:
        return abs(rnd(g, 2) - exp) < 1e-9
    return abs(g - exp) < 1e-6


def check_q(q):
    got = V[q.fam](q)
    return agrees(q, got), got


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    terms = [int(t) for t in args[0].split(",")] if args else [1, 2, 3, 4]
    sample = None
    if "--sample" in sys.argv:
        sample = int(sys.argv[sys.argv.index("--sample") + 1])
    import build_all
    allq = []
    for t in terms:
        S, _, _ = build_all.ready(t)
        for s in S:
            for i, q in enumerate(s.qs):
                allq.append((f"T{t} W{s.week} S{s.session} Q{i + 1}", q))
    pick = random.Random(2026).sample(allq, sample) if sample else allq
    bad = 0
    for name, q in pick:
        try:
            ok, got = check_q(q)
        except Exception as e:                     # an unreadable question counts as a failure
            ok, got = False, f"ERROR {type(e).__name__}: {e}"
        if not ok:
            bad += 1
        if sample or not ok:
            gs = got if isinstance(got, str) else (f"{float(got):.4f}" if not isinstance(got, tuple) else got)
            print(f"{'OK ' if ok else 'BAD'} {name} {q.fam:12s} {plain(q.text)[:70]!r} -> booklet {q.answer!r}, "
                  f"recomputed {gs}")
    print(f"\n{len(pick) - bad}/{len(pick)} answers match")
    return bad


if __name__ == "__main__":
    sys.exit(1 if main() else 0)
