// Chapter 4 Fractions and percentages: mixed-practice questions (lib/mixed.js). Every question stands on its own.
const { F, simp, add, sub, mul, div, gcd, fmt } = require('../../lib/calc');

// A fraction [n, d] in simplest form, as a mixed numeral when it is more than 1 (mixed = false keeps it improper).
const S = (x, mixed = true) => { const [n, d] = simp(x); if (d === 1) return fmt(n); const w = Math.floor(n / d); return mixed && w ? F(n % d, d, w) : F(n, d); };
const f = (n, d, w) => F(n, d, w);
const M = (w, n, d) => [w * d + n, d];
const lcd = (a, b) => (a * b) / gcd(a, b);
const DEN = [2, 3, 4, 5, 6, 8, 10, 12];
const pct = (x) => `${fmt(x, 2)}%`;
const ok = (n, d) => n > 0 && n < d && gcd(n, d) === 1; // a proper fraction in simplest form
const NAMES = ['Ali', 'Mia', 'Zac', 'Lena', 'Kai', 'Ruby', 'Tom', 'Priya', 'Jack', 'Aisha', 'Noah', 'Chloe'];

module.exports = {
  '4.01': {
    idea: 'Equivalent fractions: multiply or divide the top and the bottom by the same number. A mixed numeral such as 2¾ is 2 wholes and ¾; as an improper fraction it is 11 quarters.',
    ex: [[`Simplify ${f(18, 24)}.`, ['HCF of 18 and 24 is 6', `= ${f(3, 4)}`]], [`Write ${f(3, 4, 2)} as an improper fraction.`, ['2 × 4 + 3 = 11', `= ${f(11, 4)}`]], [`Write ${f(17, 5)} as a mixed numeral.`, ['17 ÷ 5 = 3 r 2', `= ${f(2, 5, 3)}`]]],
    e: [
      ({ ri, pick }) => { const d = pick(DEN), n = ri(1, d - 1), k = ri(2, 5); return ok(n, d) ? { q: `Simplify ${f(n * k, d * k)}.`, a: f(n, d) } : null; },
      ({ ri, pick }) => { const d = pick(DEN), n = ri(1, d - 1), w = ri(1, 6); return ok(n, d) ? { q: `Write ${f(n, d, w)} as an improper fraction.`, a: f(w * d + n, d) } : null; },
      ({ ri, pick }) => { const d = pick([2, 3, 4, 5, 6, 8]), n = ri(d + 1, 4 * d); return n % d === 0 ? null : { q: `Write ${f(n, d)} as a mixed numeral.`, a: S([n, d]) }; },
    ],
    m: [
      ({ ri, pick }) => { const d = pick(DEN), n = ri(1, d - 1), k = ri(2, 9); return ok(n, d) ? { q: `Find the missing number: ${f(n, d)} = ${f('☐', d * k)}`, w: [`${d} × ${k} = ${d * k}`, `☐ = ${n} × ${k} = ${n * k}`] } : null; },
      ({ ri, pick }) => { const d = ri(3, 15), n = ri(1, d - 1), k = pick([4, 6, 8, 9, 12]); return ok(n, d) ? { q: `Simplify ${f(n * k, d * k)} fully.`, w: [`HCF of ${n * k} and ${d * k} is ${k}`, `= ${f(n, d)}`] } : null; },
      ({ pick, shuffle }) => { const [n, d] = pick([[2, 3], [3, 4], [2, 5], [3, 5], [5, 6]]); const good = [2, 3, 4].map((k) => [n * k, d * k]); const bad = [n * 2 + 1, d * 2]; const xs = shuffle([...good, bad]); return { q: `Which of these is not equal to ${f(n, d)}: ${xs.map(([a, b]) => f(a, b)).join(', ')}?`, a: f(...bad) }; },
      ({ ri }) => { const d = ri(3, 9), w = ri(2, 9), n = ri(1, d - 1); return ok(n, d) ? { q: `Write ${f(w * d + n, d)} as a mixed numeral.`, w: [`${w * d + n} ÷ ${d} = ${w} r ${n}`, `= ${f(n, d, w)}`] } : null; },
    ],
    c: [
      ({ ri, pick }) => { const d = pick([4, 5, 6]), n = ri(1, d - 1), k = ri(3, 6), j = ri(7, 12); return ok(n, d) ? { q: `Find the missing numbers: ${f(n, d)} = ${f('☐', d * k)} = ${f(n * j, '☐')}`, w: [`× ${k}: ☐ = ${n * k}`, `× ${j}: ☐ = ${d * j}`] } : null; },
      ({ pick }) => { const [m, n, d] = pick([[45, 3, 4], [20, 1, 3], [40, 2, 3], [15, 1, 4], [36, 3, 5], [50, 5, 6], [12, 1, 5]]); return { q: `What fraction of an hour is ${m} minutes? Simplify.`, w: [`${f(m, 60)}`, `= ${f(n, d)}`] }; },
      ({ ri, pick }) => { const d = pick([8, 10, 12]), n = ri(2, d - 2), who = pick(NAMES); return n % 2 || gcd(n, d) === 1 ? null : { q: `${who} says ${f(n, d)} = ${f(n / 2, d)} because you halve the top. Is that right? Explain.`, a: `No. Halve the top and the bottom: ${f(n, d)} = ${f(n / 2, d / 2)}.`, n: 2 }; },
      ({ ri }) => { const d = ri(3, 8), n = ri(1, d - 1), w = ri(3, 12); return ok(n, d) ? { q: `How many ${['', '', 'halves', 'thirds', 'quarters', 'fifths', 'sixths', 'sevenths', 'eighths'][d]} are in ${f(n, d, w)}?`, w: [`${w} × ${d} + ${n}`, `= ${w * d + n}`] } : null; },
    ],
  },

  '4.02': {
    idea: 'To compare fractions, write them with the same denominator. Then the larger numerator gives the larger fraction.',
    ex: [[`Which is larger: ${f(3, 4)} or ${f(5, 8)}?`, [`${f(3, 4)} = ${f(6, 8)}`, `${f(6, 8)} > ${f(5, 8)}, so ${f(3, 4)}`]], [`Order from smallest to largest: ${f(2, 3)}, ${f(1, 2)}, ${f(5, 6)}`, [`${f(4, 6)}, ${f(3, 6)}, ${f(5, 6)}`, `${f(1, 2)}, ${f(2, 3)}, ${f(5, 6)}`]], [`Write &lt; or &gt;: ${f(3, 5)} ☐ ${f(2, 3)}`, [`${f(9, 15)} and ${f(10, 15)}`, `${f(3, 5)} &lt; ${f(2, 3)}`]]],
    look: ['4.01'],
    e: [
      ({ ri }) => { const d = ri(3, 12), a = ri(1, d - 1), b = ri(1, d - 1); return a === b ? null : { q: `Which is larger: ${f(a, d)} or ${f(b, d)}?`, a: f(Math.max(a, b), d) }; },
      ({ ri }) => { const a = ri(2, 12), b = ri(2, 12); return a === b ? null : { q: `Which is larger: ${f(1, a)} or ${f(1, b)}?`, a: f(1, Math.min(a, b)) }; },
      ({ ri }) => { const d = ri(5, 12), n = ri(1, d - 1); return n * 2 === d ? null : { q: `Is ${f(n, d)} more or less than ${f(1, 2)}?`, a: n * 2 > d ? 'more' : 'less' }; },
    ],
    m: [
      ({ ri, pick }) => { const a = pick(DEN), b = pick(DEN), x = ri(1, a - 1), y = ri(1, b - 1), l = lcd(a, b); return a === b || x * b === y * a || !ok(x, a) || !ok(y, b) ? null : { q: `Which is larger: ${f(x, a)} or ${f(y, b)}?`, w: [`${f(x * l / a, l)} and ${f(y * l / b, l)}`, `larger: ${x * b > y * a ? f(x, a) : f(y, b)}`] }; },
      ({ ri, pick }) => { const a = pick(DEN), b = pick(DEN), x = ri(1, a - 1), y = ri(1, b - 1), l = lcd(a, b); return a === b || x * b === y * a || !ok(x, a) || !ok(y, b) ? null : { q: `Write &lt; or &gt;: ${f(x, a)} ☐ ${f(y, b)}`, w: [`${f(x * l / a, l)} and ${f(y * l / b, l)}`, `${f(x, a)} ${x * b > y * a ? '&gt;' : '&lt;'} ${f(y, b)}`] }; },
      ({ ri, pick }) => { const fs = [], seen = new Set(); while (fs.length < 3) { const d = pick([2, 3, 4, 6, 12]), n = ri(1, d - 1); if (ok(n, d) && !seen.has(n / d)) { seen.add(n / d); fs.push([n, d]); } } const o = [...fs].sort((p, q) => p[0] / p[1] - q[0] / q[1]); return { q: `Order from smallest to largest: ${fs.map(([n, d]) => f(n, d)).join(', ')}`, w: [fs.map(([n, d]) => f(n * 12 / d, 12)).join(', '), o.map(([n, d]) => f(n, d)).join(', ')] }; },
    ],
    c: [
      ({ ri, pick }) => { const fs = [], seen = new Set(); while (fs.length < 4) { const d = pick([2, 3, 4, 5, 10]), n = ri(1, 2 * d - 1); if (gcd(n, d) === 1 && n !== d && !seen.has(n / d)) { seen.add(n / d); fs.push([n, d]); } } const o = [...fs].sort((p, q) => p[0] / p[1] - q[0] / q[1]); return { q: `Order from largest to smallest: ${fs.map((x) => S(x)).join(', ')}`, w: [fs.map(([n, d]) => f(n * 60 / d, 60)).join(', '), [...o].reverse().map((x) => S(x)).join(', ')] }; },
      ({ pick }) => { const [a, b, c] = pick([[[1, 3], [1, 2], '5/12'], [[1, 4], [1, 3], '7/24'], [[2, 5], [1, 2], '9/20'], [[3, 4], [5, 6], '19/24']]); return { q: `Write a fraction between ${f(...a)} and ${f(...b)}.`, w: ['use a common denominator, then find one between', `e.g. ${f(...c.split('/').map(Number))}`] }; },
      ({ pick }) => { const [a, b] = pick([[7, 8], [9, 10], [4, 5], [5, 6], [11, 12]]); const [c, d] = pick([[7, 8], [9, 10], [4, 5], [5, 6], [11, 12]]); return a === c ? null : { q: `Which is closer to 1: ${f(a, b)} or ${f(c, d)}?`, w: [`${f(a, b)} is ${f(1, b)} from 1; ${f(c, d)} is ${f(1, d)} from 1`, `closer: ${b > d ? f(a, b) : f(c, d)}`] }; },
    ],
  },

  '4.03': {
    idea: 'To add or subtract fractions, make the denominators the same. Then add or subtract the numerators and keep the denominator. Simplify the answer.',
    ex: [[`${f(3, 8)} + ${f(1, 8)}`, [`= ${f(4, 8)}`, `= ${f(1, 2)}`]], [`${f(2, 3)} + ${f(1, 4)}`, [`= ${f(8, 12)} + ${f(3, 12)}`, `= ${f(11, 12)}`]], [`${f(5, 6)} − ${f(1, 4)}`, [`= ${f(10, 12)} − ${f(3, 12)}`, `= ${f(7, 12)}`]]],
    look: ['4.02', '4.01'],
    e: [
      ({ ri }) => { const d = ri(3, 12), a = ri(1, d - 1), b = ri(1, d - 1); return a + b > d ? null : { q: `${f(a, d)} + ${f(b, d)}`, a: S([a + b, d]) }; },
      ({ ri }) => { const d = ri(3, 12), a = ri(2, d - 1), b = ri(1, a - 1); return { q: `${f(a, d)} − ${f(b, d)}`, a: S([a - b, d]) }; },
      ({ ri }) => { const d = ri(3, 12), n = ri(1, d - 1); return { q: `1 − ${f(n, d)}`, a: S([d - n, d]) }; },
    ],
    m: [
      ({ ri, pick }) => { const a = pick([2, 3, 4, 5]), k = pick([2, 3]), b = a * k, x = ri(1, a - 1), y = ri(1, b - 1), op = pick(['+', '−']); const r = op === '+' ? add([x, a], [y, b]) : sub([x, a], [y, b]); return r[0] <= 0 || !ok(y, b) ? null : { q: `${f(x, a)} ${op} ${f(y, b)}`, w: [`= ${f(x * k, b)} ${op} ${f(y, b)}`, `= ${S(r)}`] }; },
      ({ ri, pick }) => { const a = pick([2, 3, 4, 5, 6]), b = pick([3, 4, 5, 8, 10]), x = ri(1, a - 1), y = ri(1, b - 1), op = pick(['+', '−']), l = lcd(a, b); const r = op === '+' ? add([x, a], [y, b]) : sub([x, a], [y, b]); return a === b || l === Math.max(a, b) || r[0] <= 0 || !ok(x, a) || !ok(y, b) ? null : { q: `${f(x, a)} ${op} ${f(y, b)}`, w: [`= ${f(x * l / a, l)} ${op} ${f(y * l / b, l)}`, `= ${S(r)}`] }; },
      ({ pick }) => { const [a, b] = pick([[3, 4], [2, 5], [3, 5], [4, 6], [3, 8], [2, 6]]); const who = pick(NAMES), other = pick(['Bo', 'Sam', 'Jo']); const r = add([1, a], [1, b]); return { q: `${who} ate ${f(1, a)} of a pizza and ${other} ate ${f(1, b)}. What fraction did they eat altogether?`, w: [`${f(1, a)} + ${f(1, b)}`, `= ${f(lcd(a, b) / a, lcd(a, b))} + ${f(lcd(a, b) / b, lcd(a, b))} = ${S(r)}`] }; },
    ],
    c: [
      ({ pick }) => { const [a, b, c] = [pick([2, 3, 4]), pick([3, 4, 6]), pick([6, 12])]; if (new Set([a, b, c]).size < 3) return null; const r = sub(add([1, a], [1, b]), [1, c]); return r[0] <= 0 ? null : { q: `${f(1, a)} + ${f(1, b)} − ${f(1, c)}`, w: [`= ${f(12 / a, 12)} + ${f(12 / b, 12)} − ${f(12 / c, 12)}`, `= ${f(12 / a + 12 / b - 12 / c, 12)}`, `= ${S(r)}`] }; },
      ({ ri, pick }) => { const a = pick([3, 4, 5]), b = pick([4, 6, 8]), x = ri(2, a - 1), y = ri(2, b - 1), l = lcd(a, b); const r = add([x, a], [y, b]); return a === b || r[0] <= r[1] || !ok(x, a) || !ok(y, b) ? null : { q: `${f(x, a)} + ${f(y, b)}. Write the answer as a mixed numeral.`, w: [`= ${f(x * l / a, l)} + ${f(y * l / b, l)}`, `= ${f(r[0] * l / r[1], l)} = ${S(r)}`] }; },
      ({ ri, pick }) => { const a = pick([3, 4, 5, 6]), b = pick([4, 6, 8, 12]), x = ri(1, a - 1), y = ri(1, b - 1); const r = sub([x, a], [y, b]); return a === b || r[0] <= 0 || !ok(x, a) || !ok(y, b) ? null : { q: `How much more is ${f(x, a)} than ${f(y, b)}?`, w: [`${f(x, a)} − ${f(y, b)}`, `= ${S(r)}`] }; },
      ({ ri, pick }) => { const a = pick([3, 4, 6]), b = pick([6, 8, 12]), x = ri(1, a - 1), y = ri(1, b - 1); const r = sub([y, b], [x, a]); return a === b || r[0] <= 0 || !ok(x, a) || !ok(y, b) ? null : { q: `Find the missing fraction: ${f(x, a)} + ☐ = ${f(y, b)}`, w: [`☐ = ${f(y, b)} − ${f(x, a)}`, `☐ = ${S(r)}`] }; },
    ],
  },

  '4.04': {
    idea: 'Add the whole numbers, then add the fractions. Or change each mixed numeral to an improper fraction first. When subtracting, if the fraction part is too small, change to improper fractions.',
    ex: [[`${f(1, 5, 2)} + ${f(3, 5, 1)}`, ['2 + 1 = 3', `${f(1, 5)} + ${f(3, 5)} = ${f(4, 5)}`, `= ${f(4, 5, 3)}`]], [`${f(1, 4, 3)} − ${f(3, 4, 1)}`, [`= ${f(13, 4)} − ${f(7, 4)}`, `= ${f(6, 4)} = ${f(1, 2, 1)}`]], [`${f(2, 3, 1)} + ${f(1, 2, 2)}`, [`= ${f(5, 3)} + ${f(5, 2)}`, `= ${f(10, 6)} + ${f(15, 6)}`, `= ${f(25, 6)} = ${f(1, 6, 4)}`]]],
    look: ['4.03'],
    e: [
      ({ ri }) => { const d = ri(3, 9), a = ri(1, d - 1), b = ri(1, d - 1), w1 = ri(1, 7), w2 = ri(1, 5); return a + b >= d || !ok(a, d) || !ok(b, d) ? null : { q: `${f(a, d, w1)} + ${f(b, d, w2)}`, a: S(add(M(w1, a, d), M(w2, b, d))) }; },
      ({ ri }) => { const d = ri(3, 9), b = ri(1, d - 2), a = ri(b + 1, d - 1), w1 = ri(3, 8), w2 = ri(1, w1 - 1); return !ok(a, d) || !ok(b, d) ? null : { q: `${f(a, d, w1)} − ${f(b, d, w2)}`, a: S(sub(M(w1, a, d), M(w2, b, d))) }; },
      ({ ri }) => { const d = ri(2, 8), n = ri(1, d - 1), w = ri(2, 6); return ok(n, d) ? { q: `${w} − ${f(n, d)}`, a: f(d - n, d, w - 1) } : null; },
    ],
    m: [
      ({ ri, pick }) => { const d = pick([3, 4, 5, 6, 8]), a = ri(1, d - 2), b = ri(a + 1, d - 1), w1 = ri(3, 7), w2 = ri(1, w1 - 1); if (!ok(a, d) || !ok(b, d)) return null; const A = M(w1, a, d), B = M(w2, b, d); return { q: `${f(a, d, w1)} − ${f(b, d, w2)}`, w: [`= ${f(A[0], d)} − ${f(B[0], d)}`, `= ${f(A[0] - B[0], d)} = ${S(sub(A, B))}`] }; },
      ({ ri, pick }) => { const a = pick([2, 3, 4]), b = pick([3, 5, 6]), x = ri(1, a - 1), y = ri(1, b - 1), w1 = ri(1, 5), w2 = ri(1, 4), l = lcd(a, b); return a === b || !ok(x, a) || !ok(y, b) ? null : { q: `${f(x, a, w1)} + ${f(y, b, w2)}`, w: [`${w1} + ${w2} = ${w1 + w2}`, `${f(x * l / a, l)} + ${f(y * l / b, l)} = ${S(add([x, a], [y, b]))}`, `= ${S(add(M(w1, x, a), M(w2, y, b)))}`] }; },
      ({ ri, pick }) => { const d = pick([2, 4, 8]), a = ri(1, d - 1), b = ri(1, d - 1), w1 = ri(3, 6), w2 = ri(1, 2); if (!ok(a, d) || !ok(b, d)) return null; const r = sub(M(w1, a, d), M(w2, b, d)); return { q: `A pipe is ${f(a, d, w1)} m long. ${f(b, d, w2)} m is cut off. How much is left?`, w: [`${f(a, d, w1)} − ${f(b, d, w2)}`, `= ${S(r)} m`] }; },
    ],
    c: [
      ({ ri, pick }) => { const a = pick([3, 4, 5]), b = pick([2, 4, 6]), x = ri(1, a - 1), y = ri(1, b - 1), w1 = ri(2, 6), w2 = ri(1, w1 - 1), l = lcd(a, b); if (a === b || !ok(x, a) || !ok(y, b)) return null; const A = M(w1, x, a), B = M(w2, y, b), r = sub(A, B); return r[0] <= 0 ? null : { q: `${f(x, a, w1)} − ${f(y, b, w2)}`, w: [`= ${f(A[0], a)} − ${f(B[0], b)}`, `= ${f(A[0] * l / a, l)} − ${f(B[0] * l / b, l)}`, `= ${S(r)}`] }; },
      ({ ri, pick }) => { const d = pick([2, 3, 4]), a = ri(1, d - 1), b = ri(1, d - 1), L = ri(3, 8), W = ri(1, 4); if (!ok(a, d) || !ok(b, d)) return null; const P = mul([2, 1], add(M(L, a, d), M(W, b, d))); return { q: `A rectangle is ${f(a, d, L)} m long and ${f(b, d, W)} m wide. Find its perimeter.`, w: [`${f(a, d, L)} + ${f(b, d, W)} = ${S(add(M(L, a, d), M(W, b, d)))}`, `× 2 = ${S(P)} m`] }; },
      ({ ri, pick }) => { const a = pick([2, 3, 4]), b = pick([4, 6, 8]), x = ri(1, a - 1), y = ri(1, b - 1), w1 = ri(1, 3), w2 = ri(1, 3), w3 = ri(1, 2); if (a === b || !ok(x, a) || !ok(y, b)) return null; const r = add(add(M(w1, x, a), M(w2, y, b)), [w3, 1]); return { q: `${f(x, a, w1)} + ${f(y, b, w2)} + ${w3}`, w: [`wholes: ${w1} + ${w2} + ${w3} = ${w1 + w2 + w3}`, `fractions: ${S(add([x, a], [y, b]))}`, `= ${S(r)}`] }; },
    ],
  },

  '4.05': {
    idea: 'To find a fraction of an amount, divide by the denominator, then multiply by the numerator: ¾ of 20 = 20 ÷ 4 × 3 = 15. Change to a smaller unit first when you need to.',
    ex: [[`${f(1, 5)} of 35`, ['35 ÷ 5', '= 7']], [`${f(3, 4)} of 20`, ['20 ÷ 4 = 5', '5 × 3 = 15']], [`${f(2, 3)} of an hour, in minutes`, ['1 hour = 60 minutes', '60 ÷ 3 × 2 = 40 minutes']]],
    look: ['4.01'],
    e: [
      ({ ri }) => { const d = ri(2, 12), k = ri(2, 12); return { q: `${f(1, d)} of ${d * k}`, a: N0(k) }; },
      ({ ri }) => { const d = ri(3, 8), n = ri(2, d - 1), k = ri(2, 9); return ok(n, d) ? { q: `${f(n, d)} of ${d * k}`, a: N0(n * k) } : null; },
      ({ ri, pick }) => { const [t, k] = pick([['half', 2], ['a third', 3], ['a quarter', 4], ['a fifth', 5], ['a tenth', 10]]), x = ri(2, 15) * k; return { q: `What is ${t} of ${x}?`, a: N0(x / k) }; },
    ],
    m: [
      ({ ri }) => { const d = ri(3, 10), n = ri(2, d - 1), k = ri(6, 25); return ok(n, d) ? { q: `${f(n, d)} of ${d * k}`, w: [`${d * k} ÷ ${d} = ${k}`, `${k} × ${n} = ${n * k}`] } : null; },
      ({ ri, pick }) => { const [q, u, v] = pick([[60, 'an hour', 'minutes'], [1000, '1 kg', 'grams'], [100, '$1', 'cents'], [1000, '1 km', 'metres'], [24, 'a day', 'hours'], [100, '1 m', 'centimetres']]); const d = pick([2, 3, 4, 5, 6, 8, 10, 12].filter((x) => q % x === 0)), n = ri(1, d - 1); return ok(n, d) ? { q: `${f(n, d)} of ${u}, in ${v}`, w: [`${u} = ${q} ${v}`, `${q} ÷ ${d} × ${n} = ${(q / d) * n} ${v}`] } : null; },
      ({ ri, pick }) => { const d = pick([3, 4, 5, 6]), n = ri(1, d - 1), k = ri(4, 8); const [a, b] = pick([['students', 'are girls'], ['players', 'are under 12'], ['seats', 'are taken'], ['eggs', 'are brown']]); return ok(n, d) ? { q: `${f(n, d)} of ${d * k} ${a} ${b}. How many is that?`, w: [`${d * k} ÷ ${d} × ${n}`, `= ${n * k} ${a}`] } : null; },
    ],
    c: [
      ({ ri }) => { const d = ri(3, 8), k = ri(3, 15); return { q: `${f(1, d)} of a number is ${k}. What is the number?`, w: [`${k} × ${d}`, `= ${d * k}`] }; },
      ({ ri, pick }) => { const d = pick([3, 4, 5]), n = ri(2, d - 1), k = ri(3, 12); return ok(n, d) ? { q: `${f(n, d)} of a number is ${n * k}. What is the number?`, w: [`${f(1, d)} of it is ${n * k} ÷ ${n} = ${k}`, `the number: ${k} × ${d} = ${d * k}`] } : null; },
      ({ ri }) => { const x = ri(2, 6) * 12, y = ri(2, 6) * 12, B = (y / 4) * 3; return x === y ? null : { q: `Which is more: ${f(2, 3)} of ${x} or ${f(3, 4)} of ${y}?`, w: [`${f(2, 3)} of ${x} = ${(x / 3) * 2}, ${f(3, 4)} of ${y} = ${B}`, (x / 3) * 2 === B ? 'they are equal' : `more: ${(x / 3) * 2 > B ? `${f(2, 3)} of ${x}` : `${f(3, 4)} of ${y}`}`] }; },
      ({ ri, pick }) => { const d = pick([3, 4, 5, 10]), p = ri(2, 15) * d * (d === 10 ? 1 : 2); return { q: `A $${p} jacket is ${f(1, d)} off. What is the sale price?`, w: [`discount: ${p} ÷ ${d} = $${p / d}`, `price: ${p} − ${p / d} = $${p - p / d}`] }; },
      ({ ri, pick }) => { const t = 12 * ri(2, 10); return { q: `${pick(NAMES)} has $${t}. ${f(1, 3)} is spent on food and ${f(1, 4)} on transport. How much is left?`, w: [`food $${t / 3}, transport $${t / 4}`, `left: ${t} − ${t / 3} − ${t / 4} = $${t - t / 3 - t / 4}`] }; },
    ],
  },

  '4.06': {
    idea: 'To multiply fractions, multiply the numerators and multiply the denominators. Cancel first to keep the numbers small. Change mixed numerals to improper fractions first.',
    ex: [[`${f(2, 3)} × ${f(4, 5)}`, ['2 × 4 = 8, 3 × 5 = 15', `= ${f(8, 15)}`]], [`${f(3, 4)} × ${f(8, 9)}`, [`cancel: ${f(1, 1)} × ${f(2, 3)}`, `= ${f(2, 3)}`]], [`${f(1, 2, 1)} × ${f(2, 3, 2)}`, [`= ${f(3, 2)} × ${f(8, 3)}`, '= 4']]],
    look: ['4.05'],
    e: [
      ({ ri }) => { const a = ri(2, 9), b = ri(2, 9), x = ri(1, a - 1), y = ri(1, b - 1); return ok(x, a) && ok(y, b) ? { q: `${f(x, a)} × ${f(y, b)}`, a: S(mul([x, a], [y, b])) } : null; },
      ({ ri }) => { const k = ri(2, 9), d = ri(3, 9), n = ri(1, d - 1); return ok(n, d) ? { q: `${k} × ${f(n, d)}`, a: S([k * n, d]) } : null; },
      ({ ri }) => { const a = ri(2, 6), b = ri(2, 6); return { q: `${f(1, a)} of ${f(1, b)}`, a: f(1, a * b) }; },
    ],
    m: [
      ({ ri }) => { const p = ri(2, 5), a = ri(1, 4), b = ri(2, 7), m = ri(1, 4), n = ri(2, 7); const x = [a * p, b], y = [m, n * p]; return !ok(...x) || !ok(...y) || gcd(a, n) > 1 || gcd(m, b) > 1 ? null : { q: `${f(...x)} × ${f(...y)}`, w: [`cancel ${p}: ${f(a, b)} × ${f(m, n)}`, `= ${S(mul(x, y))}`] }; },
      ({ ri }) => { const d1 = ri(2, 5), n1 = ri(1, d1 - 1), w1 = ri(1, 3), d2 = ri(2, 6), n2 = ri(1, d2 - 1); const A = M(w1, n1, d1); return ok(n1, d1) && ok(n2, d2) ? { q: `${f(n1, d1, w1)} × ${f(n2, d2)}`, w: [`= ${f(A[0], d1)} × ${f(n2, d2)}`, `= ${S(mul(A, [n2, d2]))}`] } : null; },
      ({ ri }) => { const d = ri(3, 8), n = ri(1, d - 1), k = ri(2, 5) * d; return ok(n, d) ? { q: `${f(n, d)} × ${k}`, w: [`= ${k} ÷ ${d} × ${n}`, `= ${k / d * n}`] } : null; },
    ],
    c: [
      ({ ri }) => { const d1 = ri(2, 5), d2 = ri(2, 5), n1 = ri(1, d1 - 1), n2 = ri(1, d2 - 1), w1 = ri(1, 3), w2 = ri(1, 3); const A = M(w1, n1, d1), B = M(w2, n2, d2); return ok(n1, d1) && ok(n2, d2) ? { q: `${f(n1, d1, w1)} × ${f(n2, d2, w2)}`, w: [`= ${f(A[0], d1)} × ${f(B[0], d2)}`, `= ${f(A[0] * B[0], d1 * d2)}`, `= ${S(mul(A, B))}`] } : null; },
      ({ ri, pick }) => { const d = pick([2, 3, 4]), a = ri(1, d - 1), b = ri(1, d - 1), L = ri(2, 5), W = ri(1, 3); if (!ok(a, d) || !ok(b, d)) return null; const A = M(L, a, d), B = M(W, b, d); return { q: `Find the area of a rectangle ${f(a, d, L)} m long and ${f(b, d, W)} m wide.`, w: [`${f(A[0], d)} × ${f(B[0], d)}`, `= ${S(mul(A, B))} m²`] }; },
      ({ pick }) => { const [a, b] = pick([[[2, 3], [3, 4]], [[3, 5], [1, 2]], [[4, 5], [5, 6]]]); return { q: `Is ${f(...a)} × ${f(...b)} larger or smaller than ${f(...a)}? Explain.`, a: `Smaller: multiplying by a fraction less than 1 gives a smaller answer (${S(mul(a, b))}).`, n: 2 }; },
    ],
  },

  '4.07': {
    idea: 'To divide by a fraction, multiply by its reciprocal (turn it upside down): keep, change, flip. Change mixed numerals to improper fractions first.',
    ex: [[`Write the reciprocal of ${f(3, 7)}.`, ['turn it upside down', `= ${f(7, 3)}`]], [`${f(2, 3)} ÷ ${f(4, 5)}`, [`= ${f(2, 3)} × ${f(5, 4)}`, `= ${f(10, 12)} = ${f(5, 6)}`]], [`${f(1, 2, 2)} ÷ ${f(1, 4, 1)}`, [`= ${f(5, 2)} ÷ ${f(5, 4)}`, `= ${f(5, 2)} × ${f(4, 5)}`, '= 2']]],
    look: ['4.06'],
    e: [
      ({ ri }) => { const d = ri(2, 12), n = ri(1, 11); return n === d || gcd(n, d) > 1 ? null : { q: `Write the reciprocal of ${f(n, d)}.`, a: n === 1 ? String(d) : f(d, n) }; },
      ({ ri }) => { const k = ri(2, 6), d = ri(2, 5); return { q: `How many ${f(1, d)}s are in ${k}? Work out ${k} ÷ ${f(1, d)}.`, a: N0(k * d) }; },
      ({ ri }) => { const d = ri(3, 9), n = ri(1, d - 1), k = ri(2, 5); return ok(n, d) ? { q: `${f(n, d)} ÷ ${k}`, a: S([n, d * k]) } : null; },
    ],
    m: [
      ({ ri }) => { const a = ri(2, 9), b = ri(2, 9), x = ri(1, a - 1), y = ri(1, b - 1); return !ok(x, a) || !ok(y, b) ? null : { q: `${f(x, a)} ÷ ${f(y, b)}`, w: [`= ${f(x, a)} × ${f(b, y)}`, `= ${S(div([x, a], [y, b]))}`] }; },
      ({ ri }) => { const d = ri(2, 4), c = ri(2, 6); return { q: `How many ${f(1, d)}-cup scoops are in ${c} cups of flour?`, w: [`${c} ÷ ${f(1, d)} = ${c} × ${d}`, `= ${c * d} scoops`] }; },
      ({ ri }) => { const k = ri(2, 6), d = ri(3, 8), n = ri(2, d - 1); return ok(n, d) ? { q: `${k} ÷ ${f(n, d)}`, w: [`= ${k} × ${f(d, n)}`, `= ${S([k * d, n])}`] } : null; },
    ],
    c: [
      ({ ri }) => { const d1 = ri(2, 5), d2 = ri(2, 5), n1 = ri(1, d1 - 1), n2 = ri(1, d2 - 1), w1 = ri(1, 4), w2 = ri(1, 2); const A = M(w1, n1, d1), B = M(w2, n2, d2); return ok(n1, d1) && ok(n2, d2) ? { q: `${f(n1, d1, w1)} ÷ ${f(n2, d2, w2)}`, w: [`= ${f(A[0], d1)} ÷ ${f(B[0], d2)}`, `= ${f(A[0], d1)} × ${f(d2, B[0])}`, `= ${S(div(A, B))}`] } : null; },
      ({ pick }) => { const [L, p, n] = pick([[[15, 2], [3, 4], 10], [[6, 1], [3, 4], 8], [[9, 2], [3, 8], 12], [[5, 1], [5, 8], 8], [[10, 1], [2, 3], 15]]); return { q: `A ribbon ${S(L)} m long is cut into pieces ${f(...p)} m long. How many pieces?`, w: [`${S(L)} ÷ ${f(...p)}`, `= ${S(L, false)} × ${f(p[1], p[0])} = ${n} pieces`] }; },
      ({ pick }) => { const [a, b] = pick([[[3, 4], [1, 2]], [[2, 3], [1, 3]], [[5, 6], [1, 2]]]); return { q: `Is ${f(...a)} ÷ ${f(...b)} larger or smaller than ${f(...a)}? Explain.`, a: `Larger: dividing by a fraction less than 1 gives a larger answer (${S(div(a, b))}).`, n: 2 }; },
    ],
  },

  '4.08': {
    idea: 'Read the problem and decide: add, subtract, multiply or divide? Write the calculation, then answer in a sentence. The whole is 1.',
    ex: [[`Sam had $60 and spent ${f(2, 5)} of it. How much is left?`, ['spent: 60 ÷ 5 × 2 = $24', 'left: 60 − 24 = $36']], [`In a class, ${f(1, 2)} walk and ${f(1, 3)} ride. The rest take the bus. What fraction take the bus?`, [`${f(1, 2)} + ${f(1, 3)} = ${f(5, 6)}`, `bus: 1 − ${f(5, 6)} = ${f(1, 6)}`]], [`How many ${f(3, 4)} m pieces can be cut from 6 m?`, [`6 ÷ ${f(3, 4)} = 6 × ${f(4, 3)}`, '= 8 pieces']]],
    look: ['4.05', '4.07'],
    e: [
      ({ ri, pick }) => { const d = pick(DEN), n = ri(1, d - 1), [t, v] = pick([['a pizza', 'eaten'], ['a tank of petrol', 'used'], ['a cake', 'sold'], ['a book', 'read'], ['a bottle of water', 'drunk']]); return ok(n, d) ? { q: `${f(n, d)} of ${t} is ${v}. What fraction is left?`, a: S([d - n, d]) } : null; },
      ({ ri }) => { const g = ri(8, 18), b = ri(8, 18), t = g + b; return { q: `A class has ${g} girls and ${b} boys. What fraction of the class are girls?`, w: [`${f(g, t)}`, `= ${S([g, t])}`] }; },
      ({ ri, pick }) => { const d = pick([2, 3, 4, 5]), k = ri(3, 12) * d; return { q: `A ${k} cm ribbon is cut into ${d} equal pieces. What fraction of the ribbon is each piece, and how long is it?`, a: `${f(1, d)}, ${k / d} cm` }; },
    ],
    m: [
      ({ ri, pick }) => { const d = pick([3, 4, 5, 8, 10]), n = ri(1, d - 1), k = ri(3, 12), who = pick(NAMES); return ok(n, d) ? { q: `${who} had $${d * k} and spent ${f(n, d)} of it. How much is left?`, w: [`spent: ${d * k} ÷ ${d} × ${n} = $${n * k}`, `left: ${d * k} − ${n * k} = $${(d - n) * k}`] } : null; },
      ({ ri, pick }) => { const a = pick([2, 3, 4]), b = pick([4, 5, 6]); if (a === b) return null; const t = lcd(a, b) * ri(2, 5); return t - t / a - t / b <= 0 ? null : { q: `${t} students: ${f(1, a)} walk to school and ${f(1, b)} ride. The rest take the bus. How many take the bus?`, w: [`walk ${t / a}, ride ${t / b}`, `bus: ${t} − ${t / a} − ${t / b} = ${t - t / a - t / b}`] }; },
      ({ pick }) => { const [a, b] = pick([[1, 2], [1, 3], [1, 4], [2, 5], [1, 6]]); const [c, d] = pick([[1, 3], [1, 4], [1, 6], [1, 8]]); const r = sub([1, 1], add([a, b], [c, d])); return b === d || r[0] <= 0 ? null : { q: `A garden is ${f(a, b)} lawn and ${f(c, d)} vegetables. The rest is flowers. What fraction is flowers?`, w: [`${f(a, b)} + ${f(c, d)} = ${S(add([a, b], [c, d]))}`, `flowers: 1 − ${S(add([a, b], [c, d]))} = ${S(r)}`] }; },
    ],
    c: [
      ({ ri, pick }) => { const t = 12 * ri(3, 10); return { q: `${pick(NAMES)} had $${t}. ${f(1, 3)} was spent on Monday and ${f(1, 4)} of what was left on Tuesday. How much is left?`, w: [`Mon: ${t} ÷ 3 = ${t / 3}, left ${t - t / 3}`, `Tue: ${t - t / 3} ÷ 4 = ${(t - t / 3) / 4}`, `left: $${(t - t / 3) * 3 / 4}`] }; },
      ({ ri, pick }) => { const d = pick([3, 4, 5]), n = ri(1, d - 1), left = ri(2, 10) * 10; return ok(n, d) ? { q: `After spending ${f(n, d)} of the money, $${left * (d - n)} was left. How much was there at the start?`, w: [`left = ${f(d - n, d)} of the money`, `${f(1, d)} = ${left * (d - n)} ÷ ${d - n} = ${left}`, `start: ${left} × ${d} = $${left * d}`] } : null; },
      ({ pick }) => { const [L, p] = pick([[12, [2, 3]], [9, [3, 4]], [10, [2, 5]], [15, [3, 5]], [7, [7, 8]]]); return { q: `How many ${f(...p)} m lengths can be cut from a ${L} m pipe?`, w: [`${L} ÷ ${f(...p)} = ${L} × ${f(p[1], p[0])}`, `= ${S(div([L, 1], p))} lengths`] }; },
    ],
  },

  '4.09': {
    idea: 'Use the fraction key on your calculator to enter fractions and mixed numerals. The S⇔D key switches the answer between a fraction and a decimal. Use brackets for more than one step.',
    ex: [[`Use a calculator: ${f(5, 12)} + ${f(7, 18)}`, ['5 ▭/▭ 12 + 7 ▭/▭ 18 =', `= ${f(29, 36)}`]], [`Use a calculator: ${f(3, 8, 2)} × ${f(5, 6, 1)}`, ['enter each mixed numeral', `= ${S(mul(M(2, 3, 8), M(1, 5, 6)))}`]], [`Use a calculator to write ${f(7, 16)} as a decimal.`, ['7 ▭/▭ 16 = then S⇔D', '= 0.4375']]],
    look: ['4.06', '4.07'],
    e: [
      ({ ri, pick }) => { const a = ri(5, 20), b = ri(5, 20), x = ri(1, a - 1), y = ri(1, b - 1), op = pick(['+', '×']); return !ok(x, a) || !ok(y, b) ? null : { q: `Use a calculator: ${f(x, a)} ${op} ${f(y, b)}`, a: S(op === '+' ? add([x, a], [y, b]) : mul([x, a], [y, b])) }; },
      ({ pick }) => { const [n, d] = pick([[3, 8], [5, 16], [7, 20], [9, 25], [11, 40], [13, 50], [7, 8], [3, 16]]); return { q: `Use a calculator to write ${f(n, d)} as a decimal.`, a: fmt(n / d, 4) }; },
      ({ ri }) => { const d = ri(5, 15), n = ri(1, d - 1), k = ri(6, 14); return ok(n, d) ? { q: `Use a calculator to simplify ${f(n * k, d * k)}.`, a: f(n, d) } : null; },
    ],
    m: [
      ({ ri }) => { const a = ri(5, 20), b = ri(5, 20), x = ri(1, a - 1), y = ri(1, b - 1); return !ok(x, a) || !ok(y, b) ? null : { q: `Use a calculator: ${f(x, a)} ÷ ${f(y, b)}`, w: [`${x} ▭/▭ ${a} ÷ ${y} ▭/▭ ${b} =`, `= ${S(div([x, a], [y, b]))}`] }; },
      ({ ri }) => { const d1 = ri(3, 9), d2 = ri(3, 9), n1 = ri(1, d1 - 1), n2 = ri(1, d2 - 1), w1 = ri(2, 6), w2 = ri(1, 4); return ok(n1, d1) && ok(n2, d2) ? { q: `Use a calculator: ${f(n1, d1, w1)} − ${f(n2, d2, w2)}`, w: ['enter each mixed numeral', `= ${S(sub(M(w1, n1, d1), M(w2, n2, d2)))}`] } : null; },
      ({ ri }) => { const a = ri(2, 9), b = ri(2, 9), c = ri(2, 9), x = ri(1, a - 1), y = ri(1, b - 1), z = ri(1, c - 1); const r = mul(add([x, a], [y, b]), [z, c]); return { q: `Use a calculator: (${f(x, a)} + ${f(y, b)}) × ${f(z, c)}`, w: [`bracket: ${S(add([x, a], [y, b]))}`, `= ${S(r)}`] }; },
    ],
    c: [
      ({ pick }) => { const [a, b] = pick([[[13, 17], [16, 21]], [[7, 9], [11, 14]], [[5, 7], [8, 11]], [[9, 13], [11, 16]]]); return { q: `Which is larger: ${f(...a)} or ${f(...b)}? Use decimals.`, w: [`${fmt(a[0] / a[1], 4)} and ${fmt(b[0] / b[1], 4)}`, `larger: ${a[0] / a[1] > b[0] / b[1] ? f(...a) : f(...b)}`] }; },
      ({ ri, pick }) => { const d = pick([3, 4, 6, 8]), n = ri(1, d - 1), w = ri(2, 5), p = ri(12, 30); return ok(n, d) ? { q: `A bag of rice holds ${f(n, d, w)} kg. How much rice is in ${p} bags?`, w: [`${f(n, d, w)} × ${p}`, `= ${S(mul(M(w, n, d), [p, 1]))} kg`] } : null; },
      ({ ri }) => { const a = ri(5, 12), b = ri(5, 12); return a === b ? null : { q: `Use a calculator: ${f(1, a)} + ${f(1, b)} + ${f(1, a * b)}`, w: ['enter each fraction', `= ${S(add(add([1, a], [1, b]), [1, a * b]))}`] }; },
    ],
  },

  '4.10': {
    idea: 'Per cent means out of 100. Percentage to fraction: write it over 100 and simplify. Percentage to decimal: divide by 100. Fraction or decimal to percentage: multiply by 100%.',
    ex: [['Write 35% as a fraction.', [`= ${f(35, 100)}`, `= ${f(7, 20)}`]], [`Write ${f(3, 5)} as a percentage.`, [`= ${f(60, 100)}`, '= 60%']], ['Write 0.08 as a percentage.', ['0.08 × 100%', '= 8%']]],
    look: ['4.01'],
    e: [
      ({ pick }) => { const p = pick([5, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 2, 4, 15, 35, 45, 12, 8]); return { q: `Write ${p}% as a fraction in simplest form.`, a: S([p, 100], false) }; },
      ({ ri }) => { const p = ri(1, 150); return { q: `Write ${p}% as a decimal.`, a: fmt(p / 100, 2) }; },
      ({ ri }) => { const x = ri(1, 99) / 100; return { q: `Write ${fmt(x, 2)} as a percentage.`, a: pct(x * 100) }; },
    ],
    m: [
      ({ ri, pick }) => { const d = pick([2, 4, 5, 10, 20, 25, 50]), n = ri(1, d - 1); return ok(n, d) ? { q: `Write ${f(n, d)} as a percentage.`, w: [`= ${f(n * 100 / d, 100)}`, `= ${pct((n / d) * 100)}`] } : null; },
      ({ pick }) => { const x = pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.6, 0.7, 0.75, 0.8, 0.9, 0.05, 0.15, 0.35, 0.45, 0.02, 0.04, 0.12, 0.65]); const p = Math.round(x * 100); return { q: `Write ${fmt(x, 2)} as a percentage and as a fraction.`, w: [`× 100: ${p}%`, `${f(p, 100)} = ${S([p, 100], false)}`] }; },
      ({ pick, shuffle }) => { const [a, b, c] = pick([[[2, 5], 0.45, 38], [[3, 4], 0.7, 72], [[1, 5], 0.25, 22], [[3, 8], 0.4, 35], [[5, 8], 0.6, 66]]); const xs = shuffle([[f(...a), a[0] / a[1]], [fmt(b, 2), b], [`${c}%`, c / 100]]); return { q: `Order from smallest to largest: ${xs.map((x) => x[0]).join(', ')}`, w: [`${xs.map((x) => `${fmt(x[1] * 100, 1)}%`).join(', ')}`, [...xs].sort((p, q) => p[1] - q[1]).map((x) => x[0]).join(', ')] }; },
    ],
    c: [
      ({ pick }) => { const [p, n, d] = pick([[12.5, 1, 8], [37.5, 3, 8], [62.5, 5, 8], [87.5, 7, 8], [2.5, 1, 40], [7.5, 3, 40]]); return { q: `Write ${p}% as a fraction in simplest form.`, w: [`= ${f(p * 10, 1000)}`, `= ${f(n, d)}`] }; },
      ({ pick }) => { const [n, d] = pick([[1, 3], [2, 3], [1, 6], [5, 6], [1, 7], [1, 9]]); return { q: `Write ${f(n, d)} as a percentage, to one decimal place.`, w: [`${n} ÷ ${d} × 100`, `≈ ${fmt((n / d) * 100, 1)}%`] }; },
      ({ pick, shuffle }) => { const [good, odd] = pick([[[`${f(3, 5)}`, '0.6', '60%'], '65%'], [[`${f(1, 4)}`, '0.25', '25%'], '0.4'], [[`${f(7, 10)}`, '0.7', '70%'], '7%'], [[`${f(1, 2)}`, '0.5', '50%'], `${f(1, 5)}`]]); const xs = shuffle([...good, odd]); return { q: `Which is the odd one out: ${xs.join(', ')}? Explain.`, a: `${odd}: the others are all equal.`, n: 2 }; },
    ],
  },

  '4.11': {
    idea: 'Find 10% by dividing by 10, then build the percentage you need: 30% is 3 × 10%, 5% is half of 10%. Or change the percentage to a fraction or a decimal and multiply.',
    ex: [['10% of 340', ['340 ÷ 10', '= 34']], ['35% of 80', ['10% = 8, so 30% = 24', '5% = 4', '35% = 24 + 4 = 28']], ['A $60 jacket is 25% off. Find the sale price.', ['discount: 25% of 60 = $15', 'price: 60 − 15 = $45']]],
    look: ['4.10', '4.05'],
    e: [
      ({ ri, pick }) => { const p = pick([10, 50, 25, 1]), a = { 10: ri(2, 90) * 10, 50: ri(2, 90) * 2, 25: ri(2, 40) * 4, 1: ri(2, 9) * 100 }[p]; return { q: `${p}% of ${a}`, a: fmt((p * a) / 100) }; },
      ({ ri }) => { const a = ri(20, 900); return { q: `What is 10% of ${a}?`, a: fmt(a / 10, 2) }; },
      ({ ri, pick }) => { const p = pick([100, 200, 50]), a = ri(12, 90); return { q: `${p}% of ${a}`, a: fmt((p * a) / 100) }; },
    ],
    m: [
      ({ ri, pick }) => { const p = pick([20, 30, 40, 5, 15, 60, 70]), a = ri(2, 30) * 20; const ten = a / 10; return { q: `${p}% of ${a}`, w: [`10% = ${fmt(ten)}`, `${p}% = ${fmt((p * a) / 100)}`] }; },
      ({ ri, pick }) => { const p = pick([10, 20, 25, 50]), m = ri(2, 20) * 10, who = pick(NAMES); return { q: `${who} scored ${p}% on a test out of ${m}. How many marks is that?`, w: [`${p}% of ${m}`, `= ${fmt((p * m) / 100)} marks`] }; },
      ({ ri, pick }) => { const p = pick([12, 18, 35, 45, 65, 85]), a = ri(2, 30) * 20; return { q: `${p}% of $${a}`, w: [`${p} ÷ 100 × ${a}`, `= $${fmt((p * a) / 100, 2)}`] }; },
    ],
    c: [
      ({ ri, pick }) => { const p = pick([10, 20, 25, 30, 50, 15, 40]), a = ri(2, 30) * 10; const d = (p * a) / 100; return { q: `A $${a} jacket is ${p}% off. Find the sale price.`, w: [`discount: ${p}% of ${a} = $${fmt(d, 2)}`, `price: ${a} − ${fmt(d, 2)} = $${fmt(a - d, 2)}`] }; },
      ({ pick }) => { const [a, b] = pick([[30, 70], [20, 45], [40, 15], [25, 80]]); return { q: `Which is larger: ${a}% of ${b} or ${b}% of ${a}?`, w: [`${a}% of ${b} = ${fmt((a * b) / 100)}`, `${b}% of ${a} = ${fmt((a * b) / 100)}: they are equal`], key: `${a}${b}` }; },
      ({ ri, pick }) => { const p = pick([10, 20, 25, 5]), a = ri(4, 30) * 20; return { q: `A $${a} bike goes up in price by ${p}%. Find the new price.`, w: [`increase: ${p}% of ${a} = $${fmt((p * a) / 100, 2)}`, `new price: $${fmt(a + (p * a) / 100, 2)}`] }; },
    ],
  },

  '4.12': {
    idea: 'Write the part over the whole as a fraction, then simplify. To make it a percentage, multiply by 100%. Change to the same units first.',
    ex: [['Write 15 out of 20 as a percentage.', [`${f(15, 20)} = ${f(75, 100)}`, '= 75%']], ['Write 40 cm as a fraction of 2 m.', ['2 m = 200 cm', `${f(40, 200)} = ${f(1, 5)}`]], ['Sam got 18 out of 24. What percentage is that?', [`${f(18, 24)} = ${f(3, 4)}`, '= 75%']]],
    look: ['4.11', '4.10'],
    e: [
      ({ ri, pick }) => { const b = pick([10, 20, 25, 50, 4, 5]), a = ri(1, b - 1); return { q: `Write ${a} out of ${b} as a percentage.`, a: pct((a / b) * 100) }; },
      ({ ri }) => { const b = ri(6, 20), a = ri(1, b - 1); return { q: `Write ${a} out of ${b} as a fraction in simplest form.`, a: S([a, b]) }; },
    ],
    m: [
      ({ ri, pick }) => { const b = pick([20, 25, 50, 4, 5, 10]), a = ri(1, b - 1); return { q: `Write ${a} out of ${b} as a percentage.`, w: [`${f(a, b)} = ${f(a * 100 / b, 100)}`, `= ${pct((a / b) * 100)}`] }; },
      ({ pick }) => { const [u, v, k] = pick([['cm', 'm', 100], ['min', 'h', 60], ['g', 'kg', 1000], ['mL', 'L', 1000]]); const b = pick([1, 2, 3]), a = pick([k / 10, k / 5, k / 4, k / 2, (3 * k) / 4]); return Number.isInteger(a) ? { q: `Write ${a} ${u} as a fraction of ${b} ${v}.`, w: [`${b} ${v} = ${b * k} ${u}`, `${f(a, b * k)} = ${S([a, b * k])}`] } : null; },
      ({ ri, pick }) => { const t = pick([20, 25, 40, 50]), s = ri(Math.ceil(t / 2), t - 1), who = pick(NAMES); return { q: `${who} got ${s} out of ${t} on a test. What percentage is that?`, w: [`${f(s, t)} × 100%`, `= ${pct((s / t) * 100)}`] }; },
    ],
    c: [
      ({ pick }) => { const m = pick([15, 30, 45, 12, 6, 36, 48]); return { q: `What percentage of an hour is ${m} minutes?`, w: [`${f(m, 60)} × 100%`, `= ${pct((m / 60) * 100)}`] }; },
      ({ pick }) => { const [[a, b], [c, d]] = pick([[[17, 20], [21, 25]], [[13, 20], [16, 25]], [[9, 10], [22, 25]], [[7, 10], [36, 50]]]); return { q: `Which is the better score: ${a} out of ${b} or ${c} out of ${d}?`, w: [`${pct((a / b) * 100)} and ${pct((c / d) * 100)}`, `better: ${a / b > c / d ? `${a} out of ${b}` : `${c} out of ${d}`}`] }; },
      ({ ri }) => { const g = ri(6, 18), b = ri(6, 18), t = g + b; return (g * 100) % t ? null : { q: `A class has ${g} girls and ${b} boys. What percentage are girls?`, w: [`${f(g, t)} × 100%`, `= ${pct((g / t) * 100)}`] }; },
    ],
  },
};

// Helpers used above (defined after the lessons to keep the lessons first in the file).
function N0(v) { return fmt(v); }
