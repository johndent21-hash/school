"""Build The Fractal Five - Year 10: four booklets (Sierpinski-triangle title page + 30 sessions each),
the checkpoint sample (four title pages + Week 1 of each term) and the per-term answer keys.

    python3 wu/build_all.py OUTDIR 1,2,3,4     booklets  OUTDIR/The_Fractal_Five_Year_10_Term_N.pdf
    python3 wu/build_all.py OUTDIR sample      OUTDIR/Year10_Sample.pdf
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


def quiet_check(sessions):
    with contextlib.redirect_stdout(io.StringIO()):
        return check(sessions)


def fix_overflow(sessions):
    for rnd in range(5):
        probs = quiet_check(sessions)
        if not probs:
            return rnd
        for pi, qi in probs:
            q = sessions[pi - 1].qs[qi - 1]
            if getattr(q, "figf", None) is None:
                raise RuntimeError(f"fixed question overflows: session {pi} q{qi}")
            q.s = round(q.s * 0.9, 3)
            q.fig = q.figf(q.s)
    raise RuntimeError(f"overflow persists: {quiet_check(sessions)}")


def cover_pdf(term, path):
    """Title page: the Year 9 'V' page (opts/covers2.py) in pastel, with a YEAR 10 pill and a
    Sierpinski triangle (vector SVG) over its blurred glow (part of the JPEG background)."""
    import art_opts as A
    import covers as K
    import covers2 as C2
    import mkart
    mkart.make()
    bg = os.path.join(OPTS, "art", "tri_bg.jpg")
    art = C2.svg_page(A.sierpinski_triangle_svg(depth=6, shrink=0.87, **mkart.COVER))
    chip = "Formulas provided" if term <= 2 else "Formulas from memory"
    ttl = (f'<div class="ttl"><div class="kick">{K.KICK}</div><div class="big">The Fractal<br><em>Five</em>'
           f'<span class="pill">Year 10</span></div>'
           f'<div class="bar"></div><div class="meta">{K.META}</div><div class="chip">{chip}</div></div>')
    top = (f'{K.logo()}<div class="tr">Mathematics<br>Year 10 &middot; Formula warm-ups</div>'
           f'<div class="tab"><div class="v">TERM {term}</div></div>')
    body = (f'<div class="page V T"><img class="art bg" src="file://{bg}">{art}{top}{ttl}{K.name_box()}'
            f'<div class="cap"><b>Sierpi&nacute;ski triangle</b><br>three copies of itself, each half the size</div>'
            f'{K.foot()}</div>')
    doc = (f"<!DOCTYPE html><html><head><meta charset='utf-8'><style>{C2.CSS}</style></head>"
           f"<body>{body}</body></html>")
    HTML(string=doc, base_url=OPTS).write_pdf(path)
    return path


def term_sessions(term):
    return gen.generated_sessions(term)


def _merge(parts, out, title, subject):
    w = PdfWriter()
    for path in parts:
        for p in PdfReader(path).pages:
            w.add_page(p)
    w.add_metadata({"/Title": title, "/Author": "Kingscliff High School Mathematics Faculty", "/Subject": subject})
    w.compress_identical_objects(remove_identicals=True, remove_unreferenced=True)
    with open(out, "wb") as fh:
        w.write(fh)
    return out


def answer_rows(sessions):
    return [{"week": s.week, "session": s.session, "q": i + 1, "family": q.fam, "formula": q.formula,
             "answer": q.answer, "question": q.text} for s in sessions for i, q in enumerate(s.qs)]


def ready(term):
    """The term's 30 sessions, with any figure that overflows its cell shrunk to fit."""
    sessions, seqs = term_sessions(term)
    assert len(sessions) == 30
    assert [(s.week, s.session) for s in sessions] == [(w, k) for w in range(1, 11) for k in (1, 2, 3)]
    rounds = fix_overflow(sessions)
    return sessions, seqs, rounds


def build(term, outdir):
    sessions, seqs, rounds = ready(term)
    title = f"The Fractal Five \u2014 Year 10, Term {term}"
    with tempfile.TemporaryDirectory() as td:
        tmp_s, tmp_c = os.path.join(td, "sessions.pdf"), os.path.join(td, "cover.pdf")
        wu.build(sessions, tmp_s, title=title)
        cover_pdf(term, tmp_c)
        out = _merge([tmp_c, tmp_s], os.path.join(outdir, f"The_Fractal_Five_Year_10_Term_{term}.pdf"), title,
                     "Year 10 formula warm-ups: 30 sessions, 150 questions")
    json.dump(answer_rows(sessions), open(os.path.join(HERE, f"answers_term{term}.json"), "w"), indent=1,
              ensure_ascii=False)
    return out, rounds, seqs, sessions


def build_sample(outdir):
    """Checkpoint sample: each term's title page followed by its Week 1 (Sessions 1-3), as they will print."""
    parts = []
    with tempfile.TemporaryDirectory() as td:
        rounds = {}
        for t in (1, 2, 3, 4):
            sessions, _, rounds[t] = ready(t)
            c, w1 = os.path.join(td, f"c{t}.pdf"), os.path.join(td, f"s{t}.pdf")
            cover_pdf(t, c)
            wu.build(sessions[:3], w1, title=f"The Fractal Five \u2014 Year 10, Term {t}")
            parts += [c, w1]
        out = _merge(parts, os.path.join(outdir, "Year10_Sample.pdf"),
                     "The Fractal Five \u2014 Year 10 (sample: title pages and Week 1 of each term)",
                     "Year 10 formula warm-ups: checkpoint sample")
    return out, rounds


if __name__ == "__main__":
    outdir = sys.argv[1] if len(sys.argv) > 1 else "out"
    what = sys.argv[2] if len(sys.argv) > 2 else "1,2,3,4"
    os.makedirs(outdir, exist_ok=True)
    if what == "sample":
        out, rounds = build_sample(outdir)
        print(f"{out}  (overflow fix rounds per term: {rounds})")
    else:
        for t in [int(x) for x in what.split(",")]:
            out, rounds, seqs, S = build(t, outdir)
            print(f"Term {t}: {out}  (overflow fix rounds: {rounds})")
