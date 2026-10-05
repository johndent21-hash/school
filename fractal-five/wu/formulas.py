# -*- coding: utf-8 -*-
"""The formula library: one entry per formula on the Year 8 list.

FX[key] = (printed HTML, small) - printed in the working column in Terms 1-2,
where students copy it before substituting. Terms 3-4 recall it; the key is
kept on every question for the planning index and answer keys.
"""
from wu import frac, v, TIMES, DIV, MINUS, DEG


def sq(x):
    return f"{v(x)}<sup>2</sup>"


FX = {
    "pyth_hyp":   (f"{sq('c')} = {sq('a')} + {sq('b')}", False),
    "pyth_short": (f"{sq('a')} = {sq('c')} {MINUS} {sq('b')}", False),
    "ang_tri":    (f"{v('a')} + {v('b')} + {v('c')} = 180{DEG}", False),
    "ang_quad":   (f"{v('a')} + {v('b')} + {v('c')} + {v('d')} = 360{DEG}", False),
    "ang_poly":   (f"Angle sum = 180{DEG} {TIMES} ({v('n')} {MINUS} 2)", False),
    "ang_ext":    ("Exterior angle = sum of the two interior opposite angles", True),
    "a_rect":     (f"{v('A')} = {v('lw')}", False),
    "a_tri":      (f"{v('A')} = \u00bd{v('bh')}", False),
    "a_para":     (f"{v('A')} = {v('bh')}", False),
    "a_trap":     (f"{v('A')} = \u00bd{v('h')}({v('a')} + {v('b')})", False),
    "a_kite":     (f"{v('A')} = \u00bd{v('xy')}", False),
    "c_circ_d":   (f"{v('C')} = \u03c0{v('d')}", False),
    "c_circ_r":   (f"{v('C')} = 2\u03c0{v('r')}", False),
    "a_circle":   (f"{v('A')} = \u03c0{sq('r')}", False),
    "a_semi":     (f"{v('A')} = \u00bd\u03c0{sq('r')}", False),
    "v_prism":    (f"{v('V')} = {v('Ah')}", False),
    "v_rect":     (f"{v('V')} = {v('lwh')}", False),
    "v_cyl":      (f"{v('V')} = \u03c0{sq('r')}{v('h')}", False),
    "sa_rect":    (f"{v('SA')} = 2({v('lw')} + {v('lh')} + {v('wh')})", False),
    "sa_tri":     (f"{v('SA')} = 2 {TIMES} area of triangle + area of the 3 rectangles", True),
    "idx_mult":   (f"{v('a')}<sup>{v('m')}</sup> {TIMES} {v('a')}<sup>{v('n')}</sup> = "
                   f"{v('a')}<sup>{v('m')} + {v('n')}</sup>", False),
    "idx_div":    (f"{v('a')}<sup>{v('m')}</sup> {DIV} {v('a')}<sup>{v('n')}</sup> = "
                   f"{v('a')}<sup>{v('m')} {MINUS} {v('n')}</sup>", False),
    "idx_pow":    (f"({v('a')}<sup>{v('m')}</sup>)<sup>{v('n')}</sup> = {v('a')}<sup>{v('mn')}</sup>", False),
    "distrib":    (f"{v('a')}({v('b')} + {v('c')}) = {v('ab')} + {v('ac')}", False),
    "pct_qty":    (f"Amount = {frac('percentage', '100')} {TIMES} quantity", False),
    "pct_change": (f"% change = {frac('change', 'original')} {TIMES} 100%", False),
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
