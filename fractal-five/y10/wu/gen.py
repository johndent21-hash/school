# -*- coding: utf-8 -*-
"""The Fractal Five, Year 10 - question generators and scheduler (all 30 sessions of each term).

Every session takes one question from each strand, rotating through the strand's families so each
one comes back every few sessions and never twice in a row:

  A right-angled triangles, similar figures   pyth_hyp pyth_short trig_ratio trig_top trig_bottom
                                               trig_angle similar
  B area, surface area and volume              a_circle arc sector sa_rect sa_cyl v_prism v_cyl capacity
                                               (+ v_pyramid v_cone in Term 4: formula printed)
  C percentages and money                      pct_change pct_original profit_pct interest wages salary
                                               commission holiday_pay
  D indices, formulas and rates                idx zero_neg sci formula_sub ratio speed
  E straight-line graphs, data, probability    gradient linear mean prob prob_not freq

Level 1 (Terms 1-2): whole numbers, tidy answers, formula printed. Level 2 (Terms 3-4): the level-2
set (some decimals, answers to 1 decimal place or the nearest cent, angles of elevation and depression)
plus half of the level-1 set, recalled from memory.
Every answer is computed here from the same numbers that label the diagram; wu/verify_answers.py
recomputes them independently from what is printed.
"""
import math
import random
import re
import zlib
from decimal import Decimal, ROUND_HALF_UP
from fractions import Fraction

import wdia as D
from formulas import FX
from wu import Q, Session, display, dtable, frac, TIMES, DIV, MINUS, DEG

X = "<i>x</i>"
TH = "<i>θ</i>"
NB = " "                     # thousands separator (NSW style: 45 000; four-digit numbers stay 4500)


# ------------------------------------------------------------------ helpers --
def _group(s):
    """Space-separate the thousands of an integer string with 5 or more digits."""
    neg = s.startswith("-")
    d = s[1:] if neg else s
    if len(d) >= 5:
        parts = []
        while d:
            parts.insert(0, d[-3:])
            d = d[:-3]
        d = NB.join(parts)
    return ("-" if neg else "") + d


def nf(v):
    """Plain number: integers without a decimal point, otherwise every decimal digit it has (to 10 dp,
    which also hides float noise); true minus sign."""
    if abs(v - round(v)) < 1e-9:
        s = _group(str(int(round(v))))
    else:
        s = f"{v:.10f}".rstrip("0").rstrip(".")
        i, _, dec = s.partition(".")
        s = _group(i) + "." + dec
    return s.replace("-", MINUS)


def half_up(v, places):
    """Round half up (as taught), from the exact decimal value."""
    q = Decimal(1).scaleb(-places)
    return float(Decimal(str(v) if not isinstance(v, Fraction) else v.numerator / Decimal(v.denominator))
                 .quantize(q, rounding=ROUND_HALF_UP))


def money(v):
    """$45, $52 000, $45.50 - to the nearest cent."""
    c = half_up(v, 2)
    if abs(c - round(c)) < 1e-9:
        return "$" + _group(str(int(round(c))))
    i, dec = f"{c:.2f}".split(".")
    return "$" + _group(i) + "." + dec


def is_cents(v):
    return abs(v * 100 - round(v * 100)) < 1e-6


def d1(v):
    """1 decimal place; the value must not sit on a rounding boundary (so the answer is unique)."""
    t = abs(v) * 10
    assert abs(t - math.floor(t) - 0.5) > 1e-3, f"{v} is too close to a rounding boundary"
    return f"{half_up(v, 1):.1f}"


def fstr(fr_):
    fr_ = Fraction(fr_)
    s = str(fr_.numerator) if fr_.denominator == 1 else f"{fr_.numerator}/{fr_.denominator}"
    return s.replace("-", MINUS)


def lab(v, u):
    return f"{nf(v)} {u}"


def plain(text):
    return re.sub(r"<[^>]+>", "", text)


def lines(text):
    return max(1, math.ceil(len(plain(text)) / 40))


def mk(text, figf, key, answer):
    fx, small = FX[key]
    s0 = {1: 1.0, 2: 0.9}.get(lines(text), 0.8)
    fig = figf(s0) if figf else None
    q = Q(text, fig, key, answer, fx=fx, fx_small=small)
    q.figf, q.s = figf, s0
    return q


def static(html):
    return lambda s: html


def sup(b, e):
    return f"{b}<sup>{e}</sup>"


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
# ---------------------------------------------------------------- strand A --
L1["pyth_hyp"] = [(12, 5, "cm", 0), (12, 9, "cm", 1), (15, 8, "cm", 2), (16, 12, "m", 3), (20, 15, "cm", 0),
                  (24, 7, "cm", 1), (24, 10, "m", 2), (21, 20, "cm", 3), (4, 3, "m", 1), (30, 16, "cm", 0)]
L2["pyth_hyp"] = [(9, 4, "cm", 0), (10, 6, "cm", 1), (8, 3, "m", 2), (11, 7, "cm", 3), (6, 2.5, "m", 0),
                  (6, 4.5, "cm", 1), (11, 9, "cm", 2), (8, 6.5, "m", 3), (13, 8, "cm", 0), (12, 5.5, "cm", 1)]
L1["pyth_short"] = [(10, 6, "cm", 0), (17, 15, "cm", 1), (25, 7, "cm", 2), (15, 9, "m", 3), (20, 12, "cm", 0),
                    (26, 10, "cm", 1), (5, 3, "m", 2), (29, 20, "cm", 3), (25, 15, "cm", 0), (13, 12, "cm", 1)]
L2["pyth_short"] = [(12, 7, "cm", 0), (15, 8, "cm", 1), (10, 4, "m", 2), (9, 5, "cm", 3), (14, 6, "cm", 0),
                    (11, 7, "m", 1), (20, 9, "cm", 2), (13, 6.5, "cm", 3), (8.5, 4, "cm", 0), (16, 11, "m", 1)]
# trig_ratio: (opposite, adjacent, hypotenuse, ratio asked, angle on the horizontal (h) / vertical (v) leg, orient)
#   (in all four trig families the angle sits on the horizontal leg when it is under 45 deg and on the vertical
#   leg otherwise, so every triangle is drawn wide and its angle label has room inside the wedge)
L1["trig_ratio"] = [(3, 4, 5, "tan", "h", 0), (4, 3, 5, "sin", "v", 1), (12, 5, 13, "cos", "v", 2),
                    (5, 12, 13, "tan", "h", 3), (8, 15, 17, "sin", "h", 0), (15, 8, 17, "cos", "v", 1),
                    (7, 24, 25, "cos", "h", 2), (24, 7, 25, "tan", "v", 3), (3, 4, 5, "cos", "h", 1),
                    (12, 5, 13, "sin", "v", 0), (8, 15, 17, "tan", "h", 2), (24, 7, 25, "sin", "v", 3)]
L2["trig_ratio"] = [(6, 8, 10, "sin", "h", 1), (9, 12, 15, "tan", "h", 0), (10, 24, 26, "cos", "h", 2),
                    (16, 12, 20, "cos", "v", 3), (15, 20, 25, "tan", "h", 0), (30, 16, 34, "sin", "v", 1),
                    (20, 15, 25, "sin", "v", 2), (5, 12, 13, "cos", "h", 3)]
# trig_top: x = side x sin/cos/tan(angle): (ratio, given side, angle, unit, at, orient)
#   sin: hypotenuse given, find the opposite side; cos: hypotenuse given, find the adjacent side;
#   tan: adjacent side given, find the opposite side.
# Level 2 also has angle-of-elevation / depression items: ("elev"|"dep", angle, ground distance, unit,
#   object, side) - the height x = distance x tan(angle).
L1["trig_top"] = [("sin", 12, 35, "cm", "h", 0), ("cos", 15, 40, "cm", "h", 1), ("tan", 8, 50, "cm", "v", 2),
                  ("sin", 20, 28, "m", "h", 3), ("cos", 10, 62, "cm", "v", 0), ("tan", 14, 33, "m", "h", 1),
                  ("sin", 9, 55, "cm", "v", 3), ("cos", 18, 25, "m", "h", 2), ("tan", 6, 58, "cm", "v", 1),
                  ("sin", 16, 47, "cm", "v", 2)]
L2["trig_top"] = [("sin", 7.5, 38, "cm", "h", 1), ("cos", 12.4, 52, "m", "v", 3), ("tan", 11, 26, "cm", "h", 0),
                  ("sin", 19, 64, "cm", "v", 0), ("tan", 9.6, 44, "m", "h", 2), ("cos", 17, 31, "cm", "h", 3),
                  ("elev", 35, 20, "m", "tree", "R"), ("elev", 38, 15, "m", "tower", "L"),
                  ("dep", 40, 50, "m", "cliff", "R"), ("dep", 27, 120, "m", "cliff", "L"),
                  ("elev", 29, 40, "m", "tree", "L"), ("elev", 43, 32, "m", "tower", "R")]
# trig_bottom: x = side / sin/cos/tan(angle): (ratio, given side, angle, unit, at, orient)
#   sin: opposite given, find the hypotenuse; cos: adjacent given, find the hypotenuse;
#   tan: opposite given, find the adjacent side.
L1["trig_bottom"] = [("sin", 8, 30, "cm", "h", 0), ("cos", 12, 40, "cm", "h", 1), ("tan", 10, 55, "cm", "v", 2),
                     ("sin", 15, 48, "m", "v", 3), ("cos", 9, 25, "cm", "h", 0), ("tan", 7, 36, "m", "h", 1),
                     ("sin", 11, 62, "cm", "v", 2), ("cos", 20, 57, "m", "v", 3), ("tan", 16, 42, "cm", "h", 0),
                     ("sin", 6, 34, "cm", "h", 1)]
L2["trig_bottom"] = [("sin", 9.5, 41, "cm", "h", 1), ("cos", 14.2, 29, "m", "h", 2), ("tan", 13, 63, "cm", "v", 3),
                     ("sin", 18, 53, "cm", "v", 0), ("cos", 6.8, 46, "cm", "v", 0), ("tan", 5, 27, "m", "h", 2),
                     ("sin", 12, 38, "m", "h", 3), ("tan", 17.5, 50, "cm", "v", 1)]
# trig_angle: (ratio, first side, second side, unit, at, orient): sin = opp/hyp, cos = adj/hyp, tan = opp/adj
#   Level 2 also: ("elev"|"dep", height, ground distance, unit, object, side) - theta = tan^-1(height/distance)
L1["trig_angle"] = [("tan", 5, 8, "cm", "h", 0), ("sin", 7, 12, "cm", "h", 1), ("cos", 9, 14, "cm", "v", 2),
                    ("tan", 11, 6, "m", "v", 3), ("sin", 10, 17, "cm", "h", 0), ("cos", 8, 15, "m", "v", 3),
                    ("tan", 13, 9, "cm", "v", 2), ("sin", 6, 11, "cm", "h", 0), ("cos", 5, 9, "cm", "v", 1),
                    ("tan", 4, 10, "m", "h", 1)]
L2["trig_angle"] = [("sin", 14, 20, "cm", "h", 2), ("cos", 12, 20, "cm", "v", 1), ("tan", 15, 7, "m", "v", 3),
                    ("sin", 9, 16, "m", "h", 0), ("cos", 11, 13, "cm", "h", 0), ("tan", 8, 18, "cm", "h", 2),
                    ("elev", 30, 50, "m", "tower", "R"), ("elev", 18, 25, "m", "tree", "L"),
                    ("dep", 60, 150, "m", "cliff", "R"), ("dep", 45, 70, "m", "cliff", "L"),
                    ("elev", 40, 32, "m", "tower", "L"), ("dep", 85, 120, "m", "cliff", "R")]
# similar: (original length, original width, scale factor, where x is: "img" (in the image) or "org", unit)
L1["similar"] = [(4, 3, 2, "img", "cm"), (5, 2, 3, "img", "cm"), (6, 4, 1.5, "img", "cm"), (4, 2, 2.5, "img", "m"),
                 (8, 6, 1.5, "org", "cm"), (3, 2, 3, "org", "cm"), (6, 4, 2.5, "img", "cm"), (7, 3, 2, "org", "m"),
                 (10, 4, 1.5, "img", "cm"), (2, 1, 3, "img", "m"), (8, 2, 2.5, "org", "cm")]
L2["similar"] = [(8, 6, 0.5, "img", "cm"), (5, 3, 2.5, "img", "cm"), (7, 4, 1.5, "img", "m"), (12, 8, 0.5, "org", "cm"),
                 (9, 5, 2, "org", "cm"), (6, 5, 0.5, "img", "m"), (4.5, 3, 2, "img", "cm"), (6, 2, 2.5, "org", "cm")]

# ---------------------------------------------------------------- strand B --
L1["a_circle"] = [("r", 6, "cm"), ("r", 3, "m"), ("r", 5, "cm"), ("r", 10, "cm"), ("r", 7, "m"), ("r", 2, "cm"),
                  ("d", 8, "cm"), ("d", 12, "cm"), ("d", 20, "m"), ("d", 14, "cm")]
L2["a_circle"] = [("r", 2.5, "cm"), ("r", 4.5, "m"), ("r", 8.5, "cm"), ("d", 12, "cm"), ("d", 9, "m"), ("d", 15, "cm"),
                  ("r", 11, "cm"), ("d", 7, "cm")]
# arc and sector: (angle, radius, unit)
L1["arc"] = [(60, 6, "cm"), (90, 4, "cm"), (120, 9, "cm"), (180, 5, "m"), (270, 8, "cm"), (90, 10, "cm"),
             (60, 12, "m"), (120, 3, "cm"), (180, 7, "cm"), (270, 4, "cm")]
L2["arc"] = [(60, 7.5, "cm"), (120, 4.5, "m"), (270, 6, "cm"), (180, 11, "cm"), (90, 8.5, "cm"), (60, 9, "cm"),
             (120, 10, "m"), (270, 3, "cm")]
L1["sector"] = [(90, 6, "cm"), (60, 9, "cm"), (120, 6, "cm"), (270, 5, "cm"), (180, 8, "m"), (60, 4, "cm"),
                (120, 12, "cm"), (90, 3, "m"), (270, 10, "cm"), (180, 6, "cm")]
L2["sector"] = [(60, 5.5, "cm"), (120, 7.5, "m"), (270, 4.5, "cm"), (90, 11, "cm"), (180, 9, "cm"), (60, 11, "m"),
                (120, 3.5, "cm"), (270, 7, "cm")]
L1["sa_rect"] = [(5, 4, 3, "cm"), (8, 2, 3, "cm"), (10, 5, 2, "m"), (4, 4, 4, "cm"), (7, 3, 2, "cm"), (6, 4, 2, "m"),
                 (9, 3, 3, "cm"), (5, 5, 2, "cm")]
L2["sa_rect"] = [(6, 2.5, 4, "cm"), (8, 4.5, 2, "m"), (5.5, 3, 2, "cm"), (10, 1.5, 6, "cm"), (7, 5, 2.5, "m"),
                 (12, 4, 1.5, "cm")]
# sa_cyl, v_cyl: (r, h, diameter labelled?, unit)
L1["sa_cyl"] = [(3, 10, False, "cm"), (5, 8, False, "cm"), (4, 6, True, "cm"), (4, 9, False, "m"), (6, 5, True, "cm"),
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
# capacity: rectangular tank in cm (l, w, h) that holds a whole number of litres
L1["capacity"] = [(50, 30, 20), (40, 25, 20), (60, 40, 30), (50, 40, 30), (30, 20, 10), (80, 50, 40),
                  (40, 30, 25), (100, 50, 40), (25, 20, 10), (60, 30, 20)]
L2["capacity"] = [(45, 32, 25), (80, 50, 12.5), (36, 25, 20), (120, 50, 40), (55, 40, 30), (70, 40, 25),
                  (24, 25, 30), (90, 35, 20)]
# Term 4 only (formula printed): v_pyramid (base length, base width, height, unit); v_cone (r, h, diameter?, unit)
L1["v_pyramid"] = [(6, 6, 10, "cm"), (9, 8, 5, "cm"), (12, 12, 7, "cm"), (10, 8, 6, "m"), (15, 10, 6, "cm"),
                   (8, 8, 6, "cm")]
L2["v_pyramid"] = [(12, 9, 8, "cm"), (10, 10, 12, "cm"), (7, 6, 5, "m"), (9, 9, 10, "cm"), (14, 6, 5, "cm"),
                   (8, 5, 6, "m")]
L1["v_cone"] = [(3, 4, False, "cm"), (6, 8, False, "cm"), (5, 9, False, "cm"), (4, 6, True, "cm"), (7, 10, False, "m"),
                (3, 7, True, "cm")]
L2["v_cone"] = [(5, 12, True, "cm"), (4, 9, False, "m"), (8, 6, False, "cm"), (6, 10, True, "cm"), (4, 5, False, "cm"),
                (9, 7, False, "cm")]

# ---------------------------------------------------------------- strand C --
# pct_change: (inc/dec, amount, percentage, context)
L1["pct_change"] = [("dec", 120, 25, "sale"), ("inc", 80, 15, "price"), ("inc", 60, 10, "plain$"),
                    ("dec", 250, 20, "plainkg"), ("inc", 2400, 5, "pop"), ("dec", 45, 20, "sale"),
                    ("inc", 900, 4, "wage"), ("dec", 70, 10, "plain$"), ("dec", 400, 15, "sale"),
                    ("inc", 150, 30, "price")]
L2["pct_change"] = [("inc", 64.5, 12, "price"), ("dec", 89.95, 20, "sale"), ("inc", 45.5, 10, "gst"),
                    ("dec", 1250, 7.5, "plain$"), ("inc", 36.8, 15, "plainkg"), ("dec", 59.99, 35, "sale"),
                    ("inc", 3840, 2.5, "pop")]
# pct_original: ("disc", sale price, discount %, item) | ("inc", new amount, increase %, noun) | ("part", part, %)
L1["pct_original"] = [("disc", 64, 20, "jacket"), ("inc", 440, 10, "rent"), ("part", 45, 15),
                      ("disc", 90, 25, "pair of shoes"), ("inc", 252, 5, "price"), ("part", 18, 30),
                      ("disc", 56, 30, "backpack"), ("inc", 1380, 15, "wage"), ("part", 36, 40), ("disc", 48, 20, "shirt")]
L2["pct_original"] = [("disc", 70, 12.5, "jacket"), ("inc", 535, 7, "rent"), ("part", 24.5, 35),
                      ("disc", 47.6, 15, "helmet"), ("inc", 81.9, 5, "price"), ("disc", 33.15, 35, "cap"), ("part", 9.6, 12)]
# profit_pct: (cost price, selling price) - whole-number percentages, some losses
L1["profit_pct"] = [(40, 50), (80, 60), (120, 150), (50, 60), (150, 120), (200, 170), (60, 75), (90, 72),
                    (250, 300), (120, 108), (300, 345), (75, 90)]
L2["profit_pct"] = [(64, 80), (85, 68), (12.5, 15), (480, 408), (62.5, 75), (18.4, 23), (36, 45), (350, 315)]
# interest: (principal, rate % per year, time, time unit)
L1["interest"] = [(2000, 4, 3, "years"), (500, 5, 2, "years"), (1500, 3, 4, "years"), (800, 6, 5, "years"),
                  (3000, 2, 3, "years"), (1200, 5, 4, "years"), (2500, 4, 2, "years"), (600, 3, 5, "years"),
                  (4000, 5, 3, "years"), (900, 4, 2, "years")]
L2["interest"] = [(2000, 4, 2.5, "years"), (5000, 3, 18, "months"), (1200, 6, 6, "months"), (800, 4.5, 3, "years"),
                  (3600, 5, 9, "months"), (1500, 3.5, 2, "years"), (2400, 4, 3.5, "years"), (6000, 2.5, 30, "months")]
# wages: (name, hourly rate, normal hours, overtime hours, overtime rate: None | 1.5 | 2)
L1["wages"] = [("Ava", 25, 30, 0, None), ("Liam", 24, 38, 4, 1.5), ("Mia", 30, 35, 3, 2), ("Noah", 22, 20, 0, None),
               ("Zoe", 28, 38, 6, 1.5), ("Jack", 26, 32, 2, 2), ("Ella", 20, 25, 0, None), ("Sam", 32, 38, 5, 1.5),
               ("Ruby", 27, 36, 4, 2), ("Leo", 30, 40, 2, 1.5)]
L2["wages"] = [("Ava", 27.5, 30, 0, None), ("Liam", 31.2, 38, 4, 1.5), ("Mia", 28.4, 35, 3, 2), ("Noah", 24.6, 38, 5, 1.5),
               ("Zoe", 33.5, 36, 2, 2), ("Jack", 29.8, 20, 0, None), ("Ella", 26.5, 38, 7, 1.5)]
# salary: (name, yearly salary, "w" weekly | "f" fortnightly) - Level 1 divides exactly
L1["salary"] = [("Sam", 52000, "w"), ("Priya", 62400, "w"), ("Tom", 78000, "f"), ("Grace", 65000, "f"),
                ("Ben", 54600, "w"), ("Chloe", 93600, "f"), ("Josh", 57200, "w"), ("Lily", 70200, "f")]
L2["salary"] = [("Sam", 68500, "w"), ("Priya", 74250, "f"), ("Tom", 59800, "w"), ("Grace", 81300, "f"),
                ("Ben", 95000, "w"), ("Chloe", 66650, "f")]
# commission: (name, rate %, sales) | ("base", name, base wage, rate %, sales)
L1["commission"] = [("Mia", 5, 8000), ("Josh", 3, 12000), ("Ella", 2, 450000), ("Leo", 10, 2500), ("Ruby", 4, 15000),
                    ("Noah", 6, 5000), ("Zoe", 8, 3500), ("Jack", 2, 620000)]
L2["commission"] = [("base", "Mia", 400, 3, 12000), ("base", "Josh", 350, 5, 6400), ("Ella", 2.5, 18400),
                    ("base", "Leo", 500, 4, 9750), ("Ruby", 1.5, 640000), ("base", "Zoe", 450, 2.5, 16800)]
# holiday_pay: (name, weekly pay)
L1["holiday_pay"] = [("Jo", 1200), ("Ari", 800), ("Kim", 950), ("Max", 1500), ("Ivy", 1000), ("Ray", 1100),
                     ("Tess", 1350), ("Ned", 900)]
L2["holiday_pay"] = [("Jo", 1135), ("Ari", 1286.4), ("Kim", 985), ("Max", 1452), ("Ivy", 1064.5), ("Ray", 1218)]

# ---------------------------------------------------------------- strand D --
# idx: (law, base or pronumeral, m, n, coefficient 1, coefficient 2)
L1["idx"] = [("mult", 2, 3, 4, 1, 1), ("div", 3, 8, 2, 1, 1), ("pow", 5, 2, 3, 1, 1), ("mult", "x", 5, 3, 1, 1),
             ("mult", "x", 4, 3, 3, 2), ("div", "a", 5, 2, 12, 4), ("pow", "m", 3, 4, 1, 1), ("mult", "y", 2, 6, 5, 4),
             ("div", "k", 7, 3, 18, 6), ("div", 10, 7, 3, 1, 1), ("pow", 2, 4, 2, 1, 1), ("mult", "p", 6, 2, 2, 7)]
L2["idx"] = [("mult", "x", 5, 2, 4, 3), ("div", "m", 8, 3, 20, 5), ("pow", "a", 3, 2, 2, 1), ("pow", "x", 2, 3, 3, 1),
             ("mult", "p", 4, 5, 6, 1), ("div", "k", 9, 4, 15, 3), ("pow", "n", 4, 3, 1, 1), ("div", "y", 6, 5, 14, 2)]
# zero_neg: ("zero", form, ...) | ("neg", base, n): evaluate base^-n (numerical bases only: Indices A)
L1["zero_neg"] = [("zero", "plus", 7, 3), ("zero", "pow", 5), ("zero", "coef", 4, 3), ("zero", "var", "x"),
                  ("zero", "vcoef", 6, "y"), ("neg", 2, 3), ("neg", 5, 2), ("neg", 10, 1), ("neg", 3, 2), ("neg", 4, 1),
                  ("neg", 10, 3)]
L2["zero_neg"] = [("neg", 2, 5), ("neg", 6, 2), ("zero", "bracket", 5, "x"), ("zero", "minus", 8, 2), ("neg", 10, 2),
                  ("neg", 7, 1), ("neg", 4, 3), ("zero", "plus", 12, 9)]
# sci: ("to", number) write in scientific notation | ("from", a, n) write as a basic numeral
L1["sci"] = [("to", 45000), ("to", 3200000), ("to", 607000), ("to", 90000), ("from", 3.2, 4), ("from", 5.1, 3),
             ("from", 7, 5), ("from", 2.45, 6), ("to", 186000), ("from", 8.06, 4)]
L2["sci"] = [("to", 0.0062), ("from", 4.5, -2), ("to", 0.00081), ("from", 3, -4), ("to", 0.05), ("to", 72500000),
             ("from", 1.08, -3), ("from", 6.3, 7)]
# formula_sub: (formula, unknown, {given values})
L1["formula_sub"] = [("vuat", "v", {"u": 4, "a": 3, "t": 5}), ("vuat", "v", {"u": 10, "a": 2, "t": 6}),
                     ("perim", "P", {"l": 8, "w": 5}), ("perim", "w", {"P": 30, "l": 9}),
                     ("cost", "C", {"d": 10}), ("cost", "d", {"C": 29}), ("temp", "F", {"C": 25}),
                     ("temp", "F", {"C": 10}), ("tri", "h", {"A": 24, "b": 8}), ("tri", "h", {"A": 35, "b": 7}),
                     ("line", "x", {"y": 17, "m": 3, "c": 2}), ("line", "x", {"y": 23, "m": 4, "c": -1})]
L2["formula_sub"] = [("vuat", "a", {"v": 20, "u": 5, "t": 3}), ("vuat", "v", {"u": 2.5, "a": 4, "t": 3}),
                     ("perim", "l", {"P": 27, "w": 4.5}), ("cost", "d", {"C": 17}), ("temp", "C", {"F": 68}),
                     ("tri", "h", {"A": 18, "b": 4.5}), ("line", "x", {"y": -7, "m": 2, "c": 3}),
                     ("temp", "F", {"C": 37})]
# ratio: (amount, a, b, unit) - "$" for money
L1["ratio"] = [(120, 3, 5, "$"), (200, 3, 2, "$"), (90, 4, 5, "$"), (56, 3, 4, "$"), (150, 2, 3, "$"), (84, 5, 2, "$"),
               (360, 7, 5, "$"), (45, 2, 7, "kg")]
L2["ratio"] = [(75, 2, 3, "$"), (1250, 3, 7, "$"), (64.8, 5, 4, "$"), (450, 4, 5, "$"), (42, 1, 6, "kg"),
               (13.5, 4, 5, "L")]
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

# ---------------------------------------------------------------- strand E --
L1["gradient"] = [((0, 1), (2, 5)), ((1, 1), (3, 5)), ((1, 2), (3, 4)), ((0, 1), (1, 4)), ((1, 1), (2, 4)),
                  ((0, 2), (1, 5)), ((2, 1), (3, 4)), ((0, 1), (3, 4))]
L2["gradient"] = [((0, 4), (4, 2)), ((1, 5), (3, 1)), ((0, 1), (4, 3)), ((0, 5), (1, 2)), ((1, 1), (3, 4)),
                  ((0, 4), (3, 1)), ((0, 2), (4, 5))]
# linear: (m, c, x) find y | ("si", m, c) state the gradient and y-intercept
L1["linear"] = [(3, 1, 4), (2, 5, 3), (4, -1, 2), (5, 2, 1), (2, -3, 5), (3, 4, 0), (6, 1, 2), (10, -4, 1),
                ("si", 3, -2), ("si", 2, 5), ("si", 4, 1), ("si", 5, -3)]
L2["linear"] = [(-2, 10, 3), (0.5, 4, 6), (-3, 2, -1), (4, -7, 2.5), (-1, 6, -4), (1.5, -2, 4),
                ("si", -2, 7), ("si", 0.5, -1), ("si", -1, 3), ("si", 6, 0)]
# mean: (scores, heading, noun) | ("freq", scores, frequencies)
L1["mean"] = [((8, 3, 5, 6, 8), "Scores", "scores"), ((21, 18, 24, 15, 22), "Scores", "scores"),
              ((7, 9, 4, 10, 5), "Goals", "goal tallies"), ((14, 11, 17, 12, 16), "Marks", "marks"),
              ((30, 25, 35, 20, 40), "Scores", "scores"), ((6, 2, 9, 4, 9), "Goals", "goal tallies"),
              ("freq", (2, 3, 4, 5, 6), (1, 3, 2, 3, 1)), ("freq", (1, 2, 3, 4, 5), (2, 6, 3, 8, 1)),
              ("freq", (0, 1, 2, 3, 4), (5, 1, 2, 3, 4)), ("freq", (5, 6, 7, 8), (5, 2, 1, 2))]
L2["mean"] = [((2.4, 3.1, 2.8, 3.5, 3.2), "Metres", "lengths"), ((8, 11, 7, 14, 10), "Scores", "scores"),
              ((65, 72, 58, 80, 70), "Marks", "marks"), ((17, 23, 20, 26, 19), "Scores", "scores"),
              ("freq", (1, 2, 3, 4, 5), (3, 5, 8, 2, 1)), ("freq", (0, 1, 2, 3, 4), (4, 7, 5, 3, 2)),
              ("freq", (6, 7, 8, 9, 10), (2, 5, 9, 6, 3)), ("freq", (2, 3, 4, 5), (6, 9, 4, 5))]
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
# freq: ("exp", text, probability, trials) | ("rel", text, outcome word, frequency, trials)
L1["freq"] = [("exp", "A fair die is rolled 300 times. How many 4s would you expect?", Fraction(1, 6), 300),
              ("exp", "A fair coin is tossed 200 times. How many heads would you expect?", Fraction(1, 2), 200),
              ("exp", "A spinner has 4 equal sections, one of them red. It is spun 80 times. How many times would "
                      "you expect red?", Fraction(1, 4), 80),
              ("exp", "A fair die is rolled 120 times. How many even numbers would you expect?", Fraction(1, 2), 120),
              ("rel", "Heads came up 42 times in 100 tosses. Find the relative frequency of heads.", "heads", 42, 100),
              ("rel", "A six was rolled 15 times in 60 rolls. Find the relative frequency of a six.", "six", 15, 60),
              ("rel", "Amy scored 18 goals from 24 shots. Find the relative frequency of a goal.", "goal", 18, 24),
              ("rel", "A spinner landed on blue 35 times in 50 spins. Find the relative frequency of blue.", "blue", 35, 50)]
L2["freq"] = [("exp", "The probability that a seed grows is 0.85. If 400 seeds are planted, how many would you "
                      "expect to grow?", Fraction(85, 100), 400),
              ("exp", "A fair die is rolled 150 times. How many numbers greater than 4 would you expect?",
               Fraction(1, 3), 150),
              ("exp", "The probability of rain on a winter day is 0.3. On how many of 90 winter days would you "
                      "expect rain?", Fraction(3, 10), 90),
              ("rel", "A coin is tossed 80 times and lands heads 44 times. Find the relative frequency of heads.",
               "heads", 44, 80),
              ("rel", "Of 50 seeds planted, 37 grew. Find the relative frequency of a seed growing.", "grows", 37, 50),
              ("rel", "A basketballer made 27 of 40 free throws. Find the relative frequency of a made throw.",
               "made", 27, 40)]


def is_rev(it):
    """A 'working backwards' item (v_prism, speed): the result is given and a length/time is found."""
    return isinstance(it, tuple) and len(it) > 0 and it[0] == "rev"


def is_elev(it):
    """An angle-of-elevation or angle-of-depression item (trig_top, trig_angle; Level 2 only)."""
    return isinstance(it, tuple) and len(it) > 0 and it[0] in ("elev", "dep")


# ============================================================= generators ==
# ------------------------------------------------------------- strand A --
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


TRIG_FN = {"sin": math.sin, "cos": math.cos, "tan": math.tan}


def _trig_fig(ang, at, orient, labels, unknown=None, alab=None):
    return lambda s: D.trig_tri(ang, at=at, orient=orient, unknown=unknown, lab=alab, H=int(100 * s),
                                W=int(230 * min(1.0, s + 0.1)), **labels)


def g_trig_ratio(it):
    o, a, h, r, at, orient = it
    assert o * o + a * a == h * h, it
    ang = math.degrees(math.atan2(o, a))
    val = {"sin": Fraction(o, h), "cos": Fraction(a, h), "tan": Fraction(o, a)}[r]
    labels = {"opp": nf(o), "adj": nf(a), "hyp": nf(h)}
    return (f"Write {r} {TH} as a fraction.", _trig_fig(ang, at, orient, labels, alab=TH), f"trig_{r}", fstr(val))


def g_trig_top(it):
    if is_elev(it):             # height = ground distance x tan(angle)
        kind, ang, d, u, obj, side = it
        x = d * math.tan(math.radians(ang))
        if kind == "elev":
            txt = f"The angle of elevation is {nf(ang)}{DEG}. Find {X}, correct to 1 decimal place."
        else:
            txt = f"The angle of depression is {nf(ang)}{DEG}. Find {X}, correct to 1 decimal place."
        return (txt, (lambda s: D.elev(kind, ang, lab(d, u), X, obj, side=side, H=int(124 * s))), "trig_tan",
                f"{d1(x)} {u}")
    r, side_v, ang, u, at, orient = it
    x = side_v * TRIG_FN[r](math.radians(ang))
    given, unk = {"sin": ("hyp", "opp"), "cos": ("hyp", "adj"), "tan": ("adj", "opp")}[r]
    labels = {given: lab(side_v, u), unk: X}
    return (f"Find {X}, correct to 1 decimal place.", _trig_fig(ang, at, orient, labels, unknown=unk),
            f"trig_{r}", f"{d1(x)} {u}")


def g_trig_bottom(it):
    r, side_v, ang, u, at, orient = it
    x = side_v / TRIG_FN[r](math.radians(ang))
    given, unk = {"sin": ("opp", "hyp"), "cos": ("adj", "hyp"), "tan": ("opp", "adj")}[r]
    labels = {given: lab(side_v, u), unk: X}
    return (f"Find {X}, correct to 1 decimal place.", _trig_fig(ang, at, orient, labels, unknown=unk),
            f"trig_{r}", f"{d1(x)} {u}")


def _nearest_degree(t):
    assert abs(t - math.floor(t) - 0.5) > 0.05, f"angle {t:.3f} is too close to a rounding boundary"
    return int(math.floor(t + 0.5))


def g_trig_angle(it):
    if is_elev(it):             # theta = tan^-1(height / ground distance)
        kind, hgt, d, u, obj, side = it
        t = math.degrees(math.atan2(hgt, d))
        if kind == "elev":
            txt = f"Find the angle of elevation, {TH}, correct to the nearest degree."
        else:
            txt = f"Find the angle of depression, {TH}, correct to the nearest degree."
        return (txt, (lambda s: D.elev(kind, t, lab(d, u), lab(hgt, u), obj, lab=TH, side=side, H=int(124 * s))),
                "trig_inv_tan", f"{_nearest_degree(t)}{DEG}")
    r, p, q, u, at, orient = it
    if r == "sin":
        assert p < q
        t, labels = math.degrees(math.asin(p / q)), {"opp": lab(p, u), "hyp": lab(q, u)}
    elif r == "cos":
        assert p < q
        t, labels = math.degrees(math.acos(p / q)), {"adj": lab(p, u), "hyp": lab(q, u)}
    else:
        t, labels = math.degrees(math.atan2(p, q)), {"opp": lab(p, u), "adj": lab(q, u)}
    return (f"Find {TH}, correct to the nearest degree.", _trig_fig(t, at, orient, labels, alab=TH),
            f"trig_inv_{r}", f"{_nearest_degree(t)}{DEG}")


def g_similar(it):
    ol, ow, k, where, u = it
    il, iw = ol * k, ow * k
    if where == "img":          # x is the image's width: x = scale factor x original width
        labs_o, labs_i, ans = (lab(ol, u), lab(ow, u)), (lab(il, u), X), iw
    else:                       # x is the original's width: x = image width / scale factor
        labs_o, labs_i, ans = (lab(ol, u), X), (lab(il, u), lab(iw, u)), ow
    return ("These rectangles are similar. Find the value of " + X + ".",
            (lambda s: D.similar_pair((ol, ow), (il, iw), labs_o, labs_i, H=int(118 * s))), "scale", lab(ans, u))


# ------------------------------------------------------------- strand B --
def g_a_circle(it):
    kind, v, u = it
    r = v / 2 if kind == "d" else v
    f_ = (lambda s: D.circle_d(lab(v, u), R=int(42 * s + 4), H=int(100 * s + 8))) if kind == "d" else \
         (lambda s: D.circle_r(lab(v, u), R=int(42 * s + 4), H=int(100 * s + 8)))
    return ("Find the area of this circle, correct to 1 decimal place.", f_, "a_circle",
            f"{d1(math.pi * r * r)} {u}²")


def g_arc(it):
    th, r, u = it
    return ("Find the arc length, correct to 1 decimal place.",
            (lambda s: D.sector(th, lab(r, u), H=int(108 * s / 0.9), hi_arc=True)), "arc",
            f"{d1(th / 360 * 2 * math.pi * r)} {u}")


def g_sector(it):
    th, r, u = it
    return ("Find the area of this sector, correct to 1 decimal place.",
            (lambda s: D.sector(th, lab(r, u), H=int(108 * s / 0.9))), "a_sector",
            f"{d1(th / 360 * math.pi * r * r)} {u}²")


def g_sa_rect(it):
    l, w, h, u = it
    return ("Find the surface area of this prism.",
            (lambda s: D.box(l, w, h, (lab(l, u), lab(w, u), lab(h, u)), H=int(124 * s))),
            "sa_rect", f"{nf(2 * (l * w + l * h + w * h))} {u}²")


def g_sa_cyl(it):
    r, h, dia, u = it
    SA = 2 * math.pi * r * r + 2 * math.pi * r * h
    rl = lab(2 * r, u) if dia else lab(r, u)
    return ("Find the surface area of this closed cylinder, correct to 1 decimal place.",
            (lambda s: D.cylinder(r, h, rl, lab(h, u), dia=dia, H=int(112 * s / 0.9))),
            "sa_cyl", f"{d1(SA)} {u}²")


def g_v_prism(it):
    if is_rev(it):              # face area and volume given, find the length: x = V / A
        _, face, L, u = it
        A = FACE_AREA[face]
        V = A * L
        k = min(0.8, 5.5 / L)
        return (f"The shaded face has an area of {nf(A)} {u}² and the volume is {nf(V)} {u}³. Find {X}.",
                (lambda s: D.prism_area(FACES[face], L, "", X, k=k, ang=20, H=int(112 * s / 0.9))),
                "v_prism", lab(V / A, u))
    face, L, u = it
    A = FACE_AREA[face]
    k = min(0.8, 5.5 / L)
    return (f"The shaded face has an area of {nf(A)} {u}². Find the volume of the prism.",
            (lambda s: D.prism_area(FACES[face], L, "", lab(L, u), k=k, ang=20, H=int(112 * s / 0.9))),
            "v_prism", f"{nf(A * L)} {u}³")


def g_v_cyl(it):
    r, h, dia, u = it
    rl = lab(2 * r, u) if dia else lab(r, u)
    return ("Find the volume of this cylinder, correct to 1 decimal place.",
            (lambda s: D.cylinder(r, h, rl, lab(h, u), dia=dia, H=int(112 * s / 0.9))),
            "v_cyl", f"{d1(math.pi * r * r * h)} {u}³")


def g_capacity(it):
    """V = lwh in cm^3, then 1000 cm^3 = 1 L."""
    l, w, h = it
    V = l * w * h
    L_ = V / 1000
    assert abs(L_ - round(L_)) < 1e-9, it                       # whole litres
    return ("How many litres does this tank hold?",
            (lambda s: D.box(l, w, h, (lab(l, "cm"), lab(w, "cm"), lab(h, "cm")), H=int(124 * s))),
            "cap_rect_l", f"{nf(L_)} L")


def g_v_pyramid(it):
    l, w, h, u = it
    V = Fraction(l * w * h, 3)
    assert V.denominator == 1, it                               # whole-number answer
    return ("Find the volume of this pyramid.",
            (lambda s: D.pyramid(l, w, h, (lab(l, u), lab(w, u), lab(h, u)), H=int(124 * s))),
            "v_pyramid", f"{nf(int(V))} {u}³")


def g_v_cone(it):
    r, h, dia, u = it
    rl = lab(2 * r, u) if dia else lab(r, u)
    return ("Find the volume of this cone, correct to 1 decimal place.",
            (lambda s: D.cone(r, h, rl, lab(h, u), dia=dia, H=int(118 * s / 0.9))),
            "v_cone", f"{d1(math.pi * r * r * h / 3)} {u}³")


# ------------------------------------------------------------- strand C --
def g_pct_change(it):
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
        txt, rows = "Find the new population of the town.", [["Population", nf(amt)], [word, P]]
    elif ctx == "plain$":
        txt, fig = "Find the new amount.", display(f"{word} {money(amt)} by {P}")
    else:
        txt, fig = "Find the new mass.", display(f"{word} {nf(amt)} kg by {P}")
    if fig is None:
        fig = dtable(rows)
    if ctx == "pop":
        assert abs(new - round(new)) < 1e-9, it
        ans = nf(new)
    elif ctx == "plainkg":
        ans = f"{nf(round(new, 3))} kg"
    else:
        if not is_cents(new):
            txt = txt[:-1] + ", to the nearest cent."
        ans = money(new)
    return txt, static(fig), "pct_inc" if d == "inc" else "pct_dec", ans


def g_pct_original(it):
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
    assert is_cents(orig), it                                   # tidy: whole cents at most
    return txt, static(fig), "pct_orig", (nf(round(orig, 2)) if kind == "part" else money(orig))


def g_profit_pct(it):
    c, sp = it
    diff = Fraction(str(sp)) - Fraction(str(c))
    pct = abs(diff) / Fraction(str(c)) * 100
    assert pct.denominator == 1 and diff != 0, it               # whole-number percentage
    word = "profit" if diff > 0 else "loss"
    return (f"Find the percentage {word}.", static(dtable([["Cost price", money(c)], ["Selling price", money(sp)]])),
            "profit_pct" if diff > 0 else "loss_pct", f"{int(pct)}%")


def _years(t, unit):
    return Fraction(str(t)) / (12 if unit == "months" else 1)


def g_interest(it):
    P, r, t, unit = it
    I = Fraction(str(P)) * Fraction(str(r)) / 100 * _years(t, unit)
    tt = f"{nf(t)} {unit if t != 1 else unit[:-1]}"
    txt = f"Find the simple interest on {money(P)} invested at {nf(r)}% per year for {tt}."
    return txt, None, "interest", money(float(I))


def g_wages(it):
    name, rate, hrs, ot, k = it
    pay = Fraction(str(rate)) * hrs + (Fraction(str(rate)) * Fraction(str(k)) * ot if k else 0)
    if not k:
        txt = (f"{name} earns {money(rate)} an hour and works {hrs} hours. How much does {name} earn?")
        return txt, None, "wage", money(float(pay))
    head = "Overtime hours (time-and-a-half)" if k == 1.5 else "Overtime hours (double time)"
    tab = dtable([["Hourly rate", money(rate)], ["Normal hours", str(hrs)], [head, str(ot)]])
    return (f"Find {name}’s total pay for the week.", static(tab), "wage_t15" if k == 1.5 else "wage_dt",
            money(float(pay)))


def g_salary(it):
    name, sal, per = it
    n, word = (52, "weekly") if per == "w" else (26, "fortnightly")
    pay = Fraction(sal, n)
    exact = is_cents(float(pay)) and (pay * 100).denominator == 1
    txt = (f"{name} earns a salary of {money(sal)} a year. Find {name}’s {word} pay"
           + ("." if exact else ", to the nearest cent."))
    return txt, None, "salary_w" if per == "w" else "salary_f", money(float(pay))


def g_commission(it):
    if it[0] == "base":
        _, name, base, r, sales = it
        pay = Fraction(base) + Fraction(str(r)) / 100 * Fraction(str(sales))
        tab = dtable([["Weekly base wage", money(base)], ["Commission", f"{nf(r)}% of sales"],
                      ["Sales this week", money(sales)]])
        return (f"Find {name}’s total pay for the week.", static(tab), "commission_base", money(float(pay)))
    name, r, sales = it
    com = Fraction(str(r)) / 100 * Fraction(str(sales))
    tab = dtable([["Sales", money(sales)], ["Commission rate", f"{nf(r)}%"]])
    return f"Find {name}’s commission.", static(tab), "commission", money(float(com))


def g_holiday_pay(it):
    name, w = it
    four = Fraction(str(w)) * 4
    total = four + four * Fraction(175, 1000)
    txt = (f"{name} earns {money(w)} a week. Find {name}’s total holiday pay for 4 weeks, "
           f"including 17.5% leave loading.")
    return txt, None, "holiday", money(float(total))


# ------------------------------------------------------------- strand D --
def _b(b):
    return f"<i>{b}</i>" if isinstance(b, str) else str(b)


def _term(c, b, e):
    """c b^e as HTML (c = 1 is not written)."""
    return f"{'' if c == 1 else c}{_b(b)}<sup>{e}</sup>"


def _ans_term(c, b, e):
    """Answer text: 6x^7, 3a^3, 2^7 (e = 1 is written as a plain letter)."""
    cs = "" if c == 1 else nf(c)
    if e == 1:
        return f"{cs}{b}"
    return f"{cs}{b}^{e}"


def g_idx(it):
    law, b, m, n, c1, c2 = it
    if law == "mult":
        disp, e, c, key = f"{_term(c1, b, m)} {TIMES} {_term(c2, b, n)}", m + n, c1 * c2, "idx_mult"
    elif law == "div":
        assert c1 % c2 == 0, it
        disp, e, c, key = f"{_term(c1, b, m)} {DIV} {_term(c2, b, n)}", m - n, c1 // c2, "idx_div"
    else:                        # (c1 b^m)^n
        disp, e, c, key = f"({_term(c1, b, m)})<sup>{n}</sup>", m * n, c1 ** n, "idx_pow"
    txt = "Simplify." if isinstance(b, str) else "Write as a single power."
    assert isinstance(b, str) or c == 1, it
    return txt, static(display(disp)), key, _ans_term(c, b, e)


def g_zero_neg(it):
    if it[0] == "neg":           # a^-n = 1/a^n (numerical base)
        _, b, n = it
        return ("Evaluate. Write your answer as a fraction.", static(display(f"{b}<sup>{MINUS}{n}</sup>")), "idx_neg",
                fstr(Fraction(1, b ** n)))
    form, args = it[1], it[2:]
    z = lambda b: f"{_b(b)}<sup>0</sup>"
    if form == "plus":
        disp, val = f"{z(args[0])} + {args[1]}", 1 + args[1]
    elif form == "minus":
        disp, val = f"{z(args[0])} {MINUS} {z(args[1])}", 0
    elif form == "pow":
        disp, val = z(args[0]), 1
    elif form == "coef":
        disp, val = f"{args[0]} {TIMES} {z(args[1])}", args[0]
    elif form == "var":
        disp, val = z(args[0]), 1
    elif form == "vcoef":
        disp, val = f"{args[0]}{z(args[1])}", args[0]
    else:                        # bracket: (k x)^0
        disp, val = f"({args[0]}{_b(args[1])})<sup>0</sup>", 1
    txt = "Simplify." if any(isinstance(a, str) for a in args) else "Evaluate."
    return txt, static(display(disp)), "idx_zero", nf(val)


def _sci_parts(v):
    """v = a x 10^n with 1 <= a < 10 (exact, from the decimal digits)."""
    d = Decimal(str(v)).normalize()
    n = d.adjusted()
    a = d.scaleb(-n)
    return a, n


def _sci_html(a, n):
    return f"{nf(float(a))} {TIMES} 10<sup>{str(n).replace('-', MINUS)}</sup>"


def g_sci(it):
    if it[0] == "to":
        v = it[1]
        a, n = _sci_parts(v)
        assert 1 <= a < 10
        return ("Write in scientific notation.", static(display(nf(v))), "sci",
                f"{nf(float(a))} {TIMES} 10^{str(n).replace('-', MINUS)}")
    _, a, n = it
    v = Decimal(str(a)).scaleb(n)
    assert 1 <= a < 10
    return ("Write as a basic numeral.", static(display(_sci_html(a, n))), "sci", nf(float(v)))


FS_FORM = {"vuat": ("fs_vuat", "<i>v</i> = <i>u</i> + <i>at</i>"),
           "perim": ("fs_perim", "<i>P</i> = 2(<i>l</i> + <i>w</i>)"),
           "cost": ("fs_cost", "<i>C</i> = 5 + 2.4<i>d</i>"),
           "temp": ("fs_temp", "<i>F</i> = 1.8<i>C</i> + 32"),
           "tri": ("fs_tri", "<i>A</i> = ½<i>bh</i>"),
           "line": ("fs_line", "<i>y</i> = <i>mx</i> + <i>c</i>")}


def _fs_solve(form, unk, g):
    """The formula solved for the unknown, in exact arithmetic."""
    F = {k: Fraction(str(v)) for k, v in g.items()}
    if form == "vuat":
        if unk == "v":
            return F["u"] + F["a"] * F["t"]
        if unk == "a":
            return (F["v"] - F["u"]) / F["t"]
    if form == "perim":
        if unk == "P":
            return 2 * (F["l"] + F["w"])
        return F["P"] / 2 - (F["l"] if unk == "w" else F["w"])
    if form == "cost":
        return 5 + Fraction("2.4") * F["d"] if unk == "C" else (F["C"] - 5) / Fraction("2.4")
    if form == "temp":
        return Fraction("1.8") * F["C"] + 32 if unk == "F" else (F["F"] - 32) / Fraction("1.8")
    if form == "tri":
        return 2 * F["A"] / F["b"]
    if form == "line":
        return (F["y"] - F["c"]) / F["m"]
    raise ValueError((form, unk))


def g_formula_sub(it):
    form, unk, g = it
    key, fhtml = FS_FORM[form]
    val = _fs_solve(form, unk, g)
    assert (val * 100).denominator == 1, it                     # tidy answer
    parts = [f"<i>{k}</i> = {nf(v)}" for k, v in g.items()]
    gtxt = parts[0] if len(parts) == 1 else ", ".join(parts[:-1]) + " and " + parts[-1]
    return (f"Find <i>{unk}</i> when {gtxt}.", static(display(fhtml)), key, nf(float(val)))


def g_ratio(it):
    amt, a, b, u = it
    one = Fraction(str(amt)) / (a + b)
    s1, s2 = one * a, one * b
    if u == "$":
        shown, ans = money(amt), f"{money(float(s1))} and {money(float(s2))}"
        assert is_cents(float(s1)) and is_cents(float(s2)), it
    else:
        shown, ans = f"{nf(amt)} {u}", f"{nf(float(s1))} {u} and {nf(float(s2))} {u}"
    return f"Share {shown} in the ratio {a} : {b}.", None, "ratio", ans


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


# ------------------------------------------------------------- strand E --
def g_gradient(it):
    p1, p2 = it
    m = Fraction(p2[1] - p1[1], p2[0] - p1[0])
    return ("Find the gradient of line AB.", (lambda s: D.plane_line(p1, p2, u=17 * s / 0.9 if s < 0.9 else 17, clear=True)),
            "gradient", fstr(m))


def _line_html(m, c):
    ms = {1: "", -1: MINUS}.get(m, nf(m))
    cs = "" if c == 0 else (f" + {nf(c)}" if c > 0 else f" {MINUS} {nf(-c)}")
    return f"<i>y</i> = {ms}<i>x</i>{cs}"


def g_linear(it):
    if it[0] == "si":
        _, m, c = it
        return ("State the gradient and the <i>y</i>-intercept.", static(display(_line_html(m, c))), "linear_si",
                f"gradient {nf(m)}, y-intercept {nf(c)}")
    m, c, x = it
    return (f"Find the value of <i>y</i> when <i>x</i> = {nf(x)}.", static(display(_line_html(m, c))), "linear",
            nf(round(m * x + c, 6)))


def g_mean(it):
    if it[0] == "freq":
        _, xs, fs = it
        m = Fraction(sum(x * f for x, f in zip(xs, fs)), sum(fs))
        tab = dtable([["Score"] + [str(x) for x in xs], ["Frequency"] + [str(f) for f in fs]], tight=True)
        if (m * 10).denominator == 1:
            return "Find the mean score.", static(tab), "mean_freq", nf(float(m))
        return ("Find the mean score, correct to 1 decimal place.", static(tab), "mean_freq", d1(float(m)))
    vals, head, noun = it
    m = sum(vals) / len(vals)
    return (f"Find the mean of these {noun}.", static(dtable([[head] + [nf(v) for v in vals]])), "mean", nf(round(m, 2)))


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


def g_freq(it):
    if it[0] == "exp":
        _, txt, p, n = it
        e = p * n
        assert e.denominator == 1, it
        return txt, None, "freq_exp", nf(int(e))
    _, txt, word, f, n = it
    r = Fraction(f, n)
    dec = f / n
    ans = nf(dec) if (r * 100).denominator == 1 else fstr(r)
    if (r * 100).denominator == 1 and r.denominator != 1:
        ans += f" (or {fstr(r)})"
    return txt, None, "freq_rel", ans


def ans_html(ans, fam=None):
    """An answer as HTML for the answer key and gallery: x^7 -> x with a superscript 7, pronumerals italic."""
    import html as _h
    a = _h.escape(ans)
    if fam in ("idx", "zero_neg"):
        a = re.sub(r"(?<![A-Za-z])([a-z])(?![a-z])", r"<i>\1</i>", a)
    a = re.sub(r"\^([" + MINUS + r"\-]?\d+)", r"<sup>\1</sup>", a)
    a = re.sub(r"\by-intercept", "<i>y</i>-intercept", a)
    return a


GEN = {"pyth_hyp": g_pyth_hyp, "pyth_short": g_pyth_short, "trig_ratio": g_trig_ratio, "trig_top": g_trig_top,
       "trig_bottom": g_trig_bottom, "trig_angle": g_trig_angle, "similar": g_similar,
       "a_circle": g_a_circle, "arc": g_arc, "sector": g_sector, "sa_rect": g_sa_rect, "sa_cyl": g_sa_cyl,
       "v_prism": g_v_prism, "v_cyl": g_v_cyl, "capacity": g_capacity, "v_pyramid": g_v_pyramid, "v_cone": g_v_cone,
       "pct_change": g_pct_change, "pct_original": g_pct_original, "profit_pct": g_profit_pct,
       "interest": g_interest, "wages": g_wages, "salary": g_salary, "commission": g_commission,
       "holiday_pay": g_holiday_pay,
       "idx": g_idx, "zero_neg": g_zero_neg, "sci": g_sci, "formula_sub": g_formula_sub, "ratio": g_ratio,
       "speed": g_speed,
       "gradient": g_gradient, "linear": g_linear, "mean": g_mean, "prob": g_prob, "prob_not": g_prob_not,
       "freq": g_freq}


# ============================================================== scheduler ==
STRANDS = {
    "A": ["pyth_hyp", "pyth_short", "trig_ratio", "trig_top", "trig_bottom", "trig_angle", "similar"],
    "B": ["a_circle", "arc", "sector", "sa_rect", "sa_cyl", "v_prism", "v_cyl", "capacity", "v_pyramid", "v_cone"],
    "C": ["pct_change", "pct_original", "profit_pct", "interest", "wages", "salary", "commission", "holiday_pay"],
    "D": ["idx", "zero_neg", "sci", "formula_sub", "ratio", "speed"],
    "E": ["gradient", "linear", "mean", "prob", "prob_not", "freq"],
}
TERM4_ONLY = {"v_pyramid", "v_cone"}            # new Standard 2 formulas, printed even in Term 4
STRAND_NAMES = {"A": "Right-angled triangles and similar figures", "B": "Area, surface area and volume",
                "C": "Percentages and money", "D": "Indices, formulas and rates",
                "E": "Straight-line graphs, data and probability"}
MIN_PER_TERM = 3
# SPECIAL items: fam -> (is special?, period, terms). In those families the 2nd, 2nd + period, ...
# appearance in a term is a special item and the others are not.
SPECIAL = {"v_prism": (is_rev, 4, (1, 2, 3, 4)), "speed": (is_rev, 4, (1, 2, 3, 4)),
           "trig_top": (is_elev, 3, (3, 4)), "trig_angle": (is_elev, 3, (3, 4))}


def families(strand, term):
    return [f for f in STRANDS[strand] if term == 4 or f not in TERM4_ONLY]


def seed(*parts):
    return zlib.crc32("|".join(map(str, parts)).encode())


def strand_sequence(strand, term, n=30):
    """Whole shuffled cycles of the strand's families, so every family comes round at least every
    len(strand) + 1 sessions (at least 3 times a term). Never the same family in consecutive sessions;
    a two-session gap is preferred where a cycle meets the next. In Term 4, Week 1 of strand B
    includes both the pyramid and the cone (so they show in the sample)."""
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
                    if seq and (seq[-1] == cyc[0] or any(c in seq[-gap:] for c in cyc[:gap])):
                        continue
                    found = cyc
                    break
                if found:
                    break
            if not found:
                break
            seq += found
        seq = seq[:n]
        if strand == "B" and term == 4 and not TERM4_ONLY <= set(seq[:3]):
            continue
        if len(seq) == n and all(a != b for a, b in zip(seq, seq[1:])) and \
                all(seq.count(f) >= MIN_PER_TERM for f in fams):
            return seq
    raise RuntimeError(f"no valid rotation for strand {strand}, term {term}")


def qsig(q):
    """What makes two questions the same: the question text and the multiset of numbers and words
    printed in its figure (so a repeat is caught whatever the figure's drawing scale)."""
    txt = plain(q.text)
    labs = sorted(t.strip() for t in re.findall(r">([^<>]+)<", q.fig or "") if t.strip())
    return txt, tuple(labs)


class Pools:
    """Draws items without replacement (no question repeats within a term). Within a family it
    prefers the formula used least so far this term (so sub-formulas rotate: sin/cos/tan, inc/dec,
    zero/negative index, ...). In SPECIAL families the 2nd, 2nd + period, ... appearance is the special
    item (working backwards, or an angle of elevation/depression) and the others are not."""

    def __init__(self, term):
        self.term = term
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

    def draw(self, fam, k):
        avail = [it for it in self.items(fam) if (fam, repr(it)) not in self.used]
        if not avail:
            raise RuntimeError(f"term {self.term}: the {fam} pool has run out (questions may not repeat)")
        pred, period, terms = SPECIAL.get(fam, (lambda it: False, 4, ()))
        want = self.term in terms and k % period == 1
        pref = [it for it in avail if pred(it) == want] or avail
        use = {repr(it): self.keys.get(GEN[fam](it)[2], 0) for it in pref}
        lo = min(use.values())
        it = self.rng.choice([it for it in pref if use[repr(it)] == lo])
        self.used.add((fam, repr(it)))
        return it


def generated_sessions(term):
    """All 30 sessions of a term (Weeks 1-10 x Sessions 1-3)."""
    seqs = {X_: strand_sequence(X_, term) for X_ in "ABCDE"}
    pools = Pools(term)
    sigs = set()
    out = []
    for idx in range(30):
        week, sess = idx // 3 + 1, idx % 3 + 1
        qs = []
        for X_ in "ABCDE":
            fam = seqs[X_][idx]
            k = seqs[X_][:idx].count(fam)          # times the family has already appeared this term
            q = None
            for attempt in range(12):              # skip an item whose figure cannot be drawn cleanly,
                it = pools.draw(fam, k)            # or that repeats a question already in the term
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
            q.show_formula = fam in TERM4_ONLY
            sigs.add(qsig(q))
            pools.keys[q.formula] = pools.keys.get(q.formula, 0) + 1
            qs.append(q)
        out.append(Session(term, week, sess, qs))
    for X_, seq in seqs.items():
        for fam in families(X_, term):
            assert seq.count(fam) >= MIN_PER_TERM, (term, fam, seq.count(fam))
    return out, seqs
