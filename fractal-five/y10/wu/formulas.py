# -*- coding: utf-8 -*-
"""The formula library for the Year 10 Fractal Five.

FX[key] = (printed HTML, small) - printed in the working column in Terms 1-2 (and for the Term 4
pyramid and cone questions), where students copy it before substituting. Terms 3-4 otherwise recall
it; the key is kept on every question for the formula counts and the answer keys.
"""
from wu import frac, v, TIMES, DIV, MINUS


THETA = "θ"
NOWRAP = '<span style="white-space:nowrap">'     # keep a bracket on one line when the strip wraps


def sq(x):
    return f"{v(x)}<sup>2</sup>"


def nw(s):
    return f"{NOWRAP}{s}</span>"


T, O, A, H = v(THETA), v("O"), v("A"), v("H")
TRIG = (f"{nw(f'sin {T} = ' + frac(O, H))},\u2002{nw(f'cos {T} = ' + frac(A, H))},\u2002"
        f"{nw(f'tan {T} = ' + frac(O, A))}")
INV = f"<sup>{MINUS}1</sup>"
TRIG_INV = (f"{T} = {nw(f'sin{INV}({O}/{H})')}, {nw(f'cos{INV}({A}/{H})')} or {nw(f'tan{INV}({O}/{A})')}")

FX = {
    # A  right-angled triangles and similar figures
    "pyth_hyp":   (f"{sq('c')} = {sq('a')} + {sq('b')}", False),
    "pyth_short": (f"{sq('a')} = {sq('c')} {MINUS} {sq('b')}", False),
    "trig":       (TRIG, True),
    "trig_inv":   (TRIG_INV, True),
    "similar":    (f"Scale factor = {frac('image length', 'original length')}", False),
    # B  area, surface area and volume
    "a_circle":   (f"{v('A')} = π{sq('r')}", False),
    "arc":        (f"{v('l')} = {frac(T, '360')} {TIMES} 2π{v('r')}", False),
    "sector":     (f"{v('A')} = {frac(T, '360')} {TIMES} π{sq('r')}", False),
    "sa_rect":    (f"{v('SA')} = 2({v('lw')} + {v('lh')} + {v('wh')})", False),
    "sa_cyl":     (f"{v('SA')} = 2π{sq('r')} + 2π{v('rh')}", False),
    "v_prism":    (f"{v('V')} = {v('Ah')}", False),
    "v_cyl":      (f"{v('V')} = π{sq('r')}{v('h')}", False),
    "capacity":   (f"{v('V')} = {v('lwh')},  1000 cm³ = 1 L", False),
    "v_pyramid":  (f"{v('V')} = {frac('1', '3')}{v('Ah')} ({v('A')} = area of the base)", False),
    "v_cone":     (f"{v('V')} = {frac('1', '3')}π{sq('r')}{v('h')}", False),
    # C  percentages and money
    "pct_inc":    (f"New amount = original {TIMES} {NOWRAP}(100% + increase)</span>", True),
    "pct_dec":    (f"New amount = original {TIMES} {NOWRAP}(100% {MINUS} decrease)</span>", True),
    "pct_orig":   (f"Original amount = amount {DIV} its percentage {TIMES} 100", True),
    "profit_pct": (f"Percentage profit = {frac('profit', 'cost price')} {TIMES} 100%", True),
    "loss_pct":   (f"Percentage loss = {frac('loss', 'cost price')} {TIMES} 100%", True),
    "interest":   (f"{v('I')} = {v('Prn')} <span class=\"fxn\">(interest = amount {TIMES} yearly interest rate "
                   f"{TIMES} number of years)</span>", True),
    "wage":       (f"Pay = hourly rate {TIMES} hours", False),
    "wage_t15":   (f"Pay = hourly rate {TIMES} hours; time-and-a-half = 1.5 {TIMES} hourly rate", True),
    "wage_dt":    (f"Pay = hourly rate {TIMES} hours; double time = 2 {TIMES} hourly rate", True),
    "salary_w":   (f"Weekly pay = yearly salary {DIV} 52", True),
    "salary_f":   (f"Fortnightly pay = yearly salary {DIV} 26", True),
    "commission": (f"Commission = percentage {TIMES} value of sales", True),
    "comm_base":  (f"Pay = base wage + percentage {TIMES} value of sales", True),
    "holiday":    (f"Holiday pay = 4 weeks’ pay + 17.5% of 4 weeks’ pay", True),
    # D  indices, formulas and rates
    "idx_mult":   (f"{v('a')}<sup>{v('m')}</sup> {TIMES} {v('a')}<sup>{v('n')}</sup> = "
                   f"{v('a')}<sup>{v('m')} + {v('n')}</sup>", False),
    "idx_div":    (f"{v('a')}<sup>{v('m')}</sup> {DIV} {v('a')}<sup>{v('n')}</sup> = "
                   f"{v('a')}<sup>{v('m')} {MINUS} {v('n')}</sup>", False),
    "idx_pow":    (f"({v('a')}<sup>{v('m')}</sup>)<sup>{v('n')}</sup> = {v('a')}<sup>{v('mn')}</sup>", False),
    "zero_neg":   (f"{v('a')}<sup>0</sup> = 1,  {v('a')}<sup>{MINUS}{v('n')}</sup> = "
                   f"{frac('1', v('a') + '<sup>' + v('n') + '</sup>')}", False),
    "sci":        (f"{v('a')} {TIMES} 10<sup>{v('n')}</sup>, where 1 ≤ {v('a')} &lt; 10", False),
    "fs_v":       (f"{v('v')} = {v('u')} + {v('at')}", False),
    "fs_P":       (f"{v('P')} = 2({v('l')} + {v('w')})", False),
    "fs_C":       (f"{v('C')} = 5 + 2.4{v('d')}", False),
    "fs_F":       (f"{v('F')} = 1.8{v('C')} + 32", False),
    "fs_A":       (f"{v('A')} = ½{v('bh')}", False),
    "fs_y":       (f"{v('y')} = {v('mx')} + {v('c')}", False),
    "ratio":      (f"One part = amount {DIV} total number of parts", True),
    "speed":      (f"Speed = {frac('distance', 'time')}", False),
    # E  straight-line graphs, data and probability
    "gradient":   (f"{v('m')} = {frac('rise', 'run')}", False),
    "linear":     (f"{v('y')} = {v('mx')} + {v('c')}", False),
    "mean":       (f"Mean = {frac('sum of scores', 'number of scores')}", False),
    "mean_freq":  (f"Mean = {frac('&Sigma;' + v('fx'), '&Sigma;' + v('f'))}", False),
    "prob":       (f"{v('P')}(E) = {frac('favourable outcomes', 'total outcomes')}", False),
    "prob_not":   (f"{v('P')}(not E) = 1 {MINUS} {v('P')}(E)", False),
    "rel_freq":   (f"Relative frequency = {frac('frequency', 'number of trials')}", True),
    "exp_freq":   (f"Expected frequency = {v('P')}(E) {TIMES} number of trials", True),
}
