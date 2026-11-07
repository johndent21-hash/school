// Year 9 (Stage 5) — Surface area and volume (NCM 9 Chapter 10, in y9-ncm10.ts), Coordinate geometry and graphs (NCM 9 Chapter 11, in y9-ncm11.ts).
// Trigonometry (NCM 9 Chapter 4) is in y9-ncm4.ts and sits after Numeracy and calculation in y9a.ts.
import type { Topic } from '@/lib/maths/types'
import { NCM10_SKILLS, NCM10_TEST } from './y9-ncm10'
import { NCM11_SKILLS, NCM11_TEST } from './y9-ncm11'

export const Y9B: Topic[] = [
  {
    id: 'y9-measurement',
    year: 9,
    title: 'Surface area and volume',
    ref: 'NCM 9 Chapter 10',
    strand: 'Measurement and space',
    outcomes: ['MA5-MAG-C-01', 'MA4-LEN-C-01', 'MA4-ARE-C-01', 'MA5-ARE-C-01', 'MA4-VOL-C-01', 'MA5-VOL-C-01'],
    blurb: 'Metric units, precision and error, composite areas, quadrilaterals and circles, and the surface area and volume of prisms and cylinders.',
    colour: 95,
    test: NCM10_TEST,
    skills: NCM10_SKILLS,
  },
  {
    id: 'y9-coordinate',
    year: 9,
    title: 'Coordinate geometry and graphs',
    ref: 'NCM 9 Chapter 11',
    strand: 'Number and algebra',
    outcomes: ['MA5-LIN-C-01', 'MA5-LIN-C-02', 'MA5-NLI-C-01'],
    blurb: 'Length, midpoint and gradient of intervals; graphing straight lines and y = mx + c; solving and applying linear equations; parabolas y = ax² + c.',
    colour: 225,
    test: NCM11_TEST,
    skills: NCM11_SKILLS,
  },
]
