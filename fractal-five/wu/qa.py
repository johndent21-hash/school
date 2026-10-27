# -*- coding: utf-8 -*-
"""Rule checks for the four booklets, and the formula-count table.

    python3 wu/qa.py            (run after build_all.py; reads the sessions the build makes)

Checks, per term:
  * 30 sessions (Weeks 1-10 x 3), 5 questions each, one from each strand A-E in order
  * Week 1 is the approved sample, byte-for-byte (hash of its page HTML)
  * no family in two consecutive sessions, and capacity never next to v_rect / v_cyl
  * no repeated question within a term
  * every family at least 3 times (idx at least 4: it has four formulas)
  * Level 1 (Terms 1-2) draws only Level 1 items; Level 2 (Terms 3-4) draws only Level 2 items
    or the half of Level 1 that Level 2 includes
  * Level 1: every number printed in a question (text, labels, tables) is a whole number, apart
    from probabilities; answers are whole numbers, whole dollars, simple fractions/decimals for
    probability and scale, or 1 decimal place where the question asks for it
  * about 1 in 4 working-backwards items in each family that has them; a zero-index item each term
  * wu/answers_termN.json matches the questions in the booklet
Writes wu/formula_counts.md (times each formula appears in each term).
"""
import hashlib
import json
import os
import re
import sys
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import build_all  # noqa: E402
import gen  # noqa: E402
import wu  # noqa: E402
from formulas import FX  # noqa: E402

# sha256 of "".join(wu.page(s) for s in Week 1 sessions) as approved (Sept 2026 build source)
WEEK1_SHA = {1: "ed75dc2752f9760a6f93b43ed05d5aa4bab51e139e4a4a66acaf71212139ea71",
             2: "b083bedcb70517695076056fd0be954f449ce31e03e99950d6808fafab21149e",
             3: "c1a46bdb5a37a40fdec27a9e6404f4ea9b453517a46ef1d4a7cd83108715597a",
             4: "d1586bd3e26ef567a600edf2f3edeabf8444c842223159ae8c6385b4418930db"}
PROB = {"prob", "prob_not"}
NAMES = {
    "pyth_hyp": "Pythagoras: hypotenuse", "pyth_short": "Pythagoras: shorter side", "ang_tri": "Angle sum of a triangle",
    "ang_quad": "Angle sum of a quadrilateral", "ang_poly": "Angle sum of a polygon", "ang_ext": "Exterior angle of a triangle",
    "ang_straight": "Angles on a straight line (new)", "ang_point": "Angles at a point (new)",
    "ang_vert": "Vertically opposite angles (new)", "ang_corr": "Corresponding angles (new)",
    "ang_alt": "Alternate angles (new)", "ang_coint": "Co-interior angles (new)",
    "a_rect": "Area: rectangle", "a_tri": "Area: triangle", "a_para": "Area: parallelogram", "a_trap": "Area: trapezium",
    "a_kite": "Area: rhombus / kite", "c_circ_d": "Circumference C = πd", "c_circ_r": "Circumference C = 2πr",
    "a_circle": "Area: circle", "a_semi": "Area: semicircle", "a_sector": "Area: sector / quadrant (new)",
    "v_prism": "Volume: prism V = Ah", "v_rect": "Volume: rectangular prism", "v_cyl": "Volume: cylinder",
    "sa_rect": "Surface area: rectangular prism", "sa_tri": "Surface area: triangular prism",
    "sa_cyl": "Surface area: closed cylinder (new)",
    "cap_rect_ml": "Capacity: prism, 1 cm³ = 1 mL (new)", "cap_rect_l": "Capacity: prism, 1000 cm³ = 1 L (new)",
    "cap_rect_m3": "Capacity: prism, 1 m³ = 1000 L (new)", "cap_cyl_ml": "Capacity: cylinder, 1 cm³ = 1 mL (new)",
    "cap_cyl_l": "Capacity: cylinder, 1000 cm³ = 1 L (new)", "cap_cyl_m3": "Capacity: cylinder, 1 m³ = 1000 L (new)",
    "idx_mult": "Index law: multiply", "idx_div": "Index law: divide", "idx_pow": "Index law: power of a power",
    "idx_zero": "Zero index a⁰ = 1 (new)", "distrib": "Distributive law", "pct_qty": "Percentage of a quantity",
    "pct_change": "Percentage change", "pct_inc": "Increase by a percentage (new)",
    "pct_dec": "Decrease by a percentage / discount (new)", "pct_orig": "Original amount (new)",
    "profit": "Profit and loss", "speed": "Speed", "scale": "Scale factor", "prob": "Probability",
    "prob_not": "Complementary events", "mean": "Mean", "range": "Range", "gradient": "Gradient", "linear": "y = mx + c",
}


def plain(h):
    return re.sub(r"<[^>]+>", " ", h or "").replace("−", "-")


def numbers_shown(q):
    txt = plain(q.text) + " " + plain(q.fig)
    txt = re.sub(r"\d+(?:\.\d+)?\s*decimal place", " ", txt)
    txt = re.sub(r"\b[A-B]\((\d+), (\d+)\)", r" \1 \2 ", txt)
    return [float(v.replace(",", "")) for v in re.findall(r"\d[\d,]*(?:\.\d+)?", txt)]


def tidy_l1(q):
    a = q.answer.replace("−", "-").replace(",", "")
    if "decimal place" in q.text:
        return re.fullmatch(r"-?\d+\.\d( \S+)?", a) is not None
    if q.fam in PROB or q.fam == "scale":
        return True
    if q.fam in ("idx", "distrib"):
        return True
    v = re.findall(r"-?\d+(?:\.\d+)?", a)
    return bool(v) and float(v[0]) == int(float(v[0]))


def main():
    problems = []
    counts, fam_counts = {}, {}
    for t in (1, 2, 3, 4):
        S, seqs = build_all.term_sessions(t)
        rounds = build_all.fix_overflow(S)
        P = lambda msg: problems.append(f"T{t}: {msg}")  # noqa: E731
        if rounds:
            print(f"T{t}: {rounds} overflow-shrink rounds (figures shrunk to fit)")
        if [(s.week, s.session) for s in S] != [(w, k) for w in range(1, 11) for k in (1, 2, 3)]:
            P("sessions are not Weeks 1-10 x 3")
        for s in S:
            fams = [q.fam for q in s.qs]
            if len(s.qs) != 5 or any(f not in gen.STRANDS[X] for f, X in zip(fams, "ABCDE")):
                P(f"W{s.week} S{s.session}: not one question per strand {fams}")
        if hashlib.sha256("".join(wu.page(s) for s in S[:3]).encode()).hexdigest() != WEEK1_SHA[t]:
            P("Week 1 differs from the approved sample")
        for X in "ABCDE":
            seq = [s.qs["ABCDE".index(X)].fam for s in S]
            for i in range(1, 30):
                if not gen._ok_pair(seq[i - 1], seq[i]):
                    P(f"strand {X}: {seq[i - 1]} then {seq[i]} in sessions {i} and {i + 1}")
            for f in gen.STRANDS[X]:
                need = gen.MIN_FAM.get(f, gen.MIN_PER_TERM)
                if seq.count(f) < need:
                    P(f"{f} appears {seq.count(f)} times (< {need})")
        sigs = Counter(gen.qsig(q) for s in S for q in s.qs)
        for sig, n in sigs.items():
            if n > 1:
                P(f"repeated question x{n}: {sig}")
        pools = gen.Pools(t, S[:3])
        for s in S[3:]:
            for q in s.qs:
                if q.item not in pools.items(q.fam):
                    P(f"W{s.week} S{s.session} {q.fam}: item {q.item!r} is not in this level's pool")
        if t <= 2:
            for s in S:
                for q in s.qs:
                    if q.fam not in PROB and any(v != int(v) for v in numbers_shown(q)):
                        P(f"W{s.week} S{s.session} {q.fam}: Level 1 shows a decimal: {plain(q.text)} | {plain(q.fig)[:60]}")
                    if not tidy_l1(q):
                        P(f"W{s.week} S{s.session} {q.fam}: Level 1 answer not tidy: {q.answer}")
        allq = [q for s in S for q in s.qs]
        for f in sorted(gen.REVERSE):
            fq = [q for q in allq if q.fam == f]
            r = sum(1 for q in fq if gen.is_rev(getattr(q, "item", None)))
            if t >= 3 or f != "circ":
                if not (1 <= r <= max(1, round(len(fq) / 3))):
                    P(f"{f}: {r} of {len(fq)} working-backwards")
        if not any(q.formula == "idx_zero" for q in allq):
            P("no zero-index question")
        key = json.load(open(os.path.join(HERE, f"answers_term{t}.json")))
        mine = [{"week": s.week, "session": s.session, "q": i + 1, "family": q.fam, "formula": q.formula,
                 "answer": q.answer, "question": q.text} for s in S for i, q in enumerate(s.qs)]
        if key != mine:
            P("answers json is out of date (rebuild)")
        counts[t] = Counter(q.formula for q in allq)
        fam_counts[t] = Counter(q.fam for q in allq)
        rev = Counter(q.fam for q in allq if gen.is_rev(getattr(q, "item", None)))
        print(f"T{t}: working backwards " + ", ".join(f"{f} {rev[f]}/{fam_counts[t][f]}" for f in sorted(gen.REVERSE)))

    # ------------------------------------------------------------ table --
    order = list(NAMES)
    assert set(order) == set(FX), set(FX) ^ set(order)
    strand_of = {}
    for X, fams in gen.STRANDS.items():
        for f in fams:
            strand_of[f] = X
    lines = ["# Formula counts per term", "",
             "Times each printed formula appears in each booklet (30 sessions x 5 questions = 150 per term). "
             "Generated by `python3 wu/qa.py`.", "",
             "| Formula | key | T1 | T2 | T3 | T4 |", "|---|---|---:|---:|---:|---:|"]
    for k in order:
        lines.append(f"| {NAMES[k]} | `{k}` | " + " | ".join(str(counts[t][k]) for t in (1, 2, 3, 4)) + " |")
    lines.append("| **Total** | | " + " | ".join(str(sum(counts[t].values())) for t in (1, 2, 3, 4)) + " |")
    lines += ["", "## By family (the rotation unit; never in two consecutive sessions)", "",
              "| Strand | Family | T1 | T2 | T3 | T4 |", "|---|---|---:|---:|---:|---:|"]
    for X, fams in gen.STRANDS.items():
        for f in fams:
            lines.append(f"| {X} | `{f}` | " + " | ".join(str(fam_counts[t][f]) for t in (1, 2, 3, 4)) + " |")
    open(os.path.join(HERE, "formula_counts.md"), "w").write("\n".join(lines) + "\n")
    missing = {t: [k for k in order if counts[t][k] == 0] for t in (1, 2, 3, 4)}
    for t in (1, 2, 3, 4):
        print(f"T{t}: formulas not used this term: {missing[t] or 'none'}")
    print("\n".join(lines[4:4 + len(order) + 3]))
    print(f"\nRULE PROBLEMS: {len(problems)}")
    for p in problems:
        print("  " + p)
    return len(problems)


if __name__ == "__main__":
    sys.exit(1 if main() else 0)
