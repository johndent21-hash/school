# -*- coding: utf-8 -*-
"""Year 10 formula warm-ups (The Fractal Five) - page engine.

One page per session: 3 sessions a week, 10 weeks a term, 4 terms.
Each page is a centred two-column table of five questions. The left cell holds
the question and its diagram; the right cell is ruled for working, scaffolded
Formula -> Substitute -> (two working lines) -> Answer.

House style from the Year 7/8/9 revision booklets (Poppins headings, Open Sans
text, charcoal ink, house blue, stone fills, Kingscliff logo), pared back to a
white, photocopy-friendly page with faint pastel Sierpinski-triangle strips
(art/strip_top.jpg, art/strip_foot.jpg, made by mkart.py).
"""
import html
import os

from weasyprint import HTML

HERE = os.path.dirname(os.path.abspath(__file__))
ART = os.path.join(HERE, "art")
FONTS = os.path.join(os.path.dirname(HERE), "fonts")
PFONT = FONTS          # Poppins-*.ttf (bundled in ../fonts; also installed system-wide)
OFONT = FONTS          # OpenSans-*.ttf (the SVG diagrams ask for the installed 'Open Sans')

INK = "#35322D"
TXT2 = "#4A4741"
MUTED = "#8A857C"
STONE = "#F2EFE8"
BORDER = "#CDC7BC"
RULE = "#B9B4AA"
BLUE = "#3B7FC0"

# ------------------------------------------------------------------ geometry --
PAGE_W, PAGE_H = 210.0, 297.0
LEFT, WIDTH = 15.0, 180.0
T_TOP = 38.5           # table top
T_HEAD = 7.4           # table header row
T_BOT = 279.0          # table bottom
ROWS = 5
ROW_H = (T_BOT - T_TOP - T_HEAD) / ROWS
Q_W = 0.5              # left column share
LINES = 5
LINE_GAP = (ROW_H - 3.6) / LINES
LABELS = {0: "Formula", 1: "Substitute", LINES - 1: "Answer"}
FX_TOP, FX_H = 1.9, 8.4           # printed formula strip (Terms 1-2)
G_LINES = 4
G_GAP = (ROW_H - 2.5 - FX_TOP - FX_H) / G_LINES
G_LABELS = {0: "Copy", 1: "Substitute", G_LINES - 1: "Answer"}

# markup helpers ----------------------------------------------------------------
MINUS, TIMES, DIV, DEG = "\u2212", "\u00d7", "\u00f7", "\u00b0"


def esc(s):
    return html.escape(str(s), quote=False)


def v(x):
    return f"<i>{x}</i>"


def pw(b, e):
    return f"{b}<sup>{e}</sup>"


def frac(n, d):
    return (f'<span class="frac"><span class="fn">{n}</span>'
            f'<span class="fd">{d}</span></span>')


def display(s):
    """A line of maths set large and centred under the question."""
    return f'<div class="disp">{s}</div>'


def dtable(rows, head_col=True, compact=False):
    """Small data table (scores, counts); compact = tighter cells for wide frequency tables."""
    out = ['<table class="dt cmp">' if compact else '<table class="dt">']
    for r in rows:
        cells = []
        for j, c in enumerate(r):
            cls = ' class="sh"' if head_col and j == 0 else ""
            cells.append(f"<td{cls}>{c}</td>")
        out.append("<tr>" + "".join(cells) + "</tr>")
    out.append("</table>")
    return "".join(out)


class Q:
    """A warm-up question: text (HTML), an optional figure (SVG or HTML block)
    and the formula it practises (for the planning index, not printed)."""

    def __init__(self, text, fig=None, formula="", answer="", fx=None, fx_small=False, show_formula=False):
        self.text, self.fig, self.formula, self.answer = text, fig, formula, answer
        self.fx, self.fx_small = fx, fx_small
        self.show_formula = show_formula    # print the formula even in a 'from memory' term (Term 4 pyramid/cone)


class Session:
    def __init__(self, term, week, session, qs):
        assert len(qs) == ROWS, f"T{term} W{week} S{session}: {len(qs)} questions"
        self.term, self.week, self.session, self.qs = term, week, session, qs
        self.given = term <= 2          # Terms 1-2 print the formula; Terms 3-4 recall it
        for q in qs:
            if self.given or q.show_formula:
                assert q.fx, f"T{term} W{week} S{session}: a question has no printed formula"

    @property
    def index(self):
        return ((self.term - 1) * 10 + (self.week - 1)) * 3 + self.session


# ----------------------------------------------------------------- the page --
def _answer_cell(q=None, given=False):
    out = []
    if given:
        sm = " sm" if q.fx_small else ""
        out.append(f'<div class="fx" style="top:{FX_TOP}mm;height:{FX_H}mm"><span class="fxl">Formula</span>'
                   f'<span class="fxf{sm}">{q.fx}</span></div>')
        for i in range(G_LINES):
            top = FX_TOP + FX_H + (i + 1) * G_GAP
            lab = G_LABELS.get(i)
            cls = ' ans' if i == G_LINES - 1 else ''
            lab_html = f'<span class="lab{cls}">{lab}</span>' if lab else ""
            out.append(f'<div class="ln" style="top:{top - 0.3:.2f}mm">{lab_html}</div>')
        return "".join(out)
    for i in range(LINES):
        top = 0.9 + (i + 1) * LINE_GAP
        lab = LABELS.get(i)
        cls = ' ans' if i == LINES - 1 else ''
        lab_html = f'<span class="lab{cls}">{lab}</span>' if lab else ""
        out.append(f'<div class="ln" style="top:{top - 0.3:.2f}mm">{lab_html}</div>')
    return "".join(out)


def _question_cell(n, q):
    fig = f'<div class="qf">{q.fig}</div>' if q.fig else '<div class="qf"></div>'
    return (f'<div class="qh"><span class="qn">{n}</span><span class="qt">{q.text}</span></div>'
            f'{fig}')


def page(s, art="div"):
    rows = []
    for i, q in enumerate(s.qs):
        top = T_HEAD + i * ROW_H
        rows.append(
            f'<div class="row" style="top:{top:.3f}mm;height:{ROW_H:.3f}mm">'
            f'<div class="q">{_question_cell(i + 1, q)}</div>'
            f'<div class="a">{_answer_cell(q, s.given or q.show_formula)}</div></div>')
    table = (f'<div class="tbl" style="top:{T_TOP}mm;height:{T_BOT - T_TOP:.3f}mm">'
             f'<div class="th"><div class="thq">Question</div><div class="tha">Working</div></div>'
             + "".join(rows) + '</div>')
    top = f'<img class="divart" src="file://{ART}/strip_top.jpg">' if art in ("div", "top") else ""
    head = (f'{top}<div class="hdr">'
            f'<div class="logo"><img src="file://{ART}/logo.jpg"></div>'
            f'<div class="ttlb"><div class="eyb">Mathematics &middot; Year 10 &middot; The Fractal Five</div>'
            f'<div class="ttl">Week {s.week}<span class="sep">&middot;</span><em>Session {s.session}</em></div>'
            f'<div class="meta"><span class="chip">Term {s.term}</span>'
            f'<span class="mt">{"Copy" if s.given else "Write"} the formula, substitute, then solve.</span></div></div>'
            f'<div class="nm"><div class="f"><b>Name</b><i></i></div>'
            f'<div class="f"><b>Date</b><i></i></div></div></div>')
    foot = f'<img class="foot" src="file://{ART}/strip_foot.jpg">'
    return f'<div class="page">{head}{table}{foot}</div>'


def build(sessions, path, art="div", title="The Fractal Five - Year 10"):
    pages = [page(s, art) for s in sessions]
    doc = (f"<!DOCTYPE html><html><head><meta charset='utf-8'><title>{esc(title)}</title>"
           "<meta name='author' content='Kingscliff High School Mathematics Faculty'><style>" + css()
           + "</style></head><body>" + "".join(pages) + "</body></html>")
    HTML(string=doc, base_url=HERE).write_pdf(path)
    return path


def css():
    c = """
@font-face { font-family:'Pop'; src:url('file://$PF/Poppins-Regular.ttf'); font-weight:400; }
@font-face { font-family:'Pop'; src:url('file://$PF/Poppins-Medium.ttf'); font-weight:500; }
@font-face { font-family:'Pop'; src:url('file://$PF/Poppins-Bold.ttf'); font-weight:700; }
@font-face { font-family:'OS'; src:url('file://$OF/OpenSans-Regular.ttf'); font-weight:400; font-style:normal; }
@font-face { font-family:'OS'; src:url('file://$OF/OpenSans-Italic.ttf'); font-weight:400; font-style:italic; }
@font-face { font-family:'OS'; src:url('file://$OF/OpenSans-SemiBold.ttf'); font-weight:600; font-style:normal; }
@font-face { font-family:'OS'; src:url('file://$OF/OpenSans-Bold.ttf'); font-weight:700; font-style:normal; }
@font-face { font-family:'OS'; src:url('file://$OF/OpenSans-BoldItalic.ttf'); font-weight:700; font-style:italic; }
@page { size:A4; margin:0; }
* { box-sizing:border-box; margin:0; padding:0; }
body { font-family:'OS',sans-serif; font-size:10.5pt; line-height:1.4; color:$INK; }
sup { font-size:0.66em; vertical-align:0.5em; line-height:0; }
.page { width:210mm; height:297mm; position:relative; overflow:hidden; break-after:page; background:#fff; }
.page:last-child { break-after:auto; }

/* art */
.divart { position:absolute; left:0; top:26.9mm; width:210mm; height:11.6mm; }
.foot { position:absolute; left:0; bottom:0; width:210mm; height:17mm; }

/* header */
.hdr { position:absolute; left:0; top:0; width:210mm; height:36mm; }
.logo { position:absolute; left:15mm; top:9.2mm; width:33mm; }
.logo img { width:100%; display:block; }
.ttlb { position:absolute; left:55.5mm; top:8.6mm; width:90mm; }
.eyb { font-family:'Pop'; font-weight:500; font-size:6.6pt; letter-spacing:.22em; text-transform:uppercase; color:$MUTED; }
.ttl { font-family:'Pop'; font-weight:700; font-size:21pt; line-height:1.12; color:$INK; margin-top:1.2mm; }
.ttl em { font-style:normal; color:$BLUE; }
.ttl .sep { color:#B9B3A8; font-weight:500; margin:0 2.4mm; }
.meta { margin-top:1.8mm; font-size:8.4pt; color:$TX2; }
.chip { display:inline-block; font-family:'Pop'; font-weight:700; font-size:6.4pt; letter-spacing:.18em;
        text-transform:uppercase; color:$BLUE; border:0.35mm solid $BLUE; border-radius:0.9mm;
        padding:0.35mm 1.7mm 0.15mm 2mm; margin-right:2.4mm; vertical-align:0.25mm; }
.nm { position:absolute; right:15mm; top:8.4mm; width:52mm; border:0.35mm solid $BORDER; border-radius:1.8mm;
      background:#fff; padding:2.1mm 3.2mm 2.6mm 3.2mm; }
.nm .f { display:flex; align-items:flex-end; }
.nm .f + .f { margin-top:3.6mm; }
.nm b { font-family:'Pop'; font-weight:500; font-size:6.3pt; letter-spacing:.18em; text-transform:uppercase;
        color:$INK; width:11mm; }
.nm i { flex:1; border-bottom:0.3mm solid $RULE; height:4.2mm; }

/* table */
.tbl { position:absolute; left:15mm; width:180mm; border:0.35mm solid $BORDER; border-radius:2mm;
       overflow:hidden; background:#fff; }
.th { position:absolute; left:0; top:0; width:100%; height:$THmm; background:$STONE;
      border-bottom:0.35mm solid $BORDER; }
.th div { position:absolute; top:0; height:$THmm; line-height:$THmm; font-family:'Pop'; font-weight:500;
          font-size:7pt; letter-spacing:.2em; text-transform:uppercase; color:$INK; padding-left:4.2mm; }
.thq { left:0; width:$QWmm; }
.tha { left:$QWmm; width:$AWmm; border-left:0.35mm solid $BORDER; }
.row { position:absolute; left:0; width:100%; }
.row + .row { border-top:0.35mm solid $BORDER; }
.q { position:absolute; left:0; top:0; width:$QWmm; height:100%; padding:3.3mm 4.2mm 2.6mm 4.2mm;
     display:flex; flex-direction:column; }
.a { position:absolute; left:$QWmm; top:0; width:$AWmm; height:100%; border-left:0.35mm solid $BORDER; }
.qh { display:flex; align-items:flex-start; }
.qn { font-family:'Pop'; font-weight:700; font-size:11pt; line-height:1.3; color:$BLUE; width:6.4mm;
      flex:none; margin-top:-0.4mm; }
.qt { flex:1; }
.qf { flex:1; display:flex; align-items:center; justify-content:center; padding-top:1mm; }
.qf svg { display:block; }
.ln { position:absolute; left:4.2mm; right:4.2mm; height:0; border-bottom:0.3mm solid $RULE; }
.lab { position:absolute; left:0; bottom:1mm; font-family:'Pop'; font-weight:500; font-size:6.1pt;
       letter-spacing:.16em; text-transform:uppercase; color:#9A948A; line-height:1; }
.lab.ans { color:$BLUE; }

/* printed formula (Terms 1-2) */
.fx { position:absolute; left:4.2mm; right:4.2mm; background:$STONE; border-radius:1.1mm;
      display:flex; align-items:center; padding:0 3mm 0 4.4mm; }
.fx::before { content:""; position:absolute; left:0; top:0; bottom:0; width:1.1mm; background:$BLUE;
              border-radius:1.1mm 0 0 1.1mm; }
.fxl { font-family:'Pop'; font-weight:500; font-size:6.1pt; letter-spacing:.16em; text-transform:uppercase;
       color:$BLUE; width:16.5mm; flex:none; line-height:1; }
.fxf { flex:1; font-size:10.5pt; line-height:1.2; color:$INK; }
.fxf.sm { font-size:8.7pt; line-height:1.2; }
.fxf .frac { font-size:0.84em; vertical-align:-0.66em; }
.fxf .fxn { font-size:0.86em; color:$TX2; }

/* maths */
.disp { font-size:15pt; line-height:1.3; color:$INK; text-align:center; }
.frac { display:inline-block; vertical-align:-0.5em; text-align:center; margin:0 0.5mm; line-height:1.08; }
.frac .fn { display:block; border-bottom:0.3mm solid currentColor; padding:0 0.8mm 0.2mm; }
.frac .fd { display:block; padding:0.2mm 0.8mm 0; }
table.dt { border-collapse:collapse; }
table.dt td { border:0.3mm solid $BORDER; padding:1.2mm 2.2mm; text-align:center; font-size:11pt; min-width:8.6mm; }
table.dt.cmp td { padding:1.2mm 1.6mm; min-width:7.6mm; }
table.dt td.sh { background:$STONE; font-family:'Pop'; font-weight:500; font-size:7.4pt; letter-spacing:.06em;
                 text-align:left; }
"""
    qw = WIDTH * Q_W
    rep = {"$PF": PFONT, "$OF": OFONT, "$INK": INK, "$TX2": TXT2, "$MUTED": MUTED, "$STONE": STONE,
           "$BORDER": BORDER, "$RULE": RULE, "$BLUE": BLUE, "$TH": f"{T_HEAD}",
           "$QW": f"{qw:.2f}", "$AW": f"{WIDTH - qw:.2f}"}
    for k in sorted(rep, key=len, reverse=True):
        c = c.replace(k, rep[k])
    return c
