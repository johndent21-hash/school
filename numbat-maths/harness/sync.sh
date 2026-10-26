#!/bin/bash
# Assemble harness/src from the engine (../src), the app pages (../app/src) and template stand-ins (tpl/)
set -e
cd "$(dirname "$0")"
keep=""
[ -f src/routeTree.gen.ts ] && keep=$(mktemp) && cp src/routeTree.gen.ts "$keep"
rm -rf src && mkdir -p src
cp -r ../src/. src/
cp -r ../app/src/. src/
cp -r tpl/. src/
[ -n "$keep" ] && cp "$keep" src/routeTree.gen.ts || true
# Test-only hook: expose the current answer so browser tests can answer correctly
python3 - <<'PY'
import re
for p in ['src/components/numbat/PracticeRunner.tsx', 'src/components/numbat/TestRunner.tsx']:
    s = open(p).read()
    s = "import { answerText as __at } from '@/lib/maths/check'\n" + s
    if 'PracticeRunner' in p:
        s = s.replace("  const cur = set[i]\n", "  const cur = set[i]\n  ;(window as any).__ans = cur.q.answer.kind === 'mc' ? 'MC' + cur.q.answer.correct : __at(cur.q.answer)\n", 1)
    else:
        s = s.replace("  const value = answers[i]\n", "  const value = answers[i]\n  ;(window as any).__ans = set[i].q.answer.kind === 'mc' ? 'MC' + (set[i].q.answer as any).correct : __at(set[i].q.answer)\n", 1)
    open(p, 'w').write(s)
PY
