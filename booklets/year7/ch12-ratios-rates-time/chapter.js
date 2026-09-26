// Year 7 Chapter 12: Ratios, rates and time. One 4-page lesson per exercise in Test Yourself 12.
const lesson = require('../../lib/lesson');
const D = require('../../lib/diagrams');
const G = require('../../lib/graphs');
const { gcd, fmt } = require('../../lib/calc');

// Simplify a ratio of any number of parts.
const rat = (...xs) => { const g = xs.reduce((a, b) => gcd(a, b)); return xs.map((x) => x / g).join(' : '); };
const sq = (n, shaded, cols) => D.squares({ n, shaded, cols, size: 6 });
// Time helpers (minutes).
const hm = (m) => { const h = Math.floor(m / 60), r = m % 60; return h ? (r ? `${h} h ${r} min` : `${h} h`) : `${r} min`; };
const t12 = (s) => { const [h, m] = s.split(':').map(Number); const ap = h < 12 ? 'a.m.' : 'p.m.'; const hh = h % 12 === 0 ? 12 : h % 12; return `${hh}:${String(m).padStart(2, '0')} ${ap}`; };
const t24 = (s) => { const [t, ap] = s.split(' '); let [h, m] = t.split(':').map(Number); if (ap === 'p.m.' && h !== 12) h += 12; if (ap === 'a.m.' && h === 12) h = 0; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`; };
const mins = (s) => { const [h, m] = t24(s.includes('.m.') ? s : `${s}`).split(':').map(Number); return h * 60 + m; };
const diff = (a, b) => hm(((mins(b) - mins(a)) % 1440 + 1440) % 1440);
const money = (x) => `$${x.toFixed(2)}`;

const walkYs = [0, 3, 6, 6, 11, 11, 8, 4, 0];
const walk = G.lineGraph({ title: 'Keith and Kent’s bushwalk', xs: ['10am', '11', '12', '1pm', '2', '3', '4', '5', '6pm'], ys: walkYs, max: 12, step: 1, labelEvery: 2, yTitle: 'Distance from camp (km)', xTitle: 'Time', h: 52 });
const drive = G.lineGraph({ title: 'Mia’s car trip', xs: ['8am', '9', '10', '11', '12', '1pm'], ys: [0, 80, 160, 160, 260, 300], max: 300, step: 25, labelEvery: 50, yTitle: 'Distance (km)', xTitle: 'Time', h: 52 });
const stations = ['Moss Vale', 'Bowral', 'Mittagong', 'Picton', 'Campbelltown', 'Sydney (Central)'];
const trains = [['6:05', '6:12', '6:20', '6:58', '7:25', '8:21'], ['7:40', '7:47', '7:55', '8:33', '9:00', '9:56'], ['9:10', '9:17', '9:25', '10:03', '10:30', '11:26'], ['7:45', '7:52', '8:00', '8:38', '9:05', '10:01']];
const tt = `<table class="data-table tt"><tr><th>Station</th><th>a.m.</th><th>a.m.</th><th>a.m.</th><th>p.m.</th></tr>${stations.map((s, i) => `<tr><th style="text-align:left">${s}</th>${trains.map((t) => `<td>${t[i]}</td>`).join('')}</tr>`).join('')}</table>`;
const bus = `<table class="data-table tt"><tr><th>Stop</th><th colspan="3">Bus times (24-hour)</th></tr>${[['School', '15:10', '15:40', '16:10'], ['Library', '15:18', '15:48', '16:18'], ['Shops', '15:31', '16:01', '16:31'], ['Beach', '15:45', '16:15', '16:45']].map((r) => `<tr><th style="text-align:left">${r[0]}</th>${r.slice(1).map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</table>`;

module.exports = {
  year: 7, stage: 4, number: 12, title: 'Ratios, rates and time', accent: '#6c5b7b',
  fileName: 'Year7-Ch12-Ratios-rates-and-time',
  goals: ['write, simplify and use ratios', 'solve ratio problems', 'write rates and find the best buy', 'solve rate problems and read travel graphs', 'round, convert and calculate with time', 'use 12-hour and 24-hour time, time differences and timetables'],
  syllabus: 'NSW Mathematics K–10 Syllabus (2022), Stage 4 Number and algebra: MA4-RAT-C-01 solves problems involving ratios and rates, and analyses distance–time graphs; time calculations from Stage 3 extended.',
  lessons: [
    lesson({
      code: '12.01', title: 'Ratios',
      li: ['write a ratio to compare quantities'],
      sc: ['write a ratio in the order the words give', 'use a colon: 3 : 5', 'find a part-to-part and a part-to-whole ratio'],
      terms: ['Ratio', 'Part', 'Whole'],
      we: [{ t: 'Ratio of shaded to unshaded?', fig: sq(8, 3, 4) }, { t: 'Ratio of shaded to unshaded?', fig: sq(10, 4, 5) }, '17 women and 38 men: find the ratio of men to women.', 'Find the ratio of women to the total.', 'A recipe uses 2 cups of flour and 1 cup of sugar. Write the ratio of flour to sugar.', 'Is 3 : 5 the same as 5 : 3? Explain.'],
      a: { text: 'Write the ratio of shaded to unshaded.', kind: 'work', cols: 3, items: [{ t: '', fig: sq(6, 1, 3) }, { t: '', fig: sq(8, 5, 4) }, { t: '', fig: sq(9, 4, 3) }, { t: '', fig: sq(12, 7, 4) }, { t: '', fig: sq(6, 2, 3) }, { t: '', fig: sq(10, 3, 5) }] },
      b: { text: 'A class has 13 girls and 12 boys. Write the ratio of:', kind: 'short', items: ['girls to boys', 'boys to girls', 'girls to the whole class', 'boys to the whole class', 'teachers (1) to students', 'students to teachers'] },
      c: { text: 'Write each ratio.', kind: 'work', cols: 3, items: ['A bag has 7 red and 4 green apples: red to green', 'Green apples to all apples', 'A team won 9, lost 5, drew 2: wins to losses', 'Losses to games played', 'The letters in RATIO: vowels to consonants', 'A 9 m pole and a 4 m pole: short to long'] },
      d: { text: 'Think it through.', kind: 'work', items: ['A drink is 1 part cordial to 4 parts water. What fraction is cordial?', 'In a ratio of cats to dogs of 3 : 2, there are 12 cats. How many dogs?', 'Draw a 10-square diagram with a shaded to unshaded ratio of 3 : 2.', 'Can a ratio be written as a fraction? Give an example.'] },
      ext: { q: 'The ratio of boys to girls is 4 : 5. What fraction of the class are boys?', steps: ['Total parts = 4 + 5 = 9', 'Boys are 4 of the 9 parts'], a: '4/9', qs: ['The ratio of red to blue to green beads is 2 : 3 : 5. What fraction are blue?', 'In a 3 : 7 ratio of juice to water, what percentage is juice?'] },
      summary: { steps: ['A ratio compares quantities of the same kind.', 'Write the parts in the order given.', 'Use a colon: 3 : 5 (read “3 to 5”).', 'Part to whole: add the parts for the whole.'],
        worked: [['3 shaded, 5 unshaded', ['shaded : unshaded'], '3 : 5'], ['Men to women', ['38 : 17'], '38 : 17'], ['Women to total', ['17 : 55'], '17 : 55'], ['Boys : girls = 4 : 5', ['4 of 9 parts'], '4/9 are boys']] },
      exit: { qs: ['6 cats and 5 dogs. Write the ratio of cats to dogs.', 'Write the ratio of dogs to all the animals.', 'A juice is 1 part concentrate to 6 parts water. Write the ratio of water to the whole drink.'] },
      ans: { we: ['3 : 5', '4 : 6', '38 : 17', '17 : 55', '2 : 1', 'No: the order matters'], a: ['1 : 5', '5 : 3', '4 : 5', '7 : 5', '2 : 4', '3 : 7'], b: ['13 : 12', '12 : 13', '13 : 25', '12 : 25', '1 : 25', '25 : 1'],
        c: ['7 : 4', '4 : 11', '9 : 5', '5 : 16', '3 : 2', '4 : 9'], d: ['1/5', '8', '3 shaded, 2 unshaded in each 5 (6 : 4)', 'yes, e.g. 2 : 3 as 2/3 of the second amount'], ext: ['3/10', '30%'], exit: ['6 : 5', '5 : 11', '6 : 7'] },
    }),

    lesson({
      code: '12.02', title: 'Equivalent and simplified ratios',
      li: ['find equivalent ratios and simplify ratios, including with units'],
      sc: ['multiply or divide every part by the same number', 'divide by the HCF to simplify', 'change to the same units before simplifying'],
      terms: ['Equivalent ratio', 'Simplest form'],
      we: ['Complete: 2 : 3 = 8 : ___', 'Complete: 2 : 3 : 4 = 6 : ___ : ___', 'Simplify 12 : 21.', 'Simplify 18 : 6 : 24.', 'Simplify 2 cm : 10 mm.', 'Simplify 20 minutes : 1 hour.'],
      a: { text: 'Complete each pair of equivalent ratios.', kind: 'short', items: ['2 : 3 = 8 : ___', '1 : 5 = 2 : ___', '3 : 4 = ___ : 20', '5 : 2 = 15 : ___', '2 : 3 : 4 = 6 : ___ : ___', '10 : 15 = 2 : ___'] },
      b: { text: 'Simplify.', kind: 'short', items: ['12 : 21', '25 : 75', '6 : 36', '25 : 45', '18 : 6 : 24', '5 : 25 : 100'] },
      c: { text: 'Change to the same units, then simplify.', kind: 'work', cols: 3, items: ['2 cm : 10 mm', '5 dozen eggs : 6 eggs', '3 L : 600 mL', '50 m : 1 km', '40 cents : $2', '18 months : 3 years'] },
      d: { text: 'Simplify.', kind: 'work', items: ['20 minutes : 1 hour', '12 days : 3 weeks', '4 days : 10 hours', '1.5 : 2.5 (hint: × 2 first)'] },
      ext: { q: 'Simplify ½ : ⅓.', steps: ['Multiply both by 6 (the LCD)', '3 : 2'], a: '3 : 2', qs: ['Simplify ¾ : ⅝.', 'Simplify 0.25 kg : 750 g : 1.5 kg.'] },
      summary: { steps: ['Equivalent: × or ÷ every part by the same number.', 'Simplify: ÷ by the HCF of all parts.', 'Units: change to the same unit first, then drop the units.', 'Decimals or fractions: multiply to make whole numbers.'],
        worked: [['2 : 3 = 8 : ?', ['× 4'], '8 : 12'], ['12 : 21', ['÷ 3'], rat(12, 21)], ['2 cm : 10 mm', ['20 mm : 10 mm'], '2 : 1'], ['½ : ⅓', ['× 6'], '3 : 2']] },
      exit: { qs: ['Complete: 3 : 7 = 9 : ___', 'Simplify 16 : 40.', 'Simplify 30 cm : 2 m.'] },
      ans: { we: ['8 : 12', '6 : 9 : 12', rat(12, 21), rat(18, 6, 24), '2 : 1', '1 : 3'], a: ['12', '10', '15', '6', '9, 12', '3'], b: [rat(12, 21), rat(25, 75), rat(6, 36), rat(25, 45), rat(18, 6, 24), rat(5, 25, 100)],
        c: ['2 : 1', '10 : 1', '5 : 1', '1 : 20', '1 : 5', '1 : 2'], d: ['1 : 3', '4 : 7', '48 : 5', '3 : 5'], ext: ['6 : 5', '1 : 3 : 6'], exit: ['21', '2 : 5', '3 : 20'] },
    }),

    lesson({
      code: '12.03', title: 'Ratio problems',
      li: ['solve problems using ratios'],
      sc: ['use the unitary method: find one part first', 'find an unknown quantity from a ratio', 'divide a quantity in a given ratio'],
      terms: ['Unitary method', 'Share'],
      we: ['Girls : boys = 4 : 3. There are 75 boys. How many girls?', 'Tyrone : Erin invested in the ratio 5 : 7. Erin invested $63 000. How much did Tyrone invest?', 'Share $60 in the ratio 1 : 2.', 'Share $450 in the ratio 4 : 5.', 'A map has scale 1 : 50 000. 3 cm on the map is how far in real life?', 'Cement, sand and gravel are mixed 1 : 2 : 3. How much sand is in 36 kg of mix?'],
      a: { text: 'Find the unknown.', kind: 'short', items: ['3 : 4 = 12 : ?', '2 : 5 = ? : 30', '7 : 2 = 35 : ?', '1 : 6 = 8 : ?', '5 : 3 = ? : 12', '4 : 9 = 20 : ?'] },
      b: { text: 'Share each amount in the ratio given.', kind: 'short', items: ['$60 in 1 : 2', '$100 in 2 : 3', '$45 in 4 : 5', '72 lollies in 5 : 3', '$1000 in 1 : 4', '48 kg in 1 : 2 : 3'] },
      c: { text: 'Solve.', kind: 'work', cols: 3, items: ['Girls : boys = 4 : 3. There are 75 boys. How many girls?', 'Tyrone : Erin = 5 : 7. Erin invested $63 000. Find Tyrone’s share.', 'Paint is mixed blue : white = 2 : 5. How much white for 6 L of blue?', 'Share $450 in the ratio 4 : 5.', 'Map scale 1 : 50 000. 3 cm on the map is how many km?', 'Cement : sand : gravel = 1 : 2 : 3. How much sand in 36 kg?'] },
      d: { text: 'Harder problems.', kind: 'work', items: ['The ratio of adults to children at a show is 3 : 8. There were 440 people. How many were children?', 'Sam and Jo share money 3 : 5. Jo gets $24 more than Sam. How much does each get?', 'A recipe for 4 people uses 300 g of pasta. How much for 10 people?', 'A photo 10 cm by 15 cm is enlarged in the ratio 1 : 3. Find the new size.'] },
      ext: { q: 'The ratio of red to blue marbles is 3 : 5. After 6 red marbles are added, the ratio is 1 : 1. How many blue marbles are there?', steps: ['Red 3k, blue 5k', '3k + 6 = 5k, so 2k = 6, k = 3'], a: '15 blue', qs: ['The ratio of boys to girls is 2 : 3. After 4 boys join, it is 1 : 1. How many girls?', 'Share $84 among A, B and C so that A gets twice B and C gets three times B.'] },
      summary: { steps: ['Find the value of one part.', 'Multiply to find the other quantities.', 'To share: total parts, then amount ÷ total parts.', 'Check the parts add back to the total.'],
        worked: [['Girls : boys = 4 : 3, boys 75', ['1 part = 25'], '100 girls'], ['Tyrone : Erin = 5 : 7', ['1 part = 63 000 ÷ 7 = 9000'], '$45 000'], ['$450 in 4 : 5', ['9 parts, 1 part = $50'], '$200 and $250'], ['Marbles 3 : 5 → 1 : 1', ['2k = 6'], '15 blue']] },
      exit: { qs: ['Complete: 2 : 7 = 10 : ___', 'Share $80 in the ratio 3 : 5.', 'Juice : water = 1 : 4. How much water for 250 mL of juice?'] },
      ans: { we: ['100', '$45 000', '$20 and $40', '$200 and $250', '1.5 km', '12 kg'], a: ['16', '12', '10', '48', '20', '45'], b: ['$20, $40', '$40, $60', '$20, $25', '45, 27', '$200, $800', '8, 16, 24 kg'],
        c: ['100', '$45 000', '15 L', '$200, $250', '1.5 km', '12 kg'], d: ['320', 'Sam $36, Jo $60', '750 g', '30 cm by 45 cm'], ext: ['12', 'A $28, B $14, C $42'], exit: ['35', '$30 and $50', '1 L'] },
    }),

    lesson({
      code: '12.04', title: 'Rates',
      li: ['write and simplify rates'],
      sc: ['know a rate compares quantities of different kinds', 'write a rate with both units, e.g. km/h', 'simplify a rate to a rate per 1 unit'],
      terms: ['Rate', 'Unit rate'],
      we: ['Write as a rate: 150 000 voters for 50 politicians.', 'Write as a rate: 1000 sheep over 5 hectares.', 'Write as a rate: 10 tickets for $8.', 'Write as a rate: 810 stitches to make 3 balls.', 'A car travels 240 km in 3 hours. Find the speed in km/h.', 'Convert 90 km/h to metres per minute.'],
      a: { text: 'Write each as a rate in simplest form.', kind: 'short', items: ['150 000 voters for 50 politicians', '1000 sheep over 5 hectares', '10 tickets for $8', '810 stitches for 3 balls', '$120 for 8 hours', '240 km in 3 hours'] },
      b: { text: 'Write each as a rate per 1 unit.', kind: 'short', items: ['$15 for 3 kg', '60 L in 4 minutes', '450 words in 5 min', '72 beats in 1 min (per second)', '$4.50 for 5 L', '56 km on 4 L'] },
      c: { text: 'Find each rate. Include units.', kind: 'work', cols: 3, items: ['A car travels 240 km in 3 hours. Speed?', 'A tap fills 45 L in 9 minutes. Rate?', 'A worker earns $187 for 8.5 hours. Hourly rate?', 'A plane flies 3600 km in 4.5 hours. Speed?', 'A printer prints 150 pages in 6 min. Pages per minute?', 'A runner runs 400 m in 80 s. Speed in m/s?'] },
      d: { text: 'Converting rates.', kind: 'work', items: ['Convert 90 km/h to metres per minute.', 'Convert 5 m/s to km/h.', 'Convert $18 per hour to cents per minute.', 'Which is faster: 20 m/s or 70 km/h?'] },
      ext: { q: 'Convert 72 km/h to m/s.', steps: ['72 km = 72 000 m; 1 h = 3600 s', '72 000 ÷ 3600'], a: '20 m/s', qs: ['Convert 15 m/s to km/h.', 'A snail moves at 3 mm/s. How many metres per hour is that?'] },
      summary: { steps: ['A <b>rate</b> compares different kinds of quantities.', 'Write both units: km/h, $/kg, L/min.', 'Unit rate: divide to get “per 1”.', 'Convert units on the top and bottom separately.'],
        worked: [['150 000 voters, 50 politicians', ['÷ 50'], '3000 voters/politician'], ['10 tickets for $8', ['8 ÷ 10'], '$0.80/ticket'], ['240 km in 3 h', ['240 ÷ 3'], '80 km/h'], ['72 km/h to m/s', ['72 000 ÷ 3600'], '20 m/s']] },
      exit: { qs: ['Write $36 for 4 kg as a rate per kg.', 'A car travels 150 km in 2 h. Find its speed.', 'Convert 60 km/h to metres per minute.'] },
      ans: { we: ['3000 voters/politician', '200 sheep/ha', '$0.80/ticket (or 1.25 tickets/$)', '270 stitches/ball', '80 km/h', '1500 m/min'], a: ['3000 voters/politician', '200 sheep/ha', '$0.80/ticket', '270 stitches/ball', '$15/h', '80 km/h'], b: ['$5/kg', '15 L/min', '90 words/min', '1.2 beats/s', '$0.90/L', '14 km/L'],
        c: ['80 km/h', '5 L/min', '$22/h', '800 km/h', '25 pages/min', '5 m/s'], d: ['1500 m/min', '18 km/h', '30 c/min', '20 m/s (= 72 km/h)'], ext: ['54 km/h', '10.8 m/h'], exit: ['$9/kg', '75 km/h', '1000 m/min'] },
    }),

    lesson({
      code: '12.05', title: 'Best buys',
      li: ['compare prices to find the best buy'],
      sc: ['find the unit price (price per 1 unit or per 100 g)', 'change to the same units before comparing', 'decide the best buy and give a reason'],
      terms: ['Unit price', 'Best buy'],
      we: ['Dog biscuits: 400 g of Woof for $5.20. Find the price per 100 g.', '1 kg of Chow for $11.10. Find the price per 100 g. Which is the better buy?', 'Milk: 1 L of Dairy Farm for $2.85 or 1250 mL of Milky for $3.90. Which is better value?', 'Juice: 2 L for $4.60 or 3 L for $6.60. Which is better value?', 'Why might someone not choose the best buy?', 'Pens: 3 for $4.20 or 5 for $6.50. Which is cheaper per pen?'],
      a: { text: 'Find the unit price (price per 1 item or 1 unit).', kind: 'short', items: ['4 apples for $2.40', '6 eggs for $3.90', '2 kg for $7', '5 L for $8.50', '12 pens for $9', '3 m for $4.20'] },
      b: { text: 'Find the price per 100 g.', kind: 'short', items: ['400 g for $5.20', '1 kg for $11.10', '250 g for $3', '500 g for $4.25', '750 g for $6', '2 kg for $19'] },
      c: { text: 'Which is the better buy? Show working.', kind: 'work', cols: 3, items: ['400 g of Woof for $5.20 or 1 kg of Chow for $11.10', '1 L for $2.85 or 1250 mL for $3.90', '2 L for $4.60 or 3 L for $6.60', '500 g for $3.75 or 800 g for $5.60', '6 rolls for $4.80 or 10 rolls for $7.50', '375 mL for $1.50 or 1.25 L for $4.50'] },
      d: { text: 'Problems.', kind: 'work', items: ['Rice: 1 kg for $2.40, 2 kg for $4.50, 5 kg for $10.50. Which is the best buy?', 'A 600 g jar costs $4.20. A 1 kg jar costs $6.50. How much do you save per 100 g with the bigger jar?', 'Is buying in bulk always the best choice? Explain.', 'Find a best buy at a supermarket (online). Show the unit prices.'] },
      ext: { q: 'A shop has “3 for $10” or $3.60 each. How much do you save buying 6?', steps: ['6 at $3.60 = $21.60', '2 lots of 3 for $10 = $20'], a: '$1.60', qs: ['Shampoo: 400 mL for $6 or 1 L for $13.50. Which is better? By how much per 100 mL?', 'A “buy 2 get 1 free” deal on $4.50 items: find the price per item.'] },
      summary: { steps: ['Find the price for the same amount (per 1 or per 100 g).', 'Change units first (1 kg = 1000 g, 1 L = 1000 mL).', 'The lower unit price is the better buy.', 'Consider waste, storage and need.'],
        worked: [['Woof', ['5.20 ÷ 4'], '$1.30/100 g'], ['Chow', ['11.10 ÷ 10'], '$1.11/100 g: better'], ['Milk', ['$2.85/L vs $3.12/L'], 'Dairy Farm'], ['3 for $10 vs $3.60 each (6)', ['$20 vs $21.60'], 'save $1.60']] },
      exit: { qs: ['Find the price per kg: 3 kg for $12.60.', 'Which is better: 1 L for $3 or 2 L for $5.40?', 'Which is better: 250 g for $2.50 or 1 kg for $9?'] },
      ans: { we: ['$1.30', '$1.11; Chow', 'Dairy Farm ($2.85/L vs $3.12/L)', '3 L ($2.20/L vs $2.30/L)', 'e.g. it may go off or they cannot store it', '5 for $6.50 ($1.30 vs $1.40)'], a: ['$0.60', '$0.65', '$3.50/kg', '$1.70/L', '$0.75', '$1.40/m'], b: ['$1.30', '$1.11', '$1.20', '$0.85', '$0.80', '$0.95'],
        c: ['Chow', '1 L ($2.85/L vs $3.12/L)', '3 L', '800 g ($0.70 vs $0.75 per 100 g)', '10 rolls ($0.75 vs $0.80)', '1.25 L ($3.60/L vs $4/L)'], d: ['5 kg ($2.10/kg)', '5 c per 100 g', 'no: waste, storage, use-by dates', 'own answer'], ext: ['1 L: $1.35 vs $1.50 per 100 mL, 15 c cheaper', '$3.00'], exit: ['$4.20/kg', '2 L ($2.70/L)', '1 kg ($0.90/100 g)'] },
    }),

    lesson({
      code: '12.06', title: 'Rate problems',
      li: ['solve problems using rates'],
      sc: ['multiply a rate by a quantity to find a total', 'divide by a rate to find how many', 'round sensibly'],
      terms: ['Rate', 'Unitary method'],
      we: ['Marie earns $22.45 per hour. How much for 38 hours?', 'Petrol costs $1.79/L. How many litres can you buy for $65 (1 d.p.)?', 'Fertiliser is used at 20 kg/ha. How many hectares does 150 kg cover?', 'A car travels at 80 km/h for 2.5 h. How far does it go?', 'How long does it take to travel 210 km at 70 km/h?', 'A tap drips 12 mL per minute. How many litres in a day?'],
      a: { text: 'Use the rate to find the total.', kind: 'short', items: ['$22.45/h for 38 h', '80 km/h for 2.5 h', '$3.50/kg for 4 kg', '15 L/min for 8 min', '60 words/min for 12 min', '$1.79/L for 40 L'] },
      b: { text: 'Find how many or how long.', kind: 'short', items: ['$65 at $1.79/L (1 d.p.)', '150 kg at 20 kg/ha', '210 km at 70 km/h', '360 pages at 24 pages/min', '$90 at $7.50/h', '1000 L at 40 L/min'] },
      c: { text: 'Solve.', kind: 'work', cols: 3, items: ['A tap drips 12 mL per minute. How many litres per day?', 'A plumber charges $85 call-out plus $95/h. Find the cost for 3.5 h.', 'A cyclist rides at 24 km/h. How far in 45 minutes?', 'Grass seed is spread at 35 g/m². How much for a 12 m by 8 m lawn?', 'A heart beats 72 times a minute. How many beats in a day?', 'A car uses 7.5 L/100 km. How much fuel for 360 km?'] },
      d: { text: 'Harder problems.', kind: 'work', items: ['Two taps fill a tank: one at 20 L/min, the other at 30 L/min. How long to fill 1500 L together?', 'A car uses 8 L/100 km. Petrol is $1.85/L. Find the fuel cost of a 450 km trip.', 'Ann types 45 words/min and Ben 60 words/min. How much longer does Ann take to type 1800 words?', 'Which is faster: 100 m in 12.5 s or 1 km in 2 min 30 s?'] },
      ext: { q: 'A train leaves at 9 a.m. travelling at 90 km/h. A car leaves the same place at 10 a.m. at 120 km/h on the same road. When does the car catch up?', steps: ['At 10 a.m. the train is 90 km ahead', 'The car gains 30 km every hour', '90 ÷ 30 = 3 hours after 10 a.m.'], a: '1 p.m.', qs: ['How far from the start does the car catch up?', 'Two people walk towards each other from 12 km apart at 4 km/h and 2 km/h. When do they meet?'] },
      summary: { steps: ['Total = rate × amount.', 'How many = total ÷ rate.', 'Time = distance ÷ speed.', 'Check units match (h and min, L and mL).'],
        worked: [['$22.45/h × 38 h', ['22.45 × 38'], money(22.45 * 38)], ['$65 ÷ $1.79/L', ['36.31…'], '36.3 L'], ['150 kg ÷ 20 kg/ha', ['7.5'], '7.5 ha'], ['Car catches train', ['90 ÷ 30 = 3 h'], '1 p.m.']] },
      exit: { qs: ['Find the pay for 6 h at $24.50/h.', 'How long to travel 180 km at 60 km/h?', 'How many litres of petrol for $50 at $1.60/L?'] },
      ans: { we: [money(22.45 * 38), `${(65 / 1.79).toFixed(1)} L`, '7.5 ha', '200 km', '3 h', '17.28 L'], a: [money(22.45 * 38), '200 km', '$14', '120 L', '720 words', money(1.79 * 40)], b: [`${(65 / 1.79).toFixed(1)} L`, '7.5 ha', '3 h', '15 min', '12 h', '25 min'],
        c: ['17.28 L', money(85 + 95 * 3.5), '18 km', '3.36 kg', '103 680', '27 L'], d: ['30 min', money(8 * 4.5 * 1.85), '10 min', '100 m in 12.5 s (8 m/s vs 6.67 m/s)'], ext: ['360 km', 'after 2 hours'], exit: ['$147', '3 h', '31.25 L'] },
    }),

    lesson({
      code: '12.07', title: 'Travel graphs',
      li: ['read and interpret travel (distance–time) graphs'],
      sc: ['read distance and time from a travel graph', 'identify stops (flat sections) and the return journey', 'find speed = distance ÷ time for a section'],
      terms: ['Travel graph', 'Speed'],
      we: ['Set A graph: how far did Keith and Kent walk altogether?', 'How many stops did they make?', 'At what time did they start back?', 'Between what times did they walk fastest?', 'Calculate their speed in the last 2 hours.', 'What does a steeper line mean on a travel graph?'],
      a: { text: 'Use the travel graph.', kind: 'short', figSide: true, fig: walk, items: ['Total distance walked?', 'Number of stops?', 'Time they started back?', 'Fastest section?'] },
      b: { text: 'Use the travel graph.', kind: 'short', figSide: true, fig: drive, items: ['How far did Mia drive?', 'How long did she stop?', 'Speed from 8 to 10 a.m.?', 'Speed from 12 to 1 p.m.?'] },
      c: { text: 'Draw a travel graph for the journey.', kind: 'work', items: [{ t: 'Sam walks 4 km in 1 h, rests 30 min, walks 2 km in 30 min, then walks home (6 km) in 1.5 h. Start at 9 a.m.', draw: G.gridPaper('Distance from home (km) against time') }] },
      d: { text: 'Think it through.', kind: 'work', items: ['On a travel graph, what does a horizontal line show?', 'What does a line going down to the time axis show?', 'Write a story for Mia’s car trip in Set B.', 'Mia’s average speed for the whole trip (including the stop)?'] },
      ext: { q: 'Two cyclists leave town A at 8 a.m. One rides at 20 km/h, the other at 25 km/h. How far apart are they at 10:30 a.m.?', steps: ['Time = 2.5 h', 'Distances 50 km and 62.5 km'], a: '12.5 km', qs: ['Draw both cyclists on one travel graph from 8 to 10:30 a.m.', 'When is the faster cyclist 10 km ahead?'] },
      summary: { steps: ['Time is across, distance is up.', 'A flat line means stopped.', 'Steeper line means faster.', 'Speed = change in distance ÷ change in time.'],
        worked: [['Total walked', ['11 km out, 11 km back'], '22 km'], ['Stops', ['Two flat sections'], '2'], ['Last 2 hours', ['8 km ÷ 2 h'], '4 km/h'], ['Cyclists at 10:30', ['62.5 − 50'], '12.5 km']] },
      exit: { qs: ['What does a flat section on a travel graph mean?', 'A graph goes from 0 km at 1 p.m. to 30 km at 3 p.m. Find the speed.', 'In Set A, how far from camp were they at 11 a.m.?'] },
      ans: { we: ['22 km', '2', '3 p.m.', '1 p.m. to 2 p.m.', '4 km/h', 'faster'], a: ['22 km', '2', '3 p.m.', '1 p.m. to 2 p.m. (5 km/h)'], b: ['300 km', '1 hour', '80 km/h', '40 km/h'], c: ['travel graph'],
        d: ['stopped (not moving)', 'returning to the start', 'e.g. drove 160 km, stopped for lunch for 1 h, then drove on', '60 km/h'], ext: ['graph', '10 a.m.'], exit: ['stopped', '15 km/h', '3 km'] },
    }),

    lesson({
      code: '12.08', title: 'Time',
      li: ['round, convert, add and subtract time'],
      sc: ['round time to the nearest hour or minute', 'convert between hours, minutes and seconds', 'add and subtract hours and minutes, carrying 60'],
      terms: ['Minute', 'Second'],
      we: ['Round 9 h 50 min to the nearest hour.', 'Round 3.2 h to the nearest hour. How many minutes is 0.2 h?', 'Convert 316 minutes to hours and minutes.', 'Convert 208 seconds to minutes and seconds.', '6 h 45 min + 3 h 20 min', '2 h 19 min − 1 h 50 min'],
      a: { text: 'Round to the nearest hour.', kind: 'short', items: ['9 h 50 min', '3.2 h', '4 h 12 min 49 s', '7 h 30 min', '1.75 h', '12 h 29 min'] },
      b: { text: 'Convert.', kind: 'short', items: ['316 min to h and min', '208 s to min and s', '2.5 h to min', '3 h 15 min to min', '0.4 h to min', '1 day to min'] },
      c: { text: 'Evaluate.', kind: 'work', cols: 3, items: ['6 h 45 min + 3 h 20 min', '3 h 16 min + 1 h 26 min', '4 h 33 min − 2 h 24 min', '2 h 19 min − 1 h 50 min', '1 h 45 min × 4', '7 h 30 min ÷ 5'] },
      d: { text: 'Problems.', kind: 'work', items: ['A movie starts at 7:35 p.m. and runs for 2 h 18 min. When does it end?', 'Three songs last 3 min 42 s, 4 min 15 s and 2 min 58 s. Find the total time.', 'A runner’s lap times are 1 min 52 s and 2 min 07 s. Find the difference.', 'Convert 2.85 h to hours and minutes.'] },
      ext: { q: 'How many seconds are there in a week?', steps: ['60 × 60 × 24 × 7'], a: '604 800 s', qs: ['About how many hours old are you?', 'Convert 1 000 000 seconds to days, hours, minutes and seconds.'] },
      summary: { steps: ['60 s = 1 min, 60 min = 1 h, 24 h = 1 day.', 'Decimal hours: 0.1 h = 6 min.', 'Add: add minutes, carry 60 min as 1 h.', 'Subtract: borrow 1 h as 60 min.'],
        worked: [['316 min', ['316 ÷ 60 = 5 r 16'], '5 h 16 min'], ['6 h 45 + 3 h 20', ['9 h 65 min'], '10 h 5 min'], ['2 h 19 − 1 h 50', ['1 h 79 − 1 h 50'], '29 min'], ['Seconds in a week', ['60 × 60 × 24 × 7'], '604 800']] },
      exit: { qs: ['Convert 150 min to hours and minutes.', 'Evaluate 2 h 40 min + 1 h 35 min.', 'Evaluate 5 h 10 min − 2 h 45 min.'] },
      ans: { we: ['10 h', '3 h; 12 min', hm(316), '3 min 28 s', hm(405 + 200), hm(139 - 110)], a: ['10 h', '3 h', '4 h', '8 h', '2 h', '12 h'], b: [hm(316), '3 min 28 s', '150 min', '195 min', '24 min', '1440 min'],
        c: [hm(405 + 200), hm(196 + 86), hm(273 - 144), hm(139 - 110), hm(105 * 4), hm(450 / 5)], d: ['9:53 p.m.', '10 min 55 s', '15 s', '2 h 51 min'], ext: ['age × 8760 (approx.)', '11 days 13 h 46 min 40 s'], exit: [hm(150), hm(160 + 95), hm(310 - 165)] },
    }),

    lesson({
      code: '12.09', title: '12-hour and 24-hour time',
      li: ['convert between 12-hour and 24-hour time'],
      sc: ['use a.m. and p.m. correctly', 'write 24-hour time with 4 digits', 'convert midnight and noon times correctly'],
      terms: ['a.m.', 'p.m.', '24-hour time'],
      we: ['Convert 15:50 to 12-hour time.', 'Convert 01:48 to 12-hour time.', 'Convert 12:30 to 12-hour time.', 'Convert 2:10 p.m. to 24-hour time.', 'Convert 12:19 a.m. to 24-hour time.', 'Why do airlines and hospitals use 24-hour time?'],
      a: { text: 'Convert to 12-hour time.', kind: 'short', items: ['01:48', '06:24', '15:50', '12:30', '23:05', '00:40'] },
      b: { text: 'Convert to 24-hour time.', kind: 'short', items: ['2:10 p.m.', '5:33 a.m.', '12:19 a.m.', '1:50 p.m.', '11:45 p.m.', '12:05 p.m.'] },
      c: { text: 'Use the bus timetable.', kind: 'work', figSide: true, fig: bus, items: ['When does the first bus reach the Beach (12-hour time)?', 'How long does the trip from School to Beach take?', 'You must be at the Shops by 4 p.m. Which bus from School?', 'How often do the buses run?'] },
      d: { text: 'Problems.', kind: 'work', items: ['A flight leaves at 22:40 and lands 3 h 35 min later. Write the landing time in 24-hour and 12-hour time.', 'A shift starts at 18:30 and ends at 02:15. How long is it?', 'Write the time 20 minutes before midnight in 24-hour time.', 'Which is later: 7:15 p.m. or 18:45?'] },
      ext: { q: 'A clock shows 09:40. What time will it be 1000 minutes later?', steps: ['1000 min = 16 h 40 min', '09:40 + 16:40 = 26:20 → 02:20 the next day'], a: '02:20 (2:20 a.m.)', qs: ['What time is 500 minutes after 21:15?', 'How many minutes are there from 07:35 to 16:10?'] },
      summary: { steps: ['24-hour time uses 4 digits: 00:00 to 23:59.', 'p.m. times (except 12) add 12 hours.', '12:xx a.m. is 00:xx; 12:xx p.m. is 12:xx.', 'Subtract 12 from 13:00 onwards for p.m.'],
        worked: [['15:50', ['15 − 12 = 3'], t12('15:50')], ['01:48', ['Before 12, a.m.'], t12('01:48')], ['2:10 p.m.', ['2 + 12 = 14'], t24('2:10 p.m.')], ['1000 min after 09:40', ['+ 16 h 40 min'], '02:20']] },
      exit: { qs: ['Convert 17:25 to 12-hour time.', 'Convert 8:05 p.m. to 24-hour time.', 'Convert 12:45 a.m. to 24-hour time.'] },
      ans: { we: [t12('15:50'), t12('01:48'), t12('12:30'), t24('2:10 p.m.'), t24('12:19 a.m.'), 'no confusion between a.m. and p.m.'], a: ['01:48', '06:24', '15:50', '12:30', '23:05', '00:40'].map(t12), b: ['2:10 p.m.', '5:33 a.m.', '12:19 a.m.', '1:50 p.m.', '11:45 p.m.', '12:05 p.m.'].map(t24),
        c: ['3:45 p.m.', '35 min', 'the 15:10 bus (arrives 15:31)', 'every 30 minutes'], d: ['02:15, 2:15 a.m.', '7 h 45 min', '23:40', '7:15 p.m. (19:15)'], ext: ['05:35', '515 min'], exit: [t12('17:25'), t24('8:05 p.m.'), t24('12:45 a.m.')] },
    }),

    lesson({
      code: '12.10', title: 'Time differences',
      li: ['calculate time differences and ages'],
      sc: ['count on from the earlier time to the next hour, then to the later time', 'work across midnight', 'calculate an age in years, months and days'],
      terms: ['Elapsed time', 'Time difference'],
      we: ['Find the time from 5:25 a.m. to 9:45 a.m.', 'Find the time from 11:55 p.m. to 7:30 a.m.', 'Find the time from 07:50 to 14:20.', 'Find the time from 23:45 to 00:15.', 'Samantha was born on 3 June 2004. Find her age on 16 August 2023.', 'How many days from 25 March to 12 April?'],
      a: { text: 'Find the time difference.', kind: 'short', items: ['5:25 a.m. to 9:45 a.m.', '1:15 p.m. to 8:10 p.m.', '07:50 to 14:20', '10:40 a.m. to 1:05 p.m.', '06:15 to 11:50', '9:35 a.m. to 12:00 noon'] },
      b: { text: 'Find the time difference (across midnight).', kind: 'short', items: ['11:55 p.m. to 7:30 a.m.', '23:45 to 00:15', '15:30 to 03:25 (next day)', '10:20 p.m. to 6:05 a.m.', '21:10 to 04:50', '8:30 p.m. to 2:15 a.m.'] },
      c: { text: 'Calculate.', kind: 'work', cols: 3, items: ['Days from 25 March to 12 April', 'Days from 15 January to 1 March (not a leap year)', 'Weeks and days from 1 May to 30 June', 'Samantha: born 3 June 2004. Age on 16 August 2023?', 'Your age in years, months and days today', 'Time from 8:45 a.m. Monday to 3:20 p.m. Tuesday'] },
      d: { text: 'Problems.', kind: 'work', items: ['A flight leaves Sydney at 9:50 p.m. and arrives in Perth at 12:45 a.m. local time. Perth is 2 h behind Sydney. How long is the flight?', 'A baby was born on 28 February 2024. How old is she (in days) on 1 April 2024?', 'Jack is 12 years 7 months old. His sister is 3 years 9 months younger. How old is she?', 'A parking meter charges $3.20 per hour or part hour. Find the cost from 10:35 a.m. to 1:50 p.m.'] },
      ext: { q: 'It is 10:00 a.m. in Sydney. What time is it in London (9 hours behind)?', steps: ['10:00 − 9 h = 1:00'], a: '1:00 a.m.', qs: ['A video call is at 7:00 p.m. in Sydney. What time is it in London?', 'Tokyo is 1 hour behind Sydney. A plane leaves Tokyo at 20:30 local time and takes 9 h 30 min. When does it land (Sydney time)?'] },
      summary: { steps: ['Count on to the next hour.', 'Then count whole hours.', 'Then the extra minutes. Add them up.', 'For ages: years, then months, then days.'],
        worked: [['5:25 to 9:45 a.m.', ['35 min + 3 h + 45 min'], diff('5:25 a.m.', '9:45 a.m.')], ['11:55 p.m. to 7:30 a.m.', ['5 min + 7 h 30 min'], diff('11:55 p.m.', '7:30 a.m.')], ['Samantha’s age', ['3 Jun 2004 → 3 Aug 2023 → 16 Aug'], '19 y 2 m 13 d'], ['10 a.m. Sydney', ['− 9 h'], '1:00 a.m.']] },
      exit: { qs: ['Find the time from 8:20 a.m. to 11:05 a.m.', 'Find the time from 22:30 to 01:10.', 'How many days from 20 May to 4 June?'] },
      ans: { we: [diff('5:25 a.m.', '9:45 a.m.'), diff('11:55 p.m.', '7:30 a.m.'), diff('07:50', '14:20'), diff('23:45', '00:15'), '19 years 2 months 13 days', '18 days'],
        a: [diff('5:25 a.m.', '9:45 a.m.'), diff('1:15 p.m.', '8:10 p.m.'), diff('07:50', '14:20'), diff('10:40 a.m.', '1:05 p.m.'), diff('06:15', '11:50'), diff('9:35 a.m.', '12:00 p.m.')], b: [diff('11:55 p.m.', '7:30 a.m.'), diff('23:45', '00:15'), diff('15:30', '03:25'), diff('10:20 p.m.', '6:05 a.m.'), diff('21:10', '04:50'), diff('8:30 p.m.', '2:15 a.m.')],
        c: ['18 days', '45 days', '8 weeks 4 days', '19 years 2 months 13 days', 'own answer', '1 day 6 h 35 min'], d: ['4 h 55 min', '33 days', '8 years 10 months', '$12.80 (4 part hours)'], ext: ['10:00 a.m.', '07:00 the next day (Sydney)'], exit: [diff('8:20 a.m.', '11:05 a.m.'), diff('22:30', '01:10'), '15 days'] },
    }),

    lesson({
      code: '12.11', title: 'Timetables',
      li: ['read and use timetables'],
      sc: ['read departure and arrival times', 'find travel times by subtracting', 'choose the right service to arrive on time'],
      terms: ['Timetable', 'Departure'],
      we: ['Train timetable (Set A): when does the 7:40 a.m. train reach Picton?', 'How long does the 7:45 p.m. train take to get to Sydney?', 'What is the latest train you can catch at Moss Vale to be in Sydney by 11 a.m.?', 'How long is the trip from Bowral to Campbelltown on the 9:10 a.m. train?', 'Bus timetable (Set C): how long from Library to Beach?', 'Why are timetables often written in 24-hour time?'],
      a: { text: 'Use the train timetable.', kind: 'short', figSide: true, fig: tt, items: ['When does the 6:05 a.m. train reach Sydney?', 'How long does it take?', 'When does the 9:10 a.m. train leave Mittagong?', 'How long from Picton to Sydney?'] },
      b: { text: 'Use the train timetable in Set A.', kind: 'short', items: ['When does the 7:40 a.m. train reach Picton?', 'How long does the 7:45 p.m. train take to reach Sydney?', 'Latest train from Moss Vale to be in Sydney by 11 a.m.?', 'Bowral to Campbelltown on the 9:10 a.m. train?', 'Write the 7:45 p.m. arrival in 24-hour time.', 'How long between the first and second trains?'] },
      c: { text: 'Use the bus timetable.', kind: 'work', figSide: true, fig: bus, items: ['How long does it take from Library to Beach?', 'You arrive at the Library at 15:50. When is the next bus? When will you reach the Beach?', 'You need to be at the Shops by 4:30 p.m. What is the latest bus from School?', 'Write the times for the 16:10 bus in 12-hour time.'] },
      d: { text: 'Make your own timetable.', kind: 'work', items: [{ t: 'A ferry leaves the wharf every 40 minutes from 06:50 until 09:30. The trip takes 25 minutes. Write a timetable showing departure and arrival times.', draw: `<div class="template-card"><table class="data-table" style="width:100%"><tr><th>Departs</th><th>Arrives</th></tr>${'<tr><td style="height:7mm"></td><td></td></tr>'.repeat(5)}</table></div>` }, 'Your school day as a timetable: list the start and end of each period in 24-hour time.'] },
      ext: { q: 'You live 10 minutes’ walk from Bowral station. You must be in Sydney by 10:15 a.m. What time must you leave home?', steps: ['The 7:40 a.m. train arrives at 9:56 a.m.', 'It leaves Bowral at 7:47 a.m.', 'Leave home 10 min earlier'], a: '7:37 a.m. (or earlier)', qs: ['Your friend at Picton wants to meet you on the same train. Which time does she board?', 'The 7:40 a.m. train is running 12 minutes late. When will it reach Sydney?'] },
      summary: { steps: ['Find the row for the station and the column for the service.', 'Read across or down carefully.', 'Travel time = arrival − departure.', 'Choose the service that arrives before you need to be there.'],
        worked: [['7:45 p.m. to Sydney', ['7:45 p.m. → 10:01 p.m.'], '2 h 16 min'], ['In Sydney by 11 a.m.', ['9:10 arrives 11:26 (too late)'], '7:40 a.m.'], ['Library to Beach', ['15:18 → 15:45'], '27 min'], ['Leave home for Bowral', ['7:47 − 10 min'], '7:37 a.m.']] },
      exit: { qs: ['When does the 9:10 a.m. train reach Campbelltown?', 'How long is the bus trip from School to Shops?', 'Which train should you catch from Moss Vale to reach Sydney before 9 a.m.?'] },
      ans: { we: ['8:33 a.m.', '2 h 16 min', '7:40 a.m.', diff('09:17', '10:30'), '27 min', 'no confusion between a.m. and p.m.'], a: ['8:21 a.m.', '2 h 16 min', '9:25 a.m.', '1 h 23 min'], b: ['8:33 a.m.', '2 h 16 min', '7:40 a.m.', diff('09:17', '10:30'), '22:01', '1 h 35 min'],
        c: ['27 min', '16:18, reaching the Beach at 16:45', 'the 15:40 bus (Shops 16:01); the 16:10 bus reaches the Shops at 16:31, too late', '4:10, 4:18, 4:31, 4:45 p.m.'], d: ['06:50→07:15, 07:30→07:55, 08:10→08:35, 08:50→09:15, 09:30→09:55', 'own timetable'], ext: ['8:33 a.m.', '10:08 a.m.'], exit: ['10:30 a.m.', '21 min', 'the 6:05 a.m. train'] },
    }),
  ],
};
