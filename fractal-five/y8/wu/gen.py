# -*- coding: utf-8 -*-
"""The Fractal Five, Year 8 - question generators and scheduler (all 30 sessions of each term).

Two versions, four terms each:
  Mainstream ("M")  Year 7 families only, all year; one pool, fresh numbers each term (a term prefers
                    items the previous term did not use); the formula is printed in every question.
  Advanced   ("A")  Terms 1-2: the same Year 7 families and pool, drawn with their own seed, formula
                    printed. Terms 3-4: adds the Year 8 families (Pythagoras; trapezium, rhombus/kite and
                    circle area; index laws; percentage change and profit/loss) and drops a_rect and units;
                    formulas from memory.

Every session takes one question from each strand:
  A angles and shapes        ang_comp ang_point ang_par ang_tri ang_ext ang_quad (+ pyth_hyp pyth_short)
  B measurement              perimeter circ a_rect a_tri a_para a_comp v_rect units (+ a_trap a_kite a_circle)
  C number and percentages   order_ops idx_root frac_qty pct_qty pct_express pow10 fdp (+ idx_laws pct_change)
  D algebra, ratio, rates    subst distrib equation ratio_simp ratio_share rates speed time
  E plane, data and chance   table_vals mean med_mode range prob prob_not exp_prob
The weighted families come up more often (COUNTS); a family never sits in two consecutive sessions.

Whole numbers in every question and answer, except: answers with pi (1 decimal place, and the question
says so), the decimals and fraction-decimal-percentage families (pow10, fdp; units questions may start
from a decimal, as in "convert 3.5 m to cm", but every answer is whole), and probabilities (fractions).
Every answer is computed here from the same numbers that label the diagram; verify_answers.py recomputes
them independently from the printed question.
"""
import math
import random
import re
import zlib
from collections import Counter
from decimal import Decimal
from fractions import Fraction

import wdia as D
from formulas import FX, sqrt as rsqrt, cbrt as rcbrt
from wu import Q, Session, display, dtable, frac, TIMES, DIV, MINUS, DEG

X = "<i>x</i>"
NB = " "          # no-break space: thousands separator for 5+ digit numbers (30 000)


# ------------------------------------------------------------------ helpers --
def grp(v):
    """Whole number with a space every three digits from 10 000 up (2000, 30 000)."""
    n = int(round(v))
    s = str(abs(n))
    if len(s) >= 5:
        s = NB.join([s[max(0, i - 3):i] for i in range(len(s), 0, -3)][::-1])
    return (MINUS if n < 0 else "") + s


def nf(v):
    """Plain number: integers without a decimal point, otherwise up to 3 dp; true minus sign."""
    if abs(v - round(v)) < 1e-9:
        return grp(v)
    s = f"{v:.3f}".rstrip("0").rstrip(".")
    return s.replace("-", MINUS)


def money(v):
    if abs(v - round(v)) < 1e-9:
        return "$" + grp(v)
    whole, cents = f"{abs(v):.2f}".split(".")
    return "$" + grp(int(whole)) + "." + cents


def d1(v):
    return f"{v:.1f}".replace("-", MINUS)


def fstr(fr_):
    fr_ = Fraction(fr_)
    s = str(fr_.numerator) if fr_.denominator == 1 else f"{fr_.numerator}/{fr_.denominator}"
    return s.replace("-", MINUS)


def lab(v, u):
    return f"{nf(v)} {u}"


def safe1(v, it):
    """A value rounded to 1 dp must not sit on a rounding boundary (exactly one correct answer)."""
    fr_ = abs(v * 10) % 1
    assert abs(fr_ - 0.5) > 0.03, (v, it)
    return v


def whole(v, it):
    assert abs(v - round(v)) < 1e-9, (v, it)
    return int(round(v))


def lines(text):
    return 1 if len(re.sub(r"<[^>]+>", "", text)) <= 42 else 2


def mk(text, figf, key, answer, fx=None):
    fx0, small = FX[key]
    s0 = 1.0 if lines(text) == 1 else 0.9
    fig = figf(s0) if figf else None
    q = Q(text, fig, key, answer, fx=fx or fx0, fx_small=small)
    q.figf, q.s = figf, s0
    return q


def static(html):
    return lambda s: html


def is_rev(it):
    """A 'working backwards' item: the result of the formula is given and a length or time is found."""
    return isinstance(it, tuple) and len(it) > 0 and it[0] == "rev"


def it_html(s):
    """Mini syntax -> HTML: single letters in italics, ^n as an index, [a]/[b] as a stacked fraction,
    '-' as a true minus sign."""
    def one(t):
        t = re.sub(r"([a-z])", r"<i>\1</i>", t)          # the mini syntax has no words: every letter is a pronumeral
        t = re.sub(r"\^(\d+)", r"<sup>\1</sup>", t)
        return t.replace("-", MINUS)
    out, pos = [], 0
    for m in re.finditer(r"\[([^\]]+)\]/\[([^\]]+)\]", s):
        out.append(one(s[pos:m.start()]))
        out.append(frac(one(m.group(1)), one(m.group(2))))
        pos = m.end()
    out.append(one(s[pos:]))
    return "".join(out)


def to_py(s):
    """Mini syntax -> Python: implicit multiplication made explicit."""
    s = re.sub(r"\[([^\]]+)\]/\[([^\]]+)\]", r"((\1)/(\2))", s)
    s = s.replace("^", "**")
    s = re.sub(r"(\d)\s*([a-z(])", r"\1*\2", s)
    s = re.sub(r"([a-z)])\s*(?=[a-z(\d])", r"\1*", s)
    s = re.sub(r"\)\s*\(", ")*(", s)
    return s


def ev(expr_py, vals):
    """Exact value of a Python expression with Fraction arithmetic."""
    e = re.sub(r"(?<![\w.])(\d+)(?![\w.])", r"F(\1)", expr_py)
    return eval(e, {"F": Fraction, "__builtins__": {}}, {k: Fraction(v) for k, v in vals.items()})  # noqa: S307


# ================================================================== pools ==
POOL = {}

# ---- A: angles and shapes ----
# ang_comp: ("comp", parts, unknown index, rot) a right angle split in two | ("supp", parts, unknown index, below)
POOL["ang_comp"] = [("comp", (34, 56), 1, 0), ("comp", (27, 63), 0, 0), ("comp", (48, 42), 1, 90),
                    ("comp", (61, 29), 0, 30), ("comp", (52, 38), 1, 0), ("comp", (38, 52), 0, 90),
                    ("comp", (25, 65), 1, 20), ("comp", (44, 46), 0, 60),
                    ("supp", (125, 55), 1, False), ("supp", (48, 132), 0, True), ("supp", (110, 70), 0, False),
                    ("supp", (37, 143), 1, False), ("supp", (64, 116), 1, True), ("supp", (152, 28), 0, False),
                    ("supp", (81, 99), 1, False)]
# ang_point: ("pt", parts, unknown index, rot) angles at a point | ("vop", angle, tilt, side of x) vertically opposite
POOL["ang_point"] = [("pt", (140, 95, 125), 1, 90), ("pt", (100, 120, 140), 2, 30), ("pt", (80, 110, 70, 100), 3, 20),
                     ("pt", (127, 85, 148), 0, 100), ("pt", (95, 63, 118, 84), 2, 15), ("pt", (156, 117, 87), 1, 60),
                     ("pt", (150, 90, 120), 0, 45), ("pt", (75, 135, 150), 2, 10),
                     ("vop", 48, 0, "L"), ("vop", 115, 5, "R"), ("vop", 72, -8, "L"), ("vop", 37, 4, "R"),
                     ("vop", 124, -6, "L"), ("vop", 81, 8, "R"), ("vop", 56, 3, "R")]
# ang_par: (relationship, transversal angle, (vertex, quadrant) of the given angle, (vertex, quadrant) of x)
POOL["ang_par"] = [("corr", 62, ("T", "UR"), ("B", "UR")), ("corr", 115, ("B", "LL"), ("T", "LL")),
                   ("corr", 50, ("T", "LR"), ("B", "LR")), ("corr", 47, ("B", "UL"), ("T", "UL")),
                   ("corr", 128, ("T", "LR"), ("B", "LR")),
                   ("alt", 55, ("T", "LL"), ("B", "UR")), ("alt", 70, ("B", "UL"), ("T", "LR")),
                   ("alt", 125, ("T", "LL"), ("B", "UR")), ("alt", 38, ("T", "LR"), ("B", "UL")),
                   ("alt", 66, ("B", "UR"), ("T", "LL")),
                   ("coint", 70, ("T", "LR"), ("B", "UR")), ("coint", 58, ("T", "LL"), ("B", "UL")),
                   ("coint", 115, ("B", "UR"), ("T", "LR")), ("coint", 43, ("T", "LL"), ("B", "UL")),
                   ("coint", 104, ("B", "UR"), ("T", "LR"))]
POOL["ang_tri"] = [(58, 74, "apex"), (46, 62, "apex"), (38, 76, "apex"), (54, 68, "apex"), (50, 60, "left"),
                   (35, 85, "apex"), (40, 70, "right"), (62, 53, "apex"), (70, 45, "left"), (44, 82, "right"),
                   (47, 68, "apex"), (33, 94, "apex"), (51, 77, "left"), (64, 58, "right"), (29, 103, "apex"),
                   (57, 57, "apex"), (36, 108, "apex"), (81, 43, "left"), (66, 49, "right")]
POOL["ang_ext"] = [(38, 57, "ext"), (60, 45, "ext"), (48, 62, "ext"), (55, 70, "ext"), (30, 75, "ext"),
                   (44, 58, "ext"), (66, 49, "ext"), (52, 63, "ext"), (35, 80, "ext"),
                   (45, 75, "left"), (62, 48, "apex"), (37, 86, "ext"), (71, 34, "left"), (54, 67, "apex"),
                   (29, 96, "ext"), (58, 58, "ext")]
POOL["ang_quad"] = [((120, 60, 110, 70), 3), ((95, 85, 100, 80), 0), ((70, 110, 85, 95), 2), ((130, 65, 90, 75), 1),
                    ((105, 80, 115, 60), 3), ((92, 88, 105, 75), 2), ((115, 70, 95, 80), 0),
                    ((100, 75, 105, 80), 1), ((85, 95, 120, 60), 3),
                    ((97, 83, 112, 68), 2), ((124, 57, 103, 76), 0), ((88, 99, 107, 66), 3), ((131, 72, 84, 73), 1),
                    ((76, 118, 93, 73), 2), ((109, 64, 121, 66), 0), ((93, 79, 116, 72), 3)]
# Advanced Terms 3-4: Pythagorean triples only, so every answer is whole
POOL["pyth_hyp"] = [(12, 5, "cm", 0), (12, 9, "cm", 1), (15, 8, "cm", 2), (16, 12, "m", 3), (20, 15, "cm", 0),
                    (24, 7, "cm", 1), (24, 10, "m", 2), (21, 20, "cm", 3), (4, 3, "m", 1), (30, 16, "cm", 0)]
POOL["pyth_short"] = [(10, 6, "cm", 0), (17, 15, "cm", 1), (25, 7, "cm", 2), (15, 9, "m", 3), (20, 12, "cm", 0),
                      (26, 10, "cm", 1), (5, 3, "m", 2), (29, 20, "cm", 3), (25, 15, "cm", 0), (13, 12, "cm", 1)]

# ---- B: measurement ----
# polygons for perimeter: model points (every side a whole number of units)
SHAPES = {
    "tri131415": ([(0, 0), (14, 0), (5, 12)], "triangle"),
    "tri556": ([(0, 0), (6, 0), (3, 4)], "triangle"),
    "tri101721": ([(0, 0), (21, 0), (6, 8)], "triangle"),
    "tri132021": ([(0, 0), (21, 0), (5, 12)], "triangle"),
    "rtrap": ([(0, 0), (11, 0), (8, 4), (0, 4)], "trapezium"),
    "itrap": ([(0, 0), (14, 0), (11, 4), (3, 4)], "trapezium"),
    "para": ([(0, 0), (10, 0), (13, 4), (3, 4)], "parallelogram"),
    "house": ([(0, 0), (8, 0), (8, 5), (4, 8), (0, 5)], "pentagon"),
    "pent": ([(0, 0), (9, 0), (12, 4), (6, 12), (0, 4)], "pentagon"),
    "L1": ([(0, 0), (9, 0), (9, 4), (4, 4), (4, 8), (0, 8)], "shape"),
    "L2": ([(0, 0), (12, 0), (12, 3), (5, 3), (5, 8), (0, 8)], "shape"),
}
RIGHTS = {"rtrap": (0, 3), "house": (0, 1), "L1": (0, 1, 2, 3, 4, 5), "L2": (0, 1, 2, 3, 4, 5)}
POOL["perimeter"] = [("rect", 9, 4, "cm"), ("rect", 12, 5, "m"), ("rect", 15, 8, "cm"), ("rect", 7, 3, "m"),
                     ("rect", 20, 6, "cm"), ("rect", 11, 9, "cm"), ("rect", 25, 10, "m"), ("rect", 14, 6, "cm"),
                     ("sq", 7, "cm"), ("sq", 12, "m"), ("sq", 9, "cm"), ("sq", 15, "cm"), ("sq", 25, "m"),
                     ("sq", 6, "cm"),
                     ("poly", "tri131415", 1, "cm"), ("poly", "tri556", 2, "cm"), ("poly", "tri101721", 1, "m"),
                     ("poly", "tri132021", 1, "cm"), ("poly", "rtrap", 1, "cm"), ("poly", "itrap", 1, "m"),
                     ("poly", "house", 1, "cm"), ("poly", "L1", 1, "m"), ("poly", "L2", 1, "cm"),
                     ("poly", "para", 1, "cm"), ("poly", "pent", 1, "cm")]
POOL["circ"] = [("d", 8, "cm"), ("d", 12, "cm"), ("r", 5, "cm"), ("d", 14, "m"), ("r", 7, "cm"), ("r", 2, "m"),
                ("d", 20, "cm"), ("r", 4, "cm"), ("r", 6, "m"), ("d", 10, "cm"), ("r", 11, "cm"), ("d", 16, "m"),
                ("r", 13, "cm"), ("d", 25, "cm")]
POOL["a_rect"] = [(9, 6, "cm"), (12, 5, "m"), (8, 7, "cm"), (15, 4, "cm"), (11, 9, "m"), (14, 3, "cm"),
                  (10, 8, "cm"), (13, 6, "m"),
                  ("sq", 8, "cm"), ("sq", 11, "m"), ("sq", 6, "cm"), ("sq", 14, "cm"), ("sq", 20, "m"),
                  ("rev", 8, 6, "cm", "l"), ("rev", 12, 7, "m", "w"), ("rev", 9, 5, "cm", "l"),
                  ("rev", 15, 4, "cm", "w")]
POOL["a_tri"] = [(12, 5, "cm"), (14, 8, "cm"), (16, 7, "m"), (11, 6, "cm"), (8, 6, "cm"), (10, 8, "m"),
                 (15, 4, "cm"), (18, 10, "cm"), (9, 4, "cm"), (13, 6, "m"), (20, 7, "cm"), (7, 4, "m"),
                 ("rev", 10, 6, "cm", "h"), ("rev", 16, 6, "cm", "b"), ("rev", 8, 7, "m", "h"),
                 ("rev", 14, 8, "cm", "b")]
# a_para: (base, height, horizontal offset of the top edge - drawing only, not printed, unit)
POOL["a_para"] = [(10, 6, 3, "cm"), (12, 4, 3, "cm"), (8, 7, 2.5, "m"), (11, 5, 3, "cm"), (7, 6, 2, "cm"),
                  (14, 5, 3.5, "m"), (15, 8, 4, "cm"), (9, 4, 2, "cm"), (13, 7, 3, "m"), (16, 5, 4, "cm"),
                  ("rev", 9, 6, 2.5, "cm", "h"), ("rev", 12, 5, 3, "m", "b"), ("rev", 8, 7, 2, "cm", "h")]
# a_comp: ("L", (width, height, top width, bottom-arm height), unit, mirrored?) | ("house", (W, wall, roof), unit)
#         | ("ramp", (rectangle width, height, triangle base), unit)
POOL["a_comp"] = [("L", (9, 8, 4, 4), "cm", False), ("L", (12, 8, 5, 3), "m", True), ("L", (10, 10, 4, 5), "cm", False),
                  ("L", (8, 10, 3, 4), "cm", True), ("L", (14, 6, 6, 2), "m", False), ("L", (11, 8, 5, 3), "cm", True),
                  ("house", (8, 5, 3), "m"), ("house", (10, 4, 5), "m"), ("house", (12, 5, 6), "cm"),
                  ("house", (6, 4, 4), "cm"), ("house", (10, 6, 4), "m"),
                  ("ramp", (6, 4, 3), "cm"), ("ramp", (8, 5, 4), "m"), ("ramp", (10, 6, 5), "cm"),
                  ("ramp", (7, 4, 6), "cm"), ("ramp", (9, 8, 3), "m")]
POOL["v_rect"] = [(6, 3, 2, "cm"), (8, 5, 2, "cm"), (10, 4, 3, "m"), (7, 2, 3, "cm"), (6, 6, 2, "cm"), (9, 4, 2, "m"),
                  (4, 4, 4, "cm"), (12, 3, 2, "cm"), (5, 5, 3, "m"), (8, 4, 3, "cm"), (10, 5, 2, "m"),
                  ("rev", 6, 4, 5, "cm", "h"), ("rev", 10, 3, 2, "cm", "l"), ("rev", 5, 5, 4, "m", "w")]
# units: (value as printed, from unit, to unit) - every answer whole
POOL["units"] = [("3.5", "m", "cm"), ("7", "km", "m"), ("2.8", "km", "m"), ("6.2", "cm", "mm"), ("4000", "m", "km"),
                 ("90", "mm", "cm"), ("1.25", "m", "cm"), ("600", "cm", "m"), ("45", "cm", "mm"),
                 ("3", "m²", "cm²"), ("50000", "cm²", "m²"), ("2.5", "m²", "cm²"), ("120000", "cm²", "m²"),
                 ("750", "cm³", "mL"), ("2.5", "L", "mL"), ("4000", "mL", "L"), ("3", "L", "cm³"), ("1.2", "L", "mL")]
# Advanced Terms 3-4
POOL["a_trap"] = [(9, 5, 3, 2, "cm"), (14, 8, 6, 3, "cm"), (16, 10, 5, 3, "cm"), (12, 6, 4, 3, "cm"), (10, 6, 5, 2, "m"),
                  (13, 9, 6, 2, "cm"), (14, 10, 3, 2, "cm"), (11, 7, 4, 1.5, "m"), (12, 8, 5, 2, "cm"),
                  (20, 12, 6, 4, "cm"), (9, 7, 4, 1, "m")]
POOL["a_kite"] = [(3, 6, 4, "cm"), (4, 4, 3, "cm"), (2, 6, 2.5, "m"), (6, 6, 4, "cm"), (3, 7, 3, "cm"), (5, 5, 3, "m"),
                  (2.5, 7.5, 4, "cm"), (4, 8, 5, "cm"), (5, 9, 6, "cm"), (7, 7, 5, "m")]
POOL["a_circle"] = [("r", 6, "cm"), ("r", 3, "m"), ("r", 5, "cm"), ("r", 10, "cm"), ("r", 7, "m"), ("r", 2, "cm"),
                    ("d", 8, "cm"), ("r", 9, "cm"), ("d", 14, "m"), ("r", 4, "cm"), ("r", 12, "cm"), ("d", 20, "cm")]

# ---- C: number and percentages ----
POOL["order_ops"] = ["-3 + 4 * (-2)", "18 - 6 * 2", "(5 - 9) * 3", "24 / (-6) + 7", "-8 + 12 / 4", "7 * (-3) + 20",
                     "36 / (4 + 5) - 10", "(-2) * (-5) - 14", "15 - 3 * (2 + 4)", "-20 / 5 * 3", "6 + (-4) * 5",
                     "40 / 8 - 2 * 9", "(12 - 20) / 4 + 1", "9 - (-3) * 2", "-5 * 4 + 6 * 3", "50 - 4 * (7 + 3)",
                     "(-6 + 2) * (-3)", "-12 / (-4) + 2 * (-5)"]
# idx_root: tokens ("p", base, index) | ("s", n) square root | ("c", n) cube root, joined by "+", "-", "*"
POOL["idx_root"] = [(("p", 2, 5),), (("p", 3, 4),), (("p", 10, 3),), (("p", 5, 3),), (("p", 4, 3),), (("p", 7, 2),),
                    (("p", 2, 3), "+", ("p", 3, 2)), (("p", 5, 2), "+", ("p", 2, 4)), (("p", 10, 2), "+", ("p", 3, 3)),
                    (("s", 81),), (("c", 64),), (("c", 125),), (("s", 144),),
                    (("s", 81), "+", ("c", 27)), (("s", 144), "-", ("c", 8)), (("c", 125), "*", ("s", 4)),
                    (("s", 49), "+", ("p", 2, 3)), (("c", 1000), "+", ("s", 36))]
# frac_qty: (numerator, denominator, quantity, unit) | ("ctx", numerator, denominator, quantity, sentence)
POOL["frac_qty"] = [(3, 4, 60, ""), (2, 5, 45, "kg"), (5, 6, 42, "$"), (3, 8, 96, "m"), (7, 10, 250, "$"),
                    (2, 3, 27, ""), (4, 9, 63, "L"), (5, 8, 120, "$"), (3, 5, 85, "km"), (1, 6, 54, ""),
                    (9, 10, 70, "kg"), (5, 12, 144, "$"), (3, 7, 56, ""), (4, 5, 35, "m"), (7, 8, 64, "$"),
                    ("ctx", 3, 5, 40, "At the Kingscliff markets, {f} of the 40 stalls sell food. How many stalls "
                                      "sell food?"),
                    ("ctx", 2, 3, 24, "{f} of the 24 players in a touch footy squad are in Year 8. How many "
                                      "players is that?"),
                    ("ctx", 3, 4, 32, "{f} of the 32 nippers at the surf club passed the swim test. How many "
                                      "passed?"),
                    ("ctx", 5, 6, 18, "A netball team won {f} of its 18 games. How many games did it win?")]
POOL["pct_qty"] = [(25, 64, "$"), (10, 350, "$"), (20, 45, "kg"), (12, 50, "$"), (5, 180, "m"), (40, 75, "$"),
                   (30, 90, "L"), (75, 48, "$"), (50, 86, "kg"), (15, 80, "$"), (60, 35, "kg"), (35, 200, "m"),
                   (80, 45, "$"), (25, 120, "L"), (90, 50, "kg"), (5, 340, "$")]
# pct_express: (part, whole, context)
POOL["pct_express"] = [(18, 24, "quiz"), (21, 25, "netball"), (9, 15, "touch"), (27, 30, ""), (13, 50, ""),
                       (14, 40, ""), (33, 60, ""), (19, 20, ""), (16, 64, ""), (42, 70, ""), (7, 35, ""),
                       (12, 16, "nippers"), (24, 30, "class"), (34, 40, "goals")]
# pow10: (number as printed, operation, power of ten)
POOL["pow10"] = [("3.7", "*", 100), ("450", "/", 1000), ("0.64", "*", 10), ("82", "/", 100), ("5.19", "*", 1000),
                 ("7.5", "/", 10), ("0.038", "*", 100), ("260", "/", 1000), ("12.4", "*", 100), ("9", "/", 100),
                 ("0.25", "*", 1000), ("3060", "/", 100), ("4.8", "*", 10), ("56.2", "/", 10)]
# fdp: (direction, ...) f2d/f2p (numerator, denominator); d2f/d2p (decimal as printed); p2f/p2d (percentage)
POOL["fdp"] = [("f2d", 3, 8), ("f2d", 2, 5), ("f2d", 7, 20), ("f2d", 3, 4), ("f2d", 9, 25),
               ("d2f", "0.35"), ("d2f", "0.6"), ("d2f", "0.125"), ("d2f", "0.48"),
               ("f2p", 2, 5), ("f2p", 7, 20), ("f2p", 3, 25), ("f2p", 9, 10),
               ("p2f", 45), ("p2f", 80), ("p2f", 15), ("p2f", 64),
               ("d2p", "0.72"), ("d2p", "0.09"), ("d2p", "0.6"),
               ("p2d", 64), ("p2d", 7), ("p2d", 35)]
# Advanced Terms 3-4: index laws (numerical and pronumeral bases, whole indices) - Year 9 `idx` items
POOL["idx_laws"] = [("mult", 2, 3, 4), ("mult", 3, 2, 5), ("mult", 10, 4, 3), ("div", 3, 8, 2), ("div", 2, 9, 4),
                    ("div", 10, 7, 3), ("pow", 2, 3, 4), ("pow", 5, 2, 3), ("pow", 3, 4, 2), ("mult", 7, 3, 3),
                    ("div", 6, 5, 3), ("mult", "x", 5, 4), ("mult", "m", 6, 2), ("div", "y", 8, 3), ("div", "k", 10, 4),
                    ("pow", "n", 3, 4), ("pow", "p", 2, 6), ("mult", "a", 3, 7), ("div", 4, 9, 5), ("pow", 7, 2, 5)]
# pct_change: ("incdec", inc/dec, amount, percentage, context) | ("profit", cost price, selling price)
POOL["pct_change"] = [("incdec", "dec", 120, 25, "sale"), ("incdec", "inc", 80, 15, "plain$"),
                      ("incdec", "inc", 60, 10, "price"), ("incdec", "dec", 250, 20, "plainkg"),
                      ("incdec", "inc", 2400, 5, "pop"), ("incdec", "dec", 45, 20, "sale"),
                      ("incdec", "inc", 900, 4, "wage"), ("incdec", "dec", 70, 10, "plain$"),
                      ("incdec", "dec", 400, 15, "sale"), ("incdec", "inc", 150, 30, "price"),
                      ("profit", 40, 50), ("profit", 60, 78), ("profit", 50, 60), ("profit", 200, 260),
                      ("profit", 75, 60), ("profit", 80, 68), ("profit", 30, 45), ("profit", 250, 300),
                      ("profit", 120, 90), ("profit", 160, 200)]

# ---- D: algebra, ratio and rates ----
# subst: (expression in mini syntax, values)
POOL["subst"] = [("3a + 2b", {"a": 4, "b": 5}), ("5m - 2n", {"m": 6, "n": 7}), ("4(x + 3)", {"x": 5}),
                 ("pq + 10", {"p": 3, "q": 8}), ("a^2 + 5", {"a": 6}), ("2x + 3y", {"x": -3, "y": 4}),
                 ("20 - 3k", {"k": 4}), ("3(2m - 1)", {"m": 4}), ("x^2 - 2x", {"x": 5}),
                 ("7c - d", {"c": 3, "d": -5}), ("ab - 4", {"a": 6, "b": 3}), ("[a + b]/[2]", {"a": 13, "b": 7}),
                 ("4h + 2g", {"h": -1, "g": 9}), ("5(y - 2)", {"y": 9}), ("6 + 2t^2", {"t": 3}),
                 ("[12]/[n] + 3", {"n": 4}), ("2(a + b) - c", {"a": 5, "b": 4, "c": 7})]
# distrib: (expression, expansion) in mini syntax
POOL["distrib"] = [("3(x + 5)", "3x + 15"), ("5(x + 2)", "5x + 10"), ("2(x + 7)", "2x + 14"), ("6(a + 1)", "6a + 6"),
                   ("7(y + 3)", "7y + 21"), ("3(2x + 4)", "6x + 12"), ("2(3x + 5)", "6x + 10"), ("4(m + 9)", "4m + 36"),
                   ("4(x - 3)", "4x - 12"), ("6(2 - y)", "12 - 6y"), ("2(5a - 4)", "10a - 8"), ("8(m + n)", "8m + 8n"),
                   ("3(4p + 1)", "12p + 3"), ("7(2 + k)", "14 + 7k"), ("5(3x - 2)", "15x - 10")]
# equation: (equation in mini syntax, steps)
POOL["equation"] = [("x + 7 = 15", 1), ("x - 4 = 9", 1), ("3x = 21", 1), ("[x]/[4] = 6", 1), ("m + 12 = 30", 1),
                    ("5k = 45", 1), ("y - 15 = 8", 1),
                    ("3x + 5 = 20", 2), ("4x - 7 = 13", 2), ("2x + 9 = 25", 2), ("[x]/[3] + 2 = 7", 2),
                    ("5a - 3 = 32", 2), ("6y + 4 = 40", 2), ("2m - 11 = 7", 2), ("[x]/[2] - 3 = 5", 2),
                    ("7 + 3p = 25", 2)]
# ratio_simp: parts | ("u", first, its unit, second, its unit)
POOL["ratio_simp"] = [(12, 18), (15, 25), (24, 16), (8, 20), (36, 27), (45, 60), (14, 21), (40, 30), (6, 9, 15),
                      (10, 25, 15), ("u", 50, "cm", 2, "m"), ("u", 400, "m", 2, "km"), ("u", 45, "min", 1, "h")]
# ratio_share: (amount, parts, what is shared: '$' or a plural noun)
POOL["ratio_share"] = [(120, (3, 5), "$"), (84, (4, 3), "lollies"), (200, (1, 4), "$"), (90, (2, 7), "$"),
                       (150, (2, 3), "$"), (72, (5, 1), "stickers"), (360, (7, 5), "$"), (48, (3, 5), "marbles"),
                       (500, (3, 2), "$"), (60, (1, 2), "$"), (240, (5, 3), "$"), (56, (3, 4), "shells")]
# rates: (kind, ...): unit price, pay per hour, other rates; ("best", noun, pack word, (qty, $), (qty, $), unit)
POOL["rates"] = [("unit", 12, 3, "kg", "potatoes"), ("unit", 6, 3, "kg", "bananas"), ("unit", 12, 4, "L", "juice"),
                 ("pay", 96, 4), ("pay", 135, 5), ("tap", 240, 8), ("beats", 300, 4), ("fuel", 360, 30),
                 ("words", 450, 9),
                 ("best", "potatoes", "Bag", (3, 12), (5, 15), "kg"), ("best", "juice", "Bottle", (2, 8), (3, 9), "L"),
                 ("best", "rice", "Bag", (2, 6), (5, 20), "kg"), ("best", "prawns", "Box", (2, 50), (3, 69), "kg")]
# speed: (distance, unit, time, unit, who, speed unit, place names or None)
#        ("rev", distance, unit, time, unit, who, speed unit, unknown 'd' or 't')
POOL["speed"] = [(25, "km", 1, "hour", "cyclist", "km/h", ("Kingscliff", "Murwillumbah")),
                 (120, "km", 2, "hours", "car", "km/h", ("Kingscliff", "Brisbane")),
                 (100, "m", 20, "seconds", "runner", "m/s", None), (50, "m", 25, "seconds", "swimmer", "m/s", None),
                 (15, "km", 3, "hours", "walker", "km/h", ("Kingscliff", "Tweed Heads")),
                 (12, "km", 3, "hours", "kayaker", "km/h", None), (180, "km", 2, "hours", "car", "km/h", None),
                 (400, "m", 80, "seconds", "runner", "m/s", None),
                 (15, "km", 20, "minutes", "bus", "km/h", ("Kingscliff", "Tweed Heads")),
                 (25, "km", 30, "minutes", "car", "km/h", ("Kingscliff", "Murwillumbah")),
                 (10, "km", 2, "hours", "walker", "km/h", ("Kingscliff", "Cabarita")),
                 ("rev", 240, "km", 3, "hours", "car", "km/h", "d"), ("rev", 300, "km", 5, "hours", "train", "km/h", "t"),
                 ("rev", 200, "m", 25, "seconds", "runner", "m/s", "t"), ("rev", 30, "km", 2, "hours", "cyclist", "km/h", "d")]
# time: ("diff", start, finish, sentence) | ("to24", 12-hour time) | ("to12", 24-hour time) | ("add", start, minutes, sentence)
POOL["time"] = [("diff", "08:45", "09:20", "A bus leaves Kingscliff at {a} and reaches Murwillumbah at {b}. "
                                           "How long is the trip?"),
                ("diff", "06:30", "07:05", "Surf club training starts at {a} and finishes at {b}. How long does "
                                           "it last?"),
                ("diff", "10:40", "12:15", "A touch footy carnival runs from {a} to {b}. How long is that?"),
                ("diff", "07:15", "12:00", "A stall at the Kingscliff markets is open from {a} to {b}. How long is "
                                           "it open?"),
                ("diff", "19:35", "21:20", "A movie starts at {a} and finishes at {b}. How long is the movie?"),
                ("diff", "14:25", "15:10", "A netball game starts at {a} and ends at {b}. How long is the game?"),
                ("diff", "09:15", "11:50", "A kayak tour on Cudgen Creek leaves at {a} and returns at {b}. How "
                                           "long is the tour?"),
                ("to24", "3:40 pm"), ("to24", "11:05 pm"), ("to24", "7:15 am"), ("to24", "12:30 am"),
                ("to24", "12:45 pm"),
                ("to12", "17:25"), ("to12", "00:15"), ("to12", "12:40"), ("to12", "09:05"), ("to12", "20:50"),
                ("add", "19:35", 110, "A movie starts at {a} and runs for 1 h 50 min. At what time does it finish? "
                                      "Use 24-hour time."),
                ("add", "08:50", 45, "A bus leaves Pottsville at {a}. The trip to Tweed Heads takes 45 minutes. At "
                                     "what time does it arrive? Use 24-hour time.")]

# ---- E: number plane, data and chance ----
# table_vals: ("tab", m, c, x values, indexes of the missing y values) | ("pt", m, c, A, B): read B from the graph
POOL["table_vals"] = [("tab", 2, 3, (0, 1, 2, 3), (1, 2)), ("tab", 3, -1, (1, 2, 3, 4), (0, 2)),
                      ("tab", 1, 4, (0, 1, 2, 3), (1, 3)), ("tab", 4, 0, (1, 2, 3, 4), (1, 2)),
                      ("tab", -1, 5, (0, 1, 2, 3), (2, 3)), ("tab", 2, -2, (-1, 0, 1, 2), (0, 3)),
                      ("tab", 3, 2, (0, 1, 2, 3), (2, 3)), ("tab", -2, 10, (1, 2, 3, 4), (1, 3)),
                      ("pt", 2, 1, (0, 1), (2, 5)), ("pt", 1, 2, (1, 3), (3, 5)), ("pt", 3, -1, (1, 2), (2, 5)),
                      ("pt", 1, 1, (0, 1), (4, 5)), ("pt", 2, -1, (1, 1), (3, 5)), ("pt", -1, 5, (1, 4), (4, 1))]
POOL["mean"] = [((8, 3, 5, 6, 8), "Scores", "scores"), ((21, 18, 24, 15, 22), "Scores", "scores"),
                ((7, 9, 4, 10, 5), "Goals", "goal tallies"), ((14, 11, 17, 12, 16), "Marks", "marks"),
                ((30, 25, 35, 20, 40), "Scores", "scores"), ((6, 2, 9, 4, 9), "Goals", "goal tallies"),
                ((13, 19, 16, 10, 17), "Scores", "scores"), ((45, 52, 48, 50, 55), "Marks", "marks"),
                ((12, 15, 9, 18, 6), "Points", "netball scores"), ((24, 31, 27, 30, 28), "°C", "temperatures"),
                ((3, 5, 2, 6, 4, 4), "Goals", "goal tallies"), ((150, 175, 160, 165, 170), "cm", "heights"),
                ((2, 0, 4, 1, 3), "Tries", "try tallies")]
# med_mode: ("median" | "mode", values) | ("dot", "median" | "mode", values, lowest, highest, axis label, sentence)
POOL["med_mode"] = [("median", (7, 3, 9, 5, 8)), ("median", (12, 15, 11, 18, 14, 20, 16)), ("median", (4, 9, 7, 3, 8, 5)),
                    ("median", (21, 25, 19, 30, 24)), ("median", (6, 2, 9, 4, 10, 8)),
                    ("mode", (5, 8, 3, 8, 6, 2, 8)), ("mode", (14, 11, 12, 14, 15, 11, 14)),
                    ("mode", (2, 4, 4, 1, 3, 2, 4, 5)),
                    ("dot", "mode", (1, 2, 2, 3, 3, 3, 3, 4, 5, 5), 0, 6, "Goals per game",
                     "The dot plot shows the goals a netball team scored in each game."),
                    ("dot", "median", (0, 1, 1, 2, 2, 2, 3, 3, 4), 0, 5, "Tries per game",
                     "The dot plot shows the tries a rugby league team scored in each game."),
                    ("dot", "mode", (2, 3, 3, 4, 4, 4, 4, 5, 6), 1, 7, "Number of pets",
                     "The dot plot shows the number of pets students in a class own."),
                    ("dot", "median", (1, 1, 2, 3, 3, 4, 4, 4, 5, 6, 6), 0, 7, "Waves caught",
                     "The dot plot shows the waves each nipper caught in a session."),
                    ("dot", "median", (3, 4, 4, 5, 5, 5, 6, 7), 2, 8, "Hours of sport",
                     "The dot plot shows the hours of sport some students played last week.")]
POOL["range"] = [((35, 48, 29, 52, 41), "Scores", "scores", ""), ((5, 11, 8, 2, 9), "Goals", "goal tallies", ""),
                 ((61, 47, 55, 70, 52), "Marks", "marks", ""), ((9, 3, 12, 7, 5), "Scores", "scores", ""),
                 ((104, 96, 118, 101, 99), "cm", "heights", " cm"), ((40, 38, 45, 33, 41), "Scores", "scores", ""),
                 ((19, 25, 22, 31, 27), "°C", "maximum temperatures", " °C"), ((58, 72, 65, 49, 70), "Marks", "test marks", ""),
                 ((8, 15, 11, 6, 13), "Tries", "try tallies", ""), ((165, 152, 171, 158, 160), "cm", "heights", " cm"),
                 ((26, 18, 31, 22, 24), "Goals", "netball scores", "")]
POOL["prob"] = [("bag", [("Red", 4), ("Blue", 2), ("Green", 6)], "green"),
                ("bag", [("Red", 2), ("Yellow", 3), ("Blue", 5)], "red"),
                ("bag", [("Red", 5), ("White", 3)], "white"), ("bag", [("Blue", 6), ("Green", 4), ("Red", 2)], "blue"),
                ("bag", [("Black", 7), ("White", 3)], "black"), ("bag", [("Blue", 3), ("Yellow", 5), ("Red", 4)], "yellow"),
                ("bag", [("Green", 2), ("White", 8)], "green"),
                ("die", "an even number", 3), ("die", "a 5", 1), ("die", "a number less than 3", 2),
                ("die", "a multiple of 3", 2), ("die", "a number greater than 4", 2),
                ("word", "BANANA", "A"), ("word", "MATHEMATICS", "M"), ("word", "KINGSCLIFF", "I"),
                ("word", "SUCCESS", "S")]
POOL["prob_not"] = [("rain", "2/5", "it does not rain"), ("late", "3/20", "the bus is not late"),
                    ("goal", "3/7", "a goal is not scored"), ("six", "1/6", "a six is not rolled"),
                    ("win", "7/10", "the team does not win"), ("red", "1/4", "the counter is not red"),
                    ("pass", "4/5", "the student does not pass"), ("hit", "7/9", "the target is not hit"),
                    ("blue", "5/12", "the marble is not blue"), ("delay", "1/8", "the flight is not delayed"),
                    ("flat", "3/8", "the surf is not flat"), ("try", "2/9", "a try is not scored")]
# exp_prob: ("tab", spinner counts, colour) | ("rel", count, trials, what) | ("die", counts of 1-6, face)
#           | ("shots", goals, shots) | ("open", days open, days)
POOL["exp_prob"] = [("tab", [("Red", 12), ("Blue", 18), ("Green", 20)], "blue"),
                    ("tab", [("Red", 14), ("Blue", 26), ("Green", 10)], "red"),
                    ("tab", [("Red", 23), ("Blue", 41), ("Green", 36)], "green"),
                    ("rel", 42, 100, "heads"), ("rel", 15, 60, "sixes"), ("rel", 27, 90, "heads"),
                    ("die", (8, 11, 9, 12, 10, 10), 6), ("die", (7, 9, 12, 10, 8, 14), 3),
                    ("shots", 32, 40), ("open", 27, 30)]


# ============================================================ generators: A ==
def g_ang_comp(it):
    kind, parts, k, extra = it
    total = 90 if kind == "comp" else 180
    assert sum(parts) == total, it
    x = total - sum(p for i, p in enumerate(parts) if i != k)       # the rule, applied to the printed angle
    labs = [f"{p}{DEG}" for p in parts]
    labs[k] = X + DEG
    if kind == "comp":
        return (f"Find the value of {X}.", (lambda s: D.right_split(parts, labs, rot=extra, H=int(124 * s))),
                "ang_comp", f"{x}{DEG}")
    return (f"Find the value of {X}.", (lambda s: D.angles_line(parts, labs, H=int(124 * s), below=extra)),
            "ang_supp", f"{x}{DEG}")


def g_ang_point(it):
    """Angles at a point; vertically opposite angles (Year 9 ang_line)."""
    if it[0] == "vop":
        _, th, tilt, side = it
        labs = (f"{th}{DEG}", X + DEG) if side == "L" else (X + DEG, f"{th}{DEG}")
        return (f"Find the value of {X}.", (lambda s: D.vert_opp(th, labs, H=int(124 * s), tilt=tilt)),
                "ang_vert", f"{th}{DEG}")
    _, parts, k, rot = it
    assert sum(parts) == 360, it
    x = 360 - sum(p for i, p in enumerate(parts) if i != k)
    labs = [f"{p}{DEG}" for p in parts]
    labs[k] = X + DEG
    return (f"Find the value of {X}.", (lambda s: D.angles_point(parts, labs, H=int(124 * s), rot=rot)),
            "ang_point", f"{x}{DEG}")


PAR_PAIRS = {"alt": [{("T", "LL"), ("B", "UR")}, {("T", "LR"), ("B", "UL")}],
             "coint": [{("T", "LL"), ("B", "UL")}, {("T", "LR"), ("B", "UR")}]}


def g_ang_par(it):
    """Corresponding, alternate and co-interior angles on parallel lines (Year 9)."""
    rel, th, g, xq = it
    if rel == "corr":
        assert g[1] == xq[1] and g[0] != xq[0], it
    else:
        assert {g, xq} in PAR_PAIRS[rel], it
    given = D.par_angle(th, g[1])
    x = given if rel in ("corr", "alt") else 180 - given
    assert abs(x - D.par_angle(th, xq[1])) < 1e-9, it
    marks = [(g[0], g[1], f"{nf(given)}{DEG}"), (xq[0], xq[1], X + DEG)]
    return (f"Find the value of {X}.", (lambda s: D.parallel(th, marks, H=int(126 * s))),
            {"corr": "ang_corr", "alt": "ang_alt", "coint": "ang_coint"}[rel], f"{nf(x)}{DEG}")


def g_ang_tri(it):
    A, B, pos = it
    C = 180 - A - B
    labs = [f"{A}{DEG}", f"{B}{DEG}", f"{C}{DEG}"]
    k = {"left": 0, "right": 1, "apex": 2}[pos]
    ans = f"{[A, B, C][k]}{DEG}"
    labs[k] = X + DEG
    return f"Find the value of {X}.", (lambda s: D.angle_tri(A, B, tuple(labs), H=int(126 * s))), "ang_tri", ans


def g_ang_ext(it):
    A, C, unk = it
    E = A + C
    labs = [f"{A}{DEG}", f"{C}{DEG}", f"{E}{DEG}"]
    k = {"left": 0, "apex": 1, "ext": 2}[unk]
    ans = f"{[A, C, E][k]}{DEG}"
    labs[k] = X + DEG
    return f"Find the value of {X}.", (lambda s: D.ext_angle(A, C, tuple(labs), H=int(118 * s))), "ang_ext", ans


def g_ang_quad(it):
    angles, pos = it
    labs = [f"{a}{DEG}" for a in angles]
    labs[pos] = X + DEG
    return (f"Find the value of {X}.", (lambda s: D.quad_angles(angles, tuple(labs), L1=None, H=int(124 * s))),
            "ang_quad", f"{angles[pos]}{DEG}")


def g_pyth_hyp(it):
    a, b, u, o = it
    c = whole(math.hypot(a, b), it)
    return ("Find the length of the hypotenuse, <i>c</i>.",
            (lambda s: D.rt_tri(a, b, legs=(lab(a, u), lab(b, u)), hyp="<i>c</i>", unknown=1, orient=o, H=int(124 * s))),
            "pyth_hyp", lab(c, u))


def g_pyth_short(it):
    h, g, u, o = it
    x = whole(math.sqrt(h * h - g * g), it)
    if x >= g:
        f_ = lambda s: D.rt_tri(x, g, legs=(X, lab(g, u)), hyp=lab(h, u), unknown=0, orient=o, H=int(124 * s))  # noqa: E731
    else:
        f_ = lambda s: D.rt_tri(g, x, legs=(lab(g, u), X), hyp=lab(h, u), unknown=2, orient=o, H=int(124 * s))  # noqa: E731
    return f"Find the value of {X}.", f_, "pyth_short", lab(x, u)


# ============================================================ generators: B ==
def g_perimeter(it):
    kind = it[0]
    if kind == "rect":
        _, l, w, u = it
        return ("Find the perimeter of this rectangle.",
                (lambda s: D.rect(l, w, (lab(l, u), lab(w, u)), H=int(112 * s))), "p_rect", lab(2 * (l + w), u))
    if kind == "sq":
        _, sd, u = it
        return "Find the perimeter of this square.", (lambda s: D.square(lab(sd, u), H=int(112 * s))), \
            "p_square", lab(4 * sd, u)
    _, shape, k, u = it
    pts, name = SHAPES[shape]
    M = [(k * x, k * y) for x, y in pts]
    sides = [whole(math.dist(M[i], M[(i + 1) % len(M)]), it) for i in range(len(M))]
    labs = [lab(sd, u) for sd in sides]
    return (f"Find the perimeter of this {name}.",
            (lambda s: D.poly_sides(M, labs, H=int(124 * max(s, 0.9)), rights=RIGHTS.get(shape, ()))), "p_poly",
            lab(sum(sides), u))


def _circle_fig(kind, label):
    if kind == "d":
        return lambda s: D.circle_d(label, R=int(42 * s + 4), H=int(100 * s + 8))
    return lambda s: D.circle_r(label, R=int(42 * s + 4), H=int(100 * s + 8))


def g_circ(it):
    kind, v, u = it
    C = safe1(math.pi * v if kind == "d" else 2 * math.pi * v, it)
    return ("Find the circumference of this circle, correct to 1 decimal place.", _circle_fig(kind, lab(v, u)),
            "c_circ_d" if kind == "d" else "c_circ_r", f"{d1(C)} {u}")


def g_a_rect(it):
    if is_rev(it):              # area given, find a side: x = A / known side
        _, l, w, u, unk = it
        A = l * w
        known = w if unk == "l" else l
        labs = (X, lab(w, u)) if unk == "l" else (lab(l, u), X)
        return (f"The area of this rectangle is {nf(A)} {u}². Find {X}.",
                (lambda s: D.rect(l, w, labs, H=int(112 * s))), "a_rect", lab(whole(A / known, it), u))
    if it[0] == "sq":
        _, sd, u = it
        return "Find the area of this square.", (lambda s: D.square(lab(sd, u), H=int(112 * s))), "a_square", \
            f"{nf(sd * sd)} {u}²"
    l, w, u = it
    return ("Find the area of this rectangle.", (lambda s: D.rect(l, w, (lab(l, u), lab(w, u)), H=int(112 * s))),
            "a_rect", f"{nf(l * w)} {u}²")


def g_a_tri(it):
    if is_rev(it):              # area given, find the base or the height: x = 2A / known
        _, b, h, u, unk = it
        A = whole(b * h / 2, it)
        known = h if unk == "b" else b
        bl, hl = (X, lab(h, u)) if unk == "b" else (lab(b, u), X)
        return (f"The area of this triangle is {nf(A)} {u}². Find {X}.",
                (lambda s: D.tri_height(b, 0.25 * b, h, bl, hl, H=int(124 * s), clear=True)), "a_tri",
                lab(whole(2 * A / known, it), u))
    b, h, u = it
    return ("Find the area of this triangle.",
            (lambda s: D.tri_height(b, 0.25 * b, h, lab(b, u), lab(h, u), H=int(124 * s), clear=True)),
            "a_tri", f"{nf(whole(b * h / 2, it))} {u}²")


def g_a_para(it):
    if is_rev(it):
        _, b, h, off, u, unk = it
        A = b * h
        known = h if unk == "b" else b
        labs = (X, lab(h, u)) if unk == "b" else (lab(b, u), X)
        return (f"The area of this parallelogram is {nf(A)} {u}². Find {X}.",
                (lambda s: D.parallelogram(b, h, off, labs, H=int(118 * s))), "a_para", lab(whole(A / known, it), u))
    b, h, off, u = it
    return ("Find the area of this parallelogram.",
            (lambda s: D.parallelogram(b, h, off, (lab(b, u), lab(h, u)), H=int(118 * s))),
            "a_para", f"{nf(b * h)} {u}²")


def g_a_comp(it):
    kind, dims, u = it[0], it[1], it[2]
    if kind == "L":
        Wd, Ht, w1, h1 = dims
        mirror = it[3]
        A = Wd * h1 + w1 * (Ht - h1)                       # bottom arm + the column above it
        assert A == Wd * Ht - (Wd - w1) * (Ht - h1), it     # = the whole rectangle minus the notch
        labs = [lab(v, u) for v in (Wd, h1, Wd - w1, Ht - h1, w1, Ht)]
        f_ = (lambda s: D.composite("L", dims, labs, H=int(124 * max(s, 0.9)), mirror=mirror))
    elif kind == "house":
        Wd, Hr, Ht = dims
        A = whole(Wd * Hr + Wd * Ht / 2, it)
        labs = [lab(v, u) for v in (Wd, Hr, Ht)]
        f_ = (lambda s: D.composite("house", dims, labs, H=int(124 * max(s, 0.9))))
    else:
        Wd, Hr, b = dims
        A = whole(Wd * Hr + b * Hr / 2, it)
        labs = [lab(v, u) for v in (Wd, b, Hr)]
        f_ = (lambda s: D.composite("ramp", dims, labs, H=int(124 * max(s, 0.9))))
    return "Find the area of this shape.", f_, "a_comp", f"{nf(A)} {u}²"


def g_v_rect(it):
    if is_rev(it):
        _, l, w, h, u, unk = it
        V = l * w * h
        dims = {"l": l, "w": w, "h": h}
        known = math.prod(v_ for k_, v_ in dims.items() if k_ != unk)
        labs = tuple(X if k_ == unk else lab(v_, u) for k_, v_ in dims.items())
        return (f"The volume of this rectangular prism is {nf(V)} {u}³. Find {X}.",
                (lambda s: D.box(l, w, h, labs, H=int(124 * s))), "v_rect", lab(whole(V / known, it), u))
    l, w, h, u = it
    return ("Find the volume of this rectangular prism.",
            (lambda s: D.box(l, w, h, (lab(l, u), lab(w, u), lab(h, u)), H=int(124 * s))),
            "v_rect", f"{nf(l * w * h)} {u}³")


UNIT = {"mm": ("len", 1), "cm": ("len", 10), "m": ("len", 1000), "km": ("len", 1000000),
        "cm²": ("area", 1), "m²": ("area", 10000), "mL": ("vol", 1), "cm³": ("vol", 1), "L": ("vol", 1000)}
UNIT_NAME = {"mm": "millimetres", "cm": "centimetres", "m": "metres", "km": "kilometres", "cm²": "square centimetres",
             "m²": "square metres", "mL": "millilitres", "cm³": "cubic centimetres", "L": "litres"}


def _plain_dec(s):
    """Decimal string -> printed number (grouped whole part)."""
    d = Decimal(s).normalize()
    t = format(d, "f")
    if "." in t:
        w, f_ = t.split(".")
        return grp(int(w)) + "." + f_
    return grp(int(t))


def g_units(it):
    val, fu, tu = it
    (k1, f1), (k2, f2) = UNIT[fu], UNIT[tu]
    assert k1 == k2, it
    out = Decimal(val) * f1 / f2
    assert out == out.to_integral_value(), it                 # whole-number answers
    key = {"len": "u_len", "area": "u_area", "vol": "u_vol"}[k1]
    return (f"Convert {_plain_dec(val)} {fu} to {UNIT_NAME[tu]}.", None, key, f"{grp(int(out))} {tu}")


def g_a_trap(it):
    a, t, h, tx, u = it
    return ("Find the area of this trapezium.",
            (lambda s: D.trapezium(a, t, h, tx, (lab(t, u), lab(a, u), lab(h, u)), H=int(118 * s), clear=True)),
            "a_trap", f"{nf(whole(h * (a + t) / 2, it))} {u}²")


def g_a_kite(it):
    lf, rt, hh, u = it
    name = "rhombus" if lf == rt else "kite"
    x, y = lf + rt, 2 * hh
    whole(x, it), whole(y, it)
    return (f"Find the area of this {name}.",
            (lambda s: D.kite(lf, rt, hh, (lab(x, u), lab(y, u)), H=124)),     # needs its full height
            "a_kite", f"{nf(whole(x * y / 2, it))} {u}²")


def g_a_circle(it):
    kind, v, u = it
    r = v / 2 if kind == "d" else v
    A = safe1(math.pi * r * r, it)
    return ("Find the area of this circle, correct to 1 decimal place.", _circle_fig(kind, lab(v, u)), "a_circle",
            f"{d1(A)} {u}²")


# ============================================================ generators: C ==
def ops_html(s):
    return s.replace("*", TIMES).replace("/", DIV).replace("-", MINUS)


def g_order_ops(it):
    v = ev(it, {})
    assert v.denominator == 1, it
    return "Evaluate.", static(display(ops_html(it))), "order_ops", nf(int(v))


def _tok_html(t):
    if t[0] == "p":
        return f"{t[1]}<sup>{t[2]}</sup>"
    if t[0] == "s":
        return rsqrt(t[1])
    return rcbrt(t[1])


def _tok_val(t):
    if t[0] == "p":
        return t[1] ** t[2]
    r = round(t[1] ** (1 / (2 if t[0] == "s" else 3)))
    assert r ** (2 if t[0] == "s" else 3) == t[1], t
    return r


def g_idx_root(it):
    v = _tok_val(it[0])
    html = _tok_html(it[0])
    for op, t in zip(it[1::2], it[2::2]):
        w = _tok_val(t)
        v = v + w if op == "+" else (v - w if op == "-" else v * w)
        html += f" {ops_html(op)} {_tok_html(t)}"
    key = "root_eval" if any(t[0] in "sc" for t in it[::2]) else "idx_eval"
    return "Evaluate.", static(display(html)), key, nf(v)


def _qty(q, u):
    return money(q) if u == "$" else (f"{nf(q)} {u}" if u else nf(q))


def g_frac_qty(it):
    if it[0] == "ctx":
        _, n, d, q, sentence = it
        v = Fraction(n, d) * q
        assert v.denominator == 1, it
        return sentence.format(f=frac(n, d)), None, "frac_qty", nf(int(v))
    n, d, q, u = it
    v = Fraction(n, d) * q
    assert v.denominator == 1, it
    return "Calculate.", static(display(f"{frac(n, d)} of {_qty(q, u)}")), "frac_qty", _qty(int(v), u)


def g_pct_qty(it):
    p, q, u = it
    v = Fraction(p, 100) * q
    assert v.denominator == 1, it
    return "Calculate.", static(display(f"{p}% of {_qty(q, u)}")), "pct_qty", _qty(int(v), u)


PCT_CTX = {
    "quiz": "Mia scored {a} out of {b} on a quiz. Write Mia’s score as a percentage.",
    "netball": "A netball shooter scored {a} goals from {b} shots. What percentage of the shots were goals?",
    "touch": "The Kingscliff touch footy team won {a} of its {b} games. What percentage of its games did it win?",
    "nippers": "{a} of the {b} nippers at the surf club passed the swim test. What percentage passed?",
    "class": "{a} of the {b} students in a class walk or ride to school. What percentage is that?",
    "goals": "A rugby league team kicked {a} of its {b} goal attempts. What percentage did it kick?",
}


def g_pct_express(it):
    a, b, ctx = it
    p = Fraction(a, b) * 100
    assert p.denominator == 1, it
    if ctx:
        return PCT_CTX[ctx].format(a=a, b=b), None, "pct_express", f"{p}%"
    return "Write as a percentage.", static(display(f"{a} out of {b}")), "pct_express", f"{p}%"


def g_pow10(it):
    s, op, p = it
    v = Decimal(s) * p if op == "*" else Decimal(s) / p
    return ("Calculate.", static(display(f"{_plain_dec(s)} {ops_html(op)} {grp(p)}")),
            "pow10_mul" if op == "*" else "pow10_div", _plain_dec(str(v)))


def g_fdp(it):
    kind = it[0]
    if kind in ("f2d", "f2p"):
        n, d = it[1], it[2]
        fr_ = Fraction(n, d)
        assert fr_.numerator == n, it                                    # printed in simplest form
        if kind == "f2d":
            dec = Decimal(n) / Decimal(d)
            assert dec * d == n, it                                      # a terminating decimal
            return "Write as a decimal.", static(display(frac(n, d))), "f2d", _plain_dec(str(dec))
        p = fr_ * 100
        assert p.denominator == 1, it
        return "Write as a percentage.", static(display(frac(n, d))), "f2p", f"{p}%"
    if kind in ("d2f", "d2p"):
        s = it[1]
        fr_ = Fraction(s)
        if kind == "d2f":
            return "Write as a fraction in simplest form.", static(display(s)), "d2f", fstr(fr_)
        p = Decimal(s) * 100
        return "Write as a percentage.", static(display(s)), "d2p", f"{_plain_dec(str(p))}%"
    p = it[1]
    if kind == "p2f":
        return "Write as a fraction in simplest form.", static(display(f"{p}%")), "p2f", fstr(Fraction(p, 100))
    return "Write as a decimal.", static(display(f"{p}%")), "p2d", _plain_dec(str(Decimal(p) / 100))


def _b(b):
    return f"<i>{b}</i>" if isinstance(b, str) else str(b)


def g_idx_laws(it):
    """Year 9 `idx` items: multiply, divide, power of a power (whole indices)."""
    kind, b, m, n = it
    B = _b(b)
    if kind == "mult":
        disp, e, key = f"{B}<sup>{m}</sup> {TIMES} {B}<sup>{n}</sup>", m + n, "idx_mult"
    elif kind == "div":
        disp, e, key = f"{B}<sup>{m}</sup> {DIV} {B}<sup>{n}</sup>", m - n, "idx_div"
    else:
        disp, e, key = f"({B}<sup>{m}</sup>)<sup>{n}</sup>", m * n, "idx_pow"
    assert e >= 1, it
    txt = "Simplify." if isinstance(b, str) else "Write as a single power."
    return txt, static(display(disp)), key, f"{b}^{e}"


def g_pct_change(it):
    if it[0] == "profit":                       # Year 10 profit_pct
        _, c, s_ = it
        p = Fraction(s_ - c, c) * 100
        assert p.denominator == 1, it
        word = "profit" if p > 0 else "loss"
        return (f"Find the percentage {word}.", static(dtable([["Cost price", money(c)], ["Selling price", money(s_)]])),
                "profit_pct" if p > 0 else "loss_pct", f"{abs(p)}% {word}")
    _, d, amt, p, ctx = it                       # Year 10 pct_change (Year 9 pct_incdec), whole answers
    new = Fraction(amt) * ((100 + p) if d == "inc" else (100 - p)) / 100
    assert new.denominator == 1, it
    word = "Increase" if d == "inc" else "Decrease"
    P = f"{p}%"
    fig = None
    if ctx == "sale":
        txt, rows = "Find the sale price.", [["Original price", money(amt)], ["Discount", P]]
    elif ctx == "price":
        txt, rows = "Find the new price.", [["Original price", money(amt)], [word, P]]
    elif ctx == "wage":
        txt, rows = "Find the new weekly wage.", [["Weekly wage", money(amt)], ["Pay rise", P]]
    elif ctx == "pop":
        txt, rows = "Find the new population of the town.", [["Population", grp(amt)], [word, P]]
    elif ctx == "plain$":
        txt, fig = "Find the new amount.", display(f"{word} {money(amt)} by {P}")
    else:
        txt, fig = "Find the new mass.", display(f"{word} {nf(amt)} kg by {P}")
    if fig is None:
        fig = dtable(rows)
    if ctx == "pop":
        ans = grp(int(new))
    elif ctx == "plainkg":
        ans = f"{nf(int(new))} kg"
    else:
        ans = money(int(new))
    return txt, static(fig), "pct_inc" if d == "inc" else "pct_dec", ans


# ============================================================ generators: D ==
def _vals(vals):
    parts = [f"<i>{k}</i> = {nf(v)}" for k, v in vals.items()]
    return parts[0] if len(parts) == 1 else ", ".join(parts[:-1]) + " and " + parts[-1]


def g_subst(it):
    expr, vals = it
    v = ev(to_py(expr), vals)
    assert v.denominator == 1, it
    html = it_html(expr)
    return (f"Find the value of this expression when {_vals(vals)}.", static(display(html)), "subst",
            nf(int(v)), html)


def g_distrib(it):
    e, a = it
    for t in (0, 1, 2, 5, -3):                  # the expansion is right for every value of the pronumerals
        vals = {c: Fraction(t + 2 * i) for i, c in enumerate(sorted(set(re.findall(r"[a-z]", e + a))))}
        assert ev(to_py(e), vals) == ev(to_py(a), vals), it
    return "Expand.", static(display(it_html(e))), "distrib", a.replace("-", MINUS)


def g_equation(it):
    eq, steps = it
    lhs, rhs = eq.split("=")
    var = re.findall(r"[a-z]", eq)[0]
    res = lambda t: ev(to_py(lhs), {var: t}) - ev(to_py(rhs), {var: t})   # noqa: E731
    r0, r1 = res(0), res(1)
    sol = -r0 / (r1 - r0)
    assert res(sol) == 0 and sol.denominator == 1, it
    return "Solve.", static(display(it_html(eq))), "eq_one" if steps == 1 else "eq_two", f"{var} = {nf(int(sol))}"


def g_ratio_simp(it):
    if it[0] == "u":
        _, a, ua, b, ub = it
        conv = {("cm", "m"): 100, ("m", "km"): 1000, ("min", "h"): 60}[(ua, ub)]
        parts = (a, b * conv)
        disp = f"{a} {ua} : {b} {ub}"
        txt = "Write as a ratio in simplest form."
    else:
        parts = it
        disp = " : ".join(str(p) for p in parts)
        txt = "Simplify."
    g = math.gcd(*parts)
    assert g > 1, it
    return txt, static(display(disp)), "ratio_simp", " : ".join(str(p // g) for p in parts)


def g_ratio_share(it):
    amt, parts, what = it
    tot = sum(parts)
    shares = [Fraction(amt * p, tot) for p in parts]
    assert all(s_.denominator == 1 for s_ in shares), it
    rs = " : ".join(str(p) for p in parts)
    a_txt = money(amt) if what == "$" else f"{amt} {what}"
    fmt = money if what == "$" else nf
    ans = ", ".join(fmt(int(v)) for v in shares[:-1]) + " and " + fmt(int(shares[-1]))
    return f"Share {a_txt} in the ratio {rs}. Give both shares.", None, "ratio_share", ans


RATE_TXT = {
    "pay": ("Sam earns {a} for {b} hours of work at the surf club kiosk. Find Sam’s hourly rate.", "${v} per hour"),
    "tap": ("A tap fills a tank with {a} L of water in {b} minutes. Find the rate in litres per minute.",
            "{v} L per minute"),
    "beats": ("A heart beats {a} times in {b} minutes. Find the rate in beats per minute.", "{v} beats per minute"),
    "fuel": ("A car travels {a} km on {b} L of fuel. Find the rate in kilometres per litre.", "{v} km per litre"),
    "words": ("Jo types {a} words in {b} minutes. Find Jo’s typing rate in words per minute.", "{v} words per minute"),
}


def g_rates(it):
    kind = it[0]
    if kind == "unit":
        _, price, q, u, what = it
        v = Fraction(price, q)
        assert v.denominator == 1, it
        name = {"kg": "kilogram", "L": "litre"}[u]
        return (f"{q} {u} of {what} cost {money(price)}. Find the price per {name}.", None, "rate",
                f"{money(int(v))} per {u}")
    if kind == "best":
        _, what, word, (q1, p1), (q2, p2), u = it
        r1, r2 = Fraction(p1, q1), Fraction(p2, q2)
        assert r1 != r2 and r1.denominator == 1 and r2.denominator == 1, it
        tab = dtable([[f"{word} A", f"{q1} {u} for {money(p1)}"], [f"{word} B", f"{q2} {u} for {money(p2)}"]])
        best, q_, p_, r_ = ("A", q1, p1, r1) if r1 < r2 else ("B", q2, p2, r2)
        return (f"Which {word.lower()} of {what} is the better buy?", static(tab), "best_buy",
                f"{word} {best} ({money(int(r_))} per {u})")
    a, b = it[1], it[2]
    v = Fraction(a, b)
    assert v.denominator == 1, it
    txt, ans = RATE_TXT[kind]
    a_s = money(a) if kind == "pay" else grp(a)
    return txt.format(a=a_s, b=b), None, "rate", ans.format(v=int(v))


VERB = {"cyclist": "rides", "car": "travels", "runner": "runs", "swimmer": "swims", "walker": "walks",
        "kayaker": "paddles", "bus": "travels", "train": "travels"}


def g_speed(it):
    if is_rev(it):              # speed given, find the distance (d = s x t) or the time (t = d / s)
        _, d, du, t, tu, who, ou, unk = it
        v = whole(d / t, it)
        txt = (f"A {who} {VERB[who]} from A to B at an average speed of "
               f'<span style="white-space:nowrap">{v} {ou}</span>. Find {X}.')
        if unk == "d":
            return txt, (lambda s: D.journey(X, f"{nf(t)} {tu}")), "speed", lab(d, du)
        return txt, (lambda s: D.journey(lab(d, du), X)), "speed", f"{nf(t)} {tu}"
    d, du, t, tu, who, ou, names = it
    hours = Fraction(t, 60) if tu == "minutes" else Fraction(t)
    v = Fraction(d) / hours if ou == "km/h" else Fraction(d, t)
    assert v.denominator == 1, it
    where = f"from {names[0]} to {names[1]}" if names else "from A to B"
    txt = f"A {who} {VERB[who]} {where}. Find the average speed" + (" in km/h." if tu == "minutes" else ".")
    nm = names or ("A", "B")
    W = 300 if names else 270
    return txt, (lambda s: D.journey(lab(d, du), f"{nf(t)} {tu}", W=W, names=nm)), "speed", f"{int(v)} {ou}"


def _mins(hhmm):
    h, m = hhmm.split(":")
    return int(h) * 60 + int(m)


def _dur(mins):
    h, m = divmod(mins, 60)
    if h == 0:
        return f"{m} minutes"
    return f"{h} h {m} min" if m else (f"{h} hours" if h > 1 else "1 hour")


def g_time(it):
    kind = it[0]
    if kind == "diff":
        _, a, b, sentence = it
        d = _mins(b) - _mins(a)
        assert 0 < d < 12 * 60, it
        return sentence.format(a=a, b=b), None, "t_diff", _dur(d)
    if kind == "add":
        _, a, mins, sentence = it
        t = _mins(a) + mins
        assert t < 24 * 60, it
        return sentence.format(a=a), None, "t_diff", f"{t // 60:02d}:{t % 60:02d}"
    if kind == "to24":
        s = it[1]
        hm, ap = s.split()
        h, m = map(int, hm.split(":"))
        h24 = (h % 12) + (12 if ap == "pm" else 0)
        return f"Write {s} in 24-hour time.", None, "t_conv", f"{h24:02d}:{m:02d}"
    s = it[1]
    h, m = map(int, s.split(":"))
    ap = "am" if h < 12 else "pm"
    h12 = h % 12 or 12
    return f"Write {s} in 12-hour time (am or pm).", None, "t_conv", f"{h12}:{m:02d} {ap}"


# ============================================================ generators: E ==
def _rule(m, c):
    if m == -1 and c > 0:
        return f"<i>y</i> = {c} {MINUS} <i>x</i>"
    if m < 0 and c > 0:
        return f"<i>y</i> = {c} {MINUS} {-m}<i>x</i>"
    ms = {1: ""}.get(m, nf(m))
    cs = "" if c == 0 else (f" + {c}" if c > 0 else f" {MINUS} {-c}")
    return f"<i>y</i> = {ms}<i>x</i>{cs}"


def g_table_vals(it):
    if it[0] == "pt":
        _, m, c, A, B = it
        for p in (A, B):
            assert p[1] == m * p[0] + c, it
        return (f"A and B lie on the line {_rule(m, c)}. Write the coordinates of B.",
                (lambda s: D.plane_line(A, B, u=17 * s / 0.9 if s < 0.9 else 17, clear=True, coords=(True, False))),
                "tv_point", f"({nf(B[0])}, {nf(B[1])})")
    _, m, c, xs, miss = it
    ys = [m * x + c for x in xs]
    row = [nf(y) if i not in miss else "&nbsp;" for i, y in enumerate(ys)]
    tab = dtable([["<i>x</i>"] + [nf(x) for x in xs], ["<i>y</i>"] + row])
    return (f"Complete the table for {_rule(m, c)}.", static(tab), "tv_table",
            ", ".join(nf(ys[i]) for i in sorted(miss)))


def data_table(head, vals):
    """One row of scores: up to 5 with a heading cell; 6 tighter; 7 or more tighter still, no heading."""
    cells = [nf(v) for v in vals]
    if len(vals) <= 5:
        return dtable([[head] + cells])
    if len(vals) == 6:
        return dtable([[head] + cells], compact="x")
    return dtable([cells], head_col=False, compact="x")


def g_mean(it):
    vals, head, noun = it
    m = Fraction(sum(vals), len(vals))
    assert m.denominator == 1, it
    return f"Find the mean of these {noun}.", static(data_table(head, vals)), "mean", nf(int(m))


def _median(vals):
    s = sorted(vals)
    n = len(s)
    return Fraction(s[n // 2]) if n % 2 else Fraction(s[n // 2 - 1] + s[n // 2], 2)


def _mode(vals):
    c = Counter(vals).most_common()
    assert len(c) == 1 or c[0][1] > c[1][1], vals                       # exactly one mode
    return c[0][0]


def g_med_mode(it):
    if it[0] == "dot":
        _, ask, vals, lo, hi, axis, sentence = it
        v = _median(vals) if ask == "median" else Fraction(_mode(vals))
        assert v.denominator == 1, it
        return (f"{sentence} Find the {ask}.", (lambda s: D.dot_plot(vals, lo, hi, axis, H=int(118 * s))), ask,
                nf(int(v)))
    ask, vals = it
    v = _median(vals) if ask == "median" else Fraction(_mode(vals))
    assert v.denominator == 1, it
    return f"Find the {ask} of these scores.", static(data_table("Scores", vals)), ask, nf(int(v))


def g_range(it):
    vals, head, noun, unit = it
    return (f"Find the range of these {noun}.", static(dtable([[head] + [nf(v) for v in vals]])), "range",
            f"{nf(max(vals) - min(vals))}{unit}")


def g_prob(it):
    kind = it[0]
    if kind == "bag":
        counts, target = it[1], it[2]
        tot = sum(c for _, c in counts)
        fav = dict((k.lower(), c) for k, c in counts)[target]
        tab = dtable([["Colour"] + [k for k, _ in counts], ["Marbles"] + [str(c) for _, c in counts]])
        return (f"One marble is chosen at random from this bag. Find the probability that it is {target}.",
                static(tab), "prob", fstr(Fraction(fav, tot)))
    if kind == "die":
        ev_, fav = it[1], it[2]
        return (f"A fair die is rolled. Find the probability of rolling {ev_}.", (lambda s: D.dice_row()), "prob",
                fstr(Fraction(fav, 6)))
    word, letter = it[1], it[2]
    disp = display(f'<span style="letter-spacing:0.28em">{word}</span>')
    return (f"A letter is chosen at random from this word. Find <i>P</i>({letter}).", static(disp), "prob",
            fstr(Fraction(word.count(letter), len(word))))


def g_prob_not(it):
    e, p, text = it
    n, d = map(int, p.split("/"))
    return (f"Find the probability that {text}.", static(display(f"<i>P</i>({e}) = {frac(n, d)}")), "prob_not",
            fstr(1 - Fraction(n, d)))


def g_exp_prob(it):
    kind = it[0]
    if kind == "tab":
        _, counts, target = it
        n = sum(c for _, c in counts)
        r = Fraction(dict((k.lower(), c) for k, c in counts)[target], n)
        tab = dtable([["Colour"] + [k for k, _ in counts], ["Frequency"] + [str(c) for _, c in counts]])
        return (f"A spinner was spun {n} times. Find the experimental probability of {target}.", static(tab),
                "exp_prob", fstr(r))
    if kind == "die":
        _, counts, face = it
        n = sum(counts)
        tab = dtable([["Number"] + [str(k) for k in range(1, 7)], ["Frequency"] + [str(c) for c in counts]],
                     compact="x")
        return (f"A die was rolled {n} times. Find the experimental probability of rolling a {face}.", static(tab),
                "exp_prob", fstr(Fraction(counts[face - 1], n)))
    if kind == "rel":
        _, c, n, what = it
        thing = {"heads": f"Heads came up {c} times in {n} tosses of a coin.",
                 "sixes": f"A six came up {c} times in {n} rolls of a die."}[what]
        noun = {"heads": "heads", "sixes": "rolling a six"}[what]
        return f"{thing} Find the experimental probability of {noun}.", None, "exp_prob", fstr(Fraction(c, n))
    if kind == "shots":
        _, c, n = it
        return (f"A netball goal shooter scored {c} goals from {n} shots. Find the experimental probability of "
                f"scoring a goal.", None, "exp_prob", fstr(Fraction(c, n)))
    _, c, n = it
    return (f"Kingscliff Beach was open for swimming on {c} of the last {n} days. Find the experimental "
            f"probability that the beach is open.", None, "exp_prob", fstr(Fraction(c, n)))


GEN = {"ang_comp": g_ang_comp, "ang_point": g_ang_point, "ang_par": g_ang_par, "ang_tri": g_ang_tri,
       "ang_ext": g_ang_ext, "ang_quad": g_ang_quad, "pyth_hyp": g_pyth_hyp, "pyth_short": g_pyth_short,
       "perimeter": g_perimeter, "circ": g_circ, "a_rect": g_a_rect, "a_tri": g_a_tri, "a_para": g_a_para,
       "a_comp": g_a_comp, "v_rect": g_v_rect, "units": g_units, "a_trap": g_a_trap, "a_kite": g_a_kite,
       "a_circle": g_a_circle,
       "order_ops": g_order_ops, "idx_root": g_idx_root, "frac_qty": g_frac_qty, "pct_qty": g_pct_qty,
       "pct_express": g_pct_express, "pow10": g_pow10, "fdp": g_fdp, "idx_laws": g_idx_laws, "pct_change": g_pct_change,
       "subst": g_subst, "distrib": g_distrib, "equation": g_equation, "ratio_simp": g_ratio_simp,
       "ratio_share": g_ratio_share, "rates": g_rates, "speed": g_speed, "time": g_time,
       "table_vals": g_table_vals, "mean": g_mean, "med_mode": g_med_mode, "range": g_range, "prob": g_prob,
       "prob_not": g_prob_not, "exp_prob": g_exp_prob}


def gen(fam, it):
    """(text, figure function, formula key, answer, printed formula or None)"""
    r = GEN[fam](it)
    return r if len(r) == 5 else (*r, None)


# ============================================================== scheduler ==
VERSIONS = {"M": "Year 8", "A": "Year 8 Advanced"}
Y7 = {
    "A": ["ang_comp", "ang_point", "ang_par", "ang_tri", "ang_ext", "ang_quad"],
    "B": ["perimeter", "circ", "a_rect", "a_tri", "a_para", "a_comp", "v_rect", "units"],
    "C": ["order_ops", "idx_root", "frac_qty", "pct_qty", "pct_express", "pow10", "fdp"],
    "D": ["subst", "distrib", "equation", "ratio_simp", "ratio_share", "rates", "speed", "time"],
    "E": ["table_vals", "mean", "med_mode", "range", "prob", "prob_not", "exp_prob"],
}
Y8_ADD = {"A": ["pyth_hyp", "pyth_short"], "B": ["a_trap", "a_kite", "a_circle"], "C": ["idx_laws", "pct_change"]}
Y8_DROP = {"B": ["a_rect", "units"]}
Y8_FAMS = {f for fs in Y8_ADD.values() for f in fs}
MIN_PER_TERM = 3


def year8(version, term):
    """Advanced Terms 3-4: the Year 8 families are in, formulas from memory."""
    return version == "A" and term >= 3


def given(version, term):
    """Is the formula printed? Mainstream always; Advanced in Terms 1-2."""
    return version == "M" or term <= 2


def families(strand, version, term):
    fams = list(Y7[strand])
    if year8(version, term):
        fams = [f for f in fams if f not in Y8_DROP.get(strand, [])] + Y8_ADD.get(strand, [])
    return fams


def counts(strand, version, term):
    """How many times each family appears in the term's 30 sessions (the weighting)."""
    adv = year8(version, term)
    fams = families(strand, version, term)
    if strand == "A":
        if not adv:
            c = {f: 5 for f in fams}
        else:
            c = {f: 4 for f in fams}
            for f in ({3: ("ang_comp", "ang_point"), 4: ("ang_par", "ang_quad")}[term]):
                c[f] = 3
    elif strand == "B":
        if not adv:
            c = {f: 4 for f in fams}
            c["v_rect"] = c["units"] = 3
        else:
            c = {f: 3 for f in fams}
            c["a_trap"] = c["a_kite"] = c["a_circle"] = 4
    elif strand == "C":
        if not adv:
            c = {f: 5 for f in ("frac_qty", "pct_qty", "pct_express", "fdp")}
            c.update({f: 3 for f in ("order_ops", "idx_root", "pow10")})
            c[("order_ops", "idx_root", "pow10")[(term - 1) % 3]] = 4
        else:
            c = {f: 3 for f in fams}
            c["pct_change"] = 4
            for f in ({3: ("frac_qty", "pct_qty"), 4: ("pct_express", "fdp")}[term]):
                c[f] = 4
    elif strand == "D":
        c = {f: 3 for f in fams}
        c["subst"] = c["distrib"] = c["equation"] = 5
    else:
        c = {f: 4 for f in fams}
        for f in ({1: ("mean", "prob"), 2: ("table_vals", "med_mode"), 3: ("exp_prob", "prob_not"),
                   4: ("range", "table_vals")}[term]):
            c[f] = 5
    assert sum(c.values()) == 30 and set(c) == set(fams), (strand, version, term, c)
    assert min(c.values()) >= MIN_PER_TERM
    return c


def seed(*parts):
    return zlib.crc32("|".join(map(str, parts)).encode())


def strand_sequence(strand, version, term, n=30):
    """Spread each family's appearances evenly through the term (ideal positions k * 30 / count with a
    random phase and a little jitter), then keep the most even of many tries: no family in two
    consecutive sessions, the smallest gap between repeats as large as possible."""
    cnt = counts(strand, version, term)
    rng = random.Random(seed("seq", version, strand, term))
    best = None
    for _ in range(3000):
        items = []
        for fam, c in cnt.items():
            ph = rng.random()
            for k in range(c):
                items.append(((k + ph) * n / c + rng.uniform(-1.4, 1.4), rng.random(), fam))
        items.sort()
        seq = [f for *_, f in items]
        rep = sum(a == b for a, b in zip(seq, seq[1:]))
        mg, dev = 99, 0.0
        for fam, c in cnt.items():
            idx = [i for i, f in enumerate(seq) if f == fam]
            gaps = [b - a for a, b in zip(idx, idx[1:])]
            mg = min(mg, min(gaps))
            dev += sum((g - n / c) ** 2 for g in gaps)
        score = (rep, -mg, dev)
        if best is None or score < best[0]:
            best = (score, seq)
    assert best[0][0] == 0, (strand, version, term)
    return best[1]


def qsig(q):
    """What makes two questions the same: the question text, the numbers and words printed in its figure
    (whatever the drawing scale) and the answer."""
    txt = re.sub(r"<[^>]+>", "", q.text)
    labs = sorted(t.strip() for t in re.findall(r">([^<>]+)<", q.fig or "") if t.strip())
    return txt, tuple(labs), q.answer


# family -> (which items are special, is appearance k of n a special one?): working backwards, about 1 in 4
SPECIAL = {f: (is_rev, lambda k, n: k % 4 == 1) for f in ("a_rect", "a_tri", "a_para", "v_rect", "speed")}



# Mainstream v2 (slightly easier): family -> which pool items Mainstream leaves out. Advanced is unchanged.
def _has(*keys):
    return lambda it: any(k in repr(it) for k in keys)


EASY_DROP = {
    **{f: is_rev for f in ("a_rect", "a_tri", "a_para", "v_rect")},                 # working backwards
    "speed": lambda it: is_rev(it) or "minutes" in it,                               # + time in minutes
    "order_ops": lambda it: re.search(r"\(-\d+\)", it) is not None,                  # (-2) etc.
    "idx_root": lambda it: len(it) > 1 and any(t[0] in "sc" for t in it if isinstance(t, tuple)),
    "subst": lambda it: any(v_ < 0 for v_ in it[1].values()),                        # negative values
    "equation": lambda it: it[1] == 2 and "[x]/" in it[0],                          # x/3 + 2 = 7, x/2 - 3 = 5
    "fdp": lambda it: it in (("f2d", 3, 8), ("d2f", "0.125")),                       # three decimal places
    "ratio_simp": lambda it: it[0] == "u" or len(it) == 3,                           # units, three parts
    "units": _has("m²"),                                                             # m² <-> cm²
    "med_mode": lambda it: (it[0] == "median" and len(it[1]) % 2 == 0)
                           or (it[0] == "dot" and it[1] == "median" and len(it[2]) % 2 == 0),
    "time": lambda it: it[0] == "add" or it[1] in ("12:30 am", "00:15"),
    "perimeter": lambda it: it == ("poly", "pent", 1, "cm"),
}
# Mainstream-only additions where EASY_DROP leaves fewer than 10 items (same style, whole numbers)
EASY_ADD = {"ratio_simp": [(20, 35), (32, 12)]}

class Pools:
    """Draws items without replacement (no question repeats within a term). Within a family the formula
    used least so far this term comes next (so sub-formulas rotate); then items the previous term did
    not use; then items used least in all the earlier terms of this version."""

    def __init__(self, version, term, prev=(), older=None):
        self.version, self.term = version, term
        self.prev = set(prev)
        self.older = older or Counter()
        self.used = set()
        self.keys = {}
        self.rng = random.Random(seed("pool", version, term))

    def items(self, fam):
        """The family's pool for this version: Mainstream drops the harder items (EASY_DROP) and adds a
        few easy ones (EASY_ADD) where that leaves too few; Advanced uses POOL unchanged."""
        if self.version != "M":
            return list(POOL[fam])
        drop = EASY_DROP.get(fam, lambda it: False)
        return [it for it in POOL[fam] if not drop(it)] + list(EASY_ADD.get(fam, ()))

    def draw(self, fam, k, n, avoid=()):
        avail = [it for it in self.items(fam) if (fam, repr(it)) not in self.used and repr(it) not in avoid]
        if not avail:
            raise RuntimeError(f"{self.version} term {self.term}: the {fam} pool has run out")
        pred, slot = SPECIAL.get(fam, (lambda it: False, lambda k_, n_: False))
        want = slot(k, n)
        pref = [it for it in avail if pred(it) == want] or avail
        use = {repr(it): self.keys.get(gen(fam, it)[2], 0) for it in pref}
        lo = min(use.values())
        cands = [it for it in pref if use[repr(it)] == lo]
        cands = [it for it in cands if (fam, repr(it)) not in self.prev] or cands
        lo2 = min(self.older[(fam, repr(it))] for it in cands)
        cands = [it for it in cands if self.older[(fam, repr(it))] == lo2]
        it = self.rng.choice(cands)
        self.used.add((fam, repr(it)))
        return it


_CACHE = {}


def generated_sessions(version, term):
    """All 30 sessions of a term (Weeks 1-10, Sessions 1-3) for a version ('M' or 'A')."""
    if (version, term) in _CACHE:
        return _CACHE[(version, term)]
    prev, older = set(), Counter()
    for t in range(1, term):
        for s in generated_sessions(version, t)[0]:
            for q in s.qs:
                older[(q.fam, repr(q.item))] += 1
                if t == term - 1:
                    prev.add((q.fam, repr(q.item)))
    seqs = {X_: strand_sequence(X_, version, term) for X_ in "ABCDE"}
    pools = Pools(version, term, prev, older)
    sigs = set()
    out = []
    for idx in range(30):
        week, sess = idx // 3 + 1, idx % 3 + 1
        qs = []
        for X_ in "ABCDE":
            fam = seqs[X_][idx]
            k = seqs[X_][:idx].count(fam)
            n = seqs[X_].count(fam)
            q, skip = None, set()
            for attempt in range(12):              # skip an item whose figure cannot be drawn cleanly,
                it = pools.draw(fam, k, n, skip)   # or that repeats a question already in the term
                text, figf, key, ans, fx = gen(fam, it)
                try:
                    cand = mk(text, figf, key, ans, fx)
                    if cand.figf:
                        cand.figf(cand.s * 0.81)   # it must also survive two shrink steps
                except AssertionError:
                    skip.add(repr(it))
                    continue
                if qsig(cand) in sigs:
                    skip.add(repr(it))
                    continue
                q = cand
                break
            assert q is not None, (version, term, idx, fam)
            q.fam, q.item = fam, it
            sigs.add(qsig(q))
            pools.keys[q.formula] = pools.keys.get(q.formula, 0) + 1
            qs.append(q)
        out.append(Session(term, week, sess, qs, given=given(version, term), version=version))
    for X_, seq in seqs.items():
        for fam, c in counts(X_, version, term).items():
            assert seq.count(fam) == c, (version, term, fam, seq.count(fam), c)
    _CACHE[(version, term)] = (out, seqs)
    return out, seqs


def selftest():
    """Every pool item generates, draws its figure at full size and after two shrink steps."""
    bad = []
    for fam, items in POOL.items():
        for it in items + EASY_ADD.get(fam, []):
            try:
                text, figf, key, ans, fx = gen(fam, it)
                q = mk(text, figf, key, ans, fx)
                if figf:
                    figf(q.s * 0.81)
            except Exception as e:      # noqa: BLE001
                bad.append((fam, it, f"{type(e).__name__}: {e}"))
    return bad


if __name__ == "__main__":
    b = selftest()
    print(f"{sum(len(v) for v in POOL.values())} pool items, {len(b)} problems")
    for x in b:
        print("  ", x)
