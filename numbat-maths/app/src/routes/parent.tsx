// Parents and carers: a simple, read-only view of one child's lesson ratings and practice.
// Parents log in with the same class code, name and PIN their child uses (/join?as=parent).
import { useMemo, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { CheckCircle2, Circle, Flame, Info, LogOut } from 'lucide-react'
import { PageLoading, Shell } from '@/components/numbat/Shell'
import { ProgressBar } from '@/components/numbat/Mastery'
import { WeekColumns } from '@/components/numbat/Charts'
import { GoalRing } from '@/components/numbat/Rewards'
import { RatingKey } from '@/components/numbat/RatingsSheet'
import { RatingStrip, RatingsHistory, ratingSentence } from '@/components/numbat/RatingsHistory'
import { topicsForYear } from '@/content'
import { ago, isOverdue, shortDate } from '@/lib/dates'
import { weeklySeries, masteriesFrom } from '@/lib/insights'
import { pageHead } from '@/lib/meta'
import { itemLabel } from '@/lib/practice'
import { PREVIEW_ONLY } from '@/lib/preview'
import { topicStats } from '@/lib/progress'
import { ratingSummary } from '@/lib/ratings'
import { rewardSummary } from '@/lib/rewards'
import { firstName, useSession } from '@/lib/session'
import { useParentOverview } from '@/lib/teacher-data'
import { useMounted } from '@/lib/use-mounted'

export const Route = createFileRoute('/parent')({
  head: () => pageHead('/parent'),
  component: ParentPage,
})

// Example children shown in the preview (from the made-up example class)
const EXAMPLES = [
  { id: 'demo-1', name: 'Ava T' },
  { id: 'demo-3', name: 'Zara K' },
  { id: 'demo-8', name: 'Jack W' },
]

function ParentPage() {
  const mounted = useMounted()
  const { ready, parent } = useSession()
  return (
    <Shell>
      {!mounted || (!PREVIEW_ONLY && !ready) ? (
        <PageLoading />
      ) : PREVIEW_ONLY ? (
        <ExampleParent />
      ) : parent ? (
        <ParentDashboard />
      ) : (
        <ParentIntro />
      )}
    </Shell>
  )
}

function ParentIntro() {
  const { student, teacher, signOut } = useSession()
  return (
    <div className="mx-auto grid max-w-xl gap-5">
      <div className="grid gap-2">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Parents and carers</h1>
        <p className="text-lg text-muted-foreground">See how your child is going: the teacher’s rating for each lesson, and the practice they do on Numbat Maths.</p>
      </div>
      {student ? (
        <div className="panel grid gap-3 p-5">
          <p>
            This device is logged in as <strong>{student.name}</strong> (student). To use the parent view here, log out first.
          </p>
          <button type="button" className="btn btn-ghost w-fit" onClick={() => void signOut()}>
            <LogOut size={16} aria-hidden="true" /> Log out
          </button>
        </div>
      ) : teacher ? (
        <div className="panel grid gap-3 p-5">
          <p>You’re logged in as a teacher. You can see every student’s progress in your classes.</p>
          <Link to="/teacher" className="btn btn-primary w-fit">
            Go to my classes
          </Link>
        </div>
      ) : (
        <div className="panel grid gap-4 p-6">
          <h2 className="font-display text-xl font-semibold">Log in with your child’s details</h2>
          <ol className="grid list-decimal gap-2 pl-5">
            <li>Type your child’s 6-character class code. It’s on their login card, or ask their teacher.</li>
            <li>Tap your child’s name.</li>
            <li>Enter their 4-digit PIN, the same one they use.</li>
          </ol>
          <Link to="/join" search={{ as: 'parent' }} className="btn btn-primary btn-lg">
            Log in as a parent
          </Link>
          <p className="text-sm text-muted-foreground">You’ll only see your own child’s progress, and nothing you do changes their results.</p>
        </div>
      )}
    </div>
  )
}

function ExampleParent() {
  const [child, setChild] = useState(EXAMPLES[0].id)
  return (
    <div className="grid gap-6">
      <div className="feedback info grid gap-3 text-sm sm:flex sm:items-center" role="note">
        <p className="flex min-w-0 items-start gap-2 sm:flex-1">
          <Info size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>
            <strong>Example parent view.</strong> This child and their results are made up. On the full site, parents log in with their child’s class code,
            name and PIN.
          </span>
        </p>
        <label className="flex items-center gap-2">
          <span className="font-bold">Example child</span>
          <select className="field py-1" value={child} onChange={(e) => setChild(e.target.value)}>
            {EXAMPLES.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <ParentDashboard example={child} />
    </div>
  )
}

function ParentDashboard({ example }: { example?: string }) {
  const { signOut } = useSession()
  const data = useParentOverview(example)
  const extra = useMemo(() => {
    if (!data || !data.ok) return null
    const now = Date.now()
    const rows = data.log.map((a) => ({ ...a, studentId: 'me' }))
    return {
      rewards: rewardSummary({ points: data.child.points, items: data.items, log: data.log, goal: data.class.weeklyGoal, now }),
      weekly: weeklySeries(rows, masteriesFrom(rows), now),
    }
  }, [data])

  if (data === undefined) return <PageLoading />
  if (!data.ok || !extra) return <p className="feedback bad">{data.ok ? 'Something went wrong.' : data.message}</p>

  const first = firstName(data.child.name)
  const { rewards, weekly } = extra
  const topics = topicsForYear(data.class.year)
  const yearSkills = topics.reduce((n, t) => n + t.skills.length, 0)
  const masteredThisYear = topics.reduce((n, t) => n + topicStats(t, data.items).mastered, 0)
  const recentRatings = data.lessons.filter((l) => l.value !== null).slice(-10)
  const rs = ratingSummary(recentRatings.map((l) => l.value))
  const openTasks = data.tasks.filter((t) => t.items.some((id) => (data.items[id]?.updatedAt ?? 0) < t.createdAt))

  return (
    <div className="grid gap-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">{first}’s progress</h1>
          <p className="text-muted-foreground">
            Year {data.class.year} · {data.class.name}
            {data.class.teacherName ? ` · ${data.class.teacherName}` : ''}
          </p>
        </div>
        {!example && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => void signOut()}>
            <LogOut size={16} aria-hidden="true" /> Log out
          </button>
        )}
      </header>

      {/* three plain-language headlines */}
      <div className="grid gap-3 md:grid-cols-3">
        <div className="panel grid content-start gap-2 p-4">
          <p className="text-sm font-bold text-muted-foreground">In class</p>
          {recentRatings.length === 0 ? (
            <p className="font-display text-xl font-semibold">No ratings yet</p>
          ) : (
            <>
              <p className="stat-value">
                {rs.ok} <small>of {rs.rated} lessons</small>
              </p>
              <p className="text-sm text-muted-foreground">at or above expectations lately{rs.absent ? ` (absent ${rs.absent})` : ''}</p>
              <RatingStrip lessons={data.lessons} />
            </>
          )}
        </div>
        <div className="panel flex items-center gap-4 p-4">
          <GoalRing done={rewards.week.thisWeek} goal={rewards.week.goal} size={84} />
          <div className="grid gap-1">
            <p className="text-sm font-bold text-muted-foreground">Practice this week</p>
            <p className="font-display text-lg font-semibold leading-tight">
              {rewards.week.met ? 'Weekly goal reached' : `${rewards.week.thisWeek} of ${rewards.week.goal} sets`}
            </p>
            <p className="text-sm text-muted-foreground">
              Goal set by the teacher.{' '}
              {rewards.week.streak > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Flame size={14} className="text-warning" aria-hidden="true" /> {rewards.week.streak}-week streak
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="panel grid content-start gap-1 p-4">
          <p className="text-sm font-bold text-muted-foreground">Skills mastered</p>
          <p className="stat-value">
            {masteredThisYear} <small>of {yearSkills} in Year {data.class.year}</small>
          </p>
          <p className="text-sm text-muted-foreground">
            Level {rewards.level.n} · {rewards.level.name} · {rewards.earned} {rewards.earned === 1 ? 'badge' : 'badges'}
          </p>
          <p className="text-sm text-muted-foreground">Last practised: {data.child.lastActive ? ago(data.child.lastActive) : 'not yet'}</p>
        </div>
      </div>

      {/* in class */}
      <section className="grid gap-3" aria-labelledby="in-class">
        <h2 id="in-class" className="font-display text-2xl font-semibold">
          How {first} is going in class
        </h2>
        <div className="panel grid gap-4 p-4 sm:p-5">
          <p>
            After each lesson the teacher gives {first} a number from 1 to 4. <strong>3 and 4</strong> mean {first} is where we’d like them to be;{' '}
            <strong>1 and 2</strong> mean below expectations for that lesson.
          </p>
          <RatingKey />
          <p className="font-bold">{ratingSentence(data.lessons, first)}</p>
          <RatingsHistory lessons={data.lessons} first={first} />
        </div>
      </section>

      {/* practice */}
      <section className="grid gap-3" aria-labelledby="practice">
        <h2 id="practice" className="font-display text-2xl font-semibold">
          Practice on Numbat Maths
        </h2>

        {openTasks.length > 0 && (
          <div className="panel grid gap-2 p-4">
            <h3 className="font-display text-lg font-semibold">Tasks from the teacher still to finish</h3>
            <ul className="grid gap-2">
              {openTasks.map((t) => (
                <li key={t.id} className="grid gap-1">
                  <span className="font-bold">
                    {t.title}
                    {t.dueDate ? (
                      <span className={`m-badge ml-2 ${isOverdue(t.dueDate) ? 'm-practise' : 'm-none'}`}>
                        {isOverdue(t.dueDate) ? 'was due' : 'due'} {shortDate(t.dueDate)}
                      </span>
                    ) : null}
                  </span>
                  <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    {t.items.map((id) => {
                      const done = (data.items[id]?.updatedAt ?? 0) >= t.createdAt
                      return (
                        <li key={id} className="flex items-center gap-1">
                          {done ? <CheckCircle2 size={15} className="text-success" aria-label="Done" /> : <Circle size={15} className="text-muted-foreground" aria-label="Not done yet" />}
                          <span className={done ? 'text-muted-foreground line-through' : ''}>{itemLabel(id).title}</span>
                        </li>
                      )
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <WeekColumns title="Practice sets each week" subtitle={`Practice sets and topic tests · weekly goal ${data.class.weeklyGoal}`} data={weekly.map((w) => ({ start: w.start, value: w.sets }))} unit="sets" />
          <div className="panel grid content-start gap-2 p-4">
            <h3 className="font-display text-lg font-semibold">Recent practice</h3>
            {data.log.length === 0 ? (
              <p className="text-muted-foreground">{first} hasn’t finished a practice set yet.</p>
            ) : (
              <ul className="grid gap-1">
                {data.log.slice(0, 8).map((a, k) => {
                  const l = itemLabel(a.itemId)
                  return (
                    <li key={k} className="flex items-center justify-between gap-3 border-b border-border py-1.5 last:border-0">
                      <span className="min-w-0">
                        <span className="block truncate font-bold">{l.title}</span>
                        <span className="block text-sm text-muted-foreground">
                          {a.kind === 'test' ? 'Topic test' : 'Practice'} · {ago(a.finishedAt)}
                        </span>
                      </span>
                      <span className={`m-badge shrink-0 m-${a.score >= 80 ? 'mastered' : a.score >= 50 ? 'getting' : 'practise'}`}>{a.score}%</span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="panel grid gap-3 p-4">
          <h3 className="font-display text-lg font-semibold">Year {data.class.year} topics</h3>
          <ul className="grid gap-x-6 gap-y-3 md:grid-cols-2">
            {topics.map((t) => {
              const st = topicStats(t, data.items)
              return (
                <li key={t.id} className="grid gap-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-bold">{t.title}</span>
                    <span className="text-sm text-muted-foreground">
                      {st.started ? `${st.mastered} of ${st.total} skills mastered` : 'not started'}
                      {st.test ? ` · test ${st.test.best}%` : ''}
                    </span>
                  </div>
                  <ProgressBar value={(st.mastered / st.total) * 100} label={`${t.title}: ${st.mastered} of ${st.total} skills mastered`} />
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section className="panel grid gap-2 p-4 text-sm" aria-labelledby="help">
        <h2 id="help" className="font-display text-lg font-semibold">
          What these mean
        </h2>
        <ul className="grid list-disc gap-1 pl-5 text-muted-foreground">
          <li>
            <strong className="text-foreground">Lesson ratings</strong> are the teacher’s judgement of how {first} went in each lesson. A “–” means that lesson hasn’t
            been rated yet; “A” means absent.
          </li>
          <li>
            <strong className="text-foreground">Mastered</strong> means {first} scored 80% or more on a practice set for that skill.
          </li>
          <li>
            <strong className="text-foreground">Weekly goal</strong> is the number of practice sets or topic tests the teacher asks for each week (Monday to Sunday).
          </li>
          <li>Questions about a rating are best taken to the teacher, who knows the full picture.</li>
        </ul>
      </section>
    </div>
  )
}
