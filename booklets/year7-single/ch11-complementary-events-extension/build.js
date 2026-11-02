// Year 7 · Chapter 11 · Complementary events EXTENSION: a two-page (one double-sided sheet) independent worksheet.
// Mandelbrot theme, booklet blue (#3f63be). Worked examples: pale grey, dashed border. Questions: pale blue.
// Usage (from the booklets folder): node year7-single/ch11-complementary-events-extension/build.js [--shots <dir>]
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DIR = __dirname;
const NAME = 'Yr7_Ch11_Complementary_Events_Extension_Worksheet';
const CORE = path.join(DIR, '../ch11-complementary-events'); // shares the stylesheet and header images
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
const side = (text, mm = 15) => `<div class="side"><div>${text}</div><div class="wbox" style="min-height:${mm}mm"><span class="wl">Working</span><div class="ans-line"><b>Answer:</b><i></i></div></div></div>`;
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

// ---------- content (extension) ----------
const KEY = {};
const Q = (n, h, key, cls = '') => { KEY[n] = key; return `<div class="q${cls ? ' ' + cls : ''}"><span class="qn">${n}</span><div class="qb">${h}</div></div>`; };
// Numbers written in a key string: fractions, decimals, percentages and whole numbers.
const nums = (t) => (t.replace(/\(.*?\)/g, (m) => ' ' + m.slice(1, -1) + ' ').match(/\d+\/\d+|\d*\.\d+|\d+%|\d+/g) || [])
  .map((x) => x.includes('/') ? (([a, b]) => a / b)(x.split('/').map(Number)) : x.endsWith('%') ? parseFloat(x) / 100 : +x);
const keyHas = (n, ...vals) => check(`Key ${n} contains ${vals.map((v) => +v.toFixed(6)).join(', ')}`, vals.every((v) => nums(KEY[n]).some((g) => Math.abs(g - v) < 1e-9)));
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const isPrime = (k) => k > 1 && range(2, k - 1).every((d) => k % d);

// Round 1: complements in words, with "more than", "at least", primes and multiples
const r1row = (n, event, comp, outs, key) => { KEY[n] = key; return `<tr><td class="tn"><span class="qn">${n}</span></td><td>${event}</td><td>${comp}</td><td>${outs}</td></tr>`; };
const spin8n = range(1, 8).map((k) => ({ t: String(k), c: '#ffffff' }));
const r1rows = [
  r1row(1, `A die is rolled.<br><b>Event:</b> rolling more than 2`, `rolling ${B(7)} or less`, `${B(6)}, ${B(6)}`, 'rolling 2 or less; 1, 2'),
  r1row(2, `A die is rolled.<br><b>Event:</b> rolling a prime number`, `${B(40)}`, `${B(36)}`, 'not a prime; 1, 4, 6'),
  r1row(3, `<div class="with-fig"><div>This spinner is spun.<br><b>Event:</b> a multiple of 3</div>${spinner(spin8n, 12)}</div>`, `${B(40)}`, `${B(36)}`, 'not a multiple of 3; 1, 2, 4, 5, 7, 8'),
  r1row(4, `Cards numbered 1 to 10. One is picked.<br><b>Event:</b> at least 7`, `${B(40)}`, `${B(36)}`, 'less than 7 (6 or less); 1 to 6'),
];
check('Q1 complement of >2 on a die is {1,2}', range(1, 6).filter((k) => !(k > 2)).join() === '1,2');
check('Q2 complement of prime on a die is {1,4,6}', range(1, 6).filter((k) => !isPrime(k)).join() === '1,4,6');
check('Q3 complement of multiple of 3 on 1–8 is {1,2,4,5,7,8}', range(1, 8).filter((k) => k % 3).join() === '1,2,4,5,7,8');
check('Q4 complement of ≥7 on 1–10 is {1..6}', range(1, 10).filter((k) => !(k >= 7)).join() === '1,2,3,4,5,6');
check('Q5 even and 1 are not complementary: 3 and 5 are in neither', range(1, 6).filter((k) => k % 2 && k !== 1).join() === '3,5');
const r1 = [
  `<table class="r1"><tr><th></th><th>What happens</th><th>Complement (in words)</th><th>Outcomes in the complement</th></tr>${r1rows.join('')}</table>`,
  Q(5, side(`A die is rolled. Are “rolling an even number” and “rolling a 1” complementary events? Explain.`, 12).replace('<b>Answer:</b>', '<b>Yes / No because</b>'), 'No: 3 and 5 are in neither event', 'q-wide'),
];

// Round 2: P(not A) with fractions, decimals and percentages
const r2 = [
  Q(6, `P(A) = 0.23. Find P(not A).<div class="calc">P(not A) = 1.00 − 0.23 = ${B(14)}</div>`, '0.77'),
  Q(7, side(`P(A) = ${F(4, 9)}. Find P(not A).`, 13), '5/9'),
  Q(8, side(`The chance of rain is 64%. Find the chance of <b>no</b> rain.`, 13), '36%'),
  Q(9, side(`P(the train is on time) = 0.875. Find P(the train is <b>not</b> on time).`, 13), '0.125'),
  Q(10, side(`P(win) = ${F(6, 15)}. Find P(not win) in <b>simplest form</b>.`, 13), '9/15 = 3/5', 'span2'),
];
check('Q6 100 − 23 = 77 hundredths', 100 - 23 === 77); keyHas(6, 0.77);
check('Q7 1 − 4/9 = 5/9', eq(sub1([4, 9]), [5, 9])); keyHas(7, 5 / 9);
check('Q8 100% − 64% = 36%', 100 - 64 === 36); keyHas(8, 0.36);
check('Q9 1000 − 875 = 125 thousandths', 1000 - 875 === 125); keyHas(9, 0.125);
check('Q10 1 − 6/15 = 9/15 = 3/5', eq(sub1([6, 15]), [9, 15]) && fr(9, 15).join() === '3,5'); keyHas(10, 3 / 5);

// Round 3: more than two outcomes: the probabilities of all the outcomes add to 1
const r3 = [
  Q(11, `A spinner is red, blue or yellow. P(red) = 0.2 and P(blue) = 0.45.<div class="calc">0.2 + 0.45 = ${B(12)}</div><div class="calc">P(yellow) = 1 − ${B(12)} = ${B(12)}</div><div class="calc">P(not yellow) = ${B(12)}</div>`, 'P(yellow) = 0.35; P(not yellow) = 0.65'),
  Q(12, side(`How students get to school:<table class="mini"><tr><td>Bus</td><td>Car</td><td>Bike</td><td>Walk</td></tr><tr><td>35%</td><td>40%</td><td>10%</td><td>?</td></tr></table>Find P(walk) and P(<b>not</b> car).`, 16), 'P(walk) = 15%; P(not car) = 60%'),
  Q(13, side(`Only A, B or C can happen. P(A) = ${F(1, 6)} and P(B) = ${F(1, 3)}.<br>Find P(C) and P(<b>not</b> B).`, 16), 'P(C) = 1/2 (3/6); P(not B) = 2/3'),
  Q(14, side(`Jo says: “The chance my team wins is 0.6 and the chance it loses is 0.5.” Draws can’t happen. Explain why Jo must be wrong.`, 16).replace('<b>Answer:</b>', '<b>Because</b>'), '0.6 + 0.5 = 1.1, more than 1'),
];
check('Q11 1 − (0.20 + 0.45) = 0.35, not yellow 0.65', 100 - (20 + 45) === 35 && 100 - 35 === 65); keyHas(11, 0.35, 0.65);
check('Q12 walk = 100 − 35 − 40 − 10 = 15%; not car = 60%', 100 - 35 - 40 - 10 === 15 && 100 - 40 === 60); keyHas(12, 0.15, 0.6);
check('Q13 P(C) = 1 − 1/6 − 1/3 = 1/2; P(not B) = 2/3', eq(sub1(add([1, 6], [1, 3])), [1, 2]) && eq(sub1([1, 3]), [2, 3])); keyHas(13, 1 / 2, 2 / 3);
check('Q14 0.6 + 0.5 = 1.1 > 1', 6 + 5 === 11); keyHas(14, 1.1);

// Round 4: work backwards to find how many
const r4 = [
  Q(15, `A bag has 40 marbles. P(<b>not</b> blue) = ${F(3, 4)}. How many are blue?<div class="calc">P(blue) = 1 − ${F(3, 4)} = ${BF()} &nbsp; ${BF()} of 40 = ${B(10)} blue</div>`, 'P(blue) = 1/4; 10 blue'),
  Q(16, side(`A class has 28 students. P(a student is <b>not</b> left-handed) = ${F(6, 7)}. How many are left-handed?`, 18), '1/7 of 28 = 4'),
  Q(17, side(`200 raffle tickets are sold. P(Ana does <b>not</b> win) = 0.95. How many tickets did Ana buy?`, 18), 'P(win) = 0.05; 10 tickets'),
  Q(18, side(`A spinner has 20 equal parts. P(<b>not</b> red) = 0.65. How many parts are red?`, 18), 'P(red) = 0.35; 7 parts'),
];
check('Q15 1 − 3/4 = 1/4; 40 ÷ 4 = 10', eq(sub1([3, 4]), [1, 4]) && 40 / 4 === 10); keyHas(15, 1 / 4, 10);
check('Q16 1 − 6/7 = 1/7; 28 ÷ 7 = 4', eq(sub1([6, 7]), [1, 7]) && 28 / 7 === 4); keyHas(16, 4);
check('Q17 1 − 0.95 = 0.05; 0.05 × 200 = 10', 100 - 95 === 5 && (5 * 200) / 100 === 10); keyHas(17, 0.05, 10);
check('Q18 1 − 0.65 = 0.35; 0.35 × 20 = 7', 100 - 65 === 35 && (35 * 20) / 100 === 7); keyHas(18, 0.35, 7);

// Challenge
const r5 = [
  Q(19, side(`A box has only red, blue and green counters. P(<b>not</b> red) = ${F(5, 8)} and P(<b>not</b> blue) = ${F(3, 4)}. Find P(green).`, 20), 'P(red) = 3/8, P(blue) = 2/8; P(green) = 3/8'),
  Q(20, side(`P(A) is 3 times as big as P(not A). Find P(A) and P(not A).<br><span class="note">Hint: draw a bar split into 4 equal parts.</span>`, 20), 'P(A) = 3/4; P(not A) = 1/4'),
];
{ const red = sub1([5, 8]), blue = sub1([3, 4]), green = sub1(add(red, blue));
  check('Q19 red 3/8, blue 1/4, green 1 − 5/8 = 3/8', eq(red, [3, 8]) && eq(blue, [1, 4]) && eq(green, [3, 8])); }
keyHas(19, 3 / 8);
check('Q20 3/4 = 3 × 1/4 and 3/4 + 1/4 = 1', eq([3, 4], [3 * 1, 4]) && eq(add([3, 4], [1, 4]), [1, 1])); keyHas(20, 3 / 4, 1 / 4);
check('20 questions, each with a key', Object.keys(KEY).length === 20 && range(1, 20).every((n) => KEY[n]));

// ---------- worked examples ----------
const example = (n, round, title, body) => `
<div class="ex">
  <div class="ex-head"><span class="ex-tag">Example ${n}</span><span class="ex-title">${title}</span><span class="ex-use">Use me for <b>Round ${round}</b> ↓</span></div>
  <div class="ex-body">${body}</div>
</div>`;
const cardRow = (crossFrom) => `<span class="die-row">${range(1, 10).map((k) => `<span class="${k > crossFrom ? 'x' : ''}">${k}</span>`).join('')}</span>`;

const ex1 = example(1, 1, 'Complements with “more than” and “at least”', `
  <div class="ex-q">Cards numbered 1 to 10. <b>Event:</b> picking a number greater than 6. Write the complement and list its outcomes.</div>
  <div class="steps">
    <div><span class="st">1</span>List all the outcomes and cross out the event (7, 8, 9, 10): ${cardRow(6)}</div>
    <div><span class="st">2</span><span class="hl">Complement: 6 or less. Outcomes: 1, 2, 3, 4, 5, 6</span> &nbsp;<span class="note">Careful: 6 is in the complement. It is not “less than 6”.</span></div>
  </div>`);
check('Example 1: complement of >6 on 1–10 is {1..6}', range(1, 10).filter((k) => !(k > 6)).join() === '1,2,3,4,5,6');

const ex2 = example(2, 2, 'Fractions, decimals and percentages', `
  <div class="ex-cols three">
    <div><div class="ex-q"><b>a</b> P(A) = ${F(3, 8)}</div><div class="steps"><div>${F(8, 8)} − ${F(3, 8)} = <span class="hl">${F(5, 8)}</span></div></div></div>
    <div><div class="ex-q"><b>b</b> P(A) = 0.35</div><div class="steps"><div>1.00 − 0.35 = <span class="hl">0.65</span></div><div class="note">Write 1 as 1.00 to line up.</div></div></div>
    <div><div class="ex-q"><b>c</b> P(A) = 72%</div><div class="steps"><div>100% − 72% = <span class="hl">28%</span></div><div class="note">1 whole = 100%</div></div></div>
  </div>
  <div class="note" style="margin-top:0.6mm">In each part, find P(not A). Simplify a fraction answer if you can, e.g. ${F(9, 15)} = ${F(3, 5)}.</div>`);
check('Example 2: 1 − 3/8 = 5/8; 1 − 0.35 = 0.65; 100 − 72 = 28', eq(sub1([3, 8]), [5, 8]) && 100 - 35 === 65 && 100 - 72 === 28);

const spin12 = [...'RRRBBBBGGGGG'].map((t) => ({ t, c: C[t] }));
const ex3 = example(3, 3, 'More than two outcomes', `
  <div class="with-fig"><div>
  <div class="ex-q">A spinner is red, blue or green. P(red) = ${F(1, 4)} and P(blue) = ${F(1, 3)}. Find P(green) and P(not green).</div>
  <div class="steps">
    <div><span class="st">1</span>All the outcomes add to 1. Use the same bottom number: &nbsp;${F(1, 4)} + ${F(1, 3)} = ${F(3, 12)} + ${F(4, 12)} = ${F(7, 12)}</div>
    <div><span class="st">2</span>P(green) = ${F(12, 12)} − ${F(7, 12)} = <span class="hl">${F(5, 12)}</span> &nbsp; P(not green) = 1 − ${F(5, 12)} = <span class="hl">${F(7, 12)}</span> <span class="note">(red or blue)</span></div>
  </div></div>${spinner(spin12, 17)}</div>`);
check('Example 3: 1/4 + 1/3 = 7/12; green 5/12; not green 7/12; spinner 3 R, 4 B, 5 G of 12',
  eq(add([1, 4], [1, 3]), [7, 12]) && eq(sub1([7, 12]), [5, 12]) && eq(sub1([5, 12]), [7, 12]) && spin12.filter((p) => p.t === 'R').length === 3 && spin12.filter((p) => p.t === 'B').length === 4 && spin12.filter((p) => p.t === 'G').length === 5);

const ex4 = example(4, 4, 'Work backwards to find how many', `
  <div class="ex-q">A bag has 30 lollies. P(<b>not</b> red) = ${F(3, 5)}. How many red lollies are in the bag?</div>
  <div class="steps">
    <div><span class="st">1</span>P(red) = 1 − ${F(3, 5)} = ${F(2, 5)}</div>
    <div><span class="st">2</span>${F(2, 5)} of 30: &nbsp;30 ÷ 5 = 6, &nbsp;6 × 2 = 12. &nbsp;<span class="hl">12 red lollies</span> &nbsp;<span class="note">Check: 18 not red, ${F(18, 30)} = ${F(3, 5)} ✓</span></div>
  </div>`);
check('Example 4: 1 − 3/5 = 2/5; 2/5 of 30 = 12; 18/30 = 3/5', eq(sub1([3, 5]), [2, 5]) && (30 / 5) * 2 === 12 && eq([18, 30], [3, 5]));

const round = (n, level, who, ex, qs, cols = 2) => `
<div class="round${n === 'C' ? ' round-c' : ''}">
  <div class="round-head"><span class="round-tag">${n === 'C' ? 'Challenge' : 'Round ' + n}</span><span class="lvl">${level}</span><span class="who">${who}</span><span class="round-use">${ex}</span></div>
  <div class="qgrid c${cols}">${qs.join('')}</div>
</div>`;
const keyShort = `<span class="key-items">${Object.entries(KEY).map(([n, t]) => `<span><b>${n}</b> ${t}</span>`).join(' ')}</span>`;

// 100% bar for the formula box
const pctBar = () => `<svg class="bar" viewBox="-1 0 86 24">
  <text x="42" y="3.6" font-size="3.4" text-anchor="middle" fill="#3d3b3c" font-weight="700">All the outcomes = 1 = 100%</text>
  <rect x="0" y="6" width="29.4" height="9" fill="#3f63be" stroke="#3d3b3c" stroke-width="0.4"/><rect x="29.4" y="6" width="54.6" height="9" fill="#e6ecf8" stroke="#3d3b3c" stroke-width="0.4"/>
  <text x="14.7" y="10.6" font-size="3.6" text-anchor="middle" dominant-baseline="central" fill="#fff" font-weight="700">rain 35%</text>
  <text x="56.7" y="10.6" font-size="3.6" text-anchor="middle" dominant-baseline="central" fill="#26292e" font-weight="700">no rain 65%</text>
  <text x="42" y="21" font-size="3.2" text-anchor="middle" fill="#26292e">35% + 65% = 100%</text></svg>`;
check('Formula bar: 35% + 65% = 100%, drawn to scale', 35 + 65 === 100 && Math.abs(29.4 / 84 - 0.35) < 1e-9);

// ---------- pages ----------
const page1 = `
<section class="page p1">
  <div class="hero">
    <div class="hero-card">
      <img src="${ASSETS}/kingscliff-logo.png" alt="Kingscliff High School">
      <div><p class="kicker">Year 7 Mathematics · Chapter 11 Probability</p><h1>Complementary events</h1><p class="sub">Extension worksheet · work on your own</p></div>
    </div>
    <div class="outcome"><b>MA4-PRO-C-01</b><span>Solves problems involving the probabilities of simple chance experiments</span></div>
  </div>
  <div class="content">
    <div class="top-row">
      <div class="card words">
        <p class="card-title">Key words</p>
        <dl>
          <dt>complement</dt><dd>all the outcomes that are <b>not</b> in the event.</dd>
          <dt>more than 4</dt><dd>5, 6, … (4 is <b>not</b> included). Its complement is “4 or less”.</dd>
          <dt>at least 4</dt><dd>4 or more (4 <b>is</b> included). Its complement is “less than 4”.</dd>
          <dt>prime</dt><dd>has exactly two factors: 2, 3, 5, 7, … (1 is not prime).</dd>
        </dl>
        <p class="howto"><b>How to use this sheet:</b> read each grey <b>Example</b>, then do the blue <b>Round</b> under it. The first question in a round is started for you.</p>
        <p class="note-line"><b>Notes:</b> If the only outcomes are A, B and C, then P(A) + P(B) + P(C) = 1. Probabilities are never below 0 or above 1.</p>
      </div>
      <div class="card formula">
        <p class="card-title">Formulas</p>
        <div class="fbox">P(not A) = 1 − P(A)</div>
        <div class="fbox">P(A) + P(not A) = 1</div>
        ${pctBar()}
        <p class="tip"><b>Tip:</b> 1 = ${F(8, 8)} = 1.00 = 100%</p>
      </div>
    </div>
    ${ex1}
    ${round(1, 'Medium', 'Extension', 'Use Example 1', r1, 1)}
    ${ex2}
    ${round(2, 'Medium', 'Extension', 'Use Example 2', r2)}
  </div>
  <footer class="page-foot"><span>Kingscliff High School · Year 7 Mathematics</span><span class="pn">1</span><span>Ch 11 · Complementary events (extension) · Turn over →</span></footer>
</section>`;

const page2 = `
<section class="page p2">
  <div class="band"></div>
  <header class="page-head"><span><b class="chip">Ch 11</b>Complementary events</span><span class="sec">Extension</span></header>
  <div class="content">
    ${ex3}
    ${round(3, 'Challenging', 'Extension', 'Use Example 3', r3)}
    ${ex4}
    ${round(4, 'Challenging', 'Extension', 'Use Example 4', r4)}
    ${round('C', 'Challenging', 'Extension (stretch)', 'Use all the examples', r5)}
    <div class="key">
      <div class="key-inner"><b class="key-title">Answers</b>${keyShort}</div>
    </div>
  </div>
  <footer class="page-foot"><span>Kingscliff High School · Year 7 Mathematics</span><span class="pn">2</span><span>Artwork: part of the Mandelbrot set</span></footer>
</section>`;

const css = (fs.readFileSync(path.join(CORE, 'style.css'), 'utf8') + fs.readFileSync(path.join(DIR, 'extra.css'), 'utf8')).replaceAll('{{ASSETS}}', ASSETS).replaceAll('url(img/', 'url(../ch11-complementary-events/img/');
const html = `<!doctype html><html lang="en-AU"><head><meta charset="utf-8"><title>Year 7 · Complementary events (extension)</title><style>${css}</style></head><body>${page1}${page2}</body></html>`;

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
      p.querySelectorAll('.qgrid, .top-row, .ex-cols, .with-fig, .content').forEach((g) => {
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
