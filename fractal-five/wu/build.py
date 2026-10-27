import sys, os, subprocess
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import wu
from w01 import week1

art = sys.argv[1] if len(sys.argv) > 1 else "div"
out = sys.argv[2] if len(sys.argv) > 2 else f"/tmp/wu_{art}.pdf"
S = week1()
wu.build(S, out, art=art, title="Year 9 Formula Warm-Ups \u2014 Term 1, Week 1 (sample)")
tag = os.path.splitext(os.path.basename(out))[0]
subprocess.run(["pdftoppm", "-r", "80", "-png", out, f"/tmp/{tag}"], check=True)
print("built", out, "rows", round(wu.ROW_H, 2), "line gap", round(wu.LINE_GAP, 2))
