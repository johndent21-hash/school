// Skill drill pages for Chapter 5B Equations: page 1 practises the Easy basics, page 2 the Medium basics (lib/drill.js).
const { al } = require('../../lib/algebra');
const { F } = require('../../lib/calc');

const V = ['x', 'a', 'm', 'n', 'p', 'k', 't', 'y', 'b', 'w'];

module.exports = {
  '5.10': ({ round, ri, pick, N }) => ({
    easy: [
      round('is the value given a solution? Write yes or no.', 24, () => { const v = pick(V), a = ri(2, 6), s = ri(1, 9), b = ri(1, 12), g = pick([s, s, s + 1, s - 1]); return [`${al(`${a}${v} + ${b} = ${a * s + b}`)}; <i>${v}</i> = ${g}`, g === s ? 'yes' : 'no']; }, { cols: 3 }),
      round('solve in your head: what number makes it true?', 16, () => { const v = pick(V), s = ri(1, 15), b = ri(2, 12), k = ri(0, 2); return [al([`${v} + ${b} = ${s + b}`, `${v} - ${b} = ${s}`, `${b}${v} = ${b * s}`][k]), `${v} = ${k === 1 ? s + b : s}`]; }),
    ],
    medium: [
      round('guess, check and improve. Show your guesses.', 12, () => { const v = pick(V), a = ri(3, 9), s = ri(4, 15), b = ri(1, 20); return [al(`${a}${v} + ${b} = ${a * s + b}`), `${v} = ${s}`]; }, { cols: 3, work: true }),
      round('solve by guess and check.', 12, () => { const v = pick(V), a = ri(2, 5), s = ri(2, 12), b = ri(1, 9); return [al(`${a}${v} - ${b} = ${a * s - b}`), `${v} = ${s}`]; }, { cols: 3 }),
    ],
  }),
  '5.11': ({ round, ri, pick, N }) => ({
    easy: [
      round('solve. Do the opposite operation to both sides.', 24, () => { const v = pick(V), s = ri(1, 30), b = ri(1, 20), k = ri(0, 1); return [al(k ? `${v} + ${b} = ${s + b}` : `${v} - ${b} = ${s}`), al(`${v} = ${k ? s : s + b}`)]; }),
      round('solve.', 16, () => { const v = pick(V), s = ri(2, 12), b = ri(2, 9); return ri(0, 1) ? [al(`${b}${v} = ${b * s}`), al(`${v} = ${s}`)] : [`${F(al(v), b)} = ${s}`, al(`${v} = ${b * s}`)]; }),
    ],
    medium: [
      round('solve. The answer may be negative.', 16, () => { const v = pick(V), s = ri(-15, 15), b = ri(2, 20), k = ri(0, 2); if (!s) return ['', '']; return [al([`${v} + ${b} = ${N(s + b)}`, `${v} - ${b} = ${N(s - b)}`, `${b}${v} = ${N(b * s)}`][k]), al(`${v} = ${N(s)}`)]; }),
      round('solve. Write the answer as a fraction or a decimal where needed.', 16, () => { const v = pick(V), b = ri(2, 10), c = ri(1, 40); return c % b === 0 ? ['', ''] : [al(`${b}${v} = ${c}`), `<i>${v}</i> = ${F(c, b)} = ${String(+(c / b).toFixed(3))}`]; }),
    ],
  }),
  '5.12': ({ round, ri, pick, N }) => ({
    easy: [
      round('solve. Undo the + or − first, then the ×.', 20, () => { const v = pick(V), a = ri(2, 9), s = ri(1, 12), b = ri(1, 20), op = pick(['+', '-']); return [al(`${a}${v} ${op} ${b} = ${op === '+' ? a * s + b : a * s - b}`), al(`${v} = ${s}`)]; }),
      round('solve. Undo the + or − first, then the ÷.', 16, () => { const v = pick(V), a = ri(2, 6), s = ri(1, 9), b = ri(1, 12), op = pick(['+', '−']); return [`${F(al(v), a)} ${op} ${b} = ${op === '+' ? s + b : s - b}`, al(`${v} = ${a * s}`)]; }),
    ],
    medium: [
      round('solve. The answer may be negative.', 16, () => { const v = pick(V), a = ri(2, 9), s = ri(-10, 10), b = ri(1, 20), op = pick(['+', '-']); if (!s) return ['', '']; return [al(`${a}${v} ${op} ${b} = ${N(op === '+' ? a * s + b : a * s - b)}`), al(`${v} = ${N(s)}`)]; }),
      round('solve. Divide both sides first, or expand the brackets.', 12, () => { const v = pick(V), a = ri(2, 6), s = ri(1, 12), b = ri(1, 9), op = pick(['+', '-']); if (op === '-' && s <= b) return ['', '']; return [al(`${a}(${v} ${op} ${b}) = ${a * (op === '+' ? s + b : s - b)}`), al(`${v} = ${s}`)]; }, { cols: 3 }),
    ],
  }),
  '5.13': ({ round, ri, pick }) => {
    const words = [
      (s, b) => [`A number plus ${b} is ${s + b}.`, `n + ${b} = ${s + b}, n = ${s}`],
      (s, b) => [`${b} times a number is ${b * s}.`, `${b}n = ${b * s}, n = ${s}`],
      (s, b) => [`A number minus ${b} is ${s}.`, `n − ${b} = ${s}, n = ${s + b}`],
      (s, b) => [`A number divided by ${b} is ${s}.`, `n ÷ ${b} = ${s}, n = ${s * b}`],
      (s, b) => [`Double a number, plus ${b}, is ${2 * s + b}.`, `2n + ${b} = ${2 * s + b}, n = ${s}`],
      (s, b) => [`Three times a number, minus ${b}, is ${3 * s - b}.`, `3n − ${b} = ${3 * s - b}, n = ${s}`],
    ];
    return {
      easy: [
        round('write an equation (use n for the number), then solve it.', 16, () => { const s = ri(3, 20), b = ri(2, 9); return pick(words)(s, b); }, { cols: 2 }),
        round('write an equation only. Do not solve it.', 8, () => { const s = ri(3, 20), b = ri(2, 9); const [q, a] = pick(words)(s, b); return [q, a.split(',')[0]]; }, { cols: 2 }),
      ],
      medium: [
        round('write an equation, then solve it. Show your working.', 6, () => { const k = ri(0, 2), c = ri(3, 15), s = ri(4, 30); return [[`${c} equal packs of pencils hold ${c * s} pencils. How many in each pack?`, `A plumber charges $${c * 5} call-out plus $${s} an hour. The bill is $${c * 5 + s * 4}. How many hours?`, `The perimeter of a square is ${4 * s} cm. Find the side length.`][k], [`${c}n = ${c * s}, ${s} pencils`, `${c * 5} + ${s}h = ${c * 5 + s * 4}, 4 hours`, `4s = ${4 * s}, ${s} cm`][k]]; }, { cols: 2, work: true }),
        round('write an equation, then solve it. Show your working.', 6, () => { const a = ri(20, 70), b = ri(20, 70); if (a + b >= 170) return ['', '']; return [`Two angles of a triangle are ${a}° and ${b}°. Find the third angle, x°.`, `${a} + ${b} + x = 180, x = ${180 - a - b}`]; }, { cols: 2, work: true }),
      ],
    };
  },
};
