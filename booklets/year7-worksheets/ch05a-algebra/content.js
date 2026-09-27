// Worksheet questions for Chapter 5A Algebra (lib/worksheet.js). See ../ch01-integers/content.js for the format.
const { al, alw, term, expr, collect, mulVars } = require('../../lib/algebra');
const { F, fmt } = require('../../lib/calc');

const V = ['a', 'b', 'c', 'm', 'n', 'p', 'x', 'y', 'k', 't'];
const two = (pick) => { const a = pick(V); let b; do b = pick(V); while (b === a); return [a, b].sort(); };
const N = (v) => fmt(v);

module.exports = {
  '5.01': ({ ri, pick }) => [
    [{ text: 'Multiply the friendly pair first (they make 10 or 100), then the other number.', gen: () => { const [p, q] = pick([[25, 4], [5, 2], [50, 2], [20, 5], [4, 25], [2, 50]]), m = ri(3, 29); return { q: pick([`${p} × ${m} × ${q}`, `${m} × ${p} × ${q}`]), a: N(p * q * m) }; } },
      { text: 'Add the friendly pair first (they make a multiple of 10).', gen: () => { const a = ri(11, 89), c = 10 * ri(1, 5) - (a % 10) || 10, b = ri(11, 89); return { q: `${a} + ${b} + ${c}`, a: N(a + b + c) }; } }],
    [{ text: 'Rearrange so the friendly numbers are together, then evaluate.', gen: () => { const [p, q] = pick([[25, 4], [5, 2], [50, 2], [20, 5], [125, 8]]), m = ri(3, 19); return { q: `${p} × ${m} × ${q}`, a: N(p * q * m), lines: [`= ${p} × ${q} × ${m}`, `= ${p * q} × ${m}`, `= ${N(p * q * m)}`] }; } }],
    [{ text: 'Use the commutative and associative laws to evaluate in your head. Show the order you used.', gen: () => { const [p, q] = pick([[25, 4], [5, 2], [50, 2], [20, 5]]), m = ri(3, 19), n = ri(2, 9); return { q: `${p} × ${m} × ${n} × ${q}`, a: N(p * q * m * n), lines: [`= (${p} × ${q}) × (${m} × ${n})`, `= ${p * q} × ${m * n}`, `= ${N(p * q * m * n)}`] }; } }],
  ],
  '5.02': ({ ri, pick }) => [
    [{ text: 'Split the bigger number into tens and ones, then multiply each part.', gen: () => { const a = ri(3, 9), b = ri(12, 49); return b % 10 === 0 ? { q: '' } : { q: `${a} × ${b}`, a: N(a * b) }; } }],
    [{ text: 'Use a near ten: 9 × 34 = 10 × 34 − 1 × 34.', gen: () => { const a = pick([9, 19, 29, 99, 11, 21]), b = ri(12, 60); const t = Math.round(a / 10) * 10, d = t - a; return { q: `${a} × ${b}`, a: N(a * b), lines: [`= ${t} × ${b} ${d > 0 ? '−' : '+'} ${Math.abs(d)} × ${b}`, `= ${N(t * b)} ${d > 0 ? '−' : '+'} ${N(Math.abs(d) * b)}`, `= ${N(a * b)}`] }; } }],
    [{ text: 'Expand the brackets: multiply each term inside by the number outside.', gen: () => { const a = ri(2, 9), v = pick(V), b = ri(1, 12), op = pick(['+', '−']); return { q: al(`${a}(${v} ${op} ${b})`), a: al(`${a}${v} ${op} ${a * b}`), lines: [`= ${a} × ${v} ${op} ${a} × ${b}`, `= ${al(`${a}${v}`)} ${op} ${a * b}`] }; } }],
  ],
  '5.03': ({ ri, pick }) => [
    [{ text: 'Simplify: write the number first, then the letters in alphabetical order.', gen: () => { const [a, b] = two(pick), c = ri(2, 12), k = ri(0, 2); return { q: [`${b} × ${c}`, `${b} × ${a} × ${c}`, `${a} × ${a}`][k].replace(/([a-z])/g, '<i>$1</i>'), a: al([`${c}${b}`, `${c}${a}${b}`, `${a}^2`][k]) }; } }],
    [{ text: 'Write in expanded form (with × signs), then simplify another way round.', gen: () => { const [a, b] = two(pick), c = ri(2, 9); return { q: al(`${c}${a}${b}`), a: `${c} × <i>${a}</i> × <i>${b}</i>`, lines: [`= ${c} × <i>${a}</i> × <i>${b}</i>`, `= ${al(`${c}${b}${a}`)} (also correct)`] }; } }],
    [{ text: 'Simplify. Use index notation for repeated letters.', gen: () => { const [a, b] = two(pick), c = ri(2, 9), d = ri(2, 5); return { q: [`${c} × ${a} × ${b} × ${a} × ${d}`].map((x) => x.replace(/([a-z])/g, '<i>$1</i>'))[0], a: al(`${c * d}${a}^2${b}`), lines: [`= ${c} × ${d} × <i>${a}</i> × <i>${a}</i> × <i>${b}</i>`, `= ${al(`${c * d}${a}^2${b}`)}`] }; } }],
  ],
  '5.04': ({ ri, pick }) => {
    const E = [['{n} more than {x}', '{x} + {n}'], ['{n} less than {x}', '{x} - {n}'], ['{n} times {x}', '{n}{x}'], ['{x} divided by {n}', '{x}/{n}'], ['the sum of {x} and {n}', '{x} + {n}'], ['double {x}', '2{x}'], ['{x} squared', '{x}^2'], ['{x} decreased by {n}', '{x} - {n}']];
    const M = [['{n} less than twice {x}', '2{x} - {n}'], ['{n} more than {m} times {x}', '{m}{x} + {n}'], ['{m} times {x}, take away {n}', '{m}{x} - {n}'], ['{x} squared, plus {n}', '{x}^2 + {n}'], ['{n} less than the product of {x} and {y}', '{x}{y} - {n}']];
    const fill = (t, x, y, n, m) => t.replace(/\{x\}/g, x).replace(/\{y\}/g, y).replace(/\{n\}/g, n).replace(/\{m\}/g, m);
    const show = (t) => (t.includes('/') ? F(al(t.split('/')[0]), t.split('/')[1]) : al(t));
    return [
      [{ text: 'Write an expression for each description.', gen: (i) => { const [t, a] = E[i % E.length], [x, y] = two(pick), n = ri(2, 12); return { q: alw(fill(t, x, y, n, 0)), a: show(fill(a, x, y, n, 0)) }; } }],
      [{ text: 'Write an expression. Do the first operation, then the second.', gen: (i) => { const [t, a] = M[i % M.length], [x, y] = two(pick), n = ri(2, 12), m = ri(3, 9); const e = fill(a, x, y, n, m); return { q: alw(fill(t, x, y, n, m)), a: show(e), lines: [`first: ${al(e.split(/ [+-] /)[0])}`, `= ${show(e)}`] }; } }],
      [{ text: 'Write an expression for each amount. Say what the letter stands for.', kinds: 3, gen: (i) => { const n = pick(V), c = ri(2, 15); return [
        { q: `the cost of <i>${n}</i> pens at $${c} each, plus $${c + 3} for a folder`, a: al(`${c}${n} + ${c + 3}`) + ' dollars', lines: [`${n} = number of pens`, `cost = ${al(`${c}${n} + ${c + 3}`)} dollars`] },
        { q: `the number of legs on <i>${n}</i> spiders and ${c} birds`, a: al(`8${n} + ${2 * c}`), lines: [`${n} = number of spiders`, `legs = ${al(`8${n}`)} + 2 × ${c} = ${al(`8${n} + ${2 * c}`)}`] },
        { q: `$${c * 10} shared equally by <i>${n}</i> people`, a: F(`${c * 10}`, al(n)) + ' dollars each', lines: [`${n} = number of people`, `each gets ${F(`${c * 10}`, al(n))} dollars`] },
      ][i % 3]; } }],
    ];
  },
  '5.05': ({ ri, nz, pick }) => [
    [{ text: 'Substitute the value, then evaluate.', gen: () => { const v = pick(['x', 'a', 'n', 'p']), k = ri(2, 12), c = ri(2, 9), f = ri(0, 2); const e = [`${c}${v}`, `${v} + ${c}`, `${c}${v} + 1`][f]; const val = [c * k, k + c, c * k + 1][f]; return { q: `${al(e)}, <i>${v}</i> = ${k}`, a: N(val) }; } }],
    [{ text: 'Substitute the values given. Write the numbers in first, then evaluate.', gen: (i) => { const a = ri(2, 9), b = ri(2, 9); const E = [['ab', a * b, `${a} × ${b}`], ['2a + b', 2 * a + b, `2 × ${a} + ${b}`], ['3b − a', 3 * b - a, `3 × ${b} − ${a}`], ['a + 2b', a + 2 * b, `${a} + 2 × ${b}`], ['5a − b', 5 * a - b, `5 × ${a} − ${b}`], ['b^2', b * b, `${b} × ${b}`], ['a^2 + b', a * a + b, `${a} × ${a} + ${b}`], ['4(a + b)', 4 * (a + b), `4 × (${a} + ${b})`]][i % 8]; if (E[1] < 0) return { q: '' }; return { q: `${al(E[0])}, <i>a</i> = ${a}, <i>b</i> = ${b}`, a: N(E[1]), lines: [`= ${E[2]}`, `= ${N(E[1])}`] }; } }],
    [{ text: 'Substitute into the formula. Write the formula, then the numbers, then the answer.', kinds: 3, gen: (i) => { const a = ri(3, 15), b = ri(2, 12); return [
      { q: `Find A when A = lw, l = ${a}, w = ${b}.`, a: `A = ${a * b}`, lines: [`A = lw`, `A = ${a} × ${b}`, `A = ${a * b}`] },
      { q: `Find P when P = 2l + 2w, l = ${a}, w = ${b}.`, a: `P = ${2 * a + 2 * b}`, lines: [`P = 2l + 2w`, `P = 2 × ${a} + 2 × ${b}`, `P = ${2 * a + 2 * b}`] },
      { q: `A plumber charges C = 30h + 19 dollars. Find C when h = ${b}.`, a: `C = $${30 * b + 19}`, lines: [`C = 30h + 19`, `C = 30 × ${b} + 19`, `C = $${30 * b + 19}`] },
    ][i % 3]; } }],
  ],
  '5.07': ({ ri, pick }) => [
    [{ text: 'Add or subtract like terms: work with the numbers, keep the letters.', gen: () => { const v = pick(V), a = ri(2, 12), b = ri(1, 11), op = pick(['+', '-']); if (op === '-' && b >= a) return { q: '' }; return { q: al(`${a}${v} ${op} ${term(b, v)}`), a: al(term(op === '+' ? a + b : a - b, v)) }; } }],
    [{ text: 'Group the like terms, then simplify.', gen: () => { const [a, b] = two(pick), t = [[ri(2, 9), a], [ri(2, 9), b], [ri(1, 9), a], [ri(1, 9) * pick([1, -1]), b]]; const c = collect(t); if (c.some(([k]) => k === 0)) return { q: '' }; return { q: al(expr(t)), a: al(expr(c)), lines: [`= ${al(expr([t[0], t[2], t[1], t[3]]))}`, `= ${al(expr(c))}`] }; } }],
    [{ text: 'Simplify. Like terms have exactly the same letters and powers.', gen: () => { const [a, b] = two(pick), ab = a + b; const t = [[ri(2, 9), ab], [ri(2, 9), `${a}^2`], [-ri(1, 9), ab], [ri(1, 9), `${a}^2`], [ri(1, 9), '']]; const c = collect(t); if (c.some(([k]) => k === 0)) return { q: '' }; return { q: al(expr(t)), a: al(expr(c)), lines: [`= ${al(expr([t[0], t[2], t[1], t[3], t[4]]))}`, `= ${al(expr(c))}`] }; } }],
  ],
  '5.08': ({ ri, pick }) => [
    [{ text: 'Multiply the numbers, then write the letters.', gen: () => { const [a, b] = two(pick), c = ri(2, 9), d = ri(2, 9); return pick([0, 1]) ? { q: al(`${c} × ${d}${a}`), a: al(`${c * d}${a}`) } : { q: al(`${c}${a} × ${d}${b}`), a: al(`${c * d}${a}${b}`) }; } }],
    [{ text: 'Multiply the numbers, then the letters. Use index notation.', gen: () => { const [a, b] = two(pick), c = ri(2, 6), d = ri(2, 6), p = pick([a, `${a}${b}`]), q = pick([a, b, `${a}${b}`]); return { q: al(`${c}${p} × ${d}${q}`), a: al(`${c * d}${mulVars(p, q)}`), lines: [`= ${c} × ${d} × ${al(p)} × ${al(q)}`, `= ${al(`${c * d}${mulVars(p, q)}`)}`] }; } }],
    [{ text: 'Multiply. Work out the sign first: same signs positive, different signs negative.', gen: () => { const [a, b] = two(pick), c = ri(2, 6) * pick([1, -1]), d = ri(2, 6) * pick([1, -1]), e = ri(2, 3); const q = `${al(term(c, a))} × ${d < 0 ? `(${al(term(d, b))})` : al(term(d, b))} × ${e}${al(a)}`; return { q, a: al(term(c * d * e, mulVars(a, b, a))), lines: [`sign: ${c * d > 0 ? '+' : '−'}; numbers: ${Math.abs(c)} × ${Math.abs(d)} × ${e} = ${Math.abs(c * d * e)}`, `letters: ${al(mulVars(a, b, a))}`, `= ${al(term(c * d * e, mulVars(a, b, a)))}`] }; } }],
  ],
  '5.09': ({ ri, pick }) => [
    [{ text: 'Divide the numbers. Keep the letter.', gen: () => { const v = pick(V), q = ri(2, 9), d = ri(2, 9); return { q: al(`${q * d}${v} ÷ ${d}`), a: al(`${q}${v}`) }; } }],
    [{ text: 'Write as a fraction, then cancel numbers and letters.', gen: () => { const [a, b] = two(pick), q = ri(2, 9), d = ri(2, 6), dv = pick([a, b]), qv = pick([a, b, '']); if (qv === dv) return { q: '' }; return { q: al(`${q * d}${mulVars(qv, dv)} ÷ ${d}${dv}`), a: al(`${q}${qv}`), lines: [`= ${F(al(`${q * d}${mulVars(qv, dv)}`), al(`${d}${dv}`))}`, `= ${al(`${q}${qv}`) || q}`] }; } }],
    [{ text: 'Simplify the fraction. Cancel the numbers, then the letters (a² ÷ a = a).', gen: () => { const [a, b] = two(pick), q = ri(2, 9), d = ri(2, 6); return { q: F(al(`${q * d}${a}^2${b}`), al(`${d}${a}${b}`)), a: al(`${q}${a}`), lines: [`numbers: ${q * d} ÷ ${d} = ${q}`, `letters: ${al(`${a}^2${b}`)} ÷ ${al(`${a}${b}`)} = <i>${a}</i>`, `= ${al(`${q}${a}`)}`] }; } }],
  ],
};
