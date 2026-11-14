# Planted-error check: replace one exact snippet in a content file, run the game tests, print the failures it caused,
# then restore the file. A checker that reports nothing for a real error is not checking.
# Usage (from numbat-maths/): python3 qa/plant.py src/content/games/FILE.ts "old snippet" "wrong snippet"
# "fewer than three different wrong options" means the plant collided with a distractor: plant a different value.
import shutil, subprocess, sys
f, old, new = sys.argv[1], sys.argv[2], sys.argv[3]
shutil.copy(f, f + '.bak')
s = open(f).read()
assert s.count(old) == 1, ('snippet found', s.count(old), 'times')
open(f, 'w').write(s.replace(old, new))
try:
    out = subprocess.run('N=30 npx tsx tests/games.test.ts 2>&1', shell=True, capture_output=True, text=True).stdout
    hits = [l for l in out.splitlines() if ' × ' in l and 'FAIL' not in l][:3]
    print(new[:50], '->', hits or [l for l in out.splitlines() if 'Error' in l][:1] or 'NOTHING CAUGHT')
finally:
    shutil.move(f + '.bak', f)
