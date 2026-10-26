// Year 4 (Stage 2, Part B) — Data; Chance
import type { Level, Question, Topic } from '@/lib/maths/types'
import { D, D2, L, MINUS, chance, int, mcA, mcFixedA, name, num, numA, pick, q, sample } from './helpers'
import { plural } from './s2'

// ------------------------------------------------------------------ Data B

const GRAPHS = [
  { title: 'Favourite sport', cats: ['Soccer', 'Netball', 'Cricket', 'Swimming', 'Rugby'], y: 'Number of students', who: 'students' },
  { title: 'Books borrowed this week', cats: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], y: 'Number of books', who: 'books' },
  { title: 'Cans collected for recycling', cats: ['3A', '3B', '4A', '4B', '4C'], y: 'Number of cans', who: 'cans' },
  { title: 'Votes for the class pet name', cats: ['Spike', 'Bluey', 'Nugget', 'Pip', 'Ziggy'], y: 'Number of votes', who: 'votes' },
]

/** Distinct values that are multiples of `unit`, between unit and max. */
function values(k: number, unit: number, max: number): number[] {
  return sample(
    Array.from({ length: Math.floor(max / unit) }, (_, i) => (i + 1) * unit),
    k,
  )
}

const howMany = (g: (typeof GRAPHS)[number], cat: string) =>
  g.who === 'students' ? `How many students chose ${cat.toLowerCase()}?` : g.who === 'books' ? `How many books were borrowed on ${cat}?` : g.who === 'cans' ? `How many cans did class ${cat} collect?` : `How many votes did “${cat}” get?`

const data_scale = (level: Level): Question => {
  const g = pick(GRAPHS)
  const step = L(level, 2, pick([5, 10]), pick([2, 5, 10]))
  const half = level >= 2 && step !== 5 && chance(level === 3 ? 0.6 : 0.4)
  const unit = half ? step / 2 : step
  const k = 4
  const cats = g.who === 'books' ? g.cats.slice(0, k) : sample(g.cats, k)
  const vals = values(k, unit, step * L(level, 8, 8, 9))
  const diagram = D.columnGraph(cats, vals, step, g.y, g.title)
  const halfNote = (v: number) => (v % step !== 0 ? ` It is halfway between ${num(v - step / 2)} and ${num(v + step / 2)}, so it shows ${num(v)}.` : '')
  if (level === 1 || (level === 2 && chance(0.6))) {
    const i = int(0, k - 1)
    return q({
      prompt: `The scale on this column graph goes up in ${step}s. ${howMany(g, cats[i])}`,
      diagram,
      answer: numA(vals[i]),
      hint: `Each grid line is ${step} more than the one below.${half ? ' A column can stop halfway between two lines.' : ''}`,
      steps: [`The ${cats[i]} column reaches ${num(vals[i])}.${halfNote(vals[i])}`],
    })
  }
  if (chance()) {
    const [i, j] = sample([0, 1, 2, 3], 2).sort((a, b) => vals[b] - vals[a])
    return q({
      prompt: `Look at the column graph. How many more ${g.who} for ${cats[i]} than for ${cats[j]}?`,
      diagram,
      answer: numA(vals[i] - vals[j]),
      hint: 'Read both columns carefully using the scale, then subtract.',
      steps: [`${cats[i]}: ${num(vals[i])}. ${cats[j]}: ${num(vals[j])}.`, `${num(vals[i])} ${MINUS} ${num(vals[j])} = ${num(vals[i] - vals[j])}`],
    })
  }
  const total = vals.reduce((a, b) => a + b, 0)
  return q({
    prompt: `Look at the column graph. How many ${g.who} altogether?`,
    diagram,
    answer: numA(total),
    hint: 'Read every column using the scale, then add.',
    steps: [`${vals.map((v) => num(v)).join(' + ')} = ${num(total)}`],
  })
}

const PICT = [
  { title: 'Fruit eaten at recess', rows: ['Apples', 'Bananas', 'Oranges', 'Pears'], unit: 'pieces', ask: (r: string) => `How many ${r.toLowerCase()} were eaten?`, more: (a: string, b: string) => `How many more ${a.toLowerCase()} than ${b.toLowerCase()} were eaten?` },
  { title: 'Sport chosen for Friday', rows: ['Soccer', 'Cricket', 'Netball', 'T-ball'], unit: 'students', ask: (r: string) => `How many students chose ${r}?`, more: (a: string, b: string) => `How many more students chose ${a} than ${b}?` },
  { title: 'Birds counted', rows: ['Magpies', 'Galahs', 'Lorikeets', 'Ibises'], unit: 'birds', ask: (r: string) => `How many ${r.toLowerCase()} were counted?`, more: (a: string, b: string) => `How many more ${a.toLowerCase()} than ${b.toLowerCase()} were counted?` },
]

const data_picture = (level: Level): Question => {
  const p = pick(PICT)
  const per = L(level, 2, pick([4, 5, 10]), pick([2, 4, 10]))
  const half = level === 3
  const counts = sample(
    Array.from({ length: 7 }, (_, i) => (i + 1) * per),
    4,
  ).map((c) => (half && c > per && chance(0.6) ? c - per / 2 : c))
  const rows = p.rows.map((label, i) => ({ label, count: counts[i] }))
  const diagram = D2.pictureGraph(rows, per, p.unit)
  if (level === 3 && chance(0.3)) {
    const n = int(3, 9) * per
    return q({
      prompt: `In a picture graph, each symbol stands for ${per} ${p.unit}. How many symbols are needed to show ${n} ${p.unit}?`,
      answer: numA(n / per),
      suffix: 'symbols',
      hint: `How many groups of ${per} are in ${n}?`,
      steps: [`${n} ÷ ${per} = ${n / per}`],
    })
  }
  const i = int(0, 3)
  const syms = (c: number) => (c % per === 0 ? plural(c / per, 'symbol') : `${plural(Math.floor(c / per), 'whole symbol')} and a half`)
  if (level === 1 || chance(0.5)) {
    return q({
      prompt: `Look at the picture graph “${p.title}”. ${p.ask(p.rows[i])}`,
      diagram,
      answer: numA(counts[i]),
      hint: `Check the key: each symbol stands for ${per}.${half ? ` Half a symbol stands for ${per / 2}.` : ''}`,
      steps: [`${p.rows[i]} has ${syms(counts[i])}.`, counts[i] % per === 0 ? `${counts[i] / per} × ${per} = ${counts[i]}` : `${Math.floor(counts[i] / per)} × ${per} + ${per / 2} = ${counts[i]}`],
    })
  }
  const [a, b] = sample([0, 1, 2, 3], 2).sort((x, y) => counts[y] - counts[x])
  return q({
    prompt: `Look at the picture graph “${p.title}”. ${p.more(p.rows[a], p.rows[b])}`,
    diagram,
    answer: numA(counts[a] - counts[b]),
    hint: 'Work out each row using the key, then subtract.',
    steps: [`${p.rows[a]}: ${counts[a]}. ${p.rows[b]}: ${counts[b]}.`, `${counts[a]} ${MINUS} ${counts[b]} = ${counts[a] - counts[b]}`],
  })
}

const data_survey = (level: Level): Question => {
  const L1: [string, string, string[], string][] = [
    ['Which survey question will give answers that sort easily into categories?', 'Which season do you like best: summer, autumn, winter or spring?', ['What do you think about the weather?', 'Tell me about your holidays.', 'Why do you like sport?'], 'It gives a short list of answers to choose from, so the answers sort into 4 categories.'],
    ['A class wants to know which day of the week students like best. Which recording sheet heading is best?', 'Day | Tally | Total', ['Name | Age', 'Colour | Size', 'Yes | No'], 'The categories are the days, with a tally and a total for each.'],
  ]
  const L2: [string, string, string[], string][] = [
    ['A trial survey asked “What do you like?” and got very different answers. Which question is a better replacement?', 'Which of these do you like best: drawing, reading, sport or music?', ['What do you like doing?', 'Do you like things?', 'What is your name?'], 'Giving clear choices makes answers that can be counted in categories.'],
    ['A survey about favourite fruit listed only apple and banana. Many students wanted to choose something else. How should the survey be improved?', 'Add more fruits and an “other” category', ['Remove banana', 'Ask fewer students', 'Ask about vegetables instead'], 'An “other” category and more choices let everyone give a true answer.'],
  ]
  const L3: [string, string, string[], string][] = [
    ['The class wants to know how many cars pass the school gate in 10 minutes. Which method is best?', 'Watch the gate and tally the cars', ['Ask students how many cars they own', 'Guess the number', 'Look at a map'], 'Observing and tallying records what actually happens.'],
    ['A column graph uses a scale where each grid line is 10 more than the one below. A column stops halfway between 30 and 40. What does it show?', '35', ['3.5', '34', '40'], 'Halfway between 30 and 40 is 35.'],
    ['Which display is best for showing how many students chose each of 5 sports?', 'A column graph', ['A clock', 'A number line with one point', 'A map'], 'A column graph shows the count for each category side by side, so they are easy to compare.'],
  ]
  const it = pick(L(level, L1, L2, L3))
  return q({
    prompt: it[0],
    answer: mcA(it[1], it[2]),
    hint: 'Think about what makes data easy to collect, count and compare.',
    steps: [it[3]],
  })
}

// ------------------------------------------------------------------ Chance B

const ch_likely = (level: Level): Question => {
  if (level === 1) {
    const ev = pick([
      ['rolling a 6', 'unlikely', '1 of the 6 numbers is a 6.'],
      ['rolling a number less than 6', 'likely', '5 of the 6 numbers are less than 6.'],
      ['rolling a 1', 'unlikely', '1 of the 6 numbers is a 1.'],
      ['rolling a number greater than 1', 'likely', '5 of the 6 numbers are greater than 1.'],
      ['rolling a number from 1 to 5', 'likely', '5 of the 6 numbers are from 1 to 5.'],
    ])
    return q({
      prompt: `A standard six-sided die is rolled once. Is ${ev[0]} likely or unlikely?`,
      answer: mcFixedA(['likely', 'unlikely'], ev[1]),
      hint: 'Count how many of the 6 numbers give the outcome.',
      steps: [ev[2], `So ${ev[0]} is ${ev[1]}.`],
    })
  }
  if (level === 2) {
    // spinner with repeated letters
    const nA = int(1, 4)
    const nB = pick([1, 2, 3, 4].filter((x) => x + nA <= 6 && x + nA >= 4))
    const labels = [...Array(nA).fill('A'), ...Array(nB).fill('B')]
    // interleave so equal parts of the same letter are not all together
    const order = labels.map((l, i) => ({ l, k: (i % (labels.length / 2)) + (l === 'A' ? 0 : 0.5) })).sort((x, y) => x.k - y.k).map((x) => x.l)
    const correct = nA === nB ? 'They are equally likely' : nA > nB ? 'A is more likely' : 'B is more likely'
    return q({
      prompt: 'This spinner has equal parts. Compare the chance of landing on A and landing on B.',
      diagram: D.spinner(order.map((label) => ({ label, cls: label === 'A' ? 'c1' : 'c2' }))),
      answer: mcFixedA(['A is more likely', 'B is more likely', 'They are equally likely'], correct),
      hint: 'Count the parts for each letter.',
      steps: [`A: ${plural(nA, 'part')}. B: ${plural(nB, 'part')}.`, correct + '.'],
    })
  }
  const colours = ['red', 'blue', 'green', 'yellow']
  let counts: number[]
  do counts = colours.map(() => int(1, 7))
  while (new Set(counts).size < 3)
  const total = counts.reduce((a, b) => a + b, 0)
  const desc = colours.map((c, i) => `${counts[i]} ${c}`).join(', ').replace(/, ([^,]*)$/, ' and $1')
  const dup = counts.find((c, i) => counts.indexOf(c) !== i)
  if (dup !== undefined && chance(0.5)) {
    const pair = colours.filter((_, i) => counts[i] === dup)
    const right = `${pair[0]} and ${pair[1]}`
    const others: string[] = []
    for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) if (counts[i] !== counts[j]) others.push(`${colours[i]} and ${colours[j]}`)
    return q({
      prompt: `A bag has ${desc} counters (${total} altogether). One counter is taken without looking. Which two colours are equally likely?`,
      answer: mcA(right, sample(others, 3)),
      hint: 'Colours with the same number of counters are equally likely.',
      steps: [`There are ${dup} ${pair[0]} and ${dup} ${pair[1]}, so they are equally likely.`],
    })
  }
  const askMost = chance()
  const target = askMost ? Math.max(...counts) : Math.min(...counts)
  if (counts.filter((c) => c === target).length > 1) return ch_likely(level)
  const col = colours[counts.indexOf(target)]
  return q({
    prompt: `A bag has ${desc} counters. One counter is taken without looking. Which colour is ${askMost ? 'most' : 'least'} likely?`,
    answer: mcFixedA(colours, col),
    hint: `The colour with the ${askMost ? 'most' : 'fewest'} counters is ${askMost ? 'most' : 'least'} likely.`,
    steps: [`${col} has the ${askMost ? 'most' : 'fewest'} counters (${target}), so it is the ${askMost ? 'most' : 'least'} likely.`],
  })
}

const ch_dependent = (level: Level): Question => {
  if (level === 1) {
    const ev = pick([
      ['A coin has landed on heads 4 times in a row. On the next toss, is heads more likely, less likely or just as likely as before?', 'Just as likely', 'The coin does not remember earlier tosses. Each toss has the same chance of heads.'],
      ['A die has not shown a 6 in the last 10 rolls. On the next roll, is a 6 more likely, less likely or just as likely as before?', 'Just as likely', 'Each roll of a die is not affected by the rolls before it.'],
      ['A spinner landed on red last time. On the next spin, is red more likely, less likely or just as likely as before?', 'Just as likely', 'Each spin is not affected by the spin before it.'],
    ])
    return q({
      prompt: ev[0],
      answer: mcFixedA(['More likely', 'Less likely', 'Just as likely'], ev[1]),
      hint: 'Does the coin, die or spinner change after each go?',
      steps: [ev[2]],
    })
  }
  const r = int(3, 7)
  const b = int(3, 7)
  const who = name()
  if (level === 2) {
    const askRed = chance()
    return q({
      prompt: `A bag has ${r} red and ${b} blue marbles. ${who} takes out a red marble and does not put it back. How many ${askRed ? 'red marbles are' : 'marbles are'} left in the bag?`,
      answer: numA(askRed ? r - 1 : r + b - 1),
      hint: 'One red marble has been removed.',
      steps: askRed ? [`${r} ${MINUS} 1 = ${r - 1} red marbles`] : [`${r} + ${b} = ${r + b} marbles at the start`, `${r + b} ${MINUS} 1 = ${r + b - 1} marbles left`],
    })
  }
  if (chance(0.35)) {
    return q({
      prompt: 'Which second event is affected by the first event?',
      answer: mcA('Taking a second card from a pack after keeping the first card', ['Tossing a coin a second time', 'Rolling a die a second time', 'Spinning a spinner a second time']),
      hint: 'Which one changes what is left for the second go?',
      steps: ['Keeping the first card changes the cards left in the pack, so the second event is affected.', 'Coins, dice and spinners are the same every time, so their next result is not affected.'],
    })
  }
  const n = r
  return q({
    prompt: `A bag has ${n} red and ${n} blue marbles. ${who} takes out a red marble and keeps it. ${who} then takes another marble without looking. Compare the chance of red and blue now.`,
    answer: mcFixedA(['Red is more likely', 'Blue is more likely', 'They are equally likely'], 'Blue is more likely'),
    hint: 'Count what is left in the bag.',
    steps: [`Now there are ${n - 1} red and ${n} blue marbles.`, `There are more blue marbles left, so blue is more likely. The first event affected the second.`],
  })
}

// ------------------------------------------------------------------ topics

export const Y4C: Topic[] = [
  {
    id: 'y4-data',
    year: 4,
    title: 'Data',
    strand: 'Statistics and probability',
    outcomes: ['MA2-DATA-01', 'MA2-DATA-02'],
    blurb: 'Column graphs and picture graphs with many-to-one scales, and planning surveys.',
    colour: 25,
    skills: [
      {
        id: 'y4-data-scale',
        title: 'Column graphs with scales',
        outcomes: ['MA2-DATA-02'],
        summary: 'Read column graphs whose scales go up in 2s, 5s or 10s.',
        learn: {
          intro: '<p>On a <b>many-to-one scale</b>, each grid line stands for more than 1. Check how much the scale goes up by before reading a column.</p>',
          keyPoints: ['Scale of 10: a column halfway between 30 and 40 shows 35.', 'Scale of 2: halfway between 6 and 8 is 7.'],
        },
        gen: data_scale,
        levels: { 1: 'scale of 2', 2: 'scales of 5 and 10', 3: 'halfway values; differences and totals' },
      },
      {
        id: 'y4-data-picture',
        title: 'Picture graphs with a key',
        outcomes: ['MA2-DATA-01', 'MA2-DATA-02'],
        summary: 'Read and make picture graphs where one symbol stands for many.',
        learn: {
          intro: '<p>The <b>key</b> tells you how many each symbol stands for. Half a symbol stands for half that number.</p>',
          keyPoints: ['Key ● = 4: three symbols show 12.', 'Half a symbol shows 2.'],
        },
        gen: data_picture,
        levels: { 1: 'key of 2', 2: 'keys of 4, 5 and 10', 3: 'half symbols; making a graph' },
      },
      {
        id: 'y4-data-survey',
        title: 'Planning surveys',
        outcomes: ['MA2-DATA-01'],
        summary: 'Choose good survey questions, categories and methods.',
        learn: {
          intro: '<p>A good survey has a clear question, sensible categories and a recording sheet. Trialling the survey on a few people helps you improve it.</p>',
          keyPoints: ['Give choices, including “other”.', 'Some data is best collected by watching and tallying.'],
        },
        gen: data_survey,
        levels: { 1: 'good questions and recording sheets', 2: 'improving a survey', 3: 'methods and displays' },
      },
    ],
  },
  {
    id: 'y4-chance',
    year: 4,
    title: 'Chance',
    strand: 'Statistics and probability',
    outcomes: ['MA2-CHAN-01'],
    blurb: 'Likely, unlikely and equally likely outcomes, and events that are affected by earlier events.',
    colour: 285,
    skills: [
      {
        id: 'y4-ch-likely',
        title: 'Likely and unlikely',
        outcomes: ['MA2-CHAN-01'],
        summary: 'Describe and compare the chance of outcomes.',
        learn: {
          intro: '<p>An outcome is <b>likely</b> if it will probably happen and <b>unlikely</b> if it probably will not. Two outcomes are <b>equally likely</b> if they have the same chance.</p>',
          keyPoints: ['Count the ways each outcome can happen.', 'Heads and tails are equally likely.'],
        },
        gen: ch_likely,
        levels: { 1: 'dice', 2: 'spinners', 3: 'bags of counters' },
      },
      {
        id: 'y4-ch-dependent',
        title: 'Does the first event matter?',
        outcomes: ['MA2-CHAN-01'],
        summary: 'Identify when an event is affected by an earlier event.',
        learn: {
          intro: '<p>Coins, dice and spinners do not remember earlier results. But taking things out of a bag <b>without putting them back</b> changes what is left.</p>',
          keyPoints: ['After 4 heads in a row, heads is still just as likely.', 'Keep a red marble, and red becomes less likely next time.'],
        },
        gen: ch_dependent,
        levels: { 1: 'coins, dice and spinners', 2: 'what is left in the bag', 3: 'comparing after an event' },
      },
    ],
  },
]
