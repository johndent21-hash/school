// Chapter 12 Ratios, rates and time: mixed-practice questions (lib/mixed.js). Every question stands on its own.
const D = require('../../lib/diagrams');
const G = require('../../lib/graphs');
const { gcd, fmt, F } = require('../../lib/calc');

const N = (v, dp = 2) => fmt(v, dp);
const $ = (v) => `$${(+v).toFixed(2)}`;
const R = (a, b) => { const g = gcd(a, b); return `${a / g} : ${b / g}`; };
const R3 = (a, b, c) => { const g = gcd(gcd(a, b), c); return `${a / g} : ${b / g} : ${c / g}`; };
const NAMES = ['Ali', 'Mia', 'Zac', 'Lena', 'Kai', 'Ruby', 'Tom', 'Priya', 'Jack', 'Aisha', 'Noah', 'Chloe'];
const two = (K) => { const [a, b] = K.shuffle(NAMES); return [a, b]; };
// Times as minutes after midnight.
const pad = (n) => String(n).padStart(2, '0');
const t12 = (m) => { m = ((m % 1440) + 1440) % 1440; const h = Math.floor(m / 60), mm = m % 60; return `${h % 12 || 12}:${pad(mm)} ${h < 12 ? 'am' : 'pm'}`; };
const t24 = (m) => { m = ((m % 1440) + 1440) % 1440; return `${pad(Math.floor(m / 60))}${pad(m % 60)}`; };
const hm = (m) => `${Math.floor(m / 60) ? `${Math.floor(m / 60)} h ` : ''}${m % 60 ? `${m % 60} min` : ''}`.trim();
const STOPS = ['Station', 'Library', 'Hospital', 'Beach', 'Mall'];
const timetable = (starts, gaps) => { let rows = ''; let acc = 0; STOPS.forEach((s, i) => { if (i) acc += gaps[i - 1]; rows += `<tr><th>${s}</th>${starts.map((st) => `<td>${t24(st + acc)}</td>`).join('')}</tr>`; }); return `<table class="data-table">${rows}</table>`; };
// A travel graph: distance from home (km) at each hour.
const travel = (ys) => G.lineGraph({ title: 'A car trip', xs: ys.map((_, i) => `${i}`), ys, max: Math.ceil(Math.max(...ys) / 20) * 20, step: 10, labelEvery: 20, yTitle: 'Distance (km)', xTitle: 'Time (hours)', w: 64, h: 48 });
const trip = (K) => { const ys = [0]; const plan = [K.ri(4, 8) * 10, ...K.shuffle([K.ri(3, 7) * 10, 0, K.ri(2, 5) * 10])]; plan.forEach((d) => ys.push(ys[ys.length - 1] + d)); return ys; };

module.exports = {
  '12.01': {
    idea: 'A ratio compares quantities in a set order: 3 : 5 means 3 parts of the first to 5 parts of the second. The order matters. With 3 : 5, the first is 3/8 of the whole.',
    ex: [['A bag has 4 red and 7 blue counters. Write the ratio of red to blue.', ['red first', '4 : 7']], ['Write the ratio of shaded to unshaded squares.', ['3 shaded, 5 unshaded', '3 : 5'], D.squares({ n: 8, shaded: 3, size: 6 })], ['In a ratio of 3 : 5, what fraction is the first part?', ['3 + 5 = 8 parts', `${F(3, 8)}`]]],
    look: ['4.01'],
    e: [
      (K) => { const a = K.ri(2, 12), b = K.ri(2, 12); return a === b ? null : { q: `A class has ${a} boys and ${b} girls. Write the ratio of girls to boys.`, a: `${b} : ${a}` }; },
      (K) => { const n = K.ri(6, 10), s = K.ri(1, n - 1); return { q: 'Write the ratio of shaded to unshaded squares.', fig: D.squares({ n, shaded: s, size: 5 }), a: `${s} : ${n - s}` }; },
      (K) => { const a = K.ri(1, 9), b = K.ri(1, 9); return a === b ? null : { q: `In a ratio of ${a} : ${b}, what fraction is the first part?`, a: F(a, a + b) }; },
    ],
    m: [
      (K) => { const a = K.ri(2, 9), b = K.ri(2, 9), c = K.ri(2, 9); return { q: `A fruit bowl has ${a} apples, ${b} pears and ${c} plums. Write the ratio of plums to apples to pears.`, a: `${c} : ${a} : ${b}` }; },
      (K) => { const a = K.ri(3, 15), b = K.ri(3, 15); return a === b ? null : { q: `A team won ${a} games and lost ${b}. Write the ratio of wins to games played.`, w: [`games played: ${a + b}`, `${a} : ${a + b}`] }; },
    ],
    c: [
      (K) => { const a = K.ri(2, 5), b = K.ri(2, 5), k = K.ri(2, 6); return a === b ? null : { q: `Red and blue paint are mixed in the ratio ${a} : ${b}. What fraction of the mix is blue? How many litres of blue are in ${(a + b) * k} L?`, w: [`blue: ${F(b, a + b)}`, `${F(b, a + b)} × ${(a + b) * k} = ${b * k} L`] }; },
      (K) => { const [p, q] = two(K), a = K.ri(2, 9), b = K.ri(2, 9); return a === b ? null : { q: `${p} has ${a} pens and ${q} has ${b}. Is the ratio ${a} : ${b} the same as ${b} : ${a}? Explain.`, a: `No. The order matters: ${a} : ${b} compares ${p}'s to ${q}'s.`, n: 2 }; },
    ],
  },

  '12.02': {
    idea: 'Equivalent ratios: multiply or divide both parts by the same number. To simplify, divide both parts by their HCF. Change to the same units first, and remove decimals by multiplying.',
    ex: [['Simplify 12 : 18.', ['HCF is 6', '= 2 : 3']], ['Simplify 40 cm : 2 m.', ['2 m = 200 cm', '40 : 200 = 1 : 5']], ['Find the missing number: 3 : 4 = ☐ : 20.', ['4 × 5 = 20', '☐ = 3 × 5 = 15']]],
    look: ['12.01', '3.11'],
    e: [
      (K) => { const a = K.ri(1, 9), b = K.ri(1, 9), k = K.ri(2, 8); return a === b || gcd(a, b) > 1 ? null : { q: `Simplify ${a * k} : ${b * k}.`, a: `${a} : ${b}` }; },
      (K) => { const a = K.ri(1, 9), b = K.ri(1, 9), k = K.ri(2, 9); return a === b || gcd(a, b) > 1 ? null : { q: `Find the missing number: ${a} : ${b} = ☐ : ${b * k}.`, a: `☐ = ${a * k}` }; },
      (K) => { const a = K.ri(1, 9), b = K.ri(1, 9), k = K.ri(2, 5); return a === b ? null : { q: `Write two ratios equivalent to ${a} : ${b}.`, a: `e.g. ${a * 2} : ${b * 2} and ${a * k * 2} : ${b * k * 2}` }; },
    ],
    m: [
      (K) => { const a = K.ri(1, 9), b = K.ri(1, 9), k = K.pick([4, 6, 8, 9, 12, 15]); return a === b || gcd(a, b) > 1 ? null : { q: `Simplify ${a * k} : ${b * k}.`, w: [`HCF is ${k}`, `= ${a} : ${b}`] }; },
      (K) => { const [u, v, m] = K.pick([['cm', 'm', 100], ['g', 'kg', 1000], ['min', 'h', 60], ['mL', 'L', 1000]]); const big = K.ri(1, 3), small = K.pick([m / 10, m / 5, m / 4, m / 2]); return { q: `Simplify ${small} ${u} : ${big} ${v}.`, w: [`${big} ${v} = ${big * m} ${u}`, `${small} : ${big * m} = ${R(small, big * m)}`] }; },
      (K) => { const a = K.ri(1, 9), b = K.ri(1, 9); return a === b ? null : { q: `Simplify ${N(a / 2)} : ${N(b / 2)}.`, w: [`× 2: ${a} : ${b}`, `= ${R(a, b)}`] }; },
    ],
    c: [
      (K) => { const a = K.ri(1, 5), b = K.ri(1, 5), c = K.ri(1, 5), k = K.ri(2, 6); return new Set([a, b, c]).size < 3 ? null : { q: `Simplify ${a * k} : ${b * k} : ${c * k}.`, w: [`HCF is ${gcd(gcd(a * k, b * k), c * k)}`, `= ${R3(a * k, b * k, c * k)}`] }; },
      (K) => { const a = K.ri(1, 5), b = K.ri(2, 6); return a >= b || gcd(a, b) > 1 || b === 2 ? null : { q: `Simplify ${F(a, b)} : ${F(1, 2)}.`, w: [`× ${2 * b}: ${2 * a} : ${b}`, `= ${R(2 * a, b)}`] }; },
      (K) => { const a = K.ri(2, 9), b = K.ri(2, 9), k = K.ri(2, 5), who = K.pick(NAMES); return a === b ? null : { q: `${who} says ${a} : ${b} = ${a + k} : ${b + k} because you add the same to both. Is that right? Explain.`, a: `No. Multiply both parts by the same number: e.g. ${a * k} : ${b * k}.`, n: 2, key: `says ${K.ri(1, 2)}` }; },
    ],
  },

  '12.03': {
    idea: 'To share in a ratio, add the parts, find one part (total ÷ parts), then multiply. If you know one quantity, use it to find what one part is worth.',
    ex: [['Share $60 in the ratio 2 : 3.', ['5 parts: one part is $12', '$24 and $36']], ['Boys to girls is 4 : 5. There are 20 boys. How many girls?', ['one part: 20 ÷ 4 = 5', 'girls: 5 × 5 = 25']], ['Cordial and water are mixed 1 : 6. How much cordial for 2.1 L of drink?', ['7 parts: 2.1 ÷ 7 = 0.3', 'cordial: 0.3 L']]],
    look: ['12.02'],
    e: [
      (K) => { const a = K.ri(1, 5), b = K.ri(1, 5), p = K.ri(2, 10); return { q: `Share $${(a + b) * p} in the ratio ${a} : ${b}.`, a: `$${a * p} and $${b * p}` }; },
      (K) => { const a = K.ri(1, 5), b = K.ri(1, 5), p = K.ri(2, 8); return a === b ? null : { q: `Boys to girls is ${a} : ${b}. There are ${a * p} boys. How many girls?`, a: N(b * p) }; },
    ],
    m: [
      (K) => { const a = K.ri(1, 7), b = K.ri(1, 7), p = K.ri(5, 25); return { q: `Share ${(a + b) * p} lollies in the ratio ${a} : ${b}.`, w: [`${a + b} parts: one part = ${p}`, `${a * p} and ${b * p}`] }; },
      (K) => { const a = K.ri(1, 5), b = K.ri(3, 9), p = K.ri(2, 6); return a >= b ? null : { q: `Cordial and water are mixed ${a} : ${b}. How much water goes with ${a * p * 50} mL of cordial?`, w: [`one part: ${a * p * 50} ÷ ${a} = ${p * 50} mL`, `water: ${b} × ${p * 50} = ${b * p * 50} mL`] }; },
      (K) => { const [x, y] = two(K), a = K.ri(2, 5), b = K.ri(2, 5), p = K.ri(3, 10); return a === b ? null : { q: `${x} and ${y} share money in the ratio ${a} : ${b}. ${x} gets $${a * p}. How much does ${y} get?`, w: [`one part: $${p}`, `${y}: $${b * p}`] }; },
    ],
    c: [
      (K) => { const a = K.ri(1, 4), b = K.ri(1, 4), c = K.ri(1, 4), p = K.ri(3, 10); return { q: `Share $${(a + b + c) * p} in the ratio ${a} : ${b} : ${c}.`, w: [`${a + b + c} parts: one part = $${p}`, `$${a * p}, $${b * p}, $${c * p}`] }; },
      (K) => { const a = K.ri(2, 5), b = K.ri(2, 5), d = K.ri(2, 6); return a === b ? null : { q: `The ratio of boys to girls is ${a} : ${b}. There are ${Math.abs(a - b) * d} more ${a > b ? 'boys' : 'girls'} than ${a > b ? 'girls' : 'boys'}. How many students are there?`, w: [`difference: ${Math.abs(a - b)} part${Math.abs(a - b) > 1 ? 's' : ''} = ${Math.abs(a - b) * d}, one part = ${d}`, `total: ${a + b} × ${d} = ${(a + b) * d}`] }; },
      (K) => { const a = K.ri(2, 4), b = K.ri(5, 9), p = K.ri(2, 5); return { q: `A recipe uses flour and sugar in the ratio ${b} : ${a}. You have ${a * p * 100} g of sugar. How much flour do you need?`, w: [`one part: ${a * p * 100} ÷ ${a} = ${p * 100} g`, `flour: ${b} × ${p * 100} = ${b * p * 100} g`] }; },
    ],
  },

  '12.04': {
    idea: 'A rate compares two different kinds of quantity, such as km and hours. Write the units, then divide to find the rate for one unit: 240 km in 3 h is 80 km/h.',
    ex: [['A car travels 240 km in 3 hours. Find its speed.', ['240 km ÷ 3 h', '= 80 km/h']], ['4 kg of apples cost $12. Find the cost per kilogram.', ['$12 ÷ 4 kg', '= $3/kg']], ['A tap fills 90 L in 6 minutes. Write the rate in L/min.', ['90 ÷ 6', '= 15 L/min']]],
    look: ['12.02', '7.07'],
    e: [
      (K) => { const n = K.ri(2, 8), r = K.ri(40, 110); return { q: `A car travels ${n * r} km in ${n} hours. Find its speed.`, a: `${r} km/h` }; },
      (K) => { const n = K.ri(2, 9), p = K.ri(2, 9); return { q: `${n} kg of apples cost $${n * p}. Find the cost per kilogram.`, a: `$${p}/kg` }; },
      (K) => { const n = K.ri(2, 9), r = K.ri(5, 30); return { q: `A tap fills ${n * r} L in ${n} minutes. Write the rate in L/min.`, a: `${r} L/min` }; },
    ],
    m: [
      (K) => { const n = K.ri(3, 8), r = K.ri(12, 25); return { q: `${K.pick(NAMES)} earns $${n * r} for ${n} hours of work. Find the hourly rate.`, w: [`$${n * r} ÷ ${n} h`, `= $${r}/h`] }; },
      (K) => { const b = K.ri(60, 90), m = K.pick([2, 3, 4]); return { q: `A heart beats ${b * m} times in ${m} minutes. Find the rate in beats per minute.`, w: [`${b * m} ÷ ${m}`, `= ${b} beats/min`] }; },
      (K) => { const k = K.ri(3, 9), d = K.ri(20, 60) * 10; return { q: `A car uses ${k * d / 100} L of petrol for ${d} km. Write the rate in L per 100 km.`, w: [`${d} km = ${d / 100} × 100 km`, `${N(k * d / 100)} ÷ ${d / 100} = ${k} L/100 km`] }; },
    ],
    c: [
      (K) => { const s = K.ri(2, 6) * 10; return { q: `Change ${s} m/s to km/h.`, w: [`${s} m/s = ${s * 3600} m/h`, `= ${N(s * 3.6)} km/h`] }; },
      (K) => { const k = K.ri(60, 108); return k % 18 ? null : { q: `Change ${k} km/h to m/s.`, w: [`${k} km/h = ${k * 1000} m in 3600 s`, `= ${(k * 10) / 36} m/s`] }; },
      (K) => { const c = K.ri(3, 9), g = K.pick([200, 250, 500]); return { q: `${g} g of cheese costs $${N(c, 2)}. Find the cost per kilogram.`, w: [`1 kg = ${1000 / g} × ${g} g`, `$${N(c)} × ${N(1000 / g)} = ${$(c * (1000 / g))}/kg`] }; },
    ],
  },

  '12.05': {
    idea: 'To find the best buy, find the unit price of each (the cost for 1 g, 100 g or 1 item), then compare. The lowest unit price is the best value.',
    ex: [['500 g for $4 or 750 g for $5.25. Which is the better buy?', ['$0.80 per 100 g and $0.70 per 100 g', '750 g for $5.25']], ['Find the cost of 1 pen when 6 pens cost $4.50.', ['$4.50 ÷ 6', '= $0.75']], ['A 2 L milk is $3.60 and a 3 L milk is $5.10. Which is better value?', ['$1.80/L and $1.70/L', 'the 3 L']]],
    look: ['12.04', '7.08'],
    e: [
      (K) => { const n = K.pick([4, 5, 6, 8, 10]), p = K.ri(15, 95) / 100; return { q: `${n} pens cost ${$(n * p)}. Find the cost of 1 pen.`, a: $(p) }; },
      (K) => { const a = K.ri(2, 6), b = a + K.ri(1, 4), pa = K.ri(2, 6), pb = pa + K.pick([-1, 1]) * 0.5; return { q: `${a} kg costs ${$(a * pa)} or ${b} kg costs ${$(b * pb)}. Find the price per kg of each.`, a: `${$(pa)}/kg and ${$(pb)}/kg` }; },
    ],
    m: [
      (K) => { const p1 = K.ri(60, 99) / 100, p2 = p1 + K.pick([-1, 1]) * K.ri(3, 10) / 100; const [g1, g2] = K.pick([[500, 750], [400, 600], [250, 1000], [300, 500]]); return { q: `${g1} g for ${$(p1 * g1 / 100)} or ${g2} g for ${$(p2 * g2 / 100)}. Which is the better buy?`, w: [`${$(p1)} per 100 g and ${$(p2)} per 100 g`, `${p1 < p2 ? g1 : g2} g is better`] }; },
      (K) => { const l1 = K.pick([1, 2]), l2 = l1 + K.pick([1, 2]), p1 = K.ri(150, 250) / 100, p2 = p1 - K.ri(5, 30) / 100; return { q: `A ${l1} L bottle costs ${$(l1 * p1)} and a ${l2} L bottle costs ${$(l2 * p2)}. Which is better value?`, w: [`${$(p1)}/L and ${$(p2)}/L`, `the ${l2} L bottle`] }; },
    ],
    c: [
      (K) => { const p = K.ri(2, 5), n = K.pick([3, 4, 5]); return { q: `Muffins are $${p} each, or ${n} for $${p * n - 1}. How much do you save on ${n * 2} muffins with the deal?`, w: [`single: ${n * 2} × $${p} = $${2 * n * p}`, `deal: 2 × $${p * n - 1} = $${2 * (p * n - 1)}; save $2`] }; },
      (K) => { const a = K.ri(3, 6), b = a * 2, pa = K.ri(30, 60) / 10, pb = pa * 2 - K.pick([0.1, 0.2, -0.2]); return { q: `A ${a}-pack costs ${$(pa)} and a ${b}-pack costs ${$(pb)}. Which is better value? Explain.`, w: [`two ${a}-packs: ${$(2 * pa)}`, pb < 2 * pa ? `the ${b}-pack (cheaper per item)` : `the ${a}-pack (cheaper per item)`] }; },
    ],
  },

  '12.06': {
    idea: 'Use the rate to work out the rest: distance = speed × time, and time = distance ÷ speed. Cost = rate × amount. Keep the units the same.',
    ex: [['A car travels at 80 km/h for 3 hours. How far does it go?', ['80 × 3', '= 240 km']], ['How long does 150 km take at 60 km/h?', ['150 ÷ 60 = 2.5', '= 2 h 30 min']], ['Petrol is $1.90/L. Find the cost of 40 L.', ['1.90 × 40', '= $76']]],
    look: ['12.04'],
    e: [
      (K) => { const s = K.ri(40, 100), t = K.ri(2, 6); return { q: `A car travels at ${s} km/h for ${t} hours. How far does it go?`, a: `${s * t} km` }; },
      (K) => { const p = K.ri(150, 220) / 100, l = K.ri(20, 60); return { q: `Petrol is ${$(p)} a litre. Find the cost of ${l} L.`, a: $(p * l) }; },
      (K) => { const r = K.ri(12, 30), h = K.ri(3, 8); return { q: `${K.pick(NAMES)} earns $${r} an hour. How much is earned in ${h} hours?`, a: `$${r * h}` }; },
    ],
    m: [
      (K) => { const s = K.pick([40, 50, 60, 80, 100]), t = K.pick([1.5, 2.5, 3, 4, 0.5]); return { q: `How long does a ${s * t} km trip take at ${s} km/h?`, w: [`${s * t} ÷ ${s} = ${N(t)}`, `= ${hm(t * 60)}`] }; },
      (K) => { const r = K.ri(10, 25), m = K.ri(4, 12); return { q: `A tap runs at ${r} L/min. How long does it take to fill a ${r * m} L tank?`, w: [`${r * m} ÷ ${r}`, `= ${m} minutes`] }; },
      (K) => { const s = K.ri(4, 9) * 4, t = K.pick([15, 20, 30, 45]); return { q: `A cyclist rides at ${s} km/h for ${t} minutes. How far is that?`, w: [`${t} min = ${F(t, 60)} h = ${N(t / 60)} h`, `${s} × ${N(t / 60)} = ${N((s * t) / 60)} km`] }; },
    ],
    c: [
      (K) => { const s1 = K.ri(50, 70), t1 = K.ri(2, 3), s2 = K.ri(80, 100), t2 = K.ri(1, 2); return { q: `A car goes ${s1} km/h for ${t1} h, then ${s2} km/h for ${t2} h. Find the total distance and the average speed.`, w: [`${s1 * t1} + ${s2 * t2} = ${s1 * t1 + s2 * t2} km`, `${s1 * t1 + s2 * t2} ÷ ${t1 + t2} = ${N((s1 * t1 + s2 * t2) / (t1 + t2), 1)} km/h`] }; },
      (K) => { const c = K.ri(6, 9), d = K.ri(30, 60) * 10, p = K.ri(180, 210) / 100; return { q: `A car uses ${c} L per 100 km. Petrol costs ${$(p)}/L. Find the petrol cost for a ${d} km trip.`, w: [`petrol: ${c} × ${d / 100} = ${N((c * d) / 100)} L`, `cost: ${N((c * d) / 100)} × ${N(p)} = ${$(((c * d) / 100) * p)}`] }; },
    ],
  },

  '12.07': {
    idea: 'A travel graph shows distance against time. A steeper line is faster; a flat line means stopped. Speed = distance travelled ÷ time taken for that part.',
    ex: [['How far from home is the car after 2 hours?', ['read up from 2 h', '120 km'], travel([0, 70, 120, 120, 160])], ['When did the car stop? For how long?', ['flat part: 2 h to 3 h', '1 hour']], ['Find the speed in the first hour.', ['70 km in 1 h', '70 km/h']]],
    exFh: 34, exH: 72,
    look: ['12.06', '10.01'],
    e: [
      (K) => { const ys = trip(K), i = K.ri(1, 4); return { q: `How far from home is the car after ${i} hour${i > 1 ? 's' : ''}?`, fig: travel(ys), fh: 36, a: `${ys[i]} km` }; },
      (K) => { const ys = trip(K); const i = ys.findIndex((y, k) => k > 0 && y === ys[k - 1]); return { q: 'During which hour did the car stop?', fig: travel(ys), fh: 36, a: `from ${i - 1} h to ${i} h` }; },
    ],
    m: [
      (K) => { const ys = trip(K), i = K.ri(1, 4); return ys[i] === ys[i - 1] ? null : { q: `Find the speed between ${i - 1} h and ${i} h.`, fig: travel(ys), fh: 36, w: [`${ys[i]} − ${ys[i - 1]} = ${ys[i] - ys[i - 1]} km in 1 h`, `${ys[i] - ys[i - 1]} km/h`] }; },
      (K) => { const ys = trip(K); const d = ys.map((y, i) => (i ? y - ys[i - 1] : -1)); const i = d.indexOf(Math.max(...d)); return { q: 'In which hour was the car fastest? How can you tell?', fig: travel(ys), fh: 36, w: [`steepest part: ${i - 1} h to ${i} h`, `${d[i]} km in that hour`] }; },
    ],
    c: [
      (K) => { const ys = trip(K); return { q: 'Find the average speed for the whole trip.', fig: travel(ys), fh: 36, w: [`${ys[4]} km in 4 h`, `${ys[4]} ÷ 4 = ${N(ys[4] / 4, 1)} km/h`] }; },
      (K) => { const ys = trip(K); const t = ys.findIndex((y) => y >= ys[4] / 2); return { q: `About when was the car halfway (${ys[4] / 2} km)?`, fig: travel(ys), fh: 36, w: [`read across from ${ys[4] / 2} km`, `between ${t - 1} h and ${t} h`] }; },
    ],
  },

  '12.08': {
    idea: '1 hour = 60 minutes and 1 minute = 60 seconds, so time is not a decimal system: 1.5 h is 1 h 30 min. To add or subtract times, work in hours and minutes, carrying 60 minutes as 1 hour.',
    ex: [['Change 2.25 hours to hours and minutes.', ['0.25 × 60 = 15', '2 h 15 min']], ['Add 2 h 45 min and 1 h 30 min.', ['3 h 75 min', '= 4 h 15 min']], ['Change 200 minutes to hours and minutes.', ['200 ÷ 60 = 3 r 20', '3 h 20 min']]],
    look: ['8.01'],
    e: [
      (K) => { const h = K.ri(1, 6); return { q: `How many minutes are in ${h} hour${h > 1 ? 's' : ''}?`, a: `${h * 60} min` }; },
      (K) => { const m = K.ri(65, 300); return m % 60 === 0 ? null : { q: `Change ${m} minutes to hours and minutes.`, a: hm(m) }; },
      (K) => { const h = K.ri(1, 5), f = K.pick([0.25, 0.5, 0.75, 0.1, 0.2]); return { q: `Change ${N(h + f)} hours to hours and minutes.`, a: hm(Math.round((h + f) * 60)) }; },
    ],
    m: [
      (K) => { const a = K.ri(15, 200), b = K.ri(15, 200); return { q: `Add ${hm(a)} and ${hm(b)}.`, w: [`${Math.floor(a / 60) + Math.floor(b / 60)} h ${(a % 60) + (b % 60)} min`, `= ${hm(a + b)}`] }; },
      (K) => { const a = K.ri(150, 400), b = K.ri(30, 140); return { q: `Subtract: ${hm(a)} − ${hm(b)}.`, w: ['change to minutes if needed', `= ${hm(a - b)}`] }; },
      (K) => { const m = K.ri(1, 59), h = K.ri(1, 4); return { q: `Write ${h} h ${m} min in hours, as a decimal (2 decimal places).`, w: [`${m} ÷ 60 ≈ ${N(m / 60)}`, `≈ ${N(h + m / 60)} h`] }; },
    ],
    c: [
      (K) => { const s = K.ri(100, 900); return { q: `Change ${s} seconds to minutes and seconds.`, w: [`${s} ÷ 60 = ${Math.floor(s / 60)} r ${s % 60}`, `${Math.floor(s / 60)} min ${s % 60} s`] }; },
      (K) => { const n = K.ri(3, 6), m = K.ri(25, 50); return { q: `${n} lessons each last ${m} minutes. How long is that in hours and minutes?`, w: [`${n} × ${m} = ${n * m} min`, `= ${hm(n * m)}`] }; },
      (K) => { const who = K.pick(NAMES), h = K.ri(1, 4); return { q: `${who} says ${h}.5 hours is ${h} h 50 min. Is that right? Explain.`, a: `No. 0.5 h is half of 60 min = 30 min, so ${h} h 30 min.`, n: 2, key: `says ${K.ri(1, 2)}` }; },
    ],
  },

  '12.09': {
    idea: '24-hour time counts the hours from midnight, so it needs no am or pm: 3:45 pm is 1545. For a pm time from 1 pm, add 12 to the hour. Midnight is 0000.',
    ex: [['Write 3:45 pm in 24-hour time.', ['3 + 12 = 15', '1545']], ['Write 0820 in 12-hour time.', ['before noon', '8:20 am']], ['Write 2310 in 12-hour time.', ['23 − 12 = 11', '11:10 pm']]],
    look: ['12.08'],
    e: [
      (K) => { const m = K.ri(1, 23) * 60 + K.pick([0, 5, 15, 30, 45, 50]); return { q: `Write ${t12(m)} in 24-hour time.`, a: t24(m) }; },
      (K) => { const m = K.ri(0, 23) * 60 + K.pick([0, 10, 20, 35, 40, 55]); return { q: `Write ${t24(m)} in 12-hour time.`, a: t12(m) }; },
    ],
    m: [
      (K) => { const m = K.ri(13, 23) * 60 + K.ri(0, 59); return { q: `Write ${t24(m)} in 12-hour time.`, w: [`${Math.floor(m / 60)} − 12 = ${Math.floor(m / 60) - 12}`, t12(m)] }; },
      (K) => { const m = K.ri(0, 23) * 60 + K.ri(0, 59), d = K.ri(30, 200); return { q: `A train leaves at ${t24(m)} and the trip takes ${hm(d)}. When does it arrive? Use 24-hour time.`, w: [`${t24(m)} + ${hm(d)}`, t24(m + d)] }; },
    ],
    c: [
      (K) => { const a = K.ri(6, 11) * 60 + K.ri(0, 59), b = K.ri(13, 22) * 60 + K.ri(0, 59); return { q: `How long is it from ${t24(a)} to ${t24(b)}?`, w: [`${t12(a)} to ${t12(b)}`, hm(b - a)] }; },
      (K) => { const m = K.ri(21, 23) * 60 + K.ri(0, 59), d = K.ri(90, 240); return { q: `A flight leaves at ${t24(m)} and takes ${hm(d)}. When does it land, in 12-hour time?`, w: [`${t24(m)} + ${hm(d)} = ${t24(m + d)} (next day)`, t12(m + d)] }; },
    ],
  },

  '12.10': {
    idea: 'To find a time difference, count on: up to the next hour, then whole hours, then the minutes left. For ages, subtract the birth year (one less if the birthday has not come yet this year).',
    ex: [['How long is it from 9:40 am to 2:15 pm?', ['9:40 → 10:00: 20 min, → 2:00: 4 h', '+ 15 min = 4 h 35 min']], ['Someone was born in 2013. How old are they on their birthday in 2026?', ['2026 − 2013', '13']], ['A film starts at 7:25 pm and runs 1 h 50 min. When does it end?', ['7:25 + 1 h = 8:25', '+ 50 min = 9:15 pm']]],
    look: ['12.09', '12.08'],
    e: [
      (K) => { const a = K.ri(7, 11) * 60 + K.pick([0, 15, 30, 45]), d = K.ri(1, 5) * 60 + K.pick([0, 15, 30, 45]); return { q: `How long is it from ${t12(a)} to ${t12(a + d)}?`, a: hm(d) }; },
      (K) => { const y = K.ri(2008, 2016); return { q: `Someone was born in ${y}. How old are they on their birthday in 2026?`, a: `${2026 - y}` }; },
    ],
    m: [
      (K) => { const a = K.ri(8, 11) * 60 + K.ri(1, 59), d = K.ri(120, 400); return { q: `How long is it from ${t12(a)} to ${t12(a + d)}?`, w: [`count on to ${t12(Math.ceil(a / 60) * 60)}: ${Math.ceil(a / 60) * 60 - a} min`, `total: ${hm(d)}`] }; },
      (K) => { const a = K.ri(17, 20) * 60 + K.pick([5, 25, 40, 55]), d = K.ri(80, 150); return { q: `A film starts at ${t12(a)} and runs ${hm(d)}. When does it end?`, w: [`${t12(a)} + ${hm(d)}`, t12(a + d)] }; },
    ],
    c: [
      (K) => { const y = K.ri(1940, 1990), m = K.pick(['March', 'July', 'November']); return { q: `Someone was born in ${m} ${y}. How old are they in June 2026?`, w: [`2026 − ${y} = ${2026 - y}`, m === 'March' ? `${2026 - y} (birthday has passed)` : `${2025 - y} (birthday not yet)`] }; },
      (K) => { const a = K.ri(20, 23) * 60 + K.pick([0, 15, 30, 45]), b = K.ri(5, 8) * 60 + K.pick([0, 15, 30]); return { q: `${K.pick(NAMES)} goes to sleep at ${t12(a)} and wakes at ${t12(b)}. How long is that?`, w: [`to midnight: ${hm(1440 - a)}`, `+ ${hm(b)} = ${hm(1440 - a + b)}`] }; },
    ],
  },

  '12.11': {
    idea: 'Read a timetable down a column for one trip and across a row for one stop. Find the first time you can catch, then count on to find how long a trip takes.',
    ex: [['When does the first bus reach the Beach?', ['first column, Beach row', '0736'], timetable([420, 465, 510], [12, 8, 16, 9])], ['How long does the bus take from the Station to the Mall?', ['0700 to 0745', '45 minutes']], ['You get to the Library at 0730. When is the next bus to the Mall, and when does it arrive?', ['0757 from the Library', 'arrives 0830']]],
    exFh: 30, exH: 70,
    look: ['12.10', '12.09'],
    e: [
      (K) => { const st = [K.ri(6, 8) * 60 + K.pick([0, 15]), 0, 0]; st[1] = st[0] + 45; st[2] = st[1] + 45; const g = [K.ri(6, 14), K.ri(6, 14), K.ri(6, 14), K.ri(6, 14)], k = K.ri(1, 4), c = K.ri(0, 2); const acc = g.slice(0, k).reduce((a, b) => a + b, 0); return { q: `When does the ${['first', 'second', 'third'][c]} bus reach the ${STOPS[k]}?`, fig: timetable(st, g), a: t24(st[c] + acc) }; },
    ],
    m: [
      (K) => { const st = [K.ri(6, 8) * 60 + K.pick([0, 15]), 0, 0]; st[1] = st[0] + 45; st[2] = st[1] + 45; const g = [K.ri(6, 14), K.ri(6, 14), K.ri(6, 14), K.ri(6, 14)]; const a = K.ri(0, 2), b = K.ri(a + 2, 4); const t = g.slice(a, b).reduce((x, y) => x + y, 0); return { q: `How long does the bus take from the ${STOPS[a]} to the ${STOPS[b]}?`, fig: timetable(st, g), w: [`count on from one time to the other`, `${t} minutes`] }; },
    ],
    c: [
      (K) => { const st = [K.ri(6, 8) * 60 + K.pick([0, 15]), 0, 0]; st[1] = st[0] + 45; st[2] = st[1] + 45; const g = [K.ri(6, 14), K.ri(6, 14), K.ri(6, 14), K.ri(6, 14)]; const arr = st[0] + g[0] + 5; const next = st.find((s) => s + g[0] >= arr); return !next ? null : { q: `You get to the Library at ${t24(arr)}. When does the next bus leave there, and when does it reach the Mall?`, fig: timetable(st, g), w: [`next bus at the Library: ${t24(next + g[0])}`, `reaches the Mall at ${t24(next + g.reduce((a, b) => a + b, 0))}`] }; },
      (K) => { const st = [K.ri(6, 8) * 60 + K.pick([0, 15]), 0, 0]; st[1] = st[0] + 45; st[2] = st[1] + 45; const g = [K.ri(6, 14), K.ri(6, 14), K.ri(6, 14), K.ri(6, 14)]; const need = st[1] + g.reduce((a, b) => a + b, 0) + K.ri(1, 30); return { q: `You must be at the Mall by ${t24(need)}. Which bus should you catch from the Station?`, fig: timetable(st, g), w: [`arrivals at the Mall: ${st.map((s) => t24(s + g.reduce((a, b) => a + b, 0))).join(', ')}`, `the ${t24(st[need >= st[2] + g.reduce((a, b) => a + b, 0) ? 2 : 1])} bus`] }; },
    ],
  },
};
