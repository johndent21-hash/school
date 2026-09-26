// Blended booklet, Chapter 8 Area and volume. Six pages for lessons with shapes and solids; four for unit conversions.
const blend = require('../../lib/blend');

const sq = (u) => `${u}<sup>2</sup>`;
const cu = (u) => `${u}<sup>3</sup>`;
const D = (text, pairs, hw, cols = 3) => ({ text, cols, items: pairs.map((p) => p[0]), ans: pairs.map((p) => p[1]), hw });
const pi1 = (x) => (Math.PI * x).toFixed(1);

module.exports = blend(require('../../year7/ch08-area-volume/chapter.js'), {
  fileName: 'Year7-Ch08-Area-and-volume-Lessons', pages: 6,
  more: {
    '8.01': { pages: 4, stems: ['Convert. Bigger unit to smaller: multiply.', 'Convert capacity and time.', 'Convert, then solve.'],
      drill: D('Quick drill: convert.', [['5 km to m', '5000 m'], ['350 cm to m', '3.5 m'], ['2.4 kg to g', '2400 g'], ['1500 mL to L', '1.5 L'], ['3 h to min', '180 min'], ['90 s to min', '1.5 min'], ['6 cm to mm', '60 mm'], ['4000 kg to t', '4 t']], ['2.5 L to mL', '2500 mL', 'Convert.'], 4) },
    '8.02': { stems: ['Find the perimeter.', 'Find the perimeter. Find missing sides first.', 'Find the perimeter, then solve.'],
      drill: D('Quick drill: find the perimeter.', [['square, side 7 cm', '28 cm'], ['rectangle 8 m by 3 m', '22 m'], ['equilateral triangle, side 5 mm', '15 mm'], ['rectangle 12 cm by 4.5 cm', '33 cm'], ['regular hexagon, side 6 m', '36 m'], ['square, side 2.5 km', '10 km']], ['rectangle 9 m by 6 m', '30 m', 'Find the perimeter.']) },
    '8.03': { stems: ['Find the circumference (1 decimal place).', 'Find C (1 decimal place).', 'Solve.'],
      drill: D('Quick drill: find the circumference, C = πd (1 d.p.).', [['d = 4 cm', `${pi1(4)} cm`], ['d = 10 m', `${pi1(10)} m`], ['r = 3 cm', `${pi1(6)} cm`], ['r = 5 mm', `${pi1(10)} mm`], ['d = 1 m', `${pi1(1)} m`], ['r = 20 cm', `${pi1(40)} cm`]], ['d = 8 m', `${pi1(8)} m`, 'Find the circumference (1 d.p.).']) },
    '8.04': { pages: 4, stems: ['Explain, then convert.', 'Convert.', 'Convert.'],
      drill: D('Quick drill: convert.', [[`2 ${sq('cm')} to ${sq('mm')}`, `200 ${sq('mm')}`], [`500 ${sq('mm')} to ${sq('cm')}`, `5 ${sq('cm')}`], [`3 ${sq('m')} to ${sq('cm')}`, `30 000 ${sq('cm')}`], [`20 000 ${sq('cm')} to ${sq('m')}`, `2 ${sq('m')}`], [`4 ha to ${sq('m')}`, `40 000 ${sq('m')}`], [`30 000 ${sq('m')} to ha`, '3 ha']], [`6 ${sq('m')} to ${sq('cm')}`, `60 000 ${sq('cm')}`, 'Convert.']) },
    '8.05': { stems: ['Find the area.', 'Find the area. Use the same units.', 'Find the missing side.'],
      drill: D('Quick drill: find the area.', [['square, side 6 cm', `36 ${sq('cm')}`], ['rectangle 7 m by 4 m', `28 ${sq('m')}`], ['rectangle 12 mm by 5 mm', `60 ${sq('mm')}`], ['square, side 1.5 m', `2.25 ${sq('m')}`], ['rectangle 20 cm by 0.5 cm', `10 ${sq('cm')}`], ['square, side 11 km', `121 ${sq('km')}`]], ['rectangle 9 m by 8 m', `72 ${sq('m')}`, 'Find the area.']) },
    '8.06': { stems: ['Find the area. A = ½bh.', 'Find the area. The height may be outside.', 'Find the height, then explain.'],
      drill: D('Quick drill: find the area of the triangle.', [['b = 10 cm, h = 4 cm', `20 ${sq('cm')}`], ['b = 6 m, h = 7 m', `21 ${sq('m')}`], ['b = 12 mm, h = 5 mm', `30 ${sq('mm')}`], ['b = 8 cm, h = 8 cm', `32 ${sq('cm')}`], ['b = 3 m, h = 5 m', `7.5 ${sq('m')}`], ['b = 20 km, h = 9 km', `90 ${sq('km')}`]], ['b = 14 cm, h = 6 cm', `42 ${sq('cm')}`, 'Find the area of the triangle.']) },
    '8.07': { stems: ['Find the area. A = bh.', 'Find the area, then explain.', 'Find the height, then the area.'],
      drill: D('Quick drill: find the area of the parallelogram.', [['b = 9 cm, h = 4 cm', `36 ${sq('cm')}`], ['b = 15 m, h = 8 m', `120 ${sq('m')}`], ['b = 6.5 mm, h = 2 mm', `13 ${sq('mm')}`], ['b = 12 cm, h = 12 cm', `144 ${sq('cm')}`], ['b = 30 m, h = 1.5 m', `45 ${sq('m')}`], ['b = 7 km, h = 11 km', `77 ${sq('km')}`]], ['b = 13 m, h = 5 m', `65 ${sq('m')}`, 'Find the area of the parallelogram.']) },
    '8.08': { stems: ['Find the area. Add or subtract rectangles.', 'Find the area.', 'Solve the problem.'],
      drill: D('Quick drill: find the area.', [[`a 10 × 6 rectangle with a 2 × 2 square hole (m)`, `56 ${sq('m')}`], [`two rectangles, 5 × 3 and 4 × 2 (cm)`, `23 ${sq('cm')}`], [`a 8 × 8 square minus a 3 × 4 corner (mm)`, `52 ${sq('mm')}`], [`a 6 × 4 rectangle plus a triangle, base 6, height 2 (m)`, `30 ${sq('m')}`]], [`a 12 × 5 rectangle with a 3 × 3 hole (cm)`, `51 ${sq('cm')}`, 'Find the area.'], 2) },
    '8.09': { stems: ['Is it a prism? Draw its cross-section.', 'Draw the cross-section, then explain.', 'Sketch the three views.'],
      drill: D('Quick drill: name the shape of the cross-section.', [['cube', 'square'], ['triangular prism', 'triangle'], ['hexagonal prism', 'hexagon'], ['rectangular prism', 'rectangle'], ['cylinder', 'circle'], ['pentagonal prism', 'pentagon']], ['octagonal prism', 'octagon', 'Name the shape of the cross-section.']) },
    '8.10': { pages: 4, stems: ['Explain, then convert.', 'Convert.', 'Convert, then count cubes.'],
      drill: D('Quick drill: convert.', [[`4 ${cu('cm')} to ${cu('mm')}`, `4000 ${cu('mm')}`], [`2000 ${cu('mm')} to ${cu('cm')}`, `2 ${cu('cm')}`], [`1 ${cu('m')} to ${cu('cm')}`, `1 000 000 ${cu('cm')}`], [`500 000 ${cu('cm')} to ${cu('m')}`, `0.5 ${cu('m')}`], [`0.3 ${cu('cm')} to ${cu('mm')}`, `300 ${cu('mm')}`], [`2.5 ${cu('m')} to ${cu('cm')}`, `2 500 000 ${cu('cm')}`]], [`7 ${cu('cm')} to ${cu('mm')}`, `7000 ${cu('mm')}`, 'Convert.']) },
    '8.11': { stems: ['Find the volume. V = lwh.', 'Find the volume.', 'Find the edge or the height.'],
      drill: D('Quick drill: find the volume.', [['5 cm × 4 cm × 2 cm', `40 ${cu('cm')}`], ['cube, edge 3 m', `27 ${cu('m')}`], ['10 mm × 6 mm × 5 mm', `300 ${cu('mm')}`], ['8 m × 2 m × 1.5 m', `24 ${cu('m')}`], ['cube, edge 10 cm', `1000 ${cu('cm')}`], ['12 cm × 3 cm × 3 cm', `108 ${cu('cm')}`]], ['7 m × 4 m × 3 m', `84 ${cu('m')}`, 'Find the volume.']) },
    '8.12': { stems: ['Find the volume. V = Ah.', 'Find the volume. Find the area of the cross-section first.', 'Find the volume or the cross-section.'],
      drill: D('Quick drill: find the volume (A = area of cross-section, h = length).', [['A = 15 cm², h = 4 cm', `60 ${cu('cm')}`], ['A = 9 m², h = 7 m', `63 ${cu('m')}`], ['A = 2.5 cm², h = 10 cm', `25 ${cu('cm')}`], ['A = 40 mm², h = 3 mm', `120 ${cu('mm')}`]], ['A = 22 m², h = 5 m', `110 ${cu('m')}`, 'Find the volume.'], 2) },
    '8.13': { pages: 4, stems: ['Find the capacity, then the water height.', 'Convert, then find the capacity.', 'Solve.'],
      drill: D('Quick drill: convert.', [[`1000 ${cu('cm')} to L`, '1 L'], [`250 ${cu('cm')} to mL`, '250 mL'], [`2 ${cu('m')} to L`, '2000 L'], ['3500 mL to L', '3.5 L'], ['6 kL to L', '6000 L'], [`0.5 ${cu('m')} to L`, '500 L']], [`4 ${cu('m')} to L`, '4000 L', 'Convert.']) },
  },
});
