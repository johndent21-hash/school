// Science: a sample of Year 7 chemistry (NSW Science 7–10 Syllabus, 2023, Stage 4): 30 lessons with practice sets,
// in three topics that follow the syllabus focus areas. Science topics are kept apart from the maths topics
// (ALL_TOPICS), so the maths pages, teacher pages and parent view are unchanged; findSkill and findTopic find them,
// so the same lesson and practice pages work for science.
import type { Topic } from '@/lib/maths/types'
import { ATOM_SKILLS, PRT } from './y7-chem-atoms'
import { CHANGE_SKILLS, CHG } from './y7-chem-change'
import { SOL, MATTER_SKILLS } from './y7-chem-matter'
import { MIXTURE_SKILLS } from './y7-chem-mixtures'

export const SCIENCE_TOPICS: Topic[] = [
  {
    id: 'sci7-solutions-mixtures',
    subject: 'science',
    year: 7,
    title: 'Solutions and mixtures',
    strand: 'Chemistry',
    outcomes: [SOL],
    blurb: 'States of matter and the particle model, density, solutions and concentration, and separating mixtures.',
    skills: [...MATTER_SKILLS, ...MIXTURE_SKILLS],
    colour: 195,
  },
  {
    id: 'sci7-periodic-table',
    subject: 'science',
    year: 7,
    title: 'Periodic table and atomic structure',
    strand: 'Chemistry',
    outcomes: [PRT],
    blurb: 'Metals, non-metals and metalloids, atoms and their particles, the periodic table, symbols and formulas.',
    skills: ATOM_SKILLS,
    colour: 265,
  },
  {
    id: 'sci7-chemical-change',
    subject: 'science',
    year: 7,
    title: 'Chemical change',
    strand: 'Chemistry',
    outcomes: [CHG],
    blurb: 'Physical and chemical change, word equations, energy in reactions, and respiration and photosynthesis.',
    skills: CHANGE_SKILLS,
    colour: 25,
  },
]

export const isScience = (t: Topic) => t.subject === 'science'
