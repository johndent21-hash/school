// Chapter 3 Whole numbers: mixed-practice questions (lib/mixed.js). Every question stands on its own.
const { gcd } = require('../../lib/calc');
const { N } = require('../../lib/drill');

const sup = (p) => `<sup>${p}</sup>`;
const RN = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
const roman = (n) => RN.reduce((s, [v, r]) => { while (n >= v) { s += r; n -= v; } return s; }, '');
// Place-value parts of a number: 2026 → [2000, 20, 6].
const parts = (n) => String(n).split('').map((d, i, a) => +d * 10 ** (a.length - 1 - i)).filter(Boolean);
const isPrime = (n) => { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };
const factors = (n) => { const f = []; for (let d = 1; d <= n; d++) if (n % d === 0) f.push(d); return f; };
const pairs = (n) => factors(n).filter((d) => d * d <= n).map((d) => `${d} × ${n / d}`);
const primeList = (n) => { const f = []; for (let d = 2; n > 1; d++) while (n % d === 0) { f.push(d); n /= d; } return f; };
const index = (n) => { const m = new Map(); primeList(n).forEach((p) => m.set(p, (m.get(p) || 0) + 1)); return [...m].map(([p, k]) => (k > 1 ? `${p}${sup(k)}` : `${p}`)).join(' × '); };
const lcm = (a, b) => (a * b) / gcd(a, b);
const roundTo = (n, to) => Math.round(n / to) * to;
const lead = (n) => { const p = 10 ** (String(n).length - 1); return roundTo(n, p); };
const digitSum = (n) => [...String(n)].reduce((t, c) => t + +c, 0);
const PLACE = { 10: 'ten', 100: 'hundred', 1000: 'thousand' };
const multiples = (n, k) => Array.from({ length: k }, (_, i) => n * (i + 1));

module.exports = {
  '3.01': {
    idea: 'To round, look at the digit to the right of the place you are rounding to: 5 or more, round up; 4 or less, round down. To estimate, round each number to its first digit, then work it out.',
    ex: [['Round 6 482 to the nearest hundred.', ['hundreds digit 4, next digit 8: round up', '≈ 6 500']], ['Estimate 389 × 52.', ['≈ 400 × 50', '≈ 20 000']], ['27 students each pay $48. Estimate the total.', ['≈ 30 × 50', '≈ $1 500']]],
    e: [
      ({ ri, pick }) => { const to = pick([10, 100, 1000]), n = ri(to + 1, to * 99); return n % to === 0 ? null : { q: `Round ${N(n)} to the nearest ${PLACE[to]}.`, a: N(roundTo(n, to)) }; },
      ({ ri }) => { const n = ri(12, 98) * 10 ** ri(0, 2) + ri(0, 9); return { q: `Round ${N(n)} to its first digit.`, a: N(lead(n)) }; },
      ({ ri }) => { const t = ri(2, 8), n = t * 1000 + ri(101, 899); return n % 1000 === 500 ? null : { q: `Is ${N(n)} closer to ${N(t * 1000)} or ${N(t * 1000 + 1000)}?`, a: N(roundTo(n, 1000)) }; },
    ],
    m: [
      ({ ri, pick }) => { const a = ri(12, 98) * pick([1, 10]), b = ri(12, 98), op = pick(['+', '×']); const ea = lead(a), eb = lead(b); return { q: `Estimate ${N(a)} ${op} ${b}.`, w: [`≈ ${N(ea)} ${op} ${N(eb)}`, `≈ ${N(op === '+' ? ea + eb : ea * eb)}`] }; },
      ({ ri }) => { const dv = ri(2, 9) * 10 + ri(-3, 3), a = ri(2, 9) * 1000 + ri(-240, 240); return { q: `Estimate ${N(a)} ÷ ${dv}.`, w: [`≈ ${N(lead(a))} ÷ ${lead(dv)}`, `≈ ${N(Math.round(lead(a) / lead(dv)))}`] }; },
      ({ ri }) => { const n = ri(10001, 98999); return n % 1000 === 500 ? null : { q: `Round ${N(n)} to the nearest thousand.`, a: N(roundTo(n, 1000)) }; },
      ({ ri }) => { const a = ri(5100, 9400), b = ri(1100, 4900); return { q: `Estimate ${N(a)} − ${N(b)}.`, w: [`≈ ${N(lead(a))} − ${N(lead(b))}`, `≈ ${N(lead(a) - lead(b))}`] }; },
    ],
    c: [
      ({ ri }) => { const n = ri(21, 48), c = ri(11, 49); return { q: `${n} students each pay $${c} for an excursion. Estimate the total cost.`, w: [`≈ ${lead(n)} × ${lead(c)}`, `≈ $${N(lead(n) * lead(c))}`] }; },
      ({ ri }) => { const t = ri(310, 890), p = ri(21, 39); return { q: `${N(t)} people travel in ${p} buses. About how many are on each bus?`, w: [`≈ ${N(lead(t))} ÷ ${lead(p)}`, `≈ ${N(Math.round(lead(t) / lead(p)))}`] }; },
      ({ ri, pick }) => { const a = ri(310, 790), b = ri(12, 29), wrong = a * b * 10, who = pick(['Ali', 'Mia', 'Kai', 'Ruby']); return { q: `${who} says ${a} × ${b} = ${N(wrong)}. Use an estimate to check. Is it reasonable?`, w: [`≈ ${lead(a)} × ${lead(b)} = ${N(lead(a) * lead(b))}`, `No: about 10 times too big (${N(a * b)})`], key: 'check' }; },
      ({ pick }) => { const h = pick([3, 4, 5, 6, 7, 8]) * 100; return pick([0, 1]) ? { q: `What is the smallest whole number that rounds to ${h} (to the nearest hundred)?`, a: N(h - 50) } : { q: `What is the largest whole number that rounds to ${h} (to the nearest hundred)?`, a: N(h + 49) }; },
    ],
  },

  '3.02': {
    idea: 'Split a number to multiply in your head: 34 × 6 = 30 × 6 + 4 × 6. For bigger numbers, multiply by each part of the second number, then add.',
    ex: [['34 × 6', ['= 30 × 6 + 4 × 6', '= 180 + 24', '= 204']], ['56 × 300', ['= 56 × 3 × 100', '= 168 × 100 = 16 800']], ['243 × 17', ['243 × 10 = 2 430', '243 × 7 = 1 701', '2 430 + 1 701 = 4 131']]],
    look: ['3.01'],
    e: [
      ({ ri }) => { const a = ri(6, 12), b = ri(6, 12); return { q: `${a} × ${b}`, a: N(a * b) }; },
      ({ ri, pick }) => { const a = ri(3, 99), p = pick([10, 100, 1000]); return { q: `${a} × ${N(p)}`, a: N(a * p) }; },
      ({ ri }) => { const a = ri(2, 9) * 10, b = ri(3, 9); return { q: `${a} × ${b}`, a: N(a * b) }; },
      ({ ri }) => { const a = ri(12, 49), b = ri(3, 9); return a % 10 === 0 ? null : { q: `${a} × ${b}`, w: [`= ${a - (a % 10)} × ${b} + ${a % 10} × ${b}`, `= ${(a - (a % 10)) * b} + ${(a % 10) * b}`, `= ${N(a * b)}`] }; },
    ],
    m: [
      ({ ri }) => { const a = ri(51, 98), b = ri(3, 9); return a % 10 === 0 ? null : { q: `${a} × ${b}`, w: [`= ${a - (a % 10)} × ${b} + ${a % 10} × ${b}`, `= ${(a - (a % 10)) * b} + ${(a % 10) * b}`, `= ${N(a * b)}`] }; },
      ({ ri }) => { const a = ri(112, 489), b = ri(3, 9); return { q: `${a} × ${b}`, w: [`= ${Math.floor(a / 100) * 100} × ${b} + ${a % 100} × ${b}`, `= ${N(Math.floor(a / 100) * 100 * b)} + ${N((a % 100) * b)}`, `= ${N(a * b)}`] }; },
      ({ ri }) => { const a = ri(2, 9) * 10, b = ri(2, 9) * 100; return { q: `${a} × ${b}`, w: [`= ${a / 10} × ${b / 100} × 1 000`, `= ${N(a * b)}`] }; },
      ({ ri, pick }) => { const n = ri(12, 48), k = ri(6, 24), t = pick(['pencils', 'stickers', 'cards', 'tiles']); return { q: `A box holds ${k} ${t}. How many ${t} are in ${n} boxes?`, w: [`${n} × ${k}`, `= ${N(n * k)} ${t}`] }; },
    ],
    c: [
      ({ ri }) => { const a = ri(112, 489), b = ri(12, 38); return b % 10 === 0 ? null : { q: `${a} × ${b}`, w: [`${a} × ${b - (b % 10)} = ${N(a * (b - (b % 10)))}`, `${a} × ${b % 10} = ${N(a * (b % 10))}`, `${N(a * (b - (b % 10)))} + ${N(a * (b % 10))} = ${N(a * b)}`] }; },
      ({ ri }) => { const c = ri(12, 99); return { q: `Use 99 = 100 − 1 to work out 99 × ${c}.`, w: [`= 100 × ${c} − ${c}`, `= ${N(100 * c)} − ${c}`, `= ${N(99 * c)}`] }; },
      ({ ri }) => { const s = ri(12, 30), r = ri(15, 30), p = ri(12, 25); return { q: `A hall has ${r} rows of ${s} seats. Tickets cost $${p}. How much money is taken if every seat is sold?`, w: [`seats: ${r} × ${s} = ${r * s}`, `${r * s} × ${p}`, `= $${N(r * s * p)}`] }; },
      ({ ri }) => { const t = ri(1, 9), u = ri(2, 9), b = ri(3, 9); const a = 10 * t + u; return { q: `Find the missing digit: ☐${u} × ${b} = ${N(a * b)}`, w: [`${N(a * b)} ÷ ${b} = ${a}`, `☐ = ${t}`] }; },
    ],
  },

  '3.03': {
    idea: 'Division facts come from the times tables. Split a number into parts you can divide easily. Short division: divide each place from the left and carry the remainder.',
    ex: [['72 ÷ 8', ['8 × 9 = 72', '= 9']], ['4 500 ÷ 100', ['move each digit two places right', '= 45']], ['852 ÷ 4', ['8 ÷ 4 = 2, 5 ÷ 4 = 1 r 1', '12 ÷ 4 = 3', '= 213']]],
    look: ['3.02'],
    e: [
      ({ ri }) => { const a = ri(3, 12), b = ri(3, 12); return { q: `${a * b} ÷ ${b}`, a: N(a) }; },
      ({ ri, pick }) => { const p = pick([10, 100, 1000]), a = ri(2, 95) * p; return { q: `${N(a)} ÷ ${N(p)}`, a: N(a / p) }; },
      ({ ri }) => { const a = ri(3, 12), b = ri(3, 12); return { q: `How many ${b}s are in ${a * b}?`, a: N(a) }; },
    ],
    m: [
      ({ ri }) => { const b = ri(3, 9), q1 = ri(1, 9) * 10, q2 = ri(1, 9); const a = b * (q1 + q2); return { q: `${a} ÷ ${b}`, w: [`= ${b * q1} ÷ ${b} + ${b * q2} ÷ ${b}`, `= ${q1} + ${q2}`, `= ${q1 + q2}`] }; },
      ({ ri }) => { const b = ri(3, 9), q = ri(102, 249); return { q: `${N(b * q)} ÷ ${b}`, w: ['short division, left to right', `= ${q}`] }; },
      ({ ri }) => { const b = ri(3, 9), a = ri(105, 499); return a % b === 0 ? null : { q: `${a} ÷ ${b}. Give the remainder.`, w: [`${b} × ${Math.floor(a / b)} = ${b * Math.floor(a / b)}`, `= ${Math.floor(a / b)} r ${a % b}`] }; },
    ],
    c: [
      ({ ri }) => { const b = ri(4, 9), a = ri(105, 499), q = Math.floor(a / b), r = a % b; return r ? { q: `${a} lollies are shared by ${b} people. How many does each get, and how many are left over?`, w: [`${a} ÷ ${b} = ${q} r ${r}`, `${q} each, ${r} left over`] } : null; },
      ({ ri }) => { const s = ri(5, 9), p = ri(41, 99); const buses = Math.ceil(p / s); return p % s === 0 ? null : { q: `${p} people need a ride. Each van holds ${s}. How many vans are needed?`, w: [`${p} ÷ ${s} = ${Math.floor(p / s)} r ${p % s}`, `${buses} vans (one more for the rest)`] }; },
      ({ ri }) => { const b = ri(3, 9), q = ri(12, 60); return { q: `Find the missing number: ☐ ÷ ${b} = ${q}`, w: [`☐ = ${q} × ${b}`, `☐ = ${q * b}`] }; },
      ({ ri }) => { const b = ri(3, 9), q = ri(1010, 2490); return { q: `${N(b * q)} ÷ ${b}`, w: ['short division, left to right', `= ${N(q)}`] }; },
    ],
  },

  '3.04': {
    idea: 'Use a test, not division. 2: even. 5: ends in 0 or 5. 10: ends in 0. 3 and 9: check the digit sum. 4: check the last two digits. 6: divisible by 2 and 3. 8: check the last three digits.',
    ex: [['Is 4 527 divisible by 3?', ['4 + 5 + 2 + 7 = 18', 'yes: 18 is divisible by 3']], ['Is 7 316 divisible by 4?', ['last two digits: 16', 'yes: 16 ÷ 4 = 4']], ['Is 5 742 divisible by 6?', ['even, and digit sum 18', 'yes: divisible by 2 and 3']]],
    look: ['3.03'],
    e: [
      ({ ri, pick }) => { const d = pick([2, 5, 10]), n = ri(100, 9999); return { q: `Is ${N(n)} divisible by ${d}?`, a: n % d === 0 ? 'yes' : 'no' }; },
      ({ ri }) => { const n = ri(100, 9999); return { q: `Find the digit sum of ${N(n)}. Is ${N(n)} divisible by 3?`, a: `${digitSum(n)}; ${n % 3 === 0 ? 'yes' : 'no'}` }; },
      ({ ri, shuffle }) => { const xs = shuffle([ri(11, 99) * 10 + 5, ri(101, 999) * 2 + 1, ri(101, 999) * 2 + 1, ri(101, 999) * 10 + 3].map((x) => (x % 5 === 0 ? x : x))); const ok = xs.filter((x) => x % 5 === 0); return ok.length !== 1 ? null : { q: `Which number is divisible by 5: ${xs.map(N).join(', ')}?`, a: N(ok[0]) }; },
    ],
    m: [
      ({ ri }) => { const n = ri(1000, 9999); return { q: `Is ${N(n)} divisible by 9?`, w: [`digit sum: ${digitSum(n)}`, `${n % 9 === 0 ? 'yes' : 'no'}: ${digitSum(n)} ${n % 9 === 0 ? 'is' : 'is not'} divisible by 9`] }; },
      ({ ri }) => { const n = ri(1000, 9999); return { q: `Is ${N(n)} divisible by 4?`, w: [`last two digits: ${n % 100}`, `${n % 4 === 0 ? 'yes' : 'no'}: ${n % 100} ${n % 4 === 0 ? 'is' : 'is not'} divisible by 4`] }; },
      ({ ri }) => { const n = ri(1000, 9999); return { q: `Is ${N(n)} divisible by 6?`, w: [`even? ${n % 2 ? 'no' : 'yes'}; digit sum ${digitSum(n)}`, n % 6 === 0 ? 'yes: divisible by 2 and 3' : 'no: not divisible by both 2 and 3'] }; },
      ({ ri }) => { const n = ri(10000, 99999); return { q: `Is ${N(n)} divisible by 8?`, w: [`last three digits: ${n % 1000}`, `${n % 8 === 0 ? 'yes' : 'no'}: ${n % 1000} ÷ 8 = ${n % 1000 % 8 ? `${Math.floor((n % 1000) / 8)} r ${(n % 1000) % 8}` : (n % 1000) / 8}`] }; },
    ],
    c: [
      ({ ri, pick }) => { const a = ri(1, 9), b = ri(0, 9), c = ri(0, 9), d = pick([3, 9]); const s = a + b + c; const opts = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((x) => (s + x) % d === 0); return { q: `${a}${b}${c}☐ is divisible by ${d}. Find every digit that could go in the box.`, w: [`${a} + ${b} + ${c} = ${s}`, `${s} + ☐ must be a multiple of ${d}`, `☐ = ${opts.join(', ')}`] }; },
      ({ ri }) => { const n = ri(100, 999) * 12; if (n > 9999) return null; const ds = [2, 3, 4, 5, 6, 8, 9, 10].filter((d) => n % d === 0); return { q: `Which of 2, 3, 4, 5, 6, 8, 9 and 10 divide ${N(n)}?`, w: [`even, digit sum ${digitSum(n)}, last two digits ${n % 100}`, ds.join(', ')] }; },
      ({ ri, pick }) => { const n = ri(1000, 9999), who = pick(['Leo', 'Ivy', 'Noah', 'Chloe']); return n % 4 === 0 || (n % 10) % 4 !== 0 ? null : { q: `${who} says ${N(n)} is divisible by 4 because it ends in ${n % 10}. Is that right? Explain.`, a: `No. Check the last two digits: ${n % 100} is not divisible by 4.`, n: 2 }; },
      ({ pick }) => { const [d, n] = pick([[9, 1008], [6, 1002], [4, 1000], [8, 1000], [3, 1002]]); return { q: `What is the smallest four-digit number that is divisible by ${d}?`, a: N(n), key: `smallest ${d}` }; },
    ],
  },

  '3.05': {
    idea: 'Long division: divide, multiply, subtract, bring down the next digit. Repeat until there are no digits left. What is left at the end is the remainder.',
    ex: [['672 ÷ 16', ['67 ÷ 16 = 4 r 3', 'bring down 2: 32 ÷ 16 = 2', '= 42']], ['851 ÷ 23', ['85 ÷ 23 = 3 r 16', 'bring down 1: 161 ÷ 23 = 7', '= 37']], ['500 people go in buses that hold 45. How many buses?', ['500 ÷ 45 = 11 r 5', '12 buses']]],
    look: ['3.03'],
    e: [
      ({ ri }) => { const a = ri(11, 25), b = ri(2, 9); return { q: `${a} × ${b}`, a: N(a * b) }; },
      ({ ri }) => { const d = ri(12, 25), k = ri(2, 9); return { q: `How many times does ${d} go into ${d * k}?`, a: N(k) }; },
      ({ ri }) => { const d = ri(12, 25), n = ri(d * 2, d * 9 + d - 1); return n % d === 0 ? null : { q: `How many times does ${d} go into ${n}? What is left over?`, a: `${Math.floor(n / d)} r ${n % d}` }; },
    ],
    m: [
      ({ ri }) => { const d = ri(12, 29), q = ri(21, 69), a = d * q, t = Math.floor(q / 10), u = q % 10; const first = Math.floor(a / 10); return a > 999 || first < d ? null : { q: `${N(a)} ÷ ${d}`, w: [`${first} ÷ ${d} = ${t} r ${first - t * d}`, `bring down: ${(first - t * d) * 10 + (a % 10)} ÷ ${d} = ${u}`, `= ${q}`] }; },
      ({ ri }) => { const d = ri(12, 35), q = ri(102, 290), a = d * q; return a > 9999 ? null : { q: `${N(a)} ÷ ${d}`, w: ['divide, multiply, subtract, bring down', `= ${q}`] }; },
      ({ ri }) => { const d = ri(13, 29), a = ri(300, 999); return a % d === 0 ? null : { q: `${a} ÷ ${d}. Give the remainder.`, w: [`${d} × ${Math.floor(a / d)} = ${d * Math.floor(a / d)}`, `= ${Math.floor(a / d)} r ${a % d}`] }; },
    ],
    c: [
      ({ ri }) => { const d = ri(21, 45), q = ri(12, 40), r = ri(1, d - 1), a = d * q + r; return { q: `${N(a)} students are put into teams of ${d}. How many full teams are there? How many students are left over?`, w: [`${N(a)} ÷ ${d}`, `= ${q} r ${r}`, `${q} teams, ${r} left over`] }; },
      ({ ri }) => { const s = ri(41, 57), p = ri(500, 999); return p % s === 0 ? null : { q: `${p} people go to a game in buses that hold ${s}. How many buses are needed?`, w: [`${p} ÷ ${s} = ${Math.floor(p / s)} r ${p % s}`, `${Math.ceil(p / s)} buses`] }; },
      ({ ri }) => { const d = ri(12, 24), c = ri(150, 600) * d; return c > 9999 ? null : { q: `A club shares $${N(c)} equally between ${d} members. How much does each get?`, w: [`${N(c)} ÷ ${d}`, `= $${N(c / d)}`] }; },
      ({ ri }) => { const d = ri(13, 29), q = ri(21, 99), r = ri(1, d - 1); return { q: `When a number is divided by ${d}, the answer is ${q} remainder ${r}. What is the number?`, w: [`${d} × ${q} + ${r}`, `= ${N(d * q + r)}`] }; },
    ],
  },

  '3.06': {
    idea: 'I = 1, V = 5, X = 10, L = 50, C = 100, D = 500, M = 1000. A smaller letter after a larger one adds (VI = 6); a smaller letter before a larger one subtracts (IV = 4, XC = 90).',
    ex: [['Write XLVII as a number.', ['XL = 40, VII = 7', '= 47']], ['Write 94 in Roman numerals.', ['90 + 4', 'XC + IV = XCIV']], ['Write 2026 in Roman numerals.', ['2000 + 20 + 6', 'MM + XX + VI = MMXXVI']]],
    e: [
      ({ ri }) => { const n = ri(2, 99); return { q: `Write ${roman(n)} as a number.`, a: N(n) }; },
      ({ ri }) => { const n = ri(2, 99); return { q: `Write ${n} in Roman numerals.`, a: roman(n) }; },
      ({ pick }) => { const [r, v] = pick([['V', 5], ['X', 10], ['L', 50], ['C', 100], ['D', 500], ['M', 1000]]); return { q: `What number is ${r}?`, a: N(v) }; },
    ],
    m: [
      ({ ri }) => { const n = ri(101, 999); const ps = parts(n); return { q: `Write ${n} in Roman numerals.`, w: [ps.join(' + '), `${ps.map(roman).join(' + ')} = ${roman(n)}`] }; },
      ({ ri }) => { const n = ri(101, 999); const ps = parts(n); return { q: `Write ${roman(n)} as a number.`, w: [`${ps.map(roman).join(' + ')}`, `${ps.join(' + ')} = ${n}`] }; },
      ({ ri }) => { const a = ri(11, 99), b = ri(11, 99); return a === b ? null : { q: `Which is larger: ${roman(a)} or ${roman(b)}?`, w: [`${roman(a)} = ${a}, ${roman(b)} = ${b}`, `larger: ${roman(Math.max(a, b))}`] }; },
    ],
    c: [
      ({ ri }) => { const n = ri(1800, 2030); const ps = parts(n); return { q: `Write the year ${n} in Roman numerals.`, w: [ps.join(' + '), `${ps.map(roman).join(' + ')}`, `= ${roman(n)}`] }; },
      ({ ri }) => { const a = ri(11, 60), b = ri(11, 60); return { q: `Work out ${roman(a)} + ${roman(b)}. Write the answer in Roman numerals.`, w: [`${a} + ${b} = ${a + b}`, `= ${roman(a + b)}`] }; },
      ({ pick }) => { const [n, wrong] = pick([[99, 'IC'], [49, 'IL'], [45, 'VL'], [95, 'VC'], [990, 'XM'], [999, 'IM']]); return { q: `${pick(['Zac', 'Lena', 'Mason'])} writes ${n} as ${wrong}. Is that right? Explain.`, a: `No. Only I, X and C can go before a larger letter (I before V or X, X before L or C, C before D or M). ${n} = ${roman(n)}.`, n: 2, key: wrong }; },
    ],
  },

  '3.07': {
    idea: 'A power shows repeated multiplication: 2⁵ = 2 × 2 × 2 × 2 × 2 = 32. The base is 2 and the index (the power) is 5.',
    ex: [['Write 3 × 3 × 3 × 3 in index form.', ['four 3s multiplied', '= 3⁴']], ['Evaluate 2⁵.', ['= 2 × 2 × 2 × 2 × 2', '= 32']], ['Evaluate 4² + 2³.', ['= 16 + 8', '= 24']]],
    look: ['3.02'],
    e: [
      ({ ri }) => { const b = ri(2, 9), k = ri(2, 6); return { q: `Write ${Array(k).fill(b).join(' × ')} in index form.`, a: `${b}${sup(k)}` }; },
      ({ ri }) => { const b = ri(2, 12); return { q: `Evaluate ${b}${sup(2)}.`, a: N(b * b) }; },
      ({ pick }) => { const [b, k] = pick([[2, 3], [2, 4], [3, 3], [10, 3], [5, 3], [1, 7], [10, 4], [4, 3]]); return { q: `Evaluate ${b}${sup(k)}.`, w: [`= ${Array(k).fill(b).join(' × ')}`, `= ${N(b ** k)}`] }; },
    ],
    m: [
      ({ ri }) => { const b = ri(2, 9), k = ri(3, 6); return { q: `Write ${b}${sup(k)} as a product. Name the base and the index.`, w: [`= ${Array(k).fill(b).join(' × ')}`, `base ${b}, index ${k}`] }; },
      ({ pick }) => { const [b, k] = pick([[2, 6], [2, 7], [2, 8], [3, 4], [3, 5], [4, 4], [6, 3], [7, 3], [5, 4]]); return { q: `Evaluate ${b}${sup(k)}.`, w: [`= ${Array(k).fill(b).join(' × ')}`, `= ${N(b ** k)}`] }; },
      ({ pick }) => { const [a, b] = pick([[2, 5], [3, 4], [2, 6], [4, 5], [2, 3]]); return { q: `Which is larger: ${a}${sup(b)} or ${b}${sup(a)}?`, w: [`${a}${sup(b)} = ${a ** b}, ${b}${sup(a)} = ${b ** a}`, a ** b === b ** a ? 'they are equal' : `larger: ${a ** b > b ** a ? `${a}${sup(b)}` : `${b}${sup(a)}`}`] }; },
      ({ ri }) => { const a = ri(2, 9), b = ri(2, 5); return { q: `Evaluate ${a}${sup(2)} + ${b}${sup(3)}.`, w: [`= ${a * a} + ${b ** 3}`, `= ${a * a + b ** 3}`] }; },
    ],
    c: [
      ({ ri }) => { const p = ri(2, 4), q = ri(1, 3); return { q: `Write ${[...Array(p).fill(2), ...Array(q).fill(5)].join(' × ')} in index form, then evaluate it.`, w: [`= 2${sup(p)} × 5${sup(q)}`, `= ${2 ** p} × ${5 ** q}`, `= ${N(2 ** p * 5 ** q)}`] }; },
      ({ pick }) => { const [b, k] = pick([[2, 6], [2, 7], [3, 4], [5, 3], [2, 5], [4, 3], [3, 5]]); return { q: `Find the index: ${b}${sup('n')} = ${N(b ** k)}`.replace(`${sup('n')}`, '<sup><i>n</i></sup>'), w: [`${b} × ${b} × … until ${N(b ** k)}`, `n = ${k}`] }; },
      ({ pick }) => { const k = pick([3, 4, 5, 6]); return { q: `Write ${N(10 ** k)} as a power of 10.`, a: `10${sup(k)}` }; },
      ({ ri, pick }) => { const b = ri(3, 9), who = pick(['Kai', 'Sienna', 'Leo']); return { q: `${who} says ${b}${sup(2)} = ${2 * b}. Is that right? Explain.`, a: `No. ${b}² = ${b} × ${b} = ${b * b}, not ${b} × 2.`, n: 2 }; },
    ],
  },

  '3.08': {
    idea: 'A square root undoes squaring: √49 = 7 because 7² = 49. A cube root undoes cubing: ∛27 = 3 because 3³ = 27.',
    ex: [['√64', ['8 × 8 = 64', '= 8']], ['∛125', ['5 × 5 × 5 = 125', '= 5']], ['Between which two whole numbers is √40?', ['6² = 36 and 7² = 49', 'between 6 and 7']]],
    look: ['3.07'],
    e: [
      ({ ri }) => { const a = ri(2, 12); return { q: `√${a * a}`, a: N(a) }; },
      ({ ri }) => { const a = ri(1, 5); return { q: `∛${a ** 3}`, a: N(a) }; },
      ({ ri }) => { const a = ri(3, 12); return { q: `What number squared is ${a * a}?`, a: N(a) }; },
    ],
    m: [
      ({ ri }) => { const n = ri(5, 140); const r = Math.floor(Math.sqrt(n)); return r * r === n ? null : { q: `Between which two whole numbers is √${n}?`, w: [`${r}${sup(2)} = ${r * r} and ${r + 1}${sup(2)} = ${(r + 1) ** 2}`, `between ${r} and ${r + 1}`] }; },
      ({ ri }) => { const a = ri(2, 10), b = ri(2, 10); return { q: `√${a * a} + √${b * b}`, w: [`= ${a} + ${b}`, `= ${a + b}`] }; },
      ({ ri }) => { const a = ri(2, 5), b = ri(2, 10); return { q: `∛${a ** 3} × √${b * b}`, w: [`= ${a} × ${b}`, `= ${a * b}`] }; },
      ({ ri }) => { const a = ri(6, 10); return { q: `∛${N(a ** 3)}`, w: [`${a} × ${a} × ${a} = ${N(a ** 3)}`, `= ${a}`] }; },
    ],
    c: [
      ({ pick }) => { const [a, b, c] = pick([[6, 8, 10], [3, 4, 5], [5, 12, 13], [9, 12, 15], [8, 15, 17]]); return { q: `√(${a * a} + ${b * b})`, w: [`= √${a * a + b * b}`, `= ${c}`] }; },
      ({ ri }) => { const s = ri(5, 15); return { q: `A square has an area of ${s * s} cm². How long is each side?`, w: [`√${s * s}`, `= ${s} cm`] }; },
      ({ ri }) => { const s = ri(2, 6); return { q: `A cube has a volume of ${s ** 3} cm³. How long is each edge?`, w: [`∛${s ** 3}`, `= ${s} cm`] }; },
      ({ pick }) => { const [a, b] = pick([[16, 9], [36, 64], [9, 16], [25, 144]]); return { q: `Is √(${a} + ${b}) the same as √${a} + √${b}? Show why.`, w: [`√(${a} + ${b}) = √${a + b} = ${Math.sqrt(a + b)}`, `√${a} + √${b} = ${Math.sqrt(a) + Math.sqrt(b)}: no`], key: 'same' }; },
    ],
  },

  '3.09': {
    idea: 'A prime number has exactly two factors: 1 and itself. A composite number has more than two factors. 1 is neither prime nor composite.',
    ex: [['List the factors of 18.', ['1 × 18, 2 × 9, 3 × 6', '1, 2, 3, 6, 9, 18']], ['Is 51 prime or composite?', ['51 = 3 × 17', 'composite']], ['List the primes between 20 and 40.', ['test each odd number', '23, 29, 31, 37']]],
    look: ['3.04'],
    e: [
      ({ ri }) => { const n = ri(2, 50); return { q: `Is ${n} prime or composite?`, a: isPrime(n) ? 'prime' : 'composite' }; },
      ({ ri }) => { const n = ri(6, 40); return isPrime(n) ? null : { q: `List the factors of ${n}.`, w: [pairs(n).join(', '), factors(n).join(', ')] }; },
      ({ ri }) => { const n = ri(4, 30); return { q: `How many factors does ${n} have?`, a: N(factors(n).length) }; },
    ],
    m: [
      ({ ri }) => { const n = ri(51, 99); return { q: `Is ${n} prime or composite? Give a reason.`, a: isPrime(n) ? 'prime: only 1 and itself' : `composite: ${n} = ${pairs(n)[1] || pairs(n)[0]}` }; },
      ({ ri }) => { const a = ri(1, 8) * 10, b = a + 20; const ps = []; for (let k = a + 1; k < b; k++) if (isPrime(k)) ps.push(k); return { q: `List the primes between ${a} and ${b}.`, a: ps.join(', ') }; },
      ({ ri }) => { const n = ri(5, 25) * 2; const p = [...Array(n).keys()].find((k) => isPrime(k) && isPrime(n - k)); return { q: `Write ${n} as the sum of two primes.`, a: `e.g. ${n} = ${p} + ${n - p}` }; },
    ],
    c: [
      ({ ri }) => { const n = ri(20, 120); let p = n + 1; while (!isPrime(p)) p++; return { q: `What is the smallest prime number greater than ${n}?`, a: N(p) }; },
      ({ pick }) => { const [n, f] = pick([[91, '7 × 13'], [87, '3 × 29'], [57, '3 × 19'], [51, '3 × 17'], [119, '7 × 17'], [133, '7 × 19']]); return { q: `${pick(['Ruby', 'Jack', 'Priya'])} says ${n} is prime. Is that right? Explain.`, a: `No. ${n} = ${f}, so it is composite.`, n: 2, key: `p${n}` }; },
      ({ pick }) => { const [q, a] = pick([['Which is the only even prime number? Why is it the only one?', '2. Every other even number has 2 as a factor.'], ['Is 1 a prime number? Explain.', 'No. It has only one factor.'], ['Two primes add to 15. What are they?', '2 and 13'], ['Find a pair of primes that differ by 2 and are both between 40 and 50.', '41 and 43']]); return { q, a, n: 2, key: q }; },
      ({ ri }) => { const n = ri(30, 99); return isPrime(n) ? null : { q: `${n} has how many factors? List them.`, w: [pairs(n).join(', '), `${factors(n).length}: ${factors(n).join(', ')}`] }; },
    ],
  },

  '3.10': {
    idea: 'Break a number into factors until every branch of the factor tree ends in a prime. Write the primes in order, using index notation: 60 = 2² × 3 × 5.',
    ex: [['Write 36 as a product of primes.', ['36 = 4 × 9 = 2 × 2 × 3 × 3', '= 2² × 3²']], ['Write 90 as a product of primes.', ['90 = 9 × 10 = 3 × 3 × 2 × 5', '= 2 × 3² × 5']], ['Which number is 2³ × 5?', ['= 8 × 5', '= 40']]],
    look: ['3.09', '3.07'],
    e: [
      ({ ri, pick }) => { const a = pick([2, 3]), k = ri(1, 3), b = pick([3, 5, 7]); return a === b ? null : { q: `Which number is ${a}${k > 1 ? sup(k) : ''} × ${b}?`, w: [`= ${a ** k} × ${b}`, `= ${a ** k * b}`] }; },
      ({ ri }) => { const p = ri(1, 3), q = ri(1, 3); return { q: `Write ${[...Array(p).fill(2), ...Array(q).fill(3)].join(' × ')} in index form.`, a: `${p > 1 ? `2${sup(p)}` : '2'} × ${q > 1 ? `3${sup(q)}` : '3'}` }; },
      ({ pick }) => { const n = pick([12, 18, 20, 28, 30, 42, 45, 50]); return { q: `Which primes are factors of ${n}?`, a: [...new Set(primeList(n))].join(', ') }; },
    ],
    m: [
      ({ ri }) => { const n = ri(24, 200); return isPrime(n) || primeList(n).length < 3 ? null : { q: `Write ${n} as a product of primes.`, w: [`${n} = ${primeList(n).join(' × ')}`, `= ${index(n)}`] }; },
      ({ pick }) => { const [a, b] = pick([[4, 6], [6, 8], [9, 4], [5, 8], [6, 10], [4, 15], [3, 12]]); const n = a * b; return { q: `Start a factor tree with ${n} = ${a} × ${b}. Finish it and write ${n} as a product of primes.`, w: [`${a} = ${primeList(a).join(' × ')}, ${b} = ${primeList(b).join(' × ')}`, `${n} = ${index(n)}`] }; },
      ({ pick }) => { const n = pick([2 ** 2 * 3 * 5, 2 * 3 ** 2 * 5, 2 ** 3 * 3 ** 2, 2 ** 2 * 7, 3 ** 2 * 5 ** 2, 2 ** 4 * 3]); return { q: `Which number is ${index(n)}?`, w: [`= ${primeList(n).join(' × ')}`, `= ${n}`] }; },
    ],
    c: [
      ({ ri }) => { const n = ri(200, 999); return isPrime(n) || primeList(n).length < 4 || Math.max(...primeList(n)) > 31 ? null : { q: `Write ${n} as a product of primes.`, w: [`${n} = ${primeList(n).join(' × ')}`, `= ${index(n)}`] }; },
      ({ pick }) => { const [n, sq] = pick([[144, '(2² × 3)²'], [225, '(3 × 5)²'], [196, '(2 × 7)²'], [324, '(2 × 3²)²'], [400, '(2² × 5)²']]); return { q: `Use prime factors to show that ${n} is a square number.`, w: [`${n} = ${index(n)}`, `= ${sq}, so √${n} = ${Math.sqrt(n)}`], key: `sq${n}` }; },
      ({ pick }) => { const [e, d, yes] = pick([['2 × 3² × 5', 6, true], ['2 × 3² × 5', 4, false], ['2² × 3 × 7', 12, true], ['3² × 5 × 7', 2, false], ['2³ × 5', 8, true], ['2 × 5²', 25, true]]); return { q: `A number is ${e.replace(/(\d)²/g, '$1<sup>2</sup>').replace(/(\d)³/g, '$1<sup>3</sup>')}. Is it divisible by ${d}? Explain.`, a: yes ? `Yes. ${d}'s prime factors are all in it.` : `No. ${d}'s prime factors are not all in it.`, n: 2, key: `${e}/${d}` }; },
    ],
  },

  '3.11': {
    idea: 'The highest common factor (HCF) is the largest number that divides into both numbers. List the factors of each and find the largest one they share. With prime factors: multiply the primes they share.',
    ex: [['Find the HCF of 18 and 24.', ['18: 1, 2, 3, 6, 9, 18', '24: 1, 2, 3, 4, 6, 8, 12, 24', 'HCF = 6']], ['Find the HCF of 36 and 60 using prime factors.', ['36 = 2² × 3², 60 = 2² × 3 × 5', 'HCF = 2² × 3 = 12']], ['48 apples and 60 pears go into bags. Every bag is the same, with nothing left over. What is the largest number of bags?', ['HCF of 48 and 60', '= 12 bags']]],
    look: ['3.10', '3.09'],
    e: [
      ({ ri }) => { const g = ri(2, 6), a = g * ri(2, 6), b = g * ri(2, 6); return a === b ? null : { q: `Find the HCF of ${a} and ${b}.`, a: N(gcd(a, b)) }; },
      ({ ri }) => { const a = ri(8, 30), b = ri(8, 30), d = ri(2, 6); return a === b ? null : { q: `Is ${d} a common factor of ${a} and ${b}?`, a: a % d === 0 && b % d === 0 ? 'yes' : 'no' }; },
      ({ ri }) => { const g = ri(2, 4), a = g * ri(2, 5), b = g * ri(2, 5); return a === b ? null : { q: `List the common factors of ${a} and ${b}.`, a: factors(gcd(a, b)).join(', ') }; },
    ],
    m: [
      ({ ri }) => { const g = ri(4, 15), a = g * ri(2, 7), b = g * ri(2, 7); return a === b || gcd(a, b) !== g ? null : { q: `Find the HCF of ${a} and ${b}.`, w: [`${a}: ${factors(a).join(', ')}`, `${b}: ${factors(b).join(', ')}`, `HCF = ${g}`] }; },
      ({ ri }) => { const g = ri(2, 12), a = g * ri(2, 9), b = g * ri(2, 9); const h = gcd(a, b); return a >= b ? null : { q: `Use the HCF to simplify the fraction ${a}/${b}.`.replace(`${a}/${b}`, `<span class="fr"><sup>${a}</sup><sub>${b}</sub></span>`), w: [`HCF = ${h}`, `= ${a / h}/${b / h}`] }; },
      ({ ri }) => { const g = ri(4, 12), a = g * ri(3, 9), b = g * ri(3, 9); return a === b || gcd(a, b) !== g || a > 200 || b > 200 ? null : { q: `Use prime factors to find the HCF of ${a} and ${b}.`, w: [`${a} = ${index(a)}, ${b} = ${index(b)}`, `HCF = ${g}`] }; },
    ],
    c: [
      ({ ri, pick }) => { const g = ri(4, 12), a = g * ri(3, 8), b = g * ri(3, 8); const [x, y] = pick([['apples', 'pears'], ['red pens', 'blue pens'], ['boys', 'girls']]); return a === b || gcd(a, b) !== g ? null : { q: `${a} ${x} and ${b} ${y} are shared into identical groups with none left over. What is the largest number of groups?`, w: [`HCF of ${a} and ${b}`, `= ${g} groups`] }; },
      ({ ri }) => { const g = ri(2, 8), a = g * ri(2, 6), b = g * ri(2, 6), c = g * ri(2, 6); return new Set([a, b, c]).size < 3 || gcd(gcd(a, b), c) !== g ? null : { q: `Find the HCF of ${a}, ${b} and ${c}.`, w: [`common factors of all three`, `HCF = ${g}`] }; },
      ({ ri }) => { const g = ri(5, 15), a = g * ri(2, 6), b = g * ri(2, 6); return a === b || gcd(a, b) !== g ? null : { q: `A rectangle is ${a} cm by ${b} cm. It is cut into equal squares with nothing left over. What is the largest possible square?`, w: [`HCF of ${a} and ${b}`, `= ${g} cm squares`] }; },
    ],
  },

  '3.12': {
    idea: 'The lowest common multiple (LCM) is the smallest number that both numbers divide into. List the multiples of each number until you find the first one they share.',
    ex: [['Find the LCM of 4 and 6.', ['4: 4, 8, 12', '6: 6, 12', 'LCM = 12']], ['Find the LCM of 8 and 12.', ['8: 8, 16, 24', '12: 12, 24', 'LCM = 24']], ['Buses leave every 12 min and every 18 min. Both leave at 8:00. When do they next leave together?', ['LCM of 12 and 18 = 36', '8:36']]],
    look: ['3.11'],
    e: [
      ({ ri }) => { const a = ri(2, 9), b = ri(2, 9); return a === b ? null : { q: `Find the LCM of ${a} and ${b}.`, a: N(lcm(a, b)) }; },
      ({ ri }) => { const n = ri(3, 12); return { q: `List the first five multiples of ${n}.`, a: multiples(n, 5).join(', ') }; },
      ({ ri }) => { const a = ri(2, 9), b = ri(2, 9), m = ri(12, 60); return a === b ? null : { q: `Is ${m} a common multiple of ${a} and ${b}?`, a: m % a === 0 && m % b === 0 ? 'yes' : 'no' }; },
    ],
    m: [
      ({ ri }) => { const a = ri(4, 15), b = ri(4, 15); const l = lcm(a, b); return a === b || l / a > 6 || l / b > 6 ? null : { q: `Find the LCM of ${a} and ${b}.`, w: [`${a}: ${multiples(a, Math.min(6, l / a)).join(', ')}`, `${b}: ${multiples(b, Math.min(6, l / b)).join(', ')}`, `LCM = ${l}`] }; },
      ({ ri }) => { const a = ri(2, 6), b = ri(2, 6), c = ri(2, 6); return new Set([a, b, c]).size < 3 ? null : { q: `Find the LCM of ${a}, ${b} and ${c}.`, w: ['list multiples of the largest; test the others', `LCM = ${lcm(lcm(a, b), c)}`] }; },
      ({ ri }) => { const a = ri(6, 20), b = ri(6, 20); return a === b ? null : { q: `Find the HCF and the LCM of ${a} and ${b}.`, w: [`HCF = ${gcd(a, b)}`, `LCM = ${lcm(a, b)}`] }; },
    ],
    c: [
      ({ ri }) => { const a = ri(4, 15), b = ri(4, 15); return a === b || lcm(a, b) > 60 ? null : { q: `Two lights flash every ${a} seconds and every ${b} seconds. They flash together now. When do they next flash together?`, w: [`LCM of ${a} and ${b}`, `= ${lcm(a, b)} seconds`] }; },
      ({ ri }) => { const a = ri(6, 18), b = ri(6, 18); return a === b || lcm(a, b) > 60 ? null : { q: `Buses leave every ${a} minutes and every ${b} minutes. Both leave at 9:00. When do they next leave together?`, w: [`LCM of ${a} and ${b} = ${lcm(a, b)}`, `${lcm(a, b) >= 60 ? '10' : '9'}:${String(lcm(a, b) % 60).padStart(2, '0')}`] }; },
      ({ ri }) => { const a = ri(4, 12), b = ri(4, 12); return a === b ? null : { q: `Hot dogs come in packs of ${a} and buns in packs of ${b}. What is the smallest number of each you can buy to have the same number?`, w: [`LCM of ${a} and ${b} = ${lcm(a, b)}`, `${lcm(a, b) / a} packs of hot dogs, ${lcm(a, b) / b} packs of buns`] }; },
      ({ ri }) => { const a = ri(4, 15), b = ri(4, 15); return a === b ? null : { q: `Check that HCF × LCM = ${a} × ${b} for ${a} and ${b}.`, w: [`HCF = ${gcd(a, b)}, LCM = ${lcm(a, b)}`, `${gcd(a, b)} × ${lcm(a, b)} = ${a * b} = ${a} × ${b}`] }; },
    ],
  },
};
