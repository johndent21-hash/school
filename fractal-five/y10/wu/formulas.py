# -*- coding: utf-8 -*-
"""The formula library (Year 10).

FX[key] = (printed HTML, small) - printed in the working column in Terms 1-2,
where students copy it before substituting. Terms 3-4 recall it (except the Term 4
pyramid and cone questions, which print theirs: Q.show_formula); the key is kept on
every question for the rotation, the planning index and the answer keys.
"""
from wu import frac, v, TIMES, DIV, MINUS, DEG


THETA = "\u03b8"
NOWRAP = '<span style="white-space:nowrap">'     # keep a bracket on one line when the strip wraps


def sq(x):
    return f"{v(x)}<sup>2</sup>"


FX = {
    "pyth_hyp":   (f"{sq('c')} = {sq('a')} + {sq('b')}", False),
    "pyth_short": (f"{sq('a')} = {sq('c')} {MINUS} {sq('b')}", False),
    "ang_tri":    (f"{v('a')} + {v('b')} + {v('c')} = 180{DEG}", False),
    "ang_quad":   (f"{v('a')} + {v('b')} + {v('c')} + {v('d')} = 360{DEG}", False),
    "ang_poly":   (f"Angle sum = 180{DEG} {TIMES} ({v('n')} {MINUS} 2)", False),
    "ang_ext":    ("Exterior angle = sum of the two interior opposite angles", True),
    "ang_straight": (f"Angles on a straight line add to 180{DEG}", True),
    "ang_point":  (f"Angles at a point add to 360{DEG}", True),
    "ang_vert":   ("Vertically opposite angles are equal", True),
    "ang_corr":   ("Corresponding angles on parallel lines are equal", True),
    "ang_alt":    ("Alternate angles on parallel lines are equal", True),
    "ang_coint":  (f"Co-interior angles on parallel lines add to 180{DEG}", True),
    "a_rect":     (f"{v('A')} = {v('lw')}", False),
    "a_tri":      (f"{v('A')} = \u00bd{v('bh')}", False),
    "a_para":     (f"{v('A')} = {v('bh')}", False),
    "a_trap":     (f"{v('A')} = \u00bd{v('h')}({v('a')} + {v('b')})", False),
    "a_kite":     (f"{v('A')} = \u00bd{v('xy')}", False),
    "c_circ_d":   (f"{v('C')} = \u03c0{v('d')}", False),
    "c_circ_r":   (f"{v('C')} = 2\u03c0{v('r')}", False),
    "a_circle":   (f"{v('A')} = \u03c0{sq('r')}", False),
    "a_semi":     (f"{v('A')} = \u00bd\u03c0{sq('r')}", False),
    "a_sector":   (f"{v('A')} = {frac(v(THETA), '360')} {TIMES} \u03c0{sq('r')}", False),
    "v_prism":    (f"{v('V')} = {v('Ah')}", False),
    "v_rect":     (f"{v('V')} = {v('lwh')}", False),
    "v_cyl":      (f"{v('V')} = \u03c0{sq('r')}{v('h')}", False),
    "sa_rect":    (f"{v('SA')} = 2({v('lw')} + {v('lh')} + {v('wh')})", False),
    "sa_tri":     (f"{v('SA')} = 2 {TIMES} area of triangle + area of the 3 rectangles", True),
    "sa_cyl":     (f"{v('SA')} = 2\u03c0{sq('r')} + 2\u03c0{v('rh')}", False),
    # capacity: the volume formula plus the conversion the question needs
    "cap_rect_ml": (f"{v('V')} = {v('lwh')},\u2003 1 cm\u00b3 = 1 mL", False),
    "cap_rect_l":  (f"{v('V')} = {v('lwh')},\u2003 1000 cm\u00b3 = 1 L", False),
    "cap_rect_m3": (f"{v('V')} = {v('lwh')},\u2003 1 m\u00b3 = 1000 L", False),
    "cap_cyl_ml":  (f"{v('V')} = \u03c0{sq('r')}{v('h')},\u2003 1 cm\u00b3 = 1 mL", False),
    "cap_cyl_l":   (f"{v('V')} = \u03c0{sq('r')}{v('h')},\u2003 1000 cm\u00b3 = 1 L", False),
    "cap_cyl_m3":  (f"{v('V')} = \u03c0{sq('r')}{v('h')},\u2003 1 m\u00b3 = 1000 L", False),
    "idx_mult":   (f"{v('a')}<sup>{v('m')}</sup> {TIMES} {v('a')}<sup>{v('n')}</sup> = "
                   f"{v('a')}<sup>{v('m')} + {v('n')}</sup>", False),
    "idx_div":    (f"{v('a')}<sup>{v('m')}</sup> {DIV} {v('a')}<sup>{v('n')}</sup> = "
                   f"{v('a')}<sup>{v('m')} {MINUS} {v('n')}</sup>", False),
    "idx_pow":    (f"({v('a')}<sup>{v('m')}</sup>)<sup>{v('n')}</sup> = {v('a')}<sup>{v('mn')}</sup>", False),
    "idx_zero":   (f"{v('a')}<sup>0</sup> = 1", False),
    "distrib":    (f"{v('a')}({v('b')} + {v('c')}) = {v('ab')} + {v('ac')}", False),
    "pct_qty":    (f"Amount = {frac('percentage', '100')} {TIMES} quantity", False),
    "pct_change": (f"% change = {frac('change', 'original')} {TIMES} 100%", False),
    "pct_inc":    (f"New amount = original {TIMES} {NOWRAP}(100% + increase)</span>", True),
    "pct_dec":    (f"New amount = original {TIMES} {NOWRAP}(100% {MINUS} decrease)</span>", True),
    "pct_orig":   (f"Original amount = known amount {DIV} its percentage {TIMES} 100", True),
    "profit":     (f"Profit = selling price {MINUS} cost price", False),
    "speed":      (f"Speed = {frac('distance', 'time')}", False),
    "scale":      (f"Scale factor = {frac('image length', 'original length')}", False),
    "prob":       (f"{v('P')}(E) = {frac('favourable outcomes', 'total outcomes')}", False),
    "prob_not":   (f"{v('P')}(not E) = 1 {MINUS} {v('P')}(E)", False),
    "mean":       (f"Mean = {frac('sum of scores', 'number of scores')}", False),
    "range":      (f"Range = highest {MINUS} lowest", False),
    "gradient":   (f"{v('m')} = {frac('rise', 'run')}", False),
    "linear":     (f"{v('y')} = {v('mx')} + {v('c')}", False),
}


# ------------------------------------------------------------------ Year 10 --
THIRD = frac("1", "3")
_TRIG = (f"sin {v(THETA)} = {frac('O', 'H')},\u2002 cos {v(THETA)} = {frac('A', 'H')},\u2002 "
         f"tan {v(THETA)} = {frac('O', 'A')}")
_INV = (f"{v(THETA)} = sin<sup>{MINUS}1</sup>{frac('O', 'H')}, cos<sup>{MINUS}1</sup>{frac('A', 'H')} or "
        f"tan<sup>{MINUS}1</sup>{frac('O', 'A')}")
_WAGE = f"Pay = hourly rate {TIMES} hours"
FX.update({
    # A  right-angled triangles and similar figures (one printed strip, a key per ratio so they rotate)
    "trig_sin": (_TRIG, True), "trig_cos": (_TRIG, True), "trig_tan": (_TRIG, True),
    "trig_inv_sin": (_INV, True), "trig_inv_cos": (_INV, True), "trig_inv_tan": (_INV, True),
    # B  area, surface area and volume
    "arc":        (f"{v('l')} = {frac(v(THETA), '360')} {TIMES} 2\u03c0{v('r')}", False),
    "v_pyramid":  (f"{v('V')} = {THIRD}{v('Ah')}\u2003({v('A')} = area of the base)", False),
    "v_cone":     (f"{v('V')} = {THIRD}\u03c0{sq('r')}{v('h')}", False),
    # C  percentages and money
    "profit_pct": (f"Percentage profit = {frac('profit', 'cost price')} {TIMES} 100%", True),
    "loss_pct":   (f"Percentage loss = {frac('loss', 'cost price')} {TIMES} 100%", True),
    "interest":   (f"{v('I')} = {v('Prn')}\u2003(interest = amount {TIMES} yearly interest rate {TIMES} "
                   f"number of years)", True),
    "wage":       (_WAGE, False),
    "wage_t15":   (f"{_WAGE};<br>time-and-a-half = 1.5 {TIMES} hourly rate", True),
    "wage_dt":    (f"{_WAGE};<br>double time = 2 {TIMES} hourly rate", True),
    "salary_w":   (f"Weekly pay = yearly salary {DIV} 52", True),
    "salary_f":   (f"Fortnightly pay = yearly salary {DIV} 26", True),
    "commission": (f"Commission = percentage {TIMES} value of sales", True),
    "commission_base": (f"Pay = base wage + commission,<br>where commission = percentage {TIMES} sales", True),
    "holiday":    (f"Holiday pay = 4 weeks\u2019 pay + 17.5% of 4 weeks\u2019 pay", True),
    # D  indices, formulas and rates
    "idx_neg":    (f"{v('a')}<sup>{MINUS}{v('n')}</sup> = {frac('1', v('a') + '<sup>' + v('n') + '</sup>')}", False),
    "sci":        (f"{v('a')} {TIMES} 10<sup>{v('n')}</sup>, where 1 \u2264 {v('a')} &lt; 10", False),
    "fs_vuat":    (f"{v('v')} = {v('u')} + {v('at')}", False),
    "fs_perim":   (f"{v('P')} = 2({v('l')} + {v('w')})", False),
    "fs_cost":    (f"{v('C')} = 5 + 2.4{v('d')}", False),
    "fs_temp":    (f"{v('F')} = 1.8{v('C')} + 32", False),
    "fs_tri":     (f"{v('A')} = \u00bd{v('bh')}", False),
    "fs_line":    (f"{v('y')} = {v('mx')} + {v('c')}", False),
    "ratio":      (f"One part = amount {DIV} total number of parts", True),
    # E  straight-line graphs, data and probability
    "linear_si":  (f"{v('y')} = {v('mx')} + {v('c')}\u2003({v('m')} = gradient, {v('c')} = {v('y')}-intercept)", True),
    "mean_freq":  (f"Mean = {frac(chr(931) + v('fx'), chr(931) + v('f'))}", False),
    "freq_rel":   (f"Relative frequency = frequency {DIV} number of trials", True),
    "freq_exp":   (f"Expected frequency = {v('P')}(E) {TIMES} number of trials", True),
})
