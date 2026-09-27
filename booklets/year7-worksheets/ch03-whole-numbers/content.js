// Worksheet questions for Chapter 3 Whole numbers (lib/worksheet.js). See ../ch01-integers/content.js for the format.
const { gcd, fmt } = require('../../lib/calc');

const N = (v) => fmt(v);
const sup = (p) => `<sup>${p}</sup>`;
const roman = (n) => [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']].reduce((s, [v, r]) => { while (n >= v) { s += r; n -= v; } return s; }, '');
const romanParts = (n) => { const out = []; [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']].forEach(([v, r]) => { while (n >= v) { out.push([v, r]); n -= v; } }); return out; };
const isPrime = (n) => { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };
const factors = (n) => { const f = []; for (let d = 1; d <= n; d++) if (n % d === 0) f.push(d); return f; };
const primeList = (n) => { const f = []; for (let d = 2; n > 1; d++) while (n % d === 0) { f.push(d); n /= d; } return f; };
const index = (n) => { const m = new Map(); primeList(n).forEach((p) => m.set(p, (m.get(p) || 0) + 1)); return [...m].map(([p, k]) => (k > 1 ? `${p}${sup(k)}` : `${p}`)).join(' × '); };
const lcm = (a, b) => (a * b) / gcd(a, b);
const roundTo = (n, to) => Math.round(n / to) * to;
const lead = (n) => { const p = 10 ** (String(n).length - 1); return roundTo(n, p); };
const digitSum = (n) => [...String(n)].reduce((t, c) => t + +c, 0);

module.exports = {
  '3.01': ({ ri, pick }) => [
    [{ text: 'Round to the place given. Look at the digit to its right: 5 or more, round up.', gen: () => { const to = pick([10, 100, 1000]), n = ri(to + 1, to * 99); return n % to === 0 ? { q: '' } : { q: `${N(n)} to the nearest ${N(to)}`, a: N(roundTo(n, to)) }; } }],
    [{ text: 'Estimate: round each number to its first digit, then work it out.', gen: () => { const a = ri(12, 98) * pick([1, 10]), b = ri(12, 98), op = pick(['+', '×']); const ea = lead(a), eb = lead(b); return { q: `${N(a)} ${op} ${N(b)}`, a: `≈ ${N(op === '+' ? ea + eb : ea * eb)}`, lines: [`≈ ${N(ea)} ${op} ${N(eb)}`, `≈ ${N(op === '+' ? ea + eb : ea * eb)}`] }; } }],
    [{ text: 'Estimate, then answer the question. Show your rounding.', kinds: 2, gen: (i) => {
      if (i % 2 === 0) { const n = ri(21, 48), c = ri(11, 49); const e = lead(n) * lead(c); return { q: `${n} students each pay $${c} for an excursion. Estimate the total.`, a: `≈ $${N(e)}`, lines: [`≈ ${lead(n)} × ${lead(c)}`, `≈ $${N(e)}`] }; }
      const t = ri(310, 890), p = ri(21, 39); return { q: `${N(t)} people share ${p} buses. About how many are on each bus?`, a: `≈ ${N(Math.round(lead(t) / lead(p)))}`, lines: [`≈ ${N(lead(t))} ÷ ${lead(p)}`, `≈ ${N(Math.round(lead(t) / lead(p)))}`] };
    } }],
  ],
  '3.02': ({ ri, pick }) => [
    [{ text: 'Know your times tables.', gen: () => { const a = ri(3, 12), b = ri(3, 12); return { q: `${a} × ${b}`, a: N(a * b) }; } },
      { text: 'Multiply by 10, 100 or 1000: move each digit left one place for each zero.', gen: () => { const a = ri(3, 99), p = pick([10, 100, 1000]); return { q: `${a} × ${N(p)}`, a: N(a * p) }; } }],
    [{ text: 'Split the number to multiply in your head: 34 × 6 = 30 × 6 + 4 × 6.', gen: () => { const a = ri(12, 98), b = ri(3, 9); if (a % 10 === 0) return { q: '' }; const t = a - (a % 10), u = a % 10; return { q: `${a} × ${b}`, a: N(a * b), lines: [`= ${t} × ${b} + ${u} × ${b}`, `= ${t * b} + ${u * b}`, `= ${N(a * b)}`] }; } }],
    [{ text: 'Multiply a 3-digit number by a 2-digit number. Split the second number.', gen: () => { const a = ri(112, 489), b = ri(12, 38); if (b % 10 === 0) return { q: '' }; const t = b - (b % 10), u = b % 10; return { q: `${a} × ${b}`, a: N(a * b), lines: [`${a} × ${t} = ${N(a * t)}`, `${a} × ${u} = ${N(a * u)}`, `${N(a * t)} + ${N(a * u)} = ${N(a * b)}`] }; } }],
  ],
  '3.03': ({ ri, pick }) => [
    [{ text: 'Know your division facts.', gen: () => { const a = ri(3, 12), b = ri(3, 12); return { q: `${a * b} ÷ ${b}`, a: String(a) }; } },
      { text: 'Divide by 10, 100 or 1000.', gen: () => { const p = pick([10, 100, 1000]), a = ri(2, 95) * p; return { q: `${N(a)} ÷ ${N(p)}`, a: N(a / p) }; } }],
    [{ text: 'Split the number into parts you can divide easily.', gen: () => { const b = ri(3, 9), q1 = ri(1, 9) * 10, q2 = ri(1, 9); const a = b * (q1 + q2); return { q: `${a} ÷ ${b}`, a: String(q1 + q2), lines: [`= ${b * q1} ÷ ${b} + ${b * q2} ÷ ${b}`, `= ${q1} + ${q2}`, `= ${q1 + q2}`] }; } }],
    [{ text: 'Use short division. Write the remainder, then answer the question.', gen: () => { const b = ri(4, 9), a = ri(105, 499), q = Math.floor(a / b), r = a % b; if (!r) return { q: '' }; return { q: `${a} lollies are shared by ${b} people. How many each, and how many are left over?`, a: `${q} each, ${r} left`, lines: [`${a} ÷ ${b} = ${q} r ${r}`, `${q} each, ${r} left over`] }; } }],
  ],
  '3.04': ({ ri, pick }) => [
    [{ text: 'Is the number divisible by the number in brackets? Write yes or no.', gen: () => { const d = pick([2, 5, 10]), n = ri(100, 9999); return { q: `${N(n)} (${d})`, a: n % d === 0 ? 'yes' : 'no' }; } },
      { text: 'Find the digit sum. Is the number divisible by 3?', gen: () => { const n = ri(100, 9999); return { q: N(n), a: `${digitSum(n)}, ${n % 3 === 0 ? 'yes' : 'no'}` }; } }],
    [{ text: 'Use the test. Show the check, then write yes or no.', kinds: 3, gen: (i) => {
      const n = ri(1000, 9999), k = i % 3;
      if (k === 0) return { q: `Is ${N(n)} divisible by 9?`, a: n % 9 === 0 ? 'yes' : 'no', lines: [`digit sum: ${[...String(n)].join(' + ')} = ${digitSum(n)}`, `${digitSum(n)} ${digitSum(n) % 9 ? 'is not' : 'is'} divisible by 9, so ${n % 9 === 0 ? 'yes' : 'no'}`] };
      if (k === 1) return { q: `Is ${N(n)} divisible by 4?`, a: n % 4 === 0 ? 'yes' : 'no', lines: [`last two digits: ${n % 100}`, `${n % 100} ${(n % 100) % 4 ? 'is not' : 'is'} divisible by 4, so ${n % 4 === 0 ? 'yes' : 'no'}`] };
      return { q: `Is ${N(n)} divisible by 6?`, a: n % 6 === 0 ? 'yes' : 'no', lines: [`even? ${n % 2 ? 'no' : 'yes'}; digit sum ${digitSum(n)}`, `${n % 6 === 0 ? 'yes: divisible by 2 and 3' : 'no: not divisible by both 2 and 3'}`] };
    } }],
    [{ text: 'Find the missing digit so that the number is divisible as shown.', gen: () => { const a = ri(1, 9), b = ri(0, 9), c = ri(0, 9), d = pick([3, 9]); const s = a + b + c; const opts = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((x) => (s + x) % d === 0); return { q: `${a}${b}${c}☐ is divisible by ${d}. Find every digit that fits the box.`, a: opts.join(', '), lines: [`${a} + ${b} + ${c} = ${s}`, `${s} + ☐ must be a multiple of ${d}`, `☐ = ${opts.join(', ')}`] }; } }],
  ],
  '3.05': ({ ri }) => [
    [{ text: 'Know your multiples. You need them for long division.', gen: () => { const a = ri(11, 25), b = ri(2, 9); return { q: `${a} × ${b}`, a: String(a * b) }; } },
      { text: 'How many times does the first number go into the second? Write the remainder.', gen: () => { const d = ri(12, 25), n = ri(d * 2, d * 9 + d - 1); return { q: `${d} into ${n}`, a: `${Math.floor(n / d)} r ${n % d}` }; } }],
    [{ text: 'Use long division. Divide, multiply, subtract, bring down.', gen: () => { const d = ri(12, 29), q = ri(21, 69), a = d * q, t = Math.floor(q / 10), u = q % 10; const first = Math.floor(a / 10); return { q: `${N(a)} ÷ ${d}`, a: String(q), lines: [`${first} ÷ ${d} = ${t} r ${first - t * d}`, `bring down: ${(first - t * d) * 10 + (a % 10)} ÷ ${d} = ${u}`, `answer: ${q}`] }; } }],
    [{ text: 'Use long division, then answer the question.', gen: () => { const d = ri(21, 45), q = ri(12, 40), r = ri(1, d - 1), a = d * q + r; return { q: `${a} students are put into teams of ${d}. How many full teams, and how many students are left over?`, a: `${q} teams, ${r} left over`, lines: [`${a} ÷ ${d}`, `= ${q} r ${r}`, `${q} full teams, ${r} left over`] }; } }],
  ],
  '3.06': ({ ri }) => [
    [{ text: 'Write each Roman numeral as a number. I = 1, V = 5, X = 10, L = 50, C = 100.', gen: () => { const n = ri(2, 99); return { q: roman(n), a: String(n) }; } },
      { text: 'Write each number in Roman numerals.', gen: () => { const n = ri(2, 99); return { q: String(n), a: roman(n) }; } }],
    [{ text: 'Split the number into place values, then write each part in Roman numerals.', gen: () => { const n = ri(101, 999); const ps = romanParts(n); const groups = []; ps.forEach(([v, r]) => { const k = String(v).length; const g = groups.find((x) => x.k === k); if (g) { g.v += v; g.r += r; } else groups.push({ k, v, r }); }); return { q: String(n), a: roman(n), lines: [`${groups.map((g) => g.v).join(' + ')}`, `${groups.map((g) => g.r).join(' + ')} = ${roman(n)}`] }; } }],
    [{ text: 'Write each year in Roman numerals. Show the parts.', gen: () => { const n = ri(1800, 2030); const th = Math.floor(n / 1000) * 1000, h = Math.floor((n % 1000) / 100) * 100, t = Math.floor((n % 100) / 10) * 10, u = n % 10; const parts = [th, h, t, u].filter(Boolean); return { q: `the year ${n}`, a: roman(n), lines: [parts.join(' + '), parts.map(roman).join(' + '), `= ${roman(n)}`] }; } }],
  ],
  '3.07': ({ ri, pick }) => [
    [{ text: 'Write in index notation: count how many times the number is multiplied.', gen: () => { const b = ri(2, 9), k = ri(2, 6); return { q: Array(k).fill(b).join(' × '), a: `${b}${sup(k)}` }; } },
      { text: 'Evaluate each power.', gen: () => { const b = ri(2, 10), k = b <= 3 ? ri(2, 5) : b <= 5 ? ri(2, 3) : 2; return { q: `${b}${sup(k)}`, a: N(b ** k) }; } }],
    [{ text: 'Write the power as a product, then evaluate it.', gen: () => { const b = ri(2, 6), k = b < 4 ? ri(3, 5) : 3; return { q: `${b}${sup(k)}`, a: N(b ** k), lines: [`= ${Array(k).fill(b).join(' × ')}`, `= ${N(b ** k)}`] }; } }],
    [{ text: 'Evaluate each power first, then do the operation.', gen: () => { const a = ri(2, 5), b = ri(2, 3), c = ri(2, 5), op = pick(['+', '×', '−']); const x = a ** b, y = c ** 2; if (op === '−' && y >= x) return { q: '' }; const v = op === '+' ? x + y : op === '×' ? x * y : x - y; return { q: `${a}${sup(b)} ${op} ${c}${sup(2)}`, a: N(v), lines: [`= ${x} ${op} ${y}`, `= ${N(v)}`] }; } }],
  ],
  '3.08': ({ ri }) => [
    [{ text: 'Evaluate each square root: which number, squared, gives this?', gen: () => { const a = ri(1, 20); return { q: `√${a * a}`, a: String(a) }; } },
      { text: 'Evaluate each cube root: which number, cubed, gives this?', gen: () => { const a = ri(1, 10); return { q: `∛${a ** 3}`, a: String(a) }; } }],
    [{ text: 'Between which two whole numbers is the square root? Use the squares either side.', gen: () => { const n = ri(3, 150), a = Math.floor(Math.sqrt(n)); if (a * a === n) return { q: '' }; return { q: `√${n}`, a: `${a} and ${a + 1}`, lines: [`${a}${sup(2)} = ${a * a}, ${a + 1}${sup(2)} = ${(a + 1) ** 2}`, `between ${a} and ${a + 1}`] }; } }],
    [{ text: 'Evaluate. Roots and powers first.', gen: () => { const a = ri(2, 12), b = ri(2, 5), c = ri(2, 6); return { q: `√${a * a} + ∛${b ** 3} × ${c}`, a: String(a + b * c), lines: [`= ${a} + ${b} × ${c}`, `= ${a} + ${b * c}`, `= ${a + b * c}`] }; } }],
  ],
  '3.09': ({ ri }) => [
    [{ text: 'Prime (P) or composite (C)? A prime has exactly two factors.', gen: () => { const n = ri(2, 99); return { q: String(n), a: isPrime(n) ? 'P' : 'C' }; } }],
    [{ text: 'List all the factors in pairs.', gen: () => { const n = ri(12, 60); const f = factors(n); const pairs = f.filter((x) => x * x <= n).map((x) => `${x} × ${n / x}`); return f.length < 4 ? { q: '' } : { q: String(n), a: f.join(', '), lines: [pairs.join(', '), `factors: ${f.join(', ')}`] }; } }],
    [{ text: 'Test each number for primes: try dividing by 2, 3, 5 and 7.', gen: () => { const n = ri(51, 149); if (n % 2 === 0) return { q: '' }; const d = [3, 5, 7, 11].find((p) => n % p === 0 && p < n); return { q: `Is ${n} prime?`, a: d ? `no, ${n} = ${d} × ${n / d}` : 'yes', lines: [d ? `${n} ÷ ${d} = ${n / d}` : `not divisible by 2, 3, 5, 7 or 11`, d ? `composite: ${n} = ${d} × ${n / d}` : `${n} is prime`] }; } }],
  ],
  '3.10': ({ ri, pick }) => [
    [{ text: 'Write each number as a product of two prime numbers.', gen: () => { const p = [2, 3, 5, 7, 11, 13]; const a = pick(p), b = pick(p); return a > b ? { q: '' } : { q: String(a * b), a: `${a} × ${b}` }; } }],
    [{ text: 'Divide by primes until you reach 1. Write the answer in index notation.', gen: () => { const n = pick([2, 2, 3, 5]) * pick([2, 3, 3, 5]) * pick([2, 4, 6, 3, 7]); const f = primeList(n); if (f.length < 3 || n > 200) return { q: '' }; let m = n; const steps = f.slice(0, 3).map((p) => { const s = `${m} ÷ ${p} = ${m / p}`; m /= p; return s; }); return { q: String(n), a: index(n), lines: [steps.slice(0, 2).join(', '), steps[2] + (f.length > 3 ? ', …' : ''), `${n} = ${index(n)}`] }; } }],
    [{ text: 'Use prime factors to find the root. Pair up (or group) the factors.', kinds: 2, gen: (i) => {
      if (i % 2 === 0) { const r = pick([6, 10, 12, 14, 15, 18, 21, 22, 30]); const f = primeList(r); return { q: `√${r * r}`, a: String(r), lines: [`${r * r} = ${index(r * r)}`, `= (${f.join(' × ')})${sup(2)}`, `√${r * r} = ${r}`] }; }
      const r = pick([6, 10, 12, 15]); const f = primeList(r); return { q: `∛${N(r ** 3)}`, a: String(r), lines: [`${N(r ** 3)} = ${index(r ** 3)}`, `= (${f.join(' × ')})${sup(3)}`, `∛${N(r ** 3)} = ${r}`] };
    } }],
  ],
  '3.11': ({ ri }) => [
    [{ text: 'Find the highest common factor (HCF): the largest number that divides both.', gen: () => { const g = ri(2, 9), a = ri(1, 7) * g, b = ri(1, 7) * g; return a === b ? { q: '' } : { q: `${a} and ${b}`, a: String(gcd(a, b)) }; } }],
    [{ text: 'List the factors of each number, then circle the highest common factor.', gen: () => { const g = ri(2, 8), a = ri(2, 6) * g, b = ri(2, 6) * g; if (a === b || a > 48 || b > 48) return { q: '' }; return { q: `${a} and ${b}`, a: String(gcd(a, b)), lines: [`${a}: ${factors(a).join(', ')}`, `${b}: ${factors(b).join(', ')}`, `HCF = ${gcd(a, b)}`] }; } }],
    [{ text: 'Use prime factors: the HCF is the product of the primes they share.', gen: () => { const g = [6, 12, 18, 14, 10, 15][ri(0, 5)], a = g * ri(2, 5), b = g * ri(2, 7); if (a === b || gcd(a, b) !== g) return { q: '' }; return { q: `${a} and ${b}`, a: String(g), lines: [`${a} = ${primeList(a).join(' × ')}`, `${b} = ${primeList(b).join(' × ')}`, `HCF = ${primeList(g).join(' × ')} = ${g}`] }; } }],
  ],
  '3.12': ({ ri }) => [
    [{ text: 'Find the lowest common multiple (LCM): the smallest number both go into.', gen: () => { const a = ri(2, 12), b = ri(2, 12); return a === b ? { q: '' } : { q: `${a} and ${b}`, a: String(lcm(a, b)) }; } }],
    [{ text: 'List multiples of each number until you find one in both lists.', gen: () => { const a = ri(3, 12), b = ri(3, 12); const l = lcm(a, b); if (a === b || l / a > 6 || l / b > 6) return { q: '' }; const m = (x) => Array.from({ length: l / x }, (_, i) => x * (i + 1)).join(', '); return { q: `${a} and ${b}`, a: String(l), lines: [`${a}: ${m(a)}`, `${b}: ${m(b)}`, `LCM = ${l}`] }; } }],
    [{ text: 'Use the LCM to answer the question.', gen: () => { const a = ri(3, 12), b = ri(4, 15); if (a === b) return { q: '' }; const l = lcm(a, b); return { q: `One bus leaves every ${a} minutes, another every ${b} minutes. Both leave at 8:00. After how many minutes do they next leave together?`, a: `${l} minutes`, lines: [`LCM of ${a} and ${b}`, `= ${l}`, `after ${l} minutes`] }; } }],
  ],
};
