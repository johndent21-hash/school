// Worksheet questions for Chapter 5B Equations (lib/worksheet.js). See ../ch01-integers/content.js for the format.
const { al } = require('../../lib/algebra');
const { F, fmt } = require('../../lib/calc');

const V = ['x', 'a', 'm', 'n', 'p', 'k', 't', 'y', 'b', 'w'];
const N = (v) => fmt(v);

module.exports = {
  '5.10': ({ ri, pick }) => [
    [{ text: 'Solve in your head: what number makes it true?', gen: () => { const v = pick(V), s = ri(1, 15), b = ri(2, 12), k = ri(0, 2); return { q: al([`${v} + ${b} = ${s + b}`, `${v} - ${b} = ${s}`, `${b}${v} = ${b * s}`][k]), a: al(`${v} = ${k === 1 ? s + b : s}`) }; } }],
    [{ text: 'Is the value a solution? Substitute it, then compare both sides.', gen: () => { const v = pick(V), a = ri(2, 6), s = ri(1, 9), b = ri(1, 12), g = pick([s, s, s + 1, s - 1]); if (g < 1) return { q: '' }; const L = a * g + b, R = a * s + b; return { q: `${al(`${a}${v} + ${b} = ${R}`)}; try <i>${v}</i> = ${g}`, a: g === s ? 'yes' : 'no', lines: [`${a} × ${g} + ${b} = ${L}`, `${L} ${L === R ? '=' : '≠'} ${R}, so ${g === s ? 'yes' : 'no'}`] }; } }],
    [{ text: 'Guess, check and improve. Record each guess.', gen: () => { const v = pick(V), a = ri(3, 9), s = ri(5, 15), b = ri(1, 20), R = a * s + b, g1 = s - ri(2, 3), g2 = s + 1; return { q: al(`${a}${v} + ${b} = ${R}`), a: al(`${v} = ${s}`), lines: [`try ${g1}: ${a} × ${g1} + ${b} = ${a * g1 + b} (too small)`, `try ${g2}: ${a} × ${g2} + ${b} = ${a * g2 + b} (too big)`, `try ${s}: ${a} × ${s} + ${b} = ${R} ✓`] }; } }],
  ],
  '5.11': ({ ri, pick, nz }) => [
    [{ text: 'Solve. Do the opposite operation to both sides.', gen: () => { const v = pick(V), s = ri(1, 30), b = ri(1, 20), k = ri(0, 1); return { q: al(k ? `${v} + ${b} = ${s + b}` : `${v} - ${b} = ${s}`), a: al(`${v} = ${k ? s : s + b}`) }; } }],
    [{ text: 'Solve. Show the opposite operation on both sides.', gen: (i) => { const v = pick(V), s = ri(2, 12), b = ri(2, 9); return i % 2 === 0 ? { q: al(`${b}${v} = ${b * s}`), a: al(`${v} = ${s}`), lines: [`${al(`${b}${v}`)} ÷ ${b} = ${b * s} ÷ ${b}`, `${al(`${v} = ${s}`)}`] } : { q: `${F(al(v), b)} = ${s}`, a: al(`${v} = ${b * s}`), lines: [`${F(al(v), b)} × ${b} = ${s} × ${b}`, `${al(`${v} = ${b * s}`)}`] }; } }],
    [{ text: 'Solve. The answer may be negative or a fraction.', kinds: 2, gen: (i) => { const v = pick(V), b = ri(2, 12); if (i % 2 === 0) { const s = nz(-15, -1); return { q: al(`${v} + ${b} = ${N(s + b)}`), a: al(`${v} = ${N(s)}`), lines: [`${al(v)} + ${b} − ${b} = ${N(s + b)} − ${b}`, `${al(`${v} = ${N(s)}`)}`] }; } const c = ri(1, 30); if (c % b === 0) return { q: '' }; return { q: al(`${b}${v} = ${c}`), a: `<i>${v}</i> = ${F(c, b)}`, lines: [`${al(`${b}${v}`)} ÷ ${b} = ${c} ÷ ${b}`, `<i>${v}</i> = ${F(c, b)}`] }; } }],
  ],
  '5.12': ({ ri, pick, nz }) => [
    [{ text: 'Two-step equations: what is the first thing to undo? Write + , −, × or ÷ and the number.', gen: () => { const v = pick(V), a = ri(2, 9), b = ri(1, 20), op = pick(['+', '-']); return { q: al(`${a}${v} ${op} ${b} = ${ri(20, 60)}`), a: op === '+' ? `− ${b}` : `+ ${b}` }; } }],
    [{ text: 'Solve. Undo the + or − first, then the ×.', gen: () => { const v = pick(V), a = ri(2, 9), s = ri(1, 12), b = ri(1, 20), op = pick(['+', '-']); const R = op === '+' ? a * s + b : a * s - b; return { q: al(`${a}${v} ${op} ${b} = ${R}`), a: al(`${v} = ${s}`), lines: [`${al(`${a}${v}`)} = ${R} ${op === '+' ? '−' : '+'} ${b} = ${a * s}`, `${al(v)} = ${a * s} ÷ ${a} = ${s}`] }; } }],
    [{ text: 'Solve. Divide first, or expand the brackets. The answer may be negative.', kinds: 2, gen: (i) => { const v = pick(V); if (i % 2 === 0) { const a = ri(2, 6), s = ri(1, 12), b = ri(1, 9); return { q: al(`${a}(${v} + ${b}) = ${a * (s + b)}`), a: al(`${v} = ${s}`), lines: [`${al(`${v} + ${b}`)} = ${a * (s + b)} ÷ ${a} = ${s + b}`, `${al(v)} = ${s + b} − ${b}`, `${al(`${v} = ${s}`)}`] }; } const a = ri(2, 9), s = nz(-10, -1), b = ri(1, 20); const R = a * s + b; return { q: al(`${a}${v} + ${b} = ${N(R)}`), a: al(`${v} = ${N(s)}`), lines: [`${al(`${a}${v}`)} = ${N(R)} − ${b} = ${N(a * s)}`, `${al(v)} = ${N(a * s)} ÷ ${a}`, `${al(`${v} = ${N(s)}`)}`] }; } }],
  ],
  '5.13': ({ ri, pick }) => {
    const words = [
      (s, b) => [`A number plus ${b} is ${s + b}.`, `n + ${b} = ${s + b}`, s],
      (s, b) => [`${b} times a number is ${b * s}.`, `${b}n = ${b * s}`, s],
      (s, b) => [`A number minus ${b} is ${s}.`, `n − ${b} = ${s}`, s + b],
      (s, b) => [`A number divided by ${b} is ${s}.`, `n ÷ ${b} = ${s}`, s * b],
    ];
    return [
      [{ text: 'Write an equation for each sentence. Use n for the number. (Do not solve yet.)', gen: (i) => { const s = ri(3, 20), b = ri(2, 9); const [q, e] = words[i % 4](s, b); return { q, a: e }; } }],
      [{ text: 'Write an equation, then solve it.', gen: (i) => { const s = ri(3, 20), b = ri(2, 9); const [q, e, n] = [(s2, b2) => [`Double a number, plus ${b2}, is ${2 * s2 + b2}.`, `2n + ${b2} = ${2 * s2 + b2}`, s2], (s2, b2) => [`Three times a number, minus ${b2}, is ${3 * s2 - b2}.`, `3n − ${b2} = ${3 * s2 - b2}`, s2]][i % 2](s, b); return { q, a: `n = ${n}`, lines: [e, `n = ${n}`] }; } }],
      [{ text: 'Write an equation for the problem, solve it, then answer in a sentence.', kinds: 3, gen: (i) => { const c = ri(3, 12), s = ri(4, 30); const a = ri(20, 70), b = ri(20, 70); return [
        { q: `${c} equal packs hold ${c * s} pencils. How many pencils are in each pack?`, a: `${s} pencils`, lines: [`${c}p = ${c * s}`, `p = ${c * s} ÷ ${c} = ${s}`, `There are ${s} pencils in each pack.`] },
        { q: `A plumber charges $${c * 5} call-out plus $${s} an hour. The bill is $${c * 5 + s * 4}. How many hours?`, a: '4 hours', lines: [`${c * 5} + ${s}h = ${c * 5 + s * 4}`, `${s}h = ${s * 4}, h = 4`, 'The plumber worked 4 hours.'] },
        a + b < 170 ? { q: `Two angles of a triangle are ${a}° and ${b}°. Find the third angle, x°.`, a: `x = ${180 - a - b}`, lines: [`${a} + ${b} + x = 180`, `x = 180 − ${a + b} = ${180 - a - b}`, `The third angle is ${180 - a - b}°.`] } : { q: '' },
      ][i % 3]; } }],
    ];
  },
};
