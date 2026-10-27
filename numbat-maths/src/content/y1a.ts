// Year 1 (Stage 1, Part A) — Whole numbers, Adding and subtracting, Equal groups
import type { Level, Question, Topic } from '@/lib/maths/types'
import { D2, L, MINUS, chance, int, mcA, mcFixedA, name, num, numA, pick, q, sample, shuffle } from './helpers'
import * as D3 from '@/lib/maths/diagrams3'
import { plural } from './s2'

const big = (s: string) => `<div class="big">${s}</div>`
const sq = '<span class="box">&#9633;</span>'
const seq = (xs: (number | string)[]) => big(xs.map((x) => (typeof x === 'number' ? num(x) : x)).join(', '))

// ------------------------------------------------------------------ Whole numbers (Representing whole numbers A)

const wn_count = (level: Level): Question => {
  if (level === 1) {
    const n = int(11, 98)
    const after = chance()
    return q({
      prompt: `What number comes ${after ? 'after' : 'before'} ${n}?`,
      answer: numA(after ? n + 1 : n - 1),
      hint: after ? 'Count on one.' : 'Count back one.',
      steps: [after ? `${n}, ${n + 1}. The number after ${n} is ${n + 1}.` : `${n - 1}, ${n}. The number before ${n} is ${n - 1}.`],
    })
  }
  if (level === 2) {
    const fwd = chance()
    const start = int(12, 115)
    const xs = Array.from({ length: 4 }, (_, i) => (fwd ? start + i : start + 3 - i))
    if (Math.max(...xs) > 120) return wn_count(level)
    const gap = int(1, 3)
    const shown = xs.map((x, i) => (i === gap ? sq : x))
    return q({
      prompt: `${fwd ? 'Count forwards' : 'Count backwards'} by ones. What is the missing number?${seq(shown)}`,
      answer: numA(xs[gap]),
      hint: fwd ? 'Each number is one more than the one before.' : 'Each number is one less than the one before.',
      steps: [`${xs.join(', ')}`, `The missing number is ${xs[gap]}.`],
    })
  }
  // crossing a ten or a hundred
  const base = pick([20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120])
  const after = base === 120 ? false : chance()
  const n = after ? base - 1 : base
  return q({
    prompt: `What number comes ${after ? 'after' : 'before'} ${n}?`,
    answer: numA(after ? n + 1 : n - 1),
    hint: after ? 'After a number ending in 9, the tens go up by one and the ones start again at 0.' : 'Before a number ending in 0, the ones are 9 and the tens go down by one.',
    steps: [after ? `${n}, ${n + 1}` : `${n - 1}, ${n}`, `The number ${after ? 'after' : 'before'} ${n} is ${after ? n + 1 : n - 1}.`],
  })
}

const wn_oddeven = (level: Level): Question => {
  if (level === 1) {
    const n = int(3, 14)
    const odd = n % 2 === 1
    return q({
      prompt: 'Put the counters in pairs. Is the number of counters odd or even?',
      diagram: D3.pairs(n),
      answer: mcFixedA(['odd', 'even'], odd ? 'odd' : 'even'),
      hint: 'If every counter has a partner, the number is even. If one is left over, it is odd.',
      steps: [`There are ${n} counters.`, odd ? 'One counter has no partner, so the number is odd.' : 'Every counter has a partner, so the number is even.'],
    })
  }
  if (level === 2) {
    const n = int(11, 60)
    const odd = n % 2 === 1
    return q({
      prompt: `Is ${n} odd or even?`,
      answer: mcFixedA(['odd', 'even'], odd ? 'odd' : 'even'),
      hint: 'Look at the ones digit. Even numbers end in 0, 2, 4, 6 or 8.',
      steps: [`${n} ends in ${n % 10}.`, odd ? `${n % 10} is odd, so ${n} is odd.` : `${n % 10} is even, so ${n} is even.`],
    })
  }
  const fwd = chance()
  const start = int(3, 40)
  const xs = Array.from({ length: 5 }, (_, i) => (fwd ? start + 2 * i : start + 8 - 2 * i))
  return q({
    prompt: `Count ${fwd ? 'forwards' : 'backwards'} by twos. What comes next?${seq([...xs.slice(0, 4), sq])}`,
    answer: numA(xs[4]),
    hint: fwd ? 'Add 2 each time.' : 'Take away 2 each time.',
    steps: [`${xs.slice(0, 4).join(', ')}: each number is 2 ${fwd ? 'more' : 'less'}.`, `${xs[3]} ${fwd ? '+' : MINUS} 2 = ${xs[4]}`],
  })
}

const wn_tens = (level: Level): Question => {
  if (level === 1) {
    const t = int(1, 9)
    const o = int(0, 9)
    return q({
      prompt: 'Each stick is a ten. Each small square is a one. What number is shown?',
      diagram: D3.baseTen(0, t, o),
      answer: numA(10 * t + o),
      hint: 'Count the tens: 10, 20, 30… Then count on the ones.',
      steps: [`${plural(t, 'ten')} = ${10 * t}`, o ? `${10 * t} and ${plural(o, 'one')} make ${10 * t + o}.` : `There are no ones, so the number is ${10 * t}.`],
    })
  }
  if (level === 2) {
    const kind = pick(['tens', 'teen', 'ones'])
    if (kind === 'teen') {
      const o = int(1, 9)
      return q({
        prompt: `What number is 1 ten and ${plural(o, 'one')}?`,
        answer: numA(10 + o),
        hint: '1 ten is 10. Count on the ones.',
        steps: [`10 + ${o} = ${10 + o}`],
      })
    }
    const n = int(21, 99)
    const t = Math.floor(n / 10)
    const o = n % 10
    if (kind === 'tens')
      return q({
        prompt: `Complete:${big(`${n} = ${sq} tens and ${plural(o, 'one')}`)}`,
        answer: numA(t),
        hint: 'The first digit tells you how many tens.',
        steps: [`${n} = ${t * 10} + ${o}`, `${t * 10} is ${plural(t, 'ten')}.`],
      })
    return q({
      prompt: `Complete:${big(`${n} = ${plural(t, 'ten')} and ${sq} ones`)}`,
      answer: numA(o),
      hint: 'The last digit tells you how many ones.',
      steps: [`${n} = ${t * 10} + ${o}`, `There ${o === 1 ? 'is 1 one' : `are ${o} ones`}.`],
    })
  }
  if (chance()) {
    const t = int(2, 9)
    const o = int(1, 9)
    const thing = pick(['marbles', 'pencils', 'blocks', 'shells'])
    return q({
      prompt: `There are ${t} bags with 10 ${thing} in each bag, and ${o} more ${thing}. How many ${thing} are there?`,
      answer: numA(10 * t + o),
      suffix: thing,
      hint: 'Count the bags by tens, then count on the extra ones.',
      steps: [`${t} bags of 10 = ${10 * t}`, `${10 * t} + ${o} = ${10 * t + o}`],
    })
  }
  // non-standard partition: fewer tens, more ones
  const t = int(2, 8)
  const o = int(0, 9)
  const n = 10 * t + o
  return q({
    prompt: `Complete:${big(`${n} = ${plural(t - 1, 'ten')} and ${sq} ones`)}`,
    answer: numA(10 + o),
    hint: 'One of the tens has been changed into 10 ones.',
    steps: [`${n} = ${plural(t, 'ten')} and ${plural(o, 'one')}.`, `Change 1 ten into 10 ones: ${plural(t - 1, 'ten')} and ${10 + o} ones.`],
  })
}

const wn_line = (level: Level): Question => {
  if (level === 1) {
    const v = int(1, 9) * 10
    return q({
      prompt: 'The number line goes from 0 to 100 in tens. What number is at A?',
      diagram: D2.numberLine({ min: 0, max: 100, parts: 10, labels: [0, 100], marks: [{ value: v, label: 'A' }] }),
      answer: numA(v),
      hint: 'Count the marks in tens: 10, 20, 30…',
      steps: [`A is ${plural(v / 10, 'jump')} of ten from 0.`, `A is at ${v}.`],
    })
  }
  if (level === 2) {
    let n = 0
    do n = int(12, 98)
    while (n % 10 === 0 || n % 10 === 5)
    const lo = Math.floor(n / 10) * 10
    const near = n % 10 < 5 ? lo : lo + 10
    return q({
      prompt: `Which ten is ${n} closest to?`,
      answer: mcFixedA([String(lo), String(lo + 10)], String(near)),
      diagram: D2.numberLine({ min: lo, max: lo + 10, parts: 10, labels: [lo, lo + 10], marks: [{ value: n, label: String(n) }] }),
      hint: `${n} is between ${lo} and ${lo + 10}. Which one is it nearer to?`,
      steps: [`${n} is ${n - lo} away from ${lo} and ${lo + 10 - n} away from ${lo + 10}.`, `It is closest to ${near}.`],
    })
  }
  const a = int(1, 9)
  let b = int(1, 9)
  while (b === a) b = int(1, 9)
  const opts = shuffle([10 * a + b, 10 * b + a, 10 * a + (b === 9 ? 0 : b + 1), 10 * b + (a === 0 ? 1 : a - 1)].filter((x, i, arr) => arr.indexOf(x) === i && x >= 10))
  const askBig = chance()
  const target = askBig ? Math.max(...opts) : Math.min(...opts)
  return q({
    prompt: `Which number is the ${askBig ? 'biggest' : 'smallest'}?`,
    answer: mcFixedA(opts.map(String), String(target)),
    hint: 'Look at the tens first. If the tens are the same, look at the ones.',
    steps: [`Compare the tens digits first.`, `The ${askBig ? 'biggest' : 'smallest'} is ${target}.`],
  })
}

// ------------------------------------------------------------------ Adding and subtracting (Combining and separating quantities A)

const as_bonds = (level: Level): Question => {
  if (level === 1) {
    const n = int(1, 9)
    return q({
      prompt: 'How many more counters are needed to fill the ten frame?',
      diagram: D3.tenFrames([{ n, cls: 'tfa' }]),
      answer: numA(10 - n),
      hint: 'Count the empty boxes.',
      steps: [`There ${n === 1 ? 'is 1 counter' : `are ${n} counters`}. A ten frame holds 10.`, `${n} + ${10 - n} = 10`],
    })
  }
  if (level === 2) {
    const total = int(5, 10)
    const a = int(1, total - 1)
    const first = chance()
    return q({
      prompt: `Find the missing number:${big(first ? `${a} + ${sq} = ${total}` : `${sq} + ${a} = ${total}`)}`,
      answer: numA(total - a),
      hint: `What goes with ${a} to make ${total}?`,
      steps: [`${a} and ${total - a} make ${total}.`, `${total} ${MINUS} ${a} = ${total - a}`],
    })
  }
  const pairs10 = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((x) => `${x} + ${10 - x}`)
  const notTen = sample(
    [
      [3, 6],
      [4, 5],
      [2, 7],
      [6, 3],
      [8, 1],
      [5, 4],
      [7, 4],
      [6, 5],
    ],
    1,
  )[0]
  const right = `${notTen[0]} + ${notTen[1]}`
  return q({
    prompt: 'Which one does <b>not</b> make 10?',
    answer: mcA(right, sample(pairs10, 3)),
    hint: 'Work out each one. Which total is not 10?',
    steps: [`${right} = ${notTen[0] + notTen[1]}, not 10.`],
  })
}

const as_count = (level: Level): Question => {
  if (level === 1) {
    const add = chance()
    const a = int(4, 15)
    const b = int(1, 3)
    if (!add && a - b < 1) return as_count(level)
    return q({
      prompt: `Calculate:${big(`${a} ${add ? '+' : MINUS} ${b}`)}`,
      answer: numA(add ? a + b : a - b),
      hint: add ? `Start at ${a} and count on ${b}.` : `Start at ${a} and count back ${b}.`,
      steps: [add ? `${a}… ${Array.from({ length: b }, (_, i) => a + i + 1).join(', ')}` : `${a}… ${Array.from({ length: b }, (_, i) => a - i - 1).join(', ')}`, `${a} ${add ? '+' : MINUS} ${b} = ${add ? a + b : a - b}`],
    })
  }
  if (level === 2) {
    const add = chance()
    const a = int(21, 89)
    const b = int(2, 5)
    return q({
      prompt: `Calculate:${big(`${a} ${add ? '+' : MINUS} ${b}`)}`,
      answer: numA(add ? a + b : a - b),
      hint: add ? `Start at ${a} and count on ${b}.` : `Start at ${a} and count back ${b}.`,
      steps: [add ? `${a}… ${Array.from({ length: b }, (_, i) => a + i + 1).join(', ')}` : `${a}… ${Array.from({ length: b }, (_, i) => a - i - 1).join(', ')}`, `${a} ${add ? '+' : MINUS} ${b} = ${add ? a + b : a - b}`],
    })
  }
  const who = name()
  const kind = pick(['join', 'take', 'difference'])
  const a = int(8, 19)
  const b = int(2, 7)
  if (kind === 'join')
    return q({
      prompt: `${who} has ${a} stickers. ${who} gets ${b} more. How many stickers does ${who} have now?`,
      answer: numA(a + b),
      suffix: 'stickers',
      hint: 'Getting more means add.',
      steps: [`${a} + ${b} = ${a + b}`],
    })
  if (kind === 'take')
    return q({
      prompt: `There are ${a} birds on a fence. ${b} fly away. How many birds are left?`,
      answer: numA(a - b),
      suffix: 'birds',
      hint: 'Flying away means take away.',
      steps: [`${a} ${MINUS} ${b} = ${a - b}`],
    })
  const c = a - b
  return q({
    prompt: `What is the difference between ${a} and ${c}?`,
    answer: numA(b),
    hint: `Count on from ${c} to ${a}.`,
    steps: [`From ${c} to ${a} is ${b}.`, `${a} ${MINUS} ${c} = ${b}`],
  })
}

const as_strat = (level: Level): Question => {
  if (level === 1) {
    const n = int(2, 10)
    return q({
      prompt: `Double ${n}. Calculate:${big(`${n} + ${n}`)}`,
      answer: numA(2 * n),
      hint: 'A double is a number added to itself.',
      steps: [`${n} + ${n} = ${2 * n}`],
    })
  }
  if (level === 2) {
    const n = int(3, 9)
    const [x, y] = chance() ? [n, n + 1] : [n + 1, n]
    return q({
      prompt: `Use a double to help. Calculate:${big(`${x} + ${y}`)}`,
      answer: numA(x + y),
      hint: `${x} + ${y} is one more than ${n} + ${n}.`,
      steps: [`${n} + ${n} = ${2 * n}`, `${x} + ${y} is 1 more: ${2 * n + 1}`],
    })
  }
  let a = 0
  let b = 0
  do {
    a = int(6, 9)
    b = int(3, 9)
  } while (a + b <= 10 || a + b > 18)
  const fill = 10 - a
  return q({
    prompt: `Make a ten to help. Calculate:${big(`${a} + ${b}`)}`,
    diagram: D3.tenFrames(
      [
        { n: a, cls: 'tfa' },
        { n: b, cls: 'tfb' },
      ],
      2,
    ),
    answer: numA(a + b),
    hint: `${a} needs ${fill} more to make 10. Split ${b} into ${fill} and ${b - fill}.`,
    steps: [`${a} + ${fill} = 10`, `${b} ${MINUS} ${fill} = ${b - fill} left over`, `10 + ${b - fill} = ${a + b}`],
  })
}

const as_equal = (level: Level): Question => {
  if (level === 1) {
    const a = int(1, 9)
    const b = int(1, 9)
    if (a === b) return as_equal(level)
    return q({
      prompt: `Find the missing number:${big(`${a} + ${b} = ${b} + ${sq}`)}`,
      answer: numA(a),
      hint: 'You can add numbers in any order and get the same answer.',
      steps: [`${a} + ${b} = ${a + b} and ${b} + ${a} = ${a + b}.`, `The missing number is ${a}.`],
    })
  }
  if (level === 2) {
    const total = int(5, 10)
    const a = int(1, total - 1)
    return q({
      prompt: `${a} + ${total - a} = ${total}. Use this to find:${big(`${total} ${MINUS} ${total - a} = ${sq}`)}`,
      answer: numA(a),
      hint: 'Adding and taking away are linked. Use the fact you know.',
      steps: [`${a} + ${total - a} = ${total}, so ${total} ${MINUS} ${total - a} = ${a}.`],
    })
  }
  let a = 0
  let b = 0
  let c = 0
  do {
    a = int(1, 7)
    b = int(1, 7)
    c = int(1, 9)
  } while (a + b - c < 1 || c === a || c === b || a + b > 10)
  return q({
    prompt: `The equals sign means “is the same as”. Find the missing number:${big(`${a} + ${b} = ${c} + ${sq}`)}`,
    answer: numA(a + b - c),
    hint: `Work out ${a} + ${b} first. Then find what goes with ${c} to make the same number.`,
    steps: [`${a} + ${b} = ${a + b}`, `${c} + ${a + b - c} = ${a + b}`, `The missing number is ${a + b - c}.`],
  })
}

// ------------------------------------------------------------------ Equal groups (Forming groups A)

const fg_skip = (level: Level): Question => {
  if (level === 1) {
    const step = pick([2, 5, 10])
    const k = int(0, 4)
    const xs = Array.from({ length: 5 }, (_, i) => (k + i) * step)
    return q({
      prompt: `Count by ${step}s. What comes next?${seq([...xs.slice(0, 4), sq])}`,
      answer: numA(xs[4]),
      hint: `Add ${step} each time.`,
      steps: [`${xs[3]} + ${step} = ${xs[4]}`],
    })
  }
  if (level === 2) {
    const step = pick([2, 3, 5, 10])
    const back = step !== 3 && chance(0.6)
    const k = int(back ? 5 : 1, back ? 10 : 6)
    const xs = Array.from({ length: 5 }, (_, i) => (back ? (k - i) * step : (k + i) * step))
    return q({
      prompt: `Count ${back ? 'backwards' : 'forwards'} by ${step}s. What comes next?${seq([...xs.slice(0, 4), sq])}`,
      answer: numA(xs[4]),
      hint: back ? `Take away ${step} each time.` : `Add ${step} each time.`,
      steps: [`${xs[3]} ${back ? MINUS : '+'} ${step} = ${xs[4]}`],
    })
  }
  const step = pick([2, 5, 10])
  const start = int(1, 9) + (step === 10 ? int(0, 3) * 10 : 0)
  const xs = Array.from({ length: 5 }, (_, i) => start + i * step)
  const gap = int(1, 3)
  return q({
    prompt: `Find the missing number in the pattern.${seq(xs.map((x, i) => (i === gap ? sq : x)))}`,
    answer: numA(xs[gap]),
    hint: 'Work out how much the pattern goes up by each time.',
    steps: [`The numbers go up by ${step} each time.`, `${xs[gap - 1]} + ${step} = ${xs[gap]}`],
  })
}

const fg_groups = (level: Level): Question => {
  const g = int(2, 5)
  const each = L(level, int(2, 5), pick([2, 5, 10]), pick([2, 5, 10]))
  if (level === 1) {
    const askGroups = chance()
    return q({
      prompt: askGroups ? 'How many groups are there?' : 'How many are in each group?',
      diagram: D3.equalGroups(g, each),
      answer: numA(askGroups ? g : each),
      hint: askGroups ? 'Count the circles.' : 'Count the counters in one circle.',
      steps: [`There ${g === 1 ? 'is' : 'are'} ${plural(g, 'group')} with ${each} in each group.`],
    })
  }
  if (level === 2) {
    return q({
      prompt: `There are ${g} groups of ${each}. How many altogether?`,
      diagram: each === 10 ? undefined : D3.equalGroups(g, each),
      answer: numA(g * each),
      hint: `Skip count by ${each}s.`,
      steps: [`${Array.from({ length: g }, (_, i) => (i + 1) * each).join(', ')}`, `${g} groups of ${each} is ${g * each}.`],
    })
  }
  const ctx = pick([
    ['bags', 'apples'],
    ['boxes', 'pencils'],
    ['plates', 'biscuits'],
    ['packets', 'stickers'],
  ])
  return q({
    prompt: `There are ${g} ${ctx[0]}. Each one has ${each} ${ctx[1]}. How many ${ctx[1]} are there altogether?`,
    answer: numA(g * each),
    suffix: ctx[1],
    hint: `Skip count by ${each}s, ${g} times.`,
    steps: [`${Array.from({ length: g }, (_, i) => (i + 1) * each).join(', ')}`, `There are ${g * each} ${ctx[1]}.`],
  })
}

const fg_share = (level: Level): Question => {
  if (level === 1) {
    const h = int(2, 9)
    return q({
      prompt: `Here are ${2 * h} counters. What is half of ${2 * h}?`,
      diagram: D3.pairs(2 * h),
      answer: numA(h),
      hint: 'Share the counters into 2 equal groups. Each row is half.',
      steps: [`${2 * h} shared into 2 equal groups is ${h} in each group.`, `Half of ${2 * h} is ${h}.`],
    })
  }
  if (level === 2) {
    const people = int(2, 4)
    const each = int(2, 5)
    const thing = pick(['strawberries', 'grapes', 'crayons', 'marbles'])
    return q({
      prompt: `${people * each} ${thing} are shared equally between ${people} children. How many does each child get?`,
      answer: numA(each),
      suffix: thing,
      hint: `Deal them out one at a time to ${people} children.`,
      steps: [`${people * each} shared into ${people} equal groups is ${each} in each group.`],
    })
  }
  const size = pick([2, 5, 10])
  const full = int(2, 4)
  const left = int(1, size - 1)
  const total = full * size + left
  const askLeft = chance()
  return q({
    prompt: `${total} apples are put into bags of ${size}. ${askLeft ? 'How many apples are left over?' : 'How many full bags are there?'}`,
    diagram: D3.equalGroups(full, size, left),
    answer: numA(askLeft ? left : full),
    hint: `Make groups of ${size}. Count the groups, then count what is left.`,
    steps: [`${plural(full, 'bag')} of ${size} use ${full * size} apples.`, `${total} ${MINUS} ${full * size} = ${left} left over.`],
  })
}

// ------------------------------------------------------------------ topics

export const Y1A: Topic[] = [
  {
    id: 'y1-numbers',
    year: 1,
    title: 'Numbers to 120',
    strand: 'Number and algebra',
    outcomes: ['MA1-RWN-01', 'MA1-RWN-02'],
    blurb: 'Count to 120, odd and even numbers, tens and ones, and number lines.',
    colour: 205,
    skills: [
      {
        id: 'y1-wn-count',
        title: 'Counting on and back',
        outcomes: ['MA1-RWN-01'],
        summary: 'Say the number before and after, and count by ones to 120.',
        learn: {
          intro: '<p>Counting on means saying the next number: 47, 48, 49. Counting back goes the other way: 49, 48, 47.</p>',
          keyPoints: ['After 39 comes 40.', 'After 99 comes 100.', 'Before 50 comes 49.'],
        },
        gen: wn_count,
        levels: { 1: 'before and after', 2: 'missing numbers', 3: 'crossing tens and hundreds' },
      },
      {
        id: 'y1-wn-oddeven',
        title: 'Odd and even',
        outcomes: ['MA1-RWN-01'],
        summary: 'Use pairs to tell odd from even, and count by twos.',
        learn: {
          intro: '<p>An <b>even</b> number of counters can be put in pairs with none left over. An <b>odd</b> number has one left over.</p>',
          keyPoints: ['Even numbers end in 0, 2, 4, 6 or 8.', 'Odd numbers end in 1, 3, 5, 7 or 9.'],
        },
        gen: wn_oddeven,
        levels: { 1: 'pairs of counters', 2: 'odd or even numbers', 3: 'count by twos' },
      },
      {
        id: 'y1-wn-tens',
        title: 'Tens and ones',
        outcomes: ['MA1-RWN-02'],
        summary: 'Group in tens and split two-digit numbers into tens and ones.',
        learn: {
          intro: '<p>Ten ones make one ten. 34 is 3 tens and 4 ones.</p>',
          keyPoints: ['Count tens: 10, 20, 30… then count on the ones.', '34 is also 2 tens and 14 ones.'],
        },
        gen: wn_tens,
        levels: { 1: 'read sticks and ones', 2: 'how many tens and ones', 3: 'bags of ten; regrouping' },
      },
      {
        id: 'y1-wn-line',
        title: 'Number lines and the nearest ten',
        outcomes: ['MA1-RWN-01'],
        summary: 'Place tens on a number line, find the nearest ten and order numbers.',
        learn: {
          intro: '<p>A number line shows numbers in order. Each jump of 10 lands on the next ten.</p>',
          keyPoints: ['37 is between 30 and 40, and nearer to 40.', 'To order numbers, look at the tens first.'],
        },
        gen: wn_line,
        levels: { 1: 'tens on a number line', 2: 'nearest ten', 3: 'biggest and smallest' },
      },
    ],
  },
  {
    id: 'y1-addsub',
    year: 1,
    title: 'Adding and taking away',
    strand: 'Number and algebra',
    outcomes: ['MA1-CSQ-01'],
    blurb: 'Bonds to 10, counting on and back, doubles, making ten and the equals sign.',
    colour: 172,
    skills: [
      {
        id: 'y1-as-bonds',
        title: 'Number bonds to 10',
        outcomes: ['MA1-CSQ-01'],
        summary: 'Find pairs of numbers that make 10 and numbers less than 10.',
        learn: {
          intro: '<p>A ten frame holds 10. If 7 boxes are full, 3 more make 10: 7 + 3 = 10.</p>',
          keyPoints: ['Pairs that make 10: 1 and 9, 2 and 8, 3 and 7, 4 and 6, 5 and 5.'],
        },
        gen: as_bonds,
        levels: { 1: 'fill the ten frame', 2: 'missing part', 3: 'which does not make 10' },
      },
      {
        id: 'y1-as-count',
        title: 'Counting on and back',
        outcomes: ['MA1-CSQ-01'],
        summary: 'Add and take away by counting on and counting back.',
        learn: {
          intro: '<p>To add a small number, start at the big number and count on. To take away, count back.</p>',
          keyPoints: ['add, plus: +', 'take away, minus: −', 'equals, is the same as: ='],
        },
        gen: as_count,
        levels: { 1: 'small numbers', 2: 'two-digit numbers', 3: 'word problems' },
      },
      {
        id: 'y1-as-strat',
        title: 'Doubles and making ten',
        outcomes: ['MA1-CSQ-01'],
        summary: 'Use doubles, near doubles and making ten to add.',
        learn: {
          intro: '<p>Doubles help with near doubles: 6 + 7 is one more than 6 + 6. Making ten helps too: 8 + 5 = 8 + 2 + 3 = 13.</p>',
          keyPoints: ['6 + 6 = 12, so 6 + 7 = 13.', 'Fill up to 10 first, then add the rest.'],
        },
        gen: as_strat,
        levels: { 1: 'doubles', 2: 'near doubles', 3: 'make a ten' },
      },
      {
        id: 'y1-as-equal',
        title: 'The equals sign',
        outcomes: ['MA1-CSQ-01'],
        summary: 'Use = to mean “is the same as”, and use related facts.',
        learn: {
          intro: '<p>The equals sign means both sides are the same amount. 4 + 3 = 5 + 2 because both sides make 7.</p>',
          keyPoints: ['3 + 5 = 5 + 3', 'If 6 + 2 = 8, then 8 − 2 = 6.'],
        },
        gen: as_equal,
        levels: { 1: 'turnarounds', 2: 'related facts', 3: 'both sides the same' },
      },
    ],
  },
  {
    id: 'y1-groups',
    year: 1,
    title: 'Equal groups and sharing',
    strand: 'Number and algebra',
    outcomes: ['MA1-FG-01'],
    blurb: 'Skip counting by 2s, 3s, 5s and 10s, equal groups, halves and sharing.',
    colour: 265,
    skills: [
      {
        id: 'y1-fg-skip',
        title: 'Skip counting',
        outcomes: ['MA1-FG-01'],
        summary: 'Count by twos, threes, fives and tens, and find missing numbers.',
        learn: {
          intro: '<p>Skip counting jumps by the same amount each time: 5, 10, 15, 20.</p>',
          keyPoints: ['By 2s: 2, 4, 6, 8…', 'By 10s: 10, 20, 30…', 'Count backwards too: 50, 45, 40…'],
        },
        gen: fg_skip,
        levels: { 1: 'forwards by 2s, 5s, 10s', 2: 'backwards; by 3s', 3: 'missing numbers in a pattern' },
      },
      {
        id: 'y1-fg-groups',
        title: 'Equal groups',
        outcomes: ['MA1-FG-01'],
        summary: 'Describe groups and find how many altogether.',
        learn: {
          intro: '<p>3 groups of 5 means 3 groups with 5 in each group. Skip count to find the total: 5, 10, 15.</p>',
          keyPoints: ['Number of groups: count the circles.', 'Number in each group: count inside one circle.'],
        },
        gen: fg_groups,
        levels: { 1: 'how many groups, how many in each', 2: 'how many altogether', 3: 'word problems' },
      },
      {
        id: 'y1-fg-share',
        title: 'Halves and sharing',
        outcomes: ['MA1-FG-01'],
        summary: 'Find half of a collection, share equally and find what is left over.',
        learn: {
          intro: '<p>Sharing equally means everyone gets the same. Half of 10 is 5, because 10 shared into 2 equal groups is 5 each.</p>',
          keyPoints: ['Deal out one at a time to share.', 'Sometimes some are left over.'],
        },
        gen: fg_share,
        levels: { 1: 'half of a collection', 2: 'share equally', 3: 'groups and left over' },
      },
    ],
  },
]
