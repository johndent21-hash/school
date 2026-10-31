# -*- coding: utf-8 -*-
"""Rule checks for the eight Year 8 booklets, and the family / formula count tables.

    python3 wu/qa.py            (reads the sessions the build makes; run after build_all.py to check the json)

Checks, per version and term:
  * 30 sessions (Weeks 1-10 x 3), 5 questions each, one from each strand A-E in order
  * the families allowed: Year 7 families only (Mainstream, Advanced Terms 1-2); Advanced Terms 3-4 add the
    Year 8 families and drop a_rect and units
  * every family at least 3 times, and exactly the weighted count gen.counts() gives
  * no family in two consecutive sessions (reported; the scheduler avoids it wherever the counts allow)
  * no repeated question within a term (gen.qsig = text + figure labels + answer)
  * whole numbers in every question and answer, except: pi answers to 1 decimal place (and the question
    says so), the decimals families (pow10, fdp; units questions may start from a decimal, every units
    answer is whole), and probabilities (fractions)
  * the formula printed in every question (Mainstream, Advanced Terms 1-2) and in none (Advanced Terms 3-4)
  * every item comes from the family's pool; each term prefers items the previous term did not use
  * wu/answers_{M|A}_termN.json matches the questions in the booklet
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

DEC_Q = {"pow10", "fdp", "units"}                   # decimals may appear in the question
DEC_A = {"pow10", "fdp"}                            # decimals may appear in the answer
PI_FAMS = {"circ", "a_circle"}                      # 1 decimal place, and the question says so
FRAC_A = {"prob", "prob_not", "exp_prob", "fdp"}    # fractions in the answer
FAMILY_NAMES = {
    "ang_comp": "Complementary / supplementary angles", "ang_point": "Angles at a point / vertically opposite",
    "ang_par": "Angles on parallel lines", "ang_tri": "Angle sum of a triangle", "ang_ext": "Exterior angle of a triangle",
    "ang_quad": "Angle sum of a quadrilateral", "pyth_hyp": "Pythagoras: hypotenuse (Adv T3-4)",
    "pyth_short": "Pythagoras: shorter side (Adv T3-4)",
    "perimeter": "Perimeter", "circ": "Circumference", "a_rect": "Area: rectangle, square", "a_tri": "Area: triangle",
    "a_para": "Area: parallelogram", "a_comp": "Area: composite shape", "v_rect": "Volume: rectangular prism",
    "units": "Converting units", "a_trap": "Area: trapezium (Adv T3-4)", "a_kite": "Area: rhombus, kite (Adv T3-4)",
    "a_circle": "Area: circle (Adv T3-4)",
    "order_ops": "Order of operations (integers)", "idx_root": "Powers and roots", "frac_qty": "Fraction of a quantity",
    "pct_qty": "Percentage of a quantity", "pct_express": "One quantity as a percentage", "pow10": "× and ÷ by 10, 100, 1000",
    "fdp": "Fractions, decimals, percentages", "idx_laws": "Index laws (Adv T3-4)",
    "pct_change": "Percentage change, profit and loss (Adv T3-4)",
    "subst": "Substitution", "distrib": "Distributive law", "equation": "Equations (one and two step)",
    "ratio_simp": "Simplifying ratios", "ratio_share": "Sharing in a ratio", "rates": "Rates and best buys",
    "speed": "Speed", "time": "24-hour time and time differences",
    "table_vals": "Tables of values / reading points", "mean": "Mean", "med_mode": "Median and mode", "range": "Range",
    "prob": "Probability", "prob_not": "Complementary events", "exp_prob": "Experimental probability",
}


def plain(h):
    return re.sub(r"<[^>]+>", " ", h or "").replace("−", "-").replace(" ", "").replace("&nbsp;", " ")


def numbers_shown(q):
    txt = plain(q.text) + " " + plain(q.fig)
    txt = re.sub(r"\d+(?:\.\d+)?\s*decimal place", " ", txt)
    return [float(v) for v in re.findall(r"\d+(?:\.\d+)?", txt)]


def answer_ok(q):
    a = q.answer.replace("−", "-").replace(" ", "")
    if q.fam in PI_FAMS:
        return "1 decimal place" in q.text and re.fullmatch(r"\d+\.\d \S+", a) is not None
    a = re.sub(r"\^\d+", "", a)
    if q.fam in FRAC_A:
        a = re.sub(r"\d+/\d+", "", a)
    vals = re.findall(r"\d+(?:\.\d+)?", a)
    if q.fam in DEC_A:
        return bool(vals) or "/" in q.answer
    return all(float(v) == int(float(v)) for v in vals)


def main():
    problems = []
    fam_counts, key_counts, repeats_prev, consec = {}, {}, {}, {}
    for v in "MA":
        prev_items = set()
        for t in (1, 2, 3, 4):
            tag = f"{v} T{t}"
            P = lambda msg: problems.append(f"{tag}: {msg}")  # noqa: E731
            S, seqs = build_all.term_sessions(v, t)
            rounds = build_all.fix_overflow(S)
            print(f"{tag}: overflow check passes ({rounds} shrink round{'s' if rounds != 1 else ''})")
            if [(s.week, s.session) for s in S] != [(w, k) for w in range(1, 11) for k in (1, 2, 3)]:
                P("sessions are not Weeks 1-10 x 3")
            for s in S:
                fams = [q.fam for q in s.qs]
                if len(s.qs) != 5 or any(f not in gen.families(X, v, t) for f, X in zip(fams, "ABCDE")):
                    P(f"W{s.week} S{s.session}: not one question per strand {fams}")
            allq = [q for s in S for q in s.qs]
            fc = Counter(q.fam for q in allq)
            for X in "ABCDE":
                seq = [s.qs["ABCDE".index(X)].fam for s in S]
                want = gen.counts(X, v, t)
                for f, n in want.items():
                    if seq.count(f) != n or n < gen.MIN_PER_TERM:
                        P(f"{f} appears {seq.count(f)} times (want {n}, at least {gen.MIN_PER_TERM})")
                c = sum(a == b for a, b in zip(seq, seq[1:]))
                consec[(v, t, X)] = c
                if c:
                    P(f"strand {X}: {c} family repeats in consecutive sessions")
            y8 = gen.year8(v, t)
            for q in allq:
                if q.fam in gen.Y8_FAMS and not y8:
                    P(f"{q.fam} (Year 8 content) outside Advanced Terms 3-4")
                if y8 and q.fam in gen.Y8_DROP["B"]:
                    P(f"{q.fam} should be dropped in Advanced Terms 3-4")
            sigs = Counter(gen.qsig(q) for q in allq)
            for sig, n in sigs.items():
                if n > 1:
                    P(f"repeated question x{n}: {sig}")
            vpool = gen.Pools(v, t)
            for s in S:
                for q in s.qs:
                    if q.item not in vpool.items(q.fam):
                        P(f"W{s.week} S{s.session} {q.fam}: item {q.item!r} is not in the pool")
                    if s.given != gen.given(v, t):
                        P(f"W{s.week} S{s.session}: printed formula setting is wrong")
                    if s.given and not q.fx:
                        P(f"W{s.week} S{s.session} {q.fam}: no printed formula")
                    if q.fam not in DEC_Q and any(x != int(x) for x in numbers_shown(q)):
                        P(f"W{s.week} S{s.session} {q.fam}: a decimal in the question: {plain(q.text)[:60]}")
                    if not answer_ok(q):
                        P(f"W{s.week} S{s.session} {q.fam}: answer not whole / not as allowed: {q.answer}")
            items = {(q.fam, repr(q.item)) for q in allq}
            repeats_prev[(v, t)] = len(items & prev_items)
            prev_items = items
            path = build_all.answers_path(v, t)
            if os.path.exists(path):
                if json.load(open(path)) != build_all.key_rows(S):
                    P("answers json is out of date (rebuild)")
            else:
                P("answers json missing (build first)")
            fam_counts[(v, t)] = fc
            key_counts[(v, t)] = Counter(q.formula for q in allq)

    cols = [(v, t) for v in "MA" for t in (1, 2, 3, 4)]
    head = "| Strand | Family | | " + " | ".join(f"{'M' if v == 'M' else 'Adv'} T{t}" for v, t in cols) + " |"
    lines = ["# Family and formula counts per term", "",
             "Times each family appears in each booklet (30 sessions x 5 questions = 150 per term). "
             "M = Mainstream, Adv = Advanced. Generated by `python3 wu/qa.py`.", "",
             "## By family (the weighting)", "", head, "|---|---|---|" + "---:|" * len(cols)]
    order = {X: gen.Y7[X] + gen.Y8_ADD.get(X, []) for X in "ABCDE"}
    for X in "ABCDE":
        for f in order[X]:
            lines.append(f"| {X} | `{f}` | {FAMILY_NAMES[f]} | " +
                         " | ".join(str(fam_counts[c][f] or "–") for c in cols) + " |")
    lines.append("| | **Total** | | " + " | ".join(str(sum(fam_counts[c].values())) for c in cols) + " |")
    lines += ["", "Family repeats in consecutive sessions (all strands): " +
              ", ".join(f"{v} T{t} {sum(consec[(v, t, X)] for X in 'ABCDE')}" for v, t in cols) + ".",
              "Items repeated from the previous term of the same version: " +
              ", ".join(f"{v} T{t} {repeats_prev[(v, t)]}" for v, t in cols if t > 1) + " (of 150).",
              "", "## By formula key", "", "| key | " + " | ".join(f"{v} T{t}" for v, t in cols) + " |",
              "|---|" + "---:|" * len(cols)]
    for k in FX:
        lines.append(f"| `{k}` | " + " | ".join(str(key_counts[c][k] or "–") for c in cols) + " |")
    open(os.path.join(HERE, "formula_counts.md"), "w").write("\n".join(lines) + "\n")
    print("\n".join(lines[6:6 + 3 + sum(len(order[X]) for X in "ABCDE") + 3]))
    print(f"\nRULE PROBLEMS: {len(problems)}")
    for p in problems:
        print("  " + p)
    return len(problems)


if __name__ == "__main__":
    sys.exit(1 if main() else 0)
