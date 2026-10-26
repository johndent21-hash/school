// One topic: its skills (learn + practise) and the topic test.
import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowLeft, BookOpen, ClipboardCheck, PencilLine } from 'lucide-react'
import { NotFoundPanel, PageLoading, Shell } from '@/components/numbat/Shell'
import { MasteryBadge } from '@/components/numbat/Mastery'
import { findTopic } from '@/content'
import { LEVEL_NAMES, type Level } from '@/lib/maths/types'
import { masteryOf } from '@/lib/mastery'
import { pageHead } from '@/lib/meta'
import { testItemId } from '@/lib/practice'
import { topicStats, useProgress } from '@/lib/progress'
import { useSession } from '@/lib/session'
import { useMounted } from '@/lib/use-mounted'

export const Route = createFileRoute('/topic')({
  validateSearch: (s: Record<string, unknown>): { id?: string } => ({ id: typeof s.id === 'string' ? s.id : undefined }),
  head: () => pageHead('/topic'),
  component: TopicPage,
})

function TopicPage() {
  const mounted = useMounted()
  const { ready } = useSession()
  return <Shell>{mounted && ready ? <TopicView /> : <PageLoading />}</Shell>
}

function TopicView() {
  const { id } = Route.useSearch()
  const topic = id ? findTopic(id) : undefined
  const { items } = useProgress()
  const { teacher } = useSession()
  if (!topic) return <NotFoundPanel what="topic" />
  const stats = topicStats(topic, items)
  const test = items[testItemId(topic.id)]

  return (
    <div className="grid gap-6" style={{ ['--hue' as string]: topic.colour }}>
      <Link to="/home" search={{ year: topic.year }} className="btn btn-ghost btn-sm w-fit">
        <ArrowLeft size={16} aria-hidden="true" /> Year {topic.year} topics
      </Link>

      <header className="topic-tile cursor-default hover:transform-none">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip">Year {topic.year}</span>
          <span className="chip">{topic.strand}</span>
          {topic.outcomes.map((o) => (
            <span key={o} className="chip chip-code" title="NSW syllabus outcome">
              {o}
            </span>
          ))}
        </div>
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">{topic.title}</h1>
        <p className="max-w-3xl text-muted-foreground">{topic.blurb}</p>
        <p className="text-sm font-bold">
          {stats.mastered} of {stats.total} skills mastered
        </p>
      </header>

      <section className="grid gap-3" aria-labelledby="skills">
        <h2 id="skills" className="font-display text-2xl font-semibold">
          Skills
        </h2>
        <ol className="grid gap-3">
          {topic.skills.map((s, k) => {
            const p = items[s.id]
            return (
              <li key={s.id} className="panel grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="grid gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-lg font-semibold">
                      {k + 1}. {s.title}
                    </span>
                    <MasteryBadge state={masteryOf(p)} best={p?.best} />
                  </div>
                  <p className="text-sm text-muted-foreground">{s.summary}</p>
                  {teacher && s.levels && (
                    <details className="text-sm">
                      <summary className="cursor-pointer font-bold text-primary">What each level covers (teachers)</summary>
                      <ul className="mt-1 grid gap-1">
                        {([1, 2, 3] as Level[]).map((l) =>
                          s.levels?.[l] ? (
                            <li key={l}>
                              <strong>{LEVEL_NAMES[l]}:</strong> {s.levels[l]}
                            </li>
                          ) : null,
                        )}
                      </ul>
                      <p className="mt-1 text-muted-foreground">Outcomes: {s.outcomes.join(', ')}</p>
                    </details>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link to="/lesson" search={{ id: s.id, tab: 'learn' }} className="btn btn-ghost">
                    <BookOpen size={18} aria-hidden="true" /> Learn
                  </Link>
                  <Link to="/lesson" search={{ id: s.id, tab: 'practice' }} className="btn btn-primary">
                    <PencilLine size={18} aria-hidden="true" /> Practise
                  </Link>
                </div>
              </li>
            )
          })}
        </ol>
      </section>

      <section className="panel grid gap-3 p-5 sm:grid-cols-[1fr_auto] sm:items-center" aria-labelledby="test">
        <div className="grid gap-1">
          <h2 id="test" className="font-display flex items-center gap-2 text-2xl font-semibold">
            <ClipboardCheck aria-hidden="true" /> Topic test
          </h2>
          <p className="text-muted-foreground">10 questions from across the topic, easy to hard. One try at each, then a full review with worked solutions.</p>
          {test ? (
            <p className="text-sm font-bold">
              Best {test.best}% · {test.attempts} attempt{test.attempts === 1 ? '' : 's'}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Tip: master most of the skills first.</p>
          )}
        </div>
        <Link to="/test" search={{ id: topic.id }} className="btn btn-primary btn-lg">
          Start test
        </Link>
      </section>
    </div>
  )
}
