// Year 4 (Stage 2, Part B) — Place value, Decimals, Addition and subtraction, Multiplication and division, Fractions
import type { Level, Question, Topic } from '@/lib/maths/types'
import { D2, DIVIDE, L, MINUS, TIMES, chance, frac, int, mcA, mcFixedA, name, num, numA, pick, q, sample, shuffle } from './helpers'
import { cash, plural, words } from './s2'

const big = (s: string) => `<div class="big">${s}</div>`
const sq = '<span class="box">&#9633;</span>'
const PLACES = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands']
const digit = (n: number, pos: number) => Math.floor(n / 10 ** pos) % 10
const roundTo = (n: number, u: number) => Math.round(n / u) * u
const dec = (x: number) => num(Math.round(x * 100) / 100)

// ------------------------------------------------------------------ Place value (B)

const pv_large = (level: Level): Question => {
  if (level === 1) {
    let n = 0
    do n = int(10234, 98765)
    while (new Set(String(n)).size < 5)
    const pos = int(1, 4)
    const d = digit(n, pos)
    if (d === 0) return pv_large(level)
    return q({
      prompt: `What is the value of the digit ${d} in ${num(n)}?`,
      answer: numA(d * 10 ** pos),
      hint: 'Find the place of the digit: ones, tens, hundreds, thousands or ten thousands.',
      steps: [`The ${d} is in the ${PLACES[pos]} place.`, `Its value is ${d} ${TIMES} ${num(10 ** pos)} = ${num(d * 10 ** pos)}.`],
    })
  }
  if (level === 2) {
    const n = int(1, 9) * 100000 * (chance() ? 1 : 0) + int(1, 9) * 10000 + int(0, 9) * 1000 + pick([0, int(1, 9)]) * 100 + pick([0, int(1, 9)]) * 10 + int(0, 9)
    if (chance()) {
      return q({
        prompt: `Write this number using digits:${big(words(n))}`,
        answer: numA(n),
        hint: 'Write the thousands part first, then the hundreds, tens and ones. Use 0 for any empty place.',
        steps: [`${words(Math.floor(n / 1000))} thousand → ${num(Math.floor(n / 1000))} thousands`, `The rest is ${n % 1000}, written with 3 digits: ${String(n % 1000).padStart(3, '0')}.`, `The number is ${num(n)}.`],
      })
    }
    const parts = String(n)
      .split('')
      .map((c, i, a) => Number(c) * 10 ** (a.length - 1 - i))
      .filter((v) => v > 0)
    return q({
      prompt: `What number is this?${big(parts.map((p) => num(p)).join(' + '))}`,
      answer: numA(n),
      hint: 'Put each part in its place. Use 0 for any place that is missing.',
      steps: [`${parts.map((p) => num(p)).join(' + ')} = ${num(n)}`],
    })
  }
  const kind = pick(['thousands', 'rename', 'missing'])
  if (kind === 'thousands') {
    const n = int(102345, 987654)
    const u = pick([1000, 100])
    return q({
      prompt: `How many ${u === 1000 ? 'thousands' : 'hundreds'} are there altogether in ${num(n)}?`,
      answer: numA(Math.floor(n / u)),
      hint: u === 1000 ? 'Cover the last three digits. The digits left show the number of thousands.' : 'Cover the last two digits. The digits left show the number of hundreds.',
      steps: [`${num(n)} = ${num(Math.floor(n / u))} ${u === 1000 ? 'thousands' : 'hundreds'} and ${n % u} more.`, `There are ${num(Math.floor(n / u))} ${u === 1000 ? 'thousands' : 'hundreds'} altogether.`],
    })
  }
  if (kind === 'rename') {
    const th = int(12, 98)
    const t = int(11, 59)
    const n = th * 1000 + t * 10
    return q({
      prompt: `What number is ${th} thousands and ${t} tens?`,
      answer: numA(n),
      hint: 'Work out each part, then add.',
      steps: [`${th} thousands = ${num(th * 1000)}`, `${t} tens = ${t * 10}`, `${num(th * 1000)} + ${t * 10} = ${num(n)}`],
    })
  }
  const a = int(2, 8) * 10000
  const b = int(11, 19) * 1000
  const c = int(1, 9) * 100
  const n = a + b + c
  return q({
    prompt: `Complete:${big(`${num(n)} = ${num(a)} + ${sq} + ${c}`)}`,
    answer: numA(b),
    hint: 'Subtract the parts you know from the whole number.',
    steps: [`${num(n)} ${MINUS} ${num(a)} ${MINUS} ${c} = ${num(b)}`, `(${num(b)} is ${b / 1000} thousands: this is a non-standard way to split the number.)`],
  })
}

const pv_round = (level: Level): Question => {
  if (level === 2) {
    if (chance()) {
      const ds = sample([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 5)
      const largest = chance()
      const sorted = [...ds].sort((x, y) => (largest ? y - x : x - y))
      if (!largest && sorted[0] === 0) [sorted[0], sorted[1]] = [sorted[1], sorted[0]]
      const ans = Number(sorted.join(''))
      return q({
        prompt: `Use each of these digits once to make the ${largest ? 'largest' : 'smallest'} possible 5-digit number.${big(ds.join('&ensp;'))}`,
        answer: numA(ans),
        hint: largest ? 'Put the biggest digit in the biggest place.' : 'Put the smallest digit in the biggest place, but a 5-digit number cannot start with 0.',
        steps: largest ? [`Order the digits from largest to smallest: ${sorted.join(', ')}.`, `The largest number is ${num(ans)}.`] : ds.includes(0) ? [`Order from smallest to largest, but 0 cannot go first, so put it second.`, `The smallest number is ${num(ans)}.`] : [`Order the digits from smallest to largest: ${sorted.join(', ')}.`, `The smallest number is ${num(ans)}.`],
      })
    }
    // which is largest, with rearranged digits
    const ds = sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 5)
    const set = new Set<number>()
    while (set.size < 4) set.add(Number(shuffle(ds).join('')))
    const opts = [...set]
    const max = Math.max(...opts)
    const min = Math.min(...opts)
    const askMax = chance()
    return q({
      prompt: `Which number is the ${askMax ? 'largest' : 'smallest'}?`,
      answer: mcFixedA(
        opts.map((x) => num(x)),
        num(askMax ? max : min),
      ),
      hint: 'They all have the same digits. Compare the ten thousands digits first, then the thousands, and so on.',
      steps: [`Compare place by place from the left.`, `The ${askMax ? 'largest' : 'smallest'} is ${num(askMax ? max : min)}.`],
    })
  }
  const u = level === 1 ? 1000 : pick([10000, 100000])
  let n = 0
  do n = level === 1 ? int(1100, 98900) : u === 10000 ? int(11000, 989000) : int(110000, 949999)
  while (n % u === u / 2 || n % u === 0)
  const r = roundTo(n, u)
  const name_ = u === 1000 ? 'thousand' : u === 10000 ? '10 thousand' : '100 thousand'
  const lower = Math.floor(n / u) * u
  return q({
    prompt: `Round ${num(n)} to the nearest ${name_}.`,
    answer: numA(r),
    hint: `Which two multiples of ${num(u)} is it between? Which one is it closer to?`,
    steps: [`${num(n)} is between ${num(lower)} and ${num(lower + u)}.`, `The halfway point is ${num(lower + u / 2)}. ${num(n)} is ${n > lower + u / 2 ? 'above' : 'below'} it.`, `So ${num(n)} rounds to ${num(r)}.`],
  })
}

const pv_times = (level: Level): Question => {
  if (level === 1) {
    const n = int(12, 999)
    return q({
      prompt: `What number is 10 times as large as ${n}?`,
      answer: numA(n * 10),
      hint: 'Each digit moves one place to the left. A 0 fills the ones place.',
      steps: [`${n} ${TIMES} 10 = ${num(n * 10)}`, 'Each digit has moved one place to the left.'],
    })
  }
  if (level === 2) {
    const k = pick([100, 1000])
    const n = k === 100 ? int(3, 999) : int(2, 99)
    return q({
      prompt: `What number is ${k === 100 ? '100' : '1000'} times as large as ${n}?`,
      answer: numA(n * k),
      hint: k === 100 ? 'Each digit moves two places to the left.' : 'Each digit moves three places to the left.',
      steps: [`${n} ${TIMES} ${num(k)} = ${num(n * k)}`, `Each digit has moved ${k === 100 ? 'two' : 'three'} places to the left.`],
    })
  }
  const kind = pick(['missing', 'digit', 'tens'])
  if (kind === 'missing') {
    const k = pick([10, 100, 1000])
    const n = int(12, 99) * (k === 1000 ? 1 : pick([1, 10]))
    return q({
      prompt: `Complete:${big(`${sq} ${TIMES} ${num(k)} = ${num(n * k)}`)}`,
      answer: numA(n),
      hint: `Which number, made ${num(k)} times as large, gives ${num(n * k)}?`,
      steps: [`${num(n * k)} ${DIVIDE} ${num(k)} = ${n}`, `Check: ${n} ${TIMES} ${num(k)} = ${num(n * k)}`],
    })
  }
  if (kind === 'digit') {
    const d = int(2, 9)
    const n = d * 100 + int(1, 9) * 10 + int(1, 9)
    const k = pick([10, 100])
    return q({
      prompt: `${n} is made ${k} times as large. What is the value of the digit ${d} now?`,
      answer: numA(d * 100 * k),
      hint: `In ${n}, the ${d} is worth ${d * 100}. Making the number ${k} times as large makes each digit worth ${k} times as much.`,
      steps: [`${n} ${TIMES} ${k} = ${num(n * k)}`, `The ${d} is now in the ${k === 10 ? 'thousands' : 'ten thousands'} place: it is worth ${num(d * 100 * k)}.`],
    })
  }
  const n = int(1203, 9876)
  const u = pick([10, 100])
  return q({
    prompt: `How many ${u === 10 ? 'tens' : 'hundreds'} are there altogether in ${num(n)}?`,
    answer: numA(Math.floor(n / u)),
    hint: u === 10 ? 'Cover the ones digit.' : 'Cover the tens and ones digits.',
    steps: [`${num(n)} = ${num(Math.floor(n / u))} ${u === 10 ? 'tens' : 'hundreds'} and ${n % u} more.`],
  })
}

// ------------------------------------------------------------------ Decimals (B)

const dec_tenths = (level: Level): Question => {
  if (level === 1) {
    const k = int(1, 9)
    if (chance()) {
      return q({
        prompt: 'The number line from 0 to 1 is split into tenths. What decimal is at A?',
        diagram: D2.numberLine({ min: 0, max: 1, parts: 10, labels: [0, 1], marks: [{ value: k / 10, label: 'A' }] }),
        answer: numA(k / 10),
        hint: 'Each small step is one tenth, written 0.1.',
        steps: [`A is ${plural(k, 'tenth')} along from 0.`, `${plural(k, 'tenth')} = ${dec(k / 10)}`],
      })
    }
    return q({
      prompt: chance() ? `Write ${frac(k, 10)} as a decimal.` : `Write ${plural(k, 'tenth')} as a decimal.`,
      answer: numA(k / 10),
      hint: 'Tenths go in the first place after the decimal point.',
      steps: [`${plural(k, 'tenth')} = 0.${k}`],
    })
  }
  if (level === 2) {
    const w = int(1, 9)
    const k = int(1, 9)
    if (chance()) {
      const t = w * 10 + k
      return q({
        prompt: `Write ${t} tenths as a decimal.`,
        answer: numA(t / 10),
        hint: '10 tenths make 1 whole.',
        steps: [`${t} tenths = ${w * 10} tenths + ${plural(k, 'tenth')}`, `${w * 10} tenths = ${w} ${w === 1 ? 'whole' : 'wholes'}`, `So ${t} tenths = ${dec(t / 10)}`],
      })
    }
    return q({
      prompt: 'What decimal is at A?',
      diagram: D2.numberLine({ min: w, max: w + 1, parts: 10, labels: [w, w + 1], marks: [{ value: w + k / 10, label: 'A' }] }),
      answer: numA(w + k / 10),
      hint: `The line goes from ${w} to ${w + 1}. Each small step is one tenth.`,
      steps: [`A is ${plural(k, 'tenth')} past ${w}.`, `${w} + 0.${k} = ${dec(w + k / 10)}`],
    })
  }
  if (chance()) {
    // ten tenths regroup
    const w = int(1, 8)
    return q({
      prompt: `Count on by tenths: ${dec(w + 0.7)}, ${dec(w + 0.8)}, ${dec(w + 0.9)}, ${sq}. What is the next number?`,
      answer: numA(w + 1),
      hint: '10 tenths make 1 whole, so after 0.9 comes the next whole number.',
      steps: [`${dec(w + 0.9)} + 0.1 = ${w + 1}`, `10 tenths regroup to make 1 whole (written ${w + 1} or ${w + 1}.0).`],
    })
  }
  const a = int(1, 8) / 10
  const b = int(1, 9 - Math.round(a * 10)) / 10
  if (chance()) {
    return q({
      prompt: `Calculate ${dec(a)} + ${dec(b)}.`,
      answer: numA(a + b),
      hint: 'Add the tenths.',
      steps: [`${plural(Math.round(a * 10), 'tenth')} + ${plural(Math.round(b * 10), 'tenth')} = ${plural(Math.round((a + b) * 10), 'tenth')}`, `= ${dec(a + b)}`],
    })
  }
  const big_ = a + b
  return q({
    prompt: `How many tenths must be added to ${dec(a)} to make ${dec(big_)}?`,
    answer: numA(Math.round(b * 10)),
    suffix: Math.round(b * 10) === 1 ? 'tenth' : 'tenths',
    hint: 'Count on in tenths.',
    steps: [`${dec(big_)} ${MINUS} ${dec(a)} = ${dec(b)}`, `${dec(b)} is ${plural(Math.round(b * 10), 'tenth')}.`],
  })
}

const dec_hundredths = (level: Level): Question => {
  if (level === 1) {
    const h = int(11, 99)
    if (h % 10 === 0) return dec_hundredths(level)
    return q({
      prompt: chance() ? `Write ${frac(h, 100)} as a decimal.` : `Write ${h} hundredths as a decimal.`,
      answer: numA(h / 100),
      hint: 'Hundredths need two places after the decimal point.',
      steps: [`${h} hundredths = ${plural(Math.floor(h / 10), 'tenth')} and ${plural(h % 10, 'hundredth')}`, `= 0.${String(h).padStart(2, '0')}`],
    })
  }
  if (level === 2) {
    const kind = pick(['tenthsHund', 'asHund', 'small'])
    if (kind === 'tenthsHund') {
      const t = int(0, 9)
      const h = int(1, 9)
      const w = pick([0, int(1, 9)])
      return q({
        prompt: `Write as a decimal:${big(`${w ? `${plural(w, 'one')}, ` : ''}${plural(t, 'tenth')} and ${plural(h, 'hundredth')}`)}`,
        answer: numA(w + t / 10 + h / 100),
        hint: 'Ones, then the decimal point, then tenths, then hundredths. Use 0 for an empty place.',
        steps: [`${plural(w, 'one')}, ${plural(t, 'tenth')}, ${plural(h, 'hundredth')} = ${w}.${t}${h}` + (t === 0 ? ' (the 0 holds the tenths place)' : '')],
      })
    }
    if (kind === 'asHund') {
      const t = int(1, 9)
      return q({
        prompt: `Complete:${big(`0.${t} = ${sq} hundredths`)}`,
        answer: numA(t * 10),
        suffix: 'hundredths',
        hint: '1 tenth = 10 hundredths.',
        steps: [`0.${t} = ${plural(t, 'tenth')} = ${t * 10} hundredths`, `So 0.${t} = 0.${t}0.`],
      })
    }
    const h = int(1, 9)
    return q({
      prompt: `Write ${plural(h, 'hundredth')} as a decimal.`,
      answer: numA(h / 100),
      hint: 'There are no tenths, so put 0 in the tenths place.',
      steps: [`0 tenths and ${plural(h, 'hundredth')} = 0.0${h}`],
    })
  }
  const kind = pick(['value', 'zero', 'benchmark'])
  if (kind === 'value') {
    let n = 0
    do n = int(1, 9) + int(1, 9) / 10 + int(1, 9) / 100
    while (new Set(n.toFixed(2).replace('.', '')).size < 3)
    const s = n.toFixed(2)
    const pos = pick([0, 1, 2])
    const d = Number(s.replace('.', '')[pos])
    const names = d === 1 ? ['one', 'tenth', 'hundredth', 'ten'] : ['ones', 'tenths', 'hundredths', 'tens']
    return q({
      prompt: `What is the value of the digit ${d} in ${s}?`,
      answer: mcFixedA(
        names.map((p) => `${d} ${p}`),
        `${d} ${names[pos]}`,
      ),
      hint: 'The first place after the decimal point is tenths. The second place is hundredths.',
      steps: [`In ${s}, the ${d} is in the ${['ones', 'tenths', 'hundredths'][pos]} place, so its value is ${d} ${names[pos]}.`],
    })
  }
  if (kind === 'zero') {
    const t = int(1, 9)
    const which = pick(['trail', 'lead'])
    if (which === 'trail')
      return q({
        prompt: `Which number has the same value as 0.${t}0?`,
        answer: mcA(`0.${t}`, [`0.0${t}`, `${t}`, `${t}0`]),
        hint: 'A zero at the end of a decimal does not change its value.',
        steps: [`0.${t}0 = ${plural(t, 'tenth')} and 0 hundredths = 0.${t}`],
      })
    return q({
      prompt: `Which is larger: 0.${t} or 0.0${t}?`,
      answer: mcFixedA([`0.${t}`, `0.0${t}`, 'They are the same'], `0.${t}`),
      hint: 'Look at the tenths place.',
      steps: [`0.${t} is ${plural(t, 'tenth')}. 0.0${t} is only ${plural(t, 'hundredth')}.`, `So 0.${t} is larger. The 0 in 0.0${t} holds the tenths place.`],
    })
  }
  const b = pick([
    [1, 2, 0.5],
    [1, 4, 0.25],
    [3, 4, 0.75],
    [1, 10, 0.1],
  ] as [number, number, number][])
  return q({
    prompt: `Write ${frac(b[0], b[1])} as a decimal.`,
    answer: numA(b[2]),
    hint: 'Think of 1 whole as 100 hundredths.',
    steps: [`${frac(b[0], b[1])} of 100 hundredths = ${Math.round(b[2] * 100)} hundredths`, `= ${dec(b[2])}`],
  })
}

const dec_compare = (level: Level): Question => {
  if (level === 1) {
    let a = 0
    let b = 0
    do {
      a = int(0, 5) + int(1, 9) / 10
      b = chance() ? Math.floor(a) + int(1, 9) / 10 : Math.round(a * 10) % 10 + Math.floor(a) / 10
    } while (Math.abs(a - b) < 1e-9 || b <= 0)
    const [x, y] = [dec(a), dec(b)]
    return q({
      prompt: `Which is larger: ${x} or ${y}?`,
      answer: mcFixedA([x, y], a > b ? x : y),
      hint: 'Compare the ones first. If they are the same, compare the tenths.',
      steps: [`${a > b ? x : y} > ${a > b ? y : x}`],
    })
  }
  if (level === 2) {
    // 1 dp vs 2 dp: the longer decimal is not always larger
    const t = int(2, 8)
    const a = t / 10
    const b = (t - 1) / 10 + int(1, 9) / 100 + (chance(0.4) ? 0.1 : 0)
    if (Math.abs(a - b) < 1e-9) return dec_compare(level)
    const [x, y] = shuffle([dec(a), dec(b)])
    const lg = a > b ? dec(a) : dec(b)
    return q({
      prompt: `Which is larger: ${x} or ${y}?`,
      answer: mcFixedA([x, y], lg),
      hint: 'Write both with two decimal places, then compare.',
      steps: [`${dec(a)} = ${a.toFixed(2)} and ${dec(b)} = ${b.toFixed(2)}`, `${Math.round(Math.max(a, b) * 100)} hundredths > ${Math.round(Math.min(a, b) * 100)} hundredths, so ${lg} is larger.`],
    })
  }
  if (chance()) {
    const set = new Set<number>()
    const w = int(0, 3)
    while (set.size < 4) set.add(w + (chance() ? int(1, 9) / 10 : int(1, 99) / 100))
    const vals = [...set]
    const sorted = [...vals].sort((x, y) => x - y)
    const right = sorted.map(dec).join(', ')
    const wrongs = new Set<string>()
    // a "longer is larger" ordering and two shuffles
    wrongs.add([...vals].sort((x, y) => dec(x).length - dec(y).length || x - y).map(dec).join(', '))
    let guard = 0
    while (wrongs.size < 4 && guard++ < 50) wrongs.add(shuffle(vals).map(dec).join(', '))
    wrongs.delete(right)
    return q({
      prompt: 'Which list is in order from smallest to largest?',
      answer: mcA(right, [...wrongs].slice(0, 3)),
      hint: 'Write them all with two decimal places, then compare.',
      steps: [`With two decimal places: ${vals.map((v) => v.toFixed(2)).join(', ')}`, `In order: ${right}`],
    })
  }
  const t = int(1, 8)
  const ans = `0.${t}5`
  return q({
    prompt: `Which number is between 0.${t} and 0.${t + 1}?`,
    answer: mcA(ans, [`0.${t + 1}5`, `0.0${t}`, `${t}.5`]),
    hint: `0.${t} = 0.${t}0 and 0.${t + 1} = 0.${t + 1}0.`,
    steps: [`0.${t}0 < 0.${t}5 < 0.${t + 1}0`, `So ${ans} is between them.`],
  })
}

// ------------------------------------------------------------------ Addition and subtraction (B)

function addSteps(a: number, b: number): string[] {
  const steps: string[] = []
  let carry = 0
  const len = Math.max(String(a).length, String(b).length)
  for (let i = 0; i < len; i++) {
    const x = digit(a, i)
    const y = digit(b, i)
    const s = x + y + carry
    const sum = `${x} + ${y}${carry ? ' + 1' : ''} = ${s}`
    steps.push(s >= 10 && i < len - 1 ? `${PLACES[i]}: ${sum}. Write ${s % 10}, carry 1 to the ${PLACES[i + 1]}.` : `${PLACES[i]}: ${sum}.`)
    carry = s >= 10 ? 1 : 0
  }
  steps[0] = steps[0][0].toUpperCase() + steps[0].slice(1)
  steps.push(`${num(a)} + ${num(b)} = ${num(a + b)}`)
  return steps.map((s) => s[0].toUpperCase() + s.slice(1))
}

function subSteps(a: number, b: number): string[] {
  const len = String(a).length
  const d = Array.from({ length: len }, (_, i) => digit(a, i))
  const steps: string[] = []
  for (let i = 0; i < len; i++) {
    const y = digit(b, i)
    if (d[i] < y) {
      if (d[i + 1] > 0) {
        d[i + 1] -= 1
        d[i] += 10
        steps.push(`Trade 1 from the ${PLACES[i + 1]} for 10 ${PLACES[i]}: now ${d[i]} ${PLACES[i]}.`)
      } else {
        d[i + 2] -= 1
        d[i + 1] = 9
        d[i] += 10
        steps.push(`There are no ${PLACES[i + 1]} to trade, so trade 1 of the ${PLACES[i + 2]} for 10 ${PLACES[i + 1]}, then 1 of those for 10 ${PLACES[i]}: now ${d[i]} ${PLACES[i]} and 9 ${PLACES[i + 1]}.`)
      }
    }
    if (i < String(b).length || d[i] > 0) steps.push(`${PLACES[i][0].toUpperCase() + PLACES[i].slice(1)}: ${d[i]} ${MINUS} ${y} = ${d[i] - y}.`)
  }
  steps.push(`${num(a)} ${MINUS} ${num(b)} = ${num(a - b)}`)
  return steps
}

const as_algorithm = (level: Level): Question => {
  if (level === 1) {
    let a = 0
    let b = 0
    do {
      a = int(115, 689)
      b = int(108, 999 - a)
    } while ((a % 10) + (b % 10) < 10 || a + b > 999)
    return q({
      prompt: `Calculate:${big(`${a} + ${b}`)}`,
      answer: numA(a + b),
      hint: 'Line up the ones, tens and hundreds. Start with the ones.',
      steps: addSteps(a, b),
    })
  }
  if (level === 2) {
    let a = 0
    let b = 0
    do {
      a = int(321, 987)
      b = int(108, a - 50)
    } while (a % 10 >= b % 10 || digit(a, 1) === 0)
    return q({
      prompt: `Calculate:${big(`${a} ${MINUS} ${b}`)}`,
      answer: numA(a - b),
      hint: 'Start with the ones. If there are not enough, trade 1 ten for 10 ones.',
      steps: subSteps(a, b),
    })
  }
  if (chance()) {
    // subtraction across a zero
    const a = int(2, 9) * 100 + int(1, 8)
    let b = 0
    do b = int(102, a - 20)
    while (b % 10 <= a % 10)
    return q({
      prompt: `Calculate:${big(`${a} ${MINUS} ${b}`)}`,
      answer: numA(a - b),
      hint: 'There are no tens to trade, so trade a hundred first.',
      steps: subSteps(a, b),
    })
  }
  // missing digit given the difference
  let b = 0
  let diff = 0
  let a = 0
  do {
    b = int(150, 499)
    diff = int(150, 499)
    a = b + diff
  } while (a > 999 || digit(a, 1) === digit(a, 0))
  const shown = `${digit(a, 2)}${sq}${digit(a, 0)}`
  return q({
    prompt: `Find the missing digit:${big(`${shown} ${MINUS} ${b} = ${diff}`)}`,
    answer: numA(digit(a, 1)),
    hint: 'Addition undoes subtraction: the difference plus the number taken away gives the starting number.',
    steps: [`${diff} + ${b} = ${a}`, `So the starting number is ${a}, and the missing digit is ${digit(a, 1)}.`],
  })
}

const as_estimate = (level: Level): Question => {
  if (level === 1) {
    const a = int(21, 89)
    const b = int(21, 89)
    if (a % 10 === 5 || b % 10 === 5) return as_estimate(level)
    const ra = roundTo(a, 10)
    const rb = roundTo(b, 10)
    return q({
      prompt: `Estimate ${a} + ${b} by rounding each number to the nearest ten, then adding.`,
      answer: numA(ra + rb),
      hint: 'Round each number first.',
      steps: [`${a} ≈ ${ra} and ${b} ≈ ${rb}`, `${ra} + ${rb} = ${ra + rb}`, `(The exact answer is ${a + b}, which is close.)`],
    })
  }
  if (level === 2) {
    const sub = chance()
    let a = 0
    let b = 0
    do {
      a = int(210, 890)
      b = int(110, sub ? a - 100 : 990 - a)
    } while (a % 100 === 50 || b % 100 === 50 || b < 110)
    const ra = roundTo(a, 100)
    const rb = roundTo(b, 100)
    const e = sub ? ra - rb : ra + rb
    return q({
      prompt: `Estimate ${a} ${sub ? MINUS : '+'} ${b} by rounding each number to the nearest hundred.`,
      answer: numA(e),
      hint: 'Round each number to the nearest hundred, then calculate.',
      steps: [`${a} ≈ ${ra} and ${b} ≈ ${rb}`, `${ra} ${sub ? MINUS : '+'} ${rb} = ${e}`],
    })
  }
  // use an estimate to check a worked answer
  const sub = chance()
  const a = int(3, 8) * 100 + int(-15, 15)
  const b = int(1, 2) * 100 + int(-15, 15)
  const exact = sub ? a - b : a + b
  const wrong = chance(0.6)
  const claimed = wrong ? exact + pick([100, -100]) : exact
  const e = sub ? roundTo(a, 100) - roundTo(b, 100) : roundTo(a, 100) + roundTo(b, 100)
  const who = name()
  const yes = `Yes. ${roundTo(a, 100)} ${sub ? MINUS : '+'} ${roundTo(b, 100)} = ${e}, which is close to ${claimed}.`
  const no = `No. ${roundTo(a, 100)} ${sub ? MINUS : '+'} ${roundTo(b, 100)} = ${e}, which is far from ${claimed}.`
  return q({
    prompt: `${who} worked out ${a} ${sub ? MINUS : '+'} ${b} = ${claimed}. Use an estimate to decide: is this answer reasonable?`,
    answer: mcFixedA([yes, no], wrong ? no : yes),
    hint: 'Round both numbers to the nearest hundred and compare with the answer given.',
    steps: [`Estimate: ${roundTo(a, 100)} ${sub ? MINUS : '+'} ${roundTo(b, 100)} = ${e}`, wrong ? `${claimed} is about 100 away from the estimate, so it is not reasonable. (The exact answer is ${exact}.)` : `${claimed} is close to ${e}, so it is reasonable.`],
  })
}

const PRICES = ['a book', 'a pen set', 'a lunchbox', 'a drink bottle', 'a hat', 'a ball', 'a puzzle', 'a cap', 'a kite']
const fiveCents = (lo: number, hi: number) => int(lo / 5, hi / 5) * 5

const as_money = (level: Level): Question => {
  const who = name()
  if (level === 1) {
    const [i1, i2] = sample(PRICES, 2)
    const p1 = fiveCents(105, 995)
    const p2 = fiveCents(105, 995)
    return q({
      prompt: `${who} buys ${i1} for ${cash(p1)} and ${i2} for ${cash(p2)}. What is the total cost?`,
      prefix: '$',
      answer: numA((p1 + p2) / 100),
      hint: 'Add the dollars and the cents. 100 cents make 1 dollar.',
      steps: [`${cash(p1)} + ${cash(p2)} = ${cash(p1 + p2)}`],
    })
  }
  if (level === 2) {
    const note = pick([1000, 2000, 5000])
    const items = sample(PRICES, 2)
    const p1 = fiveCents(150, note / 2 - 50)
    const p2 = fiveCents(150, note / 2 - 50)
    const total = p1 + p2
    return q({
      prompt: `${who} buys ${items[0]} for ${cash(p1)} and ${items[1]} for ${cash(p2)}, and pays with a ${cash(note).replace('.00', '')} note. How much change should ${who} get?`,
      prefix: '$',
      answer: numA((note - total) / 100),
      hint: 'Add the prices, then subtract the total from the note.',
      steps: [`Total: ${cash(p1)} + ${cash(p2)} = ${cash(total)}`, `Change: ${cash(note)} ${MINUS} ${cash(total)} = ${cash(note - total)}`],
    })
  }
  if (chance()) {
    const saved = fiveCents(1005, 4995)
    const cost = saved + fiveCents(205, 2995)
    const thing = pick(['a skateboard', 'a scooter', 'a video game', 'a pair of runners'])
    return q({
      prompt: `${who} has saved ${cash(saved)} and wants to buy ${thing} that costs ${cash(cost)}. How much more does ${who} need to save?`,
      prefix: '$',
      answer: numA((cost - saved) / 100),
      hint: 'Is this an addition or a subtraction problem? Find the difference between the cost and the savings.',
      steps: [`${cash(cost)} ${MINUS} ${cash(saved)} = ${cash(cost - saved)}`],
    })
  }
  const budget = pick([2000, 3000, 5000])
  const k = 3
  const ps = Array.from({ length: k }, () => fiveCents(205, Math.floor(budget / k) - 105))
  const total = ps.reduce((s, x) => s + x, 0)
  const items = sample(['bread', 'milk', 'apples', 'cheese', 'pasta', 'yoghurt'], k)
  return q({
    prompt: `${who} has a budget of ${cash(budget)} for the shopping. ${who} buys ${items.map((it, i) => `${it} for ${cash(ps[i])}`).join(', ').replace(/, ([^,]*)$/, ' and $1')}. How much of the budget is left?`,
    prefix: '$',
    answer: numA((budget - total) / 100),
    hint: 'Add the costs, then subtract from the budget.',
    steps: [`Spent: ${ps.map(cash).join(' + ')} = ${cash(total)}`, `Left: ${cash(budget)} ${MINUS} ${cash(total)} = ${cash(budget - total)}`],
  })
}

const as_balance = (level: Level): Question => {
  if (level === 1) {
    if (chance()) {
      const a = int(14, 68)
      const b = int(15, 99 - a)
      return q({
        prompt: `Find the missing number:${big(`${sq} + ${a} = ${a + b}`)}`,
        answer: numA(b),
        hint: 'What do you add to the number to make the total? Subtract to find out.',
        steps: [`${a + b} ${MINUS} ${a} = ${b}`],
      })
    }
    const a = int(40, 99)
    const b = int(12, a - 10)
    return q({
      prompt: `Find the missing number:${big(`${a} ${MINUS} ${sq} = ${a - b}`)}`,
      answer: numA(b),
      hint: 'How much was taken away? Find the difference.',
      steps: [`${a} ${MINUS} ${a - b} = ${b}`],
    })
  }
  if (level === 2) {
    const a = int(23, 69)
    const b = int(14, 49)
    const c = roundTo(a, 10) === a ? a + 10 : roundTo(a, 10)
    const ans = a + b - c
    if (ans <= 0) return as_balance(level)
    return q({
      prompt: `Find the missing number:${big(`${a} + ${b} = ${c} + ${sq}`)}`,
      answer: numA(ans),
      hint: 'Both sides must have the same total. Work out the left side first, or see how the first number changed.',
      steps: [`${a} + ${b} = ${a + b}`, `${c} + ${sq} = ${a + b}, so ${sq} = ${a + b} ${MINUS} ${c} = ${ans}`, `(${a} went ${c > a ? 'up' : 'down'} by ${Math.abs(c - a)} to ${c}, so ${b} goes ${c > a ? 'down' : 'up'} by ${Math.abs(c - a)} to ${ans}.)`],
    })
  }
  const a = int(52, 199)
  const b = int(19, 49)
  const shift = roundTo(b, 10) - b
  if (shift === 0) return as_balance(level)
  const ans = a + shift
  return q({
    prompt: `Find the missing number:${big(`${a} ${MINUS} ${b} = ${sq} ${MINUS} ${b + shift}`)}`,
    answer: numA(ans),
    hint: 'The difference must stay the same. If the number being taken away changes, the first number must change by the same amount.',
    steps: [`${a} ${MINUS} ${b} = ${a - b}`, `${b} became ${b + shift} (${shift > 0 ? '+' : MINUS}${Math.abs(shift)}), so ${a} must also change by ${shift > 0 ? '+' : MINUS}${Math.abs(shift)}: ${ans}.`, `Check: ${ans} ${MINUS} ${b + shift} = ${a - b}`],
  })
}

// ------------------------------------------------------------------ Multiplication and division (B)

const md_facts = (level: Level): Question => {
  if (level === 1) {
    const a = pick([3, 4, 6, 8])
    const b = int(2, 10)
    const [x, y] = chance() ? [a, b] : [b, a]
    return q({
      prompt: `Calculate:${big(`${x} ${TIMES} ${y}`)}`,
      answer: numA(a * b),
      hint: a === 6 || a === 8 ? `Double the ${a / 2}s fact.` : `Count by ${a}s.`,
      steps: a === 6 || a === 8 ? [`${a / 2} ${TIMES} ${b} = ${(a / 2) * b}`, `Double it: ${a} ${TIMES} ${b} = ${a * b}`] : [`${x} ${TIMES} ${y} = ${a * b}`],
    })
  }
  if (level === 2) {
    if (chance(0.65)) {
      const a = pick([3, 4])
      const b = int(3, 10)
      return q({
        prompt: `${a} ${TIMES} ${b} = ${a * b}. Use this to find ${2 * a} ${TIMES} ${b}.`,
        answer: numA(2 * a * b),
        hint: `${2 * a} is double ${a}, so the answer is double ${a * b}.`,
        steps: [`${2 * a} ${TIMES} ${b} is double ${a} ${TIMES} ${b}.`, `Double ${a * b} = ${2 * a * b}`],
      })
    }
    const b = int(3, 9)
    return q({
      prompt: `10 ${TIMES} ${b} = ${10 * b}. Use this to find 9 ${TIMES} ${b}.`,
      answer: numA(9 * b),
      hint: `9 groups of ${b} is one group fewer than 10 groups of ${b}.`,
      steps: [`9 ${TIMES} ${b} = 10 ${TIMES} ${b} ${MINUS} ${b}`, `${10 * b} ${MINUS} ${b} = ${9 * b}`],
    })
  }
  const a = int(3, 9)
  const b = int(3, 10)
  if (chance()) {
    return q({
      prompt: `Calculate:${big(`${a * b} ${DIVIDE} ${a}`)}`,
      answer: numA(b),
      hint: `Think: ${a} ${TIMES} what = ${a * b}?`,
      steps: [`${a} ${TIMES} ${b} = ${a * b}`, `So ${a * b} ${DIVIDE} ${a} = ${b}`],
    })
  }
  return q({
    prompt: `Find the missing number:${big(`${sq} ${TIMES} ${a} = ${a * b}`)}`,
    answer: numA(b),
    hint: 'Use division, the inverse of multiplication.',
    steps: [`${a * b} ${DIVIDE} ${a} = ${b}`],
  })
}

const md_tens = (level: Level): Question => {
  const a = int(2, 9)
  const t = int(2, 9)
  if (level === 1) {
    const [x, y] = chance() ? [a, t * 10] : [t * 10, a]
    return q({
      prompt: `Calculate:${big(`${x} ${TIMES} ${y}`)}`,
      answer: numA(a * t * 10),
      hint: `${t * 10} is ${t} tens.`,
      steps: [`${a} ${TIMES} ${t} tens = ${a * t} tens`, `${a * t} tens = ${a * t * 10}`],
    })
  }
  if (level === 2) {
    return q({
      prompt: `Complete:${big(`${a} ${TIMES} ${t * 10} = ${a} ${TIMES} ${t} ${TIMES} 10 = ${sq}`)}`,
      answer: numA(a * t * 10),
      hint: 'Multiply the first two numbers, then multiply by 10.',
      steps: [`${a} ${TIMES} ${t} = ${a * t}`, `${a * t} ${TIMES} 10 = ${a * t * 10}`],
    })
  }
  if (chance()) {
    return q({
      prompt: `Find the missing number:${big(`${sq} ${TIMES} ${t * 10} = ${a * t * 10}`)}`,
      answer: numA(a),
      hint: `${a * t * 10} is ${a * t} tens, and ${t * 10} is ${t} tens.`,
      steps: [`${a * t * 10} = ${a * t} tens and ${t * 10} = ${t} tens`, `${a * t} ${DIVIDE} ${t} = ${a}`, `Check: ${a} ${TIMES} ${t * 10} = ${a * t * 10}`],
    })
  }
  const n = name()
  return q({
    prompt: `${n} puts ${t * 10} chairs in each row of the hall. There are ${a} rows. How many chairs are there?`,
    answer: numA(a * t * 10),
    suffix: 'chairs',
    hint: `Multiply ${a} by ${t * 10}.`,
    steps: [`${a} ${TIMES} ${t * 10} = ${a} ${TIMES} ${t} ${TIMES} 10`, `= ${a * t} ${TIMES} 10 = ${a * t * 10}`],
  })
}

const md_area = (level: Level): Question => {
  if (level === 1) {
    const r = int(3, 7)
    const c = int(4, 9)
    return q({
      prompt: 'A card covers part of this array. The dots are in complete rows and columns under the card. How many dots are there altogether?',
      diagram: D2.dotArray(r, c, { fromRow: 1, fromCol: 1 }),
      answer: numA(r * c),
      hint: 'Use the top row to count the columns and the left column to count the rows.',
      steps: [`There are ${r} rows and ${c} columns.`, `${r} ${TIMES} ${c} = ${r * c}`],
    })
  }
  const a = int(3, 9)
  const tens = int(1, level === 2 ? 1 : 4)
  const ones = int(1, 9)
  const n = tens * 10 + ones
  if (level === 2) {
    if (chance())
      return q({
        prompt: `Complete:${big(`${a} ${TIMES} ${n} = ${a} ${TIMES} 10 + ${a} ${TIMES} ${sq}`)}`,
        answer: numA(ones),
        hint: `Split ${n} into 10 and ${ones}.`,
        steps: [`${n} = 10 + ${ones}`, `So ${a} ${TIMES} ${n} = ${a} ${TIMES} 10 + ${a} ${TIMES} ${ones}.`],
      })
    return q({
      prompt: `Use the area model to calculate ${a} ${TIMES} ${n}.`,
      diagram: D2.areaModel(a, [10, ones]),
      answer: numA(a * n),
      hint: 'Find the area of each part, then add them.',
      steps: [`${a} ${TIMES} 10 = ${a * 10}`, `${a} ${TIMES} ${ones} = ${a * ones}`, `${a * 10} + ${a * ones} = ${a * n}`],
    })
  }
  const nn = int(2, 4) * 10 + ones
  const tt = nn - ones
  const show = chance()
  return q({
    prompt: show ? `Use the area model to calculate ${a} ${TIMES} ${nn}.` : `Split ${nn} into tens and ones to calculate ${a} ${TIMES} ${nn}.`,
    diagram: show ? D2.areaModel(a, [tt, ones]) : undefined,
    answer: numA(a * nn),
    hint: `Split ${nn} into ${tt} and ${ones}. Multiply each part by ${a}, then add.`,
    steps: [`${a} ${TIMES} ${tt} = ${a * tt}`, `${a} ${TIMES} ${ones} = ${a * ones}`, `${a * tt} + ${a * ones} = ${a * nn}`],
  })
}

const md_properties = (level: Level): Question => {
  if (level === 1) {
    const a = int(3, 9)
    const b = int(2, 9)
    if (a === b) return md_properties(level)
    return q({
      prompt: `Find the missing number:${big(`${a} ${TIMES} ${b} = ${b} ${TIMES} ${sq}`)}`,
      answer: numA(a),
      hint: 'Numbers can be multiplied in any order: the answer is the same.',
      steps: [`${a} ${TIMES} ${b} = ${b} ${TIMES} ${a} = ${a * b}`],
    })
  }
  if (level === 2) {
    const a = int(3, 9)
    const [p, r] = pick([
      [2, 5],
      [5, 2],
      [4, 5],
      [5, 4],
    ])
    return q({
      prompt: `Calculate ${p} ${TIMES} ${a} ${TIMES} ${r}. (Try multiplying ${p} ${TIMES} ${r} first.)`,
      answer: numA(p * a * r),
      hint: 'You can multiply the numbers in any order.',
      steps: [`${p} ${TIMES} ${r} = ${p * r}`, `${a} ${TIMES} ${p * r} = ${p * a * r}`],
    })
  }
  const kind = pick(['double', 'half'])
  if (kind === 'double') {
    const a = pick([3, 4, 6])
    const b = pick([4, 6, 8, 10, 12, 14, 16])
    return q({
      prompt: `Find the missing number:${big(`${a} ${TIMES} ${b} = ${2 * a} ${TIMES} ${sq}`)}`,
      answer: numA(b / 2),
      hint: `${a} has been doubled, so ${b} must be halved to keep the answer the same.`,
      steps: [`${a} ${TIMES} ${b} = ${a * b}`, `${2 * a} ${TIMES} ${b / 2} = ${a * b}`],
    })
  }
  const a = pick([4, 6, 8])
  const b = int(5, 15)
  return q({
    prompt: `Find the missing number:${big(`${a} ${TIMES} ${b} = ${a / 2} ${TIMES} ${sq}`)}`,
    answer: numA(2 * b),
    hint: `${a} has been halved, so ${b} must be doubled.`,
    steps: [`${a} ${TIMES} ${b} = ${a * b}`, `${a / 2} ${TIMES} ${2 * b} = ${a * b}`],
  })
}

const md_problems = (level: Level): Question => {
  if (level === 1) {
    const g = int(3, 9)
    const k = int(3, 9)
    if (chance()) {
      return q({
        prompt: `There are ${g * k} students. They sit in groups of ${g}. How many groups are there?`,
        answer: numA(k),
        suffix: 'groups',
        hint: `How many groups of ${g} are in ${g * k}?`,
        steps: [`${g * k} ${DIVIDE} ${g} = ${k}`],
      })
    }
    const thing = pick(['stickers', 'marbles', 'cards', 'grapes'])
    return q({
      prompt: `${g * k} ${thing} are shared equally between ${k} friends. How many ${thing} does each friend get?`,
      answer: numA(g),
      suffix: thing,
      hint: `Share ${g * k} into ${k} equal groups.`,
      steps: [`${g * k} ${DIVIDE} ${k} = ${g}`],
    })
  }
  if (level === 2) {
    const a = int(3, 9)
    const b = int(4, 10)
    if (chance()) {
      return q({
        prompt: `Juice boxes come in packs of ${a}. The class buys ${b} packs. How many juice boxes is that?`,
        answer: numA(a * b),
        suffix: 'juice boxes',
        hint: 'Equal groups: multiply.',
        steps: [`${b} ${TIMES} ${a} = ${a * b}`],
      })
    }
    return q({
      prompt: `Movie tickets cost $${a} each. How much do ${b} tickets cost?`,
      prefix: '$',
      answer: numA(a * b),
      hint: 'Multiply the price by the number of tickets.',
      steps: [`${b} ${TIMES} $${a} = $${a * b}`],
    })
  }
  const kind = pick(['missingDiv', 'sentence', 'twostep'])
  if (kind === 'missingDiv') {
    const a = int(3, 9)
    const b = int(3, 9)
    if (chance())
      return q({
        prompt: `Find the missing number:${big(`${a * b} ${DIVIDE} ${sq} = ${b}`)}`,
        answer: numA(a),
        hint: `${a * b} is shared into how many groups to get ${b} in each?`,
        steps: [`${b} ${TIMES} ${a} = ${a * b}`, `So ${a * b} ${DIVIDE} ${a} = ${b}`],
      })
    return q({
      prompt: `Find the missing number:${big(`${sq} ${DIVIDE} ${a} = ${b}`)}`,
      answer: numA(a * b),
      hint: 'Multiply to undo the division.',
      steps: [`${b} ${TIMES} ${a} = ${a * b}`],
    })
  }
  if (kind === 'sentence') {
    const n = int(4, 9)
    const k = int(3, 9)
    const total = n * k
    const sharing = chance()
    const story = sharing ? `${total} apples are shared equally between ${n} bags. How many apples go in each bag?` : `${total} apples are packed into bags of ${n}. How many bags are needed?`
    const right = `${total} ${DIVIDE} ${n} = ${sq}`
    return q({
      prompt: `Which number sentence matches this problem?<p>${story}</p>`,
      answer: mcA(right, [`${total} ${TIMES} ${n} = ${sq}`, `${n} ${DIVIDE} ${total} = ${sq}`, `${total} ${MINUS} ${n} = ${sq}`]),
      hint: sharing ? 'Sharing into equal groups is division.' : 'Finding how many groups of the same size is division.',
      steps: [`${sharing ? 'Sharing equally' : 'Grouping'} is division: ${right.replace(sq, String(k))}.`],
    })
  }
  const boxes = int(2, 6)
  const per = pick([6, 8, 10, 12])
  const people = pick([2, 3, 4, 6].filter((p) => (boxes * per) % p === 0 && p !== boxes))
  if (!people) return md_problems(level)
  return q({
    prompt: `There are ${boxes} boxes with ${per} pencils in each box. The pencils are shared equally between ${people} students. How many pencils does each student get?`,
    answer: numA((boxes * per) / people),
    suffix: 'pencils',
    hint: 'First find the total number of pencils, then share them.',
    steps: [`${boxes} ${TIMES} ${per} = ${boxes * per} pencils`, `${boxes * per} ${DIVIDE} ${people} = ${(boxes * per) / people}`],
  })
}

// ------------------------------------------------------------------ Fractions (B)

const FAMILIES: [number, number][] = [
  [2, 4],
  [2, 8],
  [4, 8],
  [3, 6],
  [5, 10],
]

const fr_equiv = (level: Level): Question => {
  const [d1, d2] = pick(FAMILIES)
  const k = d2 / d1
  const n1 = int(1, d1 - 1)
  if (level === 1) {
    return q({
      prompt: `Use the fraction wall to complete:${big(`${frac(n1, d1)} = ${frac(sq, d2)}`)}`,
      diagram: D2.fractionWall([
        { parts: d1, shaded: n1 },
        { parts: d2, shaded: n1 * k },
      ]),
      answer: numA(n1 * k),
      hint: `Count the ${d2 === 4 ? 'quarters' : d2 === 6 ? 'sixths' : d2 === 8 ? 'eighths' : 'tenths'} that line up with the shaded part.`,
      steps: [`${frac(n1, d1)} covers the same length as ${n1 * k} of the ${d2} parts.`, `${frac(n1, d1)} = ${frac(n1 * k, d2)}`],
    })
  }
  if (level === 2) {
    const down = chance(0.3)
    return q({
      prompt: down ? `Complete:${big(`${frac(n1 * k, d2)} = ${frac(sq, d1)}`)}` : `Complete:${big(`${frac(n1, d1)} = ${frac(sq, d2)}`)}`,
      answer: numA(down ? n1 : n1 * k),
      hint: `Each ${d1 === 2 ? 'half' : d1 === 3 ? 'third' : d1 === 4 ? 'quarter' : 'fifth'} is the same length as ${k} ${d2 === 4 ? 'quarters' : d2 === 6 ? 'sixths' : d2 === 8 ? 'eighths' : 'tenths'}.`,
      steps: [`1 part out of ${d1} = ${k} parts out of ${d2}.`, down ? `${n1 * k} ${DIVIDE} ${k} = ${n1}, so ${frac(n1 * k, d2)} = ${frac(n1, d1)}` : `${n1} ${TIMES} ${k} = ${n1 * k}, so ${frac(n1, d1)} = ${frac(n1 * k, d2)}`],
    })
  }
  const right = frac(n1 * k, d2)
  // common mistakes, kept only when they really are not equal to the fraction
  const cands: [number, number][] = [
    [n1, d2],
    [n1 * k + 1, d2],
    [n1 * k - 1, d2],
    [n1 + k, d2],
    [n1 + 1, d1 + 1],
    [n1 * k, d1],
  ]
  const wrongs = new Set<string>(cands.filter(([n, d]) => n >= 1 && n * d1 !== n1 * d).map(([n, d]) => frac(n, d)))
  wrongs.delete(right)
  return q({
    prompt: `Which fraction is equal to ${frac(n1, d1)}?`,
    answer: mcA(right, [...wrongs].slice(0, 3)),
    hint: `Imagine a fraction wall. Which fraction covers exactly the same length as ${frac(n1, d1)}?`,
    steps: [`${frac(n1, d1)}: split each part into ${k} to make ${d2} parts.`, `${n1} ${TIMES} ${k} = ${n1 * k}, so ${frac(n1, d1)} = ${right}`],
  })
}

const fr_compare = (level: Level): Question => {
  if (level === 1) {
    const d = pick([4, 5, 6, 8, 10])
    const [a, b] = sample(
      Array.from({ length: d - 1 }, (_, i) => i + 1),
      2,
    )
    return q({
      prompt: `Which is larger?`,
      answer: mcFixedA([frac(a, d), frac(b, d)], frac(Math.max(a, b), d)),
      hint: 'The parts are the same size, so compare how many parts.',
      steps: [`Both are counted in ${d}ths of the same whole.`.replace('4ths', 'quarters').replace('5ths', 'fifths').replace('6ths', 'sixths').replace('8ths', 'eighths').replace('10ths', 'tenths'), `${plural(Math.max(a, b), 'part')} is more than ${plural(Math.min(a, b), 'part')}.`],
    })
  }
  if (level === 2) {
    const [d1, d2] = pick(FAMILIES)
    const k = d2 / d1
    const n1 = int(1, d1 - 1)
    let n2 = int(1, d2 - 1)
    if (chance(0.25)) n2 = n1 * k
    const v1 = n1 / d1
    const v2 = n2 / d2
    const opts = [frac(n1, d1), frac(n2, d2), 'They are equal']
    const correct = Math.abs(v1 - v2) < 1e-9 ? 'They are equal' : v1 > v2 ? opts[0] : opts[1]
    return q({
      prompt: 'Which fraction is larger?',
      diagram: D2.fractionWall([
        { parts: d1, shaded: n1 },
        { parts: d2, shaded: n2 },
      ]),
      answer: mcFixedA(opts, correct),
      hint: 'Both strips are the same whole. Compare the shaded lengths.',
      steps: [`${frac(n1, d1)} = ${frac(n1 * k, d2)}`, correct === 'They are equal' ? `${frac(n1 * k, d2)} = ${frac(n2, d2)}, so they are equal.` : `${frac(n1 * k, d2)} ${n1 * k > n2 ? '>' : '<'} ${frac(n2, d2)}, so ${correct} is larger.`],
    })
  }
  if (chance(0.3)) {
    const n = name()
    const m = name()
    if (n === m) return fr_compare(level)
    return q({
      prompt: `${n} ate ${frac(1, 2)} of a small pizza. ${m} ate ${frac(1, 4)} of a large pizza. Can you be sure that ${n} ate more pizza?`,
      answer: mcFixedA(
        [`No, because the pizzas are different sizes`, `Yes, because ${frac(1, 2)} is always more than ${frac(1, 4)}`, `Yes, because 2 is less than 4`],
        `No, because the pizzas are different sizes`,
      ),
      hint: 'To compare fractions, the wholes must be the same size.',
      steps: [`${frac(1, 2)} > ${frac(1, 4)} only when the wholes are the same size.`, 'A quarter of a large pizza could be as much as half of a small one, so you cannot be sure.'],
    })
  }
  // smallest of three fractions from one family
  const fam = pick([
    [2, 4, 8],
    [3, 6, 6],
    [5, 10, 10],
  ])
  const D = fam[2]
  const vals = new Set<string>()
  const list: [number, number][] = []
  while (list.length < 3) {
    const d = pick(fam)
    const n = int(1, d - 1)
    const key = String((n * D) / d)
    if (!vals.has(key)) {
      vals.add(key)
      list.push([n, d])
    }
  }
  const askMin = chance()
  const target = list.reduce((best, x) => ((x[0] / x[1] < best[0] / best[1]) === askMin ? x : best))
  return q({
    prompt: `Which fraction is the ${askMin ? 'smallest' : 'largest'}?`,
    answer: mcFixedA(
      list.map(([n, d]) => frac(n, d)),
      frac(target[0], target[1]),
    ),
    hint: `Change them all to ${D === 8 ? 'eighths' : D === 6 ? 'sixths' : 'tenths'}.`,
    steps: [list.map(([n, d]) => (d === D ? frac(n, d) : `${frac(n, d)} = ${frac((n * D) / d, D)}`)).join(', '), `The ${askMin ? 'smallest' : 'largest'} is ${frac(target[0], target[1])}.`],
  })
}

const PART_NAME: Record<number, [string, string]> = {
  2: ['half', 'halves'],
  3: ['third', 'thirds'],
  4: ['quarter', 'quarters'],
  5: ['fifth', 'fifths'],
  6: ['sixth', 'sixths'],
  8: ['eighth', 'eighths'],
  10: ['tenth', 'tenths'],
}

const fr_beyond = (level: Level): Question => {
  if (level === 1) {
    const d = pick([2, 3, 4, 5, 6, 8, 10])
    const w = chance(0.6) ? 1 : int(2, 3)
    return q({
      prompt: `How many ${PART_NAME[d][1]} make ${w === 1 ? 'one whole' : `${w} wholes`}?`,
      answer: numA(d * w),
      hint: `One whole is ${d} ${PART_NAME[d][1]}.`,
      steps: w === 1 ? [`${d} ${PART_NAME[d][1]} make one whole: ${frac(d, d)} = 1.`] : [`One whole is ${d} ${PART_NAME[d][1]}.`, `${w} wholes = ${w} ${TIMES} ${d} = ${d * w} ${PART_NAME[d][1]}.`],
    })
  }
  if (level === 2) {
    const d = pick([2, 3, 4, 5])
    const n = d + int(1, d - 1 || 1)
    if (n % d === 0) return fr_beyond(level)
    const left = n - d
    if (chance()) {
      return q({
        prompt: `Complete:${big(`${n} ${PART_NAME[d][1]} = 1 whole and ${sq} ${PART_NAME[d][1]}`)}`,
        answer: numA(left),
        hint: `${d} ${PART_NAME[d][1]} make 1 whole.`,
        steps: [`${n} ${PART_NAME[d][1]} = ${d} ${PART_NAME[d][1]} + ${left} ${left === 1 ? PART_NAME[d][0] : PART_NAME[d][1]}`, `= 1 whole and ${left} ${left === 1 ? PART_NAME[d][0] : PART_NAME[d][1]}`],
      })
    }
    const a = int(2, d)
    const b = n - a
    if (b < 1) return fr_beyond(level)
    const who = name()
    const who2 = name()
    if (who === who2) return fr_beyond(level)
    const food = d === 4 || d === 2 ? 'sandwich' : d === 3 ? 'pizza' : 'cake'
    return q({
      prompt: `Each ${food} is cut into ${d} equal pieces. ${who} eats ${plural(a, 'piece')} and ${who2} eats ${plural(b, 'piece')}. Together they eat 1 whole ${food} and how many more ${PART_NAME[d][1]}?`,
      answer: numA(left),
      suffix: left === 1 ? PART_NAME[d][0] : PART_NAME[d][1],
      hint: `Add the pieces, then make wholes from groups of ${d}.`,
      steps: [`${a} + ${b} = ${n} ${PART_NAME[d][1]}`, `${n} ${PART_NAME[d][1]} = 1 whole ${food} and ${left} ${left === 1 ? PART_NAME[d][0] : PART_NAME[d][1]}.`],
    })
  }
  const d = pick([2, 4, 3, 5])
  const max = d === 5 ? 2 : pick([2, 3])
  let k = 0
  do k = int(d + 1, d * max - 1)
  while (k % d === 0)
  return q({
    prompt: `The number line is split into ${PART_NAME[d][1]}. How many ${PART_NAME[d][1]} is it from 0 to A?`,
    diagram: D2.numberLine({ min: 0, max, parts: d * max, labels: Array.from({ length: max + 1 }, (_, i) => i), marks: [{ value: k / d, label: 'A' }] }),
    answer: numA(k),
    suffix: PART_NAME[d][1],
    hint: `Each whole has ${d} ${PART_NAME[d][1]}. Count the ${PART_NAME[d][1]} from 0.`,
    steps: [`From 0 to ${Math.floor(k / d)} is ${Math.floor(k / d) * d} ${PART_NAME[d][1]}.`, `A is ${plural(k % d, PART_NAME[d][0], PART_NAME[d][1])} further on.`, `${Math.floor(k / d) * d} + ${k % d} = ${k} ${PART_NAME[d][1]}, which is more than one whole.`],
  })
}

// ------------------------------------------------------------------ topics

export const Y4A: Topic[] = [
  {
    id: 'y4-place-value',
    year: 4,
    title: 'Place value to 6 digits',
    strand: 'Number and algebra',
    outcomes: ['MA2-RN-01'],
    blurb: 'Read, partition, order and round numbers up to hundreds of thousands, and make numbers 10, 100 or 1000 times as large.',
    colour: 205,
    skills: [
      {
        id: 'y4-pv-large',
        title: 'Large numbers',
        outcomes: ['MA2-RN-01'],
        summary: 'Read, write and partition numbers up to 6 digits.',
        learn: {
          intro: '<p>We read large numbers in groups of three digits. 345 216 is “three hundred and forty-five thousand, two hundred and sixteen”.</p>',
          keyPoints: ['Places: hundred thousands, ten thousands, thousands, hundreds, tens, ones.', 'Numbers can be split in non-standard ways: 34 500 = 30 000 + 4500.'],
        },
        gen: pv_large,
        levels: { 1: 'value of a digit', 2: 'words and expanded form', 3: 'renaming and partitioning' },
      },
      {
        id: 'y4-pv-round',
        title: 'Ordering and rounding',
        outcomes: ['MA2-RN-01'],
        summary: 'Order large numbers and round to the nearest thousand, 10 thousand or 100 thousand.',
        learn: {
          intro: '<p>To round, find the two multiples the number is between and choose the closer one.</p>',
          keyPoints: ['Compare numbers from the biggest place first.', '46 712 rounded to the nearest thousand is 47 000.'],
        },
        gen: pv_round,
        levels: { 1: 'round to the nearest thousand', 2: 'order; largest and smallest from digits', 3: 'round to the nearest 10 thousand or 100 thousand' },
      },
      {
        id: 'y4-pv-times',
        title: '10, 100 and 1000 times as large',
        outcomes: ['MA2-RN-01'],
        summary: 'Describe how digits move when a number is made 10, 100 or 1000 times as large.',
        learn: {
          intro: '<p>Making a number 10 times as large moves every digit one place to the left.</p>',
          keyPoints: ['× 10: one place left.', '× 100: two places left.', '× 1000: three places left.'],
        },
        gen: pv_times,
        levels: { 1: '10 times as large', 2: '100 or 1000 times as large', 3: 'missing numbers and digit values' },
      },
    ],
  },
  {
    id: 'y4-decimals',
    year: 4,
    title: 'Tenths, hundredths and decimals',
    strand: 'Number and algebra',
    outcomes: ['MA2-RN-02'],
    blurb: 'Decimals as tenths and hundredths, on number lines, compared and ordered.',
    colour: 230,
    skills: [
      {
        id: 'y4-dec-tenths',
        title: 'Tenths',
        outcomes: ['MA2-RN-02'],
        summary: 'Write tenths as decimals and place them on a number line.',
        learn: {
          intro: '<p>When one whole is split into 10 equal parts, each part is one <b>tenth</b>, written 0.1. The decimal point marks where the ones end.</p>',
          keyPoints: ['7 tenths = 0.7', '10 tenths = 1 whole, written 1 or 1.0', '23 tenths = 2.3'],
        },
        gen: dec_tenths,
        levels: { 1: 'tenths to decimals; number line 0 to 1', 2: 'more than one whole', 3: 'regrouping tenths' },
      },
      {
        id: 'y4-dec-hundredths',
        title: 'Hundredths',
        outcomes: ['MA2-RN-02'],
        summary: 'Write hundredths as decimals and connect decimals to fractions.',
        learn: {
          intro: '<p>Splitting each tenth into 10 equal parts makes <b>hundredths</b>. 0.47 is 4 tenths and 7 hundredths, or 47 hundredths.</p>',
          keyPoints: ['0.4 = 0.40 = 40 hundredths', '0.04 is 4 hundredths (the 0 holds the tenths place).', `${frac(1, 2)} = 0.5, ${frac(1, 4)} = 0.25, ${frac(3, 4)} = 0.75`],
        },
        gen: dec_hundredths,
        levels: { 1: 'hundredths to decimals', 2: 'tenths and hundredths together', 3: 'digit values, zeros and benchmark fractions' },
      },
      {
        id: 'y4-dec-compare',
        title: 'Comparing and ordering decimals',
        outcomes: ['MA2-RN-02'],
        summary: 'Compare and order decimals up to 2 decimal places.',
        learn: {
          intro: '<p>To compare decimals, compare the ones first, then the tenths, then the hundredths. Writing both with two decimal places can help.</p>',
          keyPoints: ['0.7 = 0.70, so 0.7 > 0.65.', 'More digits does not mean a larger number.'],
        },
        gen: dec_compare,
        levels: { 1: 'tenths', 2: 'tenths and hundredths', 3: 'ordering lists; numbers in between' },
      },
    ],
  },
  {
    id: 'y4-addsub',
    year: 4,
    title: 'Addition and subtraction',
    strand: 'Number and algebra',
    outcomes: ['MA2-AR-01', 'MA2-AR-02'],
    blurb: 'Written methods with regrouping, estimation, money and budgeting, and balancing number sentences.',
    colour: 172,
    skills: [
      {
        id: 'y4-as-algorithm',
        title: 'Written methods',
        outcomes: ['MA2-AR-01'],
        summary: 'Add and subtract 3-digit numbers with regrouping.',
        learn: {
          intro: '<p>Line up the places and start with the ones. In addition, 10 ones make 1 ten. In subtraction, trade 1 ten for 10 ones when you need more ones.</p>',
          keyPoints: ['Check subtraction by adding: the answer plus the number taken away gives the first number.', 'If there are no tens to trade, trade a hundred first.'],
        },
        gen: as_algorithm,
        levels: { 1: 'addition with regrouping', 2: 'subtraction with trading', 3: 'trading across zero; missing digits' },
      },
      {
        id: 'y4-as-estimate',
        title: 'Estimating',
        outcomes: ['MA2-AR-01'],
        summary: 'Round to estimate, and use estimates to check answers.',
        learn: {
          intro: '<p>An <b>estimate</b> is a quick, close answer. Round the numbers, then calculate.</p>',
          keyPoints: ['387 + 211 ≈ 400 + 200 = 600', 'If an answer is far from your estimate, check it again.'],
        },
        gen: as_estimate,
        levels: { 1: 'round to the nearest ten', 2: 'round to the nearest hundred', 3: 'is the answer reasonable?' },
      },
      {
        id: 'y4-as-money',
        title: 'Money and budgeting',
        outcomes: ['MA2-AR-01'],
        summary: 'Solve money problems with addition and subtraction.',
        learn: {
          intro: '<p>Money is written in dollars and cents: $4.85 is 4 dollars and 85 cents. 100 cents = $1.</p>',
          keyPoints: ['Total cost: add.', 'Change and money left: subtract.', 'Australian prices end in 0 or 5 cents.'],
        },
        gen: as_money,
        levels: { 1: 'total cost', 2: 'change', 3: 'saving and budgets' },
      },
      {
        id: 'y4-as-balance',
        title: 'Balancing number sentences',
        outcomes: ['MA2-AR-02'],
        summary: 'Find missing numbers, including with operations on both sides of the equals sign.',
        learn: {
          intro: '<p>The equals sign means “is the same as”. Both sides of a number sentence must have the same value.</p>',
          keyPoints: ['36 + 27 = 40 + 23 (36 went up 4, so 27 went down 4).', '83 − 29 = 84 − 30 (add the same to both numbers: the difference stays the same).'],
        },
        gen: as_balance,
        levels: { 1: 'one missing number', 2: 'addition on both sides', 3: 'subtraction on both sides' },
      },
    ],
  },
  {
    id: 'y4-multdiv',
    year: 4,
    title: 'Multiplication and division',
    strand: 'Number and algebra',
    outcomes: ['MA2-MR-01', 'MA2-MR-02'],
    blurb: 'Facts to 10 × 10, doubling strategies, multiples of 10, the area model, number properties and word problems.',
    colour: 265,
    skills: [
      {
        id: 'y4-md-facts',
        title: 'Facts and strategies',
        outcomes: ['MA2-MR-01'],
        summary: 'Use doubling and known facts to work out multiplication and division facts.',
        learn: {
          intro: '<p>Use facts you know to find ones you do not. The 6s facts are double the 3s; the 8s facts are double the 4s.</p>',
          keyPoints: ['4 × 7 = 28, so 8 × 7 = 56.', '9 × 6 = 10 × 6 − 6 = 54.', 'Division undoes multiplication.'],
        },
        gen: md_facts,
        levels: { 1: 'facts for 3, 4, 6 and 8', 2: 'doubling and near tens', 3: 'division and missing factors' },
      },
      {
        id: 'y4-md-tens',
        title: 'Multiplying by multiples of 10',
        outcomes: ['MA2-MR-01'],
        summary: 'Multiply a one-digit number by a multiple of 10.',
        learn: {
          intro: '<p>40 is 4 tens. So 6 × 40 = 6 × 4 tens = 24 tens = 240.</p>',
          keyPoints: ['6 × 40 = 6 × 4 × 10', 'Use a basic fact, then multiply by 10.'],
        },
        gen: md_tens,
        levels: { 1: 'one-digit × multiple of 10', 2: 'using × 10', 3: 'missing factors and problems' },
      },
      {
        id: 'y4-md-area',
        title: 'Arrays and the area model',
        outcomes: ['MA2-MR-01'],
        summary: 'Use partly covered arrays and the area model to multiply.',
        learn: {
          intro: '<p>An <b>area model</b> splits a product into parts that are easy to multiply: 7 × 14 = 7 × 10 + 7 × 4.</p>',
          keyPoints: ['Rows × columns gives the total.', 'Split the larger number into tens and ones.'],
        },
        gen: md_area,
        levels: { 1: 'partly covered arrays', 2: 'split a teen number', 3: 'one-digit × two-digit' },
      },
      {
        id: 'y4-md-properties',
        title: 'Number properties',
        outcomes: ['MA2-MR-02'],
        summary: 'Use the commutative and associative properties, and doubling and halving.',
        learn: {
          intro: '<p>We can multiply in any order (<b>commutative</b>) and group the factors in any way (<b>associative</b>).</p>',
          keyPoints: ['6 × 4 = 4 × 6', '2 × 9 × 5 = 9 × 10 = 90', '4 × 15 = 2 × 30 (halve one, double the other)'],
        },
        gen: md_properties,
        levels: { 1: 'any order', 2: 'regroup the factors', 3: 'double and halve' },
      },
      {
        id: 'y4-md-problems',
        title: 'Word problems and number sentences',
        outcomes: ['MA2-MR-02'],
        summary: 'Solve sharing and grouping problems and find missing numbers.',
        learn: {
          intro: '<p><b>Sharing</b> (how many in each group) and <b>grouping</b> (how many groups) are both division.</p>',
          keyPoints: ['24 shared between 4: 24 ÷ 4 = 6 each.', '24 in groups of 4: 24 ÷ 4 = 6 groups.', 'Equal groups of the same size: multiply.'],
        },
        gen: md_problems,
        levels: { 1: 'sharing and grouping', 2: 'multiplication problems', 3: 'missing numbers; matching number sentences; two steps' },
      },
    ],
  },
  {
    id: 'y4-fractions',
    year: 4,
    title: 'Fractions',
    strand: 'Number and algebra',
    outcomes: ['MA2-PF-01'],
    blurb: 'Equivalent fractions as lengths, comparing fractions, and fractions beyond one whole.',
    colour: 330,
    skills: [
      {
        id: 'y4-fr-equivalent',
        title: 'Equivalent fractions',
        outcomes: ['MA2-PF-01'],
        summary: 'Find equivalent fractions with related denominators (2, 4, 8; 3, 6; 5, 10).',
        learn: {
          intro: `<p>Equivalent fractions cover the same length of the same whole. ${frac(1, 2)} = ${frac(2, 4)} = ${frac(4, 8)}.</p>`,
          keyPoints: ['Split each part into the same number of smaller parts.', `${frac(2, 3)} = ${frac(4, 6)}; ${frac(3, 5)} = ${frac(6, 10)}`],
        },
        gen: fr_equiv,
        levels: { 1: 'with a fraction wall', 2: 'without a diagram', 3: 'choose the equal fraction' },
      },
      {
        id: 'y4-fr-compare',
        title: 'Comparing fractions',
        outcomes: ['MA2-PF-01'],
        summary: 'Compare and order fractions with related denominators.',
        learn: {
          intro: '<p>Fractions can only be compared when the wholes are the same size. Change them to the same kind of parts, then compare.</p>',
          keyPoints: [`${frac(3, 4)} = ${frac(6, 8)}, so ${frac(3, 4)} > ${frac(5, 8)}.`],
        },
        gen: fr_compare,
        levels: { 1: 'same denominator', 2: 'related denominators', 3: 'order three; same-size wholes' },
      },
      {
        id: 'y4-fr-beyond',
        title: 'Fractions beyond one',
        outcomes: ['MA2-PF-01'],
        summary: 'Rename wholes as fractions and count fractions past one.',
        learn: {
          intro: '<p>4 quarters make one whole. 7 quarters is 1 whole and 3 quarters.</p>',
          keyPoints: ['2 halves = 3 thirds = 4 quarters = 5 fifths = 1 whole.', 'Keep counting past 1 on a number line: 4 quarters, 5 quarters, 6 quarters…'],
        },
        gen: fr_beyond,
        levels: { 1: 'parts in wholes', 2: 'regroup past one', 3: 'number lines past one' },
      },
    ],
  },
]
