"""Build the four 'The Fractal Five' booklets: Sierpinski-pentagon title page + 30 sessions each."""
import contextlib
import io
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
OPTS = os.path.join(os.path.dirname(HERE), "opts")
sys.path.insert(0, HERE)
sys.path.insert(0, OPTS)
from pypdf import PdfReader, PdfWriter  # noqa: E402
from weasyprint import HTML  # noqa: E402
import gen  # noqa: E402
import samples  # noqa: E402
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
    import art_opts as A
    import covers as K
    import covers2 as C2
    glow = os.path.join(OPTS, "art", "pent_glow.png")
    if not os.path.exists(glow):
        A.pentagon_glow_png(glow, cx=105, cy=187, R=78)
    art = C2.svg_page(A.sierpinski_pentagon_svg(cx=105, cy=187, R=78, depth=5))
    chip = "Formulas provided" if term <= 2 else "Formulas from memory"
    ttl = (f'<div class="ttl"><div class="kick">{K.KICK}</div><div class="big">The Fractal<br><em>Five</em></div>'
           f'<div class="bar"></div><div class="meta">{K.META}</div><div class="chip">{chip}</div></div>')
    top = (f'{K.logo()}<div class="tr">Mathematics<br>Year 9 &middot; Formula warm-ups</div>'
           f'<div class="tab"><div class="v">TERM {term}</div></div>')
    body = (f'<div class="page V D"><img class="art" src="file://{glow}">{art}{top}{ttl}{K.name_box()}'
            f'<div class="cap"><b>Sierpi&nacute;ski pentagon</b><br>five copies of itself, each scaled by '
            f'1/<i>&phi;</i><sup>2</sup> &asymp; 0.382</div>{K.foot()}</div>')
    doc = (f"<!DOCTYPE html><html><head><meta charset='utf-8'><style>{C2.CSS}</style></head>"
           f"<body>{body}</body></html>")
    HTML(string=doc, base_url=OPTS).write_pdf(path)
    return path


def term_sessions(term):
    wk1 = samples.TERMS[term]()
    rest, seqs = gen.generated_sessions(term, wk1)
    return wk1 + rest, seqs


def build(term, outdir):
    sessions, seqs = term_sessions(term)
    assert len(sessions) == 30
    assert [(s.week, s.session) for s in sessions] == [(w, k) for w in range(1, 11) for k in (1, 2, 3)]
    rounds = fix_overflow(sessions)
    tmp_s = f"/tmp/ff_t{term}_sessions.pdf"
    tmp_c = f"/tmp/ff_t{term}_cover.pdf"
    wu.build(sessions, tmp_s, title=f"The Fractal Five \u2014 Term {term}")
    cover_pdf(term, tmp_c)
    out = os.path.join(outdir, f"The_Fractal_Five_Term_{term}.pdf")
    w = PdfWriter()
    for p in PdfReader(tmp_c).pages:
        w.add_page(p)
    for p in PdfReader(tmp_s).pages:
        w.add_page(p)
    w.add_metadata({"/Title": f"The Fractal Five \u2014 Term {term}",
                    "/Author": "Kingscliff High School Mathematics Faculty",
                    "/Subject": "Year 9 formula warm-ups: 30 sessions, 150 questions"})
    with open(out, "wb") as fh:
        w.write(fh)
    key = [{"week": s.week, "session": s.session, "q": i + 1, "family": q.fam, "formula": q.formula,
            "answer": q.answer, "question": q.text} for s in sessions for i, q in enumerate(s.qs)]
    json.dump(key, open(os.path.join(HERE, f"answers_term{term}.json"), "w"), indent=1, ensure_ascii=False)
    return out, rounds, seqs, sessions


if __name__ == "__main__":
    outdir = sys.argv[1] if len(sys.argv) > 1 else "/tmp/ff_out"
    terms = [int(t) for t in sys.argv[2].split(",")] if len(sys.argv) > 2 else [1, 2, 3, 4]
    os.makedirs(outdir, exist_ok=True)
    for t in terms:
        out, rounds, seqs, S = build(t, outdir)
        print(f"Term {t}: {out}  (overflow fix rounds: {rounds})")
