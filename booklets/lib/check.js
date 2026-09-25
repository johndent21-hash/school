// Layout checks run inside the browser on every page of a booklet.
// Returns a list of problems: overflow, overlapping blocks, clipped text, content spilling out of its box,
// and working space that is too small to write in. 1 mm = 3.78 px at 96 dpi.
module.exports = () => {
  const MM = 3.78;
  const out = [];
  const label = (el) => {
    const q = el.closest('.q, .qs, .worked, .zone');
    const t = q && (q.querySelector('.q-text, .worked-q, .zone-text') || {}).textContent;
    return t ? ` [${t.trim().slice(0, 50)}]` : '';
  };
  const r = (el) => el.getBoundingClientRect();
  const overlap = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1;
  const visible = (el) => { const b = r(el); return b.width > 0 && b.height > 0 && getComputedStyle(el).position !== 'absolute'; };

  document.querySelectorAll('.page').forEach((p, i) => {
    const pg = `page ${i + 1}`;
    const c = p.querySelector('.content');
    if (!c) return;
    const cb = r(c);
    if (c.scrollHeight > c.clientHeight + 1) out.push(`${pg}: content overflows by ${Math.round((c.scrollHeight - c.clientHeight) / MM)} mm`);

    // 1. Blocks must sit inside the page content area and inside the panel/box that contains them.
    c.querySelectorAll('.zone, .q, .qs, .worked, .graph-card, .template-card, .sl, .box, .grid-paper, .given, .banner, svg.graph, .data-table, .steps-card').forEach((el) => {
      if (el.closest('.tear-zone')) return;
      const b = r(el);
      if (b.bottom > cb.bottom + 1 || b.right > cb.right + 1) out.push(`${pg}: ${el.className.baseVal ?? el.className} runs off the page${label(el)}`);
      const parent = el.parentElement.closest('.zone, .q, .worked, .graph-card, .template-card, .exit-q');
      if (parent) {
        const pb = r(parent);
        if (b.bottom > pb.bottom + 1.5 || b.right > pb.right + 1.5 || b.left < pb.left - 1.5 || b.top < pb.top - 1.5)
          out.push(`${pg}: ${el.className.baseVal ?? el.className} spills out of its ${parent.className.split(' ')[0]}${label(el)}`);
      }
    });

    // 2. Siblings in any flex or grid container must not overlap.
    p.querySelectorAll('*').forEach((box) => {
      const d = getComputedStyle(box).display;
      if (!/flex|grid/.test(d)) return;
      const kids = [...box.children].filter(visible);
      for (let a = 0; a < kids.length; a++) for (let b = a + 1; b < kids.length; b++) {
        if (overlap(r(kids[a]), r(kids[b]))) out.push(`${pg}: ${kids[a].className || kids[a].tagName} overlaps ${kids[b].className || kids[b].tagName}${label(kids[a])}`);
      }
    });

    // 3. Text must not be clipped or run past the right edge of its box.
    p.querySelectorAll('.q-text, .worked-q, .steps li, .worked-a, .given, .card li, .zone-text, .banner-title, .qs .q-text, td, th').forEach((el) => {
      if (el.scrollWidth > el.clientWidth + 2) out.push(`${pg}: text too wide for its box${label(el)} "${el.textContent.trim().slice(0, 40)}"`);
    });
    p.querySelectorAll('.worked, .zone, .exit-q').forEach((el) => {
      if (el.scrollHeight > el.clientHeight + 2) out.push(`${pg}: text cut off at the bottom of a ${el.className.split(' ')[0]}${label(el)}`);
    });

    // 3b. Question text must end above its answer box.
    p.querySelectorAll('.q').forEach((qq) => {
      const h = qq.querySelector('.q-head'), bx = qq.querySelector(':scope > .box, :scope > .draw-area');
      if (h && bx && r(h).bottom > r(bx).top + 0.5) out.push(`${pg}: question text runs into its answer box${label(qq)}`);
    });
    // 3c. Graphs must not be squashed below a readable size.
    p.querySelectorAll('svg.graph').forEach((g) => { if (r(g).height > 0 && r(g).height / MM < 12 && !g.closest('.q-text')) out.push(`${pg}: a graph is squashed to ${(r(g).height / MM).toFixed(0)} mm${label(g)}`); });

    // 4. Enough room to write.
    p.querySelectorAll('.q .box').forEach((b) => {
      const h = r(b).height / MM;
      const min = b.closest('.example') ? 20 : b.closest('.exit-q') ? 18 : 15;
      if (h < min) out.push(`${pg}: working box only ${h.toFixed(0)} mm tall (want ${min})${label(b)}`);
    });
    p.querySelectorAll('.qs .box').forEach((b) => { if (r(b).height / MM < 8) out.push(`${pg}: answer box under 8 mm${label(b)}`); });
    p.querySelectorAll('.grid-paper').forEach((b) => { if (r(b).height / MM < 42) out.push(`${pg}: grid paper only ${(r(b).height / MM).toFixed(0)} mm tall${label(b)}`); });
    p.querySelectorAll('.template-card').forEach((b) => { if (r(b).height / MM < 18) out.push(`${pg}: dot plot template only ${(r(b).height / MM).toFixed(0)} mm tall${label(b)}`); });
    p.querySelectorAll('.sl.template td.leaf').forEach((b) => { if (r(b).height / MM < 6.5) out.push(`${pg}: stem-and-leaf row under 6.5 mm${label(b)}`); });

    // 5. Nothing above the tear line may reach into the tear-off zone.
    const tz = p.querySelector('.tear-zone');
    if (tz) {
      const top = r(tz).top;
      c.querySelectorAll('.zone, .worked, .q, .graph-card, .banner, .summary-grid, .notes').forEach((el) => {
        if (!el.closest('.tear-zone') && r(el).bottom > top - 2) out.push(`${pg}: content runs into the tear-off zone${label(el)}`);
      });
    }
  });
  return [...new Set(out)];
};
