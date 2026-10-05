# -*- coding: utf-8 -*-
"""The Fractal Five - question generators and scheduler (Weeks 2-10 of each term).

Week 1 of every term is the approved sample (samples.py). Weeks 2-10 are generated:
every session takes one question from each strand, rotating through the strand's
formulas so each one comes back every few sessions and never twice in a row:

  A geometry   pyth_hyp pyth_short ang_tri ang_quad ang_poly ang_ext
  B area       a_rect a_tri a_para a_trap a_kite circ a_circle a_semi
  C volume/SA  v_prism v_rect v_cyl sa_rect sa_tri
  D number     idx distrib pct_qty pct_change profit speed scale
  E stats etc  prob prob_not mean range gradient linear

Level 1 (Terms 1-2): whole numbers, Pythagorean triples, tidy answers.
Level 2 (Terms 3-4): the level-2 set (decimals, rounding, negatives, algebra) plus half
of the level-1 set, so it stays simple while stretching a little.
Every answer is computed here from the same numbers that label the diagram.
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
                (10, 8, "cm"), (13, 6, "m")]
L2["a_rect"] = [(12.5, 4, "m"), (8.5, 6, "cm"), (14, 3.5, "cm"), (6.4, 5, "m"), (9, 7.5, "cm"), (11, 2.5, "m"),
                (7.2, 4, "cm")]
L1["a_tri"] = [(12, 5, "cm"), (14, 8, "cm"), (16, 7, "m"), (11, 6, "cm"), (8, 6, "cm"), (10, 8, "m"),
               (15, 4, "cm"), (18, 10, "cm")]
L2["a_tri"] = [(11, 7, "cm"), (13, 6, "m"), (9, 5, "cm"), (15, 7, "cm"), (7.5, 4, "m"), (17, 9, "cm"),
               (12, 6.5, "cm")]
L1["a_para"] = [(10, 6, 3, "cm"), (12, 4, 3, "cm"), (8, 7, 2.5, "m"), (11, 5, 3, "cm"), (7, 6, 2, "cm"),
                (14, 5, 3.5, "m"), (15, 8, 4, "cm")]
L2["a_para"] = [(7.5, 4, 2, "cm"), (9, 6.5, 2.5, "m"), (12, 3.5, 3, "cm"), (8.4, 5, 2.4, "cm"),
                (10, 4.5, 3, "m"), (13, 6, 4, "cm")]
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
L2["circ"] = [("d", 7.5, "cm"), ("r", 2.5, "m"), ("d", 18, "cm"), ("r", 6.5, "cm"), ("d", 11, "m"), ("r", 12, "cm")]
L1["a_circle"] = [("r", 6, "cm"), ("r", 3, "m"), ("r", 5, "cm"), ("r", 10, "cm"), ("r", 7, "m"), ("r", 2, "cm")]
L2["a_circle"] = [("r", 2.5, "cm"), ("r", 4.5, "m"), ("r", 8.5, "cm"), ("d", 12, "cm"), ("d", 9, "m"), ("d", 15, "cm")]
L1["a_semi"] = [(4, "cm"), (10, "cm"), (5, "m"), (8, "cm"), (3, "cm"), (7, "m")]
L2["a_semi"] = [(6.5, "cm"), (9, "m"), (2.5, "cm"), (12, "cm"), (4.5, "m")]

L1["v_prism"] = [("tri20", 5, "cm"), ("trap24", 5, "cm"), ("house20", 6, "cm"), ("para15", 8, "cm"),
                 ("rtri15", 4, "m"), ("tri18", 7, "cm"), ("trap15", 10, "cm"), ("tri12", 9, "cm"), ("house20", 9, "m")]
L2["v_prism"] = [("tri18", 4.5, "cm"), ("trap24", 2.5, "m"), ("house20", 3.5, "cm"), ("rtri15", 6.5, "cm"),
                 ("para15", 7, "m"), ("tri20", 5.5, "cm"), ("trap15", 8.5, "cm")]
L1["v_rect"] = [(6, 3, 2, "cm"), (8, 5, 2, "cm"), (10, 4, 3, "m"), (7, 2, 3, "cm"), (6, 6, 2, "cm"), (9, 4, 2, "m"),
                (4, 4, 4, "cm"), (12, 3, 2, "cm"), (5, 5, 3, "m")]
L2["v_rect"] = [(8, 3, 1.5, "cm"), (12, 2.5, 4, "cm"), (5.5, 4, 2, "m"), (6, 4.5, 2, "cm"), (10, 3.5, 2, "cm"),
                (9, 2.5, 3, "m"), (7.5, 4, 3, "cm")]
L1["v_cyl"] = [(2, 9, False, "cm"), (6, 4, False, "cm"), (4, 10, False, "m"), (5, 6, False, "cm"), (3, 7, True, "cm"),
               (5, 4, True, "cm"), (1.5, 8, False, "m"), (7, 5, False, "cm"), (2, 5, True, "cm")]
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

L1["idx"] = [("mult", 2, 3, 4), ("mult", 3, 2, 5), ("mult", 10, 4, 3), ("div", 3, 8, 2), ("div", 2, 9, 4),
             ("div", 10, 7, 3), ("pow", 2, 3, 4), ("pow", 5, 2, 3), ("pow", 3, 4, 2), ("mult", 7, 3, 3),
             ("div", 6, 5, 3)]
L2["idx"] = [("mult", "x", 5, 4), ("mult", "m", 6, 2), ("div", "y", 8, 3), ("div", "k", 10, 4), ("pow", "n", 3, 4),
             ("pow", "p", 2, 6), ("mult", "a", 3, 7), ("div", 4, 9, 5), ("pow", 7, 2, 5)]
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
L1["speed"] = [(180, "km", 2, "hours", "car", "km/h"), (360, "km", 4, "hours", "train", "km/h"),
               (210, "km", 3, "hours", "bus", "km/h"), (100, "m", 20, "seconds", "runner", "m/s"),
               (60, "km", 3, "hours", "cyclist", "km/h"), (1500, "km", 2, "hours", "plane", "km/h"),
               (12, "km", 3, "hours", "walker", "km/h"), (320, "km", 4, "hours", "car", "km/h")]
L2["speed"] = [(135, "km", 1.5, "hours", "car", "km/h"), (18, "km", 45, "minutes", "cyclist", "km/h"),
               (400, "m", 50, "seconds", "runner", "m/s"), (325, "km", 2.5, "hours", "train", "km/h"),
               (7.5, "km", 30, "minutes", "cyclist", "km/h"), (90, "km", 45, "minutes", "car", "km/h"),
               (1200, "m", 150, "seconds", "runner", "m/s")]
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
    l, w, u = it
    return ("Find the area of this rectangle.", (lambda s: D.rect(l, w, (lab(l, u), lab(w, u)), H=int(112 * s))),
            "a_rect", f"{nf(l * w)} {u}\u00b2")


def g_a_tri(it):
    b, h, u = it
    return ("Find the area of this triangle.",
            (lambda s: D.tri_height(b, 0.25 * b, h, lab(b, u), lab(h, u), H=int(124 * s))),
            "a_tri", f"{nf(b * h / 2)} {u}\u00b2")


def g_a_para(it):
    b, h, off, u = it
    return ("Find the area of this parallelogram.",
            (lambda s: D.parallelogram(b, h, off, (lab(b, u), lab(h, u)), H=int(118 * s))),
            "a_para", f"{nf(b * h)} {u}\u00b2")


def g_a_trap(it):
    a, t, h, tx, u = it
    return ("Find the area of this trapezium.",
            (lambda s: D.trapezium(a, t, h, tx, (lab(t, u), lab(a, u), lab(h, u)), H=int(118 * s))),
            "a_trap", f"{nf(h * (a + t) / 2)} {u}\u00b2")


def g_a_kite(it):
    lf, rt, hh, u = it
    name = "rhombus" if lf == rt else "kite"
    return (f"Find the area of this {name}.",
            (lambda s: D.kite(lf, rt, hh, (lab(lf + rt, u), lab(2 * hh, u)), H=int(124 * s))),
            "a_kite", f"{nf((lf + rt) * hh)} {u}\u00b2")


def g_circ(it):
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
    r, u = it
    return ("Find the area of this semicircle, correct to 1 decimal place.",
            (lambda s: D.semicircle(lab(r, u), R=int(64 * s / 0.9), H=int(100 * s / 0.9))),
            "a_semi", f"{d1(math.pi * r * r / 2)} {u}\u00b2")


def g_v_prism(it):
    face, L, u = it
    A = FACE_AREA[face]
    k = min(0.8, 5.5 / L)
    return (f"The shaded face has an area of {nf(A)} {u}\u00b2. Find the volume of the prism.",
            (lambda s: D.prism_area(FACES[face], L, "", lab(L, u), k=k, ang=20, H=int(112 * s / 0.9))),
            "v_prism", f"{nf(A * L)} {u}\u00b3")


def g_v_rect(it):
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
    return ("Find the gradient of line AB.", (lambda s: D.plane_line(p1, p2, u=17 * s / 0.9 if s < 0.9 else 17)),
            "gradient", fstr(m))


def g_linear(it):
    m, c, x = it
    ms = {1: "", -1: MINUS}.get(m, nf(m))
    cs = "" if c == 0 else (f" + {nf(c)}" if c > 0 else f" {MINUS} {nf(-c)}")
    disp = f"<i>y</i> = {ms}<i>x</i>{cs}"
    return (f"Find the value of <i>y</i> when <i>x</i> = {nf(x)}.", static(display(disp)), "linear",
            nf(round(m * x + c, 6)))


GEN = {"pyth_hyp": g_pyth_hyp, "pyth_short": g_pyth_short, "ang_tri": g_ang_tri, "ang_quad": g_ang_quad,
       "ang_poly": g_ang_poly, "ang_ext": g_ang_ext, "a_rect": g_a_rect, "a_tri": g_a_tri, "a_para": g_a_para,
       "a_trap": g_a_trap, "a_kite": g_a_kite, "circ": g_circ, "a_circle": g_a_circle, "a_semi": g_a_semi,
       "v_prism": g_v_prism, "v_rect": g_v_rect, "v_cyl": g_v_cyl, "sa_rect": g_sa_rect, "sa_tri": g_sa_tri,
       "idx": g_idx, "distrib": g_distrib, "pct_qty": g_pct_qty, "pct_change": g_pct_change, "profit": g_profit,
       "speed": g_speed, "scale": g_scale, "prob": g_prob, "prob_not": g_prob_not, "mean": g_mean,
       "range": g_range, "gradient": g_gradient, "linear": g_linear}


# ============================================================== scheduler ==
STRANDS = {
    "A": ["pyth_hyp", "pyth_short", "ang_tri", "ang_quad", "ang_poly", "ang_ext"],
    "B": ["a_rect", "a_tri", "a_para", "a_trap", "a_kite", "circ", "a_circle", "a_semi"],
    "C": ["v_prism", "v_rect", "v_cyl", "sa_rect", "sa_tri"],
    "D": ["idx", "distrib", "pct_qty", "pct_change", "profit", "speed", "scale"],
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


def seed(*parts):
    return zlib.crc32("|".join(map(str, parts)).encode())


def strand_sequence(strand, term, n=30):
    rng = random.Random(seed("seq", strand, term))
    fams = STRANDS[strand]
    si = "ABCDE".index(strand)
    seq = [WEEK1[term][k][si] for k in range(3)]
    rest = [f for f in fams if f not in seq]
    rng.shuffle(rest)
    seq += rest
    while len(seq) < n:
        # never the same formula in consecutive sessions; prefer a two-session gap when possible
        found = None
        for gap in (2, 1):
            for _ in range(400):
                cyc = fams[:]
                rng.shuffle(cyc)
                if not any(c in seq[-gap:] for c in cyc[:gap]):
                    found = cyc
                    break
            if found:
                break
        seq += found
    return seq[:n]


EXCLUDE = {4: {("ang_poly", repr((8, "sum")))}}     # already used in that term's Week 1 sample


class Pools:
    def __init__(self, term):
        self.term = term
        self.bags = {}
        self.refill = {}

    def items(self, fam):
        if self.term <= 2:
            return list(L1[fam])
        return list(L2[fam]) + list(L1[fam])[::2]

    def draw(self, fam):
        bag = self.bags.get(fam)
        if not bag:
            n = self.refill.get(fam, 0)
            self.refill[fam] = n + 1
            bag = [it for it in self.items(fam) if (fam, repr(it)) not in EXCLUDE.get(self.term, set())]
            random.Random(seed("pool", fam, self.term, n)).shuffle(bag)
            self.bags[fam] = bag
        return bag.pop()


def generated_sessions(term):
    seqs = {X_: strand_sequence(X_, term) for X_ in "ABCDE"}
    pools = Pools(term)
    out = []
    for idx in range(3, 30):
        week, sess = idx // 3 + 1, idx % 3 + 1
        qs = []
        for X_ in "ABCDE":
            fam = seqs[X_][idx]
            for attempt in range(12):            # skip any item whose figure cannot be drawn cleanly
                it = pools.draw(fam)
                text, figf, key, ans = GEN[fam](it)
                try:
                    q = mk(text, figf, key, ans)
                    if q.figf:
                        q.figf(q.s * 0.81)          # it must also survive two shrink steps
                    break
                except AssertionError:
                    q = None
            assert q is not None, (term, idx, fam)
            q.fam, q.item = fam, it
            qs.append(q)
        out.append(Session(term, week, sess, qs))
    return out, seqs
