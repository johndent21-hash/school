// Writing algebra for the booklets: italic pronumerals, true minus signs, tidy coefficients.
// al('3x + 2y^2') → '3<i>x</i> + 2<i>y</i><sup>2</sup>'. alw() italicises only single-letter words (for word questions).
const al = (s) => String(s).replace(/([a-zA-Z])/g, '<i>$1</i>').replace(/\^(\d+)/g, '<sup>$1</sup>').replace(/(^|[\s(=×÷])-/g, '$1−').replace(/ - /g, ' − ');
const alw = (s) => String(s).replace(/\b([a-zA-Z])\b/g, '<i>$1</i>');
// One term: coefficient and pronumeral part ('x', 'ab', 'x^2'). term(1, 'x') = 'x', term(-1, 'x') = '-x', term(3, '') = '3'.
const term = (c, v = '') => (v === '' ? String(c) : c === 1 ? v : c === -1 ? `-${v}` : `${c}${v}`);
// Terms joined with + and −: expr([[3, 'x'], [-2, 'y'], [5, '']]) = '3x - 2y + 5'. Zero terms are dropped.
const expr = (terms) => {
  const t = terms.filter(([c]) => c !== 0);
  if (!t.length) return '0';
  return t.map(([c, v], i) => (i === 0 ? term(c, v) : c < 0 ? `- ${term(-c, v)}` : `+ ${term(c, v)}`)).join(' ');
};
// Collect like terms: [[3, 'x'], [2, 'y'], [-1, 'x']] → [[2, 'x'], [2, 'y']] (first-seen order).
const collect = (terms) => { const m = new Map(); terms.forEach(([c, v]) => m.set(v, (m.get(v) || 0) + c)); return [...m].map(([v, c]) => [c, v]); };
// Product of pronumeral parts in alphabetical order with powers: mulVars('ab', 'a') = 'a^2b'.
const mulVars = (...parts) => {
  const m = {}; parts.join('').replace(/([a-z])(?:\^(\d+))?/g, (_, v, k) => { m[v] = (m[v] || 0) + (+k || 1); return ''; });
  return Object.keys(m).sort().map((v) => (m[v] > 1 ? `${v}^${m[v]}` : v)).join('');
};

module.exports = { al, alw, term, expr, collect, mulVars };
