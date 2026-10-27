// Student rewards: level, weekly goal ring, week streak and badges, plus the celebration after a set.
import { useState } from 'react'
import {
  Award,
  BookOpen,
  BookOpenCheck,
  ClipboardCheck,
  Compass,
  Crown,
  Flame,
  Footprints,
  Gem,
  Lock,
  Medal,
  PartyPopper,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
} from 'lucide-react'
import type { Badge, BadgeIcon, LevelInfo, RewardSummary } from '@/lib/rewards'
import { rewardChanges } from '@/lib/rewards'
import { setGuestGoal } from '@/lib/progress'
import { shortDate } from '@/lib/dates'
import { cn } from '@/lib/utils'

const ICONS: Record<BadgeIcon, typeof Star> = {
  footprints: Footprints,
  star: Star,
  award: Award,
  medal: Medal,
  crown: Crown,
  gem: Gem,
  book: BookOpen,
  books: BookOpenCheck,
  clipboard: ClipboardCheck,
  trophy: Trophy,
  target: Target,
  flame: Flame,
  compass: Compass,
  sparkles: Sparkles,
  trending: TrendingUp,
}

const pts = (n: number) => n.toLocaleString('en-AU')

/* ---------------- pieces ---------------- */

export function LevelMedal({ level, size = 64 }: { level: LevelInfo; size?: number }) {
  return (
    <span className="level-medal" style={{ width: size, height: size, fontSize: size * 0.42 }} aria-hidden="true">
      {level.n}
    </span>
  )
}

/** A ring meter: the share of the weekly goal done so far. */
export function GoalRing({ done, goal, size = 96 }: { done: number; goal: number; size?: number }) {
  const stroke = Math.round(size * 0.11)
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const share = Math.min(1, done / goal)
  return (
    <svg className="goal-ring" width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${done} of ${goal} sets done this week`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" className="ring-track" strokeWidth={stroke} />
      {share > 0 && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          className="ring-fill"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${c * share} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      )}
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className="ring-text" style={{ fontSize: size * 0.24 }}>
        {Math.min(done, 99)}/{goal}
      </text>
    </svg>
  )
}

function BadgeTile({ b, small = false }: { b: Badge; small?: boolean }) {
  const Icon = ICONS[b.icon]
  return (
    <li className={cn('badge-tile', b.earned ? 'is-earned' : 'is-locked', small && 'is-small')} title={b.how}>
      <span className="badge-icon" aria-hidden="true">
        {b.earned ? <Icon size={small ? 20 : 24} /> : <Lock size={small ? 16 : 18} />}
      </span>
      <span className="min-w-0">
        <span className="block font-bold leading-tight">{b.name}</span>
        <span className="block text-xs text-muted-foreground">
          {b.earned ? 'Earned' : b.need > 1 ? `${b.have} of ${b.need}` : b.how}
        </span>
      </span>
      <span className="sr-only">{b.earned ? b.how : b.need > 1 ? `Not earned yet. ${b.how}` : 'Not earned yet.'}</span>
    </li>
  )
}

/* ---------------- dashboard panel ---------------- */

export function RewardsPanel({ summary, guest }: { summary: RewardSummary; guest: boolean }) {
  const [showAll, setShowAll] = useState(false)
  const { level, week, badges } = summary
  const earned = badges.filter((b) => b.earned)
  // closest to being earned first
  const next = badges.filter((b) => !b.earned).sort((a, b) => b.have / b.need - a.have / a.need)
  const shown = showAll ? [...earned, ...next] : [...earned.slice(-6), ...next.slice(0, Math.max(3, 8 - Math.min(earned.length, 6)))]

  return (
    <section className="grid gap-4" aria-labelledby="my-progress">
      <h2 id="my-progress" className="font-display text-xl font-semibold">
        My progress
      </h2>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="panel flex items-center gap-4 p-4">
          <LevelMedal level={level} />
          <div className="grid min-w-0 flex-1 gap-1.5">
            <p className="text-sm font-bold text-muted-foreground">Level {level.n}</p>
            <p className="font-display text-2xl font-semibold leading-none">{level.name}</p>
            <div className="meter" role="img" aria-label={`${Math.round(level.progress * 100)}% of the way to level ${level.next?.n}`}>
              <span style={{ width: `${Math.max(3, level.progress * 100)}%` }} />
            </div>
            <p className="text-sm text-muted-foreground">
              {pts(level.points)} points · {pts(level.toNext)} more to {level.next?.name}
            </p>
          </div>
        </div>

        <div className="panel flex items-center gap-4 p-4">
          <GoalRing done={week.thisWeek} goal={week.goal} />
          <div className="grid gap-1">
            <p className="text-sm font-bold text-muted-foreground">This week’s goal</p>
            <p className="font-display text-lg font-semibold leading-tight">
              {week.met ? 'Goal reached!' : `${week.goal - week.thisWeek} more ${week.goal - week.thisWeek === 1 ? 'set' : 'sets'} to go`}
            </p>
            <p className="text-sm text-muted-foreground">
              {week.met ? 'Great work. Extra sets still earn points.' : `${week.daysLeft} ${week.daysLeft === 1 ? 'day' : 'days'} left. Practice sets and topic tests both count.`}
            </p>
            {guest && (
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                Goal
                <select className="field py-0.5 text-sm" value={week.goal} onChange={(e) => setGuestGoal(Number(e.target.value))}>
                  {[2, 3, 4, 5, 6, 8, 10].map((g) => (
                    <option key={g} value={g}>
                      {g} a week
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        </div>

        <div className="panel grid gap-2 p-4">
          <div className="flex items-center gap-3">
            <span className={cn('streak-flame', week.streak > 0 && 'is-lit')} aria-hidden="true">
              <Flame size={28} />
            </span>
            <div>
              <p className="text-sm font-bold text-muted-foreground">Week streak</p>
              <p className="font-display text-2xl font-semibold leading-none">
                {week.streak} {week.streak === 1 ? 'week' : 'weeks'}
              </p>
            </div>
          </div>
          <ol className="week-strip" aria-label="The last 8 weeks">
            {week.recent.map((w, i) => (
              <li key={w.start} className={cn(w.met && 'is-met', i === week.recent.length - 1 && 'is-now')} title={`Week of ${shortDate(w.start)}: ${w.count} ${w.count === 1 ? 'set' : 'sets'}`}>
                <span className="sr-only">
                  Week of {shortDate(w.start)}: {w.count} {w.count === 1 ? 'set' : 'sets'}, goal {w.met ? 'reached' : 'not reached'}
                </span>
              </li>
            ))}
          </ol>
          <p className="text-sm text-muted-foreground">
            Reach your goal each week to grow your streak.{week.bestStreak > week.streak ? ` Best: ${week.bestStreak} weeks.` : ''}
          </p>
        </div>
      </div>

      <div className="grid gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-lg font-semibold">
            Badges <span className="text-muted-foreground">{earned.length} of {badges.length}</span>
          </h3>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAll(!showAll)} aria-expanded={showAll}>
            {showAll ? 'Show fewer' : 'See all badges'}
          </button>
        </div>
        <ul className="badge-shelf">
          {shown.map((b) => (
            <BadgeTile key={b.id} b={b} />
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ---------------- after a set ---------------- */

/** Level-ups, new badges and the weekly goal, shown on the results screen. */
export function RewardsCelebration({ before, after }: { before: RewardSummary | null; after: RewardSummary }) {
  if (!before) return null
  const ch = rewardChanges(before, after)
  const w = after.week
  return (
    <div className="grid gap-3">
      {(ch.levelUp || ch.goalReached || ch.newBadges.length > 0) && (
        <div className="celebrate-box celebrate" role="status">
          <PartyPopper size={22} className="shrink-0" aria-hidden="true" />
          <div className="grid gap-2">
            {ch.levelUp && (
              <p className="flex items-center gap-2 font-bold">
                <LevelMedal level={ch.levelUp} size={32} /> Level up! You’re now a {ch.levelUp.name}.
              </p>
            )}
            {ch.goalReached && <p className="font-bold">You reached your weekly goal of {w.goal} sets!</p>}
            {ch.newBadges.length > 0 && (
              <>
                <p className="font-bold">New {ch.newBadges.length === 1 ? 'badge' : 'badges'}!</p>
                <ul className="badge-shelf">
                  {ch.newBadges.map((b) => (
                    <BadgeTile key={b.id} b={b} small />
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-center gap-4 text-left">
        <div className="flex items-center gap-2">
          <GoalRing done={w.thisWeek} goal={w.goal} size={56} />
          <span className="text-sm text-muted-foreground">{w.met ? 'Weekly goal reached' : 'Sets this week'}</span>
        </div>
        <div className="flex items-center gap-2">
          <LevelMedal level={after.level} size={40} />
          <span className="text-sm text-muted-foreground">
            {after.level.name}
            {after.level.next ? ` · ${pts(after.level.toNext)} points to ${after.level.next.name}` : ''}
          </span>
        </div>
      </div>
    </div>
  )
}
