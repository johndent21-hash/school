// Chapter 5B Equations: mixed-practice questions (lib/mixed.js). Every question stands on its own.
const { al } = require('../../lib/algebra');
const { F, fmt } = require('../../lib/calc');

const V = ['x', 'a', 'm', 'n', 'p', 'k', 't', 'y', 'b', 'w'];
const N = (v) => fmt(v);
const i_ = (v) => `<i>${v}</i>`;
const NAMES = ['Ali', 'Mia', 'Zac', 'Lena', 'Kai', 'Ruby', 'Tom', 'Priya', 'Jack', 'Aisha', 'Noah', 'Chloe'];
const eq = (s) => al(s); // an equation, italic pronumerals and true minus signs

module.exports = {
  '5.10': {
    idea: 'An equation is true for one value of the pronumeral: the solution. Guess, check and improve: try a value, substitute it, see if it is too big or too small, then try again.',
    ex: [[`Solve in your head: ${eq('x + 7 = 12')}`, ['5 + 7 = 12', `${eq('x = 5')}`]], [`Is ${i_('m')} = 4 a solution of ${eq('3m + 2 = 15')}?`, ['3 × 4 + 2 = 14', 'no: 14 ≠ 15']], [`Guess, check and improve: ${eq('6p + 5 = 77')}`, ['try 10: 65, too small', 'try 13: 83, too big', `try 12: 77 ✓, ${eq('p = 12')}`]]],
    look: ['5.05'],
    e: [
      ({ ri, pick }) => { const v = pick(V), s = ri(1, 15), b = ri(2, 12), k = ri(0, 2); return { q: `Solve in your head: ${eq([`${v} + ${b} = ${s + b}`, `${v} - ${b} = ${s}`, `${b}${v} = ${b * s}`][k])}`, a: eq(`${v} = ${k === 1 ? s + b : s}`) }; },
      ({ ri, pick }) => { const v = pick(V), s = ri(2, 12), d = ri(2, 6); return { q: `Solve in your head: ${F(i_(v), d)} = ${s}`, a: eq(`${v} = ${s * d}`) }; },
      ({ ri, pick }) => { const v = pick(V), a = ri(2, 6), s = ri(1, 9), b = ri(1, 12), g = pick([s, s + 1, s - 1]); return g < 1 ? null : { q: `Is ${i_(v)} = ${g} a solution of ${eq(`${a}${v} + ${b} = ${a * s + b}`)}?`, a: g === s ? 'yes' : `no (it gives ${a * g + b})` }; },
    ],
    m: [
      ({ ri, pick }) => { const v = pick(V), a = ri(2, 6), s = ri(1, 9), b = ri(1, 12), g = pick([s, s, s + 1, s - 1]); if (g < 1) return null; const L = a * g + b, R = a * s + b; return { q: `Is ${i_(v)} = ${g} a solution of ${eq(`${a}${v} + ${b} = ${R}`)}? Show the check.`, w: [`${a} × ${g} + ${b} = ${L}`, L === R ? `yes: ${L} = ${R}` : `no: ${L} ≠ ${R}`] }; },
      ({ ri, pick }) => { const v = pick(V), a = ri(3, 9), s = ri(5, 15), b = ri(1, 20), R = a * s + b, g = s - ri(1, 3); return { q: `Solve ${eq(`${a}${v} + ${b} = ${R}`)}. Your first guess is ${g}. Is it too big or too small?`, w: [`${a} × ${g} + ${b} = ${a * g + b}: too small`, `${eq(`${v} = ${s}`)}`] }; },
      ({ ri, pick }) => { const v = pick(V), s = ri(3, 12); return { q: `Solve by guess and check: ${eq(`${v}^2 = ${s * s}`)}, where ${i_(v)} is positive.`, a: eq(`${v} = ${s}`) }; },
    ],
    c: [
      ({ ri, pick }) => { const v = pick(V), a = ri(3, 9), s = ri(5, 15), b = ri(1, 20), R = a * s + b, g1 = s - ri(2, 3), g2 = s + 1; return { q: `Guess, check and improve: ${eq(`${a}${v} + ${b} = ${R}`)}. Record each guess.`, w: [`try ${g1}: ${a * g1 + b} (too small)`, `try ${g2}: ${a * g2 + b} (too big)`, `try ${s}: ${R} ✓, ${eq(`${v} = ${s}`)}`] }; },
      ({ ri }) => { const s = ri(4, 15); return { q: `Two numbers that are next to each other add to ${2 * s + 1}. Find them by guess, check and improve.`, w: [`try ${s - 1} and ${s}: ${2 * s - 1}`, `${s} and ${s + 1}`] }; },
      ({ ri }) => { const s = ri(3, 9); return { q: `A number multiplied by itself, plus the number, is ${s * s + s}. Find the number.`, w: [`try ${s - 1}: ${(s - 1) * (s - 1) + s - 1}`, `try ${s}: ${s * s + s} ✓, the number is ${s}`] }; },
    ],
  },

  '5.11': {
    idea: 'To solve an equation, do the opposite operation to both sides: + undoes −, − undoes +, ÷ undoes ×, × undoes ÷. Check by substituting the answer.',
    ex: [[`Solve ${eq('x + 9 = 23')}.`, [`${eq('x + 9 - 9 = 23 - 9')}`, `${eq('x = 14')}`]], [`Solve ${eq('4m = 36')}.`, [`${eq('4m')} ÷ 4 = 36 ÷ 4`, `${eq('m = 9')}`]], [`Solve ${F(i_('p'), 5)} = 7.`, [`${F(i_('p'), 5)} × 5 = 7 × 5`, `${eq('p = 35')}`]]],
    look: ['5.10'],
    e: [
      ({ ri, pick }) => { const v = pick(V), s = ri(1, 30), b = ri(1, 20); return { q: `Solve ${eq(`${v} + ${b} = ${s + b}`)}.`, a: eq(`${v} = ${s}`) }; },
      ({ ri, pick }) => { const v = pick(V), s = ri(1, 30), b = ri(1, 20); return { q: `Solve ${eq(`${v} - ${b} = ${s}`)}.`, a: eq(`${v} = ${s + b}`) }; },
      ({ pick }) => { const [op, u] = pick([['+ 7', '− 7'], ['− 4', '+ 4'], ['× 3', '÷ 3'], ['÷ 5', '× 5']]); return { q: `What undoes ${op}?`, a: u }; },
    ],
    m: [
      ({ ri, pick }) => { const v = pick(V), s = ri(2, 12), b = ri(2, 9); return { q: `Solve ${eq(`${b}${v} = ${b * s}`)}.`, w: [`${eq(`${b}${v}`)} ÷ ${b} = ${b * s} ÷ ${b}`, eq(`${v} = ${s}`)] }; },
      ({ ri, pick }) => { const v = pick(V), s = ri(2, 12), b = ri(2, 9); return { q: `Solve ${F(i_(v), b)} = ${s}.`, w: [`${F(i_(v), b)} × ${b} = ${s} × ${b}`, eq(`${v} = ${b * s}`)] }; },
      ({ ri, pick }) => { const v = pick(V), s = ri(-15, -1), b = ri(2, 12); return { q: `Solve ${eq(`${v} + ${b} = ${s + b}`)}.`, w: [`${eq(`${v} = ${s + b} - ${b}`)}`, eq(`${v} = ${s}`)] }; },
    ],
    c: [
      ({ ri, pick }) => { const v = pick(V), b = ri(2, 9), c = ri(1, 30); return c % b === 0 ? null : { q: `Solve ${eq(`${b}${v} = ${c}`)}. Give the answer as a fraction or mixed numeral.`, w: [`${eq(v)} = ${c} ÷ ${b}`, `${eq(v)} = ${c > b ? F(c % b, b, Math.floor(c / b)) : F(c, b)}`] }; },
      ({ ri, pick }) => { const v = pick(V), s = ri(2, 9), b = ri(2, 9); return { q: `Solve ${eq(`${b}${v} = -${b * s}`)}.`, w: [`${eq(`${b}${v}`)} ÷ ${b} = −${b * s} ÷ ${b}`, eq(`${v} = -${s}`)] }; },
      ({ ri, pick }) => { const v = pick(V), s = ri(3, 20), b = ri(21, 60); return { q: `Solve ${eq(`${b} = ${v} + ${b - s}`)}.`, w: [eq(`${b} - ${b - s} = ${v}`), eq(`${v} = ${s}`)] }; },
      ({ ri, pick }) => { const v = pick(V), s = ri(2, 12), b = ri(2, 9), who = pick(NAMES); return { q: `${who} solved ${eq(`${b}${v} = ${b * s}`)} and got ${eq(`${v} = ${b * s - b}`)}. What went wrong? What is the answer?`, a: `Subtracted ${b} instead of dividing by ${b}. ${eq(`${v} = ${s}`)}.`, n: 2, key: `says ${ri(1, 2)}` }; },
    ],
  },

  '5.12': {
    idea: 'A two-step equation: undo the + or − first, then the × or ÷. Do the same to both sides each time, then check your answer.',
    ex: [[`Solve ${eq('3x + 5 = 26')}.`, [`${eq('3x = 26 - 5 = 21')}`, `${eq('x = 21')} ÷ 3 = 7`]], [`Solve ${eq('5m - 4 = 31')}.`, [`${eq('5m = 31 + 4 = 35')}`, `${eq('m')} = 35 ÷ 5 = 7`]], [`Solve ${eq('2(a + 3) = 18')}.`, [`${eq('a + 3')} = 18 ÷ 2 = 9`, `${eq('a = 9 - 3 = 6')}`]]],
    look: ['5.11'],
    e: [
      ({ ri, pick }) => { const v = pick(V), a = ri(2, 9), b = ri(1, 20), op = pick(['+', '-']); return { q: `What do you undo first in ${eq(`${a}${v} ${op} ${b} = ${ri(20, 60)}`)}?`, a: op === '+' ? `− ${b} from both sides` : `+ ${b} to both sides` }; },
      ({ ri, pick }) => { const v = pick(V), a = ri(2, 5), s = ri(1, 6), b = ri(1, 9); return { q: `Solve ${eq(`${a}${v} + ${b} = ${a * s + b}`)}.`, a: eq(`${v} = ${s}`) }; },
      ({ ri, pick }) => { const v = pick(V), a = ri(2, 6), s = ri(1, 9), b = ri(1, 12), g = pick([s, s + 1]); return { q: `Check: is ${i_(v)} = ${g} the solution of ${eq(`${a}${v} - ${b} = ${a * s - b}`)}?`, a: g === s ? 'yes' : 'no' }; },
    ],
    m: [
      ({ ri, pick }) => { const v = pick(V), a = ri(2, 9), s = ri(1, 12), b = ri(1, 20), op = pick(['+', '-']); const R = op === '+' ? a * s + b : a * s - b; return R <= 0 ? null : { q: `Solve ${eq(`${a}${v} ${op} ${b} = ${R}`)}.`, w: [`${eq(`${a}${v}`)} = ${R} ${op === '+' ? '−' : '+'} ${b} = ${a * s}`, `${eq(v)} = ${a * s} ÷ ${a} = ${s}`] }; },
      ({ ri, pick }) => { const v = pick(V), d = ri(2, 6), s = ri(2, 9), b = ri(1, 9); return { q: `Solve ${F(i_(v), d)} + ${b} = ${s + b}.`, w: [`${F(i_(v), d)} = ${s}`, `${eq(v)} = ${s} × ${d} = ${s * d}`] }; },
      ({ ri, pick }) => { const v = pick(V), a = ri(2, 6), s = ri(1, 12), b = ri(1, 9); return { q: `Solve ${eq(`${a}(${v} + ${b}) = ${a * (s + b)}`)}.`, w: [`${eq(`${v} + ${b}`)} = ${a * (s + b)} ÷ ${a} = ${s + b}`, `${eq(v)} = ${s + b} − ${b} = ${s}`] }; },
    ],
    c: [
      ({ ri, pick }) => { const v = pick(V), a = ri(2, 6), s = ri(-9, -1), b = ri(1, 12); return { q: `Solve ${eq(`${a}${v} + ${b} = ${a * s + b}`)}.`, w: [`${eq(`${a}${v}`)} = ${N(a * s + b)} − ${b} = ${N(a * s)}`, `${eq(v)} = ${N(a * s)} ÷ ${a} = ${N(s)}`] }; },
      ({ ri, pick }) => { const v = pick(V), a = ri(3, 9), b = ri(1, 20), R = ri(20, 60); return (R - b) % a === 0 ? null : { q: `Solve ${eq(`${a}${v} + ${b} = ${R}`)}. Give the answer as a mixed numeral.`, w: [`${eq(`${a}${v}`)} = ${R - b}`, `${eq(v)} = ${F((R - b) % a, a, Math.floor((R - b) / a))}`] }; },
      ({ ri, pick }) => { const v = pick(V), a = ri(2, 6), s = ri(1, 12), b = ri(1, 9); return { q: `Solve ${eq(`${a}(${v} - ${b}) = ${a * (s - b)}`)}.`, w: [`${eq(`${v} - ${b}`)} = ${N(s - b)}`, `${eq(v)} = ${N(s - b)} + ${b} = ${s}`] }; },
      ({ ri, pick }) => { const v = pick(V), a = ri(3, 6), s = ri(3, 9), b = ri(1, 9), who = pick(NAMES); return { q: `${who} solved ${eq(`${a}${v} + ${b} = ${a * s + b}`)} and got ${eq(`${v} = ${a * s - a}`)}. What went wrong?`, a: `${eq(`${a}${v} = ${a * s}`)} is right, but then divide by ${a}, do not subtract it: ${eq(`${v} = ${s}`)}.`, n: 2, key: `says ${ri(1, 2)}` }; },
    ],
  },

  '5.13': {
    idea: 'To solve a problem with an equation: choose a pronumeral for the unknown, write an equation from the words, solve it, then answer in a sentence.',
    ex: [['A number times 4, plus 7, is 43. Find the number.', [`${eq('4n + 7 = 43')}`, `${eq('4n = 36, n = 9')}`]], ['6 equal packs hold 72 pencils. How many pencils are in each pack?', [`${eq('6p = 72')}`, `${eq('p = 12')}: 12 pencils`]], ['Two angles of a triangle are 50° and 65°. Find the third angle.', [`${eq('50 + 65 + x = 180')}`, `${eq('x = 65')}: 65°`]]],
    look: ['5.12', '5.04'],
    e: [
      ({ ri }, i) => { const s = ri(3, 20), b = ri(2, 9); const [q, e] = [[`A number plus ${b} is ${s + b}.`, `n + ${b} = ${s + b}`], [`${b} times a number is ${b * s}.`, `${b}n = ${b * s}`], [`A number minus ${b} is ${s}.`, `n - ${b} = ${s}`], [`A number divided by ${b} is ${s}.`, `n ÷ ${b} = ${s}`]][i % 4]; return { q: `Write an equation: ${q}`, a: eq(e) }; },
      ({ ri }, i) => { const s = ri(3, 20), b = ri(2, 9); const [q, n] = [[`A number plus ${b} is ${s + b}.`, s], [`${b} times a number is ${b * s}.`, s], [`A number minus ${b} is ${s}.`, s + b]][i % 3]; return { q: `${q} What is the number?`, a: N(n) }; },
    ],
    m: [
      ({ ri }, i) => { const s = ri(3, 20), b = ri(2, 9); const [q, e] = [[`Double a number, plus ${b}, is ${2 * s + b}.`, `2n + ${b} = ${2 * s + b}`], [`Three times a number, minus ${b}, is ${3 * s - b}.`, `3n - ${b} = ${3 * s - b}`], [`A number is multiplied by 5, then ${b} is added. The answer is ${5 * s + b}.`, `5n + ${b} = ${5 * s + b}`]][i % 3]; return { q: `${q} Write an equation and find the number.`, w: [eq(e), eq(`n = ${s}`)] }; },
      ({ ri }) => { const c = ri(3, 12), s = ri(4, 30); return { q: `${c} equal packs hold ${c * s} pencils. How many pencils are in each pack?`, w: [eq(`${c}p = ${c * s}`), `${eq(`p = ${s}`)}: ${s} pencils`] }; },
      ({ ri }) => { const a = ri(20, 75), b = ri(20, 75); return a + b >= 170 ? null : { q: `Two angles of a triangle are ${a}° and ${b}°. Write an equation and find the third angle.`, w: [eq(`${a} + ${b} + x = 180`), `${eq(`x = ${180 - a - b}`)}: ${180 - a - b}°`] }; },
    ],
    c: [
      ({ ri }) => { const c = ri(4, 12) * 5, s = ri(20, 60), h = ri(2, 6); return { q: `A plumber charges $${c} to call, plus $${s} an hour. The bill is $${c + s * h}. How many hours did the plumber work?`, w: [eq(`${c} + ${s}h = ${c + s * h}`), eq(`${s}h = ${s * h}`), `${eq(`h = ${h}`)}: ${h} hours`] }; },
      ({ ri }) => { const w = ri(3, 15), extra = ri(2, 8), P = 2 * (w + extra) + 2 * w; return { q: `A rectangle is ${extra} cm longer than it is wide. Its perimeter is ${P} cm. Find its width.`, w: [eq(`w + w + ${extra} + w + w + ${extra} = ${P}`), eq(`4w + ${2 * extra} = ${P}`), `${eq(`w = ${w}`)}: ${w} cm`] }; },
      ({ ri, pick }) => { const a = ri(5, 15), d = ri(2, 8), who = pick(NAMES); return { q: `${who} is ${d} years older than Sam. Their ages add to ${2 * a + d}. How old is Sam?`, w: [eq(`s + s + ${d} = ${2 * a + d}`), eq(`2s = ${2 * a}`), `${eq(`s = ${a}`)}: Sam is ${a}`] }; },
      ({ ri }) => { const n = ri(5, 20); return { q: `Three numbers in a row add to ${3 * n + 3}. Find them.`, w: [eq(`n + n + 1 + n + 2 = ${3 * n + 3}`), eq(`3n + 3 = ${3 * n + 3}, n = ${n}`), `${n}, ${n + 1}, ${n + 2}`] }; },
    ],
  },
};
