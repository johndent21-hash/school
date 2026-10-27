// Year 1 (Stage 1, Part A) — Data; Chance
import type { Level, Question, Topic } from '@/lib/maths/types'
import { D2, MINUS, chance, int, mcA, mcFixedA, numA, pick, q, sample, shuffle } from './helpers'

// ------------------------------------------------------------------ Data A

type Survey = { title: string; rows: string[]; ask: (r: string) => string; unit: string }
const SURVEYS: Survey[] = [
  { title: 'Our favourite fruit', rows: ['Apple', 'Banana', 'Grapes', 'Mango'], ask: (r) => `How many children chose ${r.toLowerCase()}?`, unit: 'child' },
  { title: 'Our pets', rows: ['Dog', 'Cat', 'Fish', 'Bird'], ask: (r) => `How many children have a ${r.toLowerCase()}?`, unit: 'child' },
  { title: 'How we came to school', rows: ['Walk', 'Car', 'Bus', 'Bike'], ask: (r) => `How many children chose ${r.toLowerCase()}?`, unit: 'child' },
  { title: 'Our favourite colour', rows: ['Red', 'Blue', 'Green', 'Yellow'], ask: (r) => `How many children chose ${r.toLowerCase()}?`, unit: 'child' },
]

function data(k: number, max: number) {
  const s = pick(SURVEYS)
  const rows = sample(s.rows, k)
  const counts = sample(
    Array.from({ length: max }, (_, i) => i + 1),
    k,
  )
  return { s, rows, counts }
}

const dt_picture = (level: Level): Question => {
  const { s, rows, counts } = data(level === 1 ? 3 : 4, 8)
  const diagram = D2.pictureGraph(
    rows.map((label, i) => ({ label, count: counts[i] })),
    1,
    s.unit,
  )
  const intro = `The picture graph shows “${s.title.toLowerCase()}”. Each circle is one child.`
  if (level === 1) {
    const i = int(0, rows.length - 1)
    return q({
      prompt: `${intro} ${s.ask(rows[i])}`,
      diagram,
      answer: numA(counts[i]),
      hint: 'Count the circles in that row.',
      steps: [`There ${counts[i] === 1 ? 'is 1 circle' : `are ${counts[i]} circles`} in the ${rows[i]} row.`],
    })
  }
  if (level === 2) {
    const most = chance()
    const v = most ? Math.max(...counts) : Math.min(...counts)
    return q({
      prompt: `${intro} Which was chosen by the ${most ? 'most' : 'fewest'} children?`,
      diagram,
      answer: mcFixedA(rows, rows[counts.indexOf(v)]),
      hint: `Find the ${most ? 'longest' : 'shortest'} row.`,
      steps: [`The ${most ? 'longest' : 'shortest'} row is ${rows[counts.indexOf(v)]}, with ${v}.`],
    })
  }
  if (chance()) {
    const [i, j] = sample([0, 1, 2, 3], 2).sort((a, b) => counts[b] - counts[a])
    return q({
      prompt: `${intro} How many more children chose ${rows[i].toLowerCase()} than ${rows[j].toLowerCase()}?`,
      diagram,
      answer: numA(counts[i] - counts[j]),
      hint: 'Count both rows, then find the difference.',
      steps: [`${rows[i]}: ${counts[i]}. ${rows[j]}: ${counts[j]}.`, `${counts[i]} ${MINUS} ${counts[j]} = ${counts[i] - counts[j]}`],
    })
  }
  const total = counts.reduce((a, b) => a + b, 0)
  return q({
    prompt: `${intro} How many children are shown altogether?`,
    diagram,
    answer: numA(total),
    hint: 'Count every circle.',
    steps: [`${counts.join(' + ')} = ${total}`],
  })
}

const dt_tally = (level: Level): Question => {
  if (level === 3 && chance()) {
    const ask = pick([
      ['Your class wants to know which fruit to have at the class picnic. Which question should you ask?', 'Which fruit do you like best: apple, banana or grapes?', ['How old are you?', 'Do you have a dog?', 'What is your name?']],
      ['Your class wants to know how children get to school. Which question should you ask?', 'Do you walk, ride or come by car or bus?', ['What is your favourite colour?', 'How tall are you?', 'Do you like apples?']],
    ] as [string, string, string[]][])
    return q({ prompt: ask[0], answer: mcA(ask[1], ask[2]), hint: 'The question must help find out what the class wants to know.', steps: [`“${ask[1]}” answers what the class wants to know.`] })
  }
  if (level === 3) {
    const items = ['apple', 'pear', 'banana']
    const n = int(7, 11)
    const list = shuffle(Array.from({ length: n }, (_, i) => items[i < 3 ? i : int(0, 2)]))
    const t = pick(items)
    const c = list.filter((x) => x === t).length
    return q({
      prompt: `Count the ${t}s in this list.<p class="datalist">${list.join(', ')}</p>`,
      answer: numA(c),
      hint: 'Make a tally mark each time you see it.',
      steps: [`There ${c === 1 ? 'is 1' : `are ${c}`} ${t}${c === 1 ? '' : 's'} in the list.`],
    })
  }
  const s = pick(SURVEYS)
  const rows = sample(s.rows, 3)
  const counts = sample([2, 3, 4, 5, 6, 7, 8, 9, 10], 3)
  const diagram = D2.tallyChart(
    rows.map((label, i) => ({ label, count: counts[i] })),
    '',
  )
  if (level === 1) {
    const i = int(0, 2)
    return q({
      prompt: `The tally shows “${s.title.toLowerCase()}”. ${s.ask(rows[i])}`,
      diagram,
      answer: numA(counts[i]),
      hint: 'A bundle with a line across is 5. Count on the other marks.',
      steps: [counts[i] >= 5 ? `5 and ${counts[i] - 5} more is ${counts[i]}.` : `There are ${counts[i]} marks.`],
    })
  }
  const most = chance()
  const v = most ? Math.max(...counts) : Math.min(...counts)
  return q({
    prompt: `The tally shows “${s.title.toLowerCase()}”. Which was chosen ${most ? 'most' : 'least'}?`,
    diagram,
    answer: mcFixedA(rows, rows[counts.indexOf(v)]),
    hint: 'Count each row of tally marks.',
    steps: [rows.map((r, i) => `${r}: ${counts[i]}`).join(', '), `${rows[counts.indexOf(v)]} was chosen ${most ? 'most' : 'least'}.`],
  })
}

// ------------------------------------------------------------------ Chance A

const EVENTS: [string, 'will happen' | 'might happen' | 'will not happen'][] = [
  ['Tuesday will come after Monday.', 'will happen'],
  ['The sun will set tonight.', 'will happen'],
  ['Next week will have 7 days.', 'will happen'],
  ['It will rain tomorrow.', 'might happen'],
  ['You will have pasta for dinner tonight.', 'might happen'],
  ['A dog will bark near your house today.', 'might happen'],
  ['Your teacher will read a story today.', 'might happen'],
  ['A cat will fly to the moon.', 'will not happen'],
  ['A fish will ride a bike to school.', 'will not happen'],
  ['You will grow taller than a house tomorrow.', 'will not happen'],
]

const ch_outcomes = (level: Level): Question => {
  if (level === 1) {
    if (chance()) {
      return q({
        prompt: 'You toss a coin. Which of these could happen?',
        answer: mcA('it lands on heads', ['it lands on 6', 'it turns blue', 'it lands on a star']),
        hint: 'A coin has two sides: heads and tails.',
        steps: ['A coin can land on heads or tails.'],
      })
    }
    return q({
      prompt: 'You toss a coin. How many different ways can it land?',
      answer: numA(2),
      hint: 'Think about the two sides of a coin.',
      steps: ['It can land on heads or tails: 2 ways.'],
    })
  }
  if (level === 2) {
    const [ev, ans] = pick(EVENTS)
    return q({
      prompt: `Will it happen, might it happen, or will it not happen?<p><b>${ev}</b></p>`,
      answer: mcFixedA(['will happen', 'might happen', 'will not happen'], ans),
      hint: 'Ask: is it sure to happen, could it happen, or can it never happen?',
      steps: [`${ans === 'will happen' ? 'This is sure to happen' : ans === 'might happen' ? 'This could happen, but it is not sure' : 'This can never happen'}, so it ${ans}.`],
    })
  }
  if (chance()) {
    const bad = pick([7, 8, 0, 10])
    return q({
      prompt: 'You roll a normal dice with the numbers 1 to 6. Which number can you <b>not</b> roll?',
      answer: mcA(String(bad), sample(['1', '2', '3', '4', '5', '6'], 3)),
      hint: 'A normal dice shows 1, 2, 3, 4, 5 or 6.',
      steps: [`A dice only shows 1 to 6, so ${bad} cannot be rolled.`],
    })
  }
  return q({
    prompt: 'You roll a normal dice with the numbers 1 to 6. How many different numbers could you roll?',
    answer: numA(6),
    hint: 'List the numbers on the dice.',
    steps: ['1, 2, 3, 4, 5, 6: there are 6 possible numbers.'],
  })
}

// ------------------------------------------------------------------ topics

export const Y1C: Topic[] = [
  {
    id: 'y1-data',
    year: 1,
    title: 'Data',
    strand: 'Statistics and probability',
    outcomes: ['MA1-DATA-01', 'MA1-DATA-02'],
    blurb: 'Picture graphs where one picture is one child, tally marks and good questions.',
    colour: 25,
    skills: [
      {
        id: 'y1-data-picture',
        title: 'Picture graphs',
        outcomes: ['MA1-DATA-02'],
        summary: 'Read picture graphs where one picture stands for one.',
        learn: {
          intro: '<p>In a picture graph, each picture stands for one thing. Count the pictures in a row to find how many.</p>',
          keyPoints: ['The longest row is the most.', 'The shortest row is the fewest.'],
        },
        gen: dt_picture,
        levels: { 1: 'how many', 2: 'most and fewest', 3: 'how many more; altogether' },
      },
      {
        id: 'y1-data-tally',
        title: 'Tally marks',
        outcomes: ['MA1-DATA-01'],
        summary: 'Count with tally marks and choose questions to ask.',
        learn: {
          intro: '<p>Tally marks help keep count. Every fifth mark goes across the other four.</p>',
          keyPoints: ['A bundle of tally marks is 5.', 'Ask a question that helps you find out what you want to know.'],
        },
        gen: dt_tally,
        levels: { 1: 'read a tally', 2: 'most and least', 3: 'count a list; good questions' },
      },
    ],
  },
  {
    id: 'y1-chance',
    year: 1,
    title: 'Chance',
    strand: 'Statistics and probability',
    outcomes: ['MA1-CHAN-01'],
    blurb: 'What could happen with coins and dice, and things that will, might or will not happen.',
    colour: 285,
    skills: [
      {
        id: 'y1-ch-outcomes',
        title: 'Will it happen?',
        outcomes: ['MA1-CHAN-01'],
        summary: 'Describe what could happen in everyday events, coins and dice.',
        learn: {
          intro: '<p>Some things <b>will happen</b>, some things <b>might happen</b>, and some things <b>will not happen</b>.</p>',
          keyPoints: ['A coin can land on heads or tails.', 'A dice can show 1, 2, 3, 4, 5 or 6.'],
        },
        gen: ch_outcomes,
        levels: { 1: 'coins', 2: 'will, might or will not happen', 3: 'dice' },
      },
    ],
  },
]
