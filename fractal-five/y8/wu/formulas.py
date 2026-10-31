# -*- coding: utf-8 -*-
"""The formula library for the Year 8 Fractal Five.

FX[key] = (printed HTML, size) - printed in the working column whenever the formula is given (every
Mainstream session; Advanced Terms 1-2), where students copy it before substituting. Advanced Terms
3-4 recall it; the key is kept on every question for the formula counts and the answer keys.
size: False = normal, True = small (8.7 pt), "xs" = extra small (7.8 pt) for the long rules.
"""
from wu import frac, v, TIMES, DIV, MINUS, DEG


def sq(x):
    return f"{v(x)}<sup>2</sup>"


def nw(s):
    return f'<span style="white-space:nowrap">{s}</span>'


def sqrt(x):
    """Square root with a vinculum (the fonts have the radical sign)."""
    return f'<span class="rad">√<span class="rv">{x}</span></span>'


def cbrt(x):
    """Cube root: a small raised 3 on the radical (the fonts have no cube-root character)."""
    return f'<span class="rad"><span class="ri">3</span>√<span class="rv">{x}</span></span>'


PCT = "%"
ROOTS = f"{sqrt(v('a') + '<sup>2</sup>')} = {v('a')},&ensp;{cbrt(v('a') + '<sup>3</sup>')} = {v('a')}"
POWS = f"{v('a')}<sup>{v('n')}</sup> = {v('a')} {TIMES} {v('a')} {TIMES} … {TIMES} {v('a')} ({v('n')} times)"
P10 = (f"{TIMES} 10, 100, 1000: digits move 1, 2, 3 places left; {DIV} 10, 100, 1000: they move right")
EQ = "Do the same to both sides"
TIME24 = "24-hour time: pm hours add 12 (1:00 pm = 13:00); 12:00 am = 00:00"
TDIFF = "Time taken = finish time " + MINUS + " start time (60 minutes = 1 hour)"

FX = {
    # A  angles and shapes (+ Pythagoras, Advanced Terms 3-4)
    "ang_comp":   (f"Complementary angles add to 90{DEG}", True),
    "ang_supp":   (f"Supplementary angles add to 180{DEG}", True),
    "ang_point":  (f"Angles at a point add to 360{DEG}", True),
    "ang_vert":   ("Vertically opposite angles are equal", True),
    "ang_corr":   ("Corresponding angles are equal", True),
    "ang_alt":    ("Alternate angles are equal", True),
    "ang_coint":  (f"Co-interior angles add to 180{DEG}", True),
    "ang_tri":    (f"{v('a')} + {v('b')} + {v('c')} = 180{DEG}", False),
    "ang_ext":    ("Exterior angle = sum of the two interior opposite angles", True),
    "ang_quad":   (f"{v('a')} + {v('b')} + {v('c')} + {v('d')} = 360{DEG}", False),
    "pyth_hyp":   (f"{sq('c')} = {sq('a')} + {sq('b')}", False),
    "pyth_short": (f"{sq('a')} = {sq('c')} {MINUS} {sq('b')}", False),
    # B  measurement
    "p_rect":     (f"{v('P')} = 2({v('l')} + {v('w')})", False),
    "p_square":   (f"{v('P')} = 4{v('s')}", False),
    "p_poly":     ("Perimeter = add the lengths of all the sides", True),
    "c_circ_d":   (f"{v('C')} = π{v('d')}", False),
    "c_circ_r":   (f"{v('C')} = 2π{v('r')}", False),
    "a_rect":     (f"{v('A')} = {v('lw')}", False),
    "a_square":   (f"{v('A')} = {sq('s')}", False),
    "a_tri":      (f"{v('A')} = ½{v('bh')}", False),
    "a_para":     (f"{v('A')} = {v('bh')}", False),
    "a_comp":     ("Area of a composite shape = add (or subtract) the areas of its parts", True),
    "v_rect":     (f"{v('V')} = {v('lwh')}", False),
    "u_len":      ("1 cm = 10 mm,&ensp;1 m = 100 cm,&ensp;1 km = 1000 m", True),
    "u_area":     ("1 m<sup>2</sup> = 10&nbsp;000 cm<sup>2</sup>", False),
    "u_vol":      ("1 cm<sup>3</sup> = 1 mL,&ensp;1 L = 1000 mL", False),
    "a_trap":     (f"{v('A')} = ½{v('h')}({v('a')} + {v('b')})", False),
    "a_kite":     (f"{v('A')} = ½{v('xy')}", False),
    "a_circle":   (f"{v('A')} = π{sq('r')}", False),
    # C  number and percentages
    "order_ops":  (f"Brackets first, then {TIMES} and {DIV} from left to right, then + and {MINUS} "
                   "from left to right", "xs"),
    "idx_eval":   (f"{POWS};&ensp;{ROOTS}", "xs"),
    "root_eval":  (f"{POWS};&ensp;{ROOTS}", "xs"),
    "frac_qty":   (f"Fraction of a quantity = fraction {TIMES} quantity", True),
    "pct_qty":    (f"Percentage of a quantity = percentage {DIV} 100 {TIMES} quantity", True),
    "pct_express": (f"Percentage = part {DIV} whole {TIMES} 100%", True),
    "pow10_mul":  (P10, "xs"),
    "pow10_div":  (P10, "xs"),
    "f2d":        (f"Fraction to decimal: numerator {DIV} denominator", True),
    "d2f":        ("Decimal to fraction: write over 10, 100 or 1000, then simplify", True),
    "f2p":        (f"Fraction to percentage: fraction {TIMES} 100%", True),
    "p2f":        ("Percentage to fraction: write over 100, then simplify", True),
    "d2p":        (f"Decimal to percentage: decimal {TIMES} 100%", True),
    "p2d":        (f"Percentage to decimal: percentage {DIV} 100", True),
    "idx_mult":   (f"{v('a')}<sup>{v('m')}</sup> {TIMES} {v('a')}<sup>{v('n')}</sup> = "
                   f"{v('a')}<sup>{v('m')} + {v('n')}</sup>", False),
    "idx_div":    (f"{v('a')}<sup>{v('m')}</sup> {DIV} {v('a')}<sup>{v('n')}</sup> = "
                   f"{v('a')}<sup>{v('m')} {MINUS} {v('n')}</sup>", False),
    "idx_pow":    (f"({v('a')}<sup>{v('m')}</sup>)<sup>{v('n')}</sup> = {v('a')}<sup>{v('mn')}</sup>", False),
    "pct_inc":    (f"New amount = original {TIMES} {nw('(100% + increase)')}", True),
    "pct_dec":    (f"New amount = original {TIMES} {nw('(100% ' + MINUS + ' decrease)')}", True),
    "profit_pct": (f"Percentage profit = {frac('profit', 'cost price')} {TIMES} 100%", True),
    "loss_pct":   (f"Percentage loss = {frac('loss', 'cost price')} {TIMES} 100%", True),
    # D  algebra, ratio and rates (subst prints the question's own expression: gen.g_subst)
    "subst":      ("Substitute, then evaluate", False),
    "distrib":    (f"{v('a')}({v('b')} + {v('c')}) = {v('ab')} + {v('ac')}", False),
    "eq_one":     (EQ, False),
    "eq_two":     (EQ, False),
    "ratio_simp": ("Divide both parts by their highest common factor", True),
    "ratio_share": (f"One part = amount {DIV} total number of parts", True),
    "rate":       (f"Unit rate = amount {DIV} number of units", True),
    "best_buy":   (f"Price per unit = price {DIV} number of units; best buy = lowest price per unit", "xs"),
    "speed":      (f"Speed = {frac('distance', 'time')}", False),
    "t_conv":     (TIME24, True),
    "t_diff":     (TDIFF, True),
    # E  number plane, data and chance
    "tv_table":   (f"Substitute each {v('x')} into the rule", True),
    "tv_point":   (f"Substitute each {v('x')} into the rule", True),
    "mean":       (f"Mean = {frac('sum of scores', 'number of scores')}", False),
    "median":     ("Median = middle score when the scores are in order", True),
    "mode":       ("Mode = the most common score", True),
    "range":      (f"Range = highest {MINUS} lowest", False),
    "prob":       (f"{v('P')}(E) = {frac('favourable outcomes', 'total outcomes')}", False),
    "prob_not":   (f"{v('P')}(not E) = 1 {MINUS} {v('P')}(E)", False),
    "exp_prob":   (f"Experimental probability = frequency {DIV} number of trials", True),
}
