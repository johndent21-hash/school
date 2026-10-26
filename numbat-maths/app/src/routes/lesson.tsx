// One skill: Learn (lesson + worked examples) and Practise (saved set or extra practice).
import { useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, PencilLine } from 'lucide-react'
import { NotFoundPanel, PageLoading, Shell } from '@/components/numbat/Shell'
import { MasteryBadge } from '@/components/numbat/Mastery'
import { MathHtml } from '@/components/numbat/MathHtml'
import { ReadAloud } from '@/components/numbat/QuestionCard'
import { WorkedExample } from '@/components/numbat/WorkedExample'
import { PracticeRunner } from '@/components/numbat/PracticeRunner'
import { findSkill } from '@/content'
import { LEVEL_NAMES, type Level, type Skill, type Topic } from '@/lib/maths/types'
import { masteryOf } from '@/lib/mastery'
import { pageHead } from '@/lib/meta'
import { EXTRA_COUNT, SET_LEVELS } from '@/lib/practice'
import { useProgress } from '@/lib/progress'
import { useSession } from '@/lib/session'
import { useMounted } from '@/lib/use-mounted'

type Tab = 'learn' | 'practice'

export const Route = createFileRoute('/lesson')({
  validateSearch: (s: Record<string, unknown>): { id?: string; tab?: Tab } => ({
    id: typeof s.id === 'string' ? s.id : undefined,
    tab: s.tab === 'practice' ? 'practice' : s.tab === 'learn' ? 'learn' : undefined,
  }),
  head: () => pageHead('/lesson'),
  component: LessonPage,
})

function LessonPage() {
  const mounted = useMounted()
  const { ready } = useSession()
  return <Shell>{mounted && ready ? <LessonView /> : <PageLoading />}</Shell>
}

function LessonView() {
  const { id, tab = 'learn' } = Route.useSearch()
  const found = id ? findSkill(id) : undefined
  if (!found) return <NotFoundPanel what="skill" />
  // key: a new skill starts a fresh page
  return <Lesson key={found.skill.id} skill={found.skill} topic={found.topic} tab={tab} />
}

function Lesson({ skill, topic, tab }: { skill: Skill; topic: Topic; tab: Tab }) {
  const navigate = useNavigate()
  const { items } = useProgress()
  const p = items[skill.id]
  const k = topic.skills.indexOf(skill)
  const prev = topic.skills[k - 1]
  const next = topic.skills[k + 1]

  return (
    <div className="grid gap-6" style={{ ['--hue' as string]: topic.colour }}>
      <nav className="flex flex-wrap items-center gap-1 text-sm" aria-label="Breadcrumb">
        <Link to="/home" search={{ year: topic.year }} className="font-bold text-primary">
          Year {topic.year}
        </Link>
        <span className="text-muted-foreground">/</span>
        <Link to="/topic" search={{ id: topic.id }} className="font-bold text-primary">
          {topic.title}
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-muted-foreground">
          Skill {k + 1} of {topic.skills.length}
        </span>
      </nav>

      <header className="grid gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">{skill.title}</h1>
          <MasteryBadge state={masteryOf(p)} best={p?.best} />
        </div>
        <p className="text-muted-foreground">{skill.summary}</p>
        <div className="flex flex-wrap gap-2">
          {skill.outcomes.map((o) => (
            <span key={o} className="chip chip-code" title="NSW syllabus outcome">
              {o}
            </span>
          ))}
        </div>
      </header>

      <div className="tabs w-fit" role="tablist" aria-label="Lesson sections">
        <Link to="/lesson" search={{ id: skill.id, tab: 'learn' }} role="tab" aria-selected={tab === 'learn'} className={tab === 'learn' ? 'active' : ''} replace>
          Learn
        </Link>
        <Link to="/lesson" search={{ id: skill.id, tab: 'practice' }} role="tab" aria-selected={tab === 'practice'} className={tab === 'practice' ? 'active' : ''} replace>
          Practise
        </Link>
      </div>

      {tab === 'learn' ? (
        <Learn skill={skill} onPractise={() => void navigate({ to: '/lesson', search: { id: skill.id, tab: 'practice' } })} />
      ) : (
        <Practise skill={skill} topic={topic} next={next} best={p?.best} />
      )}

      <nav className="flex flex-wrap justify-between gap-2 border-t border-border pt-4" aria-label="Other skills">
        {prev ? (
          <Link to="/lesson" search={{ id: prev.id, tab: 'learn' }} className="btn btn-ghost">
            <ArrowLeft size={18} aria-hidden="true" /> {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to="/lesson" search={{ id: next.id, tab: 'learn' }} className="btn btn-ghost">
            {next.title} <ArrowRight size={18} aria-hidden="true" />
          </Link>
        ) : (
          <Link to="/test" search={{ id: topic.id }} className="btn btn-ghost">
            Topic test <ArrowRight size={18} aria-hidden="true" />
          </Link>
        )}
      </nav>
    </div>
  )
}

function Learn({ skill, onPractise }: { skill: Skill; onPractise: () => void }) {
  const { intro, keyPoints, vocab } = skill.learn
  const all = [intro, '<p>Key points.</p>', ...keyPoints].join(' ')
  return (
    <div className="grid gap-5">
      <section className="panel grid gap-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-2xl font-semibold">The idea</h2>
          <ReadAloud html={all} />
        </div>
        <MathHtml className="grid gap-3 text-lg" html={intro} />
        <div className="hint-box">
          <h3 className="font-display mb-2 text-lg font-semibold">Key points</h3>
          <ul className="grid list-disc gap-2 pl-5">
            {keyPoints.map((kp, i) => (
              <li key={i}>
                <MathHtml html={kp} />
              </li>
            ))}
          </ul>
        </div>
        {vocab && vocab.length > 0 && (
          <div>
            <h3 className="font-display mb-2 text-lg font-semibold">Words to know</h3>
            <dl className="grid gap-2 sm:grid-cols-[auto_1fr] sm:gap-x-4">
              {vocab.map(([term, meaning]) => (
                <div key={term} className="contents">
                  <dt className="font-bold">{term}</dt>
                  <dd className="text-muted-foreground max-sm:mb-2">
                    <MathHtml inline html={meaning} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </section>

      <WorkedExample skill={skill} />

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn btn-primary btn-lg" onClick={onPractise}>
          <PencilLine size={18} aria-hidden="true" /> I’m ready to practise
        </button>
        <span className="text-sm text-muted-foreground">Try a few worked examples at each level first if you’re unsure.</span>
      </div>
    </div>
  )
}

type Run = { id: number; levels: Level[]; saved: boolean }

function Practise({ skill, topic, next, best }: { skill: Skill; topic: Topic; next?: Skill; best?: number }) {
  const { student, teacher } = useSession()
  const [run, setRun] = useState<Run | null>(null)

  if (run) {
    return (
      <PracticeRunner
        key={run.id}
        skill={skill}
        levels={run.levels}
        itemId={run.saved ? skill.id : null}
        onExit={() => setRun(null)}
        onAgain={() => setRun({ ...run, id: run.id + 1 })}
        nextSkill={next}
        topicId={topic.id}
      />
    )
  }

  return (
    <div className="grid gap-5">
      <section className="q-card grid gap-4">
        <h2 className="font-display text-2xl font-semibold">Practice set</h2>
        <ul className="grid gap-1 text-muted-foreground">
          <li>10 questions that start easy and get harder.</li>
          <li>Two tries at each question. A hint appears after a wrong answer.</li>
          <li>Full marks on the first try, half a mark on the second.</li>
          <li>Score 80% or more to master this skill.</li>
        </ul>
        {best !== undefined && <p className="font-bold">Your best so far: {best}%</p>}
        {teacher && <p className="feedback info text-sm">Teacher preview: results are not saved.</p>}
        <button type="button" className="btn btn-primary btn-lg w-fit" onClick={() => setRun({ id: 1, levels: SET_LEVELS, saved: true })}>
          Start practice set
        </button>
        {!student && !teacher && <p className="text-sm text-muted-foreground">You’re a guest: results are saved on this device only.</p>}
      </section>

      <section className="panel grid gap-3 p-5">
        <h2 className="font-display text-xl font-semibold">Extra practice</h2>
        <p className="text-sm text-muted-foreground">{EXTRA_COUNT} questions at one level. Good for warming up or stretching yourself. Extra practice isn’t saved to your results.</p>
        <div className="flex flex-wrap gap-2">
          {([1, 2, 3] as Level[]).map((l) => (
            <button key={l} type="button" className="btn btn-ghost" onClick={() => setRun({ id: 1, levels: Array(EXTRA_COUNT).fill(l), saved: false })}>
              <span className={`level-pill level-${l}`}>{LEVEL_NAMES[l]}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
