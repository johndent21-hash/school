// Class games: quick-fire multiple-choice questions matched to one textbook exercise, played by the
// whole class on the board. These are separate from the lessons' practice questions: every game
// question is one step, done in the head in about 15 seconds, with four choices (A–D).

/** One game question. Exactly one of the four options is right. */
export interface GameQuestion {
  prompt: string // HTML, short enough to read from the back of the room
  diagram?: string // SVG
  note?: string // e.g. "Diagram not drawn to scale."
  options: string[] // four HTML strings, in the order shown (A, B, C, D)
  correct: number // index of the right option
  /** One line shown with the answer: the rule and the working. HTML. */
  why: string
  /** The question type and the numbers it was made from, so tests can re-work the answer independently. Never shown. */
  meta: { t: string } & Record<string, unknown>
}

/** One kind of question in a set. d: 1 = the most basic form (asked first), 2 = slightly more thinking, still one step. */
export interface GameMaker {
  t: string
  make: () => GameQuestion
  d?: 1 | 2
}

/** The questions for one textbook exercise. */
export interface GameSet {
  id: string // "ncm7-8.05"
  exercise: string // "8.05"
  ref: string // "NCM 7 Ex 8.05"
  title: string // the textbook's exercise title
  /** The core skill the game practises, in one line (for teachers). */
  focus: string
  outcomes: string[]
  makers: GameMaker[]
  /** Lessons on this site that teach the same skill (skill ids), if any. */
  lessons?: string[]
  /** A note for teachers, e.g. content that is beyond the stage. */
  teacherNote?: string
}

export interface GameChapter {
  id: string // "ncm7-ch8"
  number: number
  title: string
  ref: string // "NCM 7 Chapter 8"
  strand: 'Number and algebra' | 'Measurement and space' | 'Statistics and probability'
  outcomes: string[]
  sets: GameSet[]
  colour: number // hue, as for topic tiles
  /** Lesson topics on this site that cover the same chapter (topic ids), so the topic page can point to the games. */
  topics?: string[]
}

export interface GameBook {
  id: string // "ncm7"
  short: string // "NCM 7"
  title: string // "New Century Maths 7"
  year: number
  stage: string // "Stage 4"
  chapters: GameChapter[]
}

/** A question as posed in a game: which exercise it came from (the whole-chapter mix draws on every exercise). */
export interface GameItem {
  q: GameQuestion
  set: GameSet
}
