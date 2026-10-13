// Year 10 transition, Chapter 2 Measurement: seven two-page lessons (Easy page, Medium page), easier than the
// Cambridge MATHS GOLD Year 10 Chapter 2 review. Most questions are about a labelled diagram (helpers.js draws them);
// each Medium page ends with 2 or 3 word problems. Calculators allowed; answers with π are to 1 decimal place.
module.exports = require('../chapter')({
  dir: __dirname, number: 2, title: 'Measurement', art: 'gold-feather', fileName: 'Year10-Transition-Ch02-Measurement',
  plan: [['2.1', 'Converting units'], ['2.2', 'Perimeter'], ['2.3', 'Circumference'], ['2.4', 'Area'], ['2.5', 'Area of circles'], ['2.6', 'Surface area'], ['2.7', 'Volume and capacity']],
  goals: ['convert between units of length, mass, capacity and time', 'find the perimeter of shapes, including composite shapes', 'find the circumference and the area of circles',
    'find the area of squares, rectangles, triangles, parallelograms, trapeziums and rhombuses', 'find the surface area of prisms', 'find the volume and capacity of prisms and cylinders'],
});
