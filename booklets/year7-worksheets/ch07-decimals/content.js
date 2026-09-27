// Worksheet questions for Chapter 7 Decimals (lib/worksheet.js). See ../ch01-integers/content.js for the format.
const { F, simp, gcd, fmt } = require('../../lib/calc');

const d = (x, dp = 4) => fmt(x, dp);
const Rz = (x, dp) => (Math.round(x * 10 ** dp + 1e-9) / 10 ** dp).toFixed(dp);
const frac = ([n, den]) => { const [a, b] = simp([n, den]); if (b === 1) return String(a); const w = Math.floor(a / b); return w ? F(a % b, b, w) : F(a, b); };
const money = (x) => `$${x.toFixed(2)}`;
const dp = (x) => (String(x).split('.')[1] || '').length;

module.exports = {
  '7.01': ({ ri, pick }) => [
    [{ text: 'Which decimal is larger? Compare the digits place by place from the left.', gen: () => { const a = ri(1, 9) + ri(1, 99) / 100, b = pick([a + ri(1, 9) / 10, a + ri(1, 9) / 100, a - ri(1, 9) / 100, Math.floor(a) + ri(1, 9) / 10]); return Math.abs(a - b) < 1e-9 || b <= 0 ? { q: '' } : { q: `${d(a)} or ${d(b)}`, a: d(Math.max(a, b)) }; } }],
    [{ text: 'Write the decimals in ascending order. Add zeros so they all have the same number of places.', gen: () => { const w = ri(0, 5); const xs = [...new Set([w + ri(1, 9) / 10, w + ri(1, 99) / 100, w + ri(1, 999) / 1000, w + ri(10, 99) / 100])]; if (xs.length < 4) return { q: '' }; const o = [...xs].sort((p, q) => p - q); return { q: xs.map((x) => d(x)).join(', '), a: o.map((x) => d(x)).join(', '), lines: [xs.map((x) => x.toFixed(3)).join(', '), o.map((x) => d(x)).join(', ')] }; } }],
    [{ text: 'Write a decimal that fits, then explain how you know.', gen: () => { const a = ri(10, 89) / 10, b = a + 0.1; return { q: `Write a decimal between ${d(a)} and ${d(b)}.`, a: `e.g. ${d(a + 0.05)}`, lines: [`${a.toFixed(2)} and ${b.toFixed(2)}`, `e.g. ${d(a + 0.05)} is between them`] }; } }],
  ],
  '7.02': ({ ri, pick }) => [
    [{ text: 'Write each decimal as a fraction with 10, 100 or 1000 on the bottom.', gen: () => { const den = pick([10, 100, 1000]), n = ri(1, den - 1); return { q: d(n / den), a: F(n, den) }; } }],
    [{ text: 'Write as a fraction, then simplify fully.', gen: () => { const n = ri(2, 98); if (gcd(n, 100) === 1 || n % 10 === 0) return { q: '' }; return { q: d(n / 100), a: frac([n, 100]), lines: [`= ${F(n, 100)}`, `= ${frac([n, 100])}`] }; } }],
    [{ text: 'Write as a mixed numeral in simplest form.', gen: () => { const w = ri(1, 9), n = ri(2, 98); if (n % 10 === 0 || gcd(n, 100) === 1) return { q: '' }; return { q: d(w + n / 100), a: frac([w * 100 + n, 100]), lines: [`= ${w} and ${F(n, 100)}`, `= ${frac([w * 100 + n, 100])}`] }; } }],
  ],
  '7.03': ({ ri, pick }) => [
    [{ text: 'Add or subtract. Line up the decimal points.', gen: () => { const a = ri(11, 99) / 10, b = ri(11, 99) / 10, op = pick(['+', '−']); if (op === '−' && b > a) return { q: '' }; return { q: `${d(a)} ${op} ${d(b)}`, a: d(op === '+' ? a + b : a - b) }; } }],
    [{ text: 'Fill empty places with zeros, line up the points, then add or subtract.', gen: () => { const a = ri(10, 99) / pick([1, 10]), b = ri(101, 999) / 100, op = pick(['+', '−']); if (op === '−' && b > a) return { q: '' }; return { q: `${d(a)} ${op} ${d(b)}`, a: d(op === '+' ? a + b : a - b), lines: [`${a.toFixed(2)} ${op} ${b.toFixed(2)}`, `= ${d(op === '+' ? a + b : a - b)}`] }; } }],
    [{ text: 'Write a number sentence, then answer the question.', kinds: 2, gen: (i) => { const a = ri(120, 950) / 100, b = ri(120, 950) / 100; if (i % 2 === 0) return { q: `Mia runs ${d(a)} km and then ${d(b)} km. How far does she run altogether?`, a: `${d(a + b)} km`, lines: [`${d(a)} + ${d(b)}`, `= ${d(a + b)} km`] }; const t = ri(10, 20); return a > t ? { q: '' } : { q: `A ${t} m rope has ${d(a)} m cut off. How much is left?`, a: `${d(t - a)} m`, lines: [`${t}.00 − ${a.toFixed(2)}`, `= ${d(t - a)} m`] }; } }],
  ],
  '7.04': ({ ri, pick }) => [
    [{ text: 'Multiply by 10, 100 or 1000: the digits move left one place for each zero.', gen: () => { const a = ri(1, 999) / pick([10, 100, 1000]), p = pick([10, 100, 1000]); return { q: `${d(a)} × ${fmt(p)}`, a: d(a * p) }; } },
      { text: 'Divide by 10, 100 or 1000: the digits move right one place for each zero.', gen: () => { const a = ri(1, 9999) / pick([1, 10]), p = pick([10, 100, 1000]); return { q: `${d(a)} ÷ ${fmt(p)}`, a: d(a / p, 6) }; } }],
    [{ text: 'Find the missing power of 10. Count how many places the digits moved.', gen: () => { const a = ri(1, 999) / 100, p = pick([10, 100, 1000]), op = pick(['×', '÷']); const r = op === '×' ? a * p : a / p; return { q: `${d(a)} ${op} ☐ = ${d(r, 7)}`, a: fmt(p), lines: [`moved ${String(p).length - 1} places ${op === '×' ? 'left' : 'right'}`, `☐ = ${fmt(p)}`] }; } }],
    [{ text: 'Change the units by multiplying or dividing by a power of 10.', kinds: 3, gen: (i) => { const x = ri(1, 999) / 10; return [
      { q: `${d(x)} m to centimetres`, a: `${d(x * 100)} cm`, lines: ['1 m = 100 cm, so × 100', `${d(x)} × 100 = ${d(x * 100)} cm`] },
      { q: `${d(x * 10)} g to kilograms`, a: `${d(x / 100, 5)} kg`, lines: ['1 kg = 1000 g, so ÷ 1000', `${d(x * 10)} ÷ 1000 = ${d(x / 100, 5)} kg`] },
      { q: `${d(x)} cm to millimetres`, a: `${d(x * 10)} mm`, lines: ['1 cm = 10 mm, so × 10', `${d(x)} × 10 = ${d(x * 10)} mm`] },
    ][i % 3]; } }],
  ],
  '7.05': ({ ri, pick }) => [
    [{ text: 'Use 6 × 7 = 42. Count the decimal places in the question: the answer has the same number.', gen: () => { const p = pick([1, 10, 100]), q = pick([10, 100]); return { q: `${d(6 / p)} × ${d(7 / q)}`, a: d(42 / p / q, 6) }; } },
      { text: 'Use your times tables and count the decimal places.', gen: () => { const a = ri(2, 12), b = ri(2, 9), p = pick([1, 10]), q = pick([10, 100]); return { q: `${d(a / p)} × ${d(b / q)}`, a: d((a * b) / p / q, 6) }; } }],
    [{ text: 'Use the fact given. Count the decimal places.', gen: () => { const a = ri(12, 49), b = ri(12, 49), p = pick([10, 100]), q = pick([1, 10]); if (a % 10 === 0 || b % 10 === 0) return { q: '' }; const x = a / p, y = b / q; return { q: `${a} × ${b} = ${fmt(a * b)}. Find ${d(x)} × ${d(y)}.`, a: d(x * y, 6), lines: [`${dp(x) + dp(y)} decimal places`, `= ${d(x * y, 6)}`] }; } }],
    [{ text: 'Use the fact given to find each answer. Explain your thinking.', gen: () => { const a = ri(12, 49), b = ri(12, 49), p = pick([10, 100]); return { q: `${a} × ${b} = ${fmt(a * b)}. Find ${d((a * b) / p)} ÷ ${b}.`, a: d(a / p), lines: [`${fmt(a * b)} ÷ ${b} = ${a}`, `${d((a * b) / p)} is ${a * b} ÷ ${p}, so the answer is ${a} ÷ ${p}`, `= ${d(a / p)}`] }; } }],
  ],
  '7.06': ({ ri, pick }) => [
    [{ text: 'Multiply the digits, then put the decimal point back.', gen: () => { const a = ri(11, 99) / 10, b = ri(2, 9); return { q: `${d(a)} × ${b}`, a: d(a * b) }; } }],
    [{ text: 'Ignore the points, multiply, then count the decimal places.', gen: () => { const a = ri(11, 99) / 100, b = ri(2, 9) / 10; return { q: `${d(a)} × ${d(b)}`, a: d(a * b, 6), lines: [`${Math.round(a * 100)} × ${Math.round(b * 10)} = ${Math.round(a * 100) * Math.round(b * 10)}`, `3 decimal places: ${d(a * b, 6)}`] }; } }],
    [{ text: 'Estimate first, then multiply.', gen: () => { const a = ri(101, 999) / 100, b = ri(11, 99) / 10; const A = Math.round(a * 100), Bb = Math.round(b * 10); return { q: `${d(a)} × ${d(b)}`, a: d(a * b, 6), lines: [`estimate: ${Math.round(a)} × ${Math.round(b)} = ${Math.round(a) * Math.round(b)}`, `${A} × ${Bb} = ${fmt(A * Bb)}`, `3 decimal places: ${d(a * b, 6)}`] }; } }],
  ],
  '7.07': ({ ri, pick }) => [
    [{ text: 'Divide. Keep the decimal point in the same place.', gen: () => { const b = ri(2, 9), q = ri(11, 99) / 10; return { q: `${d(q * b)} ÷ ${b}`, a: d(q) }; } }],
    [{ text: 'Use short division. Add zeros after the last digit if you need to.', gen: () => { const b = pick([2, 4, 5, 8]), a = ri(11, 99) / 10; const q = a / b; if (dp(q) > 4) return { q: '' }; return { q: `${d(a)} ÷ ${b}`, a: d(q, 6), lines: [`${a.toFixed(3)} ÷ ${b}`, `= ${d(q, 6)}`] }; } }],
    [{ text: 'Share the money equally. Write a number sentence.', gen: () => { const n = ri(2, 8), each = ri(125, 2500) / 100; const t = Math.round(each * n * 100) / 100; return { q: `${money(t)} is shared equally between ${n} people. How much does each get?`, a: money(t / n), lines: [`${money(t)} ÷ ${n}`, `= ${money(t / n)} each`] }; } }],
  ],
  '7.08': ({ ri, pick }) => [
    [{ text: 'Multiply both numbers by 10 so you divide by a whole number.', gen: () => { const b = ri(2, 9) / 10, q = ri(2, 30); return { q: `${d(q * b)} ÷ ${d(b)}`, a: String(q) }; } }],
    [{ text: 'Move both decimal points the same number of places, then divide.', gen: () => { const b = ri(2, 9) / 10, q = ri(11, 99) / 10; const A = q * b; return { q: `${d(A)} ÷ ${d(b)}`, a: d(q), lines: [`= ${d(A * 10)} ÷ ${Math.round(b * 10)}`, `= ${d(q)}`] }; } }],
    [{ text: 'Divide by a decimal to answer the question.', gen: () => { const c = pick([0.25, 0.5, 1.5, 2.5, 0.75, 1.25]), n = ri(4, 24); return { q: `A bottle holds ${d(c)} L. How many bottles can be filled from ${d(c * n)} L?`, a: `${n} bottles`, lines: [`${d(c * n)} ÷ ${d(c)}`, `= ${d(c * n * 100)} ÷ ${d(c * 100)}`, `= ${n} bottles`] }; } }],
  ],
  '7.09': ({ ri, pick }) => [
    [{ text: 'Write each fraction as a decimal. Make the bottom 10 or 100 first.', gen: () => { const den = pick([2, 4, 5, 10, 20, 25, 50]), n = ri(1, den - 1); return gcd(n, den) > 1 ? { q: '' } : { q: F(n, den), a: d(n / den) }; } }],
    [{ text: 'Divide the top by the bottom using short division.', gen: () => { const den = pick([8, 16, 40]), n = ri(1, den - 1); if (gcd(n, den) > 1) return { q: '' }; return { q: F(n, den), a: d(n / den, 6), lines: [`${n}.0000 ÷ ${den}`, `= ${d(n / den, 6)}`] }; } }],
    [{ text: 'Write as a recurring decimal. Put a dot over the digit (or digits) that repeat.', gen: (i) => { const L = [[1, 3, '0.333…', '0.3̇'], [2, 3, '0.666…', '0.6̇'], [1, 9, '0.111…', '0.1̇'], [5, 9, '0.555…', '0.5̇'], [1, 6, '0.1666…', '0.16̇'], [5, 6, '0.8333…', '0.83̇'], [7, 9, '0.777…', '0.7̇'], [1, 11, '0.0909…', '0.0̇9̇'], [4, 3, '1.333…', '1.3̇'], [2, 11, '0.1818…', '0.1̇8̇']]; const [n, den, long, dot] = L[i % L.length]; return { q: F(n, den), a: dot, lines: [`${n} ÷ ${den} = ${long}`, `= ${dot}`] }; } }],
  ],
  '7.10': ({ ri }) => [
    [{ text: 'Round to 1 decimal place. Look at the second decimal digit.', gen: () => { const c = ri(100, 9999), x = c / 100; return c % 10 === 0 ? { q: '' } : { q: d(x), a: Rz(x, 1) }; } }],
    [{ text: 'Round to the number of places given. Circle the digit you round to, then look at the next digit.', gen: () => { const x = ri(10000, 999999) / 10000, p = ri(1, 3); const next = +String(x.toFixed(4)).split('.')[1][p]; return { q: `${d(x)} (${p} d.p.)`, a: Rz(x, p), lines: [`next digit is ${next}: round ${next >= 5 ? 'up' : 'down'}`, `= ${Rz(x, p)}`] }; } }],
    [{ text: 'Use your calculator, then round the answer to 2 decimal places.', gen: () => { const a = ri(1, 50), b = ri(3, 13); if (Number.isInteger(Math.round(a * 1e6 / b) / 1e4)) return { q: '' }; return { q: `${a} ÷ ${b}`, a: Rz(a / b, 2), lines: [`calculator: ${(a / b).toFixed(5)}…`, `= ${Rz(a / b, 2)} (2 d.p.)`] }; } }],
  ],
  '7.11': ({ ri, pick }) => [
    [{ text: 'Add the prices.', gen: () => { const a = ri(50, 2000) / 100, b = ri(50, 2000) / 100; return { q: `${money(a)} + ${money(b)}`, a: money(a + b) }; } },
      { text: 'Find the change. Count up from the price.', gen: () => { const p = pick([10, 20, 50]), c = ri(105, p * 100 - 5) / 100; return { q: `${money(c)} from $${p}`, a: money(p - c) }; } }],
    [{ text: 'Find the total cost. Multiply, then write the answer in dollars and cents.', gen: () => { const n = ri(2, 9), c = ri(45, 1500) / 100; return { q: `${n} items at ${money(c)} each`, a: money(n * c), lines: [`${n} × ${money(c)}`, `= ${money(n * c)}`] }; } }],
    [{ text: 'Solve the money problem. Show each step.', kinds: 2, gen: (i) => { const a = ri(150, 900) / 100, b = ri(150, 900) / 100, n = ri(2, 4); if (i % 2 === 0) { const t = Math.round((n * a + b) * 100) / 100, p = t < 20 ? 20 : 50; return { q: `You buy ${n} drinks at ${money(a)} and a sandwich at ${money(b)}. You pay with $${p}. Find the change.`, a: money(p - t), lines: [`${n} × ${money(a)} = ${money(n * a)}`, `total: ${money(n * a)} + ${money(b)} = ${money(t)}`, `change: $${p} − ${money(t)} = ${money(p - t)}`] }; } const c = Math.round(ri(101, 9999)) / 100; return { q: `Round ${money(c)} to the nearest 5 cents for a cash payment.`, a: money(Math.round(c * 20) / 20), lines: [`cents: ${Math.round(c * 100) % 10} → ${[0, 0, 0, 5, 5, 5, 5, 5, 10, 10][Math.round(c * 100) % 10]}`, `= ${money(Math.round(c * 20) / 20)}`] }; } }],
  ],
};
