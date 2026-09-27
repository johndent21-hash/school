// Skill drill pages for Chapter 8 Area and volume: page 1 practises the Easy basics, page 2 the Medium basics (lib/drill.js).
const { fmt } = require('../../lib/calc');
const D = require('../../lib/diagrams');

const n = (x, dp = 4) => fmt(x, dp);
const r1 = (x) => (Math.round(x * 10) / 10).toFixed(1);
const sq = (u) => `${u}<sup>2</sup>`, cu = (u) => `${u}<sup>3</sup>`;
// Unit conversions: [from, to, factor]
const LEN = [['km', 'm', 1000], ['m', 'cm', 100], ['cm', 'mm', 10], ['m', 'mm', 1000]];
const MASS = [['kg', 'g', 1000], ['t', 'kg', 1000], ['g', 'mg', 1000]];
const CAP = [['L', 'mL', 1000], ['kL', 'L', 1000]];
const AREA = [[sq('cm'), sq('mm'), 100], [sq('m'), sq('cm'), 10000], ['ha', sq('m'), 10000], [sq('km'), 'ha', 100]];
const VOL = [[cu('cm'), cu('mm'), 1000], [cu('m'), cu('cm'), 1000000]];
const conv = (ri, pick, table, big = false) => { const [a, b, k] = pick(table); const x = big ? ri(1, 99) / pick([1, 10]) : ri(1, 60) / pick([1, 1, 10, 100]); return ri(0, 1) ? [`${n(x)} ${a} to ${b}`, `${n(x * k)} ${b}`] : [`${n(x * k)} ${b} to ${a}`, `${n(x)} ${a}`]; };
// An L-shape from a w × h rectangle with a cw × ch corner cut off (all measurements labelled).
const lshape = (w, h, cw, ch) => {
  const s = 30 / Math.max(w, h), W = w * s, H = h * s, CW = cw * s, CH = ch * s;
  const pts = [[0, 0], [W - CW, 0], [W - CW, CH], [W, CH], [W, H], [0, H]].map(([x, y]) => [x + 5, y + 5]);
  return D.polygon({ pts, sides: [`${w - cw}`, `${ch}`, `${cw}`, `${h - ch}`, `${w}`, `${h}`], w: W + 14, h: H + 12 });
};

module.exports = {
  '8.01': ({ round, ri, pick }) => ({
    easy: [
      round('convert. Big unit to small unit: multiply. Small to big: divide.', 24, () => conv(ri, pick, [...LEN, ...MASS, ...CAP]), { cols: 3 }),
      round('convert the time.', 16, () => { const k = ri(0, 3); const x = ri(1, 12); return [[`${x} h to min`, `${x * 60} min to h`, `${x} min to s`, `${x} days to h`][k], [`${x * 60} min`, `${x} h`, `${x * 60} s`, `${x * 24} h`][k]]; }),
    ],
    medium: [
      round('convert.', 16, () => conv(ri, pick, [...LEN, ...MASS, ...CAP], true)),
      round('convert the time. Write your answer in the unit given.', 12, () => { const k = ri(0, 2), x = ri(1, 9) + pick([0.25, 0.5, 0.75]); return [[`${n(x)} h to min`, `${x * 60} min to h`, `${n(x)} days to h`][k], [`${n(x * 60)} min`, `${n(x)} h`, `${n(x * 24)} h`][k]]; }, { cols: 3 }),
    ],
  }),
  '8.02': ({ round, ri, pick }) => ({
    easy: [
      round('find the perimeter of the rectangle.', 24, () => { const l = ri(2, 30), w = ri(1, l); return [`${l} m by ${w} m`, `${2 * (l + w)} m`]; }),
      round('find the perimeter of the regular shape.', 16, () => { const [s, k] = pick([['square', 4], ['equilateral triangle', 3], ['regular pentagon', 5], ['regular hexagon', 6], ['regular octagon', 8]]), a = ri(2, 25); return [`${s}, side ${a} cm`, `${a * k} cm`]; }, { cols: 2 }),
    ],
    medium: [
      round('the perimeter and one side of a rectangle are given. Find the other side.', 15, () => { const l = ri(3, 40), w = ri(1, l); return [`P = ${2 * (l + w)} m, length ${l} m`, `${w} m`]; }, { cols: 3 }),
      round('find the perimeter. Change to the same unit first.', 12, () => { const l = ri(1, 9), w = ri(10, 90); return [`${l} m by ${w} cm`, `${n(2 * (l + w / 100))} m (or ${2 * (l * 100 + w)} cm)`]; }, { cols: 3 }),
    ],
  }),
  '8.03': ({ round, ri }) => ({
    easy: [
      round('find the circumference, C = πd. Round to 1 decimal place.', 20, () => { const d = ri(2, 40); return [`d = ${d} cm`, `${r1(Math.PI * d)} cm`]; }),
      round('find the circumference, C = 2πr. Round to 1 decimal place.', 16, () => { const r = ri(1, 25); return [`r = ${r} m`, `${r1(2 * Math.PI * r)} m`]; }),
    ],
    medium: [
      round('the circumference is given. Find the diameter, d = C ÷ π (1 d.p.).', 12, () => { const c = ri(10, 150); return [`C = ${c} cm`, `${r1(c / Math.PI)} cm`]; }, { cols: 3 }),
      round('find the perimeter of the semicircle: half the circumference plus the diameter (1 d.p.).', 12, () => { const d = ri(4, 30); return [`d = ${d} cm`, `${r1((Math.PI * d) / 2 + d)} cm`]; }, { cols: 3 }),
    ],
  }),
  '8.04': ({ round, ri, pick }) => ({
    easy: [
      round(`convert. 1 ${sq('cm')} = 100 ${sq('mm')}, 1 ${sq('m')} = 10 000 ${sq('cm')}, 1 ha = 10 000 ${sq('m')}.`, 24, () => conv(ri, pick, AREA), { cols: 3 }),
      round('convert.', 16, () => { const [a, b, k] = pick(AREA.slice(0, 2)), x = ri(1, 30); return [`${x} ${a} to ${b}`, `${n(x * k)} ${b}`]; }),
    ],
    medium: [
      round('convert.', 16, () => conv(ri, pick, AREA, true)),
      round('which unit would you use to measure the area? Write mm², cm², m², ha or km².', 12, () => pick([['a stamp', sq('mm') + ' or ' + sq('cm')], ['a classroom floor', sq('m')], ['a farm', 'ha'], ['a country', sq('km')], ['a book cover', sq('cm')], ['a football field', sq('m') + ' or ha'], ['a fingernail', sq('mm')],
        ['a house block', sq('m')], ['a national park', sq('km') + ' or ha'], ['a mobile phone screen', sq('cm')], ['a tennis court', sq('m')], ['a lake', sq('km') + ' or ha'], ['a postcard', sq('cm')], ['a city', sq('km')]]), { cols: 3 }),
    ],
  }),
  '8.05': ({ round, ri }) => ({
    easy: [
      round('find the area of the rectangle, A = lw.', 24, () => { const l = ri(2, 20), w = ri(1, l); return [`${l} m by ${w} m`, `${l * w} ${sq('m')}`]; }),
      round('find the area of the square, A = s².', 16, () => { const s = ri(1, 20); return [`side ${s} cm`, `${s * s} ${sq('cm')}`]; }),
    ],
    medium: [
      round('the area and one side of a rectangle are given. Find the other side.', 15, () => { const l = ri(2, 20), w = ri(2, 15); return [`A = ${l * w} ${sq('m')}, width ${w} m`, `${l} m`]; }, { cols: 3 }),
      round('find the area.', 12, () => { const l = ri(11, 99) / 10, w = ri(2, 12); return [`${n(l)} cm by ${w} cm`, `${n(l * w)} ${sq('cm')}`]; }, { cols: 3 }),
    ],
  }),
  '8.06': ({ round, ri }) => ({
    easy: [
      round('find the area of the triangle, A = ½ × b × h.', 24, () => { const b = ri(2, 20), h = ri(2, 20); return (b * h) % 2 ? ['', ''] : [`b = ${b} cm, h = ${h} cm`, `${(b * h) / 2} ${sq('cm')}`]; }, { cols: 3 }),
      round('find the area of the triangle.', 16, () => { const b = ri(3, 25), h = ri(3, 25); return [`b = ${b} m, h = ${h} m`, `${n((b * h) / 2)} ${sq('m')}`]; }),
    ],
    medium: [
      round('the area and the base are given. Find the height, h = 2A ÷ b.', 12, () => { const b = ri(2, 20), h = ri(2, 20); return (b * h) % 2 ? ['', ''] : [`A = ${(b * h) / 2} ${sq('cm')}, b = ${b} cm`, `${h} cm`]; }, { cols: 3 }),
      round('find the area of the triangle.', 12, () => { const b = ri(11, 99) / 10, h = ri(2, 12); return [`b = ${n(b)} m, h = ${h} m`, `${n((b * h) / 2)} ${sq('m')}`]; }, { cols: 3 }),
    ],
  }),
  '8.07': ({ round, ri }) => ({
    easy: [
      round('find the area of the parallelogram, A = bh.', 24, () => { const b = ri(2, 20), h = ri(2, 15); return [`b = ${b} m, h = ${h} m`, `${b * h} ${sq('m')}`]; }, { cols: 3 }),
      round('find the area of the parallelogram.', 16, () => { const b = ri(10, 40), h = ri(5, 25); return [`b = ${b} cm, h = ${h} cm`, `${b * h} ${sq('cm')}`]; }),
    ],
    medium: [
      round('the area and one measurement are given. Find the other.', 12, () => { const b = ri(2, 20), h = ri(2, 15); return ri(0, 1) ? [`A = ${b * h} ${sq('m')}, b = ${b} m. Find h.`, `${h} m`] : [`A = ${b * h} ${sq('m')}, h = ${h} m. Find b.`, `${b} m`]; }, { cols: 3 }),
      round('find the area.', 12, () => { const b = ri(11, 99) / 10, h = ri(11, 49) / 10; return [`b = ${n(b)} m, h = ${n(h)} m`, `${n(b * h)} ${sq('m')}`]; }, { cols: 3 }),
    ],
  }),
  '8.08': ({ round, ri }) => ({
    easy: [
      round('find the area of the rectangle with a rectangular hole cut out (subtract).', 14, () => { const l = ri(8, 20), w = ri(6, 14), a = ri(2, 5), b = ri(2, 5); return [`${l} cm × ${w} cm rectangle, ${a} cm × ${b} cm hole`, `${l * w - a * b} ${sq('cm')}`]; }, { cols: 2 }),
      round('the shape is made of two rectangles. Find the total area (add).', 14, () => { const a = ri(3, 12), b = ri(2, 9), c = ri(2, 10), d = ri(2, 8); return [`${a} m × ${b} m and ${c} m × ${d} m`, `${a * b + c * d} ${sq('m')}`]; }, { cols: 2 }),
    ],
    medium: [
      round('find the area of the L-shape. Split it into two rectangles.', 6, () => { const w = ri(6, 14), h = ri(6, 14), cw = ri(2, w - 3), ch = ri(2, h - 3); return [{ t: '', fig: lshape(w, h, cw, ch) }, `${w * h - cw * ch} (units²)`]; }, { cols: 3, work: true }),
      round('find the area: a rectangle with a triangle on top.', 6, () => { const l = ri(4, 12), w = ri(3, 10), th = ri(2, 8); return (l * th) % 2 ? ['', ''] : [`rectangle ${l} m × ${w} m, triangle base ${l} m, height ${th} m`, `${l * w + (l * th) / 2} ${sq('m')}`]; }, { cols: 3, work: true }),
    ],
  }),
  '8.09': ({ list }) => ({
    easy: [
      list('name the shape of the cross-section.', [['triangular prism', 'triangle'], ['rectangular prism', 'rectangle'], ['pentagonal prism', 'pentagon'], ['hexagonal prism', 'hexagon'], ['octagonal prism', 'octagon'], ['cube', 'square'],
        ['cylinder', 'circle'], ['square prism', 'square'], ['a Toblerone box', 'triangle'], ['a cereal box', 'rectangle'], ['a pencil (six-sided)', 'hexagon'], ['a can of soup', 'circle']], { cols: 3 }),
      list('how many faces (F), vertices (V) and edges (E)?', [['cube', 'F 6, V 8, E 12'], ['rectangular prism', 'F 6, V 8, E 12'], ['triangular prism', 'F 5, V 6, E 9'], ['pentagonal prism', 'F 7, V 10, E 15'],
        ['hexagonal prism', 'F 8, V 12, E 18'], ['square pyramid', 'F 5, V 5, E 8'], ['triangular pyramid', 'F 4, V 4, E 6'], ['octagonal prism', 'F 10, V 16, E 24']], { cols: 2 }),
    ],
    medium: [
      list('is it a prism? Write yes or no.', [['cube', 'yes'], ['cylinder', 'no (curved surface)'], ['square pyramid', 'no'], ['triangular prism', 'yes'], ['cone', 'no'], ['rectangular prism', 'yes'], ['sphere', 'no'], ['hexagonal prism', 'yes'],
        ['a brick', 'yes'], ['a tent with triangle ends', 'yes'], ['a party hat', 'no'], ['a book', 'yes']], { cols: 3 }),
      list('a prism has this cross-section. How many faces, vertices and edges does it have?', [['triangle', 'F 5, V 6, E 9'], ['square', 'F 6, V 8, E 12'], ['pentagon', 'F 7, V 10, E 15'], ['hexagon', 'F 8, V 12, E 18'], ['heptagon (7 sides)', 'F 9, V 14, E 21'],
        ['octagon', 'F 10, V 16, E 24'], ['decagon (10 sides)', 'F 12, V 20, E 30'], ['12-sided polygon', 'F 14, V 24, E 36']], { cols: 2 }),
    ],
  }),
  '8.10': ({ round, ri, pick }) => ({
    easy: [
      round(`convert. 1 ${cu('cm')} = 1000 ${cu('mm')}, 1 ${cu('m')} = 1 000 000 ${cu('cm')}.`, 24, () => conv(ri, pick, VOL), { cols: 3 }),
      round(`convert. 1 ${cu('cm')} = 1 mL.`, 16, () => { const x = ri(1, 999), k = ri(0, 2); return [[`${x} ${cu('cm')} to mL`, `${x} mL to ${cu('cm')}`, `${x * 10} ${cu('cm')} to L`][k], [`${x} mL`, `${x} ${cu('cm')}`, `${n(x / 100)} L`][k]]; }),
    ],
    medium: [
      round('convert.', 16, () => conv(ri, pick, VOL, true)),
      round(`convert. 1 ${cu('m')} = 1000 L = 1 kL.`, 12, () => { const x = ri(1, 99) / pick([1, 10]); return ri(0, 1) ? [`${n(x)} ${cu('m')} to L`, `${n(x * 1000)} L`] : [`${n(x * 1000)} L to ${cu('m')}`, `${n(x)} ${cu('m')}`]; }, { cols: 3 }),
    ],
  }),
  '8.11': ({ round, ri }) => ({
    easy: [
      round('find the volume of the rectangular prism, V = lwh.', 24, () => { const l = ri(2, 12), w = ri(2, 10), h = ri(1, 9); return [`${l} × ${w} × ${h} cm`, `${l * w * h} ${cu('cm')}`]; }, { cols: 3 }),
      round('find the volume of the cube, V = s³.', 16, () => { const s = ri(1, 12), u = ri(0, 1) ? 'm' : 'cm'; return [`side ${s} ${u}`, `${s ** 3} ${cu(u)}`]; }),
    ],
    medium: [
      round('the volume and two measurements are given. Find the third.', 12, () => { const l = ri(2, 12), w = ri(2, 10), h = ri(2, 9); return [`V = ${l * w * h} ${cu('cm')}, l = ${l} cm, w = ${w} cm. Find h.`, `${h} cm`]; }, { cols: 3 }),
      round('find the volume.', 12, () => { const l = ri(11, 60) / 10, w = ri(2, 8), h = ri(2, 6); return [`${n(l)} m × ${w} m × ${h} m`, `${n(l * w * h)} ${cu('m')}`]; }, { cols: 3 }),
    ],
  }),
  '8.12': ({ round, ri }) => ({
    easy: [
      round('find the volume of the prism, V = Ah (A = area of the cross-section, h = length).', 24, () => { const a = ri(3, 60), h = ri(2, 15); return [`A = ${a} ${sq('cm')}, h = ${h} cm`, `${a * h} ${cu('cm')}`]; }, { cols: 3 }),
      round('triangular prism: find the area of the triangle, then the volume.', 12, () => { const b = ri(2, 12), t = ri(2, 12), l = ri(3, 20); return (b * t) % 2 ? ['', ''] : [`triangle b = ${b} cm, h = ${t} cm; length ${l} cm`, `${((b * t) / 2) * l} ${cu('cm')}`]; }, { cols: 3 }),
    ],
    medium: [
      round('the volume and the area of the cross-section are given. Find the length.', 12, () => { const a = ri(3, 40), h = ri(2, 15); return [`V = ${a * h} ${cu('m')}, A = ${a} ${sq('m')}`, `${h} m`]; }, { cols: 3 }),
      round('find the volume. Show your working.', 9, () => { const b = ri(3, 12), t = ri(2, 10), l = ri(5, 25); return [`triangular prism: base ${b} m, height ${t} m, length ${l} m`, `${n(((b * t) / 2) * l)} ${cu('m')}`]; }, { cols: 3, work: true }),
    ],
  }),
  '8.13': ({ round, ri, pick }) => ({
    easy: [
      round('convert. 1 L = 1000 mL, 1 kL = 1000 L.', 24, () => conv(ri, pick, CAP), { cols: 3 }),
      round(`convert. 1 ${cu('cm')} = 1 mL, 1000 ${cu('cm')} = 1 L.`, 16, () => { const x = ri(1, 50) * 100; return ri(0, 1) ? [`${x} ${cu('cm')} to L`, `${n(x / 1000)} L`] : [`${n(x / 1000)} L to ${cu('cm')}`, `${x} ${cu('cm')}`]; }),
    ],
    medium: [
      round('find the capacity of the box in litres.', 12, () => { const l = ri(2, 6) * 10, w = ri(1, 5) * 10, h = ri(1, 5) * 5; return [`${l} cm × ${w} cm × ${h} cm`, `${n((l * w * h) / 1000)} L`]; }, { cols: 3 }),
      round('how many can be filled?', 12, () => { const c = pick([200, 250, 300, 500, 750]), t = pick([1, 1.5, 2, 3, 4.5, 6, 9]); return (t * 1000) % c ? ['', ''] : [`${c} mL cups from ${n(t)} L`, `${(t * 1000) / c} cups`]; }, { cols: 3 }),
    ],
  }),
};
