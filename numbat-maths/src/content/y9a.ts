// Year 9 (Stage 5) — Algebra (NCM 9 Chapter 1, in y9-ncm1.ts), Pythagoras' theorem (NCM 9 Chapter 2, in y9-ncm2.ts), Numeracy and calculation (NCM 9 Chapter 3, in y9-ncm3.ts), Trigonometry (Chapter 4, y9-ncm4.ts), Indices (Chapter 5, y9-ncm5.ts), Geometry and networks (Chapter 6, y9-ncm6.ts), Equations (Chapter 7, y9-ncm7.ts), Financial mathematics
import type { Level, Question, Topic } from '@/lib/maths/types'
import { NCM1_9_SKILLS, NCM1_9_TEST } from './y9-ncm1'
import { NCM2_9_SKILLS, NCM2_9_TEST } from './y9-ncm2'
import { NCM3_9_SKILLS, NCM3_9_TEST } from './y9-ncm3'
import { NCM4_SKILLS, NCM4_TEST } from './y9-ncm4'
import { NCM5_SKILLS, NCM5_TEST } from './y9-ncm5'
import { NCM6_SKILLS, NCM6_TEST } from './y9-ncm6'
import { NCM7_SKILLS, NCM7_TEST } from './y9-ncm7'
import {
  D, L, MINUS, TIMES, DIVIDE, chance, clean, ex, frac, fracA, fracS, gcd, lcm, int, intExcept, mcA, mcFixedA,
  nonZero, num, numA, pick, q, sample, exprA, v, terms, coef, round, roundSF, name, sqrt, money, signed, approx, pow,
} from './helpers'

const letter = () => pick(['a', 'b', 'm', 'n', 'p', 'x', 'y', 'k', 'h', 't'])

// ------------------------------------------------------------------ Financial mathematics

const fin_wages = (level: Level): Question => {
  if (level === 1) {
    const sal = int(450, 1200) * 100 + pick([0, 10, 50, 90])
    const [per, div] = pick([
      ['week', 52],
      ['fortnight', 26],
      ['month', 12],
    ] as [string, number][])
    return q({
      prompt: `${name()} earns an annual salary of $${num(sal)}. How much is this per ${per}? Give your answer to the nearest cent.`,
      answer: numA(round(sal / div, 2), 2),
      prefix: '$',
      calc: true,
      hint: `There are ${div} ${per}s in a year.`,
      steps: [`$${num(sal)} ${DIVIDE} ${div} ${approx(sal / div, 2).replace(/^([=≈]) /, '$1 $')}`],
    })
  }
  if (level === 2) {
    const rate = int(1650, 4500) / 100
    const hours = pick([15, 20, 25, 30, 35, 38])
    return q({
      prompt: `A ${pick(['chef', 'nurse', 'apprentice electrician', 'lifeguard', 'barista'])} is paid ${money(rate)} per hour and works ${hours} hours a week. Find the weekly pay.`,
      answer: numA(round(rate * hours, 2), 2),
      prefix: '$',
      calc: true,
      hint: 'Weekly pay = hourly rate × hours worked.',
      steps: [`${money(rate)} ${TIMES} ${hours} = ${money(rate * hours)}`],
    })
  }
  const gross = int(900, 2400) + int(0, 99) / 100
  const tax = round(gross * pick([0.12, 0.15, 0.18, 0.21]), 2)
  const union = pick([12.5, 15.2, 18.75, 0])
  const health = pick([24.6, 31.4, 45.9])
  const net = round(gross - tax - union - health, 2)
  return q({
    prompt: `Raj’s gross pay for a fortnight is ${money(gross)}. The deductions are: PAYG tax ${money(tax)}, health insurance ${money(health)}${union ? ` and union fees ${money(union)}` : ''}. What is Raj’s net pay?`,
    answer: numA(net, 2),
    prefix: '$',
    calc: true,
    hint: 'Net pay = gross pay − all deductions.',
    steps: [`Deductions: ${money(tax)} + ${money(health)}${union ? ' + ' + money(union) : ''} = ${money(tax + health + union)}`, `Net pay = ${money(gross)} ${MINUS} ${money(tax + health + union)} = ${money(net)}`],
  })
}

const fin_overtime = (level: Level): Question => {
  const rate = int(2200, 4200) / 100
  if (level === 1) {
    const h = int(2, 8)
    const kind = pick(['time-and-a-half', 'double time'])
    const f = kind === 'double time' ? 2 : 1.5
    return q({
      prompt: `Kai is paid ${money(rate)} per hour. How much is Kai paid for ${h} hours of overtime at ${kind}?`,
      answer: numA(round(rate * f * h, 2), 2),
      prefix: '$',
      calc: true,
      hint: `${kind === 'double time' ? 'Double time means 2 × the normal rate.' : 'Time-and-a-half means 1.5 × the normal rate.'}`,
      steps: [`Overtime rate: ${money(rate)} ${TIMES} ${f} = ${money(rate * f)} per hour`, `${h} hours: ${money(rate * f)} ${TIMES} ${h} = ${money(rate * f * h)}`],
    })
  }
  if (level === 2) {
    const normal = pick([35, 36, 38])
    const ot1 = int(2, 6)
    const ot2 = pick([0, 2, 3])
    const total = rate * normal + rate * 1.5 * ot1 + rate * 2 * ot2
    return q({
      prompt: `Riley works ${normal} hours at ${money(rate)} per hour, plus ${ot1} hours of overtime at time-and-a-half${ot2 ? ` and ${ot2} hours at double time` : ''}. Calculate Riley’s total pay for the week.`,
      answer: numA(round(total, 2), 2),
      prefix: '$',
      calc: true,
      hint: 'Work out each part of the pay separately, then add.',
      steps: [`Normal: ${normal} ${TIMES} ${money(rate)} = ${money(normal * rate)}`, `Time-and-a-half: ${ot1} ${TIMES} 1.5 ${TIMES} ${money(rate)} = ${money(ot1 * 1.5 * rate)}`, ...(ot2 ? [`Double time: ${ot2} ${TIMES} 2 ${TIMES} ${money(rate)} = ${money(ot2 * 2 * rate)}`] : []), `Total = ${money(total)}`],
    })
  }
  const weekly = int(1100, 2200)
  const loading = weekly * 4 * 0.175
  return q({
    prompt: `Zoe earns $${num(weekly)} per week. For 4 weeks of annual leave, Zoe is paid the normal 4 weeks’ pay plus a 17.5% holiday loading on that amount. What is Zoe’s total holiday pay?`,
    answer: numA(round(weekly * 4 + loading, 2), 2),
    prefix: '$',
    calc: true,
    hint: 'Find 4 weeks’ pay, then add 17.5% of it.',
    steps: [`4 weeks’ pay: 4 ${TIMES} $${num(weekly)} = $${num(weekly * 4)}`, `Loading: 17.5% ${TIMES} $${num(weekly * 4)} = ${money(loading)}`, `Total = ${money(weekly * 4 + loading)}`],
  })
}

const fin_commission = (level: Level): Question => {
  if (level === 1) {
    const p = pick([2, 3, 4, 5, 2.5, 1.5])
    const sales = int(80, 900) * 100
    return q({
      prompt: `A real estate agent earns ${num(p)}% commission on sales. How much commission is earned on a sale of $${num(sales)}?`,
      answer: numA(round((p / 100) * sales, 2), 2),
      prefix: '$',
      calc: true,
      hint: `Commission = ${num(p)}% of the sales.`,
      steps: [`${num(p / 100)} ${TIMES} $${num(sales)} = ${money((p / 100) * sales)}`],
    })
  }
  if (level === 2) {
    if (chance()) {
      const ret = pick([300, 400, 450, 500])
      const p = pick([3, 4, 5, 6])
      const sales = int(40, 300) * 100
      return q({
        prompt: `Nikky is paid a retainer of $${ret} per week plus ${p}% commission on sales. Find Nikky’s pay in a week with $${num(sales)} worth of sales.`,
        answer: numA(ret + (p / 100) * sales, 2),
        prefix: '$',
        calc: true,
        hint: 'Pay = retainer + commission.',
        steps: [`Commission: ${p}% of $${num(sales)} = ${money((p / 100) * sales)}`, `Pay = $${ret} + ${money((p / 100) * sales)} = ${money(ret + (p / 100) * sales)}`],
      })
    }
    const per = pick([0.35, 0.45, 0.6, 1.2, 2.5])
    const n = int(150, 900)
    return q({
      prompt: `A fruit picker is paid ${money(per)} per crate picked (piecework). How much is earned for picking ${n} crates?`,
      answer: numA(round(per * n, 2), 2),
      prefix: '$',
      calc: true,
      hint: 'Multiply the rate per item by the number of items.',
      steps: [`${money(per)} ${TIMES} ${n} = ${money(per * n)}`],
    })
  }
  const r1 = pick([3, 4, 5])
  const r2 = pick([1.5, 2, 2.5])
  const tier = 50000
  const sales = int(60, 200) * 1000
  const com = tier * (r1 / 100) + (sales - tier) * (r2 / 100)
  return q({
    prompt: `Sam is paid commission of ${r1}% on the first $50 000 of sales and ${num(r2)}% on all sales over $50 000. How much commission does Sam earn on sales of $${num(sales)}?`,
    answer: numA(round(com, 2), 2),
    prefix: '$',
    calc: true,
    hint: 'Split the sales into two parts and use the right rate for each part.',
    steps: [`First $50 000: ${r1}% ${TIMES} $50 000 = $${num(tier * r1 / 100)}`, `Remaining $${num(sales - tier)}: ${num(r2)}% ${TIMES} $${num(sales - tier)} = ${money(((sales - tier) * r2) / 100)}`, `Total = ${money(com)}`],
  })
}

// ------------------------------------------------------------------ Topics

export const Y9A: Topic[] = [
  {
    id: 'y9-algebra',
    year: 9,
    title: 'Algebra',
    ref: 'NCM 9 Chapter 1',
    strand: 'Number and algebra',
    outcomes: ['MA5-ALG-C-01'],
    blurb: 'Words to expressions, substitution, simplifying terms and algebraic fractions, expanding, factorising and binomial products.',
    colour: 330,
    test: NCM1_9_TEST,
    skills: NCM1_9_SKILLS,
  },
  {
    id: 'y9-pythagoras',
    year: 9,
    title: 'Pythagoras’ theorem',
    ref: 'NCM 9 Chapter 2',
    strand: 'Measurement and space',
    outcomes: ['MA4-PYT-C-01', 'MA4-IND-C-01'],
    blurb: 'Squares, square roots and surds; finding the hypotenuse or a shorter side; testing for right angles; Pythagorean triads; problems.',
    colour: 190,
    test: NCM2_9_TEST,
    skills: NCM2_9_SKILLS,
  },
  {
    id: 'y9-numeracy',
    year: 9,
    title: 'Numeracy and calculation',
    ref: 'NCM 9 Chapter 3',
    strand: 'Number and algebra',
    outcomes: ['MA4-INT-C-01', 'MA4-FRC-C-01', 'MA4-RAT-C-01', 'MA5-FIN-C-01'],
    blurb: 'Integers, decimals and fractions; percentages, profit, discounts and GST; simple interest; ratios and rates.',
    colour: 52,
    test: NCM3_9_TEST,
    skills: NCM3_9_SKILLS,
  },
  {
    id: 'y9-trigonometry',
    year: 9,
    title: 'Trigonometry',
    ref: 'NCM 9 Chapter 4',
    strand: 'Measurement and space',
    outcomes: ['MA5-TRG-C-01'],
    blurb: 'Naming the sides, sin, cos and tan, similar triangles, the calculator with degrees and minutes, unknown sides and unknown angles.',
    colour: 18,
    test: NCM4_TEST,
    skills: NCM4_SKILLS,
  },
  {
    id: 'y9-indices',
    year: 9,
    title: 'Indices',
    ref: 'NCM 9 Chapter 5',
    strand: 'Number and algebra',
    outcomes: ['MA5-IND-C-01', 'MA5-MAG-C-01'],
    blurb: 'The index laws, the zero index and negative indices, significant figures and scientific notation.',
    colour: 265,
    test: NCM5_TEST,
    skills: NCM5_SKILLS,
  },
  {
    id: 'y9-geometry',
    year: 9,
    title: 'Geometry and networks',
    ref: 'NCM 9 Chapter 6',
    strand: 'Measurement and space',
    outcomes: ['MA4-GEO-C-01', 'MA4-ANG-C-01'],
    blurb: 'Angles in triangles and quadrilaterals, the special quadrilaterals, and (Path) networks and planar graphs.',
    colour: 320,
    test: NCM6_TEST,
    skills: NCM6_SKILLS,
  },
  {
    id: 'y9-equations',
    year: 9,
    title: 'Equations',
    ref: 'NCM 9 Chapter 7',
    strand: 'Number and algebra',
    outcomes: ['MA5-EQU-C-01'],
    blurb: 'Two-step equations, letters on both sides, brackets, word problems and formulas (and, as Path work, ax² = c).',
    colour: 230,
    test: NCM7_TEST,
    skills: NCM7_SKILLS,
  },
  {
    id: 'y9-finance',
    year: 9,
    title: 'Earning money',
    strand: 'Number and algebra',
    outcomes: ['MA5-FIN-C-01'],
    // simple interest is in Numeracy and calculation (NCM 9 Ex 3.07)
    blurb: 'Wages and salaries, overtime and leave loading, commission and piecework.',
    colour: 145,
    skills: [
      {
        id: 'y9-fin-wages',
        title: 'Wages and salaries',
        outcomes: ['MA5-FIN-C-01'],
        summary: 'Convert salaries between periods, calculate wages and net pay.',
        learn: {
          intro: '<p>A <b>salary</b> is a fixed amount per year. A <b>wage</b> is paid per hour worked.</p>',
          keyPoints: ['1 year = 52 weeks = 26 fortnights = 12 months', 'Gross pay − deductions = net pay'],
        },
        gen: fin_wages,
        levels: { 1: 'Salary conversions', 2: 'Hourly wages', 3: 'Net pay' },
      },
      {
        id: 'y9-fin-overtime',
        title: 'Overtime and leave loading',
        outcomes: ['MA5-FIN-C-01'],
        summary: 'Calculate overtime at time-and-a-half and double time, and holiday loading.',
        learn: {
          intro: '<p>Overtime is paid at a higher rate than normal time.</p>',
          keyPoints: ['Time-and-a-half: 1.5 × normal rate', 'Double time: 2 × normal rate', 'Annual leave loading is usually 17.5% of 4 weeks’ pay.'],
        },
        gen: fin_overtime,
        levels: { 1: 'Overtime only', 2: 'Normal plus overtime', 3: 'Holiday loading' },
      },
      {
        id: 'y9-fin-commission',
        title: 'Commission and piecework',
        outcomes: ['MA5-FIN-C-01'],
        summary: 'Calculate commission, retainers, sliding scales and piecework pay.',
        learn: {
          intro: '<p><b>Commission</b> is a percentage of sales. <b>Piecework</b> pays a set amount per item.</p>',
          keyPoints: ['Retainer + commission = total pay', 'Sliding scale: use each rate only on its part of the sales.'],
        },
        gen: fin_commission,
        levels: { 1: 'Commission', 2: 'Retainer; piecework', 3: 'Sliding scale' },
      },
    ],
  },
]

void D
void intExcept
void mcA
void mcFixedA
void signed
void pow
