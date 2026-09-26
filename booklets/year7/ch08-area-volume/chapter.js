// Year 7 Chapter 8: Area and volume. One 4-page lesson per exercise in Test Yourself 8.
const lesson = require('../../lib/lesson');
const D = require('../../lib/diagrams');
const { svg, text } = require('../../lib/graphs');
const { fmt } = require('../../lib/calc');

const n = (x, dp = 4) => fmt(x, dp);
const sq = (u) => `${u}<sup>2</sup>`;
const cu = (u) => `${u}<sup>3</sup>`;
const T = (x, y, s, o = {}) => text(x, y, s, { size: 3, anchor: 'middle', ...o });

// Rectangle with its length below and width on the right.
const rect = (len, wid, W = 30, H = 18, o = {}) => D.fit([[0, 0], [W, 0], [W, H], [0, H]], { sides: ['', wid, len, ''], fill: '#eef1f9', ...o });
// Triangle with base below and a dashed perpendicular height.
const tri = (base, ht, W = 30, H = 20, ax = 10) => D.fit([[0, H], [W, H], [ax, 0]], { sides: [base, '', ''], dash: [[[ax, 0], [ax, H]]], labels: [[ht, ax + 5, H / 2 + 1]], fill: '#eef1f9' });
const para = (base, ht, W = 28, H = 16, s = 8, o = {}) => D.fit([[0, H], [W, H], [W + s, 0], [s, 0]], { sides: [base, '', '', ''], dash: [[[s, 0], [s, H]]], labels: [[ht, s + 4.5, H / 2 + 1]], fill: '#eef1f9', ...o });
const circ = (label, diameter = false) => D.circle({ label, diameter, w: 28, h: 28 });
// Shaded rectangle with rectangular holes: dims in drawing mm; labels [[text, x, y]].
const shade = (W, H, holes, labels, extra = '') => {
  const m = 6;
  let b = `<rect x="${m}" y="${m}" width="${W}" height="${H}" fill="#9fb3e6" stroke="#3d3b3c" stroke-width="0.45"/>`;
  holes.forEach(([x, y, w, h]) => { b += `<rect x="${m + x}" y="${m + y}" width="${w}" height="${h}" fill="#fff" stroke="#3d3b3c" stroke-width="0.4"/>`; });
  labels.forEach(([t, x, y]) => { b += T(m + x, m + y, t); });
  return svg(W + 2 * m, H + 2 * m, b + extra);
};
const box = (l, wd, ht) => D.box({ l, wd, ht, w: 54, h: 34, L: 26, H: 14, D: 10 });
const prismF = (pts, labels, d = [10, -7]) => D.prism({ pts, labels, d });

module.exports = {
  year: 7, stage: 4, number: 8, title: 'Area and volume', accent: '#8d5524',
  fileName: 'Year7-Ch08-Area-and-volume',
  goals: ['convert units of length, mass, capacity and time', 'find perimeter and circumference', 'convert area units and find the area of rectangles, triangles, parallelograms and composite shapes',
    'draw cross-sections and views of prisms', 'convert volume units and find the volume of prisms', 'find capacity in litres'],
  syllabus: 'NSW Mathematics K–10 Syllabus (2022), Stage 4 Measurement and space: MA4-LEN-C-01 (length and circumference), MA4-ARE-C-01 (area) and MA4-VOL-C-01 (volume and capacity).',
  lessons: [
    lesson({
      code: '8.01', title: 'Units of measurement',
      li: ['convert between units of length, mass, capacity and time'],
      sc: ['know the metric prefixes: kilo, centi, milli', 'multiply to convert to a smaller unit, divide to convert to a larger unit', 'convert units of time'],
      terms: ['Metric', 'Convert'],
      we: ['Convert 3200 m to km.', 'Convert 0.042 kg to g.', 'Convert 8.3 L to mL.', 'Convert 240 min to h.', 'Convert 15 h to seconds.', 'How many minutes has Isla lived by her 12th birthday? (365 days a year)'],
      a: { text: 'Convert.', kind: 'short', items: ['3200 m to km', '904 cm to mm', '7150 mm to m', '0.042 kg to g', '3.5 kg to t', '125 L to kL'] },
      b: { text: 'Convert.', kind: 'short', items: ['8.3 L to mL', '4.2 kL to mL', '240 min to h', '15 h to min', '2.5 days to h', '17 000 000 mg to kg'] },
      c: { text: 'Convert. Show your working.', kind: 'work', cols: 3, items: ['15 h to s', '0.65 km to cm', '4500 g to kg', '3 h 20 min to min', '750 mL to L', '1 week to min'] },
      d: { text: 'Problems.', kind: 'work', items: ['How many minutes has Isla lived by her 12th birthday? (365 days a year)', 'A recipe needs 350 g of flour for one cake. How many kg for 12 cakes?', 'A tap drips 5 mL a minute. How many litres in one day?', 'Order from smallest to largest: 1.2 km, 950 m, 125 000 cm, 1 100 000 mm.'] },
      ext: { q: 'Light travels 300 000 km in one second. How far does it travel in one hour?', steps: ['1 hour = 3600 s', '300 000 × 3600'], a: '1 080 000 000 km', qs: ['Your heart beats about 70 times a minute. About how many times does it beat in a year?', 'Convert 1 million seconds to days (1 d.p.).'] },
      summary: { title: 'Conversions', steps: ['km → m × 1000, m → cm × 100, cm → mm × 10.', 'kg → g × 1000, t → kg × 1000, L → mL × 1000.', 'Bigger unit → smaller unit: multiply. Smaller → bigger: divide.', 'Time: 60 s = 1 min, 60 min = 1 h, 24 h = 1 day.'],
        worked: [['3200 m to km', ['÷ 1000'], '3.2 km'], ['8.3 L to mL', ['× 1000'], '8300 mL'], ['15 h to s', ['15 × 60 × 60'], '54 000 s'], ['Light in 1 hour', ['300 000 × 3600'], '1 080 000 000 km']] },
      exit: { qs: ['Convert 4.5 m to cm.', 'Convert 2750 g to kg.', 'Convert 3.5 h to minutes.'] },
      ans: { we: ['3.2 km', '42 g', '8300 mL', '4 h', '54 000 s', `${n(12 * 365 * 24 * 60)} min (B)`], a: ['3.2 km', '9040 mm', '7.15 m', '42 g', '0.0035 t', '0.125 kL'], b: ['8300 mL', '4 200 000 mL', '4 h', '900 min', '60 h', '17 kg'],
        c: ['54 000 s', '65 000 cm', '4.5 kg', '200 min', '0.75 L', '10 080 min'], d: [`${n(12 * 365 * 24 * 60)} min`, '4.2 kg', '7.2 L', '950 m, 1 100 000 mm, 1.2 km, 125 000 cm'], ext: [`about ${n(70 * 60 * 24 * 365)}`, '11.6 days'], exit: ['450 cm', '2.75 kg', '210 min'] },
    }),

    lesson({
      code: '8.02', title: 'Perimeter',
      li: ['find the perimeter of shapes'],
      sc: ['add all the side lengths', 'find missing side lengths first', 'use the same units for every side'],
      terms: ['Perimeter', 'Composite shape'],
      we: [{ t: 'Find the perimeter of the square.', fig: D.fit([[0, 0], [20, 0], [20, 20], [0, 20]], { sides: ['', '', '13 m', ''], ticks: [[0, 1], [1, 1], [2, 1], [3, 1]] }) }, { t: 'Find the perimeter.', fig: rect('13 mm', '5 mm') },
        { t: 'Find the perimeter.', fig: D.fit([[0, 0], [34, 0], [34, 10], [20, 10], [20, 22], [0, 22]], { sides: ['22 cm', '6 cm', '', '', '', '17 cm'] }) }, 'Find the perimeter of a rectangle 2.4 m by 85 cm (in cm).',
        { t: 'Find the perimeter.', fig: D.fit([[0, 0], [36, 0], [36, 20], [24, 20], [24, 12], [12, 12], [12, 20], [0, 20]], { sides: ['36 mm', '20 mm', '', '8 mm', '12 mm', '', '', '20 mm'] }) }, 'A square has perimeter 46 cm. Find its side length.'],
      a: { text: 'Find the perimeter.', kind: 'work', cols: 3, items: [{ t: '', fig: rect('15 cm', '8 cm') }, { t: '', fig: D.fit([[0, 18], [26, 18], [10, 0]], { sides: ['26 m', '24 m', '18 m'] }) }, { t: '', fig: rect('9 mm', '9 mm', 22, 22) },
        { t: '', fig: D.fit([[0, 16], [24, 16], [32, 0], [8, 0]], { sides: ['12 cm', '7 cm', '12 cm', '7 cm'] }) }, { t: '', fig: rect('4.5 m', '2.3 m') }, { t: '', fig: D.fit(D.fit ? [[12, 0], [24, 9], [19, 22], [5, 22], [0, 9]] : [], { sides: ['6 cm', '6 cm', '6 cm', '6 cm', '6 cm'] }) }] },
      b: { text: 'Find the perimeter.', kind: 'work', cols: 3, items: [{ t: '', fig: D.fit([[0, 0], [34, 0], [34, 10], [20, 10], [20, 22], [0, 22]], { sides: ['22 cm', '6 cm', '', '', '', '17 cm'] }) }, { t: '', fig: D.fit([[0, 0], [30, 0], [30, 22], [18, 22], [18, 12], [0, 12]], { sides: ['15 m', '11 m', '6 m', '', '', '5 m'] }) }, { t: '', fig: D.fit([[0, 0], [36, 0], [36, 20], [24, 20], [24, 12], [12, 12], [12, 20], [0, 20]], { sides: ['36 mm', '20 mm', '', '8 mm', '12 mm', '', '', '20 mm'] }) }] },
      c: { text: 'Find the perimeter. Find missing sides first.', kind: 'work', cols: 3, items: [{ t: '', fig: D.fit([[0, 0], [30, 0], [30, 12], [18, 12], [18, 22], [0, 22]], { sides: ['40 m', '15 m', '', '13 m', '', '28 m'] }) }, { t: '', fig: D.fit([[0, 0], [12, 0], [12, 10], [26, 10], [26, 22], [0, 22]], { sides: ['8 cm', '8 cm', '', '9 cm', '20 cm', ''] }) }, { t: '', fig: D.fit([[0, 22], [34, 22], [34, 0], [22, 0], [22, 10], [12, 10], [12, 0], [0, 0]], { sides: ['50 mm', '30 mm', '', '15 mm', '', '', '', ''] }) },
        'A rectangle is 2.4 m by 85 cm. Find its perimeter in cm.', 'A square has perimeter 46 cm. Find its side.', 'A rectangle has perimeter 30 m and length 9 m. Find its width.'] },
      d: { text: 'Problems.', kind: 'work', items: ['Fencing costs $24.50 per metre. Find the cost to fence a 35 m by 18 m paddock.', 'A regular hexagon has perimeter 57 cm. Find the length of one side.', 'How many different rectangles with whole-number sides have a perimeter of 20 cm?', 'A photo 15 cm by 10 cm has a 2 cm frame around it. Find the outside perimeter of the frame.'] },
      ext: { q: 'A rectangle’s length is 3 times its width. Its perimeter is 64 cm. Find its dimensions.', steps: ['Width w, length 3w', '2(w + 3w) = 8w = 64', 'w = 8'], a: '8 cm by 24 cm', qs: ['A rectangle’s length is 5 cm more than its width. Its perimeter is 50 cm. Find its dimensions.', 'An isosceles triangle has perimeter 40 cm and base 12 cm. Find the equal sides.'] },
      summary: { steps: ['Perimeter = distance around the outside.', 'Add every side length.', 'Find missing sides using opposite sides.', 'Check all units are the same.'],
        worked: [['Square, side 13 m', ['4 × 13'], '52 m'], ['Rectangle 13 mm × 5 mm', ['2 × (13 + 5)'], '36 mm'], ['L-shape 22, 6, 17…', ['Missing sides: 22 − 10 = 12, 17 − 6 = 11'], '78 cm'], ['Length = 3 × width, P = 64', ['8w = 64'], '8 cm by 24 cm']] },
      exit: { qs: ['Find the perimeter of a rectangle 12 cm by 7 cm.', 'Find the perimeter of an equilateral triangle with sides 9.5 m.', 'A square has perimeter 60 mm. Find its side.'] },
      ans: { we: ['52 m', '36 mm', '78 cm', '650 cm', '128 mm', '11.5 cm'], a: ['46 cm', '68 m', '36 mm', '38 cm', '13.6 m', '30 cm'], b: ['78 cm', '52 m', '128 mm'],
        c: ['136 m', '74 cm', '190 mm', '650 cm', '11.5 cm', '6 m'], d: [`$${(24.5 * 2 * (35 + 18)).toFixed(2)}`, '9.5 cm', '5 (1×9, 2×8, 3×7, 4×6, 5×5)', '66 cm'], ext: ['10 cm by 15 cm', '14 cm'], exit: ['38 cm', '28.5 m', '15 mm'] },
    }),

    lesson({
      code: '8.03', title: 'Circumference of a circle',
      li: ['find the circumference of a circle'],
      sc: ['name the parts of a circle: centre, radius, diameter, circumference', 'use C = πd or C = 2πr', 'round the answer to 1 decimal place'],
      terms: ['Circumference', 'Radius', 'Diameter'],
      we: [{ t: 'Find the circumference (1 d.p.).', fig: circ('2 cm', true) }, { t: 'Find the circumference (1 d.p.).', fig: circ('10 mm') }, { t: 'Find C (1 d.p.).', fig: circ('14 cm', true) }, { t: 'Find C (1 d.p.).', fig: circ('28 mm') }, 'A bike wheel has diameter 66 cm. How far does it travel in 100 turns (in m)?', 'A circle has circumference 50 cm. Find its diameter (1 d.p.).'],
      a: { text: 'Find the diameter of each circle.', kind: 'short', keepShort: true, items: ['radius 5 cm', 'radius 12 m', 'radius 3.5 mm', 'radius 0.8 km', 'radius 21 cm', 'radius 9 m'] },
      b: { text: 'Find the circumference, C = πd (1 d.p.).', kind: 'short', items: ['d = 2 cm', 'd = 14 cm', 'd = 7 m', 'd = 30 mm', 'd = 1.5 km', 'd = 100 cm'] },
      c: { text: 'Find the circumference (1 d.p.).', kind: 'work', cols: 3, items: [{ t: '', fig: circ('10 mm') }, { t: '', fig: circ('28 mm') }, { t: '', fig: circ('6 cm', true) }, { t: '', fig: circ('4.5 m') }, { t: '', fig: circ('25 cm', true) }, { t: '', fig: circ('0.5 km') }] },
      d: { text: 'Problems.', kind: 'work', items: ['A bike wheel has diameter 66 cm. How far does it travel in 100 turns (in m, 1 d.p.)?', 'A circle has circumference 50 cm. Find its diameter (1 d.p.).', 'Find the perimeter of a semicircle with diameter 12 cm (1 d.p.).', 'A round table has radius 60 cm. How many 30 cm-wide chairs fit around it?'] },
      ext: { q: 'Find the perimeter of a quarter circle with radius 10 cm (1 d.p.).', steps: ['Arc = ¼ × 2π × 10 = 15.707…', 'Add two radii: 15.71 + 20'], a: '35.7 cm', qs: ['Find the perimeter of a semicircle with radius 7 m (1 d.p.).', 'A running track has two straights of 100 m and two semicircles of diameter 64 m. Find its length (1 d.p.).'] },
      summary: { steps: ['Diameter = 2 × radius.', 'C = πd or C = 2πr.', 'Use the π key on your calculator.', 'Round to 1 decimal place and include units.'],
        worked: [['d = 2 cm', ['π × 2 = 6.283…'], '6.3 cm'], ['r = 10 mm', ['2 × π × 10'], '62.8 mm'], ['C = 50, find d', ['50 ÷ π'], '15.9 cm'], ['Quarter circle r = 10', ['15.7 + 20'], '35.7 cm']] },
      exit: { qs: ['A circle has radius 8 cm. Find its diameter.', 'Find the circumference of a circle with diameter 9 m (1 d.p.).', 'Find the circumference of a circle with radius 3.5 cm (1 d.p.).'] },
      ans: { we: ['6.3 cm', '62.8 mm', '44.0 cm', '175.9 mm', `${(Math.PI * 66).toFixed(1) * 1} m → ${(Math.PI * 0.66 * 100).toFixed(1)} m`, '15.9 cm'].map((x, i) => (i === 4 ? `${(Math.PI * 0.66 * 100).toFixed(1)} m` : x)), a: ['10 cm', '24 m', '7 mm', '1.6 km', '42 cm', '18 m'],
        b: [2, 14, 7, 30, 1.5, 100].map((d, i) => `${(Math.PI * d).toFixed(1)} ${['cm', 'cm', 'm', 'mm', 'km', 'cm'][i]}`), c: [['r', 10, 'mm'], ['r', 28, 'mm'], ['d', 6, 'cm'], ['r', 4.5, 'm'], ['d', 25, 'cm'], ['r', 0.5, 'km']].map(([t, v, u]) => `${(Math.PI * (t === 'r' ? 2 * v : v)).toFixed(1)} ${u}`),
        d: [`${(Math.PI * 0.66 * 100).toFixed(1)} m`, `${(50 / Math.PI).toFixed(1)} cm`, `${(Math.PI * 6 + 12).toFixed(1)} cm`, `12 (circumference ${(Math.PI * 120).toFixed(1)} cm)`], ext: [`${(Math.PI * 7 + 14).toFixed(1)} m`, `${(200 + Math.PI * 64).toFixed(1)} m`], exit: ['16 cm', `${(Math.PI * 9).toFixed(1)} m`, `${(Math.PI * 7).toFixed(1)} cm`] },
    }),

    lesson({
      code: '8.04', title: 'Area units',
      li: ['convert between units of area'],
      sc: [`know 1 ${sq('cm')} = 100 ${sq('mm')}, 1 ${sq('m')} = 10 000 ${sq('cm')}`, 'multiply to convert to a smaller unit, divide to a larger unit', 'choose a sensible unit of area'],
      terms: ['Area', 'Square unit'],
      we: [`Why is 1 ${sq('cm')} = 100 ${sq('mm')}?`, `How many ${sq('cm')} in 9.1 ${sq('m')}?`, `How many ${sq('mm')} in 2.5 ${sq('cm')}?`, `How many ${sq('m')} in 175 000 ${sq('cm')}?`, `How many ${sq('m')} in 240 000 ${sq('mm')}?`, `How many ${sq('mm')} in 8.6 ${sq('m')}?`],
      a: { text: 'Convert.', kind: 'short', items: [`3 ${sq('cm')} to ${sq('mm')}`, `2.5 ${sq('cm')} to ${sq('mm')}`, `9.1 ${sq('m')} to ${sq('cm')}`, `4 ${sq('m')} to ${sq('cm')}`, `2 ${sq('km')} to ${sq('m')}`, `5 ha to ${sq('m')}`] },
      b: { text: 'Convert.', kind: 'short', items: [`240 ${sq('mm')} to ${sq('cm')}`, `175 000 ${sq('cm')} to ${sq('m')}`, `50 000 ${sq('m')} to ha`, `850 ${sq('mm')} to ${sq('cm')}`, `3 500 000 ${sq('m')} to ${sq('km')}`, `6400 ${sq('cm')} to ${sq('m')}`] },
      c: { text: 'Convert. Show your working.', kind: 'work', cols: 3, items: [`240 000 ${sq('mm')} to ${sq('m')}`, `8.6 ${sq('m')} to ${sq('mm')}`, `0.07 ${sq('km')} to ha`, `12.5 ha to ${sq('m')}`, `0.35 ${sq('m')} to ${sq('cm')}`, `72 ${sq('cm')} to ${sq('m')}`] },
      d: { text: 'Choose and compare.', kind: 'work', items: ['Which unit would you use for: a stamp, a classroom floor, a farm, a country?', `Which is larger: 3.2 ${sq('m')} or 30 000 ${sq('cm')}?`, `A tile is 400 ${sq('cm')}. How many tiles cover 6 ${sq('m')}?`, `A farm is 2.4 ${sq('km')}. How many hectares is that?`] },
      ext: { q: `Show that 1 ${sq('km')} = 100 ha.`, steps: [`1 ${sq('km')} = 1000 m × 1000 m = 1 000 000 ${sq('m')}`, `1 ha = 10 000 ${sq('m')}`, '1 000 000 ÷ 10 000'], a: '100 ha', qs: [`How many ${sq('mm')} are in 1 ${sq('m')}?`, 'A soccer field is 105 m by 68 m. What fraction of a hectare is it (2 d.p.)?'] },
      summary: { title: 'Area conversions', steps: [`1 ${sq('cm')} = 10 × 10 = 100 ${sq('mm')}.`, `1 ${sq('m')} = 100 × 100 = 10 000 ${sq('cm')}.`, `1 ha = 10 000 ${sq('m')}; 1 ${sq('km')} = 1 000 000 ${sq('m')}.`, 'To a smaller unit: ×. To a larger unit: ÷.'],
        worked: [[`9.1 ${sq('m')} to ${sq('cm')}`, ['× 10 000'], `91 000 ${sq('cm')}`], [`240 ${sq('mm')} to ${sq('cm')}`, ['÷ 100'], `2.4 ${sq('cm')}`], [`240 000 ${sq('mm')} to ${sq('m')}`, ['÷ 1 000 000'], `0.24 ${sq('m')}`], [`1 ${sq('km')} in ha`, ['1 000 000 ÷ 10 000'], '100 ha']] },
      exit: { qs: [`Convert 5 ${sq('cm')} to ${sq('mm')}.`, `Convert 30 000 ${sq('cm')} to ${sq('m')}.`, `Convert 1.5 ${sq('m')} to ${sq('mm')}.`] },
      ans: { we: ['a 1 cm square is 10 mm by 10 mm', '91 000', '250', '17.5', '0.24', '8 600 000'], a: [`300 ${sq('mm')}`, `250 ${sq('mm')}`, `91 000 ${sq('cm')}`, `40 000 ${sq('cm')}`, `2 000 000 ${sq('m')}`, `50 000 ${sq('m')}`],
        b: [`2.4 ${sq('cm')}`, `17.5 ${sq('m')}`, '5 ha', `8.5 ${sq('cm')}`, `3.5 ${sq('km')}`, `0.64 ${sq('m')}`], c: [`0.24 ${sq('m')}`, `8 600 000 ${sq('mm')}`, '7 ha', `125 000 ${sq('m')}`, `3500 ${sq('cm')}`, `0.0072 ${sq('m')}`],
        d: [`${sq('mm')} or ${sq('cm')}; ${sq('m')}; ha; ${sq('km')}`, `3.2 ${sq('m')} (30 000 ${sq('cm')} = 3 ${sq('m')})`, '150 tiles', '240 ha'], ext: [`1 000 000 ${sq('mm')}`, '0.71 ha'], exit: [`500 ${sq('mm')}`, `3 ${sq('m')}`, `1 500 000 ${sq('mm')}`] },
    }),

    lesson({
      code: '8.05', title: 'Area of squares and rectangles',
      li: ['find the area of squares and rectangles'],
      sc: ['use A = <i>l</i> × <i>w</i> for a rectangle', 'use A = <i>s</i><sup>2</sup> for a square', 'find a missing side from the area'],
      terms: ['Length', 'Width'],
      we: [{ t: 'Find the area.', fig: rect('4 m', '4 m', 20, 20) }, { t: 'Find the area.', fig: rect('6 cm', '4 cm') }, { t: 'Find the area.', fig: rect('18 m', '9 m', 34, 17) }, 'A rectangle 2.5 m by 60 cm. Find its area in m².', 'A square has area 81 cm². Find its side.', 'A rectangle has area 48 m² and length 8 m. Find its width.'],
      a: { text: 'Find the area.', kind: 'work', cols: 3, items: [{ t: '', fig: rect('4 m', '4 m', 20, 20) }, { t: '', fig: rect('6 cm', '4 cm') }, { t: '', fig: rect('18 m', '9 m', 34, 17) }, { t: '', fig: rect('12 mm', '5 mm') }, { t: '', fig: rect('7 cm', '7 cm', 20, 20) }, { t: '', fig: rect('2.5 m', '1.2 m') }] },
      b: { text: 'Find the area.', kind: 'short', items: ['rectangle 15 cm by 8 cm', 'square with side 11 m', 'rectangle 3.5 m by 2 m', 'square with side 0.5 km', 'rectangle 40 mm by 25 mm', 'rectangle 1.2 m by 0.5 m'] },
      c: { text: 'Find the missing side.', kind: 'work', cols: 3, items: ['A square has area 81 cm². Find its side.', 'A rectangle has area 48 m² and length 8 m. Find its width.', 'A rectangle has area 7.5 cm² and width 2.5 cm. Find its length.', 'A square has area 1.44 m². Find its side.', 'A rectangle is 2.5 m by 60 cm. Find its area in m².', 'A square has perimeter 36 cm. Find its area.'] },
      d: { text: 'Problems.', kind: 'work', items: ['Carpet costs $45 per m². Find the cost to carpet a room 5.2 m by 4 m.', 'How many 30 cm by 30 cm tiles cover a floor 3.6 m by 2.7 m?', 'A rectangle has perimeter 26 cm and area 40 cm². Find its length and width.', 'If you double the side of a square, what happens to its area?'] },
      ext: { q: 'A 20 m by 15 m lawn has a 2 m wide path around the outside of it. Find the area of the path.', steps: ['Outer rectangle: 24 m by 19 m = 456 m²', 'Lawn: 20 × 15 = 300 m²', '456 − 300'], a: '156 m²', qs: ['A 6 m by 4 m pool has a 1 m wide path around it. Find the path area.', 'Which rectangle with perimeter 24 cm has the largest area?'] },
      summary: { steps: ['Area of a rectangle = length × width.', 'Area of a square = side × side = s².', 'Use the same units for both sides.', 'Answer in square units.'],
        worked: [['4 m square', ['4 × 4'], '16 m²'], ['18 m × 9 m', ['18 × 9'], '162 m²'], ['Area 48, length 8', ['48 ÷ 8'], '6 m'], ['Path around a lawn', ['456 − 300'], '156 m²']] },
      exit: { qs: ['Find the area of a rectangle 9 cm by 6 cm.', 'Find the area of a square with side 2.5 m.', 'A rectangle has area 60 m² and width 5 m. Find its length.'] },
      ans: { we: ['16 m²', '24 cm²', '162 m²', '1.5 m²', '9 cm', '6 m'], a: ['16 m²', '24 cm²', '162 m²', '60 mm²', '49 cm²', '3 m²'], b: ['120 cm²', '121 m²', '7 m²', '0.25 km²', '1000 mm²', '0.6 m²'],
        c: ['9 cm', '6 m', '3 cm', '1.2 m', '1.5 m²', '81 cm²'], d: ['$936', '108 tiles', '8 cm by 5 cm', 'it is 4 times as large'], ext: ['24 m²', '6 cm by 6 cm (36 cm²)'], exit: ['54 cm²', '6.25 m²', '12 m'] },
    }),

    lesson({
      code: '8.06', title: 'Area of a triangle',
      li: ['find the area of a triangle'],
      sc: ['identify the base and the perpendicular height', 'use A = ½ × <i>b</i> × <i>h</i>', 'find the height when it is outside the triangle'],
      terms: ['Base', 'Perpendicular height'],
      we: [{ t: 'Find the area.', fig: tri('30 mm', '24 mm') }, { t: 'Find the area.', fig: tri('16 mm', '14 mm', 30, 22, 30) }, { t: 'Find the area.', fig: tri('4 cm', '2.6 cm', 30, 18, 20) }, { t: 'Find the area.', fig: D.fit([[0, 20], [22, 20], [34, 0]], { sides: ['11 km', '', ''], dash: [[[34, 0], [34, 20]], [[22, 20], [34, 20]]], labels: [['34 km', 38, 11]], fill: '#eef1f9' }) }, 'A triangle has area 36 cm² and base 9 cm. Find its height.', 'Why is the area of a triangle half of a rectangle?'],
      a: { text: 'Find the area.', kind: 'work', cols: 3, items: [{ t: '', fig: tri('30 mm', '24 mm') }, { t: '', fig: tri('10 cm', '6 cm') }, { t: '', fig: tri('8 m', '5 m', 30, 20, 30) }, { t: '', fig: tri('12 cm', '7 cm', 30, 18, 20) }, { t: '', fig: tri('4 cm', '2.6 cm', 30, 18, 20) }, { t: '', fig: tri('20 m', '15 m', 30, 22, 0) }] },
      b: { text: 'Find the area of each triangle.', kind: 'short', items: ['base 6 cm, height 4 cm', 'base 16 mm, height 14 mm', 'base 9 m, height 12 m', 'base 7 cm, height 5 cm', 'base 2.4 m, height 1.5 m', 'base 50 cm, height 1 m (in cm²)'] },
      c: { text: 'Find the area. The height may be outside the triangle.', kind: 'work', cols: 3, items: [{ t: '', fig: D.fit([[0, 20], [22, 20], [34, 0]], { sides: ['11 km', '', ''], dash: [[[34, 0], [34, 20]], [[22, 20], [34, 20]]], labels: [['34 km', 38, 11]], fill: '#eef1f9' }) }, { t: '', fig: D.fit([[0, 18], [16, 18], [28, 0]], { sides: ['8 m', '', ''], dash: [[[28, 0], [28, 18]], [[16, 18], [28, 18]]], labels: [['10 m', 32, 10]], fill: '#eef1f9' }) }, { t: '', fig: D.fit([[0, 22], [30, 22], [0, 0]], { sides: ['12 cm', '', '9 cm'], right: [0], fill: '#eef1f9' }) },
        'A triangle has area 36 cm² and base 9 cm. Find its height.', 'A triangle has area 20 m² and height 8 m. Find its base.', 'A right-angled triangle has shorter sides 5 cm and 12 cm. Find its area.'] },
      d: { text: 'Problems.', kind: 'work', items: ['A triangular sail has base 3.2 m and height 5 m. Find its area.', 'A triangular garden bed has base 6 m and height 4 m. Mulch covers 3 m² per bag. How many bags?', 'Find the area of a square of side 10 cm with one corner triangle (legs 4 cm) cut off.', 'Two triangles have the same base 8 cm. One has height 5 cm, one 10 cm. Compare their areas.'] },
      ext: { q: 'Find the area of a kite with diagonals 10 cm and 16 cm.', steps: ['The long diagonal splits it into 2 triangles, base 16, height 5', '2 × ½ × 16 × 5'], a: '80 cm²', qs: ['Find the area of a rhombus with diagonals 6 m and 9 m.', 'A triangle has vertices (0, 0), (8, 0) and (3, 6) on a grid. Find its area.'] },
      summary: { steps: ['A = ½ × base × height.', 'The height is perpendicular (at 90°) to the base.', 'The height may be outside the triangle.', 'Answer in square units.'],
        worked: [['base 30, height 24', ['½ × 30 × 24'], '360 mm²'], ['base 4, height 2.6', ['½ × 4 × 2.6'], '5.2 cm²'], ['Area 36, base 9', ['½ × 9 × h = 36'], 'h = 8 cm'], ['Kite 10 by 16', ['2 × ½ × 16 × 5'], '80 cm²']] },
      exit: { qs: ['Find the area: base 10 m, height 7 m.', 'Find the area: base 5 cm, height 3.2 cm.', 'A triangle has area 24 cm² and base 6 cm. Find its height.'] },
      ans: { we: ['360 mm²', '112 mm²', '5.2 cm²', '187 km²', '8 cm', 'two copies of the triangle make a rectangle (or parallelogram)'], a: ['360 mm²', '30 cm²', '20 m²', '42 cm²', '5.2 cm²', '150 m²'], b: ['12 cm²', '112 mm²', '54 m²', '17.5 cm²', '1.8 m²', '2500 cm²'],
        c: ['187 km²', '40 m²', '54 cm²', '8 cm', '5 m', '30 cm²'], d: ['8 m²', '4 bags', '92 cm²', 'the second is twice the first (20 cm² vs 40 cm²)'], ext: ['27 m²', '24 square units'], exit: ['35 m²', '8 cm²', '8 cm'] },
    }),

    lesson({
      code: '8.07', title: 'Area of a parallelogram',
      li: ['find the area of a parallelogram'],
      sc: ['identify the base and perpendicular height', 'use A = <i>b</i> × <i>h</i>', 'not use the slanted side as the height'],
      terms: ['Parallelogram', 'Perpendicular height'],
      we: [{ t: 'Find the area.', fig: para('15 m', '8 m') }, { t: 'Find the area.', fig: para('36 cm', '23 cm', 30, 20, 10) }, { t: 'Find the area.', fig: para('8.5 mm', '8 mm', 24, 18, 8) }, 'Why is the area of a parallelogram the same as a rectangle with the same base and height?', 'A parallelogram has area 72 cm² and base 12 cm. Find its height.', 'A parallelogram has sides 10 cm and 6 cm, and height 5 cm on the 10 cm side. Find its area.'],
      a: { text: 'Find the area.', kind: 'work', cols: 3, items: [{ t: '', fig: para('15 m', '8 m') }, { t: '', fig: para('36 cm', '23 cm', 30, 20, 10) }, { t: '', fig: para('8.5 mm', '8 mm', 24, 18, 8) }, { t: '', fig: para('12 cm', '5 cm') }, { t: '', fig: para('20 m', '9 m', 30, 16, 10) }, { t: '', fig: para('7 cm', '4.5 cm', 24, 16, 6) }] },
      b: { text: 'Find the area of each parallelogram.', kind: 'short', items: ['base 10 cm, height 6 cm', 'base 4.5 m, height 2 m', 'base 25 mm, height 12 mm', 'base 8 km, height 3.5 km', 'base 1.2 m, height 80 cm (m²)', 'base 30 cm, height 15 cm'] },
      c: { text: 'Find the missing value.', kind: 'work', cols: 3, items: ['Area 72 cm², base 12 cm. Find the height.', 'Area 45 m², height 5 m. Find the base.', 'Area 3.6 m², base 1.8 m. Find the height.', 'Sides 10 cm and 6 cm, height 5 cm on the 10 cm side. Find the area.', 'Base 14 mm, slant side 9 mm, height 7 mm. Find the area.', 'A parallelogram and a triangle have base 8 cm and height 6 cm. Compare their areas.'] },
      d: { text: 'Problems.', kind: 'work', items: ['A parallelogram-shaped garden has base 12 m and height 7.5 m. Turf costs $9.80 per m². Find the cost.', 'Draw two different parallelograms with area 24 cm².', 'A rhombus has side 10 cm and height 8 cm. Find its area.', 'The same parallelogram has base 12 cm, height 6 cm, and another side 8 cm. Find the height on the 8 cm side.'] },
      ext: { q: 'Find the area of a trapezium with parallel sides 8 cm and 14 cm and height 5 cm.', steps: ['Two copies make a parallelogram with base 8 + 14 = 22', 'Half of 22 × 5'], a: '55 cm²', qs: ['Find the area of a trapezium with parallel sides 6 m and 10 m and height 4 m.', 'A trapezium has area 60 cm², height 6 cm and one parallel side 8 cm. Find the other.'] },
      summary: { steps: ['A = base × height.', 'Height is perpendicular to the base.', 'Do not use the slanted side.', 'Cut the triangle off one end and move it: a rectangle.'],
        worked: [['base 15, height 8', ['15 × 8'], '120 m²'], ['base 8.5, height 8', ['8.5 × 8'], '68 mm²'], ['Area 72, base 12', ['72 ÷ 12'], '6 cm'], ['Trapezium 8, 14, h 5', ['½ × 22 × 5'], '55 cm²']] },
      exit: { qs: ['Find the area: base 9 cm, height 4 cm.', 'Find the area: base 2.5 m, height 1.6 m.', 'A parallelogram has area 50 m² and height 4 m. Find its base.'] },
      ans: { we: ['120 m²', '828 cm²', '68 mm²', 'cutting off a triangle and moving it makes a rectangle', '6 cm', '50 cm²'], a: ['120 m²', '828 cm²', '68 mm²', '60 cm²', '180 m²', '31.5 cm²'], b: ['60 cm²', '9 m²', '300 mm²', '28 km²', '0.96 m²', '450 cm²'],
        c: ['6 cm', '9 m', '2 m', '50 cm²', '98 mm²', 'parallelogram 48 cm², triangle 24 cm²'], d: ['$882', 'e.g. 6 × 4 and 8 × 3', '80 cm²', '9 cm'], ext: ['32 m²', '12 cm'], exit: ['36 cm²', '4 m²', '12.5 m'] },
    }),

    lesson({
      code: '8.08', title: 'Area of composite shapes',
      li: ['find the area of composite and shaded shapes'],
      sc: ['split a shape into rectangles and triangles, then add', 'find a shaded area by subtracting', 'solve practical problems such as painting a wall'],
      terms: ['Composite shape', 'Shaded area'],
      we: [{ t: 'Find the shaded area.', fig: shade(30, 20, [[12, 8, 5, 5]], [['6 cm', 15, 24], ['4 cm', 34, 11], ['1 cm', 14.5, 6.5]]) }, { t: 'Find the area.', fig: D.fit([[0, 0], [34, 0], [34, 10], [20, 10], [20, 22], [0, 22]], { sides: ['12 m', '3 m', '5 m', '', '', '8 m'], fill: '#9fb3e6' }) },
        { t: 'Find the shaded area.', fig: shade(34, 22, [[4, 4, 26, 14]], [['10 m', 17, 26], ['7 m', 38, 12], ['1 m wide border', 17, 12]]) }, { t: 'Find the area.', fig: D.fit([[0, 22], [34, 22], [34, 9], [17, 0], [0, 9]], { sides: ['20 m', '14 m', '', '', ''], dash: [[[17, 0], [17, 9]]], labels: [['8 m', 21, 6]], fill: '#9fb3e6' }) },
        'A wall 6.6 m by 3 m has a 2 m by 1 m window and a 0.9 m by 2 m door. One litre of paint covers 3 m². How many whole litres are needed?', 'Find the area of a square of side 5 mm with a triangle of base 5 mm and height 5 mm on top.'],
      a: { text: 'Find the area by splitting into rectangles.', kind: 'work', cols: 3, items: [{ t: '', fig: D.fit([[0, 0], [34, 0], [34, 10], [20, 10], [20, 22], [0, 22]], { sides: ['12 m', '3 m', '5 m', '', '', '8 m'], fill: '#9fb3e6' }) }, { t: '', fig: D.fit([[0, 0], [12, 0], [12, 10], [26, 10], [26, 22], [0, 22]], { sides: ['4 cm', '3 cm', '', '6 cm', '10 cm', ''], fill: '#9fb3e6' }) }, { t: '', fig: D.fit([[0, 22], [34, 22], [34, 0], [22, 0], [22, 10], [12, 10], [12, 0], [0, 0]], { sides: ['15 m', '8 m', '', '3 m', '5 m', '', '', ''], labels: [['5 m', 6, -2], ['5 m', 28, -2]], fill: '#9fb3e6' }) }] },
      b: { text: 'Find the shaded area.', kind: 'work', cols: 3, items: [{ t: '', fig: shade(30, 20, [[12, 8, 5, 5]], [['6 cm', 15, 24], ['4 cm', 34, 11], ['1 cm', 14.5, 6.5]]) }, { t: '', fig: shade(34, 22, [[4, 4, 26, 14]], [['10 m', 17, 26], ['7 m', 38, 12], ['1 m', 2, 13]]) }, { t: '', fig: shade(30, 22, [[0, 0, 10, 8], [20, 14, 10, 8]], [['12 m', 15, 26], ['8 m', 34, 12], ['3 m × 3 m corners', 15, 12]]) }] },
      c: { text: 'Find the area.', kind: 'work', cols: 3, items: [{ t: '', fig: D.fit([[0, 22], [34, 22], [34, 9], [17, 0], [0, 9]], { sides: ['20 m', '14 m', '', '', ''], dash: [[[17, 0], [17, 9]]], labels: [['8 m', 21, 6]], fill: '#9fb3e6' }) }, { t: '', fig: D.fit([[0, 20], [20, 20], [20, 8], [10, 0], [0, 8]], { sides: ['5 mm', '', '', '', ''], labels: [['square 5 mm, triangle height 5 mm', 10, 26]], fill: '#9fb3e6' }) }, { t: '', fig: shade(30, 22, [[9, 6, 12, 10]], [['20.6 mm', 15, 26], ['14 mm', 36, 12], ['4 mm × 4 mm hole', 15, 12]]) },
        'A rectangle 12 cm by 8 cm with a 4 cm by 3 cm rectangle cut from one corner.', 'A 10 m by 6 m rectangle with a triangle of base 10 m and height 4 m on top.', 'A square of side 8 cm with a square of side 3 cm cut from the centre.'] },
      d: { text: 'Problems.', kind: 'work', items: ['A wall 6.6 m by 3 m has a 2 m by 1 m window and a 0.9 m by 2 m door. One litre of paint covers 3 m². How many whole litres are needed?', 'A 50 cm by 35 cm poster has a 40 cm by 28 cm photo on it. Find the area of the poster not covered.', 'Find the area of an L-shaped room: 6 m by 4 m with a 2 m by 1.5 m corner cut out.', 'Carpet costs $38 per m². Find the cost of carpeting the room in Question 3.'] },
      ext: { q: 'A path 1 m wide runs along two sides of a 12 m by 8 m lawn (an L-shape). Find the area of the path.', steps: ['Outer rectangle 13 × 9 = 117 m²', 'Lawn 12 × 8 = 96 m²', '117 − 96'], a: '21 m²', qs: ['A 1.5 m wide path goes around all four sides of a 10 m by 6 m pool. Find its area.', 'Find the area of a cross made of five 3 cm squares.'] },
      summary: { steps: ['Split the shape into rectangles and triangles.', 'Find missing lengths first.', 'Add the parts, or subtract holes (shaded area).', 'Check units and give square units.'],
        worked: [['6 × 4 rectangle with 1 × 1 hole', ['24 − 1'], '23 cm²'], ['L-shape 12 × 8 minus 5 × 5', ['96 − 25'], '71 m²'], ['Border 1 m wide on 10 × 7', ['70 − 8 × 5'], '30 m²'], ['Paint the wall', ['19.8 − 2 − 1.8 = 16 m²', '16 ÷ 3 = 5.3'], '6 L']] },
      exit: { qs: ['Find the area of a 10 cm × 5 cm rectangle with a 2 cm × 2 cm square hole.', 'Find the area of an L-shape made from a 6 m × 3 m and a 2 m × 2 m rectangle.', 'A wall is 4 m × 2.5 m with a 1 m × 1 m window. Paint covers 3 m² per litre. How many whole litres?'] },
      ans: { we: ['23 cm²', '71 m²', '30 m²', '360 m²', '6 L', '37.5 mm²'], a: ['71 m²', '72 cm²', '105 m²'], b: ['23 cm²', '30 m²', '78 m²'],
        c: ['360 m²', '37.5 mm²', '272.4 mm²', '84 cm²', '80 m²', '55 cm²'], d: ['6 L', '630 cm²', '21 m²', '$798'], ext: ['57 m²', '45 cm²'], exit: ['46 cm²', '22 m²', '3 L'] },
    }),

    lesson({
      code: '8.09', title: 'Prisms, cross-sections and views',
      li: ['identify prisms and their cross-sections', 'draw the front, side and top views of a solid'],
      sc: ['know a prism has the same cross-section all the way through', 'draw a cross-section parallel to the ends', 'sketch front, side and top views'],
      terms: ['Prism', 'Cross-section', 'View'],
      we: [{ t: 'Is it a prism? Draw its cross-section.', fig: box('', '', '') }, { t: 'Is it a prism? Draw its cross-section.', fig: D.triPrism({ w: 50, h: 34 }) }, { t: 'Draw the cross-section.', fig: prismF([[0, 0], [8, 0], [8, 12], [20, 12], [20, 20], [0, 20]], []) }, 'Is a cone a prism? Explain.',
        { t: 'Sketch the front, left and top views.', fig: prismF([[0, 0], [8, 0], [8, 12], [20, 12], [20, 20], [0, 20]], [['front', 10, 25]]) }, { t: 'Sketch the right, front and top views.', fig: prismF([[0, 20], [24, 20], [24, 8], [12, 0], [0, 8]], [['front', 12, 25]]) }],
      a: { text: 'Is each solid a prism? If so, draw its cross-section.', kind: 'work', cols: 3, items: [{ t: '', fig: box('', '', '') }, { t: '', fig: D.triPrism({ w: 50, h: 34 }) }, { t: '', fig: prismF([[0, 20], [24, 20], [18, 0], [6, 0]], []) }, { t: '', fig: prismF(Array.from({ length: 6 }, (_, i) => [10 + 10 * Math.cos((i * Math.PI) / 3), 10 + 10 * Math.sin((i * Math.PI) / 3)]), []) }, { t: 'a square pyramid', fig: D.fit([[0, 20], [20, 20], [28, 14], [14, 0]], { lines: [[[14, 0], [20, 20]]], dash: [[[0, 20], [8, 14]], [[8, 14], [28, 14]], [[8, 14], [14, 0]]] }) }, { t: 'a cylinder', fig: '' }] },
      b: { text: 'Draw the cross-section of each prism.', kind: 'work', cols: 3, items: [{ t: '', fig: prismF([[0, 0], [8, 0], [8, 12], [20, 12], [20, 20], [0, 20]], []) }, { t: '', fig: prismF([[0, 20], [24, 20], [24, 8], [12, 0], [0, 8]], []) }, { t: '', fig: prismF([[0, 0], [20, 0], [20, 6], [13, 6], [13, 20], [7, 20], [7, 6], [0, 6]], []) }] },
      c: { text: 'Sketch the front (F), side and top views.', kind: 'work', stack: true, items: [{ t: 'front, left and top views', fig: prismF([[0, 0], [8, 0], [8, 12], [20, 12], [20, 20], [0, 20]], [['F', 10, 25]]) }, { t: 'right, front and top views', fig: prismF([[0, 20], [24, 20], [24, 8], [12, 0], [0, 8]], [['F', 12, 25]]) }] },
      d: { text: 'Views and solids.', kind: 'work', items: [{ t: 'Sketch the front, side and top views.', fig: prismF([[0, 0], [20, 0], [20, 6], [13, 6], [13, 20], [7, 20], [7, 6], [0, 6]], [['F', 10, 25]]) }, 'A solid has a square front view, a square side view and a circle top view. What is it?', 'Name a solid whose front, side and top views are all the same.', 'Draw the top view of a cylinder lying on its side.'] },
      ext: { q: 'A solid has front view a rectangle, side view a triangle and top view a rectangle. What is it?', steps: ['A triangle from the side means triangular ends', 'Rectangles from the front and top: it is lying on a rectangular face'], a: 'a triangular prism', qs: ['A solid has front and side views both triangles and top view a square. What is it?', 'Draw the front view of a stack of cubes: 3 in the back row, 2 in the middle, 1 at the front, all in a line.'] },
      summary: { steps: ['A <b>prism</b> has two identical, parallel ends joined by rectangles.', 'The <b>cross-section</b> is the same shape all the way through.', 'Views: look from the front, the side and the top.', 'Pyramids, cones and spheres are not prisms.'],
        worked: [['Rectangular box', ['Same rectangle all through'], 'prism, rectangle cross-section'], ['Cone', ['Cross-section shrinks'], 'not a prism'], ['L-shaped prism', ['Front: an L'], 'L-shape, rectangle, rectangle'], ['Rectangle, triangle, rectangle', ['Triangular ends'], 'triangular prism']] },
      exit: { qs: ['Is a cylinder a prism? Explain.', 'Name the cross-section of a hexagonal prism.', 'Sketch the top view of a triangular prism lying on its rectangular face.'] },
      ans: { we: ['yes; rectangle', 'yes; triangle', 'L-shape', 'no: the cross-section changes and the ends are not the same', 'front: L-shape; left: rectangle; top: rectangle', 'right: rectangle; front: pentagon (house shape); top: rectangle with a line'], a: ['yes, rectangle', 'yes, triangle', 'yes, trapezium', 'yes, hexagon', 'no', 'not a prism (curved), but it has a circular cross-section'],
        b: ['L-shape', 'pentagon', 'T-shape'], c: ['L-shape; rectangle; rectangle', 'rectangle; pentagon; rectangle split by a line'], d: ['T-shape; rectangle; rectangle', 'a cylinder', 'a cube (or sphere)', 'a rectangle'], ext: ['a square pyramid', 'three squares in a row of heights 1, 2, 3 (or one tall column, depending on view)'], exit: ['No: it has curved sides (it is like a prism with a circle cross-section)', 'hexagon', 'a rectangle with a line along the middle'] },
    }),

    lesson({
      code: '8.10', title: 'Volume units',
      li: ['convert between units of volume'],
      sc: [`know 1 ${cu('cm')} = 1000 ${cu('mm')} and 1 ${cu('m')} = 1 000 000 ${cu('cm')}`, 'multiply to a smaller unit, divide to a larger unit', 'count cubes to find volume'],
      terms: ['Volume', 'Cubic unit'],
      we: [`Why is 1 ${cu('cm')} = 1000 ${cu('mm')}?`, `20 ${cu('cm')} = ___ ${cu('mm')}`, `0.5 ${cu('m')} = ___ ${cu('cm')}`, `7500 ${cu('mm')} = ___ ${cu('cm')}`, `230 000 ${cu('mm')} = ___ ${cu('m')}`, 'How many 1 cm cubes fit in a 5 cm by 4 cm by 3 cm box?'],
      a: { text: 'Convert.', kind: 'short', items: [`20 ${cu('cm')} to ${cu('mm')}`, `3 ${cu('cm')} to ${cu('mm')}`, `2 ${cu('m')} to ${cu('cm')}`, `0.5 ${cu('m')} to ${cu('cm')}`, `4.5 ${cu('cm')} to ${cu('mm')}`, `1.2 ${cu('m')} to ${cu('cm')}`] },
      b: { text: 'Convert.', kind: 'short', items: [`7500 ${cu('mm')} to ${cu('cm')}`, `4000 ${cu('mm')} to ${cu('cm')}`, `3 000 000 ${cu('cm')} to ${cu('m')}`, `250 000 ${cu('cm')} to ${cu('m')}`, `600 ${cu('mm')} to ${cu('cm')}`, `80 000 ${cu('cm')} to ${cu('m')}`] },
      c: { text: 'Convert. Show your working.', kind: 'work', cols: 3, items: [`230 000 ${cu('mm')} to ${cu('m')}`, `0.004 ${cu('m')} to ${cu('mm')}`, `5 ${cu('km')} to ${cu('m')}`, `0.75 ${cu('m')} to ${cu('cm')}`, `12 500 ${cu('cm')} to ${cu('m')}`, `9 ${cu('cm')} to ${cu('m')}`] },
      d: { text: 'Cubes and volume.', kind: 'work', items: ['How many 1 cm cubes fit in a box 5 cm by 4 cm by 3 cm?', 'How many 2 cm cubes fit in a box 10 cm by 6 cm by 4 cm?', `Order: 0.02 ${cu('m')}, 15 000 ${cu('cm')}, 25 000 000 ${cu('mm')}.`, `Which unit for: a sugar cube, a swimming pool, a lunch box?`] },
      ext: { q: `How many ${cu('mm')} in 1 ${cu('m')}?`, steps: ['1 m = 1000 mm', '1000 × 1000 × 1000'], a: `1 000 000 000 ${cu('mm')}`, qs: [`Convert 0.000 35 ${cu('m')} to ${cu('mm')}.`, `A cube has volume 1 ${cu('m')}. How many 10 cm cubes fit inside it?`] },
      summary: { title: 'Volume conversions', steps: [`1 ${cu('cm')} = 10 × 10 × 10 = 1000 ${cu('mm')}.`, `1 ${cu('m')} = 100 × 100 × 100 = 1 000 000 ${cu('cm')}.`, 'To a smaller unit: ×. To a larger unit: ÷.', 'Volume is measured in cubic units.'],
        worked: [[`20 ${cu('cm')} to ${cu('mm')}`, ['× 1000'], `20 000 ${cu('mm')}`], [`0.5 ${cu('m')} to ${cu('cm')}`, ['× 1 000 000'], `500 000 ${cu('cm')}`], [`230 000 ${cu('mm')} to ${cu('m')}`, ['÷ 1 000 000 000'], `0.00023 ${cu('m')}`], [`1 ${cu('m')} in ${cu('mm')}`, ['1000³'], '1 000 000 000']] },
      exit: { qs: [`Convert 6 ${cu('cm')} to ${cu('mm')}.`, `Convert 2 500 000 ${cu('cm')} to ${cu('m')}.`, `Convert 1500 ${cu('mm')} to ${cu('cm')}.`] },
      ans: { we: ['a 1 cm cube is 10 × 10 × 10 mm', '20 000', '500 000', '7.5', '0.00023', '60 cubes'], a: ['20 000', '3000', '2 000 000', '500 000', '4500', '1 200 000'].map((x, i) => `${x} ${i < 2 || i === 4 ? cu('mm') : cu('cm')}`), b: ['7.5', '4', '3', '0.25', '0.6', '0.08'].map((x, i) => `${x} ${[0, 1, 4].includes(i) ? cu('cm') : cu('m')}`),
        c: [`0.00023 ${cu('m')}`, `4 000 000 ${cu('mm')}`, `5 000 000 000 ${cu('m')}`, `750 000 ${cu('cm')}`, `0.0125 ${cu('m')}`, `0.000009 ${cu('m')}`], d: ['60', '30', `15 000 ${cu('cm')}, 0.02 ${cu('m')}, 25 000 000 ${cu('mm')}`, `${cu('cm')}; ${cu('m')}; ${cu('cm')}`], ext: [`350 000 ${cu('mm')}`, '1000'], exit: [`6000 ${cu('mm')}`, `2.5 ${cu('m')}`, `1.5 ${cu('cm')}`] },
    }),

    lesson({
      code: '8.11', title: 'Volume of a rectangular prism',
      li: ['find the volume of rectangular prisms'],
      sc: ['use V = <i>l</i> × <i>w</i> × <i>h</i>', 'use V = area of base × height', 'find a missing dimension'],
      terms: ['Volume', 'Base area'],
      we: [{ t: 'Find the volume.', fig: box('8 m', '5 m', '2 m') }, { t: 'Find the volume.', fig: box('20 cm', '4 cm', '4 cm') }, { t: 'Find the volume.', fig: box('12 mm', '8 mm', '7 mm') }, { t: 'Find the volume.', fig: box('15 cm', '10 cm', '20 cm') }, 'A cube has volume 64 cm³. Find its edge length.', 'A box has volume 120 cm³, length 6 cm and width 4 cm. Find its height.'],
      a: { text: 'Find the volume.', kind: 'work', cols: 3, items: [{ t: '', fig: box('8 m', '5 m', '2 m') }, { t: '', fig: box('20 cm', '4 cm', '4 cm') }, { t: '', fig: box('12 mm', '8 mm', '7 mm') }, { t: '', fig: box('10 m', '6 m', '6 m') }, { t: '', fig: box('15 cm', '10 cm', '20 cm') }, { t: '', fig: box('3 cm', '3 cm', '3 cm') }] },
      b: { text: 'Find the volume.', kind: 'short', items: ['6 cm × 5 cm × 2 cm', 'cube with edge 5 m', '2.5 m × 2 m × 1 m', '10 mm × 10 mm × 3 mm', 'base area 24 cm², height 5 cm', '1.2 m × 0.5 m × 0.5 m'] },
      c: { text: 'Find the missing value.', kind: 'work', cols: 3, items: ['A cube has volume 64 cm³. Find its edge.', 'Volume 120 cm³, length 6 cm, width 4 cm. Find the height.', 'Volume 90 m³, base area 15 m². Find the height.', 'A cube has volume 1000 mm³. Find its edge.', 'A box is 40 cm by 30 cm by 25 cm. Find its volume in m³.', 'Double every edge of a 2 cm cube. How many times bigger is the volume?'] },
      d: { text: 'Problems.', kind: 'work', items: ['A shipping container is 12 m by 2.4 m by 2.6 m. Find its volume.', 'How many 5 cm cubes fit in a box 30 cm by 20 cm by 15 cm?', 'Sand is piled into a trailer 2 m by 1.2 m by 0.4 m. Find the volume of sand.', 'A rectangular prism has volume 48 cm³. Find 3 possible sets of whole-number dimensions.'] },
      ext: { q: 'An L-shaped prism has a cross-section of area 90 m² and length 7 m. Find its volume.', steps: ['V = area of cross-section × length', '90 × 7'], a: '630 m³', qs: ['A prism has an L-shaped cross-section of area 45 cm² and length 12 cm. Find its volume.', 'A room is 5 m by 4 m by 2.7 m. An air conditioner cycles 1 m³ of air every 2 seconds. How long to cycle all the air?'] },
      summary: { steps: ['V = length × width × height.', 'Or V = area of base × height.', 'Cube: V = s³.', 'Answer in cubic units.'],
        worked: [['8 × 5 × 2', ['40 × 2'], '80 m³'], ['15 × 10 × 20', ['150 × 20'], '3000 cm³'], ['Cube 64 cm³', ['4 × 4 × 4 = 64'], '4 cm'], ['L-prism: area 90, length 7', ['90 × 7'], '630 m³']] },
      exit: { qs: ['Find the volume: 5 cm × 4 cm × 3 cm.', 'Find the volume of a cube with edge 6 m.', 'A box has volume 72 cm³ and base area 12 cm². Find its height.'] },
      ans: { we: ['80 m³', '320 cm³', '672 mm³', '3000 cm³', '4 cm', '5 cm'], a: ['80 m³', '320 cm³', '672 mm³', '360 m³', '3000 cm³', '27 cm³'], b: ['60 cm³', '125 m³', '5 m³', '300 mm³', '120 cm³', '0.3 m³'],
        c: ['4 cm', '5 cm', '6 m', '10 mm', '0.03 m³', '8 times'], d: [`${(12 * 2.4 * 2.6).toFixed(3) * 1} m³`, '72 cubes', '0.96 m³', 'e.g. 1×1×48, 2×4×6, 3×4×4'], ext: ['540 cm³', '108 s'], exit: ['60 cm³', '216 m³', '6 cm'] },
    }),

    lesson({
      code: '8.12', title: 'Volume of a prism',
      li: ['find the volume of prisms with triangular and other cross-sections'],
      sc: ['find the area of the cross-section first', 'use V = A × <i>h</i> (h is the length of the prism)', 'use this for triangular, trapezium and composite prisms'],
      terms: ['Cross-section', 'Prism'],
      we: [{ t: 'Find the volume.', fig: D.triPrism({ base: '7.2 cm', tri: '10.2 cm', len: '15.1 cm', w: 56, h: 36 }) }, { t: 'Find the volume.', fig: D.triPrism({ base: '16 mm', tri: '11 mm', len: '25 mm', w: 56, h: 36 }) },
        { t: 'Find the volume (trapezium cross-section: parallel sides 7 m and 12 m, height 6 m, length 10 m).', fig: prismF([[0, 16], [24, 16], [18, 0], [6, 0]], [['12 m', 12, 21], ['7 m', 12, -2]]) }, 'A prism has cross-section area 35 cm² and length 8 cm. Find its volume.', 'Find the volume of a triangular prism: triangle base 6 cm, height 4 cm, prism length 10 cm.', 'A prism has volume 360 m³ and length 12 m. Find the area of its cross-section.'],
      a: { text: 'Find the volume. (A = cross-section area, h = length)', kind: 'short', keepShort: true, items: ['A = 20 cm², h = 5 cm', 'A = 35 cm², h = 8 cm', 'A = 12 m², h = 3 m', 'A = 7.5 mm², h = 4 mm', 'A = 100 cm², h = 0.5 cm', 'A = 48 m², h = 10 m'] },
      b: { text: 'Find the area of the triangular cross-section, then the volume.', kind: 'work', cols: 3, items: [{ t: '', fig: D.triPrism({ base: '6 cm', tri: '4 cm', len: '10 cm', w: 56, h: 36 }) }, { t: '', fig: D.triPrism({ base: '16 mm', tri: '11 mm', len: '25 mm', w: 56, h: 36 }) }, { t: '', fig: D.triPrism({ base: '8 m', tri: '3 m', len: '12 m', w: 56, h: 36 }) }] },
      c: { text: 'Find the volume.', kind: 'work', cols: 3, items: [{ t: '', fig: D.triPrism({ base: '7.2 cm', tri: '10.2 cm', len: '15.1 cm', w: 56, h: 36 }) }, { t: 'trapezium: 7 m and 12 m, height 6 m; length 10 m', fig: prismF([[0, 16], [24, 16], [18, 0], [6, 0]], [['12 m', 12, 21], ['7 m', 12, -2]]) }, { t: 'L-shape area 45 cm², length 12 cm', fig: prismF([[0, 0], [8, 0], [8, 12], [20, 12], [20, 20], [0, 20]], []) }] },
      d: { text: 'Problems.', kind: 'work', items: ['A tent is a triangular prism: triangle base 2.4 m, height 1.5 m, length 3 m. Find its volume.', 'A ramp has a right-triangle cross-section with legs 1.2 m and 0.5 m and width 2 m. Find its volume.', 'A prism has volume 360 m³ and length 12 m. Find the cross-section area.', 'A water trough has a trapezium cross-section (parallel sides 60 cm and 40 cm, depth 30 cm) and length 2 m. Find its volume in cm³.'] },
      ext: { q: 'A swimming pool is 25 m long and 10 m wide. It is 1 m deep at one end and 2 m deep at the other. Find its volume.', steps: ['Cross-section (side view) is a trapezium: ½ × (1 + 2) × 25 = 37.5 m²', 'Width 10 m: 37.5 × 10'], a: '375 m³', qs: ['A pool 50 m by 20 m is 1.2 m deep at one end and 2 m at the other. Find its volume.', 'How many litres is the pool in the worked example? (1 m³ = 1000 L)'] },
      summary: { steps: ['Identify the cross-section (the end face).', 'Find its area A.', 'V = A × length of the prism.', 'Triangle: A = ½bh. Trapezium: A = ½(a + b)h.'],
        worked: [['Triangle 7.2 × 10.2, length 15.1', ['A = ½ × 7.2 × 10.2 = 36.72', '× 15.1'], `${(0.5 * 7.2 * 10.2 * 15.1).toFixed(3) * 1} cm³`], ['A = 35, h = 8', ['35 × 8'], '280 cm³'], ['Trapezium 7, 12, height 6, length 10', ['½ × 19 × 6 = 57', '× 10'], '570 m³'], ['Sloping pool', ['37.5 × 10'], '375 m³']] },
      exit: { qs: ['A prism has cross-section 15 cm² and length 6 cm. Find its volume.', 'Triangle base 5 m, height 4 m, prism length 9 m. Find the volume.', 'A prism has volume 200 cm³ and cross-section 25 cm². Find its length.'] },
      ans: { we: [`${(0.5 * 7.2 * 10.2 * 15.1).toFixed(3) * 1} cm³`, '2200 mm³', '570 m³', '280 cm³', '120 cm³', '30 m²'], a: ['100 cm³', '280 cm³', '36 m³', '30 mm³', '50 cm³', '480 m³'], b: ['120 cm³', '2200 mm³', '144 m³'],
        c: [`${(0.5 * 7.2 * 10.2 * 15.1).toFixed(3) * 1} cm³`, '570 m³', '540 cm³'], d: ['5.4 m³', '0.6 m³', '30 m²', '300 000 cm³'], ext: ['1600 m³', '375 000 L'], exit: ['90 cm³', '90 m³', '8 cm'] },
    }),

    lesson({
      code: '8.13', title: 'Capacity',
      li: ['find the capacity of a container in litres'],
      sc: [`know 1 ${cu('cm')} = 1 mL and 1 ${cu('m')} = 1000 L`, 'find volume, then convert to litres', 'solve problems about water levels and large volumes'],
      terms: ['Capacity', 'Megalitre'],
      we: [`A box is 30 cm by 20 cm by 10 cm. Find its capacity in litres.`, 'The water is poured into a prism with base 20 cm by 20 cm. How high does it reach?', `Convert 3.5 ${cu('m')} to litres.`, 'Find the capacity in litres of a tank 8 m by 5 m by 2 m.', 'An iceberg is like a prism 160 km by 50 km by 250 m. How many megalitres of water?', 'A 2 L jug fills cups of 250 mL. How many cups?'],
      a: { text: 'Convert.', kind: 'short', items: [`500 ${cu('cm')} to mL`, `2000 ${cu('cm')} to L`, `3.5 ${cu('m')} to L`, `0.2 ${cu('m')} to L`, '4500 L to kL', '2 ML to L'] },
      b: { text: 'Find the capacity in litres.', kind: 'short', items: ['30 cm × 20 cm × 10 cm', '8 m × 5 m × 2 m', '20 cm × 4 cm × 4 cm', '50 cm × 40 cm × 30 cm', '1 m × 1 m × 1 m', '10 cm × 10 cm × 10 cm'] },
      c: { text: 'Find the capacity in litres of each prism.', kind: 'work', cols: 3, items: [{ t: '', fig: box('12 mm', '8 mm', '7 mm') }, { t: '', fig: box('10 m', '6 m', '6 m') }, { t: '', fig: box('15 cm', '10 cm', '20 cm') }, 'triangular prism: ½ × 16 × 11 mm, length 25 mm', 'trapezium prism: 570 m³', 'cube, edge 2.5 m'] },
      d: { text: 'Problems.', kind: 'work', items: ['A 30 cm × 20 cm × 10 cm box of water is poured into a prism with base 20 cm × 20 cm. How high does the water reach?', 'Iceberg B9 was like a prism 160 km by 50 km by 250 m. How many megalitres of water did it hold?', 'A fish tank 60 cm × 30 cm × 40 cm is filled to 5 cm from the top. How many litres of water?', 'A 1.5 m by 0.8 m bath fills at 12 L a minute. How deep is the water after 10 minutes (cm)?'] },
      ext: { q: 'Rain of 10 mm falls on a 12 m by 8 m roof. How many litres run into the tank?', steps: ['10 mm = 0.01 m', 'V = 12 × 8 × 0.01 = 0.96 m³', '× 1000'], a: '960 L', qs: ['How much rain (mm) must fall on the roof to fill a 4800 L tank?', 'A house uses 180 L per person per day. How many days does 960 L last a family of 4?'] },
      summary: { title: 'Capacity', steps: [`1 ${cu('cm')} = 1 mL; 1000 ${cu('cm')} = 1 L.`, `1 ${cu('m')} = 1000 L = 1 kL.`, '1 ML (megalitre) = 1 000 000 L.', 'Find the volume first, then convert.'],
        worked: [['30 × 20 × 10 cm', ['6000 cm³'], '6 L'], ['Pour into 20 × 20 base', ['6000 ÷ 400'], '15 cm (D)'], ['8 × 5 × 2 m', ['80 m³ × 1000'], '80 000 L'], ['Rain on a roof', ['0.96 m³'], '960 L']] },
      exit: { qs: [`Convert 2500 ${cu('cm')} to litres.`, 'Find the capacity in litres of a box 25 cm × 20 cm × 10 cm.', `Convert 0.6 ${cu('m')} to litres.`] },
      ans: { we: ['6 L', '15 cm (D)', '3500 L', '80 000 L', `${n(160000 * 50000 * 250 / 1000)} ML`, '8 cups'], a: ['500 mL', '2 L', '3500 L', '200 L', '4.5 kL', '2 000 000 L'], b: ['6 L', '80 000 L', '0.32 L', '60 L', '1000 L', '1 L'],
        c: ['0.672 mL → 0.000672 L', '360 000 L', '3 L', '0.0022 L', '570 000 L', '15 625 L'], d: ['15 cm', `${n(160000 * 50000 * 250 / 1000)} ML`, '63 L', '10 cm'], ext: ['50 mm', '1⅓ days'], exit: ['2.5 L', '5 L', '600 L'] },
    }),
  ],
};
