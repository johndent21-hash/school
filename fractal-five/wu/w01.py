# -*- coding: utf-8 -*-
"""Term 1, Week 1 - three sample sessions.

Every session mixes five strands: geometry (Pythagoras / angles), area,
volume, number (percentages, rates, indices) and statistics / probability /
graphs. Week 1 practises 15 different formulas; Week 2 takes the other 17.
Answers are verified by calculation in build.py before the PDF is written.
"""
import wdia as D
from wu import Q, Session, display, dtable, pw, frac, TIMES, DEG


def week1():
    s1 = Session(1, 1, 1, [
        Q("Find the length of the hypotenuse, <i>c</i>.",
          D.rt_tri(8, 6, legs=("8 cm", "6 cm"), hyp="<i>c</i>", unknown=1, orient=1),
          "Pythagoras' theorem (hypotenuse)", "10 cm"),
        Q("Find the area of this triangle.",
          D.tri_height(10, 3.0, 7, "10 cm", "7 cm"),
          "Area of a triangle", "35 cm\u00b2"),
        Q("Find the volume of this rectangular prism.",
          D.box(5, 4, 3, ("5 cm", "4 cm", "3 cm")),
          "Volume of a rectangular prism", "60 cm\u00b3"),
        Q("Calculate.",
          display("15% of $80"),
          "Percentage of a quantity", "$12"),
        Q("Find the mean of these scores.",
          dtable([["Scores", "4", "7", "9", "6", "9"]]),
          "Mean", "7"),
    ])
    s2 = Session(1, 1, 2, [
        Q("Find the value of <i>x</i>.",
          D.angle_tri(65, 48, ("65" + DEG, "48" + DEG, "<i>x</i>" + DEG)),
          "Angle sum of a triangle", "67"),
        Q("Find the area of this circle, correct to 1 decimal place.",
          D.circle_r("4 cm"),
          "Area of a circle", "50.3 cm\u00b2"),
        Q("The shaded face has an area of 12 cm\u00b2. Find the volume of the prism.",
          D.prism_area([(0, 0), (6, 0), (3, 4)], 8, "", "8 cm"),
          "Volume of a prism", "96 cm\u00b3"),
        Q("A car travels from A to B. Find its average speed.",
          D.journey("240 km", "3 hours"),
          "Speed, distance and time", "80 km/h"),
        Q("One marble is chosen at random from this bag. Find the probability that it is blue.",
          dtable([["Colour", "Red", "Blue", "Green"], ["Marbles", "3", "5", "2"]]),
          "Probability of an event", "1/2"),
    ])
    s3 = Session(1, 1, 3, [
        Q("Find the value of <i>x</i>.",
          D.rt_tri(12, 5, legs=("<i>x</i>", "5 cm"), hyp="13 cm", unknown=0, orient=2),
          "Pythagoras' theorem (shorter side)", "12 cm"),
        Q("Find the area of this trapezium.",
          D.trapezium(10, 6, 4, 2, ("6 cm", "10 cm", "4 cm")),
          "Area of a trapezium", "32 cm\u00b2"),
        Q("Find the volume of this cylinder, correct to 1 decimal place.",
          D.cylinder(3, 10, "3 cm", "10 cm"),
          "Volume of a cylinder", "282.7 cm\u00b3"),
        Q("Write as a single power.",
          display(f"{pw(5, 4)} {TIMES} {pw(5, 3)}"),
          "Index laws (multiplication)", "5\u2077"),
        Q("Find the gradient of line AB.",
          D.plane_line((1, 1), (2, 3)),
          "Gradient", "2"),
    ])
    return [s1, s2, s3]
