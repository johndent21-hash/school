// Skill drill pages for Chapter 5A Algebra: page 1 practises the Easy basics, page 2 the Medium basics (lib/drill.js).
const { al, alw, term, expr, collect, mulVars } = require('../../lib/algebra');
const { F } = require('../../lib/calc');

const V = ['a', 'b', 'c', 'm', 'n', 'p', 'x', 'y', 'k', 't'];
const two = (pick) => { const a = pick(V); let b; do b = pick(V); while (b === a); return [a, b].sort(); };

module.exports = {
  '5.01': ({ round, ri, pick, list }) => ({
    easy: [
      round('evaluate mentally. Pair the friendly numbers first.', 20, () => { const [p, q] = pick([[25, 4], [5, 2], [50, 2], [20, 5], [4, 5], [2, 50], [125, 8]]), m = ri(3, 49); const xs = pick([[p, m, q], [m, p, q], [p, q, m]]); return [xs.join(' × '), p * q * m]; }),
      round('true or false?', 16, () => { const a = ri(2, 30), b = ri(2, 30); if (a === b) return ['', '']; const k = ri(0, 3); return [[`${a} + ${b} = ${b} + ${a}`, `${a} × ${b} = ${b} × ${a}`, `${a} − ${b} = ${b} − ${a}`, `${a * b} ÷ ${b} = ${b} ÷ ${a * b}`][k], k < 2 ? 'true' : 'false']; }),
    ],
    medium: [
      round('evaluate mentally. Rearrange to make tens first.', 20, () => { const a = ri(11, 89), b = ri(11, 89), c = (10 - (a % 10)) % 10 + 10 * ri(0, 3); return c === 0 ? ['', ''] : [`${a} + ${b} + ${c}`, a + b + c]; }),
      list('which law is shown? Write commutative, associative or neither.', [
        ['(3 + 4) + 5 = 3 + (4 + 5)', 'associative'], ['8 × 7 = 7 × 8', 'commutative'], ['12 − 5 ≠ 5 − 12', 'neither'], ['(2 × 6) × 5 = 2 × (6 × 5)', 'associative'],
        ['9 + 14 = 14 + 9', 'commutative'], [al('a + b = b + a'), 'commutative'], [al('ab = ba'), 'commutative'], [al('(a + b) + c = a + (b + c)'), 'associative'], ['(20 ÷ 4) ÷ 5 ≠ 20 ÷ (4 ÷ 5)', 'neither'],
        [al('(xy)z = x(yz)'), 'associative'], ['6 × 3 × 5 = 6 × 5 × 3', 'commutative'], ['15 − 6 − 2 ≠ 15 − (6 − 2)', 'neither']], { cols: 2 }),
    ],
  }),
  '5.02': ({ round, ri, pick }) => ({
    easy: [
      round('evaluate by splitting the number: 6 × 23 = 6 × 20 + 6 × 3.', 20, () => { const a = ri(3, 9), b = ri(12, 99); return b % 10 === 0 ? ['', ''] : [`${a} × ${b}`, a * b]; }),
      round('evaluate using a near ten: 9 × 34 = 10 × 34 − 34.', 16, () => { const a = pick([9, 19, 29, 99, 11, 21]), b = ri(12, 60); return [`${a} × ${b}`, a * b]; }),
    ],
    medium: [
      round('fill in the missing number.', 16, () => { const a = ri(3, 9), t = ri(2, 9) * 10, u = ri(1, 3); return ri(0, 1) ? [`${a} × ${t - u} = ${a} × ${t} − ${a} × ☐`, u] : [`${a} × ${t + u} = ${a} × ☐ + ${a} × ${u}`, t]; }, { cols: 2 }),
      round('expand the brackets.', 16, () => { const a = ri(2, 9), v = pick(V), b = ri(1, 12), op = pick(['+', '-']); return [al(`${a}(${v} ${op} ${b})`), al(`${a}${v} ${op} ${a * b}`)]; }),
    ],
  }),
  '5.03': ({ round, ri, pick }) => ({
    easy: [
      round('simplify. Write the number first, then the letters in alphabetical order.', 24, () => { const k = ri(0, 3), [a, b] = two(pick), c = ri(2, 12); return [[`${c} × ${a}`, `${a} × ${c}`, `${b} × ${a} × ${c}`, `${a} × ${a}`][k].replace(/[a-z]/g, (x) => `<i>${x}</i>`), al([`${c}${a}`, `${c}${a}`, `${c}${a}${b}`, `${a}^2`][k])]; }),
      round('write in expanded form (with × signs).', 16, () => { const [a, b] = two(pick), c = ri(2, 12); return ri(0, 1) ? [al(`${c}${a}${b}`), al(`${c} × ${a} × ${b}`).replace(/<i>×<\/i>/g, '×')] : [al(`${c}${a}`), `${c} × <i>${a}</i>`]; }),
    ],
    medium: [
      round('simplify.', 20, () => { const [a, b] = two(pick), c = ri(2, 9), k = ri(0, 3); return [[`${a} ÷ ${c}`, `${c} × ${a} × ${a} × ${b}`, `${a} × ${b} × ${b}`, `${b} × ${c} × ${a} × ${a} × ${a}`][k].replace(/([a-z])/g, '<i>$1</i>'), [F(al(a), c), al(`${c}${a}^2${b}`), al(`${a}${b}^2`), al(`${c}${a}^3${b}`)][k]]; }),
      round('write in expanded form.', 15, () => { const [a, b] = two(pick), c = ri(2, 9), p = ri(2, 3); return [al(`${c}${a}^${p}${b}`), [c, ...Array(p).fill(`<i>${a}</i>`), `<i>${b}</i>`].join(' × ')]; }, { cols: 3 }),
    ],
  }),
  '5.04': ({ round, ri, pick }) => {
    const w = (s) => alw(s);
    const E = [['{n} more than {x}', '{x} + {n}'], ['{n} less than {x}', '{x} - {n}'], ['{x} increased by {n}', '{x} + {n}'], ['{x} decreased by {n}', '{x} - {n}'], ['{n} times {x}', '{n}{x}'],
      ['{x} divided by {n}', '{x}/{n}'], ['the sum of {x} and {n}', '{x} + {n}'], ['the product of {n} and {x}', '{n}{x}'], ['{x} squared', '{x}^2'], ['double {x}', '2{x}'], ['half of {x}', '{x}/2'], ['{x} minus {n}', '{x} - {n}']];
    const M = [['{n} less than twice {x}', '2{x} - {n}'], ['{n} more than {m} times {x}', '{m}{x} + {n}'], ['twice the sum of {x} and {n}', '2({x} + {n})'], ['the sum of {x} and {y}, divided by {n}', '({x} + {y})/{n}'],
      ['{m} times {x}, take away {n}', '{m}{x} - {n}'], ['{x} squared, plus {n}', '{x}^2 + {n}'], ['the product of {x} and {y}, plus {n}', '{x}{y} + {n}'], ['{n} less than the product of {x} and {y}', '{x}{y} - {n}']];
    const fill = (s, x, y, n, m) => s.replace(/\{x\}/g, x).replace(/\{y\}/g, y).replace(/\{n\}/g, n).replace(/\{m\}/g, m);
    const show = (s) => (s.includes('/') ? (() => { const [p, q] = s.split('/'); return F(al(p.replace(/[()]/g, '')), q); })() : al(s));
    return {
      easy: [
        round('write an expression.', 21, () => { const [t, a] = pick(E), [x, y] = two(pick), n = ri(2, 12); return [w(fill(t, x, y, n, 0)), show(fill(a, x, y, n, 0))]; }, { cols: 3 }),
        round('write an expression. Use <i>n</i> for "the number".', 15, () => { const k = ri(0, 5), c = ri(2, 12); return [[`the number plus ${c}`, `${c} times the number`, `the number minus ${c}`, `the number divided by ${c}`, `${c} more than the number`, `the number times itself`][k], [al(`n + ${c}`), al(`${c}n`), al(`n - ${c}`), F(al('n'), c), al(`n + ${c}`), al('n^2')][k]]; }, { cols: 3 }),
      ],
      medium: [
        round('write an expression.', 15, () => { const [t, a] = pick(M), [x, y] = two(pick), n = ri(2, 12), m = ri(3, 9); return [w(fill(t, x, y, n, m)), show(fill(a, x, y, n, m))]; }, { cols: 3 }),
        round('write an expression for each amount.', 12, () => { const k = ri(0, 3), n = pick(V), c = ri(2, 15); return [[`the cost of ${n} pens at $${c} each`, `the number of legs on ${n} spiders`, `$${c * 10} shared equally by ${n} people`, `${n} minutes plus ${c} minutes`][k].replace(new RegExp(`\\b${n}\\b`), `<i>${n}</i>`), [al(`${c}${n}`) + ' dollars', al(`8${n}`), F(`${c * 10}`, al(n)), al(`${n} + ${c}`) + ' minutes'][k]]; }, { cols: 2 }),
      ],
    };
  },
  '5.05': ({ round, ri, pick, N }) => ({
    easy: [
      round('substitute, then evaluate.', 24, () => { const v = pick(['x', 'a', 'n', 'p']), k = ri(2, 12), c = ri(2, 9), f = ri(0, 3); const e = [`${c}${v}`, `${v} + ${c}`, `${v} - ${c}`, `${c}${v} + ${ri(1, 9)}`][f]; const val = Function(v, `return ${e.replace(/(\d)([a-z])/g, '$1*$2')}`)(k); return [`${al(e)}, when <i>${v}</i> = ${k}`, N(val)]; }, { cols: 3 }),
      round('if a = 4 and b = 7, evaluate.', 12, () => { const e = pick(['a + b', 'ab', '2a + b', 'b - a', '3b', 'a + 2b', '5a - b', 'ab - 10', '2ab', '10 - a', 'a + b + 9', '4b - 3a', 'b^2', 'a^2 + 1']); const v = Function('a', 'b', `return ${e.replace(/\^2/g, '**2').replace(/(\d)([ab])/g, '$1*$2').replace(/ab/g, 'a*b')}`)(4, 7); return [al(e), N(v)]; }, { cols: 4 }),
    ],
    medium: [
      round('substitute, then evaluate. Take care with negatives.', 16, () => { const x = ri(-6, 6); if (!x) return ['', '']; const e = pick(['3x', 'x + 8', 'x^2', '2x - 5', '10 - x', 'x^2 + x', '4 - 2x', '5x + 1']); const v = Function('x', `return ${e.replace(/\^2/g, '**2').replace(/(\d)x/g, '$1*x')}`)(x); return [`${al(e)}, <i>x</i> = ${N(x)}`, N(v)]; }),
      round('substitute into the formula.', 12, () => { const k = ri(0, 3), a = ri(2, 15), b = ri(2, 12); return [[`${al('A = lw')}, <i>l</i> = ${a}, <i>w</i> = ${b}`, `${al('P = 2l + 2w')}, <i>l</i> = ${a}, <i>w</i> = ${b}`, `${al('C = 30h + 19')}, <i>h</i> = ${b}`, `${al('s = d')} ÷ <i>t</i>, <i>d</i> = ${a * b}, <i>t</i> = ${b}`][k], `${['A', 'P', 'C', 's'][k]} = ${N([a * b, 2 * a + 2 * b, 30 * b + 19, a][k])}`]; }, { cols: 3 }),
    ],
  }),
  '5.07': ({ round, ri, pick }) => ({
    easy: [
      round('simplify by adding or subtracting like terms.', 24, () => { const v = pick(V), a = ri(1, 12), b = ri(1, 12), op = pick(['+', '-']); return [al(`${term(a, v)} ${op} ${term(b, v)}`), al(term(op === '+' ? a + b : a - b, v).replace(/^0.*/, '0'))]; }),
      round('like terms? Write yes or no.', 16, () => { const [a, b] = two(pick), k = ri(0, 3); const c = ri(2, 9), d = ri(2, 9); return [al([`${c}${a} and ${d}${a}`, `${c}${a} and ${d}${b}`, `${a}${b} and ${d}${b}${a}`, `${a}^2 and ${d}${a}`][k]), ['yes', 'no', 'yes', 'no'][k]]; }),
    ],
    medium: [
      round('simplify. Collect the like terms.', 16, () => { const [a, b] = two(pick), t = [[ri(1, 9), a], [ri(1, 9) * pick([1, -1]), b], [ri(1, 9) * pick([1, -1]), a]]; const q = ri(0, 1) ? [...t, [ri(1, 9), '']] : t; return [al(expr(q)), al(expr(collect(q)))]; }, { cols: 3 }),
      round('simplify.', 12, () => { const [a, b] = two(pick), ab = a + b; const q = [[ri(2, 9), ab], [ri(1, 9) * pick([1, -1]), `${a}^2`], [-ri(1, 9), ab], [ri(1, 9), `${a}^2`]]; return [al(expr(q)), al(expr(collect(q)))]; }, { cols: 3 }),
    ],
  }),
  '5.08': ({ round, ri, pick }) => ({
    easy: [
      round('simplify. Multiply the numbers, then the letters.', 24, () => { const [a, b] = two(pick), c = ri(2, 9), d = ri(2, 9); return ri(0, 1) ? [al(`${c} × ${d}${a}`), al(`${c * d}${a}`)] : [al(`${c}${a} × ${d}${b}`), al(`${c * d}${a}${b}`)]; }),
      round('simplify. Use index notation.', 16, () => { const [a, b] = two(pick), k = ri(0, 3); return [al([`${a} × ${a}`, `${a} × ${a} × ${a}`, `${a} × ${b} × ${a}`, `${a}${b} × ${b}`][k]), al([`${a}^2`, `${a}^3`, `${a}^2${b}`, `${a}${b}^2`][k])]; }),
    ],
    medium: [
      round('simplify.', 16, () => { const [a, b] = two(pick), c = ri(2, 6), d = ri(2, 6), p = pick([a, `${a}${b}`, b]), q = pick([a, `${a}${b}`, b]); return [al(`${c}${p} × ${d}${q}`), al(`${c * d}${mulVars(p, q)}`)]; }),
      round('simplify. Take care with the signs.', 16, () => { const [a, b] = two(pick), c = ri(1, 6) * pick([1, -1]), d = ri(2, 6) * pick([1, -1]); return [al(`${term(c, a)} × ${d < 0 ? `(${term(d, b)})` : term(d, b)}`), al(term(c * d, a + b))]; }),
    ],
  }),
  '5.09': ({ round, ri, pick }) => ({
    easy: [
      round('simplify.', 24, () => { const v = pick(V), q = ri(2, 9), d = ri(2, 9); return [al(`${q * d}${v} ÷ ${d}`), al(`${q}${v}`)]; }),
      round('simplify.', 16, () => { const [a, b] = two(pick), k = ri(0, 2); return [al([`${a}${b} ÷ ${a}`, `${a}${b} ÷ ${b}`, `${a}^2 ÷ ${a}`][k]), al([b, a, a][k])]; }),
    ],
    medium: [
      round('simplify.', 16, () => { const [a, b] = two(pick), q = ri(2, 9), d = ri(2, 6), qv = pick([a, b, `${a}${b}`]), dv = pick([a, b]); return [al(`${q * d}${mulVars(qv, dv)} ÷ ${d}${dv}`), al(`${q}${qv}`)]; }),
      round('simplify the fraction.', 16, () => { const [a, b] = two(pick), q = ri(2, 9), d = ri(2, 6), qv = pick([a, b, '']), dv = pick([a, b]); return [F(al(`${q * d}${mulVars(qv, dv)}`), al(`${d}${dv}`)), al(`${q}${qv}`)]; }),
    ],
  }),
};
