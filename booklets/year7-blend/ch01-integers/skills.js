// Skill drill pages for Chapter 1 Integers: page 1 practises the Easy basics, page 2 the Medium basics (lib/drill.js).
const { ev } = require('../../lib/calc');

const sit = [['a gain of {n} kg', 1], ['a loss of ${n}', -1], ['{n}°C below zero', -1], ['{n} m above sea level', 1], ['{n} m below sea level', -1], ['a rise of {n} cm', 1],
  ['a fall of {n} points', -1], ['{n} floors up', 1], ['{n} floors down', -1], ['a deposit of ${n}', 1], ['a withdrawal of ${n}', -1], ['{n} steps forward', 1], ['{n} steps back', -1], ['{n} minutes early', -1], ['{n} minutes late', 1]];

module.exports = {
  '1.01': ({ round, nz, ri, pick, N, B }) => ({
    easy: [
      round('write the opposite of each integer.', 24, () => { const n = nz(-60, 60); return [N(n), N(-n)]; }),
      round('write an integer for each situation.', 18, () => { const [t, s] = pick(sit), n = ri(2, 90); return [t.replace('{n}', n), N(s * n)]; }, { cols: 3 }),
    ],
    medium: [
      round('simplify. The opposite of the opposite is the number itself.', 20, () => { const n = ri(1, 60); return [`−(−${n})`, N(n)]; }),
      round('write an integer for the situation, then write its opposite.', 18, () => { const [t, s] = pick(sit), n = ri(2, 90); return [t.replace('{n}', n), `${N(s * n)}, ${N(-s * n)}`]; }, { cols: 3 }),
    ],
  }),
  '1.02': ({ round, nz, ri, pick, N }) => ({
    easy: [
      round('which integer is further to the right on the number line?', 24, () => { const a = ri(-15, 15); let b; do b = ri(-15, 15); while (b === a); return [`${N(a)} or ${N(b)}`, N(Math.max(a, b))]; }),
      round('start at the first number and move along the number line. Where do you land?', 18, () => { const a = ri(-8, 8), m = ri(2, 9), d = pick(['left', 'right']); return [`start at ${N(a)}, move ${m} ${d}`, N(d === 'left' ? a - m : a + m)]; }, { cols: 3 }),
    ],
    medium: [
      round('how many units apart are the two integers on the number line?', 20, () => { const a = ri(-20, 5), b = ri(-5, 20); return a === b ? ['', ''] : [`${N(a)} and ${N(b)}`, N(Math.abs(a - b))]; }),
      round('which integer is exactly halfway between?', 15, () => { const m = ri(-12, 12), d = ri(1, 9); return [`${N(m - d)} and ${N(m + d)}`, N(m)]; }),
    ],
  }),
  '1.03': ({ round, ri, shuffle, N }) => ({
    easy: [
      round('write &lt; or &gt; in the box.', 24, () => { const a = ri(-20, 12); let b; do b = ri(-20, 12); while (b === a); return [`${N(a)} ☐ ${N(b)}`, a < b ? '<' : '>']; }),
      round('write the integers in ascending order (smallest first).', 10, () => { const s = new Set(); while (s.size < 4) s.add(ri(-25, 20)); const xs = [...s]; return [shuffle(xs).map(N).join(', '), [...xs].sort((a, b) => a - b).map(N).join(', ')]; }, { cols: 2 }),
    ],
    medium: [
      round('true or false?', 20, () => { const a = ri(-30, 10), b = ri(-30, 10), op = a % 2 ? '<' : '>'; return a === b ? ['', ''] : [`${N(a)} ${op} ${N(b)}`, (op === '<' ? a < b : a > b) ? 'true' : 'false']; }),
      round('write the integers in descending order (largest first).', 10, () => { const s = new Set(); while (s.size < 5) s.add(ri(-40, 30)); const xs = [...s]; return [shuffle(xs).map(N).join(', '), [...xs].sort((a, b) => b - a).map(N).join(', ')]; }, { cols: 2 }),
    ],
  }),
  '1.04': ({ round, nz, ri, N, B }) => ({
    easy: [
      round('evaluate each sum.', 24, () => { const a = nz(-12, -1), b = ri(1, 12); return [`${N(a)} + ${b}`, N(a + b)]; }),
      round('evaluate. Adding a negative is the same as subtracting.', 20, () => { const a = nz(-12, 12), b = nz(-12, -1); return [`${N(a)} + ${B(b)}`, N(a + b)]; }),
    ],
    medium: [
      round('evaluate. Work from left to right.', 18, () => { const a = nz(-15, 15), b = nz(-15, 15), c = nz(-15, 15); return [`${N(a)} + ${B(b)} + ${B(c)}`, N(a + b + c)]; }, { cols: 3 }),
      round('evaluate each sum.', 20, () => { const a = nz(-90, 90), b = nz(-90, 90); return [`${N(a)} + ${B(b)}`, N(a + b)]; }),
    ],
  }),
  '1.05': ({ round, nz, ri, N, B }) => ({
    easy: [
      round('evaluate. Subtract by moving left on the number line.', 24, () => { const a = ri(-10, 10), b = ri(2, 15); return [`${N(a)} − ${b}`, N(a - b)]; }),
      round('evaluate. Subtracting a negative is the same as adding.', 20, () => { const a = nz(-12, 12), b = nz(-12, -1); return [`${N(a)} − ${B(b)}`, N(a - b)]; }),
    ],
    medium: [
      round('evaluate.', 20, () => { const a = nz(-40, 40), b = nz(-40, 40); return [`${N(a)} − ${B(b)}`, N(a - b)]; }),
      round('evaluate. Work from left to right.', 18, () => { const a = nz(-15, 15), b = nz(-15, 15), c = nz(-15, 15); return [`${N(a)} − ${B(b)} + ${B(c)}`, N(a - b + c)]; }, { cols: 3 }),
    ],
  }),
  '1.06': ({ round, nz, pick, N, B }) => ({
    easy: [
      round('evaluate each product. Same signs: positive. Different signs: negative.', 24, () => { const a = nz(-10, 10), b = nz(-10, 10); return a > 0 && b > 0 ? ['', ''] : [`${N(a)} × ${B(b)}`, N(a * b)]; }),
      round('write the sign of the answer only: + or −.', 20, () => { const k = pick([2, 3, 4]); const xs = Array.from({ length: k }, () => nz(-9, 9)); return [xs.map(B).join(' × '), xs.reduce((p, x) => p * x, 1) > 0 ? '+' : '−']; }),
    ],
    medium: [
      round('evaluate. Multiply two numbers at a time.', 18, () => { const a = nz(-6, 6), b = nz(-6, 6), c = nz(-5, 5); return a > 0 && b > 0 && c > 0 ? ['', ''] : [`${N(a)} × ${B(b)} × ${B(c)}`, N(a * b * c)]; }, { cols: 3 }),
      round('find the missing number.', 20, () => { const a = nz(-9, 9), b = nz(-9, 9); return [`${N(a)} × ☐ = ${N(a * b)}`, N(b)]; }),
    ],
  }),
  '1.07': ({ round, nz, N, B }) => ({
    easy: [
      round('evaluate each quotient. Same signs: positive. Different signs: negative.', 24, () => { const a = nz(-10, 10), b = nz(-10, 10); return a * b > 0 && b > 0 ? ['', ''] : [`${N(a * b)} ÷ ${B(b)}`, N(a)]; }),
      round('evaluate.', 20, () => { const a = nz(-12, 12), b = nz(-12, 12); return [`${N(a * b)} ÷ ${B(a)}`, N(b)]; }),
    ],
    medium: [
      round('evaluate. Work from left to right.', 18, () => { const a = nz(-5, 5), b = nz(-4, 4), c = nz(-5, 5); return [`${N(a * b * c)} ÷ ${B(a)} ÷ ${B(b)}`, N(c)]; }, { cols: 3 }),
      round('find the missing number.', 20, () => { const a = nz(-9, 9), b = nz(-9, 9); return [`${N(a * b)} ÷ ☐ = ${N(a)}`, N(b)]; }),
    ],
  }),
  '1.08': ({ round, nz, pick, N, B }) => {
    const e = (s) => [s, ev(s)];
    return {
      easy: [
        round('evaluate. × and ÷ before + and −.', 18, () => { const a = nz(-12, 12), b = nz(-6, 6), c = nz(-6, 6); return e(`${N(a)} ${pick(['+', '−'])} ${B(b)} × ${B(c)}`); }, { cols: 3 }),
        round('evaluate. Brackets first.', 18, () => { const a = nz(-9, 9), b = nz(-9, 9), c = nz(-5, 5); return e(`(${N(a)} ${pick(['+', '−'])} ${B(b)}) × ${B(c)}`); }, { cols: 3 }),
      ],
      medium: [
        round('evaluate. × and ÷ from left to right, then + and −.', 18, () => { const a = nz(-6, 6), b = nz(-6, 6), c = nz(-5, 5), d = nz(-5, 5); return e(`${N(a)} × ${B(b)} ${pick(['+', '−'])} ${B(c * d)} ÷ ${B(d)}`); }, { cols: 3 }),
        round('evaluate. Show each step.', 9, () => { const a = nz(-8, 8), b = nz(-8, 8), c = nz(-4, 4), d = nz(-9, 9); return e(`${N(d)} − (${N(a)} + ${B(b)}) × ${B(c)}`); }, { cols: 3, work: true }),
      ],
    };
  },
  '1.09': ({ round, nz, ri, N, B }) => ({
    easy: [
      round('use your calculator. Use the (−) key for negatives.', 20, () => { const a = nz(-400, 400), b = nz(-400, 400); return [`${N(a)} + ${B(b)}`, N(a + b)]; }),
      round('use your calculator.', 20, () => { const a = nz(-45, 45), b = nz(-45, 45); return [`${N(a)} × ${B(b)}`, N(a * b)]; }),
    ],
    medium: [
      round('use your calculator.', 20, () => { const a = nz(-60, 60), b = nz(-40, 40); return [`${N(a * b)} ÷ ${B(b)}`, N(a)]; }),
      round('use your calculator. Enter the brackets.', 18, () => { const a = nz(-90, 90), b = nz(-90, 90), c = nz(-25, 25); return [`(${N(a)} − ${B(b)}) × ${B(c)}`, N((a - b) * c)]; }, { cols: 3 }),
    ],
  }),
  '1.10': ({ round, ri, pick, N }) => ({
    easy: [
      round('find the new temperature.', 12, () => { const t = ri(-12, 15), c = ri(3, 18), up = pick([true, false]); return [`It is ${N(t)}°C. The temperature ${up ? 'rises' : 'falls'} ${c}°C.`, `${N(up ? t + c : t - c)}°C`]; }, { cols: 2 }),
      round('find the new bank balance.', 12, () => { const b = ri(-80, 150), m = ri(10, 120), dep = pick([true, false]); return [`Balance ${b < 0 ? '−$' + -b : '$' + b}. ${dep ? 'Deposit' : 'Withdraw'} $${m}.`, (dep ? b + m : b - m) < 0 ? `−$${-(dep ? b + m : b - m)}` : `$${dep ? b + m : b - m}`]; }, { cols: 2 }),
    ],
    medium: [
      round('find the difference between the two heights (in metres).', 12, () => { const a = ri(20, 400), b = -ri(5, 120); return [`a hill ${a} m above sea level and a reef ${-b} m below`, `${a - b} m`]; }, { cols: 2 }),
      round('write a number sentence, then answer.', 6, () => { const s = ri(-20, -2), r = ri(2, 6), h = ri(2, 5); return [`A diver is at ${N(s * 5)} m. She rises ${r} m a minute for ${h} minutes. Where is she now?`, `${N(s * 5)} + ${r} × ${h} = ${N(s * 5 + r * h)} m`]; }, { cols: 2, work: true }),
    ],
  }),
};
