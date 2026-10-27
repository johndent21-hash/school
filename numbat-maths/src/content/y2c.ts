// Year 2 (Stage 1, Part B) — Data; Chance
import type { Level, Question, Topic } from '@/lib/maths/types'
import { D, D2, MINUS, chance, int, mcA, mcFixedA, numA, pick, q, sample, shuffle } from './helpers'

// ------------------------------------------------------------------ Data B

type Survey = { title: string; question: string; cats: string[] }
const SURVEYS: Survey[] = [
  { title: 'Favourite sport', question: 'What is your favourite sport?', cats: ['Soccer', 'Netball', 'Cricket', 'Swimming'] },
  { title: 'Favourite fruit', question: 'What is your favourite fruit?', cats: ['Apple', 'Banana', 'Mango', 'Grapes'] },
  { title: 'Favourite animal', question: 'What is your favourite Australian animal?', cats: ['Koala', 'Kangaroo', 'Wombat', 'Platypus'] },
  { title: 'Favourite season', question: 'What is your favourite season?', cats: ['Summer', 'Autumn', 'Winter', 'Spring'] },
]

const dt_tables = (level: Level): Question => {
  const s = pick(SURVEYS)
  if (level === 2) {
    const cats = sample(s.cats, 3)
    const n = int(10, 15)
    const list = shuffle(Array.from({ length: n }, (_, i) => cats[i < 3 ? i : int(0, 2)]))
    const t = pick(cats)
    const c = list.filter((x) => x === t).length
    return q({
      prompt: `Children were asked: “${s.question}” Sort their answers into a table. How many children said ${t.toLowerCase()}?<p class="datalist">${list.join(', ')}</p>`,
      answer: numA(c),
      hint: 'Make a tally for each answer as you read the list.',
      steps: [cats.map((x) => `${x}: ${list.filter((y) => y === x).length}`).join(', '), `${t}: ${c}`],
    })
  }
  const cats = s.cats
  const counts = sample([3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 4)
  const table = D.table(['Answer', 'Number of children'], cats.map((c, i) => [c, counts[i]]))
  if (level === 1) {
    const i = int(0, 3)
    return q({
      prompt: `The table shows the results of the question “${s.question}” How many children chose ${cats[i].toLowerCase()}?${table}`,
      answer: numA(counts[i]),
      hint: 'Find the row, then read across.',
      steps: [`The ${cats[i]} row shows ${counts[i]}.`],
    })
  }
  if (chance()) {
    const total = counts.reduce((a, b) => a + b, 0)
    return q({
      prompt: `The table shows the results of the question “${s.question}” How many children answered altogether?${table}`,
      answer: numA(total),
      hint: 'Add all the numbers in the table.',
      steps: [`${counts.join(' + ')} = ${total}`],
    })
  }
  const [i, j] = sample([0, 1, 2, 3], 2).sort((a, b) => counts[b] - counts[a])
  return q({
    prompt: `The table shows the results of the question “${s.question}” How many more children chose ${cats[i].toLowerCase()} than ${cats[j].toLowerCase()}?${table}`,
    answer: numA(counts[i] - counts[j]),
    hint: 'Find both numbers, then the difference.',
    steps: [`${cats[i]}: ${counts[i]}. ${cats[j]}: ${counts[j]}.`, `${counts[i]} ${MINUS} ${counts[j]} = ${counts[i] - counts[j]}`],
  })
}

const dt_graphs = (level: Level): Question => {
  if (level === 3 && chance(0.45)) {
    return q({
      prompt: 'Ben made a picture graph of pets. He drew the dog pictures much bigger than the cat pictures. Why is his graph misleading?',
      answer: mcA('The bigger pictures make dogs look like more than they are', ['Dogs are bigger than cats', 'Graphs should not have pictures', 'There are too many cats']),
      hint: 'In a picture graph, every picture should be the same size.',
      steps: ['Pictures of different sizes make one row look longer than it should, so the graph is hard to compare.'],
    })
  }
  const s = pick(SURVEYS)
  const cats = sample(s.cats, 4)
  const counts = sample([1, 2, 3, 4, 5, 6, 7, 8], 4)
  const diagram = D2.pictureGraph(
    cats.map((label, i) => ({ label, count: counts[i] })),
    1,
    'child',
  )
  const intro = `The picture graph shows “${s.title.toLowerCase()}”. Each circle is one child.`
  if (level === 1) {
    const i = int(0, 3)
    return q({ prompt: `${intro} How many children chose ${cats[i].toLowerCase()}?`, diagram, answer: numA(counts[i]), hint: 'Count the circles in the row.', steps: [`${cats[i]} has ${counts[i] === 1 ? '1 circle' : `${counts[i]} circles`}.`] })
  }
  if (level === 2) {
    const most = chance()
    const v = most ? Math.max(...counts) : Math.min(...counts)
    return q({
      prompt: `${intro} Which was chosen ${most ? 'most' : 'least'}?`,
      diagram,
      answer: mcFixedA(cats, cats[counts.indexOf(v)]),
      hint: `Look for the ${most ? 'longest' : 'shortest'} row.`,
      steps: [`${cats[counts.indexOf(v)]} has ${v}, the ${most ? 'most' : 'fewest'}.`],
    })
  }
  const [i, j] = sample([0, 1, 2, 3], 2)
  const total = counts[i] + counts[j]
  return q({
    prompt: `${intro} How many children chose ${cats[i].toLowerCase()} or ${cats[j].toLowerCase()} altogether?`,
    diagram,
    answer: numA(total),
    hint: 'Count both rows and add.',
    steps: [`${counts[i]} + ${counts[j]} = ${total}`],
  })
}

// ------------------------------------------------------------------ Chance B

const EVERYDAY: [string, 'likely' | 'unlikely'][] = [
  ['It will be hot in Sydney on a day in January.', 'likely'],
  ['It will snow at Bondi Beach tomorrow.', 'unlikely'],
  ['You will see a car on the way to school.', 'likely'],
  ['A kangaroo will come into your classroom today.', 'unlikely'],
  ['You will eat something today.', 'likely'],
  ['You will find a dinosaur in the playground.', 'unlikely'],
  ['Your teacher will be at school on a school day.', 'likely'],
  ['It will rain every day for a whole year.', 'unlikely'],
]

const ch_likely = (level: Level): Question => {
  if (level === 1) {
    const [ev, ans] = pick(EVERYDAY)
    return q({
      prompt: `Is this likely or unlikely?<p><b>${ev}</b></p>`,
      answer: mcFixedA(['likely', 'unlikely'], ans),
      hint: 'Likely means it will probably happen. Unlikely means it probably will not.',
      steps: [`This ${ans === 'likely' ? 'will probably happen' : 'probably will not happen'}, so it is ${ans}.`],
    })
  }
  if (level === 2) {
    const n = 4
    const a = pick([1, 3])
    const labels = shuffle([...Array(a).fill('A'), ...Array(n - a).fill('B')])
    const askA = chance()
    const count = askA ? a : n - a
    const ans = count > n / 2 ? 'likely' : 'unlikely'
    return q({
      prompt: `This spinner has 4 equal parts. Is landing on ${askA ? 'A' : 'B'} likely or unlikely?`,
      diagram: D.spinner(labels.map((label) => ({ label, cls: label === 'A' ? 'c1' : 'c2' }))),
      answer: mcFixedA(['likely', 'unlikely'], ans),
      hint: 'Count how many parts have that letter.',
      steps: [`${count} of the 4 parts ${count === 1 ? 'is' : 'are'} ${askA ? 'A' : 'B'}.`, `So landing on ${askA ? 'A' : 'B'} is ${ans}.`],
    })
  }
  const r = int(5, 9)
  const b = int(1, 3)
  const kind = pick(['more', 'possible', 'unlikely'])
  if (kind === 'more')
    return q({
      prompt: `A bag has ${r} red counters and ${b} blue ${b === 1 ? 'counter' : 'counters'}. You pick one without looking. Which colour are you more likely to pick?`,
      answer: mcFixedA(['red', 'blue'], 'red'),
      hint: 'There are more of one colour.',
      steps: [`There are more red counters (${r}) than blue (${b}), so red is more likely.`],
    })
  if (kind === 'possible')
    return q({
      prompt: `A bag has ${r} red counters and ${b} blue ${b === 1 ? 'counter' : 'counters'}. Is it possible to pick a green counter?`,
      answer: mcFixedA(['Yes', 'No'], 'No'),
      hint: 'Look at what is in the bag.',
      steps: ['There are no green counters in the bag, so it is not possible.'],
    })
  return q({
    prompt: `A bag has ${r} red counters and ${b} blue ${b === 1 ? 'counter' : 'counters'}. Is picking blue likely or unlikely?`,
    answer: mcFixedA(['likely', 'unlikely'], 'unlikely'),
    hint: 'Are there many or only a few blue counters?',
    steps: [`Only ${b} of the ${r + b} counters ${b === 1 ? 'is' : 'are'} blue, so picking blue is unlikely.`],
  })
}

// ------------------------------------------------------------------ topics

export const Y2C: Topic[] = [
  {
    id: 'y2-data',
    year: 2,
    title: 'Data',
    strand: 'Statistics and probability',
    outcomes: ['MA1-DATA-01', 'MA1-DATA-02'],
    blurb: 'Sorting answers into tables, reading tables and picture graphs, and spotting misleading graphs.',
    colour: 25,
    skills: [
      {
        id: 'y2-data-tables',
        title: 'Lists and tables',
        outcomes: ['MA1-DATA-01'],
        summary: 'Sort answers into a table and read tables.',
        learn: {
          intro: '<p>A table puts data in rows so it is easy to read. Sort each answer into its category and count.</p>',
          keyPoints: ['Read across the row to find the number.'],
        },
        gen: dt_tables,
        levels: { 1: 'read a table', 2: 'sort a list', 3: 'totals and differences' },
      },
      {
        id: 'y2-data-graphs',
        title: 'Picture graphs',
        outcomes: ['MA1-DATA-02'],
        summary: 'Read picture graphs and explain why some graphs are misleading.',
        learn: {
          intro: '<p>A good picture graph has a baseline, equal spacing and pictures that are all the same size.</p>',
          keyPoints: ['Pictures of different sizes can trick the reader.'],
        },
        gen: dt_graphs,
        levels: { 1: 'how many', 2: 'most and least', 3: 'adding rows; misleading graphs' },
      },
    ],
  },
  {
    id: 'y2-chance',
    year: 2,
    title: 'Chance',
    strand: 'Statistics and probability',
    outcomes: ['MA1-CHAN-01'],
    blurb: 'Likely and unlikely, more likely, and what is possible.',
    colour: 285,
    skills: [
      {
        id: 'y2-ch-likely',
        title: 'Likely or unlikely?',
        outcomes: ['MA1-CHAN-01'],
        summary: 'Describe events as likely, unlikely, more likely or possible.',
        learn: {
          intro: '<p>Something <b>likely</b> will probably happen. Something <b>unlikely</b> probably will not. If it can happen at all, it is <b>possible</b>.</p>',
          keyPoints: ['More of a colour in a bag means it is more likely to be picked.'],
        },
        gen: ch_likely,
        levels: { 1: 'everyday events', 2: 'spinners', 3: 'bags of counters' },
      },
    ],
  },
]
