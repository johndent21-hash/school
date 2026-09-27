// Worksheet questions for Chapter 8 Area and volume (lib/worksheet.js). See ../ch01-integers/content.js for the format.
// Diagrams are labelled "not to scale" where the lengths are not drawn in proportion.
const D = require('../../lib/diagrams');
const { fmt } = require('../../lib/calc');

const n = (x, dp = 4) => fmt(x, dp);
const r1 = (x) => (Math.round(x * 10) / 10).toFixed(1);
const sq = (u) => `${u}<sup>2</sup>`, cu = (u) => `${u}<sup>3</sup>`;
const LEN = [['km', 'm', 1000], ['m', 'cm', 100], ['cm', 'mm', 10], ['m', 'mm', 1000]];
const MASS = [['kg', 'g', 1000], ['t', 'kg', 1000]];
const CAP = [['L', 'mL', 1000], ['kL', 'L', 1000]];
// Rectangle drawn in proportion (longest side 30 mm), sides labelled.
const rect = (l, w, u, o = {}) => { const s = 30 / Math.max(l, w * 1.4), L = l * s, W = Math.max(w * s, 7); return D.fit([[0, 0], [L, 0], [L, W], [0, W]], { sides: [`${n(l)} ${u}`, `${n(w)} ${u}`, '', ''], right: [0], fill: '#eef1f9', ...o }, 9); };
// Triangle with base b and perpendicular height h (dashed), not to scale.
const triH = (b, h, u) => D.fit([[0, 18], [30, 18], [6, 0]], { sides: [`${b} ${u}`, '', ''], dash: [[[6, 0], [6, 18]]], labels: [[`${h} ${u}`, 12.5, 11]], fill: '#eef1f9' }, 5);
const para = (b, h, u) => D.fit([[8, 0], [36, 0], [28, 16], [0, 16]], { sides: ['', '', `${b} ${u}`, ''], dash: [[[8, 0], [8, 16]]], labels: [[`${h} ${u}`, 13.5, 9]], fill: '#eef1f9' }, 5);
// L-shape: a w × h rectangle with a cw × ch corner cut from the top right.
const lshape = (w, h, cw, ch) => D.fit([[0, 0], [22, 0], [22, 10], [34, 10], [34, 24], [0, 24]], { sides: [`${w - cw}`, `${ch}`, `${cw}`, `${h - ch}`, `${w}`, `${h}`], fill: '#eef1f9' }, 5);
const conv = (ri, pick, table) => { const [a, b, k] = pick(table); const x = ri(1, 60) / pick([1, 1, 10]); return ri(0, 1) ? { q: `${n(x)} ${a} = ___ ${b}`, a: `${n(x * k)} ${b}`, k, from: a, to: b, x, big: true } : { q: `${n(x * k)} ${b} = ___ ${a}`, a: `${n(x)} ${a}`, k, from: b, to: a, x: x * k, big: false }; };

module.exports = {
  '8.01': ({ ri, pick }) => [
    [{ text: 'Convert. Big unit to small unit: multiply. Small to big: divide.', gen: () => { const c = conv(ri, pick, [...LEN, ...MASS, ...CAP]); return { q: c.q, a: c.a }; } }],
    [{ text: 'Write the rule (× or ÷ by what?), then convert.', gen: () => { const c = conv(ri, pick, [...LEN, ...MASS, ...CAP]); return { q: c.q, a: c.a, lines: [`${c.from} to ${c.to}: ${c.big ? '×' : '÷'} ${fmt(c.k)}`, `${n(c.x)} ${c.big ? '×' : '÷'} ${fmt(c.k)} = ${c.a}`] }; } }],
    [{ text: 'Change to the same unit, then answer the question.', kinds: 2, gen: (i) => { const a = ri(2, 9), b = ri(150, 950); if (i % 2 === 0) return { q: `Add ${a} m and ${b} cm. Give the answer in metres.`, a: `${n(a + b / 100)} m`, lines: [`${b} cm = ${n(b / 100)} m`, `${a} + ${n(b / 100)} = ${n(a + b / 100)} m`] }; return { q: `A ${a} L jug has ${b} mL poured out. How much is left, in mL?`, a: `${a * 1000 - b} mL`, lines: [`${a} L = ${a * 1000} mL`, `${a * 1000} − ${b} = ${a * 1000 - b} mL`] }; } }],
  ],
  '8.02': ({ ri, pick }) => [
    [{ text: 'Find the perimeter: add all the sides.', gen: () => { const l = ri(3, 25), w = ri(2, l); return { q: `${l} m by ${w} m rectangle`, a: `${2 * (l + w)} m` }; } }],
    [{ text: 'Find the perimeter. Write the sum of the sides.', gen: () => { const l = ri(4, 30), w = ri(2, 20); if (w >= l) return { q: '' }; return { q: '', fig: rect(l, w, 'cm'), a: `${2 * (l + w)} cm`, lines: [`${l} + ${w} + ${l} + ${w}`, `= ${2 * (l + w)} cm`] }; } }],
    [{ text: 'Work backwards from the perimeter.', kinds: 2, gen: (i) => { const l = ri(4, 30), w = ri(2, l - 1); if (i % 2 === 0) return { q: `A rectangle has perimeter ${2 * (l + w)} m and length ${l} m. Find its width.`, a: `${w} m`, lines: [`2 × ${l} = ${2 * l}`, `${2 * (l + w)} − ${2 * l} = ${2 * w}`, `width = ${2 * w} ÷ 2 = ${w} m`] }; return { q: `A square has perimeter ${4 * l} cm. Find the side length.`, a: `${l} cm`, lines: [`4 equal sides`, `${4 * l} ÷ 4 = ${l} cm`] }; } }],
  ],
  '8.03': ({ ri }) => [
    [{ text: 'Find the circumference, C = πd. Use the π key. Round to 1 decimal place.', gen: () => { const d = ri(2, 40); return { q: `d = ${d} cm`, a: `${r1(Math.PI * d)} cm` }; } }],
    [{ text: 'Find the circumference. Write the formula, substitute, then round to 1 d.p.', gen: (i) => { const r = ri(2, 20); return i % 2 === 0 ? { q: '', fig: D.circle({ label: `${r} m`, w: 26, h: 26 }), a: `${r1(2 * Math.PI * r)} m`, lines: [`C = 2πr = 2 × π × ${r}`, `= ${r1(2 * Math.PI * r)} m`] } : { q: '', fig: D.circle({ label: `${2 * r} m`, diameter: true, w: 26, h: 26 }), a: `${r1(2 * Math.PI * r)} m`, lines: [`C = πd = π × ${2 * r}`, `= ${r1(2 * Math.PI * r)} m`] }; } }],
    [{ text: 'Work backwards or find a part of a circle. Show the formula.', kinds: 2, gen: (i) => { const d = ri(4, 30); if (i % 2 === 0) { const c = Math.round(Math.PI * d); return { q: `A circle has circumference ${c} cm. Find its diameter (1 d.p.).`, a: `${r1(c / Math.PI)} cm`, lines: ['C = πd, so d = C ÷ π', `d = ${c} ÷ π`, `= ${r1(c / Math.PI)} cm`] }; } return { q: `Find the perimeter of a semicircle with diameter ${d} cm (1 d.p.).`, a: `${r1((Math.PI * d) / 2 + d)} cm`, lines: [`curve: π × ${d} ÷ 2 = ${r1((Math.PI * d) / 2)}`, `add the diameter: ${r1((Math.PI * d) / 2)} + ${d}`, `= ${r1((Math.PI * d) / 2 + d)} cm`] }; } }],
  ],
  '8.04': ({ ri, pick }) => [
    [{ text: `Convert. 1 ${sq('cm')} = 100 ${sq('mm')}. 1 ${sq('m')} = 10 000 ${sq('cm')}. 1 ha = 10 000 ${sq('m')}.`, gen: () => { const [a, b, k] = pick([[sq('cm'), sq('mm'), 100], [sq('m'), sq('cm'), 10000], ['ha', sq('m'), 10000]]), x = ri(2, 30); return ri(0, 1) ? { q: `${x} ${a} = ___ ${b}`, a: `${n(x * k)} ${b}` } : { q: `${n(x * k)} ${b} = ___ ${a}`, a: `${x} ${a}` }; } }],
    [{ text: 'Square the length conversion, then convert the area.', gen: () => { const [a, b, s] = pick([[sq('cm'), sq('mm'), 10], [sq('m'), sq('cm'), 100], [sq('km'), sq('m'), 1000]]), x = ri(2, 9) + pick([0, 0.5]); return { q: `${n(x)} ${a} = ___ ${b}`, a: `${n(x * s * s)} ${b}`, lines: [`1 ${a} = ${s} × ${s} = ${n(s * s)} ${b}`, `${n(x)} × ${n(s * s)} = ${n(x * s * s)} ${b}`] }; } }],
    [{ text: 'Find the area, then convert it to the unit asked for.', gen: () => { const l = ri(2, 9) * 100, w = ri(1, 5) * 100; return { q: `A paddock is ${l} m by ${w} m. Find its area in hectares.`, a: `${n((l * w) / 10000)} ha`, lines: [`A = ${l} × ${w} = ${n(l * w)} ${sq('m')}`, `÷ 10 000: ${n((l * w) / 10000)} ha`] }; } }],
  ],
  '8.05': ({ ri }) => [
    [{ text: 'Find the area of the rectangle: A = length × width.', gen: () => { const l = ri(3, 15), w = ri(2, l); return { q: `${l} m by ${w} m`, a: `${l * w} ${sq('m')}` }; } }],
    [{ text: 'Find the area. Write the formula, then substitute.', gen: () => { const l = ri(4, 20), w = ri(2, 15); if (w >= l) return { q: '' }; return { q: '', fig: rect(l, w, 'cm'), a: `${l * w} ${sq('cm')}`, lines: [`A = lw = ${l} × ${w}`, `= ${l * w} ${sq('cm')}`] }; } }],
    [{ text: 'Work backwards from the area, or find the area of a square.', kinds: 2, gen: (i) => { const l = ri(3, 20), w = ri(2, 15); if (i % 2 === 0) return { q: `A rectangle has area ${l * w} ${sq('m')} and width ${w} m. Find its length.`, a: `${l} m`, lines: [`A = lw, so ${l * w} = l × ${w}`, `l = ${l * w} ÷ ${w} = ${l} m`] }; return { q: `A square has sides of ${n(w + 0.5)} cm. Find its area.`, a: `${n((w + 0.5) ** 2)} ${sq('cm')}`, lines: [`A = s² = ${n(w + 0.5)} × ${n(w + 0.5)}`, `= ${n((w + 0.5) ** 2)} ${sq('cm')}`] }; } }],
  ],
  '8.06': ({ ri }) => [
    [{ text: 'Find the area of the triangle: A = ½ × base × height.', gen: () => { const b = ri(2, 20), h = ri(2, 20); return (b * h) % 2 ? { q: '' } : { q: `b = ${b} cm, h = ${h} cm`, a: `${(b * h) / 2} ${sq('cm')}` }; } }],
    [{ text: 'Find the area. The height is at right angles to the base. (Not to scale.)', gen: () => { const b = ri(4, 20), h = ri(3, 16); return { q: '', fig: triH(b, h, 'cm'), a: `${n((b * h) / 2)} ${sq('cm')}`, lines: [`A = ½ × ${b} × ${h}`, `= ${n((b * h) / 2)} ${sq('cm')}`] }; } }],
    [{ text: 'Work backwards: find the height or the base.', gen: () => { const b = ri(4, 20), h = ri(3, 16); if ((b * h) % 2) return { q: '' }; return { q: `A triangle has area ${(b * h) / 2} ${sq('cm')} and base ${b} cm. Find its height.`, a: `${h} cm`, lines: [`${(b * h) / 2} = ½ × ${b} × h`, `${(b * h) / 2} = ${b / 2} × h`, `h = ${(b * h) / 2} ÷ ${b / 2} = ${h} cm`] }; } }],
  ],
  '8.07': ({ ri }) => [
    [{ text: 'Find the area of the parallelogram: A = base × height.', gen: () => { const b = ri(3, 20), h = ri(2, 15); return { q: `b = ${b} m, h = ${h} m`, a: `${b * h} ${sq('m')}` }; } }],
    [{ text: 'Find the area. Use the perpendicular height, not the slanted side. (Not to scale.)', gen: () => { const b = ri(5, 20), h = ri(3, 12); return { q: '', fig: para(b, h, 'cm'), a: `${b * h} ${sq('cm')}`, lines: [`A = bh = ${b} × ${h}`, `= ${b * h} ${sq('cm')}`] }; } }],
    [{ text: 'Work backwards from the area.', gen: () => { const b = ri(4, 20), h = ri(2, 15); return { q: `A parallelogram has area ${b * h} ${sq('m')} and height ${h} m. Find its base.`, a: `${b} m`, lines: [`${b * h} = b × ${h}`, `b = ${b * h} ÷ ${h}`, `= ${b} m`] }; } }],
  ],
  '8.08': ({ ri }) => [
    [{ text: 'The shape is two rectangles joined. Add their areas.', gen: () => { const a = ri(3, 12), b = ri(2, 9), c = ri(2, 10), d = ri(2, 8); return { q: `${a} × ${b} and ${c} × ${d} (m)`, a: `${a * b + c * d} ${sq('m')}` }; } }],
    [{ text: 'Find the area of the L-shape. Split it into two rectangles. (Not to scale.)', gen: () => { const w = ri(8, 16), h = ri(7, 14), cw = ri(2, w - 4), ch = ri(2, h - 4); return { q: '', fig: lshape(w, h, cw, ch), a: `${w * h - cw * ch} ${sq('cm')}`, lines: [`${w - cw} × ${h} = ${(w - cw) * h}`, `${cw} × ${h - ch} = ${cw * (h - ch)}`, `total: ${(w - cw) * h + cw * (h - ch)} ${sq('cm')}`] }; } }],
    [{ text: 'Subtract the part cut out, or add a triangle to a rectangle.', kinds: 2, gen: (i) => { const l = ri(8, 20), w = ri(6, 14), a = ri(2, 5), b = ri(2, 5); if (i % 2 === 0) return { q: `A ${l} cm × ${w} cm rectangle has a ${a} cm × ${b} cm hole cut out. Find the area left.`, a: `${l * w - a * b} ${sq('cm')}`, lines: [`big: ${l} × ${w} = ${l * w}`, `hole: ${a} × ${b} = ${a * b}`, `${l * w} − ${a * b} = ${l * w - a * b} ${sq('cm')}`] }; const t = ri(2, 8); return (l * t) % 2 ? { q: '' } : { q: `A house wall is a ${l} m × ${w} m rectangle with a triangle on top (base ${l} m, height ${t} m). Find its area.`, a: `${l * w + (l * t) / 2} ${sq('m')}`, lines: [`rectangle: ${l} × ${w} = ${l * w}`, `triangle: ½ × ${l} × ${t} = ${(l * t) / 2}`, `total: ${l * w + (l * t) / 2} ${sq('m')}`] }; } }],
  ],
  '8.09': ({ ri, pick }) => [
    [{ text: 'Name the shape of the cross-section of each prism.', gen: (i) => { const L = [['triangular prism', 'triangle'], ['rectangular prism', 'rectangle'], ['pentagonal prism', 'pentagon'], ['hexagonal prism', 'hexagon'], ['octagonal prism', 'octagon'], ['cube', 'square'], ['cylinder', 'circle'], ['a Toblerone box', 'triangle'], ['a cereal box', 'rectangle'], ['a six-sided pencil', 'hexagon'], ['square prism', 'square'], ['a tent with triangle ends', 'triangle'], ['a can of soup', 'circle'], ['a brick', 'rectangle'], ['a honeycomb cell', 'hexagon'], ['a stop sign, as a prism', 'octagon'], ['decagonal prism', 'decagon'], ['a tissue box', 'rectangle'], ['heptagonal prism', 'heptagon'], ['a 50c coin', 'dodecagon (12 sides)'], ['a water pipe', 'circle (a ring)'], ['a ruler', 'rectangle'], ['a dice', 'square']]; const x = L[i % L.length]; return { q: x[0], a: x[1] }; } }],
    [{ text: 'A prism has n sides on its cross-section. Faces = n + 2, vertices = 2n, edges = 3n.', gen: (i) => { const L = [['triangle', 3], ['square', 4], ['pentagon', 5], ['hexagon', 6], ['heptagon', 7], ['octagon', 8], ['decagon', 10], ['12-sided polygon', 12]]; const [s, k] = L[i % L.length]; return { q: `cross-section: ${s}`, a: `F ${k + 2}, V ${2 * k}, E ${3 * k}`, lines: [`n = ${k}: F = ${k} + 2 = ${k + 2}`, `V = 2 × ${k} = ${2 * k}, E = 3 × ${k} = ${3 * k}`] }; } }],
    [{ text: 'Describe the views of each solid. (Front: what you see from in front; top: from above.)', gen: (i) => { const L = [['a cylinder standing up', 'rectangle', 'circle'], ['a square pyramid', 'triangle', 'square with diagonals'], ['a triangular prism lying on a rectangular face', 'rectangle', 'rectangle with a line down the middle'], ['a cone standing on its base', 'triangle', 'circle with a dot in the centre'], ['a cube', 'square', 'square'], ['a rectangular prism standing on end', 'tall rectangle', 'small rectangle']]; const x = L[i % L.length]; return { q: x[0], a: `front: ${x[1]}; top: ${x[2]}`, lines: [`front view: ${x[1]}`, `top view: ${x[2]}`] }; } }],
  ],
  '8.10': ({ ri, pick }) => [
    [{ text: `Convert. 1 ${cu('cm')} = 1000 ${cu('mm')}. 1 ${cu('cm')} = 1 mL. 1000 ${cu('cm')} = 1 L.`, gen: () => { const k = ri(0, 2), x = ri(2, 60); return [{ q: `${x} ${cu('cm')} = ___ ${cu('mm')}`, a: `${n(x * 1000)} ${cu('mm')}` }, { q: `${x * 10} ${cu('cm')} = ___ mL`, a: `${x * 10} mL` }, { q: `${n(x * 1000)} ${cu('cm')} = ___ L`, a: `${x} L` }][k]; } }],
    [{ text: 'Cube the length conversion, then convert the volume.', gen: () => { const [a, b, s] = pick([[cu('cm'), cu('mm'), 10], [cu('m'), cu('cm'), 100]]), x = ri(2, 9); return { q: `${x} ${a} = ___ ${b}`, a: `${n(x * s ** 3)} ${b}`, lines: [`1 ${a} = ${s} × ${s} × ${s} = ${n(s ** 3)} ${b}`, `${x} × ${n(s ** 3)} = ${n(x * s ** 3)} ${b}`] }; } }],
    [{ text: 'Convert between volume and capacity. Show each step.', gen: () => { const x = ri(2, 20) / 2; return { q: `A tank holds ${n(x)} ${cu('m')} of water. How many litres is that?`, a: `${n(x * 1000)} L`, lines: [`1 ${cu('m')} = 1000 L`, `${n(x)} × 1000 = ${n(x * 1000)} L`] }; } }],
  ],
  '8.11': ({ ri }) => [
    [{ text: 'Find the volume: V = length × width × height.', gen: () => { const l = ri(2, 12), w = ri(2, 10), h = ri(2, 9); return { q: `${l} cm × ${w} cm × ${h} cm`, a: `${l * w * h} ${cu('cm')}` }; } }],
    [{ text: 'Find the volume. Write the formula, then substitute. (Not to scale.)', gen: () => { const l = ri(4, 15), w = ri(2, 9), h = ri(2, 10); return { q: '', fig: D.box({ l: `${l} cm`, wd: `${w} cm`, ht: `${h} cm`, w: 58, h: 34 }), a: `${l * w * h} ${cu('cm')}`, lines: [`V = lwh = ${l} × ${w} × ${h}`, `= ${l * w * h} ${cu('cm')}`] }; } }],
    [{ text: 'Work backwards from the volume.', gen: () => { const l = ri(3, 12), w = ri(2, 10), h = ri(2, 9); return { q: `A box has volume ${l * w * h} ${cu('cm')}, length ${l} cm and width ${w} cm. Find its height.`, a: `${h} cm`, lines: [`${l * w * h} = ${l} × ${w} × h`, `${l * w * h} = ${l * w} × h`, `h = ${l * w * h} ÷ ${l * w} = ${h} cm`] }; } }],
  ],
  '8.12': ({ ri }) => [
    [{ text: 'Find the volume of the prism: V = area of cross-section × length.', gen: () => { const a = ri(3, 60), h = ri(2, 15); return { q: `A = ${a} ${sq('cm')}, <i>l</i> = ${h} cm`, a: `${a * h} ${cu('cm')}` }; } }],
    [{ text: 'Find the area of the triangle, then the volume. (Not to scale.)', gen: () => { const b = ri(3, 12), t = ri(2, 10), l = ri(4, 20); if ((b * t) % 2) return { q: '' }; return { q: '', fig: D.triPrism({ base: `${b} cm`, tri: `${t} cm`, len: `${l} cm`, w: 60, h: 36 }), a: `${((b * t) / 2) * l} ${cu('cm')}`, lines: [`A = ½ × ${b} × ${t} = ${(b * t) / 2}`, `V = ${(b * t) / 2} × ${l} = ${((b * t) / 2) * l} ${cu('cm')}`] }; } }],
    [{ text: 'Work backwards from the volume.', gen: () => { const a = ri(4, 40), h = ri(2, 15); return { q: `A prism has volume ${a * h} ${cu('m')} and cross-section area ${a} ${sq('m')}. Find its length.`, a: `${h} m`, lines: [`${a * h} = ${a} × length`, `length = ${a * h} ÷ ${a}`, `= ${h} m`] }; } }],
  ],
  '8.13': ({ ri, pick }) => [
    [{ text: 'Convert. 1 L = 1000 mL. 1 kL = 1000 L.', gen: () => { const [a, b, k] = pick(CAP), x = ri(1, 40) / pick([1, 2, 4]); return ri(0, 1) ? { q: `${n(x)} ${a} = ___ ${b}`, a: `${n(x * k)} ${b}` } : { q: `${n(x * k)} ${b} = ___ ${a}`, a: `${n(x)} ${a}` }; } }],
    [{ text: 'Find the volume in cm³, then the capacity in litres (1000 cm³ = 1 L).', gen: () => { const l = ri(2, 6) * 10, w = ri(1, 5) * 10, h = ri(1, 5) * 5; return { q: `a box ${l} cm × ${w} cm × ${h} cm`, a: `${n((l * w * h) / 1000)} L`, lines: [`V = ${l} × ${w} × ${h} = ${n(l * w * h)} ${cu('cm')}`, `÷ 1000 = ${n((l * w * h) / 1000)} L`] }; } }],
    [{ text: 'Solve the capacity problem. Change to the same unit first.', gen: () => { const c = pick([200, 250, 300, 500, 750]), t = pick([1.5, 2, 3, 4.5, 6, 9]); if ((t * 1000) % c) return { q: '' }; return { q: `How many ${c} mL cups can be filled from ${n(t)} L of juice?`, a: `${(t * 1000) / c} cups`, lines: [`${n(t)} L = ${n(t * 1000)} mL`, `${n(t * 1000)} ÷ ${c} = ${(t * 1000) / c}`, `${(t * 1000) / c} cups`] }; } }],
  ],
};
