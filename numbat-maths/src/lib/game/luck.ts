// "Skill plus luck": every team that answers correctly digs up a log. Most logs hold termites
// (points); a few hold a surprise. A correct answer never costs the team that gave it anything,
// but a raid or a leapfrog by another team can.
//
// The rules are kept deliberately gentle so that the team with the most right answers usually wins:
//  - a raid takes at most RAID termites, and only from the team in front;
//  - a leapfrog swaps totals with the team JUST ahead, and only when the gap is between
//    LEAP_MIN and LEAP_MAX, so nobody jumps from last to first in one go;
//  - at most one raid and one leapfrog per question.

export type FindKind = 'termites' | 'double' | 'golden' | 'echidna' | 'raid' | 'leapfrog'

export interface Find {
  team: number
  kind: FindKind
  /** change to this team's total */
  gain: number
  /** double: the find that was doubled */
  base?: number
  /** raid: the team raided; leapfrog: the team swapped with */
  other?: number
  /** how many termites the other team lost */
  otherLoss?: number
  before: number
  after: number
}

export interface DigResult {
  /** in the order they happen: a later find sees the totals left by the earlier ones */
  finds: Find[]
  scores: number[]
}

export const TERMITES = [20, 30, 40, 50] as const
export const GOLDEN = 100
export const ECHIDNA = 5
export const RAID = 30
export const LEAP_MIN = 40
export const LEAP_MAX = 150

/** cumulative chances of each kind of log */
const TABLE: [FindKind, number][] = [
  ['termites', 0.6],
  ['double', 0.7],
  ['golden', 0.78],
  ['echidna', 0.86],
  ['raid', 0.94],
  ['leapfrog', 1],
]

export type Rng = () => number

function shuffled<T>(arr: T[], rng: Rng): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** The other team with the most termites, if it has more than this team (ties: the lowest-numbered team). */
function leaderAhead(scores: number[], team: number): number | null {
  let best: number | null = null
  scores.forEach((s, o) => {
    if (o !== team && s > scores[team] && (best === null || s > scores[best])) best = o
  })
  return best
}

/** The team just ahead of this one: the smallest total that is still bigger. */
function nextAhead(scores: number[], team: number): number | null {
  let best: number | null = null
  scores.forEach((s, o) => {
    if (o !== team && s > scores[team] && (best === null || s < scores[best])) best = o
  })
  return best
}

/**
 * The digs for one question.
 * scores: every team's total before the question; correct: the teams that got it right.
 */
export function dig(scores: number[], correct: number[], rng: Rng = Math.random): DigResult {
  const now = scores.slice()
  const finds: Find[] = []
  let raided = false
  let leapt = false
  const plain = (team: number): Find => {
    const gain = TERMITES[Math.floor(rng() * TERMITES.length)]
    return { team, kind: 'termites', gain, before: now[team], after: now[team] + gain }
  }
  for (const team of shuffled(correct, rng)) {
    const r = rng()
    const kind = TABLE.find(([, upTo]) => r < upTo)?.[0] ?? 'termites'
    let f: Find
    if (kind === 'double') {
      const base = TERMITES[Math.floor(rng() * TERMITES.length)]
      f = { team, kind, base, gain: 2 * base, before: now[team], after: now[team] + 2 * base }
    } else if (kind === 'golden') {
      f = { team, kind, gain: GOLDEN, before: now[team], after: now[team] + GOLDEN }
    } else if (kind === 'echidna') {
      f = { team, kind, gain: ECHIDNA, before: now[team], after: now[team] + ECHIDNA }
    } else if (kind === 'raid') {
      const other = raided ? null : leaderAhead(now, team)
      if (other === null) f = plain(team)
      else {
        const take = Math.min(RAID, now[other])
        raided = true
        f = { team, kind, gain: take, other, otherLoss: take, before: now[team], after: now[team] + take }
        now[other] -= take
      }
    } else if (kind === 'leapfrog') {
      const other = leapt ? null : nextAhead(now, team)
      const gap = other === null ? 0 : now[other] - now[team]
      if (other === null || gap < LEAP_MIN || gap > LEAP_MAX) f = plain(team)
      else {
        leapt = true
        f = { team, kind, gain: gap, other, otherLoss: gap, before: now[team], after: now[other] }
        now[other] = now[team]
      }
    } else f = plain(team)
    now[team] = f.after
    finds.push(f)
  }
  return { finds, scores: now }
}

/** Places for a list of totals: equal totals share a place (1, 2, 2, 4). */
export function places(scores: number[]): number[] {
  return scores.map((s) => 1 + scores.filter((x) => x > s).length)
}
