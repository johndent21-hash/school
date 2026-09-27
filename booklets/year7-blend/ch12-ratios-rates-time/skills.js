// Skill drill pages for Chapter 12 Ratios, rates and time: page 1 practises the Easy basics, page 2 the Medium basics (lib/drill.js).
const G = require('../../lib/graphs');
const { gcd, fmt } = require('../../lib/calc');

const ratio = (...xs) => { const g = xs.reduce((a, b) => gcd(a, b)); return xs.map((x) => x / g).join(' : '); };
const money = (x) => `$${(Math.round(x * 100) / 100).toFixed(2)}`;
const hm = (m) => `${Math.floor(m / 60)} h ${m % 60} min`.replace(/^0 h /, '').replace(/ 0 min$/, '');
const t24 = (m) => { m = ((m % 1440) + 1440) % 1440; return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; };
const t12 = (m) => { m = ((m % 1440) + 1440) % 1440; const h = Math.floor(m / 60), mm = String(m % 60).padStart(2, '0'); return `${h % 12 === 0 ? 12 : h % 12}:${mm} ${h < 12 ? 'a.m.' : 'p.m.'}`; };
const COL = ['red', 'blue', 'green', 'yellow'];

module.exports = {
  '12.01': ({ round, ri, pick }) => ({
    easy: [
      round('write the ratio (do not simplify).', 24, () => { const a = ri(1, 15), b = ri(1, 15), [c1, c2] = [pick(COL), pick(COL)]; if (c1 === c2) return ['', '']; const k = ri(0, 2); return [`${a} ${c1}, ${b} ${c2}: ${[`${c1} to ${c2}`, `${c2} to ${c1}`, `${c1} to all`][k]}`, [`${a} : ${b}`, `${b} : ${a}`, `${a} : ${a + b}`][k]]; }, { cols: 3 }),
      round('write the ratio in simplest form.', 16, () => { const a = ri(1, 9), b = ri(1, 9), k = ri(2, 6); return [`${a * k} girls to ${b * k} boys`, ratio(a, b)]; }),
    ],
    medium: [
      round('change to the same unit, then write the ratio in simplest form.', 15, () => { const [u, v, f] = pick([['cm', 'm', 100], ['min', 'h', 60], ['g', 'kg', 1000], ['c', '$', 100], ['mm', 'cm', 10]]); const a = ri(1, 9) * pick([5, 10, 20]), b = ri(1, 5); return a === b * f ? ['', ''] : [`${a} ${u} to ${b} ${v}`, ratio(a, b * f)]; }, { cols: 3 }),
      round('write the ratio of all three in simplest form.', 12, () => { const k = ri(2, 5), a = ri(1, 6) * k, b = ri(1, 6) * k, c = ri(1, 6) * k; return [`${a} red, ${b} blue, ${c} green`, ratio(a, b, c)]; }, { cols: 3 }),
    ],
  }),
  '12.02': ({ round, ri }) => ({
    easy: [
      round('simplify the ratio.', 24, () => { const a = ri(1, 12), b = ri(1, 12), k = ri(2, 9); return gcd(a, b) > 1 ? ['', ''] : [`${a * k} : ${b * k}`, `${a} : ${b}`]; }),
      round('find the missing number.', 16, () => { const a = ri(1, 9), b = ri(1, 9), k = ri(2, 9); return ri(0, 1) ? [`${a} : ${b} = ☐ : ${b * k}`, a * k] : [`${a} : ${b} = ${a * k} : ☐`, b * k]; }),
    ],
    medium: [
      round('simplify. Change decimals or fractions to whole numbers first.', 16, () => { const a = ri(1, 9), b = ri(1, 9); return a === b ? ['', ''] : [`${fmt(a / 10)} : ${fmt(b / 10)}`, ratio(a, b)]; }),
      round('simplify the three-part ratio.', 15, () => { const k = ri(2, 8), a = ri(1, 7), b = ri(1, 7), c = ri(1, 7); return gcd(gcd(a, b), c) > 1 ? ['', ''] : [`${a * k} : ${b * k} : ${c * k}`, `${a} : ${b} : ${c}`]; }, { cols: 3 }),
    ],
  }),
  '12.03': ({ round, ri, pick }) => ({
    easy: [
      round('share the amount in the ratio given.', 24, () => { const a = ri(1, 5), b = ri(1, 5), k = ri(2, 20); return [`$${(a + b) * k} in ${a} : ${b}`, `$${a * k} and $${b * k}`]; }, { cols: 3 }),
      round('the ratio and one amount are given. Find the other.', 12, () => { const a = ri(1, 6), b = ri(1, 6), k = ri(2, 9); return a === b ? ['', ''] : [`boys : girls = ${a} : ${b}. There are ${a * k} boys. How many girls?`, b * k]; }, { cols: 2 }),
    ],
    medium: [
      round('share the quantity in the ratio given.', 15, () => { const a = ri(1, 5), b = ri(1, 5), c = ri(1, 3), k = ri(2, 12), u = pick(['kg', 'L', 'm']); return [`${(a + b + c) * k} ${u} in ${a} : ${b} : ${c}`, `${a * k} ${u}, ${b * k} ${u}, ${c * k} ${u}`]; }, { cols: 3 }),
      round('the difference between the two shares is given. Find each share.', 10, () => { const a = ri(1, 4), b = a + ri(1, 4), k = ri(2, 15); return [`ratio ${a} : ${b}; the larger share is $${(b - a) * k} more`, `$${a * k} and $${b * k}`]; }, { cols: 2 }),
    ],
  }),
  '12.04': ({ round, list, ri, pick }) => ({
    easy: [
      round('write as a rate for one unit.', 24, () => { const [q, u, per] = pick([['km', 'km', 'h'], ['$', '$', 'kg'], ['L', 'L', 'min'], ['words', 'words', 'min'], ['m', 'm', 's'], ['beats', 'beats', 'min']]), n = ri(2, 9), r = ri(2, 60); return [`${q === '$' ? '$' + n * r : n * r + ' ' + q} in ${n} ${per}`, `${q === '$' ? '$' + r : r + ' ' + u}/${per}`]; }, { cols: 3 }),
      list('what unit would you use for each rate?', [['speed of a car', 'km/h'], ['price of apples', '$/kg'], ['heart rate', 'beats/min'], ['typing speed', 'words/min'], ['water from a tap', 'L/min'], ['petrol price', 'c/L'], ['wage', '$/h'], ['rainfall', 'mm/day'],
        ['phone data', 'GB/month'], ['running speed', 'm/s'], ['fuel use', 'L/100 km'], ['growth of a plant', 'cm/week']], { cols: 3 }),
    ],
    medium: [
      round('convert the rate.', 12, () => { const k = ri(0, 2), a = pick([60, 90, 120, 30, 6, 18, 36]); return [[`${a} km/h to km/min`, `${a} km/min to km/h`, `$${a}/kg to c/g`][k], [`${fmt(a / 60, 3)} km/min`, `${a * 60} km/h`, `${fmt(a / 10, 2)} c/g`][k]]; }, { cols: 3 }),
      round('which rate is faster (or cheaper)? Change both to the same unit.', 12, () => { const a = ri(30, 90), b = ri(2, 5), c = ri(100, 400); return a * b === c ? ['', ''] : [`A: ${a} km/h, B: ${c} km in ${b} h`, `${a > c / b ? 'A' : 'B'} (${a} and ${fmt(c / b, 1)} km/h)`]; }, { cols: 2 }),
    ],
  }),
  '12.05': ({ round, ri, pick }) => ({
    easy: [
      round('find the unit price (the cost of one).', 24, () => { const n = ri(2, 12), u = ri(50, 900) / 100; return [`${n} for ${money(n * u)}`, money(u)]; }, { cols: 3 }),
      round('which is the better buy? Find the price of 1 of each.', 12, () => { const a = ri(2, 6), b = ri(2, 6), p = ri(100, 400) / 100, q = ri(100, 400) / 100; if (a === b || Math.abs(p - q) < 0.05) return ['', '']; return [`${a} for ${money(a * p)} or ${b} for ${money(b * q)}`, p < q ? `${a} for ${money(a * p)}` : `${b} for ${money(b * q)}`]; }, { cols: 2 }),
    ],
    medium: [
      round('which is the better buy? Find the price per 100 g (or per 100 mL).', 12, () => { const [s1, s2] = pick([[250, 500], [200, 500], [300, 1000], [400, 1000], [150, 600], [375, 750]]), p1 = ri(150, 600) / 100, p2 = ri(300, 1200) / 100; if (Math.abs(p1 / s1 - p2 / s2) < 1e-4) return ['', '']; return [`${s1} g for ${money(p1)} or ${s2} g for ${money(p2)}`, `${p1 / s1 < p2 / s2 ? `${s1} g` : `${s2} g`} (${money((p1 / s1) * 100)} and ${money((p2 / s2) * 100)} per 100 g)`]; }, { cols: 2 }),
      round('find the cost.', 15, () => { const u = ri(100, 1500) / 100, n = pick([3, 4, 5, 2.5, 1.5, 0.5, 6, 10]); return [`${fmt(n)} kg at ${money(u)}/kg`, money(n * u)]; }, { cols: 3 }),
    ],
  }),
  '12.06': ({ round, ri, pick }) => ({
    easy: [
      round('use the rate to find the total.', 24, () => { const k = ri(0, 2), r = ri(2, 25), n = ri(2, 12); return [[`${n} kg at $${r}/kg`, `${n} h at ${r * 5} km/h`, `${n} h at $${r}/h`][k], [`$${r * n}`, `${r * 5 * n} km`, `$${r * n}`][k]]; }, { cols: 3 }),
      round('find the time taken: time = distance ÷ speed.', 16, () => { const s = pick([40, 50, 60, 80, 100]), t = ri(1, 6); return [`${s * t} km at ${s} km/h`, `${t} h`]; }),
    ],
    medium: [
      round('find the distance: distance = speed × time.', 15, () => { const s = pick([40, 60, 80, 90, 100, 120]), m = pick([15, 30, 45, 90, 150]); return [`${s} km/h for ${hm(m)}`, `${fmt((s * m) / 60)} km`]; }, { cols: 3 }),
      round('two steps. Show your working.', 9, () => { const w = ri(15, 30), h = ri(3, 8), d = ri(2, 5); return [`Mia earns $${w}/h. She works ${h} h a day for ${d} days. How much does she earn?`, `$${w * h * d}`]; }, { cols: 3, work: true }),
    ],
  }),
  '12.07': ({ round, ri, pick }) => {
    const graph = (legs, title) => { let d = 0; const ys = [0, ...legs.map((x) => (d += x))]; return { ys, fig: G.lineGraph({ title, xs: ys.map((_, i) => `${i}`), ys, max: Math.ceil(Math.max(...ys) / 20) * 20, step: 10, labelEvery: 20, yTitle: 'Distance (km)', xTitle: 'Time (hours)', w: 88, h: 56 }) }; };
    const A = graph([pick([40, 60]), pick([20, 40]), 0, pick([40, 60]), 20], 'A car trip'), B = graph([pick([20, 30]), 0, pick([30, 40]), pick([10, 20]), 0, 30], 'A bike ride');
    const Q = (g) => { const y = g.ys; const legs = y.slice(1).map((v, i) => v - y[i]); const stop = legs.findIndex((x) => x === 0); const fast = legs.indexOf(Math.max(...legs));
      return [['How far was travelled in the first hour?', `${legs[0]} km`], ['What was the total distance?', `${y[y.length - 1]} km`], ['How long did the whole trip take?', `${y.length - 1} h`], [`When did the traveller stop?`, `from ${stop} h to ${stop + 1} h`],
        ['In which hour was the speed greatest?', `hour ${fast + 1} (${legs[fast]} km/h)`], ['What was the average speed for the whole trip?', `${fmt(y[y.length - 1] / (y.length - 1), 1)} km/h`]]; };
    return {
      easy: [
        round('find the speed: speed = distance ÷ time.', 21, () => { const s = pick([10, 15, 20, 40, 45, 60, 80, 90, 100]), t = ri(2, 6); return [`${s * t} km in ${t} h`, `${s} km/h`]; }, { cols: 3 }),
        { text: 'use the travel graph.', items: Q(A).map((x) => x[0]), ans: Q(A).map((x) => x[1]), cols: 2, fig: A.fig },
      ],
      medium: [
        round('find the missing value: d = s × t, s = d ÷ t, t = d ÷ s.', 15, () => { const s = pick([20, 40, 50, 60, 80]), t = ri(2, 5), k = ri(0, 2); return [[`s = ${s} km/h, t = ${t} h, d = ?`, `d = ${s * t} km, t = ${t} h, s = ?`, `d = ${s * t} km, s = ${s} km/h, t = ?`][k], [`${s * t} km`, `${s} km/h`, `${t} h`][k]]; }, { cols: 3 }),
        { text: 'use the travel graph.', items: Q(B).map((x) => x[0]), ans: Q(B).map((x) => x[1]), cols: 2, fig: B.fig },
      ],
    };
  },
  '12.08': ({ round, ri, pick }) => ({
    easy: [
      round('convert. 1 h = 60 min, 1 min = 60 s.', 24, () => { const k = ri(0, 3), x = ri(2, 9), e = ri(1, 5) * 10; return [[`${x} h to min`, `${x * 60} min to h`, `${x} min to s`, `${x * 60 + e} min to h and min`][k], [`${x * 60} min`, `${x} h`, `${x * 60} s`, hm(x * 60 + e)][k]]; }, { cols: 3 }),
      round('add the times.', 12, () => { const a = ri(20, 200), b = ri(20, 200); return [`${hm(a)} + ${hm(b)}`, hm(a + b)]; }, { cols: 3 }),
    ],
    medium: [
      round('subtract the times.', 12, () => { const a = ri(100, 400), b = ri(20, a - 10); return [`${hm(a)} − ${hm(b)}`, hm(a - b)]; }, { cols: 3 }),
      round('change decimal hours to hours and minutes, or back.', 16, () => { const h = ri(1, 6), q = pick([0.25, 0.5, 0.75, 0.1, 0.2, 0.4]); return ri(0, 1) ? [`${fmt(h + q)} h`, hm(Math.round((h + q) * 60))] : [hm(Math.round((h + q) * 60)), `${fmt(h + q)} h`]; }),
    ],
  }),
  '12.09': ({ round, ri }) => ({
    easy: [
      round('write in 24-hour time.', 24, () => { const m = ri(0, 287) * 5; return [t12(m), t24(m)]; }),
      round('write in 12-hour time (a.m. or p.m.).', 16, () => { const m = ri(0, 287) * 5; return [t24(m), t12(m)]; }),
    ],
    medium: [
      round('convert. Take care near midnight and midday.', 16, () => { const m = [ri(0, 11) * 5, 720 + ri(0, 11) * 5, 1380 + ri(0, 11) * 5, 660 + ri(0, 11) * 5][ri(0, 3)]; return ri(0, 1) ? [t12(m), t24(m)] : [t24(m), t12(m)]; }),
      round('what is the time after the minutes given? Use 24-hour time.', 15, () => { const m = ri(0, 287) * 5, d = ri(2, 30) * 5; return [`${d} min after ${t24(m)}`, t24(m + d)]; }, { cols: 3 }),
    ],
  }),
  '12.10': ({ round, ri, pick }) => ({
    easy: [
      round('find the time difference.', 18, () => { const a = ri(84, 160) * 5, b = a + ri(4, 100) * 5; return b >= 1440 ? ['', ''] : [`${t12(a)} to ${t12(b)}`, hm(b - a)]; }, { cols: 3 }),
      round('find the time difference (24-hour time).', 15, () => { const a = ri(0, 250) * 5, b = a + ri(4, 70) * 5; return b >= 1440 ? ['', ''] : [`${t24(a)} to ${t24(b)}`, hm(b - a)]; }, { cols: 3 }),
    ],
    medium: [
      round('find the time difference. It goes past midnight.', 12, () => { const a = ri(252, 287) * 5, b = ri(1, 60) * 5; return [`${t24(a)} to ${t24(b)}`, hm(1440 - a + b)]; }, { cols: 3 }),
      round('time zones: Sydney is 2 hours ahead of Perth. Find the time.', 12, () => { const m = ri(84, 240) * 5; return ri(0, 1) ? [`${t12(m)} in Sydney. Perth?`, t12(m - 120)] : [`${t12(m)} in Perth. Sydney?`, t12(m + 120)]; }, { cols: 3 }),
    ],
  }),
  '12.11': ({ round, ri }) => {
    const stops = ['School', 'Library', 'Pool', 'Shops', 'Beach'], gaps = [0, 7, 12, 9, 14];
    const starts = [ri(96, 100) * 5, ri(102, 106) * 5, ri(108, 112) * 5, ri(114, 118) * 5];
    const time = (s, k) => starts[s] + gaps.slice(0, k + 1).reduce((a, b) => a + b, 0);
    const fig = G.table(['Stop', 'Bus 1', 'Bus 2', 'Bus 3', 'Bus 4'], stops.map((st, k) => [`<b>${st}</b>`, ...starts.map((_, s) => t24(time(s, k)))]));
    const reads = [];
    [[0, 2], [1, 3], [2, 4], [3, 1]].forEach(([b, k]) => reads.push([`When does Bus ${b + 1} reach the ${stops[k]}?`, t24(time(b, k))]));
    const trips = [[0, 4], [1, 3], [2, 4], [0, 2], [3, 3], [1, 4]].map(([a, b], s) => [`How long from ${stops[a]} to ${stops[b]}?`, hm(time(s % 4, b) - time(s % 4, a))]);
    return {
      easy: [
        { text: 'use the bus timetable.', items: [...reads, ...trips.slice(0, 4)].map((x) => x[0]), ans: [...reads, ...trips.slice(0, 4)].map((x) => x[1]), cols: 2, fig },
        round('how long is each trip?', 16, () => { const a = ri(84, 200) * 5, d = ri(3, 40) * 5; return [`${t24(a)} → ${t24(a + d)}`, hm(d)]; }),
      ],
      medium: [
        { text: 'use the bus timetable.', items: [`You must be at the Beach by ${t24(time(2, 4) + 5)}. Which is the latest bus from School?`, `You reach the Library at ${t24(time(1, 1) + 2)}. When is the next bus?`, 'Which bus takes the longest from School to Beach?', `How long do you wait at the Pool if you arrive at ${t24(time(1, 2) - 4)}?`, `Write Bus 4's time at the Shops in 12-hour time.`, 'How long is the whole route?'],
          ans: ['Bus 3', `${t24(time(2, 1))} (Bus 3)`, 'they all take the same time', '4 min', t12(time(3, 3)), hm(gaps.reduce((a, b) => a + b, 0))], cols: 2, fig },
        round('how long is each trip? It goes past the hour.', 15, () => { const a = ri(7, 17) * 60 + ri(8, 11) * 5, d = ri(4, 30) * 5; return [`${t12(a)} → ${t12(a + d)}`, hm(d)]; }, { cols: 3 }),
      ],
    };
  },
};
