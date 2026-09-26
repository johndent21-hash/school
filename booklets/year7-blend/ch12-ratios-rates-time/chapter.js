// Blended booklet, Chapter 12 Ratios, rates and time. Four pages a lesson; six for travel graphs and timetables.
const blend = require('../../lib/blend');
const { gcd } = require('../../lib/calc');

const base = require('../../year7/ch12-ratios-rates-time/chapter.js');
const sp = (code) => base.lessons.find((f) => f.spec.code === code).spec;
const D = (text, pairs, hw, cols = 3) => ({ text, cols, items: pairs.map((p) => p[0]), ans: pairs.map((p) => p[1]), hw });
const rat = (...xs) => { const g = xs.reduce((a, b) => gcd(a, b)); return xs.map((x) => x / g).join(' : '); };
const s11 = sp('12.11');

module.exports = blend(base, {
  fileName: 'Year7-Ch12-Ratios-rates-and-time-Lessons', pages: 4,
  more: {
    '12.01': { stems: ['Write the ratio of shaded to unshaded parts.', 'Write each ratio in the order the words give.', 'Write the ratio, then explain.'],
      drill: D('Quick drill: 8 red and 5 blue marbles. Write the ratio of:', [['red to blue', '8 : 5'], ['blue to red', '5 : 8'], ['red to all', '8 : 13'], ['blue to all', '5 : 13']], ['all to red', '13 : 8', 'A bag has 8 red and 5 blue marbles. Write the ratio.'], 2) },
    '12.02': { stems: ['Complete each pair of equivalent ratios.', 'Simplify each ratio.', 'Change to the same units, then simplify.'],
      drill: D('Quick drill: simplify.', [['4 : 6', rat(4, 6)], ['10 : 15', rat(10, 15)], ['8 : 32', rat(8, 32)], ['21 : 14', rat(21, 14)], ['12 : 18 : 30', rat(12, 18, 30)], ['45 : 60', rat(45, 60)]], ['16 : 24', rat(16, 24), 'Simplify the ratio.'], 3) },
    '12.03': { stems: ['Use the ratio to find the unknown amount.', 'Share the amount in the ratio.', 'Solve the ratio problem.'],
      drill: D('Quick drill: share $60 in each ratio.', [['1 : 1', '$30, $30'], ['1 : 2', '$20, $40'], ['1 : 3', '$15, $45'], ['2 : 3', '$24, $36'], ['1 : 5', '$10, $50'], ['7 : 5', '$35, $25']], ['1 : 4', '$12, $48', 'Share $60 in the ratio.'], 3) },
    '12.04': { stems: ['Write each as a rate in simplest form.', 'Write each as a rate in simplest form.', 'Find the speed, then convert the rate.'],
      drill: D('Quick drill: write as a rate per 1 unit.', [['$20 for 4 kg', '$5/kg'], ['300 km in 5 h', '60 km/h'], ['45 L in 9 min', '5 L/min'], ['$36 for 3 h', '$12/h'], ['120 words in 2 min', '60 words/min'], ['$8 for 10 pens', '$0.80/pen']], ['500 m in 100 s', '5 m/s', 'Write as a rate per 1 unit.'], 3) },
    '12.05': { stems: ['Find the price per 100 g, then choose the better buy.', 'Which is the better buy?', 'Which is the better buy? Explain.'],
      drill: D('Quick drill: find the unit price.', [['4 for $6', '$1.50'], ['2 kg for $9', '$4.50/kg'], ['5 L for $12', '$2.40/L'], ['10 for $4.50', '$0.45'], ['3 m for $7.50', '$2.50/m'], ['6 for $9.60', '$1.60']], ['8 for $10', '$1.25', 'Find the unit price.'], 3) },
    '12.06': { stems: ['Use the rate to find the total.', 'Use the rate to find how many.', 'Use the rate to find the time or distance.'],
      drill: D('Quick drill: use the rate.', [['$15/h for 4 h', '$60'], ['60 km/h for 3 h', '180 km'], ['$2/kg for 7 kg', '$14'], ['10 L/min for 6 min', '60 L'], ['$12 at $3/kg (kg?)', '4 kg'], ['200 km at 50 km/h (h?)', '4 h']], ['$1.50/L for 20 L', '$30', 'Use the rate.'], 3) },
    '12.07': { pages: 6, exFigs: [sp('12.07').a.fig, sp('12.07').a.fig, sp('12.07').a.fig], stems: ['Use the travel graph.', 'Use the travel graph.', 'Use the travel graph, then explain.'],
      drill: D('Quick drill: find the speed.', [['60 km in 2 h', '30 km/h'], ['12 km in 3 h', '4 km/h'], ['150 km in 1.5 h', '100 km/h'], ['5 km in 30 min', '10 km/h'], ['0 km in 1 h', '0 km/h (stopped)'], ['240 km in 4 h', '60 km/h']], ['90 km in 2 h', '45 km/h', 'Find the speed.'], 3) },
    '12.08': { stems: ['Round, then convert.', 'Convert.', 'Add and subtract times.'],
      drill: D('Quick drill: convert.', [['2 h to min', '120 min'], ['90 min to h and min', '1 h 30 min'], ['3 min to s', '180 s'], ['150 s to min and s', '2 min 30 s'], ['0.5 h to min', '30 min'], ['1 day to h', '24 h']], ['200 min to h and min', '3 h 20 min', 'Convert.'], 3) },
    '12.09': { stems: ['Convert to 12-hour time.', 'Convert between 12-hour and 24-hour time.', 'Convert, then explain.'],
      drill: D('Quick drill: convert.', [['14:30 to 12-hour', '2:30 p.m.'], ['09:15 to 12-hour', '9:15 a.m.'], ['00:20 to 12-hour', '12:20 a.m.'], ['7:45 p.m. to 24-hour', '19:45'], ['11:05 a.m. to 24-hour', '11:05'], ['12:10 a.m. to 24-hour', '00:10']], ['6:25 p.m. to 24-hour', '18:25', 'Convert.'], 3) },
    '12.10': { stems: ['Find the time difference.', 'Find the time difference across midnight.', 'Find the age or the number of days.'],
      drill: D('Quick drill: find the time difference.', [['2:00 p.m. to 5:30 p.m.', '3 h 30 min'], ['8:45 a.m. to 10:00 a.m.', '1 h 15 min'], ['09:20 to 13:05', '3 h 45 min'], ['11:30 a.m. to 2:10 p.m.', '2 h 40 min'], ['22:00 to 01:00', '3 h'], ['6:15 a.m. to 6:50 a.m.', '35 min']], ['10:40 a.m. to 3:15 p.m.', '4 h 35 min', 'Find the time difference.'], 3) },
    '12.11': { pages: 6, exFigs: [s11.a.fig, s11.a.fig, s11.a.fig], stems: ['Use the train timetable.', 'Use the train timetable.', 'Use the train timetable, then explain.'],
      we: ['When does the 7:40 a.m. train reach Picton?', ...s11.we.slice(1, 4), 'Which train arrives in Sydney closest to 10 a.m.?', s11.we[5]],
      ans: { ...s11.ans, we: [...s11.ans.we.slice(0, 4), 'the 7:40 a.m. train (arrives 9:56 a.m.)', s11.ans.we[5]] },
      drill: D('Quick drill: how long is each trip?', [['8:10 → 8:55', '45 min'], ['9:40 → 11:05', '1 h 25 min'], ['13:15 → 14:50', '1 h 35 min'], ['6:05 → 8:21', '2 h 16 min'], ['15:45 → 16:20', '35 min'], ['7:52 → 10:01', '2 h 9 min']], ['10:35 → 12:10', '1 h 35 min', 'How long is the trip?'], 3) },
  },
});
