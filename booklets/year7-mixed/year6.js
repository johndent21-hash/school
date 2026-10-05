// Year 6 skills, mixed into the first lessons of Chapter 1 before there are earlier Year 7 lessons to draw on.
// Same format as a lesson (lib/mixed.js): e and m kinds of question. They are tagged "from Year 6".
const { N } = require('../lib/drill');
const { F } = require('../lib/calc');

module.exports = {
  // Place value and rounding
  'Y6.1': {
    e: [
      ({ ri, pick }) => { const n = ri(1000, 9999), p = pick([10, 100, 1000]); return { q: `Round ${N(n)} to the nearest ${N(p)}.`, a: N(Math.round(n / p) * p) }; },
      ({ ri }) => { const d = [ri(1, 9), ri(0, 9), ri(1, 9), ri(0, 9), ri(1, 9)]; const k = ri(0, 3); const val = d[k] * 10 ** (4 - k); return d[k] === 0 ? null : { q: `What is the value of the ${d[k]} in ${N(+d.join(''))}?`, a: N(val) }; },
    ],
    m: [
      ({ ri }) => { const a = ri(2, 9), b = ri(1, 9), c = ri(1, 9); return { q: `Write ${N(a * 10000)} + ${b * 100} + ${c} as one number.`, a: N(a * 10000 + b * 100 + c) }; },
      ({ ri }) => { const xs = [ri(1000, 9999), ri(1000, 9999), ri(1000, 9999), ri(1000, 9999)]; return new Set(xs).size < 4 ? null : { q: `Which is largest: ${xs.map(N).join(', ')}?`, a: N(Math.max(...xs)) }; },
    ],
  },
  // Adding and subtracting
  'Y6.2': {
    e: [
      ({ ri }) => { const a = ri(125, 695), b = ri(118, 299); return { q: `${a} + ${b}`, a: N(a + b) }; },
      ({ ri, pick }) => { const t = pick([100, 1000]), b = ri(t / 10, t - 1); return { q: `${N(t)} − ${b}`, a: N(t - b) }; },
    ],
    m: [
      ({ ri }) => { const a = ri(1200, 4800), b = ri(350, 990); return { q: `A school raised $${N(a)} and spent $${b}. How much is left?`, w: [`${N(a)} − ${b}`, `= $${N(a - b)}`] }; },
      ({ ri }) => { const t = ri(3, 12), d = ri(t + 2, t + 9); return { q: `It is ${t}°C. It gets ${d} degrees colder. What is the temperature now?`, a: `${N(t - d)}°C` }; },
    ],
  },
  // Multiplying and dividing
  'Y6.3': {
    e: [
      ({ ri }) => { const a = ri(6, 12), b = ri(6, 12); return { q: `${a} × ${b}`, a: N(a * b) }; },
      ({ ri }) => { const a = ri(6, 12), b = ri(6, 12); return { q: `${a * b} ÷ ${a}`, a: N(b) }; },
    ],
    m: [
      ({ ri }) => { const a = ri(14, 48), b = ri(4, 9); return { q: `${a} × ${b}`, w: [`${a} × ${b} = ${Math.floor(a / 10) * 10 * b} + ${(a % 10) * b}`, `= ${N(a * b)}`] }; },
      ({ ri }) => { const n = ri(4, 9), e = ri(12, 25); return { q: `${n * e} students sit in ${n} equal rows. How many are in each row?`, a: `${e} students` }; },
    ],
  },
  // Order of operations
  'Y6.4': {
    e: [
      ({ ri }) => { const a = ri(2, 9), b = ri(2, 9), c = ri(2, 9); return { q: `${a} + ${b} × ${c}`, w: [`= ${a} + ${b * c}`, `= ${a + b * c}`] }; },
      ({ ri }) => { const a = ri(20, 40), c = ri(2, 6), q = ri(2, 6); return { q: `${a} − ${c * q} ÷ ${c}`, w: [`= ${a} − ${q}`, `= ${a - q}`] }; },
    ],
    m: [
      ({ ri }) => { const a = ri(2, 9), b = ri(2, 9), c = ri(2, 6); return { q: `(${a} + ${b}) × ${c}`, w: [`= ${a + b} × ${c}`, `= ${(a + b) * c}`] }; },
      ({ ri }) => { const a = ri(3, 9), b = ri(3, 9), c = ri(2, 5), d = ri(2, 5); return a * b <= c * d ? null : { q: `${a} × ${b} − ${c} × ${d}`, w: [`= ${a * b} − ${c * d}`, `= ${a * b - c * d}`] }; },
    ],
  },
  // Fractions and decimals of amounts
  'Y6.5': {
    e: [
      ({ ri, pick }) => { const d = pick([2, 3, 4, 5, 10]), k = ri(3, 12); return { q: `What is ${F(1, d)} of ${d * k}?`, a: N(k) }; },
      ({ pick }) => { const t = pick([1, 3, 7, 9]); return { q: `Write 0.${t} as a fraction.`, a: `${t}/10` }; },
    ],
    m: [
      ({ ri, pick }) => { const d = pick([3, 4, 5, 8]), n = ri(2, d - 1), k = ri(3, 12); return { q: `What is ${F(n, d)} of ${d * k}?`, w: [`${F(1, d)} of ${d * k} = ${k}`, `${n} × ${k} = ${n * k}`] }; },
    ],
  },
};
