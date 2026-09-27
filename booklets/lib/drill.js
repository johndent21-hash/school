// Skill drill: generated practice of the basics, two pages a lesson (see lib/lesson-blend.js).
// Questions come from small generator functions with a seeded random source, so a booklet builds the same every
// time, and every answer is calculated. A chapter's skills.js maps each lesson code to a function (kit) => ({ easy, medium }),
// where easy and medium are lists of rounds: { text, items, ans, cols?, work? }.
//   text   the instruction students see ("Round 1: evaluate each sum.")
//   cols   questions per row (default 4)
//   work   true gives each question a small working box instead of an answer line
//   fig    a diagram the round's questions refer to (a map, a number plane), shown beside the questions

const rng = (seed) => { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const hash = (s) => [...String(s)].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);

// Numbers as the booklet writes them: a true minus sign, spaces in thousands, no floating-point noise.
const N = (v, dp = 6) => { const x = +(+v).toFixed(dp); const s = Math.abs(x).toLocaleString('en-AU', { maximumFractionDigits: dp }).replace(/,/g, ' '); return (x < 0 ? '−' : '') + s; };
// A number in brackets when it is negative: 5 + (−3).
const B = (v) => (v < 0 ? `(${N(v)})` : N(v));

const kit = (seed) => {
  const r = rng(hash(seed));
  const ri = (a, b) => a + Math.floor(r() * (b - a + 1));
  const nz = (a, b) => { let v; do v = ri(a, b); while (v === 0); return v; };
  const pick = (xs) => xs[Math.floor(r() * xs.length)];
  const shuffle = (xs) => { const a = [...xs]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  // n different questions from f() => [question, answer].
  const gen = (n, f) => {
    const seen = new Set(), items = [], ans = [];
    for (let t = 0; items.length < n && t < n * 60; t++) {
      const [q, a] = f(); const k = typeof q === 'string' ? q : JSON.stringify(q);
      if (q === '' || q == null || seen.has(k)) continue; // '' means "skip this one"
      seen.add(k); items.push(q); ans.push(String(a));
    }
    if (items.length < n) throw new Error(`skill drill: only ${items.length} of ${n} different questions for "${seed}"`);
    return { items, ans };
  };
  const round = (text, n, f, o = {}) => { try { return { text, ...gen(n, f), ...o }; } catch (e) { throw new Error(`${e.message}, round "${text}"`); } };
  // A round from a fixed list of [question, answer] pairs (shuffled unless o.keep).
  const list = (text, pairs, o = {}) => { const p = o.keep ? pairs : shuffle(pairs); return { text, items: p.map((x) => x[0]), ans: p.map((x) => String(x[1])), ...o }; };
  return { r, ri, nz, pick, shuffle, gen, round, list, N, B };
};

// The rounds of one lesson: skills[code](kit(code)). tag 'homework' gives the same kinds of questions with other numbers.
const make = (skills, code, tag = 'skill') => (skills && skills[code] ? skills[code](kit(`${tag} ${code}`)) : null);

module.exports = { kit, make, N, B };
