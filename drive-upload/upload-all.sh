#!/usr/bin/env bash
# Stage every resource (stage.sh) and upload each file into its Drive folder (folders.tsv).
# Files already in the target folder with the same name are replaced, so it is safe to re-run.
# Needs DRIVE_UPLOAD_URL and DRIVE_UPLOAD_KEY (see upload.sh).
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
export STAGE_DIR=${STAGE_DIR:-/tmp/maths-drive-stage}
bash "$here/stage.sh"
ok=0; fail=0
while IFS=$'\t' read -r dir id; do
  [[ -z $dir || $dir == \#* ]] && continue
  for f in "$STAGE_DIR/$dir"/*.*; do
    [[ -f $f ]] || continue
    if out=$(bash "$here/upload.sh" "$f" "$id" "$(basename "$f")" --replace) && [[ $out == *'"ok":true'* ]]; then
      ok=$((ok+1)); echo "ok   $dir/$(basename "$f")"
    else
      fail=$((fail+1)); echo "FAIL $dir/$(basename "$f"): $out"
    fi
  done
done < "$here/folders.tsv"
echo "$ok uploaded, $fail failed"
