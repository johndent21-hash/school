import { Check, CircleDashed, Sparkles, TrendingUp } from 'lucide-react'
import { MASTERY_LABEL, type MasteryState } from '@/lib/mastery'
import { cn } from '@/lib/utils'

const ICONS: Record<MasteryState, typeof Check> = {
  mastered: Check,
  getting: TrendingUp,
  practise: Sparkles,
  none: CircleDashed,
}

export function MasteryBadge({ state, best, className }: { state: MasteryState; best?: number; className?: string }) {
  const Icon = ICONS[state]
  return (
    <span className={cn('m-badge', `m-${state}`, className)}>
      <Icon size={14} strokeWidth={3} aria-hidden="true" />
      {MASTERY_LABEL[state]}
      {best !== undefined && state !== 'none' ? ` · ${best}%` : ''}
    </span>
  )
}

export function ProgressBar({ value, label, tinted = false }: { value: number; label: string; tinted?: boolean }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div className={cn('bar', tinted && 'tinted')} role="progressbar" aria-label={label} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${pct}%` }} />
    </div>
  )
}
