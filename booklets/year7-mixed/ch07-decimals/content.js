// Chapter 7 Decimals: mixed-practice questions (lib/mixed.js). Every question stands on its own.
const { F, simp, gcd, fmt } = require('../../lib/calc');

const N = (v, dp = 6) => fmt(v, dp);
const $ = (v) => `$${(+v).toFixed(2)}`;
const dp = (x) => (String(x).split('.')[1] || '').length;
const r2 = (x, k = 6) => +(+x).toFixed(k);
const pad = (x, k) => (+x).toFixed(k);
const S = ([n, d]) => { [n, d] = simp([n, d]); if (d === 1) return fmt(n); const w = Math.floor(n / d); return w ? F(n % d, d, w) : F(n, d); };
const rec = (d) => `<span class="rec">${d}</span>`;
const NAMES = ['Ali', 'Mia', 'Zac', 'Lena', 'Kai', 'Ruby', 'Tom', 'Priya', 'Jack', 'Aisha', 'Noah', 'Chloe'];
const PLACE = ['', 'tenths', 'hundredths', 'thousandths'];
const roundTo = (x, k) => (Math.round(x * 10 ** k + 1e-9) / 10 ** k).toFixed(k);
// Recurring decimals for fractions with a repeating part: [n, d, text].
const RECUR = [[1, 3, `0.${rec(3)}`], [2, 3, `0.${rec(6)}`], [1, 6, `0.1${rec(6)}`], [5, 6, `0.8${rec(3)}`], [1, 9, `0.${rec(1)}`], [4, 9, `0.${rec(4)}`], [7, 9, `0.${rec(7)}`], [1, 11, `0.${rec(0)}${rec(9)}`], [5, 11, `0.${rec(4)}${rec(5)}`], [1, 12, `0.08${rec(3)}`], [7, 12, `0.58${rec(3)}`], [2, 9, `0.${rec(2)}`]];

module.exports = {
  '7.01': {
    idea: 'Compare decimals place by place from the left. Give them the same number of decimal places first: 0.5 = 0.50, so 0.5 is larger than 0.45.',
    ex: [['Which is larger: 0.7 or 0.65?', ['0.70 and 0.65', 'larger: 0.7']], ['Order from smallest to largest: 2.3, 2.03, 2.33, 2.303', ['2.300, 2.030, 2.330, 2.303', '2.03, 2.3, 2.303, 2.33']], ['Write &lt; or &gt;: 4.09 ☐ 4.1', ['4.09 and 4.10', '4.09 &lt; 4.1']]],
    e: [
      ({ ri }) => { const a = ri(1, 9) / 10, b = ri(11, 99) / 100; return a === b ? null : { q: `Which is larger: ${N(a)} or ${N(b)}?`, a: N(Math.max(a, b)) }; },
      ({ ri }) => { const ds = [ri(1, 9), ri(1, 9), ri(1, 9)], k = ri(1, 3), w = ri(0, 9); const x = `${w}.${ds.join('')}`; return { q: `What is the value of the ${ds[k - 1]} in ${x}?`, a: `${ds[k - 1]} ${PLACE[k]} (${N(ds[k - 1] / 10 ** k)})` }; },
      ({ ri }) => { const w = ri(0, 9), a = w + ri(1, 99) / 100, b = w + ri(1, 9) / 10; return a === b ? null : { q: `Write &lt; or &gt;: ${N(a)} ☐ ${N(b)}`, a: `${N(a)} ${a < b ? '&lt;' : '&gt;'} ${N(b)}` }; },
    ],
    m: [
      ({ ri, shuffle }) => { const w = ri(1, 9), d = ri(1, 9); const xs = [w + d / 10, w + d / 100, w + (d * 11) / 100, w + (d * 101) / 1000]; return new Set(xs).size < 4 || d * 11 >= 100 ? null : (() => { const s = shuffle(xs); return { q: `Order from smallest to largest: ${s.map((x) => N(x)).join(', ')}`, w: [s.map((x) => pad(x, 3)).join(', '), [...s].sort((a, b) => a - b).map((x) => N(x)).join(', ')] }; })(); },
      ({ ri, shuffle }) => { const xs = shuffle([ri(1, 9) / 10, ri(10, 99) / 100, ri(100, 999) / 1000, ri(1, 9) / 100]); return new Set(xs).size < 4 ? null : { q: `Order from largest to smallest: ${xs.map((x) => N(x)).join(', ')}`, w: [xs.map((x) => pad(x, 3)).join(', '), [...xs].sort((a, b) => b - a).map((x) => N(x)).join(', ')] }; },
      ({ ri }) => { const a = ri(1, 8) / 10; return { q: `Write a decimal between ${N(a)} and ${N(r2(a + 0.1))}.`, a: `e.g. ${N(r2(a + 0.05))}` }; },
    ],
    c: [
      ({ shuffle, pick }) => { const set = pick([[0.9, 1.09, 0.99, 1.1], [1.9, 2.1, 2.01, 1.99], [4.95, 5.1, 4.9, 5.04]]); const t = Math.round(set[0]); const best = [...set].sort((a, b) => Math.abs(a - t) - Math.abs(b - t))[0]; const s = shuffle(set); return { q: `Which is closest to ${t}: ${s.map((x) => N(x)).join(', ')}?`, w: [`distances: ${s.map((x) => N(r2(Math.abs(x - t)))).join(', ')}`, `closest: ${N(best)}`] }; },
      ({ ri, pick }) => { const a = ri(11, 49), b = ri(2, 4), who = pick(NAMES); return { q: `${who} says 0.${a} &gt; 0.${b} because ${a} &gt; ${b}. Is that right? Explain.`, a: `No. 0.${b} = 0.${b}0, and ${b}0 &gt; ${a}.`, n: 2, key: `says ${ri(1, 2)}` }; },
      ({ ri, shuffle }) => { const xs = shuffle([-ri(1, 9) / 10, -ri(11, 99) / 100, ri(1, 9) / 10, 0]); return new Set(xs).size < 4 ? null : { q: `Order from smallest to largest: ${xs.map((x) => N(x)).join(', ')}`, a: [...xs].sort((a, b) => a - b).map((x) => N(x)).join(', ') }; },
    ],
  },

  '7.02': {
    idea: 'After the point come tenths, hundredths and thousandths: 0.37 = 37 hundredths = 37/100. To write a fraction as a decimal, make its denominator 10, 100 or 1000.',
    ex: [['Write 0.45 as a fraction in simplest form.', [`= ${F(45, 100)}`, `= ${F(9, 20)}`]], [`Write ${F(3, 5)} as a decimal.`, [`= ${F(6, 10)}`, '= 0.6']], ['Write 2.125 as a mixed numeral.', [`= 2 ${F(125, 1000)}`, `= ${F(1, 8, 2)}`]]],
    look: ['7.01', '4.01'],
    e: [
      ({ ri }) => { const t = ri(1, 9); return { q: `Write 0.${t} as a fraction.`, a: S([t, 10]) }; },
      ({ ri }) => { const h = ri(1, 99); return h % 10 === 0 ? null : { q: `Write ${F(h, 100)} as a decimal.`, a: N(h / 100) }; },
      ({ ri }) => { const t = ri(1, 999); return t % 10 === 0 ? null : { q: `Write ${F(t, 1000)} as a decimal.`, a: N(t / 1000) }; },
    ],
    m: [
      ({ ri }) => { const h = ri(2, 98); return gcd(h, 100) === 1 || h % 10 === 0 ? null : { q: `Write 0.${String(h).padStart(2, '0')} as a fraction in simplest form.`, w: [`= ${F(h, 100)}`, `= ${S([h, 100])}`] }; },
      ({ pick, ri }) => { const d = pick([2, 4, 5, 20, 25, 50]), n = ri(1, d - 1); return gcd(n, d) > 1 ? null : { q: `Write ${F(n, d)} as a decimal.`, w: [`= ${F(n * 100 / d, 100)}`, `= ${N(n / d)}`] }; },
      ({ ri }) => { const w = ri(1, 9), h = ri(1, 99); return h % 10 === 0 ? null : { q: `Write ${w}.${String(h).padStart(2, '0')} as a mixed numeral.`, w: [`= ${w} ${F(h, 100)}`, `= ${S([w * 100 + h, 100])}`] }; },
    ],
    c: [
      ({ pick }) => { const [x, f] = pick([['0.125', [1, 8]], ['0.375', [3, 8]], ['0.625', [5, 8]], ['0.875', [7, 8]], ['0.025', [1, 40]], ['0.064', [8, 125]]]); return { q: `Write ${x} as a fraction in simplest form.`, w: [`= ${F(Math.round(+x * 1000), 1000)}`, `= ${F(...f)}`], key: x }; },
      ({ pick, shuffle }) => { const [a, b, c] = pick([[[3, 4], 0.7, [4, 5]], [[1, 4], 0.3, [1, 5]], [[2, 5], 0.45, [3, 8]], [[1, 2], 0.48, [3, 5]]]); const xs = shuffle([[F(...a), a[0] / a[1]], [N(b), b], [F(...c), c[0] / c[1]]]); return { q: `Order from smallest to largest: ${xs.map((x) => x[0]).join(', ')}`, w: [xs.map((x) => N(x[1])).join(', '), [...xs].sort((p, q) => p[1] - q[1]).map((x) => x[0]).join(', ')] }; },
      ({ pick }) => { const who = pick(NAMES); return { q: `${who} says 0.3 is the same as ${F(1, 3)}. Is that right? Explain.`, a: `No. 0.3 = ${F(3, 10)}, but ${F(1, 3)} = 0.333…`, n: 2, key: 'third' }; },
    ],
  },

  '7.03': {
    idea: 'Line up the decimal points. Fill any gaps with zeros so both numbers have the same number of decimal places, then add or subtract as with whole numbers.',
    ex: [['3.45 + 2.8', ['3.45 + 2.80', '= 6.25']], ['7 − 2.36', ['7.00 − 2.36', '= 4.64']], ['A $20 note pays for a $13.85 meal. Find the change.', ['20.00 − 13.85', '= $6.15']]],
    look: ['7.01'],
    e: [
      ({ ri }) => { const a = ri(11, 99) / 10, b = ri(11, 99) / 10; return { q: `${N(a)} + ${N(b)}`, a: N(r2(a + b)) }; },
      ({ ri }) => { const a = ri(50, 99) / 10, b = ri(11, 49) / 10; return { q: `${N(a)} − ${N(b)}`, a: N(r2(a - b)) }; },
      ({ ri }) => { const a = ri(101, 999) / 100, b = ri(101, 999) / 100; return { q: `${N(a)} + ${N(b)}`, a: N(r2(a + b)) }; },
    ],
    m: [
      ({ ri }) => { const a = ri(101, 999) / 100, b = ri(11, 99) / 10; return { q: `${N(a)} + ${N(b)}`, w: [`${pad(a, 2)} + ${pad(b, 2)}`, `= ${N(r2(a + b))}`] }; },
      ({ ri }) => { const a = ri(3, 20), b = ri(101, 299) / 100; return b >= a ? null : { q: `${a} − ${N(b)}`, w: [`${a}.00 − ${pad(b, 2)}`, `= ${N(r2(a - b))}`] }; },
      ({ ri, pick }) => { const a = ri(150, 1899) / 100, n = pick([20, 50]); return a >= n ? null : { q: `A $${n} note pays for a ${$(a)} meal. Find the change.`, w: [`${n}.00 − ${pad(a, 2)}`, `= ${$(r2(n - a))}`] }; },
    ],
    c: [
      ({ ri }) => { const a = ri(11, 99) / 10, b = ri(101, 999) / 100, c = ri(1, 9); return { q: `${N(a)} + ${N(b)} + ${c}`, w: [`${pad(a, 2)} + ${pad(b, 2)} + ${c}.00`, `= ${N(r2(a + b + c))}`] }; },
      ({ ri, pick }) => { const a = ri(201, 499) / 100, b = ri(201, 499) / 100, who = pick(NAMES); return a + b <= 5 ? null : { q: `${who} runs ${N(a)} km on Monday and ${N(b)} km on Tuesday. How much further is that than 5 km?`, w: [`${N(a)} + ${N(b)} = ${N(r2(a + b))}`, `${N(r2(a + b))} − 5 = ${N(r2(a + b - 5))} km`] }; },
      ({ ri }) => { const a = ri(101, 999) / 100, x = ri(101, 999) / 100; return { q: `Find the missing number: ${N(a)} + ☐ = ${N(r2(a + x))}`, w: [`☐ = ${N(r2(a + x))} − ${N(a)}`, `☐ = ${N(x)}`] }; },
      ({ ri, pick }) => { const a = ri(11, 99) / 10, b = ri(101, 999) / 100, who = pick(NAMES); return { q: `${who} adds ${N(a)} + ${N(b)} by lining up the last digits and gets ${N(r2(a / 10 + b))}. What went wrong? What is the right answer?`, w: ['line up the decimal points', `${pad(a, 2)} + ${pad(b, 2)} = ${N(r2(a + b))}`], key: `says ${ri(1, 2)}` }; },
    ],
  },

  '7.04': {
    idea: 'To multiply by 10, 100 or 1000, move every digit 1, 2 or 3 places to the left (the decimal point seems to move right). To divide, move the digits to the right.',
    ex: [['3.47 × 100', ['digits 2 places left', '= 347']], ['52.6 ÷ 1000', ['digits 3 places right', '= 0.0526']], ['Change 4.5 kg to grams.', ['1 kg = 1000 g', '4.5 × 1000 = 4 500 g']]],
    look: ['7.03', '3.02'],
    e: [
      ({ ri, pick }) => { const x = ri(11, 999) / 100, p = pick([10, 100, 1000]); return { q: `${N(x)} × ${N(p)}`, a: N(r2(x * p)) }; },
      ({ ri, pick }) => { const x = ri(11, 999) / 10, p = pick([10, 100, 1000]); return { q: `${N(x)} ÷ ${N(p)}`, a: N(r2(x / p)) }; },
      ({ ri, pick }) => { const x = ri(2, 99), p = pick([10, 100]); return { q: `${x} ÷ ${p}`, a: N(r2(x / p)) }; },
    ],
    m: [
      ({ ri, pick }) => { const [a, b, k] = pick([['m', 'cm', 100], ['kg', 'g', 1000], ['L', 'mL', 1000], ['km', 'm', 1000], ['cm', 'mm', 10]]); const x = ri(11, 999) / 100; return { q: `Change ${N(x)} ${a} to ${b}.`, w: [`1 ${a} = ${N(k)} ${b}`, `${N(x)} × ${N(k)} = ${N(r2(x * k))} ${b}`] }; },
      ({ ri, pick }) => { const [a, b, k] = pick([['cm', 'm', 100], ['g', 'kg', 1000], ['mL', 'L', 1000], ['m', 'km', 1000], ['mm', 'cm', 10]]); const x = ri(5, 999); return { q: `Change ${x} ${a} to ${b}.`, w: [`${N(k)} ${a} = 1 ${b}`, `${x} ÷ ${N(k)} = ${N(r2(x / k))} ${b}`] }; },
      ({ ri, pick }) => { const x = ri(11, 999) / 100, p = pick([10, 100, 1000]); return { q: `Find the missing number: ${N(x)} × ☐ = ${N(r2(x * p))}`, a: N(p) }; },
    ],
    c: [
      ({ ri, pick }) => { const x = ri(11, 99) / 1000, p = pick([100, 1000]); return { q: `Find the missing number: ☐ × ${N(p)} = ${N(r2(x * p))}`, w: [`☐ = ${N(r2(x * p))} ÷ ${N(p)}`, `☐ = ${N(x)}`] }; },
      ({ ri }) => { const x = ri(11, 999) / 10; return { q: `${N(x)} × 100 ÷ 1000`, w: [`= ${N(r2(x * 100))} ÷ 1000`, `= ${N(r2(x / 10))}`] }; },
      ({ ri }) => { const c = ri(105, 995) / 100; return { q: `One pen costs ${$(c)}. How much do 1000 pens cost? How much do 10 pens cost?`, w: [`1000 pens: $${N(r2(c * 1000))}`, `10 pens: ${$(r2(c * 10))}`] }; },
    ],
  },

  '7.05': {
    idea: 'Use a product you know. If 23 × 4 = 92, then 2.3 × 4 = 9.2 and 0.23 × 4 = 0.92. Count the decimal places in the question: the answer has the same number.',
    ex: [['Given 36 × 7 = 252, find 3.6 × 7.', ['1 decimal place', '= 25.2']], ['Given 36 × 7 = 252, find 0.36 × 0.7.', ['2 + 1 = 3 decimal places', '= 0.252']], ['Given 252 ÷ 7 = 36, find 25.2 ÷ 7.', ['25.2 is 252 ÷ 10', '= 3.6']]],
    look: ['7.04'],
    e: [
      ({ ri }) => { const a = ri(12, 49), b = ri(3, 9), p = a * b; return { q: `Given ${a} × ${b} = ${p}, find ${N(a / 10)} × ${b}.`, a: N(r2(p / 10)) }; },
      ({ ri }) => { const a = ri(12, 49), b = ri(3, 9), p = a * b; return { q: `Given ${a} × ${b} = ${p}, find ${a} × ${N(b / 10)}.`, a: N(r2(p / 10)) }; },
      ({ ri }) => { const a = ri(12, 49), b = ri(3, 9), p = a * b; return { q: `Given ${a} × ${b} = ${p}, find ${N(a / 100)} × ${b}.`, a: N(r2(p / 100)) }; },
    ],
    m: [
      ({ ri }) => { const a = ri(12, 49), b = ri(3, 9), p = a * b; return { q: `Given ${a} × ${b} = ${p}, find ${N(a / 10)} × ${N(b / 10)}.`, w: ['1 + 1 = 2 decimal places', `= ${N(r2(p / 100))}`] }; },
      ({ ri }) => { const a = ri(12, 49), b = ri(3, 9), p = a * b; return { q: `Given ${p} ÷ ${b} = ${a}, find ${N(p / 10)} ÷ ${b}.`, w: [`${N(p / 10)} = ${p} ÷ 10`, `= ${N(a / 10)}`] }; },
      ({ ri }) => { const a = ri(112, 489), b = ri(3, 9), p = a * b; return { q: `Given ${a} × ${b} = ${N(p)}, find ${N(a / 100)} × ${b}.`, w: ['2 decimal places', `= ${N(r2(p / 100))}`] }; },
    ],
    c: [
      ({ ri }) => { const a = ri(12, 49), b = ri(13, 29), p = a * b; return { q: `Given ${a} × ${b} = ${N(p)}, find ${N(a / 10)} × ${N(b / 100)}.`, w: ['1 + 2 = 3 decimal places', `= ${N(r2(p / 1000))}`] }; },
      ({ ri }) => { const a = ri(12, 49), b = ri(13, 29), p = a * b; return { q: `Given ${a} × ${b} = ${N(p)}, find ${a * 10} × ${N(b / 10)}.`, w: [`×10 and ÷10 cancel`, `= ${N(p)}`] }; },
      ({ ri }) => { const a = ri(12, 49), b = ri(3, 9), p = a * b; return { q: `Given ${a} × ${b} = ${p}, find ${N(p / 100)} ÷ ${N(b / 10)}.`, w: [`= ${N(p / 10)} ÷ ${b}`, `= ${N(a / 10)}`] }; },
    ],
  },

  '7.06': {
    idea: 'Multiply as if there were no decimal points. Then count the decimal places in both numbers: the answer has that many. Estimate to check.',
    ex: [['0.3 × 0.4', ['3 × 4 = 12, 2 decimal places', '= 0.12']], ['2.5 × 1.2', ['25 × 12 = 300, 2 decimal places', '= 3.00 = 3']], ['4.6 × 0.3', ['46 × 3 = 138, 2 decimal places', '= 1.38']]],
    look: ['7.05'],
    e: [
      ({ ri }) => { const a = ri(1, 9), b = ri(2, 9); return { q: `0.${a} × ${b}`, a: N(r2((a * b) / 10)) }; },
      ({ ri }) => { const a = ri(1, 9), b = ri(1, 9); return { q: `0.${a} × 0.${b}`, a: N(r2((a * b) / 100)) }; },
      ({ ri }) => { const a = ri(11, 99) / 10, b = ri(2, 9); return { q: `${N(a)} × ${b}`, a: N(r2(a * b)) }; },
    ],
    m: [
      ({ ri }) => { const a = ri(11, 99), b = ri(2, 9); return { q: `${N(a / 10)} × 0.${b}`, w: [`${a} × ${b} = ${a * b}, 2 decimal places`, `= ${N(r2((a * b) / 100))}`] }; },
      ({ ri }) => { const a = ri(101, 999), b = ri(2, 9); return { q: `${N(a / 100)} × ${b}`, w: [`${a} × ${b} = ${a * b}, 2 decimal places`, `= ${N(r2((a * b) / 100))}`] }; },
      ({ ri }) => { const L = ri(11, 49) / 10, W = ri(11, 39) / 10; return { q: `A rectangle is ${N(L)} m by ${N(W)} m. Find its area.`, w: [`${Math.round(L * 10)} × ${Math.round(W * 10)} = ${Math.round(L * 10) * Math.round(W * 10)}`, `= ${N(r2(L * W))} m²`] }; },
      ({ ri }) => { const a = ri(1, 9); return { q: `(0.${a})<sup>2</sup>`, w: [`0.${a} × 0.${a}`, `= ${N(r2((a * a) / 100))}`] }; },
    ],
    c: [
      ({ ri }) => { const kg = ri(11, 49) / 10, p = ri(150, 990) / 100; return { q: `Apples cost ${$(p)} per kg. Find the cost of ${N(kg)} kg, to the nearest cent.`, w: [`${N(kg)} × ${pad(p, 2)} = ${N(r2(kg * p, 3))}`, `≈ ${$(roundTo(kg * p, 2))}`] }; },
      ({ ri }) => { const a = ri(11, 99), b = ri(11, 99); return a % 10 === 0 || b % 10 === 0 ? null : { q: `${N(a / 10)} × ${N(b / 100)}`, w: [`${a} × ${b} = ${a * b}, 3 decimal places`, `= ${N(r2((a * b) / 1000))}`] }; },
      ({ pick }) => { const [a, b] = pick([[0.4, 0.5], [0.8, 0.9], [0.6, 0.3], [2.5, 0.4]]); return { q: `Is ${N(a)} × ${N(b)} larger or smaller than ${N(a)}? Explain.`, a: `Smaller: multiplying by ${N(b)}, which is less than 1, makes it smaller (${N(r2(a * b))}).`, n: 2, key: `${a}${b}` }; },
    ],
  },

  '7.07': {
    idea: 'Divide as usual and keep the decimal point in the same place in the answer. Write extra zeros after the decimal point if you need to keep dividing.',
    ex: [['8.4 ÷ 4', ['8 ÷ 4 = 2, 4 tenths ÷ 4 = 1 tenth', '= 2.1']], ['7.5 ÷ 6', ['7.50 ÷ 6', '= 1.25']], ['$14.70 is shared by 3 people. How much each?', ['14.70 ÷ 3', '= $4.90']]],
    look: ['7.06', '3.03'],
    e: [
      ({ ri }) => { const b = ri(2, 9), q = ri(11, 99) / 10; return q % 1 === 0 ? null : { q: `${N(r2(b * q))} ÷ ${b}`, a: N(q) }; },
      ({ ri }) => { const b = ri(2, 9), q = ri(101, 999) / 100; return { q: `${N(r2(b * q))} ÷ ${b}`, a: N(q) }; },
      ({ ri }) => { const b = ri(2, 5), q = ri(1, 9) / 10; return { q: `${N(r2(b * q))} ÷ ${b}`, a: N(q) }; },
    ],
    m: [
      ({ ri, pick }) => { const b = pick([4, 5, 8]), n = ri(11, 99) / 10; const q = n / b; return dp(r2(q)) > 3 ? null : { q: `${N(n)} ÷ ${b}`, w: [`${pad(n, 3)} ÷ ${b}`, `= ${N(r2(q))}`] }; },
      ({ ri, pick }) => { const n = ri(2, 6), each = ri(150, 1500) / 100, who = pick(NAMES); const t = r2(each * n); return { q: `${who} and friends share a ${$(t)} bill equally between ${n} people. How much each?`, w: [`${pad(t, 2)} ÷ ${n}`, `= ${$(each)}`] }; },
      ({ ri }) => { const b = ri(3, 9), q = ri(1001, 4999) / 1000; return { q: `${N(r2(b * q))} ÷ ${b}`, w: ['divide each place in turn', `= ${N(q)}`] }; },
    ],
    c: [
      ({ ri }) => { const n = ri(4, 6), xs = Array.from({ length: n }, () => ri(11, 99) / 10); const t = r2(xs.reduce((s, x) => s + x, 0)); const m = r2(t / n); return dp(m) > 2 ? null : { q: `Find the mean of ${xs.map((x) => N(x)).join(', ')}.`, w: [`total: ${N(t)}`, `${N(t)} ÷ ${n} = ${N(m)}`] }; },
      ({ ri, pick }) => { const b = pick([4, 5, 8]), L = ri(11, 49) / 10; const q = r2(L / b); return dp(q) > 3 ? null : { q: `A ${N(L)} m plank is cut into ${b} equal pieces. How long is each piece?`, w: [`${N(L)} ÷ ${b}`, `= ${N(q)} m`] }; },
      ({ ri }) => { const b = ri(3, 9), q = ri(11, 99) / 100, x = r2(b * q); return { q: `Find the missing number: ☐ × ${b} = ${N(x)}`, w: [`☐ = ${N(x)} ÷ ${b}`, `☐ = ${N(q)}`] }; },
    ],
  },

  '7.08': {
    idea: 'Make the divisor a whole number: multiply both numbers by 10 (or 100) first. 4.8 ÷ 0.6 = 48 ÷ 6 = 8.',
    ex: [['4.8 ÷ 0.6', ['× 10: 48 ÷ 6', '= 8']], ['1.25 ÷ 0.05', ['× 100: 125 ÷ 5', '= 25']], ['How many 0.3 L cups can be filled from 2.4 L?', ['2.4 ÷ 0.3 = 24 ÷ 3', '= 8 cups']]],
    look: ['7.07'],
    e: [
      ({ ri, pick }) => { const a = ri(2, 9), d = pick([1, 2, 5]); return { q: `${a} ÷ 0.${d}`, a: N((a * 10) / d) }; },
      ({ ri }) => { const d = ri(2, 9), q = ri(2, 9); return { q: `${N(r2((d * q) / 10))} ÷ 0.${d}`, a: N(q) }; },
      ({ ri }) => { const a = ri(11, 99) / 10; return { q: `${N(a)} ÷ 0.1`, a: N(r2(a * 10)) }; },
    ],
    m: [
      ({ ri }) => { const d = ri(2, 9), q = ri(11, 40); return { q: `${N(r2((d * q) / 10))} ÷ 0.${d}`, w: [`× 10: ${d * q} ÷ ${d}`, `= ${q}`] }; },
      ({ ri }) => { const d = ri(2, 9), q = ri(2, 30); return { q: `${N(r2((d * q) / 100))} ÷ 0.0${d}`, w: [`× 100: ${d * q} ÷ ${d}`, `= ${q}`] }; },
      ({ ri }) => { const c = ri(2, 5) / 10, n = ri(4, 12); return { q: `How many ${N(c)} L cups can be filled from ${N(r2(c * n))} L?`, w: [`${N(r2(c * n))} ÷ ${N(c)}`, `= ${n} cups`] }; },
    ],
    c: [
      ({ ri }) => { const d = ri(11, 25) / 10, q = ri(3, 12); return { q: `${N(r2(d * q))} ÷ ${N(d)}`, w: [`× 10: ${N(r2(d * q * 10))} ÷ ${N(d * 10)}`, `= ${q}`] }; },
      ({ pick }) => { const [a, b] = pick([[5, 0.5], [8, 0.2], [3, 0.1], [6, 0.25]]); return { q: `Is ${a} ÷ ${N(b)} larger or smaller than ${a}? Explain.`, a: `Larger: dividing by a number less than 1 gives more (${N(a / b)}).`, n: 2, key: `${a}/${b}` }; },
      ({ ri }) => { const p = ri(5, 25) / 100, n = ri(4, 20); return { q: `Pencils cost ${$(p)} each. How many can you buy with ${$(r2(p * n))}?`, w: [`${pad(r2(p * n), 2)} ÷ ${pad(p, 2)} = ${Math.round(p * n * 100)} ÷ ${Math.round(p * 100)}`, `= ${n} pencils`] }; },
    ],
  },

  '7.09': {
    idea: 'To change a fraction to a decimal, divide the numerator by the denominator. Some decimals go on forever with a repeating pattern: ⅓ = 0.333…, written with a dot over the 3.',
    ex: [[`Write ${F(3, 8)} as a decimal.`, ['3.000 ÷ 8', '= 0.375']], [`Write ${F(2, 3)} as a decimal.`, ['2.000 ÷ 3 = 0.666…', `= 0.${rec(6)}`]], [`Write ${F(5, 11)} as a decimal.`, ['5 ÷ 11 = 0.4545…', `= 0.${rec(4)}${rec(5)}`]]],
    look: ['7.02', '7.07'],
    e: [
      ({ pick, ri }) => { const d = pick([2, 4, 5, 8, 10, 20]), n = ri(1, d - 1); return gcd(n, d) > 1 ? null : { q: `Write ${F(n, d)} as a decimal.`, a: N(n / d) }; },
      ({ pick }) => { const [n, d, t] = pick(RECUR.slice(0, 7)); return { q: `Write ${F(n, d)} as a decimal. Use a dot for the repeating digit.`, a: t, key: `${n}/${d}` }; },
      ({ pick }) => { const [n, d, t] = pick([[1, 3, `0.${rec(3)}`], [2, 3, `0.${rec(6)}`], [1, 9, `0.${rec(1)}`]]); return { q: `Write ${t} as a fraction.`, a: F(n, d), key: `back ${n}/${d}` }; },
    ],
    m: [
      ({ pick, ri }) => { const d = pick([8, 16, 20, 25, 40]), n = ri(1, d - 1); return gcd(n, d) > 1 ? null : { q: `Write ${F(n, d)} as a decimal.`, w: [`${n} ÷ ${d}`, `= ${N(n / d)}`] }; },
      ({ pick }) => { const [n, d, t] = pick(RECUR); return { q: `Write ${F(n, d)} as a recurring decimal.`, w: [`${n} ÷ ${d} = ${(n / d).toFixed(5)}…`, `= ${t}`], key: `r ${n}/${d}` }; },
      ({ ri }) => { const w = ri(1, 5), [n, d] = [[1, 4], [3, 4], [1, 8], [5, 8], [2, 5]][ri(0, 4)]; return { q: `Write ${F(n, d, w)} as a decimal.`, w: [`${F(n, d)} = ${N(n / d)}`, `= ${N(w + n / d)}`] }; },
    ],
    c: [
      ({ pick }) => { const [a, long, b, big] = pick([[`0.${rec(6)}`, '0.666…', '0.67', '0.67'], [`0.${rec(3)}`, '0.333…', '0.33', `0.${rec(3)}`], [`0.${rec(1)}`, '0.111…', '0.11', `0.${rec(1)}`]]); return { q: `Which is larger: ${a} or ${b}?`, w: [`${a} = ${long}`, `larger: ${big}`], key: b }; },
      ({ pick, shuffle }) => { const xs = shuffle([[F(1, 3), 1 / 3], ['0.3', 0.3], ['0.33', 0.33], [F(3, 8), 0.375]]); return { q: `Order from smallest to largest: ${xs.map((x) => x[0]).join(', ')}`, w: [xs.map((x) => (x[1] === 1 / 3 ? '0.333…' : N(x[1]))).join(', '), [...xs].sort((p, q) => p[1] - q[1]).map((x) => x[0]).join(', ')], key: 'order' }; },
      ({ pick }) => { const [n, d] = pick([[1, 7], [2, 7], [3, 7]]); return { q: `Use a calculator to write ${F(n, d)} as a decimal. How many digits repeat?`, w: [`${n} ÷ ${d} = ${(n / d).toFixed(9)}…`, '6 digits repeat'], key: `7ths ${n}` }; },
    ],
  },

  '7.10': {
    idea: 'To round to 2 decimal places, look at the third decimal place: 5 or more, round up; 4 or less, leave it. Then drop the digits after the second place.',
    ex: [['Round 3.476 to 2 decimal places.', ['third place is 6: round up', '≈ 3.48']], ['Round 12.849 to 1 decimal place.', ['second place is 4: leave it', '≈ 12.8']], [`Round ${F(5, 7)} to 3 decimal places.`, ['5 ÷ 7 = 0.71428…', '≈ 0.714']]],
    look: ['7.09', '3.01'],
    e: [
      ({ ri }) => { const x = ri(1001, 9999) / 100; return x * 10 % 1 === 0 ? null : { q: `Round ${N(x)} to 1 decimal place.`, a: roundTo(x, 1) }; },
      ({ ri }) => { const x = ri(101, 999) / 10; return x % 1 === 0 ? null : { q: `Round ${N(x)} to the nearest whole number.`, a: roundTo(x, 0) }; },
      ({ ri }) => { const x = ri(1001, 9999) / 1000; return x * 100 % 1 === 0 ? null : { q: `Round ${N(x)} to 2 decimal places.`, a: roundTo(x, 2) }; },
    ],
    m: [
      ({ ri }) => { const x = ri(10001, 99999) / 10000; const k = ri(1, 3); return { q: `Round ${N(x)} to ${k} decimal place${k > 1 ? 's' : ''}.`, w: [`look at place ${k + 1}: ${String(x.toFixed(4))[k + 2]}`, `≈ ${roundTo(x, k)}`] }; },
      ({ ri }) => { const x = ri(1001, 9999) / 1000; return { q: `Round $${x.toFixed(3)} to the nearest cent.`, a: `$${roundTo(x, 2)}` }; },
      ({ pick }) => { const [n, d] = pick([[2, 3], [1, 6], [5, 6], [4, 9], [5, 11], [1, 7]]); return { q: `Write ${F(n, d)} as a decimal rounded to 2 decimal places.`, w: [`${n} ÷ ${d} = ${(n / d).toFixed(4)}…`, `≈ ${roundTo(n / d, 2)}`], key: `${n}/${d}` }; },
    ],
    c: [
      ({ ri }) => { const t = ri(20, 99), n = pick3(ri); return (t * 100) % n === 0 ? null : { q: `$${t} is shared equally by ${n} people. How much each, to the nearest cent?`, w: [`${t} ÷ ${n} = ${(t / n).toFixed(4)}…`, `≈ $${roundTo(t / n, 2)}`] }; },
      ({ ri }) => { const x = ri(11, 98) / 10; return { q: `What is the smallest number with 2 decimal places that rounds to ${x.toFixed(1)} (to 1 decimal place)?`, a: (x - 0.05).toFixed(2) }; },
      ({ ri }) => { const x = ri(10001, 99999) / 1000; return { q: `Round ${N(x)} to the nearest whole number, to 1 decimal place and to 2 decimal places.`, w: [`${roundTo(x, 0)}`, `${roundTo(x, 1)}, ${roundTo(x, 2)}`] }; },
    ],
  },

  '7.11': {
    idea: 'Money has two decimal places: write $4.50, not $4.5. Add, subtract, multiply and divide money like any decimal. For cash, round to the nearest 5 cents.',
    ex: [['Find the total: $4.85 + $12.40 + $0.95', ['4.85 + 12.40 + 0.95', '= $18.20']], ['Find the change from $50 for $37.65.', ['50.00 − 37.65', '= $12.35']], ['Find the cost of 3.5 kg of apples at $4.20 per kg.', ['3.5 × 4.20', '= $14.70']]],
    look: ['7.03', '7.10'],
    e: [
      ({ ri }) => { const a = ri(105, 1995) / 100, b = ri(105, 995) / 100; return { q: `Find the total: ${$(a)} + ${$(b)}`, a: $(r2(a + b)) }; },
      ({ ri, pick }) => { const n = pick([10, 20]), a = ri(105, n * 100 - 5) / 100; return { q: `Find the change from $${n} for ${$(a)}.`, a: $(r2(n - a)) }; },
      ({ ri }) => { const c = ri(101, 999) / 100; const r = Math.round(c * 20) / 20; return { q: `Round ${$(c)} to the nearest 5 cents.`, a: $(r) }; },
    ],
    m: [
      ({ ri, pick }) => { const n = ri(2, 9), p = ri(105, 995) / 100, t = pick(['pies', 'drinks', 'tickets', 'notebooks']); return { q: `Find the cost of ${n} ${t} at ${$(p)} each.`, w: [`${n} × ${pad(p, 2)}`, `= ${$(r2(n * p))}`] }; },
      ({ ri }) => { const a = ri(105, 995) / 100, b = ri(105, 995) / 100, c = ri(105, 995) / 100; const t = r2(a + b + c); return t >= 50 ? null : { q: `${$(a)}, ${$(b)} and ${$(c)} are paid with a $50 note. Find the change.`, w: [`total: ${$(t)}`, `change: ${$(r2(50 - t))}`] }; },
      ({ ri }) => { const kg = ri(11, 49) / 10, p = ri(2, 9) * 0.5 + 0.2; return { q: `Find the cost of ${N(kg)} kg of grapes at ${$(p)} per kg.`, w: [`${N(kg)} × ${pad(p, 2)} = ${N(r2(kg * p, 3))}`, `≈ ${$(roundTo(kg * p, 2))}`] }; },
    ],
    c: [
      ({ ri }) => { const t = r2(ri(2001, 9999) / 100), n = ri(3, 6); const each = t / n; return { q: `A bill of ${$(t)} is split between ${n} people. How much does each pay, to the nearest cent? Is the total then exact?`, w: [`${pad(t, 2)} ÷ ${n} = ${each.toFixed(4)}…`, `≈ $${roundTo(each, 2)} each; ${n} × ${roundTo(each, 2)} = $${(n * +roundTo(each, 2)).toFixed(2)}`] }; },
      ({ ri }) => { const a = ri(105, 995) / 100, b = ri(105, 995) / 100; const t = r2(a + b), cash = Math.round(t * 20) / 20; return { q: `Items cost ${$(a)} and ${$(b)}. Paying cash, the total is rounded to the nearest 5 cents. What do you pay?`, w: [`total: ${$(t)}`, `cash: ${$(cash)}`] }; },
      ({ ri }) => { const w = ri(15, 30), h = ri(4, 9), d = ri(3, 5); const hrs = r2(h + 0.5); return { q: `A worker earns $${w}.50 an hour. How much is earned for ${N(hrs)} hours a day, ${d} days a week?`, w: [`${N(hrs)} × ${d} = ${N(r2(hrs * d))} hours`, `${N(r2(hrs * d))} × ${w}.50 = ${$(r2(hrs * d * (w + 0.5)))}`] }; },
    ],
  },
};

function pick3(ri) { return [3, 6, 7, 9][ri(0, 3)]; }
