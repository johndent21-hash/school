// Lesson 1.7 Compound interest (two pages: Easy, then Medium). See lib/lesson-two.js for the fields.
const { fmt, money, pct, round, problems } = require('../helpers');

// Interest for one year on a balance b at r% (10 → 0.1 × b)
const yearInt = (b, r) => b * (r / 100);
// Compound interest year by year: [[interest, balance at the end], ..] for each of n years
const yearly = (p, r, n) => { const out = []; let b = p; for (let k = 0; k < n; k++) { const i = yearInt(b, r); b += i; out.push([i, b]); } return out; };
// The balance after n years, worked year by year
const yearEnd = (p, r, n) => yearly(p, r, n)[n - 1][1];
// Simple interest I = P × R × N, for comparing
const si = (p, r, n) => p * (r / 100) * n;
// 1 + R for a rate of r% (6 → 1.06)
const onePlus = (r) => 1 + r / 100;
// The formula A = P(1 + R)^n, rounded to the nearest cent (as students write it)
const A = (p, r, n) => +(p * onePlus(r) ** n).toFixed(2);
// The working for the formula: "A = 2 500 × 1.06⁴ = $3 156.19"
const aWorking = (p, r, n) => `A = ${fmt(p)} × ${fmt(onePlus(r))}<sup>${fmt(n)}</sup> = ${money(A(p, r, n))}`;
// "2 years", "1 year"
const time = (n) => `${fmt(n)} year${n === 1 ? '' : 's'}`;
// A small table with blank cells for students to fill in
const table = (head, rows) => `<table class="data-table blank" style="width:100%"><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr>${rows.map((r) => `<tr>${r.map((c, i) => (i ? `<td>${c}</td>` : `<th>${c}</th>`)).join('')}</tr>`).join('')}</table>`;
const blanks = (n) => Array(n).fill('');
// One question and its answer, both made from the same numbers: ask([600, 5, 4], (p, r, n) => question, (p, r, n) => answer)
const ask = (v, q, a) => [q(...v), a(...v)];
const example = (stem, list) => ({ ex: { stem, parts: list.map((x) => x[0]) }, exAns: list.map((x) => x[1]) });

// Easy example: every part uses the same $1 000 at 10%
const EX = [1000, 10];
// Medium example: parts c and d (and the calculator keys in the hint) use the same $2 500 at 6% for 4 years
const MEX = [2500, 6, 4];
// Easy tables: year-by-year growth, then simple against compound interest
const T1 = [2000, 10, 3];
const T2 = [500, 20, 3];
// Easy round 3: every question uses this rate
const R3 = 10;
const years = (n) => Array.from({ length: n }, (_, k) => k + 1);
const TABLES = {
  grow: {
    q: { t: `${money(T1[0])} earns ${pct(T1[1])} compound interest for ${time(T1[2])}. Find the total interest.`,
      fig: table(['Year', ...years(T1[2])], [['Interest', ...blanks(T1[2])], ['Balance', ...blanks(T1[2])]]) },
    a: `interest ${yearly(...T1).map(([i]) => money(i)).join(', ')} · balance ${yearly(...T1).map(([, b]) => money(b)).join(', ')} · total interest ${money(yearEnd(...T1) - T1[0])}`,
  },
  compare: {
    q: { t: `${money(T2[0])} earns ${pct(T2[1])} a year for ${time(T2[2])}. How much more does compound interest give?`,
      fig: table(['Balance after year', ...years(T2[2])], [['Simple interest', ...blanks(T2[2])], ['Compound interest', ...blanks(T2[2])]]) },
    a: `simple ${years(T2[2]).map((n) => money(T2[0] + si(T2[0], T2[1], n))).join(', ')} · compound ${yearly(...T2).map(([, b]) => money(b)).join(', ')} · ${money(yearEnd(...T2) - T2[0] - si(...T2))} more`,
  },
};

module.exports = {
  code: '1.7', title: 'Compound interest',
  li: 'work out compound interest, year by year and with the formula A = P(1 + R)<sup>n</sup>.',
  sc: ['find the interest for a year and the new balance', 'compare compound interest with simple interest', 'find the balance and interest with A = P(1 + R)<sup>n</sup>'],
  easy: {
    ...example(`${money(EX[0])} earns ${pct(EX[1])} compound interest. Each year, find the interest, then add it on.`, [
      ask(EX, () => 'Find the interest for year 1.', (p, r) => `${fmt(r / 100)} × ${fmt(p)} = ${money(yearInt(p, r))}`),
      ask(EX, () => 'Find the balance after 1 year.', (p, r) => `${fmt(p)} + ${fmt(yearInt(p, r))} = ${money(yearEnd(p, r, 1))}`),
      ask(EX, () => 'Find the balance after 2 years.',
        (p, r) => `${pct(r)} of ${fmt(yearEnd(p, r, 1))} = ${money(yearly(p, r, 2)[1][0])} · ${fmt(yearEnd(p, r, 1))} + ${fmt(yearly(p, r, 2)[1][0])} = ${money(yearEnd(p, r, 2))}`),
      ask(EX, () => 'Find the balance after 2 years with simple interest.',
        (p, r) => `I = ${fmt(p)} × ${fmt(r / 100)} × 2 = ${money(si(p, r, 2))}, balance ${money(p + si(p, r, 2))} · compound gives ${money(yearEnd(p, r, 2) - p - si(p, r, 2))} more`),
    ]),
    hint: `Interest = rate × balance (10% → × ${fmt(10 / 100)}) · New balance = balance + interest · Repeat each year.`,
    rounds: [
      round('find the interest for 1 year.', [[100, 10], [1000, 20], [400, 25], [2000, 5]],
        ([p, r]) => `${money(p)} at ${pct(r)}`, ([p, r]) => money(yearInt(p, r))),
      round('find the balance after 1 year (balance + interest).', [[300, 10], [1000, 10], [400, 5], [500, 20], [200, 25], [700, 10], [3000, 5], [600, 20]],
        ([p, r]) => `${money(p)} at ${pct(r)}`, ([p, r]) => money(yearEnd(p, r, 1))),
      round(`find the balance after 2 years at ${pct(R3)} compound interest.`, [100, 200, 500, 1000, 300, 2000, 400, 600], money, (p) => money(yearEnd(p, R3, 2))),
      round('fill in each table. Then answer the question on the line.', ['grow', 'compare'], (k) => TABLES[k].q, (k) => TABLES[k].a, { cols: 2 }),
    ],
  },
  medium: {
    ...example('Use a calculator. A = P(1 + R)<sup>n</sup>, R = rate as a decimal, n = number of years.', [
      ask([6], (r) => `Write (1 + R) for a rate of ${pct(r)}.`, (r) => `R = ${fmt(r / 100)} · 1 + ${fmt(r / 100)} = ${fmt(onePlus(r))}`),
      ask([1000, 10, 3], (p, r, n) => `Find A for ${money(p)} at ${pct(r)} for ${time(n)}.`, aWorking),
      ask(MEX, (p, r, n) => `Find A for ${money(p)} at ${pct(r)} for ${time(n)}, to the nearest cent.`, aWorking),
      ask(MEX, () => 'Find the interest earned in part c.', (p, r, n) => `${fmt(A(p, r, n))} − ${fmt(p)} = ${money(A(p, r, n) - p)}`),
    ]),
    hint: `A = P × (1 + R)<sup>n</sup> · ${pct(MEX[1])} → ${fmt(onePlus(MEX[1]))} · Type ${MEX[0]} × ${fmt(onePlus(MEX[1]))} ^ ${MEX[2]}, then press = · Round to the nearest cent · Interest = A − P.`,
    rounds: [
      round(`write (1 + R) as a decimal for each rate (5% → ${fmt(onePlus(5))}).`, [10, 3, 20, 8, 12, 4, 2.5, 4.5], pct, (r) => fmt(onePlus(r))),
      round('use A = P(1 + R)<sup>n</sup> to find the balance. Round to the nearest cent.', [[1000, 10, 2], [500, 10, 3], [2000, 5, 3], [800, 20, 2], [1500, 4, 2], [600, 3, 4], [4000, 2.5, 3], [2500, 6, 5]],
        ([p, r, n]) => `${money(p)} at ${pct(r)}<br>for ${time(n)}`, ([p, r, n]) => money(A(p, r, n))),
      round('find the compound interest earned (A − P).', [[1000, 5, 2], [3000, 10, 2], [400, 20, 3], [2000, 3, 3], [5000, 8, 2], [1200, 4, 3], [750, 6, 4], [10000, 2, 5]],
        ([p, r, n]) => `${money(p)} at ${pct(r)}<br>for ${time(n)}`, ([p, r, n]) => money(A(p, r, n) - p)),
      problems('solve each problem. Show your working.', [
        ask([5000, 4, 3], (p, r, n) => `Ella invests ${money(p)} at ${pct(r)} compound interest for ${time(n)}. Find the value and the interest earned.`,
          (p, r, n) => `value ${money(A(p, r, n))}, interest ${money(A(p, r, n) - p)}`),
        ask([4600, 12, 2], (p, r, n) => `Kai invests ${money(p)} at ${pct(r)} compound interest for ${time(n)}. How much interest does Kai earn?`,
          (p, r, n) => `A = ${money(A(p, r, n))}, interest ${money(A(p, r, n) - p)}`),
        ask([2000, 5, 3], (p, r, n) => `Jess invests ${money(p)} at ${pct(r)} for ${time(n)}. Find the simple interest and the compound interest.`,
          (p, r, n) => `simple ${money(si(p, r, n))}, compound ${money(A(p, r, n) - p)}, ${money(A(p, r, n) - p - si(p, r, n))} more`),
        ask([5000, 9.75, 2], (p, r, n) => `Max borrows ${money(p)} at ${pct(r)} compound interest for ${time(n)}. How much interest does Max pay?`,
          (p, r, n) => `A = ${money(A(p, r, n))}, interest ${money(A(p, r, n) - p)}`),
      ]),
    ],
  },
};
