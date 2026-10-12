// Lesson 1.5 Commission, gross and net income (two pages: Easy, then Medium). See lib/lesson-two.js for the fields.
const { fmt, pct, money, round, problems } = require('../helpers');

// Short names: helpers.js keeps the thousands of an amount such as $3 000 together on one line.
const m = money;
const f = fmt;
// Commission at r% on sales of s
const comm = (r, s) => (r / 100) * s;
// The working for a commission: "0.1 × 800 = $80"
const commWorking = (r, s) => `${f(r / 100)} × ${f(s)} = ${m(comm(r, s))}`;
// Add up a list of amounts: [250, 40, 75] → 365
const sum = (list) => list.reduce((t, x) => t + x, 0);
// The working for adding amounts: "250 + 40 + 75 = $365"
const addWorking = (list) => `${list.map(f).join(' + ')} = ${m(sum(list))}`;
// Net income = gross income − all the deductions
const net = (g, ded) => g - sum(ded);
// One question and its answer, both made from the same numbers: ask([10, 800], (r, s) => question, (r, s) => answer)
const ask = (v, q, a) => [q(...v), a(...v)];
const example = (stem, list) => ({ ex: { stem, parts: list.map((x) => x[0]) }, exAns: list.map((x) => x[1]) });

module.exports = {
  code: '1.5', title: 'Commission, gross and net income',
  li: 'work out commission, gross income and net income.',
  sc: ['find the commission on some sales', 'find the gross income (all the money earned)', 'take away the deductions to find the net income'],
  easy: {
    ...example('Commission = % of sales. Retainer = set weekly pay. Gross income = total earned.', [
      ask([10, 800], (r, s) => `Find ${pct(r)} commission on sales of ${m(s)}.`, (r, s) => commWorking(r, s)),
      ask([5, 2000], (r, s) => `Find ${pct(r)} commission on sales of ${m(s)}.`, (r, s) => commWorking(r, s)),
      ask([300, 150], (k, c) => `Gross income: ${m(k)} retainer + ${m(c)} commission.`, (k, c) => addWorking([k, c])),
      ask([250, 40, 75], (w, o, c) => `Gross income: ${m(w)} wage, ${m(o)} overtime, ${m(c)} commission.`, (w, o, c) => addWorking([w, o, c])),
    ]),
    hint: 'Commission: 10% of $800 = 0.1 × 800 = $80 (5% → 0.05) · Gross income: add up all the money earned.',
    rounds: [
      round('find the 10% commission on each amount of sales.', [700, 500, 2000, 300, 1500, 4000, 650, 12000], (s) => `Sales of ${m(s)}`, (s) => m(comm(10, s))),
      round('find the commission on each amount of sales.', [[5, 2000], [20, 450], [5, 600], [25, 800], [10, 950], [2, 1000], [50, 300], [5, 10000]],
        ([r, s]) => `${pct(r)} of ${m(s)} sales`, ([r, s]) => m(comm(r, s))),
      round('find the gross income (add the two amounts).', [['Wage', 500, 80], ['Retainer', 300, 150], ['Wage', 600, 150], ['Retainer', 250, 400], ['Wage', 750, 90], ['Retainer', 200, 85], ['Wage', 820, 75], ['Retainer', 450, 125]],
        ([k, w, c]) => `${k} ${m(w)}<br>Commission ${m(c)}`, ([, w, c]) => m(sum([w, c]))),
      round('find the gross income (add up all the money earned).', [[500, 60, 40], [400, 100, 200], [600, 90, 50], [350, 75, 125]],
        ([w, o, c]) => `Wage ${m(w)}, overtime ${m(o)}, commission ${m(c)}`, ([w, o, c]) => m(sum([w, o, c])), { cols: 2 }),
    ],
  },
  medium: {
    ...example('Use a calculator. Net income = gross income − deductions (tax, super, union fees).', [
      ask([3.5, 4600], (r, s) => `Find ${pct(r)} commission on sales of ${m(s)}.`, (r, s) => commWorking(r, s)),
      ask([400, 5, 3000], (k, r, s) => `Gross income: ${m(k)} retainer + ${pct(r)} of ${m(s)} sales.`,
        (k, r, s) => `commission ${commWorking(r, s)} · ${addWorking([k, comm(r, s)])}`),
      ask([900, 180, 90], (g, t, s) => `Net income: ${m(g)} gross, ${m(t)} tax, ${m(s)} super.`,
        (g, t, s) => `deductions ${addWorking([t, s])} · ${f(g)} − ${f(sum([t, s]))} = ${m(net(g, [t, s]))}`),
      ask([38, 25, 190], (h, r, t) => `Gross and net pay: ${h} hours at ${m(r)} an hour, ${m(t)} tax.`,
        (h, r, t) => `gross ${f(r)} × ${f(h)} = ${m(r * h)} · net ${f(r * h)} − ${f(t)} = ${m(net(r * h, [t]))}`),
    ]),
    hint: 'Commission = % as a decimal × sales (4.5% → 0.045) · Net income = gross income − deductions · Deductions: tax, super (superannuation), union fees.',
    rounds: [
      round('use a calculator to find the commission.', [[3, 1250], [2.5, 8000], [1.5, 24000], [6, 735], [12, 480], [3.5, 2600], [7.5, 940], [4, 1895]],
        ([r, s]) => `${pct(r)} of ${m(s)} sales`, ([r, s]) => m(comm(r, s))),
      round('find the gross income (retainer + commission).', [[300, 10, 2000], [250, 5, 4000], [400, 2, 6500], [500, 3, 1800], [350, 4, 2250], [200, 8, 1500], [450, 1.5, 12000], [320, 2.5, 3600]],
        ([k, r, s]) => `Retainer ${m(k)}<br>plus ${pct(r)} of ${m(s)}`, ([k, r, s]) => m(k + comm(r, s))),
      round('find the net income (gross income − deductions).', [[1200, 250, 110], [750, 120, 70], [1000, 215.5, 95], [820, 96.4, 78]],
        ([g, t, s]) => `Gross ${m(g)}. Tax ${m(t)}, super ${m(s)}.`, ([g, t, s]) => m(net(g, [t, s])), { cols: 2 }),
      problems('solve each problem. Show your working.', [
        ask([4.5, 790], (r, s) => `Pedro gets ${pct(r)} commission on sales of ${m(s)}. How much commission does Pedro get?`, (r, s) => commWorking(r, s)),
        ask([500, 2, 45000], (k, r, s) => `Alex gets a ${m(k)} retainer plus ${pct(r)} commission. Sales are ${m(s)}. Find Alex’s gross income.`,
          (k, r, s) => `commission ${commWorking(r, s)} · ${addWorking([k, comm(r, s)])}`),
        ask([1200, 230, 114, 15], (g, t, s, u) => `Jess earns ${m(g)}. Jess pays ${m(t)} tax, ${m(s)} super and ${m(u)} union fees. Find Jess’s net income.`,
          (g, t, s, u) => `deductions ${addWorking([t, s, u])} · ${f(g)} − ${f(sum([t, s, u]))} = ${m(net(g, [t, s, u]))}`),
        ask([36, 28.89, 142.59, 22.5], (h, r, t, s) => `Tranh works ${h} hours at ${m(r)} an hour. Tax ${m(t)}, super ${m(s)}. Find gross and net pay.`,
          (h, r, t, s) => `gross wage ${m(r * h)}, net pay ${m(net(r * h, [t, s]))}`),
      ]),
    ],
  },
};
