// Skill drill pages for Chapter 7 Decimals: page 1 practises the Easy basics, page 2 the Medium basics (lib/drill.js).
const { F, simp, gcd, fmt } = require('../../lib/calc');

const d = (x, dp = 3) => fmt(x, dp);                     // decimal as the booklet writes it
const R = (x, dp) => fmt(Math.round(x * 10 ** dp + 1e-9) / 10 ** dp, dp);  // rounded, trailing zeros dropped
const Rz = (x, dp) => (Math.round(x * 10 ** dp + 1e-9) / 10 ** dp).toFixed(dp);  // rounded, keeping zeros (2.50)
const frac = ([n, den]) => { const [a, b] = simp([n, den]); if (b === 1) return String(a); const w = Math.floor(a / b); return w ? F(a % b, b, w) : F(a, b); };
const dot = (s) => `${s}̇`; // a recurring digit: 0.3̇
const money = (x) => `$${x.toFixed(2)}`;

module.exports = {
  '7.01': ({ round, ri, pick }) => ({
    easy: [
      round('which decimal is larger?', 24, () => { const a = ri(1, 9) + ri(0, 99) / 100, b = pick([a + ri(1, 9) / 10, a + ri(1, 9) / 100, a - ri(1, 9) / 100, Math.floor(a) + ri(1, 9) / 10]); return Math.abs(a - b) < 1e-9 || b <= 0 ? ['', ''] : [`${d(a)} or ${d(b)}`, d(Math.max(a, b))]; }),
      round('write the value of the digit in bold.', 16, () => { const s = `${ri(1, 9)}.${ri(1, 9)}${ri(1, 9)}${ri(1, 9)}`; const i = pick([0, 2, 3, 4]); const names = { 0: 'ones', 2: 'tenths', 3: 'hundredths', 4: 'thousandths' }; return [s.slice(0, i) + `<b><u>${s[i]}</u></b>` + s.slice(i + 1), `${s[i]} ${names[i]}`]; }),
    ],
    medium: [
      round('write the decimals in ascending order (smallest first).', 10, () => { const w = ri(0, 5); const xs = [...new Set([w + ri(1, 9) / 10, w + ri(1, 99) / 100, w + ri(1, 999) / 1000, w + ri(1, 9) / 10 + ri(1, 9) / 100])]; return xs.length < 4 ? ['', ''] : [pick([xs, [...xs].reverse()]).map((x) => d(x)).join(', '), [...xs].sort((a, b) => a - b).map((x) => d(x)).join(', ')]; }, { cols: 2 }),
      round('write &lt; or &gt; in the box.', 20, () => { const a = ri(0, 9) + ri(1, 999) / 1000, b = ri(0, 9) + ri(1, 99) / 100; return Math.abs(a - b) < 1e-9 ? ['', ''] : [`${d(a)} ☐ ${d(b)}`, a < b ? '<' : '>']; }),
    ],
  }),
  '7.02': ({ round, ri, pick }) => ({
    easy: [
      round('write each decimal as a fraction in simplest form.', 24, () => { const n = pick([ri(1, 9), ri(1, 99)]), den = n < 10 && ri(0, 1) ? 10 : 100; return n % 10 === 0 && den === 100 ? ['', ''] : [d(n / den), frac([n, den])]; }),
      round('write each fraction as a decimal.', 16, () => { const den = pick([10, 100, 1000]), n = ri(1, den - 1); return [F(n, den), d(n / den)]; }),
    ],
    medium: [
      round('write as a fraction in simplest form.', 16, () => { const n = ri(1, 999); return n % 10 === 0 ? ['', ''] : [d(n / 1000), frac([n, 1000])]; }),
      round('write as a mixed numeral in simplest form.', 15, () => { const w = ri(1, 9), n = ri(1, 99); return [d(w + n / 100), frac([w * 100 + n, 100])]; }, { cols: 3 }),
    ],
  }),
  '7.03': ({ round, ri, pick }) => ({
    easy: [
      round('evaluate. Line up the decimal points.', 24, () => { const a = ri(11, 99) / 10, b = ri(11, 99) / 10, op = pick(['+', '−']); return op === '−' && b > a ? ['', ''] : [`${d(a)} ${op} ${d(b)}`, d(op === '+' ? a + b : a - b)]; }),
      round('evaluate.', 16, () => { const a = ri(101, 999) / 100, b = ri(101, 999) / 100, op = pick(['+', '−']); return op === '−' && b > a ? ['', ''] : [`${d(a)} ${op} ${d(b)}`, d(op === '+' ? a + b : a - b)]; }),
    ],
    medium: [
      round('evaluate. Fill the empty places with zeros.', 16, () => { const a = ri(10, 400) / pick([1, 10]), b = ri(1, 999) / 100, op = pick(['+', '−']); return op === '−' && b > a ? ['', ''] : [`${d(a)} ${op} ${d(b)}`, d(op === '+' ? a + b : a - b)]; }),
      round('evaluate. Work from left to right.', 12, () => { const a = ri(100, 2000) / 100, b = ri(10, 900) / 100, c = ri(1, 99) / 10; const r = a + b - c; return r <= 0 ? ['', ''] : [`${d(a)} + ${d(b)} − ${d(c)}`, d(r)]; }, { cols: 3 }),
    ],
  }),
  '7.04': ({ round, ri, pick }) => ({
    easy: [
      round('multiply. Move the digits left by one place for each zero.', 24, () => { const a = ri(1, 999) / pick([10, 100, 1000]), p = pick([10, 100, 1000]); return [`${d(a)} × ${fmt(p)}`, d(a * p)]; }),
      round('divide. Move the digits right by one place for each zero.', 16, () => { const a = ri(1, 9999) / pick([1, 10]), p = pick([10, 100, 1000]); return [`${d(a)} ÷ ${fmt(p)}`, d(a / p, 6)]; }),
    ],
    medium: [
      round('evaluate.', 20, () => { const a = ri(1, 999) / pick([10, 100]), p = pick([10, 100, 1000, 10000]), op = pick(['×', '÷']); return [`${d(a)} ${op} ${fmt(p)}`, d(op === '×' ? a * p : a / p, 7)]; }),
      round('find the missing power of 10.', 16, () => { const a = ri(1, 999) / 100, p = pick([10, 100, 1000]), op = pick(['×', '÷']); return [`${d(a)} ${op} ☐ = ${d(op === '×' ? a * p : a / p, 7)}`, fmt(p)]; }),
    ],
  }),
  '7.05': ({ round, ri, pick }) => {
    const fact = () => { const a = ri(12, 49), b = ri(12, 49); return [a, b, a * b]; };
    return {
      easy: [
        round('use the fact given to find the answer. Count the decimal places.', 14, () => { const [a, b, c] = fact(), p = pick([10, 100]), q = pick([1, 10, 100]); return [`${a} × ${b} = ${fmt(c)}. Find ${d(a / p)} × ${d(b / q)}.`, d((a / p) * (b / q), 6)]; }, { cols: 2 }),
        round('use your times tables (0.6 × 0.07: think 6 × 7 = 42, then count 3 decimal places).', 16, () => { const a = ri(2, 12), b = ri(2, 9), p = pick([1, 10, 100]), q = pick([10, 100]); return [`${d(a / p)} × ${d(b / q)}`, d((a * b) / p / q, 6)]; }),
      ],
      medium: [
        round('use the fact given to find each answer.', 12, () => { const [a, b, c] = fact(), p = pick([10, 100]); return [`${a} × ${b} = ${fmt(c)}. Find ${d(c / p)} ÷ ${b}.`, d(a / p, 6)]; }, { cols: 2 }),
        round('use the fact given to find each answer.', 12, () => { const [a, b, c] = fact(), p = pick([10, 100]), q = pick([10, 100]); return [`${a} × ${b} = ${fmt(c)}. Find ${d(a * p)} × ${d(b / q)}.`, d(a * p * (b / q), 6)]; }, { cols: 2 }),
      ],
    };
  },
  '7.06': ({ round, ri, pick }) => ({
    easy: [
      round('evaluate.', 24, () => { const a = ri(11, 99) / 10, b = ri(2, 9); return [`${d(a)} × ${b}`, d(a * b)]; }),
      round('evaluate. Count the decimal places in the question.', 16, () => { const a = ri(1, 9) / 10, b = ri(1, 9) / pick([10, 100]); return [`${d(a)} × ${d(b)}`, d(a * b, 6)]; }),
    ],
    medium: [
      round('evaluate.', 16, () => { const a = ri(11, 99) / 100, b = ri(11, 99) / 10; return [`${d(a)} × ${d(b)}`, d(a * b, 6)]; }),
      round('evaluate on paper.', 9, () => { const a = ri(101, 999) / 100, b = ri(11, 99) / 10; return [`${d(a)} × ${d(b)}`, d(a * b, 6)]; }, { cols: 3, work: true }),
    ],
  }),
  '7.07': ({ round, ri, pick }) => ({
    easy: [
      round('evaluate. Keep the decimal point in line.', 24, () => { const b = ri(2, 9), q = ri(11, 99) / 10; return [`${d(q * b)} ÷ ${b}`, d(q)]; }),
      round('evaluate.', 16, () => { const b = ri(2, 9), q = ri(101, 999) / 100; return [`${d(q * b)} ÷ ${b}`, d(q)]; }),
    ],
    medium: [
      round('evaluate. Add zeros after the last digit if you need to.', 16, () => { const b = pick([2, 4, 5, 8]), a = ri(11, 99) / 10; const q = a / b; return String(q).length > 7 ? ['', ''] : [`${d(a)} ÷ ${b}`, d(q, 6)]; }),
      round('share the amount equally.', 12, () => { const n = ri(2, 8), each = ri(125, 2500) / 100; const t = Math.round(each * n * 100) / 100; return [`${money(t)} between ${n} people`, money(t / n)]; }, { cols: 3 }),
    ],
  }),
  '7.08': ({ round, ri, pick }) => ({
    easy: [
      round('evaluate. Make the divisor a whole number first (× 10 both).', 24, () => { const b = ri(2, 9) / 10, q = ri(2, 30); return [`${d(q * b)} ÷ ${d(b)}`, q]; }),
      round('evaluate.', 16, () => { const b = pick([0.1, 0.2, 0.5, 0.25]), q = ri(2, 40); return [`${d(q * b)} ÷ ${d(b)}`, q]; }),
    ],
    medium: [
      round('evaluate.', 16, () => { const b = ri(2, 9) / 10, q = ri(11, 99) / 10; return [`${d(q * b)} ÷ ${d(b)}`, d(q)]; }),
      round('evaluate. Multiply both numbers by 100 first.', 12, () => { const b = ri(2, 9) / 100, q = ri(2, 90); return [`${d(q * b)} ÷ ${d(b)}`, q]; }, { cols: 3 }),
    ],
  }),
  '7.09': ({ round, ri, pick, list }) => ({
    easy: [
      round('write each fraction as a decimal.', 24, () => { const den = pick([2, 4, 5, 8, 10, 20, 25, 50]), n = ri(1, den - 1); return gcd(n, den) > 1 ? ['', ''] : [F(n, den), d(n / den)]; }),
      list('write as a recurring decimal. Put a dot over the digit that repeats.', [[F(1, 3), dot('0.3')], [F(2, 3), dot('0.6')], [F(1, 9), dot('0.1')], [F(4, 9), dot('0.4')], [F(5, 9), dot('0.5')], [F(7, 9), dot('0.7')], [F(1, 6), dot('0.16')], [F(5, 6), dot('0.83')],
        [F(8, 9), dot('0.8')], [F(2, 9), dot('0.2')], [F(1, 12), dot('0.083')], [F(4, 3), dot('1.3')], [F(5, 3), dot('1.6')], [F(7, 6), dot('1.16')], [F(1, 15), dot('0.06')], [F(1, 30), dot('0.03')]]),
    ],
    medium: [
      round('write each mixed numeral as a decimal.', 16, () => { const den = pick([2, 4, 5, 8, 20, 25]), n = ri(1, den - 1), w = ri(1, 9); return gcd(n, den) > 1 ? ['', ''] : [F(n, den, w), d(w + n / den)]; }),
      round('which is larger? Change the fraction to a decimal first.', 16, () => { const den = pick([4, 5, 8, 20]), n = ri(1, den - 1), x = ri(1, 99) / 100; return gcd(n, den) > 1 || Math.abs(n / den - x) < 1e-9 ? ['', ''] : [`${F(n, den)} or ${d(x)}`, n / den > x ? F(n, den) : d(x)]; }),
    ],
  }),
  '7.10': ({ round, ri }) => ({
    easy: [
      round('round to 1 decimal place.', 24, () => { const x = ri(100, 9999) / 100; return x * 100 % 10 === 0 ? ['', ''] : [d(x), Rz(x, 1)]; }),
      round('round to 2 decimal places.', 16, () => { const x = ri(1000, 99999) / 1000; return [d(x), Rz(x, 2)]; }),
    ],
    medium: [
      round('round to the place given.', 16, () => { const x = ri(10000, 999999) / 10000, p = ri(0, 3); return [`${d(x, 4)} (${['nearest whole', '1 d.p.', '2 d.p.', '3 d.p.'][p]})`, p ? Rz(x, p) : R(x, 0)]; }),
      round('use your calculator, then round the answer to 2 decimal places.', 16, () => { const a = ri(1, 50), b = ri(3, 13); return a % b === 0 ? ['', ''] : [`${a} ÷ ${b}`, Rz(a / b, 2)]; }),
    ],
  }),
  '7.11': ({ round, ri, pick }) => ({
    easy: [
      round('add the prices.', 18, () => { const a = ri(50, 2000) / 100, b = ri(50, 2000) / 100; return [`${money(a)} + ${money(b)}`, money(a + b)]; }, { cols: 3 }),
      round('find the change.', 16, () => { const p = pick([10, 20, 50]), c = ri(105, p * 100 - 5) / 100; return [`${money(c)} from $${p}`, money(p - c)]; }),
    ],
    medium: [
      round('find the total cost.', 12, () => { const n = ri(2, 9), c = ri(45, 1500) / 100; return [`${n} items at ${money(c)} each`, money(n * c)]; }, { cols: 3 }),
      round('round to the nearest 5 cents (cash rounding).', 16, () => { const c = ri(101, 9999) / 100; return [money(c), money(Math.round(c * 20) / 20)]; }),
    ],
  }),
};
