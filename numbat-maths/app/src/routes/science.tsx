// Science: a sample of Year 7 chemistry. The lessons use the same lesson and practice pages as maths.
import { Link, createFileRoute } from '@tanstack/react-router'
import { BookOpen, FlaskConical, PencilLine } from 'lucide-react'
import { MasteryBadge } from '@/components/numbat/Mastery'
import { PageLoading, Shell } from '@/components/numbat/Shell'
import { SCIENCE_TOPICS } from '@/content'
import { masteryOf } from '@/lib/mastery'
import { pageHead } from '@/lib/meta'
import { useProgress } from '@/lib/progress'
import { useMounted } from '@/lib/use-mounted'

export const Route = createFileRoute('/science')({
  head: () => pageHead('/science'),
  component: SciencePage,
})

function SciencePage() {
  const mounted = useMounted()
  return <Shell>{mounted ? <ScienceView /> : <PageLoading />}</Shell>
}

function ScienceView() {
  const { items } = useProgress()
  const lessons = SCIENCE_TOPICS.reduce((n, t) => n + t.skills.length, 0)
  const mastered = SCIENCE_TOPICS.reduce((n, t) => n + t.skills.filter((s) => masteryOf(items[s.id]) === 'mastered').length, 0)
  return (
    <div className="grid gap-6">
      <header className="grid gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip">Year 7</span>
          <span className="chip">Stage 4</span>
          <span className="chip">Chemistry</span>
          <span className="chip">Sample</span>
        </div>
        <h1 className="flex items-center gap-2 font-display text-3xl font-semibold sm:text-4xl">
          <FlaskConical size={34} className="text-primary" aria-hidden="true" /> Science: Year 7 chemistry
        </h1>
        <p className="max-w-3xl text-muted-foreground">
          {lessons} lessons for the NSW Science 7–10 Syllabus (2023), Stage 4 chemistry: Solutions and mixtures, Periodic table and atomic structure, and
          chemical change. Each lesson has a short explanation with key points and vocabulary, worked examples, and a 10-question practice set at three
          levels (Foundation, Standard and Challenge).
        </p>
        <p className="text-sm font-bold">
          {mastered} of {lessons} lessons mastered
        </p>
      </header>
      {SCIENCE_TOPICS.map((t) => (
        <section key={t.id} className="grid gap-3" aria-labelledby={t.id} style={{ ['--hue' as string]: t.colour }}>
          <div className="topic-tile cursor-default hover:transform-none">
            <div className="flex flex-wrap items-center gap-2">
              {t.outcomes.map((o) => (
                <span key={o} className="chip chip-code" title="NSW syllabus outcome">
                  {o}
                </span>
              ))}
              <span className="chip">
                Lessons {t.skills[0].lessonNo}–{t.skills[t.skills.length - 1].lessonNo}
              </span>
            </div>
            <h2 id={t.id} className="font-display text-2xl font-semibold">
              <Link to="/topic" search={{ id: t.id }} className="hover:underline">
                {t.title}
              </Link>
            </h2>
            <p className="text-muted-foreground">{t.blurb}</p>
          </div>
          <ol className="grid gap-2">
            {t.skills.map((s) => {
              const p = items[s.id]
              return (
                <li key={s.id} className="panel grid gap-2 p-3 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div className="grid min-w-0 gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-lg font-semibold">
                        {s.lessonNo}. {s.title}
                      </span>
                      <MasteryBadge state={masteryOf(p)} best={p?.best} />
                    </div>
                    <p className="text-sm text-muted-foreground">{s.summary}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link to="/lesson" search={{ id: s.id, tab: 'learn' }} className="btn btn-ghost btn-sm">
                      <BookOpen size={16} aria-hidden="true" /> Learn
                    </Link>
                    <Link to="/lesson" search={{ id: s.id, tab: 'practice' }} className="btn btn-primary btn-sm">
                      <PencilLine size={16} aria-hidden="true" /> Practise
                    </Link>
                  </div>
                </li>
              )
            })}
          </ol>
        </section>
      ))}
    </div>
  )
}
