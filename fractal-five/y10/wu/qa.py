# -*- coding: utf-8 -*-
"""Rule checks for the four Year 10 booklets, and the family / formula count tables.

    python3 wu/qa.py            (run after build_all.py; it rebuilds the sessions exactly as the build does)

Checks, per term:
  * 30 sessions (Weeks 1-10 x 3), 5 questions each, one from each strand A-E in order
  * no family in two consecutive sessions
  * no repeated question within a term
  * every family at least 3 times; in Term 4 strand B's ten families exactly 3 times each
  * v_pyramid / v_cone only in Term 4, always with their formula printed; Term 4 Week 1 has both;
    no other Term 3-4 question prints a formula; every Term 1-2 question does
  * every item comes from its level's pool (Terms 1-2: Level 1; Terms 3-4: Level 2 + half of Level 1)
  * Terms 1-2: every number printed in a question (text, labels, tables) is a whole number, apart from
    probabilities, scientific notation, the printed constants of a formula (2.4, 1.8) and 17.5% leave
    loading; answers are tidy (whole numbers or whole dollars, fractions where the question asks for one,
    1 decimal place only where the question says so)
  * Terms 3-4: about a third of the trig_top and trig_angle questions are angles of elevation/depression
  * v_prism and speed keep one working-backwards item a term
  * every printed formula fits its strip (check.check_strips)
  * wu/answers_termN.json matches the questions in the booklet
Writes wu/formula_counts.md (times each family and each formula appears in each term).
"""
import json
import os
import re
import sys
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import build_all  # noqa: E402
import check  # noqa: E402
import gen  # noqa: E402

PROB = {"prob", "prob_not", "freq"}
NO_DEC_CHECK = PROB | {"sci"}
TIDY_ANY = {"prob", "prob_not", "freq", "trig_ratio", "idx", "zero_neg", "sci", "linear"}


def plain(h):
    return re.sub(r"<[^>]+>", " ", h or "").replace("−", "-").replace(" ", "")


def numbers_shown(q):
    txt = plain(q.text) + " " + plain(q.fig)
    txt = re.sub(r"\d+(?:\.\d+)?\s*decimal place", " ", txt)
    txt = re.sub(r"\b[A-B]\((\d+), (\d+)\)", r" \1 \2 ", txt)
    txt = txt.replace("17.5%", " ")                                # leave loading (holiday pay)
    if q.fam == "formula_sub":                                     # the formula's own constants
        txt = txt.replace("2.4", " ").replace("1.8", " ")
    return [float(v.replace(",", "")) for v in re.findall(r"\d[\d,]*(?:\.\d+)?", txt)]


def tidy_l1(q):
    a = q.answer.replace("−", "-").replace(",", "").replace(" ", "")
    if "decimal place" in q.text:
        return re.fullmatch(r"-?\d+\.\d( \S+)?", a) is not None
    if q.fam in TIDY_ANY:
        return True
    v = re.findall(r"-?\d+(?:\.\d+)?", a)
    return bool(v) and all(float(x) == int(float(x)) for x in v)


def main():
    problems = []
    fam_counts, key_counts, elev = {}, {}, Counter()
    strip_bad = check.check_strips()
    for k, n, spare in strip_bad:
        problems.append(f"formula strip {k}: {n} lines, {spare} mm spare")
    for t in (1, 2, 3, 4):
        S, seqs, rounds = build_all.ready(t)
        P = lambda msg: problems.append(f"T{t}: {msg}")  # noqa: E731
        print(f"T{t}: {rounds} overflow-shrink rounds")
        if [(s.week, s.session) for s in S] != [(w, k) for w in range(1, 11) for k in (1, 2, 3)]:
            P("sessions are not Weeks 1-10 x 3")
        for s in S:
            fams = [q.fam for q in s.qs]
            if len(s.qs) != 5 or any(f not in gen.STRANDS[X] for f, X in zip(fams, "ABCDE")):
                P(f"W{s.week} S{s.session}: not one question per strand {fams}")
        for X in "ABCDE":
            seq = [s.qs["ABCDE".index(X)].fam for s in S]
            for i in range(1, 30):
                if seq[i - 1] == seq[i]:
                    P(f"strand {X}: {seq[i]} in sessions {i} and {i + 1}")
            for f in gen.families(X, t):
                if seq.count(f) < gen.MIN_PER_TERM:
                    P(f"{f} appears {seq.count(f)} times (< 3)")
                if X == "B" and t == 4 and seq.count(f) != 3:
                    P(f"{f} appears {seq.count(f)} times in Term 4 (should be exactly 3)")
            for f in set(seq) - set(gen.families(X, t)):
                P(f"{f} is not a Term {t} family")
        sigs = Counter(gen.qsig(q) for s in S for q in s.qs)
        for sig, n in sigs.items():
            if n > 1:
                P(f"repeated question x{n}: {sig}")
        allq = [q for s in S for q in s.qs]
        for s in S:
            for q in s.qs:
                pr = s.prints(q)
                if t <= 2 and not pr:
                    P(f"W{s.week} S{s.session} {q.fam}: formula not printed")
                if t >= 3 and pr != (q.fam in gen.TERM4_ONLY):
                    P(f"W{s.week} S{s.session} {q.fam}: printed formula {pr}")
        if t == 4 and not gen.TERM4_ONLY <= {q.fam for s in S[:3] for q in s.qs}:
            P("Week 1 does not show both the pyramid and the cone")
        pools = gen.Pools(t)
        for s in S:
            for q in s.qs:
                if q.item not in pools.items(q.fam):
                    P(f"W{s.week} S{s.session} {q.fam}: item {q.item!r} is not in this level's pool")
        if t <= 2:
            for s in S:
                for q in s.qs:
                    if q.fam not in NO_DEC_CHECK and any(v != int(v) for v in numbers_shown(q)):
                        P(f"W{s.week} S{s.session} {q.fam}: Level 1 shows a decimal: {plain(q.text)} | {plain(q.fig)[:60]}")
                    if not tidy_l1(q):
                        P(f"W{s.week} S{s.session} {q.fam}: Level 1 answer not tidy: {q.answer}")
        for f in ("v_prism", "speed"):
            r = sum(1 for q in allq if q.fam == f and gen.is_rev(q.item))
            if r < 1:
                P(f"{f}: no working-backwards item")
        for f in ("trig_top", "trig_angle"):
            fq = [q for q in allq if q.fam == f]
            e = sum(1 for q in fq if gen.is_elev(q.item))
            elev[(t, f)] = (e, len(fq))
            if t >= 3 and not (1 <= e <= (len(fq) + 1) // 2):
                P(f"{f}: {e} of {len(fq)} are elevation/depression")
            if t <= 2 and e:
                P(f"{f}: elevation/depression in Term {t}")
        kp = os.path.join(HERE, f"answers_term{t}.json")
        if not os.path.exists(kp):
            print(f"T{t}: no answers json yet (built with the booklets)")
        elif json.load(open(kp)) != build_all.answer_rows(S):
            P("answers json is out of date (rebuild)")
        fam_counts[t] = Counter(q.fam for q in allq)
        key_counts[t] = Counter(q.formula for q in allq)
    e34 = [elev[(t, f)] for t in (3, 4) for f in ("trig_top", "trig_angle")]
    frac_e = sum(e for e, _ in e34) / sum(n for _, n in e34)
    print(f"Terms 3-4: {sum(e for e, _ in e34)} of {sum(n for _, n in e34)} trig_top/trig_angle questions are "
          f"elevation/depression ({frac_e:.0%})")
    if not 0.25 <= frac_e <= 0.42:
        problems.append(f"Terms 3-4: elevation/depression share {frac_e:.0%} is not about a third")

    lines = ["# Family and formula counts per term", "",
             "Times each family and each printed formula appears in each booklet (30 sessions x 5 questions = "
             "150 per term). Generated by `python3 wu/qa.py`.", "",
             "## By family (the rotation unit; never in two consecutive sessions)", "",
             "| Strand | Family | T1 | T2 | T3 | T4 |", "|---|---|---:|---:|---:|---:|"]
    for X, fams in gen.STRANDS.items():
        for f in fams:
            lines.append(f"| {X} | `{f}` | " + " | ".join(str(fam_counts[t][f]) for t in (1, 2, 3, 4)) + " |")
    lines.append("| | **Total** | " + " | ".join(str(sum(fam_counts[t].values())) for t in (1, 2, 3, 4)) + " |")
    lines += ["", "## By formula key", "", "| Formula key | T1 | T2 | T3 | T4 |", "|---|---:|---:|---:|---:|"]
    keys = sorted(set().union(*[set(key_counts[t]) for t in (1, 2, 3, 4)]))
    for k in keys:
        lines.append(f"| `{k}` | " + " | ".join(str(key_counts[t][k]) for t in (1, 2, 3, 4)) + " |")
    open(os.path.join(HERE, "formula_counts.md"), "w").write("\n".join(lines) + "\n")
    print("\n".join(lines[4:8 + sum(len(v) for v in gen.STRANDS.values()) + 1]))
    print(f"\nRULE PROBLEMS: {len(problems)}")
    for p in problems:
        print("  " + p)
    return len(problems)


if __name__ == "__main__":
    sys.exit(1 if main() else 0)
