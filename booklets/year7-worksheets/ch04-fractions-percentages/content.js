// Worksheet questions for Chapter 4 Fractions and percentages (lib/worksheet.js). See ../ch01-integers/content.js.
const { F, simp, add, sub, mul, div, gcd, fmt } = require('../../lib/calc');

// A fraction [n, d] in simplest form, as a mixed numeral when it is more than 1.
const S = (x, mixed = true) => { const [n, d] = simp(x); if (d === 1) return fmt(n); const w = Math.floor(n / d); return mixed && w ? F(n % d, d, w) : F(n, d); };
const f = (n, d, w) => F(n, d, w);
const M = (w, n, d) => [w * d + n, d];
const lcd = (a, b) => (a * b) / gcd(a, b);
const DEN = [2, 3, 4, 5, 6, 8, 10, 12];
const pct = (x) => `${fmt(x, 2)}%`;

module.exports = {
  '4.01': ({ ri, pick }) => [
    [{ text: 'Simplify each fraction: divide the top and bottom by the same number.', gen: () => { const d = pick(DEN), n = ri(1, d - 1), k = ri(2, 6); return gcd(n, d) > 1 ? { q: '' } : { q: f(n * k, d * k), a: f(n, d) }; } },
      { text: 'Change each mixed numeral to an improper fraction.', gen: () => { const d = pick(DEN), n = ri(1, d - 1), w = ri(1, 6); return gcd(n, d) > 1 ? { q: '' } : { q: f(n, d, w), a: f(w * d + n, d) }; } }],
    [{ text: 'Find the missing number. What was the bottom (or top) multiplied by?', gen: () => { const d = pick(DEN), n = ri(1, d - 1), k = ri(2, 9); return gcd(n, d) > 1 ? { q: '' } : { q: `${f(n, d)} = ${f('?', d * k)}`, a: String(n * k), lines: [`${d} × ${k} = ${d * k}`, `${n} × ${k} = ${n * k}`] }; } }],
    [{ text: 'Simplify fully. Find the highest common factor (HCF) first.', gen: () => { const d = ri(3, 15), n = ri(1, d - 1), k = pick([4, 6, 8, 9, 12, 15]); if (gcd(n, d) > 1) return { q: '' }; return { q: f(n * k, d * k), a: f(n, d), lines: [`HCF of ${n * k} and ${d * k} is ${k}`, `${n * k} ÷ ${k} = ${n}, ${d * k} ÷ ${k} = ${d}`, `= ${f(n, d)}`] }; } }],
  ],
  '4.02': ({ ri, pick }) => [
    [{ text: 'Which fraction is larger? The bottoms are the same, so compare the tops.', gen: () => { const d = ri(3, 12), a = ri(1, d - 1), b = ri(1, d - 1); return a === b ? { q: '' } : { q: `${f(a, d)} or ${f(b, d)}`, a: f(Math.max(a, b), d) }; } }],
    [{ text: 'Which is larger? Write both with a common denominator first.', gen: () => { const a = pick(DEN), b = pick(DEN), x = ri(1, a - 1), y = ri(1, b - 1), l = lcd(a, b); if (a === b || x * b === y * a || gcd(x, a) > 1 || gcd(y, b) > 1) return { q: '' }; return { q: `${f(x, a)} or ${f(y, b)}`, a: x * b > y * a ? f(x, a) : f(y, b), lines: [`${f(x * l / a, l)} and ${f(y * l / b, l)}`, `larger: ${x * b > y * a ? f(x, a) : f(y, b)}`] }; } }],
    [{ text: 'Write in ascending order (smallest first). Use a common denominator.', gen: () => { const fs = [], seen = new Set(); while (fs.length < 3) { const d = pick([2, 3, 4, 6, 12]), n = ri(1, d - 1); if (gcd(n, d) === 1 && !seen.has(n / d)) { seen.add(n / d); fs.push([n, d]); } } const o = [...fs].sort((p, q) => p[0] / p[1] - q[0] / q[1]); return { q: fs.map(([n, d]) => f(n, d)).join(', '), a: o.map(([n, d]) => f(n, d)).join(', '), lines: [fs.map(([n, d]) => f(n * 12 / d, 12)).join(', '), o.map(([n, d]) => f(n, d)).join(', ')] }; } }],
  ],
  '4.03': ({ ri, pick }) => [
    [{ text: 'Add or subtract the tops. Keep the bottom. Simplify.', gen: () => { const d = ri(3, 12), a = ri(1, d - 1), b = ri(1, d - 1), op = pick(['+', '−']); if (op === '−' && b >= a) return { q: '' }; return { q: `${f(a, d)} ${op} ${f(b, d)}`, a: S(op === '+' ? [a + b, d] : [a - b, d]) }; } }],
    [{ text: 'Use the lowest common denominator, then add or subtract.', gen: () => { const a = pick([2, 3, 4, 5, 6]), b = pick([3, 4, 6, 8, 10]), x = ri(1, a - 1), y = ri(1, b - 1), op = pick(['+', '−']), l = lcd(a, b); if (a === b || (op === '−' && x / a <= y / b) || gcd(x, a) > 1 || gcd(y, b) > 1) return { q: '' }; const r = op === '+' ? add([x, a], [y, b]) : sub([x, a], [y, b]); return { q: `${f(x, a)} ${op} ${f(y, b)}`, a: S(r), lines: [`= ${f(x * l / a, l)} ${op} ${f(y * l / b, l)}`, `= ${S(r)}`] }; } }],
    [{ text: 'Three fractions: use one common denominator for all of them.', gen: () => { const [a, b, c] = [pick([2, 3, 4]), pick([3, 4, 6]), pick([6, 12])]; if (new Set([a, b, c]).size < 3) return { q: '' }; const l = 12; const r = sub(add([1, a], [1, b]), [1, c]); if (r[0] <= 0) return { q: '' }; return { q: `${f(1, a)} + ${f(1, b)} − ${f(1, c)}`, a: S(r), lines: [`= ${f(l / a, l)} + ${f(l / b, l)} − ${f(l / c, l)}`, `= ${f(l / a + l / b - l / c, l)}`, `= ${S(r)}`] }; } }],
  ],
  '4.04': ({ ri, pick }) => [
    [{ text: 'Add the whole numbers, then add the fractions.', gen: () => { const d = ri(3, 9), a = ri(1, d - 1), b = ri(1, d - 1), w1 = ri(1, 7), w2 = ri(1, 5); if (a + b >= d || gcd(a, d) > 1 || gcd(b, d) > 1) return { q: '' }; return { q: `${f(a, d, w1)} + ${f(b, d, w2)}`, a: S(add(M(w1, a, d), M(w2, b, d))) }; } }],
    [{ text: 'Change to improper fractions, then subtract.', gen: () => { const d = pick([3, 4, 5, 6, 8]), a = ri(1, d - 2), b = ri(a + 1, d - 1), w1 = ri(3, 7), w2 = ri(1, w1 - 1); if (gcd(a, d) > 1 || gcd(b, d) > 1) return { q: '' }; const A = M(w1, a, d), B = M(w2, b, d); return { q: `${f(a, d, w1)} − ${f(b, d, w2)}`, a: S(sub(A, B)), lines: [`= ${f(A[0], d)} − ${f(B[0], d)}`, `= ${f(A[0] - B[0], d)} = ${S(sub(A, B))}`] }; } }],
    [{ text: 'Different denominators: change to improper fractions with a common denominator.', gen: () => { const a = pick([2, 3, 4]), b = pick([3, 5, 6]), x = ri(1, a - 1), y = ri(1, b - 1), w1 = ri(2, 5), w2 = ri(1, 3), l = lcd(a, b); if (a === b || gcd(x, a) > 1 || gcd(y, b) > 1) return { q: '' }; const A = M(w1, x, a), B = M(w2, y, b); return { q: `${f(x, a, w1)} + ${f(y, b, w2)}`, a: S(add(A, B)), lines: [`= ${f(A[0], a)} + ${f(B[0], b)}`, `= ${f(A[0] * l / a, l)} + ${f(B[0] * l / b, l)}`, `= ${S(add(A, B))}`] }; } }],
  ],
  '4.05': ({ ri, pick }) => [
    [{ text: 'Find the fraction of the amount: divide by the denominator.', gen: () => { const d = ri(2, 12), k = ri(2, 12); return { q: `${f(1, d)} of ${d * k}`, a: String(k) }; } }],
    [{ text: 'Divide by the denominator, then multiply by the numerator.', gen: () => { const d = ri(3, 10), n = ri(2, d - 1), k = ri(2, 12); if (gcd(n, d) > 1) return { q: '' }; return { q: `${f(n, d)} of ${d * k}`, a: String(n * k), lines: [`${d * k} ÷ ${d} = ${k}`, `${k} × ${n} = ${n * k}`] }; } }],
    [{ text: 'Change to the smaller unit first, then find the fraction.', gen: () => { const [q, u, v] = pick([[60, 'an hour', 'minutes'], [1000, '1 kg', 'grams'], [100, '$1', 'cents'], [1000, '1 km', 'metres'], [24, 'a day', 'hours']]); const d = pick([2, 3, 4, 5, 6, 8, 10, 12].filter((x) => q % x === 0)), n = ri(1, d - 1); if (gcd(n, d) > 1) return { q: '' }; return { q: `${f(n, d)} of ${u}, in ${v}`, a: `${(q / d) * n} ${v}`, lines: [`${u} = ${q} ${v}`, `${q} ÷ ${d} = ${q / d}`, `${q / d} × ${n} = ${(q / d) * n} ${v}`] }; } }],
  ],
  '4.06': ({ ri }) => [
    [{ text: 'Multiply the tops, multiply the bottoms. Simplify.', gen: () => { const a = ri(2, 9), b = ri(2, 9), x = ri(1, a - 1), y = ri(1, b - 1); return { q: `${f(x, a)} × ${f(y, b)}`, a: S(mul([x, a], [y, b])) }; } }],
    [{ text: 'Cancel first (divide a top and a bottom by the same number), then multiply.', gen: () => { const p = ri(2, 5), a = ri(1, 4), b = ri(2, 7), m = ri(1, 4), n = ri(2, 7); const x = [a * p, b], y = [m, n * p]; if (x[0] >= x[1] || y[0] >= y[1] || gcd(a, n) > 1 || gcd(m, b) > 1) return { q: '' }; return { q: `${f(...x)} × ${f(...y)}`, a: S(mul(x, y)), lines: [`= ${f(a, b)} × ${f(m, n)}`, `= ${S(mul(x, y))}`] }; } }],
    [{ text: 'Change to improper fractions, cancel, then multiply.', gen: () => { const d1 = ri(2, 5), d2 = ri(2, 5), n1 = ri(1, d1 - 1), n2 = ri(1, d2 - 1), w1 = ri(1, 3), w2 = ri(1, 3); const A = M(w1, n1, d1), B = M(w2, n2, d2); return { q: `${f(n1, d1, w1)} × ${f(n2, d2, w2)}`, a: S(mul(A, B)), lines: [`= ${f(A[0], d1)} × ${f(B[0], d2)}`, `= ${f(A[0] * B[0], d1 * d2)}`, `= ${S(mul(A, B))}`] }; } }],
  ],
  '4.07': ({ ri }) => [
    [{ text: 'Write the reciprocal: turn the fraction upside down.', gen: () => { const d = ri(2, 12), n = ri(1, 11); if (n === d) return { q: '' }; return { q: f(n, d), a: n === 1 ? String(d) : f(d, n) }; } }],
    [{ text: 'Keep, change, flip: multiply by the reciprocal of the second fraction.', gen: () => { const a = ri(2, 9), b = ri(2, 9), x = ri(1, a - 1), y = ri(1, b - 1); return { q: `${f(x, a)} ÷ ${f(y, b)}`, a: S(div([x, a], [y, b])), lines: [`= ${f(x, a)} × ${f(b, y)}`, `= ${S(div([x, a], [y, b]))}`] }; } }],
    [{ text: 'Change to improper fractions, then keep, change, flip.', gen: () => { const d1 = ri(2, 5), d2 = ri(2, 5), n1 = ri(1, d1 - 1), n2 = ri(1, d2 - 1), w1 = ri(1, 4), w2 = ri(1, 2); const A = M(w1, n1, d1), B = M(w2, n2, d2); return { q: `${f(n1, d1, w1)} ÷ ${f(n2, d2, w2)}`, a: S(div(A, B)), lines: [`= ${f(A[0], d1)} ÷ ${f(B[0], d2)}`, `= ${f(A[0], d1)} × ${f(d2, B[0])}`, `= ${S(div(A, B))}`] }; } }],
  ],
  '4.08': ({ ri, pick }) => {
    const things = [['a pizza', 'eaten'], ['a tank of petrol', 'used'], ['a class', 'away'], ['a cake', 'sold'], ['a book', 'read'], ['a bottle of water', 'drunk']];
    return [
      [{ text: 'What fraction is left? The whole is 1.', gen: () => { const d = pick(DEN), n = ri(1, d - 1), [t, v] = pick(things); return gcd(n, d) > 1 ? { q: '' } : { q: `${f(n, d)} of ${t} is ${v}`, a: S([d - n, d]) }; } }],
      [{ text: 'Find the fraction of the amount, then answer the question.', gen: () => { const d = pick([3, 4, 5, 8, 10]), n = ri(1, d - 1), k = ri(3, 12); if (gcd(n, d) > 1) return { q: '' }; return { q: `Sam had $${d * k} and spent ${f(n, d)} of it. How much is left?`, a: `$${(d - n) * k}`, lines: [`spent: ${d * k} ÷ ${d} × ${n} = $${n * k}`, `left: ${d * k} − ${n * k} = $${(d - n) * k}`] }; } }],
      [{ text: 'Two fractions of the same whole. Find each part, then the rest.', gen: () => { const a = pick([2, 3, 4]), b = pick([4, 5, 6]); if (a === b) return { q: '' }; const t = lcd(a, b) * ri(2, 5); return { q: `${t} students: ${f(1, a)} walk to school and ${f(1, b)} ride. The rest take the bus. How many take the bus?`, a: String(t - t / a - t / b), lines: [`walk: ${t} ÷ ${a} = ${t / a}`, `ride: ${t} ÷ ${b} = ${t / b}`, `bus: ${t} − ${t / a} − ${t / b} = ${t - t / a - t / b}`] }; } }],
    ];
  },
  '4.09': ({ ri, pick }) => [
    [{ text: 'Use the fraction key on your calculator.', gen: () => { const a = ri(5, 20), b = ri(5, 20), x = ri(1, a - 1), y = ri(1, b - 1), op = pick(['+', '×']); return { q: `${f(x, a)} ${op} ${f(y, b)}`, a: S(op === '+' ? add([x, a], [y, b]) : mul([x, a], [y, b])) }; } }],
    [{ text: 'Use your calculator. Write what you typed, then the answer.', gen: () => { const a = ri(5, 20), b = ri(5, 20), x = ri(1, a - 1), y = ri(1, b - 1); return { q: `${f(x, a)} ÷ ${f(y, b)}`, a: S(div([x, a], [y, b])), lines: [`typed: ${x}/${a} ÷ ${y}/${b}`, `= ${S(div([x, a], [y, b]))}`] }; } }],
    [{ text: 'Use your calculator and brackets. Check the answer is sensible.', gen: () => { const a = ri(2, 9), b = ri(2, 9), c = ri(2, 9), x = ri(1, a - 1), y = ri(1, b - 1), z = ri(1, c - 1); const r = mul(add([x, a], [y, b]), [z, c]); return { q: `(${f(x, a)} + ${f(y, b)}) × ${f(z, c)}`, a: S(r), lines: [`bracket: ${S(add([x, a], [y, b]))}`, `× ${f(z, c)} = ${S(r)}`] }; } }],
  ],
  '4.10': ({ ri, pick }) => [
    [{ text: 'Write each percentage as a fraction out of 100, then simplify.', gen: () => { const p = pick([5, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 2, 4, 15, 35, 45, 12, 8]); return { q: `${p}%`, a: S([p, 100], false) }; } },
      { text: 'Write each percentage as a decimal: divide by 100.', gen: () => { const p = ri(1, 150); return { q: `${p}%`, a: fmt(p / 100, 2) }; } }],
    [{ text: 'Write the fraction out of 100, then as a percentage.', gen: () => { const d = pick([2, 4, 5, 10, 20, 25, 50]), n = ri(1, d - 1); if (gcd(n, d) > 1) return { q: '' }; return { q: f(n, d), a: pct((n / d) * 100), lines: [`= ${f(n * 100 / d, 100)}`, `= ${pct((n / d) * 100)}`] }; } }],
    [{ text: 'Write each decimal as a percentage and as a fraction in simplest form.', gen: () => { const x = pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.6, 0.7, 0.75, 0.8, 0.9, 0.05, 0.15, 0.35, 0.45, 0.02, 0.04, 0.12, 0.65]); const p = Math.round(x * 100); return { q: fmt(x, 2), a: `${p}%, ${S([p, 100], false)}`, lines: [`× 100: ${p}%`, `${f(p, 100)} = ${S([p, 100], false)}`] }; } }],
  ],
  '4.11': ({ ri, pick }) => [
    [{ text: 'Find mentally. 10% is ÷ 10, 50% is half, 25% is a quarter.', gen: () => { const p = pick([10, 50, 25, 1]), a = { 10: ri(2, 90) * 10, 50: ri(2, 90) * 2, 25: ri(2, 40) * 4, 1: ri(2, 9) * 100 }[p]; return { q: `${p}% of ${a}`, a: fmt((p * a) / 100) }; } }],
    [{ text: 'Find 10% first, then build the percentage you need.', gen: () => { const p = pick([20, 30, 40, 5, 15, 60, 70]), a = ri(2, 30) * 20; const ten = a / 10; return { q: `${p}% of ${a}`, a: fmt((p * a) / 100), lines: [`10% = ${fmt(ten)}`, `${p}% = ${p === 5 ? `${fmt(ten)} ÷ 2` : p === 15 ? `${fmt(ten)} + ${fmt(ten / 2)}` : `${fmt(ten)} × ${p / 10}`} = ${fmt((p * a) / 100)}`] }; } }],
    [{ text: 'Find the discount, then the sale price.', gen: () => { const p = pick([10, 20, 25, 30, 50, 15, 40]), a = ri(2, 30) * 10; const d = (p * a) / 100; return { q: `A $${a} jacket is ${p}% off. Find the sale price.`, a: `$${fmt(a - d, 2)}`, lines: [`discount: ${p}% of ${a} = $${fmt(d, 2)}`, `sale price: ${a} − ${fmt(d, 2)} = $${fmt(a - d, 2)}`] }; } }],
  ],
  '4.12': ({ ri, pick }) => [
    [{ text: 'Write as a fraction, then as a percentage.', gen: () => { const b = pick([10, 20, 25, 50, 4, 5]), a = ri(1, b - 1); return { q: `${a} out of ${b}`, a: pct((a / b) * 100) }; } }],
    [{ text: 'Write as a fraction, make the denominator 100, then write the percentage.', gen: () => { const b = pick([20, 25, 50, 4, 5, 10]), a = ri(1, b - 1); return { q: `${a} out of ${b}`, a: pct((a / b) * 100), lines: [`${f(a, b)} = ${f(a * 100 / b, 100)}`, `= ${pct((a / b) * 100)}`] }; } }],
    [{ text: 'Change to the same unit first, then write as a percentage.', gen: () => { const [u, v, k] = pick([['cm', 'm', 100], ['min', 'h', 60], ['g', 'kg', 1000], ['c', '$', 100]]); const b = ri(1, 3), a = pick([k / 10, k / 5, k / 4, k / 2, (3 * k) / 4]); if (!Number.isInteger(a)) return { q: '' }; const A = u === 'c' ? `${a}c` : `${a} ${u}`, Bv = v === '$' ? `$${b}` : `${b} ${v}`, Bu = u === 'c' ? `${b * k}c` : `${b * k} ${u}`; return { q: `${A} out of ${Bv}`, a: pct((a / (b * k)) * 100), lines: [`${Bv} = ${Bu}`, `${f(a, b * k)} × 100%`, `= ${pct((a / (b * k)) * 100)}`] }; } }],
  ],
};
