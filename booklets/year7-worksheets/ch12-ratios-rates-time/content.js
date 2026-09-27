// Worksheet questions for Chapter 12 Ratios, rates and time (lib/worksheet.js). See ../ch01-integers/content.js.
const G = require('../../lib/graphs');
const { gcd, fmt } = require('../../lib/calc');

const ratio = (...xs) => { const g = xs.reduce((a, b) => gcd(a, b)); return xs.map((x) => x / g).join(' : '); };
const money = (x) => `$${(Math.round(x * 100) / 100).toFixed(2)}`;
const hm = (m) => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ''}` : `${m} min`);
const t24 = (m) => { m = ((m % 1440) + 1440) % 1440; return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; };
const t12 = (m) => { m = ((m % 1440) + 1440) % 1440; const h = Math.floor(m / 60); return `${h % 12 === 0 ? 12 : h % 12}:${String(m % 60).padStart(2, '0')} ${h < 12 ? 'a.m.' : 'p.m.'}`; };
const COL = ['red', 'blue', 'green', 'yellow'];

module.exports = {
  '12.01': ({ ri, pick }) => [
    [{ text: 'Write the ratio in the order asked. Do not simplify.', gen: () => { const a = ri(1, 15), b = ri(1, 15), c1 = pick(COL); let c2; do c2 = pick(COL); while (c2 === c1); const k = ri(0, 2); return { q: `${a} ${c1}, ${b} ${c2}: ${[`${c1} to ${c2}`, `${c2} to ${c1}`, `${c1} to all`][k]}`, a: [`${a} : ${b}`, `${b} : ${a}`, `${a} : ${a + b}`][k] }; } }],
    [{ text: 'Write the ratio, then simplify it: divide both parts by the HCF.', gen: () => { const a = ri(1, 9), b = ri(1, 9), k = ri(2, 6); if (a === b) return { q: '' }; return { q: `${a * k} girls to ${b * k} boys`, a: ratio(a, b), lines: [`${a * k} : ${b * k}`, `÷ ${gcd(a * k, b * k)}: ${ratio(a, b)}`] }; } }],
    [{ text: 'Change to the same unit first, then write the ratio in simplest form.', gen: () => { const [u, v, f] = pick([['cm', 'm', 100], ['min', 'h', 60], ['g', 'kg', 1000], ['c', '$', 100]]); const a = ri(1, 9) * pick([5, 10, 20]), b = ri(1, 4); if (a === b * f) return { q: '' }; const A = u === 'c' ? `${a}c` : `${a} ${u}`, B = v === '$' ? `$${b}` : `${b} ${v}`; return { q: `${A} to ${B}`, a: ratio(a, b * f), lines: [`${B} = ${b * f} ${u === 'c' ? 'c' : u}`, `${a} : ${b * f}`, `= ${ratio(a, b * f)}`] }; } }],
  ],
  '12.02': ({ ri }) => [
    [{ text: 'Simplify the ratio: divide both parts by the highest common factor.', gen: () => { const a = ri(1, 12), b = ri(1, 12), k = ri(2, 9); return gcd(a, b) > 1 ? { q: '' } : { q: `${a * k} : ${b * k}`, a: `${a} : ${b}` }; } }],
    [{ text: 'Find the missing number. What was each part multiplied by?', gen: () => { const a = ri(1, 9), b = ri(1, 9), k = ri(2, 9); return ri(0, 1) ? { q: `${a} : ${b} = ☐ : ${b * k}`, a: String(a * k), lines: [`${b} × ${k} = ${b * k}`, `☐ = ${a} × ${k} = ${a * k}`] } : { q: `${a} : ${b} = ${a * k} : ☐`, a: String(b * k), lines: [`${a} × ${k} = ${a * k}`, `☐ = ${b} × ${k} = ${b * k}`] }; } }],
    [{ text: 'Simplify. Make whole numbers first (× 10), then divide by the HCF.', gen: () => { const a = ri(1, 9), b = ri(1, 9), c = ri(1, 9); if (a === b) return { q: '' }; return ri(0, 1) ? { q: `${fmt(a / 10)} : ${fmt(b / 10)}`, a: ratio(a, b), lines: [`× 10: ${a} : ${b}`, `= ${ratio(a, b)}`] } : { q: `${a * 4} : ${b * 4} : ${c * 4}`, a: ratio(a * 4, b * 4, c * 4), lines: [`HCF = ${gcd(gcd(a * 4, b * 4), c * 4)}`, `= ${ratio(a * 4, b * 4, c * 4)}`] }; } }],
  ],
  '12.03': ({ ri, pick }) => [
    [{ text: 'Share the amount in the ratio. Add the parts, find one part, then multiply.', gen: () => { const a = ri(1, 5), b = ri(1, 5), k = ri(2, 20); return { q: `$${(a + b) * k} in ${a} : ${b}`, a: `$${a * k}, $${b * k}` }; } }],
    [{ text: 'Share in the ratio. Show the total parts and one part.', gen: () => { const a = ri(1, 5), b = ri(1, 5), k = ri(2, 20); return { q: `$${(a + b) * k} in the ratio ${a} : ${b}`, a: `$${a * k} and $${b * k}`, lines: [`parts: ${a} + ${b} = ${a + b}`, `one part: ${(a + b) * k} ÷ ${a + b} = ${k}`, `$${a * k} and $${b * k}`] }; } }],
    [{ text: 'Use the ratio to find the missing amount.', kinds: 2, gen: (i) => { const a = ri(1, 6), b = ri(2, 8), k = ri(2, 12); if (a === b) return { q: '' }; if (i % 2 === 0) return { q: `Cordial : water = ${a} : ${b}. How much water for ${a * k * 10} mL of cordial?`, a: `${b * k * 10} mL`, lines: [`${a} parts = ${a * k * 10} mL`, `1 part = ${k * 10} mL`, `water: ${b} × ${k * 10} = ${b * k * 10} mL`] }; return { q: `Boys : girls = ${a} : ${b}. There are ${b * k} girls. How many students altogether?`, a: String((a + b) * k), lines: [`${b} parts = ${b * k}, 1 part = ${k}`, `boys: ${a} × ${k} = ${a * k}`, `total: ${a * k} + ${b * k} = ${(a + b) * k}`] }; } }],
  ],
  '12.04': ({ ri, pick }) => [
    [{ text: 'Write as a rate for one unit (divide).', gen: () => { const [q, per] = pick([['km', 'h'], ['$', 'kg'], ['L', 'min'], ['words', 'min'], ['m', 's']]), n = ri(2, 9), r = ri(2, 60); return { q: `${q === '$' ? `$${n * r}` : `${n * r} ${q}`} in ${n} ${per}`, a: `${q === '$' ? `$${r}` : `${r} ${q}`}/${per}` }; } }],
    [{ text: 'Write the rate, then divide to find the rate for one unit.', gen: () => { const n = ri(2, 8), r = ri(40, 110); return { q: `A car travels ${n * r} km in ${n} hours. Find its speed.`, a: `${r} km/h`, lines: [`${n * r} km ÷ ${n} h`, `= ${r} km/h`] }; } }],
    [{ text: 'Change both rates to the same unit, then compare.', gen: () => { const a = ri(30, 90), b = ri(2, 5), c = ri(100, 400); if (a * b === c) return { q: '' }; return { q: `Car A: ${a} km/h. Car B: ${c} km in ${b} h. Which is faster?`, a: a > c / b ? 'A' : 'B', lines: [`B: ${c} ÷ ${b} = ${fmt(c / b, 1)} km/h`, `A: ${a} km/h`, `faster: ${a > c / b ? 'A' : 'B'}`] }; } }],
  ],
  '12.05': ({ ri, pick }) => [
    [{ text: 'Find the unit price: the price of one.', gen: () => { const n = ri(2, 12), u = ri(50, 900) / 100; return { q: `${n} for ${money(n * u)}`, a: money(u) }; } }],
    [{ text: 'Find the price of one of each, then choose the better buy.', gen: () => { const a = ri(2, 6), b = ri(2, 6), p = ri(100, 400) / 100, q = ri(100, 400) / 100; if (a === b || Math.abs(p - q) < 0.05) return { q: '' }; return { q: `${a} for ${money(a * p)} or ${b} for ${money(b * q)}`, a: p < q ? `${a} for ${money(a * p)}` : `${b} for ${money(b * q)}`, lines: [`${money(a * p)} ÷ ${a} = ${money(p)}; ${money(b * q)} ÷ ${b} = ${money(q)}`, `better: ${p < q ? `${a} for ${money(a * p)}` : `${b} for ${money(b * q)}`}`] }; } }],
    [{ text: 'Compare the price for 100 g of each. Which is the better buy?', gen: () => { const [s1, s2] = pick([[250, 500], [200, 500], [300, 1000], [400, 1000], [150, 600]]), p1 = ri(150, 600) / 100, p2 = ri(300, 1200) / 100; if (Math.abs(p1 / s1 - p2 / s2) < 1e-4) return { q: '' }; return { q: `${s1} g for ${money(p1)} or ${s2} g for ${money(p2)}`, a: `${p1 / s1 < p2 / s2 ? s1 : s2} g`, lines: [`${s1} g: ${money(p1)} ÷ ${s1 / 100} = ${money((p1 / s1) * 100)} per 100 g`, `${s2} g: ${money(p2)} ÷ ${s2 / 100} = ${money((p2 / s2) * 100)} per 100 g`, `better buy: ${p1 / s1 < p2 / s2 ? s1 : s2} g`] }; } }],
  ],
  '12.06': ({ ri, pick }) => [
    [{ text: 'Use the rate to find the total: rate × amount.', gen: () => { const k = ri(0, 2), r = ri(2, 25), n = ri(2, 12); return [{ q: `${n} kg at $${r}/kg`, a: `$${r * n}` }, { q: `${n} h at ${r * 5} km/h`, a: `${r * 5 * n} km` }, { q: `${n} h at $${r}/h`, a: `$${r * n}` }][k]; } }],
    [{ text: 'Find the time taken: time = distance ÷ speed.', gen: () => { const s = pick([40, 50, 60, 80, 100]), t = ri(1, 6); return { q: `${s * t} km at ${s} km/h`, a: `${t} h`, lines: [`${s * t} ÷ ${s}`, `= ${t} h`] }; } }],
    [{ text: 'Two steps: use the rate twice. Show each step.', gen: () => { const w = ri(15, 30), h = ri(3, 8), d = ri(2, 5); return { q: `Mia earns $${w} an hour. She works ${h} hours a day for ${d} days. How much does she earn?`, a: `$${w * h * d}`, lines: [`one day: ${w} × ${h} = $${w * h}`, `${d} days: ${w * h} × ${d}`, `= $${w * h * d}`] }; } }],
  ],
  '12.07': ({ ri, pick }) => {
    const legs = [pick([40, 60]), pick([20, 40]), 0, pick([40, 60]), 20];
    let dd = 0; const ys = [0, ...legs.map((x) => (dd += x))];
    const g = G.lineGraph({ title: 'A car trip', xs: ys.map((_, i) => `${i}`), ys, max: Math.ceil(dd / 20) * 20, step: 10, labelEvery: 20, yTitle: 'Distance (km)', xTitle: 'Time (hours)', w: 64, h: 50 });
    const Q = [['How far in the first hour?', `${legs[0]} km`, `${ys[1]} − 0`], ['What was the total distance?', `${dd} km`, 'read the last point'], ['When did the car stop?', 'from 2 h to 3 h', 'the flat part of the line'], ['Speed in the 2nd hour?', `${legs[1]} km/h`, `${ys[2]} − ${ys[1]} = ${legs[1]} km in 1 h`], ['Speed in the 4th hour?', `${legs[3]} km/h`, `${ys[4]} − ${ys[3]} = ${legs[3]} km in 1 h`], ['Average speed for the trip?', `${fmt(dd / 5, 1)} km/h`, `${dd} ÷ 5`]];
    return [
      [{ text: 'Find the speed: speed = distance ÷ time.', gen: () => { const s = pick([10, 15, 20, 40, 45, 60, 80, 90, 100]), t = ri(2, 6); return { q: `${s * t} km in ${t} h`, a: `${s} km/h` }; } }],
      [{ text: 'Use the travel graph. Read the distance at each hour.', fig: g, fh: 50, gen: (i) => (i >= Q.length ? null : { q: Q[i][0], a: Q[i][1], lines: [Q[i][2], `= ${Q[i][1]}`] }) }],
      [{ text: 'Find the missing value: d = s × t, s = d ÷ t, t = d ÷ s.', gen: (i) => { const s = pick([20, 40, 50, 60, 80]), t = ri(2, 5), k = i % 3; return [
        { q: `s = ${s} km/h, t = ${t} h. Find d.`, a: `${s * t} km`, lines: ['d = s × t', `= ${s} × ${t}`, `= ${s * t} km`] },
        { q: `d = ${s * t} km, t = ${t} h. Find s.`, a: `${s} km/h`, lines: ['s = d ÷ t', `= ${s * t} ÷ ${t}`, `= ${s} km/h`] },
        { q: `d = ${s * t} km, s = ${s} km/h. Find t.`, a: `${t} h`, lines: ['t = d ÷ s', `= ${s * t} ÷ ${s}`, `= ${t} h`] }][k]; }, kinds: 3 }],
    ];
  },
  '12.08': ({ ri, pick }) => [
    [{ text: 'Convert. 1 h = 60 min, 1 min = 60 s.', gen: () => { const k = ri(0, 2), x = ri(2, 9); return [{ q: `${x} h = ___ min`, a: `${x * 60} min` }, { q: `${x * 60} min = ___ h`, a: `${x} h` }, { q: `${x} min = ___ s`, a: `${x * 60} s` }][k]; } }],
    [{ text: 'Add the times. Add hours and minutes separately, then change 60 min to 1 h.', gen: () => { const a = ri(1, 3) * 60 + ri(10, 55), b = ri(1, 2) * 60 + ri(10, 55); return { q: `${hm(a)} + ${hm(b)}`, a: hm(a + b), lines: [`${Math.floor(a / 60) + Math.floor(b / 60)} h ${(a % 60) + (b % 60)} min`, `= ${hm(a + b)}`] }; } }],
    [{ text: 'Change between decimal hours and hours and minutes.', gen: () => { const h = ri(1, 6), q = pick([0.25, 0.5, 0.75, 0.1, 0.2, 0.4]); return ri(0, 1) ? { q: `${fmt(h + q)} h = ___ h ___ min`, a: hm(Math.round((h + q) * 60)), lines: [`${fmt(q)} × 60 = ${Math.round(q * 60)} min`, `= ${hm(Math.round((h + q) * 60))}`] } : { q: `${hm(Math.round((h + q) * 60))} = ___ h (decimal)`, a: `${fmt(h + q)} h`, lines: [`${Math.round(q * 60)} min ÷ 60 = ${fmt(q)}`, `= ${fmt(h + q)} h`] }; } }],
  ],
  '12.09': ({ ri }) => [
    [{ text: 'Write in 24-hour time. For p.m. times, add 12 to the hour.', gen: () => { const m = ri(0, 287) * 5; return { q: t12(m), a: t24(m) }; } },
      { text: 'Write in 12-hour time with a.m. or p.m.', gen: () => { const m = ri(0, 287) * 5; return { q: t24(m), a: t12(m) }; } }],
    [{ text: 'Convert. Take care near midnight and midday.', gen: () => { const m = [ri(0, 11) * 5, 720 + ri(0, 11) * 5, 1380 + ri(0, 11) * 5, 660 + ri(0, 11) * 5][ri(0, 3)]; return { q: t12(m), a: t24(m), lines: [`${m < 720 ? 'a.m.' : 'p.m.'}: ${m < 60 ? '12 a.m. is 00' : m >= 720 && m < 780 ? '12 p.m. stays 12' : m >= 720 ? 'add 12' : 'keep the hour'}`, `= ${t24(m)}`] }; } }],
    [{ text: 'Find the time after the minutes given. Write it in both forms.', gen: () => { const m = ri(0, 287) * 5, d = ri(2, 30) * 5; return { q: `${d} min after ${t24(m)}`, a: `${t24(m + d)} (${t12(m + d)})`, lines: [`${t24(m)} + ${d} min`, `= ${t24(m + d)}`, `= ${t12(m + d)}`] }; } }],
  ],
  '12.10': ({ ri }) => [
    [{ text: 'Find the time difference. Count up to the next hour, then on.', gen: () => { const a = ri(84, 160) * 5, b = a + ri(4, 60) * 5; return { q: `${t12(a)} to ${t12(b)}`, a: hm(b - a) }; } }],
    [{ text: 'Count up in steps: to the next hour, then whole hours, then the minutes.', gen: () => { const a = ri(84, 200) * 5, b = a + ri(15, 70) * 5; if (b >= 1440 || a % 60 === 0) return { q: '' }; const up = 60 - (a % 60); return { q: `${t24(a)} to ${t24(b)}`, a: hm(b - a), lines: [`${t24(a)} → ${t24(a + up)}: ${up} min`, `${t24(a + up)} → ${t24(b)}: ${hm(b - a - up)}`, `total: ${hm(b - a)}`] }; } }],
    [{ text: 'Time zones: Sydney is 2 hours ahead of Perth. Find the time, then the flight arrival.', gen: () => { const m = ri(84, 200) * 5, f = ri(36, 60) * 5; return { q: `A flight leaves Perth at ${t12(m)} and takes ${hm(f)}. What is the time in Sydney when it lands?`, a: t12(m + f + 120), lines: [`lands: ${t12(m)} + ${hm(f)} = ${t12(m + f)} Perth time`, `+ 2 h for Sydney`, `= ${t12(m + f + 120)}`] }; } }],
  ],
  '12.11': ({ ri }) => {
    const stops = ['School', 'Library', 'Pool', 'Shops', 'Beach'], gaps = [0, 7, 12, 9, 14];
    const starts = [ri(96, 100) * 5, ri(102, 106) * 5, ri(108, 112) * 5, ri(114, 118) * 5];
    const time = (s, k) => starts[s] + gaps.slice(0, k + 1).reduce((a, b) => a + b, 0);
    const fig = G.table(['Stop', 'Bus 1', 'Bus 2', 'Bus 3', 'Bus 4'], stops.map((st, k) => [`<b>${st}</b>`, ...starts.map((_, s) => t24(time(s, k)))]));
    return [
      [{ text: 'Use the bus timetable. Read across for the stop and down for the bus.', fig, fh: 36, gen: (i) => { if (i >= 16) return null; const b = i % 4, k = Math.floor(i / 4) % 5; return { q: `Bus ${b + 1} at the ${stops[k + (k < 4 ? 1 : 0)]}`, a: t24(time(b, k + (k < 4 ? 1 : 0))) }; } }],
      [{ text: 'How long is the trip? Subtract the times from the timetable.', gen: (i) => { if (i >= 12) return null; const b = i % 4, a = i % 3, c = a + 1 + (i % 2); if (c > 4) return { q: '' }; return { q: `Bus ${b + 1}: ${stops[a]} to ${stops[c]}`, a: hm(time(b, c) - time(b, a)), lines: [`${t24(time(b, a))} to ${t24(time(b, c))}`, `= ${hm(time(b, c) - time(b, a))}`] }; } }],
      [{ text: 'Plan a trip with the timetable. Give reasons.', gen: (i) => { const X = [[`You must be at the Beach by ${t24(time(2, 4) + 5)}. What is the latest bus you can catch from School?`, 'Bus 3', [`Bus 3 reaches the Beach at ${t24(time(2, 4))}`, `Bus 4 arrives ${t24(time(3, 4))}: too late`]], [`You reach the Library at ${t24(time(1, 1) + 2)}. When is the next bus, and when does it reach the Pool?`, `${t24(time(2, 1))}, Pool ${t24(time(2, 2))}`, [`next bus: Bus 3 at ${t24(time(2, 1))}`, `reaches the Pool at ${t24(time(2, 2))}`]], ['How long is the whole route from School to Beach?', hm(time(0, 4) - time(0, 0)), [`${t24(time(0, 0))} to ${t24(time(0, 4))}`, `= ${hm(time(0, 4) - time(0, 0))}`]], [`Write Bus 4's time at the Shops in 12-hour time.`, t12(time(3, 3)), [`${t24(time(3, 3))}`, `= ${t12(time(3, 3))}`]], ['How many minutes apart do Bus 1 and Bus 2 leave School?', `${starts[1] - starts[0]} min`, [`${t24(starts[0])} and ${t24(starts[1])}`, `${starts[1] - starts[0]} min apart`]]]; if (i >= X.length) return null; return { q: X[i][0], a: X[i][1], lines: X[i][2] }; } }],
    ];
  },
};
