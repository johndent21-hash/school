// Skill drill pages for Chapter 3 Whole numbers: page 1 practises the Easy basics, page 2 the Medium basics (lib/drill.js).
const { gcd } = require('../../lib/calc');

const roman = (n) => [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']].reduce((s, [v, r]) => { while (n >= v) { s += r; n -= v; } return s; }, '');
const isPrime = (n) => { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };
const factors = (n) => { const f = []; for (let d = 1; d <= n; d++) if (n % d === 0) f.push(d); return f; };
const sup = (p) => `<sup>${p}</sup>`;
// Prime factors in index notation: 360 → 2³ × 3² × 5
const pf = (n) => { const m = new Map(); for (let d = 2; n > 1; d++) while (n % d === 0) { m.set(d, (m.get(d) || 0) + 1); n /= d; } return [...m].map(([p, k]) => (k > 1 ? `${p}${sup(k)}` : `${p}`)).join(' × '); };
const lcm = (a, b) => (a * b) / gcd(a, b);
const roundTo = (n, to) => Math.round(n / to) * to;
const lead = (n) => { const p = 10 ** (String(n).length - 1); return roundTo(n, p); };

module.exports = {
  '3.01': ({ round, ri, pick, N }) => ({
    easy: [
      round('round to the place given.', 21, () => { const to = pick([10, 100, 1000]), n = ri(to + 1, to * 99); return n % to === 0 ? ['', ''] : [`${N(n)} (nearest ${N(to)})`, N(roundTo(n, to))]; }, { cols: 3 }),
      round('estimate: round each number to the nearest 10 first.', 16, () => { const a = ri(11, 99), b = ri(11, 99), op = pick(['+', '−']); return op === '−' && b > a ? ['', ''] : [`${a} ${op} ${b}`, `${N(roundTo(a, 10))} ${op} ${N(roundTo(b, 10))} = ${N(op === '+' ? roundTo(a, 10) + roundTo(b, 10) : roundTo(a, 10) - roundTo(b, 10))}`]; }),
    ],
    medium: [
      round('round to the first (leading) digit.', 20, () => { const n = ri(11, 99) * 10 ** ri(0, 3) + ri(0, 9); return [N(n), N(lead(n))]; }),
      round('estimate: round each number to its leading digit first.', 15, () => { const a = ri(12, 98), b = ri(12, 980), op = pick(['×', '÷']); return op === '×' ? [`${a} × ${b}`, `${lead(a)} × ${lead(b)} = ${N(lead(a) * lead(b))}`] : ['', '']; }, { cols: 3 }),
    ],
  }),
  '3.02': ({ round, ri, pick, N }) => ({
    easy: [
      round('know your times tables.', 28, () => { const a = ri(2, 12), b = ri(2, 12); return [`${a} × ${b}`, a * b]; }),
      round('multiply by 10, 100 or 1000: move the digits.', 16, () => { const a = ri(3, 950), p = pick([10, 100, 1000]); return [`${a} × ${N(p)}`, N(a * p)]; }),
    ],
    medium: [
      round('evaluate mentally. Split the number: 34 × 6 = 30 × 6 + 4 × 6.', 20, () => { const a = ri(12, 99), b = ri(3, 9); return a % 10 === 0 ? ['', ''] : [`${a} × ${b}`, N(a * b)]; }),
      round('evaluate on paper.', 12, () => { const a = ri(112, 989), b = ri(3, 9); return [`${a} × ${b}`, N(a * b)]; }, { cols: 3, work: true }),
    ],
  }),
  '3.03': ({ round, ri, pick, N }) => ({
    easy: [
      round('know your division facts.', 28, () => { const a = ri(2, 12), b = ri(2, 12); return [`${a * b} ÷ ${b}`, a]; }),
      round('divide by 10, 100 or 1000.', 16, () => { const p = pick([10, 100, 1000]), a = ri(2, 95) * p; return [`${N(a)} ÷ ${N(p)}`, N(a / p)]; }),
    ],
    medium: [
      round('evaluate mentally.', 20, () => { const b = ri(2, 9), a = ri(11, 60); return [`${a * b} ÷ ${b}`, a]; }),
      round('use short division. Write any remainder.', 12, () => { const b = ri(3, 9), a = ri(105, 999); return [`${a} ÷ ${b}`, `${Math.floor(a / b)}${a % b ? ` r ${a % b}` : ''}`]; }, { cols: 3, work: true }),
    ],
  }),
  '3.04': ({ round, ri, pick, N }) => ({
    easy: [
      round('is the number divisible by the number in brackets? Write yes or no.', 24, () => { const d = pick([2, 5, 10]), n = ri(100, 9999); return [`${N(n)} (${d})`, n % d === 0 ? 'yes' : 'no']; }),
      round('find the digit sum. Is the number divisible by 3?', 16, () => { const n = ri(100, 9999); const s = [...String(n)].reduce((t, c) => t + +c, 0); return [N(n), `${s}, ${n % 3 === 0 ? 'yes' : 'no'}`]; }),
    ],
    medium: [
      round('divisible by 4? Check the last two digits. Write yes or no.', 16, () => { const n = ri(100, 9999); return [N(n), n % 4 === 0 ? 'yes' : 'no']; }),
      round('is the number divisible by 6 (by 2 and 3) or 9 (digit sum)? Write yes or no.', 16, () => { const d = pick([6, 9]), n = ri(100, 9999) - (ri(0, 1) ? 0 : 0); const m = ri(0, 1) ? n - (n % d) : n; return m < 100 ? ['', ''] : [`${N(m)} (${d})`, m % d === 0 ? 'yes' : 'no']; }),
    ],
  }),
  '3.05': ({ round, ri, N }) => ({
    easy: [
      round('know your multiples.', 24, () => { const a = ri(11, 25), b = ri(2, 9); return [`${a} × ${b}`, a * b]; }),
      round('how many times does the first number go into the second? Write any remainder.', 16, () => { const d = ri(11, 25), n = ri(d * 2, d * 9 + d - 1); return [`${d} into ${n}`, `${Math.floor(n / d)}${n % d ? ` r ${n % d}` : ''}`]; }),
    ],
    medium: [
      round('use long division.', 9, () => { const d = ri(12, 35), q = ri(21, 99); return [`${N(d * q)} ÷ ${d}`, q]; }, { cols: 3, work: true }),
      round('use long division. Write the remainder.', 6, () => { const d = ri(12, 35), q = ri(21, 99), r = ri(1, d - 1); return [`${N(d * q + r)} ÷ ${d}`, `${q} r ${r}`]; }, { cols: 3, work: true }),
    ],
  }),
  '3.06': ({ round, ri }) => ({
    easy: [
      round('write each Roman numeral as a number.', 24, () => { const n = ri(1, 100); return [roman(n), n]; }),
      round('write each number in Roman numerals.', 16, () => { const n = ri(1, 100); return [String(n), roman(n)]; }),
    ],
    medium: [
      round('write each Roman numeral as a number.', 16, () => { const n = ri(100, 2000); return [roman(n), n]; }),
      round('write each year in Roman numerals.', 15, () => { const n = ri(1900, 2030); return [String(n), roman(n)]; }, { cols: 3 }),
    ],
  }),
  '3.07': ({ round, ri, pick, N }) => ({
    easy: [
      round('write in index notation.', 15, () => { const b = ri(2, 9), k = ri(2, 6); return [Array(k).fill(b).join(' × '), `${b}${sup(k)}`]; }, { cols: 3 }),
      round('evaluate each power.', 16, () => { const b = ri(2, 10), k = b <= 3 ? ri(2, 5) : b <= 5 ? ri(2, 3) : 2; return [`${b}${sup(k)}`, N(b ** k)]; }),
    ],
    medium: [
      round('write the base and the index, then evaluate.', 16, () => { const b = ri(2, 7), k = ri(2, 4); return [`${b}${sup(k)}`, `base ${b}, index ${k}, = ${N(b ** k)}`]; }),
      round('evaluate. Powers first.', 15, () => { const a = ri(2, 5), b = ri(2, 3), c = ri(2, 4), op = pick(['×', '+', '−']); const x = a ** b, y = c ** 2; return op === '−' && y > x ? ['', ''] : [`${a}${sup(b)} ${op} ${c}${sup(2)}`, N(op === '×' ? x * y : op === '+' ? x + y : x - y)]; }, { cols: 3 }),
    ],
  }),
  '3.08': ({ round, ri }) => ({
    easy: [
      round('evaluate each square root.', 20, () => { const a = ri(1, 25); return [`√${a * a}`, a]; }),
      round('evaluate each square.', 16, () => { const a = ri(1, 20); return [`${a}${sup(2)}`, a * a]; }),
    ],
    medium: [
      round('evaluate each cube root or cube.', 20, () => { const a = ri(1, 10); return ri(0, 1) ? [`∛${a ** 3}`, a] : [`${a}${sup(3)}`, a ** 3]; }),
      round('between which two whole numbers is it?', 15, () => { const n = ri(2, 150); const a = Math.floor(Math.sqrt(n)); return a * a === n ? ['', ''] : [`√${n}`, `${a} and ${a + 1}`]; }, { cols: 3 }),
    ],
  }),
  '3.09': ({ round, ri }) => ({
    easy: [
      round('prime (P) or composite (C)?', 28, () => { const n = ri(2, 99); return [String(n), isPrime(n) ? 'P' : 'C']; }),
      round('list all the factors.', 12, () => { const n = ri(6, 48); return [String(n), factors(n).join(', ')]; }, { cols: 3 }),
    ],
    medium: [
      round('how many factors does the number have?', 16, () => { const n = ri(10, 100); return [String(n), factors(n).length]; }),
      round('prime? Write P. If not, write a factor pair (other than 1 and itself).', 15, () => { const n = ri(51, 199); if (isPrime(n)) return [String(n), 'P']; const d = factors(n)[1]; return [String(n), `e.g. ${d} × ${n / d}`]; }, { cols: 3 }),
    ],
  }),
  '3.10': ({ round, ri, pick }) => {
    const primes = [2, 3, 5, 7, 11, 13];
    return {
      easy: [
        round('write as a product of two prime numbers.', 20, () => { const a = pick(primes), b = pick(primes); return a > b ? ['', ''] : [String(a * b), `${a} × ${b}`]; }),
        round('write as a product of prime factors in index notation.', 12, () => { const n = ri(8, 72); return isPrime(n) ? ['', ''] : [String(n), pf(n)]; }, { cols: 3 }),
      ],
      medium: [
        round('draw a factor tree, then write the number as a product of primes in index notation.', 9, () => { const n = ri(60, 400); return isPrime(n) || n % 10 === 5 && n > 300 ? ['', ''] : [String(n), pf(n)]; }, { cols: 3, work: true }),
        round('evaluate.', 16, () => { const a = ri(1, 3), b = ri(0, 2), c = ri(0, 1); const parts = [`2${a > 1 ? sup(a) : ''}`, ...(b ? [`3${b > 1 ? sup(b) : ''}`] : []), ...(c ? ['5'] : [])]; return [parts.join(' × '), 2 ** a * 3 ** b * 5 ** c]; }),
      ],
    };
  },
  '3.11': ({ round, ri }) => ({
    easy: [
      round('find the highest common factor (HCF).', 24, () => { const g = ri(2, 9), a = ri(1, 7) * g, b = ri(1, 7) * g; return a === b ? ['', ''] : [`${a} and ${b}`, gcd(a, b)]; }),
      round('list the common factors.', 12, () => { const g = ri(2, 6), a = ri(2, 6) * g, b = ri(2, 6) * g; return a === b ? ['', ''] : [`${a} and ${b}`, factors(gcd(a, b)).join(', ')]; }, { cols: 3 }),
    ],
    medium: [
      round('find the HCF.', 16, () => { const g = ri(4, 18), a = ri(2, 9) * g, b = ri(2, 9) * g; return a === b ? ['', ''] : [`${a} and ${b}`, gcd(a, b)]; }),
      round('find the HCF of the three numbers.', 15, () => { const g = ri(2, 12), a = ri(1, 6) * g, b = ri(1, 6) * g, c = ri(1, 6) * g; return new Set([a, b, c]).size < 3 ? ['', ''] : [`${a}, ${b} and ${c}`, gcd(gcd(a, b), c)]; }, { cols: 3 }),
    ],
  }),
  '3.12': ({ round, ri }) => ({
    easy: [
      round('find the lowest common multiple (LCM).', 24, () => { const a = ri(2, 12), b = ri(2, 12); return a === b ? ['', ''] : [`${a} and ${b}`, lcm(a, b)]; }),
      round('write the first three common multiples.', 12, () => { const a = ri(2, 8), b = ri(2, 8); const l = lcm(a, b); return a === b ? ['', ''] : [`${a} and ${b}`, `${l}, ${2 * l}, ${3 * l}`]; }, { cols: 3 }),
    ],
    medium: [
      round('find the LCM.', 16, () => { const a = ri(6, 24), b = ri(6, 24); return a === b ? ['', ''] : [`${a} and ${b}`, lcm(a, b)]; }),
      round('find the LCM of the three numbers.', 15, () => { const a = ri(2, 10), b = ri(2, 10), c = ri(2, 10); return new Set([a, b, c]).size < 3 ? ['', ''] : [`${a}, ${b} and ${c}`, lcm(lcm(a, b), c)]; }, { cols: 3 }),
    ],
  }),
};
