// Year 3 (Stage 2, Part A) — Data; Chance
import type { Level, Question, Topic } from '@/lib/maths/types'
import { D, D2, L, MINUS, TIMES, chance, int, mcA, mcFixedA, name, num, numA, pick, q, sample, shuffle } from './helpers'
import { plural } from './s2'

// ------------------------------------------------------------------ Data A

type Survey = { topic: string; question: string; head: string; cats: string[]; who: 'students' | 'birds' }
const SURVEYS: Survey[] = [
  { topic: 'Favourite fruit', question: 'What is your favourite fruit?', head: 'Fruit', cats: ['Apple', 'Banana', 'Mango', 'Grapes', 'Orange'], who: 'students' },
  { topic: 'How we get to school', question: 'How do you usually get to school?', head: 'Transport', cats: ['Walk', 'Car', 'Bus', 'Bike', 'Train'], who: 'students' },
  { topic: 'Favourite sport', question: 'What is your favourite sport?', head: 'Sport', cats: ['Soccer', 'Netball', 'Cricket', 'Swimming', 'Rugby'], who: 'students' },
  { topic: 'Favourite pet', question: 'What is your favourite pet?', head: 'Pet', cats: ['Dog', 'Cat', 'Fish', 'Bird', 'Lizard'], who: 'students' },
  { topic: 'Birds seen in the playground', question: '', head: 'Bird', cats: ['Magpie', 'Galah', 'Kookaburra', 'Lorikeet', 'Myna'], who: 'birds' },
]

/** Distinct counts so that "most" and "least" have one answer. */
function counts(k: number, lo: number, hi: number): number[] {
  return sample(Array.from({ length: hi - lo + 1 }, (_, i) => lo + i), k)
}

function survey(level: Level, lo: number, hi: number) {
  const s = pick(SURVEYS)
  const k = L(level, 3, 4, 5)
  const cats = sample(s.cats, k)
  const vals = counts(k, lo, hi)
  return { s, cats, vals }
}

const howMany = (s: Survey, cat: string) => (s.who === 'birds' ? `How many ${cat.toLowerCase()}s were seen?` : `How many students answered “${cat}”?`)
const howManyMore = (s: Survey, a: string, b: string) =>
  s.who === 'birds' ? `How many more ${a.toLowerCase()}s than ${b.toLowerCase()}s were seen?` : `How many more students answered “${a}” than “${b}”?`

const data_organise = (level: Level): Question => {
  if (level === 3) {
    const ask = pick([
      [
        'The class wants to find out how students travel to school. Which survey question is best?',
        'How do you usually travel to school: walk, car, bus, bike or other?',
        ['Do you like school?', 'How far away do you live?', 'What did you have for breakfast?'],
      ],
      [
        'Ms Nguyen wants to know which fruit to buy for the class party. Which survey question is best?',
        'Which of these fruits do you like best: apple, banana, mango or grapes?',
        ['Do you like fruit?', 'How many pieces of fruit are in your lunchbox?', 'What is your favourite colour?'],
      ],
      [
        'A survey asks: “What is your favourite pet?” Which list of categories is best for recording the answers?',
        'Dog, cat, fish, bird, other',
        ['Dog, puppy, cat, kitten', 'Big, small', 'Yes, no'],
      ],
    ] as [string, string, string[]][])
    return q({
      prompt: ask[0],
      answer: mcA(ask[1], ask[2]),
      hint: 'A good survey question gives answers that sort into a few clear categories that match what you want to find out.',
      steps: [`“${ask[1]}” gives answers that sort into clear categories and matches the purpose of the survey.`],
    })
  }
  const s = pick(SURVEYS.filter((x) => x.who === 'students'))
  const cats = sample(s.cats, 3)
  const n = L(level, int(8, 12), int(14, 20), 0)
  const list = Array.from({ length: n }, (_, i) => cats[i < 3 ? i : int(0, 2)])
  const shuffled = shuffle(list)
  const target = pick(cats)
  const c = shuffled.filter((x) => x === target).length
  if (level === 1)
    return q({
      prompt: `Some students were asked: “${s.question}” Here are their answers.<p class="datalist">${shuffled.join(', ')}</p>How many students answered “${target}”?`,
      answer: numA(c),
      suffix: 'students',
      hint: 'Go through the list and make a tally mark each time you see it.',
      steps: [`Count each “${target}” in the list: there ${c === 1 ? 'is' : 'are'} ${c}.`],
    })
  const others = cats.filter((x) => x !== target)
  const co = others.map((o) => shuffled.filter((x) => x === o).length)
  return q({
    prompt: `${n} students were asked: “${s.question}” Here are their answers.<p class="datalist">${shuffled.join(', ')}</p>Sort the answers into a table. How many students did <b>not</b> answer “${target}”?`,
    answer: numA(n - c),
    suffix: 'students',
    hint: 'Count each answer, then add the ones that are not the one asked about.',
    steps: [`${cats.map((x) => `${x}: ${shuffled.filter((y) => y === x).length}`).join(', ')}`, `${co.join(' + ')} = ${n - c}`, `(Check: ${n} ${MINUS} ${c} = ${n - c})`],
  })
}

const data_tally = (level: Level): Question => {
  const { s, cats, vals } = survey(level, L(level, 2, 3, 3), L(level, 9, 14, 18))
  const diagram = D2.tallyChart(
    cats.map((c, i) => ({ label: c, count: vals[i] })),
    s.head,
  )
  const intro = `The tally table shows: ${s.topic.toLowerCase()}.`
  if (level === 1) {
    const i = int(0, cats.length - 1)
    return q({
      prompt: `${intro} ${howMany(s, cats[i])}`,
      diagram,
      answer: numA(vals[i]),
      hint: 'Each bundle of four marks with a line across is 5. Count the bundles by fives, then count on the single marks.',
      steps: [vals[i] >= 5 ? `${plural(Math.floor(vals[i] / 5), 'bundle')} of 5 = ${Math.floor(vals[i] / 5) * 5}, plus ${vals[i] % 5} more = ${vals[i]}.` : `There are ${vals[i]} single marks.`],
    })
  }
  if (level === 2) {
    if (chance()) {
      const total = vals.reduce((a, b) => a + b, 0)
      return q({
        prompt: `${intro} How many ${s.who} were counted altogether?`,
        diagram,
        answer: numA(total),
        hint: 'Count each row, then add the rows.',
        steps: [`${vals.join(' + ')} = ${total}`],
      })
    }
    const [i, j] = sample([0, 1, 2, 3], 2).sort((a, b) => vals[b] - vals[a])
    return q({
      prompt: `${intro} ${howManyMore(s, cats[i], cats[j])}`,
      diagram,
      answer: numA(vals[i] - vals[j]),
      hint: 'Count both rows, then find the difference.',
      steps: [`${cats[i]}: ${vals[i]}. ${cats[j]}: ${vals[j]}.`, `${vals[i]} ${MINUS} ${vals[j]} = ${vals[i] - vals[j]}`],
    })
  }
  const most = cats[vals.indexOf(Math.max(...vals))]
  const least = cats[vals.indexOf(Math.min(...vals))]
  const askMost = chance()
  const top2 = [...vals].sort((a, b) => b - a)
  return q({
    prompt: askMost
      ? `${intro} How many more ${s.who} were in the most popular category than in the least popular category?`
      : `${intro} How many ${s.who} are in the two biggest categories altogether?`,
    diagram,
    answer: numA(askMost ? Math.max(...vals) - Math.min(...vals) : top2[0] + top2[1]),
    hint: 'Count every row first and write the numbers beside it.',
    steps: [cats.map((c, i) => `${c}: ${vals[i]}`).join(', '), askMost ? `Most: ${most} (${Math.max(...vals)}). Least: ${least} (${Math.min(...vals)}).` : `The two biggest rows are ${top2[0]} and ${top2[1]}.`, askMost ? `${Math.max(...vals)} ${MINUS} ${Math.min(...vals)} = ${Math.max(...vals) - Math.min(...vals)}` : `${top2[0]} + ${top2[1]} = ${top2[0] + top2[1]}`],
  })
}

const data_column = (level: Level): Question => {
  const { s, cats, vals } = survey(level, 1, L(level, 8, 10, 12))
  const diagram = D.columnGraph(cats, vals, 1, s.who === 'birds' ? 'Number of birds' : 'Number of students', s.topic)
  if (level === 1) {
    const i = int(0, cats.length - 1)
    return q({
      prompt: `Look at the column graph. ${howMany(s, cats[i])}`,
      diagram,
      answer: numA(vals[i]),
      hint: 'Go to the top of the column, then across to the number on the side.',
      steps: [`The ${cats[i]} column reaches ${vals[i]}.`],
    })
  }
  if (level === 2) {
    if (chance()) {
      const i = vals.indexOf(Math.max(...vals))
      const j = vals.indexOf(Math.min(...vals))
      const most = chance()
      return q({
        prompt: `Look at the column graph. Which category is the ${most ? 'most' : 'least'} popular?`,
        diagram,
        answer: mcFixedA(cats, cats[most ? i : j]),
        hint: `Find the ${most ? 'tallest' : 'shortest'} column.`,
        steps: [`The ${most ? 'tallest' : 'shortest'} column is ${cats[most ? i : j]}, with ${vals[most ? i : j]}.`],
      })
    }
    const [i, j] = sample([0, 1, 2, 3], 2).sort((a, b) => vals[b] - vals[a])
    return q({
      prompt: `Look at the column graph. ${howManyMore(s, cats[i], cats[j])}`,
      diagram,
      answer: numA(vals[i] - vals[j]),
      hint: 'Read both columns, then subtract.',
      steps: [`${cats[i]}: ${vals[i]}. ${cats[j]}: ${vals[j]}.`, `${vals[i]} ${MINUS} ${vals[j]} = ${vals[i] - vals[j]}`],
    })
  }
  if (chance(0.5) && s.who === 'students') {
    const total = vals.reduce((a, b) => a + b, 0)
    return q({
      prompt: `Look at the column graph. Every student in the class answered once. How many students are in the class?`,
      diagram,
      answer: numA(total),
      hint: 'Add the heights of all the columns.',
      steps: [`${vals.join(' + ')} = ${total}`],
    })
  }
  // statements, including using the data to make a decision
  const iMax = vals.indexOf(Math.max(...vals))
  const iMin = vals.indexOf(Math.min(...vals))
  const [a, b] = sample(
    cats.map((_, i) => i).filter((i) => i !== iMax),
    2,
  )
  const diff = Math.abs(vals[a] - vals[b])
  const trueS = `${cats[iMax]} is the most popular.`
  const falseS = [`${cats[iMin]} is the most popular.`, `${cats[a]} and ${cats[b]} have the same number.`, `${cats[iMax]} has ${vals[iMax] + int(1, 3)}.`]
  return q({
    prompt: `Look at the column graph. Which statement is true?`,
    diagram,
    answer: mcA(trueS, falseS),
    hint: 'Check each statement against the graph.',
    steps: [`The tallest column is ${cats[iMax]} (${vals[iMax]}), so “${trueS}” is true.`, `${cats[a]} has ${vals[a]} and ${cats[b]} has ${vals[b]}: they differ by ${diff}.`],
  })
}

type DotTopic = { label: string; q1: (v: number) => string; q3: (more: boolean, v: number) => string; unit: string; min: number; max: number }
const DOTS: DotTopic[] = [
  { label: 'Number of pets', q1: (v) => `How many students have ${plural(v, 'pet')}?`, q3: (m, v) => `How many students have ${m ? 'more' : 'fewer'} than ${plural(v, 'pet')}?`, unit: 'pets', min: 0, max: 5 },
  { label: 'Goals scored in a game', q1: (v) => `In how many games were ${plural(v, 'goal')} scored?`, q3: (m, v) => `In how many games were ${m ? 'more' : 'fewer'} than ${plural(v, 'goal')} scored?`, unit: 'goals', min: 0, max: 6 },
  { label: 'Number of people in the family', q1: (v) => `How many students have ${v} people in their family?`, q3: (m, v) => `How many students have ${m ? 'more' : 'fewer'} than ${v} people in their family?`, unit: 'people', min: 2, max: 7 },
  { label: 'Books read this month', q1: (v) => `How many students read ${plural(v, 'book')} this month?`, q3: (m, v) => `How many students read ${m ? 'more' : 'fewer'} than ${plural(v, 'book')} this month?`, unit: 'books', min: 0, max: 6 },
]

const data_dotplot = (level: Level): Question => {
  const t = pick(DOTS)
  const range = t.max - t.min + 1
  // frequencies with a single tallest column
  let freqs: number[]
  do freqs = Array.from({ length: range }, () => int(0, L(level, 4, 5, 6)))
  while (freqs.filter((x) => x === Math.max(...freqs)).length !== 1 || freqs.reduce((a, b) => a + b, 0) < 8)
  const values = freqs.flatMap((f, i) => Array(f).fill(t.min + i) as number[])
  const diagram = D.dotPlot(values, t.min, t.max, t.label)
  const games = t.label.startsWith('Goals')
  const who = games ? 'games' : 'students'
  if (level === 1) {
    const i = pick(freqs.map((f, k) => (f > 0 ? k : -1)).filter((k) => k >= 0))
    return q({
      prompt: `Each dot shows one ${games ? 'game' : 'student'}. ${t.q1(t.min + i)}`,
      diagram,
      answer: numA(freqs[i]),
      hint: 'Count the dots above that number.',
      steps: [`There ${freqs[i] === 1 ? 'is 1 dot' : `are ${freqs[i]} dots`} above ${t.min + i}.`],
    })
  }
  if (level === 2) {
    if (chance()) {
      const total = values.length
      return q({
        prompt: `Each dot shows one ${games ? 'game' : 'student'}. How many ${who} are shown altogether?`,
        diagram,
        answer: numA(total),
        hint: 'Count every dot.',
        steps: [`${freqs.join(' + ')} = ${total}`],
      })
    }
    const mode = t.min + freqs.indexOf(Math.max(...freqs))
    return q({
      prompt: `Each dot shows one ${games ? 'game' : 'student'}. Which value is the most common?`,
      diagram,
      answer: numA(mode),
      suffix: t.unit,
      hint: 'Find the tallest stack of dots.',
      steps: [`The tallest stack is above ${mode}, with ${Math.max(...freqs)} dots.`],
    })
  }
  const cut = int(t.min + 1, t.max - 1)
  const more = chance()
  const n = values.filter((v) => (more ? v > cut : v < cut)).length
  if (n === 0) return data_dotplot(level)
  return q({
    prompt: `Each dot shows one ${games ? 'game' : 'student'}. ${t.q3(more, cut)}`,
    diagram,
    answer: numA(n),
    hint: `Only count the dots ${more ? 'to the right of' : 'to the left of'} ${cut}. Do not count ${cut} itself.`,
    steps: [`Values ${more ? 'more' : 'less'} than ${cut}: ${freqs.map((f, i) => [t.min + i, f]).filter(([v, f]) => f > 0 && (more ? v > cut : v < cut)).map(([v, f]) => `${f} at ${v}`).join(', ')}.`, `Total: ${n}`],
  })
}

// ------------------------------------------------------------------ Chance A

const SECTOR_LABELS = ['A', 'B', 'C', 'D', 'E', 'F']

const ch_outcomes = (level: Level): Question => {
  if (level === 1) {
    const kind = pick(['coin', 'die', 'spinner'])
    if (kind === 'spinner') {
      const n = int(3, 4)
      return q({
        prompt: 'This spinner has equal parts. How many different outcomes are possible when it is spun?',
        diagram: D.spinner(SECTOR_LABELS.slice(0, n).map((label, i) => ({ label, cls: 'c' + (i + 1) }))),
        answer: numA(n),
        hint: 'An outcome is any possible result. List the letters it could land on.',
        steps: [`It could land on ${SECTOR_LABELS.slice(0, n).join(', ')}: ${n} outcomes.`],
      })
    }
    return q({
      prompt: kind === 'coin' ? 'A coin is tossed. How many different outcomes are possible?' : 'A standard six-sided die is rolled. How many different outcomes are possible?',
      answer: numA(kind === 'coin' ? 2 : 6),
      hint: 'An outcome is any possible result.',
      steps: [kind === 'coin' ? 'The outcomes are heads and tails: 2 outcomes.' : 'The outcomes are 1, 2, 3, 4, 5 and 6: 6 outcomes.'],
    })
  }
  if (level === 2) {
    if (chance()) {
      const bad = pick(['7', '0', '10'])
      return q({
        prompt: 'A standard six-sided die is rolled. Which is <b>not</b> a possible outcome?',
        answer: mcA(bad, sample(['1', '2', '3', '4', '5', '6'], 3)),
        hint: 'A standard die shows the numbers 1 to 6.',
        steps: [`The outcomes are 1 to 6, so ${bad} is not possible.`],
      })
    }
    const k = int(3, 5)
    const colours = sample(['red', 'blue', 'green', 'yellow', 'purple', 'orange'], k)
    return q({
      prompt: `A bag has one ${colours.slice(0, -1).join(', one ')} and one ${colours[k - 1]} marble. ${name()} takes out one marble without looking. How many different outcomes are possible?`,
      answer: numA(k),
      hint: 'Each colour that could come out is one outcome.',
      steps: [`The outcomes are ${colours.join(', ')}: ${k} outcomes.`],
    })
  }
  const kind = pick(['coins', 'menu', 'coinspin'])
  if (kind === 'coins')
    return q({
      prompt: 'Two coins are tossed. How many different combinations are possible? (Heads then tails counts as different from tails then heads.)',
      answer: numA(4),
      hint: 'List them in an organised way: start with first coin heads, then first coin tails.',
      steps: ['First coin heads: HH, HT.', 'First coin tails: TH, TT.', 'There are 4 combinations.'],
    })
  if (kind === 'menu') {
    const a = int(2, 4)
    const b = int(2, 3)
    const mains = sample(['pasta', 'pizza', 'wrap', 'salad'], a)
    const drinks = sample(['water', 'milk', 'juice'], b)
    return q({
      prompt: `The canteen lunch deal is one meal and one drink. The meals are ${mains.join(', ')}. The drinks are ${drinks.join(', ')}. How many different lunch deals are possible?`,
      answer: numA(a * b),
      hint: 'For each meal, list every drink that could go with it.',
      steps: [...mains.map((m) => `${m}: ${drinks.map((d) => `${m} and ${d}`).join(', ')}`), `${a} meals ${TIMES} ${b} drinks = ${a * b} deals`],
    })
  }
  const n = int(3, 4)
  return q({
    prompt: `A coin is tossed and this spinner is spun. How many different combinations are possible? (For example, heads and A.)`,
    diagram: D.spinner(SECTOR_LABELS.slice(0, n).map((label, i) => ({ label, cls: 'c' + (i + 1) }))),
    answer: numA(2 * n),
    hint: 'List all the combinations with heads, then all the combinations with tails.',
    steps: [`With heads: ${SECTOR_LABELS.slice(0, n).map((x) => 'H' + x).join(', ')}.`, `With tails: ${SECTOR_LABELS.slice(0, n).map((x) => 'T' + x).join(', ')}.`, `2 ${TIMES} ${n} = ${2 * n} combinations`],
  })
}

const ch_predict = (level: Level): Question => {
  if (level === 1) {
    const trials = pick([10, 20, 30, 40, 50])
    const side = pick(['heads', 'tails'])
    return q({
      prompt: `A coin is tossed ${trials} times. About how many times would you expect it to land on ${side}?`,
      answer: numA(trials / 2),
      hint: 'Heads and tails are equally likely, so expect about half of the tosses.',
      steps: [`Heads and tails are equally likely, so expect about half: ${trials} ${'÷'} 2 = ${trials / 2}.`, 'The real result will probably be close to this, but not always exactly.'],
    })
  }
  if (level === 2) {
    if (chance()) {
      const per = int(2, 6)
      const trials = 6 * per
      const face = int(1, 6)
      return q({
        prompt: `A standard six-sided die is rolled ${trials} times. About how many times would you expect to roll a ${face}?`,
        answer: numA(per),
        hint: 'All 6 numbers are equally likely, so share the rolls equally between them.',
        steps: [`Each number is equally likely: ${trials} ${'÷'} 6 = ${per}.`],
      })
    }
    const n = int(3, 4)
    const per = int(3, 10)
    const trials = n * per
    const target = pick(SECTOR_LABELS.slice(0, n))
    return q({
      prompt: `This spinner has equal parts. It is spun ${trials} times. About how many times would you expect it to land on ${target}?`,
      diagram: D.spinner(SECTOR_LABELS.slice(0, n).map((label, i) => ({ label, cls: 'c' + (i + 1) }))),
      answer: numA(per),
      hint: `There are ${n} equally likely outcomes. Share the spins equally.`,
      steps: [`${trials} ${'÷'} ${n} = ${per}`],
    })
  }
  // compare predicted and actual results
  const n = 4
  const per = pick([5, 10])
  const trials = n * per
  let actual: number[]
  do {
    actual = Array.from({ length: n - 1 }, () => per + int(-3, 3))
    actual.push(trials - actual.reduce((a, b) => a + b, 0))
  } while (actual[n - 1] < 1 || new Set(actual.map((x) => Math.abs(x - per))).size < n || actual.some((x) => x === per))
  const labels = SECTOR_LABELS.slice(0, n)
  const furthest = actual.map((x) => Math.abs(x - per)).indexOf(Math.max(...actual.map((x) => Math.abs(x - per))))
  const who = name()
  if (chance()) {
    return q({
      prompt: `${who} spins a spinner with 4 equal parts, A, B, C and D, ${trials} times. The results were A: ${actual[0]}, B: ${actual[1]}, C: ${actual[2]}, D: ${actual[3]}. Which letter's result was furthest from the number ${who} should expect?`,
      answer: mcFixedA(labels, labels[furthest]),
      hint: `First predict: ${trials} spins shared between 4 equally likely letters. Then compare each result with the prediction.`,
      steps: [`Prediction: ${trials} ${'÷'} 4 = ${per} for each letter.`, labels.map((l, i) => `${l}: ${actual[i] > per ? actual[i] - per + ' more' : per - actual[i] + ' fewer'}`).join(', '), `${labels[furthest]} is furthest from ${per}.`],
    })
  }
  const i = int(0, n - 1)
  return q({
    prompt: `${who} spins a spinner with 4 equal parts, A, B, C and D, ${trials} times. It lands on ${labels[i]} ${actual[i]} times. What is the difference between this result and the number of times ${who} should expect it to land on ${labels[i]}?`,
    answer: numA(Math.abs(actual[i] - per)),
    hint: `Predict first: ${trials} ${'÷'} 4. Then find the difference.`,
    steps: [`Expected: ${trials} ${'÷'} 4 = ${per}`, `Difference: ${Math.max(actual[i], per)} ${MINUS} ${Math.min(actual[i], per)} = ${Math.abs(actual[i] - per)}`],
  })
}

// ------------------------------------------------------------------ topics

export const Y3C: Topic[] = [
  {
    id: 'y3-data',
    year: 3,
    title: 'Data',
    strand: 'Statistics and probability',
    outcomes: ['MA2-DATA-01', 'MA2-DATA-02'],
    blurb: 'Survey questions, lists and tally tables, column graphs with a scale of 1, and dot plots.',
    colour: 25,
    skills: [
      {
        id: 'y3-data-organise',
        title: 'Collecting and organising data',
        outcomes: ['MA2-DATA-01'],
        summary: 'Sort survey answers into a table, and choose good survey questions.',
        learn: {
          intro: '<p>A <b>survey</b> asks people a question so we can collect <b>data</b>. Sorting the answers into <b>categories</b> in a table makes the data easier to read.</p>',
          keyPoints: ['Make a tally mark for each answer, then count.', 'A good survey question has answers that fit into a few clear categories.'],
          vocab: [['category', 'a group that answers are sorted into, such as “dog” or “cat”']],
        },
        gen: data_organise,
        levels: { 1: 'count one category in a list', 2: 'organise a list into a table', 3: 'choose a survey question or categories' },
      },
      {
        id: 'y3-data-tally',
        title: 'Tally tables',
        outcomes: ['MA2-DATA-02'],
        summary: 'Read and interpret tally tables.',
        learn: {
          intro: '<p>In a <b>tally</b>, each mark stands for one. The fifth mark goes across the other four, making a bundle of 5.</p>',
          keyPoints: ['Count bundles by fives, then count on the single marks.', 'To compare rows, find the difference.'],
        },
        gen: data_tally,
        levels: { 1: 'read a row', 2: 'totals and differences', 3: 'two-step questions' },
      },
      {
        id: 'y3-data-column',
        title: 'Column graphs',
        outcomes: ['MA2-DATA-01', 'MA2-DATA-02'],
        summary: 'Read and interpret column graphs with a scale of 1.',
        learn: {
          intro: '<p>A <b>column graph</b> has a title, a label on each axis, and columns for each category. The scale on the side goes up in equal steps.</p>',
          keyPoints: ['Read across from the top of a column to the scale.', 'The tallest column is the most popular category.'],
        },
        gen: data_column,
        levels: { 1: 'read a column', 2: 'most, least and differences', 3: 'totals and true statements' },
      },
      {
        id: 'y3-data-dotplot',
        title: 'Dot plots',
        outcomes: ['MA2-DATA-02'],
        summary: 'Read and interpret dot plots.',
        learn: {
          intro: '<p>In a <b>dot plot</b>, each dot stands for one result. The dots are stacked above a number line.</p>',
          keyPoints: ['Count the dots above a number to see how many had that value.', 'The tallest stack is the most common value.'],
        },
        gen: data_dotplot,
        levels: { 1: 'count the dots above a value', 2: 'total; most common value', 3: 'more than or less than a value' },
      },
    ],
  },
  {
    id: 'y3-chance',
    year: 3,
    title: 'Chance',
    strand: 'Statistics and probability',
    outcomes: ['MA2-CHAN-01'],
    blurb: 'Outcomes of chance experiments, listing combinations, and predicting results.',
    colour: 285,
    skills: [
      {
        id: 'y3-ch-outcomes',
        title: 'Outcomes and combinations',
        outcomes: ['MA2-CHAN-01'],
        summary: 'List the possible outcomes of coins, dice and spinners, and count combinations.',
        learn: {
          intro: '<p>An <b>outcome</b> is a possible result of a chance experiment. Tossing a coin has 2 outcomes: heads and tails.</p>',
          keyPoints: ['A standard die has 6 outcomes: 1, 2, 3, 4, 5, 6.', 'List combinations in an organised way so you do not miss any.'],
          vocab: [['outcome', 'any possible result of a chance experiment']],
        },
        gen: ch_outcomes,
        levels: { 1: 'count outcomes', 2: 'which outcomes are possible', 3: 'combinations' },
      },
      {
        id: 'y3-ch-predict',
        title: 'Predicting results',
        outcomes: ['MA2-CHAN-01'],
        summary: 'Predict how often an outcome should happen, and compare with real results.',
        learn: {
          intro: '<p>When outcomes are <b>equally likely</b>, share the number of trials equally between them to make a prediction.</p>',
          keyPoints: ['A coin tossed 20 times: expect about 10 heads.', 'Real results are usually close to the prediction, but rarely exactly the same.'],
        },
        gen: ch_predict,
        levels: { 1: 'coins', 2: 'dice and spinners', 3: 'compare predicted and actual results' },
      },
    ],
  },
]
