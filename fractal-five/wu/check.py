import os
"""Layout QA: every question figure must sit inside its own cell (with a margin),
and nothing may spill into the working column or off the page."""
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from weasyprint import HTML
import wu

PX = 25.4 / 96


def check(sessions, art="plain"):
    doc = ("<!DOCTYPE html><html><head><meta charset='utf-8'><style>" + wu.css()
           + "</style></head><body>" + "".join(wu.page(s, art) for s in sessions) + "</body></html>")
    r = HTML(string=doc, base_url=wu.HERE).render()
    problems = []
    for pi, pg in enumerate(r.pages):
        rows, qcells = [], []

        def walk(b):
            el = getattr(b, "element", None)
            cls = el.get("class") if el is not None else None
            if cls == "row" and b.element_tag == "div":
                rows.append(b)
            if cls == "q" and b.element_tag == "div":
                qcells.append(b)
            for ch in getattr(b, "children", []) or []:
                walk(ch)
        walk(pg._page_box)

        def extent(b, acc):
            for ch in getattr(b, "children", []) or []:
                el = getattr(ch, "element", None)
                tag = getattr(ch, "element_tag", None)
                cls = el.get("class") if el is not None else None
                leaf = (tag or "").endswith("svg") or tag in ("table", "img") or cls in ("disp", "qt", "qn")
                if leaf and getattr(ch, "height", None) is not None:
                    acc.append((ch.position_x, ch.position_y,
                                ch.position_x + ch.margin_width(), ch.position_y + ch.margin_height()))
                    continue
                extent(ch, acc)
            return acc
        for qi, q in enumerate(qcells):
            x0, y0 = q.position_x, q.position_y
            x1, y1 = x0 + q.margin_width(), y0 + q.margin_height()
            acc = extent(q, [])
            bx0 = min(a[0] for a in acc); by0 = min(a[1] for a in acc)
            bx1 = max(a[2] for a in acc); by1 = max(a[3] for a in acc)
            spare_b = (y1 - by1) * PX
            spare_r = (x1 - bx1) * PX
            flag = "  <-- OVERFLOW" if spare_b < 1.2 or spare_r < 0.5 or (bx0 - x0) * PX < -0.1 else ""
            if flag:
                problems.append((pi + 1, qi + 1))
            print(f"S{pi + 1} Q{qi + 1}: bottom spare {spare_b:5.1f} mm, right spare {spare_r:5.1f} mm{flag}")
    return problems


if __name__ == "__main__":
    from w01 import week1
    p = check(week1())
    print("PROBLEMS:", p if p else "none")
