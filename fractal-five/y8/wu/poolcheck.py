"""Layout check for every pool item: each item is set in a session (five to a page) and run through
check.py; items whose figure is fixed (a table or a displayed line) and still overflow are listed.

    python3 wu/poolcheck.py [FAMILIES]
"""
import contextlib
import io
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gen  # noqa: E402
from check import check  # noqa: E402
from wu import Session  # noqa: E402


def main(fams):
    qs = []
    for fam in fams:
        for it in gen.POOL[fam]:
            q = gen.mk(*gen.gen(fam, it))
            q.fam, q.item = fam, it
            qs.append(q)
    while len(qs) % 5:
        qs.append(qs[0])
    sess = [Session(1, 1, 1, qs[i:i + 5], given=True) for i in range(0, len(qs), 5)]
    bad = []
    for rnd in range(4):
        with contextlib.redirect_stdout(io.StringIO()):
            probs = check(sess)
        strips = list(check.strip_problems)
        if not probs:
            break
        for pi, qi in probs:
            q = sess[pi - 1].qs[qi - 1]
            if q.figf is None:
                bad.append((q.fam, q.item))
            else:
                q.s = round(q.s * 0.9, 3)
                q.fig = q.figf(q.s)
    with contextlib.redirect_stdout(io.StringIO()):
        probs = check(sess)
    strips = list(check.strip_problems)
    out = sorted({repr((sess[p - 1].qs[r - 1].fam, sess[p - 1].qs[r - 1].item)) for p, r in probs})
    print(f"{len(qs)} items: {len(out)} overflow after shrinking; strips not fitting: "
          f"{sorted({repr((sess[p - 1].qs[r - 1].fam, sess[p - 1].qs[r - 1].item)) for p, r in strips}) or 'none'}")
    for o in out:
        print("  OVERFLOW", o)
    return len(out) + len(strips)


if __name__ == "__main__":
    fams = sys.argv[1].split(",") if len(sys.argv) > 1 else list(gen.POOL)
    sys.exit(1 if main(fams) else 0)
