// Chapter 1 Integers: mixed-practice questions (lib/mixed.js). Every question stands on its own.
//   idea  the key idea · ex  the teacher's examples [question, working] · e, m, c  kinds of question by level
const D = require('../../lib/diagrams');
const { N, B } = require('../../lib/drill');
const { F } = require('../../lib/calc');

const dot = (min, max, v, every = max - min > 14 ? 2 : 1) => D.jumps({ min, max, marks: { [v]: true }, every });
const start = (min, max, s) => D.jumps({ min, max, start: s, done: false, every: max - min > 14 ? 2 : 1 });
const NAMES = ['Ali', 'Mia', 'Zac', 'Lena', 'Kai', 'Ruby', 'Tom', 'Priya', 'Jack', 'Aisha', 'Noah', 'Chloe', 'Leo', 'Sienna', 'Mason', 'Ivy'];
const sgn = (v) => (v < 0 ? '−' : '+');
// Contexts for integers: [words, sign].
const CTX = [
  [(n) => `${n} m below sea level`, -1], [(n) => `a gain of $${n}`, 1], [(n) => `a loss of ${n} kg`, -1],
  [(n) => `${n} floors below the ground`, -1], [(n) => `a rise of ${n}°C`, 1], [(n) => `${n}°C below zero`, -1],
  [(n) => `spending $${n}`, -1], [(n) => `${n} m above sea level`, 1], [(n) => `a deposit of $${n}`, 1],
  [(n) => `a drop of ${n} cm`, -1], [(n) => `${n} steps backwards`, -1], [(n) => `winning ${n} points`, 1],
];
const two = (K, lo, hi) => { let a, b; do { a = K.nz(lo, hi); b = K.nz(lo, hi); } while (a === b); return [a, b]; };

module.exports = {
  '1.01': {
    idea: 'An integer is a whole number: positive, negative or zero. The opposite of a number is the same distance from 0, on the other side of 0.',
    ex: [['Write an integer for 5 m below sea level.', ['below 0: negative', '= −5']], ['What is the opposite of −6?', ['−6 is 6 steps left of 0', 'opposite: 6']], ['−(−7)', ['= the opposite of −7', '= 7']]],
    e: [
      (K) => { const [f, s] = K.pick(CTX), n = K.ri(2, 40); return { q: `Write an integer for ${f(n)}.`, a: N(s * n) }; },
      (K) => { const v = K.nz(-30, 30); return { q: `What is the opposite of ${N(v)}?`, a: N(-v) }; },
      (K) => { const v = K.nz(-7, 7); return { q: 'Which integer is at the dot?', fig: dot(-8, 8, v), a: N(v) }; },
    ],
    m: [
      (K) => { const v = K.nz(-25, 25); return { q: `−(${v > 0 ? '+' : ''}${N(v)})`, w: [`= the opposite of ${N(v)}`, `= ${N(-v)}`] }; },
      (K) => { const a = K.ri(2, 15), b = K.ri(2, 15); return a === b ? null : { q: `Which is further from 0: ${N(-a)} or ${N(b)}?`, w: [`distances: ${a} and ${b}`, `further: ${a > b ? N(-a) : N(b)}`] }; },
      (K) => { const n = K.ri(3, 40); return { q: `Which two integers are ${n} steps from 0?`, a: `${n} and ${N(-n)}` }; },
      (K) => { const n = K.ri(3, 20); const [w1, w2] = K.pick([['up', 'down'], ['a profit', 'a loss'], ['forwards', 'backwards'], ['above zero', 'below zero']]); return { q: `The opposite of "${n} ${w1}" is "${n} ${w2}". Write both as integers.`, a: `${n} and ${N(-n)}` }; },
    ],
    c: [
      (K) => { const n = K.ri(2, 30); return { q: `Two opposites are ${2 * n} steps apart. What are they?`, w: [`half of ${2 * n} is ${n}`, `${n} and ${N(-n)}`] }; },
      (K) => { const n = K.ri(2, 15); return { q: `−(−(−${n}))`, w: [`−(−${n}) = ${n}`, `the opposite of ${n}`, `= ${N(-n)}`] }; },
      (K, i) => [
        { q: 'Mia says, "The opposite of a number is always negative." Is Mia right? Explain.', a: 'No. The opposite of −3 is 3, which is positive.', n: 2 },
        { q: 'What is the opposite of 0? Explain.', a: '0. It is 0 steps from 0, so it is its own opposite.', n: 2 },
        { q: 'Ben says −(−4) = −4. Is Ben right? Explain.', a: 'No. −(−4) means the opposite of −4, which is 4.', n: 2 },
        { q: 'Which integers from −6 to 6 are more than 4 steps from 0?', a: '−6, −5, 5, 6' },
        { q: 'A number is 3 steps from 0 and less than 0. What is its opposite?', a: '3 (the number is −3)' },
      ][i % 5],
    ],
  },

  '1.02': {
    idea: 'Numbers get larger to the right. To find a distance, count the gaps. If the trip passes 0, count to 0, then count on.',
    ex: [['How far is it from −3 to 5?', ['3 to 0, then 5 from 0', '3 + 5 = 8']], ['Start at 4. Move 9 left. Where do you land?', ['4 left to 0, then 5 more', '= −5']], ['Which integer is halfway between −8 and 2?', ['10 apart, half is 5', '5 right of −8: −3']]],
    e: [
      (K) => { const v = K.nz(-9, 9); return { q: 'Which integer is at the dot?', fig: dot(-10, 10, v, 2), a: N(v) }; },
      (K) => { const s = K.ri(-6, 6), d = K.ri(2, 9), dir = K.pick(['left', 'right']); return { q: `Start at ${N(s)}. Move ${d} ${dir}. Where do you land?`, a: N(s + (dir === 'left' ? -d : d)) }; },
      (K) => { const a = K.ri(-9, -1), b = K.ri(1, 9); return { q: `How far is it from ${N(a)} to ${N(b)}?`, a: N(b - a) }; },
      (K) => { const a = K.ri(-9, -3), b = K.ri(a + 2, a + 5); return b > 0 ? null : { q: `Write the integers between ${N(a)} and ${N(b)}.`, a: Array.from({ length: b - a - 1 }, (_, k) => N(a + 1 + k)).join(', ') }; },
    ],
    m: [
      (K) => { const a = K.ri(-40, -6), b = K.ri(5, 40); return { q: `How far is it from ${N(a)} to ${N(b)}?`, w: [`${-a} to 0, then ${b} from 0`, `${-a} + ${b} = ${b - a}`] }; },
      (K) => { const a = K.ri(-15, -2), h = K.ri(2, 8), b = a + 2 * h; return { q: `Which integer is halfway between ${N(a)} and ${N(b)}?`, w: [`${2 * h} apart, half is ${h}`, `${h} right of ${N(a)}: ${N(a + h)}`] }; },
      (K) => { const s = K.pick([2, 5, 10]), a = -K.ri(2, 5) * s; return { q: `A number line counts by ${s}s: ${N(a)}, ${N(a + s)}, ${N(a + 2 * s)}, … What are the next two numbers?`, a: `${N(a + 3 * s)}, ${N(a + 4 * s)}` }; },
      (K) => { const a = K.ri(-5, -1), b = K.ri(2, 12); return { q: `A lift goes from level ${N(a)} to level ${b}. How many floors does it go up?`, w: [`${-a} up to 0, then ${b} more`, `= ${b - a} floors`] }; },
      (K) => { const a = K.ri(-12, 5), d = K.ri(6, 14); return { q: `Point A is at ${N(a)}. Point B is ${d} to the left of A. Where is B?`, a: N(a - d) }; },
    ],
    c: [
      (K) => { const m = K.ri(-9, -1), h = K.ri(3, 9); return { q: `Two integers are ${2 * h} apart. Halfway between them is ${N(m)}. What are they?`, w: [`each is ${h} from ${N(m)}`, `${N(m - h)} and ${N(m + h)}`] }; },
      (K) => { const s = K.ri(-5, 5), a = K.ri(3, 9), b = K.ri(8, 16); return { q: `Start at ${N(s)}. Move ${a} right, then ${b} left. Where do you land?`, w: [`${N(s)} → ${N(s + a)}`, `${N(s + a)} → ${N(s + a - b)}`] }; },
      (K) => { const a = K.ri(-12, -3), b = K.ri(1, 9); return { q: `How many integers are between ${N(a)} and ${b}? Do not count ${N(a)} and ${b}.`, w: [`${N(a + 1)} to ${b - 1}`, `${-a - 1} + 1 + ${b - 1} = ${b - a - 1}`] }; },
      (K) => { const a = K.ri(-20, -8), b = K.ri(-6, 4); return { q: `A diver is at ${N(a)} m. A fish is at ${N(b)} m. How far above the diver is the fish?`, w: [b <= 0 ? `count from ${N(a)} up to ${N(b)}` : `${-a} up to 0, then ${b}`, `= ${b - a} m`] }; },
    ],
  },

  '1.03': {
    idea: 'The number further right on the number line is larger. So −2 > −7, because −2 is further right. Ascending: smallest to largest.',
    ex: [['Write &lt; or &gt;: −9 ☐ −4', ['−9 is left of −4', '−9 &lt; −4']], ['Order from smallest to largest: 3, −5, 0, −1', ['smallest: −5', '−5, −1, 0, 3']], ['Which is colder: −12°C or −8°C?', ['−12 is lower than −8', 'colder: −12°C']]],
    look: ['1.02'],
    e: [
      (K) => { const [a, b] = two(K, -12, 12); return { q: `Write &lt; or &gt;: ${N(a)} ☐ ${N(b)}`, a: `${N(a)} ${a < b ? '&lt;' : '&gt;'} ${N(b)}` }; },
      (K) => { const [a, b] = two(K, -20, 5); return { q: `Which is larger: ${N(a)} or ${N(b)}?`, a: N(Math.max(a, b)) }; },
      (K) => { const [a, b] = two(K, -20, 3); return { q: `Which is smaller: ${N(a)} or ${N(b)}?`, a: N(Math.min(a, b)) }; },
      (K) => { const a = K.ri(2, 9), b = K.ri(10, 19); return { q: `Which is colder: ${N(-a)}°C or ${N(-b)}°C?`, a: `${N(-b)}°C` }; },
    ],
    m: [
      (K) => { const xs = K.shuffle([K.ri(-15, -8), K.ri(-7, -2), 0, K.ri(1, 6), K.ri(7, 12)]); return { q: `Order from smallest to largest: ${xs.map(N).join(', ')}`, w: [`smallest: ${N(Math.min(...xs))}`, [...xs].sort((a, b) => a - b).map(N).join(', ')] }; },
      (K) => { const xs = K.shuffle([K.ri(-30, -20), K.ri(-19, -10), K.ri(-9, -1), K.ri(1, 15)]); return { q: `Order from largest to smallest: ${xs.map(N).join(', ')}`, w: [`largest: ${N(Math.max(...xs))}`, [...xs].sort((a, b) => b - a).map(N).join(', ')] }; },
      (K) => { const [a, b] = two(K, -50, -1); return { q: `Write &lt; or &gt;: ${N(a)} ☐ ${N(b)}`, a: `${N(a)} ${a < b ? '&lt;' : '&gt;'} ${N(b)}` }; },
      (K) => { const a = K.ri(-9, -3), b = a + K.ri(3, 5); return { q: `Write all the integers between ${N(a)} and ${N(b)}.`, a: Array.from({ length: b - a - 1 }, (_, k) => N(a + 1 + k)).join(', ') }; },
    ],
    c: [
      (K) => { const ts = K.shuffle([K.ri(-12, -6), K.ri(-5, -1), 0, K.ri(1, 8)]); const towns = ['Oberon', 'Cooma', 'Jindabyne', 'Thredbo']; return { q: `Dawn temperatures: ${towns.map((t, k) => `${t} ${N(ts[k])}°C`).join(', ')}. Which town was coldest? Which was warmest?`, w: [`lowest: ${N(Math.min(...ts))}°C`, `coldest ${towns[ts.indexOf(Math.min(...ts))]}, warmest ${towns[ts.indexOf(Math.max(...ts))]}`] }; },
      (K) => { const a = K.ri(2, 9), b = K.ri(10, 20); const big = K.pick([true, false]); return { q: `True or false: ${N(-a)} ${big ? '&gt;' : '&lt;'} ${N(-b)}. Explain.`, a: big ? `True. ${N(-a)} is further right than ${N(-b)}.` : `False. ${N(-a)} is further right, so it is larger.`, n: 2 }; },
      (K) => { const a = K.ri(-15, -6), b = K.ri(1, 6); return { q: `Write the smallest and the largest integer between ${N(a)} and ${b}.`, a: `${N(a + 1)} and ${b - 1}` }; },
      (K, i) => [
        { q: 'Sam says −8 is larger than −3 because 8 is larger than 3. Is Sam right? Explain.', a: 'No. −3 is further right on the number line, so −3 > −8.', n: 2 },
        { q: 'Order from coldest to warmest: 2°C, −11°C, −4°C, 0°C, −15°C', a: '−15°C, −11°C, −4°C, 0°C, 2°C' },
        { q: 'Write the integer that is 3 less than −7. Is it larger or smaller than −7?', a: '−10, smaller' },
        { q: 'Which is larger: the opposite of 9 or the opposite of −4?', w: ['opposites: −9 and 4', 'larger: 4'] },
      ][i % 4],
    ],
  },

  '1.04': {
    idea: 'Adding a positive moves right. Adding a negative moves left: + (−4) means − 4. A + and a −: take the difference, and the sign with more wins.',
    ex: [['−3 + 5', ['start at −3, move 5 right', '= 2']], ['4 + (−9)', ['= 4 − 9', '= −5']], ['−6 + (−2)', ['= −6 − 2', '= −8']]],
    look: ['1.02'],
    e: [
      (K) => { const a = K.ri(-9, -1), b = K.ri(2, 9); return { q: `${N(a)} + ${b}`, a: N(a + b) }; },
      (K) => { const a = K.ri(1, 9), b = K.ri(-9, -2); return { q: `${a} + ${B(b)}`, a: N(a + b) }; },
      (K) => { const a = K.ri(-6, 6), b = K.nz(-6, 6); return { q: `Use the number line to find ${N(a)} + ${B(b)}.`, fig: start(-10, 10, a), a: N(a + b) }; },
      (K) => { const a = K.ri(-9, -1), b = K.ri(-9, -1); return { q: `${N(a)} + ${B(b)}`, a: N(a + b) }; },
    ],
    m: [
      (K) => { const a = K.ri(-40, -11), b = K.ri(-30, -5); return { q: `${N(a)} + ${B(b)}`, w: [`= ${N(a)} − ${-b}`, `= ${N(a + b)}`] }; },
      (K) => { const a = K.ri(5, 30), b = K.ri(-50, -10); return { q: `${a} + ${B(b)}`, w: [`= ${a} − ${-b}`, `= ${N(a + b)}`] }; },
      (K) => { const t = K.ri(-12, -2), r = K.ri(4, 15); return { q: `It is ${N(t)}°C. The temperature rises ${r} degrees. What is it now?`, w: [`${N(t)} + ${r}`, `= ${N(t + r)}°C`] }; },
      (K) => { const a = K.ri(-8, 8), b = K.ri(2, 9), c = K.ri(-12, -2); return { q: `${N(a)} + ${b} + ${B(c)}`, w: [`= ${N(a + b)} + ${B(c)}`, `= ${N(a + b + c)}`] }; },
    ],
    c: [
      (K) => { const a = K.ri(-12, 4), x = K.nz(-12, 9); return a + x > 3 && x > 0 ? null : { q: `Find the missing number: ${N(a)} + ☐ = ${N(a + x)}`, w: [`from ${N(a)} to ${N(a + x)}: ${Math.abs(x)} to the ${x > 0 ? 'right' : 'left'}`, `☐ = ${N(x)}`] }; },
      (K) => { const h = K.ri(20, 60), s = K.ri(h + 10, h + 60), e = K.ri(15, 40), who = K.pick(NAMES); return { q: `${who} has $${h}, spends $${s}, then earns $${e}. What is the balance now?`, w: [`${h} + (−${s}) + ${e}`, `= ${N(h - s)} + ${e}`, `= ${N(h - s + e)} dollars`] }; },
      (K) => { const a = K.ri(2, 9), b = K.ri(2, 9), who = K.pick(NAMES); return { q: `${who} says ${N(-a)} + ${B(-b)} = ${a + b}. Is ${who} right? Explain.`, a: `No. Adding a negative moves left: ${N(-a)} + ${B(-b)} = ${N(-a - b)}.`, n: 2 }; },
      (K) => { const [f, u, d] = [K.ri(-4, -1), K.ri(5, 12), K.ri(3, 9)]; return K.pick([true, false]) ? { q: `A lift is at level ${N(f)}. It goes up ${u} floors, then down ${d}. Which level is it on now?`, w: [`${N(f)} + ${u} + ${B(-d)}`, `= ${N(f + u)} + ${B(-d)}`, `= level ${N(f + u - d)}`] } : { q: `A submarine at ${N(f * 50)} m rises ${u * 10} m, then sinks ${d * 10} m. How deep is it now?`, w: [`${N(f * 50)} + ${u * 10} + ${B(-d * 10)}`, `= ${N(f * 50 + u * 10)} + ${B(-d * 10)}`, `= ${N(f * 50 + u * 10 - d * 10)} m`] }; },
      (K) => { const xs = [K.ri(-15, -5), K.ri(5, 20), K.ri(-20, -5), K.ri(1, 9)]; return { q: `${N(xs[0])} + ${xs[1]} + ${B(xs[2])} + ${xs[3]}`, w: [`= ${N(xs[0] + xs[1])} + ${B(xs[2])} + ${xs[3]}`, `= ${N(xs[0] + xs[1] + xs[2])} + ${xs[3]}`, `= ${N(xs[0] + xs[1] + xs[2] + xs[3])}`] }; },
    ],
  },

  '1.05': {
    idea: 'Subtracting a positive moves left. Subtracting a negative moves right: − (−3) means + 3.',
    ex: [['2 − 7', ['start at 2, move 7 left', '= −5']], ['5 − (−3)', ['= 5 + 3', '= 8']], ['−4 − (−9)', ['= −4 + 9', '= 5']]],
    look: ['1.04'],
    e: [
      (K) => { const a = K.ri(1, 6), b = K.ri(a + 2, 12); return { q: `${a} − ${b}`, a: N(a - b) }; },
      (K) => { const a = K.ri(-6, 9), b = K.ri(2, 9); return { q: `${N(a)} − ${B(-b)}`, a: N(a + b) }; },
      (K) => { const a = K.ri(-9, -1), b = K.ri(2, 9); return { q: `${N(a)} − ${b}`, a: N(a - b) }; },
      (K) => { const a = K.ri(-5, 5), b = K.nz(-6, 6); return { q: `Use the number line to find ${N(a)} − ${B(b)}.`, fig: start(-10, 10, a), a: N(a - b) }; },
    ],
    m: [
      (K) => { const a = K.ri(-20, -2), b = K.ri(2, 25); return { q: `${N(a)} − ${B(-b)}`, w: [`= ${N(a)} + ${b}`, `= ${N(a + b)}`] }; },
      (K) => { const lo = K.ri(-12, -1), hi = K.ri(1, 15); return { q: `The temperature went from ${N(lo)}°C to ${hi}°C. How much did it rise?`, w: [`${hi} − ${B(lo)}`, `= ${hi} + ${-lo}`, `= ${hi - lo}°C`] }; },
      (K) => { const a = K.ri(3, 30), b = K.ri(-30, -3); return { q: `Find the difference between ${a} and ${N(b)}.`, w: [`${a} − ${B(b)}`, `= ${a} + ${-b}`, `= ${a - b}`] }; },
      (K) => { const a = K.ri(-60, -10), b = K.ri(-50, -5); return { q: `${N(a)} − ${B(b)}`, w: [`= ${N(a)} + ${-b}`, `= ${N(a - b)}`] }; },
    ],
    c: [
      (K) => { const x = K.nz(-9, 9), b = K.ri(2, 9); return { q: `Find the missing number: ☐ − ${B(-b)} = ${N(x + b)}`, w: [`☐ + ${b} = ${N(x + b)}`, `☐ = ${N(x)}`] }; },
      (K) => { const a = K.ri(-6, 9), b = K.ri(2, 9), c = K.ri(5, 15); return { q: `${N(a)} − ${B(-b)} − ${c}`, w: [`= ${N(a)} + ${b} − ${c}`, `= ${N(a + b)} − ${c}`, `= ${N(a + b - c)}`] }; },
      (K) => { const s = K.ri(5, 30) * 10, p = K.ri(20, 90) * 10; return { q: `A submarine is at ${N(-s)} m. A plane is at ${N(p)} m. How far apart are they?`, w: [`${N(p)} − ${B(-s)}`, `= ${N(p)} + ${N(s)}`, `= ${N(p + s)} m`] }; },
      (K) => { const a = K.ri(2, 9), b = K.ri(2, 9), who = K.pick(NAMES); return { q: `${who} says ${a} − ${B(-b)} = ${N(a - b)}. Is ${who} right? Explain.`, a: `No. Subtracting a negative moves right: ${a} + ${b} = ${a + b}.`, n: 2 }; },
    ],
  },

  '1.06': {
    idea: 'Multiply the numbers, then find the sign. Same signs: the answer is positive. Different signs: the answer is negative.',
    ex: [['−4 × 3', ['different signs: −', '= −12']], ['−5 × (−6)', ['same signs: +', '= 30']], ['−2 × 3 × (−4)', ['= −6 × (−4)', '= 24']]],
    look: ['1.04'],
    e: [
      (K) => { const a = K.ri(2, 9), b = K.ri(2, 9); return K.pick([true, false]) ? { q: `${N(-a)} × ${b}`, a: N(-a * b) } : { q: `${a} × ${B(-b)}`, a: N(-a * b) }; },
      (K) => { const a = K.ri(2, 9), b = K.ri(2, 9); return { q: `${N(-a)} × ${B(-b)}`, a: N(a * b) }; },
      (K) => { const a = K.nz(-12, 12), b = K.nz(-12, 12); return { q: `Positive or negative? Do not work it out: ${N(a)} × ${B(b)}`, a: a * b > 0 ? 'positive' : 'negative' }; },
      (K) => { const n = K.ri(2, 5), e = K.ri(2, 4); return { q: `Write ${n} × ${B(-e)} as a sum, then find the answer.`, w: [Array(n).fill(B(-e)).join(' + '), `= ${N(-n * e)}`] }; },
    ],
    m: [
      (K) => { const a = K.ri(11, 25), b = K.ri(3, 9), s = K.pick([1, -1]); return { q: `${N(-a)} × ${B(s * b)}`, w: [s < 0 ? 'same signs: +' : 'different signs: −', `= ${N(-a * s * b)}`] }; },
      (K) => { const a = K.nz(-6, 6), b = K.nz(-6, 6), c = K.nz(-6, 6); return [a, b, c].filter((x) => x < 0).length < 1 ? null : { q: `${N(a)} × ${B(b)} × ${B(c)}`, w: [`= ${N(a * b)} × ${B(c)}`, `= ${N(a * b * c)}`] }; },
      (K) => { const a = K.ri(2, 12); return { q: `(${N(-a)})<sup>2</sup>`, w: [`= ${N(-a)} × ${B(-a)}`, `= ${a * a}`] }; },
      (K) => { const d = K.ri(2, 6), h = K.ri(3, 8); return { q: `The temperature falls ${d}°C each hour for ${h} hours. Write a multiplication for the change.`, w: [`${h} × ${B(-d)}`, `= ${N(-d * h)}°C`] }; },
    ],
    c: [
      (K) => { const x = K.nz(-12, 12), b = K.nz(-9, 9); return { q: `Find the missing number: ☐ × ${B(b)} = ${N(x * b)}`, w: [`${N(x * b)} ÷ ${B(b)}`, `☐ = ${N(x)}`] }; },
      (K) => { const p = K.ri(2, 9), q = K.ri(-9, -2); return p + q === 0 ? null : { q: `Find two integers that multiply to ${N(p * q)} and add to ${N(p + q)}.`, w: [`try factor pairs of ${N(p * q)}`, `${N(p)} and ${N(q)}`] }; },
      (K) => { const n = K.ri(4, 7); return { q: `${Array(n).fill('(−1)').join(' × ').replace(/^\(−1\)/, '−1')}`, w: [`${n} negatives: ${n % 2 ? 'odd' : 'even'}`, `= ${n % 2 ? '−1' : '1'}`] }; },
      (K) => { const a = K.ri(3, 9), who = K.pick(NAMES); return { q: `${who} says (${N(-a)})<sup>2</sup> = ${N(-a * a)}. Is ${who} right? Explain.`, a: `No. (${N(-a)})² = ${N(-a)} × ${B(-a)} = ${a * a}: same signs, positive.`, n: 2 }; },
    ],
  },

  '1.07': {
    idea: 'Divide the numbers, then find the sign. The rules are the same as for ×: same signs give +, different signs give −.',
    ex: [['−20 ÷ 4', ['different signs: −', '= −5']], ['−36 ÷ (−9)', ['same signs: +', '= 4']], ['Find the average: −3, 5, −8, −6', ['total: −12', '= −12 ÷ 4', '= −3']]],
    look: ['1.06'],
    e: [
      (K) => { const a = K.ri(2, 9), b = K.ri(2, 9); return { q: `${N(-a * b)} ÷ ${a}`, a: N(-b) }; },
      (K) => { const a = K.ri(2, 9), b = K.ri(2, 9); return { q: `${N(-a * b)} ÷ ${B(-a)}`, a: N(b) }; },
      (K) => { const a = K.ri(2, 9), b = K.ri(2, 9); return { q: `${a * b} ÷ ${B(-a)}`, a: N(-b) }; },
      (K) => { const a = K.nz(-12, 12), b = K.nz(-9, 9); return { q: `Positive or negative? Do not work it out: ${N(a * b)} ÷ ${B(b)}`, a: a > 0 ? 'positive' : 'negative' }; },
    ],
    m: [
      (K) => { const a = K.ri(3, 9), b = K.ri(11, 20), s = K.pick([1, -1]); return { q: `${N(-a * b)} ÷ ${B(s * a)}`, w: [s > 0 ? 'different signs: −' : 'same signs: +', `= ${N(-b * s)}`] }; },
      (K) => { const n = K.ri(3, 5), xs = Array.from({ length: n }, () => K.ri(-12, 6)); const t = xs.reduce((s, x) => s + x, 0); return t % n ? null : { q: `Find the average of these temperatures: ${xs.map((x) => `${N(x)}°C`).join(', ')}`, w: [`total: ${N(t)}`, `= ${N(t)} ÷ ${n}`, `= ${N(t / n)}°C`] }; },
      (K) => { const s = K.ri(3, 9), d = K.ri(4, 12); return { q: `A diver goes down ${s * d} m in ${s} equal stages. Write a division for each stage.`, w: [`${N(-s * d)} ÷ ${s}`, `= ${N(-d)} m`] }; },
      (K) => { const a = K.ri(2, 9), b = K.ri(2, 9), s = K.pick([1, -1]); return { q: `Work out ${F(N(-a * b), N(s * b))}`, w: [`= ${N(-a * b)} ÷ ${B(s * b)}`, `= ${N(-a * s)}`] }; },
    ],
    c: [
      (K) => { const x = K.nz(-12, 12), b = K.nz(-9, 9); return { q: `Find the missing number: ☐ ÷ ${B(b)} = ${N(x)}`, w: [`☐ = ${N(x)} × ${B(b)}`, `☐ = ${N(x * b)}`] }; },
      (K) => { const a = K.nz(-9, 9), x = K.nz(-9, 9); return { q: `Find the missing number: ${N(a * x)} ÷ ☐ = ${N(x)}`, w: [`☐ = ${N(a * x)} ÷ ${B(x)}`, `☐ = ${N(a)}`] }; },
      (K) => { const a = K.ri(2, 9), b = K.nz(-6, 6), c = K.nz(-5, 5); return { q: `${N(-a * b)} ÷ ${B(b)} × ${B(c)}`, w: [`= ${N(-a)} × ${B(c)}`, `= ${N(-a * c)}`] }; },
      (K) => { const a = K.ri(2, 9), b = K.ri(2, 9), who = K.pick(NAMES); return { q: `${who} says ${N(-a * b)} ÷ ${B(-a)} = ${N(-b)}. Is ${who} right? Explain.`, a: `No. Same signs give a positive: ${N(-a * b)} ÷ ${B(-a)} = ${b}.`, n: 2 }; },
    ],
  },

  '1.08': {
    idea: 'Brackets first. Then × and ÷, from left to right. Then + and −, from left to right. Write one step a line.',
    ex: [['−3 + 4 × (−2)', ['= −3 + (−8)', '= −11']], ['(−6 + 2) × 5', ['= −4 × 5', '= −20']], ['−20 ÷ (3 − 8)', ['= −20 ÷ (−5)', '= 4']]],
    look: ['1.06', '1.07'],
    e: [
      (K) => { const a = K.nz(-9, 9), b = K.ri(2, 6), c = K.nz(-6, 6); return { q: `${N(a)} + ${b} × ${B(c)}`, w: [`= ${N(a)} + ${B(b * c)}`, `= ${N(a + b * c)}`] }; },
      (K) => { const a = K.ri(2, 6), b = K.nz(-6, 6), c = K.ri(2, 12); return { q: `${a} × ${B(b)} − ${c}`, w: [`= ${N(a * b)} − ${c}`, `= ${N(a * b - c)}`] }; },
      (K) => { const a = K.nz(-9, 9), b = K.nz(-9, 9), c = K.nz(-5, 5); return a + b === 0 ? null : { q: `(${N(a)} + ${B(b)}) × ${B(c)}`, w: [`= ${N(a + b)} × ${B(c)}`, `= ${N((a + b) * c)}`] }; },
    ],
    m: [
      (K) => { const b = K.nz(-6, 6), q = K.nz(-6, 6), c = K.nz(-5, 5), d = K.ri(2, 5); return { q: `${N(b * q)} ÷ ${B(b)} + ${B(c)} × ${d}`, w: [`= ${N(q)} + ${B(c * d)}`, `= ${N(q + c * d)}`] }; },
      (K) => { const a = K.nz(-12, 12), b = K.nz(-9, 9), c = K.nz(-9, 9); return { q: `${N(a)} − (${N(b)} − ${B(c)})`, w: [`= ${N(a)} − ${B(b - c)}`, `= ${N(a - (b - c))}`] }; },
      (K) => { const a = K.ri(2, 6), b = K.ri(5, 30); return { q: `(${N(-a)})<sup>2</sup> − ${b}`, w: [`= ${a * a} − ${b}`, `= ${N(a * a - b)}`] }; },
      (K) => { const q = K.nz(-6, 6), d = K.nz(-5, 5), b = K.ri(2, 8), a = d + b; return { q: `${N(q * d)} ÷ (${N(a)} − ${b})`, w: [`= ${N(q * d)} ÷ ${B(d)}`, `= ${N(q)}`] }; },
    ],
    c: [
      (K) => { const a = K.nz(-9, 9), b = K.nz(-9, 9), c = K.nz(-6, 6), d = K.nz(-6, 6); return a === b || c + d === 0 ? null : { q: `(${N(a)} − ${B(b)}) × (${N(c)} + ${B(d)})`, w: [`= ${B(a - b)} × ${B(c + d)}`, `= ${N((a - b) * (c + d))}`] }; },
      (K) => { const b = K.ri(2, 5), c = K.nz(-6, 6), d = K.ri(2, 5), a = K.nz(-9, 9); const t = a + b * c; return t % d ? null : { q: `[${N(a)} + ${b} × ${B(c)}] ÷ ${d}`, w: [`= [${N(a)} + ${B(b * c)}] ÷ ${d}`, `= ${N(t)} ÷ ${d}`, `= ${N(t / d)}`] }; },
      (K) => { const a = K.ri(-9, -2), b = K.ri(3, 9), c = K.ri(2, 5); return { q: `Put brackets in to make this true: ${N(a)} + ${b} × ${c} = ${N((a + b) * c)}`, w: [`(${N(a)} + ${b}) × ${c}`, `= ${N(a + b)} × ${c} = ${N((a + b) * c)}`] }; },
      (K) => { const a = K.ri(2, 8), b = K.ri(2, 6), c = K.ri(-6, -2), who = K.pick(NAMES); return { q: `${who} says ${a} − ${b} × ${B(c)} = ${N((a - b) * c)}. Is ${who} right? Explain.`, a: `No. × comes first: ${a} − ${B(b * c)} = ${N(a - b * c)}.`, n: 2 }; },
    ],
  },

  '1.09': {
    idea: 'Use the (−) key for a negative number and the − key to subtract. Estimate first, then check that the calculator answer is close.',
    ex: [['Which keys do you press for −8 × 5?', ['(−) 8 × 5 =', '= −40']], ['Use a calculator: −348 + 129', ['(−) 348 + 129 =', '= −219']], ['Estimate, then use a calculator: −394 × 21', ['≈ −400 × 20 = −8 000', '= −8 274']]],
    look: ['1.08'],
    e: [
      (K) => { const a = K.ri(100, 900), b = K.ri(50, 800); return { q: `Use a calculator: ${N(-a)} + ${b}`, a: N(-a + b) }; },
      (K) => { const a = K.ri(12, 60), b = K.ri(11, 40); return { q: `Use a calculator: ${N(-a)} × ${b}`, a: N(-a * b) }; },
      (K) => { const a = K.ri(2, 9), b = K.ri(2, 9), op = K.pick(['×', '+', '−']); return { q: `Which keys do you press for ${N(-a)} ${op} ${b}?`, a: `(−) ${a} ${op} ${b} =` }; },
      (K) => { const a = K.ri(12, 40), b = K.ri(12, 40); return { q: `Use a calculator: ${N(-a * b)} ÷ ${B(-b)}`, a: N(a) }; },
    ],
    m: [
      (K) => { const a = K.ri(31, 99) * K.pick([1, 1, 10]) + K.ri(1, 9), b = K.ri(11, 49); const ra = Math.round(a / (a > 100 ? 100 : 10)) * (a > 100 ? 100 : 10), rb = Math.round(b / 10) * 10; return { q: `Estimate, then use a calculator: ${N(-a)} × ${b}`, w: [`≈ ${N(-ra)} × ${rb} = ${N(-ra * rb)}`, `= ${N(-a * b)}`] }; },
      (K) => { const a = K.ri(11, 25); return { q: `Use a calculator: (${N(-a)})<sup>2</sup>`, w: [`( (−) ${a} ) x² =`, `= ${a * a}`] }; },
      (K) => { const a = K.ri(-300, -100), b = K.ri(20, 90), c = K.ri(-15, -3); return { q: `Use a calculator: (${N(a)} + ${b}) × ${B(c)}`, w: [`bracket: ${N(a + b)}`, `= ${N((a + b) * c)}`] }; },
      (K) => { const a = K.ri(12, 48), q = K.ri(-40, -12), c = K.ri(100, 300); return { q: `Use a calculator: ${N(a * q)} ÷ ${a} − ${c}`, w: [`${N(a * q)} ÷ ${a} = ${N(q)}`, `= ${N(q - c)}`] }; },
    ],
    c: [
      (K) => { const a = K.ri(3, 9), who = K.pick(NAMES); return { q: `${who} pressed (−) ${a} x² and got ${N(-a * a)}. What keys give (${N(-a)})<sup>2</sup>? What is the answer?`, w: [`( (−) ${a} ) x²`, `= ${a * a}`] }; },
      (K) => { const d = K.ri(-24, -11), q = K.ri(-30, 30), a = K.ri(-500, -100); const t = q * d; const b = t - a; return q === 0 ? null : { q: `Use a calculator: (${N(a)} + ${N(b)}) ÷ ${B(d)}`, w: [`bracket: ${N(t)}`, `= ${N(q)}`] }; },
      (K) => { const p = K.ri(-35, -15), n = K.ri(12, 30); return { q: `The temperature on Mars changed by ${N(p)}°C each hour for ${n} hours. Find the total change.`, w: [`${n} × ${B(p)}`, `= ${N(n * p)}°C`] }; },
      (K) => { const a = K.ri(101, 499), b = K.ri(21, 79), who = K.pick(NAMES); return { q: `${who} says ${N(-a)} × ${b} is about ${N(-Math.round(a / 100) * 100 * Math.round(b / 10) * 10 * 10)}. Is that a sensible estimate? Explain.`, a: `No. ≈ ${N(-Math.round(a / 100) * 100)} × ${Math.round(b / 10) * 10} = ${N(-Math.round(a / 100) * 100 * Math.round(b / 10) * 10)}; that estimate is 10 times too big.`, n: 2 }; },
    ],
  },

  '1.10': {
    idea: 'Up, rises, gains and money in are positive. Down, falls, losses and money out are negative. Write a number sentence, then answer the question.',
    ex: [['It is −4°C. The temperature rises 9°C. What is it now?', ['−4 + 9', '= 5°C']], ['A diver at −12 m goes down 7 m, then up 15 m. Where is the diver now?', ['−12 − 7 + 15', '= −19 + 15', '= −4 m']], ['The temperature falls 3°C each hour for 5 hours. What is the change?', ['5 × (−3)', '= −15°C']]],
    look: ['1.04', '1.05'],
    e: [
      (K) => { const t = K.ri(-10, 6), f = K.ri(4, 14); return { q: `It is ${N(t)}°C. The temperature falls ${f}°C. What is it now?`, w: [`${N(t)} − ${f}`, `= ${N(t - f)}°C`] }; },
      (K) => { const b = K.ri(20, 80), s = K.ri(b + 5, b + 60), who = K.pick(NAMES); return { q: `${who} has $${b} in the bank and spends $${s}. What is the balance?`, w: [`${b} − ${s}`, `= ${N(b - s)} dollars`] }; },
      (K) => { const f = K.ri(-4, -1), u = K.ri(3, 12); return { q: `A lift starts at level ${N(f)} and goes up ${u} floors. Which level is it on now?`, w: [`${N(f)} + ${u}`, `= level ${N(f + u)}`] }; },
    ],
    m: [
      (K) => { const s = K.ri(-20, -5), d = K.ri(3, 12), u = K.ri(5, 25); return { q: `A diver at ${N(s)} m goes down ${d} m, then up ${u} m. Where is the diver now?`, w: [`${N(s)} − ${d} + ${u}`, `= ${N(s - d)} + ${u}`, `= ${N(s - d + u)} m`] }; },
      (K) => { const hi = K.ri(2, 18), lo = K.ri(-15, -2); return { q: `The highest temperature was ${hi}°C. The lowest was ${N(lo)}°C. What is the difference?`, w: [`${hi} − ${B(lo)}`, `= ${hi} + ${-lo}`, `= ${hi - lo}°C`] }; },
      (K) => { const d = K.ri(2, 6), h = K.ri(3, 8); return { q: `A tank's water level drops ${d} cm each day for ${h} days. What is the total change?`, w: [`${h} × ${B(-d)}`, `= ${N(-d * h)} cm`] }; },
      (K) => { const xs = [K.ri(-6, -1), K.ri(1, 5), K.ri(-4, 3)], who = K.pick(NAMES); const t = xs.reduce((s, x) => s + x, 0); return { q: `In three rounds of golf, ${who} scored ${xs.map(N).join(', ')}. What is the total score?`, w: [`${xs.map(B).join(' + ')}`, `= ${N(t)}`] }; },
    ],
    c: [
      (K) => { const t = K.ri(4, 12), d = K.ri(2, 4), h = K.ri(4, 8); return { q: `It is ${t}°C at 6 pm. The temperature falls ${d}°C every hour. What is it ${h} hours later?`, w: [`${h} × ${B(-d)} = ${N(-h * d)}`, `${t} + ${B(-h * d)}`, `= ${N(t - h * d)}°C`] }; },
      (K) => { const n = 4, xs = Array.from({ length: n }, () => K.ri(-15, 5)); const s = xs.reduce((a, b) => a + b, 0); return s % n ? null : { q: `Overnight temperatures for four nights: ${xs.map((x) => `${N(x)}°C`).join(', ')}. Find the average.`, w: [`total: ${N(s)}`, `= ${N(s)} ÷ ${n}`, `= ${N(s / n)}°C`] }; },
      (K) => { const owe = K.ri(30, 90), wk = K.ri(10, 25), n = K.ri(3, 6), who = K.pick(NAMES); return { q: `${who} owes $${owe} and pays back $${wk} a week for ${n} weeks. What is the balance now?`, w: [`${N(-owe)} + ${n} × ${wk}`, `= ${N(-owe)} + ${n * wk}`, `= ${N(-owe + n * wk)} dollars`] }; },
      (K) => { const a = K.ri(200, 600), b = K.ri(-400, -100); return { q: `A plane is at ${a} m. A submarine is at ${N(b)} m. How much higher is the plane?`, w: [`${a} − ${B(b)}`, `= ${a} + ${-b}`, `= ${a - b} m`] }; },
    ],
  },
};
