"""Build the Year 8 'The Fractal Five' booklets: Apollonian-gasket title page + 30 sessions each, two versions.

    python3 wu/build_all.py OUTDIR [M,A] [1,2,3,4]   full booklets + answer keys:
        OUTDIR/The_Fractal_Five_Year_8_Term_N.pdf             (Mainstream)
        OUTDIR/The_Fractal_Five_Year_8_Advanced_Term_N.pdf    (Advanced)
        ... _Answers.pdf for each; wu/answers_{M|A}_termN.json
    python3 wu/build_all.py OUTDIR covers                  OUTDIR/Year8_Covers.pdf (all eight title pages)
"""
import contextlib
import io
import json
import os
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
OPTS = os.path.join(os.path.dirname(HERE), "opts")
sys.path.insert(0, HERE)
sys.path.insert(0, OPTS)
from pypdf import PdfReader, PdfWriter  # noqa: E402
from weasyprint import HTML  # noqa: E402
import gen  # noqa: E402
import wu  # noqa: E402
from check import check  # noqa: E402

NAME = {"M": "The_Fractal_Five_Year_8", "A": "The_Fractal_Five_Year_8_Advanced"}


def title(version, term):
    return f"The Fractal Five — {gen.VERSIONS[version]}, Term {term}"


def quiet_check(sessions):
    with contextlib.redirect_stdout(io.StringIO()):
        return check(sessions)


def fix_overflow(sessions):
    for rnd in range(5):
        probs = quiet_check(sessions)
        if check.strip_problems:
            raise RuntimeError(f"a printed formula does not fit its strip: {check.strip_problems}")
        if not probs:
            return rnd
        for pi, qi in probs:
            q = sessions[pi - 1].qs[qi - 1]
            if getattr(q, "figf", None) is None:
                raise RuntimeError(f"fixed question overflows: session {pi} q{qi}")
            q.s = round(q.s * 0.9, 3)
            q.fig = q.figf(q.s)
    raise RuntimeError(f"overflow persists: {quiet_check(sessions)}")


def cover_pdf(version, term, path):
    import cover8
    css, body = cover8.cover_html(version, term)
    doc = f"<!DOCTYPE html><html><head><meta charset='utf-8'><style>{css}</style></head><body>{body}</body></html>"
    HTML(string=doc, base_url=OPTS).write_pdf(path)
    return path


def term_sessions(version, term):
    return gen.generated_sessions(version, term)


def _merge(parts, out, title_, subject):
    w = PdfWriter()
    for path in parts:
        for p in PdfReader(path).pages:
            w.add_page(p)
    w.add_metadata({"/Title": title_, "/Author": "Kingscliff High School Mathematics Faculty", "/Subject": subject})
    w.compress_identical_objects(remove_duplicates=True, remove_unreferenced=True)   # one copy of the logo
    with open(out, "wb") as fh:
        w.write(fh)
    return out


def answers_path(version, term):
    return os.path.join(HERE, f"answers_{version}_term{term}.json")


def key_rows(sessions):
    return [{"week": s.week, "session": s.session, "q": i + 1, "family": q.fam, "formula": q.formula,
             "answer": q.answer, "question": q.text} for s in sessions for i, q in enumerate(s.qs)]


def build(version, term, outdir):
    sessions, seqs = term_sessions(version, term)
    assert len(sessions) == 30
    assert [(s.week, s.session) for s in sessions] == [(w, k) for w in range(1, 11) for k in (1, 2, 3)]
    rounds = fix_overflow(sessions)
    tmp = tempfile.mkdtemp(prefix="ff8_")
    tmp_s, tmp_c = os.path.join(tmp, "sessions.pdf"), os.path.join(tmp, "cover.pdf")
    t = title(version, term)
    wu.build(sessions, tmp_s, title=t)
    cover_pdf(version, term, tmp_c)
    out = os.path.join(outdir, f"{NAME[version]}_Term_{term}.pdf")
    _merge([tmp_c, tmp_s], out, t, f"{gen.VERSIONS[version]} formula warm-ups: 30 sessions, 150 questions")
    json.dump(key_rows(sessions), open(answers_path(version, term), "w"), indent=1, ensure_ascii=False)
    return out, rounds, seqs, sessions


def build_covers(outdir):
    tmp = tempfile.mkdtemp(prefix="ff8c_")
    parts = []
    for v in "MA":
        for t in (1, 2, 3, 4):
            p = os.path.join(tmp, f"c{v}{t}.pdf")
            cover_pdf(v, t, p)
            parts.append(p)
    return _merge(parts, os.path.join(outdir, "Year8_Covers.pdf"), "The Fractal Five — Year 8 title pages",
                  "Year 8 formula warm-ups: title pages")


if __name__ == "__main__":
    outdir = sys.argv[1] if len(sys.argv) > 1 else "out"
    os.makedirs(outdir, exist_ok=True)
    if len(sys.argv) > 2 and sys.argv[2] == "covers":
        print(build_covers(outdir))
        sys.exit(0)
    versions = sys.argv[2].split(",") if len(sys.argv) > 2 else ["M", "A"]
    terms = [int(t) for t in sys.argv[3].split(",")] if len(sys.argv) > 3 else [1, 2, 3, 4]
    import answer_key
    for v in versions:
        for t in terms:
            out, rounds, seqs, S = build(v, t, outdir)
            key = answer_key.build_key(v, t, outdir)
            print(f"{v} T{t}: {os.path.basename(out)} {os.path.getsize(out) // 1024} KB (shrink rounds {rounds}); "
                  f"{os.path.basename(key)} {os.path.getsize(key) // 1024} KB")
