// Year 9 (Stage 5) — Algebra (NCM 9 Chapter 1, in y9-ncm1.ts), Pythagoras' theorem (NCM 9 Chapter 2, in y9-ncm2.ts), Numeracy and calculation (NCM 9 Chapter 3, in y9-ncm3.ts), Trigonometry (Chapter 4, y9-ncm4.ts), Indices (Chapter 5, y9-ncm5.ts), Geometry and networks (Chapter 6, y9-ncm6.ts), Equations (Chapter 7, y9-ncm7.ts), Earning money (Chapter 8, y9-ncm8.ts)
import type { Level, Question, Topic } from '@/lib/maths/types'
import { NCM1_9_SKILLS, NCM1_9_TEST } from './y9-ncm1'
import { NCM2_9_SKILLS, NCM2_9_TEST } from './y9-ncm2'
import { NCM3_9_SKILLS, NCM3_9_TEST } from './y9-ncm3'
import { NCM4_SKILLS, NCM4_TEST } from './y9-ncm4'
import { NCM5_SKILLS, NCM5_TEST } from './y9-ncm5'
import { NCM6_SKILLS, NCM6_TEST } from './y9-ncm6'
import { NCM7_SKILLS, NCM7_TEST } from './y9-ncm7'
import { NCM8_SKILLS, NCM8_TEST } from './y9-ncm8'
import {
  D, L, MINUS, TIMES, DIVIDE, chance, clean, ex, frac, fracA, fracS, gcd, lcm, int, intExcept, mcA, mcFixedA,
  nonZero, num, numA, pick, q, sample, exprA, v, terms, coef, round, roundSF, name, sqrt, money, signed, approx, pow,
} from './helpers'

const letter = () => pick(['a', 'b', 'm', 'n', 'p', 'x', 'y', 'k', 'h', 't'])

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
    ref: 'NCM 9 Chapter 8',
    strand: 'Number and algebra',
    outcomes: ['MA5-FIN-C-01'],
    blurb: 'Wages and salaries, overtime, commission, piecework and leave loading, income tax (2026–27 rates) and PAYG.',
    colour: 140,
    test: NCM8_TEST,
    skills: NCM8_SKILLS,
  },
]

void D
void intExcept
void mcA
void mcFixedA
void signed
void pow
