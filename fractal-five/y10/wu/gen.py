# -*- coding: utf-8 -*-
"""The Fractal Five, Year 10 - question generators and scheduler (all 30 sessions of each term).

Every session takes one question from each strand, rotating through the strand's families so
each one comes back every few sessions and never twice in a row:

  A right-angled triangles, similar figures   pyth_hyp pyth_short trig_ratio trig_top trig_bottom
                                                trig_angle similar
  B area, surface area, volume                 a_circle arc sector sa_rect sa_cyl v_prism v_cyl capacity
                                                (+ v_pyramid v_cone in Term 4)
  C percentages and money                       pct_change pct_original profit_pct interest wages salary
                                                commission holiday_pay
  D indices, formulas and rates                 idx zero_neg sci formula_sub ratio speed
  E straight-line graphs, data, probability     gradient linear mean prob prob_not freq

Level 1 (Terms 1-2): whole numbers, Pythagorean triples, tidy answers; the formula is printed.
Level 2 (Terms 3-4): the level-2 set (some decimals, answers to 1 decimal place or the nearest cent,
angles of elevation and depression) plus half of the level-1 set; formulas from memory, except the
Term 4 pyramid and cone questions, which print theirs (Q.show_formula).
Every answer is computed here from the same numbers that label the diagram; verify_answers.py
recomputes them independently from the printed question.
"""
import math
import random
import zlib
from decimal import Decimal
from fractions import Fraction

import wdia as D
from formulas import FX
from wu import Q, Session, display, dtable, frac, TIMES, DIV, MINUS, DEG

X = "<i>x</i>"
TH = "<i>θ</i>"
NB = " "          # no-break space: thousands separator for 5+ digit numbers (52 000)


# ------------------------------------------------------------------ helpers --
def grp(v):
    """Whole number with a space every three digits from 10 000 up (2000, 52 000, 3 600 000)."""
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
    """A value rounded to 1 dp (or to the nearest cent / degree by the caller's scaling) must not sit on a
    rounding boundary, so there is exactly one correct answer."""
    fr_ = abs(v * 10) % 1
    assert abs(fr_ - 0.5) > 0.03, (v, it)
    return v


def lines(text):
    import re
    return 1 if len(re.sub(r"<[^>]+>", "", text)) <= 42 else 2


def mk(text, figf, key, answer):
    fx, small = FX[key]
    s0 = 1.0 if lines(text) == 1 else 0.9
    fig = figf(s0) if figf else None
    q = Q(text, fig, key, answer, fx=fx, fx_small=small)
    q.figf, q.s = figf, s0
    return q


def static(html):
    return lambda s: html


def is_rev(it):
    """A 'working backwards' item (Year 9 families v_prism and speed): find a length or a time."""
    return isinstance(it, tuple) and len(it) > 0 and it[0] == "rev"


def is_elev(it):
    """An angle-of-elevation or angle-of-depression item (trig_top, trig_angle; Level 2 only)."""
    return isinstance(it, tuple) and len(it) > 0 and it[0] in ("elev", "dep")


# ------------------------------------------------------------ prism faces --
FACES = {
    "tri12": [(0, 0), (6, 0), (3, 4)], "tri18": [(0, 0), (6, 0), (2, 6)], "tri20": [(0, 0), (8, 0), (3, 5)],
    "rtri15": [(0, 0), (6, 0), (0, 5)], "trap15": [(0, 0), (6, 0), (5, 3), (1, 3)],
    "trap24": [(0, 0), (8, 0), (6, 4), (2, 4)], "para15": [(0, 0), (5, 0), (6.5, 3), (1.5, 3)],
    "house20": [(0, 0), (5, 0), (5, 3), (2.5, 5), (0, 3)],
}


def poly_area(P):
    return abs(sum(P[i][0] * P[(i + 1) % len(P)][1] - P[(i + 1) % len(P)][0] * P[i][1]
                   for i in range(len(P)))) / 2


FACE_AREA = {k: poly_area(v) for k, v in FACES.items()}
assert FACE_AREA == {"tri12": 12, "tri18": 18, "tri20": 20, "rtri15": 15, "trap15": 15, "trap24": 24,
                     "para15": 15, "house20": 20}, FACE_AREA


# ================================================================== pools ==
L1, L2 = {}, {}
# ---- A: right-angled triangles and similar figures ----
L1["pyth_hyp"] = [(12, 5, "cm", 0), (12, 9, "cm", 1), (15, 8, "cm", 2), (16, 12, "m", 3), (20, 15, "cm", 0),
                  (24, 7, "cm", 1), (24, 10, "m", 2), (21, 20, "cm", 3), (4, 3, "m", 1), (30, 16, "cm", 0)]
L2["pyth_hyp"] = [(9, 4, "cm", 0), (10, 6, "cm", 1), (8, 3, "m", 2), (11, 7, "cm", 3), (6, 2.5, "m", 0),
                  (6, 4.5, "cm", 1), (11, 9, "cm", 2), (8, 6.5, "m", 3), (13, 8, "cm", 0), (12, 5.5, "cm", 1)]
L1["pyth_short"] = [(10, 6, "cm", 0), (17, 15, "cm", 1), (25, 7, "cm", 2), (15, 9, "m", 3), (20, 12, "cm", 0),
                    (26, 10, "cm", 1), (5, 3, "m", 2), (29, 20, "cm", 3), (25, 15, "cm", 0), (13, 12, "cm", 1)]
L2["pyth_short"] = [(12, 7, "cm", 0), (15, 8, "cm", 1), (10, 4, "m", 2), (9, 5, "cm", 3), (14, 6, "cm", 0),
                    (11, 7, "m", 1), (20, 9, "cm", 2), (13, 6.5, "cm", 3), (8.5, 4, "cm", 0), (16, 11, "m", 1)]
# trig_ratio: (opposite, adjacent, hypotenuse, unit, ratio, orientation) - sides from the triples 3-4-5,
# 5-12-13, 8-15-17, 7-24-25; Level 2 puts theta at the other acute angle. Every trig triangle is drawn wide
# (longer leg horizontal; wdia.trig_fig), so a small theta sits at the sharp end and a large one at the top.
_TRIPLES = [(3, 4, 5), (5, 12, 13), (8, 15, 17), (7, 24, 25)]
_UNITS = ["cm", "cm", "m", "cm", "mm", "cm"]
L1["trig_ratio"], L2["trig_ratio"] = [], []
for _i, (_a, _b, _c) in enumerate(_TRIPLES):
    for _j, _r in enumerate(("sin", "cos", "tan")):
        _k = 3 * _i + _j
        _o, _ad = (_a, _b) if (_k % 2 == 0) else (_b, _a)
        _u = _UNITS[_k % len(_UNITS)]
        L1["trig_ratio"].append((_o, _ad, _c, _u, _r, _k % 4))
        L2["trig_ratio"].append((_ad, _o, _c, _u, _r, (_k + 1) % 4))
# trig_top: (known side's role, its length, theta, side to find, unit, orientation)
#   x = hyp sin(theta), hyp cos(theta) or adj tan(theta);  ("elev"/"dep", object, ground distance, theta, unit)
L1["trig_top"] = [("hyp", 12, 35, "opp", "cm", 0), ("hyp", 15, 50, "adj", "cm", 1),
                  ("adj", 8, 40, "opp", "m", 2), ("hyp", 20, 28, "opp", "cm", 3),
                  ("hyp", 10, 62, "adj", "cm", 1), ("adj", 14, 33, "opp", "cm", 0),
                  ("hyp", 18, 47, "adj", "m", 3), ("adj", 6, 55, "opp", "cm", 2),
                  ("hyp", 9, 41, "opp", "cm", 2), ("adj", 11, 26, "opp", "m", 1)]
L2["trig_top"] = [("hyp", 13.5, 38, "opp", "cm", 0), ("adj", 7.2, 52, "opp", "m", 3),
                  ("hyp", 16, 64, "adj", "cm", 2), ("hyp", 8.5, 29, "opp", "cm", 1),
                  ("adj", 19, 31, "opp", "cm", 0),
                  ("elev", "tree", 25, 34, "m", 1), ("elev", "tower", 60, 42, "m", 0),
                  ("dep", "cliff", 120, 28, "m", 1), ("dep", "tower", 45, 36, "m", 0)]
# trig_bottom: x = opp / sin(theta), adj / cos(theta) or opp / tan(theta)
L1["trig_bottom"] = [("opp", 7, 35, "hyp", "cm", 1), ("adj", 12, 40, "hyp", "cm", 0),
                     ("opp", 9, 52, "adj", "m", 3), ("opp", 15, 62, "hyp", "cm", 2),
                     ("adj", 8, 25, "hyp", "cm", 0), ("opp", 6, 31, "adj", "cm", 1),
                     ("adj", 18, 56, "hyp", "m", 2), ("opp", 11, 44, "adj", "cm", 3),
                     ("opp", 20, 48, "hyp", "cm", 3), ("adj", 5, 36, "hyp", "cm", 2)]
L2["trig_bottom"] = [("opp", 8.4, 41, "hyp", "cm", 1), ("adj", 13.5, 29, "hyp", "m", 2),
                     ("opp", 17, 58, "adj", "cm", 0), ("adj", 9.6, 61, "hyp", "cm", 3),
                     ("opp", 6.5, 33, "adj", "cm", 1), ("adj", 22, 45, "hyp", "m", 0)]
# trig_angle: (ratio, first side, second side, unit, orientation): sin O/H, cos A/H, tan O/A;
#   ("elev"/"dep", object, height, ground distance, unit, orientation)
L1["trig_angle"] = [("sin", 5, 9, "cm", 0), ("cos", 7, 10, "cm", 1), ("tan", 6, 8, "m", 2),
                    ("tan", 9, 4, "cm", 3), ("sin", 11, 15, "cm", 1), ("cos", 4, 13, "cm", 3),
                    ("tan", 3, 7, "m", 0), ("sin", 8, 19, "cm", 2), ("cos", 12, 17, "cm", 0),
                    ("tan", 15, 11, "cm", 2)]
L2["trig_angle"] = [("sin", 6.5, 11, "cm", 1), ("cos", 8, 13.5, "cm", 2), ("tan", 12, 7.5, "m", 3),
                    ("sin", 13, 16, "cm", 0), ("tan", 4.8, 9, "cm", 1),
                    ("elev", "tower", 45, 38, "m", 1), ("elev", "tree", 12, 20, "m", 0),
                    ("dep", "cliff", 80, 150, "m", 1), ("dep", "tower", 35, 60, "m", 0)]
# similar: (original length, original width, scale factor, unknown) - unknown: 'il'/'iw' on the image,
#   'ol'/'ow' on the original
L1["similar"] = [(4, 3, 2, "iw"), (5, 2, 3, "il"), (6, 4, 1.5, "iw"), (4, 2, 2.5, "il"), (3, 2, 3, "ow"),
                 (8, 6, 1.5, "il"), (6, 4, 2.5, "iw"), (7, 3, 2, "ol"), (10, 4, 1.5, "iw"), (5, 4, 2, "il")]
L2["similar"] = [(10, 6, 0.5, "ow"), (12, 8, 0.5, "il"), (7, 4, 2.5, "iw"), (5, 3, 1.5, "il"), (9, 6, 0.5, "iw"),
                 (6, 5, 3, "ol"), (4.5, 3, 2, "il"), (14, 10, 0.5, "ol")]

# ---- B: area, surface area and volume ----
L1["a_circle"] = [("r", 6, "cm"), ("r", 3, "m"), ("r", 5, "cm"), ("r", 10, "cm"), ("r", 7, "m"), ("r", 2, "cm"),
                  ("d", 8, "cm"), ("r", 9, "cm")]
L2["a_circle"] = [("r", 2.5, "cm"), ("r", 4.5, "m"), ("r", 8.5, "cm"), ("d", 12, "cm"), ("d", 9, "m"), ("d", 15, "cm")]
# arc and sector: (theta, radius, unit)
L1["arc"] = [(60, 6, "cm"), (90, 8, "cm"), (120, 6, "cm"), (180, 5, "m"), (270, 3, "cm"), (60, 12, "cm"),
             (90, 10, "m"), (120, 3, "cm"), (180, 7, "cm"), (270, 6, "m")]
L2["arc"] = [(45, 8, "cm"), (150, 6, "cm"), (240, 5.5, "m"), (60, 7.5, "cm"), (135, 5, "cm"), (120, 10.5, "cm"),
             (270, 9, "cm")]
L1["sector"] = [(60, 9, "cm"), (90, 6, "cm"), (120, 6, "m"), (180, 8, "cm"), (270, 5, "cm"), (60, 4, "cm"),
                (90, 12, "cm"), (120, 10, "cm"), (180, 3, "m"), (270, 8, "cm")]
L2["sector"] = [(45, 10, "cm"), (150, 7, "m"), (240, 3.5, "cm"), (240, 6, "cm"), (90, 7.5, "cm"), (40, 12, "cm"),
                (135, 6, "cm")]
L1["sa_rect"] = [(5, 4, 3, "cm"), (8, 2, 3, "cm"), (10, 5, 2, "m"), (4, 4, 4, "cm"), (7, 3, 2, "cm"), (6, 4, 2, "m"),
                 (9, 3, 3, "cm"), (5, 5, 2, "cm")]
L2["sa_rect"] = [(6, 2.5, 4, "cm"), (8, 4.5, 2, "m"), (5.5, 3, 2, "cm"), (10, 1.5, 6, "cm"), (7, 5, 2.5, "m"),
                 (12, 4, 1.5, "cm")]
# sa_cyl: (r, h, diameter labelled?, unit)
L1["sa_cyl"] = [(3, 10, False, "cm"), (5, 8, False, "cm"), (4, 6, True, "cm"), (2, 9, False, "m"), (6, 5, True, "cm"),
                (7, 3, False, "cm"), (10, 4, True, "cm"), (3, 3, False, "m")]
L2["sa_cyl"] = [(2.5, 8, False, "cm"), (4.5, 6, True, "cm"), (1.5, 12, False, "m"), (6, 2.5, False, "cm"),
                (3.5, 9.5, True, "cm"), (8, 4.5, False, "cm")]
L1["v_prism"] = [("tri20", 5, "cm"), ("trap24", 5, "cm"), ("house20", 6, "cm"), ("para15", 8, "cm"),
                 ("rtri15", 4, "m"), ("tri18", 7, "cm"), ("trap15", 10, "cm"), ("tri12", 9, "cm"), ("house20", 9, "m"),
                 ("rev", "tri12", 8, "cm"), ("rev", "trap15", 6, "cm"), ("rev", "house20", 7, "m")]
L2["v_prism"] = [("tri18", 4.5, "cm"), ("trap24", 2.5, "m"), ("house20", 3.5, "cm"), ("rtri15", 6.5, "cm"),
                 ("para15", 7, "m"), ("tri20", 5.5, "cm"), ("trap15", 8.5, "cm"),
                 ("rev", "tri18", 5.5, "cm"), ("rev", "para15", 4.5, "m")]
L1["v_cyl"] = [(2, 9, False, "cm"), (6, 4, False, "cm"), (4, 10, False, "m"), (5, 6, False, "cm"), (3, 7, True, "cm"),
               (5, 4, True, "cm"), (1.5, 8, True, "m"), (7, 5, False, "cm"), (2, 5, True, "cm")]
L2["v_cyl"] = [(2.5, 8, False, "cm"), (4.5, 6, False, "m"), (3.5, 10, False, "cm"), (4.5, 7, True, "cm"),
               (6.5, 3, False, "cm"), (2.5, 12, True, "m")]
# capacity: box l x w x h in cm; Level 1 always whole litres
L1["capacity"] = [(50, 30, 20), (40, 25, 20), (60, 40, 30), (80, 50, 40), (30, 20, 25), (100, 50, 40), (25, 20, 10),
                  (40, 30, 25), (50, 40, 30), (60, 30, 20)]
L2["capacity"] = [(35, 22, 18), (55, 24, 15), (32, 25, 15), (65, 35, 24), (28, 18, 15), (120, 45, 35), (42, 26, 18)]
# Term 4 only (Level 2 pool + half of Level 1): whole numbers
L1["v_pyramid"] = [(6, 6, 10, "cm"), (9, 8, 5, "cm"), (12, 12, 7, "cm"), (10, 6, 8, "m"), (8, 8, 9, "cm"),
                   (15, 10, 6, "cm")]
L2["v_pyramid"] = [(12, 9, 8, "cm"), (10, 10, 12, "cm"), (7, 6, 5, "m"), (9, 9, 10, "cm")]
L1["v_cone"] = [(3, 4, False, "cm"), (6, 8, False, "cm"), (5, 12, True, "cm"), (4, 9, False, "m"),
                (10, 6, True, "cm"), (2, 6, False, "cm")]
L2["v_cone"] = [(7, 10, False, "cm"), (3, 5, True, "cm"), (5, 9, False, "m"), (8, 15, True, "cm")]

# ---- C: percentages and money ----
# pct_change: (inc/dec, amount, percentage, context)
L1["pct_change"] = [("dec", 120, 25, "sale"), ("inc", 80, 15, "plain$"), ("inc", 60, 10, "price"),
                    ("dec", 250, 20, "plainkg"), ("inc", 2400, 5, "pop"), ("dec", 45, 20, "sale"),
                    ("inc", 900, 4, "wage"), ("dec", 70, 10, "plain$"), ("dec", 400, 15, "sale"),
                    ("inc", 150, 30, "price")]
L2["pct_change"] = [("inc", 64.5, 12, "price"), ("dec", 89.95, 20, "sale"), ("inc", 45.5, 10, "gst"),
                    ("dec", 1250, 7.5, "plain$"), ("inc", 36.8, 15, "plainkg"), ("dec", 59.99, 35, "sale"),
                    ("inc", 3840, 2.5, "pop")]
# pct_original: ("disc", sale price, discount %, item) | ("inc", new amount, increase %, noun) | ("part", part, %)
L1["pct_original"] = [("disc", 48, 20, "shirt"), ("inc", 440, 10, "rent"), ("part", 45, 15),
                      ("disc", 90, 25, "pair of shoes"), ("inc", 252, 5, "price"), ("part", 18, 30),
                      ("disc", 56, 30, "backpack"), ("inc", 1380, 15, "wage"), ("part", 36, 40),
                      ("disc", 64, 20, "jacket")]
L2["pct_original"] = [("disc", 70, 12.5, "jacket"), ("inc", 535, 7, "rent"), ("part", 24.5, 35),
                      ("disc", 47.6, 15, "helmet"), ("inc", 81.9, 5, "price"), ("disc", 33.15, 35, "cap"),
                      ("part", 9.6, 12)]
# profit_pct: (cost price, selling price) - whole-number percentages, some losses
L1["profit_pct"] = [(40, 50), (60, 78), (50, 60), (200, 260), (75, 60), (80, 68), (30, 45), (250, 300), (120, 90),
                    (160, 200)]
L2["profit_pct"] = [(12.5, 15), (24.8, 31), (45, 36), (2.5, 3.1), (850, 1020), (125, 115), (36.4, 45.5)]
# interest: (amount, rate % per year, years as Fraction, time as printed, invested or borrowed)
L1["interest"] = [(2000, 4, 3, "3 years", "inv"), (5000, 3, 2, "2 years", "inv"), (1500, 6, 4, "4 years", "inv"),
                  (800, 5, 3, "3 years", "inv"), (12000, 2, 5, "5 years", "inv"), (4000, 8, 2, "2 years", "loan"),
                  (2500, 4, 2, "2 years", "inv"), (3000, 7, 3, "3 years", "loan"), (600, 5, 2, "2 years", "inv")]
L2["interest"] = [(2000, 3.5, Fraction(5, 2), "2½ years", "inv"), (6000, 4, Fraction(3, 2), "18 months", "loan"),
                  (4500, 5, Fraction(1, 2), "6 months", "inv"), (1200, 4.5, 3, "3 years", "inv"),
                  (8000, 6, Fraction(3, 4), "9 months", "loan"), (3500, 2.8, Fraction(9, 2), "4½ years", "inv"),
                  (15000, 5.5, 2, "2 years", "inv")]
# wages: (name, hourly rate, normal hours, overtime hours, overtime kind: None, 't15' or 'dt')
L1["wages"] = [("Ava", 25, 30, 0, None), ("Noah", 22, 20, 0, None), ("Mia", 30, 15, 0, None), ("Leo", 28, 35, 0, None),
               ("Liam", 24, 38, 4, "t15"), ("Zara", 30, 35, 3, "dt"), ("Kai", 26, 38, 6, "t15"), ("Ruby", 32, 30, 2, "dt"),
               ("Jack", 28, 36, 5, "t15"), ("Priya", 20, 38, 4, "dt")]
L2["wages"] = [("Ella", 25.5, 38, 4, "t15"), ("Tom", 31.4, 35, 6, "dt"), ("Aisha", 27.8, 32, 3, "t15"),
               ("Hamish", 23.6, 38, 0, None), ("Sienna", 29.9, 36, 3, "t15"), ("Arjun", 26.75, 30, 4, "dt")]
# salary: (name, yearly salary, 'w' weekly or 'f' fortnightly)
L1["salary"] = [("Liam", 62400, "w"), ("Ava", 52000, "f"), ("Mia", 78000, "w"), ("Noah", 57200, "f"),
                ("Zara", 67600, "w"), ("Kai", 83200, "f"), ("Ruby", 91000, "w"), ("Jack", 54600, "f")]
L2["salary"] = [("Ella", 68500, "w"), ("Tom", 74250, "f"), ("Aisha", 82750, "w"), ("Leo", 95300, "f"),
                ("Priya", 61250, "w"), ("Hamish", 58900, "f")]
# commission: (name, rate %, sales) | ("base", name, weekly base wage, rate %, sales)  (base: Level 2)
L1["commission"] = [("Zara", 5, 8000), ("Ethan", 2, 650000), ("Grace", 10, 4500), ("Arjun", 3, 120000),
                    ("Chloe", 4, 25000), ("Mason", 15, 2400), ("Isla", 6, 9500), ("Kai", 2, 480000)]
L2["commission"] = [("base", "Noah", 450, 3, 12500), ("base", "Ruby", 380, 5, 7860), ("base", "Leo", 520, 2.5, 18400),
                    ("base", "Mia", 600, 4, 9375), ("Tom", 2.5, 685000), ("Ava", 1.8, 540000)]
# holiday_pay: (name, weekly pay)
L1["holiday_pay"] = [("Jo", 1200), ("Sam", 950), ("Ali", 1100), ("Bella", 800), ("Finn", 1350), ("Tara", 1040),
                     ("Omar", 1500), ("Lucy", 870)]
L2["holiday_pay"] = [("Eva", 1145), ("Ben", 985), ("Nina", 1263.5), ("Raj", 1427), ("Ivy", 1098.4)]

# ---- D: indices, formulas and rates ----
# idx: ("mult"/"div", coefficient 1, base, m, coefficient 2, n) | ("pow", coefficient, base, m, n); coefficient 1 = none
L1["idx"] = [("mult", 1, 2, 3, 1, 4), ("div", 1, 3, 8, 1, 2), ("pow", 1, 5, 2, 3), ("mult", 1, "x", 5, 1, 3),
             ("div", 1, "y", 9, 1, 4), ("pow", 1, "m", 4, 2), ("mult", 3, "x", 4, 2, 3), ("div", 12, "a", 5, 4, 2),
             ("pow", 2, "k", 3, 2), ("mult", 5, "p", 2, 3, 6), ("div", 20, "n", 7, 5, 3), ("mult", 4, "a", 3, 1, 5)]
L2["idx"] = [("mult", 4, "x", 5, 5, 1), ("div", 15, "m", 8, 5, 3), ("pow", 3, "a", 2, 3), ("div", 18, "y", 6, 6, 1),
             ("mult", 2, "a", 3, 7, 4), ("pow", 5, "x", 4, 2), ("div", 24, "p", 9, 8, 4)]
# zero_neg: ("neg", b, n) b^-n | ("zplus", b, k) b^0 + k | ("zsum", b, c) b^0 + c^0 | ("zero", b) b^0 |
#   ("zcoef", k, p) k p^0 | ("zbr", k, p) (k p)^0 | ("posnum", b, n) write b^-n with a positive index |
#   ("negcoef", k, b, n) k x b^-n | ("negsum", b) b^-1 + b^0
# Negative indices use numerical bases only (MA5-IND-C-01); pronumerals appear only with the zero index.
L1["zero_neg"] = [("neg", 2, 3), ("zplus", 7, 3), ("posnum", 5, 2), ("neg", 10, 2), ("zero", 9), ("neg", 5, 1),
                  ("zcoef", 6, "a"), ("neg", 3, 2), ("posnum", 3, 4), ("zsum", 5, 2)]
L2["zero_neg"] = [("negcoef", 3, 2, 2), ("neg", 4, 2), ("negsum", 2), ("zbr", 5, "y"), ("neg", 10, 3),
                  ("posnum", 7, 3), ("negcoef", 5, 10, 2)]
# sci: ("to_sci", number as text) | ("to_num", a as text, power)
L1["sci"] = [("to_sci", "45000"), ("to_sci", "3600000"), ("to_sci", "820"), ("to_sci", "7000"), ("to_sci", "150000"),
             ("to_num", "3.2", 4), ("to_num", "5", 3), ("to_num", "6.1", 5), ("to_num", "2.75", 6), ("to_num", "9.4", 2)]
L2["sci"] = [("to_sci", "0.0062"), ("to_sci", "0.00045"), ("to_num", "7.5", -4), ("to_num", "3.08", -2),
             ("to_sci", "28500000"), ("to_sci", "0.9"), ("to_num", "1.6", -5)]
# formula_sub: (formula key, pronumeral to find, {the others' values in the order printed})
L1["formula_sub"] = [("fs_v", "v", {"u": 5, "a": 3, "t": 4}), ("fs_v", "t", {"v": 26, "u": 6, "a": 4}),
                     ("fs_P", "P", {"l": 8, "w": 5}), ("fs_P", "w", {"P": 30, "l": 9}),
                     ("fs_C", "C", {"d": 10}), ("fs_C", "d", {"C": 29}),
                     ("fs_F", "F", {"C": 25}), ("fs_F", "C", {"F": 50}),
                     ("fs_A", "h", {"A": 24, "b": 8}), ("fs_A", "h", {"A": 35, "b": 10}),
                     ("fs_y", "x", {"y": 17, "m": 3, "c": 2}), ("fs_v", "a", {"v": 30, "u": 10, "t": 5})]
L2["formula_sub"] = [("fs_v", "v", {"u": 2.5, "a": 1.5, "t": 6}), ("fs_v", "t", {"v": 20, "u": 4, "a": 2.5}),
                     ("fs_P", "l", {"P": 37, "w": 6.5}), ("fs_C", "d", {"C": 17}), ("fs_F", "C", {"F": 95}),
                     ("fs_F", "F", {"C": -5}), ("fs_A", "h", {"A": 27, "b": 12}), ("fs_y", "x", {"y": -7, "m": 2, "c": 5}),
                     ("fs_y", "x", {"y": 11, "m": 4, "c": -3})]
# ratio: (amount, parts, what is shared: '$' or a plural noun)
L1["ratio"] = [(120, (3, 5), "$"), (84, (4, 3), "lollies"), (200, (1, 4), "$"), (90, (2, 7), "$"), (150, (2, 3), "$"),
               (72, (5, 1), "stickers"), (360, (7, 5), "$"), (48, (3, 5), "marbles"), (500, (3, 2), "$")]
L2["ratio"] = [(250, (3, 5), "$"), (360, (2, 3, 4), "$"), (95, (3, 2), "$"), (100, (3, 5), "$"),
               (630, (2, 3, 4), "$"), (2.4, (1, 2), "kg")]
L1["speed"] = [(180, "km", 2, "hours", "car", "km/h"), (360, "km", 4, "hours", "train", "km/h"),
               (210, "km", 3, "hours", "bus", "km/h"), (100, "m", 20, "seconds", "runner", "m/s"),
               (60, "km", 3, "hours", "cyclist", "km/h"), (1500, "km", 2, "hours", "plane", "km/h"),
               (12, "km", 3, "hours", "walker", "km/h"), (320, "km", 4, "hours", "car", "km/h"),
               ("rev", 240, "km", 3, "hours", "car", "km/h", "d"), ("rev", 300, "km", 5, "hours", "train", "km/h", "t"),
               ("rev", 200, "m", 25, "seconds", "runner", "m/s", "t")]
L2["speed"] = [(135, "km", 1.5, "hours", "car", "km/h"), (18, "km", 45, "minutes", "cyclist", "km/h"),
               (400, "m", 50, "seconds", "runner", "m/s"), (325, "km", 2.5, "hours", "train", "km/h"),
               (7.5, "km", 30, "minutes", "cyclist", "km/h"), (90, "km", 45, "minutes", "car", "km/h"),
               (1200, "m", 150, "seconds", "runner", "m/s"),
               ("rev", 157.5, "km", 2.5, "hours", "car", "km/h", "d"), ("rev", 270, "km", 4.5, "hours", "train", "km/h", "t")]

# ---- E: straight-line graphs, data and probability ----
L1["gradient"] = [((0, 1), (2, 5)), ((1, 1), (3, 5)), ((1, 2), (3, 4)), ((0, 1), (1, 4)), ((1, 1), (2, 4)),
                  ((0, 2), (1, 5)), ((2, 1), (3, 4)), ((0, 1), (3, 4))]
L2["gradient"] = [((0, 4), (4, 2)), ((1, 5), (3, 1)), ((0, 1), (4, 3)), ((0, 5), (1, 2)), ((1, 1), (3, 4)),
                  ((0, 4), (3, 1)), ((0, 2), (4, 5))]
# linear: (m, c, x) find y | ("gi", m, c, order) state the gradient and y-intercept
L1["linear"] = [(3, 1, 4), (2, 5, 3), (4, -1, 2), (5, 2, 1), (2, -3, 5), (3, 4, 0), (6, 1, 2), (10, -4, 1),
                ("gi", 3, -2, "mc"), ("gi", 2, 5, "mc"), ("gi", -4, 1, "mc")]
L2["linear"] = [(-2, 10, 3), (0.5, 4, 6), (-3, 2, -1), (4, -7, 2.5), (-1, 6, -4), (1.5, -2, 4),
                ("gi", -2, 7, "mc"), ("gi", 0.5, -3, "mc"), ("gi", -2, 6, "cm")]
# mean: (values, row heading, noun) | ("ft", scores, frequencies)
L1["mean"] = [((8, 3, 5, 6, 8), "Scores", "scores"), ((21, 18, 24, 15, 22), "Scores", "scores"),
              ((7, 9, 4, 10, 5), "Goals", "goal tallies"), ((14, 11, 17, 12, 16), "Marks", "marks"),
              ((30, 25, 35, 20, 40), "Scores", "scores"), ((6, 2, 9, 4, 9), "Goals", "goal tallies"),
              ("ft", (1, 2, 3, 4, 5), (1, 1, 2, 4, 7)), ("ft", (0, 1, 2, 3, 4), (2, 5, 3, 1, 4)),
              ("ft", (2, 3, 4, 5, 6), (4, 7, 2, 1, 7)), ("ft", (5, 6, 7, 8, 9), (4, 5, 5, 1, 6))]
L2["mean"] = [((2.4, 3.1, 2.8, 3.5, 3.2), "Metres", "lengths"), ((8, 11, 7, 14, 10), "Scores", "scores"),
              ((65, 72, 58, 80, 70), "Marks", "marks"), ((9.5, 8, 10.5, 12, 7), "kg", "masses"),
              ("ft", (1, 2, 3, 4, 5), (3, 6, 8, 5, 2)), ("ft", (2, 3, 4, 5, 6), (2, 5, 9, 6, 3)),
              ("ft", (5, 6, 7, 8, 9), (3, 4, 6, 5, 4)), ("ft", (10, 11, 12, 13, 14), (2, 6, 4, 5, 1))]
L1["prob"] = [("bag", [("Red", 4), ("Blue", 2), ("Green", 6)], "green"),
              ("bag", [("Red", 2), ("Yellow", 3), ("Blue", 5)], "red"),
              ("bag", [("Red", 5), ("White", 3)], "white"), ("bag", [("Blue", 6), ("Green", 4), ("Red", 2)], "blue"),
              ("die", "an even number", 3), ("die", "a 5", 1), ("die", "a number less than 3", 2),
              ("die", "a multiple of 3", 2), ("bag", [("Black", 7), ("White", 3)], "black")]
L2["prob"] = [("word", "BANANA", "A"), ("word", "MATHEMATICS", "M"), ("word", "PROBABILITY", "B"),
              ("word", "SUCCESS", "S"), ("die", "a prime number", 3), ("die", "a number greater than 1", 5),
              ("bag", [("Red", 3), ("Blue", 4), ("Green", 5)], "green")]
L1["prob_not"] = [("rain", "0.4", "it does not rain"), ("late", "0.15", "the bus is not late"),
                  ("goal", "2/5", "a goal is not scored"), ("six", "1/6", "a six is not rolled"),
                  ("win", "0.35", "the team does not win"), ("snow", "0.08", "it does not snow"),
                  ("red", "1/4", "the counter is not red")]
L2["prob_not"] = [("pass", "0.82", "the student does not pass"), ("red", "5/12", "the counter is not red"),
                  ("delay", "0.125", "the flight is not delayed"), ("hit", "7/9", "the target is not hit"),
                  ("blue", "0.36", "the marble is not blue"), ("win", "0.47", "the player does not win")]
# freq: ("die", rolls, event, favourable faces) | ("coin", tosses) | ("p", event, probability, trials, unit) expected;
#   ("rel", count, trials, what) | ("tab", [(colour, count)], colour) relative frequency
L1["freq"] = [("die", 300, "a 4", 1), ("die", 120, "an even number", 3), ("coin", 50), ("p", "late", "0.2", 40),
              ("rel", 42, 100, "heads"), ("tab", [("Red", 12), ("Blue", 18), ("Green", 20)], "blue"),
              ("rel", 15, 60, "sixes"), ("die", 600, "a number greater than 4", 2), ("rel", 27, 90, "heads")]
L2["freq"] = [("p", "rain", "0.15", 60), ("p", "late", "0.35", 400), ("rel", 7, 40, "heads"),
              ("tab", [("Red", 14), ("Blue", 26), ("Green", 10)], "red"), ("rel", 33, 150, "sixes"),
              ("die", 450, "a 1 or a 2", 2), ("tab", [("Red", 23), ("Blue", 41), ("Green", 36)], "green")]


# ================================================ generators reused from Year 9 ==
def g_pyth_hyp(it):
    a, b, u, o = it
    c = math.hypot(a, b)
    if abs(c * 10 - round(c * 10)) < 1e-9:
        txt, ans = "Find the length of the hypotenuse, <i>c</i>.", lab(round(c, 1), u)
    else:
        txt, ans = "Find <i>c</i>, correct to 1 decimal place.", f"{d1(c)} {u}"
    return txt, (lambda s: D.rt_tri(a, b, legs=(lab(a, u), lab(b, u)), hyp="<i>c</i>", unknown=1, orient=o,
                                    H=int(124 * s))), "pyth_hyp", ans


def g_pyth_short(it):
    h, g, u, o = it
    x = math.sqrt(h * h - g * g)
    exact = abs(x * 10 - round(x * 10)) < 1e-9
    txt = f"Find the value of {X}." if exact else f"Find {X}, correct to 1 decimal place."
    ans = lab(round(x, 1), u) if exact else f"{d1(x)} {u}"
    if x >= g:
        f_ = lambda s: D.rt_tri(x, g, legs=(X, lab(g, u)), hyp=lab(h, u), unknown=0, orient=o, H=int(124 * s))
    else:
        f_ = lambda s: D.rt_tri(g, x, legs=(lab(g, u), X), hyp=lab(h, u), unknown=2, orient=o, H=int(124 * s))
    return txt, f_, "pyth_short", ans


def g_a_circle(it):
    kind, v, u = it
    r = v / 2 if kind == "d" else v
    f_ = (lambda s: D.circle_d(lab(v, u), R=int(42 * s + 4), H=int(100 * s + 8))) if kind == "d" else \
         (lambda s: D.circle_r(lab(v, u), R=int(42 * s + 4), H=int(100 * s + 8)))
    return ("Find the area of this circle, correct to 1 decimal place.", f_, "a_circle",
            f"{d1(math.pi * r * r)} {u}\u00b2")


def g_v_prism(it):
    if is_rev(it):              # face area and volume given, find the length: x = V / A
        _, face, L, u = it
        A = FACE_AREA[face]
        V = A * L
        k = min(0.8, 5.5 / L)
        return (f"The shaded face has an area of {nf(A)} {u}\u00b2 and the volume is {nf(V)} {u}\u00b3. Find {X}.",
                (lambda s: D.prism_area(FACES[face], L, "", X, k=k, ang=20, H=int(112 * s / 0.9))),
                "v_prism", lab(V / A, u))
    face, L, u = it
    A = FACE_AREA[face]
    k = min(0.8, 5.5 / L)
    return (f"The shaded face has an area of {nf(A)} {u}\u00b2. Find the volume of the prism.",
            (lambda s: D.prism_area(FACES[face], L, "", lab(L, u), k=k, ang=20, H=int(112 * s / 0.9))),
            "v_prism", f"{nf(A * L)} {u}\u00b3")


def g_v_cyl(it):
    r, h, dia, u = it
    rl = lab(2 * r, u) if dia else lab(r, u)
    return ("Find the volume of this cylinder, correct to 1 decimal place.",
            (lambda s: D.cylinder(r, h, rl, lab(h, u), dia=dia, H=int(112 * s / 0.9))),
            "v_cyl", f"{d1(math.pi * r * r * h)} {u}\u00b3")


def g_sa_rect(it):
    l, w, h, u = it
    return ("Find the surface area of this prism.",
            (lambda s: D.box(l, w, h, (lab(l, u), lab(w, u), lab(h, u)), H=int(124 * s))),
            "sa_rect", f"{nf(2 * (l * w + l * h + w * h))} {u}\u00b2")


def g_speed(it):
    if is_rev(it):              # speed given, find the distance (d = s x t) or the time (t = d / s)
        _, d, du, t, tu, who, ou, unk = it
        v = d / t
        txt = f"A {who} travels from A to B at an average speed of {nf(v)} {ou}. Find {X}."
        if unk == "d":
            return txt, (lambda s: D.journey(X, f"{nf(t)} {tu}")), "speed", lab(v * t, du)
        return txt, (lambda s: D.journey(lab(d, du), X)), "speed", f"{nf(d / v)} {tu}"
    d, du, t, tu, who, ou = it
    hours = t / 60 if tu == "minutes" else t
    v = d / hours if ou == "km/h" else d / t
    txt = f"A {who} travels from A to B. Find the average speed" + (" in km/h." if tu == "minutes" else ".")
    return txt, (lambda s: D.journey(lab(d, du), f"{nf(t)} {tu}")), "speed", f"{nf(v)} {ou}"


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
        ev, fav = it[1], it[2]
        return (f"A fair die is rolled. Find the probability of rolling {ev}.",
                (lambda s: D.dice_row()), "prob", fstr(Fraction(fav, 6)))
    word, letter = it[1], it[2]
    disp = display(f'<span style="letter-spacing:0.28em">{word}</span>')
    return (f"A letter is chosen at random from this word. Find <i>P</i>({letter}).", static(disp), "prob",
            fstr(Fraction(word.count(letter), len(word))))


def _pdisp(p):
    if "/" in p:
        n, d = p.split("/")
        return frac(n, d), 1 - Fraction(int(n), int(d))
    return p, None


def g_prob_not(it):
    ev, p, text = it
    shown, fr_ = _pdisp(p)
    ans = fstr(fr_) if fr_ is not None else nf(round(1 - float(p), 6))
    return (f"Find the probability that {text}.", static(display(f"<i>P</i>({ev}) = {shown}")), "prob_not", ans)


def g_gradient(it):
    p1, p2 = it
    m = Fraction(p2[1] - p1[1], p2[0] - p1[0])
    return ("Find the gradient of line AB.", (lambda s: D.plane_line(p1, p2, u=17 * s / 0.9 if s < 0.9 else 17, clear=True)),
            "gradient", fstr(m))


def g_pct_incdec(it):
    """Increase or decrease by a percentage: new = original x (100% +/- change)."""
    d, amt, p, ctx = it
    new = amt * ((100 + p) if d == "inc" else (100 - p)) / 100
    word = "Increase" if d == "inc" else "Decrease"
    P = f"{nf(p)}%"
    fig = None
    if ctx == "sale":
        txt, rows = "Find the sale price.", [["Original price", money(amt)], ["Discount", P]]
    elif ctx == "price":
        txt, rows = "Find the new price.", [["Original price", money(amt)], [word, P]]
    elif ctx == "wage":
        txt, rows = "Find the new weekly wage.", [["Weekly wage", money(amt)], ["Pay rise", P]]
    elif ctx == "gst":
        txt, rows = "Find the price including GST.", [["Price before GST", money(amt)], ["GST", P]]
    elif ctx == "pop":
        txt, rows = "Find the new population of the town.", [["Population", grp(amt)], [word, P]]
    elif ctx == "plain$":
        txt, fig = "Find the new amount.", display(f"{word} {money(amt)} by {P}")
    else:
        txt, fig = "Find the new mass.", display(f"{word} {nf(amt)} kg by {P}")
    if fig is None:
        fig = dtable(rows)
    if ctx == "pop":
        assert abs(new - round(new)) < 1e-9, it
        ans = grp(new)
    elif ctx == "plainkg":
        ans = f"{nf(round(new, 3))} kg"
    else:
        if abs(new * 100 - round(new * 100)) > 1e-6:
            txt = txt[:-1] + ", to the nearest cent."
        ans = money(round(new + 1e-9, 2))
    return txt, static(fig), "pct_inc" if d == "inc" else "pct_dec", ans


def g_pct_orig(it):
    """Original amount = known amount / its percentage x 100."""
    kind = it[0]
    if kind == "disc":
        _, known, p, thing = it
        its = 100 - p
        txt, fig = f"Find the original price of the {thing}.", dtable([["Discount", f"{nf(p)}%"], ["Sale price", money(known)]])
    elif kind == "inc":
        _, known, p, noun = it
        its = 100 + p
        txt = f"Find the {noun} before the increase."
        fig = dtable([["Increase", f"{nf(p)}%"], [f"New {noun}", money(known)]])
    else:
        _, known, p = it
        its = p
        txt, fig = "Find the number.", display(f"{nf(p)}% of a number is {nf(known)}")
    orig = known / its * 100
    assert abs(orig * 100 - round(orig * 100)) < 1e-6, it              # tidy: whole cents at most
    return txt, static(fig), "pct_orig", (nf(round(orig, 2)) if kind == "part" else money(round(orig, 2)))


def g_sa_cyl(it):
    r, h, dia, u = it
    SA = 2 * math.pi * r * r + 2 * math.pi * r * h
    rl = lab(2 * r, u) if dia else lab(r, u)
    return ("Find the surface area of this closed cylinder, correct to 1 decimal place.",
            (lambda s: D.cylinder(r, h, rl, lab(h, u), dia=dia, H=int(112 * s / 0.9))),
            "sa_cyl", f"{d1(SA)} {u}\u00b2")


# ============================================================ new generators ==
ROLE = {"opp": "opposite", "adj": "adjacent", "hyp": "hypotenuse"}


def _sides(o, a):
    return o, a, math.hypot(o, a)


def g_trig_ratio(it):
    """Write sin/cos/tan theta as a fraction from a Pythagorean-triple triangle (all sides labelled)."""
    O, A, H, u, r, orient = it
    assert O * O + A * A == H * H, it
    ang = math.degrees(math.atan2(O, A))
    num, den = {"sin": (O, H), "cos": (A, H), "tan": (O, A)}[r]
    labs = {"opp": lab(O, u), "adj": lab(A, u), "hyp": lab(H, u)}
    return (f"Write {r} {TH} as a fraction.", (lambda s: D.trig_fig(ang, orient, labs, TH, H=int(124 * s))),
            "trig", fstr(Fraction(num, den)))


def g_trig_top(it):
    """x = side x sin/cos/tan theta (the side to find is on top of the ratio)."""
    if is_elev(it):
        kind, obj, d, th, u, orient = it
        x = safe1(d * math.tan(math.radians(th)), it)
        word = "elevation" if kind == "elev" else "depression"
        labs = {"opp": X, "adj": lab(d, u)}
        return (f"The angle of {word} is {th}{DEG}. Find {X}, correct to 1 decimal place.",
                (lambda s: D.elev_fig(kind, obj, th, labs, f"{th}{DEG}", unknown_side="opp", orient=orient,
                                      H=int(118 * s))), "trig", f"{d1(x)} {u}")
    known, v, th, find, u, orient = it
    t = math.radians(th)
    x = {("hyp", "opp"): v * math.sin(t), ("hyp", "adj"): v * math.cos(t), ("adj", "opp"): v * math.tan(t)}[(known, find)]
    safe1(x, it)
    labs = {known: lab(v, u), find: X}
    return (f"Find {X}, correct to 1 decimal place.",
            (lambda s: D.trig_fig(th, orient, labs, f"{th}{DEG}", unknown_side=find, H=int(124 * s))),
            "trig", f"{d1(x)} {u}")


def g_trig_bottom(it):
    """x = side / sin/cos/tan theta (the side to find is on the bottom of the ratio)."""
    known, v, th, find, u, orient = it
    t = math.radians(th)
    x = {("opp", "hyp"): v / math.sin(t), ("adj", "hyp"): v / math.cos(t), ("opp", "adj"): v / math.tan(t)}[(known, find)]
    safe1(x, it)
    labs = {known: lab(v, u), find: X}
    return (f"Find {X}, correct to 1 decimal place.",
            (lambda s: D.trig_fig(th, orient, labs, f"{th}{DEG}", unknown_side=find, H=int(124 * s))),
            "trig", f"{d1(x)} {u}")


def g_trig_angle(it):
    """theta = inverse sin/cos/tan of a ratio of two labelled whole-number sides."""
    if is_elev(it):
        kind, obj, h, d, u, orient = it
        th = math.degrees(math.atan2(h, d))
        assert abs(th % 1 - 0.5) > 0.05, it
        word = "elevation" if kind == "elev" else "depression"
        labs = {"opp": lab(h, u), "adj": lab(d, u)}
        return (f"Find the angle of {word}, {TH}, correct to the nearest degree.",
                (lambda s: D.elev_fig(kind, obj, th, labs, TH, theta_unknown=True, orient=orient, H=int(118 * s))),
                "trig_inv", f"{round(th)}{DEG}")
    r, p, q, u, orient = it
    if r == "sin":
        th, labs = math.degrees(math.asin(p / q)), {"opp": lab(p, u), "hyp": lab(q, u)}
    elif r == "cos":
        th, labs = math.degrees(math.acos(p / q)), {"adj": lab(p, u), "hyp": lab(q, u)}
    else:
        th, labs = math.degrees(math.atan2(p, q)), {"opp": lab(p, u), "adj": lab(q, u)}
    assert abs(th % 1 - 0.5) > 0.05 and 15 < th < 75, (it, th)
    return (f"Find {TH}, correct to the nearest degree.",
            (lambda s: D.trig_fig(th, orient, labs, TH, theta_unknown=True, H=int(124 * s))),
            "trig_inv", f"{round(th)}{DEG}")


def g_similar(it):
    """Similar rectangles: find the scale factor from one pair of matching sides, then x."""
    ol, ow, k, unk = it
    il, iw = ol * k, ow * k
    vals = {"ol": ol, "ow": ow, "il": il, "iw": iw}
    u = "cm"
    labs = {key: (X if key == unk else lab(v, u)) for key, v in vals.items()}
    # the pair with no x gives the scale factor; x = matching side x k (image) or / k (original)
    pair = ("ow", "iw") if unk in ("ol", "il") else ("ol", "il")
    kk = vals[pair[1]] / vals[pair[0]]
    mate = {"ol": "il", "il": "ol", "ow": "iw", "iw": "ow"}[unk]
    x = vals[mate] * kk if unk[0] == "i" else vals[mate] / kk
    assert abs(x - vals[unk]) < 1e-9, it
    return (f"These rectangles are similar. Find {X}.",
            (lambda s: D.similar_rects2((ol, ow), (il, iw), ((labs["ol"], labs["ow"]), (labs["il"], labs["iw"])),
                                        H=int(112 * s / 0.9))), "similar", lab(x, u))


def g_arc(it):
    th, r, u = it
    L = safe1(th / 360 * 2 * math.pi * r, it)
    return ("Find the arc length, correct to 1 decimal place.",
            (lambda s: D.sector(th, lab(r, u), H=int(112 * s / 0.9), hi_arc=True)), "arc", f"{d1(L)} {u}")


def g_sector(it):
    th, r, u = it
    A = safe1(th / 360 * math.pi * r * r, it)
    return ("Find the area of this sector, correct to 1 decimal place.",
            (lambda s: D.sector(th, lab(r, u), H=int(112 * s / 0.9))), "sector", f"{d1(A)} {u}²")


def g_capacity(it):
    """Capacity of a box-shaped tank in litres: V = lwh in cm^3, then 1000 cm^3 = 1 L."""
    l, w, h = it
    V = l * w * h
    cap = V / 1000
    exact = abs(cap * 100 - round(cap * 100)) < 1e-6 and abs(cap * 10 - round(cap * 10)) < 1e-6
    if exact:
        txt, ans = "How many litres does this tank hold?", f"{nf(round(cap, 1))} L"
    else:
        safe1(cap, it)
        txt, ans = "How many litres does this tank hold, correct to 1 decimal place?", f"{d1(cap)} L"
    return (txt, (lambda s: D.box(l, w, h, (lab(l, "cm"), lab(w, "cm"), lab(h, "cm")), H=int(124 * s))),
            "capacity", ans)


def g_v_pyramid(it):
    l, w, h, u = it
    V = l * w * h / 3
    assert V == int(V), it
    return ("Find the volume of this pyramid.",
            (lambda s: D.pyramid(l, w, h, (lab(l, u), lab(w, u), lab(h, u)), H=int(124 * s))),
            "v_pyramid", f"{nf(V)} {u}³")


def g_v_cone(it):
    r, h, dia, u = it
    V = safe1(math.pi * r * r * h / 3, it)
    rl = lab(2 * r, u) if dia else lab(r, u)
    return ("Find the volume of this cone, correct to 1 decimal place.",
            (lambda s: D.cone(r, h, rl, lab(h, u), dia=dia, H=int(118 * s / 0.9))),
            "v_cone", f"{d1(V)} {u}³")


# ---- C: percentages and money ----
def g_profit_pct(it):
    c, s_ = it
    p = (s_ - c) / c * 100
    assert abs(p - round(p)) < 1e-9, it                     # whole-number percentages
    word = "profit" if p > 0 else "loss"
    return (f"Find the percentage {word}.", static(dtable([["Cost price", money(c)], ["Selling price", money(s_)]])),
            "profit_pct" if p > 0 else "loss_pct", f"{nf(abs(round(p)))}% {word}")


def g_interest(it):
    P, r, n, ntxt, kind = it
    I = P * r / 100 * float(n)
    assert abs(I * 100 - round(I * 100)) < 1e-6, it         # whole cents
    head = "Amount invested" if kind == "inv" else "Amount borrowed"
    txt = "Find the simple interest." if kind == "inv" else "Find the simple interest on this loan."
    tab = dtable([[head, money(P)], ["Interest rate", f"{nf(r)}% per year"], ["Time", ntxt]])
    return txt, static(tab), "interest", money(round(I, 2))


def g_wages(it):
    name, rate, hrs, ot, kind = it
    pay = rate * hrs + {None: 0, "t15": 1.5, "dt": 2}[kind] * rate * ot
    assert abs(pay * 100 - round(pay * 100)) < 1e-6, it
    if kind is None:
        return (f"{name} earns {money(rate)} an hour and works {hrs} hours. How much does {name} earn?", None,
                "wage", money(round(pay, 2)))
    rows = [["Hourly rate", money(rate)], ["Normal hours", f"{hrs} hours"],
            ["Time-and-a-half" if kind == "t15" else "Double time", f"{ot} hours"]]
    return (f"Find {name}’s total pay for the week.", static(dtable(rows)),
            "wage_t15" if kind == "t15" else "wage_dt", money(round(pay, 2)))


def g_salary(it):
    name, sal, per = it
    div, word = (52, "weekly") if per == "w" else (26, "fortnightly")
    pay = sal / div
    exact = abs(pay * 100 - round(pay * 100)) < 1e-6
    if not exact:
        assert abs((pay * 100) % 1 - 0.5) > 0.03, it
    txt = f"{name} earns a salary of {money(sal)} a year. Find {name}’s {word} pay" + \
          ("." if exact else ", to the nearest cent.")
    return txt, None, "salary_w" if per == "w" else "salary_f", money(round(pay + 1e-9, 2))


def g_commission(it):
    if it[0] == "base":
        _, name, base, r, sales = it
        pay = base + r / 100 * sales
        assert abs(pay * 100 - round(pay * 100)) < 1e-6, it
        tab = dtable([["Weekly base wage", money(base)], ["Commission", f"{nf(r)}% of sales"],
                      ["Sales this week", money(sales)]])
        return f"Find {name}’s total pay for the week.", static(tab), "comm_base", money(round(pay, 2))
    name, r, sales = it
    c = r / 100 * sales
    assert abs(c * 100 - round(c * 100)) < 1e-6, it
    return (f"Find {name}’s commission.", static(dtable([["Value of sales", money(sales)],
                                                             ["Commission rate", f"{nf(r)}%"]])),
            "commission", money(round(c, 2)))


def g_holiday_pay(it):
    name, w = it
    four = 4 * w
    tot = four + 0.175 * four
    assert abs(tot * 100 - round(tot * 100)) < 1e-6, it
    tab = dtable([["Weekly pay", money(w)], ["Holiday", "4 weeks"], ["Leave loading", "17.5%"]])
    return f"Find {name}’s total holiday pay.", static(tab), "holiday", money(round(tot, 2))


# ---- D: indices, formulas and rates ----
def _b(b):
    return f"<i>{b}</i>" if isinstance(b, str) else str(b)


def _term(c, b, e):
    """c b^e as HTML: no coefficient when c = 1, no index when e = 1."""
    co = "" if c == 1 else str(c)
    sep = f" {TIMES} " if (co and not isinstance(b, str)) else ""
    return f"{co}{sep}{_b(b)}" + ("" if e == 1 else f"<sup>{e}</sup>")


def _ans(c, b, e):
    return f"{'' if c == 1 else c}{b}" + ("" if e == 1 else f"^{e}")


def g_idx(it):
    kind = it[0]
    if kind == "pow":
        _, c, b, m, n = it
        disp = f"({_term(c, b, m)})<sup>{n}</sup>"
        cc, e, key = c ** n, m * n, "idx_pow"
    else:
        _, c1, b, m, c2, n = it
        op = TIMES if kind == "mult" else DIV
        disp = f"{_term(c1, b, m)} {op} {_term(c2, b, n)}"
        if kind == "mult":
            cc, e, key = c1 * c2, m + n, "idx_mult"
        else:
            assert c1 % c2 == 0, it
            cc, e, key = c1 // c2, m - n, "idx_div"
    txt = "Simplify." if isinstance(b, str) else "Write as a single power."
    return txt, static(display(disp)), key, _ans(cc, b, e)


def g_zero_neg(it):
    kind = it[0]
    sup = lambda e: f"<sup>{str(e).replace('-', MINUS)}</sup>"
    if kind == "neg":
        _, b, n = it
        disp, txt, ans = f"{b}{sup(-n)}", "Evaluate.", fstr(Fraction(1, b ** n))
    elif kind == "zplus":
        _, b, k = it
        disp, txt, ans = f"{b}{sup(0)} + {k}", "Evaluate.", str(1 + k)
    elif kind == "zsum":
        _, b, c = it
        disp, txt, ans = f"{b}{sup(0)} + {c}{sup(0)}", "Evaluate.", "2"
    elif kind == "zero":
        _, b = it
        disp, txt, ans = f"{b}{sup(0)}", "Evaluate.", "1"
    elif kind == "zcoef":
        _, k, p = it
        disp, txt, ans = f"{k}{_b(p)}{sup(0)}", "Simplify.", str(k)
    elif kind == "zbr":
        _, k, p = it
        disp, txt, ans = f"({k}{_b(p)}){sup(0)}", "Simplify.", "1"
    elif kind == "posnum":
        _, b, n = it
        disp, txt, ans = f"{b}{sup(-n)}", "Write with a positive index.", f"1/{b}^{n} (= {fstr(Fraction(1, b ** n))})"
    elif kind == "negcoef":
        _, k, b, n = it
        v = Fraction(k, b ** n)
        disp, txt, ans = f"{k} {TIMES} {b}{sup(-n)}", "Evaluate.", f"{fstr(v)} (or {nf(float(v))})"
    else:  # negsum: b^-1 + b^0
        _, b = it
        disp, txt, ans = f"{b}{sup(-1)} + {b}{sup(0)}", "Evaluate.", fstr(Fraction(1, b) + 1)
    return txt, static(display(disp)), "zero_neg", ans


def _sci_parts(x):
    """Decimal x -> (a as text, n) with 1 <= a < 10."""
    x = Decimal(x)
    n = x.adjusted()
    a = (x.scaleb(-n)).normalize()
    return format(a, "f"), n


def _plain(x):
    """Decimal x as a basic numeral: grouped whole part, no trailing zeros."""
    x = Decimal(x).normalize()
    s = format(x, "f")
    if "." in s:
        w, f_ = s.split(".")
        return (grp(int(w)) if w else "0") + "." + f_
    return grp(int(s))


def g_sci(it):
    if it[0] == "to_sci":
        a, n = _sci_parts(it[1])
        assert Decimal(1) <= Decimal(a) < Decimal(10)
        return ("Write in scientific notation.", static(display(_plain(it[1]))), "sci",
                f"{a} {TIMES} 10^{n}".replace("-", MINUS))
    _, a, n = it
    val = Decimal(a).scaleb(n)
    e = str(n).replace("-", MINUS)
    return ("Write as a basic numeral.", static(display(f"{a} {TIMES} 10<sup>{e}</sup>")), "sci", _plain(val))


FS_FORM = {   # printed form, and the formula as a function residual(lhs - rhs) of the values
    "fs_v": ("<i>v</i> = <i>u</i> + <i>at</i>", lambda d: d["v"] - (d["u"] + d["a"] * d["t"])),
    "fs_P": ("<i>P</i> = 2(<i>l</i> + <i>w</i>)", lambda d: d["P"] - 2 * (d["l"] + d["w"])),
    "fs_C": ("<i>C</i> = 5 + 2.4<i>d</i>", lambda d: d["C"] - (5 + 2.4 * d["d"])),
    "fs_F": ("<i>F</i> = 1.8<i>C</i> + 32", lambda d: d["F"] - (1.8 * d["C"] + 32)),
    "fs_A": ("<i>A</i> = ½<i>bh</i>", lambda d: d["A"] - 0.5 * d["b"] * d["h"]),
    "fs_y": ("<i>y</i> = <i>mx</i> + <i>c</i>", lambda d: d["y"] - (d["m"] * d["x"] + d["c"])),
}


def g_formula_sub(it):
    key, find, given = it
    form, res = FS_FORM[key]
    r0 = res({**given, find: 0.0})
    r1 = res({**given, find: 1.0})
    x = -r0 / (r1 - r0)                                     # every formula here is linear in each pronumeral
    assert abs(res({**given, find: x})) < 1e-9
    x = round(x, 6)
    assert abs(x * 100 - round(x * 100)) < 1e-6, it         # tidy: at most 2 dp
    parts = [f"<i>{k}</i> = {nf(v)}" for k, v in given.items()]
    when = parts[0] if len(parts) == 1 else ", ".join(parts[:-1]) + " and " + parts[-1]
    return f"Find <i>{find}</i> when {when}.", static(display(form)), key, nf(x)


def g_ratio(it):
    amt, parts, what = it
    tot = sum(parts)
    one = amt / tot
    shares = [one * p for p in parts]
    for sh in shares:
        assert abs(sh * 100 - round(sh * 100)) < 1e-6, it
    rs = " : ".join(str(p) for p in parts)
    if what == "$":
        a_txt, fmt = money(amt), (lambda v: money(round(v, 2)))
    elif what == "kg":
        a_txt, fmt = f"{nf(amt)} kg", (lambda v: f"{nf(round(v, 3))} kg")
    else:
        a_txt, fmt = f"{nf(amt)} {what}", (lambda v: nf(round(v, 3)))
    give = "Give both shares." if len(parts) == 2 else "Give all three shares."
    ans = ", ".join(fmt(v) for v in shares[:-1]) + " and " + fmt(shares[-1])
    return f"Share {a_txt} in the ratio {rs}. {give}", None, "ratio", ans


# ---- E: straight-line graphs, data and probability ----
def g_linear(it):
    if it[0] == "gi":
        _, m, c, order = it
        ms = {1: "", -1: MINUS}.get(m, nf(m))
        if order == "mc":
            cs = "" if c == 0 else (f" + {nf(c)}" if c > 0 else f" {MINUS} {nf(-c)}")
            disp = f"<i>y</i> = {ms}<i>x</i>{cs}"
        else:                                                # y = c - 2x
            mm = {1: "", -1: ""}.get(m, nf(abs(m)))
            disp = f"<i>y</i> = {nf(c)} {'+' if m > 0 else MINUS} {mm}<i>x</i>"
        return ("State the gradient and the <i>y</i>-intercept.", static(display(disp)), "linear",
                f"gradient {nf(m)}, y-intercept {nf(c)}")
    m, c, x = it
    ms = {1: "", -1: MINUS}.get(m, nf(m))
    cs = "" if c == 0 else (f" + {nf(c)}" if c > 0 else f" {MINUS} {nf(-c)}")
    disp = f"<i>y</i> = {ms}<i>x</i>{cs}"
    return (f"Find the value of <i>y</i> when <i>x</i> = {nf(x)}.", static(display(disp)), "linear",
            nf(round(m * x + c, 6)))


def g_mean(it):
    if it[0] == "ft":
        _, xs, fs = it
        m = sum(a * b for a, b in zip(xs, fs)) / sum(fs)
        exact = abs(m * 10 - round(m * 10)) < 1e-9             # whole or 1 dp exactly; otherwise round to 1 dp
        tab = dtable([["Score"] + [str(v) for v in xs], ["Frequency"] + [str(v) for v in fs]], compact=True)
        if exact:
            return "Find the mean of these scores.", static(tab), "mean_freq", nf(round(m, 1))
        safe1(m, it)
        return ("Find the mean of these scores, correct to 1 decimal place.", static(tab), "mean_freq", d1(m))
    vals, head, noun = it
    m = sum(vals) / len(vals)
    return (f"Find the mean of these {noun}.", static(dtable([[head] + [nf(v) for v in vals]])), "mean",
            nf(round(m, 2)))


def g_freq(it):
    kind = it[0]
    if kind == "die":
        _, n, ev, fav = it
        e = Fraction(fav, 6) * n
        assert e.denominator == 1, it
        return (f"A fair die is rolled {grp(n)} times. How many times would you expect {ev}?",
                (lambda s: D.dice_row()), "exp_freq", str(e))
    if kind == "coin":
        _, n = it
        return (f"A fair coin is tossed {n} times. How many heads would you expect?", None, "exp_freq", str(n // 2))
    if kind == "p":
        _, ev, p, n = it
        e = Fraction(p) * n
        assert e.denominator == 1, it
        what = {"late": ("the bus is late", "School days", "days would you expect the bus to be late"),
                "rain": ("it rains", "Days", "days would you expect it to rain")}[ev]
        tab = dtable([[f"<i>P</i>({what[0]})", p], [what[1], str(n)]])
        return f"On how many {what[2]}?", static(tab), "exp_freq", str(e)
    if kind == "rel":
        _, c, n, what = it
        r = Fraction(c, n)
        thing = {"heads": f"Heads came up {c} times in {n} tosses.", "sixes": f"A six came up {c} times in {n} rolls."}[what]
        noun = {"heads": "heads", "sixes": "a six"}[what]
        return (f"{thing} Find the relative frequency of {noun}.", None, "rel_freq",
                f"{nf(float(r))} (or {fstr(r)})")
    _, counts, target = it
    n = sum(c for _, c in counts)
    r = Fraction(dict((k.lower(), c) for k, c in counts)[target], n)
    tab = dtable([["Colour"] + [k for k, _ in counts], ["Frequency"] + [str(c) for _, c in counts]])
    return (f"A spinner was spun {n} times. Find the relative frequency of {target}.", static(tab), "rel_freq",
            f"{nf(float(r))} (or {fstr(r)})")


GEN = {"pyth_hyp": g_pyth_hyp, "pyth_short": g_pyth_short, "trig_ratio": g_trig_ratio, "trig_top": g_trig_top,
       "trig_bottom": g_trig_bottom, "trig_angle": g_trig_angle, "similar": g_similar,
       "a_circle": g_a_circle, "arc": g_arc, "sector": g_sector, "sa_rect": g_sa_rect, "sa_cyl": g_sa_cyl,
       "v_prism": g_v_prism, "v_cyl": g_v_cyl, "capacity": g_capacity, "v_pyramid": g_v_pyramid, "v_cone": g_v_cone,
       "pct_change": g_pct_incdec, "pct_original": g_pct_orig, "profit_pct": g_profit_pct, "interest": g_interest,
       "wages": g_wages, "salary": g_salary, "commission": g_commission, "holiday_pay": g_holiday_pay,
       "idx": g_idx, "zero_neg": g_zero_neg, "sci": g_sci, "formula_sub": g_formula_sub, "ratio": g_ratio,
       "speed": g_speed,
       "gradient": g_gradient, "linear": g_linear, "mean": g_mean, "prob": g_prob, "prob_not": g_prob_not,
       "freq": g_freq}


# ============================================================== scheduler ==
STRANDS = {
    "A": ["pyth_hyp", "pyth_short", "trig_ratio", "trig_top", "trig_bottom", "trig_angle", "similar"],
    "B": ["a_circle", "arc", "sector", "sa_rect", "sa_cyl", "v_prism", "v_cyl", "capacity"],
    "C": ["pct_change", "pct_original", "profit_pct", "interest", "wages", "salary", "commission", "holiday_pay"],
    "D": ["idx", "zero_neg", "sci", "formula_sub", "ratio", "speed"],
    "E": ["gradient", "linear", "mean", "prob", "prob_not", "freq"],
}
TERM4_ONLY = {"B": ["v_pyramid", "v_cone"]}
# trig_ratio, trig_top and trig_bottom print the same formula (sin, cos, tan), so none of them sits in the
# session straight after another (no formula in two consecutive sessions)
CLASH = {frozenset(p) for p in (("trig_ratio", "trig_top"), ("trig_ratio", "trig_bottom"), ("trig_top", "trig_bottom"))}
MIN_PER_TERM = 3


def families(strand, term):
    return STRANDS[strand] + (TERM4_ONLY.get(strand, []) if term == 4 else [])


def elev_slot(k, n, term):
    """Terms 3-4: about a third of a family's appearances (round(n/3), spread out) are angle-of-elevation
    or angle-of-depression items."""
    if term < 3:
        return False
    m = max(1, round(n / 3))
    return k in {int((j + 0.5) * n / m) for j in range(m)}


# family -> (which items are special, is appearance k of n in this term a special one?)
SPECIAL = {"v_prism": (is_rev, lambda k, n, t: k % 4 == 1), "speed": (is_rev, lambda k, n, t: k % 4 == 1),
           "trig_top": (is_elev, elev_slot), "trig_angle": (is_elev, elev_slot)}


def seed(*parts):
    return zlib.crc32("|".join(map(str, parts)).encode())


def _ok_pair(a, b):
    return a != b and frozenset((a, b)) not in CLASH


def strand_sequence(strand, term, n=30):
    """Whole shuffled cycles of the strand's families, so every family comes round at least every
    len(strand) + 1 sessions (and at least 3 times a term; in Term 4 strand B has ten families, so each
    appears exactly 3 times). Never the same family (or a clashing one) in consecutive sessions; a
    two-session gap is preferred where a cycle meets the next. Term 4 Week 1 shows a pyramid or a cone."""
    rng = random.Random(seed("seq", strand, term))
    fams = families(strand, term)
    for _ in range(2000):
        seq = []
        while len(seq) < n:
            found = None
            for gap in (2, 1):
                for _ in range(400):
                    cyc = fams[:]
                    rng.shuffle(cyc)
                    joined = seq[-1:] + cyc
                    if not all(_ok_pair(a, b) for a, b in zip(joined, joined[1:])):
                        continue
                    if any(c in seq[-gap:] for c in cyc[:gap]):
                        continue
                    found = cyc
                    break
                if found:
                    break
            if not found:
                break
            seq += found
        seq = seq[:n]
        if len(seq) < n or not all(seq.count(f) >= MIN_PER_TERM for f in fams):
            continue
        if term == 4 and strand == "B" and not {"v_pyramid", "v_cone"} & set(seq[:3]):
            continue
        return seq
    raise RuntimeError(f"no valid rotation for strand {strand}, term {term}")


def qsig(q):
    """What makes two questions the same: the question text, the multiset of numbers and words printed
    in its figure (whatever the drawing scale) and the answer (the same three sides with theta at the
    other angle is a different question)."""
    import re
    txt = re.sub(r"<[^>]+>", "", q.text)
    labs = sorted(t.strip() for t in re.findall(r">([^<>]+)<", q.fig or "") if t.strip())
    return txt, tuple(labs), q.answer


class Pools:
    """Draws items without replacement (no question repeats within a term). Within a family it
    prefers the formula used least so far this term (so sub-formulas rotate). In SPECIAL families the
    chosen appearances take the special items (working backwards; elevation/depression) and the
    others do not."""

    def __init__(self, term, prev=()):
        self.term = term
        self.prev = set(prev)        # items the term before used (Term 2 after Term 1, Term 4 after Term 3)
        self.used = set()
        self.keys = {}
        self.rng = random.Random(seed("pool", term))

    def items(self, fam):
        if self.term <= 2:
            return list(L1[fam])
        l1 = list(L1[fam])
        fwd = [it for it in l1 if not is_rev(it)]
        rev = [it for it in l1 if is_rev(it)]
        return list(L2[fam]) + fwd[::2] + rev[::2]

    def draw(self, fam, k, n, avoid=()):
        avail = [it for it in self.items(fam) if (fam, repr(it)) not in self.used]
        if not avail:
            raise RuntimeError(f"term {self.term}: the {fam} pool has run out (questions may not repeat)")
        pred, slot = SPECIAL.get(fam, (lambda it: False, lambda k_, n_, t_: False))
        want = slot(k, n, self.term)
        pref = [it for it in avail if pred(it) == want] or avail
        pref = [it for it in pref if GEN[fam](it)[2] not in avoid] or pref
        use = {repr(it): self.keys.get(GEN[fam](it)[2], 0) for it in pref}
        lo = min(use.values())
        cands = [it for it in pref if use[repr(it)] == lo]
        cands = [it for it in cands if (fam, repr(it)) not in self.prev] or cands
        it = self.rng.choice(cands)
        self.used.add((fam, repr(it)))
        return it


def generated_sessions(term):
    """All 30 sessions of a term (Weeks 1-10, Sessions 1-3). Terms 1 and 2 share the Level 1 pool and
    Terms 3 and 4 the Level 2 pool, so Term 2 (Term 4) prefers items Term 1 (Term 3) did not use."""
    prev = ()
    if term in (2, 4):
        prev = {(q.fam, repr(q.item)) for s in generated_sessions(term - 1)[0] for q in s.qs}
    seqs = {X_: strand_sequence(X_, term) for X_ in "ABCDE"}
    pools = Pools(term, prev)
    sigs = set()
    out = []
    for idx in range(30):
        week, sess = idx // 3 + 1, idx % 3 + 1
        qs = []
        for X_ in "ABCDE":
            fam = seqs[X_][idx]
            k = seqs[X_][:idx].count(fam)          # times the family has already appeared this term
            n = seqs[X_].count(fam)
            # y = mx + c is linear's own formula: formula_sub leaves it alone when linear is in the session
            avoid = {"fs_y"} if fam == "formula_sub" and seqs["E"][idx] == "linear" else set()
            q = None
            for attempt in range(12):              # skip an item whose figure cannot be drawn cleanly,
                it = pools.draw(fam, k, n, avoid)  # or that repeats a question already in the term
                text, figf, key, ans = GEN[fam](it)
                try:
                    cand = mk(text, figf, key, ans)
                    if cand.figf:
                        cand.figf(cand.s * 0.81)   # it must also survive two shrink steps
                except AssertionError:
                    continue
                if qsig(cand) in sigs:
                    continue
                q = cand
                break
            assert q is not None, (term, idx, fam)
            q.fam, q.item = fam, it
            q.show_formula = term == 4 and fam in ("v_pyramid", "v_cone")
            sigs.add(qsig(q))
            pools.keys[q.formula] = pools.keys.get(q.formula, 0) + 1
            qs.append(q)
        out.append(Session(term, week, sess, qs))
    for X_, seq in seqs.items():
        for fam in families(X_, term):
            assert seq.count(fam) >= MIN_PER_TERM, (term, fam, seq.count(fam))
    return out, seqs
