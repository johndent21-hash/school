// Summary statistics used to generate answers, so every answer in the key is calculated, not typed.
const sorted = (xs) => [...xs].sort((a, b) => a - b);
const sum = (xs) => xs.reduce((s, x) => s + x, 0);
const mean = (xs) => sum(xs) / xs.length;
const median = (xs) => {
  const s = sorted(xs), n = s.length;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
};
const range = (xs) => Math.max(...xs) - Math.min(...xs);
const modes = (xs) => {
  const f = new Map();
  xs.forEach((x) => f.set(x, (f.get(x) || 0) + 1));
  const top = Math.max(...f.values());
  if (top === 1) return [];
  return sorted([...f.entries()].filter(([, c]) => c === top).map(([v]) => v));
};

// Round to 2 decimal places and drop trailing zeros: 8.777 -> "8.78", 4.50 -> "4.5".
const fmt = (x) => String(+(Math.round(x * 100) / 100).toFixed(2));
const modeText = (xs) => {
  const m = modes(xs);
  return m.length === 0 ? 'no mode' : m.join(' and ');
};

// Expand a frequency object {value: count} into a list of values.
const expand = (counts) => Object.entries(counts).flatMap(([v, c]) => Array(c).fill(+v));
// Values from stem-and-leaf rows [[stem, [leaves]]] with a place value multiplier (10 for whole numbers, 1 with leafUnit 0.1 for decimals).
const fromStemLeaf = (rows, { stemUnit = 10, leafUnit = 1 } = {}) =>
  rows.flatMap(([s, leaves]) => leaves.map((l) => +(s * stemUnit + l * leafUnit).toFixed(4)));
// Group sorted values into stem rows.
const toStemLeaf = (xs, stems) => stems.map((s) => [s, sorted(xs).filter((x) => Math.floor(x / 10) === s).map((x) => x % 10)]);

const summary = (xs) => `mean ${fmt(mean(xs))}, median ${fmt(median(xs))}, mode ${modeText(xs)}, range ${fmt(range(xs))}`;

module.exports = { sorted, sum, mean, median, range, modes, fmt, modeText, expand, fromStemLeaf, toStemLeaf, summary };
