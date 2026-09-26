// Works out answers so the answer keys are calculated, not typed.
// Expressions are written the way they appear in the booklet: − × ÷ and brackets, e.g. '−8 + (−2) × 3'.

// Format a number for the booklet: true minus sign, no floating-point noise.
const fmt = (n, dp = 6) => {
  const v = +(+n).toFixed(dp);
  return (v < 0 ? '−' : '') + Math.abs(v).toLocaleString('en-AU', { maximumFractionDigits: dp }).replace(/,/g, ' ');
};
const toJs = (e) => e.replace(/−|–/g, '-').replace(/×/g, '*').replace(/÷/g, '/').replace(/\[/g, '(').replace(/\]/g, ')').replace(/(\d)\s+(?=\d{3}\b)/g, '$1');
const value = (e) => Function(`"use strict"; return (${toJs(e)});`)();
const ev = (e, dp) => fmt(value(e), dp);

// Fractions: [numerator, denominator]
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const simp = ([n, d]) => { const g = gcd(n, d) || 1; const s = d < 0 ? -1 : 1; return [(s * n) / g, (s * d) / g]; };
const fr = ([n, d], mixed = true) => {
  [n, d] = simp([n, d]);
  if (d === 1) return fmt(n);
  const neg = n < 0; n = Math.abs(n);
  const w = Math.floor(n / d), r = n % d;
  const s = mixed && w ? `${w} ${r}/${d}` : `${n}/${d}`;
  return (neg ? '−' : '') + s;
};
const add = (a, b) => simp([a[0] * b[1] + b[0] * a[1], a[1] * b[1]]);
const sub = (a, b) => simp([a[0] * b[1] - b[0] * a[1], a[1] * b[1]]);
const mul = (a, b) => simp([a[0] * b[0], a[1] * b[1]]);
const div = (a, b) => simp([a[0] * b[1], a[1] * b[0]]);
const mixed = (w, n, d) => [w * d + n, d];

// Show a fraction nicely in question text: frac(3,4) → stacked fraction.
const F = (n, d, w) => `${w ? `${w}` : ''}<span class="fr"><sup>${n}</sup><sub>${d}</sub></span>`;

module.exports = { fmt, value, ev, gcd, simp, fr, add, sub, mul, div, mixed, F };
