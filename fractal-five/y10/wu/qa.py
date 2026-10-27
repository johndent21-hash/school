# -*- coding: utf-8 -*-
"""Rule checks for the four Year 10 booklets, and the family / formula count tables.

    python3 wu/qa.py            (run after build_all.py; reads the sessions the build makes)

Checks, per term:
  * 30 sessions (Weeks 1-10 x 3), 5 questions each, one from each strand A-E in order
  * no family in two consecutive sessions (nor trig_ratio / trig_top / trig_bottom next to each other:
    they print the same formula)
  * no repeated question within a term
  * every family at least 3 times (Term 4 strand B: exactly 3 each); v_pyramid and v_cone in Term 4 only
  * Level 1 (Terms 1-2) draws only Level 1 items; Level 2 (Terms 3-4) only Level 2 items or the half of
    Level 1 that Level 2 includes
  * Level 1: every number printed in a question is whole, apart from the families whose nature needs
    decimals (probability, scientific notation, the formula_sub constants, leave loading); answers are
    whole numbers or whole dollars, fractions where the question asks for one, or 1 decimal place /
    the nearest degree where the question says so
  * angles of elevation/depression: none in Terms 1-2, about a third of trig_top + trig_angle in Terms 3-4
  * printed formulas: every question in Terms 1-2; in Terms 3-4 only the Term 4 pyramid and cone
  * Term 4 Week 1 has a pyramid or a cone question
  * wu/answers_termN.json matches the questions in the booklet
Writes wu/formula_counts.md.
"""
import json
import os
import re
import sys
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import build_all  # noqa: E402
import gen  # noqa: E402
from formulas import FX  # noqa: E402

DEC_OK = {"prob", "prob_not", "freq", "sci", "formula_sub", "holiday_pay"}
FAMILY_NAMES = {
    "pyth_hyp": "Pythagoras: hypotenuse", "pyth_short": "Pythagoras: shorter side",
    "trig_ratio": "Trig ratio as a fraction", "trig_top": "Trig: unknown side on top (x = side × ratio)",
    "trig_bottom": "Trig: unknown side on the bottom (x = side ÷ ratio)", "trig_angle": "Trig: find the angle",
    "similar": "Similar figures: scale factor", "a_circle": "Area of a circle", "arc": "Arc length",
    "sector": "Area of a sector", "sa_rect": "Surface area: rectangular prism", "sa_cyl": "Surface area: closed cylinder",
    "v_prism": "Volume: prism V = Ah", "v_cyl": "Volume: cylinder", "capacity": "Capacity in litres",
    "v_pyramid": "Volume: pyramid (Term 4)", "v_cone": "Volume: cone (Term 4)",
    "pct_change": "Percentage increase / decrease", "pct_original": "Original amount", "profit_pct": "Percentage profit / loss",
    "interest": "Simple interest", "wages": "Wages and overtime", "salary": "Salary to weekly / fortnightly pay",
    "commission": "Commission", "holiday_pay": "Holiday pay with leave loading",
    "idx": "Index laws (with coefficients)", "zero_neg": "Zero and negative indices", "sci": "Scientific notation",
    "formula_sub": "Substitute into a formula", "ratio": "Share in a ratio", "speed": "Speed",
    "gradient": "Gradient (rise over run)", "linear": "y = mx + c", "mean": "Mean (incl. frequency tables)",
    "prob": "Probability", "prob_not": "Complementary events", "freq": "Relative and expected frequency",
}


def plain(h):
    return re.sub(r"<[^>]+>", " ", h or "").replace("−", "-").replace(" ", "")


def numbers_shown(q):
    txt = plain(q.text) + " " + plain(q.fig)
    txt = re.sub(r"\d+(?:\.\d+)?\s*decimal place", " ", txt)
    txt = re.sub(r"\b[A-B]\((\d+), (\d+)\)", r" \1 \2 ", txt)
    return [float(v.replace(",", "")) for v in re.findall(r"\d[\d,]*(?:\.\d+)?", txt)]


def tidy_l1(q):
    a = q.answer.replace("−", "-").replace(",", "").replace(" ", "")
    if "decimal place" in q.text:
        return re.fullmatch(r"-?\d+\.\d( \S+)?", a) is not None
    if "nearest degree" in q.text:
        return re.fullmatch(r"\d+°", a) is not None
    if q.fam in ("prob", "prob_not", "freq", "trig_ratio", "idx", "zero_neg", "sci", "linear"):
        return True
    v = re.findall(r"-?\d+(?:\.\d+)?", a)
    return bool(v) and all(float(x) == int(float(x)) for x in v)


def main():
    problems = []
    counts, fam_counts = {}, {}
    for t in (1, 2, 3, 4):
        S, seqs = build_all.term_sessions(t)
        rounds = build_all.fix_overflow(S)
        P = lambda msg: problems.append(f"T{t}: {msg}")  # noqa: E731
        print(f"T{t}: overflow check passes ({rounds} shrink round{'s' if rounds != 1 else ''})")
        if [(s.week, s.session) for s in S] != [(w, k) for w in range(1, 11) for k in (1, 2, 3)]:
            P("sessions are not Weeks 1-10 x 3")
        for s in S:
            fams = [q.fam for q in s.qs]
            if len(s.qs) != 5 or any(f not in gen.families(X, t) for f, X in zip(fams, "ABCDE")):
                P(f"W{s.week} S{s.session}: not one question per strand {fams}")
        for X in "ABCDE":
            seq = [s.qs["ABCDE".index(X)].fam for s in S]
            for i in range(1, 30):
                if not gen._ok_pair(seq[i - 1], seq[i]):
                    P(f"strand {X}: {seq[i - 1]} then {seq[i]} in sessions {i} and {i + 1}")
            for f in gen.families(X, t):
                if seq.count(f) < 3:
                    P(f"{f} appears {seq.count(f)} times (< 3)")
                if t == 4 and X == "B" and seq.count(f) != 3:
                    P(f"Term 4: {f} appears {seq.count(f)} times (want exactly 3)")
        allq = [q for s in S for q in s.qs]
        if t < 4 and any(q.fam in ("v_pyramid", "v_cone") for q in allq):
            P("pyramid or cone outside Term 4")
        sigs = Counter(gen.qsig(q) for q in allq)
        for sig, n in sigs.items():
            if n > 1:
                P(f"repeated question x{n}: {sig}")
        pools = gen.Pools(t)
        for s in S:
            for q in s.qs:
                if q.item not in pools.items(q.fam):
                    P(f"W{s.week} S{s.session} {q.fam}: item {q.item!r} is not in this level's pool")
                printed = s.given or q.show_formula
                if t <= 2 and not printed:
                    P(f"W{s.week} S{s.session} {q.fam}: no printed formula in Terms 1-2")
                if t >= 3 and printed != (t == 4 and q.fam in ("v_pyramid", "v_cone")):
                    P(f"W{s.week} S{s.session} {q.fam}: printed formula in a from-memory term")
        if t <= 2:
            for s in S:
                for q in s.qs:
                    if q.fam not in DEC_OK and any(v != int(v) for v in numbers_shown(q)):
                        P(f"W{s.week} S{s.session} {q.fam}: Level 1 shows a decimal: {plain(q.text)} | {plain(q.fig)[:60]}")
                    if not tidy_l1(q):
                        P(f"W{s.week} S{s.session} {q.fam}: Level 1 answer not tidy: {q.answer}")
        tq = [q for q in allq if q.fam in ("trig_top", "trig_angle")]
        ne = sum(1 for q in tq if gen.is_elev(q.item))
        if t <= 2 and ne:
            P(f"{ne} elevation/depression items in a Level 1 term")
        if t >= 3 and not (0.2 <= ne / len(tq) <= 0.45):
            P(f"elevation/depression {ne} of {len(tq)} trig_top + trig_angle items (want about a third)")
        if t == 4 and not any(q.fam in ("v_pyramid", "v_cone") for s in S[:3] for q in s.qs):
            P("Term 4 Week 1 has no pyramid or cone")
        rev = Counter(q.fam for q in allq if gen.is_rev(q.item))
        fc = Counter(q.fam for q in allq)
        for f in ("v_prism", "speed"):
            if not (1 <= rev[f] <= max(1, round(fc[f] / 3))):
                P(f"{f}: {rev[f]} of {fc[f]} working-backwards")
        path = os.path.join(HERE, f"answers_term{t}.json")
        if os.path.exists(path):
            key = json.load(open(path))
            mine = [{"week": s.week, "session": s.session, "q": i + 1, "family": q.fam, "formula": q.formula,
                     "answer": q.answer, "question": q.text} for s in S for i, q in enumerate(s.qs)]
            if key != mine:
                P("answers json is out of date (rebuild)")
        counts[t] = Counter(q.formula for q in allq)
        fam_counts[t] = fc
        print(f"T{t}: elevation/depression {ne}/{len(tq)} of trig_top + trig_angle; working backwards "
              + ", ".join(f"{f} {rev[f]}/{fc[f]}" for f in ("v_prism", "speed")))

    lines = ["# Family and formula counts per term", "",
             "Times each family and each printed formula appears in each booklet (30 sessions x 5 questions = "
             "150 per term). Generated by `python3 wu/qa.py`.", "",
             "## By family (the rotation unit; never in two consecutive sessions)", "",
             "| Strand | Family | | T1 | T2 | T3 | T4 |", "|---|---|---|---:|---:|---:|---:|"]
    for X in "ABCDE":
        for f in gen.families(X, 4):
            lines.append(f"| {X} | `{f}` | {FAMILY_NAMES[f]} | " + " | ".join(str(fam_counts[t][f]) for t in (1, 2, 3, 4)) + " |")
    lines.append("| | **Total** | | " + " | ".join(str(sum(fam_counts[t].values())) for t in (1, 2, 3, 4)) + " |")
    lines += ["", "## By formula key", "", "| key | T1 | T2 | T3 | T4 |", "|---|---:|---:|---:|---:|"]
    for k in FX:
        lines.append(f"| `{k}` | " + " | ".join(str(counts[t][k]) for t in (1, 2, 3, 4)) + " |")
    open(os.path.join(HERE, "formula_counts.md"), "w").write("\n".join(lines) + "\n")
    print("\n".join(lines[6:6 + 3 + sum(len(gen.families(X, 4)) for X in "ABCDE")]))
    unused = {t: [k for k in FX if counts[t][k] == 0] for t in (1, 2, 3, 4)}
    for t in (1, 2, 3, 4):
        print(f"T{t}: formula keys not used this term: {unused[t] or 'none'}")
    print(f"\nRULE PROBLEMS: {len(problems)}")
    for p in problems:
        print("  " + p)
    return len(problems)


if __name__ == "__main__":
    sys.exit(1 if main() else 0)
