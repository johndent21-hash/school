#!/bin/bash
# Textbook question stems for every exercise in one chapter, for the coverage audit (reads only the stems, not the book).
# Usage: pdftotext -layout "chapter.pdf" /tmp/c.txt; qa/stems.sh /tmp/c.txt
# Not every stem is caught (some layouts split lines); read a few raw lines with sed -n when an exercise looks thin.
f=$1
grep -n "EXERCISE [0-9]*\.[0-9]*" "$f" | while IFS=: read ln rest; do
  echo "#### $(echo $rest | tr -s ' ' | cut -c1-30)"
  sed -n "$((ln+1)),$((ln+220))p" "$f" | awk '/EXERCISE [0-9]+\.[0-9]+/{exit} /TEST YOURSELF|POWER PLUS|CHAPTER REVIEW/{exit} {print}' | tr -s ' \t' '  ' | grep -E "^ ?[0-9]{1,2} [A-Z][a-z]" | cut -c1-88
done
