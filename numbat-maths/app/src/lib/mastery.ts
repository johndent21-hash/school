export type MasteryState = 'mastered' | 'getting' | 'practise' | 'none'

export const MASTERY_LABEL: Record<MasteryState, string> = {
  mastered: 'Mastered',
  getting: 'Getting there',
  practise: 'Keep practising',
  none: 'Not started',
}

export function masteryOf(p?: { best: number; attempts: number } | null): MasteryState {
  if (!p || p.attempts === 0) return 'none'
  if (p.best >= 80) return 'mastered'
  if (p.best >= 50) return 'getting'
  return 'practise'
}

/** Mastery state for a share of skills mastered, e.g. 3 of 5 skills in a topic. */
export function shareState(done: number, total: number, started: boolean): MasteryState {
  if (!started) return 'none'
  if (total > 0 && done / total >= 0.8) return 'mastered'
  if (total > 0 && done / total >= 0.4) return 'getting'
  return 'practise'
}
