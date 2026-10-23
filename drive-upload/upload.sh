#!/usr/bin/env bash
# Upload a file to Google Drive through the Apps Script web app in Code.gs.
# Usage: upload.sh <file> <drive-folder-id> [name-in-drive] [--replace]
# Needs DRIVE_UPLOAD_URL and DRIVE_UPLOAD_KEY in the environment.
set -euo pipefail

file=$1
folder=$2
name=${3:-$(basename "$file")}
replace=0
[[ "${4:-}" == "--replace" ]] && replace=1

: "${DRIVE_UPLOAD_URL:?DRIVE_UPLOAD_URL is not set}"
: "${DRIVE_UPLOAD_KEY:?DRIVE_UPLOAD_KEY is not set}"

case "${file,,}" in
  *.pdf)  mime=application/pdf ;;
  *.docx) mime=application/vnd.openxmlformats-officedocument.wordprocessingml.document ;;
  *.zip)  mime=application/zip ;;
  *)      mime=application/octet-stream ;;
esac

query=$(python3 -c 'import sys, urllib.parse as u; print(u.urlencode(dict(zip(["key","folder","name","mime","replace"], sys.argv[1:]))))' \
  "$DRIVE_UPLOAD_KEY" "$folder" "$name" "$mime" "$replace")

# curl -L turns the POST into a GET on Apps Script's 302 redirect, which is what it expects.
base64 -w0 "$file" | curl -sSL --fail -X POST -H 'Content-Type: text/plain' \
  --data-binary @- "$DRIVE_UPLOAD_URL?$query"
echo
