// Two-page worksheets for Chapter 1 Integers (lib/worksheet2.js). Each lesson is six steps (columns), from Easy to
// Challenging. A step has a heading, a HOW TO box (the explanation, with a picture), then rounds of questions:
// { text, gen, mode, kinds, max }. gen() returns { q, a, lines, fig, figDone }: lines is the working, one step a line
// (the answer last); fig is a picture for the question, figDone the same picture completed (shown when worked).
// Lesson 1.01 uses at most two negative signs in front of a number, as in −(−5).
const D = require('../../lib/diagrams');
const { svg, text } = require('../../lib/graphs');
const { ev, F } = require('../../lib/calc');

// Several diagrams side by side, each with a label above (thermometers A, B, C, …).
const size = (s) => /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(s).slice(1).map(Number);
const inner = (s) => s.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
const row = (figs, labels, gap = 3) => {
  let x = 0, H = 0, b = '';
  figs.forEach((s, i) => {
    const [w, h] = size(s);
    b += `<svg x="${x}" y="5" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${inner(s)}</svg>` + text(x + w / 2 - 1, 3.6, labels[i], { size: 3, anchor: 'middle', weight: 700 });
    x += w + gap; H = Math.max(H, h);
  });
  return svg(+(x - gap).toFixed(1), H + 5, b);
};
// A window of the number line around some values, at least `span` units wide.
const win = (vals, span = 12) => { let lo = Math.min(...vals) - 1, hi = Math.max(...vals) + 1; while (hi - lo < span) { lo--; if (hi - lo < span) hi++; } return [lo, hi]; };
const line = (vals, o = {}) => { let [min, max] = win(vals, o.span || 12); if (o.every === 2 && min % 2) min--; return D.jumps({ min, max, ...o }); };
const table = (head, rows) => `<table class="data-table"><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</table>`;
const money = (v) => (v < 0 ? `−$${-v}` : `$${v}`);
const signTable = (op) => table([op, '+', '−'], [['<b>+</b>', '+', '−'], ['<b>−</b>', '−', '+']]);
const sit = [['a gain of {n} kg', 1], ['a loss of ${n}', -1], ['{n}°C below zero', -1], ['{n} m above sea level', 1], ['{n} m below sea level', -1], ['a rise of {n} cm', 1],
  ['a fall of {n} points', -1], ['{n} floors up', 1], ['{n} floors down', -1], ['a deposit of ${n}', 1], ['a withdrawal of ${n}', -1], ['{n} steps back', -1], ['{n} minutes late', 1]];

module.exports = {
  '1.01': ({ ri, nz, pick, shuffle, N }) => {
    const temps = shuffle([-9, -7, -6, -4, -3, -2, 1, 3, 4, 6, 8]).slice(0, 4);
    const sea = [['kite', ri(4, 6) * 5], ['gull', ri(1, 3) * 5], ['boat', 0], ['diver', -ri(1, 3) * 5], ['crab', -ri(4, 6) * 5]];
    return [
      { title: 'What is an integer?',
        how: { text: '<p>An <b>integer</b> is a whole number. It can be positive, negative or zero.</p><p>Negative integers are to the <b>left</b> of 0. Positive integers are to the <b>right</b>.</p>', fig: D.jumps({ min: -6, max: 6, marks: { '-4': '−4', 3: '3' }, w: 54 }), fh: 12 },
        rounds: [
          { text: 'Which integer is marked by the dot? Count along from a number you know.', mode: 'quick', max: 5, gen: () => { const n = nz(-9, 9), x = n - ri(2, 9), lo = x - ((x % 2) + 2) % 2; return { q: '', fig: D.jumps({ min: lo, max: lo + 12, start: n, done: false, w: 42, every: 2 }), a: N(n) }; } },
          { text: 'Write an integer for each situation.', mode: 'quick', max: 5, gen: () => { const [t, s] = pick(sit), n = ri(2, 90); return { q: t.replace('{n}', n), a: N(s * n) }; } },
        ] },
      { title: 'Integers in real life',
        how: { text: '<p>Use a <b>negative</b> integer for below zero, down, a loss, a fall or a withdrawal.</p><p>Use a <b>positive</b> integer for above zero, up, a gain, a rise or a deposit.</p><p>Zero is neither: it is the starting point.</p>' },
        rounds: [
          { text: 'Read each thermometer. Write the temperature as an integer.', mode: 'quick', we: 1, fig: row(temps.map((v) => D.thermometer({ min: -10, max: 10, value: v, unit: 1.15, w: 19 })), ['A', 'B', 'C', 'D'], 1), fh: 30,
            gen: (i) => (i < 4 ? { q: `Thermometer ${'ABCD'[i]}`, a: `${N(temps[i])}°C` } : null) },
          { text: 'Write each height as an integer. Above sea level is positive, below is negative.', mode: 'quick', we: 1, fig: D.vscale({ min: -30, max: 30, tick: 5, every: 10, unit: 0.75, marks: sea.map(([t, v]) => ({ v, text: t })), w: 46 }), fh: 50,
            gen: (i) => (i < 5 ? { q: `the ${sea[i][0]}`, a: `${N(sea[i][1])} m` } : null) },
        ] },
      { title: 'Opposites',
        how: { text: '<p>The <b>opposite</b> of an integer is the same distance from 0, on the other side.</p><p>The opposite of 4 is −4. The opposite of −4 is 4. The opposite of 0 is 0.</p>', fig: D.jumps({ min: -6, max: 6, arcs: [{ from: 0, to: 4, label: '4 units' }, { from: 0, to: -4, label: '4 units' }], w: 54 }), fh: 17 },
        rounds: [
          { text: 'The dot shows an integer. Mark its opposite, then write it. Show the distance from 0 on both sides.', max: 3, gen: () => { const n = nz(-9, 9), d = Math.abs(n); if (d < 3) return { q: '' };
            return { q: `The opposite of ${N(n)}`, a: N(-n), fig: D.jumps({ min: -10, max: 10, start: n, done: false }), figDone: D.jumps({ min: -10, max: 10, start: n, arcs: [{ from: 0, to: n, label: `${d}` }, { from: 0, to: -n, label: `${d}` }], marks: { [-n]: true } }), lines: [`${N(n)} is ${d} units from 0`, `opposite: ${N(-n)}`] }; } },
          { text: 'Write the opposite of each integer.', mode: 'quick', max: 6, gen: (i) => { const n = i % 5 === 4 ? 0 : nz(-150, 150); return { q: N(n), a: N(-n) }; } },
        ] },
      { title: 'The opposite of the opposite',
        how: { text: '<p>A − sign in front of a number means <b>the opposite of</b>.</p><p>−(−5) means the opposite of −5, which is 5.</p><p>−(+5) means the opposite of 5, which is −5.</p>', fig: D.jumps({ min: -6, max: 6, arcs: [{ from: 5, to: -5, label: 'opposite' }, { from: -5, to: 5, label: 'opposite again' }], marks: { 5: true }, w: 54 }), fh: 17 },
        rounds: [
          { text: 'Simplify. Say "the opposite of" for each − in front of a bracket.', kinds: 2, max: 4, gen: (i) => { const n = ri(2, 60); return i % 2 === 0 ? { q: `−(−${n})`, a: N(n), lines: [`= opp. of −${n}`, `= ${n}`] } : { q: `−(+${n})`, a: N(-n), lines: [`= opp. of ${n}`, `= −${n}`] }; } },
          { text: 'Find −n for each value of n. Put the value in brackets first.', max: 4, gen: () => { const v = nz(-40, 40); return { q: `n = ${N(v)}`, a: N(-v), lines: [`−n = −(${N(v)})`, `= ${N(-v)}`] }; } },
        ] },
      { title: 'Distance from zero',
        how: { text: '<p>The <b>distance from 0</b> is how many units a number is from 0. A distance is never negative.</p><p>−6 and 6 are both 6 units from 0: they are opposites.</p><p>−9 is further from 0 than 6, even though 6 is larger.</p>', fig: D.jumps({ min: -10, max: 7, arcs: [{ from: 0, to: 6, label: '6' }, { from: 0, to: -9, label: '9' }], w: 54 }), fh: 17 },
        rounds: [
          { text: 'Answer each question. Write the distances from 0 on the first line.', kinds: 3, max: 5, gen: (i) => {
            const k = i % 3, a = ri(2, 15), b = ri(2, 15), m = ri(2, 5);
            if (k === 0) return a === b ? { q: '' } : { q: `Which is further from 0: −${a} or ${b}?`, a: a > b ? `−${a}` : String(b), lines: [`−${a}: ${a} units, ${b}: ${b} units`, `further: ${a > b ? `−${a}` : b}`] };
            if (k === 1) return { q: `Which two integers are ${a} units from 0?`, a: `${a} and −${a}`, lines: [`${a} right of 0: ${a}`, `${a} left of 0: −${a}`] };
            const xs = Array.from({ length: 2 * m - 1 }, (_, j) => N(j - m + 1)).join(', ');
            return { q: `List every integer less than ${m} units from 0.`, a: xs, lines: [`from −${m - 1} up to ${m - 1}`, xs] };
          } },
        ] },
      { title: 'Opposites in problems',
        how: { text: '<p>Write each amount as an integer first. Then use opposites: they are the same distance from 0, on either side.</p><p>A gull 12 m above the sea and a diver 12 m below are at opposite heights: 12 and −12.</p>', fig: D.vscale({ min: -15, max: 15, tick: 5, every: 5, unit: 1, marks: [{ v: 12, text: 'gull 12 m' }, { v: -12, text: 'diver −12 m' }], w: 46 }), fh: 30 },
        rounds: [
          { text: 'Answer each question. Write your reasoning on the lines.', kinds: 3, max: 4, min: 2, gen: (i) => {
            const k = i % 3, n = ri(2, 40), d = 2 * ri(3, 15);
            return [
              { q: `The opposite of a number is −${n}. What is the number?`, a: N(n), lines: [`opposite of ? = −${n}`, `the number is ${n}`] },
              { q: `A diver is ${n} m below sea level. A gull is the same distance above. Write both heights as integers.`, a: `−${n} m, ${n} m`, lines: [`diver: −${n} m`, `gull: ${n} m`] },
              { q: `Two integers are opposites and are ${d} units apart. What are they?`, a: `${d / 2} and −${d / 2}`, lines: [`each is half of ${d} from 0: ${d / 2}`, `${d / 2} and −${d / 2}`] },
            ][k];
          } },
        ] },
    ];
  },

  '1.02': ({ ri, nz, pick, N }) => {
    const apart = (a, b) => { const [lo, hi] = a < b ? [a, b] : [b, a]; return lo < 0 && hi > 0 ? [`${N(lo)} to 0: ${-lo}, 0 to ${N(hi)}: ${hi}`, `${-lo} + ${hi} = ${hi - lo}`] : [`count from ${N(lo)} to ${N(hi)}`, `${hi - lo} units`]; };
    return [
      { title: 'Reading a number line',
        how: { text: '<p>Numbers get <b>larger</b> as you move <b>right</b>, and smaller as you move left.</p><p>Every mark is one more than the mark to its left. Count along from a number you know.</p>', fig: D.jumps({ min: -6, max: 6, marks: { '-3': 'A', 2: 'B' }, w: 54 }), fh: 12 },
        rounds: [
          { text: 'Which integer is marked by the dot?', mode: 'quick', max: 4, gen: () => { const n = nz(-12, 12), x = n - ri(2, 9), lo = x - ((x % 2) + 2) % 2; return { q: '', fig: D.jumps({ min: lo, max: lo + 12, start: n, done: false, w: 42, every: 2 }), a: N(n) }; } },
          { text: 'Which integer is further to the right? Use the number line at the top of the page.', mode: 'quick', max: 6, gen: () => { const a = ri(-15, 15); let b; do b = ri(-15, 15); while (b === a); return { q: `${N(a)} or ${N(b)}`, a: N(Math.max(a, b)) }; } },
        ] },
      { title: 'Moving along the number line',
        how: { text: '<p>Start at the first number. Moving <b>right</b> makes the number larger; moving <b>left</b> makes it smaller.</p><p>Start at −2 and move 5 right: you land on 3.</p>', fig: D.jumps({ min: -6, max: 6, start: -2, moves: [5], w: 54 }), fh: 16 },
        rounds: [
          { text: 'Draw the jump on the number line. Write where you land.', max: 4, gen: () => { const a = ri(-7, 7), m = ri(2, 8) * pick([1, -1]); if (Math.abs(a + m) > 10) return { q: '' };
            return { q: `Start at ${N(a)} and move ${Math.abs(m)} ${m > 0 ? 'right' : 'left'}.`, a: N(a + m), fig: D.jumps({ min: -10, max: 10, start: a, done: false }), figDone: D.jumps({ min: -10, max: 10, start: a, moves: [m] }), lines: [`land on ${N(a + m)}`] }; } },
        ] },
      { title: 'Scales that go up in 2s, 5s or 10s',
        how: { text: '<p>Not every number line goes up in ones. To find the <b>step</b>, take two labelled marks: find the difference, then divide by the number of gaps between them.</p><p>From −10 to 0 is 10, in 5 gaps: each gap is 2.</p>', fig: D.numberLine({ min: -10, max: 10, step: 2, blank: true, marks: { '-10': '−10', 0: '0', 6: '?' }, w: 54, h: 13 }), fh: 13 },
        rounds: [
          { text: 'Find the step, then the number at the ?', max: 4, gen: () => {
            const st = pick([2, 5, 10]), lo = -st * ri(3, 7), g = ri(2, 4), t = ri(2, 10); if (Math.abs(t - g) < 2) return { q: '' };
            const v = lo + t * st;
            return { q: 'What number is at the ?', a: N(v), fig: D.numberLine({ min: lo, max: lo + 10 * st, step: st, blank: true, marks: { [lo]: N(lo), [lo + g * st]: N(lo + g * st), [v]: '?' }, w: 56, h: 13 }), fh: 13, lines: [`${g} gaps = ${g * st}, so step = ${st}`, `? = ${N(v)}`] };
          } },
        ] },
      { title: 'Distance between integers',
        how: { text: '<p>Count the units from one integer to the other. If one is negative and one is positive, count to 0, then on from 0.</p><p>−3 to 5: 3 units to 0, then 5 more. 3 + 5 = 8 units.</p>', fig: D.jumps({ min: -6, max: 6, arcs: [{ from: -3, to: 0, label: '3' }, { from: 0, to: 5, label: '5' }], marks: { '-3': true, 5: true }, w: 54 }), fh: 16 },
        rounds: [
          { text: 'How many units apart are the two integers? Draw the jumps through 0.', max: 4, gen: () => {
            const a = ri(-9, -1), b = ri(1, 9), [x, y] = ri(0, 1) ? [a, b] : [b, a];
            return { q: `${N(x)} and ${N(y)}`, a: String(Math.abs(x - y)), fig: D.jumps({ min: -10, max: 10, marks: { [x]: true, [y]: true } }), figDone: D.jumps({ min: -10, max: 10, arcs: [{ from: a, to: 0, label: `${-a}` }, { from: 0, to: b, label: `${b}` }], marks: { [x]: true, [y]: true } }), lines: apart(x, y) };
          } },
          { text: 'How many units apart? Both are negative: count from one to the other.', max: 2, gen: () => { const a = -ri(8, 20), b = a + ri(3, 12); if (b >= 0) return { q: '' }; return { q: `${N(a)} and ${N(b)}`, a: String(b - a), lines: [`${N(a)} to ${N(b)}`, `${b - a} units`] }; } },
        ] },
      { title: 'Halfway between',
        how: { text: '<p>Find the distance between the two integers and halve it. Then move that far from the smaller one.</p><p>−7 and 3 are 10 apart. Half is 5. −7 + 5 = −2.</p>', fig: D.jumps({ min: -8, max: 4, arcs: [{ from: -7, to: -2, label: '5' }, { from: -2, to: 3, label: '5' }], marks: { '-7': true, 3: true }, w: 54 }), fh: 16 },
        rounds: [
          { text: 'Which integer is exactly halfway between? Show the two equal jumps.', max: 3, gen: () => { const m = ri(-5, 5), d = ri(2, 5);
            return { q: `${N(m - d)} and ${N(m + d)}`, a: N(m), fig: D.jumps({ min: -10, max: 10, marks: { [m - d]: true, [m + d]: true } }), figDone: D.jumps({ min: -10, max: 10, arcs: [{ from: m - d, to: m, label: `${d}` }, { from: m, to: m + d, label: `${d}` }], marks: { [m - d]: true, [m + d]: true } }), lines: [`${2 * d} apart, half is ${d}`, `${N(m - d)} + ${d} = ${N(m)}`] }; } },
          { text: 'Now without a number line.', max: 2, gen: () => { const m = ri(-15, 10), d = ri(6, 15); return { q: `Halfway between ${N(m - d)} and ${N(m + d)}`, a: N(m), lines: [`${2 * d} apart, half is ${d}`, `${N(m - d)} + ${d} = ${N(m)}`] }; } },
        ] },
      { title: 'Number line problems',
        how: { text: '<p>Draw a quick number line. Mark the numbers you know first.</p><p><b>Between</b> does not include the end numbers: the integers between −3 and 4 are −2, −1, 0, 1, 2 and 3 (six of them).</p>', fig: D.jumps({ min: -5, max: 6, marks: { '-2': true, '-1': true, 0: true, 1: true, 2: true, 3: true }, w: 54 }), fh: 11 },
        rounds: [
          { text: 'Answer each question. Show your working.', kinds: 3, max: 4, min: 3, gen: (i) => {
            const k = i % 3;
            if (k === 0) { const a = ri(4, 20), b = ri(4, 20); return { q: `How many integers are between −${a} and ${b}?`, a: String(a + b - 1), lines: [`−${a - 1} to −1: ${a - 1}, and 0`, `1 to ${b - 1}: ${b - 1}`, `${a - 1} + 1 + ${b - 1} = ${a + b - 1}`] }; }
            if (k === 1) { const s = ri(2, 9), l = ri(8, 15), r = ri(2, 7); return { q: `An ant starts at ${s}. It walks ${l} units left, then ${r} units right. Where is it now?`, a: N(s - l + r), lines: [`${s} − ${l} = ${N(s - l)}`, `${N(s - l)} + ${r} = ${N(s - l + r)}`, `it is at ${N(s - l + r)}`] }; }
            const p = -ri(3, 12), q = ri(5, 15); return { q: `Point A is at ${N(p)}. Point B is ${q} units to the right of A. Where is B, and how far is B from 0?`, a: `${N(p + q)}, ${Math.abs(p + q)} units`, lines: [`${N(p)} + ${q} = ${N(p + q)}`, `B is at ${N(p + q)}`, `${Math.abs(p + q)} units from 0`] };
          } },
        ] },
    ];
  },

  '1.03': ({ ri, shuffle, pick, N }) => {
    const cities = shuffle(['Hobart', 'Oslo', 'Moscow', 'Toronto', 'Denver', 'Beijing']).slice(0, 5);
    const tc = shuffle([-14, -11, -9, -6, -4, -2, 0, 3, 5, 7]).slice(0, 5);
    const byT = cities.map((c, i) => [c, tc[i]]).sort((a, b) => a[1] - b[1]);
    const thr = byT[2][1] + 1;
    return [
      { title: 'Which is larger?',
        how: { text: '<p>On a number line, the integer further to the <b>right</b> is larger.</p><p>−2 is to the right of −7, so −2 is larger than −7.</p><p>Every positive integer is larger than every negative integer.</p>', fig: D.jumps({ min: -8, max: 4, marks: { '-7': '−7', '-2': '−2' }, w: 54 }), fh: 12 },
        rounds: [
          { text: 'Which integer is larger? Look at where they are on the number line.', mode: 'quick', max: 4, gen: () => { const a = ri(-10, 8); let b; do b = ri(-10, 8); while (b === a || Math.abs(a - b) > 10);
            return { q: `${N(a)} or ${N(b)}`, fig: line([a, b], { marks: { [a]: true, [b]: true }, w: 42, every: 2 }), a: N(Math.max(a, b)) }; } },
          { text: 'Write the smaller integer.', mode: 'quick', max: 6, gen: () => { const a = ri(-30, 10); let b; do b = ri(-30, 10); while (b === a); return { q: `${N(a)} or ${N(b)}`, a: N(Math.min(a, b)) }; } },
        ] },
      { title: 'Using &lt; and &gt;',
        how: { text: '<p><b>&lt;</b> means "is less than". <b>&gt;</b> means "is greater than".</p><p>The open side of the symbol faces the larger number.</p><p>−5 &lt; 2 (−5 is less than 2)<br>3 &gt; −8 (3 is greater than −8)<br>−1 &gt; −6 (−1 is further right)</p>' },
        rounds: [
          { text: 'Write &lt; or &gt; in the box.', mode: 'quick', max: 8, gen: () => { const a = ri(-20, 12); let b; do b = ri(-20, 12); while (b === a); return { q: `${N(a)} ☐ ${N(b)}`, a: a < b ? '<' : '>' }; } },
          { text: 'True or false?', mode: 'quick', max: 5, gen: () => { const a = ri(-15, 6); let b; do b = ri(-15, 6); while (b === a); const s = pick(['<', '>']); return { q: `${N(a)} ${s === '<' ? '&lt;' : '&gt;'} ${N(b)}`, a: (s === '<') === (a < b) ? 'true' : 'false' }; } },
        ] },
      { title: 'Ordering integers',
        how: { text: '<p><b>Ascending</b> order: smallest to largest, the order they sit on the number line from left to right.</p><p><b>Descending</b> order: largest to smallest.</p><p>Mark the numbers on a number line, then read them off.</p>', fig: D.jumps({ min: -8, max: 6, marks: { '-6': '−6', '-1': '−1', 2: '2', 5: '5' }, w: 54 }), fh: 12 },
        rounds: [
          { text: 'Mark the integers on the number line, then write them in ascending order.', max: 3, gen: () => { const s = new Set(); while (s.size < 4) s.add(ri(-9, 9)); const xs = [...s], o = [...xs].sort((a, b) => a - b);
            return { q: xs.map(N).join(', '), a: o.map(N).join(', '), fig: D.jumps({ min: -10, max: 10 }), figDone: D.jumps({ min: -10, max: 10, marks: Object.fromEntries(xs.map((x) => [x, true])) }), lines: [o.map(N).join(', ')] }; } },
          { text: 'Write the integers in descending order (largest first).', max: 3, gen: () => { const s = new Set(); while (s.size < 5) s.add(ri(-40, 30)); const xs = [...s], o = [...xs].sort((a, b) => b - a); return { q: xs.map(N).join(', '), a: o.map(N).join(', '), lines: [`largest: ${N(o[0])}, smallest: ${N(o[4])}`, o.map(N).join(', ')] }; } },
        ] },
      { title: 'Comparing temperatures',
        how: { text: '<p>Colder temperatures are <b>lower</b> on a thermometer, so they are smaller numbers.</p><p>−8°C is colder than −3°C, so −8 &lt; −3.</p>', fig: D.thermometer({ min: -10, max: 5, value: -3, unit: 1.4, arrows: [{ v: -3, text: '−3°C' }, { v: -8, text: '−8°C' }], w: 36 }), fh: 27 },
        rounds: [
          { text: 'The table shows the lowest temperature in five cities on one winter day. Use it to answer the questions.', fig: table(['City', 'Lowest temperature'], cities.map((c, i) => [c, `${N(tc[i])}°C`])), fh: 27, we: 1, max: 5, min: 1,
            gen: (i) => [
              { q: 'Which city was the coldest?', a: byT[0][0], lines: [`lowest: ${N(byT[0][1])}°C`, byT[0][0]] },
              { q: 'Which city was the warmest?', a: byT[4][0], lines: [`highest: ${N(byT[4][1])}°C`, byT[4][0]] },
              { q: 'How many cities had a temperature below zero?', a: String(tc.filter((t) => t < 0).length), lines: [`below 0: ${tc.filter((t) => t < 0).map(N).join(', ')}`, `${tc.filter((t) => t < 0).length} cities`] },
              { q: 'Write the temperatures in ascending order.', a: byT.map((x) => N(x[1])).join(', '), lines: [byT.map((x) => `${N(x[1])}°C`).join(', ')] },
              { q: `Which cities were colder than ${N(thr)}°C?`, a: byT.slice(0, 3).map((x) => x[0]).join(', '), lines: [`below ${N(thr)}: ${byT.slice(0, 3).map((x) => N(x[1])).join(', ')}`, byT.slice(0, 3).map((x) => x[0]).join(', ')] },
              { q: `Write &lt; or &gt;: ${cities[1]} ☐ ${cities[3]}`, a: tc[1] < tc[3] ? '<' : '>', lines: [`${N(tc[1])} ${tc[1] < tc[3] ? '&lt;' : '&gt;'} ${N(tc[3])}`] },
            ][i] || null },
        ] },
      { title: 'Simplify, then compare',
        how: { text: '<p>Simplify any −(−n) first: −(−6) = 6.</p><p>Then place the numbers on a number line and compare them.</p><p>−(−2), −5, 0: simplify to 2, −5, 0. Ascending: −5, 0, 2.</p>' },
        rounds: [
          { text: 'Simplify first, then answer the question.', kinds: 2, max: 6, gen: (i) => {
            const a = ri(2, 12), b = ri(2, 12), c = ri(2, 12);
            if (i % 2 === 0) return a === c ? { q: '' } : { q: `Which is the smallest: −(−${a}), −${b} or −(−${c})?`, a: `−${b}`, lines: [`−(−${a}) = ${a}, −(−${c}) = ${c}`, `smallest: −${b}`] };
            const xs = [a, -b, -c, 0]; if (new Set(xs).size < 4) return { q: '' }; const o = [...xs].sort((p, q) => p - q);
            return { q: `Write in ascending order: −(−${a}), −${b}, −${c}, 0`, a: o.map(N).join(', '), lines: [`−(−${a}) = ${a}`, o.map(N).join(', ')] };
          } },
        ] },
      { title: 'Between, above and below',
        how: { text: '<p>"Greater than −5" means to the <b>right</b> of −5. "Less than 2" means to the <b>left</b> of 2.</p><p>The integers greater than −5 and less than 2 are −4, −3, −2, −1, 0 and 1.</p>', fig: D.jumps({ min: -6, max: 3, marks: { '-4': true, '-3': true, '-2': true, '-1': true, 0: true, 1: true }, w: 54 }), fh: 11 },
        rounds: [
          { text: 'Answer each question. Draw a quick number line if it helps.', kinds: 3, max: 4, min: 2, gen: (i) => {
            const k = i % 3;
            if (k === 0) { const lo = -ri(12, 20), hi = lo + ri(5, 8); return { q: `Write three integers greater than ${N(lo)} but less than ${N(hi)}.`, a: `e.g. ${N(lo + 1)}, ${N(lo + 2)}, ${N(lo + 3)}`, lines: [`integers from ${N(lo + 1)} to ${N(hi - 1)}`, `e.g. ${N(lo + 1)}, ${N(lo + 2)}, ${N(lo + 3)}`] }; }
            if (k === 1) { const a = ri(3, 12), b = ri(2, 10); return { q: `How many integers are greater than −${a} and less than ${b}?`, a: String(a + b - 1), lines: [`−${a - 1} up to ${b - 1}`, `${a - 1} + 1 + ${b - 1} = ${a + b - 1}`] }; }
            const lo = -ri(5, 9); const odd = []; for (let v = lo + 1; v < 0; v++) if (v % 2) odd.push(v);
            return { q: `I am an odd integer. I am less than 0 but greater than ${N(lo)}. What could I be?`, a: odd.map(N).join(', '), lines: [`between ${N(lo)} and 0`, `odd: ${odd.map(N).join(', ')}`] };
          } },
        ] },
    ];
  },

  '1.04': ({ ri, nz, pick, N, B }) => [
    { title: 'Adding a positive: move right',
      how: { text: '<p>Start at the first number. Adding a <b>positive</b> number means move <b>right</b>.</p><p>−5 + 7: start at −5, move 7 right, land on 2.</p>', fig: D.jumps({ min: -6, max: 6, start: -5, moves: [7], w: 54 }), fh: 16 },
      rounds: [
        { text: 'Draw the jump on the number line, then write the answer.', max: 3, gen: () => { const a = ri(-9, -1), b = ri(2, 9); if (a + b > 10) return { q: '' };
          return { q: `${N(a)} + ${b}`, a: N(a + b), fig: D.jumps({ min: -10, max: 10, start: a, done: false }), figDone: D.jumps({ min: -10, max: 10, start: a, moves: [b] }), lines: [`= ${N(a + b)}`] }; } },
        { text: 'Evaluate. Picture the jump right.', mode: 'quick', max: 6, gen: () => { const a = nz(-15, -1), b = ri(1, 15); return { q: `${N(a)} + ${b}`, a: N(a + b) }; } },
      ] },
    { title: 'Counters and zero pairs',
      how: { text: '<p>A yellow counter is +1. A red counter is −1.</p><p>A + and a − make a <b>zero pair</b>: together they are 0, so cross them out.</p><p>3 + (−5): three zero pairs, two red counters are left, so the answer is −2.</p>', fig: D.counters({ pos: 3, neg: 5, pairs: true, cross: true }), fh: 13 },
      rounds: [
        { text: 'Ring the zero pairs and cross them out. What is left?', max: 4, gen: () => { const a = ri(1, 8), b = ri(1, 8); if (a === b) return { q: '' }; const [p, q] = pick([[a, -b], [-b, a]]); const z = Math.min(a, b), left = a - b;
          return { q: `${N(p)} + ${B(q)}`, a: N(left), fig: D.counters({ pos: a, neg: b }), figDone: D.counters({ pos: a, neg: b, pairs: true, cross: true }), lines: [`${z} zero pairs, ${Math.abs(left)} ${left > 0 ? 'yellow' : 'red'} left`, `= ${N(left)}`] }; } },
      ] },
    { title: 'Adding a negative: move left',
      how: { text: '<p>Adding a <b>negative</b> number means move <b>left</b>. It is the same as subtracting.</p><p>2 + (−6) = 2 − 6 = −4</p><p>−3 + (−4) = −3 − 4 = −7</p>', fig: D.jumps({ min: -6, max: 4, start: 2, moves: [-6], w: 54 }), fh: 16 },
      rounds: [
        { text: 'Draw the jump left, then write the answer.', max: 2, gen: () => { const a = ri(-4, 8), b = ri(3, 9); if (a - b < -10) return { q: '' };
          return { q: `${N(a)} + (−${b})`, a: N(a - b), fig: D.jumps({ min: -10, max: 10, start: a, done: false }), figDone: D.jumps({ min: -10, max: 10, start: a, moves: [-b] }), lines: [`= ${N(a)} − ${b} = ${N(a - b)}`] }; } },
        { text: 'Evaluate. Rewrite + (−) as −, then work it out.', max: 6, gen: () => { const a = nz(-15, 15), b = ri(2, 15); return { q: `${N(a)} + (−${b})`, a: N(a - b), lines: [`= ${N(a)} − ${b}`, `= ${N(a - b)}`] }; } },
      ] },
    { title: 'Adding several integers',
      how: { text: '<p>Add from left to right, one step at a time.</p><p>−4 + 9 + (−7)<br>= 5 + (−7)<br>= −2</p>', fig: D.jumps({ min: -5, max: 6, start: -4, moves: [9, -7], w: 54 }), fh: 19 },
      rounds: [
        { text: 'Draw both jumps, then write the answer.', max: 2, gen: () => { const a = ri(-6, 6), b = nz(-8, 8), c = nz(-8, 8); if (Math.abs(a + b) > 10 || Math.abs(a + b + c) > 10 || b * c > 0) return { q: '' };
          return { q: `${N(a)} + ${B(b)} + ${B(c)}`, a: N(a + b + c), fig: D.jumps({ min: -10, max: 10, start: a, done: false }), figDone: D.jumps({ min: -10, max: 10, start: a, moves: [b, c] }), lines: [`= ${N(a + b)} + ${B(c)} = ${N(a + b + c)}`] }; } },
        { text: 'Evaluate. Add from left to right.', max: 4, gen: () => { const a = nz(-15, 15), b = nz(-15, 15), c = nz(-15, 15); if (a > 0 && b > 0 && c > 0) return { q: '' }; return { q: `${N(a)} + ${B(b)} + ${B(c)}`, a: N(a + b + c), lines: [`= ${N(a + b)} + ${B(c)}`, `= ${N(a + b + c)}`] }; } },
      ] },
    { title: 'Adding in real life',
      how: { text: '<p>Write the situation as a sum. Rises, gains and deposits are positive. Falls, losses and withdrawals are negative.</p><p>It is −6°C, then the temperature rises 10°C: −6 + 10 = 4°C.</p>', fig: D.thermometer({ min: -10, max: 10, value: 4, unit: 1.2, arrows: [{ v: 4, text: 'after' }, { v: -6, text: 'before' }], w: 36 }), fh: 24 },
      rounds: [
        { text: 'Write a number sentence, then answer the question.', kinds: 3, max: 3, gen: (i) => {
          const k = i % 3, t = -ri(2, 9), r = ri(5, 15), l = -ri(1, 3), f = ri(3, 7), m = ri(10, 40), s = m + ri(5, 30);
          return [
            { q: `The temperature is ${N(t)}°C and rises ${r}°C. What is the new temperature?`, a: `${N(t + r)}°C`, lines: [`${N(t)} + ${r}`, `= ${N(t + r)}°C`] },
            { q: `A lift at level ${N(l)} goes up ${f} floors. Which level is it on now?`, a: `level ${N(l + f)}`, lines: [`${N(l)} + ${f}`, `= level ${N(l + f)}`] },
            { q: `Sam has $${m} and spends $${s} using credit. What is Sam's balance?`, a: money(m - s), lines: [`${m} + (−${s})`, `= ${money(m - s)}`] },
          ][k];
        } },
      ] },
    { title: 'Missing numbers',
      how: { text: '<p>The ☐ is the jump from the first number to the answer. Right is +, left is −.</p><p>−3 + ☐ = 5: from −3 to 5 is 8 to the right, so ☐ = 8.</p><p>4 + ☐ = −2: from 4 to −2 is 6 to the left, so ☐ = −6.</p>', fig: D.jumps({ min: -4, max: 6, start: -3, moves: [8], w: 54 }), fh: 16 },
      rounds: [
        { text: 'Find the missing number. Say which way you jump and how far.', max: 4, one: true, gen: () => { const a = nz(-12, 12), b = nz(-12, 12), c = a + b;
          return { q: `${N(a)} + ☐ = ${N(c)}`, a: N(b), lines: [`${N(a)} to ${N(c)}: ${Math.abs(b)} ${b > 0 ? 'right' : 'left'}`, `☐ = ${N(b)}`] }; } },
        { text: 'The missing number comes first now. Jump back from the answer.', max: 2, one: true, gen: () => { const a = nz(-12, 12), b = nz(-12, 12), c = a + b;
          return { q: `☐ + ${B(b)} = ${N(c)}`, a: N(a), lines: [`☐ = ${N(c)} − ${B(b)}`, `☐ = ${N(a)}`] }; } },
      ] },
  ],

  '1.05': ({ ri, nz, N, B }) => [
    { title: 'Subtracting a positive: move left',
      how: { text: '<p>Subtracting a positive number means move <b>left</b>.</p><p>2 − 7: start at 2, move 7 left, land on −5.</p>', fig: D.jumps({ min: -6, max: 4, start: 2, moves: [-7], w: 54 }), fh: 16 },
      rounds: [
        { text: 'Draw the jump left, then write the answer.', max: 3, gen: () => { const a = ri(-2, 8), b = ri(3, 10); if (a - b < -10 || a - b >= 0) return { q: '' };
          return { q: `${N(a)} − ${b}`, a: N(a - b), fig: D.jumps({ min: -10, max: 10, start: a, done: false }), figDone: D.jumps({ min: -10, max: 10, start: a, moves: [-b] }), lines: [`= ${N(a - b)}`] }; } },
        { text: 'Evaluate. Picture the jump left.', mode: 'quick', max: 6, gen: () => { const a = ri(-5, 12), b = ri(2, 20); return { q: `${N(a)} − ${b}`, a: N(a - b) }; } },
      ] },
    { title: 'Starting below zero',
      how: { text: '<p>Starting below zero and subtracting takes you <b>further below</b> zero.</p><p>−3 − 4 = −7</p><p>Think of money: you owe $3, then spend $4 more. Now you owe $7.</p>', fig: D.jumps({ min: -8, max: 2, start: -3, moves: [-4], w: 54 }), fh: 16 },
      rounds: [
        { text: 'Draw the jump, then write the answer.', max: 2, gen: () => { const a = -ri(1, 5), b = ri(2, 5);
          return { q: `${N(a)} − ${b}`, a: N(a - b), fig: D.jumps({ min: -10, max: 5, start: a, done: false }), figDone: D.jumps({ min: -10, max: 5, start: a, moves: [-b] }), lines: [`= ${N(a - b)}`] }; } },
        { text: 'Evaluate.', mode: 'quick', max: 6, gen: () => { const a = -ri(1, 20), b = ri(2, 20); return { q: `${N(a)} − ${b}`, a: N(a - b) }; } },
      ] },
    { title: 'Subtracting a negative: move right',
      how: { text: '<p>Subtracting a negative is the same as <b>adding</b> its opposite: − (−3) becomes + 3.</p><p>5 − (−3) = 5 + 3 = 8</p><p>−6 − (−2) = −6 + 2 = −4</p><p>Taking away a debt of $3 leaves you $3 better off.</p>', fig: D.jumps({ min: -7, max: 1, start: -6, moves: [2], w: 54 }), fh: 16 },
      rounds: [
        { text: 'Change − (−) to +. Draw the jump right, then write the answer.', max: 2, gen: () => { const a = ri(-8, 4), b = ri(2, 6); if (a + b > 10) return { q: '' };
          return { q: `${N(a)} − (−${b})`, a: N(a + b), fig: D.jumps({ min: -10, max: 10, start: a, done: false }), figDone: D.jumps({ min: -10, max: 10, start: a, moves: [b] }), lines: [`= ${N(a)} + ${b} = ${N(a + b)}`] }; } },
        { text: 'Change − (−) to +, then evaluate.', max: 6, gen: () => { const a = nz(-12, 12), b = ri(2, 12); return { q: `${N(a)} − (−${b})`, a: N(a + b), lines: [`= ${N(a)} + ${b}`, `= ${N(a + b)}`] }; } },
      ] },
    { title: 'Temperature change',
      how: { text: '<p>Change in temperature = <b>new − old</b>. A positive change is a rise; a negative change is a fall.</p><p>From −4°C to 6°C: 6 − (−4) = 6 + 4 = 10, a rise of 10°C.</p><p>On the thermometer, count the degrees from one reading to the other.</p>', fig: D.thermometer({ min: -10, max: 10, value: 6, unit: 1.2, arrows: [{ v: 6, text: 'max' }, { v: -4, text: 'min' }], w: 34 }), fh: 30 },
      rounds: [
        { text: 'Find the difference between the maximum and minimum temperatures.', max: 2, gen: () => { const lo = -ri(2, 9), hi = ri(2, 9); if (hi - lo < 6) return { q: '' };
          return { q: `Minimum ${N(lo)}°C, maximum ${hi}°C`, a: `${hi - lo}°C`, fig: D.thermometer({ min: -10, max: 10, value: hi, unit: 1, arrows: [{ v: hi, text: 'max' }, { v: lo, text: 'min' }], w: 34 }), fh: 24, lines: [`${hi} − (${N(lo)})`, `= ${hi} + ${-lo}`, `= ${hi - lo}°C`] }; } },
        { text: 'Find the change: new − old. Say whether it is a rise or a fall.', max: 3, gen: () => { const a = ri(-12, 12), b = ri(-12, 12); if (Math.abs(a - b) < 3 || (a > 0 && b > 0)) return { q: '' }; const c = b - a;
          return { q: `From ${N(a)}°C to ${N(b)}°C`, a: `${N(c)}°C, a ${c > 0 ? 'rise' : 'fall'}`, lines: [`${N(b)} − ${B(a)}`, `= ${N(c)}°C, a ${c > 0 ? 'rise' : 'fall'} of ${Math.abs(c)}°C`] }; } },
      ] },
    { title: 'Mixed + and −',
      how: { text: '<p>First change every − (−n) to + n.</p><p>Then work from left to right, one step a line.</p><p>−3 − (−5) + (−4)<br>= −3 + 5 + (−4)<br>= 2 + (−4)<br>= −2</p>' },
      rounds: [
        { text: 'Evaluate. Change − (−) to + first, then add from left to right.', max: 5, gen: () => { const a = nz(-15, 15), b = nz(-15, -1), c = nz(-15, 15); return { q: `${N(a)} − ${B(b)} + ${B(c)}`, a: N(a - b + c), lines: [`= ${N(a)} + ${-b} + ${B(c)}`, `= ${N(a - b)} + ${B(c)}`, `= ${N(a - b + c)}`] }; } },
      ] },
    { title: 'Heights and depths',
      how: { text: '<p>Heights above sea level are positive; depths below are negative.</p><p>Difference in height = <b>higher − lower</b>.</p><p>From a wreck at −20 m to a cliff top at 35 m: 35 − (−20) = 55 m.</p>', fig: D.vscale({ min: -30, max: 40, tick: 10, every: 10, unit: 0.45, marks: [{ v: 35, text: 'cliff top' }, { v: -20, text: 'wreck' }], w: 46 }), fh: 34 },
      rounds: [
        { text: 'Write a number sentence, then answer the question.', kinds: 3, max: 4, gen: (i) => {
          const k = i % 3, d = -ri(40, 150), u = ri(10, 35), x = ri(2, 12), y = ri(2, 12), h = ri(20, 90), w = -ri(10, 40);
          return [
            { q: `A submarine at ${N(d)} m rises ${u} m. How deep is it now?`, a: `${N(d + u)} m`, lines: [`${N(d)} + ${u}`, `= ${N(d + u)} m`] },
            { q: `A bird is ${h} m above sea level and a fish is ${-w} m below. How far apart are they?`, a: `${h - w} m`, lines: [`${h} − (${N(w)})`, `= ${h} + ${-w}`, `= ${h - w} m`] },
            { q: `What is ${x} less than −${y}?`, a: N(-y - x), lines: [`−${y} − ${x}`, `= ${N(-y - x)}`] },
          ][k];
        } },
      ] },
  ],

  '1.06': ({ ri, nz, pick, N, B }) => [
    { title: 'Multiplying: equal groups',
      how: { text: '<p>3 × (−2) means 3 groups of −2.</p><p>(−2) + (−2) + (−2) = −6, so 3 × (−2) = −6.</p>', fig: D.groups({ n: 3, each: -2 }), fh: 9 },
      rounds: [
        { text: 'Write the groups as a sum, then as a product.', max: 3, gen: () => { const n = ri(2, 4), k = ri(2, 3);
          return { q: `${n} × (−${k})`, a: N(-n * k), fig: D.groups({ n, each: -k }), fh: 9, lines: [Array(n).fill(`(−${k})`).join(' + '), `= ${N(-n * k)}`] }; } },
        { text: 'Evaluate. A positive times a negative is negative.', mode: 'quick', max: 6, gen: () => { const a = ri(2, 10), b = ri(2, 10); return pick([0, 1]) ? { q: `${a} × (−${b})`, a: N(-a * b) } : { q: `−${a} × ${b}`, a: N(-a * b) }; } },
      ] },
    { title: 'The sign rules',
      how: { text: '<p><b>Same</b> signs: the answer is <b>positive</b>.</p><p><b>Different</b> signs: the answer is <b>negative</b>.</p><p>Multiply the numbers, then use the table to choose the sign.</p>', fig: signTable('×'), fh: 14 },
      rounds: [
        { text: 'Will the answer be positive or negative? Write + or −.', mode: 'quick', max: 4, gen: () => { const a = nz(-9, 9), b = nz(-9, 9); if (Math.abs(a) < 2 || Math.abs(b) < 2) return { q: '' }; return { q: `${N(a)} × ${B(b)}`, a: a * b > 0 ? '+' : '−' }; } },
        { text: 'Now evaluate each product.', mode: 'quick', max: 6, gen: () => { const a = nz(-10, 10), b = nz(-10, 10); return (a > 0 && b > 0) || Math.abs(a) < 2 || Math.abs(b) < 2 ? { q: '' } : { q: `${N(a)} × ${B(b)}`, a: N(a * b) }; } },
      ] },
    { title: 'Why − × − is +',
      how: { text: '<p>Look down the pattern. Each time the first number goes down by 1, the answer goes <b>up</b> by 3.</p><p>So the pattern carries on into positive answers.</p>', fig: table(['product', 'answer', ''], [['2 × (−3)', '−6', ''], ['1 × (−3)', '−3', '+3'], ['0 × (−3)', '0', '+3'], ['−1 × (−3)', '3', '+3'], ['−2 × (−3)', '6', '+3']]), fh: 26 },
      rounds: [
        { text: 'Continue the pattern for three more lines.', max: 2, min: 3, gen: () => { const k = ri(2, 9);
          return { q: `2 × (−${k}) = ${N(-2 * k)}, 1 × (−${k}) = −${k}, …`, a: `0, ${k}, ${2 * k}`, lines: [`0 × (−${k}) = 0`, `−1 × (−${k}) = ${k}`, `−2 × (−${k}) = ${2 * k}`] }; } },
        { text: 'Evaluate. Negative times negative is positive.', mode: 'quick', max: 6, gen: () => { const a = ri(2, 12), b = ri(2, 12); return { q: `−${a} × (−${b})`, a: N(a * b) }; } },
      ] },
    { title: 'Multiplying three integers',
      how: { text: '<p>Multiply two numbers at a time, from left to right.</p><p>−2 × 3 × (−4)<br>= −6 × (−4)<br>= 24</p><p>Check: an <b>even</b> number of negatives gives a positive answer; an <b>odd</b> number gives a negative answer.</p>' },
      rounds: [
        { text: 'Evaluate. Multiply two numbers at a time.', max: 4, gen: () => { const a = nz(-6, 6), b = nz(-6, 6), c = nz(-5, 5); return (a > 0 && b > 0 && c > 0) || [a, b, c].some((x) => Math.abs(x) < 2) ? { q: '' } : { q: `${N(a)} × ${B(b)} × ${B(c)}`, a: N(a * b * c), lines: [`= ${N(a * b)} × ${B(c)}`, `= ${N(a * b * c)}`] }; } },
        { text: 'Count the negatives. Is the answer positive or negative?', mode: 'quick', max: 4, gen: () => { const k = pick([3, 4]); const xs = Array.from({ length: k }, () => nz(-9, 9)); if (xs.some((x) => Math.abs(x) < 2)) return { q: '' }; return { q: xs.map(B).join(' × '), a: xs.reduce((p, x) => p * x, 1) > 0 ? '+' : '−' }; } },
      ] },
    { title: 'Multiplying in real life',
      how: { text: '<p>A change that repeats is a multiplication. Going down or falling is negative.</p><p>A diver goes down 3 m every minute for 5 minutes: −3 × 5 = −15. She is 15 m below where she started.</p>', fig: D.vscale({ min: -15, max: 0, tick: 3, every: 3, unit: 1.4, marks: [{ v: 0, text: 'start' }, { v: -15, text: 'after 5 min' }], w: 46 }), fh: 27 },
      rounds: [
        { text: 'Write a number sentence, then answer the question.', kinds: 3, max: 4, gen: (i) => {
          const k = i % 3, d = ri(2, 6), t = ri(3, 9), s = ri(2, 8), w = ri(3, 12);
          return [
            { q: `A diver goes down ${d} m every minute. How deep is she after ${t} minutes?`, a: `${N(-d * t)} m`, lines: [`−${d} × ${t}`, `= ${N(-d * t)} m`] },
            { q: `The temperature drops ${d}°C each hour for ${t} hours. What is the total change?`, a: `${N(-d * t)}°C`, lines: [`−${d} × ${t}`, `= ${N(-d * t)}°C`] },
            { q: `A share price falls $${s} a week for ${w} weeks. What is the total change?`, a: money(-s * w), lines: [`−${s} × ${w}`, `= ${money(-s * w)}`] },
          ][k];
        } },
      ] },
    { title: 'Missing numbers and squares',
      how: { text: '<p>Find a missing number by dividing: −4 × ☐ = 28, so ☐ = 28 ÷ (−4) = −7.</p><p>Squaring: (−5)<sup>2</sup> = −5 × (−5) = 25. The square of any integer is never negative.</p>' },
      rounds: [
        { text: 'Answer each question. Show your working.', kinds: 3, max: 4, gen: (i) => {
          const k = i % 3, a = nz(-9, -2), b = nz(-9, 9), s = ri(2, 12);
          if (k === 0) return Math.abs(b) < 2 ? { q: '' } : { q: `Find the missing number: ${N(a)} × ☐ = ${N(a * b)}`, a: N(b), lines: [`☐ = ${N(a * b)} ÷ ${B(a)}`, `☐ = ${N(b)}`] };
          if (k === 1) return { q: `Evaluate (−${s})<sup>2</sup>.`, a: String(s * s), lines: [`= −${s} × (−${s})`, `= ${s * s}`] };
          const p = ri(2, 6), q = ri(p + 1, 9);
          return { q: `Find two integers with a product of −${p * q} and a sum of ${q - p}.`, a: `${q} and −${p}`, lines: [`${q} × (−${p}) = −${p * q}`, `${q} + (−${p}) = ${q - p}`, `${q} and −${p}`] };
        } },
      ] },
  ],

  '1.07': ({ ri, nz, N, B }) => [
    { title: 'Division undoes multiplication',
      how: { text: '<p>Every multiplication fact gives two division facts.</p><p>3 × (−4) = −12, so<br>−12 ÷ 3 = −4 and −12 ÷ (−4) = 3.</p><p>−12 shared into 3 equal groups is −4 in each group.</p>', fig: D.groups({ n: 3, each: -4 }), fh: 9 },
      rounds: [
        { text: 'Write two division facts from the multiplication fact.', max: 3, gen: () => { const a = ri(2, 9), b = -ri(2, 9); return { q: `${a} × (${N(b)}) = ${N(a * b)}`, a: `${N(a * b)} ÷ ${a} = ${N(b)}; ${N(a * b)} ÷ (${N(b)}) = ${a}`, lines: [`${N(a * b)} ÷ ${a} = ${N(b)}`, `${N(a * b)} ÷ (${N(b)}) = ${a}`] }; } },
        { text: 'Evaluate. Share the negative number into equal groups.', mode: 'quick', max: 6, gen: () => { const a = ri(2, 10), b = ri(2, 10); return { q: `−${a * b} ÷ ${b}`, a: N(-a) }; } },
      ] },
    { title: 'The sign rules for dividing',
      how: { text: '<p>The rules are the same as for multiplying.</p><p><b>Same</b> signs: positive. <b>Different</b> signs: negative.</p><p>−20 ÷ (−4) = 5<br>20 ÷ (−4) = −5</p>', fig: signTable('÷'), fh: 14 },
      rounds: [
        { text: 'Evaluate each quotient. Decide the sign first.', mode: 'quick', max: 8, gen: () => { const a = nz(-10, 10), b = nz(-10, 10); return (a > 0 && b > 0) || Math.abs(a) < 2 || Math.abs(b) < 2 ? { q: '' } : { q: `${N(a * b)} ÷ ${B(b)}`, a: N(a) }; } },
        { text: 'Divide, then check your answer by multiplying.', max: 3, gen: () => { const a = nz(-9, 9), b = nz(-9, 9); if ((a > 0 && b > 0) || Math.abs(a) < 2 || Math.abs(b) < 2) return { q: '' };
          return { q: `${N(a * b)} ÷ ${B(b)}`, a: N(a), lines: [`= ${N(a)}`, `check: ${N(a)} × ${B(b)} = ${N(a * b)}`] }; } },
      ] },
    { title: 'Missing numbers',
      how: { text: '<p>Use the opposite operation.</p><p>☐ ÷ (−3) = 5<br>☐ = 5 × (−3) = −15</p><p>−24 ÷ ☐ = 6<br>☐ = −24 ÷ 6 = −4</p>' },
      rounds: [
        { text: 'Find the missing number. Use the opposite operation.', kinds: 2, max: 8, gen: (i) => { const a = nz(-9, 9), b = nz(-9, 9); if (Math.abs(a) < 2 || Math.abs(b) < 2) return { q: '' };
          return i % 2 === 0 ? { q: `☐ ÷ ${B(a)} = ${N(b)}`, a: N(a * b), lines: [`☐ = ${N(b)} × ${B(a)}`, `☐ = ${N(a * b)}`] } : { q: `${N(a * b)} ÷ ☐ = ${N(a)}`, a: N(b), lines: [`☐ = ${N(a * b)} ÷ ${B(a)}`, `☐ = ${N(b)}`] }; } },
      ] },
    { title: 'Dividing step by step',
      how: { text: '<p>Divide from left to right, one step at a time.</p><p>−60 ÷ 5 ÷ (−3)<br>= −12 ÷ (−3)<br>= 4</p><p>A fraction line also means divide: ' + F('−18', 6) + ' = −18 ÷ 6 = −3.</p>' },
      rounds: [
        { text: 'Evaluate. Divide from left to right.', max: 3, gen: () => { const a = nz(-5, 5), b = nz(-4, 4), c = nz(-5, 5); if ([a, b, c].some((x) => Math.abs(x) < 2) || (a > 0 && b > 0 && c > 0)) return { q: '' }; return { q: `${N(a * b * c)} ÷ ${B(a)} ÷ ${B(b)}`, a: N(c), lines: [`= ${N(b * c)} ÷ ${B(b)}`, `= ${N(c)}`] }; } },
        { text: 'Write each fraction as a division, then evaluate.', max: 4, gen: () => { const a = nz(-9, 9), b = nz(-9, 9); return (a > 0 && b > 0) || Math.abs(a) < 2 || Math.abs(b) < 2 ? { q: '' } : { q: F(N(a * b), N(b)), a: N(a), lines: [`= ${N(a * b)} ÷ ${B(b)}`, `= ${N(a)}`] }; } },
      ] },
    { title: 'Sharing and averages',
      how: { text: '<p>Sharing a debt, or a fall, equally is dividing a negative number.</p><p>A fall of 12°C over 4 hours: −12 ÷ 4 = −3, a fall of 3°C each hour.</p><p>The <b>average</b> (mean) = total ÷ how many.</p>' },
      rounds: [
        { text: 'Write a number sentence, then answer the question.', kinds: 3, max: 3, min: 3, gen: (i) => {
          const k = i % 3, p = ri(2, 6), e = ri(5, 30), h = ri(2, 6), f = ri(2, 6);
          if (k === 0) return { q: `A debt of $${p * e} is shared equally by ${p} people. Write each share as an integer.`, a: `−$${e}`, lines: [`−${p * e} ÷ ${p}`, `= −${e}`, `each owes $${e}: −$${e}`] };
          if (k === 1) return { q: `The temperature fell ${h * f}°C over ${h} hours. What was the change each hour?`, a: `${N(-f)}°C`, lines: [`−${h * f} ÷ ${h}`, `= ${N(-f)}`, `${N(-f)}°C each hour`] };
          const m = nz(-4, 3), xs = [m - ri(1, 5), m + ri(1, 5)]; xs.push(4 * m - xs[0] - xs[1] - (m + 2), m + 2); const tot = xs.reduce((s, x) => s + x, 0);
          return { q: `Find the average of these temperatures: ${xs.map((x) => `${N(x)}°C`).join(', ')}.`, a: `${N(m)}°C`, lines: [`total: ${N(tot)}`, `${N(tot)} ÷ 4 = ${N(m)}`, `average: ${N(m)}°C`] };
        } },
      ] },
    { title: 'Mixed × and ÷',
      how: { text: '<p>× and ÷ have the same rank: work from <b>left to right</b>.</p><p>−8 × 3 ÷ (−6)<br>= −24 ÷ (−6)<br>= 4</p><p>36 ÷ (−4) × 2<br>= −9 × 2<br>= −18</p>' },
      rounds: [
        { text: 'Evaluate. Work from left to right.', kinds: 2, max: 6, gen: (i) => { const a = nz(-9, 9), b = nz(-6, 6), c = nz(-6, 6); if ([a, b, c].some((x) => Math.abs(x) < 2)) return { q: '' };
          if (i % 2 === 0) { const p = a * b; if (p % c) return { q: '' }; return { q: `${N(a)} × ${B(b)} ÷ ${B(c)}`, a: N(p / c), lines: [`= ${N(p)} ÷ ${B(c)}`, `= ${N(p / c)}`] }; }
          return { q: `${N(a * b)} ÷ ${B(b)} × ${B(c)}`, a: N(a * c), lines: [`= ${N(a)} × ${B(c)}`, `= ${N(a * c)}`] }; } },
      ] },
  ],

  '1.08': ({ ri, nz, pick, N, B }) => [
    { title: 'The order of operations',
      how: { text: '<p>1. <b>Brackets</b> first.</p><p>2. <b>×</b> and <b>÷</b>, from left to right.</p><p>3. <b>+</b> and <b>−</b>, from left to right.</p><p>Underline the part you work out first.</p><p>−3 + <u>4 × (−2)</u> = −3 + (−8) = −11</p>' },
      rounds: [
        { text: 'Which operation do you do first? Write it on the line.', mode: 'quick', max: 4, gen: () => { const a = nz(-9, 9), b = nz(-9, 9), c = nz(-9, 9); if ([a, b, c].some((x) => Math.abs(x) < 2)) return { q: '' }; const t = pick([[`${N(a)} + ${B(b)} × ${B(c)}`, '×'], [`${N(a)} − ${B(b)} ÷ ${B(c)}`, '÷'], [`(${N(a)} + ${B(b)}) × ${B(c)}`, '+ in brackets'], [`${N(a)} × ${B(b)} − ${B(c)}`, '×']]); return { q: t[0], a: t[1] }; } },
        { text: 'Underline the first step, then evaluate.', max: 6, gen: () => { const a = nz(-12, 12), b = nz(-6, 6), c = nz(-6, 6), op = pick(['+', '−']); if ([b, c].some((x) => Math.abs(x) < 2) || (a > 0 && b > 0 && c > 0)) return { q: '' }; const q = `${N(a)} ${op} ${B(b)} × ${B(c)}`; return { q, a: ev(q), lines: [`= ${N(a)} ${op} ${B(b * c)}`, `= ${ev(q)}`] }; } },
      ] },
    { title: 'Brackets first',
      how: { text: '<p>Work out the brackets first, then the rest.</p><p>(−3 + 7) × 2 = 4 × 2 = 8</p><p>Without brackets the answer changes:<br>−3 + 7 × 2 = −3 + 14 = 11</p>' },
      rounds: [
        { text: 'Evaluate. Brackets first.', max: 7, gen: () => { const a = nz(-9, 9), b = nz(-9, 9), c = nz(-5, 5), op = pick(['+', '−']); if (Math.abs(c) < 2 || (a > 0 && b > 0 && c > 0) || (op === '+' ? a + b : a - b) === 0) return { q: '' }; const q = `(${N(a)} ${op} ${B(b)}) × ${B(c)}`, s = op === '+' ? a + b : a - b; return { q, a: ev(q), lines: [`= ${B(s)} × ${B(c)}`, `= ${ev(q)}`] }; } },
      ] },
    { title: '× and ÷ before + and −',
      how: { text: '<p>Find every × and ÷ and do them first. Then do + and − from left to right.</p><p>−10 ÷ 2 + 3 × (−4)<br>= −5 + (−12)<br>= −17</p>' },
      rounds: [
        { text: 'Evaluate. Do both × and ÷ in the first line.', max: 6, gen: () => { const a = nz(-6, 6), b = nz(-6, 6), d = nz(-5, 5), c = nz(-5, 5) * d, op = pick(['+', '−']); if ([a, b, d, c / d].some((x) => Math.abs(x) < 2)) return { q: '' };
          const q = `${N(a)} × ${B(b)} ${op} ${B(c)} ÷ ${B(d)}`; return { q, a: ev(q), lines: [`= ${N(a * b)} ${op} ${B(c / d)}`, `= ${ev(q)}`] }; } },
      ] },
    { title: 'Left to right',
      how: { text: '<p>When the operations have the same rank, work from <b>left to right</b>.</p><p>−12 ÷ 3 × 2 = −4 × 2 = −8<br>(not −12 ÷ 6)</p><p>5 − 8 + 4 = −3 + 4 = 1<br>(not 5 − 12)</p>' },
      rounds: [
        { text: 'Evaluate. Work from left to right.', kinds: 2, max: 6, gen: (i) => {
          if (i % 2 === 0) { const b = nz(-5, 5), c = nz(-5, 5), a = b * nz(-6, 6); if ([b, c, a / b].some((x) => Math.abs(x) < 2)) return { q: '' }; const q = `${N(a)} ÷ ${B(b)} × ${B(c)}`; return { q, a: ev(q), lines: [`= ${N(a / b)} × ${B(c)}`, `= ${ev(q)}`] }; }
          const a = -ri(2, 12), b = ri(2, 12), c = ri(2, 12); const q = `${N(a)} − ${b} + ${c}`; return { q, a: ev(q), lines: [`= ${N(a - b)} + ${c}`, `= ${ev(q)}`] };
        } },
      ] },
    { title: 'Putting it all together',
      how: { text: '<p>One step a line. Copy down everything you have not worked out yet.</p><p>−2 − (3 + (−5)) × 4<br>= −2 − (−2) × 4<br>= −2 − (−8)<br>= 6</p>' },
      rounds: [
        { text: 'Evaluate. Brackets, then × and ÷, then + and −.', max: 4, gen: () => { const a = nz(-8, 8), b = nz(-8, 8), c = nz(-4, 4), d = nz(-9, 9); if (Math.abs(c) < 2 || Math.abs(a + b) < 2) return { q: '' };
          const q = `${N(d)} − (${N(a)} + ${B(b)}) × ${B(c)}`, s = a + b; return { q, a: ev(q), lines: [`= ${N(d)} − ${B(s)} × ${B(c)}`, `= ${N(d)} − ${B(s * c)}`, `= ${ev(q)}`] }; } },
      ] },
    { title: 'Is it true?',
      how: { text: '<p>Work out each side carefully, then compare.</p><p>Brackets change the answer:<br>(−4 + 6) × 3 = 2 × 3 = 6<br>−4 + 6 × 3 = −4 + 18 = 14</p>' },
      rounds: [
        { text: 'Answer each question. Show your working.', kinds: 2, max: 4, min: 3, gen: (i) => {
          const a = -ri(2, 9), b = ri(3, 9), c = ri(2, 5);
          if (i % 2 === 0) return { q: `Put brackets in to make it true: ${N(a)} + ${b} × ${c} = ${N((a + b) * c)}`, a: `(${N(a)} + ${b}) × ${c}`, lines: [`(${N(a)} + ${b}) × ${c}`, `= ${a + b} × ${c}`, `= ${N((a + b) * c)}`] };
          const wrong = (a + b) * c, right = a + b * c;
          return wrong === right ? { q: '' } : { q: `Mia says ${N(a)} + ${b} × ${c} = ${N(wrong)}. Is she right? Explain.`, a: `No, it is ${N(right)}`, lines: [`${b} × ${c} = ${b * c} first`, `${N(a)} + ${b * c} = ${N(right)}`, `No: the answer is ${N(right)}`] };
        } },
      ] },
  ],

  '1.09': ({ ri, nz, pick, N, B }) => {
    return [
      { title: 'The (−) key',
        how: { text: '<p>Use the <b>(−)</b> key to enter a negative number. Use the <b>−</b> key to subtract.</p><p>To work out −35 + 12, press:</p>', fig: D.keys(['(−)', '3', '5', '+', '1', '2', '=']), fh: 9 },
        rounds: [
          { text: 'Write the keys you press, then the answer.', max: 3, gen: () => { const a = -ri(11, 99), b = ri(11, 99), op = pick(['+', '−']); const q = `${N(a)} ${op} ${b}`;
            return { q, a: ev(q), lines: [`(−) ${-a} ${op} ${b} =`, `= ${ev(q)}`] }; } },
          { text: 'Use your calculator.', mode: 'quick', max: 6, gen: () => { const a = nz(-400, 400), b = nz(-400, 400); if (a > 0 && b > 0) return { q: '' }; return { q: `${N(a)} + ${B(b)}`, a: N(a + b) }; } },
        ] },
      { title: 'Multiplying and dividing',
        how: { text: '<p>Enter each negative number with the (−) key. Some calculators need brackets around a negative number that comes after × or ÷.</p><p>−24 × (−15) = 360:</p>', fig: D.keys(['(−)', '2', '4', '×', '(', '(−)', '1', '5', ')', '=']), fh: 9 },
        rounds: [
          { text: 'Use your calculator.', mode: 'quick', max: 6, gen: (i) => { const a = nz(-45, 45), b = nz(-45, 45); if ((a > 0 && b > 0) || Math.abs(a) < 3 || Math.abs(b) < 11) return { q: '' }; return i % 2 ? { q: `${N(a * b)} ÷ ${B(b)}`, a: N(a) } : { q: `${N(a)} × ${B(b)}`, a: N(a * b) }; } },
          { text: 'Write the keys you press, with brackets around the second number. Then write the answer.', max: 3, gen: () => { const a = -ri(12, 60), b = -ri(11, 40), op = pick(['×', '÷']); const x = op === '×' ? a : a * b;
            const keysOf = (v) => (v < 0 ? `(−) ${-v}` : String(v));
            return { q: `${N(x)} ${op} (${N(b)})`, a: N(op === '×' ? a * b : a), lines: [`${keysOf(x)} ${op} ( ${keysOf(b)} ) =`, `= ${N(op === '×' ? a * b : a)}`] }; } },
        ] },
      { title: 'Check the sign first',
        how: { text: '<p>Before you press =, use the sign rules to decide if the answer is positive or negative. If the calculator disagrees, check how you entered the numbers.</p><p>−48 × 25: different signs, so negative. The answer is −1200.</p>' },
        rounds: [
          { text: 'Write the sign of the answer first, then use your calculator.', max: 6, gen: () => { const a = nz(-60, 60), b = nz(-60, 60); if (Math.abs(a) < 11 || Math.abs(b) < 11 || (a > 0 && b > 0)) return { q: '' };
            return { q: `${N(a)} × ${B(b)}`, a: N(a * b), lines: [`sign: ${a * b > 0 ? '+ (same signs)' : '− (different signs)'}`, `= ${N(a * b)}`] }; } },
        ] },
      { title: 'Brackets on the calculator',
        how: { text: '<p>Enter brackets with the <b>(</b> and <b>)</b> keys. The calculator follows the order of operations.</p><p>(−35 − 47) × 12 = −984:</p>', fig: D.keys(['(', '(−)', '3', '5', '−', '4', '7', ')', '×', '1', '2', '=']), fh: 9 },
        rounds: [
          { text: 'Use your calculator. Write the value of the brackets first.', max: 6, gen: () => { const a = nz(-90, 90), b = nz(-90, 90), c = nz(-25, 25); if ((a > 0 && b > 0 && c > 0) || Math.abs(c) < 2 || a === b) return { q: '' }; return { q: `(${N(a)} − ${B(b)}) × ${B(c)}`, a: N((a - b) * c), lines: [`bracket: ${N(a - b)}`, `${N(a - b)} × ${B(c)} = ${N((a - b) * c)}`] }; } },
        ] },
      { title: 'Estimate, then calculate',
        how: { text: '<p>Round each number to the nearest 10 and work it out in your head. Then use your calculator. The two answers should be close.</p><p>−48 × 21 ≈ −50 × 20 = −1000<br>Calculator: −1008. Close, so it makes sense.</p>' },
        rounds: [
          { text: 'Estimate first, then use your calculator.', max: 6, gen: () => { const a = -ri(21, 89), b = ri(11, 49); if (a % 10 === 0 || b % 10 === 0) return { q: '' }; const ea = Math.round(a / 10) * 10, eb = Math.round(b / 10) * 10;
            return { q: `${N(a)} × ${b}`, a: `≈ ${N(ea * eb)}; ${N(a * b)}`, lines: [`estimate: ${N(ea)} × ${eb} = ${N(ea * eb)}`, `calculator: ${N(a * b)}`] }; } },
        ] },
      { title: 'Calculator problems',
        how: { text: '<p>Write a number sentence first, then use your calculator.</p><p>Finish with a sentence that says what the answer means: a depth, a balance or a temperature.</p>' },
        rounds: [
          { text: 'Write a number sentence, use your calculator, then answer in words.', kinds: 3, max: 3, min: 3, gen: (i) => {
            const k = i % 3, bal = ri(150, 600), fee = ri(35, 95), mo = ri(6, 12), d = -ri(120, 480), r = ri(12, 35), t = ri(5, 12);
            if (k === 0) return { q: `An account has $${bal}. A fee of $${fee} is taken out every month for ${mo} months. What is the balance now?`, a: money(bal - fee * mo), lines: [`${bal} − ${fee} × ${mo}`, `= ${N(bal - fee * mo)}`, `the balance is ${money(bal - fee * mo)}`] };
            if (k === 1) return { q: `A submarine at ${N(d)} m rises ${r} m a minute for ${t} minutes. How deep is it now?`, a: `${N(d + r * t)} m`, lines: [`${N(d)} + ${r} × ${t}`, `= ${N(d + r * t)}`, `it is at ${N(d + r * t)} m`] };
            const xs = Array.from({ length: 5 }, () => ri(-25, 5)); const tot = xs.reduce((s, x) => s + x, 0); if (tot % 5) return { q: '' };
            return { q: `The lowest temperatures in Moscow for five days were ${xs.map((x) => `${N(x)}°C`).join(', ')}. Find the average.`, a: `${N(tot / 5)}°C`, lines: [`total: ${N(tot)}`, `${N(tot)} ÷ 5 = ${N(tot / 5)}`, `average: ${N(tot / 5)}°C`] };
          } },
        ] },
    ];
  },

  '1.10': ({ ri, pick, shuffle, N }) => {
    const places = [['cliff top', ri(6, 9) * 5], ['gull', ri(2, 4) * 5], ['boat', 0], ['diver', -ri(2, 4) * 5], ['wreck', -ri(6, 8) * 5]];
    const start = ri(50, 150), tx = shuffle([['wages', ri(150, 300)], ['rent', -ri(200, 350)], ['phone bill', -ri(40, 90)], ['gift', ri(20, 60)], ['groceries', -ri(60, 140)]]);
    const bals = []; tx.reduce((b, [, v]) => { bals.push(b + v); return b + v; }, start);
    return [
      { title: 'Temperature',
        how: { text: '<p>A rise is +, a fall is −. Start at the first temperature and count up or down the thermometer.</p><p>−5°C, then a rise of 8°C:<br>−5 + 8 = 3°C</p>', fig: D.thermometer({ min: -10, max: 10, value: 3, unit: 1.2, arrows: [{ v: 3, text: 'after' }, { v: -5, text: 'before' }], w: 36 }), fh: 30 },
        rounds: [
          { text: 'Find the new temperature. Write a number sentence in your head.', mode: 'quick', max: 6, gen: () => { const t = ri(-12, 15), c = ri(3, 18), up = pick([true, false]); if (t >= 0 && (up || t - c >= 0)) return { q: '' }; return { q: `${N(t)}°C, ${up ? 'rises' : 'falls'} ${c}°C`, a: `${N(up ? t + c : t - c)}°C` }; } },
          { text: 'How many degrees did it rise? Count from the first to the second.', mode: 'quick', max: 4, gen: () => { const a = -ri(2, 12), b = ri(-1, 12); if (b <= a) return { q: ''}; return { q: `from ${N(a)}°C to ${N(b)}°C`, a: `${b - a}°C` }; } },
        ] },
      { title: 'Above and below sea level',
        how: { text: '<p>Heights above sea level are positive, depths below are negative.</p><p>Distance between two heights = higher − lower. When one is below sea level, add the two distances from sea level.</p>' },
        rounds: [
          { text: 'Use the diagram. How far apart are the two things? Write a number sentence.', fig: D.vscale({ min: -40, max: 45, tick: 5, every: 10, unit: 0.6, marks: places.map(([t, v]) => ({ v, text: t })), w: 46 }), fh: 54, we: 1, max: 5, gen: (i) => {
            const pairs = [[0, 3], [1, 4], [0, 2], [3, 4], [1, 3], [0, 4]]; if (i >= pairs.length) return null;
            const [[p, a], [q, b]] = pairs[i].map((j) => places[j]);
            return { q: `the ${p} and the ${q}`, a: `${a - b} m`, lines: [`${a} − ${b < 0 ? `(${N(b)})` : b}`, `= ${a - b} m`] };
          } },
        ] },
      { title: 'Lifts and floors',
        how: { text: '<p>The ground floor is level 0. Basement levels are negative.</p><p>A lift at level −2 goes up 5 floors: −2 + 5 = level 3.</p>', fig: D.vscale({ min: -3, max: 5, unit: 2.6, every: 2, kind: 'ground', marks: [{ v: -2, text: 'start' }, { v: 3, text: 'finish' }], w: 40 }), fh: 26 },
        rounds: [
          { text: 'Write a number sentence, then answer the question.', kinds: 2, max: 4, gen: (i) => {
            const l = ri(-4, 6), m = ri(2, 8);
            if (i % 2 === 0) { const up = pick([true, false]), e = up ? l + m : l - m; if (e < -5 || e > 12 || (l >= 0 && e >= 0)) return { q: '' }; return { q: `A lift is at level ${N(l)}. It goes ${up ? 'up' : 'down'} ${m} floors. Which level is it on now?`, a: `level ${N(e)}`, lines: [`${N(l)} ${up ? '+' : '−'} ${m}`, `= level ${N(e)}`] }; }
            const b = -ri(1, 4), t = ri(3, 12); return { q: `How many floors does a lift travel from level ${N(b)} to level ${t}?`, a: `${t - b} floors`, lines: [`${t} − (${N(b)})`, `= ${t} + ${-b}`, `= ${t - b} floors`] };
          } },
        ] },
      { title: 'Money: credit and debt',
        how: { text: '<p>Money in (a deposit) is positive. Money out (a payment) is negative.</p><p>A balance below zero means the account is <b>overdrawn</b>: you owe the bank.</p><p>$20, then pay $35: 20 − 35 = −15, so the balance is −$15.</p>' },
        rounds: [
          { text: `Ari's account starts with $${start}. Find the balance after each transaction.`, fig: table(['', 'Transaction', 'Amount'], tx.map(([t, v], j) => [j + 1, t, v < 0 ? `−$${-v}` : `+$${v}`])), fh: 27, we: 1, max: 4, gen: (i) => {
            if (i >= 5) return null; const before = i ? bals[i - 1] : start, v = tx[i][1];
            return { q: `Balance after transaction ${i + 1}`, a: money(bals[i]), lines: [`${N(before)} ${v < 0 ? '−' : '+'} ${Math.abs(v)}`, `= ${money(bals[i])}`] };
          } },
        ] },
      { title: 'Problems with several steps',
        how: { text: '<p>Break the problem into steps. Write a number sentence for each step.</p><p>Use × for a change that repeats.</p><p>A diver at −40 m rises 3 m a minute for 5 minutes:<br>3 × 5 = 15<br>−40 + 15 = −25 m</p>' },
        rounds: [
          { text: 'Write a number sentence for each step, then answer the question.', kinds: 3, max: 3, min: 3, gen: (i) => {
            const k = i % 3, s = -ri(4, 20) * 5, r = ri(2, 6), h = ri(2, 5), w = ri(3, 8), l = ri(2, 6), p = ri(2, 5), q = ri(1, 3);
            return [
              { q: `A diver is at ${N(s)} m. She rises ${r} m a minute for ${h} minutes. Where is she now?`, a: `${N(s + r * h)} m`, lines: [`${r} × ${h} = ${r * h}`, `${N(s)} + ${r * h}`, `= ${N(s + r * h)} m`] },
              { q: `It is ${N(-r)}°C at 6 a.m. It warms ${h}°C an hour for ${w} hours. What is the temperature now?`, a: `${N(-r + h * w)}°C`, lines: [`${h} × ${w} = ${h * w}`, `${N(-r)} + ${h * w}`, `= ${N(-r + h * w)}°C`] },
              { q: `A team scores +${p} for a win and −${q} for a loss. It wins ${w} games and loses ${l}. What is its score?`, a: N(p * w - q * l), lines: [`${w} × ${p} = ${w * p}`, `${l} × (−${q}) = ${N(-l * q)}`, `${w * p} + (${N(-l * q)}) = ${N(p * w - q * l)}`] },
            ][k];
          } },
        ] },
      { title: 'Quiz scores',
        how: { text: '<p>In a quiz, a correct answer scores +3, a wrong answer scores −1 and no answer scores 0.</p><p>5 correct and 4 wrong:<br>5 × 3 + 4 × (−1) = 15 + (−4) = 11</p>', fig: table(['Answer', 'Points'], [['correct', '+3'], ['wrong', '−1'], ['no answer', '0']]), fh: 16 },
        rounds: [
          { text: 'Use the quiz scoring to answer each question.', kinds: 2, max: 4, min: 3, gen: (i) => {
            if (i % 2 === 0) { const c = ri(0, 6), w = ri(3, 10); return { q: `Kai gets ${c} correct and ${w} wrong. What is Kai's score?`, a: N(3 * c - w), lines: [`${c} × 3 = ${3 * c}`, `${w} × (−1) = ${N(-w)}`, `${3 * c} + (${N(-w)}) = ${N(3 * c - w)}`] }; }
            const n = pick([10, 12]), c = ri(2, n - 2), sc = 3 * c - (n - c);
            return { q: `Lea answers all ${n} questions and scores ${N(sc)}. How many did she get correct?`, a: `${c} correct`, lines: [`try ${c}: ${c} × 3 = ${3 * c}`, `${n - c} wrong: ${3 * c} − ${n - c} = ${N(sc)}`, `${c} correct`] };
          } },
        ] },
    ];
  },
};
