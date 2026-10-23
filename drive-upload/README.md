# Sending the maths resources to Google Drive

Everything Claude has made across the year-level repositories (practice exams, help sheets, yearly exams,
lesson/chapter booklets, revision booklets, warm-ups) is gathered from the git branches it lives on and uploaded into
**Kingscliff Maths Resources 7–12** in Drive.

    bash drive-upload/upload-all.sh

- `stage.sh` pulls the latest version of each resource from its branch and gives it a clear name
  (e.g. `Ch 04 - Lesson Booklet - ANSWERS.pdf`). Textbook scans and files you uploaded yourself are not included.
- `folders.tsv` maps each staged folder to its Drive folder id. The folders already exist in Drive.
- `upload.sh` sends one file through the Apps Script web app (Code.gs in the Year-9-Standard repo,
  `tools/drive-upload/`). It needs `DRIVE_UPLOAD_URL` (the web app's /exec URL) and `DRIVE_UPLOAD_KEY`
  set in the cloud environment's settings.

Re-running is safe: a file with the same name in the same folder is replaced (old copy goes to the Drive bin).

## Layout in Drive

    Year 07/ Yearly Exams/                 exam prep booklet, skills checklist
               Practice Exams & Help Sheet/   4 practice exams, answers, help sheet (+ Word versions)
             Lesson Booklets/Ch 01 … Ch 12/   every booklet series for that chapter, each with its ANSWERS copy
             Revision Booklets/            one per chapter
    Year 08/ Yearly Exams/                 exam prep booklet, skills checklist
               Practice Exams & Help Sheet/   4 practice exams, answers, help sheet
    Year 09/ Yearly Exams/2026 Yearly Exam/   exam + marking guide (+ Word versions)
                          Practice Exams & Help Sheets/  4 practice exams, help sheets
                          Revision Booklets/  A and B
             Chapter Booklets/Ch 10 … Ch 13/  student, teacher, answers (+ Ch 10 fast finishers)
             Warm-ups – The Fractal Five/  Terms 1–4
    Year 10/ Yearly Exams/                 yearly test + marking guide
               Revision & Help Sheet/      revision booklets, help sheet
             Chapter Booklets/Ch 01, 02, 04/  lesson booklet, answers, extension fast finishers
    Year 12/ Mathematics Standard/Ch 01 Ratios and rates/  workbook
