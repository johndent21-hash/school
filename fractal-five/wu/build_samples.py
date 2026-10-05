"""Build the four term sample booklets: title page + Week 1 Sessions 1-3."""
import os, sys, subprocess
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import wu
from samples import TERMS
from check import check

outdir = sys.argv[1] if len(sys.argv) > 1 else "/tmp/wu_out"
os.makedirs(outdir, exist_ok=True)
bad = []
for t, fn in TERMS.items():
    S = fn()
    probs = check(S)
    bad += [(t,) + p for p in probs]
    path = os.path.join(outdir, f"Yr9_Formula_Warm-Ups_Term{t}_Sample.pdf")
    wu.build(S, path, title=f"Year 9 Formula Warm-Ups \u2014 Term {t} (sample: Week 1)", cover_term=t)
    subprocess.run(["pdftoppm", "-r", "80", "-png", path, f"/tmp/t{t}"], check=True)
    print("built", path)
print("OVERFLOW PROBLEMS:", bad if bad else "none")
