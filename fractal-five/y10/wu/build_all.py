"""Build the four Year 10 'The Fractal Five' booklets: Sierpinski-triangle title page + 30 sessions each.

    python3 wu/build_all.py OUTDIR [1,2,3,4]     full booklets  OUTDIR/The_Fractal_Five_Year_10_Term_N.pdf
    python3 wu/build_all.py OUTDIR sample        OUTDIR/Year10_Sample.pdf (four title pages + Week 1 of each term)
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


def cover_pdf(term, path):
    """Title page: the Year 9 'V' layout in the pastel scheme, Sierpinski triangle over a JPEG
    background that carries the midnight colour and the triangle's soft glow."""
    import art_opts as A
    import covers as K
    import covers2 as C2
    bg = os.path.join(OPTS, "art", "tri_bg.jpg")
    if not os.path.exists(bg):
        os.makedirs(os.path.dirname(bg), exist_ok=True)
        A.triangle_bg_jpg(bg)
    art = C2.svg_page(A.sierpinski_triangle_svg(depth=6, shrink=0.87))
    chip = "Formulas provided" if term <= 2 else "Formulas from memory"
    ttl = (f'<div class="ttl"><div class="kick">{K.KICK}</div><div class="big">The Fractal<br><em>Five</em>'
           f'<span class="yr">YEAR 10</span></div>'
           f'<div class="bar"></div><div class="meta">{K.META}</div><div class="chip">{chip}</div></div>')
    top = (f'{K.logo()}<div class="tr">Mathematics<br>Year 10 &middot; Formula warm-ups</div>'
           f'<div class="tab"><div class="v">TERM {term}</div></div>')
    body = (f'<div class="page V D"><img class="art" src="file://{bg}">{art}{top}{ttl}{K.name_box()}'
            f'<div class="cap"><b>Sierpi&nacute;ski triangle</b><br>three copies of itself, each half the size'
            f'</div>{K.foot()}</div>')
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
    w.compress_identical_objects(remove_identicals=True, remove_unreferenced=True)   # one copy of the logo
    with open(out, "wb") as fh:
        w.write(fh)
    return out


def build(term, outdir, weeks=10):
    sessions, seqs = term_sessions(term)
    assert len(sessions) == 30
    assert [(s.week, s.session) for s in sessions] == [(w, k) for w in range(1, 11) for k in (1, 2, 3)]
    rounds = fix_overflow(sessions)
    tmp = tempfile.mkdtemp(prefix="ff10_")
    tmp_s, tmp_c = os.path.join(tmp, "sessions.pdf"), os.path.join(tmp, "cover.pdf")
    title = f"The Fractal Five \u2014 Year 10, Term {term}"
    wu.build(sessions[:3 * weeks], tmp_s, title=title)
    cover_pdf(term, tmp_c)
    out = os.path.join(outdir, f"The_Fractal_Five_Year_10_Term_{term}.pdf")
    _merge([tmp_c, tmp_s], out, title, "Year 10 formula warm-ups: 30 sessions, 150 questions")
    key = [{"week": s.week, "session": s.session, "q": i + 1, "family": q.fam, "formula": q.formula,
            "answer": q.answer, "question": q.text} for s in sessions for i, q in enumerate(s.qs)]
    json.dump(key, open(os.path.join(HERE, f"answers_term{term}.json"), "w"), indent=1, ensure_ascii=False)
    return out, rounds, seqs, sessions


def build_sample(outdir):
    """The checkpoint sample: each term's title page followed by its Week 1 (Sessions 1-3)."""
    tmp = tempfile.mkdtemp(prefix="ff10s_")
    parts = []
    for t in (1, 2, 3, 4):
        sessions, _ = term_sessions(t)
        fix_overflow(sessions)
        c, p = os.path.join(tmp, f"c{t}.pdf"), os.path.join(tmp, f"s{t}.pdf")
        cover_pdf(t, c)
        wu.build(sessions[:3], p, title=f"The Fractal Five - Year 10, Term {t}, Week 1")
        parts += [c, p]
    return _merge(parts, os.path.join(outdir, "Year10_Sample.pdf"),
                  "The Fractal Five \u2014 Year 10 sample (title pages and Week 1 of each term)",
                  "Year 10 formula warm-ups: sample")


if __name__ == "__main__":
    outdir = sys.argv[1] if len(sys.argv) > 1 else "out"
    os.makedirs(outdir, exist_ok=True)
    if len(sys.argv) > 2 and sys.argv[2] == "sample":
        print(build_sample(outdir))
        sys.exit(0)
    terms = [int(t) for t in sys.argv[2].split(",")] if len(sys.argv) > 2 else [1, 2, 3, 4]
    for t in terms:
        out, rounds, seqs, S = build(t, outdir)
        print(f"Term {t}: {out}  (overflow fix rounds: {rounds})")
