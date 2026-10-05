// Chapter 5A Algebra: mixed-practice questions (lib/mixed.js). Every question stands on its own.
const { al, alw, term, expr, collect, mulVars } = require('../../lib/algebra');
const { F, fmt } = require('../../lib/calc');

const V = ['a', 'b', 'c', 'm', 'n', 'p', 'x', 'y', 'k', 't'];
const two = (pick) => { const a = pick(V); let b; do b = pick(V); while (b === a); return [a, b].sort(); };
const N = (v) => fmt(v);
const i_ = (v) => `<i>${v}</i>`;
const NAMES = ['Ali', 'Mia', 'Zac', 'Lena', 'Kai', 'Ruby', 'Tom', 'Priya', 'Jack', 'Aisha', 'Noah', 'Chloe'];
const B = (v) => (v < 0 ? `(${N(v)})` : N(v));

module.exports = {
  '5.01': {
    idea: 'You can add or multiply numbers in any order (the commutative law) and group them any way (the associative law). So pair up friendly numbers first: 25 × 4 = 100.',
    ex: [['25 × 17 × 4', ['= 25 × 4 × 17', '= 100 × 17 = 1 700']], ['38 + 47 + 62', ['= 38 + 62 + 47', '= 100 + 47 = 147']], ['Is 20 − 8 the same as 8 − 20?', ['20 − 8 = 12, 8 − 20 = −12', 'no: subtraction is not commutative']]],
    e: [
      ({ ri, pick }) => { const [p, q] = pick([[25, 4], [5, 2], [50, 2], [20, 5], [4, 25], [2, 50]]), m = ri(3, 29); return { q: pick([`${p} × ${m} × ${q}`, `${m} × ${p} × ${q}`]), a: N(p * q * m) }; },
      ({ ri }) => { const a = ri(11, 89), b = ri(11, 89), c = Math.ceil(a / 10) * 10 - a || 10; return { q: `${a} + ${b} + ${c}`, a: N(a + b + c) }; },
      ({ ri }) => { const a = ri(3, 12), b = ri(3, 12); return a === b ? null : { q: `Write ${a} × ${b} another way. Is the answer the same?`, a: `${b} × ${a}; yes, both are ${a * b}` }; },
    ],
    m: [
      ({ ri, pick }) => { const [p, q] = pick([[25, 4], [5, 2], [50, 2], [20, 5], [125, 8]]), m = ri(3, 19); return { q: `${p} × ${m} × ${q}`, w: [`= ${p} × ${q} × ${m}`, `= ${p * q} × ${m}`, `= ${N(p * q * m)}`] }; },
      ({ ri }) => { const a = ri(11, 49), c = 100 - a, b = ri(11, 89), d = ri(11, 89); return { q: `${a} + ${b} + ${c} + ${d}`, w: [`= ${a} + ${c} + ${b} + ${d}`, `= 100 + ${b + d}`, `= ${100 + b + d}`] }; },
      ({ pick }) => { const [q, a] = pick([['Is 12 ÷ 4 the same as 4 ÷ 12?', 'No: 3 and ⅓. Division is not commutative.'], ['Is (8 + 5) + 2 the same as 8 + (5 + 2)?', 'Yes: both are 15 (associative law).'], ['Is (24 ÷ 4) ÷ 2 the same as 24 ÷ (4 ÷ 2)?', 'No: 3 and 12. Division is not associative.'], ['Is 7 × 6 the same as 6 × 7?', 'Yes: both are 42 (commutative law).'], ['Is (10 − 4) − 3 the same as 10 − (4 − 3)?', 'No: 3 and 9.']]); return { q, a, n: 2, key: q }; },
    ],
    c: [
      ({ ri, pick }) => { const [p, q] = pick([[25, 4], [5, 2], [50, 2], [20, 5]]), m = ri(3, 19), n = ri(2, 9); return { q: `${p} × ${m} × ${n} × ${q}`, w: [`= (${p} × ${q}) × (${m} × ${n})`, `= ${p * q} × ${m * n}`, `= ${N(p * q * m * n)}`] }; },
      ({ pick }) => { const [q, a] = pick([['Which law: (5 × 2) × 7 = 5 × (2 × 7)?', 'associative law'], ['Which law: 9 + 13 = 13 + 9?', 'commutative law'], ['Which law: 4 × 15 = 15 × 4?', 'commutative law'], ['Which law: (6 + 8) + 2 = 6 + (8 + 2)?', 'associative law']]); return { q, a, key: q }; },
      ({ ri }) => { const a = ri(2, 8) * 5, b = ri(11, 49), c = 2; return a % 10 === 0 ? null : { q: `Evaluate ${a} × ${b} × ${c} in your head. Show the order you used.`, w: [`= ${a} × ${c} × ${b}`, `= ${a * c} × ${b} = ${N(a * b * c)}`] }; },
      ({ ri }) => { const a = ri(101, 199), b = 200 - a, c = ri(31, 89), d = 100 - c; return { q: `${a} + ${c} + ${b} + ${d}`, w: [`= (${a} + ${b}) + (${c} + ${d})`, `= 200 + 100 = 300`] }; },
    ],
  },

  '5.02': {
    idea: 'The distributive law: multiply each part of the bracket. 6 × 34 = 6 × 30 + 6 × 4. It works with subtraction too: 9 × 34 = 10 × 34 − 1 × 34.',
    ex: [['7 × 43', ['= 7 × 40 + 7 × 3', '= 280 + 21 = 301']], ['9 × 26', ['= 10 × 26 − 1 × 26', '= 260 − 26 = 234']], [`Expand ${al('5(x + 3)')}.`, [`= 5 × ${i_('x')} + 5 × 3`, `= ${al('5x + 15')}`]]],
    look: ['5.01'],
    e: [
      ({ ri }) => { const a = ri(3, 9), b = ri(12, 49); return b % 10 === 0 ? null : { q: `${a} × ${b}`, w: [`= ${a} × ${b - (b % 10)} + ${a} × ${b % 10}`, `= ${a * (b - (b % 10))} + ${a * (b % 10)} = ${a * b}`] }; },
      ({ ri }) => { const a = ri(3, 9), t = ri(1, 5) * 10, u = ri(1, 9); return { q: `Work out ${a} × (${t} + ${u}) two ways.`, w: [`${a} × ${t + u} = ${a * (t + u)}`, `${a * t} + ${a * u} = ${a * (t + u)}`] }; },
      ({ ri, pick }) => { const a = ri(2, 9), v = pick(V), b = ri(1, 12); return { q: `Expand ${al(`${a}(${v} + ${b})`)}.`, a: al(`${a}${v} + ${a * b}`) }; },
    ],
    m: [
      ({ ri, pick }) => { const a = pick([9, 19, 29, 99, 11, 21]), b = ri(12, 60); const t = Math.round(a / 10) * 10, d = t - a; return { q: `${a} × ${b}`, w: [`= ${t} × ${b} ${d > 0 ? '−' : '+'} ${Math.abs(d)} × ${b}`, `= ${N(t * b)} ${d > 0 ? '−' : '+'} ${N(Math.abs(d) * b)}`, `= ${N(a * b)}`] }; },
      ({ ri, pick }) => { const a = ri(2, 9), v = pick(V), b = ri(1, 12); return { q: `Expand ${al(`${a}(${v} - ${b})`)}.`, w: [`= ${a} × ${i_(v)} − ${a} × ${b}`, `= ${al(`${a}${v} - ${a * b}`)}`] }; },
      ({ ri }) => { const a = ri(3, 9), t = ri(2, 9) * 10, u = ri(1, 9); return { q: `Fill in the box: ${a} × ${t + u} = ${a} × ${t} + ${a} × ☐`, a: `☐ = ${u}` }; },
    ],
    c: [
      ({ ri, pick }) => { const a = ri(2, 6), c = ri(2, 5), v = pick(V), b = ri(1, 9), op = pick(['+', '-']); return { q: `Expand ${al(`${a}(${c}${v} ${op} ${b})`)}.`, w: [`= ${a} × ${al(`${c}${v}`)} ${op === '+' ? '+' : '−'} ${a} × ${b}`, `= ${al(`${a * c}${v} ${op} ${a * b}`)}`] }; },
      ({ ri, pick }) => { const a = ri(3, 9), n = pick([199, 99, 49, 999]); return { q: `Use the distributive law to work out ${a} × ${n}.`, w: [`= ${a} × ${n + 1} − ${a} × 1`, `= ${N(a * (n + 1))} − ${a}`, `= ${N(a * n)}`] }; },
      ({ ri, pick }) => { const a = ri(2, 9), b = ri(2, 9), v = pick(V), who = pick(NAMES); return { q: `${who} says ${al(`${a}(${v} + ${b}) = ${a}${v} + ${b}`)}. Is that right? Explain.`, a: `No. Multiply both terms: ${al(`${a}${v} + ${a * b}`)}.`, n: 2, key: `says 1 ${ri(1, 2)}` }; },
      ({ ri }) => { const a = ri(4, 9), b = ri(21, 29), c = ri(21, 29); return { q: `Work out ${a} × ${b} + ${a} × ${c} the quick way.`, w: [`= ${a} × (${b} + ${c})`, `= ${a} × ${b + c} = ${a * (b + c)}`] }; },
    ],
  },

  '5.03': {
    idea: 'A pronumeral (a letter) stands for a number. In algebra, leave out the × sign: 3 × n = 3n, a × b = ab, n × n = n². Write the number first, then the letters in alphabetical order.',
    ex: [[`Simplify 5 × ${i_('y')}.`, ['number first', `= ${al('5y')}`]], [`Simplify ${i_('b')} × 3 × ${i_('a')}.`, [`= 3 × ${i_('a')} × ${i_('b')}`, `= ${al('3ab')}`]], ['Matchstick squares in a row: 1 square uses 4, 2 squares use 7, 3 squares use 10. Write a rule.', ['each new square adds 3', `${i_('m')} = ${al('3s + 1')}`]]],
    look: ['5.01'],
    e: [
      ({ ri, pick }) => { const v = pick(V), c = ri(2, 12); return { q: `Simplify ${pick([`${c} × ${i_(v)}`, `${i_(v)} × ${c}`])}.`, a: al(`${c}${v}`) }; },
      ({ pick }) => { const v = pick(V); return { q: `Simplify ${i_(v)} × ${i_(v)}.`, a: al(`${v}^2`) }; },
      ({ ri, pick }) => { const v = pick(V), c = ri(2, 12); return { q: `What does ${al(`${c}${v}`)} mean?`, a: `${c} × ${i_(v)}` }; },
    ],
    m: [
      ({ ri, pick }) => { const [a, b] = two(pick), c = ri(2, 12); return { q: `Simplify ${i_(b)} × ${i_(a)} × ${c}.`, a: al(`${c}${a}${b}`) }; },
      ({ ri, pick }) => { const [a, b] = two(pick), c = ri(2, 9); return { q: `Write ${al(`${c}${a}${b}`)} in expanded form.`, a: `${c} × ${i_(a)} × ${i_(b)}` }; },
      ({ ri, pick }) => { const v = pick(V), c = ri(2, 9); return { q: `Write ${i_(v)} ÷ ${c} as a fraction.`, a: F(i_(v), c) }; },
      ({ ri }) => { const m = ri(2, 5), c = ri(1, 6); const xs = [1, 2, 3, 4]; return { q: `The pattern is ${xs.map((x) => m * x + c).join(', ')}, … Write a rule for term ${i_('n')}.`, w: [`goes up by ${m} each time`, `term = ${al(`${m}n + ${c}`)}`] }; },
    ],
    c: [
      ({ ri, pick }) => { const [a, b] = two(pick), c = ri(2, 9), d = ri(2, 5); return { q: `Simplify ${c} × ${i_(a)} × ${i_(b)} × ${i_(a)} × ${d}.`, w: [`= ${c} × ${d} × ${i_(a)} × ${i_(a)} × ${i_(b)}`, `= ${al(`${c * d}${a}^2${b}`)}`] }; },
      ({ ri }) => { const m = ri(2, 6), c = ri(1, 5), n = ri(8, 20); return { q: `A pattern has the rule ${i_('t')} = ${al(`${m}n + ${c}`)}. Find term ${n}.`, w: [`${i_('t')} = ${m} × ${n} + ${c}`, `= ${m * n + c}`] }; },
      ({ ri }) => { const m = ri(2, 5), c = ri(1, 6); return { q: `Find the rule: when ${i_('x')} = 1, 2, 3, 4, ${i_('y')} = ${[1, 2, 3, 4].map((x) => m * x + c).join(', ')}.`, w: [`${i_('y')} goes up by ${m}: ${m}${i_('x')}`, `${i_('y')} = ${al(`${m}x + ${c}`)}`] }; },
      ({ pick }) => { const [a, b] = two(pick), who = pick(NAMES); return { q: `${who} says ${al(`${a}${b}`)} and ${al(`${b}${a}`)} are different. Is that right? Explain.`, a: `No. Both mean ${i_(a)} × ${i_(b)}; we write ${al(`${a}${b}`)}.`, n: 2 }; },
    ],
  },

  '5.04': {
    idea: 'Turn the words into maths. More than and sum: +. Less than and difference: −. Times and product: ×. Divided by: ÷. Careful: "3 less than x" is x − 3.',
    ex: [[`5 more than ${i_('n')}`, ['add 5', `= ${al('n + 5')}`]], [`3 less than twice ${i_('x')}`, [`twice ${i_('x')}: ${al('2x')}`, `= ${al('2x - 3')}`]], [`The cost of ${i_('p')} pens at $4 each`, [`4 × ${i_('p')}`, `= ${al('4p')} dollars`]]],
    look: ['5.03'],
    e: (() => {
      const E = [['{n} more than {x}', '{x} + {n}'], ['{n} less than {x}', '{x} - {n}'], ['{n} times {x}', '{n}{x}'], ['{x} divided by {n}', '{x}/{n}'], ['the sum of {x} and {n}', '{x} + {n}'], ['double {x}', '2{x}'], ['{x} squared', '{x}^2'], ['{x} decreased by {n}', '{x} - {n}'], ['the product of {x} and {y}', '{x}{y}'], ['{x} increased by {n}', '{x} + {n}']];
      return [0, 1, 2].map((s) => ({ ri, pick }, i) => { const [t, a] = E[(i * 3 + s) % E.length], [x, y] = two(pick), n = ri(2, 12); const e = a.replace(/\{x\}/g, x).replace(/\{y\}/g, y).replace(/\{n\}/g, n); return { q: `Write an expression: ${alw(t.replace(/\{x\}/g, x).replace(/\{y\}/g, y).replace(/\{n\}/g, n))}`, a: e.includes('/') ? F(al(e.split('/')[0]), e.split('/')[1]) : al(e) }; });
    })(),
    m: (() => {
      const M = [['{n} less than twice {x}', '2{x} - {n}'], ['{n} more than {m} times {x}', '{m}{x} + {n}'], ['{m} times {x}, take away {n}', '{m}{x} - {n}'], ['{x} squared, plus {n}', '{x}^2 + {n}'], ['{n} less than the product of {x} and {y}', '{x}{y} - {n}'], ['the sum of {x} and {n}, then times {m}', '{m}({x} + {n})'], ['{x} plus {y}, then divided by {n}', '({x} + {y})/{n}']];
      return [0, 1, 2].map((s) => ({ ri, pick }, i) => { const [t, a] = M[(i * 3 + s) % M.length], [x, y] = two(pick), n = ri(2, 12), m = ri(3, 9); const fill = (u) => u.replace(/\{x\}/g, x).replace(/\{y\}/g, y).replace(/\{n\}/g, n).replace(/\{m\}/g, m); const e = fill(a); return { q: `Write an expression: ${alw(fill(t))}`, w: e.includes('/') ? [`first: ${al(e.split('/')[0].replace(/[()]/g, ''))}`, `= ${F(al(e.split('/')[0].replace(/[()]/g, '')), e.split('/')[1])}`] : e.includes('(') ? [`first: ${al(e.slice(e.indexOf('(') + 1, -1))}`, `= ${al(e)}`] : [`first: ${al(e.split(/ [+-] /)[0])}`, `= ${al(e)}`] }; });
    })(),
    c: [
      ({ ri, pick }) => { const n = pick(V), c = ri(2, 15); return { q: `Write an expression for the cost of ${i_(n)} pens at $${c} each, plus $${c + 3} for a folder.`, w: [`${i_(n)} = number of pens`, `= ${al(`${c}${n} + ${c + 3}`)} dollars`] }; },
      ({ ri, pick }) => { const n = pick(V), c = ri(2, 15); return { q: `Write an expression for the number of legs on ${i_(n)} spiders and ${c} birds.`, w: [`spiders: ${al(`8${n}`)}, birds: 2 × ${c} = ${2 * c}`, `= ${al(`8${n} + ${2 * c}`)}`] }; },
      ({ ri, pick }) => { const n = pick(V), c = ri(2, 15) * 10; return { q: `$${c} is shared equally by ${i_(n)} people. Write an expression for each share.`, a: `${F(String(c), i_(n))} dollars` }; },
      ({ ri, pick }) => { const [x] = two(pick), n = ri(2, 9); const [e, w] = pick([[`2(${x} + ${n})`, `double the sum of ${x} and ${n}`], [`${x}/${n} + 1`, `${x} divided by ${n}, plus 1`], [`3${x} - ${n}`, `${n} less than 3 times ${x}`]]); return { q: `Write in words: ${e.includes('/') ? `${F(i_(x), n)} + 1` : al(e)}`, a: alw(w) }; },
    ],
  },

  '5.05': {
    idea: 'Substitute: replace each pronumeral with its number, then work it out with the order of operations. 3a + 2 when a = 5 is 3 × 5 + 2 = 17.',
    ex: [[`Find ${al('4m - 3')} when ${i_('m')} = 6.`, ['= 4 × 6 − 3', '= 21']], [`Find ${al('ab + b')} when ${i_('a')} = 3 and ${i_('b')} = 5.`, ['= 3 × 5 + 5', '= 20']], [`${i_('A')} = ${i_('lw')}. Find ${i_('A')} when ${i_('l')} = 8 and ${i_('w')} = 5.`, [`${i_('A')} = 8 × 5`, `${i_('A')} = 40`]]],
    look: ['5.04', '5.03'],
    e: [
      ({ ri, pick }) => { const v = pick(['x', 'a', 'n', 'p']), k = ri(2, 12), c = ri(2, 9), f = ri(0, 2); const e = [`${c}${v}`, `${v} + ${c}`, `${c}${v} + 1`][f]; const val = [c * k, k + c, c * k + 1][f]; return { q: `Find ${al(e)} when ${i_(v)} = ${k}.`, a: N(val) }; },
      ({ ri, pick }) => { const v = pick(['x', 'm', 'k']), k = ri(2, 12); return { q: `Find ${al(`${v}^2`)} when ${i_(v)} = ${k}.`, a: N(k * k) }; },
      ({ ri, pick }) => { const v = pick(['x', 'n', 'y']), c = ri(2, 9), k = c * ri(2, 9); return { q: `Find ${F(i_(v), c)} when ${i_(v)} = ${k}.`, a: N(k / c) }; },
    ],
    m: [
      ({ ri }, i) => { const a = ri(2, 9), b = ri(2, 9); const E = [['ab', a * b, `${a} × ${b}`], ['2a + b', 2 * a + b, `2 × ${a} + ${b}`], ['3b - a', 3 * b - a, `3 × ${b} − ${a}`], ['a + 2b', a + 2 * b, `${a} + 2 × ${b}`], ['5a - b', 5 * a - b, `5 × ${a} − ${b}`], ['a^2 + b', a * a + b, `${a} × ${a} + ${b}`], ['4(a + b)', 4 * (a + b), `4 × (${a} + ${b})`]][i % 7]; return E[1] < 0 ? null : { q: `Find ${al(E[0])} when ${i_('a')} = ${a} and ${i_('b')} = ${b}.`, w: [`= ${E[2]}`, `= ${N(E[1])}`] }; },
      ({ ri }) => { const a = ri(3, 15), b = ri(2, 12); return { q: `${i_('P')} = ${al('2l + 2w')}. Find ${i_('P')} when ${i_('l')} = ${a} and ${i_('w')} = ${b}.`, w: [`${i_('P')} = 2 × ${a} + 2 × ${b}`, `${i_('P')} = ${2 * a + 2 * b}`] }; },
      ({ ri, pick }) => { const v = pick(['x', 'n']), c = ri(2, 6), k = ri(-6, -1), d = ri(1, 9); return { q: `Find ${al(`${c}${v} + ${d}`)} when ${i_(v)} = ${N(k)}.`, w: [`= ${c} × ${B(k)} + ${d}`, `= ${N(c * k + d)}`] }; },
    ],
    c: [
      ({ ri }) => { const h = ri(2, 8), r = ri(25, 60), c = ri(15, 40); return { q: `A plumber charges ${i_('C')} = ${al(`${r}h + ${c}`)} dollars for ${i_('h')} hours. Find the cost of ${h === 8 ? 'an' : 'a'} ${h}-hour job.`, w: [`${i_('C')} = ${r} × ${h} + ${c}`, `${i_('C')} = $${r * h + c}`] }; },
      ({ ri }) => { const u = ri(2, 15), a = ri(2, 6), t = ri(3, 10); return { q: `${i_('v')} = ${al('u + at')}. Find ${i_('v')} when ${i_('u')} = ${u}, ${i_('a')} = ${a} and ${i_('t')} = ${t}.`, w: [`${i_('v')} = ${u} + ${a} × ${t}`, `${i_('v')} = ${u + a * t}`] }; },
      ({ ri }) => { const a = ri(-5, -1), b = ri(2, 6); return { q: `Find ${al('a^2 - 3b')} when ${i_('a')} = ${N(a)} and ${i_('b')} = ${b}.`, w: [`= ${B(a)}<sup>2</sup> − 3 × ${b}`, `= ${a * a} − ${3 * b}`, `= ${N(a * a - 3 * b)}`] }; },
      ({ ri, pick }) => { const x = ri(2, 6), who = pick(NAMES); return { q: `${who} says ${al('3x^2')} = ${(3 * x) ** 2} when ${i_('x')} = ${x}. Is that right? Explain.`, a: `No. Square first: 3 × ${x}² = 3 × ${x * x} = ${3 * x * x}.`, n: 2, key: `says 2 ${ri(1, 2)}` }; },
    ],
  },

  '5.07': {
    idea: 'Like terms have exactly the same letters and powers. Add or subtract like terms by adding or subtracting the numbers in front. Unlike terms cannot be joined: 3a + 2b stays as it is.',
    ex: [[al('5x + 3x'), ['like terms', `= ${al('8x')}`]], [al('7a + 2b - 3a'), [`= ${al('7a - 3a + 2b')}`, `= ${al('4a + 2b')}`]], [`Are ${al('3xy')} and ${al('5yx')} like terms?`, [`${al('yx')} is the same as ${al('xy')}`, 'yes']]],
    look: ['5.05', '5.03'],
    e: [
      ({ ri, pick }) => { const v = pick(V), a = ri(2, 12), b = ri(1, 11); return { q: `Simplify ${al(`${a}${v} + ${term(b, v)}`)}.`, a: al(term(a + b, v)) }; },
      ({ ri, pick }) => { const v = pick(V), a = ri(3, 15), b = ri(1, a - 1); return { q: `Simplify ${al(`${a}${v} - ${term(b, v)}`)}.`, a: al(term(a - b, v)) }; },
      ({ ri, pick }) => { const [a, b] = two(pick), c = ri(2, 9), k = pick([0, 1, 2]); const [p, q, yes] = [[`${c}${a}`, `${c}${b}`, false], [`${c}${a}`, `${c + 1}${a}`, true], [`${c}${a}^2`, `${c}${a}`, false]][k]; return { q: `Are ${al(p)} and ${al(q)} like terms?`, a: yes ? 'yes' : 'no' }; },
    ],
    m: [
      ({ ri, pick }) => { const [a, b] = two(pick), t = [[ri(2, 9), a], [ri(2, 9), b], [ri(1, 9), a], [ri(1, 9) * pick([1, -1]), b]]; const c = collect(t); return c.some(([k]) => k === 0) ? null : { q: `Simplify ${al(expr(t))}.`, w: [`= ${al(expr([t[0], t[2], t[1], t[3]]))}`, `= ${al(expr(c))}`] }; },
      ({ ri, pick }) => { const [a, b] = two(pick), L = ri(2, 9), W = ri(2, 9); return { q: `A rectangle is ${al(`${L}${a}`)} long and ${al(`${W}${b}`)} wide. Write its perimeter as simply as possible.`, w: [`= ${al(`${L}${a} + ${W}${b} + ${L}${a} + ${W}${b}`)}`, `= ${al(`${2 * L}${a} + ${2 * W}${b}`)}`] }; },
      ({ ri, pick }) => { const v = pick(V), a = ri(2, 9), b = ri(2, 9), c = ri(1, 9); return { q: `Simplify ${al(`${a}${v} + ${b} + ${term(c, v)}`)}.`, w: [`= ${al(`${a}${v} + ${term(c, v)} + ${b}`)}`, `= ${al(`${term(a + c, v)} + ${b}`)}`] }; },
    ],
    c: [
      ({ ri, pick }) => { const [a, b] = two(pick), ab = a + b; const t = [[ri(2, 9), ab], [ri(2, 9), `${a}^2`], [-ri(1, 9), ab], [ri(1, 9), `${a}^2`], [ri(1, 9), '']]; const c = collect(t); return c.some(([k]) => k === 0) ? null : { q: `Simplify ${al(expr(t))}.`, w: [`= ${al(expr([t[0], t[2], t[1], t[3], t[4]]))}`, `= ${al(expr(c))}`] }; },
      ({ ri, pick }) => { const [a, b] = two(pick), t = [[ri(2, 9), a], [-ri(2, 9), b], [-ri(10, 15), a], [ri(1, 9), b]]; const c = collect(t); return c.some(([k]) => k === 0) ? null : { q: `Simplify ${al(expr(t))}.`, w: [`= ${al(expr([t[0], t[2], t[1], t[3]]))}`, `= ${al(expr(c))}`] }; },
      ({ ri, pick }) => { const [a, b] = two(pick), c = ri(2, 6), d = ri(2, 6), who = pick(NAMES); return { q: `${who} says ${al(`${c}${a} + ${d}${b} = ${c + d}${a}${b}`)}. Is that right? Explain.`, a: `No. ${al(`${c}${a}`)} and ${al(`${d}${b}`)} are not like terms, so it stays ${al(`${c}${a} + ${d}${b}`)}.`, n: 2, key: `says 3 ${ri(1, 2)}` }; },
      ({ ri, pick }) => { const v = pick(V), a = ri(2, 6), b = ri(2, 6), c = ri(2, 6); return { q: `A triangle has sides ${al(`${a}${v}`)}, ${al(`${b}${v}`)} and ${al(`${c}${v}`)}. Write its perimeter, then find it when ${i_(v)} = 4.`, w: [`= ${al(`${a + b + c}${v}`)}`, `= ${a + b + c} × 4 = ${(a + b + c) * 4}`] }; },
    ],
  },

  '5.08': {
    idea: 'To multiply terms, multiply the numbers, then the letters. Write the letters in alphabetical order and use index notation: 3a × 4a = 12a².',
    ex: [[`4 × ${al('3y')}`, ['4 × 3 = 12', `= ${al('12y')}`]], [`${al('5a')} × ${al('2b')}`, [`5 × 2 = 10, ${i_('a')} × ${i_('b')} = ${al('ab')}`, `= ${al('10ab')}`]], [`${al('3m')} × (${al('-2m')})`, [`3 × (−2) = −6, ${i_('m')} × ${i_('m')} = ${al('m^2')}`, `= ${al('-6m^2')}`]]],
    look: ['5.07', '5.03'],
    e: [
      ({ ri, pick }) => { const [a] = two(pick), c = ri(2, 9), d = ri(2, 9); return { q: `${c} × ${al(`${d}${a}`)}`, a: al(`${c * d}${a}`) }; },
      ({ ri, pick }) => { const [a, b] = two(pick), c = ri(2, 9), d = ri(2, 9); return { q: `${al(`${c}${a}`)} × ${al(`${d}${b}`)}`, a: al(`${c * d}${a}${b}`) }; },
      ({ ri, pick }) => { const v = pick(V), c = ri(2, 9); return { q: `${al(`${c}${v}`)} × ${i_(v)}`, a: al(`${c}${v}^2`) }; },
    ],
    m: [
      ({ ri, pick }) => { const [a, b] = two(pick), c = ri(2, 6), d = ri(2, 6), p = pick([a, `${a}${b}`]), q = pick([a, b, `${a}${b}`]); return { q: `${al(`${c}${p}`)} × ${al(`${d}${q}`)}`, w: [`= ${c} × ${d} × ${al(p)} × ${al(q)}`, `= ${al(`${c * d}${mulVars(p, q)}`)}`] }; },
      ({ ri, pick }) => { const [a, b] = two(pick), L = ri(2, 9), W = ri(2, 9); return { q: `A rectangle is ${al(`${L}${a}`)} cm long and ${al(`${W}${b}`)} cm wide. Write its area.`, w: [`= ${al(`${L}${a}`)} × ${al(`${W}${b}`)}`, `= ${al(`${L * W}${a}${b}`)} cm²`] }; },
      ({ ri, pick }) => { const v = pick(V), c = ri(2, 6); return { q: `Simplify ${al(`${c}${v}`)} × ${al(`${c}${v}`)}.`, w: [`${c} × ${c} = ${c * c}`, `= ${al(`${c * c}${v}^2`)}`] }; },
    ],
    c: [
      ({ ri, pick }) => { const [a, b] = two(pick), c = ri(2, 6) * pick([1, -1]), d = ri(2, 6) * pick([1, -1]), e = ri(2, 3); return { q: `${al(term(c, a))} × ${d < 0 ? `(${al(term(d, b))})` : al(term(d, b))} × ${al(`${e}${a}`)}`, w: [`sign: ${c * d > 0 ? '+' : '−'}; ${Math.abs(c)} × ${Math.abs(d)} × ${e} = ${Math.abs(c * d * e)}`, `= ${al(term(c * d * e, mulVars(a, b, a)))}`] }; },
      ({ ri, pick }) => { const [a] = two(pick), c = ri(2, 4); return { q: `Simplify ${al(`${c}${a}`)} × ${al(`${c}${a}`)} × ${al(`${c}${a}`)}.`, w: [`${c} × ${c} × ${c} = ${c ** 3}`, `= ${al(`${c ** 3}${a}^3`)}`] }; },
      ({ ri, pick }) => { const [a, b] = two(pick), c = ri(2, 6), d = ri(2, 6), who = pick(NAMES); return { q: `${who} says ${al(`${c}${a}`)} × ${al(`${d}${a}`)} = ${al(`${c * d}${a}`)}. Is that right? Explain.`, a: `No. ${i_(a)} × ${i_(a)} = ${al(`${a}^2`)}, so it is ${al(`${c * d}${a}^2`)}.`, n: 2, key: `says 4 ${ri(1, 2)}` }; },
    ],
  },

  '5.09': {
    idea: 'To divide terms, write the division as a fraction, then cancel the numbers and the letters: 12ab ÷ 4a = 3b.',
    ex: [[`${al('15x')} ÷ 3`, ['15 ÷ 3 = 5', `= ${al('5x')}`]], [`${al('12ab')} ÷ ${al('4a')}`, [`= ${F(al('12ab'), al('4a'))}`, `= ${al('3b')}`]], [`${F(al('18m^2'), al('6m'))}`, [`18 ÷ 6 = 3, ${al('m^2')} ÷ ${i_('m')} = ${i_('m')}`, `= ${al('3m')}`]]],
    look: ['5.08'],
    e: [
      ({ ri, pick }) => { const v = pick(V), q = ri(2, 9), d = ri(2, 9); return { q: `${al(`${q * d}${v}`)} ÷ ${d}`, a: al(`${q}${v}`) }; },
      ({ ri, pick }) => { const [a, b] = two(pick); return { q: `${al(`${a}${b}`)} ÷ ${i_(a)}`, a: i_(b) }; },
      ({ ri, pick }) => { const v = pick(V), c = ri(2, 12); return { q: `${al(`${c}${v}`)} ÷ ${i_(v)}`, a: N(c) }; },
    ],
    m: [
      ({ ri, pick }) => { const [a, b] = two(pick), q = ri(2, 9), d = ri(2, 6), dv = pick([a, b]), qv = pick([a, b]); return qv === dv ? null : { q: `${al(`${q * d}${mulVars(qv, dv)}`)} ÷ ${al(`${d}${dv}`)}`, w: [`= ${F(al(`${q * d}${mulVars(qv, dv)}`), al(`${d}${dv}`))}`, `= ${al(`${q}${qv}`)}`] }; },
      ({ ri, pick }) => { const v = pick(V), q = ri(2, 9), d = ri(2, 6); return { q: `Simplify ${F(al(`${q * d}${v}`), String(d))}.`, w: [`${q * d} ÷ ${d} = ${q}`, `= ${al(`${q}${v}`)}`] }; },
      ({ ri, pick }) => { const [a, b] = two(pick), q = ri(2, 6), d = ri(2, 6); return { q: `Simplify ${F(al(`${q * d}${a}${b}`), al(`${d}${b}`))}.`, w: [`numbers: ${q * d} ÷ ${d} = ${q}; letters: ${i_(a)}`, `= ${al(`${q}${a}`)}`] }; },
    ],
    c: [
      ({ ri, pick }) => { const [a, b] = two(pick), q = ri(2, 9), d = ri(2, 6); return { q: `Simplify ${F(al(`${q * d}${a}^2${b}`), al(`${d}${a}${b}`))}.`, w: [`numbers: ${q * d} ÷ ${d} = ${q}`, `letters: ${al(`${a}^2${b}`)} ÷ ${al(`${a}${b}`)} = ${i_(a)}`, `= ${al(`${q}${a}`)}`] }; },
      ({ ri, pick }) => { const [a, b] = two(pick), w = ri(2, 9), l = ri(2, 9); return { q: `A rectangle has area ${al(`${w * l}${a}${b}`)} and length ${al(`${l}${a}`)}. Find its width.`, w: [`width = ${al(`${w * l}${a}${b}`)} ÷ ${al(`${l}${a}`)}`, `= ${al(`${w}${b}`)}`] }; },
      ({ ri, pick }) => { const v = pick(V), q = ri(2, 9), d = ri(2, 6); return { q: `${al(`-${q * d}${v}`)} ÷ ${al(`${d}${v}`)}`, w: ['different signs: −', `= ${N(-q)}`] }; },
    ],
  },
};
