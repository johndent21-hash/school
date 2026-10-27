// Year 2 (Stage 1, Part B) — Numbers to 1000, Adding and subtracting, Multiplying and dividing
import type { Level, Question, Topic } from '@/lib/maths/types'
import { D2, MINUS, chance, int, mcFixedA, name, num, numA, pick, q, shuffle } from './helpers'
import * as D3 from '@/lib/maths/diagrams3'
import { plural } from './s2'

const big = (s: string) => `<div class="big">${s}</div>`
const sq = '<span class="box">&#9633;</span>'
const seq = (xs: (number | string)[]) => big(xs.map((x) => (typeof x === 'number' ? num(x) : x)).join(', '))
const digit = (n: number, p: number) => Math.floor(n / 10 ** p) % 10
const PLACE = ['ones', 'tens', 'hundreds']

// ------------------------------------------------------------------ Numbers to 1000 (Representing whole numbers B)

const wn_count = (level: Level): Question => {
  if (level === 1) {
    const edge = chance(0.35)
    const n = edge ? pick([int(1, 9) * 100, int(10, 99) * 10, int(1, 8) * 100 + 99, int(10, 98) * 10 + 9]) : int(101, 998)
    const after = chance()
    if (n + 1 > 999 || n - 1 < 100) return wn_count(level)
    return q({
      prompt: `What number comes ${after ? 'after' : 'before'} ${n}?`,
      answer: numA(after ? n + 1 : n - 1),
      hint: after ? 'Count on one. Watch for the ones going past 9.' : 'Count back one. Watch for the ones going below 0.',
      steps: [after ? `${n}, ${n + 1}` : `${n - 1}, ${n}`, `The number ${after ? 'after' : 'before'} ${n} is ${after ? n + 1 : n - 1}.`],
    })
  }
  if (level === 2) {
    const fwd = chance()
    const start = chance() ? int(11, 60) : int(101, 900)
    const xs = Array.from({ length: 5 }, (_, i) => (fwd ? start + 10 * i : start + 40 - 10 * i))
    return q({
      prompt: `Count ${fwd ? 'forwards' : 'backwards'} by tens. What comes next?${seq([...xs.slice(0, 4), sq])}`,
      answer: numA(xs[4]),
      hint: fwd ? 'The tens digit goes up by one each time. The ones stay the same.' : 'The tens digit goes down by one each time. The ones stay the same.',
      steps: [`${xs[3]} ${fwd ? '+' : MINUS} 10 = ${xs[4]}`],
    })
  }
  let n = 0
  do n = chance() ? int(12, 98) : int(102, 998)
  while (n % 10 === 0)
  const next = Math.ceil(n / 10) * 10
  return q({
    prompt: `How many more make the next ten?${big(`${n} + ${sq} = ${next}`)}`,
    answer: numA(next - n),
    hint: `Count on from ${n} to ${next}.`,
    steps: [`${n} has ${plural(n % 10, 'one')}. ${n % 10} + ${10 - (n % 10)} = 10.`, `${n} + ${next - n} = ${next}`],
  })
}

const wn_place = (level: Level): Question => {
  if (level === 1) {
    const h = int(1, 3)
    const t = int(0, 9)
    const o = int(0, 9)
    return q({
      prompt: 'Each big square is 100. Each stick is 10. Each small square is 1. What number is shown?',
      diagram: D3.baseTen(h, t, o),
      answer: numA(100 * h + 10 * t + o),
      hint: 'Count the hundreds, then the tens, then the ones.',
      steps: [`${plural(h, 'hundred')}, ${plural(t, 'ten')} and ${plural(o, 'one')}.`, `${100 * h} + ${10 * t} + ${o} = ${100 * h + 10 * t + o}`],
    })
  }
  if (level === 2) {
    let n = 0
    do n = int(102, 987)
    while (new Set(String(n)).size < 3 || String(n).includes('0'))
    const p = int(0, 2)
    const d = digit(n, p)
    return q({
      prompt: `In ${n}, how much is the ${d} worth?`,
      answer: numA(d * 10 ** p),
      hint: 'Is the digit in the hundreds, tens or ones place?',
      steps: [`The ${d} is in the ${PLACE[p]} place.`, `It is worth ${num(d * 10 ** p)}.`],
    })
  }
  const kind = pick(['tens', 'hundreds', 'regroup'])
  if (kind === 'tens') {
    const n = int(120, 980)
    const t = Math.floor(n / 10)
    return q({
      prompt: `Complete:${big(`${n} = ${sq} tens and ${plural(n % 10, 'one')}`)}`,
      answer: numA(t),
      hint: 'Every hundred is 10 tens.',
      steps: [`${n} = ${t * 10} + ${n % 10}`, `${t * 10} is ${t} tens.`],
    })
  }
  if (kind === 'hundreds') {
    const h = int(2, 9)
    return q({
      prompt: `How many tens are in ${h} hundreds?`,
      answer: numA(10 * h),
      hint: '1 hundred is 10 tens.',
      steps: [`${h} hundreds = ${h * 100} = ${10 * h} tens.`],
    })
  }
  const h = int(1, 7)
  const t = int(10, 19)
  const o = int(0, 9)
  return q({
    prompt: `What number is ${plural(h, 'hundred')}, ${t} tens and ${plural(o, 'one')}?`,
    answer: numA(100 * h + 10 * t + o),
    hint: '10 tens make 1 hundred.',
    steps: [`${t} tens = ${10 * t}`, `${100 * h} + ${10 * t} + ${o} = ${100 * h + 10 * t + o}`],
  })
}

const wn_nearest = (level: Level): Question => {
  if (level === 1) {
    let n = 0
    do n = chance() ? int(12, 98) : int(101, 998)
    while (n % 10 === 0 || n % 10 === 5)
    const lo = Math.floor(n / 10) * 10
    const near = n % 10 < 5 ? lo : lo + 10
    return q({
      prompt: `What is the nearest ten to ${n}?`,
      answer: numA(near),
      hint: `${n} is between ${lo} and ${lo + 10}. Which is closer?`,
      steps: [`${n} is ${n - lo} from ${lo} and ${lo + 10 - n} from ${lo + 10}.`, `The nearest ten is ${near}.`],
    })
  }
  if (level === 2) {
    let n = 0
    do n = int(110, 990)
    while (n % 100 === 0 || n % 100 === 50)
    const lo = Math.floor(n / 100) * 100
    const near = n % 100 < 50 ? lo : lo + 100
    return q({
      prompt: `What is the nearest hundred to ${n}?`,
      diagram: D2.numberLine({ min: lo, max: lo + 100, parts: 10, labels: [lo, lo + 50, lo + 100], marks: [{ value: n, label: String(n) }] }),
      answer: numA(near),
      hint: `${n} is between ${lo} and ${lo + 100}. Is it before or after the halfway point, ${lo + 50}?`,
      steps: [`${n} is ${n < lo + 50 ? 'before' : 'after'} ${lo + 50}, the halfway point.`, `The nearest hundred is ${near}.`],
    })
  }
  const ds = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3)
  const nums = [...new Set([ds.join(''), [ds[1], ds[0], ds[2]].join(''), [ds[2], ds[1], ds[0]].join(''), [ds[0], ds[2], ds[1]].join('')].map(Number))]
  const askBig = chance()
  const target = askBig ? Math.max(...nums) : Math.min(...nums)
  return q({
    prompt: `Which number is the ${askBig ? 'largest' : 'smallest'}?`,
    answer: mcFixedA(nums.map(String), String(target)),
    hint: 'Compare the hundreds first, then the tens, then the ones.',
    steps: ['Compare the hundreds digits first.', `The ${askBig ? 'largest' : 'smallest'} is ${target}.`],
  })
}

// ------------------------------------------------------------------ Adding and subtracting (Combining and separating quantities B)

const as_facts = (level: Level): Question => {
  if (level === 1) {
    const a = int(11, 19)
    return q({
      prompt: `Find the missing number:${big(`${a} + ${sq} = 20`)}`,
      answer: numA(20 - a),
      hint: `${a} is 10 and ${a - 10}. What goes with ${a - 10} to make 10?`,
      steps: [`${a - 10} + ${20 - a} = 10, so ${a} + ${20 - a} = 20.`],
    })
  }
  if (level === 2) {
    const a = int(5, 9)
    const b = int(4, 9)
    if (a + b <= 10) return as_facts(level)
    if (chance()) {
      return q({
        prompt: `Calculate:${big(`${a} + ${b}`)}`,
        answer: numA(a + b),
        hint: 'Make a ten first.',
        steps: [`${a} + ${10 - a} = 10`, `10 + ${b - (10 - a)} = ${a + b}`],
      })
    }
    return q({
      prompt: `Calculate:${big(`${a + b} ${MINUS} ${b}`)}`,
      answer: numA(a),
      hint: `Think addition: ${b} + what = ${a + b}?`,
      steps: [`${b} + ${a} = ${a + b}`, `So ${a + b} ${MINUS} ${b} = ${a}.`],
    })
  }
  const a = int(4, 9)
  const b = int(4, 9)
  if (chance()) {
    return q({
      prompt: `${a} + ${b} = ${a + b}. Use this fact to find:${big(`${a + b} ${MINUS} ${a} = ${sq}`)}`,
      answer: numA(b),
      hint: 'Adding and taking away are linked.',
      steps: [`${a} + ${b} = ${a + b}, so ${a + b} ${MINUS} ${a} = ${b}.`],
    })
  }
  const lo = int(5, 12)
  const d = int(4, 8)
  return q({
    prompt: `What is the difference between ${lo} and ${lo + d}?`,
    answer: numA(d),
    hint: `Count on from ${lo} to ${lo + d}.`,
    steps: [`${lo} + ${d} = ${lo + d}, so the difference is ${d}.`],
  })
}

const as_two = (level: Level): Question => {
  if (level === 1) {
    let a = 0
    let b = 0
    do {
      a = int(13, 88)
      b = int(3, 9)
    } while ((a % 10) + b <= 10 || a % 10 === 0)
    const fill = 10 - (a % 10)
    return q({
      prompt: `Calculate:${big(`${a} + ${b}`)}`,
      answer: numA(a + b),
      hint: `Build to the next ten first: ${a} + ${fill} = ${a + fill}.`,
      steps: [`${a} + ${fill} = ${a + fill}`, `${b} ${MINUS} ${fill} = ${b - fill} more`, `${a + fill} + ${b - fill} = ${a + b}`],
    })
  }
  if (level === 2) {
    let a = 0
    let b = 0
    do {
      a = int(12, 68)
      b = int(11, 39)
    } while (a + b > 99 || a % 10 === 0 || b % 10 === 0)
    const tens = Math.floor(a / 10) * 10 + Math.floor(b / 10) * 10
    const ones = (a % 10) + (b % 10)
    return q({
      prompt: `Split into tens and ones to add:${big(`${a} + ${b}`)}`,
      answer: numA(a + b),
      hint: 'Add the tens, then add the ones, then put them together.',
      steps: [`Tens: ${Math.floor(a / 10) * 10} + ${Math.floor(b / 10) * 10} = ${tens}`, `Ones: ${a % 10} + ${b % 10} = ${ones}`, `${tens} + ${ones} = ${a + b}`],
    })
  }
  let a = 0
  let b = 0
  do {
    a = int(41, 95)
    b = int(14, a - 12)
  } while (b % 10 === 0 || a % 10 === 0 || a % 10 >= b % 10)
  const toTen = Math.ceil(b / 10) * 10
  const toTens = Math.floor(a / 10) * 10
  return q({
    prompt: `Count up from the smaller number to subtract:${big(`${a} ${MINUS} ${b}`)}`,
    answer: numA(a - b),
    diagram: D2.numberLine({ min: Math.floor(b / 10) * 10, max: Math.ceil(a / 10) * 10, parts: (Math.ceil(a / 10) - Math.floor(b / 10)), labels: [Math.floor(b / 10) * 10, Math.ceil(a / 10) * 10], marks: [{ value: b, label: String(b) }, { value: a, label: String(a) }] }),
    hint: `Jump from ${b} to ${toTen}, then to ${toTens}, then to ${a}. Add up the jumps.`,
    steps: [`${b} → ${toTen}: ${toTen - b}`, `${toTen} → ${toTens}: ${toTens - toTen}`, `${toTens} → ${a}: ${a - toTens}`, `${toTen - b} + ${toTens - toTen} + ${a - toTens} = ${a - b}`],
  })
}

const as_problems = (level: Level): Question => {
  const who = name()
  if (level === 1) {
    const a = int(23, 65)
    const b = int(11, 30)
    if (chance()) {
      return q({
        prompt: `${who} has ${a} marbles. ${who} wins ${b} more. How many marbles does ${who} have now?`,
        answer: numA(a + b),
        suffix: 'marbles',
        hint: 'Winning more means add.',
        steps: [`${a} + ${b} = ${a + b}`],
      })
    }
    return q({
      prompt: `There are ${a + b} people on a bus. ${b} get off. How many people are still on the bus?`,
      answer: numA(a),
      suffix: 'people',
      hint: 'Getting off means take away.',
      steps: [`${a + b} ${MINUS} ${b} = ${a}`],
    })
  }
  if (level === 2) {
    const a = int(25, 70)
    const b = int(a + 6, 99)
    const [x, y] = ['red', 'blue']
    return q({
      prompt: `The class collected ${a} ${x} bottle tops and ${b} ${y} bottle tops. How many more ${y} tops than ${x} tops?`,
      answer: numA(b - a),
      hint: 'Find the difference.',
      steps: [`${b} ${MINUS} ${a} = ${b - a}`],
    })
  }
  const a = int(30, 60)
  const g = int(10, 20)
  const r = int(5, 25)
  return q({
    prompt: `${who} had ${a} stickers. ${who} gave ${g} to a friend, then got ${r} more. How many stickers does ${who} have now?`,
    answer: numA(a - g + r),
    suffix: 'stickers',
    hint: 'Do it in two steps.',
    steps: [`${a} ${MINUS} ${g} = ${a - g}`, `${a - g} + ${r} = ${a - g + r}`],
  })
}

const as_equal = (level: Level): Question => {
  if (level === 1) {
    if (chance()) {
      const a = int(5, 9)
      const t = int(11, 18)
      return q({
        prompt: `Find the missing number:${big(`${sq} + ${a} = ${t}`)}`,
        answer: numA(t - a),
        hint: `What goes with ${a} to make ${t}?`,
        steps: [`${t} ${MINUS} ${a} = ${t - a}`],
      })
    }
    const m = int(3, 9)
    return q({
      prompt: `Find the missing number:${big(`20 ${MINUS} ${sq} = ${20 - m}`)}`,
      answer: numA(m),
      hint: `How far is it from ${20 - m} to 20?`,
      steps: [`${20 - m} + ${m} = 20, so 20 ${MINUS} ${m} = ${20 - m}.`],
    })
  }
  if (level === 2) {
    const a = int(6, 9)
    const b = int(5, 9)
    const c = int(3, 9)
    const d = a + b - c
    if (d < 1 || c === a || c === b || d > 12) return as_equal(level)
    return q({
      prompt: `Both sides must be the same. Find the missing number:${big(`${a} + ${b} = ${c} + ${sq}`)}`,
      answer: numA(d),
      hint: `Work out ${a} + ${b} first.`,
      steps: [`${a} + ${b} = ${a + b}`, `${c} + ${d} = ${a + b}`],
    })
  }
  const a = int(21, 69)
  const b = int(11, 29)
  if (chance()) {
    return q({
      prompt: `${a} + ${b} = ${a + b}. Use this to find:${big(`${a} + ${b + 1} = ${sq}`)}`,
      answer: numA(a + b + 1),
      hint: `${b + 1} is one more than ${b}, so the answer is one more.`,
      steps: [`${a} + ${b + 1} is 1 more than ${a} + ${b}.`, `${a + b} + 1 = ${a + b + 1}`],
    })
  }
  const k = int(1, 3)
  return q({
    prompt: `Find the missing number:${big(`${a} + ${b} = ${a - k} + ${sq}`)}`,
    answer: numA(b + k),
    hint: `${a} went down by ${k}. What must happen to ${b}?`,
    steps: [`${a} went down by ${k}, so ${b} must go up by ${k}.`, `${b} + ${k} = ${b + k}`],
  })
}

// ------------------------------------------------------------------ Multiplying and dividing (Forming groups B)

const fg_arrays = (level: Level): Question => {
  const r = int(2, 5)
  let c = int(2, 6)
  if (level === 1) {
    if (r === c) c = c === 6 ? 5 : c + 1
    const askRows = chance()
    return q({
      prompt: askRows ? 'How many rows are in this array?' : 'How many dots are in each row?',
      diagram: D2.dotArray(r, c),
      answer: numA(askRows ? r : c),
      hint: 'Rows go across. Count down the side for rows, or along one row.',
      steps: [`There are ${plural(r, 'row')} with ${c} in each row.`],
    })
  }
  if (level === 2) {
    return q({
      prompt: 'How many dots are in this array?',
      diagram: D2.dotArray(r, c),
      answer: numA(r * c),
      hint: 'Add the rows: count one row, then add it again for each row.',
      steps: [`${r} rows of ${c}: ${Array.from({ length: r }, () => c).join(' + ')} = ${r * c}`],
    })
  }
  if (chance()) {
    if (r === c) return fg_arrays(level)
    return q({
      prompt: `Turn the array around. ${r} rows of ${c} is the same as ${c} rows of how many?`,
      diagram: D2.dotArray(r, c),
      answer: numA(r),
      hint: 'Turning the array makes the rows into columns. The total stays the same.',
      steps: [`${r} rows of ${c} = ${r * c}`, `${c} rows of ${r} = ${r * c}`],
    })
  }
  return q({
    prompt: `${r * c} dots are put into ${r} equal rows. How many dots are in each row?`,
    diagram: D2.dotArray(r, c),
    answer: numA(c),
    hint: `Share ${r * c} into ${r} equal rows.`,
    steps: [`${r} rows of ${c} make ${r * c}, so each row has ${c}.`],
  })
}

const fg_halves = (level: Level): Question => {
  if (level === 1) {
    if (chance()) {
      const n = int(6, 25)
      return q({ prompt: `What is double ${n}?`, answer: numA(2 * n), hint: `${n} + ${n}`, steps: [`${n} + ${n} = ${2 * n}`] })
    }
    const h = int(4, 20)
    return q({ prompt: `What is half of ${2 * h}?`, answer: numA(h), hint: `Share ${2 * h} into 2 equal groups.`, steps: [`${h} + ${h} = ${2 * h}, so half of ${2 * h} is ${h}.`] })
  }
  if (level === 2) {
    const k = int(2, 5)
    return q({
      prompt: `${4 * k} counters are shared into 4 equal groups. What is a quarter of ${4 * k}?`,
      diagram: D3.equalGroups(4, k),
      answer: numA(k),
      hint: 'A quarter is one of 4 equal groups.',
      steps: [`${4 * k} shared into 4 equal groups is ${k} in each group.`, `A quarter of ${4 * k} is ${k}.`],
    })
  }
  const kind = pick(['half', 'quarter', 'eighth'])
  const part = int(2, kind === 'eighth' ? 3 : 9)
  const parts = kind === 'half' ? 2 : kind === 'quarter' ? 4 : 8
  return q({
    prompt: `${kind === 'half' ? 'Half' : kind === 'quarter' ? 'A quarter' : 'An eighth'} of a bag of marbles is ${part} marbles. How many marbles are in the whole bag?`,
    answer: numA(part * parts),
    hint: `The whole bag has ${parts} equal parts.`,
    steps: [`The whole is ${parts} parts of ${part}.`, `${Array.from({ length: parts }, () => part).join(' + ')} = ${part * parts}`],
  })
}

const fg_problems = (level: Level): Question => {
  if (level === 1) {
    const each = pick([2, 5, 10])
    const g = int(2, 6)
    const ctx = pick([
      ['bags', 'oranges'],
      ['boxes', 'crayons'],
      ['vases', 'flowers'],
    ])
    return q({
      prompt: `There are ${g} ${ctx[0]} with ${each} ${ctx[1]} in each. How many ${ctx[1]} altogether?`,
      answer: numA(g * each),
      suffix: ctx[1],
      hint: `Skip count by ${each}s.`,
      steps: [`${Array.from({ length: g }, (_, i) => (i + 1) * each).join(', ')}`],
    })
  }
  if (level === 2) {
    const size = pick([2, 5, 10])
    const k = int(2, 6)
    if (chance()) {
      return q({
        prompt: `${size * k} pencils are put into boxes of ${size}. How many boxes are needed?`,
        answer: numA(k),
        suffix: 'boxes',
        hint: `How many groups of ${size} are in ${size * k}?`,
        steps: [`Skip count by ${size}s to ${size * k}: ${Array.from({ length: k }, (_, i) => (i + 1) * size).join(', ')}.`, `That is ${k} boxes.`],
      })
    }
    const kids = int(2, 5)
    const each = int(2, 6)
    return q({
      prompt: `${kids * each} grapes are shared equally between ${kids} children. How many grapes does each child get?`,
      answer: numA(each),
      suffix: 'grapes',
      hint: 'Deal them out one at a time.',
      steps: [`${kids * each} shared into ${kids} equal groups is ${each} each.`],
    })
  }
  const kids = int(2, 5)
  const each = int(2, 5)
  const left = int(1, kids - 1)
  const total = kids * each + left
  const askLeft = chance()
  return q({
    prompt: `${total} stickers are shared equally between ${kids} children. ${askLeft ? 'How many stickers are left over?' : 'How many stickers does each child get?'}`,
    answer: numA(askLeft ? left : each),
    suffix: 'stickers',
    hint: 'Share them out. Any that cannot be shared equally are left over.',
    steps: [`${kids} children with ${each} each use ${kids * each} stickers.`, `${total} ${MINUS} ${kids * each} = ${left} left over.`],
  })
}

// ------------------------------------------------------------------ topics

export const Y2A: Topic[] = [
  {
    id: 'y2-numbers',
    year: 2,
    title: 'Numbers to 1000',
    strand: 'Number and algebra',
    outcomes: ['MA1-RWN-01', 'MA1-RWN-02'],
    blurb: 'Counting by ones and tens, hundreds, tens and ones, and the nearest ten and hundred.',
    colour: 205,
    skills: [
      {
        id: 'y2-wn-count',
        title: 'Counting by ones and tens',
        outcomes: ['MA1-RWN-01'],
        summary: 'Count on and back by ones and tens, and find the next ten.',
        learn: {
          intro: '<p>Counting by tens changes the tens digit and keeps the ones the same: 47, 57, 67.</p>',
          keyPoints: ['After 199 comes 200.', '64 + 6 = 70: 6 more makes the next ten.'],
        },
        gen: wn_count,
        levels: { 1: 'before and after', 2: 'count by tens', 3: 'how many to the next ten' },
      },
      {
        id: 'y2-wn-place',
        title: 'Hundreds, tens and ones',
        outcomes: ['MA1-RWN-02'],
        summary: 'Read base-10 blocks and say what each digit is worth.',
        learn: {
          intro: '<p>In 352, the 3 is worth 300, the 5 is worth 50 and the 2 is worth 2.</p>',
          keyPoints: ['10 ones = 1 ten.', '10 tens = 1 hundred.', '352 is also 35 tens and 2 ones.'],
        },
        gen: wn_place,
        levels: { 1: 'read the blocks', 2: 'what a digit is worth', 3: 'renaming numbers' },
      },
      {
        id: 'y2-wn-nearest',
        title: 'Nearest ten, nearest hundred',
        outcomes: ['MA1-RWN-01'],
        summary: 'Find the nearest ten and hundred, and order numbers.',
        learn: {
          intro: '<p>To find the nearest hundred, look at which hundreds the number is between and which one it is closer to.</p>',
          keyPoints: ['238 is nearer to 200 than 300.', 'To order numbers, compare the hundreds first.'],
        },
        gen: wn_nearest,
        levels: { 1: 'nearest ten', 2: 'nearest hundred', 3: 'largest and smallest' },
      },
    ],
  },
  {
    id: 'y2-addsub',
    year: 2,
    title: 'Adding and taking away',
    strand: 'Number and algebra',
    outcomes: ['MA1-CSQ-01'],
    blurb: 'Facts to 20, adding and subtracting two-digit numbers, word problems and balancing.',
    colour: 172,
    skills: [
      {
        id: 'y2-as-facts',
        title: 'Facts to 20',
        outcomes: ['MA1-CSQ-01'],
        summary: 'Recall addition and subtraction facts to 20.',
        learn: {
          intro: '<p>Use facts you know: 8 + 7 = 15, so 15 − 7 = 8 and 15 − 8 = 7.</p>',
          keyPoints: ['Make a ten: 8 + 7 = 8 + 2 + 5 = 15.', 'Subtraction can be solved by adding on.'],
        },
        gen: as_facts,
        levels: { 1: 'bonds to 20', 2: 'facts to 20', 3: 'related facts; difference' },
      },
      {
        id: 'y2-as-two',
        title: 'Two-digit numbers',
        outcomes: ['MA1-CSQ-01'],
        summary: 'Add by building to ten or splitting tens and ones; subtract by counting up.',
        learn: {
          intro: '<p>47 + 5: jump to 50 first, then 2 more is 52. For 34 + 25, add the tens (50) and the ones (9): 59.</p>',
          keyPoints: ['Build to the next ten.', 'Split into tens and ones.', 'Count up to subtract: 63 − 28 is the jump from 28 to 63.'],
        },
        gen: as_two,
        levels: { 1: 'build to the next ten', 2: 'split tens and ones', 3: 'subtract by counting up' },
      },
      {
        id: 'y2-as-problems',
        title: 'Word problems',
        outcomes: ['MA1-CSQ-01'],
        summary: 'Decide whether to add or subtract, and solve.',
        learn: {
          intro: '<p>Read the story. Getting more means add. Giving away or getting off means take away. “How many more” means find the difference.</p>',
          keyPoints: ['Write a number sentence for the story.'],
        },
        gen: as_problems,
        levels: { 1: 'add or take away', 2: 'how many more', 3: 'two steps' },
      },
      {
        id: 'y2-as-equal',
        title: 'Missing numbers',
        outcomes: ['MA1-CSQ-01'],
        summary: 'Find missing numbers and keep both sides of = the same.',
        learn: {
          intro: '<p>The equals sign means both sides are the same. 8 + 7 = 10 + 5 because both make 15.</p>',
          keyPoints: ['Use number bonds to find a missing number.', 'If one number goes down, the other must go up by the same amount.'],
        },
        gen: as_equal,
        levels: { 1: 'one missing number', 2: 'both sides the same', 3: 'related problems' },
      },
    ],
  },
  {
    id: 'y2-groups',
    year: 2,
    title: 'Multiplying and dividing',
    strand: 'Number and algebra',
    outcomes: ['MA1-FG-01'],
    blurb: 'Arrays, doubling and halving, quarters and eighths of groups, and sharing with remainders.',
    colour: 265,
    skills: [
      {
        id: 'y2-fg-arrays',
        title: 'Arrays',
        outcomes: ['MA1-FG-01'],
        summary: 'Use rows and columns to multiply and divide.',
        learn: {
          intro: '<p>An <b>array</b> has equal rows. 3 rows of 4 is 4 + 4 + 4 = 12.</p>',
          keyPoints: ['Rows go across; columns go down.', '3 rows of 4 is the same total as 4 rows of 3.'],
        },
        gen: fg_arrays,
        levels: { 1: 'rows and how many in each', 2: 'how many altogether', 3: 'turn it around; divide' },
      },
      {
        id: 'y2-fg-halves',
        title: 'Doubles, halves, quarters and eighths',
        outcomes: ['MA1-FG-01'],
        summary: 'Double and halve, and find a quarter or eighth of a group.',
        learn: {
          intro: '<p>A half is one of 2 equal groups. A quarter is one of 4 equal groups. An eighth is one of 8 equal groups.</p>',
          keyPoints: ['Half of 12 is 6. A quarter of 12 is 3.', 'If half is 6, the whole is 12.'],
        },
        gen: fg_halves,
        levels: { 1: 'double and half', 2: 'a quarter of a group', 3: 'find the whole' },
      },
      {
        id: 'y2-fg-problems',
        title: 'Sharing and grouping problems',
        outcomes: ['MA1-FG-01'],
        summary: 'Solve multiplication and division problems, including what is left over.',
        learn: {
          intro: '<p>Sharing: how many does each person get? Grouping: how many groups can be made? Sometimes some are left over.</p>',
          keyPoints: ['17 shared between 5: 3 each and 2 left over.'],
        },
        gen: fg_problems,
        levels: { 1: 'equal groups', 2: 'sharing and grouping', 3: 'left over' },
      },
    ],
  },
]
