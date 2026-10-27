// Year 3 (Stage 2, Part A) — Place value, Addition and subtraction, Multiplication and division, Fractions
import type { Level, Question, Topic } from '@/lib/maths/types'
import { D2, DIVIDE, L, MINUS, TIMES, chance, frac, fracAnyA, int, mcA, mcFixedA, name, num, numA, pick, q, sample, shuffle } from './helpers'
import { cash, plural, words } from './s2'

const big = (s: string) => `<div class="big">${s}</div>`
const sq = '<span class="box">&#9633;</span>'

// ------------------------------------------------------------------ Place value (A)

const pv_read = (level: Level): Question => {
  const n = L(level, int(101, 999), chance() ? int(1001, 9999) : int(1, 9) * 1000 + int(0, 9) * 10 + int(1, 9), int(1, 9) * 1000 + pick([0, int(1, 9) * 100]) + pick([0, int(1, 9) * 10]) + int(0, 9))
  if (level === 3 || chance(0.4)) {
    // numeral -> words (multiple choice)
    const s = String(n).split('').map(Number)
    const wrongs = new Set<string>()
    const tries = [n + 100, n - 10 >= 100 ? n - 10 : n + 10, Number(s.slice().reverse().join('')), n + 1000 <= 9999 ? n + 1000 : n - 1000, n * 10 <= 99999 && level === 3 ? Math.floor(n / 10) : n + 1]
    for (const t of tries) if (t !== n && t > 0) wrongs.add(words(t))
    return q({
      prompt: `Which words name this number?${big(num(n))}`,
      answer: mcA(words(n), [...wrongs].slice(0, 3)),
      hint: 'Read the thousands first, then the hundreds, then the tens and ones.',
      steps: [
        n >= 1000 ? `${plural(Math.floor(n / 1000), 'thousand')}, ${plural(Math.floor((n % 1000) / 100), 'hundred')}, ${plural(Math.floor((n % 100) / 10), 'ten')} and ${plural(n % 10, 'one')}.` : `${plural(Math.floor(n / 100), 'hundred')}, ${plural(Math.floor((n % 100) / 10), 'ten')} and ${plural(n % 10, 'one')}.`,
        `So ${num(n)} is “${words(n)}”.`,
      ],
    })
  }
  return q({
    prompt: `Write this number using digits:<div class="big">${words(n)}</div>`,
    answer: numA(n),
    hint: 'Write a digit for each place: thousands, hundreds, tens, ones. Use 0 for an empty place.',
    steps: [
      n >= 1000 ? `Thousands: ${Math.floor(n / 1000)}, hundreds: ${Math.floor((n % 1000) / 100)}, tens: ${Math.floor((n % 100) / 10)}, ones: ${n % 10}.` : `Hundreds: ${Math.floor(n / 100)}, tens: ${Math.floor((n % 100) / 10)}, ones: ${n % 10}.`,
      `The number is ${num(n)}.`,
    ],
  })
}

const PLACE = ['one', 'ten', 'hundred', 'thousand']
const pv_value = (level: Level): Question => {
  if (level === 3) {
    // how many tens / hundreds in a number (regrouping)
    const n = int(1100, 9899)
    const unit = pick([10, 100])
    const ans = Math.floor(n / unit)
    return q({
      prompt: `How many ${unit === 10 ? 'tens' : 'hundreds'} are there altogether in ${num(n)}?`,
      answer: numA(ans),
      hint: unit === 10 ? 'Every hundred is 10 tens and every thousand is 100 tens.' : 'Every thousand is 10 hundreds.',
      steps:
        unit === 10
          ? [`${num(n)} = ${num(Math.floor(n / 10) * 10)} + ${n % 10}`, `${num(Math.floor(n / 10) * 10)} is ${num(ans)} tens (cover the ones digit: ${num(ans)}).`, `There are ${num(ans)} tens altogether.`]
          : [`${num(n)} has ${plural(Math.floor(n / 1000), 'thousand')} and ${plural(Math.floor((n % 1000) / 100), 'hundred')}.`, `${plural(Math.floor(n / 1000), 'thousand')} = ${Math.floor(n / 1000) * 10} hundreds.`, `${Math.floor(n / 1000) * 10} + ${Math.floor((n % 1000) / 100)} = ${ans} hundreds altogether.`],
    })
  }
  const digits = level === 1 ? 3 : 4
  let n = 0
  do n = int(digits === 3 ? 102 : 1002, digits === 3 ? 998 : 9998)
  while (new Set(String(n)).size < digits)
  const pos = int(level === 1 ? 0 : 1, digits - 1)
  const d = Math.floor(n / 10 ** pos) % 10
  if (d === 0) return pv_value(level)
  const val = d * 10 ** pos
  return q({
    prompt: `What is the value of the digit ${d} in ${num(n)}?`,
    answer: numA(val),
    hint: 'Find which place the digit is in: ones, tens, hundreds or thousands.',
    steps: [`The ${d} is in the ${PLACE[pos]}s place.`, `${plural(d, PLACE[pos])} = ${num(val)}`],
  })
}

const pv_partition = (level: Level): Question => {
  if (level === 1) {
    const h = int(1, 9)
    const t = int(0, 9)
    const o = int(1, 9)
    const n = h * 100 + t * 10 + o
    return q({
      prompt: `Calculate:${big(`${h * 100} + ${t * 10} + ${o}`)}`,
      answer: numA(n),
      hint: 'Put the hundreds, tens and ones together.',
      steps: [`${plural(h, 'hundred')}, ${plural(t, 'ten')} and ${plural(o, 'one')} make ${n}.`],
    })
  }
  if (level === 2) {
    if (chance()) {
      const th = int(1, 9)
      const h = int(0, 9)
      const t = int(0, 9)
      const o = int(0, 9)
      const n = th * 1000 + h * 100 + t * 10 + o
      const parts = [
        [th, 'thousands'],
        [h, 'hundreds'],
        [t, 'tens'],
        [o, 'ones'],
      ].filter(([v]) => v !== 0)
      return q({
        prompt: `What number is ${parts.map(([v, p]) => `${v} ${v === 1 ? String(p).slice(0, -1) : p}`).join(', ').replace(/, ([^,]*)$/, ' and $1')}?`,
        answer: numA(n),
        hint: 'Write a digit in each place. Use 0 for any place that is missing.',
        steps: [`Thousands ${th}, hundreds ${h}, tens ${t}, ones ${o}.`, `The number is ${num(n)}.`],
      })
    }
    // non-standard partition: hundreds + more than 9 tens
    const h = int(1, 8)
    const t = int(11, 19)
    const o = int(1, 9)
    const n = h * 100 + t * 10 + o
    return q({
      prompt: `What number is ${plural(h, 'hundred')}, ${t} tens and ${plural(o, 'one')}?`,
      answer: numA(n),
      hint: '10 tens make 1 hundred. Regroup the tens.',
      steps: [`${t} tens = ${t * 10}`, `${h * 100} + ${t * 10} + ${o} = ${n}`],
    })
  }
  // missing part in a non-standard partition
  const n = int(1200, 9800)
  if (chance()) {
    const hundreds = Math.floor(n / 100)
    const rest = n % 100
    return q({
      prompt: `Complete:${big(`${num(n)} = ${sq} hundreds + ${plural(rest, 'one')}`)}`,
      answer: numA(hundreds),
      hint: 'How many hundreds are in the thousands and hundreds together?',
      steps: [`${num(n)} = ${num(hundreds * 100)} + ${rest}`, `${num(hundreds * 100)} is ${hundreds} hundreds.`, `The missing number is ${hundreds}.`],
    })
  }
  const th = Math.floor(n / 1000)
  const h = Math.floor((n % 1000) / 100)
  const rest = n % 100
  if (th < 2) return pv_partition(level)
  return q({
    prompt: `Complete:${big(`${num(n)} = ${plural(th - 1, 'thousand')} + ${sq} hundreds + ${plural(rest, 'one')}`)}`,
    answer: numA(h + 10),
    hint: 'One of the thousands has been turned into 10 hundreds.',
    steps: [`${num(n)} = ${plural(th, 'thousand')} + ${plural(h, 'hundred')} + ${plural(rest, 'one')}.`, `Take 1 thousand and regroup it as 10 hundreds: ${plural(th - 1, 'thousand')} + ${h + 10} hundreds.`, `The missing number is ${h + 10}.`],
  })
}

const pv_order = (level: Level): Question => {
  if (level === 1) {
    const kind = pick(['before', 'after', 'bigger'])
    if (kind === 'bigger') {
      const a = int(100, 999)
      let b = 0
      do b = pick([Number(String(a).split('').reverse().join('')), a + pick([-10, 10, -100, 100, 1, -1])])
      while (b === a || b < 100 || b > 999)
      const big_ = Math.max(a, b)
      return q({
        prompt: `Which number is larger?`,
        answer: mcA(num(big_), [num(Math.min(a, b))]),
        hint: 'Compare the hundreds first. If they are the same, compare the tens.',
        steps: [`Compare ${a} and ${b} place by place, starting with the hundreds.`, `${big_} is larger.`],
      })
    }
    const n = int(1, 9) * 100 + pick([0, 90, 99])
    const ans = kind === 'before' ? n - 1 : n + 1
    return q({
      prompt: `What number comes just ${kind} ${num(n)}?`,
      answer: numA(ans),
      hint: kind === 'before' ? 'Count back 1.' : 'Count on 1.',
      steps: [`${num(n)} ${kind === 'before' ? MINUS : '+'} 1 = ${num(ans)}`],
    })
  }
  if (level === 2) {
    if (chance()) {
      const n = pick([int(1, 9) * 1000, int(1, 9) * 1000 + int(1, 9) * 100, int(1, 8) * 1000 + 99, int(1, 9) * 1000 + int(0, 9) * 100 + 9 + 90 * int(0, 1)])
      const before = chance()
      const ans = before ? n - 1 : n + 1
      return q({
        prompt: `What number comes just ${before ? 'before' : 'after'} ${num(n)}?`,
        answer: numA(ans),
        hint: before ? 'Count back 1. Watch the zeros: you may need to regroup.' : 'Count on 1. Watch the nines: they roll over to the next place.',
        steps: [`${num(n)} ${before ? MINUS : '+'} 1 = ${num(ans)}`],
      })
    }
    const base = int(1, 9) * 1000 + int(0, 9) * 100
    const nums = shuffle(Array.from(new Set([base + int(10, 99), base + int(100, 199), base - int(1, 99), base + 1000 * pick([1, -1]) + int(0, 50)]))).slice(0, 4)
    const asc = nums.slice().sort((x, y) => x - y)
    const wrong1 = asc.slice().reverse()
    const wrong2 = [asc[1], asc[0], asc[2], asc[3]]
    const wrong3 = [asc[0], asc[2], asc[1], asc[3]]
    const fmt = (arr: number[]) => arr.map((x) => num(x)).join(', ')
    return q({
      prompt: `Which list is in ascending order (smallest to largest)?${big(fmt(nums))}`,
      answer: mcA(fmt(asc), [fmt(wrong1), fmt(wrong2), fmt(wrong3)]),
      hint: 'Compare thousands first, then hundreds, then tens.',
      steps: [`Smallest to largest: ${fmt(asc)}.`],
    })
  }
  // counting by tens or hundreds across a boundary
  const by = pick([10, 100])
  const up = chance(0.6)
  const start = by === 10 ? int(1, 9) * 1000 + int(0, 9) * 100 + 70 + int(1, 9) : int(1, 8) * 1000 + 700 + int(1, 99)
  const seq = [0, 1, 2].map((k) => start + (up ? 1 : -1) * k * by)
  const ans = start + (up ? 1 : -1) * 3 * by
  return q({
    prompt: `Count ${up ? 'forwards' : 'backwards'} by ${by === 10 ? 'tens' : 'hundreds'}. What number comes next?${big(seq.map((x) => num(x)).join(', ') + ', ' + sq)}`,
    answer: numA(ans),
    hint: `Each number is ${by} ${up ? 'more' : 'less'} than the one before.`,
    steps: [`${num(seq[2])} ${up ? '+' : MINUS} ${by} = ${num(ans)}`],
  })
}

const pv_numberline = (level: Level): Question => {
  const [min, max, parts] = L(level, [0, 100, 10], [0, 1000, 10], pick([[2000, 3000, 10], [0, 10000, 10], [3000, 4000, 10]]))
  const step = (max - min) / parts
  const k = int(1, parts - 1)
  const value = min + k * step
  return q({
    prompt: `What number is at A?`,
    diagram: D2.numberLine({ min, max, parts, labels: [min, max], marks: [{ value, label: 'A' }] }),
    answer: numA(value),
    hint: `Work out what each step on the line is worth: there are ${parts} equal steps from ${num(min)} to ${num(max)}.`,
    steps: [`Each step is (${num(max)} ${MINUS} ${num(min)}) ${DIVIDE} ${parts} = ${num(step)}.`, `A is ${plural(k, 'step')} from ${num(min)}: ${num(min)} + ${k} ${TIMES} ${num(step)} = ${num(value)}.`],
  })
}

// ------------------------------------------------------------------ Addition and subtraction (A)

const as_mental = (level: Level): Question => {
  const add = chance()
  let a: number
  let b: number
  if (level === 1) {
    a = int(21, 79)
    b = add ? int(11, 99 - a) : int(11, a - 5)
    if (add ? (a % 10) + (b % 10) >= 10 : a % 10 < b % 10) return as_mental(level)
  } else if (level === 2) {
    a = add ? int(25, 89) : int(52, 98)
    b = add ? int(15, 49) : int(16, a - 11)
    // force bridging a ten
    if (add && (a % 10) + (b % 10) < 10) return as_mental(level)
    if (!add && a % 10 >= b % 10) return as_mental(level)
  } else {
    a = add ? int(120, 699) : int(301, 900)
    b = add ? pick([int(1, 6) * 100 - int(1, 3), int(101, 299)]) : pick([int(1, 4) * 100 - int(1, 3), int(102, 280)])
    if (!add && b >= a) return as_mental(level)
  }
  const ans = add ? a + b : a - b
  const near = Math.ceil(b / 10) * 10
  const tens = b - (b % 10)
  let steps: string[]
  if (level === 3 && near - b >= 1 && near - b <= 3) {
    steps = add
      ? [`Compensation: ${b} is close to ${near}.`, `${a} + ${near} = ${a + near}`, `${b} is ${near - b} less than ${near}, so take ${near - b} away: ${a + near} ${MINUS} ${near - b} = ${ans}`]
      : [`Compensation: ${b} is close to ${near}.`, `${a} ${MINUS} ${near} = ${a - near}`, `You took away ${near - b} too many, so add ${near - b} back: ${a - near} + ${near - b} = ${ans}`]
  } else if (b % 10 === 0) {
    steps = [`${b} is a whole number of tens, so jump ${add ? 'forward' : 'back'} ${b} from ${a}.`, `${a} ${add ? '+' : MINUS} ${b} = ${ans}`]
  } else {
    steps = add
      ? [`Split ${b} into ${tens} and ${b % 10}.`, `${a} + ${tens} = ${a + tens}`, `${a + tens} + ${b % 10} = ${ans}`]
      : [`Split ${b} into ${tens} and ${b % 10}.`, `${a} ${MINUS} ${tens} = ${a - tens}`, `${a - tens} ${MINUS} ${b % 10} = ${ans}`]
  }
  return q({
    prompt: `Calculate:${big(`${a} ${add ? '+' : MINUS} ${b}`)}`,
    answer: numA(ans),
    hint: add ? 'Jump the tens first, then the ones (or use a friendly number and adjust).' : 'Take away the tens first, then the ones (or use a friendly number and adjust).',
    steps,
  })
}

const as_inverse = (level: Level): Question => {
  const a = L(level, int(12, 60), int(35, 280), int(120, 640))
  const b = L(level, int(11, 39), int(18, 199), int(105, 359))
  const s = a + b
  if (level === 3) {
    const wrongBy = pick([10, 100, 2, -10])
    const claim = a + wrongBy
    const right = chance(0.4)
    const shown = right ? a : claim
    return q({
      prompt: `${name()} says that ${num(s)} ${MINUS} ${num(b)} = ${num(shown)}. Check using addition. Is this correct?`,
      answer: mcFixedA(['Yes, it is correct', 'No, it is not correct'], right ? 'Yes, it is correct' : 'No, it is not correct'),
      hint: 'Add the answer back on. You should get the starting number.',
      steps: [`Check: ${num(shown)} + ${num(b)} = ${num(shown + b)}`, right ? `That is ${num(s)}, so the subtraction is correct.` : `That is not ${num(s)}, so the subtraction is wrong. The answer should be ${num(a)}.`],
    })
  }
  const askSub = chance()
  return q({
    prompt: askSub ? `${num(a)} + ${num(b)} = ${num(s)}. Use this to work out:${big(`${num(s)} ${MINUS} ${num(b)}`)}` : `${num(s)} ${MINUS} ${num(a)} = ${num(b)}. Use this to work out:${big(`${num(b)} + ${num(a)}`)}`,
    answer: numA(askSub ? a : s),
    hint: 'Addition and subtraction undo each other. The three numbers make a fact family.',
    steps: askSub ? [`The fact family is ${num(a)}, ${num(b)} and ${num(s)}.`, `${num(s)} ${MINUS} ${num(b)} = ${num(a)}`] : [`The fact family is ${num(a)}, ${num(b)} and ${num(s)}.`, `${num(b)} + ${num(a)} = ${num(s)}`],
  })
}

const as_missing = (level: Level): Question => {
  if (level === 3) {
    // equal differences / equals as "the same as"
    if (chance()) {
      const a = int(41, 95)
      const b = int(12, a - 15)
      const k = int(1, 5)
      const ans = b + k
      return q({
        prompt: `Find the missing number. The equals sign means “is the same as”.${big(`${a} ${MINUS} ${b} = ${a + k} ${MINUS} ${sq}`)}`,
        answer: numA(ans),
        hint: 'If you add the same amount to both numbers, the difference stays the same.',
        steps: [`${a} ${MINUS} ${b} = ${a - b}`, `${a + k} is ${k} more than ${a}, so the number taken away must also be ${k} more.`, `${b} + ${k} = ${ans}. Check: ${a + k} ${MINUS} ${ans} = ${a - b}`],
      })
    }
    const a = int(23, 68)
    const b = int(14, 39)
    const c = Math.round((a + int(-6, 6)) / 10) * 10
    const ans = a + b - c
    if (ans <= 0) return as_missing(level)
    return q({
      prompt: `Find the missing number. The equals sign means “is the same as”.${big(`${a} + ${b} = ${c} + ${sq}`)}`,
      answer: numA(ans),
      hint: 'Work out the left side first. Both sides must have the same total.',
      steps: [`${a} + ${b} = ${a + b}`, `${c} + ${sq} must also equal ${a + b}.`, `${a + b} ${MINUS} ${c} = ${ans}`],
    })
  }
  const big_ = level === 2
  const a = big_ ? int(120, 600) : int(12, 60)
  const b = big_ ? int(30, 300) : int(5, 38)
  const form = pick(['a+?=s', '?+b=s', 's-?=a', '?-b=a'])
  const s = a + b
  const lhs = { 'a+?=s': `${num(a)} + ${sq} = ${num(s)}`, '?+b=s': `${sq} + ${num(b)} = ${num(s)}`, 's-?=a': `${num(s)} ${MINUS} ${sq} = ${num(a)}`, '?-b=a': `${sq} ${MINUS} ${num(b)} = ${num(a)}` }[form]
  const ans = form === 'a+?=s' ? b : form === '?+b=s' ? a : form === 's-?=a' ? b : s
  return q({
    prompt: `Find the missing number.${big(lhs!)}`,
    answer: numA(ans),
    hint: 'Use the opposite operation to find the missing number.',
    steps: [
      form === 'a+?=s' ? `${num(s)} ${MINUS} ${num(a)} = ${num(b)}` : form === '?+b=s' ? `${num(s)} ${MINUS} ${num(b)} = ${num(a)}` : form === 's-?=a' ? `${num(s)} ${MINUS} ${num(a)} = ${num(b)}` : `${num(a)} + ${num(b)} = ${num(s)}`,
      `The missing number is ${num(ans)}.`,
    ],
  })
}

const ITEMS: [string, number][] = [
  ['a sandwich', 650],
  ['a juice', 280],
  ['a muffin', 375],
  ['a banana', 95],
  ['a pencil', 120],
  ['a notebook', 345],
  ['a sticker sheet', 250],
  ['an apple', 85],
  ['a drink bottle', 895],
  ['a ruler', 175],
]

const as_money = (level: Level): Question => {
  if (level === 1) {
    if (chance()) {
      const d = int(1, 9)
      const c = pick([0, 5, 10, 20, 25, 50, 75, 95])
      const total = d * 100 + c
      return q({
        prompt: `How many cents are in ${cash(total)}?`,
        answer: numA(total),
        suffix: 'cents',
        hint: 'There are 100 cents in one dollar.',
        steps: [`${d} dollar${d > 1 ? 's' : ''} = ${d * 100} cents`, `${d * 100} + ${c} = ${total} cents`],
      })
    }
    const total = int(1, 9) * 100 + pick([5, 10, 20, 50, 60, 80, 95])
    return q({
      prompt: `Write ${total} cents in dollars and cents.`,
      answer: mcA(cash(total), [cash(total * 10), cash(Math.floor(total / 100) * 100 + (total % 100) / 10), `$${total}.00`]),
      hint: 'Every 100 cents makes one dollar.',
      steps: [`${total} cents = ${Math.floor(total / 100)} dollars and ${total % 100} cents = ${cash(total)}`],
    })
  }
  const [a, b] = sample(ITEMS, 2)
  if (level === 2) {
    const total = a[1] + b[1]
    return q({
      prompt: `${name()} buys ${a[0]} for ${cash(a[1])} and ${b[0]} for ${cash(b[1])}. What is the total cost?`,
      answer: numA(total / 100),
      prefix: '$',
      hint: 'Add the dollars, then the cents. 100 cents make another dollar.',
      steps: [`${cash(a[1])} + ${cash(b[1])}`, `= ${a[1]} cents + ${b[1]} cents = ${total} cents`, `= ${cash(total)}`],
    })
  }
  const paid = a[1] + b[1] <= 1000 ? 1000 : 2000
  const total = a[1] + b[1]
  const change = paid - total
  return q({
    prompt: `${name()} buys ${a[0]} for ${cash(a[1])} and ${b[0]} for ${cash(b[1])}, and pays with a ${cash(paid).replace('.00', '')} note. How much change should they get?`,
    answer: numA(change / 100),
    prefix: '$',
    hint: 'Find the total cost first, then count on (or subtract) to the amount paid.',
    steps: [`Total cost: ${cash(a[1])} + ${cash(b[1])} = ${cash(total)}`, `Change: ${cash(paid)} ${MINUS} ${cash(total)} = ${cash(change)}`],
  })
}

const as_problems = (level: Level): Question => {
  const who = name()
  const kind = pick(['join', 'take', 'compare'])
  const a = L(level, int(23, 68), int(125, 480), int(205, 760))
  const b = L(level, int(11, 29), int(45, 199), int(126, 380))
  if (kind === 'join') {
    const ctx = pick([
      [`${who} read ${a} pages last week and ${b} pages this week. How many pages did ${who} read altogether?`, 'pages'],
      [`A school canteen sold ${a} pies on Monday and ${b} pies on Tuesday. How many pies were sold on the two days?`, 'pies'],
      [`There are ${a} people on a train. At the next station ${b} more get on. How many people are on the train now?`, 'people'],
    ])
    return q({
      prompt: ctx[0],
      answer: numA(a + b),
      suffix: ctx[1],
      hint: 'The two amounts are joined together, so add.',
      steps: [`Bar model: one bar of ${a} and one bar of ${b} make the whole.`, `${a} + ${b} = ${a + b}`],
    })
  }
  if (kind === 'take') {
    const total = a + b
    const ctx = pick([
      [`A farmer had ${total} sheep and sold ${b} of them. How many sheep are left?`, 'sheep'],
      [`${who} had ${total} points in a game and lost ${b} points. How many points does ${who} have now?`, 'points'],
      [`A library had ${total} books on a shelf. ${b} books were borrowed. How many books are still on the shelf?`, 'books'],
    ])
    return q({
      prompt: ctx[0],
      answer: numA(a),
      suffix: ctx[1],
      hint: 'Some are taken away from the whole, so subtract.',
      steps: [`Bar model: the whole is ${total}; one part is ${b}.`, `${total} ${MINUS} ${b} = ${a}`],
    })
  }
  const longer = a + b
  const ctx = pick([
    [`The Murray cod in a pond is ${longer} mm long and a goldfish is ${a} mm long. How much longer is the cod?`, 'mm'],
    [`Year 3 collected ${longer} cans for recycling and Year 4 collected ${a} cans. How many more cans did Year 3 collect?`, 'cans'],
    [`${who} scored ${longer} points and ${name()} scored ${a} points. What is the difference between their scores?`, 'points'],
  ])
  return q({
    prompt: ctx[0],
    answer: numA(b),
    suffix: ctx[1],
    hint: 'Find the difference: subtract, or count on from the smaller number.',
    steps: [`Difference: ${longer} ${MINUS} ${a} = ${b}`, `Check by counting on: ${a} + ${b} = ${longer}`],
  })
}

// ------------------------------------------------------------------ Multiplication and division (A)

const md_patterns = (level: Level): Question => {
  if (level === 2 && chance(0.45)) {
    const n = int(100, 9999)
    const even = n % 2 === 0
    return q({
      prompt: `Is ${num(n)} odd or even?`,
      answer: mcFixedA(['Odd', 'Even'], even ? 'Even' : 'Odd'),
      hint: 'Look only at the ones digit.',
      steps: [`The ones digit is ${n % 10}.`, `${n % 10} is ${even ? 'even' : 'odd'}, so ${num(n)} is ${even ? 'even' : 'odd'}.`],
    })
  }
  if (level === 3) {
    const m = pick([2, 4, 5, 10])
    const k = int(6, 12)
    return q({
      prompt: `The multiples of ${m} are ${m}, ${2 * m}, ${3 * m}, ${4 * m}, … What is the ${k}th multiple of ${m}?`,
      answer: numA(k * m),
      hint: `The ${k}th multiple is ${k} groups of ${m}.`,
      steps: [`${k} ${TIMES} ${m} = ${k * m}`],
    })
  }
  const step = L(level, pick([2, 5, 10]), pick([3, 4, 25, 50, 100]), 0)
  const down = level === 2 && chance()
  const start = down ? int(8, 15) * step + int(0, step - 1) : int(0, 6) * step + (level === 2 ? int(0, 9) : 0)
  const seq = [0, 1, 2, 3].map((i) => start + (down ? -1 : 1) * i * step)
  const ans = start + (down ? -1 : 1) * 4 * step
  return q({
    prompt: `What number comes next in this pattern?${big(seq.map((x) => num(x)).join(', ') + ', ' + sq)}`,
    answer: numA(ans),
    hint: 'Find how much the numbers go up or down by each time.',
    steps: [`The pattern ${down ? 'decreases' : 'increases'} by ${step} each time.`, `${num(seq[3])} ${down ? MINUS : '+'} ${step} = ${num(ans)}`],
  })
}

const md_arrays = (level: Level): Question => {
  const f1 = pick([2, 4, 5, 10])
  const f2 = int(2, level === 1 ? 6 : 10)
  const [rows, cols] = chance() ? [f1, f2] : [f2, f1]
  if (level === 3) {
    const r = int(3, 6)
    const c = pick([4, 5, 6, 8, 10])
    return q({
      prompt: `Part of this array is covered by a card. How many dots are there in the whole array?`,
      diagram: D2.dotArray(r, c, { fromRow: 1, fromCol: 1 }),
      answer: numA(r * c),
      hint: 'Count the dots in the top row and down the first column. The card hides the rest of the rows.',
      steps: [`There are ${c} dots in each row and ${r} rows.`, `${r} ${TIMES} ${c} = ${r * c}`],
    })
  }
  if (level === 2) {
    const correct = `${rows} ${TIMES} ${cols} = ${rows * cols}`
    return q({
      prompt: 'Which number sentence matches this array?',
      diagram: D2.dotArray(rows, cols),
      answer: mcA(correct, [`${rows} + ${cols} = ${rows + cols}`, `${rows} ${TIMES} ${cols + 1} = ${rows * (cols + 1)}`, `${rows + 1} ${TIMES} ${cols} = ${(rows + 1) * cols}`]),
      hint: 'Count the rows and the number of dots in each row.',
      steps: [`There are ${rows} rows with ${cols} dots in each row.`, `${rows} ${TIMES} ${cols} = ${rows * cols}`],
    })
  }
  return q({
    prompt: 'How many dots are in this array?',
    diagram: D2.dotArray(rows, cols),
    answer: numA(rows * cols),
    hint: 'Count the rows, then count the dots in one row. Multiply.',
    steps: [`${rows} rows of ${cols}`, `${rows} ${TIMES} ${cols} = ${rows * cols}`],
  })
}

const md_facts = (level: Level): Question => {
  if (level === 3 && chance(0.4)) {
    const k = int(2, 10)
    const z = pick([0, 1])
    return q({
      prompt: `Calculate:${big(chance() ? `${k} ${TIMES} ${z}` : `${z} ${TIMES} ${k}`)}`,
      answer: numA(k * z),
      hint: z === 0 ? 'Any number of groups of zero is zero.' : 'Multiplying by 1 leaves the number the same.',
      steps: [z === 0 ? `${k} groups of 0 is 0.` : `${k} groups of 1 is ${k}.`],
    })
  }
  const f = L(level, pick([2, 5, 10]), pick([2, 4, 5, 10]), 4)
  const k = L(level, int(1, 10), int(2, 10), int(3, 10))
  const swap = chance()
  return q({
    prompt: `Calculate:${big(swap ? `${k} ${TIMES} ${f}` : `${f} ${TIMES} ${k}`)}`,
    answer: numA(f * k),
    hint: f === 4 ? 'Double, then double again.' : `Count by ${f}s.`,
    steps: f === 4 ? [`Double ${k}: ${2 * k}`, `Double again: ${4 * k}`] : [`Count by ${f}s, ${plural(k, 'time')}: ${Array.from({ length: Math.min(k, 10) }, (_, i) => (i + 1) * f).join(', ')}`, `${f} ${TIMES} ${k} = ${f * k}`],
  })
}

const md_division = (level: Level): Question => {
  const f = pick([2, 4, 5, 10])
  const k = int(2, 10)
  const p = f * k
  if (level === 1) {
    return q({
      prompt: `Calculate:${big(`${p} ${DIVIDE} ${f}`)}`,
      answer: numA(k),
      hint: `How many groups of ${f} make ${p}?`,
      steps: [`${k} ${TIMES} ${f} = ${p}`, `So ${p} ${DIVIDE} ${f} = ${k}`],
    })
  }
  if (level === 2) {
    const form = pick(['?xf', 'fx?', 'p/?'])
    const shown = form === '?xf' ? `${sq} ${TIMES} ${f} = ${p}` : form === 'fx?' ? `${f} ${TIMES} ${sq} = ${p}` : `${p} ${DIVIDE} ${sq} = ${f}`
    return q({
      prompt: `Find the missing number.${big(shown)}`,
      answer: numA(k),
      hint: 'Use the multiplication fact family.',
      steps: [`${k} ${TIMES} ${f} = ${p}`, `The missing number is ${k}.`],
    })
  }
  const correct = `${p} ${DIVIDE} ${k} = ${f}`
  return q({
    prompt: `${f} ${TIMES} ${k} = ${p}. Which division fact is in the same fact family?`,
    answer: mcA(correct, [`${p} ${DIVIDE} ${f + 1} = ${k}`, `${p} ${TIMES} ${k} = ${f}`, `${k} ${DIVIDE} ${f} = ${p}`]),
    hint: 'A fact family uses the same three numbers. The biggest number is divided.',
    steps: [`The numbers in the family are ${f}, ${k} and ${p}.`, `${p} ${DIVIDE} ${f} = ${k} and ${p} ${DIVIDE} ${k} = ${f}`],
  })
}

const md_problems = (level: Level): Question => {
  const who = name()
  const f = pick([2, 4, 5, 10])
  const k = int(2, 10)
  if (level === 1) {
    const ctx = pick([
      [`There are ${k} cars in a car park. Each car has 4 wheels. How many wheels are there?`, 4, 'wheels'],
      [`${who} has ${k} bags with ${f} marbles in each bag. How many marbles does ${who} have?`, f, 'marbles'],
      [`A box holds ${k} rows of ${f} eggs. How many eggs are in the box?`, f, 'eggs'],
    ] as [string, number, string][])
    return q({
      prompt: ctx[0],
      answer: numA(k * ctx[1]),
      suffix: ctx[2],
      hint: 'Equal groups: multiply the number of groups by the number in each group.',
      steps: [`${k} groups of ${ctx[1]}`, `${k} ${TIMES} ${ctx[1]} = ${k * ctx[1]}`],
    })
  }
  if (level === 2) {
    const total = f * k
    const share = chance()
    return q({
      prompt: share ? `${total} stickers are shared equally between ${f} friends. How many stickers does each friend get?` : `${total} students get into teams of ${f}. How many teams are there?`,
      answer: numA(k),
      suffix: share ? 'stickers' : 'teams',
      hint: share ? `Share ${total} into ${f} equal groups.` : `How many groups of ${f} are in ${total}?`,
      steps: [`${total} ${DIVIDE} ${f} = ${k}`, `Check: ${k} ${TIMES} ${f} = ${total}`],
    })
  }
  const times = pick([2, 4, 5, 10])
  const small = int(2, 9)
  const other = name()
  return q({
    prompt: `${other} has ${small} shells. ${who} has ${times} times as many shells as ${other}. How many shells does ${who} have?`,
    answer: numA(times * small),
    suffix: 'shells',
    hint: `“${times} times as many” means ${times} groups of ${small}.`,
    steps: [`${times} times as many as ${small}: ${times} ${TIMES} ${small}`, `= ${times * small} shells`],
  })
}

// ------------------------------------------------------------------ Fractions (A)

const FR_NAME: Record<number, string> = { 2: 'halves', 3: 'thirds', 4: 'quarters', 5: 'fifths', 8: 'eighths' }

const fr_name = (level: Level): Question => {
  const parts = L(level, pick([2, 3, 4]), pick([3, 4, 5, 8]), pick([3, 4, 5, 8]))
  const shaded = level === 1 ? 1 : int(1, parts - 1)
  if (level === 3) {
    const useCircle = chance()
    return q({
      prompt: `What fraction of the ${useCircle ? 'circle' : 'strip'} is <b>not</b> shaded?`,
      diagram: useCircle ? D2.circleParts(parts, shaded) : D2.fractionStrip(parts, shaded),
      answer: fracAnyA(parts - shaded, parts),
      hint: 'Count all the equal parts, then count the parts that are not shaded.',
      steps: [`There are ${parts} equal parts (${FR_NAME[parts]}).`, `${shaded} ${shaded === 1 ? 'is' : 'are'} shaded, so ${parts - shaded} ${parts - shaded === 1 ? 'is' : 'are'} not shaded.`, `${frac(parts - shaded, parts)} is not shaded.`],
    })
  }
  return q({
    prompt: 'What fraction of the strip is shaded?',
    diagram: D2.fractionStrip(parts, shaded),
    answer: fracAnyA(shaded, parts),
    hint: 'The bottom number is how many equal parts. The top number is how many are shaded.',
    steps: [`The strip is cut into ${parts} equal parts, so each part is one ${FR_NAME[parts].replace(/s$/, '').replace('halve', 'half')}.`, `${shaded} ${shaded === 1 ? 'part is' : 'parts are'} shaded: ${frac(shaded, parts)}.`],
  })
}

const fr_numberline = (level: Level): Question => {
  const parts = L(level, pick([2, 4]), pick([3, 4, 5, 8]), pick([4, 5, 8]))
  const k = int(1, parts - 1)
  if (level === 3) {
    // which letter shows the fraction
    const ks = shuffle(Array.from({ length: parts - 1 }, (_, i) => i + 1)).slice(0, 3)
    const letters = ['A', 'B', 'C']
    const target = ks[0]
    const marks = ks.map((v, i) => ({ value: v / parts, label: letters[i] })).sort((a, b) => a.value - b.value)
    const correctLetter = marks.find((m) => Math.abs(m.value - target / parts) < 1e-9)!.label
    return q({
      prompt: `Which letter is at ${frac(target, parts)} on the number line?`,
      diagram: D2.numberLine({ min: 0, max: 1, parts, labels: [0, 1], marks }),
      answer: mcFixedA(['A', 'B', 'C'], correctLetter),
      hint: `Count ${plural(target, 'jump')} of one-${FR_NAME[parts].replace(/s$/, '')} from 0.`,
      steps: [`The line from 0 to 1 is cut into ${parts} equal parts.`, `${frac(target, parts)} is ${plural(target, 'part')} from 0, which is at ${correctLetter}.`],
    })
  }
  return q({
    prompt: 'What fraction is at A?',
    diagram: D2.numberLine({ min: 0, max: 1, parts, labels: [0, 1], marks: [{ value: k / parts, label: 'A' }] }),
    answer: fracAnyA(k, parts),
    hint: 'Count the equal jumps from 0 to 1, then count the jumps from 0 to A.',
    steps: [`From 0 to 1 there are ${parts} equal jumps, so each jump is ${frac(1, parts)}.`, `A is ${k} jump${k > 1 ? 's' : ''} from 0, so A is at ${frac(k, parts)}.`],
  })
}

const fr_whole = (level: Level): Question => {
  const d = L(level, pick([2, 3, 4]), pick([3, 4, 8]), pick([3, 4, 5, 8]))
  if (level === 1) {
    return q({
      prompt: `How many ${FR_NAME[d]} make one whole?`,
      answer: numA(d),
      hint: 'The number of equal parts in the whole is the bottom number.',
      steps: [`${d} ${FR_NAME[d]} make one whole: ${frac(d, d)} = 1.`],
    })
  }
  const n = int(1, d - 1)
  if (level === 2) {
    return q({
      prompt: `What fraction must be added to ${frac(n, d)} to make one whole?`,
      answer: fracAnyA(d - n, d),
      hint: `One whole is ${frac(d, d)}.`,
      steps: [`One whole is ${frac(d, d)}.`, `${d} ${MINUS} ${n} = ${d - n}, so you need ${frac(d - n, d)} more.`],
    })
  }
  const who = name()
  const thing = pick(['pizza', 'cake', 'pie', 'block of chocolate'])
  return q({
    prompt: `${who} cut a ${thing} into ${d} equal pieces and ate ${n} of them. What fraction of the ${thing} is left?`,
    answer: fracAnyA(d - n, d),
    hint: 'The whole is all the pieces. Take away the pieces that were eaten.',
    steps: [`The whole ${thing} is ${frac(d, d)}.`, `${who} ate ${frac(n, d)}, so ${frac(d - n, d)} is left.`],
  })
}

// ------------------------------------------------------------------ topics

export const Y3A: Topic[] = [
  {
    id: 'y3-place-value',
    year: 3,
    title: 'Place value',
    strand: 'Number and algebra',
    outcomes: ['MA2-RN-01'],
    blurb: 'Read, write, order and partition numbers up to 4 digits, and place them on number lines.',
    colour: 205,
    skills: [
      {
        id: 'y3-pv-read',
        title: 'Reading and writing numbers',
        outcomes: ['MA2-RN-01'],
        summary: 'Write numbers up to 9999 in words and in digits.',
        learn: {
          intro: '<p>Each digit in a number has a <b>place</b>: thousands, hundreds, tens and ones. The place tells you what the digit is worth.</p>',
          keyPoints: ['4321 is four thousand, three hundred and twenty-one.', 'Use a 0 to hold an empty place: four thousand and fifty-six is 4056.', 'Read the thousands, then the hundreds, then the tens and ones.'],
          vocab: [
            ['digit', 'one of the symbols 0 to 9'],
            ['place value', 'what a digit is worth because of where it is'],
          ],
        },
        gen: pv_read,
        levels: { 1: '3-digit numbers', 2: '4-digit numbers, including zeros', 3: 'choose the words for a 4-digit number' },
      },
      {
        id: 'y3-pv-value',
        title: 'Place value of digits',
        outcomes: ['MA2-RN-01'],
        summary: 'Find the value of a digit, and how many tens or hundreds a number has.',
        learn: {
          intro: '<p>The same digit can be worth different amounts. In 3 <b>5</b>27 the 5 is worth 500 because it is in the hundreds place.</p>',
          keyPoints: ['10 ones = 1 ten, 10 tens = 1 hundred, 10 hundreds = 1 thousand.', '4 652 has 46 hundreds altogether, because 4 thousands = 40 hundreds.'],
        },
        gen: pv_value,
        levels: { 1: 'value of a digit in a 3-digit number', 2: 'value of a digit in a 4-digit number', 3: 'how many tens or hundreds altogether (regrouping)' },
      },
      {
        id: 'y3-pv-partition',
        title: 'Partitioning numbers',
        outcomes: ['MA2-RN-01'],
        summary: 'Split numbers into thousands, hundreds, tens and ones in standard and non-standard ways.',
        learn: {
          intro: '<p>Numbers can be split (partitioned) in many ways. 352 = 300 + 50 + 2, but also 352 = 2 hundreds + 15 tens + 2 ones.</p>',
          keyPoints: ['Standard form: 4 thousands, 3 hundreds, 7 tens, 2 ones = 4372.', 'Non-standard: 4372 = 43 hundreds + 72 ones.', 'You can always swap 1 of a place for 10 of the place to its right.'],
        },
        gen: pv_partition,
        levels: { 1: 'hundreds + tens + ones', 2: 'thousands, hundreds, tens and ones; more than 9 tens', 3: 'missing parts in non-standard partitions' },
      },
      {
        id: 'y3-pv-order',
        title: 'Ordering and counting',
        outcomes: ['MA2-RN-01'],
        summary: 'Compare and order numbers, find the number before or after, and count by tens and hundreds.',
        learn: {
          intro: '<p>To compare numbers, look at the biggest place first. 3 210 is larger than 2 987 because 3 thousands is more than 2 thousands.</p>',
          keyPoints: ['Ascending order means smallest to largest.', 'The number after 3 999 is 4 000.', 'Counting by tens from 1 285: 1 295, 1 305, 1 315 …'],
        },
        gen: pv_order,
        levels: { 1: 'larger number; before and after', 2: 'before/after with zeros and nines; ascending order', 3: 'count by tens and hundreds across a boundary' },
      },
      {
        id: 'y3-pv-numberline',
        title: 'Number lines',
        outcomes: ['MA2-RN-01'],
        summary: 'Read the value of a point on a number line.',
        learn: {
          intro: '<p>On a number line, equal steps show equal amounts. Work out what one step is worth, then count the steps.</p>',
          keyPoints: ['If 0 to 1000 is split into 10 equal steps, each step is 100.', 'Count the steps from the start to the point.'],
        },
        gen: pv_numberline,
        levels: { 1: '0 to 100 in tens', 2: '0 to 1000 in hundreds', 3: 'thousands lines such as 2000 to 3000' },
      },
    ],
  },
  {
    id: 'y3-addsub',
    year: 3,
    title: 'Addition and subtraction',
    strand: 'Number and algebra',
    outcomes: ['MA2-AR-01', 'MA2-AR-02'],
    blurb: 'Mental strategies, fact families, missing numbers, money and word problems with 2- and 3-digit numbers.',
    colour: 172,
    skills: [
      {
        id: 'y3-as-mental',
        title: 'Mental strategies',
        outcomes: ['MA2-AR-01'],
        summary: 'Add and subtract 2- and 3-digit numbers in your head.',
        learn: {
          intro: '<p>There are many ways to add and subtract in your head. Choose the one that makes the numbers easiest.</p>',
          keyPoints: ['Jump strategy: 47 + 35 → 47 + 30 = 77, then 77 + 5 = 82.', 'Bridging a ten: 38 + 7 → 38 + 2 = 40, then 40 + 5 = 45.', 'Compensation: 256 + 99 → 256 + 100 = 356, then take away 1 = 355.'],
        },
        gen: as_mental,
        levels: { 1: '2-digit, no bridging', 2: '2-digit, bridging a ten', 3: '3-digit, including compensation' },
      },
      {
        id: 'y3-as-inverse',
        title: 'Fact families and checking',
        outcomes: ['MA2-AR-01', 'MA2-AR-02'],
        summary: 'Use the link between addition and subtraction to solve and check problems.',
        learn: {
          intro: '<p>Addition and subtraction are <b>inverse</b> operations: one undoes the other. 45 + 27 = 72, so 72 − 27 = 45 and 72 − 45 = 27.</p>',
          keyPoints: ['A fact family uses the same three numbers.', 'Check a subtraction by adding the answer back on.'],
        },
        gen: as_inverse,
        levels: { 1: '2-digit fact families', 2: '3-digit fact families', 3: 'check a subtraction using addition' },
      },
      {
        id: 'y3-as-missing',
        title: 'Missing numbers',
        outcomes: ['MA2-AR-02'],
        summary: 'Find missing numbers in number sentences, using = to mean “the same as”.',
        learn: {
          intro: '<p>The equals sign means <b>the same as</b>. Both sides of a number sentence have the same value.</p>',
          keyPoints: ['48 + □ = 75: count on or subtract, 75 − 48 = 27.', '36 + 27 = 30 + □: both sides equal 63, so □ = 33.', 'Equal differences: 63 − 28 = 65 − 30.'],
        },
        gen: as_missing,
        levels: { 1: '2-digit missing numbers', 2: '3-digit missing numbers', 3: 'equal sums and equal differences' },
      },
      {
        id: 'y3-as-money',
        title: 'Money',
        outcomes: ['MA2-AR-01'],
        summary: 'Dollars and cents, totals and change.',
        learn: {
          intro: '<p>There are 100 cents in one dollar. We write dollars and cents with a point: $4.35 is 4 dollars and 35 cents.</p>',
          keyPoints: ['$2.05 is 205 cents.', 'To find change, count on from the cost to the amount paid.', 'Australian coins are 5c, 10c, 20c, 50c, $1 and $2.'],
        },
        gen: as_money,
        levels: { 1: 'dollars and cents', 2: 'total cost of two items', 3: 'change from $10 or $20' },
      },
      {
        id: 'y3-as-problems',
        title: 'Word problems',
        outcomes: ['MA2-AR-01'],
        summary: 'Decide whether to add or subtract, and solve.',
        learn: {
          intro: '<p>Read the problem and picture it. Are parts being joined (add), taken away (subtract), or compared (find the difference)?</p>',
          keyPoints: ['A bar model shows the whole and its parts.', 'Difference means how many more or how many fewer.'],
        },
        gen: as_problems,
        levels: { 1: '2-digit problems', 2: '3-digit problems', 3: 'larger 3-digit problems' },
      },
    ],
  },
  {
    id: 'y3-multdiv',
    year: 3,
    title: 'Multiplication and division',
    strand: 'Number and algebra',
    outcomes: ['MA2-MR-01', 'MA2-MR-02'],
    blurb: 'Patterns of multiples, arrays, facts for 2, 4, 5 and 10, division facts and problems.',
    colour: 265,
    skills: [
      {
        id: 'y3-md-patterns',
        title: 'Number patterns and multiples',
        outcomes: ['MA2-MR-01'],
        summary: 'Continue patterns, find multiples, and decide whether numbers are odd or even.',
        learn: {
          intro: '<p>A number pattern goes up or down by the same amount each time. Multiples of 5 are 5, 10, 15, 20 …</p>',
          keyPoints: ['Even numbers end in 0, 2, 4, 6 or 8.', 'The 7th multiple of 4 is 7 × 4 = 28.'],
        },
        gen: md_patterns,
        levels: { 1: 'counting patterns by 2, 5 and 10', 2: 'patterns up and down; odd and even', 3: 'the nth multiple' },
      },
      {
        id: 'y3-md-arrays',
        title: 'Arrays',
        outcomes: ['MA2-MR-01'],
        summary: 'Use rows and columns to see multiplication.',
        learn: {
          intro: '<p>An <b>array</b> is objects arranged in equal rows. 3 rows of 5 dots is 3 × 5 = 15.</p>',
          keyPoints: ['Rows go across; columns go down.', 'Turning an array shows 3 × 5 = 5 × 3.', 'If part of an array is covered, count one row and one column.'],
        },
        gen: md_arrays,
        levels: { 1: 'count an array', 2: 'match a number sentence', 3: 'partly covered arrays' },
      },
      {
        id: 'y3-md-facts',
        title: 'Multiplication facts',
        outcomes: ['MA2-MR-01'],
        summary: 'Facts for 2, 4, 5 and 10, and multiplying by 0 and 1.',
        learn: {
          intro: '<p>Knowing your facts makes harder problems easier. To multiply by 4, double and double again.</p>',
          keyPoints: ['× 2 is doubling.', '× 4 is double, then double again.', 'Any number × 1 is itself; any number × 0 is 0.'],
        },
        gen: md_facts,
        levels: { 1: '× 2, × 5, × 10', 2: '× 2, × 4, × 5, × 10', 3: '× 4 by doubling; × 0 and × 1' },
      },
      {
        id: 'y3-md-division',
        title: 'Division facts',
        outcomes: ['MA2-MR-01', 'MA2-MR-02'],
        summary: 'Use multiplication facts to divide and to find missing numbers.',
        learn: {
          intro: '<p>Division is the inverse of multiplication. 6 × 5 = 30, so 30 ÷ 5 = 6 and 30 ÷ 6 = 5.</p>',
          keyPoints: ['Think: how many groups of 5 make 30?', 'A fact family: 5 × 6 = 30, 6 × 5 = 30, 30 ÷ 5 = 6, 30 ÷ 6 = 5.'],
        },
        gen: md_division,
        levels: { 1: 'divide by 2, 4, 5 or 10', 2: 'missing numbers', 3: 'fact families' },
      },
      {
        id: 'y3-md-problems',
        title: 'Multiplication and division problems',
        outcomes: ['MA2-MR-01', 'MA2-MR-02'],
        summary: 'Equal groups, sharing, and “times as many”.',
        learn: {
          intro: '<p>Look for equal groups. Multiply to find the total; divide to share equally or to find how many groups.</p>',
          keyPoints: ['5 bags of 4 apples: 5 × 4 = 20.', '20 shared between 4: 20 ÷ 4 = 5 each.', '“3 times as many as 6” is 3 × 6 = 18.'],
        },
        gen: md_problems,
        levels: { 1: 'equal groups', 2: 'sharing and grouping', 3: '“times as many”' },
      },
    ],
  },
  {
    id: 'y3-fractions',
    year: 3,
    title: 'Fractions',
    strand: 'Number and algebra',
    outcomes: ['MA2-PF-01'],
    blurb: 'Halves, thirds, quarters, fifths and eighths of strips, shapes and number lines.',
    colour: 30,
    skills: [
      {
        id: 'y3-fr-name',
        title: 'Naming fractions',
        outcomes: ['MA2-PF-01'],
        summary: 'Name the fraction of a strip or shape that is shaded.',
        learn: {
          intro: '<p>A fraction tells you how many <b>equal</b> parts of a whole you have. 3/4 means 3 of 4 equal parts.</p>',
          keyPoints: ['The bottom number (denominator) is the number of equal parts.', 'The top number (numerator) is how many parts you are talking about.', 'The parts must be equal in size.'],
          vocab: [
            ['numerator', 'the top number of a fraction'],
            ['denominator', 'the bottom number of a fraction'],
          ],
        },
        gen: fr_name,
        levels: { 1: 'unit fractions: 1/2, 1/3, 1/4', 2: 'fractions such as 3/5 and 5/8', 3: 'fraction not shaded' },
      },
      {
        id: 'y3-fr-numberline',
        title: 'Fractions on a number line',
        outcomes: ['MA2-PF-01'],
        summary: 'Read and find fractions between 0 and 1 on a number line.',
        learn: {
          intro: '<p>A fraction is also a length. Cut the line from 0 to 1 into equal parts; each part is a unit fraction.</p>',
          keyPoints: ['If 0 to 1 has 4 equal jumps, each jump is 1/4.', '3/4 is 3 jumps from 0.'],
        },
        gen: fr_numberline,
        levels: { 1: 'halves and quarters', 2: 'thirds, quarters, fifths, eighths', 3: 'find the letter at a fraction' },
      },
      {
        id: 'y3-fr-whole',
        title: 'Making a whole',
        outcomes: ['MA2-PF-01'],
        summary: 'How many parts make one whole, and what is left.',
        learn: {
          intro: '<p>One whole is all of the equal parts: 2/2, 3/3, 4/4, 5/5 and 8/8 all equal 1.</p>',
          keyPoints: ['If you have 3/8, you need 5/8 more to make a whole.', 'Fractions with the same denominator are a fraction family.'],
        },
        gen: fr_whole,
        levels: { 1: 'parts in a whole', 2: 'what is needed to make a whole', 3: 'what is left (word problems)' },
      },
    ],
  },
]

