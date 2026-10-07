// Chapter 8 Area and volume: mixed-practice questions (lib/mixed.js). Every question stands on its own.
// Diagrams are labelled "not to scale" where the lengths are not drawn in proportion.
const D = require('../../lib/diagrams');
const { fmt } = require('../../lib/calc');

const n = (x, dp = 4) => fmt(x, dp);
const r1 = (x) => (Math.round(x * 10) / 10).toFixed(1);
const sq = (u) => `${u}<sup>2</sup>`, cu = (u) => `${u}<sup>3</sup>`;
const LEN = [['km', 'm', 1000], ['m', 'cm', 100], ['cm', 'mm', 10], ['m', 'mm', 1000]];
const MASS = [['kg', 'g', 1000], ['t', 'kg', 1000]];
const CAP = [['L', 'mL', 1000], ['kL', 'L', 1000]];
const NAMES = ['Ali', 'Mia', 'Zac', 'Lena', 'Kai', 'Ruby', 'Tom', 'Priya', 'Jack', 'Aisha', 'Noah', 'Chloe'];
// Rectangle drawn in proportion (longest side 30 mm), sides labelled.
const rect = (l, w, u, o = {}) => { const s = 30 / Math.max(l, w * 1.4), L = l * s, W = Math.max(w * s, 7); return D.fit([[0, 0], [L, 0], [L, W], [0, W]], { sides: [`${n(l)} ${u}`, `${n(w)} ${u}`, '', ''], right: [0], fill: '#eef1f9', ...o }, 9); };
const triH = (b, h, u) => D.fit([[0, 18], [30, 18], [6, 0]], { sides: [`${n(b)} ${u}`, '', ''], dash: [[[6, 0], [6, 18]]], labels: [[`${n(h)} ${u}`, 12.5, 11]], fill: '#eef1f9' }, 5);
const para = (b, h, u) => D.fit([[8, 0], [36, 0], [28, 16], [0, 16]], { sides: ['', '', `${n(b)} ${u}`, ''], dash: [[[8, 0], [8, 16]]], labels: [[`${n(h)} ${u}`, 13.5, 9]], fill: '#eef1f9' }, 5);
// L-shape: a w × h rectangle with a cw × ch corner cut from the top right. labels: which sides to show.
const lshape = (w, h, cw, ch, show = [1, 1, 1, 1, 1, 1], u = '') => { const L = [`${w - cw}`, `${ch}`, `${cw}`, `${h - ch}`, `${w}`, `${h}`].map((t, i) => (show[i] ? `${t}${u}` : '')); return D.fit([[0, 0], [22, 0], [22, 10], [34, 10], [34, 24], [0, 24]], { sides: L, fill: '#eef1f9' }, 5); };
const house = (w, h, t) => D.fit([[0, 12], [15, 0], [30, 12], [30, 26], [0, 26]], { sides: ['', '', `${h}`, `${w}`, ''], dash: [[[15, 0], [15, 12]]], labels: [[`${t}`, 17.5, 7.5]], fill: '#eef1f9' }, 5);
const conv = (ri, pick, table) => { const [a, b, k] = pick(table); const x = ri(1, 60) / pick([1, 1, 10]); return ri(0, 1) ? { q: `Change ${n(x)} ${a} to ${b}.`, a: `${n(x * k)} ${b}`, k, from: a, to: b, x, big: true } : { q: `Change ${n(x * k)} ${b} to ${a}.`, a: `${n(x)} ${a}`, k, from: b, to: a, x: x * k, big: false }; };

module.exports = {
  '8.01': {
    idea: 'To change to a smaller unit, multiply: there are more of them. To change to a larger unit, divide. 1 km = 1000 m, 1 m = 100 cm, 1 cm = 10 mm, 1 kg = 1000 g, 1 L = 1000 mL.',
    ex: [['Change 3.5 km to metres.', ['km to m: × 1000', '= 3 500 m']], ['Change 450 g to kilograms.', ['g to kg: ÷ 1000', '= 0.45 kg']], ['Add 2 m and 35 cm. Give the answer in centimetres.', ['2 m = 200 cm', '200 + 35 = 235 cm']]],
    look: ['7.04'],
    e: [
      ({ ri, pick }) => { const c = conv(ri, pick, LEN); return { q: c.q, a: c.a }; },
      ({ ri, pick }) => { const c = conv(ri, pick, [...MASS, ...CAP]); return { q: c.q, a: c.a }; },
      ({ ri, pick }) => { const [q, a] = pick([[`Change ${ri(2, 9)} hours to minutes.`, (x) => `${x * 60} minutes`], [`Change ${ri(2, 9)} minutes to seconds.`, (x) => `${x * 60} seconds`]]); const x = +q.match(/\d+/)[0]; return { q, a: a(x) }; },
    ],
    m: [
      ({ ri, pick }) => { const c = conv(ri, pick, [...LEN, ...MASS, ...CAP]); return { q: c.q, w: [`${c.from} to ${c.to}: ${c.big ? '×' : '÷'} ${fmt(c.k)}`, `${n(c.x)} ${c.big ? '×' : '÷'} ${fmt(c.k)} = ${c.a}`] }; },
      ({ ri }) => { const a = ri(2, 9), b = ri(150, 950); return { q: `Add ${a} m and ${b} cm. Give the answer in metres.`, w: [`${b} cm = ${n(b / 100)} m`, `${a} + ${n(b / 100)} = ${n(a + b / 100)} m`] }; },
      ({ ri }) => { const h = ri(1, 4), m = ri(5, 55); return { q: `Change ${h} h ${m} min to minutes.`, w: [`${h} × 60 = ${h * 60}`, `${h * 60} + ${m} = ${h * 60 + m} min`] }; },
    ],
    c: [
      ({ ri }) => { const a = ri(2, 9), b = ri(150, 950); return { q: `A ${a} L jug has ${b} mL poured out. How much is left, in mL?`, w: [`${a} L = ${a * 1000} mL`, `${a * 1000} − ${b} = ${a * 1000 - b} mL`] }; },
      ({ ri, shuffle }) => { const base = ri(105, 135) / 100; const xs = shuffle([`${n(base)} m`, `${Math.round(base * 100) + ri(3, 9)} cm`, `${n(Math.round(base * 1000) - ri(20, 60))} mm`]); const val = (t) => { const v = parseFloat(t.replace(/\s(?=\d)/g, '')); return t.endsWith(' mm') ? v / 1000 : t.endsWith(' cm') ? v / 100 : v; }; return { q: `Order from shortest to longest: ${xs.join(', ')}`, w: [xs.map((t) => `${n(val(t) * 100)} cm`).join(', '), [...xs].sort((p, q) => val(p) - val(q)).join(', ')] }; },
      ({ ri }) => { const k = ri(4, 12), g = ri(150, 450); return { q: `${k} packets of rice weigh ${g} g each. Find the total mass in kilograms.`, w: [`${k} × ${g} = ${k * g} g`, `= ${n((k * g) / 1000)} kg`] }; },
    ],
  },

  '8.02': {
    idea: 'Perimeter is the distance around the outside of a shape: add all the side lengths. For a rectangle, P = 2l + 2w. Find any missing sides first.',
    ex: [['Find the perimeter of an 8 m by 5 m rectangle.', ['8 + 5 + 8 + 5', '= 26 m']], ['Find the perimeter. (Not to scale.)', ['missing: 12 − 7 = 5, 10 − 4 = 6', '7 + 4 + 5 + 6 + 12 + 10 = 44 cm'], lshape(12, 10, 5, 4, [1, 1, 0, 0, 1, 1], ' cm')], ['A square has a perimeter of 36 cm. Find a side.', ['4 equal sides', '36 ÷ 4 = 9 cm']]],
    look: ['8.01'],
    e: [
      ({ ri }) => { const l = ri(3, 25), w = ri(2, l); return { q: `Find the perimeter of a ${l} m by ${w} m rectangle.`, a: `${2 * (l + w)} m` }; },
      ({ ri }) => { const l = ri(4, 30), w = ri(2, 20); return w >= l ? null : { q: 'Find the perimeter.', fig: rect(l, w, 'cm'), a: `${2 * (l + w)} cm` }; },
      ({ ri }) => { const s = ri(3, 20); return { q: `Find the perimeter of a square with sides of ${s} cm.`, a: `${4 * s} cm` }; },
    ],
    m: [
      ({ ri }) => { const w = ri(8, 16), h = ri(7, 14), cw = ri(2, w - 4), ch = ri(2, h - 4); return { q: 'Find the perimeter. Find the missing sides first. (Not to scale.)', fig: lshape(w, h, cw, ch, [1, 1, 0, 0, 1, 1], ' cm'), fh: 26, w: [`missing: ${cw} and ${h - ch}`, `${w - cw} + ${ch} + ${cw} + ${h - ch} + ${w} + ${h} = ${2 * (w + h)} cm`] }; },
      ({ ri, pick }) => { const [nm, k] = pick([['regular hexagon', 6], ['regular pentagon', 5], ['regular octagon', 8], ['equilateral triangle', 3]]), s = ri(3, 15); return { q: `Find the perimeter of a ${nm} with sides of ${s} cm.`, w: [`${k} × ${s}`, `= ${k * s} cm`] }; },
      ({ ri }) => { const a = ri(3, 12), b = ri(3, 12), c = ri(Math.abs(a - b) + 1, a + b - 1); return { q: `A triangle has sides ${a} cm, ${b} cm and ${c} cm. Find its perimeter.`, a: `${a + b + c} cm` }; },
    ],
    c: [
      ({ ri }) => { const l = ri(4, 30), w = ri(2, l - 1); return { q: `A rectangle has a perimeter of ${2 * (l + w)} m and a length of ${l} m. Find its width.`, w: [`2 × ${l} = ${2 * l}`, `${2 * (l + w)} − ${2 * l} = ${2 * w}`, `width: ${w} m`] }; },
      ({ ri }) => { const l = ri(8, 30), w = ri(5, 20), c = ri(8, 25); return { q: `A ${l} m by ${w} m paddock is fenced. Fencing costs $${c} a metre. Find the cost.`, w: [`P = ${2 * (l + w)} m`, `${2 * (l + w)} × ${c} = $${n(2 * (l + w) * c)}`] }; },
      ({ ri }) => { const s = ri(3, 12); return { q: `A square and an equilateral triangle each have a perimeter of ${12 * s} cm. Find each side length.`, w: [`square: ${12 * s} ÷ 4 = ${3 * s} cm`, `triangle: ${12 * s} ÷ 3 = ${4 * s} cm`] }; },
    ],
  },

  '8.03': {
    idea: 'The circumference is the distance around a circle: C = πd, or C = 2πr. Use the π key on your calculator, then round as asked.',
    ex: [['Find the circumference when d = 10 cm (1 decimal place).', ['C = π × 10', '≈ 31.4 cm']], ['Find the circumference when r = 6 m (1 decimal place).', ['C = 2 × π × 6', '≈ 37.7 m']], ['A circle has a circumference of 50 cm. Find its diameter.', ['d = C ÷ π = 50 ÷ π', '≈ 15.9 cm']]],
    look: ['8.02', '7.10'],
    e: [
      ({ ri }) => { const d = ri(2, 40); return { q: `Find the circumference of a circle with diameter ${d} cm (1 decimal place).`, a: `${r1(Math.PI * d)} cm` }; },
      ({ ri }) => { const r = ri(2, 30); return { q: `A circle has a radius of ${r} m. What is its diameter?`, a: `${2 * r} m` }; },
      ({ ri }) => { const r = ri(2, 20); return { q: `Find the circumference of a circle with radius ${r} cm (1 decimal place).`, a: `${r1(2 * Math.PI * r)} cm` }; },
    ],
    m: [
      ({ ri }, i) => { const r = ri(2, 20); return i % 2 === 0 ? { q: 'Find the circumference (1 decimal place).', fig: D.circle({ label: `${r} m`, w: 26, h: 26 }), fh: 24, w: [`C = 2 × π × ${r}`, `≈ ${r1(2 * Math.PI * r)} m`] } : { q: 'Find the circumference (1 decimal place).', fig: D.circle({ label: `${2 * r} m`, diameter: true, w: 26, h: 26 }), fh: 24, w: [`C = π × ${2 * r}`, `≈ ${r1(2 * Math.PI * r)} m`] }; },
      ({ ri }) => { const d = ri(40, 80); return { q: `A bike wheel has a diameter of ${d} cm. How far does it roll in one turn (1 decimal place)?`, w: [`C = π × ${d}`, `≈ ${r1(Math.PI * d)} cm`] }; },
    ],
    c: [
      ({ ri }) => { const d = ri(4, 30); const c = Math.round(Math.PI * d); return { q: `A circle has a circumference of ${c} cm. Find its diameter (1 decimal place).`, w: ['d = C ÷ π', `= ${c} ÷ π ≈ ${r1(c / Math.PI)} cm`] }; },
      ({ ri }) => { const d = ri(4, 30); return { q: `Find the perimeter of a semicircle with diameter ${d} cm (1 decimal place).`, w: [`curved part: π × ${d} ÷ 2 ≈ ${r1((Math.PI * d) / 2)}`, `+ ${d}: ≈ ${r1((Math.PI * d) / 2 + d)} cm`] }; },
      ({ ri }) => { const d = ri(50, 70), t = ri(10, 50); return { q: `A wheel of diameter ${d} cm turns ${t} times. How far does it travel, in metres (1 decimal place)?`, w: [`one turn: π × ${d} ≈ ${r1(Math.PI * d)} cm`, `× ${t} ≈ ${r1((Math.PI * d * t) / 100)} m`] }; },
    ],
  },

  '8.04': {
    idea: '1 cm² = 100 mm² (10 × 10). 1 m² = 10 000 cm² (100 × 100). 1 ha = 10 000 m². To change to a smaller unit, multiply; to a larger unit, divide.',
    ex: [[`Change 3 ${sq('cm')} to ${sq('mm')}.`, [`1 ${sq('cm')} = 100 ${sq('mm')}`, `3 × 100 = 300 ${sq('mm')}`]], [`Change 25 000 ${sq('cm')} to ${sq('m')}.`, [`÷ 10 000`, `= 2.5 ${sq('m')}`]], [`Change 4.5 ha to ${sq('m')}.`, [`× 10 000`, `= 45 000 ${sq('m')}`]]],
    look: ['8.01'],
    e: [
      ({ ri, pick }) => { const [a, b, k] = pick([[sq('cm'), sq('mm'), 100], [sq('m'), sq('cm'), 10000], ['ha', sq('m'), 10000]]), x = ri(2, 30); return { q: `Change ${x} ${a} to ${b}.`, a: `${n(x * k)} ${b}` }; },
      ({ ri, pick }) => { const [a, b, k] = pick([[sq('cm'), sq('mm'), 100], [sq('m'), sq('cm'), 10000], ['ha', sq('m'), 10000]]), x = ri(2, 30); return { q: `Change ${n(x * k)} ${b} to ${a}.`, a: `${x} ${a}` }; },
      ({ pick }) => { const [q, a] = pick([[`How many ${sq('mm')} are in 1 ${sq('cm')}?`, '100'], [`How many ${sq('cm')} are in 1 ${sq('m')}?`, '10 000'], [`How many ${sq('m')} are in 1 hectare?`, '10 000']]); return { q, a, key: q }; },
    ],
    m: [
      ({ ri, pick }) => { const [a, b, s] = pick([[sq('cm'), sq('mm'), 10], [sq('m'), sq('cm'), 100], [sq('km'), sq('m'), 1000]]), x = ri(2, 9) + pick([0, 0.5]); return { q: `Change ${n(x)} ${a} to ${b}.`, w: [`1 ${a} = ${s} × ${s} = ${n(s * s)} ${b}`, `${n(x)} × ${n(s * s)} = ${n(x * s * s)} ${b}`] }; },
      ({ ri }) => { const x = ri(3, 95) * 100; return { q: `Change ${n(x)} ${sq('mm')} to ${sq('cm')}.`, w: ['÷ 100', `= ${n(x / 100)} ${sq('cm')}`] }; },
    ],
    c: [
      ({ ri }) => { const l = ri(2, 9) * 100, w = ri(1, 5) * 100; return { q: `A paddock is ${l} m by ${w} m. Find its area in hectares.`, w: [`A = ${l} × ${w} = ${n(l * w)} ${sq('m')}`, `÷ 10 000 = ${n((l * w) / 10000)} ha`] }; },
      ({ ri }) => { const a = ri(2, 9) / 10, b = ri(2, 9) * 1000; return Math.abs(a * 10000 - b) < 1 ? null : { q: `Which is larger: ${n(a)} ${sq('m')} or ${n(b)} ${sq('cm')}?`, w: [`${n(a)} ${sq('m')} = ${n(a * 10000)} ${sq('cm')}`, `larger: ${a * 10000 > b ? `${n(a)} ${sq('m')}` : `${n(b)} ${sq('cm')}`}`] }; },
      ({ ri }) => { const l = ri(20, 90), w = ri(10, 40); return { q: `A rug is ${l} cm by ${w} cm. Find its area in ${sq('m')}.`, w: [`${l} × ${w} = ${n(l * w)} ${sq('cm')}`, `÷ 10 000 = ${n((l * w) / 10000)} ${sq('m')}`] }; },
    ],
  },

  '8.05': {
    idea: 'Area of a rectangle = length × width. Area of a square = side × side. Area is measured in square units, such as cm² and m².',
    ex: [['Find the area of an 8 m by 5 m rectangle.', ['A = 8 × 5', `= 40 ${sq('m')}`]], ['Find the area of a square with sides of 7 cm.', ['A = 7 × 7', `= 49 ${sq('cm')}`]], [`A rectangle has an area of 60 ${sq('cm')} and a width of 5 cm. Find its length.`, ['60 = l × 5', 'l = 60 ÷ 5 = 12 cm']]],
    look: ['8.02', '8.04'],
    e: [
      ({ ri }) => { const l = ri(3, 15), w = ri(2, l); return { q: `Find the area of a ${l} m by ${w} m rectangle.`, a: `${l * w} ${sq('m')}` }; },
      ({ ri }) => { const s = ri(2, 12); return { q: `Find the area of a square with sides of ${s} cm.`, a: `${s * s} ${sq('cm')}` }; },
      ({ ri }) => { const l = ri(4, 20), w = ri(2, 15); return w >= l ? null : { q: 'Find the area.', fig: rect(l, w, 'cm'), a: `${l * w} ${sq('cm')}` }; },
    ],
    m: [
      ({ ri }) => { const l = ri(3, 20), w = ri(2, 15); return { q: `A rectangle has an area of ${l * w} ${sq('m')} and a width of ${w} m. Find its length.`, w: [`${l * w} = l × ${w}`, `l = ${l * w} ÷ ${w} = ${l} m`] }; },
      ({ ri }) => { const l = ri(21, 99) / 10, w = ri(2, 9); return { q: `Find the area of a ${n(l)} m by ${w} m rectangle.`, w: [`A = ${n(l)} × ${w}`, `= ${n(l * w)} ${sq('m')}`] }; },
      ({ ri }) => { const s = ri(4, 15); return { q: `A square has an area of ${s * s} ${sq('cm')}. How long is each side?`, w: [`√${s * s}`, `= ${s} cm`] }; },
    ],
    c: [
      ({ ri }) => { const l = ri(3, 8), w = ri(3, 6), c = ri(25, 60); return { q: `Carpet costs $${c} per ${sq('m')}. Find the cost to carpet a ${l} m by ${w} m room.`, w: [`A = ${l} × ${w} = ${l * w} ${sq('m')}`, `${l * w} × ${c} = $${n(l * w * c)}`] }; },
      ({ ri }) => { const l = ri(3, 8) * 100, w = ri(2, 6) * 100, t = 20; return { q: `How many ${t} cm × ${t} cm tiles cover a floor ${l / 100} m by ${w / 100} m?`, w: [`${l} ÷ ${t} = ${l / t}, ${w} ÷ ${t} = ${w / t}`, `${l / t} × ${w / t} = ${(l / t) * (w / t)} tiles`] }; },
      ({ ri }) => { const l = ri(6, 12), w = ri(4, 8); return { q: `A ${l} m by ${w} m lawn has a 1 m wide path around the outside. Find the area of the path.`, w: [`big: ${l + 2} × ${w + 2} = ${(l + 2) * (w + 2)}`, `lawn: ${l * w}`, `path: ${(l + 2) * (w + 2) - l * w} ${sq('m')}`] }; },
    ],
  },

  '8.06': {
    idea: 'Area of a triangle = ½ × base × height. The height is measured at right angles (perpendicular) to the base.',
    ex: [['Find the area: base 10 cm, height 6 cm.', ['A = ½ × 10 × 6', `= 30 ${sq('cm')}`]], ['Find the area. (Not to scale.)', ['A = ½ × 12 × 5', `= 30 ${sq('m')}`], triH(12, 5, 'm')], [`A triangle has an area of 24 ${sq('cm')} and a base of 8 cm. Find its height.`, ['24 = ½ × 8 × h = 4h', 'h = 6 cm']]],
    look: ['8.05'],
    e: [
      ({ ri }) => { const b = ri(2, 20), h = ri(2, 20); return (b * h) % 2 ? null : { q: `Find the area of a triangle with base ${b} cm and height ${h} cm.`, a: `${(b * h) / 2} ${sq('cm')}` }; },
      ({ ri }) => { const b = ri(4, 20), h = ri(3, 16); return { q: 'Find the area. (Not to scale.)', fig: triH(b, h, 'cm'), a: `${n((b * h) / 2)} ${sq('cm')}` }; },
      ({ ri }) => { const b = ri(3, 12), h = ri(3, 12); return { q: `A rectangle is ${b} cm by ${h} cm. A diagonal cuts it into two triangles. Find the area of one triangle.`, a: `${n((b * h) / 2)} ${sq('cm')}` }; },
    ],
    m: [
      ({ ri }) => { const b = ri(4, 20), h = ri(3, 16); return { q: 'Find the area. Write the formula first. (Not to scale.)', fig: triH(b, h, 'm'), w: [`A = ½ × ${b} × ${h}`, `= ${n((b * h) / 2)} ${sq('m')}`] }; },
      ({ ri }) => { const b = ri(21, 99) / 10, h = ri(2, 9) * 2; return { q: `Find the area of a triangle with base ${n(b)} m and height ${h} m.`, w: [`A = ½ × ${n(b)} × ${h}`, `= ${n((b * h) / 2)} ${sq('m')}`] }; },
      ({ ri }) => { const a = ri(3, 12), c = ri(3, 12); return { q: `A right-angled triangle has shorter sides of ${a} cm and ${c} cm. Find its area.`, w: ['base and height are the two shorter sides', `½ × ${a} × ${c} = ${n((a * c) / 2)} ${sq('cm')}`] }; },
    ],
    c: [
      ({ ri }) => { const b = ri(4, 20), h = ri(3, 16); return (b * h) % 2 ? null : { q: `A triangle has an area of ${(b * h) / 2} ${sq('cm')} and a base of ${b} cm. Find its height.`, w: [`${(b * h) / 2} = ½ × ${b} × h = ${n(b / 2)}h`, `h = ${h} cm`] }; },
      ({ ri }) => { const b = ri(4, 12), h = ri(4, 12); return { q: `Two triangles have the same base and height: ${b} cm and ${h} cm. One is right-angled, one is not. Compare their areas.`, a: `Both are ${n((b * h) / 2)} ${sq('cm')}: area depends only on base and height.`, n: 2, key: 'same' }; },
      ({ ri }) => { const s = ri(4, 12); return { q: `A square of side ${s} cm is cut along a diagonal. Find the area of each triangle.`, w: [`square: ${s * s} ${sq('cm')}`, `half: ${n((s * s) / 2)} ${sq('cm')}`] }; },
    ],
  },

  '8.07': {
    idea: 'Area of a parallelogram = base × height. The height is perpendicular to the base: do not use the slanted side.',
    ex: [['Find the area: base 9 cm, height 4 cm.', ['A = 9 × 4', `= 36 ${sq('cm')}`]], ['Find the area. (Not to scale.)', ['A = 15 × 6', `= 90 ${sq('m')}`], para(15, 6, 'm')], [`A parallelogram has an area of 56 ${sq('m')} and a height of 7 m. Find its base.`, ['56 = b × 7', 'b = 8 m']]],
    look: ['8.06'],
    e: [
      ({ ri }) => { const b = ri(3, 20), h = ri(2, 15); return { q: `Find the area of a parallelogram with base ${b} m and height ${h} m.`, a: `${b * h} ${sq('m')}` }; },
      ({ ri }) => { const b = ri(5, 20), h = ri(3, 12); return { q: 'Find the area. (Not to scale.)', fig: para(b, h, 'cm'), a: `${b * h} ${sq('cm')}` }; },
    ],
    m: [
      ({ ri }) => { const b = ri(5, 20), h = ri(3, 12); return { q: 'Find the area. Write the formula first. (Not to scale.)', fig: para(b, h, 'm'), w: [`A = ${b} × ${h}`, `= ${b * h} ${sq('m')}`] }; },
      ({ ri }) => { const b = ri(4, 20), h = ri(2, 15); return { q: `A parallelogram has an area of ${b * h} ${sq('m')} and a height of ${h} m. Find its base.`, w: [`${b * h} = b × ${h}`, `b = ${b} m`] }; },
      ({ ri }) => { const b = ri(21, 99) / 10, h = ri(2, 9); return { q: `Find the area of a parallelogram with base ${n(b)} cm and height ${h} cm.`, w: [`A = ${n(b)} × ${h}`, `= ${n(b * h)} ${sq('cm')}`] }; },
    ],
    c: [
      ({ ri }) => { const b = ri(5, 15), h = ri(3, 10), s = h + ri(1, 4); return { q: `A parallelogram has a base of ${b} cm, a slanted side of ${s} cm and a height of ${h} cm. Find its area and its perimeter.`, w: [`A = ${b} × ${h} = ${b * h} ${sq('cm')}`, `P = 2 × ${b} + 2 × ${s} = ${2 * (b + s)} cm`] }; },
      ({ pick }) => { const [q, a] = pick([['A rectangle and a parallelogram have the same base and the same height. Compare their areas.', 'They are equal: both are base × height.'], ['Why do we use the height, not the slanted side, for the area of a parallelogram?', 'Cut off the triangle at one end and move it: it makes a rectangle with that height.']]); return { q, a, n: 2, key: q }; },
      ({ ri }) => { const b = ri(4, 12), h = ri(3, 10); return { q: `A parallelogram of base ${b} m and height ${h} m is cut along a diagonal. Find the area of each triangle.`, w: [`parallelogram: ${b * h} ${sq('m')}`, `each triangle: ${n((b * h) / 2)} ${sq('m')}`] }; },
    ],
  },

  '8.08': {
    idea: 'Split a composite shape into rectangles and triangles, find each area, then add. Or find the area of a larger shape and subtract the part that is cut out.',
    ex: [['Find the area of the L-shape. (Not to scale.)', ['7 × 10 = 70, 5 × 6 = 30', `70 + 30 = 100 ${sq('cm')}`], lshape(12, 10, 5, 4)], ['A 12 cm × 8 cm card has a 3 cm × 2 cm hole cut out. Find the area left.', ['12 × 8 = 96, 3 × 2 = 6', `96 − 6 = 90 ${sq('cm')}`]], ['Find the area of the shape. (Not to scale.)', ['square: 10 × 8 = 80, triangle: ½ × 10 × 4 = 20', `80 + 20 = 100 ${sq('m')}`], house(10, 8, 4)]],
    look: ['8.05', '8.06'],
    e: [
      ({ ri }) => { const a = ri(3, 12), b = ri(2, 9), c = ri(2, 10), d = ri(2, 8); return { q: `A shape is made of a ${a} m × ${b} m rectangle and a ${c} m × ${d} m rectangle. Find its area.`, w: [`${a * b} + ${c * d}`, `= ${a * b + c * d} ${sq('m')}`] }; },
      ({ ri }) => { const l = ri(6, 15), w = ri(4, 10), a = ri(1, 3), b = ri(1, 3); return { q: `A ${l} cm × ${w} cm card has a ${a} cm × ${b} cm hole cut out. Find the area left.`, w: [`${l * w} − ${a * b}`, `= ${l * w - a * b} ${sq('cm')}`] }; },
    ],
    m: [
      ({ ri }) => { const w = ri(8, 16), h = ri(7, 14), cw = ri(2, w - 4), ch = ri(2, h - 4); return { q: 'Find the area. Split it into two rectangles. (Not to scale.)', fig: lshape(w, h, cw, ch), fh: 26, w: [`${w - cw} × ${h} = ${(w - cw) * h}`, `${cw} × ${h - ch} = ${cw * (h - ch)}`, `total: ${w * h - cw * ch} ${sq('cm')}`] }; },
      ({ ri }) => { const w = ri(6, 12) * 2, h = ri(4, 10), t = ri(2, 6); return { q: 'Find the area of the shape. (Not to scale.)', fig: house(w, h, t), fh: 26, w: [`rectangle: ${w} × ${h} = ${w * h}`, `triangle: ½ × ${w} × ${t} = ${(w * t) / 2}`, `total: ${w * h + (w * t) / 2} ${sq('m')}`] }; },
    ],
    c: [
      ({ ri }) => { const w = ri(8, 16), h = ri(7, 14), cw = ri(2, w - 4), ch = ri(2, h - 4); return { q: 'Find the area two ways: by adding and by subtracting. (Not to scale.)', fig: lshape(w, h, cw, ch), fh: 26, w: [`add: ${(w - cw) * h} + ${cw * (h - ch)}`, `subtract: ${w * h} − ${cw * ch}`, `= ${w * h - cw * ch} ${sq('cm')}`] }; },
      ({ ri }) => { const s = ri(6, 12), r = ri(2, s / 2 - 1); return { q: `A ${s} cm square has a triangle cut from one corner, with shorter sides of ${r * 2} cm and ${r * 2} cm. Find the area left.`, w: [`${s * s} − ½ × ${r * 2} × ${r * 2}`, `= ${s * s} − ${2 * r * r} = ${s * s - 2 * r * r} ${sq('cm')}`] }; },
      ({ ri }) => { const L = ri(10, 20), W = ri(6, 12); return { q: `A ${L} m × ${W} m garden has a ${L - 2} m × ${W - 4} m pond. The rest is lawn. Find the lawn's area.`, w: [`${L * W} − ${(L - 2) * (W - 4)}`, `= ${L * W - (L - 2) * (W - 4)} ${sq('m')}`] }; },
    ],
  },

  '8.09': {
    idea: 'A prism has the same cross-section all along its length and two identical ends. It is named after its cross-section. A solid can be drawn from the front, the side and the top.',
    ex: [['Name the prism.', ['the cross-section is a triangle', 'triangular prism'], D.triPrism({ w: 48, h: 32 })], ['How many faces, edges and vertices does a rectangular prism have?', ['6 faces, 12 edges', '8 vertices']], ['Is a square pyramid a prism? Explain.', ['its cross-section changes', 'no: it narrows to a point']]],
    look: ['6.08'],
    e: [
      ({ pick }) => { const [s, nm] = pick([['a triangle', 'triangular prism'], ['a rectangle', 'rectangular prism'], ['a pentagon', 'pentagonal prism'], ['a hexagon', 'hexagonal prism'], ['a square', 'square prism (or cube)'], ['an octagon', 'octagonal prism']]); return { q: `A prism has a cross-section that is ${s}. Name the prism.`, a: nm, key: s }; },
      ({ pick }) => { const [nm, f] = pick([['cube', 6], ['triangular prism', 5], ['rectangular prism', 6], ['pentagonal prism', 7], ['hexagonal prism', 8]]); return { q: `How many faces does a ${nm} have?`, a: String(f), key: nm }; },
      ({ pick }) => { const [s, y] = pick([['a cube', 'yes'], ['a square pyramid', 'no'], ['a cylinder', 'no (it has a curved surface)'], ['a triangular prism', 'yes'], ['a cone', 'no'], ['a sphere', 'no']]); return { q: `Is ${s} a prism?`, a: y, key: s }; },
    ],
    m: [
      ({ pick }) => { const [nm, k] = pick([['triangular', 3], ['rectangular', 4], ['pentagonal', 5], ['hexagonal', 6], ['octagonal', 8]]); return { q: `Find the number of faces, edges and vertices of a ${nm} prism.`, w: [`faces: ${k} + 2 = ${k + 2}, edges: 3 × ${k} = ${3 * k}`, `vertices: 2 × ${k} = ${2 * k}`], key: nm }; },
      ({ pick }) => { const [nm, k] = pick([['triangular', 3], ['rectangular', 4], ['pentagonal', 5], ['hexagonal', 6]]); return { q: `Check Euler's rule F + V − E = 2 for a ${nm} prism.`, w: [`F = ${k + 2}, V = ${2 * k}, E = ${3 * k}`, `${k + 2} + ${2 * k} − ${3 * k} = 2 ✓`], key: `e${nm}` }; },
      ({ pick }) => { const [v, d] = pick([['front', 'a rectangle 3 cm wide and 2 cm high'], ['top', 'a rectangle 3 cm by 1 cm'], ['side', 'a rectangle 1 cm wide and 2 cm high']]); return { q: `A box is 3 cm long, 1 cm deep and 2 cm high. Describe its ${v} view.`, a: d, key: v }; },
    ],
    c: [
      ({ pick }) => { const [solid, v, ans] = pick([['triangular prism lying on a rectangular face', 'front (looking at a triangle end)', 'a triangle'], ['triangular prism lying on a rectangular face', 'top', 'a rectangle (with a line along the middle)'], ['cylinder standing up', 'top', 'a circle'], ['cylinder standing up', 'front', 'a rectangle'], ['square pyramid', 'top', 'a square with its two diagonals']]); return { q: `Draw the ${v} view of a ${solid}.`, fig: D.drawSpace({ w: 54, h: 20, ray: false }), n: 0, a: ans, key: solid + v }; },
      ({ ri }) => { const k = ri(7, 12); return { q: `A prism has ${k + 2} faces. What shape is its cross-section, and how many edges does it have?`, w: [`${k + 2} − 2 = ${k} sides`, `a ${k}-sided polygon; ${3 * k} edges`] }; },
      ({ pick }) => { const [q, a] = pick([['Can a prism have 7 edges? Explain.', 'No. A prism has 3 × (number of sides) edges: 9, 12, 15, …'], ['A prism has 12 vertices. Name it.', 'hexagonal prism (6 × 2 = 12)']]); return { q, a, n: 2, key: q }; },
    ],
  },

  '8.10': {
    idea: '1 cm³ = 1000 mm³ (10 × 10 × 10). 1 m³ = 1 000 000 cm³ (100 × 100 × 100). A 1 cm³ space holds 1 mL, and 1 m³ holds 1000 L.',
    ex: [[`Change 5 ${cu('cm')} to ${cu('mm')}.`, ['× 1000', `= 5 000 ${cu('mm')}`]], [`Change 2.5 ${cu('m')} to ${cu('cm')}.`, ['× 1 000 000', `= 2 500 000 ${cu('cm')}`]], [`How many litres does 3 ${cu('m')} hold?`, [`1 ${cu('m')} = 1000 L`, '3 000 L']]],
    look: ['8.04', '8.01'],
    e: [
      ({ ri }) => { const x = ri(2, 30); return { q: `Change ${x} ${cu('cm')} to ${cu('mm')}.`, a: `${n(x * 1000)} ${cu('mm')}` }; },
      ({ ri }) => { const x = ri(2, 900); return { q: `How many millilitres does ${x} ${cu('cm')} hold?`, a: `${x} mL` }; },
      ({ ri }) => { const x = ri(2, 9); return { q: `How many litres does ${x} ${cu('m')} hold?`, a: `${n(x * 1000)} L` }; },
    ],
    m: [
      ({ ri }) => { const x = ri(2, 95) * 1000; return { q: `Change ${n(x)} ${cu('mm')} to ${cu('cm')}.`, w: ['÷ 1000', `= ${n(x / 1000)} ${cu('cm')}`] }; },
      ({ ri, pick }) => { const x = ri(2, 9) + pick([0, 0.5]); return { q: `Change ${n(x)} ${cu('m')} to ${cu('cm')}.`, w: [`1 ${cu('m')} = 100 × 100 × 100 = 1 000 000 ${cu('cm')}`, `= ${n(x * 1e6)} ${cu('cm')}`] }; },
      ({ ri }) => { const x = ri(2, 30) * 100; return { q: `Change ${n(x)} ${cu('cm')} to litres.`, w: [`${n(x)} ${cu('cm')} = ${n(x)} mL`, `= ${n(x / 1000)} L`] }; },
    ],
    c: [
      ({ ri }) => { const a = ri(2, 9) / 10, b = ri(2, 9) * 10000; return Math.abs(a * 1e6 - b) < 1 ? null : { q: `Which is larger: ${n(a)} ${cu('m')} or ${n(b)} ${cu('cm')}?`, w: [`${n(a)} ${cu('m')} = ${n(a * 1e6)} ${cu('cm')}`, `larger: ${a * 1e6 > b ? `${n(a)} ${cu('m')}` : `${n(b)} ${cu('cm')}`}`] }; },
      ({ ri }) => { const L = ri(2, 6) * 10; return { q: `A cube-shaped tank has sides of ${L} cm. How many litres does it hold?`, w: [`${L} × ${L} × ${L} = ${n(L ** 3)} ${cu('cm')}`, `= ${n(L ** 3 / 1000)} L`] }; },
      ({ ri }) => { const x = ri(15, 60) / 10; return { q: `A pool holds ${n(x)} ${cu('m')} of water. How many litres is that?`, a: `${n(x * 1000)} L` }; },
    ],
  },

  '8.11': {
    idea: 'Volume of a rectangular prism = length × width × height. Volume is measured in cubic units, such as cm³ and m³.',
    ex: [['Find the volume of a box 5 cm long, 4 cm wide and 3 cm high.', ['V = 5 × 4 × 3', `= 60 ${cu('cm')}`]], ['Find the volume of a cube with sides of 4 cm.', ['V = 4 × 4 × 4', `= 64 ${cu('cm')}`]], [`A box has a volume of 120 ${cu('cm')}. It is 6 cm long and 5 cm wide. Find its height.`, ['120 = 6 × 5 × h = 30h', 'h = 4 cm']]],
    look: ['8.10', '8.05'],
    e: [
      ({ ri }) => { const l = ri(2, 12), w = ri(2, 9), h = ri(2, 9); return { q: `Find the volume of a box ${l} cm long, ${w} cm wide and ${h} cm high.`, a: `${l * w * h} ${cu('cm')}` }; },
      ({ ri }) => { const l = ri(3, 12), w = ri(2, 8), h = ri(2, 8); return { q: 'Find the volume.', fig: D.box({ l: `${l} m`, wd: `${w} m`, ht: `${h} m`, w: 56, h: 34 }), a: `${l * w * h} ${cu('m')}` }; },
      ({ ri }) => { const s = ri(2, 10); return { q: `Find the volume of a cube with sides of ${s} cm.`, a: `${s ** 3} ${cu('cm')}` }; },
    ],
    m: [
      ({ ri }) => { const l = ri(3, 12), w = ri(2, 8), h = ri(2, 8); return { q: 'Find the volume. Write the formula first.', fig: D.box({ l: `${l} cm`, wd: `${w} cm`, ht: `${h} cm`, w: 56, h: 34 }), w: [`V = ${l} × ${w} × ${h}`, `= ${l * w * h} ${cu('cm')}`] }; },
      ({ ri }) => { const l = ri(3, 12), w = ri(2, 9), h = ri(2, 9); return { q: `A box has a volume of ${l * w * h} ${cu('cm')}. It is ${l} cm long and ${w} cm wide. Find its height.`, w: [`${l * w * h} = ${l} × ${w} × h = ${l * w}h`, `h = ${h} cm`] }; },
      ({ ri }) => { const l = ri(11, 49) / 10, w = ri(2, 5), h = ri(2, 5); return { q: `Find the volume of a box ${n(l)} m by ${w} m by ${h} m.`, w: [`V = ${n(l)} × ${w} × ${h}`, `= ${n(l * w * h)} ${cu('m')}`] }; },
    ],
    c: [
      ({ ri }) => { const l = ri(3, 8) * 10, w = ri(2, 6) * 10, h = ri(2, 5) * 10; return { q: `A fish tank is ${l} cm by ${w} cm by ${h} cm. How many litres does it hold?`, w: [`V = ${n(l * w * h)} ${cu('cm')}`, `= ${n((l * w * h) / 1000)} L`] }; },
      ({ ri }) => { const a = ri(2, 5) * 2, b = ri(2, 5) * 2, c = ri(2, 5) * 2; return { q: `How many 2 cm cubes fit in a box ${a} cm by ${b} cm by ${c} cm?`, w: [`${a / 2} × ${b / 2} × ${c / 2}`, `= ${(a * b * c) / 8} cubes`] }; },
      ({ ri }) => { const s = ri(2, 5); return { q: `A cube's sides are doubled from ${s} cm to ${2 * s} cm. How many times larger is the volume?`, w: [`${s ** 3} → ${(2 * s) ** 3} ${cu('cm')}`, '8 times larger'] }; },
    ],
  },

  '8.12': {
    idea: 'The volume of any prism = the area of its cross-section × its length: V = Ah. Find the area of the end first, then multiply by the length.',
    ex: [[`A prism has a cross-section of 15 ${sq('cm')} and a length of 8 cm. Find its volume.`, ['V = 15 × 8', `= 120 ${cu('cm')}`]], ['A triangular prism has a triangle of base 6 cm and height 4 cm, and is 10 cm long. Find its volume.', ['A = ½ × 6 × 4 = 12', `V = 12 × 10 = 120 ${cu('cm')}`], D.triPrism({ base: '6 cm', tri: '4 cm', len: '10 cm', w: 54, h: 34 })], [`A prism has a volume of 96 ${cu('m')} and a cross-section of 12 ${sq('m')}. How long is it?`, ['96 = 12 × h', 'h = 8 m']]],
    exH: 70, exFh: 22,
    look: ['8.11', '8.06'],
    e: [
      ({ ri }) => { const A = ri(5, 40), h = ri(2, 15); return { q: `A prism has a cross-section of ${A} ${sq('cm')} and a length of ${h} cm. Find its volume.`, a: `${A * h} ${cu('cm')}` }; },
      ({ ri }) => { const b = ri(2, 6) * 2, t = ri(2, 8), L = ri(4, 15); return { q: `Find the area of the triangular end: base ${b} cm, height ${t} cm.`, a: `${(b * t) / 2} ${sq('cm')}` }; },
    ],
    m: [
      ({ ri }) => { const b = ri(2, 6) * 2, t = ri(2, 8), L = ri(4, 15); return { q: 'Find the volume of the triangular prism.', fig: D.triPrism({ base: `${b} cm`, tri: `${t} cm`, len: `${L} cm`, w: 54, h: 34 }), w: [`A = ½ × ${b} × ${t} = ${(b * t) / 2}`, `V = ${(b * t) / 2} × ${L} = ${(b * t * L) / 2} ${cu('cm')}`] }; },
      ({ ri }) => { const A = ri(5, 30), h = ri(2, 15); return { q: `A prism has a volume of ${A * h} ${cu('m')} and a cross-section of ${A} ${sq('m')}. How long is it?`, w: [`${A * h} = ${A} × h`, `h = ${h} m`] }; },
    ],
    c: [
      ({ ri }) => { const w = ri(6, 12), h = ri(5, 10), cw = ri(2, w - 3), ch = ri(2, h - 3), L = ri(3, 10); return { q: `A prism has the L-shaped cross-section shown and is ${L} cm long. Find its volume. (Not to scale.)`, fig: lshape(w, h, cw, ch, [1, 1, 1, 1, 1, 1], ''), fh: 24, w: [`A = ${w * h} − ${cw * ch} = ${w * h - cw * ch} ${sq('cm')}`, `V = ${w * h - cw * ch} × ${L} = ${(w * h - cw * ch) * L} ${cu('cm')}`] }; },
      ({ ri }) => { const b = ri(2, 4), t = ri(2, 3), L = ri(3, 6); return { q: `A tent is a triangular prism. Its end is a triangle with base ${b} m and height ${t} m, and it is ${L} m long. Find its volume.`, w: [`A = ½ × ${b} × ${t} = ${n((b * t) / 2)} ${sq('m')}`, `V = ${n((b * t) / 2)} × ${L} = ${n((b * t * L) / 2)} ${cu('m')}`] }; },
      ({ ri }) => { const A = ri(6, 20), h = ri(2, 6); return { q: `Two prisms have the same cross-section, ${A} ${sq('cm')}. One is ${h} cm long and the other is ${3 * h} cm long. Compare their volumes.`, w: [`${A * h} and ${A * 3 * h} ${cu('cm')}`, 'the longer one has 3 times the volume'] }; },
    ],
  },

  '8.13': {
    idea: 'Capacity is how much a container holds. 1 L = 1000 mL. A space of 1 cm³ holds 1 mL, so 1000 cm³ holds 1 L, and 1 m³ holds 1000 L.',
    ex: [['Change 2.75 L to millilitres.', ['× 1000', '= 2 750 mL']], ['A box is 20 cm by 10 cm by 15 cm. How many litres does it hold?', [`V = 3 000 ${cu('cm')} = 3 000 mL`, '= 3 L']], ['A 2 000 L tank fills at 25 L a minute. How long does it take to fill?', ['2 000 ÷ 25', '= 80 minutes']]],
    look: ['8.11', '8.10'],
    e: [
      ({ ri }) => { const x = ri(11, 99) / 10; return { q: `Change ${n(x)} L to millilitres.`, a: `${n(x * 1000)} mL` }; },
      ({ ri }) => { const x = ri(150, 4500); return { q: `Change ${n(x)} mL to litres.`, a: `${n(x / 1000)} L` }; },
      ({ ri }) => { const x = ri(2, 900); return { q: `A container holds ${x} ${cu('cm')}. What is its capacity in millilitres?`, a: `${x} mL` }; },
    ],
    m: [
      ({ ri }) => { const l = ri(2, 6) * 10, w = ri(1, 3) * 10, h = ri(1, 3) * 5; return { q: `A box is ${l} cm by ${w} cm by ${h} cm. How many litres does it hold?`, w: [`V = ${n(l * w * h)} ${cu('cm')} = ${n(l * w * h)} mL`, `= ${n((l * w * h) / 1000)} L`] }; },
      ({ ri, pick }) => { const b = pick([250, 500]), c = ri(4, 12); return { q: `How many ${b} mL bottles can be filled from a ${c} L drum?`, w: [`${c} L = ${n(c * 1000)} mL`, `${n(c * 1000)} ÷ ${b} = ${n((c * 1000) / b)}`] }; },
    ],
    c: [
      ({ ri }) => { const T = ri(4, 20) * 100, r = ri(2, 8) * 5; return (T % r) ? null : { q: `A ${n(T)} L tank fills at ${r} L a minute. How long does it take to fill?`, w: [`${n(T)} ÷ ${r}`, `= ${n(T / r)} minutes`] }; },
      ({ ri }) => { const l = ri(2, 5), w = ri(1, 3), h = ri(1, 2); return { q: `A pool is ${l} m by ${w} m by ${h} m deep. How many litres does it hold?`, w: [`V = ${l * w * h} ${cu('m')}`, `= ${n(l * w * h * 1000)} L`] }; },
      ({ ri }) => { const l = ri(3, 6) * 10, w = ri(2, 4) * 10, d = ri(2, 5); return { q: `Water is poured into a ${l} cm by ${w} cm tank until it is ${d} cm deep. How many litres is that?`, w: [`${l} × ${w} × ${d} = ${n(l * w * d)} ${cu('cm')}`, `= ${n((l * w * d) / 1000)} L`] }; },
    ],
  },
};
