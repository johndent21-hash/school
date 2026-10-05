# -*- coding: utf-8 -*-
"""Independent answer check.

Recomputes every answer from what the student actually sees - the question text and the numbers
printed in its figure (SVG labels, table cells, displayed expression) - with its own formulas,
without using any of gen.py's arithmetic. The angle-on-parallel-lines items are checked from the
drawing itself: the transversal's slope and which side of each line every label sits on.

    python3 wu/verify_answers.py [TERMS]
"""
import math
import os
import re
import sys
from fractions import Fraction

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

MINUS = "−"
POLY_N = {"pentagon": 5, "hexagon": 6, "heptagon": 7, "octagon": 8, "nonagon": 9, "decagon": 10,
          "dodecagon": 12, "15-sided polygon": 15}


# ------------------------------------------------------------------ reading --
def plain(h):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", h or "")).replace(MINUS, "-").strip()


def svg_labels(fig):
    """Text of each <text> element, in drawing order."""
    return [plain(t) for t in re.findall(r"<text\b[^>]*>(.*?)</text>", fig or "", re.S)]


def svg_texts(fig):
    """(x, y, text) of each <text> element."""
    out = []
    for attrs, body in re.findall(r"<text\b([^>]*)>(.*?)</text>", fig or "", re.S):
        x = float(re.search(r'\bx="([-\d.]+)"', attrs).group(1))
        y = float(re.search(r'\by="([-\d.]+)"', attrs).group(1))
        out.append((x, y, plain(body)))
    return out


def svg_lines(fig):
    return [tuple(float(v) for v in m) for m in
            re.findall(r'<line x1="([-\d.]+)" y1="([-\d.]+)" x2="([-\d.]+)" y2="([-\d.]+)"', fig or "")]


def cells(fig):
    return [[plain(c) for c in re.findall(r"<td[^>]*>(.*?)</td>", row)] for row in re.findall(r"<tr>(.*?)</tr>", fig)]


def nums(s):
    return [float(v.replace(",", "")) for v in re.findall(r"-?\d[\d,]*(?:\.\d+)?|-?\.\d+", s.replace(MINUS, "-"))]


def num(s):
    v = nums(s)
    assert v, s
    return v[0]


def numeric_labels(fig):
    return [num(l) for l in svg_labels(fig) if nums(l) and "x" not in l]


def is_x(l):
    return l.strip().startswith("x")


# ----------------------------------------------------------------- formulas --
def area_label_pair(fig):
    return [num(l) for l in svg_labels(fig) if nums(l)]


def circle_kind(fig):
    """'d' if the drawn segment is a full diameter, 'r' if it is a radius (from the drawing)."""
    lines = svg_lines(fig)
    L = max(math.hypot(x2 - x1, y2 - y1) for x1, y1, x2, y2 in lines)
    m = re.search(r'<circle cx="[-\d.]+" cy="[-\d.]+" r="([-\d.]+)" fill="#FFFFFF"', fig) or \
        re.search(r'<ellipse cx="[-\d.]+" cy="[-\d.]+" rx="([-\d.]+)"', fig)
    R = float(m.group(1))
    return "d" if L > 1.5 * R else "r"


def parallel_check(fig, key):
    """From the drawing: transversal slope, the two crossings, and the side of each line every
    angle label sits on -> the size of each marked angle and the relationship between them."""
    lines = svg_lines(fig)
    hz = sorted({round(y1, 2) for x1, y1, x2, y2 in lines if abs(y1 - y2) < 1e-6 and abs(x2 - x1) > 100})
    tr = [l for l in lines if abs(l[1] - l[3]) > 1e-6]
    assert len(hz) == 2 and len(tr) == 1, (hz, tr)
    x1, y1, x2, y2 = tr[0]
    if y2 > y1:
        x1, y1, x2, y2 = x2, y2, x1, y1               # (x1, y1) lower end, (x2, y2) upper end
    theta = math.degrees(math.atan2(y1 - y2, x2 - x1))   # math angle of the upward direction
    def x_at(y):
        return x1 + (x2 - x1) * (y - y1) / (y2 - y1)
    V = {"T": (x_at(hz[0]), hz[0]), "B": (x_at(hz[1]), hz[1])}
    marks = []
    for x, y, t in svg_texts(fig):
        y -= 0.34 * 13                                  # baseline -> centre of the label
        vert = min(V, key=lambda v: math.hypot(x - V[v][0], y - V[v][1]))
        ly = V[vert][1]
        q = ("U" if y < ly else "L") + ("R" if x > x_at(y) else "L")
        val = theta if q in ("UR", "LL") else 180 - theta
        marks.append((vert, q, t, val))
    assert len(marks) == 2, marks
    (g,) = [m for m in marks if not is_x(m[2])]
    (xm,) = [m for m in marks if is_x(m[2])]
    assert abs(num(g[2]) - g[3]) < 0.6, ("given label does not match drawing", g)
    pair = {g[:2], xm[:2]}
    if g[1] == xm[1] and g[0] != xm[0]:
        rel = "ang_corr"
    elif pair in ({("T", "LL"), ("B", "UR")}, {("T", "LR"), ("B", "UL")}):
        rel = "ang_alt"
    elif pair in ({("T", "LL"), ("B", "UL")}, {("T", "LR"), ("B", "UR")}):
        rel = "ang_coint"
    else:
        rel = "?"
    assert rel == key, ("relationship in drawing", rel, "formula", key)
    rule = num(g[2]) if rel in ("ang_corr", "ang_alt") else 180 - num(g[2])
    assert abs(rule - xm[3]) < 0.6, ("rule disagrees with drawing", rule, xm[3])
    return rule


def die_count(ev):
    preds = {"an even number": lambda k: k % 2 == 0, "a prime number": lambda k: k in (2, 3, 5),
             "a multiple of 3": lambda k: k % 3 == 0}
    if ev in preds:
        return sum(preds[ev](k) for k in range(1, 7))
    m = re.fullmatch(r"a (\d)", ev)
    if m:
        return 1
    m = re.fullmatch(r"a number (less|greater) than (\d)", ev)
    n = int(m.group(2))
    return sum((k < n) if m.group(1) == "less" else (k > n) for k in range(1, 7))


def expr_value(s, val=1.7):
    """Evaluate a displayed expression (HTML) with every pronumeral = val."""
    s = s.replace("<sup>", "**(").replace("</sup>", ")")
    s = plain(s).replace("×", "*").replace("÷", "/").replace("^", "**")
    s = re.sub(r"(\d)\s*\(", r"\1*(", s)
    s = re.sub(r"(\d|\))\s*([a-z])", r"\1*\2", s)
    s = re.sub(r"([a-z])\s*\(", r"\1*(", s)
    s = re.sub(r"\)\s*\(", ")*(", s)
    s = s.replace("²", "**2")
    s = re.sub(r"\b([a-z])\b", f"({val})", s)
    return eval(s, {"__builtins__": {}})


def recompute(q):
    """-> (value, kind) where kind says how to compare: 'exact', '1dp', 'cents', 'frac', 'expr'."""
    k, t, fig = q.formula, plain(q.text), q.fig or ""
    labs = svg_labels(fig) if fig.lstrip().startswith("<svg") else []
    if k == "speed":
        labs = [l for l in labs if l not in ("A", "B")]          # the journey's end-point names
    N = [num(l) for l in labs if nums(l) and not is_x(l)]
    dp = "decimal place" in t
    R = "1dp" if dp else "exact"
    if k == "pyth_hyp":
        return math.hypot(*N), R
    if k == "pyth_short":
        return math.sqrt(max(N) ** 2 - min(N) ** 2), R
    if k == "ang_tri":
        return 180 - sum(N), R
    if k in ("ang_quad", "ang_point"):
        return 360 - sum(N), R
    if k == "ang_straight":
        return 180 - sum(N), R
    if k == "ang_vert":
        return N[0], R
    if k == "ang_poly":
        n = [v for name, v in POLY_N.items() if f"this {name}" in t or f"regular {name}" in t][0]
        return (180 * (n - 2) if "sum" in t else 180 * (n - 2) / n), R
    if k == "ang_ext":
        xi = [i for i, l in enumerate(labs) if is_x(l)][0]
        a, c, e = [None if is_x(l) else num(l) for l in labs]
        return (a + c if xi == 2 else e - (c if xi == 0 else a)), R
    if k in ("ang_corr", "ang_alt", "ang_coint"):
        return parallel_check(fig, k), R
    rev = t.startswith("The area of") or t.startswith("The volume of") or "and the volume is" in t \
        or "at an average speed of" in t or t.startswith("The circumference")
    if k == "a_rect":
        return (num(t) / N[0] if rev else N[0] * N[1]), R
    if k == "a_tri":
        return (2 * num(t) / N[0] if rev else N[0] * N[1] / 2), R
    if k == "a_para":
        return (num(t) / N[0] if rev else N[0] * N[1]), R
    if k == "a_trap":
        top, bot, h = N
        return h * (top + bot) / 2, R
    if k == "a_kite":
        return N[0] * N[1] / 2, R
    if k in ("c_circ_d", "c_circ_r"):
        kind = circle_kind(fig)
        assert kind == k[-1], ("drawn segment", kind, k)
        if rev:
            C = num(t)
            return (C / math.pi if kind == "d" else C / (2 * math.pi)), R
        return (math.pi * N[0] if kind == "d" else 2 * math.pi * N[0]), R
    if k == "a_circle":
        r = N[0] / 2 if circle_kind(fig) == "d" else N[0]
        return math.pi * r * r, R
    if k == "a_semi":
        return math.pi * N[0] ** 2 / 2, R
    if k == "a_sector":
        ang = 90 if "quadrant" in t else [num(l) for l in labs if "°" in l][0]
        r = [num(l) for l in labs if "°" not in l][0]
        return ang / 360 * math.pi * r * r, R
    if k == "v_prism":
        A = nums(t)[0]
        return (nums(t)[1] / A if rev else A * N[0]), R
    if k == "v_rect":
        p = math.prod(N)
        return (num(t) / p if rev else p), R
    if k in ("v_cyl", "sa_cyl") or k.startswith("cap_cyl"):
        r = N[0] / 2 if circle_kind(fig) == "d" else N[0]
        h = N[1]
        if k == "v_cyl":
            return math.pi * r * r * h, R
        if k == "sa_cyl":
            return 2 * math.pi * r * r + 2 * math.pi * r * h, R
        V = math.pi * r * r * h
    elif k.startswith("cap_rect"):
        V = math.prod(N)
    if k.startswith("cap_"):
        unit = re.findall(r"[a-z]+", labs[0])[-1]
        if "millilitres" in t:
            assert unit == "cm"
            return V, R
        return (V / 1000 if unit == "cm" else V * 1000), R
    if k == "sa_rect":
        l, w, h = N
        return 2 * (l * w + l * h + w * h), R
    if k == "sa_tri":
        a, b, c, L = N
        assert abs(a * a + b * b - c * c) < 1e-6, "not a right-angled triangle"
        return a * b + (a + b + c) * L, R
    if k.startswith("idx_"):
        disp = re.search(r'class="disp">(.*?)</div>', fig).group(1)
        return expr_value(disp), "expr"
    if k == "distrib":
        disp = re.search(r'class="disp">(.*?)</div>', fig).group(1)
        return expr_value(disp), "expr"
    if k == "pct_qty":
        d = plain(fig)
        p, Q = nums(d)
        return p * Q / 100, ("cents" if "$" in d else R)
    if k == "pct_change":
        o, n = [num(r[1]) for r in cells(fig)]
        return abs(n - o) / o * 100, R
    if k == "profit":
        c, s_ = [num(r[1]) for r in cells(fig)]
        return abs(s_ - c), "cents"
    if k == "speed":
        if rev:
            v = num(t)
            if is_x(labs[0]):                      # distance unknown: d = v x t
                return v * num(labs[1]), R
            return num(labs[0]) / v, R             # time unknown: t = d / v
        d, tm = num(labs[0]), num(labs[1])
        if "minutes" in labs[1]:
            tm /= 60
        return d / tm, R
    if k == "scale":
        o, im = N
        return im / o, R
    if k == "prob":
        if "marble" in t:
            rows = cells(fig)
            colours = [c.lower() for c in rows[0][1:]]
            counts = [int(c) for c in rows[1][1:]]
            target = re.search(r"that it is (\w+)", t).group(1)
            return Fraction(counts[colours.index(target)], sum(counts)), "frac"
        if "die" in t:
            ev = re.search(r"probability of rolling (.+)\.$", t).group(1)
            return Fraction(die_count(ev), 6), "frac"
        word = plain(fig).replace(" ", "")
        letter = re.search(r"P\((\w)\)", t).group(1)
        return Fraction(word.count(letter), len(word)), "frac"
    if k == "prob_not":
        d = plain(fig)
        m = re.search(r"=\s*([\d.]+)\s*$", d)
        if m and 'class="frac"' not in fig:
            return 1 - float(m.group(1)), R
        fn = re.findall(r'class="fn">(\d+)<', fig)[0]
        fd = re.findall(r'class="fd">(\d+)<', fig)[0]
        return 1 - Fraction(int(fn), int(fd)), "frac"
    if k == "mean":
        v = [num(c) for c in cells(fig)[0][1:]]
        return sum(v) / len(v), R
    if k == "range":
        v = [num(c) for c in cells(fig)[0][1:]]
        return max(v) - min(v), R
    if k == "gradient":
        pts = [nums(l) for l in labs if l.startswith(("A(", "B("))]
        (ax, ay), (bx, by) = pts
        return Fraction(int(by - ay), int(bx - ax)), "frac"
    if k == "linear":
        d = plain(fig)
        xv = num(t.split("=")[-1])
        rhs = d.split("=")[1]
        return expr_value(rhs, xv), R
    if k in ("pct_inc", "pct_dec"):
        if "<table" in fig:
            rows = cells(fig)
            amt, p = num(rows[0][1]), num(rows[1][1])
        else:
            d = plain(fig)
            amt, p = nums(d)
        new = amt * (100 + p if k == "pct_inc" else 100 - p) / 100
        return new, ("cents" if "$" in plain(fig) else R)
    if k == "pct_orig":
        if "<table" in fig:
            rows = dict((r[0], r[1]) for r in cells(fig))
            if "Discount" in rows:
                known, its = num(rows["Sale price"]), 100 - num(rows["Discount"])
            else:
                known = num([v for kk, v in rows.items() if kk.startswith("New")][0])
                its = 100 + num(rows["Increase"])
        else:
            its, known = nums(plain(fig))
        return known / its * 100, "cents"
    raise KeyError(k)


def answer_value(q):
    a = q.answer.replace(MINUS, "-").replace(",", "")
    if q.formula.startswith("idx_") or q.formula == "distrib":
        s = a.replace("x²", "x^2")
        s = re.sub(r"(\d)([a-z])", r"\1*\2", s)
        s = s.replace("^", "**").replace("²", "**2")
        s = re.sub(r"\b([a-z])\b", "(1.7)", s)
        return eval(s, {"__builtins__": {}})
    if re.fullmatch(r"-?\d+/\d+", a.strip()):
        return Fraction(a.strip())
    return num(a)


def check_question(q):
    val, kind = recompute(q)
    got = answer_value(q)
    if kind == "frac":
        ok = Fraction(got).limit_denominator(1000) == Fraction(val) if isinstance(got, (Fraction, int)) \
            else abs(float(val) - got) < 1e-9
    elif kind == "1dp":
        ok = abs(round(float(val) + 1e-9, 1) - got) < 1e-9 and re.search(r"\d\.\d(?!\d)", q.answer) is not None
    elif kind == "cents":
        ok = abs(round(float(val) + 1e-9, 2) - got) < 1e-9
    elif kind == "expr":
        ok = abs(float(val) - float(got)) < 1e-6 * max(1, abs(float(val)))
    else:
        ok = abs(float(val) - float(got)) < 1e-6
    # units: areas squared, volumes cubed
    if ok and q.formula in ("a_rect", "a_tri", "a_para", "a_trap", "a_kite", "a_circle", "a_semi", "a_sector",
                            "sa_rect", "sa_tri", "sa_cyl") and not q.text.startswith("The area of"):
        ok = "²" in q.answer
    if ok and q.formula in ("v_prism", "v_rect", "v_cyl") and not ("Find <i>x</i>" in q.text):
        ok = "³" in q.answer
    return ok, val


def main():
    import build_all
    terms = [int(v) for v in sys.argv[1].split(",")] if len(sys.argv) > 1 else [1, 2, 3, 4]
    bad = total = 0
    for t in terms:
        sessions, _ = build_all.term_sessions(t)
        for s in sessions:
            for i, q in enumerate(s.qs):
                total += 1
                try:
                    ok, val = check_question(q)
                except Exception as e:                       # noqa: BLE001
                    ok, val = False, f"ERROR {e!r}"
                if not ok:
                    bad += 1
                    print(f"MISMATCH T{t} W{s.week} S{s.session} Q{i + 1} {q.formula}: {plain(q.text)} "
                          f"recorded {q.answer!r}, recomputed {val!r}")
    print(f"{total} answers recomputed independently, {bad} mismatches")
    return bad


if __name__ == "__main__":
    sys.exit(1 if main() else 0)
