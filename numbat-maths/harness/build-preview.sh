#!/bin/bash
# Stand-alone preview: same pages as the app with log-ins switched off, as one self-contained page.
set -e
cd "$(dirname "$0")"
./sync.sh --no-hook
cp -r tpl-preview/. src/
rm -f src/routeTree.gen.ts
npx vite build --config vite.preview.config.ts --mode preview
python3 inline-preview.py dist-preview/preview.html "${1:-dist-preview/numbat-maths.html}"
./sync.sh   # put the dev copy back
