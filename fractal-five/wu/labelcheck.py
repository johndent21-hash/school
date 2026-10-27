"""Pixel-level label check for question figures.

Each SVG figure is rendered at 200 dpi as separate layers: one page with every line, arc, arrowhead
and dot (all <text> removed), then one page per label. From the actual rendered pixels it measures
the gap between every label and the drawing, and between every pair of labels, in CSS px
(1 px = 0.26 mm). A label that touches a line, an arc or another label shows up as a gap near 0.

    python3 wu/labelcheck.py [TERMS] [--all]

checks the figures of every question in the built terms (default 1,2,3,4), reports the tightest
gaps, and exits non-zero if any label is closer than FAIL px to a line or another label. New
families and working-backwards items are always reported; --all also lists the tightest gaps
of the older families.
"""
import os
import re
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

DPI = 200
K = DPI / 96.0              # device pixels per CSS px
FAIL = 1.5                  # CSS px: anything closer counts as touching
WARN = 2.5
PAGE_W, PAGE_H = 340, 190   # CSS px, big enough for any question figure

TEXT_RE = re.compile(r"<text\b[^>]*>.*?</text>", re.S)


def layers(svg):
    """(drawing without text, [svg with only label i])"""
    texts = TEXT_RE.findall(svg)
    base = TEXT_RE.sub("", svg)
    head = svg[:svg.index(">") + 1]
    return base, [head + t + "</svg>" for t in texts], texts


def render(svgs, workdir):
    from weasyprint import HTML
    pages = "".join(f'<div class="p">{s}</div>' for s in svgs)
    doc = (f"<html><head><meta charset='utf-8'><style>@page {{ size:{PAGE_W}px {PAGE_H}px; margin:0; }}"
           f"body {{ margin:0; }} .p {{ width:{PAGE_W}px; height:{PAGE_H}px; break-after:page; overflow:hidden; }}"
           f".p svg {{ display:block; }}</style></head><body>{pages}</body></html>")
    pdf = os.path.join(workdir, "layers.pdf")
    HTML(string=doc).write_pdf(pdf)
    subprocess.run(["pdftoppm", "-r", str(DPI), "-gray", pdf, os.path.join(workdir, "l")], check=True)
    files = sorted(f for f in os.listdir(workdir) if f.startswith("l-") and f.endswith(".pgm"))
    assert len(files) == len(svgs), (len(files), len(svgs))
    return [np.asarray(Image.open(os.path.join(workdir, f)), dtype=np.float32) / 255.0 for f in files]


def min_gap(a, b, pad=40):
    """Smallest distance (CSS px) between the ink pixels of masks a and b, or None if b has no ink nearby."""
    ya, xa = np.nonzero(a)
    if len(ya) == 0:
        return None
    y0, y1, x0, x1 = ya.min() - pad, ya.max() + pad, xa.min() - pad, xa.max() + pad
    sub = b[max(0, y0):y1, max(0, x0):x1]
    yb, xb = np.nonzero(sub)
    if len(yb) == 0:
        return None
    yb, xb = yb + max(0, y0), xb + max(0, x0)
    A = np.stack([ya, xa], 1).astype(np.float32)
    B = np.stack([yb, xb], 1).astype(np.float32)
    best = 1e9
    for i in range(0, len(A), 400):
        d = ((A[i:i + 400, None, :] - B[None, :, :]) ** 2).sum(-1)
        best = min(best, float(d.min()))
    return max(0.0, (best ** 0.5 - 1.0)) / K      # -1: adjacent pixels are touching


def check_figures(figs):
    """figs: [(name, svg)] -> [(name, label text, gap to drawing, gap to nearest other label)]"""
    jobs, index = [], []
    for name, svg in figs:
        base, labs, texts = layers(svg)
        if not labs:
            continue
        index.append((name, len(jobs), len(labs), texts))
        jobs += [base] + labs
    out = []
    with tempfile.TemporaryDirectory() as wd:
        imgs = render(jobs, wd)
        for name, i0, n, texts in index:
            base = imgs[i0] < 0.72                      # strokes and marks (light face fills excluded)
            lab = [imgs[i0 + 1 + j] < 0.85 for j in range(n)]
            for j in range(n):
                g_line = min_gap(lab[j], base)
                others = [min_gap(lab[j], lab[k]) for k in range(n) if k != j]
                others = [g for g in others if g is not None]
                plain = re.sub(r"<[^>]+>", "", texts[j])
                out.append((name, plain, g_line, min(others) if others else None))
    return out


NEW_FAMS = {"ang_line", "ang_par", "pct_incdec", "pct_orig", "sa_cyl", "capacity"}


def is_new(q):
    it = getattr(q, "item", None)
    return (q.fam in NEW_FAMS or q.formula in ("a_sector", "idx_zero")
            or (isinstance(it, tuple) and it and it[0] == "rev"))


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    show_all = "--all" in sys.argv
    terms = [int(t) for t in args[0].split(",")] if args else [1, 2, 3, 4]
    import build_all
    figs, new_names = [], set()
    for t in terms:
        sessions, _ = build_all.term_sessions(t)
        build_all.fix_overflow(sessions)
        for s in sessions:
            for i, q in enumerate(s.qs):
                if q.fig and q.fig.lstrip().startswith("<svg"):
                    name = f"T{t} W{s.week} S{s.session} Q{i + 1} {q.fam} ({q.formula})"
                    figs.append((name, q.fig))
                    if is_new(q):
                        new_names.add(name)
    res = check_figures(figs)
    bad = [r for r in res if (r[2] is not None and r[2] < FAIL) or (r[3] is not None and r[3] < FAIL)]
    tight = [r for r in res if r not in bad and ((r[2] is not None and r[2] < WARN) or (r[3] is not None and r[3] < WARN))]
    n_new = sum(1 for r in res if r[0] in new_names)
    print(f"{len(figs)} figures, {len(res)} labels checked ({n_new} labels in new items)")
    for title, rows in (("TOUCHING (gap < %.1f px)" % FAIL, bad), ("TIGHT (gap < %.1f px)" % WARN, tight)):
        sel = [r for r in rows if show_all or r[0] in new_names]
        print(f"\n{title}: {len(sel)}" + ("" if show_all else f"  (new items; {len(rows) - len(sel)} more in older families)"))
        for name, lab, gl, go in sel:
            gls = "-" if gl is None else f"{gl:.1f}"
            gos = "-" if go is None else f"{go:.1f}"
            print(f"  {name}: '{lab}'  to drawing {gls} px, to other labels {gos} px")
    new_rows = [r for r in res if r[0] in new_names]
    if new_rows:
        gl = [r[2] for r in new_rows if r[2] is not None]
        go = [r[3] for r in new_rows if r[3] is not None]
        print(f"\nnew items: smallest label-to-drawing gap {min(gl):.1f} px, smallest label-to-label gap "
              f"{min(go) if go else float('nan'):.1f} px")
    new_bad = [r for r in bad if r[0] in new_names]
    sys.exit(1 if new_bad else 0)


if __name__ == "__main__":
    main()
