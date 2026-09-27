// Skill drill pages for Chapter 4 Fractions and percentages: page 1 practises the Easy basics, page 2 the Medium basics (lib/drill.js).
const { F, simp, add, sub, mul, div, gcd, fmt } = require('../../lib/calc');

// A fraction [n, d] in simplest form, as a mixed numeral when asMixed and it is more than 1.
const S = (x, asMixed = true) => { const [n, d] = simp(x); if (d === 1) return fmt(n); const a = Math.abs(n), w = Math.floor(a / d); return (n < 0 ? '−' : '') + (asMixed && w ? F(a % d, d, w) : F(a, d)); };
const f = (n, d, w) => F(n, d, w);
const M = (w, n, d) => [w * d + n, d];
const pct = (x) => `${fmt(x, 2)}%`;
const DEN = [2, 3, 4, 5, 6, 8, 10, 12];

module.exports = {
  '4.01': ({ round, ri, pick }) => ({
    easy: [
      round('simplify each fraction.', 24, () => { const d = pick(DEN), n = ri(1, d - 1), k = ri(2, 6); return gcd(n, d) > 1 ? ['', ''] : [f(n * k, d * k), f(n, d)]; }),
      round('change mixed numerals to improper fractions, and improper fractions to mixed numerals.', 16, () => { const d = pick(DEN), n = ri(1, d - 1), w = ri(1, 6); return gcd(n, d) > 1 ? ['', ''] : ri(0, 1) ? [f(n, d, w), f(w * d + n, d)] : [f(w * d + n, d), f(n, d, w)]; }),
    ],
    medium: [
      round('find the missing number in each pair of equivalent fractions.', 20, () => { const d = pick(DEN), n = ri(1, d - 1), k = ri(2, 9); return ri(0, 1) ? [`${f(n, d)} = ${f('?', d * k)}`, n * k] : [`${f(n, d)} = ${f(n * k, '?')}`, d * k]; }),
      round('simplify fully.', 16, () => { const d = ri(3, 15), n = ri(1, d - 1), k = pick([4, 6, 8, 9, 12, 15]); return [f(n * k, d * k), S([n, d])]; }),
    ],
  }),
  '4.02': ({ round, ri, pick }) => ({
    easy: [
      round('which fraction is larger? The denominators (or numerators) are the same.', 20, () => { const d = ri(3, 12); if (ri(0, 1)) { const a = ri(1, d - 1), b = ri(1, d - 1); return a === b ? ['', ''] : [`${f(a, d)} or ${f(b, d)}`, f(Math.max(a, b), d)]; } const n = ri(1, 5), a = ri(n + 1, 12), b = ri(n + 1, 12); return a === b ? ['', ''] : [`${f(n, a)} or ${f(n, b)}`, f(n, Math.min(a, b))]; }),
      round('write both fractions with the lowest common denominator.', 12, () => { const a = pick(DEN), b = pick(DEN); const l = (a * b) / gcd(a, b), x = ri(1, a - 1), y = ri(1, b - 1); return a === b ? ['', ''] : [`${f(x, a)} and ${f(y, b)}`, `${f(x * l / a, l)} and ${f(y * l / b, l)}`]; }, { cols: 3 }),
    ],
    medium: [
      round('which is larger? Use a common denominator.', 20, () => { const a = pick(DEN), b = pick(DEN), x = ri(1, a - 1), y = ri(1, b - 1); return a === b || x * b === y * a ? ['', ''] : [`${f(x, a)} or ${f(y, b)}`, x * b > y * a ? f(x, a) : f(y, b)]; }),
      round('write in ascending order (smallest first).', 10, () => { const fs = []; const seen = new Set(); while (fs.length < 3) { const d = pick(DEN), n = ri(1, d - 1); const v = n / d; if (!seen.has(v)) { seen.add(v); fs.push([n, d]); } } return [fs.map(([n, d]) => f(n, d)).join(', '), [...fs].sort((p, q) => p[0] / p[1] - q[0] / q[1]).map(([n, d]) => f(n, d)).join(', ')]; }, { cols: 2 }),
    ],
  }),
  '4.03': ({ round, ri, pick }) => ({
    easy: [
      round('evaluate. The denominators are the same. Simplify your answer.', 24, () => { const d = ri(3, 12), a = ri(1, d - 1), b = ri(1, d - 1), op = pick(['+', '−']); return op === '−' && b >= a ? ['', ''] : [`${f(a, d)} ${op} ${f(b, d)}`, S(op === '+' ? [a + b, d] : [a - b, d])]; }),
      round('evaluate. Change one fraction so the denominators match.', 16, () => { const d = pick([2, 3, 4, 5]), k = pick([2, 3]), a = ri(1, d - 1), b = ri(1, d * k - 1), op = pick(['+', '−']); const x = [a, d], y = [b, d * k]; return op === '−' && a / d <= b / (d * k) ? ['', ''] : [`${f(a, d)} ${op} ${f(b, d * k)}`, S(op === '+' ? add(x, y) : sub(x, y))]; }),
    ],
    medium: [
      round('evaluate. Use the lowest common denominator.', 16, () => { const a = pick(DEN), b = pick(DEN), x = ri(1, a - 1), y = ri(1, b - 1), op = pick(['+', '−']); return a === b || (op === '−' && x / a <= y / b) ? ['', ''] : [`${f(x, a)} ${op} ${f(y, b)}`, S(op === '+' ? add([x, a], [y, b]) : sub([x, a], [y, b]))]; }),
      round('evaluate.', 12, () => { const a = pick([2, 3, 4]), b = pick([3, 4, 6]), c = pick([6, 8, 12]); const r = sub(add([1, a], [1, b]), [1, c]); return r[0] <= 0 ? ['', ''] : [`${f(1, a)} + ${f(1, b)} − ${f(1, c)}`, S(r)]; }, { cols: 3 }),
    ],
  }),
  '4.04': ({ round, ri, pick }) => ({
    easy: [
      round('evaluate. Add (or subtract) the whole numbers, then the fractions.', 20, () => { const d = ri(3, 10), a = ri(1, d - 1), b = ri(1, d - 1), w1 = ri(2, 8), w2 = ri(1, w1 - 1), op = pick(['+', '−']); return op === '−' && b > a ? ['', ''] : [`${f(a, d, w1)} ${op} ${f(b, d, w2)}`, S(op === '+' ? add(M(w1, a, d), M(w2, b, d)) : sub(M(w1, a, d), M(w2, b, d)))]; }),
      round('evaluate. Take the fraction from one whole.', 16, () => { const d = ri(2, 10), a = ri(1, d - 1), w = ri(2, 9); return [`${w} − ${f(a, d)}`, S(sub([w, 1], [a, d]))]; }),
    ],
    medium: [
      round('evaluate. Use a common denominator.', 12, () => { const a = pick(DEN), b = pick(DEN), x = ri(1, a - 1), y = ri(1, b - 1), w1 = ri(1, 6), w2 = ri(1, 5); return a === b || gcd(x, a) > 1 || gcd(y, b) > 1 ? ['', ''] : [`${f(x, a, w1)} + ${f(y, b, w2)}`, S(add(M(w1, x, a), M(w2, y, b)))]; }, { cols: 3 }),
      round('evaluate. You may need to change to improper fractions.', 12, () => { const d = pick([3, 4, 5, 6, 8]), a = ri(1, d - 2), b = ri(a + 1, d - 1), w1 = ri(3, 9), w2 = ri(1, w1 - 1); return gcd(a, d) > 1 || gcd(b, d) > 1 ? ['', ''] : [`${f(a, d, w1)} − ${f(b, d, w2)}`, S(sub(M(w1, a, d), M(w2, b, d)))]; }, { cols: 3 }),
    ],
  }),
  '4.05': ({ round, ri, pick }) => ({
    easy: [
      round('evaluate. Divide by the denominator.', 24, () => { const d = ri(2, 12), k = ri(2, 12); return [`${f(1, d)} of ${d * k}`, k]; }),
      round('evaluate. Divide by the denominator, then multiply by the numerator.', 16, () => { const d = ri(3, 10), n = ri(2, d - 1), k = ri(2, 12); return gcd(n, d) > 1 ? ['', ''] : [`${f(n, d)} of ${d * k}`, n * k]; }),
    ],
    medium: [
      round('evaluate in the unit given.', 15, () => { const [q, u, v] = pick([[60, 'an hour', 'min'], [1000, '1 kg', 'g'], [100, '$1', 'c'], [1000, '1 km', 'm'], [24, 'a day', 'h'], [100, '1 m', 'cm']]); const d = pick([2, 3, 4, 5, 6, 10, 12, 8, 20, 25].filter((x) => q % x === 0)), n = ri(1, d - 1); return gcd(n, d) > 1 ? ['', ''] : [`${f(n, d)} of ${u} (${v})`, `${(q / d) * n} ${v}`]; }, { cols: 3 }),
      round('what fraction is the first amount of the second? Simplify.', 16, () => { const b = pick([12, 15, 20, 24, 30, 36, 40, 60]), a = ri(1, b - 1); return [`${a} of ${b}`, S([a, b])]; }),
    ],
  }),
  '4.06': ({ round, ri }) => ({
    easy: [
      round('evaluate. Multiply the numerators and the denominators. Simplify.', 24, () => { const a = ri(2, 9), b = ri(2, 9), x = ri(1, a - 1), y = ri(1, b - 1); return [`${f(x, a)} × ${f(y, b)}`, S(mul([x, a], [y, b]))]; }),
      round('evaluate.', 16, () => { const a = ri(2, 12), x = ri(1, a - 1), w = ri(2, 12); return [ri(0, 1) ? `${f(x, a)} × ${w}` : `${w} × ${f(x, a)}`, S(mul([x, a], [w, 1]))]; }),
    ],
    medium: [
      round('evaluate. Cancel first.', 16, () => { const p = ri(2, 6), q = ri(2, 6), a = ri(1, 5), b = ri(2, 7), m = ri(1, 4), n = ri(2, 7); const x = [a * p, b * q], y = [m * q, n * p]; return x[0] >= x[1] || y[0] >= y[1] ? ['', ''] : [`${f(...x)} × ${f(...y)}`, S(mul(x, y))]; }),
      round('evaluate. Change to improper fractions first.', 12, () => { const d1 = ri(2, 5), d2 = ri(2, 5), n1 = ri(1, d1 - 1), n2 = ri(1, d2 - 1), w1 = ri(1, 3), w2 = ri(1, 3); return [`${f(n1, d1, w1)} × ${f(n2, d2, w2)}`, S(mul(M(w1, n1, d1), M(w2, n2, d2)))]; }, { cols: 3 }),
    ],
  }),
  '4.07': ({ round, ri }) => ({
    easy: [
      round('write the reciprocal.', 24, () => { const d = ri(2, 12), n = ri(1, 11); if (n === d) return ['', '']; return ri(0, 2) ? [f(n, d), n === 1 ? String(d) : f(d, n)] : [String(d), f(1, d)]; }),
      round('evaluate. How many parts fit into the whole number?', 16, () => { const d = ri(2, 8), w = ri(2, 9); return [`${w} ÷ ${f(1, d)}`, w * d]; }),
    ],
    medium: [
      round('evaluate. Multiply by the reciprocal.', 16, () => { const a = ri(2, 9), b = ri(2, 9), x = ri(1, a - 1), y = ri(1, b - 1); return [`${f(x, a)} ÷ ${f(y, b)}`, S(div([x, a], [y, b]))]; }),
      round('evaluate. Change to improper fractions first.', 12, () => { const d1 = ri(2, 5), d2 = ri(2, 5), n1 = ri(1, d1 - 1), n2 = ri(1, d2 - 1), w1 = ri(1, 4), w2 = ri(1, 2); return [`${f(n1, d1, w1)} ÷ ${f(n2, d2, w2)}`, S(div(M(w1, n1, d1), M(w2, n2, d2)))]; }, { cols: 3 }),
    ],
  }),
  '4.08': ({ round, ri, pick }) => {
    const things = [['a pizza', 'eaten'], ['a tank of petrol', 'used'], ['a class', 'away'], ['a cake', 'sold'], ['a garden', 'planted'], ['a book', 'read'], ['a bottle of water', 'drunk']];
    return {
      easy: [
        round('what fraction is left?', 18, () => { const d = pick(DEN), n = ri(1, d - 1), [t, v] = pick(things); return [`${f(n, d)} of ${t} is ${v}`, S([d - n, d])]; }, { cols: 3 }),
        round('find the amount.', 12, () => { const d = pick([2, 3, 4, 5, 6, 8, 10]), n = ri(1, d - 1), k = ri(2, 12), [w, u] = pick([['students', ''], ['dollars', '$'], ['minutes', ''], ['kilograms', '']]); return gcd(n, d) > 1 ? ['', ''] : [`${f(n, d)} of ${u}${d * k}${u ? '' : ` ${w}`}`, `${u}${n * k}${u ? '' : ` ${w}`}`]; }, { cols: 3 }),
      ],
      medium: [
        round('how much is left?', 10, () => { const d = pick([3, 4, 5, 8, 10]), n = ri(1, d - 1), k = ri(3, 20); return gcd(n, d) > 1 ? ['', ''] : [`Sam had $${d * k} and spent ${f(n, d)} of it. How much is left?`, `$${(d - n) * k}`]; }, { cols: 2 }),
        round('two steps: find each part, then answer.', 6, () => { const a = pick([2, 3, 4]), b = pick([4, 5, 6]); const total = a * b * ri(2, 6); return a === b ? ['', ''] : [`${total} people: ${f(1, a)} walk, ${f(1, b)} ride. The rest take the bus. How many take the bus?`, total - total / a - total / b]; }, { cols: 2, work: true }),
      ],
    };
  },
  '4.09': ({ round, ri, pick }) => ({
    easy: [
      round('use the fraction key on your calculator.', 20, () => { const a = ri(5, 20), b = ri(5, 20), x = ri(1, a - 1), y = ri(1, b - 1), op = pick(['+', '−']); return op === '−' && x / a <= y / b ? ['', ''] : [`${f(x, a)} ${op} ${f(y, b)}`, S(op === '+' ? add([x, a], [y, b]) : sub([x, a], [y, b]))]; }),
      round('use your calculator.', 16, () => { const a = ri(5, 20), b = ri(5, 20), x = ri(1, a - 1), y = ri(1, b - 1), op = pick(['×', '÷']); return [`${f(x, a)} ${op} ${f(y, b)}`, S(op === '×' ? mul([x, a], [y, b]) : div([x, a], [y, b]))]; }),
    ],
    medium: [
      round('use your calculator. Use brackets.', 12, () => { const a = ri(2, 9), b = ri(2, 9), c = ri(2, 9), x = ri(1, a - 1), y = ri(1, b - 1), z = ri(1, c - 1); return [`(${f(x, a)} + ${f(y, b)}) × ${f(z, c)}`, S(mul(add([x, a], [y, b]), [z, c]))]; }, { cols: 3 }),
      round('use your calculator to write each as a mixed numeral.', 16, () => { const d = ri(3, 15), n = ri(d + 1, d * 9); return n % d === 0 || gcd(n, d) > 1 ? ['', ''] : [f(n, d), S([n, d])]; }),
    ],
  }),
  '4.10': ({ round, ri, pick }) => ({
    easy: [
      round('write each percentage as a fraction in simplest form.', 20, () => { const p = pick([5, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 1, 2, 4, 15, 35, 45, 12, 8]); return [`${p}%`, S([p, 100], false)]; }),
      round('write each percentage as a decimal.', 16, () => { const p = ri(1, 150); return [`${p}%`, fmt(p / 100, 2)]; }),
    ],
    medium: [
      round('write each fraction as a percentage.', 16, () => { const d = pick([2, 4, 5, 10, 20, 25, 50]), n = ri(1, d - 1); return gcd(n, d) > 1 ? ['', ''] : [f(n, d), pct((n / d) * 100)]; }),
      round('write each decimal as a percentage and as a fraction.', 15, () => { const x = pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.75, 0.8, 0.9, 0.05, 0.15, 0.35, 0.45, 0.02, 0.04, 0.12]); return [fmt(x, 2), `${pct(x * 100)}, ${S([Math.round(x * 100), 100], false)}`]; }, { cols: 3 }),
    ],
  }),
  '4.11': ({ round, ri, pick }) => ({
    easy: [
      round('find mentally.', 24, () => { const p = pick([10, 50, 25, 1]), a = { 10: ri(2, 90) * 10, 50: ri(2, 90) * 2, 25: ri(2, 40) * 4, 1: ri(2, 9) * 100 }[p]; return [`${p}% of ${a}`, fmt((p * a) / 100)]; }),
      round('find mentally. 5% is half of 10%. 20% is 2 × 10%.', 16, () => { const p = pick([5, 20, 75, 30]), a = ri(2, 30) * 20; return [`${p}% of ${a}`, fmt((p * a) / 100)]; }),
    ],
    medium: [
      round('find the percentage of the amount.', 16, () => { const p = ri(1, 19) * 5, a = ri(2, 40) * 10; return [`${p}% of $${a}`, `$${fmt((p * a) / 100, 2)}`]; }),
      round('find the sale price.', 12, () => { const p = pick([10, 20, 25, 30, 50, 15]), a = ri(2, 30) * 10; return [`$${a}, ${p}% off`, `$${fmt(a - (p * a) / 100, 2)}`]; }, { cols: 3 }),
    ],
  }),
  '4.12': ({ round, ri, pick }) => ({
    easy: [
      round('write as a percentage.', 24, () => { const b = pick([10, 20, 25, 50, 4, 5]), a = ri(1, b - 1); return [`${a} out of ${b}`, pct((a / b) * 100)]; }),
      round('write the first amount as a fraction of the second, in simplest form.', 16, () => { const b = pick([12, 16, 20, 24, 30, 40, 60]), a = ri(1, b - 1); return [`${a} out of ${b}`, S([a, b])]; }),
    ],
    medium: [
      round('change to the same units, then write as a percentage.', 12, () => { const [u, v, k] = pick([['cm', 'm', 100], ['min', 'h', 60], ['g', 'kg', 1000], ['m', 'km', 1000], ['c', '$', 100]]); const b = ri(1, 4), a = pick([k / 10, k / 5, k / 4, k / 2, (3 * k) / 4, (3 * k) / 10]); return a === 0 || !Number.isInteger(a) ? ['', ''] : [`${a} ${u} of ${b} ${v}`, pct((a / (b * k)) * 100)]; }, { cols: 3 }),
      round('test scores: write each as a percentage.', 16, () => { const b = pick([20, 25, 40, 50, 80]), a = ri(Math.ceil(b / 3), b); return [`${a} / ${b}`, pct((a / b) * 100)]; }),
    ],
  }),
};
