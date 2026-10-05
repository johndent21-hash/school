# -*- coding: utf-8 -*-
"""Week 1, Sessions 1-3 of every term (the approval samples).

Each session takes one question from each strand:
  A geometry (Pythagoras, angle sums)      B area and circles
  C volume and surface area                D number (percentages, rates, indices, algebra)
  E statistics, probability and graphs
Terms 1-2 print the formula (students copy it); Terms 3-4 recall it.
Between them the twelve sample sessions use every formula on the Year 8 list.
All answers are verified in Python before the build (see HANDOFF.md).
"""
import wdia as D
from formulas import FX
from wu import Q, Session, display, dtable, pw, frac, TIMES, DIV, MINUS, DEG

X = "<i>x</i>"


def q(text, fig, key, answer):
    fx, small = FX[key]
    return Q(text, fig, key, answer, fx=fx, fx_small=small)


def price(a, b, la="Original price", lb="New price"):
    return dtable([[la, a], [lb, b]])


# ------------------------------------------------------------------ Term 1 --
def term1():
    s1 = Session(1, 1, 1, [
        q(f"Find the length of the hypotenuse, <i>c</i>.",
          D.rt_tri(8, 6, legs=("8 cm", "6 cm"), hyp="<i>c</i>", unknown=1, orient=1), "pyth_hyp", "10 cm"),
        q("Find the area of this triangle.",
          D.tri_height(10, 3.0, 7, "10 cm", "7 cm"), "a_tri", "35 cm\u00b2"),
        q("Find the volume of this rectangular prism.",
          D.box(5, 4, 3, ("5 cm", "4 cm", "3 cm")), "v_rect", "60 cm\u00b3"),
        q("Calculate.", display("15% of $80"), "pct_qty", "$12"),
        q("Find the mean of these scores.",
          dtable([["Scores", "4", "7", "9", "6", "9"]]), "mean", "7"),
    ])
    s2 = Session(1, 1, 2, [
        q(f"Find the value of {X}.",
          D.angle_tri(65, 48, ("65" + DEG, "48" + DEG, X + DEG)), "ang_tri", "67"),
        q("Find the area of this circle, correct to 1 decimal place.",
          D.circle_r("4 cm"), "a_circle", "50.3 cm\u00b2"),
        q("The shaded face has an area of 12 cm\u00b2. Find the volume of the prism.",
          D.prism_area([(0, 0), (6, 0), (3, 4)], 8, "", "8 cm"), "v_prism", "96 cm\u00b3"),
        q("A car travels from A to B. Find its average speed.",
          D.journey("240 km", "3 hours"), "speed", "80 km/h"),
        q("One marble is chosen at random from this bag. Find the probability that it is blue.",
          dtable([["Colour", "Red", "Blue", "Green"], ["Marbles", "3", "5", "2"]]), "prob", "1/2"),
    ])
    s3 = Session(1, 1, 3, [
        q(f"Find the value of {X}.",
          D.rt_tri(12, 5, legs=(X, "5 cm"), hyp="13 cm", unknown=0, orient=2), "pyth_short", "12 cm"),
        q("Find the area of this trapezium.",
          D.trapezium(10, 6, 4, 2, ("6 cm", "10 cm", "4 cm")), "a_trap", "32 cm\u00b2"),
        q("Find the volume of this cylinder, correct to 1 decimal place.",
          D.cylinder(3, 10, "3 cm", "10 cm"), "v_cyl", "282.7 cm\u00b3"),
        q("Write as a single power.", display(f"{pw(5, 4)} {TIMES} {pw(5, 3)}"), "idx_mult", "5^7"),
        q("Find the gradient of line AB.", D.plane_line((1, 1), (2, 3)), "gradient", "2"),
    ])
    return [s1, s2, s3]


# ------------------------------------------------------------------ Term 2 --
def term2():
    s1 = Session(2, 1, 1, [
        q(f"Find the value of {X}.",
          D.quad_angles((110, 75, 95, 80), ("110" + DEG, "75" + DEG, "95" + DEG, X + DEG)), "ang_quad", "80"),
        q("Find the area of this parallelogram.",
          D.parallelogram(9, 5, 2.5, ("9 cm", "5 cm")), "a_para", "45 cm\u00b2"),
        q("Find the surface area of this prism.",
          D.box(6, 3, 2, ("6 cm", "3 cm", "2 cm")), "sa_rect", "72 cm\u00b2"),
        q("Find the percentage increase in price.", price("$60", "$75"), "pct_change", "25%"),
        q("Find the range of these scores.",
          dtable([["Scores", "12", "7", "15", "9", "20"]]), "range", "13"),
    ])
    s2 = Session(2, 1, 2, [
        q(f"Find the value of {X}.",
          D.ext_angle(50, 65, ("50" + DEG, "65" + DEG, X + DEG)), "ang_ext", "115"),
        q("Find the circumference of this circle, correct to 1 decimal place.",
          D.circle_d("10 cm", R=42, H=100), "c_circ_d", "31.4 cm"),
        q("Find the surface area of this triangular prism.",
          D.tri_prism(4, 3, 10, ("4 cm", "3 cm", "5 cm", "10 cm"), H=106), "sa_tri", "132 cm\u00b2"),
        q("Find the profit made on this sale.",
          price("$120", "$150", "Cost price", "Selling price"), "profit", "$30"),
        q("Find the probability that it does not rain.", display(f"<i>P</i>(rain) = 0.3"), "prob_not", "0.7"),
    ])
    s3 = Session(2, 1, 3, [
        q("Find the sum of the interior angles of this hexagon.", D.polygon(6, H=104), "ang_poly", "720\u00b0"),
        q("Find the area of this kite.", D.kite(2.5, 5.5, 3, ("8 cm", "6 cm")), "a_kite", "24 cm\u00b2"),
        q("The shaded face has an area of 15 cm\u00b2. Find the volume of the prism.",
          D.prism_area([(0, 0), (6, 0), (5, 3), (1, 3)], 6, "", "6 cm"), "v_prism", "90 cm\u00b3"),
        q("Expand.", display(f"4({X} + 3)"), "distrib", "4x + 12"),
        q(f"Find the value of <i>y</i> when {X} = 4.", display(f"<i>y</i> = 2{X} + 3"), "linear", "11"),
    ])
    return [s1, s2, s3]


# ------------------------------------------------------------------ Term 3 --
def term3():
    s1 = Session(3, 1, 1, [
        q("Find <i>c</i>, correct to 1 decimal place.",
          D.rt_tri(7, 5, legs=("7 cm", "5 cm"), hyp="<i>c</i>", unknown=1, orient=0), "pyth_hyp", "8.6 cm"),
        q("Find the area of this semicircle, correct to 1 decimal place.",
          D.semicircle("6 cm"), "a_semi", "56.5 cm\u00b2"),
        q("Find the volume of this cylinder, correct to 1 decimal place.",
          D.cylinder(5, 8, "5 cm", "8 cm"), "v_cyl", "628.3 cm\u00b3"),
        q("The small rectangle is enlarged to make the large one. Find the scale factor.",
          D.similar_rects((4, 2), (10, 5), ("4 cm", "10 cm"), H=100), "scale", "2.5"),
        q("A fair die is rolled. Find the probability of rolling a number greater than 4.",
          D.dice_row(), "prob", "1/3"),
    ])
    s2 = Session(3, 1, 2, [
        q(f"Find the value of {X}.",
          D.angle_tri(72, 45, ("72" + DEG, "45" + DEG, X + DEG)), "ang_tri", "63"),
        q("Find the area of this trapezium.",
          D.trapezium(12, 8, 5, 1.8, ("8 cm", "12 cm", "5 cm")), "a_trap", "50 cm\u00b2"),
        q("Find the volume of this rectangular prism.",
          D.box(7, 4, 2.5, ("7 cm", "4 cm", "2.5 cm")), "v_rect", "70 cm\u00b3"),
        q("A bus travels from A to B. Find its average speed.",
          D.journey("150 km", "2.5 hours"), "speed", "60 km/h"),
        q("Find the mean of these scores.",
          dtable([["Scores", "12", "15", "9", "18", "11"]]), "mean", "13"),
    ])
    s3 = Session(3, 1, 3, [
        q(f"Find the value of {X}.",
          D.rt_tri(8, 15, legs=("8 cm", X), hyp="17 cm", unknown=2, orient=1), "pyth_short", "15 cm"),
        q("Find the area of this rectangle.", D.rect(12, 7.5, ("12 m", "7.5 m")), "a_rect", "90 m\u00b2"),
        q("Find the surface area of this prism.",
          D.box(6, 5, 4, ("6 cm", "5 cm", "4 cm")), "sa_rect", "148 cm\u00b2"),
        q("Write as a single power.", display(f"{pw(7, 9)} {DIV} {pw(7, 4)}"), "idx_div", "7^5"),
        q("Find the gradient of line AB.", D.plane_line((0, 5), (2, 1)), "gradient", "-2"),
    ])
    return [s1, s2, s3]


# ------------------------------------------------------------------ Term 4 --
def term4():
    s1 = Session(4, 1, 1, [
        q("Find the sum of the interior angles of this octagon.", D.polygon(8, H=104), "ang_poly", "1080\u00b0"),
        q("Find the circumference of this circle, correct to 1 decimal place.",
          D.circle_r("7 cm", R=42, H=100), "c_circ_r", "44.0 cm"),
        q("The shaded face has an area of 20 cm\u00b2. Find the volume of the prism.",
          D.prism_area([(0, 0), (5, 0), (5, 3), (2.5, 5), (0, 3)], 7, "", "7 cm", k=0.5, ang=20, H=112),
          "v_prism", "140 cm\u00b3"),
        q("Calculate.", display("35% of $240"), "pct_qty", "$84"),
        q(f"Find the value of <i>y</i> when {X} = 5.", display(f"<i>y</i> = 3{X} {MINUS} 2"), "linear", "13"),
    ])
    s2 = Session(4, 1, 2, [
        q(f"Find the value of {X}.",
          D.ext_angle(42, 71, ("42" + DEG, "71" + DEG, X + DEG)), "ang_ext", "113"),
        q("Find the area of this triangle.", D.tri_height(12, 4, 9, "12 cm", "9 cm"), "a_tri", "54 cm\u00b2"),
        q("Find the surface area of this triangular prism.",
          D.tri_prism(8, 6, 12, ("8 cm", "6 cm", "10 cm", "12 cm"), H=106), "sa_tri", "336 cm\u00b2"),
        q("Find the percentage decrease in price.", price("$80", "$68"), "pct_change", "15%"),
        q("Find the range of these race times.",
          dtable([["Seconds", "12.4", "13.1", "11.8", "12.9", "13.6"]]), "range", "1.8 s"),
    ])
    s3 = Session(4, 1, 3, [
        q(f"Find the value of {X}.",
          D.quad_angles((88, 102, 95, 75), ("88" + DEG, "102" + DEG, "95" + DEG, X + DEG)), "ang_quad", "75"),
        q("Find the area of this rhombus.", D.kite(5, 5, 3.5, ("10 cm", "7 cm")), "a_kite", "35 cm\u00b2"),
        q("Find the volume of this cylinder, correct to 1 decimal place.",
          D.cylinder(4, 5, "8 cm", "5 cm", dia=True), "v_cyl", "251.3 cm\u00b3"),
        q("Find the loss made on this sale.",
          price("$85", "$60", "Cost price", "Selling price"), "profit", "$25 loss"),
        q("Find the probability of not winning.",
          display(f"<i>P</i>(win) = {frac('3', '8')}"), "prob_not", "5/8"),
    ])
    return [s1, s2, s3]


TERMS = {1: term1, 2: term2, 3: term3, 4: term4}
