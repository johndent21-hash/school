# -*- coding: utf-8 -*-
"""The Fractal Five - question generators and scheduler (Weeks 2-10 of each term).

Week 1 of every term is the approved sample (samples.py). Weeks 2-10 are generated:
every session takes one question from each strand, rotating through the strand's
formulas so each one comes back every few sessions and never twice in a row:

  A geometry   pyth_hyp pyth_short ang_tri ang_quad ang_poly ang_ext ang_line ang_par
  B area       a_rect a_tri a_para a_trap a_kite circ a_circle a_semi (semicircles + sectors)
  C volume/SA  v_prism v_rect v_cyl sa_rect sa_tri sa_cyl capacity
  D number     idx (incl. zero index) distrib pct_qty pct_change profit speed scale pct_incdec pct_orig
  E stats etc  prob prob_not mean range gradient linear

Level 1 (Terms 1-2): whole numbers, Pythagorean triples, tidy answers.
Level 2 (Terms 3-4): the level-2 set (decimals, rounding, negatives, algebra) plus half
of the level-1 set, so it stays simple while stretching a little.
Working backwards: a_rect, a_tri, a_para, v_rect, v_prism, speed (and circ at Level 2) mix in
("rev", ...) items that give the formula's result and label the unknown x on the diagram; the
scheduler makes about 1 in 4 of each family's questions one of these.
Every answer is computed here from the same numbers that label the diagram; verify_answers.py
recomputes them independently from the printed question.
"""
import math
import random
import zlib
from fractions import Fraction

import wdia as D
from formulas import FX
from wu import Q, Session, display, dtable, pw, frac, TIMES, DIV, MINUS, DEG

X = "<i>x</i>"
POLY = {5: "pentagon", 6: "hexagon", 7: "heptagon", 8: "octagon", 9: "nonagon", 10: "decagon",
        12: "dodecagon", 15: "15-sided polygon"}


# ------------------------------------------------------------------ helpers --
def nf(v):
    """Plain number: integers without a decimal point, otherwise up to 3 dp; true minus sign."""
    if abs(v - round(v)) < 1e-9:
        s = str(int(round(v)))
    else:
        s = f"{v:.3f}".rstrip("0").rstrip(".")
    return s.replace("-", MINUS)


def money(v):
    return f"${int(round(v))}" if abs(v - round(v)) < 1e-9 else f"${v:.2f}"


def d1(v):
    return f"{v:.1f}"


def fstr(fr_):
    fr_ = Fraction(fr_)
    s = str(fr_.numerator) if fr_.denominator == 1 else f"{fr_.numerator}/{fr_.denominator}"
    return s.replace("-", MINUS)


def lab(v, u):
    return f"{nf(v)} {u}"


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
L1["pyth_hyp"] = [(12, 5, "cm", 0), (12, 9, "cm", 1), (15, 8, "cm", 2), (16, 12, "m", 3), (20, 15, "cm", 0),
                  (24, 7, "cm", 1), (24, 10, "m", 2), (21, 20, "cm", 3), (4, 3, "m", 1), (30, 16, "cm", 0)]
L2["pyth_hyp"] = [(9, 4, "cm", 0), (10, 6, "cm", 1), (8, 3, "m", 2), (11, 7, "cm", 3), (6, 2.5, "m", 0),
                  (6, 4.5, "cm", 1), (11, 9, "cm", 2), (8, 6.5, "m", 3), (13, 8, "cm", 0), (12, 5.5, "cm", 1)]
L1["pyth_short"] = [(10, 6, "cm", 0), (17, 15, "cm", 1), (25, 7, "cm", 2), (15, 9, "m", 3), (20, 12, "cm", 0),
                    (26, 10, "cm", 1), (5, 3, "m", 2), (29, 20, "cm", 3), (25, 15, "cm", 0), (13, 12, "cm", 1)]
L2["pyth_short"] = [(12, 7, "cm", 0), (15, 8, "cm", 1), (10, 4, "m", 2), (9, 5, "cm", 3), (14, 6, "cm", 0),
                    (11, 7, "m", 1), (20, 9, "cm", 2), (13, 6.5, "cm", 3), (8.5, 4, "cm", 0), (16, 11, "m", 1)]
L1["ang_tri"] = [(58, 74, "apex"), (46, 62, "apex"), (38, 76, "apex"), (54, 68, "apex"), (50, 60, "left"),
                 (35, 85, "apex"), (40, 70, "right"), (62, 53, "apex"), (70, 45, "left"), (44, 82, "right")]
L2["ang_tri"] = [(47, 68, "apex"), (33, 94, "apex"), (51, 77, "left"), (64, 58, "right"), (29, 103, "apex"),
                 (57, 57, "apex"), (36, 108, "apex"), (81, 43, "left"), (66, 49, "right")]
L1["ang_quad"] = [((120, 60, 110, 70), 3), ((95, 85, 100, 80), 0), ((70, 110, 85, 95), 2), ((130, 65, 90, 75), 1),
                  ((105, 80, 115, 60), 3), ((92, 88, 105, 75), 2), ((115, 70, 95, 80), 0),
                  ((100, 75, 105, 80), 1), ((85, 95, 120, 60), 3)]
L2["ang_quad"] = [((97, 83, 112, 68), 2), ((124, 57, 103, 76), 0), ((88, 99, 107, 66), 3), ((131, 72, 84, 73), 1),
                  ((76, 118, 93, 73), 2), ((109, 64, 121, 66), 0), ((93, 79, 116, 72), 3)]
L1["ang_poly"] = [(5, "sum"), (7, "sum"), (8, "sum"), (10, "sum"), (12, "sum"), (9, "sum")]
L2["ang_poly"] = [(6, "each"), (5, "each"), (10, "each"), (12, "each"), (9, "each"), (7, "sum"), (15, "sum")]
L1["ang_ext"] = [(38, 57, "ext"), (60, 45, "ext"), (48, 62, "ext"), (55, 70, "ext"), (30, 75, "ext"),
                 (44, 58, "ext"), (66, 49, "ext"), (52, 63, "ext"), (35, 80, "ext")]
L2["ang_ext"] = [(45, 75, "left"), (62, 48, "apex"), (37, 86, "ext"), (71, 34, "left"), (54, 67, "apex"),
                 (29, 96, "ext"), (58, 58, "ext")]

L1["a_rect"] = [(9, 6, "cm"), (12, 5, "m"), (8, 7, "cm"), (15, 4, "cm"), (11, 9, "m"), (14, 3, "cm"),
                (10, 8, "cm"), (13, 6, "m"),
                ("rev", 8, 6, "cm", "l"), ("rev", 12, 7, "m", "w"), ("rev", 9, 5, "cm", "l")]
L2["a_rect"] = [(12.5, 4, "m"), (8.5, 6, "cm"), (14, 3.5, "cm"), (6.4, 5, "m"), (9, 7.5, "cm"), (11, 2.5, "m"),
                (7.2, 4, "cm"),
                ("rev", 7, 4.5, "m", "l"), ("rev", 12.5, 6, "cm", "w")]
L1["a_tri"] = [(12, 5, "cm"), (14, 8, "cm"), (16, 7, "m"), (11, 6, "cm"), (8, 6, "cm"), (10, 8, "m"),
               (15, 4, "cm"), (18, 10, "cm"),
               ("rev", 10, 6, "cm", "h"), ("rev", 16, 6, "cm", "b"), ("rev", 8, 7, "m", "h")]
L2["a_tri"] = [(11, 7, "cm"), (13, 6, "m"), (9, 5, "cm"), (15, 7, "cm"), (7.5, 4, "m"), (17, 9, "cm"),
               (12, 6.5, "cm"),
               ("rev", 9, 5.5, "cm", "h"), ("rev", 7.5, 5, "m", "b")]
L1["a_para"] = [(10, 6, 3, "cm"), (12, 4, 3, "cm"), (8, 7, 2.5, "m"), (11, 5, 3, "cm"), (7, 6, 2, "cm"),
                (14, 5, 3.5, "m"), (15, 8, 4, "cm"),
                ("rev", 9, 6, 2.5, "cm", "h"), ("rev", 12, 5, 3, "m", "b"), ("rev", 8, 7, 2, "cm", "h")]
L2["a_para"] = [(7.5, 4, 2, "cm"), (9, 6.5, 2.5, "m"), (12, 3.5, 3, "cm"), (8.4, 5, 2.4, "cm"),
                (10, 4.5, 3, "m"), (13, 6, 4, "cm"),
                ("rev", 6.5, 4, 2, "cm", "b"), ("rev", 11, 3.5, 3, "m", "h")]
L1["a_trap"] = [(9, 5, 3, 2, "cm"), (14, 8, 6, 3, "cm"), (11, 7, 4, 1.5, "m"), (16, 10, 5, 3, "cm"),
                (12, 6, 4, 3, "cm"), (10, 4, 5, 3, "m"), (13, 9, 6, 2, "cm")]
L2["a_trap"] = [(13, 7, 4.5, 3, "cm"), (9.5, 6.5, 4, 1.5, "m"), (15, 9, 5.5, 3, "cm"), (11, 6, 3.5, 2.5, "cm"),
                (12, 7.5, 5, 2, "m"), (14, 10, 3, 2, "cm")]
L1["a_kite"] = [(3, 6, 4, "cm"), (4, 4, 3, "cm"), (2, 6, 2.5, "m"), (6, 6, 4, "cm"), (3, 7, 3, "cm"),
                (5, 5, 3, "m"), (2.5, 7.5, 4, "cm")]
L2["a_kite"] = [(3, 7.5, 3.5, "cm"), (4.5, 4.5, 2.5, "cm"), (2.5, 6, 3.5, "m"), (5.5, 5.5, 3.5, "cm"),
                (3.5, 8, 4.5, "cm")]
L1["circ"] = [("d", 8, "cm"), ("d", 12, "cm"), ("r", 5, "cm"), ("d", 14, "m"), ("r", 9, "cm"), ("r", 3, "m"),
              ("d", 20, "cm"), ("r", 4, "cm")]
L2["circ"] = [("d", 7.5, "cm"), ("r", 2.5, "m"), ("d", 18, "cm"), ("r", 6.5, "cm"), ("d", 11, "m"), ("r", 12, "cm"),
              ("rev", "d", 40, "cm"), ("rev", "r", 75, "cm"), ("rev", "d", 100, "m")]
L1["a_circle"] = [("r", 6, "cm"), ("r", 3, "m"), ("r", 5, "cm"), ("r", 10, "cm"), ("r", 7, "m"), ("r", 2, "cm")]
L2["a_circle"] = [("r", 2.5, "cm"), ("r", 4.5, "m"), ("r", 8.5, "cm"), ("d", 12, "cm"), ("d", 9, "m"), ("d", 15, "cm")]
# a_semi covers semicircles (A = 1/2 pi r^2) and, since Oct 2026, quadrants and other sectors
# ("sec", angle, r, unit), which use A = theta/360 x pi r^2
L1["a_semi"] = [(4, "cm"), (10, "cm"), (5, "m"), (8, "cm"), (3, "cm"), (7, "m"),
                ("sec", 90, 6, "cm"), ("sec", 60, 9, "cm"), ("sec", 120, 6, "cm"), ("sec", 270, 5, "cm"),
                ("sec", 90, 10, "m"), ("sec", 45, 8, "cm")]
L2["a_semi"] = [(6.5, "cm"), (9, "m"), (2.5, "cm"), (12, "cm"), (4.5, "m"),
                ("sec", 72, 5, "cm"), ("sec", 150, 4.5, "m"), ("sec", 240, 3.5, "cm"), ("sec", 90, 7.5, "cm"),
                ("sec", 40, 12, "cm"), ("sec", 210, 2.5, "m")]

L1["v_prism"] = [("tri20", 5, "cm"), ("trap24", 5, "cm"), ("house20", 6, "cm"), ("para15", 8, "cm"),
                 ("rtri15", 4, "m"), ("tri18", 7, "cm"), ("trap15", 10, "cm"), ("tri12", 9, "cm"), ("house20", 9, "m"),
                 ("rev", "tri12", 8, "cm"), ("rev", "trap15", 6, "cm"), ("rev", "house20", 7, "m")]
L2["v_prism"] = [("tri18", 4.5, "cm"), ("trap24", 2.5, "m"), ("house20", 3.5, "cm"), ("rtri15", 6.5, "cm"),
                 ("para15", 7, "m"), ("tri20", 5.5, "cm"), ("trap15", 8.5, "cm"),
                 ("rev", "tri18", 5.5, "cm"), ("rev", "para15", 4.5, "m")]
L1["v_rect"] = [(6, 3, 2, "cm"), (8, 5, 2, "cm"), (10, 4, 3, "m"), (7, 2, 3, "cm"), (6, 6, 2, "cm"), (9, 4, 2, "m"),
                (4, 4, 4, "cm"), (12, 3, 2, "cm"), (5, 5, 3, "m"),
                ("rev", 6, 4, 5, "cm", "h"), ("rev", 10, 3, 2, "cm", "l"), ("rev", 5, 5, 4, "m", "w")]
L2["v_rect"] = [(8, 3, 1.5, "cm"), (12, 2.5, 4, "cm"), (5.5, 4, 2, "m"), (6, 4.5, 2, "cm"), (10, 3.5, 2, "cm"),
                (9, 2.5, 3, "m"), (7.5, 4, 3, "cm"),
                ("rev", 8, 2.5, 3, "cm", "h"), ("rev", 4.5, 4, 6, "m", "l")]
# (the 1.5 m radius is now given as a 3 m diameter, so every Level 1 label is a whole number)
L1["v_cyl"] = [(2, 9, False, "cm"), (6, 4, False, "cm"), (4, 10, False, "m"), (5, 6, False, "cm"), (3, 7, True, "cm"),
               (5, 4, True, "cm"), (1.5, 8, True, "m"), (7, 5, False, "cm"), (2, 5, True, "cm")]
L2["v_cyl"] = [(2.5, 8, False, "cm"), (4.5, 6, False, "m"), (3.5, 10, False, "cm"), (4.5, 7, True, "cm"),
               (6.5, 3, False, "cm"), (2.5, 12, True, "m")]
L1["sa_rect"] = [(5, 4, 3, "cm"), (8, 2, 3, "cm"), (10, 5, 2, "m"), (4, 4, 4, "cm"), (7, 3, 2, "cm"), (6, 4, 2, "m"),
                 (9, 3, 3, "cm"), (5, 5, 2, "cm")]
L2["sa_rect"] = [(6, 2.5, 4, "cm"), (8, 4.5, 2, "m"), (5.5, 3, 2, "cm"), (10, 1.5, 6, "cm"), (7, 5, 2.5, "m"),
                 (12, 4, 1.5, "cm")]
L1["sa_tri"] = [(4, 3, 5, 6, "cm"), (4, 3, 5, 12, "cm"), (8, 6, 10, 5, "cm"), (12, 5, 13, 8, "m"),
                (12, 5, 13, 10, "cm"), (8, 6, 10, 8, "cm"), (4, 3, 5, 8, "m"), (8, 6, 10, 7, "cm")]
L2["sa_tri"] = [(12, 9, 15, 9, "cm"), (6, 4.5, 7.5, 8, "cm"), (8, 6, 10, 6.5, "m"), (4, 3, 5, 7.5, "cm"),
                (12, 5, 13, 8, "cm"), (15, 8, 17, 10, "cm")]

# zero index (a^0 = 1): ("zero", form, ...) - form "pow" b^0, "mult" b^0 x b^n, "coef" k x b^0 (k b^0 for a
# pronumeral b), "sum" b^0 + c^0, "bracket" (k b)^0
L1["idx"] = [("mult", 2, 3, 4), ("mult", 3, 2, 5), ("mult", 10, 4, 3), ("div", 3, 8, 2), ("div", 2, 9, 4),
             ("div", 10, 7, 3), ("pow", 2, 3, 4), ("pow", 5, 2, 3), ("pow", 3, 4, 2), ("mult", 7, 3, 3),
             ("div", 6, 5, 3),
             ("zero", "pow", 7), ("zero", "mult", 5, 3), ("zero", "coef", 3, 10), ("zero", "sum", 4, 9)]
L2["idx"] = [("mult", "x", 5, 4), ("mult", "m", 6, 2), ("div", "y", 8, 3), ("div", "k", 10, 4), ("pow", "n", 3, 4),
             ("pow", "p", 2, 6), ("mult", "a", 3, 7), ("div", 4, 9, 5), ("pow", 7, 2, 5),
             ("zero", "pow", "x"), ("zero", "coef", 6, "y"), ("zero", "bracket", 3, "m"), ("zero", "mult", 2, 5)]
L1["distrib"] = [("3(<i>x</i> + 5)", "3x + 15"), ("5(<i>x</i> + 2)", "5x + 10"), ("2(<i>x</i> + 7)", "2x + 14"),
                 ("6(<i>a</i> + 1)", "6a + 6"), ("7(<i>y</i> + 3)", "7y + 21"), ("3(2<i>x</i> + 4)", "6x + 12"),
                 ("2(3<i>x</i> + 5)", "6x + 10"), ("4(<i>m</i> + 9)", "4m + 36")]
L2["distrib"] = [(f"3(2<i>x</i> {MINUS} 5)", f"6x {MINUS} 15"), (f"4(3 {MINUS} <i>x</i>)", f"12 {MINUS} 4x"),
                 (f"5(<i>x</i> {MINUS} 4)", f"5x {MINUS} 20"), ("<i>x</i>(<i>x</i> + 3)", "x\u00b2 + 3x"),
                 (f"{MINUS}2(<i>x</i> + 6)", f"{MINUS}2x {MINUS} 12"), (f"6(2<i>a</i> {MINUS} 1)", f"12a {MINUS} 6"),
                 ("<i>a</i>(4 + <i>a</i>)", "4a + a\u00b2")]
L1["pct_qty"] = [(25, 64, "$"), (10, 350, "$"), (20, 45, "kg"), (12, 50, "$"), (5, 180, "m"), (40, 75, "$"),
                 (30, 90, "L"), (75, 48, "$"), (50, 86, "kg")]
L2["pct_qty"] = [(17.5, 200, "$"), (8, 65, "$"), (62, 150, "kg"), (125, 60, "$"), (2.5, 480, "m"), (15, 36, "$"),
                 (45, 120, "L")]
L1["pct_change"] = [(50, 60, "price"), (120, 90, "price"), (40, 46, "price"), (200, 170, "price"), (25, 30, "price"),
                    (90, 117, "price"), (80, 100, "price"), (60, 48, "price"), (1200, 1500, "visitors")]
L2["pct_change"] = [(64, 80, "price"), (75, 63, "price"), (45, 54, "price"), (160, 136, "price"), (250, 285, "price"),
                    (32, 40, "price"), (48, 42, "price"), (800, 680, "visitors")]
L1["profit"] = [(45, 72), (200, 260), (350, 315), (18, 30), (95, 80), (240, 300), (60, 45), (125, 160)]
L2["profit"] = [(18, 25.5), (12.4, 20), (84.5, 70), (1250, 1480), (36.8, 45), (65, 52.75)]
# ("rev", d, d-unit, t, t-unit, who, speed unit, unknown): the speed is given; find the distance or the time
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
L1["scale"] = [(3, 12, "cm"), (5, 15, "cm"), (6, 9, "cm"), (2, 7, "cm"), (8, 20, "cm"), (3, 9, "m"), (5, 12, "cm")]
L2["scale"] = [(10, 4, "cm"), (12, 3, "cm"), (7, 10.5, "cm"), (6, 15, "m"), (8, 2, "cm"), (4, 11, "cm")]

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
L1["mean"] = [((8, 3, 5, 6, 8), "Scores", "scores"), ((21, 18, 24, 15, 22), "Scores", "scores"),
              ((7, 9, 4, 10, 5), "Goals", "goal tallies"), ((14, 11, 17, 12, 16), "Marks", "marks"),
              ((30, 25, 35, 20, 40), "Scores", "scores"), ((6, 2, 9, 4, 9), "Goals", "goal tallies"),
              ((13, 19, 16, 10, 17), "Scores", "scores"), ((45, 52, 48, 50, 55), "Marks", "marks")]
L2["mean"] = [((2.4, 3.1, 2.8, 3.5, 3.2), "Metres", "lengths"), ((8, 11, 7, 14, 10), "Scores", "scores"),
              ((65, 72, 58, 80, 70), "Marks", "marks"), ((1.5, 2.5, 3, 2, 1), "Hours", "times"),
              ((17, 23, 20, 26, 19), "Scores", "scores"), ((9.5, 8, 10.5, 12, 7), "kg", "masses")]
L1["range"] = [((35, 48, 29, 52, 41), "Scores", "scores", ""), ((5, 11, 8, 2, 9), "Goals", "goal tallies", ""),
               ((61, 47, 55, 70, 52), "Marks", "marks", ""), ((9, 3, 12, 7, 5), "Scores", "scores", ""),
               ((104, 96, 118, 101, 99), "cm", "heights", " cm"), ((40, 38, 45, 33, 41), "Scores", "scores", "")]
L2["range"] = [((-3, 5, 2, -1, 7), "\u00b0C", "temperatures", "\u00b0C"),
               ((1.62, 1.48, 1.75, 1.53, 1.69), "Metres", "heights", " m"),
               ((-8, -2, -5, 3, 1), "\u00b0C", "temperatures", "\u00b0C"),
               ((6.5, 9.2, 7.8, 5.9, 8.4), "Seconds", "times", " s"),
               ((250, 310, 275, 198, 289), "Visitors", "visitor numbers", "")]
L1["gradient"] = [((0, 1), (2, 5)), ((1, 1), (3, 5)), ((1, 2), (3, 4)), ((0, 1), (1, 4)), ((1, 1), (2, 4)),
                  ((0, 2), (1, 5)), ((2, 1), (3, 4)), ((0, 1), (3, 4))]
L2["gradient"] = [((0, 4), (4, 2)), ((1, 5), (3, 1)), ((0, 1), (4, 3)), ((0, 5), (1, 2)), ((1, 1), (3, 4)),
                  ((0, 4), (3, 1)), ((0, 2), (4, 5))]
L1["linear"] = [(3, 1, 4), (2, 5, 3), (4, -1, 2), (5, 2, 1), (2, -3, 5), (3, 4, 0), (6, 1, 2), (10, -4, 1)]
L2["linear"] = [(-2, 10, 3), (0.5, 4, 6), (-3, 2, -1), (4, -7, 2.5), (-1, 6, -4), (1.5, -2, 4)]


# --------------------------------------------------- new families (Oct 2026) --
# ang_line: ("str", parts, unknown index, below) | ("pt", parts, unknown index, rot)
#           | ("vop", angle, tilt, side of x: "L" or "R")
L1["ang_line"] = [("str", (125, 55), 1, False), ("str", (40, 75, 65), 1, False), ("str", (48, 132), 0, True),
                  ("str", (110, 70), 0, False), ("pt", (140, 95, 125), 1, 90), ("pt", (100, 120, 140), 2, 30),
                  ("pt", (80, 110, 70, 100), 3, 20), ("vop", 48, 0, "L"), ("vop", 115, 5, "R"), ("vop", 72, -8, "L")]
L2["ang_line"] = [("str", (37, 68, 75), 2, False), ("str", (143, 37), 1, True), ("str", (29, 104, 47), 0, False),
                  ("str", (42.5, 137.5), 1, False), ("pt", (127, 85, 148), 0, 100),
                  ("pt", (95, 63, 118, 84), 2, 15), ("pt", (156, 117, 87), 1, 60),
                  ("vop", 37, 4, "R"), ("vop", 124, -6, "L"), ("vop", 81, 8, "R")]
# ang_par: (relationship, transversal angle, (vertex, quadrant) of the given angle, (vertex, quadrant) of x)
L1["ang_par"] = [("corr", 62, ("T", "UR"), ("B", "UR")), ("corr", 115, ("B", "LL"), ("T", "LL")),
                 ("corr", 50, ("T", "LR"), ("B", "LR")), ("alt", 55, ("T", "LL"), ("B", "UR")),
                 ("alt", 70, ("B", "UL"), ("T", "LR")), ("alt", 125, ("T", "LL"), ("B", "UR")),
                 ("coint", 70, ("T", "LR"), ("B", "UR")), ("coint", 58, ("T", "LL"), ("B", "UL")),
                 ("coint", 115, ("B", "UR"), ("T", "LR"))]
L2["ang_par"] = [("corr", 47, ("B", "UL"), ("T", "UL")), ("corr", 128, ("T", "LR"), ("B", "LR")),
                 ("alt", 38, ("T", "LR"), ("B", "UL")), ("alt", 66, ("B", "UR"), ("T", "LL")),
                 ("alt", 72.5, ("T", "LR"), ("B", "UL")), ("coint", 43, ("T", "LL"), ("B", "UL")),
                 ("coint", 104, ("B", "UR"), ("T", "LR"))]
# pct_incdec: (inc/dec, amount, percentage, context)
L1["pct_incdec"] = [("dec", 120, 25, "sale"), ("inc", 80, 15, "price"), ("inc", 60, 10, "plain$"),
                    ("dec", 250, 20, "plainkg"), ("inc", 2400, 5, "pop"), ("dec", 45, 20, "sale"),
                    ("inc", 900, 4, "wage"), ("dec", 70, 10, "plain$"), ("dec", 400, 15, "sale"),
                    ("inc", 150, 30, "price")]
L2["pct_incdec"] = [("inc", 64.5, 12, "price"), ("dec", 89.95, 20, "sale"), ("inc", 45.5, 10, "gst"),
                    ("dec", 1250, 7.5, "plain$"), ("inc", 36.8, 15, "plainkg"), ("dec", 59.99, 35, "sale"),
                    ("inc", 3840, 2.5, "pop")]
# pct_orig: ("disc", sale price, discount %, item) | ("inc", new amount, increase %, noun) | ("part", part, %)
L1["pct_orig"] = [("disc", 64, 20, "jacket"), ("inc", 440, 10, "rent"), ("part", 45, 15), ("disc", 90, 25, "pair of shoes"),
                  ("inc", 252, 5, "price"), ("part", 18, 30), ("disc", 56, 30, "backpack"), ("inc", 1380, 15, "wage"),
                  ("part", 36, 40)]
L2["pct_orig"] = [("disc", 70, 12.5, "jacket"), ("inc", 535, 7, "rent"), ("part", 24.5, 35), ("disc", 47.6, 15, "helmet"),
                  ("inc", 81.9, 5, "price"), ("disc", 33.15, 35, "cap"), ("part", 9.6, 12)]
# sa_cyl: (r, h, diameter labelled?, unit)
L1["sa_cyl"] = [(3, 10, False, "cm"), (5, 8, False, "cm"), (4, 6, True, "cm"), (2, 9, False, "m"), (6, 5, True, "cm"),
                (7, 3, False, "cm"), (10, 4, True, "cm"), (3, 3, False, "m")]
L2["sa_cyl"] = [(2.5, 8, False, "cm"), (4.5, 6, True, "cm"), (1.5, 12, False, "m"), (6, 2.5, False, "cm"),
                (3.5, 9.5, True, "cm"), (8, 4.5, False, "cm")]
# capacity: ("box", l, w, h, unit, answer unit) | ("cyl", r, h, diameter labelled?, unit, answer unit)
L1["capacity"] = [("box", 50, 40, 30, "cm", "L"), ("box", 8, 5, 4, "cm", "mL"), ("box", 3, 2, 1, "m", "L"),
                  ("box", 40, 25, 20, "cm", "L"), ("box", 10, 6, 5, "cm", "mL"), ("box", 4, 2, 2, "m", "L"),
                  ("cyl", 10, 30, False, "cm", "L"), ("cyl", 4, 10, False, "cm", "mL"), ("cyl", 1, 2, True, "m", "L"),
                  ("cyl", 20, 50, True, "cm", "L")]
L2["capacity"] = [("box", 1.2, 0.8, 0.5, "m", "L"), ("box", 35, 22, 18, "cm", "L"), ("box", 12.5, 8, 6, "cm", "mL"),
                  ("box", 2.5, 1.6, 1.2, "m", "L"), ("cyl", 0.4, 1.2, False, "m", "L"), ("cyl", 7.5, 20, True, "cm", "L"),
                  ("cyl", 3.5, 12, False, "cm", "mL"), ("cyl", 0.75, 1.8, True, "m", "L")]


def is_rev(it):
    """A 'working backwards' item: the result of the formula is given and a length/time is found."""
    return isinstance(it, tuple) and len(it) > 0 and it[0] == "rev"


# ============================================================= generators ==
def quad_fig(angles, labs, H):
    return D.quad_angles(angles, labs, L1=None, H=H)


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


def g_ang_tri(it):
    A, B, pos = it
    C = 180 - A - B
    labs = [f"{A}{DEG}", f"{B}{DEG}", f"{C}{DEG}"]
    k = {"left": 0, "right": 1, "apex": 2}[pos]
    ans = str([A, B, C][k]) + DEG
    labs[k] = X + DEG
    return f"Find the value of {X}.", (lambda s: D.angle_tri(A, B, tuple(labs), H=int(126 * s))), "ang_tri", ans


def g_ang_quad(it):
    angles, pos = it
    labs = [f"{a}{DEG}" for a in angles]
    labs[pos] = X + DEG
    return (f"Find the value of {X}.", (lambda s: quad_fig(angles, tuple(labs), int(124 * s))), "ang_quad",
            f"{angles[pos]}{DEG}")


def g_ang_poly(it):
    n, mode = it
    S = 180 * (n - 2)
    if mode == "sum":
        txt, ans = f"Find the sum of the interior angles of this {POLY[n]}.", f"{S}{DEG}"
    else:
        txt, ans = f"Find the size of each interior angle of this regular {POLY[n]}.", f"{nf(S / n)}{DEG}"
    return txt, (lambda s: D.polygon(n, H=int(104 * s / 0.9))), "ang_poly", ans


def g_ang_ext(it):
    A, C, unk = it
    E = A + C
    labs = [f"{A}{DEG}", f"{C}{DEG}", f"{E}{DEG}"]
    k = {"left": 0, "apex": 1, "ext": 2}[unk]
    ans = f"{[A, C, E][k]}{DEG}"
    labs[k] = X + DEG
    return f"Find the value of {X}.", (lambda s: D.ext_angle(A, C, tuple(labs), H=int(118 * s))), "ang_ext", ans


def g_a_rect(it):
    if is_rev(it):              # area given, find a side: x = A / known side
        _, l, w, u, unk = it
        A = l * w
        known = w if unk == "l" else l
        labs = (X, lab(w, u)) if unk == "l" else (lab(l, u), X)
        return (f"The area of this rectangle is {nf(A)} {u}\u00b2. Find {X}.",
                (lambda s: D.rect(l, w, labs, H=int(112 * s))), "a_rect", lab(A / known, u))
    l, w, u = it
    return ("Find the area of this rectangle.", (lambda s: D.rect(l, w, (lab(l, u), lab(w, u)), H=int(112 * s))),
            "a_rect", f"{nf(l * w)} {u}\u00b2")


def g_a_tri(it):
    if is_rev(it):              # area given, find the base or the height: x = 2A / known
        _, b, h, u, unk = it
        A = b * h / 2
        known = h if unk == "b" else b
        bl, hl = (X, lab(h, u)) if unk == "b" else (lab(b, u), X)
        return (f"The area of this triangle is {nf(A)} {u}\u00b2. Find {X}.",
                (lambda s: D.tri_height(b, 0.25 * b, h, bl, hl, H=int(124 * s), clear=True)), "a_tri",
                lab(2 * A / known, u))
    b, h, u = it
    return ("Find the area of this triangle.",
            (lambda s: D.tri_height(b, 0.25 * b, h, lab(b, u), lab(h, u), H=int(124 * s), clear=True)),
            "a_tri", f"{nf(b * h / 2)} {u}\u00b2")


def g_a_para(it):
    if is_rev(it):              # area given, find the base or the height: x = A / known
        _, b, h, off, u, unk = it
        A = b * h
        known = h if unk == "b" else b
        labs = (X, lab(h, u)) if unk == "b" else (lab(b, u), X)
        return (f"The area of this parallelogram is {nf(A)} {u}\u00b2. Find {X}.",
                (lambda s: D.parallelogram(b, h, off, labs, H=int(118 * s))), "a_para", lab(A / known, u))
    b, h, off, u = it
    return ("Find the area of this parallelogram.",
            (lambda s: D.parallelogram(b, h, off, (lab(b, u), lab(h, u)), H=int(118 * s))),
            "a_para", f"{nf(b * h)} {u}\u00b2")


def g_a_trap(it):
    a, t, h, tx, u = it
    return ("Find the area of this trapezium.",
            (lambda s: D.trapezium(a, t, h, tx, (lab(t, u), lab(a, u), lab(h, u)), H=int(118 * s), clear=True)),
            "a_trap", f"{nf(h * (a + t) / 2)} {u}\u00b2")


def g_a_kite(it):
    lf, rt, hh, u = it
    name = "rhombus" if lf == rt else "kite"
    return (f"Find the area of this {name}.",
            (lambda s: D.kite(lf, rt, hh, (lab(lf + rt, u), lab(2 * hh, u)), H=int(124 * s))),
            "a_kite", f"{nf((lf + rt) * hh)} {u}\u00b2")


def g_circ(it):
    if is_rev(it):              # circumference given, find the diameter (C / pi) or the radius (C / 2 pi)
        _, kind, C, u = it
        x = C / math.pi if kind == "d" else C / (2 * math.pi)
        f_ = (lambda s: D.circle_d(X, R=int(42 * s + 4), H=int(100 * s + 8))) if kind == "d" else \
             (lambda s: D.circle_r(X, R=int(42 * s + 4), H=int(100 * s + 8)))
        return (f"The circumference of this circle is {nf(C)} {u}. Find {X}, correct to 1 decimal place.", f_,
                "c_circ_d" if kind == "d" else "c_circ_r", f"{d1(x)} {u}")
    kind, v, u = it
    C = math.pi * v if kind == "d" else 2 * math.pi * v
    f_ = (lambda s: D.circle_d(lab(v, u), R=int(42 * s + 4), H=int(100 * s + 8))) if kind == "d" else \
         (lambda s: D.circle_r(lab(v, u), R=int(42 * s + 4), H=int(100 * s + 8)))
    return ("Find the circumference of this circle, correct to 1 decimal place.", f_,
            "c_circ_d" if kind == "d" else "c_circ_r", f"{d1(C)} {u}")


def g_a_circle(it):
    kind, v, u = it
    r = v / 2 if kind == "d" else v
    f_ = (lambda s: D.circle_d(lab(v, u), R=int(42 * s + 4), H=int(100 * s + 8))) if kind == "d" else \
         (lambda s: D.circle_r(lab(v, u), R=int(42 * s + 4), H=int(100 * s + 8)))
    return ("Find the area of this circle, correct to 1 decimal place.", f_, "a_circle",
            f"{d1(math.pi * r * r)} {u}\u00b2")


def g_a_semi(it):
    if it[0] == "sec":          # quadrant or other sector: A = theta/360 x pi r^2
        _, th, r, u = it
        name = "quadrant" if th == 90 else "sector"
        return (f"Find the area of this {name}, correct to 1 decimal place.",
                (lambda s: D.sector(th, lab(r, u), H=int(92 * s / 0.9))),
                "a_sector", f"{d1(th / 360 * math.pi * r * r)} {u}\u00b2")
    r, u = it
    return ("Find the area of this semicircle, correct to 1 decimal place.",
            (lambda s: D.semicircle(lab(r, u), R=int(64 * s / 0.9), H=int(100 * s / 0.9))),
            "a_semi", f"{d1(math.pi * r * r / 2)} {u}\u00b2")


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


def g_v_rect(it):
    if is_rev(it):              # volume given, find one edge: x = V / (product of the other two)
        _, l, w, h, u, unk = it
        V = l * w * h
        dims = {"l": l, "w": w, "h": h}
        known = math.prod(v_ for k_, v_ in dims.items() if k_ != unk)
        labs = tuple(X if k_ == unk else lab(v_, u) for k_, v_ in dims.items())
        return (f"The volume of this rectangular prism is {nf(V)} {u}\u00b3. Find {X}.",
                (lambda s: D.box(l, w, h, labs, H=int(124 * s))), "v_rect", lab(V / known, u))
    l, w, h, u = it
    return ("Find the volume of this rectangular prism.",
            (lambda s: D.box(l, w, h, (lab(l, u), lab(w, u), lab(h, u)), H=int(124 * s))),
            "v_rect", f"{nf(l * w * h)} {u}\u00b3")


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


def g_sa_tri(it):
    a, b, c, L, u = it
    SA = a * b + (a + b + c) * L
    return ("Find the surface area of this triangular prism.",
            (lambda s: D.tri_prism(a, b, L, (lab(a, u), lab(b, u), lab(c, u), lab(L, u)), H=int(106 * s / 0.9))),
            "sa_tri", f"{nf(SA)} {u}\u00b2")


def _b(b):
    return f"<i>{b}</i>" if isinstance(b, str) else str(b)


def g_idx(it):
    if it[0] == "zero":         # a^0 = 1
        form, args = it[1], it[2:]
        z = lambda b: f"{_b(b)}<sup>0</sup>"
        if form == "pow":
            disp, val = z(args[0]), 1
        elif form == "mult":
            b, n = args
            disp, val = f"{z(b)} {TIMES} {b}<sup>{n}</sup>", 1 * b ** n
        elif form == "coef":
            k_, b = args
            disp = f"{k_}{z(b)}" if isinstance(b, str) else f"{k_} {TIMES} {z(b)}"
            val = k_ * 1
        elif form == "sum":
            disp, val = f"{z(args[0])} + {z(args[1])}", 1 + 1
        else:  # bracket: (k b)^0
            disp, val = f"({args[0]}{_b(args[1])})<sup>0</sup>", 1
        txt = "Simplify." if any(isinstance(a, str) for a in args) else "Evaluate."
        return txt, static(display(disp)), "idx_zero", nf(val)
    kind, b, m, n = it
    B = _b(b)
    if kind == "mult":
        disp, e, key = f"{B}<sup>{m}</sup> {TIMES} {B}<sup>{n}</sup>", m + n, "idx_mult"
    elif kind == "div":
        disp, e, key = f"{B}<sup>{m}</sup> {DIV} {B}<sup>{n}</sup>", m - n, "idx_div"
    else:
        disp, e, key = f"({B}<sup>{m}</sup>)<sup>{n}</sup>", m * n, "idx_pow"
    txt = "Simplify." if isinstance(b, str) else "Write as a single power."
    return txt, static(display(disp)), key, f"{b}^{e}"


def g_distrib(it):
    disp, ans = it
    return "Expand.", static(display(disp)), "distrib", ans


def g_pct_qty(it):
    p, qn, u = it
    amt = p / 100 * qn
    if u == "$":
        disp, ans = f"{nf(p)}% of ${nf(qn)}", money(amt)
    else:
        disp, ans = f"{nf(p)}% of {nf(qn)} {u}", f"{nf(amt)} {u}"
    return "Calculate.", static(display(disp)), "pct_qty", ans


def g_pct_change(it):
    o, n, kind = it
    ch = (n - o) / o * 100
    word = "increase" if ch > 0 else "decrease"
    if kind == "price":
        txt = f"Find the percentage {word} in price."
        tab = dtable([["Original price", money(o)], ["New price", money(n)]])
    else:
        txt = f"Find the percentage {word} in visitors."
        tab = dtable([["Last year", f"{o:,}"], ["This year", f"{n:,}"]])
    return txt, static(tab), "pct_change", f"{nf(abs(ch))}% {word}"


def g_profit(it):
    c, s_ = it
    p = s_ - c
    word = "profit" if p > 0 else "loss"
    return (f"Find the {word} made on this sale.",
            static(dtable([["Cost price", money(c)], ["Selling price", money(s_)]])), "profit",
            f"{money(abs(p))} {word}")


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


def g_scale(it):
    o, im, u = it
    if im > o:
        txt = "The small rectangle is enlarged to make the large one. Find the scale factor."
    else:
        txt = "The large rectangle is reduced to make the small one. Find the scale factor."
    return (txt, (lambda s: D.similar_rects((o, o * 0.5), (im, im * 0.5), (lab(o, u), lab(im, u)),
                                            H=int(100 * s / 0.9))), "scale", nf(im / o))


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


def g_mean(it):
    vals, head, noun = it
    m = sum(vals) / len(vals)
    return (f"Find the mean of these {noun}.", static(dtable([[head] + [nf(v) for v in vals]])), "mean", nf(round(m, 2)))


def g_range(it):
    vals, head, noun, unit = it
    r = max(vals) - min(vals)
    return (f"Find the range of these {noun}.", static(dtable([[head] + [nf(v) for v in vals]])), "range",
            f"{nf(round(r, 3))}{unit}")


def g_gradient(it):
    p1, p2 = it
    m = Fraction(p2[1] - p1[1], p2[0] - p1[0])
    return ("Find the gradient of line AB.", (lambda s: D.plane_line(p1, p2, u=17 * s / 0.9 if s < 0.9 else 17, clear=True)),
            "gradient", fstr(m))


def g_linear(it):
    m, c, x = it
    ms = {1: "", -1: MINUS}.get(m, nf(m))
    cs = "" if c == 0 else (f" + {nf(c)}" if c > 0 else f" {MINUS} {nf(-c)}")
    disp = f"<i>y</i> = {ms}<i>x</i>{cs}"
    return (f"Find the value of <i>y</i> when <i>x</i> = {nf(x)}.", static(display(disp)), "linear",
            nf(round(m * x + c, 6)))


def g_ang_line(it):
    """Angles on a straight line, angles at a point, vertically opposite angles."""
    if it[0] == "vop":
        _, th, tilt, side = it
        labs = (f"{nf(th)}{DEG}", X + DEG) if side == "L" else (X + DEG, f"{nf(th)}{DEG}")
        return (f"Find the value of {X}.", (lambda s: D.vert_opp(th, labs, H=int(124 * s), tilt=tilt)),
                "ang_vert", f"{nf(th)}{DEG}")
    kind, parts, k, extra = it
    total = 180 if kind == "str" else 360
    assert abs(sum(parts) - total) < 1e-9, it
    x = total - sum(p for i, p in enumerate(parts) if i != k)       # the rule, applied to the printed angles
    labs = [f"{nf(p)}{DEG}" for p in parts]
    labs[k] = X + DEG
    if kind == "str":
        f_ = lambda s: D.angles_line(parts, labs, H=int(124 * s), below=extra)
    else:
        f_ = lambda s: D.angles_point(parts, labs, H=int(124 * s), rot=extra)
    return f"Find the value of {X}.", f_, "ang_straight" if kind == "str" else "ang_point", f"{nf(x)}{DEG}"


PAR_PAIRS = {"alt": [{("T", "LL"), ("B", "UR")}, {("T", "LR"), ("B", "UL")}],
             "coint": [{("T", "LL"), ("B", "UL")}, {("T", "LR"), ("B", "UR")}]}


def g_ang_par(it):
    """Corresponding, alternate and co-interior angles on parallel lines."""
    rel, th, g, xq = it
    if rel == "corr":
        assert g[1] == xq[1] and g[0] != xq[0], it
    else:
        assert {g, xq} in PAR_PAIRS[rel], it
    given = D.par_angle(th, g[1])
    x = given if rel in ("corr", "alt") else 180 - given              # the rule, applied to the printed angle
    assert abs(x - D.par_angle(th, xq[1])) < 1e-9, it                # ... agrees with the drawing
    marks = [(g[0], g[1], f"{nf(given)}{DEG}"), (xq[0], xq[1], X + DEG)]
    return (f"Find the value of {X}.", (lambda s: D.parallel(th, marks, H=int(126 * s))),
            {"corr": "ang_corr", "alt": "ang_alt", "coint": "ang_coint"}[rel], f"{nf(x)}{DEG}")


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
        txt, rows = "Find the new population of the town.", [["Population", f"{amt:,}"], [word, P]]
    elif ctx == "plain$":
        txt, fig = "Find the new amount.", display(f"{word} {money(amt)} by {P}")
    else:
        txt, fig = "Find the new mass.", display(f"{word} {nf(amt)} kg by {P}")
    if fig is None:
        fig = dtable(rows)
    if ctx == "pop":
        assert abs(new - round(new)) < 1e-9, it
        ans = f"{int(round(new)):,}"
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


def g_capacity(it):
    """Capacity of a tank: its volume, then 1 cm^3 = 1 mL, 1000 cm^3 = 1 L or 1 m^3 = 1000 L."""
    if it[0] == "box":
        _, l, w, h, u, out = it
        V = l * w * h
        f_ = lambda s: D.box(l, w, h, (lab(l, u), lab(w, u), lab(h, u)), H=int(124 * s))
    else:
        _, r, h, dia, u, out = it
        V = math.pi * r * r * h
        rl = lab(2 * r, u) if dia else lab(r, u)
        f_ = lambda s: D.cylinder(r, h, rl, lab(h, u), dia=dia, H=int(112 * s / 0.9))
    if u == "m":
        assert out == "L"
        cap, conv = V * 1000, "m3"
    else:
        cap, conv = (V, "ml") if out == "mL" else (V / 1000, "l")
    thing = "tank" if out == "L" else "container"
    unit_word = "litres" if out == "L" else "millilitres"
    exact = abs(cap * 100 - round(cap * 100)) < 1e-6
    txt = f"Find the capacity of this {thing} in {unit_word}" + ("." if exact else ", correct to 1 decimal place.")
    ans = f"{nf(round(cap, 2))} {out}" if exact else f"{d1(cap)} {out}"
    return txt, f_, f"cap_{'rect' if it[0] == 'box' else 'cyl'}_{conv}", ans


GEN = {"pyth_hyp": g_pyth_hyp, "pyth_short": g_pyth_short, "ang_tri": g_ang_tri, "ang_quad": g_ang_quad,
       "ang_poly": g_ang_poly, "ang_ext": g_ang_ext, "a_rect": g_a_rect, "a_tri": g_a_tri, "a_para": g_a_para,
       "a_trap": g_a_trap, "a_kite": g_a_kite, "circ": g_circ, "a_circle": g_a_circle, "a_semi": g_a_semi,
       "v_prism": g_v_prism, "v_rect": g_v_rect, "v_cyl": g_v_cyl, "sa_rect": g_sa_rect, "sa_tri": g_sa_tri,
       "idx": g_idx, "distrib": g_distrib, "pct_qty": g_pct_qty, "pct_change": g_pct_change, "profit": g_profit,
       "speed": g_speed, "scale": g_scale, "prob": g_prob, "prob_not": g_prob_not, "mean": g_mean,
       "range": g_range, "gradient": g_gradient, "linear": g_linear,
       "ang_line": g_ang_line, "ang_par": g_ang_par, "pct_incdec": g_pct_incdec, "pct_orig": g_pct_orig,
       "sa_cyl": g_sa_cyl, "capacity": g_capacity}


# ============================================================== scheduler ==
STRANDS = {
    "A": ["pyth_hyp", "pyth_short", "ang_tri", "ang_quad", "ang_poly", "ang_ext", "ang_line", "ang_par"],
    "B": ["a_rect", "a_tri", "a_para", "a_trap", "a_kite", "circ", "a_circle", "a_semi"],
    "C": ["v_prism", "v_rect", "v_cyl", "sa_rect", "sa_tri", "sa_cyl", "capacity"],
    "D": ["idx", "distrib", "pct_qty", "pct_change", "profit", "speed", "scale", "pct_incdec", "pct_orig"],
    "E": ["prob", "prob_not", "mean", "range", "gradient", "linear"],
}
WEEK1 = {
    1: [("pyth_hyp", "a_tri", "v_rect", "pct_qty", "mean"), ("ang_tri", "a_circle", "v_prism", "speed", "prob"),
        ("pyth_short", "a_trap", "v_cyl", "idx", "gradient")],
    2: [("ang_quad", "a_para", "sa_rect", "pct_change", "range"), ("ang_ext", "circ", "sa_tri", "profit", "prob_not"),
        ("ang_poly", "a_kite", "v_prism", "distrib", "linear")],
    3: [("pyth_hyp", "a_semi", "v_cyl", "scale", "prob"), ("ang_tri", "a_trap", "v_rect", "speed", "mean"),
        ("pyth_short", "a_rect", "sa_rect", "idx", "gradient")],
    4: [("ang_poly", "circ", "v_prism", "pct_qty", "linear"), ("ang_ext", "a_tri", "sa_tri", "pct_change", "range"),
        ("ang_quad", "a_kite", "v_cyl", "profit", "prob_not")],
}
# capacity prints the volume formula of a rectangular prism or a cylinder, so it never sits in the
# session next to v_rect or v_cyl (no formula in two consecutive sessions)
CLASH = {frozenset(("capacity", "v_rect")), frozenset(("capacity", "v_cyl"))}
# families with 'working backwards' items: about 1 in 4 of their questions (the 2nd, 6th, ... time
# the family appears in a term, counting Week 1) gives the result of the formula and asks for x
REVERSE = {"a_rect", "a_tri", "a_para", "v_rect", "v_prism", "speed", "circ"}
# the item that takes that 2nd, 6th, ... slot: a working-backwards item, or a zero-index item for idx
SPECIAL = {fam: is_rev for fam in REVERSE}
SPECIAL["idx"] = lambda it: it[0] == "zero"
MIN_PER_TERM = 3
MIN_FAM = {"idx": 4}          # idx has four formulas (multiply, divide, power of a power, zero index)


def seed(*parts):
    return zlib.crc32("|".join(map(str, parts)).encode())


def _ok_pair(a, b):
    return a != b and frozenset((a, b)) not in CLASH


def strand_sequence(strand, term, n=30):
    """Week 1's three families, then the strand's other families, then whole shuffled cycles, so
    every family comes round at least every len(strand) + 1 sessions (and at least 3 times a term).
    Never the same family (or a clashing one) in consecutive sessions; a two-session gap is
    preferred where a cycle meets the next."""
    rng = random.Random(seed("seq", strand, term))
    fams = STRANDS[strand]
    si = "ABCDE".index(strand)
    head = [WEEK1[term][k][si] for k in range(3)]
    for _ in range(2000):
        rest = [f for f in fams if f not in head]
        rng.shuffle(rest)
        seq = head + rest
        if not all(_ok_pair(a, b) for a, b in zip(seq, seq[1:])):
            continue
        while len(seq) < n:
            found = None
            for gap in (2, 1):
                for _ in range(400):
                    cyc = fams[:]
                    rng.shuffle(cyc)
                    joined = [seq[-1]] + cyc
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
        if len(seq) == n and all(seq.count(f) >= MIN_FAM.get(f, MIN_PER_TERM) for f in fams):
            return seq
    raise RuntimeError(f"no valid rotation for strand {strand}, term {term}")


def qsig(q):
    """What makes two questions the same: the question text and the multiset of numbers and words
    printed in its figure (so a repeat is caught whatever the figure's drawing scale)."""
    import re
    txt = re.sub(r"<[^>]+>", "", q.text)
    labs = sorted(t.strip() for t in re.findall(r">([^<>]+)<", q.fig or "") if t.strip())
    return txt, tuple(labs)


class Pools:
    """Draws items without replacement (no question repeats within a term). Within a family it
    prefers the formula used least so far this term (so idx, ang_line, ang_par, pct_incdec, capacity,
    a_semi and circ rotate through their formulas). In SPECIAL families the 2nd, 6th, ... appearance
    is the special item (working backwards, or a zero index for idx) and the others are not."""

    def __init__(self, term, week1):
        self.term = term
        self.used = set()
        self.keys = {}
        for s in week1:
            for q in s.qs:
                self.keys[q.formula] = self.keys.get(q.formula, 0) + 1
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
        want = fam in SPECIAL and k % 4 == 1
        special = SPECIAL.get(fam, lambda it: False)
        pref = [it for it in avail if special(it) == want] or avail
        use = {repr(it): self.keys.get(GEN[fam](it)[2], 0) for it in pref}
        lo = min(use.values())
        it = self.rng.choice([it for it in pref if use[repr(it)] == lo])
        self.used.add((fam, repr(it)))
        return it


def generated_sessions(term, week1=None):
    """Weeks 2-10 of a term. week1 = that term's approved Week 1 sessions (samples.py); they seed the
    rotation and the no-repeat check, and are tagged with their families here."""
    if week1 is None:
        import samples
        week1 = samples.TERMS[term]()
    seqs = {X_: strand_sequence(X_, term) for X_ in "ABCDE"}
    for k, s in enumerate(week1):
        for X_, q in zip("ABCDE", s.qs):
            q.fam, q.item = seqs[X_][k], None
    pools = Pools(term, week1)
    sigs = {qsig(q) for s in week1 for q in s.qs}
    out = []
    for idx in range(3, 30):
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
            sigs.add(qsig(q))
            pools.keys[q.formula] = pools.keys.get(q.formula, 0) + 1
            qs.append(q)
        out.append(Session(term, week, sess, qs))
    for X_, seq in seqs.items():
        for fam in STRANDS[X_]:
            assert seq.count(fam) >= MIN_FAM.get(fam, MIN_PER_TERM), (term, fam, seq.count(fam))
    return out, seqs
