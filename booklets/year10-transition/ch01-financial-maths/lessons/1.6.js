// Lesson 1.6 Simple interest and loans (two pages: Easy, then Medium). See lib/lesson-two.js for the fields.
const { fmt, money, pct, round, problems } = require('../helpers');

// Simple interest I = P × R × N, with the rate r given as a percentage (5 → 0.05)
const si = (p, r, n) => p * (r / 100) * n;
// The working for simple interest: "I = 1 000 × 0.05 × 2 = $100"
const siWorking = (p, r, n) => `I = ${fmt(p)} × ${fmt(r / 100)} × ${fmt(n)} = ${money(si(p, r, n))}`;
// "2 years", "1 year", "6 months" (half a year)
const time = (n) => (n === 0.5 ? '6 months' : `${fmt(n)} year${n === 1 ? '' : 's'}`);
// Monthly repayments of m over y years: 12 × y repayments
const months = (y) => 12 * y;
const repaid = (m, y) => m * months(y);
// The working for monthly repayments: "2 × 12 = 24 repayments · 150 × 24 = $3 600"
const repaidWorking = (m, y) => `${fmt(y)} × 12 = ${fmt(months(y))} repayments · ${fmt(m)} × ${fmt(months(y))} = ${money(repaid(m, y))}`;
// A deposit of r% of the price
const deposit = (price, r) => (r / 100) * price;
// One question and its answer, both made from the same numbers: ask([600, 5, 4], (p, r, n) => question, (p, r, n) => answer)
const ask = (v, q, a) => [q(...v), a(...v)];
const example = (stem, list) => ({ ex: { stem, parts: list.map((x) => x[0]) }, exAns: list.map((x) => x[1]) });

// Medium example: parts b and c are the same loan
const LOAN = [3000, 150, 2];

module.exports = {
  code: '1.6', title: 'Simple interest and loans',
  li: 'work out simple interest, and the cost of paying off a loan.',
  sc: ['write an interest rate as a decimal', 'use I = PRN to find the simple interest', 'find the deposit, total repaid and interest on a loan'],
  easy: {
    ...example('I = P × R × N. P = money invested, R = rate as a decimal, N = number of years.', [
      ask([5], (r) => `Write ${pct(r)} as a decimal.`, (r) => `${fmt(r)} ÷ 100 = ${fmt(r / 100)}`),
      ask([1000, 5, 2], (p, r, n) => `Find the simple interest on ${money(p)} at ${pct(r)} for ${time(n)}.`, siWorking),
      ask([400, 10, 3], (p, r, n) => `Find the simple interest on ${money(p)} at ${pct(r)} for ${time(n)}.`, siWorking),
      ask([500, 10, 2], (p, r, n) => `${money(p)} is invested at ${pct(r)} for ${time(n)}. Find the total at the end.`,
        (p, r, n) => `${siWorking(p, r, n)} · total ${fmt(p)} + ${fmt(si(p, r, n))} = ${money(p + si(p, r, n))}`),
    ]),
    hint: `Rate as a decimal: ÷ 100 (5% → ${fmt(5 / 100)}) · Simple interest: I = P × R × N · Total at the end = P + I.`,
    rounds: [
      round('write each interest rate as a decimal.', [5, 10, 3, 20], pct, (r) => fmt(r / 100)),
      round('find the simple interest for 1 year.', [[200, 10], [500, 10], [100, 5], [600, 5], [1000, 2], [300, 20], [800, 10], [2000, 4]],
        ([p, r]) => `${money(p)} at ${pct(r)}`, ([p, r]) => money(si(p, r, 1))),
      round('find the simple interest.', [[1000, 5, 2], [500, 10, 3], [200, 10, 4], [400, 5, 2], [2000, 3, 5], [700, 10, 2], [1000, 4, 3], [300, 20, 3]],
        ([p, r, n]) => `${money(p)} at ${pct(r)}<br>for ${time(n)}`, ([p, r, n]) => money(si(p, r, n))),
      round('find the total at the end (money invested + interest).', [[500, 10, 2], [1000, 5, 3], [200, 10, 5], [400, 5, 4], [2000, 2, 3], [800, 10, 3], [100, 20, 2], [3000, 5, 2]],
        ([p, r, n]) => `${money(p)} at ${pct(r)}<br>for ${time(n)}`, ([p, r, n]) => money(p + si(p, r, n))),
    ],
  },
  medium: {
    ...example('Use a calculator. Monthly repayments: number of repayments = 12 × years.', [
      ask([2500, 4.5, 3], (p, r, n) => `Find the simple interest on ${money(p)} at ${pct(r)} for ${time(n)}.`, siWorking),
      ask(LOAN, (l, m, y) => `A ${money(l)} loan is repaid at ${money(m)} a month for ${time(y)}. Find the total repaid.`, (l, m, y) => repaidWorking(m, y)),
      ask(LOAN, () => 'Find the interest paid on the loan in part b.', (l, m, y) => `${fmt(repaid(m, y))} − ${fmt(l)} = ${money(repaid(m, y) - l)}`),
      ask([2000, 10, 90, 2], (p, d, m, y) => `A ${money(p)} bike: ${pct(d)} deposit, then ${money(m)} a month for ${time(y)}. Find the interest.`,
        (p, d, m, y) => `deposit ${fmt(d / 100)} × ${fmt(p)} = ${money(deposit(p, d))} · total ${fmt(deposit(p, d))} + ${fmt(m)} × ${fmt(months(y))} = ${money(deposit(p, d) + repaid(m, y))} · interest ${fmt(deposit(p, d) + repaid(m, y))} − ${fmt(p)} = ${money(deposit(p, d) + repaid(m, y) - p)}`),
    ]),
    hint: `I = P × R × N (4.5% → ${fmt(4.5 / 100)}) · Total repaid = deposit + all the repayments · Interest = total repaid − price.`,
    rounds: [
      round(`use a calculator to find the simple interest (6 months = ${fmt(6 / 12)} years).`, [[1250, 3.5, 3], [5000, 8, 4], [645, 5, 2], [800, 5, 0.5]],
        ([p, r, n]) => `${money(p)} at ${pct(r)}<br>for ${time(n)}`, ([p, r, n]) => money(si(p, r, n))),
      round('find the deposit (a % of the price).', [[10, 2500], [20, 1800], [15, 4000], [25, 3600]],
        ([d, p]) => `Price ${money(p)}<br>${pct(d)} deposit`, ([d, p]) => money(deposit(p, d))),
      round('find the total repaid (repayment × 12 × years).', [[200, 5], [250, 3], [110, 3], [95.5, 2]],
        ([m, y]) => `${money(m)} a month<br>for ${time(y)}`, ([m, y]) => money(repaid(m, y))),
      round('find the interest paid (total repaid − loan).', [[2000, 100, 2], [1000, 50, 2], [4000, 150, 3], [3500, 120, 3]],
        ([l, m, y]) => `Loan ${money(l)}. Repay ${money(m)} a month for ${time(y)}.`, ([l, m, y]) => money(repaid(m, y) - l), { cols: 2 }),
      problems('solve each problem. Show your working.', [
        ask([600, 5, 4], (p, r, n) => `Kim invests ${money(p)} at ${pct(r)} simple interest for ${time(n)}. How much interest does Kim earn?`, (p, r, n) => money(si(p, r, n))),
        ask([5000, 200, 5], (l, m, y) => `Jo borrows ${money(l)}. Jo repays ${money(m)} a month for ${time(y)}. How much interest does Jo pay?`,
          (l, m, y) => `total repaid ${money(repaid(m, y))}, interest ${money(repaid(m, y) - l)}`),
        ask([1200, 10, 50, 2], (p, d, m, y) => `Ana buys a ${money(p)} phone. Ana pays a ${pct(d)} deposit, then ${money(m)} a month for ${time(y)}. Find the deposit and the total paid.`,
          (p, d, m, y) => `deposit ${money(deposit(p, d))}, total paid ${money(deposit(p, d) + repaid(m, y))}`),
        ask([7000, 15, 250, 4], (p, d, m, y) => `A car is worth ${money(p)}. Lee pays a ${pct(d)} deposit, then ${money(m)} a month for ${time(y)}. Find the deposit, the total repaid and the interest.`,
          (p, d, m, y) => `deposit ${money(deposit(p, d))}, total repaid ${money(deposit(p, d) + repaid(m, y))}, interest ${money(deposit(p, d) + repaid(m, y) - p)}`),
      ]),
    ],
  },
};
