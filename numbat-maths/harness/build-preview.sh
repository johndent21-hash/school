#!/bin/bash
# Stand-alone preview: same pages as the app with log-ins switched off, as one self-contained page.
# Usage: ./build-preview.sh [out.html] [title]    (VITE_STAGE2=1 ./build-preview.sh ... adds Years 3 and 4)
set -e
cd "$(dirname "$0")"
./sync.sh --no-hook
cp -r tpl-preview/. src/
rm -f src/routeTree.gen.ts
npx vite build --config vite.preview.config.ts --mode preview
python3 inline-preview.py dist-preview/preview.html "${1:-dist-preview/numbat-maths.html}" "${2:-Numbat Maths}"
./sync.sh   # put the dev copy back
