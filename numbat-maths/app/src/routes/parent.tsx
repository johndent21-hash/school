// Parents and carers: a simple, read-only view of their children's lesson ratings and practice.
// Parents set up their own account with the parent code on their child's card and a 6-digit PIN they choose, and
// add brothers and sisters with their own codes (app/convex/parents.ts).
import { useMemo, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { CheckCircle2, Circle, Flame, Info, LogOut, Plus } from 'lucide-react'
import { api } from '@/convex/_generated/api'
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
        <ParentHome />
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
        <ParentLogIn />
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
            <strong>Example parent view.</strong> This child and their results are made up. On the full site, parents log in with the parent code
            from their child’s card and their own PIN, and can add brothers and sisters to the same account.
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

/** "ABCD-EFGH" as it is typed */
const showCode = (v: string) => {
  const c = v.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8)
  return c.length > 4 ? `${c.slice(0, 4)}-${c.slice(4)}` : c
}
const codeOk = (v: string) => v.replace(/[^a-zA-Z0-9]/g, '').length === 8
const NETWORK = 'We can’t reach the Numbat Maths server. Check your internet connection and try again.'

function ParentLogIn() {
  const { signIn } = useSession()
  const [mode, setMode] = useState<'login' | 'setup'>('login')
  const [code, setCode] = useState('')
  const [pin, setPin] = useState('')
  const [pin2, setPin2] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const logIn = useMutation(api.parents.parentLogIn)
  const signUp = useMutation(api.parents.parentSignUp)
  const lookup = useQuery(api.parents.parentCodeLookup, mode === 'setup' && codeOk(code) ? { code } : 'skip') as
    | { ok: true; childName: string; className: string; accounts: number }
    | { ok: false; message: string }
    | undefined

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true)
    setError(null)
    try {
      const r = (await fn()) as { ok: true; token: string } | { ok: false; message: string }
      if (r.ok) signIn(r.token)
      else {
        setError(r.message)
        setPin('')
        setPin2('')
      }
    } catch {
      setError(NETWORK)
    }
    setBusy(false)
  }
  const switchTo = (m: 'login' | 'setup') => {
    setMode(m)
    setError(null)
    setPin('')
    setPin2('')
  }
  const pinField = (value: string, set: (v: string) => void, label: string, id: string) => (
    <label className="grid gap-1" htmlFor={id}>
      <span className="label">{label}</span>
      <input
        id={id}
        className="field w-40 font-display text-xl tracking-[0.4em]"
        type="password"
        inputMode="numeric"
        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        maxLength={6}
        value={value}
        onChange={(e) => set(e.target.value.replace(/\D/g, '').slice(0, 6))}
      />
    </label>
  )
  const codeField = (
    <label className="grid gap-1" htmlFor="parent-code">
      <span className="label">Parent code</span>
      <input
        id="parent-code"
        className="field w-48 font-display text-xl uppercase tracking-widest"
        autoComplete="username"
        autoCapitalize="characters"
        spellCheck={false}
        value={showCode(code)}
        onChange={(e) => setCode(showCode(e.target.value))}
        placeholder="ABCD-EFGH"
      />
      <span className="text-sm text-muted-foreground">On your child’s login card, under “Parents and carers”.</span>
    </label>
  )

  return (
    <div className="panel grid gap-5 p-6">
      <div className="tabs w-fit" role="tablist" aria-label="Log in or set up">
        <button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'active' : ''} onClick={() => switchTo('login')}>
          Log in
        </button>
        <button type="button" role="tab" aria-selected={mode === 'setup'} className={mode === 'setup' ? 'active' : ''} onClick={() => switchTo('setup')}>
          First time here
        </button>
      </div>
      {mode === 'login' ? (
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (codeOk(code) && pin.length === 6) void run(() => logIn({ code, pin }))
          }}
        >
          {codeField}
          {pinField(pin, setPin, 'Your 6-digit PIN', 'parent-pin')}
          <button type="submit" className="btn btn-primary btn-lg w-fit" disabled={busy || !codeOk(code) || pin.length !== 6}>
            Log in
          </button>
          <p className="text-sm text-muted-foreground">
            Any of your children’s parent codes works with your PIN. Forgotten your PIN? Choose “First time here” and set up again with the same code.
          </p>
        </form>
      ) : (
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (pin !== pin2) {
              setError('The two PINs are different. Type them again.')
              setPin('')
              setPin2('')
              return
            }
            void run(() => signUp({ code, pin }))
          }}
        >
          {codeField}
          {lookup && !lookup.ok && <p className="feedback bad">{lookup.message}</p>}
          {lookup?.ok && (
            <>
              <p className="feedback good">
                This card is for <strong>{lookup.childName}</strong> ({lookup.className}).
              </p>
              {lookup.accounts > 0 && (
                <p className="text-sm text-muted-foreground">
                  A parent account has already been set up with this code. If it’s yours, log in instead. Another family member can set up their own account
                  here with a different PIN.
                </p>
              )}
              {pinField(pin, setPin, 'Choose a 6-digit PIN', 'new-pin')}
              {pinField(pin2, setPin2, 'Type it again', 'new-pin-2')}
              <p className="text-sm text-muted-foreground">Not your child’s PIN, and not 123456 or six of the same digit. Keep it to yourself.</p>
              <button type="submit" className="btn btn-primary btn-lg w-fit" disabled={busy || pin.length !== 6 || pin2.length !== 6}>
                Set up my parent account
              </button>
            </>
          )}
        </form>
      )}
      {error && (
        <p className="feedback bad" role="alert">
          {error}
        </p>
      )}
      <p className="text-sm text-muted-foreground">You’ll only see your own children’s progress, and nothing you do here changes their results.</p>
    </div>
  )
}

/** A logged-in parent: their children (tabs when there are several), adding another child, and the child's progress. */
function ParentHome() {
  const { parent, token, signOut } = useSession()
  const children = parent?.children ?? []
  const [chosen, setChosen] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const add = useMutation(api.parents.parentAddChild)
  const current = children.find((c) => c.id === chosen) ?? children[0]

  const addChild = async () => {
    setBusy(true)
    setError(null)
    try {
      const r = (await add({ token: token!, code })) as { ok: true; studentId: string } | { ok: false; message: string }
      if (r.ok) {
        setChosen(r.studentId)
        setAdding(false)
        setCode('')
      } else setError(r.message)
    } catch {
      setError(NETWORK)
    }
    setBusy(false)
  }

  const addForm = (
    <form
      className="panel grid gap-3 p-5"
      onSubmit={(e) => {
        e.preventDefault()
        if (codeOk(code)) void addChild()
      }}
    >
      <h2 className="font-display text-xl font-semibold">Add a child</h2>
      <p className="text-sm text-muted-foreground">Type the parent code from their login card. Each child has their own code.</p>
      <label className="grid gap-1" htmlFor="add-code">
        <span className="label">Parent code</span>
        <input
          id="add-code"
          className="field w-48 font-display text-xl uppercase tracking-widest"
          autoCapitalize="characters"
          spellCheck={false}
          value={showCode(code)}
          onChange={(e) => setCode(showCode(e.target.value))}
          placeholder="ABCD-EFGH"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <button type="submit" className="btn btn-primary w-fit" disabled={busy || !codeOk(code)}>
          Add
        </button>
        {children.length > 0 && (
          <button type="button" className="btn btn-ghost w-fit" onClick={() => setAdding(false)}>
            Cancel
          </button>
        )}
      </div>
      {error && <p className="feedback bad">{error}</p>}
    </form>
  )

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {children.length > 1 ? (
          <div className="tabs w-fit" role="tablist" aria-label="Your children">
            {children.map((c) => (
              <button key={c.id} type="button" role="tab" aria-selected={c.id === current?.id} className={c.id === current?.id ? 'active' : ''} onClick={() => setChosen(c.id)}>
                {firstName(c.name)}
              </button>
            ))}
          </div>
        ) : (
          <span />
        )}
        <div className="flex flex-wrap gap-2">
          {children.length > 0 && !adding && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAdding(true)}>
              <Plus size={16} aria-hidden="true" /> Add a child
            </button>
          )}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => void signOut()}>
            <LogOut size={16} aria-hidden="true" /> Log out
          </button>
        </div>
      </div>
      {(adding || children.length === 0) && (
        <>
          {children.length === 0 && (
            <p className="feedback info">
              No children are linked to this account. This happens if the teacher has given a child a new parent code. Add them again with the code on
              their new card.
            </p>
          )}
          {addForm}
        </>
      )}
      {current && <ParentDashboard key={current.id} childId={current.id} />}
    </div>
  )
}

function ParentDashboard({ example, childId }: { example?: string; childId?: string }) {
  const data = useParentOverview(example, childId)
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
