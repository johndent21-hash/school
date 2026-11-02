// Year 7 · Chapter 11 · Complementary events: a two-page (one double-sided sheet) independent worksheet.
// Mandelbrot theme, booklet blue (#3f63be). Worked examples: pale grey, dashed border. Questions: pale blue.
// Usage (from the booklets folder): node year7-single/ch11-complementary-events/build.js [--shots <dir>]
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DIR = __dirname;
const NAME = 'Yr7_Ch11_Complementary_Events_Worksheet';
const ASSETS = path.relative(DIR, path.join(DIR, '../../assets')).split(path.sep).join('/');

// ---------- fractions: every answer is calculated, then compared with the answer written on the sheet ----------
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const fr = (n, d) => { const g = gcd(n, d); return [n / g, d / g]; };
const sub1 = ([n, d]) => [d - n, d];                       // 1 − n/d, not simplified (matches the working on the sheet)
const add = ([a, b], [c, d]) => [a * d + c * b, b * d];
const eq = ([a, b], [c, d]) => a * d === b * c;
const checks = [];
const check = (label, ok) => checks.push([label, ok]);

// ---------- small HTML helpers ----------
const F = (n, d) => `<span class="fr"><span>${n}</span><span>${d}</span></span>`;
const B = (w = 9, ans = '') => `<span class="blank" style="min-width:${w}mm">${ans}</span>`;   // fill-in blank
const BF = () => `<span class="fr blankfr"><span>${B(6)}</span><span>${B(6)}</span></span>`; // blank fraction
const ansLine = (label = 'Answer') => `<div class="ans-line"><b>${label}:</b><i></i></div>`;
const side = (text, mm = 15) => `<div class="side"><div>${text}</div><div class="wbox" style="height:${mm}mm"><span class="wl">Working</span><div class="ans-line"><b>Answer:</b><i></i></div></div></div>`;
const work = (mm) => `<div class="work" style="height:${mm}mm"></div>`;

// Spinner with equal sectors. parts: array of {t: label, c: fill}
const spinner = (parts, size = 22) => {
  const n = parts.length, r = 10, cx = 11, cy = 11;
  let s = '';
  parts.forEach((p, i) => {
    const a0 = (i / n) * 2 * Math.PI - Math.PI / 2, a1 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0), x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const large = a1 - a0 > Math.PI ? 1 : 0;
    s += `<path d="M${cx},${cy} L${x0.toFixed(3)},${y0.toFixed(3)} A${r},${r} 0 ${large} 1 ${x1.toFixed(3)},${y1.toFixed(3)} Z" fill="${p.c}" stroke="#3d3b3c" stroke-width="0.35"/>`;
    const am = (a0 + a1) / 2, lr = n > 8 ? 7.2 : 6.2;
    s += `<text x="${(cx + lr * Math.cos(am)).toFixed(2)}" y="${(cy + lr * Math.sin(am)).toFixed(2)}" font-size="${n > 8 ? 2.6 : 3}" text-anchor="middle" dominant-baseline="central" font-weight="700" fill="#26292e">${p.t}</text>`;
  });
  s += `<line x1="${cx}" y1="${cy}" x2="${cx + 4}" y2="${cy - 5}" stroke="#26292e" stroke-width="0.7" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="0.9" fill="#26292e"/>`;
  return `<svg class="spin" viewBox="0 0 22 22" style="width:${size}mm;height:${size}mm">${s}</svg>`;
};
const C = { R: '#f4b6b0', B: '#a9c0ee', G: '#b5dfb9', Y: '#f7e19a', W: '#ffffff' };

// One whole split into the event and its complement (the picture in the formula box)
const wholeBar = () => {
  const cells = [1, 2, 3, 4, 5, 6].map((k, i) =>
    `<rect x="${i * 14}" y="6" width="14" height="10" fill="${k === 6 ? '#3f63be' : '#e6ecf8'}" stroke="#3d3b3c" stroke-width="0.4"/>` +
    `<text x="${i * 14 + 7}" y="11.3" font-size="4.2" text-anchor="middle" dominant-baseline="central" font-weight="700" fill="${k === 6 ? '#fff' : '#26292e'}">${k}</text>`).join('');
  return `<svg class="bar" viewBox="-1 0 86 26">
    <text x="42" y="3.6" font-size="3.4" text-anchor="middle" fill="#3d3b3c" font-weight="700">All the outcomes = 1 whole</text>
    ${cells}
    <path d="M0,18 v1.6 h69.6 v-1.6" fill="none" stroke="#3d3b3c" stroke-width="0.4"/><path d="M70.4,18 v1.6 h13.6 v-1.6" fill="none" stroke="#3f63be" stroke-width="0.6"/>
    <text x="35" y="23.4" font-size="3.3" text-anchor="middle" fill="#26292e">not rolling a 6:  5 out of 6</text>
    <text x="77" y="23.4" font-size="3.3" text-anchor="middle" fill="#3f63be" font-weight="700">a 6</text></svg>`;
};

// Die outcomes as boxes, some crossed out
const dieRow = (crossed = []) => `<span class="die-row">${[1, 2, 3, 4, 5, 6].map((k) => `<span class="${crossed.includes(k) ? 'x' : ''}">${k}</span>`).join('')}</span>`;

// ---------- content ----------
// Each question: { n, h: html, ans: answer-key text, cls?: extra class }
const answers = {};
const Q = (n, h, ans, cls = '') => { answers[n] = ans; return `<div class="q${cls ? ' ' + cls : ''}"><span class="qn">${n}</span><div class="qb">${h}</div></div>`; };

// Round 1: the complement in words
const r1row = (n, event, comp, outs, ans) => { answers[n] = ans; return `<tr><td class="tn"><span class="qn">${n}</span></td><td>${event}</td><td>${comp}</td><td>${outs}</td></tr>`; };
const r1rows = [
  r1row(1, `A die is rolled.<br><b>Event:</b> rolling a 5`, `not rolling a ${B(7)}`, `1, 2, 3, 4, ${B(7)}`, '5;  1, 2, 3, 4, 6'),
  r1row(2, `A die is rolled.<br><b>Event:</b> an even number (2, 4, 6)`, `rolling an ${B(14)} number`, `${B(6)}, ${B(6)}, ${B(6)}`, 'odd;  1, 3, 5'),
  r1row(3, `<div class="with-fig"><div>Spin this spinner.<br><b>Event:</b> landing on red (R)</div>${spinner([{ t: 'R', c: C.R }, { t: 'B', c: C.B }, { t: 'G', c: C.G }, { t: 'Y', c: C.Y }], 11)}</div>`, `not landing on ${B(12)}`, `${B(10)}, ${B(10)}, ${B(10)}`, 'red;  blue, green, yellow'),
  r1row(4, `Red, green and orange lollies in a bag.<br><b>Event:</b> picking green`, `not picking ${B(14)}`, `${B(12)} or ${B(12)}`, 'green;  red or orange'),
  r1row(5, `A coin is tossed.<br><b>Event:</b> getting heads`, `${B(34)}`, `${B(30)}`, 'getting tails (not heads);  tails'),
];
const r1 = [`<table class="r1"><tr><th></th><th>What happens</th><th>Complement (in words)</th><th>Outcomes in the complement</th></tr>${r1rows.join('')}</table>`];

// Round 2: P(not A) = 1 − P(A) with fractions
const r2data = [[6, [1, 4]], [7, [2, 5]], [8, [3, 8]], [9, [1, 10]], [10, [2, 7]]];
r2data.forEach(([n, p]) => { answers['_' + n] = sub1(p); });
const spin8 = [...'BWBWWBWW'].map((t) => ({ t: t === 'B' ? 'B' : '', c: C[t] }));
check('Q8 spinner drawn with 3 blue of 8', spin8.length === 8 && spin8.filter((p) => p.t === 'B').length === 3);
const r2 = [
  Q(6, `P(A) = ${F(1, 4)}. Find P(not A).<div class="calc">P(not A) = 1 − ${F(1, 4)} = ${F(4, 4)} − ${F(1, 4)} = ${BF()}</div>`, F(3, 4)),
  Q(7, `The chance of rain is ${F(2, 5)}. Find P(no rain).<div class="calc">P(no rain) = 1 − ${F(2, 5)} = ${F(B(6), 5)} − ${F(2, 5)} = ${BF()}</div>`, `${F(5, 5)} − ${F(2, 5)} = ${F(3, 5)}`),
  Q(8, `<div class="with-fig"><div>3 of the 8 equal parts are blue (B).<br>P(blue) = ${F(3, 8)}. Find P(not blue).<div class="calc">P(not blue) = 1 − ${BF()} = ${BF()}</div></div>${spinner(spin8, 17)}</div>`, `1 − ${F(3, 8)} = ${F(5, 8)}`),
  Q(9, `P(the bus is late) = ${F(1, 10)}.<br>Find P(the bus is <b>not</b> late).<div class="calc">P(not late) = 1 − ${BF()} = ${BF()}</div>`, F(9, 10)),
  Q(10, side(`<b>On your own.</b> A bag has 7 marbles. 2 are red.<br>P(red) = ${F(2, 7)}. Find P(not red).`, 13), F(5, 7), 'span2'),
];

// Round 3: check that P(A) + P(not A) = 1
const r3 = [
  Q(11, `Add: ${F(2, 7)} + ${F(5, 7)} = ${BF()} = ${B(8)}<br>Do they add to 1? &nbsp; <span class="yn">Yes</span> <span class="yn">No</span>`, `${F(7, 7)} = 1. Yes`),
  Q(12, `P(A) = ${F(4, 9)} and P(not A) = ${F(5, 9)}.<br>Add: ${BF()} + ${BF()} = ${BF()}<br>Do they add to 1? &nbsp; <span class="yn">Yes</span> <span class="yn">No</span>`, `${F(4, 9)} + ${F(5, 9)} = ${F(9, 9)} = 1. Yes`),
  Q(13, side(`Ben says P(win) = ${F(1, 6)}<br>and P(not win) = ${F(4, 6)}.<br>Do they add to 1? If not, what should P(not win) be?`), `${F(1, 6)} + ${F(4, 6)} = ${F(5, 6)}, not 1. P(not win) = ${F(5, 6)}`),
  Q(14, side(`Mia says P(goal) = ${F(3, 10)}<br>and P(no goal) = ${F(7, 10)}.<br>Is Mia right? Show how you know.`), `Yes: ${F(3, 10)} + ${F(7, 10)} = ${F(10, 10)} = 1`),
];
check('Q11 2/7 + 5/7 = 1', eq(add([2, 7], [5, 7]), [1, 1]));
check('Q12 4/9 + 5/9 = 1', eq(add([4, 9], [5, 9]), [1, 1]));
check('Q13 1/6 + 4/6 = 5/6 (not 1); correct value 5/6', eq(add([1, 6], [4, 6]), [5, 6]) && !eq(add([1, 6], [4, 6]), [1, 1]) && eq(sub1([1, 6]), [5, 6]));
check('Q14 3/10 + 7/10 = 1', eq(add([3, 10], [7, 10]), [1, 1]));

// Round 4: one decimal question and everyday problems
const r4 = [
  Q(15, `The chance Jack wins is 0.4.<br>Find the chance he does <b>not</b> win.<div class="calc">1 − 0.4 = ${B(12)}</div>`, '0.6'),
  Q(16, `9 lollies. 4 are orange. One is picked.<br>How many are <b>not</b> orange? ${B(8)}<br>P(not orange) = ${BF()}`, `5 lollies; ${F(5, 9)}`),
  Q(17, side(`A die is rolled.<br>P(1 or 2) = ${F(2, 6)}.<br>Find P(<b>not</b> 1 or 2).`, 14), `${F(4, 6)} (or ${F(2, 3)})`),
  Q(18, side(`3 of the 11 students in a team wear glasses. One is picked. Find P(<b>not</b> glasses).`, 14), F(8, 11)),
];
check('Q15 1 − 0.4 = 0.6', Math.abs(1 - 0.4 - 0.6) < 1e-9);
check('Q16 9 − 4 = 5, P = 5/9', 9 - 4 === 5 && eq(sub1([4, 9]), [5, 9]));
check('Q17 1 − 2/6 = 4/6 = 2/3', eq(sub1([2, 6]), [4, 6]) && eq([4, 6], fr(2, 3)));
check('Q18 1 − 3/11 = 8/11', eq(sub1([3, 11]), [8, 11]));

// Challenge
const spin12 = [...'RRRRRBBBBYYY'].map((t) => ({ t, c: C[t] }));
const r5 = [
  Q(19, side(`<div class="with-fig"><div>12 equal parts:<br>5 red, 4 blue, the rest yellow. Find P(<b>not</b> yellow).</div>${spinner(spin12, 15)}</div>`, 16), `3 yellow, so P(yellow) = ${F(3, 12)}; P(not yellow) = ${F(9, 12)} (or ${F(3, 4)})`),
  Q(20, side(`10 marbles, each red or blue.<br>P(<b>not</b> red) = ${F(3, 10)}.<br>How many are red?`, 16), `P(red) = ${F(7, 10)}, so 7 red marbles`),
];
check('Q19 12 − 5 − 4 = 3 yellow; 1 − 3/12 = 9/12 = 3/4', 12 - 5 - 4 === 3 && eq(sub1([3, 12]), [9, 12]) && eq([9, 12], [3, 4]));
check('Q20 1 − 3/10 = 7/10 → 7 red of 10', eq(sub1([3, 10]), [7, 10]) && 10 * 7 / 10 === 7);
// Round 2 answers
const want2 = { 6: [3, 4], 7: [3, 5], 8: [5, 8], 9: [9, 10], 10: [5, 7] };
r2data.forEach(([n]) => check(`Q${n} P(not A) = ${want2[n].join('/')}`, eq(answers['_' + n], want2[n])));
// Round 1: complements of die/spinner/coin events, by listing
const die = [1, 2, 3, 4, 5, 6];
check('Q1 complement of {5} = {1,2,3,4,6}', die.filter((k) => k !== 5).join() === '1,2,3,4,6');
check('Q2 complement of {2,4,6} = {1,3,5}', die.filter((k) => k % 2).join() === '1,3,5');
check('Q3 complement of R in {R,B,G,Y} = {B,G,Y}', ['R', 'B', 'G', 'Y'].filter((k) => k !== 'R').join() === 'B,G,Y');

check('Q19 spinner drawn with 5 R, 4 B, 3 Y', spin12.filter((p) => p.t === 'R').length === 5 && spin12.filter((p) => p.t === 'B').length === 4 && spin12.filter((p) => p.t === 'Y').length === 3);
// Worked examples
check('Example 2: 1 − 1/6 = 5/6', eq(sub1([1, 6]), [5, 6]));
check('Example 3a: 3/8 + 5/8 = 1', eq(add([3, 8], [5, 8]), [1, 1]));
check('Example 3b: 1/3 + 1/3 = 2/3, not 1; correct 2/3', eq(add([1, 3], [1, 3]), [2, 3]) && eq(sub1([1, 3]), [2, 3]));
check('Example 4a: 1 − 0.3 = 0.7', Math.abs(1 - 0.3 - 0.7) < 1e-9);
check('Example 4b: 12 − 5 = 7, 1 − 5/12 = 7/12', 12 - 5 === 7 && eq(sub1([5, 12]), [7, 12]));
check('Formula bar: 5 of 6 not a 6', die.filter((k) => k !== 6).length === 5);

const qCount = [r1, r2, r3, r4, r5].reduce((s, r) => s + r.length, 0);
check('20 questions', Object.keys(answers).filter((k) => !k.startsWith('_')).length === 20);

// ---------- worked examples ----------
const example = (n, round, title, body) => `
<div class="ex">
  <div class="ex-head"><span class="ex-tag">Example ${n}</span><span class="ex-title">${title}</span><span class="ex-use">Use me for <b>Round ${round}</b> ↓</span></div>
  <div class="ex-body">${body}</div>
</div>`;

const ex1 = example(1, 1, 'Name the complement and list its outcomes', `
  <div class="ex-q">A die is rolled. <b>Event:</b> rolling a 2. What is the complement? List its outcomes.</div>
  <div class="steps">
    <div><span class="st">1</span>List <b>all</b> the outcomes. Cross out the event (rolling a 2): ${dieRow([2])}</div>
    <div><span class="st">2</span>What is left is the complement. <span class="hl">Complement: not rolling a 2. Outcomes: 1, 3, 4, 5, 6</span></div>
  </div>`);

const ex2 = example(2, 2, 'Find P(not A)', `
  <div class="ex-q">A die is rolled. P(rolling a 6) = ${F(1, 6)}. Find P(<b>not</b> rolling a 6).</div>
  <div class="steps">
    <div><span class="st">1</span>Use the rule: &nbsp;P(not 6) = 1 − P(6). &nbsp;Write 1 with the <b>same bottom number</b>: &nbsp;1 = ${F(6, 6)}</div>
    <div><span class="st">2</span>Take away the tops: &nbsp;${F(6, 6)} − ${F(1, 6)} = <span class="hl">${F(5, 6)}</span> &nbsp;<span class="note">Check: not 6 is 1, 2, 3, 4, 5. That is 5 out of 6 ✓</span></div>
  </div>`);

const ex3 = example(3, 3, 'Check that P(A) + P(not A) = 1', `
  <div class="ex-cols">
    <div><div class="ex-q"><b>a</b> &nbsp;Lily: P(win) = ${F(3, 8)}, P(not win) = ${F(5, 8)}. Right?</div>
      <div class="steps"><div><span class="st">1</span>Add them: &nbsp;${F(3, 8)} + ${F(5, 8)} = ${F(8, 8)}</div>
      <div><span class="st">2</span>${F(8, 8)} = 1 whole. <span class="hl">Yes, Lily is right ✓</span></div></div></div>
    <div><div class="ex-q"><b>b</b> &nbsp;Sam: P(snow) = ${F(1, 3)}, P(no snow) = ${F(1, 3)}. Right?</div>
      <div class="steps"><div><span class="st">1</span>Add them: &nbsp;${F(1, 3)} + ${F(1, 3)} = ${F(2, 3)}</div>
      <div><span class="st">2</span>${F(2, 3)} is not 1. <span class="hl">No ✗. P(no snow) = 1 − ${F(1, 3)} = ${F(2, 3)}</span></div></div></div>
  </div>`);

const ex4 = example(4, 4, 'Decimals and everyday problems', `
  <div class="ex-cols">
    <div><div class="ex-q"><b>a</b> &nbsp;The chance of rain is 0.3. Find the chance of <b>no</b> rain.</div>
      <div class="steps"><div><span class="st">1</span>1 whole = 10 tenths. 0.3 = 3 tenths.</div>
      <div><span class="st">2</span>10 − 3 = 7 tenths. &nbsp;<span class="hl">1 − 0.3 = 0.7</span></div></div></div>
    <div><div class="ex-q"><b>b</b> &nbsp;12 pencils. 5 are red. One is picked. Find P(not red).</div>
      <div class="steps"><div><span class="st">1</span>Not red: 12 − 5 = 7 pencils</div>
      <div><span class="st">2</span>7 out of 12. &nbsp;<span class="hl">P(not red) = ${F(7, 12)}</span> &nbsp;</div></div></div>
  </div>`);

const round = (n, level, who, ex, hint, qs, cols = 2) => `
<div class="round">
  <div class="round-head"><span class="round-tag">${n === 'C' ? 'Challenge' : 'Round ' + n}</span><span class="lvl">${level}</span><span class="who">${who}</span><span class="round-use">${ex}${n === 1 || n === 2 ? ' · fill in the blanks' : ''}</span></div>
  ${hint ? `<div class="hint">${hint}</div>` : ''}
  <div class="qgrid c${cols}">${qs.join('')}</div>
</div>`;

const keyRow = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i).map((n) => `<span><b>${n}</b> ${String(answers[n]).replace(/<span class="fr"><span>(.*?)<\/span><span>(.*?)<\/span><\/span>/g, '$1/$2')}</span>`).join('');

// ---------- pages ----------
const page1 = `
<section class="page p1">
  <div class="hero">
    <div class="hero-card">
      <img src="${ASSETS}/kingscliff-logo.png" alt="Kingscliff High School">
      <div><p class="kicker">Year 7 Mathematics · Chapter 11 Probability</p><h1>Complementary events</h1><p class="sub">Worksheet · work on your own</p></div>
    </div>
    <div class="outcome"><b>MA4-PRO-C-01</b><span>Solves problems involving the probabilities of simple chance experiments</span></div>
    <div style="display:none">
    </div>
  </div>
  <div class="content">
    <div class="top-row">
      <div class="card words">
        <p class="card-title">Key words</p>
        <dl>
          <dt>outcome</dt><dd>one thing that can happen. A die has 6: 1, 2, 3, 4, 5, 6.</dd>
          <dt>event</dt><dd>what we want to happen, e.g. rolling an even number.</dd>
          <dt>complement</dt><dd>all the <b>other</b> outcomes. It is the event <b>not</b> happening.</dd>
          <dt>not</dt><dd>P(not A) means “the chance that A does <b>not</b> happen”.</dd>
        </dl>
        <p class="howto"><b>How to use this sheet:</b> read each grey <b>Example</b>, then do the blue <b>Round</b> under it. Check your answers at the end of page 2.</p>
        <p class="note-line"><b>Notes:</b> An event and its complement never share an outcome. Together they make <b>all</b> the outcomes, so one of them <b>must</b> happen.</p>
      </div>
      <div class="card formula">
        <p class="card-title">Formulas</p>
        <div class="fbox">P(not A) = 1 − P(A)</div>
        <div class="fbox">P(A) + P(not A) = 1</div>
        ${wholeBar()}
        <p class="tip"><b>Tip:</b> 1 whole = ${F(4, 4)} = ${F(6, 6)} = ${F(10, 10)} = 1.0</p>
      </div>
    </div>
    ${ex1}
    ${round(1, 'Easy', 'Support', 'Use Example 1', '', r1, 1)}
    ${ex2}
    ${round(2, 'Easy', 'Support / Core', 'Use Example 2', '', r2)}
  </div>
  <footer class="page-foot"><span>Kingscliff High School · Year 7 Mathematics</span><span class="pn">1</span><span>Ch 11 · Complementary events · Turn over →</span></footer>
</section>`;

const page2 = `
<section class="page p2">
  <div class="band"></div>
  <header class="page-head"><span><b class="chip">Ch 11</b>Complementary events</span><span class="sec">Keep going</span></header>
  <div class="content">
    ${ex3}
    ${round(3, 'Medium', 'Core', 'Use Example 3', '', r3)}
    ${ex4}
    ${round(4, 'Medium', 'Core', 'Use Example 4', '', r4)}
    ${round('C', 'Challenging', 'Core (stretch)', 'Use all the examples', '', r5)}
    <div class="end-row">
      <div class="card traffic">
        <p class="card-title">How did I go? <span>Colour one light for each row.</span></p>
        <table>
          <tr><th></th><th class="g">On my own</th><th class="a">With the examples</th><th class="r">I need help</th></tr>
          <tr><td>I can name the complement.</td><td><i class="g"></i></td><td><i class="a"></i></td><td><i class="r"></i></td></tr>
          <tr><td>I can use <span class="nw">P(not A) = 1 − P(A).</span></td><td><i class="g"></i></td><td><i class="a"></i></td><td><i class="r"></i></td></tr>
          <tr><td>I can check <span class="nw">P(A) + P(not A) = 1.</span></td><td><i class="g"></i></td><td><i class="a"></i></td><td><i class="r"></i></td></tr>
        </table>
        <div class="tricky"><b>Something I found tricky (ask my teacher):</b><i></i></div>
      </div>
      <div class="key">
        <div class="key-inner">
          <p class="key-title">Answers: check when you finish a round</p>
          <div class="key-grid">${keyRow(1, 20)}</div>
        </div>
      </div>
    </div>
  </div>
  <footer class="page-foot"><span>Kingscliff High School · Year 7 Mathematics</span><span class="pn">2</span><span>Artwork: part of the Mandelbrot set</span></footer>
</section>`;

const css = fs.readFileSync(path.join(DIR, 'style.css'), 'utf8').replaceAll('{{ASSETS}}', ASSETS);
const html = `<!doctype html><html lang="en-AU"><head><meta charset="utf-8"><title>Year 7 · Complementary events</title><style>${css}</style></head><body>${page1}${page2}</body></html>`;

// ---------- answer checks ----------
const bad = checks.filter(([, ok]) => !ok);
checks.forEach(([l, ok]) => console.log(`${ok ? '✓' : '✗'} ${l}`));
if (bad.length) { console.error(`${bad.length} answer check(s) failed`); process.exit(1); }

// ---------- render, layout check, PDF ----------
const shotsIdx = process.argv.indexOf('--shots');
const shotsDir = shotsIdx > 0 ? process.argv[shotsIdx + 1] : null;
(async () => {
  let pw;
  try { pw = require('playwright'); } catch { pw = require(require.resolve('playwright', { paths: [execSync('npm root -g').toString().trim()] })); }
  const browser = await pw.chromium.launch();
  const pg = await browser.newPage({ viewport: { width: 800, height: 1200 }, deviceScaleFactor: 2 });
  const file = path.join(DIR, `${NAME}.html`);
  fs.writeFileSync(file, html);
  await pg.goto('file://' + file);
  await pg.evaluate(() => document.fonts.ready);
  const problems = await pg.evaluate(() => {
    const MM = 3.78, out = [], r = (e) => e.getBoundingClientRect();
    document.querySelectorAll('.page').forEach((p, i) => {
      const c = p.querySelector('.content'), cb = r(c), pb = r(p);
      if (c.scrollHeight > c.clientHeight + 1) out.push(`page ${i + 1}: content overflows by ${((c.scrollHeight - c.clientHeight) / MM).toFixed(1)} mm`);
      c.querySelectorAll(':scope > *, .q').forEach((e) => {
        const b = r(e);
        if (b.width && (b.bottom > cb.bottom + 1 || b.right > cb.right + 1 || b.left < cb.left - 1)) out.push(`page ${i + 1}: ${e.className || e.tagName} runs outside the content area`);
      });
      p.querySelectorAll('.q, .ex, .round, .card, .key, .qb, .with-fig > div, .steps > div, td, dd').forEach((e) => {
        if (e.scrollHeight > e.clientHeight + 2 || e.scrollWidth > e.clientWidth + 2) out.push(`page ${i + 1}: text cut off in ${e.className || e.tagName}: "${e.textContent.trim().slice(0, 40)}"`);
      });
      // siblings in grids/flex rows must not overlap
      p.querySelectorAll('.qgrid, .top-row, .end-row, .ex-cols, .with-fig, .content').forEach((g) => {
        const k = [...g.children].map(r);
        for (let a = 0; a < k.length; a++) for (let b = a + 1; b < k.length; b++) {
          const A = k[a], Bb = k[b];
          if (Math.min(A.right, Bb.right) - Math.max(A.left, Bb.left) > 1 && Math.min(A.bottom, Bb.bottom) - Math.max(A.top, Bb.top) > 1) out.push(`page ${i + 1}: blocks overlap in ${g.className}`);
        }
      });
      p.querySelectorAll('.work').forEach((w) => { if (r(w).height / MM < 7.5) out.push(`page ${i + 1}: working space under 7.5 mm`); });
      p.querySelectorAll('.blank').forEach((w) => { if (!w.closest('.blankfr') && r(w).width / MM < 5.5) out.push(`page ${i + 1}: blank under 5.5 mm wide`); });
      const left = (cb.bottom - Math.max(...[...c.children].map((e) => r(e).bottom))) / MM;
      out.push(`info page ${i + 1}: ${left.toFixed(1)} mm spare at the bottom`);
    });
    return out;
  });
  problems.forEach((p) => console.log((p.startsWith('info') ? '  ' : '⚠ ') + p));
  if (shotsDir) {
    fs.mkdirSync(shotsDir, { recursive: true });
    const pages = await pg.$$('.page');
    for (let i = 0; i < pages.length; i++) await pages[i].screenshot({ path: path.join(shotsDir, `p${i + 1}.png`) });
  }
  await pg.pdf({ path: path.join(DIR, `${NAME}.pdf`), format: 'A4', printBackground: true, preferCSSPageSize: true });
  const n = problems.filter((p) => !p.startsWith('info')).length;
  console.log(n ? `${n} layout problem(s)` : 'Layout check: no problems found');
  console.log(`${NAME}.pdf written (${(fs.statSync(path.join(DIR, `${NAME}.pdf`)).size / 1024).toFixed(0)} KB)`);
  await browser.close();
})();
