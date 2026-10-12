// Lesson 1.4 Wages and overtime (two pages: Easy, then Medium). See lib/lesson-two.js for the fields.
const { fmt, money, round, problems } = require('../helpers');

const FORTNIGHT = 2; // weeks in a fortnight
const YEAR = 52; // weeks in a year
const HALF = 1.5; // time and a half
const DOUBLE = 2; // double time
const OT = 4; // overtime hours in Medium Round 2
const rateName = (k) => (k === HALF ? 'time and a half' : 'double time');
// Total pay for n normal hours at r an hour, plus h overtime hours at k × r.
const normal = (r, n) => r * n;
const over = (r, k, h) => k * r * h;
const totalWorking = (r, n, k, h) => `${money(normal(r, n))} + ${money(over(r, k, h))} = ${money(normal(r, n) + over(r, k, h))}`;
// One question and its answer, both made from the same numbers (as in 1.3): ask([30, 6], (r, h) => question, (r, h) => answer)
const ask = (v, q, a) => [q(...v), a(...v)];
const example = (stem, list) => ({ ex: { stem, parts: list.map((x) => x[0]) }, exAns: list.map((x) => x[1]) });
// Medium example: Ari's hourly rate, and the overtime hours in parts c and d (part d reuses part c's overtime pay).
const ARI = 20;
const ARI_OT = 4;

module.exports = {
  code: '1.4', title: 'Wages and overtime',
  li: 'work out pay from an hourly rate or a yearly salary, and add on overtime pay.',
  sc: ['find the pay for some hours of work', 'change pay between weekly, fortnightly and yearly', 'work out overtime pay, and the total pay'],
  easy: {
    ...example(`Pay = hourly rate × hours. 1 fortnight = ${FORTNIGHT} weeks. 1 year = ${YEAR} weeks.`, [
      ask([20, 8], (r, h) => `${money(r)} an hour for ${h} hours. Find the pay.`, (r, h) => `${fmt(r)} × ${fmt(h)} = ${money(normal(r, h))}`),
      ask([600], (w) => `${money(w)} a week. Find the pay for a fortnight.`, (w) => `${fmt(w)} × ${FORTNIGHT} = ${money(w * FORTNIGHT)}`),
      ask([600], (w) => `${money(w)} a week. Find the pay for a year.`, (w) => `${fmt(w)} × ${YEAR} = ${money(w * YEAR)}`),
      ask([52000], (s) => `${money(s)} a year. Find the pay for a week.`, (s) => `${fmt(s)} ÷ ${YEAR} = ${money(s / YEAR)}`),
    ]),
    hint: 'Pay = hourly rate × hours · Week to fortnight: × 2 · Week to year: × 52 · Year to week: ÷ 52.',
    rounds: [
      round('find the pay (hourly rate × hours).', [[20, 5], [25, 6], [18, 10], [30, 7], [20, 38], [15, 8], [25, 40], [24, 10]], ([r, h]) => `${money(r)} an hour<br>for ${h} hours`, ([r, h]) => money(r * h)),
      round('find the pay for a fortnight (weekly pay × 2).', [400, 550, 600, 750, 900, 1000, 820, 1250], (w) => `${money(w)} a week`, (w) => money(w * FORTNIGHT)),
      round('find the pay for a year (weekly pay × 52).', [100, 500, 1000, 200, 600, 800, 300, 750], (w) => `${money(w)} a week`, (w) => money(w * YEAR)),
      round('find the pay for a week (yearly salary ÷ 52).', [52000, 26000, 104000, 78000, 65000, 39000, 57200, 91000], (s) => `${money(s)} a year`, (s) => money(s / YEAR)),
    ],
  },
  medium: {
    ...example(`Ari earns ${money(ARI)} an hour. Find Ari’s pay for each part.`, [
      ask([HALF], (k) => `1 hour at ${rateName(k)} (× ${fmt(k)})`, (k) => `${fmt(k)} × ${fmt(ARI)} = ${money(k * ARI)} an hour`),
      ask([DOUBLE], (k) => `1 hour at ${rateName(k)} (× ${fmt(k)})`, (k) => `${fmt(k)} × ${fmt(ARI)} = ${money(k * ARI)} an hour`),
      ask([ARI_OT], (h) => `${h} hours at ${rateName(HALF)}`, (h) => `${fmt(HALF * ARI)} × ${fmt(h)} = ${money(over(ARI, HALF, h))}`),
      ask([38, ARI_OT], (n, h) => `${n} hours at ${money(ARI)} + ${h} hours at ${rateName(HALF)}`,
        (n, h) => `normal pay ${fmt(ARI)} × ${fmt(n)} = ${money(normal(ARI, n))} · overtime ${money(over(ARI, HALF, h))} (part c) · total ${totalWorking(ARI, n, HALF, h)}`),
    ]),
    hint: 'Time and a half = 1.5 × rate · Double time = 2 × rate · Total pay = normal pay + overtime pay.',
    rounds: [
      // One-line items ('$20, time and a half', as 1.3's '$48, mark-up 25%') leave room for the working boxes in Round 4.
      round('find the pay for 1 hour of overtime. Rates are per hour.', [[20, HALF], [20, DOUBLE], [30, HALF], [17, DOUBLE], [24, HALF], [25, DOUBLE], [16, HALF], [25, HALF]],
        ([r, k]) => `${money(r)}, ${rateName(k)}`, ([r, k]) => money(k * r)),
      round(`find the pay for ${OT} hours of overtime. Rates are per hour.`, [[20, HALF], [30, DOUBLE], [16, HALF], [25, DOUBLE], [24, HALF], [35, DOUBLE], [22, HALF], [40, DOUBLE]],
        ([r, k]) => `${money(r)}, ${rateName(k)}`, ([r, k]) => money(over(r, k, OT))),
      round('find the total pay (normal pay + overtime pay). Rates are per hour.', [[25, 38, HALF, 2], [30, 35, DOUBLE, 3], [20, 40, HALF, 6], [18, 30, DOUBLE, 5]],
        ([r, n, k, h]) => `${n} hours at ${money(r)} + ${h} hours at ${rateName(k)}`, ([r, n, k, h]) => totalWorking(r, n, k, h), { cols: 2 }),
      problems('solve each problem. Show your working.', [
        ask([30, 15.78], (h, r) => `Lee works ${h} hours at ${money(r)} an hour. What is Lee’s gross income (total pay)?`, (h, r) => money(normal(r, h))),
        ask([30, 6], (r, h) => `Jo earns ${money(r)} an hour. Jo works ${h} hours at double time. Find Jo’s pay.`, (r, h) => money(over(r, DOUBLE, h))),
        ask([24, 38, 5], (r, n, h) => `Mia earns ${money(r)} an hour. One week, Mia works ${n} normal hours and ${h} hours at time and a half. Find Mia’s total pay.`,
          (r, n, h) => totalWorking(r, n, HALF, h)),
        ask([3, 5, 8, 21.2, 33.56], (d, n, h, dr, nr) => `Bill works ${d} day shifts and ${n} night shifts of ${h} hours. Day shifts pay ${money(dr)} an hour. Night shifts pay ${money(nr)} an hour. Find Bill’s total pay.`,
          (d, n, h, dr, nr) => `day ${money(d * h * dr)} + night ${money(n * h * nr)} = ${money(d * h * dr + n * h * nr)}`),
      ]),
    ],
  },
};
