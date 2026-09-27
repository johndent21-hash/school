// Worksheet questions for Chapter 1 Integers (lib/worksheet.js). Each lesson has three columns (Easy, Medium,
// Challenging); each column is a list of rounds { text, gen }. text is the instruction in the speech bubble; gen()
// returns one question { q, a, lines }: lines is the working, one step per line (the last line is the answer), used
// to show the fully worked, part-worked and blank questions. The first round of each column starts with two WE DO
// examples from the same generator.
const { ev } = require('../../lib/calc');

// Takes turns through the kinds of question in a column, so a column does not repeat one kind.
const cyc = () => { let t = 0; return (n) => t++ % n; };

// Distance between two integers on the number line, with the working.
const apart = (a, b, N) => {
  const [lo, hi] = a < b ? [a, b] : [b, a];
  return lo < 0 && hi > 0 ? [`${N(lo)} to 0 is ${-lo}, 0 to ${N(hi)} is ${hi}`, `${-lo} + ${hi} = ${hi - lo}`] : [`${N(hi)} − ${lo < 0 ? `(${N(lo)})` : N(lo)} = ${hi - lo}`];
};
const sit = [['a gain of {n} kg', 1], ['a loss of ${n}', -1], ['{n}°C below zero', -1], ['{n} m above sea level', 1], ['{n} m below sea level', -1], ['a rise of {n} cm', 1],
  ['a fall of {n} points', -1], ['{n} floors up', 1], ['{n} floors down', -1], ['a deposit of ${n}', 1], ['a withdrawal of ${n}', -1], ['{n} steps back', -1], ['{n} minutes late', 1]];

module.exports = {
  '1.01': ({ ri, nz, pick, N, B }, next = cyc()) => [
    [{ text: 'Write the opposite of each integer. It is the same distance from 0, on the other side.', gen: () => { const n = nz(-60, 60); return { q: N(n), a: N(-n) }; } },
      { text: 'Write an integer for each situation.', gen: () => { const [t, s] = pick(sit), n = ri(2, 90); return { q: t.replace('{n}', n), a: N(s * n) }; } }],
    [{ text: 'Simplify. The opposite of the opposite is the number itself.', gen: () => { const n = ri(2, 60); return ri(0, 2) ? { q: `−(−${n})`, a: N(n), lines: [`= the opposite of −${n}`, `= ${n}`] } : { q: `−(+${n})`, a: N(-n), lines: [`= the opposite of ${n}`, `= −${n}`] }; } }],
    [{ text: 'Answer each question. Write your reasoning on the lines.', gen: () => {
      const k = next(4), n = ri(2, 40), m = ri(2, 6);
      return [
        { q: `The opposite of a number is −${n}. What is the number?`, a: N(n), lines: [`opposite of ? = −${n}`, `the number is ${n}`] },
        { q: `A diver is ${n} m below sea level. Write this as an integer, then write its opposite.`, a: `−${n}, ${n}`, lines: [`below sea level: −${n}`, `opposite: ${n}`] },
        { q: `List all the integers whose distance from 0 is less than ${m}.`, a: Array.from({ length: 2 * m - 1 }, (_, i) => N(i - m + 1)).join(', '), lines: [`from −${m - 1} up to ${m - 1}`, Array.from({ length: 2 * m - 1 }, (_, i) => N(i - m + 1)).join(', ')] },
        { q: `If n = −${n}, find −n and −(−n).`, a: `${n} and −${n}`, lines: [`−n = −(−${n}) = ${n}`, `−(−n) = −${n}`] },
      ][k];
    } }],
  ],
  '1.02': ({ ri, pick, N }, next = cyc()) => [
    [{ text: 'Which integer is further to the right on the number line? Write it on the line.', gen: () => { const a = ri(-15, 15); let b; do b = ri(-15, 15); while (b === a); return { q: `${N(a)} or ${N(b)}`, a: N(Math.max(a, b)) }; } },
      { text: 'Start at the first number and move along the number line. Where do you land?', gen: () => { const a = ri(-8, 8), m = ri(2, 9), d = pick(['left', 'right']); return { q: `start at ${N(a)}, move ${m} ${d}`, a: N(d === 'left' ? a - m : a + m) }; } }],
    [{ text: 'How many units apart are the two integers on the number line?', gen: () => { const a = ri(-15, 0), b = ri(1, 15); const [x, y] = ri(0, 1) ? [a, b] : [b, a]; const l = apart(x, y, N); return { q: `${N(x)} and ${N(y)}`, a: String(Math.abs(x - y)), lines: l }; } },
      { text: 'Which integer is exactly halfway between?', gen: () => { const m = ri(-9, 9), d = ri(2, 9); return { q: `${N(m - d)} and ${N(m + d)}`, a: N(m), lines: [`${2 * d} apart, half is ${d}`, `${N(m - d)} + ${d} = ${N(m)}`] }; } }],
    [{ text: 'Count the integers or find the halfway point. Show your working.', gen: () => {
      if (ri(0, 1)) { const a = ri(4, 30), b = ri(4, 30); return { q: `How many integers are between −${a} and ${b}?`, a: String(a + b - 1), lines: [`−${a - 1} to −1: ${a - 1} integers, and 0`, `1 to ${b - 1}: ${b - 1} integers`, `${a - 1} + 1 + ${b - 1} = ${a + b - 1}`] }; }
      const m = ri(-12, 12), d = ri(5, 15); return { q: `Which integer is halfway between ${N(m - d)} and ${N(m + d)}?`, a: N(m), lines: [`distance apart: ${2 * d}`, `half: ${d}`, `${N(m - d)} + ${d} = ${N(m)}`] };
    } }],
  ],
  '1.03': ({ ri, shuffle, N }, next = cyc()) => [
    [{ text: 'Write &lt; or &gt; in the box. The integer further right is larger.', gen: () => { const a = ri(-20, 12); let b; do b = ri(-20, 12); while (b === a); return { q: `${N(a)} ☐ ${N(b)}`, a: a < b ? '<' : '>' }; } },
      { text: 'Write the smaller integer.', gen: () => { const a = ri(-30, 10); let b; do b = ri(-30, 10); while (b === a); return { q: `${N(a)} or ${N(b)}`, a: N(Math.min(a, b)) }; } }],
    [{ text: 'Write the integers in ascending order (smallest first).', gen: () => { const s = new Set(); while (s.size < 4) s.add(ri(-25, 20)); const xs = [...s], o = [...xs].sort((a, b) => a - b); return { q: shuffle(xs).map(N).join(', '), a: o.map(N).join(', '), lines: [`smallest: ${N(o[0])}, largest: ${N(o[3])}`, o.map(N).join(', ')] }; } },
      { text: 'Write the integers in descending order (largest first).', gen: () => { const s = new Set(); while (s.size < 4) s.add(ri(-40, 30)); const xs = [...s], o = [...xs].sort((a, b) => b - a); return { q: shuffle(xs).map(N).join(', '), a: o.map(N).join(', '), lines: [`largest: ${N(o[0])}, smallest: ${N(o[3])}`, o.map(N).join(', ')] }; } }],
    [{ text: 'Simplify any −(−n) first, then answer the question.', gen: () => {
      const k = next(3), a = ri(2, 12), b = ri(2, 12), c = ri(2, 12);
      if (k === 0) { const lo = -ri(12, 20), hi = lo + ri(5, 8); return { q: `Write three integers greater than ${N(lo)} but less than ${N(hi)}.`, a: `e.g. ${N(lo + 1)}, ${N(lo + 2)}, ${N(lo + 3)}`, lines: [`integers from ${N(lo + 1)} to ${N(hi - 1)}`, `e.g. ${N(lo + 1)}, ${N(lo + 2)}, ${N(lo + 3)}`] }; }
      if (k === 1) { const vals = [a, -b, c]; return a === c ? { q: '' } : { q: `Which is the smallest: −(−${a}), −${b} or −(−${c})?`, a: `−${b}`, lines: [`−(−${a}) = ${a}, −(−${c}) = ${c}`, `smallest: −${b}`] }; }
      const xs = [a, -b, -c, 0]; if (new Set(xs).size < 4) return { q: '' }; const o = [...xs].sort((p, q) => p - q);
      return { q: `Write in ascending order: −(−${a}), −${b}, −${c}, 0`, a: o.map(N).join(', '), lines: [`−(−${a}) = ${a}`, o.map(N).join(', ')] };
    } }],
  ],
  '1.04': ({ ri, nz, pick, N, B }, next = cyc()) => [
    [{ text: 'Evaluate each sum. Start at the first number and move along the number line.', gen: () => { const a = nz(-12, -1), b = ri(1, 12); return { q: `${N(a)} + ${b}`, a: N(a + b) }; } },
      { text: 'Evaluate. Adding a negative is the same as subtracting.', gen: () => { const a = nz(-12, 12), b = nz(-12, -1); return { q: `${N(a)} + ${B(b)}`, a: N(a + b) }; } }],
    [{ text: 'Evaluate. Add from left to right.', gen: () => { const a = nz(-15, 15), b = nz(-15, 15), c = nz(-15, 15); return { q: `${N(a)} + ${B(b)} + ${B(c)}`, a: N(a + b + c), lines: [`= ${N(a + b)} + ${B(c)}`, `= ${N(a + b + c)}`] }; } }],
    [{ text: 'Write a number sentence, then answer the question.', gen: () => {
      const k = next(4), t = -ri(2, 12), r = ri(5, 20), l = -ri(1, 4), f = ri(3, 9), m = ri(10, 40), s = m + ri(5, 30);
      return [
        { q: `The temperature is ${N(t)}°C and rises ${r}°C. What is the new temperature?`, a: `${N(t + r)}°C`, lines: [`${N(t)} + ${r}`, `= ${N(t + r)}°C`] },
        { q: `A lift at level ${N(l)} goes up ${f} floors. Which level is it on?`, a: `level ${N(l + f)}`, lines: [`${N(l)} + ${f}`, `= level ${N(l + f)}`] },
        { q: `Sam has $${m} and spends $${s} on credit. What is the balance?`, a: `−$${s - m}`, lines: [`${m} + (−${s})`, `= −$${s - m}`] },
        { q: `Find the missing number: ${N(t)} + ☐ = ${N(t + r)}`, a: String(r), lines: [`${N(t)} to ${N(t + r)}: ${r} right`, `☐ = ${r}`] },
      ][k];
    } }],
  ],
  '1.05': ({ ri, nz, pick, N, B }, next = cyc()) => [
    [{ text: 'Evaluate. Subtracting moves you left on the number line.', gen: () => { const a = ri(-10, 10), b = ri(2, 15); return { q: `${N(a)} − ${b}`, a: N(a - b) }; } },
      { text: 'Evaluate. Subtracting a negative is the same as adding.', gen: () => { const a = nz(-12, 12), b = nz(-12, -1); return { q: `${N(a)} − ${B(b)}`, a: N(a - b) }; } }],
    [{ text: 'Evaluate. Change each − (−) to +, then add from left to right.', gen: () => { const a = nz(-15, 15), b = nz(-15, -1), c = nz(-15, 15); return { q: `${N(a)} − ${B(b)} + ${B(c)}`, a: N(a - b + c), lines: [`= ${N(a)} + ${-b} + ${B(c)}`, `= ${N(a - b)} + ${B(c)}`, `= ${N(a - b + c)}`] }; } }],
    [{ text: 'Write a number sentence, then answer the question.', gen: () => {
      const k = next(4), lo = -ri(2, 12), hi = ri(5, 20), d = -ri(40, 150), u = ri(10, 35), x = ri(2, 12), y = ri(2, 12);
      return [
        { q: `The minimum temperature was ${N(lo)}°C and the maximum was ${hi}°C. By how much did it rise?`, a: `${hi - lo}°C`, lines: [`${hi} − (${N(lo)})`, `= ${hi} + ${-lo}`, `= ${hi - lo}°C`] },
        { q: `A submarine at ${N(d)} m rises ${u} m. Where is it now?`, a: `${N(d + u)} m`, lines: [`${N(d)} + ${u}`, `= ${N(d + u)} m`] },
        { q: `What is ${x} less than −${y}?`, a: N(-y - x), lines: [`−${y} − ${x}`, `= ${N(-y - x)}`] },
        { q: `Find the difference between −${x * 3} m and ${y * 2} m.`, a: `${x * 3 + y * 2} m`, lines: [`${y * 2} − (−${x * 3})`, `= ${y * 2} + ${x * 3}`, `= ${x * 3 + y * 2} m`] },
      ][k];
    } }],
  ],
  '1.06': ({ ri, nz, pick, N, B }, next = cyc()) => [
    [{ text: 'Evaluate each product. Same signs: positive. Different signs: negative.', gen: () => { const a = nz(-10, 10), b = nz(-10, 10); return a > 0 && b > 0 ? { q: '' } : { q: `${N(a)} × ${B(b)}`, a: N(a * b) }; } },
      { text: 'Write the sign of the answer only: + or −.', gen: () => { const k = pick([2, 3]); const xs = Array.from({ length: k }, () => nz(-9, 9)); return { q: xs.map(B).join(' × '), a: xs.reduce((p, x) => p * x, 1) > 0 ? '+' : '−' }; } }],
    [{ text: 'Evaluate. Multiply two numbers at a time.', gen: () => { const a = nz(-6, 6), b = nz(-6, 6), c = nz(-5, 5); return a > 0 && b > 0 && c > 0 ? { q: '' } : { q: `${N(a)} × ${B(b)} × ${B(c)}`, a: N(a * b * c), lines: [`= ${N(a * b)} × ${B(c)}`, `= ${N(a * b * c)}`] }; } }],
    [{ text: 'Write a number sentence, then answer the question.', gen: () => {
      const k = next(3), d = ri(2, 6), t = ri(3, 9), a = nz(-9, -2), b = nz(-9, 9);
      return [
        { q: `A diver goes down ${d} m every minute. Where is she after ${t} minutes?`, a: `${N(-d * t)} m`, lines: [`−${d} × ${t}`, `= ${N(-d * t)} m`] },
        { q: `The temperature drops ${d}°C each hour for ${t} hours. What is the total change?`, a: `${N(-d * t)}°C`, lines: [`−${d} × ${t}`, `= ${N(-d * t)}°C`] },
        { q: `Find the missing number: ${N(a)} × ☐ = ${N(a * b)}`, a: N(b), lines: [`☐ = ${N(a * b)} ÷ ${B(a)}`, `☐ = ${N(b)}`] },
      ][k];
    } }],
  ],
  '1.07': ({ ri, nz, pick, N, B }, next = cyc()) => [
    [{ text: 'Evaluate each quotient. Same signs: positive. Different signs: negative.', gen: () => { const a = nz(-10, 10), b = nz(-10, 10); return a > 0 && b > 0 ? { q: '' } : { q: `${N(a * b)} ÷ ${B(b)}`, a: N(a) }; } },
      { text: 'Find the missing number.', gen: () => { const a = nz(-9, 9), b = nz(-9, 9); return { q: `${N(a * b)} ÷ ☐ = ${N(a)}`, a: N(b) }; } }],
    [{ text: 'Evaluate. Divide from left to right.', gen: () => { const a = nz(-5, 5), b = nz(-4, 4), c = nz(-5, 5); return { q: `${N(a * b * c)} ÷ ${B(a)} ÷ ${B(b)}`, a: N(c), lines: [`= ${N(b * c)} ÷ ${B(b)}`, `= ${N(c)}`] }; } }],
    [{ text: 'Write a number sentence, then answer the question.', gen: () => {
      const k = next(3), p = ri(2, 8), e = ri(5, 30), h = ri(2, 8), f = ri(2, 6), a = nz(-9, 9), b = nz(-9, 9);
      return [
        { q: `A debt of $${p * e} is shared equally by ${p} people. Write each share as an integer.`, a: `−$${e}`, lines: [`−${p * e} ÷ ${p}`, `= −$${e} each`] },
        { q: `The temperature fell ${h * f}°C over ${h} hours. What was the change each hour?`, a: `${N(-f)}°C`, lines: [`−${h * f} ÷ ${h}`, `= ${N(-f)}°C each hour`] },
        { q: `Find the missing number: ☐ ÷ ${B(a)} = ${N(b)}`, a: N(a * b), lines: [`☐ = ${N(b)} × ${B(a)}`, `☐ = ${N(a * b)}`] },
      ][k];
    } }],
  ],
  '1.08': ({ ri, nz, pick, N, B }, next = cyc()) => [
    [{ text: 'Evaluate. × and ÷ before + and −.', gen: () => { const a = nz(-12, 12), b = nz(-6, 6), c = nz(-6, 6), op = pick(['+', '−']); const q = `${N(a)} ${op} ${B(b)} × ${B(c)}`; return { q, a: ev(q) }; } },
      { text: 'Evaluate. Brackets first.', gen: () => { const a = nz(-9, 9), b = nz(-9, 9), c = nz(-5, 5), op = pick(['+', '−']); const q = `(${N(a)} ${op} ${B(b)}) × ${B(c)}`; return { q, a: ev(q) }; } }],
    [{ text: 'Evaluate. Do × and ÷ first (left to right), then + and −.', gen: () => {
      const a = nz(-6, 6), b = nz(-6, 6), d = nz(-5, 5), c = nz(-5, 5) * d, op = pick(['+', '−']);
      const q = `${N(a)} × ${B(b)} ${op} ${B(c)} ÷ ${B(d)}`, x = a * b, y = c / d;
      return { q, a: ev(q), lines: [`= ${N(x)} ${op} ${B(y)}`, `= ${ev(q)}`] };
    } }],
    [{ text: 'Evaluate. Brackets first, then × and ÷, then + and −. One step on each line.', gen: () => {
      const a = nz(-8, 8), b = nz(-8, 8), c = nz(-4, 4), d = nz(-9, 9);
      const q = `${N(d)} − (${N(a)} + ${B(b)}) × ${B(c)}`, s = a + b;
      return { q, a: ev(q), lines: [`= ${N(d)} − ${B(s)} × ${B(c)}`, `= ${N(d)} − ${B(s * c)}`, `= ${ev(q)}`] };
    } }],
  ],
  '1.09': ({ ri, nz, pick, N, B }, next = cyc()) => [
    [{ text: 'Use your calculator. Use the (−) key for negative numbers.', gen: () => { const a = nz(-400, 400), b = nz(-400, 400); return { q: `${N(a)} + ${B(b)}`, a: N(a + b) }; } },
      { text: 'Use your calculator.', gen: () => { const a = nz(-45, 45), b = nz(-45, 45); return { q: `${N(a)} × ${B(b)}`, a: N(a * b) }; } }],
    [{ text: 'Use your calculator. Enter the brackets, then check the answer makes sense.', gen: () => { const a = nz(-90, 90), b = nz(-90, 90), c = nz(-25, 25); return { q: `(${N(a)} − ${B(b)}) × ${B(c)}`, a: N((a - b) * c), lines: [`bracket: ${N(a - b)}`, `${N(a - b)} × ${B(c)} = ${N((a - b) * c)}`] }; } }],
    [{ text: 'Estimate first, then use your calculator. Is your answer close to the estimate?', gen: () => {
      const a = -ri(21, 89), b = ri(11, 49); const ea = Math.round(a / 10) * 10, eb = Math.round(b / 10) * 10;
      return { q: `Estimate ${N(a)} × ${b}, then calculate.`, a: `≈ ${N(ea * eb)}; ${N(a * b)}`, lines: [`estimate: ${N(ea)} × ${eb} ≈ ${N(ea * eb)}`, `calculator: ${N(a * b)}`] };
    } }],
  ],
  '1.10': ({ ri, pick, N }, next = cyc()) => [
    [{ text: 'Find the new temperature.', gen: () => { const t = ri(-12, 15), c = ri(3, 18), up = pick([true, false]); return { q: `${N(t)}°C, ${up ? 'rises' : 'falls'} ${c}°C`, a: `${N(up ? t + c : t - c)}°C` }; } },
      { text: 'Find the new bank balance.', gen: () => { const b = ri(-80, 150), m = ri(10, 120), dep = pick([true, false]), r = dep ? b + m : b - m; return { q: `${b < 0 ? `−$${-b}` : `$${b}`}, ${dep ? 'deposit' : 'withdraw'} $${m}`, a: r < 0 ? `−$${-r}` : `$${r}` }; } }],
    [{ text: 'Find the difference between the two heights. Write a number sentence.', gen: () => { const a = ri(20, 400), b = ri(5, 120); return { q: `a hill ${a} m above sea level and a reef ${b} m below`, a: `${a + b} m`, lines: [`${a} − (−${b})`, `= ${a + b} m`] }; } }],
    [{ text: 'Write a number sentence for each step, then answer the question.', gen: () => {
      const k = next(3), s = -ri(4, 20) * 5, r = ri(2, 6), h = ri(2, 5), w = ri(3, 8), l = ri(2, 6), p = ri(2, 5), q = ri(1, 3);
      return [
        { q: `A diver is at ${N(s)} m. She rises ${r} m a minute for ${h} minutes. Where is she now?`, a: `${N(s + r * h)} m`, lines: [`${r} × ${h} = ${r * h}`, `${N(s)} + ${r * h}`, `= ${N(s + r * h)} m`] },
        { q: `A game scores +${p} for a win and −${q} for a loss. Mia wins ${w} and loses ${l}. What is her score?`, a: String(p * w - q * l), lines: [`${w} × ${p} = ${w * p}`, `${l} × (−${q}) = ${-l * q}`, `${w * p} + (${-l * q}) = ${p * w - q * l}`] },
        { q: `It is ${N(-r)}°C at 6 a.m. It warms ${h}°C an hour for ${w} hours. What is the temperature?`, a: `${N(-r + h * w)}°C`, lines: [`${h} × ${w} = ${h * w}`, `${N(-r)} + ${h * w}`, `= ${N(-r + h * w)}°C`] },
      ][k];
    } }],
  ],
};
