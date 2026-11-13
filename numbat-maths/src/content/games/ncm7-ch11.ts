// Class games for New Century Maths 7 (3rd edition, Cengage) Chapter 11, Probability: one set of quick questions
// for each exercise, 11.01 to 11.05.
//
// The questions are the site's own. Every question is ONE step with four choices; the wrong choices are the usual
// slips: the favourable count over the unfavourable count, one colour out of three colours read as 1/3, the
// expected count taken as the probability, the complement forgotten. Spinners are drawn with equal sectors and
// counted by the test (tests/game-checks/ncm7-ch11.ts).
//
// Syllabus: NSW Mathematics K–10 (2022), Stage 4, Probability MA4-PRO-C-01 (single-step experiments).
import type { GameChapter, GameQuestion, GameSet } from '@/lib/game/types'
import { D, frac, gcd, gq, int, mk, num, pick, sample } from './helpers'

const PRO = 'MA4-PRO-C-01'
/** a probability in simplest form: 0, 1 or a fraction */
const F = (n: number, d: number) => {
  if (n === 0) return '0'
  if (n === d) return '1'
  const g = gcd(n, d)
  return frac(n / g, d / g)
}
/** three wrong probabilities, none equal in value to the answer */
function probWrong(right: [number, number], likely: [number, number][]): string[] {
  const v = (x: [number, number]) => x[0] / x[1]
  const out: [number, number][] = []
  const spare: [number, number][] = [[right[0] + 1, right[1]], [right[0], right[1] + 1], [1, right[1]], [right[0], right[1] + 2], [Math.max(0, right[0] - 1), right[1]]]
  for (const x of [...likely, ...spare]) {
    if (x[1] <= 0 || x[0] < 0 || v(x) > 1) continue
    if (Math.abs(v(x) - v(right)) < 1e-9 || out.some((y) => Math.abs(v(y) - v(x)) < 1e-9)) continue
    out.push(x)
    if (out.length === 3) break
  }
  return out.map(([n, d]) => F(n, d))
}

// ================================================================== spinners

/** a spinner with equal sectors, each marked with its letter */
function spinner(labels: string[]): string {
  const n = labels.length
  const c: [number, number] = [110, 110]
  const r = 90
  let body = ''
  labels.forEach((l, i) => {
    const a1 = 90 - (360 * i) / n
    const a2 = 90 - (360 * (i + 1)) / n
    const p1 = D.polar(c, r, a1)
    const p2 = D.polar(c, r, a2)
    // each letter has its own colour (sector classes c1–c4), so equal letters look alike
    body += `<path class="sector c${'ABCD'.indexOf(l) + 1}" d="M${c[0]},${c[1]} L${p1[0].toFixed(2)},${p1[1].toFixed(2)} A${r},${r} 0 0 1 ${p2[0].toFixed(2)},${p2[1].toFixed(2)} Z"/>`
    body += D.text(D.polar(c, r * 0.62, (a1 + a2) / 2), l, 'dl spin')
  })
  body += `<circle class="pt" cx="${c[0]}" cy="${c[1]}" r="4"/>`
  return D.svg(220, 220, body, `A spinner with ${n} equal sectors`, 240)
}
const LETTERS = ['A', 'B', 'C', 'D']
/** sector letters, some repeated, with one letter more common than any other */
function spinLabels(minKinds = 2): string[] {
  for (;;) {
    const n = pick([5, 6, 8])
    const k = int(minKinds, 4)
    const labs = Array.from({ length: n }, () => LETTERS[int(0, k - 1)])
    const counts = LETTERS.slice(0, k).map((l) => labs.filter((x) => x === l).length)
    if (counts.every((c) => c > 0) && counts.filter((c) => c === Math.max(...counts)).length === 1) return labs
  }
}

// ================================================================== 11.01 Sample spaces

function m1101count(): GameQuestion {
  const labs = spinLabels()
  const k = new Set(labs).size
  return gq({
    t: 'count',
    prompt: 'How many different outcomes are in the sample space for this spinner?',
    diagram: spinner(labs),
    correct: num(k),
    // counted the sectors instead of the different outcomes
    wrong: [num(labs.length), num(k + 1), num(k - 1 || k + 2), num(labs.length - 1), num(k + 2), num(labs.length + 1)].filter((x, i, a) => a.indexOf(x) === i && x !== num(k)),
    why: `The sample space is {${[...new Set(labs)].sort().join(', ')}}: ${k} different outcomes, even though there are ${labs.length} sectors.`,
    meta: { labs },
  })
}

function m1101likely(): GameQuestion {
  // at least 3 letters, so the four choices are the letters and (with 3) "all equally likely"
  const labs = spinLabels(3)
  const kinds = [...new Set(labs)].sort()
  const counts = kinds.map((l) => labs.filter((x) => x === l).length)
  const best = kinds[counts.indexOf(Math.max(...counts))]
  const opts = kinds.length === 4 ? kinds : [...kinds, 'All are equally likely']
  return gq({
    t: 'likely',
    prompt: 'Which outcome is the most likely on this spinner?',
    diagram: spinner(labs),
    correct: best,
    inOrder: opts,
    why: `${best} is on ${Math.max(...counts)} of the ${labs.length} equal sectors, more than any other letter.`,
    meta: { labs },
  })
}

const SET_1101: GameSet = {
  id: 'ncm7-11.01',
  exercise: '11.01',
  ref: 'NCM 7 Ex 11.01',
  title: 'Sample spaces',
  focus: 'List the sample space of an experiment and decide whether its outcomes are equally likely.',
  lessons: ['y7-prob-scale'],
  outcomes: [PRO],
  makers: [mk('count', m1101count), mk('likely', m1101likely)],
}

// ================================================================== 11.02 Probability

const COLOURS = ['red', 'blue', 'green', 'yellow']

function m1102bag(): GameQuestion {
  const k = int(2, 3)
  let counts: number[]
  do counts = Array.from({ length: k }, () => int(1, 7))
  while (counts.reduce((t, x) => t + x, 0) < 5)
  const total = counts.reduce((t, x) => t + x, 0)
  const i = int(0, k - 1)
  const what = pick(['marbles', 'counters', 'jelly beans'])
  const desc = counts.map((c, j) => `${c} ${COLOURS[j]}`).join(k === 2 ? ' and ' : ', ').replace(/, ([^,]*)$/, ' and $1')
  return gq({
    t: 'bag',
    prompt: `A bag has ${desc} ${what}. One is taken out without looking. What is the probability that it is ${COLOURS[i]}?`,
    correct: F(counts[i], total),
    // favourable over unfavourable, one colour of the colours, the count over the number of colours
    wrong: probWrong([counts[i], total], [[counts[i], total - counts[i]], [1, k], [1, total], [counts[i], total + 1]]),
    why: `${counts[i]} of the ${total} ${what} are ${COLOURS[i]}: ${frac(counts[i], total)}${gcd(counts[i], total) > 1 ? ` = ${F(counts[i], total)}` : ''}.`,
    meta: { counts, i },
  })
}

const DIE_EVENTS: { say: string; test: (x: number) => boolean }[] = [
  { say: 'an even number', test: (x) => x % 2 === 0 },
  { say: 'an odd number', test: (x) => x % 2 === 1 },
  { say: 'a number greater than 4', test: (x) => x > 4 },
  { say: 'a number less than 3', test: (x) => x < 3 },
  { say: 'a 6', test: (x) => x === 6 },
  { say: 'a prime number', test: (x) => [2, 3, 5].includes(x) },
  { say: 'a multiple of 3', test: (x) => x % 3 === 0 },
  { say: 'a factor of 6', test: (x) => 6 % x === 0 },
]

function m1102die(): GameQuestion {
  const e = pick(DIE_EVENTS)
  const n = [1, 2, 3, 4, 5, 6].filter(e.test).length
  return gq({
    t: 'die',
    prompt: `A standard die is rolled. What is the probability of rolling ${e.say}?`,
    correct: F(n, 6),
    wrong: probWrong([n, 6], [[n, 6 - n], [1, 6], [n + 1, 6], [n - 1, 6]]),
    why: `${n} of the 6 equally likely outcomes fit (${[1, 2, 3, 4, 5, 6].filter(e.test).join(', ')}): ${frac(n, 6)}${gcd(n, 6) > 1 ? ` = ${F(n, 6)}` : ''}.`,
    meta: { say: e.say },
  })
}

function m1102spin(): GameQuestion {
  const labs = spinLabels()
  const l = pick([...new Set(labs)])
  const n = labs.filter((x) => x === l).length
  const k = new Set(labs).size
  return gq({
    t: 'spin',
    prompt: `What is the probability of spinning ${l}?`,
    diagram: spinner(labs),
    correct: F(n, labs.length),
    // one letter of the letters, favourable over unfavourable
    wrong: probWrong([n, labs.length], [[1, k], [n, labs.length - n], [1, labs.length], [n + 1, labs.length]]),
    why: `${l} is on ${n} of the ${labs.length} equal sectors: ${frac(n, labs.length)}${gcd(n, labs.length) > 1 ? ` = ${F(n, labs.length)}` : ''}.`,
    meta: { labs, l },
  })
}

const SET_1102: GameSet = {
  id: 'ncm7-11.02',
  exercise: '11.02',
  ref: 'NCM 7 Ex 11.02',
  title: 'Probability',
  focus: 'Probability = number of favourable outcomes ÷ number of possible outcomes, when the outcomes are equally likely.',
  lessons: ['y7-prob-simple'],
  outcomes: [PRO],
  makers: [mk('die', m1102die), mk('bag', m1102bag), mk('spin', m1102spin, 2)],
}

// ================================================================== 11.03 The range of probability

const WORDS = ['Impossible', 'Unlikely', 'Even chance', 'Likely', 'Certain']
const SCALE_EVENTS: { say: string; w: number }[] = [
  { say: 'rolling an 8 on a standard die', w: 0 },
  { say: 'rolling a 0 on a standard die', w: 0 },
  { say: 'rolling a 6 on a standard die', w: 1 },
  { say: 'rolling a number less than 2 on a standard die', w: 1 },
  { say: 'tossing a coin and getting a head', w: 2 },
  { say: 'rolling an even number on a standard die', w: 2 },
  { say: 'rolling a number greater than 1 on a standard die', w: 3 },
  { say: 'rolling a number less than 6 on a standard die', w: 3 },
  { say: 'rolling a number less than 7 on a standard die', w: 4 },
  { say: 'rolling a whole number on a standard die', w: 4 },
]

function m1103words(): GameQuestion {
  const e = pick(SCALE_EVENTS)
  // four of the five words, in order, always including the answer
  const drop = pick([0, 1, 2, 3, 4].filter((i) => i !== e.w))
  const opts = WORDS.filter((_, i) => i !== drop)
  return gq({
    t: 'words',
    prompt: `Which word best describes the chance of ${e.say}?`,
    correct: WORDS[e.w],
    inOrder: opts,
    why: ['It can never happen: probability 0.', 'Fewer than half of the outcomes fit: probability less than ½.', 'Exactly half of the outcomes fit: probability ½.', 'More than half of the outcomes fit: probability more than ½.', 'It always happens: probability 1.'][e.w],
    meta: { say: e.say },
  })
}

function m1103cannot(): GameQuestion {
  const bad = pick(['1.2', '−0.3', '120%', `${frac(5, 4)}`, '1.05', `${frac(7, 6)}`])
  const good = sample(['0', '1', '0.5', '0.05', '45%', '100%', `${frac(3, 4)}`, `${frac(1, 8)}`, '0.99'], 3)
  return gq({
    t: 'cannot',
    prompt: 'Which of these cannot be a probability?',
    correct: bad,
    wrong: good,
    why: `Every probability is from 0 to 1 (0% to 100%). ${bad} is outside that range.`,
    meta: { bad },
  })
}

function m1103letter(): GameQuestion {
  const word = pick(['PROBABILITY', 'MATHEMATICS', 'AUSTRALIA', 'KANGAROO', 'EUCALYPTUS', 'WOOLLOOMOOLOO', 'SYDNEY', 'NUMBAT'])
  const letters = [...new Set(word.split(''))]
  const l = pick(letters)
  const n = word.split('').filter((x) => x === l).length
  return gq({
    t: 'letter',
    prompt: `One letter of the word ${word} is chosen at random. What is the probability that it is ${l}?`,
    correct: F(n, word.length),
    // one letter of the different letters, the count over the other letters
    wrong: probWrong([n, word.length], [[1, letters.length], [n, word.length - n], [1, word.length], [n + 1, word.length]]),
    why: `${word} has ${word.length} letters and ${n} of them ${n === 1 ? 'is' : 'are'} ${l}: ${frac(n, word.length)}${gcd(n, word.length) > 1 ? ` = ${F(n, word.length)}` : ''}.`,
    meta: { word, l },
  })
}

const SET_1103: GameSet = {
  id: 'ncm7-11.03',
  exercise: '11.03',
  ref: 'NCM 7 Ex 11.03',
  title: 'The range of probability',
  focus: 'Probabilities go from 0 (impossible) to 1 (certain); describe chance in words and in numbers.',
  lessons: ['y7-prob-scale'],
  outcomes: [PRO],
  makers: [mk('words', m1103words), mk('cannot', m1103cannot), mk('letter', m1103letter, 2)],
}

// ================================================================== 11.04 Observed and expected frequencies

function m1104expected(): GameQuestion {
  const kind = int(0, 2)
  let prompt: string, ans: number, p: [number, number]
  if (kind === 0) {
    const trials = 6 * int(5, 20)
    p = [1, 6]
    ans = trials / 6
    prompt = `A standard die is rolled ${trials} times. How many times would you expect to roll a ${int(1, 6)}?`
  } else if (kind === 1) {
    const trials = 2 * int(10, 60)
    p = [1, 2]
    ans = trials / 2
    prompt = `A coin is tossed ${trials} times. How many heads would you expect?`
  } else {
    const n = pick([4, 5, 8])
    const trials = n * int(5, 20)
    p = [1, n]
    ans = trials / n
    prompt = `A spinner has ${n} equal sectors, one of them blue. It is spun ${trials} times. How many times would you expect blue?`
  }
  return gq({
    t: 'expected',
    prompt,
    correct: num(ans),
    // the number of trials, half of it, one more or less
    wrong: [num(ans * 2), num(ans + p[1]), num(ans - 1), num(ans + 1), num(Math.round(ans / 2))].filter((x, i, a) => a.indexOf(x) === i && x !== num(ans)),
    why: `Expected frequency = probability × number of trials: ${frac(p[0], p[1])} × ${num(ans * p[1])} = ${num(ans)}.`,
    meta: { kind },
  })
}

function m1104observed(): GameQuestion {
  const trials = pick([20, 25, 40, 50, 60, 80, 100])
  const heads = int(Math.round(trials * 0.3), Math.round(trials * 0.7))
  const g = gcd(heads, trials)
  return gq({
    t: 'observed',
    prompt: `A coin was tossed ${trials} times and landed heads ${heads} times. What is the observed (experimental) probability of heads?`,
    correct: F(heads, trials),
    // the theoretical probability, heads over tails, the count of tails
    wrong: probWrong([heads, trials], [[1, 2], [heads, trials - heads], [trials - heads, trials], [heads + 1, trials]]),
    why: `Observed probability = ${heads} ÷ ${trials} = ${frac(heads, trials)}${g > 1 ? ` = ${F(heads, trials)}` : ''}. (The theoretical probability is ½.)`,
    meta: { trials, heads },
  })
}

const SET_1104: GameSet = {
  id: 'ncm7-11.04',
  exercise: '11.04',
  ref: 'NCM 7 Ex 11.04',
  title: 'Observed and expected frequencies',
  focus: 'Expected frequency = probability × number of trials; observed probability = how often it happened ÷ trials.',
  lessons: ['y7-prob-comp'],
  outcomes: [PRO],
  makers: [mk('expected', m1104expected), mk('observed', m1104observed)],
}

// ================================================================== 11.05 Complementary events

function m1105value(): GameQuestion {
  const form = int(0, 2)
  if (form === 0) {
    const p = int(1, 19) * 5
    return gq({
      t: 'value',
      prompt: `The probability that it rains tomorrow is ${p}%. What is the probability that it does not rain?`,
      correct: `${100 - p}%`,
      // the same probability again, near misses (all from 0% to 100%)
      wrong: [p, Math.abs(50 - p) || 45, 100 - p + 10, 100 - p - 5, 100 - p + 5, 100 - p - 10]
        .filter((x, i, a) => a.indexOf(x) === i && x !== 100 - p && x > 0 && x < 100)
        .map((x) => `${x}%`),
      why: `The two probabilities add to 100%: 100% − ${p}% = ${100 - p}%.`,
      meta: { form, p },
    })
  }
  if (form === 1) {
    const p = int(1, 9)
    return gq({
      t: 'value',
      prompt: `The probability that a team wins its next game is ${num(p / 10)}. What is the probability that it does not win?`,
      correct: num(1 - p / 10),
      wrong: [num(p / 10), num(Math.abs(1 - p / 10 - 0.1)), num(10 - p), num(1 - p / 100)].filter((x, i, a) => a.indexOf(x) === i && x !== num(1 - p / 10) && x !== '0'),
      why: `The two probabilities add to 1: 1 − ${num(p / 10)} = ${num(1 - p / 10)}.`,
      meta: { form, p },
    })
  }
  const d = pick([5, 7, 8, 9, 10, 12])
  let n: number
  do n = int(1, d - 1)
  while (gcd(n, d) !== 1)
  return gq({
    t: 'value',
    prompt: `The probability of choosing a winning ticket is ${frac(n, d)}. What is the probability of not choosing a winning ticket?`,
    correct: F(d - n, d),
    wrong: probWrong([d - n, d], [[n, d], [1, d - n], [d - n, d + n]]),
    why: `The two probabilities add to 1: 1 − ${frac(n, d)} = ${F(d - n, d)}.`,
    meta: { form, n, d },
  })
}

function m1105name(): GameQuestion {
  const pairs: [string, string, string[]][] = [
    ['rolling an even number on a die', 'Rolling an odd number', ['Rolling a 2', 'Rolling a number less than 6', 'Rolling a 6']],
    ['rolling a 6 on a die', 'Rolling a number from 1 to 5', ['Rolling a 1', 'Rolling an even number', 'Rolling a number from 2 to 6']],
    ['rolling a number greater than 2 on a die', 'Rolling a 1 or a 2', ['Rolling a number less than 2', 'Rolling a 3', 'Rolling a number from 1 to 3']],
    ['rolling a number less than 4 on a die', 'Rolling a 4, 5 or 6', ['Rolling a number greater than 4', 'Rolling a 1, 2 or 3', 'Rolling a 4']],
    ['rolling a prime number on a die', 'Rolling a 1, 4 or 6', ['Rolling an odd number', 'Rolling a 4 or 6', 'Rolling a 1, 2 or 4']],
  ]
  const [event, right, wrong] = pick(pairs)
  return gq({
    t: 'name',
    prompt: `What is the complement of ${event}?`,
    correct: right,
    wrong,
    why: `The complement is every outcome that is not in the event: ${right.toLowerCase()}.`,
    meta: { event },
  })
}

const SET_1105: GameSet = {
  id: 'ncm7-11.05',
  exercise: '11.05',
  ref: 'NCM 7 Ex 11.05',
  title: 'Complementary events',
  focus: 'An event and its complement have probabilities that add to 1.',
  lessons: ['y7-prob-comp'],
  outcomes: [PRO],
  makers: [mk('value', m1105value), mk('name', m1105name)],
}

export const NCM7_CH11: GameChapter = {
  id: 'ncm7-ch11',
  number: 11,
  title: 'Probability',
  ref: 'NCM 7 Chapter 11',
  strand: 'Statistics and probability',
  outcomes: [PRO],
  sets: [SET_1101, SET_1102, SET_1103, SET_1104, SET_1105],
  colour: 350,
  topics: ['y7-probability'],
}

