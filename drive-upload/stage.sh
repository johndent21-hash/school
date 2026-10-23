#!/usr/bin/env bash
# Extract final resources from git branches into a staging tree laid out like Drive.
set -euo pipefail
S=${STAGE_DIR:-/tmp/maths-drive-stage}
rm -rf "$S"; mkdir -p "$S"
g() { # repo ref path dest
  mkdir -p "$(dirname "$S/$4")"; git -C "/home/user/$1" show "$2:$3" > "$S/$4"; }
w() { mkdir -p "$(dirname "$S/$3")"; cp "/home/user/$1/$2" "$S/$3"; }

# ---------- Year 07 ----------
B=origin/claude/vigilant-dirac-ojukrb; P="Year 07/Yearly Exams/Practice Exams & Help Sheet"
for n in 1 2 3 4; do g Year-7-Standard $B "Practice Exams/Year 7 Practice Exam $n.pdf" "$P/Year 7 Practice Exam $n.pdf"
  g Year-7-Standard $B "Practice Exams/Year 7 Practice Exam $n.docx" "$P/Word versions (editable)/Year 7 Practice Exam $n.docx"; done
g Year-7-Standard $B "Practice Exams/Year 7 Practice Exams - Answers.pdf" "$P/Year 7 Practice Exams - Answers.pdf"
g Year-7-Standard $B "Practice Exams/Year 7 Practice Exams - Answers.docx" "$P/Word versions (editable)/Year 7 Practice Exams - Answers.docx"
g Year-7-Standard $B "Practice Exams/Year 7 Maths Help Sheet.pdf" "$P/Year 7 Maths Help Sheet.pdf"
g Year-7-Standard $B "Practice Exams/Year 7 Maths Help Sheet.docx" "$P/Word versions (editable)/Year 7 Maths Help Sheet.docx"
w Year-7-Standard Year_7_Exam_preparation_booklet.pdf "Year 07/Yearly Exams/Year 7 Exam Preparation Booklet.pdf"
w Year-7-Standard Year7_Maths_Skills_Checklist.pdf "Year 07/Yearly Exams/Year 7 Maths Skills Checklist.pdf"

# Year 7 revision booklets (one per chapter)
for f in /home/user/school/Yr7_Ch*_Revision_Booklet*.pdf; do
  b=$(basename "$f" .pdf); b=${b% (1)}; n=$(echo "$b" | sed -E 's/Yr7_Ch([0-9]+)_.*/\1/'); t=$(echo "$b" | sed -E 's/Yr7_Ch[0-9]+_(.*)_Revision_Booklet/\1/' | sed -E 's/([a-z])([A-Z])/\1 \2/g')
  cp "$f" "$S/Year 07/Revision Booklets/Ch $(printf %02d $n) $t - Revision Booklet.pdf" 2>/dev/null || { mkdir -p "$S/Year 07/Revision Booklets"; cp "$f" "$S/Year 07/Revision Booklets/Ch $(printf %02d $n) $t - Revision Booklet.pdf"; }
done

# Year 7 lesson booklets, one folder per chapter
SC=origin/claude/elegant-curie-tmgv78; MX=origin/claude/year-7-freefall-booklets-fas4t1
declare -A T=([01]="Integers" [02]="Angles" [03]="Whole numbers" [04]="Fractions and percentages" [05]="Algebra and equations" [06]="Geometrical figures" [07]="Decimals" [08]="Area and volume" [09]="Number plane" [10]="Analysing data" [11]="Probability" [12]="Ratios, rates and time")
L="Year 07/Lesson Booklets"
while read -r path; do
  base=$(basename "$path" .pdf); dir=$(basename "$(dirname "$path")"); series=$(echo "$path" | cut -d/ -f2)
  ch=$(echo "$dir" | sed -E 's/ch([0-9]+).*/\1/'); part=$(echo "$dir" | sed -nE 's/ch[0-9]+([ab])-.*/\1/p' | tr ab AB)
  ans=""; [[ $base == *-Answers ]] && ans=" - ANSWERS"
  case $series in
    year7) kind="Lesson Booklet";;
    year7-blend) [[ $base == *Homework* ]] && kind="Homework Booklet" || kind="Lessons with Drills";;
    year7-worksheets) kind="Three-column Worksheets";;
    year7-mixed) kind="Mixed Practice Worksheets";;
    year7-own) kind="Research-designed Booklet";;
  esac
  label="Ch $ch${part:+$part}"
  g school "$( [[ $series == year7-mixed ]] && echo $MX || echo $SC )" "$path" "$L/Ch $ch ${T[$ch]}/$label - $kind$ans.pdf"
done < <( { git -C /home/user/school ls-tree -r --name-only $SC booklets/year7 booklets/year7-blend booklets/year7-worksheets booklets/year7-own; git -C /home/user/school ls-tree -r --name-only $MX booklets/year7-mixed; } | grep '\.pdf$' | grep -v Pilot )

# ---------- Year 08 ----------
B=origin/claude/keen-mccarthy-ed43a5; P="Year 08/Yearly Exams/Practice Exams & Help Sheet"
for n in 1 2 3 4; do g Year-8-Advanced $B "Practice_Exams/Year_8_Practice_Exam_$n.pdf" "$P/Year 8 Practice Exam $n.pdf"; done
g Year-8-Advanced $B Practice_Exams/Year_8_Practice_Exams_Answers.pdf "$P/Year 8 Practice Exams - Answers.pdf"
g Year-8-Advanced $B Year_8_Exam_Help_Sheet.pdf "$P/Year 8 Exam Help Sheet.pdf"
w Year-8-Advanced Year_8_Exam_preparation_booklet.pdf "Year 08/Yearly Exams/Year 8 Exam Preparation Booklet.pdf"
w Year-8-Advanced Year8_Maths_Skills_Checklist.pdf "Year 08/Yearly Exams/Year 8 Maths Skills Checklist.pdf"

# ---------- Year 09 ----------
B=origin/claude/eager-mendel-efgof1; P="Year 09/Yearly Exams/Practice Exams & Help Sheets"
for n in 1 2 3 4; do g Year-9-Standard $B "Practice exams 2026/Year9-5.2-Yearly-Exam-Practice-$n.pdf" "$P/Year 9 Practice Exam $n.pdf"; done
g Year-9-Standard $B "Practice exams 2026/Year9-5.2-Yearly-Exam-Help-Sheet.pdf" "$P/Year 9 Exam Help Sheet.pdf"
g Year-9-Standard $B "Year9-5.2-Yearly-Exam-Revision-Help-Sheet-and-Answers.pdf" "$P/Year 9 Revision Help Sheet and Answers.pdf"
B=origin/claude/affectionate-gates-exjv9d; E="Year 09/Yearly Exams/2026 Yearly Exam"
g Year-9-Standard $B "Yearly exam 2026/Year9-5.2-Yearly-Exam-2026.pdf" "$E/Year 9 Yearly Exam 2026.pdf"
g Year-9-Standard $B "Yearly exam 2026/Year9-5.2-Yearly-Exam-2026-Marking-Guide.pdf" "$E/Year 9 Yearly Exam 2026 - Marking Guide.pdf"
g Year-9-Standard $B "Yearly exam 2026/Year9-5.2-Yearly-Exam-2026.docx" "$E/Word versions (editable)/Year 9 Yearly Exam 2026.docx"
g Year-9-Standard $B "Yearly exam 2026/Year9-5.2-Yearly-Exam-2026-Marking-Guide.docx" "$E/Word versions (editable)/Year 9 Yearly Exam 2026 - Marking Guide.docx"
g Year-9-Standard $B "Yearly exam 2026/Year9-5.2-Yearly-Exam-2026-Revision-Booklet-A.pdf" "Year 09/Yearly Exams/Revision Booklets/Year 9 Yearly Exam Revision Booklet A.pdf"
g Year-9-Standard $B "Yearly exam 2026/Year9-5.2-Yearly-Exam-2026-Revision-Booklet-B.pdf" "Year 09/Yearly Exams/Revision Booklets/Year 9 Yearly Exam Revision Booklet B.pdf"
B=origin/claude/loving-lovelace-yfoxrf
for c in "10 Surface area and volume|Ch10-Surface-Area-and-Volume" "11 Coordinate geometry and graphs|Ch11-Coordinate-Geometry-and-Graphs" "12 Probability|Ch12-Probability" "13 Similar figures|Ch13-Similar-Figures"; do
  t=${c%%|*}; f=${c##*|}; src="Chapter ${t} booklet/Year9-Standard-$f"
  g Year-9-Standard $B "$src-Student-copy.pdf" "Year 09/Chapter Booklets/Ch $t/Ch ${t%% *} - Student Booklet.pdf"
  g Year-9-Standard $B "$src-Teacher-copy.pdf" "Year 09/Chapter Booklets/Ch $t/Ch ${t%% *} - Teacher Copy.pdf"
  g Year-9-Standard $B "$src-Answers.pdf" "Year 09/Chapter Booklets/Ch $t/Ch ${t%% *} - ANSWERS.pdf"
done
g Year-9-Standard $B "Chapter 10 Surface area and volume booklet/Year9-Standard-Ch10-Extension-Fast-Finishers.pdf" "Year 09/Chapter Booklets/Ch 10 Surface area and volume/Ch 10 - Extension Fast Finishers.pdf"
g Year-9-Standard $B "Chapter 10 Surface area and volume booklet/Year9-Standard-Ch10-Extension-Fast-Finishers-Answers.pdf" "Year 09/Chapter Booklets/Ch 10 Surface area and volume/Ch 10 - Extension Fast Finishers - ANSWERS.pdf"
for n in 1 2 3 4; do g school origin/claude/vibrant-johnson-piris7 "fractal-five/out/The_Fractal_Five_Term_$n.pdf" "Year 09/Warm-ups – The Fractal Five/The Fractal Five - Term $n.pdf"; done

# ---------- Year 10 ----------
B=origin/claude/compassionate-newton-pp1ful; E="Year 10/Yearly Exams"
g Year-10-Transition $B "Yearly test/Year10-Transition-Yearly-Test.pdf" "$E/Year 10 Yearly Test.pdf"
g Year-10-Transition $B "Yearly test/Year10-Transition-Yearly-Test-Marking-Guide.pdf" "$E/Year 10 Yearly Test - Marking Guide.pdf"
g Year-10-Transition $B "Yearly test/Year10-Transition-Yearly-Test-Revision.pdf" "$E/Revision & Help Sheet/Year 10 Yearly Test - 6-page Revision Booklet.pdf"
B=origin/claude/year-10-revision-booklet-mb9ag3
g Year-9-Standard $B "Year 10 yearly test revision/Year10-Yearly-Test-2026-Revision-Booklet.pdf" "$E/Revision & Help Sheet/Year 10 Yearly Test - Full Revision Booklet (with answers).pdf"
g Year-9-Standard $B "Year 10 yearly test revision/Year10-Yearly-Test-2026-Help-Sheet.pdf" "$E/Revision & Help Sheet/Year 10 Yearly Test - Help Sheet.pdf"
B=origin/claude/gracious-lamport-17oik0; C="Year 10/Chapter Booklets"
for c in "01 Financial mathematics|Ch01-Financial-Maths" "02 Measurement|Ch02-Measurement" "04 Statistics|Ch04-Statistics"; do
  t=${c%%|*}; f=${c##*|}; d=$(git -C /home/user/Year-10-Transition ls-tree -r --name-only $B | grep "Year10-Transition-$f.pdf" | head -1)
  g Year-10-Transition $B "$d" "$C/Ch $t/Ch ${t%% *} - Lesson Booklet.pdf"
  g Year-10-Transition $B "${d%.pdf}-Answers.pdf" "$C/Ch $t/Ch ${t%% *} - Lesson Booklet - ANSWERS.pdf"
done
B=origin/claude/year-10-fast-finishers-booklet-mgnodg
g Year-10-Transition $B Extension-Fast-Finishers/Year10-Ch1-Financial-Mathematics-Fast-Finishers.pdf "$C/Ch 01 Financial mathematics/Ch 01 - Extension Fast Finishers.pdf"
g Year-10-Transition $B Extension-Fast-Finishers/Year10-Ch2-Measurement-Fast-Finishers.pdf "$C/Ch 02 Measurement/Ch 02 - Extension Fast Finishers.pdf"
g Year-10-Transition $B Extension-Fast-Finishers/Year10-Ch4-Probability-and-Statistics-Fast-Finishers.pdf "$C/Ch 04 Statistics/Ch 04 - Extension Fast Finishers.pdf"

# ---------- Year 12 ----------
g Year-12-Standard-2 origin/claude/busy-darwin-3fr9v9 "Chapter 1 Ratios and Rates Workbook.pdf" "Year 12/Mathematics Standard/Ch 01 Ratios and rates/Ch 01 - Ratios and Rates Workbook.pdf"

# Tidy Year 7 revision booklet names
cd "$S/Year 07/Revision Booklets"
mv "Ch 03 Whole Numbers - Revision Booklet.pdf" "Ch 03 Whole numbers - Revision Booklet.pdf"
mv "Ch 04 Fractions Percentages - Revision Booklet.pdf" "Ch 04 Fractions and percentages - Revision Booklet.pdf"
mv "Ch 05 Algebra - Revision Booklet.pdf" "Ch 05A Algebra - Revision Booklet.pdf"
mv "Ch 05 Equations - Revision Booklet.pdf" "Ch 05B Equations - Revision Booklet.pdf"
mv "Ch 06 Geometrical Figures - Revision Booklet.pdf" "Ch 06 Geometrical figures - Revision Booklet.pdf"
mv "Ch 08 Area Volume - Revision Booklet.pdf" "Ch 08 Area and volume - Revision Booklet.pdf"
mv "Ch 09 Number Plane - Revision Booklet.pdf" "Ch 09 Number plane - Revision Booklet.pdf"
mv "Ch 10 Analysing Data - Revision Booklet.pdf" "Ch 10 Analysing data - Revision Booklet.pdf"
mv "Ch 12 Rates Ratios Time - Revision Booklet.pdf" "Ch 12 Ratios, rates and time - Revision Booklet.pdf"
